#!/usr/bin/env python3
"""Headless verification of the town of Thalaba. The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the town's own:

  thalaba-laid       the site laid on core/city with no error: the house blocks filled (over 200 houses), the civic buildings
                     round the square (the temple, the Rare Devisers' house (tb_devisers), the Two Horns' factor, the
                     granaries, the caravan yard), the Dalab mission's three pieces from the Dalab set
  on-the-model       the ground is the scale model's: at the pin the drawn ground within 3 m of the model's bicubic height, and
                     that within 25 m of the cell's 1,507 m (settlements/thalaba/PLAN.md section 1)
  people             the town's residents against the plan's 2,400 (the tune's T.thalaba), within 15 % (reported as a budget
                     until the owner calibrates the houses' households)
  water-on-core      the leat a core/water flow falling all its length, the seven springs and the tank still water

    KRATOR_GL=gpu python3 verify.py dist/thalaba.html --assert --views "Overview,The market square"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
if(typeof TB_PLACE!=="undefined"){const Q=window._thalaba||{},K=Q.byKind||{};   /* the town target only: the pieces sheet has no plan */
 const civic=['temple','devisers','horns','granary','yard'].filter(k=>!(K[k]>0));
 R.push({name:'thalaba-laid',ok:!Q.err&&(K.house||0)>200&&!civic.length&&Q.devisers===1&&(K.dalab||0)===3,
  detail:Q.err?('the site did not lay: '+Q.err):(Q.placed+' placed ('+JSON.stringify(K)+'), '+Q.chunks+' chunks'+(civic.length?'; MISSING '+civic.join(', '):''))});
 const P=Q.pin||{};R.push({name:'on-the-model',ok:Math.abs((P.drawn||0)-(P.model||0))<3&&Math.abs((P.model||0)-1507)<25,
  detail:'at the pin the model gives '+P.model+' m, the page draws '+P.drawn+' m (the cell: 1,507 m)'});
 const pp=Q.people||{};R.push({name:'people',ok:Math.abs((pp.town||0)-2400)<=.15*2400,budget:true,
  detail:'the town '+(pp.town||0)+' / 2,400; the houses beside it '+(pp.houses||0)+' (the Devisers 40, the Two Horns 20, the Dalab mission 30)'});
 const Wt=window._tbWater||{},L=(typeof TB_LEAT!=='undefined'?TB_LEAT:[]);let falls=L.length>4;for(let i=1;i<L.length;i++)if(!(L[i][2]<L[i-1][2]))falls=false;
 R.push({name:'water-on-core',ok:!!(Wt.flows===1&&Wt.stills===8&&falls&&typeof WATER!=='undefined'&&WATER.at),
  detail:(Wt.flows||0)+' flow, '+(Wt.stills||0)+' still; the leat '+L.length+' points'+(falls?', falling all its length':', NOT falling all its length')});}
return R;}"""
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + TOWN_JS
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
    ap.add_argument("--interiors", action="store_true")   # settlements/xanadu/verify.py reads it (the hollow-wall audit)
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
