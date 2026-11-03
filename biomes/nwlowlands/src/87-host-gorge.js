// ================================================================= HOST - the marl's ledges and talus, the river's bars (the rebuild's checklist: strata and scour feed placement)
// After the kit's build and before the bake, each cell its own KRAND.hash, so nothing the kit placed moves:
//   LEDGES   ferns, moss and hanging moss on the gorge's walls where the marl's record says a hard band stands proud (NW_MARL.hardnessAt at the drawn height, the bed the shader draws)
//   TALUS    fallen marl along the walls' feet, sized by the wall above it
//   BARS     shingle and reed tufts on the inside of the river's bends: GLW's bars mask, the ground's own layer
function gorgePass(){if(!GORGE.on||!NW_MARL)return null;
 const W=8105,C=c=>new THREE.Color(c),out={ledge:0,talus:0,bars:0},H=(a,b,c,d)=>KRAND.hash(W,a,b,c,d),U=h=>KRAND.unit(h);
 const q=(a,b,c)=>BIO.fn.qEuler(a,b,c),R0=TERR.R-150;
 BIO.kitWrap('nwlowlands',{p(){BIO.cur='nwlow/gorge';const cell=4;
  for(let s=GORGE.s0;s<GORGE.s1;s+=cell)for(let dt=-54;dt<=54;dt+=cell){const j=Math.round(s/cell),i=Math.round(dt/cell),h=H(i,j,1),x0=s+(U(H(i,j,2))-.5)*cell,t=RIVER_T(x0)+dt+(U(H(i,j,3))-.5)*cell,p=xzOf(x0,t),x=p[0],z=p[1];
   if(Math.hypot(x,z)>R0)continue;const cut=gorgeCut(x,z);if(cut<1)continue;const y=terrainH(x,z),sl=ENV.slope(x,z),u=U(h);if(WF.shore(x,z)<1)continue;
   const hard=NW_MARL.hardnessAt(x,y,z),green=C(0x4e7a5a).lerp(C(0x7fae7a),U(H(i,j,4)));
   if(sl>.5&&hard>.5&&u<.8){BIO.put(U(H(i,j,5))<.6?'frond':'mossmat',[x,y+.04,z],q(0,U(H(i,j,6))*6.283,.5),1.2+U(H(i,j,7))*1.4,green);
    if(U(H(i,j,8))<.25)BIO.put('beard',[x,y,z],q(0,U(H(i,j,9))*6.283,0),[1,2+U(H(i,j,10))*2.5,1],C(0x7a8e72));out.ledge++;}
   else if(sl<.5&&cut>10&&u<.3){const r=.3+1.4*U(H(i,j,5))*U(H(i,j,6));BIO.put('boulder',[x,y+r*.2,z],q(U(H(i,j,7)),U(H(i,j,8))*6.283,U(H(i,j,9))),[r,r*.6,r*1.2],C(0x93a6ae).lerp(C(0x6f8894),U(H(i,j,10))));out.talus++;}}
  // the bars, along the whole river above the lake
  const bc=6;for(let s=-1200;s<R0;s+=bc)for(let dt=-60;dt<=60;dt+=bc){const j=Math.round(s/bc),i=Math.round(dt/bc),h=H(i,j,21),p=xzOf(s+(U(H(i,j,22))-.5)*bc,RIVER_T(s)+dt+(U(H(i,j,23))-.5)*bc),x=p[0],z=p[1];
   if(Math.hypot(x,z)>R0)continue;const d=WF.shore(x,z);if(d<.5||GLW(x,z)[5]<.4||U(h)>.7)continue;const y=terrainH(x,z);
   if(U(H(i,j,24))<.7){const r=.08+.3*U(H(i,j,25))*U(H(i,j,26));BIO.put('boulder',[x,y+r*.2,z],q(0,U(H(i,j,27))*6.283,0),[r*1.3,r*.6,r],C(0x9c9484).lerp(C(0x77706a),U(H(i,j,28))));}
   else BIO.put('reed',[x,y-.05,z],q(0,U(H(i,j,27))*6.283,0),[.8,1.2+U(H(i,j,28)),.8],C(0x6e8a52));out.bars++;}
  BIO.cur=null;}}).p();
 return out;}
