// ================================================================= HOST — the atmosphere of a later station (core/atmos)
// STAGE.atmos: {hour (11), climate {wet, cold, dry} (the weather's), fog {falloff, sun, sky} (the height fog), belt (an ATMOS.fogBelt's
// options, or none: only station 1 stands in the belt)}. The weather starts clear; the panel's Weather selector picks the rest.
// ?hfog=0 no height fog, ?belt=0 no belt.
ATMOS.init({THREE,scene,camera,hour:()=>(STAGE.atmos&&STAGE.atmos.hour)||11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:(STAGE.seed||5000)+11,err:reportErr});
ATMOS.bindWeather({climate:(STAGE.atmos&&STAGE.atmos.climate)||{wet:false,cold:false},sun,hemi:HEMI,grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),A=STAGE.atmos||{},out={hfog:false,belt:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog(A.fog||{falloff:1/900,sun:.3,sky:.3});
  if(A.belt&&Q.get('belt')!=='0'&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt(A.belt);out.belt=true;}
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
