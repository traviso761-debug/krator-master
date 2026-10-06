// prefix: nr
// ================================================================= THE PIERS: what the Ancients built into the harbour (the plan: NR.PIERS)
// Drawn in the hull frame, decks level with the quays (D1). The two BREAKWATER ARMS run out to sea from the ends of the ring
// at the mouth, pontoons like the hull (antifouling, the barnacle band, white), splayed so the channel widens seaward, a
// parapet on the sea side, bollards and fenders on the channel side, a beacon on each head. The LINER MOLE runs down the
// basin's long axis from the stern quay, a berth either side: fenders, bollards, lamp standards, two boarding towers with
// their gangways folded. The FINGER PIERS are open decks on columns off the inner quay, for smaller craft.
// A pier's local frame: o its root on the skin, d along it, q across (+q is the pier's left looking out), l metres out.
function nrPierPt(Pr,l,k,y){return [Pr.o[0]+Pr.d[0]*l+Pr.q[0]*k,y,Pr.o[1]+Pr.d[1]*l+Pr.q[1]*k];}
function nrPierRy(Pr){return Math.atan2(Pr.d[0],Pr.d[1]);}
/* a box in the pier's frame: centred at (l, k) on the plan, bottom y, `len` along d, `wid` across */
function nrPierBox(mk,Pr,l,k,y,len,h,wid,col){const p=nrPierPt(Pr,l,k,y);box(mk,p[0],y,p[2],wid,h,len,col,nrPierRy(Pr));}
function nrBollard(x,y,z){cyl('paint',x,y,z,.3,.7,hc(0x3a3c3e),12,.24);cyl('paint',x,y+.7,z,.4,.12,hc(0x3a3c3e),12);}
function nrLampStd(x,y,z){cyl('white',x,y,z,.12,4.2,P('white'),8,.07);sph('white',x,y+4.4,z,.32,P('white'),1,12);}
/* the outline turned anticlockwise for prism (a positive signed area in x, z) */
function nrPierPoly(Pr,grow){const c=[Pr.o[0]+Pr.d[0]*Pr.len/2,Pr.o[1]+Pr.d[1]*Pr.len/2];let pts=Pr.poly.map(p=>{if(!grow)return p;const dx=p[0]-c[0],dz=p[1]-c[1],l=Math.hypot(dx,dz)||1;return [p[0]+dx/l*grow,p[1]+dz/l*grow];});
 const ar=pts.reduce((a,p,i)=>{const q=pts[(i+1)%pts.length];return a+p[0]*q[1]-q[0]*p[1];},0);if(ar<0)pts=pts.slice().reverse();return pts;}
/* a pontoon pier: the hull's bands, a deck, fenders and bollards along a side (side: +1 the +q side, -1 the -q side) */
function nrPontoon(Pr,y0){const L=NR.L,pts=nrPierPoly(Pr);
 prism('paint',pts,y0,5.6,hc(NR_ANTIFOUL));prism('barn',pts,5.6,7.0,WHITE);prism('white',pts,7.0,L.D[0]-L.SLAB,P('whiteS'));
 prism('deck',pts,L.D[0]-L.SLAB,L.D[0],hc(0xcfc9bb));
 /* a white kerb round the deck's edge, set in from the outline */
 const kp=nrPierPoly(Pr,-.02);for(let i=0;i<kp.length-1;i++){const a=kp[i],b=kp[i+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<.05)continue;
  /* the root (along the skin) has no kerb: the deck runs on to the quay */
  const onSkin=p=>Math.abs(Math.abs(NR.ringST(p[0],p[1]).s)-NR.W.PONT)<.3;if(onSkin(a)&&onSkin(b))continue;
  beam('white',[a[0],L.D[0]+.12,a[1]],[b[0],L.D[0]+.12,b[1]],.25,P('white'));}}
function nrFenders(Pr,side,l0,l1){const L=NR.L,k=side*(Pr.w/2+.18);
 for(let l=l0;l<l1;l+=6.5)nrPierBox('dark',Pr,l,k,6.3,1.4,2.4,.36,hc(0x1e2022));}
function nrBollards(Pr,side,l0,l1,step){const k=side*(Pr.w/2-.8);for(let l=l0;l<l1;l+=step){const p=nrPierPt(Pr,l,k,NR.L.D[0]);nrBollard(p[0],p[1],p[2]);}}
function nrPierArm(Pr){const L=NR.L,y=L.D[0],cs=Pr.t>NR.PQ?1:-1;   /* cs: the channel's side (+q or -q) */
 nrPontoon(Pr,1.2);
 /* the channel side: fenders, bollards; the sea side: a parapet with a wave-return lip */
 nrFenders(Pr,cs,4,Pr.len-6);nrBollards(Pr,cs,6,Pr.len-8,11);
 const k=-cs*(Pr.w/2-.35);nrPierBox('white',Pr,(Pr.len-Pr.w/2)/2+1,k,y,Pr.len-Pr.w/2-2,1.25,.7,P('white'));
 nrPierBox('white',Pr,(Pr.len-Pr.w/2)/2+1,k-cs*.15,y+1.25,Pr.len-Pr.w/2-2,.18,1.0,P('white'));
 for(let l=10;l<Pr.len-10;l+=20){const p=nrPierPt(Pr,l,-cs*(Pr.w/2-1.6),y);nrLampStd(p[0],y,p[2]);}
 /* the beacon on the head */
 const B=NR.BEACONS.find(b=>Math.hypot(b.x-Pr.head[0],b.z-Pr.head[1])<Pr.w);if(B)nrBeacon(B.x,y,B.z);}
function nrPierMole(Pr){const L=NR.L,y=L.D[0];
 nrPontoon(Pr,1.2);
 for(const sd of [1,-1]){nrFenders(Pr,sd,3,Pr.len-6);nrBollards(Pr,sd,5,Pr.len-6,12);}
 for(let l=14;l<Pr.len-8;l+=22){const p=nrPierPt(Pr,l,0,y);nrLampStd(p[0],y,p[2]);}
 /* a light on the head: a short white column with a lens */
 {const p=nrPierPt(Pr,Pr.len-3.2,0,y);cyl('white',p[0],y,p[2],.9,5,P('white'),16,.7);cyl('glass',p[0],y+5,p[2],.7,1.1,hc(0x8aa0a8),12);sph('white',p[0],y+6.1,p[2],.8,P('white'),.5,12);}
 /* the boarding towers: a white drum with a glazed head, its gangway (an enclosed tube) folded along the pier, one per berth */
 for(const [l,sd] of [[58,1],[112,-1]]){const k=sd*(Pr.w/2-2.6),p=nrPierPt(Pr,l,k,y),ry=nrPierRy(Pr);
  cyl('white',p[0],y,p[2],2.1,11,P('white'),20);cyl('glass',p[0],y+11,p[2],2.2,2.4,hc(0x24343c),20);cyl('white',p[0],y+13.4,p[2],2.4,.6,P('white'),20,2.0);
  W(p[0],y+11.2,p[2],ry,()=>{box('white',0,0,-9.5,2.8,2.6,17,P('white'));box('glass',sd*1.42,.8,-9.5,.06,1.0,16,hc(0x24343c));box('glass',-sd*1.42,.8,-9.5,.06,1.0,16,hc(0x24343c));
   box('white',0,-11.2,-15.5,.5,11.2-1.3,.5,P('white'));});}
 /* two capstans by the head */
 for(const sd of [1,-1]){const p=nrPierPt(Pr,Pr.len-14,sd*(Pr.w/2-2.2),y);cyl('paint',p[0],y,p[2],.55,.9,hc(0x3a3c3e),14,.45);cyl('paint',p[0],y+.9,p[2],.7,.18,hc(0x3a3c3e),14);}}
function nrPierFinger(Pr){const L=NR.L,y=L.D[0],pts=nrPierPoly(Pr);
 prism('deck',pts,y-.45,y,hc(0xcfc9bb));
 /* the edge beam under the deck, white, and the columns down to the sea floor */
 const kp=nrPierPoly(Pr,-.05);for(let i=0;i<kp.length-1;i++){const a=kp[i],b=kp[i+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<.05)continue;
  beam('white',[a[0],y-.95,a[1]],[b[0],y-.95,b[1]],.5,P('white'));}
 for(let l=4;l<Pr.len-1;l+=7)for(const sd of [1,-1]){const p=nrPierPt(Pr,Math.min(l,Pr.len-Pr.w/2),sd*(Pr.w/2-.9),0);cyl('white',p[0],0,p[2],.42,y-.95,P('whiteS'),12);}
 nrBollards(Pr,1,4,Pr.len-3,8);nrBollards(Pr,-1,8,Pr.len-3,8);
 /* a ladder down to the water at the head */
 {const p=nrPierPt(Pr,Pr.len-.15,0,y);for(const sd of [-.35,.35]){const a=nrPierPt(Pr,Pr.len-.12,sd,y-.45),b=nrPierPt(Pr,Pr.len-.12,sd,3.6);beam('rust',a,b,.06,hc(0x4a4a48));}
  for(let yy=4;yy<y-.6;yy+=.32){const a=nrPierPt(Pr,Pr.len-.12,-.35,yy),b=nrPierPt(Pr,Pr.len-.12,.35,yy);beam('rust',a,b,.04,hc(0x4a4a48));}}
 const p=nrPierPt(Pr,Pr.len-Pr.w/2,0,y);nrLampStd(p[0],y,p[2]);}
function nrPiers(){reseed(4150);
 for(const Pr of NR.PIERS){if(Pr.kind==='arm')nrPierArm(Pr);else if(Pr.kind==='mole')nrPierMole(Pr);else nrPierFinger(Pr);}}
nrPart('piers',nrPiers);
