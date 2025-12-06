import { Note } from "tonal";
import { get_canvas } from "./utils.js";
import {
  dx,
  dy,
  lower_lines,
  upper_lines,
  staff_offset,
  height,
} from "./settings.js";

export function note_to_iy(note) {
  const info = Note.get(note);
  return info.oct * 7 + info.step + staff_offset;
}

function needs_natural(previous_note, current_note) {
  const info1 = Note.get(previous_note);
  const info2 = Note.get(current_note);
  const same_oct = info1.oct == info2.oct;
  const same_step = info1.step == info2.step;
  return same_step && same_oct && info1.acc != "" && info2.acc == "";
}

export function draw_score(score, canvas_id) {
  draw_grid(canvas_id);
  const canvas = get_canvas(canvas_id);
  for (const ix in score) {
    const note = score[ix];
    const iy = note_to_iy(note);
    let acc = Note.get(note).acc;
    // add natural sign if previous note had an accidental
    const previous_note = score[ix - 1];
    if (needs_natural(previous_note, note)) {
      acc = "n";
    }
    draw_note(ix, iy, acc, canvas);
  }
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${dy * 4}px Arial`;
  ctx.fillText("𝄞", dx / 2, get_y_note(lower_lines * 2 + 4) + 11);
}

function draw_dash(ix, iy, canvas) {
  const ctx = canvas.getContext("2d");
  const x = ix * dx + dx / 2;
  const y = get_y_note(iy) + 0.5;
  draw_line(x - dx * 0.4, y, x + dx * 0.4, y, "#000", 2, ctx);
}

function draw_note(ix, iy, acc, canvas) {
  const ctx = canvas.getContext("2d");
  var x = ix * dx + dx / 2;
  var y = get_y_note(iy) + 1;
  const radius = dy / 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (acc == "b") {
    const accX = x - radius * 1.8;
    const accY = y - radius * 0.5;
    ctx.font = `${radius * 4}px Arial`;
    ctx.fillText("♭", accX, accY);
  } else if (acc == "#") {
    const accX = x - radius * 1.8;
    const accY = y + radius * 0.3;
    ctx.font = `${radius * 3}px Arial`;
    ctx.fillText("♯", accX, accY);
  } else if (acc == "n") {
    const accX = x - radius * 1.5;
    const accY = y - radius * 0.3;
    ctx.font = `${radius * 3}px Arial`;
    ctx.fillText("♮", accX, accY);
  }
}

function draw_line(x1, y1, x2, y2, color, width, ctx) {
  ctx.beginPath();
  ctx.moveTo(x1 + 0.5, y1 + 0.5);
  ctx.lineTo(x2 + 0.5, y2 + 0.5);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function get_y_line(i) {
  return height - i * dy - dy / 2;
}

function get_y_note(i) {
  return height - (i * dy) / 2 - dy / 2;
}

export function draw_grid(canvas_id) {
  const canvas = get_canvas(canvas_id);
  const ctx = canvas.getContext("2d");

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw vertical lines
  for (let i = 0; i < canvas.width / dx; i++) {
    draw_line(i * dx - 1, 0, i * dx - 1, canvas.height, "#E1E1E1", 1, ctx);
  }

  // draw horizontal lines
  let line_types = [
    ...Array(lower_lines).fill(0),
    ...Array(5).fill(1),
    ...Array(upper_lines).fill(0),
  ];
  for (let i = 0; i < line_types.length; i++) {
    const y = get_y_line(i) + 0.5;
    const x1 = 0;
    const x2 = canvas.width;
    if (line_types[i] == 0) {
      var color = "#E1E1E1";
      var w = 1;
    } else {
      var color = "#000";
      var w = 2;
    }
    draw_line(x1, y, x2, y, color, w, ctx);
  }
}
