// ================================================================= HOST — the atmosphere (core/atmos), bound: THE RILLE (station 2)
// core/atmos's one-time init on this page's frame ticks, ground and camera (ATMOS.bindHost), so the weather, the fog and the air's load can take
// the page. The hour is the shared sky's clock. Station 2 is early summer on the head step (PLAN.md section 7: +9 C mean, 22/-4, night low -15).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>SKY.clock.hour,seed:WORLD,viewH:()=>innerHeight});
BIO.bindAtmosWind();BIO.setA2C(renderer);
// HEIGHT FOG (?hfog=0): a dry steppe's haze, thin; the rille's floor a little hazier in the morning
const AIRFX={hfog:false};
{const q=new URLSearchParams(location.search);if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/1100,sun:.3,sky:.25});ATMOS.heightFogScene(scene);AIRFX.hfog=true;}}
// THE WEATHER (ATMOS.bindWeather): early summer on a cold steppe (110-125 mm): a shower off the Godthrone now and then, dust off the plain; it
// starts clear. climate.dry: the ground is not wetted (the spring's wet is the stream's own, 89w)
ATMOS.bindWeather({climate:{dry:true,cold:false,dust:[.3,.27,.24]},sun,hemi,grounds:[]});
if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
// THE TEMPERATURE: early summer's day at this height (warm month +22 at the floor's height, the nights cold); in the tube a steady +2 C, and the
// ice cave below freezing (the cold trap holds the winter's air)
function tempMean(y){return 13+(2990-y)*.0052;}
KHAZ.provide('temperature',(x,y,z)=>{if(CAVE.C&&y<terrainH(x,z)-3&&CAVE.C.sdf(x,y,z)>0){const ic=CAVE.caves.find(K=>K.kind==='ice'&&Math.hypot(x-K.x,z-K.z)<K.r+2);return ic?-2:2;}
 const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+9*clamp(e*2.2,-1,1);});
