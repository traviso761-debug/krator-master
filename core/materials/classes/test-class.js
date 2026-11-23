/* The M1 material classes (10-mat-class.js, m1-classes.json; settlements/xanadu/STACK-PLAN.md section 5):
   every Xanadu materials.json classed, the names checked against the library, every class DERIVED from the family's
   values (the packed roughness in m1-measured.json, kept current against tex/pack.json; specular; lit or not; a library
   card; the kits' alphaTest definitions) with only the owner's declared exceptions differing (the drift test, after XS0),
   and the field proven byte-neutral for today's pack.py (tools/textures/mclass.py --prove).
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
const MEAS = JSON.parse(fs.readFileSync(path.join(__dirname, 'm1-measured.json'), 'utf8')).builds;

/* the MAT keys a build's kits draw with alphaTest (a cut-out as drawn: XS0 section 5), from their definitions */
const CUT_SRC = { 'kits/xanadu': ['kits/xanadu/src', 'settlements/xanadu/src'], 'settlements/xanadu': ['kits/xanadu/src', 'settlements/xanadu/src'],
  'kits/qiblai': ['kits/qiblai/src'], 'settlements/flashing-eye': ['kits/qiblai/src', 'settlements/flashing-eye/src'],
  'settlements/kirstabal': ['settlements/kirstabal/src'], 'settlements/thalaba': ['settlements/thalaba/src'], 'kits/tungang': ['kits/tungang/src'],
  'settlements/dalab': ['settlements/dalab/src'], 'kits/ancient-transit': ['kits/ancient-transit/src'], 'kits/catalog': [], 'biomes/oidong': ['biomes/oidong/src'],
  'settlements/nulab': ['settlements/nulab/src'], 'settlements/blakhed': ['settlements/blakhed/src'] };
function alphaTested(srcText) {
  const out = new Set();
  for (const re of [/MAT\.(\w+)\s*=\s*\w+\(\{[^}]*?alphaTest\s*:\s*(0?\.\d*[1-9]|[1-9])/g, /MAT\.(\w+)\.alphaTest\s*=\s*(0?\.\d*[1-9]|[1-9])/g])
    for (const m of srcText.matchAll(re)) out.add(m[1]);
  return out;
}
const srcOf = dirs => dirs.filter(d => fs.existsSync(path.join(ROOT, d))).map(d => fs.readdirSync(path.join(ROOT, d))
  .filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(ROOT, d, f), 'utf8')).join('\n')).join('\n');
const cutoutErrors = (cfg, cut, libsOf) => Object.keys(cfg.families).sort().filter(f => {
  const fc = cfg.families[f], rec = libsOf[fc.lib];
  if (rec && rec.kind === 'card') return false;            /* a library card is a cut-out by its kind */
  return cut.has(f) !== !!fc.cutout;
});
/* a measured row is current while tex/pack.json still has the entry it was measured on */
function staleRows(b) {
  const pj = path.join(ROOT, b, 'tex', 'pack.json');
  if (!fs.existsSync(pj)) return ['no tex/pack.json'];
  return staleOf(JSON.parse(fs.readFileSync(pj, 'utf8')).families, MEAS[b] || {});
}
function staleOf(P, M) {
  const out = [];
  for (const f of Object.keys(P)) {
    const e = P[f];
    if (!e.files.roughnessMap) continue;
    const m = M[f];
    if (!m) out.push(f + ': not measured');
    else if (m.source !== e.source.roughness || m.roughLift !== (e.roughLift == null ? 0 : e.roughLift)) out.push(f + ': re-packed since');
  }
  return out;
}

/* ---- every materials.json whose pack a Xanadu page draws (XS0's GPU run): Xanadu's, the kits', Dalab's, the Ancient
   Transit's, the catalog's detail maps, Oidong's; Nulab's and Blakhed's once they are on this line ---- */
const WANT = {   // the rule (on the packed roughness) against the classes: only the declared exceptions differ
  'kits/xanadu':              { byName: ['xTiles'], ruleOnly: ['icewall'] },
  'settlements/xanadu':       { byName: ['xTiles'], ruleOnly: ['icewall'] },
  'kits/qiblai':              { byName: ['qGilt'], ruleOnly: [] },
  'settlements/flashing-eye': { byName: ['qGilt'], ruleOnly: [] },
  'settlements/kirstabal':    { byName: [], ruleOnly: [] },
  'settlements/thalaba':      { byName: [], ruleOnly: [] },
  'kits/tungang':             { byName: [], ruleOnly: ['ice'] },
  'settlements/dalab':        { byName: [], ruleOnly: [] },
  'kits/ancient-transit':     { byName: [], ruleOnly: [] },
  'kits/catalog':             { byName: [], ruleOnly: [] },
  'biomes/oidong':            { byName: [], ruleOnly: [] },
  'settlements/nulab':        null,   /* on the integration line, not here yet: classed when it merges (the test then demands it) */
  'settlements/blakhed':      null,
};
// after XS0: section 5's glazed list as the rule takes it on the packed maps, and xTiles (the owner's exception)
const GLAZED_PLAN = ['xTiles', 'xZel', 'xHaft', 'xMuqT', 'xBTile', 'xPietra', 'xMarW', 'xMarK'];
const present = b => fs.existsSync(path.join(ROOT, b, 'materials.json'));
for (const b of Object.keys(WANT).filter(b => WANT[b] === null)) {
  const cfg = present(b) ? read(b) : null, L = cfg ? libs(cfg) : {};
  const errs = cfg ? C.check(cfg, L, MEAS[b]).errors.concat(C.drift(b, cfg, L, MEAS[b]).wrong) : [];
  T.ok(b + (cfg ? ': every family classed and agreeing with its values (merged here: give it a WANT row)'
    : ': not on this branch yet (on the integration line): classed when it merges, which this test then demands'), errs.length === 0, errs.join('; '));
}
for (const b of Object.keys(WANT).filter(b => WANT[b] !== null)) {
  const cfg = read(b), L = libs(cfg), r = C.check(cfg, L, MEAS[b]);
  T.ok(b + ': every family classed, the names agree with the library', r.errors.length === 0, r.errors.join('; '));
  T.ok(b + ': the packed roughness measured on today\'s tex/ (mclass.py --measure)', staleRows(b).length === 0, staleRows(b).join('; '));
  T.ok(b + ': glazed though the rule misses them (declared exceptions only)', JSON.stringify(r.byName) === JSON.stringify(WANT[b].byName), JSON.stringify(r.byName));
  T.ok(b + ': taken by the rule, not classed glazed (declared exceptions only)', JSON.stringify(r.ruleOnly) === JSON.stringify(WANT[b].ruleOnly), JSON.stringify(r.ruleOnly));
  const d = C.drift(b, cfg, L, MEAS[b]);
  T.ok(b + ': every class is the one its values and cut-out flag give (the drift test)', d.wrong.length === 0, d.wrong.join('; '));
  T.ok(b + ': every exception is declared in m1-classes.json and still needed', d.stale.length === 0, d.stale.join('; '));
  const exp = Object.keys((TABLE.exceptions || {})[b] || {}).sort();
  T.ok(b + ': the exceptions are the owner\'s (' + (exp.join(', ') || 'none') + ')', JSON.stringify(d.excepted) === JSON.stringify(exp), JSON.stringify(d.excepted));
  const bad = cutoutErrors(cfg, alphaTested(srcOf(CUT_SRC[b])), L);
  T.ok(b + ': "cutout" on exactly the families its kits draw with alphaTest', bad.length === 0, bad.join(', '));
}
{
  const fams = read('settlements/xanadu').families;
  const glazed = Object.keys(fams).filter(f => fams[f]['class'] === 'glazed').sort();
  T.ok('Xanadu: the glazed families are the rule\'s hits on the packed maps, and xTiles (the owner\'s exception)',
    JSON.stringify(glazed) === JSON.stringify(GLAZED_PLAN.slice().sort()), glazed.join(','));
  T.ok('Xanadu: xSun and xValance are cut-outs (alphaTest), never a height in their alpha',
    ['xSun', 'xValance'].every(f => fams[f]['class'] === 'cutout' && C.settings(fams[f]).height === 'never'));
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
T.neg('a cut-out without "cutout": true is caught', clean, one('xSun', { lib: 'stone.cut', 'class': 'cutout' }),
  one('xSun', { lib: 'stone.cut', 'class': 'cutout', cutout: true }));
T.neg('a family drawn as a cut-out but classed flat is caught', clean, one('xSun', { lib: 'stone.cut', 'class': 'flat', cutout: true }),
  one('xSun', { lib: 'stone.cut', 'class': 'cutout', cutout: true }));
T.neg('a height in a cut-out\'s alpha is caught (Gate 1)', clean, one('xSun', { lib: 'stone.cut', 'class': 'cutout', cutout: true, height: true }),
  one('xSun', { lib: 'stone.cut', 'class': 'cutout', cutout: true }));

/* ---- the drift test: the class derived from the values, fault and fix ---- */
const noDrift = ([cfg, meas, build]) => { const d = C.drift(build || 'test', cfg, LIB, meas || {}); return d.wrong.length === 0 && d.stale.length === 0; };
T.neg('drift: a pattern sheet classed glazed whose packed roughness fails the rule is caught (the XS0 five)', noDrift,
  [one('xMosC', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed' }), { xMosC: { roughMean: 0.381 } }],
  [one('xMosC', { lib: 'tile.muqarnas.turquoise', 'class': 'relief' }), { xMosC: { roughMean: 0.381 } }]);
T.neg('drift: the packed roughness wins over the record (a lacquer the record calls rough, drawn smooth)', noDrift,
  [one('qLacq', { lib: 'stone.cut', 'class': 'relief' }), { qLacq: { roughMean: 0.313 } }],
  [one('qLacq', { lib: 'stone.cut', 'class': 'glazed' }), { qLacq: { roughMean: 0.313 } }]);
T.neg('drift: a rule hit left flat is caught (the ice)', noDrift,
  [one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'flat' }), {}], [one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'glazed' }), {}]);
T.neg('drift: an alphaTest family not classed cutout is caught', noDrift,
  [one('xSun', { lib: 'stone.cut', 'class': 'flat', cutout: true }), {}], [one('xSun', { lib: 'stone.cut', 'class': 'cutout', cutout: true }), {}]);
{
  const LIBP = Object.assign({ 'patterns/x/band': { roughness: 0.8, normal: true } }, LIB);
  const dr = cfg => C.drift('test', cfg, LIBP, {}).wrong.length === 0;
  T.neg('drift: a lit patterns/ sheet the rule misses must be flat', dr, one('b', { lib: 'patterns/x/band', 'class': 'relief' }),
    one('b', { lib: 'patterns/x/band', 'class': 'flat' }));
}
{
  const C2 = require('./10-mat-class.js').make(Object.assign({}, TABLE, { exceptions: { test: { ice: { 'class': 'flat' } } } }));
  const ex = cfg => { const d = C2.drift('test', cfg, LIB, {}); return d.wrong.length === 0 && d.stale.length === 0; };
  T.neg('drift: a declared exception passes, and its materials.json class must be the one it keeps', ex,
    one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'relief' }), one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'flat' }));
  T.neg('drift: an exception the rule has come to agree with is stale', ex,
    one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'flat', specular: 0.2 }), one('ice', { lib: 'tile.muqarnas.turquoise', 'class': 'flat' }));
}
T.neg('the cut-out scan reads an alphaTest definition', s => cutoutErrors({ families: { xSun: { lib: 'stone.cut', cutout: true } } }, alphaTested(s), LIB).length === 0,
  'MAT.xSun=xStd({map:TEX.xSun,roughness:.4});', 'MAT.xSun=xStd({map:TEX.xSun,alphaTest:.5,roughness:.4});');
T.neg('the cut-out scan sees alphaTest 0 as no cut-out', s => cutoutErrors({ families: { xSun: { lib: 'stone.cut' } } }, alphaTested(s), LIB).length === 0,
  'MAT.xSun.alphaTest=.5;', 'MAT.xSun.alphaTest=0;');
{
  const P = { s: { files: { roughnessMap: 's.rough.webp' }, source: { roughness: 'abc' }, roughLift: 0.1 } };
  T.neg('a measured row goes stale when the pack moves on (a new roughLift or source)', M => staleOf(P, M).length === 0,
    { s: { roughMean: 0.5, source: 'abc', roughLift: 0.0 } }, { s: { roughMean: 0.5, source: 'abc', roughLift: 0.1 } });
  T.neg('a packed family with no measured row is caught', M => staleOf(P, M).length === 0, {}, { s: { roughMean: 0.5, source: 'abc', roughLift: 0.1 } });
}

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
