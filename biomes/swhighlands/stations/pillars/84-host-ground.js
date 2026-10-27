// ================================================================= HOST — the ground (station 4, the pillar rim)
// One ground mesh (a 6 m grid) painted from the station's fields: the green floor (refs/01), the table's dry top and slickrock, the
// talus at the cliff's and the towers' feet, Pan Riba's gravel banks; the canopy's shade baked in, the library's sets on core/terrain's
// ground shader (KGROUND: the turf on the floor, the steppe on the table, the gravel on the banks and the talus), the beds (KSTRATA,
// the pillar sandstone) on the cliff with the faces' grain, KHORIZON's shadows (the towers cast none on it: they are bodies). An apron
// round the edge hides the seam with the far country.
let GROUND=null,GROUND_HZ=null;const GROUND_INSETS=[];
function buildGround(){
 const SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,TW=2048,ZN=256;
 const ZK=['floor','table','block','bank'],ZL={};ZK.forEach(k=>ZL[k]=new Float32Array(ZN*ZN));
 for(let j=0;j<ZN;j++)for(let i=0;i<ZN;i++){const x=TERR.X0+(i+.5)/ZN*SX,z=TERR.Z0+(j+.5)/ZN*SZ,zz=zone(x,z),sl=FC.at(FC.a.slope,x,z);
  const ap=smooth(.02,.15,apronAt(x,z)/(TOP-CAP));ZL.floor[j*ZN+i]=smooth(.31,.36,zz)*(1-ap);   /* the badland apron is bare */ZL.table[j*ZN+i]=smooth(.3,.27,zz);ZL.block[j*ZN+i]=FC.at(FC.a.block,x,z)*smooth(.31,.33,zz);ZL.bank[j*ZN+i]=smooth(.5,.9,FC.at(FC.a.flow,x,z));}
 const zat=(k,u,v)=>{const A=ZL[k],fu=clamp(u*ZN-.5,0,ZN-1.001),fv=clamp(v*ZN-.5,0,ZN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return A[j*ZN+i]*(1-a)*(1-b)+A[j*ZN+i+1]*a*(1-b)+A[(j+1)*ZN+i]*(1-a)*b+A[(j+1)*ZN+i+1]*a*b;};
 const SN=TW/4,SH=new Float32Array(SN*SN),sd=[-SUN_POS[0],-SUN_POS[2]],sl=Math.hypot(sd[0],sd[1]);sd[0]/=sl;sd[1]/=sl;
 for(const T of SWHI.TREES){if(T.H<4)continue;const R=T.crownR*.9,off=Math.min(T.H*.25,8),cx=T.x+sd[0]*off,cz=T.z+sd[1]*off,k=.45;
  const pr=R/SX*SN,pi=(cx-TERR.X0)/SX*SN,pj=(cz-TERR.Z0)/SZ*SN;
  for(let j=Math.max(0,Math.floor(pj-pr));j<=Math.min(SN-1,Math.ceil(pj+pr));j++)for(let i=Math.max(0,Math.floor(pi-pr));i<=Math.min(SN-1,Math.ceil(pi+pr));i++){const d=Math.hypot(i-pi,j-pj)/Math.max(.5,pr);if(d<1)SH[j*SN+i]=1-(1-SH[j*SN+i])*(1-k*(1-d*d));}}
 const sat=(u,v)=>{const fu=clamp(u*SN-.5,0,SN-1.001),fv=clamp(v*SN-.5,0,SN-1.001),i=Math.floor(fu),j=Math.floor(fv),a=fu-i,b=fv-j;return SH[j*SN+i]*(1-a)*(1-b)+SH[j*SN+i+1]*a*(1-b)+SH[(j+1)*SN+i]*(1-a)*b+SH[(j+1)*SN+i+1]*a*b;};
 const TEX=BIO.canvasTex(TW,TW,(g0,W0,H0)=>{const w=W0/2,h=H0/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),id=g.createImageData(w,h),d=id.data;
  const C=x=>new THREE.Color(x),c=new THREE.Color(),t=new THREE.Color();
  const GRN=C(0x5a8a3a),GRN2=C(0x6e9a44),TAB=C(0xa8906c),TAB2=C(0xc0a888),TALUS=C(0x9a6a58),BANK=C(0x9a948a),ROCK=C(0xb07060);
  const NL=(n,f,s)=>{const A=new Float32Array((n+1)*(n+1));for(let j=0;j<=n;j++)for(let i=0;i<=n;i++)A[j*(n+1)+i]=NZ(TERR.X0+i/n*SX,TERR.Z0+j/n*SZ,f,s,2);return A;};
  const N2=w,L2=NL(N2,.011,41);const lat=(A,n,u,v)=>{const fu=u*n,fv=v*n,i=Math.min(n-1,Math.floor(fu)),j=Math.min(n-1,Math.floor(fv)),a=fu-i,b=fv-j,r=n+1;return A[j*r+i]*(1-a)*(1-b)+A[j*r+i+1]*a*(1-b)+A[(j+1)*r+i]*(1-a)*b+A[(j+1)*r+i+1]*a*b;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=(x+.5)/w,v=(y+.5)/h,wx=TERR.X0+u*SX,wz=TERR.Z0+v*SZ,n=KRAND.h3(x,y,3,77)-.5,n2=lat(L2,N2,u,v);
   const fl=zat('floor',u,v),tb=zat('table',u,v),bl=zat('block',u,v),bk=zat('bank',u,v);
   c.copy(GRN).lerp(GRN2,clamp(.5+n2*2.4,0,1));c.lerp(t.copy(TAB).lerp(TAB2,clamp(.5+n2*2.5,0,1)),tb*(1-fl));c.lerp(TALUS,bl*.7);c.lerp(BANK,bk*.8);c.lerp(ROCK,smooth(.7,1.1,FC.at(FC.a.slope,wx,wz)));
   const sh=sat(u,v);c.multiplyScalar(1-.55*sh);const k=1+n*.08;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);g0.imageSmoothingEnabled=true;g0.imageSmoothingQuality='high';g0.drawImage(cv,0,0,W0,H0);});
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(KRAND.fbm(x/9,.4,y/9,2,5)-.5)*40+(KRAND.h3(x,y,9,6)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
 const MAT=new THREE.MeshLambertMaterial({map:TEX,color:0x84847a});
 // the library's ground sets by zone: x the turf of the floor, y the steppe of the table's top, z the gravel of the talus and the
 // banks, w unused
 const GLY=(function(){const A=KGROUND.layer('swhighlands','ground.turf',{w:'vGL.x',amt:.55,gain:.95,tint:'diffuse'}),Bq=KGROUND.layer('swhighlands','ground.steppe',{w:'vGL.y',amt:.6,gain:1.0,tint:'diffuse'});
  const F=KGROUND.layer('swhighlands','ground.gravel',{w:'vGL.z',amt:.55,gain:1.0,tint:'diffuse'});
  return A&&Bq?[A,Bq].concat(F?[F]:[]):[];})();
 MAT.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uDetail={value:DET};sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aGL;varying vec4 vGL;').replace('#include <begin_vertex>','#include <begin_vertex>\nvGL=aGL;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;uniform sampler2D uRG;uniform float uRGs;varying vec4 vGL;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 dt=texture2D(uDetail,vSWP.xz*0.17).rgb;vec3 dt2=texture2D(uDetail,vSWP.xz*0.023+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);',
    '/*KGROUND*/',
    ' float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);',
    ' vec3 rn=abs(normalize(vSWN));rn/=rn.x+rn.y+rn.z;vec3 rt=texture2D(uRG,vSWP.zy*uRGs).rgb*rn.x+texture2D(uRG,vSWP.xz*uRGs).rgb*rn.y+texture2D(uRG,vSWP.xy*uRGs).rgb*rn.z;',
    ' vec3 sc=strataColor(vSWP,vSWN);sc=mix(mix(vec3(dot(sc,vec3(0.333))),sc,0.72)*1.25,vec3(0.78,0.42,0.28)*1.1,0.5)*clamp(pow(dot(rt,vec3(0.333))/0.47,1.3),0.4,1.7);',
    ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,smoothstep(0.16,0.45,steep)*0.85);}'].join('\n'));};   /* the cliff and the badland apron in the beds' colours (Paria's) */
 KGROUND.hook(MAT,{layers:GLY,key:'swhi-pillars-ground'});
 const HZ=(function(){const t0=performance.now(),H=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:groundH,
  far:{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}});window._horizon={ms:Math.round(performance.now()-t0),n:H.n};return H;})();
 KHORIZON.shade(MAT,HZ);GROUND_HZ=HZ;window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!m.userData.farField});
 const glAt=(x,z)=>{const u=(x-TERR.X0)/SX,v=(z-TERR.Z0)/SZ,sl=smooth(.6,1,FC.at(FC.a.slope,x,z));return[zat('floor',u,v)*(1-zat('bank',u,v))*(1-sl),zat('table',u,v)*(1-sl),clamp(zat('block',u,v)+zat('bank',u,v),0,1)*(1-sl),0];};
 /* the mesh 3 m across and 3 m deep in the band by the rim (the field's inset: the eroded slots and the jagged cliff), 6 m deep elsewhere */
 const XS=[],ZS=[];for(let x=TERR.X0;x<=TERR.X1+1e-6;x+=3)XS.push(x);for(let z=TERR.Z0;z<=TERR.Z1+1e-6;){ZS.push(z);z+=(z>=-1020&&z<-60)?3:6;}
 const nx=XS.length-1,nz=ZS.length-1,N=(nx+1)*(nz+1),pos=new Float32Array(N*3),uv=new Float32Array(N*2),gl=new Float32Array(N*4),idx=[];
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const k=j*(nx+1)+i,x=XS[i],z=ZS[j];pos[k*3]=x;pos[k*3+1]=groundH(x,z);pos[k*3+2]=z;uv[k*2]=(x-TERR.X0)/SX;uv[k*2+1]=1-(z-TERR.Z0)/SZ;gl.set(glAt(x,z),k*4);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aGL',new THREE.BufferAttribute(gl,4));
 g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT);m.userData.probeSkip=true;m.userData.inspectLabel='The pillar rim (ground)';scene.add(m);
 {const P=[],U=[],NA=400,ed=[];for(let k=0;k<=NA;k++){const f=k/NA;ed.push([TERR.X0+f*SX,TERR.Z0],[TERR.X1,TERR.Z0+f*SZ],[TERR.X1-f*SX,TERR.Z1],[TERR.X0,TERR.Z1-f*SZ]);}
  for(let side=0;side<4;side++)for(let k=0;k<NA;k++){const a=ed[k*4+side],b=ed[(k+1)*4+side],ha=groundH(a[0],a[1]),hb=groundH(b[0],b[1]),ua=[(a[0]-TERR.X0)/SX,1-(a[1]-TERR.Z0)/SZ],ub=[(b[0]-TERR.X0)/SX,1-(b[1]-TERR.Z0)/SZ];
   [[a,ha,ua],[b,hb,ub],[b,hb-60,ub],[a,ha,ua],[b,hb-60,ub],[a,ha-60,ua]].forEach(q=>{P.push(q[0][0],q[1],q[0][1]);U.push(q[2][0],q[2][1]);});}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ag.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));ag.computeVertexNormals();
  const am=new THREE.Mesh(ag,new THREE.MeshLambertMaterial({map:TEX,color:0x8a8a82,side:THREE.DoubleSide}));am.userData.probeSkip=true;scene.add(am);}
 GROUND=m;return m;}
