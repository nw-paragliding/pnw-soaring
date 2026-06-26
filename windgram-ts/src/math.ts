/**
 * Soaring math — a faithful TypeScript port of rasp-windgram's
 * soaring.py (calc_wstar, calc_hcrit, _drjack_height_frac) and the
 * derived quantities computed inside windgram.py._extract_site_data.
 *
 * Every constant and formula is reproduced verbatim from the Python so the
 * in-browser windgram matches the server-rendered PNGs.
 */

// --- constants (soaring.py) ---
export const MS_TO_FPM = 196.85; // m/s → ft/min
export const HCRIT_THRESHOLD = 225.0; // ft/min (≈ paraglider sink)
export const G = 9.81; // m/s²
export const RHO_CP = 1200.0; // ρ·Cp for surface air (J/m³/K)
export const VHF_COEF = 0.000245268; // virtual-heat-flux moisture coefficient
export const M_TO_FT = 3.28084;

// DrJack empirical thermal-penetration coefficients
const ALPHA1 = 0.463;
const ALPHA2 = 0.4549;
const ALPHA3 = 1.3674;
const ALPHA4 = 0.01267;
const ALPHA5 = 0.1126;

/** Convective velocity scale w* (Deardorff). Zero where buoyancy flux ≤ 0. */
export function calcWstar(hfx: number, lh: number, pblhM: number, t2K: number): number {
  const vhf = Math.max(hfx + VHF_COEF * t2K * Math.max(lh, 0), 0);
  const arg = (G / t2K) * pblhM * (vhf / RHO_CP);
  return arg > 0 ? Math.cbrt(arg) : 0;
}

/** DrJack nonlinear thermal-penetration fraction of BL depth. */
export function drjackHeightFrac(thresholdFpm: number, wstarFpm: number): number {
  const safe = wstarFpm > 0 ? wstarFpm : 1.0;
  const ratio = thresholdFpm / safe;
  const inner = ALPHA3 * (ALPHA2 - ALPHA1 * ratio) + ALPHA4;
  return Math.sqrt(Math.max(inner, 0)) + ALPHA5;
}

/**
 * Critical soaring height (ft ASL) — height where the thermal updraft drops to
 * 225 fpm. Linear in length units, so feet in → feet out (Python computes in
 * metres then ×3.28084; identical result).
 */
export function calcHcritFt(wstarMs: number, terrainFt: number, pblhFt: number): number {
  const wstarFpm = wstarMs * MS_TO_FPM;
  if (wstarFpm <= HCRIT_THRESHOLD) return terrainFt;
  const frac = drjackHeightFrac(HCRIT_THRESHOLD, wstarFpm);
  return Math.max(terrainFt + frac * pblhFt, 0);
}

/** Lifting condensation level (ft ASL), 125 m per °C of dewpoint depression. */
export function lclFt(tcSfc: number, tdSfc: number, terrainFt: number): number {
  const spread = Math.max(tcSfc - tdSfc, 0);
  return terrainFt + 125.0 * spread * M_TO_FT;
}

/** LCL height above ground (ft AGL). */
export function lclAglFt(tcSfc: number, tdSfc: number): number {
  return 125.0 * Math.max(tcSfc - tdSfc, 0) * M_TO_FT;
}

/**
 * Lapse rate (°C per 1000 ft) at the midpoint between two adjacent levels.
 * Matches windgram.py: diff(tk)/max(diff(z_ft)/1000, 0.01). Negative ⇒ cooling
 * with height (the normal/unstable case).
 */
export function lapseRate(tcLo: number, tcHi: number, ghLoFt: number, ghHiFt: number): number {
  const dz = Math.max((ghHiFt - ghLoFt) / 1000.0, 0.01);
  return (tcHi - tcLo) / dz;
}

/** Sundqvist-style cloud fraction from RH (%). RHcrit = 75. */
export function cloudFraction(rhPct: number): number {
  return Math.min(Math.max((rhPct - 75.0) / 25.0, 0), 1);
}
