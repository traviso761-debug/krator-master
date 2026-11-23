// ================================================================= 72d. DILIHAN VASSAL KIT — Civic, Cooling Baths, Garrison & Sacred
// [draw] Five monumental passive-cooling red-and-orange brick civic buildings on the Iziz Vernacular contract (seeds 9953..9985):
//   20. dil_cooling_baths        (24 x 22 m, civic)  Vaulted plunge-bath & sardab cooling house w/ twin malqaf towers & jali domes
//   21. dil_customs_loggia       (24 x 18 m, civic)  Twin-storey brick-arcaded customs & weigh-hall w/ copper ventilation lantern
//   22. dil_guildhall_peristyle  (26 x 24 m, civic)  Colonial factors & potash-merchants guildhall wrapping a shaded water-court
//   23. dil_barracks_arcade      (28 x 22 m, civic)  2-tier wrap-around veranda brick garrison barracks w/ corner watch-turret
//   24. dil_shrine_suncourt      (22 x 22 m, civic)  Open-air Izani Sun-Orb sanctuary w/ jali cloister, ablution pool & gilt dome

/* 20. Vaulted plunge-bath & sardab cooling house with twin malqaf wind-catchers (24 x 22 m, cornice 8.50 m) */
function buildDilCoolingBaths(G, o) { reseed(9953 + (o.v | 0));
  const Y0 = 0.85;
  const H = 7.11;    /* 0.85 + 7.11 + 0.54 = 8.50 m (matches vern_hospital 8.60 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Malqaf brick cooling baths', 0, 0, 12.6, 8.50 + 6.8);

  /* Rear vaulted brick plunge-hall (21.6 x 10.6 m) + front shaded peristyle turquoise plunge court */
  dlnPlinth(0, 0, 0, 21.8, 19.6, Y0, 0);
  dlnBrickWing(0, Y0, -4.4, 21.6, H, 10.6, 0, { item: 'dlBrickBandB', c: brkC, beltY: 3.85, orangeBelt: true });
  dlnCornice(0, Y0 + H, -4.4, 21.6, 10.6, 0);

  /* Three terraced cooling domes (central copper dome + flanking perforated terracotta domes) + twin malqaf wind-catchers */
  vB('dlMortarB', 0, 8.55, -4.4, 21.0, 0.22, 10.0, 0, morC);
  kput('dlBrickDrum', [0, 8.78, -4.4], null, [3.6, 1.32, 3.6], brkC);
  kput('vDomeC', [0, 10.08, -4.4], null, [3.6, 2.35, 3.6], null);
  vBall('dlGiltBall', 0, 12.65, -4.4, 0.34, vC(dlnPick(DL_PAL.gilt)), 0.42);
  for (const s of [-1, 1]) {
    kput('dlMortarDrum', [s * 6.8, 8.78, -4.4], null, [2.4, 0.92, 2.4], morC);
    kput('dlDomeTile', [s * 6.8, 9.68, -4.4], null, [2.4, 1.65, 2.4], dlnTileTint());
    /* Twin tall brick malqaf wind-catchers funneling Cut breezes down over internal wet channels */
    dlnWindCatcher(s * 8.2, 8.88, -7.2, 2.8, 2.8, 4.35, 0, { copper: true, c: brkC });
  }

  /* Front shaded peristyle plunge-pool court (+z half) enclosed by 1-storey brick arcades */
  dlnCourtyard(0, Y0 + 0.01, 5.2, 16.4, 8.4, 0, {
    pool: true, poolW: 9.8, poolD: 4.4, sail: true, sailY: Y0 + 4.45
  });
  dlnArcade(0, Y0, 9.55, 0, 21.0, 4.25, 5, { c: brkC, band: true, depth: 0.56 });
  for (const s of [-1, 1]) {
    dlnArcade(s * 10.55, Y0, 5.2, s * Math.PI * 0.5, 8.4, 4.25, 2, { c: brkC, band: true, depth: 0.52 });
  }
  dlnSunOrb(0, Y0 + 4.85, 9.80, 0, 0.48);

  /* Bathhouse portals, wide jali steam-and-breeze screens & grand stone entry flight */
  vnDoor(0, Y0, 0.90, 0, 1.85, 2.95, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, 0, 10.35, 0, 4.8, Y0, 5, 'vStone', morC);
  for (const s of [-1, 1]) {
    dlnJali(s * 5.2, Y0 + 1.15, 0.90, 0, 3.8, 2.45, { c: brkC });
    dlnOpenWin(s * 5.2, Y0 + 4.45, 0.90, 0, 1.55, 1.55, { kind: 'lit', hoodOut: 0.72 });
    dlnJali(s * 10.80, Y0 + 1.45, -4.4, s * Math.PI * 0.5, 5.4, 2.45, { c: brkC });
    dlnOpenWin(s * 6.2, Y0 + 4.45, -9.70, Math.PI, 1.55, 1.55, { kind: 'lit', hoodOut: 0.68 });
    dlnZeerCluster(s * 6.8, Y0, 5.2, 3, s * Math.PI * 0.5);
  }
}

/* 21. Twin-storey brick-arcaded colonial customs & weigh-hall (24 x 18 m, cornice 8.40 m) */
function buildDilCustomsLoggia(G, o) { reseed(9961 + (o.v | 0));
  const Y0 = 0.90;
  const H1 = 4.10;
  const H2 = 2.86;   /* 0.90 + 4.10 + 2.86 + 0.54 = 8.40 m (exact match to vern_school / vern_farmers_guild 8.40 m!) */
  const brkC = dlnBrickTint(false);
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Arcaded brick customs loggia', 0, 0, 12.2, 8.40 + 6.0);

  dlnPlinth(0, 0, -0.3, 21.6, 14.8, Y0, 0);
  dlnBrickWing(0, Y0, -1.6, 21.2, H1 + H2, 12.0, 0, { item: 'dlBrickBandB', c: bandC, beltY: H1, orangeBelt: true });

  /* Full-width 5-bay ground weigh-loggia + upper arcaded chancery veranda along +z */
  dlnArcade(0, Y0, 6.75, 0, 21.0, H1 - 0.08, 5, { c: bandC, band: true, depth: 0.58 });
  vB('dlMortarB', 0, Y0 + H1 + 0.12, 5.6, 21.4, 0.22, 2.6, 0, morC);
  dlnArcade(0, Y0 + H1 + 0.35, 6.75, 0, 21.0, H2 - 0.41, 5, { c: brkC, rail: true, jaliRail: true, depth: 0.52 });

  /* Unified cornice + verdigris copper hipped monitor roof + central octagonal weigh-lantern */
  dlnCornice(0, Y0 + H1 + H2, -0.3, 21.6, 14.6, 0);
  dlnMonitorRoof(0, 8.40, -0.3, 21.6, 14.6, 3.15, 0, {
    copper: true, over: 0.92, monW: 11.4, monD: 2.6, monH: 0.88, monRise: 0.80
  });
  kput('dlBrickDrum', [0, 8.40 + 3.16, -0.3], null, [1.85, 1.40, 1.85], bandC);
  kput('vConeC', [0, 8.40 + 4.56, -0.3], null, [2.25, 1.35, 2.25], null);
  dlnSunOrb(0, Y0 + H1 + 0.12, 7.08, 0, 0.50);

  /* Twin assay doors + balance beam & bullion crates in loggia + grand street stair + Iziz banners */
  vnDoor(-2.6, Y0, 4.40, 0, 1.55, 2.65, 'vStone', morC, dlnTrimTint(), false);
  vnDoor(2.6, Y0, 4.40, 0, 1.55, 2.65, 'vStone', morC, dlnTrimTint(), false);
  vnDoor(0, Y0, -7.60, Math.PI, 1.45, 2.55, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, 0, 7.85, 0, 5.2, Y0, 5, 'vStone', morC);

  for (const lx of [-6.8, 0, 6.8]) {
    if (lx !== 0) dlnOpenWin(lx, Y0 + 1.15, 4.40, 0, 1.45, 1.65, { kind: 'lit', hood: false });
    dlnOpenWin(lx, Y0 + H1 + 0.65, 4.40, 0, 1.45, 1.45, { kind: 'lit', hood: false });
    dlnOpenWin(lx, Y0 + 1.15, -7.60, Math.PI, 1.45, 1.55, { kind: 'lit', hoodOut: 0.72 });
    dlnOpenWin(lx, Y0 + H1 + 0.65, -7.60, Math.PI, 1.45, 1.45, { kind: 'lit', hoodOut: 0.68 });
  }
  for (const s of [-1, 1]) {
    for (const lz of [-4.6, 1.2]) {
      dlnOpenWin(s * 10.60, Y0 + 1.15, lz, s * Math.PI * 0.5, 1.40, 1.55, { kind: 'lit', hoodOut: 0.70 });
      dlnOpenWin(s * 10.60, Y0 + H1 + 0.65, lz, s * Math.PI * 0.5, 1.35, 1.40, { kind: 'lit', hoodOut: 0.65 });
    }
    vnBannerPole(s * 4.4, Y0, 7.15, 0, 6.4, dlnOrangeTint());
    vnCrate(s * 7.8, Y0, 5.6, 0.92, 0.15, lvC);
  }
}

/* 22. Colonial factors & potash-merchants peristyle guildhall (26 x 24 m, cornice 8.80 m) */
function buildDilGuildhallPeristyle(G, o) { reseed(9969 + (o.v | 0));
  const Y0 = 0.95;
  const H1 = 4.25;
  const H2 = 3.06;   /* 0.95 + 4.25 + 3.06 + 0.54 = 8.80 m (matches vern_alchemist 8.80 m / vern_forgemasters_hall 9.20 m!) */
  const brkC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Peristyle brick guildhall', 0, 0, 14.2, 8.80 + 6.4);

  dlnPlinth(0, 0, 0, 23.8, 21.6, Y0, 0);
  /* Hollow-square 2-storey brick guildhall wings framing an 11.8 x 9.8 m shaded council water-court */
  dlnBrickWing(0, Y0, -7.9, 23.6, H1 + H2, 5.8, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, -7.9, 23.6, 5.8, 0);
  dlnMonitorRoof(0, 8.80, -7.9, 23.6, 5.8, 3.05, 0, {
    copper: true, over: 0.92, monW: 12.6, monD: 2.2, monH: 0.90, monRise: 0.80
  });

  dlnBrickWing(0, Y0, 7.9, 23.6, H1 + H2, 5.8, 0, { item: 'dlBrickBandB', c: brkC, beltY: H1, orangeBelt: true });
  dlnCornice(0, Y0 + H1 + H2, 7.9, 23.6, 5.8, 0);
  dlnMonitorRoof(0, 8.80, 7.9, 23.6, 5.8, 2.85, 0, {
    copper: true, over: 0.92, monW: 11.8, monD: 2.0, monH: 0.85, monRise: 0.75
  });

  for (const s of [-1, 1]) {
    dlnBrickWing(s * 9.0, Y0, 0, 5.6, H1 + H2, 10.0, 0, { c: brkC, beltY: H1, orangeBelt: true });
    dlnCornice(s * 9.0, Y0 + H1 + H2, 0, 5.6, 10.0, 0);
    dlnMonitorRoof(s * 9.0, 8.80, 0, 5.6, 10.0, 2.25, Math.PI * 0.5, { copper: true, over: 0.80, monitor: false });
  }

  /* Central water-court with impluvium, Iziz-orange courtyard shade-sails & open upper council loggia */
  dlnCourtyard(0, Y0 + 0.01, 0, 12.0, 9.8, 0, {
    pool: true, poolW: 6.4, poolD: 4.6, sail: false
  });
  dlnShadeSail(-2.6, 8.50, 0, 5.6, 7.6, 0.04, { orange: true, tiltX: 0.10 });
  dlnShadeSail(2.6, 8.65, 0, 5.6, 7.6, -0.04, { orange: false, tiltX: -0.08 });
  dlnArcade(0, Y0, -4.85, 0, 11.8, H1 - 0.12, 4, { c: brkC, band: true });
  dlnArcade(0, Y0 + H1 + 0.18, -4.85, 0, 11.8, H2 - 0.28, 4, { c: brkC, rail: true, jaliRail: true });

  /* Street facade: 3-arch guild portico + Sun-Orb crest + lit louver windows + jali stairwells */
  dlnArcade(0, Y0, 11.05, 0, 8.8, H1 - 0.06, 3, { c: brkC, band: true, depth: 0.55 });
  dlnSunOrb(0, Y0 + H1 + H2 - 0.58, 10.82, 0, 0.54);
  vnDoor(0, Y0, 10.80, 0, 1.75, 2.85, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, 0, 11.45, 0, 4.4, Y0, 5, 'vStone', morC);

  for (const lx of [-8.4, -5.2, 5.2, 8.4]) {
    dlnOpenWin(lx, Y0 + 1.15, 10.80, 0, 1.45, 1.65, { kind: 'lit', hoodOut: 0.78 });
    dlnOpenWin(lx, Y0 + H1 + 0.72, 10.80, 0, 1.45, 1.50, { kind: 'lit', hoodOut: 0.72 });
  }
  dlnJali(-2.3, Y0 + H1 + 0.65, 10.80, 0, 1.9, 1.65, { c: brkC });
  dlnJali(2.3, Y0 + H1 + 0.65, 10.80, 0, 1.9, 1.65, { c: brkC });
  for (const s of [-1, 1]) {
    for (const lz of [-6.0, 0, 6.0]) {
      dlnOpenWin(s * 11.80, Y0 + 1.15, lz, s * Math.PI * 0.5, 1.40, 1.60, { kind: 'lit', hoodOut: 0.72 });
      dlnOpenWin(s * 11.80, Y0 + H1 + 0.72, lz, s * Math.PI * 0.5, 1.35, 1.45, { kind: 'lit', hoodOut: 0.68 });
    }
    vnBannerPole(s * 4.6, Y0, 11.2, 0, 6.8, dlnOrangeTint());
    vnPlanter(s * 7.0, 0, 11.3, 2.2, 0.85, 0, lvC);
  }
}

/* 23. Imperial garrison barracks with 2-tier wrap-around shade verandas & corner watch-turret (28 x 22 m, cornice 8.30 m) */
function buildDilBarracksArcade(G, o) { reseed(9977 + (o.v | 0));
  const Y0 = 0.80;
  const H1 = 3.95;
  const H2 = 3.01;   /* 0.80 + 3.95 + 3.01 + 0.54 = 8.30 m (within 0.10 m of vern_barracks 8.20 m!) */
  const brkC = dlnBrickTint(false);
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  vnReg('Arcaded brick garrison barracks', 0, 0, 14.6, 15.6);

  /* L-plan 2-storey troop dormitory block (-z and -x) + NE corner brick watch-turret + shaded muster court */
  dlnPlinth(0, 0, -4.6, 25.4, 9.6, Y0, 0);
  dlnBrickWing(0, Y0, -5.6, 25.0, H1 + H2, 7.2, 0, { item: 'dlBrickBandB', c: bandC, beltY: H1, orangeBelt: true });

  /* 2-tier wrap-around red-brick shade verandas facing the muster court */
  dlnArcade(0, Y0, -0.15, 0, 24.6, H1 - 0.08, 6, { c: bandC, band: true, depth: 0.54 });
  vB('dlMortarB', 0, Y0 + H1 + 0.12, -1.0, 25.0, 0.22, 2.1, 0, morC);
  dlnArcade(0, Y0 + H1 + 0.35, -0.15, 0, 24.6, H2 - 0.41, 6, { c: brkC, rail: true, depth: 0.50 });

  dlnCornice(0, Y0 + H1 + H2, -4.6, 25.2, 9.4, 0);
  dlnMonitorRoof(0, 8.30, -4.6, 25.2, 9.4, 2.95, 0, {
    copper: true, over: 0.88, monW: 15.2, monD: 2.2, monH: 0.86, monRise: 0.76
  });

  /* Corner brick watch-turret (+x/-z) with louvered belfry stage & copper pyramid cap (total 15.4 m) */
  dlnBrickWing(9.8, Y0, 3.6, 5.2, 11.4, 5.2, 0, { item: 'dlBrickBandB', c: bandC, beltY: 7.4, orangeBelt: true });
  for (const ryT of [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5]) {
    const pt = loc(9.8, 3.6, 0, 2.60, ryT);
    dlnJali(pt[0], Y0 + 8.6, pt[1], ryT, 2.4, 1.85, { c: bandC });
  }
  dlnCornice(9.8, Y0 + 11.4, 3.6, 5.2, 5.2, 0);
  kput('vPyrCu', [9.8, Y0 + 11.96, 3.6], null, [6.4, 2.45, 6.4], null);
  vnBannerPole(9.8, Y0 + 14.1, 3.6, 0, 2.2, dlnOrangeTint());

  /* Front muster-court perimeter wall + arched legionary gate + shaded armoury rack pergola */
  vB('dlBrickOchreB', -1.8, 0, 4.8, 21.0, 0.12, 9.4, 0, vC(dlnPick(DL_PAL.brickOchre)));
  vB('dlBrickB', -6.8, 0.12, 9.5, 11.2, 2.13, 0.42, 0, brkC);
  dlnJali(-6.8, 0.65, 9.72, 0, 8.8, 1.25, { openBack: true, c: brkC });
  vB('dlMortarB', -6.8, 2.26, 9.5, 11.4, 0.16, 0.54, 0, morC);

  vB('dlBrickBandB', 1.4, 0.12, 9.5, 4.4, 3.73, 0.68, 0, bandC);
  dlnSunOrb(1.4, 3.25, 9.86, 0, 0.42);
  vB('vWood', 1.4, 3.86, 9.5, 4.8, 0.18, 0.84, 0, dlnOrangeTint());
  vnDoor(1.4, 0.12, 9.85, 0, 1.85, 2.65, 'vStone', morC, dlnTrimTint());

  /* Barracks hall doors, louvered troop dormitory windows & shaded court water trough */
  vnDoor(-4.2, Y0, -2.0, 0, 1.50, 2.55, 'vStone', morC, dlnTrimTint(), false);
  vnDoor(4.2, Y0, -2.0, 0, 1.50, 2.55, 'vStone', morC, dlnTrimTint(), false);
  vnDoor(9.8, Y0, 1.0, Math.PI, 1.25, 2.35, 'vStone', morC, dlnTrimTint(), false);
  vnStairs(0, Y0 - 0.68, 0.85, 0, 3.8, 0.68, 4, 'vStone', morC);

  for (const lx of [-9.2, -4.2, 0, 4.2, 9.2]) {
    if (Math.abs(lx) !== 4.2) dlnOpenWin(lx, Y0 + 1.10, -2.0, 0, 1.45, 1.50, { kind: 'lit', hood: false });
    dlnOpenWin(lx, Y0 + H1 + 0.65, -2.0, 0, 1.45, 1.45, { kind: 'lit', hood: false });
    dlnOpenWin(lx, Y0 + 1.10, -9.20, Math.PI, 1.45, 1.50, { kind: 'lit', hoodOut: 0.68 });
    dlnOpenWin(lx, Y0 + H1 + 0.65, -9.20, Math.PI, 1.45, 1.45, { kind: 'lit', hoodOut: 0.65 });
  }
  dlnPergola(-6.8, 0.13, 4.8, 8.8, 5.2, 2.95, 0, { brickPiers: true });
  dlnImpluvium(-6.8, 0.13, 4.8, 3.6, 2.0, 0, { fountain: true });
  vnLampPost(5.2, 0.13, 5.6, 4.2);
}

/* 24. Open-air Izani Sun-Orb sanctuary with jali ambulatory cloister & gilt dome-lantern (22 x 22 m, cornice 8.40 m) */
function buildDilShrineSuncourt(G, o) { reseed(9985 + (o.v | 0));
  const Y0 = 1.05;
  const HC = 4.15;
  const HS = 6.81;   /* cella cornice: 1.05 + 6.81 + 0.54 = 8.40 m */
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const giltC = vC(dlnPick(DL_PAL.gilt));
  const orgC = dlnOrangeTint();
  vnReg('Sun-Orb jali courtyard shrine', 0, 0, 12.0, 17.2);

  dlnPlinth(0, 0, 0, 19.6, 19.6, Y0, 0);
  vB('dlBrickOchreB', 0, Y0 + 0.01, 0, 18.8, 0.05, 18.8, 0, vC(dlnPick(DL_PAL.brickOchre)));

  /* Perimeter 1-storey perforated red-brick jali ambulatory cloister enclosing the open suncourt */
  for (const sz of [-1, 1]) {
    dlnArcade(0, Y0, sz * 9.35, sz > 0 ? 0 : Math.PI, 18.8, HC, 5, { c: bandC, band: true, depth: 0.54 });
    vB('dlMortarB', 0, Y0 + HC + 0.19, sz * 8.4, 19.2, 0.22, 2.2, 0, morC);
    vB('vWood', 0, Y0 + HC + 0.42, sz * 8.4, 19.4, 0.14, 2.3, 0, orgC);
  }
  for (const sx of [-1, 1]) {
    dlnArcade(sx * 9.35, Y0, 0, sx * Math.PI * 0.5, 16.4, HC, 4, { c: bandC, band: true, depth: 0.54 });
    vB('dlMortarB', sx * 8.4, Y0 + HC + 0.19, 0, 2.2, 0.22, 14.3, 0, morC);
    vB('vWood', sx * 8.4, Y0 + HC + 0.42, 0, 2.3, 0.14, 14.3, 0, orgC);
    /* Perforated brick jali screens along outer cloister flanks filtering low tropical glare */
    dlnJali(sx * 9.55, Y0 + 0.65, -4.1, sx * Math.PI * 0.5, 3.2, 2.45, { openBack: true, c: bandC });
    dlnJali(sx * 9.55, Y0 + 0.65, 4.1, sx * Math.PI * 0.5, 3.2, 2.45, { openBack: true, c: bandC });
  }

  /* Sunken turquoise evaporative ablution pool in the forecourt (+z half) */
  dlnImpluvium(0, Y0 + 0.07, 4.4, 5.6, 4.2, 0, { fountain: true });

  /* Rear octagonal/square patterned brick Sun-Orb sanctuary cella (-2.6 m z) + verdigris & gilt dome-lantern */
  dlnBrickWing(0, Y0, -2.8, 9.6, HS, 8.8, 0, { item: 'dlBrickBandB', c: bandC, beltY: 3.9, orangeBelt: true });
  dlnCornice(0, Y0 + HS, -2.8, 9.6, 8.8, 0);
  dlnMonitorRoof(0, 8.40, -2.8, 9.6, 8.8, 2.15, 0, { copper: true, over: 0.72, monitor: false });

  /* Raised brick & mortar drum + verdigris copper dome + ventilated gilt lantern + blazing Izani Sun-Orb finial */
  kput('dlBrickDrum', [0, 8.40 + 1.50, -2.8], null, [3.2, 2.10, 3.2], bandC);
  kput('dlMortarDrum', [0, 8.40 + 3.61, -2.8], null, [3.35, 0.22, 3.35], morC);
  kput('vDomeC', [0, 8.40 + 3.84, -2.8], null, [3.25, 2.45, 3.25], null);
  kput('dlMortarDrum', [0, 8.40 + 6.18, -2.8], null, [1.05, 1.22, 1.05], morC);
  kput('vConeC', [0, 8.40 + 7.41, -2.8], null, [1.30, 0.95, 1.30], null);
  vBall('dlGiltBall', 0, 8.40 + 8.65, -2.8, 0.42, giltC, 0.42);

  /* Sanctuary bronze-trimmed portal + Sun-Orb emblems + lit jali windows + stepped ritual stair */
  dlnSunOrb(0, Y0 + 5.35, 1.62, 0, 0.62);
  dlnSunOrb(0, Y0 + HC - 0.35, 9.65, 0, 0.48);
  vnDoor(0, Y0, 1.60, 0, 1.75, 2.95, 'vStone', morC, dlnOrangeTint(), false);
  vnStairs(0, 0, 10.15, 0, 5.0, Y0, 6, 'vStone', morC);

  for (const s of [-1, 1]) {
    dlnOpenWin(s * 3.0, Y0 + 1.35, 1.60, 0, 1.25, 2.05, { kind: 'lit', hood: false });
    dlnJali(s * 4.80, Y0 + 1.35, -2.8, s * Math.PI * 0.5, 4.2, 2.35, { c: bandC });
    vnBannerPole(s * 3.8, Y0, 9.75, 0, 6.2, dlnOrangeTint());
  }
  dlnJali(0, Y0 + 1.35, -7.20, Math.PI, 4.6, 2.35, { c: bandC });
}

/* ================================================================
 * 25-28. MODULAR DILIHAN VASSAL CITY FORTIFICATIONS (seeds 9989..9995)
 * Exact 12.0 m modular join grid matching jj_wall_* (+z outer face, x along wall line):
 *   25. dil_wall_seg    (12 x 5.2 m, walkway 9.0 m)  Kiln-brick & basalt curtain w/ inset step-tenon & merlons
 *   26. dil_wall_tower  (10 x 10 m, h 19.5 m)        Banded-brick watchtower w/ jali sentry gallery & malqaf cap
 *   27. dil_wall_corner (12.4 x 12.4 m, h 22.0 m)    Round battered bastion drum accepting walls at any angle
 *   28. dil_wall_gate   (24 x 13.6 m, h 23.5 m)      2-slot twin-towered arched vassal gate w/ Sun-Orb & portcullis
 * ================================================================ */

/* Helper: crenelated red-brick merlon row with cream-mortar weather caps along local X */
function dlnWallMerlons(x, y, z, len, d, h, brkC, morC) {
  const n = Math.max(1, Math.round(len / 2.0));
  const pitch = len / n;
  const mw = pitch * 0.56;
  for (let i = 0; i < n; i++) {
    const mx = x - len * 0.5 + (i + 0.5) * pitch;
    vB('dlBrickB', mx, y, z, mw, h, d, 0, brkC);
    vB('dlMortarB', mx, y + h + 0.01, z, mw + 0.12, 0.13, d + 0.12, 0, morC);
  }
}

/* 25. Modular 12 m Dilihan kiln-brick curtain wall segment (walkway y = 9.0 m, outer face +z) */
function buildDilWallSeg(G, o) { reseed(9989 + (o.v | 0));
  const L = 12.0;
  const T = 4.4;
  const H = 9.0;
  const latC = vC(dlnPick(DL_PAL.laterite));
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  const brkC = dlnBrickTint(false);
  const ochC = vC(dlnPick(DL_PAL.brickOchre));
  const morC = dlnMortarTint();
  const orgC = dlnOrangeTint();
  const voidC = vC(DL_PAL.shadeVoid);
  vnReg('Dilihan brick curtain wall', 0, 0, 6.2, H + 2.4);

  /* Deep monsoon basalt foundation (y = -3.8..0) + battered oxblood brick talus (y = 0..2.2) */
  vB('dlLateriteB', 0, -3.8, 0, L, 3.8, T + 1.1, 0, latC);
  vB('dlBrickDeepB', 0, 0.01, 0, L, 2.19, T + 0.64, 0, deepC);
  vB('dlMortarB', 0, 2.21, 0, L, 0.18, T + 0.72, 0, morC);

  /* Inset masonry step-tenon (narrower in Z and lower in Y: seals slope steps between 12 m segments with zero z-fighting!) */
  vB('dlBrickDeepB', 0, -2.6, 0, L + 0.92, H + 0.9, T - 0.68, 0, deepC);

  /* Main kiln-fired red/terracotta brick curtain body + ochre & cream-mortar stringcourses */
  vB('dlBrickB', 0, 2.40, 0, L, H - 2.66, T, 0, brkC);
  vB('dlBrickOchreB', 0, 5.45, 0, L, 0.24, T + 0.12, 0, ochC);
  /* Walkway paving slab */
  vB('dlMortarB', 0, H - 0.25, 0, L, 0.24, T - 0.08, 0, morC);

  /* Outer (+z) corbeled cream-mortar cordon + Iziz-orange vassal fascia + crenelated parapet */
  const fz = T * 0.5;
  const bz = -T * 0.5;
  vB('dlMortarB', 0, H - 0.52, fz + 0.22, L, 0.26, 0.52, 0, morC);
  vB('vWood', 0, H - 0.25, fz + 0.26, L, 0.16, 0.56, 0, orgC);
  for (let k = 0; k < 6; k++) {
    const cx = -L * 0.5 + (k + 0.5) * 2.0;
    vB('dlBrickOchreB', cx, H - 1.15, fz + 0.16, 0.44, 0.62, 0.36, 0, ochC);
  }
  vB('dlBrickBandB', 0, H, fz - 0.38, L, 1.05, 0.82, 0, brkC);
  vB('dlMortarB', 0, H + 1.06, fz - 0.38, L, 0.12, 0.92, 0, morC);
  dlnWallMerlons(0, H + 1.19, fz - 0.38, L, 0.80, 1.08, brkC, morC);

  /* Inner (-z) rear walkway kerb & buttress pilasters on 6 m rhythm + outer loophole slits */
  vB('dlBrickB', 0, H, bz + 0.22, L, 0.68, 0.42, 0, brkC);
  vB('dlMortarB', 0, H + 0.69, bz + 0.22, L, 0.11, 0.50, 0, morC);
  for (const px of [-3.0, 3.0]) {
    vB('dlBrickDeepB', px, 2.40, bz - 0.28, 1.15, H - 2.75, 0.54, 0, deepC);
    vB('dlMortarB', px, H - 0.34, bz - 0.30, 1.28, 0.22, 0.62, 0, morC);
    vB('vPlaster', px, 6.20, fz + 0.04, 0.20, 1.45, 0.08, 0, voidC);
    vB('dlMortarB', px, 6.04, fz + 0.06, 0.54, 0.14, 0.14, 0, morC);
    vB('dlMortarB', px, 7.68, fz + 0.06, 0.54, 0.14, 0.14, 0, morC);
  }
}

/* 26. Modular Dilihan banded-brick watchtower (sits on joint, swallows adjacent curtain ends, h = 19.5 m) */
function buildDilWallTower(G, o) { reseed(9991 + (o.v | 0));
  const W0 = 8.6;
  const W1 = 7.4;
  const H0 = 9.0;
  const H1 = 5.2;
  const latC = vC(dlnPick(DL_PAL.laterite));
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  const orgC = dlnOrangeTint();
  vnReg('Dilihan brick wall watchtower', 0, 0, 5.4, 19.5);

  /* Deep basalt & oxblood plinth + lower tower stage swallowing curtain wall ends */
  vB('dlLateriteB', 0, -4.4, 0, W0 + 0.9, 4.4, W0 + 0.9, 0, latC);
  vB('dlBrickDeepB', 0, 0.01, 0, W0 + 0.4, 2.4, W0 + 0.4, 0, deepC);
  vB('dlMortarB', 0, 2.42, 0, W0 + 0.48, 0.22, W0 + 0.48, 0, morC);
  dlnBrickWing(0, 2.65, 0, W0, H0 - 2.65, W0, 0, { item: 'dlBrickBandB', c: bandC, beltY: 3.4, orangeBelt: true });
  dlnRingBox('dlMortarB', 0, H0 + 0.01, 0, W0 + 0.44, 0.26, W0 + 0.44, 0.62, 0, morC);

  /* Walkway-level sentry doors on -x and +x connecting onto adjacent curtain ramparts */
  for (const sx of [-1, 1]) {
    vnDoor(sx * (W1 * 0.5), H0 + 0.28, 0, sx * Math.PI * 0.5, 1.25, 2.25, 'vStone', morC, lvC, false);
  }
  /* Ground-level inner garrison postern door (-z) */
  vnDoor(0, 0.15, -(W0 * 0.5 + 0.20), Math.PI, 1.30, 2.30, 'vStone', morC, lvC);

  /* Upper sentry chamber with 4-way perforated red-brick jali screens & louvered observation windows */
  dlnBrickWing(0, H0 + 0.28, 0, W1, H1, W1, 0, { item: 'dlBrickBandB', c: bandC, beltY: 2.6 });
  for (const ryF of [0, Math.PI * 0.5, Math.PI, -Math.PI * 0.5]) {
    const pf = loc(0, 0, 0, W1 * 0.5, ryF);
    dlnJali(pf[0], H0 + 3.25, pf[1], ryF, 3.4, 1.55, { c: bandC });
  }
  dlnOpenWin(0, H0 + 1.15, W1 * 0.5, 0, 1.25, 1.45, { kind: 'lit', hoodOut: 0.65 });
  dlnSunOrb(0, H0 - 1.15, W0 * 0.5 + 0.04, 0, 0.44);

  /* Hybrid Dilihan cornice + deep monsoon terracotta hip roof + rooftop malqaf lantern & Iziz banner */
  const yTop = H0 + 0.28 + H1;
  dlnCornice(0, yTop, 0, W1, W1, 0);
  dlnMonitorRoof(0, yTop + 0.54, 0, W1, W1, 2.35, 0, { over: 0.78, monW: 3.0, monD: 3.0, monH: 0.85, monRise: 0.95 });
  vnBannerPole(0, H0 + 0.28, W0 * 0.5 - 0.25, 0, 5.8, orgC);
}

/* 27. Modular Dilihan circular corner bastion (accepts arriving/departing walls at any angle, h = 22.0 m) */
function buildDilWallCorner(G, o) { reseed(9993 + (o.v | 0));
  const R0 = 5.8;
  const R1 = 5.1;
  const H0 = 9.8;
  const latC = vC(dlnPick(DL_PAL.laterite));
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const orgC = dlnOrangeTint();
  const giltC = vC(dlnPick(DL_PAL.gilt));
  const lvC = dlnLouverTint();
  vnReg('Dilihan brick corner bastion', 0, 0, 6.4, 22.0);

  /* Deep cylindrical basalt & oxblood plinth + massive round brick drum (swallows curtain joins at any angle) */
  kput('dlMortarDrum', [0, -4.8, 0], null, [R0 + 0.55, 4.8, R0 + 0.55], latC);
  kput('dlBrickDrum', [0, 0.01, 0], null, [R0 + 0.28, 2.5, R0 + 0.28], deepC);
  kput('dlMortarDrum', [0, 2.52, 0], null, [R0 + 0.34, 0.24, R0 + 0.34], morC);
  kput('dlBrickDrum', [0, 2.77, 0], null, [R0, H0 - 2.77, R0], bandC);
  kput('dlMortarDrum', [0, 6.20, 0], null, [R0 + 0.14, 0.24, R0 + 0.14], morC);
  kput('dlMortarDrum', [0, H0 + 0.01, 0], null, [R0 + 0.38, 0.32, R0 + 0.38], morC);

  /* Circular crenelated brick parapet ring around the bastion gun/lookout platform */
  const nMer = 16;
  for (let i = 0; i < nMer; i++) {
    const a = (i * Math.PI * 2) / nMer;
    const mx = Math.sin(a) * (R0 - 0.22);
    const mz = Math.cos(a) * (R0 - 0.22);
    vB('dlBrickB', mx, H0 + 0.34, mz, 1.18, 1.15, 0.68, a, bandC);
    vB('dlMortarB', mx, H0 + 1.50, mz, 1.28, 0.13, 0.78, a, morC);
  }

  /* Inner postern & walkway sentry doors */
  vnDoor(0, 0.15, -(R0 + 0.16), Math.PI, 1.35, 2.35, 'vStone', morC, lvC);
  vnDoor(-R1, H0 + 0.34, 0, -Math.PI * 0.5, 1.20, 2.20, 'vStone', morC, lvC, false);
  vnDoor(0, H0 + 0.34, -R1, Math.PI, 1.20, 2.20, 'vStone', morC, lvC, false);

  /* Upper octagonal/cylindrical watch-pavilion + verdigris copper dome + gilt Sun-Orb finial */
  kput('dlBrickDrum', [0, H0 + 0.34, 0], null, [R1 - 0.85, 4.65, R1 - 0.85], bandC);
  for (let i = 0; i < 8; i++) {
    const a = (i + 0.5) * Math.PI * 0.25;
    const wx = Math.sin(a) * (R1 - 0.82);
    const wz = Math.cos(a) * (R1 - 0.82);
    vnWin(wx, H0 + 2.15, wz, a, 1.05, 1.55, 'lit', 'vWood', orgC, false);
  }
  kput('dlMortarDrum', [0, H0 + 5.00, 0], null, [R1 - 0.55, 0.30, R1 - 0.55], morC);
  kput('vDomeC', [0, H0 + 5.31, 0], null, [R1 - 0.70, 3.15, R1 - 0.70], null);
  kput('dlMortarDrum', [0, H0 + 8.38, 0], null, [1.15, 1.35, 1.15], morC);
  kput('vConeC', [0, H0 + 9.74, 0], null, [1.45, 1.05, 1.45], null);
  vBall('dlGiltBall', 0, H0 + 11.10, 0, 0.42, giltC, 0.42);
  vnBannerPole(0, H0 + 0.34, R0 - 0.65, 0, 6.4, orgC);
}

/* 28. Modular 24 m Twin-Towered Dilihan Vassal City Gatehouse (2 segment slots, 6.8 m highway arch) */
function buildDilWallGate(G, o) { reseed(9995 + (o.v | 0));
  const L = 24.0;
  const T = 8.4;
  const OW = 6.8;
  const H_ARCH = 6.6;
  const H_GATE = 12.8;
  const latC = vC(dlnPick(DL_PAL.laterite));
  const deepC = vC(dlnPick(DL_PAL.brickDeep));
  const bandC = dlnBrickTint(true);
  const brkC = dlnBrickTint(false);
  const morC = dlnMortarTint();
  const lvC = dlnLouverTint();
  const orgC = dlnOrangeTint();
  const giltC = vC(dlnPick(DL_PAL.gilt));
  vnReg('Dilihan twin-towered brick city gate', 0, 0, 12.8, 23.5);

  /* Flanking gate piers & twin projecting 7.6 x 10.6 m bastion towers leaving a 6.8 m clear central roadway! */
  for (const sx of [-1, 1]) {
    const px = sx * 8.6;
    vB('dlLateriteB', px, -4.4, 0.6, 6.8, 4.4, T + 2.6, 0, latC);
    vB('dlBrickDeepB', px, 0.01, 0.6, 6.5, 2.5, T + 2.2, 0, deepC);
    vB('dlMortarB', px, 2.52, 0.6, 6.62, 0.22, T + 2.3, 0, morC);
    dlnBrickWing(px, 2.75, 0.6, 6.4, H_GATE + 2.6 - 2.75, T + 1.8, 0, {
      item: 'dlBrickBandB', c: bandC, beltY: 5.2, orangeBelt: true
    });
    /* Inset end-socket tenons at x = +-12.0 m so adjacent 12 m wall curtains lock cleanly into the gatehouse */
    vB('dlBrickDeepB', sx * 12.1, -2.6, 0, 0.9, 11.2, 3.8, 0, deepC);
    vnDoor(sx * 11.8, 9.02, 0, sx * Math.PI * 0.5, 1.20, 2.20, 'vStone', morC, lvC, false);
    vnDoor(px, 0.15, -(T * 0.5 + 0.30), Math.PI, 1.25, 2.30, 'vStone', morC, lvC);

    /* Upper louvered sentry windows & jali panels on each flanking gate-tower */
    dlnOpenWin(px, 9.4, 0.6 + (T + 1.8) * 0.5, 0, 1.45, 1.65, { kind: 'lit', hoodOut: 0.70 });
    dlnJali(px, 12.2, 0.6 + (T + 1.8) * 0.5, 0, 3.4, 1.55, { c: bandC });
    dlnCornice(px, H_GATE + 2.6, 0.6, 6.4, T + 1.8, 0);
    dlnMonitorRoof(px, H_GATE + 3.14, 0.6, 6.4, T + 1.8, 2.45, 0, { copper: true, over: 0.72, monitor: false });

    /* Rooftop octagonal chhatri lantern on each gate-tower */
    kput('dlBrickDrum', [px, H_GATE + 5.55, 0.6], null, [1.55, 1.45, 1.55], bandC);
    kput('vDomeC', [px, H_GATE + 7.02, 0.6], null, [1.60, 1.35, 1.60], null);
    vBall('dlGiltBall', px, H_GATE + 8.55, 0.6, 0.28, giltC, 0.28);
    vnBannerPole(px, H_GATE + 2.6, 0.6 + T * 0.5 + 0.95, 0, 5.8, orgC);

    /* Open timber-and-bronze gate leaves swung back against the inner jambs */
    vB('vWood', sx * (OW * 0.5 - 0.18), 0.12, -1.2, 0.18, 4.8, 2.9, 0, lvC);
    vB('vIron', sx * (OW * 0.5 - 0.28), 1.45, -1.2, 0.06, 0.18, 2.85, 0, vC(0x2e2a26));
    vB('vIron', sx * (OW * 0.5 - 0.28), 3.65, -1.2, 0.06, 0.18, 2.85, 0, vC(0x2e2a26));
  }

  /* Monumental brick arch spandrel & arcaded upper guardhouse bridging the 6.8 m gateway */
  kput('dlArchSpandrel', [0, 4.2, 0], null, [10.8, 5.2, T], bandC);
  kput('dlArchMortar', [0, 4.2, T * 0.5 + 0.14], null, [9.6, 4.8, 0.34], morC);
  kput('dlArchMortar', [0, 4.2, -(T * 0.5 + 0.14)], null, [9.6, 4.8, 0.34], morC);

  /* Raised iron portcullis grille above roadway clearance (y = 5.4..8.4 m) */
  for (let gx = -2.8; gx <= 2.81; gx += 0.56) {
    vPst('vPipe', gx, 5.35, T * 0.5 - 0.85, 0.045, 2.85, vC(0x2e2a26));
  }
  vB('vIron', 0, 5.55, T * 0.5 - 0.85, 6.2, 0.10, 0.12, 0, vC(0x2e2a26));
  vB('vIron', 0, 6.65, T * 0.5 - 0.85, 6.2, 0.10, 0.12, 0, vC(0x2e2a26));

  /* Upper guard bridge + open 3-bay brick loggia + blazing Izani Sun-Orb crest + crenelated attic */
  vB('dlBrickBandB', 0, H_ARCH + 0.2, 0, 10.8, H_GATE - H_ARCH - 0.2, T, 0, bandC);
  dlnArcade(0, H_ARCH + 1.45, T * 0.5 + 0.24, 0, 9.6, 3.35, 3, { c: brkC, band: true, rail: true, jaliRail: true, depth: 0.48 });
  dlnSunOrb(0, H_ARCH + 0.85, T * 0.5 + 0.28, 0, 0.68);
  vB('dlMortarB', 0, H_GATE + 0.01, 0, 10.9, 0.24, T + 0.36, 0, morC);
  vB('vWood', 0, H_GATE + 0.26, 0, 11.0, 0.16, T + 0.44, 0, orgC);
  dlnWallMerlons(0, H_GATE + 0.43, T * 0.5 - 0.35, 10.6, 0.72, 1.05, brkC, morC);
  dlnWallMerlons(0, H_GATE + 0.43, -(T * 0.5 - 0.35), 10.6, 0.72, 1.05, brkC, morC);
}

VERN.def({
  key: 'dil_cooling_baths',
  name: 'Malqaf Brick Cooling Baths',
  family: 'civic',
  w: 24, d: 22, h: 15.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['civic'], job: 'healing' },
  build: buildDilCoolingBaths
});
VERN.def({
  key: 'dil_customs_loggia',
  name: 'Arcaded Brick Customs Loggia',
  family: 'civic',
  w: 24, d: 18, h: 14.8,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['civic', 'infrastructure'], job: 'customs' },
  build: buildDilCustomsLoggia
});
VERN.def({
  key: 'dil_guildhall_peristyle',
  name: 'Peristyle Brick Guildhall',
  family: 'civic',
  w: 26, d: 24, h: 16.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['civic'], job: 'trading' },
  build: buildDilGuildhallPeristyle
});
VERN.def({
  key: 'dil_barracks_arcade',
  name: 'Arcaded Brick Garrison Barracks',
  family: 'civic',
  w: 28, d: 22, h: 15.6,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['civic', 'military'] },
  build: buildDilBarracksArcade
});
VERN.def({
  key: 'dil_shrine_suncourt',
  name: 'Sun-Orb Jali Courtyard Shrine',
  family: 'civic',
  w: 22, d: 22, h: 17.2,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['civic', 'religious'], job: 'worship' },
  build: buildDilShrineSuncourt
});
VERN.def({
  key: 'dil_wall_seg',
  name: 'Kiln-Brick Rampart Curtain (12 m)',
  family: 'civic',
  w: 12, d: 5.2, h: 11.4,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: false, type: ['military', 'infrastructure'] },
  build: buildDilWallSeg
});
VERN.def({
  key: 'dil_wall_tower',
  name: 'Louvered Brick Rampart Watchtower',
  family: 'civic',
  w: 10, d: 10, h: 19.5,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['military', 'infrastructure'] },
  build: buildDilWallTower
});
VERN.def({
  key: 'dil_wall_corner',
  name: 'Battered Brick Corner Bastion',
  family: 'civic',
  w: 12.4, d: 12.4, h: 22.0,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['military', 'infrastructure'] },
  build: buildDilWallCorner
});
VERN.def({
  key: 'dil_wall_gate',
  name: 'Twin-Towered Sun-Orb Vassal Gatehouse',
  family: 'civic',
  w: 24, d: 13.6, h: 23.5,
  tags: { culture: 'iziz', style: 'dilihan', wealth: 'civic', lit: true, type: ['military', 'infrastructure'], job: 'customs' },
  build: buildDilWallGate
});
