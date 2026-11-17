#!/usr/bin/env python3
"""Headless verification of Nulab. The page is built on Xanadu's (build.py), so its probe (window._api), invariants and views are
Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py, with the survey's checks: samplers, the eye on the drawn
ground), with the town's own:

  nulab-laid      the town laid on core/city with no error: its lots (both instances: the town and the copper works), the
                  quarters' great pieces (the mound, the priests' compound, the healers' hall, the Warden's manor, the barracks,
                  the market, the tithe barn, the works' foundry), the harbour's quays and mole, the earthworks
  on-the-model    the ground is the scale model's: at the pin (px 443,1359) the drawn ground within 3 m of the model's, and that
                  within 25 m of the cell's 344 m (PLAN.md section 2.1)
  people          the town's residents against the owner's 20,000, within 15 %
  ring-laid       the near ring's eight villages laid on core/hamlet's Dalab row with no error, the farming ones with their fields
  water           the great lake (core/water open) and the Chimes Riba (core/water flow) drawn
  pending         the stand-ins for the pieces the Dalab set lacks (PLAN.md section 7), counted and named (a budget: they are
                  owed, KNOWN_ISSUES.md)

    KRATOR_GL=gpu python3 verify.py dist/nulab.html --assert --views "Overview,The mound,The harbour"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
{const K=window._nulab||{},B=K.byKind||{},E=K.earth||{},Q=K.byQuarter||{};
 R.push({name:'nulab-laid',ok:!K.err&&(K.lots||0)>1500&&(B.landmark||0)>=50&&(Q['the copper works']||0)>1000&&(K.mounds||0)>=6&&(K.cropPlots||0)>=80&&(K.townFarmParcels||0)>=600&&E.outerRuns>=4&&E.palisadePosts>=500&&E.quays>=10&&E.moles===2&&E.rings===3,
  detail:K.err?('the town did not lay: '+K.err):((K.lots||0)+' lots, '+(K.cropPlots||0)+' infill crop plots, '+(K.townFarmParcels||0)+' town field parcels, '+(K.extra||0)+' extra ('+JSON.stringify(B)+'), '+(K.chunks||0)+' chunks, '+(K.mounds||0)+' turf mounds/runs; made ground '+JSON.stringify(E))});
 const P=K.pin||{};R.push({name:'on-the-model',ok:Math.abs((P.drawn||0)-(P.model||0))<3&&Math.abs((P.model||0)-344)<25,detail:'at the pin the model gives '+P.model+' m, the page draws '+P.drawn+' m (the cell: 344 m)'});
 const p=K.people||0;R.push({name:'people',ok:Math.abs(p-20000)<=3000,detail:p+' residents / 20,000 (the owner, 2026-11-16): '+JSON.stringify(Q)});
 const rg=K.ring||[];R.push({name:'ring-laid',ok:rg.length===8&&rg.every(v=>!v.error&&v.records>=10),detail:rg.map(v=>v.id.replace(/^nl.ring./,'')+' '+v.records+(v.parcels?' +'+v.parcels+' parcels':'')+(v.error?' ('+v.error+')':'')).join(', ')});
 const W=K.water||{};R.push({name:'water',ok:!!(W.lake&&W.river&&W.riverPts>=4),detail:'the great lake '+(W.lake?'drawn':'missing')+', the Chimes Riba '+(W.river?'drawn ('+W.riverPts+' points)':'missing')});
 R.push({name:'pending',ok:true,budget:true,detail:(K.standins||0)+' stand-ins for the pieces the Dalab set lacks: '+JSON.stringify(K.standinKeys||{})+'; garden trees and plants owed (the Dalab biome hook): '+JSON.stringify(K.owed||{})});}
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
    ap.add_argument("--interiors", action="store_true")
    a = ap.parse_args([os.path.abspath(x) if x.endswith('.html') and os.path.exists(x) else x for x in sys.argv[1:]])
    sys.exit(asyncio.run(xv.run(a)))
