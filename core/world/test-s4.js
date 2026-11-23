// node core/world/test-s4.js: S4, the near ground's library layers (81-world-terrain.js; GRAPHICS-TERRAIN-PROPOSAL section 5), each
// check with a fault that must fail and a fix that must pass (tools/ktest.js). The terrain module needs the whole world to run, so
// its two pure parts are lifted out of the file by name and run here: the roles' weights at a vertex and the shader's term.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const SRC = fs.readFileSync(path.join(__dirname, '81-world-terrain.js'), 'utf8');
const lift = name => { const i = SRC.indexOf('function ' + name + '('); if (i < 0) throw new Error('no ' + name);
  let d = 0, j = SRC.indexOf('{', i); for (; j < SRC.length; j++) { if (SRC[j] === '{') d++; else if (SRC[j] === '}' && --d === 0) break; }
  return SRC.slice(i, j + 1); };
const s4Weights = new Function(lift('s4Weights') + '\nreturn s4Weights;')();
const S4GLSL = new Function(lift('S4GLSL') + '\nreturn S4GLSL;')();
require(path.join(ROOT, 'core', 'terrain', '43-core-ground.js'));
const KG = globalThis.KGROUND;   /* the module sets the global, as on a page */

// ---------------------------------------------------------------- the roles at a vertex
const w = F => s4Weights(Object.assign({ dune: 0, flow: 0, salt: 0, canyon: 0, slope: 0, wet: 0 }, F), F.rk || 0, F.rd || 0, [0, 0, 0, 0], 0);
const top = v => ['meadow', 'forest', 'sand', 'gravel'][v.indexOf(Math.max(...v))];
T.ok('S4: open dry ground is meadow; a dune sand; a canyon floor gravel; wet ground forest floor',
  top(w({})) === 'meadow' && top(w({ dune: 1 })) === 'sand' && top(w({ canyon: 1 })) === 'gravel' && top(w({ wet: .95 })) === 'forest',
  [w({}), w({ dune: 1 }), w({ canyon: 1 }), w({ wet: .95 })].map(top));
T.ok('S4: the weights never sum over 1', [{}, { dune: .6, canyon: .6, wet: .9 }, { flow: 1, slope: 1 }, { salt: 1, wet: 1 }].every(F => w(F).reduce((a, b) => a + b, 0) <= 1 + 1e-9));
T.neg('S4: the strata\'s rock and a road take the layers away (a road: none)', v => v.every(x => x === 0), w({}), w({ rd: 1 }));
T.ok('S4: bare rock keeps a fifth of them (the strata draws the rest)', Math.abs(w({ rk: 1 })[0] - .2) < 1e-9, w({ rk: 1 }));

// ---------------------------------------------------------------- the shader's term
const L = [{ k: Math.round(4096 / 2.6) / 4096 }, null, { k: Math.round(4096 / 2.4) / 4096 }, null];
const g = S4GLSL(L);
T.ok('S4: only the roles present are sampled (uGL0, uGL2; not uGL1, uGL3)', /kgSample\(uGL0,/.test(g) && /kgSample\(uGL2,/.test(g) && !/uGL1|uGL3/.test(g));
const derivOutside = s => { const d = s.indexOf('dFdx('), b = s.indexOf('if(s4n'); return d >= 0 && b >= 0 && d < b; };
T.neg('S4: the derivatives are taken before any branch (GLSL ES 3.00: undefined inside non-uniform flow)', derivOutside,
  g.replace('vec2 s4x=dFdx(vDUV),s4y=dFdy(vDUV);', '').replace('if(s4n>0.0&&dot(s4w,vec4(1.0))>0.01){', 'if(s4n>0.0&&dot(s4w,vec4(1.0))>0.01){vec2 s4x=dFdx(vDUV),s4y=dFdy(vDUV);'), g);
T.ok('S4: the sets take the noise\'s place in the near and mid detail (not on top of it)', /near=mix\(near,s4d,s4k\);mid=mix\(mid,s4d,s4k\);/.test(g));
T.ok('S4: each set\'s scale holds whole tiles in the 4096 m frame (no seam where a chunk\'s frame changes)', L.filter(Boolean).every(Y => Math.abs(Y.k * 4096 - Math.round(Y.k * 4096)) < 1e-9));
T.ok('S4: KGROUND\'s library gives kgSample, KG_LOD and kgLum (the term needs nothing else)', ['vec4 kgSample(', 'KG_LOD', 'float kgLum('].every(s => KG.glsl({}).indexOf(s) >= 0));
T.done();
