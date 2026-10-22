#!/usr/bin/env bash
# wait-rrfs.sh <day>  — RRFS readiness gate for forecast-rrfs.yml.
#
# forecast-rrfs.yml rides the NAM crons (02:05z / 14:00z), but RRFS publishes
# ~40 min AFTER NAM for the same forecast hour. Without a gate the pipeline's
# --target-date auto-cycle would find the newest cycle still incomplete and fall
# back to the previous (6 h older) one — the stale cycle problem. So: derive the
# newest 00z/12z cycle from the current hour and poll NOMADS until BOTH the
# prslev and 2dfld files exist for the last forecast hour the day needs — f27
# for day 0 (its soaring window ends 03z the next day = 00z+27h), f51 for day 1.
# Expected arrival: 00z f27 ≈ 02:20z, f51 ≈ 02:50z; 12z f27 ≈ 14:20z,
# f51 ≈ 14:50z. 16 checks x 5 min = up to 75 min of waiting, after which it
# proceeds anyway (exit 0, ready=false): --target-date still renders from the
# freshest cycle that covers the day, which beats no forecast.
#
# Runs in a small ubuntu-24.04 job that the arm forecast matrix `needs:`, so the
# wait holds one cheap runner instead of one arm runner per region.
# Env: RASP_RRFS_ROOT (NOMADS root), GITHUB_OUTPUT (optional).
set -uo pipefail
DAY=${1:?usage: wait-rrfs.sh <day>}
H=$(( 10#$(date -u +%H) ))
CYC=$(printf '%02d' $(( (H / 12) * 12 )))
CDATE=$(date -u +%Y%m%d)
FHR=$(printf '%03d' $(( 27 + 24 * DAY )))
ROOT="${RASP_RRFS_ROOT%/}"
PRS="${ROOT}/rrfs.${CDATE}/${CYC}/rrfs.t${CYC}z.prslev.3km.f${FHR}.conus.grib2"
SFC="${ROOT}/rrfs.${CDATE}/${CYC}/rrfs.t${CYC}z.2dfld.3km.f${FHR}.conus.grib2"
OUT=${GITHUB_OUTPUT:-/dev/null}
echo "Gate: RRFS ${CYC}z cycle of ${CDATE}, day ${DAY} needs f${FHR} (prslev + 2dfld):"
echo "  $PRS"
echo "  $SFC"
MAX=${RRFS_WAIT_CHECKS:-16}
for attempt in $(seq 1 "$MAX"); do
  if curl --http1.1 -sfI "$PRS" -o /dev/null && curl --http1.1 -sfI "$SFC" -o /dev/null; then
    echo "RRFS ${CYC}z f${FHR} is on NOMADS (check $attempt, $(date -u +%H:%M)z)."
    echo "ready=true" >> "$OUT"
    exit 0
  fi
  if [ "$attempt" -lt "$MAX" ]; then
    echo "[$(date -u +%H:%M)z] f${FHR} not published yet (check $attempt/$MAX) — retrying in 5 min"
    sleep 300
  fi
done
echo "::warning::RRFS ${CYC}z f${FHR} still missing on NOMADS after $(( (MAX - 1) * 5 )) min — proceeding; auto-cycle may pick the previous cycle."
echo "ready=false" >> "$OUT"
