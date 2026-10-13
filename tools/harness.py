#!/usr/bin/env python3
"""The shared verify harness (GODOT-PLAN.md Phase 1, ROADMAP.md stage 0b): what every verify.py used to carry as
its own "Harness helpers" block, once. A verify.py imports it:

    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
    from harness import GL_ARGS, LOAD_MS, launch_chromium, local_three, parse_views, serve, STATS_JS

and keeps only what is its own: its asserts, its views, its report. A fix to loading, serving or launching lands
here and reaches every build that imports it.

It also runs on its own, as a smoke test (load each page, wait for `window._ready`, report the error panel, page
errors, draw calls and triangles; exit 1 if any page is dirty or never gets ready):

    python3 tools/harness.py smoke settlements/voth/voth.html biomes/rift/dist/rift.html ...

and as a scripted walk (stage 0j): hold real keys along a route and check the walker moved, stayed up and the
console stayed clean:

    python3 tools/harness.py walk settlements/girder/girder.html --route KeyW:20f --start auto --min 2 --dir 0,-1

and as the exporter's driver (ROADMAP.md stage 2d): core/export's krator-world container written headless for Godot
(world.json, world.glb, the library pack's maps; core/export/README.md):

    python3 tools/harness.py export biomes/sedesert/dist/sedesert.html --out godot/data/world-sedesert --box 80,490,380,790
"""
import asyncio, contextlib, functools, glob, http.server, json, os, re, socketserver, sys, threading, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GL_ARGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
# Every page builds its world in one synchronous script, so "load" fires only when the world is built: minutes under
# software GL on a shared box (Dalab's city took 285 s with seven other agents running; 180 s timed Locus out).
LOAD_MS = 900000
# KRATOR_CHROME names a Chromium to launch. The other names are the ones single copies of this harness used before
# they were merged; they still work.
CHROME_ENV = ("KRATOR_CHROME", "PW_CHROME", "PW_CHROMIUM", "CHROME_PATH", "VERIFY_CHROME", "CHROMIUM")
# ready: the world is built (`window._ready`; the open world says it as `WORLD.ready`, Streetlab's city plan and site
# editor as `_vc.ready` and `_site.ready`), or the error panel has filled
READY_JS = ("window._ready===true || (window.WORLD&&window.WORLD.ready===true) || (window._vc&&window._vc.ready) || "
            "(window._site&&window._site.ready) || (document.getElementById('errs')&&"
            "document.getElementById('errs').textContent.length>0)")
STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__')continue;
 const v=window[k];if(typeof v==='function'||typeof v==='object'&&v&&!Array.isArray(v)&&k==='_api')continue;
 let s=null;try{s=JSON.stringify(v);}catch(e){continue;}w[k]=(s&&s.length<600)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:(typeof renderer!=='undefined')?renderer.info.render.calls:null,
        tris:(typeof renderer!=='undefined')?renderer.info.render.triangles:null,counters:w};}"""

try:   # structure names hold em dashes; the Windows console's default codepage mangles them
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass


async def launch_chromium(p, args=GL_ARGS):
    """$KRATOR_CHROME (or an older name in CHROME_ENV), else playwright's own build, else a pinned build under
    /opt/pw-browsers: a cloud container ships one that need not match the pip playwright's pin."""
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


def local_three(folder, here=None):
    """The pinned three.js r128 to serve in place of the CDN copy: the build's own (`here`, the verify.py's folder),
    the page folder's, else the repo's copy in kits/ancients (a build that keeps none still runs offline)."""
    cands = ([os.path.join(here, "three.min.js")] if here else []) + [os.path.join(folder, "three.min.js")]
    cands.append(os.path.join(ROOT, "kits", "ancients", "three.min.js"))
    return next((c for c in cands if os.path.exists(c)), cands[0])


def parse_views(spec, names=()):
    """--views. Names separated by '|' or ';' are taken exactly, so a name may hold commas. Separated by commas,
    consecutive pieces are joined back up whenever that spells an existing preset's name, longest first: so
    "Overview,Town types — row, stacked house, well, tower" is two views."""
    spec = (spec or "").strip()
    if not spec:
        return []
    if "|" in spec or ";" in spec:
        return [v.strip() for v in re.split(r"[|;]", spec) if v.strip()]
    names = set(names or ())
    toks, out, i = spec.split(","), [], 0
    while i < len(toks):
        j = next((j for j in range(len(toks), i + 1, -1) if ",".join(toks[i:j]).strip() in names), i + 1)
        v = ",".join(toks[i:j]).strip()
        if v:
            out.append(v)
        i = j
    return out


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@contextlib.contextmanager
def serve(folder):
    """Serve `folder` over HTTP on a free port (not file://: a page sets crossorigin on its three.js script only off
    file:, and the three.js route depends on intercepting it). Yields the port."""
    httpd = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(_Quiet, directory=folder))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    try:
        yield httpd.server_address[1]
    finally:
        httpd.shutdown()
        httpd.server_close()


async def route_three(pg, folder, here=None):
    """Serve three.js from the repo instead of the CDN: offline, pinned to r128."""
    three = local_three(folder, here)
    if os.path.exists(three):
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(
            route.fulfill(path=three, content_type="application/javascript")))


async def open_page(browser, html, port, size="1280x800", here=None, query="", root=None, init=()):
    """A new page on `html`, served on `port` from `root` (default: the page's folder; give the repo root for a page
    that loads siblings by relative path, as kits/ancients-interiors loads ../../catalog/), three.js routed, waiting
    until the world is built (`window._ready`) or the error panel fills. `init`: scripts (paths) run before the page's
    own (godot/tools/stage_hook.js, for KSTAGE). Returns (page, page_errors, ready)."""
    folder = os.path.dirname(os.path.abspath(html))
    name = os.path.relpath(os.path.abspath(html), os.path.abspath(root or folder)).replace(os.sep, '/')
    W, H = [int(t) for t in size.split("x")]
    pg = await browser.new_page(viewport={"width": W, "height": H})
    pg.set_default_timeout(600000)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    for f in init:
        with open(f, encoding='utf-8') as fh:
            await pg.add_init_script(fh.read())
    await route_three(pg, folder, here)
    await pg.goto(f"http://127.0.0.1:{port}/{name}{query}", timeout=LOAD_MS)
    ready = True
    try:
        await pg.wait_for_function(READY_JS, timeout=580000)
    except Exception:
        ready = False
    return pg, errs, ready


# Pages too big to build whole under software GL: the query a smoke load opens them with (their own verify.py does the
# same). The catalog's contact sheet builds all 1674 pieces otherwise, past any sensible timeout.
SMOKE_QUERY = {'kits/catalog/dist/catalog.html': '?page=indoor'}


async def smoke(pages, settle_ms=2500):
    from playwright.async_api import async_playwright
    bad = 0
    async with async_playwright() as p:
        b = await launch_chromium(p)
        for html in pages:
            t = time.time()
            with serve(ROOT) as port:
                rel = os.path.relpath(os.path.abspath(html), ROOT).replace(os.sep, '/')
                pg, errs, ready = await open_page(b, html, port, root=ROOT, query=SMOKE_QUERY.get(rel, ''))
                await pg.wait_for_timeout(settle_ms)
                try:
                    st = await pg.evaluate(STATS_JS)
                except Exception as e:
                    st = {"errs": "page did not initialise: " + str(e).splitlines()[0], "calls": None, "tris": None}
                await pg.close()
            dirty = bool(st["errs"] and st["errs"] != "(no #errs)") or bool(errs) or not ready
            bad += dirty
            print("%s  %-55s %5.0fs  calls %s  tris %s%s%s" % (
                "FAIL" if dirty else "ok  ", html, time.time() - t, st["calls"], st["tris"],
                "" if ready else "  NOT READY", ("  errs: " + (st["errs"] or "")[:200] + " " + "; ".join(errs[:3])[:300])
                if dirty else ""), flush=True)
        await b.close()
    print("%d pages, %d dirty" % (len(pages), bad))
    return 1 if bad else 0


POSE_JS = """()=>{ if(window._walk&&typeof window._walk.pose==='function'&&window._walk.on) return Object.assign({mode:'walk'}, window._walk.pose());
 const c=(typeof camera!=='undefined')?camera:null; if(!c) return null;
 return {mode:'camera', x:c.position.x, y:c.position.y, z:c.position.z}; }"""


# A start on open ground: the nearest point to the origin (a spiral out to 120 m) where the walker, set down by its
# own setPose, stands on the terrain and nothing blocks the 6 m ahead of it at yaw 0 (forward is -z). Needs the
# walker's own API (window._walk.setPose and .blocked, as Girder's): a page's terrainH is not reachable from outside
# its script. null when the page has none, and the walk starts where it spawns.
AUTO_START_JS = """()=>{ const w=window._walk; if(!w||typeof w.blocked!=='function'||typeof w.setPose!=='function') return null;
 const stand=(x,z)=>{ const p=w.setPose(x,z,0); return p&&/terrain|ground/i.test(p.support||'')?p:null; };
 for(let r=0;r<=120;r+=4){ const n=Math.max(1,Math.round(r*1.5)); for(let a=0;a<n;a++){ const t=a/n*Math.PI*2, x=r*Math.cos(t), z=r*Math.sin(t);
  const p=stand(x,z); if(!p) continue; let ok=true;
  for(let d=0.5;d<=6&&ok;d+=0.5){ const q=stand(x,z-d); if(!q||Math.abs(q.feet-p.feet)>1.5||w.blocked(x,z-d,q.feet)) ok=false; }
  if(ok) return [x,z,0]; } } return null; }"""


def parse_route(spec):
    """'KeyW:30f,KeyD:600,KeyW+ShiftLeft:10f' -> [(['KeyW'], '30f'), (['KeyD'], 600), (['KeyW', 'ShiftLeft'], '10f')].
    A step is held for N rendered frames ('30f') or N milliseconds ('600'). Prefer frames: a walker moves per frame
    (dt capped at 0.1 s), and under software GL a frame can take seconds (Girder in walk mode: one frame in 4 s)."""
    out = []
    for part in (spec or '').split(','):
        part = part.strip()
        if part:
            keys, n = part.rsplit(':', 1)
            out.append((keys.split('+'), n if n.endswith('f') else int(n)))
    return out


FRAMES_JS = "()=>{ if(window._hxFrames==null){ window._hxFrames=0; (function f(){ window._hxFrames++; requestAnimationFrame(f); })(); } return window._hxFrames; }"


async def walk(pg, route, start=None, settle_ms=400):
    """The scripted walk (ROADMAP.md stage 0j, from OhMyGame's QA skill: "build success establishes compilation, not a
    playtest"): put the build in walk mode if it has one (`window._walk`, Girder and Verge), optionally at
    start = (x, z, yaw), then hold real keys through the browser, step by step. Returns (pose before, pose after,
    console errors). The caller judges the poses: frame times under software GL are uneven, so a check is a minimum
    distance in a direction and a ground test, not an exact end point."""
    cons = []
    pg.on('console', lambda m: cons.append(m.text) if m.type == 'error' else None)
    if start == 'auto':
        start = await pg.evaluate(AUTO_START_JS)
    await pg.evaluate("(s)=>{ const w=window._walk; if(w&&typeof w.toggle==='function'){ w.toggle(true); if(s) w.setPose(s[0], s[1], s[2]); } }",
                      list(start) if start else None)
    await pg.wait_for_timeout(settle_ms)
    await pg.mouse.click(5, 5)            # the page has focus for key events (a corner, away from the panels)
    before = await pg.evaluate(POSE_JS)
    await pg.evaluate(FRAMES_JS)
    for keys, n in route:
        for k in keys:
            await pg.keyboard.down(k)
        if isinstance(n, str):             # frames: hold until the page has drawn n more (at most 20 minutes)
            f0 = await pg.evaluate(FRAMES_JS)
            await pg.wait_for_function("(t)=>window._hxFrames>=t", arg=f0 + int(n[:-1]), timeout=1200000)
        else:
            await pg.wait_for_timeout(n)
        for k in reversed(keys):
            await pg.keyboard.up(k)
    await pg.wait_for_timeout(settle_ms)
    after = await pg.evaluate(POSE_JS)
    return before, after, cons


async def walk_main(argv):
    """python3 tools/harness.py walk <page> --route KeyW:20f [--start x,z,yaw] [--min 2] [--dir dx,dz] [--query ?..]
    Exit 1 unless the page loads clean, the walker moves at least --min metres (along --dir when given), stays above
    the ground it started on minus 3 m, and the console stays clean."""
    import argparse
    from playwright.async_api import async_playwright
    ap = argparse.ArgumentParser(prog='harness.py walk')
    ap.add_argument('html'); ap.add_argument('--route', required=True); ap.add_argument('--start')
    ap.add_argument('--min', type=float, default=2.0); ap.add_argument('--dir'); ap.add_argument('--query', default='')
    a = ap.parse_args(argv)
    start = 'auto' if a.start == 'auto' else ([float(v) for v in a.start.split(',')] if a.start else None)
    fails = []
    async with async_playwright() as p:
        b = await launch_chromium(p)
        with serve(ROOT) as port:
            pg, errs, ready = await open_page(b, a.html, port, root=ROOT, query=a.query)
            if not ready:
                fails.append('page never ready')
            before, after, cons = await walk(pg, parse_route(a.route), start)
            panel = await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:''")
        await b.close()
    print('before', before); print('after ', after)
    if not before or not after:
        fails.append('no camera or walker to read')
    else:
        dx, dz = after['x'] - before['x'], after['z'] - before['z']
        if a.dir:
            ux, uz = [float(v) for v in a.dir.split(',')]
            n = (ux * ux + uz * uz) ** 0.5 or 1
            moved = (dx * ux + dz * uz) / n
        else:
            moved = (dx * dx + dz * dz) ** 0.5
        print('moved %.2f m%s' % (moved, ' along %s' % a.dir if a.dir else ''))
        if moved < a.min:
            fails.append('moved %.2f m, under %.2f' % (moved, a.min))
        if before.get('mode') == 'walk' and after.get('feet', 0) < before.get('feet', 0) - 3:
            fails.append('fell %.1f m' % (before['feet'] - after['feet']))
    if panel:
        fails.append('error panel: ' + panel[:200])
    if errs or cons:
        fails.append('console: ' + '; '.join((errs + cons)[:3])[:300])
    print('FAILED: ' + '; '.join(fails) if fails else 'OK')
    return 1 if fails else 0


EXPORT_FILES = [os.path.join(ROOT, 'core', 'export', f) for f in ('07-core-export.js', '09-core-export-adapters.js')]
STAGE_HOOK = os.path.join(ROOT, 'godot', 'tools', 'stage_hook.js')
STAGE_JS = os.path.join(ROOT, 'core', 'biome', '44-core-stage.js')
EXPORT_JS = """([opt, split]) => { const w = EXPORT.world(opt);
  const chk = EXPORT.check(w, { uid: (typeof KTAGS !== 'undefined' && KTAGS) ? KTAGS.uid : null });
  if (!split) return { world: w, check: chk };
  const g = EXPORT.glb(w);
  return { world: g.json, glb: EXPORT.pack(g.glb).b64, glbStats: g.stats, check: chk }; }"""


def _pack_dir(name, page):
    """The build folder whose tex/pack.json is the library pack `name` (the page's own build first)."""
    d = os.path.dirname(os.path.abspath(page))
    if os.path.basename(d) == 'dist':
        d = os.path.dirname(d)
    cands = [d] + sorted(os.path.dirname(os.path.dirname(p)) for p in glob.glob(os.path.join(ROOT, '*', '*', 'tex', 'pack.json')))
    for c in cands:
        pj = os.path.join(c, 'tex', 'pack.json')
        if os.path.isfile(pj):
            with open(pj, encoding='utf-8') as f:
                if json.load(f).get('build') == name:
                    return os.path.join(c, 'tex')
    return None


async def export_main(argv):
    """python3 tools/harness.py export <page> --out godot/data/<case>/ [--box x0,z0,x1,z1] [--sections a,b] [--sky 1024]
                                             [--json] [--query ?..]
    The krator-world container (core/export/README.md) written headless: load the page, wait for it and its library
    textures, call EXPORT.world({box, sections}) and EXPORT.check, and write <out>/world.json (everything but the meshes)
    and <out>/world.glb (the meshes: EXT_mesh_gpu_instancing), or one world.json with the meshes inline (--json); the
    library packs the textures name by reference are copied to <out>/tex/; <out>/meta.json says where it came from.
    A page built without core/export gets it injected (its modules queued their parts). Exit 1 when the page is not
    ready or dirty, a section reported an error, or a join failed."""
    import argparse, shutil
    from playwright.async_api import async_playwright
    ap = argparse.ArgumentParser(prog='harness.py export')
    ap.add_argument('html'); ap.add_argument('--out', required=True); ap.add_argument('--box'); ap.add_argument('--sections')
    ap.add_argument('--sky', type=int); ap.add_argument('--json', action='store_true'); ap.add_argument('--query', default='')
    a = ap.parse_args(argv)
    opt = {}
    if a.box:
        opt['box'] = [float(v) for v in a.box.split(',')]
    if a.sections:
        opt['sections'] = [s.strip() for s in a.sections.split(',') if s.strip()]
    if a.sky is not None:
        opt['sky'] = a.sky
    out = os.path.abspath(a.out)
    os.makedirs(out, exist_ok=True)
    fails, t0 = [], time.time()
    async with async_playwright() as p:
        b = await launch_chromium(p)
        with serve(ROOT) as port:
            pg, errs, ready = await open_page(b, a.html, port, size='960x600', root=ROOT, query=a.query, init=[STAGE_HOOK])
            if not ready:
                fails.append('page never ready')
            print('%s: built in %.0f s (%d page errors)' % (a.html, time.time() - t0, len(errs)), flush=True)
            try:   # the library maps decode asynchronously (core/materials/record/25-matlib-host.js counts them)
                await pg.wait_for_function("!window._texPending", timeout=180000)
            except Exception:
                fails.append('library textures still decoding after 180 s')
            injected = []
            if not await pg.evaluate("typeof EXPORT !== 'undefined'"):
                for f in EXPORT_FILES:
                    await pg.add_script_tag(path=f)
                injected.append('core/export')
            if not await pg.evaluate("typeof KSTAGE !== 'undefined'"):
                await pg.add_script_tag(path=STAGE_JS)
                injected.append('core/biome/44-core-stage.js')
            await pg.wait_for_timeout(1500)   # a few frames, so the stage hook has seen what the page renders
            t1 = time.time()
            res = await pg.evaluate(EXPORT_JS, [opt, not a.json])
            panel = await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:''")
            await pg.close()
        await b.close()
    w = res['world']
    files = {}

    def dump(name, obj):
        with open(os.path.join(out, name), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(obj, f, separators=(',', ':'))
        files[name] = os.path.getsize(os.path.join(out, name))
    dump('world.json', w)
    if not a.json:
        import base64
        with open(os.path.join(out, 'world.glb'), 'wb') as f:
            f.write(base64.b64decode(res['glb']))
        files['world.glb'] = os.path.getsize(os.path.join(out, 'world.glb'))
    packs = sorted({t['pack'] for t in w.get('textures', []) if t.get('from') == 'library'})
    if packs:
        dst = os.path.join(out, 'tex')
        shutil.rmtree(dst, ignore_errors=True)
        os.makedirs(dst)
        for name in packs:
            src = _pack_dir(name, a.html)
            if not src:
                fails.append('no tex/pack.json for library pack %s' % name)
                continue
            with open(os.path.join(src, 'pack.json'), encoding='utf-8') as f:
                pj = json.load(f)
            used = {t['family'] for t in w['textures'] if t.get('pack') == name}
            for fam in sorted(used):
                for fn in sorted(set(pj['families'].get(fam, {}).get('files', {}).values())):
                    shutil.copyfile(os.path.join(src, fn), os.path.join(dst, fn))
            shutil.copyfile(os.path.join(src, 'pack.json'), os.path.join(dst, 'pack.json' if len(packs) == 1 else name + '.pack.json'))
        files['tex/'] = sum(os.path.getsize(os.path.join(dst, f)) for f in os.listdir(dst))
    chk = res['check']
    meta = {'case': os.path.basename(out.rstrip('/\\')), 'page': os.path.relpath(os.path.abspath(a.html), ROOT).replace(os.sep, '/'),
            'kind': 'world', 'route': 'tools/harness.py export (core/export)', 'box': opt.get('box'), 'sections': w['sections'],
            'files': files, 'injected': injected, 'stats': w['stats'], 'glb': res.get('glbStats'), 'check': chk['joins'],
            'page_errors': errs[:20], 'exported': time.strftime('%Y-%m-%d')}
    dump('meta.json', meta)
    if errs or panel:
        fails.append('page errors: ' + '; '.join(errs[:3])[:300] + (' panel: ' + panel[:200] if panel else ''))
    if w['errors']:
        fails.append('section errors: ' + json.dumps(w['errors'])[:400])
    if not chk['ok']:
        fails.append('joins: ' + '; '.join(chk['problems'][:5]))
    print('exported in %.0f s: %s' % (time.time() - t1, json.dumps(w['stats'])))
    print('sections: ' + ', '.join('%s %s' % (k, v['status']) for k, v in w['sections'].items()))
    print('joins: ' + json.dumps(chk['joins']))
    if res.get('glbStats'):
        print('glb: ' + json.dumps(res['glbStats']))
    print('wrote ' + ', '.join('%s %.1f MB' % (k, v / 1e6) for k, v in files.items()) + ' in ' + os.path.relpath(out, ROOT).replace(os.sep, '/'))
    print('FAILED: ' + ' | '.join(fails) if fails else 'OK')
    return 1 if fails else 0


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "export":
        sys.exit(asyncio.run(export_main(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "smoke":
        sys.exit(asyncio.run(smoke(sys.argv[2:])))
    if len(sys.argv) > 2 and sys.argv[1] == "walk":
        sys.exit(asyncio.run(walk_main(sys.argv[2:])))
    print(__doc__)
