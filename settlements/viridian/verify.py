#!/usr/bin/env python3
"""Headless verification of the Viridian pages. Both are built on Xanadu's (build.py), so their probe (window._api), invariants
and views are Xanadu's, and settlements/xanadu/verify.py runs them (on tools/harness.py), with the pages' own.

The sheet (dist/viridian-sheet.html, step V3):

  viridian-laid   every planned qb_vt_* def stands on the sheet at every variant, and the green monastery beside them

The estate (dist/viridian.html, window.CITY_BUILD 'viridian', step V6's first pass):

  estate-laid     every place of the site placed (over 45), the great monastery in the green dress, the colleges, the tea works,
                  the cloud hermitages,
                  the herb houses, the physic garden, the spring house and the pluckers' shelter among them
  bench-level     the head house's bench one level, every building on it standing at that level, the bench within 30 m of
                  the ground under it
  terraces-cut    each tea garden cut into treads on its ground: over half of a grid of points inside its polygon read as a
                  tread, a riser or a bund (KRELIEF.at on core/world's ground)
  tea-on-treads   the tea drawn on the fine ground (over 50,000 clipped blocks), every sampled one standing on a tread at its
                  drawn height; the rows painted over the whole estate (over 500,000 dabs)

The records' lots, seeds and dress are checked headless by tests/test-vt-records.js, the estate's records by
tests/test-vt-estate.js.

    KRATOR_GL=gpu python3 verify.py dist/viridian.html --assert --views "Overview,The head house"
    KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Opening,Overview"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

PLANNED = ['qb_vt_wither', 'qb_vt_roll_fire', 'qb_vt_pack', 'qb_vt_tasting', 'qb_vt_drying', 'qb_vt_still', 'qb_vt_curing',
           'qb_vt_shade', 'qb_vt_log_yard', 'qb_vt_spring', 'qb_vt_grange', 'qb_vt_shelter', 'qb_vt_hermitage',
           'qb_vt_terrace_plot', 'qb_vt_physic']
ESTATE_JS = r"""
if(window.CITY_BUILD==='viridian'){const Z=window._viridian||{},K=Z.byKind||{},P=typeof VT_PLACE!=='undefined'?VT_PLACE:[],has=id=>P.some(p=>p.id===id);
 const ids=['great-monastery','college:north','college:south','master-house','wither:0','wither:1','roll-fire','pack','herb-drying','curing','still-room','tasting-room','caravanserai','physic-garden','shade-house','log-yard','spring-house','pluckers-shelter','hermitage:0','hermitage:1','hermitage:2'],miss=ids.filter(i=>!has(i));
 const mono=P.find(p=>p.id==='great-monastery');
 R.push({name:'estate-laid',ok:Z.placed>=45&&!miss.length&&!!mono&&mono.o.v===3,detail:Z.placed+' placed ('+JSON.stringify(K)+'), '+Z.chunks+' chunks, '+Z.pads+' pads, '+Z.retain+' retaining faces'+(miss.length?'; MISSING '+miss.join(', '):'')});
 const B=VT_BENCH,on=P.filter(p=>p.kind==='sacred'),off=on.filter(p=>Math.abs(p.o.y-B.y)>.01);let lo=1e9,hi=-1e9;
 for(let x=B.x0;x<=B.x1;x+=10)for(let z=B.z0;z<=B.z1;z+=10){const g=vtBase(x,z);lo=Math.min(lo,g);hi=Math.max(hi,g);}
 R.push({name:'bench-level',ok:!off.length&&on.length>=10&&B.y>lo-30&&B.y<hi+30,detail:'the bench at '+B.y+' m, the ground under it '+lo.toFixed(1)+'-'+hi.toFixed(1)+' m; '+on.length+' buildings on it'+(off.length?', OFF ITS LEVEL '+off.map(p=>p.id).join(', '):', all at its level')});
 const cut=VT_TERR.map((Rr,i)=>{const Pp=Rr.zone.poly,x0=Math.min(...Pp.map(p=>p[0])),x1=Math.max(...Pp.map(p=>p[0])),z0=Math.min(...Pp.map(p=>p[1])),z1=Math.max(...Pp.map(p=>p[1]));let n=0,t=0;
  for(let a=1;a<20;a++)for(let b=1;b<20;b++){const x=x0+(x1-x0)*a/20,z=z0+(z1-z0)*b/20;n++;if(KRELIEF.at(Rr,x,z,vtBase(x,z)))t++;}return[VTE.GARDENS[i].id,t,n];});
 R.push({name:'terraces-cut',ok:cut.every(c=>c[1]>c[2]/2),detail:cut.map(c=>c[0]+' '+c[1]+'/'+c[2]).join(', ')+' points inside each garden on its terraces'});
 const F=[].concat(...VT_HEDGES.fine),S=[];for(let i=0;i<F.length;i+=997)S.push(F[i]);
 const bad=S.filter(p=>!VT_TERR.some(Rr=>{const a=KRELIEF.at(Rr,p.x,p.z,vtBase(p.x,p.z));return a&&a.part==='tread';}));
 const paint=VT_HEDGES.paint.reduce((a,L)=>a+L.length,0),tea=(window._viridian||{}).tea|0;
 R.push({name:'tea-on-treads',ok:tea>50000&&F.length===tea&&!bad.length&&paint>500000,detail:tea+' clipped blocks drawn on the fine ground, '+S.length+' sampled, '+bad.length+' off a tread; '+paint+' dabs painted over the estate'});}
else"""
SHEET_JS = r"""
{const want=%s,S=(typeof SITES!=='undefined'?SITES:[]),miss=[];let n=0;
 for(const k of want){const D=VERN.defs[k];if(!D){miss.push(k+' (no def)');continue;}const nv=D.nv==null?3:D.nv;
  for(let v=0;v<nv;v++){if(S.some(s=>s.key===k&&((s.o&&s.o.v)|0)===v))n++;else miss.push(k+' v'+v);}}
 const mono=S.some(s=>s.key==='qb_monastery'&&s.o&&s.o.v===3);
 R.push({name:'viridian-laid',ok:!miss.length&&mono,detail:n+' of the Order\'s builds on the sheet'+(miss.length?'; missing '+miss.slice(0,6).join(', '):'')+(mono?'; the green monastery beside them':'; the green monastery missing')});}
return R;}""" % ('[' + ','.join("'%s'" % k for k in PLANNED) + ']')
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + ESTATE_JS + SHEET_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}

if __name__ == '__main__':
    import argparse, asyncio
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
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
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
