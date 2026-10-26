// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md step S1)
// ATMOS.sky draws the sky as a background pass at the station's own pixel on the scale model (STAGE.site: Farport's coast at
// px 27,260, Yith's ridge, the front between them), with the real sun, the giant, its ring, the moons, the station, the
// cluster and the clouds at the host clock's hour and day, and sets the sun, the hemisphere, the fog and the exposure from
// the colour script. Farside's air is the wettest on the map (humidity .95, a heavy cloud cover, the sea fog's density). No
// painted ridges: the far country (47-host-land.js) is real terrain, and the coast opens to the only ocean.
// The page opens at 06:00 on game start's day; #hour=, #day= and #time=run move it, as the host's slider does.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.startHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:STAGE.site,air:STAGE.air,clouds:STAGE.clouds||{cover:.6},fogDensity:STAGE.fogDensity}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true,
  /* the weather (89x-host-weather.js, ATMOS.bindWeather) into the colour script: the sky sets the fog last each frame, so the fog's
     thickening has to come through it (the sea fog, the fog belt's perpetual cloud) */
  weather:()=>{const W=ATMOS.W;if(!W)return null;return{cover:Math.min(1,(W.rain||0)*.35+(W.fog||0)*.3),grey:Math.max(W.rain||0,(W.fog||0)*.7),fog:W.fog||0};}});
// the fill light keeps its share of the day and goes out at night (the giantshine light takes the night)
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows and the rain's darkening on the ground, the far country, the plants and the works (SKY-PLAN.md 11.1)
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
