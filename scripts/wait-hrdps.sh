#!/usr/bin/env bash
# wait-hrdps.sh <day> [base_date]  — HRDPS readiness gate for forecast-hrdps.yml.
#
# ECCC's HRDPS continental run has four 48 h cycles a day (00/06/12/18z) and a
# cycle is complete on the Datamart about 3 h after cycle time (00z by ~03:05z,
# 12z by ~15:05z, seen 2026-11-13). The HRDPS legs chain off the end of each
# RRFS run (~03:40z / ~15:42z), so the newest 6-hourly cycle is normally all
# there; this gate confirms it and skips a day the 48 h reach cannot cover.
#
# target = base (default today UTC) + day; newest 6-hourly cycle from the
# current hour; if the window end is past 48 h, ready=false at once (the
# evening chain's day 1 ends at 52 h, like HRRR's). Otherwise poll the data
# root ($RASP_HRDPS_ROOT, the Datamart's /today/ tree by default) for one
# field of the window-end hour: one file per field there, so a late field in
# the set stands for the set. Up to 16 checks x 5 min; on timeout ready=false
# (the day is skipped; an older cycle is not worth it at 2.5 km).
# MSC's usage policy: no directory listings for availability, a meaningful
# User-Agent, no no-cache headers — all respected here.
# Outputs (GITHUB_OUTPUT): ready, target_date, cycle, fhr.
# HRDPS_WAIT_CHECKS=0 does the reach check only (the day-0 legs).
set -uo pipefail
DAY=${1:?usage: wait-hrdps.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 04:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
CYC=$(printf '%02d' $(( (H / 6) * 6 )))
CYC_DATE=$(date -u +%F)
FHR_END=$(( (END_EPOCH - $(date -u -d "$CYC_DATE ${CYC}:00:00Z" +%s)) / 3600 ))
echo "cycle=$CYC" >> "$OUT"; echo "fhr=$FHR_END" >> "$OUT"
echo "Day $DAY → $TARGET_DATE: window ends ${FHR_END}h past newest cycle (${CYC}z); HRDPS reach 48h."
if [ "$FHR_END" -gt 48 ]; then
  echo "::notice::HRDPS can't reach $TARGET_DATE (day $DAY: ${FHR_END}h > 48h). Skipping this day."
  echo "ready=false" >> "$OUT"
  exit 0
fi
MAX=${HRDPS_WAIT_CHECKS:-16}
if [ "$MAX" -eq 0 ]; then echo "ready=true" >> "$OUT"; exit 0; fi

ROOT="${RASP_HRDPS_ROOT:-https://dd.weather.gc.ca/today/model_hrdps/continental/2.5km}"; ROOT="${ROOT%/}"
DC=$(date -u -d "$CYC_DATE" +%Y%m%d)
F=$(printf '%03d' "$FHR_END")
URL="${ROOT}/${CYC}/${F}/${DC}T${CYC}Z_MSC_HRDPS_VGRD_ISBL_0050_RLatLon0.0225_PT${F}H.grib2"
echo "Gate: HRDPS ${CYC}z of ${DC}, day ${DAY} needs f${F}:"
echo "  $URL"
present() { [ "$(curl --http1.1 -sI --max-time 20 -A 'pnw-soaring forecast gate (github.com/nw-paragliding/pnw-soaring)' -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
for attempt in $(seq 1 "$MAX"); do
  if present "$URL"; then
    echo "HRDPS ${CYC}z f${F} is on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
    echo "ready=true" >> "$OUT"
    exit 0
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] f${F} not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::HRDPS ${CYC}z f${F} still missing on ${ROOT} after $(( (MAX - 1) * 5 )) min — skipping day $DAY."
echo "ready=false" >> "$OUT"
