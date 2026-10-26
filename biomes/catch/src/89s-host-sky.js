// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md) at the station's site
// ATMOS.sky draws the sky as a background pass at the station's point on the scale model (STAGE.site), with the real sun,
// the giant, its ring, the moons, the station, the cluster and the clouds at the host clock's hour, and sets the sun, the
// hemisphere, the fog and the exposure from the colour script. The Catch's air is dense on the floor (~1.55 atm) and dry
// (no cloud to speak of). THE RIDGES (STAGE.ridges, far to near): the walls on every horizon, 10-17 km, bare above the air;
// the inner walls' snowfields nearer; the Godthrone's mass north-west; painted from the survey's distances until a
// horizon cast from the scale model's heightfield replaces them (SKY-PLAN.md 3.3, "Later").
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.startHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:STAGE.site,air:STAGE.air,clouds:STAGE.clouds,fogDensity:STAGE.fogDensity,ridges:STAGE.ridges}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame: 99-host-take.js subscribes it */
// the clouds' shadows on every lit material the build made, once (SKY-PLAN.md 11.1)
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
  if(ATMOS.cloudShade)ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
