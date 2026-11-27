/* ================================================================= ARCKIBUZ — Paolo Soleri's Plate 15 desert arcology: plan & records
   [G data] Pure engine-neutral data: no THREE, no DOM, no Math.random, no rng(). All stochastic choices use KRAND.hash / KRAND.unit.
   Soleri's published Plate 15 parameters:
     Environment: Desert land (sunken rock-cut court + irrigated polygonal vegetable-garden apron)
     Population:  2,500 intact (~1,660 in refurbished settlement core + ~840 in bulkheaded expansion wing)
     Height:      120.0 m total vertical section (y = 0.2 m excavation base to y = 120.2 m rooftop water reservoir)
     Surface:     6.25 ha square excavation perimeter (250 x 250 m); ~7.84 ha domain -> 319 people/ha
   Vertical datum (matching kits/ancients 87-launch.js so y > 0 clears groundM at -0.05 and camera y >= 2):
     PIT_Y = 0.2 m (subterranean pit base), MOAT_Y = 2.0 m (rock-cut trench), COURT_Y = 14.2 m (sunken court deck),
     RIM_Y = 28.0 m (desert mesa / polygonal vegetable gardens, 27.8 m above pit base),
     CITY_Y = 22.0..38.0 m (City Center neck), COMM_Y = 38.0..53.0 m (Community tier & circular council bowl),
     DECK_Y = 53.0..55.5 m (cantilevered sky promenade), HOUS_Y = 55.5..95.1 m (9-storey pinwheel housing crown & louvers),
     TENT_Y = 95.1..105.0 m (peaked tensile shade canopies), RES_Y = 95.1..120.2 m (shoulder Water Reservoir). */
const ARCKIBUZ = (function () {
  'use strict';

  const TAU = Math.PI * 2;
  const r2 = v => Math.round(v * 100) / 100;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  const DIM = {
    SEED: 12720,
    PIT_Y: 0.2,
    MOAT_Y: 2.0,
    COURT_Y: 14.2,
    RIM_Y: 28.0,
    HWY_Y: 25.6,
    CITY_Y0: 22.0,
    CITY_Y1: 38.0,
    COMM_Y0: 38.0,
    COMM_Y1: 53.0,
    DECK_Y0: 53.0,
    DECK_Y1: 55.5,
    HOUS_Y0: 55.5,
    HOUS_Y1: 95.1,
    HOUS_ST: 9,
    HOUS_H: 4.4,
    TENT_Y1: 105.0,
    RES_Y0: 95.1,
    RES_Y1: 120.2,
    PIT_HALF: 114.0,     /* 228 x 228 m rock-cut cliff face */
    RIM_HALF: 125.0,     /* 250 x 250 m = 62,500 m2 = 6.25 ha covered excavation perimeter */
    POD_HX: 84.0,        /* subterranean base half-width E-W */
    POD_HZ: 78.0,        /* subterranean base half-depth N-S */
    CITY_HX: 48.0,       /* City Center trunk 96 x 88 m */
    CITY_HZ: 44.0,
    COMM_HX: 64.0,       /* Community tier 128 x 116 m overall envelope */
    COMM_HZ: 58.0,
    BOWL_R: 23.5,        /* central circular stepped council amphitheater */
    BOWL_R0: 7.5,
    RING_COL_R: 26.8,
    DECK_HX: 88.0,       /* cantilevered sky-promenade 176 x 140 m */
    DECK_HZ: 70.0,
    SKY_HX: 33.0,        /* open central PUBLIC sky court 66 x 48 m */
    SKY_HZ: 24.0,
    HOUS_OUT_X: 74.0,    /* housing wall outer E-W (+/-74 -> 148 m) */
    HOUS_OUT_Z: 62.0,    /* housing wall outer N-S (+/-62 -> 124 m) */
    LOUV_OUT_X: 92.0,    /* sun-breaker louver wings outer E-W (+/-92 -> 184 m total crown span) */
    LOUV_HZ: 34.0,
    MESA_R0: 252.0,      /* flat mesa apron inner radius before outer desert talus slope */
    MESA_R1: 352.0,      /* outer toe where desert berm meets y = 0 groundM */
    HWY_X: 154.0,        /* eastern sunken/bermed desert highway centerline */
    HWY_W: 26.0,
    SHELTER: {
      cx: 216.0, cz: 0.0, hx: 18.0, hz: 18.0,
      y0: 0.2, y1: 9.8, stH: 4.5,
      tunnelX0: 84.0, tunnelX1: 198.0, tunnelW: 9.6, tunnelH: 4.6,
      shaftR0: 4.8, shaftRMin: 3.3, shaftRTop: 6.8, shaftY1: 33.6
    },
    RESERVOIR: {
      x0: 34.0, x1: 72.0, z0: -54.0, z1: -18.0,
      y0: 95.1, y1: 120.2, wallT: 2.8, waterY: 118.6
    }
  };

  function u01(seed, a, b, c) {
    return KRAND.unit(KRAND.hash(seed >>> 0, a | 0, b | 0, c == null ? 0 : c | 0));
  }

  /* SE cantilever & reservoir shear collapse predicate for d = 1 (ruined).
     In d = 1, the south-east housing wing corner (x + 0.72*z > 62 above y = 52) and SE corner of the water reservoir
     cracked and fell into the sunken court and pit moat below. */
  function inCollapse(x, z, y) {
    const yy = y == null ? 60 : y;
    if (yy >= 101 && x > 53 && z > -36) return true;
    if (yy >= 52 && x + 0.72 * z > 62) return true;
    return false;
  }

  /* Interior safety margin inside the structural shear line so no ruined partition stub ever overhangs a cut floor. */
  function inInteriorCollapse(x, z, y) {
    const yy = y == null ? 60 : y;
    if (yy >= 101 && x > 50 && z > -38) return true;
    if (yy >= 51 && x + 0.72 * z > 55) return true;
    return false;
  }

  /* Continuous local ground elevation at (lx, lz) for landscape drawing and KRUINS.watch ground(site, x, z).
     Inside the 228 x 228 m rock-cut pit: MOAT_Y (2.0 m) around the perimeter trench (silted slightly higher in d=1),
     PIT_Y (0.2 m) under the subterranean base footprint. Outside the pit: RIM_Y (28.0 m) across the vegetable-garden
     apron, HWY_Y (25.6 m) in the eastern highway trench, tapering smoothly to 0 m across MESA_R0..MESA_R1. */
  function groundAt(lx, lz, d) {
    const D = DIM, ax = Math.abs(lx), az = Math.abs(lz);
    if (ax < D.PIT_HALF && az < D.PIT_HALF) {
      if (ax <= D.POD_HX + 2 && az <= D.POD_HZ + 2) return D.PIT_Y;
      /* Causeway piers bridging moat on W, S, E */
      if (lx < -D.POD_HX && Math.abs(lz) < 11) return D.PIT_Y;
      if (lz > D.POD_HZ && Math.abs(lx - 6) < 11) return D.PIT_Y;
      if (lx > D.POD_HX && Math.abs(lz) < 12) return D.PIT_Y;
      const silt = d === 1 ? 0.8 * KRAND.fbm(lx * 0.03 + 11, lz * 0.03 + 5, 0, 2, D.SEED + 71) : 0;
      return r2(D.MOAT_Y + silt);
    }
    const rad = Math.max(ax, az, Math.hypot(lx * 0.92, lz * 0.92));
    if (rad >= D.MESA_R1) return 0;
    let h = D.RIM_Y;
    /* Eastern sunken highway cut (z != bridge zone) */
    if (lx > 134 && lx < 174 && az < 246) {
      const bridgeKeep = az < 13 ? 1 : 0;
      const cut = 1 - clamp((Math.abs(lx - D.HWY_X) - D.HWY_W * 0.36) / (D.HWY_W * 0.32), 0, 1);
      h = D.RIM_Y - (D.RIM_Y - D.HWY_Y) * cut * (1 - bridgeKeep);
    } else if ((lx > 128 && lx <= 136 && az > 14 && az < 240) || (lx >= 172 && lx < 182 && az < 240)) {
      /* Low wind/sound berms flanking the desert highway */
      h = D.RIM_Y + 1.8;
    }
    if (rad > D.MESA_R0) {
      const t = clamp((rad - D.MESA_R0) / (D.MESA_R1 - D.MESA_R0), 0, 1);
      const s = t * t * (3 - 2 * t);
      h *= (1 - s);
    }
    return r2(Math.max(0, h));
  }

  /* Faceted polygonal bastion sectors for Soleri's VEGETABLE GARDENS (north, west, south of the 250 x 250 m rim,
     split by the West Causeway at z = -10..10 and South Causeway at x = -4..16, matching Sheet 1 Plan 2). */
  function buildGardens(seed) {
    const R = DIM.RIM_HALF + 2;
    const raw = [
      { id: 'garden.nw', name: 'North-West Vegetable Bastion', crop: 'greens', furrowAng: 0.18,
        poly: [[-R, -12], [-234, -14], [-222, -138], [-152, -214], [-14, -222], [-14, -R], [-R, -R]] },
      { id: 'garden.ne', name: 'North-East Vegetable Bastion', crop: 'grain', furrowAng: -0.12,
        poly: [[-2, -R], [-2, -222], [96, -216], [128, -184], [128, -R]] },
      { id: 'garden.wn', name: 'West Terrace Plots', crop: 'vegetable', furrowAng: 0.0,
        poly: [[-R, 12], [-236, 14], [-228, 118], [-R, 112]] },
      { id: 'garden.sw', name: 'South-West Bastion Fields', crop: 'pulse', furrowAng: 0.32,
        poly: [[-R, 116], [-224, 122], [-168, 218], [-8, 232], [-6, R], [-R, R]] },
      { id: 'garden.se', name: 'South-East Irrigated Bastion', crop: 'tuber', furrowAng: -0.24,
        poly: [[18, R], [18, 232], [116, 214], [128, 174], [128, R]] }
    ];
    const crops = ['grain', 'greens', 'vegetable', 'pulse', 'tuber', 'herb'];
    return raw.map((g, idx) => {
      let A = 0, cx = 0, cz = 0, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      const P = g.poly;
      for (let i = 0; i < P.length; i++) {
        const a = P[i], b = P[(i + 1) % P.length], k = a[0] * b[1] - b[0] * a[1];
        A += k; cx += (a[0] + b[0]) * k; cz += (a[1] + b[1]) * k;
        if (a[0] < x0) x0 = a[0]; if (a[0] > x1) x1 = a[0];
        if (a[1] < z0) z0 = a[1]; if (a[1] > z1) z1 = a[1];
      }
      const area = Math.abs(A) * 0.5;
      cx = Math.abs(A) > 1e-6 ? cx / (3 * A) : (x0 + x1) * 0.5;
      cz = Math.abs(A) > 1e-6 ? cz / (3 * A) : (z0 + z1) * 0.5;
      /* Point-in-polygon check for furrow placement */
      const inside = (px, pz) => {
        let ins = false;
        for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
          const xi = P[i][0], zi = P[i][1], xj = P[j][0], zj = P[j][1];
          if (((zi > pz) !== (zj > pz)) && (px < (xj - xi) * (pz - zi) / ((zj - zi) === 0 ? 1e-9 : (zj - zi)) + xi)) ins = !ins;
        }
        return ins;
      };
      const beds = [];
      const cs = Math.cos(g.furrowAng), sn = Math.sin(g.furrowAng);
      for (let gx = x0 + 8; gx <= x1 - 8; gx += 11) {
        for (let gz = z0 + 8; gz <= z1 - 8; gz += 7.5) {
          if (!inside(gx, gz) || !inside(gx + cs * 4, gz + sn * 4) || !inside(gx - cs * 4, gz - sn * 4)) continue;
          const h = u01(seed, idx * 97 + Math.round(gx), Math.round(gz), 13);
          beds.push({
            x: r2(gx), z: r2(gz), w: 8.6, d: 4.4, ry: g.furrowAng,
            crop: crops[(idx + Math.floor(h * 3)) % crops.length],
            active3: h < 0.86
          });
        }
      }
      return {
        id: g.id, name: g.name, crop: g.crop, furrowAng: g.furrowAng,
        poly: P, area: Math.round(area), cx: r2(cx), cz: r2(cz),
        bbox: [x0, z0, x1, z1], beds
      };
    });
  }

  /* Soleri's dense cellular / hieroglyphic recessed dwelling loggia cassettes across the Housing Crown faces. */
  function buildFacadeCassettes(seed) {
    const out = [];
    const faces = [
      { side: 'N', z: -DIM.HOUS_OUT_Z, nz: -1, nx: 0, span: 132, bays: 3 },
      { side: 'S', z: DIM.HOUS_OUT_Z,  nz: 1,  nx: 0, span: 132, bays: 3 },
      { side: 'W', x: -DIM.HOUS_OUT_X, nz: 0,  nx: -1, span: 48, bays: 1 },
      { side: 'E', x: DIM.HOUS_OUT_X,  nz: 0,  nx: 1,  span: 48, bays: 1 }
    ];
    let cid = 0;
    faces.forEach((F, fi) => {
      const bayW = (F.span - (F.bays - 1) * 4) / F.bays;
      for (let b = 0; b < F.bays; b++) {
        const uCenter = -F.span * 0.5 + bayW * 0.5 + b * (bayW + 4);
        const cols = Math.max(3, Math.round(bayW / 7.2));
        const rows = 7;
        const cw = (bayW - 3.2) / cols, rh = (DIM.HOUS_Y1 - DIM.HOUS_Y0 - 4.0) / rows;
        const cells = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const h = u01(seed, fi * 31 + b, r * 17 + c, 41);
            const motif = h < 0.28 ? 'arch' : h < 0.56 ? 'tee' : h < 0.82 ? 'stepL' : 'twin';
            const lit0 = u01(seed, fi * 53 + b, r * 19 + c, 42) < 0.72;
            const dormantE = F.side === 'E';
            const lit3 = !dormantE && u01(seed, fi * 59 + b, r * 23 + c, 43) < 0.64;
            cells.push({
              r, c, motif, lit0, lit3,
              u: r2(uCenter - (bayW - 3.2) * 0.5 + (c + 0.5) * cw),
              y: r2(DIM.HOUS_Y0 + 2.0 + (r + 0.5) * rh),
              w: r2(cw - 0.7), h: r2(rh - 0.6)
            });
          }
        }
        out.push({
          id: 'cas.' + F.side + '.' + b, idx: cid++, side: F.side,
          nx: F.nx, nz: F.nz,
          x: F.x == null ? r2(uCenter) : F.x,
          z: F.z == null ? r2(uCenter) : F.z,
          w: r2(bayW), y0: DIM.HOUS_Y0 + 1.0, y1: DIM.HOUS_Y1 - 1.0,
          dormant: F.side === 'E',
          cells
        });
      }
    });
    return out;
  }

  function plan(seedIn) {
    const seed = seedIn == null ? DIM.SEED : seedIn;
    const D = DIM;

    /* 1. Organ blocks (for area accounting, KTAGS registration, and reachability graph) */
    const blocks = [
      { id: 'pit-west', name: 'Crop Processing & Cold Vaults', organ: 'pit',
        x0: -84, x1: -18, z0: -76, z1: 76, y0: D.PIT_Y, y1: D.COURT_Y, storeys: 3,
        resShare: 0, pop0: 0, pop3: 0, dormant: false, types: ['industry', 'farm'] },
      { id: 'pit-south', name: 'Central Storage & Public Arcade', organ: 'pit',
        x0: -14, x1: 84, z0: 4, z1: 76, y0: D.PIT_Y, y1: D.COURT_Y, storeys: 3,
        resShare: 0, pop0: 0, pop3: 0, dormant: false, types: ['infrastructure', 'market'] },
      { id: 'pit-east', name: 'Deep Warehousing & Heavy Production Bay', organ: 'dormant',
        x0: -14, x1: 84, z0: -76, z1: -4, y0: D.PIT_Y, y1: D.COURT_Y, storeys: 3,
        resShare: 0, pop0: 0, pop3: 0, dormant: true, types: ['industry', 'infrastructure'] },
      { id: 'shelter', name: 'Eastern Subterranean Shelter & Light Shaft', organ: 'pit',
        x0: D.SHELTER.cx - D.SHELTER.hx, x1: D.SHELTER.cx + D.SHELTER.hx,
        z0: D.SHELTER.cz - D.SHELTER.hz, z1: D.SHELTER.cz + D.SHELTER.hz,
        y0: D.SHELTER.y0, y1: D.SHELTER.y1, storeys: 2,
        resShare: 0.25, pop0: 60, pop3: 60, dormant: false, types: ['civic', 'military'] },
      { id: 'city-center', name: 'City Center Trunk & Concourse', organ: 'community',
        x0: -D.CITY_HX, x1: D.CITY_HX, z0: -D.CITY_HZ, z1: D.CITY_HZ,
        y0: D.CITY_Y0, y1: D.CITY_Y1, storeys: 3,
        resShare: 0, pop0: 0, pop3: 0, dormant: false, types: ['civic', 'market'] },
      { id: 'community', name: 'Community Center & Council Amphitheater', organ: 'community',
        x0: -D.COMM_HX, x1: D.COMM_HX, z0: -D.COMM_HZ, z1: D.COMM_HZ,
        y0: D.COMM_Y0, y1: D.COMM_Y1, storeys: 2,
        resShare: 0.08, pop0: 40, pop3: 40, dormant: false, types: ['civic', 'plaza'] },
      { id: 'housing-n', name: 'North Cantilever Housing Quadrant', organ: 'housing-n',
        x0: -68, x1: 68, z0: -62, z1: -26, y0: D.HOUS_Y0, y1: D.HOUS_Y1, storeys: D.HOUS_ST,
        resShare: 0.78, pop0: 660, pop3: 600, dormant: false, types: ['dwelling-multi'] },
      { id: 'housing-s', name: 'South Cantilever Housing Quadrant', organ: 'housing-s',
        x0: -68, x1: 68, z0: 26, z1: 62, y0: D.HOUS_Y0, y1: D.HOUS_Y1, storeys: D.HOUS_ST,
        resShare: 0.78, pop0: 660, pop3: 540, dormant: false, types: ['dwelling-multi'] },
      { id: 'housing-w', name: 'West Housing Quadrant & Sun-Breaker Wing', organ: 'housing-w',
        x0: -74, x1: -36, z0: -26, z1: 26, y0: D.HOUS_Y0, y1: D.HOUS_Y1, storeys: D.HOUS_ST,
        resShare: 0.78, pop0: 540, pop3: 420, dormant: false, types: ['dwelling-multi'] },
      { id: 'housing-e', name: 'East Housing Quadrant & Sun-Breaker Wing', organ: 'dormant',
        x0: 36, x1: 74, z0: -26, z1: 26, y0: D.HOUS_Y0, y1: D.HOUS_Y1, storeys: D.HOUS_ST,
        resShare: 0.78, pop0: 540, pop3: 0, dormant: true, types: ['dwelling-multi'] },
      { id: 'reservoir', name: 'Rooftop Water Reservoir Tower', organ: 'roof',
        x0: D.RESERVOIR.x0, x1: D.RESERVOIR.x1, z0: D.RESERVOIR.z0, z1: D.RESERVOIR.z1,
        y0: D.RESERVOIR.y0, y1: D.RESERVOIR.y1, storeys: 1,
        resShare: 0, pop0: 0, pop3: 0, dormant: false, types: ['infrastructure'] }
    ];
    blocks.forEach(b => {
      b.footprint = (b.x1 - b.x0) * (b.z1 - b.z0);
      b.floor = b.footprint * b.storeys;
    });

    /* 2. Community pinwheel corner bastions (Plan 1 on Sheet 2: rotational pinwheel around the circular council bowl) */
    const bastions = [
      { id: 'bastion.ne', name: 'North-East Community Bastion', cx: 46, cz: -40, hs: 14, y0: D.COMM_Y0, y1: D.COMM_Y1, recipe: 'officers-hall' },
      { id: 'bastion.se', name: 'South-East Community Bastion', cx: 40, cz: 44,  hs: 14, y0: D.COMM_Y0, y1: D.COMM_Y1, recipe: 'dining-hall' },
      { id: 'bastion.sw', name: 'South-West Community Bastion', cx: -46, cz: 40, hs: 14, y0: D.COMM_Y0, y1: D.COMM_Y1, recipe: 'stern-lounge' },
      { id: 'bastion.nw', name: 'North-West Community Bastion', cx: -40, cz: -44, hs: 14, y0: D.COMM_Y0, y1: D.COMM_Y1, recipe: 'gallery' }
    ];

    /* 3. Vertical structural mega-cores, cylindrical stair drums, and council ring columns */
    const cores = [
      { id: 'core.nw', x: -38, z: -34, hx: 7, hz: 7, y0: D.PIT_Y, y1: D.HOUS_Y1 + 2.4, kind: 'mega' },
      { id: 'core.ne', x: 38,  z: -34, hx: 7, hz: 7, y0: D.PIT_Y, y1: D.HOUS_Y1 + 2.4, kind: 'mega' },
      { id: 'core.sw', x: -38, z: 34,  hx: 7, hz: 7, y0: D.PIT_Y, y1: D.HOUS_Y1 + 2.4, kind: 'mega' },
      { id: 'core.se', x: 38,  z: 34,  hx: 7, hz: 7, y0: D.PIT_Y, y1: D.HOUS_Y1 + 2.4, kind: 'mega' },
      { id: 'drum.nw', x: -32, z: -25, r: 4.4, y0: D.DECK_Y0, y1: D.HOUS_Y1 + 2.8, kind: 'drum' },
      { id: 'drum.ne', x: 32,  z: -25, r: 4.4, y0: D.DECK_Y0, y1: D.HOUS_Y1 + 2.8, kind: 'drum' },
      { id: 'drum.sw', x: -32, z: 25,  r: 4.4, y0: D.DECK_Y0, y1: D.HOUS_Y1 + 2.8, kind: 'drum' },
      { id: 'drum.se', x: 32,  z: 25,  r: 4.4, y0: D.DECK_Y0, y1: D.HOUS_Y1 + 2.8, kind: 'drum' }
    ];
    const ringCols = [];
    for (let i = 0; i < 8; i++) {
      const th = (i + 0.5) / 8 * TAU;
      ringCols.push({
        id: 'rcol.' + i,
        x: r2(D.RING_COL_R * Math.cos(th)),
        z: r2(D.RING_COL_R * Math.sin(th)),
        r: 2.1, y0: D.PIT_Y, y1: D.DECK_Y1
      });
    }

    /* 4. Stepped Sunken Court PROMENADE terraces (North-East stepped flights rising from COURT_Y 14.2 to RIM_Y 28.0) */
    const promenadeSteps = [
      { id: 'prom.0', y0: 14.2, y1: 17.6, x0: -48, x1: 92, z0: -92, z1: -50, eastZ1: 36, eastX0: 54 },
      { id: 'prom.1', y0: 17.6, y1: 21.0, x0: -38, x1: 98, z0: -98, z1: -60, eastZ1: 30, eastX0: 64 },
      { id: 'prom.2', y0: 21.0, y1: 24.5, x0: -28, x1: 106, z0: -106, z1: -72, eastZ1: 24, eastX0: 76 },
      { id: 'prom.3', y0: 24.5, y1: 28.0, x0: -18, x1: 114, z0: -114, z1: -84, eastZ1: 18, eastX0: 88 }
    ];

    /* 5. Peaked TENT STRUCTURE tensile shade canopies over the central PUBLIC sky court & roof promenade */
    const tents = [
      { id: 'tent.c',  cx: -4,  cz: 0,   rx: 18, rz: 15, y0: D.HOUS_Y1, yPeak: 105.0 },
      { id: 'tent.nw', cx: -24, cz: -16, rx: 14, rz: 12, y0: D.HOUS_Y1, yPeak: 103.2 },
      { id: 'tent.sw', cx: -24, cz: 16,  rx: 14, rz: 12, y0: D.HOUS_Y1, yPeak: 103.2 },
      { id: 'tent.ne', cx: 16,  cz: -14, rx: 13, rz: 11, y0: D.HOUS_Y1, yPeak: 102.6 },
      { id: 'tent.se', cx: 18,  cz: 16,  rx: 14, rz: 12, y0: D.HOUS_Y1, yPeak: 103.0 }
    ];

    /* 6. Garden sectors, field sheds, desert outcrops, and facade cassettes */
    const gardens = buildGardens(seed);
    const sheds = [
      { id: 'shed-nw', name: 'West Causeway Irrigation & Seed Shed', x0: -148, x1: -132, z0: -26, z1: -15, y0: D.RIM_Y, h: 3.8 },
      { id: 'shed-sw', name: 'South Causeway Tool & Pump House',     x0: -22,  x1: -8,   z0: 132, z1: 146, y0: D.RIM_Y, h: 3.8 }
    ];
    const outcrops = [
      { id: 'outcrop.0', x: 204, z: 62,  rx: 16, rz: 12, h: 8.5 },
      { id: 'outcrop.1', x: 214, z: 102, rx: 19, rz: 14, h: 10.2 }
    ];
    const cassettes = buildFacadeCassettes(seed);

    /* 7. Circulation & bulkhead graph (every link can be cut by id in ruin or refurbished bulkhead states) */
    const links = [
      { id: 'causeway.west',    a: 'ground',      b: 'city-center' },
      { id: 'causeway.south',   a: 'ground',      b: 'pit-south' },
      { id: 'bridge.east',      a: 'ground',      b: 'city-center' },
      { id: 'pit.ramp.west',    a: 'pit-south',   b: 'pit-west' },
      { id: 'pit.east.bulkhead',a: 'pit-south',   b: 'pit-east' },
      { id: 'tunnel.shelter',   a: 'pit-south',   b: 'shelter' },
      { id: 'shaft.shelter',    a: 'shelter',     b: 'ground' },
      { id: 'trunk.lift.w',     a: 'pit-west',    b: 'city-center' },
      { id: 'trunk.lift.s',     a: 'pit-south',   b: 'city-center' },
      { id: 'trunk.comm',       a: 'city-center', b: 'community' },
      { id: 'stair.nw',         a: 'community',   b: 'housing-n' },
      { id: 'stair.w',          a: 'community',   b: 'housing-w' },
      { id: 'stair.sw',         a: 'community',   b: 'housing-s' },
      { id: 'prom.nw',          a: 'housing-n',   b: 'housing-w' },
      { id: 'prom.sw',          a: 'housing-s',   b: 'housing-w' },
      { id: 'bulkhead.east.n',  a: 'housing-n',   b: 'housing-e' },
      { id: 'bulkhead.east.s',  a: 'housing-s',   b: 'housing-e' },
      { id: 'bulkhead.east.c',  a: 'community',   b: 'housing-e' },
      { id: 'roof.res.stair',   a: 'housing-n',   b: 'reservoir' }
    ];

    /* 8. Ruin fallen wreck blocks (d = 1): deterministic coordinates on open moat floor & SE apron for KRUINS */
    const wrecks = [
      { id: 'wreck.wing.0', x: 98,  z: 46,  w: 16, h: 6.8, d: 12, rx: 0.16, ry: 0.42, rz: -0.22, kind: 'cassette' },
      { id: 'wreck.wing.1', x: 99,  z: 74,  w: 14, h: 5.8, d: 10, rx: -0.12, ry: 1.05, rz: 0.19, kind: 'cassette' },
      { id: 'wreck.louv.0', x: 101, z: 22,  w: 15, h: 4.0, d: 8,  rx: 0.08, ry: -0.35, rz: 0.25, kind: 'louver' },
      { id: 'wreck.res.0',  x: 98,  z: -36, w: 12, h: 5.4, d: 10, rx: -0.18, ry: 0.64, rz: -0.14, kind: 'tank' },
      { id: 'wreck.slab.0', x: 58,  z: 94,  w: 14, h: 3.4, d: 11, rx: 0.10, ry: -0.78, rz: 0.12, kind: 'slab' },
      { id: 'wreck.apron.0',x: 130, z: 36,  w: 11, h: 3.6, d: 9,  rx: -0.06, ry: 0.51, rz: 0.09, kind: 'slab' }
    ];

    /* 9. Refurbished bulkhead seals (d = 3): visible structural seals closing off housing-e and pit-east */
    const bulkheads = [
      { id: 'seal.sky.ne',  x: 35.5, y: 55.5, z: -25.0, w: 2.2, h: 8.8, d: 9.0, label: 'North-East Sky Court Bulkhead' },
      { id: 'seal.sky.se',  x: 35.5, y: 55.5, z: 25.0,  w: 2.2, h: 8.8, d: 9.0, label: 'South-East Sky Court Bulkhead' },
      { id: 'seal.pit.ne',  x: 18.0, y: 0.6,  z: -4.2,  w: 16.0, h: 6.2, d: 1.6, label: 'Deep Production Bay Bulkhead' }
    ];

    const totalFloor = blocks.reduce((s, b) => s + b.floor, 0);
    const gardenArea = gardens.reduce((s, g) => s + g.area, 0);
    const intactPop = blocks.reduce((s, b) => s + b.pop0, 0);
    const refurbPop = blocks.reduce((s, b) => s + b.pop3, 0);
    const coveredHa = r2((D.RIM_HALF * 2 * D.RIM_HALF * 2) / 10000);
    const domainHa = 7.84;

    return {
      seed,
      dim: D,
      blocks,
      bastions,
      cores,
      ringCols,
      promenadeSteps,
      tents,
      gardens,
      sheds,
      outcrops,
      cassettes,
      links,
      wrecks,
      bulkheads,
      stats: {
        height: r2(D.RES_Y1 - D.PIT_Y),
        pitDepth: r2(D.RIM_Y - D.PIT_Y),
        crownSpanX: D.LOUV_OUT_X * 2,
        crownSpanZ: D.DECK_HZ * 2,
        coveredHa,
        gardenHa: r2(gardenArea / 10000),
        domainHa,
        densityPerHa: Math.round(intactPop / domainHa),
        totalFloor: Math.round(totalFloor),
        intactPop,
        refurbPop,
        dormantPop: intactPop - refurbPop
      }
    };
  }

  /* Graph reachability from 'ground' when `cutIds` (links or collapsed block ids) are closed/gone. */
  function reach(P, cutIds) {
    const cut = new Set(cutIds == null ? [] : cutIds);
    const adj = new Map();
    const add = (u, v) => {
      if (!adj.has(u)) adj.set(u, []);
      adj.get(u).push(v);
    };
    for (const L of P.links) {
      if (cut.has(L.id) || cut.has(L.a) || cut.has(L.b)) continue;
      add(L.a, L.b); add(L.b, L.a);
    }
    const seen = new Set();
    if (!cut.has('ground')) {
      const q = ['ground'];
      seen.add('ground');
      while (q.length) {
        const u = q.shift();
        const ns = adj.get(u) || [];
        for (let i = 0; i < ns.length; i++) {
          const v = ns[i];
          if (!seen.has(v)) { seen.add(v); q.push(v); }
        }
      }
    }
    return seen;
  }

  /* Clean [G data] hull descriptor for settlement terrain carving, water basins, and causeway/highway docking. */
  function rAt(y) {
    if (y < 0 || y > DIM.RES_Y1) return 0;
    if (y < DIM.COURT_Y) return DIM.POD_HX;
    if (y < DIM.CITY_Y1) return DIM.CITY_HX;
    if (y < DIM.DECK_Y0) return DIM.COMM_HX;
    if (y <= DIM.HOUS_Y1) return DIM.LOUV_OUT_X;
    return DIM.RESERVOIR.x1;
  }

  function zAt(y) {
    if (y < 0 || y > DIM.RES_Y1) return 0;
    if (y < DIM.COURT_Y) return DIM.POD_HZ;
    if (y < DIM.CITY_Y1) return DIM.CITY_HZ;
    if (y < DIM.DECK_Y0) return DIM.COMM_HZ;
    if (y <= DIM.HOUS_Y1) return DIM.DECK_HZ;
    return Math.abs(DIM.RESERVOIR.z0);
  }

  function zToe(x) {
    const ax = Math.abs(x);
    if (ax <= DIM.POD_HX) return Math.abs(x - 6) <= 5 ? DIM.POD_HZ + 8.0 : DIM.POD_HZ;
    if (ax <= DIM.PIT_HALF) return DIM.PIT_HALF;
    if (ax <= DIM.RIM_HALF) return DIM.RIM_HALF;
    if (ax >= DIM.MESA_R1) return 0;
    return r2(Math.sqrt(Math.max(0, DIM.MESA_R1 * DIM.MESA_R1 - x * x)));
  }

  function zUp(x) {
    const ax = Math.abs(x);
    if (ax <= DIM.POD_HX) return -DIM.POD_HZ;
    if (ax <= DIM.PIT_HALF) return -DIM.PIT_HALF;
    if (ax <= DIM.RIM_HALF) return -DIM.RIM_HALF;
    if (ax >= DIM.MESA_R1) return 0;
    return r2(-Math.sqrt(Math.max(0, DIM.MESA_R1 * DIM.MESA_R1 - x * x)));
  }

  const HULL = {
    span: DIM.LOUV_OUT_X * 2,
    spanZ: DIM.DECK_HZ * 2,
    H: r2(DIM.RES_Y1 - DIM.PIT_Y),
    pitHalf: DIM.PIT_HALF,
    rimHalf: DIM.RIM_HALF,
    podiumHX: DIM.POD_HX,
    podiumHZ: DIM.POD_HZ,
    skirtR0: DIM.MESA_R0,
    skirtR1: DIM.MESA_R1,
    levels: {
      pit: DIM.PIT_Y,
      moat: DIM.MOAT_Y,
      moatWater: 2.48,
      moatSeepage: 2.62,
      court: DIM.COURT_Y,
      cisternWater: 14.44,
      cascadeLip: 22.1,
      highway: DIM.HWY_Y,
      rim: DIM.RIM_Y,
      deck: DIM.DECK_Y1,
      roof: DIM.HOUS_Y1,
      tentPeak: DIM.TENT_Y1,
      reservoirWater: DIM.RESERVOIR.waterY,
      reservoirTop: DIM.RES_Y1
    },
    reservoir: {
      x0: DIM.RESERVOIR.x0, x1: DIM.RESERVOIR.x1,
      z0: DIM.RESERVOIR.z0, z1: DIM.RESERVOIR.z1,
      y0: DIM.RESERVOIR.y0, y1: DIM.RESERVOIR.y1,
      wallT: DIM.RESERVOIR.wallT, inset: 0.3,
      waterY: DIM.RESERVOIR.waterY
    },
    cistern: {
      x0: -44.0, x1: -20.0, z0: -46.0, z1: -23.0,
      curbW: 1.5, curbY0: 14.0, curbY1: 15.05,
      waterY: 14.44,
      lipX0: -35.0, lipX1: -29.0, lipZ: -24.0, lipY: 22.1,
      drop: 7.7, speed: 2.2, spread: 2.5
    },
    moatChannels: {
      west:  { x0: -112.0, x1: -90.0, z0: -106.0, z1: -14.0, level: 2.48 },
      south: { x0: -106.0, x1: -6.0,  z0: 86.0,   z1: 112.0, level: 2.48 },
      ruin:  { x0: -111.0, x1: -92.0, z0: -110.0, z1: -86.0, level: 2.62 }
    },
    canals: [
      { id: 'canal.west',  name: 'West garden causeway canal',     width: 2.8, speed: 1.1,
        pts: [[-126, -9.5, 28.18], [-178, -10.5, 28.14], [-230, -11.5, 28.08]] },
      { id: 'canal.south', name: 'South garden causeway canal',    width: 2.8, speed: 1.1,
        pts: [[-4.5, 126, 28.18], [-5.0, 178, 28.14], [-5.5, 228, 28.08]] },
      { id: 'canal.nw',    name: 'North-west bastion feeder rill', width: 2.4, speed: 1.0,
        pts: [[-15, -127, 28.18], [-15, -172, 28.14], [-15, -216, 28.08]] }
    ],
    canalTroughs: [
      [-232, -125, -13.6, -12.6],
      [-232, -125, -8.4, -7.4],
      [-7.6, -6.6, 125, 230],
      [-3.4, -2.4, 125, 230]
    ],
    docks: {
      westCauseway:  { x: -DIM.RIM_HALF, z: 0,            y: DIM.RIM_Y, width: 17.0 },
      southCauseway: { x: 6.0,           z: DIM.RIM_HALF, y: DIM.RIM_Y, width: 16.0 },
      eastBridge:    { x: 176.0,         z: 0,            y: DIM.RIM_Y, width: 21.0 },
      highwayNorth:  { x: DIM.HWY_X,     z: -244,         y: DIM.HWY_Y, width: 21.0 },
      highwaySouth:  { x: DIM.HWY_X,     z: 244,          y: DIM.HWY_Y, width: 21.0 }
    },
    rAt,
    zAt,
    zToe,
    toeZ: zToe,
    zUp,
    groundAt
  };

  const DORMANT_CUT = ['pit.east.bulkhead', 'bulkhead.east.n', 'bulkhead.east.s', 'bulkhead.east.c'];
  const RUIN_CUT = ['bulkhead.east.s', 'bulkhead.east.c', 'roof.res.stair'];

  return {
    DIM,
    HULL,
    DORMANT_CUT,
    RUIN_CUT,
    u01,
    inCollapse,
    inInteriorCollapse,
    groundAt,
    plan,
    reach
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ARCKIBUZ;
