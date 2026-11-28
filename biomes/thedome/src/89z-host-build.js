/* ================================================================= HOST — world build, impostors, S1 horizon, B4 A2C & KSHADOW (off at load; [web]) */
const WATER_F=WATER.fields({
 box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],
 cell:8,ground:terrainH,
 surfaces:WATER.surfaces.filter(q=>q.kind!=='fall'&&q.kind!=='geyser'&&q.kind!=='fumarole')
});
const WATER_FN=WATER.fieldFns(WATER_F);
const ENV=BIO.env({ground:DRAWN_H,water:WATER_FN,wet:(x,z)=>FIELD.wet(x,z),rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[0,220],flow:10}});

window._biome=null;
window._shadow=null;
const IMP_GAIN=2.2;
/* Strict owner rule: KSHADOW is OFF at default page load; ?shadow=1 or UI button attaches it on demand */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;

function toggleDomeShadow(){
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
 if(Q.has('nobake')){
  window._stats=JSON.parse(JSON.stringify(BIO.stats));
  window._instances=0;window._bakeCalls=0;
  return;
 }
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;

 /* B2 base contact grounding on merged bark buckets + bind library bark texture to any BIO.kin far-LOD mesh */
 scene.traverse(o=>{
  if(o.isMesh&&!o.isInstancedMesh&&o.userData&&o.userData.biome&&o.name&&/td_pine|td_cedar|td_gnarled|td_amber|td_birch|td_cherry|td_chitin/.test(o.name)){
   if(typeof TD_VSTACK!=='undefined')TD_VSTACK.groundMeshBase(o.geometry,DRAWN_H);
  }
  if(o.isMesh&&o.name==='biome:far'&&o.material&&!o.material.map&&THEDOME.M['bark.cedar']&&THEDOME.M['bark.cedar'].map){
   o.material.map=THEDOME.M['bark.cedar'].map;
   o.material.needsUpdate=true;
  }
 });
 {const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}
 if(BIO.impostorLook)BIO.impostorLook({gain:Q.has('impgain')?+Q.get('impgain'):IMP_GAIN,wrap:Q.has('impwrap')?+Q.get('impwrap'):1});
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}}
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){
  try{window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});}
  catch(e){reportErr('horizon: '+e.stack);}
 }
 if(SHADOW_ON){
  try{toggleDomeShadow();}catch(e){reportErr('shadow: '+e.stack);}
 }
 if(typeof TD_VSTACK!=='undefined'){
  TD_VSTACK.finalize(MAT_GROUND,renderer);
 }else{
  BIO.setA2C(renderer);
 }
 window._buildMs=Math.round(performance.now()-t0);
 if(typeof samplersOf==='function')window._units.final=samplersOf(MAT_GROUND);
 {
  let lo=1e9,hi=-1e9;
  for(let z=-TERR.R;z<=TERR.R;z+=90)for(let x=-TERR.R;x<=TERR.R;x+=90){
   if(Math.hypot(x,z)>TERR.R)continue;
   const h=DRAWN_H(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);
  }
  REGISTER({name:STATION_REGION,x:0,z:0,y:Math.floor(lo-12),r:TERR.R,h:Math.ceil(hi-lo+65)});
 }
})();
