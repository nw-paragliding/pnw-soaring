/**
 * Contour helpers — the canvas analogue of matplotlib's contourf / contour as
 * used by windgram.py. The Python smooths every field along the *time* axis
 * with a cubic spline (scipy interp1d, 4× oversampling) before contouring; we
 * reproduce that and then either band-fill (contourf) or trace iso-lines
 * (contour) over the oversampled grid.
 */

export interface FineField {
  /** rows[k][j] = value at row k, oversampled time column j. */
  rows: number[][];
  /** number of oversampled time columns. */
  nFine: number;
  /** original timestep count (time spans 0 … T-1). */
  T: number;
  /** y[k] = vertical coordinate (ft ASL) of row k, strictly increasing. */
  y: number[];
}

/**
 * Natural cubic spline through (0,y0),(1,y1),… Returns a sampler s(x) for
 * x ∈ [0, n-1]; a close stand-in for scipy's `interp1d(kind="cubic")`.
 */
export function naturalCubicSpline(y: number[]): (x: number) => number {
  const n = y.length;
  if (n < 3) {
    // Linear fallback for 1–2 points.
    return (x: number) => {
      if (n === 1) return y[0];
      const i = Math.max(0, Math.min(n - 2, Math.floor(x)));
      return y[i] + (y[i + 1] - y[i]) * (x - i);
    };
  }
  // Solve for second derivatives (m) with natural boundary (m0 = m_{n-1} = 0).
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
  return (x: number) => {
    if (x <= 0) return y[0];
    if (x >= n - 1) return y[n - 1];
    const i = Math.floor(x);
    const t = x - i;
    const a = y[i];
    const b = y[i + 1];
    return (
      a * (1 - t) +
      b * t +
      ((m[i] * (Math.pow(1 - t, 3) - (1 - t)) + m[i + 1] * (Math.pow(t, 3) - t)) / 6)
    );
  };
}

/**
 * Build an oversampled FineField from rows[k][t] (length T per row) by cubic
 * time-smoothing each row, sampled at T*factor evenly spaced columns over
 * [0, T-1] — matching windgram.py's `t_fine = linspace(0, ntimes-1, ntimes*4)`.
 */
export function makeFineField(
  rowsByT: number[][],
  y: number[],
  T: number,
  factor = 4,
): FineField {
  const nFine = Math.max(T * factor, 2);
  const rows: number[][] = [];
  for (let k = 0; k < rowsByT.length; k++) {
    const s = naturalCubicSpline(rowsByT[k]);
    const out = new Array(nFine);
    for (let j = 0; j < nFine; j++) out[j] = s((j / (nFine - 1)) * (T - 1));
    rows.push(out);
  }
  return { rows, nFine, T, y };
}

/** Locate row bracket [k, k+1] and weight w for height z within field.y. */
function locateRow(yArr: number[], z: number): [number, number] {
  const n = yArr.length;
  if (z <= yArr[0]) return [0, 0];
  if (z >= yArr[n - 1]) return [n - 2, 1];
  // y is short (≤ ~22) — linear scan is fine.
  let k = 0;
  while (k < n - 2 && yArr[k + 1] < z) k++;
  const w = (z - yArr[k]) / (yArr[k + 1] - yArr[k]);
  return [k, w];
}

/** Bilinear sample of a FineField at continuous time t∈[0,T-1] and height z. */
export function sampleField(f: FineField, t: number, z: number): number {
  const jf = (Math.max(0, Math.min(f.T - 1, t)) / (f.T - 1)) * (f.nFine - 1);
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

/**
 * Marching-squares iso-lines for a single level over the oversampled grid.
 * Returns segments in (time, height) data coordinates: [[t0,z0,t1,z1], …].
 * Saddle ambiguity is ignored — adequate for stroking thin contour lines.
 */
export function isoSegments(f: FineField, level: number): number[][] {
  const segs: number[][] = [];
  const { rows, nFine, T, y } = f;
  const tAt = (j: number) => (j / (nFine - 1)) * (T - 1);
  for (let k = 0; k < y.length - 1; k++) {
    for (let j = 0; j < nFine - 1; j++) {
      // Corners: bl, br, tr, tl
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
      const lerp = (a: number, b: number) => (level - a) / (b - a);
      // Edge crossing points (data coords)
      const bottom = (): [number, number] => [tL + (tR - tL) * lerp(vbl, vbr), zB];
      const right = (): [number, number] => [tR, zB + (zT - zB) * lerp(vbr, vtr)];
      const top = (): [number, number] => [tL + (tR - tL) * lerp(vtl, vtr), zT];
      const left = (): [number, number] => [tL, zB + (zT - zB) * lerp(vbl, vtl)];
      const push = (a: [number, number], b: [number, number]) =>
        segs.push([a[0], a[1], b[0], b[1]]);
      switch (idx) {
        case 1: case 14: push(left(), bottom()); break;
        case 2: case 13: push(bottom(), right()); break;
        case 3: case 12: push(left(), right()); break;
        case 4: case 11: push(right(), top()); break;
        case 6: case 9: push(bottom(), top()); break;
        case 7: case 8: push(left(), top()); break;
        case 5: push(left(), bottom()); push(right(), top()); break;
        case 10: push(bottom(), right()); push(left(), top()); break;
      }
    }
  }
  return segs;
}
