// ================================================================= WATER - drawing: flow, falls, plunge pools, still water, wet ground
// [draw] + [G shader]. Needs 20, 21, 22 and 50-core-water-draw.js, core/atmos (0-core, 0p-presets, a-waves; b-skylight for
// the sky in the water) bound with ATMOS.init, and three.js r128. Nothing runs at load time.
//
//   WATER.drawFlow(S, o)   a flow surface as its ribbon (22's WATER.ribbon): one mesh, the surface falling with the line;
//        the normals advected along the current (WATER.flowGLSL's wtrFlowN, twin WATER.flowNormal), white water where the
//        bed steepens and along the banks (wtrFlowFoam), the shallows paler toward the banks. o: {color, shallow, deep,
//        roughness, metalness, envMapIntensity, transparent, step, across, margin, renderOrder, origin (vertices local to
//        the ribbon's middle: a long river far out)}
//   WATER.drawFall(S, o)   a fall's curtain (WATER.curtain: it arcs), streaked with a pattern that falls with the water
//        (wtrStreak, twin WATER.fallStreak), whiter toward the foot; its plunge pool's churn (wtrPlunge, twin WATER.plungeAt)
//        as a disc at the foot; spray from core/atmos's particles where the page has them (ATMOS.smoke 'spray').
//        o: {color, opacity, rows, cols, plunge (false: none), plungeY, spray (false: none), renderOrder}
//   WATER.drawStill(S, o)  a still surface (a box or a polygon) flat at its level: the sky in it, a faint ripple, a
//        fountain's rings (wtrStillN, twin WATER.stillNormal). o: {color, roughness, metalness, envMapIntensity, opacity}
//   WATER.stillMaterial(o)  one still material for many small pools a build draws itself (an instanced trough box): the
//        ripple on their tops, the sky in them
//   WATER.wetGround(material, {surface, rain})  a ground material darkens and shines where it is wet: the beach the swash
//        reaches (a shore surface's wtrWetGround) and, with rain, every up-facing surface by the weather's W.wet (Phase 4;
//        WATER.wetGroundRain). For MeshStandard/Phong/Lambert materials; a build with its own ShaderMaterial takes
//        WATER.wetChunk(surface, uniforms) and mixes the two numbers in itself.
// Every drawing returns {mesh, material, ...}; meshes carry userData.probeSkip and lodSkip and are named 'water:<name>'.
(function(){const W=WATER,TAU=Math.PI*2;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},f=glf;
 const AT=()=>{try{return typeof ATMOS!=='undefined'?ATMOS:null;}catch(e){return null;}};
 const lin=(T,c)=>{const q=new T.Color(c);return'vec3('+[q.r,q.g,q.b].map(glf).join(',')+')';};
 const tag=(m,S)=>{m.name='water:'+S.name;m.userData.probeSkip=true;m.userData.lodSkip=true;m.userData.water=S.id;m.raycast=()=>{};return m;};
 // the sky's light on a material (b-skylight's capture), as WATER.draw takes it
 const sky=(mat,o)=>{const A=AT();if(o.envMapIntensity!=null)mat.envMapIntensity=o.envMapIntensity;
  A.hook(()=>{const E=A.skyEnv,tx=E&&E.target&&E.target.texture;if(tx&&mat.envMap!==tx){mat.envMap=tx;mat.needsUpdate=true;}});};
 const NOISE='float wtrHash(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
  'float wtrNoise(vec2 p){vec2 i=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);return mix(mix(wtrHash(i),wtrHash(i+vec2(1.0,0.0)),u.x),mix(wtrHash(i+vec2(0.0,1.0)),wtrHash(i+vec2(1.0,1.0)),u.x),u.y);}\n'+
  // the same noise repeating every `per` cells in y (twin: WATER.noiseP)
  'float wtrNoiseP(vec2 p,float per){vec2 i=floor(p);vec2 u=fract(p);float a=u.x*u.x*(3.0-2.0*u.x);float b=u.y*u.y*(3.0-2.0*u.y);float j0=i.y-per*floor(i.y/per);float j1=(i.y+1.0)-per*floor((i.y+1.0)/per);'+
  'float h00=wtrHash(vec2(i.x,j0));float h10=wtrHash(vec2(i.x+1.0,j0));float h01=wtrHash(vec2(i.x,j1));float h11=wtrHash(vec2(i.x+1.0,j1));return (h00*(1.0-a)+h10*a)*(1.0-b)+(h01*(1.0-a)+h11*a)*b;}';

 // ---- FLOW: the chunk (the same text the test runs): wtrFlowN(p, v, slope), wtrFlowFoam(slope, bank)
 W.flowGLSL=()=>{const Q=W.PRESETS.flow,per=W.period(),n=Q.phases,R=Q.ripple;
  return['vec2 wtrRipG(vec2 q,vec2 c){vec2 g=vec2(0.0);vec2 d;'+R.map(r=>{const a=r[2]*Math.PI/180;
    return'd=vec2(c.x*'+f(Math.cos(a))+'-c.y*'+f(Math.sin(a))+',c.y*'+f(Math.cos(a))+'+c.x*'+f(Math.sin(a))+');g+=cos((q.x*d.x+q.y*d.y)*'+f(TAU/r[1])+')*'+f(r[0])+'*d;';}).join('')+'return g;}',
   'vec3 wtrFlowN(vec2 p,vec2 v,float slope){float p0=fract(atmWaveT*'+f(n/per)+');float p1=fract(p0+0.5);float T='+f(per/n)+';float sp=length(v);'+
    'vec2 c=sp>1.0e-6?v/sp:vec2(1.0,0.0);vec2 g0=wtrRipG(p-v*p0*T,c);vec2 g1=wtrRipG(p-v*p1*T+vec2('+f(.37*R[0][1])+','+f(.61*R[0][1])+'),c);'+
    'float w0=1.0-abs(2.0*p0-1.0);float k=1.0+'+f(Q.rapidGain)+'*smoothstep('+f(Q.rapids[0])+','+f(Q.rapids[1])+',slope);vec2 s=(g0*w0+g1*(1.0-w0))*k;return normalize(vec3(-s.x,1.0,-s.y));}',
   'float wtrFlowFoam(float slope,float bank){return max('+f(Q.foam[0])+'*smoothstep('+f(Q.rapids[0])+','+f(Q.rapids[1])+',slope),'+f(Q.foam[1])+'*(1.0-smoothstep(0.0,'+f(Q.edge)+',bank)));}'].join('\n');};
 W.drawFlow=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,Q=W.PRESETS.flow,per=W.period();
  S.ribbonOpt={step:o.step==null?Q.step:o.step,across:o.across==null?Q.across:o.across,margin:o.margin==null?Q.margin:o.margin};
  const R=W.ribbon(S,S.ribbonOpt),g=new T.BufferGeometry();
  // o.origin: the mesh stands at the ribbon's middle and its vertices are local to it (a river a hundred km long, a
  // million metres out, keeps its float precision); the shader still reads world positions through modelMatrix
  const org=[0,0,0];if(o.origin){let n=R.count;for(let i=0;i<n;i++){org[0]+=R.pos[i*3]/n;org[2]+=R.pos[i*3+2]/n;}org[0]=Math.round(org[0]);org[2]=Math.round(org[2]);}
  g.setAttribute('position',new T.Float32BufferAttribute(o.origin?R.pos.map((v,i)=>v-org[i%3]):R.pos,3));g.setAttribute('wtrFlow',new T.Float32BufferAttribute(R.flow,2));
  g.setAttribute('wtrSlope',new T.Float32BufferAttribute(R.slope,1));g.setAttribute('wtrBank',new T.Float32BufferAttribute(R.bank,1));
  g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(R.count*3).map((v,i)=>i%3===1?1:0),3));g.setIndex(R.idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x2b5a5a:o.color,roughness:o.roughness==null?.12:o.roughness,metalness:o.metalness==null?.1:o.metalness,
   transparent:o.transparent!==false,depthWrite:o.transparent===false});sky(mat,o);
  const CH='#include <atmos_waves>\n'+W.flowGLSL()+'\n'+NOISE+'\nvarying vec2 vWtrF;varying float vWtrS;varying float vWtrB;varying vec3 vWtrW;';
  const T2=per/Q.phases;mat.customProgramCacheKey=()=>'wtr-flow:'+W.hashStr(CH)+(o.transparent!==false?'t':'');
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrFlow;attribute float wtrSlope;attribute float wtrBank;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nvWtrF=wtrFlow;vWtrS=wtrSlope;vWtrB=wtrBank;vWtrW=(modelMatrix*vec4(position,1.0)).xyz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH)
    .replace('#include <color_fragment>','#include <color_fragment>\n'+
     'float wtrP0=fract(atmWaveT*'+f(Q.phases/per)+');float wtrW0=1.0-abs(2.0*wtrP0-1.0);'+
     // the breakup noise rides the current too (the same two phases)
     'float wtrNz=mix(wtrNoise((vWtrW.xz-vWtrF*fract(wtrP0+0.5)*'+f(T2)+')*0.55+7.3),wtrNoise((vWtrW.xz-vWtrF*wtrP0*'+f(T2)+')*0.55),wtrW0);'+
     'float wtrFoamK=wtrFlowFoam(vWtrS,vWtrB)*smoothstep(0.42,0.82,wtrNz+0.15*wtrFlowFoam(vWtrS,vWtrB));'+
     'diffuseColor.rgb=mix('+lin(T,o.shallow==null?0x6f9a8a:o.shallow)+','+lin(T,o.deep==null?0x1d3f44:o.deep)+',smoothstep(0.3,3.5,vWtrB));'+
     'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.9,0.9),wtrFoamK);'+
     (o.transparent!==false?'diffuseColor.a*=mix(0.78,0.95,smoothstep(0.0,3.0,vWtrB))*smoothstep('+f(-S.ribbonOpt.margin)+',0.25,vWtrB);':''))
    .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.8,wtrFoamK);')
    .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(wtrFlowN(vWtrW.xz,vWtrF,vWtrS),0.0)).xyz);');};
  const mesh=tag(new T.Mesh(g,mat),S);mesh.renderOrder=o.renderOrder==null?1:o.renderOrder;mesh.position.set(org[0],0,org[2]);scene.add(mesh);
  const D={S,mesh,material:mat,ribbon:R};W.drawn.push(D);return D;};

 // ---- FALLS: wtrStreak(u, f) and wtrFallFoam(f, s) for fall S; wtrPlunge(p) -> (foam, ring) for its pool
 W.fallGLSL=S=>{const Q=W.PRESETS.fall,per=W.period(),n=Q.streak.cycles,lw=S.lipW*Q.streak.across,P=W.plunge(S),PQ=Q.plunge;
  return[NOISE,'float wtrStreak(float u,float fl){float th=fract(atmWaveT*'+f(n/per)+'-fl*'+f(S.tFall*n/per)+');'+
    'return 0.55*wtrNoiseP(vec2(u*'+f(lw*2.2)+',th*6.0),6.0)+0.3*wtrNoiseP(vec2(u*'+f(lw*5.1)+'+3.7,th*14.0),14.0)+0.15*wtrNoiseP(vec2(u*'+f(lw*11)+'+9.1,th*30.0),30.0);}',
   'float wtrFallFoam(float fl,float s){return clamp(0.25+0.6*smoothstep(0.0,0.4,fl)+0.7*(s-0.5),0.0,1.0);}',
   'vec2 wtrPlunge(vec2 p){vec2 d=p-vec2('+f(P.x)+','+f(P.z)+');float r=length(d);float ph=fract(atmWaveT*'+f(PQ.cycles/per)+');float a=6.283185307*(fract(r*'+f(1/PQ.ring)+')-ph);'+
    'float e=exp(-r*'+f(1/P.r)+');float nz=wtrNoiseP(vec2(d.x*0.45+d.y*0.21,ph*12.0+r*0.3),12.0);return vec2(e*clamp(0.35+0.25*sin(a)+0.8*(nz-0.35),0.0,1.0),0.08*e*sin(a));}'].join('\n');};
 W.drawFall=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,Q=W.PRESETS.fall;
  S.curtainOpt={rows:o.rows==null?Q.rows:o.rows,cols:o.cols==null?Q.cols:o.cols};const M=W.curtain(S,S.curtainOpt),g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(M.nrm,3));g.setAttribute('wtrUF',new T.Float32BufferAttribute(M.uv,2));g.setIndex(M.idx);g.computeBoundingSphere();
  const col=o.color==null?0xb8d4d6:o.color,op=o.opacity==null?.92:o.opacity;
  const mat=new T.MeshStandardMaterial({color:col,roughness:.42,metalness:0,transparent:true,depthWrite:false,side:T.DoubleSide});sky(mat,o);
  const CH='#include <atmos_waves>\n'+W.fallGLSL(S)+'\nvarying vec2 vWtrUF;';mat.customProgramCacheKey=()=>'wtr-fall:'+W.hashStr(CH+op);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH+'\nattribute vec2 wtrUF;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWtrUF=wtrUF;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <color_fragment>','#include <color_fragment>\n'+
    'float wtrSt=wtrStreak(vWtrUF.x,vWtrUF.y);float wtrFm=wtrFallFoam(vWtrUF.y,wtrSt);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.95,0.97,0.97),wtrFm);'+
    'diffuseColor.a='+f(op)+'*(0.45+0.55*smoothstep(0.25,0.8,wtrSt))*smoothstep(0.0,0.08,vWtrUF.x)*smoothstep(1.0,0.92,vWtrUF.x)*mix(1.0,0.6,smoothstep(0.55,1.0,vWtrUF.y));');};
  const mesh=tag(new T.Mesh(g,mat),S);mesh.renderOrder=o.renderOrder==null?3:o.renderOrder;scene.add(mesh);
  const D={S,mesh,material:mat,curtain:M};
  // the plunge pool: a disc of churned white water at the foot, its rings running out
  if(o.plunge!==false){const P=W.plunge(S),r=P.r*2.4,y=o.plungeY==null?P.y+.06:o.plungeY,pg=new T.CircleGeometry(r,48);pg.rotateX(-Math.PI/2);pg.translate(P.x,y,P.z);
   const pm=new T.MeshStandardMaterial({color:0xeef4f4,roughness:.6,metalness:0,transparent:true,depthWrite:false});pm.customProgramCacheKey=()=>'wtr-plunge:'+W.hashStr(W.fallGLSL(S));
   pm.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);const C2='#include <atmos_waves>\n'+W.fallGLSL(S)+'\nvarying vec3 vWtrW;';
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+C2).replace('#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+C2).replace('#include <color_fragment>','#include <color_fragment>\nvec2 wtrPl=wtrPlunge(vWtrW.xz);diffuseColor.a*=clamp(wtrPl.x*1.15,0.0,0.95);');};
   D.plunge=tag(new T.Mesh(pg,pm),S);D.plunge.name+=':plunge';D.plunge.renderOrder=mesh.renderOrder;scene.add(D.plunge);
   if(o.spray!==false&&A.smoke&&A.PRESETS.smoke&&A.PRESETS.smoke.spray)D.spray=A.smoke([[P.x,y+1,P.z,'spray'],[P.x+P.r*.5,y+1,P.z,'spray'],[P.x-P.r*.5,y+1,P.z-P.r*.4,'spray']]);}
  W.drawn.push(D);return D;};

 // ---- STILL: wtrStillN(p) for surface S
 W.stillGLSL=S=>{const Q=W.PRESETS.still,per=W.period();
  return'vec3 wtrStillN(vec2 p){vec2 s=vec2(0.0);float c;'+Q.ripple.map(r=>{const a=r[2]*Math.PI/180;
    return'c=cos(6.283185307*(fract(p.x*'+f(Math.cos(a)/r[1])+')+fract(p.y*'+f(Math.sin(a)/r[1])+')-fract(atmWaveT*'+f(r[3]/per)+')))*'+f(r[0])+';s+=c*vec2('+f(Math.cos(a))+','+f(Math.sin(a))+');';}).join('')+
   (S.fountain?'vec2 dv=p-vec2('+f(S.fountain[0])+','+f(S.fountain[1])+');float r=length(dv);if(r>1.0e-6){c=cos(6.283185307*(fract(r*'+f(1/Q.fountain.ring)+')-fract(atmWaveT*'+f(Q.fountain.cycles/per)+')))*0.06*exp(-r*'+f(1/Q.fountain.r)+');s+=c*dv/r;}':'')+
   'return normalize(vec3(-s.x,1.0,-s.y));}';};
 W.drawStill=(S,o)=>{o=o||{};const A=ATMOS,T=o.THREE||A.T,scene=o.scene||A.h.scene,M=W.stillMesh(S),g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(M.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(M.pos.length).map((v,i)=>i%3===1?1:0),3));g.setIndex(M.idx);g.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x24443f:o.color,roughness:o.roughness==null?.06:o.roughness,metalness:o.metalness==null?.15:o.metalness,
   transparent:o.opacity!=null&&o.opacity<1,opacity:o.opacity==null?1:o.opacity,depthWrite:!(o.opacity!=null&&o.opacity<1)});sky(mat,o);
  const CH='#include <atmos_waves>\n'+W.stillGLSL(S)+'\nvarying vec3 vWtrW;';mat.customProgramCacheKey=()=>'wtr-still:'+W.hashStr(CH);
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <begin_vertex>','#include <begin_vertex>\nvWtrW=(modelMatrix*vec4(position,1.0)).xyz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(wtrStillN(vWtrW.xz),0.0)).xyz);');};
  const mesh=tag(new T.Mesh(g,mat),S);if(o.renderOrder!=null)mesh.renderOrder=o.renderOrder;scene.add(mesh);
  const D={S,mesh,material:mat};W.drawn.push(D);return D;};
 // one still-water material for many small pools drawn by a build's own (instanced) meshes: troughs, wallows, basins.
 // Their tops take wtrStillN's ripple (no fountain) and the sky; their sides keep their own normals. Each pool should
 // still be a WATER.still record (the twin). o: {THREE, color, roughness, metalness, envMapIntensity}
 W.stillMaterial=o=>{o=o||{};const A=ATMOS,T=o.THREE||A.T;
  const mat=new T.MeshStandardMaterial({color:o.color==null?0x24443f:o.color,roughness:o.roughness==null?.06:o.roughness,metalness:o.metalness==null?.15:o.metalness});sky(mat,o);
  const CH='#include <atmos_waves>\n'+W.stillGLSL({fountain:null})+'\nvarying vec3 vWtrW;varying float vWtrNy;';mat.customProgramCacheKey=()=>'wtr-stillmat';
  mat.onBeforeCompile=sh=>{A.waveUniforms(sh.uniforms);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <project_vertex>','#include <project_vertex>\n'+
    'vec4 wtrWp=vec4(transformed,1.0);vec3 wtrN=objectNormal;\n#ifdef USE_INSTANCING\nwtrWp=instanceMatrix*wtrWp;wtrN=mat3(instanceMatrix)*wtrN;\n#endif\nvWtrW=(modelMatrix*wtrWp).xyz;vWtrNy=normalize(mat3(modelMatrix)*wtrN).y;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n'+
    'if(vWtrNy>0.7)normal=normalize((viewMatrix*vec4(wtrStillN(vWtrW.xz),0.0)).xyz);');};
  return mat;};

 // ---- WET GROUND: the chunk (wtrWetGround(p, gy) from a shore surface, or none; wtrRain the weather's wetness)
 W.wetChunk=(S,uniforms)=>{const A=AT(),U={wtrRain:{value:W.wet()}};A.hook(()=>{U.wtrRain.value=W.wet();});
  let ch='uniform float wtrRain;\n';
  if(S&&S.shore){ch+='#include <atmos_waves>\n'+W.glsl(S)+'\n';A.waveUniforms(uniforms);Object.assign(uniforms,W.uniformsOf(S));}
  else ch+='vec2 wtrWetGround(vec2 p,float gy){return vec2(0.0);}\n';
  const Q=W.PRESETS.shore.wet;
  ch+='float wtrWetness(vec2 wg,float ny){return max(wg.x,wtrRain*smoothstep(0.35,0.8,ny));}\n'+
   'vec3 wtrWetAlbedo(vec3 c,float w){return c*(1.0-'+f(Q.dark)+'*w);}\nfloat wtrWetRough(float r,float w,float film){return mix(mix(r,r*'+f(1-Q.gloss)+',w),0.06,film);}\n';
  Object.assign(uniforms,U);return ch;};
 W.wetGround=(mat,o)=>{o=o||{};const S=o.surface||null,prev=mat.onBeforeCompile;
  const pk=mat.customProgramCacheKey?mat.customProgramCacheKey.bind(mat):()=>prev?prev.toString():'';mat.customProgramCacheKey=()=>pk()+'|wtr-wet:'+(S?W.hashStr(W.glsl(S)):'rain');
  mat.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);const CH=W.wetChunk(S,sh.uniforms)+'varying vec3 vWtrW;varying float vWtrNy;';
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <project_vertex>','#include <project_vertex>\n'+
    'vec4 wtrWp=vec4(transformed,1.0);vec3 wtrN=objectNormal;\n#ifdef USE_INSTANCING\nwtrWp=instanceMatrix*wtrWp;wtrN=mat3(instanceMatrix)*wtrN;\n#endif\nvWtrW=(modelMatrix*wtrWp).xyz;vWtrNy=normalize(mat3(modelMatrix)*wtrN).y;');
   // after everything that sets the albedo (a build's own colour hooks included) and the roughness, before the light
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+CH).replace('#include <emissivemap_fragment>',
    '{vec2 wtrWG=wtrWetGround(vWtrW.xz,vWtrW.y);float wtrW=wtrWetness(wtrWG,vWtrNy);diffuseColor.rgb=wtrWetAlbedo(diffuseColor.rgb,wtrW);\n'+
    '#if defined(STANDARD)\nroughnessFactor=wtrWetRough(roughnessFactor,wtrW,wtrWG.y);\n#endif\n}\n#include <emissivemap_fragment>');};
  mat.needsUpdate=true;return mat;};
})();
