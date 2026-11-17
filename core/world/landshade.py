#!/usr/bin/env python3
"""The land a page draws (WORLD.Hbare: the model's heights, the detail, the channels; no roads or towns), sampled in node
over a box and drawn as a hillshade, with its terrace-band metric (core/world/PLAN-RELIEF.md, P0).

    python3 core/world/landshade.py <region> <out.png> --box x0 z0 x1 z1 [--step 10] [--exag 2] [--core <dir>]
    python3 core/world/landshade.py <region> <out.png> --at <name> ...     # one of SPOTS below
    python3 core/world/landshade.py <region> <out.png> --bench             # time WORLD.H (us a call) as well

<region> is openworld/<name> (or its data dir). --core reads 40-world-smooth.js, 41-world-fields.js, 43-world-relief.js and 44-world-streams.js from
another folder (a copy of an older core/world: the "before" of a change), else from core/world. Two regions or cores side by
side: run it twice and join the images (--diff a.png b.png out.png).

The band metric: over the sloped samples (> 3 %), for every step s from 20 to 100 m, the histogram of height mod s in 20 bins;
its contrast is max / min, read only where the sloped ground spans five steps or more. A land terraced every s metres on its absolute height reads 2 or more at s; a land without
contour-line terraces reads under about 1.3 at every s. Printed as the worst step and its contrast.
The rings metric (the one P1 is judged by): per 500 m tile of ground sloping over 2 %, how much the fine detail (under 30 m)
lines up with the contours: the weighted mean of cos^2 between its gradient and the 500 m slope's. Detail with no direction
reads about 0.5; terraces on the height read toward 1. Printed as the share of tiles over 0.65: the ringed tiles.
"""
import json, os, subprocess, sys, tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_data as WD   # noqa: E402
import hillshade as HS    # noqa: E402

# P0's test spots (region, box in metres): the savannah rim's benches, the jungle, the High Rift, the Oidong floor
SPOTS = {
    'pinnacle-rim': ('pinnacle', (10000, -22000, 14000, -18000)),
    'pinnacle-jungle': ('pinnacle', (-21000, 6000, -17000, 10000)),
    'oidong-highrift': ('oidong-highrift', (160000, -40000, 164000, -36000)),
    'oidong-floor': ('oidong-highrift', (-157000, -30000, -153000, -26000)),
}


def node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    sys.exit('landshade: node not found (set NODE)')


def sample(region, box, step, core=None, bench=False):
    """(heights [nz, nx] float64, us per WORLD.H call or None)"""
    data = region if os.path.isfile(os.path.join(region, 'region.json')) else os.path.join(region, 'data')
    core = core or HERE
    parts = ['"use strict";var window=globalThis;\n']
    for p in (os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js')):
        parts.append(open(p, encoding='utf-8').read())
    for f in ('40-world-smooth.js', '43-world-relief.js', '43m-world-micro.js', '44-world-streams.js'):
        p = os.path.join(core, f)
        if os.path.isfile(p):
            parts.append(open(p, encoding='utf-8').read())
    parts.append(WD.fragment(data, 'var WORLD_KITS=[];\n', 'landshade', data))
    reg = os.path.basename(os.path.dirname(os.path.abspath(data))) if os.path.basename(data) == 'data' else ''
    for k in (WD.land_js(reg) if os.path.isfile(os.path.join(core, '43b-world-landforms.js')) else []):   # the landform records and the region's pins (an older core has none)
        f = os.path.join(core, k[-1]) if k[:2] == ('core', 'world') else os.path.join(ROOT, *k)
        if os.path.isfile(f):
            parts.append(open(f, encoding='utf-8').read())
    parts.append(open(os.path.join(core, '41-world-fields.js'), encoding='utf-8').read())
    x0, z0, x1, z1 = box
    nx, nz = int((x1 - x0) / step) + 1, int((z1 - z0) / step) + 1
    tmp = tempfile.mkdtemp()
    out = os.path.join(tmp, 'h.f64')
    parts.append('''
WORLD.init(WORLD_R);const nx=%d,nz=%d,A=new Float64Array(nx*nz);let t=Date.now();
for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)A[j*nx+i]=WORLD.Hbare(%r+i*%r,%r+j*%r,0);
const us=%s?(Date.now()-t)*1000/(nx*nz):null;
const B=WORLD.biomeAt(%r,%r);require("fs").writeFileSync(%s,Buffer.from(A.buffer));console.log(JSON.stringify({us,biome:B&&B.name,terr:WORLD.style(%r,%r).terr}));
''' % (nx, nz, float(x0), float(step), float(z0), float(step), 'true' if bench else 'false', (x0 + x1) / 2, (z0 + z1) / 2, json.dumps(out), (x0 + x1) / 2, (z0 + z1) / 2))
    js = os.path.join(tmp, 'w.js')
    open(js, 'w', encoding='utf-8').write(''.join(parts))
    r = subprocess.run([node(), '--max-old-space-size=8192', js], capture_output=True, text=True)
    if r.returncode:
        sys.exit('landshade: node failed\n' + r.stderr[-3000:])
    info = json.loads(r.stdout.strip().splitlines()[-1])
    return np.fromfile(out).reshape(nz, nx), info['us'], info


def bands(E, step_m):
    """(worst step, its contrast) of the height-mod-step histogram over the sloped samples"""
    gz, gx = np.gradient(E, step_m, step_m)
    m = np.hypot(gx, gz) > 0.03
    h = E[m]
    if h.size < 200:
        return None, 1.0
    worst = (None, 1.0)
    span = np.percentile(h, 95) - np.percentile(h, 5)
    for s in range(20, 101, 5):
        if span < 5 * s:   # too few periods of s in this ground's span to read a band
            continue
        hist, _ = np.histogram(np.mod(h, s) / s, bins=20, range=(0, 1))
        c = hist.max() / max(hist.min(), 1)
        if c > worst[1]:
            worst = (s, c)
    return worst


RING_T = 0.65   # a tile's alignment over this is ringed (noise with no direction reads about 0.5)


def rings(E, step_m, fine_m=30.0, broad_m=500.0, tile_m=500.0):
    """contour rings: how much the land's fine detail (E less a Gaussian of fine_m) lines up with the contours. For every
    sample on ground sloping over 2 % at the broad scale (a Gaussian of broad_m), cos^2 of the angle between the fine detail's
    gradient and the broad gradient, weighted by the fine gradient's square. Detail with no direction (noise, gullies of every
    heading) reads about 0.5; terraces on the height, whose risers all run along the contours, read toward 1.
    Judged per tile of tile_m (rings are local: one flank of a hill). Returns (the share of judged tiles that are ringed,
    how many tiles were judged)"""
    from scipy import ndimage
    Ef = E - ndimage.gaussian_filter(E, fine_m / step_m, mode='nearest')
    fz, fx = np.gradient(Ef, step_m, step_m)
    Eb = ndimage.gaussian_filter(E, broad_m / step_m, mode='nearest')
    bz, bx = np.gradient(Eb, step_m, step_m)
    b2 = bx * bx + bz * bz
    m = b2 > 0.02 ** 2
    k = int(1.5 * broad_m / step_m)
    m[:k, :] = m[-k:, :] = m[:, :k] = m[:, -k:] = False
    n = int(m.sum())
    if not n:
        return 0.0, 0
    W = fx * fx + fz * fz
    C = (fx * bx + fz * bz) ** 2 / np.maximum(W * b2, 1e-30)
    # per tile of tile_m: the weighted cos^2 over its judged samples; a tile is ringed over RING_T
    t = max(8, int(tile_m / step_m))
    ringed = tiles = 0
    for j in range(0, E.shape[0] - t + 1, t):
        for i in range(0, E.shape[1] - t + 1, t):
            mm = m[j:j + t, i:i + t]
            if mm.sum() < t * t // 3:
                continue
            w = W[j:j + t, i:i + t][mm]
            a = float((w * C[j:j + t, i:i + t][mm]).sum() / max(w.sum(), 1e-30))
            tiles += 1
            ringed += a > RING_T
    return (ringed / tiles if tiles else 0.0), tiles


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    if a[0] == '--diff':
        ims = [Image.open(p).convert('L') for p in a[1:3]]
        w = ims[0].width + ims[1].width + 8
        o = Image.new('L', (w, max(i.height for i in ims)), 255)
        o.paste(ims[0], (0, 0)); o.paste(ims[1], (ims[0].width + 8, 0)); o.save(a[3])
        print('joined', a[3]); return
    opt = lambda k, n: a[a.index(k) + 1:a.index(k) + 1 + n] if k in a else None
    region, out = a[0], a[1]
    box = opt('--box', 4)
    if opt('--at', 1):
        name = opt('--at', 1)[0]
        reg, box = SPOTS[name]
        if not os.path.isdir(region):
            region = os.path.join(ROOT, 'openworld', reg)
    box = [float(v) for v in box]
    step = float((opt('--step', 1) or [10])[0])
    exag = float((opt('--exag', 1) or [2])[0])
    core = (opt('--core', 1) or [None])[0]
    if not os.path.isdir(region):
        region = os.path.join(ROOT, 'openworld', region)
    E, us, info = sample(region, box, step, core, '--bench' in a)
    img = HS.shade(E, step, 315, exag)
    lo, hi = np.percentile(img, 1), np.percentile(img, 99)
    img = np.clip((img.astype(float) - lo) / max(hi - lo, 1) * 255, 0, 255).astype(np.uint8)
    Image.fromarray(img).save(out)
    s, c = bands(E, step)
    tr, tn = rings(E, step)
    print('landshade %s: %d x %d at %g m, %.0f..%.0f m, %s (terraces %.2f); ringed tiles %.0f %% of %d; bands worst at %s m: %.2f%s' % (
        out, E.shape[1], E.shape[0], step, E.min(), E.max(), info.get('biome'), info.get('terr') or 0, tr * 100, tn, s, c,
        '' if us is None else '; WORLD.H %.1f us a call' % us))


if __name__ == '__main__':
    main()
