#!/usr/bin/env python3
"""Headless verification of the Marches' forts sheet (PLAN.md, M1). The page is built on Xanadu's (build.py), so its probe
(window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py, with the survey's
checks: samplers, the eye against the drawn ground), with the forts' own:

  marches-records    the two forts drawn are XAN_TUNE's march.w and march.s, re-read on the page (XAN_TUNE.valley): name, px,
                     150 people, kept; the garrison sums to the tune's people with T.muskets' musketeers
  fort-rules         XFORT.check of the watch plan is [], and the plan the fort def draws (80g XF_PLANS.watch) is that plan
  marches-laid       each fort in its three states (kept, damaged, ruined), a relay post with each in the fort's state, the works
                     with the kept and damaged fort, the road with all; the keep's beacon basket and the gate tower's one gun in the plan
  marches-works-clear  no two sites of a fort's ensemble overlap (their footprints), but the road, which starts at the gate
  fort-walks         every standing fort's wall walks, flights, tower tops and stairs reached from its stairs' feet (core/walk, xfReach)
  marches-ruins-watched  every damaged and ruined fort and post is watched by core/ruins (the harness then asserts nothing floats
                     and every wreck lies on its lowest points: the "ruins:" lines, with core/ruins' own negative)

    python3 verify.py dist/marches.html --assert --views "Both forts in their three states,The west fort kept"
    KRATOR_GL=gpu python3 verify.py dist/marches.html --assert --all-views
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools'))
import harness                                      # noqa: E402  (imported at the top: the watchdog and the verify cache)
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

# the survey's checks (items 27, 28) as this build's, not Xanadu's: its own folder for tools/checks_optin.json, and SURVEY
_vp = xv.verify_page
def _verify_page(html, here=None, **kw):
    kw.setdefault('checks', harness.SURVEY)
    return _vp(html, here=HERE, **kw)
xv.verify_page = _verify_page

FORT_JS = r"""
if(typeof MR!=="undefined"){const Q=window._marches||{},PL=Q.placed||[],T=XAN_TUNE,V=T.valley({sites:[]},{});
 {const bad=[];MR.forts.forEach(F=>{const s=V.settlements.find(q=>q.id===F.id),g=F.garrison,n=g.household+g.foot+g.horse+g.musketeers+g.gunners+g.postRota;
   if(!s){bad.push(F.id+' not in the tune');return;}
   if(F.name!==s.name||F.people!==s.people||F.state!==s.state)bad.push(F.id+' differs from the tune');
   if(F.px[0]!==Math.round(s.x/2000+1191)||F.px[1]!==Math.round(s.z/2000+1569))bad.push(F.id+' px');
   if(n!==s.people||g.musketeers!==(T.muskets.men[F.id]|0))bad.push(F.id+' garrison '+n+', musketeers '+g.musketeers);});
  R.push({name:'marches-records',ok:MR.forts.map(F=>F.id).join(',')==='march.w,march.s'&&!bad.length,
   detail:MR.forts.map(F=>F.id+' '+F.name+' at '+F.px.join(',')+', '+F.people+' '+F.state+', '+F.musketeers+' musketeers').join('; ')+(bad.length?'; BAD '+bad.join(', '):'')});}
 {const strip=P=>JSON.stringify(P,(k,v)=>k==='S'?undefined:v),same=strip(XF_PLANS.watch)===strip(MR.P),F=XFORT.check(XF_PLANS.watch);
  R.push({name:'fort-rules',ok:!MR.faults.length&&!F.length&&same,detail:'XFORT.check: '+(MR.faults.length?MR.faults.slice(0,3).join(' | '):'[]')+'; the drawn plan '+(same?'is':'is NOT')+' the checked plan ('+MR.P.curtains.length+' curtains, '+MR.P.towers.length+' towers, '+MR.P.buildings.length+' buildings)'});}
 {const out=[],has=(k,f,st)=>PL.filter(p=>p.key===k&&p.fort===f&&p.state===st&&p.regs>0).length;
  MR.forts.forEach(F=>MR.states.forEach((st,v)=>{
   if(PL.filter(p=>p.key==='xa_fort_watch'&&p.fort===F.id&&p.state===st&&p.v===v&&p.regs>0).length!==1)out.push(F.id+' fort '+st);
   if(PL.filter(p=>p.key==='xa_fort_post'&&p.fort===F.id&&p.state===st&&p.v===v&&p.regs>0).length!==1)out.push(F.id+' post '+st);
   if(has('mr_road',F.id,st)!==1)out.push(F.id+' road '+st);
   ['mr_wayside_shrine','xa_corral','mr_cistern'].forEach(k=>{const n=has(k,F.id,st);if(n!==(v<2?1:0))out.push(F.id+' '+k+' '+st+' '+n);});}));
  const P=MR.P,beacon=P.beacon&&P.beacon.on==='keep'&&P.buildings.some(b=>b.kind==='keep'&&b.beacon),gun=P.guns.length===1&&P.guns[0].gate==='gate';
  R.push({name:'marches-laid',ok:!out.length&&beacon&&gun&&(window._instances|0)>1000,detail:PL.length+' sites placed ('+PL.filter(p=>p.key==='xa_fort_watch').length+' forts, '+PL.filter(p=>p.key==='xa_fort_post').length+' posts), '+(window._instances|0)+' instances; the beacon on the keep '+(beacon?'yes':'NO')+', one gun on the gate tower '+(gun?'yes':'NO')+(out.length?'; MISSING '+out.slice(0,6).join(', '):'')});}
 {const out=[];MR.forts.forEach(F=>MR.states.forEach(st=>{const E=PL.filter(p=>p.fort===F.id&&p.state===st),box=p=>[p.x-p.fw/2,p.z-p.fd/2,p.x+p.fw/2,p.z+p.fd/2];
   for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const a=E[i],b=E[j];if(a.key==='mr_road'&&b.key==='xa_fort_watch'||b.key==='mr_road'&&a.key==='xa_fort_watch')continue;
    const p=box(a),q=box(b);if(Math.min(p[2],q[2])-Math.max(p[0],q[0])>.05&&Math.min(p[3],q[3])-Math.max(p[1],q[1])>.05)out.push(F.id+' '+st+' '+a.key+' x '+b.key);}}));
  R.push({name:'marches-works-clear',ok:!out.length,detail:out.length?out.slice(0,6).join('; '):'every fort, work and post of each ensemble on its own ground (the road from the gate excepted)'});}
 {const F=(typeof xfReach==='function'?xfReach():null)||[],bad=F.filter(q=>!q.floors||q.unreached.length||q.capped);
  R.push({name:'fort-walks',ok:F.length===4&&!bad.length,detail:F.map(q=>q.state+' '+q.reached+'/'+q.floors+(q.unreached.length?' NOT '+q.unreached.slice(0,3).join(', '):'')).join('; ')||'no walks registered (core/walk not on the page?)'});}
 {const W=Q.watched||[];R.push({name:'marches-ruins-watched',ok:W.length===8&&typeof KRUINS!=='undefined',detail:W.length+' watched: '+W.join('; ')});}}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + FORT_JS
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
    ap.add_argument("--interiors", action="store_true")   # settlements/xanadu/verify.py reads it (the hollow-wall audit): off here
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
