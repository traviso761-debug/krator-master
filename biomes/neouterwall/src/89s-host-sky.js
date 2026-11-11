// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky, SKY-PLAN.md step S1) at the station
// ATMOS.sky draws the sky as a background pass at the station's own pixel on the scale model (its latitude, the giant where it hangs
// from there), with the real sun, the giant, its ring, the moons, the station, the cluster and the clouds at the host clock's hour
// and the season's day, and sets the sun, the hemisphere, the fog and the exposure from the colour script. The air is the model's: 1.11
// atm at the tarn, wet (2,494 mm), the springs' steam in the cauldron: humid, a grey-green haze.
// THE FAR LAND is cast from the scale model's heightfield at the station (region/far.py: SKY-PLAN.md 3.3's "a horizon profile cast
// from the scale model at the site"): three bands of distance beyond the page's own ground (20 km), each the highest elevation
// angle of the model's ground at 1024 azimuths, with the planet's curvature; its rock the skarn's greys and greens, its forest the woods'
// colour of the season below the tree line, its snow above the season's snow line. The cut reaches 320 km round the station
// (region/horizon.json): south the wall climbs to the airless crest over Korona, north the lowland falls to Spider Lake.
// The page opens at SITE.hour (13:00 at station 1: 44s) on the season's day (45: SEASON_DAY; #hour=, #day= and #time=run move it, as the host's slider does).
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):SEASON_DAY;return isFinite(d)?d:SEASON_DAY;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:(SITE.hour==null?10:SITE.hour);},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
// the far land's colours (display RGB): the season's snow line (absolute metres), the tree line (the woods' top: the warmest month
// +7.5 °C on the cauldron's swing, SITE.amp)
const SNOWLINE={autumn:4400,winter:3200,spring:4000,summer:6200}[SEASON],TREELINE=BASE+(NEOW_REGION.site.mean+(SITE.warm||0)+NEOW.AMP.warm-7.5)/6.5*1000;
const RIDGE_FOREST={winter:[.32,.32,.28],autumn:[.42,.38,.22],spring:[.26,.32,.2],summer:[.22,.3,.18]}[SEASON];
const SKY_RIDGES=NEOW_REGION.ridges.slice().reverse().map((b,i)=>({profile:b.profile.slice(),dist:b.dist,
 snowH:SNOWLINE-(BASE+NEOW_REGION.eye),forestH:TREELINE-(BASE+NEOW_REGION.eye),haze:1,rock:[.5,.5,.46],forest:RIDGE_FOREST,snow:[.92,.94,.97]}));
// the weather's light and air for the sky (core/atmos's weather, bound in 89a): cloud and grey with the rain and the snow, fog
const SKY_WEATHER=()=>{const W=ATMOS.W;if(!W)return null;const r=W.rain||0,s=W.snow||0,f=W.fog||0;return {cover:Math.min(1,r*.6+s*.75+f*.2),grey:Math.min(1,r*.8+s*.85),fog:Math.min(1,f+s*.7)};};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:NEOW_REGION.site.px,py:NEOW_REGION.site.py},air:{pressure:ATM,humidity:.75,turbidity:1.1},
 clouds:{cover:SEASON==='summer'?.4:SEASON==='winter'?.55:.45},fogDensity:.00008,ridges:SKY_RIDGES}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true,weather:SKY_WEATHER});
// the fill light keeps its share of the day and goes out at night (the giantshine light takes the night)
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed: 99-host-take.js subscribes it */
// THE CLOUDS' SHADE, THE WEATHER AND THE SNOW ON THE SCENE are bound in 89z-host-build.js, after the bake (the final rebuild, pair 11): they
// ran here, after the build when it was 88; it is 89z now (after the water), so they follow it. core/atmos chains them on KHOOK now, so their order is free (the recursion
// this page once worked round, cloudShade after WATER.wetGround, is gone with it)
