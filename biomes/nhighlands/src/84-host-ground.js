// ================================================================= HOST — ground, water, mist
// the ground's detail and crack layers from the material library (materials.json groundDetail, groundCrack) when this page
// carries the kit's pack; otherwise the procedural ones, which are painted either way (the random stream is unchanged)
function hostGroundLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nhighlands',n):null;if(!L)return fb;
 const c=hostGroundLib.c||(hostGroundLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}).map);}
// One ground mesh painted from the climate fields and the BIOME'S OWN ZONES
// (NHL.zones: the glades, the old wood, the burn, the boreal band agree with
// what grows on them), a tiled detail texture for the grain, grey granite banded
// in the shader on the steep faces (a top-down paint cannot show a cliff), and
// THE CANOPY'S SHADE baked into the paint: built after the trees, it darkens the
// ground under every crown and a little down-sun of it, which is most of what
// makes an old-growth floor read as being under something.
// A vertical apron round the map's edge hides the seam with the far country.
// The stream is its own ribbon following the descending level (tea-brown over
// stones, dark in the pools, white where it drops); the tarn is a disc; the mist
// is sheets lying in the hollows and soft sprites standing in them, drifting.
// Host-only.
let GROUND=null;
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,ZN=256;
 // the zones on a coarse lattice (they cost a dozen noise calls each)
 const ZK=['temperate','montane','boreal','alpine','rip','glade','oldwood','crag','burn','dark','rock','wet','cold'],ZL={};ZK.forEach(k=>ZL[k]=new Float32Array(ZN*ZN));
 for(let j=0;j<ZN;j++)for(let i=0;i<ZN;i++){const x=TERR.X0+(i+.5)/ZN*SX,z=TERR.Z0+(j+.5)/ZN*SZ,Z=NHL.zones(x,z);ZK.forEach(k=>ZL[k][j*ZN+i]=Z[k]);}
 const zat=(k,u,v)=>{const A=ZL[k],fu=clamp(u*ZN-.5,0,ZN-1.001),fv=clamp(v*ZN-.5,0,ZN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return A[j*ZN+i]*(1-a)*(1-b)+A[j*ZN+i+1]*a*(1-b)+A[(j+1)*ZN+i]*(1-a)*b+A[(j+1)*ZN+i+1]*a*b;};
 // the canopy's shade: every tree's crown splatted (soft disc, offset down-sun), at a quarter of the paint's resolution
 const SN=TW/4,SH=new Float32Array(SN*SN),sunDir=[-SUN_POS[0],-SUN_POS[2]],sl=Math.hypot(sunDir[0],sunDir[1]);sunDir[0]/=sl;sunDir[1]/=sl;
 for(const T of NHL.TREES){if(T.H<5)continue;const R=Math.max(T.crownR,T.spread||0)*.95,off=Math.min(T.H*.25,14),cx=T.x+sunDir[0]*off,cz=T.z+sunDir[1]*off,k=(T.H>30?.55:.4)*(NHL.SPECIES[T.sp].habit==='snag'?.15:1);
  const pr=R/SX*SN,pi=(cx-TERR.X0)/SX*SN,pj=(cz-TERR.Z0)/SZ*SN;
  for(let j=Math.max(0,Math.floor(pj-pr));j<=Math.min(SN-1,Math.ceil(pj+pr));j++)for(let i=Math.max(0,Math.floor(pi-pr));i<=Math.min(SN-1,Math.ceil(pi+pr));i++){const d=Math.hypot(i-pi,j-pj)/Math.max(.5,pr);if(d<1)SH[j*SN+i]=1-(1-SH[j*SN+i])*(1-k*(1-d*d));}}
 const sat=(u,v)=>{const fu=clamp(u*SN-.5,0,SN-1.001),fv=clamp(v*SN-.5,0,SN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return SH[j*SN+i]*(1-a)*(1-b)+SH[j*SN+i+1]*a*(1-b)+SH[(j+1)*SN+i]*(1-a)*b+SH[(j+1)*SN+i+1]*a*b;};
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{
  // PAINTED AT HALF THE TEXTURE'S SIZE (6.4 m a pixel) and scaled up by the canvas: every input (the zones, the fields,
  // the shade, the noises) is smoother than that, so the paint is the same to the eye for a quarter of the pixels
  const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data;const c=new THREE.Color(),t=new THREE.Color();
  const MOSS=new THREE.Color(0x3e5a24),MOSS2=new THREE.Color(0x52702a),FERNSH=new THREE.Color(0x26381c),LITTER=new THREE.Color(0x4a3a2a),NEEDLE=new THREE.Color(0x5a4232),
   GLADE=new THREE.Color(0x6e8e3c),BELL=new THREE.Color(0x5a5ab0),HEATH=new THREE.Color(0x52603a),HEATH2=new THREE.Color(0x4a3e44),LICHEN=new THREE.Color(0x8a9274),
   MOSSD=new THREE.Color(0x46602e),CHAR=new THREE.Color(0x2e2a26),FIRE=new THREE.Color(0x7a4a54),ROCK=new THREE.Color(0x7a7b74),ROCK2=new THREE.Color(0x63655f),
   SNOW=new THREE.Color(0xe6ecf2),GRAV=new THREE.Color(0x8a887c),PEAT=new THREE.Color(0x3a3428),DARKV=new THREE.Color(0x3a3048);
  // the per-pixel loop allocates nothing: the constant mixes once, a scratch colour for the rest
  const ROCKMOSS=ROCK.clone().lerp(MOSS,.45),BANK=MOSS2.clone().lerp(MOSS,.5),q=new THREE.Color();
  // the two noises on lattices (6.4 m and 12.8 m; their features are 90 m and 300 m)
  const NL=(n,f,sd)=>{const A=new Float32Array((n+1)*(n+1));for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)A[j*(n+1)+i]=fbm((TERR.X0+i/n*SX)*f,(TERR.Z0+j/n*SZ)*f,sd,2)-.5;return A;};
  const N2=w,N3=w/2,L2=NL(N2,.011,4.1),L3=NL(N3,.0032,5.3);
  const lat=(A,n,u,v)=>{const fu=u*n,fv=v*n,i=Math.min(n-1,Math.floor(fu)),j=Math.min(n-1,Math.floor(fv)),a=fu-i,b=fv-j,r=n+1;return A[j*r+i]*(1-a)*(1-b)+A[j*r+i+1]*a*(1-b)+A[(j+1)*r+i]*(1-a)*b+A[(j+1)*r+i+1]*a*b;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=(y+.5)/h,wx=TERR.X0+u*SX,wz=TERR.Z0+v*SZ;
   const n=(BIO.fn.h3(x,y,3)-.5),n2=lat(L2,N2,u,v),n3=lat(L3,N3,u,v);
   const tem=zat('temperate',u,v),mon=zat('montane',u,v),bor=zat('boreal',u,v),alp=zat('alpine',u,v),rip=zat('rip',u,v),gl=zat('glade',u,v),ow=zat('oldwood',u,v),brn=zat('burn',u,v),dk=zat('dark',u,v),rk=zat('rock',u,v);
   const sl=FC.at(FC.a.slope,wx,wz),north=FC.at(FC.a.north,wx,wz);
   // the temperate floor: a moss carpet, fern shadow, a little litter
   c.copy(MOSS).lerp(MOSS2,clamp(.5+n2*2.4,0,1)).lerp(FERNSH,smooth(.05,.3,n3)*.55).lerp(LITTER,clamp(smooth(.0,.3,-n3)*.55+smooth(.2,.5,n2)*.3,0,.7));
   // the montane: needle litter through the moss
   t.copy(NEEDLE).lerp(MOSS,clamp(.45+n2*2,0,1));c.lerp(t,mon*.65);
   // the boreal: heath, lichen, dark moss; the burn charcoal and fireweed
   t.copy(MOSSD).lerp(HEATH,clamp(.5+n2*2.2,0,.7)).lerp(HEATH2,smooth(.1,.3,n2)*.3).lerp(LICHEN,smooth(.0,.22,n3)*.7);c.lerp(t,bor);
   if(brn>0){t.copy(CHAR).lerp(FIRE,clamp(.5+n2*2.5,0,1)*.7);c.lerp(t,brn*.8);}
   // the glades: grass, and bluebells in the temperate ones
   if(gl>0)c.lerp(q.copy(GLADE).lerp(BELL,tem*smooth(.0,.25,n2+.1)*.45),gl*.75);
   if(dk>0)c.lerp(DARKV,dk*tem*.18*smooth(-.1,.2,n2));
   // the old wood and the crags: grey stone through the moss, granite on the steep
   if(ow>0)c.lerp(ROCKMOSS,ow*smooth(.0,.3,n2+.15)*.5);
   const rockK=Math.max(smooth(.62,1.05,sl),rk*.35);if(rockK>0)c.lerp(q.copy(ROCK).lerp(ROCK2,clamp(.5+n3*2.5,0,1)),rockK);
   // the top: snow on the north faces and in the hollows
   c.lerp(SNOW,smooth(.72,.92,.35*Math.max(0,north)+n3*3.2+.25*n2*4)*smooth(.95,.5,sl)*smooth(.94,1,zat('cold',u,v))*alp*.8);   // patches, never a whole face   // patches: the north faces and the hollows hold it
   // the banks: gravel and wet moss; the tarn's peat
   const fl=FC.at(FC.a.flow,wx,wz);c.lerp(BANK,rip*.45);c.lerp(GRAV,smooth(.86,.98,fl)*.7);
   if(Math.hypot(wx-TARN.x,wz-TARN.z)<TARN.r+30)c.lerp(PEAT,smooth(TARN.r+30,TARN.r,Math.hypot(wx-TARN.x,wz-TARN.z))*.6);
   // the canopy's shade
   const sh=sat(u,v);c.multiplyScalar(1-.62*sh);
   const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const MAT=new THREE.MeshLambertMaterial({map:TEX,color:0x84847a});
 /* the library's two ground layers (materials.json ground.mulch: leaf and needle mulch, ground.meadow: green meadow), by zone: the montane needle floor and the glades */
 const GLY=(function(){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nhighlands','ground.mulch'):null,M=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('nhighlands','ground.meadow'):null;if(!L||!M)return null;
  return{mulch:KMAT.textures(L,{aniso:8}).map,mulchK:1/L.scale[0],meadow:KMAT.textures(M,{aniso:8}).map,meadowK:1/M.scale[0]};})();
 MAT.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:hostGroundLib('groundDetail',DET)};if(GLY){sh.uniforms.uGMulch={value:GLY.mulch};sh.uniforms.uGMeadow={value:GLY.meadow};}
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;attribute vec2 aGL;varying vec2 vGL;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGL=aGL;vGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;varying vec2 vGL;'+(GLY?'uniform sampler2D uGMulch,uGMeadow;vec3 gkAnti(sampler2D t,vec2 p,float k){float m=smoothstep(0.3,0.7,0.5+0.35*sin(p.x*0.0131+1.3)*sin(p.y*0.0097)+0.15*sin(p.x*0.029+p.y*0.023));vec2 q=mat2(0.799,-0.602,0.602,0.799)*p;return mix(pow(texture2D(t,p*k).rgb,vec3(2.2)),pow(texture2D(t,q*k*0.53+vec2(0.37,0.21)).rgb,vec3(2.2)),m);}':''))
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
    (GLY?'{vec3 _pd=diffuseColor.rgb;diffuseColor.rgb=mix(_pd,diffuse*gkAnti(uGMulch,vGWP.xz,'+GLY.mulchK.toFixed(4)+')*1.25,clamp(vGL.x*0.7,0.0,0.7));diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*gkAnti(uGMeadow,vGWP.xz,'+GLY.meadowK.toFixed(4)+')*1.2,clamp(vGL.y*0.75,0.0,0.75));}':''),
    // granite on the steep: grey bands, wandering, lichen-stained (the paint is sRGB-decoded, so these are linear)
    ' float steep=1.0-clamp(vGWN.y,0.0,1.0); float y=vGWP.y+5.0*sin(vGWP.x*0.005+vGWP.z*0.004)+2.0*sin(vGWP.x*0.033);',
    ' float b1=0.5+0.5*sin(y*0.24), b2=smoothstep(0.6,0.95,sin(y*0.08+1.3));',
    ' vec3 st=mix(vec3(0.17,0.18,0.17),vec3(0.26,0.27,0.25),b1); st=mix(st,vec3(0.12,0.14,0.11),b2*0.6);',
    ' st*=0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,st,smoothstep(0.42,0.75,steep)*0.85);}'].join('\n'));};
 const NXg=720,g=new THREE.PlaneGeometry(SX,SZ,NXg,NXg);g.rotateX(-Math.PI/2);g.translate((TERR.X0+TERR.X1)/2,0,(TERR.Z0+TERR.Z1)/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)-TERR.X0)/SX,1-(p.getZ(i)-TERR.Z0)/SZ);
 {const gl=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){const u=(p.getX(i)-TERR.X0)/SX,v=(p.getZ(i)-TERR.Z0)/SZ;gl[i*2]=zat('montane',u,v);gl[i*2+1]=zat('glade',u,v);}g.setAttribute('aGL',new THREE.BufferAttribute(gl,2));}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT);m.userData.probeSkip=true;m.userData.inspectLabel='The northern highlands (ground)';scene.add(m);
 // the apron: a vertical skirt 70 m deep round the square's edge, in the paint's edge colour
 {const pos=[],uvs=[],N=NXg,ed=[];for(let k=0;k<=N;k++){const f=k/N;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<N;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=terrainH(a[0],a[1]),hb=terrainH(b[0],b[1]);
   const ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-70,ub],[a,ha,ua],[b,hb-70,ub],[a,ha-70,ua]].forEach(q=>{pos.push(q[0][0],q[1],q[0][1]);uvs.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x8a8a82,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 GROUND=m;return m;}

// ---------------------------------------------------------------- the water
// 2026-10-20 (core/water migration, phase 2): the stream, its falls and the tarn are core/water's (records in 45-host-stage.js,
// drawn in 89w-host-water.js); this fragment's own water shader, ribbon and disc are gone. The mist below stays sprites.

// ---------------------------------------------------------------- the mist
// Sheets lie in the hollows and along the water (they read from above), soft sprites stand in them (they read
// from the ground); both drift, and keep to the ground's height as they go.
const MIST=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-64)/64,dy=(y-64)/64,r=Math.hypot(dx,dy),a=clamp(1-r,0,1)*(.55+.45*fbm(x/22,y/22,3,3));id.data[(y*128+x)*4]=id.data[(y*128+x)*4+1]=id.data[(y*128+x)*4+2]=255;id.data[(y*128+x)*4+3]=clamp(a*a*255,0,255);}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);
 const sheetM=new THREE.MeshBasicMaterial({map:tex,color:0xd0dada,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
 const spriteM=new THREE.SpriteMaterial({map:tex,color:0xd0dada,transparent:true,opacity:.22,depthWrite:false});
 const L=[];reseed(84031);
 const place=(kind,x,z,lift)=>{const h=FC.at(FC.a.h,x,z);let o;
  if(kind==='sheet'){o=new THREE.Mesh(new THREE.PlaneGeometry(rr(140,320),rr(70,160)),sheetM);o.rotation.x=-Math.PI/2;o.rotation.z=rr(0,TAU);}
  else{o=new THREE.Sprite(spriteM);const s=rr(90,220);o.scale.set(s,s*rr(.35,.55),1);}
  o.position.set(x,h+lift,z);o.userData.probeSkip=true;o.renderOrder=3;scene.add(o);L.push({o,ax:x,az:z,lift,ph:rr(0,TAU),sp:rr(.015,.04),amp:rr(30,70)});};
 // along the stream and at the falls
 for(let k=0;k<26;k++){const i=Math.floor(rng()*STREAM.P.length),p=STREAM.P[i];place(k%2?'sheet':'sprite',p[0]+rr(-40,40),p[1]+rr(-40,40),rr(4,12));}
 STREAM.falls.forEach(i=>{const p=STREAM.P[Math.min(STREAM.P.length-1,i+4)];place('sprite',p[0],p[1],8);place('sprite',p[0]+rr(-20,20),p[1]+rr(-20,20),18);});
 // the hollows, and the cloud band up high
 let tries=0,n=0;while(n<44&&tries++<4000){const x=rr(TERR.X0+200,TERR.X1-200),z=rr(TERR.Z0+200,TERR.Z1-200),mi=FC.at(FC.a.mist,x,z);if(rng()>mi)continue;place(n%3||FC.at(FC.a.valley,x,z)<.5?'sprite':'sheet',x,z,rr(6,26));n++;}   // sheets only in the hollows: on the open crest they read as snow
 tick((dt,t)=>{for(const m of L){const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;m.o.position.x=x;m.o.position.z=z;m.o.position.y=FC.at(FC.a.h,x,z)+m.lift;}});
 return{L,sheetM,spriteM};})();
// the water and the mist follow the light (day / dawn / night)
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(mode=>{
 const S={day:[0x7a8c8c,0xd0dada,.30,.22,1],dawn:[0xb08a62,0xffd6a8,.48,.46,.75],night:[0x2a3442,0x4a5868,.24,.18,.14]}[mode]||[0x7a8c8c,0xd0dada,.3,.22,1];
 MIST.sheetM.color.set(S[1]);MIST.spriteM.color.set(S[1]);MIST.sheetM.opacity=S[2];MIST.spriteM.opacity=S[3];
 if(typeof NHL!=='undefined')NHL.setNight(mode==='night'?1:0);});
