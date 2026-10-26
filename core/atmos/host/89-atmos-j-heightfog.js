// ================================================================= ATMOS — host: height fog, valley mist and a cloud band on a page's materials
// [web] (R1, HANDOFF-REBUILD.md 4a). The chunk and its JS twin are sky/89-atmos-j-fog.js (atmos_fog); this binds them:
//   ATMOS.heightFog(o) -> F   the settings, its uniforms (A.U.fogH ...) and the per-frame step. o (every field optional):
//     falloff   1/m: how fast the air's fog thins above the reference height (default 1/900: half by ~620 m up)
//     ref       'ground' (default: the ground under the camera, eased, plus o.lift) or a height in metres
//     sun, sky  the forward lobe's strength toward the sun's colour (default .35) and the share of the sky's zenith colour a
//               climbing ray takes (default .4); both read the shared sky's uniforms (host/89-atmos-h-skyhost.js)
//     shape     'exp2' (FogExp2's own curve, the default when scene.fog is a FogExp2) or 'exp' (a page whose fog chunk is
//               exponential, as nhighlands' is); compress [start, scale]: a page's distance compression (nhighlands 4000, 5000)
//     mist      {density (1/m at full), y (the level it pools below, m), depth (m: how fast it thins above), noise (0..1:
//               patchiness), night (its share at night, default .25), dawn [h0, h1, h2, h3] (rises h0..h1, burns off h2..h3;
//               default [3.5, 5.2, 8, 10.5])}: thicker in the weather's fog (W.fog), thinner in a gale
//     band      {density (1/m), y [bottom, top] (m), cover (0..1), noise (0..1)}: a cloud layer at mid-height; the rain and
//               the fog thicken it
//     ride      how fast the patches drift on the wind (default 1: the wind's own speed, gusts and all)
//   ATMOS.heightFogOn(material)   one material (Lambert / Phong / Standard / Basic with fog): its fog_fragment becomes atmFog
//   ATMOS.heightFogScene(scene)   every lit material in the scene with fog on, once (not ShaderMaterials, water, sprites):
//                                 a ShaderMaterial of the page's own takes ATMOS.fogGLSL() and calls atmFog itself
// Composes with the weather's fog (ATMOS.bindWeather and the sky drive scene.fog's colour and density, which are this fog's
// colour and its density at the ground) and with cloudShade, snowOn and wetGround in any order (ATMOS.shaderHook). Opt-in: a
// page lists sky/89-atmos-j-fog.js and this file and calls it (or passes heightFog: to ATMOS.skyBiome).
(function(){const A=ATMOS;
 const lin=(c,out)=>out.setRGB(c.r,c.g,c.b).convertSRGBToLinear();
 A.heightFog=function(o){o=o||{};const T=A.T,U=A.U,h=A.h||{},M=o.mist||{},B=o.band||{};
  U.fogH=U.fogH||{value:new T.Vector4()};U.fogMist=U.fogMist||{value:new T.Vector4()};U.fogBand=U.fogBand||{value:new T.Vector4()};U.fogX=U.fogX||{value:new T.Vector4()};
  U.fogSunDir=U.fogSunDir||{value:new T.Vector3(0,1,0)};U.fogSunC=U.fogSunC||{value:new T.Color(1,1,1)};U.fogZen=U.fogZen||{value:new T.Color(.5,.6,.7)};U.fogDrift=U.fogDrift||{value:new T.Vector2()};
  const F=A.fog={o,falloff:o.falloff==null?1/900:o.falloff,lift:o.lift==null?0:o.lift,sun:o.sun==null?.35:o.sun,sky:o.sky==null?.4:o.sky,
   shape:o.shape||'exp2',compress:o.compress||null,ride:o.ride==null?1:o.ride,ref:null,mistD:0,bandD:0};
  const dawn=M.dawn||[3.5,5.2,8,10.5],cam=h.camera;
  F.step=(t,hour,dt)=>{const W=A.W||{},S=A.skyUniforms;
   // the reference height: the ground under the eye, eased (a cliff's edge does not pop the fog)
   const g=typeof o.ref==='number'?o.ref:(cam?A.ground(cam.position.x,cam.position.z):0)+F.lift;F.ref=F.ref==null||dt<=0?g:F.ref+(g-F.ref)*Math.min(1,dt*1.5);
   const wind=W.wind==null?1:W.wind,calm=Math.max(0,1-.35*Math.max(0,wind-1));
   F.mistD=(M.density||0)*Math.min(1,A.ss(dawn[0],dawn[1],hour)*(1-A.ss(dawn[2],dawn[3],hour))+(M.night==null?.25:M.night)*A.night(hour))*(1+2*(W.fog||0))*calm;
   F.bandD=(B.density||0)*(1+1.5*(W.rain||0)+(W.fog||0));
   U.fogH.value.set(F.falloff,F.ref,F.sun,F.sky);U.fogMist.value.set(F.mistD,M.y||0,1/Math.max(1,M.depth||40),M.noise==null?.6:M.noise);
   U.fogBand.value.set(F.bandD,B.y?B.y[0]:0,B.y?B.y[1]:0,B.cover==null?.5:B.cover);
   U.fogX.value.set(F.shape==='exp'?0:1,F.compress?F.compress[0]:0,F.compress?F.compress[1]:0,B.noise==null?1:B.noise);
   if(S){U.fogSunDir.value.copy(S.uSunDir.value);lin(S.uSunC.value,U.fogSunC.value);U.fogSunC.value.multiplyScalar(Math.min(1,Math.max(0,S.uSunI.value)));lin(S.uZen.value,U.fogZen.value);}
   // the drift: the patches ride the wind at the eye, gusts and all (atmGust's JS twin)
   if(dt>0&&U.wind){const w=U.wind.value,k=(1+U.gustAmp.value*A.gust(t,cam?cam.position.x:0,cam?cam.position.z:0))*F.ride*dt;U.fogDrift.value.x-=w.x*k;U.fogDrift.value.y-=w.y*k;}};
  F.step(0,h.hour?h.hour():12,0);A.hook(F.step);
  A.rec('heightfog',{falloff:F.falloff,ref:typeof o.ref==='number'?o.ref:'ground',lift:F.lift,sun:F.sun,sky:F.sky,shape:F.shape,compress:F.compress,mist:o.mist||null,band:o.band||null,
   note:'fog = 1 - exp(-(air^shape + mist + band)); air = scene fog density * the pool integral of exp(-falloff (y - ref)); the mist pools below mist.y at dawn; the band is a slab of cloud (sky/89-atmos-j-fog.js)'});
  return F;};
 A.heightFogOn=function(mat){if(!mat||!A.U||!A.U.fogH)return mat;
  return A.shaderHook(mat,'atmos-heightfog',function(sh){const U=A.U;
   if(sh.fragmentShader.indexOf('#include <fog_fragment>')<0)return;   /* the page's own fog (a far-land fade) stands */
   sh.uniforms.atmFogH=U.fogH;sh.uniforms.atmFogMist=U.fogMist;sh.uniforms.atmFogBand=U.fogBand;sh.uniforms.atmFogX=U.fogX;
   sh.uniforms.atmFogSunDir=U.fogSunDir;sh.uniforms.atmFogSunC=U.fogSunC;sh.uniforms.atmFogZen=U.fogZen;sh.uniforms.atmFogDrift=U.fogDrift;
   sh.vertexShader='varying vec3 vAtmFogP;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n{vec4 atmFP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmFP=instanceMatrix*atmFP;\n#endif\nvAtmFogP=(modelMatrix*atmFP).xyz;}');
   sh.fragmentShader='varying vec3 vAtmFogP;\n'+A.fogGLSL()+'\n'+sh.fragmentShader.replace('#include <fog_fragment>',
    '#ifdef USE_FOG\n#ifdef FOG_EXP2\n{vec3 atmFd=vAtmFogP-cameraPosition;float atmFL=length(atmFd);vec4 atmFz=atmFog(cameraPosition,atmFd/max(atmFL,1e-4),atmFL,fogColor,fogDensity);gl_FragColor.rgb=mix(gl_FragColor.rgb,atmFz.rgb,atmFz.a);}\n#else\n#include <fog_fragment>\n#endif\n#endif');});};
 A.heightFogScene=function(scene,o){o=o||{};const seen=new Set();let n=0;scene.traverse(ob=>{if(!ob.isMesh||!ob.material||ob.userData.noHeightFog||(ob.name&&ob.name.indexOf('water:')===0))return;
  for(const m of(Array.isArray(ob.material)?ob.material:[ob.material])){if(seen.has(m)||!m.fog||m.userData.noHeightFog)continue;seen.add(m);
   if(!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial||(o.basic&&m.isMeshBasicMaterial)))continue;A.heightFogOn(m);n++;}});return n;};
})();
