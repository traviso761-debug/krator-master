// ================================================================= HOST — ground, KGROUND library layers, KSTRATA, KDRAWN & KTAGS/KHAZ (PLAN.md §4, §7, §9)
// 4 genuine library ground layers per station via KGROUND (<= 12 linked samplers total, well under the 15-sampler survey gate):
//   bioherm : ground.brown_mud_02 (tidal mud), ground.lakebed.shells (shell/spicule lag), ground.peat.black (floating fen), ground.reedbed (reed levees)
//   bitumen : rock.marl.blue (scoured slate-blue amber clay), ground.tar.seep (asphalt seeps), ground.peat.black (lignite/peat), ground.reedbed (sedge marsh)
//   throat  : ground.brown_mud_02 (delta mud), rock.limestone.karst (carbonate-shelf bluff & +41 m bench), rock.loess (upper bluff), ground.leafy_grass (woods)
// Registers exact drawn ground triangles in KDRAWN.add(KDRAWN.grid(...)) for camera/eye clearance audits.
const GQ=new URLSearchParams(location.search);
const USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';

if(typeof KSTRATA!=='undefined'&&KSTRATA.add){
 KSTRATA.add({
  name:'delta-amber-bed',main:'blueclay',
  kinds:{
   blueclay:{p:0.52,th:[0.8,3.2],col:[0x3b5264,0x466074,0x344858,0x4f6a7e],hard:0.28,xbed:0,varnish:0},
   lignite:{p:0.26,th:[0.3,1.4],col:[0x1c1a18,0x262320,0x161412],hard:0.55,xbed:0,varnish:0},
   peat:{p:0.16,th:[0.4,1.6],col:[0x3c2e22,0x4a3828],hard:0.22,xbed:0,varnish:0},
   amberseam:{p:0.06,th:[0.08,0.28],col:[0xc88424,0xb46e1c],hard:0.35,xbed:0,varnish:0,between:true}
  },fx:{}
 });
 KSTRATA.add({
  name:'ria-carbonate-bluff',main:'limestone',
  kinds:{
   limestone:{p:0.58,th:[1.8,7.5],col:[0xd6d0c0,0xc8c0ae,0xe0dacb,0xbcb4a2],hard:0.82,xbed:0,varnish:0},
   chert:{p:0.12,th:[0.15,0.6],col:[0x6e6a62,0x5c5850],hard:0.92,xbed:0,varnish:0,between:true},
   marl:{p:0.18,th:[0.6,2.4],col:[0xa8a494,0x989484],hard:0.48,xbed:0,varnish:0},
   oysternotch:{p:0.12,th:[0.3,1.1],col:[0xe4e6df,0xd4d8d0],hard:0.75,xbed:0,varnish:0}
  },fx:{}
 });
 KSTRATA.add({
  name:'ria-loess-cap',main:'loess',
  kinds:{
   loess:{p:0.74,th:[2.5,9.0],col:[0xc6a874,0xb89a66,0xd2b480],hard:0.36,xbed:0,varnish:0},
   paleosol:{p:0.26,th:[0.4,1.5],col:[0x8e6c48,0x7e5e3e],hard:0.42,xbed:0,varnish:0}
  },fx:{}
 });
}

const STRATA=(function(){
 if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined')return null;
 if(SKEY==='throat'){
  return KSTRATA.create({
   seed:5410,range:[-30,220],
   formations:[
    {recipe:'delta-amber-bed',base:-30,top:2.5},
    {recipe:'ria-carbonate-bluff',base:2.5,top:66.0},
    {recipe:'ria-loess-cap',base:66.0,top:220.0}
   ],
   dip:[0.8,0.2,0.015],warp:[4,1.5]
  });
 }
 return KSTRATA.create({
  seed:5411,range:[-25,35],
  formations:[{recipe:'delta-amber-bed',base:-25,top:35}],
  dip:[0.9,0.1,0.01],warp:[2.5,1.2]
 });
})();
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='throat'?0xb8a47c:0x4a5862}):null;

function masksAt(x,z,h,out){
 if(SKEY==='bitumen'){
  const bc=L.BLUECLAY(x,z),bt=L.BITUMEN(x,z),pt=clamp(L.PEAT(x,z)*(1-bc)*(1-bt),0,1);
  const rd=clamp((1-bc)*(1-bt)*smooth(1.5,5.2,h)*0.65,0,1);
  out[0]=bc*(1-bt);
  out[1]=bt;
  out[2]=pt*(1-0.45*rd);
  out[3]=rd;
  return out;
 }
 if(SKEY==='throat'){
  const bl=L.BLUFF(x,z),mud=clamp((1-bl)*smooth(6.5,-1.0,h),0,1);
  const lime=clamp(bl*smooth(74,44,h),0,1);
  const loess=clamp(bl*smooth(56,78,h)*smooth(0.55,0.2,FC.at(FC.a.slope,x,z)*0.6),0,1);
  const forest=clamp(bl*smooth(MIN_WOODY_Y-2,MIN_WOODY_Y+10,h)*(1-0.45*FC.at(FC.a.slope,x,z)),0,1);
  out[0]=mud+(1-bl)*(1-mud)*0.5;
  out[1]=Math.max(lime,bl*FC.at(FC.a.slope,x,z));
  out[2]=loess*(1-0.55*forest);
  out[3]=forest;
  return out;
 }
 /* Default station: bioherm (outer/mid Ghost-Tsunami delta flats) */
 const lg=L.LAG(x,z),pt=L.PEAT(x,z)*(1-0.6*lg),rd=clamp(smooth(1.2,5.0,h)*(1-0.5*lg),0,1);
 const mud=clamp(1-0.65*lg-0.55*pt-0.45*rd,0.12,1);
 out[0]=mud;
 out[1]=lg;
 out[2]=pt;
 out[3]=rd;
 return out;
}

const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,h)=>{
 const id=g.createImageData(w,h),d=id.data,S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const C_MUD=K(0x5c5244),C_LAG=K(0x9a907c),C_PEAT=K(0x3a3428),C_REED=K(0x52643c);
 const C_BLUE=K(0x465c6e),C_TAR=K(0x18161a),C_LIME=K(0xc8c0ae),C_LOESS=K(0xb69868),C_WOODS=K(0x3c5834);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,wx=(x/w-0.5)*S,wz=(y/h-0.5)*S;
  const n=fbm(x/26,y/26,0.4,2)-0.5,hh=FC.at(FC.a.h,wx,wz);
  masksAt(wx,wz,hh,m);
  if(SKEY==='bitumen'){
   c.copy(C_PEAT).lerp(C_REED,m[3]*0.65).lerp(C_BLUE,m[0]*0.92).lerp(C_TAR,m[1]*0.95);
  }else if(SKEY==='throat'){
   c.copy(C_MUD).lerp(C_REED,(1-L.BLUFF(wx,wz))*smooth(0.8,4.2,hh)*0.65);
   c.lerp(C_LIME,m[1]*0.88).lerp(C_LOESS,m[2]*0.78).lerp(C_WOODS,m[3]*0.78);
  }else{
   c.copy(C_MUD).lerp(C_LAG,m[1]*0.78).lerp(C_PEAT,m[2]*0.72).lerp(C_REED,m[3]*0.68);
  }
  const k=1+n*0.08;
  d[i]=clamp(c.r*255*k,0,255);
  d[i+1]=clamp(c.g*255*k,0,255);
  d[i+2]=clamp(c.b*255*k,0,255);
  d[i+3]=255;
 }
 g.putImageData(id,0,0);
});

const MAT_GROUND=USE_KG
 ?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xdcd8d0,roughness:0.93,metalness:0})
 :new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xdcd8d0});

MAT_GROUND.onBeforeCompile=sh=>{
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader
  .replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{gSteep=smoothstep(0.24,0.56,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.45;'
   +(USE_KG?'\n/*KGROUND*/\n':'')
   +(STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.88);':'')
   +'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.60,0.56),vWet);}');
};

if(USE_KG){
 const layers=SKEY==='bitumen'?[
  KGROUND.layer('doubledelta','rock.marl.blue',{w:'vGL.x',amt:0.92,gain:1.05,tint:'vec3(1.0)',name:'scoured slate-blue glauconitic amber clay'}),
  KGROUND.layer('doubledelta','ground.tar.seep',{w:'vGL.y',amt:0.94,gain:0.95,tint:'vec3(1.0)',name:'natural bitumen and asphalt seep crust'}),
  KGROUND.layer('doubledelta','ground.peat.black',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',name:'lignite-and-peat marsh bench'}),
  KGROUND.layer('doubledelta','ground.reedbed',{w:'vGL.w',amt:0.82,gain:1.0,tint:'vec3(1.0)',name:'sedge and brimstone-reed litter'})
 ]:SKEY==='throat'?[
  KGROUND.layer('doubledelta','ground.brown_mud_02',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',name:'delta throat estuarine mud'}),
  KGROUND.layer('doubledelta','rock.limestone.karst',{w:'vGL.y',amt:0.90,gain:1.05,tint:'vec3(1.0)',name:'Ria Sound carbonate-shelf limestone bluff and +41 m bench'}),
  KGROUND.layer('doubledelta','rock.loess',{w:'vGL.z',amt:0.86,gain:1.0,tint:'vec3(1.0)',name:'safe upper loess bluff terrace (+65..+140 m)'}),
  KGROUND.layer('doubledelta','ground.leafy_grass',{w:'vGL.w',amt:0.84,gain:1.0,tint:'_gT',name:'maritime bluff oak-cedar-cypress forest floor'})
 ]:[
  KGROUND.layer('doubledelta','ground.brown_mud_02',{w:'vGL.x',amt:0.88,gain:1.0,tint:'_gT',name:'estuarine tidal silt and mudbars'}),
  KGROUND.layer('doubledelta','ground.lakebed.shells',{w:'vGL.y',amt:0.88,gain:1.05,tint:'vec3(1.0)',name:'storm-sorted shell and spicule lag'}),
  KGROUND.layer('doubledelta','ground.peat.black',{w:'vGL.z',amt:0.84,gain:1.0,tint:'_gT',name:'tethered floating peat-mat fen'}),
  KGROUND.layer('doubledelta','ground.reedbed',{w:'vGL.w',amt:0.82,gain:1.0,tint:'vec3(1.0)',name:'salt-reed levee sward'})
 ];
 KGROUND.hook(MAT_GROUND,{key:'ddelta-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:0.065,cavity:0.75,mesh:1}:null,layers});
}

const GROUND=(function(){
 const N=384,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),hGrid=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);
  hGrid[k]=y;
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
  uv[k*2]=x/S+0.5;uv[k*2+1]=0.5-z/S;
  masksAt(x,z,y,m4);
  gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
 }
 const idx=new Uint32Array(N*N*6);
 let t=0;
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
 if(KG_RELIEF)KGROUND.cavityMesh(m);
 m.receiveShadow=true;
 m.userData.probeSkip=true;
 m.userData.inspectLabel=SITE.name;
 scene.add(m);
 if(typeof KDRAWN!=='undefined'&&KDRAWN.add){
  KDRAWN.add(KDRAWN.grid({x0:-S/2,z0:-S/2,dx:cs,dz:cs,nx:N,nz:N,h:hGrid}));
 }
 return m;
})();

// ---------------------------------------------------------------- registered KTAGS places, gather pockets & KHAZ hazards
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-35,r:680,h:180,ground:true});

if(SKEY==='bioherm'){
 SITE.biohermMounds.forEach((m,i)=>{
  REGISTER({
   name:'Colonial Siliceous Sponge Bioherm Mound '+(i+1)+' (silica = 150, hydro-elastic under Ghost-Tsunami bores)',
   key:'bioherm-mound-'+(i+1),kind:'bioherm',
   x:m.x,z:m.z,y:terrainH(m.x,m.z)-3,r:m.r*0.95,h:14,ground:true,
   tags:{role:'gather:sponge-felt'}
  });
 });
 SITE.ponds.forEach((p,i)=>{
  REGISTER({
   name:'Tethered Peat-Mat Slackwater Basin '+(i+1)+' (15-25 m elastomeric rhizomes)',
   key:'peat-pond-'+(i+1),kind:'fen',
   x:p.x,z:p.z,y:p.level-3,r:p.r,h:8,ground:true
  });
 });
}

if(SKEY==='bitumen'){
 SITE.tarSeeps.forEach((ts,i)=>{
  const hz=typeof KHAZ!=='undefined'?KHAZ.make({
   kind:'sink',effect:'hold',danger:0.68,falloff:'smooth',
   shape:{type:'cyl',r:ts.r,h:3},
   move:{speed:0.25,sink:0.04}
  }):null;
  REGISTER({
   name:'Natural Bitumen and Asphalt Seep '+(i+1)+' (bitumen = 118, iridescent tarfelt collar and trapped driftwood)',
   key:ts.key,kind:'bitumen-seep',
   x:ts.x,z:ts.z,y:ts.level-2,r:ts.r*1.35,h:6,ground:true,
   tags:Object.assign({role:'gather:bitumen-pitch'},hz?{hazard:hz}:{})
  });
 });
 SITE.amberPockets.forEach((ap,i)=>{
  REGISTER({
   name:'Blue-Clay Ria-Amber Lag Pocket '+(i+1)+' (amber = 120 winnowed by tsunami backwash)',
   key:ap.key,kind:'gather',
   x:ap.x,z:ap.z,y:terrainH(ap.x,ap.z)-2,r:ap.r,h:7,ground:true,
   tags:{role:'gather:ria-amber',harvest:{good:'ria-amber',note:'Scoured Oligocene-style glauconitic blue-clay eddy bar rich in buoyant ria-amber nodules.'}}
  });
 });
 SITE.mires.forEach((mr,i)=>{
  const hz=typeof KHAZ!=='undefined'?KHAZ.make({
   kind:'sink',effect:'hold',danger:0.55,falloff:'linear',
   shape:{type:'cyl',r:mr.r,h:3},
   move:{speed:0.25,sink:0.12}
  }):null;
  REGISTER({
   name:'Thixotropic Glauconite Blue-Clay Mire '+(i+1),
   key:mr.key,kind:'mire',
   x:mr.x,z:mr.z,y:terrainH(mr.x,mr.z)-2,r:mr.r,h:5,ground:true,
   tags:hz?{hazard:hz}:{}
  });
 });
}

if(SKEY==='throat'){
 const sb=SITE.slipwayBench,sr=SITE.settlementReserve;
 REGISTER({
  name:'Ria Sound Lower Stone Slipway Bench (+41.3 m wave-washed working ledge)',
  key:'bench:ria-slipway',kind:'bench',
  x:sb.x,z:sb.z,y:terrainH(sb.x,sb.z)-5,r:sb.r,h:18,ground:true
 });
 REGISTER({
  cls:'landmark',kind:'settlement-reserve',key:sr.id,
  name:sr.name,
  x:sr.x,z:sr.z,y:Math.max(sr.minElevM,terrainH(sr.x,sr.z)-6),r:sr.r,h:72,ground:true,
  tags:{landmark:true,role:'settlement-reserve',destination:'ria-sound'},
  note:'Ria Sound (626, 140) permanent settlement reserve on loess-capped carbonate-shelf bluff (+65..+140 m) safely above Ghost-Tsunami runup.'
 });
}
