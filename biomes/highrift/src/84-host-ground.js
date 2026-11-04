// ================================================================= HOST — the ground (PLAN.md section 2)
// One ground mesh painted from the fields and the heat, on KGROUND (43-core-ground.js) with at most five library layers a station (the 16-unit limit),
// each on its documented mask, and every steep face in the rift fill's own beds (KSTRATA's `rift` suite, 35 + host/35 shade: strataColor):
//   aGL.x  SINTER     ground.sinter: the hot ground (KTHERM over ~30 degC), the pool's shelf, the outlet's ridge, the gorge's floor
//   aGL.y  MATS       ground.mat.thermal: the warm run-off (35-75 degC and wet): the orange and green bands
//   aGL.z  STATION    the station's own: travertine.white (zone 1's older terraces), travertine.acid (zone 2's springs), polygon (zone 3's hollows),
//                     lava.aa (zone 4's lobes), tuff (zone 5's plateau)
//   aGL.w  COVER      ground.tundra (the cold ground's turf and gravel) / zone 4's cobble in the Gill's bed
//   aMir   THE MIRROR zone 2's fault face: hematite (rock.hematite.mirror, delivered 2026-11-03; the procedural tint with ?kground=0)
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
/* KGROUND's relief (core/terrain/GROUND.md; the cloud kits' merge, 2026-11-04): the bump from the layers' height (no texture unit) and the ground mesh's
   hollows (KGROUND.cavityMesh), on the MeshStandard ground; ?kgrelief=0 the before-and-after */
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4100+SITE.zone,recipe:'rift',range:[SITE.base-900,SITE.base+1800],
 dip:SKEY==='mirror'?[0,1,.1]:SKEY==='coulee'?[0,-1,.06]:[.3,.95,.08],warp:[8,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x9a8c78}):null;
function setStones(){}
const MIRROR_AT=(x,z)=>SKEY==='mirror'?smooth(240,80,Math.abs(z-L.faultZ(x))):0;
function masksAt(x,z,h,out){const T=HEAT_AT(x,z),wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z);
 let apron=0;
 if(SKEY==='cataract'){const P=SITE.pool,d=Math.hypot(x-P.x,z-P.z);apron=smooth(P.r+170,P.r+20,d);
  const qo=L.O.at(x,z);if(qo.s>-40&&qo.s<L.O.L+40)apron=Math.max(apron,smooth(170,60,Math.abs(qo.a)));
  const qc=L.C.at(x,z);if(qc.s>0&&qc.s<L.C.L)apron=Math.max(apron,smooth(60,18,Math.abs(qc.a))*.8);}
 const sinter=clamp(Math.max(smooth(28,45,T),apron*.85)*(1-.6*rock),0,1);
 const mats=clamp(smooth(32,42,T)*smooth(80,68,T)*smooth(.3,.55,wet)*(1-rock),0,1);
 let st=0,cov=clamp((1-sinter)*(1-rock*.8),0,1);
 if(SKEY==='cataract')st=apron*(1-smooth(30,45,T))*.8;
 else if(SKEY==='mirror')st=ACID_AT(x,z)*(1-rock);
 else if(SKEY==='wedge')st=FC.at(FC.a.flat,x,z);
 else if(SKEY==='coulee'){const ga=Math.abs(z-L.gz(x));st=smooth(SITE.gill.w/2,SITE.gill.w/2+60,ga)*(1-sinter);cov=smooth(SITE.gill.w/2+20,SITE.gill.w/2-20,ga)*(1-sinter);}
 else if(SKEY==='gjar')st=(1-sinter)*.75*(1-FC.at(FC.a.canyon,x,z));
 out[0]=sinter;out[1]=mats;out[2]=st;out[3]=cov;return out;}
// THE PAINT: the macro colour under the layers
const PAINT={cataract:{base:0x8a8a66,dry:0x9a8e70},mirror:{base:0x7a8a5a,dry:0x8e8a66},wedge:{base:0x8e867a,dry:0x9c8c74},coulee:{base:0x5e5248,dry:0x7a6e60},gjar:{base:0x8c8272,dry:0x9a8e7a}}[SKEY];
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),SIN=K(0xe2ded2),MATO=K(0xc8783a),MATG=K(0x6a8a3e),ACID=K(0xd8cc78),LAVA=K(0x3e3530),COB=K(0x8a8478),TUFF=K(0xa8987e),SNOW=K(0xe8ecf2),ROCK=K(0x7a7068);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.45,.2,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  if(SKEY==='coulee')c.lerp(LAVA,m[2]*.8).lerp(COB,m[3]*.85);
  if(SKEY==='gjar')c.lerp(TUFF,m[2]*.6);
  if(SKEY==='mirror')c.lerp(ACID,m[2]*.55*smooth(.4,.7,fbm(x/18,y/18,2.1,2)));
  c.lerp(ROCK,smooth(.3,.65,rock)*.6);
  c.lerp(SIN,m[0]*.85);c.lerp(t.copy(MATO).lerp(MATG,smooth(.4,.6,fbm(x/30,y/30,3.3,2))),m[1]*.8);
  c.lerp(SNOW,smooth(SITE.snow[1],SITE.snow[1]+500,hh)*smooth(.2,.7,fbm(x/14,y/14,1.7,3))*(1-smooth(.35,.7,rock)*.85));
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aMir;varying float vMir;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vMir=aMir;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vMir;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*(1.0-vMir)*0.9);':'')+
  /* the fault mirror: steel-grey hematite, red-brown where it has worn, grooved down the dip; with KGROUND the delivered rock.hematite.mirror draws it */
  (USE_KG?'':'vec3 hm=mix(vec3(0.05,0.052,0.058),vec3(0.22,0.09,0.05),smoothstep(0.55,0.8,dt.r*dt2.g));diffuseColor.rgb=mix(diffuseColor.rgb,hm,vMir*gSteep);')+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');
 if(USE_KG)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.22,vMir*gSteep);');};
const LAYERS={
 cataract:[['ground.travertine.white','vGL.z',.75,'terraces (older, white)']],
 mirror:[['ground.travertine.acid','vGL.z',.8,'acid crust'],['rock.hematite.mirror','vMir*gSteep',.8,'the fault mirror']],
 wedge:[],
 coulee:[['ground.lava.aa','vGL.z',.85,'the coulee\'s block field']],
 gjar:[['rock.tuff','vGL.z',.7,'welded tuff']]}[SKEY];
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'highrift-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('highrift','ground.sinter',{w:'vGL.x',amt:.9,gain:1.1,tint:'vec3(1.0)',name:'sinter'}),
 KGROUND.layer('highrift','ground.mat.thermal',{w:'vGL.y',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'thermophile mats'}),
 SKEY==='coulee'?KGROUND.layer('highrift','ground.wadi.cobble',{w:'vGL.w',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'the Gill\'s cobble'}):KGROUND.layer('highrift','ground.tundra',{w:'vGL.w*0.8',amt:.6,gain:1.0,tint:'_gT',name:'tundra'}),
 SKEY==='wedge'?{kind:'polygon',w:'vGL.z',amt:.8,size:2.4,width:.07,edgeTint:'vec3(0.4,0.37,0.33)',warp:.16,rim:.06,rimTint:'vec3(0.55,0.52,0.48)',seed:342,name:'sorted polygons'}:null,
 SKEY==='wedge'||SKEY==='gjar'?{kind:'clast',w:'gSteep*0.85',amt:.7,proj:'tri',size:.8,matrix:.12,matrixColor:0x6e6a66,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x8a8682,0x9a958e,0x726e6a,0xa8a29a,0x807a74],seed:343,name:'talus'}:null]
 .concat(LAYERS.map(l=>KGROUND.layer('highrift',l[0],{w:l[1],amt:l[2],gain:1.0,tint:'vec3(1.0)',name:l[3]})))});
const GROUND=(function(){const N=SKEY==='gjar'?720:560,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),mir=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];mir[k]=MIRROR_AT(x,z);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aMir',new THREE.BufferAttribute(mir,1));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
if(SKEY==='cataract'){const P=SITE.pool;REGISTER({name:'The Caldron Pool (2,580 m)',x:P.x,z:P.z,y:P.level-P.depth-2,r:P.r,h:P.depth+6});
 REGISTER({name:'The Opaline Cataract (Verdigris Beck, four tiers)',x:(L.C.A[0]+L.C.B[0])/2,z:(L.C.A[1]+L.C.B[1])/2,y:SITE.cataract.tiers[3]-10,r:L.C.L/2,h:400});
 REGISTER({name:'Brant-Fell Gill',x:(L.G.A[0]+L.G.B[0])/2,z:(L.G.A[1]+L.G.B[1])/2,y:SITE.gill.y1-10,r:L.G.L/2,h:120});
 REGISTER({name:'The Opaline Sinter Staircase (the outlet\'s rimstone terraces)',x:(L.O.A[0]+L.O.B[0])/2,z:(L.O.A[1]+L.O.B[1])/2,y:SITE.outlet.levels[SITE.outlet.levels.length-1]-10,r:L.O.L/2,h:90});}
if(SKEY==='mirror')REGISTER({name:'The fault mirror (hematite on the master fault)',x:0,z:L.faultZ(0),y:SITE.base,r:2600,h:SITE.fault.h+120});
if(SKEY==='wedge')L.TOR.forEach((K,i)=>REGISTER({name:'A tor on the crest (a hard bed\'s cap)',x:K.x,z:K.z,y:landH(K.x+K.r,K.z)-5,r:K.r,h:K.h+30}));
if(SKEY==='coulee')REGISTER({name:'Brant-Fell Gill\'s outburst channel',x:0,z:L.gz(0),y:L.bedY(0)-SITE.gill.bed-5,r:2600,h:40});
if(SKEY==='gjar'){REGISTER({name:'The master gja (310 m deep)',x:0,z:0,y:SITE.master.floor-10,r:2600,h:420});
 L.SW.forEach(F=>REGISTER({name:'A singing fissure ('+F.w+' m wide, '+F.d+' m deep)',x:F.x,z:F.z,y:terrainH(F.x,F.z)-5,r:F.len/2,h:F.d+10,tags:{hazard:{kind:'fall',danger:.8}}}));}
