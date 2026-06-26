/**
 * Data column for a single grid point, mirroring the `d` dict that
 * windgram.py's render_windgram() consumes (see _extract_site_data /
 * export_cube.py). Profile arrays are indexed [time][level], level 0 = surface.
 * Surface arrays are indexed [time].
 *
 * Units match the forecast cube exactly:
 *   ghFt   geopotential height, ft ASL   (cube gh_ft)
 *   tc     temperature, °C                (cube tc)
 *   td     dewpoint, °C                   (cube td)
 *   rh     relative humidity, %           (cube rh)
 *   uKt/vKt earth-relative wind, kt       (cube u_kt / v_kt)
 *   pblhM  PBL height, m AGL              (cube pblh_m)
 *   hfx    sensible heat flux, W/m²       (cube hfx)
 *   lh     latent heat flux, W/m²         (cube lh)
 *   t2K    2 m temperature, K             (cube t2_k)
 *   sfcpMb surface pressure, mb           (cube sfcp_mb)
 *   terrainFt terrain elevation, ft ASL   (cube terrain_ft)
 */
export interface WindgramData {
  hoursUtc: number[];
  terrainFt: number;
  ghFt: number[][];
  tc: number[][];
  td: number[][];
  rh: number[][];
  uKt: number[][];
  vKt: number[][];
  pblhM: number[];
  hfx: number[];
  lh: number[];
  t2K: number[];
  sfcpMb: number[];
}

export interface WindgramOptions {
  /** Hours added to UTC for local-time labels. Default -7 (PDT). */
  utcOffset?: number;
  /** Earliest local hour to show; earlier steps are dropped. Default 8. */
  startHour?: number;
  /** Feet of headroom above the tallest PBL top for the chart ceiling. Default 4000. */
  headroomFt?: number;
  /** Hard ceiling cap, ft ASL (the Python 500 mb clamp ≈ 18 000 ft). Default 18000. */
  ceilingCapFt?: number;
  /** Title string drawn above the chart. */
  title?: string;
  /** Device pixel ratio to render at (for crisp HiDPI canvases). Default window.devicePixelRatio. */
  dpr?: number;
}
