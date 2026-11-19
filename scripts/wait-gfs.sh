#!/usr/bin/env bash
# wait-gfs.sh <day> [base_date]  — GFS readiness gate for forecast-gfs.yml.
#
# The GFS outlook runs chain off the end of each RRFS run (~03:40z / ~15:42z),
# and the newest 6-hourly GFS cycle has usually just finished publishing: on the
# AWS mirror the 00z cycle's f087 lands ~03:55z, f099 ~03:57z, f123 ~04:03z
# (12z: 15:57z / 16:02z / 16:07z), the whole run within ~4 h 15 of cycle time.
#
# target = base (default today UTC) + day. The legs fetch the pipeline's
# soaring window, 15z on the target date to 03z the next day (8am-8pm local
# with the pipeline's fixed -7 h offset), as 3-hourly files: f087, f090 ... f099
# of a 00z cycle for day 3, f111 ... f123 for day 4. Candidates: the newest
# 6-hourly cycle by the clock and the one before it (GFS reaches 384 h, so both
# cover days 3 and 4). A candidate is ready only when EVERY file of that set
# and its .idx are on the data root ($RASP_GFS_ROOT, the AWS mirror by default):
# the mirror does not post a cycle's hours in order (2026-11-17: f087 and f099
# of 00z were up while f090 was not, and the leg died on the 404 two minutes
# after a last-hour-only gate had passed). Each check probes the newest cycle first; the
# previous cycle is accepted only when the newest is not imminent: not due
# (cycle + 4 h 15) within the remaining poll budget, or overdue by more than
# 30 min. So the production chains, which fire 15–25 min before the newest
# cycle lands, still wait for it, while a hand-started run in the hours before
# the newest cycle exists takes the previous one at once instead of sitting
# through the whole wait. Up to 16 checks x 5 min; on timeout it proceeds
# anyway (exit 0, ready=false): the pipeline's --target-date auto-cycle finds
# an older covering cycle itself.
#
# Runs in one small ubuntu-24.04 job that the arm matrix `needs:`, so the wait
# holds one cheap runner. Outputs (GITHUB_OUTPUT): ready, skip, target_date,
# cycle, fhr (the set's last hour) and fhrs (the whole set) of the cycle found,
# or of the newest when none is.
set -uo pipefail
DAY=${1:?usage: wait-gfs.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

# GFS is the outlook for the days no short-range model has reached. When RRFS,
# HRRR or HRDPS already published this date (a hand-started run asking for a
# near day), the leg has nothing to add and is skipped (output skip=true): the
# publish step retires a GFS day the moment another model publishes it anyway.
SITE_DATA=${SITE_DATA_BASE:-https://pub-de96e47b1e91464bb2959747602c1914.r2.dev}
for m in rrfs hrrr hrdps; do
  if [ "$(curl -sI --max-time 20 -o /dev/null -w '%{http_code}' -A 'pnw-soaring forecast gate (github.com/nw-paragliding/pnw-soaring)' "$SITE_DATA/forecasts/$TARGET_DATE/$m/metadata.json")" = 200 ]; then
    echo "::warning::$(echo "$m" | tr a-z A-Z) already covers $TARGET_DATE — the GFS day-$DAY leg is skipped."
    { echo "skip=true"; echo "ready=false"; } >> "$OUT"; exit 0
  fi
done
echo "skip=false" >> "$OUT"

REACH=384
DUE_AFTER=$(( 4 * 3600 + 15 * 60 ))   # the mirror has a whole cycle by cycle + 4 h 15
GRACE=1800                            # accept the previous cycle once the newest is this late
START_EPOCH=$(date -u -d "$TARGET_DATE 15:00:00Z" +%s)
END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 03:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
NEWEST=$(date -u -d "$(date -u +%F) $(printf '%02d' $(( (H / 6) * 6 ))):00:00Z" +%s)
PREV=$(( NEWEST - 6 * 3600 ))
# The set the legs fetch: 3-hourly from the window's first hour to its last,
# like the pipeline (cycles sit on 6 h and the window on 3 h, so every hour is
# a multiple of 3 and exists in both the hourly and the 3-hourly part of a run).
fhr_of()  { echo $(( (END_EPOCH - $1) / 3600 )); }
fhrs_of() { local f; for (( f = (START_EPOCH - $1) / 3600; f <= (END_EPOCH - $1) / 3600; f += 3 )); do printf '%03d ' "$f"; done; }
cyc_of() { date -u -d "@$1" +%H; }
dc_of()  { date -u -d "@$1" +%Y%m%d; }
label_of() { local s=($(fhrs_of "$1")); echo "$(cyc_of "$1")z f${s[0]}–f${s[${#s[@]}-1]}"; }
url_of() { echo "${ROOT}/gfs.$(dc_of "$1")/$(cyc_of "$1")/atmos/gfs.t$(cyc_of "$1")z.pgrb2.0p25.f$2"; }
emit() { { echo "cycle=$(cyc_of "$1")"; echo "fhr=$(fhr_of "$1")"; echo "fhrs=$(fhrs_of "$1" | sed 's/ $//')"; echo "ready=$2"; } >> "$OUT"; }

FHR_NEWEST=$(fhr_of "$NEWEST")
echo "Day $DAY → $TARGET_DATE: window ends ${FHR_NEWEST}h past newest cycle ($(cyc_of "$NEWEST")z); GFS reach ${REACH}h."
if [ "$FHR_NEWEST" -gt "$REACH" ]; then
  echo "::warning::GFS can't reach $TARGET_DATE (${FHR_NEWEST}h > ${REACH}h)."
  emit "$NEWEST" false
  exit 0
fi

ROOT="${RASP_GFS_ROOT:-https://noaa-gfs-bdp-pds.s3.amazonaws.com}"; ROOT="${ROOT%/}"
CANDS=("$NEWEST")
[ "$(fhr_of "$PREV")" -le "$REACH" ] && CANDS+=("$PREV")
echo "Gate: day ${DAY} needs every 3-hourly file (+ .idx) of the window from one of (newest first):"
for c in "${CANDS[@]}"; do echo "  GFS $(label_of "$c") of $(dc_of "$c"): $(url_of "$c" "$(fhrs_of "$c" | cut -d' ' -f1)") ..."; done
MAX=${GFS_WAIT_CHECKS:-16}
DUE=$(( NEWEST + DUE_AFTER ))
# Present = HTTP 200 (a throttling 302 from NOMADS is not "present").
present() { [ "$(curl --http1.1 -sI --max-time 20 -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
# The first hour of the cycle's set whose file or .idx is missing; empty when complete.
missing_of() { local f u; for f in $(fhrs_of "$1"); do u=$(url_of "$1" "$f"); { present "$u" && present "$u.idx"; } || { echo "f$f"; return; }; done; }
for attempt in $(seq 1 "$MAX"); do
  MISSING=$(missing_of "$NEWEST")
  if [ -z "$MISSING" ]; then
    echo "GFS $(label_of "$NEWEST") is all on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
    emit "$NEWEST" true; exit 0
  fi
  NOW=$(date -u +%s); LEFT=$(( (MAX - attempt) * 300 ))
  if [ "${#CANDS[@]}" -gt 1 ] && { [ $(( NOW + LEFT )) -lt "$DUE" ] || [ "$NOW" -gt $(( DUE + GRACE )) ]; }; then
    if [ -z "$(missing_of "$PREV")" ]; then
      echo "GFS $(label_of "$NEWEST") is not imminent (due ~$(date -u -d "@$DUE" +%H:%M)z): taking $(label_of "$PREV") of $(dc_of "$PREV"), all on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
      emit "$PREV" true; exit 0
    fi
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] $(cyc_of "$NEWEST")z $MISSING (or its .idx) not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::GFS: neither $(label_of "$NEWEST") nor $(label_of "$PREV") is complete on ${ROOT} after $(( (MAX - 1) * 5 )) min — proceeding; the pipeline's auto-cycle picks what covers $TARGET_DATE."
emit "$NEWEST" false
