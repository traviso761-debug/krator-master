// ---------- Water 7 at work ----------
// The city the shipwrights built, working. At every Galley-La dock (api.DOCKSHIPS): shipwrights on the scaffold's
// lifts down both sides of the hull, hammering; pairs carrying planks from the timber stacks along the quay and over
// the gangways to the ship; sawyers at a saw pit; a foreman watching from the slip's head; men on the deck once she
// has one. At Dock One a crowd at the quay's edge cheering the foremen, as the town does. On the water: barges and
// gondolas round the moat, merchantmen riding at anchor outside the wall, fishing boats under sail out at sea, a
// trader beating in to Dock Three's gate and out again. Gulls over the docks and the island. A market along the
// Market Terrace's promenades: stalls under awnings, the stallholders behind them.
// Figures are instanced by part (legs, body, head, cap, the working arm, a plank), so a dock's crew is a handful of
// draws; each dock's crew is drawn and moved only while the camera is within C.water7.workFar of it.
export function work(api){
  const {THREE,C,scene,animHooks,camera,OSM,nightF,hour}=api;const W7=OSM.water7;if(!W7)return;
  const FAR=(C.water7&&C.water7.workFar)||1100;let seed=77;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const seaY=(x,z)=>api.SEA?api.SEA.y(x,z):0.7;
  const col=new THREE.Color(),o=new THREE.Object3D(),M4=new THREE.Matrix4();
  // ---- the parts of a figure, each along +x (facing), feet at y=0 ----
  const G={legs:(()=>{const a=new THREE.BoxGeometry(0.14,0.84,0.14).translate(0,0.42,0.1),b=a.clone().translate(0,0,-0.2);return merge([a,b]);})(),
    body:merge([new THREE.CylinderGeometry(0.17,0.2,0.62,8).translate(0,1.15,0),new THREE.BoxGeometry(0.1,0.56,0.1).translate(0,1.13,-0.25)]),   // the torso and the idle arm
    head:new THREE.SphereGeometry(0.115,8,6).translate(0,1.62,0),cap:new THREE.CylinderGeometry(0.125,0.13,0.08,8).translate(0,1.71,0),
    arm:merge([new THREE.BoxGeometry(0.1,0.56,0.1).translate(0,-0.26,0),new THREE.BoxGeometry(0.05,0.05,0.34).translate(0,-0.56,0),new THREE.BoxGeometry(0.1,0.1,0.18).translate(0,-0.6,0.17)]),   // arm and hammer, hung from the shoulder
    plank:new THREE.BoxGeometry(5.2,0.08,0.32)};
  function merge(gs){const pos=[],nor=[];for(const g0 of gs){const g=g0.index?g0.toNonIndexed():g0;const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return g;}
  const SHIRT=['#f2efe6','#e8e0cc','#d8d4cc','#c8a878','#5a7a9a','#9a4a3a','#4a6a4a','#e8c070'],TROU=['#2a2a30','#3a3a42','#4a3a2a','#2a3448','#5a5048'],SKIN=['#e8b896','#d8a080','#c48a68','#f0c8a8','#a87050'],CAP=['#f4f2ec','#c8302a','#2a4a8a','#e8c040','#5a5a5a'];
  const pick=a=>a[Math.floor(R()*a.length)];
  // a crew: its figures' parts as instanced meshes under a group in a dock's frame
  function crew(n,parent,withArm=true,withPlank=0){const mk=(geo)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),n);m.castShadow=true;m.frustumCulled=false;m.userData.noFingerprint=true;parent.add(m);return m;};
    const c={n,legs:mk(G.legs),body:mk(G.body),head:mk(G.head),cap:mk(G.cap),arm:withArm?mk(G.arm):null,plank:withPlank?(()=>{const m=new THREE.InstancedMesh(G.plank,new THREE.MeshLambertMaterial({color:0xa0703e}),withPlank);m.castShadow=true;m.frustumCulled=false;m.userData.noFingerprint=true;parent.add(m);return m;})():null};
    for(let i=0;i<n;i++){c.legs.setColorAt(i,col.set(pick(TROU)));c.body.setColorAt(i,col.set(pick(SHIRT)));c.head.setColorAt(i,col.set(pick(SKIN)));c.cap.setColorAt(i,col.set(pick(CAP)));if(c.arm)c.arm.setColorAt(i,c.body.instanceColor?col.fromArray(c.body.instanceColor.array,i*3):col);}
    return c;}
  // place figure i of a crew: at (x,y,z) facing heading h (radians, 0 = +x), the arm swung by a (radians), the legs by l
  const put=(c,i,x,y,z,h,a=0,l=0)=>{o.position.set(x,y,z);o.rotation.set(0,-h,0);o.scale.set(1,1,1);o.updateMatrix();c.body.setMatrixAt(i,o.matrix);c.head.setMatrixAt(i,o.matrix);c.cap.setMatrixAt(i,o.matrix);
    o.rotation.set(0,-h,l);o.updateMatrix();c.legs.setMatrixAt(i,o.matrix);
    if(c.arm){o.position.set(x+Math.sin(h)*0.25,y+1.4,z+Math.cos(h)*0.25);o.rotation.set(0,-h,a,'YXZ');o.updateMatrix();c.arm.setMatrixAt(i,o.matrix);}};
  const done=c=>{for(const k of ['legs','body','head','cap','arm','plank'])if(c[k])c[k].instanceMatrix.needsUpdate=true;};
  // ================================================================ the docks
  const yards=[];
  for(const [N,S] of Object.entries(api.DOCKSHIPS||{})){const D=S.dock,grp=new THREE.Group();D.add(grp);
    const yslip=x=>S.HS-(x-S.S0)/S.SL*(S.HS-S.HE),qy=2.3,qz=S.W/2+8;
    // the gangways from each quay to the slipway, three a side
    const gws=[];for(const sd of [-1,1])for(const f of [0.25,0.5,0.75]){const gx=S.kx-S.Ls/2+S.Ls*f,y0=qy,y1=yslip(gx)+0.6,z0=sd*(S.W/2+1),z1=sd*(S.slipHalf-0.5),len=Math.hypot(z1-z0,y1-y0);
      const gw=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.25,len),new THREE.MeshLambertMaterial({color:0x8a6a44}));gw.position.set(gx,(y0+y1)/2,(z0+z1)/2);gw.rotation.x=Math.atan2(y1-y0,Math.abs(z1-z0))*sd;gw.castShadow=true;gw.userData.noFingerprint=true;grp.add(gw);gws.push({gx,sd,y0,y1,z0,z1});}
    // the hammerers on the scaffold: a lift at a time, down both sides
    const H=[];const ph=S.stage>=2?S.Ds+3:S.Ds+1;
    for(const sd of [-1,1])for(let u=-S.Ls/2+3;u<=S.Ls/2-3;u+=6)for(let l=1;l*3.4<ph;l++){if(R()<0.45)continue;const py=S.ky+Math.sin(-S.pitch)*u-2+l*3.4+0.13;H.push({x:S.kx+u+(R()-0.5)*3,y:py,z:sd*(S.Bs/2+2.6),h:sd>0?-Math.PI/2:Math.PI/2,ph:R()*6,sp:5+R()*3});}
    // men on the deck, when there is one; the sawyers; the foreman
    if(S.stage>=1)for(let k=0;k<6;k++){const u=(R()-0.5)*S.Ls*0.7;H.push({x:S.kx+u,y:S.ky+Math.sin(-S.pitch)*u+S.Ds+(S.stage>=2?0.1:-1.2),z:(R()-0.5)*S.Bs*0.5,h:R()*6.28,ph:R()*6,sp:4+R()*3});}
    const sawX=S.S0+40;for(const sd of [-1,1])H.push({x:sawX,y:qy,z:sd*(S.W/2+22)+1.2*sd,h:sd>0?-Math.PI/2:Math.PI/2,ph:0,sp:3,saw:true});
    const fx=S.S0+12;H.push({x:fx,y:qy,z:S.W/2+6,h:0,ph:0,sp:0,foreman:true});
    const ham=crew(H.length,grp,true);
    // saw pit: the log on its trestles between the two sawyers
    for(const sd of [-1,1]){const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,8,10).rotateZ(Math.PI/2),new THREE.MeshLambertMaterial({color:0x8a5a34}));lg.position.set(sawX,qy+1.0,sd*(S.W/2+22));lg.userData.noFingerprint=true;grp.add(lg);}
    // the carriers: pairs, a plank on their shoulders, from the stacks to a gangway and up to the hull and back
    const CN=S.big?8:5,car=crew(CN*2,grp,false,CN),C2=[];
    for(let k=0;k<CN;k++){const g=gws[k%gws.length];const path=[[S.S0+25,qy,g.sd*(S.W/2+16)],[g.gx,qy,g.sd*qz],[g.gx,qy,g.z0],[g.gx,g.y1,g.z1],[g.gx,g.y1,g.sd*(S.Bs/2+3.5)]];
      const L=[0];for(let i=1;i<path.length;i++)L.push(L[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1],path[i][2]-path[i-1][2]));C2.push({path,L,s:R()*L[L.length-1]*2,v:1.1+R()*0.3});}
    // Dock One's crowd at the quay's edge by the gate
    let fans=null,F=[];if(S.big){for(let k=0;k<36;k++){const sd=k%2?1:-1;F.push({x:-14-R()*40,z:sd*(S.W/2+5+R()*6),h:sd>0?-Math.PI/2:Math.PI/2,ph:R()*6});}fans=crew(F.length,grp,true);}
    yards.push({D,grp,S,ham,H,car,C2,fans,F,CN});}
  // ================================================================ on the water
  const boats=[];
  const hullGeo=(L,B,D)=>{const s=new THREE.Shape();s.moveTo(-L/2,-B/2);s.lineTo(L*0.25,-B/2);s.quadraticCurveTo(L*0.45,-B*0.35,L/2,0);s.quadraticCurveTo(L*0.45,B*0.35,L*0.25,B/2);s.lineTo(-L/2,B/2);s.closePath();
    return new THREE.ExtrudeGeometry(s,{depth:D,bevelEnabled:false}).rotateX(-Math.PI/2).translate(0,-D*0.55,0);};
  const Mt=c=>new THREE.MeshLambertMaterial({color:c});
  function ship(kind){const g=new THREE.Group(),add=(geo,m,x,y,z)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.castShadow=true;g.add(me);return me;};
    if(kind==='merchant'){add(hullGeo(36,9,6),Mt(pick(['#6a4a30','#5a3a24','#3a3a4a','#7a2a2a'])),0,0,0);add(new THREE.BoxGeometry(32,0.4,8),Mt(0xc8a878),0,2.9,0);add(new THREE.BoxGeometry(7,3.4,8),Mt(0x5a3a24),-13,3,0);
      for(const [x,h] of [[-4,24],[7,28]]){add(new THREE.CylinderGeometry(0.4,0.55,h,8),Mt(0x4a2a1a),x,2.9+h/2,0);add(new THREE.CylinderGeometry(0.5,0.5,9,8).rotateX(Math.PI/2),Mt(0xe8e0cc),x+0.4,2.9+h*0.72,0);}}   // the masts, the sails furled on their yards
    else if(kind==='fisher'){add(hullGeo(10,3.2,2),Mt(pick(['#3a6aa8','#c8302a','#e8c040','#2a8a6a','#f2efe6'])),0,0,0);add(new THREE.CylinderGeometry(0.12,0.15,8,6),Mt(0x4a2a1a),0.5,5,0);
      const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(0,7);sh.lineTo(-4.5,0.4);sh.closePath();const sail=add(new THREE.ShapeGeometry(sh),new THREE.MeshLambertMaterial({color:pick([0xf4f0e6,0xe8d8b8,0xd8603a]),side:THREE.DoubleSide}),0.4,1.2,0);sail.rotation.y=Math.PI/2*0.15;}
    else if(kind==='barge'){add(hullGeo(16,5,2.4),Mt(0x6a4a30),0,0,0);for(let k=0;k<4;k++)add(new THREE.BoxGeometry(2.2,1.6,2.2),Mt(pick(['#9a7a52','#8a6a44','#c8a878'])),-5+k*3,1.2,0);}
    else if(kind==='trader'){add(hullGeo(30,8,5.5),Mt(0x7a4a2a),0,0,0);add(new THREE.BoxGeometry(26,0.4,7),Mt(0xc8a878),0,2.5,0);
      for(const [x,h,w] of [[-3,22,10],[7,25,12]]){add(new THREE.CylinderGeometry(0.4,0.5,h,8),Mt(0x4a2a1a),x,2.5+h/2,0);add(new THREE.BoxGeometry(0.2,h*0.55,w),Mt(0xf4f0e6),x+0.5,2.5+h*0.62,0);}}
    g.traverse(q=>{q.userData.noFingerprint=true;});scene.add(g);return g;}
  // riding at anchor outside the wall
  for(let k=0;k<9;k++){const a=R()*6.28,r=1650+R()*420;const g=ship('merchant');boats.push({g,mode:'anchor',x:Math.cos(a)*r,z:Math.sin(a)*r,h:R()*6.28,ph:R()*6});}
  // fishing boats under sail, out at sea, each on its own slow circle
  for(let k=0;k<14;k++){const g=ship('fisher');boats.push({g,mode:'circle',r:2300+R()*1200,a:R()*6.28,v:(0.012+R()*0.01)*(R()<0.5?-1:1),ph:R()*6});}
  // barges and gondolas round the moat
  for(let k=0;k<10;k++){const g=ship('barge');boats.push({g,mode:'circle',r:1395+R()*60,a:R()*6.28,v:(0.0016+R()*0.001)*(R()<0.5?-1:1),ph:R()*6});}
  // a trader beating in to Dock Three's gate and out again
  {const d3=(W7.docks||[])[2],a=d3?d3[0]*Math.PI/180:4.9;const g=ship('trader');boats.push({g,mode:'trader',a,t:R()*200});}
  api.BOATS=boats;   // for their lanterns at night (lights.js)
  // ================================================================ gulls
  const NG=90,gb=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.16,0.16),Mt(0xf4f4f0),NG),wingG=new THREE.BufferGeometry();
  wingG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0, 0.25,0,0, 0.05,0,0.75, 0.25,0,0, 0.3,0,0.75, 0.05,0,0.75],3));wingG.computeVertexNormals();
  const wl=new THREE.InstancedMesh(wingG,new THREE.MeshLambertMaterial({color:0xe8e8e4,side:THREE.DoubleSide}),NG),wr=new THREE.InstancedMesh(wingG,new THREE.MeshLambertMaterial({color:0xe8e8e4,side:THREE.DoubleSide}),NG);
  for(const m of [gb,wl,wr]){m.frustumCulled=false;m.userData.noFingerprint=true;scene.add(m);}
  const GULL=[];const centres=[...Object.values(api.DOCKSHIPS||{}).map(S=>{const v=new THREE.Vector3(S.kx,0,0).applyMatrix4(S.dock.matrixWorld);return [v.x,v.z];}),W7.scrap?[W7.scrap[0],W7.scrap[1]]:[-1900,820],[1500,0]];
  for(let i=0;i<NG;i++){const c=pick(centres);GULL.push({cx:c[0]+(R()-0.5)*120,cz:c[1]+(R()-0.5)*120,r:20+R()*70,y:18+R()*45,a:R()*6.28,v:(0.25+R()*0.25)*(R()<0.5?-1:1),fl:R()*6});}
  // ================================================================ the market on the Market Terrace
  {const T=W7.tiers,rm=(T[3][0]+T[4][0])/2,h=T[3][1],stalls=[];
    for(const sd of [-1,1]){const rr=rm+sd*27,n=Math.floor(rr*2*Math.PI/9);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+0.01;if(R()<0.35)continue;
      if((W7.streetAngles||[]).some(sa=>Math.abs(((a*180/Math.PI-sa+540)%360)-180)<2.5))continue;stalls.push([Math.cos(a)*rr,h,Math.sin(a)*rr,a,sd]);}}
    const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(1.4,0.95,3.2).translate(0,0.48,0),Mt(0x8a6a44),stalls.length),aw=new THREE.InstancedMesh(new THREE.BoxGeometry(2.4,0.1,3.8).translate(0,2.5,0),new THREE.MeshLambertMaterial({color:0xffffff}),stalls.length),
      po=new THREE.InstancedMesh(merge([[-0.6,-1.7],[-0.6,1.7],[0.6,-1.7],[0.6,1.7]].map(([x,z])=>new THREE.BoxGeometry(0.08,2.5,0.08).translate(x,1.25,z))),Mt(0x5a4030),stalls.length),
      goods=new THREE.InstancedMesh(new THREE.BoxGeometry(1.1,0.25,2.8).translate(0,1.08,0),new THREE.MeshLambertMaterial({color:0xffffff}),stalls.length);
    const AWC=['#c8302a','#f4f0e6','#3a6aa8','#e8c040','#2a8a6a','#d86a3a'],GC=['#e86a3a','#e8c040','#8ac840','#c84a6a','#f0e0c0','#6a9ac8'];
    stalls.forEach(([x,y,z,a,sd],i)=>{o.position.set(x,y,z);o.rotation.set(0,-a,0);o.scale.set(1,1,1);o.updateMatrix();for(const m of [cm,aw,po,goods])m.setMatrixAt(i,o.matrix);aw.setColorAt(i,col.set(pick(AWC)));goods.setColorAt(i,col.set(pick(GC)));});
    for(const m of [cm,aw,po,goods]){m.castShadow=true;m.userData.noFingerprint=true;scene.add(m);}
    // the stallholders behind their counters
    const sh=crew(stalls.length,scene,true);stalls.forEach(([x,y,z,a,sd],i)=>{const bx=x+Math.cos(a)*sd*1.4,bz=z+Math.sin(a)*sd*1.4;put(sh,i,bx,y,bz,-a+(sd>0?Math.PI:0)+Math.PI/2*0,-0.4,0);});done(sh);
    api.ctx.details=Object.assign(api.ctx.details||{},{market:stalls.length});}
  // ================================================================ the clock
  let last=0;const WP=new THREE.Vector3();
  animHooks.push(now=>{const t=now/1000,dt=last?Math.min(0.1,t-last):0;last=t;const cam=camera.position;
    for(const Y of yards){Y.D.getWorldPosition(WP);const near=(WP.x-cam.x)**2+(WP.z-cam.z)**2<FAR*FAR;Y.grp.visible=near;if(!near)continue;
      // the hammers: up and down, each to its own beat; the sawyers' arms back and forth; the foreman still
      Y.H.forEach((w,i)=>{const a=w.foreman?0.2:w.saw?-1.2+Math.sin(t*w.sp*2+w.ph)*0.5:-1.0-0.9*Math.max(0,Math.sin(t*w.sp+w.ph));put(Y.ham,i,w.x,w.y,w.z,w.h,a,0);});done(Y.ham);
      // the carriers: along their path and back, the plank on their shoulders between them
      Y.C2.forEach((c,k)=>{const Lt=c.L[c.L.length-1];c.s=(c.s+c.v*dt)%(Lt*2);const out=c.s<Lt,sd=out?c.s:Lt*2-c.s;
        const at=s=>{let i=0;while(i<c.L.length-2&&c.L[i+1]<s)i++;const k2=(s-c.L[i])/Math.max(1e-6,c.L[i+1]-c.L[i]),p=c.path[i],q=c.path[i+1];return [p[0]+(q[0]-p[0])*k2,p[1]+(q[1]-p[1])*k2,p[2]+(q[2]-p[2])*k2,Math.atan2(q[2]-p[2],q[0]-p[0])+(out?0:Math.PI)];};
        const a1=at(Math.min(Lt,sd)),a2=at(Math.max(0,sd-(out?-2.4:2.4)));const step=Math.sin(c.s*2.6)*0.35;
        put(Y.car,k*2,a1[0],a1[1],a1[2],-a1[3],0,step);put(Y.car,k*2+1,a2[0],a2[1],a2[2],-a1[3],0,-step);
        if(out){o.position.set((a1[0]+a2[0])/2,(a1[1]+a2[1])/2+1.62,(a1[2]+a2[2])/2);o.rotation.set(0,-Math.atan2(a1[2]-a2[2],a1[0]-a2[0]),0);o.scale.set(1,1,1);}else{o.position.set(0,-50,0);}o.updateMatrix();Y.car.plank.setMatrixAt(k,o.matrix);});
      done(Y.car);
      // Dock One's crowd: arms up and waving
      if(Y.fans){Y.F.forEach((f,i)=>{put(Y.fans,i,f.x,2.3,f.z,f.h,-2.6+Math.sin(t*3+f.ph)*0.5,0);});done(Y.fans);}}
    // the boats: at anchor they swing and ride the swell; under way they go round; the trader comes and goes
    for(const b of boats){let x,z,h;
      if(b.mode==='anchor'){x=b.x;z=b.z;h=b.h+Math.sin(t*0.03+b.ph)*0.3;}
      else if(b.mode==='circle'){b.a+=b.v*dt;x=Math.cos(b.a)*b.r;z=Math.sin(b.a)*b.r;h=b.a+(b.v>0?Math.PI/2:-Math.PI/2);}
      else{b.t=(b.t+dt)%240;const f=b.t<110?b.t/110:b.t<130?1:b.t<240?1-(b.t-130)/110:0,e=f*f*(3-2*f),r=3200-(3200-1560)*e;x=Math.cos(b.a)*r;z=Math.sin(b.a)*r;h=b.a+(b.t<120?Math.PI:0);}
      const y=seaY(x,z),y2=seaY(x+Math.cos(h)*8,z+Math.sin(h)*8);b.g.position.set(x,y,z);b.g.rotation.set(Math.sin(t*0.9+b.ph)*0.04,-h,Math.atan2(y2-y,8));}
    // the gulls: wheeling, wings beating then gliding
    for(let i=0;i<NG;i++){const gl=GULL[i];gl.a+=gl.v*dt*20/gl.r;const x=gl.cx+Math.cos(gl.a)*gl.r,z=gl.cz+Math.sin(gl.a)*gl.r,y=gl.y+Math.sin(t*0.4+gl.fl)*4,h=gl.a+(gl.v>0?Math.PI/2:-Math.PI/2);
      const flap=Math.sin(t*9+gl.fl)*(Math.sin(t*0.5+gl.fl)>0?0.7:0.08);
      o.position.set(x,y,z);o.rotation.set(0,-h,0);o.scale.set(1,1,1);o.updateMatrix();gb.setMatrixAt(i,o.matrix);
      o.rotation.set(flap,-h,0,'YXZ');o.updateMatrix();wl.setMatrixAt(i,o.matrix);o.rotation.set(-flap,-h,0,'YXZ');o.scale.set(1,1,-1);o.updateMatrix();wr.setMatrixAt(i,o.matrix);}
    gb.instanceMatrix.needsUpdate=wl.instanceMatrix.needsUpdate=wr.instanceMatrix.needsUpdate=true;});
  api.ctx.details=Object.assign(api.ctx.details||{},{work:{yards:yards.length,shipwrights:yards.reduce((a,Y)=>a+Y.H.length+Y.CN*2+(Y.F.length),0),boats:boats.length,gulls:NG}});
}
