// AURUM — Casing & Marks, the Plan made playable. By day the player
// studies the whole floor: patrol routes drawn as dotted gold lines,
// camera arcs sweeping, laser timings blinking. They place exactly 3
// marks from a small kit, then press NIGHTFALL and rob the floor they
// just planned. A mark is spent by walking over it at night.

export const MARK_KIT = [
  { kind: "coin-cache", name: "Coin Cache", desc: "+3 throw-coins where placed" },
  { kind: "blackout-fuse", name: "Blackout Fuse", desc: "Kills the nearest camera for 20s" },
  { kind: "rope-drop", name: "Rope Drop", desc: "Opens a vent shortcut where placed" },
];

export const MARKS_ALLOWED = 3;

export class CasingPlan {
  constructor() {
    this.marks = [];
    this.selectedKind = MARK_KIT[0].kind;
  }

  placeMark(x, y) {
    if (this.marks.length >= MARKS_ALLOWED) return false;
    const existing = this.marks.findIndex((m) => m.kind === this.selectedKind);
    if (existing >= 0) this.marks.splice(existing, 1); // one of each kind; re-place moves it
    this.marks.push({ kind: this.selectedKind, x, y, used: false });
    const next = MARK_KIT.find((k) => !this.marks.some((m) => m.kind === k.kind));
    if (next) this.selectedKind = next.kind;
    return true;
  }

  selectNextKind() {
    const idx = MARK_KIT.findIndex((k) => k.kind === this.selectedKind);
    this.selectedKind = MARK_KIT[(idx + 1) % MARK_KIT.length].kind;
  }

  get ready() {
    return this.marks.length >= 1;
  }

  get allUsed() {
    return this.marks.length === MARKS_ALLOWED && this.marks.every((m) => m.used);
  }
}
