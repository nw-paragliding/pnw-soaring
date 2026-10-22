#!/usr/bin/env python3
"""
Render one A/B comparison directory (output of rasp-windgram's
scripts/ab_compare.py: compare.md, montage_<site>.png, diffmap_tol.png,
summary.json) as a standalone HTML page for the unlisted lab pages.

    python3 render_ab.py <compare_dir> <out.html> --title "..." \
        --meta "domain=phoenix" --meta "cycle=2026-10-21 18z" --meta "run=<url>"

Needs the `markdown` package (uv run --with markdown ...).
"""
import argparse
import html
from pathlib import Path

import markdown

CSS = """
:root { color-scheme: light dark; --fg:#1b1b1f; --bg:#fafaf7; --mute:#6b6b70; --line:#dedcd6; --acc:#b4530a; }
@media (prefers-color-scheme: dark) { :root { --fg:#ecebe6; --bg:#15161a; --mute:#9a9aa2; --line:#2e2f36; --acc:#f0a35a; } }
body { margin:0; padding:24px 16px 64px; font:15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif; color:var(--fg); background:var(--bg); max-width:1400px; margin:0 auto; }
h1 { font-size:1.5rem; margin:0 0 4px; } h2 { font-size:1.15rem; margin-top:2em; border-bottom:1px solid var(--line); padding-bottom:4px; }
h3 { font-size:1rem; margin-top:1.5em; }
.meta { color:var(--mute); font-size:.9rem; margin-bottom:1.5em; } .meta a { color:var(--acc); }
.note { border-left:3px solid var(--acc); padding:6px 12px; color:var(--mute); margin:12px 0 24px; }
table { border-collapse:collapse; font-size:.85rem; margin:8px 0 16px; display:block; overflow-x:auto; max-width:100%; }
th, td { border:1px solid var(--line); padding:3px 8px; white-space:nowrap; text-align:right; } th:first-child, td:first-child { text-align:left; }
figure { margin:16px 0; } figure img { width:100%; height:auto; border:1px solid var(--line); border-radius:4px; }
figcaption { color:var(--mute); font-size:.85rem; margin-top:4px; }
code { font-size:.9em; }
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("compare_dir")
    ap.add_argument("out_html")
    ap.add_argument("--title", default="A/B comparison")
    ap.add_argument("--meta", action="append", default=[], help="key=value, shown under the title")
    a = ap.parse_args()

    d = Path(a.compare_dir)
    md_text = (d / "compare.md").read_text() if (d / "compare.md").exists() else "_no compare.md_"
    body = markdown.markdown(md_text, extensions=["tables"])

    figs = []
    diff = d / "diffmap_tol.png"
    if diff.exists():
        figs.append(f'<figure><img src="{diff.name}" alt="soaring ceiling A, B and difference"><figcaption>Soaring ceiling at the afternoon peak: A, B, and B − A over the inner grid.</figcaption></figure>')
    for p in sorted(d.glob("montage_*.png")):
        site = p.stem[len("montage_"):]
        figs.append(f'<figure><img src="{p.name}" alt="{html.escape(site)} windgrams"><figcaption>{html.escape(site)} — A (left) vs B (right)</figcaption></figure>')

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
<div class="meta">{meta}</div>
<div class="note">Unlisted test page for the RRFS migration: the same WRF chain run twice from different parent models. The numbers are an aid to a human review, not a verdict. Raw: <a href="compare.md">compare.md</a> · <a href="summary.json">summary.json</a></div>
<h2>Windgrams</h2>
{''.join(figs)}
<h2>Numbers</h2>
{body}
</body></html>
"""
    Path(a.out_html).write_text(page)
    print(f"wrote {a.out_html} ({len(figs)} figures)")


if __name__ == "__main__":
    main()
