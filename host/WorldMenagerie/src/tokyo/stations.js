// ---------- Tokyo's stations: platforms, canopies, and the people waiting on them ----------
// Wherever a mapped station stands by a line the trains run (src/core/traffic.js stops them there, api.TRAIN_CHAINS
// with their stops), a platform runs beside the track for the length of a ten-car train, a metre above the rails,
// under a canopy on posts. It goes on the side of the track with no other track beside it, and never over another
// platform. People wait on it: a few at midday, none in the small hours, and at the rush (7-9.30 in the morning,
// 17-20 in the evening) the platform is full, as Tokyo's are.
// C.stations: {length, width, far, rush, day}.
export function stations(api){
  const {THREE,C,scene,RAILS,groundH,animHooks,camera,nightF,hour}=api;const K=C.stations;if(!K||!api.TRAIN_CHAINS)return;
  const LEN=K.length||210,WID=K.width||6,FAR=K.far||900,CAN=4.2;
  // every rail segment by 50 m cell, to see which side of a track is free
  const CELL=50,grid=new Map(),key=(x,z)=>Math.floor(x/CELL)+','+Math.floor(z/CELL);
  for(const r of RAILS){if(r.type!=='rail')continue;for(let i=0;i+1<r.pts.length;i++){const a=r.pts[i],b=r.pts[i+1],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/20);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n,kk=key(x,z);if(!grid.has(kk))grid.set(kk,[]);grid.get(kk).push([x,z]);}}}
  const railNear=(x,z,r)=>{let n=0;for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=grid.get((Math.floor(x/CELL)+i)+','+(Math.floor(z/CELL)+j));if(l)for(const [px,pz] of l)if((px-x)**2+(pz-z)**2<r*r)n++;}return n;};
  // a point on a chain, as the traffic places its trains
  const at=(c,s)=>{s=Math.max(0,Math.min(c.len,s));let lo=0,hi=c.cum.length-2;while(lo<hi){const m=(lo+hi+1)>>1;if(c.cum[m]<=s)lo=m;else hi=m-1;}
    const a=c.pts[lo],b=c.pts[lo+1],L=c.cum[lo+1]-c.cum[lo]||1,t=(s-c.cum[lo])/L,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
    return {x,z,y:Math.max(groundH(x,z),(a[2]||0)+((b[2]||0)-(a[2]||0))*t),dx:(b[0]-a[0])/L,dz:(b[1]-a[1])/L};};
  const plats=[],P=[],N=[],Cc=[],col=new THREE.Color(),m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler();
  const BOX=new THREE.BoxGeometry(1,1,1).toNonIndexed();
  const put=(x,y,z,ry,sx,sy,sz,c)=>{m4.compose(v.set(x,y,z),q.setFromEuler(e.set(0,ry,0)),new THREE.Vector3(sx,sy,sz));nm.getNormalMatrix(m4);col.set(c);const p=BOX.attributes.position,n=BOX.attributes.normal;
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m4);P.push(v.x,v.y,v.z);v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);Cc.push(col.r,col.g,col.b);}};
  const clash=(x,z)=>plats.some(p=>p.pts.some(([px,pz])=>(px-x)**2+(pz-z)**2<(WID+1)**2));
  for(const c of api.TRAIN_CHAINS)for(const st of c.stops||[]){
    const mid=at(c,st),off=1.6+WID/2;
    // the free side: count the other track within reach of the platform's middle on each side
    let side=0,best=1e9;for(const sd of [-1,1]){const x=mid.x-mid.dz*off*sd,z=mid.z+mid.dx*off*sd,n=railNear(x,z,WID/2+1)+(clash(x,z)?99:0);if(n<best){best=n;side=sd;}}
    if(best>=99)continue;
    const pts=[],segs=[];for(let s=st-LEN/2;s<=st+LEN/2;s+=15){const p=at(c,s),x=p.x-p.dz*off*side,z=p.z+p.dx*off*side;pts.push([x,z]);segs.push([x,p.y,z,Math.atan2(-p.dz,p.dx)]);}
    if(pts.some(([x,z])=>clash(x,z)))continue;
    for(let i=0;i+1<segs.length;i++){const [x0,y0,z0,r0]=segs[i],[x1,y1,z1]=segs[i+1],x=(x0+x1)/2,z=(z0+z1)/2,y=(y0+y1)/2,L=Math.hypot(x1-x0,z1-z0)+0.4,ry=-Math.atan2(z1-z0,x1-x0);
      put(x,y+0.15,z,ry,L,2.1,WID,'#b8b4aa');put(x,y+1.215,z,ry,L,0.03,WID,'#a8a49a');
      // the yellow tactile line along the edge
      put(x+Math.sin(ry)*(WID/2-0.6)*side,y+1.235,z+Math.cos(ry)*(WID/2-0.6)*side,ry,L,0.02,0.3,'#e8c020');
      put(x,y+1.2+CAN,z,ry,L,0.25,WID-0.6,'#d8dad6');
      if(i%2===0)put(x0,y+1.2+CAN/2,z0,0,0.25,CAN,0.25,'#6a6e72');}
    // the station's name board in the middle
    const [mx,my,mz,mr]=segs[segs.length>>1];put(mx,my+1.2+CAN-0.8,mz,-mr,2.2,0.5,0.08,'#f4f4f0');
    plats.push({pts,segs,side,cx:mid.x,cz:mid.z});}
  if(P.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));g.computeBoundingSphere();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));m.castShadow=m.receiveShadow=true;scene.add(m);}
  // ---- the people waiting: a few per platform, many at the rush ----
  const PB=[[new THREE.BoxGeometry(0.22,0.85,0.34),'#26262c',0,0.43,0],[new THREE.BoxGeometry(0.3,0.68,0.46),'#ffffff',0,1.18,0],[new THREE.SphereGeometry(0.13,6,4),'#d9b08c',0,1.66,0]];
  const pos=[],nor=[],cl=[];for(const [g0,c,x,y,z] of PB){const g=g0.toNonIndexed().translate(x,y,z),p=g.attributes.position,n=g.attributes.normal,cc=new THREE.Color(c);for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));cl.push(cc.r,cc.g,cc.b);}}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));pg.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));pg.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
  const PER=K.rush||70,spots=[];let seed=7;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const SUIT=['#1e2026','#2a2c34','#3a3c44','#e8e6e0','#f2f0ea','#5a4a3e','#8a8a92','#c84a5a'].map(c=>new THREE.Color(c));
  for(const p of plats)for(let k=0;k<PER;k++){const sg=p.segs[Math.floor(R()*(p.segs.length-1))],sg2=p.segs[Math.min(p.segs.length-1,p.segs.indexOf(sg)+1)],t=R(),x=sg[0]+(sg2[0]-sg[0])*t,z=sg[2]+(sg2[2]-sg[2])*t,ry=-Math.atan2(sg2[2]-sg[2],sg2[0]-sg[0]),across=(R()-0.5)*(WID-1.6);
    spots.push({x:x+Math.sin(ry)*across,y:sg[1]+1.24,z:z+Math.cos(ry)*across,ry:ry+Math.PI/2*p.side+(R()-0.5)*0.8,rank:R(),col:SUIT[Math.floor(R()*SUIT.length)],p});}
  const im=new THREE.InstancedMesh(pg,new THREE.MeshLambertMaterial({vertexColors:true}),Math.max(1,spots.length));im.frustumCulled=false;
  spots.forEach((s,i)=>im.setColorAt(i,s.col));im.count=0;scene.add(im);
  // how full: 0 in the small hours, a little through the day, full at the two rushes
  const fill=h=>{if(h<5||h>=24.5)return 0;const rush=(a,b)=>Math.max(0,1-Math.abs(h-(a+b)/2)/((b-a)/2));return Math.min(1,(K.day||0.18)+0.85*Math.max(rush(7,9.5),rush(17,20))-(h>22?0.1:0));};
  const d=new THREE.Object3D();let last=-1,lastCam=null;
  animHooks.push(now=>{if(now-last<500)return;last=now;const f=fill(hour()),cx=camera.position.x,cz=camera.position.z;let n=0;
    for(const s of spots){if(s.rank>f)continue;if((s.p.cx-cx)**2+(s.p.cz-cz)**2>FAR*FAR)continue;d.position.set(s.x,s.y,s.z);d.rotation.set(0,s.ry,0);d.updateMatrix();im.setMatrixAt(n,d.matrix);im.setColorAt(n,s.col);n++;}
    im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;api.ctx.details.platformPeople=n;});
  api.ctx.details=Object.assign(api.ctx.details||{},{platforms:plats.length});
  if(/stationdebug/.test(api.HASH0||''))api.ctx.details.platformsAt=plats.slice(0,12).map(p=>{const s0=p.segs[0],s1=p.segs[p.segs.length-1];return [Math.round(p.cx),Math.round(p.segs[p.segs.length>>1][1]),Math.round(p.cz),Math.round(s1[0]-s0[0]),Math.round(s1[2]-s0[2]),p.side];});
}
