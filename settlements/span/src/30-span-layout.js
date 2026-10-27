// ================================================================= SPAN — the layout ([G data])
// Span, the ruined Ancient arcology in Pan Riba's canyon (settlements/span/PLAN.md): every part, way and link as plain
// records keyed by stable ids. The one source: the page draws from it, span_blueprint.py draws the sheets from it
// (through layout_dump.js), test-span.js checks it, Godot reads its export. No THREE, no DOM, no randomness here.
//
// THE FRAME (PLAN.md section 1): u runs DOWNSTREAM along the canyon's axis, v across (v > 0 the right bank, looking
// downstream), y up from the tableland's rim (y 0). Metres. SPAN.toWorld (31-span-rules.js) lays it on the world.
//
// A PART: {id, name, kind, shape, y, h, st, cover, home, state, by, held, key, types, in, sheets, walk, dress, note}
//   shape  ['box', u0, u1, v0, v1] | ['circ', u, v, r] | ['oval', u, v, a, b] (semi-axes along u and v)
//   y, h   its base and its height (m)          st     storeys counted as floor (0: not floor: a deck, a pad, a tank)
//   cover  the share of the footprint built (1)  home   the share of its floor that was homes at the peak (0)
//   state  the kit's decay: intact, ruined, toppled, rehab, worn   by  who built it: 'ancient' | 'dalab'
//   held   Dalab holds it today                  key    the builder that draws it (kits/ancients, or the Dalab set's key)
//   in     the parent it stands in or on (its footprint lies inside the parent's)   walk  false: not a destination
//   dress  the biome kit dresses it (drip cap, log crust, anemone trees)            sheets  the floorplan sheets it is on
// A WAY: {id, kind: road | walk | river | tunnel, pts: [[u, v, y]...], w, closed, held, note}
// A LINK: [a, b, {gate, state: 'open' | 'closed', kind}]: a walker can pass between a and b (parts or ways). A part
//   with `in` is linked to its parent without a line here.
(function(root){
'use strict';
var L = {
  format: 'span-layout', version: 1,
  frame: { u: 'downstream', v: 'across, the right bank +', y: 'up from the rim', rimY: 2600, note: 'rim and floor heights assumed (PLAN.md section 3)' },
  levels: { rim: 0, b1: -40, b2: -85, b3: -130, floor: -180, apron: -45, bayTerrace: -30, cross: -18 },
  // the Deep Reach's section: the half-width of the canyon at each level (rim to rim 300 m, the floor 140 m)
  half: { '0': 150, '-40': 128, '-85': 105, '-130': 85, '-180': 70 },
  reach: [-180, 820],
  bay: { c: [-520, 0], rim: [230, 160], apron: [185, 118], ring: [262, 192] },
  canyon: { head: [[-900, 60], [-750, 70]], down: [[820, 150], [1200, 120]], headFall: -900, floorEnd: -190 },
  storey: 4.5, m2PerHead: 35,
  parts: [], ways: [], links: []
};
function B(u0, u1, v0, v1){ return ['box', u0, u1, v0, v1]; }
function C(u, v, r){ return ['circ', u, v, r]; }
function O(u, v, a, b){ return ['oval', u, v, a, b]; }
function P(id, name, kind, shape, o){
  var p = { id: id, name: name, kind: kind, shape: shape }, k;
  for (k in o) p[k] = o[k];
  if (p.y == null) p.y = 0;
  if (p.h == null) p.h = 0;
  if (p.st == null) p.st = 0;
  if (p.cover == null) p.cover = 1;
  if (p.home == null) p.home = 0;
  if (p.by == null) p.by = 'ancient';
  if (p.held == null) p.held = p.by === 'dalab';
  if (p.walk == null) p.walk = true;
  if (p.dress == null) p.dress = p.by === 'ancient' && !p.held && p.state !== 'intact';
  L.parts.push(p); return p;
}
function W(id, kind, pts, o){ var w = { id: id, kind: kind, pts: pts, w: 0 }, k; for (k in o) w[k] = o[k]; L.ways.push(w); return w; }
function K(a, b, o){ L.links.push([a, b, o || {}]); }
var S0 = ['S0'], S1 = ['S1'], S2 = ['S2'], S3 = ['S3'], S4 = ['S4'];

// ---------------------------------------------------------------- the lake and the tableland (sheet S0)
P('lake_quay', 'The Lake Quay', 'ringsite', B(-2200, -1800, 470, 600), { h: 9, st: 2, cover: .5, home: .4, state: 'worn', key: 'anc_quay', types: ['industry'], sheets: S0, note: 'outlying site: a walled strip of slips and sheds by the right shore' });
P('lake_ring', 'The Lake Ring', 'ringsite', C(-1500, -570, 150), { h: 14, st: 3, cover: .107, home: .5, state: 'ruined', key: 'anc_ring_site', types: ['dwelling-multi'], sheets: S0, note: 'outlying site: a ring wall round a sunken court of six domes (r 20), a mole into the lake; drowned at one side' });
P('weir', 'The Weir', 'weir', B(-1070, -1030, -90, 90), { y: -8, h: 10, state: 'worn', key: 'anc_weir', walk: false, types: ['infrastructure'], sheets: S0, note: 'the sluice dam at the lake\'s outlet: holds the lake 8 m up; Pan Riba spills through it' });
P('dome_lone_1', 'Lone dome', 'dome', C(-1200, 520, 16), { h: 14, st: 3, home: .5, state: 'worn', key: 'anc_ring_dome', sheets: S0 });
P('dome_lone_2', 'Lone dome', 'dome', C(-760, -560, 14), { h: 6, state: 'toppled', key: 'anc_ring_dome', walk: false, sheets: S0 });
P('mound', 'Dalab\'s mound', 'mound', C(-300, -430, 40), { h: 16, by: 'dalab', state: 'intact', key: 'dalab_mound', types: ['religious'], sheets: S0, note: 'an earth mound imitating the domes, facing the lab (south-west): the priest-captain communes here' });

// ---------------------------------------------------------------- the canyon head and the Upper Bay
P('head_pad', 'Head Pad', 'pad', C(-880, 150, 32), { h: 9, state: 'worn', key: 'anc_pad_drum', types: ['infrastructure'], sheets: ['S0', 'S1'], note: 'a landing pad on a drum at the canyon head; a walkway to the ring road' });
P('bay', 'The Upper Bay', 'bay', O(-520, 0, 230, 160), { y: -45, h: 45, state: 'ruined', walk: false, dress: false, sheets: S0, note: 'the canyon quarried into an oval bay; terraces at y -15 and -30, the Apron over the river' });
P('bay_pad', 'Bay Pad', 'pad', C(-700, -240, 30), { h: 8, state: 'ruined', key: 'anc_pad_drum', types: ['infrastructure'], sheets: S1, note: 'a craft wrecked across it' });
(function(){
  var held = { 4: 1, 5: 1, 6: 1 };
  for (var i = 0; i < 10; i++){
    var a = i * 2 * Math.PI / 10 + .31, u = Math.round((-520 + 207 * Math.cos(a)) * 10) / 10, v = Math.round(139 * Math.sin(a) * 10) / 10;
    P('bay_dome_' + i, held[i] ? 'Bay terrace dome: the traders\' lodgings' : 'Bay terrace dome', 'dome', C(u, v, 17),
      { y: -30, h: 14, st: 3, home: .6, state: held[i] ? 'rehab' : (i % 3 ? 'ruined' : 'toppled'), held: !!held[i], key: 'anc_terrace_dome',
        types: held[i] ? ['inn'] : null, walk: !!held[i] || i % 3 !== 0, sheets: S1,
        note: held[i] ? 'rehabilitated: lodgings for the plateau\'s traders and the caravans' : (i % 3 ? 'ruined' : 'toppled into the bay') });
  }
  var ring = [[1.15, 'ruined'], [1.75, 'worn'], [2.4, 'ruined'], [5.3, 'toppled'], [3.9, 'ruined'], [4.55, 'worn']];   // none over the canyon head (u -900..-750)
  ring.forEach(function(q, i){
    P('ring_dome_' + i, 'Ring-walled dome', 'dome', C(Math.round((-520 + 300 * Math.cos(q[0])) * 10) / 10, Math.round(232 * Math.sin(q[0]) * 10) / 10, 28),
      { h: 22, st: 3, home: .5, state: q[1], key: 'anc_ring_dome', walk: q[1] !== 'toppled', sheets: S1 });
  });
})();

// ---------------------------------------------------------------- the Apron: Dalab's trading post (sheet S2)
P('apron', 'The Apron', 'deck', O(-520, 0, 185, 118), { y: -45, h: 2, state: 'rehab', held: true, key: 'anc_apron', types: ['plaza'], dress: false, sheets: S2, note: 'the bay\'s deck over the river\'s slot, cleared by Dalab for the trading post' });
P('apron_wreck', 'Derelict craft', 'craft', C(-620, 75, 14), { y: -45, h: 9, state: 'ruined', in: 'apron', held: true, walk: false, dress: false, key: 'anc_craft', sheets: S2, note: 'a lander, broken-backed: the one wreck Dalab left (too heavy to strip)' });
P('basin_portal', 'The Basin Tunnel\'s upper portal', 'portal', C(-570, -160, 18), { y: -45, h: 14, state: 'intact', held: true, key: 'anc_tunnel_portal', types: ['infrastructure', 'military'], sheets: ['S0', 'S2'], note: 'in the bay\'s left wall: the Ancient road tunnel down to the basin, intact, cleared; Dalab\'s gate and wardens' });
P('tunnel_road', 'The Tunnel Road', 'ramp', B(-580, -560, -142, -116), { y: -45, h: 1, state: 'intact', held: true, key: 'anc_ramp', types: ['infrastructure'], sheets: S2, note: 'the ramp from the portal down onto the Apron' });
function T(id, name, key, b, o){ o.in = 'apron'; o.y = -45; o.by = 'dalab'; o.state = 'intact'; o.key = key; o.sheets = S2; o.dress = false; return P(id, name, 'dalab', b, o); }
T('market', 'Market', 'dalab_market_large', B(-560, -480, -60, 10), { h: 8, types: ['market'], note: 'the trading post\'s heart: where Dalab trades with the plateau\'s people (who they are: TBD)' });
T('customs', 'Customs', 'dalab_scribes', B(-545, -521, -100, -80), { h: 9, types: ['civic'], note: 'the scribes\' hall at the tunnel road: tolls, tallies, the priests\' cut' });
T('warehouses', 'Warehouses', 'dalab_warehouse', B(-470, -410, -90, -50), { h: 9, types: ['industry'] });
T('inn_tunnel', 'Inn of the tunnel', 'dalab_inn', B(-640, -608, -80, -50), { h: 10, types: ['inn'], note: 'lizard stalls and a lodge: the tunnel\'s caravans' });
T('inn_plateau', 'Inn of the plateau', 'dalab_inn', B(-460, -428, 20, 50), { h: 10, types: ['inn'], note: 'the plateau traders\' inn' });
T('tavern', 'Tavern', 'dalab_tavern', B(-600, -575, 0, 25), { h: 7, types: ['tavern'] });
T('bathhouse', 'Bath house', 'dalab_bathhouse', B(-445, -420, -20, 3), { h: 8, types: ['civic'] });
T('traders', 'Traders\' houses', 'dalab_hut_c', B(-660, -620, 10, 60), { h: 7, types: ['dwelling-multi'], note: 'the resident traders: timber frames, as the caste builds (with dalab_rowhouse)' });
T('fields', 'Fields and lizard pens', 'dalab_orchard', B(-690, -662, -35, 35), { h: 2, types: ['farm'], note: 'the Apron\'s upstream end' });
T('caravan_yard', 'Caravan yard', 'dalab_yard', B(-400, -360, -40, 40), { h: 3, types: ['market'], note: 'lizard trains made up and broken; a ramp up to the Cross\'s lizard stalls' });
T('shrine', 'Shrine', 'dalab_shrine', C(-500, 75, 8), { h: 6, types: ['religious'], note: 'faces the lab' });

// ---------------------------------------------------------------- the Cross: Dalab's fort (sheets S0-S2, S4)
P('cross', 'The Cross (the Span)', 'cross', B(-300, -180, -150, 150), { y: -18, h: 18, st: 4, home: .3, state: 'rehab', held: true, key: 'anc_cross', types: ['military'], sheets: ['S0', 'S1', 'S2'], note: 'the habitable bridge where the highways cross the canyon: four storeys over the 300 m span, its roof the road (y 0), keel piers down to the river: Dalab\'s fort' });
P('gate_n', 'North gate tower', 'gate', B(-300, -180, 150, 230), { h: 14, st: 2, state: 'rehab', held: true, key: 'anc_gate_tower', types: ['military'], sheets: ['S0', 'S1'], note: 'on the right-bank abutment: the north highway\'s gate' });
P('gate_s', 'South gate tower', 'gate', B(-300, -180, -230, -150), { h: 14, st: 2, state: 'rehab', held: true, key: 'anc_gate_tower', types: ['military'], sheets: ['S0', 'S1'], note: 'on the left-bank abutment: the south highway\'s gate' });
function Z(id, name, kind, par, b, o){ o.in = par; o.y = par === 'cross' ? -10 : 0; o.state = 'rehab'; o.held = true; o.dress = false; o.sheets = S4; o.key = o.key || 'anc_cross_zone'; return P(id, name, kind, b, o); }
Z('cz_gate_n', 'North Gate Hall', 'entrance', 'gate_n', B(-300, -180, 190, 230), { types: ['military'], note: 'salvage doors' });
Z('cz_gate_s', 'South Gate Hall', 'entrance', 'gate_s', B(-300, -180, -230, -190), { types: ['military'] });
Z('cz_captain', 'Captain\'s Hall', 'office', 'gate_n', B(-300, -250, 150, 190), { types: ['military'] });
Z('cz_signal', 'Signal Room', 'beacon', 'gate_n', B(-230, -180, 150, 190), { types: ['military'], note: 'mirrors and the beacon: the watch post answers' });
Z('cz_barracks', 'Barracks', 'barracks', 'gate_s', B(-300, -250, -190, -150), { types: ['military'] });
Z('cz_stores', 'Stores', 'store', 'gate_s', B(-230, -180, -190, -150), { types: ['military'] });
Z('cz_spine', 'The Spine', 'passage', 'cross', B(-250, -230, -150, 150), { types: ['military'], note: 'the corridor end to end (on through both gate towers)' });
Z('cz_mess', 'Mess Hall', 'servants_hall', 'cross', B(-300, -250, -150, -80), { types: ['military'] });
Z('cz_kitchen', 'Kitchen', 'kitchen', 'cross', B(-300, -250, -80, -50), { types: ['military'] });
Z('cz_clinic', 'Clinic (the genepriests\')', 'infirmary', 'cross', B(-300, -250, -50, 0), { types: ['civic'], note: 'mods and mending' });
Z('cz_stalls', 'Lizard Stalls', 'workshop', 'cross', B(-300, -250, 0, 80), { types: ['farm'], note: 'a ramp down to the Apron\'s caravan yard' });
Z('cz_hoist', 'Water Hoist', 'cistern', 'cross', B(-300, -250, 80, 150), { types: ['infrastructure'], note: 'draws from the river under the bay' });
Z('cz_armoury', 'Armoury', 'armoury', 'cross', B(-230, -195, -150, -90), { types: ['military'] });
Z('cz_ready_s', 'Ready Room (south)', 'guard', 'cross', B(-230, -195, -90, -20), { types: ['military'] });
Z('cz_lift', 'The Lift Head (sealed)', 'stair', 'cross', B(-230, -195, -20, 20), { types: ['infrastructure'], walk: false, note: 'the Ancients\' hoist to the floor, welded shut' });
Z('cz_ready_n', 'Ready Room (north)', 'guard', 'cross', B(-230, -195, 20, 90), { types: ['military'] });
Z('cz_powder', 'Powder and Salvage', 'store', 'cross', B(-230, -195, 90, 150), { types: ['military'] });
Z('cz_guns', 'Gun Gallery', 'guard', 'cross', B(-195, -180, -150, 150), { types: ['military'], note: 'the Line\'s upper face: loopholes over the Deep Reach' });

// ---------------------------------------------------------------- the rims of the Deep Reach (sheet S1)
P('rng_n_a', 'North Range A: the Sound Quarter', 'range', B(-180, 240, 152, 190), { h: 9, st: 2, home: .5, state: 'rehab', held: true, key: 'anc_rim_range', types: ['dwelling-multi', 'military'], sheets: S1, note: 'Dalab\'s quarters, gardens on the roofs' });
P('rng_n_b', 'North Range B', 'range', B(240, 520, 152, 190), { h: 9, st: 2, home: .5, state: 'ruined', key: 'anc_rim_range', sheets: S1 });
P('rng_n_c', 'North Range C', 'range', B(520, 820, 152, 190), { h: 9, st: 2, home: .5, state: 'toppled', key: 'anc_rim_range', walk: false, sheets: S1, note: 'half its length slumped into the canyon with Pad 3' });
P('rng_s_a', 'South Range A', 'range', B(-180, 300, -190, -152), { h: 9, st: 2, home: .5, state: 'ruined', key: 'anc_rim_range', sheets: S1, note: 'Dalab patrols it' });
P('rng_s_b', 'South Range B', 'range', B(300, 820, -190, -152), { h: 9, st: 2, home: .5, state: 'ruined', key: 'anc_rim_range', sheets: S1 });
P('pad_1', 'Rim Pad 1', 'pad', C(120, 255, 32), { h: 8, state: 'worn', held: true, key: 'anc_pad_drum', types: ['military'], dress: false, sheets: S1, note: 'Dalab\'s drill ground and lizard paddock (no craft fly)' });
P('pad_2', 'Rim Pad 2', 'pad', C(300, -250, 36), { h: 8, state: 'ruined', key: 'anc_pad_drum', sheets: S1 });
P('pad_3', 'Rim Pad 3', 'pad', C(560, 240, 28), { h: 2, state: 'toppled', key: 'anc_pad_drum', walk: false, sheets: S1, note: 'toppled into the canyon (its wreck: pad_3_wreck)' });
P('pad_4', 'Rim Pad 4', 'pad', C(760, -240, 28), { h: 8, state: 'ruined', key: 'anc_pad_drum', sheets: S1 });
P('rdome_1', 'Rim dome: the genepriests\' house', 'dome', C(20, 245, 26), { h: 20, st: 3, home: .5, state: 'rehab', held: true, key: 'anc_ring_dome', types: ['civic'], sheets: S1 });
P('rdome_2', 'Rim dome', 'dome', C(380, -245, 30), { h: 22, st: 3, home: .5, state: 'ruined', key: 'anc_ring_dome', sheets: S1 });
P('rdome_3', 'Rim dome', 'dome', C(650, 250, 22), { h: 18, st: 3, home: .5, state: 'worn', key: 'anc_ring_dome', sheets: S1 });
P('middle_bridge', 'The Middle Bridge', 'bridge', B(255, 270, -150, 150), { y: -4, h: 4, state: 'ruined', key: 'anc_road_bridge', types: ['infrastructure'], sheets: S1, note: 'a road bridge at the rim; Dalab\'s forward barricade at its north end' });

// ---------------------------------------------------------------- the walls (sheet S2): galleries on the benches, the service ledges, two bridges
function G(id, name, side, u0, u1, y, o){
  var hi = L.half[String({ '-40': 0, '-85': -40, '-130': -85 }[String(y)])], lo = L.half[String(y)];
  o.y = y; o.sheets = S2; o.key = o.key || 'anc_bench_gallery';
  return P(id, name, o.kind || 'gallery', side > 0 ? B(u0, u1, lo, hi) : B(u0, u1, -hi, -lo), o);
}
G('gal_n40a', 'North gallery -40 (A)', 1, -180, 240, -40, { h: 14, st: 3, home: .45, state: 'rehab', held: true, types: ['industry'], note: 'Dalab\'s stores and workshops' });
G('gal_n40b', 'North gallery -40 (B)', 1, 240, 820, -40, { h: 14, st: 3, home: .45, state: 'ruined' });
G('gal_n85', 'North gallery -85', 1, -180, 820, -85, { h: 14, st: 3, home: .45, state: 'ruined', note: 'sealed off from Dalab\'s part by a salvage wall' });
G('led_n130', 'North service ledge -130', 1, -180, 820, -130, { kind: 'ledge', h: 3, state: 'ruined', key: 'anc_service_ledge', note: 'conduits and a walkway; mutant nests' });
G('gal_s40', 'South gallery -40', -1, -180, 820, -40, { h: 14, st: 3, home: .45, state: 'ruined' });
G('gal_s85', 'South gallery -85', -1, -180, 820, -85, { h: 14, st: 3, home: .45, state: 'ruined' });
G('led_s130', 'South service ledge -130', -1, -180, 820, -130, { kind: 'ledge', h: 3, state: 'toppled', key: 'anc_service_ledge', note: 'its downstream half fallen to the floor' });
P('lowb_n', 'The Low Bridge (north stub)', 'bridge', B(475, 490, 40, 105), { y: -88, h: 3, state: 'toppled', key: 'anc_road_bridge', walk: false, sheets: S2 });
P('lowb_s', 'The Low Bridge (south stub)', 'bridge', B(475, 490, -105, -30), { y: -88, h: 3, state: 'toppled', key: 'anc_road_bridge', walk: false, sheets: S2 });
P('pipe_bridge', 'The Pipe Bridge', 'bridge', B(690, 712, -128, 128), { y: -42, h: 4, state: 'ruined', key: 'anc_canyon_pipes', types: ['infrastructure'], sheets: S2, note: 'three sagging pipes, payloads slung under them (kits/ancients 63-canyon.js HANG)' });
P('hang_pod', 'Hung pod', 'payload', C(701, 70, 9), { y: -70, h: 18, state: 'ruined', key: 'anc_hang_pod', walk: false, sheets: S2 });
P('hang_prison', 'Hung prison', 'payload', C(701, 5, 13), { y: -75, h: 26, state: 'ruined', key: 'anc_hang_prison', walk: false, sheets: S2, note: 'one cable parted' });

// ---------------------------------------------------------------- the floor (sheet S3)
function F(id, name, kind, shape, o){ o.y = o.y == null ? -180 : o.y; o.sheets = o.sheets || S3; return P(id, name, kind, shape, o); }
[[-150, -60, 1, 'ruined', 'a sealed hangar'], [0, 90, -1, 'ruined', 'flooded at the back'], [150, 240, 1, 'ruined', 'a craft inside'],
 [330, 420, -1, 'ruined', ''], [430, 520, 1, 'ruined', ''], [580, 670, -1, 'ruined', 'the machines\' den']].forEach(function(q, i){
  F('hangar_' + (i + 1), 'Hangar ' + (i + 1), 'hangar', q[2] > 0 ? B(q[0], q[1], 70, 112) : B(q[0], q[1], -112, -70),
    { h: 22, st: 1, state: q[3], key: 'anc_wall_hangar', types: ['industry'], note: q[4] });
});
F('valley_portal', 'The Valley Tunnel\'s portal', 'portal', B(690, 760, 70, 124), { h: 14, state: 'ruined', key: 'anc_tunnel_portal', types: ['infrastructure'], sheets: ['S0', 'S3'], note: 'a second Ancient road tunnel, to the Valley of the Ancients: not cleared, held by no one; the machines and mutants come up it' });
F('tank_1', 'Tank 1', 'tank', C(40, 15, 22), { h: 160, state: 'worn', key: 'anc_tank', types: ['industry'], note: 'rises to y -20' });
F('tank_2', 'Tank 2 (the great tank)', 'tank', C(245, -5, 28), { h: 120, state: 'ruined', key: 'anc_tank', types: ['industry'], note: 'rises to y -60; holed' });
F('tank_3', 'Tank 3', 'tank', C(410, 30, 18), { h: 90, state: 'toppled', key: 'anc_tank', types: ['industry'], note: 'rises to y -90; toppled at its top' });
F('engine_works', 'The Engine Works', 'works', B(90, 205, -30, 45), { h: 24, st: 1, state: 'ruined', key: 'anc_works', types: ['industry'] });
F('foundry', 'The Foundry', 'works', B(290, 380, 0, 55), { h: 20, st: 1, state: 'ruined', key: 'anc_works', types: ['industry'] });
F('yard', 'The Yard', 'works', B(530, 640, -30, 35), { h: 3, st: 1, state: 'ruined', key: 'anc_works', types: ['industry'], note: 'derelict craft and machine wrecks' });
F('lowb_mid', 'The Low Bridge\'s middle', 'fallen', B(462, 502, -25, 35), { h: 5, state: 'toppled', key: 'anc_road_bridge', walk: false });
F('pad_3_wreck', 'Rim Pad 3\'s wreck', 'fallen', C(585, 55, 14), { h: 6, state: 'toppled', key: 'anc_pad_drum', walk: false });
F('hang_drum', 'Hung drum (fallen)', 'payload', C(701, -55, 10), { h: 12, state: 'toppled', key: 'anc_hang_drum', walk: false, sheets: ['S2', 'S3'], note: 'fallen from the Pipe Bridge into the river' });
F('floor_wreck', 'Wrecked craft', 'craft', C(-100, -5, 16), { h: 10, state: 'ruined', key: 'anc_craft', walk: false, note: 'just beyond the Line, stripped under the gun gallery\'s cover' });
F('line', 'Dalab\'s Line', 'wall', B(-180, -166, -70, 70), { h: 8, by: 'dalab', state: 'intact', key: 'dalab_line', types: ['military'], note: 'a salvage wall across the floor under the gun gallery; one gate, kept shut' });
F('outfall', 'The Outfall Gate', 'weir', B(800, 830, -70, 70), { y: -190, h: 30, state: 'ruined', key: 'anc_weir', types: ['infrastructure'], note: 'the downstream barrage; breached' });
F('sluice', 'The Sluice Stair', 'weir', B(-300, -180, -25, 25), { y: -180, h: 70, state: 'ruined', key: 'anc_sluice', types: ['infrastructure'], walk: false, note: 'under the Cross: the river steps from y -110 to -180 in four sluices' });

// ---------------------------------------------------------------- the ways
W('hw_north', 'road', [[-240, 230, 0], [-240, 800, 0], [300, 800, 0]], { w: 12, note: 'the north highway (Ancient): to the tableland and the plateau\'s people' });
W('hw_south', 'road', [[-240, -230, 0], [-240, -800, 0], [-800, -800, 0]], { w: 12, note: 'the south highway' });
W('rim_n', 'road', [[-180, 205, 0], [820, 205, 0]], { w: 10 });
W('rim_s', 'road', [[-180, -205, 0], [1150, -205, 0]], { w: 10, note: 'on downstream: Dalab\'s way to the watch post' });
W('ring_road', 'road', (function(){ var p = []; for (var i = 0; i <= 48; i++){ var a = i * 2 * Math.PI / 48; p.push([Math.round((-520 + 262 * Math.cos(a)) * 10) / 10, Math.round(192 * Math.sin(a) * 10) / 10, 0]); } return p; })(), { w: 10, closed: true, note: 'round the bay' });
W('lake_road_n', 'road', [[-762, 73, 0], [-1000, 95, 0], [-1700, 470, 0]], { w: 8, note: 'to the Lake Quay, round the canyon head' });
W('lake_road_s', 'road', [[-761, -76, 0], [-1380, -460, 0]], { w: 8, note: 'to the Lake Ring' });
W('head_walk', 'walk', [[-880, 150, 9], [-745, 99, 0]], { w: 4 });
W('floor_road', 'floor', [[-176, 0, -180], [800, 0, -190]], { w: 140, note: 'the Deep Reach\'s floor (an open floor, not a road): no man\'s land' });
W('river', 'river', [[-1050, 0, -8], [-900, 0, -8], [-900, 0, -60], [-300, 0, -110], [-180, -48, -180], [820, -48, -190], [1200, -40, -205]], { w: 18 });
W('basin_tunnel', 'tunnel', [[-570, -160, -45], [-700, -420, -60], [-1100, -700, -90], [-1500, -790, -120]], { w: 14, held: true, note: 'intact and cleared: down inside the rock to the south-western lowlands (Dalab\'s basin), ~20-30 km; the lower portal is the basin\'s (PLAN.md section 5)' });
W('valley_tunnel', 'tunnel', [[725, 124, -180], [800, 500, -200], [900, 800, -220]], { w: 14, note: 'to the Valley of the Ancients: not cleared, held by no one (PLAN.md section 4)' });

// ---------------------------------------------------------------- the links (who can walk where); a part with `in` joins its parent
K('basin_tunnel', 'basin_portal'); K('basin_portal', 'tunnel_road'); K('tunnel_road', 'apron');
K('apron', 'ring_road', { gate: 'the bay stair', state: 'open', kind: 'stair' });
K('caravan_yard', 'cz_stalls', { kind: 'ramp' });
K('cross', 'gate_n'); K('cross', 'gate_s');
K('gate_n', 'hw_north', { gate: 'the north gate', state: 'open' }); K('gate_s', 'hw_south', { gate: 'the south gate', state: 'open' });
K('cross', 'ring_road', { gate: 'the bay gate', state: 'open' });
K('gate_n', 'rim_n', { gate: 'the quarter gate', state: 'open' }); K('gate_s', 'rim_s', { gate: 'the rim gate', state: 'open' });
K('mound', 'hw_south', { gate: 'the mound way', state: 'open' });
K('cross', 'line', { kind: 'stair' }); K('line', 'floor_road', { gate: 'the Line\'s gate', state: 'closed' });
K('gate_n', 'rng_n_a'); K('rng_n_a', 'gal_n40a', { kind: 'stair' }); K('rng_n_a', 'rdome_1'); K('rng_n_a', 'pad_1');
K('gal_n40a', 'gal_n85', { gate: 'the salvage wall', state: 'closed' });
K('ring_road', 'head_walk'); K('head_walk', 'head_pad'); K('ring_road', 'bay_pad');
K('ring_road', 'lake_road_n'); K('ring_road', 'lake_road_s'); K('lake_road_n', 'lake_quay'); K('lake_road_s', 'lake_ring');
K('lake_road_n', 'dome_lone_1');
for (var i = 0; i < 10; i++) if (i % 3 || i === 6) K('ring_road', 'bay_dome_' + i, { kind: 'stair', gate: (i >= 4 && i <= 6) ? 'the lodgings\' door' : null, state: 'open' });
for (var j = 0; j < 6; j++) if (j !== 3) K('ring_road', 'ring_dome_' + j);
['rng_n_b', 'rdome_3', 'middle_bridge'].forEach(function(p){ K('rim_n', p); });
['rng_s_a', 'rng_s_b', 'pad_2', 'pad_4', 'rdome_2', 'middle_bridge'].forEach(function(p){ K('rim_s', p); });
K('rng_n_b', 'gal_n40b', { kind: 'stair' }); K('gal_n40b', 'gal_n85', { kind: 'stair' }); K('gal_n85', 'led_n130', { kind: 'stair' }); K('led_n130', 'floor_road', { kind: 'ladder' });
K('rng_s_a', 'gal_s40', { kind: 'stair' }); K('gal_s40', 'gal_s85', { kind: 'stair' }); K('gal_s85', 'led_s130', { kind: 'stair' }); K('led_s130', 'floor_road', { kind: 'ladder' });
K('gal_n40b', 'pipe_bridge'); K('pipe_bridge', 'gal_s40');
['hangar_1', 'hangar_2', 'hangar_3', 'hangar_4', 'hangar_5', 'hangar_6', 'valley_portal', 'tank_1', 'tank_2', 'tank_3', 'engine_works', 'foundry', 'yard', 'outfall'].forEach(function(p){ K('floor_road', p); });
K('valley_portal', 'valley_tunnel');

var R = typeof globalThis !== 'undefined' ? globalThis : root;
R.SPAN_LAYOUT = L;
})(this);
