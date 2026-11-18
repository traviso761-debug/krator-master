// ================================================================= HOST — atmosphere and weather binding (core/atmos; [G data])
// Binds core/atmos to the host clock, attaches height fog in the rift trough, checks the sampler-guarded rain cover,
// and connects the weather selector to MAT_GROUND.
ATMOS.bindHost({
 THREE,scene,camera,renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13.5,
 seed:5141,
 viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:1/260,sun:.32,sky:.28});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: the ground reads '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }
 return out;
})();
ATMOS.bindWeather({climate:{wet:true},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
