"""
Spike: build a synthetic *soaring data cube* as Zarr — the one store that
serves BOTH stories:

  - 2D overlay arrays  (tol_ft, wstar_ms, ubl_kt, vbl_kt), chunked WHOLE-PLANE
    per time  -> a map overlay for forecast-hour T is ~1 chunk read per field.
  - 3D profile arrays  (gh_ft, tc, td, rh, u_kt, v_kt), chunked (allT, allL,
    16, 16) -> a windgram column at (y,x) is ~1 chunk read per field.
  - surface arrays used by the windgram calc (hfx, lh, pblh, t2, sfcp),
    chunked column-friendly.

Values are fabricated but physically plausible (diurnal PBL/heat-flux cycle,
~6.5 C/km lapse, wind shear, terrain) so a rendered windgram looks real and
the TOL overlay shows structure. Derived fields use the SAME formulas as
rasp/soaring.py so the browser JS port can be checked against them.

Run:  /tmp/spikeenv/bin/python spike/make_cube.py
Out:  spike/soaring.zarr   (Zarr v2 DirectoryStore, gzip)
"""
import numpy as np
import zarr, numcodecs

# ── domain (small Cascades patch, representative of the real 1km nest) ──
T, L, Y, X = 8, 20, 64, 64          # times, levels, south_north, west_east
lat0, lat1 = 47.36, 47.84
lon0, lon1 = -122.10, -121.46
hours = np.arange(8, 8 + T * 1.5, 1.5)[:T]          # 8:00 .. 18:30 local
pres = np.linspace(1000, 560, L).astype('f4')        # mb, surface -> aloft

lats = np.linspace(lat0, lat1, Y)
lons = np.linspace(lon0, lon1, X)
LON, LAT = np.meshgrid(lons, lats)                   # (Y,X)

# Standard-atmosphere height (m ASL) for each pressure level
z_std = 44330.0 * (1 - (pres / 1013.25) ** 0.1903)   # (L,)

# ── terrain: a couple of smooth ridges (m ASL) ─────────────────────────
yy, xx = np.mgrid[0:Y, 0:X] / max(Y, X)
terrain_m = (
    520
    + 760 * np.exp(-(((yy - .40) ** 2 + (xx - .55) ** 2) / 0.05))
    + 540 * np.exp(-(((yy - .70) ** 2 + (xx - .30) ** 2) / 0.04))
).astype('f4')

# A smooth "good air" pattern so TOL has spatial structure
quality = 0.75 + 0.45 * np.exp(-(((yy - .45) ** 2 + (xx - .50) ** 2) / 0.12))

# ── soaring formulas (ported from rasp/soaring.py) ─────────────────────
G, RHO_CP, MS2FPM = 9.81, 1200.0, 196.85
A1, A2, A3, A4, A5 = 0.463, 0.4549, 1.3674, 0.01267, 0.1126
HCRIT_FPM = 225.0

def calc_wstar(hfx, lh, pblh, t2):
    vhf = np.maximum(hfx + 0.000245268 * t2 * np.maximum(lh, 0.0), 0.0)
    arg = (G / t2) * pblh * (vhf / RHO_CP)
    return np.where(arg > 0, np.cbrt(arg), 0.0).astype('f4')

def calc_hcrit(wstar, ter, pblh):
    wfpm = wstar * MS2FPM
    valid = wfpm > HCRIT_FPM
    safe = np.where(wfpm > 0, wfpm, 1.0)
    inner = A3 * (A2 - A1 * (HCRIT_FPM / safe)) + A4
    frac = np.where(valid, np.sqrt(np.maximum(inner, 0.0)) + A5, 0.0)
    return np.maximum(np.where(valid, ter + frac * pblh, ter), 0.0).astype('f4')

# ── allocate ───────────────────────────────────────────────────────────
gh_ft = np.zeros((T, L, Y, X), 'f4'); tc = np.zeros_like(gh_ft)
td = np.zeros_like(gh_ft); rh = np.zeros_like(gh_ft)
u_kt = np.zeros_like(gh_ft); v_kt = np.zeros_like(gh_ft)
hfx = np.zeros((T, Y, X), 'f4'); lh = np.zeros_like(hfx)
pblh = np.zeros_like(hfx); t2k = np.zeros_like(hfx); sfcp = np.zeros_like(hfx)

for ti, hr in enumerate(hours):
    day = np.clip(np.sin(np.pi * (hr - 6.5) / 13.0), 0, 1)   # 0 at dawn/dusk
    # surface drivers
    t2c = 13 + 12 * day - 0.0065 * terrain_m                  # 2m temp (C)
    t2k[ti] = t2c + 273.15
    hfx[ti] = np.maximum(0, 300 * day * quality)
    lh[ti] = 0.45 * hfx[ti]
    pblh[ti] = np.maximum(60, (2100 * day) * quality)
    sfcp[ti] = 1013.0 * np.exp(-terrain_m / 8100.0)
    # profiles
    for li in range(L):
        z = z_std[li]
        above = np.maximum(z - terrain_m, 0)                  # height AGL
        tcol = t2c - 6.5 * above / 1000.0                     # ~6.5 C/km lapse
        tc[ti, li] = tcol
        gh_ft[ti, li] = z * 3.28084
        # drier with height, a moist bump near PBL top -> cu
        depress = 7 + 11 * (above / 4000.0)
        moist = 6 * np.exp(-(((above - pblh[ti]) / 350.0) ** 2)) * day
        td[ti, li] = tcol - np.maximum(depress - moist, 1.0)
        rh[ti, li] = np.clip(100 * np.exp(-0.6 * ((tcol - td[ti, li]) / 10.0)), 3, 100)
        # wind: light near sfc, veering & strengthening aloft
        spd = 4 + 22 * (above / 4500.0)
        ang = np.radians(215 + 35 * (above / 4500.0))         # SW veering
        u_kt[ti, li] = -spd * np.sin(ang)
        v_kt[ti, li] = -spd * np.cos(ang)

# ── derived overlays (same formulas as the windgram) ───────────────────
wstar = np.stack([calc_wstar(hfx[t], lh[t], pblh[t], t2k[t]) for t in range(T)])
tol_ft = np.stack([calc_hcrit(wstar[t], terrain_m, pblh[t]) * 3.28084 for t in range(T)])
# BL-top wind = profile wind at the level nearest each cell's PBL top
bl_idx = np.argmin(np.abs(z_std[None, :, None, None]
                         - (terrain_m[None, None] + pblh[:, None])), axis=1)  # (T,Y,X)
ti_g, yy_g, xx_g = np.meshgrid(np.arange(T), np.arange(Y), np.arange(X), indexing='ij')
ubl = u_kt[ti_g, bl_idx, yy_g, xx_g].astype('f4')
vbl = v_kt[ti_g, bl_idx, yy_g, xx_g].astype('f4')

# ── write Zarr (v2, gzip), GeoZarr / CF-conventions layout ─────────────
# Every array carries _ARRAY_DIMENSIONS (xarray), spatial fields reference a
# CF grid_mapping variable 'spatial_ref' (EPSG:4326), and 1D lat/lon/time/level
# coordinate variables carry CF standard_name/units/axis. This is what
# zarrita + @carbonplan/zarr-layer read to georeference.
store = zarr.DirectoryStore('spike/soaring.zarr')
g = zarr.open_group(store, mode='w')
cz = numcodecs.GZip(level=5)
PROF_CH = (T, L, 16, 16)     # column-friendly  -> windgrams
PLANE_CH = (1, Y, X)         # slab-friendly     -> overlays
SFC_CH = (T, 16, 16)         # column-friendly surface

WGS84_WKT = ('GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,'
             '298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",'
             '0.0174532925199433],AUTHORITY["EPSG","4326"]]')

def put(name, data, chunks, dims, attrs=None):
    a = np.asarray(data)
    d = g.create_dataset(name, data=a, chunks=chunks, compressor=cz, overwrite=True)
    d.attrs['_ARRAY_DIMENSIONS'] = list(dims)
    if attrs:
        d.attrs.update(attrs)
    return d

GM = {'grid_mapping': 'spatial_ref'}      # spatial fields reference the CRS var

# CRS variable (CF grid_mapping, rioxarray-style)
crs = g.create_dataset('spatial_ref', data=np.array(0, 'i4'), overwrite=True)
crs.attrs.update({'_ARRAY_DIMENSIONS': [], 'grid_mapping_name': 'latitude_longitude',
                  'crs_wkt': WGS84_WKT, 'spatial_ref': WGS84_WKT,
                  'semi_major_axis': 6378137.0, 'inverse_flattening': 298.257223563,
                  'longitude_of_prime_meridian': 0.0, 'epsg_code': 'EPSG:4326'})

# coordinate variables (1D, CF)
put('lat', lats.astype('f4'), (Y,), ['lat'],
    {'standard_name': 'latitude', 'units': 'degrees_north', 'axis': 'Y'})
put('lon', lons.astype('f4'), (X,), ['lon'],
    {'standard_name': 'longitude', 'units': 'degrees_east', 'axis': 'X'})
put('time', hours.astype('f4'), (T,), ['time'],
    {'standard_name': 'time', 'units': 'hours since 2026-06-24 00:00:00 local',
     'long_name': 'forecast valid hour (local)'})
put('level', pres, (L,), ['level'],
    {'standard_name': 'air_pressure', 'units': 'hPa', 'positive': 'down'})

# static
put('terrain_ft', (terrain_m * 3.28084).astype('f4'), (Y, X), ['lat', 'lon'],
    {**GM, 'long_name': 'terrain height', 'units': 'ft'})

# 3D profiles (windgram columns)
for nm, arr, ln, un in [('gh_ft', gh_ft, 'geopotential height', 'ft'),
                        ('tc', tc, 'temperature', 'degC'), ('td', td, 'dewpoint', 'degC'),
                        ('rh', rh, 'relative humidity', '%'),
                        ('u_kt', u_kt, 'u wind', 'kt'), ('v_kt', v_kt, 'v wind', 'kt')]:
    put(nm, arr, PROF_CH, ['time', 'level', 'lat', 'lon'], {**GM, 'long_name': ln, 'units': un})

# surface (windgram calc)
for nm, arr, un in [('hfx', hfx, 'W m-2'), ('lh', lh, 'W m-2'),
                    ('pblh_m', pblh, 'm'), ('t2_k', t2k, 'K'), ('sfcp_mb', sfcp, 'hPa')]:
    put(nm, arr, SFC_CH, ['time', 'lat', 'lon'], {**GM, 'units': un})

# 2D overlays (map layers)
for nm, arr, ln, un in [('tol_ft', tol_ft, 'top of lift', 'ft'),
                        ('wstar_ms', wstar, 'w* convective velocity', 'm s-1'),
                        ('ubl_kt', ubl, 'BL-top u wind', 'kt'),
                        ('vbl_kt', vbl, 'BL-top v wind', 'kt')]:
    put(nm, arr, PLANE_CH, ['time', 'lat', 'lon'], {**GM, 'long_name': ln, 'units': un})

g.attrs.update({
    'Conventions': 'CF-1.8', 'title': 'PNW soaring data cube (spike, synthetic)',
    'model': 'SYNTH', 'cycle': '00', 'dx_km': 1.0,
})

# Consolidated metadata (.zmetadata) — many zarrita/zarr-layer paths expect it.
zarr.consolidate_metadata(store)

# report
import os
def du(p):
    return sum(os.path.getsize(os.path.join(d, f))
               for d, _, fs in os.walk(p) for f in fs)
print(f"wrote spike/soaring.zarr  ({du('spike/soaring.zarr')/1e6:.2f} MB on disk, gzip)")
print(f"  dims: time={T} level={L} y={Y} x={X}")
print(f"  tol_ft range: {tol_ft.min():.0f}..{tol_ft.max():.0f} ft ; wstar max {wstar.max():.2f} m/s")
