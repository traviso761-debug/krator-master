// ================================================================= HOST — atmosphere, inverted canyon mist & ATMOS silk wind ([web])
// Binds ATMOS wind gusts to BIO foliage and ARACHNOIDS communal catenary Bridge-Webs (0.000 m drift at basalt-wall anchors),
// attaches inverted low-altitude slot-canyon height fog leaving upper Csa/ET rims crisp, and hooks live Clear / Slot-Mist / Rim-Gale modes.
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13.5,
 seed:5961,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='frostrim'?1.32:1.05});
if(typeof ARACHNOIDS.bindAtmosSilk==='function')ARACHNOIDS.bindAtmosSilk();

const BASE_FOG_DENS=scene.fog.density;
if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 tick(()=>{
  const k=ARACH_STATE.windGain;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
  scene.fog.density=BASE_FOG_DENS*(1.0+0.85*ARACH_STATE.mistBoost);
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,snowcover:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  // Steep falloff keeps warm river/fumarole mist pooled deep inside the slot chasms while upper Csa/ET rims stay crisp!
  const fall=SKEY==='fumarole'?1/115:SKEY==='nexus'?1/135:SKEY==='ledges'?1/165:1/210;
  ATMOS.heightFog({falloff:fall,sun:0.32,sky:0.34});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }
 if(SKEY==='frostrim'&&ATMOS.snowCover){
  try{
   ATMOS.snowCover({base:0.22,depth:0.14,line:[10,65]});
   out.snowcover=true;
  }catch(e){}
 }
 return out;
})();

ATMOS.bindWeather({
 climate:{wet:SKEY!=='frostrim',snow:SKEY==='frostrim'},
 sun:sun,
 hemi:scene.children.find(o=>o.isHemisphereLight),
 grounds:[MAT_GROUND]
});
