// ================================================================= CORE — water: drawing the mud pots and the fumaroles' steam  [draw] + [G shader]
// Needs 20, 52 and 52b (WATER.thermalUniforms: the shared clock, sun, light and wind), 52c (the records and their GLSL), three.js r128 (o.THREE,
// or a global THREE) and core/rand. Nothing runs at load time. Not listed by any page yet, and not judged by eye on a GPU (core/water/README.md,
// "Geothermal surfaces"): the test runs each chunk's text against its twin and builds both drawings on a three.js stub.
//
//   WATER.drawMudpot(S, o)  a mud pot (WATER.mudpot) as a disc at its level whose vertices the shader lifts by mudH (WATER.mudGLSL, twin
//        S.surfaceAt): the grey mud swelling, its bubbles rising, popping and ringing out, lit by a normal from the same function (the
//        Throne's isle mud pots, 85-host-springs.js, on the record's hashed slots). The dome tops pale as the skin stretches, as the Throne's.
//        A cone (kind 'cone') also gets its flank: a dried-mud frustum from the foot (level - cone.h, radius cone.r) to the crater's lip.
//        One material per pot (its uniforms are its slots). -> {mesh, material, cone (a mesh or null), tris}
//   WATER.drawFumarole(S, o)  a fumarole's steam (WATER.fumaroleParticles) as one Points: the Throne's steam puffs, each as thick as the vent
//        breathed when it left (fumSteam at its emission time: WATER.fumGLSL, twin S.state), drifting downwind. -> {points, material, count}
//   o: {THREE, scene (added to when given), uniforms (WATER.thermalUniforms: uT, uSun, uLight, uScale, uWind; shared), fog, renderOrder,
//       onMaterial(m)}. Meshes are named 'water:<name>' with userData.inspectLabel; the steam has userData.probeSkip.
(function(){
 if(typeof WATER==='undefined'||!WATER.mudpot)throw new Error('52d-core-water-thermal-draw: load core/water/geyser/52c-core-water-thermal.js first');
 const W=WATER;if(W.drawMudpot)return;   /* loaded twice: a no-op */
 if(!W.thermalUniforms)throw new Error('52d-core-water-thermal-draw: load core/water/geyser/52b-core-water-geyser-draw.js first (WATER.thermalUniforms)');
 const TAU=Math.PI*2,glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},v3=c=>'vec3('+c.map(glf).join(',')+')';
 const TH=o=>{const T=o.THREE||(typeof THREE!=='undefined'?THREE:null);if(!T)throw new Error('core/water thermal drawing: three.js (o.THREE or a global THREE)');return T;};
 const fogged=(T,o,spec)=>{const m=new T.ShaderMaterial(Object.assign({fog:true},spec,{uniforms:Object.assign(T.UniformsUtils.merge([T.UniformsLib.fog]),spec.uniforms||{})}));
  const f=o.fog;if(f){m.uniforms.fogColor.value=f.color;m.uniforms.fogDensity.value=f.density;}if(o.onMaterial)o.onMaterial(m);return m;};
 const tag=(m,S)=>{m.name='water:'+S.name;m.userData.inspectLabel=S.name;m.userData.water=S.id;return m;};

 // ---- the mud pot
 W.drawMudpot=(S,o)=>{o=o||{};if(!S||S.kind!=='mud')throw new Error('WATER.drawMudpot: not a mud pot (WATER.mudpot)');
  const T=TH(o),U=W.thermalUniforms(o),MU=W.mudUniforms(S),V4=a=>new T.Vector4(a[0],a[1],a[2],a[3]),C=S.colour;
  const m=fogged(T,o,{uniforms:{uT:U.uT,uSun:U.uSun,uLight:U.uLight,uMB:{value:MU.uMB.map(V4)},uMS:{value:MU.uMS.map(V4)},uMW:{value:V4(MU.uMW)},uMC:{value:new T.Vector3(S.x,S.z,S.level)}},
   vertexShader:['#include <fog_pars_vertex>',W.mudGLSL(),'uniform float uT;uniform vec3 uMC;varying float vH;varying vec3 vN;varying vec3 vWP;',
    'void main(){vec2 p=position.xz-uMC.xy;float h=mudH(p,uT);float e=0.06;',
    ' float hx=mudH(p+vec2(e,0.0),uT)-mudH(p-vec2(e,0.0),uT);float hz=mudH(p+vec2(0.0,e),uT)-mudH(p-vec2(0.0,e),uT);vN=normalize(vec3(-hx,2.0*e,-hz));vH=h;',
    ' vec4 wp=modelMatrix*vec4(position.x,uMC.z+h,position.z,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;uniform vec3 uSun;varying float vH;varying vec3 vN;varying vec3 vWP;',
    'void main(){vec3 n=normalize(vN);vec3 c=mix('+v3(C.wet)+','+v3(C.dry)+',clamp(vH*3.0,0.0,1.0));float lit=0.45+0.55*max(dot(n,normalize(uSun)),0.0);',
    ' vec3 V=normalize(cameraPosition-vWP);float sp=pow(max(dot(reflect(-normalize(uSun),n),V),0.0),40.0)*0.22;',   /* a wet sheen */
    ' gl_FragColor=vec4((c*lit+sp)*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
  const r=S.r,NR=Math.max(8,Math.min(64,Math.round(r/.18))),NA=Math.max(28,Math.min(192,Math.round(TAU*r/.2))),pos=[S.x,S.level,S.z],idx=[];
  for(let i=1;i<=NR;i++)for(let a=0;a<NA;a++){const t=i/NR,an=a/NA*TAU;pos.push(S.x+Math.cos(an)*r*t,S.level,S.z+Math.sin(an)*r*t);}
  for(let a=0;a<NA;a++)idx.push(0,1+(a+1)%NA,1+a);
  for(let i=1;i<NR;i++){const A0=1+(i-1)*NA,B0=1+i*NA;for(let a=0;a<NA;a++){const a1=(a+1)%NA;idx.push(A0+a,A0+a1,B0+a,A0+a1,B0+a1,B0+a);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);
  const mesh=tag(new T.Mesh(g,m),S);mesh.frustumCulled=false;mesh.renderOrder=o.renderOrder==null?1:o.renderOrder;if(o.scene)o.scene.add(mesh);
  let cone=null;
  if(S.cone){const K=S.cone,N=Math.max(24,Math.min(96,Math.round(TAU*K.r/.6))),cp=[],ci=[],lip=r*1.05,y0=S.level-K.h,y1=S.level+.05,rows=4;
   for(let j=0;j<=rows;j++){const f=j/rows,R=K.r+(lip-K.r)*Math.pow(f,.7),y=y0+(y1-y0)*f;for(let a=0;a<N;a++){const an=a/N*TAU;cp.push(S.x+Math.cos(an)*R,y,S.z+Math.sin(an)*R);}}
   for(let j=0;j<rows;j++)for(let a=0;a<N;a++){const a1=(a+1)%N,p=j*N,q=(j+1)*N;ci.push(p+a,q+a,p+a1,p+a1,q+a,q+a1);}
   const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(cp,3));cg.setIndex(ci);if(cg.computeVertexNormals)cg.computeVertexNormals();
   const k=.85,cm=new T.MeshStandardMaterial({color:new T.Color(C.dry[0]*k,C.dry[1]*k,C.dry[2]*k),roughness:.95,metalness:0});if(o.onMaterial)o.onMaterial(cm);
   cone=tag(new T.Mesh(cg,cm),S);cone.name+=':cone';if(o.scene)o.scene.add(cone);}
  return{mesh,material:m,cone,tris:idx.length/3};};

 // ---- the fumarole's steam (the Throne's STEAM_MAT, breathing on the vent's cycle)
 W.drawFumarole=(S,o)=>{o=o||{};if(!S||S.kind!=='fumarole')throw new Error('WATER.drawFumarole: not a fumarole (WATER.fumarole)');
  const T=TH(o),U=W.thermalUniforms(o),F=W.fumUniform(S);
  const m=fogged(T,o,{transparent:true,depthWrite:false,uniforms:{uT:U.uT,uScale:U.uScale,uLight:U.uLight,uWind:U.uWind,uFum:{value:new T.Vector4(F[0],F[1],F[2],F[3])}},
   vertexShader:['#include <fog_pars_vertex>',W.fumGLSL(),'attribute vec4 aS;uniform float uT,uScale;uniform vec2 uWind;varying float vA;',
    'void main(){float ph=fract(uT*aS.y+aS.x);float s=fumSteam(uT-ph/aS.y);',
    ' vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4)+vec3(uWind.x,0.0,uWind.y)*ph*aS.w*0.4;',
    ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)*(0.6+0.4*min(s,1.5))/max(1.0,-mvPosition.z);',
    ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5*min(s,1.5);','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['#include <fog_pars_fragment>','uniform float uLight;varying float vA;',
    'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5||vA<=0.0)discard;gl_FragColor=vec4(vec3(0.93,0.92,0.89)*mix(1.0,0.3,1.0-uLight),vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
  const D=W.fumaroleParticles(S),geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(D.pos,3));geo.setAttribute('aS',new T.Float32BufferAttribute(D.aS,4));
  const pts=tag(new T.Points(geo,m),S);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=o.renderOrder==null?2:o.renderOrder;if(o.scene)o.scene.add(pts);
  return{points:pts,material:m,count:D.count};};
})();
