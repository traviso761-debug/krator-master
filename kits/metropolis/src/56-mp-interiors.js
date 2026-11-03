// ================================================================= METROPOLIS — the interiors: on demand  [draw]
// A storey is drawn only when asked for: MP.openStorey(key, k, x, z) makes one storey's slab, ceiling, partitions, shafts and furniture from its plan (41), in a
// group of its own, and MP.closeStorey puts it away. Nothing here runs for a tower out of range. At most three stay open (MP.LIVE): the player's and the two either side.
// The furniture is the catalog's, by AI.furnishPlan in the culture `ancient`, its templates shared between like rooms.
MP.LIVE=3;MP.open=[];
MP.furnishCat=null;
MP.furnish=function(F,st){const AI=KratorAncientsInteriors;if(!MP.furnishCat)MP.furnishCat=KratorInteriors.runtimeAdapter(KratorFurniture,KratorFurniture.batch());
 return AI.furnishPlan({type:F.id,furnish:true,culture:'ancient',buildings:[{storeys:[st]}]},MP.furnishCat,{cultures:['ancient','generic'],seed:MP.idHash(F.id)&0xffff});};
MP.drawStorey=function(F,k){const st=MP.storey(F,k),L=F.levels[k],B=MP.builder(),g=new THREE.Group(),M=MP.mats(),round=F.core.kind==='round',WH=L.h-.3,T=.14;
 g.name=F.id+'.storey.'+k;
 // the partitions: a polyline, gapped at its door, with a lintel over the gap
 const blocks=[],seg=(a,b,y0,y1,c)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);if(l<.04)return;if(y0<L.y+.5)for(let q=0,nq=Math.ceil(l/.35);q<nq;q++){const f=(q+.5)/nq;blocks.push([a[0]+dx*f,a[1]+dz*f]);}const nx=-dz/l*T/2,nz=dx/l*T/2,cl={col:c,uv:2},P=(q,s,y)=>[q[0]+nx*s,y,q[1]+nz*s];
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
 const shape=new THREE.Shape(st.outline.map(p=>new THREE.Vector2(p[0],-p[1]))),sl=new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:false,curveSegments:1});sl.rotateX(-Math.PI/2);
 const fl=new THREE.Mesh(sl,M.slab);fl.position.y=L.y-.22;g.add(fl);const ce=new THREE.Mesh(sl,M.slab);ce.position.y=L.y+L.h-.26;g.add(ce);
 // the skin's inner face, where the outside's one-sided strips do not show: spandrel and head, and a dado of the core
 if(round){const R=MP.skinR(F,L)+.1,N=st.facade.ring.length;B.lathe('white',[[R,L.y+L.h],[R,L.y+2.5],],N,{flip:false});B.lathe('white',[[R,L.y+.9],[R,L.y]],N,{flip:false});
  const r=MP.coreR(F,k),ca=st.rooms.filter(R0=>/\.core$/.test(R0.id))[0],da=ca&&ca.doors[0]?Math.atan2(ca.doors[0].at[1],ca.doors[0].at[0]):0;
   const gaps=[da].concat(F.core.shafts.filter(q=>k>=q.from&&k<=q.to).map(q=>Math.atan2(q.z,q.x))).map(t=>(t+6.2832)%6.2832),skip=t=>gaps.some(g=>{let d=Math.abs(t-g);d=Math.min(d,6.2832-d);return d<.17;});
  B.lathe('concrete',[[r,L.y+L.h],[r,L.y]],36,{skip});
  B.lathe('concrete',[[r-.25,L.y],[r-.25,L.y+L.h]],36,{skip});}
 else{const hw=F.footprint.w/2-.1,hd=F.footprint.d/2-.1;B.quad('relief',[hw,L.y,-hd],[hw,L.y,hd],[hw,L.y+L.h,hd],[hw,L.y+L.h,-hd],[-1,0,0],{uv:6});B.quad('relief',[-hw,L.y,hd],[-hw,L.y,-hd],[-hw,L.y+L.h,-hd],[-hw,L.y+L.h,hd],[1,0,0],{uv:6});
  [1,-1].forEach(s=>{const z=s*hd;const q=(a,b)=>s>0?B.quad('white',[hw,a,z],[-hw,a,z],[-hw,b,z],[hw,b,z],[0,0,-1]):B.quad('white',[-hw,a,z],[hw,a,z],[hw,b,z],[-hw,b,z],[0,0,1]);q(L.y,L.y+.9);q(L.y+2.5,L.y+L.h);});}
 // the shafts: a lift's car door, a stair's first flight, each where the record says on every storey
 F.core.shafts.forEach(function(s){if(k<s.from||k>s.to)return;const c=s.kind==='lift'?[.4,.42,.44]:[.6,.6,.58];
  /* the shaft's door: on the side that faces out of the core (a ring) or to the corridor (a slab): open for a stair, a shut bronze leaf for a lift */
  const out=round?1:-1,face=Math.abs(s.x)>Math.abs(s.z)&&round?(s.x*out>0?1:3):(s.z*out>0?2:0),E=[[s.x-s.w/2,s.z-s.d/2,s.x+s.w/2,s.z-s.d/2],[s.x+s.w/2,s.z-s.d/2,s.x+s.w/2,s.z+s.d/2],[s.x+s.w/2,s.z+s.d/2,s.x-s.w/2,s.z+s.d/2],[s.x-s.w/2,s.z+s.d/2,s.x-s.w/2,s.z-s.d/2]],top=L.y+L.h-.26;
  E.forEach((e,i)=>{if(i!==face){seg([e[0],e[1]],[e[2],e[3]],y0,top,c);return;}const l=Math.hypot(e[2]-e[0],e[3]-e[1]),w=Math.min(1.2,l-.4),t0=(1-w/l)/2,t1=1-t0,P=f=>[e[0]+(e[2]-e[0])*f,e[1]+(e[3]-e[1])*f];seg([e[0],e[1]],P(t0),y0,top,c);seg(P(t1),[e[2],e[3]],y0,top,c);seg(P(t0),P(t1),y0+DH,top,c);if(s.kind==='lift')seg(P(t0),P(t1),y0,y0+DH,[.42,.33,.22]);});
  if(s.kind==='stair'){const n=10;for(let i=0;i<n;i++)B.panel(s.x-s.w*.25,L.y+.09+i*.18,s.z-s.d/2+.3+i*(s.d-.6)/n,0,s.w*.45,.18,(s.d-.6)/n,[.55,.55,.53]);}});
 const G=B.finish(F,'storey'+k);G.children.forEach(m=>g.add(m.clone()));
 // the furniture
 const out=MP.furnish(F,st);let pieces=0;
 if(out.rooms){const Bf=KratorFurniture.batch({indexed:true});out.rooms.forEach(r=>r.placements.forEach(p=>{Bf.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.variant|0,seed:MP.idHash(p.room||'r')&0xffff,wealth:.6,setting:'indoor'});pieces++;}));
  const fg=Bf.flush(g);if(fg)fg.traverse(o=>{if(o.isMesh)KFURN.linearColours(o.geometry);});}
 let tris=0;g.traverse(o=>{if(o.isMesh&&o.geometry){const c=o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count;tris+=c/3*(o.isInstancedMesh?o.count:1);}});
 g.userData={storey:k,rooms:st.rooms.length,pieces:pieces,tris:Math.round(tris),plan:st,furnished:out,blocks:blocks,outline:st.outline};return g;};
// the walk records: the ground, and for each open storey its slab and every wall as a chain of small blocks (so a doorway stays a gap). Rebuilt when a storey opens or closes
MP.walkSync=function(){const W=KWALK;W.clear();W.floor({rect:[-8000,8000,-8000,8000],y:0,name:'the plaza',tag:'ground'});
 MP.open.forEach(function(o){const L=MP.FAMILY[o.key].levels[o.k],c=Math.cos(o.yaw),n=Math.sin(o.yaw),T=p=>[o.x+p[0]*c+p[1]*n,o.z-p[0]*n+p[1]*c],y=L.y;
  W.poly({pts:o.g.userData.outline.map(p=>{const q=T(p);return [q[0],q[1],y];}),name:o.key+' L'+o.k,tag:'storey'});
  o.g.userData.blocks.forEach(p=>{const q=T(p);W.block([q[0]-.09,q[0]+.09,q[1]-.09,q[1]+.09,y,y+3],'wall');});});};
MP.openStorey=function(key,k,x,z,yaw){yaw=yaw==null?0:yaw;const F=MP.FAMILY[key];if(MP.open.some(o=>o.key===key&&o.k===k&&o.x===x&&o.z===z))return;
 const g=MP.drawStorey(F,k);g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);MP.open.push({key,k,g,x,z,yaw});while(MP.open.length>MP.LIVE)MP.closeOne();MP.walkSync();};
MP.closeOne=function(){const o=MP.open.shift();if(!o)return;scene.remove(o.g);o.g.traverse(m=>{if(m.geometry&&!m.isInstancedMesh)m.geometry.dispose();});};
MP.closeStoreys=function(){while(MP.open.length)MP.closeOne();MP.walkSync();};
// going in: a camera inside a hero's skin opens the storey it stands on and the two either side, a camera that left closes them. Nothing runs for a tower nobody is in
MP.heroAt=function(e){for(const g of MPS.live){const m=g.userData.mp;if(!m)continue;const F=MP.FAMILY[m.key.split('.')[0]],dx=e.x-m.x,dz=e.z-m.z,c=Math.cos(m.yaw),n=Math.sin(m.yaw),lx=dx*c-dz*n,lz=dx*n+dz*c;
  if(F.core.kind==='round'?Math.hypot(lx,lz)<MP.spindleR(Math.min(e.y,222)):Math.abs(lx)<F.footprint.w/2&&Math.abs(lz)<F.footprint.d/2)return {m,F};}return null;};
MP.levelAt=function(F,y){let k=0;F.levels.forEach(L=>{if(y>=L.y-.1)k=L.k;});return k;};
MP.enterTick=function(){const now=performance.now();if(now<(MP.nextEnter||0))return;MP.nextEnter=now+300;const e=camera.position,H=MP.heroAt(e);if(MPS.mode&&MP_CFG[MPS.mode].storey&&!MP.entered)return;
 if(!H){if(MP.entered){MP.entered=null;MP.closeStoreys();}return;}const key=H.F.id,k=MP.levelAt(H.F,e.y),id=key+'@'+H.m.x+','+H.m.z+'#'+k;if(MP.entered===id)return;MP.entered=id;MP.openStorey(key,k,H.m.x,H.m.z,H.m.yaw);};
// the lift: to storey k of the hero the camera is in, or the nearest: stand at the core's door and walk from there
MP.goStorey=function(k){const e=camera.position;let H=MP.heroAt(e);if(!H){let b=null,bd=1e9;for(const g of MPS.live){const m=g.userData.mp;if(!m)continue;const d=Math.hypot(e.x-m.x,e.z-m.z);if(d<bd){bd=d;b=m;}}if(!b)return false;H={m:b,F:MP.FAMILY[b.key.split('.')[0]]};}
 const F=H.F,m=H.m;k=Math.max(0,Math.min(F.levels.length-1,k));const L=F.levels[k],c=Math.cos(m.yaw),n=Math.sin(m.yaw),st=MP.storey(F,k),P=F.core.kind==='round'?[MP.coreR(F,k)+1,0]:[0,0],x=m.x+P[0]*c+P[1]*n,z=m.z-P[0]*n+P[1]*c;
 MP.closeStoreys();MP.openStorey(F.id,k,m.x,m.z,m.yaw);MP.entered=F.id+'@'+m.x+','+m.z+'#'+k;const C=HOSTED.cam;C.walkAt=[x,z,L.y];HOSTED.ctl.target.set(x,L.y+HOSTED.ctl.eye,z);HOSTED.ctl.walk=true;HOSTED.ctl.phi=Math.PI/2+.05;HOSTED.ctl.theta=(F.core.kind==='round'?Math.PI:-Math.PI/2)+m.yaw;return true;};
MP.step=function(d){const H=MP.heroAt(camera.position);if(!H)return false;return MP.goStorey(MP.levelAt(H.F,camera.position.y-HOSTED.ctl.eye+.2)+d);};

