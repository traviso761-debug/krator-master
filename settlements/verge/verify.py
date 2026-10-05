#!/usr/bin/env python3
"""Headless verification for Verge (settlements/verge).

  python3 verify.py dist/verge.html [--views "A,B"] [--all-views] [--assert] [--out shots]
                                    [--hour 21] [--cam cx,cy,cz,tx,ty,tz] [--eval "()=>..."] [--query flora=0]
                                    [--export out/]      (writes the Godot export: Verge's _api.export() parts)

What it does:
  1. Serves the page's folder over HTTP (three.js r128 is routed from a repo copy, so it runs offline).
  2. Loads it in headless Chromium with software WebGL (SwiftShader), waits for window._ready.
  3. Prints the error panel, the renderer's draw calls and triangles, and every window._* counter.
  4. --assert runs window._api.checks(): Verge's invariants, each with a negative control (a check that passes its
     broken input cannot fail, and fails the run).
  5. Screenshots each named preset view (and --cam shots), at --hour if given.

Exit code is non-zero when the error panel is dirty, a page error fires or an assertion fails.
Software GL is slow: ~20-60 s a screenshot on this map. Keep a run to a handful of views and background it.
"""
import argparse, asyncio, glob, http.server, json, os, socketserver, sys, threading

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))

STATS_JS = """()=>{const w={};for(const k of Object.keys(window)){if(!k.startsWith('_')||k==='__THREE__'||k==='_api')continue;
 const v=window[k];if(typeof v==='function')continue;let s=null;try{s=JSON.stringify(v);}catch(e){continue;}w[k]=(s&&s.length<900)?v:'(large)';}
return {errs:document.getElementById('errs')?document.getElementById('errs').textContent:'(no #errs)',
        calls:renderer.info.render.calls,tris:renderer.info.render.triangles,counters:w};}"""


def three_js():
    for p in [os.path.join(HERE, 'three.min.js')] + sorted(glob.glob(os.path.join(ROOT, 'settlements', '*', 'three.min.js'))):
        if os.path.exists(p):
            return p
    return None


async def run(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    os.makedirs(a.out, exist_ok=True)
    handler = lambda *x, **k: http.server.SimpleHTTPRequestHandler(*x, directory=folder, **k)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    fails = []
    async with async_playwright() as p:
        exe = os.environ.get('PW_CHROME') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux/chrome') or [None])[0]
        b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"], executable_path=exe)
        W, H = [int(t) for t in a.size.split("x")]
        pg = await b.new_page(viewport={"width": W, "height": H})
        pg.set_default_timeout(900000)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: m.type == 'error' and errs.append('console: ' + m.text[:300]))
        three = three_js()
        if three:
            await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        q = ('?' + a.query) if a.query else ''
        await pg.goto(f"http://127.0.0.1:{port}/{name}{q}", timeout=600000)
        try:
            await pg.wait_for_function("window._ready===true || (document.getElementById('errs')&&document.getElementById('errs').textContent.length>0)", timeout=880000)
        except Exception:
            print("timed out waiting for the page to build"); fails.append("build timeout")
        if a.wait:
            try:
                await pg.wait_for_function(a.wait, timeout=880000)
            except Exception:
                print("timed out waiting for", a.wait); fails.append("wait timeout")
        await pg.wait_for_timeout(1500)
        if a.hour is not None:
            await pg.evaluate("h=>{CLOCK.set(h);CLOCK.run(false);}", a.hour)
        try:
            st = await pg.evaluate(STATS_JS)
        except Exception as e:
            print("PAGE DID NOT INITIALISE:", str(e).splitlines()[0])
            print("error panel:", await pg.evaluate("document.getElementById('errs')?document.getElementById('errs').textContent:'(none)'"))
            await b.close(); return 2
        print("ERROR PANEL:", repr(st["errs"][:3000]) if st["errs"] else "clean")
        if st["errs"]:
            fails.append("error panel not clean")
        if errs:
            print("PAGE ERRORS:", errs[:6]); fails.append("page errors")
        print("draw calls:", st["calls"], "triangles:", st["tris"])
        print("counters:", json.dumps(st["counters"], sort_keys=True)[:6000])
        if a.eval:
            try:
                ev = json.dumps(await pg.evaluate(a.eval))
                if a.eval_out:
                    open(a.eval_out, 'w').write(ev); print("EVAL: written to", a.eval_out, "(%d bytes)" % len(ev))
                else:
                    print("EVAL:", ev[:20000])
            except Exception as e:
                print("EVAL FAILED:", str(e)[:800]); fails.append("eval")
        if a.assert_:
            print("\n--- checks ---")
            try:
                for r in await pg.evaluate("()=>window._api.checks()"):
                    print(("  PASS  " if r["ok"] else "  FAIL  ") + r["name"] + " : " + r["detail"])
                    if not r["ok"]:
                        fails.append("check " + r["name"])
            except Exception as e:
                print("checks did not run:", str(e)[:600]); fails.append("checks")
        if a.export:
            os.makedirs(a.export, exist_ok=True)
            parts = await pg.evaluate("()=>window._api.exportParts()")
            for k in parts:
                data = await pg.evaluate("k=>JSON.stringify(window._api.export(k))", k)
                with open(os.path.join(a.export, k + '.json'), 'w') as fh:
                    fh.write(data)
                print("export %-10s %8d KB" % (k, len(data) // 1024))
        views = [v.strip() for v in a.views.split(",") if v.strip()]
        if a.all_views:
            views = await pg.evaluate("()=>Object.keys(VIEWS)")
        shots = [(v, None) for v in views] + [('cam', c) for c in (a.cam or [])]
        for i, (v, c) in enumerate(shots):
            if c:
                n = [float(t) for t in c.split(',')]
                await pg.evaluate("n=>setView(...n)", n)
                fn = os.path.join(a.out, 'cam-%d.png' % i)
            else:
                ok = await pg.evaluate("v=>{if(!VIEWS[v])return false;setView(...VIEWS[v]);return true;}", v)
                if not ok:
                    print("no such view:", v); fails.append("view " + v); continue
                fn = os.path.join(a.out, v.replace(' ', '_').replace(',', '').replace(':', '') + '.png')
            await pg.wait_for_timeout(int(a.settle * 1000))
            await pg.screenshot(path=fn)
            print("shot", fn)
        await b.close()
    httpd.shutdown()
    print("\nRESULT:", "PASS" if not fails else "FAIL (%s)" % ", ".join(fails))
    return 1 if fails else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--views', default='')
    ap.add_argument('--all-views', action='store_true')
    ap.add_argument('--assert', dest='assert_', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    ap.add_argument('--hour', type=float, default=None)
    ap.add_argument('--cam', action='append')
    ap.add_argument('--eval-out', dest='eval_out', help='write the --eval result here (whole), not to the log')
    ap.add_argument('--eval', default='')
    ap.add_argument('--wait', default='')
    ap.add_argument('--query', default='')
    ap.add_argument('--export', default='')
    ap.add_argument('--size', default='1280x800')
    ap.add_argument('--settle', type=float, default=1.5)
    sys.exit(asyncio.run(run(ap.parse_args())))
