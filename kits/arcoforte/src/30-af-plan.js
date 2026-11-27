/* ================================================================= ARCOFORTE — the unified plan ([G data])
   Inspired by Paolo Soleri's Arcoforte (Sea cliff: 300 m tall, 29 ha, peak 20,000; reference/arcology-arcoforte-1..3.webp).
   Synthesizes all top-view, bridge/mid-level, cross-section, elevation, and sea-cliff study drawings into one 1:1 complex:
     1. Sea Cliff, Multilevel Harbour Lift Platform (3 decks, twin boat-lift gantries), NW Marina & Sub-Cliff Works
        (Refurbished Fishing/Cold-Storage Works + Sealed/Ruined Automated Industry Vaults + Twin Inclined Cliff Shafts)
     2. Horseshoe "Neocliff" Ring around (0, 10): 9 Battered Trapezoidal Dwelling Bastions (4 West, 5 East, 68 deg slope),
        Vaulted City Center Arcades facing the sheltered Park, 13 Square Courtyard Skylight Wells with radial oculi,
        and the y = 144 m Garden Promenade topped by 6 Mushroom-Pier Public/Rec Belvederes
     3. Sheltered Central Park (r < 142 m, y = 66..82 m), Waterways (stream, two reflection pools, cliff sluice cascade),
        two arched Viaduct Footbridges, and the Ribbed Park Amphitheatre
     4. Southern Linear City Throat (z = 204..468 m): twin 6-storey live/work bars, transit/canal avenue, 3 Plaza Drums
     5. Domed Rotunda ("Tourist Center" & Residential Drum, cx = -18, cz = -112, R = 42 m, y = 70..222 m): arched
        base concourse, 4 glass lift shafts around a sunlit central atrium, radial residential rings, ribbed oculus dome
     6. Seven Sea-Cliff Skyscrapers (T0..T6 along the north cliff arc, cellular H-plan 32 x 28 m, rooted on stepped cliff
        plinths y = 26..54 m up to 260..300 m, with cliff-facing cantilevered Living-Working & Garden trays) tied together
        by the 300 m Complex Sky-Crown (inverted-cone struts, Sky-Garden Conservatory, Cultural Center, Comms Mast, Heliport).

   [G data]: plain records with stable ids (`af.*`) and pure functions; no Three.js, no DOM. All variation draws from
   KRAND.hash(seed, salt, a, b), never from stream order. Numeric defaults use `x == null ? d : x`. */
const ARCOFORTE = (function () {
  'use strict';
  const PI = Math.PI, TAU = PI * 2, D2R = PI / 180;
  const r2 = v => Math.round(v * 100) / 100;

  const DIM = {
    SEA: 0,
    BENCH: 5.5,          /* coastal harbour rock bench at the northern cliff foot */
    PARK_LO: 68,         /* north lip of the sheltered central park */
    PARK_HI: 82,         /* south throat of the sheltered central park */
    PLATEAU: 84,         /* coastal cliff top and inland plateau datum */
    RING_CX: 0,
    RING_CZ: 10,         /* centre of the horseshoe neocliff ring */
    R_PARK: 140,         /* sheltered park radius inside the horseshoe */
    R_IN: 146,           /* inner colonnade face of the City Center */
    R_MID: 212,          /* junction between City Center vaults and outer Dwelling Bastions */
    R_OUT0: 288,         /* outer toe of battered Dwelling Bastions at y = 84 m */
    R_OUT1: 264,         /* outer crest of battered Dwelling Bastions at y = 144 m (~68 deg batter) */
    Y_RING_TOP: 144,     /* Garden Promenade deck level */
    Y_BELV0: 152,        /* Mushroom-pier belvedere lower floor */
    Y_BELV1: 166,        /* Mushroom-pier belvedere roof */
    ROT_X: -18,          /* Domed Rotunda ("Tourist Center") x */
    ROT_Z: -108,         /* Domed Rotunda z (clears R_IN ring and north cliff towers) */
    ROT_R: 40,           /* Rotunda outer drum radius */
    ROT_ATRIUM: 15,      /* Rotunda sunlit central shaft radius */
    ROT_Y0: 70,          /* Rotunda base concourse level */
    ROT_Y1: 198,         /* Rotunda drum eave / dome spring */
    ROT_TOP: 222,        /* Rotunda oculus lantern top */
    ARC_CX: 0,
    ARC_CZ: -44,         /* centre of the 7-skyscraper northern cliff arc */
    ARC_R: 196,          /* arc radius -> towers sit around z = -196..-240 m on the cliff face */
    TOW_N: 7,
    TOW_W: 32,           /* H-tower width (tangent to cliff arc) */
    TOW_D: 28,           /* H-tower depth (radial to cliff arc) */
    CROWN_Y0: 258,       /* Sky-Crown hanging garden deck */
    CROWN_Y1: 284,       /* Sky-Crown Cultural Center vault crest */
    H_MAX: 300,          /* Peak height (Soleri plate: 300 meters) */
    LIN_Z0: 204,         /* Linear City start at horseshoe south throat */
    LIN_Z1: 468,         /* Linear City inland gate */
    LIN_GAP: 20,         /* half-width of central transit/waterway avenue (40 m wide) */
    LIN_W: 36,           /* width of each Linear City bar */
    LIN_Y1: 112          /* main roof of Linear City bars (penthouses to 120 m) */
  };

  const STATES = ['refurbished', 'intact', 'ruined'];

  function u01(seed, salt, a, b) {
    return KRAND.unit(KRAND.hash(seed, salt | 0, a == null ? 0 : a | 0, b == null ? 0 : b | 0));
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function smooth(a, b, x) { const t = clamp((x - a) / ((b - a) || 1), 0, 1); return t * t * (3 - 2 * t); }

  function toWorld(frame, x, y, z) {
    if (!frame) return [x, y, z];
    const ang = frame.ang == null ? 0 : frame.ang, c = Math.cos(ang), s = Math.sin(ang);
    const fx = frame.x == null ? 0 : frame.x, fz = frame.z == null ? 0 : frame.z, fy = frame.y0 == null ? 0 : frame.y0;
    return [fx + x * c - z * s, fy + y, fz + x * s + z * c];
  }

  /* Coastal cliff, harbour bench, marina, sheltered park valley, and plateau elevation in local metres.
     Note: the sub-cliff works (z = -246..-174, |x| < 118) sit on the y = 5.5 m rock bench so the arcology's own masonry
     forms the neocliff above them, keeping cameras in the works above KDRAWN.h. */
  function cliffZ(x) {
    /* Curved northern headland cliff toe: ~-244 m at x=0, curving south-west toward the marina and south-east on the headland */
    const ax = Math.abs(x);
    if (ax <= 150) return -244 + 0.0014 * x * x;
    return -212.5 + 0.28 * (ax - 150);
  }

  function groundAt(P, x, z) {
    const D = DIM;
    /* 1. Open sea and harbour seabed north of the headland bench */
    const cz = cliffZ(x);
    /* Harbour rock bench at the cliff foot (carries sub-cliff works at z = -246..-174, |x| <= 116) */
    if (Math.abs(x) <= 122 && z >= -252 && z <= -172) {
      const edge = smooth(-252, -244, z) * smooth(122, 112, Math.abs(x));
      if (z < -244) return -8 + (D.BENCH + 8) * smooth(-252, -244, z);
      return D.BENCH + (edge < 1 ? 0 : 0);
    }
    /* NW Marina basin & quay shelf (x = -332..-206, z = -256..-152) */
    if (x >= -336 && x <= -204 && z >= -260 && z <= -150) {
      const inBasin = x >= -316 && x <= -224 && z >= -242 && z <= -166;
      if (inBasin) return -4.5;
      if (z < -242) return -9 + 12.5 * smooth(-260, -242, z);
      return 3.5;
    }
    /* Offshore north of cliff toe */
    if (z < cz - 28) {
      const d = (cz - 28) - z;
      return -2.5 - Math.min(26, d * 0.11);
    }
    /* Steep sea-cliff face rising from sea/bench up to tower plinths and plateau (cz - 28 .. cz + 56) */
    if (z < cz + 56) {
      /* Where the sub-cliff bench sits (|x| <= 122), cliff rises steeply from z = -172 to -148 up to park/rotunda level */
      if (Math.abs(x) <= 122) {
        if (z <= -172) return D.BENCH;
        const target = Math.abs(x) < 65 ? D.PARK_LO : D.PLATEAU;
        return D.BENCH + (target - D.BENCH) * smooth(-172, -146, z);
      }
      const base = z < cz - 12 ? -2.5 + 6.0 * smooth(cz - 28, cz - 12, z) : 3.5;
      const n = KRAND.fbm(x / 55, 0, z / 55, 2, (P && P.seed) || 14800) * 3.2;
      return base + (D.PLATEAU - base) * smooth(cz - 12, cz + 54, z) + n * smooth(cz - 8, cz + 18, z) * (1 - smooth(cz + 36, cz + 54, z));
    }
    /* Sheltered Central Park bowl inside the horseshoe (around RING_CX, RING_CZ, r < R_IN) */
    const dx = x - D.RING_CX, dz = z - D.RING_CZ, r = Math.hypot(dx, dz);
    if (r < D.R_IN - 2 && z > -148) {
      /* Park slopes gently from 82 m at south throat (+140) down to 68 m at north lip (-130), with stream channel along x ~ 6*sin */
      const tNS = clamp((z - (-130)) / 270, 0, 1);
      let py = D.PARK_LO + (D.PARK_HI - D.PARK_LO) * tNS;
      const sx = 8 * Math.sin(z / 48);
      const ds = Math.abs(x - sx);
      if (z > -128 && z < 200 && ds < 14) {
        py -= 2.2 * (1 - smooth(3, 14, ds));
      }
      const rimBlend = smooth(D.R_PARK - 14, D.R_IN - 2, r);
      /* Keep South Throat (x in -24..24, z > 120) low slightly for canal entry */
      const rimTarget = (Math.abs(x) < 22 && z > 110) ? D.PARK_HI : D.PLATEAU;
      return py * (1 - rimBlend) + rimTarget * rimBlend;
    }
    /* Linear City sunken central canal/guideway trough (x in -16..16, z in 200..468) */
    if (Math.abs(x) < 16 && z >= 196 && z <= D.LIN_Z1) {
      const cw = 1 - smooth(9, 16, Math.abs(x));
      return D.PLATEAU - 3.2 * cw;
    }
    /* Gentle coastal plateau relief outside the built footprint */
    const distOut = Math.max(0, r - 310);
    const und = distOut > 0 ? (KRAND.fbm(x / 180, 0, z / 180, 3, ((P && P.seed) || 14800) + 17) - 0.45) * 9 * smooth(0, 90, distOut) : 0;
    return D.PLATEAU + und;
  }

  /* Polygon outline of a battered trapezoidal sector between angles a0 and a1 and radii r0..r1 around (cx, cz) */
  function sectorPoly(cx, cz, r0, r1, a0, a1, segs) {
    const n = segs == null ? 6 : segs, pts = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      pts.push([r2(cx + r0 * Math.cos(a)), r2(cz + r0 * Math.sin(a))]);
    }
    for (let i = n; i >= 0; i--) {
      const a = a0 + (a1 - a0) * i / n;
      pts.push([r2(cx + r1 * Math.cos(a)), r2(cz + r1 * Math.sin(a))]);
    }
    return pts;
  }

  function plan(o) {
    o = o || {};
    const seed = o.seed == null ? 14800 : o.seed;
    const state = STATES.indexOf(o.state) >= 0 ? o.state : 'refurbished';
    const D = DIM;

    const P = {
      id: 'arcoforte',
      seed: seed,
      state: state,
      dim: D,
      parts: [],
      ways: [],
      links: [],
      trees: []
    };

    const addPart = rec => { P.parts.push(rec); return rec; };

    /* ---------------- 1. MULTILEVEL HARBOUR LIFT PLATFORM, MARINA & SUB-CLIFF WORKS ---------------- */
    const harbour = {
      id: 'af.harbour.platform',
      name: 'Multilevel Fishing & Fleet Lift Platform',
      kind: 'harbour',
      sector: 'work',
      state: state === 'ruined' ? 'ruined' : state,
      kept: state !== 'ruined',
      box: [-76, 76, -334, -246],
      y0: 0,
      y1: 28,
      decks: [
        { id: 'af.harbour.deck.0', y: 4.5, h: 8.5, x0: -76, x1: 76, z0: -334, z1: -246, name: 'Sea Slip & Unloading Deck' },
        { id: 'af.harbour.deck.1', y: 13.5, h: 8.5, x0: -68, x1: 68, z0: -320, z1: -246, name: 'Fleet Servicing & Provisioning Deck' },
        { id: 'af.harbour.deck.2', y: 22.5, h: 5.5, x0: -58, x1: 58, z0: -304, z1: -246, name: 'Gantry & Harbour Control Deck' }
      ],
      lifts: [
        { id: 'af.harbour.lift.w', x: -34, z0: -332, z1: -286, w: 22, cradleY: state === 'ruined' ? 1.2 : 9.5 },
        { id: 'af.harbour.lift.e', x: 34, z0: -332, z1: -286, w: 22, cradleY: 4.8 }
      ],
      vessels: [
        { id: 'af.vessel.0', x: -34, z: -308, y: state === 'ruined' ? 0.2 : 9.8, ry: 0, L: 26, B: 6.8, lifted: state !== 'ruined' },
        { id: 'af.vessel.1', x: 34, z: -310, y: 0.3, ry: 0.04, L: 24, B: 6.4, lifted: false },
        { id: 'af.vessel.2', x: -96, z: -292, y: 0.2, ry: 0.42, L: 20, B: 5.4, lifted: false },
        { id: 'af.vessel.3', x: -272, z: -206, y: 0.2, ry: PI / 2, L: 15, B: 4.2, lifted: false },
        { id: 'af.vessel.4', x: -252, z: -188, y: 0.2, ry: PI / 2, L: 14, B: 4.0, lifted: false }
      ],
      marina: {
        id: 'af.marina',
        name: 'North-West Marina & Breakwater',
        box: [-328, -212, -248, -156],
        y: 3.5,
        piers: [-232, -214, -196, -178].map((pz, i) => ({
          id: 'af.marina.pier.' + i, x0: -308, x1: -232, z: pz, w: 4.5, y: 3.5
        }))
      }
    };
    P.harbour = harbour;
    addPart({ id: harbour.id, name: harbour.name, kind: 'harbour', sector: 'work', state: harbour.state, kept: harbour.kept,
      shape: ['box', -76, 76, -334, -246], y: 4.5, h: 24, st: 3, sheets: ['A0', 'A1'] });
    addPart({ id: harbour.marina.id, name: harbour.marina.name, kind: 'marina', sector: 'rec', state: harbour.state, kept: harbour.kept,
      shape: ['box', -328, -212, -248, -156], y: 3.5, h: 4, st: 1, sheets: ['A0', 'A1'] });

    const subcliff = {
      works: {
        id: 'af.subcliff.works',
        name: 'Fishing Industry, Cold Storage & Boatyard Hall',
        kind: 'works',
        sector: 'work',
        state: state === 'ruined' ? 'ruined' : state,
        kept: state !== 'ruined',
        box: [-86, 86, -242, -218],
        y0: D.BENCH,
        y1: D.BENCH + 18,
        st: 3
      },
      autoVaults: {
        id: 'af.subcliff.auto',
        name: 'Sub-Cliff Automated Industry Vaults & Transit Bore',
        kind: 'vault',
        sector: 'infra',
        /* Sealed and ruined in refurbished state — preserved as an exploration/salvage delve */
        state: state === 'intact' ? 'intact' : 'ruined',
        kept: state === 'intact',
        box: [-84, 84, -206, -176],
        y0: D.BENCH,
        y1: D.BENCH + 12,
        st: 2,
        rubble: state === 'intact' ? [] : [
          { id: 'af.auto.rubble.0', x: -34, z: -210, y: D.BENCH, r: 5.2, h: 2.6 },
          { id: 'af.auto.rubble.1', x: 32, z: -211, y: D.BENCH, r: 5.6, h: 2.8 }
        ]
      },
      shafts: [
        { id: 'af.shaft.west', name: 'West Inclined Cargo & Passenger Cliff Shaft', x: -56, z0: -218, y0: D.BENCH + 4, z1: -146, y1: D.PLATEAU, w: 12 },
        { id: 'af.shaft.east', name: 'East Inclined Cargo & Passenger Cliff Shaft', x: 56, z0: -218, y0: D.BENCH + 4, z1: -146, y1: D.PLATEAU, w: 12 }
      ]
    };
    P.subcliff = subcliff;
    addPart({ id: subcliff.works.id, name: subcliff.works.name, kind: 'industry', sector: 'work', state: subcliff.works.state,
      kept: subcliff.works.kept, shape: ['box', -86, 86, -242, -218], y: D.BENCH, h: 18, st: 3, sheets: ['A1'] });
    addPart({ id: subcliff.autoVaults.id, name: subcliff.autoVaults.name, kind: 'vault', sector: 'infra', state: subcliff.autoVaults.state,
      kept: subcliff.autoVaults.kept, shape: ['box', -84, 84, -206, -176], y: D.BENCH, h: 12, st: 2, sheets: ['A1'],
      note: state === 'refurbished' ? 'sealed behind gated bulkheads; salvage & delve zone' : '' });

    /* ---------------- 2. HORSESHOE NEOCLIFF RING: 9 BATTERED BASTIONS, CITY CENTER, 13 SKYLIGHTS, 6 BELVEDERES ---------------- */
    /* East wing: -30 deg .. +68 deg (5 bastions, 7 skylights, 3 mushroom-pier belvederes)
       West wing: +112 deg .. +210 deg (4 bastions, 6 skylights, 3 mushroom-pier belvederes) */
    const bastions = [], skylights = [], pavilions = [], arcades = [];
    const wings = [
      { side: 'e', name: 'East', a0: -30 * D2R, a1: 68 * D2R, nb: 5, ns: 7, np: 3 },
      { side: 'w', name: 'West', a0: 112 * D2R, a1: 210 * D2R, nb: 4, ns: 6, np: 3 }
    ];

    wings.forEach(W => {
      const span = W.a1 - W.a0;
      const acx = D.RING_CX + ((D.R_IN + D.R_MID) / 2) * Math.cos((W.a0 + W.a1) / 2);
      const acz = D.RING_CZ + ((D.R_IN + D.R_MID) / 2) * Math.sin((W.a0 + W.a1) / 2);
      const arcRec = {
        id: 'af.city.' + W.side,
        name: W.name + ' City Center Vaulted Arcade',
        side: W.side,
        a0: W.a0,
        a1: W.a1,
        r0: D.R_IN,
        r1: D.R_MID,
        y0: D.PLATEAU,
        y1: D.Y_RING_TOP,
        st: 10,
        state: state === 'ruined' ? 'ruined' : state,
        kept: state !== 'ruined'
      };
      arcades.push(arcRec);
      addPart({ id: arcRec.id, name: arcRec.name, kind: 'civic', sector: 'work', state: arcRec.state, kept: arcRec.kept,
        shape: ['circ', r2(acx), r2(acz), 54], poly: sectorPoly(D.RING_CX, D.RING_CZ, D.R_IN, D.R_MID, W.a0, W.a1, 18),
        y: D.PLATEAU, h: D.Y_RING_TOP - D.PLATEAU, st: 10, sheets: ['A0', 'A2'] });

      /* Battered trapezoidal Dwelling Bastions projecting from R_MID to R_OUT0 (sloping to R_OUT1 at y = 144 m) */
      const gap = 3.6 * D2R;
      const bSpan = (span - gap * (W.nb - 1)) / W.nb;
      for (let i = 0; i < W.nb; i++) {
        const ba0 = W.a0 + i * (bSpan + gap), ba1 = ba0 + bSpan, bm = (ba0 + ba1) / 2;
        const bcx = D.RING_CX + ((D.R_MID + D.R_OUT0) / 2) * Math.cos(bm);
        const bcz = D.RING_CZ + ((D.R_MID + D.R_OUT0) / 2) * Math.sin(bm);
        const weathered = state === 'ruined' && (i === 0 || i === W.nb - 1);
        const bRec = {
          id: 'af.bastion.' + W.side + i,
          name: W.name + ' Neocliff Dwelling Bastion ' + (i + 1),
          side: W.side,
          index: i,
          a0: ba0,
          a1: ba1,
          am: bm,
          rIn: D.R_MID,
          rOut0: D.R_OUT0,
          rOut1: D.R_OUT1,
          y0: D.PLATEAU,
          y1: D.Y_RING_TOP,
          st: 12,
          cx: r2(bcx),
          cz: r2(bcz),
          state: state === 'ruined' ? 'ruined' : state,
          kept: state !== 'ruined',
          breach: weathered
        };
        bastions.push(bRec);
        addPart({ id: bRec.id, name: bRec.name, kind: 'dwelling', sector: 'living', state: bRec.state, kept: bRec.kept,
          shape: ['circ', bRec.cx, bRec.cz, 34], poly: sectorPoly(D.RING_CX, D.RING_CZ, D.R_MID, D.R_OUT0, ba0, ba1, 6),
          y: D.PLATEAU, h: D.Y_RING_TOP - D.PLATEAU, st: 12, sheets: ['A0', 'A3'] });
      }

      /* 13 Square Courtyard Skylight Wells (7 East, 6 West) along r = 179 m on the y = 144 m Garden Promenade */
      for (let j = 0; j < W.ns; j++) {
        const sa = W.a0 + span * (j + 0.5) / W.ns, sr = 179;
        const sx = r2(D.RING_CX + sr * Math.cos(sa)), sz = r2(D.RING_CZ + sr * Math.sin(sa));
        const sk = {
          id: 'af.skylight.' + W.side + j,
          name: W.name + ' Oculus Courtyard Well ' + (j + 1),
          side: W.side,
          index: j,
          th: sa,
          x: sx,
          z: sz,
          size: 22,
          oculusR: 8.2,
          y0: D.PLATEAU + 18,
          y1: D.Y_RING_TOP
        };
        skylights.push(sk);
        addPart({ id: sk.id, name: sk.name, kind: 'court', sector: 'rec', state: state === 'ruined' ? 'ruined' : state, kept: true,
          shape: ['box', sx - 11, sx + 11, sz - 11, sz + 11], y: D.Y_RING_TOP, h: 4, st: 1, sheets: ['A0', 'A3'] });
      }

      /* 6 Mushroom-Pier Public & Recreation Belvederes (3 East, 3 West, placed between skylights on the Promenade) */
      for (let k = 0; k < W.np; k++) {
        const pa = W.a0 + span * (k * 2 + 1) / (W.np * 2), pr = 179;
        const px = r2(D.RING_CX + pr * Math.cos(pa)), pz = r2(D.RING_CZ + pr * Math.sin(pa));
        const roles = ['Tavern & Sea-View Lounge', 'Promenade Bathhouse & Tea Hall', 'Garden Conservatory & Library'];
        const pv = {
          id: 'af.pavilion.' + W.side + k,
          name: W.name + ' Promenade Belvedere — ' + roles[k % roles.length],
          side: W.side,
          index: k,
          th: pa,
          x: px,
          z: pz,
          w: 32,
          d: 20,
          ry: pa + PI / 2,
          yDeck: D.Y_RING_TOP,
          y0: D.Y_BELV0,
          y1: D.Y_BELV1,
          st: 2,
          state: state === 'ruined' ? 'ruined' : state,
          kept: state !== 'ruined'
        };
        pavilions.push(pv);
        addPart({ id: pv.id, name: pv.name, kind: 'pavilion', sector: 'rec', state: pv.state, kept: pv.kept,
          shape: ['box', px - 14, px + 14, pz - 14, pz + 14], y: D.Y_BELV0, h: D.Y_BELV1 - D.Y_BELV0, st: 2, sheets: ['A3'] });
      }
    });

    P.cityCenter = { arcades: arcades, skylights: skylights };
    P.bastions = bastions;
    P.promenade = { id: 'af.promenade', y: D.Y_RING_TOP, pavilions: pavilions };

    /* ---------------- 3. SHELTERED CENTRAL PARK, WATERWAYS, BRIDGES & AMPHITHEATRE ---------------- */
    const park = {
      id: 'af.park',
      name: 'Sheltered Central Park & Waterways',
      amphitheatre: {
        id: 'af.park.amphitheatre',
        name: 'Central Park Ribbed Acoustic Shell & Amphitheatre',
        x: 34,
        z: 12,
        r: 26,
        y: r2(groundAt(P, 34, 12)),
        h: 16,
        ry: -0.45,
        state: state === 'ruined' ? 'ruined' : state
      },
      bridges: [
        { id: 'af.park.bridge.north', name: 'North Park Viaduct Bridge', a: [-58, -54], b: [56, -24], y: 81.5, w: 9 },
        { id: 'af.park.bridge.south', name: 'South Park Arch Footbridge', a: [-66, 86], b: [68, 86], y: 84.0, w: 10 }
      ],
      pools: [
        { id: 'af.park.pool.south', name: 'Upper Park Reflection Pool', x: 2, z: 54, rx: 18, rz: 24, level: 76.2 },
        { id: 'af.park.pool.north', name: 'North Throat Cascade Basin', x: -4, z: -62, rx: 20, rz: 16, level: 70.2 }
      ],
      sluice: {
        id: 'af.park.sluice',
        name: 'Sea-Cliff Waterway Sluice & Cascade',
        x: 126,
        zLip: -194,
        yLip: 62.0,
        zToe: -236,
        yToe: 0.8,
        w: 7
      }
    };
    P.park = park;
    addPart({ id: park.amphitheatre.id, name: park.amphitheatre.name, kind: 'amphitheatre', sector: 'rec',
      state: park.amphitheatre.state, kept: true, shape: ['circ', park.amphitheatre.x, park.amphitheatre.z, park.amphitheatre.r],
      y: park.amphitheatre.y, h: 16, st: 1, sheets: ['A0', 'A2'] });
    park.bridges.forEach(br => {
      addPart({ id: br.id, name: br.name, kind: 'bridge', sector: 'infra', state: state === 'ruined' ? 'ruined' : state, kept: true,
        shape: ['box', Math.min(br.a[0], br.b[0]), Math.max(br.a[0], br.b[0]), Math.min(br.a[1], br.b[1]) - 5, Math.max(br.a[1], br.b[1]) + 5],
        y: br.y, h: 4, st: 1, sheets: ['A0', 'A2'] });
    });

    /* ---------------- 4. SOUTHERN LINEAR CITY THROAT ---------------- */
    const linearBars = [
      { id: 'af.linear.west', name: 'Linear City West Spine (Customs, Craft & Flats)', side: 'w', x0: -(D.LIN_GAP + D.LIN_W), x1: -D.LIN_GAP, z0: D.LIN_Z0, z1: D.LIN_Z1, y0: D.PLATEAU, y1: D.LIN_Y1, st: 7 },
      { id: 'af.linear.east', name: 'Linear City East Spine (Warehouses, Tavern & Flats)', side: 'e', x0: D.LIN_GAP, x1: D.LIN_GAP + D.LIN_W, z0: D.LIN_Z0, z1: D.LIN_Z1, y0: D.PLATEAU, y1: D.LIN_Y1, st: 7 }
    ];
    const linearDrums = [248, 336, 424].map((dz, i) => ({
      id: 'af.linear.drum.' + i,
      name: ['Throat Gate Plaza Drum', 'Mid-Spine Exchange Rotunda', 'Landward Terminus Gate Drum'][i],
      x: 0,
      z: dz,
      r: 18,
      y0: D.PLATEAU + 8,
      y1: D.LIN_Y1 + 8,
      st: 3
    }));
    P.linearCity = { bars: linearBars, drums: linearDrums };
    linearBars.forEach(lb => {
      addPart({ id: lb.id, name: lb.name, kind: 'linear', sector: 'living', state: state === 'ruined' ? 'ruined' : state,
        kept: state !== 'ruined', shape: ['box', lb.x0, lb.x1, lb.z0, lb.z1], y: lb.y0, h: lb.y1 - lb.y0, st: lb.st, sheets: ['A0', 'A2'] });
    });
    linearDrums.forEach(dr => {
      addPart({ id: dr.id, name: dr.name, kind: 'gate', sector: 'rec', state: state === 'ruined' ? 'ruined' : state,
        kept: state !== 'ruined', shape: ['circ', dr.x, dr.z, dr.r], y: dr.y0, h: dr.y1 - dr.y0, st: dr.st, sheets: ['A0', 'A2'] });
    });

    /* ---------------- 5. DOMED ROTUNDA ("TOURIST CENTER" & RESIDENTIAL DRUM) ---------------- */
    const rotunda = {
      id: 'af.rotunda',
      name: 'The Domed Rotunda (Grand Concourse & Atrium Dwellings)',
      x: D.ROT_X,
      z: D.ROT_Z,
      R: D.ROT_R,
      rAtrium: D.ROT_ATRIUM,
      y0: D.ROT_Y0,
      y1: D.ROT_Y1,
      top: D.ROT_TOP,
      st: 26,
      state: state === 'ruined' ? 'ruined' : state,
      kept: state !== 'ruined',
      skybridges: [
        { id: 'af.rotunda.bridge.w', a: [D.ROT_X - 24, D.ROT_Z - 32], b: [-68, -214], y: 144, w: 10 },
        { id: 'af.rotunda.bridge.e', a: [D.ROT_X + 26, D.ROT_Z - 30], b: [42, -230], y: 144, w: 10 }
      ]
    };
    P.rotunda = rotunda;
    addPart({ id: rotunda.id, name: rotunda.name, kind: 'rotunda', sector: 'rec', state: rotunda.state, kept: rotunda.kept,
      shape: ['circ', rotunda.x, rotunda.z, rotunda.R], y: rotunda.y0, h: rotunda.top - rotunda.y0, st: rotunda.st, sheets: ['A0', 'A2', 'A3', 'A4'] });

    /* ---------------- 6. SEVEN SEA-CLIFF SKYSCRAPERS & 300 M COMPLEX SKY-CROWN ---------------- */
    /* Placed on an arc around (ARC_CX, ARC_CZ) = (0, -44), R = 196 m, angles -129 deg .. -51 deg (13 deg step -> 44.4 m chord spacing!) */
    const towers = [];
    for (let i = 0; i < D.TOW_N; i++) {
      const th = (-129 + i * 13) * D2R;
      const tx = r2(D.ARC_CX + D.ARC_R * Math.cos(th));
      const tz = r2(D.ARC_CZ + D.ARC_R * Math.sin(th));
      const gy = r2(Math.max(24, Math.min(54, groundAt(P, tx, tz))));
      /* In refurbished state, all 7 towers carry the roof; T0 (westernmost windward) has weathered upper louvers */
      const weathered = (state === 'refurbished' && i === 0) || state === 'ruined';
      const trays = [];
      for (let ty = 92; ty <= 236; ty += 36) {
        trays.push({ y: ty, out: 9.5, w: 26, sector: ty <= 128 ? 'work' : (ty === 164 ? 'rec' : 'living') });
      }
      const tRec = {
        id: 'af.tower.' + i,
        name: 'Sea-Cliff Skyscraper ' + (i + 1) + (i === 3 ? ' (Central Hub)' : i === 0 ? ' (Windward Watch)' : i === 6 ? ' (Heliport Pier)' : ''),
        index: i,
        th: th,
        x: tx,
        z: tz,
        ry: th + PI / 2,
        w: D.TOW_W,
        d: D.TOW_D,
        yBase: gy,
        yTop: D.CROWN_Y0,
        st: Math.round((D.CROWN_Y0 - gy) / 4.2),
        trays: trays,
        weathered: weathered,
        state: state === 'ruined' ? 'ruined' : state,
        kept: state !== 'ruined'
      };
      towers.push(tRec);
      addPart({ id: tRec.id, name: tRec.name, kind: 'tower', sector: i === 1 || i === 5 ? 'work' : 'living',
        state: tRec.state, kept: tRec.kept, shape: ['box', tx - 16, tx + 16, tz - 15, tz + 15],
        y: gy, h: D.CROWN_Y0 - gy, st: tRec.st, sheets: ['A0', 'A2', 'A3', 'A4'] });
    }
    P.towers = towers;

    const skyCrown = {
      id: 'af.skycrown',
      name: 'Complex Sky-Crown (Sky-Gardens, Cultural Center, Comms & Heliport)',
      a0: -133 * D2R,
      a1: -47 * D2R,
      cx: D.ARC_CX,
      cz: D.ARC_CZ,
      rIn: D.ARC_R - 22,
      rOut: D.ARC_R + 22,
      y0: D.CROWN_Y0,
      y1: D.CROWN_Y1,
      top: D.H_MAX,
      st: 5,
      state: state === 'ruined' ? 'ruined' : state,
      kept: state !== 'ruined',
      mast: { x: towers[3].x, z: towers[3].z, y0: D.CROWN_Y1, y1: D.H_MAX },
      heliport: {
        id: 'af.skycrown.heliport',
        name: 'Cantilevered Headland Heliport & Air-Pad',
        x: r2(towers[6].x + 38),
        z: r2(towers[6].z + 10),
        r: 22,
        y: 274
      }
    };
    P.skyCrown = skyCrown;
    addPart({ id: skyCrown.id, name: skyCrown.name, kind: 'crown', sector: 'rec', state: skyCrown.state, kept: skyCrown.kept,
      shape: ['box', towers[0].x - 20, towers[6].x + 20, -262, -142],
      poly: sectorPoly(D.ARC_CX, D.ARC_CZ, skyCrown.rIn, skyCrown.rOut, skyCrown.a0, skyCrown.a1, 18),
      y: skyCrown.y0, h: skyCrown.top - skyCrown.y0, st: skyCrown.st, sheets: ['A4'] });
    addPart({ id: skyCrown.heliport.id, name: skyCrown.heliport.name, kind: 'pad', sector: 'infra', state: skyCrown.state, kept: skyCrown.kept,
      shape: ['circ', skyCrown.heliport.x, skyCrown.heliport.z, skyCrown.heliport.r], y: skyCrown.heliport.y, h: 6, st: 1, sheets: ['A0', 'A4'] });

    /* ---------------- 7. PARK & PROMENADE PLANTING RECORDS (KRAND-seeded, deterministic) ---------------- */
    for (let i = -9; i <= 9; i++) {
      for (let j = -9; j <= 9; j++) {
        if (! (u01(seed, 301, i, j) < 0.56)) continue;
        const px = r2(i * 13 + (u01(seed, 302, i, j) - 0.5) * 7);
        const pz = r2(10 + j * 13 + (u01(seed, 303, i, j) - 0.5) * 7);
        const pr = Math.hypot(px - D.RING_CX, pz - D.RING_CZ);
        if (pr > D.R_PARK - 12 || pz < -122 || pz > 138) continue;
        /* Keep clear of waterway stream, reflection pools, bridges, and amphitheatre */
        const sx = 8 * Math.sin(pz / 48);
        if (Math.abs(px - sx) < 13) continue;
        if (Math.hypot(px - park.amphitheatre.x, pz - park.amphitheatre.z) < park.amphitheatre.r + 7) continue;
        if (park.pools.some(pl => Math.hypot((px - pl.x) / (pl.rx + 6), (pz - pl.z) / (pl.rz + 6)) < 1)) continue;
        const py = r2(groundAt(P, px, pz));
        P.trees.push({ id: 'af.tree.park.' + i + '.' + j, zone: 'park', x: px, y: py, z: pz, h: r2(6.5 + u01(seed, 304, i, j) * 5.5) });
      }
    }
    /* Promenade garden trees between skylights and pavilions */
    wings.forEach((W, wi) => {
      const nT = 18;
      for (let k = 0; k < nT; k++) {
        if (!(u01(seed, 310 + wi, k, 0) < 0.78)) continue;
        const a = W.a0 + (W.a1 - W.a0) * (k + 0.5) / nT;
        const rr = k % 2 === 0 ? 156 : 202;
        const tx = r2(D.RING_CX + rr * Math.cos(a)), tz = r2(D.RING_CZ + rr * Math.sin(a));
        if (skylights.some(s => Math.hypot(tx - s.x, tz - s.z) < 16)) continue;
        if (pavilions.some(p => Math.hypot(tx - p.x, tz - p.z) < 19)) continue;
        P.trees.push({ id: 'af.tree.prom.' + W.side + '.' + k, zone: 'promenade', x: tx, y: D.Y_RING_TOP, z: tz, h: r2(5.0 + u01(seed, 320 + wi, k, 1) * 3.8) });
      }
    });

    /* ---------------- 8. CIRCULATION WAYS & COARSE WALK GRAPH (`links`) ---------------- */
    P.ways = [
      { id: 'af.way.linear', kind: 'avenue', w: 24, pts: [[0, 468, 84], [0, 204, 84], [0, 136, 82]], note: 'Linear City central avenue into South Park Throat' },
      { id: 'af.way.park', kind: 'path', w: 8, pts: [[-14, 136, 82], [-16, 40, 76], [-18, -68, 70]], note: 'Central Park spine walk to Domed Rotunda' },
      { id: 'af.way.stream', kind: 'water', w: 10, pts: [[0, 468, 81.2], [0, 200, 80.5], [4, 110, 78.2], [2, 54, 76.2], [-4, -10, 73.2], [-4, -62, 70.2], [18, -112, 68.5], [38, -148, 67.5]], note: 'Linear canal & Central Park waterway to cliff sluice' },
      { id: 'af.way.marina_ramp', kind: 'stair', w: 6, pts: [[-224, -162, 3.5], [-196, -118, 44], [-168, -74, 84]], note: 'NW Marina cliff stair to West Arcade & Promenade' },
      { id: 'af.way.shaft_w', kind: 'lift', w: 8, pts: [[-56, -246, 5.5], [-56, -214, 9.5], [-56, -146, 84]], note: 'West inclined cliff lift from Harbour to Rotunda plaza' },
      { id: 'af.way.shaft_e', kind: 'lift', w: 8, pts: [[56, -246, 5.5], [56, -214, 9.5], [56, -146, 84]], note: 'East inclined cliff lift from Harbour to East Arcade' }
    ];

    /* Coarse connectivity graph across every major walkable part (verified by BFS from both sea harbour & land gate) */
    const L = [
      /* Sea level -> Cliff shafts & Marina -> Park / Arcades */
      ['af.harbour.platform', 'af.subcliff.works'],
      ['af.subcliff.works', 'af.rotunda'],
      ['af.subcliff.works', 'af.city.e'],
      ['af.subcliff.works', 'af.city.w'],
      ['af.marina', 'af.harbour.platform'],
      ['af.marina', 'af.city.w'],
      /* Sealed automated vaults still have a gated bulkhead link from subcliff works */
      ['af.subcliff.works', 'af.subcliff.auto'],
      /* Linear City -> Park & Arcades */
      ['af.linear.drum.2', 'af.linear.west'],
      ['af.linear.drum.2', 'af.linear.east'],
      ['af.linear.drum.1', 'af.linear.west'],
      ['af.linear.drum.1', 'af.linear.east'],
      ['af.linear.drum.0', 'af.linear.west'],
      ['af.linear.drum.0', 'af.linear.east'],
      ['af.linear.west', 'af.city.w'],
      ['af.linear.east', 'af.city.e'],
      ['af.linear.west', 'af.park.bridge.south'],
      ['af.linear.east', 'af.park.bridge.south'],
      /* Park bridges & Amphitheatre */
      ['af.park.bridge.south', 'af.city.w'],
      ['af.park.bridge.south', 'af.city.e'],
      ['af.park.bridge.south', 'af.park.amphitheatre'],
      ['af.park.bridge.north', 'af.city.w'],
      ['af.park.bridge.north', 'af.city.e'],
      ['af.park.bridge.north', 'af.rotunda'],
      ['af.park.amphitheatre', 'af.city.e'],
      /* Arcades <-> Bastions, Skylight Courts & Promenade Belvederes */
      ['af.city.e', 'af.rotunda'],
      ['af.city.w', 'af.rotunda']
    ];
    bastions.forEach(b => L.push(['af.city.' + b.side, b.id]));
    skylights.forEach(s => L.push(['af.city.' + s.side, s.id]));
    pavilions.forEach(p => L.push(['af.city.' + p.side, p.id]));
    /* Rotunda & Subcliff <-> 7 Cliff Skyscrapers <-> Sky-Crown & Heliport */
    L.push(['af.rotunda', 'af.tower.2'], ['af.rotunda', 'af.tower.4'], ['af.city.w', 'af.tower.0'], ['af.city.e', 'af.tower.6']);
    for (let i = 0; i < towers.length; i++) {
      L.push([towers[i].id, 'af.skycrown']);
      if (i > 0) L.push([towers[i - 1].id, towers[i].id]);
    }
    L.push(['af.skycrown', 'af.skycrown.heliport']);
    P.links = L;

    return P;
  }

  /* Build `core/water` records (open ocean, marina & reflection pools, waterway stream, sea-cliff cascade) */
  function waterRecords(P, WATER, frame) {
    const W3 = (x, y, z) => { const w = toWorld(frame, x, y, z); return [w[0], w[2], w[1]]; };
    const W2 = (x, z) => { const w = toWorld(frame, x, 0, z); return [w[0], w[2]]; };
    const out = { still: [], flow: [], fall: [], seaBounds: [-6000, -6000, 6000, -148] };
    if (!WATER) return out;

    /* Two reflection pools in the Central Park */
    P.park.pools.forEach(pl => {
      const poly = [];
      for (let i = 0; i < 24; i++) {
        const a = i / 24 * TAU;
        poly.push(W2(pl.x + pl.rx * Math.cos(a), pl.z + pl.rz * Math.sin(a)));
      }
      out.still.push(WATER.still({ name: pl.name, level: pl.level, poly: poly }));
    });

    /* Linear City canal & Central Park waterway stream (monotonically descending!) */
    const streamPts = [
      W3(0, 81.4, 464),
      W3(0, 80.6, 336),
      W3(0, 79.8, 204),
      W3(3, 77.8, 122),
      W3(2, 76.25, 54),
      W3(-3, 73.4, -8),
      W3(-4, 70.25, -62),
      W3(18, 68.8, -112),
      W3(38, 67.6, -148)
    ];
    out.flow.push(WATER.flow({ name: 'Central Park Waterway & Linear Canal', pts: streamPts, width: 9, speed: 1.4 }));

    /* Cliff Sluice Cascade falling from the north park lip (y = 67.5 m) to the sea (y = 0.8 m) */
    const sl = P.park.sluice;
    out.fall.push(WATER.fall({
      name: sl.name,
      lip: [W3(sl.x - sl.w / 2, sl.yLip, sl.zLip), W3(sl.x + sl.w / 2, sl.yLip, sl.zLip)],
      dir: [0, -1],
      speed: 3.2,
      drop: sl.yLip - sl.yToe,
      foot: W3(sl.x, sl.yToe, sl.zToe),
      fit: true,
      face: (wx, wz) => groundAt(P, wx, wz),
      spread: 5.5
    }));

    return out;
  }

  /* Small hull curve descriptor so external coastal terrain, water, tideline, and dock fragments can snap directly
     to the exact concrete faces without magic numbers (`span`, `H`, `toe(x)`, `waterlineZ(x)`, `plinth.rAt(y)`). */
  function makeHull(D) {
    const d = D || DIM;
    const dockBox = [-86, 86, -242, -218];
    const harbourBox = [-76, 76, -334, -246];
    const marinaBox = [-296, -204, -256, -162];
    const rAt = function (y) {
      if (y <= d.PLATEAU) return r2(d.R_OUT0 + Math.max(0, d.PLATEAU - y) * 0.22);
      if (y <= d.Y_RING_TOP) {
        const t = (y - d.PLATEAU) / (d.Y_RING_TOP - d.PLATEAU);
        return r2(d.R_OUT0 + (d.R_OUT1 - d.R_OUT0) * t);
      }
      if (y <= d.Y_BELV1) return d.R_MID;
      return d.ARC_R;
    };
    return {
      span: d.R_OUT0 * 2,
      H: d.H_MAX,
      cliffSpan: 332,
      harbourSpan: harbourBox[1] - harbourBox[0],
      subcliffSpan: dockBox[1] - dockBox[0],
      seaY: d.SEA,
      benchY: d.BENCH,
      plateauY: d.PLATEAU,
      promenadeY: d.Y_RING_TOP,
      crownY0: d.CROWN_Y0,
      crownY1: d.CROWN_Y1,
      bounds: [-d.R_OUT0, d.R_OUT0, harbourBox[2], d.LIN_Z1],
      dockBox: dockBox,
      harbourBox: harbourBox,
      marinaBox: marinaBox,
      toe: function (x) {
        return Math.abs(x) <= dockBox[1] ? dockBox[2] : r2(cliffZ(x));
      },
      waterlineZ: function (x) {
        if (x >= harbourBox[0] && x <= harbourBox[1]) return harbourBox[2];
        if (x >= marinaBox[0] && x <= marinaBox[1]) return marinaBox[2];
        return Math.abs(x) <= dockBox[1] ? dockBox[2] : r2(cliffZ(x));
      },
      plinth: {
        cx: d.RING_CX,
        cz: d.RING_CZ,
        y0: d.PLATEAU,
        y1: d.Y_RING_TOP,
        rBase: d.R_OUT0,
        rTop: d.R_OUT1,
        rMid: d.R_MID,
        rInner: d.R_IN,
        rAt: rAt,
        towerHalfW: function (y, yBase) {
          const yb = yBase == null ? 30 : yBase;
          return y < yb ? (d.TOW_W - 8) / 2 : d.TOW_W / 2;
        },
        rotundaR: function (y) {
          if (y <= d.ROT_Y1) return d.ROT_R;
          if (y >= d.ROT_TOP) return 8.5;
          const t = (y - d.ROT_Y1) / (d.ROT_TOP - d.ROT_Y1);
          return r2(8.5 + (d.ROT_R - 8.5) * Math.sqrt(Math.max(0, 1 - t * t)));
        }
      },
      rAt: rAt
    };
  }

  const HULL = makeHull(DIM);
  const API = { DIM, STATES, HULL, hull: p => (p && p.hull) || makeHull(p && p.dim), plan: function (o) { const P = plan(o); P.hull = makeHull(P.dim); return P; }, groundAt, cliffZ, sectorPoly, toWorld, waterRecords };
  if (typeof window !== 'undefined') window.ARCOFORTE_HULL = HULL;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  return API;
})();
