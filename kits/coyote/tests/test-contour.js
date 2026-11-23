/* node kits/coyote/tests/test-contour.js: the contour script (src/32-cy-contour.js). Each negative is a fault and its fix
   (tools/ktest.js). */
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'kits', 'coyote', 'src', '32-cy-contour.js'), 'utf8'), { filename: '32-cy-contour.js' });

const A = cyContour('Hām-Hau. Lōk-Hau.');
T.ok('the same text gives the same line', JSON.stringify(cyContour('Hām-Hau. Lōk-Hau.')) === JSON.stringify(A), A.hash);
T.ok('a precomposed and a decomposed macron read the same', cyContour('Hām-Hau.').hash === cyContour('Hām-Hau.').hash);
T.neg('a different tone gives a different line', t => cyContour(t).hash !== A.hash, 'Hām-Hau. Lōk-Hau.', 'Hàm-Hau. Lōk-Hau.');
T.ok('one stroke a word, a howl a sentence', A.strokes.length === 2 && A.howls === 2, A.strokes.length + ' strokes, ' + A.howls + ' howls');
T.ok('every point inside the unit band, u never going back',
  A.strokes.every(s => s.pts.every(q => q[1] >= 0 && q[1] <= 1) && s.pts.every((q, i) => !i || q[0] >= s.pts[i - 1][0])));
T.ok('strokes do not overlap along the line', A.strokes.every((s, i) => !i || s.pts[0][0] > A.strokes[i - 1].pts[A.strokes[i - 1].pts.length - 1][0]));
const S = A.sylls;
T.ok('the syllables read: onset, vowel, tone, coda', S[0].onset === 'h' && S[0].vowel === 'a' && S[0].tone === 'level' && S[0].coda === 'm' &&
  S[1].vowel === 'au' && S[1].tone === 'short' && S[2].onset === 'l' && S[2].snap, JSON.stringify(S.map(s => [s.onset, s.vowel, s.tone, s.coda])));
const top = c => Math.max(...c.strokes[c.strokes.length - 1].pts.map(q => q[1]));
const tail = c => { const P = c.strokes[c.strokes.length - 1].pts; return P[P.length - 1][1]; };
T.neg('a sentence ends in the howl: up to the top, then down to the bottom', c => top(c) === 1 && tail(c) === 0,
  cyContour('Hau', { howl: false }), cyContour('Hau.'));
T.neg('a falling tone falls, a rising one rises', c => { const P = c.strokes[0].pts; return P[1][1] < P[0][1]; },
  cyContour('Háu', { howl: false }), cyContour('Hàu', { howl: false }));
T.neg('a snap onset cuts a spike above its base', c => Math.max(...c.strokes[0].pts.slice(0, 3).map(q => q[1])) > c.sylls[0].base / 4,
  cyContour('Hau', { howl: false }), cyContour('Tsau', { howl: false }));
T.ok('an empty text is an empty line', cyContour('').strokes.length === 0 && cyContour(null).length === 0);
T.done();
