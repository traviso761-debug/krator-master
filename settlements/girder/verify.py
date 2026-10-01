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
  7. Screenshots each named preset view; --sweep samples the flyers' window._legs
     against the registered volumes, the trunks and the ground (see SWEEP_JS).

Exit code is non-zero if the error panel is dirty, an assertion fails, or a
budget is exceeded — so it can gate a subagent's hand-off.

Requires: pip install playwright && python3 -m playwright install chromium
"""
import argparse, asyncio, glob, http.server, json, os, re, socketserver, sys, threading

# --------------------------------------------------------------------------
# Harness helpers. Every verify.py in the repo carries this same block: a fix
# here belongs in all of them (grep for "Harness helpers").
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
# Every page builds its world in one synchronous script, so "load" fires only when
# the world is built: minutes under software GL on a shared box (Dalab's city took
# 285 s with seven other agents running; 180 s timed Locus out mid-build).
LOAD_MS = 900000
# KRATOR_CHROME names a Chromium to launch. The other names are the ones single
# copies of this harness used before they were merged; they still work.
CHROME_ENV = ("KRATOR_CHROME", "PW_CHROME", "PW_CHROMIUM", "CHROME_PATH", "VERIFY_CHROME", "CHROMIUM")


async def launch_chromium(p, args=GL_ARGS):
    """$KRATOR_CHROME (or an older name in CHROME_ENV), else playwright's own
    build, else a pinned build under /opt/pw-browsers: a cloud container ships
    one that need not match the pip playwright's pin."""
    for k in CHROME_ENV:
        if os.environ.get(k):
            return await p.chromium.launch(executable_path=os.environ[k], args=args)
    try:
        return await p.chromium.launch(args=args)
    except Exception as e:
        if "Executable doesn't exist" not in str(e):
            raise
        for c in ["/opt/pw-browsers/chromium"] + sorted(
                glob.glob("/opt/pw-browsers/chromium-*/chrome-linux/chrome"), reverse=True):
            if os.path.exists(c):
                return await p.chromium.launch(executable_path=c, args=args)
        raise


def local_three(folder):
    """The pinned three.js r128 to serve in place of the CDN copy: this build's
    own, the page folder's, else the repo's copy in kits/ancients (a build that
    keeps none still runs offline). Returns a path that may not exist."""
    here = os.path.dirname(os.path.abspath(__file__))
    cands = [os.path.join(here, "three.min.js"), os.path.join(folder, "three.min.js")]
    d = here
    for _ in range(4):
        d = os.path.dirname(d)
        cands.append(os.path.join(d, "kits", "ancients", "three.min.js"))
    return next((c for c in cands if os.path.exists(c)), cands[0])


def parse_views(spec, names=()):
    """--views. Names separated by '|' or ';' are taken exactly, so a name may
    hold commas. Separated by commas, consecutive pieces are joined back up
    whenever that spells an existing preset's name, longest first: so
    "Overview,Town types — row, stacked house, well, tower" is two views."""
    spec = (spec or "").strip()
    if not spec:
        return []
    if "|" in spec or ";" in spec:
        return [v.strip() for v in re.split(r"[|;]", spec) if v.strip()]
    names = set(names or ())
    toks, out, i = spec.split(","), [], 0
    while i < len(toks):
        j = next((j for j in range(len(toks), i + 1, -1)
                  if ",".join(toks[i:j]).strip() in names), i + 1)
        v = ",".join(toks[i:j]).strip()
        if v:
            out.append(v)
        i = j
    return out


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
