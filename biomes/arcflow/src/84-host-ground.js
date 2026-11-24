// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA, KDRAWN & kalju-selka tors ([draw])
// Implements:
//   - KSTRATA onshore Arch ophiolite ('arch-ophiolite'), Kukersite oil-shale ('klint-kukersite'), and foredeep blue-clay ('klint-foredeep')
//   - KGROUND <= 3 height-blended layers per station (keeping MAT_GROUND <= 11 samplers, well below the 15 gate!)
//   - S6/B5 chromatic hollow/ridge & aspect-moisture vertex tinting via AF_VSTACK.tintTerrainMesh
//   - Spheroidally weathered waxy green-black serpentinite & zebra-cumulate kalju-selka outcrops (IcosahedronGeometry(1, 3),
//     triplanar world UVs, 0.14 * ry slope burial, contact AO) + cerulean tufa rimstone lobes on Station 3 (seep)
//   - KDRAWN.add on ALL terrain & outcrop meshes!
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'arcflow'+(SKEY==='klint'?'':'-'+SKEY)});
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
 const opt={
  seed:8120,
  range:sc.range,
  dip:[0.14,0.98,SKEY==='koski'?0.048:0.018],
  warp:[4.2,1.4]
 };
 if(sc.formations)opt.formations=sc.formations;
 else opt.recipe=sc.recipe;
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='klint'?0x8c8878:0x42584c}):null;

// 3-layer KGROUND weights per station (w0, w1, w2 in aGL.xyz; aGL.w holds serpentinite / Carnelian soil contact tint)
function masksAt(x,z,h,out){
 const rock=FIELD.rock(x,z),wet=FIELD.wet(x,z),serp=FIELD.serpentinite(x,z);
 const bleach=FIELD.bleach(x,z),tufa=FIELD.tufa(x,z),oasis=FIELD.oasis(x,z);

 if(SKEY==='klint'){
  // [0] kukersite oil-shale & glauconitic marl talus, [1] gorge spray sphagnum moss, [2] spruce-linden-birch forest litter
  const kuk=clamp(Math.max(rock*0.78,smooth(38,6,h)*0.42*wet),0,1);
  const moss=clamp(wet*0.84*(1-kuk*0.52),0,1);
  const lit=clamp((1-kuk*0.65)*(1-moss*0.58),0,1);
  out[0]=kuk;out[1]=moss;out[2]=lit;out[3]=serp;
  return out;
 }
 if(SKEY==='koski'){
  // [0] striped chromitite-anorthosite zebra-cumulate shelf, [1] sheared Arch serpentinite rib, [2] river-birch & spruce duff
  const cum=clamp(Math.max(rock*0.72,wet*0.68),0,1);
  const srp=clamp(serp*0.88*(1-cum*0.45),0,1);
  const lit=clamp((1-cum*0.62)*(1-srp*0.62),0,1);
  out[0]=cum;out[1]=srp;out[2]=lit;out[3]=serp;
  return out;
 }
 if(SKEY==='seep'){
  // [0] milky-cerulean Ca-OH travertine apron, [1] waxy green-black Arch serpentinite, [2] humid foredeep moss & duff
  const tfW=clamp(tufa*0.94,0,1);
  const srW=clamp(Math.max(serp*0.88,rock*0.62)*(1-tfW*0.78),0,1);
  const msW=clamp((1-tfW*0.70)*(1-srW*0.62),0,1);
  out[0]=tfW;out[1]=srW;out[2]=msW;out[3]=serp;
  return out;
 }
 if(SKEY==='neva'){
  // [0] tea-black Musta-Jogi humic peat, [1] russet-emerald Sphagnum bog mat, [2] kalju-selka serpentinite skerry rock
  const srW=clamp(serp*0.92,0,1);
  const ptW=clamp(wet*0.86*(1-srW*0.85),0,1);
  const msW=clamp((1-srW*0.78)*(1-ptW*0.48),0,1);
  out[0]=ptW;out[1]=msW;out[2]=srW;out[3]=serp;
  return out;
 }
 // Station 5 (auger): [0] bone-white Ancient Bleach-Swath hardpan, [1] 45 m lime-dosed birch/clover turf, [2] serpentinite red-barren
 const blW=clamp(bleach*0.96,0,1);
 const lmW=clamp(oasis*0.94*(1-blW*0.85),0,1);
 const srW=clamp((1-blW*0.82)*(1-lmW*0.82),0,1);
 out[0]=blW;out[1]=lmW;out[2]=srW;out[3]=serp*(1-oasis)*(1-bleach);
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const LITTER=K(0x425a38),MOSS=K(0x4a6e3a),PEAT=K(0x2e231a),SERP=K(0x284236);
 const CUM=K(0x8c8e8a),KUK=K(0x7c7e74),TUFA=K(0xd2ecf6),LIMED=K(0x527e3c),BLEACH=K(0xe8e5dc),CARN=K(0x6e2824);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz),red=FC.at(FC.a.red,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,8122)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='klint'){
   c.copy(LITTER).lerp(MOSS,m[1]*0.66).lerp(KUK,m[0]*0.70).lerp(SERP,m[3]*0.55);
  }else if(SKEY==='koski'){
   c.copy(LITTER).lerp(CUM,m[0]*0.72).lerp(SERP,m[1]*0.74).lerp(CARN,red*0.26);
  }else if(SKEY==='seep'){
   c.copy(MOSS).lerp(SERP,m[1]*0.78).lerp(CARN,red*0.30).lerp(TUFA,m[0]*0.86);
  }else if(SKEY==='neva'){
   c.copy(MOSS).lerp(PEAT,m[0]*0.74).lerp(SERP,m[2]*0.82).lerp(CARN,red*0.28);
  }else{
   c.copy(SERP).lerp(CARN,red*0.34).lerp(LIMED,m[1]*0.86).lerp(BLEACH,m[0]*0.90);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdad8d0,roughness:0.82,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdad8d0,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.26,0.60,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.32;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{vec3 _stC=mix(strataColor(vSWP,vSWN),vec3(0.16,0.28,0.22),vGL.w*0.58);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.80);}':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.55,0.56,0.54),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.20,vWet);');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.65};
 const layers=SKEY==='klint'?[
  KGROUND.layer('arcflow','ground.kukersite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'kukersite oil-shale & glauconitic marl'}),
  KGROUND.layer('arcflow','ground.moss',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'klint spray-gorge sphagnum moss'}),
  KGROUND.layer('arcflow','ground.litter',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',h:hOpt,name:'spruce, honey-linden & silver-birch litter'})
 ]:SKEY==='koski'?[
  KGROUND.layer('arcflow','ground.cumulate',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'chromitite-anorthosite zebra-cumulate pavement'}),
  KGROUND.layer('arcflow','ground.serpentinite',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'waxy green-black Arch serpentinite rib'}),
  KGROUND.layer('arcflow','ground.litter',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',h:hOpt,name:'Helme-Koski river-birch & spruce duff'})
 ]:SKEY==='seep'?[
  KGROUND.layer('arcflow','ground.travertine',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',h:hOpt,name:'pH 11.5 cerulean Ca-OH travertine apron'}),
  KGROUND.layer('arcflow','ground.serpentinite',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'sheared Arch peridotite & lizardite'}),
  KGROUND.layer('arcflow','ground.moss',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',h:hOpt,name:'humid foredeep moss & duff'})
 ]:SKEY==='neva'?[
  KGROUND.layer('arcflow','ground.peat',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'tea-black Musta-Jogi humic peat'}),
  KGROUND.layer('arcflow','ground.moss',{w:'vGL.y',amt:0.85,gain:1.0,tint:'_gT',h:hOpt,name:'russet-emerald cloudberry Sphagnum mat'}),
  KGROUND.layer('arcflow','ground.serpentinite',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'kalju-selka serpentinite skerry whaleback'})
 ]:[
  KGROUND.layer('arcflow','ground.bleach',{w:'vGL.x',amt:0.90,gain:1.0,tint:'_gT',h:hOpt,name:'Ancient defoliant Bleach-Swath gypsum hardpan'}),
  KGROUND.layer('arcflow','ground.limed',{w:'vGL.y',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'45 m Auger lime-phosphate birch & clover turf'}),
  KGROUND.layer('arcflow','ground.serpentinite',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',h:hOpt,name:'NE Arcflow serpentinite red-barren'})
 ];
 KGROUND.hook(MAT_GROUND,{
  key:'arcflow-'+SKEY+'-ground',
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
  const k=j*nx+i,x=X[i],z=X[j],y=terrainH(x,z);
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
 if(typeof AF_VSTACK!=='undefined')AF_VSTACK.tintTerrainMesh(m,rawTerrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// Sculpted spheroidally weathered waxy serpentinite whalebacks (kalju-selka), zebra-cumulate ribs & cerulean tufa drapes (zero BoxGeometry!)
const SKERRY_TORS_MESH=(function(){
 const unitIco=new THREE.IcosahedronGeometry(1,3);
 const uPos=unitIco.attributes.position,uIdx=unitIco.index?unitIco.index.array:null;

 function buildTorMesh(lobes,mat,name,label){
  if(!lobes.length)return null;
  const pos=[],nrm=[],uv=[],col=[],idx=[];
  let vBase=0;
  for(let b=0;b<lobes.length;b++){
   const L=lobes[b],cyw=Math.cos(L.yaw),syw=Math.sin(L.yaw);
   const subPos=new Float32Array(uPos.count*3);
   for(let k=0;k<uPos.count;k++){
    const ox=uPos.getX(k),oy=uPos.getY(k),oz=uPos.getZ(k);
    const n1=KRAND.fbm(ox*1.6+L.seed*0.11,oy*1.6,oz*1.6,3,L.seed)-0.5;
    const sheet=0.05*Math.sin(oy*7.0+L.seed);
    const flatTop=oy>0.30?(1-0.28*Math.pow((oy-0.30)/0.70,1.4)):1.0;
    const flareBase=oy<-0.20?(1+0.34*Math.pow((-oy-0.20)/0.80,1.5)):1.0;
    const disp=1.0+0.22*n1+sheet;
    const lx=ox*L.rx*disp*flareBase,ly=oy*L.ry*disp*flatTop,lz=oz*L.rz*disp*flareBase;
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
    // Triplanar world-space UV
    if(Math.abs(ny0)>0.62)uv.push(wx*0.24,wz*0.24);
    else if(Math.abs(nx0)>Math.abs(nz0))uv.push(wz*0.24,wy*0.24);
    else uv.push(wx*0.24,wy*0.24);
    const contactAO=lerp(0.66,1.0,clamp((wy-gFloor+0.15)/1.45,0,1));
    const sunTop=0.84+0.18*clamp(ny0*0.5+0.5,0,1);
    const sh=contactAO*sunTop;
    col.push(sh*L.tint[0],sh*L.tint[1],sh*L.tint[2]);
   }
   if(ti){for(let k=0;k<ti.length;k++)idx.push(ti[k]+vBase);}
   else{for(let k=0;k<tp.count;k++)idx.push(k+vBase);}
   vBase+=tp.count;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,mat);
  m.name=name;
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.ground=true;m.userData.inspectLabel=label;
  scene.add(m);
  if(typeof KDRAWN!=='undefined'){
   const ds=KDRAWN.fromObject(m);
   if(ds){ds.name=name;KDRAWN.add(ds);}
  }
  return m;
 }

 const serpLobes=[];
 if(SITE.skerries&&SITE.skerries.length){
  for(let s=0;s<SITE.skerries.length;s++){
   const sk=SITE.skerries[s];
   for(let j=0;j<5;j++){
    const a=(j/5)*TAU+0.4*KRAND.unit(KRAND.hash(8140+s,j,1));
    const d=(0.18+0.48*KRAND.unit(KRAND.hash(8140+s,j,2)));
    const bx=sk.x+Math.cos(a)*sk.rx*d,bz=sk.z+Math.sin(a)*sk.rz*d;
    const by=rawTerrainH(bx,bz);
    const rx=2.6+2.8*KRAND.unit(KRAND.hash(8140+s,j,3));
    const ry=1.3+1.7*KRAND.unit(KRAND.hash(8140+s,j,4));
    const rz=2.0+2.2*KRAND.unit(KRAND.hash(8140+s,j,5));
    serpLobes.push({x:bx,y:by+ry*0.14,z:bz,rx:rx,ry:ry,rz:rz,yaw:sk.yaw+0.3*(j-2),seed:8200+s*17+j,tint:[0.92,1.02,0.96]});
   }
  }
 }
 const mSerp=buildTorMesh(
  serpLobes,
  SKEY==='koski'?ARCFLOW.M.rockCumulate:ARCFLOW.M.rockSerpentinite,
  'kalju-selka-outcrops',
  SKEY==='koski'?'Zebra-Cumulate & Serpentinite Kalju-Selka Whaleback Rib':'Waxy Green-Black Onshore Arch Serpentinite Whaleback (Mg/Ca > 8)'
 );

 // Station 1 (klint): overhanging columnar arch-rift-basalt caprock blocks flanking the 55 m horseshoe lip
 if(SKEY==='klint'){
  const capLobes=[];
  for(let i=0;i<10;i++){
   const sgn=i%2===0?-1:1,u=Math.floor(i/2)/4;
   const bz=sgn*(24.5+14.0*u),bx=-18.0+22.0*u;
   const by=rawTerrainH(bx,bz);
   const rx=3.2+1.8*KRAND.unit(KRAND.hash(8160,i,1)),ry=2.2+1.6*KRAND.unit(KRAND.hash(8160,i,2)),rz=2.8+1.6*KRAND.unit(KRAND.hash(8160,i,3));
   capLobes.push({x:bx,y:by+ry*0.12,z:bz,rx:rx,ry:ry,rz:rz,yaw:u*0.6*sgn,seed:8300+i,tint:[0.96,0.96,1.0]});
  }
  buildTorMesh(capLobes,ARCFLOW.M.rockBasalt,'klint-basalt-caprock','Overhanging Columnar Arch-Rift-Basalt Klint Caprock');
 }

 // Station 3 (seep): snow-white & milky-cerulean Ca-OH travertine rimstone bosses flanking the cascade
 if(SKEY==='seep'){
  const tufaLobes=[];
  for(let i=0;i<12;i++){
   const sgn=i%2===0?-1:1,u=Math.floor(i/2)/5;
   const bx=-28.0+92.0*u,bz=6.0*Math.sin((bx+30)*0.022)+sgn*(12.5+6.5*u);
   const by=rawTerrainH(bx,bz);
   const rx=2.4+1.6*KRAND.unit(KRAND.hash(8170,i,1)),ry=1.2+1.1*KRAND.unit(KRAND.hash(8170,i,2)),rz=2.1+1.5*KRAND.unit(KRAND.hash(8170,i,3));
   tufaLobes.push({x:bx,y:by+ry*0.14,z:bz,rx:rx,ry:ry,rz:rz,yaw:u*0.8,seed:8400+i,tint:[0.94,1.0,1.04]});
  }
  buildTorMesh(tufaLobes,ARCFLOW.M.stoneTufa,'cerulean-tufa-bosses','pH 11.5 Hyperalkaline Ca-OH Cerulean Travertine Rimstone');
 }

 BIO.host.terrainH=DRAWN_H;
 return mSerp;
})();
