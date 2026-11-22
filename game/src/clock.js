// AURUM — the Midnight Clock, the signature mechanic. Ten brass pips.
// One pip fills every 18 seconds ON ITS OWN and never comes back; being
// detected can add pips, hiding can only cool the detection gain. Every
// pip makes the museum meaner, in five named, announced levels.

export const PIPS_TOTAL = 10;
export const SECONDS_PER_PIP = 18;

export const ALARM_LEVELS = [
  { level: 0, name: "CLOSING TIME", effect: "Baseline patrols. Cameras asleep." },
  { level: 1, name: "SHUTTERS WAKE", effect: "Cameras power on and start sweeping." },
  { level: 2, name: "LASERS ARM", effect: "Vault corridor lasers start blinking." },
  { level: 3, name: "SECOND WATCH", effect: "A fourth guard enters from the staff door." },
  { level: 4, name: "LAST CHIME", effect: "The vault reseals in 60 seconds." },
  { level: 5, name: "LOCKDOWN", effect: "Exits seal except the service hatch. 20 seconds." },
];

export function alarmLevelForPips(pips) {
  if (pips >= 10) return 5;
  if (pips >= 8) return 4;
  if (pips >= 6) return 3;
  if (pips >= 4) return 2;
  if (pips >= 2) return 1;
  return 0;
}

export class MidnightClock {
  constructor(onLevelUp) {
    this.pips = 0;
    this.elapsed = 0;
    this.level = 0;
    this.announcement = "";
    this.announcementTimer = 0;
    this.vaultResealTimer = null;
    this.lockdownTimer = null;
    this.onLevelUp = onLevelUp || (() => {});
  }

  addPips(count, reason) {
    const before = this.pips;
    this.pips = Math.min(PIPS_TOTAL, this.pips + count);
    if (this.pips !== before) this.syncLevel(reason);
  }

  syncLevel(reason) {
    const next = alarmLevelForPips(this.pips);
    if (next > this.level) {
      this.level = next;
      const info = ALARM_LEVELS[next];
      this.announcement = `LEVEL ${next} — ${info.name}: ${info.effect}`;
      this.announcementTimer = 4;
      if (next === 4) this.vaultResealTimer = 60;
      if (next === 5) this.lockdownTimer = 20;
      this.onLevelUp(next, reason || "clock");
    }
  }

  tickMidnightClock(dt) {
    this.elapsed += dt;
    const due = Math.floor(this.elapsed / SECONDS_PER_PIP);
    if (due > this.pips) this.addPips(due - this.pips, "time");
    if (this.announcementTimer > 0) this.announcementTimer -= dt;
    if (this.vaultResealTimer !== null && this.vaultResealTimer > 0) this.vaultResealTimer -= dt;
    if (this.lockdownTimer !== null && this.lockdownTimer > 0) this.lockdownTimer -= dt;
  }

  get expired() {
    return (this.lockdownTimer !== null && this.lockdownTimer <= 0) ||
      (this.vaultResealTimer !== null && this.vaultResealTimer <= 0 && this.level >= 5);
  }
}
