// ---------- traffic on the real streets and water: cars on Lake Shore Drive and the arterials (up onto the bridges), cyclists and runners on the
// Lakefront Trail, tour boats on the river's own course, and a working lake: sailboats, motorboats, the cruise ship and water taxis from Navy Pier,
// boats moored in every mapped marina (Montrose, Belmont, Diversey, DuSable, Monroe, Burnham), a freighter ----------
await stage('traffic');
section('traffic',()=>{
  // routes: ways of the same named arterial joined end to end
  const CAR=new Set(['motorway','trunk','primary','secondary']);const groups=new Map();
  for(const r of ROADS){if(!CAR.has(r.c)||!r.name)continue;let g=groups.get(r.name);if(!g){g=[];groups.set(r.name,g);}g.push(r);}
  const routes=[];
  for(const [name,rs] of groups){const chains=joinChains(rs.map(r=>r.pts.map((p,i)=>[p[0],p[1],r.ys?r.ys[i]:0])),2);
    for(const pts of chains){const r=polyLen({pts});if(r.len<250)continue;r.w=rs[0].w;r.y=pts.map(p=>p[2]||0);r.name=name;routes.push(r);}}
  const TRAF=C.traffic===undefined?1:C.traffic;
  const cars=[];for(const r of routes){const n=Math.floor(r.len/(/Lake Shore/i.test(r.name)?60:140)*TRAF);for(const dir of [-1,1])for(let k=0;k<n;k++)cars.push({r,dir,s:xr()*r.len,v:(/Lake Shore/i.test(r.name)?17:10)+xr()*6,off:dir*Math.min(r.w/4,5)});}
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(4.4,1.4,1.9).translate(0,0.7,0),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,cars.length)),col2=new THREE.Color(),d=new THREE.Object3D();
  const cab=new THREE.InstancedMesh(new THREE.BoxGeometry(2.3,0.75,1.8).translate(-0.3,1.75,0),new THREE.MeshLambertMaterial({color:0x26303a}),Math.max(1,cars.length));
  cars.forEach((c,i)=>cm.setColorAt(i,DRAB?col2.setHSL(0.05+xr()*0.09,0.1+xr()*0.12,0.13+xr()*0.18):col2.setHSL(xr(),0.45,0.3+xr()*0.4)));cm.frustumCulled=cab.frustumCulled=false;scene.add(cm,cab);
  // the deck height along a route at arc length s (the nearest vertex's height, smoothed over the bridge ends)
  const yAt=(r,s)=>{s=((s%r.len)+r.len)%r.len;let lo=0,hi=r.cum.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(r.cum[mid]<=s)lo=mid;else hi=mid-1;}const i=lo,j=Math.min(r.cum.length-1,i+1),u=(s-r.cum[i])/((r.cum[j]-r.cum[i])||1);return r.y[i]+(r.y[j]-r.y[i])*u;};
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(let i=0;i<cars.length;i++){const c=cars[i];c.s+=c.dir*c.v*dt;const [x0,z0,a]=polyAt(c.r,c.s,true),x=x0-Math.sin(a)*c.off,z=z0+Math.cos(a)*c.off;
      d.position.set(x,yAt(c.r,c.s)+0.1,z);d.rotation.set(0,-a+(c.dir<0?Math.PI:0),0);d.scale.set(1,1,1);d.updateMatrix();cm.setMatrixAt(i,d.matrix);cab.setMatrixAt(i,d.matrix);}
    cm.instanceMatrix.needsUpdate=cab.instanceMatrix.needsUpdate=true;});
  // the Lakefront Trail: cyclists and runners both ways
  const trailRe=new RegExp(C.trails||'Lakefront Trail','i');   // which named trails get cyclists and runners
  const trail=joinChains(ROADS.filter(r=>(r.c==='trail'||r.c==='pedestrian')&&trailRe.test(r.name)).map(r=>r.pts),3).map(p=>polyLen({pts:p})).filter(r=>r.len>300);
  const users=[];for(const r of trail){const n=Math.floor(r.len/90);for(let k=0;k<n;k++){const bike=xr()<0.6;users.push({r,s:xr()*r.len,dir:xr()<0.5?-1:1,v:bike?5+xr()*3:2.4+xr()*1.2,bike,off:(xr()-0.5)*2.5,col:xr()});}}
  const um=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25,0.3,1.4,6).translate(0,0.95,0),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,users.length)),bm=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,0.6,0.15).translate(0,0.35,0),new THREE.MeshLambertMaterial({color:0x222222}),Math.max(1,users.length));
  users.forEach((u,i)=>um.setColorAt(i,col2.setHSL(u.col,0.7,0.5)));um.frustumCulled=bm.frustumCulled=false;scene.add(um,bm);
  let lastU=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-lastU)/1000);lastU=now;
    users.forEach((u,i)=>{u.s+=u.dir*u.v*dt;const [x0,z0,a]=polyAt(u.r,u.s,true),x=x0-Math.sin(a)*u.off,z=z0+Math.cos(a)*u.off;d.position.set(x,u.bike?0:Math.abs(Math.sin(now*0.012+i))*0.08,z);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();um.setMatrixAt(i,d.matrix);
      d.scale.setScalar(u.bike?1:0.001);d.updateMatrix();bm.setMatrixAt(i,d.matrix);});um.instanceMatrix.needsUpdate=bm.instanceMatrix.needsUpdate=true;});
  ctx.details=Object.assign(ctx.details||{},{carRoutes:routes.length,cars:cars.length,trailUsers:users.length});
});
section('boats',()=>{
  const white=new THREE.MeshLambertMaterial({color:0xf2f0ea}),navy=new THREE.MeshLambertMaterial({color:0x223a5a}),glass=new THREE.MeshLambertMaterial({color:0x2a3a48});
  const sailM=new THREE.MeshLambertMaterial({color:0xfbfaf4,side:THREE.DoubleSide}),mastM=new THREE.MeshLambertMaterial({color:0xb0b4b8}),yellow=new THREE.MeshLambertMaterial({color:0xf2c230}),red=new THREE.MeshLambertMaterial({color:0xa02a24});
  const wakeM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5,depthWrite:false});
  const hullG=(L,W,H)=>{const s=new THREE.Shape();s.moveTo(-L/2,-W/2);s.lineTo(L*0.18,-W/2);s.quadraticCurveTo(L*0.45,-W*0.3,L/2,0);s.quadraticCurveTo(L*0.45,W*0.3,L*0.18,W/2);s.lineTo(-L/2,W/2);s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:H,bevelEnabled:false});g.rotateX(-Math.PI/2);return g;};
  const wake=(len,w)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0.08,0,-len,0.08,-w,-len,0.08,w],3));g.computeVertexNormals();const m=new THREE.Mesh(g,wakeM.clone());m.material.side=THREE.DoubleSide;return m;};
  // open water: lake cells at least `m` metres from any shore, pier or breakwater, and outside the marinas
  const inMarina=(x,z)=>MARINAS.some(m=>inRec(m,x,z));
  const openLake=(x,z,m)=>{m=m||60;return inLake(x,z)&&inLake(x+m,z)&&inLake(x-m,z)&&inLake(x,z+m)&&inLake(x,z-m)&&z>B.z0+60&&z<B.z1-60&&x<B.x1+2500&&!inMarina(x,z);};
  const shoreX=z=>{let best=B.x1;for(let x=B.x0;x<B.x1;x+=40)if(inLake(x,z)&&inLake(x+80,z)){best=x;break;}return best;};
  const pick=(R,m)=>{for(let t=0;t<400;t++){const z=B.z0+R()*B.d,sx=shoreX(z),x=sx+120+Math.pow(R(),1.7)*2600;if(openLake(x,z,m))return [x,z];}return [B.x1+500,B.cz];};
  const R=mkRng(2026),movers=[],WIND=0.35;
  const HAS_LAKE=LAKE.length>2;
  for(let k=0;k<(HAS_LAKE?60:0);k++){const L=8+R()*7,g=new THREE.Group();g.add(new THREE.Mesh(hullG(L,L*0.32,1.1),R()<0.2?navy:white));
    const rig=new THREE.Group();rig.position.y=1.1;g.add(rig);const mh=L*1.35,mast=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,mh,5),mastM);mast.position.set(L*0.05,mh/2,0);rig.add(mast);
    const tri=(a,b,c)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c],3));t.computeVertexNormals();return new THREE.Mesh(t,sailM);};
    rig.add(tri([L*0.05,0.8,0],[L*0.05,mh,0],[-L*0.4,0.9,0]),tri([L*0.1,mh*0.85,0],[L*0.46,0.3,0],[L*0.08,0.6,0]));
    const [x,z]=pick(R,70);scene.add(g);movers.push({kind:'sail',g,rig,x,z,a:WIND+(R()<0.5?1:-1)*(1.0+R()*0.5),v:2.5+R()*2,tack:0});}
  for(let k=0;k<(HAS_LAKE?26:0);k++){const fast=k<10,L=fast?7+R()*3:14+R()*10,g=new THREE.Group();g.add(new THREE.Mesh(hullG(L,L*(fast?0.36:0.3),fast?1:1.8),fast&&R()<0.5?red:white));
    if(fast){const w=new THREE.Mesh(new THREE.BoxGeometry(L*0.25,0.7,L*0.3),glass);w.position.set(-L*0.05,1.35,0);g.add(w);}
    else{const cab=new THREE.Mesh(new THREE.BoxGeometry(L*0.45,2,L*0.22),white);cab.position.set(-L*0.08,2.8,0);const win=new THREE.Mesh(new THREE.BoxGeometry(L*0.46,0.7,L*0.23),glass);win.position.set(-L*0.08,3.2,0);g.add(cab,win);}
    const wk=wake(L*(fast?4:2.5),L*(fast?1.1:0.7));wk.position.x=-L/2;g.add(wk);const [x,z]=pick(R,60);scene.add(g);movers.push({kind:'motor',g,wk,x,z,a:R()*6.28,v:fast?14+R()*8:5+R()*4});}
  // Navy Pier's boats: the cruise ship loops out and back; water taxis run to the Museum Campus
  const pierL=C.landmarks.find(l=>l.name==='Navy Pier'),[px,pz]=P(pierL?pierL.at:[41.8917,-87.6045]),[mcx,mcz]=P([41.8676,-87.6120]);
  if(pierL){
  const cruise=new THREE.Group();{const L=60;cruise.add(new THREE.Mesh(hullG(L,15,2.6),white));for(let k=0;k<3;k++){const deck=new THREE.Mesh(new THREE.BoxGeometry(L*(0.72-k*0.14),2.6,13-k*2),k===1?glass:white);deck.position.set(-L*0.06,3.9+k*2.6,0);cruise.add(deck);}const wk=wake(160,30);wk.position.x=-L/2;cruise.add(wk);scene.add(cruise);}
  movers.push({kind:'path',g:cruise,r:polyLen({pts:[[px-200,pz+120],[px+700,pz+300],[px+1800,pz-400],[px+2200,pz+1200],[px+900,pz+1600],[px-200,pz+300],[px-200,pz+120]]}),s:0,v:6,wrap:true});
  for(let k=0;k<3;k++){const g=new THREE.Group(),L=16;g.add(new THREE.Mesh(hullG(L,5,1.4),yellow));const top=new THREE.Mesh(new THREE.BoxGeometry(9,2,4),yellow);top.position.set(-1,2.4,0);const roof=new THREE.Mesh(new THREE.BoxGeometry(10,0.3,4.6),white);roof.position.set(-1,3.5,0);g.add(top,roof);
    const wk=wake(40,6);wk.position.x=-L/2;g.add(wk);scene.add(g);movers.push({kind:'path',g,r:polyLen({pts:[[px-300,pz+90],[px-150,pz+700],[mcx+700,mcz-900],[mcx+200,mcz-80]]}),s:k*400,v:7,dir:k%2?1:-1});}
  const freighter=new THREE.Group();{const L=210;freighter.add(new THREE.Mesh(hullG(L,23,9),red));const deck=new THREE.Mesh(new THREE.BoxGeometry(L*0.8,1.2,21),new THREE.MeshLambertMaterial({color:0x3a3a3a}));deck.position.set(0,9.6,0);
    const house=new THREE.Mesh(new THREE.BoxGeometry(18,12,20),white);house.position.set(-L*0.42,15,0);freighter.add(deck,house);scene.add(freighter);}
  movers.push({kind:'path',g:freighter,r:polyLen({pts:[[B.x1+2400,B.z0-400],[B.x1+2600,B.z1+400]]}),s:0,v:4,dir:1});}   // Navy Pier's cruise ship, water taxis and the lake freighter
  // moored boats: a grid of slips inside every mapped marina polygon, bobbing
  const moored=[];for(const m of MARINAS){const R2=mkRng(Math.round(m.bb.x0*3+m.bb.z0)),mine=[];for(let z=m.bb.z0+8;z<m.bb.z1-6;z+=22)for(let x=m.bb.x0+8;x<m.bb.x1-6;x+=13)if(inRec(m,x,z)&&inWater(x,z)&&R2()<0.55)mine.push([x+R2()*2,z+R2()*2,R2()<0.5?Math.PI/2:-Math.PI/2,R2()<0.65]);
    for(let i=mine.length-1;i>0;i--){const j=Math.floor(R2()*(i+1));[mine[i],mine[j]]=[mine[j],mine[i]];}moored.push(...mine.slice(0,450));}   // at most 450 boats a marina
  {const n=Math.max(1,moored.length),hulls=new THREE.InstancedMesh(hullG(9,3,1),white,n),masts=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06,0.08,11,4).translate(0,6.5,0),mastM,n),dd=new THREE.Object3D();
   const put=now=>{moored.forEach(([x,z,a,sail],i)=>{dd.position.set(x,Math.sin(now*0.0012+x*0.3)*0.15,z);dd.rotation.set(Math.sin(now*0.001+z)*0.03,a,Math.sin(now*0.0013+x)*0.04);dd.scale.set(1,1,1);dd.updateMatrix();hulls.setMatrixAt(i,dd.matrix);dd.scale.set(1,sail?1:0.001,1);dd.updateMatrix();masts.setMatrixAt(i,dd.matrix);});hulls.instanceMatrix.needsUpdate=masts.instanceMatrix.needsUpdate=true;};
   put(0);hulls.count=masts.count=moored.length;hulls.frustumCulled=masts.frustumCulled=false;scene.add(hulls,masts);let t0=0;animHooks.push(now=>{if(now-t0<150)return;t0=now;put(now);});}
  // river tour boats along the Chicago River's mapped centre line
  const riverRe=new RegExp(C.riverTours||'Chicago River','i');
  const river=joinChains(WATERWAYS.filter(w=>riverRe.test(w.name)).map(w=>w.pts),3).map(p=>polyLen({pts:p})).filter(r=>r.len>400);
  for(const r of river){const n=Math.min(4,Math.max(1,Math.round(r.len/1500)));for(let k=0;k<n;k++){const g=new THREE.Group();g.add(new THREE.Mesh(hullG(26,7,1.4),white));const top=new THREE.Mesh(new THREE.BoxGeometry(18,1.8,5.6),navy);top.position.set(-2,2.3,0);g.add(top);scene.add(g);
    movers.push({kind:'path',g,r,s:(k+0.5)/n*r.len,v:3.5+R()*2,dir:k%2?1:-1,off:7});}}
  // a working river (Portland): sailboats and motorboats that stay in the channel, kayaks near the banks
  if(C.riverBoats){const RB=C.riverBoats,inCh=(x,z,m)=>inRiver(x,z)&&inRiver(x+m,z)&&inRiver(x-m,z)&&inRiver(x,z+m)&&inRiver(x,z-m),cells=[];
    for(let j=0;j<WNZ;j+=2)for(let i=0;i<WNX;i+=2)if(WGRID[j*WNX+i]===2){const x=B.x0+(i+0.5)*WG,z=B.z0+(j+0.5)*WG;if(inCh(x,z,40))cells.push([x,z]);}
    const spot=()=>cells.length?cells[Math.floor(R()*cells.length)]:null;
    for(let k=0;k<(RB.sail||0);k++){const p=spot();if(!p)break;const L=7+R()*4,g=new THREE.Group();g.add(new THREE.Mesh(hullG(L,L*0.32,1),white));const rig=new THREE.Group();rig.position.y=1;g.add(rig);const mh=L*1.3;
      const tri=(a,b,c2)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c2],3));t.computeVertexNormals();return new THREE.Mesh(t,sailM);};rig.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,mh,5).translate(L*0.05,mh/2,0),mastM),tri([L*0.05,0.8,0],[L*0.05,mh,0],[-L*0.4,0.9,0]));
      scene.add(g);movers.push({kind:'riv',g,rig,x:p[0],z:p[1],a:R()*6.28,v:1.8+R()*1.5,m:30});}
    for(let k=0;k<(RB.motor||0);k++){const p=spot();if(!p)break;const L=8+R()*8,g=new THREE.Group();g.add(new THREE.Mesh(hullG(L,L*0.33,1.4),R()<0.4?red:white));const cab=new THREE.Mesh(new THREE.BoxGeometry(L*0.35,1.6,L*0.22),glass);cab.position.set(-L*0.1,2.1,0);g.add(cab);
      const wk=wake(L*3,L*0.8);wk.position.x=-L/2;g.add(wk);scene.add(g);movers.push({kind:'riv',g,x:p[0],z:p[1],a:R()*6.28,v:5+R()*6,m:25});}
    const kayakM=[0xe8a020,0xd03a2a,0x2a8ad0,0x3aa050].map(c2=>new THREE.MeshLambertMaterial({color:c2}));
    for(let k=0;k<(RB.kayak||0);k++){const p=spot();if(!p)break;const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),kayakM[k%4]);hull.scale.set(2.2,0.28,0.38);hull.position.y=0.2;
      const pad=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,0.9,6),new THREE.MeshLambertMaterial({color:0x2a3a4a}));pad.position.y=0.8;g.add(hull,pad);scene.add(g);movers.push({kind:'riv',g,x:p[0],z:p[1],a:R()*6.28,v:1+R(),m:12});}}
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const T=now/1000;
    for(const m of movers){
      if(m.kind==='sail'){const nx=m.x+Math.cos(m.a)*m.v*dt,nz=m.z+Math.sin(m.a)*m.v*dt;
        if(m.tack>0){m.tack-=dt;m.a+=(m.ta-m.a)*Math.min(1,dt*0.8);}else if(!openLake(nx+Math.cos(m.a)*90,nz+Math.sin(m.a)*90,30)){m.ta=WIND+(Math.sin(m.a-WIND)>0?-1:1)*(1.1+((m.x*13)%1)*0.4);m.tack=4;}else{m.x=nx;m.z=nz;}
        const side=Math.sin(m.a-WIND)>0?1:-1;m.g.position.set(m.x,0.2+Math.sin(T*1.3+m.x)*0.12,m.z);m.g.rotation.set(side*0.14*(m.tack>0?0.2:1),-m.a,0);m.rig.rotation.y=side*0.45;}
      else if(m.kind==='riv'){const nx=m.x+Math.cos(m.a)*m.v*dt,nz=m.z+Math.sin(m.a)*m.v*dt,ok=(x,z)=>inRiver(x,z)&&inRiver(x+m.m,z)&&inRiver(x-m.m,z)&&inRiver(x,z+m.m)&&inRiver(x,z-m.m);
        if(ok(nx+Math.cos(m.a)*m.m*2,nz+Math.sin(m.a)*m.m*2)){m.x=nx;m.z=nz;m.a+=Math.sin(T*0.1+m.x)*0.05*dt;}else m.a+=dt*1.2;
        m.g.position.set(m.x,0.15+Math.sin(T*1.4+m.x)*0.08,m.z);m.g.rotation.set(0,-m.a,0);if(m.rig)m.rig.rotation.y=0.4;}
      else if(m.kind==='motor'){const nx=m.x+Math.cos(m.a)*m.v*dt,nz=m.z+Math.sin(m.a)*m.v*dt;if(!openLake(nx+Math.cos(m.a)*130,nz+Math.sin(m.a)*130,30))m.a+=dt*0.9;else{m.x=nx;m.z=nz;}
        m.g.position.set(m.x,0.1+Math.sin(T*2+m.z)*0.08,m.z);m.g.rotation.set(0,-m.a,0);m.wk.material.opacity=0.35+0.15*Math.sin(T*3+m.x);}
      else{m.dir=m.dir||1;m.s+=m.dir*m.v*dt;if(!m.wrap){if(m.s>m.r.len-30){m.s=m.r.len-30;m.dir=-1;}if(m.s<30){m.s=30;m.dir=1;}}
        const [x,z,a]=polyAt(m.r,m.s,m.wrap),o=(m.off||0)*m.dir;m.g.position.set(x-Math.sin(a)*o,0.25+Math.sin(T+x)*0.08,z+Math.cos(a)*o);m.g.rotation.y=-a+(m.dir>0?0:Math.PI);}}});
  ctx.details=Object.assign(ctx.details||{},{sailboats:movers.filter(m=>m.kind==='sail').length,motorboats:movers.filter(m=>m.kind==='motor').length,moored:moored.length,riverChains:river.length});
});
