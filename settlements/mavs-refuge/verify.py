#!/usr/bin/env python3
"""Headless verification for Voth (painting-to-3d-world).

Usage:
  python3 verify.py mavs-refuge.html [--views "Overview,River mouth"] [--all-views]
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
const A = window._api; if(!A) return [{name:'probe', ok:false, detail:'window._api missing'}];
const R=[]; const L=window._layout||{};
function segD(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,LL=dx*dx+dz*dz;let t=LL?((px-ax)*dx+(pz-az)*dz)/LL:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,pz-az-t*dz);}
R.push({name:'nav-connected', ok:A.NAV.reachable===A.NAV.nodes.length, detail:A.NAV.reachable+' of '+A.NAV.nodes.length+' walk nodes reachable from the central plaza'});
{ let bad=[], mx=0; A.BRIDGES.forEach(b=>{ mx=Math.max(mx,b.L); if(b.L>125||b.L<6) bad.push([b.id,b.L|0]);
    [b.a,b.b].forEach(h=>{ const P=h.plat, p=A.platXZ(P,P.R-0.4,h.ang); if(Math.hypot(p[0]-h.x,p[1]-h.z)>0.5) bad.push(['head-off-rim',b.id]); }); });
  R.push({name:'bridges-sane', ok:!bad.length, detail: bad.length? JSON.stringify(bad.slice(0,8)) : A.BRIDGES.length+' bridges, longest '+(mx|0)+' m'}); }
{ let bad=[]; A.BRIDGES.forEach(b=>{ A.TREES.forEach(T=>{ if(T===b.a.plat.tree||T===b.b.plat.tree) return;
    const y=Math.min(b.a.y,b.b.y), d=segD(T.x,T.z,b.a.x,b.a.z,b.b.x,b.b.z); if(d < A.trunkR(T,y)+2.5) bad.push([b.id,T.id,d|0]); }); });
  R.push({name:'bridges-clear-of-trunks', ok:!bad.length, detail: bad.length? 'bridge,tree,dist '+JSON.stringify(bad.slice(0,8)) : 'no bridge passes through a trunk'}); }
{ let bad=[]; const P=A.PLATS; for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const a=P[i], b=P[j];
    if(a.councilOf===b||b.councilOf===a) continue;
    const d=Math.hypot(a.x-b.x,a.z-b.z), ra=a.R*Math.max(a.sx,a.sz), rb=b.R*Math.max(b.sx,b.sz);
    const yo = Math.min(a.y+12,b.y+12) - Math.max(a.yBottom,b.yBottom);
    if(d < ra+rb+1 && yo>0) bad.push([a.name,b.name,d|0]); }
  R.push({name:'platforms-disjoint', ok:!bad.length, detail: bad.length? JSON.stringify(bad.slice(0,6)) : P.length+' platforms, none interpenetrate'}); }
{ let bad=[]; A.PLATS.forEach(P=>{ P.bays.forEach(B=>{ for(let k=0;k<P.levels.length-1;k++){ const st=A.stairOf(P,B,k), Lv=P.levels[k+1];
      if(P.main && st.rBot-1.5 < Lv.Rin) bad.push([P.name,k,+(st.rBot-Lv.Rin).toFixed(1)]); if(st.run<2) bad.push([P.name,k,'run',st.run]); } }); });
  R.push({name:'stairs-land-on-floor', ok:!bad.length, detail: bad.length? JSON.stringify(bad.slice(0,8)) : 'every flight lands inside its level'}); }
{ let bad=[]; A.PLATS.filter(p=>p.main).forEach(P=>{ if(P.bays.length<3) bad.push(P.name); });
  R.push({name:'three-stairs-per-level', ok:!bad.length, detail: bad.length? JSON.stringify(bad) : 'every main platform has 3 stair bays through every level'}); }
{ let bad=[]; A.SPIRALS.filter(s=>s.kind==='gate').forEach(S=>{ const g=A.terrainH(S.landing.x,S.landing.z); if(S.y0-g < 28) bad.push([S.plat.name,(S.y0-g)|0]); });
  R.push({name:'gate-ramps-stop-short', ok:!bad.length, detail: bad.length? JSON.stringify(bad) : 'every gate ramp ends 28 m+ above the ground'}); }
{ const n=A.TREES.length, occ=A.TREES.filter(t=>t.role).length, ratio=(n-occ)/occ;
  R.push({name:'two-wild-per-occupied', ok:ratio>=1.7&&ratio<=2.6, detail:(n-occ)+' unoccupied : '+occ+' occupied = '+ratio.toFixed(2)}); }
{ let bad=[]; A.TREES.forEach(T=>{ if(A.riverDist(T.x,T.z) < T.rb*1.6) bad.push(T.id); });
  R.push({name:'trees-out-of-river', ok:!bad.length, detail: bad.length? JSON.stringify(bad):'no trunk stands in the channel'}); }
return R;}"""

BUDGET_JS = """()=>{const B=(typeof BUDGET!=='undefined')?BUDGET:(window._api&&window._api.BUDGET); if(!B) return null;
return {budget:B, calls:renderer.info.render.calls, tris:renderer.info.render.triangles,
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
                    for k, cur in (("drawCalls", bg["calls"]), ("triangles", bg["tris"]),
                                   ("instances", bg["instances"])):
                        lim = bg["budget"][k]
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
