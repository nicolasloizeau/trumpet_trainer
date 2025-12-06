export function set_canvas_size(canvas_id, width, height) {
  const canvas = document.getElementById(canvas_id);
  canvas.width = width;
  canvas.height = height;
}

export function get_canvas(canvas_id) {
  return document.getElementById(canvas_id);
}
