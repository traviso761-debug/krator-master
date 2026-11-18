#!/usr/bin/env python3
"""The Viridian estate's site survey on the scale model (SURVEY.md says what it found).

    git show 5f659c054:tools/scale-model/model/data/<file> > <dir>/<file>     # h.png p.png c.png climate.json
                                                                              # tm tc tl tw th .png, wd.png, wl.png, z.png
    python3 settlements/viridian/survey_site.py <dir> site        # the cell, its 7 x 7 neighbourhood, water within 16 km
    python3 settlements/viridian/survey_site.py <dir> scan 20     # every dry cell within 20 px, ranked for mist tea

Reads only; writes nothing. The decodings are tools/scale-model/model/INDEX.md's.
"""
import json, math, sys
import numpy as np
from PIL import Image

X0, Y0 = 962, 1562      # T.viridian.px (core/region/data/xan-tune.js)
QIBLAI = (922, 1595)


def load(d):
    def img(f):
        return np.asarray(Image.open(d + '/' + f).convert('RGB')).astype(np.int32)
    H = img('h.png')
    M = {'h': (H[..., 0] * 256 + H[..., 1]) / 65535 * 29600 - 2600, 'water': H[..., 2] > 127,
         'rain': img('p.png')[..., 0] / 255 * 4000, 'c': img('c.png')[..., 0], 'wd': img('wd.png')}
    for k in ('tm', 'tc', 'tl', 'tw', 'th'):
        M[k] = img(k + '.png')[..., 0] - 90          # mean, coldest month, coldest night, warmest month, hottest afternoon
    with open(d + '/climate.json', encoding='utf-8') as fh:
        M['classes'] = json.load(fh)['classes']
    return M


def slope(M, x, y):
    """(percent, aspect): the central difference over 2 cells (4 km); aspect is the bearing the slope faces."""
    h = M['h']
    gx = (h[y, x + 1] - h[y, x - 1]) / 4000
    gy = (h[y + 1, x] - h[y - 1, x]) / 4000
    return math.hypot(gx, gy) * 100, (math.degrees(math.atan2(-gx, gy)) + 360) % 360


def cell(M, x, y):
    s, a = slope(M, x, y)
    return dict(px=(x, y), h=round(M['h'][y, x]), water=bool(M['water'][y, x]), slope=round(s, 1), aspect=round(a),
                rain=round(M['rain'][y, x]), tm=int(M['tm'][y, x]), tc=int(M['tc'][y, x]), tl=int(M['tl'][y, x]),
                tw=int(M['tw'][y, x]), th=int(M['th'][y, x]), cls=M['classes'][M['c'][y, x]]['code'])


def tea_score(c):
    """A rough mist-tea score: rain, a mild mean, no frost, a workable slope, height, a C climate."""
    sc = min(c['rain'], 3000) / 1000
    sc += 1.0 if 14 <= c['tm'] <= 22 else -abs(c['tm'] - 18) / 4
    sc += 1.0 if c['tl'] >= 0 else c['tl'] / 2
    sc += 1.0 if 8 <= c['slope'] <= 45 else -0.5
    sc += 0.5 if 700 <= c['h'] <= 2000 else 0
    sc += 0.5 if c['cls'] in ('Cfb', 'Cwb', 'Cfa') else 0
    return round(sc, 2)


def main():
    M = load(sys.argv[1])
    mode = sys.argv[2] if len(sys.argv) > 2 else 'site'
    if mode == 'site':
        print('site', cell(M, X0, Y0))
        for y in range(Y0 - 3, Y0 + 4):
            print(y, ' '.join('%5d%s/%2.0f%%/%4d/%3d,%3d,%3d/%s' % (M['h'][y, x], 'w' if M['water'][y, x] else '',
                  slope(M, x, y)[0], M['rain'][y, x], M['tm'][y, x], M['tc'][y, x], M['tl'][y, x],
                  M['classes'][M['c'][y, x]]['code']) for x in range(X0 - 3, X0 + 4)))
        near = [(round(math.hypot(x - X0, y - Y0) * 2, 1), x, y) for y in range(Y0 - 8, Y0 + 9)
                for x in range(X0 - 8, X0 + 9) if M['water'][y, x] and math.hypot(x - X0, y - Y0) * 2 <= 16]
        print('water cells within 16 km:', sorted(near))
        for t in np.linspace(0, 1, 27):
            x, y = round(X0 + (QIBLAI[0] - X0) * t), round(Y0 + (QIBLAI[1] - Y0) * t)
            print('to Qiblai', x, y, round(M['h'][y, x]), round(M['rain'][y, x]), M['classes'][M['c'][y, x]]['code'])
    else:
        R = int(sys.argv[3]) if len(sys.argv) > 3 else 20
        out = []
        for y in range(Y0 - R, Y0 + R + 1):
            for x in range(X0 - R, X0 + R + 1):
                if not M['water'][y, x]:
                    c = cell(M, x, y)
                    c['score'] = tea_score(c)
                    out.append(c)
        out.sort(key=lambda c: -c['score'])
        for c in out[:15]:
            print(c)
        me = next(c for c in out if c['px'] == (X0, Y0))
        print('the site ranks', out.index(me) + 1, 'of', len(out))


if __name__ == '__main__':
    main()
