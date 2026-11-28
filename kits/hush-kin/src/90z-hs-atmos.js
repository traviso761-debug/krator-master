// ================================================================= ATMOS SILENT-VALES WIND BINDING: Handspeak banners & harmonic pendulums
// Runs right after core/engine/90-scene.js (where ATMOS.init has created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and
// ATMOS.GLSL_WIND) and before 92-world.js. Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a
// KHOOK layer ('atmos-hs-wind') calling atmWind(uAtmTime, hsWPos.xz, uAtmWind, uAtmGust), so every linen Handspeak banner,
// felt acoustic hanging, lake net, elliptic bianzhong bronze bell (chimeBronze) and sawn emerald-nephrite qing slab (chimeNephrite)
// sways visibly downwind inside The Great Hush's dead acoustic silence while staying 100% pinned (0.0 drift) where |aFlut| == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const HS_WIND_GLSL=[
  '{float hsPin=length(aFlut);',
  'if(hsPin>1e-5){',
  ' vec3 hsWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 hsFw=atmWind(uAtmTime,hsWPos.xz,uAtmWind,uAtmGust);',
  ' float hsWMag=length(hsFw);',
  ' vec2 hsWDir=hsWMag>1e-4?hsFw/hsWMag:vec2(1.0,0.0);',
  ' float hsPh1=dot(hsWPos.xz,hsWDir)*2.1-uAtmTime*(2.4+0.5*hsWMag)+hsWPos.y*1.4;',
  ' float hsPh2=dot(hsWPos,vec3(1.1,1.7,1.2))*1.9-uAtmTime*(3.8+0.4*hsWMag);',
  ' float hsWave=0.68*sin(hsPh1)+0.32*sin(hsPh2);',
  ' vec3 hsDrift=vec3(hsFw.x*0.24,0.04*hsWMag*(0.5+0.5*sin(hsPh1)),hsFw.y*0.24)*hsPin;',
  ' vec3 hsRip=aFlut*hsWave*(0.32+0.42*hsWMag)+vec3(hsWDir.x,0.08,hsWDir.y)*(hsPin*0.14*sin(hsPh1));',
  ' transformed+=hsDrift+hsRip;',
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
  KHOOK.add(m,'atmos-hs-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+HS_WIND_GLSL,'atmos-hs-wind');
   m.userData.hsShader=sh;
  });
 }

 /* Pure JS CPU twin of the vertex shader displacement for verify.py --assert (atmos-wind) */
 globalThis.hsWindDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
  const pin=Math.hypot(fx,fy,fz);
  if(pin<=1e-5)return [0,0,0];
  const PW=ATMOS.PRESETS.wind,wLen=Math.hypot(windX,windZ)||1e-3;
  const s=t-(wx*windX+wz*windZ)/wLen/PW.frontSpeed;
  let g=0;for(const q of PW.gust)g+=q[0]*Math.sin(s*q[1]+q[2]);
  const f=1+gustAmp*g,fwx=windX*f,fwz=windZ*f,wMag=Math.hypot(fwx,fwz);
  const wdx=wMag>1e-4?fwx/wMag:1,wdz=wMag>1e-4?fwz/wMag:0;
  const ph1=(wx*wdx+wz*wdz)*2.1-t*(2.4+0.5*wMag)+wy*1.4;
  const ph2=(wx*1.1+wy*1.7+wz*1.2)*1.9-t*(3.8+0.4*wMag);
  const wave=0.68*Math.sin(ph1)+0.32*Math.sin(ph2);
  const scale=(0.32+0.42*wMag)*wave,r2=pin*0.14*Math.sin(ph1);
  return [
   fwx*0.24*pin+fx*scale+wdx*r2,
   0.04*wMag*(0.5+0.5*Math.sin(ph1))*pin+fy*scale+0.08*r2,
   fwz*0.24*pin+fz*scale+wdz*r2
  ];
 };

 ATMOS.finish();
})();
