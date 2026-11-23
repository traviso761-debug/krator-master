#!/usr/bin/env python3
"""Fit a lake town's closed-form ground to its region's (settlements/xanadu-lake/PLAN.md sections 3 and 7, step L0).

    python3 tools/fit_lake_town.py mouth            # fit Māuṭh: rewrite its row of settlements/xanadu-lake/targets/town/89zm-xl-fit.js
    python3 tools/fit_lake_town.py mouth --check    # fit again and compare with the row (exit 1 if stale)
    python3 tools/fit_lake_town.py --list           # the towns with a spec and whether each has a fit

A lake town's page draws its ground in closed form (89zp-xl-site.js xlH(key, x, z)); the open world takes that ground
inside the town's footprint (core/world/bake_towns.py) and eases back to its own across the band. So the page's ground has
to be the region's at the band, and its shore the region's at the water. This tool reads the region's land in node, as
core/world/bake_sites.py --resources does (the rasters, the world's fields and the coast, core/world 41 and 44c, the
region's landforms when its build takes them: WORLD.Hbare, the land without roads or towns), and fits:

  bearing    the direction from the town to open water (degrees, 0 north, 90 east): the fall of a plane fitted to the land
             within 1.2 km of the town's pin
  landing    where the land crosses the lake's level going from the pin along the bearing: the page's origin
  shore      the page's waterline: z of the level's first crossing (marching lakeward) every 50 m along the page's x,
             smoothed (a Gaussian of 120 m, or the spec's world.smooth) along the town's own waterfront so the quay and the
             landing stand on a clean line, a broad line (160 m) beyond it, eased over 150 m: the line depth is measured from.
             Beyond the waterfront the page applies the region's rest in full along the shore, so its waterline is the region's
  prof       the profile across the shore: the median over the town's width of the land's height over the level at each
             inland distance d (knots), made to rise inland and fall lakeward
  res        the rest: the region's height less the profile at every node of a 40 m grid in the page's (x, z), which the page
             adds back outside the
             town's core (89zp's fade) so its ground meets the world's at the band
  coast      the core/coast class at the landing (WORLD.coast.at: the region's own)
  check      the region's raw shore (every 50 m within the footprint) and the land on the footprint's edge and the band's
             outer edge (every 5 degrees): the node test holds the page to them (tests/test-xl-site.js)

The town's spec (89zl-xl-specs.js, XL.SPECS[key].world) names its region, site, footprint R and band; its px is the tune's
(XAN_TUNE.lake, core/region/data/xan-tune.js, read in place). Deterministic: the same region data gives the same row."""
import json, math, os, re, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORLD = os.path.join(ROOT, 'core', 'world')
sys.path.insert(0, WORLD)
import bake_sites as BS   # noqa: E402  (the region's land in node: JS, LANDFORMS_JS, node())
import world_data as WD   # noqa: E402

LAKE = os.path.join(ROOT, 'settlements', 'xanadu-lake')
FIT = os.path.join(LAKE, 'targets', 'town', '89zm-xl-fit.js')
SPECS = os.path.join(LAKE, 'targets', 'town', '89zl-xl-specs.js')
TUNE = os.path.join(ROOT, 'core', 'region', 'data', 'xan-tune.js')

# the page's sampling grid (page metres: x along the shore, z toward the lake, from the landing)
GX, GZ0, GZ1, GS = 2800, -3400, 2600, 25
RES_STEP, RES_D0, RES_D1 = 40, -2400, 3000
BROAD = 160    # the smoothing of the depth's line beyond the town's waterfront (m)
MINWAVE = 0    # the land as the world draws it (WORLD.Hbare's minWave 0: a broader form drops the coast's own shaping)   # lakeward to the band's far edge (R + band from a pin up to 400 m inland)
KNOTS = [-1200, -800, -500, -300, -180, -100, -50, -20, 0, 20, 50, 100, 160, 240, 330, 430, 550, 700, 860, 1050, 1300, 1600, 2000, 2500, 3000]
SMOOTH = 120.0


def specs():
    """XL.SPECS and the tune's lake rows, run in node (the fragments read in place)"""
    js = ('var window=globalThis;var XAN_TUNE=require(%s);\n' % json.dumps(TUNE) + open(SPECS, encoding='utf-8').read() +
          '\nprocess.stdout.write(JSON.stringify({specs:XL.SPECS,lake:XAN_TUNE.lake}));\n')
    # from a file, not `node -e`: the specs outgrew Windows' command line (WinError 206) at the west round (step L4)
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, 'specs.js')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(js)
        r = subprocess.run([BS.node(), path], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit('fit_lake_town: the specs did not load:\n' + r.stderr[-3000:])
    return json.loads(r.stdout)


def land_script(region):
    """the region's land in node: core/world/bake_sites.py's resources_script without the resources"""
    base = os.path.join(ROOT, 'openworld', region)
    parts = ['"use strict";var window=globalThis;\n']
    for j in BS.JS[:BS.JS.index(('core', 'world', '44c-world-coast.js')) + 1]:
        if j is None:
            parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (tools/fit_lake_town.py)',
                                     'openworld/%s/data, decoded by core/world/world_data.py' % region))
            continue
        parts.append('\n// ---- %s\n' % '/'.join(j) + open(os.path.join(ROOT, *j), encoding='utf-8').read())
        if j[-1] == '41-world-fields.js' and BS.LANDFORMS_JS in open(os.path.join(base, 'build.py'), encoding='utf-8').read():
            parts.append('\n// ---- core/world/%s\n' % BS.LANDFORMS_JS + open(os.path.join(WORLD, BS.LANDFORMS_JS), encoding='utf-8').read())
    parts.append(WD.geology_fragment(os.path.join(base, 'data')))
    return ''.join(parts)


SAMPLE = r'''
WORLD.init(WORLD_R);
const A=__ARGS,S=WORLD_DATA.meta.sites||[],site=S.find(s=>s.id===A.site);
const pin=site?[site.x,site.z]:WORLD.fromPx(A.px[0],A.px[1]);
const lv=WORLD.lakeWater(pin[0],pin[1]+3000)>-1e8?WORLD.lakeWater(pin[0],pin[1]+3000):A.level;
const H=(x,z)=>WORLD.Hbare(x,z);
/* the bearing: a plane fitted to the land (above the level) within 1.2 km of the pin; the water lies down its fall */
let sx=0,sz=0,sh=0,sxx=0,szz=0,sxz=0,sxh=0,szh=0,n=0;
for(let dz=-1200;dz<=1200;dz+=50)for(let dx=-1200;dx<=1200;dx+=50){if(dx*dx+dz*dz>1440000)continue;const h=H(pin[0]+dx,pin[1]+dz);if(h<lv)continue;
 n++;sx+=dx;sz+=dz;sh+=h;sxx+=dx*dx;szz+=dz*dz;sxz+=dx*dz;sxh+=dx*h;szh+=dz*h;}
const mx=sx/n,mz=sz/n,mh=sh/n,cxx=sxx/n-mx*mx,czz=szz/n-mz*mz,cxz=sxz/n-mx*mz,cxh=sxh/n-mx*mh,czh=szh/n-mz*mh,det=cxx*czz-cxz*cxz;
const gx=(cxh*czz-czh*cxz)/det,gz=(czh*cxx-cxh*cxz)/det;          /* dh/dx (east), dh/dz (south) */
let brg=Math.atan2(-gx,gz)*180/Math.PI;brg=Math.round(((brg%360)+360)%360*10)/10;   /* the fall: x east, -z north */
const b=brg*Math.PI/180,ez=[Math.sin(b),-Math.cos(b)],ex=[-Math.cos(b),-Math.sin(b)];
/* the landing: the level's crossing from the pin along the bearing (0.5 m steps) */
let t=0,prev=H(pin[0],pin[1])-lv;if(prev<0)t=-1;
if(t===0){for(let q=1;q<20000;q++){const s=q*.5,h=H(pin[0]+ez[0]*s,pin[1]+ez[1]*s)-lv;if(h<0){t=s-.5+.5*prev/(prev-h);break;}prev=h;}}
const L=[pin[0]+ez[0]*t,pin[1]+ez[1]*t];
/* the grid in page metres from the landing */
const nx=Math.round(2*A.GX/A.GS)+1,nz=Math.round((A.GZ1-A.GZ0)/A.GS)+1,G=new Array(nx*nz),G2=new Array(nx*nz);
/* G the land in full (for the shore), G2 without its detail finer than A.MW m (WORLD.Hbare's minWave: the profile, the rest, the band) */
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-A.GX+i*A.GS,z=A.GZ0+j*A.GS,wx=L[0]+ex[0]*x+ez[0]*z,wz=L[1]+ex[1]*x+ez[1]*z;
 G[j*nx+i]=+(H(wx,wz)-lv).toFixed(3);G2[j*nx+i]=+(WORLD.Hbare(wx,wz,A.MW)-lv).toFixed(3);}
let coast=null;try{const c=WORLD.coast&&WORLD.coast.at?WORLD.coast.at(L[0]+ez[0]*20,L[1]+ez[1]*20):null;if(c&&c.cls){let best=null,bw=-1;for(const k in c.cls)if(c.cls[k]>bw){bw=c.cls[k];best=k;}coast=best;}}catch(e){}
process.stdout.write(JSON.stringify({pin,level:lv,bearing:brg,landing:L,run:t,nx,nz,G,G2,coast}));
'''


def sample(region, args):
    js = land_script(region) + 'var __ARGS=%s;\n' % json.dumps(args) + SAMPLE
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(js)
        tmp = f.name
    try:
        r = subprocess.run([BS.node(), '--stack-size=8000', '--max-old-space-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('fit_lake_town: node failed:\n' + r.stderr[-4000:])
    return json.loads(r.stdout)


def r1(v, k=1):
    return float(round(float(v), k))


def fit(key):
    D = specs()
    sp = D['specs'].get(key)
    if not sp:
        sys.exit('fit_lake_town: no spec %r in 89zl-xl-specs.js (%s)' % (key, ', '.join(D['specs'])))
    tune = next((L for L in D['lake'] if L['key'] == key), None)
    if not tune:
        sys.exit('fit_lake_town: %r is not a XAN_TUNE.lake key' % key)
    W = sp['world']
    S = sample(W['region'], {'site': W['site'], 'px': [tune['px'], tune['py']], 'level': -520, 'GX': GX, 'GZ0': GZ0, 'GZ1': GZ1, 'GS': GS, 'MW': MINWAVE})
    nx, nz = S['nx'], S['nz']
    G = np.array(S['G'], dtype=np.float64).reshape(nz, nx)
    G2 = np.array(S['G2'], dtype=np.float64).reshape(nz, nx)
    xs = -GX + np.arange(nx) * GS
    zs = GZ0 + np.arange(nz) * GS

    def at(x, z, Gr=None):   # bilinear on the grid (page metres), clamped; Gr the full land (G) or its broad form (G2, the default)
        Gr = G2 if Gr is None else Gr
        u = np.clip((np.asarray(x, float) + GX) / GS, 0, nx - 1.0001)
        v = np.clip((np.asarray(z, float) - GZ0) / GS, 0, nz - 1.0001)
        i, j = u.astype(int), v.astype(int)
        fu, fv = u - i, v - j
        return (Gr[j, i] * (1 - fu) + Gr[j, i + 1] * fu) * (1 - fv) + (Gr[j + 1, i] * (1 - fu) + Gr[j + 1, i + 1] * fu) * fv

    # ---- the region's hollows: ground under the level not joined (4-connected) to the lake at the grid's lakeward edge is
    # filled to 0.3 m over it (the page and the world keep the land dry above the level; the world floods only from the lake)
    from scipy import ndimage
    lab, _ = ndimage.label(G < 0)
    lake = set(np.unique(lab[-1, :])) - {0}
    hollow = (lab > 0) & ~np.isin(lab, list(lake))
    G[hollow] = 0.3
    G2[hollow] = np.maximum(G2[hollow], 0.3)
    # ---- the raw shore: every grid column, the first crossing of the level marching inland from the lake (a slot or a
    # hollow behind the shore is not the shore)
    raw = np.full(nx, np.nan)
    j0 = int(round((-1500 - GZ0) / GS))
    for i in range(nx):
        col = G[:, i]
        for j in range(nz - 1, max(j0, 1) - 1, -1):
            if col[j - 1] >= 0 and col[j] < 0:
                raw[i] = zs[j - 1] + GS * col[j - 1] / (col[j - 1] - col[j])
                break
    ok = ~np.isnan(raw)
    if ok.sum() < nx * .5:
        sys.exit('fit_lake_town: the level is crossed in only %d of %d columns' % (ok.sum(), nx))
    raw_f = np.interp(xs, xs[ok], raw[ok])
    # the page's shore every 50 m, a Gaussian of SMOOTH m over the raw line
    sx = np.arange(-GX, GX + 1, 50.0)
    sm = W.get('smooth') or SMOOTH                # a town's own (a jagged shore wants a tighter line: XL.SPECS[key].world.smooth)
    w = np.exp(-((sx[:, None] - xs[None, :]) / sm) ** 2)
    smooth = (w * raw_f[None, :]).sum(1) / w.sum(1)
    # the smoothed line only along the town's own waterfront (the layout's half-width, or out to its stream, and 120 m
    # more), eased into the region's raw line over 150 m beyond: elsewhere the page's shore is the region's
    Lay = sp['layout']
    e0, e1 = -Lay['half'] - 120, max(Lay['half'], (Lay['stream'] or {}).get('x', -1e9) + 60) + 120
    t = np.clip(np.minimum((sx - (e0 - 150)) / 150, ((e1 + 150) - sx) / 150), 0, 1)
    t = t * t * (3 - 2 * t)
    wb = np.exp(-((sx[:, None] - xs[None, :]) / BROAD) ** 2)
    broad = (wb * raw_f[None, :]).sum(1) / wb.sum(1)   # beyond the waterfront a broad line: depth is measured from a smooth line
    shore = broad + t * (smooth - broad)              # (no kinks to shear the rest's grid); the page applies the rest in full along
                                                      # the shore beyond the waterfront (89zp), so the waterline there is the region's
    shoreAt = lambda x: np.interp(x, sx, shore)
    # ---- the profile: the median over the town's width (|x| <= 1.5 km) of the land over the level at each knot
    R, band = W['R'], W['band']
    xw = np.arange(-1500, 1501, 25.0)
    prof = []
    for d in KNOTS:
        vals = at(xw, shoreAt(xw) - d)
        prof.append(float(np.median(vals)))
    prof = np.array(prof)
    k0 = KNOTS.index(0)
    prof[k0] = 0.0
    for k in range(k0 + 1, len(KNOTS)):           # rising inland: never under the knot before it (a little over the level at the shore)
        prof[k] = max(prof[k], prof[k - 1] + .05 * (KNOTS[k] - KNOTS[k - 1]) / 100, .4 if k == k0 + 1 else 0)
    for k in range(k0 - 1, -1, -1):               # falling lakeward
        prof[k] = min(prof[k], prof[k + 1] - .05 * (KNOTS[k + 1] - KNOTS[k]) / 100, -.4 if k == k0 - 1 else 0)
    K = np.array(KNOTS, float)
    def pf(d):   # the page's xlProf (89zp): the knots, the end knots' grade carried on beyond them (never held flat)
        d = np.asarray(d, float)
        y = np.interp(d, K, prof)
        lo, hi = (prof[1] - prof[0]) / (K[1] - K[0]), (prof[-1] - prof[-2]) / (K[-1] - K[-2])
        return np.where(d < K[0], prof[0] + lo * (d - K[0]), np.where(d > K[-1], prof[-1] + hi * (d - K[-1]), y))
    # ---- the rest, every RES_STEP m in the page's own (x, z): the region's height less the profile at its depth there (laid in
    # (x, z), not in (x, d), so a bend in the shore shears nothing)
    rx = np.arange(-GX, GX + 1, RES_STEP)
    rz = np.arange(GZ0, GZ1 + 1, RES_STEP)
    res = np.zeros((len(rz), len(rx)))
    for a, z in enumerate(rz):
        res[a] = at(rx, np.full(len(rx), float(z))) - pf(shoreAt(rx) - z)
    # ---- the check's samples: the raw shore within the footprint (page frame) and the land round the band
    P = S['pin']
    L = S['landing']
    b = math.radians(S['bearing'])
    ez, ex = (math.sin(b), -math.cos(b)), (-math.cos(b), -math.sin(b))
    centre = [(P[0] - L[0]) * ex[0] + (P[1] - L[1]) * ex[1], (P[0] - L[0]) * ez[0] + (P[1] - L[1]) * ez[1]]
    chk_shore = []
    for x in np.arange(-GX, GX + 1, 50.0):
        z = float(np.interp(x, xs, raw_f))
        if math.hypot(x - centre[0], z - centre[1]) <= R and ok[int(round((x + GX) / GS))]:
            chk_shore.append([r1(x, 0), r1(z)])
    rings = []
    for rr in (R, R + band):
        for a in range(0, 360, 5):
            x, z = centre[0] + rr * math.cos(math.radians(a)), centre[1] + rr * math.sin(math.radians(a))
            if abs(x) < GX and GZ0 < z < GZ1:
                rings.append([r1(x), r1(z), r1(at(x, z), 2)])
    rot = math.pi - b
    row = {'region': W['region'], 'site': W['site'], 'px': [tune['px'], tune['py']], 'pin': [r1(P[0]), r1(P[1])],
           'level': r1(S['level'], 2), 'bearing': S['bearing'], 'rot': float(round(rot, 6)), 'landing': [r1(L[0]), r1(L[1])],
           'centre': [r1(centre[0]), r1(centre[1])], 'coast': S['coast'],
           'shore': {'x0': -GX, 'step': 50, 'z': [r1(v) for v in shore]},
           'prof': {'d': KNOTS, 'y': [r1(v, 2) for v in prof]},
           'res': {'x0': int(rx[0]), 'z0': int(rz[0]), 'step': RES_STEP, 'nx': len(rx), 'nz': len(rz), 'v': [int(round(v * 10)) for v in res.ravel()]},
           'check': {'shore': chk_shore, 'ring': rings}}
    # how the fit stands: the smoothed shore against the raw within the footprint, the profile's own error at the band
    inR = [p for p in chk_shore]
    sd = max((abs(float(shoreAt(p[0])) - p[1]) for p in inR), default=0)
    stats = {'shore_max_m': round(sd, 1), 'bearing': S['bearing'], 'landing_from_pin_m': round(S['run'], 1), 'coast': S['coast'],
             'res_max_m': round(float(np.abs(res).max()), 1), 'smooth_m': sm}
    return row, stats


def read_rows():
    if not os.path.isfile(FIT):
        return {}
    rows = {}
    for m in re.finditer(r"^XL\.FIT\['([a-z-]+)'\]=(.*);$", open(FIT, encoding='utf-8').read(), re.M):
        rows[m.group(1)] = m.group(2)
    return rows


HEAD = '''// ================================================================= THE LAKE TOWNS — each town's ground fitted to its region's
// [G data] GENERATED by tools/fit_lake_town.py <key> (one row a town; never edit by hand: fit again). The region's land
// (core/world: WORLD.Hbare, the rasters, the coast) read round the town's pin and fitted to the closed form 89zp draws:
// the bearing to open water, the landing (the page's origin), the shore every 50 m, the profile across it, and the rest
// every 40 m in (x, d) that the page adds back outside the town's core; `check` holds the region's own shore and the
// land round the footprint for tests/test-xl-site.js. The frame: page x along the shore, z toward the lake; world = the
// landing + Ry(rot) (x, z); `centre` is the page point on the town's pin (the site's px).
XL.FIT=XL.FIT||{};   /* XL is 89zl's (the specs load first) */
'''


def write(rows):
    body = HEAD + ''.join("XL.FIT['%s']=%s;\n" % (k, rows[k]) for k in sorted(rows))
    with open(FIT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(body)


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    if a[0] == '--list':
        rows = read_rows()
        for k in sorted(specs()['specs']):
            print('%-12s %s' % (k, 'fitted' if k in rows else 'no fit'))
        return
    key = a[0]
    row, stats = fit(key)
    txt = json.dumps(row, separators=(',', ':'), ensure_ascii=False)
    rows = read_rows()
    if '--check' in a:
        same = rows.get(key) == txt
        print(('fresh' if same else 'STALE') + ': %s (%s)' % (key, json.dumps(stats)))
        sys.exit(0 if same else 1)
    rows[key] = txt
    write(rows)
    print('fitted %s: %s -> %s' % (key, json.dumps(stats), os.path.relpath(FIT, ROOT).replace(os.sep, '/')))


if __name__ == '__main__':
    main()
