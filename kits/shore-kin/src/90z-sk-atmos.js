// ================================================================= ATMOS WIND BINDING: live wind & gusts on sharkskin, catechu, byssus, kelp, nets & shell chimes
// Runs right after core/engine/90-scene.js (where ATMOS.init created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and ATMOS.GLSL_WIND).
// Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a KHOOK layer ('atmos-sk-wind') calling atmWind,
// so oiled sharkskin/ray-hide awnings, catechu sails, sea-byssus banners, drying kelp, pumice-float nets, and shell chimes sway
// downwind with travelling ATMOS gust fronts while staying 100% pinned (0.0 drift) where |aFlut| == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const SK_WIND_GLSL=[
  '{float skPin=length(aFlut);',
  'if(skPin>1e-5){',
  ' vec3 skWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 skFw=atmWind(uAtmTime,skWPos.xz,uAtmWind,uAtmGust);',
  ' float skWMag=length(skFw);',
  ' vec2 skWDir=skWMag>1e-4?skFw/skWMag:vec2(1.0,0.0);',
  ' float skPh1=dot(skWPos.xz,skWDir)*2.3-uAtmTime*(2.6+0.55*skWMag)+skWPos.y*1.6;',
  ' float skPh2=dot(skWPos,vec3(1.15,1.85,1.25))*2.0-uAtmTime*(4.1+0.45*skWMag);',
  ' float skWave=0.65*sin(skPh1)+0.35*sin(skPh2);',
  ' vec3 skDrift=vec3(skFw.x*0.26,0.05*skWMag*(0.5+0.5*sin(skPh1)),skFw.y*0.26)*skPin;',
  ' vec3 skRip=aFlut*skWave*(0.34+0.44*skWMag)+vec3(skWDir.x,0.1,skWDir.y)*(skPin*0.16*sin(skPh1));',
  ' transformed+=skDrift+skRip;',
  '}}'
 ].join('\n');

 for(const k in SV_CLOTH){
  const m=MAT[k];
  if(!m)continue;
  if(m.userData&&Array.isArray(m.userData.hooks)){
   m.userData.hooks=m.userData.hooks.filter(h=>h.key!=='flut');
   const ck=m.userData.hooks.map(h=>h.key).join('|');
   m.customProgramCacheKey=()=>ck;
  }
  KHOOK.add(m,'atmos-sk-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+SK_WIND_GLSL,'atmos-sk-wind');
   m.userData.skShader=sh;
  });
 }

 globalThis.skWindDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
  const pin=Math.hypot(fx,fy,fz);
  if(pin<=1e-5)return [0,0,0];
  const PW=ATMOS.PRESETS.wind,wLen=Math.hypot(windX,windZ)||1e-3;
  const s=t-(wx*windX+wz*windZ)/wLen/PW.frontSpeed;
  let g=0;for(const q of PW.gust)g+=q[0]*Math.sin(s*q[1]+q[2]);
  const f=1+gustAmp*g,fwx=windX*f,fwz=windZ*f,wMag=Math.hypot(fwx,fwz);
  const wdx=wMag>1e-4?fwx/wMag:1,wdz=wMag>1e-4?fwz/wMag:0;
  const ph1=(wx*wdx+wz*wdz)*2.3-t*(2.6+0.55*wMag)+wy*1.6;
  const ph2=(wx*1.15+wy*1.85+wz*1.25)*2.0-t*(4.1+0.45*wMag);
  const wave=0.65*Math.sin(ph1)+0.35*sinWrap(ph2);
  const scale=(0.34+0.44*wMag)*wave,r2=pin*0.16*Math.sin(ph1);
  return [
   fwx*0.26*pin+fx*scale+wdx*r2,
   0.05*wMag*(0.5+0.5*Math.sin(ph1))*pin+fy*scale+0.1*r2,
   fwz*0.26*pin+fz*scale+wdz*r2
  ];
 };
 function sinWrap(v){return Math.sin(v);}

 ATMOS.finish();
})();
