#!/usr/bin/env python3
"""A top-down map of an open-world region's coast, drawn on the CPU from the world's own [G data] fragments (no GPU):
the ground's colour (WORLD.ground) hill-shaded, the water where a body's mask covers ground under its level, tinted by
depth. With --off the coast module is left out (the land and masks as they were), so a before and an after compare.

    python3 core/coast/map.py <region> --at x,z --size 16000 --px 512 --out coast.png [--off] [--lines]
    python3 core/coast/map.py <region> --find N --size 16000 --out <dir>     # N shore points, the biggest bodies first

--lines draws the coast field's zero set (white), the mask's edge (red) and the keeps (purple: where the coast is held as
the region had it). --preset '{"high":{"k":6}}' tries KCOAST.PRESETS overrides; --site <name> centres on a site. Region frames are the region's metres
(core/world/41-world-fields.js). Node and the region's data are all it needs."""
import argparse, base64, json, os, struct, subprocess, sys, tempfile, zlib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'core', 'world'))
import world_data as WD  # noqa: E402
import bake_sites as BS  # noqa: E402


PRESET = {}   # --preset: KCOAST.PRESETS overrides (one level deep), set before WORLD.init builds the coasts


def script(region, off, body):
    base = os.path.join(ROOT, 'openworld', region)
    js = [('core', 'rand', '08-core-rand.js'), ('core', 'terrain', '38-core-relief.js'), None]
    if not off:
        js += [('core', 'mask', '25-core-mask.js'), ('core', 'mask', '27-core-mask-distance.js'), ('core', 'coast', '30-core-coast.js')]
    js += [('core', 'world', '41-world-fields.js'), ('core', 'world', '42-world-roads.js')]
    js += [('openworld', region, 'src', f) for f in sorted(os.listdir(os.path.join(base, 'src'))) if f.startswith('43-') and f.endswith('.js')]
    if not off:
        js += [('core', 'world', '44c-world-coast.js')]
    parts = ['"use strict";var window=globalThis;\n']
    for j in js:
        if j is None:
            parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (core/coast/map.py)', 'openworld/%s/data' % region))
            continue
        parts.append('\n// ---- %s\n' % '/'.join(j) + open(os.path.join(ROOT, *j), encoding='utf-8').read())
    parts.append(WD.geology_fragment(os.path.join(base, 'data')))
    for where, f in WD.RES_FRAGS:
        parts.append('\n// ---- %s/%s\n' % (where, f) + open(os.path.join(ROOT, where, f), encoding='utf-8').read())
    if PRESET and not off:
        parts.append('\n(function(P,O){for(const k in O){if(O[k]&&typeof O[k]==="object"&&!Array.isArray(O[k])&&P[k])Object.assign(P[k],O[k]);else P[k]=O[k];}})(KCOAST.PRESETS,%s);\n' % json.dumps(PRESET))
    parts.append('WORLD.init(WORLD_R);\n' + body)
    return ''.join(parts)


FIND = r'''
const n=ARGS.n,out=[];const B=WORLD.waterBodies().slice().sort((a,b)=>b.cells-a.cells);
for(const b of B){const [x0,z0,x1,z1]=b.box,st=Math.max(500,Math.min(x1-x0,z1-z0)/40),cand=[];
 for(let z=z0+st/2;z<z1;z+=st)for(let x=x0+st/2;x<x1;x+=st){if(!WORLD.inside(x,z))continue;
  const d0=WORLD.lakeWater(x,z)-WORLD.H(x,z,48),d1=WORLD.lakeWater(x+st,z)-WORLD.H(x+st,z,48);
  if(d0>2&&d1<-2&&WORLD.waterBodyAt(x,z)===b.id)cand.push([x+st/2,z]);}
 const k=Math.max(1,Math.floor(cand.length/n));for(let i=0,g=0;i<cand.length&&g<n;i+=k,g++)out.push({x:Math.round(cand[i][0]),z:Math.round(cand[i][1]),body:b.id,cells:b.cells});
 if(out.length>=n*3)break;}
process.stdout.write(JSON.stringify(out));'''

DRAW = r'''
const {x,z,size,px,lines}=ARGS,st=size/px,x0=x-size/2,z0=z-size/2,N=px,H=new Float64Array((N+1)*(N+1));
for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*(N+1)+i]=WORLD.H(x0+i*st,z0+j*st,Math.min(48,st/2));
const B=WORLD.waterBodies();
const maskAt=(G,x,z)=>{let u=(x-G.x0)/G.cell-.5,v=(z-G.z0)/(G.cellZ==null?G.cell:G.cellZ)-.5;if(u<-.5||v<-.5||u>G.nx-.5||v>G.nz-.5)return 0;
 u=Math.min(Math.max(u,0),G.nx-1.0001);v=Math.min(Math.max(v,0),G.nz-1.0001);const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*G.nx+i,d=G.data;
 return((d[o]*(1-fu)+d[o+1]*fu)*(1-fv)+(d[o+G.nx]*(1-fu)+d[o+G.nx+1]*fu)*fv)/255;};
const P={},A={},C=[0,0,0,0],img=new Uint8Array(N*N*3),S=v=>Math.round(255*Math.min(1,Math.max(0,v<.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055)));
const deep=[.02,.12,.17],shal=[.1,.45,.45];
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const X=x0+(i+.5)*st,Z=z0+(j+.5)*st,h=(H[j*(N+1)+i]+H[j*(N+1)+i+1]+H[(j+1)*(N+1)+i]+H[(j+1)*(N+1)+i+1])/4;
 const hx=(H[j*(N+1)+i+1]-H[j*(N+1)+i]+H[(j+1)*(N+1)+i+1]-H[(j+1)*(N+1)+i])/(2*st),hz=(H[(j+1)*(N+1)+i]-H[j*(N+1)+i]+H[(j+1)*(N+1)+i+1]-H[j*(N+1)+i+1])/(2*st);
 WORLD.Hp(X,Z,Math.min(48,st/2),P);const F=WORLD.fieldsFrom(X,Z,h,Math.hypot(hx,hz),P,A);WORLD.ground(X,Z,F,C);
 const sh=Math.max(.25,Math.min(1.3,(.6-hx*.5-hz*.7)/Math.sqrt(1+hx*hx+hz*hz)+.45));let r=C[0]*sh,g=C[1]*sh,b=C[2]*sh;
 let edge=0;for(const bd of B){const m=maskAt(bd.mask,X,Z);if(m>.5&&h<bd.level){const d=bd.level-h,t=Math.min(1,d/8),a=.55+.4*Math.min(1,d/2);
   r=r*(1-a)+(shal[0]+(deep[0]-shal[0])*t)*a;g=g*(1-a)+(shal[1]+(deep[1]-shal[1])*t)*a;b=b*(1-a)+(shal[2]+(deep[2]-shal[2])*t)*a;}
  if(lines&&m>0&&m<1&&Math.abs(m-.5)<Math.min(.25,.5*st/Math.max(bd.mask.cell,1)))edge=1;}
 if(lines&&WORLD.coast){const kp=WORLD.coast.keepAt(X,Z);if(kp>0){r+=(.55-r)*kp*.45;g+=(.2-g)*kp*.45;b+=(.6-b)*kp*.45;}
  const c=WORLD.coast.at(X,Z);if(c&&Math.abs(c.c)<st*.7){r=g=b=1;}}
 if(edge){r=1;g=.1;b=.1;}
 const o=(j*N+i)*3;img[o]=S(r);img[o+1]=S(g);img[o+2]=S(b);}
process.stdout.write(Buffer.from(img).toString('base64'));'''


def run(js):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(js)
        tmp = f.name
    try:
        r = subprocess.run([BS.node(), '--stack-size=8000', '--max-old-space-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('map: node failed:\n' + r.stderr[-3000:])
    return r.stdout


def png(fn, w, h, rgb):
    raw = b''.join(b'\x00' + rgb[y * w * 3:(y + 1) * w * 3] for y in range(h))
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    with open(fn, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 6)) + chunk(b'IEND', b''))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('region')
    ap.add_argument('--at', action='append', default=[])
    ap.add_argument('--find', type=int, default=0)
    ap.add_argument('--from', dest='from_')
    ap.add_argument('--size', type=float, default=16000)
    ap.add_argument('--px', type=int, default=512)
    ap.add_argument('--out', default='coast.png')
    ap.add_argument('--off', action='store_true')
    ap.add_argument('--lines', action='store_true')
    ap.add_argument('--preset', help='JSON: KCOAST.PRESETS overrides, e.g. {"high":{"k":6}}')
    ap.add_argument('--site', help='centre on a site of the region (its name, as WORLD_DATA.meta.sites has it), offset by --at dx,dz')
    a = ap.parse_args()
    if a.preset:
        PRESET.update(json.loads(a.preset))
    if a.site:
        s = json.loads(run(script(a.region, True, 'process.stdout.write(JSON.stringify((WORLD_DATA.meta.sites||[]).find(s=>s.name===%s)||null));' % json.dumps(a.site))))
        if not s:
            sys.exit('map: no site %r in %s' % (a.site, a.region))
        d = [float(v) for v in a.at[0].split(',')[:2]] if a.at else [0, 0]
        a.at = ['%f,%f' % (s['x'] + d[0], s['z'] + d[1])]
    pts =[dict(zip(('x', 'z'), map(float, s.split(',')[:2]))) for s in a.at]
    if a.from_:
        pts = json.load(open(a.from_, encoding='utf-8'))
    if a.find:
        pts = json.loads(run(script(a.region, a.off, 'const ARGS=' + json.dumps({'n': a.find}) + ';' + FIND)))
        print('points:', json.dumps(pts))
    many = len(pts) > 1 or a.find
    if many:
        os.makedirs(a.out, exist_ok=True)
        json.dump(pts, open(os.path.join(a.out, 'points.json'), 'w', encoding='utf-8', newline='\n'))
    for i, p in enumerate(pts):
        b64 = run(script(a.region, a.off, 'const ARGS=' + json.dumps({'x': p['x'], 'z': p['z'], 'size': a.size, 'px': a.px, 'lines': a.lines}) + ';' + DRAW))
        fn = os.path.join(a.out, 'p%02d%s.png' % (i, '-off' if a.off else '')) if many else a.out
        png(fn, a.px, a.px, base64.b64decode(b64))
        print(fn, p)


if __name__ == '__main__':
    main()
