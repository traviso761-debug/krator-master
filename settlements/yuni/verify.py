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
const R=[]; if(A.TARGET!=='world'){ const kind = A.TARGET==='furn'?'furniture' : A.TARGET==='flora'?'plant' : 'asset';
  const n=A.SITES.filter(s=>s.kind===kind).length; R.push({name:'sheet-assets-registered', ok:n>=1, detail:n+' named '+kind+' items on the sheet'});
  const names={}; let dup=[]; A.SITES.forEach(s=>{ if(s.kind===kind){ if(names[s.name]) dup.push(s.name); names[s.name]=1; } }); R.push({name:'asset-names-unique', ok:!dup.length, detail:dup.length?JSON.stringify(dup.slice(0,8)):Object.keys(names).length+' unique '+kind+' names'});
  if(A.TARGET==='furn'){ let bad=[]; A.FURNS.forEach(f=>{ if(!f.culture) bad.push(f.key); }); R.push({name:'furniture-culture-tagged', ok:!bad.length, detail: bad.length?JSON.stringify(bad):A.FURNS.length+' pieces, every one tagged with a culture'}); }
  if(A.TARGET==='flora'){ let bad=[]; A.PLANTS.forEach(f=>{ if(A.PLANT_CLIMATES.indexOf(f.climate)<0 || A.PLANT_ARIDITY.indexOf(f.aridity)<0) bad.push(f.key); }); R.push({name:'plant-climate-tagged', ok:!bad.length, detail: bad.length?JSON.stringify(bad):A.PLANTS.length+' species, every one tagged with a climate and an aridity'}); }
  return R; }
const S=window._streets||{};
R.push({name:'street-network-connected', ok:!!S.connected && A.NAV.reachable===A.NAV.nodes.length, detail:JSON.stringify(S)+' · walk graph '+A.NAV.reachable+'/'+A.NAV.nodes.length+' reachable from the hub'});
{ const angs=A.GATES.map(g=>g.a).concat([Math.PI/2]).map(a=>((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI)).sort((a,b)=>a-b); let bad=[];
  for(let i=0;i<angs.length;i++){ const d=((angs[(i+1)%angs.length]-angs[i])+2*Math.PI)%(2*Math.PI); if(Math.abs(d-Math.PI/3)>0.01) bad.push(+(d*180/Math.PI).toFixed(1)); }
  R.push({name:'five-gates-and-vault-equidistant', ok:!bad.length&&A.GATES.length===5, detail: bad.length? JSON.stringify(bad) : '5 gates + the Vault, 60 deg apart'}); }
{ let bad=[]; ['NW','NE','SE','SW'].forEach(k=>{ const H=A.HIGHWAYS.find(h=>h.name.indexOf(k)>=0); if(!H){ bad.push(k+' missing'); return; } const p=H.pts[H.pts.length-1]; if(Math.max(Math.abs(p[0]),Math.abs(p[1]))<3600) bad.push(k+' stops short');
    const want={NW:[-1,-1],NE:[1,-1],SE:[1,1],SW:[-1,1]}[k]; if(Math.sign(p[0])!==want[0]||Math.sign(p[1])!==want[1]) bad.push(k+' wrong quadrant'); });
  R.push({name:'highways-leave-the-map', ok:!bad.length, detail: bad.length? JSON.stringify(bad) : 'NW, NE, SE, SW all run off the map and are part of the connected graph'}); }
{ const e0=[Math.cos(A.WALL.a0)*A.RW, Math.sin(A.WALL.a0)*A.RW], e1=[Math.cos(A.WALL.a1)*A.RW, Math.sin(A.WALL.a1)*A.RW];
  const ok=A.inButte(e0[0],e0[1],30,0)&&A.inButte(e1[0],e1[1],30,0); R.push({name:'wall-ends-in-the-butte', ok:ok, detail: ok?'both wall ends are buried in the rock':'a wall end stops short of the butte'}); }
{ let bad=0; A.ST.nodes.forEach(n=>{ if(n.dead) return; if(A.inButte(n.x,n.z,A.terrainH(n.x,n.z)+2,2) || A.riverDist(n.x,n.z)<0) bad++; });
  const br=A.BRIDGES.length; R.push({name:'no-street-in-rock-or-river', ok:bad<=br*2, detail:bad+' nodes in rock/water ('+br+' bridge crossings allowed)'}); }
{ /* every highway must be walkable from its own gate along highway/road edges alone */
  const par=A.ST.nodes.map((n,i)=>i); const f=i=>{ while(par[i]!==i){ par[i]=par[par[i]]; i=par[i]; } return i; };
  A.ST.edges.forEach(e=>{ if(e.dead) return; if(e.cls!=='highway' && e.cls!=='road') return; const a=f(e.a), b=f(e.b); if(a!==b) par[a]=b; });
  let bad=[]; A.HIGHWAYS.forEach(H=>{ const g=A.GATES[H.gate], last=H.nodes[H.nodes.length-1];
    if(!g||!g.node||!last||f(g.node.id)!==f(last.id)) bad.push(H.name); });
  R.push({name:'highways-reach-their-gates', ok:!bad.length, detail: bad.length? JSON.stringify(bad) : A.HIGHWAYS.length+' runs, each continuous from its gate to the map edge'}); }
{ /* nothing placed inside the wall may sit on a street, or inside another building.
     The overlap test is a real oriented-box test, not a circle test, because once the
     buildings are aligned to the grid a circle test is both too strict and too slack. */
  const B=A.PLACED||[]; let onSt=0, clash=[];
  const cor=(b,pad)=>{ const c=Math.cos(b.ry||0), s=Math.sin(b.ry||0), hw=(b.w||8)/2+pad, hd=(b.d||8)/2+pad;
    return [[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[ b.x + q[0]*hw*c + q[1]*hd*s, b.z - q[0]*hw*s + q[1]*hd*c ]); };
  const hit=(P,Q)=>{ let best=1e9; for(const R2 of [P,Q]) for(let e=0;e<2;e++){
      const ax=R2[e+1][0]-R2[e][0], az=R2[e+1][1]-R2[e][1], L=Math.hypot(ax,az)||1, nx=-az/L, nz=ax/L;
      let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;
      for(let i=0;i<4;i++){ const pa=P[i][0]*nx+P[i][1]*nz, pb=Q[i][0]*nx+Q[i][1]*nz;
        a0=Math.min(a0,pa); a1=Math.max(a1,pa); b0=Math.min(b0,pb); b1=Math.max(b1,pb); }
      if(a1 < b0 || b1 < a0) return false;
      const ov=Math.min(a1,b1)-Math.max(a0,b0); if(ov<best) best=ov; } return best; };
  /* a scheduled superblock legitimately sits where the grid was suppressed, so the
     street-centre test applies to the INFILL only */
  B.forEach(b=>{ if(!b.plotName && A.onStreet(b.x,b.z, Math.max(2,(b.rad||4)*0.55))) onSt++; });
  const boxes=B.map(b=>cor(b,0));
  for(let i=0;i<B.length;i++) for(let j=i+1;j<B.length;j++){
    if(Math.hypot(B[i].x-B[j].x, B[i].z-B[j].z) > 120) continue;
    const pen=hit(boxes[i],boxes[j]);
    if(pen!==false && pen>0.5) clash.push(B[i].key+'/'+B[j].key+' by '+pen.toFixed(1)+'m');
  }
  R.push({name:'inner-city-placement-sane', ok: onSt<=Math.ceil(B.length*0.06) && clash.length===0,
          detail: B.length+' buildings · '+onSt+' close to a street centre · '+(clash.length?clash.length+' box overlaps: '+JSON.stringify(clash.slice(0,5)):'no box overlaps')}); }
{ /* NOTHING IN THE ROAD, NOTHING THROUGH A TREE. Both used to be point tests — the packer
     asked about a building's centre and then set down a box whose corners lay in the street. */
  const B=(A.PLACED||[]).filter(b=>b.w!=null);
  const segD=(px,pz,ax,az,bx,bz)=>{const vx=bx-ax,vz=bz-az,wx=px-ax,wz=pz-az,L=vx*vx+vz*vz,
    t=L>0?Math.max(0,Math.min(1,(wx*vx+wz*vz)/L)):0;return Math.hypot(px-(ax+vx*t),pz-(az+vz*t));};
  const samp=b=>{const c=Math.cos(b.ry),s=Math.sin(b.ry),hw=b.w/2,hd=b.d/2,o=[];
    [[-1,-1],[1,-1],[1,1],[-1,1],[0,-1],[1,0],[0,1],[-1,0]].forEach(q=>o.push([b.x+q[0]*hw*c+q[1]*hd*s, b.z-q[0]*hw*s+q[1]*hd*c]));return o;};
  let inRoad=[], worst=0;
  B.forEach(b=>{ const P=samp(b); let w=0;
    for(const e of A.ST.edges){ const p=A.ST.nodes[e.a], q=A.ST.nodes[e.b], pad=e.w/2;
      if(Math.min(p.x,q.x)-pad-40>b.x||Math.max(p.x,q.x)+pad+40<b.x||Math.min(p.z,q.z)-pad-40>b.z||Math.max(p.z,q.z)+pad+40<b.z) continue;
      for(const v of P){ const d=pad-segD(v[0],v[1],p.x,p.z,q.x,q.z); if(d>w) w=d; } }
    if(w>1.0){ inRoad.push(b.key+' by '+w.toFixed(1)+'m'); if(w>worst) worst=w; } });
  let trees=0;
  (A.TREE_SITES||[]).forEach(t=>{ for(const b of B){
      if(Math.hypot(b.x-t[0],b.z-t[1]) > Math.hypot(b.w,b.d)/2+4) continue;
      const c=Math.cos(b.ry), s=Math.sin(b.ry), dx=t[0]-b.x, dz=t[1]-b.z;
      const lx=dx*c-dz*s, lz=dx*s+dz*c, qx=Math.abs(lx)-b.w/2, qz=Math.abs(lz)-b.d/2;
      const dd=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0);
      if(dd < (t[2]||2)-0.5){ trees++; break; } } });
  R.push({name:'nothing-in-the-road-or-through-a-tree',
          ok: inRoad.length <= Math.ceil(B.length*0.01) && trees <= 4,
          detail: B.length+' buildings · '+inRoad.length+' with a box over a street edge by more than a metre'+
                  (inRoad.length?' (worst '+worst.toFixed(1)+'m: '+JSON.stringify(inRoad.slice(0,4))+')':'')+
                  ' · '+trees+' standing trees inside a building'}); }
{ /* the alignment pass: every building should face the hub, the wall, or along the ring */
  const S=(window._place&&window._place.align)||{};
  const B=A.PLACED||[], off=S.offGrid||0;
  R.push({name:'inner-city-aligned-to-grid', ok: off <= Math.ceil(B.length*0.12),
          detail: (B.length-off)+'/'+B.length+' on a grid axis · '+(S.snapped||0)+' took the street-facing axis, '+
                  (S.fellBack||0)+' the next best, '+(S.refused||0)+' refused outright'}); }
{ /* every plot in the schedule produced a building */
  const names=new Set((A.PLACED||[]).map(b=>b.plotName&&b.plotName.replace(/ \d$| \(west\)$| \(east\)$/,'')));
  const miss=(A.PLOTS||[]).filter(P=>!names.has(P.name)).map(P=>P.name);
  R.push({name:'plot-schedule-built', ok:!miss.length, detail: miss.length?JSON.stringify(miss):(A.PLOTS||[]).length+' scheduled plots, all built'}); }
{ /* the life layer: everyone routed, every kind present, the key places found */
  const L = window._life;
  if(!L) R.push({name:'life-layer-alive', ok:false, detail:'window._life missing'});
  else {
    const need = ['factory','lab','guild','hospital','yunilib','order','order_home','caravanserai','depot','market','park','shop','warehouse','fuel'];
    const miss = need.filter(k => !(L.poi[k] > 0));
    const kinds = ['rambler','worker','academic','monk','merchant'].filter(k => !(L.byKind[k] > 0));
    const fails = L.routeFailures();
    R.push({name:'life-layer-alive',
            ok: !miss.length && !kinds.length && L.agents > 200 && L.vehicles > 20 && fails <= L.agents*0.05,
            detail: miss.length ? 'no POI for '+JSON.stringify(miss)
                  : kinds.length ? 'no agents of kind '+JSON.stringify(kinds)
                  : L.agents+' people, '+L.vehicles+' carts and caravans, '+fails+' unroutable, '+
                    Object.keys(L.poi).length+' place categories'}); } }
{ const cool=A.NL_LAMPS.filter(l=>l[5]).length; R.push({name:'vault-electric-light', ok:cool>=30, detail:cool+' electric fittings (cool), '+(A.NL_LAMPS.length-cool)+' oil lamps'}); }
{ const cool=0; let bad=[], prev=1e9, L=A.CANAL_LEN;
  for(let s=0;s<=L;s+=25){ const l=A.canalLevel(s); if(l>prev+1e-6) bad.push(['rises at',s|0]); prev=l; }
  const head=A.canalLevel(0), tail=A.canalLevel(L);
  R.push({name:'canal-falls-all-the-way', ok:!bad.length&&head>tail, detail: bad.length? JSON.stringify(bad.slice(0,4)) : 'head '+head.toFixed(2)+' m -> tail '+tail.toFixed(2)+' m over '+(L|0)+' m'}); }
{ let bad=[], n=0;
  for(let s=0;s<A.CANAL_LEN;s+=20){ const C=A.canalAt(s); n++;
    if(A.inButte(C.x,C.z,A.terrainH(C.x,C.z)+2,6)) bad.push(['in the rock',s|0]);
    if(s>420 && A.riverDist(C.x,C.z) < 40) bad.push(['too near the river',s|0]);
    if(Math.hypot(C.x,C.z) < 760) bad.push(['inside the town',s|0]); }
  R.push({name:'canal-route-sane', ok:!bad.length, detail: bad.length? JSON.stringify(bad.slice(0,4)) : n+' stations: clear of the rock, the river and the built-up area'}); }
{ let onStreet=0, bad=0; A.FARM_PLOTS.forEach(p=>{ if(A.onStreet(p.x,p.z,4)) onStreet++; if(A.maskAt(p.x,p.z)!==7) bad++; });
  R.push({name:'farm-belt-reserved', ok:onStreet===0 && bad===0 && A.FARM_PLOTS.length>150,
          detail:A.FARM_PLOTS.length+' plots, '+onStreet+' on a street, '+bad+' not marked farmland'}); }
{ const mouthOK = A.terrainH(-2600,-2600) < A.terrainH(2600,2600) - 200 && A.terrainH(2600,-2600) > A.terrainH(-2600,-2600) + 200;
  R.push({name:'valley-opens-NW', ok:mouthOK, detail:'NW '+(A.terrainH(-2600,-2600)|0)+' m · SE head '+(A.terrainH(2600,2600)|0)+' m · NE wall '+(A.terrainH(2600,-2600)|0)+' m'}); }
{ const names=A.SITES.map(s=>s.name); R.push({name:'inspector-sites', ok:names.length>40, detail:names.length+' registered sites'}); }
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
