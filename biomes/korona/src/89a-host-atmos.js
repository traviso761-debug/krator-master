// ================================================================= HOST - the atmosphere (core/atmos), bound
// ATMOS.bindHost (core/atmos/host/89-atmos-c-hostbind.js): core/atmos's one-time init on this page's frame ticks, ground and camera,
// so core/water (the stream, the pools: 89w-host-water.js) and its wave field and skylight can take it. The binding alone draws
// nothing and changes no page value. The hour is the host clock's where the page has one (the shared sky's), else 13.
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:13,
 seed:(STAGE.seed==null?11:STAGE.seed)+4400,viewH:()=>innerHeight});
// THE WEATHER (core/atmos/host/89-atmos-e-weatherhost.js, 2026-10-26): the station's climate (STAGE.climate), wet where it names none
// (the tepui, the basin's lake and rainforest, the pitcher hollow, the trenches' windward face: rain, storms, the fog); the lee gorge
// dry (the rain shadow); the hoar table cold and frozen, its old snow the base (STAGE.snowBase). It starts clear, so every station looks
// as it did; the Weather selector in the panel picks the rest.
ATMOS.bindWeather({climate:STAGE.climate||{wet:true},sun,hemi,grounds:[MAT_GROUND],snowBase:STAGE.snowBase});
// ================================================================= the final rebuild's air (BACKPORT.md section 1 and Korona's row; xanadu's lines; 2026-11-03)
// Each look change has its switch (PLAN.md, "Core adoption"):
//   R8          the foliage sways in core/atmos's wind and its gust fronts (BIO.bindAtmosWind); cut-outs by alpha-to-coverage after the bake (89z)
//   R1 ?hfog=0  height fog: the station's air thick in its hollows and over its water, thinning up the walls
//   ?belt=0     THE FOG BELT ON THE TEPUIS (BACKPORT.md Korona's row): the wet trade wind from the north-west forced up the walls condenses as a broken
//               belt on their windward faces, the cloud the summits stand in and out of (NOTES.md, "The ground"); a station sets STAGE.belt (null: none,
//               as the dry lee gorge and the hoar table above its cloud sea); by default the band from a third of the way up the highest body to its top
//   R10         the rain occlusion map: no rain under a crown or an overhang (lightning rides with the weather's storm: fx/89-atmos-fx-lightning.js)
//   R9          wet ground and puddles: NOT taken (oidong's finding: WATER.wetGround over a KGROUND floor drew the ground black in clear weather, not
//               traced; ?wet=1 asks for it to look); the weather's own wetting (bindWeather's grounds) stays
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,belt:false,raincover:false,wet:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){
  /* the belt by default: none in a dry station (the lee gorge); on the hoar table (frozen) only on the lower wall, the cloud sea it stands over */
  const CL=STAGE.climate||{},WW=typeof WIND!=='undefined'?WIND:[-Math.SQRT1_2,-Math.SQRT1_2];
  let B=STAGE.belt;if(B===undefined&&!CL.dry){let hi=null;STAGE.bodies.forEach(b=>{if(!hi||b.top-b.y0>hi.top-hi.y0)hi=b;});const H=hi?hi.top-hi.y0:0;
   B=hi?(CL.frozen?{y0:hi.y0,y1:hi.y0+H*.55,windward:WW}:{y0:hi.y0+H*.33,y1:hi.top+40,windward:WW}):null;}
  const LV=STAGE.pools.filter(p=>p.y!=null&&!p.ice).map(p=>p.y),W0=LV.length?Math.min(...LV):(STREAM_?streamBed(0)+STREAM_.depth:null);   /* the mist over the lowest water */
  ATMOS.heightFog({falloff:1/600,sun:.3,sky:.35,mist:W0==null?undefined:{density:.001,y:W0+8,depth:12,noise:.7}});
  if(B&&Q.get('belt')!=='0'&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt({y0:B.y0,y1:B.y1,windward:B.windward,density:B.density==null?.0008:B.density,depth:50,lee:.25,rise:.5,
   extent:[-TERR.R*3,-TERR.R*3,TERR.R*3,TERR.R*3],res:128,steps:8});out.belt=true;}
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 if(Q.get('wet')==='1'&&WATER.hollows&&WATER.wetGround){try{const R=TERR.R*1.05,box=[-R,-R,R,R];
  WATER.wetGround(MAT_GROUND,{rain:true,porosity:.7,puddles:WATER.hollows({h:(x,z)=>terrainH(x,z),box,cell:(box[2]-box[0])/512,blur:25,depth:.5,mask:(x,z)=>waterMask(x,z)<1||FIELD.rock(x,z)>.6?0:1})});out.wet=true;}
  catch(e){reportErr('wet ground: '+e.stack);}}
 return out;})();
