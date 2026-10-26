#!/usr/bin/env python3
"""Scale model 4.23: the Godthrone's summit and cone (tools/scale-model/README.md, "4.23"; biomes/godthrone/PLAN.md section 1).

    python3 tools/scale-model/edit_423.py <4.22 page.html> <regions dir or json> <out page.html>

On 4.22 the summit is not a peak but the raster's ceiling: a table of 8,416 km2 flat at 17,098 m, the volcano cut off at
`DATA.hi`. This edit:

1. RAISES THE CEILING: `DATA.hi` 17,100 -> 27,000 m, and re-encodes `h` (R, G) and `wl` (R, G) on the new range, every
   cell (the step goes from 0.30 to 0.45 m; no cell moves by more than that).
2. REBUILDS THE CONE (the owner, 2026-10-26: wider, parallel to the edges of its polygon, the overall height unchanged):
   a shield whose contours run from a round summit rim out to the outline of the `godthrone` biome polygon, so on the
   lower flanks each contour is parallel to the polygon's edges and the slope is ~0.1 over 100-250 km (the flank's own, as
   the plan said). It is added to the ground's own relief, not over it: the 4.22 heights smoothed (sigma 48 km) are lifted onto the
   cone and the detail kept, the lift fading out toward the polygon's edge so nothing steps there. The summit caldera rim is
   ~25 km (0.07 atm on the page's rule), 36 +- 3.5 km radius (a 65-77 km caldera), the floor ~22 km, and a nested pit 900 m
   deeper, off-centre. No cell stands over 25 km.
2b. WEATHERING: a stream-power pass (D8 flow accumulation on the new heights, incision by sqrt(area) x slope, never below
   the receiver) cuts the radial gullies an old shield has, and a thermal pass relaxes slopes over 0.3; nothing within 6 km of
   the rim moves, and no cell is cut more than 1,200 m.
3. A SUMMIT VENT in `DATA.vents` on the pit's floor.
4. RELIGHTS the painted maps (`st`, `t`, `rt`, `ct`) where the heights moved (edit_heights.relight). The climate is not
   touched: above 9 km the page reads "airless", with no air temperature, rain or wind, and class O stays.
5. THE BLOOD RIVER (the owner, 2026-10-26; biomes/godthrone/PLAN.md section 4): Qol Drai (r442), a dry valley on 4.22 that ends
   at 1,208 m (px 554.7, 1133.6) where Siwipt Sitrim (r272, perennial, 43 km) begins, is made perennial (the bloodfalls' brine and the
   ice belt's melt, +4 m3/s along its length), named Red Riwa (Xanadui, "red river"; a placeholder the owner may change), joined to r272
   (which carries the added flow on to the Rift's lake at -717 m), and drawn in red on the satellite and relief maps.
6. THE FLANK VENT (biomes/godstep/PLAN.md, station 3): a small cinder cone in `DATA.vents` on the Godthrone's north-east flank in
   Godstep valley's head, in the 4.4-5.0 km band (the highest ground of that band inside the `godstep valley` polygon).
7. Version strings and the legend's "8-17 km" (the outer rim) become 4.23 and "8-27 km".

Deterministic. Writes <out> and <out>.report.json beside it.
"""
import io, json, math, os, re, sys, base64
import numpy as np
from PIL import Image
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import LO, load, raster, b64, relight, sstep   # noqa: E402
from edit_dams import set_data   # noqa: E402
from extract_region import docs   # noqa: E402
from edit_422 import strokes   # noqa: E402
from PIL import ImageDraw, ImageFilter   # noqa: E402

BLOOD_RGB = (178, 52, 42)         # the blood river's stroke on the painted maps
BLOOD_EXTRA_M3S = 4.0             # the brine seep and the ice belt's melt, added along the whole course

VERSION = '4.23'
OLD_HI, NEW_HI = 17100.0, 27000.0
SUMMIT_PX = (574.35, 935.59)        # the 4.22 table's centre, full px
R_RIM, RIM_WOBBLE = 36.0, 3.5       # km
H_RIM, H_FLOOR = 25000.0, 22000.0   # m: no cell stands over H_RIM
WALL_KM = 9.0                       # the caldera wall's run, rim to floor
PIT_OFF = (7.0, -6.0)               # km east, km south of the centre
PIT_R = (5.0, 11.0)                 # km: full depth inside, none beyond
PIT_DEPTH = 900.0
BASE_H = 8000.0                     # m: the shield's foot (the polygon edge's own median height)
SHAPE = 1.4                         # the profile's exponent (slope ~0.12 at the foot)
RB_SMOOTH_DEG = 7.0                 # degrees of bearing: the polygon's radius from the summit is smoothed this much
LIFT_SMOOTH = 2.5                   # cells: the lift is smoothed this much (the weathering then cuts the detail)
SMOOTH_CELLS = 12                   # sigma of the smoothed old ground, ~48 km
FADE = (0.70, 1.0)                  # the lift fades out between these shares of the way from rim to polygon edge
WEATHER = dict(iters=60, K=1.8, max_cut=1200.0, thermal=0.3, thermal_iters=12, guard_km=6.0)


def weather(E, mask):
    """stream-power incision then a thermal pass; only cells in `mask` move, by at most WEATHER['max_cut'] in all"""
    W = WEATHER
    h = E.copy()
    ny, nx = h.shape
    cell = 4.0
    offs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    dist = [cell * math.hypot(a, b) for a, b in offs]
    ys, xs = np.where(mask)
    box = np.zeros(h.shape, bool)
    box[max(ys.min() - 3, 1):min(ys.max() + 4, ny - 1), max(xs.min() - 3, 1):min(xs.max() + 4, nx - 1)] = True
    by, bx = np.where(box)
    iy, ix = np.indices(h.shape)
    for it in range(W['iters']):
        pad = np.pad(h, 1, constant_values=1e9)
        slope = np.zeros(h.shape)
        ry, rx = iy.copy(), ix.copy()
        for (a, b), dd in zip(offs, dist):
            nb = pad[1 + a:1 + a + ny, 1 + b:1 + b + nx]
            s = (h - nb) / dd
            better = s > slope
            slope = np.where(better, s, slope)
            ry = np.where(better, np.clip(iy + a, 0, ny - 1), ry)
            rx = np.where(better, np.clip(ix + b, 0, nx - 1), rx)
        order = np.argsort(-h[by, bx], kind='stable')
        A = np.full(h.shape, cell * cell)
        for k in order:
            y, x = by[k], bx[k]
            if ry[y, x] != y or rx[y, x] != x:
                A[ry[y, x], rx[y, x]] += A[y, x]
        cut = W['K'] * np.sqrt(A) * (slope / 1000.0)               # m per pass (slope in m per km -> rise over run)
        cut = np.minimum(cut, 0.4 * np.maximum(h - h[ry, rx], 0))
        room = np.maximum(W['max_cut'] - (E - h), 0)
        h = h - np.where(mask & (slope > 0), np.minimum(cut, room), 0)
    for it in range(W['thermal_iters']):
        pad = np.pad(h, 1, mode='edge')
        flow = np.zeros(h.shape)
        for (a, b), dd in zip(offs, dist):
            nb = pad[1 + a:1 + a + ny, 1 + b:1 + b + nx]
            flow += np.maximum((h - nb) / (dd * 1000.0) - W['thermal'], 0) * dd * 1000.0 * 0.06
        room = np.maximum(W['max_cut'] - (E - h), 0)
        h = h - np.where(mask, np.minimum(flow, room), 0)
    cut = E - h
    print('weathering: cut mean %.0f m, p99 %.0f m, max %.0f m over %d cells' % (cut[mask].mean(), np.percentile(cut[mask], 99), cut.max(), int(mask.sum())))
    return np.where(mask, np.minimum(h, E), E)


def main():
    page, rpath, out = sys.argv[1:4]
    GP = next(r for r in docs(rpath) if r['name'] == 'godthrone' and r.get('kind') == 'biome')['points']
    lines, li, D = load(page)
    assert D['hi'] == OLD_HI, D['hi']
    OW, OH, VW, VH = D['fullW'], D['fullH'], D['w'], D['hh']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    km = 2.0 / su                                    # km per height cell on x (~4)
    h = raster(D, 'h').astype(np.int64)
    wl = raster(D, 'wl').astype(np.int64)
    dec = lambda a: LO + ((a[..., 0] << 8) | a[..., 1]) / 65535 * (OLD_HI - LO)
    enc = lambda v: np.round(np.clip((v - LO) / (NEW_HI - LO), 0, 1) * 65535).astype(np.int64)
    Eo = dec(h)
    Wo = dec(wl)

    cx, cy = SUMMIT_PX[0] * su, SUMMIT_PX[1] * sv
    Y, X = np.indices(Eo.shape)
    dx, dy = (X - cx) * km, (Y - cy) * km
    r = np.hypot(dx, dy)
    th = np.arctan2(dy, dx)
    rs = np.random.RandomState(423)
    ph = rs.uniform(0, 2 * np.pi, 5)
    wob = sum(np.cos((k + 2) * th + ph[k]) / (k + 2) for k in range(5))
    wob = wob / np.abs(wob).max()
    rim = R_RIM + RIM_WOBBLE * wob                  # the rim's radius per bearing

    # the polygon's radius from the summit along each bearing (rays against its edges)
    poly = [(p[0] * su, p[1] * sv) for p in GP]
    nth = 3600
    ang = np.linspace(-np.pi, np.pi, nth, endpoint=False)
    cth, sth = np.cos(ang), np.sin(ang)
    rb_t = np.full(nth, np.inf)
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        ex, ey = x2 - x1, y2 - y1
        den = cth * ey - sth * ex
        with np.errstate(divide='ignore', invalid='ignore'):
            tt = ((x1 - cx) * ey - (y1 - cy) * ex) / den
            uu = ((x1 - cx) * sth - (y1 - cy) * cth) / den
        ok = (np.abs(den) > 1e-12) & (tt > 0) & (uu >= 0) & (uu <= 1)
        rb_t = np.where(ok & (tt < rb_t), tt, rb_t)
    assert np.isfinite(rb_t).all()
    rb_t = nd.gaussian_filter1d(rb_t, RB_SMOOTH_DEG * nth / 360.0, mode='wrap')      # the polygon's notches and spikes rounded off
    rb = np.interp(th, np.append(ang, np.pi), np.append(rb_t, rb_t[0])) * km          # km
    rho = np.clip((r - rim) / (rb - rim), 0, 1)                                      # 0 at the rim, 1 at the polygon edge
    S = BASE_H + (H_RIM - BASE_H) * (1 - rho ** SHAPE)
    Es = nd.gaussian_filter(Eo, SMOOTH_CELLS)
    lift = nd.gaussian_filter(np.maximum(S - Es, 0) * (1 - sstep(FADE[0], FADE[1], rho)), LIFT_SMOOTH)
    En = np.where(rho < 1, Eo + lift, Eo)
    En = np.minimum(En, np.maximum(H_RIM, Eo))
    d = rim - r                                     # km inside the rim
    floor = H_FLOOR + 150.0 * np.clip(1 - r / np.maximum(rim - WALL_KM, 1), 0, 1)
    inner = H_RIM - (H_RIM - floor) * sstep(0, WALL_KM, d)
    pit = 1 - sstep(PIT_R[0], PIT_R[1], np.hypot(dx - PIT_OFF[0], dy - PIT_OFF[1]))
    En = np.where(d > 0, inner - PIT_DEPTH * pit, En)
    n_raised = int((En - Eo > 0.5).sum())
    En = weather(En, (d <= -WEATHER['guard_km']) & (rho < 1))
    En = np.minimum(En, np.maximum(H_RIM, Eo))
    moved = np.abs(En - Eo) > 0.5
    print('cells raised: %d | cells changed: %d | max rise %.0f m | max cut %.0f m | peak %.0f m' % (
        n_raised, int(moved.sum()), (En - Eo).max(), (Eo - En).max(), En.max()))

    # ---- the page
    q = np.where(moved, enc(En), enc(Eo))
    h2 = h.copy()
    h2[..., 0], h2[..., 1] = q >> 8, q & 255
    wl2 = wl.copy()
    qw = enc(Wo)
    wl2[..., 0], wl2[..., 1] = qw >> 8, qw & 255
    rep = {'h': b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True),
           'wl': b64(Image.fromarray(wl2.astype(np.uint8), 'RGB'), optimize=True)}
    rep.update(relight(D, Eo, En)[0])
    back = LO + ((h2[..., 0] << 8) | h2[..., 1]) / 65535 * (NEW_HI - LO)
    err = np.abs(back - np.where(moved, En, Eo)).max()
    print('encode error %.2f m (step %.2f m)' % (err, (NEW_HI - LO) / 65535))
    assert err < 0.5

    # ---- the blood river: Qol Drai made perennial, joined to Siwipt Sitrim (r272)
    rivers = [dict(r_) for r_ in D['rivers']]
    r442 = next(r_ for r_ in rivers if r_['id'] == 'r442')
    r272 = next(r_ for r_ in rivers if r_['id'] == 'r272')
    assert r442['kind'] == 'wadi' and abs(r442['to']['at_px'][0] - r272['px'][0][0]) < 1 and abs(r442['to']['at_px'][1] - r272['px'][0][1]) < 1
    r442['q_m3s'] = [round(q_ + BLOOD_EXTRA_M3S, 1) for q_ in r442['q_m3s']]
    r272['q_m3s'] = [round(q_ + BLOOD_EXTRA_M3S, 1) for q_ in r272['q_m3s']]
    r442['q_mouth_m3s'] = round(r442['q_mouth_m3s'] + BLOOD_EXTRA_M3S, 1)
    r272['q_mouth_m3s'] = round(r272['q_mouth_m3s'] + BLOOD_EXTRA_M3S, 1)
    r442.update({'kind': 'river', 'perennial': True, 'order': 1, 'name': 'Re\u1e0d Riw\u0101', 'gloss': 'red river (the blood river; was Qol \u1e0cr\u0101i, the cold dry valley)',
                 'width_m': round(4.5 * r442['q_mouth_m3s'] ** .5), 'depth_m': 1.0,
                 'to': {'river': 'r272', 'name': r272['name'], 'at_px': list(r442['to']['at_px'])}})
    r442['width_src_m'] = r442['width_m']
    r272['width_m'] = round(4.5 * r272['q_mouth_m3s'] ** .5)
    r272['width_src_m'] = r272['width_m']
    for key in ('st', 't'):                          # drawn red on the satellite and relief maps
        src = Image.open(io.BytesIO(base64.b64decode(rep[key])))
        im = src.convert('RGBA')
        over = Image.new('RGBA', im.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        for pts, w_, al in strokes(r442):
            dr.line(list(pts), fill=BLOOD_RGB + (al,), width=w_, joint='curve')
        im = Image.alpha_composite(im, over.filter(ImageFilter.GaussianBlur(.5))).convert('RGB')
        qt = getattr(src, 'quantization', None)
        rep[key] = b64(im, 'JPEG', **({'qtables': qt, 'subsampling': 2} if qt else {'quality': 90}))
    print('blood river: r442 -> perennial %s, q %.1f m3s at its mouth (r272 %.1f), width %d m' % (r442['name'].encode('ascii', 'replace').decode(),
          r442['q_mouth_m3s'], r272['q_mouth_m3s'], r442['width_m']))

    # ---- the flank vent: the highest ground in the 4.4-5.0 km band inside Godstep valley's head
    GV = next(r_ for r_ in docs(rpath) if r_['name'] == 'godstep valley' and r_.get('kind') == 'biome')['points']
    gm = Image.new('L', (VW, VH), 0)
    ImageDraw.Draw(gm).polygon([(x_ * su, y_ * sv) for x_, y_ in GV], fill=1)
    band = np.array(gm).astype(bool) & (En >= 4400) & (En <= 5000)
    assert band.any()
    ys_, xs_ = np.where(band)
    k_ = int(np.argmax(En[ys_, xs_]))
    fy, fx = int(ys_[k_]), int(xs_[k_])
    fvent = {'px': [round(fx / su, 2), round(fy / sv, 2)], 'floor': round(float(En[fy, fx]), 1), 'scale': 0.18, 'radius': 1.8}
    print('flank vent: px %s, ground %.0f m (the band holds %d cells)' % (fvent['px'], En[fy, fx], int(band.sum())))

    s = lines[li]
    for k, v in rep.items():                         # the images: base64 strings (set_data is for lists and objects)
        a = s.index('"%s": "' % k) + len('"%s": "' % k)
        s = s[:a] + v + s[s.index('"', a):]
    s = re.sub(r'"hi": [0-9.]+', '"hi": %s' % repr(NEW_HI), s, count=1)
    pj, pi = int(round(cy + PIT_OFF[1] / km)), int(round(cx + PIT_OFF[0] / km))
    vx, vy = (cx + PIT_OFF[0] / km) / su, (cy + PIT_OFF[1] / km) / sv
    vfloor = float(np.round(En[pj, pi], 1))
    s = set_data(s, 'vents', D['vents'] + [{'px': [round(vx, 2), round(vy, 2)], 'floor': vfloor, 'scale': 0.6, 'radius': 5.5}, fvent])
    s = set_data(s, 'rivers', rivers)
    lines[li] = s
    html = '\n'.join(lines)
    html, n1 = re.subn(r'scale model 4\.\d+ ·', 'scale model %s ·' % VERSION, html)
    html, n2 = re.subn(r'outer rim &nbsp;8–17 km \(airless\)', 'outer rim &nbsp;8–27 km (airless)', html)
    assert n1 == 1 and n2 == 1, (n1, n2)
    open(out, 'w', encoding='utf8', newline='\n').write(html)
    report = {'version': VERSION, 'from': '4.22', 'hi': NEW_HI, 'cells_raised': n_raised, 'cells_changed': int(moved.sum()),
              'peak_m': float(En.max()), 'rim_m': H_RIM, 'floor_m': H_FLOOR, 'vent': {'px': [round(vx, 2), round(vy, 2)], 'floor_m': vfloor}, 'flank_vent': fvent, 'blood_river': {'id': 'r442', 'q_mouth_m3s': r442['q_mouth_m3s']},
              'rim_radius_km': [float(rim.min()), float(rim.max())], 'polygon_radius_km': [float(rb_t.min() * km), float(rb_t.max() * km)],
              'profile_km_m': {str(k): round(float(En[(r >= k) & (r < k + 10)].mean())) for k in range(0, 260, 10)}}
    json.dump(report, open(out + '.report.json', 'w', encoding='utf-8', newline='\n'), indent=1)
    print(json.dumps(report['profile_km_m']), report['polygon_radius_km'])


if __name__ == '__main__':
    main()
