// ================================================================= HOST — the ground, the water
// One ground mesh painted by the fields: the puna's gold-brown grass and bare soil, olive sedge turf where it is wetter
// (cracked into polygons where the mat has died: the shader draws the cracks), the bog's bright green, lime on the
// Mother Cushion, tan dry ground on the sunward slope, grey and red scree above it, snow on the crest, dark basalt on
// the tors, white sinter banded orange and green round the vents. The water: the frozen tarn (an open lead where the
// stream comes in), the bog's dark pools, the stream.
const NOISE_HASH=`float _h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 _h22(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
// distance to the nearest cell edge of a Voronoi pattern (cracks, ice): 0 on an edge
float _vedge(vec2 p){vec2 n=floor(p),f=fract(p);vec2 mg,mr;float md=8.0;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j)),o=_h22(n+g),r=g+o-f;float d=dot(r,r);if(d<md){md=d;mr=r;mg=g;}}
 md=8.0;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 g=mg+vec2(float(i),float(j)),o=_h22(n+g),r=g+o-f;if(dot(mr-r,mr-r)>0.00001)md=min(md,dot(0.5*(mr+r),normalize(r-mr)));}
 return md;}`;
// the land's named features (a station names its own: STAGE.places, [{name, x, z, r, h, dy}])
if(MOTHER)REGISTER({name:MOTHER.name,x:MOTHER.x,z:MOTHER.z,y:terrainH(MOTHER.x,MOTHER.z)-60,r:MOTHER.r*1.2,h:120});
TORS.forEach(K=>REGISTER({name:K.name||'A basalt tor',x:K.x,z:K.z,y:(typeof plainH==='function'?plainH(K.x,K.z):terrainH(K.x,K.z)-K.h)-5,r:K.r*1.1,h:K.h+30}));
GULLY.forEach(G=>{const z=zF(G.x0)+420;REGISTER({name:G.name,x:xg(G,z),z,y:terrainH(xg(G,z),z)-60,r:420,h:260});});
if(BOG)REGISTER({name:'The bofedal',x:BOG.x,z:BOG.z,y:BOG.y-10,r:BOG.rx*1.05,h:40});
if(GEO)REGISTER({name:GEO.name||'The geyser field',x:GEO.x,z:GEO.z,y:terrainH(GEO.x,GEO.z)-10,r:GEO.r*1.1,h:60});
(STAGE.places||[]).forEach(P=>REGISTER({name:P.name,x:P.x,z:P.z,y:terrainH(P.x,P.z)-(P.dy==null?20:P.dy),r:P.r,h:P.h}));
/* a station's places are landforms the ground draws (a breach, a skylight, a rim), and the ground mesh is probeSkip: one probe point on the ground
   at each place's middle stands for it (registered-volumes-non-empty on the Lesser Throne's bare caldera, 2026-11-08) */
if((STAGE.places||[]).length){const o=new THREE.Object3D();o.userData.probePoints=[].concat(...STAGE.places.map(P=>[P.x,terrainH(P.x,P.z)+.5,P.z]));o.userData.inspectLabel='The named places (probe points)';scene.add(o);}

// ---------------------------------------------------------------- the ground
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const SOIL=K(0x6e5c44),SOIL2=K(0x7c684c),ICHU=K(0xa88e50),ICHU2=K(0x957c44),TURF=K(0x6a663a),TURF2=K(0x5a6034),DRY=K(0x94805e),
  SCREE=K(0x76706a),SCREE2=K(0x8a6252),SNOW=K(0xeef2f6),BAS=K(0x4e4a48),BOGC=K(0x4a8a3a),BOG2=K(0x3a7432),MOTH=K(0x86b036),
  SINT=K(0xe6e2d6),SINO=K(0xd8782a),SING=K(0x5a8a3a),GUL=K(0x5a6a38),
  LITTER=K(0x3c3222),LITTER2=K(0x2e3a1e),MOSS=K(0x4a6a2a),ASH=K(0x8a8278),ASH2=K(0xa0968a),LAVA=K(0x2c2826),LAVA2=K(0x4a3a34),SULF=K(0xd8c048),NEEDL=K(0x5a4632);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(x/70+5,y/70-2,.7,2);
  const A=k=>FC.at(FC.a[k],wx,wz);
  const rock=A('rock'),tor=A('tor'),cold=A('cold'),wet=A('wet'),bog=A('bog'),geo=A('geo'),gully=A('gully'),sunF=A('sun'),slope=A('slope'),flow=A('flow');
  /* the stations' own surfaces (a field the land does not name reads 0 and paints nothing: the showcase's paint is unchanged) */
  const forest=Math.max(FC.a.forest?A('forest'):0,FC.a.mixed?A('mixed'):0),taiga=FC.a.taiga?A('taiga'):0,ash=FC.a.ash?A('ash'):0,lava=FC.a.lava?A('lava'):0,warm=FC.a.warm?A('warm'):0;
  // the puna: gold-brown grass over bare soil in patches; olive turf where it is wetter
  c.copy(SOIL).lerp(SOIL2,clamp(.5+n*1.8,0,1));
  t.copy(ICHU).lerp(ICHU2,clamp(.5+n*1.6,0,1));c.lerp(t,.45+.3*smooth(.35,.65,pav)+.15*smooth(.55,.75,BIO.fn.h3(x>>2,y>>2,5)));
  t.copy(TURF).lerp(TURF2,clamp(.5+n*1.5,0,1));c.lerp(t,smooth(.28,.46,wet)*.85);
  // the sunward slope: tan, stony
  c.lerp(DRY,smooth(.25,.6,sunF)*smooth(.15,.3,cold)*(1-smooth(.5,.7,cold))*.6);
  // the gullies: green turf on their floors
  c.lerp(GUL,smooth(.3,.7,gully)*smooth(.75,.6,cold)*.6);
  // scree: grey basalt, red scoria in streaks
  t.copy(SCREE).lerp(SCREE2,smooth(.55,.75,fbm(wx*.004,wz*.02,77,2)));c.lerp(t,smooth(.25,.6,rock)*smooth(.3,.55,cold));
  // the tors and steep low rock: dark basalt
  c.lerp(BAS,smooth(.35,.7,tor)*.9);
  // the bog: bright green, darker in the hollows
  t.copy(BOGC).lerp(BOG2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.25,.6,bog));
  c.lerp(K(0x5a7a3a),smooth(.4,.8,flow)*(1-bog)*.5);
  // the Mother: lime (its own skin is drawn by the kit over this)
  c.lerp(MOTH,smooth(.2,.5,FIELD.mother(wx,wz))*.9);
  // the sinter: white, banded orange and green round the vents
  // the wet face's forest floor: dark litter, moss where it is wettest and on the giant-facing banks
  if(forest>0){t.copy(LITTER).lerp(LITTER2,clamp(.5+n*1.8,0,1)).lerp(MOSS,smooth(.45,.8,wet)*.6);c.lerp(t,smooth(.15,.55,forest)*(1-.75*smooth(.4,.8,rock)));}   /* bare rock keeps its own colour */
  // the spruce-fir's floor: brown needle litter, moss in the wet
  if(taiga>0){t.copy(NEEDL).lerp(MOSS,smooth(.5,.85,wet)*.4);c.lerp(t,smooth(.15,.55,taiga)*(1-.75*smooth(.4,.8,rock)));}
  // the Lesser Throne's young ground: grey-buff pumice and ash, dark lava flows, the sulphur round the vents
  if(ash>0){t.copy(ASH).lerp(ASH2,clamp(.5+n*1.6+(pav-.5)*.8,0,1));c.lerp(t,smooth(.1,.5,ash));}
  if(lava>0){t.copy(LAVA).lerp(LAVA2,smooth(.55,.75,fbm(wx*.01,wz*.01,79,2)));c.lerp(t,smooth(.2,.6,lava));}
  if(warm>0)c.lerp(SULF,smooth(.6,.9,warm)*.35);
  if(geo>0){let ring=0;for(const V of VENTS){const dv=Math.hypot(wx-V.x,wz-V.z);ring=Math.max(ring,smooth(70*V.k,8,dv));}
   t.copy(SINT).lerp(SINO,smooth(.25,.55,ring)*.8).lerp(SING,smooth(.1,.25,ring)*(1-smooth(.3,.55,ring))*.7);c.lerp(t,smooth(.3,.6,geo));}
  // snow: patches below the crest in the hollows, whole above
  const sn=smooth(.78,.9,cold+.08*(pav-.5)+.06*n)+smooth(.62,.75,cold)*smooth(.62,.72,pav)*.8;c.lerp(SNOW,clamp(sn,0,1));
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// THE GRASS FLECKS: a fine map tiled in world metres. G short blades, R a variation. The shader lays gold blades on the
// puna and olive on the turf, so the ground reads as grass at every distance at no cost in triangles.
const TEX_FLECK=BIO.canvasTex(256,256,(g,w,h)=>{const G=new Float32Array(w*h),id=g.createImageData(w,h),d=id.data;
 const dot=(A,cx,cy,r,v)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){const q=Math.hypot(x-cx,y-cy)/r;if(q>1)continue;const k=((y%h+h)%h)*w+((x%w+w)%w);A[k]=Math.max(A[k],v*(1-q*q*.6));}};
 for(let i=0;i<5200;i++){const cx=rng()*w,cy=rng()*h,a=rr(-.6,.6)-Math.PI/2,L=rr(3,9);for(let t=0;t<=L;t+=.7)dot(G,cx+Math.cos(a)*t,cy+Math.sin(a)*t,.8,rr(.7,1));}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,k=y*w+x;d[i]=clamp(128+(fbm(x/14,y/14,8,2)-.5)*200,0,255);d[i+1]=G[k]*255;d[i+2]=0;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX_FLECK.wrapS=TEX_FLECK.wrapT=THREE.RepeatWrapping;TEX_FLECK.encoding=THREE.LinearEncoding;TEX_FLECK.anisotropy=4;
// THE LIBRARY GROUND (materials.json ground.turf, ground.sinter, stone.basalt; core/materials/PLAN.md, Eastern highlands):
// layers over the painted ground. The turf set (its own polygons and cracks) takes the place of the shader's procedural
// ones where the sedge mat grows; the sinter set covers the geyser field; the basalt set is the tors' grain. Without the
// pack (?mat=proc, or an open world) the ground is exactly the painted one with the procedural turf.
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=n=>KMAT.packed('ehigh',n);
 const t=P('ground.turf'),s=P('ground.sinter'),pu=P('ground.puna'),ve=P('ground.verge');if(!t||!s||!pu)return null;
 const m=(L,k)=>{const x=KMAT.textures(L,{aniso:8}).map;x.wrapS=x.wrapT=THREE.RepeatWrapping;return x;};
 return{turf:m(t),turfK:1/t.scale[0],sinter:m(s),sinterK:1/s.scale[0],puna:m(pu),punaK:1/pu.scale[0],verge:ve?m(ve):null,vergeK:ve?1/ve.scale[0]:0};})();
/* THE LIBRARY LAYERS ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js; the final rebuild, pair 13, 2026-11-09): the puna, the verge,
   the turf and the sinter come over the paint hex-tiled (no repeat shows: the page's own two-scales-and-a-turn trick is gone), scaled with
   distance and blended by height, at the strengths and tints the mix below had (the puna's third of paint kept by its amount, .7), so a tussock
   or a sinter rim stands through the next layer at an edge instead of a smear. Only with the pack (the procedural fallback keeps its polygons) and
   ?kground=0 not set, which gives the page's own mix as it was. three r128 uploads cameraPosition only to Phong and Standard materials, so on this
   Lambert ground KGROUND's distance is taken from the view matrix (KHOOK.EYE's kEye; the define's name is joined so check_source's CAMPOS rule,
   which cannot tell a redirect from a read, does not count it; the fix belongs in core/terrain/43-core-ground.js, korona's finding) */
/* A station draws the layers its ground has (STAGE.ground; the showcase: puna, verge, turf; the sinter wherever the land has a GEO): every sampler
   counts against the Arc's 16 (ringisles' lesson). The stations' own (station 2's forest moss, station 3's ash and scoria) ride on a second
   weight attribute, aG2 (forest, ash, lava) */
const KG_WANT=STAGE.ground||['puna','verge','turf'].concat(GEO?['sinter']:[]);
const KG_LY=GLAY&&typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'?(function(){
 const D={puna:()=>KGROUND.layer('ehigh','ground.puna',{w:'clamp(vG.y*1.6,0.0,0.9)',amt:.7,tint:'diffuse*1.3',name:'puna'}),
  verge:()=>GLAY.verge?KGROUND.layer('ehigh','ground.verge',{w:'kgMV*clamp(vG.y*1.4,0.0,1.0)',amt:.75,tint:'diffuse*1.3',name:'verge'}):null,
  turf:()=>KGROUND.layer('ehigh','ground.turf',{w:'clamp(vG.z*1.4,0.0,0.92)',tint:'diffuse*1.25',name:'turf'}),
  sinter:()=>KGROUND.layer('ehigh','ground.sinter',{w:'vGeo*0.9',tint:'diffuse*1.2',name:'sinter'}),
  moss:()=>{const L=KGROUND.layer('ehigh','ground.moss',{w:'clamp(vG2.x*1.2,0.0,0.95)',tint:'diffuse*1.15',name:'moss'});if(L)L.g2=true;return L;},
  ash:()=>{const L=KGROUND.layer('ehigh','ground.ash',{w:'clamp(vG2.y*1.3,0.0,0.95)',tint:'diffuse*1.2',name:'ash'});if(L)L.g2=true;return L;},
  needles:()=>{const L=KGROUND.layer('ehigh','ground.needles',{w:'clamp(vG2.w*1.2,0.0,0.95)',tint:'diffuse*1.15',name:'needles'});if(L)L.g2=true;return L;},
  scoria:()=>{const L=KGROUND.layer('ehigh','ground.scoria',{w:'clamp(vG2.z*1.3,0.0,0.95)',tint:'diffuse*0.75',name:'scoria'});if(L)L.g2=true;return L;}};
 const L=KG_WANT.map(n=>D[n]?D[n]():null);
 return L.length&&L.every((l,i)=>l||KG_WANT[i]==='verge')?L.filter(Boolean):null;})():null;
const KG_EYE='#define '+'camera'+'Position kEye()\n';
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xb0aaa2});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uRock={value:EHIGH.BASALT?EHIGH.BASALT.map:EHIGH.ROCKTEX};sh.uniforms.uFleck={value:TEX_FLECK};if(GLAY&&!KG_LY){sh.uniforms.uGTurf={value:GLAY.turf};sh.uniforms.uGSinter={value:GLAY.sinter};sh.uniforms.uGPuna={value:GLAY.puna};if(GLAY.verge)sh.uniforms.uGVerge={value:GLAY.verge};}
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aG;varying vec4 vG;attribute float aGeo;varying float vGeo;'+(KG_LY&&KG_LY.some(L=>L.g2)?'attribute vec4 aG2;varying vec4 vG2;':''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vG=aG;vGeo=aGeo;'+(KG_LY&&KG_LY.some(L=>L.g2)?'vG2=aG2;':''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uRock,uFleck;varying vec3 vGWP;varying vec4 vG;varying float vGeo;\n'+(KG_LY&&KG_LY.some(L=>L.g2)?'varying vec4 vG2;\n':'')+(KG_LY?KHOOK.EYE+KG_EYE:'')+(GLAY&&!KG_LY?'uniform sampler2D uGTurf,uGSinter,uGPuna'+(GLAY.verge?',uGVerge':'')+';\n':'')+NOISE_HASH)
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _pd0=diffuseColor.rgb;vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;'+
  // vG: x rock (basalt grain), y grass (ichu gold), z turf (olive, and its polygons), w snow
  // the basalt's lichens at half their colour on the ground (whole, they blotch a rocky meadow orange from afar)
  'vec3 rk=pow(texture2D(uRock,vGWP.xz*0.09+vGWP.y*0.03).rgb,vec3(2.2));rk=mix(rk,vec3(dot(rk,vec3(0.2126,0.7152,0.0722))),0.5);'+
  'diffuseColor.rgb*=mix(dt*dt2*1.12,rk*'+(EHIGH.BASALT?(.62/Math.pow(EHIGH.BASALT.mean,2.2)).toFixed(3):'2.1')+',vG.x*0.75*(1.0-vG.w));'+
  // the fleck map's masks (a linear data map, not a colour: no decode): the blades, and the verge's macro patches for KGROUND's verge layer
  'vec3 f1=texture2D(uFleck,vGWP.xz*0.47).rgb,f2=texture2D(uFleck,vGWP.xz*0.173+vec2(0.37,0.61)).rgb;float gb=max(f1.g,f2.g*0.8);float kgMV=smoothstep(0.52,0.72,texture2D(uFleck,vGWP.xz*0.0071+vec2(0.52,0.19)).r);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.62,0.48,0.2)*(0.75+0.5*f2.r),gb*vG.y*0.6);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.26,0.3,0.12)*(0.75+0.5*f1.r),gb*vG.z*0.55);'+
  // THE TURF'S POLYGONS: where the sedge mat has died it cracks into cells a few metres across (the plateau's own
  // patterned ground); the cracks are bare dark soil, the cells' rims browner
  // with the pack: the library turf where the mat grows (anti-tiled: two scales, one turned 37 degrees, blended by a macro
  // noise) and the sinter on the geyser field; without it the procedural polygons
  (KG_LY?'\n/*KGROUND*/\n':
   GLAY?'{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float m1=texture2D(uFleck,p*0.0173+vec2(0.13,0.71)).r;float mt=smoothstep(0.3,0.7,m1);'+
   // the puna: its soil, grit and tussock bases under the open grass (the painted colour keeps a third of its say,
   // so the ground still drifts between browner and golder over hundreds of metres)
   'vec3 tp=mix(pow(texture2D(uGPuna,p*'+GLAY.punaK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGPuna,q*'+(GLAY.punaK*.53).toFixed(4)+'+vec2(0.47,0.23)).rgb,vec3(2.2)),mt);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,mix(_pd0,diffuse*tp*1.3,0.7),clamp(vG.y*1.6,0.0,0.9));'+
   /* the verge (library ground013, trodden grey-green grass): patches of the open puna where a macro noise runs high, anti-tiled like the rest */
   (GLAY.verge?'float mv=smoothstep(0.52,0.72,texture2D(uFleck,p*0.0071+vec2(0.52,0.19)).r);vec3 tv=mix(pow(texture2D(uGVerge,p*'+GLAY.vergeK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGVerge,q*'+(GLAY.vergeK*.57).toFixed(4)+'+vec2(0.21,0.77)).rgb,vec3(2.2)),mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tv*1.3,mv*clamp(vG.y*1.4,0.0,1.0)*0.75);':'')+
   'vec3 tt=mix(pow(texture2D(uGTurf,p*'+GLAY.turfK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGTurf,q*'+(GLAY.turfK*.53).toFixed(4)+'+vec2(0.31,0.17)).rgb,vec3(2.2)),mt);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*tt*1.25,clamp(vG.z*1.4,0.0,0.92));'+
   'vec3 ts=mix(pow(texture2D(uGSinter,p*'+GLAY.sinterK.toFixed(4)+').rgb,vec3(2.2)),pow(texture2D(uGSinter,q*'+(GLAY.sinterK*.41).toFixed(4)+'+vec2(0.19,0.63)).rgb,vec3(2.2)),mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*ts*1.2,vGeo*0.9);}':
  '{float e=_vedge(vGWP.xz*0.31);float cr=1.0-smoothstep(0.0,0.07,e);float rim=1.0-smoothstep(0.07,0.22,e);'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.18,0.14,0.09),cr*vG.z*0.8);diffuseColor.rgb*=1.0-rim*vG.z*0.12;}')+
  // snow: smooth, with a faint wind crust
  'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.92,0.95,1.0)*(0.94+0.06*dt.r),vG.w*0.85);}');};
if(KG_LY){MAT_GROUND.customProgramCacheKey=()=>'ehigh-ground-kg-'+KG_WANT.join('-');KGROUND.hook(MAT_GROUND,{key:'ehigh-ground-'+KG_WANT.join('-'),layers:KG_LY,at:'/*KGROUND*/'});MAT_GROUND.userData.kgroundOn=true;}
const GROUND=(function(){const N=STAGE.groundN==null?480:STAGE.groundN,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),ag=new Float32Array(nx*nx*4),ag2=new Float32Array(nx*nx*4),agEo=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  const rock=FC.at(FC.a.rock,x,z),cold=FC.at(FC.a.cold,x,z),wet=FC.at(FC.a.wet,x,z),bog=FC.at(FC.a.bog,x,z),geo=FC.at(FC.a.geo,x,z),mo=FIELD.mother(x,z);
  const fo=Math.max(FC.a.forest?FC.at(FC.a.forest,x,z):0,FC.a.mixed?FC.at(FC.a.mixed,x,z):0),tg=FC.a.taiga?FC.at(FC.a.taiga,x,z):0,as=FC.a.ash?FC.at(FC.a.ash,x,z):0,lv=FC.a.lava?FC.at(FC.a.lava,x,z):0;
  const open=(1-smooth(.3,.6,rock))*(1-smooth(.25,.6,bog))*(1-smooth(.3,.6,geo))*(1-smooth(.2,.5,mo))*(1-smooth(.15,.55,fo))*(1-smooth(.1,.5,as))*(1-smooth(.2,.6,lv))*(1-smooth(.15,.55,tg));
  const pav=fbm((x/S+.5)*1536/70+5,(z/S+.5)*1536/70-2,.7,2);   // the painter's own noise, at its pixel
  const snow=clamp(smooth(.78,.9,cold+.08*(pav-.5))+smooth(.62,.75,cold)*smooth(.62,.72,pav)*.8,0,1);
  ag[k*4]=smooth(.3,.65,rock);ag[k*4+1]=open*(1-smooth(.3,.46,wet))*(1-smooth(.55,.75,cold))*(1-snow);
  agEo[k]=smooth(.3,.6,geo)*(1-snow);
  ag[k*4+2]=open*smooth(.3,.46,wet)*(1-snow)*(.55+.45*smooth(.45,.6,fbm(x*.006,z*.006,991,2)));ag[k*4+3]=snow;
  ag2[k*4]=smooth(.15,.55,fo)*(1-.75*smooth(.4,.8,rock))*(1-snow);ag2[k*4+1]=smooth(.1,.5,as)*(1-smooth(.2,.6,lv))*(1-snow);ag2[k*4+2]=smooth(.2,.6,lv)*(1-snow);ag2[k*4+3]=smooth(.15,.55,tg)*(1-.75*smooth(.4,.8,rock))*(1-snow);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aG',new THREE.BufferAttribute(ag,4));if(KG_LY&&KG_LY.some(L=>L.g2))g.setAttribute('aG2',new THREE.BufferAttribute(ag2,4));g.setAttribute('aGeo',new THREE.BufferAttribute(agEo,1));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The eastern highlands';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water
// Dark open water that takes the deep sky at a glancing angle (thin air: a deep blue, not a white glare)
/* the stream, the bog's pools and the tarn's water are core/water's now: 89w-host-water.js (the ice below stays this page's own shader) */
// THE TARN, frozen: blue-white ice cracked into plates, wind-scoured clear in streaks and drifted with snow in others,
// open water in a lead where the stream comes in (and dark water under the ice shows there)
let MAT_ICE=null;
if(TARN){const TARN_LEAD=[TARN.x+TARN.r*.62,TARN.z+18];
MAT_ICE=new THREE.ShaderMaterial({fog:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uSun:{value:new THREE.Vector3(...SUNP).normalize()},uLead:{value:new THREE.Vector2(...TARN_LEAD)},uSky:{value:new THREE.Color(0x6a94d0)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;',
  'void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uSun,uSky;uniform vec2 uLead;varying vec3 vWP;',NOISE_HASH,
  'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(_h2(i),_h2(i+vec2(1,0)),f.x),mix(_h2(i+vec2(0,1)),_h2(i+vec2(1,1)),f.x),f.y);}',
  'void main(){',
  ' float ld=length(vWP.xz-uLead)+6.0*vn(vWP.xz*0.08);if(ld<34.0)discard;',
  ' float e=_vedge(vWP.xz*0.07),e2=_vedge(vWP.xz*0.21+3.1);',
  ' float sn=smoothstep(0.45,0.7,vn(vWP.xz*vec2(0.02,0.06))+0.25*vn(vWP.xz*0.2));',
  ' vec3 ice=mix(vec3(0.42,0.6,0.72),vec3(0.62,0.76,0.86),vn(vWP.xz*0.05));',
  ' ice*=1.0-0.45*(1.0-smoothstep(0.0,0.04,e))-0.2*(1.0-smoothstep(0.0,0.02,e2));',
  ' ice=mix(ice,vec3(0.9,0.93,0.97),sn*0.85);ice=mix(ice,vec3(0.18,0.28,0.36),smoothstep(46.0,34.0,ld)*0.6);',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-V.y,0.0,1.0),4.0);ice=mix(ice,uSky,fr*0.35*(1.0-sn));',
  ' vec3 H=normalize(uSun+V);ice+=pow(max(H.y,0.0),400.0)*0.8*(1.0-sn);',
  ' gl_FragColor=vec4(ice,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_ICE.uniforms.fogColor.value=scene.fog.color;MAT_ICE.uniforms.fogDensity.value=scene.fog.density;
{const g=new THREE.CircleGeometry(TARN.r*1.3,64);g.rotateX(-Math.PI/2);g.translate(TARN.x,TARNL+.04,TARN.z);
 const m=new THREE.Mesh(g,MAT_ICE);m.userData.probeSkip=true;m.userData.inspectLabel='The frozen tarn';m.renderOrder=2;scene.add(m);
 REGISTER({name:'The frozen tarn',x:TARN.x,z:TARN.z,y:TARNL-6,r:TARN.r*1.3,h:20});}}
