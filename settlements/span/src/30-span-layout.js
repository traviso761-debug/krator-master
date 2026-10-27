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
  // the lake on the tableland (the biome kit makes it; here its bed for the stand-in ground) and the cuttings the portals
  // need through the bench and the talus (SPAN.groundAt reads them; the station carves them with KCARVE)
  lake: { level: -8, bed: -30, pts: [[-2560, -120], [-2480, -360], [-2200, -430], [-1900, -380], [-1600, -300], [-1300, -200], [-1100, -90],
    [-1050, 0], [-1100, 120], [-1350, 240], [-1700, 330], [-2050, 400], [-2350, 330], [-2540, 160]] },
  cuts: [{ id: 'basin_cut', box: [-588, -552, -172, -110], y: -46, note: 'the cutting of the Tunnel Road through the bay terrace to the portal (its face at v -170)' },
         { id: 'valley_cut', box: [700, 750, 66, 88], y: -180, note: 'the notch in the talus before the portal of the Valley Tunnel (its face at v 88)' }],
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
P('mound', 'Dalab\'s mound', 'mound', B(-338, -262, -475, -385), { h: 28, by: 'dalab', state: 'intact', key: 'dalab_mound', types: ['religious'], sheets: S0, note: 'an earth mound imitating the domes, facing the lab (south-west): the priest-captain communes here' });

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
P('apron_wreck', 'Derelict craft', 'craft', C(-560, 80, 14), { y: -45, h: 9, state: 'ruined', in: 'apron', held: true, walk: false, dress: false, key: 'anc_craft', sheets: S2, note: 'a lander, broken-backed: the one wreck Dalab left (too heavy to strip)' });
P('basin_portal', 'The Basin Tunnel\'s upper portal', 'portal', C(-570, -164, 12), { y: -45, h: 14, state: 'intact', held: true, key: 'anc_tunnel_portal', types: ['infrastructure', 'military'], sheets: ['S0', 'S2'], note: 'in the bay\'s left wall: the Ancient road tunnel down to the basin, intact, cleared; Dalab\'s gate and wardens' });
P('tunnel_road', 'The Tunnel Road', 'ramp', B(-580, -560, -142, -116), { y: -45, h: 1, state: 'intact', held: true, key: 'anc_ramp', types: ['infrastructure'], sheets: S2, note: 'the ramp from the portal down onto the Apron' });
function T(id, name, key, b, o){ o.in = 'apron'; o.y = -45; o.by = 'dalab'; o.state = 'intact'; o.key = key; o.sheets = S2; o.dress = false; return P(id, name, 'dalab', b, o); }
// each a building of the Dalab set (settlements/dalab, read in place) at its own footprint (its def's w by d), its front
// toward the Apron's long axis; SP4 (2026-10-27)
T('market', 'Market', 'dalab_market_large', B(-552, -488, -57, 7), { h: 8, types: ['market'], note: 'the trading post\'s heart: where Dalab trades with the plateau\'s people (who they are: TBD)' });
T('customs', 'Customs', 'dalab_scribes', B(-557, -533, -100, -80), { h: 9, types: ['civic'], note: 'the scribes\' hall at the tunnel road: tolls, tallies, the priests\' cut' });
T('warehouse_1', 'Warehouse', 'dalab_warehouse', B(-484, -456, -85, -65), { h: 9, types: ['industry'] });
T('warehouse_2', 'Warehouse', 'dalab_warehouse', B(-454, -426, -85, -65), { h: 9, types: ['industry'] });
T('inn_tunnel', 'Inn of the tunnel', 'dalab_inn', B(-640, -608, -80, -50), { h: 10, types: ['inn'], note: 'lizard stalls and a lodge: the tunnel\'s caravans' });
T('inn_plateau', 'Inn of the plateau', 'dalab_inn', B(-460, -428, 20, 50), { h: 10, types: ['inn'], note: 'the plateau traders\' inn' });
T('tavern', 'Tavern', 'dalab_tavern', B(-609, -583, 2, 28), { h: 14, types: ['tavern'] });
T('bathhouse', 'Bath house', 'dalab_bathhouse', B(-444.5, -419.5, -23.5, -.5), { h: 8, types: ['civic'] });
T('trader_house_1', 'Trader\'s house', 'dalab_hut_c', B(-656, -644, 19, 31), { h: 7, types: ['dwelling-single'], note: 'the trader caste builds in timber frames' });
T('trader_house_2', 'Trader\'s house', 'dalab_hut_c', B(-656, -644, 39, 51), { h: 7, types: ['dwelling-single'] });
T('trader_row', 'Traders\' terrace row', 'dalab_rowhouse', B(-638, -618, 55, 69), { h: 7, types: ['dwelling-multi'] });
T('orchard_1', 'Orchard plot', 'dalab_orchard', B(-686, -664, -25, -3), { h: 5, types: ['farm'], note: 'the Apron\'s upstream end' });
T('orchard_2', 'Orchard plot', 'dalab_orchard', B(-686, -664, -1, 21), { h: 5, types: ['farm'] });
T('caravan_yard', 'Caravan yard', 'dalab_market_small', B(-394, -366, -14, 14), { h: 6, types: ['market'], note: 'lizard trains made up and broken; a ramp up to the Cross\'s lizard stalls' });
T('shrine', 'Shrine', 'dalab_shrine', B(-504, -496, 71, 79), { h: 6, types: ['religious'], note: 'faces the lab' });

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
P('watch_bridge', 'Watch tower at the Middle Bridge', 'dalab', B(276, 288, 222, 234), { h: 17, by: 'dalab', state: 'intact', key: 'dalab_watchtower', types: ['military'], sheets: S1, note: 'the forward post at the north end of the bridge' });
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
  F('hangar_' + (i + 1), 'Hangar ' + (i + 1), 'hangar', q[2] > 0 ? B(q[0], q[1], 70, 104) : B(q[0], q[1], -104, -70),
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
F('line', 'Dalab\'s Line', 'wall', B(-178, -170, -70, 70), { h: 11, by: 'dalab', state: 'intact', key: 'pa:barricade', ry: Math.PI / 2, args: { L: 140, v: 1 }, types: ['military'], note: 'a salvage wall across the floor under the gun gallery; one gate, kept shut' });
F('outfall', 'The Outfall Gate', 'weir', B(800, 830, -70, 70), { y: -190, h: 30, state: 'ruined', key: 'anc_weir', types: ['infrastructure'], note: 'the downstream barrage; breached' });
F('sluice', 'The Sluice Stair', 'weir', B(-300, -180, -25, 25), { y: -180, h: 70, state: 'ruined', key: 'anc_sluice', types: ['infrastructure'], walk: false, note: 'under the Cross: the river steps from y -110 to -180 in four sluices' });

// ---------------------------------------------------------------- THE PILLAR RIM and DALAB'S WATCH POST (SP5; on station 4's site, 2026-10-27)
// The rock is SW highlands station 4's (biomes/swhighlands, the pillar rim; the owner, 2026-10-27: Span the settlement and the
// station the biome strictly apart). Span reads only the station's published site record (BIOME-API.md "Station 4's site"),
// vendored as site/swhighlands-pillars-site.json (the build hands it in as SPAN_SITE, fragment 29a), and places its post and
// stairs from it. A record of another format or version stops the layout here, rather than misplacing the post.
// THE FRAME (L.site): one rigid turn and shift from the site's (x east, z south, y over its y0) to Span's (u, v, y from the rim).
// Pan Riba runs along station 4's rim, down on the floor; it falls off the tableland upstream, off the station's map, and there
// Span's canyon meets the rim: at M, the rim's line run on west to the site's x -1750 (a choice: the scale model settles it).
// u runs out from the cliff (the chord from M to the rim under the watch pillar, turned a quarter), v along the rim (0 at M,
// east negative), y from the table's top at the watch (T). L.rim and L.pillars are the record's, mapped.
// On the watch pillar, Dalab's WATCH POST (refs/27): a stone-walled post on the flat top (the Dalab set's dalab_post, its
// watch tower and a hut inside), reached from the rim road by a switchback stair down the cliff, a path across the floor and a
// stair cut round the pillar's faces to the post's gate. The stairs here are lines on the record (the rim's line, the pillar's
// width); the page fits the watch stair to the rock as drawn. It must see the Cross's signal room: SPAN.checks holds the line.
(function(){ var SITE = typeof SPAN_SITE !== 'undefined' ? SPAN_SITE : null;
  if (!SITE || SITE.format !== 'swhighlands-pillars-site' || SITE.version !== 1)
    throw new Error('Span: SPAN_SITE is not a swhighlands-pillars-site v1 record (settlements/span/site; BIOME-API.md "Station 4\'s site")');
  var R = SITE.rim, Wt = SITE.watch, r1 = function(x){ return Math.round(x * 10) / 10; };
  // a rim field at the site's x, linear between the record's points, the ends held
  var at = function(x, k){ if (x <= R[0].x) return R[0][k]; for (var i = 1; i < R.length; i++) if (x <= R[i].x){ var f = (x - R[i - 1].x) / (R[i].x - R[i - 1].x); return R[i - 1][k] + (R[i][k] - R[i - 1][k]) * f; } return R[R.length - 1][k]; };
  var M = [-1750, at(-1750, 'z')], R0 = [Wt.x, at(Wt.x, 'z')], c = [R0[0] - M[0], R0[1] - M[1]], cl = Math.hypot(c[0], c[1]);
  var t = [-c[0] / cl, -c[1] / cl], n = [t[1], -t[0]], T = at(Wt.x, 'top');
  // the station publishes the frame it carves Span's canyon in (canyon: M, n, t, u0, built by the rule above): read it, so the
  // two cannot drift; the rule stands for a record without it
  var U0 = 1300, C = SITE.canyon; if (C){ M = C.M.slice(); n = C.n.slice(); t = C.t.slice(); U0 = C.u0; }
  L.site = { from: SITE.format + ' v' + SITE.version, M: M, n: n, t: t, u0: U0, T: r1(T), y0: SITE.frame.y0, rot: Math.atan2(t[0], n[0]), canyon: !!C };
  var uv = function(x, z){ var dx = x - M[0], dz = z - M[1]; return [r1(U0 + n[0] * dx + n[1] * dz), r1(t[0] * dx + t[1] * dz)]; };
  L.rim = R.map(function(p){ var q = uv(p.x, p.z); return { u: q[0], v: q[1], top: r1(p.top - T), floor: r1(p.floor - T) }; });
  // the record's finer fields where it has them: the rim's line every 5 m (rimFine, [u, v] west to east), and the ground as
  // drawn round the watch pillar and its cliff (ground: the site's own grid and heights over its y0; SPAN.siteGround samples it)
  if (SITE.rimFine) L.rimFine = SITE.rimFine.map(function(p){ return uv(p[0], p[1]); });
  if (SITE.ground) L.ground = SITE.ground;
  L.pillars = SITE.towers.map(function(q){ var p = uv(q.x, q.z), w = q.id === Wt.id;
    var o = { id: 'st4_' + q.id.replace(/[^\w]/g, '_'), site: q.id, name: w ? 'The watch pillar' : 'A tower of the pillar rim', u: p[0], v: p[1], foot: r1(q.foot - T), top: r1(q.top - T), R: q.R };
    if (w){ o.w = Wt.w; o.l = Wt.l; o.ry = Wt.ry + L.site.rot; o.flat = r1(Wt.flat); o.keep = Wt.keep; }
    return o; }).sort(function(a, b){ return (b.site === Wt.id) - (a.site === Wt.id); });   /* the watch pillar first */ })();
(function(){
// the rim's u at a v (L.rim is ordered west to east: v falling), and its record (SPAN.rimAt, 31-span-rules.js, is the same)
function rimAt(v){ var R = L.rim; if (v >= R[0].v) return R[0]; for (var i = 1; i < R.length; i++) if (v >= R[i].v){ var f = (v - R[i - 1].v) / (R[i].v - R[i - 1].v), a = R[i - 1], b = R[i];
  return fineU({ u: a.u + (b.u - a.u) * f, v: v, top: a.top + (b.top - a.top) * f, floor: a.floor + (b.floor - a.floor) * f }); } return R[R.length - 1]; }
// the rim's u from rimFine where the record has it (the 5 m line: the drawn cliff's buttresses and alcoves)
function fineU(r){ var F = L.rimFine; if (!F) return r;
  for (var i = 1; i < F.length; i++) if (r.v >= F[i][1] && r.v <= F[i - 1][1]){ var f = (r.v - F[i - 1][1]) / ((F[i][1] - F[i - 1][1]) || 1); r.u = F[i - 1][0] + (F[i][0] - F[i - 1][0]) * f; break; }
  return r; }
// the ground as drawn (the record's ground field) at (u, v), bilinear, in Span's y; null off the field (SPAN.siteGround is the same)
function gH(u, v){ var G = L.ground, S = L.site; if (!G) return null;
  var x = S.M[0] + S.n[0] * (u - S.u0) + S.t[0] * v, z = S.M[1] + S.n[1] * (u - S.u0) + S.t[1] * v, fx = (x - G.box[0]) / G.step, fz = (z - G.box[1]) / G.step;
  if (fx < 0 || fz < 0 || fx > G.nx - 1 || fz > G.nz - 1) return null;
  var i = Math.min(G.nx - 2, Math.floor(fx)), j = Math.min(G.nz - 2, Math.floor(fz)), a = fx - i, b = fz - j, h = G.h, k = j * G.nx + i;
  return (h[k] * (1 - a) + h[k + 1] * a) * (1 - b) + (h[k + G.nx] * (1 - a) + h[k + G.nx + 1] * a) * b - S.T; }
var PW = L.pillars[0], r1 = function(x){ return Math.round(x * 10) / 10; };
// the stair round the watch pillar's faces: its centre line .8 m out from the record's width (its inner edge on the rock),
// rising .55 a metre run, ending on the +v face's middle at the top, where the post's gate is; built backwards from there
// The foot is the drawn ground where the line comes down (the record's ground field: a second pass from the first pass's foot)
(function(){ var Pw = PW, s = Math.max(Pw.w, Pw.l) / 2 + .8, top = Pw.top, k = .55;
  var cs = [[Pw.u + s, Pw.v + s], [Pw.u + s, Pw.v - s], [Pw.u - s, Pw.v - s], [Pw.u - s, Pw.v + s]];
  function line(foot){ var pts = [[Pw.u, r1(Pw.v + s), top]], left = (top - foot) / k, at = [Pw.u, Pw.v + s], y = top, i = 0;
    while (left > 1e-6){ var c = cs[i % 4], d = Math.hypot(c[0] - at[0], c[1] - at[1]);
      if (d >= left){ var t = left / d; at = [at[0] + (c[0] - at[0]) * t, at[1] + (c[1] - at[1]) * t]; y -= left * k; pts.push([r1(at[0]), r1(at[1]), r1(y)]); break; }
      y -= d * k; at = c; left -= d; pts.push([r1(c[0]), r1(c[1]), r1(y)]); i++; }
    return pts; }
  var pts = line(Pw.foot), e = pts[pts.length - 1], g = gH(e[0], e[1]);
  if (g != null && Math.abs(g - Pw.foot) > .2) pts = line(g);
  pts.unshift([Pw.u, r1(Pw.v + 18.6), top]);   /* the head: a landing in from the edge to the post's gate (its front wall 18 m out) */
  L.watchStair = pts.reverse(); })();
// THE APRON (station 4's record since 2026-10-27): the cliff is a caprock over a badland apron; the record's rim floor is the
// apron 30 m out, and the open floor is where the towers stand (the watch pillar's foot). L.apron: the ground falls from the
// rim's floor at d (30 m out) to the open floor at the watch pillar's skirt (its distance out from the rim, less its R),
// linearly, read from the record alone (SPAN.groundAt)
L.apron = { d: 30, end: r1(PW.u - rimAt(PW.v).u - PW.R), open: PW.foot };
// the cliff stair: flights of 60 m drop over 120 m along the cliff (west of the watch pillar, toward Span), on two lanes 1.5 and
// 4 m out from the cliff's face, a landing between, from the table's edge down to the apron at the cliff's foot. With the
// record's ground field the cliff is the station's as drawn (the table and its cliff are ground there, open slots and all):
// its edge in each section is where the ground first falls 15 m under the table 40-80 m in from the rim's line (the drawn edge
// stands back of that line, its shoulders worn), and each tread stands where the face is at the tread's height. The stair's
// 120 m stretch is the nearest to its first place (within 200 m) whose head and foot stand on solid table (no open slot there:
// a flight crosses a slot's mouth in the face as a span) and whose trench at the cliff's foot is no deeper than 150 m under
// the apron (44 m out from the edge); a level span crosses that trench at the foot. Without the field, the lanes stand on the record's rim line
(function(){ var gv = function(u, v, d){ var g = gH(u, v); return g == null ? d : g; };
  function edge(v){ var b = rimAt(v).u, tl = -Infinity, u, g;
    for (u = b - 80; u <= b - 40; u += 2){ g = gH(u, v); if (g != null && g > tl) tl = g; }
    if (tl === -Infinity) return null;
    for (u = b - 60; u <= b + 20; u += 1){ g = gH(u, v); if (g != null && g < tl - 15) return { u: u - 1, top: gv(u - 1, v, tl), ap: gv(u + 44, v, null) }; }
    return null; }
  function face(v, y, e){ for (var u = e.u; u <= e.u + 60; u += .5){ var g = gH(u, v); if (g != null && g <= y) return u; } return e.u + 60; }
  function trench(e, v){ if (!e || e.ap == null) return Infinity; var lo = Infinity; for (var u = e.u; u <= e.u + 45; u += 1){ var g = gH(u, v); if (g == null) return Infinity; lo = Math.min(lo, g); } return e.ap - lo; }
  var best = null;
  if (L.ground) for (var off = -200; off <= 200; off += 10){ var a0 = PW.v + 160 + off, b0 = PW.v + 40 + off, worst = 0;
    var ha = edge(a0), hb = edge(b0); if (!ha || !hb || ha.top < -40 || hb.top < -40) continue;   /* the head and the foot on solid table */
    for (var vv = b0; vv <= a0 + 1e-6; vv += 5){ var ev = edge(vv); if (!ev) continue; worst = Math.max(worst, trench(ev, vv)); }
    var sc = -Math.abs(off) - (worst > 150 ? 1e4 : 0); if (worst < Infinity && (!best || sc > best.sc)) best = { a: a0, b: b0, sc: sc, worst: worst }; }
  var vA = r1(best ? best.a : PW.v + 160), vB = r1(best ? best.b : PW.v + 40), eA = best ? edge(vA) : null, eB = best ? edge(vB) : null;
  var at = function(v, y, lane){ var e = best ? edge(v) : null; return e ? face(v, y, e) + lane : rimAt(v).u + lane; };
  var y = r1(eA ? eA.top : 0), fl = r1(eB && eB.ap != null ? Math.max(eB.ap, eA && eA.ap != null ? eA.ap : -Infinity) : gv(rimAt(vB).u + 6, vB, rimAt(PW.v + 100).floor));
  var pts = [[r1(eA ? eA.u - 3 : rimAt(vA).u - 2), vA, y]], k = 0;
  while (y > fl + 1e-6){ var y2 = Math.max(fl, y - 60), from = k % 2 ? vB : vA, to = k % 2 ? vA : vB, lane = k % 2 ? 4 : 1.5;
    for (var j = 0; j <= 60; j++){ var v = from + (to - from) * j / 60, yy = y + (y2 - y) * j / 60; pts.push([r1(at(v, yy, lane)), r1(v), r1(yy)]); }   /* a point every 2 m: the face juts in and out on that scale */
    y = y2; k++; if (y > fl + 1e-6) pts.push([r1(at(to, y, k % 2 ? 4 : 1.5)), to, r1(y)]); }
  // the foot: a level span from the last tread across the trench at the cliff's foot to the apron's ground (44 m out from the edge)
  var vE = pts[pts.length - 1][1], eE = best ? edge(vE) : null; if (eE && eE.ap != null) pts.push([r1(eE.u + 44), vE, pts[pts.length - 1][2]]);
  L.cliffStair = pts;
  L.cliffEdge = best ? { vA: vA, vB: vB, trench: r1(best.worst) } : null;
  // the path down the apron to the watch pillar's foot: six legs zigzagging 50 m either side of the line from the stair's foot,
  // each point on the apron's ground (a gullied badland: the drawn ground is the station's)
  var s = pts[pts.length - 1], e = L.watchStair[0], path = [s.slice()];
  var gy = function(u, v){ var g = gH(u, v); if (g != null) return g;   /* the drawn ground; off the field, SPAN.groundAt's apron */
    var rm = rimAt(v), ap = L.apron, d = u - rm.u; return d <= ap.d ? rm.floor : d >= ap.end ? ap.open : rm.floor + (ap.open - rm.floor) * (d - ap.d) / (ap.end - ap.d); };
  for (var q = 1; q < 6; q++){ var f = q / 6, pu = s[0] + (e[0] - s[0]) * f, pv = s[1] + (e[1] - s[1]) * f + (q % 2 ? 50 : -50); path.push([r1(pu), r1(pv), r1(gy(pu, pv))]); }
  path.push([e[0], e[1], e[2]]); L.apronPath = path;
  // the rim road on from Span: along the table 40 m in from the rim's line, every 100 m, to the head of the cliff stair
  var road = [[-180, -205, 0], [1150, -205, 0]];
  // on the station's ground, each point the highest of 40 to 120 m in from the rim's line (off an open slot), at its height
  for (var v = -300; v > vA + 50; v -= 100){ var bu = rimAt(v).u - 40, by = gv(bu, v, 0);
    for (var dd = 60; dd <= 120; dd += 20){ var gu = rimAt(v).u - dd, gg = gH(gu, v); if (gg != null && gg > by + .5){ bu = gu; by = gg; } }
    road.push([r1(bu), v, r1(by)]); }
  var hd = L.cliffStair[0]; road.push([r1(hd[0] - 8), vA, r1(gv(hd[0] - 8, vA, hd[2]))]); L.rimRoad = road; })();   /* to the stair's head, on the table as drawn */
P('watch_post', 'Dalab\'s watch post', 'dalab', B(PW.u - 18, PW.u + 18, PW.v - 18, PW.v + 18), { y: PW.top, h: 0, by: 'dalab', state: 'intact', key: 'dalab_post', ry: 0, on: PW.id,
  types: ['military'], dress: false, sheets: S0, note: 'on the watch pillar\'s top (station 4\'s site): the Valley watched, the Cross signalled' });
P('watch_post_tower', 'Watch tower', 'dalab', B(PW.u + 4, PW.u + 16, PW.v - 14, PW.v - 2), { in: 'watch_post', h: 17, by: 'dalab', state: 'intact', key: 'dalab_watchtower', ry: 0, types: ['military'], dress: false, sheets: S0 });
P('watch_post_hut', 'The watch\'s hut', 'dalab', B(PW.u - 15, PW.u - 5, PW.v - 14, PW.v - 4), { in: 'watch_post', h: 8, by: 'dalab', state: 'intact', key: 'dalab_hut_a', ry: 0, types: ['military'], dress: false, sheets: S0 });
P('watch_post_banners', 'Banners of Dalab', 'dalab', B(PW.u - 10, PW.u, PW.v + 6, PW.v + 8), { in: 'watch_post', h: 8, by: 'dalab', state: 'intact', key: 'dalab_banners', ry: 0, types: ['religious'], dress: false, sheets: S0 });
})();

// ---------------------------------------------------------------- Dalab's marks: its gates in the openings it keeps, its banners on what it holds
// (the Dalab set's dalab_gate and dalab_banners, 2026-10-27). `ry` turns a part's front (+z): 0 faces +v, PI faces -v, PI/2 faces +u
function D(id, name, key, shape, o){ o.by = 'dalab'; o.state = 'intact'; o.key = key; o.dress = false; o.types = o.types || (key === 'dalab_gate' ? ['military'] : ['religious']); return P(id, name, 'dalab', shape, o); }
D('gate_cross_n', 'The north gate of the Cross', 'dalab_gate', B(-254, -226, 230, 236), { h: 14, ry: 0, sheets: S1, note: 'on the north highway at the north gate tower' });
D('gate_cross_s', 'The south gate of the Cross', 'dalab_gate', B(-254, -226, -236, -230), { h: 14, ry: Math.PI, sheets: S1, note: 'on the south highway at the south gate tower' });
D('gate_tunnel', 'The tunnel gate', 'dalab_gate', B(-584, -556, -151, -145), { y: -46, h: 14, ry: Math.PI, sheets: S2, note: 'in the cutting before the Basin Tunnel: Dalab\'s wardens' });
D('gate_quarter', 'The quarter gate', 'dalab_gate', B(-176, -170, 191, 219), { h: 14, ry: Math.PI / 2, sheets: S1, note: 'on the rim road where it leaves the north gate tower' });
D('ban_cross_1', 'Banners of Dalab', 'dalab_banners', B(-299, -297, -70, -60), { in: 'cross', h: 8, ry: -Math.PI / 2, sheets: S1, note: 'on the roof of the Cross, facing the bay' });
D('ban_cross_2', 'Banners of Dalab', 'dalab_banners', B(-299, -297, 60, 70), { in: 'cross', h: 8, ry: -Math.PI / 2, sheets: S1 });
D('ban_quarter_1', 'Banners of Dalab', 'dalab_banners', B(-60, -50, 153, 155), { in: 'rng_n_a', h: 8, ry: Math.PI, sheets: S1, note: 'on the roof of the Sound Quarter, facing the canyon' });
D('ban_quarter_2', 'Banners of Dalab', 'dalab_banners', B(140, 150, 153, 155), { in: 'rng_n_a', h: 8, ry: Math.PI, sheets: S1 });
D('ban_pad_1', 'Banners of Dalab', 'dalab_banners', B(115, 125, 240, 242), { in: 'pad_1', h: 8, ry: Math.PI, sheets: S1 });

// ---------------------------------------------------------------- the ARENA and the HIGHLANDERS' QUARTER (the owner, 2026-10-27)
// Span is not only a market: the SW highlanders come to test their strongest warrior against Dalab's enhanced champions in
// ritual combat, year after year, and Dalab holds their loyalty as long as it wins (PLAN.md section 4, LORE.md 6.1). The arena
// (the Post-Apoc kit's Thunderdome, kits/post-apoc 56-arena.js) and the highlanders' quarter round it (the kit's salvage houses:
// their own people's marks wait on who they are, the kit's generic dress until then) stand together on the tableland just
// outside the Cross's north gate, inside a PALISADE (the kit's `palisade`) whose gate, in the south wall's west end, opens
// toward that gate, the nearest way into Span. Dalab runs the arena (held); a lane runs from the palisade's gate north, then
// east along the quarter's street to the arena's entrance. Compact (the owner, 2026-10-27): 180 x 160 m inside the stakes.
P('palisade', 'The highlanders\' palisade', 'enclosure', B(-226, -46, 290, 450), { h: 0, by: 'highland', state: 'intact', key: 'pa:palisade', ry: Math.PI,
  args: { w: 180, d: 160, gate: 12, gateAt: 64, h: 3.4 }, types: ['infrastructure'], dress: false, sheets: ['S0', 'S1'],
  note: 'timber stakes round the quarter and the arena; its gate toward the north gate of the Cross' });
P('arena', 'The arena', 'arena', B(-120, -64, 380, 436), { h: 20, by: 'dalab', state: 'intact', key: 'pa:arena', ry: Math.PI, types: ['civic'], dress: false, sheets: ['S0', 'S1'],
  note: 'the ritual combat: the highlanders\' strongest against Dalab\'s enhanced champions, once a year' });
D('ban_arena_1', 'Banners of Dalab', 'dalab_banners', B(-114, -104, 376, 378), { h: 8, ry: Math.PI, sheets: S1, note: 'at the arena\'s entrance' });
D('ban_arena_2', 'Banners of Dalab', 'dalab_banners', B(-80, -70, 376, 378), { h: 8, ry: Math.PI, sheets: S1 });
function H(id, key, shape, ry, types){ return P(id, 'Highlanders\' house', 'house', shape, { h: 10, by: 'highland', state: 'intact', key: 'pa:' + key, ry: ry, types: types || ['dwelling-single'], dress: false, sheets: S1 }); }
// the street's south side, its fronts to the street (+v): the big houses, and a row of small ones behind them
H('hl_9', 'lg-twinsilo', B(-190, -159, 348, 366), 0, ['dwelling-multi']); H('hl_4', 'lg-stack', B(-155, -133, 348, 366), 0, ['dwelling-multi']);
H('hl_11', 'lg-bulkhead', B(-129, -103, 338, 366), 0, ['dwelling-multi']); H('hl_6', 'lg-tanktower', B(-99, -81, 350, 366), 0, ['dwelling-multi']);
H('hl_5', 'dw-bus', B(-77, -63, 357, 366), 0);
H('hl_1', 'dw-silo', B(-190, -179, 330, 340), 0); H('hl_2', 'dw-box', B(-175, -161, 332, 340), 0); H('hl_3', 'dw-tire', B(-155, -144, 329, 340), 0);
H('hl_7', 'dw-tank', B(-95, -84, 331, 340), 0); H('hl_8', 'dw-bottle', B(-78, -66, 330, 340), 0);
// THE MISSION (the owner, 2026-10-27): Dalab's temple in the quarter, where the priests try to bring the highlanders to the God
// and where Dalabites at Span worship; the priest's house beside it, a wayside shrine just inside the palisade's gate to meet
// whoever comes in. The Dalab set's own (dalab_temple, dalab_priest_house, dalab_shrine), held by Dalab
D('mission_temple', 'The mission temple', 'dalab_temple', B(-192, -166, 400, 430), { h: 14, ry: Math.PI, types: ['religious', 'civic'], sheets: S1,
  note: 'the God\'s word for the highlanders; the Dalabites\' own worship at Span' });
D('mission_house', 'The mission priest\'s house', 'dalab_priest_house', B(-160, -146, 400, 414), { h: 8, ry: Math.PI, types: ['religious'], sheets: S1 });
D('mission_shrine', 'Wayside shrine', 'dalab_shrine', B(-216, -208, 300, 308), { h: 5, ry: Math.PI / 2, types: ['religious'], sheets: S1, note: 'inside the palisade gate: the first thing a newcomer passes' });
// the street's north side, west of the arena, their fronts to the street (-v)
H('hl_10', 'dw-stilt', B(-190, -181, 378, 389), Math.PI); H('hl_12', 'dw-silo', B(-175, -164, 378, 388), Math.PI); H('hl_13', 'dw-box', B(-158, -144, 378, 386), Math.PI);

// ---------------------------------------------------------------- the ways
W('hw_north', 'road', [[-240, 236, 0], [-240, 800, 0], [300, 800, 0]], { w: 12, note: 'the north highway (Ancient): to the tableland and the plateau\'s people' });
W('quarter_lane', 'road', [[-200, 290, 0], [-200, 372, 0], [-56, 372, 0]], { w: 8, note: 'the street of the quarter: from the palisade gate north, then east to the arena' });
W('mission_walk', 'walk', [[-178, 376, 0], [-178, 398, 0]], { w: 4, note: 'from the street to the mission temple\'s door' });
W('cliff_stair', 'stair', L.cliffStair, { w: 2.4, held: true, note: 'cut down the caprock in switchbacks, from the rim road to the apron at its foot' });
W('pillar_path', 'walk', L.apronPath, { w: 3, held: true, note: 'down the badland apron to the foot of the watch pillar' });
W('watch_stair', 'stair', L.watchStair, { w: 1.6, held: true, note: 'cut up the watch pillar\'s faces, round and round, to the post\'s gate' });
W('palisade_way', 'road', [[-200, 286, 0], [-234, 252, 0]], { w: 8, note: 'from the palisade gate to the north highway, by the north gate of the Cross' });
W('hw_south', 'road', [[-240, -236, 0], [-240, -800, 0], [-800, -800, 0]], { w: 12, note: 'the south highway' });
W('rim_n', 'road', [[-170, 205, 0], [820, 205, 0]], { w: 10 });
W('rim_s', 'road', L.rimRoad, { w: 10, note: 'on downstream: Dalab\'s way to the watch post' });
W('ring_road', 'road', (function(){ var p = []; for (var i = 0; i <= 48; i++){ var a = i * 2 * Math.PI / 48; p.push([Math.round((-520 + 262 * Math.cos(a)) * 10) / 10, Math.round(192 * Math.sin(a) * 10) / 10, 0]); } return p; })(), { w: 10, closed: true, note: 'round the bay' });
W('lake_road_n', 'road', [[-762, 73, 0], [-1000, 95, 0], [-1700, 470, 0]], { w: 8, note: 'to the Lake Quay, round the canyon head' });
W('lake_road_s', 'road', [[-761, -76, 0], [-1380, -460, 0]], { w: 8, note: 'to the Lake Ring' });
W('head_walk', 'walk', [[-880, 150, 9], [-745, 99, 0]], { w: 4 });
W('floor_road', 'floor', [[-176, 0, -180], [800, 0, -190]], { w: 140, note: 'the Deep Reach\'s floor (an open floor, not a road): no man\'s land' });
W('river', 'river', [[-1050, 0, -8], [-900, 0, -8], [-900, 0, -60], [-300, 0, -110], [-180, -48, -180], [820, -48, -190], [1200, -40, -205]], { w: 18 });
W('basin_tunnel', 'tunnel', [[-570, -160, -45], [-700, -420, -60], [-1100, -700, -90], [-1500, -790, -120]], { w: 14, held: true, note: 'intact and cleared: down inside the rock to the south-western lowlands (Dalab\'s basin), ~20-30 km; the lower portal is the basin\'s (PLAN.md section 5)' });
W('valley_tunnel', 'tunnel', [[725, 124, -180], [800, 500, -200], [900, 800, -220]], { w: 14, note: 'to the Valley of the Ancients: not cleared, held by no one (PLAN.md section 4)' });

// ---------------------------------------------------------------- the links (who can walk where); a part with `in` joins its parent
K('basin_tunnel', 'basin_portal'); K('basin_portal', 'gate_tunnel'); K('gate_tunnel', 'tunnel_road'); K('tunnel_road', 'apron');
K('apron', 'ring_road', { gate: 'the bay stair', state: 'open', kind: 'stair' });
K('caravan_yard', 'cz_stalls', { kind: 'ramp' });
K('cross', 'gate_n'); K('cross', 'gate_s');
K('gate_n', 'gate_cross_n'); K('gate_cross_n', 'hw_north', { gate: 'the north gate', state: 'open' });
K('gate_s', 'gate_cross_s'); K('gate_cross_s', 'hw_south', { gate: 'the south gate', state: 'open' });
K('cross', 'ring_road', { gate: 'the bay gate', state: 'open' });
K('gate_n', 'gate_quarter'); K('gate_quarter', 'rim_n', { gate: 'the quarter gate', state: 'open' }); K('gate_s', 'rim_s', { gate: 'the rim gate', state: 'open' });
K('mound', 'hw_south', { gate: 'the mound way', state: 'open' });
K('watch_bridge', 'rim_n', { gate: 'the tower door', state: 'open' });
K('hw_north', 'palisade_way'); K('palisade_way', 'palisade', { gate: 'the palisade gate', state: 'open' }); K('palisade', 'quarter_lane');
K('quarter_lane', 'arena', { gate: 'the arena gate', state: 'open' });
K('quarter_lane', 'mission_walk'); K('mission_walk', 'mission_temple', { gate: 'the temple door', state: 'open' });
K('mission_walk', 'mission_house', { gate: 'the priest\'s door', state: 'open' }); K('quarter_lane', 'mission_shrine', { gate: 'the shrine', state: 'open' });
K('rim_s', 'cliff_stair', { gate: 'the head of the cliff stair', state: 'open' }); K('cliff_stair', 'pillar_path'); K('pillar_path', 'watch_stair');
K('watch_stair', 'watch_post');
['ban_arena_1', 'ban_arena_2'].forEach(function(b){ K('quarter_lane', b, { gate: 'the arena forecourt', state: 'open' }); });
for (var hh = 1; hh <= 13; hh++) K('quarter_lane', 'hl_' + hh);
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

// every hangar is cut into its wall to the floor (the station's KCARVE.cut; here the ground's notch the hangar fills)
L.parts.filter(function(p){ return p.kind === 'hangar'; }).forEach(function(p){ var s = p.shape;
  L.cuts.push({ id: 'cut_' + p.id, box: [s[1], s[2], s[3], s[4]], y: L.levels.floor, note: 'the cut ' + p.id + ' fills, up to the bench' }); });

var R = typeof globalThis !== 'undefined' ? globalThis : root;
R.SPAN_LAYOUT = L;
})(this);
