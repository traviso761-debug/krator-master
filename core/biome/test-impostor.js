// node core/biome/test-impostor.js: the octahedral impostors (34-core-impostor.js), each check with a negative. The GPU
// part (the views drawn, the shader) is checked on a page (biomes/swbay, verify.py); here the map, the bases, the capture's
// bookkeeping (one tree built, rendered grid x grid twice, its stores emptied, its charges and the page's state restored)
// and the item it defines, with a renderer that records its calls.
require('../shader/06-core-khook.js');require('../shader/06b-core-kcolor.js');
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/34-core-impostor.js'])
  vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
const BIO = ctx.BIO, errs = [], ticks = [];
BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), ticks: f => ticks.push(f) });
const I = BIO.IMP;

// ---------------------------------------------------------------- the map and the bases
let worst = 0;
for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const d = I.dec(i / 8, j / 8), e = I.enc(d); worst = Math.max(worst, Math.abs(e[0] - i / 8), Math.abs(e[1] - j / 8)); }
ok(worst < 1e-9, 'dec then enc returns every grid point (' + worst.toExponential(1) + ')');
const top = I.dec(.5, .5); ok(Math.abs(top[1] - 1) < 1e-12, 'the grid\'s centre is straight down from above');
ok(I.dec(0, .5)[1] < 1e-9 && I.dec(1, .5)[1] < 1e-9, 'the grid\'s edges are on the horizon (the negative: not above it)');
{ let orth = 0; for (const d of [top, I.dec(.2, .7), I.dec(1, .5), I.dec(.5, 0)]) { const b = I.basis(d), dot = (a, c) => a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
    orth = Math.max(orth, Math.abs(dot(b.r, d)), Math.abs(dot(b.u, d)), Math.abs(dot(b.r, b.u)), Math.abs(dot(b.r, b.r) - 1), Math.abs(dot(b.u, b.u) - 1)); }
  ok(orth < 1e-9, 'each view\'s right and up are unit and square to it, the top view too'); }
ok(/impDec/.test(I.GLSL.vertex) && /impBasis/.test(I.GLSL.vertex) && /discard/.test(I.GLSL.fragment), 'the shader carries the same map and bases');

// ---------------------------------------------------------------- a kit with a tree, baked, then the capture
const leaf = new THREE.MeshLambertMaterial(), bark = new THREE.MeshLambertMaterial({ vertexColors: true });
BIO.kit('k');
BIO.def('leaf', new THREE.PlaneGeometry(2, 2), leaf, { label: 'Leaves', attrs: ['aN'] });
BIO.bucket('bark', bark);
function tree(x, z) { BIO.tube('bark', [{ x, y: 0, z, r: .5 }, { x, y: 12, z, r: .2 }], 0x664422, { seg: 6 });
  for (let k = 0; k < 8; k++) BIO.put('leaf', [x + Math.cos(k) * 3, 10 + k * .3, z + Math.sin(k) * 3], null, 1, 0x88aa66, { n: [0, 1, 0] }); }
let built = 0; const OBS = [{ x: 0, z: 0, r: 50 }]; BIO.host.obstacles = OBS; let sawObs = null;
const imp = BIO.impostor('gum', () => { built++; sawObs = BIO.host.obstacles.length; tree(0, 0); }, { grid: 6, cell: 16 });
BIO.impostorItem('gumFar', imp);
const S = BIO.impostorSet('mixed', { grid: 4, cell: 8 }), a1 = BIO.impostor('a', () => tree(0, 0), { set: S }), a2 = BIO.impostor('b', () => { tree(0, 0); tree(5, 0); }, { set: S, at: [5, 0, 0] });
BIO.impostorItem('mixFar', S);
tree(100, 0); BIO.impostorPut('gumFar', imp, [300, 0, 0], 0, 1.5); BIO.impostorPut('mixFar', a1, [400, 0, 0], 1, 1); BIO.impostorPut('mixFar', a2, [500, 0, 0], 2, 1);
BIO.kit('');
ok(BIO.impostor('x', null) === null && errs.length === 1, 'impostor: no build function is an error (the negative)'); errs.length = 0;
const early = BIO.IMP.capture(imp, null);
ok(early === false && /unbaked/.test(errs[0] || ''), 'capture before the bake refuses (the kit still holds its instances)'); errs.length = 0;
const bake = BIO.bake(), stats0 = JSON.stringify(BIO.stats), baked0 = BIO.baked.length, kids0 = BIO.host.scene.children.length;
const calls = { render: 0, read: 0, targets: new Set() };
const renderer = { autoClear: true, getRenderTarget: () => null, getClearColor: c => c.set(0x123456), getClearAlpha: () => 1,
  setClearColor() {}, setRenderTarget(rt) { if (rt) calls.targets.add(rt); }, clear() {}, render(s, c) { calls.render++; },
  readRenderTargetPixels(rt, x, y, w, h, a) { calls.read++; a.fill(200); } };
const n = BIO.bakeImpostors(renderer);
ok(n === 3 && imp.ready && built === 1, 'bakeImpostors bakes each species once (' + n + ')');
ok(calls.render === 2 * 36 + 2 * 2 * 16 && calls.read === 6, 'two passes of grid x grid views per species (' + calls.render + ' renders)');
ok(imp.set.atlas.image.width === 96 && imp.mat.uniforms.uAtlas.value === imp.set.atlas && imp.mat.uniforms.uNorm.value === imp.set.normal, 'a lone species: its own atlases (96 px), the material\'s');
ok(S.K === 2 && S.atlas.image.width === 2 * 4 * 8 && a1.slot === 0 && a2.slot === 1 && a1.mat === a2.mat, 'a set: two species, two slots of one atlas (2 x 32 px a side), one material');
ok(Math.abs(S.mat.uniforms.uRS.value[1].y - (a2.centre[0] - 5)) < 1e-9 && S.mat.uniforms.uRS.value[1].x > S.mat.uniforms.uRS.value[0].x, 'a slot\'s radius and centre are measured from its at (the wider tree is the bigger)');
{ const m = BIO.baked.find(x => x.name === 'biome:mixFar'), A = m.geometry.attributes.aImp.array; ok(m.count === 2 && A[0] === 0 && A[4] === 1, 'one item draws both species, each instance naming its slot'); }
{ const q = BIO.impostorSet('two', { slots: 1 }); BIO.impostor('e', () => {}, { set: q }); const r = BIO.impostor('f', () => {}, { set: q });
  ok(r === null && /full/.test(errs[0] || ''), 'a full set refuses another species (the negative)'); errs.length = 0; BIO.IMP.list.length = 3; }
ok(imp.radius > 3 && Math.abs(imp.centre[1] - 6) < 1.5, 'the tree\'s radius and centre (' + imp.radius.toFixed(2) + ', ' + imp.centre.map(v => v.toFixed(1)) + ')');
const R = BIO.kits.k;
ok(R.items.leaf.count === 0 && R.buckets.bark.pos.length === 0, 'the capture empties the stores it filled');
ok(JSON.stringify(BIO.stats) === stats0 && BIO.baked.length === baked0 && BIO.host.scene.children.length === kids0, 'nothing is charged, baked or added to the scene');
ok(sawObs === 0 && BIO.host.obstacles === OBS, 'the tree is built with no obstacles (its twin would block it) and the page obstacles come back');
ok(renderer.autoClear === true, 'the renderer\'s state is restored');
ok(BIO.bakeImpostors(renderer) === 0 && built === 1, 'a second call bakes nothing more (the negative)');
const far = BIO.baked.find(m => m.name === 'biome:gumFar');
ok(far && far.material === imp.mat && far.count === 1 && imp.mat.userData.bio.kind === 'impostor', 'the far item is an instanced quad on the impostor material');
ok(ticks.length === 1, 'the lights are read each frame by one tick');
{ const sc = BIO.host.scene, sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(0, 10, 0); sc.add(sun); sc.add(sun.target); sc.add(new THREE.AmbientLight(0x404040, 1));
  sc.updateMatrixWorld(true); I.readLights(); const U = imp.mat.uniforms;
  ok(U.uSun.value.y > .99 && U.uSunCol.value.r === 2 && Math.abs(U.uAmb.value.r - 0x40 / 255) < 1e-6, 'the sun\'s direction and colour and the ambient come from the scene'); }
{ const tex = new THREE.Texture(), cardMat = new THREE.MeshLambertMaterial({ map: tex, alphaTest: .4 }); BIO.kit('late');
  BIO.def('card', new THREE.PlaneGeometry(1, 1), cardMat); const r = BIO.impostor('late', () => BIO.put('card', [0, 1, 0], null, 1, null)); BIO.kit('');
  const before = ticks.length, n0 = BIO.bakeImpostors(renderer);
  ok(n0 === 0 && !r.ready && I.pending === 1 && ticks.length === before + 1, 'a species whose map has not decoded waits (a tick retries it)');
  ticks[ticks.length - 1](); ok(!r.ready, 'still no image: still waiting (the negative)');
  tex.image = { width: 4, height: 4, complete: true }; ticks[ticks.length - 1](); ok(r.ready && I.pending === 0, 'the image in: the next frame bakes it'); }
ok(errs.length === 0, 'no errors (' + errs.join('; ') + ')');

console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
