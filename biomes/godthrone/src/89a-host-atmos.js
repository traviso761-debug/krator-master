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
