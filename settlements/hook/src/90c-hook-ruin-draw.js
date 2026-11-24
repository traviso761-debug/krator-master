/* ============================== HOOK: DRAWING THE ANCIENT CITY AT RANGE ([web]) ============================== */
/* Draws the records HOOK_RUIN made (77-hook-ruin.js, the owner's site plan, S3's far tier); it decides nothing about where
   anything goes. Every piece is massing, instanced, a handful of draw calls for the whole city: what a tower still
   stands to by its state (its footprint raised to the tip if intact, to the roof if gutted or crowned, half for broken,
   a quarter for a stump, most of it for a skeleton's frame), round for the round designs; a fallen tower lies on its
   foot's ground as a reef; a leaning one leans; rubble heaps (islands where the water covers the bed); the Hykkousoi pods
   on their towers; the freeway's decks and piers (the fallen west arc's spans lie broken in the water); the south ramp;
   the Pirate Emperors' wall in 40 m courses with towers every 160 m and its two gates. The heroes and shells up close
   (kits/metropolis) are 90d's, which hides a tower's massing where its hero stands (HOOK_RUIN_DRAW.slot: each standing
   tower's instance, its matrix and its seat); the town's own drawing (90b) is untouched.
   Nothing floats: a base is seated on the DRAWN ground, the lowest node of the terrain grid's cells under its footprint's
   edge and middle (PORT_ST.grid: a cell's triangles lie between its nodes, so nothing of the drawn ground under the
   footprint is lower than its edge's lowest node bar the cells inside, and a foundation 2 m deep covers them). A drowned
   tower's base is on the bed, so its foot stands under the water line. window._ruinDraw holds what verify.py reads. */
const HOOK_RUIN_DRAW={stats:{},towers:[],piers:[],heaps:[],slot:{}};
(()=>{const R=typeof HOOK_RUIN!=='undefined'?HOOK_RUIN:null,GR=PORT_ST.grid;
 if(!R||!GR){window._ruinDraw={ready:false};return;}
 /* ---- the drawn ground */
 const bs=(a,v)=>{let lo=0,hi=a.length-1;if(v<=a[0])return 0;if(v>=a[hi])return hi-1;while(hi-lo>1){const m=(lo+hi)>>1;if(a[m]<=v)lo=m;else hi=m;}return lo;};
 const meshMin=(x,z)=>{const i=bs(GR.xs,x),j=bs(GR.zs,z),n=GR.nx,H=GR.H,k=j*n+i;return Math.min(H[k],H[k+1],H[k+n],H[k+n+1]);};
 /* the lowest drawn ground along a footprint's edge (every 10 m) and at its middle */
 function seat(x,z,w,d,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),hw=w/2,hd=d/2;let m=meshMin(x,z);
  const p=(u,b)=>{m=Math.min(m,meshMin(x+u*c+b*s,z-u*s+b*c));};
  const nw=Math.max(1,Math.ceil(w/10)),nd=Math.max(1,Math.ceil(d/10));
  for(let a=0;a<=nw;a++){const u=-hw+a*w/nw;p(u,-hd);p(u,hd);}
  for(let a=0;a<=nd;a++){const b=-hd+a*d/nd;p(-hw,b);p(hw,b);}
  return m;}
 /* the drawn ground's height at a point: the cell's triangle (kits/port 71: a cell a,b,c,d split on its b-c diagonal) */
 const meshH=(x,z)=>{const i=bs(GR.xs,x),j=bs(GR.zs,z),n=GR.nx,H=GR.H,k=j*n+i,u=Math.max(0,Math.min(1,(x-GR.xs[i])/(GR.xs[i+1]-GR.xs[i]))),v=Math.max(0,Math.min(1,(z-GR.zs[j])/(GR.zs[j+1]-GR.zs[j])));
  const a=H[k],b=H[k+1],c=H[k+n],d=H[k+n+1];return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);};
 HOOK_RUIN_DRAW.meshMin=meshMin;HOOK_RUIN_DRAW.seat=seat;HOOK_RUIN_DRAW.meshH=meshH;
 /* ---- the pieces */
 const ROUND={spindle:1,stalk:1,telescope:1,swell:1,terrarium:1,cupola:1,watertower:1,spiral:1};
 const STAND={intact:t=>t.tip,gutted:t=>t.roof,crown:t=>t.roof*.96,broken:t=>t.roof*.55,stump:t=>t.roof*.25,skeleton:t=>t.roof*.7};
 /* the kit's own measure where the page has it (KMP, 77g: MP.ruin's top, what the hero up close stands to), so a tower does
    not change height at the switch; STAND where it has not */
 const KTOP={},ktop=t=>{const k=t.family+'.'+t.state;if(k in KTOP)return KTOP[k];let v=null;
  try{const MP=typeof KMP!=='undefined'?KMP.MP:null,F=MP&&MP.FAMILY[t.family];if(F){const r=MP.ruin(F,t.state);v=t.state==='intact'?F.height.tip:(r&&r.top!=null?r.top:null);}}catch(e){v=null;}
  return KTOP[k]=v;};
 const FOUND=2;   /* the foundation's depth under the seat */
 const col=new THREE.Color(),cg=new THREE.Color(0x4f7446),Y=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),ql=new THREE.Quaternion(),ax=new THREE.Vector3();
 const mat4=(x,y,z,quat,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),quat,new THREE.Vector3(sx,sy,sz));
 const SC={intact:0xb9b3a6,gutted:0xaea89b,crown:0xb3ad9f,broken:0x9d978a,stump:0x948e81,skeleton:0x6f6a61,fallen:0x8a8478};
 const box=new THREE.BoxGeometry(1,1,1);box.translate(0,.5,0);
 const cyl=new THREE.CylinderGeometry(.5,.5,1,14,1);cyl.translate(0,.5,0);
 const lam=c=>new THREE.MeshLambertMaterial({color:c==null?0xffffff:c});
 const group=new THREE.Group();group.name='hook-ruin';scene.add(group);
 /* r128's setColorAt sizes the colour buffer by the count at its first call: every instance gets white while the count is
    the capacity, then the count counts what is set (a buffer made at count 0 read as black) */
 const white=new THREE.Color(1,1,1);
 function inst(geo,mat,n,name){const cap=Math.max(1,n),m=new THREE.InstancedMesh(geo,mat,cap);for(let i=0;i<cap;i++)m.setColorAt(i,white);
  m.count=0;m.name=name;m.userData.probeSkip=true;m.userData.own='ruin';group.add(m);return m;}
 const T=R.towers,nRound=T.filter(t=>ROUND[t.family]&&t.state!=='fallen').length;
 const mBox=inst(box,lam(),T.length,'ruin towers'),mCyl=inst(cyl,lam(),nRound,'ruin towers round');
 const blockOf={};for(const b of R.blocks)blockOf[b.id]=b;
 for(const t of T){
  if(t.state==='fallen'){
   /* lying from its foot along its lean's bearing, a reef where the water covers its bed */
   const L=t.roof*.75,th=Math.min(40,Math.min(t.w,t.d)*.7),wd=Math.min(t.w,t.d),dir=t.leanDir,cx=t.x+Math.sin(dir)*L/2,cz=t.z+Math.cos(dir)*L/2;
   const base=seat(cx,cz,wd,L,dir)-th*.3;q.setFromAxisAngle(Y,dir);
   mBox.setMatrixAt(mBox.count,mat4(cx,base,cz,q,wd,th,L));mBox.setColorAt(mBox.count++,col.setHex(SC.fallen));
   HOOK_RUIN_DRAW.towers.push({id:t.id,x:cx,z:cz,w:wd,d:L,yaw:dir,base,top:base+th,wet:t.wet,state:t.state});continue;}
  const s0=seat(t.x,t.z,t.w,t.d,t.yaw),base=s0-FOUND,kt=ktop(t),top=kt!=null?s0+kt:t.y+STAND[t.state](t),h=Math.max(4,top-base);
  q.setFromAxisAngle(Y,t.yaw);
  if(t.lean){ax.set(Math.cos(t.leanDir),0,-Math.sin(t.leanDir));ql.setFromAxisAngle(ax,t.lean*Math.PI/180);q.premultiply(ql);}
  col.setHex(SC[t.state]);if(/\.wild$/.test(t.look))col.lerp(cg,.55);if(t.state==='skeleton')col.multiplyScalar(.9);
  const M=mat4(t.x,base,t.z,q,t.w,h,t.d);
  const mi=ROUND[t.family]?mCyl:mBox;HOOK_RUIN_DRAW.slot[t.id]={m:mi,k:mi.count,M,rec:t,seat:s0,q:q.clone()};
  mi.setMatrixAt(mi.count,M);mi.setColorAt(mi.count++,col);
  HOOK_RUIN_DRAW.towers.push({id:t.id,x:t.x,z:t.z,w:t.w,d:t.d,yaw:t.yaw,base,top:base+h,wet:t.wet,state:t.state});}
 /* ---- rubble: heaps, and islands where the water covers the bed */
 const dod=new THREE.DodecahedronGeometry(.5,0);dod.translate(0,.5,0);
 const mHeap=inst(dod,lam(0x8b8172),R.heaps.length,'ruin heaps');
 for(const h of R.heaps){const s0=meshMin(h.x,h.z),hh=h.wet?Math.max(4,-s0+2.5):Math.max(3,h.r*.35),base=s0-1;
  q.setFromAxisAngle(Y,(h.x*7+h.z*3)%6.28);mHeap.setMatrixAt(mHeap.count++,mat4(h.x,base,h.z,q,h.r*2,hh+1,h.r*2));
  HOOK_RUIN_DRAW.heaps.push({id:h.id,base,top:base+hh+1,wet:h.wet});}
 /* ---- the quarried clearings' foundations (77 foundation): each wall stub a box from the drawn ground's lowest point
    along it (half a metre under) to its height over the higher end, a stone tone a stub */
 const FD=R.foundations||[],nW=FD.reduce((a,f)=>a+f.walls.length,0),mFound=inst(box,lam(),nW,'ruin foundations');HOOK_RUIN_DRAW.walls=[];
 for(const f of FD)for(let k=0;k<f.walls.length;k++){const w=f.walls[k],dx=w[2]-w[0],dz=w[3]-w[1],L=Math.max(.5,Math.hypot(dx,dz)),yaw=Math.atan2(dx,dz),mx=(w[0]+w[2])/2,mz=(w[1]+w[3])/2;
  const base=seat(mx,mz,1.2,L,yaw)-.5,top=Math.max(meshH(w[0],w[1]),meshH(w[2],w[3]))+w[4];q.setFromAxisAngle(Y,yaw);
  mFound.setMatrixAt(mFound.count,mat4(mx,base,mz,q,1.2,top-base,L));col.setHex(0x9a9282).multiplyScalar(.86+.22*(((f.x*13+k*7)%10+10)%10)/10);
  mFound.setColorAt(mFound.count++,col);HOOK_RUIN_DRAW.walls.push({id:f.id,x:mx,z:mz,len:L,yaw,base,top});}
 /* ---- the pods on their towers */
 const sph=new THREE.SphereGeometry(.5,10,8);sph.translate(0,.5,0);
 const mPod=inst(sph,lam(0xd9dcd3),R.pods.length,'ruin pods'),tOf={};for(const t of T)tOf[t.id]=t;
 /* the Drowned Spire's pods are the Hykkousoi village's (77m C1: grown pods on the Spire's surface, 90b): here a point */
 const spireVillage=typeof HOOK_PLACES!=='undefined'&&HOOK_PLACES&&HOOK_PLACES.villages&&Object.values(HOOK_PLACES.villages).some(v=>v&&v.own==='spire');
 for(const p of R.pods){const t=tOf[p.parent],r=t?Math.max(t.w,t.d)/2+5:10;q.identity();const sc=spireVillage&&R.spire&&p.parent===R.spire.id?.001:1;
  mPod.setMatrixAt(mPod.count++,mat4(p.x+Math.cos(p.a)*r,p.y,p.z+Math.sin(p.a)*r,q,12*sc,9*sc,12*sc));}
 /* ---- the freeway: a deck a span (standing; broken shorter and tipped; fallen lying in the water), a pier at each
    span's start, and the south ramp */
 const mDeck=inst(box,lam(0xa7a399),R.spans.length+4,'ruin freeway decks'),mPier=inst(cyl,lam(0x99958b),R.spans.length+Math.ceil(Math.hypot(R.ramp.p1[0]-R.ramp.p0[0],R.ramp.p1[1]-R.ramp.p0[1])/70)+2,'ruin freeway piers');
 const pier=(x,z,top,stump)=>{const g=meshMin(x,z)-FOUND,h=stump?Math.max(3,Math.min(8,top-g)):Math.max(2,top-g);q.identity();
  mPier.setMatrixAt(mPier.count++,mat4(x,g,z,q,7,h,7));HOOK_RUIN_DRAW.piers.push({x,z,base:g,top:g+h});};
 for(const s of R.spans){const yaw=s.yaw;
  if(s.state==='fallen'){const g=meshMin(s.x,s.z);q.setFromAxisAngle(Y,yaw);ql.setFromAxisAngle(ax.set(Math.cos(yaw),0,-Math.sin(yaw)),.17);q.premultiply(ql);
   mDeck.setMatrixAt(mDeck.count,mat4(s.x,g-.5,s.z,q,24,2.5,s.len*.9));mDeck.setColorAt(mDeck.count++,col.setHex(0x8a867c));pier(s.p0[0],s.p0[1],0,true);continue;}
  const len=s.state==='broken'?s.len*.62:s.len;q.setFromAxisAngle(Y,yaw);
  if(s.state==='broken'){ql.setFromAxisAngle(ax.set(Math.cos(yaw),0,-Math.sin(yaw)),.1);q.premultiply(ql);}
  mDeck.setMatrixAt(mDeck.count,mat4(s.x,s.y-1.25,s.z,q,24,2.5,len));mDeck.setColorAt(mDeck.count++,col.setHex(s.state==='broken'?0x9a968c:0xa7a399));
  pier(s.p0[0],s.p0[1],s.y-1.25,false);}
 {const r=R.ramp,dx=r.p1[0]-r.p0[0],dz=r.p1[1]-r.p0[1],hl=Math.hypot(dx,dz),dy=r.y1-r.y0,L=Math.hypot(hl,dy);
  q.setFromAxisAngle(Y,Math.atan2(dx,dz));ql.setFromAxisAngle(ax.set(1,0,0),Math.asin(-dy/L));q.multiply(ql);
  mDeck.setMatrixAt(mDeck.count,mat4((r.p0[0]+r.p1[0])/2,(r.y0+r.y1)/2-1.25,(r.p0[1]+r.p1[1])/2,q,20,2.5,L));mDeck.setColorAt(mDeck.count++,col.setHex(0xa7a399));
  for(let k=1;k<Math.floor(hl/70);k++){const f=k*70/hl;pier(r.p0[0]+dx*f,r.p0[1]+dz*f,r.y0+dy*f-1.25,false);}}
 /* ---- the wall: 40 m courses on the ground, a tower every 160 m, the two gates */
 const W=R.wall,wdx=W.p1[0]-W.p0[0],wdz=W.p1[1]-W.p0[1],wl=Math.hypot(wdx,wdz),wyaw=Math.atan2(wdx,wdz),nc=Math.ceil(wl/40);
 const mWall=inst(box,lam(0x8d8572),nc+Math.ceil(wl/160)+4,'ruin wall');HOOK_RUIN_DRAW.wall=[];
 for(let k=0;k<nc;k++){const f0=k/nc,f1=(k+1)/nc,x0=W.p0[0]+wdx*f0,z0=W.p0[1]+wdz*f0,x1=W.p0[0]+wdx*f1,z1=W.p0[1]+wdz*f1,mx=(x0+x1)/2,mz=(z0+z1)/2;
  const base=Math.min(seat(mx,mz,8,wl/nc,wyaw),meshMin(x0,z0),meshMin(x1,z1))-FOUND,top=Math.max(terrainH(x0,z0),terrainH(x1,z1),0)+W.h;
  q.setFromAxisAngle(Y,wyaw);mWall.setMatrixAt(mWall.count,mat4(mx,base,mz,q,8,top-base,wl/nc+.5));mWall.setColorAt(mWall.count++,col.setHex(0x8d8572));HOOK_RUIN_DRAW.wall.push({x:mx,z:mz,base,top});}
 for(let k=1;k<Math.floor(wl/160);k++){const f=k*160/wl,x=W.p0[0]+wdx*f,z=W.p0[1]+wdz*f,base=seat(x,z,14,14,wyaw)-FOUND,top=Math.max(terrainH(x,z),0)+W.h+6;
  q.setFromAxisAngle(Y,wyaw);mWall.setMatrixAt(mWall.count,mat4(x,base,z,q,14,top-base,14));mWall.setColorAt(mWall.count++,col.setHex(0x857d6b));}
 for(const g of R.gates){const base=seat(g.x,g.z,30,20,wyaw)-FOUND,top=Math.max(terrainH(g.x,g.z),0)+16;
  q.setFromAxisAngle(Y,wyaw);mWall.setMatrixAt(mWall.count,mat4(g.x,base,g.z,q,30,top-base,20));mWall.setColorAt(mWall.count++,col.setHex(0x6f6758));}
 for(const m of [mBox,mCyl,mHeap,mFound,mPod,mDeck,mPier,mWall]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();}
 HOOK_RUIN_DRAW.group=group;
 HOOK_RUIN_DRAW.stats={towers:mBox.count+mCyl.count,round:mCyl.count,heaps:mHeap.count,foundations:mFound.count,pods:mPod.count,decks:mDeck.count,piers:mPier.count,wall:mWall.count,
  calls:group.children.length};
 window._ruinDraw={ready:true,stats:HOOK_RUIN_DRAW.stats,towers:HOOK_RUIN_DRAW.towers,piers:HOOK_RUIN_DRAW.piers,heaps:HOOK_RUIN_DRAW.heaps,wall:HOOK_RUIN_DRAW.wall,
  records:{towers:R.towers.length,heaps:R.heaps.length,pods:R.pods.length,spans:R.spans.length}};})();
