// ================================================================= HOST — the atmosphere (core/atmos), bound: THE REDLANDS (station 4)
// As src/89a (core/atmos's init on this page's frame, its height fog, its weather, the hazards' air), for the hot closed basin (PLAN.md
// section 7, station 4: BSk, +22 C mean (35/+9), summer highs to 44, 188-267 mm): a thin haze over the floor, salt dust off the pan in a wind
// (the weather's dust, its colour the crust's), no snow. The temperature for core/hazard: the day's at this height, swinging with the sun.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
// HEIGHT FOG (?hfog=0): the basin's heat haze, thick on the floor, so front 3 stands pale out of it
const AIRFX={hfog:false};
{const q=new URLSearchParams(location.search);if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/900,sun:.35,sky:.3});ATMOS.heightFogScene(scene);AIRFX.hfog=true;}}
// THE WEATHER: a hot steppe; dust off the pan and the steppe in a wind (pale: the salt's and the kaolin's); it starts clear
ATMOS.bindWeather({climate:{dry:true,dust:[.8,.76,.7]},sun,hemi,grounds:[]});
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
function tempMean(y){return 22+(880-y)*.0052;}
KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+11*clamp(e*2.2,-1,1);});
