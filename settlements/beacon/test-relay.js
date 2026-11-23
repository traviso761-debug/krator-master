// node settlements/beacon/test-relay.js: the signal line's relay posts (src/42-bc-relay.js). Every check has a negative: a
// broken post, light or sight line must fail it and the real one pass.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
require('../../core/sched/20-core-sched.js');
const RELAY = require('./src/42-bc-relay.js');
const LAMP = require('./src/40-bc-lamp.js');
const H = 3600, D = 86400;
const night = t => { const h = ((t % D) + D) % D / H; return h >= 18 || h < 6; }, env = { night };
const post = RELAY.posts.find(p => p.id === 'rimpost');

/* 1. the Rim Post stands where the layout's relay is: about 17 km off, on the lamp's rimpost station's bearing */
const placed = p => !!p && Math.abs(p.km - 17) < 1.5 && Math.abs(p.bearing - LAMP.STATIONS.find(s => s.id === 'rimpost').bearing) < 1.5;
T.ok('the Rim Post is 17 km off on the rimpost station\'s bearing', placed(post), post && post.km.toFixed(2) + ' km at ' + post.bearing.toFixed(1) + ' deg, page ' + post.at.join(', '));
T.neg('a post with its axes swapped (east for south) is caught', placed, Object.assign({}, post, { bearing: (Math.atan2(-post.at[1], post.at[0]) * 180 / Math.PI + 360) % 360 }), post);

/* 2. its light shows on the lamp's slot to it, every night hour, never by day and never on another station's slot */
const lightRight = ans => { let on = 0;
  for (let t = 0; t < D; t += 15) { const a = ans('rimpost', t, env), s = LAMP.state(t, env), want = s.mode === 'signal' && s.station === 'rimpost';
    if (a.lit !== want) return false; if (a.lit) on++; }
  for (let h = 18; h < 30; h++) if (!ans('rimpost', (h % 24) * H + 60, env).lit) return false;
  return on > 0 && !ans('rimpost', 12 * H + 60, env).lit; };
T.ok('the Rim Post\'s light shows on the lamp\'s slot to it, each night hour, never by day', lightRight(RELAY.answering));
T.neg('a post that answers every station\'s slot is caught', lightRight, (id, t, e) => { const s = LAMP.state(t, e); return { lit: s.mode === 'signal' }; }, RELAY.answering);

/* 3. the sight line: over flat ground at sea level the 17 km line between two 30 m marks clears by 30 m less the curve's bulge
   (8.5 km squared over 2R, times 1 - k: 4.93 m); a 40 m hill half way stops it */
const a = [0, 30, 0], b = [0, 30, -17000], flat = () => 0, hill = (x, z) => Math.abs(z + 8500) < 300 ? 40 : 0;
const S = RELAY.sight(a, b, flat);
T.ok('the sight line takes the curve with refraction (25.07 m over flat ground)', Math.abs(S.clear - (30 - 8500 * 8500 / (2 * RELAY.R) * (1 - RELAY.K))) < .05 && Math.abs(S.clear - 25.07) < .05, S.clear.toFixed(2) + ' m');
const clears = g => RELAY.sight(a, b, g).clear >= 10;
T.neg('a hill in the line is caught', clears, hill, flat);
T.done();
