#!/usr/bin/env bash
# wait-hrrr.sh <day> [base_date]  — HRRR readiness gate for forecast-hrrr.yml.
#
# The HRRR crons (01:15z / 07:15z / 13:00z) fire ~15 min after the newest
# 00/06/12/18z cycle starts publishing, well before the deep hour that ends the
# day-1 soaring window (8pm PDT = 03z the next day): 06z f45 ≈ 07:45z, 12z f39 ≈
# 13:40z on the AWS mirror. Without a gate the pipeline's --target-date
# auto-cycle would take the previous cycle six hours deeper (13:00z), or find no
# covering cycle at all (07:15z: 00z would need f51) and fall back to near-term
# data the Guard then throws away after a full WRF run.
#
# So: target = base (default today UTC) + day; derive the newest 6-hourly cycle
# from the current hour; if the window end is past HRRR's 48 h reach, report
# ready=false at once (01:15z run's day 1: 51 h). Otherwise poll the data root
# ($RASP_HRRR_ROOT: AWS mirror or NOMADS) until BOTH wrfprs and wrfsfc and their
# .idx sidecars exist for that hour — the pipeline's own readiness test. Up to
# 26 checks x 3 min = 75 min; on timeout ready=false (the day is skipped: an
# older, deeper cycle is not worth rendering).
#
# Runs in one small ubuntu-24.04 job that the day-1 arm matrix `needs:`, so the
# wait holds one cheap runner instead of one arm runner per region.
# Outputs (GITHUB_OUTPUT): ready, target_date, cycle, fhr.
# HRRR_WAIT_CHECKS=0 does the 48 h reach check only (no polling).
set -uo pipefail
DAY=${1:?usage: wait-hrrr.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 03:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
CYC=$(printf '%02d' $(( (H / 6) * 6 )))
CYC_DATE=$(date -u +%F)
FHR_END=$(( (END_EPOCH - $(date -u -d "$CYC_DATE ${CYC}:00:00Z" +%s)) / 3600 ))
echo "cycle=$CYC" >> "$OUT"; echo "fhr=$FHR_END" >> "$OUT"
echo "Day $DAY → $TARGET_DATE: window ends ${FHR_END}h past newest cycle (${CYC}z); HRRR reach 48h."
if [ "$FHR_END" -gt 48 ]; then
  echo "::notice::HRRR can't reach $TARGET_DATE (day $DAY: ${FHR_END}h > 48h horizon). Skipping this day — NAM/RRFS carry it."
  echo "ready=false" >> "$OUT"
  exit 0
fi

# HRRR_WAIT_CHECKS=0: reach check only (the day-0 legs, which don't wait).
MAX=${HRRR_WAIT_CHECKS:-26}
if [ "$MAX" -eq 0 ]; then
  echo "ready=true" >> "$OUT"
  exit 0
fi

ROOT="${RASP_HRRR_ROOT:-https://noaa-hrrr-bdp-pds.s3.amazonaws.com}"; ROOT="${ROOT%/}"
DC=$(date -u -d "$CYC_DATE" +%Y%m%d)
F=$(printf '%02d' "$FHR_END")
PRS="${ROOT}/hrrr.${DC}/conus/hrrr.t${CYC}z.wrfprsf${F}.grib2"
SFC="${ROOT}/hrrr.${DC}/conus/hrrr.t${CYC}z.wrfsfcf${F}.grib2"
echo "Gate: HRRR ${CYC}z of ${DC}, day ${DAY} needs f${F} (wrfprs + wrfsfc + .idx):"
echo "  $PRS"
echo "  $SFC"
# Present = HTTP 200 (a throttling 302 from NOMADS is not "present").
present() { [ "$(curl --http1.1 -sI --max-time 20 -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
for attempt in $(seq 1 "$MAX"); do
  if present "$PRS" && present "$SFC" && present "$PRS.idx" && present "$SFC.idx"; then
    echo "HRRR ${CYC}z f${F} is on ${ROOT} (check $attempt, waited $(( (attempt - 1) * 3 )) min, $(date -u +%H:%M)z)."
    echo "ready=true" >> "$OUT"
    exit 0
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] f${F} not published yet (check $attempt/$MAX) — retrying in 3 min"
    sleep 180
  fi
done
echo "::notice::HRRR ${CYC}z f${F} still missing on ${ROOT} after $(( (MAX - 1) * 3 )) min; skipping $TARGET_DATE (day $DAY) rather than rendering an older, deeper cycle."
echo "ready=false" >> "$OUT"
