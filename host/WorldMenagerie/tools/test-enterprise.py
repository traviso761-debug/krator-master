#!/usr/bin/env python3
"""Fly every Enterprise mission through, headless, and fail any that throws or stalls.

  tools/test-enterprise.py                 every mission kind, three at a time
  tools/test-enterprise.py rescue swarm    only these kinds
  tools/test-enterprise.py -j 1            one at a time

Each kind loads enterprise.html with #mission=<kind>&mauto (src/enterprise/orders.js): the orders are accepted at
once, and a test captain presses each step's own button whenever the ship is not busy, fights whatever turns up and
energises where a step has no button. The page reports (window._details.orders) the missions finished, the step it
is on and any error; it ends the probe early (window.__probeDone) once the mission is done or something has thrown.
A mission passes when it is done with no error on the page. The seed is fixed (#mseed), so a run is repeatable up to
the frame timing of the machine; a full run takes about a quarter of an hour.
"""
import argparse
import concurrent.futures as cf
import json
import os
import subprocess
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE = os.path.join(ROOT, "tools", "probe.py")
KINDS = ["rescue", "survey", "escort", "defend", "wormhole", "deliver", "patrol", "contact", "probe", "evacuate",
         "swarm", "storm", "relic", "hunt", "limp"]


def run(kind, budget, seed):
    out = os.path.join(tempfile.gettempdir(), f"enterprise-mission-{os.getpid()}-{kind}.json")
    cmd = [sys.executable, PROBE, "--page", os.path.join(ROOT, "enterprise.html"), "--no-build", "--quiet",
           "--wait", str(budget + 60), "--settle", str(budget),
           "--hash", f"mission={kind}&mauto&mseed={seed}&warpf=9", "--json", out]
    t = time.monotonic()
    p = subprocess.run(cmd, capture_output=True, text=True)
    rep = {}
    try:
        rep = json.load(open(out, encoding="utf-8"))
        os.remove(out)
    except Exception:
        pass
    o = ((rep.get("details") or {}).get("orders")) or {}
    bad = []
    if p.returncode != 0 or not rep:
        tail = (p.stdout + p.stderr).strip().splitlines()
        bad.append(tail[-1] if tail else "probe failed")
    if (rep.get("errors") or "").strip():
        bad.append("errors on the page: " + rep["errors"].strip()[:300])
    for e in o.get("errors") or []:
        bad.append("error: " + e)
    if rep and kind not in (o.get("done") or []):
        bad.append(f"not finished after {o.get('t')}s: step {(o.get('step') or 0) + 1}/{o.get('of')} "
                   f"for {o.get('stepFor')}s: {o.get('stuck')!r}")
    return kind, bad, time.monotonic() - t, o


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("kinds", nargs="*", help="mission kinds to fly (default: all)")
    ap.add_argument("-j", type=int, default=3, help="missions at a time")
    ap.add_argument("--budget", type=int, default=480, help="seconds a mission may take")
    ap.add_argument("--seed", default="test", help="the orders' seed (#mseed)")
    a = ap.parse_args()
    kinds = a.kinds or KINDS
    unknown = [k for k in kinds if k not in KINDS]
    if unknown:
        sys.exit("unknown mission kind: " + ", ".join(unknown) + " (one of: " + ", ".join(KINDS) + ")")
    fails = 0
    with cf.ThreadPoolExecutor(a.j) as ex:
        for kind, bad, secs, o in ex.map(lambda k: run(k, a.budget, a.seed), kinds):
            if bad:
                fails += 1
                print(f"FAIL {kind:9} {secs:5.0f}s  " + "; ".join(bad), flush=True)
            else:
                print(f"ok   {kind:9} {secs:5.0f}s  mission time {o.get('t')}s, hull {o.get('hull')}%", flush=True)
    print(f"{len(kinds) - fails}/{len(kinds)} missions flown through")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
