// ---------- the L: every elevated CTA track in OpenStreetMap on its steel structure, station platforms, and trains running the joined lines ----------
await stage('el');
const polyLen=r=>{let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;return r;};
const polyAt=(r,s,wrap)=>{s=wrap?((s%r.len)+r.len)%r.len:Math.max(0,Math.min(r.len,s));let lo=0,hi=r.cum.length-2;while(lo<hi){const mid=(lo+hi+1)>>1;if(r.cum[mid]<=s)lo=mid;else hi=mid-1;}
  const i=lo,a=r.pts[i],b=r.pts[i+1],u=(s-r.cum[i])/((r.cum[i+1]-r.cum[i])||1);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];};
// join polylines that share an end point into longer chains
function joinChains(lines,tol){const key=p=>Math.round(p[0]/tol)+','+Math.round(p[1]/tol),left=lines.map(l=>l.slice()),out=[];
  while(left.length){let c=left.pop(),grew=true;while(grew){grew=false;for(let i=0;i<left.length;i++){const d=left[i];
      if(key(d[0])===key(c[c.length-1])){c=c.concat(d.slice(1));}else if(key(d[d.length-1])===key(c[c.length-1])){c=c.concat(d.slice(0,-1).reverse());}
      else if(key(d[d.length-1])===key(c[0])){c=d.slice(0,-1).concat(c);}else if(key(d[0])===key(c[0])){c=d.slice(1).reverse().concat(c);}else continue;left.splice(i,1);grew=true;break;}}out.push(c);}return out;}
section('el',()=>{
  const H=C.el.height||8,elev=RAILS.filter(r=>r.type==='L'&&r.elevated);
  const deck=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true}),dc=col('#5e6166');
  const cols=[];
  for(const r of elev){deck.ribbon(r.pts,4.2,H,dc,1.2);let carry=0;
    for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);for(let s=carry;s<L;s+=14)cols.push([ax+(bx-ax)*s/L,az+(bz-az)*s/L]);carry=Math.max(0,14-((L-carry)%14));}}
  deck.build('L structure');
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,1,0.6).translate(0,0.5,0),steelM,Math.max(1,cols.length)),d=new THREE.Object3D();
  cols.forEach(([x,z],i)=>{d.position.set(x,0,z);d.scale.set(1,H-0.6,1);d.updateMatrix();cm.setMatrixAt(i,d.matrix);});cm.count=cols.length;cm.castShadow=true;scene.add(cm);
  // stations on the elevated lines: platforms and a canopy along the track
  const platM=new THREE.MeshLambertMaterial({color:0xa8a49a}),canM=new THREE.MeshLambertMaterial({color:0x2a5aa8});let nst=0;
  for(const s of STATIONS){let best=null;for(const r of elev)for(let i=0;i+1<r.pts.length;i++){const dd=segDist(s.x,s.z,r.pts[i][0],r.pts[i][1],r.pts[i+1][0],r.pts[i+1][1]);if(dd<45&&(!best||dd<best.d))best={d:dd,a:r.pts[i],b:r.pts[i+1]};}
    if(!best)continue;const ang=Math.atan2(best.b[1]-best.a[1],best.b[0]-best.a[0]),t=((s.x-best.a[0])*(best.b[0]-best.a[0])+(s.z-best.a[1])*(best.b[1]-best.a[1]))/Math.max(1,(best.b[0]-best.a[0])**2+(best.b[1]-best.a[1])**2),tt=Math.max(0,Math.min(1,t));
    const x=best.a[0]+(best.b[0]-best.a[0])*tt,z=best.a[1]+(best.b[1]-best.a[1])*tt,g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-ang;
    for(const sd of [-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(120,0.8,3.5),platM);pl.position.set(0,H+0.3,sd*4.2);const cn=new THREE.Mesh(new THREE.BoxGeometry(70,0.3,4),canM);cn.position.set(0,H+4,sd*4.2);g.add(pl,cn);}
    g.userData.info={name:s.name+' station',info:'CTA ’L’ station (elevated).'};g.traverse(o=>o.userData.info=g.userData.info);LANDMARKS.push(g);scene.add(g);nst++;}
  // trains: the joined elevated lines long enough to run on, a train or two each, slowing at stations
  const lines=joinChains(elev.map(r=>r.pts),3).map(p=>polyLen({pts:p})).filter(r=>r.len>700);
  const carL=14.6,N=C.el.trainCars||6,carM=new THREE.MeshLambertMaterial({color:0xcfd5dc,emissive:0x000000}),trains=[];
  for(const r of lines){const k=r.len>3000?2:1;for(let i=0;i<k;i++)trains.push({r,s:(i+0.3)*r.len/k,dir:i%2?1:-1,v:13});}
  const tm=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,3.4,3),carM,Math.max(1,trains.length*N));tm.castShadow=true;tm.frustumCulled=false;scene.add(tm);
  const stS=lines.map(r=>STATIONS.map(s=>{let bs=-1,bd=60;for(let q=0;q<=r.len;q+=10){const [px,pz]=polyAt(r,q);const dd=Math.hypot(px-s.x,pz-s.z);if(dd<bd){bd=dd;bs=q;}}return bs;}).filter(q=>q>=0));
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const tr of trains){const li=lines.indexOf(tr.r),slow=stS[li].some(q=>Math.abs(q-tr.s)<90);tr.s+=tr.dir*(slow?4:tr.v)*dt;
      if(tr.s>tr.r.len-5)tr.dir=-1;if(tr.s<5+N*(carL+1))tr.dir=1;
      for(let c=0;c<N;c++){const [x,z,a]=polyAt(tr.r,tr.s-tr.dir*c*(carL+1)),o=tr.dir*1.1;d.position.set(x-Math.sin(a)*o,H+2.3,z+Math.cos(a)*o);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();tm.setMatrixAt(i++,d.matrix);}}
    tm.count=i;tm.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);carM.emissive.setRGB(w*0.9,w*0.85,w*0.6);});
  ctx.details=Object.assign(ctx.details||{},{elevatedTrack:elev.length,stations:nst,trainLines:lines.length,trains:trains.length});
});
// Metra: double-deck silver trains on the commuter lines at grade and on their embankments
section('metra',()=>{
  const lines=joinChains(RAILS.filter(r=>r.type==='rail').map(r=>r.pts),3).map(p=>polyLen({pts:p})).filter(r=>r.len>1500).sort((a,b)=>b.len-a.len).slice(0,8);
  const carL=26,N=6,m=new THREE.MeshLambertMaterial({color:0xb8bec4,emissive:0x000000}),band=new THREE.MeshLambertMaterial({color:0x2a3a5a});
  const trains=lines.map((r,i)=>({r,s:r.len*((i*0.37)%1),dir:i%2?1:-1,v:14}));
  const body=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,4.6,3).translate(0,2.9,0),m,Math.max(1,trains.length*N)),stripe=new THREE.InstancedMesh(new THREE.BoxGeometry(carL+0.05,0.5,3.05).translate(0,3.2,0),band,Math.max(1,trains.length*N)),d=new THREE.Object3D();
  body.frustumCulled=stripe.frustumCulled=false;body.castShadow=true;scene.add(body,stripe);let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const t of trains){t.s+=t.dir*t.v*dt;if(t.s>t.r.len-5)t.dir=-1;if(t.s<N*(carL+1)+5)t.dir=1;
      for(let c=0;c<N;c++){const [x,z,a]=polyAt(t.r,t.s-t.dir*c*(carL+1));d.position.set(x,0.2,z);d.rotation.set(0,-a,0);d.updateMatrix();body.setMatrixAt(i,d.matrix);stripe.setMatrixAt(i,d.matrix);i++;}}
    body.count=stripe.count=i;body.instanceMatrix.needsUpdate=stripe.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);m.emissive.setRGB(w*0.5,w*0.48,w*0.35);});
  ctx.details=Object.assign(ctx.details||{},{metraTrains:trains.length});
});
