// ================================================================= HOST — the atmosphere: the gap's warm, humid air (core/atmos)
// The weather is a warm humid valley's (it starts clear; the panel's Weather selector picks the rest); a height fog thick on the floor and
// thinning up the walls. The gap's wind (the Silk-Draught by day, the Outland Bore by night) waits on the shared katabatic amendment
// (PLAN.md section 8, amendment 1): until then the weather's own wind. ?hfog=0 no height fog.
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:6111,err:reportErr});
ATMOS.bindWeather({climate:{wet:true,cold:false},sun,hemi:HEMI,grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/1400,sun:.3,sky:.35});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
