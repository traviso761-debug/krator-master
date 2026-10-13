#!/usr/bin/env python3
"""Headless verification for Voth (painting-to-3d-world).

Usage:
  python3 verify.py voth.html [--views "Overview,River mouth"] [--all-views]
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
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers: the shared copy is tools/harness.py (launching Chromium, the local three.js, --views parsing,
# the UTF-8 console). A fix there reaches every verify.py that imports it.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
import harness as _harness
from harness import GL_ARGS, LOAD_MS, CHROME_ENV, launch_chromium, parse_views
local_three = lambda folder: _harness.local_three(folder, os.path.dirname(os.path.abspath(__file__)))
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

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;const v=window[k];const s=JSON.stringify(v);w[k]=(s&&s.length<400)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""

# --------------------------------------------------------------------------
# Geometric invariants. Each returns {name, ok, detail}. Add one here every
# time a bug costs more than one round to find.
ASSERT_JS = r"""()=>{
const A = window._api;
if(!A) return [{name:'probe', ok:false, detail:'window._api missing — is src/85-probe.js in the build?'}];
const R = [];
const K = A.k;

function cum(p){let c=[0];for(let i=1;i<p.length;i++)c.push(c[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return c;}
function at(p,c,t){const L=c[c.length-1],d=t*L;for(let i=1;i<c.length;i++){if(d<=c[i]){const u=(d-c[i-1])/(c[i]-c[i-1]);
  return [p[i-1][0]+u*(p[i][0]-p[i-1][0]), p[i-1][1]+u*(p[i][1]-p[i-1][1])];}}return p[p.length-1];}
function segD(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;
  let t=L?((px-ax)*dx+(pz-az)*dz)/L:0; t=Math.max(0,Math.min(1,t));
  return Math.hypot(px-ax-t*dx, pz-az-t*dz);}

/* 1. The river holds water for its whole length. A bar across the bed is the
      pass-2/3 failure: the mouth silted up and the docks sat on dry land. */
{
  const C = cum(A.RIVERC); const bad = [];
  for(let i=0;i<=120;i++){const q = at(A.RIVERC,C,i/120); const h = A.terrainH(q[0],q[1]);
    if(h > K.SEA - 1.0) bad.push([q[0]|0,q[1]|0,+h.toFixed(2)]);}
  R.push({name:'river-holds-water', ok:bad.length===0,
          detail: bad.length ? bad.length+' centreline samples above the waterline, first '+JSON.stringify(bad.slice(0,4))
                             : '121 samples, bed everywhere below the lake surface'});
}

/* 2. The mouth is open: the first 600 units of channel are continuous water,
      not a pool behind a shore bar. */
{
  const C = cum(A.RIVERC); const L = C[C.length-1]; const bad=[];
  for(let d=0; d<=600; d+=25){const q=at(A.RIVERC,C,d/L); const h=A.terrainH(q[0],q[1]);
    if(h > K.SEA - 2.0) bad.push([q[0]|0,q[1]|0,+h.toFixed(2)]);}
  R.push({name:'river-mouth-open', ok:bad.length===0,
          detail: bad.length ? 'blocked at '+JSON.stringify(bad.slice(0,3)) : 'open for the first 600 units'});
}

/* 3. Nothing solid stands in the channel below deck height except the things
      that are meant to cross or work it: the two bridges and the river piers. */
{
  const m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
  const bad=[];
  scene.traverse(o=>{ if(!o.isInstancedMesh) return;
    if(o.userData && o.userData.life) return; /* moving life-layer vehicles legitimately use the channel */
    for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); m.decompose(pos,q,sc);
      if(pos.y > K.CROSS_CLEAR) continue;
      if(!A.inRiver(pos.x,pos.z,-8)) continue;
      let ok=false;
      for(const b of A.RBRIDGES) if(segD(pos.x,pos.z,b.ax,b.az,b.bx,b.bz) < 40){ok=true;break;}
      if(!ok) for(const p of A.RPIERS) if(segD(pos.x,pos.z,p.x0,p.z0,p.x1,p.z1) < 55){ok=true;break;}
      if(!ok) for(const d of (A.RBARGE_DOCKS||[])) if(Math.hypot(pos.x-d.x,pos.z-d.z) < 20){ok=true;break;}
      if(!ok) bad.push([pos.x|0,pos.z|0,+pos.y.toFixed(1),(o.material.userData&&o.material.userData.fam)||'?']);
    }});
  R.push({name:'river-channel-clear', ok:bad.length===0,
          detail: bad.length ? bad.length+' unexplained instances in the channel, first '+JSON.stringify(bad.slice(0,6))
                             : 'clear apart from the bridges and the river piers'});
}

/* 4. The river docks stand on land. riverHalf() returns the WATERLINE, not the
      channel centre — confusing the two is what put them under water. */
{
  const bad = A.RPIERS.map(p=>({x:p.bx|0,z:p.bz|0,h:+A.terrainH(p.bx,p.bz).toFixed(2)}))
                      .filter(o=>o.h < K.SEA + 0.5);
  R.push({name:'river-docks-dry', ok:bad.length===0,
          detail: bad.length ? JSON.stringify(bad) : A.RPIERS.length+' river piers, all footed above the waterline'});
}

/* 5. The shoreline is a closed loop and arc-length addressing round-trips.
      Every layout constant in 30-layout.js is an arc length; if a heightmap
      edit moves the shore, this is the check that says so before anything
      downstream looks subtly wrong. */
{
  let worst=0, where=null;
  for(let i=0;i<200;i++){ const s=K.SLEN*i/200; const p=A.shoreAt(s);
    let d=Math.abs(A.shoreS(p[0],p[1])-s); d=Math.min(d, Math.abs(d-K.SLEN));
    if(d>worst){worst=d; where=[p[0]|0,p[1]|0];}}
  R.push({name:'shore-roundtrip', ok:worst<40,
          detail:'worst arc-length error '+worst.toFixed(1)+' at '+JSON.stringify(where)+' (tolerance 40, shore '+Math.round(K.SLEN)+' long)'});
}

/* 6. Cantons still stand over water and do not foul each other. */
{
  const bad=[];
  for(const c of A.CANTONS){ if(A.terrainH(c.x,c.z) > K.SEA) bad.push(c.n+' aground'); }
  for(let i=0;i<A.CANTONS.length;i++) for(let j=i+1;j<A.CANTONS.length;j++){
    const a=A.CANTONS[i], b=A.CANTONS[j];
    if(Math.hypot(a.x-b.x,a.z-b.z) < (a.r+b.r)*1.02) bad.push(a.n+'/'+b.n+' overlap');}
  R.push({name:'cantons-afloat', ok:bad.length===0, detail: bad.length?bad.join(', '):A.CANTONS.length+' cantons, all over water and clear of each other'});
}

/* 7. Built fabric stays inside the city limit (+300 slack for shrines and
      barns that sit just over the line). Vegetation and farmland are allowed
      out across the whole terrain; walls and roofs are not. Farmsteads and
      manors are explained by their own records. */
{
  const BUILT = {stone:1, plaster:1, roof:1, dome:1, metal:1};
  const m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
  let n=0, far=null, census={};
  scene.traverse(o=>{ const fam=(o.material&&o.material.userData&&o.material.userData.fam)||'?';
    if(!o.isInstancedMesh) return;
    if(o.userData && o.userData.life) return; /* moving life-layer vehicles roam past the limit legitimately */
    for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); m.decompose(pos,q,sc);
      const d=Math.max(Math.abs(pos.x),Math.abs(pos.z));
      if(d > K.CITY_LIM+300){ census[fam]=(census[fam]||0)+1;
        if(!BUILT[fam]) continue;
        let ok=false;
        for(const f of A.FARMS)  if(Math.hypot(pos.x-f[0],pos.z-f[1])<130){ok=true;break;}
        if(!ok) for(const mn of A.MANORS) if(Math.hypot(pos.x-mn[0],pos.z-mn[1])<200){ok=true;break;}
        if(!ok) for(const sh of (A.SILHOUETTE_SHRINES||[])) if(Math.hypot(pos.x-sh[0],pos.z-sh[1])<60){ok=true;break;}
        /* the owner's own re-specified quarry sites and their laborer houses
           (71-industry.js, QUARRY_EXEMPT) -- each disc carries its own radius */
        if(!ok) for(const qe of (A.QUARRY_EXEMPT||[])) if(Math.hypot(pos.x-qe[0],pos.z-qe[1])<qe[2]){ok=true;break;}
        if(!ok){ n++; if(!far||d>far[2]) far=[pos.x|0,pos.z|0,d|0,fam]; } }}});
  R.push({name:'built-inside-limit', ok:n===0,
          detail: n? n+' built instances beyond CITY_LIM and not part of a farmstead or manor, furthest '+JSON.stringify(far)
                   : 'built fabric within '+K.CITY_LIM+'; outside it only '+JSON.stringify(census)});
}
return R;}"""

BUDGET_JS = """()=>{const B=window._api&&window._api.BUDGET; if(!B) return null;
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
            b = await launch_chromium(p)
            pg = await b.new_page(viewport={"width": 1000, "height": 640})
            pg.set_default_timeout(300000)   # a 1.8 MB world: 30 s screenshots time out under software GL
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            three = local_three(folder)
            if os.path.exists(three):
                await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{port}/{name}", timeout=LOAD_MS)
            # Voth sets no _ready flag; the probe (85) is the last thing the build defines.
            # A fixed 9 s wait alone measured a half-built world on a loaded machine.
            try:
                await pg.wait_for_function("window._ready===true || !!window._api || (document.getElementById('errs')&&"
                                           "document.getElementById('errs').textContent.length>0)", timeout=580000)
            except Exception:
                print("timed out waiting for the world to build")
            await pg.wait_for_timeout(9000)
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

            presets = await pg.evaluate(
                "()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
            views = parse_views(a.views, presets)
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
                    fn = os.path.join(a.out, "view_" + v.replace(" ", "_").replace("/", "-") + ".png")
                    await pg.screenshot(path=fn)
                    print("shot:", fn)
                except Exception as e:
                    print("view failed:", v, e)

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
    sys.exit(asyncio.run(run(ap.parse_args())))
