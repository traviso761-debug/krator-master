/* The city plan's edits on core/host (ROADMAP.md section 10, step 6b): the log the editor writes (core/edits) read back
   as what the layout applies (targets/voth-city/35-vc-steps.js VC.editsFromLog). The proof that the page lays out the
   same: an old site/voth-city-edits.json, converted by KEDITS.fromStreetlab and read back, is the same file; the
   editor's own ops (place, remove, move, plant, paint) come back as the layout's entries.
   node settlements/voth/test-edits.js */
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '..', '..');
const KEDITS = require(path.join(ROOT, 'core', 'edits', '40-core-edits.js'));
/* VC.editsFromLog, lifted from its fragment (the rest of 35 needs the city builder) */
const src = fs.readFileSync(path.join(HERE, 'targets', 'voth-city', '35-vc-steps.js'), 'utf8');
const a = src.indexOf('VC.editsFromLog = function'), b = src.indexOf('\n};\n', a) + 4;
const VC = {}, SWBAY = { SPECIES: [{ key: 'cherry' }, { key: 'dragon' }] };
new Function('VC', 'SWBAY', src.slice(a, b))(VC, SWBAY);
let fail = 0;
const ok = (c, what, got) => { console.log((c ? '  ok   ' : '  FAIL ') + what + (c || got === undefined ? '' : '  (' + JSON.stringify(got) + ')')); if (!c) fail++; };
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

/* 1. an old file, converted and read back: the same buildings, streets, deletions and flora, in the same order */
{ const E = { site: 'voth', kind: 'city-edits', buildings: [{ key: 'voth_house_middle', v: 2, x: 50.5, z: 60, ry: 1.5708 }, { key: 'voth_shop', v: 0, x: -20, z: 4.2, ry: 0 }],
    streets: [{ cls: 'side', pts: [[0, 0], [10, 0], [20, 5]] }, { cls: 'lane', pts: [[100, 100], [130, 90]] }], del: [{ x: 0.4, z: -0.3 }, { x: 50.6, z: 60.1 }],
    flora: { del: [{ kind: 'tree', key: 'cherry', x: 1, z: 2 }], add: [{ kind: 'plant', key: 'fern', x: 3, z: 4, y: 1.5 }, { kind: 'tree', key: 'dragon', x: 5, z: 6, y: 0, H: 8 }] } };
  const back = VC.editsFromLog(KEDITS.fromStreetlab(E, 'voth-city'));
  ok(same(back.buildings, E.buildings), 'buildings come back as they were', back.buildings);
  ok(same(back.streets, E.streets), 'painted streets come back as they were', back.streets);
  ok(same(back.del, E.del), 'deletions come back as they were, one on a placed building too (a deletion by point, as the old file was laid)', back.del);
  ok(same(back.flora, E.flora), 'flora deletions and plantings come back with their kind, floor and height', back.flora);
  const old = { site: 'voth', flora: [{ key: 'cherry', x: 1, z: 2, del: true }, { key: 'fern', x: 3, z: 4 }] };
  const f2 = VC.editsFromLog(KEDITS.fromStreetlab(old)).flora;
  ok(f2.del[0].kind === 'tree' && f2.add[0].kind === 'plant', 'a flora entry without a kind: a tree when the swbay kit has the species, else a plant', f2);
}
/* 2. the owner's file (settlements/voth/edits.json, converted from site/voth-city-edits.json): nothing to apply */
{ const L = JSON.parse(fs.readFileSync(path.join(HERE, 'edits.json'), 'utf8'));
  const E = VC.editsFromLog(L);
  ok(L.format === 'krator-edits' && L.build === 'voth-city' && !E.buildings.length && !E.streets.length && !E.del.length && !E.flora.add.length && !E.flora.del.length,
    'the owner\'s edits.json is a krator-edits log for voth-city with nothing in it (the old file was empty)');
}
/* 3. the editor's ops */
{ const L = KEDITS.log('voth-city');
  KEDITS.add(L, { 'class': 'building', key: 'voth_shop', variant: 1, at: [10, 2, 20], ry: 0.5 });
  KEDITS.add(L, { 'class': 'infrastructure', kind: 'way', key: 'main', at: [0, 1, 0], pts: [[0, 0], [5, 5], [9, 3]] });
  KEDITS.add(L, { 'class': 'flora', kind: 'tree', key: 'cherry', at: [7, 3, 7], ry: 0 });
  KEDITS.move(L, { 'class': 'building', key: 'voth_shop', at: [10, 2, 20] }, [12, 2, 21], 0.7, { at: [10, 2, 20], ry: 0.5 });
  const mv = KEDITS.move(L, { 'class': 'building', key: 'voth_house_rich', at: [300, 4, 300] }, [310, 4, 305], 1.2, { at: [300, 4, 300], ry: 0 }); mv.v = 3;
  KEDITS.remove(L, { 'class': 'building', key: 'voth_house_poor', at: [400, 0, 400] }, null);
  KEDITS.remove(L, { 'class': 'flora', key: 'dragon', at: [9, 0, 9] }, null);
  let E = VC.editsFromLog(L);
  ok(same(E.buildings, [{ key: 'voth_shop', v: 1, x: 12, z: 21, ry: 0.7 }, { key: 'voth_house_rich', v: 3, x: 310, z: 305, ry: 1.2 }]),
    'a placed building moved stays one entry where it went; a building of the plan moved is placed where it went with its variant', E.buildings);
  ok(same(E.del, [{ x: 300, z: 300 }, { x: 400, z: 400 }]), 'a building of the plan moved is deleted where it stood; one removed is deleted', E.del);
  ok(same(E.streets, [{ cls: 'main', pts: [[0, 0], [5, 5], [9, 3]] }]) && E.flora.add.length === 1 && E.flora.add[0].y === 3 && same(E.flora.del, [{ kind: 'tree', key: 'dragon', x: 9, z: 9 }]),
    'a painted street, a tree planted on a floor 3 m up, a tree of the kit removed', E);
  KEDITS.remove(L, { 'class': 'building', key: 'voth_shop', at: [12, 2, 21] }, null);
  KEDITS.remove(L, { 'class': 'infrastructure', key: 'main', at: [0, 1, 0] }, null);
  KEDITS.remove(L, { 'class': 'flora', key: 'cherry', at: [7, 3, 7] }, null);
  E = VC.editsFromLog(L);
  ok(E.buildings.length === 1 && E.del.length === 2 && !E.streets.length && !E.flora.add.length,
    'removing what the log placed takes it back (no deletion left behind)', E);
  ok(VC.editsFromLog(null).buildings.length === 0 && VC.editsFromLog({ ops: [] }).del.length === 0, '  negative: no log, or an empty one, applies nothing');
  const Lx = KEDITS.log('x'); KEDITS.remove(Lx, { 'class': 'building', key: 'voth_shop', at: [12, 2, 21] }, null);
  ok(VC.editsFromLog(Lx).del.length === 1, '  negative: a removal with nothing placed before it in the log is a deletion, not ignored');
}
console.log(fail ? fail + ' FAILED' : 'all passed'); process.exit(fail ? 1 : 0);
