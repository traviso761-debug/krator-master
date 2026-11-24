#!/usr/bin/env node
/* kits/xanadu/tests/test-folk.js: the kit's static townsfolk stand down where a life layer draws the people (Stage 8 D19,
   S3-79a; src/72-xa-helpers.js xnFolk).
   1. without XA_NO_FOLK, xnFolk(x, y, z, n, s) puts n figures (a body and a head each) round (x, z) at height y;
   2. with XA_NO_FOLK = true it puts none;
   3. and it draws from the stream exactly as it does with them on, so the rest of the builder (every other piece) is the same;
   4. NEGATIVE: a stand-down that returns before its draws (the stream then moves) is caught.
     node kits/xanadu/tests/test-folk.js */
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', '72-xa-helpers.js'), 'utf8');
const line = SRC.split('\n').find(l => l.startsWith('function xnFolk('));
T.ok('72-xa-helpers.js has xnFolk on one line', !!line);

/* xnFolk from its source with the kit's globals stubbed: a seeded stream, kput recorded */
function make(src, noFolk) {
  const S = { draws: 0, puts: [], seed: 7 };
  const env = {
    rng: () => { S.draws++; S.seed = (S.seed * 16807) % 2147483647; return S.seed / 2147483647; },
    TAU: Math.PI * 2, qEuler: (a, b, c) => [a, b, c], xC: c => c, kput: (k, p) => S.puts.push([k, p[0], p[1], p[2]])
  };
  env.rr = (a, b) => a + (b - a) * env.rng();
  env.xPick = A => A[Math.floor(env.rng() * A.length)];
  const names = Object.keys(env);
  const fn = new Function(...names, 'XA_NO_FOLK', src + '\nreturn xnFolk;')(...names.map(k => env[k]), noFolk);
  return { fn, S, env };
}
const run = (src, noFolk) => { const m = make(src, noFolk); m.fn(4, 1.5, -2, 6, 3); const after = m.env.rng(); return { puts: m.S.puts, draws: m.S.draws, after }; };

if (line) {
  const on = run(line, undefined), off = run(line, true), no = run(line, false);
  T.ok('figures on by default: n bodies and n heads', on.puts.length === 12 && on.puts.filter(p => p[0] === 'figB').length === 6, on.puts.length + ' puts');
  T.ok('every figure at the given height, within the spread', on.puts.every(p => p[2] === 1.5 && Math.abs(p[1] - 4) <= 3 && Math.abs(p[3] + 2) <= 3));
  T.ok('XA_NO_FOLK = true: no figures', off.puts.length === 0, off.puts.length + ' puts');
  T.ok('XA_NO_FOLK false is not the switch', no.puts.length === 12);
  T.ok('stood down, the stream moves as with the figures on (the builder\'s next draw is the same)', off.draws === on.draws && off.after === on.after,
    off.draws + ' draws against ' + on.draws);
  /* the naive stand-down: return before the draws */
  const early = line.replace(/^function xnFolk\(x,y,z,n,spread\)\{/, 'function xnFolk(x,y,z,n,spread){if(typeof XA_NO_FOLK!==\'undefined\'&&XA_NO_FOLK===true)return;');
  T.neg('a stand-down that skips the draws is caught (the stream moves)', src => { const a = run(src, true), b = run(src, undefined); return a.puts.length === 0 && a.after === b.after; },
    early, line);
}
T.done();
