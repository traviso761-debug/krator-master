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
  7. Screenshots each named preset view; --sweep samples the flyers' window._legs
     against the registered volumes, the trunks and the ground (see SWEEP_JS).

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
# --sweep: do the flyers' sample legs (window._legs, 84-flyers.js) pass through
# anything solid? The solids are NOT mesh bounding boxes: this city is merged
# into a few meshes whose boxes span the whole map, so every sample hit one. They
# are rebuilt from the page's own data instead:
#   * every REGISTER()ed volume (SITES: levels, rooms, huts, towers, stairs...)
#     as its cylinder, with the open-air ones (a deck's 30 m of sky, plazas,
#     farms, yards) cut down to their floor or dropped;
#   * every tree's trunk from the layout contract trunkR(T,y) (TREES + FARTREES),
#     not the registry's coarse cylinder;
#   * rope bridges as their segment (SITES .seg), not a circle round the span;
#   * the ground.
# A leg's own platform (the one its bay is on) is skipped, and so are the last
# 12 m to the bay, where the flyer lands by design.
SWEEP_JS = r"""()=>{
const A=window._api; if(!window._legs) return {note:'no window._legs defined'}; if(!A) return {note:'window._api missing'};
// by label or kind: a deck registers 30 m of the air above it; keep its slab and rail
const FLOOR={Deck:2.4,'Bough platform':2.1,roostdeck:2.1};
// open ground, or a ring registered as a disc (Girder's palisade); trees are handled below
const AIR={farm:1,plaza:1,market:1,muster:1,proving:1,yard:1,cataract:1,plot:1,ford:1,palisade:1,tree:1};
const vols=[];
for(const s of A.SITES){ if(AIR[s.kind]) continue; if(s.kind==='log'&&s.name==='Log bridge'&&s.y===0) continue;
  const fl=FLOOR[s.label]!=null?FLOOR[s.label]:FLOOR[s.kind]; const h=fl!=null?Math.min(s.h,fl):s.h;
  vols.push({x:s.x,z:s.z,y0:s.y,y1:s.y+h,r:s.r,seg:s.kind==='bridge'?s.seg:null,plat:s.plat,kind:s.kind,label:s.label,name:s.name}); }
const trees=A.TREES.concat(A.FARTREES||[]);
const segD=(px,pz,ax,az,bx,bz)=>{const vx=bx-ax,vz=bz-az,L=vx*vx+vz*vz,t=L>0?Math.max(0,Math.min(1,((px-ax)*vx+(pz-az)*vz)/L)):0;return Math.hypot(px-ax-vx*t,pz-az-vz*t);};
const ownPlat=(q)=>{let best=null,bd=1e9;for(const P of A.PLATS){const d=Math.hypot(q.x-P.x,q.z-P.z)-P.R*Math.max(P.sx||1,P.sz||1);if(d<bd&&Math.abs(q.y-P.y)<40){bd=d;best=P;}}return bd<12?best:null;};
const what=(p,own)=>{
  if(p.y<A.terrainH(p.x,p.z)) return 'ground';
  for(const T of trees){ if(p.y<T.y0||p.y>T.y0+T.H*(T.crown0||1)) continue; const dx=p.x-T.x,dz=p.z-T.z; if(Math.abs(dx)>80||Math.abs(dz)>80) continue;
    if(Math.hypot(dx,dz)<A.trunkR(T,p.y)) return 'trunk'; }
  for(const v of vols){ if(p.y<v.y0||p.y>v.y1) continue; if(own&&v.plat===own.id) continue;
    if(v.seg){ if(segD(p.x,p.z,v.seg[0],v.seg[1],v.seg[2],v.seg[3])<v.seg[4]/2+.5) return 'bridge'; continue; }
    const dx=p.x-v.x,dz=p.z-v.z; if(dx*dx+dz*dz<v.r*v.r) return v.kind+' ('+(v.label||v.name)+')'; }
  return null; };
const p=new THREE.Vector3(), q=new THREE.Vector3(); const hits=[], byKind={}; let samples=0, legsHit=0;
window._legs.forEach((l,li)=>{ const arr=/^arr/.test(l.name); l.curve.getPointAt(arr?1:0,q); const bay=q.clone(); const own=ownPlat(bay);
  let first=null;
  for(let i=3;i<397;i++){ l.curve.getPointAt(i/400,p); if(p.distanceTo(bay)<12) continue; samples++;
    const w=what(p,own);
    if(w){ const k=w.split(' (')[0]; byKind[k]=(byKind[k]||0)+1; if(!first){ first=[l.name,+(i/400).toFixed(2),p.x|0,p.y|0,p.z|0,w]; } } }
  if(first){ legsHit++; hits.push(first); } });
// CONTROL: two straight legs that must hit, so a clean sweep means "clear", not "blind": one through the
// biggest occupied trunk at a third of its height, one through the middle of the largest registered level.
const ctl=[]; { const T=A.TREES.slice().sort((a,b)=>b.rb-a.rb)[0]; if(T){ const y=T.y0+T.H*.3; let n=0;
    for(let i=0;i<=200;i++){ p.set(T.x-150+i*1.5,y,T.z); if(what(p,null)==='trunk') n++; } ctl.push(['trunk',n]); }
  const V=vols.filter(v=>!v.seg&&v.y1-v.y0>3).sort((a,b)=>b.r-a.r)[0]; if(V){ let n=0;
    for(let i=0;i<=200;i++){ p.set(V.x-V.r*1.5+i*V.r*.015,(V.y0+V.y1)/2,V.z); if(what(p,null)) n++; } ctl.push([V.kind,n]); } }
return {legs:window._legs.length,samples,volumes:vols.length,trunks:trees.length,legsHit,byKind,first:hits.slice(0,12),
        control:ctl, controlOK:ctl.length===2&&ctl.every(c=>c[1]>0)};}"""

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
// 57-interiors.js: every 12th unit planned and furnished (not drawn). Every unit has rooms, keeps its programme, and
// every home holds a bed, a food container and an item container.
{ const I=window._interiors; if(!I||!I.audit) R.push({name:'interiors-coherent', ok:true, detail:'interiors off'});
  else { const a=I.audit(12), ok=a.checked>0 && !a.noRooms.length && !a.dropped.length && a.homesOk===a.dwellings;
    R.push({name:'interiors-coherent', ok, detail: ok ? a.checked+' of '+I.units+' units checked ('+JSON.stringify(a.byKind)+'), '+a.homesOk+' homes each with a bed, food and a chest; rooms '+JSON.stringify(a.rooms)+'; '+a.windows+' windows, '+a.lights+' lights; bake '+I.bake+' ('+a.fromBake+' of the checked from it, '+I.stale+' units stale: rerun bake_interiors.py if not 0); '+a.ms+' ms'
      : JSON.stringify({noRooms:a.noRooms.slice(0,6), dropped:a.dropped, residenceFails:a.residenceFails, missing:a.missing})}); } }
return R;}"""

# The catalog furniture (53-furnish.js: the 'catalog-furniture' group, meshes tagged userData.furniture) has
# its own budget line: BUDGET.triangles keeps guarding the world's own fabric as it did before the furniture
# moved into the catalog, so its count EXCLUDES the furniture the camera draws. The furniture's own line counts it at
# full detail: core/lod keeps each original on layer 30 (unseen; mask bit 0x40000000) and draws copies (userData.lodCopy,
# carrying the original's userData), so the originals give a figure that does not move with the view.
# The interiors (57-interiors.js, userData.interiors: the rooms near the camera) have a line of their own too.
BUDGET_JS = """()=>{const B=(typeof BUDGET!=='undefined')?BUDGET:(window._api&&window._api.BUDGET); if(!B) return null;
const L30=0x40000000, tri=g=>{ const n=g.index?g.index.count:g.attributes.position.count, dr=g.drawRange; return Math.floor(Math.min(n, dr.count===Infinity?n:dr.count)/3); };
let ft=0, fd=0, fc=0, it=0; scene.traverseVisible(o=>{ if(!o.isMesh) return;
  if(o.userData.interiors){ it+=tri(o.geometry); fd+=tri(o.geometry); return; }
  if(!o.userData.furniture) return;
  if(!o.userData.lodCopy) ft+=tri(o.geometry);                  /* the furniture at full detail: its budget */
  if(!(o.layers.mask&L30)){ fd+=tri(o.geometry); fc++; } });    /* what the camera draws of it: taken off the world's count */
return {budget:B, calls:renderer.info.render.calls, tris:renderer.info.render.triangles-fd, furnTris:ft, furnCalls:fc, interiorTris:it,
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
            W, H = [int(t) for t in a.size.split("x")]
            pg = await b.new_page(viewport={"width": W, "height": H})
            pg.set_default_timeout(300000)
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            three = local_three(folder)
            if os.path.exists(three):
                await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
                    route.fulfill(path=three, content_type="application/javascript")))
            await pg.goto(f"http://127.0.0.1:{port}/{name}", timeout=LOAD_MS)
            try:
                await pg.wait_for_function("window._ready===true || (document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)", timeout=580000)   # software GL on a shared box: 170 s timed out mid-build
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
                    rows = [("drawCalls", bg["calls"]), ("triangles", bg["tris"]), ("instances", bg["instances"])]
                    if "furnitureTriangles" in bg["budget"]:
                        rows.append(("furnitureTriangles", bg["furnTris"]))
                    if "interiorTriangles" in bg["budget"]:
                        rows.append(("interiorTriangles", bg["interiorTris"]))
                    print("  (triangles = the world without the catalog furniture and the interiors; drawCalls include their %d + interiors' meshes)" % bg["furnCalls"])
                    for k, cur in rows:
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
                sw = await pg.evaluate(SWEEP_JS)
                print("route sweep:", json.dumps(sw))
                if "note" not in sw:
                    if not sw["controlOK"]:
                        print("  SWEEP BLIND: a control leg through a trunk / a level hit nothing")
                        fails.append("sweep control")
                    elif sw["legsHit"]:
                        print("  %d of %d legs pass through something (first hits above)" % (sw["legsHit"], sw["legs"]))
                        fails.append("sweep %d legs" % sw["legsHit"])
                    else:
                        print("  clear: %d legs, %d samples, none inside a trunk, a registered volume, a bridge or the ground"
                              % (sw["legs"], sw["samples"]))

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
