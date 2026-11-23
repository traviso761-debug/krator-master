// ================================================================= HOST — build order, water fields, impostors & KSHADOW (off at load)
const WATER_F=WATER.fields({
 box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],
 cell:16,ground:terrainH,
 surfaces:WATER.surfaces.filter(q=>q.kind!=='fall')
});
const WATER_FN=WATER.fieldFns(WATER_F);
const WET_SHORE=(x,z)=>smooth(26,1,WATER_FN.shore(x,z));
const ENV=BIO.env({
 ground:terrainH,water:WATER_FN,
 wet:(x,z)=>FIELD.wet(x,z),
 rock:(x,z)=>FIELD.rock(x,z),
 bands:{upland:[25,145],flow:45}
});
if(new URLSearchParams(location.search).get('fields')!=='0'){
 const W0=FIELD.wet,F0=FIELD.flow;
 FIELD.wet=(x,z)=>{
  const s=WATER_FN.shore(x,z);
  if(s!==s)return W0(x,z);
  return clamp(Math.max(W0(x,z)*smooth(-1,3,s)+(1-smooth(-1,3,s)),0.94*smooth(52,5,s)),0,1);
 };
 FIELD.flow=(x,z)=>{
  const d=WATER_FN.flow(x,z);
  return d==null||d!==d?F0(x,z):clamp(Math.max(F0(x,z)*smooth(-1,3,WATER_FN.shore(x,z)),smooth(28,4,d)),0,1);
 };
}
{
 const a=GROUND.geometry.attributes.aWet,p=GROUND.geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),w=waterH(x,z);
  a.setX(i,WET_SHORE(x,z)*(w>-1e8?smooth(2.6,0.2,p.getY(i)-w):1));
 }
 a.needsUpdate=true;
}

window._biome=null;
const IMP_GAIN=2.6;
/* Owner rule (2026-11-03): KSHADOW is OFF at page load; ?shadow=1 attaches it on demand */
const SHADOW_ON=new URLSearchParams(location.search).get('shadow')==='1'&&typeof KSHADOW!=='undefined'&&!!KSHADOW.attach;

(function(){
 const t0=performance.now();
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 if(typeof STATION_BUILD==='function'){
  try{
   window._station=STATION_BUILD(q);
   window._biome=window._station;
  }catch(e){reportErr('station: '+e.stack);}
 }
 if(Q.has('nobake')){
  window._stats=JSON.parse(JSON.stringify(BIO.stats));
  window._instances=0;window._bakeCalls=0;
  return;
 }
 const b=BIO.bake();
 window._instances=b.inst;
 window._bakeCalls=b.calls;
 BIO.setA2C(renderer);
 {const G=TERR.R*1.1;BIO.setGround(TEX_GROUND,[-G,G,G,-G]);}
 if(BIO.impostorLook){
  const gVal=Q.has('impgain')?+Q.get('impgain'):IMP_GAIN;
  const wVal=Q.has('impwrap')?+Q.get('impwrap'):1;
  BIO.impostorLook({gain:gVal,wrap:wVal});
 }
 if(BIO.bakeImpostors){
  try{BIO.bakeImpostors(renderer,{wait:180});}catch(e){reportErr('impostors: '+e.stack);}
 }
 if(typeof GROUND_HZ!=='undefined'&&GROUND_HZ){
  try{
   window._horizon.mats=KHORIZON.shadeScene(scene,GROUND_HZ,{filter:m=>!m.userData.farField&&m!==MAT_GROUND});
  }catch(e){reportErr('horizon: '+e.stack);}
 }
 if(SHADOW_ON){
  try{
   window._shadow=KSHADOW.attach({renderer,scene,camera,sun,ground:terrainH});
   window._shadow.cast(scene);
   window._shadow.cast(GROUND,{cast:false});
   if(FAR)FAR.mesh.castShadow=FAR.mesh.receiveShadow=false;
  }catch(e){reportErr('shadow: '+e.stack);}
 }
 window._buildMs=Math.round(performance.now()-t0);
 if(typeof samplersOf==='function')window._units.final=samplersOf(MAT_GROUND);
 {
  let lo=1e9,hi=-1e9;
  for(let z=-TERR.R;z<=TERR.R;z+=100)for(let x=-TERR.R;x<=TERR.R;x+=100){
   if(Math.hypot(x,z)>TERR.R)continue;
   const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);
  }
  REGISTER({
   name:(typeof STATION_REGION!=='undefined'&&STATION_REGION)||'The Great Double Delta',
   x:0,z:0,y:Math.floor(lo-10),r:TERR.R,h:Math.ceil(hi-lo+60),ground:true
  });
 }
})();
