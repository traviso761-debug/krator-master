/* ================================================================= ARCODIGA — interiors across all 5 Soleri organs
   [G data] Planned during construction so Arcodiga works out-of-the-box in intact (d=0), ruined (d=1), and refurbished
   settlement centerpiece (d=3) form, with every room a culture socket (kits/interiors + kits/ancients-interiors).

   Sub-sites / organs (`u.area`):
     wing     Horizontal Stiffening Wing: Highway & Transit Hub, Research Laboratories (west), Learning Center (east)
     spine    Axial Spine: Public Forum, Commercial Arcade, City Center Council & Magistracy, Cultural Gallery
     crest    Dam Crest Promenade & Upstream VTOL Airport (elevator transfer lobby, hangar bays, flight control bridge)
     ribs     Refurbished Living-Working Buttresses & Central Prows (apartments, artisan workshops, communal messes)
     dormant  Outer Living-Working Buttresses (active in d=0, ruined in d=1, bulkheaded unfurnished sockets in d=3)
     works    Power House (turbine hall, hydro control, crew mess) & Automated Industries (west & east factory vaults)

   No THREE, no DOM. Every storey passes AI.storeyAudit and furnishes cleanly via AI.furnishPlan in any bundled culture. */
var ADG_INTERIORS = (function () {
  'use strict';

  const PROG = {
    bedroom: 'bedroom', kitchen: 'kitchen', bath: 'bath', study: 'study', library: 'library',
    school: 'school', workshop: 'workshop', store: 'store', barracks: 'barracks', tavern: 'tavern',
    hall: 'hall', shrine: 'shrine', antechamber: 'antechamber',
    sickbay: 'sickbay', chartroom: 'chartroom', strongroom: 'strongroom', armoury: 'armoury',
    brig: 'brig', sailloft: 'sailloft', laundry: 'laundry',
    reception_hall: 'hall', dining_hall: 'hall', crew_mess: 'hall', greenhouse_hall: 'workshop',
    engine_hall: 'workshop', bridge_hall: 'study', officers_hall: 'hall', chart_hall: 'study',
    store_hall: 'store', gallery_hall: 'hall', lounge_hall: 'tavern', drill_hall: 'barracks'
  };

  const RECIPE = {
    reception_hall: 'reception', dining_hall: 'dining-hall', crew_mess: 'crew-mess',
    greenhouse_hall: 'greenhouse', engine_hall: 'engine-room', bridge_hall: 'bridge',
    officers_hall: 'officers-hall', chart_hall: 'chart-deck', store_hall: 'store-hall',
    gallery_hall: 'gallery', lounge_hall: 'stern-lounge', drill_hall: 'drill-hall'
  };

  /* Settlement refurbishment dresses for hall recipes (extends AI.DRESS.occupied / AI.DRESS.ancient cleanly) */
  const DRESS_REFURB = {
    table: 'pa_long_table', bench: 'pa_bench', stove: 'pa_brick_grill',
    ceilingLamp: 'pa_hanging_lamp', lampStem: 'pa_lamp_post', banner: 'post-apoc_common_banner',
    scarecrow: null, stall: 'pa_lean_to_stall', marketTable: 'pa_market_table'
  };

  const r3 = v => Math.round(v * 1000) / 1000;
  const cyc = list => (i => list[i % list.length]);

  /* Build the list of architectural interior units in Arcodiga's local frame (x east, z south, y up) */
  function units(d) {
    const D = ARCODIGA.DIM, zUp = ARCODIGA.zUp, zDs = ARCODIGA.zDs, ruin = d === 1;
    const U = [];

    /* ---- 1. HORIZONTAL STIFFENING WING (z centred on 210, y 177..193) ---- */
    /* Central Highway & Transit Hub (x -64..+64) */
    U.push({ id: 'adg.wing.hub.rec', area: 'wing', name: 'Highway Hub — Transit Concourse', shape: 'rect',
      x0: -26, x1: 26, z0: 198, z1: 222, y0: 177, h: 4.6, n: 1, kind: 'reception_hall' });
    U.push({ id: 'adg.wing.hub.west', area: 'wing', name: 'Highway Hub — West Customs & Watch', shape: 'rect',
      x0: -68, x1: -30, z0: 201, z1: 219, y0: 177, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['study', 'brig', 'armoury', 'store']), roomW: 6.2 });
    U.push({ id: 'adg.wing.hub.east', area: 'wing', name: 'Highway Hub — East Dispatch & Waystation', shape: 'rect',
      x0: 30, x1: 68, z0: 201, z1: 219, y0: 177, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['chartroom', 'tavern', 'sickbay', 'store']), roomW: 6.2 });
    U.push({ id: 'adg.wing.hub.chart', area: 'wing', name: 'Highway Hub — Artery Control Deck', shape: 'rect',
      x0: -24, x1: 24, z0: 200, z1: 220, y0: 185.4, h: 4.4, n: 1, kind: 'chart_hall' });

    /* West Wing — Research Laboratories (in ruin d=1, the span x in [-348, -182] collapsed into the canyon) */
    U.push({ id: 'adg.wing.res.inner', area: 'wing', name: 'Research Wing — Assay & Materials Labs', shape: 'rect',
      x0: ruin ? -176 : -236, x1: -140, z0: 201, z1: 219, y0: 185, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['workshop', 'study', 'library', 'store']), roomW: 6.5 });
    if (!ruin) {
      U.push({ id: 'adg.wing.res.hydro', area: 'wing', name: 'Research Wing — Cultivar & Silt Testing Hall', shape: 'rect',
        x0: -292, x1: -244, z0: 201, z1: 219, y0: 185, h: 4.6, n: 1, kind: 'greenhouse_hall' });
    }
    U.push({ id: 'adg.wing.res.outer', area: 'wing', name: 'Research Wing — Deep Instrumentation Labs', shape: 'rect',
      x0: -436, x1: ruin ? -356 : -300, z0: 201, z1: 219, y0: 185, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['workshop', 'chartroom', 'study', 'strongroom', 'sickbay', 'store']), roomW: 6.5 });

    /* East Wing — Learning Center (x +136..+430) */
    U.push({ id: 'adg.wing.lrn.inner', area: 'wing', name: 'Learning Center — Lecture & Seminar Bar', shape: 'rect',
      x0: 140, x1: 236, z0: 201, z1: 219, y0: 185, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['school', 'library', 'study', 'bedroom']), roomW: 6.5 });
    U.push({ id: 'adg.wing.lrn.hall', area: 'wing', name: 'Learning Center — Convocation Refectory', shape: 'rect',
      x0: 244, x1: 292, z0: 200, z1: 220, y0: 185, h: 4.6, n: 1, kind: 'dining_hall' });
    U.push({ id: 'adg.wing.lrn.outer', area: 'wing', name: 'Learning Center — Archives & Collegium', shape: 'rect',
      x0: 300, x1: 416, z0: 201, z1: 219, y0: 185, h: 4.2, n: 2, mode: 'bar',
      kinds: cyc(['library', 'school', 'study', 'barracks', 'kitchen', 'bath']), roomW: 6.5 });

    /* ---- 2. AXIAL CITY CENTER & COMMERCIAL SPINE (x -34..+34, z -210..+140, y 156..186) ---- */
    U.push({ id: 'adg.spine.public', area: 'spine', name: 'Axial Spine — Public Market & Tavern Vaults', shape: 'rect',
      x0: -9, x1: 9, z0: -120, z1: 40, y0: 156, h: 4.4, n: 1, mode: 'bar',
      kinds: cyc(['tavern', 'workshop', 'store', 'kitchen', 'study']), roomW: 6.8 });
    U.push({ id: 'adg.spine.comm', area: 'spine', name: 'Axial Spine — Commercial Exchange Arcade', shape: 'rect',
      x0: -9, x1: 9, z0: -130, z1: 70, y0: 166, h: 4.4, n: 1, mode: 'bar',
      kinds: cyc(['study', 'strongroom', 'tavern', 'store', 'workshop', 'chartroom']), roomW: 6.6 });
    U.push({ id: 'adg.spine.council', area: 'spine', name: 'Axial Spine — City Center Grand Assembly', shape: 'rect',
      x0: -16, x1: 16, z0: 82, z1: 130, y0: 176, h: 5.0, n: 1, kind: 'dining_hall' });
    U.push({ id: 'adg.spine.civic', area: 'spine', name: 'Axial Spine — Magistracy & Civic Offices', shape: 'rect',
      x0: -9, x1: 9, z0: -90, z1: 74, y0: 176, h: 4.4, n: 1, mode: 'bar',
      kinds: cyc(['study', 'library', 'sickbay', 'chartroom', 'strongroom', 'brig']), roomW: 6.6 });
    U.push({ id: 'adg.spine.gallery', area: 'spine', name: 'Axial Spine — Gallery of the Reservoir', shape: 'rect',
      x0: -14, x1: 14, z0: -18, z1: 30, y0: 186, h: 4.8, n: 1, kind: 'gallery_hall' });
    U.push({ id: 'adg.spine.officers', area: 'spine', name: 'Axial Spine — Wardens & Engineers Suites', shape: 'rect',
      x0: -14, x1: 14, z0: 38, z1: 68, y0: 186, h: 4.6, n: 1, kind: 'officers_hall' });

    /* ---- 3. DAM CREST PROMENADE & UPSTREAM VTOL AIRPORT ---- */
    const crestSpans = [
      { id: 'adg.crest.w2', name: 'Crest Promenade — West Gallery II', x0: -134, x1: -94 },
      { id: 'adg.crest.w1', name: 'Crest Promenade — West Gallery I', x0: -58, x1: -18 },
      { id: 'adg.crest.e1', name: 'Crest Promenade — East Gallery I', x0: 18, x1: 58 },
      { id: 'adg.crest.e2', name: 'Crest Promenade — East Gallery II', x0: 94, x1: 134 }
    ];
    for (const cs of crestSpans) {
      U.push({ id: cs.id, area: 'crest', name: cs.name, shape: 'arc',
        x0: cs.x0, x1: cs.x1, za: 38, zb: 58, y0: 344, h: 4.0, n: 2, mode: 'bar',
        kinds: cyc(['bedroom', 'study', 'kitchen', 'bath']), roomW: 6.0 });
    }
    U.push({ id: 'adg.crest.lounge', area: 'crest', name: 'Crest Promenade — Reservoir Overlook Lounge', shape: 'rect',
      x0: -12, x1: 12, z0: zUp(0) + 42, z1: zUp(0) + 58, y0: 361, h: 4.2, n: 1, kind: 'lounge_hall' });

    const V = D.VTOL;
    U.push({ id: 'adg.vtol.lobby', area: 'crest', name: 'VTOL Tower — Causeway & Elevator Transfer Hall', shape: 'rect',
      x0: -22, x1: 22, z0: V.z + 8, z1: V.z + 26, y0: 360, h: 4.4, n: 1, kind: 'reception_hall' });
    U.push({ id: 'adg.vtol.hangar', area: 'crest', name: 'VTOL Airport — Avionics & Rigging Bays', shape: 'rect',
      x0: ruin ? -18 : -48, x1: 48, z0: V.z - 46, z1: V.z - 28, y0: 410, h: 4.6, n: 1, mode: 'bar',
      kinds: cyc(['workshop', 'sailloft', 'store', 'armoury']), roomW: 7.0 });
    U.push({ id: 'adg.vtol.bridge', area: 'crest', name: 'VTOL Airport — Flight Control Bridge', shape: 'rect',
      x0: -18, x1: 18, z0: V.z + 24, z1: V.z + 44, y0: 418, h: 4.4, n: 1, kind: 'bridge_hall' });

    /* ---- 4. REFURBISHED LIVING-WORKING RIBS & CENTRAL PROWS (active in d=0 and d=3) ---- */
    const activeStacks = [
      { key: 'prow1', name: 'Central Prow W1', x: -52, w: 20, ys: [116, 156, 212, 260, 304] },
      { key: 'prow2', name: 'Central Prow E1', x: 52, w: 20, ys: [116, 156, 212, 260, 304] },
      { key: 'ribw1', name: 'Living-Working Rib W1', x: -232, w: 17.6, ys: ruin ? [124, 172] : [124, 172, 224, 272] },
      { key: 'ribe1', name: 'Living-Working Rib E1', x: 232, w: 17.6, ys: [124, 172, 224, 272] }
    ];
    for (const st of activeStacks) {
      for (let k = 0; k < st.ys.length; k++) {
        const yy = st.ys[k], zBase = Math.round(zDs(st.x, yy));
        U.push({
          id: 'adg.ribs.' + st.key + '.y' + yy, area: 'ribs',
          name: st.name + ' — Living-Working Tier ' + yy + ' m', shape: 'rect',
          x0: st.x - st.w / 2, x1: st.x + st.w / 2, z0: zBase + 2, z1: zBase + 46,
          y0: yy, h: 3.8, n: 1, mode: 'bar',
          kinds: k === 2 ? cyc(['workshop', 'study', 'store', 'kitchen']) : cyc(['bedroom', 'bedroom', 'kitchen', 'bath', 'study', 'workshop']),
          roomW: 5.8
        });
      }
      if (!(ruin && st.key === 'ribw1')) {
        const zMess = Math.round(zDs(st.x, 200));
        U.push({
          id: 'adg.ribs.' + st.key + '.mess', area: 'ribs',
          name: st.name + ' — Neighbourhood Refectory', shape: 'rect',
          x0: st.x - 10, x1: st.x + 10, z0: zMess + 6, z1: zMess + 28,
          y0: 200, h: 4.0, n: 1, kind: 'crew_mess'
        });
      }
    }

    /* ---- 5. DORMANT OUTER LIVING-WORKING RIBS (furnished in d=0, ruined in d=1, bulkheaded sockets in d=3) ---- */
    const dormantStacks = [
      { key: 'ribw4', name: 'Outer Rib W4 (Dormant Sector)', x: -409, w: 17.6, ys: [140, 196, 252, 300] },
      { key: 'ribe4', name: 'Outer Rib E4 (Dormant Sector)', x: 409, w: 17.6, ys: [140, 196, 252, 300] }
    ];
    for (const st of dormantStacks) {
      for (let k = 0; k < st.ys.length; k++) {
        const yy = st.ys[k], zBase = Math.round(zDs(st.x, yy));
        U.push({
          id: 'adg.dormant.' + st.key + '.y' + yy, area: 'dormant',
          name: st.name + ' — Tier ' + yy + ' m', shape: 'rect',
          x0: st.x - st.w / 2, x1: st.x + st.w / 2, z0: zBase + 2, z1: zBase + 44,
          y0: yy, h: 3.8, n: 1, mode: 'bar',
          kinds: cyc(['bedroom', 'bedroom', 'workshop', 'kitchen', 'bath', 'store']),
          roomW: 5.8
        });
      }
    }

    /* ---- 6. TOE WORKS: POWER HOUSE & AUTOMATED INDUSTRIES (y 3..12 m) ---- */
    U.push({ id: 'adg.works.turbines', area: 'works', name: 'Power House — Main Hydro Turbine Hall', shape: 'rect',
      x0: -34, x1: 34, z0: -26, z1: 12, y0: 3, h: 6.0, n: 1, kind: 'engine_hall' });
    U.push({ id: 'adg.works.pwbar', area: 'works', name: 'Power House — Switchgear, Mess & Workshops', shape: 'rect',
      x0: -96, x1: 96, z0: 24, z1: 42, y0: 3, h: 4.4, n: 2, mode: 'bar',
      kinds: cyc(['workshop', 'study', 'store', 'laundry', 'kitchen', 'barracks']), roomW: 6.8 });
    U.push({ id: 'adg.works.pwctrl', area: 'works', name: 'Power House — Spillway & Grid Control', shape: 'rect',
      x0: -22, x1: 22, z0: -18, z1: 4, y0: 12, h: 4.4, n: 1, kind: 'bridge_hall' });
    U.push({ id: 'adg.works.indw', area: 'works', name: 'Automated Industries — West Fabrication Hall', shape: 'rect',
      x0: -320, x1: -200, z0: 8, z1: 26, y0: 3, h: 4.6, n: 2, mode: 'bar',
      kinds: cyc(['workshop', 'workshop', 'store', 'sailloft', 'study']), roomW: 7.2 });
    U.push({ id: 'adg.works.indstore', area: 'works', name: 'Automated Industries — Silt & Ore Store Hall', shape: 'rect',
      x0: 204, x1: 248, z0: 6, z1: 30, y0: 3, h: 5.2, n: 1, kind: 'store_hall' });
    U.push({ id: 'adg.works.inde', area: 'works', name: 'Automated Industries — East Assembly Vaults', shape: 'rect',
      x0: 256, x1: 348, z0: 8, z1: 26, y0: 3, h: 4.6, n: 2, mode: 'bar',
      kinds: cyc(['workshop', 'store', 'armoury', 'workshop', 'study']), roomW: 7.0 });

    return U;
  }

  function outline(u) {
    if (u.shape === 'arc') {
      const zUp = ARCODIGA.zUp, n = Math.max(6, Math.ceil(Math.abs(u.x1 - u.x0) / 6)), a = [], b = [];
      for (let i = 0; i <= n; i++) {
        const x = u.x0 + (u.x1 - u.x0) * i / n;
        a.push([r3(x), r3(zUp(x) + u.za)]);
        b.push([r3(x), r3(zUp(x) + u.zb)]);
      }
      return a.concat(b.reverse());
    }
    return [[u.x0, u.z0], [u.x1, u.z0], [u.x1, u.z1], [u.x0, u.z1]];
  }

  function buildStorey(AI, u, i) {
    const y = r3(u.y0 + i * u.h), h = r3(u.h), id = u.id + '.s' + i;
    const p = PROG[u.kind];
    if (u.mode !== 'bar') {
      const O = outline(u), rec = RECIPE[u.kind] || null;
      const st = AI.hallPlate({ id: id, level: i, y: y, h: h, poly: O, kind: p || 'hall', doorEdge: 2, doorW: 2.0, furnish: true, recipe: rec });
      const R = st.rooms[0];
      /* enclose the hall with a partition perimeter and doorway so cutaway views show clean room walls and operable doors */
      st.walls.push({
        id: id + '.perim', pts: O.concat([O[0]]), y: y, h: h, rooms: [R.id, null],
        door: R.doors[0] ? { at: R.doors[0].at, w: R.doors[0].w } : null, broken: false, pavilion: true
      });
      return st;
    }
    let path, depth;
    if (u.shape === 'arc') {
      const zUp = ARCODIGA.zUp, zm = (u.za + u.zb) / 2;
      const sl = x => Math.atan(Math.abs((2 * ARCODIGA.DIM.ARCH_RISE * x) / Math.pow(ARCODIGA.DIM.SPAN / 2, 2)));
      const th = Math.max(sl(u.x0), sl(u.x1));
      depth = (u.zb - u.za) * Math.cos(th) - 0.6;
      const t0 = (depth / 2) * Math.sin(sl(u.x0)) + 0.3, t1 = (depth / 2) * Math.sin(sl(u.x1)) + 0.3;
      const a = u.x0 + t0, b = u.x1 - t1;
      path = t => { const x = a + (b - a) * t; return [x, zUp(x) + zm]; };
    } else {
      const w = u.x1 - u.x0, d = u.z1 - u.z0;
      if (d >= w) {
        path = t => [(u.x0 + u.x1) / 2, u.z0 + d * t];
        depth = w;
      } else {
        path = t => [u.x0 + w * t, (u.z0 + u.z1) / 2];
        depth = d;
      }
    }
    return AI.barPlate({
      id: id, level: i, y: y, h: h, path: path, depth: depth,
      side: depth >= 14 ? 'both' : 'left', cw: 2.4, roomW: u.roomW == null ? 6.4 : u.roomW,
      kinds: u.kinds, ends: ['core', null], door: 1.1
    });
  }

  function buildings(AI, filterArea, d) {
    const list = units(d), out = [];
    for (const u of list) {
      if (filterArea && u.area !== filterArea) continue;
      const storeys = [];
      for (let i = 0; i < u.n; i++) storeys.push(buildStorey(AI, u, i));
      const O = outline(u), xs = O.map(q => q[0]), zs = O.map(q => q[1]);
      const bx = [Math.min.apply(null, xs), Math.max.apply(null, xs), Math.min.apply(null, zs), Math.max.apply(null, zs)];
      out.push({
        id: u.id, name: u.name, area: u.area, kind: u.kind || 'bar',
        storeys: storeys, floors: true, hollow: null,
        collapse: u.collapse || null,
        inside: (x, z, y) => x >= bx[0] - 0.25 && x <= bx[1] + 0.25 && z >= bx[2] - 0.25 && z <= bx[3] + 0.25 && y >= u.y0 - 0.6 && y <= u.y0 + u.n * u.h + 0.6
      });
    }
    return out;
  }

  function entry(AI, opts) {
    opts = opts || {};
    return {
      name: 'Arcodiga — dam arcology',
      frag: '8av1-arcodiga-interiors.js',
      culture: opts.culture || 'ancient',
      wealth: opts.wealth == null ? 0.58 : opts.wealth,
      types: ['infrastructure', 'civic', 'dwelling-multi', 'industry'],
      furnish: opts.furnish !== false,
      buildings: function (d) { return buildings(AI, opts.area || null, d); }
    };
  }

  function levels(area) {
    const ys = new Set();
    for (const u of units()) {
      if (area && u.area !== area) continue;
      for (let i = 0; i < u.n; i++) ys.add(r3(u.y0 + i * u.h));
    }
    return Array.from(ys).sort((a, b) => a - b);
  }

  return { units: units, outline: outline, buildings: buildings, entry: entry, levels: levels, PROG: PROG, RECIPE: RECIPE, DRESS_REFURB: DRESS_REFURB };
})();
