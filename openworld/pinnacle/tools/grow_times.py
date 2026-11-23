#!/usr/bin/env python3
"""Time every flora prototype the region's kits can ask the nursery for, one by one, and sum their size.

    python3 ../../tools/harness.py lock --lane rtx -- python3 tools/grow_times.py dist/pinnacle.html [--json out.json]

For each kit in the registry, each species its passes can pick, each of the nursery's variants and each level the kit
draws (hero 2, mid 1, far 0 unless its far is an impostor, the sapling where a pass has saplings): the ms to grow it
(core/world/84-world-nursery.js, one growTree on the main thread: what a frame stalls for the first time a tree of it
comes into reach) and its triangles. Prints the totals by kit and level and the slowest twenty.
"""
import argparse, asyncio, json, os, sys
os.environ.setdefault('KRATOR_GL', 'gpu')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness  # noqa: E402
from harness import verify_page  # noqa: E402

GROW = r"""async ()=>{const out=[],VARIANTS=4;
 for(let ki=0;ki<FLORA.KITS.length;ki++){const K=FLORA.KITS[ki],imp=!!WORLD_KITS[ki].impostor;
  const sps=new Set();for(const P of K.passes){if(P.pick||P.stand){for(let s=0;s<K.SP.length;s++)sps.add(s);}else if(Array.isArray(P.sp))P.sp.forEach(s=>sps.add(s));else if(P.sp!=null)sps.add(P.sp);}
  const sap=K.passes.some(P=>P.sapling),far=K.passes.some(P=>P.far);
  for(const sp of sps)for(let v=0;v<VARIANTS;v++){
   const levels=[[2,false],[1,false]];if(far&&!imp)levels.push([0,false]);if(sap)levels.push([2,true]);
   for(const [lv,sa] of levels){const key=ki+'|'+sp+'|'+v+'|'+(sa?'s':lv);let P=NURSERY.protos.get(key),ms=null;
    if(!P){NURSERY.get(key,{kit:K.name,sp,v,lv,sapling:sa},0);const t=performance.now();NURSERY.update(0);ms=performance.now()-t;P=NURSERY.protos.get(key);}
    out.push({key,kit:K.name,sp,v,lv:sa?'s':lv,ms:ms==null?null:Math.round(ms),tris:P?Math.round(P.tris||0):0,none:!!(P&&P.none)});
    await new Promise(r=>setTimeout(r,0));}}}
 return out;}"""


async def run(a):
    async with verify_page(a.html, here=HERE, size='640x400', settle_ms=0, lock=False,
                           ready_js="typeof CAM==='object'&&CAM&&window._api&&window._sites") as V:
        pg = V.page
        pg.set_default_timeout(1800000)
        print('renderer:', await pg.evaluate(harness.RENDERER_JS), flush=True)
        await pg.evaluate('_api.settle(240000)')
        rows = await pg.evaluate(GROW)
    grown = [r for r in rows if r['ms'] is not None]
    by = {}
    for r in rows:
        b = by.setdefault((r['kit'], str(r['lv'])), {'n': 0, 'grown': 0, 'ms': 0, 'tris': 0})
        b['n'] += 1
        b['tris'] += r['tris']
        if r['ms'] is not None:
            b['grown'] += 1
            b['ms'] += r['ms']
    print('%-18s %-3s %5s %6s %9s %10s' % ('kit', 'lv', 'protos', 'grown', 'grow ms', 'triangles'))
    for (k, lv), b in sorted(by.items()):
        print('%-18s %-3s %5d %6d %9d %10d' % (k, lv, b['n'], b['grown'], b['ms'], b['tris']))
    print('total: %d prototypes, %d grown here in %.1f s, %.2f M triangles' % (
        len(rows), len(grown), sum(r['ms'] for r in grown) / 1000, sum(r['tris'] for r in rows) / 1e6))
    print('slowest:', ', '.join('%s %d ms' % (r['key'], r['ms']) for r in sorted(grown, key=lambda r: -r['ms'])[:20]))
    if a.json:
        with open(a.json, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(rows, f, indent=1)
    return 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--json', default='')
    sys.exit(asyncio.run(run(ap.parse_args())))
