/* ================================================================= ARCKIBUZ — interior floor plates & room sockets
   [G data] Pure engine-neutral data: no THREE, no DOM, no Math.random, no rng().
   Builds kits/ancients-interiors floor plates (AI.barPlate, AI.hallPlate, AI.gridPlate, AI.ringPlate) across every
   Arckibuz organ so the kit's interiors pass (src/8zz-interiors.js + 8zz4-arckibuz-host.js) draws partitions, doors,
   floors, KTAGS records, and culture-socketed furniture across:
     - 'pit'       : Crop Processing (west), Storage & Public Arcade (south), Eastern Subterranean Shelter, Garden Sheds
     - 'community' : City Center Trunk (3 civic levels), Community Council Ring (AI.ringPlate) & 4 Pinwheel Bastions
     - 'housing-n' : North Cantilever Housing Quadrant (9 storeys) + Rooftop Lounge Pavilion
     - 'housing-s' : South Cantilever Housing Quadrant (9 storeys; SE corner sheared in d = 1 ruin)
     - 'housing-w' : West Cantilever Housing Quadrant (9 storeys) + Rooftop Greenhouse Pavilion
     - 'dormant'   : East Housing Quadrant (9 storeys) + Deep Production Bay (intact in d = 0, ruined in d = 1,
                     visibly bulkheaded expansion socket in d = 3) */
var AKB_INTERIORS = (function () {
  'use strict';

  const r3 = v => Math.round(v * 1000) / 1000;
  const boxPoly = (x0, x1, z0, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const cyc = list => (i => list[i % list.length]);

  /* Add a perimeter partition wall around a hallPlate pavilion/chamber so doorways get leaves and ruins break stubs. */
  function wrapHallWall(st, id) {
    const R = st.rooms[0];
    if (!R || !R.poly) return st;
    const d0 = R.doors && R.doors[0] ? { at: R.doors[0].at, w: R.doors[0].w } : null;
    st.walls.push({
      id: id + '.perim',
      pts: R.poly.concat([R.poly[0]]),
      y: st.y,
      h: st.h,
      rooms: [R.id, null],
      door: d0,
      broken: false
    });
    return st;
  }

  /* Combine two independent non-overlapping plate storeys at the same elevation y into one storey record. */
  function mergeStoreys(id, level, y, h, parts, outline) {
    const rooms = [], walls = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      for (let j = 0; j < p.rooms.length; j++) rooms.push(p.rooms[j]);
      for (let j = 0; j < p.walls.length; j++) walls.push(p.walls[j]);
    }
    return { id, level, y, h, outline, rooms, walls };
  }

  function boundsCheck(x0, x1, z0, z1, y0, y1) {
    return (x, z, y) => x >= x0 - 0.25 && x <= x1 + 0.25 && z >= z0 - 0.25 && z <= z1 + 0.25 &&
      (y == null || (y >= y0 - 0.6 && y <= y1 + 0.6));
  }

  function buildings(AI, d) {
    const D = ARCKIBUZ.DIM;
    const colFn = d === 1 ? (x, z, y) => ARCKIBUZ.inInteriorCollapse(x, z, y) : null;
    const out = [];

    /* ------------------------------------------------------------------
       1. SUBTERRANEAN PIT WORKS: Crop Processing, Storage, Shelter, Sheds
       ------------------------------------------------------------------ */
    /* 1a. Crop Processing (west pit block: x -82..-20, z -74..74, 2 subterranean levels) */
    const cropS0 = AI.barPlate({
      id: 'akb.crop.s0', level: 0, y: 0.6, h: 4.2,
      path: t => [-52, -66 + 132 * t], depth: 24, side: 'both', cw: 2.7, roomW: 12.0,
      kinds: cyc(['workshop', 'store', 'kitchen', 'laundry', 'mess', 'workshop']),
      ends: ['core', 'antechamber'], door: 1.3
    });
    const cropS1 = AI.gridPlate({
      id: 'akb.crop.s1', level: 1, y: 7.4, h: 4.2,
      x0: -76, x1: -26, z0: -60, z1: 60, bay: [12, 10], aisle: 4.0, along: 'z',
      kinds: cyc(['workshop', 'store', 'shop', 'kitchen'])
    });
    out.push({
      id: 'akb.pit.crop', name: 'Crop Processing & Cold Presses', area: 'pit',
      storeys: [cropS0, cropS1], floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-84, -18, -76, 76, 0, 14.5)
    });

    /* 1b. Central Storage & Public Arcade (south pit block: x -12..82, z 6..74, 2 levels) */
    const storHall0 = wrapHallWall(AI.hallPlate({
      id: 'akb.stor.h0', level: 0, y: 0.6, h: 4.2,
      poly: boxPoly(-10, 20, 10, 30), kind: 'store', doorEdge: 2, doorW: 2.2, recipe: 'store-hall'
    }), 'akb.stor.h0');
    const storBar0 = AI.barPlate({
      id: 'akb.stor.b0', level: 0, y: 0.6, h: 4.2,
      path: t => [-8 + 84 * t, 54], depth: 22, side: 'both', cw: 2.5, roomW: 12.0,
      kinds: cyc(['store', 'strongroom', 'guard', 'store', 'antechamber']),
      ends: ['core', 'core'], door: 1.3
    });
    const storS0 = mergeStoreys('akb.stor.s0', 0, 0.6, 4.2, [storHall0, storBar0], boxPoly(-12, 82, 8, 72));
    const pubHall1 = wrapHallWall(AI.hallPlate({
      id: 'akb.stor.h1', level: 1, y: 7.4, h: 4.2,
      poly: boxPoly(-10, 16, 10, 28), kind: 'mess', doorEdge: 2, doorW: 2.0, recipe: 'crew-mess'
    }), 'akb.stor.h1');
    const pubBar1 = AI.barPlate({
      id: 'akb.stor.b1', level: 1, y: 7.4, h: 4.2,
      path: t => [-8 + 84 * t, 54], depth: 22, side: 'both', cw: 2.5, roomW: 12.0,
      kinds: cyc(['shop', 'tavern', 'kitchen', 'lobby', 'shop', 'hall']),
      ends: ['core', 'core'], door: 1.3
    });
    const storS1 = mergeStoreys('akb.stor.s1', 1, 7.4, 4.2, [pubHall1, pubBar1], boxPoly(-12, 82, 8, 72));
    out.push({
      id: 'akb.pit.storage', name: 'Subterranean Storage & Public Concourse', area: 'pit',
      storeys: [storS0, storS1], floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-14, 84, 4, 76, 0, 14.5)
    });

    /* 1c. Eastern Subterranean SHELTER (under the desert plateau & flared light shaft, cx = 216, cz = 0) */
    const shS0 = AI.barPlate({
      id: 'akb.shelter.s0', level: 0, y: 0.6, h: 3.9,
      path: t => [200 + 32 * t, 0], depth: 22, side: 'both', cw: 2.5, roomW: 6.5,
      kinds: cyc(['bunkroom', 'sickbay', 'store', 'armoury', 'kitchen']),
      ends: ['antechamber', 'core'], door: 1.2
    });
    const shS1 = wrapHallWall(AI.hallPlate({
      id: 'akb.shelter.s1', level: 1, y: 5.1, h: 4.0,
      poly: boxPoly(203, 229, -9, 9), kind: 'hall', doorEdge: 0, doorW: 2.0, recipe: 'crew-mess'
    }), 'akb.shelter.s1');
    out.push({
      id: 'akb.pit.shelter', name: 'Eastern Subterranean Shelter', area: 'pit',
      storeys: [shS0, shS1], floors: true, hollow: null, collapse: null,
      inside: boundsCheck(198, 234, -18, 18, 0, 10.2)
    });

    /* 1d. Vegetable Garden Seed & Pump Sheds on the desert rim (y = 28.2) */
    const shedNW = wrapHallWall(AI.hallPlate({
      id: 'akb.shed.nw', level: 0, y: 28.2, h: 3.5,
      poly: boxPoly(-145, -135, -24, -16), kind: 'workshop', doorEdge: 2, doorW: 1.5
    }), 'akb.shed.nw');
    const shedSW = wrapHallWall(AI.hallPlate({
      id: 'akb.shed.sw', level: 0, y: 28.2, h: 3.5,
      poly: boxPoly(-20, -10, 134, 144), kind: 'store', doorEdge: 0, doorW: 1.5
    }), 'akb.shed.sw');
    out.push({
      id: 'akb.garden.sheds', name: 'Vegetable Garden Irrigation & Seed Sheds', area: 'pit',
      storeys: [mergeStoreys('akb.sheds.s0', 0, 28.2, 3.5, [shedNW, shedSW], boxPoly(-148, -8, -26, 146))],
      floors: false, hollow: null, collapse: null,
      inside: (x, z, y) => ((x >= -148.5 && x <= -131.5 && z >= -26.5 && z <= -14.5) ||
                            (x >= -22.5 && x <= -7.5 && z >= 131.5 && z <= 146.5)) &&
                            (y == null || (y >= 27.6 && y <= 32.5))
    });

    /* ------------------------------------------------------------------
       2. TRUNK / NECK: City Center (2 civic levels) + Community Ring & 4 Pinwheel Bastions
       ------------------------------------------------------------------ */
    const cityS0 = AI.barPlate({
      id: 'akb.city.s0', level: 0, y: 22.4, h: 4.4,
      path: t => [-42 + 84 * t, 0], depth: 24, side: 'both', cw: 2.7, roomW: 12.0,
      kinds: cyc(['study', 'sickbay', 'library', 'guard', 'chartroom', 'study']),
      ends: ['core', 'core'], door: 1.3
    });
    const cityRec = wrapHallWall(AI.hallPlate({
      id: 'akb.city.rec', level: 1, y: 29.8, h: 4.5,
      poly: boxPoly(-11, 11, -38, -28), kind: 'lobby', doorEdge: 2, doorW: 2.2, recipe: 'reception'
    }), 'akb.city.rec');
    const cityBar1 = AI.barPlate({
      id: 'akb.city.b1', level: 1, y: 29.8, h: 4.5,
      path: t => [-42 + 84 * t, 14], depth: 24, side: 'both', cw: 2.7, roomW: 12.0,
      kinds: cyc(['shop', 'library', 'school', 'lobby', 'tavern', 'study']),
      ends: ['antechamber', 'antechamber'], door: 1.3
    });
    const cityS1 = mergeStoreys('akb.city.s1', 1, 29.8, 4.5, [cityRec, cityBar1], boxPoly(-46, 46, -42, 42));
    out.push({
      id: 'akb.trunk.city', name: 'City Center Concourse & Civic Halls', area: 'community',
      storeys: [cityS0, cityS1], floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-48, 48, -44, 44, 21.8, 38.2)
    });

    /* Community Center Ring (AI.ringPlate around the open r = 23.5 m Circular Council Amphitheater) */
    const commRing0 = AI.ringPlate({
      id: 'akb.comm.ring0', level: 2, y: 38.4, h: 5.8,
      cx: 0, cz: 0, rOut: () => 35.5, depth: 8.2, cw: 2.8, n: 12, sym: 4,
      kinds: cyc(['hall', 'study', 'lobby', 'antechamber']), door: 1.3
    });
    const commRing1 = AI.ringPlate({
      id: 'akb.comm.ring1', level: 3, y: 45.6, h: 5.8,
      cx: 0, cz: 0, rOut: () => 35.5, depth: 8.2, cw: 2.8, n: 12, sym: 4,
      kinds: cyc(['library', 'study', 'tavern', 'hall']), door: 1.3
    });
    out.push({
      id: 'akb.trunk.ring', name: 'Community Council Ring Galleries', area: 'community',
      storeys: [commRing0, commRing1], floors: false, hollow: null, collapse: colFn,
      inside: (x, z, y) => Math.hypot(x, z) <= 36.2 && (y == null || (y >= 37.8 && y <= 53.2))
    });

    /* Community 4 Pinwheel Corner Bastions (Plan 1 on Sheet 2) */
    const bNE0 = wrapHallWall(AI.hallPlate({
      id: 'akb.bast.ne0', level: 2, y: 38.4, h: 5.8,
      poly: boxPoly(35, 57, -49, -31), kind: 'hall', doorEdge: 2, doorW: 1.8, recipe: 'officers-hall'
    }), 'akb.bast.ne0');
    const bSE0 = wrapHallWall(AI.hallPlate({
      id: 'akb.bast.se0', level: 2, y: 38.4, h: 5.8,
      poly: boxPoly(25, 55, 33, 54), kind: 'mess', doorEdge: 0, doorW: 2.0, recipe: 'dining-hall'
    }), 'akb.bast.se0');
    const bSW0 = wrapHallWall(AI.hallPlate({
      id: 'akb.bast.sw0', level: 2, y: 38.4, h: 5.8,
      poly: boxPoly(-56, -36, 32, 48), kind: 'tavern', doorEdge: 0, doorW: 1.8, recipe: 'stern-lounge'
    }), 'akb.bast.sw0');
    const bNW0 = wrapHallWall(AI.hallPlate({
      id: 'akb.bast.nw0', level: 2, y: 38.4, h: 5.8,
      poly: boxPoly(-53, -27, -51, -37), kind: 'gallery', doorEdge: 2, doorW: 1.8, recipe: 'gallery'
    }), 'akb.bast.nw0');
    const bastS0 = mergeStoreys('akb.bast.s0', 2, 38.4, 5.8, [bNE0, bSE0, bSW0, bNW0], boxPoly(-60, 60, -56, 56));

    const bNE1 = AI.barPlate({
      id: 'akb.bast.ne1', level: 3, y: 45.6, h: 5.8,
      path: t => [34 + 24 * t, -40], depth: 20, side: 'both', cw: 2.3, roomW: 8.0,
      kinds: cyc(['study', 'library', 'hall']), ends: null, door: 1.2
    });
    const bSE1 = AI.barPlate({
      id: 'akb.bast.se1', level: 3, y: 45.6, h: 5.8,
      path: t => [28 + 24 * t, 44], depth: 20, side: 'both', cw: 2.3, roomW: 8.0,
      kinds: cyc(['kitchen', 'tavern', 'mess']), ends: null, door: 1.2
    });
    const bSW1 = AI.barPlate({
      id: 'akb.bast.sw1', level: 3, y: 45.6, h: 5.8,
      path: t => [-58 + 24 * t, 40], depth: 20, side: 'both', cw: 2.3, roomW: 8.0,
      kinds: cyc(['living', 'bedroom', 'study']), ends: null, door: 1.2
    });
    const bNW1 = AI.barPlate({
      id: 'akb.bast.nw1', level: 3, y: 45.6, h: 5.8,
      path: t => [-52 + 24 * t, -44], depth: 20, side: 'both', cw: 2.3, roomW: 8.0,
      kinds: cyc(['school', 'library', 'study']), ends: null, door: 1.2
    });
    const bastS1 = mergeStoreys('akb.bast.s1', 3, 45.6, 5.8, [bNE1, bSE1, bSW1, bNW1], boxPoly(-60, 60, -56, 56));
    out.push({
      id: 'akb.trunk.bastions', name: 'Community Pinwheel Bastions', area: 'community',
      storeys: [bastS0, bastS1], floors: false, hollow: null, collapse: colFn,
      inside: boundsCheck(-62, 62, -57, 57, 37.8, 53.2)
    });

    /* ------------------------------------------------------------------
       3. CANTILEVERED HOUSING CROWN: 3 Grand Soleri Duplex Macro-Decks + Roof Pavilions
       ------------------------------------------------------------------ */
    const resKindsA = cyc(['bedroom', 'living', 'kitchen', 'bedroom', 'bunkroom', 'study', 'bedroom', 'laundry']);
    const resKindsB = cyc(['living', 'bedroom', 'bedroom', 'kitchen', 'study', 'bunkroom', 'bedroom', 'living']);
    const HOUS_DECKS = [56.0, 69.2, 82.4];

    /* 3a. North Housing Quadrant (housing-n: x -66..66, z -60..-28, 3 macro-decks + roof lounge) */
    const stN = [];
    for (let i = 0; i < HOUS_DECKS.length; i++) {
      const y = HOUS_DECKS[i];
      stN.push(AI.barPlate({
        id: 'akb.hn.s' + i, level: i, y, h: 4.5,
        path: t => [-66 + 132 * t, -44], depth: 26, side: 'both', cw: 2.7, roomW: 12.0,
        kinds: i % 2 === 0 ? resKindsA : resKindsB, ends: ['core', 'core'], door: 1.2
      }));
    }
    stN.push(wrapHallWall(AI.hallPlate({
      id: 'akb.hn.roof', level: HOUS_DECKS.length, y: r3(D.HOUS_Y1 + 0.3), h: 4.0,
      poly: boxPoly(-24, -4, -51, -35), kind: 'tavern', doorEdge: 2, doorW: 1.8, recipe: 'stern-lounge'
    }), 'akb.hn.roof'));
    out.push({
      id: 'akb.hous.n', name: 'North Housing Quadrant', area: 'housing-n',
      storeys: stN, floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-68, 68, -62, -26, D.HOUS_Y0 - 0.5, D.HOUS_Y1 + 5.0)
    });

    /* 3b. South Housing Quadrant (housing-s: x -66..66, z 28..60, 3 macro-decks) */
    const stS = [];
    for (let i = 0; i < HOUS_DECKS.length; i++) {
      const y = HOUS_DECKS[i];
      stS.push(AI.barPlate({
        id: 'akb.hs.s' + i, level: i, y, h: 4.5,
        path: t => [-66 + 132 * t, 44], depth: 26, side: 'both', cw: 2.7, roomW: 12.0,
        kinds: i % 2 === 0 ? resKindsB : resKindsA, ends: ['core', 'core'], door: 1.2
      }));
    }
    out.push({
      id: 'akb.hous.s', name: 'South Housing Quadrant', area: 'housing-s',
      storeys: stS, floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-68, 68, 26, 62, D.HOUS_Y0 - 0.5, D.HOUS_Y1 + 1.0)
    });

    /* 3c. West Housing Quadrant (housing-w: x -72..-38, z -24..24, 3 macro-decks + roof greenhouse) */
    const stW = [];
    for (let i = 0; i < HOUS_DECKS.length; i++) {
      const y = HOUS_DECKS[i];
      stW.push(AI.barPlate({
        id: 'akb.hw.s' + i, level: i, y, h: 4.5,
        path: t => [-55, -24 + 48 * t], depth: 26, side: 'both', cw: 2.7, roomW: 12.0,
        kinds: i % 2 === 0 ? resKindsA : resKindsB, ends: ['antechamber', 'antechamber'], door: 1.2
      }));
    }
    stW.push(wrapHallWall(AI.hallPlate({
      id: 'akb.hw.roof', level: HOUS_DECKS.length, y: r3(D.HOUS_Y1 + 0.3), h: 4.2,
      poly: boxPoly(-69, -43, -9, 9), kind: 'workshop', doorEdge: 1, doorW: 1.8, recipe: 'greenhouse'
    }), 'akb.hw.roof'));
    out.push({
      id: 'akb.hous.w', name: 'West Housing Quadrant & Solarium', area: 'housing-w',
      storeys: stW, floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-74, -36, -26, 26, D.HOUS_Y0 - 0.5, D.HOUS_Y1 + 5.0)
    });

    /* ------------------------------------------------------------------
       4. DORMANT / EXPANSION SOCKET (intact in d = 0, ruined in d = 1, bulkheaded socket in d = 3):
          East Housing Quadrant (housing-e) + Deep North-East Production Bay (pit-east)
       ------------------------------------------------------------------ */
    const stE = [];
    for (let i = 0; i < HOUS_DECKS.length; i++) {
      const y = HOUS_DECKS[i];
      stE.push(AI.barPlate({
        id: 'akb.he.s' + i, level: i, y, h: 4.5,
        path: t => [55, -24 + 48 * t], depth: 26, side: 'both', cw: 2.7, roomW: 12.0,
        kinds: i % 2 === 0 ? resKindsB : resKindsA, ends: ['antechamber', 'antechamber'], door: 1.2
      }));
    }
    out.push({
      id: 'akb.hous.e', name: 'East Housing Quadrant (Expansion Wing)', area: 'dormant',
      storeys: stE, floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(36, 74, -26, 26, D.HOUS_Y0 - 0.5, D.HOUS_Y1 + 1.0)
    });

    const prodHall0 = wrapHallWall(AI.hallPlate({
      id: 'akb.pe.h0', level: 0, y: 0.6, h: 4.2,
      poly: boxPoly(-10, 20, -30, -10), kind: 'workshop', doorEdge: 0, doorW: 2.2, recipe: 'engine-room'
    }), 'akb.pe.h0');
    const prodBar0 = AI.barPlate({
      id: 'akb.pe.b0', level: 0, y: 0.6, h: 4.2,
      path: t => [-8 + 84 * t, -54], depth: 22, side: 'both', cw: 2.5, roomW: 12.0,
      kinds: cyc(['workshop', 'store', 'armoury', 'workshop', 'strongroom']),
      ends: ['core', 'core'], door: 1.3
    });
    const prodS0 = mergeStoreys('akb.pe.s0', 0, 0.6, 4.2, [prodHall0, prodBar0], boxPoly(-12, 82, -72, -8));
    const prodS1 = AI.gridPlate({
      id: 'akb.pe.s1', level: 1, y: 7.4, h: 4.2,
      x0: -10, x1: 76, z0: -66, z1: -14, bay: [12, 10], aisle: 4.0, along: 'x',
      kinds: cyc(['store', 'workshop', 'store', 'workshop'])
    });
    out.push({
      id: 'akb.pit.east', name: 'Deep Warehousing & Production Bay', area: 'dormant',
      storeys: [prodS0, prodS1], floors: true, hollow: null, collapse: colFn,
      inside: boundsCheck(-14, 84, -76, -4, 0, 14.5)
    });

    return out;
  }

  function entry(AI) {
    return {
      name: 'Arckibuz — desert arcology',
      frag: '8aw1-arckibuz-interiors.js',
      culture: 'ancient',
      wealth: 0.58,
      types: ['dwelling-multi', 'civic', 'industry', 'infrastructure'],
      furnish: true,
      buildings: function (d) { return buildings(AI, d); }
    };
  }

  const AREA_LABELS = {
    'pit': 'Pit Works & Shelter',
    'community': 'City Center & Council Bowl',
    'housing-n': 'North Housing Wing',
    'housing-s': 'South Housing Wing',
    'housing-w': 'West Housing Wing',
    'dormant': 'East Expansion Wing & Deep Bay'
  };

  return { buildings, entry, AREA_LABELS };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = AKB_INTERIORS;
