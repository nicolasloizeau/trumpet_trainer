import { fingerings } from "./fingerings.js";
import { get_canvas } from "./utils.js";
import { Note } from "tonal";
import { patterns_height } from "./settings.js";
const r = 20;

export function draw_pattern(note, canvas) {
  if (typeof note === "string") {
    note = sharp_simplify(note);
    note = fingerings[note];
  }
  const pattern = note;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < 3; i++) {
    ctx.beginPath();
    const cx = canvas.width / 2;
    const cy = patterns_height - (patterns_height / 4) * (i + 1);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    if (pattern[i] == 1) {
      ctx.fillStyle = "black";
    }
    ctx.fill();
    ctx.lineWidth = 4;
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
