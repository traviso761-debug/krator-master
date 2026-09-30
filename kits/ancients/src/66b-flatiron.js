// ================================================================= THE FLATIRON
// A wedge-plan tower: a rounded prow, a broad transom, and the whole thing
// stepped back as it rises. Designed for the Screamers' Hexahedron, where it
// stands on the triangular prow of the lower city's roof, and brought back here
// as an Ancient type in its own right -- it is the plan that falls out of any
// acute corner, which is why it keeps appearing in the Ancients' cities.
//
// The tower is sized from ONE rule: the width grows 0.536 per unit of length,
// which is a 15-degree taper on each side. That is what lets it sit exactly on
// an acute site instead of hanging off both edges of it.
// DECAY 2 TOPPLES IT, like the other towers: it used to shorten the tower to
// 150 m and stand it up again. Now it is the full 250 m tower broken at the
// eighth setback; the stump stands, ragged at the break, and the upper eleven
// storeys lie on the plain on one broad side face, tipped by their own taper so
// the break end and the crown both bear on the ground. Levels 0, 1 and 3 draw
// the PRNG in exactly the order they always did.
function buildFlatiron(scene,gx,gz,d){reseed(9465+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=SHELL(d);
 const L=168,W=L*.536,H=250,NF=18,RF=H/NF,TOPS=.34,ch=.10,KC=d===2?8:NF;
 REGISTER({name:'The Flatiron ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:L*.72,h:(d===2?4+KC*RF:H)+40});
 // the plan: prow forward, transom aft, corners chamfered
 const C=[[L*.60,0],[-L*.40,W*.5],[-L*.40,-W*.5]],P=[];
 for(let i=0;i<3;i++){const A=C[i],B=C[(i+1)%3];
  P.push([lerp(A[0],B[0],ch),lerp(A[1],B[1],ch)]);
  P.push([lerp(A[0],B[0],1-ch),lerp(A[1],B[1],1-ch)]);}
 const pt=(p,s)=>{const n=P.length,q=(p-Math.floor(p))*n,i=Math.floor(q),f=q-i;
  const A=P[i],B=P[(i+1)%n];return[lerp(A[0],B[0],f)*s,lerp(A[1],B[1],f)*s];};
 // outward normal from the outline tangent; the plan is wound CCW so it is
 // (dz,-dx). Radial would be tens of degrees out along the transom.
 const nrm=(p,s)=>{const A=pt(p-.004,s),B=pt(p+.004,s);
  const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1;return[dz/l,-dx/l];};
 const sc=k=>lerp(1,TOPS,Math.pow(k/NF,.95));
 const SH=[],SU=[],big=Math.max(L,W);
 // the break: both faces of it are eaten back, the stump's from above and the
 // fallen body's from below, so neither reads as a clean saw cut
 // THE RUIN (level 1) CHANGES THE SILHOUETTE. It was the intact tower in
 // rust with fbm holes: the same profile, crown and all. It has now lost its
 // top three setbacks and the crown with them, the walls under the break are
 // eaten back hard (holeFn's cut term), and a collapse scar runs down the
 // south (+z) face from 40% of the height, where the row camera sees it.
 const NT=d===1?NF-3:NF,yT=4+NT*RF;
 const yC=4+KC*RF,h0=d===1?skyScarHole(holeFn(d*.7,9466,yT,1.1),.17,.1,yT*.4,yT,9466):holeFn(d*.7,9466,null,1.1);
 const hole=d===2?(u,y)=>{const n=fbm(u*4.95+9466*.31,y*.0308,9466,3),near=clamp(1-Math.abs(y-yC)/40,0,1);return n<.24+.5*near;}:h0;

 // THE FALLEN BODY. U lays it down: turned on its own axis so the +z side
 // face is square to +z, laid over onto that face, tipped by the taper, and
 // yawed. V takes the break height off, so the storeys build at their own y.
 let U=null,V=null,UX=null;
 if(d===2){const s0=sc(KC),s1=sc(NF),LEN=H+4-yC+30;
  const dn=Math.sin(Math.atan(.268))*L*.6;             // axis to side face, in plan, at scale 1
  const eps=Math.atan((dn*s0-dn*s1)/LEN),yaw=rr(-.35,-.05);
  U=new THREE.Group();V=new THREE.Group();U.add(V);G.add(U);V.position.y=-yC;
  const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw)
   .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2+eps))
   .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.atan(.268)));
  U.quaternion.copy(q);const off=big*.38;
  U.position.set(Math.sin(yaw)*off,dn*s0*Math.cos(eps)-1.2,Math.cos(yaw)*off);
  U.updateMatrix();V.updateMatrix();UX={m:U.matrix.clone().multiply(V.matrix),q:U.quaternion.clone()};}
 const inU=k=>d===2&&k>=KC;
 kput(SLABC(d),[0,2,0],null,[big*.60,4,big*.60],null);
 for(let k=0;k<NT;k++){const yy=4+k*RF,s0=sc(k),s1=sc(k+1),A=inU(k)?SU:SH;
  if(inU(k))KXF=UX;
  A.push(gridSurface((u,v)=>{const Q=pt(u,s0);return[Q[0],yy+v*RF,Q[1]];},
   64,2,{uS:24,vS:2,hole:hole?(u,v)=>hole(u,yy+v*RF):null}));
  A.push(gridSurface((u,v)=>{const Q=pt(u,lerp(s0,s1,v));return[Q[0],yy+RF,Q[1]];},
   64,2,{uS:24,vS:2,hole:hole?u=>hole(u,yy+RF):null}));
  // the fallen body's break end: the floor it broke across, eaten through
  if(d===2&&k===KC)A.push(gridSurface((u,v)=>{const Q=pt(u,s0*(1-v));return[Q[0],yy+.3,Q[1]];},64,3,{hole:(u,v)=>fbm(u*7,v*3,9467,2)<.45}));
  const nc=Math.max(6,Math.round(34*s0));
  for(let j=0;j<nc;j++){const p=(j+.5)/nc;
   if(hole&&hole(p,yy+RF))continue;
   const N=nrm(p,s0),qf=qFacing([N[0],0,N[1]]);
   const Q=pt(p,lerp(s0,s1,.30)),hh=rr(3,6.5);
   kput(BOXC(d),[Q[0],yy+RF+hh*.5,Q[1]],qf,[rr(5,9),hh,rr(4,7)],null);
   const R2=pt(p,s0);
   for(let row=0;row<2;row++)
    kput(d===0?'pane':'paneD',[R2[0]+N[0]*.4,yy+RF*(.28+row*.38),R2[1]+N[1]*.4],
     qf,[2.2,2.8,1],null);}
  // a lit gallery every fourth setback, which is what reads at city distance
  if(k%4===2&&d===0)for(let j=0;j<20;j++){const p=(j+.5)/20,Q=pt(p,s0),N=nrm(p,s0);
   kput('strip',[Q[0]+N[0]*.6,yy+RF*.86,Q[1]+N[1]*.6],
    qEuler(0,-Math.atan2(-N[0],N[1]),0),[9,1,1],CYAN);}
  KXF=null;}
 // the stump's break: dark rooms seen down through the eaten roof, and the
 // storey walls standing ragged above it
 if(d===2){const s0=sc(KC);
  SH.push(gridSurface((u,v)=>{const Q=pt(u,s0*.96*(1-v));return[Q[0],yC-RF*.55,Q[1]];},64,2,{}));
  for(let j=0;j<22;j++){const p=(j+.5)/22,Q=pt(p,s0),N=nrm(p,s0),hh=rr(2,RF*.9);if(rng()<.35)continue;
   kput(BOXC(d),[Q[0]-N[0]*.6,yC+hh/2,Q[1]-N[1]*.6],qFacing([N[0],0,N[1]]),[rr(3,8),hh,1.2],null);}}

 // the entrance, on the broad transom end
 {const N=nrm(.5,1),D=pt(.5,1);
  kput('archOpen',[D[0]+N[0]*1.2,9,D[1]+N[1]*1.2],qFacing([N[0],0,N[1]]),[3.6,3.4,3.8],null);
  kput(d>0?'paneD':'pane',[D[0]+N[0]*2.2,8,D[1]+N[1]*2.2],qFacing([N[0],0,N[1]]),[8,14,1],null);
  for(let q=-1;q<=1;q+=2)
   kput(d>0?'colR':'colW',[D[0]-N[1]*q*8+N[0]*2.6,10,D[1]+N[0]*q*8+N[1]*2.6],null,[3,20,3],null);
  for(let j=0;j<4;j++)
   kput(SLABC(d),[D[0]+N[0]*(3.4+j*3.4),1.4-j*.9,D[1]+N[1]*(3.4+j*3.4)],
    qFacing([N[0],0,N[1]]),[20-j*2.2,1.4,8],null);}

 const top=yT;
 if(d===2)KXF=UX;
 if(d!==1){kput(SLABC(d),[0,top+2,0],null,[big*.24,4,big*.24],null);
 {for(let q=0;q<8;q++){const a2=q/8*TAU;if(d===2&&q%3===1)continue;
   kput(d>0?'colR':'colW',[Math.cos(a2)*big*.20,top+12,Math.sin(a2)*big*.20],null,[2.6,d===2&&q%2?rr(8,18):24,2.6],null);}
  if(d!==2)kput(SLABC(d),[0,top+25,0],null,[big*.26,3,big*.26],null);
  if(d===0){kput('finial',[0,top+34,0],null,[4,14,4],null);stripRing(0,top+27,0,big*.20,d,16);}}}
 KXF=null;

 meshMerged(SH,skin,G);
 if(d===2){meshMerged(SU,skin,V);
  // where it lies: rubble along the body
  const off=U.position,dir=new THREE.Vector3(0,1,0).applyQuaternion(U.quaternion);dir.y=0;dir.normalize();
  const LEN=top+30-yC;
  for(let i=0;i<70;i++){const f=rng(),x=off.x+dir.x*LEN*f+rr(-1,1)*34,z=off.z+dir.z*LEN*f+rr(-1,1)*34;
   kput('rubble',[x,rr(.2,1),z],qEuler(rng()*3,rng()*3,rng()*3),[rr(1.2,4),rr(.6,2),rr(1.2,4)],new THREE.Color().setHSL(.08,.12,rr(.3,.5)));}
  REGISTER({name:'The Flatiron — its fallen upper storeys',x:off.x+dir.x*LEN/2,z:off.z+dir.z*LEN/2,r:LEN/2+10,h:60});}
 apron(G,0,0,big*.62,big*1.05,d,3);
 if(d>0){mossOnSurface(SH,0,0,0,150,3);vinesFromLedge(SH,0,0,0,110,24);
  stainsFromLedge(SH,0,0,0,90,18);rubbleRing(0,0,0,big*.58,big*1.0,90,3.4);
  trees(0,0,big*.7,big*1.3,16);}
 else figures(0,big*.72,10,44);
 KOFF=[0,0,0];return G;}
