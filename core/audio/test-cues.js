// node core/audio/test-cues.js — the cue picker's contract (core/audio/PLAN.md step A3). Each check comes with a broken
// input that must fail.
const fs = require('fs'), path = require('path');
global.window = global;
eval(fs.readFileSync(path.join(__dirname, '..', 'rand', '08-core-rand.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '22-core-audio-cues.js'), 'utf8'));
let bad = 0; const ok = (name, pass, neg) => { const r = pass && !neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (its negative passed)' : '')); };

const clips = { a: { id: 'a', duration: 2 }, b: { id: 'b', duration: 3 }, c: { id: 'c', duration: 1 }, d: { id: 'd', duration: 4 } };
const cue = KCUE.clean({ id: 'sfx.combat.hit.metal', variants: [{ clip: 'a' }, { clip: 'b' }, { clip: 'c' }, { clip: 'd' }], noRepeat: 1, pitch: [-2, 2], gainDb: [-3, 0] });
const run = (c, n, seed, gap) => { const st = KCUE.state(), out = []; for (let i = 0; i < n; i++) { const f = KCUE.fire(c, st, i * (gap == null ? 1 : gap), seed); out.push(f); if (f) KCUE.done(st); } return out; };
const backToBack = picks => picks.some((p, i) => i && p && picks[i - 1] && p.variant === picks[i - 1].variant);

const twenty = run(cue, 20, 7);
ok('fired 20 times, never the same variant twice in a row', twenty.every(Boolean) && !backToBack(twenty),
  backToBack(run(KCUE.clean({ ...cue, noRepeat: 0 }), 200, 7)) === false);
ok('noRepeat 3 keeps the last three out', (() => { const p = run(KCUE.clean({ ...cue, noRepeat: 3 }), 400, 3).map(x => x.variant);
  return p.every((v, i) => i < 3 || (v !== p[i - 1] && v !== p[i - 2] && v !== p[i - 3])); })(),
  (() => { const p = run(KCUE.clean({ ...cue, noRepeat: 1 }), 400, 3).map(x => x.variant); return p.every((v, i) => i < 2 || v !== p[i - 2]); })());
ok('two variants alternate, one variant still plays', run(KCUE.clean({ id: 'sfx.ui.click', variants: [{ clip: 'a' }, { clip: 'b' }] }), 10, 1).map(x => x.variant).join('') .match(/^(01)+$|^(10)+$/) &&
  run(KCUE.clean({ id: 'sfx.ui.tick', variants: [{ clip: 'a' }] }), 5, 1).every(x => x && x.variant === 0), false);
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
ok('a seed replays the same picks; another seed does not', same(run(cue, 30, 11), run(cue, 30, 11)), same(run(cue, 30, 11), run(cue, 30, 12)));
ok('pitch and gain stay inside their ranges and vary', twenty.every(f => f.pitch >= -2 && f.pitch <= 2 && f.gain <= 1 && f.gain >= Math.pow(10, -3 / 20) - 1e-9) &&
  new Set(twenty.map(f => f.pitch.toFixed(3))).size > 10, twenty.every(f => f.pitch === twenty[0].pitch));
const heavy = KCUE.clean({ id: 'sfx.tool.axe', variants: [{ clip: 'a', weight: 9 }, { clip: 'b', weight: 1 }, { clip: 'c', weight: 1 }], noRepeat: 0 });
const counts = [0, 0, 0]; run(heavy, 3000, 5).forEach(f => counts[f.variant]++);
ok('weights decide how often a variant plays', counts[0] > 2 * (counts[1] + counts[2]) && counts[1] > 100 && counts[2] > 100, counts[0] < counts[1]);
const cool = KCUE.clean({ ...cue, cooldown: 0.5 }), cst = KCUE.state();
ok('a cooldown refuses plays that come too soon', KCUE.fire(cool, cst, 0, 1) && !KCUE.fire(cool, cst, 0.2, 1) && KCUE.fire(cool, cst, 0.6, 1), !KCUE.fire(KCUE.clean(cue), KCUE.state(), 0, 1));
const capped = KCUE.clean({ ...cue, maxVoices: 2 }), vst = KCUE.state();
ok('maxVoices caps overlapping plays until one ends', KCUE.fire(capped, vst, 0, 1) && KCUE.fire(capped, vst, 0, 1) && !KCUE.fire(capped, vst, 0, 1) && (KCUE.done(vst), KCUE.fire(capped, vst, 0, 1)),
  !KCUE.fire(KCUE.clean({ ...cue, maxVoices: 3 }), (() => { const s = KCUE.state(); s.voices = 2; return s; })(), 0, 1));
ok('variant fx add their pitch and volume', (() => { const c = KCUE.clean({ id: 'sfx.x.y', pitch: [0, 0], gainDb: [0, 0], variants: [{ clip: 'a', fx: { pitch: -12, vol: 0.5 } }] }); const f = KCUE.fire(c, KCUE.state(), 0, 1); return f.pitch === -12 && f.gain === 0.5; })(), false);
ok('falloff: full inside min, silent beyond max, quieter between', KCUE.falloff(cue, 1) === 1 && KCUE.falloff(cue, 50) === 0 && KCUE.falloff(cue, 10) < 1 && KCUE.falloff(cue, 10) > KCUE.falloff(cue, 30), KCUE.falloff(cue, 10) === 1);
ok('validate: a good cue passes', KCUE.validate(cue, clips).length === 0, KCUE.validate(cue, {}).length === 0);
ok('validate: bad id, no variants, unknown clip', KCUE.validate(KCUE.clean({ id: 'Hit Metal', variants: [] }), clips).length === 2 &&
  KCUE.validate(KCUE.clean({ id: 'sfx.a.b', variants: [{ clip: 'zz' }] }), clips).some(p => /not in the catalogue/.test(p)), KCUE.validate(cue, clips).some(p => /id/.test(p)));
ok('clean: untrusted numbers are clamped and fields filled', (() => { const c = KCUE.clean({ id: 'SFX.A.B', pitch: [50, -50], maxVoices: 999, bus: 'nope', variants: [{ clip: 'a', weight: -3, fx: { grit: 9, evil: 1 } }] });
  return c.id === 'sfx.a.b' && c.pitch[0] === -12 && c.pitch[1] === 12 && c.maxVoices === 32 && c.bus === 'sfx' && c.variants[0].weight === 0.1 && c.variants[0].fx.grit === 1 && !('evil' in c.variants[0].fx); })(), false);

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
