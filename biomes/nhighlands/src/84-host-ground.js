// ================================================================= HOST — ground, water, mist
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
 const TEX=BIO.canvasTex(TW,TW,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color(),t=new THREE.Color();
  const MOSS=new THREE.Color(0x3e5a24),MOSS2=new THREE.Color(0x52702a),FERNSH=new THREE.Color(0x26381c),LITTER=new THREE.Color(0x4a3a2a),NEEDLE=new THREE.Color(0x5a4232),
   GLADE=new THREE.Color(0x6e8e3c),BELL=new THREE.Color(0x5a5ab0),HEATH=new THREE.Color(0x3e4a30),HEATH2=new THREE.Color(0x4a3e44),LICHEN=new THREE.Color(0xa2aa8c),
   MOSSD=new THREE.Color(0x34482a),CHAR=new THREE.Color(0x2e2a26),FIRE=new THREE.Color(0x7a4a54),ROCK=new THREE.Color(0x7a7b74),ROCK2=new THREE.Color(0x63655f),
   SNOW=new THREE.Color(0xe6ecf2),GRAV=new THREE.Color(0x8a887c),PEAT=new THREE.Color(0x3a3428),DARKV=new THREE.Color(0x3a3048);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=(y+.5)/h,wx=TERR.X0+u*SX,wz=TERR.Z0+v*SZ;
   const n=(BIO.fn.h3(x,y,3)-.5),n2=fbm(wx*.011,wz*.011,4.1,2)-.5,n3=fbm(wx*.0032,wz*.0032,5.3,2)-.5;
   const tem=zat('temperate',u,v),mon=zat('montane',u,v),bor=zat('boreal',u,v),alp=zat('alpine',u,v),rip=zat('rip',u,v),gl=zat('glade',u,v),ow=zat('oldwood',u,v),brn=zat('burn',u,v),dk=zat('dark',u,v),rk=zat('rock',u,v);
   const sl=FC.at(FC.a.slope,wx,wz),hh=FC.at(FC.a.h,wx,wz),north=FC.at(FC.a.north,wx,wz);
   // the temperate floor: a moss carpet, fern shadow, a little litter
   c.copy(MOSS).lerp(MOSS2,clamp(.5+n2*2.4,0,1)).lerp(FERNSH,smooth(.05,.3,n3)*.55).lerp(LITTER,clamp(smooth(.0,.3,-n3)*.55+smooth(.2,.5,n2)*.3,0,.7));
   // the montane: needle litter through the moss
   t.copy(NEEDLE).lerp(MOSS,clamp(.45+n2*2,0,1));c.lerp(t,mon*.65);
   // the boreal: heath, lichen, dark moss; the burn charcoal and fireweed
   t.copy(HEATH).lerp(HEATH2,clamp(.5+n2*2.2,0,.6)).lerp(LICHEN,smooth(.08,.25,n3)*.6).lerp(MOSSD,smooth(.1,.3,-n3)*.5);c.lerp(t,bor);
   if(brn>0){t.copy(CHAR).lerp(FIRE,clamp(.5+n2*2.5,0,1)*.7);c.lerp(t,brn*.8);}
   // the glades: grass, and bluebells in the temperate ones
   c.lerp(GLADE.clone().lerp(BELL,tem*smooth(.0,.25,n2+.1)*.45),gl*.75);
   if(dk>0)c.lerp(DARKV,dk*tem*.18*smooth(-.1,.2,n2));
   // the old wood and the crags: grey stone through the moss, granite on the steep
   c.lerp(ROCK.clone().lerp(MOSS,.45),ow*smooth(.0,.3,n2+.15)*.5);
   const rockK=Math.max(smooth(.62,1.05,sl),rk*.35);c.lerp(ROCK.clone().lerp(ROCK2,clamp(.5+n3*2.5,0,1)),rockK);
   // the top: snow on the north faces and in the hollows
   c.lerp(SNOW,smooth(.25,.5,.6*north+n3*2.2+.4*(zat('cold',u,v)-.9)*5)*smooth(.95,.5,sl)*alp*.9);   // patches: the north faces and the hollows hold it
   // the banks: gravel and wet moss; the tarn's peat
   const fl=FC.at(FC.a.flow,wx,wz);c.lerp(MOSS2.clone().lerp(MOSS,.5),rip*.45);c.lerp(GRAV,smooth(.86,.98,fl)*.7);
   if(Math.hypot(wx-TARN.x,wz-TARN.z)<TARN.r+30)c.lerp(PEAT,smooth(TARN.r+30,TARN.r,Math.hypot(wx-TARN.x,wz-TARN.z))*.6);
   // the canopy's shade
   const sh=sat(u,v);c.multiplyScalar(1-.62*sh);
   const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 const MAT=new THREE.MeshLambertMaterial({map:TEX,color:0x84847a});
 MAT.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:DET};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;varying vec3 vGWN;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vGWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;varying vec3 vGWN;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vGWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
    // granite on the steep: grey bands, wandering, lichen-stained (the paint is sRGB-decoded, so these are linear)
    ' float steep=1.0-clamp(vGWN.y,0.0,1.0); float y=vGWP.y+5.0*sin(vGWP.x*0.005+vGWP.z*0.004)+2.0*sin(vGWP.x*0.033);',
    ' float b1=0.5+0.5*sin(y*0.24), b2=smoothstep(0.6,0.95,sin(y*0.08+1.3));',
    ' vec3 st=mix(vec3(0.17,0.18,0.17),vec3(0.26,0.27,0.25),b1); st=mix(st,vec3(0.12,0.14,0.11),b2*0.6);',
    ' st*=0.8+0.4*texture2D(uDetail,vec2(vGWP.x+vGWP.z,vGWP.y*3.0)*0.05).r;',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,st,smoothstep(0.42,0.75,steep)*0.85);}'].join('\n'));};
 const NXg=720,g=new THREE.PlaneGeometry(SX,SZ,NXg,NXg);g.rotateX(-Math.PI/2);g.translate((TERR.X0+TERR.X1)/2,0,(TERR.Z0+TERR.Z1)/2);
 const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,terrainH(p.getX(i),p.getZ(i)));
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(p.getX(i)-TERR.X0)/SX,1-(p.getZ(i)-TERR.Z0)/SZ);
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
const WATER_SKY={value:new THREE.Color(0x5e6e66)};   // a forest stream mirrors the banks and the canopy, not the open sky
function waterMat(flow){const m=new THREE.ShaderMaterial({fog:true,vertexColors:true,transparent:false,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(SUN_POS[0],SUN_POS[1],SUN_POS[2]).normalize()},uSky:{value:new THREE.Color(0xc8d4d4)},uFlow:{value:flow?1:0}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;varying vec2 vUv;',
  'void main(){vCol=color;vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uFlow;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;varying vec2 vUv;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(80.0,420.0,dcam);',
  ' float fl=uFlow*(vUv.y*0.09-uT*1.4);',
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.41+uT*1.3+fl*6.0)+0.02*sin(vWP.z*0.63-uT*0.8+vWP.x*0.13)),1.0,rk*(0.035*cos(vWP.z*0.37+uT*1.1+fl*5.0)+0.02*sin(vWP.x*0.57+uT*1.5))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.06+fr*0.38)*(0.92+0.16*sin(vWP.x*0.21+vWP.z*0.17+uT*0.6));',
  ' float foam=uFlow*vUv.x*(0.6+0.4*sin(vUv.y*1.3-uT*7.0+sin(vWP.x*0.4)*2.0));',
  ' col=mix(col,vec3(0.92,0.94,0.93),clamp(foam,0.0,0.92));',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.5*vec3(1.0,0.96,0.88);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
 m.uniforms.fogColor.value=scene.fog.color;m.uniforms.fogDensity.value=scene.fog.density;m.uniforms.uSky=WATER_SKY;TICKS.push(dt=>{m.uniforms.uT.value+=dt;m.uniforms.fogDensity.value=scene.fog.density;});return m;}
// the stream: a ribbon across the channel at every point, its level the stream's; uv.y runs downstream (the ripples
// follow it), uv.x carries the foam (the cascades, the falls)
const STREAM_WATER=(function(){const P=STREAM.P,n=P.length,pos=[],col=[],uv=[],idx=[],c=new THREE.Color(),
 cShal=new THREE.Color(0x8a7e58),cMid=new THREE.Color(0x4e5640),cDeep=new THREE.Color(0x1e2a26);const ACROSS=6;
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
  const half=STREAM.halfW(i)+2.2,lvl=STREAM.level[i],dep=STREAM.dep[i],foam=clamp(smooth(.2,.5,STREAM.drop[i])*.6+smooth(.7,1.2,STREAM.drop[i])+.35*smooth(.6,.9,Math.sin(STREAM.S[i]*.09)*Math.sin(STREAM.S[i]*.023+1)),0,1);   // the mean fall is ~.17: foam only where it steepens
  for(let k=0;k<=ACROSS;k++){const t=k/ACROSS*2-1,x=P[i][0]+nx*half*t,z=P[i][1]+nz*half*t;
   pos.push(x,lvl,z);c.copy(cShal).lerp(cMid,smooth(.5,1.2,dep)*(1-.6*Math.abs(t))).lerp(cDeep,smooth(1.4,3,dep)*(1-Math.abs(t)));c.convertSRGBToLinear();col.push(c.r,c.g,c.b);uv.push(foam*(.55+.45*Math.abs(t)),STREAM.S[i]);}}
 for(let i=0;i<n-1;i++)for(let k=0;k<ACROSS;k++){const a=i*(ACROSS+1)+k,b=a+1,c2=a+ACROSS+1,d=c2+1;idx.push(a,c2,b,b,c2,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,waterMat(true));m.userData.probeSkip=true;m.userData.inspectLabel='The stream';m.renderOrder=2;m.material.side=THREE.DoubleSide;scene.add(m);return m;})();
const TARN_WATER=(function(){const g=new THREE.CircleGeometry(TARN.r+10,64);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){const d=Math.hypot(p.getX(i),p.getZ(i))/TARN.r;c.set(0x5a6250).lerp(new THREE.Color(0x24343a),smooth(.95,.4,d));c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.translate(TARN.x,TARN.level,TARN.z);
 const m=new THREE.Mesh(g,waterMat(false));m.userData.probeSkip=true;m.userData.inspectLabel='The tarn';m.renderOrder=1;scene.add(m);return m;})();

// ---------------------------------------------------------------- the mist
// Sheets lie in the hollows and along the water (they read from above), soft sprites stand in them (they read
// from the ground); both drift, and keep to the ground's height as they go.
const MIST=(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),id=g.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-64)/64,dy=(y-64)/64,r=Math.hypot(dx,dy),a=clamp(1-r,0,1)*(.55+.45*fbm(x/22,y/22,3,3));id.data[(y*128+x)*4]=id.data[(y*128+x)*4+1]=id.data[(y*128+x)*4+2]=255;id.data[(y*128+x)*4+3]=clamp(a*a*255,0,255);}
 g.putImageData(id,0,0);const tex=new THREE.CanvasTexture(c);
 const sheetM=new THREE.MeshBasicMaterial({map:tex,color:0xd0dada,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide});
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
 let tries=0,n=0;while(n<44&&tries++<4000){const x=rr(TERR.X0+200,TERR.X1-200),z=rr(TERR.Z0+200,TERR.Z1-200),mi=FC.at(FC.a.mist,x,z);if(rng()>mi)continue;place(n%3?'sprite':'sheet',x,z,rr(6,26));n++;}
 tick((dt,t)=>{for(const m of L){const x=m.ax+Math.sin(t*m.sp+m.ph)*m.amp,z=m.az+Math.cos(t*m.sp*.7+m.ph)*m.amp*.6;m.o.position.x=x;m.o.position.z=z;m.o.position.y=FC.at(FC.a.h,x,z)+m.lift;}});
 return{L,sheetM,spriteM};})();
// the water and the mist follow the light (day / dawn / night)
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(mode=>{
 const S={day:[0x5e6e66,0xd0dada,.30,.22],dawn:[0x9a7a58,0xffd6a8,.40,.34],night:[0x18202a,0x4a5868,.24,.18]}[mode]||[0x5e6e66,0xd0dada,.3,.22];
 WATER_SKY.value.set(S[0]);MIST.sheetM.color.set(S[1]);MIST.spriteM.color.set(S[1]);MIST.sheetM.opacity=S[2];MIST.spriteM.opacity=S[3];
 if(typeof NHL!=='undefined')NHL.setNight(mode==='night'?1:0);});
