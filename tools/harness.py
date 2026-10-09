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
"""
import asyncio, contextlib, functools, glob, http.server, os, re, socketserver, sys, threading, time

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


async def open_page(browser, html, port, size="1280x800", here=None, query="", root=None):
    """A new page on `html`, served on `port` from `root` (default: the page's folder; give the repo root for a page
    that loads siblings by relative path, as kits/ancients-interiors loads ../../catalog/), three.js routed, waiting
    until the world is built (`window._ready`) or the error panel fills. Returns (page, page_errors, ready)."""
    folder = os.path.dirname(os.path.abspath(html))
    name = os.path.relpath(os.path.abspath(html), os.path.abspath(root or folder)).replace(os.sep, '/')
    W, H = [int(t) for t in size.split("x")]
    pg = await browser.new_page(viewport={"width": W, "height": H})
    pg.set_default_timeout(600000)
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await route_three(pg, folder, here)
    await pg.goto(f"http://127.0.0.1:{port}/{name}{query}", timeout=LOAD_MS)
    ready = True
    try:
        await pg.wait_for_function(READY_JS, timeout=580000)
    except Exception:
        ready = False
    return pg, errs, ready


async def smoke(pages, settle_ms=2500):
    from playwright.async_api import async_playwright
    bad = 0
    async with async_playwright() as p:
        b = await launch_chromium(p)
        for html in pages:
            t = time.time()
            with serve(ROOT) as port:
                pg, errs, ready = await open_page(b, html, port, root=ROOT)
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


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "smoke":
        sys.exit(asyncio.run(smoke(sys.argv[2:])))
    print(__doc__)
