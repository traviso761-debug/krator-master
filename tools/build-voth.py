#!/usr/bin/env python3
"""Wrap the Krator primer into a page that can be read.

    python3 tools/build-voth.py

voth.html is the source and stays the source: it is plain prose, one line to a paragraph, with the short
lines being headings. Served as it stands a browser collapses the lot into a single run-on block, so this
reads it and writes krator.html around it - the same arrangement as the Izani Tongue, where the text is
kept as text and the page is generated from it. Edit voth.html, run this, reload.
"""
import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "voth.html")
OUT = os.path.join(ROOT, "krator.html")

CSS = """
:root{color-scheme:dark;--ink:#d8d2c6;--dim:#9a9184;--bg:#14131a;--panel:#1b1a22;--rule:#33303c;--warm:#c9a46a}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink)}
body{font:16.5px/1.72 Georgia,"Iowan Old Style","Times New Roman",serif;padding:0 20px 120px}
main{max-width:46rem;margin:0 auto}
header{padding:4.5rem 0 2.2rem;border-bottom:1px solid var(--rule);margin-bottom:2.4rem}
h1{font-size:2.6rem;line-height:1.12;margin:0 0 .7rem;letter-spacing:-.015em;color:#efe9dc}
.by{color:var(--dim);font:italic 1rem/1.5 Georgia,serif;margin:0}
h2{font-size:1.32rem;line-height:1.3;margin:3rem 0 .9rem;color:var(--warm);
   font-variant:small-caps;letter-spacing:.06em;font-weight:600}
h2:first-of-type{margin-top:1rem}
p{margin:0 0 1.35rem}
p:first-of-type::first-letter{font-size:3.1rem;line-height:.82;float:left;padding:.08em .09em 0 0;color:#efe9dc}
footer{margin-top:4rem;padding-top:1.4rem;border-top:1px solid var(--rule);color:var(--dim);font-size:.9rem}
a{color:var(--warm)}
@media (max-width:640px){body{font-size:16px}h1{font-size:2rem}}
"""


def is_heading(line):
    """Short, no full stop, no comma: the source marks its sections that way and nothing else looks like it."""
    return len(line) < 60 and not line.endswith(".") and "," not in line


def main():
    lines = [l.strip() for l in open(SRC, encoding="utf-8").read().splitlines()]
    lines = [l for l in lines if l]
    if not lines:
        raise SystemExit("voth.html is empty")
    title, by, body = lines[0], "", lines[1:]
    if body and body[0].startswith(("Sep ", "Oct ", "Nov ", "Dec ", "Jan ", "Feb ", "Mar ", "Apr ",
                                    "May ", "Jun ", "Jul ", "Aug ")) or (body and "@" in body[0] and len(body[0]) < 80):
        by, body = body[0], body[1:]

    out = []
    first_para = True
    for line in body:
        if is_heading(line):
            out.append("<h2>%s</h2>" % html.escape(line))
            first_para = True
        else:
            out.append("<p>%s</p>" % html.escape(line))
            first_para = False

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="Krator: the geography, climate and peoples of a crater world.">
<style>{CSS}</style>
</head>
<body>
<main>
<header>
<h1>{html.escape(title)}</h1>
{'<p class="by">' + html.escape(by) + '</p>' if by else ''}
</header>
{chr(10).join(out)}
<footer>Generated from <code>voth.html</code> by <code>tools/build-voth.py</code>. Edit the prose there and run it again.</footer>
</main>
</body>
</html>
"""
    open(OUT, "w", encoding="utf-8").write(page)
    heads = sum(1 for l in out if l.startswith("<h2"))
    print(f"wrote {OUT}: {len(page)/1024:.1f} KB; {heads} sections, {len(out)-heads} paragraphs")


if __name__ == "__main__":
    main()
