// ================================================================= HOST — the ground (PLAN.md sections 2 and 11)
// One ground mesh painted from the fields, the treads and the heat, on KGROUND (43-core-ground.js) with at most four library layers a station (the
// 16-unit limit: High Rift's Mirror found six too many), each on its documented mask, and every steep face in Opal Valley's own beds (KSTRATA, 35 + host/35
// shade: strataColor; the recipes are data, 40: OPAL_STRATA, handed to KSTRATA.add here):
//   aGL.x  SINTER     ground.sinter: the dams' rimstone and aprons (the middle bed's), the seeps' hot ground, the cataract's apron
//   aGL.y  STATION A  ice.glacier (the glacier's ice) / ground.gravel042 (the bars, the moraines, the gorge's floor) / ground.mat.thermal (the seeps' run-off)
//   aGL.z  STATION B  ice.debris (the glacier's margins and moraines) / ground.tundra (the upper bed's turf) / stone.geyserite (the middle bed's dam rims)
//   aGL.w  COVER      ground.tundra on the glacier's cold flats (and the frost's polygons there)
//   gSteep            rock.lichen.iris on the faces (the opaline lichen of PLAN.md section 3.2), over the strata
//   aOp    THE OPAL SHEEN: play-of-colour on the sinter, the rims and (faintly) the risers' faces: a thin-film hue that turns with the angle between the eye
//          and the surface (never added light). PLAN.md section 9, item 3: kept to the sinter and the seams, so the opal stays rare. ?sheen=0 off; ?sheen=k
//   aWet   the water's wet band from WATER.fieldAt's shore (89z)
// ?kground=0: the paint alone. ?strata=0: no beds on the faces.
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const KG_RELIEF=USE_KG&&GQ.get('kgrelief')!=='0';
const SHEEN=GQ.has('sheen')?+GQ.get('sheen'):.7;   /* judged in the shots (2026-11-11): the first pass's coat (x0.55..1.5 over the whole mask) read as paint */
const STRATA_RECIPE=(SKEY==='lowerbed'||SKEY==='riftmouth')?'opal-firetuff':'opal-rhyolite';
if(typeof KSTRATA!=='undefined')for(const k in OPAL_STRATA)if(!KSTRATA.RECIPES[k])KSTRATA.add(Object.assign({name:k},OPAL_STRATA[k]));
const STRATA=GQ.get('strata')==='0'||typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:4700+SITE.zone,recipe:STRATA_RECIPE,range:[SITE.base-1000,SITE.base+2600],
 dip:[.25,.96,.07],warp:[8,2]});
const STRATA_SH=STRATA?KSTRATA.shade(STRATA,{dust:SKEY==='lowerbed'?0xb08060:0x9a8c80}):null;
// the gaps between the chain's links (the risers and their rimstone steps): where the dams are
const IN_GAP=x=>{if(!TREADS)return 0;const ti=FLOOR.tread(x);if(ti>=0)return TREADS[ti].kind==='step'?1:0;const R=RISER_CACHE(x);return R?1:0;};
function masksAt(x,z,h,out){const T=HEAT_AT(x,z),wet=FC.at(FC.a.wet,x,z),rock=FC.at(FC.a.rock,x,z),flow=FC.at(FC.a.flow,x,z);let sin=0,A=0,B=0,W=0,op=0;
 if(GL){const ice=smooth(.3,2,iceAt(x,z)),u=G.uOf(x,z),p=Math.abs(G.pOf(x,z)-GCEN(u)),edge=p-G.W(Math.max(u,GL.snout));
  A=ice*(1-smooth(-40,0,edge)*.6);B=clamp(Math.max(smooth(-40,-5,edge)*smooth(90,30,edge),smooth(GL.snout+10,GL.snout-60,u)*smooth(500,150,p)*(1-ice))*(1-rock*.5),0,1);
  W=clamp((1-ice)*(1-B)*(1-rock*.8)*smooth(.2,.5,FC.at(FC.a.flat,x,z)+.3),0,1);A=Math.max(A,(1-ice)*smooth(.3,.8,flow)*.8);op=ice*.12;}
 else{const zc=axisZ(x),aa=Math.abs(z-zc),gap=IN_GAP(x),ti=FLOOR.tread(x),t=ti>=0?TREADS[ti]:null,hw=t?treadHW(t,x):CH;
  const shoreBand=t&&t.kind!=='stream'?smooth(hw+40,hw+2,aa)*smooth(hw-3,hw+2,aa):0;
  if(SITE.dam==='sinter'){sin=Math.max(gap*smooth(STEP_HW*1.6+40,STEP_HW*1.2,aa),shoreBand*.55,smooth(26,42,T));A=smooth(30,40,T)*smooth(78,64,T)*smooth(.3,.55,wet);B=gap*smooth(STEP_HW*1.4,STEP_HW*.5,aa)*.85;
   op=Math.max(sin*.85,B);}
  else if(SITE.dam==='moraine'){A=Math.max(gap*smooth(STEP_HW*2+60,STEP_HW,aa),shoreBand*.8,smooth(.4,.8,flow)*.7);B=clamp((1-A)*(1-rock)*smooth(.3,.6,wet),0,1);op=shoreBand*.15;}
  else if(SITE.dam==='tuff'){sin=gap*smooth(STEP_HW*1.4+30,STEP_HW,aa)*.6;A=Math.max(shoreBand*.75,smooth(.5,.85,flow)*.5);op=sin*.8;}
  else{/* the cataract */sin=smooth(110,40,aa)*smooth(700,800,x)*smooth(1760,1690,x);A=x<RIVER_X0?smooth(gorgeW(x)-10,RIVER.w/2+4,aa)*(1-rock*.7):shoreBand*.7;op=sin*.9;}
  op=Math.max(op,smooth(.55,.85,rock)*.22*(SITE.canyon?1.3:1));}   /* the risers' and walls' faces: the opal seams and the wet glaze, faint */
 out[0]=clamp(sin*(1-.5*rock),0,1);out[1]=clamp(A,0,1);out[2]=clamp(B,0,1);out[3]=clamp(W,0,1);out[4]=clamp(op,0,1);return out;}
// THE PAINT: the macro colour under the layers
const PAINT={glacier:{base:0x8e8a84,dry:0x9a948a},upperbed:{base:0x7e8a62,dry:0x928c70},middlebed:{base:0x6e8a52,dry:0x8a8a60},lowerbed:{base:0x6a8448,dry:0x9a7a58},riftmouth:{base:0x5e8a46,dry:0x8a7a52}}[SKEY];
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),K=hx=>new THREE.Color(hx),m=[0,0,0,0,0];
 const BASE=K(PAINT.base),DRY=K(PAINT.dry),SIN=K(0xe6e2d8),MATO=K(0xc8783a),ICE=K(0xdce8f0),DEB=K(0x8a8680),GRAV=K(0x9a948a),SNOW=K(0xe8ecf2),ROCK=K(SKEY==='lowerbed'||SKEY==='riftmouth'?0x9a6e54:0x8a8078);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,13,2)-.5,hh=FC.at(FC.a.h,wx,wz),rock=FC.at(FC.a.rock,wx,wz),wet=FC.at(FC.a.wet,wx,wz);masksAt(wx,wz,hh,m);
  c.copy(BASE).lerp(DRY,smooth(.45,.2,wet)*.6+.2*smooth(.4,.7,fbm(x/60,y/60,14,2)));
  if(GL){c.lerp(ICE,m[1]*.9).lerp(DEB,m[2]*.75);}
  else{c.lerp(GRAV,(SITE.dam==='sinter'?0:m[1])*.7);if(SITE.dam==='sinter')c.lerp(MATO,m[1]*.6);}
  c.lerp(ROCK,smooth(.3,.65,rock)*.6);
  c.lerp(SIN,m[0]*.85);
  c.lerp(SNOW,smooth(SITE.snow[1],SITE.snow[1]+500,hh)*smooth(.2,.7,fbm(x/14,y/14,15,3))*(1-smooth(.35,.7,rock)*.85));
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(KRAND.h3(x,y,0,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d4cc,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d4cc});
const U_OPAL={value:SHEEN};
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uOpal=U_OPAL;
 if(STRATA_SH)STRATA_SH.inject(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec4 aGL;varying vec4 vGL;attribute float aOp;varying float vOp;attribute float aWet;varying float vWet;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);vGL=aGL;vOp=aOp;vWet=aWet;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform float uOpal;varying vec3 vGWP;varying vec3 vGWN;varying vec4 vGL;varying float vOp;varying float vWet;float gSteep;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=pow(texture2D(uDetail,vGWP.xz*0.165).rgb,vec3(2.2));vec3 dt2=pow(texture2D(uDetail,vGWP.xz*0.021+0.37).rgb,vec3(2.2));gSteep=smoothstep(0.32,0.62,1.0-clamp(vGWN.y,0.0,1.0));vec3 _gT=diffuseColor.rgb*1.5;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.85;'+   /* decoded, its mean ~0.71 a sample: the gain keeps the old brightness */
  (STRATA_SH?'diffuseColor.rgb=mix(diffuseColor.rgb,strataColor(vSWP,vSWN),gSteep*0.9);':'')+
  /* THE OPAL SHEEN: a thin film's colour by the angle (the eye from the view matrix: r128 gives Lambert no cameraPosition), broken by the detail map so it
     reads as flecks and seams, not a coat; it multiplies the ground's colour (it never adds light) */
  '{vec3 _oE=-(viewMatrix[3].xyz*mat3(viewMatrix));float _oF=1.0-abs(dot(normalize(vGWN),normalize(_oE-vGWP)));float _oP=_oF*2.6+dot(vGWP.xz,vec2(0.017,0.011))+dt.r*2.3+dt2.g*1.1;'+
  'vec3 _oC=0.5+0.5*cos(6.2831853*(_oP+vec3(0.0,0.33,0.67)));float _oK=uOpal*vOp*smoothstep(0.69,0.82,dt.g*0.75+dt2.r*0.35+_oF*0.2);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*(0.8+0.45*_oC),_oK);}'+   /* flecks where the detail peaks, a soft swing (x0.8..1.25): reads as opal in the white, not paint */
  'diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const LAYERS={
 glacier:[['ice.glacier','vGL.y',.85,'the glacier\'s ice'],['ice.debris','vGL.z',.85,'the moraines and the dirty ice'],['ground.tundra','vGL.w*0.8',.6,'tundra']],
 upperbed:[['ground.gravel042','vGL.y',.85,'the bars and the moraines'],['ground.tundra','vGL.z*0.8',.6,'the turf']],
 middlebed:[['ground.sinter','vGL.x',.9,'opaline sinter'],['ground.mat.thermal','vGL.y',.85,'the seeps\' mats'],['stone.geyserite','vGL.z',.8,'the dams\' beaded rims']],
 lowerbed:[['ground.sinter','vGL.x',.8,'sinter on the sills'],['ground.gravel042','vGL.y',.85,'the bars']],
 riftmouth:[['ground.sinter','vGL.x',.85,'the cataract\'s sinter apron'],['ground.gravel042','vGL.y',.85,'the gorge\'s bars']]}[SKEY];
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'opalvalley-'+SKEY+'-ground',at:'/*KGROUND*/',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:1}:null,layers:
 LAYERS.map(l=>KGROUND.layer('opalvalley',l[0],{w:l[1],amt:l[2],gain:1.0,tint:'vec3(1.0)',name:l[3]}))
 .concat([KGROUND.layer('opalvalley','rock.lichen.iris',{w:'gSteep*0.55',amt:.5,gain:1.0,tint:'vec3(1.0)',name:'opaline lichen'})])
 .concat(GL?[{kind:'polygon',w:'vGL.w',amt:.7,size:3.4,width:.07,edgeTint:'vec3(0.4,0.38,0.36)',warp:.16,rim:.06,rimTint:'vec3(0.55,0.53,0.5)',seed:442,name:'sorted polygons'}]:[])});
const GROUND=(function(){const N=560,S=TERR.R*2.2,cs=S/N,nx=N+1,m5=[0,0,0,0,0];
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),gl=new Float32Array(nx*nx*4),op=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  masksAt(x,z,y,m5);gl[k*4]=m5[0];gl[k*4+1]=m5[1];gl[k*4+2]=m5[2];gl[k*4+3]=m5[3];op[k]=m5[4];}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aOp',new THREE.BufferAttribute(op,1));g.setAttribute('aWet',new THREE.BufferAttribute(new Float32Array(nx*nx),1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);if(KG_RELIEF)KGROUND.cavityMesh(m);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.name;scene.add(m);return m;})();
// THE PLACES, as records the inspector and the export read (the lakes, the dams, the glacier's parts; the diggings are 86's)
REGISTER({name:SITE.name,x:0,z:0,y:terrainH(0,0)-40,r:600,h:200});
LAKES.forEach(L=>{const x=(L.x0+L.x1)/2;REGISTER({name:L.name+(SITE.dam==='sinter'?' (dammed by opaline sinter)':SITE.dam==='moraine'?' (behind a moraine bar)':SITE.dam==='tuff'?' (behind a tuff sill)':''),
 x,z:axisZ(x),y:L.y-L.depth-1,r:Math.max((L.x0-L.x1)/2,L.hw),h:L.depth+3,tags:{water:{kind:'lake',level:L.y},hazard:{kind:'drown',danger:.4}}});});
if(TREADS)for(let i=0;i+1<SITE.chain.length;i++){const A=SITE.chain[i],B=SITE.chain[i+1],x=(A.x1+B.x0)/2,drop=A.y-B.y;
 if(drop<5)continue;   /* a spill of a metre or two to the outlet: no terrace to name */
 REGISTER({name:(SITE.dam==='cataract'?(drop>100?'The Opal Cataract ('+Math.round(drop)+' m)':'A fall'):SITE.dam==='sinter'?'Rimstone terraces of opaline sinter':SITE.dam==='moraine'?'A moraine bar and its cascade':'A tuff sill and its cascade')+' ('+Math.round(A.y)+' to '+Math.round(B.y)+' m)',
  x,z:axisZ(x),y:B.y-4,r:Math.max(40,(A.x1-B.x0)/2+20),h:drop+20,tags:{hazard:{kind:'fall',danger:Math.min(.95,.3+drop/200)}}});}
if(GL){const c=G.at(GL.snout+700,GCEN(GL.snout+700));REGISTER({name:'The Prism Glacier (KGLACIER: its tongue, icefall and crevasses)',x:c[0],z:c[1],y:landH(c[0],c[1])-60,r:1400,h:420,tags:{hazard:{kind:'fall',danger:.7}}});}
(SITE.hazards||[]).filter(h=>h.kind==='cold').forEach(h=>REGISTER({name:'Katabatic wind off the ice ('+h.why+')',x:0,z:0,y:SITE.base-200,r:2600,h:1400,tags:{hazard:{kind:'cold',danger:.35}}}));
