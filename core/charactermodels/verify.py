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
  nonhuman     the Lizardman test (tools/nonhuman.py): the head leaves out the hair and the head's skin; the tail's skin
               keeps to its joints under the morphs; in idle, walk and a crouch its points stay out of the legs and above
               the floor and lag behind the hips; the jaw opens
The Animation Lab (window._lab) is checked instead for: six figures dressed, each body's short one shorter than its
neutral one and its tall one taller; a clip plays on all six in step; a review mark is kept; and on the six, the hand
props (the owner's review, 2026-10-20): the bucket hangs plumb in Carry bucket; Draw from quiver has the arrow on the
string and the string hand at the jaw at 5 s, and no arrow after the loose (6.2 s, 7.69 s); the bow's limbs stay out of
the legs in Bow aim and scan; Block 2's blade stays out of the head and neck; Two-handed parry's forearms stay apart;
Drink brings the cup to the lips in the left hand; and the second round (2026-10-21): the arrow's head stays in front
of the bow in every bow clip on every body; Two-handed parry's left hand does not flip round the hilt; Drink's cup stands
upright before it is drunk from; Eat's bowl stands level in front of the belly; and the third round (2026-11-26): the
bucket's bail stays in the fist (the hand never turning more than 20 degrees in a frame) and its body out of the legs in
Carry bucket and Water plants; the pickaxe in Dig and the
hammer at the anvil stay out of the head; Chop's left arm stays out of the jaw; Sit and drink brings the cup to the lips;
Eat's bowl shoulder is not hiked.
--out writes a screenshot of the default figure, a rolled stranger, and a stranger of every people per body (faces).
"""
import asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
THREE = os.path.join(ROOT, 'settlements', 'ys', 'three.min.js')
LOADER = os.path.join(HERE, 'tools', 'vendor', 'GLTFLoader.r128.js')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import verify_page, Abort
# what the labs load from a CDN, served from the repo; their fonts are not needed
ROUTES = (('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='text/javascript')),
          ('**/GLTFLoader.js', lambda r: r.fulfill(path=LOADER, content_type='text/javascript')),
          ('**/fonts.g*/**', lambda r: r.abort()))

# every tab's section titles (the h3 of each .slot, without its <small>), by tab id: the UI inventory
UI_INV = r'''async () => { const out = {};
  for (const t of document.querySelectorAll('[role=tab]')) { t.click(); await new Promise(r => setTimeout(r, 60));
    const page = document.getElementById(t.getAttribute('aria-controls')); if (!page) continue;
    out[t.id] = Array.from(page.querySelectorAll('.slot > h3')).map(h => (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent).trim()); }
  const g = document.getElementById('tab-gear'); if (g) g.click();
  return out; }'''

CHECKS = r'''async () => {
  const K = window._kchar, D = KCHAR_DATA, out = { pieces: [], rest: { worst: 0, at: '' }, feet: [], morph: [], clips: 0, random: true, ranges: [], hide: [], props: [], fold: {}, nonhuman: [] };
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
      let moved = 0, bad = 0, deep = 0, deepest = 0;
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
          // the limb as the chains and the push see it: its radius per end (colliders ra, rb), not the median r (the
          // median held the court skirt's points 2 cm off the knee's true radius, and collide() keeps them at ra..rb + 1.5 cm)
          // (a point within a centimetre of that surface is the chain settling inside the 1.5 cm margin collide() keeps
          // and the push covers the cloth between chains: the court skirt's deepest is 3 mm, at the stride's two ends)
          const rt = cp.ra != null ? cp.ra + ((cp.rb != null ? cp.rb : cp.ra) - cp.ra) * t : cp.r, dd = rt - x.distanceTo(a.clone().addScaledVector(ab, t));
          if (dd > 0.01) deep++;
          if (dd > deepest) deepest = dd;
        })));
      }
      if (bad || moved < 0.01) out.props.push(body + ' cloth: ' + bad + ' non-finite points, largest swing ' + moved.toFixed(3) + ' m');
      if (deep) out.props.push(body + ' cloth: ' + deep + ' chain points inside a thigh (the deepest ' + (deepest * 1000).toFixed(0) + ' mm)');
      await window._kchar.set(r0);
    }
    // the non-human parts (tools/nonhuman.py, a spike): with the Lizardman's tail and head on, the head leaves out the
    // hair and beard; in the A-pose, heavy morph or none, the tail's skin keeps to its joints (the pieces' recipes and
    // the joints' morph rows agree) and every bone carrying it is at its bind; in the idle, a walk and a crouch the
    // tail's points stay finite, out of the thighs and shins (their radius less 5 mm) and above the floor, and lag behind
    // the hips; the jaw opens now and then
    if (kit.items.some(it => it.id === 'mod_tail')) {
      const hasLzLegs = kit.items.some(it => it.id === 'mod_legs_lizard');
      const lzMods = hasLzLegs ? ['mod_tail', 'mod_head_lizard', 'mod_legs_lizard'] : ['mod_tail', 'mod_head_lizard'];
      const lz = Object.assign(JSON.parse(JSON.stringify(dressed)), { mods: lzMods });
      const lzKilt = kit.items.find(it => it.slot === 'legs' && (it.id === 'voth_m_peasant_maxtlatl' || (it.loose && it.cloth)));
      if (hasLzLegs && lzKilt) lz.armour.legs = lzKilt.id;
      const NH = out.nonhuman, tl = kit.items.find(it => it.id === 'mod_tail').tail;
      await k2.set(lz); fig.play(null); await new Promise(r => setTimeout(r, 50));
      if (JSON.stringify(shownKeys()) !== JSON.stringify(keys(lz))) NH.push(body + ' lizard shows ' + shownKeys());
      if (shownKeys().some(k => k === KCHAR.key(kit.items.find(i => i.id === dressed.hair).glb))) NH.push(body + ' lizard: the hair is drawn');
      if (hasLzLegs && dressed.armour && dressed.armour.feet && shownKeys().some(k => k.endsWith('/' + dressed.armour.feet))) NH.push(body + ' lizard: human boots drawn over saurian feet');
      if (!(skin().geometry.index.count < out.hide.find(h => h[0] === body)[1])) NH.push(body + ' lizard: the head skin is not left out');
      for (const [tag, mo] of [['lizard', {}], ['lizard heavy', heavy]]) {
        await k2.set(Object.assign({}, lz, { morph: mo })); rest(tag);
        const tm = shown().find(m => m.userData.part.key.endsWith('/mod_tail')), sc = fig.inner.getWorldScale(new THREE.Vector3()).x;
        const pts = tl.joints.map(n => fig.bones.find(b => b.name === n).getWorldPosition(new THREE.Vector3()));
        pts.push(fig.tailState().x[pts.length].clone());
        const P = tm.geometry.attributes.position.array, v = new THREE.Vector3();
        let worst = 0;
        for (let i = 0; i < P.length; i += 3) {
          v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(tm.matrixWorld);
          let d = 1e9;
          for (let k = 0; k + 1 < pts.length; k++) { const ab = pts[k + 1].clone().sub(pts[k]), t = Math.max(0, Math.min(1, v.clone().sub(pts[k]).dot(ab) / ab.lengthSq())); d = Math.min(d, v.distanceTo(pts[k].clone().addScaledVector(ab, t))); }
          worst = Math.max(worst, d);
        }
        // the allowance grows with the tail (a tall body's is longer, and so thicker, its root rings sunk further)
        let len = 0, len0 = 0; for (let k = 1; k < tl.joints.length; k++) { len += pts[k].distanceTo(pts[k - 1]); len0 += new THREE.Vector3().fromArray(D.bodies[body].skeleton.joints.find(j => j.name === tl.joints[k]).t).length(); }
        if (worst > (tl.radius[0] * 1.35 + 0.01) * sc * Math.max(1, len / (len0 * sc))) NH.push(body + ' ' + tag + ': the tail skin stands ' + worst.toFixed(3) + ' m off its joints');
      }
      await k2.set(lz);
      const legs = fig.clothState().caps.filter(cp => !cp.pa && /UpLeg|Leg$|Foot|Toe/.test(fig.bones[cp.a].name));
      for (const c of ['idle', 'walk', 'ual_crouch']) {
        await fig.play(c);
        let deep = 0, low = 0, bad = 0, lag = 0;
        for (let k = 0; k < 90; k++) {
          fig.update(1 / 30);
          const T = fig.tailState(), sc = fig.inner.getWorldScale(new THREE.Vector3()).x, floor = fig.group.getWorldPosition(new THREE.Vector3()).y;
          const dsNow = fig.digiState();
          const segs = dsNow ? dsNow.sides.flatMap(sd => {
            const rad = dsNow.spec.radii || {}, gk = dsNow.girthK == null ? 1 : dsNow.girthK;
            return [[sd.dt, sd.ds, rad.thigh || [0.08, 0.055]], [sd.ds, sd.dh, rad.shin || [0.052, 0.03]], [sd.dh, sd.dp, rad.meta || [0.03, 0.038]]].map(p => ({
              a: fig.bones[p[0]].getWorldPosition(new THREE.Vector3()), b: fig.bones[p[1]].getWorldPosition(new THREE.Vector3()),
              ra: p[2][0] * gk, rb: p[2][1] * gk
            }));
          }) : legs.map(cp => ({ a: fig.bones[cp.a].getWorldPosition(new THREE.Vector3()), b: fig.bones[cp.b].getWorldPosition(new THREE.Vector3()), ra: cp.ra || cp.r, rb: cp.rb || cp.r }));
          T.x.forEach((x, i) => {
            if (!isFinite(x.x + x.y + x.z)) { bad++; return; }
            if (i === 0) return;
            lag = Math.max(lag, x.distanceTo(T.tw[i]));
            if (x.y < floor - 0.001) low++;
            segs.forEach(cp => {
              const ab = cp.b.clone().sub(cp.a), t = Math.max(0, Math.min(1, x.clone().sub(cp.a).dot(ab) / Math.max(1e-12, ab.lengthSq())));
              const r = (cp.ra + (cp.rb - cp.ra) * t + tl.radius[Math.min(i, tl.radius.length - 1)]) * sc;
              deep = Math.max(deep, r - x.distanceTo(cp.a.clone().addScaledVector(ab, t)));
            });
          });
        }
        if (bad || low) NH.push(body + ' ' + c + ': ' + bad + ' non-finite tail points, ' + low + ' below the floor');
        if (deep > 0.005) NH.push(body + ' ' + c + ': the tail ' + deep.toFixed(3) + ' m into a leg');
        if (c === 'walk' && lag < 0.01) NH.push(body + ' walk: the tail does not lag (' + lag.toFixed(3) + ' m)');
      }
      const jb = fig.bones.find(b => b.name === 'face_jaw'), q0 = new THREE.Quaternion();
      let open = 0;
      for (let k = 0; k < 180; k++) { fig.update(1 / 30); open = Math.max(open, 2 * Math.acos(Math.min(1, Math.abs(jb.quaternion.dot(q0))))); }
      if (open < 0.05) NH.push(body + ': the jaw does not open (' + open.toFixed(3) + ' rad)');
      await fig.play('idle'); await k2.set(dressed);
    }
    // Coyote Men digitigrade legs, tail & head (tools/digitigrade.py): rest-pose skinning identity & ground contact under
    // neutral and heavy morphs, boots & toenails left off while kilt fits, elevated hock flexes/extends in walk & run,
    // coils in crouch, and tail stays clear of the digitigrade leg segments
    if (kit.items.some(it => it.id === 'mod_legs_coyote')) {
      const NH = out.nonhuman;
      const kilt = kit.items.find(it => it.slot === 'legs' && it.loose && it.cloth);
      const boot = kit.items.find(it => it.slot === 'feet');
      const cy = Object.assign(JSON.parse(JSON.stringify(dressed)), {
        coat: 'coyote', hair_color: '#9a7a52', skin: '#6e5a4c', eye_color: '#c08a2a',
        mods: ['mod_head_coyote', 'mod_tail_coyote', 'mod_legs_coyote']
      });
      if (kilt) cy.armour.legs = kilt.id;
      if (boot) cy.armour.feet = boot.id;
      await k2.set(cy); fig.play(null); await new Promise(r => setTimeout(r, 50));
      if (JSON.stringify(shownKeys()) !== JSON.stringify(keys(cy))) NH.push(body + ' coyote shows ' + shownKeys());
      if (boot && shownKeys().some(k => k === KCHAR.key(boot.glb))) NH.push(body + ' coyote: human boots drawn over paws');
      if (shown().some(m => m.userData.srcMaterial === 'Human.toenails')) NH.push(body + ' coyote: human toenails drawn');
      for (const [tag, mo] of [['coyote', {}], ['coyote heavy', heavy]]) {
        await k2.set(Object.assign({}, cy, { morph: mo })); rest(tag);
        const lm = shown().find(m => m.userData.srcMaterial === 'Mod.coyote_legs');
        if (!lm) { NH.push(body + ' ' + tag + ': Mod.coyote_legs not shown'); continue; }
        const P = lm.geometry.attributes.position.array, v = new THREE.Vector3();
        let lowY = 1e9;
        for (let i = 0; i < P.length; i += 3) { v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(lm.matrixWorld); if (v.y < lowY) lowY = v.y; }
        const gnd = fig.group.getWorldPosition(new THREE.Vector3()).y;
        if (Math.abs(lowY - gnd) > 0.008) NH.push(body + ' ' + tag + ': paw sole off ground by ' + ((lowY - gnd) * 1000).toFixed(1) + ' mm');
      }
      await k2.set(cy);
      let idleHock = 0;
      for (const c of ['idle', 'walk', 'run', 'ual_crouch']) {
        if (!fig.clips[c]) continue;
        await fig.play(c);
        let hMin = 1e9, hMax = -1e9, angMin = 1e9, angMax = -1e9, pawBad = 0, tailBad = 0, snapBad = 0;
        const prevHz = [null, null];
        for (let k = 0; k < 75; k++) {
          fig.update(1 / 30);
          if (k < 15) continue;
          const ds = fig.digiState();
          if (!ds) { pawBad++; continue; }
          ds.state.forEach((st, si) => {
            hMin = Math.min(hMin, st.hockY); hMax = Math.max(hMax, st.hockY);
            angMin = Math.min(angMin, st.hockAng); angMax = Math.max(angMax, st.hockAng);
            if (st.pawY < 0.008 || (st.stance > 0.96 && Math.abs(st.pawY - ds.sides[si].pawH) > 0.025)) pawBad++;
            const hz = st.hockFwd;
            if (hz > -0.04 || (c === 'walk' && prevHz[si] !== null && Math.abs(hz - prevHz[si]) > 0.045)) snapBad++;
            prevHz[si] = hz;
          });
          const T = fig.tailState();
          if (T && T.x.some(x => !isFinite(x.x + x.y + x.z))) tailBad++;
        }
        if (c === 'idle') idleHock = 0.5 * (hMin + hMax);
        if (c !== 'ual_crouch' && hMin < 0.13) NH.push(body + ' coyote ' + c + ': hock dropped too low (' + hMin.toFixed(3) + ' m)');
        if ((c === 'walk' || c === 'run') && (angMax - angMin) < 0.16) NH.push(body + ' coyote ' + c + ': hock angle barely flexes (' + (angMax - angMin).toFixed(3) + ' rad)');
        if (c === 'ual_crouch' && idleHock > 0 && hMin > idleHock - 0.02) NH.push(body + ' coyote crouch: hock did not coil (' + hMin.toFixed(3) + ' vs ' + idleHock.toFixed(3) + ')');
        if (pawBad || tailBad || snapBad) NH.push(body + ' coyote ' + c + ': ' + pawBad + ' bad paw, ' + tailBad + ' bad tail, ' + snapBad + ' hock snap frames');
      }
      await fig.play('idle'); await k2.set(dressed);
    }
    // Frogmen digitigrade webbed legs & head (tools/amphibian.py, tools/digitigrade.py): pattern shader active on Mod.frog_legs,
    // rest-pose skinning identity & ground contact, human boots & toenails omitted, and smooth digitigrade gait
    if (kit.items.some(it => it.id === 'mod_legs_frog')) {
      const NH = out.nonhuman;
      const kilt = kit.items.find(it => it.slot === 'legs' && (it.id === 'voth_m_peasant_maxtlatl' || (it.loose && it.cloth)));
      const boot = kit.items.find(it => it.slot === 'feet');
      const fg = Object.assign(JSON.parse(JSON.stringify(dressed)), {
        skin: '#5f8a36', eye_color: '#d6a22a', hair: null, beard: null,
        mods: ['mod_head_frog', 'mod_legs_frog']
      });
      fg.armour.torso = null;
      if (kilt) fg.armour.legs = kilt.id;
      if (boot) fg.armour.feet = boot.id;
      await k2.set(fg); fig.play(null); await new Promise(r => setTimeout(r, 50));
      if (JSON.stringify(shownKeys()) !== JSON.stringify(keys(fg))) NH.push(body + ' frog shows ' + shownKeys());
      if (boot && shownKeys().some(k => k === KCHAR.key(boot.glb))) NH.push(body + ' frog: human boots drawn over webbed feet');
      if (shown().some(m => m.userData.srcMaterial === 'Human.toenails')) NH.push(body + ' frog: human toenails drawn');
      const flm = shown().find(m => m.userData.srcMaterial === 'Mod.frog_legs');
      if (!flm || !(flm.material.userData.kp && flm.material.userData.kp.kpOn.value > 0.5)) NH.push(body + ' frog: Mod.frog_legs missing or pattern shader off');
      for (const [tag, mo] of [['frog', {}], ['frog heavy', heavy]]) {
        await k2.set(Object.assign({}, fg, { morph: mo })); rest(tag);
        const lm = shown().find(m => m.userData.srcMaterial === 'Mod.frog_legs');
        if (!lm) continue;
        const P = lm.geometry.attributes.position.array, v = new THREE.Vector3();
        let lowY = 1e9;
        for (let i = 0; i < P.length; i += 3) { v.set(P[i], P[i + 1], P[i + 2]).applyMatrix4(lm.matrixWorld); if (v.y < lowY) lowY = v.y; }
        const gnd = fig.group.getWorldPosition(new THREE.Vector3()).y, sc = fig.inner.getWorldScale(new THREE.Vector3()).x;
        if (Math.abs(lowY - gnd) > 0.008 * sc) NH.push(body + ' ' + tag + ': frog webbed sole off ground by ' + ((lowY - gnd) * 1000).toFixed(1) + ' mm');
      }
      await fig.play('idle'); await k2.set(dressed);
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
  // the third round (the owner's review of 2026-11-26): the left hand's index side up the haft as the right's (its grip
  // frame is the right's mirrored, so their +Y point apart), the same on every body and whatever played before; its turn
  // about the forearm within reach of a wrist (the forearm takes half); no flip between frames
  const D = KCHAR_DATA, gripQ = (x, s) => { const h = D.bodies[x.kit.body].skeleton.hands[s];
    return x.bones[h.bone].getWorldQuaternion(Q()).multiply(Q().fromArray(h.grip, 3)); };
  const axis = (q, a) => V().fromArray(a).applyQuaternion(q);
  for (const [clip, prop, along] of [['axe_chop', 'axe', [0, 1, 0]], ['blunt_swing', 'mace', [0, 1, 0]], ['parry_2h', 'sword', [0, 1, 0]],
      ['spear_thrust', 'spear', [0, 1, 0]], ['spear_walk', 'spear', [0, 1, 0]], ['gun_shot', 'rifle', [0, 0, 1]], ['ual_pistol_idle', 'pistol', [0, 1, 0]]]) {
    await L.play(clip); const hp = document.getElementById('hold-pick'); if (hp.value !== prop) { hp.value = prop; hp.dispatchEvent(new Event('change')); await new Promise(r => setTimeout(r, 1500)); }
    let thumb = -1, twist = 0, flip = 0;
    for (const x of six) { const d = x.action.getClip().duration, J = D.bodies[x.kit.body].skeleton.joints, hi = x.bones.findIndex(b => b.name === 'LeftHand');
      x.action.time = 0; x.update(0); let prev = null;
      // past the cross-fade from the clip before, and short of a one-shot's end (it goes back to the last loop)
      for (let t = 0; t < d - 1 / 30; t += 1 / 30) { x.update(1 / 30);
        if (t < 0.3 || x.reach > 0.05) { prev = null; continue; }
        const ql = gripQ(x, 'L'), qr = gripQ(x, 'R');
        thumb = Math.max(thumb, axis(ql, [0, 1, 0]).dot(axis(qr, along)));
        // the hand's turn on the forearm away from its rest turn, about the forearm's line
        const hq = bone(x, 'LeftHand').getWorldQuaternion(Q()), dq = bone(x, 'LeftForeArm').getWorldQuaternion(Q()).invert().multiply(hq).multiply(Q().fromArray(J[hi].r).invert());
        const a = bone(x, 'LeftHand').position.clone().normalize();
        let ang = Math.abs(2 * Math.atan2(dq.x * a.x + dq.y * a.y + dq.z * a.z, dq.w)) * 57.3; if (ang > 180) ang = 360 - ang;
        twist = Math.max(twist, ang);
        if (prev) flip = Math.max(flip, prev.angleTo(hq)); prev = hq; } }
    if (thumb > -0.5) out.push('props: in ' + clip + ' the left hand holds the ' + prop + ' upside down (its index side toward the butt)');
    if (twist > 100) out.push('props: in ' + clip + ' the left hand is wrung ' + twist.toFixed(0) + ' degrees round the forearm');
    if (flip > 0.8) out.push('props: in ' + clip + ' the left hand turns ' + (flip * 57.3).toFixed(0) + ' degrees in a frame');
  }
  // the empty hand keeps off the other hand's blade (Parry, Thrust / stab: the blade's axis came 1.5 cm from the fingers)
  for (const [clip, bl] of [['parry', [0.1, 0.91]], ['thrust', [0.07, 0.32]]]) {
    let near = 9; await run(clip, x => { const h = bone(x, 'RightHand').children.find(c => !c.isBone); if (!h || !h.children.length) return; h.updateMatrixWorld(true);
      const A = V().set(0, bl[0] - 0.12, 0).applyMatrix4(h.matrixWorld), B = V().set(0, bl[1], 0).applyMatrix4(h.matrixWorld), P = n => bone(x, n).getWorldPosition(V());
      for (const [a, b] of [['LeftForeArm', 'LeftHand'], ['LeftHand', 'LeftHandMiddle1'], ['LeftHandMiddle1', 'LeftHandMiddle3'], ['LeftHandIndex1', 'LeftHandIndex3']]) near = Math.min(near, segd(P(a), P(b), A, B)); });
    if (near < 0.04) out.push('props: in ' + clip + ' the blade comes ' + (near * 100).toFixed(1) + ' cm from the empty hand');
  }
  // the rifle's stock out of the upper arms (Long gun shot at the hip ran its butt through the right upper arm)
  let stock = 0; await run('gun_shot', x => { const n = x.stockNeed; if (n.length) stock = Math.max(stock, n[n.length - 1]); });
  if (stock > 0.01) out.push('props: the rifle\'s stock goes ' + (stock * 100).toFixed(1) + ' cm into an upper arm in Long gun shot');
  // the pistol clips: both hands on the gun in Pistol shot; in Pistol quick draw only while it aims, off the right forearm
  await L.play('ual_pistol_shoot'); at('ual_pistol_shoot', 0.3);
  six.forEach((x, i) => { if (!x.held.both || x.reach > 0.02) out.push('props: Pistol shot at 0.3 s, figure ' + i + ': the left hand not on the gun'); });
  let fore2 = 9; await run('pistol_draw', (x, t) => { if (t < 2.6 || t > 4.2) return; const P = n => bone(x, n).getWorldPosition(V());
    fore2 = Math.min(fore2, segd(P('LeftHand'), P('LeftHandMiddle1'), P('RightForeArm'), P('RightHand'))); });
  if (fore2 < 0.08) out.push('props: in Pistol quick draw the left hand comes ' + (fore2 * 100).toFixed(1) + ' cm from the right forearm');
  // the bow's string hand at full draw 6-8 cm off the face, not on the chin (Bow shot; the base mesh skinned)
  await L.play('bow_shot'); at('bow_shot', 3.2);
  six.forEach((x, i) => {
    let base = null; x.group.traverse(o => { if (o.isSkinnedMesh && o.visible && (!base || o.geometry.attributes.position.count > base.geometry.attributes.position.count)) base = o; });
    const g = base.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, nm = base.skeleton.bones.map(b => b.name), head = [], hand = [];
    base.skeleton.update();
    for (let k = 0; k < g.attributes.position.count; k++) { let bi = si.getX(k), bw = sw.getX(k);
      for (const [c, w] of [[si.getY(k), sw.getY(k)], [si.getZ(k), sw.getZ(k)], [si.getW(k), sw.getW(k)]]) if (w > bw) { bw = w; bi = c; }
      if (nm[bi] === 'Head') head.push(k); else if (/^RightHand/.test(nm[bi])) hand.push(k); }
    const at3 = k => base.boneTransform(k, V()).applyMatrix4(base.matrixWorld), hp = head.filter((k, j) => j % 2 === 0).map(at3);
    let gap = 9; hand.map(at3).forEach(a => hp.forEach(b => { gap = Math.min(gap, a.distanceTo(b)); }));
    if (gap < 0.055 || gap > 0.095) out.push('props: Bow shot at 3.2 s, figure ' + i + ': the string hand ' + (gap * 100).toFixed(1) + ' cm off the face, want 6 to 8');
  });
  // the owner's review of 2026-11-26. The look pass: Charged slash's head (its clip looked 115 degrees aside, the chest
  // square on) and eyes toward the target ahead
  let lookOff = 0, eyeTurn = 0;
  await run('slash_charged', (x, t) => { if (t < 0.4) return; const f = x.faceForward(V()), T = x.lookTarget(V());
    lookOff = Math.max(lookOff, f.angleTo(T.sub(x.headBone.getWorldPosition(V()))) * 57.3); eyeTurn = Math.max(eyeTurn, Math.abs(x.lookState.eyes[0])); });
  if (lookOff > 80 || eyeTurn < 0.1) out.push('look: Charged slash turns the face ' + lookOff.toFixed(0) + ' degrees from the target (want under 80), the eyes ' + eyeTurn.toFixed(2) + ' rad');
  // Push: the cart's bar at its height over the floor, the left hand on it
  let cartY = 0, cartReach = 0;
  await run('push', x => { const g = bone(x, 'RightHand').children.find(c => !c.isBone);
    cartY = Math.max(cartY, Math.abs(g.getWorldPosition(V()).y - x.group.position.y - KCharFigure.props.cart.ground.height * x.scale)); cartReach = Math.max(cartReach, x.reach); });
  if (cartY > 0.02 || cartReach > 0.03) out.push('props: Push, the cart\'s bar ' + (cartY * 100).toFixed(1) + ' cm off its height, the left hand ' + (cartReach * 100).toFixed(1) + ' cm short of it');
  // Pick into basket: the basket hangs plumb under the hand dropping the fruit
  await L.play('pick_fruit'); at('pick_fruit', 2.4);
  six.forEach((x, i) => { const g = bone(x, 'LeftHand').children.find(c => !c.isBone), pv = g && g.children[0];
    if (x.held.L !== 'basket' || !pv) { out.push('props: Pick into basket, figure ' + i + ': no basket'); return; }
    const mouth = V().set(0, 0, 0.2).applyMatrix4(pv.matrixWorld), r = bone(x, 'RightHand').getWorldPosition(V());
    const ax = V().set(0, 0, 1).applyQuaternion(pv.getWorldQuaternion(Q()));
    if (ax.y > -0.999 || Math.hypot(mouth.x - r.x, mouth.z - r.z) > 0.25 * x.scale) out.push('props: Pick into basket at 2.4 s, figure ' + i + ': the basket not plumb under the picking hand (' + Math.hypot(mouth.x - r.x, mouth.z - r.z).toFixed(2) + ' m off)'); });
  // Block and Block 2: seen from the front the blade crosses the face (it pointed back past the head), in front of it
  for (const [c, t] of [['block', 1.25], ['block_2', 0.55]]) {
    await L.play(c); at(c, t);
    six.forEach((x, i) => { const g = bone(x, 'RightHand').children.find(c => !c.isBone), m = g && g.children[0];
      const eye = x.headBone.getWorldPosition(V()).add(V().set(0, 0.09 * x.scale, 0)); let best = 9, z = 0;
      for (let s = 0.1; s <= 0.91; s += 0.03) { const p = V().set(0, s, 0).applyMatrix4(m.matrixWorld), d = Math.hypot(p.x - eye.x, p.y - eye.y); if (d < best) { best = d; z = p.z - eye.z; } }
      if (best > 0.08 * x.scale || z < 0.05 * x.scale) out.push('props: ' + c + ' at ' + t + ' s, figure ' + i + ': the blade does not cross before the face (' + best.toFixed(2) + ' m off its line, ' + z.toFixed(2) + ' m ahead)'); });
  }
  // Walk while shooting: the low aim points the barrel at least 15 degrees lower than the high aim
  const barrel = x => { const g = bone(x, 'RightHand').children.find(c => !c.isBone); return Math.asin(V().set(0, 0, 1).applyQuaternion(g.getWorldQuaternion(Q())).y) * 57.3; };
  const aims = {};
  for (const c of ['walk_shoot_high', 'walk_shoot']) { let s = 0, n = 0; await run(c, x => { s += barrel(x); n++; }); aims[c] = s / n; }
  if (!(aims.walk_shoot < aims.walk_shoot_high - 15)) out.push('clips: Walk while shooting aims ' + aims.walk_shoot.toFixed(0) + ' degrees, the high aim ' + aims.walk_shoot_high.toFixed(0));
  // Open door: the hand closes on the handle and pulls it toward the body
  await L.play('open_door'); at('open_door', 0.1);
  const open0 = six.map(x => bone(x, 'RightHandIndex2').quaternion.clone());
  at('open_door', 1.2);
  const door0 = six.map(x => bone(x, 'RightHand').getWorldPosition(V()));
  const curl = six.map((x, i) => bone(x, 'RightHandIndex2').quaternion.angleTo(open0[i]));
  at('open_door', 2.5);
  six.forEach((x, i) => { const d = door0[i].z - bone(x, 'RightHand').getWorldPosition(V()).z;
    if (curl[i] < 0.5 || d < 0.15 * x.scale) out.push('clips: Open door, figure ' + i + ': the hand ' + (curl[i] < 0.5 ? 'open on the handle' : 'pulls only ' + d.toFixed(2) + ' m')); });
  // Slash left cuts level: its hand rises far less above the shoulder than the up swing's
  const rise = {};
  for (const c of ['slash_up', 'slash_left']) { let r = -9; await run(c, (x, t) => { if (t > 0.5 && t < 1.3) r = Math.max(r, bone(x, 'RightHand').getWorldPosition(V()).y - bone(x, 'RightArm').getWorldPosition(V()).y); }); rise[c] = r; }
  if (!(rise.slash_left < rise.slash_up - 0.1)) out.push('clips: Slash left rises ' + rise.slash_left.toFixed(2) + ' m over the shoulder, the up swing ' + rise.slash_up.toFixed(2));
  // the third round (2026-11-26): the bail stays in the fist and the bucket out of the legs; the made dig and hammer keep
  // their tools out of the head; Chop's left arm out of the jaw; the cup to the lips in Sit and drink; Eat's bowl
  // shoulder not hiked
  for (const c of ['walk_bucket', 'ual_water']) {
    // and the hand does not flip from frame to frame (round 5, 2026-11-27: Water plants' hand snapped half a turn as the
    // forearm turn that lays the bail level changed sides)
    let legs = 0, bail = 0, flip = 0; const prevQ = new Map();
    await run(c, x => { legs = Math.max(legs, x.hangNeed);
      const pv = bone(x, 'RightHand').children.find(o => !o.isBone).children[0];
      bail = Math.max(bail, V().set(0, 1, 0).applyQuaternion(pv.quaternion).angleTo(V().set(0, 1, 0)));
      const q = bone(x, 'RightHand').getWorldQuaternion(Q());
      if (prevQ.has(x) && x.action.time > 0.05) flip = Math.max(flip, prevQ.get(x).angleTo(q));
      prevQ.set(x, q); });
    if (flip > 0.35) out.push('props: in ' + c + ' the bucket hand turns ' + (flip * 57.3).toFixed(0) + ' degrees in a frame');
    if (legs > 0.015) out.push('props: in ' + c + ' the bucket comes ' + (legs * 100).toFixed(1) + ' cm into the legs (their capsules and the trousers)');
    if (bail > 0.01) out.push('props: in ' + c + ' the bail turns ' + (bail * 57.3).toFixed(0) + ' degrees out of the fist');
  }
  const TOOL = { pickaxe: [[0, 0, 0], [0, 0.15, 0], [0, 0.3, 0], [0, 0.45, 0], [0, 0.6, 0, 0.03], [0, 0.57, 0.13], [0, 0.54, 0.26, 0.012], [0, 0.57, -0.13], [0, 0.54, -0.26, 0.012]],
                 hammer: [[0, 0, 0], [0, 0.1, 0], [0, 0.2, 0], [0, 0.32, 0.07, 0.035], [0, 0.32, 0.01, 0.035], [0, 0.32, -0.05, 0.035]] };
  for (const c of [['dig', 'pickaxe'], ['hammer_anvil', 'hammer']]) {
    let deep = 0; await run(c[0], x => { const hc = V(), r = x.facePoint('head', hc), g = bone(x, 'RightHand').children.find(o => !o.isBone);
      if (!r || !g || x.held.R !== c[1]) return;
      TOOL[c[1]].forEach(p => { deep = Math.max(deep, r + (p[3] || 0.02) - V().set(p[0], p[1], p[2]).applyMatrix4(g.matrixWorld).distanceTo(hc)); }); });
    if (deep > 0.005) out.push('props: in ' + c[0] + ' the ' + c[1] + ' comes ' + (deep * 100).toFixed(1) + ' cm into the head');
  }
  let jaw = 0; await run('ual_chop', x => { jaw = Math.max(jaw, x.jawNeed); });
  if (jaw > 0.015) out.push('props: in Chop the left arm comes ' + (jaw * 100).toFixed(1) + ' cm into the jaw');
  await L.play('sit_drink'); at('sit_drink', 5.5);
  six.forEach((x, i) => { if (x.held.R !== 'cup' || x.faceW < 0.99) out.push('props: Sit and drink at 5.5 s, figure ' + i + ': the cup not at the lips'); });
  await L.play('ual_consume'); at('ual_consume', 0.7);
  six.forEach((x, i) => { const P = KCHAR.fk(KCHAR_DATA.bodies[x.kit.body].skeleton, x.pose.t).P, ia = x.bones.indexOf(bone(x, 'RightArm')), ic = x.bones.indexOf(bone(x, 'RightShoulder'));
    const e0 = Math.asin(V().fromArray(P[ia]).sub(V().fromArray(P[ic])).normalize().y), e = Math.asin(bone(x, 'RightArm').getWorldPosition(V()).sub(bone(x, 'RightShoulder').getWorldPosition(V())).normalize().y);
    if (e - e0 > 6 / 57.3) out.push('props: Eat at 0.7 s, figure ' + i + ': the bowl shoulder hiked ' + ((e - e0) * 57.3).toFixed(0) + ' degrees'); });
  return out;
}'''


async def run(page_path, do_assert, out_dir):
    # the page fetches its pieces, so verify_page serves it
    async with verify_page(page_path, here=HERE, size='1400x860', routes=ROUTES, settle_ms=0, ready_js='window._kchar||window._lab') as V:
        pg, errs, fails = V.page, V.errs, V.fails
        if 'animation-lab' in os.path.basename(page_path):
            await pg.wait_for_function('window._lab', timeout=120000)
            r = await pg.evaluate(LAB_CHECKS) if do_assert else []
            fails += r
            if out_dir:
                os.makedirs(out_dir, exist_ok=True)
                await pg.wait_for_timeout(1500)
                await pg.screenshot(path=os.path.join(out_dir, 'animation-lab.png'))
            raise Abort(0)
        await pg.evaluate('window._kchar && window._kchar.ready')
        await pg.wait_for_function('window._kchar', timeout=120000)
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=os.path.join(out_dir, 'cosmetic-lab.png'))
        if do_assert or '--ui-baseline' in sys.argv:
            # the lab's sections (every tab's h3 titles) against tests/ui-inventory.json: a section that vanishes
            # fails the run (the Backpacks row and the Izani tiers went missing from the lab more than once:
            # REVIEW-GARMENTS-2026-11-06.md). --ui-baseline rewrites the golden from the page as it stands
            import re
            inv = await pg.evaluate(UI_INV)
            inv = {k: sorted(set(re.sub(r'\s*\(\d+\)\s*$', '', t) for t in v)) for k, v in inv.items()}
            gp = os.path.join(HERE, 'tests', 'ui-inventory.json')
            if '--ui-baseline' in sys.argv:
                with open(gp, 'w', encoding='utf-8', newline='\n') as f:
                    json.dump(inv, f, indent=1)
                print('ui: baseline written, %d sections over %d tabs' % (sum(len(v) for v in inv.values()), len(inv)))
            elif os.path.exists(gp):
                for tab, titles in json.load(open(gp, encoding='utf-8')).items():
                    lost = [t for t in titles if t not in inv.get(tab, [])]
                    if lost:
                        fails.append('ui: %s lost %s' % (tab, '; '.join(lost)))
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
            fails += ['nonhuman: ' + m for m in r['nonhuman']]
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
    for f in fails:
        print('FAIL', f)
    return V.exit()


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        sys.exit(__doc__)
    out = a[a.index('--out') + 1] if '--out' in a else None
    sys.exit(asyncio.run(run(a[0], '--assert' in a, out)))
