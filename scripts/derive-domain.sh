#!/usr/bin/env bash
# derive-domain.sh <domain.yaml> <model> [out.yaml]
#
# Build a forecast job's domain config from a region's NAM config
# (domains/<region>.yaml) at run time, instead of keeping one file per model:
#   nam   the file as is
#   rrfs  `model: rrfs` swapped in, nothing else changes
#   hrrr  `model: hrrr` swapped in, plus the DrJack-chain override keys
#         (direct_reader .. sfc_idx_subset) copied verbatim from
#         domains/cascades-hrrr.yaml, the single source of truth for them: HRRR as initial/boundary conditions for
#         the same 4 km -> 1.33 km chain, not the direct reader / 1 km nest.
# The geometry is never touched, so all three models share the tile's geo_em.
# Writes to out.yaml (default stdout).
set -euo pipefail
SRC=${1:?usage: derive-domain.sh <domain.yaml> <nam|rrfs|hrrr> [out.yaml]}
MODEL=${2:?model}
OUT=${3:-/dev/stdout}
HERE=$(cd "$(dirname "$0")/.." && pwd)
HRRR_REF="$HERE/domains/cascades-hrrr.yaml"

grep -qE '^model: *[a-z]+' "$SRC" || { echo "derive-domain: no 'model:' line in $SRC" >&2; exit 1; }
case "$MODEL" in
  nam|rrfs)
    sed -E "s/^model: *[a-z]+.*/model: $MODEL/" "$SRC" > "$OUT" ;;
  hrrr)
    # The block must end at the grid-section marker, or the reference file's own
    # geometry (center_lat/lon ...) would be copied over the tile's.
    grep -q '^# ---- grid + physics' "$HRRR_REF" || { echo "derive-domain: no '# ---- grid + physics' marker in $HRRR_REF" >&2; exit 1; }
    {
      sed -E 's/^model: *[a-z]+.*/model: hrrr/' "$SRC"
      echo
      echo "# ---- hrrr: DrJack-chain overrides, verbatim from domains/cascades-hrrr.yaml"
      # The block from `direct_reader:` up to (not including) the grid section.
      awk '/^direct_reader:/{p=1} /^# ---- grid \+ physics/{p=0} p' "$HRRR_REF"
    } > "$OUT"
    if [ "$OUT" != /dev/stdout ]; then
      grep -q '^direct_reader: *false' "$OUT" || { echo "derive-domain: hrrr override block missing" >&2; exit 1; }
    fi ;;
  *) echo "derive-domain: unknown model '$MODEL'" >&2; exit 1 ;;
esac
