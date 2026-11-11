// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md)
// ATMOS.sky draws the sky as a background pass at the station's pixel on the scale model (px 1026,350 on map 5.1: the eastern abyss's
// gentle east rim), with the real sun, the giant, its ring, the moons and the clouds at the host clock's hour and day, and sets
// the sun, the hemisphere, the fog and the exposure from the colour script. The air is the rim slope's (1.7 atm: y 0 is -600 m
// on the model) and dry-season dusty. No painted ridges: the abyss floor and the plateau are the far country's terrain.
// The page opens at the shared sky's start hour; #hour=, #day= and #time=run move it, as the host's slider does.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.viewHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:SITE.px,py:SITE.py},air:{pressure:+atmAt(150).toFixed(2),humidity:.45,dustK:.35},
 clouds:{cover:.28},fogDensity:.000105}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows on every lit material: after the bake (89z, which runs after the water: the flora is built there now)
function cloudShadeScene(){const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||m.userData.cloudShaded||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);m.userData.cloudShaded=true;
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
