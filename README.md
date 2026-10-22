# PNW Soaring Forecasts

Automated paragliding soaring forecasts for the Pacific Northwest, powered by [rasp-windgram](https://github.com/nw-paragliding/rasp-windgram).

## What This Does

GitHub Actions runs the WRF weather model several times a day using NAM, RRFS and
HRRR input data, generates windgram forecasts for 124 flying sites and reference points across
Washington, split over seven region tiles, and publishes them to a map-based site
on GitHub Pages.

## View Forecasts

**[forecast.nwparagliding.com](https://forecast.nwparagliding.com/)**

Click a site marker on the map to see its windgram.

## Regions

Washington is covered by seven independent WRF tiles. Each runs the same chain
(parent model → WRF 4 km → WRF 1.33 km, 52 levels, DrJack physics) with a
120 km × 120 km 1.33 km nest; the 4 km parent auto-sizes to 200 km. Each tile is
one `domains/<region>.yaml` (the NAM config; the workflows derive the RRFS and
HRRR configs from it at run time with `scripts/derive-domain.sh`) and one
`sites/<region>-sites.csv`. The tiles share one map projection and grid lattice
(the `lattice:` block, honoured by windgram >= 0.7.0) so their 1.33 km grid
points coincide where they overlap.

| Region | Center (lat, lon) | Covers | Sites |
|--------|-------------------|--------|-------|
| `issaquah` | 47.22, -121.80 | Home tile: Tiger / Issaquah Alps / North Bend / Snoqualmie Pass, Rainier NW | 32 |
| `wenatchee` | 47.22, -120.59 | Wenatchee, Leavenworth, Mission Ridge, Ellensburg / Cle Elum | 11 |
| `skykomish` | 48.03, -121.80 | Everett foothills, Index, Darrington, Stevens Pass west | 12 |
| `chelan` | 48.03, -120.59 | Chelan Butte, Lake Chelan, Entiat | 8 |
| `baker` | 48.84, -121.80 | Bellingham, Blanchard, Mt Baker, Fraser Valley south | 50 |
| `methow` | 48.84, -120.59 | Methow valley, Mazama, Washington Pass | 9 |
| `waterville` | 47.72, -119.45 | Waterville Plateau, Mansfield, Coulee City (Chelan XC) | 2 |

The site lists hold every raspnw-v2 (wxtofly) site, airports and towns included,
that sits at least 10 km inside a tile's 1.33 km nest edge (outside the ~7 km
boundary relaxation zone), each in the tile where it sits deepest; `# edge`
marks the ones only 10–15 km inside. Windgrams are published per tile at
`forecasts/<date>/<model>/<region>/<Site>_windgram.png` (and
`forecasts/latest/<model>/<region>/`); the site loads each marker's windgram
from its tile. The v2 page (`/v2`, interactive cube) is unlinked for now: only the `issaquah`
tile uploads its soaring cube to R2, so v2 would show that tile alone.

Each tile's geo_em grids are cached in Actions under
`geo-em-<region>-<hash of domains/<region>.yaml>-img<image id>`; on a miss (new tile,
edited YAML, new windgram image) the job downloads the WPS GEOG data and runs geogrid itself.
`bootstrap-geoem.yml` can pre-warm the caches.

**Jobs per run:** NAM and RRFS run every tile for day 0 and day 1 = 14 arm jobs
each; HRRR runs day 0 only = 7 jobs. Each run then commits once to gh-pages
from a single `publish` job. RRFS's NOMADS readiness polling runs in two small
`wait-day0` / `wait-day1` jobs, so the arm runners start only once the GRIB is
out. The free tier allows 20 concurrent jobs, so when NAM and RRFS fire
together some jobs queue briefly.

## Schedule

The crons live in [`cloudflare-trigger/wrangler.toml`](cloudflare-trigger/wrangler.toml)
(the single source of truth) and start each workflow via `repository_dispatch`.

| Run | Model | Cron (UTC) | Local (PDT) | Coverage |
|-----|-------|------------|-------------|----------|
| Evening HRRR | HRRR 1.33 km (beta) — HRRR 3 km → WRF 4 km → 1.33 km | 01:15 | 6:15pm | Night-before / tomorrow (00z cycle) |
| Evening NAM | NAM → WRF 4 km → 1.33 km | 02:05 | 7:05pm | Overnight outlook, today + tomorrow (00z cycle) |
| Evening RRFS | RRFS → WRF 4 km → 1.33 km | 02:05 (NAM cron) | 7:05pm | Same as NAM; waits for RRFS GRIB (~02:50z) |
| Pre-dawn HRRR | HRRR 1.33 km (beta) — HRRR 3 km → WRF 4 km → 1.33 km | 07:15 | 12:15am | Pre-dawn refresh of today (06z cycle) |
| Morning HRRR | HRRR 1.33 km (beta) — HRRR 3 km → WRF 4 km → 1.33 km | 13:00 | 6:00am | Freshest of today (12z cycle) |
| Morning NAM | NAM → WRF 4 km → 1.33 km | 14:00 | 7:00am | Day-of update, today + tomorrow (12z cycle) |
| Morning RRFS | RRFS → WRF 4 km → 1.33 km | 14:00 (NAM cron) | 7:00am | Same as NAM; waits for RRFS GRIB (~14:50z) |

RRFS has no cron of its own (Cloudflare's free tier allows 5): the two NAM ticks
dispatch both `run-nam` and `run-rrfs`, and `forecast-rrfs.yml` polls NOMADS
until the RRFS files for the cycle are published (~40 min after NAM's) before it
runs. NAM is retired by NCEP on 2026-11-03 12Z; RRFS, which drives the identical
WRF chain, replaces it. Until then both run and the site offers NAM (default),
RRFS and HRRR. Removing NAM is a follow-up change.

The Cloudflare trigger is unchanged by the region tiles: one dispatch starts the
whole region × day matrix of a workflow.

## Fork for Your Region

1. Fork this repo
2. Edit `domains/<region>.yaml` — change `center_lat`, `center_lon`, `target_dx_km`
   (and the region list in the three `forecast-*.yml` matrices)
3. Edit `sites/<region>-sites.csv` — add your flying sites
4. Push — GitHub Actions will start generating forecasts for your region

The Docker image (`ghcr.io/nw-paragliding/windgram`) handles everything:
GRIB download, WPS, WRF, windgram rendering. No WRF compilation needed.

## License

MIT
