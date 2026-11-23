// ================================================================= HOST — scene build, impostor bake & KSHADOW (off at load) [web]
window._biome = null;
const IMP_GAIN = 1.48;

(function(){
 const t0 = performance.now();
 const Q = new URLSearchParams(location.search);
 const q = Q.has('q') ? +Q.get('q') : 1;

 try {
  window._biome = SHROUDHILLS.build({ R: SR - 40, quality: q });
 } catch (e) {
  reportErr('shroudhills build: ' + (e.stack || e));
 }
 _mark('shroudhills');

 if (Q.has('nobake')) {
  window._stats = JSON.parse(JSON.stringify(BIO.stats));
  window._instances = 0;
  window._bakeCalls = 0;
  return;
 }

 const b = BIO.bake();
 _mark('bake');
 window._instances = b.inst;
 window._bakeCalls = b.calls;

 if (BIO.impostorLook) {
  const gVal = Q.has('impgain') ? +Q.get('impgain') : IMP_GAIN;
  const wVal = Q.has('impwrap') ? +Q.get('impwrap') : 0.85;
  BIO.impostorLook({ gain: gVal, wrap: wVal });
 }
 if (BIO.bakeImpostors) {
  try {
   BIO.bakeImpostors(renderer, { wait: 180 });
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
   reportErr('horizon: ' + (e.stack || e));
  }
 }

 window._buildMs = Math.round(performance.now() - t0);
 REGISTER({ name: STAGE.name, x: 0, z: 0, y: -25, r: SR, h: 650 });
})();

// KSHADOW off at page load (owner rule, 2026-11-03); attached on panel switch or ?shadow=1
const SHADOW_ATTACH = function(ui){
 if (typeof KSHADOW === 'undefined' || !KSHADOW.attach || /[?&]shadow=0(&|$)/.test(location.search)) {
  window._shadow = 'off';
  return null;
 }
 try {
  const H = KSHADOW.attach({ renderer: renderer, scene: scene, camera: camera, sun: sun, ground: terrainH, ui: ui });
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
