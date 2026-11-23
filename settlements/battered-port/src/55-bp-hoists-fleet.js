// ================================================================= BATTERED PORT — 4 Counterweighted 90s Cliff-Hoists, Dike-Boom, Gong-Tower & Smuggler Fleet [draw]
// Draws from BP_SITE & KTAGS records:
//   - Four counterweighted twin-chain boat & cargo cliff-lifts (bp_cliff_hoist, +2.2 m Kettle -> +88..+112 m D2 rim),
//     animating full 86 m vertical lugger/crate haul in 90 s under [Hoist Drill 90s Lift] or [Tsunami Surge].
//   - 110 m Twin Feeder-Dike Jaw Nickel-Steel Chain-Boom (bp_dike_boom) across (-58, 395) .. (+58, 395).
//   - Seamount-Watch Tsunami Gong-Frame & Signal Brazier on Bare-Stone Head (+138 m columnar basalt plug, D1).
//   - Smuggler Fleet read in place via RINGSEA (kits/ringsea) + exile rig overrides: bpBlockadeLugger, bpDeltaSkiff,
//     yonniTradeGalley, arkScoutTri, and hkWhaler (including folded-mast luggers berthed inside Da-wò-hò sea-cave!).
const BP_FLEET = (function(){
 const HOIST_RECS = [];
 const VESSEL_RECS = [];

 function buildHoistsAndBoom(scene, mats, tagsReg){
  const group = new THREE.Group();
  group.name = 'bp_hoists_and_defenses';
  scene.add(group);

  const scoriaMat = mats.plinthScoria;
  const basaltMat = mats.plinthBasalt;
  const nickelMat = mats.metalNickel;
  const cuproniMat = mats.metalCuproni;
  const timberMat = mats.woodDrift;

  /* Shared geometries for twin hoist chains, sheaves, and cradles */
  const pierGeo = new THREE.BoxGeometry(2.6, 1.0, 3.2);
  const crossBeamGeo = new THREE.BoxGeometry(11.6, 1.2, 1.4);
  const sheaveGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.48, 16);
  sheaveGeo.rotateZ(Math.PI * 0.5);
  const chainColGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.0, 8);
  const counterweightGeo = new THREE.BoxGeometry(3.4, 5.2, 2.8);
  const cradleDeckGeo = new THREE.BoxGeometry(6.6, 0.55, 22.0);
  const cradleRibGeo = new THREE.BoxGeometry(7.0, 1.35, 0.48);

  for (let i = 0; i < BP_SITE.HOISTS.length; i++) {
   const H = BP_SITE.HOISTS[i];
   const hSpan = H.headY - H.footY;
   const midZ = (H.zHead + H.zFoot) * 0.5;
   const zSpan = Math.abs(H.zFoot - H.zHead);
   const liftZ = H.zFoot - 12.0;

   /* Register in KTAGS before drawing */
   const tid = tagsReg ? tagsReg.add({
    'class': 'building',
    kind: 'bp_cliff_hoist',
    key: 'bp_cliff_hoist',
    name: H.name,
    at: [H.x, H.footY, liftZ],
    ry: H.yaw,
    size: [14.0, 24.0, hSpan + 8.0],
    tags: { culture: 'eternian', style: 'exile-unpainted', types: ['infrastructure'], job: 'warehousing', role: 'power-house stokers and engineers' }
   }).id : null;

   const hg = new THREE.Group();
   hg.name = H.id;
   group.add(hg);

   /* Twin basalt/scoria masonry cliff-slot piers rising from Kettle foot to rim winch-head */
   for (let s = -1; s <= 1; s += 2) {
    const pLow = new THREE.Mesh(pierGeo, basaltMat);
    pLow.scale.set(1, hSpan + 9.0, 1);
    pLow.position.set(H.x + s * 4.8, H.footY + (hSpan + 9.0) * 0.5 - 2.0, liftZ - 4.0);
    hg.add(pLow);

    /* Inclined brace strut back to D2 rim winch-head */
    const strutLen = Math.hypot(hSpan * 0.35, zSpan - 12.0);
    const strut = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, strutLen), scoriaMat);
    strut.position.set(H.x + s * 4.8, H.headY + 2.5, (liftZ + H.zHead) * 0.5);
    strut.lookAt(H.x + s * 4.8, H.headY + 5.8, H.zHead);
    hg.add(strut);

    /* 3.2 m bronze-bushed top sheaves */
    const sh = new THREE.Mesh(sheaveGeo, cuproniMat);
    sh.position.set(H.x + s * 3.2, H.headY + 5.4, liftZ);
    hg.add(sh);

    /* Twin nickel=180 forged link-chains */
    const ch = new THREE.Mesh(chainColGeo, nickelMat);
    ch.scale.set(1, hSpan + 4.0, 1);
    ch.position.set(H.x + s * 3.2, H.footY + (hSpan + 4.0) * 0.5, liftZ);
    hg.add(ch);
   }

   /* Top gantry crosshead beam */
   const headBeam = new THREE.Mesh(crossBeamGeo, basaltMat);
   headBeam.position.set(H.x, H.headY + 6.2, liftZ - 1.5);
   hg.add(headBeam);

   /* 45-ton palagonite spring-water counterweight tank inside rear slot */
   const cw = new THREE.Mesh(counterweightGeo, nickelMat);
   cw.position.set(H.x, H.headY - 8.0, liftZ - 6.8);
   hg.add(cw);

   /* Animated 22 x 6.5 m ironkneepodocarp boat & cargo cradle */
   const cradle = new THREE.Group();
   cradle.position.set(H.x, H.footY + 0.6, liftZ);
   const deck = new THREE.Mesh(cradleDeckGeo, timberMat);
   cradle.add(deck);
   for (let r = -3; r <= 3; r++) {
    const rib = new THREE.Mesh(cradleRibGeo, timberMat);
    rib.position.set(0, 0.72, r * 3.0);
    cradle.add(rib);
   }
   /* Contraband silk & grain crates lashed on cradles #2 and #3; lugger/skiff on #1 and #4 */
   if (i === 1 || i === 2) {
    const crateGeo = new THREE.BoxGeometry(2.1, 1.5, 2.4);
    for (let c = 0; c < 4; c++) {
     const cr = new THREE.Mesh(crateGeo, cuproniMat);
     cr.position.set((c % 2 === 0 ? -1.4 : 1.4), 1.05, -4.5 + c * 3.2);
     cradle.add(cr);
    }
   }
   hg.add(cradle);

   hg.updateMatrixWorld(true);
   if (typeof KDRAWN !== 'undefined' && KDRAWN.add) {
    KDRAWN.add(KDRAWN.fromObject(hg));
   }

   HOIST_RECS.push({
    id: H.id,
    tid: tid,
    name: H.name,
    x: H.x,
    z: liftZ,
    zHead: H.zHead,
    footY: H.footY,
    headY: H.headY,
    cradle: cradle,
    counterweight: cw,
    clearanceOk: true
   });
  }

  /* 2. Twin Feeder-Dike Jaw 110 m Nickel-Steel Chain-Boom (bp_dike_boom at z = 392, x = -58 .. +58) */
  {
   const boomGroup = new THREE.Group();
   boomGroup.name = 'bp_dike_boom';
   if (tagsReg) {
    tagsReg.add({
     'class': 'building',
     kind: 'bp_dike_boom',
     key: 'bp_dike_boom',
     name: '110 m Feeder-Dike Nickel-Steel Chain-Boom',
     at: [0, 1.2, 392],
     ry: 0,
     size: [116.0, 8.0, 6.0],
     tags: { culture: 'eternian', style: 'exile-unpainted', types: ['military', 'infrastructure'] }
    });
   }
   const balkGeo = new THREE.CylinderGeometry(0.42, 0.42, 5.8, 10);
   balkGeo.rotateZ(Math.PI * 0.5);
   const linkGeo = new THREE.CylinderGeometry(0.18, 0.18, 7.6, 8);
   linkGeo.rotateZ(Math.PI * 0.5);
   for (let bx = -52; bx <= 52; bx += 8) {
    const sag = -0.35 * (1 - (bx / 56) * (bx / 56));
    const balk = new THREE.Mesh(balkGeo, timberMat);
    balk.position.set(bx, 0.28 + sag, 392);
    boomGroup.add(balk);
    const link = new THREE.Mesh(linkGeo, nickelMat);
    link.position.set(bx, 0.52 + sag, 392);
    boomGroup.add(link);
   }
   group.add(boomGroup);
  }

  /* 3. Seamount-Watch Tsunami Gong-Frame on Bare-Stone Head (+138 m columnar basalt plug, D1) */
  {
   const gx = -286, gz = -402, gy = BP_SITE.bareGround(gx, gz);
   if (tagsReg) {
    tagsReg.add({
     'class': 'prop',
     kind: 'tsunami_gong_frame',
     key: 'bp_tsunami_gong',
     name: 'Great Nickel-Bronze Seamount Tsunami Gong',
     at: [gx, gy, gz],
     ry: 0.45,
     size: [5.4, 3.2, 6.8],
     tags: { culture: 'eternian', style: 'exile-unpainted', types: ['infrastructure', 'military'] }
    });
   }
   const gg = new THREE.Group();
   gg.position.set(gx, gy, gz);
   gg.rotation.y = 0.45;
   for (let s = -1; s <= 1; s += 2) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 6.2, 10), timberMat);
    post.position.set(s * 2.1, 3.1, 0);
    gg.add(post);
   }
   const topBar = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.38, 0.46), timberMat);
   topBar.position.set(0, 6.1, 0);
   gg.add(topBar);
   const gong = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.22, 24), cuproniMat);
   gong.rotation.x = Math.PI * 0.5;
   gong.position.set(0, 3.85, 0);
   gg.add(gong);
   group.add(gg);
  }

  return group;
 }

 /* Build Smuggler Fleet via RINGSEA (read in place from kits/ringsea) with clean fallback hull builder */
 function makeCleanHull(spec, mats){
  const g = new THREE.Group();
  const L = spec.L, B = spec.B;
  const hullGeo = new THREE.CylinderGeometry(B * 0.48, B * 0.32, L, 12, 1, false);
  hullGeo.rotateX(Math.PI * 0.5);
  hullGeo.scale(1.0, 0.52, 1.0);
  const hull = new THREE.Mesh(hullGeo, mats.woodDrift);
  hull.position.y = 0.45;
  g.add(hull);
  if (!spec.foldedMast) {
   const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, L * 0.62, 8), mats.woodDrift);
   mast.position.set(0, L * 0.32, 0);
   g.add(mast);
  } else {
   const fMast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, L * 0.58, 8), mats.woodDrift);
   fMast.rotation.x = Math.PI * 0.48;
   fMast.position.set(0, 1.55, 0);
   g.add(fMast);
  }
  return g;
 }

 function buildFleet(scene, mats, tagsReg){
  const fleetGroup = new THREE.Group();
  fleetGroup.name = 'bp_smuggler_fleet';
  scene.add(fleetGroup);

  const fleetSpec = [
   /* Kettle Lagoon & Quay Berths */
   { id: 'lugger_kettle_1', kind: 'bpBlockadeLugger', rsKey: 'voth_dhow',       name: 'Blockade-Lugger Salt-Scar (Farport Night Run)', x: -112, z: -96,  ry: 1.55, L: 19.5, B: 4.8, H: 13.5, foldedMast: false },
   { id: 'lugger_kettle_2', kind: 'bpBlockadeLugger', rsKey: 'islander_lanong', name: 'Blockade-Lugger Bare-Lintel',                   x: -165, z: -154, ry: 0.0,  L: 19.5, B: 4.8, H: 5.2,  foldedMast: true, onHoist: 0 },
   { id: 'skiff_delta_1',   kind: 'bpDeltaSkiff',     rsKey: 'iziz_lighter',    name: 'Leeboard Delta-Skiff Ghost-Reed',               x:  -58, z: -102, ry: 1.48, L: 13.0, B: 3.6, H: 7.5,  foldedMast: false },
   { id: 'skiff_delta_2',   kind: 'bpDeltaSkiff',     rsKey: 'voth_barge',      name: 'Leeboard Delta-Skiff Sponge-Runner',            x:  182, z: -152, ry: 0.0,  L: 13.0, B: 3.6, H: 4.2,  foldedMast: true, onHoist: 3 },
   { id: 'yonni_galley_1',  kind: 'yonniTradeGalley', rsKey: 'hyk_galley',      name: 'Yonni Spear-Queen Truce Galley Sfira-Kande',    x:   12, z:  -82, ry: 1.62, L: 26.0, B: 5.4, H: 14.0, foldedMast: false },
   { id: 'ark_tri_1',       kind: 'arkScoutTri',      rsKey: 'ark_trimaran',    name: 'cFlit-qBon Paktong Scout Trimaran',             x:  -68, z:   58, ry: 0.42, L: 18.0, B: 8.2, H: 13.0, foldedMast: false },
   { id: 'hk_whaler_1',     kind: 'hkWhaler',         rsKey: 'hk_whaler',       name: 'Hueru-Kuran Nephrite and Whale-Oil Catamaran',  x:   74, z:   64, ry: -0.38,L: 21.0, B: 7.4, H: 14.5, foldedMast: false },
   /* Subterranean Da-wò-hò Sea-Cave Wet-Berths (tabernacle masts folded flat under +18 m vault crown!) */
   { id: 'lugger_cave_1',   kind: 'bpBlockadeLugger', rsKey: 'voth_dhow',       name: 'Subterranean Blockade-Lugger Night-Oar',        x: -258, z:   -6, ry: 1.57, L: 19.5, B: 4.8, H: 5.0,  foldedMast: true, inCave: true },
   { id: 'lugger_cave_2',   kind: 'bpBlockadeLugger', rsKey: 'voth_dhow',       name: 'Subterranean Blockade-Lugger Unsealed',         x: -286, z:    4, ry: 1.57, L: 19.5, B: 4.8, H: 5.0,  foldedMast: true, inCave: true }
  ];

  const rsKeys = (typeof RINGSEA !== 'undefined' && RINGSEA.keys) ? RINGSEA.keys : [];
  function pickRsKey(want){
   if (rsKeys.indexOf(want) >= 0) return want;
   for (let i = 0; i < rsKeys.length; i++) {
    if (rsKeys[i].indexOf(want.split('_')[1] || want) >= 0) return rsKeys[i];
   }
   return rsKeys[0] || null;
  }

  for (let i = 0; i < fleetSpec.length; i++) {
   const S = fleetSpec[i];
   const baseY = S.onHoist != null ? (HOIST_RECS[S.onHoist] ? HOIST_RECS[S.onHoist].footY + 1.1 : 3.2) : 0.0;

   if (tagsReg) {
    tagsReg.add({
     'class': 'prop',
     kind: S.kind,
     key: S.kind,
     name: S.name,
     at: [S.x, baseY, S.z],
     ry: S.ry,
     size: [S.B, S.L, S.H],
     tags: { culture: 'eternian', style: 'smuggler-ring', role: 'watercraft' }
    });
   }

   let vg = null;
   if (!S.foldedMast && typeof RINGSEA !== 'undefined' && RINGSEA.make) {
    const rk = pickRsKey(S.rsKey);
    const made = rk ? RINGSEA.make(rk) : null;
    if (made && made.group) vg = made.group;
   }
   if (!vg) {
    vg = makeCleanHull(S, mats);
   }

   if (S.onHoist != null && HOIST_RECS[S.onHoist]) {
    vg.position.set(0, 0.85, 0);
    vg.rotation.y = 0;
    HOIST_RECS[S.onHoist].cradle.add(vg);
   } else {
    vg.position.set(S.x, baseY, S.z);
    vg.rotation.y = S.ry;
    fleetGroup.add(vg);
   }

   VESSEL_RECS.push({
    id: S.id,
    kind: S.kind,
    name: S.name,
    x: S.x,
    y0: baseY,
    z: S.z,
    ry: S.ry,
    L: S.L,
    B: S.B,
    H: S.H,
    inCave: !!S.inCave,
    onHoist: S.onHoist,
    mesh: vg
   });
  }

  return fleetGroup;
 }

 /* Update 90-second counterweighted hoist lift & vessel bobbing each frame */
 function update(tSec, portState){
  const mode = (portState && portState.mode) || 'Normal Port';
  for (let i = 0; i < HOIST_RECS.length; i++) {
   const H = HOIST_RECS[i];
   let lift01 = 0.0;
   if (mode === 'Hoist Drill 90s Lift') {
    /* Smooth 90-second vertical ascent cycle */
    const cyc = ((tSec + i * 11.0) % 90.0) / 90.0;
    lift01 = cyc < 0.75 ? (cyc / 0.75) : (1.0 - (cyc - 0.75) / 0.25);
    lift01 = lift01 * lift01 * (3 - 2 * lift01);
   } else if (mode === 'Tsunami Surge') {
    /* Cradles locked safely at +88..+108 m rim heads above tsunami bore! */
    lift01 = 0.96;
   } else {
    /* Gentle operational loading cycle near quay */
    lift01 = (i === 2) ? 0.34 : 0.02;
   }
   const span = (H.headY - 2.5) - (H.footY + 0.6);
   H.cradle.position.y = H.footY + 0.6 + span * lift01;
   H.counterweight.position.y = H.headY - 6.0 - span * lift01 * 0.85;
  }

  const seaShift = (portState && portState.seaOffsetM) == null ? 0.0 : portState.seaOffsetM;
  for (let i = 0; i < VESSEL_RECS.length; i++) {
   const V = VESSEL_RECS[i];
   if (V.onHoist != null) continue;
   const swell = V.inCave ? 0.06 : 0.14;
   V.mesh.position.y = seaShift + Math.sin(tSec * 1.15 + i * 1.7) * swell;
   V.mesh.rotation.z = Math.sin(tSec * 0.85 + i * 2.1) * (V.inCave ? 0.01 : 0.025);
  }
  if (typeof RINGSEA !== 'undefined' && RINGSEA.tick) {
   RINGSEA.tick(tSec);
  }
 }

 return {
  HOIST_RECS: HOIST_RECS,
  VESSEL_RECS: VESSEL_RECS,
  buildHoistsAndBoom: buildHoistsAndBoom,
  buildFleet: buildFleet,
  update: update
 };
})();
