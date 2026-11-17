#!/usr/bin/env node
/* core/catalog/test-hangings.js: the catalog's wall hangings, headless (no page, no GPU).

     node core/catalog/test-hangings.js            the checks below; exit 1 on a failure
     node core/catalog/test-hangings.js --list     every wall hanging and its hem in each test room

   1. THE HEM (the owner, 2026-11-16: "make sure wall hangings dont wind up near ground, this has been a recurring issue";
      krator-furniture-core.js FURN_HEM): every wall-anchored banner, tapestry, scroll, wall rug or art of the whole catalog
      (anchor 'wall' and type banner or art, or a role furnWallHung hangs), every variant, built at furnAnchorY in rooms
      of several clear heights, has its LOWEST DRAWN POINT at least HEM (1 m) over its floor wherever the room is tall
      enough for it (clear height >= the piece's drawn height + HEM + 0.3). Settlements/xanadu/citadel/furnish_census.js
      runs the same rule on the citadel's furnished rooms; this one covers every piece, whatever room takes it.
      STANDS lists the pieces that stand on the floor by design (a hanging on its own poles), each with its reason.
   2. THE DECAL IMAGE (mkDecal): a painted panel whose key is a delivered texture id shows the image once it loads, drawn
      at the panel's aspect (an image of another shape cropped about its centre), the painting until then; a key with no
      image keeps the painting. A stub Image stands in for the browser's. */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const AT = require(path.join(__dirname, 'catalog-files.js'));
const CAT = path.join(ROOT, 'kits', 'catalog') + path.sep;
const LIST = process.argv.indexOf('--list') >= 0;
const HEM = 1.0, CEILINGS = [2.6, 3.0, 3.5, 4.2, 5.0, 6.5];
/* pieces that stand on the floor by design, not hung: key or role -> why. Keep this short and give each a reason */
const STANDS = {
  painted_hanging: 'a painted cloth on its own two poles, standing on the floor (krator-furniture-kit.js paintedHanging); ' +
    'whether it should rise too is the owner\'s call (asked 2026-11-17)'
};

/* a page-less context: a canvas that records drawImage and paints nothing, an Image that loads on demand */
const draws = [];
function canvas() {
  const c = { width: 0, height: 0, style: {}, addEventListener() {} };
  const g = new Proxy({}, { get: (t, k) => {
    if (k === 'measureText') return () => ({ width: 10 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
    if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (k === 'drawImage') return function () { draws.push({ canvas: c, args: [].slice.call(arguments) }); };
    if (k === 'canvas') return c;
    return typeof k === 'string' ? () => {} : undefined;
  }, set: () => true });
  c.getContext = () => g;
  return c;
}
const images = [];
function Img() { images.push(this); this.naturalWidth = 0; this.naturalHeight = 0; }
Img.prototype.load = function (w, h) { this.naturalWidth = w; this.naturalHeight = h; if (this.onload) this.onload(); };
const g = { console: { log: console.log, warn() {}, error: console.error } };
for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
g.self = g; g.window = g; g.globalThis = g;
g.document = { createElement: canvas };
g.Image = Img;
vm.createContext(g);
const run = (src, name) => vm.runInContext(src, g, { filename: name });
run(fs.readFileSync(CAT + 'three.min.js', 'utf8'), 'three.min.js');
const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js']
  .concat(fs.readdirSync(CAT).filter(f => f.startsWith('krator-master-furniture-') && f.endsWith('.js')).sort());
run('var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(AT(f), 'utf8')).join('\n;\n'), 'catalog.js');

/* ---- 1. the hem */
const R = JSON.parse(run(`(function () {
  const STANDS = ${JSON.stringify(STANDS)}, HEM = ${HEM}, CEIL = ${JSON.stringify(CEILINGS)}, out = [];
  for (const A of FURNS) {
    if (A.anchor !== 'wall' || !(furnWallHung(A) || A.type === 'banner' || A.type === 'art')) continue;
    for (let v = 0; v < (A.variants || 1); v++) {
      const grp = buildFurn(A.key, 0, 0, 0, { variant: v, seed: 1, y: 0, wealth: 0.9 }); if (!grp) continue;
      grp.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(grp); INSTANCES.length = 0;
      if (box.isEmpty()) continue;
      const tall = box.max.y - box.min.y, rooms = [];
      for (const c of CEIL) {
        const y = furnAnchorY(A, v, { floorY: 0, ceilingY: c }), lo = y + box.min.y;
        rooms.push({ ceil: c, hem: Math.round(lo * 1000) / 1000, owed: c >= tall + HEM + 0.3, top: Math.round((y + box.max.y) * 1000) / 1000 });
      }
      out.push({ key: A.key, v: v, role: A.role || null, type: A.type, hung: furnWallHung(A), tall: Math.round(tall * 100) / 100,
        stands: STANDS[A.key] || STANDS[A.role] || null, rooms: rooms });
    }
  }
  return JSON.stringify(out);
})()`, 'hems.js'));
const bad = R.filter(p => !p.stands && p.rooms.some(r => r.owed && r.hem < HEM - 1e-3));
/* the engine's own clamp, on the pieces it hangs: never through a ceiling the piece fits under */
const over = R.filter(p => p.hung && p.rooms.some(r => r.ceil - 0.15 >= p.tall && r.top > r.ceil - 0.15 + 0.05));
if (LIST) for (const p of R) console.log(`${p.key} v${p.v} [${p.type}${p.hung ? ' ' + p.hung : ''}] ${p.tall} m: ` +
  p.rooms.map(r => `${r.ceil}->${r.hem}${r.owed && r.hem < HEM - 1e-3 && !p.stands ? '!' : ''}`).join(' ') + (p.stands ? '  (stands)' : ''));
for (const p of bad.slice(0, 30)) console.log('  HEM ' + p.key + ' v' + p.v + ' (' + p.tall + ' m): ' +
  p.rooms.filter(r => r.owed && r.hem < HEM - 1e-3).map(r => 'ceiling ' + r.ceil + ' hem ' + r.hem).join(', '));
console.log(`${R.length} wall hangings and art (piece variants), ${R.filter(p => p.stands).length} standing by design`);
T.ok('every wall hanging of the catalog ends at least ' + HEM + ' m up in a room tall enough for it', bad.length === 0, bad.length + ' fail');
T.ok('no hanging rises through its ceiling in a room tall enough for it', over.length === 0, over.map(p => p.key).slice(0, 5).join(', '));
T.ok('the check saw the hung kinds (banner, tapestry, art)', ['top', 'eye'].every(h => R.some(p => p.hung === h)) && R.length > 100, R.length + ' pieces');
/* the rule itself, on a stand-in top-hung banner 2.4 m long: today's 2.7 m top ended it 0.3 m up in any tall room */
const hemOf = (h, ceil, kind) => run(`furnAnchorY({ anchor: 'wall', role: '${kind}', type: 'banner', w: 1, d: 0.1, h: ${h} }, 0, { floorY: 0, ceilingY: ${ceil} })`, 'rule.js');
T.neg('a 2.4 m banner in a 4.5 m hall is caught when it hangs from 2.7 m, and passes under the hem rule',
  y => y >= HEM, 2.7 - 2.4, hemOf(2.4, 4.5, 'banner'));
T.ok('a low room still brings a long cloth down (top 0.15 under the ceiling, never through the floor)',
  Math.abs(hemOf(2.4, 3.0, 'banner') - 0.45) < 1e-9 && hemOf(3.2, 3.0, 'banner') === 0, hemOf(2.4, 3.0, 'banner') + ' ' + hemOf(3.2, 3.0, 'banner'));
T.ok('a short frieze keeps its 2.7 m top', Math.abs(hemOf(0.4, 4.5, 'frieze') - 2.3) < 1e-9, '' + hemOf(0.4, 4.5, 'frieze'));

/* ---- 2. the decal image */
const ID = 'patterns/xanadu/hanging-pleasure-dome';
run(`FURN_DECAL_IMG[${JSON.stringify(ID)}] = 'data:image/webp;base64,AAAA'; _texCache.clear();`, 'decal-reg.js');   /* the hem pass painted every panel already */
images.length = 0;
const mats = JSON.parse(run(`(function () {
  const g1 = buildFurn('xanadu_court_kubla_hanging', 0, 0, 0, { variant: 0, seed: 1, y: 0 }), g2 = buildFurn('xanadu_court_kubla_hanging', 0, 0, 0, { variant: 1, seed: 1, y: 0 });
  const find = (grp) => { let m = null; grp.traverse(o => { if (o.isMesh && o.material.map) m = o; }); return m; };
  const a = find(g1), b = find(g2); INSTANCES.length = 0;
  globalThis.__decalA = a.material; globalThis.__decalB = b.material;
  const P = a.geometry.parameters;
  return JSON.stringify({ aDecal: a.material.userData.decal || null, bDecal: b.material.userData.decal || null, w: P.width, h: P.height,
    paintedW: a.material.map.image.width, paintedH: a.material.map.image.height });
})()`, 'decal.js'));
T.ok('a panel whose key is a registered texture id is marked with it; one without an image is not', mats.aDecal === ID && mats.bDecal === null, JSON.stringify(mats));
T.ok('the painting shows until the image loads', mats.paintedW > 0 && images.length === 1 && run('__decalA.map.image', 'q.js').width === mats.paintedW, images.length + ' images asked for');
const ver0 = run('__decalA.map.version', 'q.js');
images[0].load(2000, 1000);   /* a 2:1 image on a 2:3 panel: cropped about its centre, never stretched */
const d = draws[draws.length - 1], im = run('__decalA.map.image', 'q.js'), aspect = mats.w / mats.h;
const [, sx, sy, sw, sh, dx, dy, dw, dh] = d.args;
T.ok('the loaded image replaces the painting on the same texture (a batch sharing the material shows it)', im === d.canvas && run('__decalA.map.version', 'q.js') > ver0, 'version ' + ver0);
T.ok('the image is drawn at the panel\'s aspect, cropped about its centre', Math.abs(sw / sh - aspect) < 1e-6 && Math.abs(im.width / im.height - aspect) < 0.01 &&
  Math.abs(sx - (2000 - sw) / 2) < 1e-6 && sy === 0 && sh === 1000 && dx === 0 && dy === 0 && dw === im.width && dh === im.height, [sx, sy, sw, sh, im.width, im.height].join(' '));
T.ok('the runtime reports the load', JSON.stringify(run('JSON.stringify(_decalSt)', 'q.js')).indexOf('hanging-pleasure-dome') >= 0, run('JSON.stringify(_decalSt)', 'q.js'));
T.done();
