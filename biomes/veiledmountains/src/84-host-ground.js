// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA megabreccia, KCARVE, KSTACKS & KDRAWN ([draw])
// Implements:
//   - KSTRATA impact megabreccia ('megabreccia': 3D tilted impact-block quilt on gorge walls, crag spires & headwalls)
//   - KGROUND <= 3 height-blended layers per station (keeping MAT_GROUND <= 11 samplers, well below the 15 gate!)
//   - S6/B5 chromatic hollow/ridge & NW-draft moisture vertex tinting via VEIL_VSTACK.tintTerrainMesh
//   - KCARVE undercut gorge hoods & Kanopi cliffside socket
//   - KSTACKS mist-wreathed megabreccia crag spires on Station 4 (veilpass, image_7!)
//   - KDRAWN.add on ALL terrain, carve, spire, and boulder-moraine outcrop meshes!
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'veiledmountains'+(SKEY==='hall'?'':'-'+SKEY)});
 for(let i=0;i<REG.length;i++){
  const r=REG[i];
  if(r&&r.tagId){try{KTAGS.page.add({id:r.tagId,name:r.name,class:r.tagClass||'feature',at:[r.x,r.y==null?0:r.y,r.z],r:r.r,h:r.h,tags:r.tags||{}});}catch(e){}}
 }
}
const USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 return KSTRATA.create({
  seed:SITE.seed+20,
  recipe:sc.recipe||'megabreccia',
  range:sc.range||[-45,420],
  dip:[0.16,0.96,0.035],
  warp:[5.5,1.8]
 });
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='veilpass'?0x687276:0x3e5242}):null;

// 3-layer KGROUND weights per station (w0, w1, w2 in aGL.xyz; aGL.w holds mossy green patina weight on steep megabreccia)
function masksAt(x,z,h,out){
 const rock=FIELD.rock(x,z),wet=FIELD.wet(x,z),peat=FIELD.peat(x,z),snow=FIELD.snow(x,z),mist=FIELD.mist(x,z);

 if(SKEY==='veilpass'){
  // [0] braided meltwater cobble bar, [1] high frost-shattered periglacial scree, [2] subalpine feather-moss & lichen turf
  const cob=clamp(wet*0.88*(1-rock*0.55),0,1);
  const scr=clamp(Math.max(rock*0.76,snow*0.82)*(1-cob*0.65),0,1);
  const mos=clamp((1-cob*0.68)*(1-scr*0.68),0,1);
  out[0]=cob;out[1]=scr;out[2]=mos;out[3]=mist*0.35;
  return out;
 }
 if(SKEY==='southvale'){
  // [0] sunken dark-red forest peat trail, [1] continuous emerald cushion-moss carpet, [2] mossy megabreccia cobble
  const ptW=clamp(peat*0.94,0,1);
  const cbW=clamp(rock*0.58*(1-ptW*0.80),0,1);
  const msW=clamp((1-ptW*0.82)*(1-cbW*0.55),0,1);
  out[0]=ptW;out[1]=msW;out[2]=cbW;out[3]=mist*0.68;
  return out;
 }
 // hall, gorge, kanopi: [0] wet river/tarn cobble bar, [1] dark red-brown forest peat & root-trail, [2] deep emerald feather-moss
 const cbW=clamp(Math.max(wet*0.74,rock*0.48),0,1);
 const ptW=clamp(peat*0.82*(1-cbW*0.55),0,1);
 const msW=clamp((1-cbW*0.62)*(1-ptW*0.58),0,1);
 out[0]=cbW;out[1]=ptW;out[2]=msW;out[3]=mist*(SKEY==='gorge'?0.76:0.62);
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const MOSS=K(0x34522c),MOSS_LUSH=K(0x466b32),PEAT=K(0x4a2c22),COBBLE=K(0x767e78),SCREE=K(0x5e666a),SNOW=K(0xdce4e8),CHUTE=K(0x5c8e32);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz),ch=FC.at(FC.a.chute,wx,wz),sn=FC.at(FC.a.snow,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,9222)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='veilpass'){
   c.copy(MOSS).lerp(CHUTE,ch*0.75).lerp(COBBLE,m[0]*0.78).lerp(SCREE,m[1]*0.72).lerp(SNOW,sn*0.64);
  }else if(SKEY==='southvale'){
   c.copy(MOSS_LUSH).lerp(MOSS,0.35).lerp(COBBLE,m[2]*0.48).lerp(PEAT,m[0]*0.88);
  }else{
   c.copy(MOSS).lerp(MOSS_LUSH,m[2]*0.45).lerp(PEAT,m[1]*0.72).lerp(COBBLE,m[0]*0.66);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8dcd4,roughness:0.80,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8dcd4,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.28,0.64,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.30;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{vec3 _stC=mix(strataColor(vSWP,vSWN),vec3(0.20,0.34,0.18),vGL.w*0.62);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.78);}':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.58,0.55),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,vWet);');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.65};
 const layers=SKEY==='veilpass'?[
  KGROUND.layer('veiledmountains','ground.cobble',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'braided Veilpass meltwater cobble bar'}),
  KGROUND.layer('veiledmountains','ground.scree',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'periglacial megabreccia frost scree'}),
  KGROUND.layer('veiledmountains','ground.moss',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'subalpine feather-moss & slide-alder turf'})
 ]:SKEY==='southvale'?[
  KGROUND.layer('veiledmountains','ground.peat',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'sunken Hush-Edge dark-red peat trail'}),
  KGROUND.layer('veiledmountains','ground.moss',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'pillowed cloud-forest bryophyte carpet'}),
  KGROUND.layer('veiledmountains','ground.cobble',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',h:hOpt,name:'mossy moraine boulder pavement'})
 ]:[
  KGROUND.layer('veiledmountains','ground.cobble',{w:'vGL.x',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'salmon-stream & cataract cobble bar'}),
  KGROUND.layer('veiledmountains','ground.peat',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'dark red-brown rainforest peat & root trail'}),
  KGROUND.layer('veiledmountains','ground.moss',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'emerald Hoh feather-moss floor'})
 ];
 KGROUND.hook(MAT_GROUND,{
  key:'veil-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  blend:0.20,
  relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,
  layers:layers
 });
}

let SURF_DRAWN_SRC=null;

function DRAWN_H(x,z){
 if(typeof KDRAWN!=='undefined'&&KDRAWN.sources.length){
  const kh=KDRAWN.h(x,z);
  if(kh!==null)return kh;
 }
 const h=SURF_DRAWN_SRC?SURF_DRAWN_SRC.h(x,z):null;
 return h===null?terrainH(x,z):h;
}

const GROUND=(function(){
 const N=224,S=TERR.R*2.2,HR=S*0.5,AL=0.22,BC=1-AL,nx=N+1,m4=[0,0,0,0];
 const X=new Float64Array(nx);
 for(let i=0;i<nx;i++){const u=2*(i/N)-1;X[i]=HR*(AL*u+BC*u*u*u);}
 const invIdx=v=>{
  const y=v/HR;
  if(y<=-1)return 0;
  if(y>=1)return N-1;
  const p=AL/BC,q=y/BC,hq=q*0.5,p3=p/3,disc=Math.sqrt(hq*hq+p3*p3*p3);
  const u=Math.cbrt(hq+disc)+Math.cbrt(hq-disc);
  let idx=Math.min(N-1,Math.max(0,Math.floor((u+1)*0.5*N)));
  while(idx>0&&v<X[idx])idx--;
  while(idx<N-1&&v>X[idx+1])idx++;
  return idx;
 };
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),hh=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=X[i],z=X[j];
  let y=terrainH(x,z);
  if(typeof KCARVE!=='undefined'&&KCARVE.patches&&KCARVE.patches.length){
   const dRec=KCARVE.recessD(x,z);
   if(dRec<0){
    const Q=KCARVE.patches[0];
    y=Math.min(y,Q.floorY);
   }
  }
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;hh[k]=y;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
 }
 SURF_DRAWN_SRC={
  kind:'warped-grid',
  name:'surface-ground',
  box:[-HR,-HR,HR,HR],
  h(x,z){
   if(!(x>=-HR&&x<=HR&&z>=-HR&&z<=HR))return null;
   const ix=invIdx(x),iz=invIdx(z);
   const u=clamp((x-X[ix])/(X[ix+1]-X[ix]),0,1),v=clamp((z-X[iz])/(X[iz+1]-X[iz]),0,1);
   const a=hh[iz*nx+ix],d=hh[iz*nx+ix+1],b=hh[(iz+1)*nx+ix],c=hh[(iz+1)*nx+ix+1];
   return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
  }
 };
 if(typeof KDRAWN!=='undefined')KDRAWN.add(SURF_DRAWN_SRC);
 BIO.host.terrainH=DRAWN_H;
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const a=j*nx+i,b=a+nx,c=b+1,d=a+1;
  idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));
 g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);
 m.name='ground';
 m.userData.ground=true;
 m.userData.heightAt=DRAWN_H;
 if(typeof VEIL_VSTACK!=='undefined')VEIL_VSTACK.tintTerrainMesh(m,rawTerrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// Mesh KCARVE undercut hoods on gorge & kanopi and register in KDRAWN
const CARVE_MESHES=(function(){
 if(typeof KCARVE==='undefined'||!KCARVE.patches||!KCARVE.patches.length)return[];
 const meshes=KCARVE.mesh(VEIL.M.rockMegabreccia,{THREE:THREE,sun:[0.4,0.82,-0.42],gridNormals:true});
 for(let i=0;i<meshes.length;i++){
  const cm=meshes[i];
  cm.name='carve-hood-'+i;
  cm.userData.host=true;cm.userData.ground=true;
  cm.userData.inspectLabel='Undercut Mossy Megabreccia Gorge Hood';
  // Ensure vertex color attribute exists for vertexColors: true material
  if(!cm.geometry.attributes.color){
   const n=cm.geometry.attributes.position.count,col=new Float32Array(n*3);
   for(let k=0;k<n;k++){col[k*3]=0.78;col[k*3+1]=0.86;col[k*3+2]=0.80;}
   cm.geometry.setAttribute('color',new THREE.BufferAttribute(col,3));
  }
  if(!cm.geometry.attributes.uv){
   const p=cm.geometry.attributes.position,uv=new Float32Array(p.count*2);
   for(let k=0;k<p.count;k++){uv[k*2]=p.getX(k)*0.22;uv[k*2+1]=p.getY(k)*0.22;}
   cm.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  }
  scene.add(cm);
  if(typeof KDRAWN!=='undefined'){
   const ds=KDRAWN.fromObject(cm);
   if(ds){ds.name=cm.name;KDRAWN.add(ds);}
  }
 }
 return meshes;
})();

// KSTACKS mist-wreathed megabreccia crag spires on Station 4 (veilpass, image_7!)
const VEIL_STACKS=(function(){
 if(SKEY!=='veilpass'||!SITE.spires||!SITE.spires.length||typeof KSTACKS==='undefined')return[];
 const list=[];
 const pos=[],uv=[],col=[],idx=[];
 let vBase=0;
 for(let i=0;i<SITE.spires.length;i++){
  const sp=SITE.spires[i];
  const footY=rawTerrainH(sp.x,sp.z)-3.5;
  const S=KSTACKS.make({
   id:sp.id,
   kind:'spire',
   x:sp.x,
   z:sp.z,
   y0:footY,
   H:sp.H,
   r:sp.r,
   e:sp.e,
   ry:sp.ry,
   taper:sp.taper,
   crown:0.58,
   seed:SITE.seed+300+i
  });
  list.push(S);
  const gm=KSTACKS.mesh(S,{step:4.5});
  const nv=gm.pos.length/3;
  for(let k=0;k<nv;k++){
   const wx=gm.pos[k*3],wy=gm.pos[k*3+1],wz=gm.pos[k*3+2];
   pos.push(wx,wy,wz);
   uv.push(gm.uv[k*2]*0.24,gm.uv[k*2+1]*0.24);
   const occ=gm.occ?gm.occ[k]:0.85;
   const mossCrown=gm.part&&gm.part[k]===1?1:0;
   const sh=0.62+0.38*occ;
   col.push(sh*(mossCrown?0.74:0.94),sh*(mossCrown?0.98:0.96),sh*(mossCrown?0.72:0.98));
  }
  for(let k=0;k<gm.idx.length;k++)idx.push(gm.idx[k]+vBase);
  vBase+=nv;
  REGISTER({
   tagId:'veil:megabreccia-spire-'+i,
   tagClass:'feature',
   name:'Mist-Wreathed Tilted Megabreccia Crag Spire ('+sp.H+' m)',
   x:sp.x,y:footY,z:sp.z,r:sp.r*1.2,h:sp.H+14,
   tags:{biome:'veiledmountains',lithology:'megabreccia'}
  });
 }
 if(pos.length){
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const sm=new THREE.Mesh(geo,VEIL.M.rockMegabreccia);
  sm.name='megabreccia-crag-spires';
  sm.castShadow=true;sm.receiveShadow=true;
  sm.userData.host=true;sm.userData.ground=true;
  sm.userData.inspectLabel='Mist-Wreathed Tilted Impact Megabreccia Crag Spire';
  scene.add(sm);
  if(typeof KDRAWN!=='undefined'){
   const ds=KDRAWN.fromObject(sm);
   if(ds){ds.name='megabreccia-crag-spires';KDRAWN.add(ds);}
  }
 }
 BIO.host.terrainH=DRAWN_H;
 return list;
})();

// Sculpted mossy megabreccia gorge-lip & pillow-moraine tors (zero BoxGeometry!)
const MOSS_BOULDER_TORS=(function(){
 const unitIco=new THREE.IcosahedronGeometry(1,3);
 const uPos=unitIco.attributes.position,uIdx=unitIco.index?unitIco.index.array:null;
 const lobes=[];
 const nTors=SKEY==='southvale'?24:(SKEY==='gorge'?16:12);
 for(let i=0;i<nTors;i++){
  let bx,bz;
  if(SKEY==='gorge'){
   const sgn=i%2===0?-1:1,u=Math.floor(i/2)/8;
   bx=-36+78*u;bz=sgn*(12.5+8.5*KRAND.unit(KRAND.hash(9260,i,1)));
  }else if(SKEY==='southvale'){
   const a=(i/nTors)*TAU+0.3*KRAND.unit(KRAND.hash(9261,i,1));
   const r=16+68*KRAND.unit(KRAND.hash(9261,i,2));
   bx=Math.cos(a)*r;bz=Math.sin(a)*r;
   if(Math.abs(bz-southvaleTrailZ(bx))<5.5)bz+=bz>=0?7.0:-7.0;
  }else{
   const a=(i/nTors)*TAU,r=32+58*KRAND.unit(KRAND.hash(9262,i,1));
   bx=Math.cos(a)*r;bz=Math.sin(a)*r;
  }
  const by=rawTerrainH(bx,bz);
  const rx=1.8+2.2*KRAND.unit(KRAND.hash(9265,i,1));
  const ry=1.1+1.4*KRAND.unit(KRAND.hash(9265,i,2));
  const rz=1.6+2.0*KRAND.unit(KRAND.hash(9265,i,3));
  lobes.push({x:bx,y:by+ry*0.16,z:bz,rx:rx,ry:ry,rz:rz,yaw:i*0.7,seed:9300+i});
 }
 const pos=[],nrm=[],uv=[],col=[],idx=[];
 let vBase=0;
 for(let b=0;b<lobes.length;b++){
  const L=lobes[b],cyw=Math.cos(L.yaw),syw=Math.sin(L.yaw);
  const subPos=new Float32Array(uPos.count*3);
  for(let k=0;k<uPos.count;k++){
   const ox=uPos.getX(k),oy=uPos.getY(k),oz=uPos.getZ(k);
   const n1=KRAND.fbm(ox*1.6+L.seed*0.11,oy*1.6,oz*1.6,2,L.seed)-0.5;
   const disp=1.0+0.20*n1;
   const flare=oy<-0.15?(1+0.30*Math.pow((-oy-0.15)/0.85,1.4)):1.0;
   const lx=ox*L.rx*disp*flare,ly=oy*L.ry*disp,lz=oz*L.rz*disp*flare;
   subPos[k*3]=L.x+lx*cyw-lz*syw;
   subPos[k*3+1]=L.y+ly;
   subPos[k*3+2]=L.z+lx*syw+lz*cyw;
  }
  const tmpGeo=new THREE.BufferGeometry();
  tmpGeo.setAttribute('position',new THREE.BufferAttribute(subPos,3));
  if(uIdx)tmpGeo.setIndex(Array.from(uIdx));
  tmpGeo.computeVertexNormals();
  const tp=tmpGeo.attributes.position,tn=tmpGeo.attributes.normal,ti=tmpGeo.index?tmpGeo.index.array:null;
  const gFloor=rawTerrainH(L.x,L.z);
  for(let k=0;k<tp.count;k++){
   const wx=tp.getX(k),wy=tp.getY(k),wz=tp.getZ(k);
   const nx0=tn.getX(k),ny0=tn.getY(k),nz0=tn.getZ(k);
   pos.push(wx,wy,wz);nrm.push(nx0,ny0,nz0);
   if(Math.abs(ny0)>0.60)uv.push(wx*0.26,wz*0.26);
   else if(Math.abs(nx0)>Math.abs(nz0))uv.push(wz*0.26,wy*0.26);
   else uv.push(wx*0.26,wy*0.26);
   const contactAO=lerp(0.65,1.0,clamp((wy-gFloor+0.15)/1.35,0,1));
   const mossTop=clamp(ny0*0.65+0.35,0,1);
   const sh=contactAO*(0.82+0.18*mossTop);
   col.push(sh*(SKEY==='southvale'?0.86:0.82),sh*1.04,sh*0.84);
  }
  if(ti){for(let k=0;k<ti.length;k++)idx.push(ti[k]+vBase);}
  vBase+=tp.count;
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 geo.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setIndex(idx);
 geo.computeBoundingSphere();
 const matUse=(SKEY==='southvale'||SKEY==='gorge')?VEIL.M.surfaceCushion:VEIL.M.rockMegabreccia;
 const m=new THREE.Mesh(geo,matUse);
 m.name='moss-megabreccia-tors';
 m.castShadow=true;m.receiveShadow=true;
 m.userData.host=true;m.userData.ground=true;
 m.userData.inspectLabel=SKEY==='southvale'?'Pillowed Cushion-Moss Megabreccia Moraine Dome':'Moss-Upholstered Megabreccia Gorge Boulder';
 scene.add(m);
 if(typeof KDRAWN!=='undefined'){
  const ds=KDRAWN.fromObject(m);
  if(ds){ds.name='moss-megabreccia-tors';KDRAWN.add(ds);}
 }
 BIO.host.terrainH=DRAWN_H;
 return m;
})();
