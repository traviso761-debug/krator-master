// ================================================================= FLOATING CITY — Ancient Sumeru-Noahbabel Megastructure Plan [G data]
// Pure [G data] structural records (zero THREE, zero DOM, deterministic on KRAND) for:
//   A1. -12..-90 m Inverted Noahbabel Submarine Hydro-Dynamo Cone (8 Pioneer superconductor turbines + 4 KRUINS wreck bays) & -128 m Taproot
//   A2. 1,400 m Circular Arcaded Sea-Ring Weir (+18 m promenade, 4 Sector Locks, 8 +24 m Prou-Torre keeps, NW tsunami repair scar)
//   A3. Central 9+3-Peak Khao Phra Sumeru Arcology Cluster (+168 m celadon-and-gilt Meru spire, 4 +92 m Prangs, 4 +48 m Mondops, +56 m Bussabok)
//   A4. 3 Colossal Radial Boulevard-Dykes (+22 m crown, arched ship-gates, reversible tide-wheels) & 14 Naga Sala-Nam walkways
//   A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 reclaimed: PN-12, Historians, Assay; 3 damaged/listed on KRUINS)
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

    /* A2. 1,400 m Circular Sea-Ring Weir & 4 Sector Ship-Locks */
    const sectorLocks = [
      { id: 'fc.lock.west_delta',  name: 'West Ocean and Double Delta Ship-Lock', angDeg: 192.0, widthM: 42.0, bridgeY: 34.0 },
      { id: 'fc.lock.bluff_cut',   name: 'Crown Bluff Waterfall Harbour Cut',     angDeg: -66.0, widthM: 44.0, bridgeY: 34.0 },
      { id: 'fc.lock.suur_treaty', name: 'Suur-Neva and East Bluff Treaty Lock',  angDeg: -16.0, widthM: 42.0, bridgeY: 34.0 },
      { id: 'fc.lock.riwa_royal',  name: 'Riwa-Wata Royal Palace-Barge Lock',     angDeg: 74.0,  widthM: 42.0, bridgeY: 34.0 }
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
          { id: L.id + '.keep_a', x: +(x - 42 * nx).toFixed(2), z: +(z - 42 * nz).toFixed(2), y0: -14.0, h: 38.0, crownY: 24.0 },
          { id: L.id + '.keep_b', x: +(x + 42 * nx).toFixed(2), z: +(z + 42 * nz).toFixed(2), y0: -14.0, h: 38.0, crownY: 24.0 }
        ]
      });
    });

    /* NW Babylonian Glazed-Brick Tsunami Weir Repair Scar + Seated Shoal Debris (KRUINS) */
    const weirScarBlocks = [];
    for (let i = 0; i < 6; i++) {
      const a = (215 + i * 3.2) * Math.PI / 180;
      const rr = R_WEIR + 24.0 + (i % 2) * 11.0;
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
      rInner: R_WEIR - 26.0,
      promenadeY: 18.0,
      baseY: -28.0,
      innerRingR: 472.0,
      locks: sectorLocks,
      scarArcDeg: [214, 232],
      scarBlocks: weirScarBlocks
    };

    /* A3. Central 9+3-Peak Khao Phra Sumeru Arcology Cluster */
    const prangs = [];
    const mondops = [];
    for (let k = 0; k < 4; k++) {
      const aDiag = (k * 90 + 45) * Math.PI / 180;
      prangs.push({
        id: 'fc.sumeru.prang_' + k,
        x: +(CX + 76 * Math.cos(aDiag)).toFixed(2),
        z: +(CZ + 76 * Math.sin(aDiag)).toFixed(2),
        y0: 16.0,
        tipY: 92.0,
        rBase: 19.0
      });
      const aCard = (k * 90) * Math.PI / 180;
      mondops.push({
        id: 'fc.sumeru.mondop_' + k,
        x: +(CX + 92 * Math.cos(aCard)).toFixed(2),
        z: +(CZ + 92 * Math.sin(aCard)).toFixed(2),
        y0: 14.0,
        tipY: 48.0,
        w: 28.0
      });
    }

    const sumeru = {
      id: 'fc.mega.sumeru_core',
      cx: CX,
      cz: CZ,
      plinthR: 134.0,
      plinthY: 16.0,
      mahaTipY: 168.0,
      lanternY: 144.0,
      prangs: prangs,
      mondops: mondops,
      bussabok: {
        id: 'fc.sumeru.bussabok_island',
        cx: CX,
        cz: CZ + 298.0,
        w: 112.0,
        d: 52.0,
        plinthY: 8.5,
        spires: [
          { dx: -34, tipY: 42.0, r: 12.0 },
          { dx: 0,   tipY: 56.0, r: 16.0 },
          { dx: 34,  tipY: 42.0, r: 12.0 }
        ]
      }
    };

    /* A4. 3 Colossal Radial Boulevard-Dykes (+22 m Crown) & 14 Sinuous Naga Sala-Nam Walkways */
    const dykes = [
      { id: 'fc.dyke.bluff_link', name: 'NNE Crown Bluff Boulevard-Dyke', angDeg: -66.0, r0: 142.0, r1: 915.0, crownY: 22.0, widthM: 36.0, gates: [295, 515] },
      { id: 'fc.dyke.sw_byssus',  name: 'SW Byssus and Kiln Boulevard-Dyke', angDeg: 152.0, r0: 142.0, r1: 668.0, crownY: 22.0, widthM: 34.0, gates: [305, 505] },
      { id: 'fc.dyke.nw_bazaar',  name: 'NW Grand Bazaar Boulevard-Dyke', angDeg: -144.0, r0: 142.0, r1: 668.0, crownY: 22.0, widthM: 34.0, gates: [305, 505] }
    ];

    const salaPavilions = [];
    const nagaWalks = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * 45 + 22.5) * Math.PI / 180;
      const sx = CX + 198 * Math.cos(a), sz = CZ + 198 * Math.sin(a);
      const pid = 'fc.sala.ring_' + k;
      salaPavilions.push({ id: pid, x: +sx.toFixed(2), z: +sz.toFixed(2), y: 5.8, r: 9.5 });
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const rr = 126 + (198 - 126) * t;
        const wob = 0.08 * Math.sin(t * Math.PI * 2);
        pts.push([+(CX + rr * Math.cos(a + wob)).toFixed(2), 5.8, +(CZ + rr * Math.sin(a + wob)).toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.spoke_' + k, pts: pts, widthM: 5.6 });
    }
    /* Twin southern Naga bridges to Bussabok Audience Island + 6 outer ferry Sala-Nam pavilions */
    [-1, 1].forEach(function (sgn, idx) {
      const pts = [];
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        const bx = CX + sgn * (34 + 12 * Math.sin(t * Math.PI * 2));
        const bz = CZ + 128 + t * 144;
        pts.push([+bx.toFixed(2), 5.8, +bz.toFixed(2)]);
      }
      nagaWalks.push({ id: 'fc.naga.bussabok_' + idx, pts: pts, widthM: 6.0 });
      salaPavilions.push({ id: 'fc.sala.bussabok_' + idx, x: +(CX + sgn * 38).toFixed(2), z: +(CZ + 202).toFixed(2), y: 5.8, r: 9.0 });
    });
    [
      [-155, -135], [168, -120], [-168, 258], [168, 265]
    ].forEach(function (xz, idx) {
      salaPavilions.push({ id: 'fc.sala.outer_' + idx, x: xz[0], z: xz[1], y: 5.8, r: 9.5 });
    });

    /* A5. 6 Outer Stepped-Ziggurat Ancient Water-Pods (3 Intact, 3 KRUINS Listed/Damaged) */
    const zigguratPods = [
      { id: 'fc.pod.zp_n1', code: 'ZP-N1', name: 'PN-12 Pioneer Flux-Binnacle Ziggurat Pod', x: -335, z: -305, intact: true,  tilt: 0.0,  role: 'pioneer-binnacle' },
      { id: 'fc.pod.zp_n2', code: 'ZP-N2', name: 'Order of Historians Sound Archive Pod',    x: -130, z: -455, intact: true,  tilt: 0.0,  role: 'historians-archive' },
      { id: 'fc.pod.zp_s1', code: 'ZP-S1', name: 'Amber-Seal Quarantine and Assay Pod',      x: 355,  z: 495,  intact: true,  tilt: 0.0,  role: 'amber-assay' },
      { id: 'fc.pod.zp_n3', code: 'ZP-N3', name: 'Crown-Sheared Rookery Ruin Pod',           x: -520, z: -225, intact: false, tilt: 0.04, role: 'ruin-rookery' },
      { id: 'fc.pod.zp_s2', code: 'ZP-S2', name: 'Listed Half-Submerged Salvage Pod',        x: -355, z: 485,  intact: false, tilt: 0.19, role: 'ruin-listed' },
      { id: 'fc.pod.zp_s3', code: 'ZP-S3', name: 'Gutted Frame Plate-Quarry Pod',            x: -545, z: 185,  intact: false, tilt: -0.08, role: 'ruin-gutted' }
    ].map(function (P) {
      const bedY = FC_SITE.elevAt(P.x, P.z);
      return Object.assign({}, P, {
        bedY: +bedY.toFixed(2),
        w: 52.0,
        d: 52.0,
        h: P.intact ? 36.0 : 24.0
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
