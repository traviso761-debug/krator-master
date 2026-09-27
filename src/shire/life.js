// ---------- what the Shire is doing while you look at it ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape here is this project's own.
//
// Hobbits walking the lanes - about three and a half feet of them, in bright colours, "fond of yellow and
// green" - at a hobbit's pace; smoke from every chimney, hole or house; the round windows lit after dark; birds.
// The mill wheel turns in buildings.js and the Water runs in water.js.
import { mkRng } from '../core/rng.js';

export function life(api){
  const {THREE,C,ctx,scene,animHooks,groundH}=api;
  const V=ctx.plan;if(!V)return;
  const K=C.life||{},R=mkRng(K.seed||1420);
  const nf=()=>api.nightF?api.nightF(api.hour()):0;

  // ---- hobbits on the lanes ----
  const lanes=V.lanes.filter(l=>l.k!=='road'||R()<0.5);
  const paths=lanes.map(l=>{const p=l.p,cum=[0];for(let i=1;i<p.length;i++)cum.push(cum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return {p,cum,L:cum[cum.length-1],w:l.w};}).filter(q=>q.L>30);
  const N=Math.min(K.hobbits||80,paths.length*8);
  const CLOTH=[0xd8b83a,0x4a8a3a,0x8a5a2a,0x3a6a8a,0xb85a3a,0x6a8a2a,0xe0d0a0];
  const body=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.3,0.75,8).translate(0,0.55,0),new THREE.MeshLambertMaterial({color:0xffffff}),N);
  const head=new THREE.InstancedMesh(new THREE.SphereGeometry(0.17,8,6).translate(0,1.08,0),new THREE.MeshLambertMaterial({color:0xe8c8a8}),N);
  const col=new THREE.Color();const walkers=[];
  for(let i=0;i<N;i++){const q=paths[i%paths.length];walkers.push({q,s:R()*q.L,v:(R()<0.5?1:-1)*(0.9+R()*0.5),off:(R()-0.5)*q.w*0.6});body.setColorAt(i,col.setHex(CLOTH[i%CLOTH.length]));}
  body.instanceColor.needsUpdate=true;
  for(const m of [body,head]){m.frustumCulled=false;m.userData.noFingerprint=true;m.userData.noWire=true;scene.add(m);}
  const o=new THREE.Object3D();

  // ---- smoke ----
  const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(215,218,214,0.6)');gr.addColorStop(1,'rgba(215,218,214,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const smokeM=new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,opacity:0.45});
  const puffs=[];for(const [x,y,z] of (ctx.shireSmoke||[]))for(let k=0;k<4;k++){const sp=new THREE.Sprite(smokeM);sp.userData.noWire=true;scene.add(sp);puffs.push({sp,x,y,z,ph:k/4+R()*0.1});}

  // ---- the windows after dark ----
  const glass=[];scene.traverse(ob=>{if(ob.isMesh&&ob.material&&ob.material.color&&ob.material.color.getHex()===0x2a2a26&&!glass.includes(ob.material))glass.push(ob.material);});

  // ---- birds ----
  const birdM=new THREE.MeshLambertMaterial({color:0x2e2a26,side:THREE.DoubleSide});
  const birdG=new THREE.BufferGeometry();birdG.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0.2, 0,0,-0.3, 0,0,0.3, 1,0,0.2, 0,0,-0.3, 0,0,0.3],3));birdG.computeVertexNormals();
  const birds=[];const H=V.sites.hill;
  for(let i=0;i<(K.birds||30);i++){const m=new THREE.Mesh(birdG,birdM);m.scale.setScalar(0.4);m.userData.noWire=true;m.userData.noFingerprint=true;scene.add(m);
    birds.push({m,cx:H.x+(R()-0.5)*1800,cz:H.z+400+(R()-0.5)*1200,cy:H.y+20+R()*80,r:30+R()*120,w:(R()<0.5?-1:1)*(0.1+R()*0.15),ph:R()*6.28});}

  animHooks.push(now=>{
    const t=now/1000,n=nf();
    walkers.forEach((w,i)=>{w.s+=w.v*0.016;if(w.s<0){w.s=0;w.v=-w.v;}if(w.s>w.q.L){w.s=w.q.L;w.v=-w.v;}
      const c=w.q.cum;let k=0;while(k<c.length-2&&c[k+1]<w.s)k++;const a=w.q.p[k],b=w.q.p[k+1],f=(w.s-c[k])/Math.max(0.01,c[k+1]-c[k]);
      const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,x=a[0]+dx*f-dz/l*w.off,z=a[1]+dz*f+dx/l*w.off;
      o.position.set(x,groundH(x,z)+Math.abs(Math.sin(t*6+i))*0.04,z);o.rotation.set(0,Math.atan2(dx*w.v,dz*w.v),0);o.updateMatrix();body.setMatrixAt(i,o.matrix);head.setMatrixAt(i,o.matrix);});
    body.instanceMatrix.needsUpdate=true;head.instanceMatrix.needsUpdate=true;
    body.visible=head.visible=n<0.85;
    for(const p of puffs){const a=(t*0.07+p.ph)%1;p.sp.position.set(p.x+a*6,p.y+a*14,p.z+a*3);p.sp.scale.setScalar(0.9+a*5);p.sp.material.opacity=0.45*(1-a);}
    for(const m of glass){if(!m.emissive)continue;m.emissive.setRGB(0.9*n,0.62*n,0.25*n);}
    for(const b of birds){const a=b.ph+t*b.w;b.m.position.set(b.cx+Math.cos(a)*b.r,b.cy+Math.sin(t*0.3+b.ph)*5,b.cz+Math.sin(a)*b.r);b.m.rotation.y=-a;b.m.rotation.z=Math.sin(t*7+b.ph)*0.5;}
  });
  ctx.details=Object.assign(ctx.details||{},{hobbits:N,chimneys:(ctx.shireSmoke||[]).length});
}
