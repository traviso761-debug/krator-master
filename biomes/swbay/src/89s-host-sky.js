// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md step S1)
// 2026-10-26: the painted dome, the giant mesh and its RingGeometry (the old 82-host-sky.js) are gone. ATMOS.sky draws the
// sky as a background pass at Voth's site on the scale model (the bay Voth stands on: 40 S, the giant NE 25 degrees up),
// with the real sun, the giant, its ring, the moons, the station, the cluster and the clouds at the host clock's hour and
// day, and sets the sun, the hemisphere, the fog and the exposure from the colour script. The bay's air is thick (1.9 atm)
// and humid. No painted ridges: the far country (45-host-stage.js) is real terrain, and the bay opens to the sea.
// The page opens at 06:00 on game start's day (the owner); #hour=, #day= and #time=run move it, as the host's slider does.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
// the host makes the clock (91-host-loop.js, which loads after this fragment); the sky reads it through this view of it, so there is one hour on the page
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.startHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:446,py:690},air:{pressure:1.9,humidity:.8},
 clouds:{cover:.45},fogDensity:.000143}),   /* the old page's fog, .00017 at 1.9 atm */
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
// the fill light keeps its share of the day and goes out at night (the giantshine light takes the night)
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows and the rain's darkening on the ground, the far country, the plants and the structures (SKY-PLAN.md
// 11.1): every lit material the build made, once; the animated fauna are left out (their place comes from their own pose)
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
