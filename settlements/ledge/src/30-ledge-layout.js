// ================================================================= LEDGE — the layout ([G data])
// Ledge, the Realm of Dalab's half-ruined Ancient arcology on the West Rift's great lake (settlements/ledge/PLAN.md section 9):
// the shell's decks, the head's and the foot's buildings, the lifts, the ways, the wreck heaps and the links, as plain records
// keyed by stable ids. The one source: the page draws from it, ledge_blueprint.py draws the sheets and AREAS.md from it (through
// layout_dump.js), test-ledge.js checks it, Godot reads its export. No THREE, no DOM, no randomness here: what varies by seed
// (a deck's blocks, the wreck's pieces) is drawn by the page from KRAND by the record's id.
//
// THE FRAME (PLAN.md 9.2): x east along the face, z south out of it (the rock at z < 0), y metres above sea level. The origin is
// on the face line under the pin (scale model 5.1 px 437,1330). riftrim station 1's frame: the same x, its z = this z - 603.
//
// A DECK: one wing of one layer of the shell: {id 'd.<k>.<wing>', k, wing, zone, state, by, use, people}
//   its geometry is the stack's (LEDGE.deckBox, 31-ledge-rules.js); its state one of STATES; by who holds or lives on it
// A PART: {id, name, kind, shape ['box', x0, x1, z0, z1], y, h, ry, key, by, state, zone, people, in, note}
//   key: the builder: a Dalab set def (dalab_*), a Fellgang set def (fg-*), 'tg:<key>' (a Tungang def: a tagged stand-in until
//   the tg set merges), 'anc:<piece>' (the page's own Ancient pieces), or none (a yard, a field: drawn by the page)
//   ry: the front's turn (0: the door to +z, toward the edge or the lake); a quarter turn swaps the footprint's w and d
// A LIFT: {id, kind 'car' | 'core', name, x, z, w, d, y0, y1, stops, runs [y0, y1] or null, state, by, car, note}
// A WAY: {id, kind road | line | stair | rope | mole | walk, pts [[x, z, y]...], by, closed, note}
// A LINK: [a, b, {via, strike}]: a walker passes between a and b (ids of decks, parts, lifts, ways, or the two grounds 'head'
//   and 'apron'); strike: true when a Loj Fower strike shuts it (the great lifts and their stairs)
// A HEAP: a KRUBBLE heap's parameters {id, of, x, z, y0, rx, rz, ry, h, lumps, blocks, cover}: the debris of a fallen part
(function(root){
'use strict';
var L = {
  format: 'ledge-layout', version: 1,
  frame: { x: 'east along the face', z: 'south, out of the face (the rock at z < 0)', y: 'metres above sea level',
    pin: [437, 1330], model: 'sxyznayzgc', riftrimDz: -603, note: 'PLAN.md 9.2' },
  world: 4370,
  // THE GROUND (LEDGE.groundAt): the head's bench, the dressed face, the apron and the lake (PLAN.md 9.2)
  ground: { head: 1562, apron: 312, lake: 297, quay: 180, dressed: 750, bench: 700, escarp: .26, run: 380, shore: 40, page: 3000 },
  // THE SHELL (PLAN.md 9.3): layers at y0 + pitch k; a layer's width along the face and its reach out of the rock grow with k
  stack: { n: 42, y0: 332, pitch: 30, slab: 5, storey: 4.5, storeys: 4, plenum: 7, w0: 320, w1: 700, r0: 24, r1: 196, rExp: 1.5,
    root: 20, gallery: 6, cover: .7, prow: { wing: 'c', k0: 26, add: 120 },
    wings: [{ id: 'w2', f0: -.5, f1: -.3, r: .72 }, { id: 'w1', f0: -.3, f1: -.1, r: .9 }, { id: 'c', f0: -.1, f1: .1, r: 1 },
            { id: 'e1', f0: .1, f1: .3, r: .9 }, { id: 'e2', f0: .3, f1: .5, r: .72 }] },
  zones: [
    { id: 'Z0', name: 'the head', k: null, note: 'the bench at 1,562 m: Dalab and the Fellgangs, the road head' },
    { id: 'Z1', name: 'the crown', k: [37, 41], note: 'the gene bank, the governor, the hall: Dalab' },
    { id: 'Z2', name: 'the upper dead decks', k: [26, 36], note: 'the prow gone, the pancaked wing' },
    { id: 'Z3', name: 'the middle decks', k: [16, 25], note: 'the Line\'s station and Loj Fower' },
    { id: 'Z4', name: 'the lower dead decks', k: [6, 15], note: 'the sheared layers; salvagers' },
    { id: 'Z5', name: 'the foot', k: [0, 5], note: 'the foot decks, the apron, the harbour: Dalab and the Fellgangs' }],
  // THE 10,000 (PLAN.md 9.7): what the parts and decks must sum to
  census: { total: 10000, zones: { Z0: 3700, Z1: 900, Z2: 0, Z3: 1600, Z4: 300, Z5: 3500 },
    by: { dalab: 5700, fellgang: 2800, lojfower: 1500 }, minM2: 15 },
  // THE LINE (PLAN.md 9.6): the bore from the tableland's south portal down a helix inside the escarpment to the station
  line: { portal: { y: 3496, km: 41, note: 'the south portal on the tableland, 41 km north (5.1 px 439.5,1309.5)' },
    surface: { km: 42, fall: 0, note: 'the surface run (biomes/line PLAN.md); its last part descends into the helix bore' },
    helix: { c: [130, -1400], r: 400, y0: 3480, y1: 960, grade: .04, note: 'inside the upper escarpment, ~19 turns' },
    approach: [[130, -1000, 960], [130, -500, 945], [100, -120, 934], [100, -55, 932]], station: 'station', grade: .04 },
  decks: [], parts: [], lifts: [], ways: [], links: [], heaps: [], piers: []
};
var S = L.stack, G = L.ground;
function layerY(k){ return S.y0 + S.pitch * k; }

// ---------------------------------------------------------------- the decks: one per wing per layer, by the ruin table
// Each row: [wings, k0, k1, state, by, use]; the later row wins. PLAN.md 9.4 and 9.8.
var RUIN = [
  // Z5 the foot decks: Dalab west and centre, the Fellgangs east
  ['w2 w1 c', 0, 5, 'reclaimed', 'dalab', 'homes over the harbour'],
  ['e1 e2', 0, 5, 'reclaimed', 'fellgang', 'homes and net lofts'],
  ['c', 4, 5, 'damaged', 'none', 'crushed by the prow\'s fall'],
  // Z4 the lower dead decks
  ['w2 w1 c e1 e2', 6, 15, 'dead', 'none', 'empty and dark'],
  ['w2 w1', 8, 14, 'sheared', 'none', 'cut at the rock line; the decks lie on the apron below'],
  ['c', 6, 9, 'squatted', 'fellgang', 'the salvagers\' camp, up their ropes from the foot'],
  ['e2', 10, 15, 'sealed', 'none', 'walled up'],
  // Z3 the middle decks: Loj Fower round the station
  ['w1 c e1', 16, 25, 'kept', 'lojfower', 'Loj Fower\'s decks'],
  ['w2 e2', 16, 25, 'sealed', 'lojfower', 'shut by the loj'],
  ['c', 22, 25, 'sheared', 'none', 'the gash\'s foot, torn by the prow'],
  // Z2 the upper dead decks
  ['w2 w1 c e1 e2', 26, 36, 'dead', 'none', 'empty and dark'],
  ['c', 26, 36, 'gone', 'none', 'the prow: fallen to the apron and the shallows'],
  ['e2', 29, 35, 'pancaked', 'none', 'seven layers down onto the 28th'],
  ['w2', 26, 36, 'damaged', 'none', 'the prow\'s fall tore its outer bays'],
  ['w1', 33, 36, 'damaged', 'none', 'torn beside the gash'],
  ['e1', 34, 36, 'damaged', 'none', 'torn beside the gash'],
  // Z1 the crown
  ['w1', 37, 41, 'reclaimed', 'dalab', 'the gene bank\'s precinct: its gardens and pens; the vault in the rock behind'],
  ['e1', 37, 41, 'reclaimed', 'dalab', 'the governor\'s house and a lesser Hall of Reformation'],
  ['w2', 37, 41, 'dead', 'none', 'empty'],
  ['e2', 37, 41, 'sealed', 'dalab', 'sealed by the priests'],
  ['c', 37, 41, 'gone', 'none', 'the prow\'s crown, fallen']];
// the people on the inhabited decks, by zone and holder (the rest of each zone's census is in its parts)
var DECKFOLK = { 'Z5:dalab': 600, 'Z5:fellgang': 600, 'Z4:fellgang': 300, 'Z3:lojfower': 1500, 'Z1:dalab': 900 };
function zoneOf(k){ for (var i = 1; i < L.zones.length; i++){ var z = L.zones[i]; if (k >= z.k[0] && k <= z.k[1]) return z.id; } return null; }
for (var k = 0; k < S.n; k++) S.wings.forEach(function(w){
  var d = { id: 'd.' + k + '.' + w.id, k: k, wing: w.id, zone: zoneOf(k), state: null, by: 'none', use: '', people: 0 };
  RUIN.forEach(function(r){ if (k >= r[1] && k <= r[2] && r[0].split(' ').indexOf(w.id) >= 0){ d.state = r[3]; d.by = r[4]; d.use = r[5]; } });
  L.decks.push(d);
});
// each inhabited deck's people: its zone's share by its floor (largest remainders, so each group's sum is exact). The floor is
// the stack's: width x reach x cover x storeys (the same formula as LEDGE.deckFloor, which test-ledge.js holds equal)
function wingReach(k, w){ var t = k / (S.n - 1), r = (S.r0 + S.r1 * Math.pow(t, S.rExp)) * w.r;
  if (w.id === S.prow.wing && k >= S.prow.k0) r += S.prow.add * (k - S.prow.k0 + 1) / (S.n - S.prow.k0); return r; }
function wingWidth(k, w){ var t = k / (S.n - 1); return (S.w0 + (S.w1 - S.w0) * t) * (w.f1 - w.f0); }
function floorOf(d){ var w = S.wings.filter(function(x){ return x.id === d.wing; })[0]; return wingWidth(d.k, w) * wingReach(d.k, w) * S.cover * S.storeys; }
Object.keys(DECKFOLK).forEach(function(key){
  var zb = key.split(':'), list = L.decks.filter(function(d){ return d.zone === zb[0] && d.by === zb[1] && ['reclaimed', 'kept', 'squatted'].indexOf(d.state) >= 0; });
  var tot = list.reduce(function(a, d){ return a + floorOf(d); }, 0), n = DECKFOLK[key], given = 0;
  var share = list.map(function(d){ var q = n * floorOf(d) / tot; return { d: d, q: q, f: Math.floor(q) }; });
  share.forEach(function(s){ s.d.people = s.f; given += s.f; });
  share.slice().sort(function(a, b){ return (b.q - b.f) - (a.q - a.f) || (a.d.id < b.d.id ? -1 : 1); }).slice(0, n - given).forEach(function(s){ s.d.people++; });
});

// ---------------------------------------------------------------- the parts
function P(id, name, kind, shape, o){
  var p = { id: id, name: name, kind: kind, shape: shape }, k2;
  for (k2 in o) p[k2] = o[k2];
  if (p.y == null) p.y = 0; if (p.h == null) p.h = 0; if (p.ry == null) p.ry = 0; if (p.people == null) p.people = 0;
  if (p.state == null) p.state = 'reclaimed'; if (p.by == null) p.by = 'dalab';
  L.parts.push(p); return p;
}
// a building by its def's footprint (w along x, d along z before the turn), centred at (x, z)
var DEF = { dalab_hut_c: [12, 12], dalab_rowhouse: [20, 14], dalab_tenement: [16, 14], dalab_warehouse: [28, 20], dalab_granaries: [17, 14],
  dalab_inn: [32, 30], dalab_tavern: [26, 26], dalab_market_large: [64, 64], dalab_market_small: [28, 28], dalab_barracks: [36, 30],
  dalab_watchtower: [12, 12], dalab_gate: [28, 6], dalab_scribes: [24, 20], dalab_smithy: [20, 14], dalab_shops: [20, 14], dalab_bathhouse: [25, 23],
  dalab_mound: [76, 90], dalab_shrine: [8, 8], dalab_well: [10, 10], dalab_orchard: [22, 22], dalab_earthyard: [20, 15], dalab_workshop: [17, 12],
  dalab_potter: [18, 14], dalab_weaver: [16, 18], dalab_dyer: [18, 12], dalab_noble_b: [34, 34],
  'fg-hut': [6, 5], 'fg-house': [9, 6], 'fg-longhouse': [15, 6.5], 'fg-headhouse': [13, 8], 'fg-meethall': [18, 10], 'fg-store': [8, 6],
  'fg-smokehouse': [6, 5], 'fg-barn': [12, 7] };
var FGH = { 'fg-hut': 4.2, 'fg-house': 4.8, 'fg-longhouse': 5.2, 'fg-headhouse': 5.8, 'fg-meethall': 7, 'fg-store': 4.5, 'fg-smokehouse': 4.5, 'fg-barn': 5.5 };
function B(id, name, key, x, z, o){
  o = o || {}; var f = DEF[key], ry = o.ry || 0, q = Math.abs(Math.sin(ry)) > .5, w = q ? f[1] : f[0], d = q ? f[0] : f[1];
  var by = o.by || (key.indexOf('fg-') === 0 ? 'fellgang' : 'dalab');
  return P(id, name, o.kind || 'building', ['box', x - w / 2, x + w / 2, z - d / 2, z + d / 2],
    Object.assign({ key: key, ry: ry, by: by, h: FGH[key] || o.h || 10 }, o, { ry: ry, by: by }));
}
// a row of buildings: keys cycled by index (no randomness), each centred in its cell, fronts toward +z (ry 0) or -z (ry PI)
function row(prefix, name, keys, x0, x1, z, cell, o){
  var n = Math.floor((x1 - x0) / cell), out = [];
  for (var i = 0; i < n; i++){ var key = keys[i % keys.length]; out.push(B(prefix + '_' + i, name, key, x0 + cell * (i + .5), z, o)); }
  return out;
}

// ---- Z0 THE HEAD (y 1,562): west the gate and the fort, then the road head, the lift hall at the middle, Dalab's town and mound
//      east of it, the Fellgang quarter at the east end. Fronts face the edge (+z) unless turned
var HY = G.head, Z0 = { zone: 'Z0', y: HY };
function z0(o){ return Object.assign({}, Z0, o || {}); }
B('head_gate', 'the west gate, where Dalab\'s road comes onto the bench', 'dalab_gate', -790, -300, z0({ ry: Math.PI / 2, kind: 'gate', people: 0 }));
row('head_barracks', 'the garrison\'s barracks', ['dalab_barracks'], -745, -585, -470, 40, z0({ people: 150 }));
row('head_fort_store', 'the garrison\'s granaries', ['dalab_granaries'], -745, -625, -420, 30, z0({ people: 0 }));
B('head_tower_w', 'the fort\'s west tower', 'dalab_watchtower', -760, -560, z0({ people: 0 }));
B('head_tower_e', 'the fort\'s east tower', 'dalab_watchtower', -580, -560, z0({ people: 0 }));
B('head_tower_edge', 'the edge tower over the face', 'dalab_watchtower', -700, -40, z0({ people: 0 }));
row('head_fort_rows', 'the garrison\'s families', ['dalab_rowhouse', 'dalab_tenement'], -745, -565, -360, 30, z0({ people: 50 }));
row('head_fort_rows2', 'the garrison\'s families', ['dalab_tenement', 'dalab_rowhouse'], -745, -565, -300, 30, z0({ people: 50, ry: Math.PI }));
P('head_yard_1', 'the caravan yard (the road\'s wagons)', 'yard', ['box', -540, -420, -560, -440], z0({ people: 0 }));
P('head_yard_2', 'the beasts\' yard (lizards and pack beasts)', 'yard', ['box', -400, -280, -560, -440], z0({ people: 0 }));
row('head_stores', 'the road head\'s warehouses', ['dalab_warehouse'], -540, -260, -400, 35, z0({ people: 8 }));
B('head_inn_1', 'the caravanserai inn', 'dalab_inn', -500, -330, z0({ people: 60 }));
B('head_inn_2', 'the porters\' hostel', 'dalab_inn', -450, -250, z0({ people: 80, ry: Math.PI }));
B('head_tavern', 'the road\'s tavern', 'dalab_tavern', -400, -320, z0({ people: 12 }));
B('head_market', 'the road head\'s market', 'dalab_market_large', -310, -270, z0({ people: 30 }));
row('head_rows_w', 'porters\' and drovers\' rows', ['dalab_rowhouse', 'dalab_tenement'], -560, -240, -160, 32, z0({ people: 40 }));
row('head_rows_w2', 'porters\' and drovers\' rows', ['dalab_tenement', 'dalab_rowhouse'], -560, -240, -100, 32, z0({ people: 40, ry: Math.PI }));
P('head_lifthall', 'the top lift hall (the great lifts\' heads; passage paid here)', 'lifthall', ['box', -150, 150, -110, -20],
  z0({ key: 'anc:lifthall', h: 28, by: 'lojfower', state: 'kept', people: 0, note: 'Ancient; Loj Fower\'s, Dalab\'s customs at its doors' }));
P('head_winding', 'the winding house (Loj Fower\'s machine room, kept by rite)', 'machine', ['box', -60, 60, -100, -64],
  z0({ key: 'tg:tg_lift_head', in: 'head_lifthall', y: HY + 28, h: 14, by: 'lojfower', state: 'kept', people: 0 }));
B('head_customs', 'the customs house and the caravan office', 'dalab_scribes', -195, -60, z0({ people: 40 }));
row('head_granaries', 'the granaries (the basin\'s grain, up the lifts)', ['dalab_granaries'], -150, 150, -150, 30, z0({ people: 0 }));
B('head_bath', 'the bathhouse', 'dalab_bathhouse', 200, -60, z0({ people: 10 }));
B('head_smithy_1', 'a bronze smithy', 'dalab_smithy', -200, -200, z0({ people: 10 }));
B('head_smithy_2', 'a copper smithy', 'dalab_smithy', -200, -240, z0({ people: 10 }));
row('head_shops', 'the shops on the edge road', ['dalab_shops', 'dalab_workshop', 'dalab_potter', 'dalab_weaver', 'dalab_dyer'], 180, 500, -110, 32, z0({ people: 12 }));
row('head_town_1', 'Dalab\'s town', ['dalab_rowhouse', 'dalab_tenement', 'dalab_rowhouse'], -150, 330, -210, 30, z0({ people: 60 }));
row('head_town_2', 'Dalab\'s town', ['dalab_tenement', 'dalab_rowhouse'], -150, 330, -255, 30, z0({ people: 60, ry: Math.PI }));
row('head_town_3', 'Dalab\'s town', ['dalab_rowhouse', 'dalab_tenement'], -150, 330, -320, 30, z0({ people: 60 }));
row('head_town_4', 'Dalab\'s town', ['dalab_tenement', 'dalab_rowhouse'], -150, 270, -365, 30, z0({ people: 60, ry: Math.PI }));
B('head_mound', 'Ledge\'s mound, its temple facing the lab (north by a little east)', 'dalab_mound', 380, -470, z0({ ry: Math.PI, kind: 'mound', people: 0 }));
B('head_shrine', 'the edge shrine', 'dalab_shrine', 240, -150, z0({ people: 0 }));
B('head_well_1', 'a well', 'dalab_well', -270, -195, z0({ people: 0 }));
B('head_well_2', 'a well', 'dalab_well', 360, -260, z0({ people: 0 }));
// the Fellgang quarter: the Travellers' halting place (their barrel-top wagons), houses in short rows round the meeting hall
P('head_halting', 'the Travellers\' halting place (barrel-top wagons)', 'halting', ['box', 560, 800, -640, -500], z0({ by: 'fellgang', people: 390 }));
B('head_fg_hall', 'the Fellgangs\' meeting hall', 'fg-meethall', 680, -440, z0({ people: 0 }));
B('head_fg_head', 'the head\'s house', 'fg-headhouse', 620, -440, z0({ people: 10 }));
row('head_fg_r1', 'the Fellgang quarter', ['fg-house', 'fg-longhouse', 'fg-house', 'fg-hut'], 540, 820, -380, 20, z0({ people: 0 }));
row('head_fg_r2', 'the Fellgang quarter', ['fg-longhouse', 'fg-house', 'fg-hut', 'fg-house'], 540, 820, -340, 20, z0({ people: 0, ry: Math.PI }));
row('head_fg_r3', 'the Fellgang quarter', ['fg-house', 'fg-hut', 'fg-house', 'fg-longhouse'], 540, 820, -280, 20, z0({ people: 0 }));
row('head_fg_r4', 'the Fellgang quarter', ['fg-hut', 'fg-house', 'fg-longhouse', 'fg-house'], 540, 820, -240, 20, z0({ people: 0, ry: Math.PI }));
row('head_fg_r5', 'the porters\' stores and barns', ['fg-barn', 'fg-store', 'fg-barn', 'fg-smokehouse'], 540, 820, -170, 22, z0({ people: 0 }));
row('head_fg_r6', 'the Fellgang quarter', ['fg-house', 'fg-longhouse', 'fg-hut'], 540, 820, -110, 20, z0({ people: 0, ry: Math.PI }));

// ---- Z1 THE CROWN: the gene bank's vault in the rock behind the W1 decks (its door on deck 39 W1)
P('crown_vault', 'the gene bank\'s cold vault (Ancient; the rim\'s engineered seed)', 'vault', ['box', -190, -90, -150, -30],
  { zone: 'Z1', y: layerY(38), h: 70, key: 'anc:vault', by: 'dalab', state: 'sealed', people: 0, in: null, rock: true, deck: 'd.39.w1',
    note: 'sealed to all but the priests' });

// ---- Z3 THE MIDDLE DECKS: the Line's station in the rock behind C and E1 at k 20, its concourse on the decks; Loj Fower's
//      buildings (the tg set's keys) on their decks, stand-ins until the set merges
P('station', 'station 4, Ledge (the Line\'s platforms in the rock; the bore\'s mouth on deck 20)', 'station', ['box', -40, 240, -90, -20],
  { zone: 'Z3', y: layerY(20), h: 30, key: 'anc:station', by: 'lojfower', state: 'kept', people: 0, rock: true, deck: 'd.20.e1' });
P('station_customs', 'Dalab\'s customs at the station', 'office', ['box', 150, 230, -84, -60],
  { zone: 'Z3', y: layerY(20), h: 9, by: 'dalab', state: 'reclaimed', people: 100, in: 'station', key: 'anc:office' });
[['loj_hall', 'Loj Fower\'s hall (its count wall, the Book)', 'tg:tg_loj_hall', 'd.18.c'],
 ['loj_beds', 'the dark beds', 'tg:tg_dark_beds', 'd.17.w1'],
 ['loj_wax', 'the wax house', 'tg:tg_wax_house', 'd.17.e1'],
 ['loj_signal', 'the signal box over the station', 'tg:tg_signal_box', 'd.21.e1'],
 ['loj_cistern', 'the cistern (the springs\' water)', 'tg:tg_cistern', 'd.16.c']].forEach(function(t){
  P(t[0], t[1], 'tg', null, { zone: 'Z3', deck: t[3], key: t[2], by: 'lojfower', state: 'kept', people: 0, note: 'inside its deck: a stand-in until the tg set merges' });
});

// ---- Z5 THE FOOT (the apron at 312 m): the foot lift hall under the shell, the Dalab quarter west, the Fellgangs east, the
//      harbour and its mole east of the prow's wreck, the terraces at both ends
var AY = G.apron, Z5 = { zone: 'Z5', y: AY };
function z5(o){ return Object.assign({}, Z5, o || {}); }
P('foot_lifthall', 'the foot lift hall (the great lifts\' feet, under the lowest deck)', 'lifthall', ['box', -150, 150, 1, 40],
  z5({ key: 'anc:lifthall', h: 14, by: 'lojfower', state: 'kept', people: 0 }));
row('foot_dalab_1', 'the foot\'s Dalab quarter', ['dalab_rowhouse', 'dalab_tenement'], -560, -280, 40, 30, z5({ people: 70 }));
row('foot_dalab_2', 'the foot\'s Dalab quarter', ['dalab_tenement', 'dalab_rowhouse'], -560, -280, 85, 30, z5({ people: 70, ry: Math.PI }));
row('foot_dalab_3', 'the foot\'s Dalab quarter', ['dalab_rowhouse', 'dalab_hut_c', 'dalab_tenement'], -560, -280, 140, 30, z5({ people: 54 }));
row('foot_granaries', 'the foot\'s granaries (the basin\'s grain, waiting for the lifts)', ['dalab_granaries'], -260, -170, 160, 30, z5({ people: 0 }));
B('foot_inn', 'the boatmen\'s inn', 'dalab_inn', 150, 70, z5({ people: 60 }));
B('foot_market', 'the fish market', 'dalab_market_small', 160, 140, z5({ people: 20 }));
B('foot_store_1', 'the harbour warehouse', 'dalab_warehouse', 260, 155, z5({ people: 10 }));
B('foot_shrine', 'the shore shrine', 'dalab_shrine', -265, 115, z5({ people: 0 }));
P('foot_mole', 'the harbour mole (Ancient; the boats to Nulab)', 'mole', ['box', 300, 340, 180, 440], z5({ key: 'anc:mole', h: 0, by: 'dalab', state: 'reclaimed', y: AY, people: 0, lake: true }));
row('foot_fg_1', 'the foot\'s Fellgang quarter', ['fg-house', 'fg-longhouse', 'fg-house'], 330, 560, 40, 20, z5({ people: 0 }));
row('foot_fg_2', 'the foot\'s Fellgang quarter', ['fg-longhouse', 'fg-house', 'fg-hut'], 330, 560, 80, 20, z5({ people: 0, ry: Math.PI }));
row('foot_fg_3', 'the smokehouses and net stores', ['fg-smokehouse', 'fg-store', 'fg-smokehouse', 'fg-barn'], 380, 560, 135, 18, z5({ people: 0 }));
B('foot_fg_hall', 'the foot\'s meeting hall', 'fg-meethall', 600, 60, z5({ people: 0 }));
B('foot_fg_head', 'the foot head\'s house', 'fg-headhouse', 600, 110, z5({ people: 10 }));
row('foot_terrace_w', 'the west terraces (orchards, the gene bank\'s beds)', ['dalab_orchard'], -700, -580, 60, 30, z5({ people: 0, kind: 'terrace' }));
row('foot_terrace_w2', 'the west terraces (mist tea)', ['dalab_orchard'], -700, -580, 120, 30, z5({ people: 0, kind: 'terrace' }));
row('foot_terrace_e', 'the east terraces (mist tea)', ['dalab_orchard'], 620, 710, 60, 30, z5({ people: 0, kind: 'terrace' }));
row('foot_terrace_e2', 'the east terraces (orchards)', ['dalab_orchard'], 620, 710, 120, 30, z5({ people: 0, kind: 'terrace' }));

// ---- the census of the Fellgang houses (fixed per key; the halting place and the hall carry the rest)
var FGP = { 'fg-hut': 4, 'fg-house': 6, 'fg-longhouse': 12 };
L.parts.forEach(function(p){ if (p.by === 'fellgang' && FGP[p.key] && !p.people) p.people = FGP[p.key]; });
// each zone's and people's total in the parts (PLAN.md 9.7 less what lives on the decks): the people set above are weights,
// scaled to the total by largest remainders, so the sums are exact and a part's share stays as written
var PARTFOLK = { 'Z0:dalab': 2700, 'Z0:fellgang': 1000, 'Z3:dalab': 100, 'Z5:dalab': 1400, 'Z5:fellgang': 900 };
Object.keys(PARTFOLK).forEach(function(key){
  var zb = key.split(':'), list = L.parts.filter(function(p){ return p.zone === zb[0] && p.by === zb[1] && p.people > 0; });
  var tot = list.reduce(function(a, p){ return a + p.people; }, 0), n = PARTFOLK[key], given = 0;
  var share = list.map(function(p){ var q = n * p.people / tot; return { p: p, q: q, f: Math.floor(q) }; });
  share.forEach(function(s){ s.p.people = s.f; given += s.f; });
  share.slice().sort(function(a, b){ return (b.q - b.f) - (a.q - a.f) || (a.p.id < b.p.id ? -1 : 1); }).slice(0, n - given).forEach(function(s){ s.p.people++; });
});

// ---------------------------------------------------------------- the lifts (PLAN.md 9.5)
var CAR = { w: 10, d: 16, h: 7, beasts: 6, t: 40, note: 'a wagon and its team, or six pack beasts and their loads' };
[['lift.g1', 'the east great lift', 120], ['lift.g2', 'the west great lift', -120]].forEach(function(g){
  L.lifts.push({ id: g[0], kind: 'car', name: g[1], x: g[2], z: -30, w: 20, d: 14, y0: AY, y1: HY, runs: [AY, HY], state: 'runs', by: 'lojfower',
    car: CAR, stops: ['apron', 'd.2.' + (g[2] > 0 ? 'e2' : 'w2'), 'd.20.' + (g[2] > 0 ? 'e1' : 'w1'), 'd.39.' + (g[2] > 0 ? 'e1' : 'w1'), 'head'],
    note: 'the Ancients\' rail-car lift; counterweighted, driven from the winding house; its stair in the shaft\'s core' });
});
// the face cores (12 m towers on the face, through the decks): drawn where the deck they pass is sound
[['core.p1', 'face core 1', -140, 'cut', null, 'cut at the shear (k 8-14)'],
 ['core.p2', 'face core 2', -50, 'gone', null, 'went with the prow above the gash'],
 ['core.p3', 'face core 3 (the priests\' lift)', 50, 'runs', [layerY(37), HY], 'runs between the crown and the head; dead below'],
 ['core.p4', 'face core 4', 140, 'dead', null, 'dead, its cars at the bottom']].forEach(function(c){
  L.lifts.push({ id: c[0], kind: 'core', name: c[1], x: c[2], z: 10, w: 12, d: 12, y0: layerY(0) - S.slab, y1: HY + S.pitch - S.slab, runs: c[4],
    state: c[3], by: c[3] === 'runs' ? 'dalab' : 'none', stops: c[3] === 'runs' ? ['d.37.' + 'e1', 'd.39.e1', 'd.41.e1', 'head'] : [], note: c[5] });
});

// ---------------------------------------------------------------- the ways
L.ways.push({ id: 'road', kind: 'road', name: 'Dalab\'s road down the upper escarpment', by: 'dalab',
  pts: [[-2900, -2900, null], [-2200, -2300, null], [-1600, -1500, null], [-1200, -900, null], [-900, -400, null], [-805, -300, null]],
  note: 'from the tableland and the Geit Riba\'s gorge (switchbacks off the page); its last 15 km the strike\'s raid ground' });
['g1', 'g2'].forEach(function(g){
  var lf = L.lifts.filter(function(x){ return x.id === 'lift.' + g; })[0];
  L.ways.push({ id: 'stair.' + g, kind: 'stair', name: 'the stair in the ' + lf.name + '\'s shaft', by: 'lojfower', pts: [[lf.x, lf.z, AY], [lf.x, lf.z, HY]],
    steps: Math.round((HY - AY) / .18), note: 'Loj Fower\'s: a strike closes it' });
});
L.ways.push({ id: 'rope.salvage', kind: 'rope', name: 'the salvagers\' ropes from the apron to their camp', by: 'fellgang',
  pts: [[0, 46, AY], [0, 40, layerY(6)]], note: 'up the centre\'s crushed decks (k 4-5) to deck 6' });
L.ways.push({ id: 'line', kind: 'line', name: 'the Line (Dalab-Ledge, segment S2): the helix bore to the station', by: 'lojfower',
  pts: L.line.approach.map(function(p){ return [p[0], p[1], p[2]]; }), note: 'PLAN.md 9.6; the rest is the record L.line' });
L.ways.push({ id: 'mole_walk', kind: 'walk', name: 'the mole\'s walk to the boats', by: 'dalab', pts: [[320, 180, AY], [320, 440, AY]] });

// the viaduct to Nulab (fallen): its piers' stumps, every 60 m toward Nulab (5.1 px 443,1359: 11.7 degrees east of south)
(function(){ var a = Math.atan2(6, 29), x0 = 330, z0 = 470;
  for (var i = 0; i < 25; i++) L.piers.push({ id: 'pier.' + i, x: x0 + Math.sin(a) * 60 * i, z: z0 + Math.cos(a) * 60 * i, w: 9, d: 9 });
})();

// ---------------------------------------------------------------- the wreck heaps (KRUBBLE)
L.heaps.push({ id: 'heap.prow', of: 'the prow (C, k 26-41)', x: 40, z: 125, y0: AY, rx: 66, rz: 50, ry: .2, h: 30, lumps: 7, blocks: 18, cover: 7 });
L.heaps.push({ id: 'heap.prow.shallows', of: 'the prow\'s crown, in the shallows', x: 30, z: 255, y0: null, rx: 58, rz: 44, ry: -.3, h: 44, lumps: 6, blocks: 14, cover: 8 });
L.heaps.push({ id: 'heap.shear', of: 'the sheared decks (W1 and W2, k 8-14)', x: -140, z: 105, y0: AY, rx: 88, rz: 48, ry: 0, h: 22, lumps: 6, blocks: 16, cover: 7 });

// ---------------------------------------------------------------- the links (the walk graph: PLAN.md 9.5)
function K(a, b, o){ L.links.push([a, b, o || {}]); }
var SOUND = ['reclaimed', 'kept', 'squatted', 'dead', 'sealed'], LIVED = ['reclaimed', 'kept', 'squatted'];
function deck(k, w){ return L.decks[k * S.wings.length + S.wings.map(function(x){ return x.id; }).indexOf(w)]; }
// along a layer: the galleries join neighbouring sound decks (sealed decks are shut)
for (var k3 = 0; k3 < S.n; k3++) for (var i = 0; i < S.wings.length - 1; i++){
  var a = L.decks[k3 * S.wings.length + i], b = L.decks[k3 * S.wings.length + i + 1];
  if (LIVED.indexOf(a.state) >= 0 && LIVED.indexOf(b.state) >= 0) K(a.id, b.id, { via: 'gallery' });
}
// up and down a wing: only between lived decks of one holder (their own stairs and ladders); the Ancients' stairs were in the
// face cores, dead with them, so a dead band cannot be climbed
L.decks.forEach(function(d){ if (d.k + 1 >= S.n) return; var u = deck(d.k + 1, d.wing);
  if (LIVED.indexOf(d.state) >= 0 && LIVED.indexOf(u.state) >= 0 && d.by === u.by) K(d.id, u.id, { via: 'stairs' }); });
// the great lifts and their stairs: each stop to the next (a strike shuts both)
L.lifts.forEach(function(lf){
  if (lf.kind === 'car'){ for (var j = 0; j < lf.stops.length - 1; j++){
    K(lf.stops[j], lf.id, { via: 'lift', strike: true }); K(lf.id, lf.stops[j + 1], { via: 'lift', strike: true });
    K(lf.stops[j], 'stair.' + lf.id.slice(5), { via: 'stair', strike: true }); K('stair.' + lf.id.slice(5), lf.stops[j + 1], { via: 'stair', strike: true }); } }
  else if (lf.runs){ lf.stops.forEach(function(s){ K(s, lf.id, { via: 'core' }); }); }
});
K('apron', 'rope.salvage', { via: 'rope' }); K('rope.salvage', 'd.6.c', { via: 'rope' });
K('d.20.e1', 'station', { via: 'concourse' }); K('d.20.c', 'station', { via: 'concourse' }); K('station', 'line', { via: 'platform' });
K('d.39.w1', 'crown_vault', { via: 'vault door' });
K('apron', 'foot_mole', { via: 'quay' }); K('foot_mole', 'mole_walk', {});
K('head', 'road', { via: 'the west gate' });
// every building on the head or the apron opens onto its ground; the tg stand-ins and the customs onto their deck or hall
L.parts.forEach(function(p){
  if (p.zone === 'Z0' && !p.in) K('head', p.id, { via: 'door' });
  else if (p.zone === 'Z5' && !p.in && p.id !== 'foot_mole') K('apron', p.id, { via: 'door' });
  else if (p.kind === 'tg') K(p.deck, p.id, { via: 'door' });
});
K('head_lifthall', 'lift.g1', { via: 'lift hall', strike: true }); K('head_lifthall', 'lift.g2', { via: 'lift hall', strike: true });
K('foot_lifthall', 'lift.g1', { via: 'lift hall', strike: true }); K('foot_lifthall', 'lift.g2', { via: 'lift hall', strike: true });

root.LEDGE_LAYOUT = L;
})(typeof window !== 'undefined' ? window : globalThis);
