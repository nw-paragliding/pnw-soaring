/* Generated from windgram-ts/ — do not edit by hand. Source of truth: rasp-windgram/rasp/windgram.py + soaring.py */
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/math.ts
var math_exports = {};
__export(math_exports, {
  G: () => G,
  HCRIT_THRESHOLD: () => HCRIT_THRESHOLD,
  MS_TO_FPM: () => MS_TO_FPM,
  M_TO_FT: () => M_TO_FT,
  RHO_CP: () => RHO_CP,
  VHF_COEF: () => VHF_COEF,
  calcHcritFt: () => calcHcritFt,
  calcWstar: () => calcWstar,
  cloudFraction: () => cloudFraction,
  drjackHeightFrac: () => drjackHeightFrac,
  lapseRate: () => lapseRate,
  lclAglFt: () => lclAglFt,
  lclFt: () => lclFt
});
var MS_TO_FPM = 196.85;
var HCRIT_THRESHOLD = 225;
var G = 9.81;
var RHO_CP = 1200;
var VHF_COEF = 245268e-9;
var M_TO_FT = 3.28084;
var ALPHA1 = 0.463;
var ALPHA2 = 0.4549;
var ALPHA3 = 1.3674;
var ALPHA4 = 0.01267;
var ALPHA5 = 0.1126;
function calcWstar(hfx, lh, pblhM, t2K) {
  const vhf = Math.max(hfx + VHF_COEF * t2K * Math.max(lh, 0), 0);
  const arg = G / t2K * pblhM * (vhf / RHO_CP);
  return arg > 0 ? Math.cbrt(arg) : 0;
}
function drjackHeightFrac(thresholdFpm, wstarFpm) {
  const safe = wstarFpm > 0 ? wstarFpm : 1;
  const ratio = thresholdFpm / safe;
  const inner = ALPHA3 * (ALPHA2 - ALPHA1 * ratio) + ALPHA4;
  return Math.sqrt(Math.max(inner, 0)) + ALPHA5;
}
function calcHcritFt(wstarMs, terrainFt, pblhFt) {
  const wstarFpm = wstarMs * MS_TO_FPM;
  if (wstarFpm <= HCRIT_THRESHOLD) return terrainFt;
  const frac = drjackHeightFrac(HCRIT_THRESHOLD, wstarFpm);
  return Math.max(terrainFt + frac * pblhFt, 0);
}
function lclFt(tcSfc, tdSfc, terrainFt) {
  const spread = Math.max(tcSfc - tdSfc, 0);
  return terrainFt + 125 * spread * M_TO_FT;
}
function lclAglFt(tcSfc, tdSfc) {
  return 125 * Math.max(tcSfc - tdSfc, 0) * M_TO_FT;
}
function lapseRate(tcLo, tcHi, ghLoFt, ghHiFt) {
  const dz = Math.max((ghHiFt - ghLoFt) / 1e3, 0.01);
  return (tcHi - tcLo) / dz;
}
function cloudFraction(rhPct) {
  return Math.min(Math.max((rhPct - 75) / 25, 0), 1);
}

// src/contour.ts
function naturalCubicSpline(y) {
  const n = y.length;
  if (n < 3) {
    return (x) => {
      if (n === 1) return y[0];
      const i = Math.max(0, Math.min(n - 2, Math.floor(x)));
      return y[i] + (y[i + 1] - y[i]) * (x - i);
    };
  }
  const m = new Array(n).fill(0);
  const l = new Array(n).fill(0);
  const u = new Array(n).fill(0);
  const z = new Array(n).fill(0);
  l[0] = 1;
  for (let i = 1; i < n - 1; i++) {
    l[i] = 4 - u[i - 1];
    u[i] = 1 / l[i];
    const d = 6 * (y[i + 1] - 2 * y[i] + y[i - 1]);
    z[i] = (d - z[i - 1]) / l[i];
  }
  for (let i = n - 2; i >= 1; i--) m[i] = z[i] - u[i] * m[i + 1];
  return (x) => {
    if (x <= 0) return y[0];
    if (x >= n - 1) return y[n - 1];
    const i = Math.floor(x);
    const t = x - i;
    const a = y[i];
    const b = y[i + 1];
    return a * (1 - t) + b * t + (m[i] * (Math.pow(1 - t, 3) - (1 - t)) + m[i + 1] * (Math.pow(t, 3) - t)) / 6;
  };
}
function makeFineField(rowsByT, y, T, factor = 4) {
  const nFine = Math.max(T * factor, 2);
  const rows = [];
  for (let k = 0; k < rowsByT.length; k++) {
    const s = naturalCubicSpline(rowsByT[k]);
    const out = new Array(nFine);
    for (let j = 0; j < nFine; j++) out[j] = s(j / (nFine - 1) * (T - 1));
    rows.push(out);
  }
  return { rows, nFine, T, y };
}
function locateRow(yArr, z) {
  const n = yArr.length;
  if (z <= yArr[0]) return [0, 0];
  if (z >= yArr[n - 1]) return [n - 2, 1];
  let k = 0;
  while (k < n - 2 && yArr[k + 1] < z) k++;
  const w = (z - yArr[k]) / (yArr[k + 1] - yArr[k]);
  return [k, w];
}
function sampleField(f, t, z) {
  const jf = Math.max(0, Math.min(f.T - 1, t)) / (f.T - 1) * (f.nFine - 1);
  const j = Math.max(0, Math.min(f.nFine - 2, Math.floor(jf)));
  const wt = jf - j;
  const [k, wz] = locateRow(f.y, z);
  const v00 = f.rows[k][j];
  const v01 = f.rows[k][j + 1];
  const v10 = f.rows[k + 1][j];
  const v11 = f.rows[k + 1][j + 1];
  const lo = v00 * (1 - wt) + v01 * wt;
  const hi = v10 * (1 - wt) + v11 * wt;
  return lo * (1 - wz) + hi * wz;
}
function isoSegments(f, level) {
  const segs = [];
  const { rows, nFine, T, y } = f;
  const tAt = (j) => j / (nFine - 1) * (T - 1);
  for (let k = 0; k < y.length - 1; k++) {
    for (let j = 0; j < nFine - 1; j++) {
      const vbl = rows[k][j];
      const vbr = rows[k][j + 1];
      const vtr = rows[k + 1][j + 1];
      const vtl = rows[k + 1][j];
      const tL = tAt(j);
      const tR = tAt(j + 1);
      const zB = y[k];
      const zT = y[k + 1];
      let idx = 0;
      if (vbl > level) idx |= 1;
      if (vbr > level) idx |= 2;
      if (vtr > level) idx |= 4;
      if (vtl > level) idx |= 8;
      if (idx === 0 || idx === 15) continue;
      const lerp = (a, b) => (level - a) / (b - a);
      const bottom = () => [tL + (tR - tL) * lerp(vbl, vbr), zB];
      const right = () => [tR, zB + (zT - zB) * lerp(vbr, vtr)];
      const top = () => [tL + (tR - tL) * lerp(vtl, vtr), zT];
      const left = () => [tL, zB + (zT - zB) * lerp(vbl, vtl)];
      const push = (a, b) => segs.push([a[0], a[1], b[0], b[1]]);
      switch (idx) {
        case 1:
        case 14:
          push(left(), bottom());
          break;
        case 2:
        case 13:
          push(bottom(), right());
          break;
        case 3:
        case 12:
          push(left(), right());
          break;
        case 4:
        case 11:
          push(right(), top());
          break;
        case 6:
        case 9:
          push(bottom(), top());
          break;
        case 7:
        case 8:
          push(left(), top());
          break;
        case 5:
          push(left(), bottom());
          push(right(), top());
          break;
        case 10:
          push(bottom(), right());
          push(left(), top());
          break;
      }
    }
  }
  return segs;
}

// src/barbs.ts
function drawBarb(ctx, x, y, uKt, vKt, style = {}) {
  const length = style.length ?? 22;
  ctx.save();
  ctx.strokeStyle = style.color ?? "#fff";
  ctx.fillStyle = style.color ?? "#fff";
  ctx.lineWidth = style.lineWidth ?? 1;
  ctx.lineJoin = "round";
  const s = Math.hypot(uKt, vKt);
  if (s < 2.5) {
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const nx = uKt / s;
  const ny = vKt / s;
  const dx = -nx;
  const dy = ny;
  const ex = x + dx * length;
  const ey = y + dy * length;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  const px = -dy;
  const py = dx;
  let rem = Math.round(s / 5) * 5;
  let flags = Math.floor(rem / 50);
  rem -= flags * 50;
  let fulls = Math.floor(rem / 10);
  rem -= fulls * 10;
  const halves = Math.floor(rem / 5);
  const barbLen = 9;
  const halfLen = 4.5;
  const spacing = 4;
  let pos = 0;
  const at = (d) => [ex - dx * d, ey - dy * d];
  for (let i = 0; i < flags; i++) {
    const [bx, by] = at(pos);
    const [b2x, b2y] = at(pos + spacing * 1.6);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * barbLen, by + py * barbLen);
    ctx.lineTo(b2x, b2y);
    ctx.closePath();
    ctx.fill();
    pos += spacing * 1.8;
  }
  if (flags > 0) pos += spacing * 0.6;
  for (let i = 0; i < fulls; i++) {
    const [bx, by] = at(pos);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * barbLen, by + py * barbLen);
    ctx.stroke();
    pos += spacing;
  }
  if (halves > 0) {
    if (fulls === 0 && flags === 0) pos += spacing;
    const [bx, by] = at(pos);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * halfLen, by + py * halfLen);
    ctx.stroke();
  }
  ctx.restore();
}

// src/render.ts
var BG_COLOR = [128, 128, 230];
var LAPSE_LEVELS = [-3, -2.5, -2, -1.5, -1.2, -0.5, 0, 0.5];
var LAPSE_COLORS = [
  [255, 61, 61],
  // < -3 red (superadiabatic)
  [255, 153, 0],
  // orange
  [255, 186, 255],
  // pink
  [204, 191, 255],
  // purple
  [250, 240, 230],
  // cream
  BG_COLOR,
  // background
  BG_COLOR,
  // background
  [204, 204, 204],
  // grey (weak inversion)
  [153, 153, 153]
  // dark grey (strong inversion)
];
function lapseColor(v) {
  if (!isFinite(v)) return BG_COLOR;
  if (v < LAPSE_LEVELS[0]) return LAPSE_COLORS[0];
  for (let i = 0; i < LAPSE_LEVELS.length - 1; i++) {
    if (v < LAPSE_LEVELS[i + 1]) return LAPSE_COLORS[i + 1];
  }
  return LAPSE_COLORS[LAPSE_COLORS.length - 1];
}
function drawWing(ctx, cx, cy, s) {
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
var finiteMax = (a) => {
  let m = -Infinity;
  for (const v of a) if (isFinite(v) && v > m) m = v;
  return m;
};
function renderWindgram(canvas, data, options = {}) {
  const utcOffset = options.utcOffset ?? -7;
  const startHour = options.startHour ?? 8;
  const headroomFt = options.headroomFt ?? 4e3;
  const ceilingCapFt = options.ceilingCapFt ?? 18e3;
  const localAll = data.hoursUtc.map((h) => ((h + utcOffset) % 24 + 24) % 24);
  let keep = localAll.map((h) => h >= startHour);
  if (!keep.some(Boolean)) keep = keep.map(() => true);
  const ti = [];
  keep.forEach((k, i) => k && ti.push(i));
  const T = ti.length;
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
  const zB = isFinite(terrainFt) ? terrainFt : 0;
  const pblTops = pblhFt.map((p) => zB + (isFinite(p) ? p : NaN));
  const maxPblTop = finiteMax(pblTops);
  let zTop = isFinite(maxPblTop) ? maxPblTop + headroomFt : zB + 12e3;
  zTop = Math.min(zTop, ceilingCapFt);
  zTop = Math.max(zTop, zB + 3e3);
  zTop = Math.round(zTop / 500) * 500;
  const W = +(canvas.dataset.wgW || canvas.width) || 540;
  const H = +(canvas.dataset.wgH || canvas.height) || 430;
  canvas.dataset.wgW = String(W);
  canvas.dataset.wgH = String(H);
  const dpr = options.dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const m = { l: 48, r: 14, t: 30, b: 28 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const xT = (t) => m.l + (T < 2 ? pw / 2 : t / (T - 1) * pw);
  const yZ = (z) => m.t + (1 - (z - zB) / (zTop - zB)) * ph;
  ctx.fillStyle = `rgb(${BG_COLOR[0]},${BG_COLOR[1]},${BG_COLOR[2]})`;
  ctx.fillRect(0, 0, W, H);
  if (T === 0 || L < 2) {
    ctx.fillStyle = "#fff";
    ctx.font = "13px 'IBM Plex Mono',monospace";
    ctx.textAlign = "center";
    ctx.fillText("no usable column data", W / 2, H / 2);
    return;
  }
  const gh0 = gh[0];
  const fullY = gh0.slice();
  const midY = [];
  for (let k = 0; k < L - 1; k++) midY.push(0.5 * (gh0[k] + gh0[k + 1]));
  const lapseRows = [];
  for (let k = 0; k < L - 1; k++) {
    lapseRows.push(ti.map((_, t) => lapseRate(tc[t][k], tc[t][k + 1], gh[t][k], gh[t][k + 1])));
  }
  const tcfRows = [];
  const rhRows = [];
  for (let k = 0; k < L; k++) {
    tcfRows.push(ti.map((_, t) => tc[t][k] * 9 / 5 + 32));
    rhRows.push(ti.map((_, t) => rh[t][k]));
  }
  const lapseField = makeFineField(lapseRows, midY, T);
  const tcfField = makeFineField(tcfRows, fullY, T);
  const rhField = makeFineField(rhRows, fullY, T);
  drawBackground(ctx, dpr, m, pw, ph, zB, zTop, T, lapseField, rhField);
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
    labelContour(ctx, segs, xT, yZ, `${lev}\xB0F`, "#0a1a4a", m);
  }
  const freeze = isoSegments(tcfField, 32);
  if (freeze.length) {
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(0,229,255,0.9)";
    strokeSegs(ctx, freeze, xT, yZ);
    labelContour(ctx, freeze, xT, yZ, "32\xB0F", "#06384a", m);
  }
  ctx.restore();
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
        lineWidth: 0.9
      });
    }
  }
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.l, m.t, pw, ph);
  ctx.clip();
  ctx.textAlign = "center";
  for (let t = 0; t < T; t++) {
    const lcl = lclFt(tc[t][0], td[t][0], terrainFt);
    if (isFinite(lcl) && lcl > zB && lcl < zTop) {
      const x = xT(t);
      const y = yZ(lcl);
      ctx.font = "30px sans-serif";
      ctx.fillStyle = "rgba(90,90,90,0.5)";
      ctx.fillText("\u2601", x + 1, y - 1);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText("\u2601", x, y);
    }
  }
  for (let t = 0; t < T; t++) {
    const lcl = lclFt(tc[t][0], td[t][0], terrainFt);
    const hcrit = calcHcritFt(wstar[t], terrainFt, pblhFt[t]);
    const hglider = Math.min(hcrit, lcl);
    if (isFinite(hglider) && hglider > zB && hglider < zTop) {
      drawWing(ctx, xT(t), yZ(hglider), 9);
    }
  }
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.font = "10px 'IBM Plex Mono',monospace";
  const step = zTop - zB > 9e3 ? 2e3 : 1e3;
  const yTer = yZ(zB);
  ctx.textAlign = "right";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  for (let z = Math.ceil(zB / step) * step; z <= zTop; z += step) {
    const y = yZ(z);
    ctx.beginPath();
    ctx.moveTo(m.l, y);
    ctx.lineTo(m.l + pw, y);
    ctx.stroke();
    if (yTer - y < 13) continue;
    ctx.fillStyle = "#fff";
    ctx.fillText(`${(z / 1e3).toFixed(z % 1e3 ? 1 : 0)}k`, m.l - 5, y + 3);
  }
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
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  for (let t = 0; t < T; t++) {
    let h = ((hours[t] + utcOffset) % 24 + 24) % 24;
    const ap = h < 12 ? "a" : "p";
    h = h % 12;
    if (h === 0) h = 12;
    ctx.fillText(`${h}${ap}`, xT(t), H - 9);
  }
  ctx.fillStyle = "#ffe000";
  ctx.font = "bold 12px 'IBM Plex Mono',monospace";
  ctx.textAlign = "center";
  for (let t = 0; t < T; t++) {
    ctx.fillText(wstar[t].toFixed(1), xT(t), m.t - 8);
  }
  ctx.textAlign = "left";
  ctx.font = "bold 8px 'IBM Plex Mono',monospace";
  ctx.fillText("Climb", 3, m.t - 15);
  ctx.fillText("m/s", 3, m.t - 6);
}
function drawBackground(ctx, dpr, m, pw, ph, zB, zTop, T, lapse, rhField) {
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
      const t = ii / (pwD - 1 || 1) * (T - 1);
      let r, g, b;
      if (z >= midYmin && z <= midYmax) {
        [r, g, b] = lapseColor(sampleField(lapse, t, z));
      } else {
        [r, g, b] = BG_COLOR;
      }
      const cf = z >= rhField.y[0] && z <= rhField.y[rhField.y.length - 1] ? cloudFraction(sampleField(rhField, t, z)) : 0;
      if (cf >= 0.1 && hatchHit(ii, jj, cf)) {
        r = r + 255 >> 1;
        g = g + 255 >> 1;
        b = b + 255 >> 1;
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
function hatchHit(x, y, cf) {
  if (cf < 0.3) return x % 6 === 0 && y % 6 === 0;
  if (cf < 0.5) return (x + y) % 7 === 0;
  if (cf < 0.7) return (x + y) % 7 === 0 || (x - y + 7e3) % 7 === 0;
  return (x + y) % 4 === 0 || (x - y + 8e3) % 4 === 0;
}
function strokeSegs(ctx, segs, xT, yZ) {
  ctx.beginPath();
  for (const s of segs) {
    ctx.moveTo(xT(s[0]), yZ(s[1]));
    ctx.lineTo(xT(s[2]), yZ(s[3]));
  }
  ctx.stroke();
}
function labelContour(ctx, segs, xT, yZ, text, color, m) {
  let best = null;
  let bestKey = Infinity;
  const cx = m.l;
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
export {
  math_exports as math,
  renderWindgram
};
