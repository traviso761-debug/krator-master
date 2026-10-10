#!/usr/bin/env python3
"""Headless verification for kits/characters (dist/characters.html).

  python3 verify.py dist/characters.html [--assert] [--out shots/]

Serves dist/ and loads the page in headless Chromium (software WebGL), with three.js r128 and its GLTFLoader routed to local copies
(settlements/ys/three.min.js, tools/vendor/GLTFLoader.r128.js): no CDN. Page errors fail the run. --assert checks,
through window._kchar:
  pieces       for each body: a blank record shows the base regions and the head; a dressed one (three armour slots,
               hair on the base head) shows exactly what KCHAR.parts names
  hide         the torso armour leaves out some of the base torso
  rest         in the A-pose with no sliders, every visible mesh's bone matrix x inverse bind is the identity for every
               bone that carries its vertices (the pieces sit where make_kit.py fitted them)
  feet         leg length +1 and -1 keep the feet on the ground (within 5 mm)
  scale        height +1 makes the figure taller by the slider's factor
  clips        walk moves the thigh
  random       the same seed gives the same record
--out writes a screenshot of the default figure and of a rolled stranger.
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THREE = os.path.join(ROOT, 'settlements', 'ys', 'three.min.js')
LOADER = os.path.join(HERE, 'tools', 'vendor', 'GLTFLoader.r128.js')

CHECKS = r'''async () => {
  const K = window._kchar, D = KCHAR_DATA, out = { pieces: [], rest: { worst: 0, at: '' }, feet: [], scale: {}, clips: 0, random: true, hide: [] };
  for (const body of Object.keys(D.bodies)) {
    await K.body(body);
    const fig = window._kchar.fig, kit = D.bodies[body].kit, k2 = window._kchar;
    const shown = () => Object.values(fig.live).filter(m => m.visible);
    const blank = KCHAR.blank(kit);
    await k2.set(blank); fig.play(null); await new Promise(r => setTimeout(r, 50));
    if (shown().length !== KCHAR.parts(blank, kit).length) out.pieces.push(body + ' blank shows ' + shown().length);
    const dressed = KCHAR.blank(kit);
    dressed.armour = { torso: kit.armour[0].id, legs: kit.armour[1].id, feet: kit.armour[2].id };
    const bald = kit.heads.find(h => h.style === 'base');
    dressed.head = bald.id; dressed.hair = (kit.hair.find(h => h.head === bald.id && h.kind === 'hair') || {}).id || null;
    await k2.set(dressed); fig.play(null);
    const want = KCHAR.parts(dressed, kit).map(p => p.key + '|' + p.mesh).sort(), got = shown().map(m => m.name).sort();
    if (JSON.stringify(want) !== JSON.stringify(got)) out.pieces.push(body + ' dressed: ' + got.join(','));
    // the torso armour leaves some base torso out
    const bt = shown().find(m => m.userData.part.role === 'base' && m.userData.part.slot === 'torso');
    const full = bt.userData.index0.length, now = bt.geometry.index.count;
    out.hide.push([body, now, full]);
    fig.group.updateMatrixWorld(true);
    const M = new THREE.Matrix4(), G = ['getX', 'getY', 'getZ', 'getW'];
    shown().forEach(m => {
      const used = new Set(), j = m.geometry.attributes.skinIndex, w = m.geometry.attributes.skinWeight;
      for (let i = 0; i < j.count; i++) for (let c = 0; c < 4; c++) if (w[G[c]](i) > 0) used.add(j[G[c]](i));
      used.forEach(b => {
        M.multiplyMatrices(m.skeleton.bones[b].matrixWorld, m.skeleton.boneInverses[b]);
        const e = M.elements.reduce((s, x, k) => s + Math.abs(x - m.matrixWorld.elements[k]), 0);
        if (e > out.rest.worst) out.rest = { worst: e, at: body + ' ' + m.name + ' ' + m.skeleton.bones[b].name };
      });
    });
    const foot = () => { fig.group.updateMatrixWorld(true); return fig.bones.find(b => b.name === 'LeftFoot').getWorldPosition(new THREE.Vector3()).y; };
    const y0 = foot();
    for (const v of [1, -1]) { await k2.set(Object.assign({}, dressed, { sliders: { legs: v } })); out.feet.push(foot() - y0); }
    const head = () => { fig.group.updateMatrixWorld(true); return fig.headWorld(new THREE.Vector3()).y; };
    await k2.set(Object.assign({}, dressed, { sliders: { height: 1 } })); const h1 = head();
    await k2.set(dressed); const h0 = head();
    out.scale[body] = { ratio: h1 / h0, want: D.sliders.sliders.find(s => s.id === 'height').ops[0].f };
    await fig.play('walk');
    const thigh = fig.bones.find(b => b.name === 'LeftUpLeg'), q0 = thigh.quaternion.clone();
    fig.update(0.4);
    out.clips = Math.max(out.clips, 1 - Math.abs(q0.dot(thigh.quaternion)));
    out.random = out.random && JSON.stringify(KCHAR.random(5, D.sliders, kit)) === JSON.stringify(KCHAR.random(5, D.sliders, kit));
  }
  await K.body('male');
  return out;
}'''


async def run(page_path, do_assert, out_dir):
    from playwright.async_api import async_playwright
    chrome = os.environ.get('KRATOR_CHROME') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
    errs, fails = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome, args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 860})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='text/javascript'))
        await pg.route('**/GLTFLoader.js', lambda r: r.fulfill(path=LOADER, content_type='text/javascript'))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        # the page fetches its pieces, so it is served (a thread on a free port) rather than opened as a file
        import functools, http.server, socketserver, threading
        root = os.path.dirname(os.path.abspath(page_path))
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a):
                pass
        h = functools.partial(Quiet, directory=root)
        srv = socketserver.TCPServer(('127.0.0.1', 0), h)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        await pg.goto('http://127.0.0.1:%d/%s' % (srv.server_address[1], os.path.basename(page_path)))
        await pg.evaluate('window._kchar && window._kchar.ready')
        await pg.wait_for_function('window._kchar', timeout=120000)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(out_dir, 'characters.png'))
        if do_assert:
            r = await pg.evaluate(CHECKS)
            print(json.dumps(r))
            if r['pieces']:
                fails.append('pieces: ' + '; '.join(r['pieces']))
            if r['rest']['worst'] > 1e-3:
                fails.append('rest: %(worst).4f at %(at)s' % r['rest'])
            for body, now, full in r['hide']:
                if not now < full:
                    fails.append('hide: %s torso armour left all %d base torso indices' % (body, full))
            if any(abs(d) > 0.005 for d in r['feet']):
                fails.append('feet: the foot moved %s m' % r['feet'])
            for body, sc in r['scale'].items():
                if abs(sc['ratio'] - sc['want']) > 0.01:
                    fails.append('scale: %s height +1 gave x%.3f, want x%.3f' % (body, sc['ratio'], sc['want']))
            if r['clips'] < 1e-4:
                fails.append('clips: walk did not move the thigh')
            if not r['random']:
                fails.append('random: one seed, two records')
        if out_dir:
            await pg.click('#tab-record')
            await pg.click('#rec-random')
            await pg.evaluate('window._kchar.ready')
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=os.path.join(out_dir, 'characters-stranger.png'))
        await b.close()
    for e in errs:
        print('page error:', e)
    for f in fails:
        print('FAIL', f)
    print('verify: %s' % ('ok' if not errs and not fails else 'FAILED'))
    return 0 if not errs and not fails else 1


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        sys.exit(__doc__)
    out = a[a.index('--out') + 1] if '--out' in a else None
    sys.exit(asyncio.run(run(a[0], '--assert' in a, out)))
