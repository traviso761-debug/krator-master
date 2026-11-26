#!/usr/bin/env python3
"""cards.py's spill 'vlahos' (key_vlahos), proven on a made-up sheet: the key goes clear, a green leaf stays solid and unchanged,
a white pane half over magenta comes out white at about half alpha, a fringe pixel loses its tint, a green key works the same
way, and run_one records key_gain in meta.json while the default key (no spill) still gives what key_out gives.
tools/test_all.py runs every tools/tests/test_*.py.

    python3 tools/tests/test_cards.py
"""
import json, os, sys, tempfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import cards  # noqa: E402


def sheet(key, pixels):
    a = np.zeros((8, 8, 3), np.uint8); a[:] = key
    for (y, x), c in pixels.items():
        a[y, x] = c
    return Image.fromarray(a, 'RGB')


def main():
    fails = []
    def check(ok, what):
        print(('ok   ' if ok else 'FAIL ') + what)
        if not ok:
            fails.append(what)

    im = sheet((255, 0, 255), {(1, 1): (60, 140, 40), (2, 2): (255, 128, 255), (3, 3): (200, 150, 190)})
    o = np.asarray(cards.key_vlahos(im, '#ff00ff')).astype(int)
    check(o[0, 0, 3] == 0, 'magenta key: the background is clear')
    check(o[1, 1, 3] == 255 and tuple(o[1, 1, :3]) == (60, 140, 40), 'magenta key: a green leaf stays solid and unchanged')
    check(abs(o[2, 2, 3] - 128) <= 2 and min(o[2, 2, :3]) >= 250, 'magenta key: a white pane half over the key is white at half alpha')
    check(o[3, 3, 3] > 200 and min(o[3, 3, 0], o[3, 3, 2]) - o[3, 3, 1] <= 0, 'magenta key: a tinted fringe pixel keeps no magenta excess')
    g = np.asarray(cards.key_vlahos(sheet((0, 255, 0), {(1, 1): (128, 255, 128)}), '#00ff00')).astype(int)
    check(g[0, 0, 3] == 0 and abs(g[1, 1, 3] - 128) <= 2 and min(g[1, 1, :3]) >= 250, 'green key: clear background, white pane at half alpha')
    clear = np.asarray(cards.key_vlahos(im, '#ff00ff', gain=1.5)).astype(int)
    check(clear[2, 2, 3] < o[2, 2, 3] and clear[1, 1, 3] == 255, 'key_gain above 1 makes the pane clearer, the leaf still solid')

    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, 'card.png')
        big = np.zeros((64, 64, 3), np.uint8); big[:] = (255, 0, 255); big[16:48, 16:48] = (60, 140, 40); big[20:30, 20:30] = (255, 128, 255)
        Image.fromarray(big).save(src)
        cards.run_one(src, os.path.join(tmp, 'v'), {'id': 'test.v'}, {'key': '#ff00ff', 'spill': 'vlahos', 'key_gain': 1.2, 'size': 64, 'anchor': 'none'})
        meta = json.load(open(os.path.join(tmp, 'v', 'meta.json'), encoding='utf-8'))
        check(meta['processing']['options'].get('key_gain') == 1.2 and meta['processing']['options']['spill'] == 'vlahos', 'run_one: meta.json records spill and key_gain')
        cards.run_one(src, os.path.join(tmp, 'd'), {'id': 'test.d'}, {'key': '#ff00ff', 'size': 64, 'anchor': 'none'})
        want = cards.bleed(np.asarray(cards.key_out(Image.open(src).convert('RGBA'), '#ff00ff', 45, 120, 'edge').resize((64, 64), Image.LANCZOS)).astype(np.float64))
        check(np.array_equal(np.asarray(Image.open(os.path.join(tmp, 'd', 'albedo.png'))), want), 'run_one: the default key is still key_out')
    print('%d failed' % len(fails) if fails else 'all passed')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
