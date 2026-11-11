#!/usr/bin/env python3
"""Headless verification of the Qiblai kit sheet. The page is built on Xanadu's (build.py), so its probe (window._api),
invariants and views are Xanadu's, and settlements/xanadu/verify.py runs it (on tools/harness.py), with one invariant more:
the mixed streets (VASSAL-KITS.md, "The mixed-street check"), where QB_streetAudit() (src/89q9-qb-street.js) fails on two
neighbouring houses whose drawn footprints overlap.

    KRATOR_GL=gpu python3 verify.py dist/qiblai.html --assert --views "Overview,Mixed street" --out shots
"""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
XV = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'xanadu', 'verify.py')
_spec = importlib.util.spec_from_file_location('xanadu_verify', XV)
xv = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(xv)   # its argparse block is under __main__: nothing runs on import

# Xanadu's invariants, then the mixed streets' (the audit returns rows in the same {name, ok, detail} shape)
xv.ASSERT_JS = xv.ASSERT_JS.rstrip()[:-len('return R;}')] + \
    "if(typeof QB_streetAudit==='function')for(const r of QB_streetAudit())R.push(r);\n" + \
    "else R.push({name:'mixed-street',ok:false,detail:'QB_streetAudit missing (src/89q9-qb-street.js)'});\nreturn R;}"
assert xv.ASSERT_JS.endswith('return R;}'), 'settlements/xanadu/verify.py ASSERT_JS no longer ends with return R;}'

if __name__ == '__main__':
    import argparse, asyncio
    sys.argv = [XV] + [os.path.abspath(a) if a.endswith('.html') and os.path.exists(a) else a for a in sys.argv[1:]]
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
    sys.exit(asyncio.run(xv.run(ap.parse_args(sys.argv[1:]))))
