// node core/biome/test-sward.js: B6, the grass sward (30-core-foliage.js BIO.sward; the web twin of godot/krator/world_grass.gd),
// each check with a fault that must fail and a fix that must pass (tools/ktest.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));

function page(o) {
  o = o || {};
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js'].concat(o.drawn ? ['core/drawn/10-core-drawn.js'] : [],
    ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/40-core-place.js']))
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, 1.5, .1, 2000);
  cam.position.set(0, 1.7, 0);
  BIO.init(Object.assign({ THREE, scene, seed: 5, camera: o.noCamera ? null : cam, err: () => {} }, o.host || {}));
  return { BIO, scene, cam, ctx };
}
const card = (r, g, b) => { const d = new Uint8Array(16); for (let i = 0; i < 4; i++) { d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255; } return new THREE.DataTexture(d, 2, 2, THREE.RGBAFormat); };
// a meadow: a grass item put on a 24 m square round the origin; `grass` false: the same cards named as a fern
function meadow(o) {
  o = o || {}; const P = page(o), B = P.BIO, name = o.grass === false ? 'fern' : 'tallgrass';
  B.def(name, B.geo.clump(), B.leafMat(card(120, 160, 80), name, {}));
  if (o.rock) B.def('boulder', new THREE.BoxGeometry(1, 1, 1), B.solidMat(null));
  if (o.pre) o.pre(B);
  const N = o.wide ? 40 : 8, D = o.wide ? 3.2 : 3.4, X0 = -(N - 1) * D / 2;   /* wide: a 125 m meadow, out past the mid ring's inner edge */
  for (let i = 0; i < N * N; i++) B.put(name, [X0 + (i % N) * D, 0, X0 + Math.floor(i / N) * D], null, 1, 0x669933);
  B.bake(); return P;
}

// ---------------------------------------------------------------- the geometry
{ const { BIO } = page(), near = BIO.swardClump(12, 3, .46, .035, .24), mid = BIO.swardClump(6, 2, .54, .052, .34), pl = BIO.swardPlume(.72, .62);
  const uv = near.attributes.uv.array, ys = [];
  for (let i = 1; i < uv.length; i += 2) ys.push(uv[i]);
  T.ok('B6: a near clump is 12 blades of three segments (60 triangles), a mid clump 6 of two (18), a plume a stalk and eight spikelets (9)',
    near.userData.tris === 60 && mid.userData.tris === 18 && pl.userData.tris === 9, [near.userData.tris, mid.userData.tris, pl.userData.tris]);
  T.ok('B6: uv.y runs 0 at the root to 1 at the tip; the roots start 2.5 cm under the ground', Math.min(...ys) === 0 && Math.max(...ys) === 1 &&
    Math.abs(Math.min(...Array.from(near.attributes.position.array).filter((v, i) => i % 3 === 1)) + .025) < 1e-6);
  const n = near.attributes.normal.array; let up = true; for (let i = 1; i < n.length; i += 3) if (n[i] < 0) up = false;
  T.ok('B6: every blade normal faces up (the sward shades as a lit mass)', up); }

// ---------------------------------------------------------------- where it grows: the page's own grass
{ const G = meadow(), F = meadow({ grass: false }), B = G.BIO;
  T.ok('B6: the bake counts the grass items into the grid (64 cards)', B.SWARD.gridN === 64 && B.swardDensity(0, 0) > .5 && B.swardDensity(200, 0) === 0, [B.SWARD.gridN, B.swardDensity(0, 0)]);
  T.neg('B6: a page that grows grass starts the sward at bake; one with no grass (a desert, the ice) does not', P => P.BIO.lastBake.sward === true && P.BIO.SWARD.meshes.length === 3, F, G);
  T.neg('B6: BIO.sward(false) before the bake opts a page out', P => P.BIO.lastBake.sward === true, meadow({ pre: B => B.sward(false) }), meadow());
  T.ok('B6: no camera, no sward (it says nothing and draws nothing)', meadow({ noCamera: true }).BIO.lastBake.sward === false); }

// ---------------------------------------------------------------- the tiles: seeded by cell, masked, on the ground
{ const P = meadow(), B = P.BIO, L = B.SWARD.layers[0];
  const a = B.swardTile(L, 0, 0); B.swardTile(L, -1, -1); B.swardTile(L, 1, 0); const b = B.swardTile(L, 0, 0);
  T.ok('B6: a tile is the same whatever was made before it (KRAND by cell, not by draw count)', a.n > 0 && a.n === b.n && a.m.every((v, i) => v === b.m[i]) && a.a.every((v, i) => v === b.a[i]), a.n);
  let onGround = true; for (let i = 0; i < a.n; i++) if (Math.abs(a.m[i * 16 + 13] + .02) > 1e-6) onGround = false;
  T.ok('B6: every clump sits 2 cm into the ground (terrainH 0 here)', onGround);
  let unit = true; for (let i = 0; i < a.n; i++) { const m = a.m.subarray(i * 16, i * 16 + 16), det = new THREE.Matrix4().fromArray(m).determinant(); if (!(det > 0)) unit = false; }
  T.ok('B6: every instance matrix is a right-handed rotation and scale (determinant > 0)', unit); }
{ const half = o => meadow({ host: o }), tile = P => { const L = P.BIO.SWARD.layers[0]; let n = 0, bad = 0;
    for (let tx = -2; tx < 2; tx++) for (let tz = -2; tz < 2; tz++) { const t = P.BIO.swardTile(L, tx, tz); n += t.n; for (let i = 0; i < t.n; i++) if (t.m[i * 16 + 12] < 0) bad++; } return { n, bad }; };
  const free = tile(half({})), masked = tile(half({ mask: (x, z) => x < 0 ? 0 : 1 })), wet = tile(half({ waterH: (x, z) => x < 0 ? 1 : -1 }));
  T.neg('B6: the host mask keeps the sward off (footprints, courts): none west of x 0', r => r.n > 0 && r.bad === 0, free, masked);
  T.neg('B6: none under the local water', r => r.n > 0 && r.bad === 0, free, wet);
  const wall = tile(half({ slope: (x, z) => x < 0 ? 3 : 0 }));
  T.ok('B6: none on a cliff (the cliff gate: a slope of 3 west of x 0)', wall.n > 0 && wall.bad === 0, wall); }
{ const P = meadow({ drawn: true }), B = P.BIO, K = P.ctx.KDRAWN;
  const H = []; for (let j = 0; j <= 8; j++) for (let i = 0; i <= 8; i++) H.push(3); K.add(K.grid({ x0: -40, z0: -40, dx: 10, dz: 10, nx: 8, nz: 8, h: H }));
  const t = B.swardTile(B.SWARD.layers[0], 0, 0); let ok3 = t.n > 0; for (let i = 0; i < t.n; i++) if (Math.abs(t.m[i * 16 + 13] - 2.98) > 1e-6) ok3 = false;
  T.ok('B6: on the ground AS DRAWN when the page registers it (KDRAWN 3 m over terrainH 0)', ok3); }

// ---------------------------------------------------------------- the update: rings round the camera, the budget, the gates
{ const P = meadow({ wide: true }), B = P.BIO, st = B._swardUpdate(P.cam, Infinity), L = B.SWARD.layers;
  T.ok('B6: round the camera the near, mid and plume rings fill', st.near > 0 && st.mid > 0 && st.plume > 0, st);
  let inR = true; const nm = L[0].mesh.instanceMatrix.array; for (let i = 0; i < L[0].mesh.count; i++) if (Math.hypot(nm[i * 16 + 12], nm[i * 16 + 14]) > 34 + 8 * Math.SQRT2) inR = false;
  T.ok('B6: the near ring holds only tiles within 34 m (and a tile\'s corner)', inR);
  T.ok('B6: within the budget (750 000 triangles, by layer share)', st.tris <= 750000 && L.every(l => l.mesh.count <= l.cap), st.tris);
  P.cam.position.set(0, 120, 0); const hi = B._swardUpdate(P.cam, Infinity);
  T.neg('B6: off when the camera flies 88 m over the ground', s => s.mesh.count === 0, { mesh: { count: st.near } }, { mesh: L[0].mesh });
  P.cam.position.set(0, 1.7, 0); B._swardUpdate(P.cam, Infinity);
  T.ok('B6: back on when it comes down', L[0].mesh.count > 0); void hi;
  const small = meadow({ wide: true }), S = small.BIO; S.sward({ camera: small.cam, maxTris: 30000 }); const s2 = S._swardUpdate(small.cam, Infinity);
  T.ok('B6: maxTris caps it (30 000)', s2.tris <= 30000 && s2.near > 0, s2); }
{ const P = meadow(), B = P.BIO, p = B.swardPalette(), ic = new THREE.Color(0x669933).convertSRGBToLinear(), want = [ic.r, ic.g, ic.b];
  const tm = [Math.pow(120 / 255, 2.2), Math.pow(160 / 255, 2.2), Math.pow(80 / 255, 2.2)];
  T.ok('B6: the tips take the page\'s grass colour (its cards\' instance colour times their card)', p && p.every((v, i) => Math.abs(v / (want[i] * tm[i]) - 1) < .01), p); }

// ---------------------------------------------------------------- the shader
{ const P = meadow(), m = P.BIO.SWARD.layers[0].mat, L = THREE.ShaderLib.lambert, sh = { uniforms: {}, vertexShader: L.vertexShader, fragmentShader: L.fragmentShader };
  m.onBeforeCompile(sh);
  T.ok('B6: the hook replaces the projection (rings faded, wind sway, root-to-tip colour) and tints the fragment',
    !/#include <project_vertex>/.test(sh.vertexShader) && /_swK/.test(sh.vertexShader) && /vSwC = mix/.test(sh.vertexShader) && /diffuseColor\.rgb \*= vSwC/.test(sh.fragmentShader) &&
    sh.uniforms.uWindT === P.BIO.WIND.t && !!sh.uniforms.uSwR);
  T.ok('B6: one program a page (the key names only the ground texture switch)', P.BIO.SWARD.layers.every(l => l.mat.customProgramCacheKey() === 'biosward'));
  T.ok('B6: the sward is left out of the probe and the audits (userData.probeSkip)', P.BIO.SWARD.meshes.every(m => m.userData.probeSkip && !m.castShadow)); }

T.done();
