#!/usr/bin/env python3
"""Headless verification of the city of Qiblai. The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the city's own:

  qiblai-laid           the site laid on core/city (KCITY.squares) with no error, its walls, gates, monasteries, markets and the
                        four meditation gardens, over 1,500 placed (the owner's 'more gardens', 2026-11-11, left ~1,850)
  monastery-bearings    each of the eight monasteries within 10 degrees of its spoke's bearing from the Temple Mountain
                        (spoke i on i x 45 degrees clockwise from north): so each of the Rainbow Temple's banners faces its own
  people-by-ring        the residents by ring against kits/qiblai/PLAN.md section 3's table (clergy ~2,400, kora ~3,000, lay
                        ~6,000), within 15 % (reported as a budget until the owner calibrates it: settlements/qiblai/PLAN.md Q7d)
  xanadu-share          a third of the lay houses the Xanadu kit's (the owner, 2026-11-11), within 28-38 % (reported)
  interiors-on-demand   the great rooms (targets/city/90t-qc-interiors.js: the Rainbow Temple's sanctum, the Hall of the
                        Decree's council chamber, every monastery's assembly hall, each whole one's gate hall, a hostel dormitory:
                        19), built and furnished on demand: buildAll() builds every one, each furnished with every programme met
                        (IX.audit) and textured
  walk-in-rooms         a walker from the street (core/walk's reach, the rooms' doors opened) gets through each monastery's gate
                        to its court, gate hall and assembly hall, up the Rainbow Temple's terraces to its sanctum, and into
                        each other great room; every city gate both ways (from the city side and from the foot of its stair)
  walk-in               the front doors (the owner, 2026-11-16: "unlock the front doors so I can walk in"): for a house of each of
                        the 6 commonest built types, its drawn door shut blocks the doorway, open clears it, and a walker from the
                        street reaches every floor and stair of it (core/walk's reach over 90u's walk records)
  interiors-every-building  every lot building's ground storey (targets/city/90u-qc-lot-interiors.js): 85 % of the lots have a
                        shell and a programme; the 8 commonest types plan, draw and furnish with no failure, every piece textured

    KRATOR_GL=gpu python3 verify.py dist/qiblai.html --assert --views "Overview,From the south gate"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

CITY_JS = r"""
{const Q=window._qiblai||{};
 R.push({name:'qiblai-laid',ok:!Q.err&&Q.placed>1500&&Q.walls===6&&Q.monasteries===8&&Q.markets===4&&(Q.byKind||{}).meditation===4,
  detail:Q.err?('the site did not lay: '+Q.err):(Q.placed+' placed ('+JSON.stringify(Q.byKind)+'), '+Q.chunks+' chunks')});
 const by={};for(const p of (typeof QC_PLACE!=='undefined'?QC_PLACE:[]))if(p.kind==='monastery'){(by[p.spoke]=by[p.spoke]||[]).push(p);}
 const off=[];for(let s=0;s<8;s++){const L=by[s]||[];if(!L.length){off.push(s+': none');continue;}
  const x=L.reduce((a,p)=>a+p.x,0)/L.length-QC_LM.x,z=L.reduce((a,p)=>a+p.z,0)/L.length-QC_LM.z;
  let b=Math.atan2(x,-z)*180/Math.PI;if(b<0)b+=360;let d=Math.abs(b-s*45);d=Math.min(d,360-d);if(d>10)off.push(s+': '+b.toFixed(1)+' deg');}
 R.push({name:'monastery-bearings',ok:!off.length,detail:off.length?'off their spokes: '+off.join(', '):'all eight on their spokes (within 10 deg), the Rainbow Temple\'s banners facing them'});
 const P=Q.people||{},T={clergy:2400,kora:3000,lay:6000},bad=Object.keys(T).filter(k=>Math.abs((P[k]||0)-T[k])>.15*T[k]);
 R.push({name:'people-by-ring',ok:!bad.length,budget:true,detail:Object.keys(T).map(k=>k+' '+(P[k]||0)+' / '+T[k]).join(', ')+'; total '+(P.total||0)+' / ~12,000'});
 const sh=Q.xanaduShare||0;R.push({name:'xanadu-share',ok:sh>=.28&&sh<=.38,budget:true,detail:(sh*100).toFixed(1)+' % of the lay houses the Xanadu kit\'s (the owner: 33 %)'});
 const I0=window._qiblaiIx,pre=I0?I0.built:0,I=I0&&I0.buildAll?I0.buildAll():I0,X=I&&I.tex;
 R.push({name:'interiors-on-demand',ok:!!(I&&I.rooms.length>=100&&I.built===I.rooms.length&&I.byRoom.length>=60&&I.byRoom.every(r=>r.ok&&r.pieces>0)&&!I.fails.length&&X&&X.meshes&&X.mapped===X.meshes),
  detail:I?(I.rooms.length+' rooms ('+pre+' built before the check), '+I.pieces+' pieces, '+I.ms+' ms; '+I.byRoom.map(r=>r.room+' '+r.pieces).join(', ')+(I.fails.length?'; FAILS '+I.fails.join(' | '):'')+(X?'; textured '+X.mapped+'/'+X.meshes+(X.bare.length?' bare: '+X.bare.join(','):''):'')):'window._qiblaiIx missing (targets/city/90t-qc-interiors.js)'});
 const WR=I0&&I0.walkIn?I0.walkIn():null,wrb=WR&&WR.length?WR.filter(w=>!w.ok):[];
 R.push({name:'walk-in-rooms',ok:!!(WR&&WR.length>=100&&!wrb.length),
  detail:!WR?'window._qiblaiIx.walkIn missing (targets/city/90t-qc-interiors.js)':WR.error?WR.error:WR.length+' routes walked: the street through each monastery gate to its court and halls, each other room from its door'+
   (wrb.length?'; FAIL '+wrb.map(w=>w.at+' missed '+w.miss.join(', ')).join(' | '):'')});
 const OIL=window._qiblaiOil,nO=typeof QC_OIL!=='undefined'?QC_OIL.assets.length:0;
 R.push({name:'oilfield-and-mission',ok:!!(OIL&&nO>50&&OIL.assets===nO&&!OIL.errors.length&&OIL.poles>=40&&OIL.lamps>=20),
  detail:!OIL?'window._qiblaiOil missing (targets/city/90v-qc-oilfield.js)':OIL.assets+' / '+nO+' buildings (the Geomancers yard, wells and village, the Yuni mission), '+OIL.instances+' instances; the power line '+OIL.poles+' poles, '+OIL.lamps+' lamps'+(OIL.errors.length?'; ERRORS '+OIL.errors.slice(0,4).join(' | '):'')});
 const J0=window._qiblaiLix,J=J0&&J0.buildTypes?J0.buildTypes(8):J0,share=J?J.lots/Math.max(1,J.lots+J.noShell+J.noProgram):0;
 R.push({name:'interiors-every-building',ok:!!(J&&share>=.85&&J.built>=6&&!J.fails.length&&J.tex.meshes&&J.tex.mapped===J.tex.meshes),
  detail:J?(J.lots+' lots with an interior ('+(share*100).toFixed(0)+' %; '+J.noShell+' without a shell, '+J.noProgram+' without a programme), '+J.types+' types; the 8 commonest built in '+J.ms+' ms ('+JSON.stringify(J.byProgram)+'), textured '+J.tex.mapped+'/'+J.tex.meshes+(J.fails.length?'; FAILS '+J.fails.join(' | '):'')):'window._qiblaiLix missing (targets/city/90u-qc-lot-interiors.js)'});
 const WI=J0&&J0.walkIn?J0.walkIn(6):null,wb=WI&&WI.length?WI.filter(w=>!w.ok):[];
 R.push({name:'walk-in',ok:!!(WI&&WI.length>=4&&!wb.length),
  detail:!WI?'window._qiblaiLix.walkIn missing (targets/city/90u-qc-lot-interiors.js)':WI.error?WI.error:WI.length+' houses walked into from the street ('+WI.map(w=>w.key+' '+w.floors+' floors').join(', ')+')'+
   (wb.length?'; FAIL '+wb.map(w=>w.key+(w.shut?'':' door not blocking shut')+(w.open?'':' doorway blocked open')+(w.unreached.length?' unreached '+w.unreached.join(','):'')).join(' | '):'')});}
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
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
