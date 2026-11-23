// ================================================================= HOST — shared Krator sky at (px - 272, py - 330) (1.44-1.60 atm) [web]
const SKY_DAY0 = (function(){
 const m = /[?&#]day=([^&#]*)/.exec(location.search + location.hash);
 const d = m ? +decodeURIComponent(m[1]) : 0;
 return isFinite(d) ? d : 0;
})();

const skyHostClock = function(){
 return typeof KHOST !== 'undefined' && KHOST.host ? KHOST.host.clock : null;
};

const SKY_CLOCK = {
 get hour(){ const c = skyHostClock(); return c ? c.hour : ATMOS.SKY.viewHour; },
 get day(){ const c = skyHostClock(); return SKY_DAY0 + (c ? (c.day == null ? 0 : c.day) : 0); },
 get t(){ const c = skyHostClock(); return c ? c.t : 0; }
};

const SKY = ATMOS.sky(ATMOS.skyPreset('standard', {
 site: { ox: SITE.skyOffsetPx[0], oy: SITE.skyOffsetPx[1] },
 air: STAGE.air,
 clouds: { cover: STAGE.key === 'plug' ? 0.76 : (STAGE.key === 'strait' ? 0.68 : 0.58) },
 fogDensity: STAGE.key === 'plug' ? 0.00034 : (STAGE.key === 'strait' ? 0.00028 : 0.00022)
}), {
 renderer: renderer,
 camera: camera,
 scene: scene,
 sun: SUN_LIGHT,
 hemi: HEMI_LIGHT,
 clock: SKY_CLOCK,
 fog: true,
 weather: function(){
  const W = ATMOS.W;
  if (!W) return null;
  const rain = W.rain == null ? 0 : W.rain;
  const fog = W.fog == null ? 0 : W.fog;
  return {
   cover: Math.min(1, rain * 0.35 + fog * 0.32),
   grey: Math.max(rain, fog * 0.72),
   fog: fog
  };
 }
});

const SKY_FILL = FILL_LIGHT.intensity;
function skyView(dt){
 SKY.update(dt);
 const L = SKY.look;
 FILL_LIGHT.intensity = SKY_FILL * Math.min(1, L.sunI / 2);
 BIO.setSun(SKY.state.sunDir);
}

{
 const seen = new Set();
 scene.traverse(function(o){
  if (!o.isMesh || !o.material) return;
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  for (let i = 0; i < mats.length; i++) {
   const m = mats[i];
   if (seen.has(m) || !(m.isMeshLambertMaterial || m.isMeshStandardMaterial || m.isMeshPhongMaterial)) continue;
   seen.add(m);
   ATMOS.cloudShade(m, { porosity: o.userData.biome ? 0.44 : o.userData.host ? 0.68 : 1.0 });
  }
 });
}
