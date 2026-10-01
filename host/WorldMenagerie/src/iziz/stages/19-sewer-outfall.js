// ---------- a sewer outfall low on the far side of the outer wall: culvert, grate, spill lip, a trickle into the moat ----------
const sg=SEWER.sg;if(!sg)return;const base=sg.base,lean=WALL_LEAN,zf=y=>-lean*y;
const o=wpt(sg,0,6.5),iron=lamC(0x2f2b28);
const g=new THREE.Group();g.position.set(o[0],base,o[1]);g.rotation.y=Math.atan2(sg.n[0],sg.n[1]);   // local +z = out of the wall
g.add(mesh(boxG,darkM,0,1.0,zf(2.8)-0.9,3.8,3.6,2.4,0));                                   // culvert mouth
[-1,1].forEach(sd=>g.add(mesh(boxG,wallDarkM,sd*2.55,0.5,zf(2.9)+0.15,1.1,4.8,1.7,0)));      // jambs
g.add(mesh(boxG,gateTopM,0,5.1,zf(5.5)+0.25,6.6,0.9,2.0,0));                                 // stepped lintel
g.add(mesh(boxG,wallDarkM,0,6.0,zf(6.3)+0.05,5.2,0.7,1.6,0));
g.add(mesh(boxG,gateTopM,0,6.7,zf(7.0)-0.1,3.6,0.55,1.3,0));
g.add(mesh(boxG,wallDarkM,0,0.45,zf(0.7)+1.15,5.4,0.55,2.7,0));                              // spill lip
for(let k=-3;k<=3;k++)g.add(mesh(boxG,iron,k*0.55,1.05,zf(2.8)+0.35,0.16,3.5,0.16,0));      // grate bars
for(const yy of [2.1,3.6])g.add(mesh(boxG,iron,0,yy,zf(yy)+0.35,3.9,0.16,0.16,0));
scene.add(g);
// the trickle: over the lip, then down past the footing to the water
const y0=base+1.04,wl=-9.45,pts=[[6.3,y0],[6.5+2.35,y0]];
for(let j=1;j<=18;j++){const f=j/18,y=y0+(wl-y0)*f;let off=6.5+2.35+0.6*Math.sqrt(f);
  for(let t=0;t<16;t++){const q=wpt(sg,0,off);if(meshH(q[0],q[1])+0.3<=y)break;off+=0.25;}pts.push([off,y]);}
const pos=[],uvs=[],idx=[];let vv=0;
pts.forEach((pt,j)=>{if(j)vv+=Math.hypot(pt[0]-pts[j-1][0],pt[1]-pts[j-1][1])/3;const wdt=1.3+1.1*j/pts.length;
  for(const sd of [-1,1]){const q=wpt(sg,sd*wdt/2,pt[0]);pos.push(q[0],pt[1],q[1]);uvs.push(sd<0?0:1,vv);}
  if(j){const b=(j-1)*2;idx.push(b,b+1,b+2,b+1,b+3,b+2);}});
const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));wg.setIndex(idx);
const wtex=(()=>{const cv=document.createElement('canvas');cv.width=64;cv.height=256;const c2=cv.getContext('2d');const R=mkRng(77);
  for(let i=0;i<70;i++){const x=R()*64,w=1+R()*3;c2.fillStyle=`rgba(255,255,255,${0.25+R()*0.6})`;c2.fillRect(x,R()*256,w,30+R()*120);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const waterM=new THREE.MeshBasicMaterial({color:0xc0e0f0,map:wtex,transparent:true,opacity:0.8,depthWrite:false,side:THREE.DoubleSide});
const water=new THREE.Mesh(wg,waterM);water.renderOrder=2;water.userData.noWire=true;scene.add(water);
const end=wpt(sg,0,pts[pts.length-1][0]+0.4);
const foamTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const c2=cv.getContext('2d');const R=mkRng(78);
  for(let i=0;i<260;i++){const a=R()*6.283,r=10+R()*50;c2.fillStyle=`rgba(255,255,255,${(0.5-Math.abs(r-28)/60)*R()})`;c2.beginPath();c2.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,1+R()*3.5,0,7);c2.fill();}
  return new THREE.CanvasTexture(cv);})();
const foamG=new THREE.PlaneGeometry(7,7);foamG.rotateX(-Math.PI/2);
const foamM=new THREE.MeshBasicMaterial({color:0xffffff,map:foamTex,transparent:true,opacity:0.7,depthWrite:false});
const foam=new THREE.Mesh(foamG,foamM);foam.position.set(end[0],wl+0.06,end[1]);foam.renderOrder=2;foam.userData.noWire=true;foam.userData.dynamic=true;scene.add(foam);
SMOKE.push([end[0],wl+0.3,end[1],2]);
// algae streak down the footing below the lip
const scl=Math.atan(2.5/(base+12));
const stTex=(()=>{const cv=document.createElement('canvas');cv.width=128;cv.height=256;const c2=cv.getContext('2d');const R=mkRng(79);
  for(let i=0;i<46;i++){const x=64+(R()-0.5)*90*(0.4+R()),w=3+R()*10,l=60+R()*196;const gr=c2.createLinearGradient(0,0,0,l);gr.addColorStop(0,'rgba(20,34,18,0.85)');gr.addColorStop(1,'rgba(20,34,18,0)');c2.fillStyle=gr;c2.fillRect(x-w/2,0,w,l);}
  return new THREE.CanvasTexture(cv);})();
const stG=new THREE.PlaneGeometry(1,1);stG.translate(0,-0.5,0);
const stM=new THREE.MeshLambertMaterial({color:0xffffff,map:stTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const streak=new THREE.Mesh(stG,stM);const sq=wpt(sg,0,6.57);streak.position.set(sq[0],base+0.02,sq[1]);streak.rotation.set(-scl,Math.atan2(sg.n[0],sg.n[1]),0,'YXZ');streak.scale.set(4.2,base+9.6,1);streak.renderOrder=1;streak.userData.noWire=true;scene.add(streak);
// moss around the mouth
for(const sd of [-1,1]){const q=wpt(sg,sd*3.5,6.6);ivyPanel(false,q[0],base,q[1],xrr(1.2,1.8),xrr(3,5.5),Math.atan2(sg.n[0],sg.n[1]),-Math.atan(lean));}
for(let k=0;k<3;k++){const q=wpt(sg,(k-1)*2.2,6.2);ivyClump(q[0],base+7.3,q[1],xrr(0.5,0.8));}
// inside the city: a grated drain channel down the nearest outer spoke to an inlet at the foot of the wall
const tS=11*Math.PI/8+0.12+Math.PI/16,Rs=wallR(tS),dp=[];
for(let r=0.56*Rs;r<Rs-12;r+=2)dp.push([r*Math.cos(tS),r*Math.sin(tS)]);
const inl=wpt(sg,0,-7.2),dl=dp[dp.length-1];for(let k=1;k<=6;k++){const f=k/6;dp.push([dl[0]+(inl[0]-dl[0])*f,dl[1]+(inl[1]-dl[1])*f]);}
for(let i=0;i<dp.length-1;i++){const a=dp[i],b=dp[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,y=meshH(mx,mz)+0.02;
  scene.add(mesh(boxG,darkM,mx,y,mz,len+0.05,0.06,1.3,-ang));
  for(const sd of [-1,1])scene.add(mesh(boxG,sandLightM,mx-Math.sin(ang)*sd*0.8,y,mz+Math.cos(ang)*sd*0.8,len+0.05,0.12,0.3,-ang));
  const nb=Math.floor(len/0.55);for(let k=0;k<nb;k++){const f=(k+0.5)/nb;scene.add(mesh(boxG,iron,a[0]+(b[0]-a[0])*f,y+0.05,a[1]+(b[1]-a[1])*f,0.14,0.05,1.3,-ang));}}
{const ie=wpt(sg,0,-6.05),gy=meshH(ie[0],ie[1]);scene.add(mesh(boxG,darkM,ie[0],gy-0.1,ie[1],2.4,1.3,0.3,-sg.ang));
 for(let k=-2;k<=2;k++){const q=wpt(sg,k*0.45,-6.3);scene.add(mesh(boxG,iron,q[0],gy-0.1,q[1],0.12,1.3,0.12,-sg.ang));}}
const mouth=wpt(sg,0,6.5);SEWER.view=[wpt(sg,-26,72)[0],base+4,wpt(sg,-26,72)[1],mouth[0],base-2,mouth[1]];
animHooks.push(now=>{wtex.offset.y=-now*0.0011;const lv=ENV.izLight.value;waterM.color.setRGB(0.2+0.55*lv,0.26+0.62*lv,0.3+0.65*lv);foamM.color.setRGB(0.25+0.75*lv,0.25+0.75*lv,0.28+0.72*lv);
  foam.rotation.y=now*0.0002;const sc=1+0.06*Math.sin(now*0.004);foam.scale.set(sc,1,sc);});
SEWER.foot=[end[0],wl+1,end[1]];
ctx.sewer={seg:sg.i,angle:+(sg.tm*180/Math.PI).toFixed(1),drain:dp.length};
});
await stage('river');
section('river',()=>{
const flowTex=(seed,n,a0,a1,len)=>{const cv=document.createElement('canvas');cv.width=64;cv.height=256;const c2=cv.getContext('2d');c2.fillStyle='rgb(200,210,220)';c2.fillRect(0,0,64,256);const R=mkRng(seed);
  for(let i=0;i<n;i++){const x=R()*64,w=1+R()*4,l=len*(0.4+R());const v=R()<0.5?255:150;c2.fillStyle=`rgba(${v},${v},${v},${a0+R()*(a1-a0)})`;const y=R()*256;c2.fillRect(x,y,w,l);if(y+l>256)c2.fillRect(x,y-256,w,l);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
const runTex=flowTex(91,60,0.15,0.45,40),fallTex=flowTex(92,110,0.35,0.9,90);
const runM=new THREE.MeshLambertMaterial({color:0x3a6a96,map:runTex,transparent:true,opacity:0.9,depthWrite:false});
runM.userData.env=true;runM.customProgramCacheKey=()=>'river';
runM.onBeforeCompile=sh=>{sh.uniforms.izFw=ENV.izFw;sh.uniforms.izFwC=ENV.izFwC;sh.uniforms.izPools={value:MOAT_POOLS};sh.uniforms.izBoatPools={value:BOAT_POOLS};applyEnv(sh,{fpars:'uniform vec4 izPools[20];uniform vec4 izBoatPools[24];uniform vec4 izFw;uniform vec3 izFwC;\n',fbody:`{
float izGl=sin(izWp.x*0.9+izTime*1.3)*sin(izWp.z*0.8-izTime*1.1)+0.5*sin((izWp.x+izWp.z)*2.1+izTime*2.3);
izGl=pow(max(izGl,0.0),4.0);
vec3 izRf=vec3(0.45,0.55,0.8)*izGl*0.08;
for(int i=18;i<20;i++){
  vec4 P=izPools[i];
  if(P.z<=0.001)continue;
  vec2 v=izWp.xz-P.xy;vec2 toCam=normalize(cameraPosition.xz-P.xy+vec2(0.0001));
  float a=dot(v,toCam);float pp=v.x*toCam.y-v.y*toCam.x;
  float gg=exp(-(pp*pp)/(P.w*P.w*0.2)-(a*a)/(P.w*P.w*5.0))*step(-P.w*0.3,a);
  izRf+=vec3(1.0,0.82,0.55)*P.z*gg*(0.4+0.6*izGl);
}
${BOAT_LOOP('izRf')}
totalEmissiveRadiance+=izRf*izNight;
${FW_GLSL('izGl')}
}
`});};
const fallM=new THREE.MeshLambertMaterial({color:0xcfe4f0,map:fallTex,transparent:true,opacity:0.88,depthWrite:false,side:THREE.DoubleSide});
// centreline samples from the moat's edge out to the world's edge; the falls are sampled finely
const C=[];{let r=wallR(RIVER.t0)+37.5;while(r<=RIVER.rEnd){const t=RIVER.tc(r),ro=r-wallR(t);C.push({r,x:r*Math.cos(t),z:r*Math.sin(t),ro});r+=ro<47?0.5:3;}}
function ribbon(list,widthF,yF,vScale){const pos=[],uvs=[],idx=[];let v=0;
  list.forEach((q,k)=>{const a=list[Math.max(0,k-1)],b=list[Math.min(list.length-1,k+1)];let tx=b.x-a.x,tz=b.z-a.z;const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
    if(k)v+=Math.hypot(q.x-list[k-1].x,q.z-list[k-1].z,yF(q)-yF(list[k-1]))/vScale;
    const w=widthF(q),nx=-tz,nz=tx,y=yF(q);for(const sd of [-1,1]){pos.push(q.x+nx*w*sd,y,q.z+nz*w*sd);uvs.push(sd<0?0:w/4,-v);}   // v runs against the flow so the scroll moves downstream
    if(k){const o=(k-1)*2;idx.push(o,o+2,o+1,o+1,o+2,o+3);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const runPts=C.filter(q=>q.ro>=45.5),fallPts=C.filter(q=>q.ro<=46.2);
const run=new THREE.Mesh(ribbon(runPts,q=>RIVER.hw(q.ro)+3,q=>RIVER.S(q.ro),6),runM);
// the falls: narrower, and never below the rendered rock
const fallY=q=>q.ro>38.5?Math.max(RIVER.S(q.ro),meshH(q.x,q.z)+0.25):RIVER.S(q.ro);   // the edges tuck into the rock
const fall=new THREE.Mesh(ribbon(fallPts,q=>RIVER.hw(q.ro)*0.7,fallY,3),fallM);
for(const w of [run,fall]){w.renderOrder=2;w.userData.cat='water';w.receiveShadow=true;scene.add(w);}
// white water at the foot and along the lip
const foot=C[0],lip=C.find(q=>q.ro>=45)||C[C.length-1];
const foamTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const c2=cv.getContext('2d');const R=mkRng(93);
  for(let i=0;i<420;i++){const a=R()*6.283,r=6+R()*54;c2.fillStyle=`rgba(255,255,255,${Math.max(0,0.75-r/80)*R()})`;c2.beginPath();c2.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,1+R()*4,0,7);c2.fill();}
  return new THREE.CanvasTexture(cv);})();
const foamM=new THREE.MeshBasicMaterial({color:0xffffff,map:foamTex,transparent:true,opacity:0.8,depthWrite:false});
const foams=[];
for(let k=0;k<3;k++){const q=C[Math.min(C.length-1,k*3)],g=new THREE.PlaneGeometry(1,1);g.rotateX(-Math.PI/2);const f=new THREE.Mesh(g,foamM);const sc=RIVER.hw(q.ro)*(2.6-k*0.5);
  f.position.set(q.x,-9.44+k*0.01,q.z);f.scale.set(sc,1,sc);f.renderOrder=3;f.userData.noWire=true;f.userData.dynamic=true;f.userData.base=sc;scene.add(f);foams.push(f);}
for(let k=0;k<5;k++){const q=C[Math.min(C.length-1,k*2)],t=RIVER.tc(q.r),off=(k-2)*RIVER.hw(q.ro)*0.35;SMOKE.push([q.x-Math.sin(t)*off,-9.2,q.z+Math.cos(t)*off,2]);}
// rocks breaking the falls and scattered along the banks
const rockM=new THREE.MeshLambertMaterial({color:0x5a5248});rockM.userData.tex='ashlar';
for(let k=0;k<9;k++){const q=fallPts[Math.floor(xr()*fallPts.length)],t=RIVER.tc(q.r),off=xrr(-1,1)*RIVER.hw(q.ro)*0.8,x=q.x-Math.sin(t)*off,z=q.z+Math.cos(t)*off,s2=xrr(1.2,2.6);
  scene.add(mesh(octa(1,0),rockM,x,Math.max(-9.6,meshH(x,z))+s2*0.3,z,s2,s2*0.7,s2*1.2,xr()*6.28));}
for(let k=0;k<40;k++){const q=runPts[Math.floor(xr()*runPts.length)],t=RIVER.tc(q.r),sd=xr()<0.5?-1:1,off=sd*(RIVER.hw(q.ro)+xrr(0.5,4)),x=q.x-Math.sin(t)*off,z=q.z+Math.cos(t)*off,s2=xrr(0.6,1.8);
  scene.add(mesh(octa(1,0),rockM,x,meshH(x,z)+s2*0.2,z,s2,s2*0.6,s2,xr()*6.28));}
animHooks.push(now=>{runTex.offset.y=-now*0.00016;fallTex.offset.y=-now*0.0011;
  const lv=ENV.izLight.value;foamM.color.setRGB(0.25+0.75*lv,0.26+0.74*lv,0.3+0.7*lv);
  foams.forEach((f,k)=>{f.rotation.y=now*0.00015*(k%2?1:-1);const s2=f.userData.base*(1+0.05*Math.sin(now*0.003+k*2));f.scale.set(s2,1,s2);});});
// reeds at the waterline and lily pads in the slack water near the banks
{const reedM=new THREE.MeshLambertMaterial({color:0xffffff});reedM.userData.reed=0.35;reedM.userData.lod=[260,320];
 const reedG=new THREE.ConeGeometry(0.07,1,3);reedG.translate(0,0.5,0);
 const reeds=new THREE.InstancedMesh(reedG,reedM,3200),pads=new THREE.InstancedMesh(cyl(1,1,0.06,10),new THREE.MeshLambertMaterial({color:0xffffff}),240),bloom=new THREE.InstancedMesh(octa(1,0),new THREE.MeshLambertMaterial({color:0xffffff}),90);
 let nre=0,npd=0,nbm=0;const REEDC=[0x6a8a3a,0x7a9a4a,0x8a9a52,0x5a7a3a,0xa09a5a];const B=riverBridge();
 for(const q of runPts){if(q.ro<52)continue;if(Math.hypot(q.x-B.c[0],q.z-B.c[1])<9)continue;const t=RIVER.tc(q.r),nx=-Math.sin(t),nz=Math.cos(t),w=RIVER.hw(q.ro),S=RIVER.S(q.ro);
   for(const sd of [-1,1]){
     if(xr()<0.6){let d0=null;for(let d=w-3;d<w+7;d+=0.3){if(meshH(q.x+nx*d*sd,q.z+nz*d*sd)>S-0.15){d0=d;break;}}
       if(d0!==null){const n=5+Math.floor(xr()*6);for(let k=0;k<n&&nre<3200;k++){const d=d0+xrr(-1.2,1.4),u=xrr(-1.2,1.2),x=q.x+nx*d*sd-nz*u,z=q.z+nz*d*sd+nx*u,y=Math.max(meshH(x,z),S-0.5)-0.1;
         putE(reeds,nre++,x,y,z,1,xrr(1.4,3.2),1,xrr(-0.12,0.12),xr()*6.28,xrr(-0.12,0.12),xpick(REEDC));}}}
     if(xr()<0.3&&npd<240){const d=xrr(w-5,w-1.8),x=q.x+nx*d*sd,z=q.z+nz*d*sd;if(meshH(x,z)<S-0.35){const r2=xrr(0.5,1.0);put(pads,npd++,x,S+0.03,z,r2,1,r2,xr()*6.28,xpick([0x3f8a3a,0x4f9a44,0x2f7a4a]));
       if(xr()<0.3&&nbm<90)put(bloom,nbm++,x+xrr(-0.2,0.2),S+0.18,z+xrr(-0.2,0.2),0.18,0.14,0.18,0,xpick([0xf2a6c8,0xf6f0f0,0xe890b8]));}}}}
 for(const [im,n] of [[reeds,nre],[pads,npd],[bloom,nbm]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.noShadow=true;im.userData.cat='veg';if(n>0)scene.add(im);}
 ctx.riverLife={reeds:nre,pads:npd,flowers:nbm};}
// rope bridge where the footpath crosses: plank deck on a gentle sag, posts, rope rails, two fishing lanterns
{const B=riverBridge(),[nx,nz]=B.n,ax=-nz,az=nx,ry=Math.atan2(-nz,nx);
 const y0=meshH(...B.e0)+0.35,y1=meshH(...B.e1)+0.35,span=2*B.half,sag=1.0;
 const deckY=s2=>Math.max(y0+(y1-y0)*s2-sag*4*s2*(1-s2),B.S+1.2);
 const P=s2=>[B.e0[0]+nx*span*s2,B.e0[1]+nz*span*s2];
 const plankM=new THREE.MeshLambertMaterial({color:0x8a6a45});plankM.userData.tex='timber';const rope=lamC(0x6a5236);
 const np=Math.floor(span/0.75);for(let k=0;k<np;k++){const s2=(k+0.5)/np,q=P(s2);scene.add(mesh(boxG,plankM,q[0],deckY(s2)-0.12,q[1],0.6,0.12,2.2+((k*7)%3)*0.1,ry));}
 const railY=s2=>deckY(s2)+1.15+1.0*Math.pow(Math.abs(2*s2-1),4);
 for(const sd of [-1,1]){
   for(const e of [0,1]){const q=P(e),y=e?y1:y0;scene.add(mesh(boxG,plankM,q[0]+ax*sd*1.3,y-1.2,q[1]+az*sd*1.3,0.28,3.8,0.28,ry));}
   for(let k=0;k<10;k++){const sa=k/10,sb=(k+1)/10,A=P(sa),Bq=P(sb),ya=railY(sa),yb=railY(sb),L=Math.hypot(Bq[0]-A[0],Bq[1]-A[1],yb-ya);
     const r=mesh(boxG,rope,(A[0]+Bq[0])/2+ax*sd*1.25,(ya+yb)/2-0.03,(A[1]+Bq[1])/2+az*sd*1.25,1,1,1,0);r.scale.set(0.06,0.06,L);r.rotation.set(-Math.atan2(yb-ya,Math.hypot(Bq[0]-A[0],Bq[1]-A[1])),Math.atan2(nx,nz),0,'YXZ');scene.add(r);
     if(k>0){const q=P(sa);scene.add(mesh(boxG,rope,q[0]+ax*sd*1.25,deckY(sa),q[1]+az*sd*1.25,0.04,railY(sa)-deckY(sa),0.04,ry));}}}
 const lamps=[];for(const e of [0,1]){const q=P(e),y=(e?y1:y0)+2.7,lt=[17.7+e*0.1,23.4+e*0.2,-1];
   const gl=mesh(boxG,glowM,q[0]+ax*1.3,y,q[1]+az*1.3,0.45,0.6,0.45,ry);gl.userData.glowColor=[1,0.7,0.35];gl.userData.glowSize=6;gl.userData.sched=1;gl.userData.lightT=lt;scene.add(gl);
   const w=P(e?0.72:0.28);lamps.push({x:w[0],z:w[1],lt});}
 animHooks.push(()=>{const h=ctx.hour||0;lamps.forEach((l,i)=>MOAT_POOLS[18+i].set(l.x,l.z,0.9*litAt(h,l.lt[0],l.lt[1]),4.5));});
 ctx.bridgeY=(x,z)=>{const dx=x-B.e0[0],dz=z-B.e0[1],s2=(dx*nx+dz*nz)/span,ac=Math.abs((x-B.c[0])*ax+(z-B.c[1])*az);return s2>=0&&s2<=1&&ac<1.2?deckY(s2)+0.05:null;};
 SEWER.bridgeView=[B.c[0]-B.a[0]*34+nx*10,deckY(0.5)+7,B.c[1]-B.a[1]*34+nz*10,B.c[0],deckY(0.5),B.c[1]];}
const vq=C.find(q=>q.ro>=70)||lip,vt=RIVER.tc(vq.r);
SEWER.riverView=[vq.x+Math.cos(vt)*40-Math.sin(vt)*55,14,vq.z+Math.sin(vt)*40+Math.cos(vt)*55,foot.x,-4,foot.z];
SEWER.riverFoot=[foot.x,-9.2,foot.z];SEWER.riverLip=[lip.x,RIVER.S(lip.ro),lip.z];
ctx.river={samples:C.length,lipRo:+lip.ro.toFixed(1),footRo:+foot.ro.toFixed(1)};
});
await stage('lake');
section('lake',()=>{
const L=LAKE.L,NS=160;
// surface: a fan out past the shore so its edge tucks under the banks
const pos=[LAKE.cx,L,LAKE.cz],uvs=[LAKE.cx*0.02,LAKE.cz*0.02],idx=[];
for(let i=0;i<=NS;i++){const q=LAKE.at(1.08,i/NS*Math.PI*2);pos.push(q[0],L,q[1]);uvs.push(q[0]*0.02,q[1]*0.02);if(i)idx.push(0,i+1,i);}
const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));lg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));lg.setIndex(idx);lg.computeVertexNormals();
const ripTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const c2=cv.getContext('2d');c2.fillStyle='rgb(205,212,222)';c2.fillRect(0,0,128,128);const R=mkRng(301);
  for(let i=0;i<90;i++){const x=R()*128,y=R()*128,w=6+R()*22,v=R()<0.5?255:160;c2.strokeStyle=`rgba(${v},${v},${v},${0.2+R()*0.35})`;c2.lineWidth=1+R()*1.5;c2.beginPath();c2.moveTo(x,y);c2.quadraticCurveTo(x+w/2,y-2-R()*3,x+w,y);c2.stroke();}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const lakeM=new THREE.MeshLambertMaterial({color:0x2c5a86,map:ripTex,transparent:true,opacity:0.9,depthWrite:false});
lakeM.userData.env=true;lakeM.customProgramCacheKey=()=>'lake';
lakeM.onBeforeCompile=sh=>{sh.uniforms.izFw=ENV.izFw;sh.uniforms.izFwC=ENV.izFwC;sh.uniforms.izBoatPools={value:BOAT_POOLS};applyEnv(sh,{fpars:'uniform vec4 izBoatPools[24];uniform vec4 izFw;uniform vec3 izFwC;\n',fbody:`{
float izGl=sin(izWp.x*0.7+izTime*1.1)*sin(izWp.z*0.6-izTime*0.9)+0.5*sin((izWp.x-izWp.z)*1.9+izTime*2.0);
izGl=pow(max(izGl,0.0),5.0);
vec3 izLk=vec3(0.45,0.55,0.8)*izGl*0.08*izNight;
vec3 izB=vec3(0.0);
${BOAT_LOOP('izB')}
izLk+=izB*izNight;
izLk+=vec3(1.0,0.85,0.7)*izGl*0.05*izDay*(1.0-izRain);
vec2 izCell=floor(izWp.xz*0.5);vec2 izF=fract(izWp.xz*0.5)-0.5;
float izHr=fract(sin(dot(izCell,vec2(12.9898,78.233)))*43758.5453);
float izAge=fract(izTime*0.9+izHr);
izLk+=vec3(0.5,0.6,0.75)*(1.0-smoothstep(0.0,0.05,abs(length(izF)-izAge*0.45)))*(1.0-izAge)*izRain*0.35*(0.3+0.7*izDay);
totalEmissiveRadiance+=izLk;
${FW_GLSL('izGl')}
}
`});};
const lake=new THREE.Mesh(lg,lakeM);lake.renderOrder=2;lake.userData.cat='water';lake.receiveShadow=true;scene.add(lake);
animHooks.push(now=>{ripTex.offset.set(now*0.000011,now*0.000007);});
// reeds and lily pads round the shore
{const reedM=new THREE.MeshLambertMaterial({color:0xffffff});reedM.userData.reed=0.35;reedM.userData.lod=[260,320];const reedG=new THREE.ConeGeometry(0.07,1,3);reedG.translate(0,0.5,0);
 const reeds=new THREE.InstancedMesh(reedG,reedM,4000),pads=new THREE.InstancedMesh(cyl(1,1,0.06,10),new THREE.MeshLambertMaterial({color:0xffffff}),300),bloom=new THREE.InstancedMesh(octa(1,0),new THREE.MeshLambertMaterial({color:0xffffff}),120);
 let nre=0,npd=0,nbm=0;const REEDC=[0x6a8a3a,0x7a9a4a,0x8a9a52,0x5a7a3a,0xa09a5a];const R=mkRng(302);
 const mouth=Math.atan2(...(()=>{const t=RIVER.tc(RIVER.rIn),x=RIVER.rIn*Math.cos(t)-LAKE.cx,z=RIVER.rIn*Math.sin(t)-LAKE.cz;return [(x*LAKE.ut[0]+z*LAKE.ut[1])/LAKE.B,(x*LAKE.ur[0]+z*LAKE.ur[1])/LAKE.A];})());
 LAKE.mouth=mouth;LAKE.jetty=mouth+0.7;
 LAKE.harborT=mouth-0.75;
 for(let k=0;k<420;k++){const t=k/420*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(t-LAKE.harborT),Math.cos(t-LAKE.harborT)))<0.3||Math.abs(Math.atan2(Math.sin(t-mouth),Math.cos(t-mouth)))<0.12||Math.abs(Math.atan2(Math.sin(t-LAKE.jetty),Math.cos(t-LAKE.jetty)))<0.1)continue;
   if(R()<0.55){let f0=null;for(let f=0.9;f<1.2;f+=0.01){const q=LAKE.at(f,t);if(meshH(q[0],q[1])>L-0.15){f0=f;break;}}
     if(f0!==null){const n=4+Math.floor(R()*6);for(let j=0;j<n&&nre<4000;j++){const q=LAKE.at(f0+(R()-0.4)*0.02,t+(R()-0.5)*0.012);const y=Math.max(meshH(q[0],q[1]),L-0.5)-0.1;
       putE(reeds,nre++,q[0],y,q[1],1,1.2+R()*2.2,1,(R()-0.5)*0.24,R()*6.28,(R()-0.5)*0.24,REEDC[Math.floor(R()*REEDC.length)]);}}}
   if(R()<0.3&&npd<300){const q=LAKE.at(0.8+R()*0.13,t);if(meshH(q[0],q[1])<L-0.35){const r2=0.5+R()*0.6;put(pads,npd++,q[0],L+0.03,q[1],r2,1,r2,R()*6.28,[0x3f8a3a,0x4f9a44,0x2f7a4a][Math.floor(R()*3)]);
     if(R()<0.3&&nbm<120)put(bloom,nbm++,q[0]+(R()-0.5)*0.4,L+0.18,q[1]+(R()-0.5)*0.4,0.18,0.14,0.18,0,[0xf2a6c8,0xf6f0f0,0xe890b8][Math.floor(R()*3)]);}}}
 for(const [im,n] of [[reeds,nre],[pads,npd],[bloom,nbm]]){im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.userData.noShadow=true;im.userData.cat='veg';if(n>0)scene.add(im);}
 ctx.lakeLife={reeds:nre,pads:npd};}
// a jetty with a boathouse and a lamp, beside the river mouth
{const t=LAKE.jetty,a=LAKE.at(1.12,t),b=LAKE.at(0.84,t),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ang=Math.atan2(dz,dx),ry=-ang;
 const plankM=new THREE.MeshLambertMaterial({color:0x8a6a45});plankM.userData.tex='timber';
 const deckY=L+0.9,n=Math.floor(len/0.8);
 for(let k=0;k<n;k++){const f=(k+0.5)/n,x=a[0]+dx*f,z=a[1]+dz*f;scene.add(mesh(boxG,plankM,x,deckY-0.15,z,0.7,0.15,2.6,ry));}
 for(let k=0;k<=Math.floor(len/4);k++){const f=k/Math.floor(len/4),x=a[0]+dx*f,z=a[1]+dz*f,nx=-dz/len,nz=dx/len;
   for(const sd of [-1,1])scene.add(mesh(boxG,plankM,x+nx*sd*1.2,Math.min(L-2,meshH(x+nx*sd*1.2,z+nz*sd*1.2)-0.5),z+nz*sd*1.2,0.3,deckY+0.4-Math.min(L-2,meshH(x,z)-0.5),0.3,ry));}
 const e=[b[0],b[1]];const lamp=mesh(boxG,glowM,e[0],deckY+2.4,e[1],0.4,0.55,0.4,ry);lamp.userData.glowColor=[1,0.72,0.4];lamp.userData.glowSize=7;lamp.userData.sched=1;lamp.userData.lightT=[17.8,24.5,-1];scene.add(lamp);
 scene.add(mesh(boxG,plankM,e[0],deckY,e[1],0.2,2.4,0.2,ry));
 const h=LAKE.at(1.22,t+0.05),hy=meshH(h[0],h[1]);const hm=new THREE.MeshLambertMaterial({color:0x7a5a3a});hm.userData.tex='timber';
 scene.add(mesh(boxG,hm,h[0],hy-0.3,h[1],7,3.4,5,ry));const gm=new THREE.MeshLambertMaterial({color:0x5e3f28});gm.userData.tex='shingle';scene.add(mesh(rectFrus(1,0.04),gm,h[0],hy+3.1,h[1],8,2.4,6,ry));
 scene.add(mesh(boxG,darkM,h[0]+Math.cos(ang)*3.55,hy,h[1]+Math.sin(ang)*3.55,0.1,2.4,3,ry));
 LAKE.jettyEnd=e;LAKE.deckY=deckY;
 const vx=e[0]-dx/len*40+(-dz/len)*25,vz=e[1]-dz/len*40+(dx/len)*25;SEWER.lakeView=[vx,L+12,vz,LAKE.cx,L+2,LAKE.cz];}
