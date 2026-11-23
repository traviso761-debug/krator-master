#!/usr/bin/env python3
"""Export Pinnacle Rock's plan as plain records: settlements/pinnacle-rock/plan/pinnacle.json.

    python3 settlements/pinnacle-rock/tools/export_plan.py [--html dist/pinnacle-rock.html]

The page lays its plan from its rock (KSTACKS bodies over the region's floor, 45), its roosts (43), its town on core/city
(54, PRT), its farms (55, PRF) and the bands' grounds (56, PRC): [G data] planners, but run on ground the page builds (the
necanyons kit's land, the talus), so the plan is made in the browser and read here, through the shared harness (the GPU
lanes' lock), as the isle demo's world plan is baked. The full simulation reads the file in node
(tests/test-pr-sim.js: core/region's host declares the town from it, as the isle demo's towns from their plans).

What is written (every coordinate in the page's frame, metres, y up; the mesa's middle at 0,0):
  town   {lots: [{id, key, v, x, y, z, w, d, h, ry, cls, trade, district, landmark}], ways: [{id, kind, w, pts: [[x, z]]}],
          greens, squares, top (the cap's height)}
  farms  {fields: [{id, kind, crop, x, z, area}], houses: [{id, key, v, x, y, z, w, d, ry}]}
  camps  [{id, tribe, ground, x, z, tents: [{id, key, kind, x, y, z, w, d, ry}]}]
  ways   the ways between the floor and the top: the Stair, the lifts, the climbs, as [{id, kind, pts: [[x, y, z]]}]
  hash   of the rest, so a stale export is caught (tests/test-pr-sim.js compares nothing: rerun this after the page changes)"""
import argparse, asyncio, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.dirname(HERE)
ROOT = os.path.normpath(os.path.join(BUILD, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import verify_page   # noqa: E402

JS = r'''() => {
 const r1=v=>Math.round(v*100)/100, P=p=>p.map(q=>q.length===3?[r1(q[0]),r1(q[1]),r1(q[2])]:[r1(q[0]),r1(q[1])]);
 const T=TOWN, out={format:'pinnacle-plan',version:1,town:null,farms:null,camps:[],ways:[],errors:[]};
 const tryIt=(n,f)=>{try{f();}catch(e){out.errors.push(n+': '+String(e&&e.stack||e).slice(0,400));}};
 tryIt('town',()=>{if(T){const pl=T.plan||{};
  out.town={top:r1(MESA_B.top),
   lots:(T.lots||[]).map(L=>({id:L.id,key:L.key,v:L.v||0,x:r1(L.x),y:r1(L.y==null?(T.h?T.h(L.x,L.z):0):L.y),z:r1(L.z),w:r1(L.w),d:r1(L.d),h:r1(L.h||0),ry:r1(L.ry||0),
     cls:L.cls||null,role:L.role||null,name:L.name||null,wealth:L.wealth==null?null:L.wealth,civic:!!L.civic,district:L.district==null?null:L.district,died:L.died==null?null:L.died})),
   ways:(pl.ways||T.ways||[]).map((W,i)=>({id:W.id==null?'w'+i:W.id,cls:W.cls||W.kind||'street',w:r1(W.w||4),pts:P((W.pts||[]).map(p=>Array.isArray(p)?p:[p.x,p.z]))})),
   greens:(pl.greens||[]).map(g=>({x:r1(g.x),z:r1(g.z),r:r1(g.r||g.R||10)})),
   squares:(T.squares||[]).map(s=>{const c=s.x!=null?[s.x,s.z]:s.c?s.c:s.poly&&s.poly.length?s.poly.reduce((a,p)=>[a[0]+p[0]/s.poly.length,a[1]+p[1]/s.poly.length],[0,0]):null;return c?{id:s.id==null?null:s.id,name:s.name||null,x:r1(c[0]),z:r1(c[1])}:{id:s.id==null?null:s.id,keys:Object.keys(s).slice(0,12)};})};}});
 tryIt('farms',()=>{if(typeof FARMS!=='undefined'&&FARMS){const F=FARMS;
  out.farms={fields:(F.cells||[]).map((c,i)=>({id:c.id||('cell'+i),kind:c.kind||'field',crop:c.crop||null,terrace:c.k==null?null:c.k,x:r1(c.x),y:r1(c.y||0),z:r1(c.z),area:r1((c.along||0)*(c.across||0))})),
   houses:(F.houses||[]).map(H=>({id:H.id,key:H.key,v:H.v||0,x:r1(H.x),y:r1(H.y||0),z:r1(H.z),w:r1(H.w),d:r1(H.d),ry:r1(H.ry||0)}))};}});
 tryIt('camps',()=>{if(typeof CAMPS!=='undefined'&&CAMPS){(CAMPS.grounds||[]).forEach(G=>out.camps.push({id:'staiytii0y:'+G.tribe+':'+G.ground,tribe:G.tribe,ground:G.ground,name:G.name,x:r1(G.ell.x),z:r1(G.ell.z),
   tents:(G.items||[]).map((t,i)=>({id:G.tribe+':'+G.ground+':'+i,key:t.key,v:t.v||0,x:r1(t.x),y:r1(t.y||0),z:r1(t.z),w:r1(t.w),d:r1(t.d),ry:r1(t.ry||0)}))}));}});
 tryIt('roost',()=>{if(typeof ROOST!=='undefined'&&ROOST){(ROOST.ways||[]).forEach((W,i)=>out.ways.push({id:W.id||('rw'+i),kind:W.kind||'way',pts:P(W.pts||[])}));
  (ROOST.lifts||[]).forEach((L,i)=>out.ways.push({id:L.id||('lift'+i),kind:'lift',pts:P([L.foot||L.a||[0,0,0],L.head||L.b||[0,0,0]].map(p=>Array.isArray(p)?p:[p.x,p.y||0,p.z]))}));}});
 tryIt('log',()=>{out.log={camps:(typeof CAMPS!=='undefined'&&CAMPS)?CAMPS.log:null,town:T?{missing:T.missing,failed:(T.failed||[]).length,lots:(T.lots||[]).length}:null,farms:(typeof FARMS!=='undefined'&&FARMS)?FARMS.log:null};});
 return JSON.stringify(out);
}'''


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', default=os.path.join(BUILD, 'dist', 'pinnacle-rock.html'))
    a = ap.parse_args()
    async with verify_page(a.html, here=BUILD) as V:
        if not V.ready:
            print('FAILED: the page did not build'); return 1
        txt = await V.page.evaluate(JS)
    D = json.loads(txt)
    body = json.dumps(D, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    D['hash'] = hashlib.sha256(body.encode('utf-8')).hexdigest()[:12]
    os.makedirs(os.path.join(BUILD, 'plan'), exist_ok=True)
    with open(os.path.join(BUILD, 'plan', 'pinnacle.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(D, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    T = D.get('town') or {}
    print('log', json.dumps(D.get('log'))[:1500]); print('errors', D.get('errors'))
    print('wrote plan/pinnacle.json: %d lots, %d ways, %d fields, %d camps, %d floor-to-top ways, hash %s' % (
        len(T.get('lots', [])), len(T.get('ways', [])), len((D.get('farms') or {}).get('fields', [])), len(D['camps']), len(D['ways']), D['hash']))
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
