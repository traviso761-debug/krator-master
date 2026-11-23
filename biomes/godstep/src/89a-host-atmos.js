// ================================================================= HOST — the atmosphere (core/atmos), bound
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so the weather, the fog and the air's
// load can take the page. The hour is the shared sky's clock.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
// the wind: the pioneers are welded to the ground (nothing sways); cut-outs by alpha-to-coverage where the canvas has MSAA
BIO.bindAtmosWind();BIO.setA2C(renderer);
// HEIGHT FOG (?hfog=0): a cold steppe's haze, thick at the floors and thinning with height, so the front and the Godthrone stand out of it
const AIRFX={hfog:false};
{const q=new URLSearchParams(location.search);if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/1100,sun:.3,sky:.25});ATMOS.heightFogScene(scene);AIRFX.hfog=true;}}
// THE WEATHER (ATMOS.bindWeather): a cold steppe in late winter (94-157 mm, PLAN.md section 1): snow showers off the Godthrone and dust off
// step 2's black sand in a wind; it starts clear. climate.dry: the ground is not wetted (the paint carries the snow that lies)
ATMOS.bindWeather({climate:{dry:true,cold:true,dust:[.24,.22,.21]},sun,hemi,grounds:[]});
// THE AIR and the cold (core/hazard's ambient bridge): the sky's pressure by height; the temperature the late-winter day's at this height
// (PLAN.md section 7: +9 to +12 C mean, the cold month -4 to -1 C, night lows -11 to -15; late winter: the cold month's, swinging with the sun)
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
function tempMean(y){return -2.5+(3121-y)*.0052;}
KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+9*clamp(e*2.2,-1,1);});
