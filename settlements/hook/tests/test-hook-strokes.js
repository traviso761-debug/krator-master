/* settlements/hook/tests/test-hook-strokes.js: the site editor's ground strokes replayed on the page (src/76b-hook-strokes.js).

   On a made-up natural ground (a tilted plane with a 6 m bump), with the editor's arithmetic: a raise stroke lifts the
   ground by its strength at its centre and not at all past its radius; a lower stroke the other way; a smooth stroke
   flattens the bump toward its surroundings; strokes add in order; no strokes, or the editor's own page (HOOK_EDITOR),
   leave PORT.natH untouched. The page's replay is checked against the editor's (settlements/voth/targets/voth-site/
   10-site-model.js TERR, run here on the same ground) to a millimetre.

   node settlements/hook/tests/test-hook-strokes.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const HOOK = path.join(__dirname, '..'), ROOT = path.join(HOOK, '..', '..');
const SRC = fs.readFileSync(path.join(HOOK, 'src', '76b-hook-strokes.js'), 'utf8');
const ground = (x, z) => 0.02 * x - 0.01 * z + 6 * Math.exp(-((x - 100) ** 2 + (z + 50) ** 2) / (2 * 40 * 40));

function page(terrain, editor) {
  const ctx = vm.createContext({ Math, Float32Array, Float64Array, PORT: { natH: ground }, HOOK_SITE: terrain ? { terrain } : {} });
  if (editor) ctx.HOOK_EDITOR = true;
  vm.runInContext(SRC + '\nglobalThis.__S = HOOK_STROKES;', ctx);
  return { natH: ctx.PORT.natH, S: ctx.__S };
}
/* the editor's own replay, from Voth's model, on the same ground (VOTH.terrainH = ground) */
function editor(terrain) {
  const src = fs.readFileSync(path.join(ROOT, 'settlements', 'voth', 'targets', 'voth-site', '10-site-model.js'), 'utf8');
  const a = src.indexOf('var TERR = {'), b = src.indexOf('TERR.sync = function');
  const ctx = vm.createContext({ Math, Float32Array, Float64Array, VOTH: { terrainH: ground } });
  vm.runInContext(src.slice(a, b) + '\nTERR.reset(); (' + JSON.stringify(terrain) + ').forEach(TERR.stroke); globalThis.__T = TERR;', ctx);
  return (x, z) => ctx.__T.h(x, z);
}

const raise = { m: 'raise', r: 80, s: 6, pts: [[-402, 300]] }   /* on a grid node (6 m cells from -3900) */, lower = { m: 'lower', r: 60, s: 4, pts: [[500, -200], [520, -200]] };
const smooth = { m: 'smooth', r: 90, s: 1, pts: [[100, -50], [100, -50], [100, -50]] };

/* none, and the editor's page: untouched */
{ const P = page([]); T.ok('no strokes: PORT.natH is the natural ground itself', P.natH === ground && !P.S.applied, 'applied ' + P.S.applied); }
{ const P = page([raise], true); T.ok('on the editor\'s page the strokes are left to its live grid', P.natH === ground && !P.S.applied, 'applied ' + P.S.applied); }

/* raise and lower */
{ const P = page([raise]), d = (x, z) => P.natH(x, z) - ground(x, z);
  T.ok('a raise stroke lifts its centre by its strength', Math.abs(d(-402, 300) - 6) < 1e-3, 'delta ' + d(-402, 300).toFixed(4));
  T.ok('and nothing past its radius', Math.abs(d(-402 + 90, 300)) < 1e-6 && Math.abs(d(0, 0)) < 1e-6, 'at r+10: ' + d(-312, 300)); }
{ const P = page([lower]), d = P.natH(510, -200) - ground(510, -200);
  T.ok('a lower stroke lowers the ground', d < -6 && d > -8.1, 'delta ' + d.toFixed(3)); }

/* smooth: the bump flattens toward the plane */
{ const P = page([smooth]), before = ground(100, -50) - (0.02 * 100 + 0.01 * 50), after = P.natH(100, -50) - (0.02 * 100 + 0.01 * 50);
  T.ok('a smooth stroke flattens a bump', after < before * 0.8, 'bump ' + before.toFixed(2) + ' m -> ' + after.toFixed(2) + ' m'); }

/* the page's replay is the editor's, strokes in order */
const all = [raise, lower, smooth];
const pageH = page(all).natH, edH = editor(all);
const same = h => { let worst = 0; for (let x = -600; x <= 700; x += 37) for (let z = -400; z <= 500; z += 41) worst = Math.max(worst, Math.abs(h(x, z) - edH(x, z))); return worst < 1e-3; };
T.ok('the page\'s ground is the editor\'s (three strokes, in order)', same(pageH), '');
T.neg('the comparison catches a stroke left out', same, page([raise, smooth]).natH, pageH);

T.done();
