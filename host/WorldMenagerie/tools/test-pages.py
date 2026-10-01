#!/usr/bin/env python3
"""Run every page in headless Firefox and check it against its golden.

  tools/test-pages.py              every golden and every smoke page, three at a time
  tools/test-pages.py blame iziz   only the goldens and pages whose name starts with one of these
  tools/test-pages.py -j 1         one at a time (slower, but a slow machine may need it)

A golden (tests/golden/<page>-<seed>.json) is a page's layout fingerprint: build the page at that seed and
the layout must hash the same. It may also say which "page" file, "query" and "hash" it was made with (the
second Iziz is iziz.html with ?city=iziz-b); otherwise the page is <page>.html and the seed is the number in the
file name. A smoke page has no layout to fingerprint - the prose pages, the front page - and only has to load
without an error on it.

Before any of that, src/*/build.js must be current with its stages (tools/build-page.py --check): the probe
no longer regenerates them, so a stale one fails here instead of being quietly rebuilt.
"""
import argparse
import concurrent.futures as cf
import glob
import json
import os
import re
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE = os.path.join(ROOT, "tools", "probe.py")
# pages with nothing to fingerprint: they only have to load clean
SMOKE = ["index.html", "krator.html", "The-Izani-Tongue_2.html"]


def jobs():
    out = []
    for g in sorted(glob.glob(os.path.join(ROOT, "tests", "golden", "*-*.json"))):
        name = os.path.basename(g)[:-5]
        want = json.load(open(g))
        page, _, seed = name.rpartition("-")
        page = want.get("page") or page + ".html"
        seed = want.get("seed") if want.get("page") else seed
        out.append({"name": name, "page": page, "seed": seed, "query": want.get("query", ""),
                    "hash": want.get("hash", ""), "expect": g})
    for p in SMOKE:
        out.append({"name": p[:-5], "page": p, "seed": None, "query": "", "hash": "", "expect": None})
    return out


def run(j, wait):
    cmd = [sys.executable, PROBE, "--page", os.path.join(ROOT, j["page"]), "--wait", str(wait), "--no-build", "--quiet"]
    if j["seed"] not in (None, ""):
        cmd += ["--seed", str(j["seed"])]
    if j["query"]:
        cmd += ["--query", j["query"]]
    if j["hash"]:
        cmd += ["--hash", j["hash"]]
    if j["expect"]:
        cmd += ["--expect", j["expect"]]
    cmd += ["--json", os.path.join("/tmp", f"menagerie-test-{os.getpid()}-{j['name']}.json")]
    t = time.time()
    p = subprocess.run(cmd, capture_output=True, text=True)
    rep = {}
    try:
        rep = json.load(open(cmd[-1]))
        os.remove(cmd[-1])
    except Exception:
        pass
    errs = (rep.get("errors") or "").strip()
    bad = []
    if p.returncode != 0 or not rep:
        bad.append((p.stdout + p.stderr).strip().splitlines()[-1] if (p.stdout + p.stderr).strip() else "probe failed")
    if errs:
        bad.append("errors on the page: " + errs[:300])
    if rep.get("timedOut"):
        bad.append(f"did not finish building in {wait}s")
    if "LAYOUT CHANGED" in p.stdout:
        bad.append(re.search(r"LAYOUT CHANGED.*", p.stdout).group(0))
    return j, bad, time.time() - t, rep


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("only", nargs="*", help="page-name prefixes to run")
    ap.add_argument("-j", "--jobs", type=int, default=3)
    ap.add_argument("--wait", type=int, default=90, help="ceiling per page, seconds (pages report as soon as they are built)")
    a = ap.parse_args()
    chk = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build-page.py"), "--check"], capture_output=True, text=True)
    print(chk.stdout.strip())
    if chk.returncode != 0:
        print("FAIL  build.js is stale: run tools/build-page.py and commit it")
        return 1
    js = [j for j in jobs() if not a.only or any(j["name"].startswith(o) for o in a.only)]
    t0, fails = time.time(), 0
    with cf.ThreadPoolExecutor(max_workers=a.jobs) as ex:
        for j, bad, dt, rep in (f.result() for f in cf.as_completed([ex.submit(run, j, a.wait) for j in js])):
            tag = "ok  " if not bad else "FAIL"
            extra = f"ready {rep.get('readyMs')/1000:.1f}s" if rep.get("readyMs") else ""
            print(f"{tag}  {j['name']:<24} {dt:5.1f}s  {extra}")
            for b in bad:
                print(f"        {b}")
            fails += bool(bad)
    print(f"{len(js) - fails} passed, {fails} failed, {time.time() - t0:.0f}s")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
