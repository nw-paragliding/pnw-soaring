# PNW Soaring Forecasts

Automated paragliding soaring forecasts for the Pacific Northwest, powered by [rasp-windgram](https://github.com/nw-paragliding/rasp-windgram).

## What This Does

GitHub Actions runs the WRF weather model several times a day using NAM, RRFS and
HRRR input data, generates windgram forecasts for 15 flying sites in the
Issaquah/North Bend area, and publishes them to a map-based site on GitHub Pages.

## View Forecasts

**[pnw-soaring.nw-paragliding.org](https://nw-paragliding.github.io/pnw-soaring/)** (once deployed)

Click a site marker on the map to see its windgram.

## Sites

| Site | Lat | Lon |
|------|-----|-----|
| Tiger | 47.503 | -121.975 |
| Poo Poo Point | 47.500 | -121.977 |
| Rattlesnake | 47.434 | -121.782 |
| Si Main | 47.454 | -121.723 |
| Teneriffe | 47.488 | -121.711 |
| ... and 10 more | | |

See [sites/issaquah.csv](sites/issaquah.csv) for the full list.

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

## Fork for Your Region

1. Fork this repo
2. Edit `domains/*.yaml` — change `center_lat`, `center_lon`, `target_dx_km`
3. Edit `sites/*.csv` — add your flying sites
4. Push — GitHub Actions will start generating forecasts for your region

The Docker image (`ghcr.io/nw-paragliding/windgram`) handles everything:
GRIB download, WPS, WRF, windgram rendering. No WRF compilation needed.

## License

MIT
