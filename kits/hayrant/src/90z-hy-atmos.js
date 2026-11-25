// ================================================================= ATMOS KATABATIC WIND BINDING: plaid, wallhemp, hide, nets, signs & chimes
// Runs right after core/engine/90-scene.js (where ATMOS.init has created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and
// ATMOS.GLSL_WIND) and before 92-world.js. Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a
// KHOOK layer ('atmos-hy-wind') calling atmWind(uAtmTime, hyWPos.xz, uAtmWind, uAtmGust), so every cave-madder Hayrant plaid
// awning, wallhemp garlic-braid line, yak-hide wind-flap, trench-lake net, bilingual signboard, and suspended Crookshore
// emerald-nephrite seismic chime sways downwind with katabatic gust fronts while staying 100% pinned (0.0 drift) where |aFlut| == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const HY_WIND_GLSL=[
  '{float hyPin=length(aFlut);',
  'if(hyPin>1e-5){',
  ' vec3 hyWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 hyFw=atmWind(uAtmTime,hyWPos.xz,uAtmWind,uAtmGust);',
  ' float hyWMag=length(hyFw);',
  ' vec2 hyWDir=hyWMag>1e-4?hyFw/hyWMag:vec2(1.0,0.0);',
  ' float hyPh1=dot(hyWPos.xz,hyWDir)*2.3-uAtmTime*(2.6+0.55*hyWMag)+hyWPos.y*1.6;',
  ' float hyPh2=dot(hyWPos,vec3(1.15,1.85,1.25))*2.0-uAtmTime*(4.1+0.45*hyWMag);',
  ' float hyWave=0.65*sin(hyPh1)+0.35*sin(hyPh2);',
  ' vec3 hyDrift=vec3(hyFw.x*0.26,0.05*hyWMag*(0.5+0.5*sin(hyPh1)),hyFw.y*0.26)*hyPin;',
  ' vec3 hyRip=aFlut*hyWave*(0.34+0.44*hyWMag)+vec3(hyWDir.x,0.1,hyWDir.y)*(hyPin*0.16*sin(hyPh1));',
  ' transformed+=hyDrift+hyRip;',
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
  KHOOK.add(m,'atmos-hy-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+HY_WIND_GLSL,'atmos-hy-wind');
   m.userData.hyShader=sh;
  });
 }

 /* Pure JS CPU twin of the vertex shader displacement for verify.py --assert (atmos-wind) */
 globalThis.hyWindDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
  const pin=Math.hypot(fx,fy,fz);
  if(pin<=1e-5)return [0,0,0];
  const PW=ATMOS.PRESETS.wind,wLen=Math.hypot(windX,windZ)||1e-3;
  const s=t-(wx*windX+wz*windZ)/wLen/PW.frontSpeed;
  let g=0;for(const q of PW.gust)g+=q[0]*Math.sin(s*q[1]+q[2]);
  const f=1+gustAmp*g,fwx=windX*f,fwz=windZ*f,wMag=Math.hypot(fwx,fwz);
  const wdx=wMag>1e-4?fwx/wMag:1,wdz=wMag>1e-4?fwz/wMag:0;
  const ph1=(wx*wdx+wz*wdz)*2.3-t*(2.6+0.55*wMag)+wy*1.6;
  const ph2=(wx*1.15+wy*1.85+wz*1.25)*2.0-t*(4.1+0.45*wMag);
  const wave=0.65*Math.sin(ph1)+0.35*Math.sin(ph2);
  const scale=(0.34+0.44*wMag)*wave,r2=pin*0.16*Math.sin(ph1);
  return [
   fwx*0.26*pin+fx*scale+wdx*r2,
   0.05*wMag*(0.5+0.5*Math.sin(ph1))*pin+fy*scale+0.1*r2,
   fwz*0.26*pin+fz*scale+wdz*r2
  ];
 };

 ATMOS.finish();
})();
