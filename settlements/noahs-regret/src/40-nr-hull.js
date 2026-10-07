// prefix: nr
// ================================================================= THE HULL: ring primitives, the pontoon, the decks' slabs, the skins, the mouth
// Everything here draws in the HULL frame (the arcology def pushes NR_HULL before calling it): x, z from NR.at(t, s), y up
// from the keel. Bands along the ring are psurf sheets (30-geo.js), so they follow the ellipse exactly and carry arc-length
// UVs; radial pieces (partitions, ribs) are boxes turned to the normal.
/* the hull's drawing passes, in order: each fragment registers its own with nrPart; nrAfter passes place child defs
   after the deck buildings (49-nr-arcology.js runs both) */
const NR_PARTS=[],NR_AFTER=[],NR_PART_TRIS={};
function nrPart(name,fn){NR_PARTS.push([name,fn]);}
function nrAfter(name,fn){NR_AFTER.push([name,fn]);}
const NR_STEP=3.2;   // metres of centreline per segment along the ring
/* nrSeg(t0, t1): segments for a band, finer where the ring bends hardest */
function nrSeg(t0,t1){const rho=NR.rho((t0+t1)/2);return Math.max(1,Math.ceil(Math.abs(t1-t0)/Math.min(NR_STEP,rho/40)));}
function nrP(t,s,y){const p=NR.at(t,s);return [p[0],y,p[1]];}
/* a band of the ring: t0..t1 along, s0..s1 across, y0..y1 up. faces: any of 'o' (outboard, s1) 'i' (inboard, s0) 't' 'b'
   's' (the t0 end) 'e' (the t1 end) */
function nrBand(mk,t0,t1,s0,s1,y0,y1,col,faces){if(t1<=t0||s1<=s0||y1<=y0)return;faces=faces||'oitbse';const n=nrSeg(t0,t1);
 if(faces.indexOf('o')>=0)psurf(mk,(u,v)=>nrP(lerp(t0,t1,u),s1,lerp(y0,y1,v)),n,1,col,{flip:true});
 if(faces.indexOf('i')>=0)psurf(mk,(u,v)=>nrP(lerp(t0,t1,u),s0,lerp(y0,y1,v)),n,1,col);
 if(faces.indexOf('t')>=0)psurf(mk,(u,v)=>nrP(lerp(t0,t1,u),lerp(s0,s1,v),y1),n,1,col,{up:true});
 if(faces.indexOf('b')>=0)psurf(mk,(u,v)=>nrP(lerp(t0,t1,u),lerp(s0,s1,v),y0),n,1,col,{flip:true});
 if(faces.indexOf('s')>=0)psurf(mk,(u,v)=>nrP(t0,lerp(s0,s1,u),lerp(y0,y1,v)),1,1,col,{flip:true});
 if(faces.indexOf('e')>=0)psurf(mk,(u,v)=>nrP(t1,lerp(s0,s1,u),lerp(y0,y1,v)),1,1,col);}
/* a lofted wall along the ring through a section profile [[s, y], ...] (bottom up). face: +1 the sheet faces outboard
   (+s), -1 inboard */
function nrLoft(mk,t0,t1,prof,col,face){const n=nrSeg(t0,t1),m=prof.length-1;
 psurf(mk,(u,v)=>{const q=v*m,j=Math.min(m-1,Math.floor(q)),f=q-j;return nrP(lerp(t0,t1,u),lerp(prof[j][0],prof[j+1][0],f),lerp(prof[j][1],prof[j+1][1],f));},n,m,col,{flip:face>0});}
/* a radial box (a partition, a rib, a bulkhead) on the line across the ring at t, from s0 to s1, y0..y1, thick along t */
function nrRadial(mk,t,s0,s1,y0,y1,thick,col){const c=NR.at(t,(s0+s1)/2),n=NR.nrm(t);box(mk,c[0],y0,c[1],thick,y1-y0,Math.abs(s1-s0),col,Math.atan2(n[0],n[1]));}
/* a box standing at (t, s), turned to the ring: local x along the tangent (w), local z along the normal (d) */
function nrBox(mk,t,s,y,w,h,d,col){const c=NR.at(t,s),n=NR.nrm(t);box(mk,c[0],y,c[1],w,h,d,col,Math.atan2(n[0],n[1]));}
function nrCyl(mk,t,s,y,r,h,col,seg,rt){const c=NR.at(t,s);cyl(mk,c[0],y,c[1],r,h,col,seg,rt);}
/* a wall ALONG the ring at offset s (thickness th, centred) from t0 to t1, y0..y1, with openings [{t0, t1, y1}] (a door: a gap
   to y1 with a lintel above). Jamb faces close each piece. */
function nrWallT(mk,t0,t1,s,th,y0,y1,col,open){const O=(open||[]).filter(o=>o.t1>t0&&o.t0<t1).sort((a,b)=>a.t0-b.t0);let c=t0;
 for(const o of O){const a=Math.max(t0,o.t0),b=Math.min(t1,o.t1);if(a>c)nrBand(mk,c,a,s-th/2,s+th/2,y0,y1,col,'oise');
  if(o.y1<y1)nrBand(mk,a,b,s-th/2,s+th/2,o.y1,y1,col,'oib');c=Math.max(c,b);}
 if(c<t1)nrBand(mk,c,t1,s-th/2,s+th/2,y0,y1,col,'oise');}
/* a slab over the band [tA, tB] x [sA, sB], top at y, thickness th, with rectangular HOLES [{t0, t1, s0, s1}] cut out:
   the band is cut at every hole's t edges, and each strip keeps the s intervals no hole covers */
function nrSlab(mk,tA,tB,sA,sB,y,th,col,holes,faces,under){
 const piece=(a,b,s0,s1)=>{if(!under){nrBand(mk,a,b,s0,s1,y-th,y,col,faces||'tboise');return;}
  nrBand(mk,a,b,s0,s1,y-th,y,col,'t');nrBand(under[0],a,b,s0,s1,y-th,y,under[1],(faces||'tboise').replace('t',''));};const H=(holes||[]).filter(h=>h.t1>tA&&h.t0<tB&&h.s1>sA&&h.s0<sB);
 const ts=[tA,tB];for(const h of H){if(h.t0>tA&&h.t0<tB)ts.push(h.t0);if(h.t1>tA&&h.t1<tB)ts.push(h.t1);}ts.sort((a,b)=>a-b);
 for(let i=0;i<ts.length-1;i++){const a=ts[i],b=ts[i+1];if(b-a<1e-3)continue;const m=(a+b)/2;
  const cut=H.filter(h=>h.t0<=m&&h.t1>=m).map(h=>[Math.max(sA,h.s0),Math.min(sB,h.s1)]).sort((p,q)=>p[0]-q[0]);
  let c=sA;for(const q of cut){if(q[0]>c)piece(a,b,c,q[0]);c=Math.max(c,q[1]);}
  if(c<sB)piece(a,b,c,sB);}}
/* every hole a deck's slab has (the slab whose TOP is at deck level d: 1..3 = D2..D4, 4 = TOP) */
function nrSlabHoles(d){const L=NR.L,H=[],A=NR.ATRIUM;
 /* the atrium void (galleries remain round it); its cross-bridges are drawn by 44-nr-atrium.js */
 H.push({t0:A.tc-A.voidT,t1:A.tc+A.voidT,s0:-A.voidS,s1:A.voidS});
 /* the stair cores' wells */
 for(const C of NR.CORES)H.push({t0:C.t-3.5,t1:C.t+3.5,s0:-6,s1:6});
 /* the double-height rooms: the engine room (no D2 floor), the dining room (no D4 floor) */
 if(d===1){const Z=NR.zone('engine');H.push({t0:Z.t0,t1:Z.t1,s0:-NR.W.MAIN,s1:NR.W.MAIN});}
 if(d===3){const Z=NR.zone('dining');H.push({t0:Z.t0,t1:Z.t1,s0:-NR.W.MAIN,s1:NR.W.MAIN});}
 return H;}
// ---------------------------------------------------------------- the hull shell
const NR_ANTIFOUL=0x6e3428;
function nrHullShell(){const L=NR.L,W=NR.W,T0=NR.T0,T1=NR.T1;
 reseed(4100);
 // the pontoon's outer and inner skins: a bilge curve at the keel, antifouling red below the old waterline (it floated at
 // about y 6.4), a band of barnacles across it, white above. The sea now stands at 2-7 m on these walls (the list).
 for(const side of [1,-1]){const S=W.PONT*side,k=side;
  const bilge=[[S-k*3.4,0],[S-k*1.6,.35],[S-k*.55,1.2],[S,2.6],[S,5.7]];
  nrLoft('paint',T0,T1,bilge,hc(NR_ANTIFOUL),side);
  nrLoft('barn',T0,T1,[[S+k*.02,5.6],[S+k*.02,7.0]],WHITE,side);
  nrLoft('white',T0,T1,[[S,6.95],[S,9.0]],P('whiteS'),side);
  /* the inner skin of the double hull, facing the hold */
  nrBand('cracked',T0,T1,side>0?W.SKIN-.2:-W.SKIN,side>0?W.SKIN:-W.SKIN+.2,L.HOLD,L.D[0]-L.SLAB,hc(0x9a958a),side>0?'i':'o');}
 // the keel plate and the tank top (the hold floor)
 nrBand('paint',T0,T1,-W.PONT+3.4,W.PONT-3.4,0,.02,hc(NR_ANTIFOUL),'b');
 nrSlab('conc',T0,T1,-W.SKIN,W.SKIN,L.HOLD,.3,P('concD'),[],'t');
 // the D1 slab: the holds' ceiling, the ledges (outer promenade, inner quay) and the floor of the first deck
 nrSlab('deck',T0,T1,-W.PONT,W.PONT,L.D[0],L.SLAB,hc(0xcfc9bb),[{t0:NR.ATRIUM.tc-17,t1:NR.ATRIUM.tc-9,s0:-3,s1:3}]
  .concat(NR.CORES.filter(c=>c.down).map(c=>({t0:c.t-3.5,t1:c.t+3.5,s0:-6,s1:6}))));
 // the slabs of D2, D3, D4 and the top deck
 for(let d=1;d<=4;d++){const y=d<4?L.D[d]:L.TOP;nrSlab(d===4?'deck':'conc',T0,T1,-W.MAIN,W.MAIN,y,L.SLAB,d===4?hc(0xd6d0c2):P('conc'),nrSlabHoles(d),null,['plaster',hc(0xe4ded2)]);}
 // the main block's skins. D1-D2: a white sill, a band of glass, a white head (the long Ancient ribbon window). D3-D4:
 // the slab edges run out to 20 as balconies with white parapet ribbons; the glass is set back at 18.5 (42-nr-decks.js).
 for(const side of [1,-1]){const S=W.MAIN*side,lo=side>0?S-.25:S,hi=side>0?S:S+.25;
  /* (the grand atrium has its own curtain walls on these decks: 44-nr-atrium.js) */
  const ta=NR.ATRIUM.tc-NR.ATRIUM.half,tb=NR.ATRIUM.tc+NR.ATRIUM.half;
  for(let d=0;d<2;d++){const y=L.D[d];for(const [a,b] of [[T0,ta],[tb,T1]]){
   nrBand('white',a,b,lo,hi,y,y+.95,P('white'),side>0?'o':'i');
   nrBand('glass',a,b,lo-.08*side,hi-.08*side,y+.95,y+2.75,hc(0x24343c),side>0?'o':'i');
   nrBand('white',a,b,lo,hi,y+2.75,y+L.DH-L.SLAB,P('white'),side>0?'o':'i');
   nrBand('white',a,b,lo,hi,y+2.75,y+2.95,P('whiteS'),'b');}}
  for(let d=2;d<4;d++){const y=L.D[d];
   /* the balcony parapet ribbon: a white band from the slab's underside to a metre above the balcony, lipped outward */
   nrBand('white',T0,T1,side>0?S-.12:S-.16,side>0?S+.16:S+.12,y-L.SLAB-.05,y+1.05,P('white'),'oitb');}
  /* the top deck's parapet */
  nrBand('white',T0,T1,side>0?S-.3:S,side>0?S:S+.3,L.TOP,L.TOP+L.PARAPET,P('white'),'oit');}
 // the ledge kerbs: the outer promenade's rail, the inner quay's kerb and bollards
 for(const side of [1,-1]){const S=W.PONT*side;
  nrBand('white',T0,T1,side>0?S-.35:S,side>0?S:S+.35,L.D[0],L.D[0]+.3,P('white'),'oit');
  if(side>0){/* the rail along the outer promenade, open where the pirates' steps go down to the beach (62) */
   const gaps=NR.STEPS.map(q=>[q.t-1.4,q.t+1.4]).sort((a,b)=>a[0]-b[0]);let c=T0;
   for(const g of gaps.concat([[T1,T1]])){if(g[0]>c){nrBand('paint',c,g[0],S-.2,S-.14,L.D[0]+.98,L.D[0]+1.05,hc(0x6a7076),'oitbse');
     for(let t=c+.6;t<g[0]-.2;t+=2.4)nrBox('paint',t,S-.17,L.D[0]+.3,.06,.7,.06,hc(0x6a7076));}c=g[1];}}
  else for(let t=T0+6;t<T1-4;t+=14){nrCyl('paint',t,S+.7,L.D[0],.32,.75,hc(0x3a3c3e),12,.26);nrCyl('paint',t,S+.7,L.D[0]+.75,.42,.12,hc(0x3a3c3e),12);}}
 // the main block's end walls at the mouth, and the pontoon's round pier heads beyond them
 for(const [t,dir] of [[T0,-1],[T1,1]]){
  for(let d=0;d<4;d++){const y=L.D[d];
   nrRadial('white',t,-W.MAIN,W.MAIN,y,y+.95,.3,P('white'));nrRadial('glass',t+dir*.06,-W.MAIN+1,W.MAIN-1,y+.95,y+2.75,.12,hc(0x24343c));
   nrRadial('white',t,-W.MAIN,W.MAIN,y+2.75,y+L.DH,.3,P('white'));for(let s=-W.MAIN+1;s<=W.MAIN-1;s+=4.2)nrBox('white',t,s,y+.95,.36,1.8,.22,P('white'));}
  nrRadial('white',t,-W.MAIN,W.MAIN,L.TOP,L.TOP+L.PARAPET,.3,P('white'));
  nrPierHead(t,dir);}
 nrMouthBridge();}
/* a semicircular pier head on the pontoon beyond the ring's end at t (dir: +1 beyond T1, -1 before T0), with a beacon */
function nrPierHead(t,dir){const W=NR.W,L=NR.L,c=NR.at(t,0),T=NR.tan(t),n=NR.nrm(t),R=W.PONT,pts=[],pb=[];
 for(let i=0;i<=24;i++){const a=i/24*PI,u=Math.cos(a)*R,v=Math.sin(a)*R*dir;   // u along the normal, v beyond the end along the tangent
  pts.push([c[0]+n[0]*u+T[0]*v,c[1]+n[1]*u+T[1]*v]);}
 if(dir<0)pts.reverse();
 /* prism wants a positive signed area in (x, z) (its side normals are the edges turned -90 degrees) */
 const ar=pts.reduce((a,p,i)=>{const q=pts[(i+1)%pts.length];return a+p[0]*q[1]-q[0]*p[1];},0);if(ar<0)pts.reverse();
 prism('paint',pts,0,5.6,hc(NR_ANTIFOUL));prism('barn',pts.map(p=>[p[0],p[1]]),5.6,7.0,WHITE);prism('white',pts,7.0,L.D[0]-L.SLAB,P('whiteS'));
 prism('deck',pts,L.D[0]-L.SLAB,L.D[0],hc(0xcfc9bb));
 // the beacon: a slim Ancient lantern tower on the pier head's tip
 const b=[c[0]+T[0]*dir*16,c[1]+T[1]*dir*16];
 cyl('white',b[0],L.D[0],b[1],2.4,12,P('white'),20,1.8);cyl('white',b[0],L.D[0]+12,b[1],2.6,.5,P('white'),20);
 cyl('glass',b[0],L.D[0]+12.5,b[1],1.6,2.4,hc(0x8aa0a8),16);sph('white',b[0],L.D[0]+14.9,b[1],1.9,P('white'),.55,16);
 cyl('white',b[0],L.D[0]+15.6,b[1],.12,4.5,P('white'),6,.05);
 for(let i=0;i<8;i++){const a=i/8*TAU;beam('white',[b[0]+Math.cos(a)*1.65,L.D[0]+12.5,b[1]+Math.sin(a)*1.65],[b[0]+Math.cos(a)*1.65,L.D[0]+14.9,b[1]+Math.sin(a)*1.65],.1,P('white'));}}
/* the mouth's bascule bridge: two leaves hinged at the top deck of each end wall, raised (they jammed open when the hull
   stuck, and the harbour has stayed open since) */
function nrMouthBridge(){const L=NR.L,W=NR.W,a=NR.at(NR.T1,0),b=NR.at(NR.T0,0),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 for(const [t,o] of [[NR.T1,a],[NR.T0,b]]){const dx=mid[0]-o[0],dz=mid[1]-o[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  const ry=Math.atan2(ux,uz),lift=72*PI/180,Lf=len-1.2;
  WX(o[0]+ux*.3,L.TOP-.2,o[1]+uz*.3,ry,-lift,0,()=>{   // local +z along the leaf, tilted up about local x
   box('paint',0,-.9,Lf/2,14,1.1,Lf,hc(0x7a8288));box('deck',0,.2,Lf/2,13.4,.12,Lf,hc(0xbfb8a8));
   for(const sx of [-6.8,6.8]){box('paint',sx,.32,Lf/2,.14,1.0,Lf,hc(0x7a8288));for(let z=1;z<Lf;z+=2.2)box('paint',sx,.32,z,.1,1,.1,hc(0x7a8288));}
   box('rust',0,-1.6,1.5,10,1.2,3,WHITE);});   // the counterweight housing at the heel
  for(const s of [-8,8]){const p=NR.at(t,s);cyl('white',p[0],L.TOP,p[1],1.1,5.5,P('white'),14,.9);}}}
nrPart('shell',nrHullShell);
