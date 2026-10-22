#!/usr/bin/env python3
"""
Build the unlisted lab index: <pages_root>/lab/ab/index.html listing every
<domain>/<YYYY-MM-DD>/index.html under lab/ab, newest first, plus the
<domain>/latest/ pointer.

    python3 build_index.py <pages_root>
"""
import html
import re
import sys
from pathlib import Path

DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
CSS = """
:root { color-scheme: light dark; --fg:#1b1b1f; --bg:#fafaf7; --mute:#6b6b70; --line:#dedcd6; --acc:#b4530a; }
@media (prefers-color-scheme: dark) { :root { --fg:#ecebe6; --bg:#15161a; --mute:#9a9aa2; --line:#2e2f36; --acc:#f0a35a; } }
body { margin:0 auto; padding:24px 16px 64px; max-width:760px; font:15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif; color:var(--fg); background:var(--bg); }
h1 { font-size:1.5rem; margin:0 0 4px; } h2 { font-size:1.1rem; margin-top:1.6em; border-bottom:1px solid var(--line); padding-bottom:4px; text-transform:capitalize; }
.note { border-left:3px solid var(--acc); padding:6px 12px; color:var(--mute); margin:12px 0 24px; }
ul { padding-left:1.2em; } li { margin:4px 0; } a { color:var(--acc); } .latest { color:var(--mute); font-size:.9rem; }
"""


def main():
    root = Path(sys.argv[1]) / "lab" / "ab"
    root.mkdir(parents=True, exist_ok=True)
    sections = []
    for dom in sorted(p for p in root.iterdir() if p.is_dir()):
        days = sorted((p.name for p in dom.iterdir() if p.is_dir() and DATE.match(p.name) and (p / "index.html").exists()), reverse=True)
        if not days:
            continue
        items = "".join(f'<li><a href="{dom.name}/{d}/">{d}</a></li>' for d in days)
        latest = f' <span class="latest">(<a href="{dom.name}/latest/">latest</a>)</span>' if (dom / "latest" / "index.html").exists() else ""
        sections.append(f"<h2>{html.escape(dom.name)}{latest}</h2><ul>{items}</ul>")
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>A/B runs</title><style>{CSS}</style></head>
<body>
<h1>NAM vs RRFS vs HRRR A/B runs</h1>
<div class="note">Unlisted. Each entry is one soaring day run through the same WRF chain (4 km → 1.33 km, DrJack physics) three times, with NAM, RRFS and HRRR as the parent model, and compared as NAM vs RRFS and NAM vs HRRR. Phoenix is a test domain with real late-season thermals; Cascades is the production grid. These pages exist for review during the RRFS migration and are not forecasts.</div>
{''.join(sections) or '<p>No pairs yet.</p>'}
</body></html>
"""
    (root / "index.html").write_text(page, encoding="utf-8")
    print(f"wrote {root / 'index.html'} ({len(sections)} domains)")


if __name__ == "__main__":
    main()
