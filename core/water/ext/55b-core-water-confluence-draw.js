// ================================================================= WATER - ext: drawing a confluence (55-core-water-confluence.js)
// [draw] + [G shader]. Needs 20, 21, 22, 50 and 51 (the ribbons' GLSL: WATER.flowGLSL, WATER.noiseGLSL), ext/55, core/atmos bound with
// ATMOS.init, and three.js r128. Opt-in by path. Nothing runs at load time.
//
//   WATER.drawConfluence(C, o)  the confluence's grid as one mesh, shaded with drawFlow's own text (the same colour from the bank distance,
//        foam from the slope and the bank, the ripples advected along the current by wtrFlowN), so where it fades into a ribbon the two
//        draw the same water; its alpha times the disc's weight; foam where the currents meet (C.meet). o: drawFlow's {color, shallow, deep,
//        roughness, metalness, envMapIntensity, rapids, rain, renderOrder, depthBias, pick}: pass the river's, so it is the river's water
//   WATER.fadeRibbons(C, draws)  each ribbon drawing (drawFlow's {material}) fades out inside the disc (alpha x (1 - C.fadeAt), or a
//        discard where an opaque ribbon has less than half): its key and text change only for the materials passed. Returns the chunk
//   WATER.ribbonFadeGLSL(C) that line (twin: 1 - C.fadeAt)
(function(){const W=WATER;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf;
 const lin=(T,c)=>'vec3('+W.colLin(T,c).map(glf).join(',')+')';
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const sky=(mat,o)=>{const A=AT();if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});};
 // the ribbons' weight outside the disc: 0 inside it, 1 past its rim
 W.ribbonFadeGLSL=C=>'smoothstep('+f(C.r-C.feather)+','+f(C.r)+',length(vWtrW.xz-vec2('+f(C.mouth[0])+','+f(C.mouth[1])+')))';
 W.fadeRibbons=(C,draws)=>{const t=W.ribbonFadeGLSL(C);
  for(const D of draws){const m=D.material||D,opaque=!m.transparent,line=opaque?'if('+t+'<0.5)discard;':'diffuseColor.a*='+t+';';
   W.KH().add(m,'wtr-cf:'+W.hashStr(line),sh=>{W.fs(sh,'wtr-fadeRibbons',['#include <color_fragment>','#include <color_fragment>\n'+line]);},{key:'cf:'+W.hashStr(line)});}
  return t;};
 W.drawConfluence=(C,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,Q=W.PRESETS.flow,per=W.period(),M=C.mesh(),g=new T.BufferGeometry();
  const rap=o.rapids||(C.flows[0]&&C.flows[0].rapids)||null;
  g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));g.setAttribute('wtrFlow',new T.Float32BufferAttribute(M.flow,2));g.setAttribute('wtrSlope',new T.Float32BufferAttribute(M.slope,1));
  g.setAttribute('wtrBank',new T.Float32BufferAttribute(M.bank,1));g.setAttribute('wtrFade',new T.Float32BufferAttribute(M.fade,1));g.setAttribute('wtrMeet',new T.Float32BufferAttribute(M.meet,1));
  g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(M.count*3).map((v,i)=>i%3===1?1:0),3));g.setIndex(M.idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x2b5a5a:o.color,roughness:o.roughness==null?.12:o.roughness,metalness:o.metalness==null?.1:o.metalness,transparent:true,depthWrite:false});sky(mat,o);W.biasMaterial(mat,o);
  const T2=per/Q.phases,CH='#include <atmos_waves>\n'+W.flowGLSL(rap)+'\n'+W.noiseGLSL+'\nvarying vec2 vWtrF;varying float vWtrS;varying float vWtrB;varying float vWtrA;varying float vWtrM;varying vec3 vWtrW;';
  // drawFlow's colour, foam and alpha (the same text), the meeting's foam added, the alpha times the disc's weight
  const CF='float wtrP0=fract(atmWaveT*'+f(Q.phases/per)+');float wtrW0=1.0-abs(2.0*wtrP0-1.0);'+
   'float wtrNz=mix(wtrNoise((vWtrW.xz-vWtrF*fract(wtrP0+0.5)*'+f(T2)+')*0.55+7.3),wtrNoise((vWtrW.xz-vWtrF*wtrP0*'+f(T2)+')*0.55),wtrW0);'+
   'float wtrFb=min(1.0,wtrFlowFoam(vWtrS,vWtrB)+'+f(C.meet)+'*vWtrM);float wtrFoamK=wtrFb*smoothstep(0.42,0.82,wtrNz+0.15*wtrFb);'+
   'diffuseColor.rgb=mix('+lin(T,o.shallow==null?0x6f9a8a:o.shallow)+','+lin(T,o.deep==null?0x1d3f44:o.deep)+',smoothstep(0.3,3.5,vWtrB));'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.9,0.9),wtrFoamK);'+
   'diffuseColor.a*=mix(0.78,0.95,smoothstep(0.0,3.0,vWtrB))*smoothstep('+f(-C.margin)+',0.25,vWtrB)*vWtrA;';
  mat.customProgramCacheKey=()=>'wtr-confluence:'+W.hashStr(CH+CF)+W.rainK(o);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   W.vs(sh,'wtr-drawConfluence',['#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrFlow;attribute float wtrSlope;attribute float wtrBank;attribute float wtrFade;attribute float wtrMeet;'],['#include <begin_vertex>','#include <begin_vertex>\nvWtrF=wtrFlow;vWtrS=wtrSlope;vWtrB=wtrBank;vWtrA=wtrFade;vWtrM=wtrMeet;vWtrW=(modelMatrix*vec4(position,1.0)).xyz;']);
   W.fs(sh,'wtr-drawConfluence',['#include <common>','#include <common>\n'+CH+W.rainOn(o,sh.uniforms)],['#include <color_fragment>','#include <color_fragment>\n'+CF],['#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.8,wtrFoamK);'],['#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4('+W.rainN(o,'wtrFlowN(vWtrW.xz,vWtrF,vWtrS)','vWtrW.xz','vWtrW')+',0.0)).xyz);']);};
  const mesh=new T.Mesh(g,mat);mesh.name='water:'+C.name;mesh.userData.lodSkip=true;mesh.userData.water=C.flows.map(S=>S.id);
  if(o.pick)mesh.userData.inspectLabel=C.name;else{mesh.userData.probeSkip=true;mesh.raycast=()=>{};}
  mesh.renderOrder=o.renderOrder==null?2:o.renderOrder;scene.add(mesh);
  const D={C,mesh,material:mat,grid:M,chunk:CF};W.drawn.push(D);return D;};
})();
