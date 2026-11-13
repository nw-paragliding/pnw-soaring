#!/usr/bin/env bash
# wait-gfs.sh <day> [base_date]  — GFS readiness gate for forecast-gfs.yml.
#
# The GFS outlook runs chain off the end of each RRFS run (~03:40z / ~15:42z),
# and the newest 6-hourly GFS cycle has usually just finished publishing: on the
# AWS mirror the 00z cycle's f087 lands ~03:55z, f099 ~03:57z, f123 ~04:03z
# (12z: 15:57z / 16:02z / 16:07z), the whole run within ~4 h 15 of cycle time.
#
# target = base (default today UTC) + day; the window ends at 04z the next day
# (8pm Pacific; 04z so the gate's hour is never earlier than the pipeline's).
# Candidates: the newest 6-hourly cycle by the clock and the one before it
# (GFS reaches 384 h, so both cover days 3 and 4). A candidate is ready when
# its window-end hour's file and .idx are on the data root ($RASP_GFS_ROOT,
# the AWS mirror by default). Each check probes the newest cycle first; the
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
# holds one cheap runner. Outputs (GITHUB_OUTPUT): ready, target_date, cycle,
# fhr (of the cycle found, or the newest when none is).
set -uo pipefail
DAY=${1:?usage: wait-gfs.sh <day> [base_date]}
BASE=${2:-}
[ -z "$BASE" ] && BASE=$(date -u +%F)
OUT=${GITHUB_OUTPUT:-/dev/null}
TARGET_DATE=$(date -u -d "$BASE +${DAY} days" +%F)
echo "target_date=$TARGET_DATE" >> "$OUT"

REACH=384
DUE_AFTER=$(( 4 * 3600 + 15 * 60 ))   # the mirror has a whole cycle by cycle + 4 h 15
GRACE=1800                            # accept the previous cycle once the newest is this late
END_EPOCH=$(date -u -d "$(date -u -d "$TARGET_DATE +1 day" +%F) 04:00:00Z" +%s)
H=$(( 10#$(date -u +%H) ))
NEWEST=$(date -u -d "$(date -u +%F) $(printf '%02d' $(( (H / 6) * 6 ))):00:00Z" +%s)
PREV=$(( NEWEST - 6 * 3600 ))
# GFS is hourly to f120 and 3-hourly after: round up to the 3 h grid past 120.
fhr_of() { local f=$(( (END_EPOCH - $1) / 3600 )); [ "$f" -gt 120 ] && f=$(( (f + 2) / 3 * 3 )); echo "$f"; }
cyc_of() { date -u -d "@$1" +%H; }
dc_of()  { date -u -d "@$1" +%Y%m%d; }
label_of() { echo "$(cyc_of "$1")z f$(printf '%03d' "$(fhr_of "$1")")"; }
url_of() { echo "${ROOT}/gfs.$(dc_of "$1")/$(cyc_of "$1")/atmos/gfs.t$(cyc_of "$1")z.pgrb2.0p25.f$(printf '%03d' "$(fhr_of "$1")")"; }
emit() { { echo "cycle=$(cyc_of "$1")"; echo "fhr=$(fhr_of "$1")"; echo "ready=$2"; } >> "$OUT"; }

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
echo "Gate: day ${DAY} needs the window-end hour (+ .idx) of one of (newest first):"
for c in "${CANDS[@]}"; do echo "  GFS $(label_of "$c") of $(dc_of "$c"): $(url_of "$c")"; done
MAX=${GFS_WAIT_CHECKS:-16}
DUE=$(( NEWEST + DUE_AFTER ))
# Present = HTTP 200 (a throttling 302 from NOMADS is not "present").
present() { [ "$(curl --http1.1 -sI --max-time 20 -o /dev/null -w '%{http_code}' "$1")" = 200 ]; }
ready_at() { present "$(url_of "$1")" && present "$(url_of "$1").idx"; }
for attempt in $(seq 1 "$MAX"); do
  if ready_at "$NEWEST"; then
    echo "GFS $(label_of "$NEWEST") is on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
    emit "$NEWEST" true; exit 0
  fi
  NOW=$(date -u +%s); LEFT=$(( (MAX - attempt) * 300 ))
  if [ "${#CANDS[@]}" -gt 1 ] && { [ $(( NOW + LEFT )) -lt "$DUE" ] || [ "$NOW" -gt $(( DUE + GRACE )) ]; }; then
    if ready_at "$PREV"; then
      echo "GFS $(label_of "$NEWEST") is not imminent (due ~$(date -u -d "@$DUE" +%H:%M)z): taking $(label_of "$PREV") of $(dc_of "$PREV"), on ${ROOT} (check $attempt, $(date -u +%H:%M)z)."
      emit "$PREV" true; exit 0
    fi
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] $(label_of "$NEWEST") not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::GFS: neither $(label_of "$NEWEST") nor $(label_of "$PREV") is on ${ROOT} after $(( (MAX - 1) * 5 )) min — proceeding; the pipeline's auto-cycle picks what covers $TARGET_DATE."
emit "$NEWEST" false
