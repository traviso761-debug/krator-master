#!/usr/bin/env python3
"""Headless verification for Voth (painting-to-3d-world).

Usage:
  python3 verify.py girder.html [--views "Overview,River mouth"] [--all-views]
                              [--assert] [--sweep] [--baseline base.json]
                              [--save-baseline base.json] [--out ./shots]

What it does:
  1. Serves the file's folder over HTTP (crossorigin works; file:// would not).
  2. Loads it in headless Chromium with software WebGL.
  3. Prints the on-screen error panel (#errs), renderer stats and window.* counters.
  4. --assert : measures the geometric invariants that have actually broken in
     this project, from inside the page, against window._api (see src/85-probe.js).
     This is the part that lets a subagent prove it did not break something it
     cannot see. Screenshots do not catch these; they cost two passes when they
     were not checked.
  5. --budget is implied by --assert: draw calls / triangles / instances against
     window._api.BUDGET.
  6. --baseline : diffs the counters against a saved run and prints the deltas.
     This is the one line a subagent reports back to the planner.
  7. Screenshots each named preset view; --sweep samples window._legs routes.

Exit code is non-zero if the error panel is dirty, an assertion fails, or a
budget is exceeded — so it can gate a subagent's hand-off.

Requires: pip install playwright && python3 -m playwright install chromium
"""
import argparse, asyncio, http.server, json, os, socketserver, sys, threading

# --------------------------------------------------------------------------
SWEEP_JS = """()=>{const bb=new THREE.Box3();const p=new THREE.Vector3();const out=[];const boxes=[];const m=new THREE.Matrix4();
const pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
scene.traverse(o=>{if(!o.isMesh||o.geometry.type==='PlaneGeometry'||(o.material&&o.material.transparent))return;
  if(o.isInstancedMesh){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);if(sc.y<8)continue;boxes.push(o.geometry.boundingBox.clone().applyMatrix4(m));}return;}
  if(o.parent&&o.parent.userData&&o.parent.userData.ph!==undefined)return;
  bb.setFromObject(o);if(isFinite(bb.min.x)&&bb.max.y-bb.min.y<400)boxes.push(bb.clone());});
if(!window._legs)return {note:'no window._legs defined'};
window._legs.forEach((l,li)=>{for(let i=3;i<397;i++){l.curve.getPointAt(i/400,p);for(const b of boxes){if(b.containsPoint(p)){out.push([li,+(i/400).toFixed(2),p.x|0,p.y|0,p.z|0,b.max.y|0]);break;}}}});
return {boxes:boxes.length,hits:out.length,first:out.slice(0,10)};}"""

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;const v=window[k];let s=null;try{s=JSON.stringify(v);}catch(e){continue;}if(typeof v==='function')continue;w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""

# --------------------------------------------------------------------------
# Geometric invariants. Each returns {name, ok, detail}. Add one here every
# time a bug costs more than one round to find.
ASSERT_JS = r"""()=>{
const A=window._api; if(!A) return [{name:'probe',ok:false,detail:'window._api missing'}];
const R=[];
R.push({name:'nav-connected', ok:A.NAV.reachable===A.NAV.nodes.length, detail:A.NAV.reachable+' of '+A.NAV.nodes.length+' walk nodes reachable'});
{ const T=A.TOWERS, ok=T.length===4 && T.every(t=>Math.abs(Math.abs(t.x)-Math.abs(T[0].x))<1e-6 && Math.abs(Math.abs(t.z)-Math.abs(T[0].x))<1e-6) && T.every(t=>t.floors.length===31);
  R.push({name:'four-towers-perfect-square', ok, detail:T.map(t=>[t.x,t.z]).join(' | ')+'  storeys '+(T[0].floors.length-1)}); }
{ const by={}; A.SLOTS.forEach(s=>{by[s.k]=(by[s.k]||0)+1;}); const ks=Object.keys(by).map(Number);
  const bad=ks.filter(k=>k>5&&k<25), low=[0,1,2,3,4,5].map(k=>by[k]||0), hi=[25,26,27,28,29].map(k=>by[k]||0);
  const mono = low[0]>=low[5] && hi[4]>=hi[0];
  R.push({name:'habitation-bottom6-top5-thinning', ok:!bad.length&&mono, detail:'lots per floor 1-6: '+low.join(',')+'  26-30: '+hi.join(',')+(bad.length?'  STRAY floors '+bad:'')}); }
{ let bad=[]; A.BRIDGES.forEach(b=>{ if(b.L>70||b.L<10) bad.push([b.id,b.L|0]); });
  R.push({name:'bridges-sane', ok:!bad.length&&A.BRIDGES.length>=4, detail:A.BRIDGES.length+' bridges, '+A.BRIDGES.map(b=>b.L|0).join('/')+' m'}); }
{ let bad=[]; A.TREES.forEach(t=>{ const r=Math.hypot(t.x,t.z); if(r<A.PALISADE.R+40) bad.push(t.id); if(A.riverDist(t.x,t.z)<t.rb*1.2) bad.push('brook'+t.id); });
  R.push({name:'trees-clear-of-village-and-brook', ok:!bad.length, detail: bad.length?JSON.stringify(bad):A.TREES.length+' hypertrees, tallest '+(Math.max(...A.TREES.map(t=>t.H))|0)+' m'}); }
{ let bad=[]; A.PLOTS.concat(A.HOUSES).forEach(p=>{ if(Math.hypot(p.x,p.z)+Math.hypot(p.w,p.d)/2 > A.PALISADE.R-6) bad.push(p.id); A.TOWERS.forEach(t=>{ if(Math.abs(p.x-t.x)<t.half+p.w/2+4 && Math.abs(p.z-t.z)<t.half+p.d/2+4) bad.push('tower'+p.id); }); });
  R.push({name:'farms-inside-palisade', ok:!bad.length, detail: bad.length?JSON.stringify(bad.slice(0,8)):A.PLOTS.length+' plots, '+A.HOUSES.length+' houses'}); }
{ const n=A.ROOSTS.length, per={}; A.ROOSTS.forEach(r=>{per[r.plat.id]=(per[r.plat.id]||0)+1;});
  R.push({name:'roosts-on-every-deck', ok:Object.keys(per).length===4 && n>=40, detail:n+' roost stalls: '+JSON.stringify(per)}); }
{ const F=window._furniture; if(F){ const miss=Object.keys(F.missing||{});
  R.push({name:'furniture-catalog-keys', ok:!miss.length && F.placed>0, detail:F.placed+' pieces placed with FURNISH, '+F.keys+' catalog keys'+(miss.length?', MISSING '+miss.join(','):', none missing')}); } }
{ const I=window._interiors; if(I && I.on){
  R.push({name:'interiors-furnished', ok:I.done===I.total && I.total>0 && !I.dropped && !I.residenceFails && !Object.keys(I.missingItems||{}).length,
    detail:I.done+'/'+I.total+' buildings, '+I.rooms+' rooms, '+I.pieces+' pieces, '+I.partitions+' partitions, residence fails '+I.residenceFails+', dropped rooms '+I.dropped}); } }
return R;}"""

# The catalog furniture (53-furnish.js, 56-interiors.js: meshes flagged userData.furniture) has its own budget
# line (BUDGET.furniture); the world budget is measured without it. Only what the camera draws is counted: core/lod
# keeps each original on layer 30 (unseen; mask bit 0x40000000) and draws a copy carrying the original's userData.
BUDGET_JS = """()=>{const B=(typeof BUDGET!=='undefined')?BUDGET:(window._api&&window._api.BUDGET); if(!B) return null;
let fc=0, ft=0; scene.traverseVisible(o=>{ if(!o.isMesh||!o.userData.furniture||!!(o.layers.mask & 0x40000000)) return; const g=o.geometry;
  const n=g.index?g.index.count:g.attributes.position.count, dr=g.drawRange; fc++; ft+=Math.floor(Math.min(n, dr.count===Infinity?n:dr.count)/3); });
return {budget:B, calls:renderer.info.render.calls-fc, tris:renderer.info.render.triangles-ft, furnCalls:fc, furnTris:ft,
        instances:(window._stats&&window._stats.instances)||0};}"""


async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    os.makedirs(a.out, exist_ok=True)
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
            W, H = [int(t) for t in a.size.split("x")]
            pg = await b.new_page(viewport={"width": W, "height": H})
            pg.set_default_timeout(300000)
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            three = os.path.join(folder, "three.min.js")
            if os.path.exists(three):
                await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{port}/{name}", timeout=180000)
            try:
                await pg.wait_for_function("window._ready===true || (document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)", timeout=170000)
            except Exception as e:
                print("timed out waiting for the world to build")
            await pg.wait_for_timeout(2500)
            # the interiors are furnished after load, a few buildings a frame (56-interiors.js): wait for all
            try:
                await pg.wait_for_function("!window._interiors || !window._interiors.on || window._interiors.done===window._interiors.total",
                                           timeout=1500000, polling=2000)
                print("interiors:", json.dumps(await pg.evaluate("window._interiors||null"))[:900])
            except Exception as e:
                print("timed out waiting for the interiors to be furnished")
            if a.hour is not None:
                await pg.evaluate("(h)=>{ if(window._api) _api.skySetHour(h); const p=document.getElementById('dnPause'); if(p && !/Resume/.test(p.textContent)) p.click(); }", a.hour)
                await pg.wait_for_timeout(1200)
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
                print("PAGE ERRORS:", errs[:5]); fails.append("page errors")
            print("draw calls:", st["calls"], "triangles:", st["tris"])
            counters = {k: v for k, v in st["counters"].items() if k not in ('_errBox',)}
            print("counters:", json.dumps(counters, sort_keys=True))

            if a.assert_:
                print("\n--- invariants ---")
                for r in await pg.evaluate(ASSERT_JS):
                    print(("  PASS  " if r["ok"] else "  FAIL  ") + r["name"] + " : " + r["detail"])
                    if not r["ok"]:
                        fails.append("assert " + r["name"])
                bg = await pg.evaluate(BUDGET_JS)
                if bg:
                    print("\n--- budget ---")
                    fb = bg["budget"].get("furniture") or {}
                    rows = [("drawCalls", bg["calls"], bg["budget"]["drawCalls"]), ("triangles", bg["tris"], bg["budget"]["triangles"]),
                            ("instances", bg["instances"], bg["budget"]["instances"])]
                    if fb:
                        rows += [("furn.calls", bg["furnCalls"], fb["drawCalls"]), ("furn.tris", bg["furnTris"], fb["triangles"])]
                    for k, cur, lim in rows:
                        ok = cur <= lim
                        print("  %s  %-10s %9d / %9d  (%d%%)" % ("PASS" if ok else "OVER", k, cur, lim, 100 * cur // lim))
                        if not ok:
                            fails.append("budget " + k)

            if a.baseline and os.path.exists(a.baseline):
                base = json.load(open(a.baseline))
                print("\n--- delta vs %s ---" % os.path.basename(a.baseline))
                flat = _flat(counters); fb = _flat(base.get("counters", {}))
                keys = sorted(set(flat) | set(fb))
                shown = 0
                for k in keys:
                    x, y = fb.get(k), flat.get(k)
                    if x != y:
                        print("  %-34s %s -> %s" % (k, x, y)); shown += 1
                d = st["tris"] - base.get("tris", st["tris"])
                print("  %-34s %s -> %s (%+d)" % ("triangles", base.get("tris"), st["tris"], d))
                print("  %-34s %s -> %s" % ("drawCalls", base.get("calls"), st["calls"]))
                if not shown:
                    print("  counters identical")

            views = [v.strip() for v in a.views.split(",") if v.strip()]
            if a.all_views:
                views = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
            await pg.screenshot(path=os.path.join(a.out, "initial.png"))
            for v in views:
                try:
                    ok = await pg.evaluate(
                        "(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);"
                        "if(!b)return false;b.click();return true;}", v)
                    if not ok:
                        raise RuntimeError("no such preset button")
                    await pg.wait_for_timeout(900)
                    fn = os.path.join(a.out, "view_" + v.replace(" ", "_") + ".png")
                    await pg.screenshot(path=fn)
                    print("shot:", fn)
                except Exception as e:
                    print("view failed:", v, e)

            for i, c in enumerate(a.cam or []):
                v = [float(t) for t in c.split(",")]
                await pg.evaluate("(v)=>_dbg.setView(v[0],v[1],v[2],v[3],v[4],v[5])", v)
                await pg.wait_for_timeout(900)
                fn = os.path.join(a.out, "%s%d.png" % (a.cam_name, i)); await pg.screenshot(path=fn); print("shot:", fn)
            for ev in (a.eval or []):
                try:
                    print("eval:", json.dumps(await pg.evaluate(ev))[:3000])
                except Exception as e:
                    print("eval failed:", str(e)[:400])
            if a.sweep:
                print("route sweep:", await pg.evaluate(SWEEP_JS))

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


def _flat(d, prefix=""):
    out = {}
    for k, v in (d or {}).items():
        if isinstance(v, dict):
            out.update(_flat(v, prefix + k + "."))
        elif not isinstance(v, (list, )):
            out[prefix + k] = v
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--views", default="")
    ap.add_argument("--all-views", action="store_true")
    ap.add_argument("--assert", dest="assert_", action="store_true")
    ap.add_argument("--sweep", action="store_true")
    ap.add_argument("--baseline", default="")
    ap.add_argument("--save-baseline", default="")
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--hour", type=float, default=None, help="set the sky clock (and pause it) before the screenshots")
    ap.add_argument("--cam", action="append", help="custom shot: cx,cy,cz,tx,ty,tz (repeatable)")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append", help="JS arrow function source to evaluate and print (repeatable)")
    ap.add_argument("--size", default="1000x640")
    sys.exit(asyncio.run(run(ap.parse_args())))
