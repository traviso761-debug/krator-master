/* ==================== NULAB — its records for a future West Rift sim (plain data, [G data]) ====================
   settlements/nulab/PLAN.md section 8 (the scope's W0-W6), step W1's rows written as data only: the sim itself is a later step
   (core/region/WEST-RIFT-SCOPE.md section 6). The shapes are the East Rift valley spec's (core/region/50-region-valley.js, the
   scope's section 0):
     settlement  {id, name, faction, people, px, py, scale, eats, start, works: [{kind, crew, out, rate, batch, season, site}]}
     district    a bulk district at scale 200 (the X0 pattern: never drawn), with `share` (its tithe) to its seat
     road        {id, from, to | stops, legs, carriers, cap, goods, share, cut, halts, closed}
   Every number is an estimate (est.) from PLAN.md, its basis beside it; the owner settled the answers they rest on (2026-11-16,
   PLAN.md section 0), and the town's 20,000. Positions are scale-model 5.1 pixels (2 km). No three.js, no DOM: node and Godot
   read it. `foodBalance(o)` is PLAN.md section 5.1 as a function, so a test (test-nl-town.js) holds the plan to its numbers. */
(function (root) {
  'use strict';
  var DIET = {city: {grain: 150, fish: 15, salt: 6}, rural: {grain: 165, salt: 5}, shore: {grain: 125, fish: 45, salt: 5}, camp: {grain: 190, salt: 6}, fort: {grain: 180, salt: 6}};   /* kg a head a year: XAN_TUNE T.diet (PLAN.md 5) */
  var NL_SIM = {
    version: '2026-11-16',
    diet: DIET,
    /* ---- the city (W1: the pin ssk1wsnjjd; the owner, 2026-11-16: 20,000) */
    city: {id: 'ssk1wsnjjd', name: 'Nulab', faction: 'dalab', people: 20000, px: 443, py: 1359, scale: 50, eats: 'city',
      start: {grain: 3000, fish: 120, salt: 60},   /* a quarter's stores at the year's start (est.) */
      works: [
        {kind: 'market', id: 'nl.market', crew: 40, site: 'the great market'},
        {kind: 'fishery', id: 'nl.harbour', crew: 360, out: 'fish', rate: 1000, unit: 't/yr', site: 'the harbour on the bay'},   /* the city's own boats: 2 x PLAN.md's 500 at 20,000 */
        {kind: 'store', id: 'nl.granary', out: 'grain', keepDays: 720, cap: 6000, site: 'the granary yard (the tithe and the carry-over)'},
        {kind: 'smelter', id: 'nl.copper', crew: 420, out: 'copper', rate: 175, unit: 't/yr', also: {bronze: 17}, inputs: {ore: 'the rift fill and the skarn', tin: 2, charcoal: 900}, site: 'the copper works at the outlet'},
        {kind: 'gene', id: 'nl.gene', crew: 120, out: 'gene-craft', rate: 80, unit: 'units/yr', site: 'the gene-houses'},
        {kind: 'yard', id: 'nl.yard', crew: 60, out: 'boats', rate: 24, unit: 'hulls/yr', site: 'the shipwright\'s slip'},
        {kind: 'garrison', id: 'nl.garrison', crew: 300, eats: 'fort', note: '~60 Giants (PLAN.md question 8)'}],
      quarters: {precinct: 1000, gene: 1200, court: 800, garrison: 1400, harbour: 3600, granary: 1000, works: 2200, market: 3800, line: 200, wards: 4800}   /* PLAN.md 3.2, doubled (est.) */
    },
    /* ---- the basin as four bulk districts (PLAN.md 4.1; question 3, settled: the north shore's tithe goes to Ledge) */
    districts: [
      {id: 'wr.basin.south', name: 'The south plain', faction: 'dalab', people: 28000, scale: 200, km2: 1600, seat: 'ssk1wsnjjd', share: 0.1, eats: 'rural'},
      {id: 'wr.basin.west', name: 'The Kould valley and the west shore', faction: 'dalab', people: 8000, scale: 200, km2: 1680, seat: 'ssk1wsnjjd', share: 0.1, eats: 'rural'},
      {id: 'wr.basin.east', name: 'The Chimes Riba valley and the east plain', faction: 'dalab', people: 10000, scale: 200, km2: 2712, seat: 'ssk1wsnjjd', share: 0.1, eats: 'rural'},
      {id: 'wr.basin.north', name: 'The north shore under Ledge\'s cliff', faction: 'dalab', people: 4000, scale: 200, km2: 564, seat: 'ledge', share: 0.1, eats: 'rural'}],
    /* ---- the basin's villages by kind (PLAN.md 4.2: core/hamlet, the Dalab row core/hamlet/dalab), n villages of `people`
       each, and how many of them stand in each district (south, west, east, north) */
    villages: [
      {kind: 'farming', what: 'shore and plain farms: rice, lotus root, wild rice; helix bean, ashroot, grain', n: 72, people: 420, by: [44, 12, 12, 4]},
      {kind: 'farming', what: 'tea, silk and fibre: mist tea, mulberry and lotus silk, sea-linen, woad, camphor', crop: 'fibre', n: 14, people: 350, by: [4, 3, 6, 1]},
      {kind: 'fishing', what: 'fishing hamlets on the shores, at the Kould\'s mouth, on the Chimes Riba\'s level reach', n: 24, people: 300, by: [8, 5, 4, 7]},
      {kind: 'gene', what: 'the priests\' breeding stations (Daranch\'s pattern)', n: 6, people: 250, by: [0, 0, 6, 0]},
      {kind: 'ranch', what: 'lizard ranches: draught and meat', n: 8, people: 250, by: [4, 1, 3, 0]},
      {kind: 'lumber', what: 'cork, cedar, willow coppice, charcoal for the works', n: 6, people: 220, by: [1, 3, 2, 0]},
      {kind: 'clay', what: 'brick, rammed earth, the potters\' clay', n: 4, people: 200, by: [1, 1, 2, 0]},
      {kind: 'mine', what: 'the iron hamlet (good iron, 443,1375)', n: 1, people: 300, by: [1, 0, 0, 0], px: 443, py: 1375}],
    farmsteads: 1800,   /* herders, watch posts, ferry and toll keepers: no village */
    /* the near ring the page draws (src/42-nl-ring.js): ids kept so the sim and the page name the same villages */
    ring: ['nl.ring.beanfield', 'nl.ring.lotusflat', 'nl.ring.westfarm', 'nl.ring.netshore', 'nl.ring.bayhead', 'nl.ring.genefarm', 'nl.ring.lizardrun', 'nl.ring.clayyard'],
    /* ---- outside the basin's 50,000 and fed from it (the scope's 3b) */
    dependents: [
      {id: 'wr.skarn.dalab', name: 'The Dalab skarn hamlet', faction: 'dalab', people: 400, px: 416, py: 1377, scale: 10, eats: 'camp', parent: 'ssk1wsnjjd',
        works: [{kind: 'mine', out: 'copper ore', note: 'copper 240, iron 210: the best in the West Rift'}]},
      {id: 'wr.posts.dalab', name: 'Dalab\'s posts on the road and at Blakhed\'s toll', faction: 'dalab', people: 100, eats: 'fort', parent: 'ssk1wsnjjd'}],
    /* ---- the roads (PLAN.md section 6) */
    roads: [
      {id: 'nl.road.lake', from: 'ssk1wsnjjd', to: 'ledge', legs: [{mode: 'boat', km: 54, days: 1, what: 'the lake crossing to the lifts\' foot'}, {mode: 'lift', km: 1.3, halt: 'loj-fower', cut: 'union', what: 'Ledge\'s lifts'}],
        carriers: 'lake ferries and grain barges', goods: {north: ['grain', 'fish', 'silk', 'copper', 'bronze', 'gene-craft'], south: ['salt', 'iron', 'tin', 'cloth']}, note: 'the main road; the Union\'s lever at the lifts (W5: the strike)'},
      {id: 'nl.road.stair', from: 'ssk1wsnjjd', to: 'blakhed', legs: [{mode: 'boat', km: 33, what: 'down the Chimes Riba to the Blak Riba\'s mouth'}, {mode: 'stair', km: 57, rise: 3000, what: 'up the Blak Riba\'s ravine by Blakhed\'s ropes and ladders'}],
        goods: {up: ['grain', 'salt'], down: ['ice', 'eggs', 'rope', 'salt']}, note: 'the Great Caravan comes down it (question 11, settled)'},
      {id: 'nl.road.kould', from: 'ssk1wsnjjd', to: 'wr.skarn.dalab', legs: [{mode: 'pack', km: 80, rise: 3240}], goods: {down: ['ore', 'bloom'], up: ['food', 'charcoal', 'tools']}},
      {id: 'nl.road.iron', from: 'ssk1wsnjjd', to: 'iron', legs: [{mode: 'cart', km: 32}], goods: {down: ['iron ore']}},
      {id: 'nl.road.drovers', from: 'drovers', to: 'ssk1wsnjjd', legs: [{mode: 'drove', km: 108}], goods: {down: ['meat', 'hides', 'felt', 'wool', 'salt']},
        note: 'salt: the drovers are a major source (the owner, 2026-11-16), from the western fells\' high salt basins (WEST-RIFT-SCOPE 4.4)'},
      {id: 'nl.road.line', from: 'ssk1wsnjjd', stops: ['line.5', 'line.4'], closed: true, note: 'the lake viaduct is fallen (question 2, settled): the Line is joined by the lake road'}],
    /* the Great Caravan's stop (W3): gate.dalab.nulab becomes this city, about year day 211 */
    caravan: {replaces: 'gate.dalab.nulab', day: 211, lands: ['cacao', 'tea', 'brocade', 'sulfur', 'wax'], loads: ['lotus silk', 'mist tea', 'camphor', 'bronze']},
    /* the tithe (W4): a tenth of the districts' harvest, about half of it sold on (est.) */
    tithe: {rate: 0.1, soldShare: 0.5},
    /* PLAN.md section 5.1 as a function (o overrides any input): grain-equivalent tonnes a year */
    foodBalance: function (o) {
      o = o || {};
      var v = function (k, d) { return o[k] == null ? d : o[k]; };
      var yieldT = v('yield', 1.6), hands = v('hands', 12000), townHands = v('townHands', 1900), loss = v('loss', 0.2);
      var town = v('town', NL_SIM.city.people), shore = v('shore', 7200), rural = v('rural', 50000 - 7200);
      var harvest = (hands + townHands) * yieldT, net = harvest * (1 - loss);
      var home = town * DIET.city.grain / 1000 + rural * DIET.rural.grain / 1000 + shore * DIET.shore.grain / 1000;
      var exports = v('ledge', 1000) + v('blakhed', 600) + v('union', 1200) + 400 * DIET.camp.grain / 1000 + 100 * DIET.fort.grain / 1000;
      var r = function (x) { return Math.round(x); };
      return {harvest: r(harvest), net: r(net), home: r(home), exports: r(exports), surplus: r(net - home - exports),
        months: Math.round((net - home - exports) / (home / 12) * 10) / 10};
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = NL_SIM; else root.NL_SIM = NL_SIM;
})(this);
