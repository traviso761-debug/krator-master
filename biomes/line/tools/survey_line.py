"""Survey the Rift line on scale model 5.1 (biomes/line/PLAN.md section 1).

    python3 biomes/line/tools/survey_line.py [--json out.json]

Reads (never edits) the model's build data (tools/scale-model/model/data: heights `h`, rain `p`, mean temperature `tm`) and
the geology bake (kits/resources/data/geology.json: the province per 4 km cell, the settlements). The line is the straight
bore of openworld/ANCIENT-TUNNELS.md section 1: Dalab (464,1112) to Ledge (437,1330), bored between the points where the
surface first and last reaches the portal height; the floor is graded straight between the two portals.

Per kilometre of bore it prints the surface, the cover, the rock province, the rain over it, the virgin rock temperature
(the surface's mean temperature + GRAD degC a km of cover) and the nearest named site; then the cover bands, the rock runs,
the hot stretch, and the cover minima (where an adit or a station's shaft is cheapest). Deterministic: no randomness.
"""
import base64, io, json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page  # noqa: E402

GRAD = 25.0          # degC per km of cover (ANCIENT-TUNNELS.md: an ordinary 20-30)
A, B = (464.0, 1112.0), (437.0, 1330.0)
PX_KM = 2.0          # 5.1: 2 km a map pixel


def unrle(s, n):
    b = base64.b64decode(s); out = np.empty(n, np.uint8); k = 0
    for i in range(0, len(b), 2):
        r = b[i] + 1; out[k:k + r] = b[i + 1]; k += r
    assert k == n
    return out


def main():
    D = smodel.page.load()
    lo, hi = D['lo'], D['hi']
    h = smodel.page.raster(D, 'h')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
    VH, VW = E.shape
    OW, OH = D['fullW'], D['fullH']
    P = smodel.page.raster(D, 'p')[..., 0].astype(float) / 255 * 4000
    TM = smodel.page.raster(D, 'tm')[..., 0].astype(float) - 90
    G = json.load(open(os.path.join(ROOT, 'kits', 'resources', 'data', 'geology.json'), encoding='utf-8'))
    gw, gh = G['grid']['w'], G['grid']['h']
    prov = unrle(G['layers']['province'], gw * gh).reshape(gh, gw) & 127
    names = G['provinces']
    sites = G['settlements']

    def samp(arr, x, y):
        """bilinear on a grid that spans the full map"""
        Hh, Ww = arr.shape[:2]
        u = x * (Ww - 1) / (OW - 1); v = y * (Hh - 1) / (OH - 1)
        i0, j0 = int(math.floor(u)), int(math.floor(v)); fu, fv = u - i0, v - j0
        i1, j1 = min(i0 + 1, Ww - 1), min(j0 + 1, Hh - 1)
        return (arr[j0, i0] * (1 - fu) * (1 - fv) + arr[j0, i1] * fu * (1 - fv) + arr[j1, i0] * (1 - fu) * fv + arr[j1, i1] * fu * fv)

    def near(arr, x, y):
        Hh, Ww = arr.shape[:2]
        return arr[min(Hh - 1, int(round(y * (Hh - 1) / (OH - 1)))), min(Ww - 1, int(round(x * (Ww - 1) / (OW - 1))))]

    L = math.hypot(B[0] - A[0], B[1] - A[1]) * PX_KM
    n = int(L) + 1
    rows = []
    for k in range(n):
        t = k / L
        x, y = A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t
        rows.append({'km': k, 'px': [round(x, 2), round(y, 2)], 'surf': float(samp(E, x, y)), 'rain': float(samp(P, x, y)),
                     'tm': float(samp(TM, x, y)), 'prov': names[int(near(prov, x, y))]})
    # the portals: the first and last points (from each end) where the surface reaches the portal height, the portals' heights
    # those of ANCIENT-TUNNELS.md (3,614 m north, 3,501 m south): found as the first km over each from its end
    PN, PS = 3614.0, 3501.0
    kn = next(r['km'] for r in rows if r['surf'] >= PN)
    ks = next(r['km'] for r in reversed(rows) if r['surf'] >= PS)
    for r in rows:
        f = min(1.0, max(0.0, (r['km'] - kn) / max(1, ks - kn)))
        r['floor'] = PN + (PS - PN) * f
        r['bored'] = kn <= r['km'] <= ks
        r['cover'] = r['surf'] - r['floor'] if r['bored'] else 0.0
        r['rockT'] = r['tm'] + GRAD * max(0.0, r['cover']) / 1000.0
        best = min(sites, key=lambda s: math.hypot(s['px'] - r['px'][0], s['py'] - r['px'][1]))
        r['site'] = best['name']; r['site_km'] = round(math.hypot(best['px'] - r['px'][0], best['py'] - r['px'][1]) * PX_KM, 1)
    bored = [r for r in rows if r['bored']]
    out = {'line_km': round(L, 1), 'portal_n': {'km': kn, 'px': rows[kn]['px'], 'y': PN},
           'portal_s': {'km': ks, 'px': rows[ks]['px'], 'y': PS}, 'bored_km': ks - kn}
    out['cover_over'] = {str(c): sum(1 for r in bored if r['cover'] > c * 1000) for c in (1, 2, 3, 4, 5, 6)}
    mx = max(bored, key=lambda r: r['cover']); out['max_cover'] = {'km': mx['km'] - kn, 'cover': round(mx['cover']), 'surf': round(mx['surf'])}
    # runs of one province along the bore
    runs, cur = [], None
    for r in bored:
        if cur and cur['prov'] == r['prov']:
            cur['to'] = r['km'] - kn
        else:
            cur = {'prov': r['prov'], 'from': r['km'] - kn, 'to': r['km'] - kn}; runs.append(cur)
    out['rock_runs'] = runs
    out['rock_km'] = {}
    for r in bored:
        out['rock_km'][r['prov']] = out['rock_km'].get(r['prov'], 0) + 1
    # the hot stretch: virgin rock over 60 degC (no crew works it unsuited: the cooled section) and over 100 degC
    for lim in (60, 80, 100):
        hot = [r['km'] - kn for r in bored if r['rockT'] > lim]
        out['hot_over_%d' % lim] = [hot[0], hot[-1], len(hot)] if hot else None
    # the cover minima: local lows of cover over a 20 km window (adits, shafts: where the stations' shafts are cheapest)
    mins = []
    for i, r in enumerate(bored):
        w = bored[max(0, i - 10):i + 11]
        if r['cover'] == min(q['cover'] for q in w) and 0 < i < len(bored) - 1:
            mins.append({'km': r['km'] - kn, 'cover': round(r['cover']), 'px': r['px'], 'prov': r['prov'], 'rain': round(r['rain']), 'rockT': round(r['rockT'])})
    out['cover_minima'] = mins
    out['sites_near'] = sorted({(r['site'], min(q['site_km'] for q in rows if q['site'] == r['site'])) for r in rows}, key=lambda s: s[1])
    # every 10 km of bore, for the plan's table
    out['every10'] = [{'km': r['km'] - kn, 'px': r['px'], 'surf': round(r['surf']), 'cover': round(r['cover']), 'prov': r['prov'],
                       'rain': round(r['rain']), 'rockT': round(r['rockT']), 'site': '%s %.0f km' % (r['site'], r['site_km'])}
                      for r in bored if (r['km'] - kn) % 10 == 0]
    if '--json' in sys.argv:
        json.dump({'summary': out, 'rows': rows}, open(sys.argv[sys.argv.index('--json') + 1], 'w', encoding='utf-8', newline='\n'), indent=1)
    print(json.dumps(out, indent=1))


if __name__ == '__main__':
    main()
