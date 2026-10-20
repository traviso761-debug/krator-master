#!/usr/bin/env python3
"""Walk each building's front door with the host's own walker: from 11 m out, straight in through the declared door, 0.15 m a step, KHOST.cam.stand() each step.

  python3 tools/walk_audit/door_walk.py kits/islanders/dist/islanders.html [--only key,key]

A building passes when the walker ends within 0.25 m of the door's sill height having moved at least 3.5 m, not pushed sideways. Needs a page whose
host takes `walk: KWALK` and whose records carry `front` (the Scyvoi engine kits). Roofed buildings whose door opens on solid mass fail by design."""
import argparse, asyncio, os, sys, threading, socketserver
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import harness as H
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
JS = r"""(only) => {
 const C = KHOST.cam, out = []; C.walk(true, true);
 for (const r of REG.filter(r => r.cls === 'building' && !r.parent && r.front && r.front.source !== 'declared' && (!only.length || only.includes(r.key)))) {
  const f = r.front.world, yaw = f.yaw, ox = Math.sin(yaw), oz = Math.cos(yaw);   /* the way out */
  const sx = f.x + ox * 11, sz = f.z + oz * 11, g0 = terrainH(sx, sz);
  C.walkAt = [sx, sz, g0]; C.ctl.target.set(sx, g0 + C.ctl.eye, sz); C.stand();
  let pushed = 0, last = C.walkAt[2]; const tr = [];
  for (let i = 1; i <= 84; i++) { const px = sx - ox * .15 * i, pz = sz - oz * .15 * i; C.ctl.target.set(px, last + C.ctl.eye, pz); C.stand(); const w = C.walkAt;
   if (Math.hypot(w[0] - px, w[1] - pz) > .05) pushed++; last = w[2]; tr.push([+px.toFixed(2), +pz.toFixed(2), +w[2].toFixed(2)]); }
  const w = C.walkAt, moved = Math.hypot(w[0] - sx, w[1] - sz);
  out.push({ trace: tr, key: r.key, sill: +f.y.toFixed(2), endY: +w[2].toFixed(2), moved: +moved.toFixed(1), pushed, ok: Math.abs(w[2] - f.y) <= .25 && moved >= 11 && pushed < 3 });
 }
 return out; }"""
async def main(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: H._Quiet(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await H.launch_chromium(p); pg = await b.new_page(); pg.set_default_timeout(900000)
        await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=H.local_three(folder, folder), content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{name}?t=4", timeout=H.LOAD_MS); await pg.wait_for_function("window._ready===true", timeout=H.LOAD_MS); await pg.wait_for_timeout(1500)
        res = await pg.evaluate(JS, a.only.split(',') if a.only else [])
        bad = [r for r in res if not r['ok']]
        if a.trace:
            for r in bad[:1]: print(r['key'], [t for t in r['trace'] if t[2]!=r['trace'][0][2]][:30] or r['trace'][-3:])
        for r in bad: print('  FAIL %-24s sill %.2f ended %.2f, moved %.1f m, pushed %d' % (r['key'], r['sill'], r['endY'], r['moved'], r['pushed']))
        print('%d buildings, %d did not walk in through their door' % (len(res), len(bad)))
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--only'); ap.add_argument('--trace', action='store_true')
    asyncio.run(main(ap.parse_args()))
