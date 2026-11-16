// ================================================================= XANADU — Erewhon's citadel: the hollow palaces (2026-11-09)
// Everything inside the citadel wall but the two Pleasure Domes, room by room on the blueprint (settlements/xanadu/citadel/
// BLUEPRINT.md, citadel_blueprint.py; enlarged inside the wall as the blueprint decided) and dressed in the owner's style
// (refs/citadel/STYLE.md: Moorish and Mughal, psychedelic in its own way). The rooms, doors, stairs and the Ramp of the Sultan
// are data in the interior set kits/interiors/sets/xanadu-citadel.js (one home: the furnisher and core/walk read the same
// items); xcPlan() draws a building from its item:
//   walls      every room edge once (two rooms that share an edge share one wall), 0.6 m outside and 0.3 m between rooms,
//              cut at the doors and the windows; each room's faces skinned in its style (XC_STYLE: a dado and the field
//              above it, a band under the ceiling): Mughal red sandstone under pietra dura, Moorish zellige under yeseria,
//              the arcades' haft-rangi, the private halls' rainbow bands, the Golden Way's black, white and gold
//   openings   every door an arch (cusped for the state, horseshoe for the courts, pointed for the iwans and arcades: the
//              heads are modelled, 78m), a leaf in core/door's KDOOR where the door is not an opening (UNLOCKED: the rooms
//              are real), a threshold in core/walk; the windows arched, a jali card in front of clear glass (KGLASS's pane)
//   floors     a plinth under the ground storey, a slab under every upper room that no room below carries, cut round the
//              flights' wells; the finish in the style (marble, zellige, pietra dura)
//   ceilings   the slab over every roofed room, cut where a flight passes, and its ornament: 'star' (a star-polygon ceiling,
//              gilt on lapis, red ribs), 'banded' (a painted pointed barrel and its gilt ribs), 'tiled' (a haft-rangi barrel),
//              'muq' (a muqarnas cornice under a gilt ceiling), 'flat' (painted beams)
//   courts     zellige and marble paving, the fountains, pools and rills on the axis, porticoes of paired columns
//   stairs     steps of at most 0.19 m and the Ramp's sloped runs, each a strip in core/walk
// Each building's massing is its own builder: the Sultan's palace keeps the kit's look (the battered curtain and towers, the
// gate iwan, the white base and the ochre block under twin turquoise domes) in marble and red sandstone; the Vizier's keeps
// his cobalt loggias and pool garden; the houses are Moorish dars. Seeds 33000-33099.
//   xcItem(key)      the set item (null when the interiors bundle is missing: the builder then draws the massing only)
//   window._citadel  {buildings, rooms, walls, doors, windows, stairs, cells, stars, vaults}
const XC_STYLE={
 mughal: {rank:5,dado:'xmSand',up:'xmPietra',band:'xmGold',bandC:XM_C.gold,head:['cusped','MarW','Gold'],floor:'xmMarW',win:'jali'},
 banded: {rank:4,dado:'xmZel',up:'xmBand',band:'xmGold',bandC:XM_C.gold,head:['pointed','Band','Gold'],floor:'xmPietra',win:'jali'},
 iwan:   {rank:3.5,dado:'xmSand',dadoC:XM_C.sand,up:'xmHaft',band:'xmBand',head:['pointed','Haft','Band'],floor:'xmMarW',win:'glass'},
 arcade: {rank:3,dado:'xmSand',dadoC:XM_C.sand,up:'xmHaft',band:'xmSand',bandC:XM_C.sand,head:['pointed','Haft','Sand'],floor:'xmMarW',win:'glass'},
 gold:   {rank:2.5,dado:'xmMarK',up:'xmMarW',band:'xmGold',bandC:XM_C.gold,head:['cusped','MarK','Gold'],floor:'xmMarK',win:'jali'},
 moorish:{rank:2,dado:'xmZel',up:'xmYes',upC:XM_C.ochre,band:'xmBand',head:['horseshoe','Yes','Band'],floor:'xmZel',win:'glass'},
 plain:  {rank:0,dado:null,up:null,band:null,head:['pointed','Wash',null],floor:'vStone',win:'glass'}};
window._citadel={buildings:0,rooms:0,walls:0,doors:0,windows:0,stairs:0,cells:0,stars:0,vaults:0};
// every citadel def has ONE variant (nv:1): its builder draws the blueprint and reads no o.v, so a sheet's variants were copies
function xcItem(key){return typeof KratorInteriors!=='undefined'&&KratorInteriors.sets?KratorInteriors.sets.find(key):null;}
const xcBox=r=>{const xs=r.poly.map(p=>p[0]),zs=r.poly.map(p=>p[1]);return[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];};
// a rectangle less rectangular holes, as boxes: cb(x0, x1, z0, z1) for every cell of the grid the holes cut that is not in one
function xcRectFill(R,holes,cb){const xs=new Set([R[0],R[1]]),zs=new Set([R[2],R[3]]);for(const H of holes){for(const v of[H[0],H[1]])if(v>R[0]&&v<R[1])xs.add(v);for(const v of[H[2],H[3]])if(v>R[2]&&v<R[3])zs.add(v);}
 const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
 for(let i=0;i+1<X.length;i++){let run=null;const xm=(X[i]+X[i+1])/2;
  for(let j=0;j+1<Z.length;j++){const zm=(Z[j]+Z[j+1])/2,inH=holes.some(H=>xm>H[0]&&xm<H[1]&&zm>H[2]&&zm<H[3]);if(!inH&&run===null)run=Z[j];if(inH&&run!==null){cb(X[i],X[i+1],run,Z[j]);run=null;}}
  if(run!==null)cb(X[i],X[i+1],run,Z[Z.length-1]);}}
// the world point of a local one as core/walk takes it ([x, z, y])
const xcW=(x,z,y)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};

// ---------------------------------------------------------------- the plan drawer
// o: {ext: {core, coreC, dado, dadoC, band, bandC} the outer faces, partC (the partitions' core), wallT (.6), partT (.3)}
function xcPlan(it,o){o=o||{};const S=window._citadel,R=it.rooms,out={walls:0,doors:0,windows:0},kd0=typeof KDOOR!=='undefined'?KDOOR.list.length:0;S.buildings++;S.rooms+=R.length;
 const TE=(o.wallT==null?.6:o.wallT),TP=(o.partT==null?.3:o.partT),ext=o.ext||{core:'xWashB',coreC:xC(XPAL.wash[1])},partC=o.partC||xC(0xe8dcc8),SL=.35;
 const st=r=>XC_STYLE[r.style]||XC_STYLE.plain,isCourt=r=>r.ceil==='open';
 const B=new Map();for(const r of R)B.set(r,xcBox(r));
 // a room on the other side of an edge, at a point a little past it, overlapping [y0, y1]
 const across=(x,z,y0,y1,self)=>R.find(q=>q!==self&&!isCourt(q)&&(()=>{const b=B.get(q);return x>b[0]&&x<b[1]&&z>b[2]&&z<b[3]&&q.y<y1-.3&&q.y+q.h>y0+.3;})());
 const roomById=id=>R.find(q=>q.id===id||('.'+q.id)===id||String(id).endsWith('.'+q.id));
 // ---- the edges of every room (axis-aligned), with which side the room is on
 const edges=[];for(const r of R){const P=r.poly;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if(Math.abs(a[0]-b[0])<1e-6&&Math.abs(a[1]-b[1])<1e-6)continue;
  const axis=Math.abs(a[1]-b[1])<1e-6?'z':'x',c=axis==='z'?a[1]:a[0],u0=Math.min(axis==='z'?a[0]:a[1],axis==='z'?b[0]:b[1]),u1=Math.max(axis==='z'?a[0]:a[1],axis==='z'?b[0]:b[1]);
  const bx=B.get(r),side=axis==='z'?(Math.abs(c-bx[2])<1e-6?1:-1):(Math.abs(c-bx[0])<1e-6?1:-1);   // +1: the room lies on the + side of the line
  const nm=axis==='z'?(side>0?'z0':'z1'):(side>0?'x0':'x1');edges.push({r,axis,c,u0,u1,side,rail:(r.rail||[]).includes(nm)});}}
 const keyOf=(axis,c)=>axis+(Math.round(c*20)/20);
 // ---- the openings, per wall line: doors (once each) and windows
 const ops=new Map(),addOp=(axis,c,q)=>{const k=keyOf(axis,c);(ops.get(k)||ops.set(k,[]).get(k)).push(q);};
 const doors=[];for(const r of R)for(const d of r.doors||[]){if(doors.some(q=>Math.hypot(q.d.at[0]-d.at[0],q.d.at[1]-d.at[1])<.3&&Math.abs(q.y-r.y)<.5))continue;
  const E=edges.filter(e=>e.r===r).map(e=>({e,dd:Math.abs((e.axis==='z'?d.at[1]:d.at[0])-e.c)+((e.axis==='z'?d.at[0]:d.at[1])<e.u0-.01||(e.axis==='z'?d.at[0]:d.at[1])>e.u1+.01?9:0)})).sort((a,b)=>a.dd-b.dd)[0];
  if(!E)continue;const other=d.to&&d.to!=='street'?roomById(d.to.replace(/^.*\./,'')):null,s1=st(r),s2=other?st(other):s1,S2=(s2.rank>s1.rank&&other&&!isCourt(other))?s2:s1;
  const hr=Math.min(r.h,other?other.h:r.h),w=d.w,Hd=d.head?hr:Math.min(d.h||Math.min(2.3+w*.55,hr-.4),hr-.25),P=Math.min(w*.8,Math.max(.5,Hd-2.05))/.86,s=Hd-P*.86;
  doors.push({d,r,other,axis:E.e.axis,c:E.e.c,u:E.e.axis==='z'?d.at[0]:d.at[1],y:r.y,w,s,P,Hd,style:S2,side:E.e.side});
  addOp(E.e.axis,E.e.c,{u0:(E.e.axis==='z'?d.at[0]:d.at[1])-w/2,u1:(E.e.axis==='z'?d.at[0]:d.at[1])+w/2,y0:r.y,y1:d.head?r.y+hr+SL:r.y+s+P*(d.head?0:1),door:true});}
 // windows: on a roofed room's edge with no room behind it (a court counts as outside), every ~4 m, clear of doors and corners
 const wins=[];for(const e of edges){const r=e.r;if(isCourt(r)||r.kind==='ramp'||e.rail||r.h<3||r.style==='plain'&&r.kind==='store')continue;
  const L=e.u1-e.u0,n=Math.floor((L-2)/4.2);if(n<1)continue;
  for(let i=0;i<n;i++){const u=e.u0+L*(i+.5)/n,px=e.axis==='z'?u:e.c-e.side*.7,pz=e.axis==='z'?e.c-e.side*.7:u;
   if(across(px,pz,r.y,r.y+r.h,r))continue;if((ops.get(keyOf(e.axis,e.c))||[]).some(q=>q.u1>u-1.6&&q.u0<u+1.6&&q.y0<r.y+r.h&&q.y1>r.y))continue;
   const ww=r.h>5?1.6:1.2,sill=r.y+(r.h>5?1.4:1.0),top=Math.min(r.y+r.h-.9,sill+(r.h>5?3.0:1.7)),P=Math.min(ww*.9,r.y+r.h-.25-top)/.86;if(P<.35)continue;
   wins.push({e,u,ww,sill,top,P,style:st(r)});addOp(e.axis,e.c,{u0:u-ww/2,u1:u+ww/2,y0:sill,y1:top+P});}}
 // ---- the core walls: per line, the rooms' edges as rectangles in (u, y), less the openings; thickness by the outer side
 const lines=new Map();for(const e of edges){if(isCourt(e.r)||e.rail)continue;const r=e.r,k=keyOf(e.axis,e.c);
  const px=e.axis==='z'?(e.u0+e.u1)/2:e.c-e.side*.7,pz=e.axis==='z'?e.c-e.side*.7:(e.u0+e.u1)/2,outer=!across(px,pz,r.y,r.y+r.h,r);
  const top=r.kind==='ramp'?r.y+r.h:r.y+r.h+SL;(lines.get(k)||lines.set(k,{axis:e.axis,c:e.c,rs:[]}).get(k)).rs.push([e.u0,e.u1,r.y-(r.y<1.2?r.y:0),top,outer,r]);}
 for(const [k,Ln] of lines){const O=ops.get(k)||[],us=new Set(),ys=new Set();
  for(const q of Ln.rs){us.add(+q[0].toFixed(3));us.add(+q[1].toFixed(3));ys.add(+q[2].toFixed(3));ys.add(+q[3].toFixed(3));}
  for(const q of O){us.add(+q.u0.toFixed(3));us.add(+q.u1.toFixed(3));ys.add(+q.y0.toFixed(3));ys.add(+q.y1.toFixed(3));}
  const U=[...us].sort((a,b)=>a-b),Y=[...ys].sort((a,b)=>a-b);
  for(let j=0;j+1<Y.length;j++){const ym=(Y[j]+Y[j+1])/2;let run=null,runOut=false;
   // an outer run reaches over the corner (half the wall's thickness) where it ends at the line's end, not at an opening
   const isOpU=u=>O.some(q=>Math.abs(q.u0-u)<1e-3||Math.abs(q.u1-u)<1e-3);
   const end=u1=>{if(run!==null&&u1-run>.02){const h=Y[j+1]-Y[j],t=runOut?TE:TP,it2=runOut?ext.core:'vPlaster',c=runOut?ext.coreC:partC,e0=runOut&&!isOpU(run)?TE/2:0,e1=runOut&&!isOpU(u1)?TE/2:0,a=run-e0,b=u1+e1,m=(a+b)/2;
     if(Ln.axis==='z')vB(it2,m,Y[j],Ln.c,b-a,h,t,0,c);else vB(it2,Ln.c,Y[j],m,t,h,b-a,0,c);out.walls++;}run=null;runOut=false;};
   for(let i=0;i+1<U.length;i++){const um=(U[i]+U[i+1])/2,cov=Ln.rs.filter(q=>um>q[0]&&um<q[1]&&ym>q[2]&&ym<q[3]),on=cov.length&&!O.some(q=>um>q.u0&&um<q.u1&&ym>q.y0&&ym<q.y1);
    const isOut=on&&cov.every(q=>q[4]);if(on&&run!==null&&isOut!==runOut)end(U[i]);if(on&&run===null){run=U[i];runOut=isOut;}if(!on)end(U[i]);}
   end(U[U.length-1]);}}
 // ---- the skins: each room's own faces in its style, the court's on the buildings round it
 const skin=(e,item,c,y0,y1,u0,u1,off)=>{if(!item||y1-y0<.04||u1-u0<.04)return;const m=(u0+u1)/2,d=e.side*off;
  if(e.axis==='z')vB(item,m,y0,e.c+d,u1-u0,y1-y0,.05,0,c||null);else vB(item,e.c+d,y0,m,.05,y1-y0,u1-u0,0,c||null);};
 for(const e of edges){const r=e.r,s=st(r);if(e.rail||!s.up&&!s.dado||r.kind==='ramp'&&false)continue;
  let H=r.h;if(isCourt(r)){H=0;for(const q of R)if(q!==r&&!isCourt(q)&&q.y<r.y+2){const b=B.get(q);const onL=e.axis==='z'?Math.abs(b[2]-e.c)<.05||Math.abs(b[3]-e.c)<.05:Math.abs(b[0]-e.c)<.05||Math.abs(b[1]-e.c)<.05;
    const ov=e.axis==='z'?Math.min(b[1],e.u1)-Math.max(b[0],e.u0):Math.min(b[3],e.u1)-Math.max(b[2],e.u0);if(onL&&ov>.5){let top=q.y+q.h;for(const q2 of R)if(q2.y>q.y+1&&!isCourt(q2)){const b2=B.get(q2);const on2=e.axis==='z'?Math.abs(b2[2]-e.c)<.05||Math.abs(b2[3]-e.c)<.05:Math.abs(b2[0]-e.c)<.05||Math.abs(b2[1]-e.c)<.05;if(on2)top=Math.max(top,q2.y+q2.h);}H=Math.max(H,top-r.y);}}
   if(H<=0)continue;}
  const outerE=isCourt(r)||!across(e.axis==='z'?(e.u0+e.u1)/2:e.c-e.side*.7,e.axis==='z'?e.c-e.side*.7:(e.u0+e.u1)/2,r.y,r.y+r.h,r);
  const off=(outerE?(TE/2):(TP/2))+.03,O=(ops.get(keyOf(e.axis,e.c))||[]).filter(q=>q.u1>e.u0&&q.u0<e.u1&&q.y1>r.y&&q.y0<r.y+H).sort((a,b)=>a.u0-b.u0);
  const dadoTop=r.y+1.15,y1=r.y+H,bandY=y1-.32;
  const full=(u0,u1,ya,yb)=>{skin(e,s.dado,s.dadoC,Math.max(ya,r.y),Math.min(yb,dadoTop),u0,u1,off);skin(e,s.up,s.upC,Math.max(ya,dadoTop),Math.min(yb,s.band?bandY:y1),u0,u1,off);
   if(s.band)skin(e,s.band,s.bandC,Math.max(ya,bandY),Math.min(yb,y1),u0,u1,off+.02);};
  let u=e.u0;for(const q of O){const a=Math.max(e.u0,q.u0),b=Math.min(e.u1,q.u1);if(a>u)full(u,a,r.y,y1);if(b>a){full(a,b,r.y,q.y0);full(a,b,q.y1,y1);}u=Math.max(u,b);}
  if(u<e.u1)full(u,e.u1,r.y,y1);}
 // ---- the outer faces: a dado and a band at each floor on every outside edge (o.ext)
 if(ext.dado)for(const e of edges){const r=e.r;if(isCourt(r)||e.rail)continue;const px=e.axis==='z'?(e.u0+e.u1)/2:e.c-e.side*.7,pz=e.axis==='z'?e.c-e.side*.7:(e.u0+e.u1)/2;
  if(across(px,pz,r.y,r.y+r.h,r))continue;const off=-(TE/2+.03),O=(ops.get(keyOf(e.axis,e.c))||[]).filter(q=>q.u1>e.u0&&q.u0<e.u1&&q.y0<r.y+1.4);
  let u=e.u0;const ya=r.y<1.2?0:r.y-SL,yb=r.y<1.2?1.4:r.y;for(const q of O.sort((a,b)=>a.u0-b.u0)){if(q.u0>u)skin(e,ext.dado,ext.dadoC,ya,yb,u,q.u0,off);u=Math.max(u,q.u1);}if(u<e.u1)skin(e,ext.dado,ext.dadoC,ya,yb,u,e.u1,off);
  if(ext.band&&!R.some(q=>q.y>r.y+1&&Math.abs(q.y-(r.y+r.h+SL))<.6&&(()=>{const b=B.get(q);return e.axis==='z'?Math.abs(b[2]-e.c)<.05||Math.abs(b[3]-e.c)<.05:Math.abs(b[0]-e.c)<.05||Math.abs(b[1]-e.c)<.05;})()))
   skin(e,ext.band,ext.bandC,r.y+r.h,r.y+r.h+SL+.25,e.u0-TE/2,e.u1+TE/2,off-.02);}
 // ---- the openings drawn: arch heads, rings, leaves, thresholds; the windows' jali and glass
 for(const D of doors){const d=D.d,ry=D.axis==='z'?0:Math.PI/2,x=D.axis==='z'?D.u:D.c,z=D.axis==='z'?D.c:D.u,t=(D.other&&!isCourt(D.other)&&D.d.to!=='street')?TP:TE;S.doors++;out.doors++;
  if(d.head){const a=D.axis==='z'?[D.u-D.w/2,D.c]:[D.c,D.u-D.w/2],b=D.axis==='z'?[D.u+D.w/2,D.c]:[D.c,D.u+D.w/2];void a;void b;continue;}
  const H=D.style.head;xmArchHead(H[0],x,D.y+D.s,z,ry,D.w,D.P,t+.12,H[1],H[2],H[1]==='Yes'?XM_C.ochre:null);
  if(typeof KWALK!=='undefined'){const n=D.axis==='z'?[0,1]:[1,0];KWALK.strip({a:xcW(x-n[0]*1.1,z-n[1]*1.1,D.y),b:xcW(x+n[0]*1.1,z+n[1]*1.1,D.y),w:Math.max(.6,D.w-.2),name:'citadel door',tag:'interior:xa-citadel'});}
  if(d.open)continue;
  // the leaf faces out of the room that lists the door (the street door's outward)
  const fy=D.axis==='z'?(D.side>0?Math.PI:0):(D.side>0?-Math.PI/2:Math.PI/2),lh=Math.max(1.9,D.s-.04),lc=D.style.rank>=4?xC(0x6a3a1c):xC(XPAL.dark[0]);
  if(D.w>=1.8){for(const s of[-1,1]){const q=loc(x,z,s*D.w/4,0,fy);IZDOOR.leaf(q[0],D.y,q[1],fy,D.w/2-.02,lh,.08,lc,{mirror:s>0,style:'panel'});}}
  else IZDOOR.leaf(x,D.y,z,fy,D.w*.96,lh,.07,lc,{style:'panel'});}
 for(const W of wins){const e=W.e,ry=e.axis==='z'?(e.side>0?Math.PI:0):(e.side>0?-Math.PI/2:Math.PI/2),x=e.axis==='z'?W.u:e.c,z=e.axis==='z'?e.c:W.u,H=W.style.head;S.windows++;out.windows++;
  xmArchHead(H[0],x,W.top,z,ry,W.ww,W.P,TE+.1,H[1],H[2],H[1]==='Yes'?XM_C.ochre:null);
  const m=loc(x,z,0,0,ry);vB('vWinClear',m[0],W.sill,m[1],W.ww,W.top+W.P*.6-W.sill,.03,ry);
  if(W.style.win==='jali'){const q=loc(x,z,0,TE/2-.02,ry);xmJali(q[0],W.sill,q[1],ry,W.ww,W.top-W.sill,{c:null});}
  const sl=loc(x,z,0,TE*.3,ry);vB('xmMarW',sl[0],W.sill-.08,sl[1],W.ww+.2,.08,TE*.7,ry,null);}
 // ---- the floors and the ceilings, cut round the flights' wells
 const wells=(it.stairs||[]).filter(s=>!s.ramp).map(Sx=>{const a=Sx.a,b=Sx.b,f=Math.max(0,(b[2]-a[2]-2.3)/(b[2]-a[2])),p=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],hw=Sx.w/2+.15,vx=Math.abs(b[0]-a[0])<.01;
  return{y:b[2],x0:Math.min(p[0],b[0])-(vx?hw:0)-.05,x1:Math.max(p[0],b[0])+(vx?hw:0)+.05,z0:Math.min(p[1],b[1])-(vx?0:hw)-.05,z1:Math.max(p[1],b[1])+(vx?0:hw)+.05};});
 const holesAt=(y,bx)=>wells.filter(Wl=>Math.abs(Wl.y-y)<.6&&Wl.x1>bx[0]&&Wl.x0<bx[1]&&Wl.z1>bx[2]&&Wl.z0<bx[3]).map(Wl=>[Wl.x0,Wl.x1,Wl.z0,Wl.z1]);
 for(const r of R){const bx=B.get(r),s=st(r),fin=isCourt(r)?null:s.floor;
  if(r.y<1.2){for(const q of xcPolyRects(r.poly)){vB('vStone',(q[0]+q[1])/2,-.4,(q[2]+q[3])/2,q[1]-q[0]+.1,r.y+.4-.03,q[3]-q[2]+.1,0,xC(XPAL.stone[2]));
    if(fin)vB(fin,(q[0]+q[1])/2,r.y-.03,(q[2]+q[3])/2,q[1]-q[0]+.1,.03,q[3]-q[2]+.1,0,fin==='vStone'?xC(XPAL.stone[0]):null);else xcCourtFloor(r,q);}}
  else{const below=R.some(q=>q!==r&&!isCourt(q)&&q.kind!=='ramp'&&Math.abs(q.y+q.h+SL-r.y)<.3&&(()=>{const b=B.get(q);return b[0]<bx[0]+.2&&b[1]>bx[1]-.2&&b[2]<bx[2]+.2&&b[3]>bx[3]-.2;})());
   const H=holesAt(r.y,bx);
   if(!below)xcRectFill([bx[0]-.1,bx[1]+.1,bx[2]-.1,bx[3]+.1],H,(x0,x1,z0,z1)=>vB('vStone',(x0+x1)/2,r.y-SL,(z0+z1)/2,x1-x0,SL-.03,z1-z0,0,xC(XPAL.stone[2])));
   xcRectFill([bx[0],bx[1],bx[2],bx[3]],H,(x0,x1,z0,z1)=>{if(fin)vB(fin,(x0+x1)/2,r.y-.03,(z0+z1)/2,x1-x0,.03,z1-z0,0,fin==='vStone'?xC(XPAL.stone[0]):null);else vB('xmMarW',(x0+x1)/2,r.y-.03,(z0+z1)/2,x1-x0,.03,z1-z0,0,null);});}
  if(isCourt(r)||r.kind==='ramp')continue;
  // the slab over it (the floor of what stands above), less the wells a flight from this room climbs through
  const top=r.y+r.h,H=holesAt(top+SL,bx);xcRectFill([bx[0]-.1,bx[1]+.1,bx[2]-.1,bx[3]+.1],H,(x0,x1,z0,z1)=>vB('vStone',(x0+x1)/2,top,(z0+z1)/2,x1-x0,SL-.03,z1-z0,0,xC(XPAL.stone[2])));
  xcCeiling(r,bx,s,H);}
 // ---- the courts' water and porticoes
 for(const r of R){if(!isCourt(r))continue;const bx=B.get(r);
  for(const Wt of r.water||[]){if(Wt.kind==='pool'){vB('xmMarW',Wt.x,r.y,Wt.z,Wt.w+.8,.3,Wt.d+.8,0,null);vB('xmZel',Wt.x,r.y+.3,Wt.z,Wt.w+.9,.06,Wt.d+.9,0,null);vB('xWaterB',Wt.x,r.y+.08,Wt.z,Wt.w,.24,Wt.d,0,xC(XPAL.water));
    for(let k=0;k<Math.floor(Wt.d/3.5);k++){const zz=Wt.z-Wt.d/2+1.75+k*3.5;vPst('xColS',Wt.x,r.y+.2,zz,.05,.35,xC(XPAL.water));}}
   else if(Wt.kind==='fountain')xmFountain(Wt.x,r.y,Wt.z,Wt.w/2);
   else if(Wt.kind==='rill')xmRill([Wt.x,Wt.z-Wt.d/2],[Wt.x,Wt.z+Wt.d/2],r.y,Wt.w);}
  for(const nm of r.arcade||[]){const ax=nm[0]==='x',c=nm==='x0'?bx[0]:nm==='x1'?bx[1]:nm==='z0'?bx[2]:bx[3],sg=nm[1]==='0'?1:-1,L=ax?bx[3]-bx[2]:bx[1]-bx[0],n=Math.max(2,Math.round(L/3.2)),bw=L/n,ch=3.0,dep=2.4;
   const ry=ax?Math.PI/2:0;
   for(let i=0;i<=n;i++){const u=(ax?bx[2]:bx[0])+bw*i,p=ax?[c+sg*dep,u]:[u,c+sg*dep];if(i>0&&i<n)xmColumnPair(p[0],r.y,p[1],ry,ch,{});}
   for(let i=0;i<n;i++){const u=(ax?bx[2]:bx[0])+bw*(i+.5),p=ax?[c+sg*dep,u]:[u,c+sg*dep];xmArchHead('horseshoe',p[0],r.y+ch+.35,p[1],ry,bw,bw*.95,.5,'Yes','Band',XM_C.ochre);}
   const m=ax?[c+sg*dep/2,(bx[2]+bx[3])/2]:[(bx[0]+bx[1])/2,c+sg*dep/2],hh=r.y+ch+.35+bw*.95;
   vB('xmGilt',m[0],hh,m[1],ax?dep+.5:L,.3,ax?L:dep+.5,0,null);vB('xTilesB',m[0],hh+.3,m[1],ax?dep+.9:L+.4,.18,ax?L+.4:dep+.9,0,xC(0x2f8a5a));}}
 // ---- the flights and the Ramp: solid steps, sloped runs, each a strip in core/walk
 for(const Sx of it.stairs||[]){const a=Sx.a,b=Sx.b,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),rise=b[2]-a[2],ry=Math.atan2(dx,dz);S.stairs++;
  if(Sx.ramp){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],pitch=Math.atan2(rise,L);const q=qEuler(0,ry,0);q.multiply(qEuler(-pitch,0,0));
   kput('xmSand',[m[0],(a[2]+b[2])/2-.2,m[1]],q,[Sx.w,.4,Math.hypot(L,rise)+.02],XM_C.sand);kput('xmZel',[m[0],(a[2]+b[2])/2+.005,m[1]],q,[Sx.w*.3,.02,Math.hypot(L,rise)],null);
   vB('xmSand',b[0],b[2]-.4,b[1],Sx.w,.4,Sx.w,0,XM_C.sand);}
  else{const n=Math.max(2,Math.ceil(rise/.19)),tr=L/n;for(let k=0;k<n;k++){const f=(k+.5)/n;vB(k%2?'xmMarW':'xmSand',a[0]+dx*f,a[2],a[1]+dz*f,Sx.w,rise*(k+1)/n,tr+.01,ry,k%2?null:XM_C.red);}}
  if(typeof KWALK!=='undefined')KWALK.strip({a:xcW(a[0]-dx/L*.3,a[1]-dz/L*.3,a[2]),b:xcW(b[0]+dx/L*.25,b[1]+dz/L*.25,b[2]),w:Math.max(.6,Sx.w-.1),name:(Sx.id||'stair')+(Sx.ramp?' ramp':' flight'),tag:'interior:xa-citadel'});}
 S.walls+=out.walls;
 // the unlocked leaves of a hollow def, declared (as 78d's: the kit sheet's doors check counts them, kits/iziz-vernacular/sheet_verify.py)
 if(typeof KDOOR!=='undefined')window._hollowDoors=(window._hollowDoors|0)+KDOOR.list.slice(kd0).filter(D=>!D.locked).length;
 return out;}
// a court's paving: a zellige field in a marble frame, marble walks on the axes
function xcCourtFloor(r,bx){const W=bx[1]-bx[0],D=bx[3]-bx[2],cx=(bx[0]+bx[1])/2,cz=(bx[2]+bx[3])/2,y=r.y;
 vB('xmMarW',cx,y-.04,cz,W+.1,.04,D+.1,0,null);if(W<4||D<4)return;vB('xmZel',cx,y-.02,cz,W-2.4,.03,D-2.4,0,null);
 vB('xmMarW',cx,y-.01,cz,1.8,.03,D-2.4,0,null);vB('xmMarW',cx,y-.01,cz,W-2.4,.03,1.8,0,null);}
// an orthogonal polygon as rectangles (bands between its distinct z, each band's spans inside it): [[x0, x1, z0, z1], ...]
function xcPolyRects(P){if(P.length===4)return[xcBox({poly:P})];const zs=[...new Set(P.map(p=>p[1]))].sort((a,b)=>a-b),xs=[...new Set(P.map(p=>p[0]))].sort((a,b)=>a-b),out=[];
 const inP=(x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 for(let j=0;j+1<zs.length;j++){const zm=(zs[j]+zs[j+1])/2;let run=null;for(let i=0;i+1<xs.length;i++){const xm=(xs[i]+xs[i+1])/2,on=inP(xm,zm);if(on&&run===null)run=xs[i];if(!on&&run!==null){out.push([run,xs[i],zs[j],zs[j+1]]);run=null;}}
  if(run!==null)out.push([run,xs[xs.length-1],zs[j],zs[j+1]]);}
 return out;}
// a roofed room's ceiling ornament under its slab (y + h)
function xcCeiling(r,bx,s,holes){const S=window._citadel,y=r.y+r.h,W=bx[1]-bx[0],D=bx[3]-bx[2];if(holes.length&&r.ceil!=='flat')return;
 if(r.ceil==='star'){S.stars+=Math.max(1,Math.round(Math.max(W,D)/Math.min(W,D)));xmStarCeiling(bx[0],bx[1],bx[2],bx[3],y,{});}
 else if(r.ceil==='banded'||r.ceil==='tiled'){const span=Math.min(W,D),rise=Math.min(span*.45,r.h-2.9);if(rise<.8){vB('xmBand',(bx[0]+bx[1])/2,y-.05,(bx[2]+bx[3])/2,W,.05,D,0,null);return;}
  S.vaults++;xmVault(bx[0],bx[1],bx[2],bx[3],y-rise,y,r.ceil==='banded'?'Band':'Haft',r.ceil==='banded'?'Gold':'Sand');
  // the vault's two end lunettes: the walls under it are the room's own skins, up to the crown
 }
 else if(r.ceil==='muq'){vB('xmGilt',(bx[0]+bx[1])/2,y-.05,(bx[2]+bx[3])/2,W,.05,D,0,null);
  for(const [x,z,ry,L] of[[(bx[0]+bx[1])/2,bx[2]+.18,0,W-.4],[(bx[0]+bx[1])/2,bx[3]-.18,Math.PI,W-.4],[bx[0]+.18,(bx[2]+bx[3])/2,Math.PI/2,D-.4],[bx[1]-.18,(bx[2]+bx[3])/2,-Math.PI/2,D-.4]])
   S.cells+=xmMuqCornice(x,y-.05,z,ry,L,{tiers:2,item:'xmCell',alt:'xmCellG'});}
 else{const n=Math.max(1,Math.round(Math.max(W,D)/1.4)),along=W>=D;vB(s.rank>0?'xmGilt':'xWashB',(bx[0]+bx[1])/2,y-.04,(bx[2]+bx[3])/2,W,.04,D,0,s.rank>0?null:xC(XPAL.wash[0]));
  for(let i=1;i<n;i++){const u=i/n;if(along)vB('xPaint',bx[0]+W*u,y-.26,(bx[2]+bx[3])/2,.16,.22,D,0,xC(s.rank>0?0x7a2a2a:0x6a4a30));else vB('xPaint',(bx[0]+bx[1])/2,y-.26,bx[2]+D*u,W,.22,.16,0,xC(s.rank>0?0x7a2a2a:0x6a4a30));}}}
// a parapet of pointed merlons (xArcS caps) or a jali balustrade along a roof's edge, from a to b at y
function xcParapet(a,b,y,kind,c){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.5)return;const ry=Math.atan2(-dz,dx),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 if(kind==='jali'){xmBalustrade(a,b,y,{});return;}
 vB('xmSand',m[0],y,m[1],L,.5,.6,ry,c||XM_C.red);const n=Math.max(1,Math.round(L/1.3));
 for(let i=0;i<n;i++){const p=[a[0]+dx*(i+.5)/n,a[1]+dz*(i+.5)/n];vB(kind==='white'?'xmMarW':'xmSand',p[0],y+.5,p[1],.62,.75,.5,ry,kind==='white'?null:(c||XM_C.red));kput(kind==='white'?'xArcW':'xArcS',[p[0],y+1.25,p[1]],qEuler(0,ry,0),[.62,.42,.5],kind==='white'?xC(XPAL.white):(c||XM_C.red));}}
// a rectangle's four edges as parapets
function xcParapetRect(x0,x1,z0,z1,y,kind,c){xcParapet([x0,z1],[x1,z1],y,kind,c);xcParapet([x1,z1],[x1,z0],y,kind,c);xcParapet([x1,z0],[x0,z0],y,kind,c);xcParapet([x0,z0],[x0,z1],y,kind,c);}

// ---------------------------------------------------------------- the Sultan's Palace (E1, E2a, E2b)
function buildXaCitPalace(G,o){reseed(33001);const it=xcItem('xa_cit_palace'),C=it?it.cit:{curtain:[110,90],FL:.45,RU:5,PU:8,TY:13.6,rangeTop:9.6,ochreTop:19};
 const wash=xC(XPAL.wash[1]),stone=xC(xPick(XPAL.stone)),tile=xC(XPAL.turquoise),lit=xLit();
 vnReg("Sultan's Palace",0,-10,40,22);vnReg("Sultan's Palace — Hall of Audience",0,-10,12,8,{part:'audience'});vnReg("Sultan's Palace — forecourt",0,15,20,3,{part:'court'});
 vnReg("Sultan's Palace — Ramp of the Sultan",-23,-30,8,14,{part:'ramp'});vnReg("Sultan's Palace — gate iwan",0,45,7,12,{part:'gate'});
 // the curtain (the kit's battered dressed stone, now red sandstone) and its two front towers; its back is the citadel wall
 // (the blueprint's curtain walk: in Erewhon the palace stands with its back to the wall at the citadel's north tip, which is
 // narrower than the curtain), so the sides stop at a square pier behind the last rooms
 const cw=C.curtain[0]/2,cd=C.curtain[1]/2,CH=11,sand=xC(0xc0644a);
 xnXECurtain([-cw+3,cd],[-41.2,cd],CH,sand,1);xnXECurtain([-36.8,cd],[-7.5,cd],CH,sand,1);xnXECurtain([7.5,cd],[cw-3,cd],CH,sand,1);
 xnXECurtain([-cw,-39.5],[-cw,cd-3],CH,sand,1);xnXECurtain([cw,cd-3],[cw,-39.5],CH,sand,1);
 for(const sx of[-1,1]){xnXETower(sx*cw,0,cd,3.6,CH+2,sand,tile);xnChhatri(sx*cw,CH+4.4,cd,1.3,2.6,xC(XPAL.white),tile,8);vB('xmSand',sx*cw,0,-39.25,3,CH+1,1.5,0,sand);}   // the back piers 3 x 1.5 (were 4 x 3 at -40.5): in Erewhon they stand inside the citadel wall's 3.4 m, not through it (2026-11-10)
 xcParapet([-cw,-38.6],[cw,-38.6],C.rangeTop,'white');
 // the postern through the curtain (the Golden Way's door: black, white and gold), its passage
 {const x=-39,z0=41,z1=cd+1.6;vB('xmMarK',x-2.2,0,(z0+z1)/2,.5,4.6,z1-z0,0,null);vB('xmMarK',x+2.2,0,(z0+z1)/2,.5,4.6,z1-z0,0,null);vB('xmMarW',x,C.FL-.03,(z0+z1)/2,4.4,.03,z1-z0,0,null);
  vB('xmMarW',x,4.6,(z0+z1)/2,4.9,CH-4.6,z1-z0,0,null);xmArchHead('cusped',x,2.6,z1,0,2.6,2.2,.3,'MarK','Gold');for(let k=0;k<5;k++)vB(k%2?'xmMarK':'xmMarW',x,4.8+k*.5,z1+.1,4.9,.5,.2,0,null);
  vB('xmGold',x,7.3,z1+.15,5.2,.2,.3,0,XM_C.gold);}
 // the rooms (the item), the outer faces: the ranges whitewash on a red sandstone dado, the block white marble
 if(it)xcPlan(it,{ext:{core:'xmMarW',coreC:null,dado:'xmSand',dadoC:null,band:'xmSand',bandC:XM_C.red},partC:xC(0xeadfcf)});
 // the gate iwan through the front: the tallest portal of the citadel, its muqarnas hood in turquoise
 xmIwan(0,0,49,0,9,C.FL+12.5,3.8,{fw:15,fh:C.FL+15.5,t:1.2,mat:'Haft',tiers:6,cell:1.0,star:2.2,back:false});
 for(const s of[-1,1])vB('xmMarW',s*6.75,0,46.4,1.5,C.FL+15.5,5.2,0,null);vB('xmMarW',0,C.FL+12.5,46.4,12,3,5.2,0,null);
 for(const s of[-1,1]){vPst('xColS',s*7.6,C.FL+15.5,49.2,.5,2.4,xC(XPAL.white));kput('xBulbT',[s*7.6,C.FL+17.9,49.2],null,[.8,1.1,.8],tile);vBall('xGold',s*7.6,C.FL+19.1,49.2,.14,XM_C.gold);}
 xnRoundel(0,C.FL+14.4,49.7,0,2.0);for(const s of[-1,1])xnFlagpole(s*5,C.FL+15.7,47,4.5,xC(XPAL.saffron));
 xnGiltRoof(0,C.FL+15.5,46.2,7,4.4,0,{frame:1.4,over:.8});
 // the ranges' roofs: a parapet of white merlons; the palace block's terrace: a jali balustrade; the ochre block (red sandstone
 // now, the kit's ochre warmed into it) under the maroon band and gold roundels, the twin turquoise domes, chhatris at its corners
 for(const s of[-1,1]){const x0=s<0?-47.3:30.7,x1=s<0?-30.7:47.3;xcParapet([x0,41.3],[x1,41.3],C.rangeTop,'white');xcParapet([s<0?x0:x1,41.3],[s<0?x0:x1,-38.3],C.rangeTop,'white');
  vB('xTilesB',(x0+x1)/2,C.rangeTop-.05,1.5,x1-x0+.6,.12,80,0,xC(0x2f8a5a));}
 for(const [a,b] of[[[-31.3,2.3],[31.3,2.3]],[[31.3,2.3],[31.3,-38.3]],[[-31.3,-38.3],[-31.3,2.3]],[[-15,-38.3],[31.3,-38.3]]])xmBalustrade(a,b,C.TY,{});
 {const y=C.ochreTop;vB('xFriezeC',0,y-.95,-12,40.8,.5,16.8,0,null);for(const [x,z] of[[-12,-3.65],[0,-3.65],[12,-3.65]])xnRoundel(x,y-1.6,z+.02,0,1.1);
  xcParapetRect(-20.3,20.3,-20.3,-3.7,y,'red');for(const s of[-1,1])xnDome(s*9,y,-12,3.6,'T',{drum:2.4,drumItem:'xDrumM',drumC:null,c:tile,fin:1.8});
  for(const sx of[-1,1])for(const sz of[-20,-4])xnChhatri(sx*19.5,y+.2,sz,1.0,2.2,xC(XPAL.white),xC(XPAL.gold[0]),6);xnGiltRoof(0,y,-12,5,4,0,{frame:1.6,over:.9});}
 // the Ramp's tower: its shaft above the white base, a roof and a chhatri over it; the core it winds round
 vB('xmSand',-23,0,-30,6,C.TY+3.6,6,0,XM_C.sand);
 {const y0=C.FL+7.2,y1=C.TY+3.6;vB('xmMarW',-23,y0,-38.15,16.6,y1-y0,.3,0,null);vB('xmMarW',-31.15,y0,-30,.3,y1-y0,16.6,0,null);
  vB('xmMarW',-14.85,C.TY,-30,.3,3.6,16.6,0,null);vB('xmMarW',-28,C.TY,-21.85,6,3.6,.3,0,null);vB('xmMarW',-18,C.TY,-21.85,6,3.6,.3,0,null);}
 vB('xmMarW',-23,C.TY+3.6,-30,16.6,.4,16.6,0,null);xnChhatri(-23,C.TY+4,-30,2.2,3.2,xC(XPAL.white),tile,8);
 // the forecourt's cypresses and lamps
 for(const s of[-1,1])for(const z of[8,14,20,26]){xnCypress(s*9,z,7,C.FL);if(lit&&z%12===8)vnLampPost(s*6,C.FL,z,3.6);}
 vnFolk(0,24,4,5);}
XA.def({key:'xa_cit_palace',name:"Sultan's Palace (the citadel)",family:'The Sultan',nv:1,tags:{type:['civic','military','single-family dwelling'],wealth:'civic',lit:true,landmark:true},
 w:112,d:100,h:30,fw:110,fd:90,eye:[0,60,60,-10],eyes:[['audience',0,2.5,-1,-14],['forecourt',0,2,36,0],['gate',0,3,62,40]],build:buildXaCitPalace});

// ---------------------------------------------------------------- the Grand Vizier's palace (E5a, E5b)
function buildXaCitVizier(G,o){reseed(33011);const it=xcItem('xa_cit_vizier'),C=it?it.cit:{FL:.45,U:6.2,top:11},lit=xLit();
 const cobalt=xC(0x1c2fb8),turq=xC(0x36c0c8),lemon=xC(0xf0d040);
 vnReg("Vizier's palace",0,-18,24,12);vnReg("Vizier's palace — the Divan",-8,-27,10,6,{part:'divan'});vnReg("Vizier's palace — pool garden",0,28,20,3,{part:'garden'});
 // the house: Majorelle cobalt outside on a zellige dado, turquoise bands at the floors
 if(it)xcPlan(it,{ext:{core:'xPaint',coreC:cobalt,dado:'xmZel',band:'xPaint',bandC:turq},partC:xC(0xeadfcf)});
 // the loggias' front: the three arches of the garden face, a pishtaq rising over the middle one (the Eram pavilion's)
 xmIwan(0,0,10.6,0,6,C.U+2.2,.05,{fw:11,fh:C.top+3.2,t:.6,mat:'Haft',tiers:4,cell:.9,back:false});
 xcParapetRect(-22.3,22.3,-46.3,10.3,C.top,'white');
 for(const s of[-1,1]){xnChhatri(s*21,C.top+1.6,8.5,1.3,2.6,xC(XPAL.white),turq,6);xnChhatri(s*21,C.top+1.6,-44.5,1.3,2.6,xC(XPAL.white),turq,6);}
 // the upper loggia's rail on the garden
 xmBalustrade([-22,10.2],[-3.2,10.2],C.U,{rail:'xmMarW'});xmBalustrade([3.2,10.2],[22,10.2],C.U,{rail:'xmMarW'});
 // the pool garden: its wall with a tiled coping, the gate, the beds of marigolds, cypresses and palms
 for(const s of[-1,1]){vB('xPaint',s*22.3,0,28,.6,2.8,36,0,cobalt);vB('xmZel',s*22.3,2.8,28,.9,.2,36.2,0,null);vB('xPaint',s*12.6,0,46.3,19.4,2.8,.6,0,cobalt);vB('xmZel',s*12.6,2.8,46.3,19.6,.2,.9,0,null);}
 xmArchHead('horseshoe',0,2.2,46.3,0,3,2.4,.8,'Zel','Gold');vB('xPaint',0,2.2+2.4,46.3,3.4,.4,.8,0,cobalt);
 for(const s of[-1,1]){xnXMBed(s*11,28,8,22,0,.05);for(let k=0;k<6;k++)xnCypress(s*5,14+k*4.8,7,.05);xnXMPalm(s*18,18,6,.05);xnXMPalm(s*18,38,6.5,.05);}
 if(lit)for(const s of[-1,1])vnLampPost(s*4,.05,44,3.4);
 void lemon;vnFolk(0,24,4,3);}
XA.def({key:'xa_cit_vizier',name:"Grand Vizier's palace (the citadel)",family:'The Sultan',nv:1,tags:{type:['civic','single-family dwelling'],wealth:'civic',lit:true,landmark:true},
 w:46,d:94,h:20,fw:45,fd:93,eye:[0,30,60,-10],eyes:[['divan',-8,2.2,-17,-36],['garden',0,2,44,0]],build:buildXaCitVizier});

// ---------------------------------------------------------------- the dars: the great officers' houses, the envoys', the guard
// a dar's massing round its plan: whitewash (or the dress's colour) on a zellige dado, green-tiled eaves over the court, a
// carved portal at the street door, white merlons
const XC_DAR=[{wall:0xf2ede2,eave:0x2f8a5a,acc:0xd8a060},{wall:0xe8d8c0,eave:0x1e5a9a,acc:0x9a3a2a},{wall:0xd8c4a0,eave:0x2a6a4a,acc:0x1c2fb8}];
function xcDar(key,name,plain){const it=xcItem(key),C=it?it.cit:{W:36,D:40,FL:.45,U:5.4,top:9.8,court:[-8,8,-8,10],dress:0},D=XC_DAR[(C.dress==null?0:C.dress)],hx=C.W/2,hz=C.D/2;
 vnReg(name,0,0,Math.max(hx,hz),C.top);vnReg(name+' — court',0,(C.court[2]+C.court[3])/2,6,3,{part:'court'});
 if(it)xcPlan(it,{ext:{core:'xWashB',coreC:xC(D.wall),dado:plain?'vStone':'xmZel',dadoC:plain?xC(XPAL.stone[1]):null,band:plain?null:'xmBand'},partC:xC(0xeadfcf)});
 xcParapetRect(-hx-.3,hx+.3,-hz-.3,hz+.3,C.top,plain?'red':'white',plain?xC(XPAL.stone[1]):null);
 // the green-tiled eaves round the court, on brackets
 if(!plain){const [x0,x1,z0,z1]=C.court;for(const [a,b,ry] of[[[x0,z1],[x1,z1],0],[[x1,z0],[x0,z0],Math.PI],[[x0,z0],[x0,z1],Math.PI/2],[[x1,z1],[x1,z0],-Math.PI/2]]){
   const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],L=Math.hypot(b[0]-a[0],b[1]-a[1]),p=loc(m[0],m[1],0,-.7,ry);kput('xHipT',[p[0],C.top-.3,p[1]],qEuler(0,ry,0),[L+1.6,.7,1.6],xC(D.eave));}}
 // the street portal: a horseshoe in carved stucco in a zellige frame, under a tiled hood
 if(!plain){vB('xmZel',0,0,hz+.32,4.6,4.6,.06,0,null);vB('xmYes',0,3.2,hz+.34,4.2,1.3,.08,0,XM_C.ochre);kput('xHipT',[0,4.8,hz+.6],null,[5.2,.8,1.4],xC(D.eave));
  for(const s of[-1,1])xnBracket(s*2.2,4.8,hz+.3,0,.9,.6,.25,xC(D.acc),'xArmW');}
 // the court's trees
 if(!plain)for(const [x,z] of[[C.court[0]+1.6,C.court[2]+1.6],[C.court[1]-1.6,C.court[2]+1.6],[C.court[0]+1.6,C.court[3]-1.6],[C.court[1]-1.6,C.court[3]-1.6]])xnCypress(x,z,5,.05);
 vnFolk(0,hz+3,3,2);}
function buildXaCitTreasurer(G,o){reseed(33021);xcDar('xa_cit_treasurer','House of the Treasurer');}
function buildXaCitChancellor(G,o){reseed(33031);xcDar('xa_cit_chancellor','House of the Chancellor');}
function buildXaCitMines(G,o){reseed(33041);xcDar('xa_cit_mines','House of the Master of Mines');}
function buildXaCitEnvoys(G,o){reseed(33051);xcDar('xa_cit_envoys',"Envoys' House");}
function buildXaCitBarracks(G,o){reseed(33061);xcDar('xa_cit_barracks','Barracks of the Citadel Guard',true);}
for(const [key,name,b,w,d,type,wealth] of[['xa_cit_treasurer','House of the Treasurer',buildXaCitTreasurer,40,44,['civic','single-family dwelling'],'rich'],
 ['xa_cit_chancellor','House of the Chancellor of Seals and Provinces',buildXaCitChancellor,34,44,['civic','single-family dwelling'],'rich'],
 ['xa_cit_mines','House of the Master of Mines and Mints',buildXaCitMines,42,42,['civic','single-family dwelling'],'rich'],
 ['xa_cit_envoys',"Envoys' House",buildXaCitEnvoys,30,42,['multi-family dwelling'],'rich'],
 ['xa_cit_barracks','Barracks of the Citadel Guard',buildXaCitBarracks,44,42,['military'],'civic']])
 XA.def({key,name,family:'The Sultan',nv:1,tags:{type,wealth,lit:true,landmark:true},w,d,h:14,fw:w-4,fd:d-4,eye:[0,26,d,-4],eyes:[['court',0,2,4,-6]],build:b});

// ---------------------------------------------------------------- the court temple and the citadel kitchens
function buildXaCitTemple(G,o){reseed(33071);const it=xcItem('xa_cit_temple'),FL=it?it.cit.FL:.6,tile=xC(XPAL.turquoise);
 vnReg('Court Temple',0,0,30,16);vnReg('Court Temple — the great iwan',0,22,6,10,{part:'iwan'});
 if(it)xcPlan(it,{ext:{core:'xmMarW',coreC:null,dado:'xmSand',band:'xmSand',bandC:XM_C.red},partC:xC(0xeadfcf)});
 // the great iwan on the porch's front, the hall's drum and dome, minarets at the corners
 xmIwan(0,0,26.6,0,7,FL+11,3.6,{fw:13,fh:FL+14,t:1,mat:'Haft',tiers:5,cell:.95,star:2.0,back:false});
 for(const s of[-1,1])vB('xmMarW',s*5.25,0,24.3,2.5,FL+14,4.6,0,null);vB('xmMarW',0,FL+11,24.3,8,3,4.6,0,null);
 const y=FL+11+.35;xcParapetRect(-20.3,20.3,-16.3,14.3,y,'white');xcParapetRect(-30.3,30.3,-22.3,22.3,FL+6.35,'white');
 xnDome(0,y,-1,9.2,'T',{drum:3.2,drumItem:'xDrumM',drumC:null,c:tile,fin:2.6});
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*29,z=sz*21;vPst('xColS',x,0,z,1.1,FL+16,xC(XPAL.white));vB('xmSand',x,FL+6.3,z,2.6,.5,2.6,0,XM_C.red);
  xnChhatri(x,FL+16,z,1.2,2.4,xC(XPAL.white),tile,8);}
 vnFolk(0,26,4,3);}
function buildXaCitKitchens(G,o){reseed(33081);const it=xcItem('xa_cit_kitchens');vnReg('Citadel Kitchens',0,0,14,8);
 if(it)xcPlan(it,{ext:{core:'xWashB',coreC:xC(XPAL.wash[2]),dado:'vStone',dadoC:xC(XPAL.stone[1])},partC:xC(0xe0d4c0)});
 xcParapetRect(-12.8,12.8,-19.3,19.3,5.65,'red',xC(XPAL.stone[1]));for(const x of[-6,6])vB('xRubB',x,5.3,15,1.4,3,1.4,0,xC(XPAL.rubble[0]));}
XA.def({key:'xa_cit_temple',name:'Court Temple (the citadel)',family:'The Sultan',nv:1,tags:{type:['religious'],wealth:'civic',lit:true,landmark:true},
 w:62,d:56,h:30,fw:60,fd:54,eye:[0,30,60,-4],eyes:[['iwan',0,2,40,20],['hall',0,2,10,-10]],build:buildXaCitTemple});
XA.def({key:'xa_cit_kitchens',name:'Citadel Kitchens, Ice House and Stables',family:'The Sultan',nv:1,tags:{type:['industry'],wealth:'civic',lit:true,landmark:true},
 w:28,d:42,h:12,fw:26,fd:40,eye:[0,20,40,0],build:buildXaCitKitchens});
