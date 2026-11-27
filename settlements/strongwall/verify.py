#!/usr/bin/env python3
"""Headless verification of Strongwall's page (PLAN.md, S1). The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the fort's own:

  strongwall-laid    the march fort (kits/xanadu xa_fort_march, kept) placed and baked, its walks registered
  on-the-model       the ground is the scale model's: at the pin the model's bicubic height within 1 m of the cell's own, and the
                     drawn ground 300 m beyond the pad's ease the model's to 0.5 m
  fort-on-its-pad    the ground under the fort's lot (its corners, its middle) level at the pad's height to 5 cm, the pad's cut
                     and fill under 12 m
  fort-walks         every wall walk and stair of the fort reached from its stairs' feet (core/walk, xfReach)
  interiors-hollow-and-reach   (Xanadu's --interiors audit, on by default here; --no-interiors skips it) the fort's stacks hollow,
                     its rooms furnished, and every floor of xa_fort_march reached from its unlocked doors

    KRATOR_GL=gpu python3 verify.py dist/strongwall.html --assert --views "Overview,The Qiblai Gate"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

FORT_JS = r"""
if(typeof SW!=="undefined"){const Q=window._strongwall||{};
 R.push({name:'strongwall-laid',ok:!!Q.placed&&(window._instances|0)>1000&&Q.forts===1,
  detail:(Q.placed?'the march fort placed':'NOT placed')+', '+(window._instances|0)+' instances, '+(Q.forts|0)+' fort with walks; at x '+(Q.fort||[])[0]+', z '+(Q.fort||[])[1]+' (the gorge wall on the pin\'s row)'});
 {const P=Q.pin||{},ox=SW.box[2]+6+SW.EASE+300,oz=SW.z,dr=terrainH(ox,oz),mo=swModel(ox,oz);
  R.push({name:'on-the-model',ok:Math.abs((P.model||0)-(P.cell||0))<1&&Math.abs(dr-mo)<.5,
   detail:'at the pin the model gives '+P.model+' m against the cell\'s '+P.cell+' m; 300 m past the pad\'s ease the page draws '+dr.toFixed(2)+' m, the model '+mo.toFixed(2)+' m'});}
 {const L=Q.lotGround||[],off=L.map(h=>Math.abs(h-Q.pad)),bad=off.filter(d=>d>.05).length;
  R.push({name:'fort-on-its-pad',ok:L.length===5&&!bad&&Q.cut<12&&Q.fill<12,detail:'the pad at '+Q.pad+' m; under the lot\'s corners and middle '+L.join(', ')+' m'+(bad?' ('+bad+' OFF the pad)':'')+'; cut '+Q.cut+' m, fill '+Q.fill+' m'});}
 {const F=(typeof xfReach==='function'?xfReach():null)||[],bad=F.filter(q=>!q.floors||q.unreached.length||q.capped);
  R.push({name:'fort-walks',ok:F.length===1&&!bad.length,detail:F.map(q=>q.reached+' of '+q.floors+' walks and stairs reached'+(q.unreached.length?', NOT '+q.unreached.slice(0,4).join(', '):'')).join('; ')||'no walks registered (core/walk not on the page?)'});}}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + FORT_JS
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'
xv._voth_trades = lambda: {'name': 'voth-trades', 'ok': True, 'detail': 'the Xanadu kit\'s table (kits/xanadu): checked on its own sheet'}
# the interiors are on by default on this page (targets/fort/89xs): the audit runs unless --no-interiors, and every floor of the
# fort's 57 rooms must be reached from its doors (interiors-hollow-and-reach)
xv.INTERIORS_MUST = ['xa_fort_march']

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
    ap.add_argument("--interiors", action="store_true")   # settlements/xanadu/verify.py reads it (the hollow-wall audit): on by default here
    ap.add_argument("--no-interiors", action="store_true")
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    a.interiors = not a.no_interiors
    sys.exit(asyncio.run(xv.run(a)))
