// ================================================================= HOST — towering 360-degree crater ring-wall & ring-shadow (KFAR + KHORIZON; [web])
const TEX_FAR_DETAIL=BIO.canvasTex(128,128,(g,w,h)=>{
 const d=g.createImageData(w,h);
 for(let i=0;i<w*h;i++){
  const v=226+(KRAND.unit(KRAND.hash(9151,i%w,(i/w)|0,1))-0.5)*28;
  d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
 }
 g.putImageData(d,0,0);
},24);

const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.08,ROUT=16000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={
  taiga:L([42,74,52]),
  larchGold:L([178,132,46]),
  suevite:L([76,74,72]),
  tagamite:L([36,38,44]),
  snowPeak:L([232,240,248]),
  farHaze:L([186,202,216])
 };
 const colr=(x,z,y,q)=>{
  const n1=clamp(KRAND.fbm(x*0.0009,0.5,z*0.0009,2,9155)*0.6+0.25,0,1);
  // Lower thermal-belt taiga + autumn gold larch -> dark suevite/tagamite ejecta cliffs -> snow-crowned 4-6 km crater rims!
  let c=SKEY==='highbowl'?C.suevite:mixC(C.taiga,C.larchGold,0.34*n1);
  c=mixC(c,C.suevite,smooth(65,360,y));
  c=mixC(c,C.tagamite,0.35*smooth(220,900,y)*(1-n1));
  const snowStart=SKEY==='highbowl'?15:380,snowFull=SKEY==='highbowl'?180:1150;
  c=mixC(c,C.snowPeak,smooth(snowStart,snowFull,y-80*n1));
  return mixC(c,C.farHaze,0.44*smooth(4800,15200,q.r));
 };
 const G=KFAR.grid({
  lines:KFAR.lines({cell:84,inner:S0+16,out:ROUT,grow:1.07}),
  dense:false,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return rawTerrainH(x,z)-SINK;return landH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+80&&x1<S0-80&&z0>-S0+80&&z1<S0-80,
  color:colr
 });
 const geo=KFAR.geometry(G);
 if(!geo.attributes.uv){
  const p=geo.attributes.position,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*0.002;uv[i*2+1]=p.getZ(i)*0.002;}
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 }
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:TEX_FAR_DETAIL});
 mat.userData.farField=true;mat.userData.noSnow=true;mat.customProgramCacheKey=()=>'ricochetpeaks-far';
 const mesh=new THREE.Mesh(geo,mat);
 mesh.name='far-horizon';
 mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='Ricochet Peaks Snow-Crowned Suevite Crater Ring-Wall';
 scene.add(mesh);
 return{mesh:mesh,mat:mat,G:G,tris:G.count.tris};
})();

const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{
 try{
  const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}
  let n=(m.map?1:0)+(m.normalMap?1:0)+(m.roughnessMap?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|2DArray|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});
  return n;
 }catch(e){return 99;}
};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
const UNITS_LATER=3; // cloudShade + snowBare + reserve headroom so total stays < 13!

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.08,H=KHORIZON.bake({
  box:[-S,-S,S,S],n:208,h:rawTerrainH,
  far:FAR?{h:landH,box:[-16000,-16000,16000,16000],n:180}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+UNITS_LATER<=Math.min(12,MAXT))KHORIZON.shade(MAT_GROUND,H);
 else window._horizon.skipped.push('the ground');
 return H;
})();
