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
  of-works     the mill's weir and the three fish weirs (the kit's pieces) and the Spray Stair's flights drawn; none of the town's buildings in the precinct
  of-ferry     the ferry raft registered with core/tags as a vessel (a ferry, pole-pushed, a raft hull); the ford as infrastructure
  of-house     the Iridescent Order's house: every piece with its def and drawn, the great monastery in the Turquoise dress

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
 const want=['xa_ford','xa_ferry_raft','xa_fish_racks','xa_weir','xa_fish_weir','xa_caravanserai','xa_customs_house','xa_watch','xa_temple','xa_guild_farm','xa_granary','xa_watermill','xa_river_span','xa_dugout','xa_farm'];
 const have=new Set(P.filter(p=>p.kind!=='house').map(p=>p.key)),miss=want.filter(k=>!have.has(k));
 R.push({name:'of-hosts',ok:!miss.length,detail:miss.length?'missing '+miss.join(', '):have.size+' kinds of host, the han and the toll house among them'});
 const N=Q.people||{};R.push({name:'of-people',ok:N.total>N.tune*.75&&N.total<N.tune*1.25,budget:true,detail:(N.total||0)+' / the tune\'s '+(N.tune||'?')});
 let bad=0,first=null;for(const p of P){if(p.kind==='bridge'||p.kind==='boat')continue;
  const b=p.bo,c=Math.cos(p.ry),s=Math.sin(p.ry),hs=[[0,0],[-b.hw,-b.hd],[b.hw,-b.hd],[b.hw,b.hd],[-b.hw,b.hd]].map(q=>ofH(p.x+q[0]*c+q[1]*s,p.z-q[0]*s+q[1]*c));
  const lo=ofH(p.x,p.z)-(p.drop||0)-.8,hi=Math.max.apply(null,hs)+1;if(!(p.o.y>=lo&&p.o.y<=hi)){bad++;first=first||(p.id+' '+p.key+' floor '+p.o.y.toFixed(1)+' ground '+hs[0].toFixed(1));}}
 R.push({name:'of-ground',ok:bad===0,detail:bad?bad+' off their ground, first '+first:'every floor on its ground (its footing under it)'});
 const Wk=Q.works||{},PR=typeof OF!=='undefined'?OF.PRECINCT:null,inPr=PR?P.filter(p=>p.kind!=='order'&&p.kind!=='bridge'&&p.x>PR.x[0]&&p.x<PR.x[1]&&p.z>PR.z[0]&&p.z<PR.z[1]).length:-1;
 const nW=P.filter(p=>p.key==='xa_weir'&&p.G).length,nF=P.filter(p=>p.key==='xa_fish_weir'&&p.G).length;
 R.push({name:'of-works',ok:Wk.stone>40&&nW===1&&nF===3&&inPr===0,detail:(Wk.stone||0)+' steps of the Spray Stair, the mill\'s weir '+nW+', fish weirs '+nF+' (the kit\'s pieces, drawn), '+inPr+' of the town\'s buildings in the precinct'});
 /* the ferry raft (kits/xanadu/extra/88j) registered with core/tags as a vessel: a pole-pushed raft, a ferry; the ford as infrastructure */
 {const KT=typeof KTAGS!=='undefined'&&KTAGS.page,V=KT?KT.query({key:'xa_ferry_raft'}):[],F=KT?KT.query({key:'xa_ford'}):[],r=V[0],t=r&&r.tags||{};
  const ok=!!r&&r['class']==='vessel'&&[].concat(t.propulsion||[]).indexOf('pole')>=0&&t.hull==='raft'&&[].concat(t.types||[]).indexOf('ferry')>=0&&!!F[0]&&F[0]['class']==='infrastructure';
  R.push({name:'of-ferry',ok,detail:r?(r.id+' class '+r['class']+', '+JSON.stringify({types:t.types,propulsion:t.propulsion,hull:t.hull,crew:t.crew})+'; the ford '+(F[0]?F[0].id+' class '+F[0]['class']:'missing')):'the ferry raft is not in the page\'s registry'});}
 /* the river on core/water (90w): the flows and the fall drawn, the CPU twin's height at the ford the ground's water, its current downstream */
 {const W=window._ofRiver,f=W&&W.flowAtFord,h=W&&W.heightAtFord;
  R.push({name:'of-river',ok:!!W&&W.drawn&&h!=null&&Math.abs(h-W.waterAtFord)<.3&&!!f&&f[2]>0&&f[1]<0&&(window._ofPaddyWater|0)>60,
   detail:!W?'the river is not on core/water':'flows and fall drawn '+W.drawn+', height at the ford '+(h==null?'none':h.toFixed(2))+' / '+W.waterAtFord.toFixed(2)+', current '+JSON.stringify(f&&f.map(v=>+v.toFixed(2)))+', paddies with water '+(window._ofPaddyWater|0)});}
 /* the house's interiors (90s): every building with a storey gets one; the commonest types built and textured; a walker gets in */
 {const J0=window._ofIx,J=J0&&J0.buildTypes?J0.buildTypes(40):J0,WI=J0&&J0.walkIn?J0.walkIn(5):null,wb=WI&&WI.length?WI.filter(w=>!w.ok):[];
  R.push({name:'of-interiors',ok:!!(J&&!J0.error&&J.lots>=20&&J.built>=6&&J.hall===1&&J.bowProps>=14&&J0.yardProps===2&&!J.fails.length&&J.tex.meshes&&J.tex.mapped===J.tex.meshes&&WI&&WI.length>=4&&!wb.length),
   detail:!J?'window._ofIx missing (targets/town/90s-of-interiors.js)':J0.error?J0.error:J.lots+' buildings with an interior ('+J.noShell+' without a shell, '+J.noProgram+' without a programme, '+J.skipped+' open, '+J.noStorey+' with no storey), '+J.ranges+' monks\' ranges, the hall '+J.hall+' with '+J.bowProps+' of the blueprint\'s pieces (the yard '+J0.yardProps+'), '+J.types+' types, '+J.built+' built ('+JSON.stringify(J.byProgram)+'), textured '+J.tex.mapped+'/'+J.tex.meshes+
    (J.fails.length?'; FAILS '+J.fails.join(' | '):'')+'; walked into: '+(WI&&WI.map?WI.map(w=>w.key+' '+w.floors+' floors'+(w.ok?'':' FAIL'+(w.shut?'':' door not shut')+(w.open?'':' doorway blocked')+(w.unreached.length?' unreached '+w.unreached.join(','):''))).join(', '):JSON.stringify(WI))});}
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
