// ================================================================= HOST — the atmosphere (core/atmos), bound: THE NORTH WALL in the wet season
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost). The hour is the shared sky's clock.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
// the wind: the spiral trees' own sway (their kit's), the red stalks welded; cut-outs by alpha-to-coverage where the canvas has MSAA
BIO.bindAtmosWind();BIO.setA2C(renderer);
// HEIGHT FOG (?hfog=0): the wet season's cloud on the wall, thick at the foot and in the forest, thinning with height (the falls' spray adds its own)
const AIRFX={hfog:false};
{const q=new URLSearchParams(location.search);if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/700,sun:.35,sky:.3});ATMOS.heightFogScene(scene);AIRFX.hfog=true;}}
// THE WEATHER (ATMOS.bindWeather): the wet season on the valley's one wet side (957-990 mm, Csa/Cfa: PLAN.md section 1): showers off the
// north arm; it starts clear. The ground is wetted by the rain (not dry)
ATMOS.bindWeather({climate:{dry:false,cold:false},sun,hemi,grounds:[]});
// THE AIR and the warmth (core/hazard's ambient bridge): the sky's pressure by height (1.21 atm at the springs); the wet season's day at this
// height (PLAN.md section 7: +12 C mean, 23/+1), swinging with the sun
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
function tempMean(y){return 9+(2268-y)*.0055;}
KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+6*clamp(e*2.2,-1,1);});
