// AURUM — keyboard and mouse input. WASD/arrows move, Shift sneaks,
// Space throws a coin toward the mouse, E interacts, R restarts, M mutes,
// P or Esc pauses. In casing mode the mouse places marks.

export class InputState {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 };
    this.canvas = canvas;
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    });
    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.clicked = true;
      this.mouse.clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      this.mouse.clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    });
  }

  takeClick() {
    if (!this.mouse.clicked) return null;
    this.mouse.clicked = false;
    return { x: this.mouse.clickX, y: this.mouse.clickY };
  }

  pressed(code) { return this.keys.has(code); }

  consumePress(code, latch) {
    if (this.keys.has(code) && !latch[code]) { latch[code] = true; return true; }
    if (!this.keys.has(code)) latch[code] = false;
    return false;
  }

  movementVector() {
    let x = 0, y = 0;
    if (this.pressed("KeyA") || this.pressed("ArrowLeft")) x -= 1;
    if (this.pressed("KeyD") || this.pressed("ArrowRight")) x += 1;
    if (this.pressed("KeyW") || this.pressed("ArrowUp")) y -= 1;
    if (this.pressed("KeyS") || this.pressed("ArrowDown")) y += 1;
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len, moving: x !== 0 || y !== 0 };
  }
}
