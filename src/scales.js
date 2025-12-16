export const scales = {
  major: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  minor: ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5"],
  whole: ["C4", "D4", "E4", "F#4", "G#4", "A#4", "C5"],
  pentatonic: ["C4", "D4", "E4", "G4", "A4", "C5"],
  diminished: ["C4", "D4", "Eb4", "F4", "F#4", "G#4", "A4", "B4", "C5"],
  blues: ["C4", "Eb4", "F4", "Gb4", "G4", "Bb4", "C5"],
  chromatic: [
    "C4",
    "C#4",
    "D4",
    "D#4",
    "E4",
    "F4",
    "F#4",
    "G4",
    "G#4",
    "A4",
    "A#4",
    "B4",
    "C5",
  ],
  scale1: ["C4", "D4", "Eb4", "G4", "A4", "C5", "D5"],
  scale2: ["Bb3", "C4", "Db4", "F4", "Gb4", "Bb4", "C5"],
  arp1: ["C4", "E4", "G4", "B4", "D5"],
  tfo: ["D4", "F4", "A4", "C5", "G4", "B4", "D5", "F5", "C4", "E4", "G4", "B4"],
};

export function createScaleButtons(container = document.body) {
  if (!container) return;
  const frag = document.createDocumentFragment();

  Object.keys(scales).forEach((name) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn scale-btn";
    btn.dataset.scale = name;
    btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    frag.appendChild(btn);
  });

  container.appendChild(frag);
}

export function mirror(arr) {
  if (!Array.isArray(arr) || arr.length <= 1)
    return Array.isArray(arr) ? arr.slice() : [];
  const tailReversed = arr.slice(0, -1).reverse();
  return arr.concat(tailReversed);
}
