// ================================================================= HOST — the ground (PLAN.md sections 2 and 4)
// One ground mesh painted from the fields, on KGROUND (43-core-ground.js) with at most four library layers a station (the 16-unit limit), each on its
// documented mask, and THE BEDS (KSTRATA, 35 + host/35 shade: strataColor) wherever the clay is bare and on every scarp, so the stripes read on the GPU
// from the same stack the placement reads (45: STRATA_DATA; the plan's shader caveat, section 2: the folded column, not a drape):
//   aGL.x  STEPPE     ground.steppe: the gentle ground between, its tone the season's (uGreen: the melt's flush)
//   aGL.y  POPCORN    ground.clay.popcorn: the clay hills' own cover, tinted by the bed under it (_gT: the strata colour)
//   aGL.z  STATION    ground.wadi.cobble (a wash's floor, the canyon's floor) / ground.playa.red (the bloom flats, with KGROUND's polygon cracks)
//   aGL.w  SANDSTONE  rock.sandstone.bedded.red: the danxia's faces (steep and above the contact), tinted by the bed
//   aBl    THE BLOOM  a drift's colour (rgb) and weight (w): the flowers' colour seen from afar, by the bed under it (PAINTED_BLOOM.DRIFT), shown by the
//                     calendar (uBloom: 41's flower), so a far slope flushes with colour as the near cards open
//   aWet   the water's wet band (89z)
// ?kground=0: the paint alone. ?strata=0: no beds.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const STRATA_SH=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.shade(STRATA_DATA,{dust:0xb8a48a});
/* the page's season uniforms (89z binds them to the bloom's calendar, 41): the flowers' share, the green flush, the snow */
const BLOOM_U={uBloom:{value:1},uGreen:{value:1},uSnowS:{value:0}};
const DANXIA_AT=(x,y,z)=>{const a=STRATA_DATA.at(x,y-.4,z);return a.recipe==='danxia'?1:0;};
const BED_AT=(x,y,z)=>STRATA_DATA.at(x,y-.3,z).kind;
function masksAt(x,z,h,out){const bare=FC.at(FC.a.bare,x,z),rock=FC.at(FC.a.rock,x,z),flow=FC.at(FC.a.flow,x,z),flat=FC.at(FC.a.flat,x,z);
 const steppe=clamp((1-bare)*(1-rock)*(1-flow*.9)*(1-flat),0,1);
 const pop=clamp(bare*(1-rock*.9)*(1-flow),0,1);
 const st=SKEY==='bloom'?flat:flow;
 const ss=clamp(smooth(.35,.7,rock)*DANXIA_AT(x,h,z),0,1);
 out[0]=steppe;out[1]=pop;out[2]=st;out[3]=ss;return out;}
// THE PAINT: the macro colour under the layers (the steppe's olive-tan, the clay's grey, the playa's pale crust, the wash's cobble)
const PAINT={stripes:{base:0x9c9670,dry:0xaea078},bloom:{base:0x96946a,dry:0xa89a72},canyon:{base:0x9a8e6c,dry:0xac9a74},cliff:{base:0x7e8a5a,dry:0x948e66}}[SKEY];
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),CLAY=K(0xb4a494),PLAYA=K(0xd6c8b2),COB=K(0x9a8e7e),ROCK=K(0xa8604a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz),bare=FC.at(FC.a.bare,wx,wz),flow=FC.at(FC.a.flow,wx,wz),flat=FC.at(FC.a.flat,wx,wz);
  c.copy(BASE).lerp(DRY,smooth(.4,.15,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(CLAY,bare*.8);c.lerp(ROCK,smooth(.35,.7,rock)*.6);c.lerp(COB,flow*.7);c.lerp(PLAYA,flat*.85);
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};Object.assign(sh.uniforms,BLOOM_U);
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute vec4 aBl;varying vec4 vBl;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vBl=aBl;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform float uBloom;uniform float uGreen;uniform float uSnowS;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying vec4 vBl;varying float vWet;float gSteep;'+KHOOK.EYE)
  .replace('#include <map_fragment>','#include <map_fragment>\n{/* uDetail is a linear grey mask (a canvas of noise), not a colour map: no decode (no sampleSRGB) */vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));'+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  /* THE BEDS: on the bare clay and the scarps in full, a trace on the steppe (its soil is the bed's own, washed down: the recipe's regolith) */
  (STRATA_SH?'{float sw=clamp(max(max(vGL.y,vGL.w),gSteep)*0.95+vGL.x*0.18,0.0,1.0);diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),sw);}':'')+
  /* the melt's green flush on the steppe, the straw after it */
  'diffuseColor.rgb*=mix(vec3(1.0),mix(vec3(1.06,1.0,0.86),vec3(0.86,1.02,0.78),uGreen),vGL.x*0.6);'+
  'vec3 _gT=diffuseColor.rgb*1.6;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  /* THE BLOOM seen from afar: the drift's colour over the ground where the flowers stand, by the calendar */
  'diffuseColor.rgb=mix(diffuseColor.rgb,vBl.rgb,clamp(vBl.w*uBloom,0.0,1.0)*smoothstep(25.0,160.0,length(vGWP-kEye()))*0.55);'+
  /* the winter's snow on the gentle ground (the calendar's snow; core/atmos's snow cover lies on the station's own line besides) */
  'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.88,0.92),uSnowS*smoothstep(0.55,0.85,vGWN.y)*smoothstep(0.25,0.6,dt.r*dt2.g+0.25));'+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const LAYERS={
 stripes:[['ground.wadi.cobble','vGL.z',.8,'the wash\'s cobble','vec3(1.0)']],
 bloom:[['ground.playa.red','vGL.z',.75,'the playa\'s crust','_gT']],
 canyon:[['ground.wadi.cobble','vGL.z',.8,'the canyon floor\'s cobble','vec3(1.0)']],
 cliff:[]}[SKEY];
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'painted-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.07,cavity:.7,mesh:1}:null,layers:[
 KGROUND.layer('paintedhighlands','ground.steppe',{w:'vGL.x*0.85',amt:.75,gain:1.0,tint:'_gT*0.62',name:'steppe'}),
 KGROUND.layer('paintedhighlands','ground.clay.popcorn',{w:'vGL.y*0.8',amt:.6,gain:1.0,tint:'_gT*0.7',name:'popcorn clay (tinted by its bed)'}),
 KGROUND.layer('paintedhighlands','rock.sandstone.bedded.red',{w:'vGL.w*0.7',amt:.55,gain:1.0,tint:'_gT*0.7',name:'danxia sandstone (tinted by its bed)'}),
 SKEY==='bloom'?{kind:'polygon',w:'vGL.z',amt:.85,size:1.6,width:.05,edgeTint:'vec3(0.55,0.48,0.42)',warp:.18,rim:0,seed:461,name:'mud cracks (after the melt)'}:null,
 SKEY==='cliff'||SKEY==='canyon'||SKEY==='stripes'?{kind:'clast',w:'gSteep*(1.0-vGL.w)*0.6',amt:.55,proj:'tri',size:.9,matrix:.14,matrixColor:0x8a6e5e,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0xb2452c,0xc8642e,0xd8a050,0x9a7a6a,0xe0d0b8],seed:462,name:'talus'}:null]
 .concat(LAYERS.map(l=>KGROUND.layer('paintedhighlands',l[0],{w:l[1],amt:l[2],gain:1.0,tint:l[4],name:l[3]})))});
const GROUND=(function(){const N=SKEY==='stripes'?760:SKEY==='cliff'?720:640,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),bl=new Float32Array(nx*nx*4),fc=new THREE.Color(),FLC=PAINTED_BLOOM.FLOWERS.map(f=>new THREE.Color(f.col).convertSRGBToLinear());
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];
  /* the drift's colour: the flower its bed favours, in patches (a 24 m lattice's unit); its weight the bloom zone's (60's) */
  const zone=Math.max(FC.at(FC.a.flow,x,z)*.95,FC.at(FC.a.flat,x,z)*.85,(1-smooth(.08,.16,FC.at(FC.a.slope,x,z)))*(1-FC.at(FC.a.bare,x,z))*.3)*(1-FC.at(FC.a.rock,x,z));
  if(zone>.02){const u=clamp((fbm(x*.011,z*.011,7701+SITE.n,2)-.3)*2.5,0,.999),fi=PAINTED_BLOOM.flowerFor(BED_AT(x,y,z),u);fc.copy(FLC[fi]);   /* the bed's flower, varied in soft patches (no lattice) */
   bl[k*4]=fc.r;bl[k*4+1]=fc.g;bl[k*4+2]=fc.b;bl[k*4+3]=zone*.6*(.4+.6*smooth(.35,.65,fbm(x*.02,z*.02,7702,2)));}}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aBl',new THREE.BufferAttribute(bl,4));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
if(SKEY==='stripes'){const u=SITE.scarp.u;REGISTER({name:'The hogback\'s danxia scarp (facing east over the fold\'s core)',x:NRM[0]*u,z:NRM[1]*u,y:L.valley(NRM[0]*u,NRM[1]*u)-10,r:900,h:260,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.cliff))}});
 const w=L.wpts[Math.floor(L.wpts.length/2)];REGISTER({name:'The dry wash down the strike valley (the bloom on its floor)',x:w[0],z:w[1],y:L.floor0(w[0],w[1])-6,r:900,h:30,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.flood))}});
 REGISTER({name:'The banded badland hills (bentonite: slick when wet)',x:NRM[0]*1500,z:NRM[1]*1500,y:SITE.valley.floor-15,r:900,h:110,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.clay))}});}
if(SKEY==='bloom'){const P=SITE.playa;REGISTER({name:'The playa (3,393 m): the bloom flats',x:P.x,z:P.z,y:P.level-3,r:Math.min(P.rx,P.rz),h:12,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.mud))}});
 REGISTER({name:'A pigment pit dug into the bright beds (the Painted Men\'s paint)',x:SITE.pit.x,z:SITE.pit.z,y:terrainH(SITE.pit.x,SITE.pit.z)-2,r:SITE.pit.r+6,h:SITE.pit.depth+8,tags:{zone:'pigment-pit',culture:'painted',landmark:true}});
 SITE.circles.forEach((c,i)=>REGISTER({name:'A stone circle on the playa\'s rim',x:c[0],z:c[1],y:terrainH(c[0],c[1])-2,r:c[2]+3,h:6,tags:{zone:'stone-circle',culture:'painted',landmark:true}}));}
if(SKEY==='canyon'){REGISTER({name:'The Painted Canyon (560 m deep, cut through the whole column)',x:0,z:L.cz(0),y:SITE.canyon.floor-20,r:2600,h:620,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.cliff))}});
 REGISTER({name:'The canyon\'s floor (the flash flood\'s road)',x:0,z:L.cz(0),y:L.fl(0)-8,r:2600,h:20,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.flood))}});}
if(SKEY==='cliff')REGISTER({name:'The cliff town\'s wall (2,224 m of relief: the canyon\'s mouth over Korona\'s moat)',x:0,z:0,y:SITE.foot,r:2600,h:SITE.rim-SITE.foot+40,tags:{hazard:KHAZ.make(Object.assign({},PAINTED_HAZ.cliff))}});
// THE ALCOVES' HOODS (the cliff town's wall): KCARVE's patches meshed on the ground's own material and attributes (swhighlands' cave mouth), so the
// sandstone over each alcove is the wall's own beds; the floor under it is the ground's, folded in (46: CARVE_FOLD)
if(SKEY==='cliff'&&KCARVE.patches.length){const S=TERR.R*2.2,m4=[0,0,0,0],sd=new THREE.Vector3(-900,1100,600).normalize();
 try{KCARVE.mesh(MAT_GROUND,{sun:[sd.x,sd.y,sd.z],ao:true,cast:'hood',gridNormals:true,
  attrs:{uv:{size:2,fn:(x,y,z)=>[x/S+.5,.5-z/S]},aGL:{size:4,fn:(x,y,z)=>{masksAt(x,z,y,m4);return [m4[0],m4[1],m4[2],1];}},aBl:{size:4,fn:()=>[0,0,0,0]},aWet:{size:1,fn:()=>[0]}}})   /* a one-component attribute is still an array to KCARVE (v[0]) */
  .forEach(cm=>{if(KG_RELIEF)KGROUND.cavityMesh(cm);cm.userData.host=true;cm.userData.rock=true;cm.userData.inspectLabel='An alcove\'s hood (danxia sandstone over the seep line)';scene.add(cm);});}
 catch(e){reportErr('alcoves: '+e.stack);}}
