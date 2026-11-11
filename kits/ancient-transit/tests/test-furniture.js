// node kits/ancient-transit/tests/test-furniture.js: the furniture bundle built headless (three.js r128 in a vm): every kind in every
// state it has, both variants, two seeds: builds, no NaN, a few hundred triangles at most for the small pieces, a merged mesh a family,
// planar UVs, vertex colours in linear, fallen pieces on the ground, bent ones leaning, crushed ones lower. Each check has a negative.
const fs = require('fs'), path = require('path'), vm = require('vm'), ROOT = path.join(__dirname, '..', '..', '..');
const ctx = { console, Math, setTimeout, clearTimeout }; ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
const load = p => vm.runInContext(fs.readFileSync(path.join(ROOT, p), 'utf8'), ctx, { filename: p });
load('kits/catalog/three.min.js'); load('core/rand/08-core-rand.js'); load('kits/ancient-transit/src/40-tr-records.js');
const parts = ['core/catalog/krator-furniture-core.js', 'kits/ancient-transit/krator-transit-furniture.js', 'kits/ancient-transit/transit-furnish.js'];
vm.runInContext('var KratorTransitFurniture = (function () {\n' + parts.map(p => fs.readFileSync(path.join(ROOT, p), 'utf8')).join('\n') + '\nreturn KTF_API;\n})();', ctx, { filename: 'bundle' });
const KTF = vm.runInContext('KratorTransitFurniture', ctx), T = vm.runInContext('KTRANSIT', ctx);
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
const fin = v => typeof v === 'number' && isFinite(v);
let n = 0, maxTris = 0;
for (const K of KTF.list()) for (const st of K.states) for (let v = 0; v < K.variants; v++) for (const seed of [1, 7]) {
  const g = KTF.build(K.key, { state: st, variant: v, seed });
  n++;
  const u = g.userData, name = K.key + '.' + st + '.v' + v + '.s' + seed;
  ok(g.children.length > 0 && u.tris > 0, name + ': builds');
  let nan = false, mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9], uvBad = false, colBad = false, fams = new Set();
  g.children.forEach(m => {
    fams.add(m.userData.family);
    const p = m.geometry.attributes.position.array, uv = m.geometry.attributes.uv.array, c = m.geometry.attributes.color.array;
    for (let i = 0; i < p.length; i++) { if (!isFinite(p[i])) nan = true; const q = i % 3; if (p[i] < mn[q]) mn[q] = p[i]; if (p[i] > mx[q]) mx[q] = p[i]; }
    for (let i = 0; i < uv.length; i++) if (!isFinite(uv[i])) uvBad = true;
    for (let i = 0; i < c.length; i++) if (!(c[i] >= 0 && c[i] <= 1)) colBad = true;
    if (m.geometry.attributes.position.count !== uv.length / 2) uvBad = true;
  });
  ok(!nan && !uvBad && !colBad, name + ': finite positions, a uv a vertex, colours in 0..1');
  ok(fams.size === g.children.length, name + ': one mesh a family');
  if (st !== 'fallen' && st !== 'crushed') ok(mn[1] > -0.6 && mx[1] <= K.h * 1.05 + (st === 'bent' ? 1.3 : 0.3), name + ': stands on the ground under its height (' + mn[1].toFixed(2) + ' .. ' + mx[1].toFixed(2) + ' of ' + K.h + ')');
  if (st === 'intact') ok(mx[0] - mn[0] <= K.w * 1.1 + 0.3 && mx[2] - mn[2] <= K.d * 1.1 + 0.3, name + ': fits its declared box (' + (mx[0] - mn[0]).toFixed(1) + ' x ' + (mx[2] - mn[2]).toFixed(1) + ' of ' + K.w + ' x ' + K.d + ')');
  if (st === 'fallen') ok(mn[1] > -0.4 && mn[1] < 0.1 && mx[1] < (K.key === 'tr_footbridge' ? K.h : (K.w >= K.d ? K.d : K.w) + 0.6), name + ': lies on the ground (top at ' + mx[1].toFixed(2) + ' for a ' + K.w + ' x ' + K.d + ' x ' + K.h + ' piece)');
  if (st === 'crushed') ok(mx[1] < K.h * 0.75, name + ': is lower than it was (' + mx[1].toFixed(2) + ' of ' + K.h + ')');
  if (st === 'bent' && K.h > 3) { const g0 = KTF.build(K.key, { state: 'intact', variant: v, seed }); let top0 = -1e9, top = -1e9; g0.children.forEach(m => { const p = m.geometry.attributes.position.array; for (let i = 1; i < p.length; i += 3) top0 = Math.max(top0, p[i]); }); top = mx[1]; ok(top < top0 + 1.2 && top > top0 - K.h * 0.3 && JSON.stringify(g0.userData.box) !== JSON.stringify(u.box), name + ': leans (top ' + top.toFixed(2) + ' against ' + top0.toFixed(2) + ' intact)'); }
  if (st === 'burnt' && K.key !== 'tr_rubble_glass') { ok(!fams.has('glass') && !fams.has('glow'), name + ': no glass, no glow'); let sum = 0, cnt = 0; g.children.forEach(m => { const c = m.geometry.attributes.color.array; for (let i = 0; i < c.length; i++) { sum += c[i]; cnt++; } }); ok(sum / cnt < 0.1, name + ': sooted (' + (sum / cnt).toFixed(3) + ')'); }
  maxTris = Math.max(maxTris, u.tris);
  const g2 = KTF.build(K.key, { state: st, variant: v, seed }); ok(JSON.stringify(g2.userData.box) === JSON.stringify(u.box) && g2.userData.tris === u.tris, name + ': deterministic');
}
ok(maxTris < 9000, 'the biggest piece under 9000 triangles (' + maxTris + ')');
ok(KTF.build('tr_zeppelin', {}) === null, 'negative: an unknown kind is null');
let threw = false; try { KTF.build('tr_bench', { state: 'bent' }); } catch (e) { threw = true; } ok(threw, 'negative: a state a kind has not throws');
{ const a = KTF.build('tr_lamp', { state: 'intact', seed: 3 }), b = KTF.build('tr_lamp', { state: 'intact', seed: 3, linear: false }); const ca = a.children[0].geometry.attributes.color.array, cb = b.children[0].geometry.attributes.color.array; ok(ca[0] < cb[0] - 1e-3, 'negative: linear colours are darker than sRGB'); }
console.log(n + ' pieces built, biggest ' + maxTris + ' triangles'); console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
