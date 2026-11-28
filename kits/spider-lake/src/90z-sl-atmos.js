// ================================================================= ATMOS SILK WIND BINDING: live wind & travelling gusts on all silk
// Runs right after core/engine/90-scene.js (where ATMOS.init has created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and
// ATMOS.GLSL_WIND) and before 92-world.js. Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a
// KHOOK layer ('atmos-silk-wind') calling atmWind(uAtmTime, slWPos.xz, uAtmWind, uAtmGust), so every velarium, hypar saddle
// canopy, shamiyana awning, evaporative wind-veil and 20 m dyed canal streamer billows downwind and ripples with travelling
// ATMOS gust fronts while staying 100% pinned (0.0 drift) wherever length(aFlut) == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const SL_SILK_GLSL=[
  '{float slPin=length(aFlut);',
  'if(slPin>1e-5){',
  ' vec3 slWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 slFw=atmWind(uAtmTime,slWPos.xz,uAtmWind,uAtmGust);',
  ' float slWMag=length(slFw);',
  ' vec2 slWDir=slWMag>1e-4?slFw/slWMag:vec2(1.0,0.0);',
  ' float slPh1=dot(slWPos.xz,slWDir)*2.4-uAtmTime*(2.7+0.6*slWMag)+slWPos.y*1.7;',
  ' float slPh2=dot(slWPos,vec3(1.1,1.9,1.3))*2.1-uAtmTime*(4.3+0.45*slWMag);',
  ' float slWave=0.65*sin(slPh1)+0.35*sin(slPh2);',
  ' vec3 slDrift=vec3(slFw.x*0.28,0.06*slWMag*(0.5+0.5*sin(slPh1)),slFw.y*0.28)*slPin;',
  ' vec3 slRip=aFlut*slWave*(0.35+0.45*slWMag)+vec3(slWDir.x,0.12,slWDir.y)*(slPin*0.18*sin(slPh1));',
  ' transformed+=slDrift+slRip;',
  '}}'
 ].join('\n');

 for(const k in SV_CLOTH){
  const m=MAT[k];
  if(!m)continue;
  /* Remove 27-mat.js's static 'flut' hook so attribute vec3 aFlut is declared once by our ATMOS-bound layer. */
  if(m.userData&&Array.isArray(m.userData.hooks)){
   m.userData.hooks=m.userData.hooks.filter(h=>h.key!=='flut');
   const ck=m.userData.hooks.map(h=>h.key).join('|');
   m.customProgramCacheKey=()=>ck;
  }
  KHOOK.add(m,'atmos-silk-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+SL_SILK_GLSL,'atmos-silk-wind');
   m.userData.slShader=sh;
  });
 }

 /* Pure JS mirror of the vertex shader displacement for verify.py --assert (atmos-silk-wind) */
 globalThis.slSilkDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
  const pin=Math.hypot(fx,fy,fz);
  if(pin<=1e-5)return [0,0,0];
  const PW=ATMOS.PRESETS.wind,wLen=Math.hypot(windX,windZ)||1e-3;
  const s=t-(wx*windX+wz*windZ)/wLen/PW.frontSpeed;
  let g=0;for(const q of PW.gust)g+=q[0]*Math.sin(s*q[1]+q[2]);
  const f=1+gustAmp*g,fwx=windX*f,fwz=windZ*f,wMag=Math.hypot(fwx,fwz);
  const wdx=wMag>1e-4?fwx/wMag:1,wdz=wMag>1e-4?fwz/wMag:0;
  const ph1=(wx*wdx+wz*wdz)*2.4-t*(2.7+0.6*wMag)+wy*1.7;
  const ph2=(wx*1.1+wy*1.9+wz*1.3)*2.1-t*(4.3+0.45*wMag);
  const wave=0.65*Math.sin(ph1)+0.35*Math.sin(ph2);
  const scale=(0.35+0.45*wMag)*wave,r2=pin*0.18*Math.sin(ph1);
  return [
   fwx*0.28*pin+fx*scale+wdx*r2,
   0.06*wMag*(0.5+0.5*Math.sin(ph1))*pin+fy*scale+0.12*r2,
   fwz*0.28*pin+fz*scale+wdz*r2
  ];
 };

 ATMOS.finish();
})();
