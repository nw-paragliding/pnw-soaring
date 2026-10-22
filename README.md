# PNW Soaring Forecasts

Automated paragliding soaring forecasts for the Pacific Northwest, powered by [rasp-windgram](https://github.com/nw-paragliding/rasp-windgram).

## What This Does

GitHub Actions runs the WRF weather model 2x daily using NAM and HRRR input data,
generates windgram forecasts for 15 flying sites in the Issaquah/North Bend area,
and publishes them to a map-based site on GitHub Pages.

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

| Run | Model | Cron (UTC) | Local (PDT) | Coverage |
|-----|-------|------------|-------------|----------|
| Evening NAM | NAM 3-domain (1.33km) | 7:30 UTC | 12:30am | Next-day planning |
| Morning NAM | NAM 3-domain (1.33km) | 14:30 UTC | 7:30am | Day-of update |
| Morning HRRR | HRRR d01 (3km) | 15:30 UTC | 8:30am | Day-of rapid refresh |

## Fork for Your Region

1. Fork this repo
2. Edit `domains/*.yaml` — change `center_lat`, `center_lon`, `target_dx_km`
3. Edit `sites/*.csv` — add your flying sites
4. Push — GitHub Actions will start generating forecasts for your region

The Docker image (`ghcr.io/nw-paragliding/windgram`) handles everything:
GRIB download, WPS, WRF, windgram rendering. No WRF compilation needed.

## License

MIT
