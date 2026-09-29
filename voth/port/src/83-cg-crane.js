// ================================================================ CARGO (cg): kit, shared helpers, the gantry crane, SEGMENT cgCrane
// The cargo area: three segments in three fragments sharing the prefix `cg`
// and the seed block 20200-20299 - cgBox (20210, container dock), cgCrane
// (20220, this file), cgStore (20200, warehouses and silos). This file also
// holds what the three share and what other agents may call:
//   cgGantryCrane(G,x,z,d,o) -> info    a ship-to-shore container crane
//   cgContainerTower(G,x,y,z,yaw,d,o)   a reclaimed stacked-container tower
//   cgBarge(G,x,z,L,B,d,o)              a small feeder / container barge
// Signatures and options are documented at each function and in
// voth/port/notes/cargo.md.
const CG={RED:new THREE.Color(0xff3522),FLOOD:new THREE.Color(0xfff1d6),ROPE:new THREE.Color(0x2e2a26),
 TIMBER:new THREE.Color(0x8a6a4a),HULL:new THREE.Color(0x2d3f55)};
MAT.cgBlue=new THREE.MeshStandardMaterial({color:0x35597e,roughness:.5,metalness:.35});         // crane trim, spreader, trolley
MAT.cgHull=new THREE.MeshStandardMaterial({color:0x2c3c50,roughness:.62,metalness:.3});         // barge hull
MAT.cgDeck=new THREE.MeshStandardMaterial({color:0x6a5f55,roughness:.95,metalness:.12});        // steel deck plate

// ---------------------------------------------------------------- small geometry helpers
// A world-UV box from a to b (its long axis), cross-section w x dp.
function cgBarGeo(a,b,w,dp,tile){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||.01;
 const g=boxUV(w,L,dp===undefined?w:dp,tile||8);
 g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(_UP,new THREE.Vector3(dx/L,dy/L,dz/L))));   // r128: no applyQuaternion
 g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);return g;}
function cgBar(P,mat,a,b,w,dp){pbAdd(cgBarGeo(a,b,w,dp),mat,P);}
function cgBx(P,mat,x,y,z,w,h,dp,yaw){pbBox(P,mat,x,y,z,w,h,dp,yaw||0,8);}
// kput through a group nested anywhere under the builder group G (useGroupXF
// only knows one level). Close with endGroupXF().
function cgMatOf(o,G){const m=new THREE.Matrix4(),q=new THREE.Quaternion(),ch=[];
 for(let p=o;p&&p!==G;p=p.parent){p.updateMatrix();ch.push(p);}
 for(let i=ch.length-1;i>=0;i--){m.multiply(ch[i].matrix);q.multiply(ch[i].quaternion);}return {m,q};}
function cgXF(o,G){KXF=cgMatOf(o,G);}
function cgPt(M,p){const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(M.m||M);return [v.x,v.y,v.z];}
// ExtrudeGeometry UVs are in metres; the kit's textures want ~8 m a tile.
function cgUV(g,s){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*s,uv.getY(i)*s);return g;}

// ---------------------------------------------------------------- kit items
// crane bogie: equaliser beam with four wheels, bottom centre on the rail, along x
kdef('cgBogie',pkMergeGeo([new THREE.BoxGeometry(9,1.1,1.5).translate(0,1.35,0),new THREE.BoxGeometry(8.4,.5,.9).translate(0,.7,0),
 ...[-3.3,-1.1,1.1,3.3].map(x=>new THREE.CylinderGeometry(.44,.44,.5,10).rotateX(Math.PI/2).translate(x,.44,0))]),MAT.pkIron);
// heavy crane rail, 20 m along x
kdef('cgRail',new THREE.BoxGeometry(20,.18,.16).translate(0,.09,0),MAT.pkSteel);
// 32 m yard light mast with a crown of floods; glow separate (it is unlit)
kdef('cgMast',pkMergeGeo([new THREE.CylinderGeometry(.26,.5,32,8).translate(0,16,0),new THREE.CylinderGeometry(.7,.7,.4,8).translate(0,.2,0),
 new THREE.BoxGeometry(3.4,.3,3.4).translate(0,32.1,0),...[[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].map(a=>new THREE.BoxGeometry(.9,.5,.9).translate(a[0],31.7,a[1]))]),MAT.pkPaint);
kdef('cgMastGlow',new THREE.BoxGeometry(3.2,.08,3.2).translate(0,31.42,0),MAT.pkGlow);
// lattice tower section, 1.2 m square, 10 m tall, bottom centre
kdef('cgLattice',pkMergeGeo((()=>{const a=[],w=.6;for(const c of [[-w,-w],[w,-w],[w,w],[-w,w]])a.push(new THREE.BoxGeometry(.09,10,.09).translate(c[0],5,c[1]));
 for(let y=0;y<10;y+=2.5){for(let k=0;k<4;k++){const c0=[[-w,-w],[w,-w],[w,w],[-w,w]][k],c1=[[-w,-w],[w,-w],[w,w],[-w,w]][(k+1)%4];
   a.push(cgBarGeo([c0[0],y,c0[1]],[c1[0],y+2.5,c1[1]],.06,.06,4));a.push(cgBarGeo([c0[0],y,c0[1]],[c1[0],y,c1[1]],.07,.07,4));}}
 return a;})()),MAT.pkSteel);
kdef('cgSphere',new THREE.SphereGeometry(1,14,10),MAT.pkPaint);
// small wind turbine: hub at the origin, rotor in the xy plane facing +z
kdef('cgTurbine',pkMergeGeo([new THREE.BoxGeometry(.6,.6,1.8).translate(0,0,-.6),new THREE.BoxGeometry(.06,1.1,.7).translate(0,.3,-1.7),
 ...[0,1,2].map(k=>new THREE.BoxGeometry(.3,3.4,.06).translate(0,1.9,.3).rotateZ(k*TAU/3+.3))]),MAT.pkPaint);
// yard tractor with a trailer chassis, 14 m along x, cab at -x; tyres separate
kdef('cgTractor',pkMergeGeo([new THREE.BoxGeometry(2.4,2.1,2.4).translate(-5.6,2.0,0),new THREE.BoxGeometry(3.4,.6,2.4).translate(-5.3,1.0,0),
 new THREE.BoxGeometry(12.2,.3,2.3).translate(.6,1.35,0),new THREE.BoxGeometry(.3,1.4,2.2).translate(-3.9,2.1,0)]),MAT.pkPaint);
kdef('cgTyres',pkMergeGeo([-5.8,-3.6,3.8,5.4].map(x=>new THREE.CylinderGeometry(.5,.5,2.5,8).rotateX(Math.PI/2).translate(x,.5,0))),MAT.pkRubber);

// ================================================================ THE GANTRY CRANE
// cgGantryCrane(G, x, z, d, o) -> info
// A ship-to-shore container gantry crane in the Ancient manner: white
// panelled box-section steel (rust at d>0), blue trim, a cyan light line
// along the girders at d=0. G is the builder group (the batch and the kit
// follow the builder's KOFF as usual); (x, z) is the centre of the crane's
// WATERSIDE rail in G's local frame. Crane frame: X along the rails, Z
// toward the boom (+z of G at yaw 0), Y up from o.y.
// o (all optional):
//   y        deck height the bogies stand on        (PORT.DECK)
//   yaw      turn about y; 0 puts the boom toward +z (0)
//   gauge    rail gauge, landside rail at Z=-gauge  (30)
//   span     leg spacing along the rail             (17; bogies reach span/2+4.5)
//   portal   portal beam height above o.y           (40)
//   out      boom outreach from the waterside rail  (50)
//   back     backreach behind the landside rail     (18)
//   raise    boom raise, 0 down .. 1 parked up (~77 deg)   (0)
//   lean     tip about the waterside rail, radians, + = seaward (0)
//            (.95 pitches the whole crane into the harbour, boom in the water)
//   roll     tip about Z, radians (0)
//   broken   landside legs torn off: they hang short from the portal (false)
//   snapped  the boom broken at its hinge, lying from the quay edge down
//            into the water; the forestays hang loose (false)
//   trolley  trolley position along the boom 0..1 (.35; parked when raised)
//   hoistY   spreader height (crane frame); default half-way down
//   load     a container under the spreader (true)
//   lit      floods and the aviation light on (d!==1)
//   name     REGISTER name ('Container crane'); noReg skips registration
// Budget: about 3 500 triangles standing (merged per material: ~6 meshes).
// Returns {H, Bm, S, gauge, Hp, Hb, top, apex:[x,y,z], hinge, boomTip, M, MB}
// where H is the crane group (child of G), Bm the boom group (child of H),
// and M / MB their frames relative to G (for cgPt, or cgXF(info.H,G) to kput
// in the crane frame - the reclaimed village in cgCrane does that).
function cgGantryCrane(G,x,z,d,o){
 o=Object.assign({y:PORT.DECK,yaw:0,gauge:30,span:17,portal:40,out:50,back:18,raise:0,lean:0,roll:0,broken:false,snapped:false,
  trolley:.35,hoistY:null,load:true,lit:d!==1,name:'Container crane',noReg:false},o||{});
 const ruin=d>0,mat=ruin?MAT.rust:MAT.white,acc=ruin?MAT.rust:MAT.cgBlue,rc=ruin?PK_RUST:null;
 const S=o.span,Gg=o.gauge,Hp=o.portal,gd=3.4,Hb=Hp+2.4,gw=4.2,Zb=-Gg-o.back,Zh=1.5,yg=Hb+gd/2,Lb=o.out-Zh;
 const lose=p=>d===1&&rng()<p;
 const H=new THREE.Group();H.rotation.order='YXZ';H.position.set(x,o.y,z);H.rotation.set(o.lean,o.yaw,o.roll);G.add(H);
 cgXF(H,G);
 // ---- gantry: bogies, legs, sill beams, portal beams, braces
 for(const sz of [0,-Gg])for(const sx of [-S/2,S/2]){
  const torn=o.broken&&sz===-Gg;
  if(!torn)kput('cgBogie',[sx,0,sz],null,1,rc);
  cgBar(H,mat,[sx,torn?Hp*rr(.42,.6):1.9,sz],[sx,Hp,sz],2.2,2.2);
  if(!torn)cgBx(H,acc,sx,2.4,sz,3,1.2,2.6);}                                 // leg shoe
 for(const sz of [0,-Gg]){
  if(!(o.broken&&sz===-Gg))cgBx(H,acc,0,1.9,sz,S+2.6,1.1,1.4);               // sill beam along the rail
  cgBx(H,mat,0,Hp+1.2,sz,S+2.4,2.4,2.4);                                     // portal beam
  if(!lose(.25))cgBx(H,mat,0,Hp*.46,sz,S-2.2,1.3,1.3);                       // mid tie
  if(!lose(.3))cgBar(H,mat,[-S/2+1.1,Hp*.46+.6,sz],[S/2-1.1,Hp-.3,sz],.8,.8);
  if(!lose(.3))cgBar(H,mat,[S/2-1.1,Hp*.46+.6,sz],[-S/2+1.1,Hp-.3,sz],.8,.8);}
 for(const sx of [-S/2,S/2]){
  cgBx(H,mat,sx,Hp+1.2,-Gg/2,2.4,2.4,Gg-2.2);                                 // portal girder along Z
  if(!lose(.3))cgBar(H,mat,[sx,Hp-10,0],[sx,Hp+.2,-9],1.1,1.1);
  if(!lose(.3))cgBar(H,mat,[sx,Hp-10,-Gg],[sx,Hp+.2,-Gg+9],1.1,1.1);}
 // stair and lift tower on the landside east leg, ladder on the waterside west leg
 if(!o.broken){cgBx(H,mat,S/2+2.5,Hp/2+1,-Gg,2.6,Hp-2,2.6);
  for(let y=10;y<Hp;y+=10)cgBx(H,acc,S/2+2.5,y,-Gg+1.9,2.6,.25,1.4);}
 kput('pkLadder',[-S/2-1.25,Hp,0],qEuler(0,-Math.PI/2,0),[1,(Hp-2)/10,1],rc);
 // ---- fixed girders from the backreach to the hinge, machinery house
 const Lg=Zh-Zb,zc=(Zh+Zb)/2;
 for(const s of [-1,1]){cgBx(H,mat,s*gw,yg,zc,2,gd,Lg);
  if(d===0)kput('strip',[s*(gw+1.02),yg+.5,zc],qEuler(0,Math.PI/2,0),[Lg-2,1,1],CYAN);}
 for(let zz=Zb+2;zz<Zh;zz+=7)if(!lose(.2))cgBx(H,mat,0,Hb+gd-.35,zz,2*gw-2,.7,.9);
 for(const s of [-1,1])for(let zz=Zb+2.5;zz<Zh-2;zz+=5)if(!lose(.35))kput('pkGuard',[s*(gw+.75),Hb+gd,zz],qEuler(0,Math.PI/2,0),1,rc);
 const mhZ=Zb+6.5,mhY=Hb+gd;
 cgBx(H,mat,0,mhY+3.3,mhZ,2*gw+3.4,6.6,12);cgBx(H,acc,0,mhY+6.85,mhZ,2*gw+3.9,.5,12.6);
 for(const s of [-1,1])for(let k=0;k<4;k++)kput(d>=3&&rng()<.6?'dot':'cellD',[s*(gw+1.72),mhY+4.2,mhZ-4.5+k*3],qEuler(0,Math.PI/2,0),d>=3?[1.2,1,.3]:[1.6,1,.3],d>=3?WARM:null);
 // ---- the A-frame (apex over the landside part of the portal)
 const Za=-Gg*.42,Ya=Hb+gd+24,aw=2.8,top=Ya+1.3;
 for(const s of [-1,1]){const f0=[s*gw,Hb+gd,Zh-.6],f1=[s*aw,Ya,Za+1],b0=[s*gw,Hb+gd,-Gg+1],b1=[s*aw,Ya,Za-1];
  cgBar(H,mat,f0,f1,1.5,1.5);cgBar(H,mat,b0,b1,1.5,1.5);
  const m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
  if(!lose(.4))cgBar(H,mat,m(f0,f1,.45),m(b0,b1,.45),.7,.7);}
 cgBx(H,mat,0,Ya+.6,Za,2*aw+1.6,1.4,2.8);
 if(o.lit)kput('dot',[0,top+.2,Za],null,[.5,.5,.5],d===0?CG.RED:WARM);
 // ---- the boom
 const Bm=new THREE.Group();H.add(Bm);let bAng;
 if(o.snapped){
  // broken at the hinge: the root lies on the deck at the quay edge, the tip in the water
  const c=Math.cos(o.yaw),sn=Math.sin(o.yaw),tz=Zh+Lb*.9,wx=x+tz*sn,wz=z+tz*c;
  const gyT=portH(wx,wz)-o.y+1.4;
  bAng=Math.asin(clamp((1.3-gyT)/Lb,.05,.9));
  Bm.position.set(rr(-1.5,1.5),1.3,Zh+1);Bm.rotation.set(bAng,rr(-.08,.08),rr(-.1,.1));}
 else{bAng=-o.raise*1.35;Bm.position.set(0,yg,Zh);Bm.rotation.x=bAng;}
 cgXF(Bm,G);
 const segs=[[0,.4,gd],[.4,.75,gd*.8],[.75,1,gd*.58]];
 for(const s of [-1,1]){for(const [a,b,hh] of segs)cgBx(Bm,mat,s*gw,gd/2-hh/2,(a+b)/2*Lb,2,hh,(b-a)*Lb+.06);
  if(d===0)kput('strip',[s*(gw+1.02),gd/2-.9,Lb/2],qEuler(0,Math.PI/2,0),[Lb-3,1,1],CYAN);}
 for(let zz=2;zz<Lb;zz+=6)if(!lose(.25))cgBx(Bm,mat,0,gd/2-.35,zz,2*gw-2,.7,.8);
 for(let zz=3;zz<Lb-4;zz+=9)if(!lose(.4))cgBar(Bm,mat,[-gw+1,gd/2-.6,zz],[gw-1,gd/2-.6,zz+9],.35,.35);
 cgBx(Bm,acc,0,gd/2-.9,Lb+.2,2*gw+2.2,1.8,1.2);                               // boom tip head
 for(const s of [-1,1])for(let zz=2.5;zz<Lb-2;zz+=5)if(!lose(.4))kput('pkGuard',[s*(gw+.75),gd/2,zz],qEuler(0,Math.PI/2,0),1,rc);
 if(o.lit)for(let zz=6;zz<Lb;zz+=10)kput('dot',[0,-gd/2-.25,zz],null,[1.2,.3,1.2],d===0?CG.FLOOD:WARM);
 // ---- stays: fore to the boom, back to the backreach
 const MB=cgMatOf(Bm,H);
 for(const s of [-1,1]){const ap=[s*aw,Ya,Za];
  if(o.snapped){for(let k=0;k<2;k++)cgBar(H,mat,ap,[s*aw+rr(-2,2),Ya-rr(12,24),Za+rr(3,10)],.3,.3);}
  else for(const t of [.5,.97]){cgBar(H,mat,ap,cgPt(MB,[s*gw,gd/2,Lb*t]),.34,.34);}
  cgBar(H,mat,ap,[s*gw,Hb+gd,Zb+1],.4,.4);}
 // ---- trolley, operator's cab, hoist ropes, spreader
 cgXF(H,G);
 const parked=o.snapped||o.raise>.15;
 const Zt=parked?-Gg*.62:Zh+4+(Lb-10)*o.trolley;
 cgBx(H,acc,0,Hb+gd+1.3,Zt,2*gw+1.2,2.6,7);
 cgBx(H,mat,-2.2,Hb-2.1,Zt+.6,3,3.2,4);
 kput(d===0?'pane':'paneD',[-2.2,Hb-1.9,Zt+2.66],null,[2.6,2.4,1],null);
 if(!(d===1&&o.snapped)){
  const ys=o.hoistY!=null?o.hoistY:Hb*.5;
  for(const a of [[-1.7,-1],[1.7,-1],[-1.7,1],[1.7,1]])cgBar(H,MAT.pkIron,[a[0],Hb,Zt+a[1]],[a[0]*1.6,ys+.7,Zt+a[1]],.07,.07);
  cgBx(H,acc,0,ys+.35,Zt,12.4,.7,2.5);
  if(o.load)portContainer(0,ys-2.6,Zt,0,true,d,null,null);}
 // ---- ruin dressing on the legs
 if(d>=1)for(const sz of [0,-Gg])for(const sx of [-S/2,S/2]){
  kput('stain',[sx,Hp*.62,sz+1.13],null,[1.8,rr(8,22),1],null);
  if(!o.lean&&!(o.broken&&sz===-Gg)&&rng()<.7){const L=rr(5,d===1?16:8);kput('vine',[sx+rr(-.6,.6),L,sz+1.2],null,[rr(.8,1.4),L,rr(.8,1.4)],null);}}
 endGroupXF();
 // ---- registration: a few circles over the real members (the probe samples vertices)
 const M=cgMatOf(H,G);
 const reg=(nm,p,r,hh)=>{const c=cgPt(M,p);REGISTER({name:o.name+' — '+nm,x:c[0],z:c[2],r,h:2*hh,y:c[1]-hh});};
 if(!o.noReg){
  reg('gantry',[0,Hp*.5,-7],10,Hp*.5+3);reg('gantry',[0,Hp*.5,-Gg+7],10,Hp*.5+3);
  reg('machinery house',[0,mhY+3.3,mhZ],8,5);reg('A-frame',[0,(Hb+Ya)/2,Za],6,(Ya-Hb)/2+2);
  const BM=cgMatOf(Bm,G);
  for(const t of [.25,.6,.9]){const c=cgPt(BM,[0,0,Lb*t]);const hh=Math.abs(Math.sin(bAng))*Lb*.18+4;
   REGISTER({name:o.name+' — boom',x:c[0],z:c[2],r:Math.max(5,Math.abs(Math.cos(bAng))*Lb*.18+2),h:2*hh,y:c[1]-hh});}}
 return {H,Bm,S,gauge:Gg,Hp,Hb,gd,gw,top,apex:[0,Ya,Za],Zb,Zh,Lb,M,MB:cgMatOf(Bm,G),boomTip:cgPt(cgMatOf(Bm,G),[0,0,Lb])};}

// ================================================================ THE CONTAINER TOWER (reclaimed)
// cgContainerTower(G, x,y,z, yaw, d, o) -> {h, top:[x,y,z]}
// The stacked-container house of the references: a steel frame of four
// posts, a plank floor per level with containers set on it askew (a 40' along
// the bay, often a 20' across the other half), balconies with rails, an
// outside stair zig-zagging up, lit windows and doors, and on top one of a
// lattice mast with a water sphere, a big dish, a solar rack or a wind
// turbine. o = {levels (3-6), lit (.5), top ('mast'|'dish'|'solar'|'turbine')}.
// Kit only (no batch), so it works inside cgXF too; REGISTERs itself unless
// o.noReg (G is not used otherwise).
function cgContainerTower(G,x,y,z,yaw,d,o){o=Object.assign({levels:3+((rng()*4)|0),lit:.5,top:null,noReg:false},o||{});
 const c=Math.cos(yaw),s=Math.sin(yaw),L=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c],q0=qEuler(0,yaw,0),qb=qEuler(0,yaw+Math.PI,0);
 const nl=o.levels,lv=2.95,Ht=nl*lv;
 for(const a of [[-6.7,-4.1],[6.7,-4.1],[-6.7,4.1],[6.7,4.1]]){const p=L(a[0],a[1]);kput('postR',[p[0],y+Ht/2+.6,p[1]],null,[.13,Ht+1.2,.13],null);}
 let yy=y;
 for(let l=0;l<nl;l++){
  let p=L(0,0);if(l>0)kput('plank',[p[0],yy+.1,p[1]],q0,[14,.2,8.6],CG.TIMBER);
  const zo=rr(-1.7,-1.1),big=rng()<.8,lc=big?12.19:6.06,xo=big?rr(-.5,.5):rr(-3.4,-2.6);
  const col=PK_CONT_COL[(rng()*PK_CONT_COL.length)|0].clone().lerp(PK_RUST,rr(.15,.45));
  p=L(xo,zo);kput(big?'pkCont40R':'pkCont20R',[p[0],yy+.2,p[1]],qEuler(0,yaw+rr(-.035,.035),0),1,col);
  const nw=big?3:1;for(let k=0;k<nw;k++){const u=xo+(k-(nw-1)/2)*(lc/(nw+.4));
   if(k===0&&big){p=L(u,zo-1.24);kput('pkDoor',[p[0],yy+1.25,p[1]],qb,[.95,2.05,1],new THREE.Color().setHSL(rr(0,1),.35,.35));continue;}
   p=L(u,zo-1.24);const lit=rng()<o.lit;kput(lit?'dot':'cellD',[p[0],yy+1.6,p[1]],qb,lit?[.9,1.1,.3]:[1.2,.9,.25],lit?WARM:null);
   p=L(u,zo+1.24);kput(rng()<o.lit?'dot':'cellD',[p[0],yy+1.6,p[1]],q0,[1.2,.9,.25],WARM);}
  if(rng()<.6){const col2=PK_CONT_COL[(rng()*PK_CONT_COL.length)|0].clone().lerp(PK_RUST,rr(.2,.5));
   p=L(rr(2,3.6),2.4);kput('pkCont20R',[p[0],yy+.2,p[1]],qEuler(0,yaw+Math.PI/2+rr(-.05,.05),0),1,col2);
   p=L(rr(2,3.6)-1.25,2.4);kput(rng()<o.lit?'dot':'cellD',[p[0],yy+1.6,p[1]],qEuler(0,yaw-Math.PI/2,0),[1,1,.3],WARM);}
  else{p=L(0,2.6);kput('planter',[p[0],yy+.45,p[1]],q0,[8,.5,1.2],null);
   for(let k=0;k<3;k++){p=L(rr(-3.5,3.5),2.6);kput('leafCard',[p[0],yy+1.1,p[1]],qEuler(0,rng()*TAU,0),[rr(.6,1),.6,rr(.6,1)],new THREE.Color().setHSL(rr(.22,.32),.45,rr(.38,.55)));}}
  // balcony rails on the open long side and the ends
  if(l>0){for(const u of [-4.6,0,4.6]){p=L(u,4.25);kput('pkGuard',[p[0],yy+.2,p[1]],q0,[.92,1,1],null);}
   for(const e of [-1,1]){p=L(e*6.95,1.6);kput('pkGuard',[p[0],yy+.2,p[1]],qEuler(0,yaw+Math.PI/2,0),[.9,1,1],null);}}
  // the outside stair up to the next floor, alternating direction
  const dir=l%2?-1:1;p=L(-7.6,-dir*1.4);kput('pkStair',[p[0],yy+.2,p[1]],qEuler(0,yaw+(dir>0?0:Math.PI),0),[1.1,lv/2,1.2],null);
  if(rng()<.35){const a=L(-6.6,3.9),b=L(6.6,3.9);portWashLine(a[0],a[1],b[0],b[1],yy+2.5,6);}
  yy+=lv;}
 // roof: a floor of planks, then the top piece
 let p=L(0,0);kput('plank',[p[0],yy+.1,p[1]],q0,[14,.2,8.6],CG.TIMBER);yy+=.2;
 const T=o.top||['mast','dish','solar','turbine'][(rng()*4)|0];let th=2;
 if(T==='mast'){p=L(3.5,1.5);kput('cgLattice',[p[0],yy,p[1]],q0,[1,1.1,1],new THREE.Color(0x5a8a6a));kput('cgSphere',[p[0],yy+13.4,p[1]],null,2.6,new THREE.Color(0xe8e4dc));
  kput('dot',[p[0],yy+16.1,p[1]],null,[.4,.4,.4],CG.RED);th=16;}
 else if(T==='dish'){p=L(2,.5);kput('pkDish',[p[0],yy,p[1]],qEuler(0,yaw+rr(-1,1),0),3.2,null);th=6;}
 else if(T==='solar'){for(let k=0;k<6;k++){p=L(-5+k*2,-.5);kput('pkSolar',[p[0],yy+1.2,p[1]],qEuler(0,yaw,0).multiply(qEuler(-.5,0,0)),[1.8,1,1.4],null);
   kput('postR',[p[0],yy+.55,p[1]],null,[.06,1.1,.06],null);}th=2.5;}
 else{p=L(4.5,2);kput('pkCol',[p[0],yy,p[1]],null,[.15,7,.15],new THREE.Color(0x8a8078));kput('cgTurbine',[p[0],yy+7.2,p[1]],qEuler(0,rng()*TAU,0),1,null);th=10;}
 p=L(-4,1.5);kput('waterButt',[p[0],yy+.9,p[1]],null,[.9,1.8,.9],null);
 if(!o.noReg)REGISTER({name:'Container tower',x,z,r:8.5,h:yy-y+th,y});
 return {h:yy-y,top:[x,yy,z]};}

// ================================================================ THE FEEDER BARGE
// cgBarge(G, x,z, L,B, d, o) -> {Bg}
// A small container barge (hull length L along x, beam B), midship at (x,z)
// on the waterline, bow toward +x: raked bow, square stern, a white
// deckhouse aft, containers stowed fore-and-aft in bays. Its own geometry,
// not a registered vessel - the berths show one when no registered vessel
// fits. d=0 loaded; d=1 (o.sunk) sunk by the stern onto the silted berth,
// listing, rusted, containers spilled; d>=3 (o.houses) a house barge:
// container houses and gardens on deck, washing lines, skiffs alongside.
// o = {draft 4, free 3, yaw 0, sunk (d===1), houses (d>=3), bulk (false: hatch
// covers instead of containers - a bulk barge)}.
function cgBarge(G,x,z,L,B,d,o){o=Object.assign({draft:4,free:3,yaw:0,sunk:d===1,houses:d>=3,bulk:false},o||{});
 const ruin=d>0,Bg=new THREE.Group();Bg.rotation.order='YXZ';G.add(Bg);
 if(o.sunk){Bg.position.set(x,-o.free-1.6,z);Bg.rotation.set(rr(.08,.14),o.yaw+rr(-.06,.06),rr(-.05,-.025));}
 else{Bg.position.set(x,0,z);Bg.rotation.set(0,o.yaw,0);}
 const sh=new THREE.Shape(),hb=B/2;
 sh.moveTo(-L/2,-hb);sh.lineTo(L/2-14,-hb);sh.quadraticCurveTo(L/2-3,-hb,L/2,-hb*.25);sh.lineTo(L/2,hb*.25);sh.quadraticCurveTo(L/2-3,hb,L/2-14,hb);sh.lineTo(-L/2,hb);sh.lineTo(-L/2,-hb);
 const Ht=o.draft+o.free;
 const hull=cgUV(new THREE.ExtrudeGeometry(sh,{depth:Ht,bevelEnabled:false,curveSegments:6}),1/8);
 hull.rotateX(-Math.PI/2);hull.translate(0,-o.draft,0);
 // ExtrudeGeometry rotated -90 about x: shape y -> -z, extrusion -> +y. Mirror nothing; the outline is symmetric.
 pbAdd(hull,ruin?MAT.rust:MAT.cgHull,Bg,true);
 const dk=cgUV(new THREE.ShapeGeometry(sh,6),1/8);dk.rotateX(-Math.PI/2);dk.translate(0,o.free+.03,0);pbAdd(dk,MAT.cgDeck,Bg);
 pbBox(Bg,ruin?MAT.rust:MAT.white,0,o.free-.4,-hb-.06,L-18,.8,.12,0,8,true);pbBox(Bg,ruin?MAT.rust:MAT.white,0,o.free-.4,hb+.06,L-18,.8,.12,0,8,true);   // sheer stripe
 // deckhouse aft: two storeys and a bridge with wings, a funnel
 const hx=-L/2+6,Y=o.free;
 cgBx(Bg,ruin?MAT.rust:MAT.white,hx,Y+3,0,8,6,B-5);cgBx(Bg,ruin?MAT.rust:MAT.white,hx+.5,Y+7.3,0,6.5,2.6,B+1);
 kput(d===0?'pane':'paneD',[hx+3.8,Y+7.5,0],qEuler(0,Math.PI/2,0),[B-1,1.2,1],null);
 for(const s of [-1,1])for(let k=0;k<3;k++)kput(d>=3?'dot':'cellD',[hx-2.5+k*2.5,Y+4,s*(B/2-2.45)],null,[1.1,.9,.3],d>=3?WARM:null);
 cgBx(Bg,ruin?MAT.rust:MAT.cgBlue,hx-2.5,Y+10,0,2.4,3.4,2.4);
 kput('pkCol',[hx+1,Y+8.6,0],null,[.12,5,.12],null);
 if(d===0){kput('dot',[hx+1,Y+13.7,0],null,[.4,.4,.4],CG.FLOOD);kput('dot',[L/2-1.5,Y+2,0],null,[.4,.4,.4],CG.RED);}
 cgXF(Bg,G);
 if(!o.houses&&o.bulk){
  for(let bx=hx+9;bx<L/2-15;bx+=11.5)if(!(o.sunk&&rng()<.4))cgBx(Bg,ruin?MAT.rust:MAT.cgBlue,bx,Y+.7,0,10.6,1.4,B-4.5);
  cgBx(Bg,ruin?MAT.rust:MAT.white,L/2-8,Y+1,0,6,2,B*.6);}
 else if(!o.houses){
  // cargo: bays of 40' boxes fore-and-aft, rows across, 1-3 tiers (fewer when sunk: spilled)
  const nR=Math.max(1,Math.floor((B-2)/2.5));
  for(let bx=hx+8;bx<L/2-15;bx+=12.6)for(let r=0;r<nR;r++){const zr=(r-(nR-1)/2)*2.5;
   const nt=o.sunk?(rng()<.5?1:0):1+((rng()*3)|0);
   for(let t=0;t<nt;t++)portContainer(bx,Y+.05+t*2.6,zr,0,true,d,null,o.sunk&&rng()<.4?[rr(-.1,.1),rr(-.2,.2)]:null);}
  // bow: a small forecastle
  cgBx(Bg,ruin?MAT.rust:MAT.white,L/2-8,Y+1,0,6,2,B*.6);}
 else{
  for(let bx=hx+10,i=0;bx<L/2-18;bx+=15,i++)portContainerHouse(G,bx,Y,i%2?-B/4:B/4,rr(-.08,.08),d,{levels:1+((rng()*2)|0),noReg:true});
  portGarden(L/2-12,Y,0,8,B*.5,d);
  portWashLine(hx+5,-B/2+1,L/2-16,-B/2+1,Y+3,10);
  portFigures(0,Y,0,8,L*.3);}
 endGroupXF();
 const M=cgMatOf(Bg,G);
 for(const t of [-.33,0,.33]){const c=cgPt(M,[t*L,0,0]);REGISTER({name:o.houses?'House barge':o.sunk?'Sunken feeder barge':'Feeder barge',x:c[0],z:c[2],r:L/6+2,h:Ht+10,y:c[1]-o.draft});}
 return {Bg};}

// ================================================================ SEGMENT: cgCrane (container cranes)
// Three ship-to-shore gantry cranes on quay rails along a straight berth,
// 110 m. Rails 30 m gauge (waterside rail 4 m back from the edge), 50 m
// outreach, 18 m backreach; the middle crane parks its boom raised. A feeder
// barge lies under the working booms. Seeds 20220-20224.
//   d=0 intact   white cranes with cyan light lines, one hoisting, one
//                parked boom-up, one over the landside lanes; yard tractors
//   d=1 ruined   west crane pitched forward into the harbour (landside legs
//                torn from the rail), middle crane's boom snapped off lying
//                in the water, east crane stuck half-raised; barge sunk on
//                the silted berth; containers toppled; weeds
//   d=3 reclaimed west crane a vertical village in its portal (platforms,
//                container houses, stairs, gardens, a turbine at the apex),
//                the snapped boom a walkway down to the boats, houses on the
//                east crane's girders; container towers; a house barge
const CGC={LAND:70,SEA:80,ZW:-4,G:30};
function cgCraneStamps(o){const d=o.d,h=o.W/2,k=o.W/110;
 const s=[{kind:'flat',x0:-h,z0:-CGC.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:CGC.SEA,y:d===1?-8:PORT.BERTH,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-44,34],[-10,28],[30,40],[40,64],[0,72],[-40,66]].map(p=>[p[0]*k,p[1]]),y:-2.2,soft:16,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:CGC.LAND,SEA:CGC.SEA}));}
function buildCgCrane(scene,gx,gz,d,opt){reseed(20220+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,ZW=CGC.ZW,ZL=CGC.ZW-CGC.G;
 portPaving(G,-h,-CGC.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d,{ladders:36,bollards:18});
 portSideClose(G,opt.nb,d,{z0:-CGC.LAND,z1:0});
 // crane rails on their concrete beams, edge to edge (they continue into a flush neighbour)
 for(const rz of [ZW,ZL]){pbBox(G,d>0?MAT.concreteR:MAT.pkConc,0,D+.05,rz,opt.W,.1,1.4,0,8);
  const n=Math.round(opt.W/20);for(let i=0;i<n;i++){const x=-h+(i+.5)*opt.W/n;if(d===1&&rng()<.15)continue;kput('cgRail',[x,D+.1,rz],null,[opt.W/n/20,1,1],d>0?PK_RUST:null);}}
 const XS=[-32,0,32].map(v=>v*opt.W/110);
 // the berth: a registered vessel if one fits, otherwise our own feeder barge
 const vk=portVesselFor(opt,0),V=vk?PORT_REG.vessel[vk]:null;
 let barge=true;
 if(V&&V.length<=opt.W-16&&V.beam<=36){portPlaceVessel(G,vk,0,3+V.beam/2,Math.PI/2,d);barge=false;}
 if(barge)cgBarge(G,-2,14,84,19,d,{});
 const cranes=[];
 if(d===0){
  cranes.push(cgGantryCrane(G,XS[0],ZW,d,{trolley:.18,hoistY:10,name:'Container crane 1'}));
  cranes.push(cgGantryCrane(G,XS[1],ZW,d,{raise:1,name:'Container crane 2'}));
  cranes.push(cgGantryCrane(G,XS[2],ZW,d,{trolley:.3,hoistY:17,name:'Container crane 3'}));}
 else if(d===1){
  cranes.push(cgGantryCrane(G,XS[0],ZW,d,{lean:.95,broken:true,hoistY:-6,name:'Fallen crane'}));
  cranes.push(cgGantryCrane(G,XS[1],ZW,d,{snapped:true,name:'Broken crane'}));
  cranes.push(cgGantryCrane(G,XS[2],ZW,d,{raise:.55,roll:.035,hoistY:14,load:false,name:'Stuck crane'}));
  // the fallen crane's torn landside legs: bogies on the rail, twisted stumps
  for(const sx of [-8.5,8.5]){kput('cgBogie',[XS[0]+sx,D,ZL],qEuler(0,rr(-.1,.1),rr(-.05,.05)),1,PK_RUST);
   cgBar(G,MAT.rust,[XS[0]+sx,D+1.6,ZL],[XS[0]+sx+rr(-2,2),D+rr(6,10),ZL+rr(2,5)],2.2,2.2);}
  portRubble(XS[0],D,ZL+10,7,18);portRubble(XS[1],D,-1,5,12);}
 else{
  cranes.push(cgGantryCrane(G,XS[0],ZW,d,{raise:1,load:false,hoistY:39,name:'Crane village'}));
  cranes.push(cgGantryCrane(G,XS[1],ZW,d,{snapped:true,name:'Boom-walk crane'}));
  cranes.push(cgGantryCrane(G,XS[2],ZW,d,{load:false,hoistY:12,trolley:.1,name:'Girder-house crane'}));
  cgCraneVillage(G,cranes[0],d);cgBoomWalk(G,cranes[1],d);cgGirderHouses(G,cranes[2],d);
  // rope bridge between the west and middle portals
  const za=ZW-15,y0=D+cranes[0].Hp+2.4,xa=XS[0]+9.8,xb=XS[1]-9.8,n=Math.round((xb-xa)/.6);
  for(let i=0;i<=n;i++){const t=i/n;kput('plank',[xa+(xb-xa)*t,y0-3*Math.sin(Math.PI*t),za],null,[.45,.07,2.2],null);}
  for(const sz of [-1.1,1.1])for(let i=0;i<n;i+=3){const t0=i/n,t1=Math.min(1,(i+3)/n);
   beam('plank',[xa+(xb-xa)*t0,y0+1-3*Math.sin(Math.PI*t0),za+sz],[xa+(xb-xa)*t1,y0+1-3*Math.sin(Math.PI*t1),za+sz],.05,.05,CG.ROPE);}
  REGISTER({name:'Rope bridge',x:(xa+xb)/2,z:za,r:6,h:8,y:y0-5});}
 // ---- the apron: lanes under the portals, the back strip beyond the landside rail
 if(d===0){
  for(let i=0;i<4;i++){const x=rr(-h+18,h-18),z=[-10,-16,-22,-28][i];kput('cgTractor',[x,D,z],qEuler(0,rng()<.5?0:Math.PI,0),1,new THREE.Color(rng()<.5?0xe8e4dc:0x35597e));
   kput('cgTyres',[x,D,z],qEuler(0,0,0),1,null);portContainer(x+.6,D+1.5,z,0,true,0);}
  portContainerStack(-30*opt.W/110,D,-50,0,3,2,0,{big:true});portContainerStack(24*opt.W/110,D,-52,0,3,3,0,{big:true});
  REGISTER({name:'Container stack',x:-30*opt.W/110,z:-50,r:8,h:6,y:D});REGISTER({name:'Container stack',x:24*opt.W/110,z:-52,r:8,h:8,y:D});
  portFigures(0,D,-20,12,h-16);portBuoy(-40,60);portBuoy(44,56);}
 for(const x of [-h+14,h-14])if(d!==1||rng()<.5){
  if(d===1)kput('cgMast',[x,D+.4,-56],qEuler(0,rng()*TAU,0).multiply(qEuler(0,0,Math.PI/2-.05)),1,PK_RUST);
  else{kput('cgMast',[x,D,-60],null,1,d>0?new THREE.Color(0xa88a74):null);kput('cgMastGlow',[x,D,-60],null,1,d===0?CYAN:WARM);}}
 if(d===1){
  portContainer(-12,D,-44,.5,true,1,null,[0,.04]);portContainer(-4,D+1.2,-40,1.4,true,1,null,[Math.PI/2*.97,.05]);
  portContainer(20,D,-48,-.3,true,1,null,[.05,-.06]);portContainer(26,D+1.25,-44,.2,false,1,null,[Math.PI/2*.98,.0]);
  portContainer(38,-.8,22,.4,true,1,null,[.25,.4]);portContainer(-24,-1.5,40,1.1,true,1,null,[.3,-.2]);
  for(let i=0;i<3;i++){const x=rr(-h+16,h-16),z=rr(-30,-10);kput('cgTractor',[x,D,z],qEuler(rr(-.04,.04),rng()*TAU,rr(-.05,.05)),1,new THREE.Color(0x7a5a44));}
  portWeeds(-h+5,-CGC.LAND+2,h-5,-3,170,D);portTrees(-h+10,-66,-10,-56,3,D,4,9);portTrees(10,-64,h-10,-40,3,D,5,10);
  kput('pkSkiff',[20,-1.4,58],qEuler(0,.6,Math.PI*.9),1,new THREE.Color(0x6a4a3a));}
 if(d>=3){
  cgContainerTower(G,-16*opt.W/110,D,-54,.08,d,{levels:5,top:'mast'});
  cgContainerTower(G,18*opt.W/110,D,-54,-.1,d,{levels:4,top:'solar'});
  for(let x=-h+14;x<h-14;x+=10)if(Math.abs(x-XS[1])>5)portStall(x+rr(-1.5,1.5),D,-44,Math.PI+rr(-.1,.1));
  portGarden(0,D,-64+4,24,6,d);
  for(const L of wall.ladders){portSkiff(L[0]+rr(-4,4),L[1]+2.6,Math.PI/2+rr(-.15,.15));}
  for(let i=0;i<6;i++)portSkiff(rr(-h+10,h-10),rr(32,70),rng()*TAU);
  portFigures(0,D,-30,26,h-14);portWeeds(-h+5,-CGC.LAND+2,h-5,-3,40,D);}
 KOFF=[0,0,0];return G;}

// ---- reclaimed dressing on a crane (all in the crane's own frame)
// The vertical village: platforms hung between the four legs at 11, 19, 27
// and 35 m, container houses on them, a zig-zag stair up the outside of the
// landside legs, rails, hanging gardens, washing lines, a turbine on the apex.
function cgCraneVillage(G,C,d){const S=C.S,Gg=C.gauge,H=C.H;
 const lv=[[11,-Gg+.5,-Gg+13],[19,-12,-.5],[27,-Gg+.5,-Gg+15],[35,-Gg+4,-3]];
 for(const [y,z0,z1] of lv){cgBx(H,MAT.timber,0,y,(z0+z1)/2,S-1.4,.35,z1-z0);
  cgBx(H,MAT.rust,0,y-.5,z0+.4,S-1,.6,.5);cgBx(H,MAT.rust,0,y-.5,z1-.4,S-1,.6,.5);}
 cgXF(H,G);
 for(const [y,z0,z1] of lv){
  const n=Math.max(1,Math.floor((z1-z0)/7.5));
  for(let i=0;i<n;i++){const zc=z0+(i+.5)*(z1-z0)/n;
   portContainerHouse(G,rr(-1.5,1.5),y+.18,zc,Math.PI/2+rr(-.1,.1),d,{levels:1,big:false,noReg:true});}
  for(const s of [-1,1])for(let zz=z0+2.5;zz<z1-1;zz+=5)kput('pkGuard',[s*(S/2-.9),y+.18,zz],qEuler(0,Math.PI/2,0),1,null);
  for(let k=0;k<4;k++)kput('vine',[rr(-S/2+1,S/2-1),y-.2,rng()<.5?z0+.2:z1-.2],null,[rr(.8,1.3),rr(3,7),rr(.8,1.3)],null);
  kput('planter',[S/2-1.6,y+.5,(z0+z1)/2],null,[1.2,.6,(z1-z0)*.6],null);
  portWashLine(-S/2+1,z0+1,-S/2+1,z1-1,y+2.6,6);
  portFigures(0,y+.18,(z0+z1)/2,2,2);}
 // the stair: flights up the outside of the west landside leg, turning each 2 m
 for(let i=0;i*2<35;i++){const up=i%2===0;kput('pkStair',[-S/2-2.2,i*2,up?-Gg+1.2:-Gg+3.6],qEuler(0,up?0:Math.PI,0),[1.2,1,1],null);
  kput('plank',[-S/2-2.2,i*2+2,up?-Gg+4.2:-Gg+.6],null,[1.4,.12,1.2],CG.TIMBER);}
 // market under the portal, turbine and dish up top, lit machinery house
 for(let k=0;k<3;k++)portStall(rr(-3,3),0,-Gg+6+k*8,Math.PI/2*(k%2?1:-1));
 kput('pkCol',[0,C.apex[1]+1.2,C.apex[2]],null,[.18,7,.18],new THREE.Color(0x8a8078));
 kput('cgTurbine',[0,C.apex[1]+8.4,C.apex[2]],qEuler(0,.4,0),1.4,null);
 kput('pkDish',[2,C.Hb+C.gd+7.1,C.Zb+4],qEuler(0,2.4,0),2,null);
 for(let k=0;k<4;k++)kput('pkSolar',[-2.5+k*1.7,C.Hb+C.gd+.9,-Gg-4],qEuler(-.5,0,0),[1.5,1,1],null);
 endGroupXF();
 const M=C.M;const c=cgPt(M,[0,20,-Gg/2]);REGISTER({name:'Crane village',x:c[0],z:c[2],r:13,h:30,y:c[1]-12});}
// The snapped boom as a walkway: planks along its top, rails, boats tied at its tip.
function cgBoomWalk(G,C,d){cgXF(C.Bm,G);
 for(let zz=1;zz<C.Lb-1;zz+=1.1)kput('plank',[rr(-.1,.1),C.gd/2+.08,zz],qEuler(0,rr(-.04,.04),0),[2.6,.08,.9],CG.TIMBER);
 for(let zz=4;zz<C.Lb-4;zz+=6)kput('pkTyre',[C.gw+1.1,0,zz],qEuler(0,Math.PI/2,0),1,null);
 endGroupXF();
 const t=C.boomTip;for(let i=0;i<4;i++)portSkiff(t[0]+rr(-8,8),t[2]+rr(-10,2),rr(-.4,.4)+Math.PI*(i%2));
 const c=cgPt(C.MB,[0,0,C.Lb*.5]);REGISTER({name:'Boom walkway',x:c[0],z:c[2],r:8,h:14,y:c[1]-7});}
// Houses on the fixed girders behind the A-frame, reached by the lift tower.
function cgGirderHouses(G,C,d){cgXF(C.H,G);const y=C.Hb+C.gd;
 cgBx(C.H,MAT.timber,0,y+.1,-C.gauge+2,2*C.gw+3,.25,14);
 portContainerHouse(G,0,y+.25,-C.gauge-1.5,Math.PI/2+rr(-.06,.06),d,{levels:2,big:false,noReg:true});
 portContainerHouse(G,0,y+.25,-C.gauge+5.5,Math.PI/2+rr(-.06,.06),d,{levels:1,big:false,noReg:true});
 portWashLine(-C.gw-.7,-8,-C.gw-.7,-24,y+2.2,8);
 for(let k=0;k<6;k++)kput('vine',[rr(-8,8),C.Hp,rr(-C.gauge,0)],null,[1,rr(4,10),1],null);
 endGroupXF();
 const c=cgPt(C.M,[0,y+3,-C.gauge]);REGISTER({name:'Girder houses',x:c[0],z:c[2],r:9,h:10,y:c[1]-3});}
PORT_SEG({key:'cgCrane',name:'Container cranes',cls:'seg',W:110,LAND:CGC.LAND,SEA:CGC.SEA,decays:[0,1,3],stamps:cgCraneStamps,build:buildCgCrane});
