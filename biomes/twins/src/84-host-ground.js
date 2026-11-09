// ================================================================= HOST — the ground (the field as drawn)
// ONE MESH ON THE FIELD'S OWN LATTICE (KFIELD, 45c-host-field.js: 10 m), every vertex a grid point, so what is planted on the field
// stands on the ground as drawn; each inset (2 m: the skylight, the portal's trench) drawn as its own mesh in the hole the base mesh
// leaves under it. A cell wholly inside a hole the station's cavern cuts (GROUND_HOLE: a skylight, a tube's mouth) is left out: the
// cavern draws that ground with the hole in it (KCAVERN's wells; its material sits behind the ground's where they overlap at the rim).
// A vertical apron round the map hides the edge against the far country (82-host-far.js).
// THE MATERIAL: a standard one (the titanium basalt's ilmenite sheen is roughness and metalness, KSTRATA's note), painted from the kit's
// ground classes (TWINS.groundAt: the scree, the obsidian, the trodden route, the warm collars' moss, the lichens, rime and snow); the
// library's sets laid over the paint by core/terrain's KGROUND (the scree, the obsidian, the snow); every face in the rock's own beds
// (KSTRATA.shade: the tibasalt recipe) with the basalt's grain; the range's shadows from KHORIZON. Host-only. The Godthrone's, with the
// Twins' classes (biomes/godthrone/src/84-host-ground.js).
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('twins',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
let GROUND=null,GROUND_HZ=null,GROUND_MESHES=[];
const STRATA_SH=KSTRATA.shade(STRATA,{dust:0x2c2a28});
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,G={};
 // ---- the paint: the ground classes on the map, at half the texture's size (9.4 m a pixel)
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data,c=new THREE.Color(),GR=TWINS.GROUND,col=k=>new THREE.Color(GR[k].col);
  const BAS=col('basalt'),SC=col('scree'),OB=col('obsidian'),SN=col('snow'),RI=col('rime'),PA=col('path'),MO=col('moss'),LI=col('lichen'),LI2=new THREE.Color(0xa0582a);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,wx=TERR.X0+(x+.5)/w*SX,wz=TERR.Z0+(y+.5)/h*SZ,n=KRAND.h3(x,y,0,WORLD+21)-.5;
   TWINS.groundAt(wx,wz,G);
   c.copy(BAS).lerp(SC,clamp(G.scree*.9,0,1)).lerp(OB,clamp(G.obsidian,0,1));
   if(G.lichen>0)c.lerp(LI.clone().lerp(LI2,smooth(.4,.7,KRAND.vnoise(wx*.04,0,wz*.04,WORLD+22))),G.lichen*.35*smooth(.45,.7,KRAND.vnoise(wx*.09,0,wz*.09,WORLD+23)));
   if(G.path>0)c.lerp(PA,G.path*.75);if(G.moss>0)c.lerp(MO,G.moss*.85);
   if(G.rime>0)c.lerp(RI,G.rime*.35);if(G.snow>0)c.lerp(SN,clamp(G.snow*1.15,0,1));
   const k=1+n*.07;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,0,y/9,2,WORLD+24)-.5)*40+(KRAND.h3(x,y,0,WORLD+25)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const MAT=new THREE.MeshStandardMaterial({map:TEX,color:0xffffff,roughness:.96,metalness:0});
 const GLY=[KGROUND.layer('twins','scree',{w:'vGL.x*(1.0-vGL.y)',amt:.75,gain:1,tint:'vec3(0.62,0.58,0.56)'}),
  KGROUND.layer('twins','obsidian',{w:'vGL.y',amt:.8,gain:1,tint:'vec3(0.5)'}),
  KGROUND.layer('twins','snow',{w:'vGM.x',amt:.95,gain:1,tint:'vec3(1.0)'})];
 /* THE BEDS AT A DISTANCE (the Godthrone's): the tibasalt's beds are 0.1-15 m, finer than a pixel past a few hundred metres; the column's
    colour averaged over 6 m, its contrast with the column's mean raised 1.6x, is what a far face shows (faded in from 150 to 600 m) */
 const BAND=(function(){const y0=STRATA.range[0],y1=STRATA.range[1],st=6,n=Math.ceil((y1-y0)/st),lin=new Float32Array(n*3),mean=[0,0,0];
  for(let i=0;i<n;i++){let r=0,g=0,b=0;for(let k=0;k<24;k++){const c=STRATA.colorAt(y0+i*st+(k+.5)*st/24);r+=Math.pow(c[0],2.2);g+=Math.pow(c[1],2.2);b+=Math.pow(c[2],2.2);}
   lin[i*3]=r/24;lin[i*3+1]=g/24;lin[i*3+2]=b/24;mean[0]+=r/24/n;mean[1]+=g/24/n;mean[2]+=b/24/n;}
  const d=new Uint8Array(n*4);for(let i=0;i<n;i++){for(let c=0;c<3;c++){const v=Math.max(0,mean[c]+(lin[i*3+c]-mean[c])*1.6);d[i*4+c]=Math.round(clamp(Math.pow(v,1/2.2),0,1)*255);}d[i*4+3]=255;}
  const t=new THREE.DataTexture(d,n,1,THREE.RGBAFormat);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.needsUpdate=true;
  return{t,y0,k:1/(y1-y0)};})();
 MAT.onBeforeCompile=sh=>{sh.uniforms.uBand={value:BAND.t};sh.uniforms.uBandR={value:new THREE.Vector2(BAND.y0,BAND.k)};
  /* THE MAP'S EDGE: within 700 m of the square's edge the flat ground eases into the far country's scree colour (82-host-far.js FAR.C) */
  sh.uniforms.uBox={value:new THREE.Vector4(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1)};sh.uniforms.uFarC={value:new THREE.Vector3(...FAR.C.scree)};
  sh.uniforms.uDetail={value:hostGroundLib('groundDetail',DET)};sh.uniforms.uRockFace={value:hostGroundLib('rockFace',DET)};
  STRATA_SH.inject(sh);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec3 aGL;attribute vec4 aGM;varying vec3 vGL;varying vec4 vGM;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGM=aGM;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRockFace;varying vec3 vGWP;varying vec3 vGWN;varying vec3 vGL;varying vec4 vGM;float gRockW;uniform sampler2D uBand;'+KHOOK.EYE+'uniform vec2 uBandR;uniform vec4 uBox;uniform vec3 uFarC;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    /* the detail: the library's cinder as a grey multiply, decoded from sRGB and scaled back to its mean of 0.9 (materials.json) */
    '{vec3 dt=pow(texture2D(uDetail,vGWP.xz*0.21).rgb,vec3(2.2))*1.134;vec3 dt2=pow(texture2D(uDetail,vGWP.xz*0.031+0.37).rgb,vec3(2.2))*1.134;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);',
    '/*KGROUND*/',
    // the rock: wherever the ground is steep, its own beds (KSTRATA's tibasalt), the basalt's grain on the face's plane
    ' float steep=1.0-clamp(vGWN.y,0.0,1.0);gRockW=smoothstep(0.30,0.58,steep);',
    ' vec2 fp=abs(vGWN.x)>abs(vGWN.z)?vec2(vGWP.z,vGWP.y):vec2(vGWP.x,vGWP.y);',
    ' vec3 rf=pow(texture2D(uRockFace,fp*0.11).rgb,vec3(2.2))*1.9;',
    ' vec3 sc=strataColor(vSWP,vSWN)*mix(vec3(1.0),rf,0.7);',
    ' {float w1b;float yyb=ksYY(vSWP,w1b);vec3 band=pow(texture2D(uBand,vec2((yyb-uBandR.x)*uBandR.y,0.5)).rgb,vec3(2.2))*mix(vec3(1.0),rf,0.5);',
    '  sc=mix(sc,band,smoothstep(150.0,600.0,length(vGWP-kEye())));}',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,gRockW);',
    // rime on the faces (the wind's fog freezes on the rock, more on the shaded side), snow on the ledges where it holds
    ' diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.66,0.71,0.76),vGM.y*gRockW*0.45);',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.86,0.89,0.93),vGM.x*gRockW*smoothstep(0.75,0.45,steep));',
    ' {float ed=min(min(vGWP.x-uBox.x,uBox.z-vGWP.x),min(vGWP.z-uBox.y,uBox.w-vGWP.z));',
    '  diffuseColor.rgb=mix(diffuseColor.rgb,uFarC,0.6*smoothstep(700.0,40.0,ed)*(1.0-gRockW)*(1.0-vGM.x));}}'].join('\n'))
   .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.84,gRockW);roughnessFactor=mix(roughnessFactor,0.42,vGL.y*0.9);roughnessFactor=mix(roughnessFactor,0.7,vGM.x*0.8);')
   .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,0.1,gRockW);metalnessFactor=mix(metalnessFactor,0.06,vGL.y);');};   /* the ilmenite sheen; the obsidian's glass */
 MAT.customProgramCacheKey=()=>'twins-ground';
 /* THE GROUND'S RELIEF (core/terrain/GROUND.md, as the Godthrone takes it): a derivative bump from the layers' blended height, cavity
    occlusion, the mesh's own hollows and the tibasalt's bed relief on the steep. ?kgrelief=0 draws the ground without it */
 const RELIEF=new URLSearchParams(location.search).get('kgrelief')!=='0';
 // ---- the meshes: the base lattice (its cells under the insets and in the cavern's holes left out) and each inset
 const inHole=(x,z)=>!!(GROUND_HOLE&&GROUND_HOLE(x,z));
 const mkMesh=(F,skip,label)=>{const nx=F.nx,nz=F.nz,n=nx*nz,pos=new Float32Array(n*3),uv=new Float32Array(n*2),aGL=new Float32Array(n*3),aGM=new Float32Array(n*4),hole=new Uint8Array(n);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=F.x0+i*F.step,z=F.z0+j*F.step;
   pos[k*3]=x;pos[k*3+1]=F.heights[k];pos[k*3+2]=z;uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;hole[k]=inHole(x,z)?1:0;
   TWINS.groundAt(x,z,G);aGL[k*3]=G.scree;aGL[k*3+1]=G.obsidian;aGL[k*3+2]=G.path;aGM[k*4]=G.snow;aGM[k*4+1]=G.rime;aGM[k*4+2]=G.moss;aGM[k*4+3]=G.lichen;}
  const idx=[];let holes=0;for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){if(skip&&skip(i,j))continue;const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
   if(hole[a]&&hole[b]&&hole[c]&&hole[d]){holes++;continue;}idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('aGL',new THREE.BufferAttribute(aGL,3));g.setAttribute('aGM',new THREE.BufferAttribute(aGM,4));g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx),1));
  g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,MAT);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.userData.holes=holes;scene.add(m);GROUND_MESHES.push(m);return m;};
 const ibs=INSETS.map(I=>[Math.round((I.box[0]-TERR.X0)/FIELD_STEP),Math.round((I.box[1]-TERR.Z0)/FIELD_STEP),Math.round((I.box[2]-TERR.X0)/FIELD_STEP),Math.round((I.box[3]-TERR.Z0)/FIELD_STEP)]);
 const m=mkMesh(GROUND_F,ibs.length?(i,j)=>ibs.some(ib=>i>=ib[0]&&i<ib[2]&&j>=ib[1]&&j<ib[3]):null,STN.title.replace('Krator Twins: ','')+' (ground)');
 INSETS.forEach(I=>mkMesh(I.field,null,I.label||I.name));
 /* THE TEXTURE UNITS (the Godthrone's GPU lesson, 2026-11-08: the GPUs link at most 16): the ground's fixed samplers are eleven (the
    paint, the detail, the rock face, the band, KSTRATA's five, KHORIZON's two), core/atmos's cloud noise twelve, and each KGROUND layer
    with a map one more: three layers here, fifteen. A layer whose weight is zero on every vertex as drawn is left out (the Godthrone's
    kgLive, its GLSL weight evaluated per vertex); the count is window._groundUnits, which verify.py asserts against 16 in any GL */
 const GF={smoothstep:(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),
  mix:(a,b,t)=>a+(b-a)*t,step:(e,x)=>x<e?0:1,min:Math.min,max:Math.max,abs:Math.abs,pow:Math.pow,sqrt:Math.sqrt};
 const kgLive=L=>{if(!L)return false;let f;try{f=new Function(...Object.keys(GF),'return function(vGL,vGM){return '+L.w.replace(/(\d)\.0\b/g,'$1')+';};')(...Object.values(GF));}catch(e){return true;}
  const P=[{},{}],C='xyzw',A=['aGL','aGM'];
  try{for(const m of GROUND_MESHES){const at=A.map(k=>m.geometry.attributes[k]),n=at[0].count;
   for(let v=0;v<n;v++){for(let a=0;a<2;a++){const s=at[a].itemSize,d=at[a].array;for(let c=0;c<s;c++)P[a][C[c]]=d[v*s+c];}
    if(f(P[0],P[1])>1e-3)return true;}}}catch(e){return true;}
  return false;};
 const GLY_LIVE=GLY.filter(kgLive);
 KGROUND.hook(MAT,Object.assign({layers:GLY_LIVE,key:'twins-ground'},RELIEF?{relief:{bump:.075,cavity:.8,mesh:1,strata:.45,
  strataW:'smoothstep(0.30,0.58,1.0-clamp(normalize(vGWN).y,0.0,1.0))'}}:{}));
 window._groundLayers={kept:GLY_LIVE.map(L=>L.name||L.slot||'?'),dropped:GLY.filter(L=>L&&GLY_LIVE.indexOf(L)<0).map(L=>L.name||L.slot||'?')};
 if(RELIEF)GROUND_MESHES.forEach(g=>KGROUND.cavityMesh(g,{rings:[3,18],depth:[.5,4]}));
 // ---- the apron: a vertical skirt 160 m deep round the map's edge, in the paint's edge colour
 {const pos=[],uvs=[],N=GROUND_F.nx-1,ed=[];for(let k=0;k<=N;k++){const f=k/N;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<N;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=terrainH(a[0],a[1]),hb=terrainH(b[0],b[1]);
   const ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-160,ub],[a,ha,ua],[b,hb-160,ub],[a,ha-160,ua]].forEach(q=>{pos.push(q[0][0],q[1],q[0][1]);uvs.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x2e2c2b,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 // ---- THE TERRAIN'S HORIZON (KHORIZON): the horizon in eight directions over the map and, past it, over the far country's lattice, so
 // at a low sun the range and the Twins' cones throw their shadows across the slope
 const HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
  far:{h:(x,z)=>{const v=FAR.at(x,z);return v===v?v:baseH(x,z);},box:[TERR.cx-30000,TERR.cz-30000,TERR.cx+30000,TERR.cz+30000],n:200}});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
 KHORIZON.shade(MAT,HZ);GROUND_HZ=HZ;
 const unitsOf=M=>typeof KSHADOW!=='undefined'&&KSHADOW.units?KSHADOW.units(M,renderer):99;
 Object.defineProperty(window,'_groundUnits',{configurable:true,enumerable:true,get:()=>({n:unitsOf(MAT),max:16,layers:GLY_LIVE.length})});
 window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:o=>!o.userData.farField&&!o.userData.cavern});
 REGISTER({name:STN.title.replace('Krator Twins: ','The ground of ')+' (the field as drawn)',x:TERR.cx,z:TERR.cz,y:GROUND_F.stats().min-50,r:TERR.R*1.42,h:GROUND_F.max-GROUND_F.min+100,ground:true});
 GROUND=m;return m;}
