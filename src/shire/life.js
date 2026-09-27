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

  // ---- the lamps by the gates and the inn door, lit at dusk ----
  const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,220,150,1)');gr.addColorStop(0.25,'rgba(255,190,110,0.5)');gr.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const glowM=new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
  for(const [x,y,z] of (ctx.shireLamps||[])){const sp=new THREE.Sprite(glowM);sp.position.set(x,y,z);sp.scale.setScalar(2.2);sp.userData.noWire=true;scene.add(sp);}

  // ---- Gandalf's cart: the grey pointed hat on a little cart with a pony, coming up the Hill lane to Bag End,
  //      and back down it again, as in the first shots of the first film ----
  const cart=new THREE.Group();{const M=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
    const box=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);m.castShadow=true;cart.add(m);return m;};
    box(1.4,0.35,2.2,0x7a5a3a,0,0.75,0);for(const sd of [-1,1]){box(0.06,0.35,2.2,0x6a4a2a,sd*0.7,1.05,0);
      const w=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.1,12).rotateZ(Math.PI/2),M(0x4a3a2a));w.position.set(sd*0.8,0.5,-0.2);cart.add(w);}
    box(0.9,0.3,0.4,0x8a6a4a,0,1.05,-0.6);                                                     // the seat
    const robe=new THREE.Mesh(new THREE.ConeGeometry(0.42,1.3,8),M(0x8c8c8a));robe.position.set(0,1.75,-0.6);cart.add(robe);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),M(0xe0c0a0));head.position.set(0,2.45,-0.6);cart.add(head);
    const beard=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.6,6).rotateX(Math.PI),M(0xdcdcd8));beard.position.set(0,2.15,-0.5);cart.add(beard);
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.03,14),M(0x6e6e70));brim.position.set(0,2.58,-0.6);cart.add(brim);
    const hat=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.95,10),M(0x6e6e70));hat.position.set(0.05,3.05,-0.62);hat.rotation.z=-0.18;cart.add(hat);
    box(0.5,0.4,0.4,0x9a7a4a,0.3,1.1,0.6);box(0.35,0.3,0.35,0x8a6a3a,-0.3,1.05,0.5);                // the fireworks, in crates
    const pony=new THREE.Group();pony.position.set(0,0,-2.4);cart.add(pony);
    const pb=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.6,1.3),M(0x8a6a4a));pb.position.y=1.0;pony.add(pb);
    const pn=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.6,0.35),M(0x8a6a4a));pn.position.set(0,1.45,-0.7);pn.rotation.x=0.5;pony.add(pn);
    const pm=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.35,0.5),M(0x3a2a1a));pm.position.set(0,1.6,-0.6);pony.add(pm);
    const legs=[];for(const [lx,lz] of [[-0.18,-0.5],[0.18,-0.5],[-0.18,0.5],[0.18,0.5]]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.7,0.12).translate(0,-0.35,0),M(0x6a4a3a));l.position.set(lx,0.72,lz);pony.add(l);legs.push(l);}
    cart.userData.legs=legs;}
  cart.traverse(m=>{m.userData.noFingerprint=true;m.userData.noWire=true;});scene.add(cart);
  const hl=V.lanes.find(l=>l.n==='The Hill lane');
  const cq=hl?(()=>{const p=hl.p,cum=[0];for(let i=1;i<p.length;i++)cum.push(cum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return {p,cum,L:cum[cum.length-1]};})():null;
  ctx.shireCart=cart;

  animHooks.push(now=>{
    const t=now/1000,n=nf();
    glowM.opacity=Math.min(1,n*1.3);
    if(cq){const per=cq.L/1.6,ph=(t/per)%2,s=(ph<1?ph:2-ph)*cq.L,dir=ph<1?1:-1;
      const c=cq.cum;let k=0;while(k<c.length-2&&c[k+1]<s)k++;const a=cq.p[k],b=cq.p[k+1],f=(s-c[k])/Math.max(0.01,c[k+1]-c[k]);
      const dx=b[0]-a[0],dz=b[1]-a[1],x=a[0]+dx*f,z=a[1]+dz*f;
      cart.position.set(x,groundH(x,z),z);cart.rotation.y=Math.atan2(-dx*dir,-dz*dir);
      cart.userData.legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*7+(i%2?Math.PI:0)+(i>1?Math.PI:0))*0.4;});}
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
