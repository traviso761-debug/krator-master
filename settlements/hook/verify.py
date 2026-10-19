#!/usr/bin/env python3
"""Headless verification for Hook (settlements/hook) on the shared harness (tools/harness.py).

Usage:
  python3 verify.py dist/hook.html [--views "Overview,The Strand at eye level"] [--all-views]
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
// slope gives more: README.md "The ground"), and the cliff's foot rises 60 m or more behind the site
{ const B=(HOOK_SITE.markers||[]).find(m=>m.id==='B'),r=HOOK_GROUND.ridge,c=HOOK_GROUND.cliff,F=HOOK_GROUND.fromModel;
  const hB=B?terrainH(B.x,B.z)-PORT.DECK:null,hC=terrainH(0,c.z0-20)-PORT.DECK;
  const ok=hB!=null&&hB>=24&&hC>=60;
  R.push({name:'hook-heights',ok,detail:'the palace marker stands '+(hB==null?'?':hB.toFixed(1))+' m above the quays, the cliff\'s foot '+hC.toFixed(1)+' m; the model gives the ridge: '+F.ridge+', the cliff: '+F.cliff+' (a stamp is kept only where it does not)'}); }
// the scale model's ground (75d-hook-world.js): the kit's frame stands at the 1:1 shoreline (the natural ground at the
// origin within 12 m of sea level: the shoreline is found on the land without its fine terms, which add up to ~10 m;
// the sea 300 m out, land 300 m in), and the report's numbers for the README
{ const W=HOOK_WORLD,h0=W.natH(0,0),hs=W.natH(0,300),hl=W.natH(0,-300);
  const ok=Math.abs(h0)<=12&&hs<0&&hl>0;
  R.push({name:'hook-world',ok,detail:'natural ground at the origin '+h0.toFixed(2)+' m, 300 m seaward '+hs.toFixed(1)+', 300 m inland '+hl.toFixed(1)+'; '+JSON.stringify(W.report)}); }
// P1: every Ancient host and quarter has a core/tags record before it was drawn
{ const T=PORT_LAYOUT.hook&&PORT_LAYOUT.hook.tags,a=T?T.audit():null,n=PORT_LAYOUT.items.filter(it=>it.ancient&&it.tag).length;
  R.push({name:'hook-tags',ok:!!a&&n===PORT_LAYOUT.items.filter(it=>it.ancient).length,detail:a?(a.records+' records, '+n+' hosts tagged; unknown vocabulary '+a.unknown):'no registry'}); }
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
