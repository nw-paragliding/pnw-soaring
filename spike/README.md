# Soaring data cube spike

Proves the **"one Zarr cube → both stories"** architecture for serving model
output from R2: a TOL **map overlay** and **click-anywhere windgrams**, both read
from a single chunked Zarr.

## Status (what's validated)

- ✅ **Windgram render in JS/canvas** — a faithful time-height windgram (W\* climb
  header, glider-ceiling line, BL/lift shading, wind barbs) ported from
  `rasp/windgram.py` + `soaring.py`. Looks realistic.
- ✅ **Zarr column path** — `zarrita` fetches a single `[:,:,y,x]` column (one
  chunk per variable) on map click. Lazy, static-file, no Worker.
- ✅ **Dual chunking** — 3D profile arrays chunked column-friendly `(T,L,16,16)`;
  2D overlay arrays chunked plane-friendly `(1,Y,X)`. One store, both access
  patterns.
- ⏳ **MapLibre base + `@carbonplan/zarr-layer` overlay** — wired but not yet
  rendering: needs the MapLibre base sorted and the cube laid out the way
  zarr-layer expects (multiscales? coord/dim convention? CRS). See open
  questions below.

## Run

```bash
# 1. build the synthetic cube (no live wrfout needed for the spike)
python3 -m venv /tmp/spikeenv
/tmp/spikeenv/bin/pip install 'zarr<3' numcodecs numpy
/tmp/spikeenv/bin/python spike/make_cube.py        # -> spike/soaring.zarr

# 2. serve and open
cd spike && python3 -m http.server 8790
# open http://localhost:8790  — click ridges for windgrams, drag the time slider
```

`spike/soaring.zarr` is generated (gitignored) — rebuild with `make_cube.py`.

## Open questions for the real build (zarr-layer)

1. **Multiscales** — does `zarr-layer` need a pyramid for our single 1 km nest,
   or render a single-resolution array? (drives whether the pipeline builds an
   `ndpyramid`.)
2. **Cube layout** — coordinate/dimension convention it expects: xarray-style
   `_ARRAY_DIMENSIONS` + 1D lon/lat coords + CRS attr? GeoZarr? The synthetic
   cube currently has plain arrays + 2D lat/lon, no dim names.
3. **MapLibre base** — preferred base style / tile source for the production map.

## Next

- Real exporter: `wrfout`/HRRR full-grid → `soaring.zarr` in the pipeline (cheap
  — the single-pass reader already decodes the whole grid).
- Upload to R2; point the frontend at it.
- Projection: reproject WRF Lambert → the layer's CRS when baking overlay fields.
