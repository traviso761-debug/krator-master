// prefix: nr
// ================================================================= THE PUBLIC ROOMS AND THE MACHINERY: the bridge, the grand dining room, the engine room
// Structure only (walls, glazing, columns, daises, the built-in consoles, the engines); their furniture is catalog pieces
// placed by the furnishing pass (70-nr-interiors.js). Each zone is NR.ZONES (14-nr-plan.js).
/* a zone's end walls on deck d: radial walls at t0 and t1, open to the corridors (|s| 8.5-11) */
function nrZoneEnds(Z,d,y,top,mk,col,s0,s1){s0=s0==null?-NR.W.MAIN:s0;s1=s1==null?NR.W.MAIN:s1;const W=NR.W;
 for(const t of [Z.t0,Z.t1]){const segs=[[s0,-W.CAB],[-W.COR,W.COR],[W.CAB,s1]].map(q=>[Math.max(s0,q[0]),Math.min(s1,q[1])]).filter(q=>q[1]-q[0]>.1);
  for(const q of segs)nrRadial(mk,t,q[0],q[1],y,top,.3,col);
  for(const q of [[-W.CAB,-W.COR],[W.COR,W.CAB]])if(q[0]>=s0&&q[1]<=s1)nrRadial(mk,t,q[0],q[1],y+2.4,top,.3,col);}}
/* glazing along the ring at s between t0 and t1, y0..y1, mullions every `every` metres of centreline */
function nrCurtain(t0,t1,s,y0,y1,every,tint){nrBand('glass',t0,t1,s-.04,s+.04,y0,y1,hc(tint||0x6a8a98),s>0?'o':'i');
 for(let t=t0;t<=t1+.01;t+=every)nrBox('white',t,s,y0,.16,y1-y0,.22,P('white'));
 nrBand('white',t0,t1,s-.12,s+.12,y1-.18,y1,P('white'),'oib');}
// ---------------------------------------------------------------- THE BRIDGE (D4, the bow)
function nrBridge(){const Z=NR.zone('bridge'),L=NR.L,W=NR.W,y=L.D[3],top=y+L.CLEAR;reseed(4600);
 nrBand('floor',Z.t0,Z.t1,Z.s0+.15,W.MAIN-.3,y,y+.02,hc(0x6a5a4a),'t');
 nrZoneEnds(Z,3,y,top,'plaster',P('plaster'),Z.s0,W.MAIN);
 /* the forward glazing, raked outward, over the white ribbon */
 psurf('glass',(u,v)=>nrP(lerp(Z.t0,Z.t1,u),lerp(W.MAIN-.25,W.MAIN+.35,v),lerp(y+1.05,top,v)),24,1,hc(0x4a6a78),{flip:true});
 for(let t=Z.t0;t<=Z.t1+.01;t+=3){const a=nrP(t,W.MAIN-.25,y+1.05),b=nrP(t,W.MAIN+.35,top);beam('white',a,b,.18,P('white'));}
 /* the Ancients' console: a long curved desk under the glass, dark dead screens on it; the helm on a dais behind */
 nrBand('white',Z.t0+3,Z.t1-3,W.MAIN-2.6,W.MAIN-1.4,y,y+.95,P('white'),'oitse');
 nrBand('dark',Z.t0+3.4,Z.t1-3.4,W.MAIN-2.45,W.MAIN-1.5,y+.95,y+.98,hc(0x1a2428),'t');
 for(let t=Z.t0+4;t<Z.t1-3;t+=2.4){const p=nrP(t,W.MAIN-1.6,y+.98),n=NR.nrm(t);box('dark',p[0],p[1],p[2],1.4,.55,.06,hc(0x14202a),Math.atan2(n[0],n[1]));}
 nrBand('white',-5,5,9,14,y,y+.35,P('white'));                                 // the helm dais
 {const p=nrP(0,13,y+.35);cyl('white',p[0],p[1],p[2],.55,1.0,P('white'),16,.4);cyl('dark',p[0],p[1]+1,p[2],.7,.08,hc(0x202a30),20);}
 /* the chart room behind: a low wall, a doorway */
 nrBand('plaster',-12,-4,5.8,6.0,y,y+1.2,P('plaster'),'oitse');nrBand('plaster',4,12,5.8,6.0,y,y+1.2,P('plaster'),'oitse');}
// ---------------------------------------------------------------- THE GRAND DINING ROOM (D3-D4, double height, the stern)
function nrDining(){const Z=NR.zone('dining'),L=NR.L,W=NR.W,y=L.D[2],top=L.D[3]+L.CLEAR;reseed(4610);
 nrBand('marble',Z.t0,Z.t1,-W.MAIN+.25,W.MAIN-.25,y,y+.02,P('marble'),'t');
 nrZoneEnds(Z,2,y,y+L.DH,'plaster',P('plaster'));nrZoneEnds(Z,3,L.D[3]-L.SLAB,top,'plaster',P('plaster'));
 for(const sg of [1,-1])nrCurtain(Z.t0,Z.t1,sg*(W.MAIN-.2),y,top,2.6);
 /* two colonnades of fluted white columns, capitals at the ceiling */
 for(const s of [-7,7])for(let t=Z.t0+5;t<Z.t1-2;t+=8.4){const p=nrP(t,s,y);
  for(let k=0;k<8;k++){const a=k/8*TAU;cyl('white',p[0]+Math.cos(a)*.38,y,p[2]+Math.sin(a)*.38,.12,top-y-.6,P('white'),6);}
  cyl('white',p[0],y,p[2],.4,top-y,P('white'),16);cyl('white',p[0],top-.6,p[2],.4,.6,P('white'),16,.9);cyl('white',p[0],y,p[2],.62,.3,P('white'),16);}
 /* the captain's dais on the sea side, three steps up; the servery along the harbour side */
 nrBand('marble',Z.t0+16,Z.t1-16,10,W.MAIN-1,y,y+.45,P('marble'));
 for(let i=0;i<3;i++)nrBand('marble',Z.t0+16,Z.t1-16,9.4+i*.2-.6,10,y,y+.15*(i+1),P('marble'),'tos');
 /* a coffered ceiling: deep white beams across the ring under the top deck */
 for(let t=Z.t0+2;t<Z.t1;t+=4.2)nrRadial('white',t,-W.MAIN+.3,W.MAIN-.3,top-.55,top,.35,P('white'));
 for(const s of [-14,-7,0,7,14])nrBand('white',Z.t0,Z.t1,s-.17,s+.17,top-.55,top,P('white'),'oib');}
// ---------------------------------------------------------------- THE ENGINE ROOM (D1-D2, double height, the stern): silent a thousand years
function nrEngineRoom(){const Z=NR.zone('engine'),L=NR.L,W=NR.W,y=L.D[0],top=L.D[1]+L.CLEAR,mid=L.D[1];reseed(4620);
 nrZoneEnds(Z,0,y,y+L.DH,'cracked',hc(0xa8a296));nrZoneEnds(Z,1,mid-L.SLAB,top,'cracked',hc(0xa8a296));
 nrBand('grate',Z.t0+.3,Z.t1-.3,-W.MAIN+.3,W.MAIN-.3,y,y+.03,WHITE,'t');
 /* the four engines: great drums along the ring on cradles, banded, a turbine housing at one end, the manifolds rising
    to the ceiling, the shafts going down through the floor to the propulsors under the stern */
 for(const tc of [NR.PH-13,NR.PH+13])for(const s of [-9.5,9.5]){const len=19,r=2.5,cy=y+r+.9;
  const a=nrP(tc-len/2,s,cy),b=nrP(tc+len/2,s,cy);beam('paint',a,b,r,hc(0x5c6e66),true,24);
  for(let k=0;k<=6;k++){const t=tc-len/2+k*len/6,p=nrP(t,s,cy),q=nrP(t+.01,s,cy);beam('rust',[p[0],p[1],p[2]],[q[0]+(q[0]-p[0])*30,q[1],q[2]+(q[2]-p[2])*30],r+.12,WHITE,true,24);}
  for(const e of [-1,1]){const p=nrP(tc+e*len/2,s,cy),n=NR.tan(tc);sph('paint',p[0],p[1],p[2],r,hc(0x5c6e66),1,16);}
  for(const t of [tc-6,tc+6]){const p=nrP(t,s,y);box('conc',p[0],y,p[2],2.2,1.0,5.2,P('concD'),Math.atan2(NR.tan(t)[0],NR.tan(t)[1]));}
  /* the turbine housing: a flared drum at the stern end */
  {const t=tc+len/2+1.5,p=nrP(t,s,cy),q=nrP(t+3,s,cy);beam('paint',p,q,r+.9,hc(0x4e5e58),true,24,r+.4);}
  /* manifolds to the ceiling */
  for(let k=-2;k<=2;k++){const p=nrP(tc+k*3.2,s+(k%2?1:-1)*.8,cy+r*.8);beam('rust',p,[p[0],top-.3,p[2]],.28,WHITE,true,10);}
  /* the shaft down through the floor */
  {const p=nrP(tc+len/2+5,s,cy);beam('paint',p,[p[0],y-6,p[2]],.6,hc(0x4e5e58),true,12);}}
 /* the catwalk at the D2 level round the engines and across the middle, railed, on posts */
 for(const s0 of [-1.2,-W.MAIN+.3,W.MAIN-2.3]){const s1=s0+(s0===-1.2?2.4:2.0);nrBand('grate',Z.t0,Z.t1,s0,s1,mid-.12,mid,WHITE);
  for(const s of [s0+.05,s1-.05])if(Math.abs(s)<W.MAIN-.6)nrBand('paint',Z.t0,Z.t1,s-.03,s+.03,mid+1.0,mid+1.06,hc(0x6a7a72),'oit');
  for(let t=Z.t0+2;t<Z.t1;t+=4){const p=nrP(t,(s0+s1)/2,y);box('paint',p[0],y,p[2],.12,mid-y-.12,.12,hc(0x6a7a72));}}
 for(const t of [NR.PH-24,NR.PH,NR.PH+24])nrBand('grate',t-1,t+1,-W.MAIN+.3,W.MAIN-.3,mid-.12,mid,WHITE);
 /* control stands along the walls, dead; ladders from the floor to the catwalk */
 for(let t=Z.t0+4;t<Z.t1-4;t+=7)for(const sg of [1,-1]){const p=nrP(t,sg*(W.MAIN-1.2),y),n=NR.nrm(t);box('paint',p[0],y,p[2],1.6,1.3,.7,hc(0x6a7a72),Math.atan2(n[0],n[1]));
  box('dark',p[0]-n[0]*sg*.36,y+.8,p[2]-n[1]*sg*.36,1.2,.4,.04,hc(0x10181c),Math.atan2(n[0],n[1]));}}
nrPart('bridge',nrBridge);nrPart('dining',nrDining);nrPart('engine',nrEngineRoom);
