// ================================================================= HOST — KGROUND (<= 3 layers), KSTRATA, KSTACKS, KCARVE & KDRAWN ([draw])
// Implements:
//   - KSTRATA secondary-ejecta (polymictic suevite breccia) interlayered with jet-black obsidian-pancake (tagamite impact-glass veins & sheets)
//     and radial shatter-cone striations on steep crater walls
//   - KGROUND <= 3 height-blended layers per station (keeping MAT_GROUND <= 11 samplers, well below the 15 gate!)
//   - KSTACKS central rebound shatter-cone tors (ringlake, notch, glasssheet) & hollow 7-13 m Erebus fumarole steam-ice towers (highbowl)
//   - KCARVE rock-alcove hoods (Skippers Notch bandit overhang & Old Rim warm steam-cave)
//   - KDRAWN.add on ALL ground, KSTACKS, and KCARVE meshes!
const GQ=new URLSearchParams(location.search);
if(typeof KTAGS!=='undefined'&&!KTAGS.page){
 KTAGS.page=KTAGS.create({build:'ricochetpeaks'+(SKEY==='ringlake'?'':'-'+SKEY)});
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
  seed:SITE.seed+19,
  range:sc.range,
  dip:[0.22,0.96,SKEY==='notch'?0.055:0.024],
  warp:[5.4,1.6]
 };
 if(sc.formations)opt.formations=sc.formations;
 else opt.recipe=sc.recipe||'secondary-ejecta';
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='glasssheet'?0x2a2d34:0x66645e}):null;

// <= 3 KGROUND layer weights per station (w0, w1, w2 in aGL.xyz; aGL.w holds jet-black tagamite impact-glass / shatter-cone vein share)
function masksAt(x,z,h,out){
 const rock=FIELD.rock(x,z),wet=FIELD.wet(x,z),glass=FIELD.glass(x,z);
 const sinter=FIELD.sinter(x,z),frost=FIELD.frost(x,z);

 if(SKEY==='ringlake'){
  // [0] dark suevite & tagamite gravel/scree, [1] silver-gold cladonia & frost-hollow moss, [2] spruce-larch needle duff
  const sv=clamp(Math.max(rock*0.80,glass*0.62),0,1);
  const cl=clamp(Math.max(frost*0.72,wet*0.58)*(1-sv*0.55),0,1);
  const df=clamp((1-sv*0.65)*(1-cl*0.55),0,1);
  out[0]=sv;out[1]=cl;out[2]=df;out[3]=glass;
  return out;
 }
 if(SKEY==='notch'){
  // [0] tilted suevite breccia & tagamite talus, [1] wind-scoured periglacial turf, [2] larch-pine needle duff
  const sv=clamp(Math.max(rock*0.84,glass*0.65),0,1);
  const td=clamp(Math.max(frost*0.75,smooth(18,45,h)*0.55)*(1-sv*0.50),0,1);
  const df=clamp((1-sv*0.68)*(1-td*0.55),0,1);
  out[0]=sv;out[1]=td;out[2]=df;out[3]=glass;
  return out;
 }
 if(SKEY==='vents'){
  // [0] white hydrothermal silica sinter apron, [1] dark suevite crater rock, [2] warm boreal birch-spruce duff
  const sn=clamp(Math.max(sinter*0.95,wet*0.42*smooth(16,2,h)),0,1);
  const sv=clamp(rock*0.78*(1-sn*0.82),0,1);
  const df=clamp((1-sn*0.75)*(1-sv*0.62),0,1);
  out[0]=sn;out[1]=sv;out[2]=df;out[3]=glass*(1-sn);
  return out;
 }
 if(SKEY==='glasssheet'){
  // [0] glazed jet-black tagamite impact-melt pavement, [1] star-burst silver cladonia lichen carpet, [2] pine needle duff
  const tg=clamp(Math.max(glass*0.88,rock*0.74),0,1);
  const cl=clamp((0.68-glass*0.24)*(1-wet*0.5),0,1);
  const df=clamp((1-tg*0.62)*(1-cl*0.48),0,1);
  out[0]=tg;out[1]=cl;out[2]=df;out[3]=glass;
  return out;
 }
 // Station 5 (highbowl): [0] alpine rime-snow & drift crust, [1] warm hydrothermal sinter collar, [2] frost-patterned suevite tundra
 const sn=clamp(sinter*0.92,0,1);
 const sw=clamp(smooth(2.5,18.0,h)*(1-sn*0.92),0,1);
 const td=clamp((1-sw*0.68)*(1-sn*0.78),0,1);
 out[0]=sw;out[1]=sn;out[2]=td;out[3]=glass*(1-sw*0.7);
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const DUFF=K(0x3a4d34),CLAD=K(0x9a9c86),SUEVITE=K(0x4a4946),TAGAMITE=K(0x1f2228);
 const SINTER=K(0xe4ecee),TUNDRA=K(0x6e6c52),SNOW=K(0xe2ebf2),NICKEL=K(0x385874);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz),ni=FC.at(FC.a.nickel,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,9122)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='ringlake'){
   c.copy(DUFF).lerp(CLAD,m[1]*0.58).lerp(SUEVITE,m[0]*0.74).lerp(TAGAMITE,m[3]*0.38);
  }else if(SKEY==='notch'){
   c.copy(DUFF).lerp(TUNDRA,m[1]*0.64).lerp(SUEVITE,m[0]*0.78).lerp(TAGAMITE,m[3]*0.42);
  }else if(SKEY==='vents'){
   c.copy(DUFF).lerp(SUEVITE,m[1]*0.72).lerp(SINTER,m[0]*0.88);
  }else if(SKEY==='glasssheet'){
   c.copy(DUFF).lerp(CLAD,m[1]*0.62).lerp(TAGAMITE,m[0]*0.84).lerp(NICKEL,ni*0.26);
  }else{
   c.copy(TUNDRA).lerp(SUEVITE,0.35).lerp(SINTER,m[1]*0.86).lerp(SNOW,m[0]*0.84);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdad8d2,roughness:0.80,metalness:0,vertexColors:true})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdad8d2,vertexColors:true});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.24,0.58,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.28;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'{float _cone=0.88+0.16*abs(fract(atan(vGWP.z,vGWP.x)*9.5493+vGWP.y*0.18)-0.5);vec3 _stC=mix(strataColor(vSWP,vSWN)*_cone,vec3(0.09,0.10,0.13),vGL.w*0.52);diffuseColor.rgb=mix(diffuseColor.rgb,_stC,gSteep*0.82);}':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.56,0.58,0.58),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,max(vWet,vGL.w*0.55));');
 }
};

if(USE_KG){
 const hOpt={from:'lum',contrast:1.65};
 const kgSlots=SKEY==='ringlake'?[
  ['ground.suevite','vGL.x',0.86,'shocked suevite & tagamite gravel'],
  ['ground.cladonia','vGL.y',0.84,'silver reindeer-lichen & frost moss'],
  ['ground.duff','vGL.z',0.84,'crater spruce & gold-larch needle duff']
 ]:SKEY==='notch'?[
  ['ground.suevite','vGL.x',0.88,'breached septum suevite & melt breccia'],
  ['ground.tundra','vGL.y',0.84,'wind-scoured notch turf'],
  ['ground.duff','vGL.z',0.82,'subalpine larch & melt-pine duff']
 ]:SKEY==='vents'?[
  ['ground.sinter','vGL.x',0.90,'East Hearth white silica sinter crust'],
  ['ground.suevite','vGL.y',0.85,'hydrothermal crater suevite wall'],
  ['ground.duff','vGL.z',0.84,'warm oasis birch & spruce litter']
 ]:SKEY==='glasssheet'?[
  ['ground.suevite','vGL.x',0.90,'jet-black tagamite impact-melt pavement'],
  ['ground.cladonia','vGL.y',0.86,'star-burst reindeer-moss carpet'],
  ['ground.duff','vGL.z',0.82,'bonsai melt-pine needle litter']
 ]:[
  ['ground.snow','vGL.x',0.88,'Old Rim wind-packed rime snow'],
  ['ground.sinter','vGL.y',0.88,'Erebus cryofumarole warm sinter collar'],
  ['ground.tundra','vGL.z',0.84,'patterned permafrost suevite polygons']
 ];
 const layers=kgSlots.map(s=>KGROUND.layer('ricochetpeaks',s[0],{w:s[1],amt:s[2],gain:1.0,tint:'_gT',h:hOpt,name:s[3]}));
 if(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed){
  for(let i=0;i<kgSlots.length;i++){
   const L=KMAT.packed('ricochetpeaks',kgSlots[i][0]);
   if(L&&L.map)(KMAT.imaged=KMAT.imaged||[]).push(L.map);
  }
 }
 KGROUND.hook(MAT_GROUND,{
  key:'ricochetpeaks-'+SKEY+'-ground',
  at:'/*KGROUND*/',
  array:true,
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
 if(typeof RP_VSTACK!=='undefined')RP_VSTACK.tintTerrainMesh(m,rawTerrainH,3.8);
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// KSTACKS shatter-cone suevite tors, tagamite melt blisters & Old Rim Erebus fumarole steam-ice towers + KCARVE overhangs
const STACKS_OUT=(function(){
 const bodies=[],meshes=[];
 function buildStackMesh(B,mat,stepM,label,noSnow){
  const M0=KSTACKS.mesh(B,{step:stepM});
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(M0.pos,3));
  const uvScaled=new Float32Array(M0.uv.length);
  for(let i=0;i<M0.uv.length;i++)uvScaled[i]=M0.uv[i]*0.22;
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvScaled,2));
  const col=new Float32Array(M0.occ.length*3);
  for(let i=0;i<M0.occ.length;i++){
   const sh=0.68+0.32*M0.occ[i];
   col[i*3]=sh;col[i*3+1]=sh;col[i*3+2]=sh;
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setIndex(new THREE.BufferAttribute(M0.idx,1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);
  m.name='stack:'+B.id;
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.ground=true;m.userData.inspectLabel=label;
  if(noSnow)m.userData.noSnow=true;
  scene.add(m);
  if(typeof KDRAWN!=='undefined'){
   const ds=KDRAWN.fromObject(m);
   if(ds){ds.name=m.name;KDRAWN.add(ds);}
  }
  bodies.push(B);meshes.push(m);
  return m;
 }

 if(typeof KSTACKS!=='undefined'){
  // 1. Central rebound peak shatter-cone tors & tagamite melt crags
  if(SITE.tors&&SITE.tors.length){
   for(let i=0;i<SITE.tors.length;i++){
    const t=SITE.tors[i];
    const B=KSTACKS.make({
     kind:'tor',
     id:SKEY+'-tor-'+i,
     x:t.x,
     z:t.z,
     H:t.H,
     r:t.r,
     ground:rawTerrainH,
     seed:t.seed
    });
    const matUse=SKEY==='glasssheet'?RICOCHET.M.stoneTagamite:RICOCHET.M.rockSuevite;
    const lbl=SKEY==='glasssheet'
     ?'Ropy Jet-Black Tagamite Impact-Melt Blister Crag'
     :'Radial Shatter-Cone Suevite Rebound Tor';
    buildStackMesh(B,matUse,2.8,lbl,false);
    REGISTER({
     tagId:'ricochet:tor-'+SKEY+'-'+i,
     tagClass:'feature',
     name:lbl,
     x:t.x,y:rawTerrainH(t.x,t.z)-1.0,z:t.z,r:t.r+2.0,h:t.H+2.0,
     tags:{biome:'ricochetpeaks',lithology:SKEY==='glasssheet'?'tagamite':'suevite-breccia'}
    });
   }
  }

  // 2. Station 5 (highbowl): Hollow 7-13 m Erebus cryofumarole rime-ice steam towers!
  if(SITE.chimneys&&SITE.chimneys.length){
   for(let i=0;i<SITE.chimneys.length;i++){
    const ch=SITE.chimneys[i];
    const B=KSTACKS.make({
     kind:'chimney',
     id:ch.id,
     form:'pipe',
     x:ch.x,
     z:ch.z,
     H:ch.H,
     r:ch.r,
     ground:rawTerrainH,
     ice:true,
     flare:0.28,
     taper:0.36,
     seed:ch.seed
    });
    buildStackMesh(B,RICOCHET.M.iceChimney,1.6,'Erebus Cryofumarole Rime-Ice Steam Tower ('+ch.H.toFixed(1)+' m)',true);
    REGISTER({
     tagId:'ricochet:'+ch.id,
     tagClass:'feature',
     name:'Erebus Cryofumarole Steam-Ice Chimney ('+ch.H.toFixed(1)+' m)',
     x:ch.x,y:rawTerrainH(ch.x,ch.z)-1.0,z:ch.z,r:ch.r+2.5,h:ch.H+3.0,
     tags:{biome:'ricochetpeaks',phenomenon:'erebus-ice-chimney'}
    });
   }
  }
 }

 // 3. KCARVE overhang alcove meshes (Skippers Notch bandit eyrie & Old Rim warm steam-cave)
 if(CARVE&&CARVE.patches.length){
  const sunDir=[0.42,0.78,-0.46];
  const cMeshes=CARVE.mesh(RICOCHET.M.rockSuevite,{THREE:THREE,sun:sunDir,gridNormals:true});
  for(let i=0;i<cMeshes.length;i++){
   const cm=cMeshes[i];
   const g=cm.geometry;
   if(g&&!g.attributes.uv){
    const p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2),col=new Float32Array(p.count*3);
    const occ=g.attributes.aOcc;
    for(let k=0;k<p.count;k++){
     const wx=p.getX(k),wy=p.getY(k),wz=p.getZ(k);
     const nx0=n?n.getX(k):0,ny0=n?n.getY(k):1,nz0=n?n.getZ(k):0;
     if(Math.abs(ny0)>0.6)uv[k*2]=wx*0.22,uv[k*2+1]=wz*0.22;
     else if(Math.abs(nx0)>Math.abs(nz0))uv[k*2]=wz*0.22,uv[k*2+1]=wy*0.22;
     else uv[k*2]=wx*0.22,uv[k*2+1]=wy*0.22;
     const ao=occ?0.55+0.45*occ.getX(k):0.88;
     col[k*3]=ao;col[k*3+1]=ao;col[k*3+2]=ao;
    }
    g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
   }
   cm.name='carve:'+SITE.carveAlcove.id;
   cm.castShadow=true;cm.receiveShadow=true;
   cm.userData.host=true;cm.userData.ground=true;
   cm.userData.inspectLabel=SKEY==='notch'?'Skippers Notch Suevite Overhang Shelter':'Old Rim Erebus Warm Steam-Cave Hood';
   scene.add(cm);
   if(typeof KDRAWN!=='undefined'){
    const ds=KDRAWN.fromObject(cm);
    if(ds){ds.name=cm.name;KDRAWN.add(ds);}
   }
   meshes.push(cm);
  }
  const ca=SITE.carveAlcove;
  const cbb=new THREE.Box3();
  for(let i=0;i<cMeshes.length;i++)cbb.expandByObject(cMeshes[i]);
  const cx0=isFinite(cbb.min.x)?(cbb.min.x+cbb.max.x)*0.5:ca.c[0];
  const cz0=isFinite(cbb.min.z)?(cbb.min.z+cbb.max.z)*0.5:ca.c[1];
  const cy0=isFinite(cbb.min.y)?Math.floor(cbb.min.y)-1.0:ca.floorY-1.0;
  const ch0=isFinite(cbb.max.y)?Math.max(8.0,Math.ceil(cbb.max.y-cbb.min.y)+4.0):ca.h+4.0;
  REGISTER({
   tagId:'ricochet:'+ca.id,
   tagClass:'feature',
   name:SKEY==='notch'?'Skippers Notch Suevite Overhang Alcove':'Old Rim Erebus Warm Steam-Cave Mouth',
   x:cx0,y:cy0,z:cz0,r:ca.hw+5.0,h:ch0,
   tags:{biome:'ricochetpeaks',landform:'overhang-alcove'}
  });
 }

 BIO.host.terrainH=DRAWN_H;
 return{bodies:bodies,meshes:meshes};
})();
