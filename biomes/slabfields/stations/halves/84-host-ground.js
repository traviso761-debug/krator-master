// ================================================================= HOST — the ground: station 3, the Halves (station 2's; PLAN.md sections 6 and 16)
// One ground mesh painted from the fields, on KGROUND (43-core-ground.js) with four library layers, each on its documented mask, and every steep face in
// the flood basalt's own beds (41: SLAB_STRATA through KSTRATA, 35 + host/35 shade: strataColor), tilted with the slab:
//   aGL.x  RUBBLE   rock.rubble.sturzstrom: the south-east half's apron (FIELD.apron)
//   aGL.y  STEPPE   ground.steppe: the bench's dry ground (173 mm, Dsc)
//   aGL.z  SEEP     ground.reedbed: the pool's shore, the warm springs, the pits' seeps
//   aGL.w  LICHEN   ground.lichen.crust: the halves' old surfaces behind their rims, the bench's bare patches
// The paint carries what the library has no layer for here (KNOWN_ISSUES.md): the patera floor's old lava crust, the shore's pale marl, the travertine
// and sulfur round the warm springs, the pits' dark damp floors
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
/* the beds: the halves' 1.4-1.6 km of flows over the bench (3.3 km) to their crests (4.7-4.9 km); they rise north 0.16 a metre (the ramps' 9.1 degrees south) */
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4130+SITE.station,recipe:'slab-floodbasalt',range:[SITE.base-600,SITE.halves[0].crest+200],
 dip:[0,-1,SITE.halves[0].dip],warp:[22,7]});   /* warped: the flows thicken and pinch along the face, not ruled lines */
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x8a7e70}):null;
function freshAt(x,z){return 0;}   /* no fresh scar on the halves' faces in view */
const onHalf=(x,z)=>smooth(20,80,L.slabbed(x,z)-L.bench(x,z));   /* a half's body (its cliff, its plateau) */
function masksAt(x,z,h,out){const wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z),ap=FC.at(FC.a.rim,x,z),hb=onHalf(x,z);
 const rub=clamp(ap*1.2,0,1)*(1-smooth(.6,.85,rock)*.5);
 const seep=clamp(smooth(.45,.75,wet)*(1-rub*.6),0,1);
 const lich=clamp(Math.max(hb*(1-rock*.6),.6*smooth(.55,.75,fbm(x*.004,z*.004,81,2))*(1-ap))*(1-seep),0,1);
 const step=clamp((1-ap)*(1-hb)*(1-seep)*(1-rock*.8),0,1);
 marksAt(x,z,h,MKM);const bare=clamp(Math.max(MKM.marl,MKM.crust,MKM.trav,MKM.pit),0,1);
 out[0]=rub;out[1]=step*(1-bare);out[2]=seep*(1-MKM.trav*.6);out[3]=lich*(1-bare);return out;}
const MKM={};
// THE PAINT: the macro colour under the layers
const PAINT={base:0x8e8264,dry:0x9e9070,rub:0x5a524c,lich:0x7a7670,seep:0x5e6e42,snow:0xe8ecf2,rock:0x4a4440,
 marl:0xc4bca6,crust:0x4a4642,trav:0xe4dccb,sulfur:0xd8c040,pit:0x3e3c38};
/* THE FLOOR'S MARKS (0..1 each): crust the patera floor's old lava crust, marl the shore's pale band (a metre and a half over the water), trav and sulfur
   round a warm spring, pit a pit's dark damp floor */
function marksAt(x,z,y,o){o.marl=0;o.crust=0;o.trav=0;o.sulfur=0;o.pit=0;
 const PT=SITE.patera,r=L.pr(x,z);
 if(r<PT.r){const a=KRELIEF.at(L.P,x,z);if(a&&a.part==='floor'){o.crust=smooth(PT.level+.8,PT.level+2.5,y)*(.75+.25*smooth(.4,.7,fbm(x*.01,z*.01,83,2)));o.marl=smooth(PT.level-.2,PT.level+.2,y)*smooth(PT.level+2.5,PT.level+1,y);}}
 for(const q of L.SPRINGS){if(q.pit!=null)continue;const d=Math.hypot(x-q.x,z-q.z);if(d>q.r*5)continue;o.trav=Math.max(o.trav,smooth(q.r*4.5,q.r*1.2,d)*(q.dead?.5:1));
  o.sulfur=Math.max(o.sulfur,smooth(q.r*1.9,q.r*.9,d)*smooth(q.r*.5,q.r*.9,d)*.6);}
 for(const p of L.PITS){const d=Math.hypot(x-p.c[0],z-p.c[1]);if(d<p.r){const a=KRELIEF.at(p.R,x,z);if(a&&a.part==='floor')o.pit=.85;}}
 return o;}
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const MK={},MARL=K(PAINT.marl),CRUST=K(PAINT.crust),TRAV=K(PAINT.trav),SULF=K(PAINT.sulfur),PITC=K(PAINT.pit);
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),RUB=K(PAINT.rub),LICH=K(PAINT.lich),SEEP=K(PAINT.seep),SNOW=K(PAINT.snow),ROCK=K(PAINT.rock);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.4,.15,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(RUB,m[0]*.85).lerp(LICH,m[3]*.55).lerp(SEEP,m[2]*.8);
  c.lerp(ROCK,smooth(.55,.8,rock)*.55);
  c.lerp(SNOW,smooth(SITE.snow[0],SITE.snow[1],hh)*smooth(.25,.7,fbm(x/14,y/14,1.7,3))*(1-smooth(.6,.85,rock)*.85));
  marksAt(wx,wz,hh,MK);c.lerp(CRUST,MK.crust*.7).lerp(MARL,MK.marl*.7).lerp(PITC,MK.pit*.6).lerp(TRAV,MK.trav*.85).lerp(SULF,MK.sulfur*.75);
  const k=1+n*.1;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;attribute float aFr;varying float vFr;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;vFr=aFr;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;varying float vFr;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.92);':'')+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.42,1.38,1.32)+vec3(0.05,0.045,0.04),vFr);'+   /* the scar: fresh rock, paler and unweathered */
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'slabfields-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.08,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('slabfields','rock.rubble.sturzstrom',{w:'vGL.x',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'the apron\'s rubble'}),
 KGROUND.layer('slabfields','ground.steppe',{w:'vGL.y',amt:.75,gain:1.0,tint:'_gT',name:'the bench\'s steppe'}),
 KGROUND.layer('slabfields','ground.reedbed',{w:'vGL.z',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'the spring line'}),
 KGROUND.layer('slabfields','ground.lichen.crust',{w:'vGL.w',amt:.7,gain:1.0,tint:'vec3(1.0)',name:'lichen crust'}),
 {kind:'clast',w:'gSteep*0.85',amt:.7,proj:'tri',size:1.1,matrix:.12,matrixColor:0x4e4844,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x4a4440,0x5a524c,0x3e3a36,0x6a5a50,0x7a4a3a],seed:513,name:'talus'}]});
const GROUND=(function(){const N=640,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),fr=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=landH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];fr[k]=freshAt(x,z);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));g.setAttribute('aFr',new THREE.BufferAttribute(fr,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read; the hazards on them (core/hazard reads the tags; PLAN.md section 11)
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
{const SE=SITE.halves[0],NW=SITE.halves[1],PT=SITE.patera;
 REGISTER({name:'The south-east half\'s north cliff (1.5 km of flood basalt; its crest 4,875 m, 0.87 atm)',x:2400,z:2200-SE.run*.5,y:SITE.base-20,r:1200,h:SE.h+220,
  tags:{hazard:{kind:'fall',danger:1,tell:{sign:'the edge: a sheer drop of a kilometre and a half'}}}});
 REGISTER({name:'The south-east half\'s torn west end (the split: its twin is 42 km up the fault)',x:650,z:2700,y:SITE.base-20,r:500,h:SE.h+220,ground:true,
  tags:{hazard:{kind:'fall',danger:1,tell:{sign:'the edge'}}}});
 REGISTER({name:'The north-west half (crest 4,674 m): its torn east end faces back across the patera',x:-1000,z:-10000,y:NW.base-20,r:3000,h:NW.h+220,far:true});
 for(let x=1300;x<=2700;x+=350){const zf=L.seFootZ(x)-SE.talus.reach*.4,lo=Math.min(landH(x,zf),landH(x,L.seFootZ(x)-SE.talus.reach));
  REGISTER({name:'Rockfall under the south-east half\'s face (fresh scree; blocks fall at dawn as the face warms)',x,z:zf,y:lo-40,r:200,h:460,
   tags:{hazard:{kind:'crush',danger:.6,falloff:'smooth',tell:{sign:'fresh scree, pale scars on the face, the crack of a block at sunrise'}}}});}
 const A=SE.apron;REGISTER({name:'The south-east half\'s apron (crushed basalt run out toward the patera)',x:A.c[0],z:A.c[1],y:SITE.base-10,r:A.r[0],h:A.foot+80});
 REGISTER({name:'The patera\'s wall (three steps down 200 m to the floor)',x:-1200,z:850,y:PT.floor-5,r:700,h:240,
  tags:{hazard:{kind:'fall',danger:.9,tell:{sign:'the bench ends at an edge; the pool below'}}}});
 REGISTER({name:'The patera\'s floor (the old lava lake\'s crust, cracked into plates)',x:0,z:-500,y:PT.level-2,r:900,h:18});
 L.PITS.forEach((p,i)=>{REGISTER({name:'A pit of the chain along the split fault ('+Math.round(p.r*2)+' m across, '+p.depth+' m deep)',x:p.c[0],z:p.c[1],y:p.fl-4,r:p.r,h:p.depth+20,ground:true,
   tags:{hazard:{kind:'fall',danger:1,tell:{sign:'a round hole in the bench, its far wall in shadow'}}}});
  REGISTER({name:'CO2 pooled on a pit\'s floor (it fills on still nights and lingers into the day)',x:p.c[0],z:p.c[1],y:p.fl-2,r:p.r*.8,h:8,ground:true,
   tags:{hazard:{kind:'gas',danger:.85,falloff:'none',shape:{type:'cyl',r:p.r*.8,h:5,pool:4},tell:{sign:'no lichen on the floor\'s stones, a dead bird by the seep'}}}});});
 L.SPRINGS.forEach(q=>{if(q.pit!=null){REGISTER({name:'A seep at a pit\'s floor (cold water off the split fault)',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.4,h:6,ground:true});return;}
  REGISTER({name:'A warm spring on the pool\'s shore ('+Math.round(q.temp)+' degC; CO2)',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.4,h:6,ground:true});});
 L.SPRINGS.filter(q=>q.pit==null&&!q.dead).slice(0,SITE.gas.springs).forEach(q=>REGISTER({name:'A spring\'s hollow where CO2 settles on still nights',x:q.x,z:q.z,y:q.y0-2,r:q.r*2.5,h:5,ground:true,
  tags:{hazard:{kind:'gas',danger:.5,falloff:'none',shape:{type:'cyl',r:q.r*2.5,h:3,pool:1.5},tell:{sign:'dead birds and no dew by the pool at dawn'}}}}));}
