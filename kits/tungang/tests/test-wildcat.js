// node kits/tungang/tests/test-wildcat.js: Wildcat, the scrap pueblo, through the sealed bundle (tungang_bundle.py, TG) as a world
// loads it, without a browser: core/pueblo's plans (the great house, the two hamlets), registered in core/tags, drawn by
// TG.fg.pueblo on a knoll. Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const KIT = path.join(__dirname, '..'), ROOT = path.join(KIT, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('kits/catalog/three.min.js');
const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, "."); import tungang_bundle; sys.stdout.write(tungang_bundle.bundle(tex=False))'], { cwd: KIT, encoding: 'utf8', maxBuffer: 64 << 20 });
vm.runInThisContext(js, { filename: 'tungang_bundle.js' });
['core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
ok('the bundle loads with Wildcat in it (TG.fg.pueblo, KPUEBLO sealed)', typeof TG === 'object' && TG.errors.length === 0 && typeof TG.fg.pueblo === 'function' && typeof KPUEBLO === 'object',
  typeof fgWcPlan === 'undefined', TG.errors.join('; '));

// ---- the plans
const P = TG.fg.wildcat(), H = TG.fg.wildcatHamlets(), spec = TG.fg.wcSpec.GREAT;
const allOk = Q => { const c = KPUEBLO.checkAll(Q); return Object.keys(c).filter(k => !c[k].ok); };
ok('the great house: a D of Pueblo Bonito\'s scale (' + P.bounds.w.toFixed(0) + ' x ' + P.bounds.d.toFixed(0) + ' m, ' + P.census.rooms + ' rooms up to ' + P.census.maxStoreys + ' storeys), ' + P.census.pop + ' people, every check passing',
  P.shape === 'D' && P.bounds.w > 130 && P.bounds.w < 180 && P.census.pop >= 1000 && P.census.pop <= 2000 && P.census.maxStoreys >= 4 && !allOk(P).length && !P.errors.length,
  KPUEBLO.house(Object.assign({}, spec, { popMax: 600 })).census.over === true, allOk(P).join(', '));
ok('two small hamlets (' + H.map(h => h.id + ' ' + h.shape + ' ' + h.census.pop).join(', ') + '), their yards open', H.length === 2 && H.every(h => !allOk(h).length && h.census.pop >= 40 && h.census.pop <= 300 && h.plazas[0].open),
  !H.every(h => h.census.pop >= 1000));
ok('the round room in the west plaza, the stockade\'s ring with its gate', P.kivas.some(k => k.great && k.plaza === 'west') && P.enclosure && P.enclosure.gate && P.enclosure.pts.length > 100,
  !P.kivas.some(k => k.great && k.plaza === 'east'));

// ---- registered, then drawn on a knoll
const knoll = (x, z) => { const d = Math.hypot((x - 200) / 1.3, z + 40); return d < 70 ? 5 : d > 110 ? 0 : 5 * (110 - d) / 40; };
const T = KTAGS.create({ build: 'test-wildcat' }), o = { x: 200, z: -40, ry: 0.3, ground: knoll };
const reg = TG.fg.puebloRegister(P, T, o), kids = T.query({ parent: reg.house.id }), au = T.audit();
ok('registered before the draw: the house and ' + reg.count + ' children (rooms, kivas, ladders, plazas, dress, the stockade), the audit clean',
  kids.filter(k => k.kind === 'room').length === P.rooms.length && kids.length + T.query({ 'class': 'furniture' }).length === reg.count && au.unknown === 0 && au.missingCulture === 0,
  !(kids.filter(k => k.kind === 'room').length === P.rooms.length + 1), 'unknown ' + au.unknown);
const scene = new THREE.Group(), D = TG.fg.pueblo(P, Object.assign({ scene }, o)), house = D.recs.find(r => r.key === 'fg-wc-greathouse'), st = D.recs.find(r => r.key === 'fg-wc-stockade');
const c = TG.fg.check.pueblo(P, D.recs);
ok('TG.fg.pueblo draws every column, door, hatch and kiva (' + D.tris + ' triangles, ' + D.length + ' meshes), and the stockade (' + (st && st.fg.stakes) + ' stakes)',
  c.ok && D.length > 5 && st && st.fg.stakes > 300 && scene.children.length === 1 && TG.errors.length === 0, !TG.fg.check.pueblo(H[0], D.recs).ok, c.bad.concat(TG.errors).join('; '));
const top = Math.max(...P.hull.map(p => { const cs = Math.cos(.3), sn = Math.sin(.3); return knoll(200 + p[0] * cs + p[1] * sn, -40 - p[0] * sn + p[1] * cs); }), knoll(200, -40));
ok('on the knoll: the floor at the hull\'s highest ground (' + house.y.toFixed(2) + ' m), the stockade on the slope below (down to ' + st.bbox.mn[1].toFixed(2) + ')',
  Math.abs(house.y - top) < .02 && st.bbox.mn[1] < top - 2, !(Math.abs(house.y - (top - 3)) < .02));
const W = TG.fg.pueblo(P, { ground: knoll, x: 200, z: -40, ry: .3, state: 'worn' }), wf = W.recs[0].fg, kf = house.fg;
ok('the worn state: fewer facings and ladders (' + wf.faced + ' faces, ' + wf.ladders + ' ladders against ' + kf.faced + ' and ' + kf.ladders + ')', wf.faced < kf.faced * .8 && wf.ladders < kf.ladders * .6,
  !(kf.faced < kf.faced * .8));
const h0 = TG.fg.pueblo(H[0], { ground: () => 0, x: 0, z: 0 });
ok('a hamlet draws through the same API (' + h0.recs.map(r => r.key).join(', ') + ')', TG.fg.check.pueblo(H[0], h0.recs).ok && h0.recs[0].key === 'fg-wc-hamlet', !TG.fg.check.pueblo(P, h0.recs).ok);
// ---- Barricade: the wall across the pass
const PB = TG.fg.barricade(), bcOk = allOk(PB), gate = PB.passages.find(p => p.kind === 'gate'), culv = PB.passages.find(p => p.kind === 'culvert');
ok('Barricade: a wall across the pass (' + PB.bounds.w.toFixed(0) + ' x ' + PB.bounds.d.toFixed(0) + ' m, ' + PB.census.rooms + ' rooms up to ' + PB.census.maxStoreys + ' storeys, ' + PB.census.pop + ' people), a gate and a culvert under its rooms, every check passing',
  PB.shape === 'bar' && !bcOk.length && PB.census.pop >= 600 && PB.census.pop <= 2000 && gate && culv && gate.plaza === PB.plazas[0].id && PB.kivas.some(k => k.great), !(PB.shape === 'D'), bcOk.join(', '));
const TB = KTAGS.create({ build: 'test-barricade' }), ob = { x: -100, z: 50, ry: 0, ground: () => 2 }, rb = TG.fg.puebloRegister(PB, TB, ob);
const kb = TB.query({ parent: rb.house.id }), furn = TB.query({ 'class': 'furniture' });
ok('Barricade registered: its house (' + rb.house.key + '), ' + kb.filter(k => k.kind === 'room').length + ' rooms, its wrecks and gates as fixtures, ' + furn.length + ' pieces of furniture each under its room',
  rb.house.key === 'fg-bc-greathouse' && kb.filter(k => k.kind === 'room').length === PB.rooms.length && kb.filter(k => k.kind === 'wreck').length >= 40 && furn.length === PB.furniture.length && TB.audit().unknown === 0,
  !(furn.length === PB.furniture.length + 1), 'unknown ' + TB.audit().unknown);
const DB = TG.fg.pueblo(PB, Object.assign({ scene: new THREE.Group() }, ob)), hb = DB.recs.find(r => r.key === 'fg-bc-greathouse'), cb = TG.fg.check.pueblo(PB, DB.recs);
ok('TG.fg.pueblo draws Barricade (' + DB.tris + ' triangles): every room hollow, its wrecks (' + hb.fg.wrecks + '), gate and grates (' + hb.fg.gates + '), lookouts (' + hb.fg.lookouts + '), pickets (' + hb.fg.pickets + ')',
  cb.ok && hb.fg.rooms === PB.rooms.length && hb.fg.wrecks >= 40 && hb.fg.gates === 2 && hb.fg.lookouts === 2 && TG.errors.length === 0, !TG.fg.check.pueblo(PB, D.recs).ok, cb.bad.concat(TG.errors).join('; '));
const fcW = KPUEBLO.check.furniture(P), fcB = KPUEBLO.check.furniture(PB);
const bedShare = Q => { const H = Q.rooms.filter(r => r.use === 'home'), B = new Set(Q.furniture.filter(f => f.key === 'fellgang_common_sleeping_platform').map(f => f.room)); return H.filter(r => B.has(r.id)).length / H.length; };
ok('both great houses furnished room by room (' + P.furniture.length + ' and ' + PB.furniture.length + ' pieces; a sleeping platform in ' + (100 * bedShare(P)).toFixed(0) + ' % and ' + (100 * bedShare(PB)).toFixed(0) + ' % of the dwellings), each piece inside its room, clear of its door and hatch',
  fcW.ok && fcB.ok && P.furniture.length > 2000 && PB.furniture.length > 1500 && bedShare(P) > .9 && bedShare(PB) > .9, !(bedShare(P) > 1), fcW.bad.concat(fcB.bad).slice(0, 3).join('; '));

process.exit(bad ? 1 : 0);
