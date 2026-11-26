#!/usr/bin/env python3
"""The reachability audit of the doors pass (2026-11-03), as one command, for a page on the building-kit engine (core/engine: Eternian,
Islanders, Lizardmen, Yeti, Zeijani; any page whose REG records carry bbox, doors and front, and whose boxes reach core/walk).

  python3 tools/walk_audit/reach_audit.py kits/eternian/dist/eternian.html [--only key,key] [--json out.json] [--list] [--query a=1]

Every unlocked door (core/door, KDOOR) is opened, then KWALK.reach (core/walk's defaults: 0.4 m cells, a 0.45 m step, the ground
walkable through terrainH) floods from each top-level building's door() records and front (the sill, and a point 1 m out on the
ground), bounded to the building's box grown 3 m. A floor counts as the building's by its walk tag ('box:<key>', 'step:<key>',
'ladder:<key>', 'stair:<key>': the building's key or a descendant's) and by lying in that box. "Big" is an unreached floor of
2 m2 or more lying 1 m or more under the building's top (not its roof). Prints the totals and, per kind (def key), reached /
unreached / big; --list names each big unreached floor (its height over the ground, its size). --dump writes the walk registry
(the unlocked doors open), the ground and the buildings, for tools/walk_audit/reach_dump.js to flood again without a browser."""
import argparse, asyncio, json, os, sys, threading, socketserver
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import harness as H
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass
JS = r"""([only, grow, dump]) => {
 const W = KWALK, DOP = typeof KDOOR !== 'undefined' ? KDOOR.list.filter(d => !d.locked).flatMap(d => d.blocks || []).map(B => [B, !B.off]) : [];
 DOP.forEach(([B]) => W.setBlock(B, false));
 const keysOf = r => [r.key].concat(...(r.children || []).map(keysOf));
 const area = F => { if (F.kind === 'rect') return (F.rect[1] - F.rect[0]) * (F.rect[3] - F.rect[2]);
  if (F.kind === 'strip') return Math.hypot(F.b[0] - F.a[0], F.b[1] - F.a[1]) * F.w;
  let s = 0; const P = F.pts; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; };
 const fb = F => { const hw = F.w / 2; return F.kind === 'rect' ? F.rect : F.kind === 'strip' ? [Math.min(F.a[0], F.b[0]) - hw, Math.max(F.a[0], F.b[0]) + hw, Math.min(F.a[1], F.b[1]) - hw, Math.max(F.a[1], F.b[1]) + hw] : F.bbox; };
 const fy = F => F.kind === 'rect' ? F.y : F.kind === 'strip' ? Math.max(F.a[2], F.b[2]) : Math.max(...F.pts.map(p => p[2]));
 const owner = new Map(), seen = new Map(), out = [];
 const tops = REG.filter(r => !r.parent && (r.cls === 'building') && r.bbox && (!only.length || only.includes(r.key)));
 for (const r of tops) {
  const b = r.bbox, box = [b.mn[0] - grow, b.mx[0] + grow, b.mn[2] - grow, b.mx[2] + grow], keys = new Set(keysOf(r));
  const starts = [];
  for (const d of (r.doors || [])) { starts.push([d.wx, d.wy, d.wz]); const ox = d.wx + Math.sin(d.yaw), oz = d.wz + Math.cos(d.yaw); starts.push([ox, terrainH(ox, oz), oz]); }
  if (r.front && r.front.world) { const f = r.front.world; starts.push([f.x, f.y, f.z]); const ox = f.x + Math.sin(f.yaw), oz = f.z + Math.cos(f.yaw); starts.push([ox, terrainH(ox, oz), oz]); }
  const R = W.reach(starts, { box, ground: (x, z) => terrainH(x, z) }), hit = new Set(R.reached);
  const mine = F => { const t = F.tag || '', k = t.slice(t.indexOf(':') + 1); return keys.has(k); };
  for (const F of R.reached.concat(R.unreached)) { if (!mine(F)) continue;
   if (!owner.has(F)) owner.set(F, { r, top: b.mx[1] }); if (hit.has(F)) seen.set(F, true); else if (!seen.has(F)) seen.set(F, false); }
 }
 const per = {}, big = [];
 for (const [F, ok] of seen) { const o = owner.get(F), k = o.r.key, P = per[k] || (per[k] = { n: new Set(), reached: 0, unreached: 0, big: 0 }); P.n.add(o.r.tid);
  if (ok) P.reached++; else { P.unreached++; const a = area(F), y = fy(F); if (a >= 2 && y <= o.top - 1) { P.big++;
   const bb = fb(F); big.push({ key: k, tag: F.tag, name: F.name, up: +(y - terrainH((bb[0] + bb[1]) / 2, (bb[2] + bb[3]) / 2)).toFixed(2), m2: +a.toFixed(1), at: [+((bb[0] + bb[1]) / 2).toFixed(1), +((bb[2] + bb[3]) / 2).toFixed(1)] }); } } }
 DOP.forEach(([B, on]) => W.setBlock(B, on));
 const kinds = Object.keys(per).sort().map(k => ({ key: k, sites: per[k].n.size, reached: per[k].reached, unreached: per[k].unreached, big: per[k].big }));
 const T = kinds.reduce((s, k) => ({ reached: s.reached + k.reached, unreached: s.unreached + k.unreached, big: s.big + k.big }), { reached: 0, unreached: 0, big: 0 });
 const res = { buildings: tops.length, doors: typeof KDOOR !== 'undefined' ? KDOOR.list.length : 0, total: T, kinds, big };
 if (dump) { const ex = W.export(), open = new Set(DOP.map(([B]) => B)); ex.blocks.forEach((b, i) => { if (open.has(W.blocks[i])) b.off = true; });
  let g0 = terrainH(0, 0), flat = true; for (let i = -20; i <= 20; i++) for (let j = -20; j <= 20; j++) if (Math.abs(terrainH(i * 20, j * 20) - g0) > 1e-6) flat = false;
  res.dump = { walk: ex, ground: flat ? g0 : null, tops: tops.map(r => ({ key: r.key, tid: r.tid, x: r.x, z: r.z, ry: r.ry, bbox: r.bbox, keys: keysOf(r),
   doors: (r.doors || []).map(d => [d.wx, d.wy, d.wz, d.yaw]), front: r.front && r.front.world })) }; }
 return res;
}"""
async def main(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    root = os.path.abspath(a.root) if a.root else folder
    rel = os.path.relpath(os.path.abspath(a.html), root).replace(os.sep, '/')
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: H._Quiet(*x, directory=root, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await H.launch_chromium(p); pg = await b.new_page(); pg.set_default_timeout(900000)
        await pg.route("**/three.min.js", lambda r: asyncio.ensure_future(r.fulfill(path=H.local_three(folder, folder), content_type="application/javascript")))
        q = '?t=4' + ''.join('&' + s for s in (a.query or []))
        await pg.goto(f"http://127.0.0.1:{port}/{rel}{q}", timeout=H.LOAD_MS); await pg.wait_for_function("window._ready===true", timeout=H.LOAD_MS); await pg.wait_for_timeout(1500)
        r = await pg.evaluate(JS, [a.only.split(',') if a.only else [], a.grow, bool(a.dump)])
        T = r['total']
        print('%d buildings, %d doors: %d floors reached, %d unreached (%d big)' % (r['buildings'], r['doors'], T['reached'], T['unreached'], T['big']))
        for k in r['kinds']:
            if k['unreached'] or a.all:
                print('  %-28s x%-2d reached %4d  unreached %4d  big %3d' % (k['key'], k['sites'], k['reached'], k['unreached'], k['big']))
        if a.list:
            for g in r['big']: print('    big: %-24s %-26s %5.2f m up, %6.1f m2 at %s' % (g['key'], g['tag'], g['up'], g['m2'], g['at']))
        if a.dump:
            with open(a.dump, 'w', encoding='utf-8', newline='\n') as f: json.dump(r.pop('dump'), f)
        if a.json:
            with open(a.json, 'w', encoding='utf-8', newline='\n') as f: json.dump(r, f, indent=1)
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--only'); ap.add_argument('--json'); ap.add_argument('--list', action='store_true')
    ap.add_argument('--all', action='store_true', help='print every kind, not only those with an unreached floor'); ap.add_argument('--grow', type=float, default=3)
    ap.add_argument('--dump', help="write the page's walk registry (doors opened), ground and buildings to this JSON (tools/walk_audit/reach_dump.js reads it)")
    ap.add_argument('--query', action='append', help='a page query, a=1 (repeatable)'); ap.add_argument('--root', help='serve from this folder (a page that loads files beside it)')
    asyncio.run(main(ap.parse_args()))
