import { draw_patterns } from "./patterns.js";
import { draw_score } from "./score.js";
import { get_canvas } from "./utils.js";
import { dx, dy, total_lines, staff_offset } from "./settings.js";
import { draw_transpose } from "./transposer.js";

var current_note = -1;
const letters = ["C", "D", "E", "F", "G", "A", "B"];
const all_notes = get_all_notes();

function snap(x, y, canvas_id = "score_0") {
  const canvas = get_canvas(canvas_id);
  let xs = arange(0 + dx / 2, canvas.width + dx / 2, dx);
  let ix = nearestIndex(xs, x);
  let ys = arange(dy / 2, canvas.height, dy / 2);
  let iy = total_lines * 2 - 2 - nearestIndex(ys, y);
  return [ix, iy];
}

function nearestIndex(xs, x) {
  if (xs.length === 0) return -1;
  let bestI = 0;
  let bestD = Math.abs(xs[0] - x);
  for (let i = 1; i < xs.length; i++) {
    const d = Math.abs(xs[i] - x);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  return bestI;
}

function iy_to_note(iy) {
  iy = iy - staff_offset;
  var oct = Math.floor(iy / 7);
  var step = iy % 7;
  var letter = letters[step];
  var note = letter + oct;
  return note;
}

function arange(start, stop, step = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  const out = [];
  for (let v = start; step > 0 ? v < stop : v > stop; v += step) {
    out.push(v);
  }
  return out;
}

function get_all_notes() {
  var notes = [];
  for (let oct = 3; oct < 7; oct++) {
    for (let letter of letters) {
      for (let acc of ["b", "", "#"]) {
        notes.push(letter + acc + oct);
      }
    }
  }
  return notes;
}

function update() {
  draw_score(window.score, "score_0");
  draw_patterns(window.score, "patterns_0");
  draw_transpose(window.score);
}

export function click(x, y) {
  let ix, iy;
  [ix, iy] = snap(x, y);
  var note = iy_to_note(iy);
  current_note = ix;
  window.score[ix] = note;
  update();
}

function move_current(sign) {
  let note = window.score[current_note];
  let i = all_notes.indexOf(note);
  note = all_notes[i + sign];
  window.score[current_note] = note;
  update();
}

export function sharpen() {
  move_current(1);
}

export function flatten() {
  move_current(-1);
}

export function delete_note() {
  if (current_note in window.score) {
    delete window.score[current_note];
    update();
  }
}
