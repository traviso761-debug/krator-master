// ================================================================= HOST — the valley's sky: the shared sky (core/atmos/sky, SKY-PLAN.md S1)
// [web] ATMOS.sky at the station's pixel on the scale model (the giant, the ring, the moons, the cluster and the clouds at the host clock's
// hour), in the valley's air (1.58 atm, wet). The land past the far ground (47: the model's country to 24 km) is ridge profiles CAST FROM
// THE MODEL at the site (region/site.py: three bands, far to near; SKY-PLAN.md 3.3), forest below the tree line, no snow in this climate.
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.viewHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY_RIDGES=AV_REGION.ridges.slice().reverse().map((b,i)=>({profile:b.profile.slice(),dist:b.dist,
 snowH:99999,forestH:2600-(STAGE.base+AV_REGION.eye),haze:[.7,.55,.4][i]==null?.5:[.7,.55,.4][i],rock:[.46,.42,.38],forest:[.22,.30,.21],snow:[.92,.94,.97]}));
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:STAGE.px[0],py:STAGE.px[1]},air:{pressure:STAGE.air.pressure,humidity:STAGE.air.humidity},
 clouds:{cover:STAGE.cloudCover==null?.48:STAGE.cloudCover},fogDensity:STAGE.fogDensity==null?.000075:STAGE.fogDensity,ridges:SKY_RIDGES}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
