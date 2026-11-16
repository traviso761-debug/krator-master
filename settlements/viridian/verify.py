#!/usr/bin/env python3
"""Headless verification of the Viridian sheet (step V3). The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with one invariant more:

  viridian-laid   every planned qb_vt_* def stands on the sheet at every variant, and the green monastery beside them

The records' lots, seeds and dress are checked headless by tests/test-vt-records.js.

    KRATOR_GL=gpu python3 verify.py dist/viridian-sheet.html --assert --views "Overview,Viridian Thought — the tea works"
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

PLANNED = ['qb_vt_wither', 'qb_vt_roll_fire', 'qb_vt_pack', 'qb_vt_tasting', 'qb_vt_drying', 'qb_vt_still', 'qb_vt_curing',
           'qb_vt_shade', 'qb_vt_log_yard', 'qb_vt_spring', 'qb_vt_grange', 'qb_vt_shelter', 'qb_vt_hermitage',
           'qb_vt_terrace_plot', 'qb_vt_physic']
SHEET_JS = r"""
{const want=%s,S=(typeof SITES!=='undefined'?SITES:[]),miss=[];let n=0;
 for(const k of want){const D=VERN.defs[k];if(!D){miss.push(k+' (no def)');continue;}const nv=D.nv==null?3:D.nv;
  for(let v=0;v<nv;v++){if(S.some(s=>s.key===k&&((s.o&&s.o.v)|0)===v))n++;else miss.push(k+' v'+v);}}
 const mono=S.some(s=>s.key==='qb_monastery'&&s.o&&s.o.v===3);
 R.push({name:'viridian-laid',ok:!miss.length&&mono,detail:n+' of the Order\'s builds on the sheet'+(miss.length?'; missing '+miss.slice(0,6).join(', '):'')+(mono?'; the green monastery beside them':'; the green monastery missing')});}
return R;}""" % ('[' + ','.join("'%s'" % k for k in PLANNED) + ']')
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + SHEET_JS
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
