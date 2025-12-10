import { scales, createScaleButtons, mirror } from "./scales.js";
import { play_note, drawSquare, updateStatus, stopWhiteNoise } from "./play.js";
import { Range, Interval, Note } from "tonal";
import { transpose_notes } from "./transposer.js";

let mode = "melody"; // "random" or "melody"
let keys = Range.chromatic(["C4", "B4"]);
keys = keys.map(Note.pitchClass);
let head = 0;
window.key = "C4";
window.scale_name = "major";
let melody = mirror(scales[window.scale_name]);
let intervalId = null;
update();

function pickRandom() {
  return melody[Math.floor(Math.random() * melody.length)];
}

function next_note() {
  return melody[head % melody.length];
}

function getDurationInputValue() {
  const input = document.getElementById("note-duration");
  return parseFloat(input.value);
}

function startLoop() {
  const durationSec = getDurationInputValue();
  // play immediately and then every 5s
  const note = pickRandom();
  window.current_note = note;
  play_note(note, durationSec);
  let n = null;
  intervalId = setInterval(() => {
    if (mode === "melody") {
      head += 1;
      n = next_note();
    } else {
      n = pickRandom();
    }
    window.current_note = n;
    play_note(n, durationSec);
    updateStatus();
  }, durationSec * 1000);
}

function stopLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function setupButton() {
  const btn = document.getElementById("play");
  let running = false;
  btn.addEventListener("click", () => {
    if (!running) {
      startLoop();
      updateStatus();
      btn.textContent = "Stop";
      running = true;
    } else {
      stopLoop();
      stopWhiteNoise();
      btn.textContent = "Play";
      running = false;
    }
  });
}

function setupTogglePatternButton() {
  const toggle = document.getElementById("toggle-pattern");
  if (!toggle) return;
  const patternCanvas = document.getElementById("pattern");
  // initial state assumes canvas is visible; button text set in HTML accordingly
  toggle.addEventListener("click", () => {
    if (!patternCanvas) return;
    const isHidden = patternCanvas.style.display === "none";
    if (isHidden) {
      patternCanvas.style.display = ""; // let CSS/default show it
      toggle.textContent = "Hide pattern";
    } else {
      patternCanvas.style.display = "none";
      toggle.textContent = "Show pattern";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("scales-container");
  createScaleButtons(container);

  // mark initial active scale button based on window.scale_name
  if (container) {
    const prev = container.querySelector(".scale-btn.active");
    if (prev) prev.classList.remove("active");
    const initial = container.querySelector(
      `[data-scale="${window.scale_name}"]`,
    );
    if (initial) initial.classList.add("active");
  }

  // Delegate clicks from the container to .scale-btn elements and call update_scale
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".scale-btn");
    if (!btn) return;
    // ensure only one active in this container
    const active = container.querySelector(".scale-btn.active");
    if (active) active.classList.remove("active");
    btn.classList.add("active");

    const scale = btn.dataset.scale;
    update_scale(scale);
  });
});

function update_scale(scale_name) {
  window.scale_name = scale_name;
  update();
}

export function createKeysButtons(container = document.body) {
  if (!container) return;
  const frag = document.createDocumentFragment();

  keys.forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn key-btn";
    btn.dataset.value = name;
    btn.textContent = name;
    frag.appendChild(btn);
  });

  container.appendChild(frag);
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("keys-container");
  createKeysButtons(container);

  // mark initial active key button based on window.key
  if (container) {
    const prev = container.querySelector(".key-btn.active");
    if (prev) prev.classList.remove("active");
    const initial = container.querySelector(`[data-value="${window.key}"]`);
    if (initial) initial.classList.add("active");
  }

  // Delegate clicks from the container to .key-btn elements and call update_key
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".key-btn");
    if (!btn) return;
    // ensure only one active in this container
    const active = container.querySelector(".key-btn.active");
    if (active) active.classList.remove("active");
    btn.classList.add("active");

    const value = btn.dataset.value;
    update_key(value);
  });
});

function update_key(key) {
  window.key = key;
  update();
}

function update() {
  melody = mirror(scales[window.scale_name]);
  let interval = Interval.distance(melody[0], window.key);
  // interval = Interval.add(interval, "M2");
  melody = transpose_notes(melody, interval);
  head = 0;
  // stopLoop();
  // startLoop();
  console.log("Updated melody:", melody);
}

function setupModeButton() {
  const btn = document.getElementById("mode-toggle");
  if (!btn) return;

  const updateText = () => {
    btn.textContent = mode === "random" ? "Mode: Random" : "Mode: Melody";
  };

  updateText();

  btn.addEventListener("click", () => {
    mode = mode === "random" ? "melody" : "random";
    updateText();
  });
}
setupModeButton();
setupButton();
setupTogglePatternButton();
drawSquare(true);

import { resizeCanvases } from "./play.js";

document.addEventListener("DOMContentLoaded", () => {
  // existing setup...
  resizeCanvases();
  window.addEventListener("resize", () => resizeCanvases());
});
