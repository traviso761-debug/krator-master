// ================================================================= HOST — the Cut's sky: the shared sky (core/atmos/sky, SKY-PLAN.md S1)
// [web] ATMOS.sky at the station's pixel on the scale model (the giant, the ring, the moons, the cluster and the clouds at the
// host clock's hour), in the bowl's dense air (STAGE.air). THE WALLS ROUND THE HORIZON are ridge profiles CAST FROM THE KIT'S
// OWN BOWL MODEL at the site (CUT.horizon, 41-cut-field.js: SKY-PLAN.md 3.3's "a horizon profile cast from the heightfield"),
// in three distance bands far to near, coloured from the bowl's own ground: the far walls' bare rock and forest, snow on the
// lip's crests (above ~4.4 km), the near floor's salt and green. The page's own ground is real geometry in front of them.
// The echoes (PLAN.md section 3) are seen only at dusk: their opacity follows the sun's height each frame (CUT.echoLight).
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.startHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY_RIDGES=(function(){const eye=STAGE.eyeH==null?3:STAGE.eyeH,bands=STAGE.horizonBands||[[2800,12000],[12000,40000],[40000,170000]],P=CUT.horizon(STAGE.site,bands,1024,eye),
  y0=CUT.bowl.h(STAGE.site.x,STAGE.site.z)+eye,dist=bands.map(b=>Math.sqrt(b[0]*b[1])),col=h=>h.map(v=>v/255);
 return bands.map((b,i)=>({dist:dist[i],profile:P[i],
  /* snow and forest lines in metres over the eye at the band's distance (the shader compares dist tan(el)) */
  snowH:4400-y0,forestH:(STAGE.forestLine==null?3200:STAGE.forestLine)-y0,haze:STAGE.ridgeHaze==null?[.55,.45,.4][i]:STAGE.ridgeHaze[i],
  rock:col(i===0?[150,140,118]:[128,116,104]),forest:col(i===0?[86,98,70]:[74,90,70]),snow:[.92,.94,.97]}));})();
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:STAGE.px[0],py:STAGE.px[1]},air:{pressure:STAGE.air.pressure,humidity:STAGE.air.humidity},
 clouds:{cover:STAGE.cloudCover==null?.42:STAGE.cloudCover},fogDensity:STAGE.fogDensity==null?.00005:STAGE.fogDensity,ridges:SKY_RIDGES}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);
 /* the echoes: faint at dusk and dawn (the sun from +6 to -8 degrees, strongest just after it sets), nothing by day or by night */
 const a=SKY.state.sunAlt;if(CUT.echoLight)CUT.echoLight(.55*Math.max(0,1-Math.abs(a+1)/7));}
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
