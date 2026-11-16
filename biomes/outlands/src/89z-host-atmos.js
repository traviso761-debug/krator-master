// ================================================================= HOST — the atmosphere: THE FOG BELT on the wall (core/atmos)
// core/atmos bound for this stage. The station's defining air is ATMOS.fogBelt (PLAN.md section 12, C1; core/atmos/README.md, "The
// fog belt"): the S basin's wet wind forced up the wall from the south condenses as a band of cloud between FOG_Y0 and FOG_Y1 (3.5-4.4
// km), hugging the slope, thicker on the faces turned to the wind and thinning toward its top. It is drawn as the height fog's fourth
// layer; the kit's placement reads the host's own `fog` field over the same band (45-host-stage.js), so the veil caps stand where the
// cloud is. The weather is a dry upland's below the belt (it starts clear; the panel's Weather selector picks the rest).
// ?belt=0 no belt, ?hfog=0 no height fog (and no belt).
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:5111,err:reportErr});
ATMOS.bindWeather({climate:{wet:true,cold:false},sun,hemi:scene.children.find(o=>o.isHemisphereLight),grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,belt:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){
  ATMOS.heightFog({falloff:1/900,sun:.3,sky:.35});
  if(Q.get('belt')!=='0'&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt({y0:FOG_Y0,y1:FOG_Y1,windward:[0,1],density:.0022,depth:110,lee:.3,rise:.55,
   extent:[-TERR.R*1.5,-TERR.R*1.5,TERR.R*1.5,TERR.R*1.5],res:160,steps:8});out.belt=true;}
  ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
REGISTER({name:'The fog belt (the basin\'s wet wind, condensed on the wall)',x:0,z:-1600,y:FOG_Y0,r:1500,h:FOG_Y1-FOG_Y0});
