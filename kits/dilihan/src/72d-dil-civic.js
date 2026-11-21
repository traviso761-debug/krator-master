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
  vB('dlMortarB', 0, 8.50, -4.4, 21.4, 0.24, 10.4, 0, morC);
  kput('dlBrickDrum', [0, 8.74, -4.4], null, [3.6, 1.35, 3.6], brkC);
  kput('vDomeC', [0, 10.05, -4.4], null, [3.6, 2.35, 3.6], null);
  vBall('dlGiltBall', 0, 12.65, -4.4, 0.34, vC(dlnPick(DL_PAL.gilt)), 0.42);
  for (const s of [-1, 1]) {
    kput('dlMortarDrum', [s * 6.8, 8.74, -4.4], null, [2.4, 0.95, 2.4], morC);
    kput('dlDomeTile', [s * 6.8, 9.65, -4.4], null, [2.4, 1.65, 2.4], dlnTileTint());
    /* Twin tall brick malqaf wind-catchers funneling Cut breezes down over internal wet channels */
    dlnWindCatcher(s * 8.2, 8.74, -7.2, 2.8, 2.8, 4.45, 0, { copper: true, c: brkC });
  }

  /* Front shaded peristyle plunge-pool court (+z half) enclosed by 1-storey brick arcades */
  dlnCourtyard(0, Y0 - 0.02, 5.2, 16.4, 8.4, 0, {
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
  vB('dlMortarB', 0, Y0 + H1, 5.6, 21.4, 0.22, 2.6, 0, morC);
  dlnArcade(0, Y0 + H1 + 0.22, 6.75, 0, 21.0, H2 - 0.28, 5, { c: brkC, rail: true, jaliRail: true, depth: 0.52 });

  /* Unified cornice + verdigris copper hipped monitor roof + central octagonal weigh-lantern */
  dlnCornice(0, Y0 + H1 + H2, -0.3, 21.6, 14.6, 0);
  dlnMonitorRoof(0, 8.40, -0.3, 21.6, 14.6, 3.15, 0, {
    copper: true, over: 0.92, monW: 11.4, monD: 2.6, monH: 0.88, monRise: 0.80
  });
  kput('dlBrickDrum', [0, 8.40 + 3.10, -0.3], null, [1.85, 1.45, 1.85], bandC);
  kput('vConeC', [0, 8.40 + 4.50, -0.3], null, [2.25, 1.35, 2.25], null);
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
  dlnCourtyard(0, Y0 - 0.02, 0, 12.0, 9.8, 0, {
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
  vB('dlMortarB', 0, Y0 + H1, -1.0, 25.0, 0.22, 2.1, 0, morC);
  dlnArcade(0, Y0 + H1 + 0.22, -0.15, 0, 24.6, H2 - 0.28, 6, { c: brkC, rail: true, depth: 0.50 });

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
  kput('vPyrCu', [9.8, Y0 + 11.94, 3.6], null, [6.4, 2.45, 6.4], null);
  vnBannerPole(9.8, Y0 + 14.1, 3.6, 0, 2.2, dlnOrangeTint());

  /* Front muster-court perimeter wall + arched legionary gate + shaded armoury rack pergola */
  vB('dlBrickOchreB', -1.8, 0, 4.8, 21.0, 0.12, 9.4, 0, vC(dlnPick(DL_PAL.brickOchre)));
  vB('dlBrickB', -6.8, 0, 9.5, 11.2, 2.25, 0.42, 0, brkC);
  dlnJali(-6.8, 0.65, 9.72, 0, 8.8, 1.25, { openBack: true, c: brkC });
  vB('dlMortarB', -6.8, 2.25, 9.5, 11.4, 0.16, 0.54, 0, morC);

  vB('dlBrickBandB', 1.4, 0, 9.5, 4.4, 3.85, 0.68, 0, bandC);
  dlnSunOrb(1.4, 3.25, 9.86, 0, 0.42);
  vB('vWood', 1.4, 3.85, 9.5, 4.8, 0.18, 0.84, 0, dlnOrangeTint());
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
  dlnPergola(-6.8, 0.12, 4.8, 8.8, 5.2, 2.95, 0, { brickPiers: true });
  dlnImpluvium(-6.8, 0.12, 4.8, 3.6, 2.0, 0, { fountain: true });
  vnLampPost(5.2, 0.12, 5.6, 4.2);
}

/* 24. Open-air Izani Sun-Orb sanctuary with jali ambulatory cloister & gilt dome-lantern (22 x 22 m, cornice 8.40 m) */
function buildDilShrineSuncourt(G, o) { reseed(9985 + (o.v | 0));
  const Y0 = 1.05;
  const HC = 4.15;
  const HS = 6.81;   /* cella cornice: 1.05 + 6.81 + 0.54 = 8.40 m */
  const bandC = dlnBrickTint(true);
  const morC = dlnMortarTint();
  const giltC = vC(dlnPick(DL_PAL.gilt));
  vnReg('Sun-Orb jali courtyard shrine', 0, 0, 12.0, 17.2);

  dlnPlinth(0, 0, 0, 19.6, 19.6, Y0, 0);
  vB('dlMortarB', 0, Y0 - 0.04, 0, 19.2, 0.08, 19.2, 0, morC);

  /* Perimeter 1-storey perforated red-brick jali ambulatory cloister enclosing the open suncourt */
  for (const sz of [-1, 1]) {
    dlnArcade(0, Y0, sz * 9.35, sz > 0 ? 0 : Math.PI, 18.8, HC, 5, { c: bandC, band: true, depth: 0.54 });
    vB('dlMortarB', 0, Y0 + HC + 0.18, sz * 8.4, 19.2, 0.22, 2.2, 0, morC);
    vB('vWood', 0, Y0 + HC + 0.40, sz * 8.4, 19.4, 0.14, 2.3, 0, dlnOrangeTint());
  }
  for (const sx of [-1, 1]) {
    dlnArcade(sx * 9.35, Y0, 0, sx * Math.PI * 0.5, 16.4, HC, 4, { c: bandC, band: true, depth: 0.54 });
    vB('dlMortarB', sx * 8.4, Y0 + HC + 0.18, 0, 2.2, 0.22, 14.8, 0, morC);
    vB('vWood', sx * 8.4, Y0 + HC + 0.40, 0, 2.3, 0.14, 15.0, 0, dlnOrangeTint());
    /* Perforated brick jali screens along outer cloister flanks filtering low tropical glare */
    dlnJali(sx * 9.55, Y0 + 0.65, -4.1, sx * Math.PI * 0.5, 3.2, 2.45, { openBack: true, c: bandC });
    dlnJali(sx * 9.55, Y0 + 0.65, 4.1, sx * Math.PI * 0.5, 3.2, 2.45, { openBack: true, c: bandC });
  }

  /* Sunken turquoise evaporative ablution pool in the forecourt (+z half) */
  dlnImpluvium(0, Y0 + 0.04, 4.4, 5.6, 4.2, 0, { fountain: true });

  /* Rear octagonal/square patterned brick Sun-Orb sanctuary cella (-2.6 m z) + verdigris & gilt dome-lantern */
  dlnBrickWing(0, Y0, -2.8, 9.6, HS, 8.8, 0, { item: 'dlBrickBandB', c: bandC, beltY: 3.9, orangeBelt: true });
  dlnCornice(0, Y0 + HS, -2.8, 9.6, 8.8, 0);
  dlnMonitorRoof(0, 8.40, -2.8, 9.6, 8.8, 2.15, 0, { copper: true, over: 0.72, monitor: false });

  /* Raised brick & mortar drum + verdigris copper dome + ventilated gilt lantern + blazing Izani Sun-Orb finial */
  kput('dlBrickDrum', [0, 8.40 + 1.45, -2.8], null, [3.2, 2.15, 3.2], bandC);
  kput('dlMortarDrum', [0, 8.40 + 3.55, -2.8], null, [3.35, 0.24, 3.35], morC);
  kput('vDomeC', [0, 8.40 + 3.75, -2.8], null, [3.25, 2.45, 3.25], null);
  kput('dlMortarDrum', [0, 8.40 + 6.10, -2.8], null, [1.05, 1.25, 1.05], morC);
  kput('vConeC', [0, 8.40 + 7.30, -2.8], null, [1.30, 0.95, 1.30], null);
  vBall('dlGiltBall', 0, 8.40 + 8.55, -2.8, 0.42, giltC, 0.42);

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
