// ================================================================= DATA CENTER ALT — "the Perforated Stacks"
// Three round decks raised on drums of server halls, joined by straight
// bridges, and on them a stand of white stacks: tall cylinders that swell, at
// one or two heights, into barrels studded all over with round vents. The
// machines were cooled through those barrels; the decks carried the plant.
// After arco2 #1 and #2 (the model city of perforated towers on round
// platforms joined by causeways) and arco2 #28 (the perforated hyperbolic stack).
// Ruin: the tallest stack snapped at its lower barrel and lies across the
// north deck and the plain; the east bridge fell; the vents are dead holes.
function buildAltDataCenter(scene,gx,gz,d){reseed(9914);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),SK=SHELL(d),acc=[],sk=[];
 REGISTER({name:'Data center alt — the Perforated Stacks ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:90,h:90});
 // decks: [x,z,r,y]
 const DK=[[-34,10,30,8],[36,22,25,6],[4,-40,26,10]];
 for(const[x,z,r,y]of DK){altCyl(acc,x,0,z,r*.45,r*.45,y-1,24);altCyl(acc,x,y-1.2,z,r,r,1.6,48);
  altRev(acc,x,z,r,y+.4,r,y+1.6,0,TAU,48);                               // a parapet ring
  const n=Math.round(r*.45*TAU/3);for(let k=0;k<n;k++){const a=k/n*TAU,c=Math.cos(a),s=Math.sin(a),rr0=r*.45+.1;
   kput(d>0?'boxD':'darkPane',[x+c*rr0,(y-1)*.5,z+s*rr0],qFacing([c,0,s]),[1.6,(y-1)*.6,1],null);}}
 // bridges between the decks
 const BR=[[0,1],[0,2],[1,2]];
 BR.forEach(([i,j],bi)=>{const A=DK[i],B=DK[j],dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  const a=[A[0]+ux*A[2],A[3],A[1]+uz*A[2]],b=[B[0]-ux*B[2],B[3],B[1]-uz*B[2]],len=Math.hypot(b[0]-a[0],b[2]-a[2]),yaw=-Math.atan2(uz,ux);
  if(fall&&bi===2){altBox(acc,(a[0]+b[0])/2,.8,(a[2]+b[2])/2,len*.9,1.6,6,yaw,0,.06);altHeap((a[0]+b[0])/2,(a[2]+b[2])/2,10,24,1.4);return;}
  altBox(acc,(a[0]+b[0])/2,(a[1]+b[1])/2+.2,(a[2]+b[2])/2,len+2,1.4,6,yaw,0,-Math.atan2(b[1]-a[1],len));
  for(const sd of[-1,1])beam(dd?'strutR':'strutW',[a[0]-uz*3*sd,a[1]+1.2,a[2]+ux*3*sd],[b[0]-uz*3*sd,b[1]+1.2,b[2]+ux*3*sd],.3,.3);});
 // THE STACKS: [deck, dx, dz, r, H, barrels:[[y,h]]]
 const STK=[[0,-8,4,6,62,[[26,14]]],[0,12,-8,5,44,[[16,10],[32,8]]],[1,0,0,7,78,[[20,16],[50,14]]],[1,-12,8,4.5,38,[[22,10]]],[2,0,0,6.5,70,[[34,18]]],[2,14,6,4,34,[[14,9]]]];
 const snapI=2,hf=holeFn(d*.5,9914,null,1.6);
 STK.forEach(([di,ox,oz,r,H,brl],si)=>{const D=DK[di],x=D[0]+ox,z=D[1]+oz,y0=D[3]+.4;
  const rF=yy=>{let k=0;for(const[by,bh]of brl){const t=(yy-by)/bh;if(t>0&&t<1)k=Math.max(k,Math.pow(Math.sin(Math.PI*t),.6));}return r*(1+.75*k);};
  const cut=fall&&si===snapI?brl[0][0]+brl[0][1]*.6:null;
  const g=lathe({rFn:rF,H,cut,jag:cut?5:0,seed:si,nu:40,nv:Math.round(H/2),hole:hf});g.translate(x,y0,z);sk.push(g);
  if(!cut){altRev(sk,x,z,rF(H)+.6,y0+H,0,y0+H+1.2,0,TAU,24);altRev(sk,x,z,rF(H)+.6,y0+H,rF(H)+.6,y0+H-.8,0,TAU,24);}
  mesh(lathe({rFn:yy=>rF(yy)*.8,H:cut||H,nu:20,nv:Math.round((cut||H)/4)}),MAT.dark,G,x,y0,z);
  // vents on the barrels, slots on the shaft
  for(const[by,bh]of brl)for(let yy=by+1.2;yy<by+bh-.8;yy+=1.9){if(cut&&yy>cut-3)break;const rr0=rF(yy),n=Math.round(rr0*TAU/2.2);
   for(let k=0;k<n;k++){const u=(k+.5*(Math.round(yy)%2))/n,a=u*TAU;if(hf&&hf(u,yy))continue;const c=Math.cos(a),s=Math.sin(a);
    kput('ovalD',[x+c*(rr0+.05),y0+yy,z+s*(rr0+.05)],qFacing([c,0,s]),[.62,.62,1],null);}}
  for(let k=0;k<4;k++){const a=k/4*TAU+si,c=Math.cos(a),s=Math.sin(a);
   kput(d>0?'cellD':'cell',[x+c*(r+.05),y0+(cut||H)*.5,z+s*(r+.05)],qFacing([c,0,s]),[.7,Math.min(10,(cut||H)*.3),1],d>0?null:(k%2?CYAN:WARM));}
  if(cut){// the snapped head, lying north across the deck edge onto the plain
   const F=new THREE.Group();F.position.set(x-10,0,z-48);F.rotation.order='YXZ';F.rotation.set(Math.PI/2-.12,.4,0);G.add(F);
   const fg=lathe({rFn:yy=>rF(yy+cut),H:H-cut,nu:40,nv:20,hole:(u,v)=>fbm(u*6,v*.1,3,2)<.3});meshMerged([fg],SK,F);dropFragment(F,0,1.2);
   altHeap(x-6,z-36,14,50,2.2);}});
 meshMerged(sk,SK,G);
 // the chiller plant on the decks: boxes, pipe runs
 for(const[x,z,r,y]of DK)for(let k=0;k<5;k++){const a=k/5*TAU+.3,rr0=r*.72;if(fall&&x>30&&k===1)continue;
  altBox(acc,x+Math.cos(a)*rr0,y+.4+1.8,z+Math.sin(a)*rr0,6,3.6,4,-a);kput(dd?'pipeR':'pipe',[x+Math.cos(a)*rr0,y+4.4,z+Math.sin(a)*rr0],null,[.8,1.6,.8],null);}
 altMerge(acc,CM,G);
 DK.forEach(([x,z,r,y],i)=>REGISTER({name:'Data center alt — deck '+(i+1),x,z,r:r,h:y+2}));
 apron(G,0,-4,70,92,d,.4);
 if(dd){for(const[x,z,r,y]of DK){mossOnRing(x,y+.4,z,r*.8,16,1.6);vinesOnRing(x,y,z,r,10,6);}rubbleRing(0,-4,0,60,80,40,1.6);altTrees(22,90,150,80,80);}
 else altTrees(10,95,150,80,80);
 figures(0,70,5,12);
 if(d===2){reseed(9939);
  STK.forEach(([di,ox,oz,r,H,brl],si)=>{const D=DK[di],x=D[0]+ox,z=D[1]+oz,y0=D[3]+.4;for(const[by,bh]of brl){if(si===snapI&&by>20)continue;
   for(let k=0;k<8;k++){const a=k/8*TAU+si,c=Math.cos(a),s=Math.sin(a);if(fbm(a*2,by*.1,si,2)<.45)continue;
    fireWindow([x+c*r*1.8,y0+by+bh*.5,z+s*r*1.8],[c,0,s],qFacing([c,0,s]),1.2,1.2);}}});
  altReclaim(G,{up:60,side:30,r:90,stalls:12,plots:12,people:18,key:'altDc'});}
 KOFF=[0,0,0];return G;}
