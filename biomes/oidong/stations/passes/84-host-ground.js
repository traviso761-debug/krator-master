// ================================================================= HOST — the ground of the high passes (station 2)
// One ground mesh painted from the fields: buff and grey gravel on the shelf, the darker shattered granite of the knobs and the steeps, the damp brown of
// the hollows and the tarn's margin, a paler worn line for the road. On KGROUND (43-core-ground.js), each on its documented mask (the review's first line):
//   granite  stone.granite on aRock (the rock field: slope, the knobs, the edge's break)
//   PAVEMENT a `clast` kind: small stones packed in the plain, wind-sorted (1 - rock) x (1 - flat): the reg the wind leaves (?pave=0)
//   POLYGONS a `polygon` kind: sorted stone polygons, the frost's patterned ground, on aFlat (the frost hollows' floors: fieldsAt's `flat`) (?polygon=0)
//   TALUS    a `clast` kind in 3D cells on aRock under the steeps: scree blocks a hand to a metre across
//   wet      aWet: the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone.
REGISTER({name:TARN.name,x:TARN.x,z:TARN.z,y:TARN.l-5,r:TARN.r*1.5,h:12});
KNOBS.forEach((K,i)=>REGISTER({name:i?'The east knob (shattered granite)':'The west knob (shattered granite)',x:K.x,z:K.z,y:landH(K.x+K.r,K.z)-5,r:K.r,h:K.h+30}));
REGISTER({name:'The saddle (the pass on the pilgrims\' road)',x:120,z:roadZ(120),y:terrainH(120,roadZ(120))-3,r:160,h:25});
function setStones(){}   /* the valley's raked rings: none up here */
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const GRAV=K(0x8e867a),GRAV2=K(0x7c766c),BUFF=K(0x9c8c74),GRAN=K(0x6c6864),GRAN2=K(0x54514e),DAMP=K(0x5e5446),ROAD=K(0xa89c88),SNOW=K(0xe8ecf2);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,pav=fbm(x/80+5,y/80-2,.7,2),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz),hh=FC.at(FC.a.h,wx,wz);
  c.copy(GRAV).lerp(GRAV2,smooth(.4,.65,pav)*.7).lerp(BUFF,smooth(.55,.75,fbm(x/40-3,y/40+8,.9,2))*.5);
  c.lerp(DAMP,smooth(.35,.7,wet)*.75);
  t.copy(GRAN).lerp(GRAN2,clamp(.4+n*1.6,0,1));c.lerp(t,smooth(.25,.6,rock));
  c.lerp(ROAD,smooth(3.5,1,Math.abs(wz-roadZ(wx)))*.6);
  c.lerp(SNOW,smooth(SITE.base+850,SITE.base+1200,hh)*smooth(.2,.7,pav+.3)*smooth(.35,.62,fbm(x/14,y/14,1.7,3))*(1-smooth(.35,.7,rock)*.85));   /* patchy: drifts in the hollows, rock and scree between */   /* the snow lies on the benches and in the gullies; the steep rock breaks it */
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.97,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aRock;varying float vRock;attribute float aFlat;varying float vFlat;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRock=aRock;vFlat=aFlat;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying float vRock;varying float vFlat;varying float vWet;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 _gP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const KG_PAVE=GQ.get('pave')!=='0',KG_POLY=GQ.get('polygon')!=='0';
// THE RELIEF (KGROUND's opt-in relief, core/terrain/GROUND.md; the ground catch-up 2026-11-04): the layers' height bumps the lit normal near the eye,
// the low of it and the mesh's hollows (aKGAO, KGROUND.cavityMesh on the mesh below) lose sky light. No side planes (tri): ?relief=0 none
const KG_REL=GQ.get('relief')!=='0'?{bump:.075,cavity:.8,mesh:1}:null;
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'oidong-passes-ground'+(KG_PAVE?'p':'')+(KG_POLY?'g':''),at:'/*KGROUND*/',relief:KG_REL,layers:[
 KGROUND.layer('oidong','stone.granite',{w:'vRock',amt:.85,gain:1.0,tint:'_gP*1.6',name:'granite'}),
 KG_PAVE?{kind:'clast',w:'(1.0-vRock)*(1.0-vFlat)*(1.0-vWet)',amt:.5,proj:'xz',size:.07,matrix:.26,matrixColor:0x7a7064,sub:0,fleck:0,jitter:.95,vary:.3,
  palette:[0x4a4642,0x5e5850,0x6e665a,0x3e3a36,0x7a6e5e,0x58524a],seed:331,name:'pavement'}:null,
 KG_POLY?{kind:'polygon',w:'vFlat',amt:.8,size:2.4,width:.07,edgeTint:'vec3(0.4,0.37,0.33)',warp:.16,rim:.06,rimTint:'vec3(0.55,0.52,0.48)',seed:332,name:'sorted polygons'}:null,
 {kind:'clast',w:'vRock*0.85',amt:.75,proj:'tri',size:.8,matrix:.12,matrixColor:0x6e6a66,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x8a8682,0x9a958e,0x726e6a,0xa8a29a,0x807a74],seed:333,name:'talus'}]});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),rk=new Float32Array(nx*nx),fl=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  rk[k]=smooth(.3,.65,FC.at(FC.a.rock,x,z));fl[k]=FC.at(FC.a.flat,x,z);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));g.setAttribute('aFlat',new THREE.BufferAttribute(fl,1));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel='The high passes';if(USE_KG&&KG_REL)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});   /* aKGAO: relief.mesh */scene.add(m);return m;})();
