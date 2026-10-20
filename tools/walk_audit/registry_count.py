#!/usr/bin/env python3
"""How many core/walk floors, strips and blocks does a built page hold once it is ready?

  python3 tools/walk_audit/registry_count.py <page.html> [--query "interiors=1"] [--wait 8]

Loads the page headless, waits for window._ready, prints KWALK.export() counts and the tags it holds. Shows that a host's
interiors reach core/walk (IX.walk.register, kits/interiors/src/49b-walk.js)."""
import argparse, asyncio, collections, os, sys, threading, http.server, socketserver
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import harness as H

JS = """()=>{ if(typeof KWALK==='undefined') return {error:'no KWALK'}; const e=KWALK.export(); const tags={};
  for(const f of e.floors){const t=(f.tag||'').split(':')[0]||'(none)';tags[t]=(tags[t]||0)+1;}
  const strips=e.floors.filter(f=>f.kind==='strip').length;
  return {floors:e.floors.length,strips,blocks:e.blocks.length,tags,entry:e.floors.filter(f=>/\\.entry$/.test(f.name||'')).length,bounds:KWALK.bounds()}; }"""

async def main(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: H._Quiet(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await H.launch_chromium(p); pg = await b.new_page(); pg.set_default_timeout(600000)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=H.local_three(folder, folder), content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{name}" + ('?' + a.query if a.query else ''), timeout=H.LOAD_MS)
        try: await pg.wait_for_function("window._ready===true||(document.getElementById('errs')&&document.getElementById('errs').style.display==='block')", timeout=H.LOAD_MS)
        except Exception as e: print('never ready', str(e)[:80])
        await pg.wait_for_timeout(int(a.wait * 1000))
        print(name, await pg.evaluate(JS))
        for e in errs[:4]: print('pageerror:', e[:160])
        await b.close()

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--query', default=''); ap.add_argument('--wait', type=float, default=6)
    asyncio.run(main(ap.parse_args()))
