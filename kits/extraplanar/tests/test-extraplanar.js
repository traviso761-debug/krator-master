#!/usr/bin/env node
/* The extraplanar records in node (kits/extraplanar/xp-records.js on core/rand, core/space, core/tags): deterministic records,
   the drift path, the hum, the openness, the registry's "registered before drawn" with its negative, the silhouettes.
   Run: node kits/extraplanar/tests/test-extraplanar.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const ctx = { console, Math, module: { exports: {} }, require };
ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'kits/extraplanar/xp-records.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const XP = ctx.module.exports, KSPACE = ctx.KSPACE, KTAGS = ctx.KTAGS;   /* const XP at the top level is lexical, not on the context: the file exports it */
let fails = 0, n = 0;
function ok(c, msg) { n++; if (!c) { fails++; console.log('  FAIL ' + msg); } }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/* records: deterministic, within their ranges, every kind */
for (const k of XP.VOCAB.phenomena) {
  const a = XP.phenomenon(k, { at: [10, 2, -5], seed: 7 }), b = XP.phenomenon(k, { at: [10, 2, -5], seed: 7 }), c = XP.phenomenon(k, { at: [10, 2, -5], seed: 8 });
  ok(same(a, b), k + ': two records with one seed are identical');
  ok(!same(a, c), k + ': another seed is another record');
  ok(a.kind === 'phenomenon' && a['class'] === 'feature' && a.key === k && a.r > 0 && a.h > 0 && a.tags.origin === 'extraplanar', k + ': the record shape');
  ok(XP.VOCAB.drifts.indexOf(a.drift.mode) >= 0 && a.hum.hz > 0 && a.hum.loud > 0 && a.hum.loud <= 1 && a.hum.reach > 0, k + ': drift and hum');
}
const V = XP.phenomenon('void', { seed: 3 }), S = XP.phenomenon('solid', { seed: 3 }), P = XP.phenomenon('presence', { seed: 3 });
ok(V.look.eyes.length >= 3 && V.look.eyes.length <= 9, 'a void has 3 to 9 eyes (' + V.look.eyes.length + ')');
ok(XP.VOCAB.solids.indexOf(S.look.form) >= 0 && S.weather.tint && S.weather.tintR > 0 && S.weather.plume === 1, 'a solid has a form, a tint and a plume');
ok(P.look.stars.length >= 40 && P.drift.mode === 'still' && P.look.halo.r > 0, 'a presence is a still figure of stars with a halo');
let threw = false; try { XP.phenomenon('ghost'); } catch (e) { threw = true; } ok(threw, 'an unknown kind throws');
threw = false; try { XP.phenomenon('void', { state: 'asleep' }); } catch (e) { threw = true; } ok(threw, 'an unknown state throws');

/* the drift: deterministic in (seed, t), within its radius, still where still, the same at t for any history */
const p1 = XP.pose(V, 12.5), p2 = XP.pose(V, 12.5), p3 = XP.pose(V, 13.5);
ok(same(p1, p2), 'pose(t) is a pure function of (seed, t)');
ok(!same(p1.at, p3.at), 'a wanderer moves between t and t + 1');
let maxD = 0; for (let t = 0; t < 600; t += 0.37) { const p = XP.pose(V, t); maxD = Math.max(maxD, Math.hypot(p.at[0] - V.at[0], p.at[2] - V.at[2])); ok(p.at[1] >= V.at[1] + V.drift.y[0] - 1e-9 && p.at[1] <= V.at[1] + V.drift.y[1] + 1e-9, 'the height stays in drift.y'); }
ok(maxD <= V.drift.r + 1e-9 && maxD > V.drift.r * 0.3, 'a wanderer stays within drift.r and uses it (' + maxD.toFixed(1) + ' of ' + V.drift.r + ')');
const q1 = XP.pose(P, 5), q2 = XP.pose(P, 500);
ok(same(q1.at, q2.at) && q1.at[0] === P.at[0] && q1.at[2] === P.at[2], 'a still presence does not move');
ok(Math.abs(XP.pose(P, 5, [P.at[0] + 10, P.at[2]]).ry - Math.PI / 2) < 1e-9, 'a presence faces the eye it is given');
const orb = XP.phenomenon('solid', { seed: 11, drift: 'orbit', driftR: 10, speed: 1 });
let od = 0; for (let t = 0; t < 100; t += 1) { const p = XP.pose(orb, t); od = Math.max(od, Math.abs(Math.hypot(p.at[0] - orb.at[0], p.at[2] - orb.at[2]) - 10)); }
ok(od < 1e-9 && XP.pose(orb, 10).spin > 0, 'an orbiter keeps its radius and turns');
ok(XP.pose(XP.phenomenon('void', { seed: 5, state: 'latent' }), 9).open === 0, 'a latent phenomenon keeps its eyes shut');
let o0 = 1, o1 = 0; for (let t = 0; t < 200; t += 0.5) { const o = XP.pose(V, t).open; o0 = Math.min(o0, o); o1 = Math.max(o1, o); }
ok(o0 >= 0 && o1 <= 1 && o1 - o0 > 0.5, 'the eyes breathe between 0 and 1 (' + o0.toFixed(2) + '..' + o1.toFixed(2) + ')');

/* portals */
for (const k of XP.VOCAB.portals) {
  const a = XP.portal(k, { at: [1, 0, 2], seed: 4, state: 'open' }), b = XP.portal(k, { at: [1, 0, 2], seed: 4, state: 'open' });
  ok(same(a, b) && a.kind === 'portal' && a.size.length === 2 && a.size[1] > 0 && a.r > 0, k + ': deterministic, the shape');
  ok(XP.openness(a, 3) === 1 && XP.through(a) === null, k + ': open is 1, leads nowhere by default');
}
const shut = XP.portal('door', { seed: 1 }), dead = XP.portal('door', { seed: 1, state: 'dead' }), fl = XP.portal('tear', { seed: 9, state: 'flicker' });
ok(XP.openness(shut, 0) === 0 && XP.openness(dead, 0) > 0 && XP.openness(dead, 0) < 0.1, 'shut is 0, dead a residual');
let lo = 1, hi = 0, flips = 0, last = null; for (let t = 0; t < 400; t += 0.1) { const o = XP.openness(fl, t); lo = Math.min(lo, o); hi = Math.max(hi, o); const on = o > 0.5; if (last != null && on !== last) flips++; last = on; }
ok(lo >= 0 && hi <= 1 && lo < 0.3 && hi > 0.9 && flips > 10, 'a flickering portal flips on and off (' + flips + ' flips, ' + lo.toFixed(2) + '..' + hi.toFixed(2) + ')');
ok(same(fl.flicker, XP.portal('tear', { seed: 9, state: 'flicker' }).flicker), 'the flicker is the seed\'s');
const led = XP.portal('drowned', { seed: 2, state: 'open', leads: { station: 'city3', at: [100, 2, 300] } });
ok(XP.through(led).station === 'city3' && XP.through(led).at[2] === 300, 'a portal that leads somewhere says where');
threw = false; try { XP.portal('door', { leads: { station: 'x' } }); } catch (e) { threw = true; } ok(threw, 'leads without coordinates throws');
threw = false; try { XP.portal('door', { state: 'ajar' }); } catch (e) { threw = true; } ok(threw, 'an unknown portal state throws');

/* the registry: core/tags and core/space, registered before drawn, with the negative */
const T = KTAGS.create({ build: 'extraplanar-test' }), R = XP.registry.create({ tags: T, cell: 16 });
const rv = R.add(XP.phenomenon('void', { at: [0, 0, 0], seed: 1 })), rs = R.add(XP.phenomenon('solid', { at: [200, 0, 0], seed: 2, driftR: 0 }));
const rp = R.add(XP.portal('door', { at: [40, 0, 40], seed: 3, state: 'open' }));
ok(rv.id && rv.uid && rs.id && rp.id && rv.seq === 1 && rs.seq === 2 && rp.seq === 3, 'add gives ids, uids and a sequence');
ok(T.records.length === 3 && T.get(rv.id).kind === 'phenomenon' && T.get(rp.id)['class'] === 'feature', 'every record is in core/tags');
ok(T.audit().unknown === 0 && T.audit().missingTypes === 0, 'the tags are in the vocabulary (' + JSON.stringify(T.audit()).slice(0, 120) + ')');
ok(R.near(0, 0, 1).indexOf(rv) >= 0 && R.near(200, 0, 1).indexOf(rs) >= 0 && R.near(0, 0, 1).indexOf(rs) < 0, 'near() finds what is there and not what is not');
ok(R.near(rv.drift.r - 1, 0, 0).indexOf(rv) >= 0, 'a wanderer is filed under its whole range');
ok(R.phenomena().length === 2 && R.portals().length === 1 && R.get(rp.id) === rp, 'phenomena(), portals(), get()');
R.markDrawn(rv); R.markDrawn(rp);
ok(rv.drawnSeq > rv.seq && rp.drawnSeq > rp.seq && R.check().ok && R.check().drawn === 2, 'drawn after registered passes the check');
threw = false; try { R.markDrawn(XP.phenomenon('void', { seed: 99 })); } catch (e) { threw = true; } ok(threw, 'NEGATIVE: drawing an unregistered record throws');
threw = false; try { R.add(rv); } catch (e) { threw = true; } ok(threw, 'NEGATIVE: registering twice throws');
const R0 = XP.registry.create({ tags: null, cell: 16 });   /* no KTAGS registry handed in: KTAGS is on this page, so it makes one */
ok(R0.tags && R0.add(XP.portal('tear', { seed: 1 })).id, 'a registry made without tags makes its own core/tags registry');

/* the hum and the tint */
const hum0 = XP.humAt(0, 0, 10, R), humFar = XP.humAt(1000, 1000, 10, R);
ok(hum0 > 0 && hum0 <= 1 && humFar === 0, 'the hum is heard near a phenomenon and not a kilometre off (' + hum0.toFixed(2) + ')');
ok(XP.humAt(0, 0, 10, R) === hum0, 'the hum is a pure function of (place, t)');
const T2 = XP.registry.create({ tags: KTAGS.create({ build: 'x' }) }); T2.add(XP.phenomenon('void', { at: [0, 0, 0], seed: 1, state: 'latent' }));
ok(XP.humAt(0, 0, 3, T2) === 0, 'a latent phenomenon is silent');
ok(same(XP.tintAt(200, 0, R), rs.weather.tint) && XP.tintAt(900, 0, R) === null, 'the tint is the solid\'s inside its tintR and null outside');

/* the silhouettes */
for (const s of XP.VOCAB.silhouettes) {
  const S = XP.SILHOUETTES[s], B = XP.silhouetteBox(s);
  ok(S && S.h > 0 && S.parts.length >= 3 && S.parts.every(p => p.length >= 3 && p.every(q => q.length === 2 && isFinite(q[0] + q[1]))), s + ': polygons');
  ok(B[2] > -0.15 && B[2] < 0.6 && Math.abs(B[3] - S.h) < 0.35 * S.h, s + ': stands on the ground and reaches about its height (' + B.map(v => v.toFixed(1)).join(', ') + ')');
}
for (const k of ['xp_stilter', 'xp_haloed', 'xp_sunhead', 'xp_crawler']) ok(XP.VOCAB.silhouettes.indexOf(XP.silhouette(k)) >= 0, k + ' maps to a silhouette set');
ok(XP.silhouette('xp_nothing') === null, 'an unknown hunter maps to none');

console.log((fails ? 'FAIL ' : 'ok ') + n + ' checks, ' + fails + ' failed (kits/extraplanar records)');
process.exit(fails ? 1 : 0);
