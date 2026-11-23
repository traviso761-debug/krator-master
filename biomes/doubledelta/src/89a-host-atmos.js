// ================================================================= HOST — atmosphere binding, wind sway, height fog & weather (core/atmos)
ATMOS.bindHost({
 THREE,scene,camera,renderer,ticks:TICKS,
 ground:(x,z)=>terrainH(x,z),
 hour:()=>typeof KHOST!=='undefined'&&KHOST.host?KHOST.host.clock.hour:13,
 seed:8512,viewH:()=>innerHeight
});
if(BIO.bindAtmosWind)BIO.bindAtmosWind();
const AIR=(function(){
 const q=new URLSearchParams(location.search),out={hfog:false,raincover:false,wet:false,snow:false};
 if(q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:1/460,sun:0.32,sky:0.34});
  ATMOS.heightFogScene(scene);
  out.hfog=true;
 }
 if(ATMOS.rainCover&&RAIN_FITS){
  try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}
 }else if(ATMOS.rainCover){
  out.raincover='skipped: ground reads '+samplersOf(MAT_GROUND)+' of '+MAXT+' texture units';
 }
 return out;
})();
ATMOS.bindWeather({climate:{},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
