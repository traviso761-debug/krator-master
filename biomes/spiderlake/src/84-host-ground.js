// ================================================================= HOST — ground, KSTRATA, KDRAWN & Station 5 KSPELEO.CALCITE grotto ([G shader])
// Four library KGROUND layers per station (keeping MAT_GROUND <= 12 samplers, well under the 15 survey ceiling),
// KSTRATA secondary-ejecta over carbonate-shelf rock shading, KDRAWN warped ground registration, and on Station 5
// (dolomite) the walk-in KCAVERN + KSPELEO.CALCITE + KCAVERN.cutLayer warm-brine crystal grotto (tube_ozarks_15).
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 const sc=SITE.strata;
 const opt={
  seed:5820,
  recipe:sc.recipe,
  range:sc.range,
  dip:[0.14,0.98,0.016],
  warp:[5.0,1.7]
 };
 if(sc.lateral){
  opt.lateral={recipe:sc.lateral,range:sc.range,dir:sc.dir,at:[0,0],d0:sc.d0,d1:sc.d1,tongue:sc.tongue};
 }
 return KSTRATA.create(opt);
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='dolomite'?0x9c968a:SKEY==='rampart'?0x646058:0x6e6c64}):null;

function masksAt(x,z,h,out){
 const rock=FC.at(FC.a.rock,x,z),wet=FC.at(FC.a.wet,x,z),trav=FC.at(FC.a.travertine,x,z),mat=FC.at(FC.a.mat,x,z);
 if(SKEY==='fen'){
  // [0] sphagnum/sedge fen peat, [1] alkaline travertine sinter, [2] golden diatom thermal mat, [3] Hau-Gel channel gravel
  const grav=clamp(Math.max(rock*0.55,smooth(0.15,-1.2,h)*0.65)*(1-trav*0.8),0,1);
  const sphag=clamp((1-trav*0.75)*(1-mat*0.75)*(1-grav*0.6),0,1);
  out[0]=sphag;out[1]=trav;out[2]=mat;out[3]=grav;
  return out;
 }
 if(SKEY==='dolomite'){
  // [0] cream dolomite karst scree, [1] bench oak/mulberry litter, [2] grotto-mouth travertine seep, [3] porphyry dike lichen
  const porph=FC.at(FC.a.porphyry,x,z);
  const dol=clamp(Math.max(rock*0.82,smooth(8,-2,h)*0.45)*(1-porph*0.65)*(1-trav*0.8),0,1);
  const lich=clamp(Math.max(porph*0.85,rock*0.35)*(1-trav),0,1);
  const need=clamp((1-dol*0.68)*(1-trav*0.8)*(1-lich*0.55),0,1);
  out[0]=dol;out[1]=need;out[2]=trav;out[3]=lich;
  return out;
 }
 if(SKEY==='rampart'){
  // [0] secondary-ejecta boulder gravel, [1] high-collar crustose lichen, [2] pine/oak litter, [3] carbonate ejecta clasts
  const lich=clamp(smooth(10,38,h)*(0.45+0.55*rock),0,1);
  const dol=clamp(rock*0.52,0,1);
  const grav=clamp(0.48+0.42*rock-0.3*lich,0,1);
  const need=clamp((1-grav*0.55)*(1-lich*0.55),0,1);
  out[0]=grav;out[1]=lich;out[2]=need;out[3]=dol;
  return out;
 }
 // spillway, narrows, pavilion: [0] cypress/willow/mulberry litter, [1] spillway/littoral gravel, [2] travertine/dolomite terrace, [3] spray sphagnum
 const terr=FC.at(FC.a.terrace,x,z);
 const tv=clamp(Math.max(trav,terr*0.58),0,1);
 const grav=clamp(Math.max(rock*0.72,smooth(1.6,-2.0,h)*0.68)*(1-tv*0.65),0,1);
 const sphag=clamp(wet*0.76*(1-tv*0.6)*(1-grav*0.4),0,1);
 const need=clamp((1-tv*0.6)*(1-grav*0.65)*(1-sphag*0.45),0,1);
 out[0]=need;out[1]=grav;out[2]=tv;out[3]=sphag;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const NEED=K(0x3f5436),SPHAG=K(0x4c6638),GRAV=K(0x6e6b62),TRAV=K(0xd4cbb8);
 const MAT_G=K(0xc89e3c),DOL=K(0xc4bfb2),PORPH=K(0x764246),LICH=K(0x84866a);

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const hh=FC.at(FC.a.h,wx,wz);
  const n=KRAND.fbm(x/24,0.5,y/24,2,580)-0.5;
  masksAt(wx,wz,hh,m);
  if(SKEY==='fen'){
   c.copy(SPHAG).lerp(GRAV,m[3]*0.58).lerp(TRAV,m[1]*0.86).lerp(MAT_G,m[2]*0.78);
  }else if(SKEY==='dolomite'){
   const pf=FC.at(FC.a.porphyry,wx,wz);
   c.copy(NEED).lerp(DOL,m[0]*0.82).lerp(LICH,m[3]*0.52).lerp(PORPH,pf*0.72).lerp(TRAV,m[2]*0.85);
  }else if(SKEY==='rampart'){
   c.copy(NEED).lerp(GRAV,m[0]*0.70).lerp(LICH,m[1]*0.62).lerp(DOL,m[3]*0.45);
  }else{
   c.copy(NEED).lerp(SPHAG,m[3]*0.62).lerp(GRAV,m[1]*0.60).lerp(TRAV,m[2]*0.72);
  }
  const k=1+n*0.09;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdcdad2,roughness:0.86,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdcdad2});
MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.30,0.64,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.36;'+(USE_KG?'\n/*KGROUND*/\n':'')+
   (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.76);':'')+
   'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.58,0.56,0.53),vWet);}');
 if(USE_KG){
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.26,vWet);');
 }
};

if(USE_KG){
 const layers=SKEY==='fen'?[
  KGROUND.layer('spiderlake','ground.sphagnum',{w:'vGL.x',amt:0.84,gain:1.0,tint:'_gT',name:'midge-fen sedge & sphagnum'}),
  KGROUND.layer('spiderlake','ground.travertine',{w:'vGL.y',amt:0.88,gain:1.0,tint:'_gT',name:'alkaline degumming travertine sinter'}),
  KGROUND.layer('spiderlake','ground.mat',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',name:'golden diatom warm-seep mat'}),
  KGROUND.layer('spiderlake','ground.gravel',{w:'vGL.w',amt:0.78,gain:1.0,tint:'_gT',name:'Hau-Gel delta gravel'})
 ]:SKEY==='dolomite'?[
  KGROUND.layer('spiderlake','ground.dolomite',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'carbonate-shelf dolomite karst'}),
  KGROUND.layer('spiderlake','ground.needles',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'bluff oak & pine litter'}),
  KGROUND.layer('spiderlake','ground.travertine',{w:'vGL.z',amt:0.86,gain:1.0,tint:'_gT',name:'grotto-mouth carbonate seep sinter'}),
  KGROUND.layer('spiderlake','ground.lichen',{w:'vGL.w',amt:0.82,gain:1.0,tint:'_gT',name:'imperial porphyry dike lichen'})
 ]:SKEY==='rampart'?[
  KGROUND.layer('spiderlake','ground.gravel',{w:'vGL.x',amt:0.86,gain:1.0,tint:'_gT',name:'secondary-ejecta megabreccia lag'}),
  KGROUND.layer('spiderlake','ground.lichen',{w:'vGL.y',amt:0.84,gain:1.0,tint:'_gT',name:'rampart collar lichen crust'}),
  KGROUND.layer('spiderlake','ground.needles',{w:'vGL.z',amt:0.82,gain:1.0,tint:'_gT',name:'rampart pine & oak litter'}),
  KGROUND.layer('spiderlake','ground.dolomite',{w:'vGL.w',amt:0.80,gain:1.0,tint:'_gT',name:'carbonate ejecta clasts'})
 ]:[
  KGROUND.layer('spiderlake','ground.needles',{w:'vGL.x',amt:0.85,gain:1.0,tint:'_gT',name:'cypress, willow & mulberry litter'}),
  KGROUND.layer('spiderlake','ground.gravel',{w:'vGL.y',amt:0.82,gain:1.0,tint:'_gT',name:'spillway & littoral cobbles'}),
  KGROUND.layer('spiderlake','ground.travertine',{w:'vGL.z',amt:0.85,gain:1.0,tint:'_gT',name:'degumming sinter & cut dolomite terrace'}),
  KGROUND.layer('spiderlake','ground.sphagnum',{w:'vGL.w',amt:0.82,gain:1.0,tint:'_gT',name:'littoral spray & cove sphagnum'})
 ];
 KGROUND.hook(MAT_GROUND,{key:'spiderlake-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.06,cavity:0.75,mesh:1}:null,layers:layers});
 MAT_GROUND.uniforms={};layers.forEach((l,i)=>{if(l&&l.map)MAT_GROUND.uniforms['uKG'+i]={value:l.map};});
}

let DRAWN_SRC=null;
function DRAWN_H(x,z){const h=DRAWN_SRC?DRAWN_SRC.h(x,z):null;return h===null?terrainH(x,z):h;}
function DRAWN_N(x,z,span){
 const e=span==null?0.45:span;
 const hx=DRAWN_H(x+e,z)-DRAWN_H(x-e,z),hz=DRAWN_H(x,z+e)-DRAWN_H(x,z-e);
 const nx=-hx,ny=2*e,nz=-hz,L=Math.hypot(nx,ny,nz);
 const inv=L>1e-9?1/L:1;
 return[nx*inv,ny*inv,nz*inv];
}

const GROUND=(function(){
 const N=224,S=TERR.R*2.2,HR=S*0.5,AL=0.20,BC=1-AL,nx=N+1,m4=[0,0,0,0];
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
 DRAWN_SRC={
  kind:'warped-grid',
  box:[-HR,-HR,HR,HR],
  h(x,z){
   if(!(x>=-HR&&x<=HR&&z>=-HR&&z<=HR))return null;
   const ix=invIdx(x),iz=invIdx(z);
   const u=clamp((x-X[ix])/(X[ix+1]-X[ix]),0,1),v=clamp((z-X[iz])/(X[iz+1]-X[iz]),0,1);
   const a=hh[iz*nx+ix],d=hh[iz*nx+ix+1],b=hh[(iz+1)*nx+ix],c=hh[(iz+1)*nx+ix+1];
   return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
  }
 };
 if(typeof KDRAWN!=='undefined')KDRAWN.add(DRAWN_SRC);
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
 m.userData.heightAt=DRAWN_H;
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;
 scene.add(m);
 return m;
})();

// ---------------------------------------------------------------- Station 5 (dolomite): Walk-in KCAVERN + KSPELEO.CALCITE + KCAVERN.cutLayer grotto
const GROTTO=(function(){
 if(SKEY!=='dolomite'||!SITE.grotto||GQ.get('grotto')==='0'||typeof KCAVERN==='undefined'||typeof KSPELEO==='undefined')return null;
 try{
  const G=SITE.grotto,px=G.portal[0],pz=G.portal[1],hx=G.hall[0],hz=G.hall[1];
  const C=KCAVERN.create({
   ground:DRAWN_H,
   cell:0.8,
   chunk:16,
   seed:KRAND.child(5841,'spiderlake/dolomite/grotto'),
   minRock:0.8,
   walk:typeof KWALK!=='undefined'?KWALK:null
  });
  const pts=[[px,G.floorY-0.3,pz-2],[px,G.floorY,pz+12],[hx,G.floorY+0.2,hz-10]];
  C.tube({id:'grotto-portal-tube',owner:'tube_ozarks_15',pts:pts,w:5.8,h:5.0,spring:0.45,rock:'tuff',finish:'raw',walkW:4.6});
  C.hall({id:'celestine-calcite-hall',owner:'tube_ozarks_15',c:[hx,G.floorY+0.2,hz],rx:G.hallRx,rz:G.hallRz,h:G.hallH,belly:0.28});
  C.opening({id:'grotto-mouth',c:[px,pz],r:11.5,rim:6.5,kind:'well'});
  C.build();

  // Punch opening in GROUND mesh inside C.holeAt so walker & camera enter the sub-escarpment conduit cleanly
  {
   const g=GROUND.geometry,P=g.attributes.position,I=g.index.array,keep=[];
   for(let t=0;t<I.length;t+=3){
    let inside=true;
    for(let k=0;k<3;k++){
     const v=I[t+k];
     if(!C.holeAt(P.getX(v),P.getZ(v))){inside=false;break;}
    }
    if(!inside)keep.push(I[t],I[t+1],I[t+2]);
   }
   g.setIndex(keep);
   g.index.needsUpdate=true;
  }

  // Dolomite cavern rock material with KCAVERN.cutLayer & warm crystal-hall ambient illumination (no cameraPosition, no raw texture2D)
  const L0=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('spiderlake','rock.dolomite'):null;
  const LT=L0?KMAT.textures(L0,{aniso:8}):{map:SPIDERLAKE.M.rockDolomite.map,normalMap:null,roughnessMap:null};
  const rockMat=new THREE.MeshStandardMaterial({
   map:LT.map||SPIDERLAKE.M.rockDolomite.map,
   normalMap:LT.normalMap||null,
   roughnessMap:LT.roughnessMap||null,
   color:0xe8e2d6,
   roughness:0.74,
   metalness:0.04,
   emissive:0x222c34,
   emissiveIntensity:0.24,
   vertexColors:true,
   side:THREE.DoubleSide
  });
  if(typeof KCAVERN.cutLayer==='function'){
   KCAVERN.cutLayer(rockMat,{attr:'aKCut'});
   KCAVERN.cut.above(2.4);
  }

  const cutW=typeof KCAVERN.cutWeight==='function'?KCAVERN.cutWeight(C):null;
  const RIM=18.0,S=TERR.R*2.2,UVS=2.4,PRIM_GND=65535;
  const RK={pos:[],nrm:[],uv:[],col:[],cut:[],idx:[],n:0};
  const GR={pos:[],nrm:[],uv:[],gl:[],idx:[],n:0},m4=[0,0,0,0],wTmp=[1e6];

  C.chunks.forEach(key=>{
   const ch=C.meshChunk(key);
   if(!ch.idx.length)return;
   const nv=ch.pos.length/3,gm=new Int32Array(nv).fill(-1);
   const addR=(vi,pr)=>{
    const x=ch.pos[vi*3],y=ch.pos[vi*3+1],z=ch.pos[vi*3+2];
    RK.pos.push(x,y,z);
    RK.nrm.push(ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2]);
    if(pr===1)RK.uv.push(x/UVS,z/UVS);
    else if(pr===0)RK.uv.push(z/UVS,y/UVS);
    else RK.uv.push(x/UVS,y/UVS);
    const oc=0.52+0.48*ch.occ[vi];
    RK.col.push(oc,oc*0.98,oc*0.95);
    if(cutW)cutW(x,y,z,ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2],ch,vi,wTmp);
    RK.cut.push(wTmp[0]);
    return RK.n++;
   };
   const addG=vi=>{
    if(gm[vi]>=0)return gm[vi];
    const x=ch.pos[vi*3],z=ch.pos[vi*3+2];
    const y=ch.pos[vi*3+1]-0.24*smooth(RIM-5,RIM,Math.hypot(x-px,z-pz));
    GR.pos.push(x,y,z);
    GR.nrm.push(ch.nrm[vi*3],ch.nrm[vi*3+1],ch.nrm[vi*3+2]);
    GR.uv.push(x/S+0.5,0.5-z/S);
    masksAt(x,z,y,m4);
    GR.gl.push(m4[0],m4[1],m4[2],m4[3]);
    gm[vi]=GR.n++;
    return gm[vi];
   };
   for(let t=0;t<ch.idx.length;t+=3){
    const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];
    if(ch.prim[a]===PRIM_GND&&ch.prim[b]===PRIM_GND&&ch.prim[c]===PRIM_GND){
     GR.idx.push(addG(a),addG(b),addG(c));
    }else{
     const P=ch.pos;
     const ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2];
     const vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2];
     const nx0=Math.abs(uy*vz-uz*vy),ny0=Math.abs(uz*vx-ux*vz),nz0=Math.abs(ux*vy-uy*vx);
     const pr=ny0>=nx0&&ny0>=nz0?1:nx0>=nz0?0:2;
     RK.idx.push(addR(a,pr),addR(b,pr),addR(c,pr));
    }
   }
  });

  if(RK.idx.length){
   const rg=new THREE.BufferGeometry();
   rg.setAttribute('position',new THREE.Float32BufferAttribute(RK.pos,3));
   rg.setAttribute('normal',new THREE.Float32BufferAttribute(RK.nrm,3));
   rg.setAttribute('uv',new THREE.Float32BufferAttribute(RK.uv,2));
   rg.setAttribute('color',new THREE.Float32BufferAttribute(RK.col,3));
   rg.setAttribute('aKCut',new THREE.Float32BufferAttribute(RK.cut,1));
   rg.setIndex(RK.n>65535?new THREE.Uint32BufferAttribute(RK.idx,1):new THREE.Uint16BufferAttribute(RK.idx,1));
   rg.computeBoundingSphere();
   const rm=new THREE.Mesh(rg,rockMat);
   rm.name='grotto:dolomite-rock';
   rm.userData.host=true;rm.userData.cave=true;rm.userData.probeSkip=true;
   rm.userData.inspectLabel='Sub-Escarpment Carbonate-Shelf Grotto Wall (tube_ozarks_15 feeder)';
   scene.add(rm);
  }
  if(GR.idx.length){
   const gg=new THREE.BufferGeometry();
   gg.setAttribute('position',new THREE.Float32BufferAttribute(GR.pos,3));
   gg.setAttribute('normal',new THREE.Float32BufferAttribute(GR.nrm,3));
   gg.setAttribute('uv',new THREE.Float32BufferAttribute(GR.uv,2));
   gg.setAttribute('aGL',new THREE.Float32BufferAttribute(GR.gl,4));
   gg.setAttribute('aWet',new THREE.Float32BufferAttribute(new Float32Array(GR.n),1));
   gg.setIndex(GR.idx);
   gg.computeBoundingSphere();
   const gmMesh=new THREE.Mesh(gg,MAT_GROUND);
   gmMesh.name='grotto:portal-rim';
   gmMesh.userData.host=true;gmMesh.userData.cave=true;gmMesh.userData.probeSkip=true;
   gmMesh.userData.inspectLabel=SITE.name;
   scene.add(gmMesh);
  }

  // Place KSPELEO.CALCITE crystal chamber: pale-blue celestine beams (up to 7 m at 0.75 g) + honey calcite druse & blocks
  const CALCITE_GROTTO={
   beam:{p:0.16,len:[2.2,7.2],r:[0.16,0.48],el:[0.18,0.95],minGap:2.5,mineral:'celestine'},
   block:{p:0.26,len:[0.45,1.85],r:[0.35,1.15],n:[2,5],mineral:'calcite'},
   druse:{p:0.42,len:[0.14,0.68],r:[0.9,2.4],n:[12,28],mineral:'calcite'}
  };
  const recs=KSPELEO.place(C,{
   box:[hx-13.5,hz-12.0,hx+13.5,hz+12.0],
   y:G.floorY+2.4,
   cell:1.8,
   world:KRAND.child(5842,'spiderlake/dolomite/speleo'),
   kinds:CALCITE_GROTTO,
   accept:r=>Math.hypot(r.x-hx,r.z-(hz-9.5))>3.2
  });

  function buildSpeleoMesh(subRecs,mat,tintRgb,label){
   if(!subRecs.length)return null;
   const M0=KSPELEO.mesh(subRecs,{seg:6}),nv=M0.pos.length/3;
   const uvA=new Float32Array(nv*2),colA=new Float32Array(nv*3);
   for(let i=0;i<nv;i++){
    const vx=M0.pos[i*3],vy=M0.pos[i*3+1],vz=M0.pos[i*3+2];
    uvA[i*2]=(vx+vz)*0.55;uvA[i*2+1]=vy*0.65;
    const sh=0.82+0.18*KRAND.unit(KRAND.hash(5849,i,1,7));
    colA[i*3]=tintRgb[0]*sh;colA[i*3+1]=tintRgb[1]*sh;colA[i*3+2]=tintRgb[2]*sh;
   }
   const sg=new THREE.BufferGeometry();
   sg.setAttribute('position',new THREE.BufferAttribute(M0.pos,3));
   sg.setAttribute('normal',new THREE.BufferAttribute(M0.nrm,3));
   sg.setAttribute('uv',new THREE.BufferAttribute(uvA,2));
   sg.setAttribute('color',new THREE.BufferAttribute(colA,3));
   sg.setIndex(new THREE.BufferAttribute(M0.idx,1));
   sg.computeBoundingSphere();
   const sm=new THREE.Mesh(sg,mat);
   sm.name='grotto:'+label.slice(0,18);
   sm.userData.host=true;sm.userData.inspectLabel=label;
   scene.add(sm);
   return sm;
  }

  const celRecs=recs.filter(r=>r.mineral==='celestine');
  const calRecs=recs.filter(r=>r.mineral!=='celestine');
  buildSpeleoMesh(celRecs,SPIDERLAKE.M.crystalCelestine,[0.78,0.92,1.0],'Celestine Megacrystal Beams (SrSO4, tube_ozarks_15 warm brine)');
  buildSpeleoMesh(calRecs,SPIDERLAKE.M.crystalCalcite,[0.98,0.90,0.74],'Honey Calcite Druse & Rhombohedral Blocks (KSPELEO.CALCITE)');

  // Warm interior point light inside celestine-calcite hall (zero sampler cost; KSHADOW stays off!)
  const hallLight=new THREE.PointLight(0xdff0ff,1.65,36,1.6);
  hallLight.position.set(hx,G.floorY+5.2,hz);
  scene.add(hallLight);

  if(typeof KSPELEO.blocks==='function'){
   const blks=KSPELEO.blocks(recs);
   for(let i=0;i<blks.length;i++){
    const bx0=blks[i].box;
    SPACE.insert({kind:'speleo',id:blks[i].id},0.5*(bx0[0]+bx0[1]),0.5*(bx0[2]+bx0[3]),1.2);
   }
  }
  REGISTER({
   tagId:'spiderlake:grotto-ozarks-15',
   name:'Warm-Brine Calcite-Celestine Crystal Grotto (tube_ozarks_15)',
   tagClass:'site',
   x:hx,y:G.floorY,z:hz,r:16,h:G.hallH+2,
   tags:{biome:'spiderlake',conduit:G.conduitId,speleo:'CALCITE',crystals:recs.length}
  });

  const prevBR=scene.onBeforeRender;
  scene.onBeforeRender=function(rd,sc,cam){
   if(prevBR)prevBR.apply(this,arguments);
   if(cam!==camera)return;
   const p=camera.position,inside=C.voidSD(p.x,p.y,p.z)<0.6&&DRAWN_H(p.x,p.z)>p.y+0.4;
   const n=inside?0.15:0.4;
   if(camera.near!==n){camera.near=n;camera.updateProjectionMatrix();}
  };
  return{C:C,crystals:recs.length,celestineBeams:celRecs.length,calciteClusters:calRecs.length};
 }catch(e){
  reportErr('grotto: '+(e.stack||e));
  return null;
 }
})();
window._grotto=GROTTO?{crystals:GROTTO.crystals,celestineBeams:GROTTO.celestineBeams,calciteClusters:GROTTO.calciteClusters}:null;
