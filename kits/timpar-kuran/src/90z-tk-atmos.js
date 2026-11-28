// ================================================================= ATMOS VALLEY-MIST WIND BINDING: Chilkat, attus, inau curls & salmon lines
// Runs right after core/engine/90-scene.js (where ATMOS.init has created ATMOS.U.time, ATMOS.U.wind, ATMOS.U.gustAmp, and
// ATMOS.GLSL_WIND) and before 92-world.js. Replaces 27-mat.js's static scalar 'flut' hook on every SV_CLOTH material with a
// KHOOK layer ('atmos-tk-wind') calling atmWind(uAtmTime, tkWPos.xz, uAtmWind, uAtmGust), so every Chilkat crest blanket,
// mountain-elm attus banner, shaved-willow inau curl, smoked-salmon line and weir net sways downwind with Veiled-Mountain
// valley drafts while staying 100% pinned (0.0 drift) where |aFlut| == 0.
(function(){
 if(typeof ATMOS==='undefined'||!ATMOS.U)return;
 if(qs.has('t'))ATMOS.clock.fixed=+qs.get('t');
 const syncWind=()=>{
  const w=ATMOS.U.wind.value;
  ANIMU.uAnimWind.value=Math.hypot(w.x,w.y);
 };
 syncWind();
 ATMOS.hook(()=>syncWind());

 const TK_WIND_GLSL=[
  '{float tkPin=length(aFlut);',
  'if(tkPin>1e-5){',
  ' vec3 tkWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 tkFw=atmWind(uAtmTime,tkWPos.xz,uAtmWind,uAtmGust);',
  ' float tkWMag=length(tkFw);',
  ' vec2 tkWDir=tkWMag>1e-4?tkFw/tkWMag:vec2(1.0,0.0);',
  ' float tkPh1=dot(tkWPos.xz,tkWDir)*2.3-uAtmTime*(2.6+0.55*tkWMag)+tkWPos.y*1.6;',
  ' float tkPh2=dot(tkWPos,vec3(1.15,1.85,1.25))*2.0-uAtmTime*(4.1+0.45*tkWMag);',
  ' float tkWave=0.65*sin(tkPh1)+0.35*sin(tkPh2);',
  ' vec3 tkDrift=vec3(tkFw.x*0.26,0.05*tkWMag*(0.5+0.5*sin(tkPh1)),tkFw.y*0.26)*tkPin;',
  ' vec3 tkRip=aFlut*tkWave*(0.34+0.44*tkWMag)+vec3(tkWDir.x,0.1,tkWDir.y)*(tkPin*0.16*sin(tkPh1));',
  ' transformed+=tkDrift+tkRip;',
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
  KHOOK.add(m,'atmos-tk-wind',sh=>{
   sh.uniforms.uAtmTime=ATMOS.U.time;
   sh.uniforms.uAtmWind=ATMOS.U.wind;
   sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
   sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
   KHOOK.v(sh,'#include <begin_vertex>','#include <begin_vertex>\n'+TK_WIND_GLSL,'atmos-tk-wind');
   m.userData.tkShader=sh;
  });
 }

 /* Pure JS CPU twin of the vertex shader displacement for verify.py --assert (atmos-wind) */
 globalThis.tkWindDisplace=function(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp){
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
