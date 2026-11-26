// ================================================================= HOST — the ground and the mist
// One ground mesh painted from the kit's own zones (SWHI.zones: the coves, the crests' turf, the bald's heath, the farm's fields
// agree with what grows on them), THE CANOPY'S SHADE baked into the paint (built after the trees), the library's ground sets on
// core/terrain's ground shader (KGROUND: the native moss, the turf, the banks' gravel, the farm's tilled soil, by the same zone
// weights), and the folds' beds on every steep face (KSTRATA's strataColor, the stack of 47-host-land.js: the chevron over the
// cave shows in the ground's own cliff as in the hood). The base mesh is a 6 m grid; over the gorge and the cave a 2 m inset
// takes its place (its edge vertices on the base grid's lines, so no crack). KHORIZON shades it and everything on the land.
// A vertical apron round the map's edge hides the seam with the far country. Host-only.
let GROUND=null,GROUND_HZ=null,GROUND_INSET=null,GROUND_INSETS=[];
const GROUND_STEP=6,INSETS=[{x0:744,x1:1236,z0:-1320,z1:-384,step:2,name:'The limestone ridge (the gorge and the cave)'},{x0:396,x1:474,z0:-468,z1:-384,step:2,name:'The mouth of the cave stream'}],INSET=INSETS[0];   /* each on the 6 m grid's lines; 45-host-stage.js bakes the field's insets at the same boxes */
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,ZN=256;
 // the zones on a coarse lattice
 const ZK=['forest','cove','crest','bald','farm','wet','flow','valley','rock'],ZL={};ZK.forEach(k=>ZL[k]=new Float32Array(ZN*ZN));
 for(let j=0;j<ZN;j++)for(let i=0;i<ZN;i++){const x=TERR.X0+(i+.5)/ZN*SX,z=TERR.Z0+(j+.5)/ZN*SZ,Z=SWHI.zones(x,z);ZK.forEach(k=>ZL[k][j*ZN+i]=Z[k]);}
 const zat=(k,u,v)=>{const A=ZL[k],fu=clamp(u*ZN-.5,0,ZN-1.001),fv=clamp(v*ZN-.5,0,ZN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return A[j*ZN+i]*(1-a)*(1-b)+A[j*ZN+i+1]*a*(1-b)+A[(j+1)*ZN+i]*(1-a)*b+A[(j+1)*ZN+i+1]*a*b;};
 // the canopy's shade: every crown splatted (a soft disc, offset down-sun), at a quarter of the paint's resolution
 const SN=TW/4,SH=new Float32Array(SN*SN),sd=[-SUN_POS[0],-SUN_POS[2]],sl=Math.hypot(sd[0],sd[1]);sd[0]/=sl;sd[1]/=sl;
 for(const T of SWHI.TREES){if(T.H<6)continue;const R=T.crownR*.95,off=Math.min(T.H*.25,12),cx=T.x+sd[0]*off,cz=T.z+sd[1]*off,k=T.H>20?.5:.3;
  const pr=R/SX*SN,pi=(cx-TERR.X0)/SX*SN,pj=(cz-TERR.Z0)/SZ*SN;
  for(let j=Math.max(0,Math.floor(pj-pr));j<=Math.min(SN-1,Math.ceil(pj+pr));j++)for(let i=Math.max(0,Math.floor(pi-pr));i<=Math.min(SN-1,Math.ceil(pi+pr));i++){const d=Math.hypot(i-pi,j-pj)/Math.max(.5,pr);if(d<1)SH[j*SN+i]=1-(1-SH[j*SN+i])*(1-k*(1-d*d));}}
 const sat=(u,v)=>{const fu=clamp(u*SN-.5,0,SN-1.001),fv=clamp(v*SN-.5,0,SN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return SH[j*SN+i]*(1-a)*(1-b)+SH[j*SN+i+1]*a*(1-b)+SH[(j+1)*SN+i]*(1-a)*b+SH[(j+1)*SN+i+1]*a*b;};
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{
  // painted at half the texture's size (4.7 m a pixel) and scaled up by the canvas: every input is smoother than that
  const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data;
  const C=x=>new THREE.Color(x),c=new THREE.Color(),t=new THREE.Color();
  const MOSS=C(0x34482a),MOSS2=C(0x3e5630),LITTER=C(0x463a36),COVE=C(0x26382a),COVE2=C(0x243c3a),TURF=C(0x5e7a48),TURF2=C(0x6e8a52),
   HEATH=C(0x74868a),PINK=C(0xa86a7c),ORANGE=C(0xb27a44),ROCK=C(0x8a7e6e),BANK=C(0x86826f),PAST=C(0x789a48),HAY=C(0xae9e52),TILL=C(0x6a5236),CROP=C(0x6e8c3a);
  const NL=(n,f,s)=>{const A=new Float32Array((n+1)*(n+1));for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)A[j*(n+1)+i]=NZ(TERR.X0+i/n*SX,TERR.Z0+j/n*SZ,f,s,2);return A;};
  const N2=w,N3=w/2,L2=NL(N2,.011,41),L3=NL(N3,.0032,53);
  const lat=(A,n,u,v)=>{const fu=u*n,fv=v*n,i=Math.min(n-1,Math.floor(fu)),j=Math.min(n-1,Math.floor(fv)),a=fu-i,b=fv-j,r=n+1;return A[j*r+i]*(1-a)*(1-b)+A[j*r+i+1]*a*(1-b)+A[(j+1)*r+i]*(1-a)*b+A[(j+1)*r+i+1]*a*b;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=(y+.5)/h,wx=TERR.X0+u*SX,wz=TERR.Z0+v*SZ;
   const n=KRAND.h3(x,y,3,77)-.5,n2=lat(L2,N2,u,v),n3=lat(L3,N3,u,v);
   const fo=zat('forest',u,v),cv2=zat('cove',u,v),cr=zat('crest',u,v),bd=zat('bald',u,v),fm=zat('farm',u,v),fl=zat('flow',u,v);
   // the forest floor: native moss, the litter of the pads and cords
   c.copy(MOSS).lerp(MOSS2,clamp(.5+n2*2.4,0,1)).lerp(LITTER,clamp(smooth(.0,.3,-n3)*.45+smooth(.2,.5,n2)*.25,0,.6));
   // the coves: darker and wetter, teal in the seeps
   if(cv2>0)c.lerp(t.copy(COVE).lerp(COVE2,smooth(-.1,.25,n3)),cv2*.75);
   // the crests: turf, paler on the open ground
   c.lerp(t.copy(TURF).lerp(TURF2,clamp(.5+n2*2,0,1)),clamp(cr*(1-fo*.6)+cr*.25,0,1));
   // the bald: the bulb heath's blue-grey, flecked pink and orange where it flowers
   if(bd>0){t.copy(HEATH).lerp(TURF,clamp(.4+n2*2,0,.6)).lerp(PINK,smooth(.15,.32,n2+n*.3)*.5).lerp(ORANGE,smooth(.2,.36,-n2+n*.3)*.35);c.lerp(t,bd*.9);}
   // the farm: pasture, hay and arable by enclosure (KRELIEF.fields), the arable mottled tilled and green
   if(fm>0){const F=FARM_FIELDS.at(wx,wz);t.copy(F.kind==='hay'?HAY:F.kind==='arable'?TILL:PAST);if(F.kind==='arable')t.lerp(CROP,smooth(-.05,.2,n2));c.lerp(t,fm);}
   // the banks' gravel, the steep's rock (the shader draws the beds over it)
   if(!KCARVE.keepOut(wx,wz,4))c.lerp(BANK,smooth(.84,.98,fl)*.65);c.lerp(ROCK,smooth(.7,1.1,FC.at(FC.a.slope,wx,wz)));
   const sh=sat(u,v);c.multiplyScalar(1-.6*sh*(1-fm));
   const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 /* THE GROUND'S DETAIL IS COMPUTED, NOT SAMPLED (2026-11-08): the 256 px detail canvas (uDetail) was the seventeenth texture unit
    on the ground's MeshStandard program (KGROUND's four layers, KSTRATA's five, KHORIZON's two, the rain cover, the water's hollows,
    the cloud noise, the map, the rock grain), past MAX_TEXTURE_IMAGE_UNITS 16 on ANGLE/D3D11 (Arc 140T, RTX 5060): the program
    failed to link ("FRAGMENT shader texture image units count exceeds") and the ground went undrawn. SWH_DET is the same grey
    (232 +- an fbm at 9 texels over 5 octaves +- a per-texel grain, /255) as value noise in the canvas's texel units, each octave
    faded out as it nears the pixel (fwidth), where the canvas's mips blurred it */
 const SWH_DET='float swhH(vec2 p){vec3 q=fract(vec3(p.xyx)*0.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}'+
  'float swhN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(swhH(i),swhH(i+vec2(1.0,0.0)),f.x),mix(swhH(i+vec2(0.0,1.0)),swhH(i+vec2(1.0,1.0)),f.x),f.y);}'+
  'float swhDet(vec2 q){float fw=max(length(fwidth(q)),1e-4),s=0.0,a=0.5;vec2 p=q/9.0;for(int o=0;o<5;o++){s+=a*(swhN(p)-0.5)*(1.0-smoothstep(0.25,0.5,fw*exp2(float(o))/9.0));p*=2.0;a*=0.5;}'+
  'return 0.9098+s*0.157+(swhN(q+17.0)-0.5)*0.094*(1.0-smoothstep(0.25,0.5,fw));}';
 // the library's ground sets by zone (KGROUND, core/terrain 43): the native moss under the forest, the turf on the crests and
 // the bald and the pasture, the gravel on the banks, the tilled soil on the arable; hex-tiled, scaled with distance
 const GLY=(function(){const A=KGROUND.layer('swhighlands','ground.moss',{w:'vGL.x',amt:.55,gain:.95,tint:'diffuse'}),Bq=KGROUND.layer('swhighlands','ground.turf',{w:'vGL.y',amt:.55,gain:1.0,tint:'diffuse'});
  return A&&Bq?[A,Bq,KGROUND.layer('swhighlands','ground.gravel',{w:'vGL.z',amt:.75,gain:1.1,tint:'diffuse'}),KGROUND.layer('swhighlands','ground.tilled',{w:'vGL.w',amt:.7,gain:1.1,tint:'diffuse'})]:[];})();
 /* THE GROUND'S LIGHT PER PIXEL (2026-11-04, the ground catch-up; core/terrain/GROUND.md): on KGROUND the ground is MeshStandard, so
    the relief's bump and cavities reach the light (r128's Lambert lights per vertex); without the pack, or with ?kground=0, the Lambert.
    ?kgrelief=0 drops the relief (the before-and-after on this page) */
 const KG_RELIEF=GLY.length>0&&new URLSearchParams(location.search).get('kgrelief')!=='0';
 const MAT=GLY.length?new THREE.MeshStandardMaterial({map:TEX,color:0x84847a,roughness:.96,metalness:0}):new THREE.MeshLambertMaterial({map:TEX,color:0x84847a});
 /* THE GROUND'S HOLLOWS (KGROUND.cavity, relief.mesh; 2026-11-04, the ground catch-up): one field on a 12 m grid over the square,
    from the height, read by every piece of the ground (bilinear), so the pieces meet with no seam in the shade. The valley term's depth
    is 30 m, not the core's 4: on these folds and cliffs 4 m saturated a 200 m band at every foot to black (judged on the pillars'
    cliff, 2026-11-04); with relief.mesh .7 the foot of a cliff and the gullies read a shade darker, no more */
 const KGCAV=KG_RELIEF?(function(){const st=12,nx=Math.round(SX/st),nz=Math.round(SZ/st),W=nx+1,n=W*(nz+1),P=new Float32Array(n*3),I=new Uint32Array(nx*nz*6);let t=0;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*W+i,x=TERR.X0+i*SX/nx,z=TERR.Z0+j*SZ/nz;P[3*k]=x;P[3*k+1]=terrainH(x,z);P[3*k+2]=z;}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*W+i;I[t++]=a;I[t++]=a+W;I[t++]=a+1;I[t++]=a+1;I[t++]=a+W;I[t++]=a+W+1;}
  const A=KGROUND.cavity({pos:P,index:I,count:n},{rings:[3,18],depth:[1.5,30]});
  return (x,z)=>{const u=clamp((x-TERR.X0)/SX*nx,0,nx),v=clamp((z-TERR.Z0)/SZ*nz,0,nz),i=Math.min(nx-1,Math.floor(u)),j=Math.min(nz-1,Math.floor(v)),fu=u-i,fv=v-j,k=j*W+i;
   return (A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+W]*(1-fu)+A[k+W+1]*fu)*fv;};})():null;
 const kgCav=mesh=>{if(!KGCAV)return mesh;const p=mesh.geometry.attributes.position,a=new Float32Array(p.count);for(let i=0;i<p.count;i++)a[i]=KGCAV(p.getX(i),p.getZ(i));
  mesh.geometry.setAttribute('aKGAO',new THREE.BufferAttribute(a,1));return mesh;};
 MAT.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;varying vec4 vGL;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGL=aGL;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+SWH_DET+'uniform sampler2D uRG;uniform float uRGs;varying vec4 vGL;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{float dt=swhDet(vSWP.xz*43.52),dt2=swhDet(vSWP.xz*5.888+94.72);diffuseColor.rgb*=mix(vec3(1.0),vec3(dt*dt2*1.12),0.85);',
    '/*KGROUND*/',
    // the folds' beds on the steep (strataColor is linear, as the paint is once decoded)
    ' float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);',
    // the rock's grain on three planes (the rock bodies' map): the steep reads as rock, not a smear (the owner, 2026-10-26)
    ' vec3 rn=abs(normalize(vSWN));rn/=rn.x+rn.y+rn.z;vec3 rt=texture2D(uRG,vSWP.zy*uRGs).rgb*rn.x+texture2D(uRG,vSWP.xz*uRGs).rgb*rn.y+texture2D(uRG,vSWP.xy*uRGs).rgb*rn.z;',
    ' vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.72)*1.25*clamp(pow(dot(rt,vec3(0.333))/0.47,1.3),0.4,1.7);',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,smoothstep(0.36,0.62,steep)*0.92);}'].join('\n'));};
 KGROUND.hook(MAT,{layers:GLY,key:'swhi-ground',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:.7}:null});   /* the relief (no texture unit) and the hollows (kgCav) */
 // THE TERRAIN'S HORIZON (KHORIZON): eight directions over the map (256 a side, ~19 m) and, past it, the far country's lattice,
 // so a low sun throws the folds' shadows across the strike valleys
 const HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
  far:{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
 KHORIZON.shade(MAT,HZ);GROUND_HZ=HZ;
 window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!m.userData.farField});
 // the zone weights per vertex: x the forest's moss, y the turf (crest, bald, pasture and hay), z the banks, w the arable
 const glAt=(x,z)=>{const u=(x-TERR.X0)/SX,v=(z-TERR.Z0)/SZ,fm=zat('farm',u,v);let ar=0;if(fm>0){const F=FARM_FIELDS.at(x,z);ar=F.kind==='arable'?fm:0;}
  return[zat('forest',u,v)*(1-zat('crest',u,v)*.6),Math.max(zat('crest',u,v)*(1-zat('forest',u,v)*.5),zat('bald',u,v),fm-ar),smooth(.84,.98,zat('flow',u,v))*(KCARVE.keepOut(x,z,4)?0:1),ar];};   /* no bank gravel over the cave (its stream runs underground) */
 // a grid mesh over [x0,x1]x[z0,z1] at step; hole: a box whose cells are left out; edge(x,z): the height on the inset's rim
 const grid=(x0,z0,x1,z1,step,hole,hAt)=>{const nx=Math.round((x1-x0)/step),nz=Math.round((z1-z0)/step),N=(nx+1)*(nz+1),pos=new Float32Array(N*3),uv=new Float32Array(N*2),gl=new Float32Array(N*4),idx=[];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*(nx+1)+i,x=x0+i*step,z=z0+j*step;pos[k*3]=x;pos[k*3+1]=hAt(x,z,i,j,nx,nz);pos[k*3+2]=z;
   uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;const w4=glAt(x,z);gl.set(w4,k*4);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cx=x0+(i+.5)*step,cz=z0+(j+.5)*step;if(hole&&hole.some(H=>cx>H.x0&&cx<H.x1&&cz>H.z0&&cz<H.z1))continue;
   const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
  g.setIndex(N>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));g.computeVertexNormals();return g;};
 const g=grid(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1,GROUND_STEP,INSETS,(x,z)=>terrainH(x,z));
 const m=kgCav(new THREE.Mesh(g,MAT));m.userData.probeSkip=true;m.userData.inspectLabel='The ring folds (ground)';scene.add(m);
 // the inset: on its rim the height runs straight between the base grid's vertices, so the two meshes meet exactly
 const S6=GROUND_STEP;GROUND_INSETS=INSETS.map(IN=>{const gi=grid(IN.x0,IN.z0,IN.x1,IN.z1,IN.step,null,(x,z,i,j,nx,nz)=>{
  const rim=i===0||j===0||i===nx||j===nz;if(!rim)return terrainH(x,z);
  if(i===0||i===nx){const z0=IN.z0+Math.floor((z-IN.z0)/S6+1e-9)*S6,f=(z-z0)/S6;return f<1e-6?terrainH(x,z0):mix(terrainH(x,z0),terrainH(x,z0+S6),f);}
  const x0=IN.x0+Math.floor((x-IN.x0)/S6+1e-9)*S6,f=(x-x0)/S6;return f<1e-6?terrainH(x0,z):mix(terrainH(x0,z),terrainH(x0+S6,z),f);});
  const mi=kgCav(new THREE.Mesh(gi,MAT));mi.userData.probeSkip=true;mi.userData.inspectLabel=IN.name;scene.add(mi);return mi;});GROUND_INSET=GROUND_INSETS[0];
 // the apron: a vertical skirt 60 m deep round the square's edge, in the paint's edge colour
 {const pos=[],uvs=[],N=400,ed=[];for(let k=0;k<=N;k++){const f=k/N;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<N;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=terrainH(a[0],a[1]),hb=terrainH(b[0],b[1]);
   const ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-60,ub],[a,ha,ua],[b,hb-60,ub],[a,ha-60,ua]].forEach(q=>{pos.push(q[0][0],q[1],q[0][1]);uvs.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x8a8a82,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 /* THE CAVE'S HOOD ON THE GROUND'S MATERIAL (core/terrain KCARVE.mesh attrs; the owner, 2026-10-26: from above it read as a rock block
    lying on the hill): its top is the hill's paint and turf, its steep face the beds, one surface */
 {const sd=new THREE.Vector3(SUN_POS[0],SUN_POS[1],SUN_POS[2]).normalize();
  try{CAVE_MESHES=KCARVE.mesh(MAT,{sun:[sd.x,sd.y,sd.z],ao:true,cast:'hood',gridNormals:true,
   attrs:{uv:{size:2,fn:(x,y,z)=>[(x-TERR.X0)/SX,1-(z-TERR.Z0)/SZ]},aGL:{size:4,fn:(x,y,z)=>glAt(x,z)}}});}catch(e){reportErr('cave: '+e.stack);}
  CAVE_MESHES.forEach(cm=>{kgCav(cm);cm.userData.host=true;cm.userData.rock=true;cm.userData.inspectLabel='The river cave (its mouth in the limestone ridge)';
   cm.userData.probePoints=[CAVE.c[0]+CAVE.depth*.4,BITE.floor+CAVE.h*.5,CAVE.c[1]];   /* the probe reads it at the mouth, inside its registered volume */scene.add(cm);});}
 GROUND=m;return m;}

// ---------------------------------------------------------------- the mist
// Sheets lying in the strike valleys and the gaps (they read from above) and soft sprites standing in them (from the ground),
// drifting and keeping to the ground's height; two draw calls. Placed by KRAND, not by a stream of draws.
const MIST=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-64)/64,dy=(y-64)/64,r=Math.hypot(dx,dy),a=clamp(1-r,0,1)*(.55+.45*KRAND.fbm(x/22,.2,y/22,3,3));
  const o=(y*128+x)*4;id.data[o]=id.data[o+1]=id.data[o+2]=255;id.data[o+3]=clamp(a*a*255,0,255);}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);
 const sheetM=new THREE.MeshBasicMaterial({map:tex,color:0xd0dada,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
 const spriteM=new THREE.MeshBasicMaterial({map:tex,color:0xd0dada,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
 const L=[],U=(i,k)=>KRAND.unit(KRAND.hash(WORLD,i,k,0x3157)),R=(i,k,a,b)=>a+(b-a)*U(i,k);
 const place=(i,kind,x,z,lift)=>{let w,d,rz=0;if(kind==='sheet'){w=R(i,1,140,300);d=R(i,2,70,150);rz=R(i,3,0,TAU);}else{const s=R(i,4,80,200);w=s;d=s*R(i,5,.35,.55);}
  L.push({kind,w,d,c:Math.cos(rz),s:Math.sin(rz),ax:x,az:z,lift,ph:R(i,6,0,TAU),sp:R(i,7,.015,.04),amp:R(i,8,30,70)});};
 for(let k=0;k<20;k++){const C=RIVER,p=C.pts[Math.floor(U(k,9)*C.pts.length)];place(k,k%2?'sheet':'sprite',p[0]+R(k,10,-40,40),p[1]+R(k,11,-40,40),R(k,12,4,12));}
 GORGE.falls.forEach((F,i)=>place(100+i,'sprite',F.x,F.z,6));place(110,'sprite',BITE.x-20,BITE.z,8);
 let n=0;for(let i=0;i<4000&&n<40;i++){const x=R(i,20,TERR.X0+200,TERR.X1-200),z=R(i,21,TERR.Z0+200,TERR.Z1-200),mi=FC.at(FC.a.mist,x,z);if(U(i,22)>mi)continue;place(200+n,n%3||FC.at(FC.a.valley,x,z)<.5?'sprite':'sheet',x,z,R(i,23,6,24));n++;}
 const mk=(list,mat,name)=>{const g=new THREE.BufferGeometry(),N=list.length,pos=new Float32Array(N*12),uv=new Float32Array(N*8),ix=[];
  for(let i=0;i<N;i++){uv.set([0,0,1,0,1,1,0,1],i*8);const b=i*4;ix.push(b,b+1,b+2,b,b+2,b+3);}
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(ix);
  const o=new THREE.Mesh(g,mat);o.frustumCulled=false;o.renderOrder=3;o.userData.probeSkip=true;o.userData.noSnow=true;o.name=name;o.raycast=()=>{};scene.add(o);return{o,pos,list};};
 const SH=mk(L.filter(m=>m.kind==='sheet'),sheetM,'mist:sheets'),SP=mk(L.filter(m=>m.kind==='sprite'),spriteM,'mist:sprites');
 const at=(m,t)=>{const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;return[x,FC.at(FC.a.h,x,z)+m.lift,z];};
 const step=t=>{SH.list.forEach((m,i)=>{const p=at(m,t),hw=m.w/2,hd=m.d/2,P=SH.pos,o=i*12;
   [[-hw,hd],[hw,hd],[hw,-hd],[-hw,-hd]].forEach((q,k)=>{P[o+k*3]=p[0]+q[0]*m.c-q[1]*m.s;P[o+k*3+1]=p[1];P[o+k*3+2]=p[2]-q[0]*m.s-q[1]*m.c;});});
  const e=camera.matrixWorld.elements,rx=e[0],ry=e[1],rz2=e[2],ux=e[4],uy=e[5],uz=e[6];
  SP.list.forEach((m,i)=>{const p=at(m,t),hw=m.w/2,hh=m.d/2,P=SP.pos,o=i*12;
   [[-1,-1],[1,-1],[1,1],[-1,1]].forEach((q,k)=>{const a=q[0]*hw,b=q[1]*hh;P[o+k*3]=p[0]+rx*a+ux*b;P[o+k*3+1]=p[1]+ry*a+uy*b;P[o+k*3+2]=p[2]+rz2*a+uz*b;});});
  SH.o.geometry.attributes.position.needsUpdate=true;SP.o.geometry.attributes.position.needsUpdate=true;};
 step(0);tick((dt,t)=>step(t));
 return{L,sheetM,spriteM};})();
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(mode=>{
 const S={day:[0xd0dada,.30,.22],dawn:[0xffd6a8,.48,.46],night:[0x4a5868,.24,.18]}[mode]||[0xd0dada,.3,.22];
 MIST.sheetM.color.set(S[0]);MIST.spriteM.color.set(S[0]);MIST.sheetM.opacity=S[1];MIST.spriteM.opacity=S[2];});
