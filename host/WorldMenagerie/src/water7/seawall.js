// ---------- the sea wall ----------
// Round Water 7, out in the sea (OSM.water7.damR), the wall that keeps the sea off a sinking city: a ring of dam
// with a vertical face to the moat and a battered, curving face to the sea, coursed in great blocks, buttressed,
// a walkway along its top between parapets with lamps. Where a grand canal comes down to the moat a sluice lets the
// city's water out to the sea: the gatehouse on top, the steel frames and the gate on the sea face, the spillway
// pouring from its outlet, a tide gauge beside it. The docks open through it between their gate towers (the dock
// landmarks), each with a pair of lock gates (api.LOCKS, which the launch opens); the sea train goes through an
// arched gate east of Blue Station; the stone bridge to Scrap Island through another. Along Back Street the wall is
// the old one, lower and darker: the one Aqua Laguna comes over. Bell towers to ring the warning (api.BELLS), and
// spray thrown up where the swell breaks on the face.
export function seawall(api){
  const {THREE,C,scene,animHooks,OSM,camera,nightF,hour}=api;const W7=OSM.water7;if(!W7||!W7.damR)return;
  const R=W7.damR,TOP=22,LOW=9,deg=Math.PI/180,BS=(W7.backstreet||[196,238]).map(a=>a*deg),[SX,SZ,SR]=W7.scrap||[-1900,820,150];
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});return o;};
  let seed=11;const Rn=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // ---- the stone: great blocks in courses ----
  const ashlar=(base,line)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,256,256);
    for(let row=0;row<8;row++){const y=row*32,off=row%2?40:0;for(let x=-off;x<256;x+=80){const v=(Rn()-0.5)*26;g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/255})`;g.fillRect(x+2,y+2,76,28);
      g.strokeStyle=line;g.lineWidth=2.5;g.strokeRect(x+1,y+1,78,30);}}
    for(let i=0;i<900;i++){g.fillStyle=`rgba(0,0,0,${Rn()*0.06})`;g.fillRect(Rn()*256,Rn()*256,2,2);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;};
  const stoneM=new THREE.MeshLambertMaterial({map:ashlar('#ddd1b6','rgba(90,74,52,0.55)'),side:THREE.DoubleSide});
  const oldM=new THREE.MeshLambertMaterial({map:ashlar('#b8ab90','rgba(60,50,38,0.6)'),side:THREE.DoubleSide});
  const capM=new THREE.MeshLambertMaterial({color:0xc8b898}),ironM=new THREE.MeshLambertMaterial({color:0x3a4046}),roofM=new THREE.MeshLambertMaterial({color:0xc8503a}),
    redM=new THREE.MeshLambertMaterial({color:0xb8302a}),whiteM=new THREE.MeshLambertMaterial({color:0xf2efe6}),woodM=new THREE.MeshLambertMaterial({color:0x6a4a30}),
    lampM=new THREE.MeshLambertMaterial({color:0xfff0c0,emissive:0x000000}),waterM=new THREE.MeshPhongMaterial({color:0xcfeaf4,emissive:0x0a2a3a,transparent:true,opacity:0.8,shininess:90,depthWrite:false,side:THREE.DoubleSide}),
    foamM=new THREE.MeshLambertMaterial({color:0xf6fbff,transparent:true,opacity:0.85,depthWrite:false});
  const G=new THREE.Group();G.name='seawall';
  const add=(geo,m,x=0,y=0,z=0,ry=0)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.rotation.y=ry;G.add(me);return me;};
  const at=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r],face=a=>-a;   // a box's +x along the radius outward when rotated by face(a)
  // ---- the openings, by angle: the docks, the railway, the bridge ----
  const OPEN=[];
  for(const [ad,w] of W7.docks||[])OPEN.push({a:ad*deg,half:(w/2+2)/R,kind:'dock',w});
  OPEN.push({a:Math.atan2(-12,R),half:10/R,kind:'rail'});
  const BRA=Math.atan2(SZ,SX);OPEN.push({a:BRA,half:9/R,kind:'bridge'});
  const norm=a=>(a%(2*Math.PI)+2*Math.PI)%(2*Math.PI);OPEN.forEach(o=>o.a=norm(o.a));OPEN.sort((p,q)=>p.a-q.a);
  // the arcs between the openings, split again at Back Street's ends
  const arcs=[];for(let i=0;i<OPEN.length;i++){const o=OPEN[i],n=OPEN[(i+1)%OPEN.length];let a0=o.a+o.half,a1=n.a-n.half;if(a1<a0)a1+=2*Math.PI;
    const cuts=[a0];for(const b of BS)for(const k of [0,2*Math.PI])if(b+k>a0&&b+k<a1)cuts.push(b+k);cuts.push(a1);cuts.sort((p,q)=>p-q);
    for(let j=0;j+1<cuts.length;j++){const m=norm((cuts[j]+cuts[j+1])/2),low=m>BS[0]&&m<BS[1];arcs.push([cuts[j],cuts[j+1],low]);}}
  // a ring of profile [[offset from R, y], ...] between two angles, its UVs in metres (8 m blocks along, 4 m up)
  const lathe=(prof,a0,a1,m)=>{const pts=prof.map(([o,y])=>new THREE.Vector2(R+o,y)),len=(a1-a0)*R,segs=Math.max(2,Math.ceil(len/10));
    const g=new THREE.LatheGeometry(pts,segs,Math.PI/2-a1,a1-a0),uv=g.attributes.uv;let pl=0;const acc=[0];for(let i=1;i<pts.length;i++){pl+=pts[i].distanceTo(pts[i-1]);acc.push(pl);}
    for(let i=0;i<uv.count;i++){const j=i%pts.length;uv.setXY(i,uv.getX(i)*len/10,acc[j]/4);}return add(g,m);};
  const BODY=[[-7,-9],[-7,TOP],[7,TOP],[8.5,18],[11,11],[15,4],[21,-3],[29,-9]],BODYLOW=[[-6,-9],[-6,LOW],[6,LOW],[8,5],[12,0],[18,-5],[24,-9]];
  let walkLen=0;const lamps=[],butt=[];
  for(const [a0,a1,low] of arcs){lathe(low?BODYLOW:BODY,a0,a1,low?oldM:stoneM);const top=low?LOW:TOP,hw=low?6:7;
    lathe([[hw-1.2,top],[hw-1.2,top+1.4],[hw,top+1.4],[hw,top]],a0,a1,capM);                                 // the sea-side parapet
    lathe([[-hw,top],[-hw,top+1.1],[-hw+0.8,top+1.1],[-hw+0.8,top]],a0,a1,capM);                           // the moat-side rail
    if(!low)lathe([[6,TOP-1.4],[7.6,TOP-1.4],[7.6,TOP-0.6],[6,TOP-0.6]],a0,a1,capM);                      // the cornice under the parapet
    const L=(a1-a0)*R;walkLen+=L;
    for(let u=20;u<L-10;u+=46){const a=a0+u/R;butt.push([a,low]);}
    for(let u=30;u<L-10;u+=60){const a=a0+u/R;lamps.push([a,top,hw]);}}
  // buttresses on the sea face
  {const geo=new THREE.BoxGeometry(1,1,1),im=new THREE.InstancedMesh(geo,stoneM,butt.length),o=new THREE.Object3D();
    butt.forEach(([a,low],i)=>{const h=low?13:26,[x,z]=at(a,R+(low?11:14));o.position.set(x,(low?LOW:TOP)-4-h/2,z);o.rotation.set(0,face(a),0);o.scale.set(low?9:12,h,5);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
    G.add(im);}
  // the walkway's lamps: an iron post, a lantern; lit at night
  {const post=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12,0.16,4.2,6).translate(0,2.1,0),ironM,lamps.length),head=new THREE.InstancedMesh(new THREE.BoxGeometry(0.7,0.9,0.7),lampM,lamps.length),o=new THREE.Object3D();
    lamps.forEach(([a,top,hw],i)=>{const [x,z]=at(a,R-hw+1.4);o.position.set(x,top,z);o.rotation.set(0,face(a),0);o.updateMatrix();post.setMatrixAt(i,o.matrix);o.position.y=top+4.6;o.updateMatrix();head.setMatrixAt(i,o.matrix);});
    G.add(post,head);}
  // ---- the sluices, where the grand canals come down: gatehouse, gate frames, outlet, spillway, tide gauge ----
  const spill=[];
  for(const ad of W7.canalAngles||[]){const a=norm(ad*deg);if(OPEN.some(o=>Math.abs(norm(a-o.a+Math.PI)-Math.PI)<o.half+16/R))continue;const low=a>BS[0]&&a<BS[1],top=low?LOW:TOP,f=face(a);
    const [gx,gz]=at(a,R);add(new THREE.BoxGeometry(12,7,16).translate(0,3.5,0),low?oldM:stoneM,gx,top,gz,f);add(new THREE.ConeGeometry(11,4.5,4).rotateY(Math.PI/4).translate(0,9.25,0),roofM,gx,top,gz,f).scale.set(0.75,1,1.0);
    for(const s of [-1,1]){const [fx,fz]=at(a+s*7/R,R+9.5);add(new THREE.BoxGeometry(1.2,top+6,1.2).translate(0,(top+6)/2-6,0),ironM,fx,0,fz,f);}   // the gate frames down the sea face
    {const [fx,fz]=at(a,R+9.8);add(new THREE.BoxGeometry(1.4,1.2,15).translate(0,top-0.5,0),ironM,fx,0,fz,f);add(new THREE.BoxGeometry(0.6,7,13),new THREE.MeshLambertMaterial({color:0x4a5258}),fx,7.5,fz,f);}   // the beam, the gate leaf (raised)
    {const [ox,oz]=at(a,R+13.6);add(new THREE.BoxGeometry(1,5,11),new THREE.MeshLambertMaterial({color:0x101418}),ox,1.6,oz,f);}                       // the outlet's mouth
    // the spillway: a sheet arching out of the outlet and down into the sea, the foam where it lands
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,3.4,0),new THREE.Vector3(6,3.6,0),new THREE.Vector3(11,-0.4,0));
    const pts=curve.getPoints(10),sh=new THREE.BufferGeometry(),P=[],I=[];pts.forEach(p=>{P.push(p.x,p.y,-5,p.x,p.y,5);});for(let i=0;i<10;i++){const k=i*2;I.push(k,k+1,k+2,k+1,k+3,k+2);}
    sh.setAttribute('position',new THREE.Float32BufferAttribute(P,3));sh.setIndex(I);sh.computeVertexNormals();
    const [sx,sz]=at(a,R+14.2),sheet=add(sh,waterM,sx,0,sz,f);
    const [px,pz]=at(a,R+25.5),pool=add(new THREE.CircleGeometry(7,20).rotateX(-Math.PI/2),foamM,px,0.9,pz);spill.push({sheet,pool,x:px,z:pz});
    // the tide gauge: a white board on the sea face, a red mark every metre and a long one every five
    {const [tx,tz]=at(a+14/R,R+13.2);add(new THREE.BoxGeometry(0.3,16,1.6).translate(0,4,0),whiteM,tx,0,tz,f);
      for(let m=-4;m<=12;m++){const [mx,mz]=at(a+14/R,R+13.4);add(new THREE.BoxGeometry(0.1,0.18,m%5===0?1.5:0.8),redM,mx,m+0.7,mz,f);}}}
  // ---- the lock gates in the dock mouths: two leaves, mitred, closed against the sea until a launch ----
  const LOCKS=[];
  for(const o of OPEN){if(o.kind!=='dock')continue;const a=o.a,W=o.w,f=face(a),leaves=[];
    for(const s of [-1,1]){const [hx,hz]=at(a+s*(W/2)/R,R-8),piv=new THREE.Group();piv.position.set(hx,0,hz);piv.rotation.y=f;
      const leaf=new THREE.Mesh(new THREE.BoxGeometry(2.2,14,W/2*1.04),woodM);leaf.position.set(0,2,-s*W/4*1.04);piv.add(leaf);
      for(let k=0;k<4;k++){const band=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.5,W/2*1.04),ironM);band.position.set(0,-3+k*3.4,-s*W/4*1.04);piv.add(band);}
      G.add(piv);leaves.push({piv,s,f});}
    LOCKS.push({a,leaves,open:0,target:0});}
  api.LOCKS=LOCKS;
  // ---- the arched gates: the railway's, the bridge's ----
  for(const o of OPEN){if(o.kind==='dock')continue;const a=o.a,f=face(a),hw=o.half*R,low=a>BS[0]&&a<BS[1],top=low?LOW:TOP,clear=o.kind==='rail'?11:9;
    for(const s of [-1,1]){const [x,z]=at(a+s*(hw+4)/R,R);add(new THREE.BoxGeometry(18,top+12,8).translate(0,(top+12)/2-9,0),stoneM,x,0,z,f);add(new THREE.ConeGeometry(6.5,5,4).rotateY(Math.PI/4).translate(0,top+5.5,0),roofM,x,0,z,f);}
    const [x,z]=at(a,R);add(new THREE.BoxGeometry(18,top+3-clear,2*hw+2).translate(0,(top+3+clear)/2,0),stoneM,x,0,z,f);
    add(new THREE.BoxGeometry(19,1.2,2*hw+3).translate(0,clear+0.6,0),capM,x,0,z,f);                                    // the lintel's moulding
    add(new THREE.BoxGeometry(0.3,1.8,10),redM,...[at(a,R+9.2)[0],top-2,at(a,R+9.2)[1]],f);}
  // ---- bell towers to ring the warning ----
  const BELLS=[];
  for(const ad of [45,135,217,305]){const a=norm(ad*deg),low=a>BS[0]&&a<BS[1],top=low?LOW:TOP,[x,z]=at(a,R);
    add(new THREE.BoxGeometry(6,16,6).translate(0,8,0),low?oldM:stoneM,x,top,z,face(a));add(new THREE.ConeGeometry(5,5,4).rotateY(Math.PI/4).translate(0,top+21.5,0),roofM,x,0,z,face(a));
    for(const [dx,dz] of [[-2.6,-2.6],[2.6,-2.6],[-2.6,2.6],[2.6,2.6]])add(new THREE.BoxGeometry(0.8,3,0.8).translate(0,top+17.5,0),capM,x+dx,0,z+dz);
    const bell=new THREE.Mesh(new THREE.CylinderGeometry(0.6,1.4,1.8,12,1,true),new THREE.MeshPhongMaterial({color:0xc8a040,specular:0xffe0a0,shininess:60,side:THREE.DoubleSide}));
    const piv=new THREE.Group();piv.position.set(x,top+18.6,z);bell.position.y=-1;piv.add(bell);G.add(piv);BELLS.push({piv,swing:0});}
  api.BELLS=BELLS;
  // ---- the stone bridge to Scrap Island: piers, arches, the deck, its parapets ----
  {const ux=Math.cos(BRA),uz=Math.sin(BRA),r0=W7.tiers?W7.tiers[0][0]-12:1338,r1=Math.hypot(SX,SZ)-SR+20,D=6,Wd=10,f=face(BRA);
    const yAt=r=>r<r0+30?3.4+(D-3.4)*(r-r0)/30:r>r1-30?D-(D-3.0)*(r-(r1-30))/30:D;
    for(let r=r0;r<r1;r+=20){const ra=r,rb=Math.min(r1,r+20),ya=yAt(ra),yb=yAt(rb),mx=ux*(ra+rb)/2,mz=uz*(ra+rb)/2,len=rb-ra+0.2;
      const deck=add(new THREE.BoxGeometry(len,1.2,Wd),capM,mx,(ya+yb)/2,mz,f);deck.rotation.z=Math.atan2(yb-ya,len);
      for(const s of [-1,1]){const pp=add(new THREE.BoxGeometry(len,1.1,0.5),capM,mx-uz*s*(Wd/2-0.25),(ya+yb)/2+1.1,mz+ux*s*(Wd/2-0.25),f);pp.rotation.z=deck.rotation.z;}
      if(r>r0+10&&r<r1-10&&!(r>R-14&&r<R+30)){const [px,pz]=[ux*r,uz*r];add(new THREE.BoxGeometry(4,D+14,Wd+1).translate(0,(D+14)/2-14,0),stoneM,px,0,pz,f);
        const arch=add(new THREE.CylinderGeometry(8,8,Wd,16,1,false,0,Math.PI).rotateX(Math.PI/2),stoneM,mx,D-0.6-8*0.55,mz,f);arch.scale.set(1,0.55,1);}}}
  tag(G);scene.add(G);
  // ---- what moves: the spillways' foam on the sea, the lock gates, the bells, the lamps, the spray ----
  const SPN=240,spray=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xf6fbff,transparent:true,opacity:0.75,depthWrite:false}),SPN),sp=[];
  for(let i=0;i<SPN;i++)sp.push({t:9,x:0,y:-100,z:0,vx:0,vy:0,vz:0,s:1});spray.frustumCulled=false;spray.userData.noFingerprint=true;scene.add(spray);
  const o=new THREE.Object3D();let last=0,si=0,acc=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;const t=now/1000,SEA=api.SEA;
    for(const s of spill){const y=SEA?SEA.y(s.x,s.z):0.7;s.pool.position.y=y+0.15;s.pool.scale.setScalar(0.85+0.2*Math.sin(t*5+s.x));s.sheet.material.opacity=0.72+0.1*Math.sin(t*7);}
    for(const L of LOCKS){L.open+=(L.target-L.open)*Math.min(1,dt*0.35);for(const lf of L.leaves)lf.piv.rotation.y=lf.f+lf.s*(-0.32+L.open*(Math.PI/2+0.32));}
    for(const B of BELLS){B.piv.rotation.z=Math.sin(t*3.2)*0.5*B.swing;B.swing=Math.max(0,B.swing-dt*0.05);}
    lampM.emissive.setRGB(0.9*nightF(hour()),0.75*nightF(hour()),0.45*nightF(hour()));
    // spray: where a crest meets the sea face near the camera, a burst thrown up the wall
    acc+=dt;if(SEA&&acc>0.12){acc=0;const ca=Math.atan2(camera.position.z,camera.position.x);
      for(let k=0;k<3;k++){const a=ca+(Rn()-0.5)*1.6;if(OPEN.some(q=>Math.abs(norm(a-q.a+Math.PI)-Math.PI)<q.half+0.01))continue;const low=norm(a)>BS[0]&&norm(a)<BS[1],rr=R+(low?16:21),x=Math.cos(a)*rr,z=Math.sin(a)*rr,y=SEA.y(x,z),lvl=y-0.7-SEA.tide-SEA.draw;
        if(lvl>0.75)for(let j=0;j<5;j++){const p=sp[si++%SPN];p.t=0;p.x=x;p.y=y;p.z=z;const up=Math.min(34,4+lvl*5+Rn()*5);p.vx=-Math.cos(a)*(2+Rn()*3)+(Rn()-0.5)*3;p.vz=-Math.sin(a)*(2+Rn()*3)+(Rn()-0.5)*3;p.vy=up;p.s=0.8+Rn()*1.4;}}}
    for(let i=0;i<SPN;i++){const p=sp[i];if(p.t<3){p.t+=dt;p.vy-=9.8*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}
      o.position.set(p.x,p.t<3?p.y:-200,p.z);o.scale.setScalar(p.t<3?p.s*(1+p.t*0.8):0.01);o.updateMatrix();spray.setMatrixAt(i,o.matrix);}
    spray.instanceMatrix.needsUpdate=true;});
  api.ctx.details=Object.assign(api.ctx.details||{},{seawall:{arcs:arcs.length,km:Math.round(walkLen/100)/10,sluices:spill.length,locks:LOCKS.length,bells:BELLS.length}});
}
