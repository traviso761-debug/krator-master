#!/usr/bin/env python3
"""Reach check through core/walk itself: in a built page that registers its buildings' boxes (kits/islanders, kits/lizardmen), flood
a grid round each placed building with the registry's own queries (floorsAt, floorBelow, blocked: step 0.6, body r 0.3 / h 1.7) from the
open ground, and report the standable floors above the ground that the flood never reached.

  python3 tools/walk_audit/registry_reach.py kits/islanders/dist/islanders.html [--only key,key] [--cell 0.25]

This is the registry's verdict on the same question tools/walk_audit/run.py asks of the raw geometry; they should agree."""
import argparse, asyncio, os, sys, threading, socketserver
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import harness as H
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
JS = r"""([only, cell]) => {
 const out = [], W = KWALK;
 const recs = REG.filter(r => r.cls === 'building' && !r.parent && (!only.length || only.includes(r.key)));
 for (const r of recs) {
  const R = Math.max(r.r || 8, 4) + 4, x0 = r.x - R, z0 = r.z - R, n = Math.ceil(2 * R / cell), g = r.y;   /* flat enough: the sheet's ground */
  const nodes = new Map(), key = (i, j, k) => i + ',' + j + ',' + k, list = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
   const x = x0 + (i + .5) * cell, z = z0 + (j + .5) * cell, ys = [terrainH(x, z)].concat(W.floorsAt(x, z).map(f => f[0]).filter(y => y > terrainH(x, z) + .02));
   ys.forEach((y, k) => { if (!W.blocked(x, y, z, .3, 1.7)) { const nd = { i, j, y, x, z, seen: 0 }; nodes.set(key(i, j, Math.round(y * 20)), nd); list.push(nd); } });
  }
  const at = (i, j) => list.filter(() => false);
  const byCell = new Map(); list.forEach(nd => { const c = nd.i + ',' + nd.j; (byCell.get(c) || byCell.set(c, []).get(c)).push(nd); });
  const q = []; list.forEach(nd => { if ((nd.i < 3 || nd.j < 3 || nd.i >= n - 3 || nd.j >= n - 3) && Math.abs(nd.y - terrainH(nd.x, nd.z)) < .05) { nd.seen = 1; q.push(nd); } });
  while (q.length) { const a = q.pop();
   for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const L = byCell.get((a.i + di) + ',' + (a.j + dj)); if (!L) continue;
    for (const b of L) if (!b.seen && b.y - a.y <= .6 && a.y - b.y <= 1.2) { b.seen = 1; q.push(b); } } }
  const high = list.filter(nd => nd.y - terrainH(nd.x, nd.z) > .5), lost = high.filter(nd => !nd.seen);
  const bx = A => A.length ? [Math.min(...A.map(n => n.x)), Math.max(...A.map(n => n.x)), Math.min(...A.map(n => n.z)), Math.max(...A.map(n => n.z))].map(v => +v.toFixed(1)) : null;
  out.push({ seen: bx(high.filter(n => n.seen)), lostBox: bx(lost), key: r.key, high: high.length, lost: lost.length, m2: +(lost.length * cell * cell).toFixed(1), y: lost.length ? +(lost.reduce((s, c) => s + c.y - terrainH(c.x, c.z), 0) / lost.length).toFixed(2) : 0 });
 }
 return { n: recs.length, strips: W.export().floors.filter(f => f.kind === 'strip').length, blocks: W.export().blocks.length, out };
}"""
async def main(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: H._Quiet(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await H.launch_chromium(p); pg = await b.new_page(); pg.set_default_timeout(900000)
        await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=H.local_three(folder, folder), content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{name}?t=4", timeout=H.LOAD_MS)
        await pg.wait_for_function("window._ready===true", timeout=H.LOAD_MS); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(JS, [a.only.split(',') if a.only else [], a.cell])
        print('%d buildings, %d strips, %d blocks in KWALK' % (r['n'], r['strips'], r['blocks']))
        bad = [o for o in r['out'] if o['lost'] * a.cell * a.cell >= 2]
        for o in bad: print('  unreached: %-26s %.1f m2 of raised floor (mean %.1f m up)' % (o['key'], o['m2'], o['y']))
        if a.only:
            for o in r['out']: print('  %s reached floor box %s, unreached box %s' % (o['key'], o['seen'], o['lostBox']))
        print('%d with 2 m2 or more of raised floor the flood never reached' % len(bad))
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--only'); ap.add_argument('--cell', type=float, default=.25)
    asyncio.run(main(ap.parse_args()))
