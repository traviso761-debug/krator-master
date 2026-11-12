#!/usr/bin/env python3
"""Bake a settlement page's own ground for the open world: openworld/towns/<town>/ (openworld/PLAN-VOTH.md section 3,
Layer 2, step V2). The world then takes the town's ground inside its footprint (core/world 41 buildTowns / townAt), its
water as the town's water mask and its river as a named river (core/world/41t-world-town-water.js).

    python3 core/world/bake_towns.py <town>            # write openworld/towns/<town>/ (town.json, ground.png, water.png)
    python3 core/world/bake_towns.py <town> --check    # bake again and compare with the files (exit 1 if stale)
    python3 core/world/bake_towns.py --list

The page's code is run read-only in node, as bake_sites.py runs core/hamlet: its terrain field (Voth: src/10-core.js
terrainH, landDist, RIVER, ISLES), its shore trace (src/15-shore.js SHORE) and the site editor's ground edits
(targets/voth-site/10-site-model.js TERR, replayed from site/voth-site.json as the city page replays them:
targets/voth-city/30-vc-site.js). Nothing of the page is written.

What is written (openworld/towns/<town>/):
  ground.png   the ground every `step` m over the page's square (16-bit grey: h = h0 + (v - 32768) * s), north up, row j
               at z = z0 + j*step, column i at x = x0 + i*step, in the page's own frame (x east, z south, metres)
  water.png    one byte a cell: 1 the page's water polygon (landDist < 0, the ground under the level: the islets cut out),
               2 the river's channel (the ground under the level near RIVER, outside the polygon), 4 ground under the level
               joined to those (the site's edits at the water's edge), 0 land; 3 a hollow under the level apart from the
               water (reported: on the page the water's plane shows in it, the world floods only from the town's water)
  town.json    the frame and footprint (R, band), the level (the page's water, which the world puts on its own water
               level: onWater), the river (its polyline and half-width every point, the model river it joins), the shore
               trace (for the checks), the stats and the source hashes

record(town, meta) gives the WORLD_DATA.towns entry a region's build writes (41 reads x, z, rot, centre, R, band, grid,
onWater; 41t the rest). Deterministic: the same page sources give the same files."""
import base64, hashlib, json, math, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'openworld', 'towns')
sys.path.insert(0, HERE)
import world_data as WD   # noqa: E402  (_rle_encode: the water mask run-length coded)

# A town: its page's code (read in place, in this order), how the ground is sampled and what the world is told.
#  frame: the page's square half-size (m); step: the grid (m); R: the footprint (the town's ground inside, 41 townAt);
#  band: the ease back to the world; level: the page's water level in its own frame; pin: the scale model's pixel (5.1)
#  and settlement id, the frame's origin there (the page's north is the world's north: rot 0)
TOWNS = {
    'voth': {
        'name': 'Voth', 'site': 's3n66733vo', 'pin_px': [742, 1018], 'page': 'settlements/voth',
        'js': ['settlements/voth/src/10-core.js', 'settlements/voth/src/15-shore.js'],
        'edits': {'model': 'settlements/voth/targets/voth-site/10-site-model.js', 'site': 'settlements/voth/site/voth-site.json'},
        # R 5.3 km: the lake's north shore reaches 4.9 km from the pin (its main circle, r 1,880 m at 260,-2,900, and the
        # shore's noise), so a 4.8 km footprint cut it and the band carried the page's shallows out (2026-11-12)
        'frame': 5400, 'step': 10, 'R': 5300, 'band': 1500, 'level': 0,
        'river': {'name': 'Voth river', 'join': 'r029', 'var': 'RIVER'},   # the Turm (Turm Rivrh), by its id in DATA.rivers
        'note': 'Voth\'s ground (openworld/PLAN-VOTH.md): the page\'s terrainH with the site editor\'s edits, its bay, narrows, '
                'lake and strait as the water, its river as a named river joined to the Turm (r029, re-routed by edit_513)'},
}

# the node side: the page's code, then the sampling (plain ES5: the page's own globals, no strict mode)
SAMPLE = r'''
var VOTH = { terrainH: terrainH };
var __S = SITE.clean(__SITE); TERR.sync(__S.terrain);
var __T = __TOWN, half = __T.frame, st = __T.step, n = Math.round(2 * half / st) + 1, lv = __T.level;
var gh = function (x, z) { return terrainH(x, z) + TERR.delta(x, z); };
var H = new Float32Array(n * n), Wt = new Uint8Array(n * n);
var RV = eval(__T.river.var), RVC = cumLen(RV), RVL = RVC[RVC.length - 1];
/* the river's half-width as the page's terrainH has it (10-core.js: chan = 40 + 44 rt, rt the share of RIVER from its mouth) */
var hwAt = function (s) { return 40 + 44 * Math.max(0, Math.min(1, s / RVL)); };
var near = 0;
for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
  var x = -half + i * st, z = -half + j * st, h = gh(x, z), k = j * n + i;
  H[k] = h;
  if (h >= lv) continue;
  if (landDist(x, z) < 0) { Wt[k] = 1; continue; }
  var r = polyNear(x, z, RV, RVC);
  Wt[k] = r.d < hwAt(r.t * RVL) + 60 ? 2 : 3;
}
/* the river: its points (mouth first, as RIVER runs) with their half-widths and the ground under them */
var riv = RV.map(function (p, q) { return [p[0], p[1], hwAt(RVC[q]), gh(p[0], p[1])]; });
/* the river's centre line every 10 m: the ground under it (it must stay under the level to the footprint's edge) */
var bedMax = -1e9, bedAt = null;
for (var s = 0; s <= RVL; s += 10) {
  var lo = 0; while (lo < RVC.length - 2 && RVC[lo + 1] < s) lo++;
  var t = (s - RVC[lo]) / Math.max(1e-6, RVC[lo + 1] - RVC[lo]), px = mix(RV[lo][0], RV[lo + 1][0], t), pz = mix(RV[lo][1], RV[lo + 1][1], t);
  if (Math.hypot(px, pz) > __T.R) break;
  var b = gh(px, pz); if (b > bedMax) { bedMax = b; bedAt = [px, pz, s]; }
}
var buf = Buffer.from(H.buffer);
require('fs').writeFileSync(__OUT + '/h.f32', buf);
require('fs').writeFileSync(__OUT + '/w.u8', Buffer.from(Wt.buffer));
/* the site's edit under each shore point: where the owner raised or lowered the ground the page's water stands at the
   edited ground's crossing, not the trace */
var shoreD = SHORE.map(function (p) { return TERR.delta(p[0], p[1]); });
process.stdout.write(JSON.stringify({ n: n, shore: SHORE, shoreD: shoreD, slen: SLEN, river: riv, rlen: RVL, isles: ISLES, bedMax: bedMax, bedAt: bedAt,
  strokes: __S.terrain.length, edited: TERR.D ? Array.prototype.some.call(TERR.D, function (v) { return v !== 0; }) : false }));
'''


def node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return c
    sys.exit('bake_towns: node not found (set NODE)')


def read(rel):
    return open(os.path.join(ROOT, rel), encoding='utf-8').read()


def sources(T):
    return T['js'] + [T['edits']['model'], T['edits']['site']]


def src_hash(T):
    h = hashlib.sha256()
    for rel in sources(T) + ['core/world/bake_towns.py']:
        h.update(rel.encode('utf-8'))
        h.update(read(rel).replace('\r\n', '\n').encode('utf-8'))
    return h.hexdigest()[:16]


def run_page(T, tmp):
    js = ''.join('\n/* ---- %s (read in place) ---- */\n%s\n' % (rel, read(rel)) for rel in T['js'])
    js = 'var window = globalThis;\n' + js
    js += '\n/* ---- %s (read in place) ---- */\n%s\n' % (T['edits']['model'], read(T['edits']['model']))
    js += 'var __SITE = %s;\nvar __TOWN = %s;\nvar __OUT = %s;\n' % (read(T['edits']['site']).strip(), json.dumps(T), json.dumps(tmp.replace(os.sep, '/')))
    js += SAMPLE
    path = os.path.join(tmp, 'bake.js')
    open(path, 'w', encoding='utf-8', newline='\n').write(js)
    r = subprocess.run([node(), '--max-old-space-size=4000', path], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit('bake_towns: node failed:\n' + r.stderr[-4000:])
    return json.loads(r.stdout)


def seg_d(x, z, P):
    """the distance from (x, z) to the polyline P ([x, z, half-width, ...]) and the half-width there"""
    best, hw = 1e18, 0
    for a, b in zip(P, P[1:]):
        dx, dz = b[0] - a[0], b[1] - a[1]
        L2 = dx * dx + dz * dz
        t = min(1, max(0, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)) if L2 > 0 else 0
        d = math.hypot(a[0] + dx * t - x, a[1] + dz * t - z)
        if d < best:
            best, hw = d, a[2] + (b[2] - a[2]) * t
    return best, hw


def shore_error(Hg, n, step, half, level, shore, edit, river):
    """the page's shore trace against the ground's crossing of the level: at each trace point, the distance along its
    normal to where the bilinear ground meets the level (what the world draws). Trace points where the site's edits moved
    the ground (|delta| > 5 cm at it or its neighbours: the owner's quays and cuts) are counted apart: there the page's water stands at
    the edited ground's crossing. So are the points at the river's mouth, where the page's river (its bed and banks,
    10-core.js terrainH) cuts the estuary's shore: there the trace is not where the page's water meets its ground.
    Returns (max, mean, count, unmatched, the edited points' indices, the river's, the five worst [err, x, z])"""
    def g(x, z):
        u = min(max((x + half) / step, 0), n - 1.0001)
        v = min(max((z + half) / step, 0), n - 1.0001)
        i, j = int(u), int(v)
        fu, fv = u - i, v - j
        return (Hg[j, i] * (1 - fu) + Hg[j, i + 1] * fu) * (1 - fv) + (Hg[j + 1, i] * (1 - fu) + Hg[j + 1, i + 1] * fu) * fv
    errs, edited, inriv, worst = [], [], [], []
    dirs = [(math.cos(a * math.pi / 16), math.sin(a * math.pi / 16)) for a in range(32)]
    for k in range(1, len(shore) - 1):
        x, z = shore[k]
        if math.hypot(x, z) > TOWNS_R_GUARD:
            continue
        if max(abs(edit[q]) for q in range(max(0, k - 2), min(len(edit), k + 3))) > .05:
            edited.append(k)
            continue
        rd, rhw = seg_d(x, z, river)
        if rd < 260 + 900 * (rhw - 40) / 44:   # inside the river's vale (10-core.js: vale = 260 + 900 rt, chan = 40 + 44 rt)
            inriv.append(k)
            continue
        # the distance to the ground's crossing of the level: the nearest crossing along 32 rays, 0.5 m steps to 60 m
        best, prev = 1e9, g(x, z) - level
        if prev == 0:
            best = 0
        for dx, dz in dirs:
            a = prev
            for q in range(1, 121):
                d = q * .5
                if d - .5 >= best:
                    break
                b = g(x + dx * d, z + dz * d) - level
                if (a < 0) != (b < 0):
                    best = min(best, d - .5 + .5 * abs(a) / max(1e-9, abs(a) + abs(b)))
                    break
                a = b
        errs.append(best)
        worst.append((best, round(x, 1), round(z, 1)))
    errs = np.array(errs)
    ok = errs[errs < 1e8]
    worst.sort(reverse=True)
    return float(ok.max()), float(ok.mean()), int(len(errs)), int((errs > 1e8).sum()), edited, inriv, [[round(min(e, 1e9), 2), x, z] for e, x, z in worst[:5]]


TOWNS_R_GUARD = 4800.0


def bake(key, check=False):
    T = TOWNS[key]
    global TOWNS_R_GUARD
    TOWNS_R_GUARD = T['R']
    with tempfile.TemporaryDirectory() as tmp:
        P = run_page(T, tmp)
        n = P['n']
        Hg = np.fromfile(os.path.join(tmp, 'h.f32'), dtype='<f4').reshape(n, n).astype(np.float64)
        Wt = np.fromfile(os.path.join(tmp, 'w.u8'), dtype='u1').reshape(n, n)
    lo, hi = float(Hg.min()), float(Hg.max())
    s = max(.01, math.ceil((hi - lo) / 65000.0 / .005) * .005)
    h0 = round((lo + hi) / 2.0, 2)
    q = np.clip(np.round((Hg - h0) / s), -32767, 32767).astype(np.int32)
    Hq = h0 + q * s
    step, half = T['step'], T['frame']
    # a hollow under the level that joins the water (4-connected: the site's 'lower' strokes at the bay's edge) is the
    # page's water too (its plane stands everywhere); one that does not stays apart (3: dry in the world)
    lab, _ = ndimage.label(Wt > 0)
    wet = np.unique(lab[(Wt == 1) | (Wt == 2)])
    Wt = np.where((Wt == 3) & np.isin(lab, wet[wet > 0]), 4, Wt).astype(np.uint8)
    emax, emean, en, emiss, eedit, eriv, eworst = shore_error(Hq, n, step, half, T['level'], P['shore'], P['shoreD'], P['river'])
    cell_km2 = step * step / 1e6
    yy, xx = np.mgrid[0:n, 0:n]
    rr = np.hypot(-half + xx * step, -half + yy * step)
    inR = rr <= T['R']
    stats = {'h_min': round(lo, 2), 'h_max': round(hi, 2), 'quant_m': s, 'h0': h0,
             'lake_km2': round(float((Wt == 1).sum()) * cell_km2, 3), 'river_km2': round(float((Wt == 2).sum()) * cell_km2, 3),
             'joined_hollow_cells': int((Wt == 4).sum()), 'hollow_cells': int((Wt == 3).sum()), 'hollow_cells_in_R': int(((Wt == 3) & inR).sum()),
             'shore_points': en, 'shore_points_edited': len(eedit), 'shore_points_river': len(eriv), 'shore_worst': eworst, 'shore_err_max_m': round(emax, 2), 'shore_err_mean_m': round(emean, 2), 'shore_unmatched': emiss,
             'river_bed_max_m': round(P['bedMax'], 2), 'river_bed_max_at': [round(v, 1) for v in P['bedAt']] if P['bedAt'] else None,
             'site_strokes': P['strokes'], 'site_edited': P['edited']}
    shore = [[round(p[0], 1), round(p[1], 1)] for p in P['shore']]
    river = [[round(p[0], 1), round(p[1], 1), round(p[2], 1)] for p in P['river']]
    meta = {'format': 'krator-town-ground', 'version': 1, 'town': key, 'name': T['name'], 'site': T['site'], 'pin_px': T['pin_px'],
            'page': T['page'], 'note': T['note'],
            'frame': {'units': 'm', 'x': 'east', 'z': 'south', 'half': half, 'rot': 0, 'centre': [0, 0]},
            'grid': {'n': n, 'step': step, 'x0': -half, 'z0': -half, 'h0': h0, 's': s, 'file': 'ground.png',
                     'encoding': '16-bit grey v: h = h0 + (v - 32768) * s; row j at z0 + j*step, column i at x0 + i*step'},
            'water': {'file': 'water.png', 'values': {'0': 'land', '1': 'the water polygon', '2': 'the river\'s channel', '3': 'a hollow under the level'}},
            'R': T['R'], 'band': T['band'], 'level': T['level'], 'onWater': True, 'drawn': False,
            'river': {'name': T['river']['name'], 'join': T['river']['join'], 'mouth_first': True, 'length_m': round(P['rlen'], 1),
                      'pts': river, 'note': '[x, z, half-width] in the frame, from the mouth upstream (the page\'s RIVER)'},
            'shore': {'step_m': 24, 'length_m': round(P['slen'], 1), 'pts': shore, 'skip': sorted(eedit + eriv),
                      'note': 'skip: the trace points where the site edits moved the ground or the river vale shapes it (not the page shore)'},
            'isles': P['isles'], 'stats': stats,
            'sources': {'files': sources(T), 'hash': src_hash(T), 'by': 'core/world/bake_towns.py'}}
    dst = os.path.join(OUT, key)
    gpng = np.ascontiguousarray((q + 32768).astype('<u2'))
    if check:
        old = json.load(open(os.path.join(dst, 'town.json'), encoding='utf-8')) if os.path.isfile(os.path.join(dst, 'town.json')) else {}
        g0 = np.array(Image.open(os.path.join(dst, 'ground.png'))).astype(np.int64) if os.path.isfile(os.path.join(dst, 'ground.png')) else None
        w0 = np.array(Image.open(os.path.join(dst, 'water.png'))) if os.path.isfile(os.path.join(dst, 'water.png')) else None
        same = (old.get('sources', {}).get('hash') == meta['sources']['hash'] and g0 is not None and np.array_equal(g0, gpng.astype(np.int64))
                and w0 is not None and np.array_equal(w0, Wt))
        print(('fresh' if same else 'STALE') + ': %s (sources %s, baked %s)' % (key, meta['sources']['hash'], old.get('sources', {}).get('hash')))
        return 0 if same else 1
    os.makedirs(dst, exist_ok=True)
    Image.fromarray(gpng).save(os.path.join(dst, 'ground.png'), optimize=True)
    Image.fromarray(np.ascontiguousarray(Wt)).save(os.path.join(dst, 'water.png'), optimize=True)
    with open(os.path.join(dst, 'town.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
    print('baked openworld/towns/%s: %d x %d at %g m, h %.1f..%.1f m (steps of %g m)' % (key, n, n, step, lo, hi, s))
    print('  water %.2f km2, river %.2f km2, %d cells of edited ground joining the water, %d hollow cells apart (%d inside R)' % (
        stats['lake_km2'], stats['river_km2'], stats['joined_hollow_cells'], stats['hollow_cells'], stats['hollow_cells_in_R']))
    print('  shore trace vs the ground at the level: %d points inside R, worst %.2f m, mean %.2f m, %d unmatched within 60 m; '
          '%d where the site\'s edits moved the ground, %d in the river\'s vale' % (en, emax, emean, emiss, len(eedit), len(eriv)))
    print('  river: %.0f m, its bed at most %.2f m (the level %g) inside R; %d site strokes' % (P['rlen'], P['bedMax'], T['level'], P['strokes']))
    return 0


# ---------------------------------------------------------------- the record a region's build writes into WORLD_DATA.towns
def load(key):
    d = os.path.join(OUT, key)
    meta = json.load(open(os.path.join(d, 'town.json'), encoding='utf-8'))
    g = np.array(Image.open(os.path.join(d, 'ground.png'))).astype(np.int64) - 32768
    w = np.array(Image.open(os.path.join(d, 'water.png'))).astype(np.uint8)
    return meta, g, w


def place(meta, region):
    """the town's centre in the region's frame: its site's pixel when the region carries the site (cut_site.py writes
    region.json 'sites'; a moved settlement's pixel is there), else the town's pin"""
    cx, cy = region['frame']['origin_px']
    px, py = meta['pin_px']
    for s in region.get('sites', []) + region.get('settlements', []):
        if s.get('id') == meta['site'] or s.get('doc') == meta['site']:
            px, py = s['px'], s['py']
            break
    return (px - cx) * 2000.0, (py - cy) * 2000.0, [px, py]


def record(key, region, shore=True):
    """the WORLD_DATA.towns entry for a region (region.json's meta): 41's keys (x, z, rot, centre, R, band, grid, onWater)
    and 41t's (drawn, level, water, river, shore)"""
    meta, g, w = load(key)
    x, z, px = place(meta, region)
    G = meta['grid']
    rec = {'name': meta['name'], 'town': key, 'x': x, 'z': z, 'px': px, 'rot': 0, 'centre': meta['frame']['centre'],
           'R': meta['R'], 'band': meta['band'], 'onWater': True, 'drawn': False, 'level': meta['level'],
           'grid': {'n': G['n'], 'step': G['step'], 'x0': G['x0'], 'z0': G['z0'], 'h0': G['h0'], 's': G['s'],
                    'h': base64.b64encode(np.ascontiguousarray(g.astype('<i2')).tobytes()).decode('ascii')},
           'water': {'n': G['n'], 'step': G['step'], 'x0': G['x0'], 'z0': G['z0'], 'rle': WD._rle_encode(w)},
           'river': {k: meta['river'][k] for k in ('name', 'join', 'pts')}}
    if shore:
        rec['shore'] = meta['shore']['pts']
        rec['shoreSkip'] = meta['shore']['skip']
    return rec


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    if a[0] == '--list':
        for k, T in TOWNS.items():
            print('%-8s %s: %s, pin px %s, R %d m, band %d m' % (k, T['name'], T['page'], T['pin_px'], T['R'], T['band']))
        return
    if a[0] not in TOWNS:
        sys.exit('bake_towns: no town %r (%s)' % (a[0], ', '.join(TOWNS)))
    sys.exit(bake(a[0], check='--check' in a))


if __name__ == '__main__':
    main()
