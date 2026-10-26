// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md)
// ATMOS.sky draws the sky as a background pass at the Bowl's site on the scale model (px 866,826), with the real sun, the
// giant, its ring, the moons, the cluster and the clouds at the host clock's hour and day, and sets the sun, the hemisphere,
// the fog and the exposure from the colour script. THE AIR is the abyss's: 1.83 atm, dry (the Bowl's ~220 mm) and dusty,
// so the horizon is white and milky, the sun goes copper low down and the noon sky bleaches. Few clouds.
// THE RIDGES: the far land the station cannot hold. North, across the lake (which reaches 86 km), the eastern Inner Wall
// over godstep valley, faint; south, the Bowl's rim 70 km off, its red walls stacked toward the Wall.
// The page opens late in the afternoon (the owner, 2026-10-26): #hour=, #day= and #time=run move it, as the host's slider does.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const SKY_HOUR0=STATION.hour==null?16.8:STATION.hour;
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:SKY_HOUR0;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:SITE.px,py:SITE.py},air:Object.assign({pressure:1.83,turbidity:1.5,humidity:.22,dust:[.88,.78,.62],dustK:.55},STATION.air||{}),
 clouds:Object.assign({cover:.1,cumulus:.4,cirrus:.5},STATION.clouds||{}),   /* a station's own air and clouds (Mantis's pocket is humid) */fogDensity:.000085,
 ridges:[
  {dist:150000,base:.35,amp:1.5,cycles:9,octaves:5,peaks:5,peakAmp:.5,win:[0,85,1.4],floor:-1,seed:8911,rock:[.62,.52,.46],haze:1.6},
  {dist:70000,base:.15,amp:.85,cycles:14,octaves:5,peaks:7,peakAmp:.25,win:[185,110,1.1],floor:-1,seed:8912,rock:[.64,.42,.32],haze:1.3}]}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows on the ground, the far country and the plants (SKY-PLAN.md 11.1): every lit material the build made, once;
// the animated fauna are left out (their place comes from their own pose)
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  const k=m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey?String(m.customProgramCacheKey()):'';if(/^biofauna|^bioanim|^bowl-mantis/.test(k))continue;
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
