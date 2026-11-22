// AURUM — seeded randomness. Every run of the museum is reproducible:
// the same seed lays out the same patrol phases, laser offsets and sparkle
// twinkles, which is what makes the deterministic screenshot hooks honest.

export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickSeedFromUrl(search) {
  const params = new URLSearchParams(search || "");
  const raw = Number(params.get("seed"));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 7;
}
