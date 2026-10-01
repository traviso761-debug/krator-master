// ---------- birds circling the temple summit and the observation tower by day ----------
await stage('birds');
section('birds',()=>{
const wingG=new THREE.BufferGeometry();wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0.35,1,0,-0.15,0,0,-0.35],3));wingG.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0],3));
const wingM=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
const N=48,body=new THREE.InstancedMesh(octa(1,0),new THREE.MeshLambertMaterial({color:0xffffff}),N),wl=new THREE.InstancedMesh(wingG,wingM,N),wrg=new THREE.InstancedMesh(wingG,wingM,N);
const ND=ctx.needle,TS=ctx.templeStair;
const FL=[{c:[TEMPLE.x,terrainH(TEMPLE.x,TEMPLE.z)-1+(TS?TS.top[1]:50)+14,TEMPLE.z],r0:16,r1:38},{c:[NEEDLE.x,(ND?ND.y+ND.H:terrainH(NEEDLE.x,NEEDLE.z)+NEEDLE_H)+22,NEEDLE.z],r0:24,r1:46}];
if(LAKE.harbor){const hc=LAKE.harbor.centre;FL.push({c:[hc[0],LAKE.L+16,hc[1]],r0:10,r1:30,gull:true});}
const B=[];for(let i=0;i<N;i++){const f=i<36?FL[i%2]:FL[2]||FL[0];B.push({f,r:xrr(f.r0,f.r1),a0:xr()*6.28,sp:xrr(6,9),dir:xr()<0.75?1:-1,h:xrr(-5,6),hp:xr()*6.28,fp:xr()*6.28,gl:xr()});}
const par=new THREE.Object3D(),cb=new THREE.Object3D(),cl=new THREE.Object3D(),cr=new THREE.Object3D();par.add(cb,cl,cr);cb.scale.set(0.25,0.18,0.6);cl.scale.set(1.4,1,1.4);cr.scale.set(1.4,1,1.4);
// perches: merlon tops on the stretches of outer wall nearest each flock
for(let i=0;i<N;i++){const g=B[i].f.gull;const c=g?[0.95,0.95,0.92]:[0.16,0.13,0.19],w=g?[0.85,0.86,0.88]:[0.23,0.16,0.25];body.setColorAt(i,col.setRGB(...c));wl.setColorAt(i,col.setRGB(...w));wrg.setColorAt(i,col.setRGB(...w));}
{const OUT=(ctx.wallSegs||{}).OUT||[];FL.forEach((f,fi)=>{if(f.gull){const P=LAKE.harbor.perches;B.filter(b=>b.f===f).forEach((b,k)=>{b.perch=P[k%P.length];});return;}const segs=OUT.slice().sort((p,q)=>Math.hypot(p.m[0]-f.c[0],p.m[1]-f.c[2])-Math.hypot(q.m[0]-f.c[0],q.m[1]-f.c[2]));const spots=[];
  for(const sg of segs){for(const u of [-0.3,0,0.3]){const lx=u*sg.len;if(sg.i%3===0&&lx+sg.len/2<15)continue;if(sg.i%3===2&&sg.len/2-lx<15)continue;const q=wpt(sg,lx,3.65);spots.push([q[0],sg.base+22+2.5+0.15,q[1],Math.atan2(sg.n[0],sg.n[1])]);}if(spots.length>=N/2)break;}
  B.filter(b=>b.f===f).forEach((b,k)=>{b.perch=spots[k%Math.max(1,spots.length)]||null;});});}
ctx.birds=B;
let lastT=null;
animHooks.push(now=>{if(ctx.hour===undefined)return;const t=now/1000,dt=lastT===null?0:Math.min(0.1,t-lastT);lastT=t;const night=nightF(ctx.hour)>0.6;
  for(let i=0;i<N;i++){const b=B[i],f=b.f,ang=b.a0+b.dir*b.sp/b.r*t;let tx,ty,tz;
    const roost=night&&b.perch;
    if(roost){tx=b.perch[0];ty=b.perch[1];tz=b.perch[2];}else{tx=f.c[0]+b.r*Math.cos(ang);ty=f.c[1]+b.h+Math.sin(t*0.4+b.hp)*3;tz=f.c[2]+b.r*Math.sin(ang);}
    if(!b.p){b.p=[tx,ty,tz];b.hd=Math.atan2(-Math.sin(ang)*b.dir,Math.cos(ang)*b.dir);}
    const dx=tx-b.p[0],dy=ty-b.p[1],dz=tz-b.p[2],d=Math.hypot(dx,dy,dz),sitting=roost&&d<0.15;
    if(sitting){b.p[0]=tx;b.p[1]=ty;b.p[2]=tz;let e=b.perch[3]-b.hd;e=Math.atan2(Math.sin(e),Math.cos(e));b.hd+=e*Math.min(1,dt*2);}
    else if(d>1e-4){const v=Math.min(d,dt*Math.min(16,Math.max(8,d*1.5)));b.p[0]+=dx/d*v;b.p[1]+=dy/d*v;b.p[2]+=dz/d*v;
      if(Math.hypot(dx,dz)>0.02){let e=Math.atan2(dx,dz)-b.hd;e=Math.atan2(Math.sin(e),Math.cos(e));b.hd+=e*Math.min(1,dt*5);}}
    par.position.set(b.p[0],b.p[1],b.p[2]);par.rotation.set(0,b.hd,!roost&&d<4?b.dir*0.35:0,'YXZ');
    if(sitting){cr.rotation.set(0,0,-1.25,'YXZ');cl.rotation.set(0,Math.PI,-1.25,'YXZ');cr.scale.set(0.7,1,0.7);cl.scale.set(0.7,1,0.7);}
    else{const glide=!roost&&Math.sin(t*0.3+b.gl*6.28)>0.55,flap=glide?0.12:0.7*Math.sin(t*(roost?11:9)+b.fp);cr.rotation.set(0,0,flap,'YXZ');cl.rotation.set(0,Math.PI,flap,'YXZ');cr.scale.set(1.4,1,1.4);cl.scale.set(1.4,1,1.4);}
    par.updateMatrixWorld(true);body.setMatrixAt(i,cb.matrixWorld);wl.setMatrixAt(i,cl.matrixWorld);wrg.setMatrixAt(i,cr.matrixWorld);}
  for(const im of [body,wl,wrg])im.instanceMatrix.needsUpdate=true;});
for(const im of [body,wl,wrg]){im.userData.life=true;im.userData.noShadow=true;im.frustumCulled=false;scene.add(im);}
});
await stage('shadows');
section('shadows',()=>{
const unlit=m=>m&&(m.isMeshBasicMaterial||m.isShaderMaterial);   // glowing parts neither cast nor need to receive
scene.traverse(o=>{if(o.isMesh){if(o===terrainMesh){o.receiveShadow=true;return;}if(o.material&&o.material.transparent)return;if(unlit(o.material))return;o.receiveShadow=true;const cut=o.material.alphaTest>0&&o.material.side===THREE.DoubleSide;if(!o.userData.noShadow&&!cut)o.castShadow=true;}});   // cut-out sheets (ivy, nets) receive but do not cast
});
