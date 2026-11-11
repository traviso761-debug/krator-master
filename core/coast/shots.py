#!/usr/bin/env python3
"""Coast shots for core/coast (KCOAST): find shore points on an open-world page and photograph them, high and low.

    KRATOR_GL=gpu python3 core/coast/shots.py openworld/isle-demo/dist/isle-demo.html --out shots/coast-before [--n 3]
    KRATOR_GL=gpu python3 core/coast/shots.py <page> --out <dir> --at x,z[,label] ...

For each water body (WORLD.waterBodies, the biggest first) it scans the body's box for a stretch of shore inside the
region (WORLD.lakeWater against WORLD.H changing sign), then shoots two views of each point: 'top' (looking down from
6 km, where the scale model's 2 km cells showed as straight runs and right angles) and 'low' (an oblique from 220 m
over the water, the beach or rock at the foot). The same points are found on the same page whatever was built into
it, so a 'before' and an 'after' folder compare shot for shot (--points writes them; --from reads them back).
Runs through tools/harness.py (verify_page: the GPU lane, the universal asserts) and prints the KCOAST stats when
the page has the module."""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
from harness import verify_page  # noqa: E402

FIND_JS = r"""(n)=>{const out=[];const B=WORLD.waterBodies().slice().sort((a,b)=>b.cells-a.cells);
 for(const b of B){const [x0,z0,x1,z1]=b.box,st=Math.max(500,Math.min(x1-x0,z1-z0)/40);let got=0;
  const cand=[];
  for(let z=z0+st/2;z<z1;z+=st)for(let x=x0+st/2;x<x1;x+=st){if(!WORLD.inside(x,z))continue;
   const d0=WORLD.lakeWater(x,z)-WORLD.H(x,z,48),d1=WORLD.lakeWater(x+st,z)-WORLD.H(x+st,z,48);
   if(d0>2&&d1<-2&&WORLD.waterBodyAt(x,z)===b.id)cand.push([x+st/2,z]);}
  /* spread: every k-th candidate */
  const k=Math.max(1,Math.floor(cand.length/n));for(let i=0;i<cand.length&&got<n;i+=k){out.push({x:Math.round(cand[i][0]),z:Math.round(cand[i][1]),body:b.id,cells:b.cells});got++;}
  if(out.length>=n*3)break;}
 return out;}"""

SHOOT_JS = r"""(p)=>{const lv=WORLD.lakeWater(p.x,p.z),g=Math.max(lv,WORLD.H(p.x,p.z));
 if(p.mode==='top'){HOST.camera.position.set(p.x,g+6000,p.z+2400);CAM.lookAt(p.x,g,p.z);}
 else{HOST.camera.position.set(p.x-900,g+220,p.z+700);CAM.lookAt(p.x+200,g,p.z-150);}
 return {level:lv,ground:WORLD.H(p.x,p.z)};}"""


async def run(a):
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, size=a.size) as V:
        pg = V.page
        if a.at:
            pts = []
            for s in a.at:
                f = s.split(',')
                pts.append({'x': float(f[0]), 'z': float(f[1]), 'label': f[2] if len(f) > 2 else None})
        elif a.from_:
            pts = json.load(open(a.from_, encoding='utf-8'))
        else:
            pts = await pg.evaluate(FIND_JS, a.n)
        json.dump(pts, open(os.path.join(a.out, 'points.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
        print('points:', json.dumps(pts))
        st = await pg.evaluate("WORLD.coast?(s=>({ms:s.ms,keeps:s.keeps,bodies:s.bodies.length,classes:s.bodies.map(b=>b.classes)}))(WORLD.coast.stats()):null")
        if st: print('KCOAST:', json.dumps(st))
        for i, p in enumerate(pts):
            for mode in a.modes.split(','):
                r = await pg.evaluate(SHOOT_JS, dict(p, mode=mode))
                s = await pg.evaluate('_api.settle(180000)')
                await pg.evaluate('_api.render()')
                fn = os.path.join(a.out, 'p%02d-%s.png' % (i, mode))
                await V.shot(fn, view='coast-p%02d-%s' % (i, mode))
                print('%s  at %d,%d body %s  level %.1f ground %.1f  settle %s' % (fn, p['x'], p['z'], p.get('body'), r['level'], r['ground'],
                      s.get('ms') if isinstance(s, dict) else s), flush=True)
    return V.exit()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--out', default='shots/coast')
    ap.add_argument('--n', type=int, default=2, help='points per body')
    ap.add_argument('--at', nargs='*', help='x,z[,label] points instead of the search')
    ap.add_argument('--from', dest='from_', help='a points.json from an earlier run')
    ap.add_argument('--modes', default='top,low')
    ap.add_argument('--size', default='1280x800')
    sys.exit(asyncio.run(run(ap.parse_args())))
