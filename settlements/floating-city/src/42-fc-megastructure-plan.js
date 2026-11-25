// ================================================================= FLOATING CITY — Ancient Sumeru-Noahbabel Megastructure Plan [G data]
// Pure [G data] structural records (zero THREE, zero DOM, deterministic on KRAND) for:
//   A1. -12..-90 m Inverted Noahbabel Submarine Hydro-Dynamo Cone (8 Pioneer superconductor turbines + 4 KRUINS wreck bays) & -128 m Taproot
//   A2. 1,400 m Circular Arcaded Sea-Ring Weir (+18 m promenade, 6 Inner Venetian Harbour-Quay Shelves at +6.2 m, 4 Sector Locks, 12 Bastions)
//   A3. Central 9+3-Peak Khao Phra Sumeru Arcology Mandala (+168 m 9-tier redented Meru spire, 48-column Phra Rabieng cloisters,
//       5 Gopura Bridge-Bastions locking the Boulevard-Dykes directly into the +22 m Upper Mandala Court, 4 +98 m Prangs, 4 +58 m Mondops)
//   A4. 3 Colossal Radial Boulevard-Dykes (r=96..698 m + NNE Arched Sea-Viaduct to Mainland Harbour Mole, paired +6.2 m Stone Quay Terraces)
//   A5. 14 8-Column Sala-Nam Water Pavilions & 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 intact + 3 KRUINS)
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
        boreM: 6.4,
        yCenter: (k % 2 === 0) ? -44.0 : -68.0,
        status: flooded ? 'flooded-ruin' : 'pioneer-superconductor',
        mwRated: flooded ? 0.0 : 5.25
      });
    }

    const submarineCone = {
      id: 'fc.mega.submarine_cone',
      cx: CX,
      cz: CZ,
      yTop: -12.0,
      yBot: -90.0,
      rTop: 126.0,
      rBot: 72.0,
      taproot: { yTop: -88.0, yBot: -128.0, r: 18.0, pendulumY: -124.0 },
      controlHall: { id: 'fc.room.dynamo_hall', yFloor: -62.0, h: 9.5, r: 34.0, vault: true },
      penstocks: penstocks,
      activeCount: 8,
      floodedCount: 4
    };

    /* A2. 1,400 m Circular Sea-Ring Weir, 4 Sector Ship-Locks & 6 Inner Venetian Harbour-Quay Shelves */
    const sectorLocks = [
      { id: 'fc.lock.west_delta',  name: 'West Ocean and Double Delta Ship-Lock', angDeg: 192.0, widthM: 44.0, bridgeY: 36.0 },
      { id: 'fc.lock.bluff_cut',   name: 'Crown Bluff Waterfall Harbour Cut',     angDeg: -66.0, widthM: 48.0, bridgeY: 36.0 },
      { id: 'fc.lock.suur_treaty', name: 'Suur-Neva and East Bluff Treaty Lock',  angDeg: -16.0, widthM: 44.0, bridgeY: 36.0 },
      { id: 'fc.lock.riwa_royal',  name: 'Riwa-Wata Royal Palace-Barge Lock',     angDeg: 74.0,  widthM: 44.0, bridgeY: 36.0 }
    ].map(function (L) {
      const a = L.angDeg * Math.PI / 180;
      const nx = -Math.sin(a), nz = Math.cos(a);
      const x = CX + (R_WEIR - 12.0) * Math.cos(a);
      const z = CZ + (R_WEIR - 12.0) * Math.sin(a);
      return Object.assign({}, L, {
        x: +x.toFixed(2),
        z: +z.toFixed(2),
        ry: +a.toFixed(4),
        keeps: [
          { id: L.id + '.keep_a', x: +(x - 44 * nx).toFixed(2), z: +(z - 44 * nz).toFixed(2), y0: -18.0, h: 46.0, crownY: 28.0 },
          { id: L.id + '.keep_b', x: +(x + 44 * nx).toFixed(2), z: +(z + 44 * nz).toFixed(2), y0: -18.0, h: 46.0, crownY: 28.0 }
        ]
      });
    });

    /* 6 Curved Inner Sea-Ring Venetian Harbour-Quay Shelves (+6.2 m masonry terrace, r = 612..676 m, avoiding locks & dykes) */
    const seaRingQuays = [
      { id: 'srq_ne_suudme',  ang0: -56.0, ang1: -24.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'suudme' },
      { id: 'srq_e_treaty',   ang0:  -8.0, ang1:  64.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'mixed'  },
      { id: 'srq_se_royal',   ang0:  84.0, ang1: 140.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'ria'    },
      { id: 'srq_sw_kilns',   ang0: 164.0, ang1: 183.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'ria'    },
      { id: 'srq_w_freeport', ang0: 201.0, ang1: 208.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'mixed'  },
      { id: 'srq_nnw_bazaar', ang0: 226.0, ang1: 284.0, rIn: 612.0, rOut: 676.0, deckY: 6.2, style: 'suudme' }
    ];

    /* NW Babylonian Glazed-Brick Tsunami Weir Repair Scar + Seated Shoal Debris (KRUINS) */
    const weirScarBlocks = [];
    for (let i = 0; i < 6; i++) {
      const a = (215 + i * 3.2) * Math.PI / 180;
      const rr = R_WEIR + 26.0 + (i % 2) * 11.0;
      const bx = CX + rr * Math.cos(a), bz = CZ + rr * Math.sin(a);
      const by = FC_SITE.elevAt(bx, bz);
      weirScarBlocks.push({
        id: 'fc.ruin.weir_block_' + i,
        x: +bx.toFixed(2),
        y: +by.toFixed(2),
        z: +bz.toFixed(2),
        w: 9.5, d: 7.2, h: 5.8,
        tilt: 0.14 * (i % 2 === 0 ? 1 : -1),
        ry: +(a + 0.3).toFixed(3)
      });
    }

    const seaRing = {
      id: 'fc.mega.sea_ring',
      cx: CX,
      cz: CZ,
      rOuter: R_WEIR,
      rInner: R_WEIR - 28.0,
      promenadeY: 18.0,
      baseY: -28.0,
      locks: sectorLocks,
      quays: seaRingQuays,
      scarArcDeg: [214, 232],
      scarBlocks: weirScarBlocks
    };

    /* A3. Central 9+3-Peak Khao Phra Sumeru Arcology Cluster (+168 m Crown, +22 m Upper Mandala Court) */
    const prangs = [];
    const mondops = [];
    for (let k = 0; k < 4; k++) {
      const aDiag = (k * 90 + 45) * Math.PI / 180;
      prangs.push({
        id: 'fc.sumeru.prang_' + k,
        x: +(CX + 72 * Math.cos(aDiag)).toFixed(2),
        z: +(CZ + 72 * Math.sin(aDiag)).toFixed(2),
        y0: 22.0,
        tipY: 98.0,
        rBase: 17.5,
        ang: aDiag
      });
      /* Intercardinal Mondops placed at 24, 114, 204, 294 deg so all Boulevard-Dyke sightlines to Maha-Meru are clear! */
      const aMon = (k * 90 + 24) * Math.PI / 180;
      mondops.push({
        id: 'fc.sumeru.mondop_' + k,
        x: +(CX + 76 * Math.cos(aMon)).toFixed(2),
        z: +(CZ + 76 * Math.sin(aMon)).toFixed(2),
        y0: 22.0,
        tipY: 58.0,
        w: 24.0,
        ang: aMon
      });
    }

    /* 5 Monumental Gopura Bridge-Bastions projecting from Sumeru Core (r = 92..166 m) locking Dykes & Causeways into the Hub! */
    const hubBastions = [
      { id: 'fc.sumeru.gopura_nne',  angDeg: -66.0,  r0: 92.0, r1: 166.0, deckY: 22.0, widthM: 46.0, towerH: 38.0 },
      { id: 'fc.sumeru.gopura_sw',   angDeg: 152.0,  r0: 92.0, r1: 166.0, deckY: 22.0, widthM: 44.0, towerH: 36.0 },
      { id: 'fc.sumeru.gopura_nw',   angDeg: -144.0, r0: 92.0, r1: 166.0, deckY: 22.0, widthM: 44.0, towerH: 36.0 },
      { id: 'fc.sumeru.gopura_south',angDeg: 90.0,   r0: 92.0, r1: 166.0, deckY: 14.0, widthM: 42.0, towerH: 32.0 },
      { id: 'fc.sumeru.gopura_east', angDeg: 0.0,    r0: 92.0, r1: 166.0, deckY: 14.0, widthM: 40.0, towerH: 30.0 }
    ];

    const sumeru = {
      id: 'fc.mega.sumeru_core',
      cx: CX,
      cz: CZ,
      plinthR: 154.0,
      upperCourtR: 108.0,
      plinthY: 22.0,
      midCourtY: 14.0,
      quayY: 6.2,
      mahaTipY: 168.0,
      lanternY: 148.0,
      prangs: prangs,
      mondops: mondops,
      bastions: hubBastions,
      bussabok: {
        id: 'fc.sumeru.bussabok_island',
        cx: CX,
        cz: CZ + 258.0,
        w: 132.0,
        d: 64.0,
        plinthY: 8.5,
        spires: [
          { dx: -40, tipY: 46.0, r: 12.5 },
          { dx: 0,   tipY: 62.0, r: 16.5 },
          { dx: 40,  tipY: 46.0, r: 12.5 }
        ]
      }
    };

    /* A4. 3 Colossal Radial Boulevard-Dykes (r0 = 96 m INSIDE Sumeru Hub -> r1 = 698 m INSIDE Sea-Ring Weir!)
       + Paired Solid Masonry Lower Quay Terraces (+6.2 m, half-width 62 m = 124 m total width!)
       + NNE Arched Sea-Viaduct (r = 698..892 m) ramping smoothly onto the Mainland West Stone Harbour Mole (+7.8 m)! */
    const dykes = [
      {
        id: 'fc.dyke.bluff_link',
        tag: 'nne',
        name: 'NNE Crown Bluff Imperial Boulevard-Dyke & Sea-Viaduct',
        angDeg: -66.0,
        r0: 96.0,
        r1: 698.0,
        seaViaductR1: 892.0,
        seaViaductEndY: 7.8,
        crownY: 22.0,
        widthM: 38.0,
        quayR0: 168.0,
        quayR1: 608.0,
        quayHalfW: 62.0,
        quayY: 6.2,
        gates: [255, 415, 565]
      },
      {
        id: 'fc.dyke.sw_byssus',
        tag: 'sw',
        name: 'SW Byssus and Polychrome-Kiln Boulevard-Dyke',
        angDeg: 152.0,
        r0: 96.0,
        r1: 698.0,
        seaViaductR1: 0,
        crownY: 22.0,
        widthM: 36.0,
        quayR0: 168.0,
        quayR1: 608.0,
        quayHalfW: 60.0,
        quayY: 6.2,
        gates: [255, 415, 565]
      },
      {
        id: 'fc.dyke.nw_bazaar',
        tag: 'nw',
        name: 'NW Grand Bazaar and Spice-Guild Boulevard-Dyke',
        angDeg: -144.0,
        r0: 96.0,
        r1: 698.0,
        seaViaductR1: 0,
        crownY: 22.0,
        widthM: 36.0,
        quayR0: 168.0,
        quayR1: 608.0,
        quayHalfW: 60.0,
        quayY: 6.2,
        gates: [255, 415, 565]
      }
    ];

    /* 14 Colonnaded Sala-Nam Water Pavilions (8 solid columns from deck y=6.2 m to entablature y=11.0 m -> 0 floating roofs!) */
    const salaPavilions = [];
    const nagaWalks = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 22.5) * Math.PI / 180;
      const sx = CX + 196 * Math.cos(a), sz = CZ + 196 * Math.sin(a);
      const pid = 'fc.sala.ring_' + k;
      salaPavilions.push({ id: pid, x: +sx.toFixed(2), z: +sz.toFixed(2), y: 6.2, r: 10.5, cols: 8, colH: 5.2 });
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const rr = 148 + (196 - 148) * t;
        const wob = 0.05 * Math.sin(t * Math.PI * 2);
        pts.push([+(CX + rr * Math.cos(a + wob)).toFixed(2), 6.2, +(CZ + rr * Math.sin(a + wob)).toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.spoke_' + k, pts: pts, widthM: 6.4 });
    }

    /* Grand Royal Causeway & Twin Naga Bridges from Sumeru South Gopura (z = 80+148 = 228) to Bussabok Island (z = 338) */
    [-1, 1].forEach(function (sgn, idx) {
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const bx = CX + sgn * (28 + 8 * Math.sin(t * Math.PI * 2));
        const bz = CZ + 146 + t * 84;
        pts.push([+bx.toFixed(2), 8.5, +bz.toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.bussabok_' + idx, pts: pts, widthM: 7.5 });
      salaPavilions.push({ id: 'fc.sala.bussabok_' + idx, x: +(CX + sgn * 32).toFixed(2), z: +(CZ + 192).toFixed(2), y: 8.5, r: 9.8, cols: 8, colH: 5.0 });
    });

    [
      [-158, -118], [172, -108], [-152, 246], [172, 248]
    ].forEach(function (xz, idx) {
      salaPavilions.push({ id: 'fc.sala.outer_' + idx, x: xz[0], z: xz[1], y: 6.2, r: 10.5, cols: 8, colH: 5.2 });
    });

    /* A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact, 3 KRUINS Listed/Damaged, positioned cleanly in canal basins) */
    const zigguratPods = [
      { id: 'fc.pod.zp_n1', code: 'ZP-N1', name: 'PN-12 Pioneer Flux-Binnacle Ziggurat Pod', x: -295, z: -365, intact: true,  tilt: 0.0,  role: 'pioneer-binnacle' },
      { id: 'fc.pod.zp_n2', code: 'ZP-N2', name: 'Order of Historians Sound Archive Pod',    x:   55, z: -465, intact: true,  tilt: 0.0,  role: 'historians-archive' },
      { id: 'fc.pod.zp_s1', code: 'ZP-S1', name: 'Amber-Seal Quarantine and Assay Pod',      x:  315, z:  485, intact: true,  tilt: 0.0,  role: 'amber-assay' },
      { id: 'fc.pod.zp_n3', code: 'ZP-N3', name: 'Crown-Sheared Rookery Ruin Pod',           x: -515, z: -205, intact: false, tilt: 0.04, role: 'ruin-rookery' },
      { id: 'fc.pod.zp_s2', code: 'ZP-S2', name: 'Listed Half-Submerged Salvage Pod',        x: -365, z:  468, intact: false, tilt: 0.19, role: 'ruin-listed' },
      { id: 'fc.pod.zp_s3', code: 'ZP-S3', name: 'Gutted Frame Plate-Quarry Pod',            x: -545, z:  165, intact: false, tilt: -0.08, role: 'ruin-gutted' }
    ].map(function (P) {
      const bedY = FC_SITE.elevAt(P.x, P.z);
      return Object.assign({}, P, {
        bedY: +bedY.toFixed(2),
        w: 50.0,
        d: 50.0,
        h: P.intact ? 38.0 : 24.0
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
