// this file is all vide coded. to improve

export async function exportAllCanvasesToPDF(
  filename = "canvases.pdf",
  opts = {},
) {
  const { jsPDF } = window.jspdf;
  const allCanvases = Array.from(document.querySelectorAll("canvas"));
  const groupSize = Number(opts.groupSize) || 12;
  const mime = opts.mime || "image/png";
  const quality = typeof opts.quality === "number" ? opts.quality : 1.0;
  const margin = typeof opts.margin === "number" ? opts.margin : 20;
  const spacing = typeof opts.spacing === "number" ? opts.spacing : 8;

  // detect toggle state: extras hidden => export only visible canvases on a single page
  const extrasHidden = checkExtrasHidden();

  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxRenderWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;

  // Helper: convert canvases to image items with target render sizes
  function makeItemsFromCanvases(canvases) {
    return canvases.map((c) => {
      const dataUrl = c.toDataURL(mime, quality);
      const imgW = c.width || 1;
      const imgH = c.height || 1;
      const renderW = maxRenderWidth;
      const renderH = (imgH / imgW) * renderW;
      return { dataUrl, renderW, renderH };
    });
  }

  // Helper: draw a list of items stacked vertically on the current pdf page (scaled to fit)
  function renderItemsOnCurrentPage(items) {
    const totalRenderHeight =
      items.reduce((sum, it) => sum + it.renderH, 0) +
      spacing * Math.max(0, items.length - 1);
    const globalScale =
      totalRenderHeight > availableHeight
        ? availableHeight / totalRenderHeight
        : 1;

    let y = margin;
    items.forEach((it) => {
      const finalW = it.renderW * globalScale;
      const finalH = it.renderH * globalScale;
      const x = (pageWidth - finalW) / 2;
      pdf.addImage(
        it.dataUrl,
        mime === "image/png" ? "PNG" : "JPEG",
        x,
        y,
        finalW,
        finalH,
      );
      y += finalH + spacing;
    });
  }

  if (extrasHidden) {
    const visibleCanvases = allCanvases.filter((c) => {
      const s = getComputedStyle(c);
      return (
        s.display !== "none" &&
        s.visibility !== "hidden" &&
        c.width > 0 &&
        c.height > 0
      );
    });
    if (visibleCanvases.length === 0) {
      alert("No visible canvases found to export.");
      return;
    }
    const items = makeItemsFromCanvases(visibleCanvases);
    renderItemsOnCurrentPage(items);
    pdf.save(filename);
    return;
  }

  // grouped behavior (default): split into pages of groupSize
  for (let start = 0; start < allCanvases.length; start += groupSize) {
    const group = allCanvases.slice(start, start + groupSize);
    const items = makeItemsFromCanvases(group);
    if (start !== 0) pdf.addPage();
    renderItemsOnCurrentPage(items);
  }

  pdf.save(filename);
}

// small utility to detect whether extra score canvases are hidden
function checkExtrasHidden() {
  const scoreCanvases = Array.from(
    document.querySelectorAll('canvas[id^="score"]'),
  );
  if (scoreCanvases.length <= 1) return false;
  return scoreCanvases.slice(1).some((c) => {
    const s = getComputedStyle(c);
    return (
      s.display === "none" ||
      s.visibility === "hidden" ||
      c.offsetParent === null
    );
  });
}
