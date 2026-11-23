/* Per-page library packs (tools/textures/page_pack.py; settlements/xanadu/XS1-CLASSES.md, "Fixes after XS0"): the build-time
   check that a page's pack holds every family the page uses, with its faults and fixes; the recorded lists in
   settlements/xanadu/page-packs.json against today's packs; and the switch: off by default, so no page changes before Stage 8.
     node core/materials/classes/test-page-pack.js */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const TEX = path.join(ROOT, 'tools', 'textures');

/* page_pack.py's own functions, called through python (the build runs them there) */
function py(fn, args) {
  const src = 'import sys,json; sys.path.insert(0, sys.argv[1]); import page_pack as P; a=json.load(sys.stdin); ' +
    'r=getattr(P, a["fn"])(*a["args"]); print(json.dumps(sorted(r) if isinstance(r, set) else r))';
  return JSON.parse(cp.execFileSync('python3', ['-c', src, TEX], { input: JSON.stringify({ fn, args }), encoding: 'utf8' }));
}
const FAMS = ['stone', 'wood', 'xMosC', 'xHaft'];
const REC = { decoded: { xanadu: ['stone', 'wood'] }, drawn: { xanadu: ['stone'] } };
const entry = (keep, rec) => ({ packs: { xanadu: keep }, record: rec === undefined ? REC : rec });
const fits = ([e, refs]) => py('check', [e, 'xanadu', FAMS, refs || []]).length === 0;

T.ok('a page whose list holds what it used passes', fits([entry(['stone', 'wood']), []]));
T.neg('a page that decoded a family its pack lacks is refused (the build stops)', fits,
  [entry(['stone']), []], [entry(['stone', 'wood']), []]);
T.neg('a page that drew a family its pack lacks is refused', fits,
  [entry(['wood'], { decoded: { xanadu: ['wood'] }, drawn: { xanadu: ['stone'] } }), []],
  [entry(['wood', 'stone'], { decoded: { xanadu: ['wood'] }, drawn: { xanadu: ['stone'] } }), []]);
T.neg('a family the page\'s own fragments name is required even if the run missed it', fits,
  [entry(['stone', 'wood']), ['xHaft']], [entry(['stone', 'wood', 'xHaft']), ['xHaft']]);
T.neg('a list with no run behind it is refused', fits, [entry(['stone', 'wood'], null), []], [entry(['stone', 'wood']), []]);
T.neg('a listed family the pack does not have is refused', fits, [entry(['stone', 'wood', 'nope']), []], [entry(['stone', 'wood']), []]);
T.ok('a pack the page keeps no list for is carried whole (no check, no exclusion)',
  py('check', [{ packs: { other: [] }, record: REC }, 'xanadu', FAMS, ['xHaft']]).length === 0);

/* what the page's own fragments name */
const refs = (t, key) => py('refs_in', [t, key || 'xanadu', FAMS]);
T.ok('refs: MAT.<f>, MAT[\'<f>\'], kput(\'<f>\' and KMAT.packed(key, f) are named',
  JSON.stringify(refs("MAT.stone.color; MAT['wood']; kput('xMosC',[0,0,0]); KMAT.packed('xanadu','xHaft')")) === JSON.stringify(['stone', 'wood', 'xHaft', 'xMosC']));
T.neg('refs: a longer name is not its prefix (MAT.stoneB is not stone)', t => refs(t).length === 0, 'MAT.stone.color', 'MAT.stoneB.color');
T.neg('refs: KMAT.packed of another pack does not count', t => refs(t).length === 0, "KMAT.packed('xanadu','stone')", "KMAT.packed('qiblai','stone')");
T.ok('refs: a biome pack (xanadu-bio) is named only through KMAT.packed', refs("MAT.stone; KMAT.packed('xanadu-bio','wood')", 'xanadu-bio').join() === 'wood');

/* the recorded lists (settlements/xanadu/page-packs.json) against today's packs */
/* where a page's pack comes from, as settlements/xanadu/build.py takes it: Xanadu's own, the Vale biome's, the page's kit pack
   (kit.json "pack", from "packFrom" or the page's own folder); the Dalab pack Thalaba's build trims itself */
function packDir(pg, k) {
  if (k === 'xanadu') return 'settlements/xanadu';
  if (k === 'xanadu-bio') return 'biomes/xanadu';
  if (k === 'dalab') return 'settlements/dalab';
  const b = pg.split('/dist/')[0], kj = path.join(ROOT, b, 'kit.json');
  const K = fs.existsSync(kj) ? JSON.parse(fs.readFileSync(kj, 'utf8')) : {};
  return K.pack === k ? (K.packFrom || b) : null;
}
const famsOf = (pg, k) => { const d = packDir(pg, k); if (!d) return null; const p = path.join(ROOT, d, 'tex', 'pack.json');
  return fs.existsSync(p) ? Object.keys(JSON.parse(fs.readFileSync(p, 'utf8')).families).sort() : null; };
const DOC = JSON.parse(fs.readFileSync(path.join(ROOT, 'settlements', 'xanadu', 'page-packs.json'), 'utf8'));
const pages = Object.keys(DOC.pages || {}).sort();
T.ok('page-packs.json lists the four near-cap pages (Kirstabal, Thalaba, the Flashing Eye, the Azure Dream)',
  ['settlements/kirstabal/dist/kirstabal.html', 'settlements/thalaba/dist/thalaba.html', 'settlements/flashing-eye/dist/flashing-eye.html',
    'settlements/azure-dream/dist/azure-dream.html'].every(p => pages.includes(p)), pages.join(', '));
for (const pg of pages) {
  const e = DOC.pages[pg], errs = [];
  for (const k of Object.keys(e.packs)) {
    const f = famsOf(pg, k);
    if (f == null) continue;   /* a pack this build does not subset (the furniture's detail maps travel in their bundle) */
    errs.push(...py('check', [e, k, f, []]));
  }
  T.ok(pg + ': its lists hold every family its recorded run used, all in today\'s packs', errs.length === 0, errs.join('; '));
}

/* the switch: opt-in, nothing read while it is off */
const B = fs.readFileSync(path.join(ROOT, 'settlements', 'xanadu', 'build.py'), 'utf8');
const gated = src => /if '--page-packs' in sys\.argv:\n\s+import page_pack\n/.test(src) && (src.match(/import page_pack/g) || []).length === 1
  && /_ex = \(lambda key, d: _pp\.exclude\(key, d\)\) if _pp else \(lambda key, d: \(\)\)/.test(src);
T.ok('settlements/xanadu/build.py imports page_pack only under --page-packs, and passes exclude () otherwise (pages unchanged)', gated(B));
T.neg('the switch test sees an ungated import', gated, B.replace("if '--page-packs' in sys.argv:\n        import page_pack\n", "import page_pack\n    if '--page-packs' in sys.argv:\n        pass\n"), B);

T.done();
