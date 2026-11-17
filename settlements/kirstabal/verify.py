#!/usr/bin/env python3
"""Headless verification of Kirstabal. The page is built on Xanadu's (build.py), so its probe (window._api), invariants and
views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with the town's own:

  kirstabal-laid     the town laid on core/city with no error: its lots, the landmarks (the seat, the barracks, the generator,
                     the Two Horns, the serai, the latex house, the tea factory), the harbour (quays, mole, lighthouse), the White
                     Monastery's house and the bridge; nothing drawn as a stand-in
  walled             the town wall (the walled square after Chiang Mai, 2026-11-17): its pieces drawn, four named gates, the
                     four corner bastions, its runs all round
  people             the town's residents against PLAN.md's 3,000, within 15 %
  ring-laid          Kirstabal's ring (its four villages) and the shore's fishing hamlet Jal, laid on core/hamlet with no error
  water              the Lower Xanadu Lake (core/water open) and Keb Riwa (core/water flow, from the lip to the mouth) drawn

    KRATOR_GL=gpu python3 verify.py dist/kirstabal.html --assert --views "Overview,The harbour"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

TOWN_JS = r"""
{const K=window._kirstabal||{},B=K.byKind||{};
 R.push({name:'kirstabal-laid',ok:!K.err&&(K.lots||0)>250&&(B.landmark||0)>=10&&(B.quay||0)>=8&&(B.mole||0)>=10&&B.lighthouse===1&&B.monastery===1&&(B.bridge||0)>=8&&!K.standins,
  detail:K.err?('the town did not lay: '+K.err):((K.lots||0)+' lots, '+(K.extra||0)+' of the town\'s own pieces ('+JSON.stringify(B)+'), '+(K.chunks||0)+' chunks, '+(K.standins||0)+' stand-ins')});
 const Wl=K.wall||{};R.push({name:'walled',ok:(B.wall||0)>=60&&Wl.gates===4&&Wl.named===4&&Wl.corners===4&&Wl.runs>=8,
  detail:(B.wall||0)+' wall pieces: '+(Wl.names||[]).join(', ')+'; '+(Wl.corners||0)+' corner bastions, '+(Wl.towers||0)+' buttresses, '+(Wl.runs||0)+' runs'});
 const p=K.people||0;R.push({name:'people',ok:Math.abs(p-3000)<=450,detail:p+' residents / 3,000 (PLAN.md section 2)'});
 const rg=K.ring||[];R.push({name:'ring-laid',ok:rg.length===5&&rg.every(v=>!v.error&&v.records>=20),detail:rg.map(v=>v.id.replace(/^ks.ring.|^ll.hamlet./,'')+' '+v.records+(v.error?' ('+v.error+')':'')).join(', ')});
 const W=K.water||{};R.push({name:'water',ok:!!(W.lake&&W.river&&W.riverPts>=10),detail:'the lake '+(W.lake?'drawn':'missing')+', Keb Riwa '+(W.river?'drawn ('+W.riverPts+' points)':'missing')});}
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
