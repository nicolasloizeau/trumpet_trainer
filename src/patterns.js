import { fingerings } from "./fingerings.js";
import { Note } from "tonal";
const r = 20;

export function draw_pattern(note, canvas) {
  if (!canvas) return;
  if (typeof note === "string") {
    note = sharp_simplify(note);
    note = fingerings[note];
  }
  const pattern = note;
  const ctx = canvas.getContext("2d");

  // Compute drawing dimensions in CSS pixels (independent of devicePixelRatio)
  const W =
    canvas.clientWidth ||
    parseFloat(getComputedStyle(canvas).width) ||
    canvas.width;
  const H =
    canvas.clientHeight ||
    parseFloat(getComputedStyle(canvas).height) ||
    canvas.height;

  // Clear the drawing area (in CSS pixels)
  ctx.clearRect(0, 0, W, H);

  // Radius scaled to canvas size for consistent appearance
  const r = Math.max(4, Math.min(12, Math.round(Math.min(W, H) * 0.2)));

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const cx = W / 2;
    const cy = H - (H / 4) * (i + 1);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = pattern && pattern[i] == 1 ? "black" : "white";
    ctx.fill();
    ctx.lineWidth = Math.max(2, Math.round(r * 0.4));
    ctx.strokeStyle = "black";
    ctx.stroke();
  }
}

export function sharp_simplify(note) {
  const n = Note.simplify(note);
  if (Note.get(n).acc == "b") {
    return Note.enharmonic(n);
  }
  return n;
}
