# A/B comparison: NAM vs HRRR

- **NAM**: `../runs/ab-issaquah-nam` — model `nam`, cycle `2026-10-22 00z`, dx 1.3333333740234374 km, 13 hours, grid 90×90
- **HRRR**: `../runs/ab-issaquah-hrrr` — model `hrrr`, cycle `2026-10-22 00z`, dx 1.3333333740234374 km, 13 hours, grid 90×90

Grids identical; afternoon = 12:00–17:59 local (UTC-7). Δ = HRRR − NAM.

## Afternoon summary per site

| Site | terrain ft | BL top (AGL) med\|Δ\| / bias (ft) | w* med\|Δ\| / bias (fpm) | Soaring ceiling med\|Δ\| / bias (ft) | BL wind speed med\|Δ\| / bias (kt) | BL wind dir med\|Δ\| / bias (deg) | 2 m temperature med\|Δ\| / bias (F) | Sfc LCL (AGL) med\|Δ\| / bias (ft) | Sensible heat flux med\|Δ\| / bias (W/m2) |
|---|---|---|---|---|---|---|---|---|---|
| Tiger | 2463 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| TigerHikeLookout | 2057 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| TigerLZ | 776 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Poo_Poo_Point | 1152 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| West_Tiger_3 | 1760 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| West_Tiger_2 | 1760 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| West_Tiger_1 | 2463 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| East_Tiger | 2429 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Taylor_Mountain | 2298 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| Mitchell_Hill | 1076 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Grand_Ridge_Park | 1008 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Issaquah_Highlands | 608 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Rattlesnake | 2644 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| Green_Mtn_Launch | 3692 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Green_Mtn_LZ | 1230 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| MtSi | 2610 | — / — | 0 / +0 | 1 / -1 | — / — | — / — | — / — | — / — | — / — |
| Mt_Washington | 3081 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| SquakMountain | 1339 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| McDonald | 1683 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Carnation | 463 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| 5_Mile | 2419 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Grand_Prospect | 2476 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Bandera_Mountain | 4460 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Mailbox_Peak | 3494 | — / — | 0 / +0 | 0 / -0 | — / — | — / — | — / — | — / — | — / — |
| Bergseth | 993 | — / — | 0 / +0 | 2 / -2 | — / — | — / — | — / — | — / — | — / — |
| Index_Launch | 2599 | 306 / -231 | 31 / -25 | 1 / -1 | — / — | — / — | 1 / -1 | 314 / +109 | 15 / -14 |
| Index_LZ | 3122 | 289 / -283 | 29 / -27 | 1 / -1 | — / — | — / — | 1 / -1 | 422 / +36 | 16 / -14 |

## Pooled over all sites (afternoon)

| Metric | n | median \|Δ\| | p90 \|Δ\| | bias |
|---|---|---|---|---|
| BL top (AGL) (ft) | 12 | 289 | 473 | -257 |
| w* (fpm) | 162 | 0 | 0 | -2 |
| Soaring ceiling (ft) | 162 | 0 | 1 | -0 |
| BL wind speed (kt) | 0 | — | — | — |
| BL wind dir (deg) | 0 | — | — | — |
| 2 m temperature (F) | 12 | 1 | 1 | -1 |
| Sfc LCL (AGL) (ft) | 12 | 342 | 697 | +73 |
| Sensible heat flux (W/m2) | 12 | 15 | 28 | -14 |

## Whole inner grid at 14:00 local

- soaring ceiling: median |Δ| 1 ft, bias +2 ft
- w*: median |Δ| 0 fpm, bias +0 fpm
- map: `diffmap_tol.png`

## Hourly detail

### Tiger (47.503, -121.975; grid point 47.503, -121.974; terrain 2463 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2463 / 2463 | 6kt@356 / 5kt@350 | 47 / 41 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### TigerHikeLookout (47.508, -121.985; grid point 47.502, -121.992; terrain 2057 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2057 / 2056 | 4kt@002 / 5kt@004 | 47 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2057 / 2056 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### TigerLZ (47.498, -122.021; grid point 47.502, -122.027; terrain 776 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 776 / 776 | 1kt@031 / 5kt@032 | 47 / 45 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 776 / 776 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Poo_Poo_Point (47.499, -122.008; grid point 47.502, -122.010; terrain 1152 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1152 / 1151 | 3kt@008 / 6kt@028 | 47 / 44 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1152 / 1151 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### West_Tiger_3 (47.512, -121.990; grid point 47.514, -121.992; terrain 1760 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1760 / 1760 | 5kt@002 / 4kt@008 | 47 / 41 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### West_Tiger_2 (47.509, -121.985; grid point 47.514, -121.992; terrain 1760 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1760 / 1760 | 5kt@002 / 4kt@008 | 47 / 41 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1760 / 1760 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### West_Tiger_1 (47.504, -121.976; grid point 47.503, -121.974; terrain 2463 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2463 / 2463 | 6kt@356 / 5kt@350 | 47 / 41 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2463 / 2463 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### East_Tiger (47.489, -121.947; grid point 47.491, -121.938; terrain 2429 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2429 / 2428 | 5kt@352 / 5kt@337 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2429 / 2428 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Taylor_Mountain (47.453, -121.895; grid point 47.455, -121.902; terrain 2298 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2298 / 2297 | 4kt@360 / 4kt@344 | 48 / 41 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2298 / 2297 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Mitchell_Hill (47.551, -121.937; grid point 47.551, -121.940; terrain 1076 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1076 / 1075 | 1kt@050 / 6kt@337 | 46 / 44 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1076 / 1075 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Grand_Ridge_Park (47.550, -121.982; grid point 47.551, -121.975; terrain 1008 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1008 / 1007 | 2kt@010 / 4kt@356 | 46 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1008 / 1007 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Issaquah_Highlands (47.546, -122.004; grid point 47.550, -122.011; terrain 608 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 608 / 607 | 1kt@059 / 2kt@145 | 46 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 608 / 607 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Rattlesnake (47.467, -121.824; grid point 47.468, -121.831; terrain 2644 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2644 / 2643 | 1kt@348 / 3kt@306 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2644 / 2643 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Green_Mtn_Launch (47.512, -121.678; grid point 47.518, -121.672; terrain 3692 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 3692 / 3692 | 1kt@300 / 3kt@334 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 3692 / 3692 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Green_Mtn_LZ (47.487, -121.676; grid point 47.482, -121.672; terrain 1230 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1230 / 1229 | 2kt@005 / 1kt@286 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1230 / 1229 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### MtSi (47.508, -121.740; grid point 47.505, -121.743; terrain 2610 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2610 / 2609 | 1kt@358 / 3kt@345 | 48 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2610 / 2609 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Mt_Washington (47.426, -121.699; grid point 47.422, -121.706; terrain 3081 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 3081 / 3081 | 1kt@325 / 3kt@319 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 3081 / 3081 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### SquakMountain (47.504, -122.047; grid point 47.502, -122.045; terrain 1339 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1339 / 1338 | 5kt@008 / 8kt@006 | 47 / 45 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1339 / 1338 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### McDonald (47.335, -121.882; grid point 47.336, -121.881; terrain 1683 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 1683 / 1683 | 1kt@034 / 3kt@022 | 49 / 45 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 1683 / 1683 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Carnation (47.643, -121.936; grid point 47.647, -121.943; terrain 463 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 463 / 462 | 1kt@087 / 2kt@327 | 44 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 463 / 462 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### 5_Mile (47.614, -121.691; grid point 47.614, -121.692; terrain 2419 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2419 / 2419 | 2kt@025 / 1kt@312 | 47 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2419 / 2419 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Grand_Prospect (47.472, -121.821; grid point 47.469, -121.813; terrain 2476 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2476 / 2475 | 2kt@356 / 4kt@310 | 48 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 2476 / 2475 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Bandera_Mountain (47.420, -121.554; grid point 47.423, -121.546; terrain 4460 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 4460 / 4460 | 3kt@287 / 3kt@291 | 47 / 43 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 4460 / 4460 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Mailbox_Peak (47.462, -121.639; grid point 47.458, -121.636; terrain 3494 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 3494 / 3494 | 1kt@315 / 2kt@276 | 48 / 42 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 3494 / 3494 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Bergseth (47.243, -121.924; grid point 47.239, -121.931; terrain 993 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 993 / 991 | 1kt@034 / 1kt@072 | 49 / 44 | 0 / 0 |
| 09:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 10:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 11:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 12:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 13:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 14:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 15:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 16:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 17:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 18:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 19:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |
| 20:00 | nan / nan | 0 / 0 | 993 / 991 | nankt@nan / nankt@nan | nan / nan | nan / nan |

### Index_Launch (47.836, -121.535; grid point 47.759, -121.535; terrain 2599 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 2599 / 2598 | 1kt@095 / 3kt@273 | 48 / 44 | 0 / 0 |
| 09:00 | 80 / 450 | 0 / 0 | 2599 / 2598 | nankt@nan / nankt@nan | 50 / 48 | -0 / -0 |
| 10:00 | 502 / 459 | 104 / 97 | 2599 / 2598 | nankt@nan / nankt@nan | 51 / 49 | 30 / 27 |
| 11:00 | 1040 / 897 | 168 / 155 | 2599 / 2598 | nankt@nan / nankt@nan | 52 / 50 | 63 / 58 |
| 12:00 | 1400 / 1221 | 204 / 190 | 2599 / 2598 | nankt@nan / nankt@nan | 51 / 51 | 86 / 78 |
| 13:00 | 1668 / 1194 | 224 / 182 | 2599 / 2598 | nankt@nan / nankt@nan | 51 / 50 | 94 / 70 |
| 14:00 | 1687 / 1225 | 222 / 182 | 2599 / 2598 | nankt@nan / nankt@nan | 51 / 49 | 91 / 68 |
| 15:00 | 1575 / 1142 | 201 / 152 | 2599 / 2598 | nankt@nan / nankt@nan | 50 / 48 | 73 / 43 |
| 16:00 | 690 / 858 | 89 / 106 | 2599 / 2598 | nankt@nan / nankt@nan | 47 / 46 | 14 / 19 |
| 17:00 | 246 / 242 | 38 / 16 | 2599 / 2598 | nankt@nan / nankt@nan | 44 / 44 | 3 / -0 |
| 18:00 | 245 / 79 | 37 / 0 | 2599 / 2598 | nankt@nan / nankt@nan | 42 / 40 | 3 / -0 |
| 19:00 | 284 / 79 | 58 / 0 | 2599 / 2598 | nankt@nan / nankt@nan | 41 / 40 | 10 / -0 |
| 20:00 | 79 / 79 | 0 / 0 | 2599 / 2598 | nankt@nan / nankt@nan | 40 / 38 | -0 / -0 |

### Index_LZ (47.818, -121.567; grid point 47.759, -121.571; terrain 3122 ft)

| local | BL top NAM/HRRR ft | w* NAM/HRRR fpm | ceiling NAM/HRRR ft | BL wind NAM/HRRR | T2 NAM/HRRR F | HFX NAM/HRRR |
|---|---|---|---|---|---|---|
| 08:00 | 0 / 0 | 0 / 0 | 3122 / 3122 | 2kt@260 / 3kt@238 | 48 / 42 | 0 / 0 |
| 09:00 | 80 / 80 | 0 / 0 | 3122 / 3122 | nankt@nan / nankt@nan | 48 / 46 | -0 / -0 |
| 10:00 | 502 / 473 | 96 / 91 | 3122 / 3122 | nankt@nan / nankt@nan | 50 / 48 | 23 / 21 |
| 11:00 | 1196 / 929 | 169 / 152 | 3122 / 3122 | nankt@nan / nankt@nan | 50 / 49 | 56 / 52 |
| 12:00 | 1445 / 1248 | 202 / 187 | 3122 / 3122 | nankt@nan / nankt@nan | 50 / 49 | 80 / 73 |
| 13:00 | 1626 / 1192 | 219 / 178 | 3122 / 3122 | nankt@nan / nankt@nan | 49 / 48 | 90 / 65 |
| 14:00 | 1636 / 1133 | 217 / 173 | 3122 / 3122 | nankt@nan / nankt@nan | 49 / 47 | 87 / 63 |
| 15:00 | 1497 / 1116 | 198 / 153 | 3122 / 3122 | nankt@nan / nankt@nan | 48 / 46 | 73 / 44 |
| 16:00 | 954 / 854 | 103 / 106 | 3122 / 3122 | nankt@nan / nankt@nan | 45 / 44 | 16 / 19 |
| 17:00 | 528 / 444 | 56 / 39 | 3122 / 3122 | nankt@nan / nankt@nan | 42 / 42 | 5 / 2 |
| 18:00 | 297 / 79 | 61 / 0 | 3122 / 3122 | nankt@nan / nankt@nan | 41 / 38 | 11 / -0 |
| 19:00 | 467 / 79 | 75 / 0 | 3122 / 3122 | nankt@nan / nankt@nan | 40 / 39 | 13 / -0 |
| 20:00 | 78 / 78 | 0 / 0 | 3122 / 3122 | nankt@nan / nankt@nan | 38 / 37 | -0 / -0 |

## Windgram montages

- Tiger: `montage_Tiger.png`
- TigerHikeLookout: `montage_TigerHikeLookout.png`
- TigerLZ: `montage_TigerLZ.png`
- Poo_Poo_Point: `montage_Poo_Poo_Point.png`
- West_Tiger_3: `montage_West_Tiger_3.png`
- West_Tiger_2: `montage_West_Tiger_2.png`
- West_Tiger_1: `montage_West_Tiger_1.png`
- East_Tiger: `montage_East_Tiger.png`
- Taylor_Mountain: `montage_Taylor_Mountain.png`
- Mitchell_Hill: `montage_Mitchell_Hill.png`
- Grand_Ridge_Park: `montage_Grand_Ridge_Park.png`
- Issaquah_Highlands: `montage_Issaquah_Highlands.png`
- Rattlesnake: `montage_Rattlesnake.png`
- Green_Mtn_Launch: `montage_Green_Mtn_Launch.png`
- Green_Mtn_LZ: `montage_Green_Mtn_LZ.png`
- MtSi: `montage_MtSi.png`
- Mt_Washington: `montage_Mt_Washington.png`
- SquakMountain: `montage_SquakMountain.png`
- McDonald: `montage_McDonald.png`
- Carnation: `montage_Carnation.png`
- 5_Mile: `montage_5_Mile.png`
- Grand_Prospect: `montage_Grand_Prospect.png`
- Bandera_Mountain: `montage_Bandera_Mountain.png`
- Mailbox_Peak: `montage_Mailbox_Peak.png`
- Bergseth: `montage_Bergseth.png`
- Index_Launch: `montage_Index_Launch.png`
- Index_LZ: `montage_Index_LZ.png`
