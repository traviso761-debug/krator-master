// ================================================================= METROPOLIS — the interiors: on demand  [draw]
// A storey is drawn only when asked for: MP.openStorey(key, k, x, z) makes one storey's slab, ceiling, partitions, shafts and furniture from its plan (41), in a
// group of its own, and MP.closeStorey puts it away. Nothing here runs for a tower out of range. At most three stay open (MP.LIVE): the player's and the two either side.
// The furniture is the catalog's, by AI.furnishPlan in the culture `ancient`, its templates shared between like rooms.
MP.LIVE=3;MP.open=[];
MP.furnishCat=null;
MP.furnish=function(F,st){const AI=KratorAncientsInteriors;if(!MP.furnishCat)MP.furnishCat=KratorInteriors.runtimeAdapter(KratorFurniture,KratorFurniture.batch());
 /* the bath fixtures are the catalog's and the bath programme kits/interiors' (both permanent since 2026-11-08); a room's frame faces its door's wall (37-ai-kit.js) */
 const out=AI.furnishPlan({type:F.id,furnish:true,culture:'ancient',buildings:[{storeys:[st]}]},MP.furnishCat,{cultures:['ancient','generic'],seed:MP.idHash(F.id)&0xffff});
 /* a reading hall (46d, MP.stackLayout): its stacks and desks in rows, not the placer's (which only lines a hall's walls) */
 st.rooms.forEach(R=>{if(!R.stacks||!R.poly)return;out.rooms=out.rooms||[];out.rooms.push({synthetic:true,R,placements:MP.stackLayout(R.poly,R.y,MP.idHash(R.id)).map(p=>Object.assign(p,{room:R.id}))});});
 /* a machine hall (46d, MP.machineLayout): racks or work bays in runs round the core; 240 pieces a storey (near 200 k), the biggest hall first */
 /* the runs past the cap come back as blocks (out.far, 4000 a storey at most: about 48 k triangles), drawn as one instanced box (drawStorey) */
 const avoid=F.grid?(F.grid.cores||(F.grid.core?[F.grid.core]:[])):[];let left=240;
 st.rooms.filter(R=>R.layout&&R.poly).sort((a,b)=>(b.area||0)-(a.area||0)).forEach(R=>{const far=[],P=MP.machineLayout(R.poly,R.y,MP.idHash(R.id),R.layout,{avoid,cap:left,far});out.far=(out.far||[]).concat(far.slice(0,Math.max(0,4000-(out.far?out.far.length:0))).map(b=>Object.assign(b,{y:R.y})));left-=P.length;out.rooms=out.rooms||[];out.rooms.push({synthetic:true,R,placements:P.map(p=>Object.assign(p,{room:R.id}))});});
 return out;};
MP.drawStorey=function(F,k){const st=MP.storey(F,k),L=F.levels[k],B=MP.builder(),g=new THREE.Group(),M=MP.mats(),round=F.core.kind==='round',WH=L.h-.3,T=.14;
 g.name=F.id+'.storey.'+k;
 // the partitions: a polyline, gapped at its door, with a lintel over the gap
 const leaves=[],stairs=[],landings=[],blocks=[],seg=(a,b,y0,y1,c,free)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.04)return;if(y0<L.y+.5&&!free)for(let q=0,nq=Math.ceil(l/.35);q<nq;q++){const f=(q+.5)/nq;blocks.push([a[0]+dx*f,a[1]+dz*f]);}const nx=-dz/l*T/2,nz=dx/l*T/2,cl={col:c,uv:2},P=(q,s,y)=>[q[0]+nx*s,y,q[1]+nz*s];
  B.quad('white',P(a,1,y0),P(b,1,y0),P(b,1,y1),P(a,1,y1),[-dz/l,0,dx/l],cl);B.quad('white',P(b,-1,y0),P(a,-1,y0),P(a,-1,y1),P(b,-1,y1),[dz/l,0,-dx/l],cl);B.quad('white',P(a,1,y1),P(b,1,y1),P(b,-1,y1),P(a,-1,y1),[0,1,0],cl);B.quad('white',P(a,-1,y0),P(a,1,y0),P(a,1,y1),P(a,-1,y1),[-dx/l,0,-dz/l],cl);B.quad('white',P(b,1,y0),P(b,-1,y0),P(b,-1,y1),P(b,1,y1),[dx/l,0,dz/l],cl);B.quad('white',P(a,-1,y0),P(b,-1,y0),P(b,1,y0),P(a,1,y0),[0,-1,0],cl);};
 const WALL=[.84,.85,.84],y0=L.y+.02,y1=L.y+WH,DH=2.15;
 /* the door is found along the whole polyline, not per piece: a curved wall bends at its middle, which is where a door tends to stand */
 st.walls.forEach(function(W){if(!W.pts)return;const P=W.pts,d=W.door,S=[0];for(let i=0;i+1<P.length;i++)S.push(S[i]+Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]));const end=S[S.length-1];
  const at=s=>{let i=0;while(i<P.length-2&&S[i+1]<s)i++;const l=(S[i+1]-S[i])||1,f=(s-S[i])/l;return [P[i][0]+(P[i+1][0]-P[i][0])*f,P[i][1]+(P[i+1][1]-P[i][1])*f];};
  const run=(s0,s1,a,b)=>{if(s1-s0<.03)return;const c=[s0];S.forEach(v=>{if(v>s0+.01&&v<s1-.01)c.push(v);});c.push(s1);for(let i=0;i+1<c.length;i++)seg(at(c[i]),at(c[i+1]),a,b,WALL);};
  if(!d){run(0,end,y0,y1);return;}
  let sd=0,best=1e9;for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;if(!l2)continue;const t=Math.max(0,Math.min(1,((d.at[0]-a[0])*dx+(d.at[1]-a[1])*dz)/l2)),q=Math.hypot(a[0]+dx*t-d.at[0],a[1]+dz*t-d.at[1]);if(q<best){best=q;sd=S[i]+(S[i+1]-S[i])*t;}}
  const g0=Math.max(0,sd-d.w/2),g1=Math.min(end,sd+d.w/2);run(0,g0,y0,y1);run(g1,end,y0,y1);run(g0,g1,y0+DH,y1);});
 // the slab and the ceiling
 /* an atrium (the Cupola's galleries): the slab and the ceiling ring it, open over the hall */
 /* a storey of parts (41's parts: the Organ's pipes, the Pods' pods and bridge, the Long Curve's arc): a slab under each, a ring's court its hole */
 const lift=L.y<.05?.03:0;
 if(st.parts){st.parts.forEach(p=>{if(p.noSlab)return;const sh=new THREE.Shape(p.outline.map(q=>new THREE.Vector2(q[0],-q[1])));if(p.a0==null&&p.rIn>0){const h=new THREE.Path();h.absarc(p.cx,-p.cz,p.rIn,0,Math.PI*2,true);sh.holes.push(h);}
  const sg=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:false,curveSegments:1});sg.rotateX(-Math.PI/2);const f=new THREE.Mesh(sg,M.slab);f.position.y=L.y-.22+lift;g.add(f);if(st.open)return;const c2=new THREE.Mesh(sg,M.slab);c2.name='ceiling';c2.position.y=L.y+L.h-.26;g.add(c2);});}
 else{const shape=new THREE.Shape(st.outline.map(p=>new THREE.Vector2(p[0],-p[1])));if((F.core.atrium&&L.k>0)||st.hole){const rc=st.hole||MP.coreR(F,k),h=new THREE.Path();h.absarc(0,0,rc,0,Math.PI*2,true);shape.holes.push(h);}
 /* a court in a rect plate (the Arcades'): a rectangle in the slab, in the plate's own frame */
 if(st.holeRect&&st.rect){const R=st.rect,c=Math.cos(R.yaw),s=Math.sin(R.yaw),T=(x,z)=>new THREE.Vector2(R.cx+x*c+z*s,-(R.cz-x*s+z*c)),q=st.holeRect,h=new THREE.Path([T(-q.hw,-q.hd),T(-q.hw,q.hd),T(q.hw,q.hd),T(q.hw,-q.hd)]);shape.holes.push(h);}const sl=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false,curveSegments:F.core.atrium||st.hole?48:1});sl.rotateX(-Math.PI/2);
 /* a storey on the street lifts its slab and furniture 3 cm off the street plane (one plane under the other at y 0 fought) */
 const fl=new THREE.Mesh(sl,M.slab);fl.position.y=L.y-.22+lift;g.add(fl);const ce=new THREE.Mesh(sl,M.slab);ce.name='ceiling';ce.position.y=L.y+L.h-.26;g.add(ce);}
 /* a strip's rails (the Pods' bridge): glass to 1.1 m, walked as walls */
 (st.rails||[]).forEach(r=>{const a=r[0],b=r[1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.05)return;for(let q=0,nq=Math.ceil(l/.35);q<=nq;q++)blocks.push([a[0]+dx*q/nq,a[1]+dz*q/nq]);
  B.quad('glassClear',[a[0],L.y,a[1]],[b[0],L.y,b[1]],[b[0],L.y+1.1,b[1]],[a[0],L.y+1.1,a[1]],[-dz/l,0,dx/l]);B.quad('glassClear',[b[0],L.y,b[1]],[a[0],L.y,a[1]],[a[0],L.y+1.1,a[1]],[b[0],L.y+1.1,b[1]],[dz/l,0,-dx/l]);});
 // the skin's inner face, where the outside's one-sided strips do not show: spandrel and head, and a dado of the core
 if(round){const R=(st.R||MP.skinR(F,L))+.1,N=Math.max(24,st.facade.ring.length);if(!st.windowsOwn){B.lathe('white',[[R,L.y+L.h],[R,L.y+2.5],],N,{flip:false});B.lathe('white',[[R,L.y+.9],[R,L.y]],N,{flip:false});}
  const r=MP.coreR(F,k),ca=st.rooms.filter(R0=>/\.core$/.test(R0.id))[0],da=ca&&ca.doors[0]?Math.atan2(ca.doors[0].at[1],ca.doors[0].at[0]):0;
   const gaps=[da].concat(F.core.shafts.filter(q=>k>=q.from&&k<=q.to).map(q=>Math.atan2(q.z,q.x))).map(t=>(t+6.2832)%6.2832),skip=t=>gaps.some(g=>{let d=Math.abs(t-g);d=Math.min(d,6.2832-d);return d<.17;});
  /* an atrium's edge is a gallery's glass balustrade, 1.1 m, and its towers stand free in it; a core is walled */
  if(F.core.atrium){if(L.k>0){for(let q=0,nq=Math.ceil(2*Math.PI*r/.35);q<nq;q++){const a=2*Math.PI*q/nq;blocks.push([Math.cos(a)*(r+.1),Math.sin(a)*(r+.1)]);}B.lathe('glassClear',[[r,L.y+1.1],[r,L.y]],72,{});B.lathe('bronze',[[r+.05,L.y+1.1],[r-.1,L.y+1.1]],72,{uv:2});}}
  else if(!F.core.bays){B.lathe('concrete',[[r,L.y+L.h],[r,L.y]],36,{skip});
  B.lathe('concrete',[[r-.25,L.y],[r-.25,L.y+L.h]],36,{skip});}}
 else if(!F.design){const hw=F.footprint.w/2-.1,hd=F.footprint.d/2-.1;B.quad('relief',[hw,L.y,-hd],[hw,L.y,hd],[hw,L.y+L.h,hd],[hw,L.y+L.h,-hd],[-1,0,0],{uv:6});B.quad('relief',[-hw,L.y,hd],[-hw,L.y,-hd],[-hw,L.y+L.h,-hd],[-hw,L.y+L.h,hd],[1,0,0],{uv:6});
  if(L.use!=='arcade')[1,-1].forEach(s=>{const z=s*hd;const q=(a,b)=>s>0?B.quad('white',[hw,a,z],[-hw,a,z],[-hw,b,z],[hw,b,z],[0,0,-1]):B.quad('white',[-hw,a,z],[hw,a,z],[hw,b,z],[-hw,b,z],[0,0,1]);q(L.y,L.y+.9);q(L.y+2.5,L.y+L.h);});}
 // the shafts: a lift's car door, a stair's first flight, each where the record says on every storey
 F.core.shafts.forEach(function(s){if(k<s.from||k>s.to)return;const c=s.kind==='lift'?[.4,.42,.44]:[.6,.6,.58];
  /* the shaft's door: on the side that faces out of the core (a ring) or to the corridor (a slab): open for a stair, a shut bronze leaf for a lift */
  /* a shaft may turn (s.yaw: the Long Curve's, square to its arc): its walls, steps, strips and landing laid square and turned about its middle */
  const yaw=s.yaw||0,cY=Math.cos(yaw),sY=Math.sin(yaw),Rt=p=>yaw?[s.x+(p[0]-s.x)*cY+(p[1]-s.z)*sY,s.z-(p[0]-s.x)*sY+(p[1]-s.z)*cY]:p;
  const out=round?1:-1,face=s.face!=null?s.face:Math.abs(s.x)>Math.abs(s.z)&&round?(s.x*out>0?1:3):(s.z*out>0?2:0),E=[[s.x-s.w/2,s.z-s.d/2,s.x+s.w/2,s.z-s.d/2],[s.x+s.w/2,s.z-s.d/2,s.x+s.w/2,s.z+s.d/2],[s.x+s.w/2,s.z+s.d/2,s.x-s.w/2,s.z+s.d/2],[s.x-s.w/2,s.z+s.d/2,s.x-s.w/2,s.z-s.d/2]].map(e=>{const a=Rt([e[0],e[1]]),b=Rt([e[2],e[3]]);return [a[0],a[1],b[0],b[1]];}),top=L.y+L.h-.26;
  E.forEach((e,i)=>{if(i!==face){seg([e[0],e[1]],[e[2],e[3]],y0,top,c);return;}const l=Math.hypot(e[2]-e[0],e[3]-e[1]),w=Math.min(1.2,l-.4),t0=(1-w/l)/2,t1=1-t0,P=f=>[e[0]+(e[2]-e[0])*f,e[1]+(e[3]-e[1])*f];seg([e[0],e[1]],P(t0),y0,top,c);seg(P(t1),[e[2],e[3]],y0,top,c);seg(P(t0),P(t1),y0+DH,top,c);if(s.kind==='lift'){const a=P(t0),b=P(t1),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),m=new THREE.Mesh(new THREE.BoxGeometry(l,DH,.07),M.bronze);m.position.set((a[0]+b[0])/2,y0+DH/2,(a[1]+b[1])/2);m.rotation.y=-Math.atan2(dz,dx);m.name='a lift door';leaves.push({m,base:m.position.clone(),ax:[dx/l,dz/l],w:l,open:0});}});
  /* a stair: a switchback along the shaft, in from the door side up to a half landing, then back up to the door side of the storey above. Its steps are drawn from the record and walked as strips */
  if(s.kind==='stair'&&k<s.to){const sgn=face===2?1:-1,n=9,hd=s.d/2,hw=s.w/2,zD=s.z+sgn*(hd-.55),zI=s.z-sgn*(hd-.55),col={col:[.6,.6,.58],uv:2},H=L.h;
   const box=(x0,x1,ya,yb,z0,z1)=>{if(!yaw){B.box('concrete',x0,x1,ya,yb,z0,z1,col);return;}const c=Rt([(x0+x1)/2,(z0+z1)/2]);B.obox('concrete',c[0],(ya+yb)/2,c[1],yaw,x1-x0,yb-ya,z1-z0,col);};
   const flight=(x0,x1,z0,z1,y0,y1)=>{for(let i=0;i<n;i++){const a=i/n,b=(i+1)/n,za=z0+(z1-z0)*a,zb=z0+(z1-z0)*b;box(x0,x1,y0,y0+(y1-y0)*b,Math.min(za,zb),Math.max(za,zb));}const pa=Rt([(x0+x1)/2,z0]),pb=Rt([(x0+x1)/2,z1]);stairs.push({a:[pa[0],pa[1],y0],b:[pb[0],pb[1],y1],w:x1-x0});};
   flight(s.x-hw+.1,s.x-.08,zD,zI,L.y,L.y+H/2);flight(s.x+.08,s.x+hw-.1,zI,zD,L.y+H/2,L.y+H);
   const z0=Math.min(zI,s.z-sgn*hd),z1=Math.max(zI,s.z-sgn*hd);box(s.x-hw+.1,s.x+hw-.1,L.y+H/2-.2,L.y+H/2,z0,z1);landings.push({x0:s.x-hw+.1,x1:s.x+hw-.1,z0,z1,y:L.y+H/2,pts:[[s.x-hw+.1,z0],[s.x+hw-.1,z0],[s.x+hw-.1,z1],[s.x-hw+.1,z1]].map(Rt)});}});
 const G=B.finish(F,'storey'+k);G.children.forEach(m=>g.add(m.clone()));leaves.forEach(q=>g.add(q.m));
 // the furniture
 const out=MP.furnish(F,st);let pieces=0;
 if(out.rooms){const Bf=KratorFurniture.batch({indexed:true});out.rooms.forEach(r=>r.placements.forEach(p=>{Bf.place(p.key,p.x,p.y+lift,p.z,p.ry,{variant:p.variant|0,seed:MP.idHash(p.room||'r')&0xffff,wealth:.6,setting:'indoor'});pieces++;}));
  const fg=Bf.flush(g);if(fg)fg.traverse(o=>{if(o.isMesh)KFURN.linearColours(o.geometry);});}
 /* a machine hall's runs past its furnished cluster: one steel-grey box each (a run of racks, a bay), 12 triangles */
 if(out.far&&out.far.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),MP.farMat||(MP.farMat=new THREE.MeshStandardMaterial({color:0x4a4e55,roughness:.55,metalness:.35})),out.far.length),m4=new THREE.Matrix4(),q4=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0);
  out.far.forEach((b,i)=>{q4.setFromAxisAngle(Y,b.ry);m4.compose(new THREE.Vector3(b.x,b.y+lift,b.z),q4,new THREE.Vector3(b.w,b.h,b.d));im.setMatrixAt(i,m4);});im.name=F.id+'.storey'+k+'.far';g.add(im);}
 let tris=0;g.traverse(o=>{if(o.isMesh&&o.geometry){const c=o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count;tris+=c/3*(o.isInstancedMesh?o.count:1);}});
 g.userData={storey:k,rooms:st.rooms.length,pieces:pieces,tris:Math.round(tris),plan:st,furnished:out,blocks:blocks,leaves:leaves,stairs:stairs,landings:landings,outline:st.outline,outlines:st.parts?st.parts.map(p=>p.outline):null};return g;};
// the walk records: the ground, and for each open storey its slab and every wall as a chain of small blocks (so a doorway stays a gap). Rebuilt when a storey opens or closes
// a tower at the street: its skin stops a walker, its doors do not. The Spindle's skirt with its three portals; the Ledger's end walls and its arcade's piers
MP.towerBlocks=function(W,m){const F0=MP.FAMILY[m.key.split('.')[0]],F=F0&&!F0.design?F0:null,c=Math.cos(m.yaw),n=Math.sin(m.yaw),T=(x,z)=>[m.x+x*c+z*n,m.z-x*n+z*c],b=(x,z,h)=>{const q=T(x,z);W.block([q[0]-h,q[0]+h,q[1]-h,q[1]+h,0,6],'tower');};
 /* the fourteen: the ground outlines their lobbies recorded (54, B.walk), blocked every half metre but at their doors */
 if(!F){const H=MPS.hero[m.key];(H&&H.userData.walk||[]).forEach(o=>{const P=o.pts.concat(o.closed?[o.pts[0]]:[]);for(let i=0;i+1<P.length;i++){const p=P[i],q=P[i+1],k=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.5));
  for(let j=0;j<k;j++){const x=p[0]+(q[0]-p[0])*j/k,z=p[1]+(q[1]-p[1])*j/k;if(o.doors.some(d=>Math.hypot(x-d.x,z-d.z)<d.hw+.3))continue;b(x,z,.3);}}});return;}
 if(F.core.kind==='round'){const r=MP.spindleR(1.5)-.6,N=Math.ceil(2*Math.PI*r/.5);for(let i=0;i<N;i++){const a=2*Math.PI*i/N;if(F.portals.some(p=>{let d=Math.abs(a-p);d=Math.min(d,2*Math.PI-d);return d*r<3.6;}))continue;b(Math.cos(a)*r,Math.sin(a)*r,.3);}
  for(let i=0;i<F.fins.n;i++){const a=F.fins.a0+i*2*Math.PI/F.fins.n;for(let rr=r;rr<MP.finR(F,0);rr+=.5)b(Math.cos(a)*rr,Math.sin(a)*rr,F.fins.t/2);}}
 else{const hw=F.footprint.w/2,hd=F.footprint.d/2;for(let z=-hd;z<=hd;z+=.5){b(-hw,z,.4);b(hw,z,.4);}MP.arcadePiers(F).forEach(x=>[1,-1].forEach(s=>{for(let d=0;d<F.arcade.depth;d+=.5)b(x,s*(hd-d),1);}));
  /* the arcade's glass, but for its doors in the middle bay */
  for(let x=-hw;x<=hw;x+=.5)if(Math.abs(x)>3.6)[1,-1].forEach(s=>b(x,s*(hd-F.arcade.depth),.25));}};
/* the plaza's floor reaches 1.2 km round the eye, not the whole 16 km ground: core/walk indexes a floor in 16 m cells, and the whole ground's million took
   2.3 s every time a view changed. The stage's tick rebuilds it when the eye has gone 800 m (MP.walkAt) */
MP.walkSync=function(){const W=KWALK,e=camera.position,R=1200;W.clear();W.floor({rect:[e.x-R,e.x+R,e.z-R,e.z+R],y:0,name:'the plaza',tag:'ground'});MP.walkAt=[e.x,e.z];MP.walkDirty=false;
 (typeof MPS!=='undefined'?MPS.live:[]).forEach(g=>{if(g.userData.mp)MP.towerBlocks(W,g.userData.mp);});
 /* a hero's walked strips (the Spiral's ramp), whole or gutted only (a ruin's ramp is torn), turned with the tower */
 (typeof MPS!=='undefined'?MPS.live:[]).forEach(g=>{const m=g.userData.mp,H=m&&MPS.hero[m.key];if(!H||!(H.userData.strips||[]).length)return;const st=m.key.split('.')[1];if(st!=='intact'&&st!=='gutted')return;
  const c=Math.cos(m.yaw||0),n=Math.sin(m.yaw||0),T=p=>[m.x+p[0]*c+p[1]*n,m.z-p[0]*n+p[1]*c];H.userData.strips.forEach((q,i)=>{const a=T(q.a),b=T(q.b);W.strip({a:[a[0],a[1],q.a[2]],b:[b[0],b[1],q.b[2]],w:q.w,name:m.key+' ramp '+i,tag:'stair'});});});
 /* a ruin's heaps are walked on: their surface as triangles (KRUBBLE.walkTris), turned with the tower */
 (typeof MPS!=='undefined'?MPS.live:[]).forEach(g=>{const m=g.userData.mp;if(!m)return;const p=m.key.split('.'),c=Math.cos(m.yaw),n=Math.sin(m.yaw);
  if(!MP.FAMILY[p[0]])return;MP.heaps(MP.FAMILY[p[0]],p[1]).forEach((H,i)=>KRUBBLE.walkTris(H,4).forEach(t=>W.poly({pts:t.map(q=>[m.x+q[0]*c+q[1]*n,m.z-q[0]*n+q[1]*c,q[2]]),name:m.key+' rubble '+i,tag:'rubble'})));});
 MP.open.forEach(function(o){const L=MP.FAMILY[o.key].levels[o.k],c=Math.cos(o.yaw),n=Math.sin(o.yaw),T=p=>[o.x+p[0]*c+p[1]*n,o.z-p[0]*n+p[1]*c],y=L.y;
  (o.g.userData.outlines||[o.g.userData.outline]).forEach(ol=>W.poly({pts:ol.map(p=>{const q=T(p);return [q[0],q[1],y];}),name:o.key+' L'+o.k,tag:'storey'}));
  o.g.userData.stairs.forEach(f=>{const a=T(f.a),b=T(f.b);W.strip({a:[a[0],a[1],f.a[2]],b:[b[0],b[1],f.b[2]],w:f.w,name:'a stair',tag:'stair'});});
  o.g.userData.landings.forEach(l=>{W.poly({pts:(l.pts||[[l.x0,l.z0],[l.x1,l.z0],[l.x1,l.z1],[l.x0,l.z1]]).map(p=>{const q=T(p);return [q[0],q[1],l.y];}),name:'a landing',tag:'stair'});});
  o.g.userData.blocks.forEach(p=>{const q=T(p);W.block([q[0]-.09,q[0]+.09,q[1]-.09,q[1]+.09,y,y+3],'wall');});});};
MP.openStorey=function(key,k,x,z,yaw){yaw=yaw==null?0:yaw;const F=MP.FAMILY[key];if(MP.open.some(o=>o.key===key&&o.k===k&&o.x===x&&o.z===z))return;
 const g=MP.drawStorey(F,k);g.position.set(x,0,z);g.rotation.y=yaw;if(MP.shadow)MP.shadow.cast(g);scene.add(g);MP.open.push({key,k,g,x,z,yaw});while(MP.open.length>MP.LIVE)MP.closeOne();MP.walkSync();};
MP.closeOne=function(){const o=MP.open.shift();if(!o)return;scene.remove(o.g);o.g.traverse(m=>{if(m.geometry&&!m.isInstancedMesh)m.geometry.dispose();});};
MP.closeStoreys=function(){while(MP.open.length)MP.closeOne();MP.walkSync();};
// going in: a camera inside a hero's skin opens the storey it stands on and the two either side, a camera that left closes them. Nothing runs for a tower nobody is in
MP.heroAt=function(e,m0){const mg=m0==null?0:m0;for(const g of MPS.live){const m=g.userData.mp;if(!m||!MP.FAMILY[m.key.split('.')[0]])continue;const F=MP.FAMILY[m.key.split('.')[0]],dx=e.x-m.x,dz=e.z-m.z,c=Math.cos(m.yaw),n=Math.sin(m.yaw),lx=dx*c-dz*n,lz=dx*n+dz*c;
  if(F.hitIn?F.hitIn(lx,lz,Math.max(0,e.y-1.6),mg):F.core.kind==='round'?Math.hypot(lx,lz)<(F.hitR?F.hitR(Math.max(0,e.y-1.6)):F.envR?F.envR(Math.max(0,e.y-1.6)):MP.spindleR(Math.min(e.y,222)))+mg:Math.abs(lx)<F.footprint.w/2+mg&&Math.abs(lz)<F.footprint.d/2+mg)return {m,F};}return null;};
MP.levelAt=function(F,y){let k=0;F.levels.forEach(L=>{if(y>=L.y-.1)k=L.k;});return k;};
MP.enterTick=function(){if(MP.cut&&MP.cut.on)return;const now=performance.now();if(now<(MP.nextEnter||0))return;MP.nextEnter=now+300;/* 3 m out: the storey opens as the walker reaches a door, so its leaves part onto the lobby, not onto the hollow of a hero */
 const e=camera.position,H=MP.heroAt(e,3);if(MPS.mode&&MP_CFG[MPS.mode].storey&&!MP.entered)return;
 /* a ruin opens only the storeys under its standing skin (MP.ruin: a fallen tower none) */
 const k0=H?MP.levelAt(H.F,e.y):0,L0=H?H.F.levels[k0]:null;if(!H||L0.y+L0.h>MP.ruin(H.F,H.m.key.split('.')[1]).skin+.01){if(MP.entered){MP.entered=null;MP.closeStoreys();}return;}const key=H.F.id,k=k0,id=key+'@'+H.m.x+','+H.m.z+'#'+k;if(MP.entered===id)return;MP.entered=id;MP.openStorey(key,k,H.m.x,H.m.z,H.m.yaw);};
// the lift: to storey k of the hero the camera is in, or the nearest: stand at the core's door and walk from there
MP.goStorey=function(k){const e=camera.position;let H=MP.heroAt(e);if(!H){let b=null,bd=1e9;for(const g of MPS.live){const m=g.userData.mp;if(!m||!MP.FAMILY[m.key.split('.')[0]])continue;const d=Math.hypot(e.x-m.x,e.z-m.z);if(d<bd){bd=d;b=m;}}if(!b)return false;H={m:b,F:MP.FAMILY[b.key.split('.')[0]]};}
 const F=H.F,m=H.m,sk=MP.ruin(F,m.key.split('.')[1]).skin,top=F.levels.filter(L=>L.y+L.h<=sk+.01).length-1;if(top<0)return false;k=Math.max(0,Math.min(top,k));const L=F.levels[k],c=Math.cos(m.yaw),n=Math.sin(m.yaw),st=MP.storey(F,k),P=F.entryAt?F.entryAt(k):F.core.kind==='round'?[MP.coreR(F,k)+1,0]:[0,0],x=m.x+P[0]*c+P[1]*n,z=m.z-P[0]*n+P[1]*c;
 MP.closeStoreys();MP.openStorey(F.id,k,m.x,m.z,m.yaw);MP.entered=F.id+'@'+m.x+','+m.z+'#'+k;MP.nextEnter=performance.now()+800;const C=HOSTED.cam;C.walkAt=[x,z,L.y];HOSTED.ctl.target.set(x,L.y+HOSTED.ctl.eye,z);HOSTED.ctl.walk=true;HOSTED.ctl.phi=Math.PI/2+.05;HOSTED.ctl.theta=(F.core.kind==='round'?Math.PI:-Math.PI/2)+m.yaw;return true;};
MP.ride=function(k){const H=MP.heroAt(camera.position);if(!H||!HOSTED.ctl.walk)return MP.goStorey(k);const F=H.F,m=H.m,c0=MP.levelAt(F,camera.position.y-HOSTED.ctl.eye+.2),sk=MP.ruin(F,m.key.split('.')[1]).skin;k=Math.max(0,Math.min(F.levels.filter(L=>L.y+L.h<=sk+.01).length-1,k));if(k===c0||k<0)return false;
 /* the nearest lift that serves both storeys (the Organ has one a pipe, the Pods one a pod) */
 const e0=camera.position,ex=e0.x-m.x,ez=e0.z-m.z,elx=ex*Math.cos(m.yaw)-ez*Math.sin(m.yaw),elz=ex*Math.sin(m.yaw)+ez*Math.cos(m.yaw);
 const lift=F.core.shafts.filter(s=>s.kind==='lift'&&s.from<=Math.min(k,c0)&&s.to>=Math.max(k,c0)).sort((a,b)=>Math.hypot(a.x-elx,a.z-elz)-Math.hypot(b.x-elx,b.z-elz))[0];if(!lift)return MP.goStorey(k);
 const c=Math.cos(m.yaw),n=Math.sin(m.yaw),x=m.x+lift.x*c+lift.z*n,z=m.z-lift.x*n+lift.z*c,y0=F.levels[c0].y,y1=F.levels[k].y;
 MP.openStorey(F.id,k,m.x,m.z,m.yaw);MP.entered=F.id+'@'+m.x+','+m.z+'#'+k;MP.ride.on={x,z,y0,y1,t0:performance.now(),ms:Math.max(1500,Math.abs(y1-y0)/6*1000)};return true;};
// the doors: a lift's leaf slides into the wall when the walker comes within 2.5 m, or while the car stands at that storey; an entrance's leaves (a placed hero's) part
// when the walker is within 3 m of their opening
MP.doorTick=function(){const e=camera.position,v=new THREE.Vector3();MP.open.map(o=>o.g).concat(typeof MPS!=='undefined'?MPS.live:[]).forEach(g=>{(g.userData.leaves||[]).forEach(q=>{v.copy(q.base);q.m.parent.localToWorld(v);const near=Math.hypot(v.x-e.x,v.z-e.z)<(q.r==null?2.5:q.r)&&Math.abs(v.y-(e.y-HOSTED.ctl.eye+1.07))<2;if(q.dark){q.m.visible=!near;return;}q.open+=((near?1:0)-q.open)*.15;
  q.m.position.set(q.base.x+q.ax[0]*q.w*.95*q.open,q.base.y,q.base.z+q.ax[1]*q.w*.95*q.open);});});};
MP.rideView=function(){MP.doorTick();const R=MP.ride.on;if(!R)return;const f=Math.min(1,(performance.now()-R.t0)/R.ms),e=f<.5?2*f*f:1-2*(1-f)*(1-f),y=R.y0+(R.y1-R.y0)*e,C=HOSTED.cam;
 C.walkAt=[R.x,R.z,y];HOSTED.ctl.target.set(R.x,y+HOSTED.ctl.eye,R.z);camera.position.set(R.x,y+HOSTED.ctl.eye,R.z);MP.nextEnter=performance.now()+600;if(f>=1)MP.ride.on=null;};
MP.step=function(d){const H=MP.heroAt(camera.position);if(!H)return false;return MP.ride(MP.levelAt(H.F,camera.position.y-HOSTED.ctl.eye+.2)+d);};

