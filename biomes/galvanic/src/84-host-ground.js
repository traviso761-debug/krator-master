// ================================================================= HOST — the ground (PLAN.md section 6; taken from biomes/highrift's, the masks the strand's own)
// One ground mesh painted from the fields, on KGROUND (43-core-ground.js) with five library layers (the 16-unit limit), each on its documented mask, and
// the mounds' and the hills' steep faces in the rift fill's beds (KSTRATA's `rift` suite, 35 + host/35 shade: strataColor):
//   aGL.x  MUD       ground.brown_mud_02: the strand's sulfide mud (a stand-in for the owed ground.sulfide.oxidised: KNOWN_ISSUES.md)
//   aGL.y  TERRACES  ground.rust.terrace: the streams' iron terraces (GALV_PHYS.stream: where the pH crosses 2.8) and the mounds' acid moats
//   aGL.z  GOSSAN    rock.gossan: the mounds' iron caps
//   aGL.w  VITRIOL   ground.efflorescence: the zinc and copper sulfates blooming on the dry strand above the flood line
//   aSalt  SALT      ground.salt: the flooded strand's crust (the sea lies on it part of the year)
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4402,recipe:'rift',range:[SITE.sea-120,SITE.sea+260],dip:[.2,.97,.06],warp:[6,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x8a5a3e}):null;
function setStones(){}
// the masks at a point: [mud, terraces, gossan, vitriol] and the salt (out[4]); read from the baked fields and the site's own shapes
function masksAt(x,z,h,out){const acid=FC.at(FC.a.acid,x,z),fl=FC.at(FC.a.flood,x,z),up=FC.at(FC.a.upland,x,z),wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z);
 let gos=0;for(const M of MOUNDS){const d=Math.hypot(x-M.x,z-M.z)/M.r;gos=Math.max(gos,smooth(1.1,.85,d));}
 {const d=Math.hypot(x-DP.x,z-DP.z)/DP.r;gos=Math.max(gos,.6*smooth(1.2,1.02,d)*smooth(.88,.98,d));}   /* the Deep's rim: mound rubble */
 let ter=0;for(const S of STREAMS){const q=S.F.at(x,z);if(q.d>26)continue;const t=S.tread(q.s);if(t)ter=Math.max(ter,smooth(t.w/2+14,t.w/2+3,q.d));else if(q.s>S.sT*.7)ter=Math.max(ter,.5*smooth(S.w+8,S.w/2,q.d));}
 for(const M of MOUNDS){const d=Math.hypot(x-M.x,z-M.z)/M.r;ter=Math.max(ter,.8*smooth(1.6,1.15,d)*smooth(.95,1.12,d));}
 const strand=1-up;
 /* the vitriols bloom in patches on the driest ground (old beach ridges, the mounds' skirts), not over the whole strand */
 const vit=clamp(strand*(1-smooth(0,.06,fl))*smooth(.5,.3,wet)*smooth(.15,.45,acid)*(1-gos)*(1-ter)*smooth(.56,.68,fbm(x*.006,z*.006,4.4,3)),0,1);
 const salt=clamp(strand*smooth(.08,.3,fl)*(1-gos)*(1-ter),0,1);
 out[0]=clamp(strand*(1-gos)*(1-.5*ter),0,1);out[1]=clamp(ter*(1-gos),0,1);out[2]=clamp(gos*(1-.4*rock),0,1);out[3]=vit;out[4]=salt;return out;}
// THE PAINT: the macro colour under the layers: rusted mud, the vitriol's white, the salt, the ochre terraces, the gossan's red, the hills' red soil and grass
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0,0];
 const MUD=K(0x4a4038),RUST=K(0x7e4626),OCHRE=K(0xb8642a),GOS=K(0x8a3a1c),VIT=K(0xdcd8cc),BLUE=K(0x9ab8c4),SALT=K(0xd2cabc),SOIL=K(0x8a5a3e),GRASS=K(0x7a7040),ROCK=K(0x6e5444);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),up=FC.at(FC.a.upland,wx,wz),acid=FC.at(FC.a.acid,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(MUD).lerp(RUST,.55*acid*smooth(.35,.7,fbm(x/40,y/40,.9,2)));
  c.lerp(SALT,m[4]*.6).lerp(VIT,m[3]*.6*smooth(.45,.7,fbm(x/14,y/14,2.1,2))).lerp(BLUE,m[3]*.35*smooth(.72,.8,fbm(x/9,y/9,4.2,2)));
  c.lerp(OCHRE,m[1]*.85).lerp(GOS,m[2]*.85);
  c.lerp(SOIL,up).lerp(GRASS,up*.55*smooth(.35,.65,fbm(x/50,y/50,3.3,2))*(1-acid));
  c.lerp(ROCK,smooth(.3,.65,rock)*.5);
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.92,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aSalt;varying float vSalt;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vSalt=aSalt;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vSalt;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*(1.0-vGL.z)*0.85);':'')+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.6,0.56,0.52),vWet);}');
 if(USE_KG)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.35,vWet);');};
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'galvanic-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.07,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('galvanic','ground.brown_mud_02',{w:'vGL.x*0.85',amt:.8,gain:1.0,tint:'_gT*vec3(0.5,0.46,0.42)',name:'the strand\'s sulfide mud (stand-in, tinted dark)'}),
 KGROUND.layer('galvanic','ground.rust.terrace',{w:'vGL.y',amt:.9,gain:1.05,tint:'vec3(1.0)',name:'the iron terraces'}),
 KGROUND.layer('galvanic','rock.gossan',{w:'vGL.z',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'gossan'}),
 KGROUND.layer('galvanic','ground.efflorescence',{w:'vGL.w',amt:.7,gain:1.0,tint:'vec3(1.0)',name:'the vitriol bloom'}),
 KGROUND.layer('galvanic','ground.salt',{w:'vSalt',amt:.7,gain:1.0,tint:'_gT',name:'the flooded strand\'s salt'})]});
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1,m5=[0,0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),salt=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m5);gl[k*4]=m5[0];gl[k*4+1]=m5[1];gl[k*4+2]=m5[2];gl[k*4+3]=m5[3];salt[k]=m5[4];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aSalt',new THREE.BufferAttribute(salt,1));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
