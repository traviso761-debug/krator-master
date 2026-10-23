#!/usr/bin/env python3
"""Headless verification for the dam basins (biomes/dambasins) on the shared harness (tools/harness.py).

Usage:
  python3 verify.py dist/port.html [--views "The old port from the bed,Overview"] [--all-views]
                                  [--assert] [--strict-budget] [--out ./shots]
                                  [--cam=cx,cy,cz,tx,ty,tz] [--eval "()=>..."] [--size 1280x800]

Adapted from settlements/hook/verify.py. The invariants are the Ancient Port kit's (settlements/port/verify.py,
imported) plus the overlay's own (PLAN.md, section 5), each run on a broken input too, which must fail:
  db-no-sea          no sea sheet and no core/water surface anywhere: the bed is dry
  db-decks-on-line   every coastal segment's land apron stands at the kit's freeboard over the old full level (y = 0)
  db-ring-under-line the bathtub ring's band lies under the old line, as deep as the ring and no deeper, never above it
  db-bed-falls       the bed falls from the old line to the sill (-200 m) across the fast-drain band
  db-hulks-aground   every hulk's keel lies buried in the ground under it (by a fifth to a half of its draft), none afloat
  db-wrecks-on-the-bed  the stranded wrecks: whole, snapped, broken up and half buried, all on the bed under the old line

SwiftShader flakes about one run in seven with a null shader-info-log TypeError: re-run before believing it.
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
    """The kit's ASSERT_JS (settlements/port/verify.py), imported so a check added there reaches this build."""
    spec = importlib.util.spec_from_file_location('port_verify', os.path.join(ROOT, 'settlements', 'port', 'verify.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.ASSERT_JS


# The overlay's own invariants, appended to the kit's. Each returns {name, ok, detail}; a negative is the same check
# on a broken input, which must fail (ok:false) for the check to pass.
DB_ASSERT_JS = r"""()=>{
const R=[],add=(name,r,neg)=>{R.push({name,ok:r.ok,detail:r.detail});if(neg)R.push({name:'negative: '+name,ok:!neg.ok,detail:'fails as it must: '+neg.detail});};
const coast=PORT_LAYOUT.items.filter(it=>it.vessel!==true&&portPlaceOf(it.key)==='coast');
const zs=x=>dbShore(x);
// no sea
const sea=(t,W)=>{const n=W&&W.surfaces?W.surfaces.length:0;return{ok:!t.sea&&!n,detail:(t.sea?'a sea sheet is drawn; ':'')+n+' core/water surfaces'};};
add('db-no-sea',sea(PORT_TERRAIN,typeof WATER!=='undefined'?WATER:null),sea({sea:{}},{surfaces:[1]}));
// the decks on the old line: the middle of each coastal segment's land apron at the freeboard over y = 0
const decks=(lift)=>{let bad=[];for(const it of coast){const Rg=portRegOf(it.key),h=terrainH(it.gx,it.gz-Math.min(30,Rg.LAND/2))+lift;
  if(Math.abs(h-PORT.DECK)>.6)bad.push(it.key+'/'+it.d+' '+h.toFixed(1));}
 return{ok:coast.length>0&&!bad.length,detail:bad.length?bad.join(', '):coast.length+' coastal segments, every apron at '+PORT.DECK+' m over the old full level'};};
add('db-decks-on-line',decks(0),decks(3));
// the ring under the line: sampled on the natural ground in front of the run (outside the stamps), at every height
const ring=(dh)=>{let inRing=0,above=0,deep=0;const x0=PORT_LAYOUT.runs[0].x0-600,x1=PORT_LAYOUT.runs[0].x1+600;
 for(let x=x0;x<=x1;x+=37)for(let zz=-200;zz<=1400;zz+=11){const z=zs(x)+zz,h=terrainH(x,z)+dh,s=DB_BASIN.sample(x,z,h,{});
  if(s.ring>.5){inRing++;if(h>1)above++;if(h<-DB.ring-2)deep++;}}
 return{ok:inRing>50&&!above&&!deep,detail:inRing+' ring samples; '+above+' above the old line, '+deep+' deeper than '+DB.ring+' m'};};
add('db-ring-under-line',ring(0),{ok:(()=>{let n=0;const x=PORT_LAYOUT.runs[0].x0;for(let zz=-200;zz<=1400;zz+=11){const z=zs(x)+zz,h=terrainH(x,z)+45;if(DB_BASIN.sample(x,z,h-45,{}).ring>.5&&h>1)n++;}return n===0;})(),detail:'the ring\'s samples lifted 45 m stand above the line'});
// the bed falls to the sill across the drain band (on the natural ground either side of the run)
const falls=(zEnd)=>{const bad=[];for(const x of [PORT_LAYOUT.runs[0].x0-400,PORT_LAYOUT.runs[0].x1+400]){
  const top=terrainH(x,zs(x)+60),end=terrainH(x,zs(x)+zEnd);if(!(top>-12&&top<2&&end<DB.sill+25&&end>DB.sill-40))bad.push('x '+x.toFixed(0)+': '+top.toFixed(0)+' m at the line, '+end.toFixed(0)+' m at '+zEnd+' m out');}
 return{ok:!bad.length,detail:bad.length?bad.join('; '):'from the old line to the sill ('+DB.sill+' m) across '+DB.drainZ+' m, either side of the run'};};
add('db-bed-falls',falls(DB.drainZ),falls(300));
// the hulks aground: each keel (midship) under the ground by its burial and no more, none afloat in the air
const aground=(lift)=>{const bad=[];for(const H of DB_HULKS){const keel=H.dy+lift-H.draft,g=terrainH(H.x,H.z),dep=g-keel;
  if(dep<-.5||dep>H.draft*.75)bad.push(H.key+'/'+H.d+' keel '+(dep>=0?dep.toFixed(1)+' m deep':(-dep).toFixed(1)+' m over the ground'));}
 return{ok:DB_HULKS.length>0&&!bad.length,detail:bad.length?bad.join(', '):DB_HULKS.length+' hulks, every keel buried by '+DB_HULKS.map(H=>(H.bury).toFixed(1)).join(', ')+' m'};};
if(DB_HULKS.length)add('db-hulks-aground',aground(0),aground(6));
// the wrecks: all four states present; none above the old line, none on the port; thicker on the strandlines
const wr=(W)=>{const st={},run=PORT_LAYOUT.runs[0];let above=0,onPort=0,onS=0,offS=0,S={};
 for(const w of W){st[w.state]=(st[w.state]||0)+1;if(w.h>.5)above++;if(w.x>run.x0&&w.x<run.x1&&w.z<dbShore(w.x)+60)onPort++;
  const s=DB_BASIN.sample(w.x,w.z,w.h,S);if(s.band===KBASIN.BAND.recession){if(s.strand>.4)onS++;else offS++;}}
 const all=['whole','snapped','pieces','buried'].every(k=>st[k]>0);
 return{ok:W.length>=30&&all&&!above&&!onPort,detail:W.length+' wrecks ('+Object.keys(st).map(k=>k+' '+st[k]).join(', ')+'); '+above+' above the old line, '+onPort+' on the port; in the recession '+onS+' on a strandline, '+offS+' between'};};
if(typeof DB_WRECKS!=='undefined')add('db-wrecks-on-the-bed',wr(DB_WRECKS),wr(DB_WRECKS.map(w=>Object.assign({},w,{h:w.h+260}))));
return R;}"""


async def run(a):
    from playwright.async_api import async_playwright
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
              results += await pg.evaluate(DB_ASSERT_JS)
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
