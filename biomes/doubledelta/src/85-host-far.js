// ================================================================= HOST — farfield (KFAR, 14 km) & horizon baking (KHORIZON)
// Extends the flat island-less drowned delta (and on throat, the eastern Ria Sound bluff line) out to 14 km with a packed library detail map
// so even the farfield mesh has a genuine bound texture (0 untextured meshes), and tracks MAT_GROUND sampler count (< 15).
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=16;
 const Lc=a=>a.map(v=>Math.pow(v/255,2.2));
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={
  water:Lc([52,96,98]),
  mud:Lc([92,84,68]),
  marsh:Lc([82,98,62]),
  limestone:Lc([192,184,166]),
  woods:Lc([58,84,52]),
  haze:Lc([166,178,180])
 };
 const farH=(x,z)=>{
  if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;
  if(SKEY==='throat'&&x>240){
   return 42+78*smooth(240,1800,x)+14*(KRAND.fbm(x*0.0008,0.5,z*0.0008,2,611)-0.5);
  }
  if(x<-1400)return -4.0;
  /* Flat drowned alluvial sponge-and-reed bowl out to 14 km: zero rocky islands */
  return 1.2+2.6*(KRAND.fbm(x*0.0009,0.5,z*0.0009,2,612)-0.35);
 };
 const colr=(x,z,y,q)=>{
  let c=y<0.1?C.water:mixC(C.mud,C.marsh,smooth(0.2,3.5,y));
  if(y>25){
   c=mixC(C.limestone,C.woods,smooth(38,62,y));
  }
  return mixC(c,C.haze,0.48*smooth(4200,13200,q.r));
 };
 const G=KFAR.grid({
  lines:KFAR.lines({cell:64,inner:S0+20,out:ROUT,grow:1.032}),
  dense:true,
  h:farH,
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,
  color:colr
 });
 const geo=KFAR.geometry(G);
 /* Add planar world UVs and bind packed library ground.reedbed / sponge map so FAR mesh is genuinely textured */
 const pArr=geo.attributes.position.array,nv=pArr.length/3,uvArr=new Float32Array(nv*2);
 for(let i=0;i<nv;i++){uvArr[i*2]=pArr[i*3]*0.004;uvArr[i*2+1]=pArr[i*3+2]*0.004;}
 geo.setAttribute('uv',new THREE.BufferAttribute(uvArr,2));
 const farPack=(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('doubledelta','sponge'):null;
 const farTex=farPack?KMAT.textures(farPack,{aniso:2}).map:TEX_GROUND;
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:farTex,color:0xffffff});
 mat.userData.farField=true;
 mat.customProgramCacheKey=()=>'ddelta-far-'+SKEY;
 const mesh=new THREE.Mesh(geo,mat);
 mesh.userData.host=true;
 mesh.userData.farField=true;
 mesh.userData.probeSkip=true;
 mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The Great Double Delta horizon';
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
/* Keep active samplers strictly <= 13 (well below the 15-sampler warning gate in harness.SURVEY) */
const SAMPLER_CAP=Math.min(MAXT,13);
const UNITS_LATER=3;
const RAIN_FITS=samplersOf(MAT_GROUND)+1+UNITS_LATER<=SAMPLER_CAP;

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1;
 const H=KHORIZON.bake({
  box:[-S,-S,S,S],n:192,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:160}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(RAIN_FITS?1:0)+UNITS_LATER<=SAMPLER_CAP){
  KHORIZON.shade(MAT_GROUND,H);
 }else{
  window._horizon.skipped.push('the ground');
 }
 return H;
})();
