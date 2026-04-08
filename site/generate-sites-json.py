#!/usr/bin/env python3
"""Convert sites CSV to JSON for the Leaflet map."""
import json
import sys
from pathlib import Path

def csv_to_json(csv_path):
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
            })
    return sites

if __name__ == "__main__":
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "sites/issaquah.csv"
    sites = csv_to_json(csv_path)
    print(json.dumps(sites, indent=2))
