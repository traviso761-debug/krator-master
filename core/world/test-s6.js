// node core/world/test-s6.js: S6, the ground's colour from the land's shape (41-world-fields.js W.s6wet, W.s6tint; GRAPHICS-TERRAIN-
// PROPOSAL section 5), each check with a fault that must fail and a fix that must pass (tools/ktest.js).
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
(0, eval)(fs.readFileSync(path.join(ROOT, 'core', 'terrain', '38-core-relief.js'), 'utf8'));
(0, eval)(fs.readFileSync(path.join(__dirname, '41-world-fields.js'), 'utf8') + ';global.WORLD=WORLD;');
const W = global.WORLD;

// ---------------------------------------------------------------- the aspect shifts the moisture
const S = (gz, gx, slope, wet) => ({ gx, gz, slope, wet });
const north = W.s6wet(S(1, 0, .6, .5)), south = W.s6wet(S(-1, 0, .6, .5)), flat = W.s6wet(S(1, 0, 0, .5)), east = W.s6wet(S(0, 1, .6, .5));
T.ok('S6: a steep slope facing the pole (its ground rising toward +z: facing -z, north) is damper; one facing the sun drier',
  Math.abs(north - .66) < 1e-9 && Math.abs(south - .34) < 1e-9, [north, south]);
T.ok('S6: flat ground and an east-facing slope keep their wetness', flat === .5 && Math.abs(east - .5) < 1e-9, [flat, east]);
T.neg('S6: a sample with no gradient (a caller that has none: the caverns) is not shifted', s => W.s6wet(s) === .5, S(1, 0, .6, .5), { slope: .6, wet: .5 });
T.ok('S6: the wetness stays in 0..1', W.s6wet(S(1, 0, 1, .95)) <= 1 && W.s6wet(S(-1, 0, 1, .05)) >= 0);

// ---------------------------------------------------------------- the relief's tint is chromatic
const hollow = W.s6tint({ crease: 1 }), nose = W.s6tint({ crease: -1 }), knoll = W.s6tint({ lift: 40 }), none = W.s6tint({});
T.ok('S6: a hollow is cooler (less red, more blue), a nose and a knoll warmer (more red, less blue)',
  hollow[0] < 1 && hollow[2] > 1 && nose[0] > 1 && nose[2] < 1 && knoll[0] > 1 && knoll[2] < 1, [hollow, nose, knoll]);
T.neg('S6: the tint is chromatic, not the grey factor it was (its channels differ)', t => Math.abs(t[0] - t[2]) > .02, [.93, .93, .93], hollow);
T.ok('S6: plain ground is untouched, and the shift stays within 5% a channel', none.every(v => v === 1) &&
  [hollow, nose, knoll].every(t => t.every(v => Math.abs(v - 1) <= .05)), [none, hollow]);
// ---------------------------------------------------------------- M4: the wet margin, from the ground's own water body
const at = (h, water) => W.wetMargin({ h, water });
T.ok('M4: the band just over its own water is wet (full to 0.4 m, gone by 1.8 m), and the ground under it is not judged', at(10.2, 10) === 1 && at(11.8, 10) === 0 && at(11, 10) > 0 && at(11, 10) < 1 && at(9.5, 10) === 0, [at(10.2, 10), at(11, 10), at(11.8, 10)]);
T.neg('M4: the margin follows the LOCAL water (a tarn at 2400 m wets its shore, not ground at the sea\'s level)', S => W.wetMargin(S) > .9, { h: 0.2, water: -1e9 }, { h: 2400.2, water: 2400 });
T.done();
