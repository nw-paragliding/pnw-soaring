/**
 * Wind barbs — canvas port of matplotlib's ax.barbs() with
 * barb_increments={half:5, full:10, flag:50}, as used by windgram.py.
 *
 * Screen convention: east = +x, north = −y (up). The shaft points *upwind*
 * (the direction the wind blows from) with the half/full barbs and 50-kt
 * pennants stacked from the tail inward — standard station-model layout.
 */

export interface BarbStyle {
  length?: number; // shaft length in px (Python length≈6 → ~22px here)
  color?: string;
  lineWidth?: number;
}

export function drawBarb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  uKt: number,
  vKt: number,
  style: BarbStyle = {},
): void {
  const length = style.length ?? 22;
  ctx.save();
  ctx.strokeStyle = style.color ?? "#fff";
  ctx.fillStyle = style.color ?? "#fff";
  ctx.lineWidth = style.lineWidth ?? 1;
  ctx.lineJoin = "round";

  const s = Math.hypot(uKt, vKt);
  if (s < 2.5) {
    // Calm — small open circle (matplotlib draws a ring for sub-half speeds).
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const nx = uKt / s;
  const ny = vKt / s;
  const dx = -nx; // upwind, screen x
  const dy = ny; // upwind, screen y (north flips)
  const ex = x + dx * length; // tail (barbs live here)
  const ey = y + dy * length;

  // Shaft
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  // Perpendicular barb direction (one side only)
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
  const spacing = 4.0;
  let pos = 0; // distance from tail toward the station point

  const at = (d: number): [number, number] => [ex - dx * d, ey - dy * d];

  // 50-kt pennants (filled triangles)
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

  // 10-kt full barbs
  for (let i = 0; i < fulls; i++) {
    const [bx, by] = at(pos);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * barbLen, by + py * barbLen);
    ctx.stroke();
    pos += spacing;
  }

  // 5-kt half barb — sits inset from the tail if it's the only feather
  if (halves > 0) {
    if (fulls === 0 && flags === 0) pos += spacing; // don't hang off the very tail
    const [bx, by] = at(pos);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * halfLen, by + py * halfLen);
    ctx.stroke();
  }

  ctx.restore();
}
