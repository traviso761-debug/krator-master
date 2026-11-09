#!/usr/bin/env python3
"""Headless verification for the Krator Godthrone kit (station 1, the summit vent).

Usage:
  python verify.py dist/godthrone.html [--views "The summit vent,The throat"] [--all-views]
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
  5. Screenshots each named preset view.

Exit code is non-zero if the error panel is dirty, an assertion fails, or a
budget is exceeded - so it can gate a hand-off.

TWO THINGS THAT WILL WASTE A ROUND IF YOU FORGET THEM:
  * Software GL is slow. Budget ~20-40 s per screenshot at 1280x800 on this
    kit. Keep a run to <= 16 views and background the harness.
  * SwiftShader flakes roughly one run in seven with a null shader-info-log
    TypeError that reads like a real regression. Re-run before believing it.

Requires: pip install playwright && python -m playwright install chromium
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing,
# the UTF-8 console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import GL_ARGS, LOAD_MS, CHROME_ENV, launch_chromium, parse_views, check_profile, verify_page, Abort
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
# The export profile (core/export/README.md, "Profiles"): the sections a tile of this kit must fill, checked under --assert
# over EXPORT_BOX (a 300 m cell by the vent: its cones, bombs, spatter and hair). No water (station 1 has none: PLAN.md 9a)
# and no buckets (the kit places only instanced items).
EXPORT_BOX = [-15740, 15090, -15440, 15390]          # godthrone.html: the vent's 300 m cell
EXPORT_BOXES = {'godthrone-wall.html': [420, -1280, 720, -980], 'godthrone-flank.html': [-1500, -600, -1200, -300],
                # the rebuild turn's stations (2026-11-04): a 300 m cell where each has its loose stuff
                'godthrone-orange.html': [-780, -450, -480, -150], 'godthrone-scarp.html': [-450, -350, -150, -50],
                'godthrone-rim.html': [-150, -150, 150, 150], 'godthrone-blood.html': [7850, 7650, 8150, 7950],
                'godthrone-gills.html': [100, -150, 400, 150], 'godthrone-gills-ladder.html': [-150, -150, 150, 150],
                'godthrone-tube.html': [-150, -150, 150, 150]}   # the flank: by the old vent   # the wall's foot: its talus and stones
EXPORT_PROFILE = ['registry', 'items', 'materials', 'textures', 'terrain', 'stage', 'atmos']

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

// 5. the registry and the instance bake both ran.
{ R.push({name:'registry-and-bake-ran', ok:window._registered>0&&window._instances>0,
          detail:window._registered+' registered volumes, '+window._instances+' baked instances'}); }

// 5a. the ground's texture units (84-host-ground.js, window._groundUnits): the GPUs link at most 16 in a fragment program;
//     software GL allows more, so the count is checked against 16 here, not against this renderer's own limit
{ const U=window._groundUnits;
  R.push({name:'ground-texture-units', ok:!!U&&U.n<=U.max,
          detail: U ? U.n+' of '+U.max+' units on the ground ('+U.layers+' KGROUND layers; dropped as unweighted: '
                      +((window._groundLayers&&window._groundLayers.dropped.join(', '))||'none')+')' : 'window._groundUnits missing'}); }

// 5b. the host's own checks, when it has any, and their negatives (each must FAIL)
if(A.hostChecks){ for(const c of A.hostChecks()) R.push({name:c.name, ok:c.ok, detail:c.detail});
  /* core/biome's card negative audits the page's cards: on a page with none (every station but the summit's: no Pele's hair) it has
     nothing to lift, so it cannot fail; it is left out there, not passed (KNOWN_ISSUES.md) */
  for(const n of A.hostNegatives()){ if(/card/.test(n.name)&&/^0 of 0 /.test(String(n.detail))) continue; R.push({name:'negative: '+n.name, ok:n.failed,
    detail:(n.failed?'fails as it must: ':'PASSED A BROKEN INPUT (the check cannot fail): ')+n.detail}); } }

// 6. the kit's own (the host's checks above carry them: heights, halo, items on the ground, thin air, rock, hazards)
{ const B=A.biomeChecks(); R.push({name:'biome-built', ok:!!(B.items&&(B.items.talus>0||B.items.stones>0)), detail:JSON.stringify(B).slice(0,400)}); }
return R;}"""


async def run(a):
    from playwright.async_api import async_playwright
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(a.html, here=os.path.dirname(os.path.abspath(__file__)), size=a.size, query=(("?" + a.query) if getattr(a, "query", "") else "")) as V:
        pg, errs, fails, b, port = V.page, V.errs, V.fails, V.browser, V.port
        if not V.ready:
            print("timed out waiting for the kit to build")
            fails.append("build timeout")
        try:
            st = await pg.evaluate(STATS_JS)
        except Exception as e:
            print("PAGE DID NOT INITIALISE:", str(e).splitlines()[0])
            print("error panel:", await pg.evaluate(
                "document.getElementById('errs')?document.getElementById('errs').textContent:'(none)'"))
            raise Abort(2)
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

            print("\n--- export profile (core/export/README.md, \"Profiles\") ---")
            prof = [s.strip() for s in a.profile.split(",") if s.strip()] if a.profile else EXPORT_PROFILE
            box = EXPORT_BOXES.get(os.path.basename(a.html), EXPORT_BOX)
            pok, lines = await check_profile(pg, box, prof)
            for ln in lines:
                print("  " + ln)
            print(("  PASS  " if pok else "  FAIL  ") + "export-profile : box %s" % box)
            if not pok:
                fails.append("assert export-profile")

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
        await V.shot(os.path.join(a.out, "initial.png"))
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
                await V.shot(fn, view=v)
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
            await V.shot(fn); print("shot:", fn)
        for ev in (a.eval or []):
            try:
                print("eval:", json.dumps(await pg.evaluate(ev))[:3000])
            except Exception as e:
                print("eval failed:", str(e)[:400])

        if a.save_baseline:
            json.dump({"counters": counters, "tris": st["tris"], "calls": st["calls"]},
                      open(a.save_baseline, "w"), indent=1, sort_keys=True)
            print("baseline written:", a.save_baseline)
    return V.exit()


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
    ap.add_argument("--query", default="", help="the page's query string, e.g. overflow (the lake's overflow, 89d)")
    ap.add_argument("--profile", default="", help="under --assert: the export profile for this run, a,b,c (default EXPORT_PROFILE)")
    sys.exit(asyncio.run(run(ap.parse_args())))
