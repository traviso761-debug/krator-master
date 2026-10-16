// ================================================================= THE SHORE: the harbour row stands on a beach, its piers in the sea
// The kit sheet is dry ground (90-scene.js) except under the harbour row (89-rows.js: a family with shore:true): there the
// ground falls from the row's centre line (z = the row's z, the SHORELINE) to the sea floor, a sand strip covers the beach,
// and the Ring Sea fills everything north of it, on the shared wave field (core/atmos, `#include <atmos_waves>`) with
// Noah's Regret's water shader (depth shading, a foam lap at the waterline). A harbour def keeps its land at local z > 0 and
// builds its piers out over local z < 0 (toward -z, the sea), its piles down to the floor (IS_SEA). terrainH stays 0 (the
// harbour defs are placed on the dry line); only the drawn ground dips.
const IS_SEA={level:-.9,floor:-3.8,shoreZ:null,beach:5,slope:9};
(function(){const R=ROWS.find(r=>{const F=FAMILIES.find(f=>f.name===r.family);return F&&F.shore;});if(!R)return;IS_SEA.shoreZ=R.z;})();
/* the drawn ground's height at z (0 inland, falling through the beach to the sea floor) */
function isSeaGround(z){const S=IS_SEA;if(S.shoreZ===null)return 0;const d=S.shoreZ+1.5-z;if(d<=0)return 0;return S.floor*smooth(0,S.slope,d);}
(function(){if(IS_SEA.shoreZ===null)return;
 /* the ground: the same plane with rows of vertices along z, lowered north of the shore */
 const g=new THREE.PlaneGeometry(GROUND_SIZE,GROUND_SIZE,8,480),p=g.attributes.position;for(let i=0;i<p.count;i++){const z=-p.getY(i);p.setZ(i,isSeaGround(z));}
 g.computeVertexNormals();groundM.geometry.dispose();groundM.geometry=g;
 /* the sand: a strip from the beach's top down under the water, in the library's coast sand */
 const B={},keepT=GTARGET;GTARGET=B;resetCM();const z0=IS_SEA.shoreZ+IS_SEA.beach,z1=IS_SEA.shoreZ-14;
 psurf('sand',(u,v)=>{const x=(u-.5)*GROUND_SIZE*.6,z=lerp(z0,z1,v),y=isSeaGround(z)+.03-.02*smooth(z0-1.5,z0,z);return [x,y,z];},40,40,hc(SVPAL.sandG[0]),{up:true});
 GTARGET=keepT;for(const m of flushBuckets(B,scene,false)){m.receiveShadow=true;m.userData.probeSkip=true;m.userData.isGround=true;}
 /* the sea */
 const U={uSun:{value:new THREE.Vector3(.4,.7,.3)},uShallow:{value:new THREE.Color(0x4f9a92)},uDeep:{value:new THREE.Color(0x15485a)},uSky:{value:new THREE.Color(0xb8c8d0)},
  uFogCol:{value:new THREE.Color(0xc0ccd0)},uFogDen:{value:.0004},uCam:{value:new THREE.Vector3()},uBodyK:{value:1},uSpecCol:{value:new THREE.Color(1,.95,.86)}};
 ATMOS.waveUniforms(U);
 const N=200,pos=[],dep=[],idx=[],X=GROUND_SIZE*.5,zA=IS_SEA.shoreZ+2,zB=-GROUND_SIZE*.5-1200;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=(i/N*2-1)*(X+1200),t=j/N,z=lerp(zA,zB,t*t);pos.push(x,IS_SEA.level,z);dep.push(Math.max(0,IS_SEA.level-isSeaGround(z)));}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx.push(a,b,d,b,e,d);}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));sg.setIndex(new THREE.Uint32BufferAttribute(idx,1));
 const sm=new THREE.ShaderMaterial({uniforms:U,transparent:true,side:THREE.DoubleSide,depthWrite:false,
  vertexShader:['#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
   'void main(){ vec3 pos=position; vP=pos.xz; vD=aDepth; float att=clamp(aDepth/7.0,0.0,1.0); pos.y+=atmWaveHeight(pos.xz,0.0)*att*0.6;',
   ' vec4 wp=modelMatrix*vec4(pos,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'].join('\n'),
  fragmentShader:['precision highp float;','#include <atmos_waves>','uniform float uFogDen; uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam,uSpecCol; uniform float uBodyK;',
   'varying vec3 vW; varying float vD; varying vec2 vP;',
   'void main(){ float att=clamp(vD/7.0,0.0,1.0); float vdist=length(uCam-vW); float lod=1.0-smoothstep(260.0,1500.0,vdist);',
   ' vec3 N=atmWaveNormal(vP,vdist,3.0*(0.08+0.92*att)); vec3 V=normalize(uCam-vW); if(uCam.y<vW.y)N=-N;',
   ' float fres=pow(1.0-clamp(abs(dot(N,V)),0.0,1.0),3.4); float deepT=smoothstep(0.6,12.0,vD); vec3 body=mix(uShallow,uDeep,deepT);',
   ' float diff=clamp(dot(N,uSun),0.0,1.0); body*=(0.66+0.44*diff)*uBodyK; vec3 H=normalize(uSun+V);',
   ' float spec=pow(clamp(dot(N,H),0.0,1.0),190.0)*1.5*lod; float glit=pow(clamp(dot(N,H),0.0,1.0),34.0)*0.10;',
   ' vec3 col=mix(body,uSky,clamp(fres*0.86,0.0,0.82)); col+=uSpecCol*(spec+glit);',
   ' float foam=smoothstep(0.9,0.05,vD)*(0.5+0.5*lod*sin(vP.x*0.18+vP.y*0.13+6.283185307*fract(atmWaveT*0.255)));',
   ' col=mix(col,vec3(0.90,0.89,0.85),clamp(foam,0.0,0.55)); float alpha=mix(0.7,0.95,deepT); alpha=mix(alpha,0.99,clamp(fres,0.0,1.0));',
   ' float fd=vdist*uFogDen; float fog=1.0-exp(-fd*fd); col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
   ' gl_FragColor=vec4(col,alpha); }'].join('\n')});
 const M=new THREE.Mesh(sg,sm);M.renderOrder=1;M.name='sea';M.userData.probeSkip=true;M.frustumCulled=false;scene.add(M);IS_SEA.mesh=M;
 const keepSky=skyApply;skyApply=function(){keepSky();const L=KratorSky.lighting();U.uSun.value.copy(LIGHTDIR);U.uFogCol.value.copy(L.fog);U.uSky.value.copy(L.fog).lerp(new THREE.Color(.75,.85,.92),.4);U.uBodyK.value=L.sunDir.y>.02?1:.35;};
 skyApply();FRAME_HOOKS.push(()=>U.uCam.value.copy(camera.position));})();
