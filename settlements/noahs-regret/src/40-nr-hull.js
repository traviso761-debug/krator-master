// prefix: nr
// ================================================================= THE HULL: ring primitives, the pontoon, the decks' slabs, the skins, the mouth
// Everything here draws in the HULL frame (the arcology def pushes NR_HULL before calling it): x, z from NR.at(t, s), y up
// from the keel. Bands along the ring are psurf sheets (30-geo.js), so they follow the ring's curve exactly and carry arc-length
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
 /* the double-height rooms (a zone on decks d-1 and d has no floor at d: the engine rooms, the dining room), and the
    greenhouse's glass roof (no top-deck slab over it) */
 for(const Z of NR.ZONES){if(Z.kind==='atrium')continue;
  if((d<4&&Z.decks.indexOf(d-1)>=0&&Z.decks.indexOf(d)>=0)||(d===4&&Z.roof==='glass'&&Z.decks.indexOf(3)>=0))H.push({t0:Z.t0,t1:Z.t1,s0:Z.s0,s1:Z.s1});}
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
  /* above the boot-top the outboard side flares out (NR_FLARE at the gunwale), a dark rubbing strake along it; the inner
     quay's wall stays plumb */
  if(side>0){nrLoft('white',T0,T1,[[S,6.95],[S+.3,8.0],[S+NR_FLARE,9.0]],P('whiteS'),side);
   nrLoft('paint',T0,T1,[[S+.38,7.55],[S+.62,7.65],[S+.64,7.95],[S+.42,8.05]],hc(0x2c3034),side);}
  else nrLoft('white',T0,T1,[[S,6.95],[S,9.0]],P('whiteS'),side);
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
  /* the balconies of D3 and D4 swell out between the frames (scalloped fronts, nrScallop) under a rounded parapet ribbon;
     the top deck's parapet is a rounded rail. Lofted along the whole hull. */
  for(let d=2;d<4;d++)nrBalconyFront(side,L.D[d]);
  nrLoftS('white',T0,T1,side,()=>W.MAIN,L.TOP,NR_PARAPET_PROF,P('white'));}
 // the ledge kerbs: the outer promenade's rail, the inner quay's kerb and bollards
 for(const side of [1,-1]){const S=W.PONT*side;
  nrBand('white',T0,T1,side>0?S-.35:S,side>0?S+NR_FLARE:S+.35,L.D[0],L.D[0]+.3,P('white'),'oit');
  if(side>0){/* the rail along the outer promenade, open where the pirates' steps go down to the beach (62); round the bow
   the forecastle's bulwark takes over (nrForecastle) */
   const gaps=NR.STEPS.map(q=>[q.t-1.4,q.t+1.4]).concat([[-NR.FORE.t,NR.FORE.t]]).sort((a,b)=>a[0]-b[0]);let c=T0;
   for(const g of gaps.concat([[T1,T1]])){if(g[0]>c){nrBand('paint',c,g[0],S-.2,S-.14,L.D[0]+.98,L.D[0]+1.05,hc(0x6a7076),'oitbse');
     for(let t=c+.6;t<g[0]-.2;t+=2.4)nrBox('paint',t,S-.17,L.D[0]+.3,.06,.7,.06,hc(0x6a7076));}c=g[1];}}
  else for(let t=T0+6;t<T1-4;t+=14){nrCyl('paint',t,S+.7,L.D[0],.32,.75,hc(0x3a3c3e),12,.26);nrCyl('paint',t,S+.7,L.D[0]+.75,.42,.12,hc(0x3a3c3e),12);}}
 // the main block's end walls at the mouth, and the pontoon's round pier heads beyond them
 for(const [t,dir] of [[T0,-1],[T1,1]]){
  for(let d=0;d<4;d++){const y=L.D[d];
   nrRadial('white',t,-W.MAIN,W.MAIN,y,y+.95,.3,P('white'));nrRadial('glass',t+dir*.06,-W.MAIN+1,W.MAIN-1,y+.95,y+2.75,.12,hc(0x24343c));
   nrRadial('white',t,-W.MAIN,W.MAIN,y+2.75,y+L.DH,.3,P('white'));for(let s=-W.MAIN+1;s<=W.MAIN-1;s+=4.2)nrBox('white',t,s,y+.95,.36,1.8,.22,P('white'));}
  /* the top deck's parapet across the end, where the stern's terraces (narrower) leave the deck's edge open */
  for(const sg of [1,-1])nrRadial('white',t,sg>0?NR_STERN.top:-W.MAIN,sg>0?W.MAIN:-NR_STERN.top,L.TOP,L.TOP+L.PARAPET,.3,P('white'));
  /* the holds' end bulkhead */
  nrRadial('cracked',t-dir*.25,-W.SKIN,W.SKIN,L.HOLD,L.D[0]-L.SLAB,.3,hc(0x8a857a));
  nrStern(t,dir);}
 for(const B of NR.BEACONS)nrBeacon(B.x,L.D[0],B.z);
 nrForecastle();}
// ---------------------------------------------------------------- the rounded fronts: scalloped balconies, rounded rails
/* the balconies' bulge outboard of the slab's edge at t: nothing on a frame, NR_SCALLOP at the middle of a bay */
const NR_SCALLOP=.65;
function nrScallop(t){const f=(t-NR.T0-6)/NR.DT;return NR_SCALLOP*Math.pow(Math.sin(PI*f),2);}
/* section profiles [ds, dy] from a line at (s, y): ds outboard (+), the rail's inside first, over the top, down the outside */
const NR_RIBBON_PROF=[[-.12,.02],[-.14,.9],[-.06,1.04],[.08,1.07],[.18,.96],[.22,.6],[.22,-.05],[.18,-.32],[.06,-.42],[-.12,-.42]];
const NR_PARAPET_PROF=[[-.32,0],[-.32,.88],[-.24,1.08],[-.06,1.18],[.12,1.12],[.22,.9],[.26,.5],[.26,-.4]];
/* a profile lofted along a side of the hull (side +1 outboard, -1 inboard), its line at s = side * sOf(t), height y */
function nrLoftS(mk,t0,t1,side,sOf,y,prof,col){const n=Math.ceil((t1-t0)/.6),m=prof.length-1;
 psurf(mk,(u,v)=>{const t=lerp(t0,t1,u),q=v*m,j=Math.min(m-1,Math.floor(q)),f=q-j,ds=lerp(prof[j][0],prof[j+1][0],f),dy=lerp(prof[j][1],prof[j+1][1],f);
  return nrP(t,side*(sOf(t)+ds),y+dy);},n,m,col,{flip:side<0});}
/* a balcony front on deck y: the floor and soffit out to the scallop, the rounded ribbon on its edge */
function nrBalconyFront(side,y){const L=NR.L,W=NR.W,T0=NR.T0,T1=NR.T1,n=Math.ceil((T1-T0)/.6);
 psurf('deck',(u,v)=>{const t=lerp(T0,T1,u);return nrP(t,side*(W.MAIN-.02+v*(nrScallop(t)+.03)),y);},n,1,hc(0xd6d0c2),{up:true});
 psurf('plaster',(u,v)=>{const t=lerp(T0,T1,u);return nrP(t,side*(W.MAIN-.02+v*(nrScallop(t)+.03)),y-L.SLAB);},n,1,hc(0xe4ded2),{flip:side>0});
 nrLoftS('white',T0,T1,side,t=>W.MAIN+nrScallop(t),y,NR_RIBBON_PROF,P('white'));}
// ---------------------------------------------------------------- the sterns: rounded, stepping back in terraces
/* Each hull ends in a half-round beyond its last frame (t, dir: +1 beyond T1, -1 before T0), swept about the hull's
   centreline: the pontoon (antifouling, the barnacle band, the flared white strake) round to its full width; above it the
   D1-D2 shell glazed at radius 20; then terraces stepping in, each with its rounded rail: D3 out to 20 with its glass at
   NR_STERN.d3, D4 out to that with its glass at NR_STERN.d4, the top deck out to that with its rail. Under the stern the
   twin screws and rudders, out of the water now (she lies trimmed by the bow). The decks inside the half-rounds are
   empty galleries behind the end walls. */
const NR_STERN={d3:17.5,d4:15,top:15};
function nrStern(t,dir){const L=NR.L,W=NR.W,c=NR.at(t,0),T=NR.tan(t),ax=dir*T[0],az=dir*T[1],aA=Math.atan2(az,ax),a0=aA-PI/2,a1=aA+PI/2,seg=40;
 const lw=(mk,prof,col,o)=>lathe(mk,c[0],c[1],prof,seg,col,Object.assign({a0,a1},o||{}));
 const R=W.PONT,F=R+NR_FLARE;
 /* the pontoon */
 lw('paint',[[R-3.4,0],[R-1.6,.35],[R-.55,1.2],[R,2.6],[R,5.6]],hc(NR_ANTIFOUL));lw('barn',[[R+.02,5.6],[R+.02,7.0]],WHITE);
 lw('white',[[R,6.95],[R+.3,8.0],[F,9.0]],P('whiteS'));lw('paint',[[R+.38,7.55],[R+.62,7.65],[R+.64,7.95],[R+.42,8.05]],hc(0x2c3034));
 lw('paint',[[R-3.4,0],[.01,0]],hc(NR_ANTIFOUL),{flip:true});
 lw('deck',[[.01,L.D[0]],[F,L.D[0]]],hc(0xcfc9bb));
 lw('white',[[F-.35,L.D[0]],[F-.35,L.D[0]+.3],[F+.02,L.D[0]+.3],[F+.02,L.D[0]]],P('white'));
 /* D1, D2: the glazed shell at radius 20, sill, glass, head, mullions; the D2 floor inside */
 const mull=(r,y0,y1)=>{for(let k=1;k<12;k++){const a=a0+(a1-a0)*k/12;box('white',c[0]+Math.cos(a)*r,y0,c[1]+Math.sin(a)*r,.18,y1-y0,.22,P('white'),-a);}};
 for(let d=0;d<2;d++){const y=L.D[d];lw('white',[[W.MAIN,y],[W.MAIN,y+.95]],P('white'));lw('glass',[[W.MAIN-.08,y+.95],[W.MAIN-.08,y+2.75]],hc(0x24343c));
  lw('white',[[W.MAIN,y+2.75],[W.MAIN,y+L.DH-L.SLAB]],P('white'));mull(W.MAIN,y+.95,y+2.75);}
 lw('conc',[[.01,L.D[1]],[W.MAIN,L.D[1]]],P('conc'));lw('plaster',[[W.MAIN,L.D[1]-L.SLAB],[.01,L.D[1]-L.SLAB]],hc(0xe4ded2),{flip:true});
 /* the terraces: D3 (floor to 20, glass at d3), D4 (floor to d3, glass at d4), the top deck (to d4) */
 const ter=[[L.D[2],W.MAIN,NR_STERN.d3],[L.D[3],NR_STERN.d3,NR_STERN.d4]];
 for(const [y,rf,rg] of ter){lw('deck',[[.01,y],[rf,y]],hc(0xd6d0c2));lw('plaster',[[rf,y-L.SLAB],[.01,y-L.SLAB]],hc(0xe4ded2),{flip:true});
  lw('white',NR_RIBBON_PROF.map(([ds,dy])=>[rf+ds,y+dy]),P('white'));
  lw('glass',[[rg,y],[rg,y+L.CLEAR]],hc(0x6a8a98));mull(rg,y,y+L.CLEAR);lw('white',[[rg+.12,y+L.CLEAR-.18],[rg+.12,y+L.CLEAR]],P('white'));}
 lw('deck',[[.01,L.TOP],[NR_STERN.top,L.TOP]],hc(0xd6d0c2));lw('plaster',[[NR_STERN.top,L.TOP-L.SLAB],[.01,L.TOP-L.SLAB]],hc(0xe4ded2),{flip:true});
 lw('white',NR_PARAPET_PROF.map(([ds,dy])=>[NR_STERN.top+ds,L.TOP+dy]),P('white'));
 /* the screws (four blades on a hub, bronze gone green) on their shafts out of the hull, the rudders behind them */
 const ry=Math.atan2(ax,az);
 for(const s of [-12,12]){const u=Math.sqrt(R*R-s*s),at=k=>NR.at(t+dir*k,s),hubP=at(u+2.2),sh=at(u-3);
  beam('paint',[sh[0],2.8,sh[1]],[hubP[0],2.8,hubP[1]],.35,hc(0x4a5048),true,10);
  W(hubP[0],2.8,hubP[1],ry,()=>{sph('brass',0,0,0,.75,hc(0x5a7a5c),1.4,12);
   for(let k=0;k<4;k++){const a=k/4*TAU+.4;box('brass',Math.cos(a)*1.45,Math.sin(a)*1.45-.4,0,.9,.8,.12,hc(0x5a7a5c),.3,0,a);}});
  const r0=at(u+5.2);W(r0[0],0,r0[1],ry,()=>{box('paint',0,.6,0,.5,5.4,3.2,hc(NR_ANTIFOUL));box('paint',0,6,-.6,.3,1.6,.3,hc(0x4a5048));});}}
/* the beacon: a slim Ancient lantern tower (on the breakwater piers' heads, 41-nr-piers.js), base at hull (x, y, z) */
function nrBeacon(x,y,z){cyl('white',x,y,z,2.4,12,P('white'),20,1.8);cyl('white',x,y+12,z,2.6,.5,P('white'),20);
 cyl('glass',x,y+12.5,z,1.6,2.4,hc(0x8aa0a8),16);sph('white',x,y+14.9,z,1.9,P('white'),.55,16);
 cyl('white',x,y+15.6,z,.12,4.5,P('white'),6,.05);
 for(let i=0;i<8;i++){const a=i/8*TAU;beam('white',[x+Math.cos(a)*1.65,y+12.5,z+Math.sin(a)*1.65],[x+Math.cos(a)*1.65,y+14.9,z+Math.sin(a)*1.65],.1,P('white'));}}
// ---------------------------------------------------------------- the bow: the forecastle, the stem, the anchors
// Round the bow (|t| < FORE.t) the outboard skin rises past the promenade to a bulwark that follows the sheer (NR.foreY +
// the bulwark), flaring a little more as it rises; inside it the promenade becomes a deck climbing to the D3 floor at the
// stem. A raked cutwater stands proud of the bow's curve from the forefoot to the bulwark. Two anchors hang in their hawses.
const NR_FLARE=.7;
function nrForeS(y){return NR.W.PONT+NR_FLARE+Math.max(0,y-NR.L.D[0])*.14;}   /* the outboard skin's s at height y, forward */
function nrForecastle(){const L=NR.L,WD=NR.W,F=NR.FORE,n=Math.ceil(2*F.t/1.6);
 const top=t=>NR.foreY(t)+F.bulwark;
 /* the skin above the gunwale, outside; the bulwark's inner face; its cap */
 psurf('white',(u,v)=>{const t=lerp(-F.t,F.t,u),y=lerp(L.D[0],top(t),v);return nrP(t,nrForeS(y),y);},n,4,P('whiteS'),{flip:true});
 psurf('white',(u,v)=>{const t=lerp(-F.t,F.t,u),y=lerp(NR.foreY(t),top(t),v);return nrP(t,nrForeS(y)-.3,y);},n,1,P('white'));
 psurf('white',(u,v)=>{const t=lerp(-F.t,F.t,u),y=top(t);return nrP(t,lerp(nrForeS(y)-.3,nrForeS(y)+.02,v),y);},n,1,P('white'),{up:true});
 /* the deck: from the main block's wall to the bulwark, at the sheer */
 psurf('deck',(u,v)=>{const t=lerp(-F.t,F.t,u),y=NR.foreY(t);return nrP(t,lerp(WD.MAIN,nrForeS(y)-.3,v),y+.005);},n,2,hc(0xcfc9bb),{up:true});
 /* a white rail along the bulwark's cap, and the bow's jack staff */
 for(let t=-F.t+1;t<F.t;t+=2.6){const y=top(t);nrBox('paint',t,nrForeS(y)-.15,y,.06,.5,.06,hc(0x6a7076));}
 {const y=NR.foreY(0),p=nrP(0,nrForeS(y)-1.2,y);cyl('white',p[0],y,p[2],.09,8,P('white'),6,.06);}
 /* the cutwater: two faces from the skin to a raked stem edge, antifouling below the old waterline, white above */
 const yT=top(0),SW=.2,ext=y=>.6+6.4*Math.pow(clamp(y/yT,0,1),1.4),half=y=>2.2+.55*ext(y);
 const skinS=y=>y<2.6?WD.PONT-3.4+3.4*Math.sqrt(y/2.6):y<6.95?WD.PONT:y<L.D[0]?WD.PONT+NR_FLARE*(y-6.95)/2.05:nrForeS(y);
 for(const sg of [1,-1])for(const [mk,y0,y1,col] of [['paint',.6,5.6,hc(NR_ANTIFOUL)],['barn',5.6,7.0,WHITE],['white',7.0,yT,P('whiteS')]]){
  psurf(mk,(u,v)=>{const y=lerp(y0,y1,v),a=NR.at(sg*half(y),skinS(y)),b=NR.at(sg*SW,skinS(y)+ext(y));return [lerp(a[0],b[0],u),y,lerp(a[1],b[1],u)];},2,6,col,{flip:sg<0});}
 /* the stem's face: a narrow strip along the raked edge (a knife edge would leave its normals undefined, and black) */
 for(const [mk,y0,y1,col] of [['paint',.6,5.6,hc(NR_ANTIFOUL)],['barn',5.6,7.0,WHITE],['white',7.0,yT,P('whiteS')]])
  psurf(mk,(u,v)=>{const y=lerp(y0,y1,v),b=NR.at(lerp(-SW,SW,u),skinS(y)+ext(y));return [b[0],y,b[1]];},1,6,col,{flip:true});
 psurf('white',(u,v)=>{const y=yT,k=lerp(-1,1,u),a=NR.at(k*half(y),skinS(y)-.3),b=NR.at(k*SW,skinS(y)+ext(y));return [lerp(a[0],b[0],v),y,lerp(a[1],b[1],v)];},2,2,P('white'),{up:true});
 /* the anchors: a dark hawse plate, the anchor drawn up in it, its chain run down to the sea floor (it was let go when she
    struck) */
 for(const sg of [1,-1]){const t=sg*15,y=NR.foreY(t)-2.4,sk=nrForeS(Math.max(y,L.D[0]))+.05,c=NR.at(t,sk),n=NR.nrm(t),ry=Math.atan2(n[0],n[1]);
  box('dark',c[0],y-1.6,c[1],3.2,3.2,.12,hc(0x1c1e20),ry);
  W(c[0]+n[0]*.35,y,c[1]+n[1]*.35,ry,()=>{box('rust',0,-3.2,0,.35,3.0,.35,hc(0x5a3a28));box('rust',0,-3.4,0,2.6,.4,.4,hc(0x5a3a28));
   for(const k of [-1,1])box('rust',k*1.25,-3.4,0,.45,.9,.4,hc(0x5a3a28),0,0,k*.5);});
  const a=[c[0]+n[0]*.4,y-.3,c[1]+n[1]*.4],T=NR.tan(t),b=[a[0]+n[0]*7+T[0]*sg*3,-1.5,a[2]+n[1]*7+T[1]*sg*3];
  for(let i=0;i<18;i++){const f0=i/18,f1=(i+1)/18,p=f=>[lerp(a[0],b[0],f),lerp(a[1],b[1],f)-2.2*Math.sin(PI*f),lerp(a[2],b[2],f)];beam('rust',p(f0),p(f1),.16,hc(0x4a3424));}}}
nrPart('shell',nrHullShell);
