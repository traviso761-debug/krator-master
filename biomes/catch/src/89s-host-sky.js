// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md) at the station's site
// ATMOS.sky draws the sky as a background pass at the station's point on the scale model (STAGE.site), with the real sun,
// the giant, its ring, the moons, the station, the cluster and the clouds at the host clock's hour, and sets the sun, the
// hemisphere, the fog and the exposure from the colour script. The Catch's air is dense on the floor (~1.55 atm) and dry
// (no cloud to speak of). THE RIDGES (STAGE.ridges, far to near): the walls on every horizon, 10-17 km, bare above the air;
// the inner walls' snowfields nearer; the Godthrone's mass north-west; painted from the survey's distances until a
// horizon cast from the scale model's heightfield replaces them (SKY-PLAN.md 3.3, "Later").
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.viewHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
// THE WALLS IN THE SAME AIR AS THE DUNES (the owner, 2026-10-26: the haze should apply to the far mountains too): a stage
// gives each ridge layer `hz`, the share of it the haze should take (far crests ~.7, the inner walls ~.5, the hills ~.3),
// and its haze factor is worked out from the station's fog and the layer's distance (the sky's own curve, 1 - e^(-d f h)),
// so thicker air hazes the walls in step with the near ground and a layer keeps its place in the depth
const RIDGES=(STAGE.ridges||[]).map(r=>r.hz==null?r:Object.assign({},r,{haze:-Math.log(1-Math.min(.95,r.hz))/(r.dist*STAGE.fogDensity)}));
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:STAGE.site,air:STAGE.air,clouds:STAGE.clouds,fogDensity:STAGE.fogDensity,ridges:RIDGES}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
// THE HAZE IS DUST (the owner, 2026-10-26): low, warm and thickest on the floor. Height fog for this page (core/atmos's, bound in
// 89zz-host-core.js on STAGE.fogH {y0, H}); the sky's own fog colour and the world's are pulled toward the dust's colour (STAGE.dust {col, k})
// each frame after the colour script sets them, so the walls fade into the same warm haze as the far dunes, not a blue one
const DUST=Object.assign({col:0xcdb592,k:.5},STAGE.dust||{}),DUST_C=new THREE.Color(DUST.col);
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;if(scene.fog)scene.fog.color.lerp(DUST_C,DUST.k);SKY.uniforms.uFogC.value.lerp(DUST_C,DUST.k);fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame: 99-host-take.js subscribes it */
// the clouds' shadows on every lit material the build made, once (SKY-PLAN.md 11.1)
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim/.test(k))continue;
  if(ATMOS.cloudShade)ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
