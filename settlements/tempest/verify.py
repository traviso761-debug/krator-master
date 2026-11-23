#!/usr/bin/env python3
"""Headless verification of the House of the Tempest's page (PLAN.md, step 1). The page is built on Xanadu's (build.py), so its
probe (window._api), invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the
House's own:

  tempest-laid       both wards (src/80u: xa_tempest_outer, xa_tempest_inner 4 m up) and the violet great monastery (kits/qiblai
                     qb_monastery, o.v 6) placed and baked, both wards drawn, each ward's walks registered
  tempest-rules      the plan the page drew keeps the fort asset's rules and the concentric house's (TEMPEST.check: none broken)
  on-the-model       the ground is the scale model's: at the pin the model's bicubic height within 1 m of the cell's own, and the
                     drawn ground 300 m beyond the pad's ease the model's to 0.5 m
  house-on-its-pad   the ground under the lot's corners and middle level at the pad's height to 5 cm, the cut and fill under 12 m
  house-walks        every wall walk and tower stair of both wards reached from its stairs' feet (core/walk, xfReach)

    KRATOR_GL=gpu python3 verify.py dist/tempest.html --assert --views "Overview,The Main Gate"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

HOUSE_JS = r"""
if(typeof TPS!=="undefined"){const Q=window._tempest||{},D=Q.drawn||{};
 R.push({name:'tempest-laid',ok:!!Q.placed&&!!Q.hosted&&!!D.outer&&!!D.inner&&(window._instances|0)>1000&&Q.forts===2,
  detail:(Q.placed?'both wards placed':'a ward NOT placed')+', the violet monastery '+(Q.hosted?'placed':'NOT placed')+'; drawn: outer '+!!D.outer+', inner '+!!D.inner+'; '+(window._instances|0)+' instances, '+(Q.forts|0)+' wards with walks; '+Q.towers+' towers, '+Q.buildings+' buildings'});
 R.push({name:'tempest-rules',ok:Array.isArray(Q.rules)&&!Q.rules.length,detail:Q.rules&&Q.rules.length?Q.rules.slice(0,4).join('; '):'the fort asset\'s rules and the concentric ones all kept'});
 {const P=Q.pin||{},ox=TPS.box[2]+6+TPS.EASE+300,oz=TPS.z,dr=terrainH(ox,oz),mo=tpModel(ox,oz);
  R.push({name:'on-the-model',ok:Math.abs((P.model||0)-(P.cell||0))<1&&Math.abs(dr-mo)<.5,
   detail:'at the pin the model gives '+P.model+' m against the cell\'s '+P.cell+' m; 300 m past the pad\'s ease the page draws '+dr.toFixed(2)+' m, the model '+mo.toFixed(2)+' m'});}
 {const L=Q.lotGround||[],off=L.map(h=>Math.abs(h-Q.pad)),bad=off.filter(d=>d>.05).length;
  R.push({name:'house-on-its-pad',ok:L.length===5&&!bad&&Q.cut<12&&Q.fill<12,detail:'the pad at '+Q.pad+' m; under the lot\'s corners and middle '+L.join(', ')+' m'+(bad?' ('+bad+' OFF the pad)':'')+'; cut '+Q.cut+' m, fill '+Q.fill+' m'});}
 {const F=(typeof xfReach==='function'?xfReach():null)||[],bad=F.filter(q=>!q.floors||q.unreached.length||q.capped);
  R.push({name:'house-walks',ok:F.length===2&&!bad.length,detail:F.map(q=>q.reached+' of '+q.floors+' walks and stairs reached'+(q.unreached.length?', NOT '+q.unreached.slice(0,4).join(', '):'')).join('; ')||'no walks registered (core/walk not on the page?)'});}}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + HOUSE_JS
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
    ap.add_argument("--interiors", action="store_true")   # settlements/xanadu/verify.py reads it (the hollow-wall audit): the House has no interiors yet (KNOWN_ISSUES.md)
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
