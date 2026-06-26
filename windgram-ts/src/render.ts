/**
 * Canvas windgram renderer — a faithful port of rasp-windgram's
 * render_windgram() (windgram.py), drawn on a **height (ft ASL)** vertical axis
 * instead of the Python pressure axis (the browser cube carries geopotential
 * height, not 3-D pressure). Everything else — lapse-rate filled background,
 * cloud hatching from RH, °F isotherms + 32 °F freezing line, speed-coloured
 * wind barbs, paraglider ceiling markers at min(hcrit, LCL), LCL cloud glyphs,
 * w* climb labels — mirrors the Python drawing sequence and constants.
 */
import type { WindgramData, WindgramOptions } from "./types.js";
import {
  calcWstar,
  calcHcritFt,
  lclFt as lclFtFn,
  lapseRate,
  cloudFraction,
  M_TO_FT,
} from "./math.js";
import { makeFineField, sampleField, isoSegments, type FineField } from "./contour.js";
import { drawBarb } from "./barbs.js";

// Lapse-rate background (windgram.py BG_COLOR / LAPSE_LEVELS / LAPSE_COLORS).
const BG_COLOR: [number, number, number] = [128, 128, 230]; // (0.5,0.5,0.9)
const LAPSE_LEVELS = [-3.0, -2.5, -2.0, -1.5, -1.2, -0.5, 0.0, 0.5];
const LAPSE_COLORS: [number, number, number][] = [
  [255, 61, 61], // < -3 red (superadiabatic)
  [255, 153, 0], // orange
  [255, 186, 255], // pink
  [204, 191, 255], // purple
  [250, 240, 230], // cream
  BG_COLOR, // background
  BG_COLOR, // background
  [204, 204, 204], // grey (weak inversion)
  [153, 153, 153], // dark grey (strong inversion)
];

function lapseColor(v: number): [number, number, number] {
  if (!isFinite(v)) return BG_COLOR;
  if (v < LAPSE_LEVELS[0]) return LAPSE_COLORS[0];
  for (let i = 0; i < LAPSE_LEVELS.length - 1; i++) {
    if (v < LAPSE_LEVELS[i + 1]) return LAPSE_COLORS[i + 1];
  }
  return LAPSE_COLORS[LAPSE_COLORS.length - 1];
}

// Paraglider wing crescent — the _WING_VERTS path from windgram.py (y negated
// for canvas). Drawn filled blue with a dark-blue edge.
function drawWing(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx + -1.2 * s, cy - -0.1 * s);
  ctx.bezierCurveTo(cx + -0.6 * s, cy - 0.7 * s, cx + 0.6 * s, cy - 0.7 * s, cx + 1.2 * s, cy - -0.1 * s);
  ctx.bezierCurveTo(cx + 0.6 * s, cy - 0.25 * s, cx + -0.6 * s, cy - 0.25 * s, cx + -1.2 * s, cy - -0.1 * s);
  ctx.closePath();
  ctx.fillStyle = "#1f4ed8";
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "#0b2a8a";
  ctx.stroke();
  ctx.restore();
}

const finiteMax = (a: number[]) => {
  let m = -Infinity;
  for (const v of a) if (isFinite(v) && v > m) m = v;
  return m;
};

export function renderWindgram(
  canvas: HTMLCanvasElement,
  data: WindgramData,
  options: WindgramOptions = {},
): void {
  const utcOffset = options.utcOffset ?? -7;
  const startHour = options.startHour ?? 8;
  const headroomFt = options.headroomFt ?? 4000;
  const ceilingCapFt = options.ceilingCapFt ?? 18000;

  // --- filter to local hours >= startHour (skip pre-dawn), like windgram.py ---
  const localAll = data.hoursUtc.map((h) => ((h + utcOffset) % 24 + 24) % 24);
  let keep = localAll.map((h) => h >= startHour);
  if (!keep.some(Boolean)) keep = keep.map(() => true);
  const ti: number[] = [];
  keep.forEach((k, i) => k && ti.push(i));
  const T = ti.length;

  // Sliced views
  const hours = ti.map((i) => data.hoursUtc[i]);
  const gh = ti.map((i) => data.ghFt[i]);
  const tc = ti.map((i) => data.tc[i]);
  const td = ti.map((i) => data.td[i]);
  const rh = ti.map((i) => data.rh[i]);
  const u = ti.map((i) => data.uKt[i]);
  const v = ti.map((i) => data.vKt[i]);
  const pblhFt = ti.map((i) => data.pblhM[i] * M_TO_FT);
  const wstar = ti.map((i) => calcWstar(data.hfx[i], data.lh[i], data.pblhM[i], data.t2K[i]));
  const terrainFt = data.terrainFt;
  const L = gh[0]?.length ?? 0;

  // --- chart vertical extent (height axis port of the p_top logic) ---
  const zB = isFinite(terrainFt) ? terrainFt : 0;
  const pblTops = pblhFt.map((p) => zB + (isFinite(p) ? p : NaN));
  const maxPblTop = finiteMax(pblTops);
  let zTop = isFinite(maxPblTop) ? maxPblTop + headroomFt : zB + 12000;
  zTop = Math.min(zTop, ceilingCapFt);
  zTop = Math.max(zTop, zB + 3000);
  zTop = Math.round(zTop / 500) * 500;

  // --- canvas + HiDPI setup (logical size persisted so re-renders are stable) ---
  const W = +(canvas.dataset.wgW || canvas.width) || 540;
  const H = +(canvas.dataset.wgH || canvas.height) || 430;
  canvas.dataset.wgW = String(W);
  canvas.dataset.wgH = String(H);
  const dpr = options.dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  // Leave CSS sizing to the page (#wg{width:100%}) — the device-pixel backing
  // store above keeps it crisp while the element scales to its container.
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const m = { l: 48, r: 14, t: 52, b: 28 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const xT = (t: number) => m.l + (T < 2 ? pw / 2 : (t / (T - 1)) * pw);
  const yZ = (z: number) => m.t + (1 - (z - zB) / (zTop - zB)) * ph;

  // Whole-figure background
  ctx.fillStyle = `rgb(${BG_COLOR[0]},${BG_COLOR[1]},${BG_COLOR[2]})`;
  ctx.fillRect(0, 0, W, H);

  if (T === 0 || L < 2) {
    ctx.fillStyle = "#fff";
    ctx.font = "13px 'IBM Plex Mono',monospace";
    ctx.textAlign = "center";
    ctx.fillText("no usable column data", W / 2, H / 2);
    return;
  }

  // Level heights from the first timestep (windgram.py fixes Y on t=0 levels).
  const gh0 = gh[0];
  const fullY = gh0.slice();
  const midY: number[] = [];
  for (let k = 0; k < L - 1; k++) midY.push(0.5 * (gh0[k] + gh0[k + 1]));

  // --- field grids (rows by level over time) ---
  const lapseRows: number[][] = [];
  for (let k = 0; k < L - 1; k++) {
    lapseRows.push(ti.map((_, t) => lapseRate(tc[t][k], tc[t][k + 1], gh[t][k], gh[t][k + 1])));
  }
  const tcfRows: number[][] = [];
  const rhRows: number[][] = [];
  for (let k = 0; k < L; k++) {
    tcfRows.push(ti.map((_, t) => tc[t][k] * 9 / 5 + 32));
    rhRows.push(ti.map((_, t) => rh[t][k]));
  }
  const lapseField = makeFineField(lapseRows, midY, T);
  const tcfField: FineField = makeFineField(tcfRows, fullY, T);
  const rhField: FineField = makeFineField(rhRows, fullY, T);

  // --- background raster: lapse bands + cloud hatch (one device-pixel pass) ---
  drawBackground(ctx, dpr, m, pw, ph, zB, zTop, T, lapseField, rhField);

  // --- isotherms (°F lines, white) + clabel ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.l, m.t, pw, ph);
  ctx.clip();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  for (let lev = -40; lev < 120; lev += 10) {
    const segs = isoSegments(tcfField, lev);
    if (!segs.length) continue;
    strokeSegs(ctx, segs, xT, yZ);
    labelContour(ctx, segs, xT, yZ, `${lev}°F`, "#0a1a4a", m);
  }
  // Freezing level — prominent 32 °F line (cyan)
  const freeze = isoSegments(tcfField, 32);
  if (freeze.length) {
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(0,229,255,0.9)";
    strokeSegs(ctx, freeze, xT, yZ);
    labelContour(ctx, freeze, xT, yZ, "32°F", "#06384a", m);
  }
  ctx.restore();

  // --- wind barbs (green < 9 kt, white otherwise) at every level in view ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.l, m.t - 4, pw, ph + 4);
  ctx.clip();
  for (let t = 0; t < T; t++) {
    for (let k = 0; k < L; k++) {
      const z = gh[t][k];
      if (!isFinite(z) || z < zB || z > zTop) continue;
      const spd = Math.hypot(u[t][k], v[t][k]);
      drawBarb(ctx, xT(t), yZ(z), u[t][k], v[t][k], {
        color: spd < 9 ? "#00ff55" : "#ffffff",
        length: 20,
        lineWidth: 0.9,
      });
    }
  }
  ctx.restore();

  // --- LCL cloud glyphs + paraglider ceiling markers ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.l, m.t, pw, ph);
  ctx.clip();
  ctx.textAlign = "center";
  for (let t = 0; t < T; t++) {
    const lcl = lclFtFn(tc[t][0], td[t][0], terrainFt);
    if (isFinite(lcl) && lcl > zB && lcl < zTop) {
      const x = xT(t);
      const y = yZ(lcl);
      ctx.font = "30px sans-serif";
      ctx.fillStyle = "rgba(90,90,90,0.5)";
      ctx.fillText("☁", x + 1, y - 1);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText("☁", x, y);
    }
  }
  for (let t = 0; t < T; t++) {
    const lcl = lclFtFn(tc[t][0], td[t][0], terrainFt);
    const hcrit = calcHcritFt(wstar[t], terrainFt, pblhFt[t]);
    const hglider = Math.min(hcrit, lcl);
    if (isFinite(hglider) && hglider > zB && hglider < zTop) {
      drawWing(ctx, xT(t), yZ(hglider), 9);
    }
  }
  ctx.restore();

  // --- axes ---
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.font = "10px 'IBM Plex Mono',monospace";

  // Left: altitude (ft ASL)
  const step = zTop - zB > 9000 ? 2000 : 1000;
  ctx.textAlign = "right";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  for (let z = Math.ceil(zB / step) * step; z <= zTop; z += step) {
    const y = yZ(z);
    ctx.beginPath();
    ctx.moveTo(m.l, y);
    ctx.lineTo(m.l + pw, y);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText(`${(z / 1000).toFixed(z % 1000 ? 1 : 0)}k`, m.l - 5, y + 3);
  }
  // terrain baseline
  const yTer = yZ(zB);
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(m.l, yTer);
  ctx.lineTo(m.l + pw, yTer);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = "#ffe9b0";
  ctx.fillText(`${Math.round(zB)}'`, m.l - 5, Math.min(yTer + 3, m.t + ph));

  ctx.save();
  ctx.translate(12, m.t + ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "#dfe7f5";
  ctx.fillText("Altitude (ft MSL)", 0, 0);
  ctx.restore();

  // Bottom: local time labels (12-hour am/pm)
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  for (let t = 0; t < T; t++) {
    let h = ((hours[t] + utcOffset) % 24 + 24) % 24;
    const ap = h < 12 ? "a" : "p";
    h = h % 12;
    if (h === 0) h = 12;
    ctx.fillText(`${h}${ap}`, xT(t), H - 9);
  }

  // --- w* climb labels (yellow row above the plot) ---
  ctx.fillStyle = "#ffe000";
  ctx.font = "bold 12px 'IBM Plex Mono',monospace";
  ctx.textAlign = "center";
  for (let t = 0; t < T; t++) {
    ctx.fillText(wstar[t].toFixed(1), xT(t), m.t - 8);
  }
  // Caption stacked on two lines (windgram.py "Climb\nm/s") so it tucks into
  // the top-left corner above the altitude axis without hitting the first value.
  ctx.textAlign = "left";
  ctx.font = "bold 8px 'IBM Plex Mono',monospace";
  ctx.fillText("Climb", 3, m.t - 15);
  ctx.fillText("m/s", 3, m.t - 6);

  // --- title ---
  if (options.title) {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px 'Bricolage Grotesque','IBM Plex Mono',sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(options.title, W / 2, 18);
  }
}

// Device-pixel raster of the lapse-rate bands with graduated cloud hatching.
function drawBackground(
  ctx: CanvasRenderingContext2D,
  dpr: number,
  m: { l: number; t: number },
  pw: number,
  ph: number,
  zB: number,
  zTop: number,
  T: number,
  lapse: FineField,
  rhField: FineField,
) {
  const pwD = Math.max(1, Math.round(pw * dpr));
  const phD = Math.max(1, Math.round(ph * dpr));
  const img = ctx.createImageData(pwD, phD);
  const px = img.data;
  const midYmin = lapse.y[0];
  const midYmax = lapse.y[lapse.y.length - 1];
  for (let jj = 0; jj < phD; jj++) {
    const frac = jj / (phD - 1 || 1);
    const z = zB + (1 - frac) * (zTop - zB);
    for (let ii = 0; ii < pwD; ii++) {
      const t = (ii / (pwD - 1 || 1)) * (T - 1);
      let r: number, g: number, b: number;
      if (z >= midYmin && z <= midYmax) {
        [r, g, b] = lapseColor(sampleField(lapse, t, z));
      } else {
        [r, g, b] = BG_COLOR;
      }
      // cloud hatch from RH
      const cf = z >= rhField.y[0] && z <= rhField.y[rhField.y.length - 1]
        ? cloudFraction(sampleField(rhField, t, z))
        : 0;
      if (cf >= 0.1 && hatchHit(ii, jj, cf)) {
        r = (r + 255) >> 1;
        g = (g + 255) >> 1;
        b = (b + 255) >> 1;
      }
      const o = (jj * pwD + ii) * 4;
      px[o] = r;
      px[o + 1] = g;
      px[o + 2] = b;
      px[o + 3] = 255;
    }
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.putImageData(img, Math.round(m.l * dpr), Math.round(m.t * dpr));
  ctx.restore();
}

// Graduated cross-hatch matching windgram.py's [".","//","x","xx"] bands.
function hatchHit(x: number, y: number, cf: number): boolean {
  if (cf < 0.3) return x % 6 === 0 && y % 6 === 0; // "." dots
  if (cf < 0.5) return (x + y) % 7 === 0; // "/" single diagonal
  if (cf < 0.7) return (x + y) % 7 === 0 || (x - y + 7000) % 7 === 0; // "x" cross
  return (x + y) % 4 === 0 || (x - y + 8000) % 4 === 0; // "xx" dense cross
}

function strokeSegs(
  ctx: CanvasRenderingContext2D,
  segs: number[][],
  xT: (t: number) => number,
  yZ: (z: number) => number,
) {
  ctx.beginPath();
  for (const s of segs) {
    ctx.moveTo(xT(s[0]), yZ(s[1]));
    ctx.lineTo(xT(s[2]), yZ(s[3]));
  }
  ctx.stroke();
}

// Inline-label a contour near the chart centre (matplotlib clabel analogue).
function labelContour(
  ctx: CanvasRenderingContext2D,
  segs: number[][],
  xT: (t: number) => number,
  yZ: (z: number) => number,
  text: string,
  color: string,
  m: { l: number; t: number },
) {
  // Pick the segment whose midpoint is closest to the horizontal centre.
  let best: number[] | null = null;
  let bestKey = Infinity;
  const cx = m.l; // bias labels toward the left third for legibility
  for (const s of segs) {
    const mx = xT((s[0] + s[2]) / 2);
    const key = Math.abs(mx - (cx + 90));
    if (key < bestKey) {
      bestKey = key;
      best = s;
    }
  }
  if (!best) return;
  const x = xT((best[0] + best[2]) / 2);
  const y = yZ((best[1] + best[3]) / 2);
  ctx.save();
  ctx.font = "9px 'IBM Plex Mono',monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(text).width + 4;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(x - w / 2, y - 6, w, 12);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
  ctx.textBaseline = "alphabetic";
}
