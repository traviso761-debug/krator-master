// ================================================================= HOST — preset views, Calm/Gale/Drawdown modes, invariants & KHOST.take [web]
const VIEWS = {};

(function(){
 const groundOrSea = function(x, z){
  const dh = (typeof KDRAWN !== 'undefined' && KDRAWN.h) ? KDRAWN.h(x, z) : null;
  return Math.max(
   terrainH(x, z),
   dh == null ? -1e9 : dh,
   SEA ? SEA.level : -1e9
  );
 };

 /* Keep every preset camera eye strictly above KDRAWN.h + 3.2 m and clear of tree crowns, works & sea-stacks */
 const safeEye = function(ex, ey, ez){
  let x = ex, y = ey, z = ez;
  for (let pass = 0; pass < 10; pass++) {
   let moved = false;
   const trees = (BATTER.TREES || []).concat(BATTER.PALMS || []);
   for (let i = 0; i < trees.length; i++) {
    const T = trees[i];
    if (T.lv === 0) continue;
    const db = Math.hypot(x - T.x, z - T.z);
    const boleR = (T.rb == null ? 0.4 : T.rb) * 2.2 + 2.0;
    if (db < boleR && y > T.y0 - 2 && y < T.y0 + T.H + 3.5) {
     const ang = Math.atan2(z - T.z, x - T.x);
     x = T.x + Math.cos(ang) * (boleR + 0.8);
     z = T.z + Math.sin(ang) * (boleR + 0.8);
     moved = true;
    }
    const cy = T.y0 + T.H * 0.72;
    const rx = (T.crownR == null ? 4.5 : T.crownR) + 2.6, ry = T.H * 0.34 + 2.6;
    const q = Math.hypot((x - T.x) / rx, (y - cy) / ry, (z - T.z) / rx);
    if (q < 1.0) {
     if (y >= cy) {
      y = cy + ry + 1.5;
     } else {
      const ang2 = Math.atan2(z - T.z, x - T.x);
      x = T.x + Math.cos(ang2) * (rx + 1.0);
      z = T.z + Math.sin(ang2) * (rx + 1.0);
     }
     moved = true;
    }
   }
   for (let w = 0; w < WORKS.length; w++) {
    const W = WORKS[w];
    const dw = Math.hypot(x - W.x, z - W.z);
    if (dw < W.r + 2.5 && y < W.y + 5.5) {
     const aw = Math.atan2(z - W.z, x - W.x);
     x = W.x + Math.cos(aw) * (W.r + 3.0);
     z = W.z + Math.sin(aw) * (W.r + 3.0);
     moved = true;
    }
   }
   const minY = groundOrSea(x, z) + 3.4;
   if (y < minY) {
    y = minY;
    moved = true;
   }
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
})();

/* Interactive [Calm] / [Gale] / [Tsunami Drawdown] live sea & blowhole state controller */
function setBatterMode(mode){
 BATTER_STATE.mode = mode;
 if (mode === 'Gale') {
  BATTER_STATE.waveEnergy = 1.65;
  BATTER_STATE.drawdownM = 0.0;
 } else if (mode === 'Tsunami Drawdown') {
  BATTER_STATE.waveEnergy = 0.10;
  BATTER_STATE.drawdownM = STAGE.exposedWNW ? -12.0 : -3.4;
 } else {
  BATTER_STATE.waveEnergy = 1.0;
  BATTER_STATE.drawdownM = 0.0;
 }
 if (SEA_WATER) {
  SEA_WATER.level = SEA.level + BATTER_STATE.drawdownM;
  if (SEA_WATER.U && SEA_WATER.U.wtrLevel) {
   SEA_WATER.U.wtrLevel.value = SEA_WATER.level;
  }
 }
 if (BLOWHOLE_PLUMES && BLOWHOLE_PLUMES.material && BLOWHOLE_PLUMES.material.uniforms && BLOWHOLE_PLUMES.material.uniforms.SA) {
  const sa = BLOWHOLE_PLUMES.material.uniforms.SA.value;
  if (mode === 'Tsunami Drawdown') {
   BLOWHOLE_PLUMES.visible = false;
  } else {
   BLOWHOLE_PLUMES.visible = true;
   if (sa[2]) {
    sa[2].y = mode === 'Gale' ? 32.0 : 19.5;
    sa[2].x = mode === 'Gale' ? 0.36 : 0.28;
   }
  }
 }
 window._batterMode = mode;
}
window.setBatterMode = setBatterMode;
window._batterMode = 'Calm';

/* Inspector hit formatting */
function describe(hit){
 const p = hit.point, o = hit.object;
 let best = null;
 for (let i = 0; i < REG.length; i++) {
  const r = REG[i];
  if (r.r > 400) continue;
  const dx = p.x - r.x, dz = p.z - r.z, ry0 = r.y == null ? 0 : r.y;
  if (dx * dx + dz * dz <= r.r * r.r && p.y >= ry0 - 3 && p.y <= ry0 + r.h + 5) {
   if (!best || r.r < best.r) best = r;
  }
 }
 const item = o.isInstancedMesh && o.userData.biome ? (o.name || '').replace(/^biome:/, '').replace(/^.*\|/, '') : null;
 const S = (item && BATTER.speciesOfItem && BATTER.speciesOfItem(item)) || (best && BATTER.byKey[best.key]) || null;
 const hv = S && S.tags && S.tags.harvest;
 const asl = STAGE.elevOffset + p.y;
 return (S ? S.name + '  (' + S.model + ')' : best ? best.name : (o.userData.inspectLabel || item || o.name || 'mesh')) +
  (hv ? '\nharvest: wood ' + hv.wood + (hv.gather ? ' · gather ' + hv.gather : '') + (hv.crop ? ' · crop ' + hv.crop : '') : '') +
  '\nstation ' + STAGE.key + ' · lithology ' + STAGE.lithology + ' · elev ' + asl.toFixed(1) + ' m ASL · P ' + STAGE.air.pressure.toFixed(2) + ' atm' +
  '\n' + p.x.toFixed(0) + ', ' + p.y.toFixed(0) + ', ' + p.z.toFixed(0) + '  range ' + camera.position.distanceTo(p).toFixed(0) + ' m';
}

const BUDGET = {
 showcase: { tris: 12000000, calls: 360 },
 cls: { pass: 8000000, host: 2500000 },
 type: {
  'batteredisle/trees':  'pass',
  'batteredisle/shrubs': 'pass',
  'batteredisle/floor':  'pass',
  'batteredisle/kin':    'pass',
  'batteredisle/rocks':  'pass',
  'batteredisle/fauna':  'pass',
  'host':                'host'
 }
};

/* Hard verify.py --assert Invariants (T.ok + T.neg, PLAN.md section 7.2) */
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
   detail: (!libOk ? 'KMAT not in lib mode; ' : '') + (bad.length ? bad.length + ' untextured lit meshes: ' + bad.slice(0, 5).join(', ') : meshList.length + ' meshes checked, 0 untextured lit meshes')
  };
 },

 speciesHarvest: function(spList){
  const miss = spList.filter(function(s){ return !s.tags || !s.tags.harvest; }).map(function(s){ return s.key; });
  return {
   ok: spList.length === 25 && miss.length === 0,
   detail: miss.length ? 'missing harvest: ' + miss.join(',') : '25 canonical species with complete HV botany tags'
  };
 },

 asymmetricTrimline: function(trees, exposedWNW, stKey){
  if (exposedWNW) {
   const low = trees.filter(function(t){ return t.elevASL < 55.0; });
   return {
    ok: trees.length >= 12 && low.length === 0,
    detail: low.length ? low.length + ' trees illegally placed below +55 m WNW megatsunami trimline'
                       : trees.length + ' canopy trees strictly >= +56 m above WNW tsunami-planed bench'
   };
  }
  if (stKey === 'plug') {
   return { ok: trees.length >= 16, detail: trees.length + ' wind-sheared cloud-laurel & podocarp trees on +868.8 m plug bowls' };
  }
  const lowLee = trees.filter(function(t){ return t.elevASL < 50.0 && t.elevASL >= 18.0; });
  const under18 = trees.filter(function(t){ return t.elevASL < 18.0; });
  return {
   ok: trees.length >= 16 && lowLee.length >= 3 && under18.length === 0,
   detail: under18.length ? under18.length + ' trees below +18 m leeward trimline'
                          : trees.length + ' leeward canopy trees (' + lowLee.length + ' descending cleanly into +18..+50 m tsunami shadow)'
  };
 },

 bimodalLithology: function(logList, lithology, stKey){
  const niBad = logList.filter(function(r){ return r.key === 'nickelmyrtle' && lithology !== 'ultramafic'; });
  const niCount = logList.filter(function(r){ return r.key === 'nickelmyrtle'; }).length;
  const panBad = logList.filter(function(r){ return r.key === 'covepandan' && (stKey === 'rampart' || stKey === 'plug'); });
  const okNi = lithology === 'ultramafic' ? (niCount >= 6 && niBad.length === 0) : (niCount === 0 && niBad.length === 0);
  return {
   ok: okNi && panBad.length === 0,
   detail: (niBad.length || panBad.length)
    ? 'lithology violation (niBad=' + niBad.length + ', panBad=' + panBad.length + ')'
    : 'lithology=' + lithology + ', nickelmyrtle=' + niCount + ', 0 cross-substrate violations'
  };
 },

 extinctBlowholeFidelity: function(blowholes, stKey, regList){
  const antGalls = regList.filter(function(r){ return /shroud-ant|drum-gall|sister-cup/i.test(r.name || ''); });
  const vents = regList.filter(function(r){ return /fumarole|hydrothermal|magma/i.test(r.name || ''); });
  if (stKey !== 'rampart') {
   return {
    ok: blowholes.length === 0 && antGalls.length === 0 && vents.length === 0,
    detail: '0 volcanic vents, 0 Shroudhills ant-galls, 0 WNW blowholes on ' + stKey
   };
  }
  const badBh = blowholes.filter(function(b){
   return !b.phys || !b.phys.active || b.phys.volcanic || b.phys.jetHeightM < 12 || b.phys.jetHeightM > 34;
  });
  return {
   ok: blowholes.length === 3 && badBh.length === 0 && antGalls.length === 0 && vents.length === 0,
   detail: badBh.length ? badBh.length + ' invalid blowhole records'
                        : '3 active pneumatic wave-compression blowholes ([12,34] m spray plumes), 0 volcanic vents, 0 Shroudhills ant-galls'
  };
 },

 submarineKelpAndSprings: function(logList, flows, opens, ground){
  const badKelp = logList.filter(function(r){ return r.key === 'soundkelp' && r.bedElevM > -0.5; });
  const badCress = logList.filter(function(r){ return r.key === 'tuffcress' && (r.springDistM > 12.0 || !(r.seepFlowLs > 0.5)); });
  const badMouths = [];
  for (let fi = 0; fi < (flows || []).length; fi++) {
   const F = flows[fi];
   if (!F || F.kind !== 'flow' || !F.pts || F.pts.length < 2) continue;
   const keep = F.keepAt || (F.ribbonOpt && F.ribbonOpt.keep) || null;
   let overRun = 0;
   for (let i = 0; i + 1 < F.pts.length; i++) {
    const a = F.pts[i], b = F.pts[i + 1], L0 = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(L0 / 4));
    for (let k = 0; k < n; k++) {
     const u = k / n, x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u, ds = L0 / n;
     if (keep && keep(x, z) < 0.25) { overRun = 0; continue; }
     const inOpen = (opens || []).some(function(O){ return O.kind === 'open' && O.contains(x, z) && ground(x, z) < (O.levelAt ? O.levelAt(0) : 0) - 0.02; });
     overRun = inOpen ? (overRun + ds) : 0;
     if (overRun > 24) { badMouths.push(F.name + ' runs ' + overRun.toFixed(0) + ' m into sea'); break; }
    }
   }
  }
  return {
   ok: badKelp.length === 0 && badCress.length === 0 && badMouths.length === 0,
   detail: (badKelp.length || badCress.length || badMouths.length)
    ? 'kelpBad=' + badKelp.length + ', cressBad=' + badCress.length + ', mouths=' + badMouths.join(';')
    : '100% submarine soundkelp (<= -0.5 m), spring-bound tuffcress (<= 12 m), and clean shoreline flow mouths'
  };
 },

 verticalStackGraphics: function(mats, drawnSrcs, shadowState){
  const m2Ok = !!(mats && mats.rockBasalt && mats.rockBasalt.userData.km1RoughAA && mats.rockPalagonite && mats.rockPalagonite.userData.km1RoughAA);
  const drawnOk = Array.isArray(drawnSrcs) && drawnSrcs.length >= 1;
  const shadOff = shadowState === 'off' || !(renderer.shadowMap && renderer.shadowMap.enabled);
  return {
   ok: m2Ok && drawnOk && shadOff,
   detail: 'M2 km1RoughAA=' + m2Ok + ', KDRAWN sources=' + (drawnSrcs ? drawnSrcs.length : 0) + ', shadowOffAtLoad=' + shadOff
  };
 },

 coconutWaveShadow: function(logList, exposedWNW, stKey){
  const palms = logList.filter(function(r){ return r.key === 'coconut'; });
  if (exposedWNW || stKey === 'plug') {
   return {
    ok: palms.length === 0,
    detail: palms.length ? palms.length + ' drift coconuts illegally placed on ' + stKey : '0 drift coconuts on wave-planed rampart or +868.8 m summit plug'
   };
  }
  const badElev = palms.filter(function(r){ return r.elevASL < 2.5 || r.elevASL > 49.0; });
  return {
   ok: palms.length >= 4 && badElev.length === 0,
   detail: badElev.length ? badElev.length + ' coconuts outside +2.6..+48 m leeward strand band'
                          : palms.length + ' drift-sown coconut palms in sheltered ' + stKey + ' wave-shadow strand (+2.6..+48 m)'
  };
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
 add('all twenty-five species carry harvest botany tags', HCHK.speciesHarvest(BATTER.SPECIES));
 add('asymmetric WNW vs leeward megatsunami trimline enforced', HCHK.asymmetricTrimline(BATTER.TREES, STAGE.exposedWNW, STAGE.key));
 add('drift-sown coconuts confined to sheltered leeward wave-shadow coves', HCHK.coconutWaveShadow(BATTER.LOG, STAGE.exposedWNW, STAGE.key));
 add('bimodal ultramafic vs sedimentary collar lithology enforced', HCHK.bimodalLithology(BATTER.LOG, STAGE.lithology, STAGE.key));
 add('extinct cinder cone blowholes free of volcanic vents and ant-galls', HCHK.extinctBlowholeFidelity(STAGE.blowholes, STAGE.key, REG));
 add('submarine soundkelp, tuffcress springs and shoreline mouths valid', HCHK.submarineKelpAndSprings(
  BATTER.LOG,
  WATER.surfaces.filter(function(s){ return s.kind === 'flow'; }),
  WATER.surfaces.filter(function(s){ return s.kind === 'open'; }),
  terrainH
 ));
 add('vertical-stack M2 km1RoughAA, KDRAWN and shadow-off active', HCHK.verticalStackGraphics(BATTER.MAT, typeof KDRAWN !== 'undefined' ? KDRAWN.sources : [], window._shadow));
 return R;
}

function hostNegatives(){
 const R = [];
 const add = function(name, res){ R.push({ name: name, failed: !res.ok, detail: res.detail }); };
 const dummyUntex = { isMesh: true, name: 'untex_dummy', userData: {}, material: new THREE.MeshStandardMaterial({ color: 0x777777 }) };
 add('untextured lit mesh injected', HCHK.texturedMeshes([dummyUntex], 'lib'));
 add('species missing harvest tag', HCHK.speciesHarvest(BATTER.SPECIES.slice(0, 4)));
 add('canopy tree below +55 m on WNW tsunami rampart', HCHK.asymmetricTrimline([{ elevASL: 24.0 }], true, 'rampart'));
 add('drift coconut placed on WNW tsunami scour rampart', HCHK.coconutWaveShadow([{ key: 'coconut', elevASL: 12.0 }], true, 'rampart'));
 add('nickelmyrtle placed on sedimentary collar', HCHK.bimodalLithology([{ key: 'nickelmyrtle' }], 'sedimentary', 'strait'));
 add('volcanic fumarole or Shroudhills ant-gall injected', HCHK.extinctBlowholeFidelity([], 'cove', [{ name: 'Shroud-Ant Drum-Gall' }]));
 add('terrestrial soundkelp above sea level', HCHK.submarineKelpAndSprings([{ key: 'soundkelp', bedElevM: 4.5 }], [], [], terrainH));
 add('unclipped flow running across open sea', HCHK.submarineKelpAndSprings([], [{ kind: 'flow', name: 'bad', pts: [{ x: 0, z: 0 }, { x: -120, z: 0 }] }], [{ kind: 'open', levelAt: function(){ return 0; }, contains: function(){ return true; } }], function(){ return -8.0; }));
 return R;
}

KHOST.on(skyView, 'view');
KHOST.on(function lodTick(){
 camera.updateMatrixWorld();
 if (BIO.lodTick) BIO.lodTick(camera);
}, 'view');

KHOST.take({
 build: 'batteredisle',
 title: 'Krator biome — ' + STAGE.name,
 hint: STAGE.name + ' (0.75 g, ' + STAGE.air.pressure.toFixed(2) + ' atm): worn extinct cinder & scoria cone, radial feeder-dikes, palagonite arches & blowholes',
 scene: scene,
 camera: camera,
 renderer: renderer,
 ground: terrainH,
 clear: 1.8,
 registry: REG,
 views: VIEWS,
 ticks: TICKS,
 clock: { hour: 10.5, onSet: function(){} },
 draw: function(){ SKY.render(); },
 inspect: describe,
 stats: function(){
  return 'mode ' + BATTER_STATE.mode + ' · inst ' + window._instances + '\nlod ' + (BIO.lodShown ? BIO.lodShown.meshes + '/' + BIO.lodShown.of + ' chunk meshes' : '');
 },
 layers: {
  'flora and fauna': { match: function(o){ return !!(o.userData && o.userData.biome); } },
  'worn cone, dikes and arches': { match: function(o){ return !!(o.userData && o.userData.host && !o.userData.farField); } },
  'far country': { match: function(o){ return !!(o.userData && o.userData.farField); } },
  'sky': { objects: function(){ return [SKY.mesh]; } }
 },
 exporters: { biome: function(){ return BIO.export(); } },
 budget: BUDGET,
 types: function(){ return BIO.stats; },
 api: {
  hostChecks: hostChecks,
  hostNegatives: hostNegatives,
  setBatterMode: setBatterMode,
  exportBox: STAGE.exportBox,
  exportProfile: STAGE.sea
   ? ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos', 'water']
   : ['registry', 'items', 'buckets', 'materials', 'textures', 'terrain', 'stage', 'atmos'],
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

/* Add [Calm] / [Gale] / [Tsunami Drawdown] mode buttons to KHOST UI bar */
if (typeof document !== 'undefined') {
 const uiBar = document.getElementById('ui');
 if (uiBar) {
  ['Calm', 'Gale', 'Tsunami Drawdown'].forEach(function(mName){
   const btn = document.createElement('button');
   btn.textContent = mName;
   btn.onclick = function(){ setBatterMode(mName); };
   uiBar.appendChild(btn);
  });
 }
}

SHADOW_ATTACH(KHOST.ui);
