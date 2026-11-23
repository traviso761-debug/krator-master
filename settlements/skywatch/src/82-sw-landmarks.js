// ================================================================= SKYWATCH — Landmarks, Cisterns, Skarn Works, Silent Moot & Camps
// [draw] Restores dual-kit socket dispatch (JJ.cur -> jjSock*, VERN.cur -> Ancients 30-kit.js) and registers all Skywatch
// bespoke builders on VERN.def, plus KRUINS-audited salvage assay geometry and visible RES_ORE skarn outcrops.

/* Dual-kit socket & beam dispatcher so both JJ.place (fillSockets) and VERN.place (Highlands vBeam) run cleanly */
(function () {
  const jjS = {
    beam: typeof jjSockBeam === 'function' ? jjSockBeam : null,
    box: typeof jjSockBox === 'function' ? jjSockBox : null,
    quad: typeof jjSockQuad === 'function' ? jjSockQuad : null,
    plane4: typeof jjSockPlane4 === 'function' ? jjSockPlane4 : null,
    decal: typeof jjSockDecal === 'function' ? jjSockDecal : null,
    poly: typeof jjSockPoly === 'function' ? jjSockPoly : null
  };
  const anc = typeof SW_ANC_SOCK !== 'undefined' ? SW_ANC_SOCK : {};
  const wrap = function (k) {
    const jf = jjS[k];
    const af = anc[k];
    if (!jf && !af) return;
    globalThis[k] = function () {
      const fn = (typeof JJ !== 'undefined' && JJ.cur) ? (jf || af) : (af || jf);
      return fn.apply(this, arguments);
    };
  };
  ['beam', 'box', 'quad', 'plane4', 'decal', 'poly'].forEach(wrap);
  if (typeof JJ !== 'undefined' && JJ.defs && JJ.defs.jj_wall_seg) {
    JJ.defs.jj_wall_seg.build = function (jjG, jjO) {
      const segL = (jjO && jjO.cw != null) ? jjO.cw : JJ_WALL_SEG_LEN;
      reseed(9530 + ((jjO && jjO.v != null ? jjO.v : 0) | 0));
      jjMilCurtain(0, 0, 0, segL, JJ_WALL_H, JJ_WALL_T);
      jjReg('Wall segment', 0, 0, segL * 0.5, JJ_WALL_H + 2.5, { part: 'wall segment' });
    };
  }
})();

const SW_LANDMARKS = (function () {
  const PI = Math.PI;
  const TAU2 = Math.PI * 2;

  /* Skywatch high-altitude palette: flood basalt, Skywatch calamine brass, Frost turquoise glaze, larch & halite */
  const SWC = {
    basalt: 0x454952,
    basaltDark: 0x333740,
    basaltLight: 0x5c616c,
    limestone: 0xd5ccb8,
    marble: 0xeae3d2,
    brick: 0xb85c3c,
    brickOchre: 0xd9a45b,
    brass: 0xd8a642,
    brassBright: 0xe6b956,
    bronze: 0x8c6836,
    frost: 0x2c9892,
    slate: 0x4e5561,
    larch: 0x9c7044,
    larchDark: 0x563d28,
    canvas: 0xdccfb4,
    canvasTan: 0xb59f79,
    hide: 0x7c5c42,
    hideDark: 0x573f2d,
    halite: 0xefece4,
    qiviut: 0xe3dac6,
    malachite: 0x2f8f6d,
    turquoise: 0x3aa6b0,
    sphalerite: 0xc28a38,
    magnetite: 0x4b3d3a,
    ember: 0xff7b24
  };

  /*Dedicated instanced cylinder & ember items if not yet registered*/
  if (!KIT.defs.swCylStone) {
    kdef('swCylStone', new THREE.CylinderGeometry(1, 1, 1, 16).translate(0, 0.5, 0), MAT.stone);
  }
  if (!KIT.defs.swCylBrass) {
    kdef('swCylBrass', new THREE.CylinderGeometry(1, 1, 1, 20).translate(0, 0.5, 0), MAT.gold);
  }
  if (!KIT.defs.swTorusBrass) {
    kdef('swTorusBrass', new THREE.TorusGeometry(1, 0.085, 10, 28), MAT.gold);
  }
  if (!KIT.defs.swEmber) {
    const emMat = new THREE.MeshBasicMaterial({ color: 0xff8a2b });
    kdef('swEmber', VBOX, emMat);
    kdef('swEmberBall', VBALL, emMat);
  }

  function swCyl(item, x, y, z, r, h, hex) {
    kput(item, [x, y, z], null, [r, h, r], hex == null ? null : vC(hex));
  }

  function swRing(x, y, z, r, rx, ry, rz, hex) {
    const q = qEuler(rx == null ? 0 : rx, ry == null ? 0 : ry, rz == null ? 0 : rz);
    kput('swTorusBrass', [x, y, z], q, [r, r, r], vC(hex == null ? SWC.brass : hex));
  }

  /* ----------------------------------------------------------------
   * TIER I: Solstice Sanctuary & Three-Wheels Gate Arch (sw_solstice_sanctuary)
   * Local +z faces Az 242.17 deg (Winter Solstice Sunset).
   * Sightline ray runs along x = 0 from z = -11 (y = 7.80) through z = +15 (y = 9.16).
   * Central aperture x in [-4.0, +4.0], y in [5.2, 14.0] is kept 100% open!
   * ---------------------------------------------------------------- */
  function buildSolsticeSanctuary(G, o) {
    const sd = o && o.v != null ? o.v : 1;
    reseed(77610 + sd);
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cLim = vC(SWC.limestone);
    const cMar = vC(SWC.marble);
    const cBrk = vC(SWC.brick);
    const cOch = vC(SWC.brickOchre);
    const cBrs = vC(SWC.brass);
    const cFrs = vC(SWC.frost);
    const cSlt = vC(SWC.slate);

    /* 1. Monumental coursed-basalt & marble-banded podium (y = 0..5.2 m) */
    vB('vStone', 0, -1.2, 0, 27.6, 4.0, 44.0, 0, cBasD);
    vB('vStone', 0, 2.8, 0, 26.2, 2.1, 42.4, 0, cBas);
    vB('hAshlarP', 0, 4.9, 0, 26.8, 0.32, 43.0, 0, cMar);
    vB('hPaint', 0, 4.55, 0, 26.5, 0.24, 42.7, 0, cFrs);

    /* Approach stair flight on the NE townward end (z = -22.8..-17.5) */
    for (let i = 0; i < 10; i++) {
      const sy = (i + 1) * 0.52;
      vB('hAshlarP', 0, 0, -22.8 + i * 0.52, 9.6, sy, 0.62, 0, i % 2 === 0 ? cMar : cLim);
    }
    for (const s of [-1, 1]) {
      vB('vStone', s * 5.2, 0, -20.2, 0.9, 5.8, 5.8, 0, cBas);
      vBall('hGold', s * 5.2, 6.1, -22.6, 0.42, vC(SWC.brassBright));
    }

    /* 2. Paved Meridian Court & Brass Scale along x = 0 (z = -15..+14, y = 5.22) */
    vB('hGoldB', 0, 5.22, 1.5, 0.36, 0.08, 28.0, 0, cBrs);
    /* Sighting Alidade Pedestal at z = -11.0 (top = 7.35 m, cleanly below 7.80 m eye ray) */
    vB('vStone', 0, 5.22, -11.0, 1.8, 1.35, 1.8, 0, cBasD);
    vB('hAshlarP', 0, 6.57, -11.0, 1.4, 0.52, 1.4, 0, cMar);
    swRing(0, 7.38, -11.0, 0.34, 0, PI / 2, 0, SWC.brassBright);

    /* Flanking Sanctuary Colonade & Frost-Tile Cloisters (x = +-10.4 m) */
    for (const s of [-1, 1]) {
      vB('vStone', s * 11.4, 5.22, -1.0, 2.2, 0.85, 33.0, 0, cBas);
      for (let k = -3; k <= 3; k++) {
        const pz = k * 4.4;
        swCyl('swCylStone', s * 10.6, 6.07, pz, 0.44, 4.8, SWC.marble);
        vB('hGoldB', s * 10.6, 10.87, pz, 1.15, 0.24, 1.15, 0, cBrs);
      }
      vB('vStone', s * 10.8, 11.1, -1.0, 2.4, 0.9, 31.2, 0, cBrk);
      vB('hPaint', s * 10.8, 12.0, -1.0, 2.55, 0.28, 31.4, 0, cFrs);
      vB('vStone', s * 10.8, 12.28, -1.0, 2.7, 0.32, 31.6, 0, cMar);
      /* Sanctuary braziers */
      for (const bz of [-8.8, 4.4, 12.2]) {
        swCyl('swCylStone', s * 8.2, 5.22, bz, 0.48, 1.05, SWC.basaltDark);
        vB('hGoldB', s * 8.2, 6.27, bz, 1.1, 0.26, 1.1, 0, cBrs);
        kput('swEmberBall', [s * 8.2, 6.62, bz], null, [0.36, 0.24, 0.36], null);
      }
    }

    /* 3. Rear Domed Calendar Chancel (z = -17.2 m, behind z = -11 sightline origin) */
    for (const s of [-1, 1]) {
      vB('vStone', s * 6.2, 5.22, -15.8, 4.8, 7.6, 5.4, 0, cBrk);
      vB('hPaint', s * 6.2, 11.4, -15.8, 5.0, 0.32, 5.6, 0, cFrs);
    }
    /* High bridge arch over rear doorway (leaves y = 5.2..10.4 open) */
    vB('vStone', 0, 10.4, -16.4, 16.8, 2.6, 4.8, 0, cBrk);
    vB('hAshlarP', 0, 13.0, -16.4, 17.4, 0.42, 5.2, 0, cMar);
    kput('hOctS', [0, 13.42, -16.4], null, [3.4, 2.8, 3.4], cBrk);
    kput('hOnionG', [0, 16.22, -16.4], null, [3.2, 4.4, 3.2], cBrs);
    swCyl('swCylBrass', 0, 20.5, -16.4, 0.12, 1.6, SWC.brassBright);

    /* 4. Monumental Solstice Gate Arch at z = +15.0 m (clear opening x in [-4.1, +4.1], y in [5.22, 14.2]) */
    for (const s of [-1, 1]) {
      const px = s * 6.6;
      vB('vStone', px, 5.22, 15.0, 5.0, 9.2, 4.6, 0, cBas);
      vB('vStone', px, 8.4, 15.0, 5.18, 0.45, 4.78, 0, cOch);
      vB('hPaint', px, 11.8, 15.0, 5.18, 0.42, 4.78, 0, cFrs);
      vB('hAshlarP', px, 14.0, 15.0, 5.4, 0.42, 5.0, 0, cMar);
    }
    /* High Architrave & Three Interlocking Wheels (y = 14.42..20.4 m) */
    vB('vStone', 0, 14.42, 15.0, 18.8, 2.4, 4.8, 0, cBrk);
    vB('hPaint', 0, 16.82, 15.0, 19.2, 0.38, 5.0, 0, cFrs);
    vB('hAshlarP', 0, 17.20, 15.0, 19.8, 0.48, 5.3, 0, cMar);
    vB('vStone', 0, 17.68, 15.0, 12.4, 1.45, 3.6, 0, cSlt);
    /* Three Interlocking Wheels of Jimjam in Skywatch Brass above the arch */
    swRing(-2.1, 20.1, 15.0, 1.18, 0, 0, 0, SWC.brassBright);
    swRing(0.0, 20.55, 15.0, 1.34, 0, 0, 0, SWC.brassBright);
    swRing(2.1, 20.1, 15.0, 1.18, 0, 0, 0, SWC.brassBright);

    vnReg('Solstice Sanctuary and Three-Wheels Gate', 0, 0, 16, 21, { landmark: true });
  }

  VERN.def({
    key: 'sw_solstice_sanctuary',
    name: 'Solstice Sanctuary',
    w: 28,
    d: 46,
    h: 21,
    cls: 'building',
    tags: { culture: 'jimjam', types: ['sacred', 'civic'], wealth: 'civic', lit: true },
    build: buildSolsticeSanctuary
  });

  /* ----------------------------------------------------------------
   * TIER I: 360-deg Basalt Horizon Ring (sw_horizon_ring)
   * ---------------------------------------------------------------- */
  function buildHorizonRing(G, o) {
    reseed(77620 + (o && o.v != null ? o.v : 0));
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cMar = vC(SWC.marble);
    const cBrs = vC(SWC.brassBright);

    /* Stepped circular drum (16-gon built from overlapping rotated octagons + cylindrical curbs) */
    kput('hOctS', [0, -1.0, 0], null, [16.2, 1.8, 16.2], cBasD);
    kput('hOctS', [0, -0.95, 0], qEuler(0, PI / 8, 0), [16.2, 1.8, 16.2], cBasD);
    swCyl('swCylStone', 0, 0.8, 0, 15.2, 0.36, SWC.limestone);
    swCyl('swCylStone', 0, 1.16, 0, 13.8, 0.16, SWC.basalt);

    /* Central Equatorial Armillary & Meridian Plinth */
    vB('vStone', 0, 1.32, 0, 3.6, 1.1, 3.6, 0, cBasD);
    vB('hAshlarP', 0, 2.42, 0, 2.8, 0.45, 2.8, 0, cMar);
    swCyl('swCylBrass', 0, 2.87, 0, 0.24, 2.1, SWC.brass);
    swRing(0, 4.15, 0, 1.45, 0.52, 0, 0, SWC.brassBright);
    swRing(0, 4.15, 0, 1.45, 0, PI / 2, 0, SWC.brass);
    swRing(0, 4.15, 0, 1.12, PI / 2, 0, 0, SWC.brassBright);

    /* 24 Azimuth Sighting Piers around R = 14.2 m */
    for (let i = 0; i < 24; i++) {
      const azDeg = i * 15;
      const rad = azDeg * PI / 180;
      const px = Math.sin(rad) * 14.2;
      const pz = -Math.cos(rad) * 14.2;
      /* NNE 15..30 deg East Dam Breach window & ENE 60..75 deg Gas Giant window get tall brass-capped alidades */
      const isSpecial = (azDeg === 15 || azDeg === 30 || azDeg === 60 || azDeg === 75 || azDeg === 90 || azDeg === 240);
      const ph = isSpecial ? 2.45 : 1.25;
      vB('vStone', px, 1.16, pz, 0.72, ph, 0.72, -rad, cBas);
      vB('hGoldB', px, 1.16 + ph, pz, 0.84, 0.16, 0.84, -rad, cBrs);
      if (isSpecial) {
        swRing(px, 1.16 + ph + 0.42, pz, 0.28, 0, -rad, 0, SWC.brassBright);
      }
    }
    vnReg('360-Degree Basalt Horizon Ring', 0, 0, 16, 5.6, { landmark: true });
  }

  VERN.def({
    key: 'sw_horizon_ring',
    name: '360-Degree Basalt Horizon Ring',
    w: 34,
    d: 34,
    h: 5.6,
    cls: 'landmark',
    tags: { culture: 'jimjam', types: ['civic', 'sacred'], wealth: 'civic', lit: false },
    build: buildHorizonRing
  });

  /* ----------------------------------------------------------------
   * TIER I: Heliograph & Fire-Beacon Signal Tower (sw_beacon_tower)
   * ---------------------------------------------------------------- */
  function buildBeaconTower(G, o) {
    reseed(77630 + (o && o.v != null ? o.v : 0));
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cBrk = vC(SWC.brick);
    const cOch = vC(SWC.brickOchre);
    const cMar = vC(SWC.marble);
    const cBrs = vC(SWC.brassBright);

    /* Battered basalt socle & banded brick watch shaft */
    kput('hBatterRub', [0, -1.2, 0], null, [9.2, 6.2, 9.2], cBasD);
    vB('vStone', 0, 4.8, 0, 6.8, 6.6, 6.8, 0, cBas);
    vB('vStone', 0, 11.4, 0, 6.1, 6.4, 6.1, 0, cBrk);
    for (const by of [7.8, 11.4, 14.8, 17.6]) {
      vB('hAshlarP', 0, by, 0, 6.5, 0.34, 6.5, 0, by > 12 ? cMar : cOch);
    }
    /* Corbelled parapet platform (y = 17.9..19.6 m) */
    vB('vStone', 0, 17.94, 0, 7.6, 0.72, 7.6, 0, cMar);
    for (const s of [-1, 1]) {
      vB('vStone', 0, 18.66, s * 3.5, 7.6, 0.95, 0.55, 0, cBrk);
      vB('vStone', s * 3.5, 18.66, 0, 0.55, 0.95, 6.5, 0, cBrk);
    }
    /* Iron beacon pyre basket & roaring signal flame */
    swCyl('swCylStone', 0, 18.66, -0.8, 1.35, 1.4, SWC.basaltDark);
    for (let i = 0; i < 8; i++) {
      const a = i * TAU2 / 8;
      vB('vIron', Math.cos(a) * 1.38, 19.8, -0.8 + Math.sin(a) * 1.38, 0.14, 1.6, 0.14, a, vC(0x2d2c30));
    }
    kput('swEmber', [0, 20.4, -0.8], null, [2.2, 1.1, 2.2], null);
    kput('swEmberBall', [0, 21.6, -0.8], null, [1.5, 2.4, 1.5], null);
    const pyreLight = new THREE.PointLight(0xff8c2e, 3.6, 85, 1.8);
    pyreLight.position.set(0, 22.2, -0.8);
    G.add(pyreLight);

    /* Polished Skywatch-brass Heliograph Mirror on front (+z) parapet aimed down relay sightline */
    swCyl('swCylBrass', 0, 18.66, 2.35, 0.22, 1.85, SWC.brass);
    vB('hGoldB', 0, 20.5, 2.35, 1.95, 1.95, 0.18, 0, cBrs);
    swRing(0, 20.5, 2.35, 1.08, 0, 0, 0, SWC.brass);

    vnReg('Heliograph and Signal Beacon Tower', 0, 0, 5.2, 24, { landmark: true, lit: true });
  }

  VERN.def({
    key: 'sw_beacon_tower',
    name: 'Signal Beacon Tower',
    w: 10,
    d: 10,
    h: 25,
    cls: 'building',
    tags: { culture: 'jimjam', types: ['military', 'infrastructure'], wealth: 'civic', lit: true },
    build: buildBeaconTower
  });

  /* ----------------------------------------------------------------
   * TIER II: Vaulted Rock-Cut Step-Cistern (sw_step_cistern)
   * Built at o.y = rimY; excavated basin walls extend down to -4.8 m;
   * vaulted snow-shedding arcade shelters south half while exposing still water.
   * ---------------------------------------------------------------- */
  function buildStepCistern(G, o) {
    reseed(77640 + (o && o.v != null ? o.v : 0));
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cLim = vC(SWC.limestone);
    const cSlt = vC(SWC.slate);
    const cLrc = vC(SWC.larchDark);
    const cBrs = vC(SWC.brass);

    /* Rock-cut basalt ashlar lining around 12 x 20 m water pit (rim 22 x 30 m at y = 0..0.55, walls down to -5.1 m) */
    for (const s of [-1, 1]) {
      vB('vStone', 0, -5.1, s * 12.2, 21.6, 5.65, 4.4, 0, cBasD);
      vB('vStone', s * 8.4, -5.1, 0, 4.8, 5.65, 29.2, 0, cBasD);
      vB('hAshlarP', 0, 0.55, s * 12.3, 22.0, 0.38, 4.6, 0, cLim);
      vB('hAshlarP', s * 8.5, 0.55, 0, 5.0, 0.38, 29.6, 0, cLim);
    }
    /* Stone step flights descending from sunny north (-z) rim into the water */
    for (let i = 0; i < 9; i++) {
      const sy = -0.38 * (i + 1);
      vB('vStone', 0, sy - 1.2, -9.8 + i * 0.78, 6.8, 1.2, 0.84, 0, i % 2 === 0 ? cLim : cBas);
    }
    /* Winter snow-shedding colonnaded slate pavilion over the south half (z = +1.5..+13.8) */
    for (let ix = -2; ix <= 2; ix++) {
      const px = ix * 3.8;
      swCyl('swCylStone', px, 0.55, 1.8, 0.36, 3.8, SWC.limestone);
      swCyl('swCylStone', px, 0.55, 11.8, 0.38, 3.8, SWC.basalt);
      vB('vWood', px, 4.35, 6.8, 0.32, 0.36, 11.2, 0, cLrc);
    }
    vB('vWood', 0, 4.55, 6.8, 17.6, 0.32, 11.2, 0, cLrc);
    vnGableRoof(0, 4.85, 6.8, 18.2, 11.4, 2.3, 0, 'hScaleB', cSlt, 0.65, 'vStone', cBas, 0.26);

    /* Brass draw-bucket windlass on north curb */
    vB('vWood', -4.2, 0.93, -10.8, 0.24, 1.65, 0.24, 0, cLrc);
    vB('vWood', -2.4, 0.93, -10.8, 0.24, 1.65, 0.24, 0, cLrc);
    vBeam([-4.3, 2.42, -10.8], [-2.3, 2.42, -10.8], 0.16, cBrs, 'hGoldB');

    vnReg('Vaulted Rock-Cut Step-Cistern', 0, 4.0, 12, 7.4, {});
  }

  VERN.def({
    key: 'sw_step_cistern',
    name: 'Vaulted Rock-Cut Step-Cistern',
    w: 22,
    d: 30,
    h: 8.5,
    cls: 'infrastructure',
    tags: { culture: 'jimjam', types: ['infrastructure'], wealth: 'civic', lit: false },
    build: buildStepCistern
  });

  /* ----------------------------------------------------------------
   * TIER III: Salvage Assay & Optical Glass Yard (sw_salvage_assay)
   * Built with grounded child Meshes in G so KRUINS.watch audits main body + wrecks!
   * ---------------------------------------------------------------- */
  const salvageMatStone = new THREE.MeshStandardMaterial({ color: SWC.basalt, roughness: 0.92 });
  const salvageMatWood = new THREE.MeshStandardMaterial({ color: SWC.larchDark, roughness: 0.86 });
  const salvageMatAlloy = new THREE.MeshStandardMaterial({ color: 0xaab4be, roughness: 0.38, metalness: 0.62 });
  const salvageMatBrass = new THREE.MeshStandardMaterial({ color: SWC.brass, roughness: 0.34, metalness: 0.68 });
  const salvageMatGlass = new THREE.MeshStandardMaterial({ color: 0x7fd4dc, roughness: 0.18, metalness: 0.25 });
  const salvageGroups = [];

  function addSeatedBox(G, baseWorldY, wx0, wz0, ry, lx, ly0, lz, w, h, d, mat, rz) {
    const p = loc(wx0, wz0, lx, lz, ry);
    const gy = Math.min(
      SW_GROUND.h(p[0], p[1]),
      SW_GROUND.h(p[0] - w * 0.4, p[1] - d * 0.4),
      SW_GROUND.h(p[0] + w * 0.4, p[1] + d * 0.4)
    );
    const localGround = gy - baseWorldY;
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, mat);
    m.name = 'sw-salvage-piece';
    m.position.set(lx, localGround + ly0 + h * 0.5, lz);
    if (rz) m.rotation.z = rz;
    G.add(m);
    return localGround;
  }

  function buildSalvageAssay(G, o) {
    const wx0 = VERN.cur ? VERN.cur.x : 0;
    const wz0 = VERN.cur ? VERN.cur.z : 0;
    const ry = VERN.cur ? VERN.cur.ry : 0;
    const baseY = o && o.y != null ? o.y : 0;

    /* 1. Main body: grounded basalt assay pad + stone & larch optical workshop (touching cluster) */
    const g0 = addSeatedBox(G, baseY, wx0, wz0, ry, -3.5, -0.22, -1.5, 11.0, 0.65, 9.0, salvageMatStone, 0);
    const wallM = new THREE.Mesh(new THREE.BoxGeometry(8.4, 3.8, 6.4), salvageMatStone);
    wallM.name = 'sw-salvage-hall';
    wallM.position.set(-3.8, g0 + 0.43 + 1.9, -1.8);
    G.add(wallM);

    const roofM = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.55, 7.2), salvageMatWood);
    roofM.name = 'sw-salvage-roof';
    roofM.position.set(-3.8, g0 + 0.43 + 3.8 + 0.25, -1.8);
    G.add(roofM);

    /* Hoist frame bolted directly onto the main pad */
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.4, 0.32), salvageMatWood);
      post.name = 'sw-salvage-gantry';
      post.position.set(0.8, g0 + 0.43 + 2.1, -1.8 + s * 1.8);
      G.add(post);
    }
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 4.1), salvageMatBrass);
    cross.name = 'sw-salvage-beam';
    cross.position.set(0.8, g0 + 0.43 + 4.25, -1.8);
    G.add(cross);

    /* 2. Ground-seated Ancient salvage wrecks in the open assay yard (each seated -0.14 m into local ground) */
    /* Wreck A: Ancient Titanium Optical Barrel section */
    const gA = addSeatedBox(G, baseY, wx0, wz0, ry, 6.2, -0.14, -2.6, 3.4, 1.45, 2.2, salvageMatAlloy, 0.06);
    const lensA = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.45, 18), salvageMatGlass);
    lensA.name = 'sw-salvage-lens';
    lensA.rotation.z = PI / 2;
    lensA.position.set(7.85, gA + 0.62, -2.6);
    G.add(lensA);

    /* Wreck B: Salvaged Heliostat Ring Arc seated firmly on stone skids */
    const gB = addSeatedBox(G, baseY, wx0, wz0, ry, 5.4, -0.15, 3.4, 3.8, 0.55, 2.8, salvageMatStone, 0);
    const arcB = new THREE.Mesh(new THREE.BoxGeometry(3.1, 1.35, 0.62), salvageMatBrass);
    arcB.name = 'sw-salvage-heliostat';
    arcB.position.set(5.4, gB + 0.35 + 0.65, 3.4);
    G.add(arcB);

    /* Wreck C: Crated Prism Assembly seated on ground */
    addSeatedBox(G, baseY, wx0, wz0, ry, -2.4, -0.14, 5.4, 2.8, 1.25, 2.1, salvageMatAlloy, -0.04);

    G.name = 'Salvage Assay Yard';
    salvageGroups.push(G);
    vnReg('Salvage Assay and Optical Yard', 0, 0, 10, 5.8, { state: 'salvage' });
  }

  VERN.def({
    key: 'sw_salvage_assay',
    name: 'Salvage Assay and Optical Yard',
    w: 22,
    d: 18,
    h: 5.8,
    cls: 'building',
    tags: { culture: 'ancient', types: ['industry', 'trade'], state: 'salvage', lit: false },
    build: buildSalvageAssay
  });

  /* ----------------------------------------------------------------
   * TIER IV: Katabatic Wind-Drafted Brass Furnace (sw_wind_furnace)
   * ---------------------------------------------------------------- */
  function buildWindFurnace(G, o) {
    reseed(77650 + (o && o.v != null ? o.v : 0));
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cBrk = vC(SWC.brick);
    const cOch = vC(SWC.brickOchre);
    const cBrs = vC(SWC.brass);
    const cLrc = vC(SWC.larchDark);
    const cSlt = vC(SWC.slate);

    /* Grounded furnace pad & battered reverberatory stone body */
    vB('vStone', 0, -1.4, 0, 15.2, 2.0, 13.4, 0, cBasD);
    kput('hBatterRub', [-1.2, 0.55, -0.6], null, [9.4, 5.4, 8.6], cBas);
    vB('vStone', -1.2, 5.8, -0.6, 7.6, 1.1, 6.8, 0, cBrk);

    /* Tall banded brick & Skywatch-brass reverberatory draft stack */
    vB('vStone', -2.2, 6.8, -1.2, 3.4, 5.6, 3.4, 0, cBrk);
    vB('hAshlarP', -2.2, 9.6, -1.2, 3.7, 0.32, 3.7, 0, cOch);
    vB('hGoldB', -2.2, 12.4, -1.2, 3.9, 0.46, 3.9, 0, cBrs);
    kput('swEmber', [-2.2, 12.95, -1.2], null, [2.1, 0.35, 2.1], null);

    /* Katabatic stone wind-scoop funnels on +z side catching the pass gale */
    for (const sx of [-3.2, 0.8]) {
      vB('vStone', sx, 0.6, 4.4, 2.8, 2.8, 3.2, 0, cBasD);
      vB('hAshlarP', sx, 3.4, 4.5, 3.1, 0.28, 3.4, 0, cOch);
      kput('swEmber', [sx, 1.45, 2.9], null, [1.2, 1.1, 0.5], null);
    }

    /* Casting shed & molten brass launder on +x side */
    vB('vWood', 4.6, 0.6, 0.4, 4.8, 3.6, 8.8, 0, cLrc);
    vnGableRoof(4.6, 4.2, 0.4, 5.2, 9.2, 1.6, PI / 2, 'hScaleB', cSlt, 0.45, 'vWood', cLrc, 0.22);
    kput('swEmber', [2.8, 1.05, 0.4], null, [2.6, 0.28, 0.65], null);
    swRing(5.0, 0.82, 2.4, 0.92, PI / 2, 0, 0, SWC.brassBright);

    vnReg('Katabatic Wind-Furnace Brass Works', 0, 0, 8, 13.5, { lit: true });
  }

  VERN.def({
    key: 'sw_wind_furnace',
    name: 'Katabatic Wind-Furnace',
    w: 16,
    d: 14,
    h: 13.5,
    cls: 'building',
    tags: { culture: 'rustic', types: ['industry'], job: 'smelting', lit: true },
    build: buildWindFurnace
  });

  /* ----------------------------------------------------------------
   * TIER IV: Skarn Mine Adit & Spent-Gallery Dark-Beds (sw_skarn_adit)
   * ---------------------------------------------------------------- */
  function buildSkarnAdit(G, o) {
    const kind = o && o.aditKind ? o.aditKind : 'copper';
    reseed(77660 + (o && o.v != null ? o.v : 0));
    const cBas = vC(SWC.basalt);
    const cBasD = vC(SWC.basaltDark);
    const cLrc = vC(SWC.larch);
    const cLrcD = vC(SWC.larchDark);
    const veinHex = kind === 'copper' ? SWC.malachite :
                    kind === 'zinc' ? SWC.sphalerite :
                    kind === 'iron' ? SWC.magnetite : 0x6ca8c8;
    const cVein = vC(veinHex);

    /* Rock face brow & ore-sorting stone terrace */
    vB('vStone', 0, -1.6, 0, 11.6, 2.0, 13.4, 0, cBasD);
    kput('hBatterRub', [0, 0.35, -3.2], null, [10.8, 6.4, 7.2], cBas);
    vB('vStone', -2.8, 1.4, -2.6, 3.2, 4.2, 4.6, 0.18, cBasD);
    vB('vStone', 2.9, 1.2, -2.4, 3.4, 4.5, 4.8, -0.14, cBasD);

    /* Heavy larch timber portal collar & dark underground gallery */
    for (const s of [-1, 1]) {
      vB('vWood', s * 1.85, 0.4, 0.2, 0.48, 3.8, 0.52, 0, cLrcD);
      vBeam([s * 1.85, 3.9, 0.2], [s * 2.35, 0.4, 1.8], 0.22, cLrc);
    }
    vB('vWood', 0, 4.15, 0.2, 4.6, 0.52, 0.68, 0, cLrcD);
    vB('vDarkB', 0, 0.4, -0.6, 3.2, 3.75, 1.4, 0, null);

    if (kind === 'fungi') {
      /* Insulated frost-shutter door & glowing dark-beds mushroom trays */
      vB('vWood', -0.85, 0.4, 0.35, 1.5, 3.5, 0.22, 0.35, cLrc);
      for (const tz of [1.8, 3.6]) {
        vB('vWood', 2.4, 0.4, tz, 2.8, 0.75, 1.2, 0, cLrcD);
        vBall('hGold', 2.1, 1.28, tz, 0.28, vC(0xd8e8d0), 0.22);
        vBall('hGold', 2.8, 1.26, tz + 0.2, 0.24, vC(0xc9deea), 0.20);
      }
    } else {
      /* Iron ore-cart rails & mineral-vein ore pile on sorting apron */
      for (const s of [-0.55, 0.55]) {
        vB('vIron', s, 0.42, 3.0, 0.12, 0.10, 6.2, 0, vC(0x45484f));
      }
      vB('vWood', 0, 0.62, 3.8, 1.35, 0.95, 1.85, 0, cLrcD);
      vB('vStone', 0, 1.52, 3.8, 1.15, 0.45, 1.55, 0, cVein);
      /* Exposed mineral vein ribs in the skarn brow */
      vB('vStone', -2.4, 2.2, 0.3, 1.2, 1.6, 0.8, 0.22, cVein);
      vB('vStone', 2.5, 2.6, 0.2, 1.1, 1.4, 0.8, -0.18, cVein);
    }

    vnReg('Skarn Adit (' + kind + ')', 0, 0, 6.2, 7.2, {});
  }

  VERN.def({
    key: 'sw_skarn_adit',
    name: 'Skarn Mine Adit',
    w: 12,
    d: 14,
    h: 7.5,
    cls: 'building',
    tags: { culture: 'rustic', types: ['industry'], job: 'mining', lit: false },
    build: buildSkarnAdit
  });

  /* ----------------------------------------------------------------
   * TIER V: The Silent Moot — Frost-Split Basalt Monoliths, Barter Tables & Truce-Gong
   * Zero Painted-Men totems or crests anywhere!
   * ---------------------------------------------------------------- */
  function buildMootMonolith(G, o) {
    const idx = o && o.idx != null ? o.idx : 0;
    const isEq = !!(o && o.equinoxSight);
    reseed(77670 + idx);
    const h = isEq ? 6.4 : 4.8 + (idx % 3) * 0.55;
    const w = isEq ? 1.85 : 1.55 + (idx % 2) * 0.25;
    const cBas = vC(isEq ? SWC.basaltDark : SWC.basalt);

    vB('vStone', 0, -0.9, 0, w * 1.45, 1.2, w * 1.35, 0, vC(SWC.basaltDark));
    vB('vStone', 0, 0.25, 0, w, h * 0.68, 1.15, 0, cBas);
    vB('vStone', 0.06, 0.25 + h * 0.62, 0, w * 0.78, h * 0.38, 0.96, 0.05, vC(SWC.basaltLight));
    if (isEq) {
      /* Incised brass equinox sighting notch on the eastern & western monoliths */
      vB('hGoldB', 0, 2.1, 0, w + 0.08, 0.18, 1.22, 0, vC(SWC.brassBright));
    }
    vnReg(isEq ? 'Equinox Sighting Monolith' : 'Silent Moot Standing Stone', 0, 0, 1.8, h + 0.5, { landmark: true });
  }

  VERN.def({
    key: 'sw_moot_monolith',
    name: 'Silent Moot Monolith',
    w: 3.4,
    d: 2.8,
    h: 6.4,
    cls: 'landmark',
    tags: { culture: 'rustic', types: ['civic', 'sacred'], lit: false },
    build: buildMootMonolith
  });

  function buildMootTable(G, o) {
    const side = o && o.side ? o.side : 'south';
    reseed(77680 + (side === 'north' ? 2 : 1));
    const cBas = vC(SWC.basaltDark);
    const cSlab = vC(SWC.basaltLight);

    /* Megalithic stone trestle piers + 6 m flat barter slab */
    for (const sx of [-2.1, 0, 2.1]) {
      vB('vStone', sx, -0.6, 0, 0.95, 1.65, 2.2, 0, cBas);
    }
    vB('vStone', 0, 1.05, 0, 6.0, 0.42, 2.8, 0, cSlab);

    if (side === 'south') {
      /* Jimjam / Free-Clan offerings: stacked white halite salt blocks, copper kettles & barley jars */
      for (let i = 0; i < 4; i++) {
        vB('hAshlarP', -1.8 + i * 0.55, 1.47, -0.25, 0.46, 0.38, 0.46, 0.08 * i, vC(SWC.halite));
      }
      vB('hAshlarP', -1.5, 1.85, -0.25, 0.44, 0.34, 0.44, 0, vC(SWC.halite));
      swCyl('swCylBrass', 0.85, 1.47, 0.15, 0.34, 0.48, SWC.brass);
      swCyl('swCylBrass', 1.65, 1.47, -0.2, 0.28, 0.42, SWC.bronze);
    } else {
      /* Sasquatch offerings: thick corded qiviut wool bales, bundled goldroot & mountain pelts */
      vB('vCloth', -1.5, 1.47, 0, 1.35, 0.68, 1.05, 0.06, vC(SWC.qiviut));
      vB('vCloth', 0.1, 1.47, 0.15, 1.25, 0.62, 0.98, -0.08, vC(SWC.qiviut));
      vB('vWood', 1.7, 1.47, -0.1, 1.1, 0.38, 0.85, 0.12, vC(SWC.hide));
      vB('hGoldB', 1.7, 1.85, -0.1, 0.65, 0.22, 0.45, 0, vC(0xc9962c));
    }
    vnReg(side === 'north' ? 'North Sasquatch Barter Slab' : 'South Halite Barter Slab', 0, 0, 3.2, 2.4, {});
  }

  VERN.def({
    key: 'sw_moot_table',
    name: 'Silent Moot Barter Slab',
    w: 6.2,
    d: 3.2,
    h: 2.4,
    cls: 'building',
    tags: { culture: 'rustic', types: ['trade', 'civic'], lit: false },
    build: buildMootTable
  });

  function buildTruceGong(G, o) {
    reseed(77685);
    const cBas = vC(SWC.basaltDark);
    const cBrs = vC(SWC.brassBright);
    for (const sx of [-1.95, 1.95]) {
      vB('vStone', sx, -0.8, 0, 1.15, 6.2, 1.25, 0, cBas);
    }
    vB('vStone', 0, 5.4, 0, 5.4, 0.85, 1.45, 0, vC(SWC.basalt));
    /* Suspended 2.1 m cast Skywatch-brass Truce-Gong */
    swCyl('swCylBrass', -0.8, 4.35, 0, 0.06, 1.05, SWC.bronze);
    swCyl('swCylBrass', 0.8, 4.35, 0, 0.06, 1.05, SWC.bronze);
    vB('hGoldB', 0, 2.35, 0, 2.15, 2.15, 0.22, 0, cBrs);
    swRing(0, 3.42, 0, 1.08, 0, 0, 0, SWC.brass);
    vnReg('Skywatch Cast-Brass Truce-Gong', 0, 0, 2.8, 6.4, { landmark: true });
  }

  VERN.def({
    key: 'sw_truce_gong',
    name: 'Cast-Brass Truce-Gong',
    w: 5.6,
    d: 2.6,
    h: 6.4,
    cls: 'landmark',
    tags: { culture: 'jimjam', types: ['civic', 'trade'], lit: false },
    build: buildTruceGong
  });

  function buildBoundaryCairn(G, o) {
    reseed(77688 + (o && o.v != null ? o.v : 0));
    kput('hBatterRub', [0, -0.7, 0], null, [3.5, 2.6, 3.5], vC(SWC.basaltDark));
    kput('hBatterRub', [0, 1.8, 0], null, [2.3, 1.9, 2.3], vC(SWC.basalt));
    vB('hAshlarP', 0, 3.65, 0, 0.95, 0.85, 0.95, 0, vC(SWC.marble));
    vBall('hGold', 0, 4.72, 0, 0.28, vC(SWC.brassBright));
    vnReg('Truce Boundary Cairn', 0, 0, 2.0, 4.9, {});
  }

  VERN.def({
    key: 'sw_boundary_cairn',
    name: 'Truce Boundary Cairn',
    w: 3.6,
    d: 3.6,
    h: 4.9,
    cls: 'infrastructure',
    tags: { culture: 'jimjam', types: ['civic'], lit: false },
    build: buildBoundaryCairn
  });

  /* ----------------------------------------------------------------
   * KCAMP Builders: Armed Convoy Laagers & Sasquatch 1.35x Equinox Camps
   * ---------------------------------------------------------------- */
  function buildConvoyTent(G, o) {
    const w = o && o.cw != null ? o.cw : 5.2;
    const d = o && o.cd != null ? o.cd : 5.2;
    const h = o && o.ch != null ? o.ch : 3.4;
    const isPav = w > 5.8;
    const cCan = vC(isPav ? SWC.canvas : SWC.canvasTan);
    const cWood = vC(SWC.larchDark);

    vB('vStone', 0, -0.45, 0, w * 0.96, 0.55, d * 0.96, 0, vC(SWC.basaltDark));
    vB('vCloth', 0, 0.1, 0, w * 0.90, h * 0.48, d * 0.90, 0, cCan);
    vnGableRoof(0, 0.1 + h * 0.46, 0, w * 0.94, d * 0.94, h * 0.52, 0, 'vCloth', cCan, 0.25, 'vCloth', cCan, 0.14);
    for (const sz of [-d * 0.46, d * 0.46]) {
      vB('vWood', 0, 0.1, sz, 0.16, h, 0.16, 0, cWood);
    }
    vnReg(isPav ? 'Caravan Factor Pavilion' : 'Convoy Drover Tent', 0, 0, Math.max(w, d) * 0.55, h, {});
  }

  function buildConvoyWagon(G, o) {
    const cWood = vC(SWC.larch);
    const cDark = vC(SWC.larchDark);
    vB('vStone', 0, -0.35, 0, 3.0, 0.4, 5.4, 0, vC(SWC.basaltDark));
    vB('vWood', 0, 0.65, 0, 2.3, 0.95, 4.8, 0, cWood);
    vB('vCloth', 0, 1.55, 0, 2.4, 1.25, 4.6, 0, vC(SWC.canvas));
    for (const sx of [-1.22, 1.22]) {
      for (const sz of [-1.55, 1.55]) {
        vB('vWood', sx, 0.05, sz, 0.22, 1.05, 1.05, 0, cDark);
      }
    }
    vnReg('Salt and Brass Freight Wagon', 0, 0, 2.8, 2.9, {});
  }

  function buildConvoyPicket(G, o) {
    const w = o && o.cw != null ? o.cw : 8.0;
    const cWood = vC(SWC.larchDark);
    for (let x = -w * 0.42; x <= w * 0.42; x += 2.4) {
      vB('vWood', x, -0.3, 0, 0.18, 1.55, 0.18, 0, cWood);
    }
    vB('vWood', 0, 0.95, 0, w * 0.88, 0.14, 0.14, 0, cWood);
    vB('vCloth', -w * 0.22, 0.05, 0.85, 1.4, 0.75, 1.1, 0.2, vC(0xbba264));
    vnReg('Pack-Yak Tether Line', 0, 0, w * 0.5, 1.6, {});
  }

  function buildCampFire(G, o) {
    const r = o && o.cw != null ? o.cw * 0.35 : 1.1;
    swCyl('swCylStone', 0, -0.35, 0, r, 0.62, SWC.basaltDark);
    kput('swEmberBall', [0, 0.38, 0], null, [r * 0.52, 0.42, r * 0.52], null);
    vnReg('Camp Hearth', 0, 0, r + 0.6, 1.4, { lit: true });
  }

  /* Sasquatch 1.35x bent-larch & hide lodges (zero iron nails, 2.7 m clear doorway) */
  function buildSqLodge(G, o) {
    const w = o && o.cw != null ? o.cw : 6.4;
    const h = o && o.ch != null ? o.ch : 4.6;
    const r = w * 0.48;
    const cHide = vC(w > 7.2 ? SWC.hideDark : SWC.hide);
    const cPole = vC(SWC.larch);

    kput('hOctS', [0, -0.55, 0], null, [r * 1.04, 0.75, r * 1.04], vC(SWC.basaltDark));
    kput('hOctW', [0, 0.18, 0], null, [r * 0.96, h * 0.44, r * 0.96], cHide);
    kput('hTentT', [0, 0.18 + h * 0.42, 0], null, [r * 1.02, h * 0.58, r * 1.02], cHide);
    /* Bent larch poles lashed at smoke-hole crown + 2.75 m tall entrance hood */
    for (let i = 0; i < 6; i++) {
      const a = i * TAU2 / 6 + 0.3;
      vBeam([Math.cos(a) * r * 0.98, 0.2, Math.sin(a) * r * 0.98], [Math.cos(a) * 0.35, h + 0.55, Math.sin(a) * 0.35], 0.14, cPole);
    }
    vB('vWood', -0.95, 0.18, r * 0.95, 0.22, 2.85, 0.45, 0, cPole);
    vB('vWood', 0.95, 0.18, r * 0.95, 0.22, 2.85, 0.45, 0, cPole);
    vB('vWood', 0, 2.92, r * 0.95, 2.25, 0.24, 0.52, 0, cPole);
    vB('vDarkB', 0, 0.18, r * 0.88, 1.65, 2.72, 0.32, 0, null);

    vnReg('Sasquatch Hide and Larch Lodge (1.35x)', 0, 0, r + 0.5, h + 0.6, {});
  }

  function buildSqRack(G, o) {
    const w = o && o.cw != null ? o.cw : 5.4;
    const cPole = vC(SWC.larch);
    for (const sx of [-w * 0.38, w * 0.38]) {
      vBeam([sx, -0.2, -0.9], [sx, 3.1, 0], 0.15, cPole);
      vBeam([sx, -0.2, 0.9], [sx, 3.1, 0], 0.15, cPole);
    }
    vBeam([-w * 0.42, 2.95, 0], [w * 0.42, 2.95, 0], 0.14, cPole);
    vB('vCloth', -w * 0.16, 1.35, 0, w * 0.28, 1.5, 0.18, 0, vC(SWC.qiviut));
    vB('vCloth', w * 0.18, 1.45, 0, w * 0.26, 1.4, 0.18, 0, vC(SWC.hide));
    vnReg('Sasquatch Qiviut and Pelt Rack', 0, 0, w * 0.48, 3.2, {});
  }

  VERN.def({ key: 'sw_convoy_pavilion', name: 'Caravan Factor Pavilion', w: 9, d: 7.5, h: 4.8, cls: 'building', tags: { culture: 'jimjam', types: ['dwelling-single'] }, build: buildConvoyTent });
  VERN.def({ key: 'sw_convoy_tent', name: 'Convoy Tent', w: 6.4, d: 5.4, h: 3.6, cls: 'building', tags: { culture: 'rustic', types: ['dwelling-single'] }, build: buildConvoyTent });
  VERN.def({ key: 'sw_convoy_guard', name: 'Convoy Guard Tent', w: 5.6, d: 5.0, h: 3.4, cls: 'building', tags: { culture: 'rustic', types: ['military'] }, build: buildConvoyTent });
  VERN.def({ key: 'sw_convoy_wagon', name: 'Convoy Freight Wagon', w: 7.2, d: 4.2, h: 3.5, cls: 'building', tags: { culture: 'jimjam', types: ['market'] }, build: buildConvoyWagon });
  VERN.def({ key: 'sw_convoy_picket', name: 'Yak Tether Line', w: 12, d: 8, h: 2.6, cls: 'building', tags: { culture: 'rustic', types: ['farm'] }, build: buildConvoyPicket });
  VERN.def({ key: 'sw_convoy_fire', name: 'Convoy Hearth', w: 3, d: 3, h: 1.4, cls: 'building', tags: { culture: 'jimjam', types: ['plaza'], lit: true }, build: buildCampFire });
  VERN.def({ key: 'sw_sq_elder_lodge', name: 'Sasquatch Elder Lodge', w: 10.8, d: 9.8, h: 6.2, cls: 'building', tags: { culture: 'talovolci', types: ['dwelling-single'] }, build: buildSqLodge });
  VERN.def({ key: 'sw_sq_hide_lodge', name: 'Sasquatch Hide Lodge', w: 8.6, d: 8.2, h: 5.2, cls: 'building', tags: { culture: 'talovolci', types: ['dwelling-single'] }, build: buildSqLodge });
  VERN.def({ key: 'sw_sq_drying_rack', name: 'Sasquatch Drying Rack', w: 7.4, d: 4.6, h: 4.2, cls: 'building', tags: { culture: 'talovolci', types: ['industry'] }, build: buildSqRack });
  VERN.def({ key: 'sw_sq_yak_tether', name: 'Sasquatch Pack-Yak Line', w: 11.5, d: 8.5, h: 3.0, cls: 'building', tags: { culture: 'talovolci', types: ['farm'] }, build: buildConvoyPicket });
  VERN.def({ key: 'sw_sq_hearth', name: 'Sasquatch Hearth', w: 4, d: 4, h: 1.6, cls: 'building', tags: { culture: 'talovolci', types: ['plaza'], lit: true }, build: buildCampFire });

  /* Visible RES_ORE outcrop boulder & crystal veins */
  function placeOreNode(nd) {
    const s = nd.size == null ? 5.2 : nd.size;
    const veinHex = nd.kind === 'copper' ? SWC.malachite :
                    nd.kind === 'zinc' ? SWC.sphalerite :
                    nd.kind === 'iron' ? SWC.magnetite :
                    nd.kind === 'turquoise' ? SWC.turquoise : SWC.halite;
    const y0 = SW_GROUND.h(nd.x, nd.z);
    kput('hBatterRub', [nd.x, y0 - 0.8, nd.z], qEuler(0, 0.7, 0), [s * 0.92, s * 0.56, s * 0.84], vC(SWC.basaltDark));
    for (let i = 0; i < 4; i++) {
      const a = i * TAU2 / 4 + 0.4;
      const rx = nd.x + Math.cos(a) * s * 0.26;
      const rz = nd.z + Math.sin(a) * s * 0.26;
      kput('vStone', [rx, y0 + s * 0.22, rz], qEuler(0.22 * (i % 2 ? 1 : -1), a, 0.18), [s * 0.32, s * 0.34, s * 0.26], vC(veinHex));
    }
    REG.push({
      name: nd.kind + ' skarn outcrop (' + nd.grade + ')',
      key: 'res_ore_' + nd.kind,
      cls: 'feature',
      x: nd.x,
      y: y0,
      z: nd.z,
      r: s * 0.55,
      h: s * 0.62,
      tags: { culture: 'rustic', types: ['industry'], job: 'mining', rock: nd.kind, variant: nd.grade }
    });
  }

  return {
    palette: SWC,
    salvageGroups: salvageGroups,
    placeOreNode: placeOreNode
  };
})();
