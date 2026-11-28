// ================================================================= HOST — shared Krator sky at each station's 5.1 pixel [web]
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
 site: STAGE.site,
 air: STAGE.air,
 clouds: STAGE.clouds || { cover: 0.7 },
 fogDensity: STAGE.fogDensity
}), {
 renderer: renderer,
 camera: camera,
 scene: scene,
 sun: sun,
 hemi: HEMI,
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

const SKY_FILL = fill.intensity;
function skyView(dt){
 SKY.update(dt);
 const L = SKY.look;
 fill.intensity = SKY_FILL * Math.min(1, L.sunI / 2);
 BIO.setSun(SKY.state.sunDir);
}

/* the clouds' shadows and the rain's darkening on every lit material, once: the core's pass (Stage 8 V8, 2026-11-24), with these
   hills' porosities (the plants .42, also the biome core's materials made after it; the works .65), the fauna and the ants left out */
ATMOS.cloudShadeScene(scene, { biome: 0.42, host: 0.65, leave: /^biofauna|^bioanim|^shroudhills-ant/ });
