#!/usr/bin/env python3
"""The Xanadui script for the Qiblai kit, read in place from the Tongues of Krator chart (lore/tongues-of-krator.html).

The chart's Xanadui section carries a whole scribe: the consonant bodies, the independent vowels, the vowel signs and the
stacking rule as SVG path data, the romanization parser, the full stop (the eight-spoked wheel) and the comma. This lifts
that block (from the "/* Xanadui */" marker to the section's "/* ---------- page ---------- */") unchanged, indents it
one space (so none of its names sits at column 0, where the page's shared-scope rules would read them) and seals it in a
closure that exports XNDS = {parse, aks, WHEEL, BAR, BH, STK}. The chart stays the one copy: a change to the script there
reaches the city at the next build. kits/qiblai/build.py writes the result to src/89q0x-qb-xanadui.js (generated, committed,
never edited by hand); src/89q0y-qb-script.js draws its glyphs onto the kit's canvas textures.

    python3 xanadui_script.py          # print the fragment
    python3 xanadui_script.py --write  # write src/89q0x-qb-xanadui.js if it changed
"""
import io, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CHART = os.path.join(ROOT, 'lore', 'tongues-of-krator.html')
OUT = os.path.join(HERE, 'src', '89q0x-qb-xanadui.js')
START, END = '/* Xanadui */', '/* ---------- page ---------- */'


def block():
    with io.open(CHART, encoding='utf-8') as fh:
        text = fh.read().replace('\r\n', '\n')
    a = text.index(START)
    b = text.index(END, a)
    body = text[a + len(START):b].strip('\n').split('\n')
    if body and body[0].strip() == '(()=>{':      # the chart's own closure opener; ours replaces it
        body = body[1:]
    if not any('function aks(' in l for l in body) or not any('function parse(' in l for l in body):
        sys.exit('xanadui_script.py: the chart\'s Xanadui block no longer has aks() and parse(): update the extractor')
    return body


def fragment():
    body = block()
    head = ('// ================================================================= QIBLAI — the Xanadui script (GENERATED: do not edit)\n'
            '// Lifted unchanged from lore/tongues-of-krator.html, its Xanadui section (the scribe: strokes, vowel signs, the stacking\n'
            '// rule, the romanization parser, the wheel and the bar), by kits/qiblai/xanadui_script.py at every build. Edit the chart.\n'
            '// XNDS.parse(text) gives words of tokens; XNDS.aks(cons, vowel, nasal, scale), XNDS.WHEEL(scale) and XNDS.BAR(scale)\n'
            '// give each token as SVG markup, which src/89q0y-qb-script.js draws onto canvases. [G data] text, no DOM in what runs.\n')
    inner = '\n'.join((' ' + l) if l.strip() else '' for l in body)
    return head + 'const XNDS=(function(){\n' + inner + '\n return {parse,aks,WHEEL,BAR,BH,STK};\n})();\n'


def write():
    """Write the fragment if it changed; return True when it did."""
    new = fragment()
    old = io.open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else None
    if old == new:
        return False
    with io.open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(new)
    return True


if __name__ == '__main__':
    if '--write' in sys.argv:
        print('wrote' if write() else 'unchanged', os.path.relpath(OUT, ROOT).replace(os.sep, '/'))
    else:
        sys.stdout.reconfigure(encoding='utf-8')
        print(fragment())
