// ================================================================= HOST — far field and horizon occlusion (core/terrain KFAR + KHORIZON)
// Extends the SE Throne flank and rift graben out to 14 km via KFAR, audits MAT_GROUND's active sampler count against the
// 16-unit WebGL limit, and bakes KHORIZON shadow occlusion across the graben walls and breached pit.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={scoria:L([58,52,48]),flank:L([84,78,64]),wood:L([72,82,56]),high:L([108,100,94]),far:L([176,170,162])};
 const colr=(x,z,y,q)=>{
  const u=y-floor0(x),n1=clamp(KRAND.fbm(x*.0018,.5,z*.0018,2,514)*.6+KRAND.fbm(x*.009,.5,z*.009,2,515)*.5-.05,0,1);
  let c=mixC(C.scoria,C.flank,smooth(10,90,u));
  c=mixC(c,C.wood,smooth(-40,-280,u)*(.4+.6*n1));
  c=mixC(c,C.high,smooth(180,680,u));
  return mixC(c,C.far,.52*smooth(3800,13000,q.r));
 };
 const G=KFAR.grid({
  lines:KFAR.lines({cell:48,inner:S0+16,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return landH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+80&&x1<S0-80&&z0>-S0+80&&z1<S0-80,
  color:colr
 });
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});
 mat.userData.farField=true;mat.customProgramCacheKey=()=>'rheolith-far';
 const mesh=new THREE.Mesh(geo,mat);
 mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='South-East Flank of the Throne past the map';
 scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};
})();

const LIBOF={MeshLambertMaterial:'lambert',MeshStandardMaterial:'standard',MeshPhysicalMaterial:'physical',MeshPhongMaterial:'phong',MeshBasicMaterial:'basic',MeshToonMaterial:'toon'};
const samplersOf=m=>{
 try{
  const L=THREE.ShaderLib[LIBOF[m.type]],sh=L?{uniforms:{},vertexShader:L.vertexShader,fragmentShader:L.fragmentShader}:{uniforms:{},vertexShader:m.vertexShader||'',fragmentShader:m.fragmentShader||''};
  const f0=typeof KHOOK!=='undefined'?KHOOK.failures.length:0;
  try{if(m.onBeforeCompile)m.onBeforeCompile(sh,renderer);}finally{if(typeof KHOOK!=='undefined')KHOOK.failures.length=f0;}
  let n=(m.map?1:0)+(m.emissiveMap?1:0)+(m.alphaMap?1:0)+(m.lightMap?1:0)+(m.aoMap?1:0);
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});
  return n;
 }catch(e){return 99;}
};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
// Keep ground strictly <= 14 samplers (below the 15-sampler warning and 16-sampler hard cap):
// 7 base (map + uDetail + 5 KGROUND) + 2 KHORIZON + 4 bindWeather = 13 samplers; +1 rainCover = 14 samplers.
const UNITS_LATER=4,RAIN_FITS=samplersOf(MAT_GROUND)+1+2+UNITS_LATER<=14;

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({
  box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(RAIN_FITS?1:0)+UNITS_LATER<=Math.min(14,MAXT))KHORIZON.shade(MAT_GROUND,H);
 else window._horizon.skipped.push('the ground');
 return H;
})();
