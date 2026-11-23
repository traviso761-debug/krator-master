#!/usr/bin/env python3
"""Headless verification of a lake town (PLAN.md section 6). The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
town's own. The town is the page's query: pass the page as "dist/xanadu-lake.html?town=<key>" (or --town <key>; the
default the page's, mouth).

  xl-laid       the plan laid on core/city with no error, every record drawn by the kit (none failed to place)
  xl-civic      the spec's landmarks all placed and its works in their numbers
  xl-census     the houses x the tune's household (XAN_TUNE.farm.hh) within 10 % of the tune's people
  xl-shore      the quay and the landing stair at the water's edge (decks within 2 m of the level, fronts over the water);
                no building but the water pieces under the level
  xl-boats      the spec's craft drawn: every boat afloat (the lake under it) or drawn up on the beach or the stair
  xl-terraces   each bench level within 0.5 m, every field on its bench
  xl-ground     every building's floor on its ground (no lower than the ground at its middle less its footing, no higher
                than its highest corner plus a metre; the water pieces stand at the water)
  xl-world      the page's ground at the footprint's edge and the band within 1.5 % of the band of the region's (the fit's samples; the
                bake's own check is core/world/bake_towns.py <key> --check)
  xl-water      the lake (core/water WATER.open) and the stream (WATER.flow) drawn (a town with no stream: the lake)
  xl-ruins      a town with ruins (Ōlḍ-Thalaba): the spec's count of ruined houses within 10 %, every ruin chunk watched by
                core/ruins (KRUINS.watch: the harness's own assert then holds nothing floating, every wreck seated)

The plan's own checks (no overlap, nothing on a way, in the lake or on the stream, the same twice) are the node tests':
node settlements/xanadu-lake/tests/test-xl-towns.js, test-xl-site.js.

    KRATOR_GL=gpu python3 verify.py "dist/xanadu-lake.html?town=mouth" --assert --views "Overview,The landing stair"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

CITY_JS = r"""
{const Q=window._xl||{},S=(typeof XL!=='undefined'&&XL.SPECS)?XL.SPECS[Q.key]:null,T=typeof XL_TOWN!=='undefined'?XL_TOWN:null,P=T?T.place:[],key=Q.key,h=(x,z)=>xlH(key,x,z);
 R.push({name:'xl-laid',ok:!Q.err&&!!T&&Q.placed>250&&Q.failed===0,
  detail:Q.err?('the plan did not lay: '+Q.err):((Q.name||key)+': '+Q.placed+' placed '+JSON.stringify(Q.byKind||{})+', '+Q.chunks+' chunks, '+Q.failed+' not drawn'+(Q.failed?': '+Q.fails.join(' | '):''))});
 if(S&&T){
  const miss=S.works.filter(w=>P.filter(p=>p.key===w.key).length<w.n).map(w=>w.key).concat(S.landmarks.filter(l=>!P.some(p=>p.key===l.key)).map(l=>l.key));
  R.push({name:'xl-civic',ok:!miss.length,detail:miss.length?'missing '+miss.join(', '):S.landmarks.length+' landmarks and '+S.works.reduce((a,w)=>a+w.n,0)+' works placed'});
  const C=T.census,tp=XL.tune(key).people;
  R.push({name:'xl-census',ok:Math.abs(C.houses*XL.HH-tp)<=tp*.1,detail:C.houses+' houses x '+XL.HH+' = '+C.peopleHoused+' / '+tp+' '+JSON.stringify(C.byQuarter)+', wealth '+JSON.stringify(C.wealth)+', Andean '+C.andean});
  const front=p=>h(p.x+Math.sin(p.ry)*p.d/2,p.z+Math.cos(p.ry)*p.d/2),sh=P.filter(p=>p.key==='xa_quay'||p.key==='xa_ghat');
  const wet=P.filter(p=>!p.water&&p.key!=='xa_fish_racks'&&h(p.x,p.z)<0);
  R.push({name:'xl-shore',ok:sh.length>=2&&sh.every(p=>Math.abs(p.o.y)<=2&&front(p)<0)&&!wet.length,
   detail:sh.map(p=>p.key+' deck '+p.o.y.toFixed(1)+' front '+front(p).toFixed(1)).join(', ')+(wet.length?'; under the level: '+wet.slice(0,3).map(p=>p.id+' '+p.key).join(', '):'; nothing else under the level')});
  const BS=Q.boatSpot?Q.boatSpot():[],bad=BS.filter(b=>b.beached?!(b.h>-1.5&&b.h<2):b.h>-.5),c=S.craft,n=k=>BS.filter(b=>b.key===k).length;
  R.push({name:'xl-boats',ok:n('xa_dugout')===c.dugouts&&n('xa_launch')===c.launches&&n('xa_lake_barge')===c.barges&&!bad.length,
   detail:n('xa_dugout')+' dugouts ('+BS.filter(b=>b.beached).length+' drawn up), '+n('xa_launch')+' launches, '+n('xa_lake_barge')+' barges'+(bad.length?'; aground or adrift: '+bad.slice(0,3).map(b=>b.id+' '+b.h).join(', '):'; every one afloat or drawn up')});
  const G=T.geo,spread=G.benches.map(B=>{let lo=1e9,hi=-1e9;for(let x=B.x0+20;x<=B.x1-20;x+=10)for(let d=B.d0+4;d<=B.d1-4;d+=6){const v=h(x,xlShoreZ(key,x)-d);lo=Math.min(lo,v);hi=Math.max(hi,v);}return hi-lo;});
  const off=T.fields.filter(f=>{const B=G.benches[f.bench];return f.poly.some(p=>{const d=xlShoreZ(key,p[0])-p[1];return d<B.d0-.5||d>B.d1+.5;});});
  R.push({name:'xl-terraces',ok:spread.length===S.wall.benches&&spread.every(s=>s<=.5)&&!off.length,detail:spread.length+' benches, spread '+spread.map(s=>s.toFixed(2)).join(', ')+' m; '+T.fields.length+' fields'+(off.length?', off their bench: '+off.map(f=>f.id).join(', '):', each on its bench')});
  let bg=0,first=null;for(const p of P){if(p.water||p.ruin)continue;   /* the ruins follow the ground themselves (core/ruins watches them) */const b=p.bo,c2=Math.cos(p.ry),s2=Math.sin(p.ry),hs=[[0,0],[-b.hw,-b.hd],[b.hw,-b.hd],[b.hw,b.hd],[-b.hw,b.hd]].map(q=>h(p.x+q[0]*c2+q[1]*s2,p.z-q[0]*s2+q[1]*c2));
   const lo=h(p.x,p.z)-(p.drop||0)-.8,hi=Math.max.apply(null,hs)+1;if(!(p.o.y>=lo&&p.o.y<=hi)){bg++;first=first||(p.id+' '+p.key+' floor '+p.o.y.toFixed(1)+' ground '+hs[0].toFixed(1));}}
  R.push({name:'xl-ground',ok:bg===0,detail:bg?bg+' off their ground, first '+first:'every floor on its ground (its footing under it)'});
  const F=XL.FIT[key],tol=.015*S.world.band;let worst=0,at=null;for(const [x,z,y] of F.check.ring){const e=Math.abs(h(x,z)-y);if(e>worst){worst=e;at=[x,z];}}
  /* a third of the 144 ring points at least: a town whose pin stands far inland of its landing (Pāṭari) has much of its ring over the lake, which the fit leaves out (tests/test-xl-site.js the same) */
  R.push({name:'xl-world',ok:worst<=tol&&F.check.ring.length>=48,detail:'the ground at the footprint\'s edge and the band within '+worst.toFixed(2)+' m of the region\'s ('+F.check.ring.length+' points; worst at '+JSON.stringify(at)+')'});
  const W=window._xlWater||{};R.push({name:'xl-water',ok:!!W.lake&&(!W.hasStream||!!W.stream),detail:'the lake '+(W.lake?'drawn':'MISSING')+', the stream '+(!W.hasStream?'none (the town has none)':W.stream?'drawn ('+W.streamPts+' points)':'MISSING')});
  const ru=P.filter(p=>p.ruin);if(S.ruins||ru.length){const want=S.ruins?S.ruins.houses:0,n=P.filter(p=>p.kind==='ruin').length;
   R.push({name:'xl-ruins',ok:Math.abs(n-want)<=want*.1&&Q.ruinsWatched>0&&typeof KRUINS!=='undefined',detail:n+' ruined houses (the spec\'s '+want+'), '+ru.filter(p=>p.kind!=='ruin').length+' ruined landmarks, '+(Q.ruinsWatched||0)+' chunks watched by core/ruins'});}}}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + CITY_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}

# the town: the page's own query (dist/xanadu-lake.html?town=mouth) or --town, joined to Xanadu's (?interiors=1)
TOWN = {'q': ''}
_vp = xv.verify_page


def _verify_page(html, **kw):
    q = kw.get('query') or ''
    if TOWN['q']:
        q = (q + '&' if q else '?') + TOWN['q']
    kw['query'] = q
    return _vp(html, **kw)


xv.verify_page = _verify_page

if __name__ == '__main__':
    import argparse, asyncio
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--town", default="")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--strict-budget", dest="strict_budget", action="store_true")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append")
    ap.add_argument("--size", default="1280x800")
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--interiors", action="store_true")
    argv = []
    for x in sys.argv[1:]:
        if '.html?' in x:   # the page with its town: the query goes to the page, the path to the harness
            x, q = x.split('?', 1)
            TOWN['q'] = q
        argv.append(os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x)
    a = ap.parse_args(argv)
    if a.town:
        TOWN['q'] = 'town=' + a.town
    sys.exit(asyncio.run(xv.run(a)))
