// ================================================================= HOST - the atmosphere (core/atmos), bound
// 2026-10-20, phase 0 of the water migration: core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water
// (WATER.draw, drawStill: they need ATMOS.init, and for the sky in the water the skylight) and the open world's one clock can take
// this biome. The binding alone draws nothing (ATMOS.root is an empty group) and changes no page value: the dome, fog, sun and the
// page's own water stay as they were. The hour is the page's sun, fixed (13); the module's clock is the host's dt.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>13,seed:8112,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): dry: the crater floor in the Throne's rain shadow, hot and dry, burnt over; the haze goes the colour of dust. It starts clear, so the page looks as it did;
// the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:{dry:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// THE FINAL REBUILD'S AIR (pair 12, 2026-11-09; BACKPORT.md section 1's air row and the kit's row: dust; nsemiarid's lines), each with its switch:
//   R1 (?hfog=0)  height fog: the dense air's haze thick on the crater floor, thinning up the kopjes
//   R10           the rain occlusion map: no rain under a crown (the parasol pines, the ghost gums)
//   R9            not taken: the climate is dry (the weather never wets this ground), and the wet ground's rain map is a texture unit the ground keeps
//                 for KGROUND's layers and the horizon (84, 87)
//   THE DUST (core/atmos 3d-dust): lifted where the wind there passes the threshold, off bare dry ground: the fresh burns' ash most (char under a year,
//                 the stage the kit calls `char`), the washes' sand next, the old scrub little; nothing off the granite or the seep
//   THE AIR'S LOAD (fx/airload; ?dust=0 none): the dust in mg/m3, the fog drawn from it, KHAZ's dust and visibility fields (core/hazard); the panel's
//                 air select (or ?storm=1) brings in a dust storm off the burnt plain
//   THE SEASON'S DUST (fx/dustseason, 2026-11-09; ?dustseason=0 none): the dry season drives what the wind lifts: the air's local dust times the
//                 season's share (a quarter in the wet, all of it at the height of the dry; core/clock's season at the page's day and hour), and
//                 the dust's mask with it (the sprites follow at each re-bake of their height map, ~50 m of camera travel). A storm is weather:
//                 the panel's storm is not scaled
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,load:null,storm:0};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/700,sun:.35,sky:.25});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
const CD_DUST_MASK=(x,z)=>{if(waterH(x,z)>-1e8)return 0;const rock=FC.at(FC.a.rock,x,z),flow=FC.at(FC.a.flow,x,z),S4=CRATERDRY.stages(FIRE.ageAt(x,z));
 return smooth(.5,.2,rock)*smooth(.5,.2,FC.at(FC.a.oasis,x,z))*Math.max(S4.char*1,smooth(.3,.7,flow)*.7,S4.bloom*.25+S4.regrow*.2+S4.mature*.3);};
let CD_SEASON=null;   /* the season's dust (below): its share k, read by the mask the sprites bake */
const CD_DRY=()=>{const C=typeof KHOST!=='undefined'&&KHOST&&KHOST.host?KHOST.host.clock:null;return C&&typeof KCLOCK!=='undefined'&&KCLOCK.season?KCLOCK.season(C.day,C.hour,{sharp:1.5}).dry:.5;};
if(ATMOS.dust)ATMOS.dust({color:[.62,.54,.46],mask:(x,z)=>CD_DUST_MASK(x,z)*(CD_SEASON?CD_SEASON.k:1)});
if(new URLSearchParams(location.search).get('dust')!=='0'&&ATMOS.airLoad){try{AIR.load=ATMOS.airLoad({colour:[.66,.56,.46]});AIR.storm=+(new URLSearchParams(location.search).get('storm')||0);AIR.load.stormTo=clamp(AIR.storm,0,1);}catch(e){reportErr('air load: '+e.stack);}}
if(new URLSearchParams(location.search).get('dustseason')!=='0'&&ATMOS.dustSeason){try{CD_SEASON=ATMOS.dustSeason({dry:CD_DRY,air:AIR.load});}catch(e){reportErr('dust season: '+e.stack);}}
// the panel's air select (99-host-take.js hands it to the host): a calm day, or a dust storm off the burnt plain
const AIR_CONTROL=AIR.load?{select:[['calm','air: calm'],['storm','air: a dust storm']],id:'airsel',on:v=>{if(AIR.load)AIR.load.stormTo=v==='storm'?1:0;}}:null;
if(AIR_CONTROL&&AIR.storm>0)AIR_CONTROL.select.reverse();
