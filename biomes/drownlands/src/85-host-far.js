/* ==================== HOST — farfield (KFAR, 14 km) & horizon baking (KHORIZON) ==================== */
/* Extends the Drownlands skerry-and-shoal archipelago (plus northern Steaming Seamounts silhouettes on bar) out to 14 km
   with a bound library detail map (0 untextured meshes), and keeps MAT_GROUND shader samplers strictly <= 12 (< 15 gate). */

const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=14;
 const Lc=a=>a.map(v=>Math.pow(v/255,2.2));
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={
  shoal:Lc([54,126,128]),
  trench:Lc([24,52,78]),
  serp:Lc([48,72,62]),
  laterite:Lc([138,72,52]),
  woods:Lc([46,82,56]),
  seamount:Lc([68,74,82]),
  haze:Lc([168,186,190])
 };

 const farH=(x,z)=>{
  if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;
  const r=Math.hypot(x,z);
  /* Scattered low ultramafic skerries across shallow shoals (-6..+22 m) */
  const skN=KRAND.fbm(x*0.00065,0.5,z*0.00065,3,621);
  let h=skN>0.58?(skN-0.58)*78.0:-5.5-12.0*(0.58-skN);
  /* On Station 2 (bar), distant Steaming Seamounts volcanic cones rise on the NNW horizon (z < -7200) */
  if(SKEY==='bar'&&z<-6200){
   const sm1=Math.hypot(x+2600,z+9800),sm2=Math.hypot(x-1900,z+11200);
   if(sm1<2600)h=Math.max(h,460*Math.pow(1-sm1/2600,1.5));
   if(sm2<2200)h=Math.max(h,340*Math.pow(1-sm2/2200,1.6));
  }
  return mix(terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0))-SINK,h,smooth(S0,S0+650,r));
 };

 const colr=(x,z,y,q)=>{
  let c=y<-18?C.trench:y<0.2?C.shoal:mixC(C.serp,C.woods,smooth(1.5,18.0,y));
  if(y>48){
   c=SKEY==='bar'&&z<-6200?C.seamount:mixC(C.laterite,C.woods,0.55);
  }
  return mixC(c,C.haze,0.50*smooth(3800,13200,q.r));
 };

 const G=KFAR.grid({
  lines:KFAR.lines({cell:120,inner:S0+24,out:ROUT,grow:1.055}),
  dense:true,
  h:farH,
  skip:(x0,z0,x1,z1)=>x0>-S0+90&&x1<S0-90&&z0>-S0+90&&z1<S0-90,
  color:colr
 });
 const geo=KFAR.geometry(G);
 const pArr=geo.attributes.position.array,nv=pArr.length/3,uvArr=new Float32Array(nv*2);
 for(let i=0;i<nv;i++){uvArr[i*2]=pArr[i*3]*0.0035;uvArr[i*2+1]=pArr[i*3+2]*0.0035;}
 geo.setAttribute('uv',new THREE.BufferAttribute(uvArr,2));
 const farPack=(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('drownlands','sponge'):null;
 const farTex=farPack?KMAT.textures(farPack,{aniso:2}).map:TEX_GROUND;
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:farTex,color:0xffffff});
 mat.userData.farField=true;
 mat.customProgramCacheKey=()=>'drown-far-'+SKEY;
 const mesh=new THREE.Mesh(geo,mat);
 mesh.userData.host=true;
 mesh.userData.farField=true;
 mesh.userData.probeSkip=true;
 mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Drownlands archipelago horizon';
 scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};
})();

const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{
 try{
  const L0=THREE.ShaderLib[LIBOF[m.type]];
  const sh=L0?{uniforms:{},vertexShader:L0.vertexShader,fragmentShader:L0.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}
  let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});
  return n;
 }catch(e){return 99;}
};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
const SAMPLER_CAP=Math.min(MAXT,13);
const UNITS_LATER=3;
const RAIN_FITS=samplersOf(MAT_GROUND)+1+UNITS_LATER<=SAMPLER_CAP;

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1;
 const H=KHORIZON.bake({
  box:[-S,-S,S,S],n:128,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:96}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(RAIN_FITS?1:0)+UNITS_LATER<=SAMPLER_CAP){
  KHORIZON.shade(MAT_GROUND,H);
 }else{
  window._horizon.skipped.push('the ground');
 }
 return H;
})();
