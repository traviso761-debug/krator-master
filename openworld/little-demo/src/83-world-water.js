// ================================================================= OPEN WORLD — the water: the sea and the lakes of the scale model
// [G shader] One sheet per terrain chunk that holds water, at the level WORLD.water gives (the Ring Sea, the abyss's
// salt lakes, the highland lakes), drawn with the chunk and freed with it. A vertex with no water takes the nearest wet
// vertex's level: under ground it sinks below the shore (hidden by the land); on ground lower than that level the water
// runs over it, so no sheet stands up as a wall.
// THE SHADER is the shared one every Krator water takes (README.md, core/atmos): the open-water wave field
// (#include <atmos_waves>, its clock ATMOS.U.waveTime), the swell displacing the sheet where it is deep enough and the
// mesh fine enough, the chop and the mid waves shading it, faded by distance; a fresnel toward the sky's colour, the sun's
// glint, the shallows' colour by depth, a lap of foam at the shore. Written as Voth's bay is (settlements/voth/src/
// 75-terrain.js), with the logarithmic depth this world draws with. A salt lake (the climate's WX, XW, XS) is paler and
// milky. Not yet: the sky's reflection as an environment map (core/atmos b-skylight takes standard materials only).
var WATER;LATE.push(()=>{WATER=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,NW=16;
ATMOS.init({THREE,scene,camera,hour:()=>11.5,onFrame:fn=>HOST.TICKS.push(fn),ground:(x,z)=>WORLD.H(x,z),seed:4242,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>HOST.renderer.getPixelRatio()});
const U=ATMOS.waveUniforms({uSun:{value:HOST.SUN_DIR.clone()},uShallow:{value:new THREE.Color(0x6d9c92)},uDeep:{value:new THREE.Color(0x1d3c48)},
 uSaltS:{value:new THREE.Color(0xc8dccd)},uSaltD:{value:new THREE.Color(0x6fa79c)},uSky:{value:new THREE.Color(0xc6ccd0)},
 uFogCol:{value:HOST.HAZE.clone()},uFogDen:{value:HOST.scene.fog.density},uCam:{value:new THREE.Vector3()}});
const MAT=new THREE.ShaderMaterial({uniforms:U,transparent:true,side:THREE.FrontSide,
 vertexShader:['#include <common>','#include <logdepthbuf_pars_vertex>','#include <atmos_waves>',
  'attribute float aDepth;attribute float aSalt;varying vec3 vW;varying float vD;varying float vS;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vD=aDepth;vS=aSalt;',
  ' float att=clamp(aDepth/7.0,0.0,1.0);wp.y+=atmWaveHeight(wp.xz,0.0)*att;',   // the swell only: the sheet cannot carry the chop
  ' vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;','#include <logdepthbuf_vertex>','}'].join('\n'),
 fragmentShader:['precision highp float;','#include <common>','#include <logdepthbuf_pars_fragment>','#include <atmos_waves>',
  'uniform float uFogDen;uniform vec3 uSun,uShallow,uDeep,uSaltS,uSaltD,uSky,uFogCol,uCam;',
  'varying vec3 vW;varying float vD;varying float vS;',
  'void main(){','#include <logdepthbuf_fragment>',
  ' float att=clamp(vD/7.0,0.0,1.0);float vdist=length(uCam-vW);float lod=1.0-smoothstep(260.0,1500.0,vdist);',
  ' vec3 N=atmWaveNormal(vW.xz,vdist,3.0*(0.08+0.92*att)*(1.0-0.6*vS));',   // salt lakes lie flatter: brine is heavy
  ' vec3 V=normalize(uCam-vW);float fres=pow(1.0-clamp(dot(N,V),0.0,1.0),3.4);',
  ' float deepT=smoothstep(0.8,20.0,vD);vec3 body=mix(mix(uShallow,uDeep,deepT),mix(uSaltS,uSaltD,deepT),vS);',
  ' float diff=clamp(dot(N,uSun),0.0,1.0);body*=(0.66+0.44*diff);',
  ' vec3 H=normalize(uSun+V);float spec=pow(clamp(dot(N,H),0.0,1.0),190.0)*1.5*lod;float glit=pow(clamp(dot(N,H),0.0,1.0),34.0)*0.10;',
  ' vec3 col=mix(body,uSky,clamp(fres*0.86,0.0,0.82));col+=vec3(1.0,0.95,0.84)*(spec+glit);',
  ' float foam=smoothstep(1.7,0.15,vD)*(0.5+0.5*lod*sin(vW.x*0.18+vW.z*0.13+6.283185307*fract(atmWaveT*0.255)));',
  ' col=mix(col,vec3(0.90,0.89,0.85),clamp(foam,0.0,0.58));',
  ' float alpha=mix(0.72,0.96,deepT);alpha=mix(alpha,0.99,clamp(fres,0.0,1.0));',
  ' float fd=vdist*uFogDen;float fog=1.0-exp(-fd*fd);col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
  ' gl_FragColor=vec4(col,mix(alpha,1.0,clamp(fog,0.0,1.0)));}'].join('\n')});
function forChunk(n){const c=n.chunk,s=n.s,ds=s/NW,N1=NW+1;
 const pos=new Float32Array(N1*N1*3),dep=new Float32Array(N1*N1),salt=new Float32Array(N1*N1),lev=new Float32Array(N1*N1),gr=new Float32Array(N1*N1),riv=new Uint8Array(N1*N1);let any=false;
 for(let j=0;j<=NW;j++)for(let i=0;i<=NW;i++){const v=j*N1+i,x=c.x0+i*ds,z=c.z0+j*ds,l=WORLD.lakeWater(x,z),r=WORLD.riverWater(x,z);
  lev[v]=Math.max(l,r);riv[v]=r>l?1:0;gr[v]=TERRAIN.chunkH(c,x,z);if(lev[v]>-1e8)any=true;}
 if(!any)return;
 // a dry vertex takes the nearest wet one's level where the ground is below it (a lake's plane runs on to its shore)
 // and sinks under the ground where it is not; next to a RIVER it always sinks: a river falls along its course, so its
 // level carried sideways would stand over the lower ground downstream as a slab. The wet levels are read from a copy:
 // filled in place, a vertex just sunk counted as wet for the next, and the chain ran a plane down a slope
 const lev0=lev.slice();
 for(let v=0;v<N1*N1;v++){if(lev0[v]>-1e8)continue;let bd=1e9,L=-1e9,R=0;const vi=v%N1,vj=(v-vi)/N1;
  for(let u=0;u<N1*N1;u++){if(lev0[u]<-1e8)continue;const ui=u%N1,uj=(u-ui)/N1,d=(ui-vi)*(ui-vi)+(uj-vj)*(uj-vj);if(d<bd){bd=d;L=lev0[u];R=riv[u];}}
  lev[v]=R||gr[v]>L?Math.min(L-5,gr[v]-30):L;}
 for(let j=0;j<=NW;j++)for(let i=0;i<=NW;i++){const x=c.x0+i*ds,z=c.z0+j*ds,v=j*N1+i;
  pos[v*3]=i*ds;pos[v*3+1]=lev[v];pos[v*3+2]=j*ds;dep[v]=Math.max(0,lev[v]-gr[v]);
  salt[v]=WORLD.saltAt(x,z);}
 const idx=[];for(let j=0;j<NW;j++)for(let i=0;i<NW;i++){const a=j*N1+i,b=a+N1,cc=b+1,d=a+1;idx.push(a,b,d,b,cc,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 g.setAttribute('aDepth',new THREE.BufferAttribute(dep,1));g.setAttribute('aSalt',new THREE.BufferAttribute(salt,1));g.setIndex(idx);
 g.computeBoundingSphere();
 const m=new THREE.Mesh(g,MAT);m.position.set(c.x0,0,c.z0);m.matrixAutoUpdate=false;m.updateMatrix();m.renderOrder=2;m.userData.inspectLabel='water';
 c.water=m;m.visible=c.mesh.visible;scene.add(m);}
// every frame: the camera and the haze the shader fogs with
function frame(){U.uCam.value.copy(camera.position);U.uFogDen.value=scene.fog.density;}
return{forChunk,MAT,frame};})();});
