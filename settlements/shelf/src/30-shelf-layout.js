// ================================================================= SHELF — the layout ([G data])
// Shelf, the Line's north station town on the Outer Wall's north escarpment (settlements/shelf/PLAN.md section 5): the Ancients'
// cliff city (kits/ancients/cliff, KCLIFF: the kit's `targets/ledge` form) hung off an 850 m face, the station on the plateau, the
// shelf town at its foot. Every deck, part, lift, way, wreck heap and link as plain records keyed by stable ids. The one source: the
// page draws from it, shelf_blueprint.py draws the sheets and AREAS.md from it (through layout_dump.js), test-shelf.js checks it.
// No THREE, no DOM, no randomness here. Needs KCLIFF (kits/ancients/cliff/10-cliff-stack.js) loaded first.
//
// THE FRAME (PLAN.md 5.2): x along the face (toward azimuth 125: the south-east end), z out of it (toward 35: Dalab's plain), y metres
// above sea level; the origin on the face line at 5.1 px 461.43,1160.39. The record shapes are Ledge's (settlements/ledge, 30): a part
// ['box', x0, x1, z0, z1] at y, a deck 'd.<k>.<wing>', a link [a, b, {via, strike}], a heap KRUBBLE's parameters.
(function(root){
'use strict';
var KC = (typeof globalThis !== 'undefined' ? globalThis : root).KCLIFF;
var L = {
  format: 'shelf-layout', version: 1,
  frame: { x: 'along the face, toward azimuth 125 (the south-east end)', z: 'out of the face, toward azimuth 35 (Dalab\'s plain)', y: 'metres above sea level',
    origin: [461.43, 1160.39], azimuth: 35, pin: [461, 1161], note: 'PLAN.md 2 and 5.2' },
  world: 4610,
  // THE GROUND (SHELF.groundAt): the plateau's cut, the dressed face, the shelf, the lower escarpment, Dalab's plain
  ground: { head: 3680, bench: 600, rise: .09, top: 4400, dressed: 1100, run: 260, shelf: 2830, shelfFlat: 1200, shelfEdge: 2000, shelfEnd: 2780,
    shelfLen: 1600, plainZ: 8500, plain: 1450, plainFar: 1200, page: 3000, far: 12000 },
  // DALAB'S ROAD as cut into the ground (KCLIFF.roadCut): 6 m wide, held to 9 %, the cut eased back over 14 m each side (wider where deep)
  road: { w: 6, shoulder: 14, grade: .09 },
  // THE SHELL (PLAN.md 5.3): the target's numbers at Shelf
  stack: { n: 34, y0: 2980, pitch: 700 / 33, slab: 4, storey: 4.5, storeys: 3, plenum: 700 / 33 - 4 - 13.5, w0: 400, w1: 950, r0: 40, r1: 290, rExp: 1.4,
    root: 20, gallery: 6, cover: .7, prow: { wing: 'c', k0: 20, add: 130 },
    wings: [{ id: 'w3', f0: -.5, f1: -5 / 14, r: .7 }, { id: 'w2', f0: -5 / 14, f1: -3 / 14, r: .82 }, { id: 'w1', f0: -3 / 14, f1: -1 / 14, r: .94 },
            { id: 'c', f0: -1 / 14, f1: 1 / 14, r: 1 }, { id: 'e1', f0: 1 / 14, f1: 3 / 14, r: .94 }, { id: 'e2', f0: 3 / 14, f1: 5 / 14, r: .82 },
            { id: 'e3', f0: 5 / 14, f1: .5, r: .7 }] },
  zones: [
    { id: 'Z0', name: 'the plateau', k: null, note: 'the station, the caravan terminus, the fort, Dalab\'s town' },
    { id: 'Z1', name: 'the upper decks', k: [27, 33], note: 'the governor, the genepriests, the rich' },
    { id: 'Z2', name: 'the middle decks', k: [14, 26], note: 'the town on the decks; the pancaked wing' },
    { id: 'Z3', name: 'the lower decks', k: [0, 13], note: 'the sheared layers; the poor\'s decks over the shelf' },
    { id: 'Z4', name: 'the shelf', k: null, note: 'the shelf town, the yards, the halting place, the prow\'s wreck' }],
  // THE 10,000 (PLAN.md 5.4; the West Rift scope's "Shelf 10,000 by type")
  census: { total: 10000, zones: { Z0: 2500, Z1: 1500, Z2: 3000, Z3: 800, Z4: 2200 }, by: { dalab: 9400, tungang: 300, fellgang: 300 }, minM2: 15 },
  // THE LINE (PLAN.md 5.4): up the spirals inside the Wall from its low portal on Dalab's plain to the station under the plateau
  line: { portal: { y: 1400, note: 'the low portal on Dalab\'s plain, under the lower escarpment' },
    helix: { c: [0, -1400], r: 400, y0: 1400, y1: 3630, grade: .04, note: 'the spirals, inside the Wall behind Shelf' },
    approach: [[0, -1000, 3630], [0, -600, 3634], [0, -260, 3638], [0, -160, 3640]], station: 'station', grade: .04,
    bore: { to: [458, 1159], km: 7, note: 'on north-west along the Wall\'s top to the north portal (3,845 m), then the bore' } },
  decks: [], parts: [], lifts: [], ways: [], links: [], heaps: []
};
var S = L.stack, G = L.ground;
function layerY(k){ return KC.layerY(S, k); }

// ---------------------------------------------------------------- the decks, by the ruin table (PLAN.md 5.4); the later row wins
var RUIN = [
  // Z3 the lower decks
  ['w3 w2 w1 c e1 e2 e3', 0, 13, 'dead', 'none', 'empty and dark'],
  ['w1 c e1', 0, 3, 'reclaimed', 'dalab', 'the poor\'s decks over the shelf'],
  ['w3 e3', 4, 13, 'sealed', 'none', 'walled up'],
  ['e3 e2', 12, 13, 'sheared', 'none', 'sheared at the rock line; the decks lie on the shelf below'],
  // Z2 the middle decks: Dalab's town on the decks
  ['w3 w2 w1 c e1 e2 e3', 14, 26, 'reclaimed', 'dalab', 'the town on the decks: trades, homes, inns'],
  ['c', 14, 19, 'sheared', 'none', 'the gash, torn by the prow'],
  ['e3 e2', 14, 18, 'sheared', 'none', 'sheared at the rock line'],
  ['c', 20, 26, 'gone', 'none', 'the prow: fallen across the shelf town'],
  ['w3', 20, 26, 'pancaked', 'none', 'seven layers down onto the 19th'],
  ['w2', 22, 26, 'dead', 'none', 'empty beside the fallen wing'],
  // Z1 the upper decks
  ['w3 w2 w1 c e1 e2 e3', 27, 33, 'reclaimed', 'dalab', 'the governor, the genepriests, the rich'],
  ['c', 27, 33, 'gone', 'none', 'the prow\'s crown, fallen'],
  ['w1 e1', 30, 33, 'damaged', 'none', 'torn beside the gash'],
  ['w3', 27, 33, 'dead', 'none', 'empty above the fallen wing']];
var DECKFOLK = { 'Z1:dalab': 1500, 'Z2:dalab': 3000, 'Z3:dalab': 800 };
function zoneOf(k){ for (var i = 0; i < L.zones.length; i++){ var z = L.zones[i]; if (z.k && k >= z.k[0] && k <= z.k[1]) return z.id; } return null; }
L.decks = KC.decks(S, RUIN, zoneOf);
Object.keys(DECKFOLK).forEach(function(key){
  var zb = key.split(':'), list = L.decks.filter(function(d){ return d.zone === zb[0] && d.by === zb[1] && KC.LIVED.indexOf(d.state) >= 0; });
  KC.share(list, DECKFOLK[key], function(d){ return KC.deckFloor(S, d); });
});

// ---------------------------------------------------------------- the parts
function P(id, name, kind, shape, o){
  var p = { id: id, name: name, kind: kind, shape: shape }, k2;
  for (k2 in o) p[k2] = o[k2];
  if (p.y == null) p.y = 0; if (p.h == null) p.h = 0; if (p.ry == null) p.ry = 0; if (p.people == null) p.people = 0;
  if (p.state == null) p.state = 'reclaimed'; if (p.by == null) p.by = 'dalab';
  L.parts.push(p); return p;
}
var DEF = { dalab_hut_c: [12, 12], dalab_rowhouse: [20, 14], dalab_tenement: [16, 14], dalab_warehouse: [28, 20], dalab_granaries: [17, 14],
  dalab_inn: [32, 30], dalab_tavern: [26, 26], dalab_market_large: [64, 64], dalab_market_small: [28, 28], dalab_barracks: [36, 30],
  dalab_watchtower: [12, 12], dalab_gate: [28, 6], dalab_scribes: [24, 20], dalab_smithy: [20, 14], dalab_shops: [20, 14], dalab_bathhouse: [25, 23],
  dalab_mound: [76, 90], dalab_shrine: [8, 8], dalab_well: [10, 10], dalab_orchard: [22, 22], dalab_earthyard: [20, 15], dalab_workshop: [17, 12],
  dalab_potter: [18, 14], dalab_weaver: [16, 18], dalab_dyer: [18, 12], dalab_noble_b: [34, 34], dalab_compound: [20, 20], dalab_healers: [36, 28] };
function B(id, name, key, x, z, o){
  o = o || {}; var f = DEF[key], ry = o.ry || 0, q = Math.abs(Math.sin(ry)) > .5, w = q ? f[1] : f[0], d = q ? f[0] : f[1];
  return P(id, name, o.kind || 'building', ['box', x - w / 2, x + w / 2, z - d / 2, z + d / 2], Object.assign({ key: key, h: o.h != null ? o.h : 10 }, o, { ry: ry, by: o.by || 'dalab' }));
}
function row(prefix, name, keys, x0, x1, z, cell, o){
  var n = Math.floor((x1 - x0) / cell), out = [];
  for (var i = 0; i < n; i++) out.push(B(prefix + '_' + i, name, keys[i % keys.length], x0 + cell * (i + .5), z, o));
  return out;
}

// ---- Z0 THE PLATEAU (the cut at 3,680 m, 600 m deep): the station's hall over its platforms at the middle, the two lift halls either
//      side, the caravan terminus north-west, Dalab's town between, the fort south-east. Fronts face the edge (+z) unless turned
var HY = G.head, Z0 = { zone: 'Z0', y: HY };
function z0(o){ return Object.assign({}, Z0, o || {}); }
P('station', 'station 2, Shelf (the Line\'s north mouth: the platforms under the plateau, the spirals below them)', 'station', ['box', -160, 160, -260, -60],
  { zone: 'Z0', y: HY - 40, h: 30, key: 'anc:station', by: 'tungang', state: 'kept', people: 300, rock: true });
P('station_hall', 'the station\'s hall on the plateau (its stairs and lifts down to the platforms)', 'lifthall', ['box', -110, 110, -250, -150],
  z0({ key: 'anc:lifthall', h: 26, by: 'tungang', state: 'kept', people: 0 }));
B('head_customs', 'the customs house and the caravan office', 'dalab_scribes', 230, -110, z0({ people: 40 }));
P('head_lifthall_w', 'the west great lift\'s top hall', 'lifthall', ['box', -110, -50, -95, -20], z0({ key: 'anc:lifthall', h: 20, by: 'tungang', state: 'kept', people: 0 }));
P('head_lifthall_e', 'the east great lift\'s top hall', 'lifthall', ['box', 50, 110, -95, -20], z0({ key: 'anc:lifthall', h: 20, by: 'tungang', state: 'kept', people: 0 }));
// the caravan terminus (Dalab's road and the Great Caravan): yards, warehouses for the salt, the iron, the wine and the pearls, inns, the market
P('head_yard_caravan', 'the Great Caravan\'s yard', 'yard', ['box', -1050, -850, -560, -380], z0({ people: 0 }));
P('head_yard_beasts', 'the beasts\' yard', 'yard', ['box', -820, -660, -560, -400], z0({ people: 0 }));
row('head_stores', 'the terminus\'s warehouses (salt, iron, wine, pearls)', ['dalab_warehouse'], -1060, -620, -330, 36, z0({ people: 8 }));
B('head_inn_1', 'the caravanserai', 'dalab_inn', -560, -480, z0({ people: 60 }));
B('head_inn_2', 'the porters\' hostel', 'dalab_inn', -560, -400, z0({ people: 70, ry: Math.PI }));
B('head_market', 'the terminus market', 'dalab_market_large', -560, -250, z0({ people: 30 }));
B('head_gate', 'the north-west gate, where Dalab\'s road comes up onto the plateau', 'dalab_gate', -1090, -200, z0({ ry: Math.PI / 2, kind: 'gate', people: 0 }));
// Dalab's town on the plateau, the mound facing the lab (Dalab, azimuth 17: out over the face)
row('head_town_1', 'Dalab\'s town', ['dalab_rowhouse', 'dalab_tenement', 'dalab_rowhouse'], -480, 640, -560, 32, z0({ people: 60 }));
row('head_town_2', 'Dalab\'s town', ['dalab_tenement', 'dalab_rowhouse'], -480, 640, -515, 32, z0({ people: 60, ry: Math.PI }));
row('head_town_3', 'Dalab\'s town', ['dalab_rowhouse', 'dalab_tenement'], -480, -200, -440, 32, z0({ people: 60 }));
row('head_town_4', 'Dalab\'s town', ['dalab_tenement', 'dalab_rowhouse'], 200, 640, -440, 32, z0({ people: 60 }));
row('head_town_5', 'Dalab\'s town', ['dalab_rowhouse', 'dalab_tenement'], 200, 640, -395, 32, z0({ people: 60, ry: Math.PI }));
row('head_shops', 'the shops on the edge road', ['dalab_shops', 'dalab_workshop', 'dalab_smithy', 'dalab_weaver', 'dalab_potter'], 200, 640, -300, 32, z0({ people: 12 }));
B('head_mound', 'Shelf\'s mound, its temple facing the lab (Dalab, over the face)', 'dalab_mound', -320, -340, z0({ kind: 'mound', people: 0 }));
B('head_bath', 'the bathhouse', 'dalab_bathhouse', 260, -160, z0({ people: 10 }));
B('head_healers', 'the healers\' house', 'dalab_healers', 400, -160, z0({ people: 30 }));
row('head_granaries', 'the granaries (Dalab\'s grain south, the shelf\'s barley)', ['dalab_granaries'], -460, -200, -110, 30, z0({ people: 0 }));
// the fort (the gateway's garrison) at the south-east end
row('head_barracks', 'the garrison\'s barracks', ['dalab_barracks'], 700, 1060, -540, 42, z0({ people: 150 }));
B('head_tower_1', 'the fort\'s tower', 'dalab_watchtower', 720, -440, z0({ people: 0 }));
B('head_tower_2', 'the fort\'s tower', 'dalab_watchtower', 1040, -440, z0({ people: 0 }));
row('head_fort_rows', 'the garrison\'s families', ['dalab_rowhouse', 'dalab_tenement'], 700, 1060, -380, 30, z0({ people: 50 }));
B('head_tower_edge', 'the edge tower over the face', 'dalab_watchtower', 1000, -40, z0({ people: 0 }));
P('portal_head', 'the road tunnel\'s upper portal (the Ancients\' portal house, west of the north-west gate)', 'portal', ['box', -1272, -1240, -216, -184],
  z0({ key: 'anc:portal', face: 'x+', h: 14, by: 'dalab', state: 'kept', people: 0 }));

// ---- Z4 THE SHELF (the bench at 2,830 m): the foot lift halls at the face's base, the shelf town either side of the prow's wreck, the
//      caravans' yards and the sheep pens, the Travellers' halting place at the north-west end, the barley terraces
var AY = G.shelf, Z4 = { zone: 'Z4', y: AY };
function z4(o){ return Object.assign({}, Z4, o || {}); }
[['w', -1], ['e', 1]].forEach(function(s){
  P('foot_lifthall_' + s[0], 'the ' + (s[1] < 0 ? 'west' : 'east') + ' great lift\'s foot hall', 'lifthall', ['box', s[1] < 0 ? -130 : 30, s[1] < 0 ? -30 : 130, 1, 50],
    z4({ key: 'anc:lifthall', h: 18, by: 'tungang', state: 'kept', people: 0 }));
});
row('foot_town_w1', 'the shelf town (west)', ['dalab_rowhouse', 'dalab_tenement', 'dalab_hut_c'], -1000, -260, 120, 30, z4({ people: 60 }));
row('foot_town_w2', 'the shelf town (west)', ['dalab_tenement', 'dalab_rowhouse'], -1000, -260, 165, 30, z4({ people: 60, ry: Math.PI }));
row('foot_town_w3', 'the shelf town (west)', ['dalab_rowhouse', 'dalab_hut_c'], -1000, -260, 240, 30, z4({ people: 50 }));
row('foot_town_e1', 'the shelf town (east)', ['dalab_rowhouse', 'dalab_tenement', 'dalab_hut_c'], 300, 1000, 300, 30, z4({ people: 60 }));
row('foot_town_e2', 'the shelf town (east)', ['dalab_tenement', 'dalab_rowhouse'], 300, 1000, 345, 30, z4({ people: 60, ry: Math.PI }));
row('foot_trades', 'the carters\' and smiths\' row (salt and iron)', ['dalab_smithy', 'dalab_warehouse', 'dalab_workshop'], -1000, -260, 330, 34, z4({ people: 20 }));
B('foot_inn', 'the carters\' inn', 'dalab_inn', -200, 400, z4({ people: 60 }));
B('foot_market', 'the shelf market', 'dalab_market_small', 250, 470, z4({ people: 20 }));
row('foot_granaries', 'the barley granaries', ['dalab_granaries'], 300, 600, 470, 30, z4({ people: 0 }));
P('foot_yard_carts', 'the carters\' yard', 'yard', ['box', -1000, -820, 420, 560], z4({ people: 0 }));
P('foot_yard_sheep', 'the sheep pens', 'yard', ['box', 680, 900, 440, 600], z4({ people: 0 }));
P('foot_halting', 'the Travellers\' halting place (barrel-top wagons)', 'halting', ['box', -1340, -1120, 320, 540], z4({ by: 'fellgang', people: 300 }));
row('foot_terraces', 'the barley terraces', ['dalab_orchard'], -900, -500, 700, 30, z4({ people: 0, kind: 'terrace' }));
row('foot_terraces2', 'the barley terraces', ['dalab_orchard'], 400, 900, 760, 30, z4({ people: 0, kind: 'terrace' }));
B('foot_shrine', 'the shelf shrine', 'dalab_shrine', -230, 230, z4({ people: 0 }));
P('portal_shelf', 'the road tunnel\'s lower portal (the Ancients\' portico on the dressed face)', 'portal', ['box', -1074, -1046, 1, 13],
  z4({ key: 'anc:portal', face: 'z+', h: 16, by: 'dalab', state: 'kept', people: 0 }));

// ---- the census of the parts: the people above are weights, scaled to each zone's and people's total (largest remainders)
var PARTFOLK = { 'Z0:dalab': 2200, 'Z0:tungang': 300, 'Z4:dalab': 1900, 'Z4:fellgang': 300 };
Object.keys(PARTFOLK).forEach(function(key){
  var zb = key.split(':'), list = L.parts.filter(function(p){ return p.zone === zb[0] && p.by === zb[1] && p.people > 0; });
  KC.share(list, PARTFOLK[key], function(p){ return p.people; });
});

// ---------------------------------------------------------------- the lifts (PLAN.md 5.4)
var CAR = { w: 10, d: 16, h: 7, beasts: 6, t: 40, note: 'a wagon and its team, or six pack beasts and their loads' };
[['lift.g1', 'the east great lift', 80, 'e1'], ['lift.g2', 'the west great lift', -80, 'w1']].forEach(function(g){
  L.lifts.push({ id: g[0], kind: 'car', name: g[1], x: g[2], z: -40, w: 20, d: 14, y0: AY, y1: HY, runs: [AY, HY], state: 'runs', by: 'tungang', car: CAR,
    stops: ['shelf', 'd.2.' + g[3], 'd.16.' + g[3], 'd.28.' + g[3], 'plateau'], note: 'the Ancients\' lift in the rock behind the face; the stair in its shaft' });
});
[['core.p1', 'face core 1', -350, null, 'cut where the pancaked wing fell'], ['core.p2', 'face core 2', -150, 'runs', 'runs from the shelf decks to the plateau'],
 ['core.p3', 'face core 3', 150, 'runs', 'runs from the shelf decks to the plateau'], ['core.p4', 'face core 4', 350, null, 'cut at the shear']].forEach(function(c){
  L.lifts.push({ id: c[0], kind: 'core', name: c[1], x: c[2], z: 10, w: 12, d: 12, y0: layerY(0) - S.slab, y1: HY + S.pitch - S.slab,
    runs: c[3] ? [layerY(0) - S.slab, HY + S.pitch - S.slab] : null, state: c[3] || 'dead', by: c[3] ? 'dalab' : 'none', stops: [], note: c[4] });
});

// ---------------------------------------------------------------- the ways
/* Dalab's road: up the lower escarpment and across the shelf (between the Travellers' halting place and the carters' yard) to the
   Ancients' road tunnel's lower portal in the dressed face; the tunnel climbs the Wall in a helix to its upper portal on the plateau, west
   of the north-west gate (2026-11-22: the cliff's 850 m in 260 m is no road's; the old record's cut ramp is this tunnel) */
L.ways.push({ id: 'road', kind: 'road', name: 'Dalab\'s road: up the lower escarpment to the shelf and the tunnel\'s lower portal', by: 'dalab',
  pts: [[-1600, 9000, null], [-1500, 5000, null], [-1450, 2000, null], [-1060, 700, null], [-1060, 14, null]],
  note: 'switched back where the escarpment is steep and cut to 9 % (KCLIFF.roadCut)' });
/* the tunnel's record: its lower adit (pts 0 to 1: north from the portal into the Wall), the helix (1 to 2: entering and leaving the
   circle round c), its upper adit (2 to 3: to the portal house); every adit at the grade, the helix's length its climb over the grade */
var TUN = { c: [-1190, -420], r: 130, grade: .09 }, TP = [[-1060, 7, G.shelf], [-1060, -420], [-1190, -290], [-1256, -200, HY]];
TP[1][2] = G.shelf + Math.hypot(TP[1][0] - TP[0][0], TP[1][1] - TP[0][1]) * TUN.grade;
TP[2][2] = HY - Math.hypot(TP[3][0] - TP[2][0], TP[3][1] - TP[2][1]) * TUN.grade;
TUN.y0 = TP[1][2]; TUN.y1 = TP[2][2]; TUN.length = (TUN.y1 - TUN.y0) / TUN.grade; TUN.turns = TUN.length / (2 * Math.PI * TUN.r);
L.ways.push({ id: 'tunnel', kind: 'tunnel', name: 'the Ancients\' road tunnel: up the Wall in a helix from the shelf to the plateau', by: 'dalab',
  pts: TP, helix: TUN,
  note: 'in the rock: its two portals drawn, its bore a record (KCARVE comes with the interiors)' });
L.ways.push({ id: 'road.head', kind: 'road', name: 'Dalab\'s road from the tunnel\'s upper portal to the north-west gate', by: 'dalab',
  pts: [[-1238, -200, null], [-1040, -200, null]] });
['g1', 'g2'].forEach(function(g){
  var lf = L.lifts.filter(function(x){ return x.id === 'lift.' + g; })[0];
  L.ways.push({ id: 'stair.' + g, kind: 'stair', name: 'the stair in the ' + lf.name + '\'s shaft', by: 'tungang', pts: [[lf.x, lf.z, AY], [lf.x, lf.z, HY]], steps: Math.round((HY - AY) / .18) });
});
L.ways.push({ id: 'line', kind: 'line', name: 'the Line (segment S1): up the spirals to the station', by: 'tungang', pts: L.line.approach.map(function(p){ return [p[0], p[1], p[2]]; }) });

// ---------------------------------------------------------------- the wreck heaps (KRUBBLE)
L.heaps.push({ id: 'heap.prow', of: 'the prow (C, 20-33)', x: 0, z: 560, y0: AY, rx: 120, rz: 70, ry: .15, h: 34, lumps: 8, blocks: 22, cover: 8 });
L.heaps.push({ id: 'heap.shear', of: 'the sheared decks (E2 and E3, 12-18)', x: 230, z: 130, y0: AY, rx: 110, rz: 55, ry: 0, h: 22, lumps: 6, blocks: 16, cover: 7 });
L.heaps.push({ id: 'heap.rockfall', of: 'the rockfall south-east of the city', x: 1280, z: 130, y0: null, rx: 140, rz: 80, ry: -.2, h: 40, lumps: 7, blocks: 20, cover: 0, rock: true });

// ---------------------------------------------------------------- the links (the walk graph)
function K(a, b, o){ L.links.push([a, b, o || {}]); }
var LIVED = KC.LIVED, nW = S.wings.length;
function deck(k, w){ return L.decks[k * nW + S.wings.map(function(x){ return x.id; }).indexOf(w)]; }
for (var k3 = 0; k3 < S.n; k3++) for (var i = 0; i < nW - 1; i++){
  var a = L.decks[k3 * nW + i], b = L.decks[k3 * nW + i + 1];
  if (LIVED.indexOf(a.state) >= 0 && LIVED.indexOf(b.state) >= 0) K(a.id, b.id, { via: 'gallery' });
}
L.decks.forEach(function(d){ if (d.k + 1 >= S.n) return; var u = deck(d.k + 1, d.wing);
  if (LIVED.indexOf(d.state) >= 0 && LIVED.indexOf(u.state) >= 0 && d.by === u.by) K(d.id, u.id, { via: 'stairs' }); });
L.lifts.forEach(function(lf){
  if (lf.kind === 'car') for (var j = 0; j < lf.stops.length - 1; j++){
    K(lf.stops[j], lf.id, { via: 'lift', strike: true }); K(lf.id, lf.stops[j + 1], { via: 'lift', strike: true });
    K(lf.stops[j], 'stair.' + lf.id.slice(5), { via: 'stair', strike: true }); K('stair.' + lf.id.slice(5), lf.stops[j + 1], { via: 'stair', strike: true });
  }
});
/* the running face cores: the shelf decks' lowest lived layer to the top, where their decks are lived (a core passes every layer) */
L.lifts.filter(function(lf){ return lf.kind === 'core' && lf.runs; }).forEach(function(lf){
  L.decks.forEach(function(d){ var bx = KC.deckBox(S, d); if (lf.x >= bx.x0 && lf.x < bx.x1 && LIVED.indexOf(d.state) >= 0) K(lf.id, d.id, { via: 'core' }); });
  K(lf.id, 'plateau', { via: 'core' });
});
K('station', 'line', { via: 'platform' }); K('station', 'station_hall', { via: 'stairs' });
K('plateau', 'road.head', { via: 'the north-west gate' }); K('road.head', 'portal_head', { via: 'the road' }); K('portal_head', 'tunnel', { via: 'the upper portal' });
K('tunnel', 'portal_shelf', { via: 'the lower portal' }); K('portal_shelf', 'road', { via: 'the road' }); K('shelf', 'road', { via: 'the shelf town' });
L.parts.forEach(function(p){
  if (p.zone === 'Z0' && !p.in && !p.rock) K('plateau', p.id, { via: 'door' });
  else if (p.zone === 'Z4' && !p.in) K('shelf', p.id, { via: 'door' });
});
['w', 'e'].forEach(function(s){ var g = s === 'w' ? 'lift.g2' : 'lift.g1';
  K('head_lifthall_' + s, g, { via: 'lift hall', strike: true }); K('foot_lifthall_' + s, g, { via: 'lift hall', strike: true }); });

root.SHELF_LAYOUT = L;
})(typeof window !== 'undefined' ? window : globalThis);
