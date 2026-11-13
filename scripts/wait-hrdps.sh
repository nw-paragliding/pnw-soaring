#!/usr/bin/env bash
# wait-hrdps.sh <day> [base_date]  — HRDPS readiness gate for forecast-hrdps.yml.
#
# ECCC's HRDPS continental run has four 48 h cycles a day (00/06/12/18z) and a
# cycle is complete on the Datamart about 3 h after cycle time (00z by ~03:05z,
# 12z by ~15:05z, seen 2026-11-13), so for the first three hours of every six
# the newest cycle by the clock does not exist yet. The HRDPS legs chain off
# the end of each RRFS run (~03:40z / ~15:42z), when the newest cycle is
# normally all there; this gate confirms that, falls back to the cycle before
# it when the newest is not out (not due yet, or late), and skips a day the
# 48 h reach cannot cover.
#
# target = base (default today UTC) + day; the window ends at 04z the next
# day (8pm PST). Candidates: the newest 6-hourly cycle and the one before it,
# each kept only while the window end is within 48 h of it. A candidate is
# ready when one field of its window-end hour is on the data root
# ($RASP_HRDPS_ROOT, the Datamart's /today/ tree by default): one file per
# field there, so a late field in the set stands for the set. Each check
# probes the newest cycle first and takes the first candidate found, so an
# off-schedule start (a branch push at 12:27z, say) renders day 1 from the
# 06z cycle at once instead of waiting 75 min for a 12z that lands at 15:05z.
# Up to 16 checks x 5 min; on timeout ready=false (the day is skipped). The
# pipeline picks its own cycle the same way (newest complete), so the two
# agree.
# MSC's usage policy: no directory listings for availability, a meaningful
# User-Agent, no no-cache headers — all respected here.
# Outputs (GITHUB_OUTPUT): ready, target_date, cycle, fhr (of the cycle found,
# or the newest when nothing is).
# HRDPS_WAIT_CHECKS=0 does the reach check only (the day-0 legs).
set -uo pipefail
DAY=${1:?usage: wait-hrdps.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

REACH=48
END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 04:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
NEWEST=$(date -u -d "$(date -u +%F) $(printf '%02d' $(( (H / 6) * 6 ))):00:00Z" +%s)
fhr_of() { echo $(( (END_EPOCH - $1) / 3600 )); }
cyc_of() { date -u -d "@$1" +%H; }
dc_of()  { date -u -d "@$1" +%Y%m%d; }
label_of() { echo "$(cyc_of "$1")z f$(printf '%03d' "$(fhr_of "$1")")"; }
emit() { { echo "cycle=$(cyc_of "$1")"; echo "fhr=$(fhr_of "$1")"; echo "ready=$2"; } >> "$OUT"; }

FHR_NEWEST=$(fhr_of "$NEWEST")
echo "Day $DAY → $TARGET_DATE: window ends ${FHR_NEWEST}h past newest cycle ($(cyc_of "$NEWEST")z); HRDPS reach ${REACH}h."
if [ "$FHR_NEWEST" -gt "$REACH" ]; then
  echo "::notice::HRDPS can't reach $TARGET_DATE (day $DAY: ${FHR_NEWEST}h > ${REACH}h). Skipping this day."
  emit "$NEWEST" false
  exit 0
fi
MAX=${HRDPS_WAIT_CHECKS:-16}
if [ "$MAX" -eq 0 ]; then emit "$NEWEST" true; exit 0; fi

ROOT="${RASP_HRDPS_ROOT:-https://dd.weather.gc.ca/today/model_hrdps/continental/2.5km}"; ROOT="${ROOT%/}"
UA='pnw-soaring forecast gate (github.com/nw-paragliding/pnw-soaring)'
# Candidates, newest first; the cycle before it only while it still reaches.
CANDS=("$NEWEST")
PREV=$(( NEWEST - 6 * 3600 ))
[ "$(fhr_of "$PREV")" -le "$REACH" ] && CANDS+=("$PREV")
url_of() {
  local f; f=$(printf '%03d' "$(fhr_of "$1")")
  echo "${ROOT}/$(cyc_of "$1")/${f}/$(dc_of "$1")T$(cyc_of "$1")Z_MSC_HRDPS_VGRD_ISBL_0050_RLatLon0.0225_PT${f}H.grib2"
}
echo "Gate: day ${DAY} needs the window-end hour of one of (newest first):"
for c in "${CANDS[@]}"; do echo "  HRDPS $(label_of "$c") of $(dc_of "$c"): $(url_of "$c")"; done
present() { [ "$(curl --http1.1 -sI --max-time 20 -A "$UA" -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
for attempt in $(seq 1 "$MAX"); do
  for c in "${CANDS[@]}"; do
    if present "$(url_of "$c")"; then
      echo "HRDPS $(label_of "$c") is on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
      emit "$c" true
      exit 0
    fi
  done
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::HRDPS: no cycle that reaches $TARGET_DATE is on ${ROOT} after $(( (MAX - 1) * 5 )) min — skipping day $DAY."
emit "$NEWEST" false
