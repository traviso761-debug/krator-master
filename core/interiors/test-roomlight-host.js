// node core/interiors/test-roomlight-host.js: K4 (GRAPHICS-TERRAIN-PROPOSAL.md 12d), the web host's light layers.
//   KNLV: the night light volume girder, yuni, locus and mavs-refuge pasted into their 45-kit.js, now one module. For each
//   build, its copy as committed before the change (git show <base>:...) and its section as it is now (on KNLV) are run side
//   by side on the pinned three.js: the shader text of every hook form (lit, on a shared position varying, Lambert, basic)
//   is the same bytes, the baked texture is the same bytes, and Mav's interior lights added after the bake land the same.
//   KRLHOST: the room table as a texture, the twin of godot/krator/kinteriors_light.gd _build_room_light_tex, and its hook.
//     node core/interiors/test-roomlight-host.js [base]      (base: the commit the copies are read from, default HEAD)
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..'), BASE = process.argv[2] || 'HEAD';
const THREE_SRC = fs.readFileSync(path.join(ROOT, 'kits', 'ancients', 'three.min.js'), 'utf8');
const HOST = fs.readFileSync(path.join(__dirname, '20-core-roomlight-host.js'), 'utf8');
const BUILDS = ['girder', 'yuni', 'locus', 'mavs-refuge'];
const A = '/* ============================== NIGHT LIGHT VOLUME', Z = /function nlMaterial\([^]*?\n}\n/;
function section(text){ const i = text.indexOf(A), m = Z.exec(text.slice(i)); if(i < 0 || !m) throw new Error('no NIGHT LIGHT VOLUME section'); return text.slice(i, i + m.index + m[0].length); }
function sandbox(src, withHost, noRoom){
  const ctx = { console, Math, JSON, Float32Array, Uint8Array, Uint16Array, Uint32Array, performance: { now: () => 0 } };
  ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
  vm.runInContext(THREE_SRC, ctx);
  vm.runInContext('var PAL = { flame: { warm: [1.0, 0.62, 0.28], cool: [0.35, 0.7, 1.0] } }; var CATALOG = false, SHEET = false, KIT = null;' +
    'function phash(x, y, z, s){ var h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s) * 43758.5453; return h - Math.floor(h); }', ctx);
  if(withHost) vm.runInContext(HOST, ctx, { filename: '20-core-roomlight-host.js' });
  if(noRoom) vm.runInContext('var _knlvCreate = KNLV.create; KNLV.create = function(c){ c = Object.assign({}, c); delete c.roomLight; return _knlvCreate(c); };', ctx);
  vm.runInContext(src, ctx);
  return ctx;
}
const SH = ctx => ({ std: ctx.THREE.ShaderLib.standard, lam: ctx.THREE.ShaderLib.lambert, basic: ctx.THREE.ShaderLib.basic });
function hookTexts(ctx){
  const L = SH(ctx), out = {};
  for(const [name, lib, shaderName, wp] of [['standard', L.std, 'MeshStandardMaterial'], ['lambert', L.lam, 'MeshLambertMaterial'],
      ['basic', L.basic, 'MeshBasicMaterial'], ['shared-wp', L.std, 'MeshStandardMaterial', 'vMyWP']]){
    const sh = { uniforms: {}, vertexShader: lib.vertexShader, fragmentShader: lib.fragmentShader, shaderName };
    vm.runInContext('applyNightGlow', ctx)(sh, wp);
    out[name] = sh.vertexShader + '\n//FS\n' + sh.fragmentShader + '\n//U ' + Object.keys(sh.uniforms).sort().join(',');
  }
  return out;
}
/* the same lamps and windows in both: a few hundred, across the volume and its height */
function fill(ctx){
  const L = vm.runInContext('NL_LAMPS', ctx), W = vm.runInContext('NL_WINDOWS', ctx);
  for(let i = 0; i < 300; i++){ const a = i * 2.39996, r = 20 + i * 2.5;
    L.push([Math.cos(a) * r, -6 + (i % 23) * 4.1, Math.sin(a) * r, 0.6 + (i % 5) * 0.2, 8 + (i % 7) * 2, i % 4 === 0 ? 1 : 0]); }
  for(let i = 0; i < 200; i++){ const a = i * 1.7, r = 15 + i * 3;
    vm.runInContext('nlWinAdd', ctx)(Math.cos(a) * r, 2 + (i % 11) * 3, Math.sin(a) * r, Math.cos(a), Math.sin(a), 1.1, 1.4, i % 9 === 0, true); }
}
let srcFails = 0;
for(const b of BUILDS){
  const rel = 'settlements/' + b + '/src/45-kit.js';
  /* the pasted copy: at BASE while it still holds it (before the change is committed), else at the parent of the commit
     that removed it (git log -S finds it), so the test keeps its reference after the commit and after a merge */
  const git = args => { try { return cp.execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }); } catch(e) { return null; } };
  const PASTED = 'var nlvTex = new THREE.DataTexture(';
  let ref = BASE, oldText = git(['show', ref + ':' + rel]);
  if(oldText && !oldText.includes(PASTED)){ const c = (git(['log', '-1', '--format=%H', '-S' + PASTED, BASE, '--', rel]) || '').trim(); ref = c + '^'; oldText = c ? git(['show', ref + ':' + rel]) : null; }
  T.ok(b + ': its pasted copy is found (' + ref.slice(0, 12) + ')', !!oldText && oldText.includes(PASTED));
  if(!oldText || !oldText.includes(PASTED)){ srcFails++; continue; }
  const newText = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const oldSec = section(oldText), newSec = section(newText);
  T.ok(b + ': the old copy pasted the volume; the new section takes KNLV', /var nlvTex = new THREE\.DataTexture/.test(oldSec) && !/new THREE\.DataTexture/.test(newSec) && /KNLV\.create/.test(newSec));
  const O = sandbox(oldSec, false), N = sandbox(newSec, true, true);   /* the identity: the room light off */
  const ho = hookTexts(O), hn = hookTexts(N);
  T.ok(b + ': every hook form writes the same shader text, byte for byte', Object.keys(ho).every(k => ho[k] === hn[k]),
    Object.keys(ho).filter(k => ho[k] !== hn[k]).join(', '));
  /* with the room light on (the build's own cfg), the only addition is the room light's text, in every lit form, and none in basic */
  const R = sandbox(newSec, true), hr = hookTexts(R);
  T.ok(b + ': with roomLight on, the room light is the only addition (lit forms), basic untouched', ['standard', 'lambert', 'shared-wp'].every(k => hr[k] !== ho[k] && /uRlTex/.test(hr[k])) && hr.basic === ho.basic,
    ['standard', 'lambert', 'shared-wp', 'basic'].filter(k => (k === 'basic') !== (hr[k] !== ho[k])).join(', '));
  fill(O); fill(N);
  const so = vm.runInContext('JSON.stringify(nlvBake())', O), sn = vm.runInContext('JSON.stringify(nlvBake())', N);
  const dO = vm.runInContext('nlvTex.image.data', O), dN = vm.runInContext('nlvTex.image.data', N);
  T.ok(b + ': the bake reports the same', so === sn, so + ' vs ' + sn);
  T.ok(b + ': the baked texture is the same bytes (' + (dO.length >> 20) + ' MB)', dO.length === dN.length && Buffer.compare(Buffer.from(dO.buffer), Buffer.from(dN.buffer)) === 0);
  if(b === 'mavs-refuge'){
    const add = ctx => { vm.runInContext('nlvAddIx', ctx)([[12, 4, -30, 0.7, 7], [-40, 10, 22, 0.9, 6]]); return vm.runInContext('nlvTex.image.data', ctx); };
    const aO = add(O), aN = add(N);
    T.ok(b + ': interior lights added after the bake land the same (nlvAddIx)', Buffer.compare(Buffer.from(aO.buffer), Buffer.from(aN.buffer)) === 0 &&
      vm.runInContext('NL_IX.length', N) === 2 && vm.runInContext('NLV_U.uIxP.value.length', N) === 8);
  }
}
/* a negative: the comparison does catch a change in the text (a gain printed differently) */
T.neg('a hook whose numbers differ is caught by the text comparison',
  pair => pair[0] === pair[1],
  (() => { const N = sandbox(section(fs.readFileSync(path.join(ROOT, 'settlements/girder/src/45-kit.js'), 'utf8')), true);
    const a = hookTexts(N).standard; vm.runInContext('NLV.cfg.lampGain = 0.56', N); return [a, hookTexts(N).standard]; })(),
  (() => { const N = sandbox(section(fs.readFileSync(path.join(ROOT, 'settlements/girder/src/45-kit.js'), 'utf8')), true);
    return [hookTexts(N).standard, hookTexts(N).standard]; })());

/* KRLHOST: the room table as Godot builds it */
const KR = require('./10-core-roomlight.js'), H = sandbox('', true), RL = vm.runInContext('KRLHOST', H);
const table = KR.buildTable({ rooms: [
  { id: 'hall', box: [0, 0, 0, 8, 3, 6], doors: [{ out: true, w: 1.2 }, { to: 'store', w: 1 }], windows: [{ w: 1.4, h: 1.4 }], lamps: [[1, 2, 1, 1, 8]] },
  { id: 'store', box: [8, 0, 0, 12, 3, 6], doors: [] },
  { id: 'vault', box: [20, -6, 0, 24, -3, 4], vault: true, lamps: [[22, -4, 2, 1, 6]] }] });
const D = RL.texData(table);
T.ok('texData: a column per room and a fallback column', D.width === 4 && D.data.length === 4 * 2 * 4);
const px = (x, y) => Array.from(D.data.slice((y * D.width + x) * 4, (y * D.width + x) * 4 + 4));
const hall = table.byId.hall, near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
T.ok('row 0 is daylight x tint and lamp ambience, row 1 lamp colour and vault (kinteriors_light.gd)',
  near(px(0, 0), [hall.daylight * hall.daylightTint[0], hall.daylight * hall.daylightTint[1], hall.daylight * hall.daylightTint[2], hall.lampAmbience]) &&
  near(px(0, 1), hall.lampColor.concat([0])) && px(2, 1)[3] === 1);
T.ok('the fallback column is Godot\'s (0.20, 0.22, 0.25, 0.07) / (1.0, 0.75, 0.43, 0)', near(px(3, 0), [0.20, 0.22, 0.25, 0.07]) && near(px(3, 1), [1.0, 0.75, 0.43, 0]));
T.ok('uById is each column\'s middle, (i + 0.5) / w', D.uById.hall === 0.5 / 4 && D.uById.vault === 2.5 / 4 && D.fallbackU === 3.5 / 4);
const tx = RL.texture(table);
T.ok('texture(): a nearest-filtered float texture, two rows', tx.tex.image.height === 2 && tx.tex.minFilter === H.THREE.NearestFilter && tx.tex.type === H.THREE.FloatType);
const hooked = (Mat) => { const m = new Mat(), lib = Mat === H.THREE.MeshLambertMaterial ? H.THREE.ShaderLib.lambert : H.THREE.ShaderLib.standard;
  RL.apply(m, { tex: tx.tex, u: tx.uById.store });
  const sh = { uniforms: {}, vertexShader: lib.vertexShader, fragmentShader: lib.fragmentShader }; m.onBeforeCompile(sh); return { m, sh }; };
const hs = hooked(H.THREE.MeshStandardMaterial), hl = hooked(H.THREE.MeshLambertMaterial);
T.ok('apply() on a Standard material: the room light replaces the ambient irradiance where indoor', /irradiance = mix\(irradiance, _rIrr, _rlIn \* uRlIndoor\)/.test(hs.sh.fragmentShader) &&
  hs.sh.fragmentShader.indexOf('uniform sampler2D uRlTex') > 0 && hs.sh.uniforms.uRlU.value === tx.uById.store);
T.ok('apply() on a Lambert material: the accumulated indirect, before its BRDF', /reflectedLight\.indirectDiffuse = mix\(reflectedLight\.indirectDiffuse, _rIrr, _rlIn \* uRlIndoor\)/.test(hl.sh.fragmentShader) &&
  /varying vec3 vRlN;/.test(hl.sh.vertexShader) && hl.sh.fragmentShader.indexOf('#include <lightmap_fragment>') < hl.sh.fragmentShader.indexOf('_rIrr'));
T.ok('the hooked program has its own key', hs.m.customProgramCacheKey() === '|rl');
T.ok('every include the hooks replace is in r128\'s shaders (a missed replace would leave the room light out)',
  ['#include <lights_fragment_end>', '#include <common>'].every(s => H.THREE.ShaderLib.standard.fragmentShader.includes(s)) &&
  ['#include <lightmap_fragment>', '#include <common>'].every(s => H.THREE.ShaderLib.lambert.fragmentShader.includes(s)) &&
  ['#include <project_vertex>', '#include <common>'].every(s => H.THREE.ShaderLib.lambert.vertexShader.includes(s)));
/* tagRooms: a room's own vertices take its column and the indoor mask; the outside of its wall and the street stay 0 */
const TR = (() => { const T3 = H.THREE, room = { id: 'store', poly: [[0, 0], [4, 0], [4, 4], [0, 4]], y: 0, h: 3 };
  const wall = new T3.Mesh(new T3.BoxGeometry(4, 3, 0.2), new T3.MeshStandardMaterial()); wall.position.set(2, 1.5, -0.1);   /* its inner face on z = 0 */
  const floor = new T3.Mesh(new T3.PlaneGeometry(3, 3).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial()); floor.position.set(2, 0.01, 2);
  const street = new T3.Mesh(new T3.PlaneGeometry(3, 3).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial()); street.position.set(9, 0, 9);
  const st = RL.tagRooms([wall, floor, street], [room], { store: 0.375 }, { width: 4 });   /* column 1 of 4 (u 0.375): aRl 2 */
  const at = (m, f) => { const P = m.geometry.attributes.position, N = m.geometry.attributes.normal, A = m.geometry.attributes.aRl, out = [];
    for (let i = 0; i < P.count; i++) if (f(P.getZ(i), N.getZ(i))) { const k = A ? A.array[i] : 0; out.push([k, k > 0 ? 1 : 0]); } return out; };
  return { st, inner: at(wall, (z, nz) => nz > 0.9), outer: at(wall, (z, nz) => nz < -0.9), floor: at(floor, () => true), street: at(street, () => true),
    packed: floor.geometry.attributes.aRl, streetAttr: street.geometry.attributes.aRl }; })();
T.ok('tagRooms: the floor inside the room is indoor, its column + 1 in one normalized Uint16', TR.floor.length && TR.floor.every(q => q[1] === 1 && q[0] === 2) &&
  TR.packed.array instanceof Uint16Array && TR.packed.normalized && TR.packed.itemSize === 1);
T.neg('tagRooms: a mesh with no vertex in a room carries no attribute (it costs every frame it is drawn: Girder lost 4 fps)',
  R => !R.streetAttr && !!R.packed, Object.assign({}, TR, { streetAttr: TR.packed }), TR);
T.ok('tagRooms: the wall\'s inner face (on the room\'s edge, turned in) is indoor', TR.inner.length && TR.inner.every(q => q[1] === 1));
T.neg('tagRooms: the wall\'s outer face and the street keep the sky (mask 0)',
  R => R.outer.every(q => q[1] === 0) && R.street.every(q => q[1] === 0),
  Object.assign({}, TR, { outer: TR.outer.map(q => [q[0], 1]) }), TR);
const ha = (() => { const m = new H.THREE.MeshStandardMaterial(); RL.apply(m, { tex: tx.tex, attr: true }); const lib = H.THREE.ShaderLib.standard;
  const sh = { uniforms: {}, vertexShader: lib.vertexShader, fragmentShader: lib.fragmentShader }; m.onBeforeCompile(sh); return { m, sh }; })();
T.ok('attribute mode: the room per vertex (aRl), its texels fetched in the vertex stage behind the room test, a value past the table read as outdoors, the fragment reading varyings only; its own program key',
  /attribute float aRl;/.test(ha.sh.vertexShader) && /_rlR = _rlR < uRlW \+ 0\.5 \? _rlR : 0\.0;/.test(ha.sh.vertexShader) &&
  /if\(_rlR > 0\.5\)\{ float _rlU = \(_rlR - 0\.5\) \/ uRlW; vRl0 = texture2D\(uRlTex, vec2\(_rlU, 0\.25\)\)/.test(ha.sh.vertexShader) &&
  !/texture2D\(uRlTex/.test(ha.sh.fragmentShader) && /if\(vRlIn > 0\.0\)\{ vec3 _rlN/.test(ha.sh.fragmentShader) && ha.m.customProgramCacheKey() === '|rla');
const pool = RL.lightPool({ add() {} }, 3); pool.set([{ at: [1, 2, 3], color: [1, .5, .2], amp: 2, range: 9 }], 0.5);
T.ok('lightPool: a fixed count of lights, the picks set, the rest dark', pool.lights.length === 3 && pool.lights[0].intensity === 1 && pool.lights[0].distance === 9 && pool.lights[1].intensity === 0);
/* wirePage: rooms that arrive later are tabled in a fixed column and the meshes near them tagged; new geometry tagged too */
const WP = (() => { const T3 = H.THREE, scene = new T3.Scene(), rooms = [{ id: 'a', poly: [[0, 0], [4, 0], [4, 4], [0, 4]], y: 0, h: 3 }];
  const fa = new T3.Mesh(new T3.PlaneGeometry(3, 3).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial()); fa.position.set(2, 0.01, 2); scene.add(fa);
  const fb = new T3.Mesh(new T3.PlaneGeometry(3, 3).rotateX(-Math.PI / 2), new T3.MeshLambertMaterial()); fb.position.set(12, 0.01, 2); scene.add(fb);
  H.KROOMLIGHT = KR; vm.runInContext('var KROOMLIGHT = this.KROOMLIGHT;', H);
  const st = RL.wirePage({ scene, rooms: () => rooms, sunUp: () => 0.25, every: 0 });
  const k = m => m.geometry.attributes.aRl ? m.geometry.attributes.aRl.array[0] : 0;
  const uA = k(fa), inB0 = k(fb) > 0 ? 1 : 0;
  rooms.push({ id: 'b', poly: [[10, 0], [14, 0], [14, 4], [10, 4]], y: 0, h: 3 }); st.tick();
  const grown = new T3.Mesh(new T3.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T3.MeshStandardMaterial()); grown.position.set(2, 0.02, 2); scene.add(grown); st.tick();
  return { st, uA, uA2: k(fa), inB0, inB1: k(fb) > 0 ? 1 : 0, grown: k(grown) > 0 ? 1 : 0, w: st.U.uRlW.value,
    hooked: [fa, fb, grown].every(m => /\|rla$/.test(m.material.customProgramCacheKey())) }; })();
T.ok('wirePage: a room\'s column stays put as rooms arrive (fixed-width table, its width in uRlW)', WP.uA > 0 && WP.uA === WP.uA2 && WP.st.rooms === 2 && WP.w === 8193);
T.neg('wirePage: a room that arrives later tags the meshes in it (re-tag near new rooms)', r => r.inB1 === 1, Object.assign({}, WP, { inB1: WP.inB0 }), WP);
T.ok('wirePage: new geometry is tagged and every lit material hooked once; the sun follows the page', WP.grown === 1 && WP.hooked && WP.st.U.uRlSun.value === 0.25);
/* wirePage with the page's own uniforms (KNLV roomLight): a material whose compiled program carries them is not hooked again
   (no new program); one compiled without them is; one not compiled yet waits until it is */
const WU = (() => { const T3 = H.THREE, scene = new T3.Scene(), props = new Map(), renderer = { properties: { get: m => props.get(m) || {} } };
  const U = RL.uniforms({ tex: null });
  const knlvMat = new T3.MeshStandardMaterial(), plain = new T3.MeshLambertMaterial(), later = new T3.MeshStandardMaterial();
  props.set(knlvMat, { uniforms: { uRlTex: U.uRlTex } }); props.set(plain, { uniforms: {} });
  [knlvMat, plain, later].forEach((m, i) => { const me = new T3.Mesh(new T3.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), m); me.position.set(1 + i, 0.01, 1); scene.add(me); });
  const st = RL.wirePage({ scene, renderer, U, rooms: () => [{ id: 'r', poly: [[0, 0], [4, 0], [4, 4], [0, 4]], y: 0, h: 3 }], every: 0 });
  const k0 = knlvMat.customProgramCacheKey(), pend0 = st.pending.length;
  props.set(later, { uniforms: { uRlTex: U.uRlTex } }); st.tick();
  return { st, k0, pend0, plainKey: plain.customProgramCacheKey(), laterKey: later.customProgramCacheKey(), tex: U.uRlTex.value }; })();
T.neg('wirePage with o.U: a material lit by the page\'s hook keeps its program; one without is hooked; a pending one waits, then is seen',
  r => r.st.shared === 2 && r.st.materials === 1 && /\|rla$/.test(r.plainKey) && !/\|rla$/.test(r.k0) && !/\|rla$/.test(r.laterKey) && r.pend0 === 1 && r.st.pending.length === 0,
  Object.assign({}, WU, { k0: WU.k0 + '|rla' }), WU);
T.ok('wirePage with o.U: the table goes into the page\'s uniforms', !!WU.tex && WU.tex.image.width === 8193);const hi = (() => { const sh = { uniforms: {}, vertexShader: H.THREE.ShaderLib.standard.vertexShader, fragmentShader: H.THREE.ShaderLib.standard.fragmentShader, instancing: true }; RL.hook(sh, RL.uniforms({ tex: null }), false, true); return sh; })();
T.neg('attribute mode leaves an instanced program alone (its attribute slots: Girder\'s flyers failed to link at 16)', sh => !/aRl/.test(sh.vertexShader),
  (() => { const sh = { uniforms: {}, vertexShader: H.THREE.ShaderLib.standard.vertexShader, fragmentShader: H.THREE.ShaderLib.standard.fragmentShader }; RL.hook(sh, RL.uniforms({ tex: null }), false, true); return sh; })(), hi);
/* wirePage, incremental: a geometry that only grew keeps its tags and has its new vertices tagged; one whose old vertices moved is
   tagged again in full (Girder's furniture accumulators grow for seconds after load: re-tagging them whole each tick was the cost) */
const WG = (() => { const T3 = H.THREE, scene = new T3.Scene();
  const mk = (n, dx) => { const P = new Float32Array(n * 3); for (let i = 0; i < n; i++) { P[i * 3] = 1 + (i % 10) * 0.2 + (dx || 0); P[i * 3 + 1] = 0.5; P[i * 3 + 2] = 1 + (Math.floor(i / 10) % 10) * 0.2; }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(P, 3)); return g; };
  const m = new T3.Mesh(mk(100), new T3.MeshStandardMaterial()); scene.add(m);
  const st = RL.wirePage({ scene, rooms: () => [{ id: 'r', poly: [[0, 0], [4, 0], [4, 4], [0, 4]], y: 0, h: 3 }], every: 0 });
  const first = m.geometry.attributes.aRl.array, K = first[0];
  first.fill(7777);   /* mark the saved tags: a copy carries the mark, a re-tag writes the room's K */
  const grown = mk(200); m.geometry = grown; st.tick();
  const g1 = m.geometry.attributes.aRl.array;
  const moved = mk(200, 0.05); m.geometry = moved; st.tick();
  return { first, K, g1, moved: m.geometry.attributes.aRl.array, st }; })();
T.neg('wirePage: a geometry that grew keeps its old tags (copied, not re-tagged) and tags its new vertices',
  a => a.length === 200 && a.slice(0, 100).every(v => v === 7777) && a.slice(100).every(v => v === WG.K), new Uint16Array(200).fill(WG.K), WG.g1);
T.ok('wirePage: a geometry whose old vertices moved is tagged again in full', WG.K > 0 && WG.moved.length === 200 && WG.moved.every(v => v === WG.K));T.done();
