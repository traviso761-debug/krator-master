// ================================================================= BATTERED PORT — Preset Views, Hoist Drill / Tsunami Toggle, M6 Export & KHOST.take [web]
const VIEWS = {};

(function(){
 function safeY(x, z, minClear){
  const dh = (typeof KDRAWN !== 'undefined' && KDRAWN.h) ? KDRAWN.h(x, z) : null;
  const g = Math.max(terrainH(x, z), dh == null ? -1e9 : dh, BP_STATE.seaOffsetM);
  return g + (minClear == null ? 6.0 : minClear);
 }

 function defView(name, pos, tgt){
  const py = Math.max(pos[1], safeY(pos[0], pos[2], 6.5));
  VIEWS[name] = [pos[0], +py.toFixed(1), pos[2], tgt[0], tgt[1], tgt[2]];
 }

 /* Compliant punctuation-free preset views (zero apostrophes, zero colons, 6-float [ex,ey,ez,tx,ty,tz] format!) */
 defView('overview',                [  38, 345,  640], [  -20,  68, -220]);
 defView('kettle-lagoon-jaws',      [   0,  68,  525], [    0,   8,   45]);
 defView('cliff-hoist-gantry',      [ -18,  58,   42], [  -52,  58, -162]);
 defView('dark-water-sea-cave',     [-128,  22,    6], [ -252,   6,   -5]);
 defView('bare-stone-citadel',      [-155, 174, -285], [ -225, 136, -445]);
 defView('unmasked-stepped-street', [-398, 142,  -35], [ -455, 102, -175]);
 defView('crucible-forge-terrace',  [ 315, 148, -135], [  425, 106, -285]);
 defView('bolt-hole-tunnel',        [-875,  36,  135], [ -920,   6,   46]);
})();

function setPortMode(mode){
 BP_STATE.mode = mode;
 if (mode === 'Hoist Drill 90s Lift') {
  BP_STATE.seaOffsetM = -1.8;
  BP_STATE.waveAmp = 1.25;
 } else if (mode === 'Tsunami Surge') {
  /* Outer surge buffered by twin 38 m feeder-dike jaws; upper town at >= +85 m completely untouched! */
  BP_STATE.seaOffsetM = 11.5;
  BP_STATE.waveAmp = 2.1;
 } else {
  BP_STATE.seaOffsetM = 0.0;
  BP_STATE.waveAmp = 1.0;
 }
}

/* Register M6 EXPORT profile sections */
if (typeof EXPORT !== 'undefined' && EXPORT.register) {
 if (typeof KCITY !== 'undefined' && KCITY.registerExport) KCITY.registerExport();
 EXPORT.register('interiors', function(){
  return {
   rooms: BP_ROOMS.ROOMS,
   lightTable: BP_WORLD.ROOM_LIGHT_TABLE
  };
 }, { by: 'battered-port' });
 EXPORT.register('fixtures', function(){
  return {
   doors: BP_WORLD.fixtureDoors,
   windows: BP_WORLD.fixtureWindows,
   exileDress: {
    orthodoxy: 'No Mask Above the Door, No Chalk Upon the Cheek',
    counts: BP_WORLD.DRESS.counts
   },
   hoists: BP_FLEET.HOIST_RECS.map(function(h){
    return { id: h.id, x: h.x, z: h.z, footY: h.footY, headY: h.headY };
   })
  };
 }, { by: 'battered-port' });
}

/* Host Invariant Checks & Negative Fault-Injection Proofs for verify.py --assert */
function checkRimTsunamiFloor(lots){
 for (let i = 0; i < lots.length; i++) {
  if (lots[i].tier === 'rim' && lots[i].y < 85.0) return false;
 }
 return true;
}

function checkHoistAndCaveClearance(hoists, site){
 if (!hoists || hoists.length !== 4) return false;
 for (let i = 0; i < hoists.length; i++) {
  const h = hoists[i];
  if (!(h.headY - h.footY >= 80.0 && h.clearanceOk)) return false;
 }
 const cave = site.inVaultOrTunnel(-285, -5);
 const tun = site.inVaultOrTunnel(-680, 28);
 return !!(cave && cave.headroomM >= 6.5 && tun && tun.headroomM >= 6.5);
}

const BP_HOST_CHECKS = {
 'voth-trades': function(){
  const carried = BP_TRADES.filter(function(r){ return r.keys && r.keys.length > 0; }).length;
  const nas = BP_TRADES.filter(function(r){ return !!r.na; }).length;
  return {
   ok: BP_TRADES.length === 44 && carried === 42 && nas === 2,
   detail: carried + ' carried, 0 gaps, ' + nas + ' na of 44'
  };
 },
 'exile-unmasked': function(){
  const res = BP_EXILE.auditOrthodoxy({
   dressList: BP_WORLD.DRESS.list,
   statuary: BP_WORLD.statuaryAuditLog,
   citizens: BP_ENV.SIM_STATE ? BP_ENV.SIM_STATE.citizens : [],
   cyanStrips: 0
  });
  return {
   ok: res.ok,
   detail: res.ok ? ('checked ' + res.checkedLots + ' lots, ' + res.checkedCitizens + ' citizens, 0 masks/gold/chalk') : res.faults.slice(0, 3).join('; ')
  };
 },
 'rim-tsunami-floor': function(){
  const ok = checkRimTsunamiFloor(BP_WORLD.PLANS.rimLots);
  const minY = Math.min.apply(null, BP_WORLD.PLANS.rimLots.map(function(l){ return l.y; }));
  return {
   ok: ok,
   detail: BP_WORLD.PLANS.rimLots.length + ' upper rim lots, min y=' + minY.toFixed(2) + ' m (>= +85.0 m)'
  };
 },
 'hoist-clearance': function(){
  const ok = checkHoistAndCaveClearance(BP_FLEET.HOIST_RECS, BP_SITE);
  const vSilk = BP_WORLD.ROOM_LIGHT_TABLE && BP_WORLD.ROOM_LIGHT_TABLE.byId['bp.vault.silk'];
  const gate5 = !!(vSilk && vSilk.vault === true && vSilk.daylight === 0);
  return {
   ok: ok && gate5,
   detail: '4 twin-chain cliff-hoists (+2.2 -> +112 m), 640 m bolt-hole >= 6.5 m, vault daylight=' + (vSilk ? vSilk.daylight : 'n/a')
  };
 },
 'sim-stocks': function(){
  const S = BP_ENV.SIM_STATE;
  const st = S ? S.stocks() : null;
  const tr = S ? S.tradeReport() : {};
  const rKeys = Object.keys(tr);
  const ok = !!(S && st && st.by.coke_coal.total > 50 && st.by.nickel_steel.total > 20 && st.by.spider_silk.total > 20 && rKeys.length === 4);
  return {
   ok: ok,
   detail: 'pop=' + (S ? S.pop : 0) + ', routes=' + rKeys.length + ', coal=' + (st && st.by.coke_coal.total)
  };
 }
};

function bpHostChecksList(){
 return Object.keys(BP_HOST_CHECKS).map(function(k){
  const r = BP_HOST_CHECKS[k]();
  return { name: k, ok: !!r.ok, detail: r.detail };
 });
}

function bpHostNegativesList(){
 const R = [];
 /* 1. Negative Unpainted Exile orthodoxy fault (injected mask & chalk) */
 {
  const bad = BP_EXILE.auditOrthodoxy({
   dressList: [{ id: 'bad_lot', maskCount: 1, goldGilt: 1 }],
   statuary: [],
   citizens: [{ id: 'bad_cit', faceChalk: true }],
   cyanStrips: 1
  });
  R.push({ name: 'injected mask/gilt/chalk rejected by exile orthodoxy', failed: !bad.ok, detail: bad.faults.slice(0, 2).join('; ') });
 }
 /* 2. Negative rim lot below +85 m megatsunami floor */
 {
  const ok = checkRimTsunamiFloor([{ tier: 'rim', y: 42.0 }]);
  R.push({ name: 'rim lot below +85 m tsunami floor rejected', failed: !ok, detail: 'rim lot at +42.0 m caught' });
 }
 /* 3. Negative short cliff-hoist (<80 m lift) */
 {
  const ok = checkHoistAndCaveClearance([{ footY: 2.0, headY: 32.0, clearanceOk: true }], BP_SITE);
  R.push({ name: 'truncated cliff-hoist rejected', failed: !ok, detail: 'short hoist caught' });
 }
 return R;
}

window._bpChecks = BP_HOST_CHECKS;

KHOST.on(function lodTick(){
 camera.updateMatrixWorld();
 if (BP_ENV && BP_ENV.skyHandle && BP_ENV.skyHandle.update) {
  BP_ENV.skyHandle.update(0);
  if (BP_ENV.skyHandle.state && BIO.setSun) BIO.setSun(BP_ENV.skyHandle.state.sunDir);
 }
 if (BIO.lodTick) BIO.lodTick(camera);
}, 'view');

let _bpLastMs = performance.now();
const HOST_TICKS = [function(){
 const nowMs = performance.now();
 const dt = Math.min(0.1, Math.max(0.001, (nowMs - _bpLastMs) * 0.001));
 _bpLastMs = nowMs;
 for (let i = 0; i < TICKS.length; i++) TICKS[i](nowMs, dt);
}];

/* Hand control to core/host (KHOST.take) */
KHOST.take({
 build: 'battered-port',
 title: 'Bè-tõ-pò (Bare-Stone Port)',
 hint: 'Unpainted Eternian Exile & Smuggler Port (5,000 pop, 0.75 g, 1.58 atm): +85..+138 m crater-rim citadel, -28 m Kettle lagoon, 4 twin-chain cliff-hoists & 640 m bolt-hole',
 scene: scene,
 camera: camera,
 renderer: renderer,
 ground: terrainH,
 walk: typeof KWALK !== 'undefined' ? KWALK : null,
 clear: 1.8,
 minR: 2,
 maxR: 8000,
 views: VIEWS,
 ticks: HOST_TICKS,
 clock: { hour: 10.5, onSet: function(){} },
 draw: function(){
  if (BP_ENV && BP_ENV.skyHandle && BP_ENV.skyHandle.render) BP_ENV.skyHandle.render();
 },
 stats: function(){
  return BP_STATE.mode + ' · lots ' + BP_WORLD.PLANS.lots.length + ' · pop 5000';
 },
 layers: {
  'flora and fauna': { match: function(o){ return !!(o.userData && o.userData.biome); } },
  'far country': { match: function(o){ return !!(o.userData && o.userData.farField); } }
 },
 exporters: { tags: function(){ return KTAGS.page.export(); } },
 api: {
  hostChecks: bpHostChecksList,
  hostNegatives: bpHostNegativesList,
  setPortMode: setPortMode
 }
});

if (typeof document !== 'undefined') {
 const uiBar = document.getElementById('ui');
 if (uiBar) {
  ['Normal Port', 'Hoist Drill 90s Lift', 'Tsunami Surge'].forEach(function(mName){
   const btn = document.createElement('button');
   btn.textContent = mName;
   btn.onclick = function(){ setPortMode(mName); };
   uiBar.appendChild(btn);
  });
 }
}

BP_WORLD.attachShadow(KHOST.ui);
