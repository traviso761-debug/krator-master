// ================================================================= HOST — the ground (PLAN.md sections 6 and 16)
// One ground mesh painted from the fields, on KGROUND (43-core-ground.js) with four library layers, each on its documented mask, and every steep face in
// the flood basalt's own beds (41: SLAB_STRATA through KSTRATA, 35 + host/35 shade: strataColor), tilted with the slab:
//   aGL.x  RUBBLE   rock.rubble.sturzstrom: the apron (the share of the last collapse's rubble, FIELD.apron)
//   aGL.y  STEPPE   ground.steppe: the bench's dry ground off the apron (141 mm, Dsc)
//   aGL.z  SEEP     ground.reedbed: the spring line's wet ground and the brook's banks
//   aGL.w  LICHEN   ground.lichen.crust: the slab's old surface behind the rim, and the bench's bare patches
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
/* the beds: the slab's 2 km of flows over the bench (3.3 km) to its crest (5.4 km); they rise north 0.123 a metre (the ramp's 7 degrees south) */
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4130+SITE.station,recipe:'slab-floodbasalt',range:[SITE.base-600,SITE.slab.crest+200],
 dip:[0,-1,SITE.slab.dip],warp:[6,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:0x8a7e70}):null;
function masksAt(x,z,h,out){const wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z),ap=FC.at(FC.a.rim,x,z),behind=z-L.rimZ(x);
 const rub=clamp(ap*1.2,0,1)*(1-smooth(.6,.85,rock)*.5);
 const seep=clamp(smooth(.45,.75,wet)*(1-rub*.6),0,1);
 const lich=clamp(Math.max(smooth(0,120,behind),.6*smooth(.55,.75,fbm(x*.004,z*.004,81,2))*(1-ap))*(1-seep),0,1);
 const step=clamp((1-ap)*(1-smooth(-40,60,behind))*(1-seep)*(1-rock*.8),0,1);
 out[0]=rub;out[1]=step;out[2]=seep;out[3]=lich;return out;}
// THE PAINT: the macro colour under the layers
const PAINT={base:0x8e8264,dry:0x9e9070,rub:0x5a524c,lich:0x7a7670,seep:0x5e6e42,snow:0xe8ecf2,rock:0x4a4440};
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),RUB=K(PAINT.rub),LICH=K(PAINT.lich),SEEP=K(PAINT.seep),SNOW=K(PAINT.snow),ROCK=K(PAINT.rock);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.4,.15,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,.9,2)));
  c.lerp(RUB,m[0]*.85).lerp(LICH,m[3]*.55).lerp(SEEP,m[2]*.8);
  c.lerp(ROCK,smooth(.55,.8,rock)*.55);
  c.lerp(SNOW,smooth(SITE.snow[0],SITE.snow[1],hh)*smooth(.25,.7,fbm(x/14,y/14,1.7,3))*(1-smooth(.6,.85,rock)*.85));
  const k=1+n*.1;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.92);':'')+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'slabfields-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.08,cavity:.8,mesh:1}:null,layers:[
 KGROUND.layer('slabfields','rock.rubble.sturzstrom',{w:'vGL.x',amt:.9,gain:1.0,tint:'vec3(1.0)',name:'the apron\'s rubble'}),
 KGROUND.layer('slabfields','ground.steppe',{w:'vGL.y',amt:.75,gain:1.0,tint:'_gT',name:'the bench\'s steppe'}),
 KGROUND.layer('slabfields','ground.reedbed',{w:'vGL.z',amt:.85,gain:1.0,tint:'vec3(1.0)',name:'the spring line'}),
 KGROUND.layer('slabfields','ground.lichen.crust',{w:'vGL.w',amt:.7,gain:1.0,tint:'vec3(1.0)',name:'lichen crust'}),
 {kind:'clast',w:'gSteep*0.85',amt:.7,proj:'tri',size:1.1,matrix:.12,matrixColor:0x4e4844,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x4a4440,0x5a524c,0x3e3a36,0x6a5a50,0x7a4a3a],seed:513,name:'talus'}]});
const GROUND=(function(){const N=640,S=TERR.R*2.2,cs=S/N,nx=N+1,m4=[0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=landH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// the places, as records the inspector and the export read; the hazards on them (core/hazard reads the tags; PLAN.md section 11)
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
{const SL=SITE.slab,zr=L.rimZ(0);
 REGISTER({name:'The Anvil\'s cliff (2 km of flood basalt; its crest 5,356 m, 0.82 atm)',x:0,z:zr-SL.run*.5,y:SITE.base-20,r:1400,h:SL.h+260,
  tags:{hazard:{kind:'fall',danger:1,tell:{sign:'the edge: a sheer drop of two kilometres'}}}});
 /* the rockfall belt: the talus under the face, in 500 m lengths (one volume a length, so the inspector names the one you stand in) */
 for(let x=-2500;x<=2500;x+=500){const zf=L.footZ(x)-SL.talus.reach*.4,lo=Math.min(landH(x,zf),landH(x,L.footZ(x)-SL.talus.reach));   /* from the skirt's low end up the face */
  REGISTER({name:'Rockfall under the Anvil\'s face (fresh scree; blocks fall at dawn as the face warms)',x,z:zf,y:lo-40,r:260,h:520,
  tags:{hazard:{kind:'crush',danger:.6,falloff:'smooth',tell:{sign:'fresh scree, pale scars on the face, the crack of a block at sunrise'}}}});}
 REGISTER({name:'The Anvil\'s apron (the last collapse: crushed basalt, '+Math.round(SITE.apron.run/1000*10)/10+' km from the foot)',x:SITE.apron.x0,z:L.footZ(0)-SITE.apron.run*.5,y:SITE.base-10,r:2200,h:SITE.apron.foot+80});
 L.SEEPS.forEach((s,i)=>REGISTER({name:'A seep on the spring line (cold water through the rubble; reed round it)',x:s.x,z:s.z,y:s.level-3,r:s.r*2.4,h:8}));
 /* the gas: CO2 off the faults settling into the toe's hollows and under the blocks on still nights; pooled (core/hazard 21: shape.pool) */
 L.SEEPS.slice(0,SITE.gas.hollows).forEach((s,i)=>REGISTER({name:'A hollow at the spring line where CO2 settles on still nights',x:s.x,z:s.z,y:s.level-2,r:s.r*2,h:5,
  tags:{hazard:{kind:'gas',danger:.5,falloff:'none',shape:{type:'cyl',r:s.r*2,h:3,pool:1.5},tell:{sign:'dead birds and no dew on the floor at dawn'}}}}));}
