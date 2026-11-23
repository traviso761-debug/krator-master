// ================================================================= HOST — BATTER.build, BIO.bake, impostors & KSHADOW (off at load) [web]
window._biome = null;

(function(){
 const t0 = performance.now();
 const q = PQ.has('q') ? +PQ.get('q') : 1.0;

 try {
  window._biome = BATTER.build({ R: SR - 36, quality: q, station: STAGE.key });
 } catch (e) {
  reportErr('batteredisle build: ' + (e.stack || e));
 }
 _mark('batteredisle');

 if (PQ.has('nobake')) {
  window._stats = JSON.parse(JSON.stringify(BIO.stats));
  window._instances = 0;
  window._bakeCalls = 0;
  return;
 }

 const b = BIO.bake();
 scene.traverse(function(o){
  if (o.isMesh && o.name === 'biome:far' && o.material && !o.material.map && BATTER.MAT && BATTER.MAT.laurelbark && BATTER.MAT.laurelbark.map) {
   o.material.map = BATTER.MAT.laurelbark.map;
   o.material.needsUpdate = true;
  }
 });
 _mark('bake');
 window._instances = b.inst;
 window._bakeCalls = b.calls;

 if (BIO.impostorLook) {
  BIO.impostorLook({ gain: 1.44, wrap: 0.85 });
 }
 if (BIO.bakeImpostors) {
  try {
   BIO.bakeImpostors(renderer, { wait: 160 });
  } catch (e) {
   reportErr('impostors: ' + (e.stack || e));
  }
 }

 if (typeof GROUND_HZ !== 'undefined' && GROUND_HZ && typeof KHORIZON !== 'undefined') {
  try {
   window._horizon.mats = KHORIZON.shadeScene(scene, GROUND_HZ, {
    filter: function(m){ return !m.userData.farField && m !== GROUND_MAT; }
   });
  } catch (e) {
   reportErr('horizon scene: ' + (e.stack || e));
  }
 }

 window._buildMs = Math.round(performance.now() - t0);
 REGISTER({ name: STAGE.name, x: 0, z: 0, y: -28, r: SR, h: 360 });
})();

/* KSHADOW strictly off at page load (owner rule 2026-11-03); attaches on UI switch or ?shadow=1 */
const SHADOW_ATTACH = function(ui){
 if (typeof KSHADOW === 'undefined' || !KSHADOW.attach || /[?&]shadow=0(&|$)/.test(location.search)) {
  window._shadow = 'off';
  return null;
 }
 try {
  const H = KSHADOW.attach({ renderer: renderer, scene: scene, camera: camera, sun: SUN_LIGHT, ground: terrainH, ui: ui });
  H.cast(scene);
  GROUND.castShadow = false;
  GROUND.receiveShadow = true;
  if (FAR) { FAR.castShadow = false; FAR.receiveShadow = false; }
  window._shadow = H;
  return H;
 } catch (e) {
  reportErr('shadow: ' + (e.stack || e));
  return null;
 }
};
