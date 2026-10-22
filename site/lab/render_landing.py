#!/usr/bin/env python3
"""
Render the per-day landing page for one domain of the unlisted lab pages:
<domain_dir>/index.html linking to each comparison subdirectory
(nam-vs-rrfs/, nam-vs-hrrr/, ...; each the output of ab_compare.py plus its
render_ab.py page) with that pair's pooled afternoon numbers from summary.json.

    python3 render_landing.py <domain_dir> <out.html> --title "..." \
        --meta "cycle=2026-10-21 18z" --meta "run=<url>"

Reuses render_ab.CSS, so it needs `markdown` too (uv run --with markdown ...).
"""
import argparse
import html
import json
import math
from pathlib import Path

from render_ab import CSS

# summary.json pooled keys -> (label, unit, decimals)
METRICS = [
    ("bl_top_ft", "BL top", "ft", 0),
    ("wstar_fpm", "w*", "fpm", 0),
    ("tol_ft", "Soaring ceiling", "ft", 0),
    ("blwind_kt", "BL wind speed", "kt", 1),
    ("blwind_dir", "BL wind direction", "°", 0),
    ("t2_f", "2 m temperature", "°F", 1),
    ("lcl_ft", "Cloud base (LCL)", "ft", 0),
    ("hfx", "Surface heat flux", "W/m²", 0),
]


def num(x, nd, signed=False):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    return f"{x:+.{nd}f}" if signed else f"{x:.{nd}f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("domain_dir")
    ap.add_argument("out_html")
    ap.add_argument("--title", default="A/B comparisons")
    ap.add_argument("--meta", action="append", default=[], help="key=value, shown under the title")
    a = ap.parse_args()

    d = Path(a.domain_dir)
    pairs = []
    order = {"nam-vs-rrfs": 0, "nam-vs-hrrr": 1}
    subs = [p for p in d.iterdir() if p.is_dir() and (p / "summary.json").exists()]
    for sub in sorted(subs, key=lambda p: (order.get(p.name, 9), p.name)):
        s = json.loads((sub / "summary.json").read_text())
        pairs.append((sub.name, s))

    cards = []
    for name, s in pairs:
        la, lb = (s.get("labels") or ["A", "B"])[:2]
        pooled = s.get("pooled") or {}
        rows = []
        for key, label, unit, nd in METRICS:
            m = pooled.get(key)
            if not m:
                continue
            rows.append(
                f"<tr><td>{html.escape(label)} ({html.escape(unit)})</td><td>{num(m.get('median_abs'), nd)}</td>"
                f"<td>{num(m.get('p90_abs'), nd)}</td><td>{num(m.get('bias'), nd, True)}</td><td>{m.get('n', '–')}</td></tr>"
            )
        nsites = len(s.get("sites") or {})
        table = (
            f"<table><thead><tr><th>Metric</th><th>median |Δ|</th><th>p90 |Δ|</th><th>bias ({html.escape(lb)} − {html.escape(la)})</th><th>n</th></tr></thead>"
            f"<tbody>{''.join(rows)}</tbody></table>" if rows else "<p>No pooled numbers in summary.json.</p>"
        )
        cards.append(
            f'<h2><a href="{html.escape(name)}/">{html.escape(la)} vs {html.escape(lb)}</a></h2>'
            f'<p class="meta">Pooled over {nsites} sites, afternoon hours. '
            f'<a href="{html.escape(name)}/">Windgrams, maps and per-site numbers</a> · '
            f'<a href="{html.escape(name)}/summary.json">summary.json</a></p>{table}'
        )

    meta = " · ".join(
        (f'<a href="{html.escape(v)}">run</a>' if k == "run" else f"{html.escape(k)} {html.escape(v)}")
        for k, v in (m.split("=", 1) for m in a.meta if "=" in m)
    )
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>{html.escape(a.title)}</title>
<style>{CSS}</style></head>
<body>
<h1>{html.escape(a.title)}</h1>
<div class="meta">{meta} · <a href="../../">all days</a></div>
<div class="note">Unlisted test page for the RRFS migration: the same WRF chain (4 km → 1.33 km, DrJack physics) run three times, from NAM, RRFS and HRRR as parent models. Each comparison below has its own page. The numbers are an aid to a human review, not a verdict.</div>
{''.join(cards) or '<p>No comparisons for this day (an arm failed; see the run).</p>'}
</body></html>
"""
    Path(a.out_html).write_text(page, encoding="utf-8")
    print(f"wrote {a.out_html} ({len(pairs)} comparisons)")


if __name__ == "__main__":
    main()
