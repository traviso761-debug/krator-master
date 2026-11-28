// ================================================================= HOST — preset views, inspector, invariants & KHOST.take [web]
const VIEWS = {};

(function(){
 const groundOrSea = function(x, z){
  return Math.max(terrainH(x, z), SEA ? SEA.level : -1e9, TARN && tarnAt(x, z) ? TARN.level : -1e9);
 };

 // Ensure every preset camera eye stays cleanly outside tree crowns, trunks, works and terrain so eye:<view> is 100% clean
 const safeEye = function(ex, ey, ez){
  let x = ex, y = ey, z = ez;
  for (let pass = 0; pass < 8; pass++) {
   let moved = false;
   const trees = SHROUDHILLS.TREES || [];
   for (let i = 0; i < trees.length; i++) {
    const T = trees[i];
    if (T.lv === 0) continue;
    // Check bole cylinder
    const db = Math.hypot(x - T.x, z - T.z);
    const boleR = T.rb * 2.1 + 1.8;
    if (db < boleR && y > T.y0 - 2 && y < T.y0 + T.H + 3) {
     const ang = Math.atan2(z - T.z, x - T.x);
     x = T.x + Math.cos(ang) * (boleR + 0.6);
     z = T.z + Math.sin(ang) * (boleR + 0.6);
     moved = true;
    }
    // Check dense upper foliage crown ellipsoid
    const cy = T.y0 + T.H * 0.78;
    const rx = T.crownR + 2.4, ry = T.H * 0.30 + 2.4;
    const q = Math.hypot((x - T.x) / rx, (y - cy) / ry, (z - T.z) / rx);
    if (q < 1.0) {
     if (y > cy) {
      y = cy + ry + 1.2;
     } else {
      const ang2 = Math.atan2(z - T.z, x - T.x);
      x = T.x + Math.cos(ang2) * (rx + 0.8);
      z = T.z + Math.sin(ang2) * (rx + 0.8);
     }
     moved = true;
    }
   }
   const palms = SHROUDHILLS.COCONUTS || [];
   for (let p = 0; p < palms.length; p++) {
    const P = palms[p];
    const dp = Math.hypot(x - P.x, z - P.z);
    if (dp < 4.2 && y > P.y0 - 2 && y < P.y0 + P.H + 3.8) {
     const ap = Math.atan2(z - P.z, x - P.x);
     x = P.x + Math.cos(ap) * 4.8;
     z = P.z + Math.sin(ap) * 4.8;
     moved = true;
    }
   }
   for (let w = 0; w < WORKS.length; w++) {
    const W = WORKS[w];
    const dw = Math.hypot(x - W.x, z - W.z);
    if (dw < W.r + 2.2 && y < W.y + 5.5) {
     const aw = Math.atan2(z - W.z, x - W.x);
     x = W.x + Math.cos(aw) * (W.r + 2.6);
     z = W.z + Math.sin(aw) * (W.r + 2.6);
     moved = true;
    }
   }
   const minY = groundOrSea(x, z) + 2.6;
   if (y < minY) { y = minY; moved = true; }
   if (!moved) break;
  }
  return [x, y, z];
 };

 const list = STAGE.viewList || [];
 for (let i = 0; i < list.length; i++) {
  const v = list[i];
  const e = safeEye(v[1], groundOrSea(v[1], v[2]) + v[3], v[2]);
  const ty = groundOrSea(v[4], v[5]) + v[6];
  VIEWS[v[0]] = [e[0], e[1], e[2], v[4], ty, v[5]];
 }

 // Dynamic close-up view of a Paired Sister-Cup Cistern Sky-Pond (A)
 if (SHROUDHILLS.SISTER_CUPS && SHROUDHILLS.SISTER_CUPS.length) {
  const cups = SHROUDHILLS.SISTER_CUPS.slice().sort(function(a, b){
   return Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z);
  });
  const c0 = cups[0];
  if (c0) {
   // Place eye outward toward origin/clearing and slightly above cup rim so the twin amber water lenses glint clearly
   const dirA = Math.atan2(-c0.z, -c0.x);
   const eCup = safeEye(c0.x + Math.cos(dirA) * 9.5, c0.y + 3.2, c0.z + Math.sin(dirA) * 9.5);
   VIEWS['Paired Sister-Cup Cistern Sky-Pond in canopy fork'] = [eCup[0], eCup[1], eCup[2], c0.x, c0.y + 0.5, c0.z];
  }
 }

 // Dynamic sunlit Second-Floor Canopy Turf (B) & Drum-Gall + Shroud-Ants (C) views on Station 2 (canopy)
 if (STAGE.key === 'canopy') {
  if (SHROUDHILLS.HAMMOCKS && SHROUDHILLS.HAMMOCKS.length) {
   // Pick a Root-Hammock span crossing near the central ravine chasm
   const bestH = SHROUDHILLS.HAMMOCKS.slice().sort(function(a, b){
    return Math.hypot(a.mid.x, a.mid.z) - Math.hypot(b.mid.x, b.mid.z);
   })[0];
   if (bestH) {
    const m = bestH.mid;
    const eTop = safeEye(m.x, m.y + 11.5, m.z - 15.0);
    VIEWS['Sunlit second-floor Canopy Turf and crimson sky-orchids'] = [eTop[0], eTop[1], eTop[2], m.x, m.y + 0.4, m.z];
   }
  }
  if (SHROUDHILLS.COLONIES && SHROUDHILLS.COLONIES.length) {
   const bestG = SHROUDHILLS.COLONIES.slice().sort(function(a, b){
    return Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z);
   })[0];
   if (bestG) {
    const dirG = Math.atan2(-bestG.z, -bestG.x);
    const eGall = safeEye(bestG.x + Math.cos(dirG) * 7.5, bestG.y + 1.2, bestG.z + Math.sin(dirG) * 7.5);
    VIEWS['Myrmecophyte Drum-Gall and cat-sized Shroud-Ant sentries'] = [eGall[0], eGall[1], eGall[2], bestG.x, bestG.y, bestG.z];
   }
  }
 }
})();

// ---- Inspector description
function describe(hit){
 const p = hit.point, o = hit.object;
 let best = null;
 for (let i = 0; i < REG.length; i++) {
  const r = REG[i];
  if (r.r > 900) continue;
  const dx = p.x - r.x, dz = p.z - r.z;
  const ry0 = r.y == null ? 0 : r.y;
  if (dx * dx + dz * dz <= r.r * r.r && p.y >= ry0 - 2 && p.y <= ry0 + r.h + 4) {
   if (!best || r.r < best.r) best = r;
  }
 }
 const item = o.isInstancedMesh && o.userData.biome ? (o.name || '').replace(/^biome:/, '').replace(/^.*\|/, '') : null;
 const S = (item && SHROUDHILLS.speciesOfItem && SHROUDHILLS.speciesOfItem(item)) || (best && SHROUDHILLS.byKey[best.key]) || null;
 const hv = S && S.tags && S.tags.harvest;
 const Z = SHROUDHILLS.zonesAt(p.x, p.z);
 const topZone = ['shroud_cove', 'canopy_sea', 'cloak_tor', 'mist_divide'].map(function(k){ return [k, Z[k]]; }).sort(function(a, b){ return b[1] - a[1]; })[0];
 const haz = (best && best.tags && best.tags.hazard) || (S && S.tags && S.tags.hazard);

 return (S ? S.name + '  (' + S.model + ')' : best ? best.name : (o.userData.inspectLabel || item || o.name || 'mesh')) +
  (best && S && best.name !== S.name ? '  ·  ' + best.name : '') +
  (hv ? '\nharvest: wood ' + hv.wood + (hv.gather ? ' · gather ' + hv.gather : '') + (hv.edible && hv.edible.length ? ' · edible ' + hv.edible.join(', ') : '') + (hv.medicinal ? ' · medicinal' : '') : '') +
  (haz ? '\nhazard: Khroma-Mira Shroud-Ant territory (danger ' + haz.danger + ', 6 Hz slit-drum warning)' : '') +
  '\nzone ' + topZone[0] + ' · elev ' + Z.elev.toFixed(0) + ' m ASL · P ' + STAGE.air.pressure.toFixed(2) + ' atm' +
  '\n' + p.x.toFixed(0) + ', ' + p.y.toFixed(0) + ', ' + p.z.toFixed(0) + '  range ' + camera.position.distanceTo(p).toFixed(0) + ' m';
}

// ---- Probe budgets & geometric/ecological invariants (verify.py --assert)
const BUDGET = {
 showcase: { tris: 14000000, calls: 420 },
 cls: { pass: 8500000, host: 2500000 },
 type: {
  'shroudhills/trees': 'pass',
  'shroudhills/epiphytes': 'pass',
  'shroudhills/floor': 'pass',
  'host': 'host'
 }
};

const HCHK = {
 texturedMeshes: function(meshList, matMode){
  const bad = [];
  for (let i = 0; i < meshList.length; i++) {
   const o = meshList[i];
   if (!o || !o.isMesh || !o.material) continue;
   if (o.userData && o.userData.water) continue;
   if (typeof o.name === 'string' && o.name.indexOf('water:') === 0) continue;
   const mats = Array.isArray(o.material) ? o.material : [o.material];
   for (let k = 0; k < mats.length; k++) {
    const m = mats[k];
    if (!m) continue;
    if (m.isMeshLambertMaterial || m.isMeshStandardMaterial || m.isMeshPhongMaterial) {
     if (!m.map) bad.push((o.name || o.userData.inspectLabel || 'mesh') + '(' + m.type + ')');
    }
   }
  }
  const libOk = matMode === 'lib';
  return {
   ok: bad.length === 0 && libOk,
   detail: (!libOk ? 'KMAT not in lib mode; ' : '') + (bad.length ? bad.length + ' untextured lit meshes: ' + bad.slice(0, 5).join(', ') : meshList.length + ' meshes checked, 0 untextured lit meshes (100% library textures)')
  };
 },

 speciesHarvest: function(spList){
  const wantGather = [
   'amber', 'rimu-gum', 'peat-fibre', 'reed-wax', 'saltpeter', 'smudge-resin',
   'crimson-dye', 'saffron-lake', 'silver-felt', 'curd-rennet', 'mucilage',
   'fiddlehead', 'fern-rhizome', 'stalk-dye', 'coir', 'pandan-plaits',
   'bast-cordage', 'palm-sheath', 'orchid-cane', 'usnea-moss', 'kiekie-fibre', 'wax-berry'
  ];
  const miss = spList.filter(function(s){ return !s.tags || !s.tags.harvest; }).map(function(s){ return s.key; });
  const gotGather = spList.map(function(s){ return s.tags && s.tags.harvest && s.tags.harvest.gather; }).filter(Boolean);
  const missG = wantGather.filter(function(g){ return gotGather.indexOf(g) < 0; });
  return {
   ok: spList.length === 23 && miss.length === 0 && missG.length === 0,
   detail: miss.length || missG.length ? 'missing harvest: ' + miss.join(',') + '; missing gather: ' + missG.join(',') : '23 canonical species, all harvest and gather tags valid'
  };
 },

 coveCoconuts: function(coconuts, station){
  const list = coconuts || [];
  if (station !== 'cove') {
   return {
    ok: list.length === 0,
    detail: list.length ? list.length + ' strand coconuts misplaced on inland/montane ' + station : '0 strand coconuts on ' + station
   };
  }
  const seaY = SEA ? SEA.level : 0;
  const badWave = list.filter(function(P){ return P.y0 <= seaY + 1.2; });
  const badTor = list.filter(function(P){ return STAGE.fields.tor(P.x, P.z) > 0.30 || STAGE.fields.elevASL(P.x, P.z) > 110; });
  return {
   ok: list.length >= 6 && badWave.length === 0 && badTor.length === 0,
   detail: badWave.length ? badWave.length + ' coconuts below high-water strand' :
           badTor.length ? badTor.length + ' coconuts on tor or high montane bluff' :
           list.length + ' drift-sown Cocos nucifera palms along sheltered Spear-Queen cove strand'
  };
 },

 sisterCups: function(cups, ponds, station){
  if (station === 'cloaktor') {
   return { ok: true, detail: 'Cloak-Tor summit station; ' + cups.length + ' lower-skirt Sister-Cups, ' + ponds.length + ' lenses' };
  }
  const bad = ponds.filter(function(S){
   const sc = S._sisterCup;
   return !sc || !(S.level > sc.cupY + 0.05 && S.level < sc.cupY + sc.cupH + 0.05);
  });
  return {
   ok: cups.length >= 8 && ponds.length >= 16 && (ponds.length % 2 === 0) && bad.length === 0,
   detail: bad.length ? bad.length + ' water lenses outside cup bowl' : cups.length + ' Paired Sister-Cups holding ' + ponds.length + ' elevated WATER.still rainwater lenses'
  };
 },

 rootHammocks: function(spans, station){
  if (station === 'cloaktor') {
   return { ok: true, detail: 'Cloak-Tor summit station (' + spans.length + ' lower-skirt spans)' };
  }
  const minWant = station === 'canopy' ? 12 : 3;
  const bad = spans.filter(function(sp){
   const clearMid = sp.mid.y - terrainH(sp.mid.x, sp.mid.z);
   return !sp.a || !sp.b || sp.a.treeId === sp.b.treeId || sp.spanM < 5.8 || sp.spanM > 16.6 || clearMid < 8.5;
  });
  return {
   ok: spans.length >= minWant && bad.length === 0,
   detail: bad.length ? bad.length + ' invalid hammock spans' : spans.length + ' KSPACE neighbor-bridging Root-Hammock spans (6-16 m, >= 8.5 m above ravine)'
  };
 },

 shroudAnts: function(colonies, ants, regList, station){
  if (station !== 'canopy') {
   return { ok: true, detail: station + ' station (' + colonies.length + ' Drum-Galls, ' + ants.length + ' Shroud-Ants)' };
  }
  const badSize = ants.filter(function(a){ return a.sizeM < 0.27 || a.sizeM > 0.45; });
  const onPath = colonies.filter(function(c){ return STAGE.fields.path(c.x, c.z) > 0.25; });
  const hazRegs = regList.filter(function(r){ return r.tags && r.tags.hazard && r.tags.hazard.role === 'shroud-ants'; });
  return {
   ok: colonies.length >= 6 && ants.length >= 30 && badSize.length === 0 && onPath.length === 0 && hazRegs.length === colonies.length,
   detail: badSize.length ? badSize.length + ' ants out of 28-44 cm scale' :
           onPath.length ? onPath.length + ' galls encroaching safe smudge trail' :
           colonies.length + ' Drum-Galls, ' + ants.length + ' cat-sized Khroma-Mira ants (28-44 cm), ' + hazRegs.length + ' KTAGS hazard zones'
  };
 },

 cloakTorClean: function(trees, colonies, cloaks, station){
  const badTrees = trees.filter(function(T){ return STAGE.fields.tor(T.x, T.z) > 0.45; });
  const badAnts = colonies.filter(function(c){ return STAGE.fields.tor(c.x, c.z) > 0.45; });
  const wantCloaks = station === 'cloaktor' ? 40 : 4;
  return {
   ok: badTrees.length === 0 && badAnts.length === 0 && cloaks.length >= wantCloaks,
   detail: (badTrees.length || badAnts.length) ? badTrees.length + ' trees and ' + badAnts.length + ' ant colonies on bare tor' :
           '0 trees and 0 ant colonies on bare granite Cloak-Tor; ' + cloaks.length + ' lithophyte cloak mats'
  };
 },

 worksAndVista: function(worksDrawn, worksStage, farInfo){
  const okFar = !!(farInfo && farInfo.kfar && farInfo.outM >= 14000);
  return {
   ok: worksDrawn.length === worksStage.length && worksDrawn.length > 0 && okFar,
   detail: worksDrawn.length + ' of ' + worksStage.length + ' Yonni works drawn and tagged; KFAR out to ' + (farInfo ? farInfo.outM : 0) + ' m'
  };
 },

 waterMouths: function(flows, opens, ground){
  const bad = [];
  for (let fi = 0; fi < (flows || []).length; fi++) {
   const F = flows[fi];
   if (!F || F.kind !== 'flow' || !F.pts || F.pts.length < 2) continue;
   const keep = F.keepAt || (F.ribbonOpt && F.ribbonOpt.keep) || null;
   let overRun = 0;
   for (let i = 0; i + 1 < F.pts.length; i++) {
    const a = F.pts[i], b = F.pts[i + 1], L0 = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(L0 / 6));
    for (let k = 0; k < n; k++) {
     const u = k / n, x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u, ds = L0 / n;
     if (keep && keep(x, z) < 0.25) { overRun = 0; continue; }
     const inOpen = (opens || []).some(function(O){ return O.kind === 'open' && O.contains(x, z) && ground(x, z) < (O.levelAt ? O.levelAt(0) : 0) - 0.02; });
     overRun = inOpen ? (overRun + ds) : 0;
     if (overRun > 24) { bad.push(F.name + ' runs ' + overRun.toFixed(0) + ' m over open sea at (' + x.toFixed(0) + ',' + z.toFixed(0) + ')'); break; }
    }
    if (overRun > 24) break;
   }
  }
  return { ok: bad.length === 0, detail: bad.length ? bad.join('; ') : (flows || []).length + ' flows terminate cleanly at shoreline' };
 }
};

const collectSceneMeshes = function(){
 const list = [];
 scene.traverse(function(o){ if (o.isMesh) list.push(o); });
 return list;
};

function hostChecks(){
 const R = [];
 const add = function(name, res){ R.push(Object.assign({ name: name }, res)); };
 const mode = (typeof KMAT !== 'undefined' && KMAT.mode) || 'proc';
 add('all lit meshes use genuine library textures', HCHK.texturedMeshes(collectSceneMeshes(), mode));
 add('all ten species carry harvest and gather records', HCHK.speciesHarvest(SHROUDHILLS.SPECIES));
 add('drift-sown coconuts stay on warm Spear-Queen cove strand above high water', HCHK.coveCoconuts(SHROUDHILLS.COCONUTS || [], STAGE.key));
 add('Paired Sister-Cups hold dual elevated WATER.still lenses', HCHK.sisterCups(SHROUDHILLS.SISTER_CUPS, SKY_POND_SURFACES, STAGE.key));
 add('KSPACE Root-Hammocks bridge neighbor crowns overhead', HCHK.rootHammocks(SHROUDHILLS.HAMMOCKS, STAGE.key));
 add('Drum-Galls and cat-sized Shroud-Ants tagged off safe trail', HCHK.shroudAnts(SHROUDHILLS.COLONIES, SHROUDHILLS.ANTS, REG, STAGE.key));
 add('granite Cloak-Tors stay clear of host trees and ant galls', HCHK.cloakTorClean(SHROUDHILLS.TREES, SHROUDHILLS.COLONIES, SHROUDHILLS.CLOAK_MATS, STAGE.key));
 add('stream terminates cleanly at sea shoreline', HCHK.waterMouths(WATER.surfaces.filter(function(s){ return s.kind === 'flow'; }), WATER.surfaces.filter(function(s){ return s.kind === 'open'; }), terrainH));
 add('Yonni Spear-Queen works and 14 km KFAR vista built', HCHK.worksAndVista(WORKS, STAGE.works || [], window._far));
 return R;
}

function hostNegatives(){
 const R = [];
 const add = function(name, res){ R.push({ name: name, failed: !res.ok, detail: res.detail }); };
 const dummyUntex = { isMesh: true, name: 'untex_dummy', userData: {}, material: new THREE.MeshStandardMaterial({ color: 0x888888 }) };
 add('untextured lit mesh injected', HCHK.texturedMeshes([dummyUntex], 'lib'));
 add('species missing gather tag', HCHK.speciesHarvest(SHROUDHILLS.SPECIES.slice(0, 5)));
 add('coconut misplaced on high montane Cloak-Tor', HCHK.coveCoconuts([{ x: 0, z: 0, y0: 25 }], 'cloaktor'));
 add('Sister-Cup water lens floating outside cup', HCHK.sisterCups([{ x: 0, y: 15, z: 0 }], [{ level: 30, _sisterCup: { cupY: 15, cupH: 0.8 } }], 'cove'));
 add('Root-Hammock self-looping on same tree', HCHK.rootHammocks([{ a: { treeId: 1 }, b: { treeId: 1 }, spanM: 9, mid: { x: 0, y: 20, z: 0 } }], 'canopy'));
 add('oversized 2 m ant violating cat-sized contract', HCHK.shroudAnts(SHROUDHILLS.COLONIES, [{ sizeM: 2.0 }], REG, 'canopy'));
 add('host tree rooted on bare summit Cloak-Tor', HCHK.cloakTorClean([{ x: 0, z: 0 }], [], [], 'cloaktor'));
 add('stream running across open sea', HCHK.waterMouths([{ kind: 'flow', name: 'bad-stream', pts: [{ x: 0, z: 0 }, { x: -120, z: 0 }] }], [{ kind: 'open', levelAt: function(){ return 0; }, contains: function(){ return true; } }], function(){ return -8.0; }));
 add('missing Yonni work registration', HCHK.worksAndVista([], [{ kind: 'cairn' }], window._far));
 return R;
}

KHOST.on(skyView, 'view');
KHOST.on(function lodTick(){
 camera.updateMatrixWorld();
 if (BIO.lodTick) BIO.lodTick(camera);
}, 'view');

KHOST.take({
 build: 'shroudhills',
 title: 'Krator biome — ' + STAGE.name,
 hint: STAGE.name + ' (0.75 g, ' + STAGE.air.pressure.toFixed(2) + ' atm): Sister-Cup Sky-Ponds, Root-Hammocks, Cloak-Tors and cat-sized Shroud-Ants',
 scene: scene,
 camera: camera,
 renderer: renderer,
 ground: terrainH,
 clear: 1.8,
 registry: REG,
 views: VIEWS,
 ticks: TICKS,
 clock: { hour: 10, onSet: function(){} },
 draw: function(){ SKY.render(); },
 inspect: describe,
 stats: function(){
  return 'inst ' + window._instances + '\nlod ' + (BIO.lodShown ? BIO.lodShown.meshes + '/' + BIO.lodShown.of + ' chunk meshes' : '');
 },
 layers: {
  'flora and ants': { match: function(o){ return !!(o.userData && o.userData.biome); } },
  'works and ground': { match: function(o){ return !!(o.userData && o.userData.host && !o.userData.farField); } },
  'far country': { match: function(o){ return !!(o.userData && o.userData.farField); } },
  'sky': { objects: function(){ return [SKY.mesh]; } }
 },
 exporters: { biome: function(){ return BIO.export(); } },
 budget: BUDGET,
 types: function(){ return BIO.stats; },
 api: {
  hostChecks: hostChecks,
  hostNegatives: hostNegatives,
  exportBox: STAGE.exportBox || [-320, -320, 320, 320],
  exportProfile: ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water'],
  get totals(){
   const t = BIO.totals();
   return {
    rendered: BIO.lodShown ? BIO.lodShown.tris : null,
    lodMeshes: BIO.lodMeshes.length,
    tris: t.tris,
    inst: t.inst,
    meshes: t.meshes,
    registered: REG.length,
    types: Object.keys(BIO.stats).length
   };
  },
  biome: function(){ return window._biome; }
 }
});

SHADOW_ATTACH(KHOST.ui);
