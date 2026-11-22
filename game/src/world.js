// AURUM — the Starlight Museum floor. One continuous night across three
// wings: Entrance Hall, Portrait Gallery, Vault Wing. Coordinates are in
// world pixels on a 1280x720 floor so the whole plan reads in one frame.

export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
export const PLAY_TOP = 84; // HUD band
export const PLAY_BOTTOM = 700;

export const WINGS = [
  { id: "entrance", name: "ENTRANCE HALL", x: 24, w: 380 },
  { id: "gallery", name: "PORTRAIT GALLERY", x: 420, w: 430 },
  { id: "vault", name: "VAULT WING", x: 866, w: 390 },
];

// Solid rectangles: outer walls, wing dividers with door gaps, display
// cases and pedestals. They block movement and line of sight alike.
export function buildWalls() {
  const walls = [];
  const solid = (x, y, w, h, kind) => walls.push({ x, y, w, h, kind: kind || "wall" });
  // Outer frame
  solid(0, PLAY_TOP - 12, WORLD_WIDTH, 12);
  solid(0, PLAY_BOTTOM, WORLD_WIDTH, 20);
  solid(0, PLAY_TOP - 12, 12, PLAY_BOTTOM - PLAY_TOP + 32);
  solid(WORLD_WIDTH - 12, PLAY_TOP - 12, 12, PLAY_BOTTOM - PLAY_TOP + 32);
  // Wing dividers, each with two door gaps
  solid(404, PLAY_TOP, 16, 150); solid(404, 330, 16, 130); solid(404, 556, 16, 144);
  solid(850, PLAY_TOP, 16, 170); solid(850, 350, 16, 120); solid(850, 566, 16, 134);
  // Display cases (tall: block sight) and low plinths
  solid(90, 170, 90, 44, "case"); solid(230, 300, 100, 44, "case");
  solid(90, 470, 90, 44, "case"); solid(250, 520, 80, 40, "case");
  solid(500, 180, 96, 44, "case"); solid(660, 300, 100, 44, "case");
  solid(500, 470, 96, 44, "case"); solid(680, 520, 90, 40, "case");
  solid(930, 180, 90, 44, "case"); solid(1080, 300, 90, 44, "case");
  solid(940, 500, 84, 40, "case");
  // The Comet pedestal block in the vault heart
  solid(1030, 560, 120, 56, "pedestal");
  return walls;
}

export function buildTreasures() {
  // 9 treasures: 3 paintings, 2 jewel cases, 2 ingot stacks, the Star
  // Sapphire, and the Aurum Comet itself (required to win).
  return [
    { id: "painting-dawn", kind: "painting", name: "Painting: First Dawn", value: 400, x: 135, y: 150, taken: false },
    { id: "ingots-hall", kind: "ingots", name: "Gold Ingots (Hall)", value: 300, x: 280, y: 282, taken: false },
    { id: "jewels-hall", kind: "jewels", name: "Jewel Case: Winter Set", value: 350, x: 135, y: 452, taken: false },
    { id: "painting-river", kind: "painting", name: "Painting: Brass River", value: 450, x: 548, y: 162, taken: false },
    { id: "sapphire", kind: "sapphire", name: "The Star Sapphire", value: 800, x: 710, y: 282, taken: false },
    { id: "painting-night", kind: "painting", name: "Painting: Night Harbour", value: 500, x: 548, y: 452, taken: false },
    { id: "ingots-vault", kind: "ingots", name: "Gold Ingots (Vault)", value: 400, x: 1125, y: 282, taken: false },
    { id: "jewels-vault", kind: "jewels", name: "Jewel Case: Ember Set", value: 600, x: 982, y: 482, taken: false },
    { id: "comet", kind: "comet", name: "THE AURUM COMET", value: 2000, x: 1090, y: 545, taken: false, star: true },
  ];
}

export function buildGuardRoutes() {
  return [
    { name: "Guard Bram", route: [[70, 620], [70, 130], [350, 130], [350, 620]], speed: 52 },
    { name: "Guard Selin", route: [[470, 620], [800, 620], [800, 140], [470, 140]], speed: 58 },
    { name: "Guard Odo", route: [[900, 140], [1210, 140], [1210, 430], [900, 430]], speed: 55 },
    { name: "Guard Vera", route: [[430, 380], [830, 380]], speed: 74, lateEntry: true },
  ];
}

export function buildCameras() {
  return [
    { id: "cam-gallery", name: "Gallery Camera", x: 635, y: 96, baseAngle: Math.PI / 2, sweep: 0.85, range: 230 },
    { id: "cam-vault", name: "Vault Camera", x: 1060, y: 96, baseAngle: Math.PI / 2, sweep: 0.95, range: 240 },
    { id: "cam-hall", name: "Hall Camera", x: 214, y: 96, baseAngle: Math.PI / 2, sweep: 0.75, range: 210 },
  ];
}

export function buildLasers() {
  // Vault corridor beams, armed from alarm level 2.
  return [
    { id: "laser-a", x1: 866, y1: 470, x2: 1030, y2: 470 },
    { id: "laser-b", x1: 1150, y1: 470, x2: 1268, y2: 470 },
    { id: "laser-c", x1: 1090, y1: 470, x2: 1090, y2: 556 },
  ];
}

export function buildVents() {
  return [
    { id: "vent-hall-gallery", a: { x: 60, y: 660 }, b: { x: 460, y: 660 }, name: "Vent: Hall to Gallery" },
    { id: "vent-gallery-vault", a: { x: 810, y: 660 }, b: { x: 900, y: 660 }, name: "Vent: Gallery to Vault" },
  ];
}

export function buildShadowPools() {
  return [
    { x: 24, y: 560, w: 70, h: 120 }, { x: 760, y: 84, w: 80, h: 90 },
    { x: 420, y: 560, w: 70, h: 120 }, { x: 1180, y: 560, w: 76, h: 120 },
  ];
}

export function buildFusePanels() {
  return [
    { cameraId: "cam-gallery", x: 440, y: 110, name: "Gallery camera panel" },
    { cameraId: "cam-vault", x: 1220, y: 110, name: "Vault camera panel" },
    { cameraId: "cam-hall", x: 40, y: 110, name: "Hall camera panel" },
  ];
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function segmentBlockedByWalls(x1, y1, x2, y2, walls) {
  // Sampled line of sight: good enough at this scale and deterministic.
  const steps = 28;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    for (const w of walls) {
      if (w.kind === "wall" || w.kind === "case" || w.kind === "pedestal") {
        if (pointInRect(x, y, w)) return true;
      }
    }
  }
  return false;
}

export function moveWithCollision(entity, dx, dy, walls) {
  const r = entity.radius;
  let nx = entity.x + dx;
  if (!walls.some((w) => rectsOverlap({ x: nx - r, y: entity.y - r, w: r * 2, h: r * 2 }, w))) entity.x = nx;
  let ny = entity.y + dy;
  if (!walls.some((w) => rectsOverlap({ x: entity.x - r, y: ny - r, w: r * 2, h: r * 2 }, w))) entity.y = ny;
  entity.x = Math.max(20, Math.min(WORLD_WIDTH - 20, entity.x));
  entity.y = Math.max(PLAY_TOP + 16, Math.min(PLAY_BOTTOM - 16, entity.y));
}
