#!/usr/bin/env python3
"""Build the map's sites.json from every region's site list.

A region is a tile with both domains/<region>.yaml and sites/<region>-sites.csv
(so sites/pnw-sites.csv, which has no tile, is ignored). Each site is emitted
with its region; the frontend loads its windgram from
forecasts/<date|latest>/<model>/<region>/<name>_windgram.png.

Usage: generate-sites-json.py [repo_root]   (default: the repo this file is in)
"""
import json
import sys
from pathlib import Path


def csv_to_sites(csv_path, region):
    sites = []
    for line in Path(csv_path).read_text().strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.replace(",", " ").split()
        if len(parts) >= 3:
            sites.append({
                "name": parts[0],
                "lat": float(parts[1]),
                "lon": float(parts[2]),
                "region": region,
            })
    return sites


def all_sites(root):
    root = Path(root)
    sites = []
    for csv_path in sorted((root / "sites").glob("*-sites.csv")):
        region = csv_path.name[: -len("-sites.csv")]
        if not (root / "domains" / f"{region}.yaml").exists():
            continue
        sites.extend(csv_to_sites(csv_path, region))
    return sites


if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
    sites = all_sites(root)
    if not sites:
        sys.exit(f"no region site lists found under {root}")
    print(json.dumps(sites, indent=2))
