#!/usr/bin/env python3
"""Headless verification for core/charactermodels (dist/cosmetic-lab.html, dist/animation-lab.html).

  python3 verify.py dist/cosmetic-lab.html [--assert] [--out shots/]
  python3 verify.py dist/animation-lab.html [--assert] [--out shots/]

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
  clips        walk moves the thigh; the action clips are there and a play-once clip returns to the idle
  props        in every clip whose two_hands names a prop, the left hand reaches that prop's support (data/props.json);
               the bow's string is drawn in bow_scan
  random       the same seed gives the same stranger; every people's strangers keep its skin and ancestry ranges
The Animation Lab (window._lab) is checked instead for: six figures dressed, each body's short one shorter than its
neutral one and its tall one taller; a clip plays on all six in step; a review mark is kept; and on the six, the hand
props (the owner's review, 2026-10-20): the bucket hangs plumb in Carry bucket; Draw from quiver has the arrow on the
string and the string hand at the jaw at 5 s, and no arrow after the loose (6.2 s, 7.69 s); the bow's limbs stay out of
the legs in Bow aim and scan; Block 2's blade stays out of the head and neck; Two-handed parry's forearms stay apart;
Drink brings the cup to the lips in the left hand; and the second round (2026-10-21): the arrow's head stays in front
of the bow in every bow clip on every body; Two-handed parry's left hand does not flip round the hilt; Drink's cup stands
upright before it is drunk from; Eat's bowl stands level in front of the belly.
--out writes a screenshot of the default figure, a rolled stranger, and a stranger of every people per body (faces).
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THREE = os.path.join(ROOT, 'settlements', 'ys', 'three.min.js')
LOADER = os.path.join(HERE, 'tools', 'vendor', 'GLTFLoader.r128.js')

CHECKS = r'''async () => {
  const K = window._kchar, D = KCHAR_DATA, out = { pieces: [], rest: { worst: 0, at: '' }, feet: [], morph: [], clips: 0, random: true, ranges: [], hide: [], props: [], fold: {} };
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
    // a play-once clip (data/clips.json loop: false) goes back to the idle when it ends
    await fig.play('idle'); await fig.play('thrust');
    for (let k = 0; k < 40; k++) fig.update(0.25);
    await new Promise(r => setTimeout(r, 30));          // play() swaps the clip once the pieces' promise settles
    if (!fig.action || fig.action.getClip().name !== 'idle') out.morph.push(body + ': after thrust the figure plays ' + (fig.action && fig.action.getClip().name));
    if (Object.keys(fig.clips).length < 100) out.morph.push(body + ': only ' + Object.keys(fig.clips).length + ' clips');
    // props: where a clip says two_hands, the left hand holds the right's prop (short by under 3 cm in most frames);
    // the bow's string is drawn in the aim-and-scan loop
    for (const c of D.clips.clips.filter(c => c.two_hands)) for (const p of c.two_hands) {
      await fig.hold({ R:p, L:null, both:true }); await fig.play(c.key);
      let miss = 0;
      for (let k = 0; k < 12; k++){ fig.update(0.1); if (fig.reach > 0.03 * (fig.scale || 1)) miss++; }
      if (miss > 3) out.props.push(body + ' ' + c.key + ' ' + p + ': the left hand misses in ' + miss + ' of 12 frames');
    }
    await fig.hold({ R:null, L:'bow' }); await fig.play('bow_scan');
    let drawn = 0;
    for (let k = 0; k < 8; k++){ fig.update(0.2); drawn += fig.drawn ? 1 : 0; }   // after the fade from the last clip
    if (drawn < 6) out.props.push(body + ' bow_scan: the string is not drawn');
    await fig.hold({ R:null, L:null });
    // cloth: a court skirt's chains swing in a walk, stay finite, and keep out of the thighs
    const sk = kit.items.find(it => it.id.indexOf('noble_skirt') >= 0 && it.cloth);
    const byName = n => fig.bones.findIndex(b => b.name === n);
    if (sk) {
      const r0 = JSON.parse(JSON.stringify(window._kchar.record()));
      const r2 = JSON.parse(JSON.stringify(r0)); r2.armour.legs = sk.id;
      await window._kchar.set(r2); await fig.play('walk');
      let moved = 0, bad = 0, deep = 0;
      for (let k = 0; k < 60; k++) {
        fig.update(1 / 30);
        const st = fig.clothState(), c = Object.values(st.items).find(c => c.on);
        if (!c) break;
        c.chains.forEach(ch => ch.x.forEach((x, i) => { if (!isFinite(x.x + x.y + x.z)) bad++; moved = Math.max(moved, x.distanceTo(ch.tw[i])); }));
        const thighs = st.caps.filter(cp => [byName('LeftUpLeg'), byName('RightUpLeg')].indexOf(cp.a) >= 0);
        // the first frame after the skirt goes on starts from its rigid pose, here still blending out of bow_scan, and
        // may be in a thigh until its first step clears it (KNOWN_ISSUES.md): counted from the second frame
        if (k > 0) c.chains.forEach(ch => ch.x.forEach((x, i) => i > 0 && thighs.forEach(cp => {     // the top point rides the hips
          const a = fig.bones[cp.a].getWorldPosition(new THREE.Vector3()), b = fig.bones[cp.b].getWorldPosition(new THREE.Vector3());
          const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, x.clone().sub(a).dot(ab) / ab.lengthSq()));
          if (x.distanceTo(a.clone().addScaledVector(ab, t)) < cp.r - 0.005) deep++;
        })));
      }
      if (bad || moved < 0.01) out.props.push(body + ' cloth: ' + bad + ' non-finite points, largest swing ' + moved.toFixed(3) + ' m');
      if (deep) out.props.push(body + ' cloth: ' + deep + ' chain points inside a thigh');
      await window._kchar.set(r0);
    }
    // the fold: a court robe and skirt in a walk, every chain segment within 1.5 rad of its rest (the Verlet threw chain
    // tops sideways and Z-folded them: 60 to 90 segments past it; kchar_test.gd measures the same in Godot)
    const rb = kit.items.find(it => it.id.indexOf('noble_robe') >= 0 && it.cloth);
    if (rb && sk) {
      const r0 = JSON.parse(JSON.stringify(window._kchar.record()));
      const r4 = JSON.parse(JSON.stringify(r0)); r4.armour.torso = rb.id; r4.armour.legs = sk.id;
      await window._kchar.set(r4);
      const fold = {};
      for (const clip of ['idle', 'walk']) {
        await fig.play(clip);
        let n = 0;
        for (let k = 0; k < 60; k++) {
          fig.update(1 / 30);
          if (k < 20) continue;                     // after the fade from the last clip
          Object.values(fig.clothState().items).forEach(c => c.on && c.chains.forEach(ch => {
            for (let i = 0; i + 1 < ch.x.length; i++) {
              const a = ch.x[i + 1].clone().sub(ch.x[i]), b = ch.tw[i + 1].clone().sub(ch.tw[i]);
              if (a.lengthSq() > 1e-12 && b.lengthSq() > 1e-12 && a.angleTo(b) > 1.5) n++;
            }
          }));
        }
        fold[clip] = n;
        if (n > 8) out.props.push(body + ' cloth: court robe in ' + clip + ', ' + n + ' segment-frames past 1.5 rad of rest (the fold)');
      }
      out.fold[body] = fold;
      await window._kchar.set(r0);
    }
    // a heavy body: after the clip, no elbow or hand sits inside the pelvis, chest or its own thigh (bodyFix)
    {
      const r0 = JSON.parse(JSON.stringify(window._kchar.record()));
      const r3 = JSON.parse(JSON.stringify(r0)); r3.morph = { weight:1, muscle:1 };
      await window._kchar.set(r3);
      const bi = n => fig.bones.findIndex(b => b.name === n);
      let deep = 0, worst = 0;
      for (const clip of ['idle', 'walk', 'ual_sword_idle', 'combat_idle']) {
        await fig.play(clip);
        for (let k = 0; k < 20; k++) {
          fig.update(1 / 15);
          const caps = fig.clothState().caps;
          [['LeftForeArm', 'LeftHand', 'LeftUpLeg'], ['RightForeArm', 'RightHand', 'RightUpLeg']].forEach(arm => [arm[0], arm[1]].forEach(n => {
            const p = fig.bones[bi(n)].getWorldPosition(new THREE.Vector3());
            caps.filter(cp => cp.a === bi('Hips') || cp.a === bi('Spine1') || cp.a === bi(arm[2])).forEach(cp => {
              const a = fig.bones[cp.a].getWorldPosition(new THREE.Vector3()), b = fig.bones[cp.b].getWorldPosition(new THREE.Vector3());
              const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq()));
              const d = cp.r - p.distanceTo(a.clone().addScaledVector(ab, t));
              if (d > 0.006) deep++;
              worst = Math.max(worst, d);
            });
          }));
        }
      }
      if (deep) out.props.push(body + ' heavy body: ' + deep + ' elbow or hand frames inside the body (worst ' + worst.toFixed(3) + ' m)');
      await window._kchar.set(r0);
    }
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


LAB_CHECKS = r'''async () => {
  const L = window._lab, out = [];
  await L.ready;
  const f = L.figs, h = f.map(x => x.pose.stature || 0);
  // the six people, and (when the kit has the body) three giants, who play at their own pace (fig.cadence)
  if (f.length !== 6 && f.length !== 9) out.push('lab: ' + f.length + ' figures, want 6 (9 with the giants)');
  for (const k of [0, 3]) if (!(h[k] < h[k + 1] && h[k + 1] < h[k + 2])) out.push('lab: heights ' + h.slice(k, k + 3).map(x => x.toFixed(2)));
  if (f.length === 9 && !(h.slice(6).every(x => x > 3.0 && x < 4.4))) out.push('lab: giants ' + h.slice(6).map(x => x.toFixed(2)) + ' m, want 3 to 4.4');
  await L.play('ual_chop');
  f.forEach(x => x.update(0.37));
  const t = f.map(x => x.action && x.action.getClip().name === 'ual_chop' ? x.action.time / (x.cadence || 1) : -1);
  if (t.some(x => Math.abs(x - t[0]) > 1e-5 || x < 0)) out.push('lab: the six are out of step: ' + t);
  if (f.some(x => !x.held.R)) out.push('lab: a figure holds nothing in the chop');
  document.querySelector('.verdicts button[data-v="good"]').click();
  if (!(L.reviews().ual_chop && L.reviews().ual_chop.verdict === 'good')) out.push('lab: the mark was not kept');
  document.querySelector('.verdicts button[data-v="good"]').click();
  // the hand props, on the six people: each clip stepped at 30 Hz from its start (the passes keep state between frames)
  const six = f.slice(0, 6), V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
  const bone = (x, n) => x.bones.find(b => b.name === n);
  async function run(clip, each){
    await L.play(clip);
    for (const x of six) { const d = x.action.getClip().duration; x.action.time = 0; x.update(0);
      for (let t = 0; t < d; t += 1 / 30) { x.update(1 / 30); each(x, x.action.time); } }
  }
  function at(clip, t){ six.forEach(x => { x.action.time = Math.max(0, t - 1); for (let i = 0; i < 30; i++) x.update(1 / 30); x.action.time = t; x.update(0); }); }
  await L.play('walk_bucket'); at('walk_bucket', 4);
  six.forEach((x, i) => { const g = bone(x, 'RightHand').children.find(c => !c.isBone), pv = g && g.children[0];
    const ax = pv && V().set(0, 0, 1).applyQuaternion(pv.getWorldQuaternion(Q()));
    if (!ax || ax.y > -0.999) out.push('props: the bucket does not hang plumb on figure ' + i); });
  await L.play('bow_draw'); at('bow_draw', 5);
  six.forEach((x, i) => { const b = x.bowState(); if (!b || !b.arrow || x.faceW < 0.99) out.push('props: Draw from quiver at 5 s, figure ' + i + ': no arrow nocked or the hand not at the jaw'); });
  for (const t of [6.2, 7.69]) { at('bow_draw', t); six.forEach((x, i) => { if (x.bowState().arrow) out.push('props: an arrow on the string after the loose (' + t + ' s), figure ' + i); }); }
  let legs = 0; await run('bow_scan', x => { legs = Math.max(legs, x.bowState().inLegs); });
  if (legs > 0.01) out.push('props: the bow goes ' + (legs * 100).toFixed(1) + ' cm into the legs in Bow aim and scan');
  let blade = 0; await run('block_2', x => { const n = x.bladeNeed; if (n.length) blade = Math.max(blade, n[n.length - 1]); });
  if (blade > 0.01) out.push('props: the blade of Block 2 goes ' + (blade * 100).toFixed(1) + ' cm into the head, neck or trunk');
  function segd(p1, q1, p2, q2){ let best = 9; for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) best = Math.min(best, p1.clone().lerp(q1, i / 20).distanceTo(p2.clone().lerp(q2, j / 20))); return best; }
  let fore = 9; await run('parry_2h', x => { const P = n => bone(x, n).getWorldPosition(V()); fore = Math.min(fore, segd(P('LeftForeArm'), P('LeftHand'), P('RightForeArm'), P('RightHand'))); });
  if (fore < 0.06) out.push('props: the forearms come ' + (fore * 100).toFixed(1) + ' cm apart in Two-handed parry');
  await L.play('drink'); at('drink', 4);
  six.forEach((x, i) => { if (x.held.L !== 'cup' || x.faceW < 0.99) out.push('props: Drink, figure ' + i + ': the cup not at the lips in the left hand'); });
  // the second round: the arrow's head in front of the bow; no flip in the parry's left grip; the cup and bowl upright
  for (const c of ['bow_draw', 'bow_walk', 'bow_scan', 'bow_shot']) {
    let ahead = 9; await run(c, x => { const b = x.bowState(); if (b.arrow && b.ahead != null) ahead = Math.min(ahead, b.ahead); });
    if (ahead < 0.03) out.push('props: in ' + c + ' the head of the arrow comes ' + (ahead * 100).toFixed(1) + ' cm from the bow');
  }
  let spin = 0, prevQ = null; await run('parry_2h', x => { const q = bone(x, 'LeftHand').getWorldQuaternion(Q()); if (prevQ && x.action.time > 0.05) spin = Math.max(spin, prevQ.angleTo(q)); prevQ = q; });
  if (spin > 0.8) out.push('props: in Two-handed parry the left hand turns ' + (spin * 57.3).toFixed(0) + ' degrees in a frame');
  const upOf = (x, side, ax) => V().fromArray(ax).applyQuaternion(bone(x, side === 'R' ? 'RightHand' : 'LeftHand').children.find(c => !c.isBone).getWorldQuaternion(Q())).y;
  await L.play('drink'); at('drink', 1);
  six.forEach((x, i) => { if (upOf(x, 'L', [0, 1, 0]) < 0.95) out.push('props: Drink at 1 s, figure ' + i + ': the cup is not upright'); });
  await L.play('ual_consume'); at('ual_consume', 0.7);
  six.forEach((x, i) => { const w = bone(x, 'RightHand').getWorldPosition(V()), sp = bone(x, 'Spine').getWorldPosition(V());
    if (upOf(x, 'R', [1, 0, 0]) < 0.95 || w.z - sp.z < 0.12) out.push('props: Eat at 0.7 s, figure ' + i + ': the bowl not level on the palm in front of the belly'); });
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
        if 'animation-lab' in os.path.basename(page_path):
            await pg.wait_for_function('window._lab', timeout=120000)
            r = await pg.evaluate(LAB_CHECKS) if do_assert else []
            fails += r
            if out_dir:
                os.makedirs(out_dir, exist_ok=True)
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=os.path.join(out_dir, 'animation-lab.png'))
            await b.close()
            for e in errs:
                print('page error:', e)
            for f in fails:
                print('FAIL', f)
            print('verify: %s' % ('ok' if not errs and not fails else 'FAILED'))
            return 0 if not errs and not fails else 1
        await pg.evaluate('window._kchar && window._kchar.ready')
        await pg.wait_for_function('window._kchar', timeout=120000)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(out_dir, 'cosmetic-lab.png'))
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
            fails += ['props: ' + m for m in r['props']]
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
