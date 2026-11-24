/* settlements/hook/tests/test-hook-places.js: the environs' hamlets and camps (src/77m-hook-places.js, S5 of the owner's
   site plan), in node (no page, no GPU).

   The page's chain as test-hook-ruin.js loads it, then core/space, core/city's closure and the kits' boxes (build.py
   kcity_bundle and dims_fragment, run through python as the build runs them), core/hamlet (10-30 and the work camp) and
   the places' fragment. Checks, each placement check with a negative:
     - eleven of the thirteen places laid (the Drowned Spire's pods and the deck camp are not), each with its buildings
     - every building on the places' own good ground (dry, not steep, out of the town, off the ruin), a landing at the
       water's edge off the ruin
     - no two buildings overlap (their boxes turned by their facing)
     - each culture on its kit's pieces: the Hukoa on the Islanders' (ie-, ip-), the settlers on the Iziz Vernacular's
       (vern_), the salvagers on the post-apoc kit's
     - the same records on a second run

   node settlements/hook/tests/test-hook-places.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const HOOK = path.join(__dirname, '..'), ROOT = path.join(HOOK, '..', '..');
const rd = p => fs.readFileSync(p, 'utf8');
function py(code, args) {
  for (const exe of ['python3', 'python']) {
    try { return cp.execFileSync(exe, ['-c', code].concat(args || []), { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'], cwd: HOOK }); } catch (e) { /* the next name */ }
  }
  throw new Error('no python to run ' + code.slice(0, 60));
}
const FRAG = py(['import importlib.util, sys',
  "s = importlib.util.spec_from_file_location('wd', sys.argv[1]); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)",
  "sys.stdout.write(m.fragment(sys.argv[2], 'var WORLD_KITS=[];\\n', 'test', 'test'))"].join('\n'),
  [path.join(ROOT, 'core', 'world', 'world_data.py'), path.join(HOOK, 'world')]);
/* build.py as a module (its main is not run on import): the core/city closure and the kits' boxes the page carries */
const BUILD = JSON.parse(py(['import importlib.util, json, sys', "sys.argv = ['build.py']",
  "s = importlib.util.spec_from_file_location('hb', 'build.py'); m = importlib.util.module_from_spec(s); s.loader.exec_module(m)",
  "sys.stdout.write(json.dumps({'kcity': m.kcity_bundle(), 'dims': m.dims_fragment()}))"].join('\n')).replace(/^[^{]*/, ''));
const SITE = JSON.parse(rd(path.join(HOOK, 'site', 'hook-site.json')));
const ctxBase = () => vm.createContext({ atob: s => Buffer.from(s, 'base64').toString('binary'), console, Math, Float32Array, Uint8Array, Int32Array,
  Uint16Array, Int8Array, Float64Array, Uint32Array, Array, Object, JSON, Number, String, Error, Map, Set, Infinity, NaN, isFinite, parseInt, parseFloat });
function load() {
  const H = f => rd(path.join(ROOT, f));
  const src = [H('core/rand/08-core-rand.js'), H('core/terrain/38-core-relief.js'), FRAG, H('core/world/41-world-fields.js'), H('core/world/41l-world-landforms.js'),
    'var PORT = {};', rd(path.join(HOOK, 'src', '75d-hook-world.js')), H('core/space/20-core-space.js'), H('core/tags/50-core-tags.js'), H('core/tags/52-core-tags-vocab.js'),
    'var HOOK_SITE = ' + JSON.stringify(SITE) + ';', BUILD.kcity, rd(path.join(HOOK, 'src', '77-hook-ruin.js')), BUILD.dims]
    .concat(['10-hamlet-wood', '12-hamlet-gather', '14-hamlet-farmland', '16-hamlet-names', '18-hamlet-names', '20-hamlet-cultures', '21-hamlet-iziz', '30-hamlet-village']
      .map(f => H('core/hamlet/' + f + '.js')))
    .concat([H('core/hamlet/camp/26-hamlet-camp.js'), rd(path.join(HOOK, 'src', '77m-hook-places.js')),
      'globalThis.__P = HOOK_PLACES; globalThis.__R = HOOK_RUIN; globalThis.__KL = KCITY.lib;']).join('\n;\n');
  const ctx = ctxBase(); ctx.globalThis = ctx; ctx.window = ctx;
  vm.runInContext(src, ctx, { filename: 'hook-places' });
  return { P: ctx.__P, R: ctx.__R, KL: ctx.__KL };
}
const { P, R, KL } = load();
console.log('places: ' + JSON.stringify(P.report));
const L = P.lots, ZONE = SITE.districts.find(d => d.type === 'zone').poly;

/* ---- laid */
const laid = Object.keys(P.villages).filter(k => (P.villages[k].records || []).some(Boolean));
T.ok('the thirteen places laid, each with its buildings (the Drowned Spire\'s pods and the deck camp\'s shacks among them)',
  laid.length === 13 && !P.skipped.length && L.length >= 150 && L.filter(l => l.role === 'pod').length >= 18 && L.some(l => /c3:/.test(l.id)),
  laid.length + ' laid, ' + L.length + ' buildings; skipped ' + JSON.stringify(P.skipped.map(s => s.id)));

/* ---- on good ground */
const goodGround = P.ground['ok'];   /* the places' own rule (not a check: ktest counts its call sites) */
const onGround = ls => ls.every(l => l.aloft || (l.landing ? true : goodGround(l.x, l.z)) && !P.ruinAt(l.x, l.z) && !R.townAt(l.x, l.z));
T.ok('every building on good ground (dry, not steep, out of the town, off the ruin; a landing off the ruin)', onGround(L), '');
const tw = R.towers.find(t => t.state !== 'fallen' && t.ground === 'mainland');
T.neg('a building moved onto a standing tower fails it', onGround, L.map((l, k) => k === 3 ? Object.assign({}, l, { x: tw.x, z: tw.z }) : l), L);

/* ---- apart */
const box = l => ({ c: [l.x, l.z], u: [Math.cos(l.ry), -Math.sin(l.ry)], v: [Math.sin(l.ry), Math.cos(l.ry)], hw: l.w / 2, hd: l.d / 2, r: Math.hypot(l.w, l.d) / 2 });
const proj = (b, ax) => { const cx = b.c[0] * ax[0] + b.c[1] * ax[1], e = Math.abs((b.u[0] * ax[0] + b.u[1] * ax[1]) * b.hw) + Math.abs((b.v[0] * ax[0] + b.v[1] * ax[1]) * b.hd); return [cx - e, cx + e]; };
const sep = (a, b) => { for (const ax of [a.u, a.v, b.u, b.v]) { const p = proj(a, ax), q = proj(b, ax); if (p[1] < q[0] + .1 || q[1] < p[0] + .1) return true; } return false; };
const apart = ls0 => { const ls = ls0.filter(l => !l.aloft), B = ls.map(box); for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
  if (Math.hypot(B[i].c[0] - B[j].c[0], B[i].c[1] - B[j].c[1]) > B[i].r + B[j].r) continue; if (!sep(B[i], B[j])) return false; } return true; };
T.ok('no two buildings overlap (their boxes turned by their facing)', apart(L), '');
T.neg('a building laid over its neighbour fails it', apart, L.map((l, k) => k === 5 ? Object.assign({}, l, { x: L[4].x + 1, z: L[4].z + 1 }) : l), L);

/* ---- the roads: every place core/hamlet lays linked to the net; no link on the water, in the town or on a ruin (among its
   own hamlet's buildings it may run, as its lane does) */
const roadsOk = rs => rs.every(r => { if (r.kind !== 'link') return true; for (let i = 1; i < r.pts.length; i++) { const a = r.pts[i - 1], b = r.pts[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 10));
  for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, z = a[1] + (b[1] - a[1]) * k / n; if (!P.roadOk(x, z, r.place)) return false; } } return true; });
const links = P.roads.filter(r => r.kind === 'link');
T.ok('every place core/hamlet lays is linked to the road net (the salt pans by boat, from their quay), and no link runs on the water, in the town or on a ruin',
  !P.unlinked.length && links.length >= 10 && roadsOk(P.roads), links.length + ' links, ' + P.roads.length + ' roads; unlinked ' + JSON.stringify(P.unlinked));
T.neg('a link bent through a standing tower fails it', roadsOk, P.roads.map(r => r === links[0] ? Object.assign({}, r, { pts: [r.pts[0], [tw.x, tw.z], r.pts[r.pts.length - 1]] }) : r), P.roads);

/* ---- each culture on its kit */
const KIT = { islander: /^(ie-|ip-)/, iziz: /^vern_/, 'ancients-salvage': /^(dw-|lg-|longhouse|mess|chief|shaman|shop-|smithy|warehouse|watchtower|gen-)/ };
const kitsRight = ls => ls.every(l => !KIT[l.culture] || KIT[l.culture].test(l.key));
T.ok('each culture on its kit\'s pieces (Hukoa: the Islanders; settlers: the Iziz Vernacular; salvagers: the post-apoc kit)', kitsRight(L),
  JSON.stringify(Object.fromEntries(Object.keys(KIT).map(c => [c, L.filter(l => l.culture === c).length]))));
T.neg('a Hukoa hamlet built of the settlers\' houses fails it', kitsRight, L.map(l => l.culture === 'islander' && /^ie-house/.test(l.key) ? Object.assign({}, l, { key: 'vern_house_poor_a' }) : l), L);

/* ---- the same on a second run */
const dig = ls => JSON.stringify(ls.map(l => [l.id, l.key, +l.x.toFixed(3), +l.z.toFixed(3), +l.ry.toFixed(4)]));
T.ok('the same records on a second run', dig(load().P.lots) === dig(L), '');
T.done();
