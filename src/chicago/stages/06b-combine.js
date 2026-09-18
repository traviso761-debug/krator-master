// ---------- the occupation: striders walking the prospects, manhacks in the streets, dropships carrying troop pods,
// armoured carriers on the arterials, and the barriers and field gates that close off everything else.
// Only a city whose config has a "combine" block gets any of this; every other city skips the section. ----------
section('combine',()=>{
  const K=C.combine;if(!K)return;
  const CBR=mkRng(8817),rnd2=(a,b)=>a+(b-a)*CBR();
  const cm=new THREE.MeshPhongMaterial({color:0x3a4048,specular:0x70808f,shininess:16,flatShading:true});
  const cdark=new THREE.MeshPhongMaterial({color:0x2b3037,specular:0x60707f,shininess:14,flatShading:true});
  const lampM=new THREE.MeshBasicMaterial({color:0xff7a30});
  const fieldM=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:0.2,side:THREE.DoubleSide,depthWrite:false});
  const D=new THREE.Object3D();
  // the routes the ground units use: the named arterials, joined end to end as the traffic stage joins them
  const CBCAR=new Set(['motorway','trunk','primary','secondary']),cbGroups=new Map();
  for(const r of ROADS){if(!CBCAR.has(r.c)||!r.name||r.bridge)continue;let g=cbGroups.get(r.name);if(!g){g=[];cbGroups.set(r.name,g);}g.push(r);}
  const cbRoutes=[];
  for(const [name,rs] of cbGroups){for(const pts of joinChains(rs.map(r=>r.pts),2)){const r=polyLen({pts});if(r.len<400)continue;r.w=rs[0].w;r.name=name;cbRoutes.push(r);}}
  const pickRoute=()=>cbRoutes.length?cbRoutes[Math.floor(CBR()*cbRoutes.length)]:null;
  // the routes nearest the middle of the map first: the striders patrol the core, not the outskirts
  const midOf=r=>polyAt(r,r.len/2),central=cbRoutes.slice().sort((a,b)=>{const p=midOf(a),q=midOf(b);
    return Math.hypot(p[0],p[1])-Math.hypot(q[0],q[1]);});

  // ---- striders: three legs, a long stride, and they walk the prospects rather than the side streets ----
  const striders=[];
  {const BODY=19,REACH=15.5,STRIDE=9;
   for(let k=0;k<(K.striders||0);k++){const r=central[k%Math.max(1,central.length)];if(!r)break;
     const g=new THREE.Group(),pod=new THREE.Mesh(new THREE.SphereGeometry(4.4,12,9),cm);
     pod.scale.set(1.9,0.85,1);pod.position.y=BODY;g.add(pod);
     const snout=new THREE.Mesh(new THREE.CylinderGeometry(0.7,2.4,9,6).rotateZ(Math.PI/2),cm);snout.position.set(7,BODY,0);g.add(snout);
     const eye=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),lampM);eye.position.set(11.2,BODY,0);g.add(eye);
     for(const sd of [-1,1]){const hp=new THREE.Mesh(new THREE.BoxGeometry(5,2.6,3),cdark);hp.position.set(-2,BODY+2.2,sd*3.4);g.add(hp);}
     const legs=[];for(let q=0;q<3;q++){const a=q/3*Math.PI*2+Math.PI/6;
       const thigh=new THREE.Mesh(new THREE.CylinderGeometry(0.78,0.62,1,5).translate(0,0.5,0),cm),
             shin=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.3,1,5).translate(0,0.5,0),cm);
       g.add(thigh,shin);legs.push({a,thigh,shin,ph:q/3});}
     scene.add(g);
     striders.push({g,legs,r,s:CBR()*r.len,v:3.2+CBR()*1.6,dir:CBR()<0.5?-1:1,BODY,REACH,STRIDE,eye});}
   const aim=new THREE.Vector3(),up=new THREE.Vector3(0,1,0),tmp=new THREE.Vector3();
   const limb=(mesh,ax,ay,az,bx,by,bz)=>{aim.set(bx-ax,by-ay,bz-az);const len=aim.length()||1;
     mesh.position.set(ax,ay,az);mesh.scale.set(1,len,1);tmp.copy(aim).normalize();mesh.quaternion.setFromUnitVectors(up,tmp);};
   let lastT=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-lastT)/1000);lastT=now;
     for(const st of striders){st.s+=st.v*dt*st.dir;const [px,pz]=polyAt(st.r,st.s,true),[ax,az]=polyAt(st.r,st.s+st.dir*8,true);
       const gy=groundH(px,pz),head=Math.atan2(az-pz,ax-px);
       st.g.position.set(px,gy,pz);st.g.rotation.y=-head;
       const cyc=(st.s/26)%1;
       for(const lg of st.legs){const ph=((cyc+lg.ph)%1+1)%1,swing=ph<0.34,u=swing?ph/0.34:(ph-0.34)/0.66;
         const fwd=swing?(-0.5+u):(0.5-u),lift=swing?Math.sin(u*Math.PI)*5.5:0;
         const fx=Math.cos(lg.a)*st.REACH+fwd*st.STRIDE,fz=Math.sin(lg.a)*st.REACH,hipY=st.BODY-1.5;
         const kx=fx*0.55,kz=fz*0.55,ky=hipY*0.56+lift*0.4+5;
         limb(lg.thigh,0,hipY,0,kx,ky,kz);limb(lg.shin,kx,ky,kz,fx,lift,fz);}}});}

  // ---- manhacks: small flyers that hold a street corner and circle it, blades always turning ----
  const manhacks=[];
  {const n=K.manhacks||0;
   const bodyG=new THREE.SphereGeometry(0.45,8,6),bladeG=new THREE.TorusGeometry(0.62,0.07,4,10).rotateX(Math.PI/2);
   const bodies=new THREE.InstancedMesh(bodyG,cdark,Math.max(1,n)),blades=new THREE.InstancedMesh(bladeG,cm,Math.max(1,n)),
         eyes=new THREE.InstancedMesh(new THREE.SphereGeometry(0.16,6,5),lampM,Math.max(1,n));
   const streets=ROADS.filter(r=>r.c==='residential'&&r.len>60);
   for(let k=0;k<n&&streets.length;k++){const r=streets[Math.floor(CBR()*streets.length)],i=Math.floor(CBR()*(r.pts.length-1));
     const [x,z]=r.pts[i];if(!inMap(x,z,20)||inWater(x,z))continue;
     manhacks.push({x,z,rad:3+CBR()*7,a:CBR()*6.28,v:(CBR()<0.5?-1:1)*(0.35+CBR()*0.5),y:3.5+CBR()*5,bob:CBR()*6.28});}
   bodies.count=blades.count=eyes.count=manhacks.length;
   bodies.frustumCulled=blades.frustumCulled=eyes.frustumCulled=false;
   if(manhacks.length)scene.add(bodies,blades,eyes);
   animHooks.push(now=>{const t=now/1000;
     manhacks.forEach((m,i)=>{m.a+=m.v*0.016;const x=m.x+Math.cos(m.a)*m.rad,z=m.z+Math.sin(m.a)*m.rad,y=groundH(x,z)+m.y+Math.sin(t*2.2+m.bob)*0.5;
       D.position.set(x,y,z);D.rotation.set(0,-m.a,0);D.scale.set(1,1,1);D.updateMatrix();bodies.setMatrixAt(i,D.matrix);eyes.setMatrixAt(i,D.matrix);
       D.rotation.set(0,t*22+i,0);D.updateMatrix();blades.setMatrixAt(i,D.matrix);});
     bodies.instanceMatrix.needsUpdate=blades.instanceMatrix.needsUpdate=eyes.instanceMatrix.needsUpdate=true;});}

  // ---- dropships: a hull with a troop pod slung under it, running between the Citadel and the outer districts ----
  const ships=[];
  {for(let k=0;k<(K.dropships||0);k++){const g=new THREE.Group();
     const hull=new THREE.Mesh(new THREE.SphereGeometry(4,12,9),cm);hull.scale.set(2.6,1,1.15);g.add(hull);
     const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.7,0.5,12,6).rotateZ(Math.PI/2),cm);tail.position.set(-12,0,0);g.add(tail);
     for(const sd of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(9,1,7),cm);w.position.set(1,0.4,sd*7);w.rotation.x=sd*0.3;g.add(w);
       const eng=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.8,5,6).rotateZ(Math.PI/2),cdark);eng.position.set(-2,-0.6,sd*7);g.add(eng);}
     const pod=new THREE.Mesh(new THREE.BoxGeometry(11,7.5,7),cdark);pod.position.set(0,-11,0);g.add(pod);
     for(const [sx,sz] of [[-4,-2.6],[4,-2.6],[-4,2.6],[4,2.6]]){const st=new THREE.Mesh(new THREE.BoxGeometry(0.5,8,0.5),cm);st.position.set(sx,-4.5,sz);g.add(st);}
     const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.9,8,6),lampM);lamp.position.set(10,0,0);g.add(lamp);
     scene.add(g);ships.push({g,lamp,pod,cx:rnd2(-500,500),cz:rnd2(-700,500),r:520+k*210,y:120+k*54,a:CBR()*6.28,v:0.00004+CBR()*0.00002});}
   animHooks.push(now=>{for(const s of ships){const a=s.a+now*s.v;const x=s.cx+Math.cos(a)*s.r,z=s.cz+Math.sin(a)*s.r;
     s.g.position.set(x,groundH(x,z)+s.y+Math.sin(now*0.0004)*8,z);
     s.g.rotation.set(0,-a-Math.PI/2,0.2);s.lamp.visible=(now%1300)<650;}});}

  // ---- armoured carriers on the arterials: the only traffic that never gets stopped ----
  const apcs=[];
  {for(let k=0;k<(K.apcs||0);k++){const r=pickRoute();if(!r)break;const g=new THREE.Group();
     const hull=new THREE.Mesh(new THREE.BoxGeometry(8.4,2.4,3.4).translate(0,2.1,0),cm);g.add(hull);
     const nose=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.7,3.4,6,1,false,0,Math.PI).rotateX(Math.PI/2).rotateZ(Math.PI/2),cm);
     nose.position.set(4.2,2.1,0);g.add(nose);
     const turret=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,1.4,6).translate(0,0.7,0),cdark);turret.position.set(-0.6,4.3,0);g.add(turret);
     const gun=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,3.6,5).rotateZ(Math.PI/2),cdark);gun.position.set(1.4,5,0);g.add(gun);
     for(const sd of [-1,1])for(const wx of [-2.6,0,2.6]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.7,8).rotateX(Math.PI/2),cdark);
       wheel.position.set(wx,1,sd*1.8);g.add(wheel);}
     const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,5),lampM);lamp.position.set(-0.6,5.4,0);g.add(lamp);
     scene.add(g);apcs.push({g,lamp,r,s:CBR()*r.len,v:7+CBR()*5,dir:CBR()<0.5?-1:1,off:rnd2(-3,3)});}
   let lastA=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-lastA)/1000);lastA=now;
     for(const c of apcs){c.s+=c.v*dt*c.dir;const [px,pz]=polyAt(c.r,c.s,true),[ax,az]=polyAt(c.r,c.s+c.dir*6,true);
       const head=Math.atan2(az-pz,ax-px),nx=-Math.sin(head),nz=Math.cos(head),x=px+nx*c.off,z=pz+nz*c.off;
       c.g.position.set(x,groundH(x,z),z);c.g.rotation.y=-head;c.lamp.visible=(now%900)<450;}});}

  // ---- barriers: rows across the side streets, lines of them along the kerbs, and a field over the gaps left to walk through ----
  let barriers=0,fields=0;
  {const barG=new THREE.BoxGeometry(1.15,1.3,2.7).translate(0,0.65,0);
   const fenceG=new THREE.BoxGeometry(0.28,2.4,3).translate(0,1.2,0);
   const B1=tiledInstances(barG,new THREE.MeshLambertMaterial({color:0x6e6a60}),1500,true);
   const B2=tiledInstances(fenceG,new THREE.MeshLambertMaterial({color:0x4e535a}),1500,true);
   const fieldGeo=new THREE.PlaneGeometry(1,1),F1=[];
   const want=K.barriers||0;
   const row=(cxp,czp,head,w,gap,fence)=>{for(let q=-w/2+0.7;q<w/2-0.3;q+=1.4){if(gap&&Math.abs(q)<1.7)continue;
     const px=cxp-Math.sin(head)*q,pz=czp+Math.cos(head)*q;if(inWater(px,pz))continue;
     (fence?B2:B1).add(px,groundH(px,pz),pz,-head,1,1,1);barriers++;}};
   for(const r of ROADS){if(barriers>=want)break;if(r.c!=='residential'||r.len<50)continue;
     for(const end of [0,1]){if(CBR()<0.25)continue;
       const i=end?Math.max(0,r.pts.length-2):0,[ax,az]=r.pts[i],[bx,bz]=r.pts[i+1];
       const L=Math.hypot(bx-ax,bz-az)||1,dx=(bx-ax)/L,dz=(bz-az)/L,u=end?Math.max(4,L-10-CBR()*14):10+CBR()*14;
       const cxp=ax+dx*u,czp=az+dz*u;if(!inMap(cxp,czp,10)||inWater(cxp,czp))continue;
       const head=Math.atan2(dz,dx),gap=CBR()<0.5;
       row(cxp,czp,head,r.w,gap,CBR()<0.3);
       if(!gap&&CBR()<0.45){const f=new THREE.Mesh(fieldGeo,fieldM);f.position.set(cxp,groundH(cxp,czp)+2.7,czp);
         f.rotation.y=-head;f.scale.set(r.w-1,5.2,1);scene.add(f);F1.push(f);fields++;}}
     // and a run of them shoved against one kerb, the way a street gets narrowed rather than closed
     if(CBR()<0.42){const i=Math.floor(CBR()*(r.pts.length-1)),[ax,az]=r.pts[i],[bx,bz]=r.pts[i+1];
       const L=Math.hypot(bx-ax,bz-az)||1,dx=(bx-ax)/L,dz=(bz-az)/L,head=Math.atan2(dz,dx),sd=CBR()<0.5?-1:1,off=r.w/2-1.4;
       for(let u=CBR()*6;u<Math.min(L,34);u+=2.9){const px=ax+dx*u-Math.sin(head)*sd*off,pz=az+dz*u+Math.cos(head)*sd*off;
         if(!inMap(px,pz,8)||inWater(px,pz))continue;B1.add(px,groundH(px,pz),pz,-head,1,1,1);barriers++;}}}
   // and around every controlled square: the plaza edges are lined with them, with gaps where people are let through
   for(const a of AREAS){if(a.kind!=='plaza')continue;const ring=a.o;
     for(let i=0;i<ring.length;i++){const p0=ring[i],p1=ring[(i+1)%ring.length];
       const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);if(L<3)continue;const dx=(p1[0]-p0[0])/L,dz=(p1[1]-p0[1])/L,head=Math.atan2(dz,dx);
       for(let u=1.6;u<L-1;u+=2.9){if(((u/L)%0.24)<0.05)continue;   // a gap every so often
         const px=p0[0]+dx*u,pz=p0[1]+dz*u;if(!inMap(px,pz,6)||inWater(px,pz))continue;
         (((i+u)|0)%5===0?B2:B1).add(px,groundH(px,pz),pz,-head,1,1,1);barriers++;}}}
   B1.build();B2.build();
   if(F1.length)animHooks.push(now=>{fieldM.opacity=0.14+0.1*Math.abs(Math.sin(now*0.0015));});}

  // ---- the queues: people stood waiting at the checkpoints, which is most of what anybody does here ----
  let queued=0;
  {const spots=[];
   for(const L of (C.landmarks||[])){if(L.model!=='forcegate')continue;const [gx,gz]=P(L.at);spots.push([gx,gz,L.ang||0]);}
   for(const f of FOCUS)spots.push([f.x,f.z,CBR()*6.28]);
   const n=spots.length*40;
   const bodyM=new THREE.MeshLambertMaterial({color:0xffffff}),headM2=new THREE.MeshLambertMaterial({color:0xb08a68});
   const bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.26,1.35,6).translate(0,0.68,0),bodyM,Math.max(1,n)),
         heads=new THREE.InstancedMesh(new THREE.SphereGeometry(0.13,6,5).translate(0,1.52,0),headM2,Math.max(1,n));
   const cc=new THREE.Color();
   for(const [gx,gz,ga] of spots){const line=22+Math.floor(CBR()*16),ux=-Math.sin(ga),uz=Math.cos(ga);
     for(let k=0;k<line&&queued<n;k++){const back=8+k*1.7+CBR()*1.1,side=(CBR()-0.5)*7.5;
       const px=gx+ux*back-uz*side,pz=gz+uz*back+ux*side;
       if(!inMap(px,pz,6)||inWater(px,pz))continue;
       D.position.set(px,groundH(px,pz),pz);D.rotation.set(0,-ga+CBR()*0.4-0.2,0);D.scale.set(1,1,1);D.updateMatrix();
       bodies.setMatrixAt(queued,D.matrix);heads.setMatrixAt(queued,D.matrix);
       bodies.setColorAt(queued,cc.setHSL(CBR(),0.18,0.2+CBR()*0.3));queued++;}}
   bodies.count=heads.count=queued;if(queued)scene.add(bodies,heads);}

  // ---- sentry posts on the arterials: an armoured box with a lamp that never stops turning ----
  let posts=0;
  {const pm=new THREE.MeshPhongMaterial({color:0x40464e,specular:0x70808f,shininess:14,flatShading:true});
   const lamps=[];
   for(const r of cbRoutes){if(posts>=(K.sentries||0))break;const s=r.len*(0.2+CBR()*0.6),[px,pz]=polyAt(r,s);
     const off=r.w/2+3.2,[ax,az]=polyAt(r,s+6),head=Math.atan2(az-pz,ax-px);
     const x=px-Math.sin(head)*off*(CBR()<0.5?-1:1),z=pz+Math.cos(head)*off;
     if(!inMap(x,z,10)||inWater(x,z))continue;const gy=groundH(x,z);
     const hut=new THREE.Mesh(new THREE.BoxGeometry(3.4,4.4,3.4).translate(0,2.2,0),pm);hut.position.set(x,gy,z);hut.rotation.y=-head;
     const cap=new THREE.Mesh(new THREE.CylinderGeometry(1,2.4,1.6,6).translate(0,0.8,0),pm);cap.position.set(x,gy+4.4,z);
     const lamp=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.5,0.5),lampM);lamp.position.set(x,gy+5.6,z);
     scene.add(hut,cap,lamp);lamps.push(lamp);posts++;}
   if(lamps.length)animHooks.push(now=>{const a=now*0.0016;for(let i=0;i<lamps.length;i++)lamps[i].rotation.y=a+i;});}

  ctx.striderAt=()=>striders.map(s=>[Math.round(s.g.position.x),Math.round(s.g.position.z)]);   // where the patrols are, for the probe
  ctx.details=Object.assign(ctx.details||{},{striders:striders.length,manhacks:manhacks.length,dropships:ships.length,
    carriers:apcs.length,barriers,fieldGates:fields,sentryPosts:posts,queueing:queued});
});
