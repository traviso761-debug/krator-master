// ================================================================= HOST — far field and horizon occlusion (KFAR + KHORIZON; [web])
const TEX_FAR_DETAIL=BIO.canvasTex(128,128,(g,w,h)=>{
 const d=g.createImageData(w,h);
 for(let i=0;i<w*h;i++){
  const v=228+(KRAND.unit(KRAND.hash(5851,i%w,(i/w)|0,1))-0.5)*28;
  d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
 }
 g.putImageData(d,0,0);
},24);

const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14000,SINK=18;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={
  lake:L([38,104,106]),wood:L([52,82,54]),dolomite:L([168,162,148]),ejecta:L([98,94,88]),riaMist:L([162,184,186]),far:L([178,190,190])
 };
 const colr=(x,z,y,q)=>{
  const n1=clamp(KRAND.fbm(x*0.0013,0.5,z*0.0013,2,585)*0.6+0.25,0,1);
  let c=mixC(C.wood,SKEY==='dolomite'?C.dolomite:C.ejecta,smooth(90,340,y)*(0.45+0.55*n1));
  if(SKEY==='rampart'){
   // South (+z) shows the shimmering +1,460 m Spider Lake bowl 580 m below; North (-z) shows misty Ria Valley headwaters
   if(z>750&&y<-420)c=C.lake;
   else if(z<-750)c=mixC(C.wood,C.riaMist,smooth(-750,-2800,z)*0.65);
  }else if(y<-1.5&&!(SKEY==='spillway'&&x<-300)){
   c=C.lake;
  }
  return mixC(c,C.far,0.48*smooth(3600,13200,q.r));
 };
 const G=KFAR.grid({
  lines:KFAR.lines({cell:84,inner:S0+16,out:ROUT,grow:1.07}),dense:false,
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
 mat.userData.farField=true;mat.customProgramCacheKey=()=>'spiderlake-far';
 const mesh=new THREE.Mesh(geo,mat);
 mesh.name='far-horizon';
 mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SKEY==='rampart'?'Two-Watershed Horizon (Spider Lake Basin S / Ria Headwaters N)':'Spider Lake Basin & Ejecta Collar Horizon';
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
  sh.fragmentShader.replace(/uniform\s+sampler(?:2D|Cube)\s+([^;]+);/g,(a,b)=>{n+=b.split(',').length;return a;});
  return n;
 }catch(e){return 99;}
};
const MAXT=renderer.capabilities.maxTextures==null?16:renderer.capabilities.maxTextures;
window._units={ground:samplersOf(MAT_GROUND),max:MAXT};
const UNITS_LATER=SITE.hasOpenLake?4:2;
const RAIN_FITS=samplersOf(MAT_GROUND)+1+2+UNITS_LATER<=13;

const GROUND_HZ=(function(){
 if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({
  box:[-S,-S,S,S],n:224,h:terrainH,
  far:FAR?{h:landH,box:[-14000,-14000,14000,14000],n:180}:undefined
 });
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n,skipped:[]};
 if(samplersOf(MAT_GROUND)+2+(RAIN_FITS?1:0)+UNITS_LATER<=Math.min(13,MAXT))KHORIZON.shade(MAT_GROUND,H);
 else window._horizon.skipped.push('the ground');
 return H;
})();
