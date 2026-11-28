// ================================================================= HOST — far field and horizon occlusion (KFAR + KHORIZON; [web])
const TEX_FAR_DETAIL=BIO.canvasTex(128,128,(g,w,h)=>{
 const d=g.createImageData(w,h);
 for(let i=0;i<w*h;i++){
  const v=226+(KRAND.unit(KRAND.hash(9271,i%w,(i/w)|0,1))-0.5)*26;
  d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
 }
 g.putImageData(d,0,0);
},24);

const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=16;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={
  rainforest:L([44,82,48]),
  coquina:L([208,202,188]),
  granite:L([108,112,110]),
  seaBed:L([24,58,64]),
  farHaze:L([176,192,196])
 };
 const colr=(x,z,y,q)=>{
  if(SITE.hasSea&&y<0.2)return mixC(C.seaBed,C.farHaze,0.45*smooth(2800,12500,q.r));
  const n1=clamp(KRAND.fbm(x*0.001,0.5,z*0.001,2,9275)*0.6+0.25,0,1);
  let c=mixC(C.rainforest,C.granite,n1*0.32*smooth(35,180,y));
  if(SITE.hasSea&&y<6.5)c=mixC(c,C.coquina,0.42*smooth(6.5,0.5,y));
  return mixC(c,C.farHaze,0.46*smooth(3600,13200,q.r));
 };
 const G=KFAR.grid({
  lines:KFAR.lines({cell:84,inner:S0+16,out:ROUT,grow:1.07}),
  dense:false,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return landH(x,z);},
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
 mat.userData.farField=true;mat.customProgramCacheKey=()=>'matronscoast-far';
 const mesh=new THREE.Mesh(geo,mat);
 mesh.name='far-horizon';
 mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='Kande-Sakhil Drowned Skerry Coast and White-Pass Horizon';
 scene.add(mesh);
 return{mesh:mesh,mat:mat,G:G,tris:G.count.tris};
})();

const samplersOf=m=>{
 if(typeof KSHADOW!=='undefined'&&typeof KSHADOW.units==='function'){
  return KSHADOW.units(m,renderer,scene);
 }
 return 8;
};
const MAXT=typeof KSHADOW!=='undefined'&&typeof KSHADOW.maxUnits==='function'?KSHADOW.maxUnits(renderer):(renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures);
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
/* Reserve units for cloudShade (1) + skylight (1) + rainCover (2) -> strictly < 13 samplers! */
const UNITS_LATER=4;
const RAIN_FITS=samplersOf(MAT_GROUND)+UNITS_LATER<=12;

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({
  box:[-S,-S,S,S],n:128,h:terrainH,
  far:FAR?{h:landH,box:[-14000,-14000,14000,14000],n:112}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+UNITS_LATER<=Math.min(12,MAXT))KHORIZON.shade(MAT_GROUND,H);
 else window._horizon.skipped.push('the ground (kept < 13 samplers)');
 return H;
})();
