// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md step S1) at the lakeshore
// ATMOS.sky draws the sky as a background pass at the page's own pixel on the scale model (px 444,414: the lake's south-west
// shore by Trigon; its latitude, the giant where it hangs from there), with the real sun, the giant, its ring, the moons, the
// station, the cluster and the clouds at the host clock's hour and day, and sets the sun, the hemisphere, the fog and the
// exposure from the colour script. The air is the model's: 1.89 atm and wet (the lake, 1,500-1,900 mm): a pale, hazy sky, the
// towers fading row by row into it. guilin's borrowed hyperjungle dome and necanyons' night went with the fork (the sky's own
// night is the shared sky's: the giantshine, the moons, the stars).
// The page opens at 10:00 on game start's day; #hour=, #day= and #time=run move it, as the host's slider does.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:10;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY_SITE={px:444,py:414};
// the weather's light and air for the sky (core/atmos's weather, bound below): cloud and grey with the rain, fog
const SKY_WEATHER=()=>{const W=ATMOS.W;if(!W)return null;const r=W.rain||0,f=W.fog||0;return {cover:Math.min(1,r*.6+f*.2),grey:Math.min(1,r*.8),fog:Math.min(1,f)};};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:SKY_SITE,air:{pressure:1.89,humidity:.85},clouds:{cover:.45},fogDensity:.00026}),
 {renderer,camera,scene,sun,hemi,clock:SKY_CLOCK,fog:true,weather:SKY_WEATHER});
// the fill light keeps its share of the day and goes out at night (the giantshine light takes the night)
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows and the rain's darkening on the ground, the rock, the plants (SKY-PLAN.md 11.1): every lit material, once
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): a wet, warm climate (the base five: auto, clear, rain, storm, fog);
// the ground wets in the rain. It starts clear, so the page looks as it is; the Weather selector in the panel picks the rest.
// The shared sky draws the weather's light and air from its colour script (its o.weather), so the binding is given no sun,
// hemisphere or fog of its own to scale: a stand-in fog takes its writes (the sky's own fog is the page's). Bound after
// ATMOS.cloudShade (cloudShade chains a material's hook; WATER.wetGround's setter would call it from inside itself)
const WEATHER_FOG={color:new THREE.Color(0x9aa0a6),density:.00005};
ATMOS.bindWeather({climate:{wet:true},fog:WEATHER_FOG,grounds:[MAT_GROUND]});
