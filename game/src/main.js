// AURUM — The Clockwork Heist. Main loop and state machine.
// Case the Starlight Museum by day, mark your plan, then lift the Aurum
// Comet by night — while the Midnight Clock fills pip by pip whether you
// are seen or not, and every pip makes the museum meaner.

import { createSeededRandom, pickSeedFromUrl } from "./random.js";
import {
  buildWalls, buildTreasures, buildGuardRoutes, buildCameras, buildLasers,
  buildVents, buildShadowPools, buildFusePanels, pointInRect, moveWithCollision,
} from "./world.js";
import { MidnightClock } from "./clock.js";
import { Guard, SecurityCamera } from "./guards.js";
import { CasingPlan } from "./casing.js";
import { SynthAudio } from "./audio.js";
import { InputState } from "./input.js";
import {
  drawFloor, drawWatcherCones, drawActors, drawPatrolRoutes,
  drawClockHud, drawCasingOverlay, drawTitleScreen, drawTallyScreen,
} from "./render.js";
import { applyShotSetup } from "./shots.js";

const canvas = document.getElementById("aurum-canvas");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(location.search);
const seed = pickSeedFromUrl(location.search);
const shot = params.get("shot");

class HeistGame {
  constructor() {
    this.resetRun();
    this.input = new InputState(canvas);
    this.audio = new SynthAudio();
    this.latch = {};
    this.time = 0;
  }

  resetRun() {
    const rng = createSeededRandom(seed);
    this.walls = buildWalls();
    this.treasures = buildTreasures();
    this.shadowPools = buildShadowPools();
    this.lasers = buildLasers();
    this.vents = buildVents();
    this.fusePanels = buildFusePanels();
    this.guards = buildGuardRoutes().map((d, i) => new Guard(d, rng() * 2));
    this.cameras = buildCameras().map((d) => new SecurityCamera(d));
    this.plan = new CasingPlan();
    this.clock = new MidnightClock((level) => this.onAlarmLevel(level));
    this.thief = {
      x: 90, y: 380, radius: 12, coins: 3, carrying: [],
      sneaking: false, inShadow: false, crackTimer: 0, crackTarget: null,
    };
    this.mode = "title"; // title | casing | play | paused | busted | tally
    this.lootValue = 0;
    this.coinPings = [];
    this.laserTimer = 0;
    this.laserOn = true;
    this.twistFired = false;
    this.vanPatience = null;
    this.everWatched = false;
    this.objective = "Lift THE AURUM COMET from the Vault Wing";
    this.subObjective = "Side loot is optional — every treasure slows you 4%";
    this.scoreBreakdown = { timeBonus: 0, ghostBonus: 0, plannerBonus: 0, total: 0 };
    this.grade = "";
    this.endTitle = "";
    this.endSubtitle = "";
  }

  onAlarmLevel(level) {
    this.audio.playClockTick();
    if (level === 1) this.cameras.forEach((c) => { c.awake = true; });
    if (level === 3) {
      const vera = this.guards.find((g) => g.lateEntry && !g.active);
      if (vera) vera.enterMuseum();
    }
  }

  liftTheComet() {
    this.twistFired = true;
    this.clock.addPips(2, "comet");
    this.vanPatience = 90;
    this.objective = "THE COMET IS LIFTED — GET TO THE VAN";
    this.subObjective = "The pedestal cage closed the direct corridor — find another way back";
    // The laser cage seals the vault corridor gap the player came through.
    this.walls.push({ x: 850, y: 470, w: 16, h: 96, kind: "wall" });
  }

  finishRun(won) {
    const unspent = 10 - this.clock.pips;
    this.scoreBreakdown = {
      timeBonus: won ? unspent * 60 : 0,
      ghostBonus: won && !this.everWatched ? 500 : 0,
      plannerBonus: won && this.plan.allUsed ? 300 : 0,
      total: 0,
    };
    this.scoreBreakdown.total = this.lootValue + this.scoreBreakdown.timeBonus +
      this.scoreBreakdown.ghostBonus + this.scoreBreakdown.plannerBonus;
    const total = this.scoreBreakdown.total;
    this.grade = !won ? "BUSTED" : total >= 4200 ? "GHOST" : total >= 3200 ? "JEWEL THIEF" :
      total >= 2200 ? "CAT BURGLAR" : "SMASH-AND-GRAB";
    this.endTitle = won ? "CLEAN GETAWAY" : "BUSTED";
    this.endSubtitle = won
      ? `You reached the van with ${this.thief.carrying.length} treasure(s) as the clock stood at ${this.clock.pips}/10 pips.`
      : "The museum keeps its treasures tonight. The clock, as always, kept its pips.";
    if (this.mode !== "tally") this.mode = won ? "tally" : "busted";
    if (won) this.audio.playGetawayJingle(); else this.audio.playBustedBuzz();
  }

  spendMark(mark) {
    mark.used = true;
    if (mark.kind === "coin-cache") {
      this.thief.coins += 3;
      this.subObjective = "Coin Cache spent: +3 throw-coins";
    } else if (mark.kind === "blackout-fuse") {
      let nearest = null, best = 1e9;
      for (const c of this.cameras) {
        const d = Math.hypot(c.x - mark.x, c.y - mark.y);
        if (d < best) { best = d; nearest = c; }
      }
      if (nearest) { nearest.disabledTimer = 20; this.subObjective = `Blackout Fuse spent: ${nearest.name} dark for 20s`; }
    } else if (mark.kind === "rope-drop") {
      this.vents.push({ id: "vent-rope-drop", a: { x: mark.x, y: mark.y }, b: { x: 1090, y: 640 }, name: "Rope Drop vent" });
      this.subObjective = "Rope Drop spent: a new vent shortcut is open";
    }
  }

  updatePlay(dt) {
    const input = this.input;
    const thief = this.thief;
    thief.inShadow = this.shadowPools.some((s) => pointInRect(thief.x, thief.y, s));
    thief.sneaking = input.pressed("ShiftLeft") || input.pressed("ShiftRight");
    const move = input.movementVector();
    const weightSlow = 1 - thief.carrying.length * 0.04;
    const baseSpeed = thief.sneaking ? 78 : 148; // sneak is slow and quiet; running is fast and loud
    const speed = baseSpeed * weightSlow;
    if (move.moving) moveWithCollision(thief, move.x * speed * dt, move.y * speed * dt, this.walls);

    // Marks are spent by walking over them.
    for (const m of this.plan.marks) {
      if (!m.used && Math.hypot(m.x - thief.x, m.y - thief.y) < 20) this.spendMark(m);
    }
    // Vents: walk onto an end to travel.
    if (!this.ventCooldown || this.ventCooldown <= 0) {
      for (const v of this.vents) {
        for (const [from, to] of [[v.a, v.b], [v.b, v.a]]) {
          if (Math.hypot(from.x - thief.x, from.y - thief.y) < 16) {
            thief.x = to.x; thief.y = to.y;
            this.ventCooldown = 1.2;
            this.subObjective = `Through the vent: ${v.name}`;
          }
        }
      }
    } else this.ventCooldown -= dt;

    // Throw a coin toward the mouse: guards investigate the ping.
    if (input.consumePress("Space", this.latch) && thief.coins > 0) {
      thief.coins -= 1;
      const ping = { x: input.mouse.x, y: input.mouse.y, ttl: 1 };
      this.coinPings.push(ping);
      this.audio.playCoinPing();
      for (const g of this.guards) {
        if (g.active && g.state === "Patrol" && Math.hypot(g.x - ping.x, g.y - ping.y) < 260) {
          g.state = "Curious"; g.investigatePoint = { x: ping.x, y: ping.y };
        }
      }
    }
    for (const p of this.coinPings) p.ttl -= dt * 0.25;
    this.coinPings = this.coinPings.filter((p) => p.ttl > 0);

    // Interact: take treasure (the Comet case takes a noisy 3s crack),
    // or work a camera fuse panel (hold E, 2s).
    const nearTreasure = this.treasures.find((t) => !t.taken && Math.hypot(t.x - thief.x, t.y - thief.y) < 30);
    const nearPanel = this.fusePanels.find((p) => Math.hypot(p.x - thief.x, p.y - thief.y) < 30);
    if (input.pressed("KeyE") && nearTreasure) {
      if (nearTreasure.star) {
        thief.crackTimer += dt;
        this.subObjective = `Cracking the Comet case… ${Math.min(3, thief.crackTimer).toFixed(1)}s (noisy!)`;
        if (thief.crackTimer >= 3) {
          nearTreasure.taken = true;
          thief.carrying.push(nearTreasure);
          this.lootValue += nearTreasure.value;
          this.audio.playPickupChime();
          this.liftTheComet();
        }
      } else {
        nearTreasure.taken = true;
        thief.carrying.push(nearTreasure);
        this.lootValue += nearTreasure.value;
        this.audio.playPickupChime();
        this.subObjective = `Took ${nearTreasure.name} (+$${nearTreasure.value}) — you are slower now`;
      }
    } else if (input.pressed("KeyE") && nearPanel) {
      this.panelTimer = (this.panelTimer || 0) + dt;
      if (this.panelTimer >= 2) {
        const cam = this.cameras.find((c) => c.id === nearPanel.cameraId);
        if (cam) cam.disabledTimer = 20;
        this.panelTimer = 0;
        this.subObjective = "Camera panel worked: camera dark for 20s";
      }
    } else {
      thief.crackTimer = 0;
      this.panelTimer = 0;
    }

    // Lasers blink 2.4s on / 1.2s off once armed.
    this.laserTimer += dt;
    this.laserOn = (this.laserTimer % 3.6) < 2.4;
    if (this.clock.level >= 2 && this.laserOn && !this.laserCooldown) {
      for (const l of this.lasers) {
        const d = pointToSegmentDistance(thief.x, thief.y, l);
        if (d < 10) {
          this.clock.addPips(1, "laser");
          this.audio.playLaserKlaxon();
          this.laserCooldown = 2;
          this.subObjective = "Laser tripped: +1 pip on the Midnight Clock";
        }
      }
    }
    if (this.laserCooldown) { this.laserCooldown -= dt; if (this.laserCooldown < 0) this.laserCooldown = 0; }

    // The clock never stops.
    const pipsBefore = this.clock.pips;
    this.clock.tickMidnightClock(dt);
    if (this.clock.pips !== pipsBefore) this.audio.playClockTick();
    if (this.twistFired && this.vanPatience !== null) {
      this.vanPatience -= dt;
      if (this.vanPatience <= 0) { this.finishRun(false); return; }
    }
    if (this.clock.expired) { this.finishRun(false); return; }

    // Watchers
    const events = [];
    events.sprinting = move.moving && !thief.sneaking;
    for (const g of this.guards) g.updateGuard(dt, thief, this.walls, events);
    for (const c of this.cameras) c.updateCamera(dt, thief, this.walls, events);
    for (const ev of events) {
      if (ev.type === "spotted") {
        this.everWatched = true;
        this.clock.addPips(1, "spotted");
        this.audio.playDetectionSting();
      } else if (ev.type === "camera-spot") {
        this.clock.addPips(1, "camera");
        this.audio.playDetectionSting();
        this.subObjective = `${ev.camera.name} pinned your last position: +1 pip`;
      } else if (ev.type === "caught") {
        this.finishRun(false);
        return;
      }
    }

    // Exits: the van (needs the Comet), or the service hatch in lockdown
    // (escape without the Comet is a loss, but not a capture).
    const atVan = thief.x < 140 && thief.y > 100 && thief.y < 180;
    if (atVan && this.twistFired) { this.finishRun(true); return; }
    const atHatch = thief.x < 90 && thief.y > 630;
    if (atHatch && this.clock.level >= 5) { this.finishRun(this.twistFired); return; }
  }

  update(dt) {
    this.time += dt;
    const input = this.input;
    const click = input.takeClick();
    if (input.consumePress("KeyM", this.latch)) this.audio.muted = !this.audio.muted;
    if (this.mode === "title") {
      if (click) this.mode = "casing";
      return;
    }
    if (this.mode === "casing") {
      if (input.consumePress("Tab", this.latch)) this.plan.selectNextKind();
      if (click && click.y > 84) this.plan.placeMark(click.x, click.y);
      if (input.consumePress("Enter", this.latch) && this.plan.ready) {
        this.mode = "play";
        this.objective = "Lift THE AURUM COMET from the Vault Wing";
      }
      return;
    }
    if (this.mode === "play" || this.mode === "paused") {
      if (input.consumePress("KeyP", this.latch) || input.consumePress("Escape", this.latch)) {
        this.mode = this.mode === "play" ? "paused" : "play";
      }
      if (this.mode === "play") this.updatePlay(dt);
      return;
    }
    if ((this.mode === "tally" || this.mode === "busted") && input.consumePress("KeyR", this.latch)) {
      this.resetRun();
      this.mode = "casing";
    }
  }

  render() {
    const blueprint = this.mode === "casing";
    drawFloor(ctx, this, blueprint);
    if (blueprint) {
      drawPatrolRoutes(ctx, this);
      // Preview cones in casing too: the plan needs perfect information.
      drawWatcherCones(ctx, this);
    } else if (this.mode !== "title") {
      drawWatcherCones(ctx, this);
    }
    drawActors(ctx, this, blueprint);
    if (this.mode !== "title") drawClockHud(ctx, this);
    if (blueprint) drawCasingOverlay(ctx, this);
    if (this.mode === "title") drawTitleScreen(ctx, this);
    if (this.mode === "paused") {
      ctx.fillStyle = "rgba(8,10,22,0.7)"; ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = "#fff"; ctx.font = "bold 36px Georgia, serif"; ctx.textAlign = "center";
      ctx.fillText("PAUSED — P to resume", 640, 360);
    }
    if (this.mode === "tally") drawTallyScreen(ctx, this, this.endTitle || "CLEAN GETAWAY", this.endSubtitle);
    if (this.mode === "busted") drawTallyScreen(ctx, this, "BUSTED", this.endSubtitle);
  }
}

export function pointToSegmentDistance(px, py, seg) {
  const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - seg.x1) * dx + (py - seg.y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (seg.x1 + t * dx), py - (seg.y1 + t * dy));
}

const game = new HeistGame();
if (shot) applyShotSetup(game, shot);
window.__aurum = game;

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shot) game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
