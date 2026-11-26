'use strict';

/* ---------- Configuration ---------- */

const PRESETS = [
  { id: 'link', name: 'Link / Facebook / LinkedIn (1200×630)', w: 1200, h: 630 },
  { id: 'square', name: 'Instagram square (1080×1080)', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Instagram portrait (1080×1350)', w: 1080, h: 1350 },
  { id: 'story', name: 'Story / Reel (1080×1920)', w: 1080, h: 1920 },
  { id: 'wide', name: 'Web banner 16:9 (1920×1080)', w: 1920, h: 1080 },
  { id: 'header', name: 'X / Twitter header (1500×500)', w: 1500, h: 500 },
  { id: 'custom', name: 'Custom…', w: 0, h: 0 },
];

/**
 * UIB colours, from the visual identity manual
 * (logo.uib.cat/Manual-dIdentitat-Visual-Corporativa/colors/). The institutional
 * pair is for the logo; the secondary palette is for posters, signage and
 * similar materials, such as these banners. Hex values come from the manual's RGB.
 */
const UIB = {
  // Institutional
  blue: '#0065bd',        // Pantone 300 C
  black: '#000000',       // Pantone Process Black
  // Secondary
  lavender: '#a1ace3',    // Pantone 2716 C (the manual's web value, #9999cc, doesn't match its RGB)
  indigo: '#3e5694',      // Pantone 7685 C
  mauve: '#918693',       // Pantone 7653 C
  sand: '#d4bea6',        // Pantone 4675 C
  paleSky: '#c3dbe5',     // Pantone 7457 C
  teal: '#7cb5b2',        // Pantone 7472 C
  deepGreen: '#25332e',   // Pantone 5535 C
  terracotta: '#b78b69',  // Pantone 7515 C
  ochre: '#caa365',       // Pantone 7509 C
  stone: '#d4d1c4',       // Pantone 7527 C
  slateBlue: '#919dba',   // Pantone 535 C
  brown: '#683c23',       // Pantone 168 C
  charcoal: '#3a3c39',    // Pantone 447 C
  warmGrey: '#d4d0ca',    // Pantone Warm Grey 1 C
  chestnut: '#5d3b20',    // Pantone 1545 C
  wheat: '#d8c9a4',       // Pantone 468 C
  olive: '#44492e',       // Pantone 5743 C
  pine: '#506841',        // Pantone 7743 C
  taupe: '#9e9383',       // Pantone 7530 C
  lime: '#94bb20',        // Pantone 376 C
};

/**
 * A gradient preset, in the style of the official sample banners: two clearly
 * different hues at a similar strength (e.g. purple → gold), both quite opaque,
 * so the banner reads as colour while the photo still shows through. The deeper
 * colour goes on the left, behind the text; labelBg is a darker palette colour
 * for the label band.
 */
const grad = (name, gradC1, gradC2, labelBg, gradA1 = 85, gradA2 = 80) =>
  ({ name, gradC1, gradA1, gradC2, gradA2, gradAngle: 90, labelBg });

const GRADIENT_GROUPS = [
  { group: 'Sample banners', items: [
    grad('Purple → Gold', '#9e3f97', '#b8962e', '#8a2459'),
    grad('Blue', '#003a78', '#00a3e0', '#002b5c', 90, 65),
    grad('Magenta → Orange', '#a3195b', '#f39200', '#7a0f43', 88, 75),
    grad('Green', '#0b6b4f', '#3fb6a8', '#06473a', 88, 70),
    grad('Dark', '#14142b', '#14142b', UIB.blue, 92, 25),
    grad('Light', '#ffffff', '#ffffff', UIB.blue, 92, 30),
  ] },
  { group: 'UIB secondary palette', items: [
    grad('Mauve → Ochre', UIB.mauve, UIB.ochre, UIB.indigo),
    grad('Mauve → Terracotta', UIB.mauve, UIB.terracotta, UIB.indigo),
    grad('Mauve → Teal', UIB.mauve, UIB.teal, UIB.indigo),
    grad('Indigo → Ochre', UIB.indigo, UIB.ochre, UIB.blue),
    grad('Indigo → Terracotta', UIB.indigo, UIB.terracotta, UIB.blue),
    grad('Indigo → Teal', UIB.indigo, UIB.teal, UIB.blue),
    grad('Indigo → Lime', UIB.indigo, UIB.lime, UIB.blue),
    grad('Pine → Ochre', UIB.pine, UIB.ochre, UIB.deepGreen),
    grad('Pine → Lime', UIB.pine, UIB.lime, UIB.deepGreen),
    grad('Deep green → Terracotta', UIB.deepGreen, UIB.terracotta, UIB.pine),
    grad('Brown → Teal', UIB.brown, UIB.teal, UIB.chestnut),
    grad('Brown → Lavender', UIB.brown, UIB.lavender, UIB.chestnut),
    grad('Chestnut → Ochre', UIB.chestnut, UIB.ochre, UIB.brown),
  ] },
  { group: 'UIB blue', items: [
    grad('UIB blue → Ochre', UIB.blue, UIB.ochre, UIB.indigo),
    grad('UIB blue → Teal', UIB.blue, UIB.teal, UIB.indigo),
    grad('UIB blue', UIB.blue, UIB.blue, UIB.indigo, 92, 55),
    grad('Black → UIB blue', UIB.black, UIB.blue, UIB.blue),
  ] },
  { group: 'Light (dark text)', items: [
    grad('Pale sky → Stone', UIB.paleSky, UIB.stone, UIB.indigo, 92, 75),
    grad('Wheat → Warm grey', UIB.wheat, UIB.warmGrey, UIB.chestnut, 92, 75),
  ] },
];
const GRADIENTS = GRADIENT_GROUPS.flatMap((g) => g.items);
const GRADIENT_KEYS = ['gradC1', 'gradA1', 'gradC2', 'gradA2', 'gradAngle', 'labelBg'];
const presetButtons = new Map(); // preset → its swatch button

/** Highlights the preset matching the current gradient, and shows its name. */
function updateActivePreset() {
  const active = GRADIENTS.find((g) => GRADIENT_KEYS.every((k) => String(g[k]).toLowerCase() === String(state[k]).toLowerCase()));
  for (const [g, b] of presetButtons) b.classList.toggle('active', g === active);
  document.getElementById('gradientName').textContent = active ? active.name : 'Custom gradient';
}

const DEFAULTS = {
  format: 'png',
  preset: 'link', customW: 1200, customH: 630,
  imgZoom: 100, imgX: 50, imgY: 50, imgSat: 70, imgBright: 100,
  ...pick(GRADIENTS[0], ['gradC1', 'gradA1', 'gradC2', 'gradA2', 'gradAngle', 'labelBg']), // Purple → Gold, as in the sample
  gradBlend: 'source-over',
  cornerShow: true, cornerColor: '#ffffff',
  logoBrand: 'team', logoVariant: 'auto', logoSize: 100,
  label: 'Label',
  title: 'Title',
  subtitle: 'Subtitle',
  highlight: 'Highlighted information\n(dates, place…)',
  details: 'More details',
  textColorMode: 'auto', textColor: '#ffffff',
  textScale: 100, valign: 'bottom',
  badgeShow: true, badgeText: 'Badge\ntext', badgeSize: 100, badgeAuto: true, badgeX: 87.5, badgeY: 76,
};

const FONT = '"UIBsans", system-ui, sans-serif';
const DARK = '#231f20';
const STORAGE_KEY = 'banner-editor:settings:v1';
// logos[brand][variant]: every brand has a full-colour, dark (positive) and white (negative) version.
const LOGO_BRANDS = { uib: 'uib', team: 'uib-mipro-soft' };
const LOGO_VARIANTS = ['color', 'dark', 'white'];

/* ---------- State ---------- */

const state = { ...DEFAULTS, ...loadSettings() };
const logos = {};
let bgImage = null;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

/* ---------- Helpers ---------- */

function pick(obj, keys) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveSettings() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or disabled */ }
}

function hexToRgba(hex, alphaPct) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alphaPct / 100})`;
}

function hexLuminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  return relLum((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

function relLum(r, g, b) {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** Average relative luminance of a region already painted on the context. */
function regionLuminance(c, x, y, w, h) {
  x = Math.max(0, Math.floor(x)); y = Math.max(0, Math.floor(y));
  w = Math.min(c.canvas.width - x, Math.ceil(w)); h = Math.min(c.canvas.height - y, Math.ceil(h));
  if (w <= 0 || h <= 0) return 0;
  const data = c.getImageData(x, y, w, h).data;
  const step = Math.max(1, Math.floor((w * h) / 20000)) * 4;
  let sum = 0, n = 0;
  for (let i = 0; i < data.length; i += step) { sum += relLum(data[i], data[i + 1], data[i + 2]); n++; }
  return sum / n;
}

function lines(text) {
  return (text || '').split('\n').map((l) => l.trim()).filter(Boolean);
}

/** Splits text on explicit newlines and wraps each paragraph to maxWidth. */
function wrap(c, text, font, maxWidth) {
  c.font = font;
  const out = [];
  for (const para of lines(text)) {
    let line = '';
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (line && c.measureText(test).width > maxWidth) { out.push(line); line = word; } else line = test;
    }
    if (line) out.push(line);
  }
  return out;
}

function currentSize() {
  if (state.preset === 'custom') {
    return { w: clampInt(state.customW, 100, 4000), h: clampInt(state.customH, 100, 4000) };
  }
  const p = PRESETS.find((x) => x.id === state.preset) || PRESETS[0];
  return { w: p.w, h: p.h };
}

function clampInt(v, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(v) || min)));
}

/* ---------- Rendering ---------- */

function imageRect(W, H) {
  const base = Math.max(W / bgImage.naturalWidth, H / bgImage.naturalHeight) * (state.imgZoom / 100);
  const dw = bgImage.naturalWidth * base, dh = bgImage.naturalHeight * base;
  return { x: -(dw - W) * (state.imgX / 100), y: -(dh - H) * (state.imgY / 100), w: dw, h: dh };
}

function drawBackground(c, W, H) {
  c.fillStyle = '#7d7d86';
  c.fillRect(0, 0, W, H);
  if (bgImage) {
    const r = imageRect(W, H);
    c.filter = `saturate(${state.imgSat}%) brightness(${state.imgBright}%)`;
    c.drawImage(bgImage, r.x, r.y, r.w, r.h);
    c.filter = 'none';
  }

  // Gradient: CSS-like angle (90° = left → right) spanning the whole canvas.
  const a = (state.gradAngle * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const half = Math.abs((W / 2) * dx) + Math.abs((H / 2) * dy);
  const g = c.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half);
  g.addColorStop(0, hexToRgba(state.gradC1, state.gradA1));
  g.addColorStop(1, hexToRgba(state.gradC2, state.gradA2));
  c.globalCompositeOperation = state.gradBlend;
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
}

function drawCorner(c, W, H, s) {
  if (!state.cornerShow) return;
  // The banner's bottom-right corner is rounded off, as in the UIB banners: a
  // superellipse quadrant tangent to the right and bottom edges, fitted to the
  // official sample (159 × 146 px at 1200×630, exponent 2.58).
  const rx = 158.7 * s, ry = 145.5 * s, n = 2.58;
  const cx = W - rx, cy = H - ry;
  c.fillStyle = state.cornerColor;
  c.beginPath();
  c.moveTo(W, H);
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * (Math.PI / 2); // from the right edge (a = 0) to the bottom edge
    c.lineTo(cx + rx * Math.cos(a) ** (2 / n), cy + ry * Math.sin(a) ** (2 / n));
  }
  c.closePath();
  c.fill();
}

/** Computes positions of the text blocks below the logo. */
function layoutText(c, W, H, s, ts, contentTop) {
  const pad = 78 * s;
  const maxW = W - pad * 2;
  const blocks = [];
  const add = (b) => { if (b) blocks.push(b); };

  if (state.label.trim()) {
    add({ type: 'label', h: 42 * ts, after: 20 * ts, text: state.label.trim(), font: `700 ${26 * ts}px ${FONT}` });
  }
  const titleFont = `700 ${64 * ts}px ${FONT}`;
  const title = wrap(c, state.title, titleFont, maxW);
  if (title.length) add({ type: 'text', lines: title, font: titleFont, lh: 70 * ts, after: 0 });
  const subFont = `300 ${48 * ts}px ${FONT}`;
  const sub = wrap(c, state.subtitle, subFont, maxW);
  if (sub.length) add({ type: 'text', lines: sub, font: subFont, lh: 56 * ts, after: 0 });

  const highlightFont = `700 ${34 * ts}px ${FONT}`;
  const highlight = wrap(c, state.highlight, highlightFont, maxW);
  const detailsFont = `400 ${32 * ts}px ${FONT}`;
  const details = wrap(c, state.details, detailsFont, maxW);
  if ((highlight.length || details.length) && (title.length || sub.length)) {
    add({ type: 'divider', h: 2 * ts, before: 28 * ts, after: 26 * ts });
  }
  if (highlight.length) add({ type: 'text', lines: highlight, font: highlightFont, lh: 40 * ts, after: 0 });
  if (details.length) add({ type: 'text', lines: details, font: detailsFont, lh: 38 * ts, after: 0 });

  let total = 0;
  for (const b of blocks) {
    b.height = b.type === 'text' ? b.lines.length * b.lh : b.h;
    total += (b.before || 0) + b.height + (b.after || 0);
  }

  const bottom = H - 52 * s;
  let y;
  if (state.valign === 'top') y = contentTop;
  else if (state.valign === 'center') y = contentTop + (bottom - contentTop - total) / 2;
  else y = bottom - total;
  y = Math.max(y, contentTop);

  let right = pad;
  for (const b of blocks) {
    y += b.before || 0;
    b.y = y;
    y += b.height + (b.after || 0);
    c.font = b.font || '';
    if (b.type === 'text') right = Math.max(right, pad + Math.max(...b.lines.map((l) => c.measureText(l).width)));
    if (b.type === 'label') right = Math.max(right, pad + c.measureText(b.text).width + 18 * ts);
  }
  return { blocks, pad, maxW, right, top: blocks.length ? blocks[0].y : contentTop, bottom: y };
}

function chooseLogo(lum) {
  if (state.logoVariant !== 'auto') return state.logoVariant;
  if (lum > 0.75) return 'color';
  if (lum > 0.42) return 'dark';
  return 'white';
}

function render(c, W, H) {
  c.canvas.width = W;
  c.canvas.height = H;
  // Layout unit: 1 at 1200×630; portrait formats scale by width so text stays legible.
  const s = Math.min(W / 850, H / 630);
  const ts = s * (state.textScale / 100);

  drawBackground(c, W, H);
  drawCorner(c, W, H, s);

  // Logo geometry.
  const pad = 78 * s;
  const logoH = 96 * s * (state.logoSize / 100);
  const logoTop = 56 * s;
  const brand = logos[state.logoBrand] || logos.uib;
  const aspect = (img) => img.naturalWidth / img.naturalHeight;
  const ref = brand.white || brand.dark || brand.color;
  const logoW = ref ? logoH * aspect(ref) : logoH * 4;

  // Decide colours from what is behind the logo and the text.
  const logoLum = regionLuminance(c, pad, logoTop, logoW, logoH);
  const variant = chooseLogo(logoLum);
  const layout = layoutText(c, W, H, s, ts, logoTop + logoH + 34 * s);
  const textLum = regionLuminance(c, layout.pad, layout.top, Math.min(layout.maxW, 600 * ts), layout.bottom - layout.top);
  const textColor = state.textColorMode === 'custom' ? state.textColor : (textLum > 0.45 ? DARK : '#ffffff');

  // Logo.
  const logoImg = brand[variant];
  if (logoImg) c.drawImage(logoImg, pad, logoTop, logoH * aspect(logoImg), logoH);

  // Text blocks.
  for (const b of layout.blocks) {
    if (b.type === 'label') {
      c.font = b.font;
      const tw = c.measureText(b.text).width;
      c.fillStyle = state.labelBg;
      c.fillRect(0, b.y, layout.pad + tw + 18 * ts, b.h);
      c.fillStyle = hexLuminance(state.labelBg) > 0.45 ? DARK : '#ffffff';
      c.textBaseline = 'middle';
      c.fillText(b.text, layout.pad, b.y + b.h / 2 + 1 * ts);
    } else if (b.type === 'divider') {
      c.fillStyle = textColor;
      c.fillRect(layout.pad, b.y, 24 * ts, b.h);
    } else {
      c.font = b.font;
      c.fillStyle = textColor;
      c.textBaseline = 'alphabetic';
      b.lines.forEach((l, i) => c.fillText(l, layout.pad, b.y + i * b.lh + b.lh * 0.8));
    }
  }

  drawBadge(c, W, H, s, textColor, layout);
  return { variant, logoLum };
}

function drawBadge(c, W, H, s, color, layout) {
  const text = lines(state.badgeText);
  if (!state.badgeShow || !text.length) return;
  const k = s * (state.badgeSize / 100);
  const r = 74 * k;
  let cx, cy;
  if (state.badgeAuto) {
    // Beside the text when there is room, otherwise above it, aligned right.
    cx = W - 75 * s - r;
    cy = cx - r >= layout.right + 30 * s ? layout.bottom - r - 20 * s : layout.top - r - 30 * s;
  } else {
    cx = (W * state.badgeX) / 100;
    cy = (H * state.badgeY) / 100;
  }
  cx = Math.min(W - r - 4, Math.max(r + 4, cx));
  cy = Math.min(H - r - 4, Math.max(r + 4, cy));
  c.strokeStyle = color;
  c.lineWidth = 3 * k;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.stroke();

  let size = 27 * k;
  c.font = `700 ${size}px ${FONT}`;
  const widest = Math.max(...text.map((l) => c.measureText(l).width));
  if (widest > r * 1.6) { size *= (r * 1.6) / widest; c.font = `700 ${size}px ${FONT}`; }
  const lh = size * 1.15;
  c.fillStyle = color;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const y0 = cy - ((text.length - 1) * lh) / 2;
  text.forEach((l, i) => c.fillText(l, cx, y0 + i * lh));
  c.textAlign = 'left';
}

let pending = false;
function scheduleRender() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    const { w, h } = currentSize();
    const { variant } = render(ctx, w, h);
    document.getElementById('sizeLabel').textContent = `${w} × ${h} px`;
    const note = document.getElementById('logoAutoNote');
    note.textContent = state.logoVariant === 'auto' ? `→ ${{ white: 'negative', dark: 'positive', color: 'full colour' }[variant]}` : '';
    document.getElementById('dropHint').hidden = !!bgImage;
    document.getElementById('removeImageBtn').hidden = !bgImage;
    updateActivePreset();
  });
}

/* ---------- Export ---------- */

function slug(text) {
  return (text || 'banner').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'banner';
}

function toBlob(cnv) {
  const type = state.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return new Promise((resolve) => cnv.toBlob(resolve, type, 0.92));
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function fileName(w, h) {
  return `${slug(state.title)}-${w}x${h}.${state.format === 'jpeg' ? 'jpg' : 'png'}`;
}

async function downloadCurrent() {
  const { w, h } = currentSize();
  render(ctx, w, h);
  downloadBlob(await toBlob(canvas), fileName(w, h));
}

async function downloadAll() {
  const off = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  for (const p of PRESETS.filter((x) => x.id !== 'custom')) {
    render(off, p.w, p.h);
    downloadBlob(await toBlob(off.canvas), fileName(p.w, p.h));
    await new Promise((r) => setTimeout(r, 400)); // browsers throttle rapid downloads
  }
}

async function copyToClipboard() {
  const btn = document.getElementById('copyBtn');
  try {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    btn.textContent = 'Copied!';
  } catch {
    btn.textContent = 'Copy failed';
  }
  setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
}

/* ---------- Background image ---------- */

function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    if (bgImage) URL.revokeObjectURL(bgImage.src);
    bgImage = img;
    Object.assign(state, { imgZoom: 100, imgX: 50, imgY: 50 });
    syncInputs();
    scheduleRender();
  };
  img.src = URL.createObjectURL(file);
}

/** Back to a gradient-only banner. */
function removeImage() {
  if (bgImage) URL.revokeObjectURL(bgImage.src);
  bgImage = null;
  scheduleRender();
}

function setupImageInteractions() {
  const fileInput = document.getElementById('imageInput');
  fileInput.addEventListener('change', () => {
    loadImageFile(fileInput.files[0]);
    fileInput.value = ''; // so choosing the same file again still triggers a change
  });
  document.getElementById('chooseImageLink').addEventListener('click', () => fileInput.click());
  document.getElementById('removeImageBtn').addEventListener('click', removeImage);

  const stage = document.getElementById('stage');
  stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('drag-over'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('drag-over'));
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    stage.classList.remove('drag-over');
    loadImageFile(e.dataTransfer.files[0]);
  });
  window.addEventListener('paste', (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
    if (item) loadImageFile(item.getAsFile());
  });

  // Drag to pan.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!bgImage) return;
    drag = { x: e.clientX, y: e.clientY, imgX: state.imgX, imgY: state.imgY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const { w, h } = currentSize();
    const ratio = w / canvas.getBoundingClientRect().width;
    const r = imageRect(w, h);
    const overX = r.w - w, overY = r.h - h;
    if (overX > 0.5) state.imgX = clamp(drag.imgX - ((e.clientX - drag.x) * ratio * 100) / overX, 0, 100);
    if (overY > 0.5) state.imgY = clamp(drag.imgY - ((e.clientY - drag.y) * ratio * 100) / overY, 0, 100);
    syncInputs(['imgX', 'imgY']);
    scheduleRender();
  });
  const end = () => { if (drag) { drag = null; canvas.classList.remove('dragging'); saveSettings(); } };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // Wheel to zoom.
  canvas.addEventListener('wheel', (e) => {
    if (!bgImage) return;
    e.preventDefault();
    state.imgZoom = clamp(state.imgZoom - e.deltaY * 0.15, 100, 300);
    syncInputs(['imgZoom']);
    scheduleRender();
  }, { passive: false });
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/* ---------- Form binding ---------- */

/**
 * Every slider gets a number box next to its name (in place of the
 * <output data-for="key"> placeholder), so the value can also be typed.
 */
function createNumberFields() {
  for (const out of document.querySelectorAll('output[data-for]')) {
    const key = out.dataset.for;
    const range = document.querySelector(`input[type=range][data-key="${key}"]`);
    const field = document.createElement('span');
    field.className = 'num';
    const input = document.createElement('input');
    Object.assign(input, { type: 'number', min: range.min, max: range.max, step: range.step });
    input.dataset.key = key;
    input.dataset.numberFor = key;
    input.setAttribute('aria-label', `${out.parentElement.firstChild.textContent.trim()} value`);
    const unit = document.createElement('span');
    unit.textContent = key === 'gradAngle' ? '°' : '%';
    field.append(input, unit);
    out.replaceWith(field);
  }
}
createNumberFields();

const inputs = [...document.querySelectorAll('[data-key]')];

/** Value as shown in a number box: rounded to the slider's step. */
function displayValue(el, v) {
  const step = Number(el.step) || 1;
  const decimals = (String(step).split('.')[1] || '').length;
  return Number((Math.round(v / step) * step).toFixed(decimals));
}

function syncInputs(keys) {
  for (const el of inputs) {
    const key = el.dataset.key;
    if (keys && !keys.includes(key)) continue;
    if (el.type === 'checkbox') el.checked = !!state[key];
    else if (el.type === 'number') {
      // Don't rewrite a box while it is being typed in.
      if (el !== document.activeElement) el.value = el.dataset.numberFor ? displayValue(el, state[key]) : state[key];
    } else el.value = state[key];
  }
  document.querySelector('.custom-size').classList.toggle('visible', state.preset === 'custom');
}

function setupForm() {
  const presetSelect = document.getElementById('presetSelect');
  for (const p of PRESETS) presetSelect.add(new Option(p.name, p.id));

  // Gradient presets, in groups; the name shows on hover and under the swatches.
  const swatches = document.getElementById('gradientPresets');
  for (const { group, items } of GRADIENT_GROUPS) {
    const heading = document.createElement('p');
    heading.className = 'swatch-group';
    heading.textContent = group;
    const grid = document.createElement('div');
    grid.className = 'swatch-grid';
    for (const g of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = g.name;
      b.setAttribute('aria-label', `Gradient: ${g.name}`);
      b.style.background = `linear-gradient(90deg, ${g.gradC1}, ${hexToRgba(g.gradC2, Math.max(g.gradA2, 60))}), #fff`;
      b.addEventListener('click', () => {
        const { name, ...values } = g;
        Object.assign(state, values);
        syncInputs();
        saveSettings();
        scheduleRender();
      });
      presetButtons.set(g, b);
      grid.appendChild(b);
    }
    swatches.append(heading, grid);
  }

  // Every UIB colour as a suggestion in the colour pickers (shown by Chromium browsers).
  const list = document.createElement('datalist');
  list.id = 'uib-colours';
  for (const hex of Object.values(UIB)) list.append(new Option('', hex));
  document.body.appendChild(list);
  for (const el of document.querySelectorAll('input[type=color]')) el.setAttribute('list', list.id);

  for (const el of inputs) {
    const evt = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const key = el.dataset.key;
      if (el.type === 'checkbox') state[key] = el.checked;
      else if (el.type === 'number') {
        // While typing, apply only complete values within the allowed range.
        const v = Number(el.value);
        if (el.value === '' || !Number.isFinite(v) || v < Number(el.min) || v > Number(el.max)) return;
        state[key] = v;
      } else if (el.type === 'range') state[key] = Number(el.value);
      else state[key] = el.value;
      if (key === 'textColor') state.textColorMode = 'custom';
      if (key === 'badgeX' || key === 'badgeY') state.badgeAuto = false;
      syncInputs([key, 'textColorMode', 'badgeAuto', 'preset']);
      saveSettings();
      scheduleRender();
    });

    // On Enter or leaving the box: clamp out-of-range or empty values and tidy the box.
    if (el.type === 'number') {
      el.addEventListener('change', () => {
        const key = el.dataset.key;
        const v = Number(el.value);
        state[key] = el.value === '' || !Number.isFinite(v) ? state[key] : clamp(v, Number(el.min), Number(el.max));
        if (key === 'badgeX' || key === 'badgeY') state.badgeAuto = false;
        el.value = el.dataset.numberFor ? displayValue(el, state[key]) : state[key];
        syncInputs([key, 'badgeAuto']);
        saveSettings();
        scheduleRender();
      });
    }
  }

  document.getElementById('downloadBtn').addEventListener('click', downloadCurrent);
  document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all settings to their defaults? The background image is kept.')) return;
    Object.assign(state, DEFAULTS);
    saveSettings();
    syncInputs();
    scheduleRender();
  });
}

/* ---------- Boot ---------- */

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function init() {
  setupForm();
  syncInputs();
  setupImageInteractions();
  await Promise.all([
    ...Object.entries(LOGO_BRANDS).flatMap(([brand, file]) => LOGO_VARIANTS.map(async (v) => {
      (logos[brand] ||= {})[v] = await loadImage(`assets/logos/${file}-${v}.svg`);
    })),
    ...['300', '400', '700'].map((w) => document.fonts.load(`${w} 40px "UIBsans"`).catch(() => {})),
  ]);
  scheduleRender();
  // Re-render once any late font finishes loading.
  document.fonts.ready.then(scheduleRender);
}

init();

// Handy for debugging from the console.
window.bannerEditor = { state, render: scheduleRender, loadImageFile };
