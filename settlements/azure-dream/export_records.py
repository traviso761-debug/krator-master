#!/usr/bin/env python3
"""Export the built pages' site records for the blueprint (azure_blueprint.py draws sheets G, W, S and the section from them).

Each page is opened on the shared harness (tools/harness.py: the Chromium launcher, the local three.js, software GL unless
KRATOR_GL=gpu) and asked for what it placed, in its own frame (x east, z south, metres from its origin; the plan's u = -z,
v = x): every record of AD_PLACE (id, key, kind, the kit's name, centre, turn, footprint, height, level), the pads and
terraces, the ways, the lake (the 1:1 ground under the lake's level, as runs of 8 m cells over the near box) and a profile up
the page's axis (the ground under its pads, u -120 to 700). Written to floors/page-<target>.json, committed beside the sheets.

    python3 build.py && python3 export_records.py          # then python3 azure_blueprint.py
"""
import asyncio, io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness as H

TARGETS = [('isle', 'azure-dream.html'), ('summit', 'azure-dream-summit.html')]

JS = r"""(()=>{const r=v=>Math.round(v*100)/100;
 const places=AD_PLACE.map(p=>({id:p.id,key:p.key,kind:p.kind,name:(VERN.defs[p.key]||{}).name||p.key,x:r(p.x),z:r(p.z),ry:Math.round(p.ry*1e4)/1e4,
  w:r(p.w),d:r(p.d),h:r(p.h||0),y:r(p.o.y||0),len:p.o.len==null?null:r(p.o.len)}));
 const pads=AD_PADS.map(p=>({id:p.id,x0:r(p.x0),z0:r(p.z0),x1:r(p.x1),z1:r(p.z1),y:p.y}));
 const ways=(typeof AD_WAYS!=='undefined'?AD_WAYS:[]).map(([k,w,Q])=>({kind:k,w,pts:Q.map(q=>[r(q[0]),r(q[1])])}));
 const B=AD.BOX,cell=8,water=[];
 for(let z=B[1];z<B[3];z+=cell){let x0=null;for(let x=B[0];x<=B[2];x+=cell){const wet=x<B[2]&&adBase(x+cell/2,z+cell/2)<0;
   if(wet&&x0===null)x0=x;if(!wet&&x0!==null){water.push([z,x0,x]);x0=null;}}}
 const profile=[];for(let u=-120;u<=700;u+=4)profile.push([u,r(terrainH(0,-u))]);
 return {site:AD_SITE.id,px:AD_SITE.PX,box:B,cell,places,pads,ways,water,profile};})()"""


async def run():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await H.launch_chromium(p)
        try:
            for target, page in TARGETS:
                html = os.path.join(HERE, 'dist', page)
                with H.serve(os.path.dirname(html)) as port:
                    pg, errs, ready = await H.open_page(b, html, port)
                    if not ready or errs:
                        raise SystemExit('export_records.py: %s did not build: %s' % (page, '; '.join(errs[:3])))
                    data = await pg.evaluate(JS)
                    await pg.close()
                out = os.path.join(HERE, 'floors', 'page-%s.json' % target)
                with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                    json.dump(data, fh, ensure_ascii=False, separators=(',', ':'))
                    fh.write('\n')
                print('wrote %s: %d places, %d pads, %d ways, %d lake runs' % (os.path.relpath(out, HERE).replace(os.sep, '/'), len(data['places']),
                                                                              len(data['pads']), len(data['ways']), len(data['water'])))
        finally:
            await b.close()


if __name__ == '__main__':
    asyncio.run(run())
