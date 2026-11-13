#!/usr/bin/env bash
# wait-gfs.sh <day> [base_date]  — GFS readiness gate for forecast-gfs.yml.
#
# The GFS outlook runs chain off the end of each RRFS run (~03:40z / ~15:42z),
# and the newest 6-hourly GFS cycle has usually just finished publishing: on the
# AWS mirror the 00z cycle's f087 lands ~03:55z, f099 ~03:57z, f123 ~04:03z
# (12z: 15:57z / 16:02z / 16:07z), the whole run within ~35 min of f000.
#
# So: target = base (default today UTC) + day; derive the newest 6-hourly cycle
# from the current hour; poll the data root ($RASP_GFS_ROOT, the AWS mirror by
# default) until the window-end hour's file and its .idx exist. Up to 16 checks
# x 5 min = 75 min; on timeout it proceeds anyway (exit 0, ready=false): GFS
# reaches 384 h, so --target-date still finds an older cycle that covers the
# day (unlike RRFS day 2, which has none).
#
# Runs in one small ubuntu-24.04 job that the arm matrix `needs:`, so the wait
# holds one cheap runner. Outputs (GITHUB_OUTPUT): ready, target_date, cycle, fhr.
set -uo pipefail
DAY=${1:?usage: wait-gfs.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

# Soaring window ends 8pm Pacific = 03z (PST) / 04z (PDT) the next day; take 04z
# so the gate's hour is never earlier than the pipeline's.
END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 04:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
CYC=$(printf '%02d' $(( (H / 6) * 6 )))
CYC_DATE=$(date -u +%F)
FHR_END=$(( (END_EPOCH - $(date -u -d "$CYC_DATE ${CYC}:00:00Z" +%s)) / 3600 ))
# GFS is hourly to f120 and 3-hourly after: round up to the 3 h grid past 120.
if [ "$FHR_END" -gt 120 ]; then FHR_END=$(( (FHR_END + 2) / 3 * 3 )); fi
echo "cycle=$CYC" >> "$OUT"; echo "fhr=$FHR_END" >> "$OUT"
echo "Day $DAY → $TARGET_DATE: window ends ${FHR_END}h past newest cycle (${CYC}z); GFS reach 384h."
if [ "$FHR_END" -gt 384 ]; then
  echo "::warning::GFS can't reach $TARGET_DATE (${FHR_END}h > 384h)."
  echo "ready=false" >> "$OUT"
  exit 0
fi

ROOT="${RASP_GFS_ROOT:-https://noaa-gfs-bdp-pds.s3.amazonaws.com}"; ROOT="${ROOT%/}"
DC=$(date -u -d "$CYC_DATE" +%Y%m%d)
F=$(printf '%03d' "$FHR_END")
URL="${ROOT}/gfs.${DC}/${CYC}/atmos/gfs.t${CYC}z.pgrb2.0p25.f${F}"
echo "Gate: GFS ${CYC}z of ${DC}, day ${DAY} needs f${F} (+ .idx):"
echo "  $URL"
MAX=${GFS_WAIT_CHECKS:-16}
# Present = HTTP 200 (a throttling 302 from NOMADS is not "present").
present() { [ "$(curl --http1.1 -sI --max-time 20 -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
for attempt in $(seq 1 "$MAX"); do
  if present "$URL" && present "$URL.idx"; then
    echo "GFS ${CYC}z f${F} is on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
    echo "ready=true" >> "$OUT"
    exit 0
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] f${F} not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::GFS ${CYC}z f${F} still missing on ${ROOT} after $(( (MAX - 1) * 5 )) min — proceeding; auto-cycle may pick the previous cycle."
echo "ready=false" >> "$OUT"
