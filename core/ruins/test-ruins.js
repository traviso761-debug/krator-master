#!/usr/bin/env node
/* core/ruins: KRUINS.analyse on boxes, each check with a negative. Run: node core/ruins/test-ruins.js */
const K = require('./20-core-ruins.js');
let fails = 0, n = 0;
const ok = (name, c, neg) => { n++; const good = !!c && (neg === undefined || neg === false); if (!good) fails++; console.log((good ? ' ok   ' : ' FAIL ') + name + (neg !== undefined ? '  (negative ' + (neg === false ? 'fails' : 'PASSES') + ')' : '')); };
const B = (x0, y0, z0, x1, y1, z1, src, g) => ({ b: [x0, y0, z0, x1, y1, z1], g: g == null ? 0 : g, src: src || 'p' });
const body = [B(-10, 0, -10, 10, 60, 10, 'body'), B(10, 50, -1, 40, 52, 1, 'arm'), B(40, 30, -1, 41, 52, 1, 'hanger')];
/* a body with an arm and a hanger off it: one cluster, on the ground */
{ const m = K.analyse(body); ok('a body, its arm and what hangs from the arm stand as one', m.clusters === 1 && !m.floaters.length && m.mainLow < .6 && K.verdict(m).ok, K.verdict(K.analyse([B(-10, 3, -10, 10, 60, 10, 'body')])).ok); }
/* a piece that touches nothing */
{ const m = K.analyse(body.concat([B(60, 40, 0, 64, 44, 4, 'stub')])); ok('a stub in the air is a floater', m.floaters.length === 1 && m.floaters[0].src === 'stub' && !K.verdict(m).ok, K.analyse(body.concat([B(40.4, 40, -1, 44, 44, 1, 'stub')])).floaters.length > 0); }
/* wrecks: seated passes; lifted or buried fails */
{ const seated = K.analyse(body.concat([B(80, -.25, 0, 90, 1.5, 6, 'plate')])), lifted = K.analyse(body.concat([B(80, .45, 0, 90, 2, 6, 'plate')])), buried = K.analyse(body.concat([B(80, -2.5, 0, 90, -.5, 6, 'plate')]));
  ok('a wreck on its lowest point (0.25 m in) lies right', seated.wrecks === 1 && !seated.badWrecks.length && K.verdict(seated).ok);
  ok('a wreck 0.45 m off the ground lies wrong', lifted.badWrecks.length === 1, !K.verdict(lifted).ok === false);
  ok('a wreck 2.5 m into the ground lies wrong', buried.badWrecks.length === 1 && !K.verdict(buried).ok); }
/* the ground under a piece: on a slope, the lowest corner's ground decides (the analyser reads p.g; the host gives the lowest) */
{ const m = K.analyse(body.concat([B(80, 9.8, 0, 90, 11, 6, 'plate', 10)])); ok('a wreck on ground 10 m up is read against that ground', m.wrecks === 1 && !m.badWrecks.length && K.verdict(m).ok, K.verdict(K.analyse(body.concat([B(80, 9.8, 0, 90, 11, 6, 'plate', 0)]))).ok); }
/* a tall body sunk by design (a half-buried ring) is standing, not a bad wreck */
{ const m = K.analyse(body.concat([B(100, -40, 0, 120, 200, 20, 'ring')])); ok('a ring sunk 40 m by design stands; it is no wreck', m.standing === 1 && !m.badWrecks.length && K.verdict(m).ok, K.analyse(body.concat([B(100, -40, 0, 120, -20, 20, 'ring')])).badWrecks.length === 0); }
/* a tall body held by nothing floats */
{ const m = K.analyse(body.concat([B(100, 30, 0, 120, 200, 20, 'mast')])); ok('a tall body in the air floats', m.floaters.length === 1, K.analyse(body.concat([B(100, 0, 0, 120, 200, 20, 'mast')])).floaters.length === 1); }
console.log(fails ? 'FAILED ' + fails + ' of ' + n : 'all ' + n + ' passed'); process.exit(fails ? 1 : 0);
