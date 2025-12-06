import * as Tone from "tone";
import { Note, Interval } from "tonal";
import { draw_pattern, sharp_simplify } from "./patterns.js";
import { patterns_height } from "./settings.js";
import { fingerings } from "./fingerings.js";

const canvas_status = document.getElementById("status");
const canvas_pattern = document.getElementById("pattern");
const canvas_pattern2 = document.getElementById("pattern2");

canvas_status.width = 200;
canvas_status.height = 200;
canvas_pattern.width = 80;
canvas_pattern.height = patterns_height;
canvas_pattern2.width = 80;
canvas_pattern2.height = patterns_height;
const ctx = canvas_status.getContext("2d");

const trumpet = new Tone.Sampler({
  urls: {
    C6: "C6.mp3",
    D5: "D5.mp3",
    "D#4": "Ds4.mp3",
    F3: "F3.mp3",
    F4: "F4.mp3",
    F5: "F5.mp3",
    G4: "G4.mp3",
    A3: "A3.mp3",
    A5: "A5.mp3",
    "A#4": "As4.mp3",
    C4: "C4.mp3",
  },
  baseUrl: "./samples/trumpet/", // relative path to folder
}).toDestination();

export async function play_note(note, seconds) {
  draw_pattern(Note.transpose(note, Interval.fromSemitones(2)), canvas_pattern);
  await Tone.start();
  const when = Tone.now();
  // note = Note.transpose(note, Interval.fromSemitones(-2));
  trumpet.triggerAttack(note, when);
  trumpet.triggerRelease(note, when + seconds);
}

export function drawSquare(isCorrect) {
  ctx.clearRect(0, 0, canvas_status.width, canvas_status.height);
  ctx.fillStyle = isCorrect ? "#2ecc71" : "#e74c3c";
  ctx.fillRect(0, 0, canvas_status.width, canvas_status.height);
}

const trumpet_keys = [39, 96, 110];

const pressedKeyChars = new Set();
const pressedKeyCodes = new Set();

export function updateStatus() {
  var note = window.current_note;
  note = sharp_simplify(note);
  note = Note.transpose(note, Interval.fromSemitones(2));
  const current_pattern = fingerings[sharp_simplify(note)];
  const pattern = trumpet_keys.map((kc) => (pressedKeyCodes.has(kc) ? 1 : 0));
  const isCorrect = JSON.stringify(current_pattern) === JSON.stringify(pattern);
  console.log(current_pattern);
  console.log(pattern);
  drawSquare(isCorrect);
  if (isCorrect) {
    stopWhiteNoise();
  } else {
    startWhiteNoise(-20);
  }
}

function updatePattern() {
  // Build the pattern [1|0, 1|0, 1|0] based on trumpet_keys and pressedKeyCodes
  const pattern = trumpet_keys.map((kc) => (pressedKeyCodes.has(kc) ? 1 : 0));
  draw_pattern(pattern, canvas_pattern2);
}

function updateAll() {
  updateStatus();
  updatePattern();
}

document.addEventListener("keydown", (ev) => {
  const keyChar = (ev.key || "").toLowerCase();
  const keyCode = ev.keyCode || ev.which || 0;
  if (keyChar) pressedKeyChars.add(keyChar);
  if (keyCode) pressedKeyCodes.add(keyCode);
  updateAll();
});

document.addEventListener("keyup", (ev) => {
  const keyChar = (ev.key || "").toLowerCase();
  const keyCode = ev.keyCode || ev.which || 0;
  if (keyChar) pressedKeyChars.delete(keyChar);
  if (keyCode) pressedKeyCodes.delete(keyCode);
  updateAll();
});

// Clear pressed keys when window loses focus (prevent stuck keys)
// window.addEventListener("blur", () => {
//   pressedKeyChars.clear();
//   pressedKeyCodes.clear();
//   updateAll();
// });
updatePattern();

let _noiseNode = null;
let _noiseGain = null;

/**
 * Start continuous white noise.
 * @param {number} volumeDb Volume in dB (e.g. -12). Optional.
 */

export async function startWhiteNoise(volumeDb = -12) {
  let btn = document.getElementById("play");
  await Tone.start(); // ensure AudioContext is resumed on first user gesture
  if (_noiseNode) return; // already running
  if (btn.textContent === "Start") {
    return; // do not start noise if not playing
  }

  _noiseNode = new Tone.Noise("white").start();
  _noiseGain = new Tone.Gain(Tone.dbToGain(volumeDb)).toDestination();
  _noiseNode.connect(_noiseGain);
}

/**
 * Stop the white noise started by startWhiteNoise.
 */
export function stopWhiteNoise() {
  if (!_noiseNode) return; // nothing to stop

  try {
    _noiseNode.stop();
    _noiseNode.disconnect();
    _noiseGain.disconnect();
  } catch (e) {
    // ignore if nodes already stopped/disconnected
  } finally {
    _noiseNode.dispose();
    _noiseGain.dispose();
    _noiseNode = null;
    _noiseGain = null;
  }
}
