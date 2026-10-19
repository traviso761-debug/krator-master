#!/usr/bin/env python3
"""Headless verification for Hook (settlements/hook) on the shared harness (tools/harness.py).

Usage:
  python3 verify.py dist/hook.html [--views "Overview;The hill behind"] [--all-views]
                                  [--assert] [--strict-budget] [--out ./shots]
                                  [--cam=cx,cy,cz,tx,ty,tz] [--eval "()=>..."] [--size 1280x800]

What it does: serves the page's folder, loads it in headless Chromium (SwiftShader), prints the error panel and the
renderer's counts, runs the invariants with --assert, screenshots the named presets (or every one with --all-views)
and any --cam. Exit code 1 if the error panel is dirty, a page error fired, an invariant failed or (with
--strict-budget) a budget was exceeded.

The invariants are the Ancient Port kit's (settlements/port/verify.py, imported: the six Ancients invariants and the
page's own `_api.extra()` checks, port-stamps-inside-footprint and port-clearance) plus Hook's own:
  port-every-key   every key registered with PORT_SEG or PORT_VESSEL is placed at least once (a layout item, or a
                   vessel a berth placed): settlements/hook/PLAN.md, section 2.

The site editor: `python3 verify.py dist/hook-site.html --assert` runs the editor's own checks instead (hook-site-loaded,
-select, -moved, -tools, -roundtrip: SITE_CHECK_JS) and shots the map and city views.

SwiftShader flakes about one run in seven with a null shader-info-log TypeError: re-run before believing it. Budget
20-40 s a screenshot; keep a run to 16 views and background it.
"""
import argparse, asyncio, importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import STATS_JS, launch_chromium, open_page, parse_views, serve

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


def port_asserts():
    """The kit's ASSERT_JS (settlements/port/verify.py), imported so a check added there reaches Hook."""
    spec = importlib.util.spec_from_file_location('port_verify', os.path.join(ROOT, 'settlements', 'port', 'verify.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.ASSERT_JS


# Hook's own invariants, appended to the kit's. Each returns {name, ok, detail}; budget:true marks a soft one.
HOOK_ASSERT_JS = r"""()=>{
const R=[];
// every registered segment and vessel is placed at least once (PLAN.md section 2: "every Port segment, placed once")
{ const reg=Object.keys(PORT_REG.seg).concat(Object.keys(PORT_REG.vessel)).sort();
  const placed={};for(const it of PORT_LAYOUT.items)placed[it.key]=(placed[it.key]||0)+1;
  for(const v of PORT_VPLACED)if(!PORT_LAYOUT.items.some(it=>it.vessel===true&&it.key===v.key&&it.gx===v.x&&it.gz===v.z))placed[v.key]=(placed[v.key]||0)+1;
  const miss=reg.filter(k=>!placed[k]);
  R.push({name:'port-every-key',ok:!miss.length,
          detail: miss.length ? miss.length+' of '+reg.length+' keys never placed: '+miss.join(', ')
                              : reg.length+' keys placed ('+Object.keys(placed).filter(k=>placed[k]>1).map(k=>k+' x'+placed[k]).join(', ')+' repeat)'}); }
// (soft) every vessel's midship is over water deeper than its draft: a hull over shallower ground is a hull through a quay or aground
{ const bad=[];for(const v of PORT_VPLACED){const V=PORT_REG.vessel[v.key];if(!V)continue;const h=terrainH(v.x,v.z);
    if(h>-V.draft+1.5)bad.push(v.key+'/'+v.d+' ground '+h.toFixed(1)+' m at midship, draft '+V.draft);}
  R.push({name:'hook-vessels-afloat',ok:!bad.length,budget:true,detail:bad.length?bad.join(' | '):PORT_VPLACED.length+' vessels, every midship over water deeper than its draft'}); }
// P1: the site ran on core/city (steps 0-5): the quarters, the avenues and every footprint filed as a landmark
{ const C=window._city||{};const ok=!!C.ready&&C.districts>=10&&C.ways>=3&&C.landmarks>=PORT_LAYOUT.items.filter(it=>it.vessel!==true).length;
  R.push({name:'hook-site-plan',ok,detail:C.ready?(C.districts+' quarters, '+C.ways+' ways, '+C.landmarks+' landmark footprints ('+C.hosts+' Ancient hosts); '+JSON.stringify(C.log)):'the city plan did not run'}); }
// P1: every named host of the site is placed (an unplaced one overlapped a Port footprint and reported an error)
{ const want=(HOOK_SITE.hosts||[]).map(h=>h.id),have=PORT_LAYOUT.items.filter(it=>it.ancient).map(it=>it.opt.hostId);
  const miss=want.filter(id=>have.indexOf(id)<0);
  R.push({name:'hook-hosts-placed',ok:!miss.length,detail:miss.length?'named hosts not placed: '+miss.join(', '):want.length+' named hosts and '+(have.length-want.length)+' drawn on the grid'}); }
// P1: the Heights stand 24 m or more above the quays at the palace's marker (the plan's 25-40; the scale model's own
// slope gives more: README.md "The ground"), and the hill behind the site rises 60 m or more over the quays
{ const B=(HOOK_SITE.markers||[]).find(m=>m.id==='B'),r=HOOK_GROUND.ridge,c=HOOK_GROUND.hill,F=HOOK_GROUND.fromModel;
  const hB=B?terrainH(B.x,B.z)-PORT.DECK:null,hC=terrainH(0,c.z0-20)-PORT.DECK;
  const ok=hB!=null&&hB>=24&&hC>=60;
  R.push({name:'hook-heights',ok,detail:'the palace marker stands '+(hB==null?'?':hB.toFixed(1))+' m above the quays, the hill behind '+hC.toFixed(1)+' m; the model gives the ridge: '+F.ridge+', the hill: '+F.hill+' (a stamp is kept only where it does not)'}); }
// the scale model's ground (75d-hook-world.js): the kit's frame stands at the 1:1 shoreline (the natural ground at the
// origin within 12 m of sea level: the shoreline is found on the land without its fine terms, which add up to ~10 m;
// the sea 300 m out, land 300 m in), and the report's numbers for the README
{ const W=HOOK_WORLD,h0=W.natH(0,0),hs=W.natH(0,300),hl=W.natH(0,-300);
  const ok=Math.abs(h0)<=12&&hs<0&&hl>0;
  R.push({name:'hook-world',ok,detail:'natural ground at the origin '+h0.toFixed(2)+' m, 300 m seaward '+hs.toFixed(1)+', 300 m inland '+hl.toFixed(1)+'; '+JSON.stringify(W.report)}); }
// P1: every Ancient host and quarter has a core/tags record before it was drawn
{ const T=PORT_LAYOUT.hook&&PORT_LAYOUT.hook.tags,a=T?T.audit():null,n=PORT_LAYOUT.items.filter(it=>it.ancient&&it.tag).length;
  R.push({name:'hook-tags',ok:!!a&&n===PORT_LAYOUT.items.filter(it=>it.ancient).length,detail:a?(a.records+' records, '+n+' hosts tagged; unknown vocabulary '+a.unknown):'no registry'}); }
// P2: the town's lots (steps 6-12): some hundreds of them, of every culture the quarters name
{ const C=window._city||{},recs=C.recs||[],L=C.log||{};const cults=Object.keys(L.byCulture||{});
  R.push({name:'hook-lots',ok:recs.length>=300&&cults.length>=5,detail:recs.length+' lots: '+JSON.stringify(L.byCulture)+' classes '+JSON.stringify(L.byClass)+'; salvage '+L.salvage+', host lots '+L.hostLots+'; ways '+JSON.stringify(L.ways)}); }
// P2: no two standing footprints overlap: every lot's BUILDING box (its yard may touch a neighbour's) and every landmark's
// footprint, exact SAT with 0.1 m slack
{ const C=window._city||{},P=C.plan,KL=KCITY.lib,pairs=[];
  if(P){const B=(C.boxes||[]).map(l=>{const o=l.box;return {id:l.id,key:l.key,c:o.c,u:o.u,v:[-o.u[1],o.u[0]],hw:o.hw,hd:o.hd,r:Math.hypot(o.hw,o.hd)};});
    const proj=(b,ax)=>{const cx=b.c[0]*ax[0]+b.c[1]*ax[1],e=Math.abs((b.u[0]*ax[0]+b.u[1]*ax[1])*b.hw)+Math.abs((b.v[0]*ax[0]+b.v[1]*ax[1])*b.hd);return [cx-e,cx+e];};
    const sep=(a,b)=>{for(const ax of [a.u,a.v,b.u,b.v]){const p=proj(a,ax),q=proj(b,ax);if(p[1]<q[0]+.1||q[1]<p[0]+.1)return true;}return false;};
    for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j];if(Math.hypot(a.c[0]-b.c[0],a.c[1]-b.c[1])>a.r+b.r)continue;if(!sep(a,b))pairs.push([a.key+'#'+a.id,b.key+'#'+b.id]);}
    R.push({name:'hook-lots-overlap',ok:!pairs.length,detail:pairs.length?pairs.length+' overlapping pairs: '+JSON.stringify(pairs.slice(0,5)):B.length+' footprints, none overlap'});}
  else R.push({name:'hook-lots-overlap',ok:false,detail:'no plan'}); }
// P2: nothing stands on a street (no building corner on a STREET cell) or in the water (every corner on ground above sea level)
{ const C=window._city||{},recs=C.recs||[],KL=KCITY.lib,onStreet=[],wet=[];
  for(const L of recs){const o={c:[L.x,L.z],u:[Math.cos(L.ry),-Math.sin(L.ry)],v:[Math.sin(L.ry),Math.cos(L.ry)],hw:L.w/2-.3,hd:L.d/2-.3};
    const corners=[[1,1],[1,-1],[-1,1],[-1,-1]].map(s=>[o.c[0]+o.u[0]*o.hw*s[0]+o.v[0]*o.hd*s[1],o.c[1]+o.u[1]*o.hw*s[0]+o.v[1]*o.hd*s[1]]).concat([o.c]);
    if(corners.some(p=>C.raster(p[0],p[1])===C.OCC.STREET))onStreet.push(L.key+'#'+L.id);
    if(corners.some(p=>terrainH(p[0],p[1])<0.2))wet.push(L.key+'#'+L.id);}
  R.push({name:'hook-lots-off-street',ok:!onStreet.length,detail:onStreet.length?onStreet.length+' on a street: '+onStreet.slice(0,5).join(', '):recs.length+' lots, none on a carriageway'});
  R.push({name:'hook-lots-dry',ok:!wet.length,detail:wet.length?wet.length+' in the water: '+wet.slice(0,5).join(', '):recs.length+' lots, every corner on dry ground'}); }
// P2: every piece near the opening camera built (its kit's closure ran it) and the massing stands for the rest
{ const C=window._city||{},S=C.draw||{},F=C.failed||{},n=Object.keys(F).length;
  R.push({name:'hook-lots-drawn',ok:S.protos>0&&n===0,detail:S.protos+' prototypes built, '+S.near+' near in full, '+S.massing+' as massing, '+S.footings+' footings'+(n?'; FAILED '+n+': '+JSON.stringify(Object.keys(F).slice(0,6).map(k=>k+' '+String(F[k]).slice(0,80))):'')}); }
return R;}"""


# The site editor (dist/hook-site.html): the page opened the current site, every quarter, marker, avenue and named host
# can be selected and moved (through the tools, on a scratch copy), the tools round-trip (add, undo, redo, raise, undo),
# and a save round-trips: SITE.clean(JSON.parse(SITE.json())) is the site again, with the quarters' fields, the hosts and
# the grid. Returns {err, from, counts, select, moved, tools, roundTrip}.
SITE_CHECK_JS = r"""()=>{
const out={err:_site.error||null,from:_site.from,counts:{}};
if(out.err)return out;
const S=SITE.data,keep=JSON.stringify(S);
out.counts={districts:S.districts.length,quarters:S.districts.filter(d=>d.type==='quarter').length,markers:S.markers.length,avenues:S.avenues.length,hosts:S.hosts.length,gridRows:S.grid.rows.length};
/* every item selects (with the fly) and draws its marks; a quarter carries its fields */
const sel=[];let marks=0;
const tryS=(k,id)=>{try{TOOL.select({kind:k,id},true);if(!TOOL.item()||TOOL.item().id!==id)sel.push(k+':'+id+' not selected');marks+=TOOL.objs.length;}catch(e){sel.push(k+':'+id+' threw '+e.message);}};
S.districts.forEach(d=>tryS('district',d.id));S.markers.forEach(m=>tryS('marker',m.id));S.avenues.forEach(a=>tryS('avenue',a.id));S.hosts.forEach(h=>tryS('host',h.id));
out.select={failed:sel,marks};
const q=S.districts.find(d=>d.type==='quarter');out.quarterFields=q?{layer:q.layer,ruin:q.ruin,cultures:Object.keys(q.cultures||{}).length,holder:!!q.holder,mood:q.mood}:null;
/* moves, the way a drag ends (the record's x/z, then changed()): a marker, a host and a quarter's corner */
const m=S.markers[0],h=S.hosts[0],d=S.districts.find(x=>x.type==='quarter');
TOOL.select({kind:'marker',id:m.id});m.x+=10;SITE.dirty=true;SITE.changed();
TOOL.select({kind:'host',id:h.id});h.z-=10;SITE.changed();
TOOL.select({kind:'district',id:d.id});d.poly[0][0]+=5;SITE.changed();
out.moved={marker:SITE.marker(m.id).x,host:SITE.host(h.id).z,corner:SITE.district(d.id).poly[0][0],listRows:document.querySelectorAll('#items .it').length,editor:document.getElementById('editor').style.display};
/* the tools: a quarter, two markers, a host, an avenue; undo, redo; a raise stroke moves the ground and undoes */
const n0={d:S.districts.length,m:S.markers.length,h:S.hosts.length,a:S.avenues.length};
const Q=SITE.addDistrict('quarter',[[-600,-900],[-400,-900],[-400,-1000],[-600,-1000]]);
const M1=SITE.addMarker(-500,-950),M2=SITE.addMarker(-520,-960);
const H=SITE.addHost('anBell',-300,-950);SITE.addLine('avenue',[[-600,-950],[-300,-950]]);
SITE.doUndo();const afterUndo=SITE.data.avenues.length-n0.a;SITE.doRedo();
const h0=TERR.h(-500,-950);TOOL.terrLive=false;SITE.edit(X=>{X.terrain.push({m:'raise',r:80,s:6,pts:[[-500,-950]]});});const h1=TERR.h(-500,-950);SITE.doUndo();
out.tools={quarter:Q.type,newMarkers:M1.id!==M2.id?2:1,host:H.key,hostId:H.id,avenues:SITE.data.avenues.length-n0.a,afterUndo,raised:+(h1-h0).toFixed(2),undoneGround:+(TERR.h(-500,-950)-h0).toFixed(2),
  added:{d:SITE.data.districts.length-n0.d,m:SITE.data.markers.length-n0.m,h:SITE.data.hosts.length-n0.h}};
/* the save round-trips: what SITE.json writes, cleaned again, is the site */
SITE.load(JSON.parse(keep));
const J=JSON.parse(SITE.json()),back=SITE.clean(J);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
out.roundTrip={keys:Object.keys(J),districts:same(back.districts,SITE.data.districts),markers:same(back.markers,SITE.data.markers),avenues:same(back.avenues,SITE.data.avenues),
  hosts:same(back.hosts,SITE.data.hosts),grid:same(back.grid,SITE.data.grid),hostFields:J.hosts.length?Object.keys(J.hosts[0]):[],
  inlineSame:same(SITE.clean(HOOK_SITE).districts.map(d=>d.poly),SITE.data.districts.map(d=>d.poly))};
TOOL.select(null);
return out;}"""


async def run_site(a):
    from playwright.async_api import async_playwright
    folder = os.path.dirname(os.path.abspath(a.html))
    os.makedirs(a.out, exist_ok=True)
    fails = []
    async with async_playwright() as p:
      with serve(os.path.dirname(folder)) as port:   # the folder above dist/, so ../site/hook-site.json is served too
          b = await launch_chromium(p)
          pg, errs, ready = await open_page(b, a.html, port, size=a.size, here=HERE, root=os.path.dirname(folder))
          if not ready:
              print("timed out waiting for the page to build")
              fails.append("build timeout")
          await pg.wait_for_function("window._site && window._site.ready", timeout=120000)
          await pg.wait_for_timeout(1500)
          st = await pg.evaluate(STATS_JS)
          print("ERROR PANEL:", repr(st["errs"]) if st["errs"] else "clean")
          if st["errs"]:
              fails.append("error panel not clean")
          if errs:
              print("PAGE ERRORS:", errs[:5])
              fails.append("page errors")
          r = await pg.evaluate(SITE_CHECK_JS)
          print("site loaded from", r["from"], "; counts", json.dumps(r["counts"]))
          if r.get("err"):
              print("EDITOR ERROR:", r["err"]); fails.append("editor failed")
          else:
              print("select:", json.dumps(r["select"]), "; quarter fields", json.dumps(r["quarterFields"]))
              print("moved:", json.dumps(r["moved"]))
              print("tools:", json.dumps(r["tools"]))
              print("round trip:", json.dumps(r["roundTrip"]))
              if a.assert_:
                  c, t, rt = r["counts"], r["tools"], r["roundTrip"]
                  if r["from"] not in ("server", "inline") or c["quarters"] < 10 or c["markers"] < 9 or c["avenues"] < 3 or c["hosts"] < 8 or not c["gridRows"]: fails.append("assert hook-site-loaded")
                  if r["select"]["failed"] or not r["select"]["marks"] or not r["quarterFields"] or not r["quarterFields"]["layer"]: fails.append("assert hook-site-select")
                  if r["moved"]["editor"] != "block" or r["moved"]["listRows"] < c["districts"] + c["markers"] + c["avenues"] + c["hosts"]: fails.append("assert hook-site-moved")
                  if t["quarter"] != "quarter" or t["newMarkers"] != 2 or t["host"] != "anBell" or t["avenues"] != 1 or t["afterUndo"] != 0 or t["raised"] < 5 or abs(t["undoneGround"]) > 0.01 or t["added"] != {"d": 1, "m": 2, "h": 1}: fails.append("assert hook-site-tools")
                  if not (rt["districts"] and rt["markers"] and rt["avenues"] and rt["hosts"] and rt["grid"] and rt["inlineSame"]) or "cut" not in rt["hostFields"]: fails.append("assert hook-site-roundtrip")
          await pg.evaluate("()=>document.getElementById('v-map').onclick()")
          await pg.wait_for_timeout(1200)
          await pg.screenshot(path=os.path.join(a.out, "site_map.png"))
          await pg.evaluate("()=>document.getElementById('v-city').onclick()")
          await pg.wait_for_timeout(1200)
          await pg.screenshot(path=os.path.join(a.out, "site_city.png"))
          print("shot:", os.path.join(a.out, "site_map.png"), os.path.join(a.out, "site_city.png"))
          await b.close()
    if fails:
        print("\nFAILED: " + "; ".join(fails))
        return 1
    print("\nOK")
    return 0


async def run(a):
    from playwright.async_api import async_playwright
    if 'hook-site' in os.path.basename(a.html):
        return await run_site(a)
    folder = os.path.dirname(os.path.abspath(a.html))
    os.makedirs(a.out, exist_ok=True)
    fails = []
    assert_js = port_asserts()
    async with async_playwright() as p:
      with serve(folder) as port:
          b = await launch_chromium(p)
          pg, errs, ready = await open_page(b, a.html, port, size=a.size, here=HERE)
          if not ready:
              print("timed out waiting for the page to build")
              fails.append("build timeout")
          await pg.wait_for_timeout(2500)
          try:
              st = await pg.evaluate(STATS_JS)
          except Exception as e:
              print("PAGE DID NOT INITIALISE:", str(e).splitlines()[0])
              await b.close()
              return 2
          print("ERROR PANEL:", repr(st["errs"]) if st["errs"] else "clean")
          if st["errs"]:
              fails.append("error panel not clean")
          if errs:
              print("PAGE ERRORS:", errs[:5])
              fails.append("page errors")
          print("draw calls:", st["calls"], "triangles:", st["tris"])
          print("counters:", json.dumps(st["counters"], sort_keys=True))

          if a.assert_:
              print("\n--- invariants ---")
              results = await pg.evaluate(assert_js)
              results += await pg.evaluate(HOOK_ASSERT_JS)
              for r in results:
                  soft = r.get("budget") and not a.strict_budget
                  tag = "  PASS  " if r["ok"] else ("  OVER  " if soft else "  FAIL  ")
                  print(tag + r["name"] + " : " + r["detail"])
                  if not r["ok"] and not soft:
                      fails.append("assert " + r["name"])
              print("\n--- per type (scene triangles, instances, meshes) ---")
              ts = await pg.evaluate("()=>window._api.typeStats()")
              for k in sorted(ts, key=lambda k: -ts[k]["tris"]):
                  v = ts[k]
                  print("  %-14s %9d / %7d  %-6s  inst %7d  meshes %5d%s"
                        % (k, v["tris"], v["limit"], v["cls"], v["inst"], v["meshes"], "   OVER" if v["over"] else ""))

          presets = await pg.evaluate("()=>[...document.querySelectorAll('#ui button')].map(b=>b.textContent.trim())")
          views = presets if a.all_views else parse_views(a.views, presets)
          if len(views) > 16:
              print("\nNOTE: %d views requested; 16 per run is the working limit under software GL." % len(views))
          await pg.screenshot(path=os.path.join(a.out, "initial.png"))
          per_view = []
          for v in views:
              try:
                  ok = await pg.evaluate(
                      "(v)=>{const b=[...document.querySelectorAll('#ui button')].find(b=>b.textContent.trim()===v);"
                      "if(!b)return false;b.click();return true;}", v)
                  if not ok:
                      raise RuntimeError("no such preset")
                  await pg.wait_for_timeout(900)
                  fn = os.path.join(a.out, "view_" + v.replace(" ", "_").replace("/", "-") + ".png")
                  await pg.screenshot(path=fn)
                  st2 = await pg.evaluate("()=>({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})")
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
                  print("  %-28s calls %5d  tris %.2fM%s" % (v, c, t / 1e6, "   OVER" if lim and c > lim else ""))
              if lim and worst[1] > lim:
                  print("  OVER budget: %s at %d / %d draw calls" % (worst[0], worst[1], lim))
                  if a.assert_ and a.strict_budget:
                      fails.append("budget drawCalls (%s)" % worst[0])
          for i, c in enumerate(a.cam or []):
              v = [float(t) for t in c.split(",")]
              await pg.evaluate("(v)=>window._api.setView(v[0],v[1],v[2],v[3],v[4],v[5])", v)
              await pg.wait_for_timeout(900)
              fn = os.path.join(a.out, "%s%d.png" % (a.cam_name, i))
              await pg.screenshot(path=fn)
              print("shot:", fn)
          for ev in (a.eval or []):
              try:
                  print("eval:", json.dumps(await pg.evaluate(ev))[:3000])
              except Exception as e:
                  print("eval failed:", str(e)[:400])
          await b.close()

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
    ap.add_argument("--out", default="./shots")
    ap.add_argument("--cam", action="append", help="custom shot: cx,cy,cz,tx,ty,tz (repeatable; write --cam=... when cx is negative)")
    ap.add_argument("--cam-name", default="cam")
    ap.add_argument("--eval", action="append", help="JS arrow function source to evaluate (repeatable)")
    ap.add_argument("--size", default="1280x800")
    sys.exit(asyncio.run(run(ap.parse_args())))
