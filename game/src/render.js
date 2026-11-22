// AURUM — rendering. Noir museum at midnight by night (deep navy, warm
// gold, marble checker), flat daylight blueprint by day in casing mode.
// Readability at thumbnail size is a hard rule: cones are large and
// translucent, the thief is a gold-hooded silhouette with a white
// outline, the Comet sparkles, lasers are bright red, and the Midnight
// Clock is a chunky brass bar whose level is named in words.

import { WINGS, WORLD_WIDTH, PLAY_TOP } from "./world.js";
import { PIPS_TOTAL, ALARM_LEVELS } from "./clock.js";
import { MARK_KIT } from "./casing.js";

const NAVY = "#141b2e";
const GOLD = "#e8b64c";

function drawCone(ctx, watcher, colour) {
  const range = watcher.range;
  const half = watcher.halfAngle;
  ctx.beginPath();
  ctx.moveTo(watcher.x, watcher.y);
  ctx.arc(watcher.x, watcher.y, range, watcher.angle - half, watcher.angle + half);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

export function coneColourFor(state, fill) {
  if (state === "Chase") return "rgba(232,64,64,0.34)";
  if (fill > 0.05) return "rgba(240,164,60,0.32)";
  return "rgba(245,225,160,0.20)";
}

export function drawFloor(ctx, game, blueprint) {
  const { walls, treasures, shadowPools } = game;
  ctx.fillStyle = blueprint ? "#e9e2cf" : NAVY;
  ctx.fillRect(0, 0, WORLD_WIDTH, 720);
  // Marble checker (night) / graph paper (day)
  const tile = 40;
  for (let x = 0; x < WORLD_WIDTH / tile; x++) {
    for (let y = 0; y < 16; y++) {
      const yy = PLAY_TOP + y * tile;
      if (yy > 700) continue;
      if ((x + y) % 2 === 0) {
        ctx.fillStyle = blueprint ? "rgba(90,110,150,0.07)" : "rgba(220,225,240,0.045)";
        ctx.fillRect(12 + x * tile, yy, tile, tile);
      }
    }
  }
  // Wing labels and dividers
  ctx.font = "bold 15px Georgia, serif";
  ctx.textAlign = "center";
  for (const wing of WINGS) {
    ctx.fillStyle = blueprint ? "#5a6c96" : "rgba(232,182,76,0.55)";
    ctx.fillText(wing.name, wing.x + wing.w / 2, PLAY_TOP + 22);
  }
  // Shadow pools
  for (const s of shadowPools) {
    ctx.fillStyle = blueprint ? "rgba(90,110,150,0.12)" : "rgba(0,0,0,0.38)";
    ctx.fillRect(s.x, s.y, s.w, s.h);
  }
  // Walls and cases
  for (const w of walls) {
    if (w.kind === "case") {
      ctx.fillStyle = blueprint ? "#cbbf9d" : "#2c3a5e";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = blueprint ? "#5a6c96" : GOLD;
      ctx.lineWidth = 2; ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = blueprint ? "transparent" : "rgba(255,235,180,0.25)";
      ctx.fillRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16);
    } else if (w.kind === "pedestal") {
      ctx.fillStyle = blueprint ? "#b7a77f" : "#3a2c14";
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(w.x, w.y, w.w, w.h);
    } else {
      ctx.fillStyle = blueprint ? "#8b9bbd" : "#0b1020";
      ctx.fillRect(w.x, w.y, w.w, w.h);
    }
  }
  // Treasures
  for (const t of treasures) {
    if (t.taken) continue;
    drawTreasure(ctx, t, blueprint, game.time);
  }
  // Getaway van at the entrance (headlights after the twist)
  drawVan(ctx, game, blueprint);
  // Service hatch (lockdown exit)
  ctx.fillStyle = blueprint ? "#5a6c96" : "#4c6b4f";
  ctx.fillRect(28, 640, 52, 44);
  ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif";
  ctx.fillText("HATCH", 54, 666);
}

export function drawTreasure(ctx, t, blueprint, time) {
  ctx.save();
  ctx.translate(t.x, t.y);
  if (t.kind === "painting") {
    ctx.fillStyle = "#7a5a22"; ctx.fillRect(-17, -13, 34, 26);
    ctx.fillStyle = blueprint ? "#a8c0e8" : "#7fa8c9"; ctx.fillRect(-13, -9, 26, 18);
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
  } else if (t.kind === "ingots") {
    ctx.fillStyle = GOLD;
    ctx.fillRect(-14, 2, 12, 7); ctx.fillRect(2, 2, 12, 7); ctx.fillRect(-6, -7, 12, 7);
  } else if (t.kind === "jewels") {
    ctx.fillStyle = "#5e2c4e"; ctx.fillRect(-14, -10, 28, 20);
    ctx.strokeStyle = GOLD; ctx.strokeRect(-14, -10, 28, 20);
    ctx.fillStyle = "#ff7fa8"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
  } else if (t.kind === "sapphire") {
    ctx.fillStyle = "#3b6fe0"; ctx.beginPath();
    ctx.moveTo(0, -13); ctx.lineTo(10, 0); ctx.lineTo(0, 13); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#cfe2ff"; ctx.stroke();
  } else if (t.kind === "comet") {
    const pulse = 1 + Math.sin(time * 3) * 0.12;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#ffd977"; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff3c4"; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + time * 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16);
      ctx.lineTo(Math.cos(a) * 23, Math.sin(a) * 23);
      ctx.stroke();
    }
    ctx.fillStyle = "#7a4d00"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("COMET", 0, 34);
  }
  ctx.restore();
}

function drawVan(ctx, game, blueprint) {
  const x = 52, y = 120;
  ctx.fillStyle = blueprint ? "#5a6c96" : "#d8dce8";
  ctx.fillRect(x, y, 74, 40);
  ctx.fillStyle = blueprint ? "#e9e2cf" : "#26314f";
  ctx.fillRect(x + 50, y + 7, 18, 12); ctx.fillRect(x + 8, y + 7, 16, 12);
  ctx.fillStyle = "#111"; ctx.beginPath();
  ctx.arc(x + 16, y + 42, 7, 0, 7); ctx.arc(x + 58, y + 42, 7, 0, 7); ctx.fill();
  ctx.fillStyle = blueprint ? "#333" : GOLD; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("GETAWAY VAN", x + 37, y - 6);
  if (game.twistFired) {
    ctx.fillStyle = "rgba(255,240,170,0.55)";
    ctx.beginPath(); ctx.moveTo(x + 74, y + 8); ctx.lineTo(x + 150, y - 10); ctx.lineTo(x + 150, y + 38); ctx.lineTo(x + 74, y + 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff6c9"; ctx.font = "bold 11px sans-serif";
    ctx.fillText("HEADLIGHTS ON — VAN WAITING", x + 112, y + 58);
  }
}

export function drawWatcherCones(ctx, game) {
  for (const g of game.guards) {
    if (!g.active) continue;
    drawCone(ctx, g, coneColourFor(g.state, Math.max(g.noticed, g.watched)));
  }
  for (const c of game.cameras) {
    if (!c.awake || c.disabledTimer > 0) continue;
    drawCone(ctx, c, coneColourFor(c.fill > 0.4 ? "Curious" : "Patrol", c.fill));
  }
}

export function drawActors(ctx, game, blueprint) {
  // Lasers
  if (game.clock.level >= 2) {
    for (const l of game.lasers) {
      if (!game.laserOn) continue;
      ctx.strokeStyle = "#ff2d3f"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
    }
  }
  // Vents
  for (const v of game.vents) {
    for (const end of [v.a, v.b]) {
      ctx.fillStyle = blueprint ? "#5a6c96" : "#54627f";
      ctx.fillRect(end.x - 13, end.y - 10, 26, 20);
      ctx.fillStyle = "#dfe6f2"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("VENT", end.x, end.y + 3);
    }
  }
  // Marks
  for (const m of game.plan.marks) {
    ctx.save(); ctx.translate(m.x, m.y);
    ctx.globalAlpha = m.used ? 0.3 : 1;
    ctx.fillStyle = m.kind === "coin-cache" ? GOLD : m.kind === "blackout-fuse" ? "#7fd4ff" : "#9fe870";
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
    ctx.fillStyle = "#141b2e"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(m.kind === "coin-cache" ? "$" : m.kind === "blackout-fuse" ? "F" : "R", 0, 4);
    ctx.restore();
  }
  // Coin pings
  for (const p of game.coinPings) {
    ctx.strokeStyle = `rgba(232,182,76,${Math.max(0, p.ttl)})`;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 26 - p.ttl * 14, 0, 7); ctx.stroke();
  }
  // Cameras
  for (const c of game.cameras) {
    ctx.fillStyle = c.disabledTimer > 0 ? "#666" : "#c33";
    ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("CAM", c.x, c.y - 13);
    if (c.fill > 0.05) { ctx.fillStyle = "#ffb03a"; ctx.fillRect(c.x - 12, c.y + 13, 24 * c.fill, 4); }
  }
  // Guards
  for (const g of game.guards) {
    if (!g.active) continue;
    ctx.fillStyle = blueprint ? "#34507e" : "#8e2f35";
    ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, 7); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#ffd9a0";
    ctx.beginPath(); ctx.arc(g.x + Math.cos(g.angle) * 6, g.y + Math.sin(g.angle) * 6, 5, 0, 7); ctx.fill();
    const mark = g.state === "Chase" ? "!" : g.state === "Curious" ? "?" : "";
    if (mark) {
      ctx.fillStyle = g.state === "Chase" ? "#ff4040" : "#ffb03a";
      ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(mark, g.x, g.y - 20);
    }
    const fill = Math.max(g.noticed, g.watched);
    if (fill > 0.03 && g.state !== "Chase") {
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(g.x - 14, g.y + 16, 28, 5);
      ctx.fillStyle = g.watched > g.noticed ? "#ff4040" : "#ffb03a";
      ctx.fillRect(g.x - 14, g.y + 16, 28 * fill, 5);
    }
    ctx.fillStyle = blueprint ? "#34507e" : "#e8dcc0"; ctx.font = "10px sans-serif";
    ctx.fillText(g.name, g.x, g.y + 32);
  }
  // Thief: gold-hooded silhouette, white outline
  const t = game.thief;
  ctx.fillStyle = blueprint ? "#222" : GOLD;
  ctx.beginPath(); ctx.arc(t.x, t.y, 12, 0, 7); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "#141b2e"; ctx.beginPath(); ctx.arc(t.x, t.y - 3, 6, 0, 7); ctx.fill();
  if (t.carrying.length) {
    ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`carrying ${t.carrying.length}`, t.x, t.y - 20);
  }
}

export function drawPatrolRoutes(ctx, game) {
  ctx.strokeStyle = "rgba(190,140,20,0.85)";
  ctx.lineWidth = 2; ctx.setLineDash([4, 7]);
  for (const g of game.guards) {
    ctx.beginPath();
    g.route.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath(); ctx.stroke();
    for (const [x, y] of g.route) { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fillStyle = "#be8c14"; ctx.fill(); }
  }
  ctx.setLineDash([]);
}

export function drawClockHud(ctx, game) {
  const clock = game.clock;
  // Loot and objective
  ctx.fillStyle = "#0b1020"; ctx.fillRect(0, 0, WORLD_WIDTH, PLAY_TOP - 12);
  ctx.fillStyle = GOLD; ctx.font = "bold 20px Georgia, serif"; ctx.textAlign = "left";
  ctx.fillText(`LOOT $${game.lootValue}`, 18, 32);
  ctx.fillStyle = "#cfe0ff"; ctx.font = "14px sans-serif";
  ctx.fillText(`Treasures ${game.treasures.filter((t) => t.taken).length}/9 · Coins ${game.thief.coins}`, 18, 56);
  ctx.textAlign = "right"; ctx.fillStyle = "#fff"; ctx.font = "bold 15px sans-serif";
  ctx.fillText(game.objective, WORLD_WIDTH - 18, 32);
  ctx.fillStyle = "#9fb4dd"; ctx.font = "13px sans-serif";
  ctx.fillText(game.subObjective || "", WORLD_WIDTH - 18, 56);
  // The Midnight Clock: chunky brass pips, level named in words
  const pipW = 30, gap = 6, totalW = PIPS_TOTAL * (pipW + gap) - gap;
  const x0 = (WORLD_WIDTH - totalW) / 2;
  ctx.fillStyle = "#e8b64c"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("— THE MIDNIGHT CLOCK —", WORLD_WIDTH / 2, 18);
  for (let i = 0; i < PIPS_TOTAL; i++) {
    ctx.fillStyle = i < clock.pips ? "#e8543f" : "#3a2c14";
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    const px = x0 + i * (pipW + gap);
    ctx.fillRect(px, 24, pipW, 18); ctx.strokeRect(px, 24, pipW, 18);
  }
  const info = ALARM_LEVELS[clock.level];
  ctx.fillStyle = "#ffd977"; ctx.font = "bold 14px sans-serif";
  ctx.fillText(`LEVEL ${clock.level} — ${info.name}`, WORLD_WIDTH / 2, 60);
  if (clock.announcementTimer > 0 && clock.announcement) {
    ctx.fillStyle = "rgba(11,16,32,0.88)"; ctx.fillRect(290, 76, 700, 30);
    ctx.fillStyle = "#ffd977"; ctx.font = "bold 14px sans-serif";
    ctx.fillText(clock.announcement, WORLD_WIDTH / 2, 97);
  }
}

export function drawCasingOverlay(ctx, game) {
  ctx.fillStyle = "rgba(233,226,207,0.25)"; ctx.fillRect(0, PLAY_TOP, WORLD_WIDTH, 720 - PLAY_TOP);
  // A clean paper band behind the title so wing labels never fight it.
  ctx.fillStyle = "rgba(233,226,207,0.92)"; ctx.fillRect(150, 108, 980, 62);
  ctx.strokeStyle = "#5a6c96"; ctx.lineWidth = 2; ctx.strokeRect(150, 108, 980, 62);
  ctx.fillStyle = "#22355e"; ctx.font = "bold 30px Georgia, serif"; ctx.textAlign = "center";
  ctx.fillText("AURUM — CASING THE STARLIGHT MUSEUM", WORLD_WIDTH / 2, 136);
  ctx.font = "16px sans-serif";
  ctx.fillText("Case the museum by day, mark your plan, then lift the Aurum Comet by night.", WORLD_WIDTH / 2, 162);
  const plan = game.plan;
  ctx.font = "bold 15px sans-serif";
  ctx.fillText(`Marks placed: ${plan.marks.length}/3 — click the floor to place the selected mark · Tab cycles the kit · Enter starts NIGHTFALL`, WORLD_WIDTH / 2, 676);
  ctx.font = "14px sans-serif"; ctx.textAlign = "left";
  MARK_KIT.forEach((k, i) => {
    const label = `${plan.selectedKind === k.kind ? "▶" : " "} ${k.name}: ${k.desc}`;
    ctx.fillStyle = plan.selectedKind === k.kind ? "#8a5a00" : "#41506e";
    ctx.fillText(label, 40 + i * 400, 652);
  });
}

export function drawTitleScreen(ctx, game) {
  drawFloor(ctx, game, false);
  ctx.fillStyle = "rgba(8,10,22,0.78)"; ctx.fillRect(0, 0, WORLD_WIDTH, 720);
  ctx.fillStyle = GOLD; ctx.font = "bold 84px Georgia, serif"; ctx.textAlign = "center";
  ctx.fillText("A U R U M", WORLD_WIDTH / 2, 250);
  ctx.fillStyle = "#ffd977"; ctx.font = "bold 26px Georgia, serif";
  ctx.fillText("THE CLOCKWORK HEIST", WORLD_WIDTH / 2, 295);
  ctx.fillStyle = "#e8ecf8"; ctx.font = "18px sans-serif";
  ctx.fillText("Case the Starlight Museum by day, mark your plan, then lift the Aurum Comet by night —", WORLD_WIDTH / 2, 350);
  ctx.fillText("while one brass alarm clock fills pip by pip whether you are seen or not.", WORLD_WIDTH / 2, 378);
  ctx.font = "16px sans-serif"; ctx.fillStyle = "#9fb4dd";
  ctx.fillText("WASD move · Shift sneak · Space throw coin · E take / use · Tab cycle mark kit", WORLD_WIDTH / 2, 440);
  ctx.fillText("Click to case the museum — place 3 marks, then press Enter for NIGHTFALL", WORLD_WIDTH / 2, 470);
  ctx.fillStyle = GOLD; ctx.font = "bold 20px sans-serif";
  ctx.fillText("CLICK TO BEGIN CASING", WORLD_WIDTH / 2, 540);
}

export function drawTallyScreen(ctx, game, title, subtitle) {
  drawFloor(ctx, game, false);
  drawVan(ctx, game, false);
  ctx.fillStyle = "rgba(8,10,22,0.82)"; ctx.fillRect(240, 90, 800, 540);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(240, 90, 800, 540);
  ctx.fillStyle = GOLD; ctx.font = "bold 34px Georgia, serif"; ctx.textAlign = "center";
  ctx.fillText(title, WORLD_WIDTH / 2, 145);
  ctx.fillStyle = "#e8ecf8"; ctx.font = "17px sans-serif";
  ctx.fillText(subtitle, WORLD_WIDTH / 2, 178);
  ctx.textAlign = "left"; ctx.font = "15px sans-serif";
  let y = 220;
  for (const t of game.treasures) {
    ctx.fillStyle = t.taken ? "#ffd977" : "#5c6a8a";
    ctx.fillText(`${t.taken ? "✓" : "— left —"}  ${t.name}`, 300, y);
    ctx.textAlign = "right";
    ctx.fillText(t.taken ? `$${t.value}` : `$${t.value}`, 980, y);
    ctx.textAlign = "left";
    y += 26;
  }
  y += 10;
  ctx.fillStyle = "#fff";
  ctx.fillText(`Loot value $${game.lootValue} · Time bonus $${game.scoreBreakdown.timeBonus} · Ghost $${game.scoreBreakdown.ghostBonus} · Planner $${game.scoreBreakdown.plannerBonus}`, 300, y);
  y += 32;
  ctx.font = "bold 22px sans-serif"; ctx.fillStyle = GOLD;
  ctx.fillText(`TOTAL $${game.scoreBreakdown.total}`, 300, y);
  ctx.save();
  ctx.translate(880, y - 8); ctx.rotate(-0.12);
  ctx.strokeStyle = "#e8543f"; ctx.lineWidth = 3; ctx.strokeRect(-95, -24, 190, 44);
  ctx.fillStyle = "#e8543f"; ctx.font = "bold 22px Georgia, serif"; ctx.textAlign = "center";
  ctx.fillText(game.grade, 0, 7);
  ctx.restore();
  ctx.fillStyle = "#9fb4dd"; ctx.font = "15px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("Press R for one more night", WORLD_WIDTH / 2, 600);
}
