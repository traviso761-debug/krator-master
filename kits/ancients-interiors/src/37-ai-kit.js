/* ======================== Ancients interiors: the Ancients kit's buildings ========================
   The rooms inside the ORIGINAL Ancients kit's buildings (kits/ancients, the `kit` target's types), as plates
   (35-ai-plates.js) in each builder's own frame: the builder's group stands at its site with no rotation, x east,
   z south, y up, front +z. Every number here is the builder's (its fragment and line are named in each entry), so a
   room stays inside the shell the builder draws.

     AI.KIT[type] = { name, frag, furnish, culture, wealth, types, skip?, buildings(d) -> [building] }
       building  { id, name, storeys: [storey], floors: true when the builder draws no floor slabs of its own,
                   hollow: [{ box: [x0, x1, y0, y1, z0, z1] } | { cyl: [cx, cz, r, y0, y1] }] the intact dark mass
                   the host must clear before the rooms show, collapse(x, z, y) -> true where the ruin fell in }
     AI.kitPlan(type, d) -> { type, d, state, furnish, culture, buildings }   the plan for one decay level:
       0 intact      the plan as built, furnished by default (the culture `ancient`)
       1 ruined, 2 toppled   partitions broken (about half, by wall id) and the rooms under a collapse open
       3, 4 rehabilitated    the ruined fabric (the builder reuses its ruin), a fifth of the walls broken
       5 worn        the plan as built
     Only intact rooms are furnished by default. The others are SOCKETS: every room keeps its kind, so a world can
     furnish any state in any culture (AI.furnishPlan(plan, cat, { culture })) without a new plan.
   Skipped: the skyscrapers (rooms later, never furnished), the megastructures (the Unnamed, the Gate, the dam) and
   the types with no interior (amphitheatre, radar, dish, the fuel station's canopy and spheres).
   ====================================================================== */
(function (AI) {
  'use strict';
  const TAU = Math.PI * 2;
  /* the hex of the Ancients' lathes: vertices at multiples of 60 degrees (kits/ancients 38-helpers2.js hexR) */
  const hexR = (R, th) => { const a = R * Math.cos(Math.PI / 6), f = ((th % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3); return a / Math.cos(f - Math.PI / 6); };
  AI.hexR = hexR;
  const cyc = list => (i => list[i % list.length]);

  AI.KIT = {};
  AI.SKIP = {
    skyA: 'skyscraper: rooms planned later, never furnished', skyB: 'skyscraper', skyC: 'skyscraper', skyD: 'skyscraper', skyE: 'skyscraper',
    skyF: 'skyscraper', skyG: 'skyscraper', skyH: 'skyscraper', flat: 'skyscraper (the Flatiron)', perch: 'skyscraper hybrid on a solid podium',
    mega: 'megastructure (the Unnamed)', arc: 'megastructure (the Gate)', dam: 'megastructure (Theodiga)',
    amph: 'no interior: an open amphitheatre', radar: 'no interior: a lattice mast', dish: 'no interior: a dish on a pylon',
    fuel: 'no interior worth a room: a canopy, storage spheres and a 5 m kiosk dome'
  };

  /* ---------------------------------------------------------------- POLICE STATION, the Watch (73-police.js)
     The block: a battered hex lathe (nu 6), vertex radius 34 at its foot (y .8) to 30 at its top (y 12.8); the intact
     builder lines it with a dark lathe at .9 of the skin, so the rooms keep inside .88. Two storeys of 6 m (the ruin's
     civRooms step). Ground: the charge hall in the middle, offices, cells, the armoury and stores round a corridor;
     upper: the barracks floor. The vehicle bays (a 30 x 10 x 50 box at (42, -10), boxD inside) are one garage hall. */
  AI.KIT.police = { name: 'Police station (the Watch)', frag: '73-police.js', culture: 'ancient', wealth: 0.55, types: ['military', 'civic'],
    buildings: function (d) {
      const R = y => 34 - 4 * (y - 0.8) / 12, rOut = y => th => 0.88 * hexR(R(y), th);
      /* three rooms to a face: an office, a cell, a store; one face's store is the armoury, the opposite one's the kitchen */
      const kinds0 = (i, n) => { const f = Math.floor(i * 6 / n), k = i % 3; return k === 0 ? 'study' : k === 1 ? 'brig' : f === 0 ? 'armoury' : f === 3 ? 'kitchen' : 'store'; };
      const kinds1 = cyc(['barracks', 'barracks', 'study']);
      const s0 = AI.ringPlate({ id: 'police.g', level: 0, y: 1.1, h: 5.4, rOut: rOut(1.1), depth: 7, cw: 2.4, roomW: 6.5, sym: 6, kinds: kinds0, core: { r: 13, kind: 'hall', recipe: 'crew-mess' } });   /* the charge hall doubles as the mess */
      const s1 = AI.ringPlate({ id: 'police.u', level: 1, y: 6.9, h: 5.5, rOut: rOut(6.9), depth: 7, cw: 2.4, roomW: 6.5, sym: 6, kinds: kinds1, core: { r: 12, kind: 'hall' } });
      const bays = d === 0 ? AI.hallPlate({ id: 'police.bays', level: 0, y: 0.8, h: 8.6, kind: 'workshop',
        poly: [[28, -34.5], [56, -34.5], [56, 14], [28, 14]], doorEdge: 1, doorW: 4 }) : AI.hallPlate({ id: 'police.bays', level: 0, y: 0.8, h: 8.6, kind: 'workshop',
        poly: [[28, -34.5], [56, -34.5], [56, -2.5], [28, -2.5]], doorEdge: 1, doorW: 4 });   /* the ruin's south bay caved in */
      return [{ id: 'police', name: 'the Watch', storeys: [s0, s1], floors: true, hollow: [],
                inside: (x, z) => Math.hypot(x, z) < 34 },
              { id: 'police-bays', name: 'the vehicle bays', storeys: [bays], floors: false, hollow: [{ box: [27.2, 56.8, 0.6, 9.6, -34.6, d === 0 ? 14.6 : -1.6] }],
                inside: (x, z) => x > 27 && x < 57 && z > -35 && z < 15 }];
    } };

  /* the plans' building types onto core/tags' vocabulary (KTAGS.VOCAB.types: civic market shop tavern inn industry farm
     dwelling-single dwelling-multi infrastructure religious funerary park military statue plaza fountain) */
  AI.TYPE_MAP = { industrial: 'industry', laboratory: 'industry', research: 'civic', learning: 'civic', culture: 'civic', school: 'civic',
    hospital: 'civic', office: 'civic', residential: 'dwelling-multi', apartments: 'dwelling-multi', 'multi-family dwelling': 'dwelling-multi',
    'single-family dwelling': 'dwelling-single', house: 'dwelling-single', hotel: 'inn', transport: 'infrastructure', starport: 'infrastructure',
    government: 'civic', library: 'civic', police: 'military', bunker: 'military', factory: 'industry', 'data centre': 'industry' };
  AI.vocabTypes = list => { const out = []; (list || []).forEach(t => { const v = AI.TYPE_MAP[t] || t; if (out.indexOf(v) < 0) out.push(v); }); return out; };

  /* ---------------------------------------------------------------- the plan for one decay level */
  const STATE = { 0: 'intact', 1: 'ruined', 2: 'toppled', 3: 'rehab', 4: 'rehab', 5: 'intact' };
  /* o: { place } a placement seed (any number or string: a world passes its site's, e.g. Math.round(x) + ',' +
     Math.round(z)), so each ruin placed in a build breaks a little differently (AI.ruinStorey); { jitter } how much */
  AI.kitPlan = function (type, d, o) {
    o = o || {};
    const T = AI.KIT[type];
    if (!T) return { type, d, skip: AI.SKIP[type] || 'no plan', buildings: [] };
    const bs = T.buildings(d);
    const ruin = d === 1 || d === 2 ? 0.45 : d === 3 || d === 4 ? 0.2 : 0;
    bs.forEach(function (B) {
      B.storeys.forEach(function (st) {
        if (ruin) AI.ruinStorey(st, type + '|' + d, { frac: ruin, collapse: B.collapse ? (x, z) => B.collapse(x, z, st.y) : null, place: o.place, jitter: o.jitter });
        st.rooms.forEach(function (R) { R.culture = T.culture; R.wealth = T.wealth; R.building = B.id; });
      });
    });
    return { type, d, place: o.place == null ? null : o.place, state: STATE[d], name: T.name, furnish: d === 0 && T.furnish !== false, culture: T.culture, wealth: T.wealth, types: AI.vocabTypes(T.types), buildings: bs };
  };

  /* ---------------------------------------------------------------- the SOCKET: furnish a plan in a culture
     AI.cultureAdapter(cat, cultures) -> the adapter with only those cultures' pieces in list(): an intact Ancient
     building takes 'ancient' alone, so a slot with no Ancient piece stays empty instead of filling with salvage.
     AI.furnishPlan(plan, cat, o) -> { rooms: [{ room, R, plan }], pieces, templates }
       o.culture   the culture to furnish in (default: the plan's, and only when plan.furnish: an intact building);
                   any catalog culture fills the same rooms (a reclaimed ruin in Iziz: { culture: 'iziz', all: true })
       o.cultures  the adapter's culture filter (default [culture]); pass null for the culture's whole family chain
       o.all       furnish rooms a ruin marked unfurnished too (not the open ones, not corridors and cores)
       o.wealth, o.seed, o.y (the plan's ground in the world: room y is added to it)
     ROOMS ARE TEMPLATED: rooms of one kind and one shape (to 5 cm, once turned so the door faces +z) are furnished
     once and the placements copied, turned and moved into each; a ring of 18 like rooms costs one placer call. */
  AI.cultureAdapter = function (cat, cultures) {
    if (!cultures) return cat;
    const keep = {}; cultures.forEach(c => { keep[c] = true; });
    let L = null;
    return Object.assign({}, cat, { list: function () { if (!L) L = cat.list().filter(e => keep[e.culture]); return L; } });
  };
  AI.furnishPlan = function (plan, cat, o) {
    o = o || {};
    const IX = AI.IX || (typeof KratorInteriors !== 'undefined' ? KratorInteriors : null);
    const culture = o.culture || (plan.furnish ? plan.culture : null), out = { rooms: [], pieces: 0, templates: 0 };
    if (!culture || !IX) return out;
    const ad = AI.cultureAdapter(cat, o.cultures === undefined ? [culture] : o.cultures), cache = {}, y0 = o.y || 0;
    out.adapter = ad; out.catalog = cat;   /* audit a placer template through out.adapter, a recipe (AI.audit(r.recipe, out.catalog)) through the catalog */
    AI.planRooms(plan).forEach(function (R) {
      if (!R.poly || R.kind === 'corridor' || R.kind === 'core' || R.open) return;
      if (!R.furnish && !o.all) return;
      /* the room's own frame: origin at its centroid, turned so its first door lies toward +z */
      const n = R.poly.length, c = R.poly.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
      const dr = R.doors[0] ? R.doors[0].at : [c[0], c[1] + 1], ang = Math.atan2(dr[0] - c[0], dr[1] - c[1]);
      const cs = Math.cos(ang), sn = Math.sin(ang);
      const toL = p => [Math.round(((p[0] - c[0]) * cs - (p[1] - c[1]) * sn) * 20) / 20, Math.round(((p[0] - c[0]) * sn + (p[1] - c[1]) * cs) * 20) / 20];
      const lp = R.poly.map(toL), ld = R.doors.map(d => ({ at: toL(d.at), w: d.w, to: d.to }));
      const key = R.kind + '|' + culture + '|' + Math.round((R.h || 3) * 10) + '|' + JSON.stringify(lp) + JSON.stringify(ld.map(d => d.at));
      let T = cache[key];
      /* a room with a RECIPE (a big hall): the recipe in the room's inscribed rectangle, in the culture's dress when it
         has one (AI.DRESS[culture]) else the Ancients', fit-or-skip; the placer fills nothing else */
      if (!T && R.recipe && AI.RECIPES[R.recipe]) {
        const xs = lp.map(p => p[0]), zs = lp.map(p => p[1]), hw = Math.min(-Math.min(...xs), Math.max(...xs)), hd = Math.min(-Math.min(...zs), Math.max(...zs));
        const w = Math.max(4, hw * 2 * 0.86), d = Math.max(4, hd * 2 * 0.86);
        const res = AI.recipe(R.recipe, { w, d, h: R.h || 3.2, dress: AI.DRESS[culture] ? culture : 'ancient', seed: (o.seed || 1) + out.templates * 7 }, cat);   /* the dress is the culture's choice: the whole catalog */
        const room = IX.normRoom({ id: 'tpl.' + plan.type + '.' + out.templates, kind: R.kind, culture, y: 0, h: R.h || 3, poly: lp, doors: ld });
        const placements = res.placements.map(p => ({ key: p.key, variant: p.v, x: p.x, y: p.y, z: p.z, ry: p.ry, anchor: null, type: null, culture, recipe: R.recipe, role: p.role }));
        T = cache[key] = { room, plan: { placements, report: { missing: [], recipe: R.recipe, skipped: res.skipped.length } }, recipe: res };
        out.templates++;
      }
      if (!T) {
        const room = IX.normRoom({ id: 'tpl.' + plan.type + '.' + out.templates, kind: R.kind, culture, wealth: o.wealth == null ? (R.wealth == null ? 0.5 : R.wealth) : o.wealth,
          y: 0, h: R.h || 3, poly: lp, doors: ld, seed: (o.seed || 1) + out.templates * 7 });
        T = cache[key] = { room, plan: IX.furnishRoom(room, ad, { fallback: 'none' }) };
        out.templates++;
      }
      /* the template's placements back into the plan's frame */
      const places = T.plan.placements.map(function (p) {
        const x = p.x * cs + p.z * sn + c[0], z = -p.x * sn + p.z * cs + c[1];
        return Object.assign({}, p, { x, z, y: y0 + R.y + (p.y || 0), ry: (p.ry || 0) + ang, room: R.id });
      });
      out.rooms.push({ R, template: key, room: T.room, plan: T.plan, recipe: T.recipe || null, placements: places });
      out.pieces += places.length;
    });
    return out;
  };

  /* every room of a plan, flat */
  AI.planRooms = function (plan) { const out = []; plan.buildings.forEach(B => B.storeys.forEach(st => st.rooms.forEach(R => out.push(R)))); return out; };
})(KratorAncientsInteriors);
