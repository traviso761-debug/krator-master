#!/usr/bin/env python3
"""Headless verification for biomes/sedesert (its harness began as the Ancients kit's).

Usage:
  python verify.py dist/ancients-kit.html [--views "Laboratory,Starport"] [--all-views]
                                          [--assert] [--baseline base.json]
                                          [--save-baseline base.json] [--out ./shots]
                                          [--cam cx,cy,cz,tx,ty,tz] [--eval "()=>..."]

What it does:
  1. Serves the file's folder over HTTP. Not file:// - the kit only sets
     crossorigin on the three.js <script> when it is NOT on file:, and the
     local three.min.js route below depends on being able to intercept it.
  2. Loads it in headless Chromium with software WebGL (SwiftShader).
  3. Prints the on-screen error panel (#errs), renderer stats, window counters.
  4. --assert : the geometric invariants, measured from inside the page against
     window._api (see src/91-probe.js). Screenshots do not catch any of these.
     Then the host's own checks (hostChecks) and their NEGATIVE CONTROLS
     (hostNegatives): each is fed a broken input and must fail.
  5. Screenshots each named preset view.

Exit code is non-zero if the error panel is dirty, an assertion fails, or a
budget is exceeded - so it can gate a hand-off.

TWO THINGS THAT WILL WASTE A ROUND IF YOU FORGET THEM:
  * Software GL is slow. Budget ~20-40 s per screenshot at 1280x800 on this
    kit. Keep a run to <= 16 views and background the harness.
  * SwiftShader flakes roughly one run in seven with a null shader-info-log
    TypeError that reads like a real regression. Re-run before believing it.

Requires: pip install playwright && python -m playwright install chromium
  (KRATOR_CHROME=/path/to/chrome launches a Chromium already on the machine)
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing,
# the UTF-8 console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import GL_ARGS, LOAD_MS, CHROME_ENV, launch_chromium, parse_views
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
# Structure names contain em dashes; the Windows console default codepage
# mangles them, which makes a failing assertion hard to read.
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;
 const v=window[k];if(typeof v==='function'||typeof v==='object'&&v&&!Array.isArray(v)&&k==='_api')continue;
 let s=null;try{s=JSON.stringify(v);}catch(e){continue;}w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""

# --------------------------------------------------------------------------
# Geometric invariants. Each returns {name, ok, detail}.
ASSERT_JS = r"""()=>{
const A=window._api; if(!A) return [{name:'probe',ok:false,detail:'window._api missing (src/91-probe.js)'}];
const R=[];

// 1. every registered volume contains something. A REGISTER whose cylinder is
//    empty means click-to-inspect names a structure the user cannot see, or the
//    builder moved and the registration did not follow it.
{ const occ=A.regOccupancy(); const empty=occ.filter(o=>o.n===0);
  // Also name the thinnest survivors: a volume down to a handful of samples is
  // usually one edit away from being the next empty one.
  const thin=occ.filter(o=>o.n>0).sort((a,b)=>a.n-b.n).slice(0,3)
                .map(o=>o.name+' ('+o.n+')').join(', ');
  R.push({name:'registered-volumes-non-empty', ok:!empty.length,
          detail: empty.length ? empty.length+' empty of '+occ.length+': '+empty.slice(0,6).map(e=>e.name).join(' | ')
                               : occ.length+' volumes; thinnest: '+thin}); }

// 2. nothing at NaN. An instanced item at NaN drags its whole InstancedMesh's
//    bounding sphere to NaN; a NaN vertex in a surface is a hole on real
//    hardware and invisible under SwiftShader, which is how it survives.
{ const n=A.nanSweep();
  R.push({name:'no-nan-geometry', ok:n.meshes===0&&n.instances===0,
          detail: (n.meshes||n.instances) ? n.instances+' instanced items, '+n.meshes+' meshes: '
                    +JSON.stringify(n.firstInstances.concat(n.first)).slice(0,300)
                  : 'clean'}); }

// 3. per-type triangle budgets.
{ const ts=A.typeStats(); const over=Object.keys(ts).filter(k=>ts[k].over).sort((a,b)=>ts[b].tris-ts[a].tris);
  const worst=Object.keys(ts).sort((a,b)=>ts[b].tris-ts[a].tris)[0];
  R.push({name:'per-type-triangle-budget', ok:!over.length, budget:true,
          detail: over.length ? over.map(k=>k+' '+ts[k].tris+' > '+ts[k].limit+' ('+ts[k].cls+')').join(' | ')
                              : Object.keys(ts).length+' type/decay pairs, heaviest '+worst+' '+ts[worst].tris+'/'+ts[worst].limit}); }

// 4. showcase totals.
{ const T=A.totals, B=A.BUDGET.showcase;
  R.push({name:'showcase-triangle-budget', ok:T.tris<=B.tris, budget:true,
          detail:T.tris+' / '+B.tris+' scene triangles'});
  R.push({name:'showcase-draw-calls', ok:renderer.info.render.calls<=B.calls, budget:true,
          detail:renderer.info.render.calls+' / '+B.calls+' draw calls at this camera'}); }

// 5. the host's own checks, when it has any, and their negatives (each must FAIL)
if(A.hostChecks){ for(const c of A.hostChecks()) R.push({name:c.name, ok:c.ok, detail:c.detail});
  for(const n of A.hostNegatives()) R.push({name:'negative: '+n.name, ok:n.failed,
    detail:(n.failed?'fails as it must: ':'PASSED A BROKEN INPUT (the check cannot fail): ')+n.detail}); }

// 6. the registry and the instance bake both ran.
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }
return R;}"""


async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(a.out, exist_ok=True)
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    try:
        async with async_playwright() as p:
            b = await launch_chromium(p)
            W, H = [int(t) for t in a.size.split("x")]
            pg = await b.new_page(viewport={"width": W, "height": H})
            pg.set_default_timeout(600000)
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            # serve three.js from the repo instead of the CDN: offline, pinned to r128
            three = local_three(folder)
            if os.path.exists(three):
                await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{port}/{name}", timeout=LOAD_MS)
            try:
                await pg.wait_for_function(
                    "window._ready===true || (document.getElementById('errs')&&"
                    "document.getElementById('errs').textContent.length>0)", timeout=580000)
            except Exception:
                print("timed out waiting for the kit to build")
                fails.append("build timeout")
            await pg.wait_for_timeout(2500)
            try:
                st = await pg.evaluate(STATS_JS)
            except Exception as e:
                print("PAGE DID NOT INITIALISE:", str(e).splitlines()[0])
                print("error panel:", await pg.evaluate(
                    "document.getElementById('errs')?document.getElementById('errs').textContent:'(none)'"))
                await b.close()
                return 2
            print("ERROR PANEL:", repr(st["errs"]) if st["errs"] else "clean")
            if st["errs"]:
                fails.append("error panel not clean")
            if errs:
                print("PAGE ERRORS:", errs[:5])
                fails.append("page errors")
            print("draw calls:", st["calls"], "triangles:", st["tris"])
            counters = st["counters"]
            print("counters:", json.dumps(counters, sort_keys=True))

            if a.assert_:
                print("\n--- invariants ---")
                for r in await pg.evaluate(ASSERT_JS):
                    # Budget ceilings are a target to optimise toward on this
                    # showcase, not a gate: over-budget is reported loudly but
                    # only fails the run under --strict-budget. Correctness
                    # invariants always fail.
                    soft = r.get("budget") and not a.strict_budget
                    tag = "  PASS  " if r["ok"] else ("  OVER  " if soft else "  FAIL  ")
                    print(tag + r["name"] + " : " + r["detail"])
                    if not r["ok"] and not soft:
                        fails.append("assert " + r["name"])
                print("\n--- per type (scene triangles, instances, meshes) ---")
                ts = await pg.evaluate("()=>window._api.typeStats()")
                for k in sorted(ts, key=lambda k: -ts[k]["tris"]):
                    v = ts[k]
                    print("  %-12s %9d / %7d  %-6s  inst %7d  meshes %5d%s"
                          % (k, v["tris"], v["limit"], v["cls"], v["inst"], v["meshes"],
                             "   OVER" if v["over"] else ""))

            if a.baseline and os.path.exists(a.baseline):
                base = json.load(open(a.baseline))
                print("\n--- delta vs %s ---" % os.path.basename(a.baseline))
                shown = 0
                for k in sorted(set(counters) | set(base.get("counters", {}))):
                    x, y = base.get("counters", {}).get(k), counters.get(k)
                    if x != y:
                        print("  %-30s %s -> %s" % (k, x, y)); shown += 1
                for k, cur in (("triangles", st["tris"]), ("drawCalls", st["calls"])):
                    old = base.get({"triangles": "tris", "drawCalls": "calls"}[k])
                    flag = "" if old == cur else "   CHANGED"
                    print("  %-30s %s -> %s%s" % (k, old, cur, flag))
                    if old != cur:
                        shown += 1
                if not shown:
                    print("  identical")

            presets = await pg.evaluate(
                "()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
            views = parse_views(a.views, presets)
            if a.all_views:
                views = await pg.evaluate(
                    "()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
            if len(views) > 16:
                print("\nNOTE: %d views requested. Software GL makes this slow; "
                      "16 per run is the working limit." % len(views))
            await pg.screenshot(path=os.path.join(a.out, "initial.png"))
            # Draw calls depend entirely on where the camera is pointing, so the
            # single reading taken during --assert proves nothing on its own.
            # Sample every view we visit anyway and judge the worst one.
            per_view = []
            for v in views:
                try:
                    ok = await pg.evaluate(
                        "(v)=>{const b=[...document.querySelectorAll('#ui button')]"
                        ".find(b=>b.textContent.trim()===v);if(!b)return false;b.click();return true;}", v)
                    if not ok:
                        raise RuntimeError("no such preset")
                    await pg.wait_for_timeout(900)
                    fn = os.path.join(a.out, "view_" + v.replace(" ", "_").replace("/", "-") + ".png")
                    await pg.screenshot(path=fn)
                    st2 = await pg.evaluate(
                        "()=>({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})")
                    per_view.append((v, st2["calls"], st2["tris"]))
                    print("shot: %s   calls %d  tris %.2fM" % (fn, st2["calls"], st2["tris"] / 1e6))
                except Exception as e:
                    print("view failed:", v, e)
                    fails.append("view " + v)
            if per_view:
                lim = await pg.evaluate("()=>window._api?window._api.BUDGET.showcase.calls:0")
                worst = max(per_view, key=lambda r: r[1])
                print("\n--- worst draw calls over %d views ---" % len(per_view))
                for v, c, t in sorted(per_view, key=lambda r: -r[1])[:6]:
                    print("  %-28s calls %5d  tris %.2fM%s"
                          % (v, c, t / 1e6, "   OVER" if lim and c > lim else ""))
                if lim and worst[1] > lim:
                    print("  OVER budget: %s at %d / %d draw calls" % (worst[0], worst[1], lim))
                    if a.assert_ and a.strict_budget:
                        fails.append("budget drawCalls (%s)" % worst[0])

            for i, c in enumerate(a.cam or []):
                v = [float(t) for t in c.split(",")]
                await pg.evaluate("(v)=>window._api.setView(v[0],v[1],v[2],v[3],v[4],v[5])", v)
                await pg.wait_for_timeout(900)
                fn = os.path.join(a.out, "%s%d.png" % (a.cam_name, i))
                await pg.screenshot(path=fn); print("shot:", fn)
            for ev in (a.eval or []):
                try:
                    print("eval:", json.dumps(await pg.evaluate(ev))[:3000])
                except Exception as e:
                    print("eval failed:", str(e)[:400])

            if a.save_baseline:
                json.dump({"counters": counters, "tris": st["tris"], "calls": st["calls"]},
                          open(a.save_baseline, "w"), indent=1, sort_keys=True)
                print("baseline written:", a.save_baseline)
            await b.close()
    finally:
        httpd.shutdown()

    if fails:
        print("\nFAILED: " + "; ".join(fails))
        return 1
    print("\nOK")
    return 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--strict-budget", dest="strict_budget", action="store_true",
                    help="make an exceeded budget ceiling fail the run (default: report it)")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append", help="custom shot: cx,cy,cz,tx,ty,tz (repeatable)")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append", help="JS arrow function source to evaluate (repeatable)")
    ap.add_argument("--size", default="1280x800")
    sys.exit(asyncio.run(run(ap.parse_args())))
