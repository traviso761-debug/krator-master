/* The M1 material classes (10-mat-class.js, m1-classes.json; settlements/xanadu/STACK-PLAN.md section 5):
   every Xanadu materials.json classed, the names checked against the library, the stack's glazed rule's disagreements
   pinned by name, and the field proven byte-neutral for today's pack.py (tools/textures/mclass.py --prove).
     node core/materials/classes/test-class.js */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const TABLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'm1-classes.json'), 'utf8'));
const C = require('./10-mat-class.js').make(TABLE);

function libs(cfg) {   /* library id -> {kind, roughness, specular, normal}, null when the set is not there */
  const out = {};
  for (const f of Object.keys(cfg.families)) {
    const lib = cfg.families[f].lib;
    const d = lib.startsWith('patterns/') ? path.join(ROOT, 'core', 'materials', lib) : path.join(ROOT, 'core', 'materials', 'library', lib);
    const mp = path.join(d, 'meta.json');
    if (!fs.existsSync(mp)) { out[lib] = null; continue; }
    const m = JSON.parse(fs.readFileSync(mp, 'utf8')), rec = m.record || {};
    out[lib] = { kind: rec.kind, roughness: rec.roughness, specular: rec.specular,
      normal: fs.existsSync(path.join(d, (m.maps || {}).normalMap || 'normal.jpg')) };
  }
  return out;
}
const read = b => JSON.parse(fs.readFileSync(path.join(ROOT, b, 'materials.json'), 'utf8'));

/* ---- every Xanadu materials.json (and the Tungang kit's, whose Glazier set Lightwall draws) ---- */
const WANT = {   // the stack's rule against the classes, decided by name (STACK-PLAN.md section 5; settlements/xanadu/XS1-CLASSES.md)
  'kits/xanadu':              { byName: ['xBandC', 'xBandR', 'xGiltC', 'xMosC', 'xMosD', 'xTiles'], ruleOnly: ['icewall'] },
  'settlements/xanadu':       { byName: ['xBandC', 'xBandR', 'xGiltC', 'xMosC', 'xMosD', 'xTiles'], ruleOnly: ['icewall'] },
  'kits/qiblai':              { byName: ['qGilt', 'qLacq'], ruleOnly: [] },
  'settlements/flashing-eye': { byName: ['qGilt', 'qLacq'], ruleOnly: [] },
  'settlements/kirstabal':    { byName: [], ruleOnly: [] },
  'settlements/thalaba':      { byName: [], ruleOnly: [] },
  'kits/tungang':             { byName: ['gilt'], ruleOnly: ['ice'] },
};
// section 5's glazed list as the families draw it (lit, not mapOnly), and xTiles: the domes', bulbs' and drums' tile today
const GLAZED_PLAN = ['xTiles', 'xMosC', 'xMosD', 'xZel', 'xHaft', 'xMuqT', 'xBTile', 'xBandC', 'xBandR', 'xGiltC', 'xPietra', 'xMarW', 'xMarK'];
for (const b of Object.keys(WANT)) {
  const cfg = read(b), r = C.check(cfg, libs(cfg));
  T.ok(b + ': every family classed, the names agree with the library', r.errors.length === 0, r.errors.join('; '));
  T.ok(b + ': glazed by name (the rule misses them)', JSON.stringify(r.byName) === JSON.stringify(WANT[b].byName), JSON.stringify(r.byName));
  T.ok(b + ': taken by the rule, not classed glazed', JSON.stringify(r.ruleOnly) === JSON.stringify(WANT[b].ruleOnly), JSON.stringify(r.ruleOnly));
}
{
  const fams = read('settlements/xanadu').families;
  const glazed = Object.keys(fams).filter(f => fams[f]['class'] === 'glazed').sort();
  T.ok('Xanadu: the glazed families are the plan\'s section 5 list as drawn (lit, not mapOnly), and xTiles (the domes\' tile)',
    JSON.stringify(glazed) === JSON.stringify(GLAZED_PLAN.slice().sort()), glazed.join(','));
  const kit = read('kits/xanadu').families;
  T.ok('the kit\'s and Erewhon\'s materials.json class every family alike',
    Object.keys(fams).every(f => kit[f] && kit[f]['class'] === fams[f]['class']));
  const qb = read('kits/qiblai').families, fe = read('settlements/flashing-eye').families;
  T.ok('the Flashing Eye classes the Qiblai families as the Qiblai kit does', Object.keys(qb).every(f => fe[f]['class'] === qb[f]['class']));
}

/* ---- what Stage 8 packs per class ---- */
T.ok('glazed packs 8-bit normals on the web and hemi-oct8 with mip variance in Godot',
  C.settings({ 'class': 'glazed' }).web.normal === 'xy8' && C.settings({ 'class': 'glazed' }).godot.normal === 'oct8' && C.settings({ 'class': 'glazed' }).godot.mipVariance === true);
T.ok('only glazed packs 8-bit normals on the web (the owner, 2026-11-22)',
  C.classes.filter(c => C.settings({ 'class': c }).web.normal === 'xy8').join() === 'glazed');
T.ok('a flat family demands no height range (Gate 1) and a relief family does',
  C.settings({ 'class': 'flat' }).flat === true && C.settings({ 'class': 'relief' }).flat === false && C.settings({ 'class': 'relief' }).pom === 'hero');
T.ok('a card has no normal and never a height in its alpha',
  C.settings({ 'class': 'card' }).web.normal === null && C.settings({ 'class': 'card' }).height === 'never');

/* ---- negatives: each check fails on the fault and passes on the fix ---- */
const LIB = { 'patterns/xanadu/jali': { kind: 'card', roughness: 0.8, normal: false },
  'stone.cut': { roughness: 0.85, normal: true }, 'tile.muqarnas.turquoise': { roughness: 0.3, normal: true },
  'rock.marble012': { roughness: 0.066, normal: true } };
const one = (fam, fc) => ({ families: { [fam]: fc } });
const clean = cfg => C.check(cfg, LIB).errors.length === 0;
T.neg('a family with no class is caught', clean, one('stone', { lib: 'stone.cut' }), one('stone', { lib: 'stone.cut', 'class': 'relief' }));
T.neg('an unknown class is caught', clean, one('stone', { lib: 'stone.cut', 'class': 'shiny' }), one('stone', { lib: 'stone.cut', 'class': 'flat' }));
T.neg('a cut-out card classed relief is caught', clean, one('xJaliC', { lib: 'patterns/xanadu/jali', 'class': 'relief' }),
  one('xJaliC', { lib: 'patterns/xanadu/jali', 'class': 'card' }));
T.neg('a card class on a lit set is caught', clean, one('stone', { lib: 'stone.cut', 'class': 'card' }), one('stone', { lib: 'stone.cut', 'class': 'relief' }));
T.neg('a height in a card\'s alpha is caught (Gate 1)', clean, one('xJaliC', { lib: 'patterns/xanadu/jali', 'class': 'card', height: true }),
  one('xJaliC', { lib: 'patterns/xanadu/jali', 'class': 'card' }));
T.neg('glazed on a mapOnly sheet (no normal to promote) is caught', clean, one('xMarble', { lib: 'rock.marble012', 'class': 'glazed', mapOnly: true }),
  one('xMarble', { lib: 'rock.marble012', 'class': 'flat', mapOnly: true }));
T.neg('a missing library set is caught unless the family is optional', clean, one('x', { lib: 'no.such.set', 'class': 'flat' }),
  one('x', { lib: 'no.such.set', 'class': 'flat', optional: true }));
T.neg('the rule takes a smooth tile left out of glazed', cfg => C.check(cfg, LIB).ruleOnly.length === 0,
  one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'relief' }), one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed' }));
T.neg('roughLift counts: a lifted tile falls out of the rule (glazed by name)', cfg => C.check(cfg, LIB).byName.length === 0,
  one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed', roughLift: 0.2 }), one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed' }));
T.neg('a family\'s own low specular takes it out of the rule', cfg => C.check(cfg, LIB).byName.length === 0,
  one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed', specular: 0.2 }), one('xMuqT', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed' }));
T.neg('settings() refuses an unknown class', fc => { C.settings(fc); return true; }, { 'class': 'shiny' }, { 'class': 'flat' });

/* ---- byte-neutral: today's pack.py reads no "class" (and the proof sees a reader that would) ---- */
const PY = path.join(ROOT, 'tools', 'textures', 'mclass.py');
const proveSrc = src => JSON.parse(cp.execFileSync('python3', ['-c',
  'import sys,json; sys.path.insert(0, sys.argv[1]); import mclass; print(json.dumps(mclass.prove(sys.stdin.read())))',
  path.dirname(PY)], { input: src, encoding: 'utf8' })).neutral;
let r0 = null;
try { cp.execFileSync('python3', [PY, '--prove'], { encoding: 'utf8' }); r0 = true; } catch (e) { r0 = false; }
T.ok('tools/textures/pack.py reads no "class": the classes are byte-neutral today', r0 === true);
const base = 'def process(fam, cfg, size):\n    lib = cfg["lib"]\n    s = cfg.get("size", size)\n';
T.neg('the proof catches a packer that reads "class"', proveSrc, base + '    c = cfg.get("class")\n', base);
T.neg('the proof catches a packer that walks the whole entry', proveSrc, base + '    for k in cfg:\n        pass\n', base);
T.neg('the proof follows a loop over named keys and no further', proveSrc,
  base + '    for k in ("stems", "class"):\n        x = cfg.get(k)\n', base + '    for k in ("stems", "rise"):\n        x = cfg.get(k)\n');

T.done();
