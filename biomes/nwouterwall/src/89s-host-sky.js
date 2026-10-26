// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md step S1) at the station
// ATMOS.sky draws the sky as a background pass at the station's own pixel on the scale model (its latitude, the giant where it hangs
// from there), with the real sun, the giant, its ring, the moons, the station, the cluster and the clouds at the host clock's hour
// and the season's day, and sets the sun, the hemisphere, the fog and the exposure from the colour script. The air is the model's:
// 0.77 to 0.90 atm, and dry (100-300 mm a year): a deep blue zenith, a clear long view, little haze.
// THE FAR LAND is cast from the scale model's heightfield at the station (region/far.py: SKY-PLAN.md 3.3's "a horizon profile cast
// from the scale model at the site"): three bands of distance beyond the page's own ground (20 km), each the highest elevation
// angle of the model's ground at 1024 azimuths, with the planet's curvature; its rock the steppe's straw, its forest the larch's
// colour of the season below the tree line, its snow above the season's snow line (autumn's first snow on the ranges, spring's
// lower, summer's on the polar desert and the ice).
// The page opens at 10:00 on the season's day (45: SEASON_DAY; #hour=, #day= and #time=run move it, as the host's slider does).
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):SEASON_DAY;return isFinite(d)?d:SEASON_DAY;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:10;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
// the far land's colours (display RGB): the season's snow line (absolute metres), the tree line (the larch's top: a mean of -3.5 °C)
const SNOWLINE={autumn:5600,winter:3800,spring:5150,summer:6700}[SEASON],TREELINE=BASE+(NW_REGION.site.mean+(SITE.warm||0)+3.5)/6.5*1000;
const RIDGE_FOREST={winter:[.36,.33,.28],autumn:[.55,.42,.20],spring:[.30,.32,.22],summer:[.24,.30,.18]}[SEASON];
const SKY_RIDGES=NW_REGION.ridges.slice().reverse().map((b,i)=>({profile:b.profile.slice(),dist:b.dist,
 snowH:SNOWLINE-(BASE+NW_REGION.eye),forestH:TREELINE-(BASE+NW_REGION.eye),haze:1,rock:[.50,.45,.36],forest:RIDGE_FOREST,snow:[.92,.94,.97]}));
// the weather's light and air for the sky (core/atmos's weather, bound in 89a): cloud and grey with the rain and the snow, fog
const SKY_WEATHER=()=>{const W=ATMOS.W;if(!W)return null;const r=W.rain||0,s=W.snow||0,f=W.fog||0;return {cover:Math.min(1,r*.6+s*.75+f*.2),grey:Math.min(1,r*.8+s*.85),fog:Math.min(1,f+s*.7)};};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:NW_REGION.site.px,py:NW_REGION.site.py},air:{pressure:ATM,humidity:.25,turbidity:.7},
 clouds:{cover:SEASON==='summer'?.35:SEASON==='winter'?.4:.25},fogDensity:.000045,ridges:SKY_RIDGES}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true,weather:SKY_WEATHER});
// the fill light keeps its share of the day and goes out at night (the giantshine light takes the night)
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// the clouds' shadows and the weather's darkening on the ground, the plants and the rock (SKY-PLAN.md 11.1): every lit material, once
{const seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material)return;for(const m of(Array.isArray(o.material)?o.material:[o.material])){
  if(seen.has(m)||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))continue;seen.add(m);
  ATMOS.cloudShade(m,{porosity:o.userData.biome?.4:o.userData.host?.6:1});}});}
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): a cold climate (snowfall and blizzards besides the base five); the ground
// wets in the rain. It starts clear, so the page looks as it is; the Weather selector in the panel picks the rest. The shared sky
// (89s) draws the weather's light and air from the colour script (its o.weather), so the binding is given no sun, hemisphere or
// fog of its own to scale: a stand-in fog takes its writes (the sky's own fog is the page's)
const WEATHER_FOG={color:new THREE.Color(0x9aa0a6),density:.00005};
/* bound after ATMOS.cloudShade: cloudShade chains a material's hook by reading and setting onBeforeCompile, and WATER.wetGround's
   setter would then call cloudShade's hook from inside itself (a recursion: core/atmos/host/89-atmos-h-skyhost.js, reported) */
ATMOS.bindWeather({climate:{cold:true},fog:WEATHER_FOG,grounds:[MAT_GROUND]});
// the snow last (89a bound its cover): snowOn wraps each material's shader hooks as they are now, cloud shade included
ATMOS.snowOnScene(scene);
