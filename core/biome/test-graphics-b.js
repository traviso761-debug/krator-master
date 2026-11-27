// node core/biome/test-graphics-b.js: the all-biome graphics upgrades B1-B5 (GRAPHICS-TERRAIN-PROPOSAL.md section 12d; STAGE-8
// D1, written before the all-builds rebuild, 2026-11-23), each with a fault that must fail and a fix that must pass (tools/ktest.js).
//   B1 the back-light's leaf-normal gate (30-core-foliage.js; Godot: foliage.gdshader, fol_back_gate)
//   B2 crown self-occlusion and base grounding baked into the colours (20-core-kit.js, BIO.bake)
//   B3 program keys on the hooks' switches, the numbers as uniforms (30-core-foliage.js; = TODO T31's foliage half)
//   B4 the card fringe fill (BIO.libSwap; = TODO T19's core/biome half), INDEX_ITEMS and alpha-to-coverage on by default
//   B5 the audits on the ground as drawn (KDRAWN.h): the attach audit, the cliff check (= TODO T22; the water audit's own case
//      is in core/water/test-audit.js)
'use strict';
require('../shader/06-core-khook.js');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..'), read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));

function page(o) {
  o = o || {};
  const ctx = { console, Math, THREE }; ctx.globalThis = ctx; if (o.document) ctx.document = o.document; vm.createContext(ctx);
  const files = ['core/rand/08-core-rand.js', 'core/space/20-core-space.js'].concat(o.khook ? ['core/shader/06-core-khook.js'] : [], o.drawn ? ['core/drawn/10-core-drawn.js'] : [],
    ['core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/30-core-foliage.js', 'core/biome/40-core-place.js']);
  for (const f of files) vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, scene = new THREE.Scene();
  BIO.init(Object.assign({ THREE, scene, seed: 3, err: () => {} }, o.host || {}));
  return { BIO, scene, ctx };
}
const compile = m => { const L = THREE.ShaderLib.lambert, sh = { uniforms: {}, vertexShader: L.vertexShader, fragmentShader: L.fragmentShader }; m.onBeforeCompile.call(m, sh); return sh; };
const card = () => new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat);
const meshOf = (scene, name) => { let r = null; scene.traverse(m => { if (m.name === name) r = m; }); return r; };
const near = (a, b, e) => Math.abs(a - b) < (e == null ? 1e-4 : e);

// ---------------------------------------------------------------- B1: the back-light's gate
// the gate as the shader writes it, evaluated: the GLSL expression lifted out of the text and run (abs, clamp), at d = dot(N, sun)
const gateOf = (src, re) => { const m = re.exec(src); if (!m) return null;
  const js = m[1].replace(/\babs\(/g, 'Math.abs(').replace(/(\d)\.0\b/g, '$1');
  return new Function('d', 'const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));return ' + js.replace(/\b(_bd|d)\b/g, 'd') + ';'); };
const WEB_GATE = /_bk \*= (clamp\(-_bd \* 0\.65 \+ 0\.35 \* \(1\.0 - abs\(_bd\)\), 0\.0, 1\.0\));/;
const DESIGN = d => Math.min(1, Math.max(0, -d * 0.65 + 0.35 * (1 - Math.abs(d))));
const gateMatches = g => !!g && [-1, -0.6, -0.2, 0, 0.3, 1].every(d => near(g(d), DESIGN(d), 1e-9));
{ const { BIO } = page(), card0 = compile(BIO.leafMat(card(), 'b', { backlit: .5 })), clump = compile(BIO.leafMat(card(), 'c', { backlit: .5, aN: true }));
  T.ok('B1: the back-light carries the leaf-normal gate the design gives (0.65 behind, 0.35 edge-on, 0 facing the sun)', gateMatches(gateOf(card0.fragmentShader, WEB_GATE)));
  T.neg('B1: a back-light with no gate is refused (the shader before B1)', s => gateMatches(gateOf(s, WEB_GATE)),
    card0.fragmentShader.replace(WEB_GATE, ''), card0.fragmentShader);
  T.ok('B1: a card turns its normal to the face drawn; a clump keeps its own (aN)',
    /if \(!gl_FrontFacing\) _bN = -_bN;/.test(card0.fragmentShader) && !/gl_FrontFacing\) _bN/.test(clump.fragmentShader) &&
    /vFlBN = inverseTransformDirection\(transformedNormal, viewMatrix\);/.test(card0.vertexShader) && /vFlBN = aN;/.test(clump.vertexShader));
  const off = compile(BIO.leafMat(card(), 'n', {}));
  T.ok('B1: no back-light, no gate and no varying (the default shader stays frozen: test-foliage.js)', !/vFlBN/.test(off.vertexShader + off.fragmentShader));
  // Godot: the same gate on BACKLIGHT
  const gd = fs.readFileSync(path.join(ROOT, 'godot', 'shaders', 'foliage.gdshader'), 'utf8');
  const GD_GATE = /float fol_back_gate\(float d\)\s*\{\s*return (clamp\(-d \* 0\.65 \+ 0\.35 \* \(1\.0 - abs\(d\)\), 0\.0, 1\.0\));/;
  T.ok('B1: Godot\'s foliage.gdshader gates BACKLIGHT by the same expression', gateMatches(gateOf(gd, GD_GATE)) && /BACKLIGHT = [^;]*fol_back_gate\(/.test(gd)); }

// ---------------------------------------------------------------- B2: the crown and the base, baked into the colours
const crownPage = owned => { const P = page(), B = P.BIO, leaf = B.leafMat(card(), 'leaf', {});
  B.def('clump', B.geo.clump(), leaf);
  const draw = () => { for (const y of [4, 7, 10]) for (const r of [0, 1.5, 3]) B.put('clump', [r, y, 0], null, 1, null); };
  if (owned) B.tree(0, 0, draw); else draw();
  B.bake(); const m = meshOf(P.scene, 'biome:clump'), c = m.instanceColor.array, M = m.instanceMatrix.array, at = [];
  for (let i = 0; i < m.count; i++) at.push({ x: M[i * 16 + 12], y: M[i * 16 + 13], k: c[i * 3] });
  return { B, at, find: (x, y) => at.find(p => near(p.x, x) && near(p.y, y)).k }; };
{ const P = crownPage(true);
  /* the crown's axis is its cards' mean (x 1.5); its widest 1.5 m from it (x 0 and x 3) */
  T.ok('B2: a crown\'s lowest card on its axis takes lo (.62)', near(P.find(1.5, 4), .62, 1e-6), P.find(1.5, 4));
  T.ok('B2: its top cards and its outer shell take 1', near(P.find(1.5, 10), 1, 1e-6) && near(P.find(0, 4), 1, 1e-6) && near(P.find(3, 4), 1, 1e-6) && near(P.find(3, 10), 1, 1e-6));
  const mid = P.find(1.5, 7);
  T.ok('B2: in between, exposure 1 - (1 - h)(1 - r) (the card on the axis half way up: .81)', near(mid, .81, 1e-6), mid);
  T.ok('B2: the bake reports it', P.B.lastBake.crownAO === 9);
  T.neg('B2: cards no tree owns are not a crown (left as they were)', at => at.some(p => p.k < .7), crownPage(false).at, P.at); }
{ const P = page(), B = P.BIO, leaf = B.leafMat(card(), 'leaf', {});
  B.def('clump', B.geo.clump(), leaf); B.tree(0, 0, () => { B.put('clump', [0, 4, 0], null, 1, null); B.put('clump', [0, 9, 0], null, 1, null); B.put('clump', [1, 6, 0], null, 1, null); });
  B.bake(); const c = meshOf(P.scene, 'biome:clump').instanceColor.array;
  T.ok('B2: a crown of fewer than minN (4) cards is left alone', Array.from(c).every(v => v === 1)); }
const basePage = (gy, mat) => { const P = page({ host: { terrainH: () => gy } }), B = P.BIO;
  B.bucket('bark', mat ? mat(B) : B.barkMat(null)); B.tri('bark', [0, 0, 0], [1, 0, 0], [0, 3, 0], [1, 1, 1]); B.tri('bark', [5, 6, 0], [6, 6, 0], [5, 9, 0], [1, 1, 1]);
  B.bake(); const g = meshOf(P.scene, 'biome:bark').geometry, pos = g.attributes.position.array, col = g.attributes.color.array, out = [];
  for (let i = 0; i < pos.length / 3; i++) out.push({ y: pos[i * 3 + 1], k: col[i * 3] });
  return { B, out, at: y => out.filter(p => near(p.y, y)).map(p => p.k) }; };
{ const P = basePage(0);
  T.ok('B2: a bark bucket\'s vertices on the ground take lo (.72), those 3 m up and the floating triangle stay 1',
    P.at(0).every(k => near(k, .72, 1e-6)) && P.at(3).every(k => k === 1) && P.at(6).every(k => k === 1) && P.at(9).every(k => k === 1));
  T.ok('B2: the bake reports the vertices it darkened', P.B.lastBake.baseAO === 2);
  T.neg('B2: the base ramp follows the ground (a bucket 10 m over it is not darkened)', o => o.at(0).every(k => k < .8), basePage(-10), P);
  const leafy = basePage(0, B => B.leafMat(null, 'v', {}));
  T.ok('B2: a bucket of another kind (a leaf vine) is not darkened', leafy.out.every(p => p.k === 1)); }

// ---------------------------------------------------------------- B3: one program a hook's switches
const SETS = [{}, { aN: true }, { irid: true }, { swayW: '(-position.y)', axis: 1 }, { backlit: .4 }, { ground: { k: .8 } }, { season: { drop: .5, colour: 0xc8a860 } }, { spin: true }];
{ const { BIO } = page(), mats = [];
  ['kitA', 'kitB', 'kitC'].forEach((k, ki) => { BIO.kit(k); SETS.forEach((o, i) => mats.push(BIO.leafMat(card(), 'm' + i, Object.assign({ swayA: .03 + .02 * ki + .001 * i }, o)))); });
  BIO.kit('');
  const keys = new Set(mats.map(m => m.customProgramCacheKey()));
  T.ok('B3: ' + mats.length + ' leaf materials in three kits, eight hook switch sets: ' + keys.size + ' programs (was one each)', keys.size === SETS.length, keys.size);
  const a = compile(mats[0]), b = compile(mats[SETS.length]);
  T.ok('B3: two kits\' default leaves share one shader text, their sway a uniform of each its own', a.vertexShader === b.vertexShader && a.fragmentShader === b.fragmentShader &&
    near(a.uniforms.uSwayA.value, .03) && near(b.uniforms.uSwayA.value, .05));
  const noClash = key => { const by = new Map(); for (const m of mats) { const s = compile(m), t = s.vertexShader + '\n--\n' + s.fragmentShader, k = key(m);
      if (by.has(k) && by.get(k) !== t) return false; by.set(k, t); } return true; };
  T.neg('B3: materials that share a key share their text (a key that drops the switches shares programs wrongly)', noClash, m => 'biofol', m => m.customProgramCacheKey());
  // a page that wraps the hook (RIFT.iridOnlyN) changes the text without the key: that material keys apart, as before
  BIO.kit('rift'); const plain = BIO.leafMat(card(), 'w', { aN: true }), wrapped = BIO.leafMat(card(), 'w2', { aN: true }); BIO.kit('');
  const f = wrapped.onBeforeCompile; wrapped.onBeforeCompile = sh => { f(sh); sh.vertexShader += '\n// wrapped'; };
  T.neg('B3: a wrapped hook\'s material keys apart from its twin', m => m.customProgramCacheKey() !== plain.customProgramCacheKey(), plain, wrapped);
  T.ok('B3: the wrapped one keys by its kit and name, as before B3', wrapped.customProgramCacheKey().indexOf('biofol|rift|w2') === 0);
  // irid bark: the tints are uniforms
  const i1 = BIO.iridBarkMat(null, 'x', [1, 1, 1], [2, 2, 2]), i2 = BIO.iridBarkMat(null, 'y', [.5, .5, .5], [1.5, 1, 1]), s1 = compile(i1), s2 = compile(i2);
  T.ok('B3: two irid barks share a key and a text, their tints uniforms', i1.customProgramCacheKey() === i2.customProgramCacheKey() && s1.fragmentShader === s2.fragmentShader &&
    s1.uniforms.uIridB.value.x === 2 && s2.uniforms.uIridA.value.x === .5); }
// KHOOK over the accessor: its layers add their keys; a wrap made before KHOOK still keys apart
{ const { BIO, ctx } = page({ khook: true }), K = ctx.KHOOK;
  const m = BIO.leafMat(card(), 'k', {}), base = m.customProgramCacheKey();
  K.add(m, 'snow', sh => { sh.fragmentShader += '\n// snow'; });
  const s = compile(m);
  T.ok('B3: under KHOOK the hook still runs first and the layer\'s key joins the structural one', /uSwayA/.test(s.vertexShader) && /\/\/ snow/.test(s.fragmentShader) && m.customProgramCacheKey() === base + '|snow');
  BIO.kit('rift'); const w = BIO.leafMat(card(), 'w', {}); BIO.kit('');
  const f = w.onBeforeCompile; w.onBeforeCompile = sh => { f(sh); };
  K.add(w, 'snow', sh => {});
  T.ok('B3: a hook wrapped before KHOOK took the material still keys by its kit and name', w.customProgramCacheKey().indexOf('biofol|rift|w') === 0); }

// ---------------------------------------------------------------- B4: the fringe fill, and the defaults
{ const { BIO } = page();
  const px = () => new Uint8ClampedArray([10, 20, 30, 255, 0, 0, 0, 0, 200, 0, 0, 47, 90, 100, 110, 48]);
  const d = px(), r = BIO.fringeFill(d);
  T.ok('B4: texels under alpha 48 take the mean opaque colour, their alpha kept; the opaque ones are untouched',
    r.filled === 2 && r.mean.join() === '50,60,70' && Array.from(d).join() === '10,20,30,255,50,60,70,0,50,60,70,47,90,100,110,48', Array.from(d).join());
  T.neg('B4: the fill is what moves the cut-out texels (cut 0: off)', c => { const q = px(); BIO.fringeFill(q, c); return q[4] === 50 && q[8] === 50; }, 0, 48);
  // through libSwap: the sheet's image lands later (KMAT's onload), the fill runs before a cell's clone takes it
  const src = [10, 20, 30, 255, 0, 0, 0, 0, 200, 0, 0, 10, 90, 100, 110, 255], ctxOpts = [];
  const document = { createElement: () => ({ getContext: (k, o) => { ctxOpts.push(o); return { drawImage() {}, getImageData: (x, y, w, h) => ({ data: Uint8ClampedArray.from(src), width: w, height: h }) }; } }) };
  const P = page({ document }), B = P.BIO, sheet = new THREE.Texture();
  P.ctx.KMAT = { mode: 'lib', packed: (kit, slot) => slot === 'leaf' ? { lib: 'card.x', plants: 1 } : slot === 'cell' ? { lib: 'card.x', plants: 9, cell: [0, 0, .5, .5] } : null, textures: () => ({ map: sheet }) };
  const MAT = { leaf: new THREE.MeshLambertMaterial({ map: card() }), cell: new THREE.MeshLambertMaterial({ map: card() }) };
  B.libSwap('k', MAT);
  const img = { src: 'data:image/webp;base64,AAAA', naturalWidth: 2, naturalHeight: 2, width: 2, height: 2 };
  sheet.image = img; (sheet._onImage || []).forEach(f => f(img));   /* KMAT's onload */
  const im = MAT.leaf.map.image, ci = MAT.cell.map.image;
  T.ok('B4: libSwap fills the sheet when it lands: ImageData-like, the src kept (BIO.export names the map by it)',
    im !== img && im.data && im.src === img.src && im.data[4] === 50 && im.data[5] === 60 && im.data[8] === 50 && im.data[11] === 10);
  T.ok('B4: a cell\'s clone takes the filled image, read through a willReadFrequently canvas, once a sheet', ci === im && MAT.cell.map !== sheet && ctxOpts.length === 1 && ctxOpts[0].willReadFrequently === true); }
{ const r = { capabilities: { isWebGL2: true }, getContext: () => ({ SAMPLES: 32937, getParameter: () => 4 }) };
  const run = pre => { const P = page({ host: { renderer: r } }), B = P.BIO, m = B.leafMat(card(), 'l', {}); B.def('c', B.geo.clump(), m); B.put('c', [0, 0, 0], null, 1, null);
    if (pre) pre(B); B.bake(); return { B, m }; };
  const on = run();
  T.ok('B4: INDEX_ITEMS is on by default', on.B.INDEX_ITEMS === true && !!on.B.defs.c.geo.index);
  T.ok('B4: a page that never asked gets alpha-to-coverage at bake (MSAA on WebGL2)', on.m.alphaToCoverage === true && on.B.lastBake.a2cAuto === true);
  T.neg('B4: a page\'s own choice wins (setA2C(renderer, false) before the bake)', x => x.m.alphaToCoverage === true, run(B => B.setA2C(r, false)), on); }

// ---------------------------------------------------------------- B5: the audits on the ground as drawn
const drawnPage = (withGrid, h) => { const P = page({ drawn: true, host: { terrainH: () => 0, origin: [0, 0] } }), B = P.BIO, K = P.ctx.KDRAWN;
  if (withGrid) { const nx = 10, nz = 10, H = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) H.push(h(-50 + i * 10, -50 + j * 10)); K.add(K.grid({ x0: -50, z0: -50, dx: 10, dz: 10, nx, nz, h: H })); }
  return P; };
{ const flat = () => 2.5;
  const audit = P => { const B = P.BIO; B.def('clump', B.geo.clump(), B.leafMat(card(), 'l', {})); B.put('clump', [0, 3, 0], null, 1, null); B.bake(); return B.attachAudit({ ground: () => 0 }); };
  const on = audit(drawnPage(true, flat));
  T.ok('B5: the attach audit reads the drawn ground when one is registered (and says so)', on.drawn === true && on.audited === 0);
  T.neg('B5: a card 3 m over terrainH but .5 m over the drawn ground does not float', a => a.floating === 0, audit(drawnPage(false)), on);
  const P = drawnPage(true, flat);
  T.ok('B5: drawnH reads the grid, and terrainH off it', P.BIO.drawnH(0, 0) === 2.5 && P.BIO.drawnH(500, 0) === 0); }
{ const step = (x, z) => x >= 0 ? 20 : 0;   /* a 20 m step drawn across one 10 m cell: slope 2, a full face */
  const check = P => P.BIO.cliffCheck({ R: 40, step: 2 });
  const on = check(drawnPage(true, step));
  T.neg('B5: the cliff check sees a face the definition calls flat once the drawn ground is registered', c => !!c.control && c.drawn === true, check(drawnPage(false)), on);
  const P = drawnPage(true, step);
  T.ok('B5: placement still reads the ground as defined (the gate does not move a plant)', P.BIO.cliffW(-5, 0) === 1 && P.BIO.cliff(-5, 0) === 0 && P.BIO.cliff(-5, 0, true) > 0); }

// ---------------------------------------------------------------- M4: grounding on instances (and B2 on solid buckets)
const rockPage = (y, mat) => { const P = page({ host: { terrainH: () => 2 } }), B = P.BIO, m = mat ? mat(B) : B.solidMat(null);
  B.def('rock', new THREE.BoxGeometry(1, 1, 1), m);   /* centred: its lowest point .5 under its origin */
  for (let i = 0; i < 40; i++) B.put('rock', [i * 3, y, 0], null, 1, null);
  B.bake(); return { B, m, mesh: meshOf(P.scene, 'biome:rock') }; };
{ const on = rockPage(2.5), up = rockPage(7.5);
  T.neg('M4: an instanced rock whose lowest point sits on the ground is grounded (its instances carry the ground under them)', r => !!r.mesh.geometry.attributes.aGrY && r.B.lastBake.grounded === 1, up, on);
  const a = on.mesh.geometry.attributes.aGrY.array;
  T.ok('M4: aGrY is 10000 + the drawn ground (0, the default, means none)', Array.from(a).every(v => v === 10002));
  const L = THREE.ShaderLib.lambert, sh = { uniforms: {}, vertexShader: L.vertexShader, fragmentShader: L.fragmentShader }; on.m.onBeforeCompile.call(on.m, sh);
  T.ok('M4: the material darkens by world height over it (.72 at the ground to 1 at .35 m), keyed apart', /vGr = aGrY < 0\.5 \? 1000\.0/.test(sh.vertexShader) &&
    /mix\(0\.720, 1\.0, smoothstep\(0\.0, 0\.350, vGr\)\)/.test(sh.fragmentShader) && /\|gr$/.test(on.m.customProgramCacheKey()));
  const leafy = rockPage(2.5, B => B.leafMat(null, 'l', {}));
  T.ok('M4: a leaf card is not grounded this way (the floor cover has its ground tint)', !leafy.mesh.geometry.attributes.aGrY); }
{ const P = page({ host: { terrainH: () => 0 } }), B = P.BIO; B.bucket('rock', B.solidMat(null)); B.tri('rock', [0, 0, 0], [1, 0, 0], [0, 3, 0], [1, 1, 1]); B.bake();
  const g = meshOf(P.scene, 'biome:rock').geometry, c = g.attributes.color.array, p = g.attributes.position.array; let foot = 1;
  for (let i = 0; i < p.length / 3; i++) if (p[i * 3 + 1] === 0) foot = Math.min(foot, c[i * 3]);
  T.ok('B2: a solid (rock) bucket darkens at its foot too (solidMat carries the bioSolid flag)', Math.abs(foot - .72) < 1e-6, foot); }
T.done();
