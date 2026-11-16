// ================================================================= HOST — the ground (PLAN.md sections 3 and 6)
// One ground mesh painted from the fields and the heat, on KGROUND (43-core-ground.js) with at most five library layers a station (the 16-unit limit),
// each on its documented mask, every steep face in the flood basalt's beds (KSTRATA's `rift-volcanic`: basalt flows, ash, scoria; the terraces' risers in `loess`):
//   aGL.x  ROCK       the station's rock: column tops (rock.basalt.polygonal) on the plateaus and the rims; loess (rock.loess) on the terraces' risers
//   aGL.y  RUBBLE     breccia and scree (rock.basalt.vesicular): the talus, the fans, the knife-edge's blocks; the braided bed's cobble (ground.wadi.cobble)
//   aGL.z  STATION    the fields (ground.terrace.field), the felt (cloth.felt: a stand-in), the snow (ground.snow.drift), the lichen (ground.lichen.crust)
//   aGL.w  COVER      the turf and gravel of the cold ground (ground.tundra); the hot ground's sinter (ground.sinter) on station 3
//   aWet   the water's wet band (89z)
// The ground mesh is a regular lattice, but on the Arete its rows crowd toward the knife-edge (a sinh warp: ~1 m rows on the edge, ~25 m at the page's
// edge), so the 6 m bridge is drawn from the KFIELD inset that holds it. ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:9840+SITE.zone,recipe:SKEY==='terraces'?'loess':'rift-volcanic',range:[SITE.base-1200,SITE.base+2200],
 dip:[.05,1,.02],warp:[6,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='terraces'?0xb8a888:0x6e6660}):null;
// THE FIELDS (station 1): FIELD_OF (80-host-plan.js), each tread's field and its crop, or null
function masksAt(x,z,h,out){const T=HEAT_AT(x,z),rock=FC.at(FC.a.rock,x,z),sl=SLOPE_AT(x,z),fl=1-smooth(.06,.22,sl);
 let a=0,b=0,c=0,d=clamp(1-rock*.85,0,1);
 if(SKEY==='terraces'){const q=Math.abs(z-L.zc(x)),bed=smooth(SITE.chan.w+16,SITE.chan.w-4,q);const f=FIELD_OF(x,z);
  a=smooth(.18,.4,sl)*(1-bed);b=bed;c=f&&f.crop?1-bed:0;d=(1-bed)*(1-c)*(1-a*.7);}
 else if(SKEY==='scarp'){const dr=L.dRim(x,z),pl=smooth(-20,-120,dr)+smooth(SITE.wall.run+80,SITE.wall.run+300,dr);
  a=smooth(.35,.7,sl)*.6+pl*.35;b=smooth(.2,.42,sl)*(1-smooth(.6,.8,sl));c=pl*fl*.5;d=(1-a)*(1-b);}
 else if(SKEY==='pitfloor'){const deck=FC.at(FC.a.deck,x,z),hot=smooth(40,60,T);
  a=smooth(-10,-60,Math.hypot(x,z)-SITE.maar.r)*fl;b=smooth(.12,.3,sl)*(1-smooth(.75,.9,sl));c=deck*fl*(1-hot)*(1-b);d=Math.max(hot,smooth(28,48,T)*.6)*deck;}
 else{const edge=smooth(.4,.75,sl);a=fl*(1-smooth(-30,-6,-Math.abs(h-SITE.base)*0));b=smooth(.15,.4,sl)*(1-edge*.5);c=fl*smooth(.3,.7,KRAND.fbm(x*.01,.4,z*.01,2,9846));d=(1-b)*(1-c)*.6;}
 out[0]=clamp(a,0,1);out[1]=clamp(b,0,1);out[2]=clamp(c,0,1);out[3]=clamp(d,0,1);return out;}
// THE PAINT: the macro colour under the layers
const PAINT={terraces:{base:0x6e8448,dry:0x8a8a58},scarp:{base:0x5e5a56,dry:0x7a7468},pitfloor:{base:0x5a6238,dry:0x6e6a46},arete:{base:0x56545a,dry:0x6a6870}}[SKEY];
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),dd=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),ROCK=K(SKEY==='terraces'?0xa89a78:0x3e3a3a),RUB=K(SKEY==='terraces'?0x8a8478:0x4a4644),SNOW=K(0xe6eaf0),SIN=K(0xd8d4c4),FELT=K(0x7e8a4a),LICH=K(0xc8783a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=KRAND.fbm(x/24,.5,y/24,2,9843)-.5,hh=FC.at(FC.a.h,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.45,.2,wet)*.6+.2*smooth(.4,.7,KRAND.fbm(x/60,.5,y/60,2,9844)));
  c.lerp(ROCK,m[0]*.7).lerp(RUB,m[1]*.7);
  if(SKEY==='terraces'){const f=FIELD_OF(wx,wz);if(f&&f.crop)c.lerp(K(f.paint),.9*m[2]);}
  if(SKEY==='pitfloor'){c.lerp(FELT,m[2]*.8);c.lerp(SIN,m[3]*.8);}
  if(SKEY==='scarp'||SKEY==='arete')c.lerp(LICH,m[2]*.25*smooth(.5,.75,KRAND.fbm(x/14,.5,y/14,2,9845)));
  c.lerp(SNOW,smooth(SITE.snow[0],SITE.snow[1],hh)*smooth(.25,.65,KRAND.fbm(x/14,.5,y/14,3,9847))*(1-m[0]*.6)+(SKEY==='arete'?.35*m[2]:0));
  const k=1+n*.08;dd[i]=clamp(c.r*255*k,0,255);dd[i+1]=clamp(c.g*255*k,0,255);dd[i+2]=clamp(c.b*255*k,0,255);dd[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),dd=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,.5,y/9,2,9848)-.5)*32+(KRAND.h3(x,y,9,9849)-.5)*20;dd[i]=dd[i+1]=dd[i+2]=clamp(v,0,255);dd[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.12;'+
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.9);':'')+
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const LAYERS={
 terraces:[['rock.loess','vGL.x',.75,'loess (the risers)'],['ground.wadi.cobble','vGL.y',.9,'the braided bed\'s cobble'],['ground.terrace.field','vGL.z',.85,'the fields'],['ground.tundra','vGL.w*0.7',.55,'turf']],
 scarp:[['rock.basalt.polygonal','vGL.x',.8,'column tops'],['rock.basalt.vesicular','vGL.y',.8,'scree and breccia'],['ground.lichen.crust','vGL.z',.6,'lichen'],['ground.tundra','vGL.w*0.8',.6,'tundra']],
 pitfloor:[['rock.basalt.polygonal','vGL.x',.75,'column tops on the rim'],['rock.basalt.vesicular','vGL.y',.85,'talus'],['cloth.felt','vGL.z',.75,'siphon felt (stand-in: cloth.felt, tinted by the paint)','_gT'],['ground.sinter','vGL.w',.85,'sinter on the hot ground']],
 arete:[['rock.basalt.polygonal','vGL.x',.75,'column tops'],['rock.basalt.vesicular','vGL.y',.85,'breccia'],['ground.snow.drift','vGL.z',.85,'drifted snow'],['ground.lichen.crust','vGL.w*0.6',.5,'lichen']]}[SKEY];
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'siphon-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:
 LAYERS.map(l=>KGROUND.layer('siphon',l[0],{w:l[1],amt:l[2],gain:1.0,tint:l[4]||'vec3(1.0)',name:l[3]})).concat(
 SKEY==='scarp'||SKEY==='arete'?[{kind:'clast',w:'gSteep*0.85',amt:.7,proj:'tri',size:.8,matrix:.12,matrixColor:0x3e3a38,sub:.2,fleck:0,jitter:.9,vary:.35,palette:[0x4a4644,0x56524e,0x3e3a38,0x625c56,0x4e4844],seed:9842,name:'talus'}]:[])});
// THE GROUND MESH: N x N quads over the page's square; the Arete's rows warped toward the edge
const GROUND=(function(){const N=SKEY==='arete'?620:560,NZ=SKEY==='arete'?1000:N,S=TERR.R*2.2,nx=N+1,nz=NZ+1,m4=[0,0,0,0];
 const WK=4.2,zAt=j=>{const u=j/NZ*2-1;return SKEY==='arete'?S/2*Math.sinh(WK*u)/Math.sinh(WK):-S/2+j*S/NZ;};
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),gl=new Float32Array(nx*nz*4);
 for(let j=0;j<nz;j++){const z=zAt(j);for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*S/N,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m4);gl[k*4]=m4[0];gl[k*4+1]=m4[1];gl[k*4+2]=m4[2];gl[k*4+3]=m4[3];}}
 const idx=new Uint32Array(N*NZ*6);let t=0;
 for(let j=0;j<NZ;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nz),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.title;scene.add(m);return m;})();
// the places, as records the inspector and the export read
REGISTER({name:SITE.title,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
if(SKEY==='terraces')REGISTER({name:'The meltwater braids (from the Stalker glaciers)',x:0,z:L.zc(0),y:L.floorAt(0)-4,r:2600,h:20});
if(SKEY==='scarp'){REGISTER({name:'The Ostrukh Wall (the central dividing fault, '+SITE.wall.h+' m)',x:L.RV.x,z:L.RV.z,y:SITE.wall.floor+L.off-20,r:1600,h:SITE.wall.h+300,tags:{hazard:{kind:'fall',danger:.9}}});
 REGISTER({name:'The Scarp Pass (the ravine\'s scree ramp)',x:L.FAN[0]*.5,z:L.FAN[1]*.5,y:terrainH(L.FAN[0],L.FAN[1])-20,r:700,h:1400});}
if(SKEY==='pitfloor'){REGISTER({name:'The maar\'s walls (420 m of columnar basalt)',x:0,z:0,y:SITE.base-5,r:SITE.maar.r+40,h:SITE.rim-SITE.base+40,tags:{hazard:{kind:'fall',danger:.9}}});
 REGISTER({name:'The Siphon Maar Floor (2,277 m, under the amber deck)',x:0,z:0,y:SITE.base-3,r:L.edgeR-60,h:40});}
if(SKEY==='arete'){REGISTER({name:'The knife-edge (the Arete Way: 6 m of basalt between two 420 m pits)',x:0,z:0,y:SITE.base-30,r:640,h:60,tags:{hazard:{kind:'fall',danger:1}}});
 SITE.pits.forEach((p,i)=>REGISTER({name:'A pit of the maar swarm (420 m deep, its floor '+SITE.floor+' m)',x:p.c[0],z:p.c[1],y:SITE.floor-5,r:p.rz*.9,h:450,tags:{hazard:{kind:'fall',danger:1}}}));}
