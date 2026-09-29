#!/usr/bin/env python3
"""shoot_sheet.py out_dir idx[:side] ...  — focus sheet assets by index and screenshot them (one browser)."""
import asyncio, sys, os, http.server, socketserver, threading
from playwright.async_api import async_playwright
PAGE="yuni-assets.html"
args=[a for a in sys.argv[1:]]
if args and args[0].startswith("--page="): PAGE=args.pop(0).split("=",1)[1]
out=args[0]; items=args[1:]; os.makedirs(out,exist_ok=True)
folder=os.path.dirname(os.path.abspath(__file__))
h=lambda *x,**k: http.server.SimpleHTTPRequestHandler(*x,directory=folder,**k)
class Q(socketserver.TCPServer): allow_reuse_address=True
httpd=Q(("127.0.0.1",0),h); port=httpd.server_address[1]; threading.Thread(target=httpd.serve_forever,daemon=True).start()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"])
        pg=await b.new_page(viewport={"width":1100,"height":700}); pg.set_default_timeout(300000)
        three=os.path.join(folder,"three.min.js")
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{PAGE}", timeout=180000)
        await pg.wait_for_function("window._ready===true", timeout=280000)
        await pg.evaluate("document.getElementById('ui').style.display='none'")
        names=await pg.evaluate("_api.SHEET_ITEMS.map(i=>i.name)")
        if items==['list']:
            for i,n in enumerate(names): print(i,n)
        else:
            for it in items:
                idx,side=(it.split(':')+['0'])[:2]
                await pg.evaluate("(a)=>_sheetui.focus(a[0],a[1])",[int(idx),int(side)]); await pg.wait_for_timeout(700)
                fn=os.path.join(out,f"a{int(idx):03d}_{side}.png"); await pg.screenshot(path=fn); print(fn, names[int(idx)])
        print("errs:", await pg.evaluate("document.getElementById('errs').textContent"))
        await b.close()
asyncio.run(main()); httpd.shutdown()
