// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (2026-11-02)
// core/atmos's one-time init on this page's frame ticks, ground and camera, so core/water and the open world's one clock can take this biome; the hour
// is the host clock's. What the final rebuild added (BACKPORT.md section 1, the air row; each look change has its switch):
//   R8 + R7      the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the dust haze thick at the ground and thinning with height, so the range and the rims stand out of it (LAND.fog)
//   R10          the rain occlusion map: no rain and no wet ground under a crown or an overhang
//   R9 (?wet=0)  in the rain the ground darkens and glosses and its hollows hold puddles ringed by the drops; none under water, on the river or the pools.
//                Only on a land that rains (LAND.wet): the weather's dry climate never wets the ground, and it costs the ground two texture units (45)
//   SNOW (?snow=0) snow that lies (fx/snowcover): over the land's snow line (LAND.snowLine) it builds in a snowfall and melts after, the lee faces deeper
//   DUST (?dust=0) core/atmos's dust (3d-dust): sprites lifted off the bare dry ground of the hot waste and the badlands where the wind passes the
//                threshold, and THE AIR'S LOAD (fx/airload): the dust in mg/m3 the fog is drawn from, and KHAZ's dust and visibility fields (core/hazard).
//                ?storm=1 (or the panel's air select) brings in a dust storm off the hot waste
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:8111,viewH:()=>innerHeight});
BIO.bindAtmosWind();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): the land's climate (the transect: dry, a desert that rarely sees rain; the haze goes the
// colour of dust). It starts clear, so the page looks as it did; the Weather selector in the panel picks the rest.
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false,dust:false,load:null,storm:0};
 const R=TERR.R*1.05,BOX=[-R,-R,R,R],under=(x,z)=>{const w=waterH(x,z);return w>-1e8&&w>=terrainH(x,z)-.3;};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog(LAND.fog||{falloff:1/900,sun:.35,sky:.25});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 if(q.get('wet')!=='0'&&LAND.wet&&WATER.hollows){try{
  const H=WATER.hollows({h:(x,z)=>terrainH(x,z),box:BOX,cell:(BOX[2]-BOX[0])/512,blur:25,depth:.5,mask:(x,z)=>under(x,z)||FIELD.flow(x,z)>.5||FIELD.geo(x,z)>.3||FIELD.barren(x,z)>.5?0:1});
  WATER.wetGround(MAT_GROUND,{rain:true,porosity:.6,puddles:H});out.wet=true;}catch(e){reportErr('wet ground: '+e.stack);}}
 if(q.get('snow')!=='0'&&ATMOS.snowCover&&LAND.snowLine){ATMOS.snowCover({line:LAND.snowLine,lee:.45,base:LAND.snowBase||0,frozen:!!LAND.frozen});out.snow=true;}   /* every lit material takes it after the bake (89z: snowOnScene); the weather's cold modes then build on this cover */
 // where dust can rise: the bare dry ground of the hot waste, the badlands' clay and the playa; little off rock, wet ground, the vents' crust or the forest
 const MASK=(x,z)=>{if(under(x,z))return 0;const wet=FIELD.wet(x,z),hot=smooth(.3,.05,FIELD.cold(x,z));
  return clamp(hot*(.45+.55*Math.max(FIELD.polyg(x,z),FIELD.pave(x,z)*.6,FIELD.wash(x,z),FIELD.strata(x,z)*.7))*smooth(.45,.15,wet)*(1-.5*FIELD.rock(x,z))*(1-FIELD.geo(x,z)),0,1);};
 if(q.get('dust')!=='0'&&LAND.dust!==false&&ATMOS.dust&&ATMOS.airLoad){try{
  ATMOS.dust({color:[.82,.66,.52],mask:MASK});out.dust=true;
  out.load=ATMOS.airLoad({colour:[.70,.56,.44]});out.storm=+(q.get('storm')||0);out.load.stormTo=clamp(out.storm,0,1);}catch(e){reportErr('dust: '+e.stack);}}
 return out;})();
ATMOS.bindWeather({climate:LAND.climate||{dry:true,cold:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:LAND.wet?[MAT_GROUND]:[]});   /* a dry land's ground is never wetted (the weather's dry climate), and the wet ground's rain map is a texture unit the ground has not got (45) */
// the panel's air select (99-host-take.js hands it to the host): a calm day, or a dust storm coming in off the hot waste
const AIR_CONTROL=AIR.load?{select:[['calm','air: calm'],['storm','air: a dust storm']],id:'airsel',on:v=>{if(AIR.load)AIR.load.stormTo=v==='storm'?1:0;}}:null;
if(AIR_CONTROL&&AIR.storm>0)AIR_CONTROL.select.reverse();
