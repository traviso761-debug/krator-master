// ================================================================= ARCODIGA — Preset Views, Ghost-Tsunami Drawdown Toggle, M6 Export & KHOST.take [web]
const VIEWS = {};

(function(){
 function safeY(x, z, minClear){
  const dh = (typeof KDRAWN !== 'undefined' && KDRAWN.h) ? KDRAWN.h(x, z) : null;
  const g = Math.max(terrainH(x, z), dh == null ? -1e9 : dh, ADG_STATE.seaOffsetM);
  return g + (minClear == null ? 8.0 : minClear);
 }

 function defView(name, pos, tgt){
  const py = Math.max(pos[1], safeY(pos[0], pos[2], 8.5));
  VIEWS[name] = [pos[0], +py.toFixed(1), pos[2], tgt[0], tgt[1], tgt[2]];
 }

 /* Punctuation-free preset views (zero apostrophes, zero colons, 6-float [ex,ey,ez,tx,ty,tz] format!) */
 defView('overview',                   [ 680, 485, 1180], [ 220, 105,  -80]);
 defView('arcodiga-breach-and-throat', [-115,  96,  680], [-145, 108,   25]);
 defView('east-wing-charter-portal',   [ 955, 238,  365], [1125, 180,  210]);
 defView('kopa-diga-nuraghe-rim',      [ 835, 228, -305], [1025, 178, -515]);
 defView('cliff-hoists-and-lagoon',    [ 385,  88, -555], [ 755,  72, -555]);
 defView('eternian-fort-and-clock',    [ 955, 295,  335], [1195, 174,  545]);
 defView('dam-lee-coaling-quay',       [ 265,  58,  635], [ 525,  14,  425]);
 defView('mole-hoist-and-road',        [ 705, 284,  825], [ 702, 105,  277]);
})();

function setCharterMode(mode){
 ADG_STATE.mode = mode;
 if (mode === 'Ghost-Tsunami Drawdown') {
  /* Pre-bore -8.0 m ocean/lagoon drawdown rings Santa Cristina chimes, triggers et_clock alarm, closes sponge ostia & raises hoists! */
  ADG_STATE.seaOffsetM = -8.0;
  ADG_STATE.drawdownM = 8.0;
  ADG_STATE.chimeAlarm = true;
 } else if (mode === 'Hoist Drill 90s Lift') {
  ADG_STATE.seaOffsetM = -1.2;
  ADG_STATE.drawdownM = 1.2;
  ADG_STATE.chimeAlarm = false;
 } else {
  ADG_STATE.mode = 'Normal Charter';
  ADG_STATE.seaOffsetM = 0.0;
  ADG_STATE.drawdownM = 0.0;
  ADG_STATE.chimeAlarm = false;
 }
 return ADG_STATE;
}

/* Register M6 EXPORT profile sections for Godot 4.7.2 & openworld streaming */
if (typeof EXPORT !== 'undefined' && EXPORT.register) {
 if (typeof KCITY !== 'undefined' && KCITY.registerExport) KCITY.registerExport();
 EXPORT.register('interiors', function(){
  return {
   rooms: ADG_ROOMS.ROOMS,
   lightTable: ADG_WORLD.ROOM_LIGHT_TABLE,
   arcodigaEastWing: ADG_WORLD.ancBuilt ? ADG_WORLD.ancBuilt.aiStats : null
  };
 }, { by: 'arcodiga' });
 EXPORT.register('fixtures', function(){
  return {
   delta: ADG_WORLD.DELTA,
   hoists: ADG_FLEET.HOIST_RECS.map(function(h){
    return { id: h.id, culture: h.culture, x: h.x, z: h.z, footY: h.footY, headY: h.headY };
   }),
   santaCristina: ADG_SITE.SANTA_CRISTINA,
   tideClock: ADG_SITE.TIDE_CLOCK
  };
 }, { by: 'arcodiga' });
}

/* Host Invariant Audits & Fault-Injected Negatives for verify.py --assert */
function auditClosedEyesStatuary(heads){
 if (!heads || !heads.length) return { ok: false, detail: '0 Eternian statuary heads audited' };
 let badEyes = 0, badGold = 0;
 for (let i = 0; i < heads.length; i++) {
  const h = heads[i];
  if (h.eyes && h.eyes !== 'closed' && h.eyes !== 'veiled') badEyes++;
  if (h.metal === 'gold') badGold++;
 }
 return {
  ok: badEyes === 0 && badGold === 0,
  detail: heads.length + ' official Eternian masks/heads audited (' + badEyes + ' open-eyed, ' + badGold + ' Sanctum gold)'
 };
}

const ADG_HOST_CHECKS = {
 'voth-trades': function(){
  const carried = ADG_TRADES.filter(function(r){ return Array.isArray(r.keys) && r.keys.length > 0; });
  const nas = ADG_TRADES.filter(function(r){ return !!r.na; });
  const placed = new Set(ADG_WORLD.PLANS.lots.map(function(l){ return l.rawKey; }));
  const missing = carried.filter(function(r){ return !r.keys.some(function(k){ return placed.has(k); }); });
  return {
   ok: ADG_TRADES.length === 44 && carried.length === 41 && nas.length === 3 && missing.length === 0,
   detail: carried.length + '/44 carried (100% placed across HKK+ETK), ' + nas.length + ' canonical na'
  };
 },
 'arcodiga-asymmetric-delta': function(){
  const res = ADG_CROOK_DELTA.auditDelta(ADG_WORLD.DELTA);
  const ai = ADG_WORLD.ancBuilt ? ADG_WORLD.ancBuilt.aiStats : { rooms: 0, pieces: 0 };
  return {
   ok: res.ok && ai.rooms >= 20 && ai.pieces >= 40,
   detail: 'yOff=-95 m, abandoned=' + ADG_WORLD.DELTA.stats.abandonedPct + '%, East Wing rooms=' + ai.rooms + ', eternian pieces=' + ai.pieces
  };
 },
 'tsunami-trimline-65m': function(){
  const audit = ADG_CITY.auditLots(ADG_WORLD.PLANS.lots);
  return {
   ok: audit.ok && audit.overlaps === 0 && audit.lowDwellings === 0 && audit.minDwellingY >= 95.0,
   detail: audit.lots + ' lots (HKK=' + ADG_WORLD.PLANS.hkLots.length + ', ETK=' + ADG_WORLD.PLANS.etLots.length + '), 0 overlaps, min dwelling y=' + audit.minDwellingY + ' m'
  };
 },
 'no-arcology-clipping': function(){
  const c = ADG_CITY.auditArcologyClearance(ADG_WORLD.PLANS.lots, ADG_WORLD.PLANS.ways);
  return {
   ok: c.ok && c.lotHits === 0 && c.wayHits === 0,
   detail: 'lotHits=' + c.lotHits + ', wayHits=' + c.wayHits + ' across ' + ADG_WORLD.PLANS.ways.length + ' street segments'
  };
 },
 'eternian-hex-honeycomb': function(){
  const h = ADG_HEX.auditHexAlignment(ADG_WORLD.PLANS.lots);
  return {
   ok: h.ok && h.macroCells === 15 && h.aligned60 === h.hexBuildings,
   detail: h.macroCells + ' hex cells, ' + h.z6Lots + ' Z6 lots, ' + h.aligned60 + '/' + h.hexBuildings + ' hex buildings aligned to 60 deg'
  };
 },
 'multikit-hlod-atlas': function(){
  const hc = ADG_WORLD.multikitHost ? ADG_WORLD.multikitHost.hlodCheck() : { ok: false };
  return {
   ok: !!hc.ok && hc.twice === 0 && hc.none === 0,
   detail: 'lots=' + hc.lots + ', twice=' + hc.twice + ', none=' + hc.none + ', atlasVRAM=' + (hc.atlas ? hc.atlas.vramMB : 0) + ' MB'
  };
 },
 'closed-eyes-statuary': function(){
  const list = (typeof ETK !== 'undefined' && ETK.heads && ETK.heads.length) ? ETK.heads : ADG_WORLD.statuaryAuditLog;
  return auditClosedEyesStatuary(list);
 },
 'crook-trimline-flora': function(){
  const fs = ADG_WORLD.floraStats;
  const dd = CROOK_PHYS.sprayTrimAt({ elevM: 18.0, coastDistKm: 0.25, wnwExposure01: 0.9, calderaShelter01: 0.15, silicaByte: 150, drawdownM: 8.0 });
  return {
   ok: fs.spongesBelow65 >= 20 && fs.treesAbove65 >= 20 && fs.treesBelow65 === 0 && dd.ostiaOpen01 < 0.25,
   detail: 'sponges(<65m)=' + fs.spongesBelow65 + ', heroTrees(>=65m)=' + fs.treesAbove65 + ', canopySponges=' + fs.canopySponges + ', trees(<65m)=' + fs.treesBelow65
  };
 },
 'roomlight-deep-vaults': function(){
  const tbl = ADG_WORLD.ROOM_LIGHT_TABLE;
  const ok = ADG_ROOMS.auditVaultIsolation(tbl) && tbl.byId['adg.wing.telemetry_loft'].daylight > 0.35;
  return {
   ok: ok,
   detail: 'machineVault=' + tbl.byId['adg.vault.machine_archive'].daylight + ', santaVault=' + tbl.byId['adg.vault.santa_cristina'].daylight + ', loft=' + tbl.byId['adg.wing.telemetry_loft'].daylight
  };
 },
 'hoists-and-sim-charter': function(){
  const hoistsOk = ADG_FLEET.HOIST_RECS.length === 3 && ADG_FLEET.HOIST_RECS.every(function(h){ return h.clearanceOk; });
  const S = ADG_ENV.SIM_STATE;
  const st = S ? S.stocks() : null;
  const tr = S ? S.tradeReport() : {};
  const painted = S ? S.citizens.filter(function(c){ return c.cohort === 'eternian' && c.faceChalk; }).length : 0;
  const ok = !!(hoistsOk && S && S.pop === 6800 && st && st.by.sawn_nephrite.total > 50 && st.by.benihi_timber.total > 50 && Object.keys(tr).length === 4 && painted >= 30);
  return {
   ok: ok,
   detail: '3x 90s hoists, pop=' + (S ? S.pop : 0) + ', paintedEternians=' + painted + ', windHooks=' + ADG_ENV.windBoundCount + ', nephrite=' + (st && st.by.sawn_nephrite.total)
  };
 }
};

function adgHostChecksList(){
 return Object.keys(ADG_HOST_CHECKS).map(function(k){
  const r = ADG_HOST_CHECKS[k]();
  return { name: k, ok: !!r.ok, detail: r.detail };
 });
}

function adgHostNegativesList(){
 const R = [];
 /* 1. Negative dwelling below +65.0 m tsunami trimline */
 {
  const low = ADG_WORLD.PLANS.lots.concat([{
   id: 9991, kit: 'hueru-kuran', key: 'hueru-kuran:hk_house_poor_kelper',
   x: 615, y: 14.0, z: -520, ry: 0, w: 13.2, d: 14.4, h: 7.5,
   bo: { c: [2300, 2300], u: [1, 0], v: [0, 1], hw: 6.6, hd: 7.2 }
  }]);
  const res = ADG_CITY.auditLots(low);
  R.push({ name: 'dwelling below +65 m tsunami trimline rejected', failed: res.lowDwellings > 0, detail: 'lowDwellings=' + res.lowDwellings });
 }
 /* 2. Negative street slicing through East Stiffening Wing */
 {
  const clipWays = ADG_WORLD.PLANS.ways.concat([{ inst: 'et_cantonment', kind: 'avenue', w: 9.5, pts: [[965, 95], [965, 362]] }]);
  const res = ADG_CITY.auditArcologyClearance(ADG_WORLD.PLANS.lots, clipWays);
  R.push({ name: 'street slicing through East Stiffening Wing rejected', failed: !res.ok, detail: 'wayHits=' + res.wayHits });
 }
 /* 3. Negative skewed hexagonal building in Z6 honeycomb */
 {
  const skew = ADG_WORLD.PLANS.lots.concat([{ id: 9992, zone: 'Z6', kit: 'eternian', key: 'eternian:et_hex_house', v: 0, x: 1205, y: 175, z: 500, ry: 0.42 }]);
  const res = ADG_HEX.auditHexAlignment(skew);
  R.push({ name: 'off-grid skewed hexagonal building in Z6 rejected', failed: !res.ok, detail: 'aligned60=' + res.aligned60 + '/' + res.hexBuildings });
 }
 /* 4. Negative multikit HLOD duplicate representation */
 {
  const dup = ADG_WORLD.multikitHost ? ADG_WORLD.multikitHost.hlodCheck({ twice: true }) : { ok: true };
  R.push({ name: 'duplicate multikit HLOD lot representation caught', failed: !dup.ok, detail: 'twice=' + dup.twice });
 }
 /* 5. Negative open-eyed / Sanctum-gold statuary fault */
 {
  const bad = auditClosedEyesStatuary([{ eyes: 'open', metal: 'gold' }]);
  R.push({ name: 'open-eyed or Sanctum-gold statuary rejected on frontier superintendency', failed: !bad.ok, detail: bad.detail });
 }
 /* 6. Negative sky daylight leak into vault=true room */
 {
  const leaky = JSON.parse(JSON.stringify(ADG_WORLD.ROOM_LIGHT_TABLE));
  leaky.byId['adg.vault.santa_cristina'].daylight = 0.05;
  const ok = ADG_ROOMS.auditVaultIsolation(leaky);
  R.push({ name: 'sky daylight leak into Santa Cristina vault rejected', failed: !ok, detail: 'vault leak caught' });
 }
 return R;
}

KHOST.on(function lodTick(){
 camera.updateMatrixWorld();
 if (ADG_ENV && ADG_ENV.skyHandle && ADG_ENV.skyHandle.update) {
  ADG_ENV.skyHandle.update(0);
  if (ADG_ENV.skyHandle.state && BIO.setSun) BIO.setSun(ADG_ENV.skyHandle.state.sunDir);
 }
 if (BIO.lodTick) BIO.lodTick(camera);
 if (ADG_WORLD && ADG_WORLD.multikitHost) {
  for (let k = 0; k < 4; k++) {
   ADG_WORLD.multikitHost.update([camera.position.x, camera.position.z], false);
  }
 }
}, 'view');

let _adgLastMs = performance.now();
const HOST_TICKS = [function(){
 const nowMs = performance.now();
 const dt = Math.min(0.1, Math.max(0.001, (nowMs - _adgLastMs) * 0.001));
 _adgLastMs = nowMs;
 for (let i = 0; i < TICKS.length; i++) TICKS[i](nowMs, dt);
}];

KHOST.take({
 build: 'arcodiga',
 title: 'Kōpa-Dīga / Arcodiga / Dī-Gā Wài-Sī',
 hint: 'Crookshore North Crater (89, 604 · 1.60 atm): Tsunami-breached Arcodiga dam-arcology (-95 m) + Dense Hueru-Kuran & Hexagonal Eternal State Charter Town (6,800 pop)',
 scene: scene,
 camera: camera,
 renderer: renderer,
 ground: terrainH,
 walk: typeof KWALK !== 'undefined' ? KWALK : null,
 clear: 1.8,
 minR: 2,
 maxR: 12000,
 views: VIEWS,
 ticks: HOST_TICKS,
 clock: { hour: 10.5, onSet: function(){} },
 on: {
  view: function(name){
   const v = VIEWS[name];
   if (v && ADG_WORLD && ADG_WORLD.multikitHost) {
    for (let p = 0; p < 20; p++) ADG_WORLD.multikitHost.update([v[0], v[2]], true);
   }
  }
 },
 draw: function(){
  if (ADG_ENV && ADG_ENV.skyHandle && ADG_ENV.skyHandle.render) ADG_ENV.skyHandle.render();
 },
 stats: function(){
  return ADG_STATE.mode + ' · lots ' + ADG_WORLD.PLANS.lots.length + ' · pop 6800';
 },
 layers: {
  'flora and sponges': { match: function(o){ return !!(o.userData && o.userData.biome); } },
  'far country': { match: function(o){ return !!(o.userData && o.userData.farField); } }
 },
 exporters: { tags: function(){ return KTAGS.page.export(); } },
 api: {
  hostChecks: adgHostChecksList,
  hostNegatives: adgHostNegativesList,
  setCharterMode: setCharterMode
 }
});

if (typeof document !== 'undefined') {
 const uiBar = document.getElementById('ui');
 if (uiBar) {
  ['Normal Charter', 'Ghost-Tsunami Drawdown', 'Hoist Drill 90s Lift'].forEach(function(mName){
   const btn = document.createElement('button');
   btn.textContent = mName;
   btn.onclick = function(){ setCharterMode(mName); };
   uiBar.appendChild(btn);
  });
  const shBtn = document.createElement('button');
  shBtn.textContent = 'Shadows';
  shBtn.onclick = function(){
   if (window._shadow === 'off') ADG_WORLD.attachShadow(KHOST.ui);
  };
  uiBar.appendChild(shBtn);
 }
}
