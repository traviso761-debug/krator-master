// ---------- traffic: cars on the major streets and Lake Shore Drive, tour boats following the river, and a working lake:
// sailboats that tack, motor yachts and speedboats with wakes, a cruise ship and water taxis from Navy Pier, moored fleets in the harbours, a freighter ----------
await stage('traffic');
const polyLen=r=>{let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;return r;};
const polyAt=(r,s,wrap)=>{s=wrap?((s%r.len)+r.len)%r.len:Math.max(0,Math.min(r.len,s));let i=0;while(i<r.cum.length-2&&r.cum[i+1]<s)i++;const a=r.pts[i],b=r.pts[i+1],u=(s-r.cum[i])/((r.cum[i+1]-r.cum[i])||1);
  return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];};
section('traffic',()=>{
  // routes: every major street (and each diagonal) as a polyline; cars run both ways, one lane each side
  const routes=[];
  for(const s of STREETS)if(s.major&&s.axis!=='d')routes.push(polyLen({pts:[s.a,s.b],w:s.w}));
  for(const d of DIAGONALS)routes.push(polyLen({pts:d.pts,w:d.w}));
  // what the road is at every 5 m, worked out once: 0 = none (lake, river with no bridge, off the map), 1 = street, 2 = bridge deck
  for(const r of routes){r.st=new Uint8Array(Math.ceil(r.len/5)+1);for(let k=0;k<r.st.length;k++){const [x,z]=polyAt(r,k*5,true);r.st[k]=inLake(x,z)||!inMap(x,z,20)?0:inRiver(x,z)?(onBridge(x,z)?2:0):1;}}
  const cars=[];for(const r of routes){const n=Math.floor(r.len/70);for(const dir of [-1,1])for(let k=0;k<n;k++)cars.push({r,dir,s:xr()*r.len,v:9+xr()*7,off:dir*r.w/4});}
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(4.4,1.5,2),new THREE.MeshLambertMaterial({color:0xffffff}),cars.length),d=new THREE.Object3D(),col=new THREE.Color();
  const cab=new THREE.InstancedMesh(new THREE.BoxGeometry(2.3,0.75,1.8).translate(-0.3,1.1,0),new THREE.MeshLambertMaterial({color:0x26303a}),cars.length);   // the glasshouse on top
  cars.forEach((c,i)=>cm.setColorAt(i,col.setHSL(xr(),0.45,0.3+xr()*0.4)));cm.userData.life=true;cm.frustumCulled=cab.frustumCulled=false;scene.add(cm,cab);
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    for(let i=0;i<cars.length;i++){const c=cars[i];c.s+=c.dir*c.v*dt;const [x0,z0,a]=polyAt(c.r,c.s,true),x=x0-Math.sin(a)*c.off,z=z0+Math.cos(a)*c.off;
      const st=c.r.st[Math.round((((c.s%c.r.len)+c.r.len)%c.r.len)/5)],y=st===2?6.2:0.8,sc=st?1:0;   // hidden where there is no road
      d.position.set(x,y,z);d.rotation.set(0,-a+(c.dir<0?Math.PI:0),0);d.scale.setScalar(sc);d.updateMatrix();cm.setMatrixAt(i,d.matrix);cab.setMatrixAt(i,d.matrix);}
    cm.instanceMatrix.needsUpdate=cab.instanceMatrix.needsUpdate=true;});
  ctx.details=Object.assign(ctx.details||{},{cars:cars.length});
});
section('boats',()=>{
  const white=new THREE.MeshLambertMaterial({color:0xf2f0ea}),navy=new THREE.MeshLambertMaterial({color:0x223a5a}),teak=new THREE.MeshLambertMaterial({color:0x8a6a48}),glass=new THREE.MeshLambertMaterial({color:0x2a3a48});
  const sailM=new THREE.MeshLambertMaterial({color:0xfbfaf4,side:THREE.DoubleSide}),mastM=new THREE.MeshLambertMaterial({color:0xb0b4b8}),yellow=new THREE.MeshLambertMaterial({color:0xf2c230}),red=new THREE.MeshLambertMaterial({color:0xa02a24});
  const wakeM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5,depthWrite:false});
  const hullG=(L,W,H)=>{const s=new THREE.Shape();s.moveTo(-L/2,-W/2);s.lineTo(L*0.18,-W/2);s.quadraticCurveTo(L*0.45,-W*0.3,L/2,0);s.quadraticCurveTo(L*0.45,W*0.3,L*0.18,W/2);s.lineTo(-L/2,W/2);s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth:H,bevelEnabled:false});g.rotateX(-Math.PI/2);return g;};   // a pointed bow at +x, deck at y = H
  const wake=(len,w)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0.05,0, -len,0.05,-w, -len,0.05,w],3));g.computeVertexNormals();const m=new THREE.Mesh(g,wakeM.clone());m.material.side=THREE.DoubleSide;return m;};
  const lakeOK=(x,z,m)=>inLake(x,z)&&inLake(x-(m||60),z)&&inLake(x,z-(m||60))&&inLake(x,z+(m||60))&&x<B.x1+1300&&z>B.z0+80&&z<B.z1-80&&!onPier(x,z)&&!(x<PIER.x1+60&&Math.abs(z-PIER.z)<PIER.width/2+50);
  const pickLake=(R,xmin,xmax,m)=>{for(let t=0;t<300;t++){const x=xmin+Math.pow(R(),1.6)*(xmax-xmin),z=B.z0+R()*B.d;if(lakeOK(x,z,m))return [x,z];}return [B.x1-300,0];};   // biased towards the shore, where the boats are; the water runs 1.5 km past the map's east edge
  const R=mkRng(2026),movers=[];
  // sailboats: hull, mast, mainsail and jib; they reach across the wind, heel, and tack when the lake runs out
  const WIND=0.35;   // radians: the breeze blows from the east-north-east
  for(let k=0;k<48;k++){const L=8+R()*7,g=new THREE.Group(),hull=new THREE.Mesh(hullG(L,L*0.32,1.1),R()<0.2?navy:white);g.add(hull);
    const rig=new THREE.Group();rig.position.y=1.1;g.add(rig);const mh=L*1.35,mast=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,mh,5),mastM);mast.position.set(L*0.05,mh/2,0);rig.add(mast);
    const tri=(a,b,c)=>{const t=new THREE.BufferGeometry();t.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c],3));t.computeVertexNormals();return new THREE.Mesh(t,sailM);};
    const main=tri([L*0.05,0.8,0],[L*0.05,mh,0],[-L*0.4,0.9,0]),jib=tri([L*0.1,mh*0.85,0],[L*0.46,0.3,0],[L*0.08,0.6,0]);rig.add(main,jib);
    const [x,z]=pickLake(R,SHORE[0][0]+300,B.x1+1200,80);scene.add(g);movers.push({kind:'sail',g,rig,main,jib,x,z,a:WIND+(R()<0.5?1:-1)*(1.0+R()*0.5),v:2.5+R()*2,tack:0,L});}
  // motor yachts and speedboats: straight runs with a wake, turning back at the edges
  for(let k=0;k<22;k++){const fast=k<8,L=fast?7+R()*3:14+R()*10,g=new THREE.Group(),hull=new THREE.Mesh(hullG(L,L*(fast?0.36:0.3),fast?1:1.8),fast&&R()<0.5?red:white);g.add(hull);
    if(fast){const w=new THREE.Mesh(new THREE.BoxGeometry(L*0.25,0.7,L*0.3),glass);w.position.set(-L*0.05,1.35,0);g.add(w);}
    else{const cab=new THREE.Mesh(new THREE.BoxGeometry(L*0.45,2,L*0.22),white);cab.position.set(-L*0.08,2.8,0);const win=new THREE.Mesh(new THREE.BoxGeometry(L*0.46,0.7,L*0.23),glass);win.position.set(-L*0.08,3.2,0);const fly=new THREE.Mesh(new THREE.BoxGeometry(L*0.25,0.2,L*0.2),navy);fly.position.set(-L*0.12,3.9,0);g.add(cab,win,fly);}
    const wk=wake(L*(fast?4:2.5),L*(fast?1.1:0.7));wk.position.x=-L/2;g.add(wk);
    const [x,z]=pickLake(R,SHORE[0][0]+250,B.x1+1200,60);scene.add(g);movers.push({kind:'motor',g,wk,x,z,a:R()*6.28,v:fast?14+R()*8:5+R()*4,L,turn:0});}
  // the cruise ship: a long white three-deck boat on a loop out from Navy Pier and back
  const cruise=new THREE.Group();{const L=60,h=new THREE.Mesh(hullG(L,15,2.6),white);cruise.add(h);for(let k=0;k<3;k++){const deck=new THREE.Mesh(new THREE.BoxGeometry(L*(0.72-k*0.14),2.6,13-k*2),k===1?glass:white);deck.position.set(-L*0.06,2.6+1.3+k*2.6,0);cruise.add(deck);}
    const wk=wake(160,30);wk.position.x=-L/2;cruise.add(wk);scene.add(cruise);}
  const cruiseLoop=polyLen({pts:[[PIER.x0+300,PIER.z-80],[PIER.x1+500,PIER.z-500],[PIER.x1+1500,PIER.z+400],[PIER.x1+900,PIER.z+1800],[PIER.x0+700,PIER.z+1300],[PIER.x0+300,PIER.z+90],[PIER.x0+300,PIER.z-80]]});
  movers.push({kind:'path',g:cruise,r:cruiseLoop,s:0,v:6,wrap:true});
  // water taxis: yellow shuttles between Navy Pier and the Museum Campus
  const [mcx,mcz]=P([41.8676,-87.6120]);
  for(let k=0;k<3;k++){const g=new THREE.Group(),L=16;g.add(new THREE.Mesh(hullG(L,5,1.4),yellow));const top=new THREE.Mesh(new THREE.BoxGeometry(9,2,4),yellow);top.position.set(-1,2.4,0);const roof=new THREE.Mesh(new THREE.BoxGeometry(10,0.3,4.6),white);roof.position.set(-1,3.5,0);g.add(top,roof);
    const wk=wake(40,6);wk.position.x=-L/2;g.add(wk);scene.add(g);
    const route=polyLen({pts:[[PIER.x0+80,PIER.z+PIER.width/2+25],[PIER.x0+260,PIER.z+700],[mcx+220,mcz-900],[mcx+120,mcz-60]]});movers.push({kind:'path',g,r:route,s:k*route.len/3,v:7,dir:k%2?1:-1});}
  // a lake freighter far out, crawling along the horizon
  const freighter=new THREE.Group();{const L=210;freighter.add(new THREE.Mesh(hullG(L,23,9),red));const deck=new THREE.Mesh(new THREE.BoxGeometry(L*0.8,1.2,21),new THREE.MeshLambertMaterial({color:0x3a3a3a}));deck.position.set(0,9.6,0);
    const house=new THREE.Mesh(new THREE.BoxGeometry(18,12,20),white);house.position.set(-L*0.42,15,0);const bow=new THREE.Mesh(new THREE.BoxGeometry(10,8,20),white);bow.position.set(L*0.42,13,0);freighter.add(deck,house,bow);scene.add(freighter);}
  movers.push({kind:'path',g:freighter,r:polyLen({pts:[[B.x1+900,B.z0-600],[B.x1+1100,B.z1+600]]}),s:0,v:4,dir:1});
  // moored boats: rows on the harbour moorings (Monroe Harbor and DuSable Harbor), bobbing
  const harbours=[[[41.8765,-87.6150],[41.8835,-87.6118]],[[41.8850,-87.6128],[41.8878,-87.6106]]];
  const moored=[];for(const [a,b] of harbours){const [x0,z1]=P(a),[x1,z0]=P(b);for(let z=z0+10;z<z1-6;z+=16)for(let x=x0+10;x<x1-6;x+=12)if(inLake(x,z)&&R()<0.75)moored.push([x+R()*3,z+R()*3,R()*6.28,R()<0.7]);}
  {const n=moored.length,hulls=new THREE.InstancedMesh(hullG(9,3,1),white,n),masts=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.06,0.08,11,4).translate(0,6.5,0),mastM,n),dd=new THREE.Object3D();
   moored.forEach(([x,z,a,sail],i)=>{dd.position.set(x,0,z);dd.rotation.set(0,a,0);dd.scale.set(1,1,1);dd.updateMatrix();hulls.setMatrixAt(i,dd.matrix);dd.scale.set(1,sail?1:0.001,1);dd.updateMatrix();masts.setMatrixAt(i,dd.matrix);});
   scene.add(hulls,masts);let t0=0;animHooks.push(now=>{if(now-t0<120)return;t0=now;moored.forEach(([x,z,a,sail],i)=>{const b=Math.sin(now*0.0012+x*0.3)*0.15;dd.position.set(x,b,z);dd.rotation.set(Math.sin(now*0.001+z)*0.03,a,Math.sin(now*0.0013+x)*0.04);dd.scale.set(1,1,1);dd.updateMatrix();hulls.setMatrixAt(i,dd.matrix);dd.scale.set(1,sail?1:0.001,1);dd.updateMatrix();masts.setMatrixAt(i,dd.matrix);});hulls.instanceMatrix.needsUpdate=masts.instanceMatrix.needsUpdate=true;});}
  // river tour boats: up and down the three branches, along the river's own bends
  const tours=[];RIVERS.forEach((rv,ri)=>{const r=polyLen({pts:rv.pts});for(let k=0;k<(ri===0?4:2);k++){const g=new THREE.Group();g.add(new THREE.Mesh(hullG(24,6.5,1.4),white));const top=new THREE.Mesh(new THREE.BoxGeometry(16,1.8,5.2),navy);top.position.set(-2,2.3,0);g.add(top);scene.add(g);
    movers.push({kind:'path',g,r,s:(k+0.5)/4*r.len,v:3.5+R()*2,dir:k%2?1:-1,bounce:true,off:rv.width*0.2});tours.push(g);}});
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;const T=now/1000;
    for(const m of movers){
      if(m.kind==='sail'){const nx=m.x+Math.cos(m.a)*m.v*dt,nz=m.z+Math.sin(m.a)*m.v*dt;
        if(m.tack>0){m.tack-=dt;m.a+=(m.ta-m.a)*Math.min(1,dt*0.8);}else if(!lakeOK(nx+Math.cos(m.a)*80,nz+Math.sin(m.a)*80,20)){const rel=m.a-WIND;m.ta=WIND-rel+(Math.sin(rel)>0?0:0);m.ta=WIND+(Math.sin(m.a-WIND)>0?-1:1)*(1.1+((m.x*13)%1)*0.4);m.tack=4;}   // come about onto the other tack
        else{m.x=nx;m.z=nz;}
        const side=Math.sin(m.a-WIND)>0?1:-1;m.g.position.set(m.x,0.2+Math.sin(T*1.3+m.x)*0.12,m.z);m.g.rotation.set(side*0.14*(m.tack>0?0.2:1),-m.a,0);m.rig.rotation.y=side*0.45;}
      else if(m.kind==='motor'){const nx=m.x+Math.cos(m.a)*m.v*dt,nz=m.z+Math.sin(m.a)*m.v*dt;
        if(!lakeOK(nx+Math.cos(m.a)*120,nz+Math.sin(m.a)*120,20)){m.a+=dt*0.9;}else{m.x=nx;m.z=nz;m.a+=Math.sin(T*0.05+m.x)*0.02*dt;}
        m.g.position.set(m.x,0.1+Math.sin(T*2+m.z)*0.08,m.z);m.g.rotation.set(0,-m.a,Math.sin(T*1.7+m.x)*0.02);m.wk.material.opacity=0.35+0.15*Math.sin(T*3+m.x);}
      else{m.dir=m.dir||1;m.s+=m.dir*m.v*dt;if(!m.wrap){if(m.s>m.r.len-30){m.s=m.r.len-30;m.dir=-1;}if(m.s<30){m.s=30;m.dir=1;}}
        const [x,z,a]=polyAt(m.r,m.s,m.wrap),o=(m.off||0)*m.dir;m.g.position.set(x-Math.sin(a)*o,0.2+Math.sin(T+x)*0.08,z+Math.cos(a)*o);m.g.rotation.y=-a+(m.dir>0?0:Math.PI);}}});
  ctx.details=Object.assign(ctx.details||{},{sailboats:48,motorboats:22,moored:moored.length,cruise:1,waterTaxis:3,freighter:1,riverTours:tours.length});
});
