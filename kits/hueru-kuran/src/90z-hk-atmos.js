// ================================================================= ATMOS WIND BINDING: live wind & gusts on gutskin, kelp, nets, banners & chimes
// Runs right after core/engine/90-scene.js (where ATMOS.init has created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and
// ATMOS.GLSL_WIND) and before 92-world.js. Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a
// KHOOK layer ('atmos-hk-wind') calling atmWind(uAtmTime, hkWPos.xz, uAtmWind, uAtmGust), so every oiled gutskin awning,
// sea-beast hide tarp, drying giant-kelp curtain, braided harpoon net, Whale-Clan banner, and suspended emerald-nephrite
// wind/tide chime sways downwind with travelling ATMOS gust fronts while staying 100% pinned (0.0 drift) where |aFlut| == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const HK_WIND_GLSL=[
  '{float hkPin=length(aFlut);',
  'if(hkPin>1e-5){',
  ' vec3 hkWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 hkFw=atmWind(uAtmTime,hkWPos.xz,uAtmWind,uAtmGust);',
  ' float hkWMag=length(hkFw);',
  ' vec2 hkWDir=hkWMag>1e-4?hkFw/hkWMag:vec2(1.0,0.0);',
  ' float hkPh1=dot(hkWPos.xz,hkWDir)*2.3-uAtmTime*(2.6+0.55*hkWMag)+hkWPos.y*1.6;',
  ' float hkPh2=dot(hkWPos,vec3(1.15,1.85,1.25))*2.0-uAtmTime*(4.1+0.45*hkWMag);',
  ' float hkWave=0.65*sin(hkPh1)+0.35*sin(hkPh2);',
  ' vec3 hkDrift=vec3(hkFw.x*0.26,0.05*hkWMag*(0.5+0.5*sin(hkPh1)),hkFw.y*0.26)*hkPin;',
  ' vec3 hkRip=aFlut*hkWave*(0.34+0.44*hkWMag)+vec3(hkWDir.x,0.1,hkWDir.y)*(hkPin*0.16*sin(hkPh1));',
  ' transformed+=hkDrift+hkRip;',
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
  KHOOK.add(m,'atmos-hk-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+HK_WIND_GLSL,'atmos-hk-wind');
   m.userData.hkShader=sh;
  });
 }

 /* Pure JS CPU twin of the vertex shader displacement for verify.py --assert (atmos-wind) */
 globalThis.hkWindDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
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
