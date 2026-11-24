#!/usr/bin/env python3
"""Bake the open world's ground round a site for a town's own page: the region's WORLD.H sampled on nested grids, so a
page that draws its own near ground (settlements/lightwall: the bench, the Glaziers' bands) stands on the same ground as
its region round it, without carrying the region's rasters, its coasts and its roads into the page.

    python3 core/world/bake_ground.py <region> --site <id> [--out FILE.json]     # print the stats, write the bake
    bake(region, site_id, levels)  -> {format, region, site, x0, z0, water, levels: [{x0, z0, cell, nx, nz, lo, step, h}], stats}

The ground is the region page's own: node runs the region's land chain in its build.py's order (core/rand, core/terrain's
relief, the rasters decoded by world_data.py with the baked plan's roads and the model's landforms as the page's
WORLD_DATA has them, core/mask, core/coast, core/world 41, its land fragments up to 45 (42 roads, 42b bridges, 44c coasts,
the region's own 43/44 hooks), the region's SITE_SPEC (44c's kept coasts read it), the geology the coasts' classes read),
then WORLD.init. Each level's heights are uint16 over its own [lo, lo + 65535 * step] in world metres (step 5 cm, or the
next 5 cm its span fits in). `stats` compares each quantized grid, bilinear, with WORLD.H at 400 points between its nodes
(the bake's own check); `water` is WORLD.water and WORLD.H at each point the caller names (`probes`, relative to the site).

A level is (half_x, north, south, cell[, minWave]) round the site: [x0 - half_x, x0 + half_x] by [z0 - north, z0 + south],
a node every `cell` m; minWave (m) is WORLD.H's own: the detail finer than it left out, as the region's far chunks ask
(a coarse level sampled with all the detail aliases it). Its check compares with WORLD.H at the same minWave.

    fragment(bake, name, var)  -> the page's [G data] fragment: var <var> = {x0, z0, water, key, levels, stats, H(x, z)},
                                  H in world metres at (x, z) metres from the site (the finest level that holds the point)"""
import base64, hashlib, io, json, os, re, subprocess, sys, tempfile

NL = chr(10)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_data as WD   # noqa: E402

LANDFORMS = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data', 'landforms.json')
HEAD = [('core', 'rand', '08-core-rand.js'), ('core', 'terrain', '38-core-relief.js'),
        ('core', 'mask', '25-core-mask.js'), ('core', 'mask', '27-core-mask-distance.js'), ('core', 'coast', '30-core-coast.js')]
SKIP = {'42k-world-caverns.js'}   # the tubes are records and a clear hook (88k): they do not move the ground


def node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return shutil.which(c) or c
    sys.exit('bake_ground: node not found (set NODE)')


def land_chain(region):
    """the region's land fragments from 41 to 45, in its build.py's order: [(label, path)]"""
    base = os.path.join(ROOT, 'openworld', region)
    txt = io.open(os.path.join(base, 'build.py'), encoding='utf-8').read()
    # from the region's first ground file (40-world-smooth.js where the relief is smoothed first, else 41) to its host; the
    # core/terrain files it lists between them by folder ('core/terrain', '37-core-stacks.js': the relief's stacks)
    a = min(txt.index(n) for n in ("'40-world-smooth.js'", "'41-world-fields.js'") if n in txt)
    b = txt.index("'45-world-host.js'")
    out = []
    for m in re.finditer(r"\('core/terrain',\s*'(3\d[a-z]?-core-[a-z0-9-]+\.js)'\)|'(4\d[a-z]?-world-[a-z0-9-]+\.js)'", txt[a:b]):
        if m.group(1):
            p = os.path.join(ROOT, 'core', 'terrain', m.group(1))
            if m.group(1) not in SKIP and os.path.isfile(p) and not any(o[1] == p for o in out):
                out.append(('core/terrain/' + m.group(1), p))
            continue
        f = m.group(2)
        if f in SKIP or any(o[0].endswith('/' + f) for o in out):
            continue
        for d in (os.path.join(base, 'src'), HERE):
            if os.path.isfile(os.path.join(d, f)):
                out.append((os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'), os.path.join(d, f)))
                break
        else:
            sys.exit('bake_ground: %s (listed in openworld/%s/build.py) not found' % (f, region))
    return out


def extras(region):
    """WORLD_DATA's keys beyond meta, as the region page's data fragment writes them: the baked plan, its roads, the
    model's landforms inside the cut (openworld/<region>/build.py data_fragment)"""
    base = os.path.join(ROOT, 'openworld', region)
    meta = WD.meta(os.path.join(base, 'data'))
    out = {}
    plan = os.path.join(base, 'plan', 'sites.json')
    if os.path.isfile(plan):
        P = json.load(io.open(plan, encoding='utf-8'))
        out['sites'] = P
        out['roads'] = {'format': 'krator-openworld-roads', 'version': 1,
                        'roads': [dict(r, town=r['to']) for S in P['sites'] for r in S['roads']]}
    if os.path.isfile(LANDFORMS):
        bx = meta['frame']['box_px']
        out['landforms'] = [r for r in json.load(io.open(LANDFORMS, encoding='utf-8'))['landforms']
                            if bx[0] <= r['px'] <= bx[2] and bx[1] <= r['py'] <= bx[3]]
    return out


def site_data(region):
    """the region's site data its spec reads, in filename order: src/47*-site-*.js (the laid villages, GENERATED [G data])"""
    src = os.path.join(ROOT, 'openworld', region, 'src')
    return [os.path.join(src, f) for f in sorted(os.listdir(src)) if re.match(r'^47[a-z]?-site-.*\.js$', f)] if os.path.isdir(src) else []


def inputs(region):
    """every file the bake reads (its cache key)"""
    base = os.path.join(ROOT, 'openworld', region)
    files = [os.path.join(ROOT, *j) for j in HEAD] + [p for _, p in land_chain(region)]
    files += [os.path.join(base, 'build.py'), os.path.join(base, 'src', '48-world-site.js'), os.path.join(base, 'plan', 'sites.json'),
              LANDFORMS, os.path.abspath(__file__), os.path.join(HERE, 'world_data.py'), WD.GEOLOGY] + site_data(region)
    files += [os.path.join(ROOT, w, f) for w, f in WD.RES_FRAGS]
    data = os.path.join(base, 'data')
    files += sorted(os.path.join(data, f) for f in os.listdir(data))
    return [f for f in files if os.path.isfile(f)]


def key(region, site_id, levels, probes):
    h = hashlib.sha1(json.dumps([region, site_id, levels, probes]).encode())
    for f in inputs(region):
        with open(f, 'rb') as fh:
            h.update(fh.read().replace(b'\r\n', b'\n'))
    return h.hexdigest()[:16]


BODY = r'''
WORLD.init(WORLD_R);
const ARGS=__ARGS__;
const S=(WORLD_DATA.meta.sites||[]).find(s=>s.id===ARGS.site);if(!S)throw new Error('bake_ground: no site '+ARGS.site+' in the region');
const x0=S.x,z0=S.z,out={site:S,x0,z0,levels:[],stats:[],water:[]};
const t0=Date.now();
for(const L of ARGS.levels){const [hx,hn,hs,cell]=L,mw=L[4]||0,nx=Math.round(2*hx/cell)+1,nz=Math.round((hn+hs)/cell)+1,X0=x0-hx,Z0=z0-hn;
 const H=new Float64Array(nx*nz);let lo=1e9,hi=-1e9;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const h=WORLD.H(X0+i*cell,Z0+j*cell,mw);H[j*nx+i]=h;if(h<lo)lo=h;if(h>hi)hi=h;}
 const STEP=Math.max(.05,Math.ceil((hi-lo+1)/65535/.05)*.05);lo=Math.floor(lo/STEP)*STEP;   /* 5 cm, or the next 5 cm the level's span fits uint16 in */
 const Q=new Uint16Array(nx*nz);for(let k=0;k<Q.length;k++)Q[k]=Math.round((H[k]-lo)/STEP);
 out.levels.push({x0:X0,z0:Z0,cell,minWave:mw,nx,nz,lo,step:STEP,h:Buffer.from(Q.buffer).toString('base64')});
 /* the bake's own check: the quantized grid, bilinear, against WORLD.H at points between its nodes (core/rand, so the
    same points every bake) */
 let mx=0,sum=0,n=0;for(let k=0;k<400;k++){const fx=KRAND.unit(KRAND.hash(7311,k,1)),fz=KRAND.unit(KRAND.hash(7311,k,2)),x=X0+fx*(nx-1)*cell,z=Z0+fz*(nz-1)*cell;
  const u=(x-X0)/cell,v=(z-Z0)/cell,i=Math.min(nx-2,Math.floor(u)),j=Math.min(nz-2,Math.floor(v)),a=u-i,b=v-j,q=(ii,jj)=>lo+Q[jj*nx+ii]*STEP;
  const g=(q(i,j)*(1-a)+q(i+1,j)*a)*(1-b)+(q(i,j+1)*(1-a)+q(i+1,j+1)*a)*b,e=Math.abs(g-WORLD.H(x,z,mw));if(e>mx)mx=e;sum+=e;n++;}
 out.stats.push({cell,minWave:mw,nx,nz,max:+mx.toFixed(3),mean:+(sum/n).toFixed(3)});}
for(const p of ARGS.probes){const w=WORLD.water(x0+p[0],z0+p[1]);out.water.push({x:p[0],z:p[1],level:w>-1e8?+w.toFixed(3):null,ground:+WORLD.H(x0+p[0],z0+p[1]).toFixed(3)});}
out.ms=Date.now()-t0;
process.stdout.write(JSON.stringify(out));
'''


def script(region, site_id, levels, probes):
    base = os.path.join(ROOT, 'openworld', region)
    parts = ['"use strict";var window=globalThis;\n']
    for j in HEAD[:2]:
        parts.append('\n// ---- %s\n' % '/'.join(j) + io.open(os.path.join(ROOT, *j), encoding='utf-8').read())
    parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (core/world/bake_ground.py)',
                             'openworld/%s/data, decoded by core/world/world_data.py' % region, extra=extras(region)))
    for j in HEAD[2:]:
        parts.append('\n// ---- %s\n' % '/'.join(j) + io.open(os.path.join(ROOT, *j), encoding='utf-8').read())
    for label, path in land_chain(region):
        parts.append('\n// ---- %s\n' % label + io.open(path, encoding='utf-8').read())
    spec = os.path.join(base, 'src', '48-world-site.js')
    if os.path.isfile(spec):   # the region's SITE_SPEC: the coasts kept round its sites' hamlets (44c keeps)
        parts.append(WD.net_fragment(spec))
        parts.append('var KHAMLET={CULTURES:new Proxy({},{get:(t,k)=>k in t?t[k]:{}})};   /* the spec tunes core/hamlet\'s cultures; the ground does not read them */\n')
        # a spec may build a row by name (KHAMLET.xanaduRow: the Gihon work's 48-world-site.js, 2026-11-23); the row reads its
        # culture's tables, which the bake does not load, and the ground reads no row: a stub row, so the spec runs
        parts.append('KHAMLET.xanaduRow=function(){return {};};\n')
        for p in site_data(region):   # the laid villages the spec reads (47g-site-gihon-landing.js: GH_LANDING_LAID)
            parts.append('\n// ---- openworld/%s/src/%s\n' % (region, os.path.basename(p)) + io.open(p, encoding='utf-8').read())
        parts.append('\n// ---- openworld/%s/src/48-world-site.js\n' % region + io.open(spec, encoding='utf-8').read())
    parts.append(WD.geology_fragment(os.path.join(base, 'data')))   # the coasts' classes read the provinces (44c rockAt)
    for where, f in WD.RES_FRAGS:
        parts.append('\n// ---- %s/%s\n' % (where, f) + io.open(os.path.join(ROOT, where, f), encoding='utf-8').read())
    parts.append(BODY.replace('__ARGS__', json.dumps({'site': site_id, 'levels': levels, 'probes': probes})))
    return ''.join(parts)


def bake(region, site_id, levels, probes=()):
    js = script(region, site_id, [list(L) for L in levels], [list(p) for p in probes])
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8', newline='\n') as f:
        f.write(js)
        tmp = f.name
    try:
        r = subprocess.run([node(), '--stack-size=8000', '--max-old-space-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.unlink(tmp)
    if r.returncode:
        sys.exit('bake_ground: node failed:\n' + r.stderr[-4000:])
    out = json.loads(r.stdout)
    out.update({'format': 'krator-world-ground', 'version': 1, 'region': region, 'key': key(region, site_id, levels, probes)})
    return out


def fragment(B, name, var):
    """the bake as a page's fragment: the levels decoded once (atob, as world_data.py's), H bilinear on the finest level that
    holds the point with a node to spare, the last level clamped beyond"""
    meta = {k: B[k] for k in ('format', 'version', 'region', 'key', 'x0', 'z0', 'water', 'stats')}
    meta['site'] = {k: B['site'][k] for k in ('id', 'name', 'px', 'py', 'x', 'z')}
    lv = [{k: L[k] for k in ('x0', 'z0', 'cell', 'minWave', 'nx', 'nz', 'lo', 'step', 'h')} for L in B['levels']]
    head = ('/* ==================== %s: the open world' + "'" + 's ground round %s (core/world/bake_ground.py over openworld/%s, site %s; key %s).'
            ' GENERATED: do not edit. [G data] */') % (name, B['site']['name'], B['region'], B['site']['id'], B['key'])
    js = [' const L=LV.map(l=>{const b=atob(l.h),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);', '  return {x0:l.x0-M.x0,z0:l.z0-M.z0,cell:l.cell,minWave:l.minWave,nx:l.nx,nz:l.nz,lo:l.lo,step:l.step,q:new Uint16Array(u.buffer)};});', ' function at(l,x,z){let u=(x-l.x0)/l.cell,v=(z-l.z0)/l.cell;u=u<0?0:u>l.nx-1.0001?l.nx-1.0001:u;v=v<0?0:v>l.nz-1.0001?l.nz-1.0001:v;', '  const i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j,o=j*l.nx+i,Q=l.q;', '  return l.lo+l.step*((Q[o]*(1-a)+Q[o+1]*a)*(1-b)+(Q[o+l.nx]*(1-a)+Q[o+l.nx+1]*a)*b);}', ' function inside(l,x,z){const m=l.cell;return x>=l.x0+m&&z>=l.z0+m&&x<=l.x0+(l.nx-2)*l.cell&&z<=l.z0+(l.nz-2)*l.cell;}', ' /* H(x, z): world metres at (x, z) m from the site; level(x, z): the index of the level that answers */', ' M.level=(x,z)=>{for(let k=0;k<L.length;k++)if(inside(L[k],x,z))return k;return L.length-1;};', ' M.H=(x,z)=>at(L[M.level(x,z)],x,z);M.levels=L.map(l=>({x0:l.x0,z0:l.z0,cell:l.cell,minWave:l.minWave,nx:l.nx,nz:l.nz}));']
    return (NL.join([head, 'var %s=(function(M,LV){' % var] + js)
            + NL + ' return M;})(' + json.dumps(meta, separators=(',', ':'), ensure_ascii=False) + ',' + json.dumps(lv, separators=(',', ':')) + ');' + NL)


def main():
    a = sys.argv[1:]
    if not a or '--site' not in a:
        sys.exit(__doc__)
    region, site = a[0], a[a.index('--site') + 1]
    levels = [(3000, 3000, 3000, 16), (12000, 12000, 12000, 64, 96)]   # minWave: 1.5 of the cell, as 81-world-terrain's chunks ask
    out = bake(region, site, levels, [(0, 6000)])
    for s in out['stats']:
        print('level %d m: %d x %d, bilinear vs WORLD.H max %.3f m, mean %.3f m' % (s['cell'], s['nx'], s['nz'], s['max'], s['mean']))
    print('water', out['water'], '%d ms' % out['ms'])
    if '--out' in a:
        with io.open(a[a.index('--out') + 1], 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(out, fh, separators=(',', ':'))


if __name__ == '__main__':
    main()
