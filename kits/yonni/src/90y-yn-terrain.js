// ================================================================= SCULPTED SHEET TERRAIN: 26 deg Hillside, Cliff Scarp & Coastal Shore
// Runs after 90-scene.js (ROWS, SITES, groundM exist) and before 92-world.js calls buildWorld().
//   1. hillside row: a 26 deg coastal ridge so Freestanding round-towers plunge their battered cobble root-skirts directly
//      into a real steep slope with zero rectangular podiums!
//   2. cliff row: a 22 m bedded coastal-granite scarp wall behind the engaged cliff rotundas, clusters & cleft-bridges!
//   3. shore row: beach slope to seabed (-3.8 m) + core/atmos shared wave-field sea (#include <atmos_waves>).
const YN_TERRAIN={hillZ:null,hillD:16,shoreZ:null,cliffZ:null,cliffW:90,seaLevel:-.9,seaFloor:-3.8};
(function(){
 for(const r of ROWS){
  const F=FAMILIES.find(f=>f.name===r.family);if(!F)continue;
  if(F.hillside){YN_TERRAIN.hillZ=r.z;YN_TERRAIN.hillD=Math.max(14,r.d+4);}
  if(F.cliff){YN_TERRAIN.cliffZ=r.z;YN_TERRAIN.cliffW=Math.max(84,r.w+16);}
  if(F.shore)YN_TERRAIN.shoreZ=r.z;
 }
})();

/* override terrainH(x,z) BEFORE 92-world.js builds the world so hillside buildings sit at real sloped elevations! */
terrainH=function(x,z){
 const T=YN_TERRAIN;
 /* 1. 26 deg sloped Scoured-Hills showcase ridge (tan 26 deg ~ 0.488): rises from south (+z) to crest behind row (-z),
       plus gentle cross-slope along x so every drum experiences both uphill/downhill AND lateral slope! */
 if(T.hillZ!==null){
  const zFront=T.hillZ+T.hillD*.68,zCrest=T.hillZ-T.hillD*.55,zBack=T.hillZ-T.hillD*1.25;
  if(z<=zFront+4&&z>=zBack-4){
   let h=0;
   if(z>=zCrest){
    const u=smooth(zFront+4,zCrest,z);
    h=u*7.4;
   }else{
    const u=1-smooth(zCrest,zBack-4,z);
    h=u*7.4;
   }
   const cross=0.85*Math.sin(x*.055)+0.35*Math.cos(x*.11);
   return Math.max(0,h*(0.88+0.12*(cross+.5)));
  }
 }
 /* 2. Natural coastal scarp crest rising immediately behind (-z) the Cliff-Flush row, keeping z = cliffZ at 0 for clean building engagement */
 if(T.cliffZ!==null){
  const zToe=T.cliffZ-2.8,zCrest=T.cliffZ-9.2,zNorth=T.cliffZ-18.5;
  if(z<=zToe&&z>=zNorth&&Math.abs(x)<T.cliffW*.58){
   const xFade=1-smooth(T.cliffW*.44,T.cliffW*.58,Math.abs(x));
   const crestH=(10.5+2.2*Math.sin(x*.09)+1.4*Math.cos(x*.17))*xFade;
   if(z>=zCrest)return crestH*smooth(zToe,zCrest,z);
   return crestH*(1-smooth(zCrest,zNorth,z));
  }
 }
 /* 3. Coastal harbour seabed north of shoreZ (harbour buildings anchor at dry z = shoreZ, piers extend over z < shoreZ) */
 if(T.shoreZ!==null){
  const d=T.shoreZ-1.8-z;
  if(d>0)return T.seaFloor*smooth(0,9.5,d);
 }
 return 0;
};

(function(){
 /* rebuild groundM with fine 2.2 m spacing over the sculpted kit rows and sparse rings out to +-GROUND_SIZE/2,
    updating UVs in world metres so tiling is undistorted while cutting ~180k flat horizon triangles */
 const H=GROUND_SIZE*.5;
 const axisPts=(lo,hi,nIn)=>{
  const a=[-H,lerp(-H,lo,.55),lo];
  for(let i=1;i<nIn;i++)a.push(lerp(lo,hi,i/nIn));
  a.push(hi,lerp(hi,H,.45),H);
  return a;
 };
 const halfX=Math.max(96,(YN_TERRAIN.cliffW||0)*.60);
 const xs=axisPts(-halfX,halfX,64),zs=axisPts(Math.min(-390,(YN_TERRAIN.shoreZ||0)-22),36,144);
 const NX=xs.length-1,NZ=zs.length-1;
 const g=new THREE.PlaneGeometry(GROUND_SIZE,GROUND_SIZE,NX,NZ);
 g.rotateX(-PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;
 for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){
  const k=j*(NX+1)+i,x=xs[i],z=zs[j];
  p.setXYZ(k,x,terrainH(x,z),z);
  uv.setXY(k,x/GROUND_SIZE+.5,.5-z/GROUND_SIZE);
 }
 g.computeVertexNormals();
 groundM.geometry.dispose();
 groundM.rotation.set(0,0,0);
 groundM.geometry=g;
 groundM.updateMatrixWorld(true);

 /* shared wave-field coastal sea north of the Harbour row (core/atmos #include <atmos_waves>) */
 if(YN_TERRAIN.shoreZ!==null){
  const S=YN_TERRAIN;
  const U={
   uSun:{value:new THREE.Vector3(.4,.7,.3)},uShallow:{value:new THREE.Color(0x46888a)},uDeep:{value:new THREE.Color(0x164254)},
   uSky:{value:new THREE.Color(0xb8c8d2)},uFogCol:{value:new THREE.Color(0xc6d4d8)},uFogDen:{value:.0004},
   uCam:{value:new THREE.Vector3()},uBodyK:{value:1},uSpecCol:{value:new THREE.Color(1,.95,.86)}
  };
  ATMOS.waveUniforms(U);
  const N=72,pos=[],dep=[],idx=[],X=GROUND_SIZE*.5,zA=S.shoreZ-.2,zB=-GROUND_SIZE*.5-900;
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){
   const x=(i/N*2-1)*(X+900),t=j/N,z=lerp(zA,zB,t*t);
   pos.push(x,S.seaLevel,z);dep.push(Math.max(0,S.seaLevel-terrainH(x,z)));
  }
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,d=a+N+1,e=d+1;idx.push(a,b,d,b,e,d);}
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  sg.setAttribute('aDepth',new THREE.Float32BufferAttribute(dep,1));
  sg.setIndex(new THREE.Uint32BufferAttribute(idx,1));
  const sm=new THREE.ShaderMaterial({
   uniforms:U,transparent:true,side:THREE.DoubleSide,depthWrite:false,
   vertexShader:[
    '#include <atmos_waves>','attribute float aDepth;','varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ vec3 pos=position; vP=pos.xz; vD=aDepth; float att=clamp(aDepth/7.0,0.0,1.0); pos.y+=atmWaveHeight(pos.xz,0.0)*att*0.55;',
    ' vec4 wp=modelMatrix*vec4(pos,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }'
   ].join('\n'),
   fragmentShader:[
    'precision highp float;','#include <atmos_waves>',
    'uniform float uFogDen; uniform vec3 uSun,uShallow,uDeep,uSky,uFogCol,uCam,uSpecCol; uniform float uBodyK;',
    'varying vec3 vW; varying float vD; varying vec2 vP;',
    'void main(){ float att=clamp(vD/7.0,0.0,1.0); float vdist=length(uCam-vW); float lod=1.0-smoothstep(260.0,1500.0,vdist);',
    ' vec3 N=atmWaveNormal(vP,vdist,3.0*(0.08+0.92*att)); vec3 V=normalize(uCam-vW); if(uCam.y<vW.y)N=-N;',
    ' float fres=pow(1.0-clamp(abs(dot(N,V)),0.0,1.0),3.4); float deepT=smoothstep(0.6,12.0,vD); vec3 body=mix(uShallow,uDeep,deepT);',
    ' float diff=clamp(dot(N,uSun),0.0,1.0); body*=(0.66+0.44*diff)*uBodyK; vec3 H=normalize(uSun+V);',
    ' float spec=pow(clamp(dot(N,H),0.0,1.0),190.0)*1.4*lod; vec3 col=mix(body,uSky,clamp(fres*0.85,0.0,0.82))+uSpecCol*spec;',
    ' float alpha=mix(0.72,0.96,deepT); float fd=vdist*uFogDen; float fog=1.0-exp(-fd*fd); col=mix(col,uFogCol,clamp(fog,0.0,1.0));',
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

 /* wrap autoViews() so cameras over sloped/sculpted rows always stand cleanly above terrainH(cx,cz) */
 const baseViews=autoViews;
 autoViews=function(){
  const V=baseViews(),out={};
  for(const k in V){
   /* sanitize view names (no apostrophes or colons: item 30 check_views) */
   const cleanK=k.replace(/[':]/g,'');
   const v=V[k].slice();
   const ghCam=Math.max(0,terrainH(v[0],v[2])),ghTgt=Math.max(0,terrainH(v[3],v[5]));
   v[1]=Math.max(v[1]+ghTgt,ghCam+1.85);
   v[4]+=ghTgt;
   out[cleanK]=v;
  }
  return out;
 };
})();
