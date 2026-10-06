#!/usr/bin/env python3
"""Scale model 4.20: the north basin's two dam lakes and the cascade that broke them (the owner, Oct 2026).

The Ancients held two lakes in the northern semiarid basin behind dam arcologies. In the war that ended them the east
lake's dam (in the notch between the lobes) burst first; its surge raised the west lake past its own dam (in the west
lobe's southern saddle), which burst in turn and poured into the long-lake trough and the NW lowlands. The model is the
land today: the notches stand open (breached), the channels the floods cut run through them, and every other outlet of
the old lakes is closed (the rims that held them). The lakes, the dams and the flood paths are written as data
(DATA.palaeolakes, DATA.dams, DATA.floods) for a viewer or an extractor.

    python3 tools/scale-model/edit_dams.py <4.19 page.html> <regions.json> <out page.html>

Reads the page as saved (Artifact read) and the regions collection (one JSON list), writes the new page, a report beside
it and prints what it changed. Deterministic. Steps, for each dam in DAMS:

1. THE NOTCH. The least-high way from the lake, through the dam's site, to the ground it drains to: every cell of it above
   the dam's foot (level + FREEBOARD - height) is cut to the foot, and beyond the crest the bed falls (never rising)
   until the land falls below it. Three cells (~12 km) of floor where the pass is that wide, the walls eased over
   two cells either side; the mountains round the pass (over it by 300 m) are left alone.
2. THE RIMS. With the dam standing (its notch barred), the lake's flood is raised to its level + FREEBOARD; wherever it
   reaches a sink (Korona's trenches, the other lake's floor, the lowlands' low ground) the saddle it crossed is raised by
   a smooth bump, one at a time, until none is reached. A lake's own natural basin (below its spill on 4.19) is never a
   sink. No edit raises an existing lake's bed (4.19's rule), and the sea and the lakes are left alone.
3. THE CHECKS. Each lake holds with its dam standing; with it gone, it drains through its notch to the foot; the east
   lake's surge overtops the west dam's freeboard.
4. THE PAINT and THE CLIMATE as edit_heights.py does: re-lit, temperatures lapsed, rain, class and zone recomputed where
   the heights changed; the channels tinted as scoured rock on the satellite and relief maps.
"""
import heapq, json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edit_heights import LO, HI, load, raster, b64, relight, reclimate, repaint, ramp, chaikin   # noqa: E402

VERSION = '4.20'
FREEBOARD = 50.0          # m: each dam's crest over its lake
SEED_PX = 70              # map px: a lake is seeded at its basin's lowest cell this near its dam
NOTCH_R = 16              # height cells (~4 km): how far from the site the notch and its channel may be cut
BUMP_R = 3.0              # height cells: the radius of a rim's raise
DEEP = -700.0             # m: Korona's trenches (and any ground this low) are a sink
LOWLANDS = ('NW lowlands', 300.0)   # its ground below 300 m is the trough's and the lowlands' low ground: a sink
# the cascade, in the order the dams failed. level: the lake's surface (m); height: the dam's (m, Veladiga's 250);
# natural: the basin's own spill on 4.19 less 5 m (370 m to Korona, 1,160 m to the trough), below which it is no sink;
# drains: the basin its flood falls into (a region whose ground below 300 m is the sink), or LOWLANDS
DAMS = [
    dict(name='east dam', basin='dam 2', site=(507, 110), level=1050.0, height=250.0, natural=365.0, drains='dam'),
    dict(name='west dam', basin='dam', site=(409, 144), level=900.0, height=250.0, natural=1150.0, drains=LOWLANDS[0]),
]


def poly(pts, su, sv, shape):
    from PIL import ImageDraw
    m = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([(a * su, b * sv) for a, b in pts], fill=1)
    return np.array(m).astype(bool)


def flood_to_sink(E, seed, cap, sinks, barrier):
    """the lake from `seed` raised to `cap` (minimax over 8 neighbours, never into `barrier`): the first sink it reaches,
    as (level, the saddle cell: the highest on the way, the way [(j, i)...]) or None"""
    H, W = E.shape
    L = {seed: E[seed]}
    P, pq = {}, [(E[seed], seed)]
    while pq:
        l, c = heapq.heappop(pq)
        if l > L[c]:
            continue
        if sinks[c]:
            path = [c]
            while path[-1] in P:
                path.append(P[path[-1]])
            path = path[::-1]
            k = int(np.argmax([E[p] for p in path]))
            return l, path[k], path
        j, i = c
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                a, b = j + dj, i + di
                if 0 <= a < H and 0 <= b < W and not barrier[a, b] and E[a, b] <= cap:
                    n = max(l, E[a, b])
                    if n < L.get((a, b), np.inf):
                        L[(a, b)] = n
                        P[(a, b)] = c
                        heapq.heappush(pq, (n, (a, b)))
    return None


def lake(E, seed, level, barrier):
    lab, _ = nd.label((E <= level) & ~barrier, structure=np.ones((3, 3)))
    m = lab == lab[seed]
    return m


def disc(shape, c, R):
    jj, ii = np.mgrid[0:shape[0], 0:shape[1]]
    return np.hypot(jj - c[0], ii - c[1]) <= R


def notch(E, seed, level, foot, site, sinks, keep):
    """cut the notch and its channel: returns (new E, channel cells, the way, the crest before, the bed per way cell)"""
    allow = disc(E.shape, site, NOTCH_R)
    r = flood_to_sink(E, seed, 1e9, sinks, ~(allow | (E < level)) & ~sinks)
    if r is None:
        raise SystemExit('no way from the lake through the site to its sink')
    _, crest_c, path = r
    k = path.index(crest_c)
    crest_h = float(E[crest_c])
    bed = np.array([E[p] for p in path], float)
    # upstream of the crest: no higher than the foot; downstream: falling 2 m a cell at least, never above the land
    for n in range(k, -1, -1):
        if not allow[path[n]] and E[path[n]] > foot:
            break
        bed[n] = min(bed[n], foot)
    b = foot
    for n in range(k + 1, len(path)):
        b = min(E[path[n]], b - 2.0)
        bed[n] = b
    En = E.copy()
    core = np.zeros(E.shape, bool)
    for p, bv in zip(path, bed):
        if bv < E[p] - .5 and not keep[p]:
            En[p] = bv
            core[p] = True
    # the floor one cell either side of the way (~12 km: a megaflood scours the whole pass), then the walls: one cell
    # out halfway down, the next a quarter (never raised, never into the sea or a lake)
    lev = np.full(E.shape, np.inf)
    for p, bv in zip(path, bed):
        if core[p]:
            lev[p] = bv
    near = lev.copy()
    for ring, share in ((1, 1.0), (2, .5), (3, .25)):
        near = nd.grey_erosion(near, size=(3, 3))
        # the walls are the pass's own sides: the mountains round a pass (ground over it by 300 m) are left alone
        band = np.isfinite(near) & ~np.isfinite(lev) & ~keep & (E <= crest_h + 300)
        # the floor widens only over the pass's own floor (ground no higher than the pass was), never up its flanks
        sh = np.where((share == 1.0) & (E > crest_h + 100), .5, share)
        target = np.where(band, near, 0) + (E - np.where(band, near, 0)) * (1 - sh)
        En[band] = np.minimum(En[band], target[band])
        if share == 1.0:
            core |= band & (En < E - .5) & (E <= crest_h + 100)
        lev = np.where(band, near, lev)
    return En, core, path, float(E[crest_c]), bed


def raise_rims(E, seed, cap, sinks, barrier, keep, tag, log):
    jj, ii = np.mgrid[0:E.shape[0], 0:E.shape[1]]
    for _ in range(120):
        r = flood_to_sink(E, seed, cap, sinks, barrier)
        if r is None:
            return
        _, (j, i), _ = r
        target = cap + 20.0
        d = np.hypot(jj - j, ii - i)
        w = np.where((d < BUMP_R) & ~keep, np.cos(np.pi / 2 * d / BUMP_R) ** 2, 0)
        log.append({'lake': tag, 'cell': [int(i), int(j)], 'from_m': round(float(E[j, i])), 'to_m': round(target)})
        E[:] = np.maximum(E, E + (target - E) * w)
    raise SystemExit('the rims of %s did not close' % tag)


SCOUR = np.array([92.0, 84.0, 78.0])     # bare basalt, the colour of a scabland's stripped floor


def scour(D, key, a):
    """blend the scoured-rock colour over a painted map by `a` (0..1, full res), keeping the paint's shading"""
    import base64, io
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    im = np.array(src.convert('RGB')).astype(float)
    lum = im.mean(-1, keepdims=True) / max(1.0, float(im.mean()))
    a = np.clip(nd.gaussian_filter(a, 1.0), 0, 1)[..., None] * .7
    im = im * (1 - a) + SCOUR * np.clip(lum, .6, 1.4) * a
    q = getattr(src, 'quantization', None)
    return b64(Image.fromarray(np.clip(im, 0, 255).round().astype(np.uint8)), 'JPEG',
               **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


def set_data(s, key, value):
    """DATA.<key> = value on the page's DATA line (replaced if there, added once at the end if not)"""
    k = '"%s": ' % key
    if k in s:
        a = s.index(k) + len(k)
        depth, b = 0, a
        while True:
            depth += {'[': 1, ']': -1, '{': 1, '}': -1}.get(s[b], 0)
            b += 1
            if depth == 0:
                break
        return s[:a] + json.dumps(value) + s[b:]
    return s[:s.rindex('}')] + ', "%s": ' % key + json.dumps(value) + s[s.rindex('}'):]


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    page, regions, out = sys.argv[1:4]
    lines, li, D = load(page)
    R = {r['name']: r for r in json.load(open(regions, encoding='utf8'))}
    VW, VH, OW, OH = D['w'], D['hh'], D['fullW'], D['fullH']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    KM2 = (2 / su) * (2 / sv)
    g = lambda x, y: (int(round(y * sv)), int(round(x * su)))
    px = lambda j, i: [round(i / su, 1), round(j / sv, 1)]
    h = raster(D, 'h').astype(np.int64)
    wl = raster(D, 'wl').astype(np.int64)
    E = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
    water = h[..., 2] > 127
    whas = wl[..., 2] > 127
    wlev = np.where(whas, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), 0.0)
    keep = water | whas                           # the sea and the lakes are never edited
    report = {'version': VERSION, 'dams': []}

    for nm in [d['basin'] for d in DAMS] + [LOWLANDS[0]]:
        if nm not in R:
            sys.exit('no region named %r' % nm)
    mask = {nm: poly(R[nm]['points'], su, sv, E.shape) for nm in [d['basin'] for d in DAMS] + [LOWLANDS[0]]}
    low = {d['basin']: mask[d['basin']] & (E < 300) for d in DAMS}
    low[LOWLANDS[0]] = mask[LOWLANDS[0]] & (E < LOWLANDS[1])
    for d in DAMS:
        near = mask[d['basin']] & disc(E.shape, g(*d['site']), SEED_PX * su)
        d['seed'] = np.unravel_index(np.argmin(np.where(near, E, np.inf)), E.shape)
        lab, _ = nd.label(E <= d['natural'], structure=np.ones((3, 3)))
        d['home'] = lab == lab[d['seed']]
        d['foot'] = d['level'] + FREEBOARD - d['height']
        d['sinks'] = ((E < DEEP) | low[LOWLANDS[0]] | np.logical_or.reduce(
            [low[o['basin']] for o in DAMS if o is not d])) & ~d['home']

    # 1. the notches
    E2 = E.copy()
    for d in DAMS:
        E2, core, path, crest, bed = notch(E2, d['seed'], d['level'], d['foot'], g(*d['site']),
                                           low[d['drains']] & ~d['home'], keep)
        d['core'], d['path'], d['bed'] = core, path, bed
        k = int(np.argmax([E[p] for p in path]))
        d['crest_cell'] = path[k]
        # the dam: across its notch at the crest, everything within two cells under its crest
        d['dam'] = nd.binary_dilation(core & disc(E.shape, path[k], 3), iterations=2) & (E2 < d['level'] + FREEBOARD)
        report['dams'].append({'name': d['name'], 'basin': d['basin'], 'site_px': px(*path[k]), 'lake_level_m': d['level'],
                               'crest_m': d['level'] + FREEBOARD, 'foot_m': d['foot'], 'height_m': d['height'],
                               'pass_before_m': round(crest), 'cut_m': round(crest - d['foot']),
                               'floor_km2': round(float(core.sum()) * KM2)})
    # 2. the rims, with every dam standing
    barrier = np.logical_or.reduce([d['dam'] for d in DAMS])
    log = []
    for d in DAMS:
        raise_rims(E2, d['seed'], d['level'] + FREEBOARD, d['sinks'], barrier, keep, d['basin'], log)
    up = np.clip(E2 - E, 0, None)
    lab, n = nd.label(up > 10, structure=np.ones((3, 3)))
    report['rims'] = []
    for k_ in range(1, n + 1):
        m = lab == k_
        jj, ii = np.nonzero(m)
        report['rims'].append({'at_px': px(int(jj.mean()), int(ii.mean())), 'km2': round(float(m.sum() * KM2)),
                               'span_km': round(float(np.hypot(np.ptp(jj), np.ptp(ii)) * 2 / su)),
                               'raised_most_m': round(float(up[m].max())), 'crest_m': round(float(E2[m].max()))})
    report['rim_bumps'] = len(log)
    # 4.19's rule: no edit raises an existing lake's bed; uplift eased back in over 2 cells from their shores
    old_lake = whas & ~water
    kl = np.clip(nd.distance_transform_edt(~old_lake) / 2.0, 0, 1)
    dE = E2 - E
    E2 = E + np.where(dE > 0, dE * kl, dE)
    En = np.where(keep, E, E2)

    # 3. the checks
    for d in DAMS:
        held = flood_to_sink(En, d['seed'], d['level'] + FREEBOARD - 1, d['sinks'], barrier)
        assert held is None, '%s does not hold: it reaches a sink at %s' % (d['name'], held[1])
        r = flood_to_sink(En, d['seed'], 1e9, low[d['drains']] & ~d['home'], barrier & ~d['dam'])
        assert r is not None and r[0] <= d['foot'] + 5, '%s does not drain through its notch to its foot' % d['name']
        lk = lake(En, d['seed'], d['level'], barrier)
        lo_ = lake(En, d['seed'], d['foot'], barrier)   # what stays behind the breach, below its floor
        d['lake'] = lk
        d['km2'] = float(lk.sum() * KM2)
        d['km3'] = float(np.where(lk, d['level'] - En, 0).sum() * KM2 / 1000)
        d['drained_km3'] = d['km3'] - float(np.where(lo_, d['foot'] - En, 0).sum() * KM2 / 1000)
    east, west = DAMS
    rise = east['drained_km3'] / west['km2'] * 1000
    report['lakes'] = [{'basin': d['basin'], 'level_m': d['level'], 'km2': round(d['km2']), 'km3': round(d['km3']),
                        'drained_by_its_breach_km3': round(d['drained_km3'])} for d in DAMS]
    report['surge'] = {'east_lake_drained_km3': round(east['drained_km3']), 'west_lake_rise_m': round(rise),
                       'west_freeboard_m': FREEBOARD, 'overtops': bool(rise > FREEBOARD)}
    report['heights'] = {'cells_cut': int((En < E - 10).sum()), 'cells_raised': int((En > E + 10).sum()),
                         'deepest_cut_m': round(float((E - En).max())), 'highest_raise_m': round(float((En - E).max()))}
    print(json.dumps({k: report[k] for k in ('dams', 'rims', 'lakes', 'surge', 'heights')}, indent=1))
    assert rise > FREEBOARD, 'the east surge does not overtop the west dam'

    # 4. the page: heights, paint, temperatures, climate
    enc = lambda v: np.round(np.clip((v - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)
    q = np.where(np.abs(En - E) > .5, enc(En), (h[..., 0] << 8) | h[..., 1])
    h2 = h.copy()
    h2[..., 0], h2[..., 1] = q >> 8, q & 255
    rep = {'h': b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True)}
    imgs, _, _ = relight(D, E, En)
    rep.update(imgs)
    # the floods' channels painted as scoured rock on the satellite and relief maps (the floor darkest, the walls less)
    cut = np.clip((E - En) / 300.0, 0, 1) * np.logical_or.reduce([nd.binary_dilation(d['core'], iterations=2) for d in DAMS])
    for k in ('st', 't'):
        rep[k] = scour(dict(D, **{k: rep[k]}), k, nd.zoom(cut, (OH / E.shape[0], OW / E.shape[1]), order=1)[:OH, :OW])
    surf = lambda Ex: np.where(whas, np.maximum(Ex, wlev), Ex)
    DS = nd.zoom(surf(En) - surf(E), (OH / E.shape[0], OW / E.shape[1]), order=1)
    for k in ['tm', 'th', 'tl', 'tw', 'tc']:
        a = raster(D, k, 'L').astype(float)
        v = a - 90
        ok = (v > -89) & (np.abs(DS) > 1)
        v2 = np.where(ok, np.round(v - 6.5 * DS / 1000), v)
        rep[k] = b64(Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    D2 = dict(D, tm=rep['tm'])
    rain0 = raster(D, 'p', 'L').astype(float) / 255 * 4000
    rain2, cls2, zon2, _, report['climate'] = reclimate(D2, E, En, whas, np.zeros((OH, OW), bool), None)
    print('climate:', report['climate'])
    pal = np.array([[int(c['color'][i:i + 2], 16) for i in (1, 3, 5)] for c in D['climate']['classes']], float)
    c0 = raster(D, 'c', 'L')
    rep['ct'] = repaint(dict(D, ct=rep['ct']), 'ct', pal[c0], pal[cls2], cls2 != c0)
    rep['rt'] = repaint(dict(D, rt=rep['rt']), 'rt', ramp(rain0), ramp(rain2), np.abs(rain2 - rain0) > 15)
    rep['p'] = b64(Image.fromarray(np.clip(np.round(rain2 / 4000 * 255), 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['c'] = b64(Image.fromarray(cls2, 'L'), optimize=True)
    rep['z'] = b64(Image.fromarray(zon2, 'L'), optimize=True)
    s = lines[li]
    for k, v in rep.items():
        key = '"%s": "' % k
        assert s.count(key) == 1, k
        a = s.index(key) + len(key)
        s = s[:a] + v + s[s.index('"', a):]
    # the data: the old lakes (their shorelines), the dams (ruins at their notches) and the floods (their channels)
    s = set_data(s, 'palaeolakes', [{'basin': d['basin'], 'level_m': d['level'], 'km2': round(d['km2']),
                                     'km3': round(d['km3']), 'seed_px': px(*d['seed'])} for d in DAMS])
    s = set_data(s, 'dams', [{k: v for k, v in r.items() if k != 'floor_km2'} for r in report['dams']])
    floods = []
    for n_, d in enumerate(DAMS):
        cut_at = [i for i, p in enumerate(d['path']) if d['core'][p]]
        a, b = max(0, cut_at[0] - 2), min(len(d['path']), cut_at[-1] + 3)
        pts = chaikin([tuple(px(*p)) for p in d['path'][a:b]], 3)
        floods.append({'name': d['name'] + ' breach', 'order': n_ + 1, 'from': d['basin'], 'to': d['drains'],
                       'px': [[round(x, 1), round(y, 1)] for x, y in pts],
                       'bed_m': [round(float(v)) for v in d['bed'][a:b]], 'floor_km': 12, 'walls_km': 8})
    s = set_data(s, 'floods', floods)
    lines[li] = s
    html = '\n'.join(lines)
    html, n = re.subn(r'scale model 4\.\d+ ·', 'scale model %s ·' % VERSION, html)
    assert n >= 1, 'version label not found'
    open(out, 'w', encoding='utf8').write(html)
    report['rim_log'] = log
    json.dump(report, open(os.path.splitext(out)[0] + '.report.json', 'w'), indent=1)
    np.savez_compressed(os.path.splitext(out)[0] + '.heights.npz', before=E, after=En,
                        lakes=np.stack([d['lake'] for d in DAMS]), dams=barrier)
    print('wrote %s (%d bytes); report beside it' % (out, len(html)))


if __name__ == '__main__':
    main()
