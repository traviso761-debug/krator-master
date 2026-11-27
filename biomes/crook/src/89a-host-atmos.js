// ================================================================= HOST — atmosphere, wind & weather binding (core/atmos; [web])
// Binds ATMOS wind gusts to BIO foliage (including east of the Silent Vales Great Hush threshold so seed-chimneys visibly sway
// in dead silence!), attaches trough/fog-belt height fog, and hooks weather & sampler-guarded rain cover.
ATMOS.bindHost({
 THREE:THREE,scene:scene,camera:camera,renderer:renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13.5,
 seed:5241,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind({gain:SKEY==='head'?1.25:1.0});

// Modulate ATMOS wind vector when [Canyon updraft] is toggled on Station 2 (wash)
if(ATMOS.U&&ATMOS.U.wind){
 const baseWx=SITE.wind[0],baseWz=SITE.wind[1];
 tick(()=>{
  const k=1+CROOK_STATE.updraftBoost;
  ATMOS.U.wind.value.set(baseWx*k,baseWz*k);
 });
}

const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,snowcover:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:SKEY==='shore'?1/220:SKEY==='wash'?1/280:1/340,sun:0.30,sky:0.32});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer:renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground uses '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }
 if(SKEY==='head'&&ATMOS.snowCover){
  try{
   ATMOS.snowCover({base:0.25,depth:0.15,line:[38,96]});
   out.snowcover=true;
  }catch(e){}
 }
 return out;
})();
ATMOS.bindWeather({
 climate:{wet:true,snow:SKEY==='head'},
 sun:sun,
 hemi:scene.children.find(o=>o.isHemisphereLight),
 grounds:[MAT_GROUND]
});
