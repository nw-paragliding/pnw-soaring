# PNW Soaring Forecasts

Automated paragliding soaring forecasts for the Pacific Northwest, powered by [rasp-windgram](https://github.com/nw-paragliding/rasp-windgram).

## What This Does

GitHub Actions runs the WRF weather model several times a day using RRFS and
HRRR input data, generates windgram forecasts for 176 flying sites and reference points across
Washington, Oregon and far-northern California, split over 20 region tiles, and publishes them to Cloudflare R2
behind a map-based site on GitHub Pages.

## View Forecasts

**[forecast.nwparagliding.com](https://forecast.nwparagliding.com/)**

Find a site by name, under Favourites, or by State › Area in the list on the left
(the map is a picker behind the Map button); the forecast shows the windgram, a
model toggle, the day picker and the hourly table. Phones show the list and the
forecast one at a time; foldables put one on each screen.

[`/old`](https://forecast.nwparagliding.com/old/) is a plain wxtofly-style page: a
State → Area → Site list down the side, the site's windgrams for each published day
stacked on the right, each flipping to its table on click (`site/old/`; the
State/Area grouping comes from wxtofly's site list via `site/areas.json`, which the
main page uses too).

## Regions

Washington, Oregon and far-northern California are covered by 20 independent WRF tiles (the seven original Washington tiles plus 13 added 2026-11-03, covering wxtofly's US sites; its BC sites are out of scope for now, and those north of about 50° N are beyond the HRRR/RRFS grid's reach in any case). Each runs the same chain
(parent model → WRF 4 km → WRF 1.33 km, 52 levels, DrJack physics) with a
120 km × 120 km 1.33 km nest; the 4 km parent auto-sizes to 200 km. Each tile is
one `domains/<region>.yaml` (the tile's base config, still written as the NAM
config: the workflows derive the RRFS and HRRR configs from it at run time with
`scripts/derive-domain.sh`, which swaps the `model:` line) and one
`sites/<region>-sites.csv`. The tiles share one map projection and grid lattice
(the `lattice:` block, honoured by windgram >= 0.7.0) so their 1.33 km grid
points coincide where they overlap.

| Region | Center (lat, lon) | Covers | Sites |
|--------|-------------------|--------|-------|
| `issaquah` | 47.22, -121.80 | Home tile: Tiger / Issaquah Alps / North Bend / Snoqualmie Pass, Rainier NW | 32 |
| `wenatchee` | 47.22, -120.59 | Wenatchee, Leavenworth, Mission Ridge, Ellensburg / Cle Elum | 11 |
| `skykomish` | 48.03, -121.80 | Everett foothills, Index, Darrington, Stevens Pass west | 11 |
| `chelan` | 48.03, -120.59 | Chelan Butte, Lake Chelan, Entiat | 8 |
| `baker` | 48.84, -121.80 | Bellingham, Blanchard, Mt Baker, Fraser Valley south | 50 |
| `methow` | 48.84, -120.59 | Methow valley, Mazama, Washington Pass | 9 |
| `waterville` | 47.72, -119.45 | Waterville Plateau, Mansfield, Coulee City (Chelan XC) | 2 |
| `salish` | 48.40, -122.95 | Salish Sea: Whidbey, Port Townsend, Smith Island, Bellingham airport | 7 |
| `gorge` | 46.09, -121.89 | Columbia Gorge: Dog Mountain, Bingen, Eagle Caves, Mt St Helens, Mt Adams, Silver Star | 5 |
| `tillamook` | 45.77, -123.58 | North Oregon coast and Area B: Cape Lookout, Oceanside, Ecola, Sollie Smith; Chehalem, Kutch | 6 |
| `tricities` | 46.59, -119.30 | Tri-Cities, Saddle Mountain, Kiona, Eagle Butte, Frenchman Hills | 6 |
| `bend` | 44.32, -121.51 | Central Oregon: Black Butte, Pine Ridge, Haystack, Pine Mountain, Hoover Ridge | 5 |
| `lakeview` | 42.19, -119.99 | Lakeview: Abert Rim, Black Cap, Doherty Slide, Sugar Hill | 4 |
| `colville` | 48.20, -117.80 | Chewelah / Colville: Inkler, Parker, Wrights | 3 |
| `siskiyou` | 41.89, -122.49 | Siskiyous: Woodrat, Herd Peak, Whaleback | 3 |
| `olympics` | 47.26, -122.58 | South Olympics: Shelton, Mt Ellinor, Jupiter, Dinosaur | 3 |
| `palouse` | 47.13, -117.13 | Palouse: Steptoe Butte, Tekoa | 2 |
| `wallowa` | 45.19, -117.33 | Wallowas: Mt Howard | 2 |
| `newport` | 44.89, -123.50 | Yaquina Head, Cape Kiwanda, Peterson Butte | 4 |
| `goldendale` | 45.68, -120.98 | Goldendale: Cliffside, Eagle Caves | 3 |

The site lists hold every raspnw-v2 (wxtofly) site, airports and towns included,
that sits at least 10 km inside a tile's 1.33 km nest edge (outside the ~7 km
boundary relaxation zone), each in the tile where it sits deepest; `# edge`
marks the ones only 10–15 km inside. Windgrams are published per tile to the
R2 bucket `nw-paragliding-forecasts` (public URL
`https://pub-de96e47b1e91464bb2959747602c1914.r2.dev`) at
`forecasts/<date>/<model>/<region>/<Site>_windgram.png` (and
`forecasts/latest/<model>/<region>/`), each with its `<Site>_blipspot.json`
beside it — the hourly table wxtofly showed when you clicked a windgram
(written by rasp-windgram >= 0.8.0; the site's Table view reads it); the site
loads each marker's windgram from its tile. Each leg uploads its own files the
moment it finishes (`.github/actions/publish-r2`); `r2-prune.yml` keeps 7 days
of dated directories. Until 2026-11-03 the windgrams were committed to the
`gh-pages` branch instead, which now carries only the frontend. The v2 page (`/v2`, interactive cube) is unlinked and its R2 cube upload is off
for now (`UPLOAD_CUBES: 'false'` in the forecast workflows), so it goes stale;
when re-enabled only the `issaquah` tile uploads a cube.

Each tile's geo_em grids are cached in Actions under
`geo-em-<region>-<hash of domains/<region>.yaml>-img<image id>`; on a miss (new tile,
edited YAML, new windgram image) the job downloads the WPS GEOG data and runs geogrid itself.
`bootstrap-geoem.yml` can pre-warm the caches.

**Jobs per run:** RRFS runs every tile for days 0, 1 and 2 = 60 arm jobs in
three waves of 20 (one per day); HRRR runs days 0 and 1 = 40 jobs in two waves;
the GFS outlook spike adds two one-tile legs (days 3 and 4) chained after each
RRFS run.
Waves never overlap. Day 2 is RRFS's last reachable day (f64–f76 from 00z,
f52–f64 from 12z; 84 h reach), and because no older cycle covers it, its legs
run only when the `wait-day2` gate saw f75 — otherwise the day is skipped and
the day-1 forecast stands. HRRR's cycles reach only 48 h, so a day HRRR cannot reach (day 1
of the 01:15z run, day 2 always) ends its job in seconds with a notice and publishes nothing;
HRRR's day-1 legs start only after a small `wait-day1` job
(`scripts/wait-hrrr.sh`), which itself starts once the day-0 wave is over, has
seen the cycle's window-end GRIB (f45 / f39), while its day-0 legs start at once. There is no publish job: every leg writes its
windgrams to R2 itself, so a slow or queued leg never delays the others'.
RRFS's readiness polling likewise runs in three small
`wait-day0` / `wait-day1` / `wait-day2` jobs, so the arm runners start only once the GRIB is
out. The free tier allows 20 concurrent jobs: a wave is 20 legs, and each
gate job starts only once the previous wave is over (`needs: forecast-day0`,
`needs: forecast-day1`), so the cap is met exactly and nothing queues; a 21st
tile would have one leg wait for the first finisher. The 13:00z HRRR day-1 wave ends before the 14:00z RRFS legs
start.

## Schedule

The crons live in [`cloudflare-trigger/wrangler.toml`](cloudflare-trigger/wrangler.toml)
(the single source of truth) and start each workflow via `repository_dispatch`.

| Run | Model | Cron (UTC) | Local (PDT) | Coverage |
|-----|-------|------------|-------------|----------|
| Evening HRRR | HRRR 1.33 km — HRRR 3 km → WRF 4 km → 1.33 km | 01:15 | 6:15pm | Night-before: tomorrow only (00z cycle; the next day would need f51 > 48 h, skipped) |
| Evening RRFS | RRFS → WRF 4 km → 1.33 km | 02:05 | 7:05pm | Overnight outlook, tomorrow + two more days (00z cycle; waits for the GRIB: f27 ~02:25z, f51 ~02:52z, f75 ~03:16z) |
| Pre-dawn HRRR | HRRR 1.33 km — HRRR 3 km → WRF 4 km → 1.33 km | 07:15 | 12:15am | Pre-dawn refresh, today + tomorrow (06z cycle; tomorrow ends at f45) |
| Morning HRRR | HRRR 1.33 km — HRRR 3 km → WRF 4 km → 1.33 km | 13:00 | 6:00am | Freshest, today + tomorrow (12z cycle; tomorrow ends at f39) |
| Morning RRFS | RRFS → WRF 4 km → 1.33 km | 14:00 | 7:00am | Day-of update, today + two more days (12z cycle; waits for the GRIB: f27 ~14:25z, f51 ~14:52z, f75 ~15:18z) |
| GFS outlook (spike) | GFS 25 km → WRF 4 km → 1.33 km | after each RRFS run (~03:40 / ~15:42) | ~8:40pm / ~8:40am | Days 3 and 4, the **issaquah tile only** while we learn whether they are worth showing (`forecast-gfs.yml`, chained by `workflow_run`; the newest 6-hourly GFS cycle, f099 / f123 ~20 min after the chain fires, or the cycle before it when a hand-started run comes hours before the newest exists). RRFS reaches 84 h, GFS 384 h. |

`forecast-hrdps.yml` (a spike on the issaquah tile: ECCC's HRDPS 2.5 km, the
model that reaches the BC sites) has no cron of its own: `workflow_run` chains
it to the end of each RRFS run (~03:40z / ~15:42z), when the newest 6-hourly
HRDPS cycle is complete on the MSC Datamart. Day 0 renders at once; day 1 waits
on `scripts/wait-hrdps.sh`, which takes the previous cycle when the newest is
not out and skips a day past HRDPS's 48 h reach, so the evening chain renders
tomorrow only.

`forecast-rrfs.yml` polls the RRFS data root until the files for the cycle are
published before its arm legs start (two small `wait-day0` / `wait-day1` jobs).
NCEP retired NAM on 2026-11-03 12Z; RRFS, which drives the identical WRF chain,
replaced it as the site's default model and took over NAM's two crons (the free
tier allows 5, and until the retirement those two ticks dispatched both
`run-nam` and `run-rrfs`). `forecast-nam.yml` is gone and the site's NAM button
went on 2026-11-13. What is left of NAM (`model: nam` as the tile configs'
base, the `nam/` prefix in R2) is a follow-up change.

### Where the GRIB comes from

HRRR and RRFS are read from NOAA's Open Data mirrors on AWS, not from NOMADS.
With ~35 jobs per cycle, NOMADS throttled the runners (HTTP 302s), and one job
died on it. The mirrors use the same directory layout and `.idx` files as NOMADS,
answer byte-range requests and do not throttle. They run ~1–4 min behind NOMADS
(one HRRR file was 10 min behind in the sample measured on 2026-10-22).

| Model | Default root | Repo variable | Back to NOMADS |
|-------|--------------|---------------|----------------|
| HRRR | `https://noaa-hrrr-bdp-pds.s3.amazonaws.com` | `RASP_HRRR_ROOT` | `https://nomads.ncep.noaa.gov/pub/data/nccf/com/hrrr/prod` |
| RRFS | `https://noaa-rrfs-ops-pds.s3.amazonaws.com` | `RASP_RRFS_ROOT` | `https://nomads.ncep.noaa.gov/pub/data/nccf/com/rrfs/v1.0` (`…/rrfs/prod` after 2026-11-03 12Z) |

Set the variable under Settings → Secrets and variables → Actions → Variables.
No code change is needed. The RRFS wait gate polls the same root. HRRR needs
windgram >= 0.7.2 for its root to take effect; older images always read HRRR
from NOMADS.

The Cloudflare trigger is unchanged by the region tiles: one dispatch starts the
whole region × day matrix of a workflow.

## gh-pages history squash

The frontend is served by GitHub Pages from the root of the `gh-pages` branch
(`deploy-site.yml` publishes `site/` there on push to main). Until 2026-11-03
every forecast cycle also committed a few hundred windgram PNGs to it, and
although the publish jobs pruned dates older than 7 days from the tree, git
history kept every image ever published: 4+ GB and 10+ minute Pages builds, for
history nobody needs. Windgrams now go to R2, so the branch only changes when
the frontend does; the squash stays as a safety net until the old `forecasts/`
tree is removed from the branch.

[`squash-gh-pages.yml`](.github/workflows/squash-gh-pages.yml) runs every Tuesday at
10:30 UTC (clear of all forecast crons) and on `workflow_dispatch`
(`gh workflow run squash-gh-pages.yml --ref main`). It shallow-fetches the
`gh-pages` tip, makes one parentless commit with the *identical* tree
(`git commit-tree`), checks the tree hash and an empty diff, and
`--force-with-lease`-pushes it against the exact tip it read (re-fetching and
retrying if a publish landed in between). The live site does not change; only the
history goes.

A publisher that fetched `gh-pages` before a squash and pushes after it is
rejected and retries; every publish retry loop (`deploy-site.yml`,
the lab A/B publish) rebases with `git rebase --onto origin/gh-pages HEAD~1`, so it
replays only its own commit onto the new root and never brings history back.

GitHub reclaims the space only after its own garbage collection of the now
unreachable objects, which can take days (GitHub Support can expedite it), so the
repository size shown by GitHub lags behind the squash.

## Fork for Your Region

1. Fork this repo
2. Edit `domains/<region>.yaml` — change `center_lat`, `center_lon`, `target_dx_km`
   (and the region list in the `forecast-*.yml` and `bootstrap-geoem.yml` matrices)
3. Edit `sites/<region>-sites.csv` — add your flying sites
4. Push — GitHub Actions will start generating forecasts for your region

The Docker image (`ghcr.io/nw-paragliding/windgram`) handles everything:
GRIB download, WPS, WRF, windgram rendering. No WRF compilation needed.

## License

MIT

> **2026-10-22 — steep-terrain stability.** The 1.33 km nests over Rainier, Baker/Shuksan and the
> North Cascades crest went NaN within minutes of each run (rasp-windgram #22 has the root cause: a
> weakly damped acoustic mode in WRF's solver, not the time step). Every tile now carries
> `dynamics: {epssm: 0.5}`; it needs `windgram:latest` ≥ 0.7.3 (older images ignore the block).
