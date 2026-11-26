// ================================================================= HOST — the ground (station 5, the fan coast)
// One ground mesh (a 6 m grid, a 3 m inset over the lip, the seep and the dam's toe) painted from the kit's rain-wall zones
// (SWHI.rainZones: the moss of the forest floor, the scar's grey rubble, the dam's boulders) and the lake's drowned floor and mud
// shore, the canopy's shade baked in, the library's sets on core/terrain's ground shader (KGROUND: the moss, the gravel, and the
// dam's boulders as the `clast` layer kind), the beds (KSTRATA) on the steep with the limestone's grain, KHORIZON's shadows.
// As the treeline's (stations/treeline/84-host-ground.js): the same samplers, so the ground keeps to the GPU's 16 texture units.
let GROUND=null,GROUND_HZ=null;const GROUND_INSETS=[];
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,ZN=256;
 const ZK=['scarp','fan','wadi','beach','sea','scrub'],ZL={};ZK.forEach(k=>ZL[k]=new Float32Array(ZN*ZN));
 for(let j=0;j<ZN;j++)for(let i=0;i<ZN;i++){const x=TERR.X0+(i+.5)/ZN*SX,z=TERR.Z0+(j+.5)/ZN*SZ,Z=SWHI.coastZones(x,z),k=j*ZN+i,h=groundH(x,z);
  ZL.scarp[k]=Z.scarp;ZL.fan[k]=Z.fan;ZL.wadi[k]=Z.wadi;ZL.beach[k]=Z.shore*(1-ribK(x,z,h)*.8);ZL.sea[k]=smooth(.2,-3,h);ZL.scrub[k]=(Z.caudex+Z.arrow+Z.flame)*.5;}
 const zat=(k,u,v)=>{const A=ZL[k],fu=clamp(u*ZN-.5,0,ZN-1.001),fv=clamp(v*ZN-.5,0,ZN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return A[j*ZN+i]*(1-a)*(1-b)+A[j*ZN+i+1]*a*(1-b)+A[(j+1)*ZN+i]*(1-a)*b+A[(j+1)*ZN+i+1]*a*b;};
 const SN=TW/4,SH=new Float32Array(SN*SN),sd=[-SUN_POS[0],-SUN_POS[2]],sl=Math.hypot(sd[0],sd[1]);sd[0]/=sl;sd[1]/=sl;
 for(const T of SWHI.TREES){if(T.H<4)continue;const R=T.crownR*.9,off=Math.min(T.H*.25,8),cx=T.x+sd[0]*off,cz=T.z+sd[1]*off,k=.45;
  const pr=R/SX*SN,pi=(cx-TERR.X0)/SX*SN,pj=(cz-TERR.Z0)/SZ*SN;
  for(let j=Math.max(0,Math.floor(pj-pr));j<=Math.min(SN-1,Math.ceil(pj+pr));j++)for(let i=Math.max(0,Math.floor(pi-pr));i<=Math.min(SN-1,Math.ceil(pi+pr));i++){const d=Math.hypot(i-pi,j-pj)/Math.max(.5,pr);if(d<1)SH[j*SN+i]=1-(1-SH[j*SN+i])*(1-k*(1-d*d));}}
 const sat=(u,v)=>{const fu=clamp(u*SN-.5,0,SN-1.001),fv=clamp(v*SN-.5,0,SN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return SH[j*SN+i]*(1-a)*(1-b)+SH[j*SN+i+1]*a*(1-b)+SH[(j+1)*SN+i]*(1-a)*b+SH[(j+1)*SN+i+1]*a*b;};
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data;
  const C=x=>new THREE.Color(x),c=new THREE.Color(),t=new THREE.Color();
  const DRY=C(0x9a8a66),DRY2=C(0x8a7a5a),SCRUB=C(0x6e6a4a),COB=C(0x8c8474),COB2=C(0x766e60),SAND=C(0xc8b48c),WETS=C(0x8a7a5c),SEAF=C(0x6a6450),ROCK=C(0x8a7e6c);
  const NL=(n,f,s)=>{const A=new Float32Array((n+1)*(n+1));for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)A[j*(n+1)+i]=NZ(TERR.X0+i/n*SX,TERR.Z0+j/n*SZ,f,s,2);return A;};
  const N2=w,L2=NL(N2,.011,41);const lat=(A,n,u,v)=>{const fu=u*n,fv=v*n,i=Math.min(n-1,Math.floor(fu)),j=Math.min(n-1,Math.floor(fv)),a=fu-i,b=fv-j,r=n+1;return A[j*r+i]*(1-a)*(1-b)+A[j*r+i+1]*a*(1-b)+A[(j+1)*r+i]*(1-a)*b+A[(j+1)*r+i+1]*a*b;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=(y+.5)/h,wx=TERR.X0+u*SX,wz=TERR.Z0+v*SZ,n=KRAND.h3(x,y,3,77)-.5,n2=lat(L2,N2,u,v);
   c.copy(DRY).lerp(DRY2,clamp(.5+n2*2.4,0,1));c.lerp(SCRUB,clamp(zat('scrub',u,v),0,.5));
   c.lerp(t.copy(COB).lerp(COB2,clamp(.5+n2*2.5,0,1)),clamp(zat('fan',u,v)+zat('wadi',u,v),0,1));c.lerp(SAND,zat('beach',u,v));
   c.lerp(ROCK,smooth(.75,1.15,FC.at(FC.a.slope,wx,wz))*.85);c.lerp(WETS,zat('beach',u,v)*smooth(1.2,0,groundH(wx,wz))*.6);c.lerp(SEAF,zat('sea',u,v));
   const sh=sat(u,v);c.multiplyScalar(1-.35*sh);const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,.4,y/9,2,5)-.5)*40+(KRAND.h3(x,y,9,6)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
 // the library's ground sets by zone: x the scarp's dry steppe, y the wadis' and the fans' cobbles (the gravel), z the beach's sand (this
 // kit's own family, packed for this station only: 'swhighlands-own'), w unused
 const GLY=(function(){const A=KGROUND.layer('swhighlands','ground.steppe',{w:'vGL.x',amt:.55,gain:1.0,tint:'diffuse'}),Bq=KGROUND.layer('swhighlands','ground.gravel',{w:'vGL.y',amt:.65,gain:1.0,tint:'diffuse'});
  const F=KGROUND.layer('swhighlands-own','ground.sand',{w:'vGL.z',amt:.65,gain:1.0,tint:'diffuse'});
  return A&&Bq?[A,Bq].concat(F?[F]:[]):[];})();
 const KG_RELIEF=GLY.length>0&&new URLSearchParams(location.search).get('kgrelief')!=='0';
 const MAT=GLY.length?new THREE.MeshStandardMaterial({map:TEX,color:0x84847a,roughness:.94,metalness:0}):new THREE.MeshLambertMaterial({map:TEX,color:0x84847a});
 /* THE GROUND'S HOLLOWS (KGROUND.cavity, relief.mesh), as the treeline's: a 12 m field, 30 m valley depth, relief.mesh .7 */
 const KGCAV=KG_RELIEF?(function(){const st=12,nx=Math.round(SX/st),nz=Math.round(SZ/st),W=nx+1,n=W*(nz+1),P=new Float32Array(n*3),I=new Uint32Array(nx*nz*6);let t=0;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*W+i,x=TERR.X0+i*SX/nx,z=TERR.Z0+j*SZ/nz;P[3*k]=x;P[3*k+1]=terrainH(x,z);P[3*k+2]=z;}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*W+i;I[t++]=a;I[t++]=a+W;I[t++]=a+1;I[t++]=a+1;I[t++]=a+W;I[t++]=a+W+1;}
  const A=KGROUND.cavity({pos:P,index:I,count:n},{rings:[3,18],depth:[1.5,30]});
  return (x,z)=>{const u=clamp((x-TERR.X0)/SX*nx,0,nx),v=clamp((z-TERR.Z0)/SZ*nz,0,nz),i=Math.min(nx-1,Math.floor(u)),j=Math.min(nz-1,Math.floor(v)),fu=u-i,fv=v-j,k=j*W+i;
   return (A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+W]*(1-fu)+A[k+W+1]*fu)*fv;};})():null;
 const kgCav=mesh=>{if(!KGCAV)return mesh;const p=mesh.geometry.attributes.position,a=new Float32Array(p.count);for(let i=0;i<p.count;i++)a[i]=KGCAV(p.getX(i),p.getZ(i));
  mesh.geometry.setAttribute('aKGAO',new THREE.BufferAttribute(a,1));return mesh;};
 MAT.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:DET};sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;varying vec4 vGL;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGL=aGL;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRG;uniform float uRGs;varying vec4 vGL;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vSWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vSWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
    '/*KGROUND*/',
    ' float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);',
    ' vec3 rn=abs(normalize(vSWN));rn/=rn.x+rn.y+rn.z;vec3 rt=texture2D(uRG,vSWP.zy*uRGs).rgb*rn.x+texture2D(uRG,vSWP.xz*uRGs).rgb*rn.y+texture2D(uRG,vSWP.xy*uRGs).rgb*rn.z;',
    ' vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.6)*1.2*clamp(pow(dot(rt,vec3(0.333))/0.47,1.3),0.4,1.7);',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,smoothstep(0.45,0.72,steep)*0.6);}'].join('\n'));};   /* the beds on the steep, the forest's paint everywhere else */
 KGROUND.hook(MAT,{layers:GLY,key:'swhi-coast-ground',relief:KG_RELIEF?{bump:.075,cavity:.8,mesh:.7}:null});
 const HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
  far:{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
 KHORIZON.shade(MAT,HZ);GROUND_HZ=HZ;window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!m.userData.farField});
 const glAt=(x,z)=>{const u=(x-TERR.X0)/SX,v=(z-TERR.Z0)/SZ,b=zat('beach',u,v);return[zat('scarp',u,v)*(1-b),clamp(zat('fan',u,v)+zat('wadi',u,v),0,1)*(1-b),b*(1-zat('sea',u,v)*.5),0];};
 // a grid over [x0,x1]x[z0,z1] at step; hole: boxes left out; hAt: the height (an inset's rim meets the base grid exactly)
 const grid=(x0,z0,x1,z1,step,hole,hAt)=>{const nx=Math.round((x1-x0)/step),nz=Math.round((z1-z0)/step),N=(nx+1)*(nz+1),pos=new Float32Array(N*3),uv=new Float32Array(N*2),gl=new Float32Array(N*4),idx=[];
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*(nx+1)+i,x=x0+i*step,z=z0+j*step;pos[k*3]=x;pos[k*3+1]=hAt(x,z,i,j,nx,nz);pos[k*3+2]=z;uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;gl.set(glAt(x,z),k*4);}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const cx=x0+(i+.5)*step,cz=z0+(j+.5)*step;if(hole&&hole.some(H=>cx>H[0]&&cx<H[2]&&cz>H[1]&&cz<H[3]))continue;const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
  g.setIndex(N>65535?new THREE.Uint32BufferAttribute(idx,1):new THREE.Uint16BufferAttribute(idx,1));g.computeVertexNormals();return g;};
 const IN=[440,-1150,960,1050],S6=6;
 const m=kgCav(new THREE.Mesh(grid(TERR.X0,TERR.Z0,TERR.X1,TERR.Z1,S6,[IN],(x,z)=>groundH(x,z)),MAT));m.userData.probeSkip=true;m.userData.inspectLabel='The fan coast (ground)';scene.add(m);
 {const gi=grid(IN[0],IN[1],IN[2],IN[3],3,null,(x,z,i,j,nx,nz)=>{const rim=i===0||j===0||i===nx||j===nz;if(!rim)return terrainH(x,z);
   if(i===0||i===nx){const z0=IN[1]+Math.floor((z-IN[1])/S6+1e-9)*S6,f=(z-z0)/S6;return f<1e-6?terrainH(x,z0):mix(terrainH(x,z0),terrainH(x,z0+S6),f);}
   const x0=IN[0]+Math.floor((x-IN[0])/S6+1e-9)*S6,f=(x-x0)/S6;return f<1e-6?terrainH(x0,z):mix(terrainH(x0,z),terrainH(x0+S6,z),f);});
  const mi=kgCav(new THREE.Mesh(gi,MAT));mi.userData.probeSkip=true;mi.userData.inspectLabel='The beach, its arches and the flysch platforms (ground)';scene.add(mi);GROUND_INSETS.push(mi);}
 {const P=[],U=[],NA=400,ed=[];for(let k=0;k<=NA;k++){const f=k/NA;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<NA;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=terrainH(a[0],a[1]),hb=terrainH(b[0],b[1]),ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-60,ub],[a,ha,ua],[b,hb-60,ub],[a,ha-60,ua]].forEach(q=>{P.push(q[0][0],q[1],q[0][1]);U.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x8a8a82,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 GROUND=m;return m;}
