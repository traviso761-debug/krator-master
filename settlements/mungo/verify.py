#!/usr/bin/env python3
"""Headless verification for Mungo (Locus's harness; the --assert invariants are Mungo's own, from its brief).

Usage:
  python3 verify.py locus.html [--views "Overview,River mouth"] [--all-views]
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

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;const v=window[k];let s=null;try{s=JSON.stringify(v);}catch(e){continue;}if(typeof v==='function')continue;w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""

# --------------------------------------------------------------------------
# Geometric invariants. Each returns {name, ok, detail}. Add one here every
# time a bug costs more than one round to find.
ASSERT_JS = r"""()=>{
const A = window._api; if(!A) return [{name:'probe', ok:false, detail:'window._api missing'}];
const R=[]; if(A.TARGET!=='world'){ const kind = A.TARGET==='furn'?'furniture' : A.TARGET==='flora'?'plant' : 'asset';
  const n=A.SITES.filter(s=>s.kind===kind).length; R.push({name:'sheet-assets-registered', ok:n>=1, detail:n+' named '+kind+' items on the sheet'});
  const names={}; let dup=[]; A.SITES.forEach(s=>{ if(s.kind===kind){ if(names[s.name]) dup.push(s.name); names[s.name]=1; } }); R.push({name:'asset-names-unique', ok:!dup.length, detail:dup.length?JSON.stringify(dup.slice(0,8)):Object.keys(names).length+' unique '+kind+' names'});
  if(A.TARGET==='furn'){ let bad=[]; A.FURNS.forEach(f=>{ if(!f.culture) bad.push(f.key); }); R.push({name:'furniture-culture-tagged', ok:!bad.length, detail: bad.length?JSON.stringify(bad):A.FURNS.length+' pieces, every one tagged with a culture'}); }
  if(A.TARGET==='flora'){ let bad=[]; A.PLANTS.forEach(f=>{ if(A.PLANT_CLIMATES.indexOf(f.climate)<0 || A.PLANT_ARIDITY.indexOf(f.aridity)<0) bad.push(f.key); }); R.push({name:'plant-climate-tagged', ok:!bad.length, detail: bad.length?JSON.stringify(bad):A.PLANTS.length+' species, every one tagged with a climate and an aridity'}); }
  return R; }
/* ---- THE MUNGO WORLD: the brief's own sentences, measured (settlements/mungo/DESIGN.md). ---- */
const S=window._streets||{};
R.push({name:'street-network-connected', ok:!!S.connected && A.NAV.reachable===A.NAV.nodes.length, detail:'streets '+JSON.stringify({nodes:S.nodes,edges:S.edges,joined:S.joined,removed:S.removedNodes,grown:S.grown&&S.grown.nodes})+' · walk graph '+A.NAV.reachable+'/'+A.NAV.nodes.length+' reachable from the market'});
{ /* "highways leading north and south off the map" */
  const H=A.HIGHWAYS.filter(h=>h.cls==='highway'), M=1150; let n=0, s=0, bad=[];
  H.forEach(h=>{ const p=h.pts[h.pts.length-1]; if(p[1] < -M+40) n++; else if(p[1] > M-40) s++; else bad.push(h.name+' stops at '+[p[0]|0,p[1]|0]); });
  R.push({name:'highways-north-and-south-off-the-map', ok:n===1&&s===1&&!bad.length, detail:bad.length?JSON.stringify(bad):n+' north, '+s+' south, both to the map edge'}); }
{ /* "one main street connecting the headman's house to the pontoon bridge": straight, market to the headman's door */
  const N=A.MAIN_STREET.nodes, a=N[0], b=N[N.length-1]; let dev=0; N.forEach(n=>{ const vx=b.x-a.x, vz=b.z-a.z, L=Math.hypot(vx,vz); dev=Math.max(dev, Math.abs((n.x-a.x)*vz-(n.z-a.z)*vx)/L); });
  const H=A.HEADMAN, dH=Math.hypot(b.x-(H.x+Math.sin(H.ry)*(H.d/2+3)), b.z-(H.z+Math.cos(H.ry)*(H.d/2+3)));
  const dM=Math.hypot(a.x-A.MARKET.x, a.z-A.MARKET.z)-A.MARKET.r;
  R.push({name:'main-street-market-to-headman', ok:dev<14 && dH<3 && dM<5, detail:N.length+' nodes, '+Math.hypot(b.x-a.x,b.z-a.z).toFixed(0)+' m, off the straight line by at most '+dev.toFixed(1)+" m; ends "+dH.toFixed(1)+" m from the headman's door and "+dM.toFixed(1)+' m from the square'}); }
{ /* "a single reed pontoon bridge connects it to a smaller village": the reed decks join the land by one edge only */
  const reedN=new Set(); A.NAV.nodes.forEach(n=>{ if(n.tag==='island'||n.tag==='door'&&n.island!=null||n.tag==='pierhead'||n.tag==='bridgeend'||n.tag==='pontoon'||n.tag==='pad') reedN.add(n.id); });
  let cross=0; A.NAV.edges.forEach(e=>{ if(reedN.has(e.a)!==reedN.has(e.b)) cross++; });
  const P=A.PONTOON, L=Math.hypot(P.b[0]-P.a[0],P.b[1]-P.a[1]);
  R.push({name:'one-pontoon-to-the-land', ok:cross===1, detail:cross+' walk edge(s) between the reed village and the land; the pontoon is '+L.toFixed(0)+' m'}); }
{ /* "a reed village, about 2x the size of the existing one" (the kit village: 6 islands, 13 buildings, 160 x 126 m) */
  const Rd=window._reed||{}, I=A.REED.islands; let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; I.concat(A.REED.pads).forEach(k=>{ x0=Math.min(x0,k.x-k.rx); x1=Math.max(x1,k.x+k.rx); z0=Math.min(z0,k.z-k.rz); z1=Math.max(z1,k.z+k.rz); });
  const area=(x1-x0)*(z1-z0), nb=Rd.buildings||0;
  R.push({name:'reed-village-twice-the-kit-village', ok:I.length>=12 && nb>=26 && area>=2*160*126, detail:I.length+' islands, '+nb+' buildings placed, '+(x1-x0|0)+' x '+(z1-z0|0)+' m ('+(area/(160*126)).toFixed(1)+'x the kit village)'+(Rd.missing&&Rd.missing.length?' · fallbacks: '+JSON.stringify(Rd.missing):'')}); }
{ /* "one new, large tavern model in the Reed style, labelled Reed's Local" */
  const Rd=window._reed||{}, has=A.SITES.some(s=>/Reed's Local/.test(s.name)); const fb=(Rd.missing||[]).filter(m=>/rl_tavern/.test(m));
  R.push({name:"reeds-local-built", ok:has && !fb.length, detail:(has?"Reed's Local is registered":"no registered site named Reed's Local")+(fb.length?' (the kit has no rl_tavern yet: '+fb[0]+')':'')+(Rd.tavern?' · '+Rd.tavern.w+' x '+Rd.tavern.d+' m':'')}); }
{ /* "many fishing docks and weaving shops" in the reed village */
  const all=A.REED.islands.flatMap(I=>I.buildings); const docks=all.filter(b=>b.key==='rl_dock').length, weav=all.filter(b=>b.key==='rl_weaver').length;
  R.push({name:'reed-docks-and-weavers', ok:docks>=4 && weav>=4, detail:docks+' fishing docks, '+weav+' weaving workshops on the islands; '+A.DOCKS.length+' fishing docks on the shore'}); }
{ /* "a full set of weapon, armor, general, food, alchemy, and building material shops" between the districts */
  const want=['abyss_shop_weapons','abyss_shop_armor','abyss_shop_general','abyss_shop_food','abyss_shop_alchemy','abyss_shop_builder'];
  const got=A.SHOPS.filter(s=>s.rec).map(s=>s.placedKey); const miss=want.filter(k=>got.indexOf(k)<0);
  const far=A.SHOPS.filter(s=>want.indexOf(s.key)>=0 && Math.hypot(s.x-A.MARKET.x,s.z-A.MARKET.z) > A.MARKET.r+30).length;
  R.push({name:'full-set-of-shops-at-the-bridgehead', ok:!miss.length && !far, detail:miss.length?'missing '+JSON.stringify(miss):want.length+' shops round the bridgehead market'}); }
{ /* "several warehouses, a caravanserai, 2 inns, a headman's house, and a city watch" */
  const ok=s=>s&&s.rec; const wh=A.WAREHOUSES.filter(ok).length, inn=A.INNS.filter(ok).length;
  R.push({name:'landward-civic-sites', ok:wh>=3&&inn===2&&!!ok(A.CARAVANSERAI)&&!!ok(A.HEADMAN)&&!!ok(A.WATCH), detail:wh+' warehouses, '+inn+' inns, caravanserai '+!!ok(A.CARAVANSERAI)+', headman '+!!ok(A.HEADMAN)+', watch '+!!ok(A.WATCH)}); }
{ /* "a Geomancer's chapterhouse surrounded by a half dozen Yuni culture residential buildings ... a small parking lot" */
  const C=A.GEOCHAPTER, Y=A.YUNI_HOUSES.filter(h=>h.rec && Math.hypot(h.x-C.x,h.z-C.z) < 95), P=A.PARKING, dP=Math.hypot(P.x-C.x,P.z-C.z);
  R.push({name:'geomancer-quarter', ok:!!(C&&C.rec) && Y.length===6 && dP<90, detail:'chapterhouse '+!!(C&&C.rec)+', '+Y.length+' Yuni houses within 95 m, buggy park '+dP.toFixed(0)+' m from it'}); }
{ /* "only the Geomancer chapterhouse and the surrounding Yuni buildings are electrified" */
  const C=A.GEOCHAPTER; const cool=A.NL_LAMPS.filter(L=>L[5]); const far=cool.filter(L=>Math.hypot(L[0]-C.x,L[2]-C.z) > 130);
  const wiredFar=A.NL_WINDOWS.filter(W=>W[10]===1 && Math.hypot(W[0]-C.x,W[2]-C.z) > 130).length;
  R.push({name:'electric-light-only-in-the-geomancer-quarter', ok:cool.length>0 && !far.length && !wiredFar, detail:cool.length+' electric lamps, '+far.length+' of them outside the quarter; '+wiredFar+' wired windows outside it; '+(A.NL_LAMPS.length-cool.length)+' fires and oil lamps'}); }
{ /* a street that crosses the river does it on a bridge */
  const cross=(ax,az,bx,bz,cx,cz,dx,dz)=>{ const d=(bx-ax)*(dz-cz)-(bz-az)*(dx-cx); if(!d) return null;
    const t=((cx-ax)*(dz-cz)-(cz-az)*(dx-cx))/d, u=((cx-ax)*(bz-az)-(cz-az)*(bx-ax))/d; return (t>=0&&t<=1&&u>=0&&u<=1)?[ax+(bx-ax)*t, az+(bz-az)*t]:null; };
  const P=A.RIVER; let n=0, bad=[];
  A.ST.edges.forEach(e=>{ const p=A.ST.nodes[e.a], q=A.ST.nodes[e.b];
    for(let i=0;i<P.length-1;i++){ const x=cross(p.x,p.z,q.x,q.z,P[i][0],P[i][1],P[i+1][0],P[i+1][1]); if(!x) continue; n++;
      if(!A.BRIDGES.some(B=>Math.hypot(B.x-x[0],B.z-x[1])<(B.L||20)/2+25)) bad.push(e.cls+' at '+[x[0]|0,x[1]|0]); } });
  R.push({name:'river-crossings-bridged', ok:!bad.length, detail: bad.length? bad.length+' unbridged: '+JSON.stringify(bad.slice(0,6)) : n+' street crossings of the river; '+A.BRIDGES.length+' bridges cover them'}); }
{ /* nothing placed may sit on a street, or inside another building (oriented-box test) */
  const B=(A.PLACED||[]).filter(b=>b.tag!=='plant'); let onSt=0, clash=[];
  const cor=(b,pad)=>{ const c=Math.cos(b.ry||0), s=Math.sin(b.ry||0), hw=(b.w||8)/2+pad, hd=(b.d||8)/2+pad;
    return [[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[ b.x + q[0]*hw*c + q[1]*hd*s, b.z - q[0]*hw*s + q[1]*hd*c ]); };
  const hit=(P,Q)=>{ let best=1e9; for(const R2 of [P,Q]) for(let e=0;e<2;e++){
      const ax=R2[e+1][0]-R2[e][0], az=R2[e+1][1]-R2[e][1], L=Math.hypot(ax,az)||1, nx=-az/L, nz=ax/L;
      let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
      for(let i=0;i<4;i++){ const pa=P[i][0]*nx+P[i][1]*nz, pb=Q[i][0]*nx+Q[i][1]*nz; a0=Math.min(a0,pa); a1=Math.max(a1,pa); b0=Math.min(b0,pb); b1=Math.max(b1,pb); }
      if(a1 < b0 || b1 < a0) return false; const ov=Math.min(a1,b1)-Math.max(a0,b0); if(ov<best) best=ov; } return best; };
  B.forEach(b=>{ if(!b.plotName && A.onStreet(b.x,b.z, 2.2)) onSt++; });
  const boxes=B.map(b=>cor(b,0));
  for(let i=0;i<B.length;i++) for(let j=i+1;j<B.length;j++){ if(Math.hypot(B[i].x-B[j].x, B[i].z-B[j].z) > 120) continue;
    const pen=hit(boxes[i],boxes[j]); if(pen!==false && pen>0.5) clash.push(B[i].key+'/'+B[j].key+' by '+pen.toFixed(1)+'m'); }
  R.push({name:'placement-sane', ok: onSt<=Math.ceil(B.length*0.06) && clash.length===0, detail: B.length+' placed · '+onSt+' close to a street centre · '+(clash.length?clash.length+' box overlaps: '+JSON.stringify(clash.slice(0,5)):'no box overlaps')}); }
{ const miss=(A.SITES_L||[]).filter(s=>!s.rec).map(s=>s.name+' ('+s.key+')'); const fb=(window._place||{}).fallback||[];
  R.push({name:'site-schedule-built', ok:A.SITES_L.length>0&&!miss.length, detail: miss.length?JSON.stringify(miss):A.SITES_L.length+' scheduled sites, all built'+(fb.length?' (fallbacks '+JSON.stringify(fb)+')':'')}); }
{ const n=A.NL_LAMPS.length; R.push({name:'night-lamps-placed', ok:n>=60, detail:n+' lamps (fires, oil and electric), '+A.NL_WINDOWS.length+' lit windows'}); }
{ let onStreet=0, bad=0; A.FARM_PLOTS.forEach(p=>{ if(A.onStreet(p.x,p.z,4)) onStreet++; if(A.maskAt(p.x,p.z)!==7) bad++; });
  R.push({name:'fields-reserved', ok:onStreet===0 && bad===0 && A.FARM_PLOTS.length>=6, detail:A.FARM_PLOTS.length+' farm plots, '+onStreet+' on a street, '+bad+' not marked farmland'}); }
{ R.push({name:'forest-work-grounds', ok:A.LOGGING.length>=3 && A.FORAGE.length>=4, detail:A.LOGGING.length+' logging landings on tracks, '+A.FORAGE.length+' fruit groves'}); }
{ const names=A.SITES.map(s=>s.name); R.push({name:'inspector-sites', ok:names.length>80, detail:names.length+' registered sites'}); }
{ /* the life layer (84-mungo-life*): the scheduling system's own audits, when it is built */
  const L=window._sim; if(L){ const au=L.audit?L.audit():null;
    R.push({name:'life-schedules-resolve', ok:!!au && !au.unknownActivities.length && !au.unroutable.length && au.people>=300, detail:au?JSON.stringify({people:au.people, places:au.places, roles:au.roles, unknown:au.unknownActivities.slice(0,4), unroutable:au.unroutable.slice(0,4), short:au.capacity.length}):'no audit'}); } }
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
                await pg.evaluate("(h)=>{ if(window._dbg && _dbg.setHour) _dbg.setHour(h); }", a.hour)
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

            if a.wait:
                await pg.wait_for_timeout(a.wait)
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
            for i, ev in enumerate(a.shot_eval or []):
                try:
                    r = await pg.evaluate(ev)
                    await pg.wait_for_timeout(900)
                    fn = os.path.join(a.out, "ev%d.png" % i); await pg.screenshot(path=fn); print("shot:", fn, json.dumps(r)[:300])
                except Exception as e:
                    print("shot-eval failed:", str(e)[:400])
            for ev in (a.eval or []):
                try:
                    print("eval:", json.dumps(await pg.evaluate(ev))[:40000])
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
    ap.add_argument("--shot-eval", action="append", help="JS arrow function to run, then screenshot evN.png (repeatable)")
    ap.add_argument("--wait", type=int, default=0, help="ms to let the world run before the shots")
    ap.add_argument("--eval", action="append", help="JS arrow function source to evaluate and print (repeatable)")
    ap.add_argument("--size", default="1000x640")
    sys.exit(asyncio.run(run(ap.parse_args())))
