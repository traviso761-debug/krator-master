# verify.py's court-skirt check, taken apart (the chains-in-a-thigh count, 2026-11-06: REVIEW-GARMENTS-2026-11-06.md, section 6):
"""verify.py's court-skirt check, taken apart: which cloth item the count is on, how many points per chain, and the
count again with the wind off and with the dynamics off (fig.cloth false: rigid rests plus collisions only).
  python3 tools/cloth_probe.py dist/cosmetic-lab.html [base,no-wind,rigid,skirt-only]
base: as verify.py runs it; no-wind: fig.wind zero; rigid: fig.cloth false (rigid rests and collisions alone); skirt-only: no torso.
Counts against the thigh's median radius (deep) and its tapered radius ra..rb (tapered), per chain."""
import asyncio, functools, http.server, json, os, socketserver, sys, threading
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, HERE)
import verify

PROBE = r'''async (mode) => {
  const K = window._kchar, fig = K.fig, D = KCHAR_DATA, body = fig.bodyId || K.record().body, kit = D.bodies[body].kit;
  const sk = kit.items.find(it => it.id.indexOf('noble_skirt') >= 0 && it.cloth);
  const byName = n => fig.bones.findIndex(b => b.name === n);
  const r0 = JSON.parse(JSON.stringify(K.record()));
  const r2 = JSON.parse(JSON.stringify(r0)); r2.armour.legs = sk.id;
  if (mode === 'skirt-only') { r2.armour.torso = null; r2.armour.back = null; }
  await K.set(r2);
  fig.wind = mode === 'no-wind' ? [0, 0, 0] : null;
  fig.cloth = mode !== 'rigid';
  await fig.play('walk');
  const per = {};
  for (let k = 0; k < 60; k++) {
    fig.update(1 / 30);
    const st = fig.clothState();
    const thighs = st.caps.filter(cp => [byName('LeftUpLeg'), byName('RightUpLeg')].indexOf(cp.a) >= 0);
    if (k === 0) continue;
    Object.values(st.items).filter(c => c.on).forEach(c => {
      const id = c.item.id; per[id] = per[id] || { chains: c.chains.length, deep: 0, frames: 0, worst: 0, byChain: {} };
      per[id].frames++;
      c.chains.forEach((ch, g) => ch.x.forEach((x, i) => i > 0 && thighs.forEach(cp => {
        const a = fig.bones[cp.a].getWorldPosition(new THREE.Vector3()), b = fig.bones[cp.b].getWorldPosition(new THREE.Vector3());
        const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, x.clone().sub(a).dot(ab) / ab.lengthSq()));
        const d = x.distanceTo(a.clone().addScaledVector(ab, t));
        const rt = cp.ra != null ? cp.ra + ((cp.rb != null ? cp.rb : cp.ra) - cp.ra) * t : cp.r;
        if (d < cp.r) { per[id].deep++; per[id].byChain[g] = (per[id].byChain[g] || 0) + 1; per[id].worst = Math.max(per[id].worst, cp.r - d); }
        if (d < rt) { per[id].deepT = (per[id].deepT || 0) + 1; per[id].worstT = Math.max(per[id].worstT || 0, rt - d); (per[id].depths = per[id].depths || []).push([k, g, i, +(rt - d).toFixed(4)]); }
      })));
    });
  }
  fig.wind = null; fig.cloth = true;
  return { body, skirt: sk.id, record: { torso: r2.armour.torso, legs: r2.armour.legs, back: r2.armour.back, id: r2.id || null }, per };
}'''


async def run(page_path, modes):
    from playwright.async_api import async_playwright
    chrome = os.environ.get('KRATOR_CHROME') or None
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome, args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 860})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=verify.THREE, content_type='text/javascript'))
        await pg.route('**/GLTFLoader.js', lambda r: r.fulfill(path=verify.LOADER, content_type='text/javascript'))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        root = os.path.dirname(os.path.abspath(page_path))

        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass
        srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=root))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        await pg.goto('http://127.0.0.1:%d/%s' % (srv.server_address[1], os.path.basename(page_path)))
        await pg.evaluate('window._kchar && window._kchar.ready')
        await pg.wait_for_function('window._kchar', timeout=120000)
        for body in ('mpfb_male', 'mpfb_female'):
            await pg.evaluate('b => window._kchar.body(b)', body)
            await pg.wait_for_function('window._kchar && window._kchar.fig', timeout=120000)
            await pg.evaluate('window._kchar.ready')
            for mode in modes:
                r = await pg.evaluate(PROBE, mode)
                print(body, mode, 'skirt', r['skirt'], 'worn', json.dumps(r['record']))
                for iid, v in r['per'].items():
                    if v.get('depths'): print('   deepest (frame, chain, point, m):', sorted(v['depths'], key=lambda q: -q[3])[:8])
                    print('   %-28s chains %2d  deep %4d (worst %.3f)  tapered %4d (worst %.3f)  by chain %s' % (iid, v['chains'], v['deep'], v['worst'], v.get('deepT', 0), v.get('worstT', 0), json.dumps(v['byChain'])))
        await b.close()
    for e in errs:
        print('page error:', e)


if __name__ == '__main__':
    modes = sys.argv[2].split(',') if len(sys.argv) > 2 else ['base', 'no-wind', 'rigid', 'skirt-only']
    asyncio.run(run(sys.argv[1], modes))
