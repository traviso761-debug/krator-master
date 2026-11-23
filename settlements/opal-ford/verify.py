#!/usr/bin/env python3
"""Headless verification of Ōpal-Phōrḍ's town (PLAN.md step OF1). The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py, with the survey's
checks: tools/checks_optin.json), with the town's own:

  of-laid      the town laid on core/city with no error, over 250 placed, every record drawn by the kit (none failed to place)
  of-hosts     the han, the toll house, the Golden Tears' post, the temple, the grain office, the granaries, the watermill, the
               footbridge's spans, the dugouts, the terraces placed
  of-people    the households the tune's 1,500 (XAN_TUNE.opalford) within 25 % (reported as a budget)
  of-ground    every building's floor on its ground: no lower than the ground at its middle less its footing, no higher than
               the ground's highest corner plus a metre (the spans and the boats stand at the water)
  of-works     the ford's causeway and stones, the mill's weir and the fish weirs drawn; the precinct kept clear

The plan's own checks (no overlap, nothing on a way, in the river, on a paddy or in the precinct, the same twice) are the node
test's: node settlements/opal-ford/tests/test-of-site.js.

    KRATOR_GL=gpu python3 verify.py dist/opal-ford.html --assert --views "Overview,The ford"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

CITY_JS = r"""
{const Q=window._opalford||{},P=typeof OF_PLACE!=='undefined'?OF_PLACE:[];
 R.push({name:'of-laid',ok:!Q.err&&Q.placed>250&&Q.failed===0,
  detail:Q.err?('the plan did not lay: '+Q.err):(Q.placed+' placed '+JSON.stringify(Q.byKind||{})+', '+Q.chunks+' chunks, '+Q.failed+' not drawn'+(Q.failed?': '+Q.fails.join(' | '):''))});
 const want=['xa_caravanserai','xa_customs_house','xa_watch','xa_temple','xa_guild_farm','xa_granary','xa_watermill','xa_river_span','xa_dugout','xa_farm'];
 const have=new Set(P.filter(p=>p.kind!=='house').map(p=>p.key)),miss=want.filter(k=>!have.has(k));
 R.push({name:'of-hosts',ok:!miss.length,detail:miss.length?'missing '+miss.join(', '):have.size+' kinds of host, the han and the toll house among them'});
 const N=Q.people||{};R.push({name:'of-people',ok:N.total>N.tune*.75&&N.total<N.tune*1.25,budget:true,detail:(N.total||0)+' / the tune\'s '+(N.tune||'?')});
 let bad=0,first=null;for(const p of P){if(p.kind==='bridge'||p.kind==='boat')continue;
  const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hs=[[0,0],[-b.hw,-b.hd],[b.hw,-b.hd],[b.hw,b.hd],[-b.hw,b.hd]].map(q=>ofH(p.x+q[0]*c+q[1]*s,p.z-q[0]*s+q[1]*c));
  const lo=ofH(p.x,p.z)-(p.drop||0)-.8,hi=Math.max.apply(null,hs)+1;if(!(p.o.y>=lo&&p.o.y<=hi)){bad++;first=first||(p.id+' '+p.key+' floor '+p.o.y.toFixed(1)+' ground '+hs[0].toFixed(1));}}
 R.push({name:'of-ground',ok:bad===0,detail:bad?bad+' off their ground, first '+first:'every floor on its ground (its footing under it)'});
 const Wk=Q.works||{},PR=typeof OF!=='undefined'?OF.PRECINCT:null,inPr=PR?P.filter(p=>p.kind!=='order'&&p.kind!=='bridge'&&p.x>PR.x[0]&&p.x<PR.x[1]&&p.z>PR.z[0]&&p.z<PR.z[1]).length:-1;
 R.push({name:'of-works',ok:Wk.stone>40&&Wk.stakes>100&&inPr===0,detail:(Wk.stone||0)+' stones of the ford and the weir, '+(Wk.stakes||0)+' stakes, '+inPr+' of the town\'s buildings in the precinct'});
 const Ho=Q.house||{},mon=P.find(p=>p.key==='qb_monastery'),hd=P.filter(p=>p.kind==='order'||p.kind==='bridge');
 R.push({name:'of-house',ok:Ho.placed>=40&&!(Ho.errs||[]).length&&!!mon&&mon.v===4&&!!mon.G,detail:(Ho.placed||0)+' pieces of the Iridescent Order\'s house, '+hd.filter(p=>p.G).length+' drawn'+((Ho.errs||[]).length?', no def: '+Ho.errs.join(', '):'')+(mon?', the great monastery in dress '+mon.v:', no great monastery')});}
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
