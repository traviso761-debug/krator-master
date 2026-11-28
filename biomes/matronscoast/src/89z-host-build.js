// ================================================================= HOST — world build, Sister-Cup sky-ponds, post-bake & KSHADOW ([web])
const WATER_F=WATER.fields({
 box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],
 cell:8,
 ground:DRAWN_H,
 surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='geyser'&&q.kind!=='fumarole')
});
const WATER_FN=WATER.fieldFns(WATER_F);
const WET_SHORE=(x,z)=>{const s=WATER_FN.shore(x,z);return s===s?smooth(15,1,s):0;};
const ENV=BIO.env({
 ground:DRAWN_H,
 water:WATER_FN,
 wet:(x,z)=>FIELD.wet(x,z),
 rock:(x,z)=>FIELD.rock(x,z),
 bands:{upland:[0,180],flow:12}
});

{
 const a=GROUND.geometry.attributes.aWet,p=GROUND.geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);
  a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.8,0.10,p.getY(i)-w):0.2));
 }
 a.needsUpdate=true;
}

window._biome=null;
window._shadow=null;
const IMP_GAIN=2.30;
/* Owner rule: KSHADOW is strictly OFF at default page load; ?shadow=1 or UI toggle attaches it on demand */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;

function toggleSnailShadow(){
 if(typeof KSHADOW==='undefined'||!KSHADOW.attach)return false;
 if(!window._shadow){
  window._shadow=KSHADOW.attach({renderer:renderer,scene:scene,camera:camera,sun:sun,ground:DRAWN_H});
  window._shadow.cast(scene);
  window._shadow.cast(GROUND,{cast:false});
  if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  return true;
 }
 renderer.shadowMap.enabled=!renderer.shadowMap.enabled;
 return renderer.shadowMap.enabled;
}

(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(typeof STATION_BUILD==='function'){
  try{window._station=STATION_BUILD(q);window._biome=window._station;}
  catch(e){reportErr('station: '+e.stack);}
 }

 /* Batched elevated Paired Sister-Cup Cistern Sky-Pond amber rainwater lenses in ONE draw call! */
 if(MATRON.SKY_PONDS&&MATRON.SKY_PONDS.length&&WATER.still&&WATER.drawPools){
  const skySurfs=[];
  for(let i=0;i<MATRON.SKY_PONDS.length;i++){
   const sp=MATRON.SKY_PONDS[i];
   const surf=WATER.still({name:'Sister-Cup Cistern Sky-Pond '+(i+1),level:sp.level,poly:sp.poly});
   surf._sisterCup=sp;
   skySurfs.push(surf);
  }
  WATER.drawPools(skySurfs,{
   name:'Paired Sister-Cup Cistern Sky-Pond rainwater lenses',
   roughness:0.05,
   metalness:0.14,
   envMapIntensity:0.65,
   renderOrder:2,
   pick:true,
   gradient:{centre:0x4e2c0a,rim:0xb88424,power:1.35}
  });
  window._water.skyPonds=skySurfs.length;
  window._water.surfaces=WATER.surfaces.length;
 }

 if(Q.has('nobake')){
  window._stats=JSON.parse(JSON.stringify(BIO.stats));
  window._instances=0;window._bakeCalls=0;
  return;
 }
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;

 if(typeof MC_VSTACK!=='undefined'){
  MC_VSTACK.applyPostBake(DRAWN_H,MATRON.CROWNS);
  MC_VSTACK.enableA2C(renderer);
  MC_VSTACK.noteDrawn();
 }else{
  BIO.setA2C(renderer);
 }

 {const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}
 if(BIO.impostorLook)BIO.impostorLook({gain:Q.has('impgain')?+Q.get('impgain'):IMP_GAIN,wrap:Q.has('impwrap')?+Q.get('impwrap'):1});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(ATMOS.cloudShadeScene){
  try{ATMOS.cloudShadeScene(scene,{biome:0.42,host:0.65,leave:/^biofauna|^mc-walker/});}catch(e){}
 }
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){
  try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}
  catch(e){reportErr('horizon: '+e.stack);}
 }
 if(SHADOW_ON){
  try{toggleSnailShadow();}catch(e){reportErr('shadow: '+e.stack);}
 }
 window._buildMs=Math.round(performance.now()-t0);
 if(typeof samplersOf==='function')window._units.final=samplersOf(MAT_GROUND);
 {
  let lo=1e9,hi=-1e9;
  for(let z=-TERR.R;z<=TERR.R;z+=80)for(let x=-TERR.R;x<=TERR.R;x+=80){
   if(Math.hypot(x,z)>TERR.R)continue;
   const h=rawTerrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);
  }
  REGISTER({name:STATION_REGION,x:0,z:0,y:Math.floor(lo-8),r:TERR.R,h:Math.ceil(hi-lo+68)});
 }
})();
