#!/usr/bin/env python3
"""Headless verification for kits/characters (dist/characters.html).

  python3 verify.py dist/characters.html [--assert] [--out shots/]

Serves dist/ and loads the page in headless Chromium (software WebGL), with three.js r128 and its GLTFLoader routed to local copies
(settlements/ys/three.min.js, tools/vendor/GLTFLoader.r128.js): no CDN. Page errors fail the run. --assert checks,
through window._kchar:
  pieces       for each body: a blank record shows the base; a dressed one (torso, legs, feet, hair, beard) shows exactly
               the parts KCHAR.parts names
  hide         the torso piece leaves out some of the base skin
  rest         in the A-pose, with no morphs and with a heavy mix of them, every visible mesh's bone matrix x inverse
               bind is the identity for every bone that carries its vertices (the morphed joints and binds agree)
  feet         height -1 and +1, age +1: the lowest skin vertex stays on the ground (within 5 mm)
  morph        height +1 makes the figure taller; weight +1 moves the torso piece's vertices too; no NaN anywhere
  clips        walk moves the thigh
  random       the same seed gives the same stranger; every people's strangers keep its skin and ancestry ranges
--out writes a screenshot of the default figure, a rolled stranger, and a stranger of every people per body (faces).
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THREE = os.path.join(ROOT, 'settlements', 'ys', 'three.min.js')
LOADER = os.path.join(HERE, 'tools', 'vendor', 'GLTFLoader.r128.js')

CHECKS = r'''async () => {
  const K = window._kchar, D = KCHAR_DATA, out = { pieces: [], rest: { worst: 0, at: '' }, feet: [], morph: [], clips: 0, random: true, ranges: [], hide: [] };
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  for (const body of Object.keys(D.bodies)) {
    await K.body(body);
    const fig = window._kchar.fig, kit = D.bodies[body].kit, k2 = window._kchar;
    const shown = () => Object.values(fig.live).filter(m => m.visible);
    const keys = r => Array.from(new Set(KCHAR.parts(r, kit).map(p => p.key))).sort();
    const shownKeys = () => Array.from(new Set(shown().map(m => m.userData.part.key))).sort();
    const blank = KCHAR.blank(kit);
    await k2.set(blank); fig.play(null); await new Promise(r => setTimeout(r, 50));
    if (JSON.stringify(shownKeys()) !== JSON.stringify(keys(blank))) out.pieces.push(body + ' blank shows ' + shownKeys());
    const first = slot => (kit.items.find(i => i.slot === slot) || {}).id || null;
    const dressed = KCHAR.blank(kit);
    dressed.armour = { torso: first('torso'), legs: first('legs'), feet: first('feet') };
    dressed.hair = first('hair'); dressed.beard = first('beard');
    await k2.set(dressed); fig.play(null);
    if (JSON.stringify(shownKeys()) !== JSON.stringify(keys(dressed))) out.pieces.push(body + ' dressed shows ' + shownKeys());
    const skin = () => shown().find(m => m.userData.srcMaterial === kit.base_material);
    out.hide.push([body, skin().geometry.index.count, skin().userData.index0.length]);
    const M = new THREE.Matrix4(), G = ['getX', 'getY', 'getZ', 'getW'];
    const rest = tag => {
      fig.restPose(); fig.group.updateMatrixWorld(true);
      shown().forEach(m => {
        const used = new Set(), j = m.geometry.attributes.skinIndex, w = m.geometry.attributes.skinWeight;
        for (let i = 0; i < j.count; i++) for (let c = 0; c < 4; c++) if (w[G[c]](i) > 0) used.add(j[G[c]](i));
        used.forEach(b => {
          M.multiplyMatrices(m.skeleton.bones[b].matrixWorld, m.skeleton.boneInverses[b]);
          const e = M.elements.reduce((s, x, k) => s + Math.abs(x - m.matrixWorld.elements[k]), 0);
          if (!(e <= out.rest.worst)) out.rest = { worst: e, at: body + ' ' + tag + ' ' + m.name + ' ' + m.skeleton.bones[b].name };
        });
      });
    };
    rest('plain');
    const low = () => { const m = skin(), P = m.geometry.attributes.position.array; let y = 1e9; for (let i = 1; i < P.length; i += 3) y = Math.min(y, P[i]); return y + fig.inner.position.y; };
    const nan = () => shown().some(m => m.geometry.attributes.position.array.some(x => !isFinite(x)));
    const torso = () => shown().find(m => m.userData.part.slot === 'torso');
    const t0 = torso().geometry.attributes.position.array.slice();
    await k2.set(Object.assign({}, dressed, { morph: { weight: 1 } }));
    const t1 = torso().geometry.attributes.position.array;
    let moved = 0; for (let i = 0; i < t0.length; i++) moved = Math.max(moved, Math.abs(t1[i] - t0[i]));
    if (moved < 0.005) out.morph.push(body + ': weight +1 moved the torso piece ' + moved.toFixed(4) + ' m');
    const st0 = (await k2.set(dressed), fig.pose.stature);
    for (const m of [{ height: -1 }, { height: 1 }, { age: 1 }]) {
      await k2.set(Object.assign({}, dressed, { morph: m })); out.feet.push(low());
      if (nan()) out.morph.push(body + ' NaN at ' + JSON.stringify(m));
    }
    const st1 = (await k2.set(Object.assign({}, dressed, { morph: { height: 1 } })), fig.pose.stature);
    if (!(st1 > st0 + 0.03)) out.morph.push(body + ': height +1 gave ' + st0.toFixed(3) + ' -> ' + st1.toFixed(3));
    const heavy = { height: 0.8, weight: -0.7, muscle: 0.9, age: 0.6, proportions: -0.5, 'head-scale-vert-decr-incr': 0.8, 'nose-scale-horiz-decr-incr': -1 };
    await k2.set(Object.assign({}, dressed, { morph: heavy, ancestry: { african: 0.7, asian: 0.2, caucasian: 0.1 } }));
    rest('heavy'); out.feet.push(low());
    await fig.play('walk');
    const thigh = fig.bones.find(b => b.name === 'LeftUpLeg'), q0 = thigh.quaternion.clone();
    fig.update(0.4);
    out.clips = Math.max(out.clips, 1 - Math.abs(q0.dot(thigh.quaternion)));
    await fig.play(null);
    out.random = out.random && JSON.stringify(KCHAR.stranger(5, kit, D.peoples[0])) === JSON.stringify(KCHAR.stranger(5, kit, D.peoples[0]));
    for (const P of D.peoples) for (let s = 1; s <= 25; s++) {
      const r = KCHAR.stranger(s * 31, kit, P), c = hex(r.skin), st = P.skin.map(hex);
      for (let k = 0; k < 3; k++) {
        const lo = Math.min(...st.map(x => x[k])), hi = Math.max(...st.map(x => x[k]));
        if (c[k] < lo - 1 || c[k] > hi + 1) out.ranges.push(P.id + ' skin ' + r.skin);
      }
      for (const a of ['african', 'asian', 'caucasian']) {
        const [lo, hi] = P.ancestry[a]; if (r.ancestry[a] < lo - 0.006 || r.ancestry[a] > hi + 0.006) out.ranges.push(P.id + ' ' + a + ' ' + r.ancestry[a]);
      }
    }
  }
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
                    fails.append('hide: %s torso piece left all %d base indices' % (body, full))
            if any(abs(d) > 0.005 for d in r['feet']):
                fails.append('feet: the lowest skin vertex at %s m' % r['feet'])
            fails += ['morph: ' + m for m in r['morph']]
            if r['clips'] < 1e-4:
                fails.append('clips: walk did not move the thigh')
            if not r['random']:
                fails.append('random: one seed, two strangers')
            if r['ranges']:
                fails.append('ranges: ' + '; '.join(r['ranges'][:8]))
        if out_dir:
            await pg.click('#tab-record')
            await pg.click('#rec-random')
            await pg.evaluate('window._kchar.ready')
            await pg.wait_for_timeout(1200)
            await pg.screenshot(path=os.path.join(out_dir, 'characters-stranger.png'))
            await pg.click('#cam-face')
            for body in ('mpfb_male', 'mpfb_female'):
                await pg.evaluate('b => window._kchar.body(b)', body)
                for p in await pg.evaluate('KCHAR_DATA.peoples.map(p => p.id)'):
                    await pg.evaluate('''([b, p]) => { const kit = KCHAR_DATA.bodies[b].kit, P = KCHAR_DATA.peoples.find(x => x.id === p);
                        const r = KCHAR.stranger(7, kit, P); r.armour = window._kchar.record().armour; return window._kchar.set(r); }''', [body, p])
                    await pg.click('#cam-face')
                    await pg.wait_for_timeout(900)
                    await pg.screenshot(path=os.path.join(out_dir, 'face-%s-%s.png' % (body.replace('mpfb_', ''), p)))
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
