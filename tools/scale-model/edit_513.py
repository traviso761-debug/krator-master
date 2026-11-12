#!/usr/bin/env python3
"""Scale model 5.1, edit 3 (2026-11-12): the Slabfields (was Mid Basin, `rmvmidbasin101`), the owner's decision of
2026-11-12: Io-style tilted crustal blocks thrust up out of the flat basalt plains south of the stress hinge.

    python3 tools/scale-model/edit_513.py            # edits model/data in place, writes edit_513.report.json
    python3 tools/scale-model/edit_513.py --dry-run  # every step and check, nothing written

biomes/slabfields/PLAN.md is the reasoning; every number below is the plan's (sections 2 and 3).

1. Four slabs, one of them split (Hi'iaka Montes' way): each a block of flood basalt thrust up on a fault and tilted, a
   cliff on its leading edge and a straight ramp falling to the plain behind, its height tapering out at both ends of its
   strike. Heights over the plain 1.2-2.2 km (the plan's arithmetic: Io's tallest, 17.5 km at 1.8 m/s2, is about 4.3 km at
   7.4 m/s2; its mean, about 6 km, about 1.5 km).
2. A landslide apron in front of every cliff: a lobe 60-140 m thick running out about four cliff heights.
3. Two paterae (flat-floored, steep-walled collapse pits where the faults bring magma up), each holding a spring-fed lake:
   the Leaner's patera at its cliff foot by the road, and the Halves' patera in the gap of the split slab.
4. The records: a basin record for each patera lake; `springs` (a new list in DATA) for the region's springs, those the
   model already had (the three maar springs, the Warp Head) and the new ones; the region renamed the Slabfields in the
   page's defaults (`model/src/51-region-store.js`, with a one-time reconcile for browsers that hold a saved list).

Only the Slabfields' own cells move (its polygon less the cells it shares with the Stalker Gate, Region 99 and the Siphon
Pits). Every other cell of every PNG raster is checked unchanged at the end; the four painted JPEGs are re-encoded whole
(as every edit's are), and their drift outside the region is measured and bounded. Refuses to run twice (the springs list
is the marker). Takes nothing from edit 512 and touches none of its ground (Firebliss, Korona), so it reruns unchanged on
data that already has edit 512 in it.
"""
import json, math, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
REG_ID = 'rmvmidbasin101'            # the region's id is a stable key: kept (plan section 0)
REG_NAME, REG_OLD = 'The Slabfields', 'Mid Basin'
OTHER_BIOMES = ('rmvstalkergate', 'rmvraoas90co7', 'rmvra9zogfm9t')
DRY = '--dry-run' in sys.argv
MARGIN_PX = 6                         # every moved cell lies this far inside the region's own cells (relight eases 3)

# ---- the slabs (5.1 px; 2 km a px). strike: degrees from east toward north (map y runs south); face: the side the cliff
# faces, +1 to the left of the strike (north for an eastward strike), -1 to the right. L, W: length and width (px), H: the
# crest's height over the plain (m), apron_m: the apron's thickness at the cliff's foot (m).
SLABS = [
    dict(id='slab_anvil', name='The Anvil', cx=1662.0, cy=1376.0, strike=8.0, face=+1, L=20.0, W=9.0, H=2200.0,
         apron_m=140.0, plain='the middle bench, 3.1-3.4 km',
         note='the tallest: a lone slab on the middle bench, cliff north over the bench edge, ramp south to the upper step'),
    dict(id='slab_halves_n', name='The Halves (north-west)', cx=1715.0, cy=1366.0, strike=0.0, face=+1, L=7.0, W=5.0,
         H=1600.0, apron_m=90.0, plain='the middle bench, 3.1-3.4 km',
         note='the split slab\'s west half: one slab cut by a NW-SE fault, the halves slid 42 km apart along it'),
    dict(id='slab_halves_se', name='The Halves (south-east)', cx=1729.0, cy=1382.0, strike=0.0, face=+1, L=7.0, W=5.0,
         H=1600.0, apron_m=90.0, plain='the middle bench, 3.1-3.4 km',
         note='the split slab\'s east half, its cliff the same cut as its twin\'s'),
    dict(id='slab_leaner', name='The Leaner', cx=1600.0, cy=1397.0, strike=30.0, face=+1, L=15.0, W=6.0, H=1400.0,
         apron_m=80.0, plain='the corridor\'s south end, about 2.0 km',
         note='the still-tilting slab: a sill inflating under its cliff end lifts it, the ramp steepening; its patera at '
              'the cliff\'s west foot by the road'),
    dict(id='slab_backstop', name='The Backstop', cx=1690.0, cy=1411.0, strike=0.0, face=-1, L=14.0, W=6.0, H=1200.0,
         apron_m=60.0, plain='the upper bench, 4.2-4.3 km',
         note='a back-thrust: its cliff faces south, toward the load, the ramp falling north to the upper step\'s edge'),
]
APRON_RUNOUT_H = 4.0                  # an apron runs out about four cliff heights from the foot (Heim's ratio 0.2-0.25)
PATERAE = [
    dict(id='patera_leaner', name='The Leaner\'s Patera', cx=1601.5, cy=1388.6, r=2.0, depth=180.0, lake_r=1.6,
         lake_depth=90.0, spring='spr_slab_leaner_patera'),
    dict(id='patera_halves', name='The Halves\' Patera', cx=1722.0, cy=1374.0, r=2.5, depth=250.0, lake_r=1.5,
         lake_depth=40.0, spring='spr_slab_halves_patera'),
]


def frame(s, xx, yy):
    """(u, v): u along the strike from the centre (px), v across from the cliff line toward the ramp's toe (px)"""
    a = math.radians(s['strike'])
    sx, sy = math.cos(a), -math.sin(a)               # the strike on the map (y down)
    lx, ly = sy * s['face'], -sx * s['face']          # left of the strike (north of an eastward strike) times face
    # a unit vector toward the cliff: (lx, ly) for face +1 rotated so (sx, sy) x (lx, ly) points left
    lx, ly = (sy, -sx) if s['face'] > 0 else (-sy, sx)
    dx, dy = xx - s['cx'], yy - s['cy']
    u = dx * sx + dy * sy
    v = s['W'] / 2.0 - (dx * lx + dy * ly)             # 0 on the cliff line, W at the ramp's toe
    return u, v, (lx, ly)


def slab_add(s, Eo, xx, yy, plain):
    """the slab's surface over its plain (m, NaN off it) and its apron's thickness (m)"""
    u, v, _ = frame(s, xx, yy)
    half = s['L'] / 2.0
    t = np.clip(np.abs(u) / (half + 0.5), 0, 1)
    v = v + 1.2 * (1 - t ** 2) - 1.2                                  # a lobate front: the cliff bows out at its middle
    Wu = s['W'] * (0.55 + 0.45 * np.sqrt(1 - t ** 2))                 # and the slab narrows toward its tips
    taper = 1.0 - G.sstep(half - 2.5, half + 0.5, np.abs(u))         # the crest dies out over its last 5-6 km
    on = (v >= -0.5) & (v <= Wu) & (taper > 0)
    k_cliff = G.sstep(-0.5, 0.5, v)                                   # the cliff: one cell
    top = plain + s['H'] * taper * (1.0 - np.clip(v, 0, None) / Wu) * k_cliff
    top = np.where(on, top, np.nan)
    run = APRON_RUNOUT_H * s['H'] / 2000.0                            # px
    lobe = 1.0 - G.sstep(half * 0.55, half * 0.95, np.abs(u))        # the lobe is narrower than the cliff's run
    ap = s['apron_m'] * lobe * (1.0 - G.sstep(0.0, run, -v)) * (v < 0)
    ap *= 0.6 + 0.4 * (1.0 - G.sstep(0.0, run, -v))                   # thickest at the foot, a toe of ~60%
    return top, ap


def compass(b):
    """a bearing (degrees clockwise from north) as one of 16 points"""
    pts = 'N NNE NE ENE E ESE SE SSE S SSW SW WSW W WNW NW NNW'.split()
    return pts[int(round((b % 360) / 22.5)) % 16]


def regions_src():
    s = open(os.path.join(SRC, '51-region-store.js'), encoding='utf-8', newline='').read()
    m = re.search(r'const defRegs = (\[.*?\]);\n', s, re.S)
    return s, {r['id']: r for r in json.loads(m.group(1))}


def priority_fill(E, box):
    """depression-filled heights over a box (y0, y1, x0, x1), its edge the outlet (edit_511's)"""
    import heapq
    y0, y1, x0, x1 = box
    S = E[y0:y1, x0:x1]
    H, W = S.shape
    F = np.full(S.shape, np.inf)
    seen = np.zeros(S.shape, bool)
    q = []
    for j in range(H):
        for i in range(W):
            if j in (0, H - 1) or i in (0, W - 1):
                F[j, i] = S[j, i]; seen[j, i] = True; heapq.heappush(q, (S[j, i], j, i))
    while q:
        h, j, i = heapq.heappop(q)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                jj, ii = j + a, i + b
                if 0 <= jj < H and 0 <= ii < W and not seen[jj, ii]:
                    seen[jj, ii] = True
                    F[jj, ii] = max(S[jj, ii], h)
                    heapq.heappush(q, (F[jj, ii], jj, ii))
    return F


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], float)


def main():
    D = P.load()
    if 'springs' in D and any(str(r.get('id', '')).startswith('spr_slab_') for r in D['springs']):
        sys.exit('edit_513 has run already (the Slabfields\' springs are in DATA.springs)')
    rep = {'edit': '5.1 edit 3', 'date': '2026-11-12', 'region': REG_ID}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')
    jpeg0 = {k: D[k] for k in ('st', 't', 'rt', 'ct')}
    raw0 = {k: P.raster(D, k, 'L' if k in L_KEYS else 'RGB') for k in ('h', 'wl', 'wd', 'st', 't', 'rt', 'ct') + L_KEYS}

    # ---- the region's own cells
    _, R = regions_src()
    reg = G.poly(R[REG_ID]['points'], 1.0, 1.0, sh) > .5
    others = np.zeros(sh, bool)
    for rid in OTHER_BIOMES:
        others |= G.poly(R[rid]['points'], 1.0, 1.0, sh) > .5
    own = reg & ~others
    inner = nd.binary_erosion(own, iterations=MARGIN_PX)
    rep['cells'] = {'polygon': int(reg.sum()), 'own': int(own.sum()), 'shared': int((reg & others).sum())}

    # ---- 1-2. the slabs and their aprons
    En = Eo.copy()
    rep['slabs'] = []
    for s in SLABS:
        box = (np.hypot(xx - s['cx'], yy - s['cy']) <= max(s['L'], s['W']) / 2.0)
        plain = float(np.median(Eo[box]))
        top, ap = slab_add(s, Eo, xx, yy, plain)
        body = ~np.isnan(top)
        raise_ = body & (top > En)
        En = np.where(raise_, top, En)
        apron = (ap > 0.5) & ~body
        En = np.where(apron, En + ap, En)
        u, v, (lx, ly) = frame(s, xx, yy)
        crest = body & (np.abs(u) < 2.0)
        toe = body & (np.abs(u) < 1.0) & (v > s['W'] - 1.0)
        cliff_foot = (np.abs(u) < 1.0) & (v < -0.5) & (v >= -1.5)
        dip = math.degrees(math.atan(s['H'] / (s['W'] * 2000.0)))
        rep['slabs'].append({
            'id': s['id'], 'name': s['name'], 'centre_px': [s['cx'], s['cy']], 'strike_deg_from_E': s['strike'],
            'cliff_faces': compass(math.degrees(math.atan2(lx, -ly))),
            'length_km': s['L'] * 2, 'width_km': s['W'] * 2, 'plain_m': round(plain), 'height_over_plain_m': s['H'],
            'crest_m': round(float(En[crest].max())), 'toe_m': round(float(np.median(En[toe]))),
            'cliff_foot_m': round(float(np.median(En[cliff_foot]))) if cliff_foot.any() else None,
            'ramp_dip_deg': round(dip, 1), 'cells': int(body.sum()), 'apron_cells': int(apron.sum()),
            'apron_km2': int(apron.sum()) * 4, 'crest_atm': round(1.6 * math.exp(-float(En[crest].max()) / 8000.0), 2),
            'plain_atm': round(1.6 * math.exp(-plain / 8000.0), 2), 'note': s['note']})

    # ---- 3. the paterae and their lakes
    lakes = np.zeros(sh, bool)
    whas2, wlev2 = whas0.copy(), wlev0.copy()
    rep['paterae'] = []
    for p in PATERAE:
        r = np.hypot(xx - p['cx'], yy - p['cy'])
        ring = (r > p['r'] + 1.0) & (r <= p['r'] + 2.5)
        rim = float(np.median(En[ring]))
        floor = rim - p['depth']
        k = G.sstep(p['r'] - 0.3, p['r'] + 0.9, r)                    # a flat floor, a wall one cell wide
        cut = r <= p['r'] + 0.9
        En = np.where(cut, np.minimum(En, floor + (En - floor) * k), En)
        level = floor + p['lake_depth']
        lk = nd.binary_dilation(r <= p['lake_r'], iterations=3, mask=cut & (En < level))   # the lake fills to the walls
        whas2[lk], wlev2[lk] = True, level
        lakes |= lk
        cy, cx = int(round(p['cy'])), int(round(p['cx']))
        F = priority_fill(En, (cy - 20, cy + 21, cx - 20, cx + 21))
        spill = float(F[20, 20])
        shore = nd.binary_dilation(lk, structure=np.ones((3, 3))) & ~lk
        rep['paterae'].append({'id': p['id'], 'name': p['name'], 'centre_px': [p['cx'], p['cy']],
                               'across_km': round(2 * (p['r'] + 0.5) * 2, 1), 'rim_m': round(rim),
                               'floor_m': round(floor), 'lake_cells': int(lk.sum()), 'lake_km2': int(lk.sum()) * 4,
                               'level_m': round(level), 'spill_m': round(spill), 'closed': bool(spill > level + 20),
                               'shore_min_m': round(float(En[shore].min()))})
        p['_level'], p['_spill'], p['_floor'], p['_mask'] = level, spill, floor, lk
        assert spill > level + 20, p['id'] + ' is not closed'
    water2 = water0 | lakes

    moved = En != Eo
    assert not (moved & ~inner).any(), 'a moved cell lies within %d px of the region\'s edge or off its own cells' % MARGIN_PX
    for rv in D['rivers']:
        for x_, y_ in rv.get('px') or []:
            j, i = int(round(y_)), int(round(x_))
            if 0 <= j < sh[0] and 0 <= i < sh[1]:
                assert not nd.binary_dilation(moved, iterations=1)[j, i], 'river %s crosses the edit' % rv['id']
    vents_in = [v['px'] for v in D['vents'] if moved[int(round(v['px'][1])), int(round(v['px'][0]))]]
    assert not vents_in, 'a vent lies in the edit: %s' % vents_in
    rep['moved_cells'] = int(moved.sum())
    rep['raised_m_max'] = round(float((En - Eo).max()))
    rep['cut_m_max'] = round(float((Eo - En).max()))

    # ---- 4. temperatures lapsed with the surface, then rain, class and zone
    for k, v in C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2).items():
        D[k] = v
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas0, lakes)
    lake_zone = raw0['z'][1348, 1584]                  # the flagship maar's lake: a warm highland lake
    for p in PATERAE:
        cls2[p['_mask']] = codes.index('WH')
        zon2[p['_mask']] = lake_zone
    rep['reclimate'] = crep

    # ---- 5. the paint
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v in relit.items():
        D[k] = v
    near = nd.binary_dilation(moved, iterations=3)
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near, ~near, 150.0)
        if k == 'st':
            # the lakes: the colour of the flagship maar's lake, their own texture kept
            donor = whas0 & (np.hypot(xx - 1584, yy - 1348) < 6)
            tgt = np.median(raw0['st'][donor], 0)
            lum = a.mean(-1)
            det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 3.0) + 4), .8, 1.2)[..., None]
            wgt = np.clip(nd.gaussian_filter(lakes.astype(float), 0.7) * 1.3, 0, 1)[..., None] * own[..., None]
            a = np.clip(a * (1 - wgt) + tgt * det * wgt, 0, 255).astype(np.uint8)
            rep['lake_paint_rgb'] = [round(float(v)) for v in tgt]
        D[k] = P.jpeg_like(D, k, a)

    # ---- 6. records: the basins, the springs
    for p in PATERAE:
        sh_ = nd.binary_dilation(p['_mask'], structure=np.ones((3, 3))) & ~p['_mask']
        D['basins'].append({'at_px': [p['cx'], p['cy']], 'level_m': int(round(p['_level'])),
                            'km2': int(p['_mask'].sum()) * 4, 'spill_m': int(round(p['_spill'])),
                            'climate': codes[int(np.bincount(cnow[sh_]).argmax())], 'kind': 'lake', 'surplus_m3s': 0.0,
                            'depth_m': int(round(p['_level'] - p['_floor'])), 'name': p['name'],
                            'region': REG_ID, 'source': 'spring'})
    D['springs'] = springs(En, rep)
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 7. nothing else moved
    outside = ~own
    for k in ('h', 'wl', 'wd') + L_KEYS:
        a = P.raster(D, k, 'L' if k in L_KEYS else 'RGB')
        diff = (a != raw0[k]) if a.ndim == 2 else np.any(a != raw0[k], -1)
        assert not (diff & outside).any(), k + ' changed outside the Slabfields\' own cells'
        if k in ('h', 'wl'):
            assert not (diff & ~(moved | lakes)).any(), k + ' changed off the edit\'s cells'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in L_KEYS}
    # the painted JPEGs are re-encoded whole, twice (repaint or retint, then relight), and the codec's round trip is not
    # exact (up to 34 levels on `ct`). So the check: away from the region (16 px: a 16x16 MCU and its chroma upsampling),
    # each map is byte for byte the untouched map put through the same two encodes.
    rep['jpeg_outside'] = {}
    far = ~nd.binary_dilation(own, iterations=16)
    for k in ('st', 't', 'rt', 'ct'):
        b = jpeg0[k]
        for _ in range(2):
            b = P.jpeg_like({k: b}, k, P.raster({k: b}, k))
        ref = P.raster({k: b}, k).astype(int)
        now = P.raster(D, k).astype(int)
        codec = np.abs(ref - raw0[k].astype(int)).max(-1)
        rep['jpeg_outside'][k] = {'same_as_untouched_reencoded': bool((now[far] == ref[far]).all()),
                                  'codec_drift_max': int(codec[far].max()),
                                  'codec_drift_mean': round(float(codec[far].mean()), 3),
                                  'changed_px_in_region': int((np.abs(now - raw0[k].astype(int)).max(-1)[own] > 2).sum())}
        assert (now[far] == ref[far]).all(), k + ' changed away from the region beyond the codec\'s own re-encoding'
    stats(D, En, own, whas2, rep)

    # ---- 8. the page's defaults (checked before anything is written)
    rep['records'], writes = records()
    if DRY:
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return
    P.save(D)
    for path, text in writes:
        open(path, 'w', encoding='utf-8', newline='').write(text)
    json.dump(rep, open(os.path.join(HERE, 'edit_513.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


def springs(En, rep):
    """the region's springs: the model's four (three maar floors and the Warp Head) and the edit's four"""
    def g(x, y):
        return int(round(float(En[int(round(y)), int(round(x))])))
    S = [
        ('spr_slab_siphon_breach', 'The Siphon-Breach', 1584.0, 1348.0, 'maar', 'warm, CO2', 'the model\'s',
         'Rises through the flagship maar\'s floor and fills its lake (2,040 m); the lake spills north as Ostrukh Riba. '
         'Fed by the confined basalt aquifer the Stalker Range\'s snow recharges (the plan\'s reading, section 3).'),
        ('spr_slab_caldron', 'The Caldron', 1626.0, 1366.0, 'maar', 'hot, CO2', 'the model\'s',
         'Hot pools and a geyser on the Central Chain-Graben maar\'s dry floor; a travertine cone.'),
        ('spr_slab_east_central', 'The East-Central Diatreme', 1696.0, 1372.0, 'maar', 'warm, CO2', 'the model\'s',
         'A geyser vent on a floor walled by bench basalt, between the Anvil and the Halves.'),
        ('spr_slab_warp_head', 'The Warp Head', 1702.0, 1340.0, 'chasm head', 'cold', 'the model\'s ground',
         'Spring sapping at the head of the Loom\'s southernmost warp chasm: a spring line at the headwall\'s foot, a '
         'stream that dies in the chasm floor\'s salt.'),
        ('spr_slab_leaner_patera', 'The Leaner\'s Patera', 1601.5, 1388.6, 'patera', 'warm, CO2 and H2S', 'edit 513',
         'A warm spring lake in the patera at the Leaner\'s cliff foot, by the corridor road: the fault the slab rides '
         'brings the water and the gas up. The sill inflating under the slab moves it.'),
        ('spr_slab_halves_patera', 'The Halves\' Patera', 1722.0, 1374.0, 'patera', 'warm, CO2', 'edit 513',
         'A warm pool in the patera between the split slab\'s halves. A pit chain runs along the split fault beyond '
         'it (sub-grid, 1-2 km pits, 150-300 m deep): 1725.0,1371.4 and 1719.0,1376.6, each with a seep at its foot.'),
        ('spr_slab_anvil_apron', 'The Anvil\'s apron toe', 1662.0, 1366.0, 'apron toe', 'cold', 'edit 513',
         'Water through the Anvil\'s landslide apron surfaces at its toe: a line of seeps, reed and the bench\'s one '
         'green belt.'),
        ('spr_slab_leaner_ramp', 'The Leaner\'s ramp foot', 1604.0, 1401.5, 'contact', 'cold', 'edit 513',
         'Where the Leaner\'s ramp meets the plain the basalt\'s flow tops leak: springs that move as the ramp tilts.'),
    ]
    out = []
    for sid, nm, x, y, kind, temp, src, note in S:
        out.append({'id': sid, 'name': nm, 'px': [x, y], 'ground_m': g(x, y), 'kind': kind, 'water': temp,
                    'region': REG_ID, 'source': src, 'notes': note})
    rep['springs'] = [{'id': o['id'], 'px': o['px'], 'ground_m': o['ground_m'], 'kind': o['kind']} for o in out]
    return out


def stats(D, En, own, whas2, rep):
    land = own & ~whas2
    e = En[land]
    rep['survey_after'] = {
        'h_p1_5_25_50_75_95_99': [round(float(v)) for v in np.percentile(e, [1, 5, 25, 50, 75, 95, 99])],
        'atm_p5_50_95': [round(float(v), 2) for v in np.percentile(1.6 * np.exp(-e / 8000.0), [5, 50, 95])]}


REG_NOTE = ("The Slabfields (was Mid Basin; renamed 2026-11-12). Between the Loom-Chasms' stretching and the Siphon Pits' "
            "squeezing: north of the hinge the Loom's warp chasms die out in the basalt benches; south of it lone slabs "
            "of flood basalt stand out of the flat bench plains, thrust up and tilted as Io's mountains are (a cliff on "
            "one face, a long ramp on the other, landslide aprons below): the Anvil, the split Halves with a patera in "
            "their gap, the still-tilting Leaner over the corridor road, the Backstop. The six breached maars, the "
            "loess-and-tuff corridor and the spring-fed paterae and chasm heads are the outposts' ground; Yuni outlaws "
            "roam it. biomes/slabfields/PLAN.md; scale model 5.1 edit 3.")


def records():
    out = {}
    path = os.path.join(SRC, '51-region-store.js')
    s = open(path, encoding='utf-8', newline='').read()
    m = re.search(r'\{"id": "%s", "name": "([^"]*)", "color": "[^"]*", "points": \[\[.*?\]\], "notes": "((?:[^"\\]|\\.)*)"'
                  % REG_ID, s)
    assert m and m.group(1) in (REG_OLD, REG_NAME), 'the region\'s default'
    out['region_name_was'] = m.group(1)
    s = s[:m.start(2)] + json.dumps(REG_NOTE, ensure_ascii=False)[1:-1] + s[m.end(2):]
    s = s[:m.start(1)] + REG_NAME + s[m.end(1):]
    # the Stalker Gate's note names its neighbour
    m2 = re.search(r'\{"id": "rmvstalkergate", "name": "[^"]*", "color": "[^"]*", "points": \[\[.*?\]\], "notes": "((?:[^"\\]|\\.)*)"', s)
    assert m2
    s = s[:m2.start(1)] + m2.group(1).replace(REG_OLD, 'the Slabfields') + s[m2.end(1):]
    # one-time reconcile for browsers holding a saved list (as 5.1e1's)
    hook = "      if(localStorage.getItem('krator.regMerged.5.1e1')!=='1'){"
    if "krator.regMerged.5.1e3" not in s:
        i = s.index(hook)
        j = s.index('      }\n', i) + len('      }\n')
        block = ("      if(localStorage.getItem('krator.regMerged.5.1e3')!=='1'){   // 5.1 edit 3: rmvmidbasin101 renamed the "
                 "Slabfields; the Stalker Gate's note\n"
                 "        [\"%s\", \"rmvstalkergate\"].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
                 "        localStorage.setItem('krator.regMerged.5.1e3','1');\n"
                 "        localSave();\n"
                 "      }\n") % REG_ID
        s = s[:j] + block + s[j:]
    assert s.count(REG_OLD) == REG_NOTE.count(REG_OLD), 'Mid Basin is still named in the region store'   # but "was Mid Basin"
    out['region_name_now'] = REG_NAME
    return out, [(path, s)]


if __name__ == '__main__':
    main()
