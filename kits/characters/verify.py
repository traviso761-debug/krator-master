#!/usr/bin/env python3
"""Headless verification for kits/characters (dist/characters.html).

  python3 verify.py dist/characters.html [--assert] [--out shots/]

Loads the page in headless Chromium (software WebGL), with three.js r128 and its GLTFLoader routed to local copies
(settlements/ys/three.min.js, tools/vendor/GLTFLoader.r128.js): no CDN. Page errors fail the run. --assert checks,
through window._kchar:
  pieces       every outfit alone shows exactly its five slot meshes; a mixed record shows the bands KCHAR.visible names
  rest         in the A-pose with no sliders, every visible mesh's bone matrix x inverse bind is the identity for every
               bone that carries its vertices (the pieces sit where make_pieces.py fitted them)
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
  const K = window._kchar, fig = K.fig, D = KCHAR_DATA, out = {};
  const ids = D.outfits.outfits.map(o => o.id);
  const shown = () => Object.values(fig.live).filter(m => m.visible);
  const one = id => ({ slots: Object.fromEntries(D.outfits.slots.map(s => [s, id])), sliders: {}, dye: {} });
  fig.play(null);
  out.pieces = [];
  ids.forEach(id => { K.set(one(id)); const n = shown().length; if (n !== D.outfits.slots.length) out.pieces.push(id + ' shows ' + n); });
  const mix = { slots: { head: ids[1], torso: ids[5], hands: ids[2], legs: ids[3], feet: ids[4] }, sliders: {}, dye: {} };
  K.set(mix);
  const want = KCHAR.visible(mix, D.outfits).map(v => v.outfit + '|' + v.mesh).sort();
  const got = shown().map(m => m.name).sort();
  if (JSON.stringify(want) !== JSON.stringify(got)) out.pieces.push('mixed: ' + got.join(','));
  // rest: bone matrixWorld * boneInverse == the mesh's matrixWorld, for every bone the mesh's vertices use
  fig.group.updateMatrixWorld(true);
  let worst = 0, at = '';
  const M = new THREE.Matrix4();
  shown().forEach(m => {
    const used = new Set(), j = m.geometry.attributes.skinIndex, w = m.geometry.attributes.skinWeight;
    const G = ['getX', 'getY', 'getZ', 'getW'];   // r128 has no getComponent
    for (let i = 0; i < j.count; i++) for (let c = 0; c < 4; c++) if (w[G[c]](i) > 0) used.add(j[G[c]](i));
    used.forEach(b => {
      M.multiplyMatrices(m.skeleton.bones[b].matrixWorld, m.skeleton.boneInverses[b]);
      const e = M.elements.reduce((s, x, k) => s + Math.abs(x - m.matrixWorld.elements[k]), 0);
      if (e > worst) { worst = e; at = m.name + ' ' + m.skeleton.bones[b].name; }
    });
  });
  out.rest = { worst, at };
  const foot = () => { fig.group.updateMatrixWorld(true); return fig.bones.find(b => b.name === 'LeftFoot').getWorldPosition(new THREE.Vector3()).y; };
  const y0 = foot();
  out.feet = [1, -1].map(v => { K.set(Object.assign({}, mix, { sliders: { legs: v } })); return foot() - y0; });
  K.set(Object.assign({}, mix, { sliders: { height: 1 } }));
  const head = () => { fig.group.updateMatrixWorld(true); return fig.headWorld(new THREE.Vector3()).y; };
  const h1 = head(); K.set(mix); const h0 = head();
  const f = D.sliders.sliders.find(s => s.id === 'height').ops[0].f;
  out.scale = { ratio: h1 / h0, want: f };
  fig.play('walk');
  const thigh = fig.bones.find(b => b.name === 'LeftUpLeg'), q0 = thigh.quaternion.clone();
  fig.update(0.4);
  out.clips = 1 - Math.abs(q0.dot(thigh.quaternion));
  fig.play('idle');
  out.random = JSON.stringify(KCHAR.random(5, D.sliders, D.outfits)) === JSON.stringify(KCHAR.random(5, D.sliders, D.outfits));
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
        await pg.goto('file://' + os.path.abspath(page_path))
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
            if any(abs(d) > 0.005 for d in r['feet']):
                fails.append('feet: the foot moved %s m' % r['feet'])
            if abs(r['scale']['ratio'] - r['scale']['want']) > 0.01:
                fails.append('scale: height +1 gave x%.3f, want x%.3f' % (r['scale']['ratio'], r['scale']['want']))
            if r['clips'] < 1e-4:
                fails.append('clips: walk did not move the thigh')
            if not r['random']:
                fails.append('random: one seed, two records')
        if out_dir:
            await pg.click('#tab-record')
            await pg.click('#rec-random')
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
