// ================================================================= HOST — Krator's sky: the shared sky (core/atmos/sky) at the station's site
// (station 3, the skarn-marble cliffs) As the bay's page (src/89s), sited at the station's px on map 5.1 (734, 998: the plan's spot),
// the air the plan gives (1.92 atm; Csb, the dry summer: less humid than the bay's jungle, few clouds); the page opens at 06:00 on game
// start's day (#hour=, #day=, #time=run move it). The weather is the dry-summer coast's (core/atmos's selector; it starts clear); height
// fog with a thin mist on the raised platforms at dawn; no fog belt (the bay's rainforest slope is not here).
const SKY_DAY0=(()=>{const m=/[?&#]day=([^&#]*)/.exec(location.search+location.hash),d=m?+decodeURIComponent(m[1]):0;return isFinite(d)?d:0;})();
const skyHostClock=()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock:null;
const SKY_CLOCK={get hour(){const c=skyHostClock();return c?c.hour:ATMOS.SKY.viewHour;},get day(){const c=skyHostClock();return SKY_DAY0+(c?c.day||0:0);},
 get t(){const c=skyHostClock();return c?c.t:0;}};
const SKY=ATMOS.sky(ATMOS.skyPreset('standard',{site:{px:SITE.px,py:SITE.py},air:{pressure:1.92,humidity:.55},clouds:{cover:.3},fogDensity:.00009}),
 {renderer,camera,scene,sun,hemi:HEMI,clock:SKY_CLOCK,fog:true});
const SKY_FILL=fill.intensity;
function skyView(dt){SKY.update(dt);const L=SKY.look;fill.intensity=SKY_FILL*Math.min(1,L.sunI/2);BIO.setSun(SKY.state.sunDir);}   /* each frame once the camera is placed (99) */
ATMOS.cloudShadeScene(scene,{skip:(o,m)=>!!(m.userData&&m.userData.farField)});   /* the core's pass, the far field left out (Stage 8 V8, 2026-11-24) */
ATMOS.bindWeather({climate:{wet:false},sun,hemi:HEMI,grounds:[MAT_GROUND]});
if(Q.get('hfog')!=='0'){ATMOS.heightFog({falloff:1/600,sun:.4,sky:.3,mist:{density:.0012,y:14,depth:18,noise:.6}});ATMOS.heightFogScene(scene);}
ATMOS.rainCover({renderer});
