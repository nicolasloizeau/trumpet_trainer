import { Note, Interval } from "tonal";
import { total_lines } from "./settings.js";
import { draw_patterns } from "./patterns.js";
import { staff_offset } from "./settings.js";

function transpose_score(score, interval) {
  let new_score = {};
  for (let pos in score) {
    let note = score[pos];
    let transposed_note = Note.simplify(Note.transpose(note, interval));
    new_score[pos] = transposed_note;
  }
  return new_score;
}

export function note_to_iy(note) {
  const info = Note.get(note);
  return info.oct * 7 + info.step + staff_offset;
}

export function draw_transpose(score) {
  draw_score(score, "score_0");
  draw_patterns(score, "patterns_0");
  window.transposed_scores = [score];
  for (let i = 1; i < 12; i++) {
    let interval = Interval.simplify(Interval.fromSemitones(-i * 7));
    let shifted_score = transpose_score(score, interval);
    shifted_score = best_octave(shifted_score);
    draw_score(shifted_score, "score_" + i);
    draw_patterns(shifted_score, "patterns_" + i);
    window.transposed_scores.push(shifted_score);
  }
}

export function transpose_notes(notes, interval) {
  score = {};
  for (let i = 0; i < notes.length; i++) {
    score[i] = notes[i];
  }
  score = transpose_score(score, interval);
  score = best_octave(score);
  let new_notes = [];
  for (let i = 0; i < notes.length; i++) {
    new_notes.push(score[i]);
  }
  return new_notes;
}

function best_octave(score) {
  let cost = 1000;
  let best_shift = 0;
  for (let oct = -3; oct < 3; oct++) {
    let shifted_score = transpose_score(
      score,
      Interval.fromSemitones(oct * 12),
    );
    let iys = [];
    for (let pos in shifted_score) {
      let note = shifted_score[pos];
      let iy = note_to_iy(note);
      iys.push(iy);
    }
    let min_iy = Math.min(...iys);
    let max_iy = Math.max(...iys);
    let center = (min_iy + max_iy) / 2;
    let new_cost = Math.abs(center + 2 - total_lines);
    if (new_cost < cost) {
      cost = new_cost;
      best_shift = oct;
    }
  }
  return transpose_score(score, Interval.fromSemitones(best_shift * 12));
}
