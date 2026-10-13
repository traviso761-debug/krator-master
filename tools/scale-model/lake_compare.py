#!/usr/bin/env python3
"""Scale model 4.21: the lakes the audit flagged, as drawn and as their water would leave them (a comparison map).

    python3 tools/scale-model/lake_compare.py <4.21 page.html> <4.20 page.html> <out dir>

The lakes are the model's own (the water of 4.20, not the lakes edit_rivers.py added, which balance by construction),
on the 4.21 heights. A lake is flagged when it has no outlet at its level (its spill stands more than CLOSED_M over it)
and gains water (what runs in and the rain on it beat its evaporation), or when it stands more than PERCH_M over the
lowest ground beside it. The flagged lakes' water is taken away and the land routed again (hydro.route, as
edit_rivers.py does): where the water settles is each lake's answer. It balances in an endorheic lake (grown from the
lowest point of the hollow its bed lies in, which may be the dry hollow beside a perched lake), or fills the hollow to
its spill and overflows, or drains away when its bed holds none; a hollow closed by a frozen pass and still gaining is
'unbalanced'.

Writes compare.json (one record per lake), drawn.jpg and balanced.jpg (the relief map with the water as drawn and as
it would stand) and diff.jpg (unchanged water blue, gained orange, lost yellow, the lakes numbered as in compare.json).
Deterministic.
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import load   # noqa: E402
import edit_rivers as ER   # noqa: E402
import hydro   # noqa: E402

PERCH_M = 100.0
CLOSED_M = ER.CLOSED_M


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    page, page0, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    _, _, D = load(page)
    _, _, D0 = load(page0)
    G = ER.grid_fields(D)
    G0 = ER.grid_fields(D0)
    # the books are 4.20's, as edit_rivers.py drew them: on 4.21 an outlet joins a lake to the ocean by water, and the
    # books would count that lake as ocean and import the rain within IMPORT_KM of it as well
    G.update(evap_k=G0['evap_k'], books=G0['books'], P=G0['P'])
    su, sv, E = G['su'], G['sv'], G['E']
    OW, OH = D['fullW'], D['fullH']
    KM2 = (2 / su) * (2 / sv)
    px = lambda j, i: [round(i / su), round(j / sv)]
    H = ER.setup(G)
    print('routing the 4.21 heights')
    rt = hydro.route(H['S'], H['term'], H['R'], H['PL'], H['lake'], H['frozen'], log=lambda *a: None)
    acc, rec = rt['acc'], rt['rec']
    whas, sea, S, PL = G['whas'], H['sea'], H['S'], H['PL']
    own = G0['whas'] & whas & ~sea                 # the model's own lakes
    bl, bn = nd.label(whas & ~sea, structure=np.ones((3, 3)))
    # the bed with the lakes taken away, filled to its spill: what a drained lake's bed still holds
    # the flagged lakes: closed and gaining water, or standing over their own shore
    flag = np.zeros(E.shape, bool)
    info = []
    for k in range(1, bn + 1):
        m = bl == k
        if not (m & own).any():
            continue
        level = float(np.median(S[m]))
        ring = nd.binary_dilation(m, structure=np.ones((3, 3))) & ~m & ~whas
        shore_min = float(E[ring].min()) if ring.any() else level
        into = 0.0
        for jj, ii in zip(*np.nonzero(ring)):
            a, b = rec[jj, ii]
            if a >= 0 and m[a, b]:
                into += max(acc[jj, ii], 0.0)
        bal = into + float(PL[m].sum())
        closed = any(b_['closed'] for b_ in H['bodies'] if (b_['cells'] & m).any())
        perched = shore_min < level - PERCH_M
        if perched or (closed and bal > 0):
            flag |= m
            info.append((m, level, shore_min, into, bal, closed, perched))
    # the water taken off them, routed again over their beds: where it settles is the lakes' own answer
    print('routing with the flagged lakes taken away')
    Gx = dict(G, whas=whas & ~flag, wlev=np.where(flag, np.nan, G['wlev']))
    Hx = ER.setup(Gx)
    rx = hydro.route(Hx['S'], Hx['term'], Hx['R'], Hx['PL'], Hx['lake'], Hx['frozen'], log=lambda *a: None)
    Fx, Sx, ux = rx['F'], rx['S'], rx['unit']
    ends = rx['ends']
    before = whas & ~sea
    after = before & ~flag
    recs = []
    for m, level, shore_min, into, bal, closed, perched in info:
        j, i = np.argwhere(m).mean(0)
        r = dict(at_px=px(round(j), round(i)), level_m=round(level), km2=round(float(m.sum() * KM2)),
                 inflow_m3s=round(float(ER.qcells(into)), 1), balance_m3s=round(float(ER.qcells(bal)), 1),
                 finding='stands %d m over its lowest shore' % (level - shore_min) if perched else
                 'no outlet at its level, gains water')
        # where its water settles: an endorheic lake grown over its bed (balanced, or held under a frozen pass), or
        # every hollow its bed lies in filled to its spill (it overflows)
        new = np.zeros(E.shape, bool)
        lv = None
        for e in ends:
            if (e['cells'] & nd.binary_dilation(m, iterations=1)).any():
                new |= e['cells']
                lv = e['level']
                r['settles'] = 'unbalanced: held under a frozen pass, still gaining' if e.get('shut') and e.get('surplus', 0) > 0 \
                    else 'balances (evaporation meets inflow)'
        us = set(np.unique(ux[m & (ux > 0)]))
        for u in us:
            full = (ux == u) & (Fx - Sx > 0.5)
            if full.any() and not (full & new).any():
                new |= full
                lv = float(Fx[full].max())
                r.setdefault('settles', 'fills and overflows')
        # only the water joined to this lake (a routing unit can chain several hollows)
        lab_, _ = nd.label(new | m, structure=np.ones((3, 3)))
        new &= np.isin(lab_, np.unique(lab_[m]))
        if not new.any():
            r['settles'] = 'drains away: its bed holds no water'
        after |= new
        r['level_after_m'] = round(lv) if lv is not None else None
        r['km2_after'] = round(float(new.sum() * KM2))
        r['change'] = 'rises' if (lv is not None and lv > level + 25) or r['km2_after'] > r['km2'] * 1.1 else 'drains'
        recs.append(r)
    recs.sort(key=lambda r: -(abs(r['km2_after'] - r['km2'])))
    for n, r in enumerate(recs, 1):
        r['n'] = n
    json.dump(recs, open(os.path.join(out, 'compare.json'), 'w', encoding='utf-8'), indent=1)
    gained, lost = after & ~before, before & ~after
    print('%d lakes: %d rise, %d drain or shrink; %d km2 of water gained, %d km2 lost' % (
        len(recs), sum(r['change'] == 'rises' for r in recs), sum(r['change'] == 'drains' for r in recs),
        gained.sum() * KM2, lost.sum() * KM2))

    # ---- the pictures, on the relief map at full resolution
    base = np.array(Image.open(io.BytesIO(base64.b64decode(D['t']))).convert('RGB')).astype(float)
    grey = base.mean(-1, keepdims=True)
    land = (base * .45 + grey * .55) * .9                     # the relief, faded so the water reads
    up = lambda a: nd.zoom(a.astype(float), (OH / a.shape[0], OW / a.shape[1]), order=1)[:OH, :OW] > .5
    Bf, Af, Gf, Lf, Sf = up(before), up(after), up(gained), up(lost), up(sea)
    WATER, GAIN, LOSS, SEA = np.array([52, 104, 168.]), np.array([226, 112, 34.]), np.array([238, 196, 64.]), np.array([70, 96, 130.])

    def paint(mask_water, extra=None):
        im = land.copy()
        im[Sf] = SEA
        im[mask_water] = WATER
        if extra is not None:
            for m_, c in extra:
                im[m_] = c
        return Image.fromarray(np.clip(im, 0, 255).astype(np.uint8))
    paint(Bf).save(os.path.join(out, 'drawn.jpg'), quality=84)
    paint(Af).save(os.path.join(out, 'balanced.jpg'), quality=84)
    diff = paint(Bf & Af, [(Gf, GAIN), (Lf, LOSS)])
    dr = ImageDraw.Draw(diff)
    for r in recs:
        x, y = r['at_px']
        dr.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(255, 255, 255), outline=(20, 20, 20))
        dr.text((x - (3 if r['n'] < 10 else 6), y - 6), str(r['n']), fill=(20, 20, 20))
    diff.convert('RGB').save(os.path.join(out, 'diff.jpg'), quality=86)
    print('wrote', out)


if __name__ == '__main__':
    main()
