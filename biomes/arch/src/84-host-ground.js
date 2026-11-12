// ================================================================= HOST — the ground (PLAN.md section 6)
// One ground mesh painted from the chemistry and the heat (45: L.APRON, L.ACIDG; 48: HEAT_AT), on KGROUND (43-core-ground.js) with four library layers,
// each on its documented mask, and every steep face in the band's own rock (KSTRATA: two recipes the kit adds, `arch-serpentinite` under
// `arch-laterite`). Started from biomes/highrift's ground.
//   aGL.x  TRAVERTINE  ground.travertine.white: the springs' aprons, the terraces' ridges, the pool's rim, the alkaline bank (pH over 9.5)
//   aGL.y  ACID        ground.travertine.acid: the acid stream's banks, the solfatara's bleached ground, the right bank and the mixed water's
//   aGL.z  LATERITE    ground.redsoil: the red earth over the serpentinite everywhere else (the maquis's floor)
//   aGL.w  SULPHUR     ground.sulphur: the solfatara's core (KTHERM over ~55 degC)
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
/* KGROUND's relief (core/terrain/GROUND.md): the bump from the layers' height and the ground mesh's hollows (KGROUND.cavityMesh); ?kgrelief=0 */
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
/* THE BAND'S ROCK (PLAN.md section 6): serpentinite (green-black, white veins, buff peridotite rind, dunite) under the laterite (red, mottled, a green
   garnierite seam at its base, an iron crust); KSTRATA.add puts the two recipes in the table for this page (core is unchanged: PLAN.md section 13) */
if(typeof KSTRATA!=='undefined'&&KSTRATA.add){
 KSTRATA.add({name:'arch-serpentinite',main:'serp',kinds:{
  serp:{p:.55,th:[2,12],col:[0x1e2a22,0x2c3a2e,0x3e5040,0x2a3428],hard:.7,xbed:0,varnish:0},
  rind:{p:.15,th:[.5,3],col:[0xa07040,0xb8864e,0x8a6438],hard:.5,xbed:0,varnish:0},
  dunite:{p:.18,th:[1,5],col:[0x4a5a32,0x3a4628,0x56663a],hard:.75,xbed:0,varnish:0},
  vein:{p:.12,th:[.05,.35],col:[0xe8e6dc,0xdcd8cc],hard:.6,xbed:0,varnish:0,between:true}},fx:{}});
 KSTRATA.add({name:'arch-laterite',main:'red',kinds:{
  red:{p:.58,th:[1,4],col:[0x9a3a1e,0xa84426,0x8a321a],hard:.3,xbed:0,varnish:0},
  mottled:{p:.2,th:[.5,2],col:[0xb86a3a,0xc87a48,0xa45e32],hard:.25,xbed:0,varnish:0},
  garnierite:{p:.08,th:[.2,.8],col:[0x6a9a6a,0x5a8a5a],hard:.3,xbed:0,varnish:0,between:true},
  crust:{p:.14,th:[.3,1.2],col:[0x5a2414,0x6a2c18],hard:.8,xbed:0,varnish:0}},fx:{}});}
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4300,range:[SITE.base-400,SITE.base+600],
 formations:[{recipe:'arch-serpentinite',base:SITE.base-400,top:SITE.base-12},{recipe:'arch-laterite',base:SITE.base-12,top:SITE.base+600}],dip:[.7,.7,.02],warp:[6,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x8a5a3a}):null;
function setStones(){}
const MIRROR_AT=(x,z)=>0;
function masksAt(x,z,h,out){const T=HEAT_AT(x,z),rock=FC.at(FC.a.rock,x,z),ap=L.APRON?L.APRON(x,z):0,ac=L.ACIDG?L.ACIDG(x,z):0;
 const trav=clamp(ap*(1-.5*rock),0,1),acid=clamp(ac*(1-trav)*(1-.4*rock),0,1),sul=clamp(smooth(50,70,T)*(1-trav),0,1);
 out[0]=trav;out[1]=Math.max(acid,sul*.5);out[2]=clamp((1-trav)*(1-acid)*(1-sul)*(1-.7*rock),0,1);out[3]=sul;return out;}
// THE PAINT: the macro colour under the layers: red laterite and the maquis's dark green over it, the serpentinite's green-black on the steeps
const PAINT={base:0x9a4a2a,dry:0xa85a34};
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),SCRUB=K(0x3e5232),TRAV=K(0xe8ece6),ACID=K(0xc8843a),SUL=K(0xd8cc58),ROCK=K(0x2e3a30);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.5,.25,wet)*.5+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(SCRUB,m[2]*(.35+.4*smooth(.35,.65,fbm(x/9,y/9,1.3,2))));   /* the maquis's patchy dark green over the red */
  c.lerp(ROCK,smooth(.3,.65,rock)*.7);
  if(L.SHEAR)c.lerp(K(0x8a9a6a),L.SHEAR(wx,wz)*.55*smooth(.3,.7,fbm(x/7,y/7,4.1,2)));   /* the shear zone: scaly green rock with pale chrysotile */
  c.lerp(TRAV,m[0]*.9);c.lerp(ACID,m[1]*.75);c.lerp(SUL,m[3]*.7);
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
    'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'arch-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('arch','ground.travertine.white',{w:'vGL.x',amt:.9,gain:1.05,tint:'vec3(1.0)',name:'travertine (the alkaline aprons)'}),
 KGROUND.layer('arch','ground.travertine.acid',{w:'vGL.y',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'acid crust'}),
 KGROUND.layer('arch','ground.redsoil',{w:'vGL.z',amt:.75,gain:1.0,tint:'_gT',name:'laterite (red earth)'}),
 KGROUND.layer('arch','ground.sulphur',{w:'vGL.w',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'sulphur'})]});
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
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
if(SKEY==='confluence'){const S=SITE;
 REGISTER({name:'The dome\'s foot (serpentinite, a core complex: bare mantle under red laterite)',x:-1300,z:-1300,y:terrainH(-1300,-1300)-30,r:900,h:200});
 REGISTER({name:'The graben\'s edge fault (30 m: serpentinite under laterite)',x:1300*S2+600,z:1300*S2-600,y:terrainH(1500,1100)-10,r:500,h:60});
 S.springs.forEach((sp,i)=>REGISTER({name:'Type II spring '+(i+1)+' (Ca-OH, pH ~11.5, hydrogen; '+sp.flow+' L/s)',x:sp.x,z:sp.z,y:terrainH(sp.x,sp.z)-4,r:sp.r+4,h:10}));
 REGISTER({name:'The alkaline pool (milky turquoise, pH ~11) and its white rim',x:S.pool.x,z:S.pool.z,y:L.POOL_LV-4,r:S.pool.r+14,h:8});
 L.TER.forEach((T,i)=>REGISTER({name:'Travertine terraces from spring '+(i+1)+' ('+T.levels.length+' treads)',x:(T.F.A[0]+T.F.B[0])/2,z:(T.F.A[1]+T.F.B[1])/2,y:T.levels[T.levels.length-1]-5,r:T.F.L/2,h:T.levels[0]-T.levels[T.levels.length-1]+12}));
REGISTER({name:'The meet: alkaline (pH '+L.MEET.alk.pH.toFixed(1)+') against acid (pH '+L.MEET.acid.pH.toFixed(1)+'): '+ARCH.gradient(L.MEET.alk.pH,L.MEET.acid.pH,30).toFixed(0)+' mV',x:S.meet.x,z:S.meet.z,y:terrainH(S.meet.x,S.meet.z)-4,r:40,h:12});}
if(SKEY==='dome'){const S=SITE;
 REGISTER({name:'The dome (a core complex: mantle pulled up along a detachment, corrugated along the opening direction)',x:0,z:0,y:terrainH(0,0)-60,r:1500,h:200});
 S.springs.forEach((sp,i)=>REGISTER({name:'Type II spring '+(i+1)+' at a trough\'s head (Ca-OH, pH ~11.5, hydrogen; '+sp.flow+' L/s)',x:sp.x,z:sp.z,y:terrainH(sp.x,sp.z)-4,r:sp.r+14,h:10}));
 L.TER.forEach((T,i)=>REGISTER({name:'Travertine terraces down trough '+(i+1)+' ('+T.levels.length+' treads)',x:(T.F.A[0]+T.F.B[0])/2,z:(T.F.A[1]+T.F.B[1])/2,y:T.levels[T.levels.length-1]-5,r:T.F.L/2,h:T.levels[0]-T.levels[T.levels.length-1]+12}));}
