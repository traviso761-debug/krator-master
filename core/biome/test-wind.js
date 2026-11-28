// node core/biome/test-wind.js: the export form's wind fields (20-core-kit.js; GODOT-LOOK-PLAN.md section 13, P4):
// stiffness and phase a vertex on what a kit draws into buckets, behind BIO.setForm({wind}) and off without it.
// A small page is built in node as test-export.js builds one. Each check has a negative.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
function page(form) {
  const ctx = { console, Math, THREE, Buffer, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary') };
  ctx.globalThis = ctx; vm.createContext(ctx);
  for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'core/terrain/30-core-field.js', 'core/materials/record/23-mat-record.js',
    'core/export/07-core-export.js', 'core/export/09-core-export-adapters.js', 'core/shader/06-core-khook.js', 'core/biome/10-core-head.js', 'core/biome/20-core-kit.js', 'core/biome/42-core-export.js'])
    vm.runInContext(read(f) + (f.endsWith('10-core-head.js') ? '\nthis.BIO=BIO;' : '') + (f.endsWith('07-core-export.js') ? '\nthis.EXPORT=EXPORT;' : ''), ctx, { filename: f });
  const BIO = ctx.BIO, errs = [];
  BIO.init({ THREE, scene: new THREE.Scene(), seed: 3, err: m => errs.push(m), register: o => BIO.record(o), tags: 'test', terrainH: () => 0, waterH: () => NaN });
  if (form) BIO.setForm(form);
  BIO.bucket('bark', new THREE.MeshStandardMaterial());
  // a trunk that tapers from 0.4 m to a twig of 2 cm, a second branch elsewhere, and a loose leaf
  BIO.tube('bark', [{ x: 0, y: 0, z: 0, r: 0.4 }, { x: 0, y: 4, z: 0, r: 0.2 }, { x: 0.5, y: 7, z: 0, r: 0.02 }], 0x554433, { seg: 6 });
  BIO.tube('bark', [{ x: 9, y: 3, z: 2, r: 0.05 }, { x: 10, y: 4, z: 2, r: 0.03 }], 0x554433, { seg: 6 });
  BIO.tri('bark', [20, 1, 0], [20.2, 1, 0], [20.1, 1.2, 0], 0x226622);
  BIO.wind = [0.33, 0.77]; BIO.tri('bark', [30, 1, 0], [30.2, 1, 0], [30.1, 1.2, 0], 0x226622); BIO.wind = null;
  BIO.bake();
  const m = BIO.baked.find(o => o.name === 'biome:bark');
  return { BIO, ctx, g: m.geometry, errs };
}
const off = page(null), on = page({ wind: true }), again = page({ wind: true });
T.ok('with no form set a bucket bakes as it did: no aWind', !off.g.attributes.aWind && off.errs.length === 0 && off.BIO.FORM.wind === false);
const W = on.g.attributes.aWind, P = on.g.attributes.position;
T.ok('with wind on every vertex carries three numbers', !!W && W.count === P.count && W.itemSize === 3 && on.errs.length === 0);
const at = (pred) => { const out = []; for (let i = 0; i < P.count; i++) if (pred(P.getX(i), P.getY(i), P.getZ(i))) out.push([W.getX(i), W.getY(i)]); return out; };
const foot = at((x, y) => Math.abs(x) < 1 && y < 0.01), mid = at((x, y) => Math.abs(x) < 1 && Math.abs(y - 4) < 0.3), tip = at((x, y) => x < 2 && y > 6.9);
T.ok('a trunk is rigid at its foot, gives at 20 cm and whips at its tip', foot.length > 0 && foot.every(v => v[0] === 1) && mid.every(v => Math.abs(v[0] - 0.2 / 0.22) < 1e-6) && tip.every(v => Math.abs(v[0] - 0.02 / 0.22) < 1e-6),
  JSON.stringify([foot[0], mid[0], tip[0]]));
const tubeA = at(x => x < 2), tubeB = at(x => x > 8 && x < 12);
T.ok('a branch swings as one: one phase along a tube, another on the next', new Set(tubeA.map(v => v[1])).size === 1 && new Set(tubeB.map(v => v[1])).size === 1 && tubeA[0][1] !== tubeB[0][1] && tubeA[0][1] >= 0 && tubeA[0][1] < 1);
const leaf = at(x => x > 19 && x < 21), set = at(x => x > 29);
T.ok('a loose leaf has no stiffness, and a builder\'s BIO.wind is taken as given', leaf.length === 3 && leaf.every(v => v[0] === 0) && set.every(v => Math.abs(v[0] - 0.33) < 1e-6 && Math.abs(v[1] - 0.77) < 1e-6));
T.ok('the same tree has the same phases every time', JSON.stringify(Array.from(W.array)) === JSON.stringify(Array.from(again.g.attributes.aWind.array)));
T.ok('the wind fields change no position, normal or index', JSON.stringify(Array.from(on.g.attributes.position.array)) === JSON.stringify(Array.from(off.g.attributes.position.array))
  && JSON.stringify(Array.from(on.g.index.array)) === JSON.stringify(Array.from(off.g.index.array)));
const wo = on.BIO.export ? on.BIO.export() : null, bk = wo && (wo.buckets || []).find(b => b.name === 'bark');
T.ok('BIO.export writes them as a bucket\'s geometry.wind', !!bk && !!bk.geometry.wind && bk.geometry.wind.n === W.array.length, bk ? Object.keys(bk.geometry).join(',') : 'no bucket');
const wf = off.BIO.export ? off.BIO.export() : null, bf = wf && (wf.buckets || []).find(b => b.name === 'bark');
T.ok('negative: and writes none when the form is off', !!bf && bf.geometry.wind === undefined);
T.done();
