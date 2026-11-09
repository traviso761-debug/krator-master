// ================================================================= HOST — the ground (the field as drawn)
// ONE MESH ON THE FIELD'S OWN LATTICE (KFIELD, 45-host-stage.js: 10 m), every vertex a grid point, so what is planted on the
// field stands on the ground as drawn; the vent's cone is the field's inset (2.5 m), drawn as its own mesh in the hole the
// base mesh leaves under it (the inset's border lies on the base lattice's lines and reads the base field's heights there:
// no seam). A vertical apron round the map hides the edge against the far country (82-host-sky.js).
// THE MATERIAL: a standard one (the titanium basalt's ilmenite sheen is roughness and metalness, KSTRATA's note), painted
// from the kit's ground classes (GODT.groundAt: the halo's orange and black beads, the spatter, the pit's glassy floor, the
// vent's sublimates, hoarfrost); the library's ground sets laid over the paint by core/terrain's KGROUND, the beads as its
// `sand` kind (ripples, glints); every face in the rock's own beds (KSTRATA.shade: the tibasalt recipe, strataColor) with the
// basalt's grain; the caldera wall's shadows from KHORIZON. Host-only.
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('godthrone',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
let GROUND=null,GROUND_HZ=null,GROUND_MESHES=[];
const STRATA_SH=KSTRATA.shade(STRATA,{dust:0x2a2624});
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,G={};
 // ---- the paint: the ground classes on the map, at half the texture's size (9.4 m a pixel: every input is smoother)
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data,c=new THREE.Color(),q=new THREE.Color(),GR=GODT.GROUND,col=k=>new THREE.Color(GR[k].col);
  const EXC={},EXK={palag:.92,ice:.95,rust:.9,breccia:.85,snow:.97,tuff:.9,pave:.8,crust:.6};GODT.EXTRA.forEach(q=>EXC[q]=col(q));const BAS=col('basalt'),OR=col('beadOrange'),BL=col('beadBlack'),SP=col('spatter'),SPR=col('spatterRed'),GL=col('glass'),SU=col('sublimate'),FR=col('frost'),OR2=new THREE.Color(0xe08a34);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,wx=TERR.X0+(x+.5)/w*SX,wz=TERR.Z0+(y+.5)/h*SZ,n=KRAND.h3(x,y,0,WORLD+21)-.5;
   GODT.groundAt(wx,wz,G);
   c.copy(BAS).lerp(BL,clamp(G.black*1.2,0,1)).lerp(q.copy(OR).lerp(OR2,clamp(.5+n,0,1)*.4),clamp(G.orange*1.15,0,1));
   if(G.spatter>0)c.lerp(q.copy(SP).lerp(SPR,smooth(.3,.8,KRAND.vnoise(wx*.02,0,wz*.02,WORLD+22))),G.spatter*.85);
   if(G.glass>0)c.lerp(GL,G.glass*.8);
   if(G.sublimate>0)c.lerp(SU,G.sublimate*smooth(.35,.75,KRAND.vnoise(wx*.05,0,wz*.05,WORLD+23)));
   if(G.frost>0)c.lerp(FR,G.frost*.35);
   for(const q of GODT.EXTRA)if(G[q]>0)c.lerp(EXC[q],clamp(G[q],0,1)*EXK[q]);   /* the stations' own classes (45c GROUND_EXTRA) */
   const k=1+n*.07;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,0,y/9,2,WORLD+24)-.5)*40+(KRAND.h3(x,y,0,WORLD+25)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const MAT=new THREE.MeshStandardMaterial({map:TEX,color:0xffffff,roughness:.97,metalness:0});
 const sandSeed=k=>KRAND.hash(WORLD,0,k,0x5A4D)%997;
 const GLY=[KGROUND.layer('godthrone','beadsOrange',{kind:'sand',w:'vGL.x',amt:.95,gain:1.05,tint:'vec3(1.0)',wind:[.55,-.83],ripple:.14,seed:sandSeed(1)}),
  KGROUND.layer('godthrone','beadsBlack',{kind:'sand',w:'vGL.y',amt:.9,gain:1.1,tint:'vec3(1.0)',wind:[.55,-.83],ripple:.12,seed:sandSeed(2)}),
  KGROUND.layer('godthrone','glass',{w:'vGL.z',amt:.85,gain:1,tint:'vec3(1.0)'}),
  KGROUND.layer('godthrone','spatter',{w:'vGM.x',amt:.9,gain:1,tint:'vec3(0.42,0.33,0.3)'})   /* the scoria set is paler than fresh spatter: darkened toward red-black */]
  /* a station's own layers (STN.layers: KGROUND layers on the extra classes' weights, vGX = palag, ice, rust, breccia and vGY = snow,
     tuff, pave, crust; each a family its station.json "tex" names) */
  .concat(STN.layers?STN.layers(sandSeed):[]);
 /* THE BEDS AT A DISTANCE: the tibasalt's beds are 0.1-15 m, finer than a pixel past a few hundred metres, where the walls
    read black. The column's colour averaged over 6 m (its bead-rich packets orange, its flows black), its contrast with the
    column's mean raised 1.6x, is what a far face shows (faded in from 150 to 600 m from the eye); read at KSTRATA's own
    stratigraphic height (ksYY), so a band lines up with the beds it stands for */
 const BAND=(function(){const y0=STRATA.range[0],y1=STRATA.range[1],st=6,n=Math.ceil((y1-y0)/st),lin=new Float32Array(n*3),mean=[0,0,0];
  for(let i=0;i<n;i++){let r=0,g=0,b=0;for(let k=0;k<24;k++){const c=STRATA.colorAt(y0+i*st+(k+.5)*st/24);r+=Math.pow(c[0],2.2);g+=Math.pow(c[1],2.2);b+=Math.pow(c[2],2.2);}
   lin[i*3]=r/24;lin[i*3+1]=g/24;lin[i*3+2]=b/24;mean[0]+=r/24/n;mean[1]+=g/24/n;mean[2]+=b/24/n;}
  const d=new Uint8Array(n*4);for(let i=0;i<n;i++){for(let c=0;c<3;c++){const v=Math.max(0,mean[c]+(lin[i*3+c]-mean[c])*1.6);d[i*4+c]=Math.round(clamp(Math.pow(v,1/2.2),0,1)*255);}d[i*4+3]=255;}
  const t=new THREE.DataTexture(d,n,1,THREE.RGBAFormat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;
  return{t,y0,k:1/(y1-y0)};})();
 MAT.onBeforeCompile=sh=>{sh.uniforms.uBand={value:BAND.t};sh.uniforms.uBandR={value:new THREE.Vector2(BAND.y0,BAND.k)};
  /* THE MAP'S EDGE: within 700 m of the square's edge the flat ground eases into the far country's own colour (82-host-sky.js
     FAR.C: the floor, orange toward the vent), so the square does not read against the caldera beyond it */
  sh.uniforms.uBox={value:new THREE.Vector4(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1)};sh.uniforms.uVentXZ={value:new THREE.Vector2(VENT.x,VENT.z)};
  sh.uniforms.uFarFloor={value:new THREE.Vector3(...FAR.C.floor)};sh.uniforms.uFarOrange={value:new THREE.Vector3(...FAR.C.orange)};
  sh.uniforms.uDetail={value:hostGroundLib('groundDetail',DET)};sh.uniforms.uRockFace={value:hostGroundLib(STN.rockFace||'rockFace',DET)};
  STRATA_SH.inject(sh);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec3 aGL;attribute vec4 aGM;varying vec3 vGL;varying vec4 vGM;attribute vec4 aGX;attribute vec4 aGY;varying vec4 vGX;varying vec4 vGY;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGX=aGX;vGY=aGY;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRockFace;varying vec3 vGWP;varying vec3 vGWN;varying vec3 vGL;varying vec4 vGM;varying vec4 vGX;varying vec4 vGY;float gRockW;uniform sampler2D uBand;uniform vec2 uBandR;uniform vec4 uBox;uniform vec2 uVentXZ;uniform vec3 uFarFloor;uniform vec3 uFarOrange;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vGWP.xz*0.21).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.031+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);',
    '/*KGROUND*/',
    // the rock: wherever the ground is steep, its own beds (KSTRATA's tibasalt), the basalt's grain on the face's plane
    ' float steep=1.0-clamp(vGWN.y,0.0,1.0);gRockW=smoothstep(0.30,0.58,steep)*(1.0-0.75*vGM.w*(1.0-smoothstep(0.30,0.48,steep)));',
    ' vec2 fp=abs(vGWN.x)>abs(vGWN.z)?vec2(vGWP.z,vGWP.y):vec2(vGWP.x,vGWP.y);',
    ' vec3 rf=pow(texture2D(uRockFace,fp*0.11).rgb,vec3(2.2))*1.9;',
    ' vec3 sc=strataColor(vSWP,vSWN)*mix(vec3(1.0),rf,0.7);',
    ' {float w1b;float yyb=ksYY(vSWP,w1b);vec3 band=pow(texture2D(uBand,vec2((yyb-uBandR.x)*uBandR.y,0.5)).rgb,vec3(2.2))*mix(vec3(1.0),rf,0.5);',
    '  sc=mix(sc,band,smoothstep(150.0,600.0,length(vGWP-cameraPosition)));}',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,gRockW);',
    // hoarfrost on the shaded north faces (the paint carries it on the flats)
    ' diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.62,0.68,0.75),vGM.z*gRockW*0.45);',
    // the stations' covers on the faces too: ice and snow hide the beds, the brine's rust stains them, palagonite is the beds' own alteration
    ' diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.56,0.66,0.74),vGX.y*gRockW*0.9);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.85,0.88,0.92),vGY.x*gRockW*smoothstep(0.75,0.45,1.0-clamp(vGWN.y,0.0,1.0)));',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.27,0.05,0.02),vGX.z*gRockW*0.75);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.43,0.25,0.07),vGX.x*gRockW*0.5);',
    ' {float ed=min(min(vGWP.x-uBox.x,uBox.z-vGWP.x),min(vGWP.z-uBox.y,uBox.w-vGWP.z));vec3 farc=mix(uFarFloor,uFarOrange,0.55*exp(-length(vGWP.xz-uVentXZ)/2600.0));',
    '  diffuseColor.rgb=mix(diffuseColor.rgb,farc,'+(MODEL.farColor?'0.0':'1.0')+'*smoothstep(700.0,40.0,ed)*(1.0-gRockW));}}'].join('\n'))
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.84,gRockW);roughnessFactor=mix(roughnessFactor,0.72,vGL.z*0.8);roughnessFactor=mix(roughnessFactor,0.38,vGX.y*0.85);roughnessFactor=mix(roughnessFactor,0.55,vGX.z*0.6);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,0.1,gRockW);metalnessFactor=mix(metalnessFactor,0.05,vGL.z);');};   /* the ilmenite sheen; the pit floor's glass */
 MAT.customProgramCacheKey=()=>'godt-ground';
 /* THE GROUND'S RELIEF (core/terrain/GROUND.md; core/README.md "Adopting KGROUND's relief"; HANDOFF-REBUILD.md's adoption list, 2026-11-03:
    godthrone takes the full effect on its MeshStandard ground): a derivative bump from the layers' blended height (no texture unit),
    cavity occlusion, the mesh's own hollows (KGROUND.cavityMesh below, relief.mesh) and the tibasalt's bed relief on the steep (hard
    flows proud, the bead horizons recessed: the core strata path, KSTRATA.shade). ?kgrelief=0 draws the ground without it, for the
    owner's before-and-after (the shader is then the pre-relief one byte for byte). No triplanar sides: the faces are KSTRATA's beds on
    the face's own plane already (the rock below), so the layers' side planes would only show on the bead drifts */
 const RELIEF=new URLSearchParams(location.search).get('kgrelief')!=='0';
 // ---- the meshes: the base lattice (its cells under the inset left out) and the inset
 const mkMesh=(F,skip,label)=>{const nx=F.nx,nz=F.nz,n=nx*nz,pos=new Float32Array(n*3),uv=new Float32Array(n*2),aGL=new Float32Array(n*3),aGM=new Float32Array(n*4),aGX=new Float32Array(n*4),aGY=new Float32Array(n*4);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=F.x0+i*F.step,z=F.z0+j*F.step;
   pos[k*3]=x;pos[k*3+1]=F.heights[k];pos[k*3+2]=z;uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;
   GODT.groundAt(x,z,G);aGL[k*3]=G.orange;aGL[k*3+1]=G.black;aGL[k*3+2]=G.glass;aGM[k*4]=G.spatter;aGM[k*4+1]=G.sublimate;aGM[k*4+2]=G.frost;aGM[k*4+3]=FIELD.halo(x,z);
   aGX[k*4]=G.palag;aGX[k*4+1]=G.ice;aGX[k*4+2]=G.rust;aGX[k*4+3]=G.breccia;aGY[k*4]=G.snow;aGY[k*4+1]=G.tuff;aGY[k*4+2]=G.pave;aGY[k*4+3]=G.crust;}
  const idx=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(skip&&skip(i,j))continue;const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('aGL',new THREE.BufferAttribute(aGL,3));g.setAttribute('aGM',new THREE.BufferAttribute(aGM,4));g.setAttribute('aGX',new THREE.BufferAttribute(aGX,4));g.setAttribute('aGY',new THREE.BufferAttribute(aGY,4));g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx),1));
  g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,MAT);m.userData.probeSkip=true;m.userData.inspectLabel=label;scene.add(m);GROUND_MESHES.push(m);return m;};
 const ibs=INSETS.map(I=>[Math.round((I.box[0]-TERR.X0)/FIELD_STEP),Math.round((I.box[1]-TERR.Z0)/FIELD_STEP),Math.round((I.box[2]-TERR.X0)/FIELD_STEP),Math.round((I.box[3]-TERR.Z0)/FIELD_STEP)]);
 const m=mkMesh(GROUND_F,ibs.length?(i,j)=>ibs.some(ib=>i>=ib[0]&&i<ib[2]&&j>=ib[1]&&j<ib[3]):null,'The summit (ground)');
 INSETS.forEach(I=>mkMesh(I.field,null,I.label?I.label:I.name==='vent'?'The summit vent\'s cone (ground)':'A scarp of the caldera wall (ground, 2 m)'));
 /* THE TEXTURE UNITS (GPU verify 2026-11-08): the ground's fixed samplers are eleven (the paint, the detail, the rock face, the band,
    KSTRATA's five, KHORIZON's two), core/atmos's cloud shade adds its noise volume (twelve), and each KGROUND layer with a map
    takes one more: four layers fill it; the GPUs link at most 16
    (MAX_TEXTURE_IMAGE_UNITS on the Arc and the RTX; SwiftShader allows more, which is how the rebuild turn's stations passed in
    the cloud and failed on the GPU). So a layer whose weight is zero on every vertex of the ground as drawn is left out: the
    summit's four (beads, glass, spatter) where a station has no halo, rampart or glass, which frees the units its own layers take.
    Each weight is the layer's own GLSL expression evaluated per vertex on the meshes' attributes (vGL, vGM, vGX, vGY), so a layer
    that is drawn anywhere is kept. The count is window._groundUnits; verify.py asserts it against 16 in any GL */
 /* the scalar GLSL a weight may call (a station's rim pavement: smoothstep); an expression this cannot evaluate keeps its layer */
 const GF={smoothstep:(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),
  mix:(a,b,t)=>a+(b-a)*t,step:(e,x)=>x<e?0:1,min:Math.min,max:Math.max,abs:Math.abs,pow:Math.pow,sqrt:Math.sqrt};
 const kgLive=L=>{if(!L)return false;let f;try{f=new Function(...Object.keys(GF),'return function(vGL,vGM,vGX,vGY){return '+L.w+';};')(...Object.values(GF));}catch(e){return true;}
  const P=[{},{},{},{}],C='xyzw',A=['aGL','aGM','aGX','aGY'];
  try{for(const m of GROUND_MESHES){const at=A.map(k=>m.geometry.attributes[k]),n=at[0].count;
   for(let v=0;v<n;v++){for(let a=0;a<4;a++){const s=at[a].itemSize,d=at[a].array;for(let c=0;c<s;c++)P[a][C[c]]=d[v*s+c];}
    if(f(P[0],P[1],P[2],P[3])>1e-3)return true;}}}catch(e){return true;}
  return false;};
 const GLY_LIVE=GLY.filter(kgLive);
 KGROUND.hook(MAT,Object.assign({layers:GLY_LIVE,key:'godt-ground'},RELIEF?{relief:{bump:.075,cavity:.8,mesh:1,strata:.45,
  strataW:'smoothstep(0.30,0.58,1.0-clamp(normalize(vGWN).y,0.0,1.0))'}}:{}));
 window._groundLayers={kept:GLY_LIVE.map(L=>L.name||L.slot||'?'),dropped:GLY.filter(L=>L&&GLY_LIVE.indexOf(L)<0).map(L=>L.name||L.slot||'?')};
 /* the mesh's own hollows for the relief (relief.mesh: the aKGAO attribute), per mesh, once it is built */
 if(RELIEF)GROUND_MESHES.forEach(g=>KGROUND.cavityMesh(g,{rings:[3,18],depth:[.5,4]}));
 // ---- the apron: a vertical skirt 160 m deep round the map's edge, in the paint's edge colour
 {const pos=[],uvs=[],N=GROUND_F.nx-1,ed=[];for(let k=0;k<=N;k++){const f=k/N;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<N;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=terrainH(a[0],a[1]),hb=terrainH(b[0],b[1]);
   const ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-160,ub],[a,ha,ua],[b,hb-160,ub],[a,ha-160,ua]].forEach(q=>{pos.push(q[0][0],q[1],q[0][1]);uvs.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x2e2c2b,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 // ---- THE TERRAIN'S HORIZON (KHORIZON): the horizon in eight directions over the map and, past it, over the far country's
 // lattice, so at a low sun the caldera wall throws its shadow across the floor and into the pit
 const HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
  far:{h:(x,z)=>{const v=FAR.at(x,z);return v===v?v:baseH(x,z);},box:[TERR.cx-30000,TERR.cz-30000,TERR.cx+30000,TERR.cz+30000],n:200}});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
 KHORIZON.shade(MAT,HZ);GROUND_HZ=HZ;
 /* the ground's texture units, counted by core/shadow's dry run of its hooks (KSHADOW.units), against the GPUs' 16 (above); counted
    when read, so the hooks core/atmos and core/water add after this (snow and rain cover, fog belts, the wet beds) are in it */
 /* core's count sees every sampler since 2026-11-08 (precision-qualified and 3D: core/atmos's `uniform highp sampler3D uNoise`, which
    the page counted with its own pattern until then) */
 const unitsOf=M=>typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(M,renderer):99;
 Object.defineProperty(window,'_groundUnits',{configurable:true,enumerable:true,get:()=>({n:unitsOf(MAT),max:16,layers:GLY_LIVE.length})});
 window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:o=>!o.userData.farField});
 REGISTER({name:STN.title.replace('Krator Godthrone: ','The ground of ')+' (the field as drawn)',x:TERR.cx,z:TERR.cz,y:GROUND_F.stats().min-50,r:TERR.R*1.42,h:GROUND_F.max-GROUND_F.min+100,ground:true});
 GROUND=m;return m;}
