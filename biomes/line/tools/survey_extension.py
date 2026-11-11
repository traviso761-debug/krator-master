"""Survey the Rift line beyond Ledge on scale model 5.1: the Rift's stations to Cube (Loj Nahn), and on to Theodiga,
Strongbow and Stair, toward an arcology still to be placed in the Bowl (biomes/line/PLAN.md section 2.2; the owner,
2026-11-11).

    python3 biomes/line/tools/survey_extension.py [--json out.json]

Straight legs between the stations, as openworld/ANCIENT-TUNNELS.md section 1 takes the bore (a first look, not a route:
tools/scale-model/ancient_roads.py routes for real). Each leg is graded straight between its ends' surfaces; where the
ground stands more than CUT_M over that grade it is tunnel, more than FILL_M under it viaduct, else at grade. Per leg:
length, the surface's range, the rock provinces crossed, the rain, the biome polygons' polities not read (the model's
regions live in the artifact's database). Reads tools/scale-model/model/data and kits/resources/data/geology.json only.
"""
import base64, json, math, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page  # noqa: E402

PX_KM = 2.0
CUT_M, FILL_M = 60.0, 30.0       # ANCIENT-ROADS.md section 2: a cutting up to ~60 m, a viaduct where the ground falls ~30 m under the grade
# the stations in order (5.1 px), numbered north to south as LORE has it (the owner, 2026-11-11: Cube is Loj Nahn, 9)
STOPS = [('4 Ledge (the lifts\' foot: the lake shore)', 437, 1330), ('5 Nulab', 443, 1359), ('6 Chimes', 468, 1392),
         ('7 Cthonos', 526, 1503), ('8 The Tubes', 608, 1547), ('9 Cube (Loj Nahn)', 720, 1567),
         ('10 Theodiga', 908, 1535), ('11 Strongbow', 1026, 1594), ('12 Stair', 1106, 1442)]


def unrle(s, n):
    b = base64.b64decode(s); out = np.empty(n, np.uint8); k = 0
    for i in range(0, len(b), 2):
        r = b[i] + 1; out[k:k + r] = b[i + 1]; k += r
    return out


def main():
    D = smodel.page.load()
    lo, hi = D['lo'], D['hi']
    h = smodel.page.raster(D, 'h')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535 * (hi - lo)
    OW, OH = D['fullW'], D['fullH']
    P = smodel.page.raster(D, 'p')[..., 0].astype(float) / 255 * 4000
    wl = smodel.page.raster(D, 'wl')
    WET = wl[..., 2] > 127
    G = json.load(open(os.path.join(ROOT, 'kits', 'resources', 'data', 'geology.json'), encoding='utf-8'))
    gw, gh = G['grid']['w'], G['grid']['h']
    prov = unrle(G['layers']['province'], gw * gh).reshape(gh, gw) & 127

    def samp(arr, x, y):
        Hh, Ww = arr.shape[:2]
        u = x * (Ww - 1) / (OW - 1); v = y * (Hh - 1) / (OH - 1)
        i0, j0 = int(math.floor(u)), int(math.floor(v)); fu, fv = u - i0, v - j0
        i1, j1 = min(i0 + 1, Ww - 1), min(j0 + 1, Hh - 1)
        return float(arr[j0, i0] * (1 - fu) * (1 - fv) + arr[j0, i1] * fu * (1 - fv) + arr[j1, i0] * (1 - fu) * fv + arr[j1, i1] * fu * fv)

    def near(arr, x, y):
        Hh, Ww = arr.shape[:2]
        return arr[min(Hh - 1, int(round(y * (Hh - 1) / (OH - 1)))), min(Ww - 1, int(round(x * (Ww - 1) / (OW - 1))))]

    legs = []
    for (na, xa, ya), (nb, xb, yb) in zip(STOPS, STOPS[1:]):
        L = math.hypot(xb - xa, yb - ya) * PX_KM
        n = max(2, int(L) + 1)
        pts = [(xa + (xb - xa) * k / (n - 1), ya + (yb - ya) * k / (n - 1)) for k in range(n)]
        s = [samp(E, x, y) for x, y in pts]
        ea, eb = s[0], s[-1]
        grade = [ea + (eb - ea) * k / (n - 1) for k in range(n)]
        tun = sum(1 for k in range(n) if s[k] - grade[k] > CUT_M)
        via = sum(1 for k in range(n) if grade[k] - s[k] > FILL_M)
        wet = sum(1 for x, y in pts if near(WET, x, y))
        pr = {}
        for x, y in pts:
            p = G['provinces'][int(near(prov, x, y))]; pr[p] = pr.get(p, 0) + 1
        legs.append({'from': na, 'to': nb, 'km': round(L), 'ends_m': [round(ea), round(eb)], 'grade_pct': round((eb - ea) / (L * 10), 2),
                     'surface_m': [round(min(s)), round(max(s))], 'tunnel_km': tun, 'viaduct_km': via, 'water_km': wet,
                     'rain_mm': round(sum(samp(P, x, y) for x, y in pts) / n),
                     'rock_km': dict(sorted(pr.items(), key=lambda kv: -kv[1]))})
    out = {'legs': legs, 'total_km': sum(l['km'] for l in legs), 'tunnel_km': sum(l['tunnel_km'] for l in legs)}
    if '--json' in sys.argv:
        json.dump(out, open(sys.argv[sys.argv.index('--json') + 1], 'w', encoding='utf-8', newline='\n'), indent=1)
    print(json.dumps(out, indent=1))


if __name__ == '__main__':
    main()
