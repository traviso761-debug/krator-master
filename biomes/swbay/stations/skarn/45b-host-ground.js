// ================================================================= HOST — the ground, the beds, the far country (station 3, the skarn-marble cliffs)
// After the stage (45) and the model's relief (45a5, REGION, read in place from biomes/godthrone/src): the height lattices, the host
// binding (BIO.init), THE BEDS (core/terrain KSTRATA: contact-marble with its epidote, garnet and magnetite selvages over -16..189 m,
// tonguing south-east into carbonate-shelf below 59 m, the plan's -1,515..-1,440 m; the unbaked platform over both), the ground (one
// material: the soil's paint and the library's litter and dry earth on the gentle, the beds on the steep and on the bare pavements, the
// magnetite seams' glint), and the far country (KFAR) from the scale model's relief out to 30 km.

// ---------------------------------------------------------------- the height lattices (the drawn ground's own vertices)
// groundH baked once on the two lattices the ground is drawn on: 2 m over NEAR, 8 m over TERR; their bilinear height and slope (central
// differences, and a wider one: 4 m on NEAR, 16 m on TERR) are what the mask, the fields and the checks read, so a plant stands where
// the drawn ground is gentle, not where an exact sample between two vertices happens to be
const HL=(function(){const t0=performance.now();
 const make=(X0,Z0,X1,Z1,st)=>{const nx=Math.round((X1-X0)/st),nz=Math.round((Z1-Z0)/st),W=nx+1,H=new Float32Array(W*(nz+1)),S=new Float32Array(W*(nz+1)),S2=new Float32Array(W*(nz+1));
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)H[j*W+i]=groundH(X0+i*st,Z0+j*st);
  const g=(i,j)=>H[clamp(j,0,nz)*W+clamp(i,0,nx)];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){S[j*W+i]=Math.max(Math.abs(g(i+1,j)-g(i-1,j)),Math.abs(g(i,j+1)-g(i,j-1)))/(2*st);
   S2[j*W+i]=Math.max(Math.abs(g(i+2,j)-g(i-2,j)),Math.abs(g(i,j+2)-g(i,j-2)))/(4*st);}
  const bil=(A,x,z)=>{const u=clamp((x-X0)/st,0,nx-1e-6),v=clamp((z-Z0)/st,0,nz-1e-6),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*W+i;
   return (A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+W]*(1-fu)+A[k+W+1]*fu)*fv;};
  return{X0,Z0,X1,Z1,st,nx,nz,W,H,S,S2,h:(x,z)=>bil(H,x,z),s:(x,z)=>bil(S,x,z),s2:(x,z)=>bil(S2,x,z)};};
 const N=make(NEAR.X0,NEAR.Z0,NEAR.X1,NEAR.Z1,2),C=make(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1,8);
 const inN=(x,z)=>x>=NEAR.X0&&x<=NEAR.X1&&z>=NEAR.Z0&&z<=NEAR.Z1;
 window._latticeMs=Math.round(performance.now()-t0);
 return{N,C,inN,h:(x,z)=>inN(x,z)?N.h(x,z):C.h(x,z),slope:(x,z)=>inN(x,z)?N.s(x,z):C.s(x,z),slope2:(x,z)=>inN(x,z)?N.s2(x,z):C.s2(x,z)};})();
FIELD.upland=(x,z)=>clamp(.2+(HL.h(x,z)-Uat(x,z))/650,0,1);
// UO: the old shoreline's level at the spot (the T1 platform's sea); the beds rose with it
const UO=Uat(0,0);window._U0=+UO.toFixed(1);
// what a plant may root on: land over 0.6 m, not the masonry, not the spring's pool, the drawn ground gentle at 2 m and at 4-16 m (a
// quarry's 9 m tread (its 5 m flat) is left to the host's own planting, 85-host-quarry.js)
function plantMask(x,z){if(masonryAt(x,z))return 0;if(Math.hypot(x-SPRING.x,z-SPRING.z)<SPRING.r*1.7||Math.hypot(x-POOL.x,z-POOL.z)<POOL.r*1.6||Math.hypot(x-STACK.x,z-STACK.z)<STACK.r1+2)return 0;
 const s=HL.slope(x,z);if(s>1.1)return 0;return smooth(1.1,.55,s)*smooth(.95,.5,HL.slope2(x,z));}

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: the eye, the spring, the cove, the headland's quarried flank and its tip, the crown over them
const SPINE=[[0,0],[SPRING.x,SPRING.z],xzOf(520,200),xzOf(800,-60),xzOf(980,-300),xzOf(820,120),xzOf(500,420)];
BIO.init({tags:'swbay-skarn',THREE:THREE,scene:scene,terrainH:terrainH,mask:plantMask,obstacles:OBSTACLES,ticks:tick,seed:31,
 origin:SPINE,center:CENTER,fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:reportErr});
BIO.setSun(SUN_POS);
{BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';
 /* the bay page's looks (src/45's SWBAY_LOOK), the same switches: the back-light, the floor's root colour, the dry season, the fungoid parts */
 window.SWBAY_LOOK={backlit:Q.get('backlit')==='0'?0:.35,ground:Q.get('rootcol')==='0'?0:.54,season:Q.get('season')!=='0',fung:Q.get('fung')!=='0'};}
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swbay',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}

// ---------------------------------------------------------------- the beds (KSTRATA)
// The plan's column over the old shoreline's sea (UO: the beds rose with the land): contact-marble from 16 m under it to 189 m over (the
// plan's -1,515..-1,310 m before the uplift), the platform's unbaked carbonate-shelf over
// it to the crown. South-east of the cove's mouth (a < ~470, all of it by a ~260) the lower 75 m are the shelf's own facies, carbonate-
// shelf (-1,515..-1,440 m), tonguing into the marble by 6 m of the beds (lateral): the facies change the plan names. The beds rise
// 6 m a km along the coast to the north-north-west
const STRATA=BIO.strata({seed:KRAND.hash(WORLD,1,0x57A7),private:true,res:.25,range:[UO-80,UO+340],dip:[TV[0],TV[1],.006],warp:[3,1.1],dust:0xb8a888,
 formations:[{recipe:'contact-marble',top:UO+189},{recipe:'carbonate-shelf',base:UO+189,top:UO+340}],
 lateral:{formations:[{recipe:'carbonate-shelf',top:UO+59},{recipe:'contact-marble',base:UO+59,top:UO+189},{recipe:'carbonate-shelf',base:UO+189,top:UO+340}],
  dir:[-TV[0],-TV[1]],at:xzOf(470,0),d0:0,d1:210,tongue:6}});
window.SWBAY_STRATA=STRATA;

// ---------------------------------------------------------------- the paint (the soil and the sea floor) and the zones of the library's layers
// a field cache over TERR (260 x 260): the drawn height, the wet, the marble's share, the bare rock (the shelf's pavement, the harbour
// bench and the quarry's treads: the beds show there however gentle the ground)
const FCG=(function(){const N=260,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,a={h:new Float32Array(N*N),u:new Float32Array(N*N),wet:new Float32Array(N*N),m:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=TERR.X0+i/(N-1)*SX,z=TERR.Z0+j/(N-1)*SZ,k=j*N+i;a.h[k]=HL.h(x,z);a.u[k]=Uat(x,z);a.wet[k]=FIELD.wet(x,z);a.m[k]=marbleK(x,z);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at,SX,SZ};})();
// bare rock by height over the old shoreline (r): the shelf's pavement, the raised platforms' wave-cut pavement, the raised bench, the
// quarry's treads, the crown's knolls
function bareAt(x,z,r,m){const a=aOf(x,z),q=quarryK(a),n=NZ(x,z,.05,51,2);
 const pave=(1-m)*smooth(13,7,r)*smooth(.3,1.2,r)*clamp(.85+n*1.2,0,1);                 /* the shelf's limestone pavement, soil in its pockets */
 const plat=smooth(1.6,.4,r)*clamp(.22+n*1.6,0,.7);                                     /* the raised platforms: wave-cut pavement under thin soil */
 const bench=m*smooth(28,33,r)*smooth(39,35,r)*clamp(.8+n,0,1);                          /* the raised wave-cut bench */
 const treads=q*smooth(36,40,r)*smooth(92,84,r)*.92;                                     /* the quarry's treads */
 const crown=m*smooth(80,90,r)*smooth(108,98,r)*smooth(-.1,.25,n)*.7;                    /* the crown's bare knolls */
 return clamp(Math.max(pave,plat,bench,treads,crown),0,1);}
function glWeights(x,z){const h=FCG.at(FCG.a.h,x,z),r=h-FCG.at(FCG.a.u,x,z),wet=FCG.at(FCG.a.wet,x,z),m=FCG.at(FCG.a.m,x,z),bare=bareAt(x,z,r,m),up=clamp(.2+r/650,0,1);
 const sav=smooth(.3,.42,up)*(1-bare),litter=smooth(.4,.62,wet)*(1-sav)*(1-bare);
 return[litter,0,sav,bare];}
const TEX_GROUND=BIO.canvasTex(1024,1024,(g,w,hh)=>{const id=g.createImageData(w,hh),d=id.data,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0;
 const C=x=>new THREE.Color(x),c=new THREE.Color(),t=new THREE.Color();
 const DRY=C(0x9c8a62),DRY2=C(0x8a7c58),OLIVE=C(0x6e6e46),LIT=C(0x4e4232),ROSSA=C(0xa25a3c),PAVE=C(0xc8bea4);
 for(let y=0;y<hh;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,wx=TERR.X0+(x+.5)/w*SX,wz=TERR.Z0+(y+.5)/hh*SZ,n=KRAND.h3(x,y,3,77)-.5,n2=NZ(wx,wz,.012,52,2);
  const h=FCG.at(FCG.a.h,wx,wz)-FCG.at(FCG.a.u,wx,wz),wet=FCG.at(FCG.a.wet,wx,wz),m=FCG.at(FCG.a.m,wx,wz);   /* h: over the old shoreline */
  c.copy(DRY).lerp(DRY2,clamp(.5+n2*2.2,0,1));c.lerp(OLIVE,smooth(.36,.55,wet)*.7);c.lerp(LIT,smooth(.5,.75,wet)*.8);
  c.lerp(ROSSA,(1-m)*smooth(14,6,h)*clamp(.5+n2*3,0,1)*.7);                               /* terra rossa in the shelf's pockets */
  c.lerp(PAVE,bareAt(wx,wz,h,m)*.6);
  const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// the rock's grain: the kit's library rock (materials.json `rock`) when the page carries the pack, else a KRAND grain
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=208+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*80+(KRAND.h3(x,y,1,72)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('rock');
const GRAIN={map:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN,s:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6,mean:ROCK_LIB?.18:.62};   /* mean: the grain's linear mean (sampleSRGB), so it multiplies about 1 */

// ---------------------------------------------------------------- the ground's material
// MeshStandard (the light per pixel: the cliff's ledges read): the paint and its grain; the library's leaf litter and dry earth by zone
// (KGROUND, 43-core-ground.js: aGL.x litter, aGL.z the savannah's earth); then THE BEDS where the ground is steep or bare (aGL.w),
// with the grain; the magnetite's selvages (the darkest beds) glossy and a little metallic: the plan's glint (fx sheen; the ilmenite's
// way: the material, not the colour)
const MAT_GROUND=new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xa6a49a,roughness:.94,metalness:0});
MAT_GROUND.onBeforeCompile=sh=>{STRATA.inject(sh);KCOLOR.include(sh);
 sh.uniforms.uRG={value:GRAIN.map};sh.uniforms.uRGs={value:GRAIN.s};sh.uniforms.uRGm={value:GRAIN.mean};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;varying vec4 vGL;attribute float aU;varying float vU;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGL=aGL;vU=aU;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;uniform float uRGm;varying vec4 vGL;varying float vU;float kRockK;float kMag;')
  .replace('#include <map_fragment>',['#include <map_fragment>',
   '{vec3 gn=abs(normalize(vSWN));gn/=gn.x+gn.y+gn.z;',
   ' vec3 rt=sampleSRGB(uRG,vSWP.zy*uRGs).rgb*gn.x+sampleSRGB(uRG,vSWP.xz*uRGs).rgb*gn.y+sampleSRGB(uRG,vSWP.xy*uRGs).rgb*gn.z;',
   ' float gl=clamp(dot(rt,vec3(0.333))/uRGm,0.3,2.0);diffuseColor.rgb*=mix(1.0,gl,0.45);',
   '/*KGROUND*/',
   ' float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);vec3 sc=strataColor(vSWP,vSWN);',
   ' kMag=smoothstep(0.05,0.02,dot(sc,vec3(0.2126,0.7152,0.0722)));',
   ' sc*=mix(1.0,clamp(gl,0.6,1.45),0.8);',
   ' {float yr=vSWP.y-vU;float nb=smoothstep(-0.2,0.4,yr)*(1.0-smoothstep(1.2,2.2,yr))+smoothstep(33.8,34.4,yr)*(1.0-smoothstep(35.2,36.2,yr));sc*=mix(vec3(1.0),vec3(0.5,0.5,0.46),nb*0.85);}',   /* the old tides' notches: T1's waterline and the raised bench's, weathered dark (aU: the shoreline's level) */
   ' kRockK=clamp(max(smoothstep(0.36,0.6,steep),vGL.w),0.0,1.0);',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,kRockK);}'].join('\n'))
  .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,mix(0.64,0.2,kMag),kRockK);')
  .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,0.6,kMag*kRockK);');};
MAT_GROUND.customProgramCacheKey=()=>'swbay-skarn-ground';
const GL_ON=Q.get('kground')!=='0'&&typeof KGROUND!=='undefined';
if(GL_ON){const L=(slot,w,amt,gain)=>KGROUND.layer('swbay',slot,{w,amt,gain,tint:'diffuse'});
 const LY=[L('groundLitter','vGL.x',.6,1.15),L('groundSav','vGL.z',.55,1.1)];
 KGROUND.hook(MAT_GROUND,{layers:LY.every(Boolean)?LY:[],key:'swbay-skarn-ground',relief:null});}
MAT_GROUND.uniforms=Object.assign(MAT_GROUND.uniforms||{},{uRG:{value:GRAIN.map}});
if(GL_ON)['groundLitter','groundSav'].forEach((s,i)=>{const pk=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swbay',s):null;if(pk)MAT_GROUND.uniforms['uKGL_'+i]={value:KMAT.textures(pk,{aniso:8}).map};});

// ---------------------------------------------------------------- the ground's meshes: TERR at 8 m with NEAR left out, NEAR at 2 m
// The inset's rim takes the 8 m lattice's heights between its vertices (no crack); every vertex is a lattice point of HL (its height is
// the one the mask and the fields read). uv spans TERR (the paint), aGL the layers' zones and the bare rock
const GROUND_MESHES=[];
(function(){const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,C=HL.C,N=HL.N;
 const grid=(L,hole,rim)=>{const nx=L.nx,nz=L.nz,W=nx+1,n=W*(nz+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),gl=new Float32Array(n*4),ua=new Float32Array(n),idx=[];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*W+i,x=L.X0+i*L.st,z=L.Z0+j*L.st;let y=L.H[k];
   if(rim&&(i===0||j===0||i===nx||j===nz))y=C.h(x,z);   /* on the rim: the coarse lattice's own line */
   pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;gl.set(glWeights(x,z),k*4);ua[k]=Uat(x,z);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cx=L.X0+(i+.5)*L.st,cz=L.Z0+(j+.5)*L.st;if(hole&&cx>hole.X0&&cx<hole.X1&&cz>hole.Z0&&cz<hole.Z1)continue;
   const a=j*W+i,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));g.setAttribute('aU',new THREE.BufferAttribute(ua,1));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();return g;};
 const base=new THREE.Mesh(grid(C,NEAR,false),MAT_GROUND);base.userData.probeSkip=true;base.userData.inspectLabel='The coast (ground)';scene.add(base);
 const inset=new THREE.Mesh(grid(N,null,true),MAT_GROUND);inset.userData.probeSkip=true;inset.userData.inspectLabel='The harbour cliffs and the shelf (ground)';scene.add(inset);
 GROUND_MESHES.push(base,inset);window._groundTris=(base.geometry.index.count+inset.geometry.index.count)/3;})();

// ---------------------------------------------------------------- the far country (KFAR) from the scale model, and the Throne's plume
// The model's relief round the site (REGION: 41 x 41 cells of 2 km) carried on past TERR to 30 km, sunk 20 m under the ground inside
// TERR (its border on it exactly), the planet's curvature past TERR; the model's water cells are the far sea's floor (the outer water, 89w)
const FAR=(function(){const ROUT=30000,SINK=20,inT=(x,z)=>x>=TERR.X0&&x<=TERR.X1&&z>=TERR.Z0&&z<=TERR.Z1,onB=(x,z)=>x===TERR.X0||x===TERR.X1||z===TERR.Z0||z===TERR.Z1;
 const GL=KFAR.lines({cell:60,inner:4200,out:ROUT,grow:1.06}),rr2=(ROUT-400)*(ROUT-400);
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const CC={dry:L([150,134,100]),olive:L([112,112,78]),rock:L([196,190,176]),bed:L([150,160,150]),far:L([150,160,170])};
 const G=KFAR.grid({lines:GL,dense:true,centre:[0,0],
  h:(x,z)=>inT(x,z)?terrainH(x,z)-(onB(x,z)?0:SINK):regionY(x,z),
  skip:(x0,z0,x1,z1)=>Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2||(x0>TERR.X0+100&&x1<TERR.X1-100&&z0>TERR.Z0+100&&z1<TERR.Z1-100),
  color:(x,z,y,q)=>{const n1=NZ(x,z,.0021,96,2)+.5;let c=mixC(CC.dry,CC.olive,clamp(n1,0,1));c=mixC(c,CC.rock,smooth(.5,.9,q.slope)*.6);
   c=mixC(c,CC.bed,smooth(1,-3,q.h));c=mixC(c,CC.far,.3*smooth(5000,24000,q.r));return c;},curve:{from:TERR.R}});
 const geo=KFAR.geometry(G);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='The far country (scale model 5.1)';mesh.frustumCulled=false;scene.add(mesh);
 window.SWBAY_FAR_G=G;return{mesh,mat,G,tris:G.count.tris};})();
// THE THRONE'S PLUME: the Throne (summit px 847,834, 10.9 km) is 398 km off at bearing 35 (NNE), its summit under the horizon from here, its
// plume over it. Drawn 40 km out on the same bearing at the same angular size (a column of soft globes, leaning east), no fog: a stand-in
// at the plan's word ("the Throne's plume"), not the volcano. The plan put it ENE; it is drawn where the map has it (the owner, 2026-11-17), outside the eye's 338 view
const THRONE={bearing:34.6,km:398,at:40000};   /* from px 734,998 to the summit px 847,834 */
(function(){const b=THRONE.bearing*Math.PI/180,dx=Math.sin(b),dz=-Math.cos(b),k=THRONE.at/(THRONE.km*1000),drop=THRONE.at*THRONE.at/(2*4.81e6);
 const smoke=new THREE.MeshBasicMaterial({color:0xb8bcc4,transparent:true,opacity:.2,depthWrite:false,fog:false});
 for(let i=0;i<14;i++){const t=i/13,r=(2600+t*9000)*k,h=(13000+t*30000)*k,lean=t*t*14000*k;   /* the heat-pipe plume to ~43 km, spreading as it leans */
  const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),smoke.clone());m.material.opacity=.32*(1-t*.65);
  m.position.set(dx*THRONE.at+lean*.9,h-drop,dz*THRONE.at-lean*.3);m.userData.probeSkip=true;m.userData.inspectLabel='The Throne\'s plume (398 km NNE; drawn 40 km out at its angular size)';m.renderOrder=2;scene.add(m);}})();
