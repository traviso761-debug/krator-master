// ================================================================= SCULPTED CROOKWASH CHASM, CASCADE & 25 DEG GORGE TERRAIN
// Runs after 90-scene.js (ROWS, SITES, groundM exist) and before 92-world.js calls buildWorld().
//   1. hillside row: 25 deg volcanic-tuff & basalt gorge ridge proving zero boxy podiums & battered root-skirts!
//   2. chasm row: dramatic Crookwash river gorge (`-4.2 m` bed, `#include <atmos_waves>` mountain torrent at `-1.05 m`,
//      lateral chasm clefts cutting right beneath the arches of `dv-bridge-duel` and `dv-flume-keep`, opposite `12.5 m`
//      columnar-basalt canyon wall, plus a rim-side timber gravity log-flume feeder channel!).
const DV_TERRAIN={hillZ:null,hillD:16,chasmZ:null,chasmW:180,archXs:[],riverLevel:-1.05,riverBed:-4.2};
(function(){
 for(const r of ROWS){
  const F=FAMILIES.find(f=>f.name===r.family);if(!F)continue;
  if(F.hillside){DV_TERRAIN.hillZ=r.z;DV_TERRAIN.hillD=Math.max(15,r.d+4);}
  if(F.chasm){DV_TERRAIN.chasmZ=r.z;DV_TERRAIN.chasmW=Math.max(140,r.w+24);}
 }
 for(const s of SITES){
  if(s.key==='dv-bridge-duel'||s.key==='dv-flume-keep')DV_TERRAIN.archXs.push(s.x);
 }
})();

/* override terrainH(x,z) BEFORE 92-world.js builds the world so hillside buildings sit on real steep slopes and chasm arches span water! */
terrainH=function(x,z){
 const T=DV_TERRAIN;
 /* 1. 25 deg Vardzieti gorge slope showcase ridge */
 if(T.hillZ!==null){
  const zFront=T.hillZ+T.hillD*.68,zCrest=T.hillZ-T.hillD*.55,zBack=T.hillZ-T.hillD*1.25;
  if(z<=zFront+4&&z>=zBack-4){
   const u=z>=zCrest?smooth(zFront+4,zCrest,z):1-smooth(zCrest,zBack-4,z);
   const cross=.82*Math.sin(x*.052)+.32*Math.cos(x*.105);
   return Math.max(0,u*7.2*(.88+.12*(cross+.5)));
  }
 }
 /* 2. Crookwash Chasm, lateral arch clefts & opposite canyon scarp */
 if(T.chasmZ!==null){
  /* lateral chasm pockets cutting directly beneath the pointed arches of dv-bridge-duel & dv-flume-keep (`|x - ax| < 3.5`)
     while keeping their stone abutments & front doors at `|x - ax| >= 4.4` solidly on y = 0 bedrock! */
  let archCut=0;
  for(const ax of T.archXs){
   const dx=Math.abs(x-ax);
   if(dx<4.1&&z<=T.chasmZ+5.4&&z>=T.chasmZ-4.2){
    const ux=1-smooth(2.5,4.1,dx),uz=1-smooth(3.2,5.4,z-T.chasmZ);
    archCut=Math.min(archCut,-3.75*ux*uz);
   }
  }
  /* main Crookwash torrent gorge north (-z) of chasmZ - 2.9, plus opposite 12.5 m gorge wall beyond chasmZ - 19 */
  const zRim=T.chasmZ-2.9,zBedA=T.chasmZ-6.2,zBedB=T.chasmZ-15.6,zFarToe=T.chasmZ-18.8,zFarCrest=T.chasmZ-25.5,zFarBack=T.chasmZ-36.0;
  let mainH=0;
  if(z<zRim&&z>=zFarToe){
   if(z>=zBedA)mainH=T.riverBed*smooth(zRim,zBedA,z);
   else if(z>=zBedB)mainH=T.riverBed+.35*Math.sin(x*.09);
   else mainH=T.riverBed*(1-smooth(zBedB,zFarToe,z));
  }else if(z<zFarToe&&z>=zFarBack&&Math.abs(x)<T.chasmW*.62){
   const xFade=1-smooth(T.chasmW*.48,T.chasmW*.62,Math.abs(x));
   const crest=(11.8+2.1*Math.sin(x*.08)+1.3*Math.cos(x*.15))*xFade;
   mainH=z>=zFarCrest?crest*smooth(zFarToe,zFarCrest,z):crest*(1-smooth(zFarCrest,zFarBack,z));
  }
  return Math.min(archCut,mainH)+(mainH>0?mainH:0);
 }
 return 0;
};

(function(){
 /* rebuild groundM as a sculpted mesh matching terrainH(x,z) everywhere */
 const NX=112,NZ=220;
 const g=new THREE.PlaneGeometry(GROUND_SIZE,GROUND_SIZE,NX,NZ);
 g.rotateX(-PI/2);
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i);
  p.setY(i,terrainH(x,z));
 }
 g.computeVertexNormals();
 groundM.geometry.dispose();
 groundM.rotation.set(0,0,0);
 groundM.geometry=g;
 groundM.updateMatrixWorld(true);

 /* Crookwash Mountain Torrent (#include <atmos_waves>) + Rim Timber Gravity Flume Feeder Channel */
 if(DV_TERRAIN.chasmZ!==null){
  const S=DV_TERRAIN;
  const U={
   uSun:{value:new THREE.Vector3(.4,.7,.3)},uShallow:{value:new THREE.Color(0x4ba09c)},uDeep:{value:new THREE.Color(0x185262)},
   uSky:{value:new THREE.Color(0xbcd0da)},uFogCol:{value:new THREE.Color(0xcad3d8)},uFogDen:{value:.0004},
   uCam:{value:new THREE.Vector3()},uBodyK:{value:1},uSpecCol:{value:new THREE.Color(1,.96,.88)}
  };
  ATMOS.waveUniforms(U);
  const NXW=120,NZW=48,pos=[],dep=[],idx=[];
  const xSpan=Math.max(140,S.chasmW*.65),zA=S.chasmZ+5.6,zB=S.chasmZ-19.2;
  for(let j=0;j<=NZW;j++)for(let i=0;i<=NXW;i++){
   const x=(i/NXW*2-1)*xSpan,z=lerp(zA,zB,j/NZW);
   const d0=S.riverLevel-terrainH(x,z);
   pos.push(x,S.riverLevel,z);dep.push(Math.max(0,d0));
  }
  for(let j=0;j<NZW;j++)for(let i=0;i<NXW;i++){
   const a=j*(NXW+1)+i,b=a+1,d=a+NXW+1,e=d+1;
   if(dep[a]>.02||dep[b]>.02||dep[d]>.02||dep[e]>.02)idx.push(a,b,d,b,e,d);
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  sg.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));
  sg.setIndex(new THREE.Uint32BufferAttribute(idx,1));
  const sm=new THREE.ShaderMaterial({
   uniforms:U,transparent:true,side:THREE.DoubleSide,depthWrite:false,
   vertexShader:[
    '#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ vec3 pos=position; vP=pos.xz; vD=aDepth; float att=clamp(aDepth/3.2,0.0,1.0); pos.y+=atmWaveHeight(pos.xz,0.0)*att*0.35;',
    ' vec4 wp=modelMatrix*vec4(pos,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'
   ].join('\n'),
   fragmentShader:[
    'precision highp float;','#include <atmos_waves>',
    'uniform float uFogDen; uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam,uSpecCol; uniform float uBodyK;',
    'varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ float att=clamp(vD/3.2,0.0,1.0); float vdist=length(uCam-vW); float lod=1.0-smoothstep(240.0,1400.0,vdist);',
    ' vec3 N=atmWaveNormal(vP,vdist,3.4*(0.15+0.85*att)); vec3 V=normalize(uCam-vW); if(uCam.y<vW.y)N=-N;',
    ' float fres=pow(1.0-clamp(abs(dot(N,V)),0.0,1.0),3.2); float deepT=smoothstep(0.3,3.2,vD); vec3 body=mix(uShallow,uDeep,deepT);',
    ' float foam=smoothstep(0.55,0.05,vD)*0.28; body=mix(body,vec3(0.86,0.95,0.96),foam);',
    ' float diff=clamp(dot(N,uSun),0.0,1.0); body*=(0.68+0.44*diff)*uBodyK; vec3 H=normalize(uSun+V);',
    ' float spec=pow(clamp(dot(N,H),0.0,1.0),170.0)*1.35*lod; vec3 col=mix(body,uSky,clamp(fres*0.8,0.0,0.78))+uSpecCol*spec;',
    ' float alpha=mix(0.76,0.95,deepT); float fd=vdist*uFogDen; float fog=1.0-exp(-fd*fd); col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
    ' gl_FragColor=vec4(col,alpha); }'
   ].join('\n')
  });
  const M=new THREE.Mesh(sg,sm);M.renderOrder=1;M.name='sea';M.userData.probeSkip=true;M.frustumCulled=false;scene.add(M);
  const keepSky=skyApply;
  skyApply=function(){
   keepSky();const L=KratorSky.lighting();
   U.uSun.value.copy(LIGHTDIR);U.uFogCol.value.copy(L.fog);
   U.uSky.value.copy(L.fog).lerp(new THREE.Color(.74,.84,.92),.4);U.uBodyK.value=L.sunDir.y>.02?1:.35;
  };
  skyApply();
  FRAME_HOOKS.push(()=>U.uCam.value.copy(camera.position));
 }

 /* wrap autoViews() so cameras over sloped/chasm rows always stand cleanly above terrainH(cx,cz) and carry file-safe names */
 const baseViews=autoViews;
 autoViews=function(){
  const V=baseViews(),out={};
  for(const k in V){
   const cleanK=k.replace(/[':]/g,'');
   const v=V[k].slice();
   const ghCam=Math.max(0,terrainH(v[0],v[2])),ghTgt=Math.max(0,terrainH(v[3],v[5]));
   v[1]=Math.max(v[1]+ghTgt,ghCam+2.15);
   v[4]+=ghTgt;
   out[cleanK]=v;
  }
  return out;
 };
})();
