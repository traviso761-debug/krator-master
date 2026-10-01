#!/usr/bin/env python3
"""Regenerate the "City lexicon" tables in The-Izani-Tongue_2.html from data/lexicon.json.

Everything else in the page is left untouched. Run after editing the lexicon:
    python3 tools/build-tongue.py
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, "The-Izani-Tongue_2.html")
LEX = os.path.join(ROOT, "data", "lexicon.json")

def main():
    lex = json.load(open(LEX, encoding="utf-8"))
    page = open(PAGE, encoding="utf-8").read()
    start = page.index('<h2 class="pb">City lexicon')
    end = page.index("<h2", start + 10)
    section = page[start:end]
    intro_end = section.index("<h3>")
    head = section[:intro_end]
    tail = section[section.rindex("</table>") + len("</table>"):]   # notes after the tables stay as written

    groups = {}
    for w in lex["words"]:
        if w["group"] == "Names of places":      # those live in the Names of places table, with their glyphs
            continue
        groups.setdefault(w["group"], []).append(w)
    e = html.escape
    parts = [head]
    for g, rows in groups.items():
        parts.append(f"\n<h3>{e(g)}</h3>\n<table><tr><th>Word</th><th>POS</th><th>Gloss</th><th>Built from</th></tr>")
        for w in rows:
            parts.append(f'<tr><td class="w">{e(w["w"])}</td><td class="pos">{e(w["pos"])}</td><td>{e(w["gloss"])}</td><td class="sub">{e(w["build"])}</td></tr>')
        parts.append("</table>")
    parts.append(tail)
    new = "".join(parts)
    if new == section:
        print("City lexicon tables already up to date")
        return 0
    open(PAGE, "w", encoding="utf-8").write(page[:start] + new + page[end:])
    print(f"City lexicon regenerated: {sum(len(r) for r in groups.values())} words in {len(groups)} groups")
    return 0

if __name__ == "__main__":
    sys.exit(main())
