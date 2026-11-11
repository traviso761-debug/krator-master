// ================================================================= HOST - the atmosphere (core/atmos), bound, and the final rebuild's air (2026-11-03)
// core/atmos's one-time init on this page's frame ticks, ground and camera (2026-10-20), so core/water and the open world's one clock can take this
// biome; the hour is the host clock's. What the final rebuild added (BACKPORT.md section 1, the air row; each look change has its switch):
//   R8 + R7      the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind; the KNOWN_ISSUES item "No core/atmos" closes); cut-outs
//                by alpha-to-coverage (89z, after the bake)
//   R1 (?hfog=0) height fog: the dust's haze low over the flats and the canyon, thinning up the walls
//   R10          the rain occlusion map: no rain and no wet ground under a crown
//   R9 (?wet=1)  in the rain the ground darkens and glosses and its hollows hold puddles; off by default here (below)
//   SNOW (?snow=0) snow that lies (fx/snowcover), on the station's own line (SNOW_LINE, from its site); 
// THE CLIMATE (5.1, read 2026-11-09): 125-173 mm a year on the plateau, BSk and Dsb, winters under freezing: the weather `cold`; the cliff town's wall
// (862 mm, Cfa) is the wet edge (PLAN.md section 3).
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,seed:8206+SITE.n,viewH:()=>innerHeight});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false};
 const R=TERR.R*1.05,BOX=[-R,-R,R,R],under=(x,z)=>{const w=waterH(x,z);return w>-1e8&&w>=terrainH(x,z)-.3;};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/(SKEY==='cliff'?700:520),sun:.3,sky:.3});ATMOS.heightFogScene(scene);out.hfog=true;}
 /* the rain's occlusion map takes a unit in every lit material: only where the ground keeps it beside the snow and the weather (85: RAIN_FITS) */
 if(ATMOS.rainCover&&RAIN_FITS){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 else if(ATMOS.rainCover)out.raincover='skipped: the ground reads '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 /* R9 on ?wet=1 only (highrift's finding: WATER.wetGround over KGROUND's Standard ground drew it black in clear weather); 125-173 mm is dry */
 if(q.get('wet')==='1'&&WATER.hollows&&WATER.wetGround&&typeof USE_KG!=='undefined'&&USE_KG){try{
  const H=WATER.hollows({h:(x,z)=>terrainH(x,z),box:BOX,cell:(BOX[2]-BOX[0])/512,blur:25,depth:.5,mask:(x,z)=>under(x,z)||FIELD.flow(x,z)>.5||FIELD.rock(x,z)>.6?0:1});
  WATER.wetGround(MAT_GROUND,{rain:true,porosity:.5,puddles:H});out.wet=true;}catch(e){reportErr('wet ground: '+e.stack);}}
 if(q.get('snow')!=='0'&&ATMOS.snowCover){ATMOS.snowCover({line:typeof SNOW_LINE!=='undefined'?SNOW_LINE:[1950,2450],lee:.45,base:0})   /* the station's own (SNOW_LINE) */;out.snow=true;}   /* every lit material takes it after the bake (89z: snowOnScene) */
 return out;})();
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js): it starts clear, so the page looks as it did; the Weather selector in the panel picks the rest
ATMOS.bindWeather({climate:{cold:SKEY!=='cliff'},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
// THE DUST SEASON (PLAN.md section 3; crater-drylands' lines, core/atmos fx airload + dustseason): the north-west wind lifts the playas' and the bare
// clay's dust in late summer, light. Its dryness is the bloom's calendar (41), not the monsoon's: none in the melt and the bloom, most in the straw.
// ?dust=0 none
const PH_DUST_MASK=(x,z)=>{if(waterH(x,z)>-1e8)return 0;return (1-smooth(.4,.7,FC.at(FC.a.rock,x,z)))*Math.max(FC.at(FC.a.flat,x,z),.6*FC.at(FC.a.bare,x,z),.4*FC.at(FC.a.flow,x,z));};
const PH_DRY=()=>{const B=PAINTED_BLOOM.at(SKY.clock.day,SKY.clock.hour);return Math.max(B.straw,.5*B.seed)*(1-B.snow);};
let PH_SEASON=null;
if(new URLSearchParams(location.search).get('dust')!=='0'&&SKEY!=='cliff'){
 if(ATMOS.dust){try{ATMOS.dust({color:[.80,.68,.58],mask:(x,z)=>PH_DUST_MASK(x,z)*(PH_SEASON?PH_SEASON.k:1)});AIR.dust=true;}catch(e){reportErr('dust: '+e.stack);}}
 if(ATMOS.airLoad){try{AIR.load=ATMOS.airLoad({colour:[.74,.62,.52]});}catch(e){reportErr('air load: '+e.stack);}}
 if(ATMOS.dustSeason){try{PH_SEASON=ATMOS.dustSeason({dry:PH_DRY,air:AIR.load,wet:.05});}catch(e){reportErr('dust season: '+e.stack);}}}
// THE COLD (PLAN.md section 6): KHAZ's ambient temperature, so a walker feels the winter the calendar draws. The station's warm and cold months (40)
// by the season (KCLOCK's summer, -1..1), the lapse of the air (6.5 degC a km from the station's height) and the day's swing (+-7 degC, warmest at
// 15:00, dry air). KHAZ.ambient reads it with the vocabulary's cold thresholds
const PH_TEMP=(x,y,z,t)=>{const S=SITE.temp,day=SKY.clock.day,hour=SKY.clock.hour,s=typeof KCLOCK!=='undefined'&&KCLOCK.season?KCLOCK.season(day,hour):{summer:0};
 return (S.warm+S.cold)/2+(S.warm-S.cold)/2*s.summer-6.5*((y==null?SITE.base:y)-SITE.base)/1000+7*Math.cos((hour-15)/24*Math.PI*2);};
if(typeof KHAZ!=='undefined'&&KHAZ.provide){try{KHAZ.provide('temperature',PH_TEMP);AIR.cold=true;}catch(e){reportErr('temperature: '+e.stack);}}
