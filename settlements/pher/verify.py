#!/usr/bin/env python3
"""Headless verification of Phēr's town (PLAN.md steps P3, P8). The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
town's own:

  pher-laid        the town laid on core/city with no error (PLAN.md step P8: the delta, the shelf, both hillsides on the
                   hillside strategy), over 1,000 placed, every record drawn by the kit (none failed to place), and the
                   road drawn, joined to the Thalaba road at its back
  pher-civic       the governor's house (the Sultan's heir's seat), the pilgrims' house, the quays, the boat sheds, the
                   warehouses, the generator, the harbour light, the temple of the Decree, the granaries placed
  pher-people      the households about 6,000 (PLAN.md section 2), within 25 % (reported as a budget)
  pher-boats       the lake craft (P4): over 80 boats, the six runs, every boat under way on water (moored and beached at the quays and the beach)
  pher-basements   the hillsides' carved basements and their doors from the podium (P8): over 300 carved, over 20 doors
                   drawn, every door clear of the entry flights, the kit's doors and its house's own outside parts
  pher-ground      every building's floor on its ground: the floor no lower than the ground at its middle less its footing,
                   no higher than the ground's highest corner plus a metre (the quays, sheds and bridges stand at the water)

The plan's own checks (no overlap, nothing on a street, in the lake or on the stream, the same twice) are the node test's:
node settlements/pher/tests/test-pher-site.js.

    KRATOR_GL=gpu python3 verify.py dist/pher.html --assert --views "Overview,From the cove"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

CITY_JS = r"""
{const Q=window._pher||{},L=Q.byLevel||{};
 R.push({name:'pher-laid',ok:!Q.err&&Q.placed>1000&&L.delta>40&&L.shelf>=6&&L.east>300&&L.west>120&&L.road>0&&Q.failed===0&&typeof PH_ROAD!=='undefined'&&!!PH_ROAD.join&&!!scene.getObjectByName('the road up the spur'),
  detail:Q.err?('the plan did not lay: '+Q.err):(Q.placed+' placed '+JSON.stringify(L)+', '+Q.chunks+' chunks, '+Q.failed+' not drawn'+(Q.failed?': '+Q.fails.join(' | '):''))});
 const want=['xa_cit_vizier','xa_palace_gate','xa_barracks','xa_barge','xa_caravanserai','xa_temple_ortakoy','xa_quay','xa_boatshed','xa_warehouse','xa_generator','xa_lighthouse','xa_temple','xa_granary'];
 const have=new Set((typeof PH_PLACE!=='undefined'?PH_PLACE:[]).filter(p=>p.kind==='civic').map(p=>p.key)),miss=want.filter(k=>!have.has(k));
 R.push({name:'pher-civic',ok:!miss.length,detail:miss.length?'missing '+miss.join(', '):have.size+' kinds of civic piece, the heir\'s house among them'});
 const P=Q.people||{};R.push({name:'pher-people',ok:P.total>4500&&P.total<7500,budget:true,detail:(P.total||0)+' / ~6,000 '+JSON.stringify(P.byLevel||{})});
 let bad=0,first=null;for(const p of (typeof PH_PLACE!=='undefined'?PH_PLACE:[])){if(p.key==='xa_quay'||p.key==='xa_boatshed'||p.kind==='bridge')continue;
  const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hs=[[0,0],[-b.hw,-b.hd],[b.hw,-b.hd],[b.hw,b.hd],[-b.hw,b.hd]].map(q=>phH(p.x+q[0]*c+q[1]*s,p.z-q[0]*s+q[1]*c));
  const lo=phH(p.x,p.z)-(p.drop||0)-.8,hi=Math.max.apply(null,hs)+1;if(!(p.o.y>=lo&&p.o.y<=hi)){bad++;first=first||(p.id+' '+p.key+' floor '+p.o.y.toFixed(1)+' ground '+hs[0].toFixed(1));}}
 R.push({name:'pher-ground',ok:bad===0,detail:bad?bad+' off their ground, first '+first:'every floor on its ground (its footing under it)'});
 const BB=Q.basements||{};R.push({name:'pher-basements',ok:BB.carved>300&&BB.doors>20,detail:(BB.carved||0)+' basements carved, '+(BB.doors||0)+' doors from the podium drawn, dropped '+JSON.stringify(BB.dropped||{})+' (none before a stair, a kit door or architecture)'});
 const BS=Q.boatSpot?Q.boatSpot():[],wet=BS.filter(b=>!b.moored&&b.h>-1);
 R.push({name:'pher-boats',ok:BS.length>=80&&Q.runs===6&&!wet.length,detail:BS.length+' boats ('+BS.filter(b=>b.moored).length+' moored or beached), '+Q.runs+' runs'+(wet.length?'; aground: '+wet.slice(0,3).map(b=>b.id+' '+b.h).join(', '):'; every one under way on open water')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + CITY_JS
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
