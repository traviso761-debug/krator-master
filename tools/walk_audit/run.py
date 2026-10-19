#!/usr/bin/env python3
"""Walk audit of a built kit page whose buildings are drawn from boxes (the Scyvoi engine: Islanders, Lizardmen, the nomad kits).

  python3 tools/walk_audit/run.py kits/islanders/dist/islanders.html [--only key,key] [--all] [--json out.json]

Loads the page headless, then for every building def: places it alone at the origin on flat ground with the engine's emit
swapped for a recorder (so the world is not touched), keeps every oriented box it draws and every ladder it calls, and
hands them to audit.js (the same file node tests). Prints, per building, the floors nobody can walk to: covered ones (under a
roof: a defect), open ones (a roof, a deck), and those only a ladder reaches (core/walk wants a strip for each).
Exit 1 when a covered floor is unreachable. --all lists the clean ones too."""
import argparse, asyncio, http.server, json, os, socketserver, sys, threading
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
import harness as H
try: sys.stdout.reconfigure(encoding='utf-8')
except Exception: pass

CAPTURE = r"""(key) => {
  const D = DEFS[key]; if (!D) return null;
  const boxes = [], ladders = [], cache = new Map(), real = emit;
  const keep = { dry: PLACE_DRY, cm: CM.clone() };
  const L = { isLadder: typeof isLadder === 'function' ? isLadder : null, isLogLadder: typeof isLogLadder === 'function' ? isLogLadder : null };
  const lad = (x, z, ry, y1, lean) => { const m = CM.clone().multiply(TF(x, 0, z, ry)), f = new THREE.Vector3(0, 0, lean).applyMatrix4(m), t = new THREE.Vector3(0, y1, 0).applyMatrix4(m); ladders.push({ foot: [f.x, f.z], footY: f.y, top: [t.x, t.z, t.y] }); };
  emit = function (mk, geo, lm) {
    let bb = cache.get(geo.uuid); if (!bb) { if (!geo.boundingBox) geo.computeBoundingBox(); bb = geo.boundingBox; cache.set(geo.uuid, bb); }
    const m = CM.clone(); if (lm) m.multiply(lm); boxes.push({ m: Array.from(m.elements), lo: [bb.min.x, bb.min.y, bb.min.z], hi: [bb.max.x, bb.max.y, bb.max.z], tag: mk, t: /^(Box|Cylinder)Geometry$/.test(geo.type) ? 'solid' : 'cover' });
  };
  if (L.isLadder) isLadder = function (x, z, ry, y1, o) { lad(x, z, ry, y1, o && o.lean !== undefined ? o.lean : .6); };
  if (L.isLogLadder) isLogLadder = function (x, z, ry, y1) { lad(x, z, ry, y1, .5); };
  PLACE_DRY = 1;
  try { place(key, 0, 0, 0, { y: 0 }); } catch (e) { return { error: String(e && e.message || e) }; }
  finally { emit = real; PLACE_DRY = keep.dry; if (L.isLadder) isLadder = L.isLadder; if (L.isLogLadder) isLogLadder = L.isLogLadder; CM.copy(keep.cm); }
  return { boxes, ladders, cut: !!D.cut, cls: D.cls, name: D.name };
}"""


async def main(a):
    from playwright.async_api import async_playwright
    folder, name = os.path.split(os.path.abspath(a.html))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), lambda *x, **k: H._Quiet(*x, directory=folder, **k)); port = httpd.server_address[1]
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    audit_js = open(os.path.join(HERE, 'audit.js'), encoding='utf-8').read()
    out, bad = {}, 0
    async with async_playwright() as p:
        b = await H.launch_chromium(p); pg = await b.new_page(viewport={"width": 800, "height": 600}); pg.set_default_timeout(600000)
        three = H.local_three(folder, folder)
        await pg.route("**/three.min.js", lambda route: asyncio.ensure_future(route.fulfill(path=three, content_type="application/javascript")))
        await pg.goto(f"http://127.0.0.1:{port}/{name}?t=4&only=none", timeout=H.LOAD_MS)
        await pg.wait_for_function("window._ready===true||(document.getElementById('errs')&&document.getElementById('errs').style.display==='block')", timeout=H.LOAD_MS)
        await pg.add_script_tag(content=audit_js)
        keys = await pg.evaluate("Object.keys(DEFS).filter(k=>DEFS[k].cls==='building')")
        if a.only: keys = [k for k in keys if k in a.only.split(',')]
        for k in keys:
            res = await pg.evaluate("([k,src])=>{const s=(" + CAPTURE + ")(k);if(!s||s.error)return s;const r=WALKAUDIT.audit({boxes:s.boxes,ladders:s.ladders});r.cut=s.cut;r.ladders=s.ladders.length;return r;}", [k, None])
            out[k] = res
            if a.dump:
                os.makedirs(a.dump, exist_ok=True)
                cap = await pg.evaluate('(' + CAPTURE + ')', k)
                json.dump(cap, open(os.path.join(a.dump, k + '.json'), 'w', encoding='utf-8'))
            if res is None or 'error' in res: print('ERROR', k, res); bad += 1; continue
            cov = [c for c in res['components'] if c['covered'] and c['y1'] > 0.3]; opn = [c for c in res['components'] if not c['covered']]      # ground-level pockets under a raised house are crawl space, not floors
            tag = 'FAIL' if cov else ('LADDER' if res['ladderOnly'] else ('open' if opn else 'ok'))
            if cov: bad += 1
            if a.all or tag != 'ok':
                print('%-6s %-34s boxes %-5d%s' % (tag, k, res['boxes'], ' (interior)' if res['cut'] else ''))
                for c in cov: print('         unreachable, covered: %.1f m2 at y %.2f..%.2f around (%.1f, %.1f)' % (c['area'], c['y0'], c['y1'], c['at'][0], c['at'][1]))
                for c in res['ladderOnly']: print('         reached by a ladder only: %.1f m2 at y %.2f..%.2f around (%.1f, %.1f)%s' % (c['area'], c['y0'], c['y1'], c['at'][0], c['at'][1], ' [covered]' if c['covered'] else ''))
                for c in opn[:3]: print('         open, unreached: %.1f m2 at y %.2f..%.2f (roof, deck or flat top)' % (c['area'], c['y0'], c['y1']))
        await b.close()
    if a.json: json.dump(out, open(a.json, 'w', encoding='utf-8', newline='\n'), indent=1)
    n = len(out); print('%d buildings, %d with a covered floor nobody can reach' % (n, sum(1 for r in out.values() if r and 'components' in r and any(c['covered'] and c['y1'] > 0.3 for c in r['components']))))
    return 1 if bad else 0

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('html'); ap.add_argument('--only'); ap.add_argument('--all', action='store_true'); ap.add_argument('--json'); ap.add_argument('--dump', help='save the captured boxes of the --only buildings to this folder')
    sys.exit(asyncio.run(main(ap.parse_args())))
