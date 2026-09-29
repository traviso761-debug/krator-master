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
function buildFlatiron(scene,gx,gz,d){reseed(9465+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=SHELL(d);
 const L=168,W=L*.536,H=d===2?150:250,NF=d===2?11:18,RF=H/NF,TOPS=.34,ch=.10;
 REGISTER({name:'The Flatiron ('+STATE(d)+')',x:0,z:0,r:L*.72,h:H+40});
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
 const SH=[],big=Math.max(L,W);
 const hole=holeFn(d*.7,9466,null,1.1);

 kput(SLABC(d),[0,2,0],null,[big*.60,4,big*.60],null);
 for(let k=0;k<NF;k++){const yy=4+k*RF,s0=sc(k),s1=sc(k+1);
  SH.push(gridSurface((u,v)=>{const Q=pt(u,s0);return[Q[0],yy+v*RF,Q[1]];},
   64,2,{uS:24,vS:2,hole:hole?(u,v)=>hole(u,yy+v*RF):null}));
  SH.push(gridSurface((u,v)=>{const Q=pt(u,lerp(s0,s1,v));return[Q[0],yy+RF,Q[1]];},
   64,2,{uS:24,vS:2,hole:hole?u=>hole(u,yy+RF):null}));
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
    qEuler(0,-Math.atan2(-N[0],N[1]),0),[9,1,1],CYAN);}}

 // the entrance, on the broad transom end
 {const N=nrm(.5,1),D=pt(.5,1);
  kput('archOpen',[D[0]+N[0]*1.2,9,D[1]+N[1]*1.2],qFacing([N[0],0,N[1]]),[3.6,3.4,3.8],null);
  kput(d>0?'paneD':'pane',[D[0]+N[0]*2.2,8,D[1]+N[1]*2.2],qFacing([N[0],0,N[1]]),[8,14,1],null);
  for(let q=-1;q<=1;q+=2)
   kput(d>0?'colR':'colW',[D[0]-N[1]*q*8+N[0]*2.6,10,D[1]+N[0]*q*8+N[1]*2.6],null,[3,20,3],null);
  for(let j=0;j<4;j++)
   kput(SLABC(d),[D[0]+N[0]*(3.4+j*3.4),1.4-j*.9,D[1]+N[1]*(3.4+j*3.4)],
    qFacing([N[0],0,N[1]]),[20-j*2.2,1.4,8],null);}

 const top=4+NF*RF;
 kput(SLABC(d),[0,top+2,0],null,[big*.24,4,big*.24],null);
 if(d!==2){for(let q=0;q<8;q++){const a2=q/8*TAU;
   kput(d>0?'colR':'colW',[Math.cos(a2)*big*.20,top+12,Math.sin(a2)*big*.20],null,[2.6,24,2.6],null);}
  kput(SLABC(d),[0,top+25,0],null,[big*.26,3,big*.26],null);
  if(d===0){kput('finial',[0,top+34,0],null,[4,14,4],null);stripRing(0,top+27,0,big*.20,d,16);}}

 meshMerged(SH,skin,G);
 apron(G,0,0,big*.62,big*1.05,d,3);
 if(d>0){mossOnSurface(SH,0,0,0,150,3);vinesFromLedge(SH,0,0,0,110,24);
  stainsFromLedge(SH,0,0,0,90,18);rubbleRing(0,0,0,big*.58,big*1.0,90,3.4);
  trees(0,0,big*.7,big*1.3,16);}
 else figures(0,big*.72,10,44);
 KOFF=[0,0,0];return G;}
