// ================================================================= HOST — the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so the lava, the fume, the
// weather and the air's load can take the page. The hour is the shared sky's clock.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
// the wind (R8): the Pele's hair mats stir in core/atmos's wind and its gusts (thin air carries little, but it blows: PLAN.md
// section 2); cut-outs by alpha-to-coverage where the canvas has MSAA (R7)
BIO.bindAtmosWind();BIO.setA2C(renderer);
// THE WEATHER (ATMOS.bindWeather): ash, nothing else (PLAN.md section 2: no rain falls, no snow to speak of). 'ashfall' is
// the halo's glass sifting down after a fountain; 'ash' the vent's dirty storm (the warm branched lightning of
// fx/89-atmos-fx-lightning.js). It starts clear. climate.dry: no wet ground; the haze the colour of the black beads
ATMOS.bindWeather({climate:{ash:true,dry:true,dust:[.36,.32,.3]},sun,hemi,grounds:GROUND?[GROUND.material]:[]});
// THE AIR'S LOAD (fx/89-atmos-fx-airload.js): the ash in mg/m3 where it falls, most near the vent (the halo's own law), and
// the sight it leaves; the fog becomes that sight when the ash is thicker than the thin air's own (nothing, by day)
const AIRLOAD=ATMOS.airLoad({ashAt:(x,z)=>clamp(.35+.65*Math.exp(-Math.hypot(x-VENT.x,z-VENT.z)/3000),0,1)});
// THE AIR and the cold (core/hazard's ambient bridge): the sky's pressure by height; the temperature, the summit's held
// mean (4.23: about -75 C above 17 km; the ground's is the sun's, not the air's: PLAN.md section 1) swinging with the sun
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
/* the mean by height from PLAN.md section 1's table (the 4.22 bands; held at -75 above 17 km), the day's swing wider the thinner the air */
const TEMP_BANDS=[[5500,-10],[6500,-15],[7500,-21],[8500,-27],[10500,-39],[14500,-66],[17000,-75]];
function tempMean(y){const B=TEMP_BANDS;if(y<=B[0][0])return B[0][1];for(let i=1;i<B.length;i++)if(y<=B[i][0])return mix(B[i-1][1],B[i][1],(y-B[i-1][0])/(B[i][0]-B[i-1][0]));return B[B.length-1][1];}
KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+mix(8,22,smooth(9000,17000,y))*clamp(e*2.2,-1,1);});
