// AURUM — guards and cameras with graded detection. The outer cone ring
// is NOTICED (slow fill, the watcher investigates, "?"); the inner core is
// WATCHED (fast fill, full means "!", chase, and the clock gains a pip).
// Line of sight is blocked by walls and tall cases, so failure always
// feels like the player's own fault.

import { segmentBlockedByWalls, moveWithCollision } from "./world.js";

export const CONE_RANGE = 190;
export const CONE_HALF_ANGLE = 0.62;

function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function detectionZone(watcher, target, walls) {
  const dx = target.x - watcher.x;
  const dy = target.y - watcher.y;
  const dist = Math.hypot(dx, dy);
  if (dist > (watcher.range || CONE_RANGE)) return null;
  const ang = Math.atan2(dy, dx);
  const diff = Math.abs(angleDifference(ang, watcher.angle));
  const half = watcher.halfAngle || CONE_HALF_ANGLE;
  if (diff > half) return null;
  if (segmentBlockedByWalls(watcher.x, watcher.y, target.x, target.y, walls)) return null;
  return diff < half * 0.45 && dist < (watcher.range || CONE_RANGE) * 0.8 ? "watched" : "noticed";
}

export class Guard {
  constructor(def, phase) {
    this.name = def.name;
    this.route = def.route;
    this.speed = def.speed;
    this.lateEntry = !!def.lateEntry;
    this.active = !this.lateEntry;
    this.x = def.route[0][0];
    this.y = def.route[0][1];
    this.radius = 13;
    this.angle = 0;
    this.range = CONE_RANGE;
    this.halfAngle = CONE_HALF_ANGLE;
    this.waypoint = 1 % def.route.length;
    this.pauseTimer = phase || 0;
    this.state = "Patrol"; // Patrol | Curious | Chase | Return
    this.noticed = 0;
    this.watched = 0;
    this.investigatePoint = null;
    this.sweepPhase = phase || 0;
  }

  enterMuseum() {
    this.active = true;
    this.x = this.route[0][0];
    this.y = this.route[0][1];
  }

  updateGuard(dt, thief, walls, events) {
    if (!this.active) return;
    this.sweepPhase += dt;
    const zone = detectionZone(this, thief, walls);
    const calmFactor = thief.inShadow ? 0.5 : 1;
    const sneakFactor = thief.sneaking ? 0.6 : 1;
    if (zone === "noticed") this.noticed = Math.min(1, this.noticed + dt * 0.55 * calmFactor * sneakFactor);
    else this.noticed = Math.max(0, this.noticed - dt * 0.25);
    if (zone === "watched") this.watched = Math.min(1, this.watched + dt * 0.9 * calmFactor * sneakFactor);
    else this.watched = Math.max(0, this.watched - dt * 0.3);

    if (this.watched >= 1 && this.state !== "Chase") {
      this.state = "Chase";
      events.push({ type: "spotted", guard: this });
    } else if (this.noticed >= 1 && this.state === "Patrol") {
      this.state = "Curious";
      this.investigatePoint = { x: thief.x, y: thief.y };
      events.push({ type: "curious", guard: this });
    }

    let target = null;
    let speed = this.speed;
    if (this.state === "Chase") {
      target = { x: thief.x, y: thief.y };
      speed = this.speed * (events.sprinting ? 1.75 : 1.55);
      if (this.watched <= 0.05 && !zone) { this.state = "Return"; }
      if (Math.hypot(thief.x - this.x, thief.y - this.y) < 24) events.push({ type: "caught", guard: this });
    } else if (this.state === "Curious" && this.investigatePoint) {
      target = this.investigatePoint;
      speed = this.speed * 1.15;
      if (Math.hypot(target.x - this.x, target.y - this.y) < 14) { this.state = "Return"; this.noticed = 0.4; }
    } else if (this.state === "Return") {
      target = { x: this.route[this.waypoint][0], y: this.route[this.waypoint][1] };
      if (Math.hypot(target.x - this.x, target.y - this.y) < 12) this.state = "Patrol";
    } else {
      if (this.pauseTimer > 0) {
        this.pauseTimer -= dt;
        this.angle += Math.sin(this.sweepPhase * 1.4) * dt * 0.7; // head-turn sweep
        return;
      }
      target = { x: this.route[this.waypoint][0], y: this.route[this.waypoint][1] };
      if (Math.hypot(target.x - this.x, target.y - this.y) < 10) {
        this.waypoint = (this.waypoint + 1) % this.route.length;
        this.pauseTimer = 1.6;
        return;
      }
    }
    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.angle = Math.atan2(dy, dx);
      moveWithCollision(this, (dx / dist) * speed * dt, (dy / dist) * speed * dt, walls);
    }
  }
}

export class SecurityCamera {
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.x = def.x;
    this.y = def.y;
    this.baseAngle = def.baseAngle;
    this.sweep = def.sweep;
    this.range = def.range;
    this.halfAngle = 0.5;
    this.angle = def.baseAngle;
    this.phase = def.x * 0.01;
    this.fill = 0;
    this.disabledTimer = 0;
    this.awake = false;
  }

  updateCamera(dt, thief, walls, events) {
    if (!this.awake) return;
    this.phase += dt * 0.55;
    this.angle = this.baseAngle + Math.sin(this.phase) * this.sweep;
    if (this.disabledTimer > 0) { this.disabledTimer -= dt; this.fill = 0; return; }
    const zone = detectionZone(this, thief, walls);
    if (zone) {
      this.fill = Math.min(1, this.fill + dt * (zone === "watched" ? 0.8 : 0.45) * (thief.inShadow ? 0.5 : 1));
      if (this.fill >= 1) {
        this.fill = 0;
        events.push({ type: "camera-spot", camera: this, x: thief.x, y: thief.y });
      }
    } else {
      this.fill = Math.max(0, this.fill - dt * 0.3);
    }
  }
}
