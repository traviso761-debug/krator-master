#!/usr/bin/env python3
"""Hold /enterprise to its performance budget: frame time and draw calls in its busiest places, and load time.

  tools/enterprise-budget.py                 every view, three runs each, and the two loads; exit 1 if over budget
  tools/enterprise-budget.py fight warp      only these views (the loads are "load")
  tools/enterprise-budget.py --runs 1        quicker, noisier
  tools/enterprise-budget.py --save          write what this machine measured into the budget file, with the margin

The budget is tests/budget/enterprise.json (src/enterprise/BUDGET.md says where its numbers came from). Each view is
the page at a hash, probed headless with frames uncapped (tools/probe.py --uncapped, so a frame's time is what it
costs and not the display's 60 Hz), one probe at a time: probes side by side share the GPU and the cores and slow
each other down. A view's number is the median over its runs. The loads are a first visit (a fresh profile: the
hull's textures painted in workers) and a second (the same profile and origin: read back from IndexedDB, which the
second run must say it did).

It is slow (about five minutes) and its numbers belong to the machine they were measured on, so it is not part of
tools/test-pages.py. Run it on the machine the budget was set on, after a change to anything drawn every frame.
"""
import argparse
import json
import os
import shutil
import socket
import statistics
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE = os.path.join(ROOT, "tools", "probe.py")
BUDGET = os.path.join(ROOT, "tests", "budget", "enterprise.json")
# how far over what was measured --save sets the ceiling: frame times wander by a millisecond or two between runs
MARGIN = {"p50": (1.25, 1.0), "p95": (1.25, 1.5), "calls": (1.15, 5), "readyMs": (1.3, 300)}


def free_port():
    with socket.socket() as so:
        so.bind(("127.0.0.1", 0))
        return so.getsockname()[1]


def probe(hash_, settle, wait=150, extra=()):
    out = os.path.join(tempfile.gettempdir(), f"ent-budget-{os.getpid()}.json")
    cmd = [sys.executable, PROBE, "--page", os.path.join(ROOT, "enterprise.html"), "--no-build", "--quiet",
           "--wait", str(wait), "--settle", str(settle), "--hash", hash_, "--json", out, *extra]
    subprocess.run(cmd, capture_output=True, text=True)
    try:
        rep = json.load(open(out, encoding="utf-8"))
        os.remove(out)
    except (OSError, ValueError):
        return None
    return rep


def check_view(name, v, rep):
    """None if the page got where the view wants it, else what went wrong."""
    if not rep:
        return "no report"
    if rep.get("errors"):
        return "errors: " + rep["errors"][:200]
    if rep.get("timedOut"):
        return "timed out"
    d = rep.get("details") or {}
    if v.get("want") == "warp" and ((d.get("ent") or {}).get("warp") or 0) < 1:
        return "not at warp when measured"
    if v.get("want") == "fight" and (d.get("orders") or {}).get("step") != 1:
        return "not in the fight when measured (step %s)" % (d.get("orders") or {}).get("step")
    return None


def snap_dir():
    """A snap Firefox can only open a profile under ~/snap/firefox/common."""
    ff = shutil.which("firefox") or ""
    snap = ff and (os.path.realpath(ff).startswith("/snap/") or "/snap/" in open(ff, "rb").read(4096).decode("latin1"))
    d = os.path.expanduser("~/snap/firefox/common")
    return d if snap and os.path.isdir(d) else None


def run_loads(runs):
    """First and second visit, `runs` pairs, each pair on a fresh profile and one port."""
    first, second, notes = [], [], []
    for _ in range(runs):
        prof = tempfile.mkdtemp(prefix="ent-budget-prof-", dir=snap_dir())
        port = str(free_port())
        try:
            a = probe("", 2, extra=("--profile", prof, "--port", port, "--uncapped"))
            b = probe("", 2, extra=("--profile", prof, "--port", port, "--uncapped"))
        finally:
            shutil.rmtree(prof, ignore_errors=True)
        for rep, into, want in ((a, first, None), (b, second, "cache")):
            if not rep or rep.get("errors") or not rep.get("readyMs"):
                notes.append("a load failed: " + str((rep or {}).get("errors", "no report"))[:200])
                continue
            src = set((((rep.get("details") or {}).get("skins") or {}).get("from") or {}).values())
            if want and src != {want}:
                notes.append(f"second visit did not read the cache: textures from {sorted(src)}")
            into.append(rep["readyMs"])
    return first, second, notes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("only", nargs="*", help="views to run (and 'load')")
    ap.add_argument("--runs", type=int, default=3)
    ap.add_argument("--save", action="store_true", help="write the measured numbers, and ceilings from them, to the budget file")
    a = ap.parse_args()
    B = json.load(open(BUDGET, encoding="utf-8"))
    views = {k: v for k, v in B["views"].items() if not a.only or k in a.only}
    over, measured, gpu, canvas = [], {}, None, None
    for name, v in views.items():
        got = {"p50": [], "p95": [], "calls": []}
        for i in range(a.runs):
            rep = probe(v["hash"], v["settle"], extra=("--uncapped",))
            bad = check_view(name, v, rep)
            if bad:
                print(f"{name}: run {i + 1}: {bad}")
                over.append(f"{name}: {bad}")
                continue
            gpu, canvas = rep.get("gpu") or gpu, rep.get("canvas") or canvas
            got["p50"].append(rep["frameP50"]); got["p95"].append(rep["frameP95"]); got["calls"].append(rep["calls"])
        if not got["p50"]:
            continue
        m = {k: round(statistics.median(x), 1) for k, x in got.items()}
        measured[name] = m
        cap = v.get("budget") or {}
        row = []
        for k in ("p50", "p95", "calls"):
            lim = cap.get(k)
            flag = "" if lim is None or m[k] <= lim else "  OVER"
            if flag:
                over.append(f"{name}: {k} {m[k]} over {lim}")
            row.append(f"{k} {m[k]}" + (f"/{lim}" if lim is not None else "") + flag)
        # and whatever the view's own budget, a frame at the 95th percentile must still fit in a 60 Hz display's
        if B.get("ceilingP95") and m["p95"] > B["ceilingP95"]:
            over.append(f"{name}: p95 {m['p95']} over the {B['ceilingP95']} ms of a 60 Hz frame")
            row.append("OVER 60 Hz")
        print(f"{name:10s} " + ", ".join(row) + f"   (runs {got['p50']}/{got['p95']})")
    if not a.only or "load" in a.only:
        first, second, notes = run_loads(max(1, min(a.runs, 2)))
        for n in notes:
            print("load:", n)
            over.append("load: " + n)
        cap = B.get("load", {}).get("budget", {})
        for key, xs in (("first", first), ("second", second)):
            if not xs:
                continue
            m = round(statistics.median(xs))
            measured.setdefault("load", {})[key] = m
            lim = cap.get(key)
            flag = "" if lim is None or m <= lim else "  OVER"
            if flag:
                over.append(f"load: {key} visit {m} ms over {lim}")
            print(f"load       {key} visit ready in {m} ms" + (f" (budget {lim})" if lim is not None else "") + flag + f"   (runs {xs})")
    print(f"gpu: {gpu}, canvas {canvas}")
    if a.save:
        for name, m in measured.items():
            if name == "load":
                mul, add = MARGIN["readyMs"]
                B["load"]["measured"] = m
                B["load"]["budget"] = {k: int(round(x * mul + add, -1)) for k, x in m.items()}
                continue
            B["views"][name]["measured"] = m
            B["views"][name]["budget"] = {k: (int(m[k] * MARGIN[k][0] + MARGIN[k][1]) if k == "calls"
                                              else round(m[k] * MARGIN[k][0] + MARGIN[k][1], 1)) for k in m}
            # never above a 60 Hz frame, whatever the margin would allow
            if B.get("ceilingP95"):
                B["views"][name]["budget"]["p95"] = min(B["views"][name]["budget"]["p95"], B["ceilingP95"])
        B["machine"]["gpu"] = gpu or B["machine"].get("gpu")
        B["machine"]["canvas"] = canvas or B["machine"].get("canvas")
        json.dump(B, open(BUDGET, "w", encoding="utf-8", newline="\n"), indent=1)
        open(BUDGET, "a", encoding="utf-8", newline="\n").write("\n")
        print("saved", BUDGET)
    if over:
        print(f"OVER BUDGET ({len(over)}):\n  " + "\n  ".join(over))
        sys.exit(1)
    print("within budget")


if __name__ == "__main__":
    main()
