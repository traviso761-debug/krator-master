// ================================================================= THE GROUND AND THE SEA: the shore's mesh, the Ring Sea's water
// The ground is one warped grid about the hull (2.5 m cells over the arcology, stretching to 2.4 km at the rim) on
// terrainH (12-nr-world.js), coloured by what it is: wet sand at the waterline, dry sand, the dune grass behind, the sea
// floor. The sea is the shared wave field (core/atmos, `#include <atmos_waves>`) on Voth's water shader: depth from the
// ground, shallows to deep, a foam lap at the waterline. Inside the hull the same water stands in the holds (they are
// open to the sea), so the holds need no water of their own.
function nrWarp(u,a,b){const s=u<0?-1:1,x=Math.abs(u);return s*(a*x+b*Math.pow(x,5));}
function nrGroundMesh(){const N=320,pos=[],col=[],uv=[],idx=[];const c=new THREE.Color();
 const wet=new THREE.Color(0x9a8a6a).convertSRGBToLinear(),dry=new THREE.Color(0xd8c8a4).convertSRGBToLinear(),grass=new THREE.Color(0x8a9a5a).convertSRGBToLinear(),
  floor=new THREE.Color(0x8a7a5a).convertSRGBToLinear(),deep=new THREE.Color(0x4a5a52).convertSRGBToLinear();
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=nrWarp(i/N*2-1,400,2000),z=nrWarp(j/N*2-1,400,2000),h=terrainH(x,z);pos.push(x,h,z);uv.push(x/4,z/4);
  const d=z-nrShoreZ(x);
  if(h<-.4)c.copy(floor).lerp(deep,clamp(-h/14,0,1));
  else if(h<.9)c.copy(wet).lerp(dry,clamp((h+.4)/1.3,0,1));
  else{c.copy(dry);const g=clamp((d-120)/90,0,1)*clamp((h-4)/4,0,1)*(.6+.4*fbm(x/40,z/40,9.1,2));c.lerp(grass,g);}
  col.push(c.r,c.g,c.b);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx.push(a,d,b,b,d,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();
 const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 const L=KMAT.mode==='lib'?KMAT.packed('noahs-regret','sand'):null;
 if(L){const T=KMAT.textures(L,{aniso:TEXANISO});for(const t of [T.map,T.normalMap,T.roughnessMap])if(t){t.repeat.set(4/L.scale[0],4/L.scale[1]);}
  m.map=T.map;m.normalMap=T.normalMap;m.roughnessMap=T.roughnessMap;matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 const M=new THREE.Mesh(g,m);M.receiveShadow=true;M.userData.isGround=true;M.name='ground';return M;}
// ---------------------------------------------------------------- the sea
const nrWaterUni={uSun:{value:new THREE.Vector3(.4,.7,.3)},uShallow:{value:new THREE.Color(0x5f9a96)},uDeep:{value:new THREE.Color(0x163a4c)},
 uSky:{value:new THREE.Color(0xb8c8d0)},uFogCol:{value:new THREE.Color(0xc0ccd0)},uFogDen:{value:.0004},uCam:{value:new THREE.Vector3()},uBodyK:{value:1},uSpecCol:{value:new THREE.Color(1,.95,.86)}};
function nrSeaMesh(){const N=220,pos=[],dep=[],idx=[];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=nrWarp(i/N*2-1,520,5500),z=nrWarp(j/N*2-1,520,5500);pos.push(x,0,z);dep.push(Math.max(0,-terrainH(x,z)));}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx.push(a,d,b,b,d,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));
 const m=new THREE.ShaderMaterial({uniforms:nrWaterUni,transparent:true,side:THREE.DoubleSide,depthWrite:false,
  vertexShader:['#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
   'void main(){ vec3 pos=position; vP=pos.xz; vD=aDepth; float att=clamp(aDepth/7.0,0.0,1.0); pos.y+=atmWaveHeight(pos.xz,0.0)*att;',
   ' vec4 wp=modelMatrix*vec4(pos,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
  fragmentShader:['precision highp float;','#include <atmos_waves>','uniform float uFogDen; uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam,uSpecCol; uniform float uBodyK;',
   'varying vec3 vW; varying float vD; varying vec2 vP;',
   'void main(){ float att=clamp(vD/7.0,0.0,1.0); float vdist=length(uCam-vW); float lod=1.0-smoothstep(260.0,1500.0,vdist);',
   ' vec3 N=atmWaveNormal(vP,vdist,3.0*(0.08+0.92*att)); vec3 V=normalize(uCam-vW); if(uCam.y<vW.y)N=-N;',
   ' float fres=pow(1.0-clamp(abs(dot(N,V)),0.0,1.0),3.4); float deepT=smoothstep(0.8,18.0,vD); vec3 body=mix(uShallow,uDeep,deepT);',
   ' float diff=clamp(dot(N,uSun),0.0,1.0); body*=(0.66+0.44*diff)*uBodyK; vec3 H=normalize(uSun+V);',
   ' float spec=pow(clamp(dot(N,H),0.0,1.0),190.0)*1.5*lod; float glit=pow(clamp(dot(N,H),0.0,1.0),34.0)*0.10;',
   ' vec3 col=mix(body,uSky,clamp(fres*0.86,0.0,0.82)); col+=uSpecCol*(spec+glit);',
   ' float foam=smoothstep(1.4,0.1,vD)*(0.5+0.5*lod*sin(vP.x*0.18+vP.y*0.13+6.283185307*fract(atmWaveT*0.255)));',
   ' col=mix(col,vec3(0.90,0.89,0.85),clamp(foam,0.0,0.55)); float alpha=mix(0.74,0.96,deepT); alpha=mix(alpha,0.99,clamp(fres,0.0,1.0));',
   ' float fd=vdist*uFogDen; float fog=1.0-exp(-fd*fd); col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
   ' gl_FragColor=vec4(col,alpha); }'].join('\n')});
 const M=new THREE.Mesh(g,m);M.renderOrder=1;M.name='sea';M.userData.probeSkip=true;M.frustumCulled=false;return M;}
