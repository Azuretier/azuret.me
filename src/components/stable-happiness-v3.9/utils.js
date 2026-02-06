/* ═══════════════════════════════════════════════════════════════════
   UTILS - Canvas Text Rendering Utilities
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Renders text to a canvas for use as a Three.js texture
 * @param {string} text - Text to render
 * @param {Object} opts - Options for rendering
 * @returns {HTMLCanvasElement} - Canvas element with rendered text
 */
export function renderTextToCanvas(text, opts = {}) {
    const {
        fontSize = 42,
        fontFamily = "serif",
        color = "#ffffff",
        width = 1024,
        height = 128,
        align = "left",
    } = opts;

    const cvs = document.createElement("canvas");
    cvs.width = width;
    cvs.height = height;

    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.font = `300 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;

    const x = align === "center" ? width / 2 : 20;
    ctx.fillText(text, x, height / 2);

    return cvs;
}

/**
 * Renders Kanji characters to a canvas for use as a Three.js texture
 * @param {string} text - Kanji text to render
 * @param {Object} opts - Options for rendering
 * @returns {HTMLCanvasElement} - Canvas element with rendered kanji
 */
export function renderKanjiCanvas(text, opts = {}) {
    const {
        fontSize = 180,
        color = "#ffffff",
        width = 512,
        height = 256,
    } = opts;

    const cvs = document.createElement("canvas");
    cvs.width = width;
    cvs.height = height;

    const ctx = cvs.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.font = `900 ${fontSize}px "Noto Serif JP", serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, width / 2, height / 2);

    return cvs;
}
