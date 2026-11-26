// ================================================================= FLOATING CITY — Ancient Sumeru-Noahbabel Megastructure Plan [G data]
// Pure [G data] structural records (zero THREE, zero DOM, deterministic on KRAND) for V3 Imperial Capital scale:
//   A1. -12..-96 m Inverted Noahbabel Submarine Hydro-Dynamo Cone (8 Pioneer superconductor turbines + 4 KRUINS wreck bays) & -128 m Taproot
//   A2. 2,040 m (R=1,020 m) Circular Arcaded Sea-Ring Weir (+18 m Rampart Boulevard, 8 Inner Venetian Harbour-Quay Shelves at +6.2 m
//       with 90 m radial depth for triple-row urban blocks, 4 Sector Ship-Locks, 18 Watch-Turrets, 6 KRUINS scar blocks)
//   A3. Grand 4-Tier Khao Phra Sumeru Imperial Arcology Mandala (r=218 m base, +176 m 9-tier Maha-Meru spire, 64-column Phra Rabieng
//       cloisters, hanging lotus/orchid terraces, 6 Gopura Bridge-Bastions, 4 +112 m Prangs, 4 +66 m Mondops, 8 Gilded Bussabok Spires,
//       and 5-spire Southern Royal Palace-Barge Island)
//   A4. 4 Colossal Radial Boulevard-Dykes (NNE -66 deg + Sea-Viaduct to Mainland Mole, ESE +22 deg, SSW +146 deg, WNW -146 deg;
//       +22 m 46 m-wide upper boulevard + paired +6.2 m 152 m-wide masonry quays for multi-row dense urban blocks)
//   A5. 16 8-Column Sala-Nam Water Pavilions & 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 intact + 3 KRUINS)
const FC_MEGA = (function () {
  'use strict';
  const CX = FC_SITE.WEIR_CX;
  const CZ = FC_SITE.WEIR_CZ;
  const R_WEIR = FC_SITE.WEIR_R;

  function plan() {
    /* A1. Submarine Inverted Hydro-Dynamo Cone & -128 m Geodetic Taproot */
    const penstocks = [];
    for (let k = 0; k < 12; k++) {
      const angDeg = k * 30 + 15;
      const a = angDeg * Math.PI / 180;
      const flooded = (k >= 3 && k <= 6);
      penstocks.push({
        id: 'fc.penstock.' + k,
        index: k,
        angDeg: angDeg,
        ux: Math.cos(a),
        uz: Math.sin(a),
        boreM: 6.8,
        yCenter: (k % 2 === 0) ? -46.0 : -70.0,
        status: flooded ? 'flooded-ruin' : 'pioneer-superconductor',
        mwRated: flooded ? 0.0 : 6.0
      });
    }

    const submarineCone = {
      id: 'fc.mega.submarine_cone',
      cx: CX,
      cz: CZ,
      yTop: -12.0,
      yBot: -92.0,
      rTop: 148.0,
      rBot: 84.0,
      taproot: { yTop: -90.0, yBot: -128.0, r: 20.0, pendulumY: -124.0 },
      controlHall: { id: 'fc.room.dynamo_hall', yFloor: -62.0, h: 9.5, r: 36.0, vault: true },
      penstocks: penstocks,
      activeCount: 8,
      floodedCount: 4
    };

    /* A2. 2,040 m Circular Sea-Ring Weir (R = 1,020 m), 4 Sector Ship-Locks & 8 Wide Venetian Harbour-Quay Shelves */
    const sectorLocks = [
      { id: 'fc.lock.west_delta',  name: 'West Ocean and Double Delta Ship-Lock', angDeg: 180.0, widthM: 48.0, bridgeY: 38.0 },
      { id: 'fc.lock.bluff_cut',   name: 'Crown Bluff Waterfall Harbour Cut',     angDeg: -42.0, widthM: 52.0, bridgeY: 38.0 },
      { id: 'fc.lock.suur_treaty', name: 'Suur-Neva and East Bluff Treaty Lock',  angDeg:  -8.0, widthM: 48.0, bridgeY: 38.0 },
      { id: 'fc.lock.riwa_royal',  name: 'Riwa-Wata Royal Palace-Barge Lock',     angDeg:  84.0, widthM: 48.0, bridgeY: 38.0 }
    ].map(function (L) {
      const a = L.angDeg * Math.PI / 180;
      const nx = -Math.sin(a), nz = Math.cos(a);
      const x = CX + (R_WEIR - 18.0) * Math.cos(a);
      const z = CZ + (R_WEIR - 18.0) * Math.sin(a);
      return Object.assign({}, L, {
        x: +x.toFixed(2),
        z: +z.toFixed(2),
        ry: +a.toFixed(4),
        keeps: [
          { id: L.id + '.keep_a', x: +(x - 48 * nx).toFixed(2), z: +(z - 48 * nz).toFixed(2), y0: -26.0, h: 66.0, crownY: 30.0 },
          { id: L.id + '.keep_b', x: +(x + 48 * nx).toFixed(2), z: +(z + 48 * nz).toFixed(2), y0: -26.0, h: 66.0, crownY: 30.0 }
        ]
      });
    });

    /* 8 Curved Inner Sea-Ring Venetian Harbour-Quay Shelves (+6.2 m masonry terrace, r = 896..986 m = 90 m wide for triple-row blocks!) */
    const seaRingQuays = [
      { id: 'srq_e_upper',    ang0:  28.5, ang1:  78.5, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'mixed'  },
      { id: 'srq_se_royal',   ang0:  89.5, ang1: 139.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'ria'    },
      { id: 'srq_sw_kilns',   ang0: 153.0, ang1: 175.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'ria'    },
      { id: 'srq_w_freeport', ang0: 185.0, ang1: 207.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'mixed'  },
      { id: 'srq_wnw_spice',  ang0: 221.0, ang1: 245.5, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'suudme' },
      { id: 'srq_nnw_bourse', ang0: 262.5, ang1: 287.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'suudme' },
      { id: 'srq_nne_ferry',  ang0: 301.0, ang1: 313.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'suudme' },
      { id: 'srq_ne_suudme',  ang0: 323.0, ang1: 347.0, rIn: 896.0, rOut: 986.0, deckY: 6.2, style: 'suudme' }
    ];

    /* NW Babylonian Glazed-Brick Tsunami Weir Repair Scar + Seated Shoal Debris (KRUINS) */
    const weirScarBlocks = [];
    for (let i = 0; i < 6; i++) {
      const a = (249 + i * 2.2) * Math.PI / 180;
      const rr = R_WEIR + 28.0 + (i % 2) * 12.0;
      const bx = CX + rr * Math.cos(a), bz = CZ + rr * Math.sin(a);
      const by = FC_SITE.elevAt(bx, bz);
      weirScarBlocks.push({
        id: 'fc.ruin.weir_block_' + i,
        x: +bx.toFixed(2),
        y: +by.toFixed(2),
        z: +bz.toFixed(2),
        w: 10.5, d: 8.2, h: 6.4,
        tilt: 0.14 * (i % 2 === 0 ? 1 : -1),
        ry: +(a + 0.3).toFixed(3)
      });
    }

    const seaRing = {
      id: 'fc.mega.sea_ring',
      cx: CX,
      cz: CZ,
      rOuter: R_WEIR,
      rInner: R_WEIR - 38.0,
      promenadeY: 18.0,
      baseY: -32.0,
      locks: sectorLocks,
      quays: seaRingQuays,
      scarArcDeg: [247, 261],
      scarBlocks: weirScarBlocks
    };

    /* A3. Grand 4-Tier Khao Phra Sumeru Imperial Arcology Cluster (+176 m Crown, r=218 m Plinth, 8 Gilded Bussabok Spires) */
    const prangs = [];
    const mondops = [];
    const cornerBussaboks = [];
    for (let k = 0; k < 4; k++) {
      const aDiag = (k * 90 + 45) * Math.PI / 180;
      prangs.push({
        id: 'fc.sumeru.prang_' + k,
        x: +(CX + 94 * Math.cos(aDiag)).toFixed(2),
        z: +(CZ + 94 * Math.sin(aDiag)).toFixed(2),
        y0: 22.0,
        tipY: 112.0,
        rBase: 20.0,
        ang: aDiag
      });
      const aMon = (k * 90 + 5) * Math.PI / 180;
      mondops.push({
        id: 'fc.sumeru.mondop_' + k,
        x: +(CX + 98 * Math.cos(aMon)).toFixed(2),
        z: +(CZ + 98 * Math.sin(aMon)).toFixed(2),
        y0: 22.0,
        tipY: 66.0,
        w: 26.0,
        ang: aMon
      });
    }
    for (let k = 0; k < 8; k++) {
      const aBus = (k * 45 + 22.5) * Math.PI / 180;
      cornerBussaboks.push({
        id: 'fc.sumeru.bussabok_turret_' + k,
        x: +(CX + 162 * Math.cos(aBus)).toFixed(2),
        z: +(CZ + 162 * Math.sin(aBus)).toFixed(2),
        y0: 14.0,
        tipY: 48.0,
        r: 8.4,
        ang: aBus
      });
    }

    /* 6 Monumental Gopura Bridge-Bastions projecting from Sumeru Core (r = 128..226 m) locking all 4 Dykes + 2 Axial Causeways! */
    const hubBastions = [
      { id: 'fc.sumeru.gopura_nne',   angDeg: -66.0,  r0: 128.0, r1: 226.0, deckY: 22.0, widthM: 50.0, towerH: 42.0 },
      { id: 'fc.sumeru.gopura_ese',   angDeg:  22.0,  r0: 128.0, r1: 226.0, deckY: 22.0, widthM: 48.0, towerH: 40.0 },
      { id: 'fc.sumeru.gopura_ssw',   angDeg: 146.0,  r0: 128.0, r1: 226.0, deckY: 22.0, widthM: 48.0, towerH: 40.0 },
      { id: 'fc.sumeru.gopura_wnw',   angDeg: -146.0, r0: 128.0, r1: 226.0, deckY: 22.0, widthM: 48.0, towerH: 40.0 },
      { id: 'fc.sumeru.gopura_south', angDeg:  90.0,  r0: 128.0, r1: 226.0, deckY: 14.0, widthM: 46.0, towerH: 36.0 },
      { id: 'fc.sumeru.gopura_north', angDeg: -95.0,  r0: 128.0, r1: 226.0, deckY: 14.0, widthM: 42.0, towerH: 34.0 }
    ];

    const sumeru = {
      id: 'fc.mega.sumeru_core',
      cx: CX,
      cz: CZ,
      plinthR: 218.0,
      midCourtR: 180.0,
      upperCourtR: 138.0,
      innerPodiumR: 74.0,
      innerPodiumY: 30.0,
      plinthY: 22.0,
      midCourtY: 14.0,
      quayY: 6.2,
      mahaTipY: 176.0,
      lanternY: 156.0,
      prangs: prangs,
      mondops: mondops,
      cornerBussaboks: cornerBussaboks,
      bastions: hubBastions,
      bussabok: {
        id: 'fc.sumeru.bussabok_island',
        cx: CX,
        cz: CZ + 325.0,
        w: 184.0,
        d: 86.0,
        plinthY: 8.5,
        spires: [
          { dx: -68, dz: -18, tipY: 42.0, r: 10.5 },
          { dx: -36, dz: -22, tipY: 52.0, r: 13.0 },
          { dx:   0, dz: -24, tipY: 68.0, r: 17.5 },
          { dx:  36, dz: -22, tipY: 52.0, r: 13.0 },
          { dx:  68, dz: -18, tipY: 42.0, r: 10.5 }
        ]
      }
    };

    /* A4. 4 Colossal Radial Boulevard-Dykes (r0 = 96..132 m INSIDE Sumeru Hub -> r1 = 1,016 m INSIDE Sea-Ring Weir!)
       + Paired Solid Masonry Lower Quay Terraces (+6.2 m, half-width 76 m = 152 m total width for double-row urban blocks!)
       + NNE Arched Sea-Viaduct (r = 1,016..1,245 m) ramping smoothly onto the Mainland West Stone Harbour Mole (+7.8 m)! */
    const dykes = [
      {
        id: 'fc.dyke.bluff_link',
        tag: 'nne',
        name: 'NNE Crown Bluff Imperial Boulevard-Dyke & Sea-Viaduct',
        angDeg: -66.0,
        r0: 96.0,
        r1: 1016.0,
        seaViaductR1: 1245.0,
        seaViaductEndY: 7.8,
        crownY: 22.0,
        widthM: 50.0,
        quayR0: 228.0,
        quayR1: 890.0,
        quayHalfW: 78.0,
        quayY: 6.2,
        gates: [330, 505, 675, 830]
      },
      {
        id: 'fc.dyke.ese_treaty',
        tag: 'ese',
        name: 'ESE Suudme-Treaty and Amber Bourse Boulevard-Dyke',
        angDeg: 22.0,
        r0: 96.0,
        r1: 1016.0,
        seaViaductR1: 0,
        crownY: 22.0,
        widthM: 48.0,
        quayR0: 228.0,
        quayR1: 890.0,
        quayHalfW: 78.0,
        quayY: 6.2,
        gates: [330, 505, 675, 830]
      },
      {
        id: 'fc.dyke.sw_byssus',
        tag: 'ssw',
        name: 'SSW Byssus and Polychrome-Kiln Boulevard-Dyke',
        angDeg: 146.0,
        r0: 96.0,
        r1: 1016.0,
        seaViaductR1: 0,
        crownY: 22.0,
        widthM: 48.0,
        quayR0: 228.0,
        quayR1: 890.0,
        quayHalfW: 78.0,
        quayY: 6.2,
        gates: [330, 505, 675, 830]
      },
      {
        id: 'fc.dyke.nw_bazaar',
        tag: 'wnw',
        name: 'WNW Grand Bazaar and Spice-Guild Boulevard-Dyke',
        angDeg: -146.0,
        r0: 96.0,
        r1: 1016.0,
        seaViaductR1: 0,
        crownY: 22.0,
        widthM: 48.0,
        quayR0: 228.0,
        quayR1: 890.0,
        quayHalfW: 78.0,
        quayY: 6.2,
        gates: [330, 505, 675, 830]
      }
    ];

    /* 16 Colonnaded Sala-Nam Water Pavilions (8 solid columns from deck y=6.2 m to entablature -> 0 floating roofs!) */
    const salaPavilions = [];
    const nagaWalks = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 12.0) * Math.PI / 180;
      const sx = CX + 258 * Math.cos(a), sz = CZ + 258 * Math.sin(a);
      const pid = 'fc.sala.ring_' + k;
      salaPavilions.push({ id: pid, x: +sx.toFixed(2), z: +sz.toFixed(2), y: 6.2, r: 11.2, cols: 8, colH: 5.4 });
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const rr = 212 + (258 - 212) * t;
        const wob = 0.04 * Math.sin(t * Math.PI * 2);
        pts.push([+(CX + rr * Math.cos(a + wob)).toFixed(2), 6.2, +(CZ + rr * Math.sin(a + wob)).toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.spoke_' + k, pts: pts, widthM: 6.8 });
    }

    /* Grand Royal Causeway & Twin Naga Bridges from Sumeru South Gopura (z = CZ + 218) to Bussabok Island (z = CZ + 325) */
    [-1, 1].forEach(function (sgn, idx) {
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const bx = CX + sgn * (36 + 9 * Math.sin(t * Math.PI * 2));
        const bz = CZ + 214 + t * 72;
        pts.push([+bx.toFixed(2), 8.5, +bz.toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.bussabok_' + idx, pts: pts, widthM: 8.2 });
      salaPavilions.push({ id: 'fc.sala.bussabok_' + idx, x: +(CX + sgn * 40).toFixed(2), z: +(CZ + 250).toFixed(2), y: 8.5, r: 10.2, cols: 8, colH: 5.2 });
    });

    [
      [-235,  -45], [245,  -35], [248, 395], [-238, 395], [-310, 180], [315, 180]
    ].forEach(function (xz, idx) {
      salaPavilions.push({ id: 'fc.sala.outer_' + idx, x: xz[0], z: xz[1], y: 6.2, r: 11.0, cols: 8, colH: 5.4 });
    });

    /* A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact, 3 KRUINS Listed/Damaged, positioned cleanly in open lagoon intersections) */
    const zigguratPods = [
      { id: 'fc.pod.zp_n1', code: 'ZP-N1', name: 'PN-12 Pioneer Flux-Binnacle Ziggurat Pod', x: -165, z: -475, intact: true,  tilt: 0.0,  role: 'pioneer-binnacle' },
      { id: 'fc.pod.zp_n2', code: 'ZP-N2', name: 'Order of Historians Sound Archive Pod',    x:  535, z: -385, intact: true,  tilt: 0.0,  role: 'historians-archive' },
      { id: 'fc.pod.zp_s1', code: 'ZP-S1', name: 'Amber-Seal Quarantine and Assay Pod',      x:  585, z:  615, intact: true,  tilt: 0.0,  role: 'amber-assay' },
      { id: 'fc.pod.zp_n3', code: 'ZP-N3', name: 'Crown-Sheared Rookery Ruin Pod',           x: -695, z: -165, intact: false, tilt: 0.04, role: 'ruin-rookery' },
      { id: 'fc.pod.zp_s2', code: 'ZP-S2', name: 'Listed Half-Submerged Salvage Pod',        x: -245, z:  815, intact: false, tilt: 0.19, role: 'ruin-listed' },
      { id: 'fc.pod.zp_s3', code: 'ZP-S3', name: 'Gutted Frame Plate-Quarry Pod',            x: -795, z:  285, intact: false, tilt: -0.08, role: 'ruin-gutted' }
    ].map(function (P) {
      const bedY = FC_SITE.elevAt(P.x, P.z);
      return Object.assign({}, P, {
        bedY: +bedY.toFixed(2),
        w: 52.0,
        d: 52.0,
        h: P.intact ? 42.0 : 28.0
      });
    });

    return {
      submarineCone: submarineCone,
      seaRing: seaRing,
      sumeru: sumeru,
      dykes: dykes,
      nagaWalks: nagaWalks,
      salaPavilions: salaPavilions,
      zigguratPods: zigguratPods
    };
  }

  return { plan: plan };
})();
