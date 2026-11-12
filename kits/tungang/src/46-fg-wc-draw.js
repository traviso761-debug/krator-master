// prefix: fg
// ================================================================= WILDCAT: drawing the scrap pueblo (PLAN.md 1.3.1, 3.3)
// The Kimr's pueblo built from a scrapyard: room blocks of drystone and rammed earth, stepped back storey by storey, their
// exposed faces FACED IN SALVAGE (corrugated sheet, rusted plate, the Ancients' white plate, wrecked cars' shells cut open,
// container panels) with the edges left raw; bell-fir vigas and scrap rail ends standing out of the walls in rows at every
// storey; parapets; no doors at the ground: T-doors framed in mammoth ivory onto the terraces, roof hatches of plate,
// ladders of pipe and fir. The round room (the great kiva) sunk in the plaza, its roof the Boast's stand; small kivas; the
// stockade of stakes and sheet round the knoll's foot. Everything drawn is a record of core/pueblo's plan or of the dress
// (44-fg-wc-plan.js): this fragment decides nothing about where.
//   fgWcBuild(P, C, o)     the whole plan (cells, doors, hatches, ladders, kivas, dress) in the def's frame; registers it
//                          in core/tags first when the placement is not dry (a host registers its own: TG.fg.puebloRegister)
//   fgWcCell / fgWcFace     a column: footing, body, earth roof; each exposed face's parapet, salvage and vigas
//   fgWcLadder, fgWcHatch, fgWcDoor, fgWcKiva, fgWcStockade, fgWcDressDraw
// Defs: fg-wc-greathouse, fg-wc-hamlet, fg-wc-block (one block, the sheet's row), fg-wc-round-room, fg-wc-kiva, fg-wc-stockade.
Object.assign(SVPAL,{
 /* rammed earth and the earth roofs; the paint of the wrecked cars' shells and the containers' panels (faded) */
 earth:[0x9a8064,0x8e765c,0xa48a6c],roofE:[0x6e5e4a,0x665644,0x76644e],carpaint:[0x4a6a7a,0x6a7a4a,0x8a4a3a,0x7a6a3a,0x3a4a6a,0xa89a7a],
 container:[0x8a3a2a,0x2e4a6a,0x4a6a4a,0x9a7a3a],
 /* the rooms' earth plaster */
 plaster:[0x9c8668,0x947e60,0xa48e70]});
const FG_WC_DARK=hc(0x141210);
/* the kit's palette (P), under a name the plan's parameter P does not shadow */
function fgWcPal(k){return P(k);}
/* the cell's points counter-clockwise as prism() takes them (x, z: a positive area) */
function fgWcCCW(pts){let a=0;for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];a+=p[0]*q[1]-q[0]*p[1];}return a>0?pts:pts.slice().reverse();}
function fgWcInset(pts,t){const c=KPUEBLO.centroid(pts);return pts.map(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],L=Math.hypot(dx,dz)||1;return [p[0]-dx/L*t,p[1]-dz/L*t];});}
/* ---------------------------------------------------------------- a column of rooms (the owner, 2026-11-11: interiors) */
/* Each storey of a column is a ROOM (core/pueblo's record): four walls FG_WC_WALL thick inside the cell's edges (their outer
   faces are the cell's edges, so the massing outside is as before; two rooms side by side share a wall twice as thick, as a
   pueblo's do), the door or window opening in the front wall, earth plaster on the back wall, a ceiling slab (the next
   room's floor) with the hatch marked on both faces and the ladder up through it. Over a passage the column starts at its
   clear storey on a ceiling of beams and earth. On top the earth roof; then each exposed face's parapet, salvage and vigas. */
const FG_WC_WALL=.5;
/* the quad grown inward by t: each edge moved in along its inner normal, corners where the moved edges meet */
function fgWcInsetEdges(pts,t){const n=pts.length,c=KPUEBLO.centroid(pts),L=[];
 for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],m=KPUEBLO.outN(a,b,c);L.push([[a[0]-m[0]*t,a[1]-m[1]*t],[b[0]-m[0]*t,b[1]-m[1]*t]]);}
 const out=[];for(let i=0;i<n;i++){const A=L[(i+n-1)%n],B=L[i],d1=[A[1][0]-A[0][0],A[1][1]-A[0][1]],d2=[B[1][0]-B[0][0],B[1][1]-B[0][1]],den=d1[0]*d2[1]-d1[1]*d2[0];
  if(Math.abs(den)<1e-9){out.push(B[0]);continue;}const s=((B[0][0]-A[0][0])*d2[1]-(B[0][1]-A[0][1])*d2[0])/den;out.push([A[0][0]+d1[0]*s,A[0][1]+d1[1]*s]);}
 return out;}
/* a run of wall along edge a -> b (length L, outward normal n), from s0 to s1 along it, t thick inward, y0 to y1, with openings
   gaps [[g0, g1, from, to]] (along the edge; heights above y0): the wall each side of a gap, the sill and the head over it */
function fgWcWallRun(a,b,n,L,s0,s1,t,y0,y1,gaps,col,skin){const ex=(b[0]-a[0])/L,ez=(b[1]-a[1])/L,P2=(s,o)=>[a[0]+ex*s-n[0]*o,a[1]+ez*s-n[1]*o];
 const seg=(sa,sb,ya,yb)=>{if(sb-sa<.02||yb-ya<.02)return;prism('stone',fgWcCCW([P2(sa,0),P2(sb,0),P2(sb,t),P2(sa,t)]),ya,yb,col);
  if(skin)prism('plain',fgWcCCW([P2(sa,t),P2(sb,t),P2(sb,t+.02),P2(sa,t+.02)]),ya,yb,skin);};
 let s=s0;for(const g of gaps.slice().sort((p,q)=>p[0]-q[0])){const g0=Math.max(s0,g[0]),g1=Math.min(s1,g[1]);if(g1<=g0)continue;seg(s,g0,y0,y1);seg(g0,g1,y0,y0+g[2]);seg(g0,g1,y0+g[3],y1);s=g1;}
 seg(s,s1,y0,y1);}
function fgWcRoom(P,c,r,C,S,wc,pc){const t=FG_WC_WALL,h=P.storey,y0=r.storey*h,y1=y0+h,sl=KPUEBLO.DEFAULTS.slab,p=c.pts,ce=[c.cx,c.cz];
 for(const E0 of KPUEBLO.EDGES){const side=E0[0],a=p[E0[1]],b=p[E0[2]],n=KPUEBLO.outN(a,b,ce),L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const s0=side==='right'||side==='left'?t:0,s1=side==='right'||side==='left'?L-t:L,gaps=[];
  /* the T-door: wide above, narrow below (the two lower corners filled); a small window at chest height */
  if(side==='front'&&r.face==='door'){const m=L/2+r.u;gaps.push([m-.5,m+.5,1.3,1.95],[m-.31,m+.31,0,1.3]);}
  if(side==='front'&&r.face==='window'){const m=L/2+r.u;gaps.push([m-.22,m+.22,1.25,1.65]);}
  if(gaps.length===2){/* the door's two gaps share the wall: cut the wide one first, then fill the narrow one's sides below it */
   const m=L/2+r.u;fgWcWallRun(a,b,n,L,s0,s1,t,y0,y1,[[m-.5,m+.5,0,1.95]],wc,side==='back'?pc:null);
   fgWcWallRun(a,b,n,L,m-.5,m-.31,t,y0,y0+1.3,[],wc,null);fgWcWallRun(a,b,n,L,m+.31,m+.5,t,y0,y0+1.3,[],wc,null);}
  else fgWcWallRun(a,b,n,L,s0,s1,t,y0,y1,gaps,wc,side==='back'?pc:null);}
 /* the ceiling, the next room's floor: its hatch marked on both faces, the ladder up through it */
 prism('stoneD',fgWcCCW(fgWcInsetEdges(p,t)),y1-sl,y1,fgCol('roofE',C));
 const H=P.hatchByCell&&P.hatchByCell[c.id];
 if(H){const ry=Math.atan2(c.n[0],c.n[1]);W(H.x,y0,H.z,ry,()=>{box('plain',0,h-sl-.012,0,.84,.01,.84,FG_WC_DARK);if(r.storey<c.storeys-1)box('plain',0,h+.002,0,.84,.01,.84,FG_WC_DARK);
  if(r.hatchUp&&!C.worn)fgWcRails(.02,h+.45,.12,-.1,C,fgWcU(P,c.seg,r.storey,104)<.5);});}
 S.rooms++;}
function fgWcCell(P,c,C,S,R){const h=P.storey,top=c.storeys*h,pts=fgWcCCW(c.pts),u=fgWcU(P,c.seg,c.row*7+c.bi,81),base=c.base||0,yb=base*h;
 const g=Math.min(0,...c.pts.map(p=>C.gl(p[0],p[1])));
 if(!base)prism('stone',pts,Math.max(C.lo-1,g-.4),.02,fgCol('stoneD',C));
 /* over a passage: its ceiling of beams and earth under the first room, the beam ends showing at both mouths */
 else{prism('stoneD',pts,yb-.32,yb,fgCol('roofE',C));}
 /* the walls: drystone, or rammed earth on a third of the columns; plastered inside */
 const wc=fgCol(u<.33?'earth':'stone',C),pc=fgCol('plaster',C);
 for(const r of (R||[]))fgWcRoom(P,c,r,C,S,wc,pc);
 prism('stoneD',fgWcInset(pts,.06),top,top+.14,fgCol('roofE',C));
 /* each face, where it shows: down to the ground, or to a neighbour's roof, and under a neighbour's passage */
 for(const E0 of KPUEBLO.EDGES){const side=E0[0],o2=c.nb[side]&&P.byId[c.nb[side]],iv=[];
  if(!o2)iv.push([Math.max(g,yb),top]);
  else{if(o2.base&&o2.base*h>yb)iv.push([yb,Math.min(top,o2.base*h)]);if(o2.storeys*h<top-.01)iv.push([Math.max(yb,o2.storeys*h),top]);}
  for(const v of iv)if(v[1]-v[0]>.05)fgWcFace(P,c,side,v[0],v[1],top,C,S,R);}}
/* one exposed face of a column from ya to yb (yb = top: the parapet too): its salvage storey by storey (clear of the door or
   window in that storey's room) and its vigas under each storey's roof (front and back faces) */
function fgWcFace(P,c,side,ya,yb,top,C,S,R){const E=fgWcEdge(c,side),h=P.storey,si=['front','right','back','left'].indexOf(side);
 /* the face's local x runs (nz, -nx); the front edge's own direction is p0 -> p1: the door's u in this frame */
 const p=c.pts,fx=p[1][0]-p[0][0],fz=p[1][1]-p[0][1],sg=Math.sign(fx*Math.cos(E.ry)-fz*Math.sin(E.ry))||1;
 W(E.m[0],0,E.m[1],E.ry,()=>{const L=E.L,col=fgCol('stone',C);
  if(yb>=top-.01){box('stone',0,top,-.17,L+.02,.5,.34,col);if(fgWcU(P,c.seg*4+si,c.row*16+c.bi*97,83)<.33)box('rust',0,top+.5,-.17,L*.9,.04,.4,fgCol('rust',C),0,0,(fgWcU(P,c.seg,si,84)-.5)*.04);}
  const j0=Math.max(0,Math.floor(ya/h+1e-6));
  for(let j=j0;j*h<yb-.01;j++){const y0=Math.max(ya,j*h),y1=Math.min(yb,(j+1)*h),u=fgWcU(P,c.seg*4+si,c.row*16+j+c.bi*97,82);
   const rm=side==='front'&&R?R.find(q=>q.storey===j&&q.face):null,ox=rm?sg*rm.u:null;
   if(u>=.32&&!(C.worn&&fgWcU(P,c.seg,j*4+si,85)<.45)&&!(side==='front'&&S.bare&&S.bare.has(c.id))){let w=L*(.55+.4*fgWcU(P,c.seg,j*4+si,86)),hh=(y1-y0)*(.62+.33*fgWcU(P,c.seg,j*4+si,87)),
     x=(fgWcU(P,c.seg,j*4+si,88)-.5)*(L-w),y=y0+.08+((y1-y0)-hh-.12)*fgWcU(P,c.seg,j*4+si,89),rz=(fgWcU(P,c.seg,j*4+si,90)-.5)*.06;
    /* a door or window in this storey: the panel takes the wider side of the face beside it */
    if(ox!=null){const lo=ox-.75,hi=ox+.75,left=lo+L/2,right=L/2-hi;if(left>=right){w=Math.min(w,left-.1);x=-L/2+w/2+.05;}else{w=Math.min(w,right-.1);x=L/2-w/2-.05;}}
    if(w>.4){
    if(u<.55)box('tin',x,y,.03,w,hh,.035,fgCol('tin',C),0,0,rz);
    else if(u<.72)box('rust',x,y,.03,w,hh,.04,fgCol('rust',C),0,0,rz);
    else if(u<.84){box('plate',x,y,.035,w,hh,.05,fgCol('plate',C),0,0,rz);for(const sx of [-1,1])for(const sy of [.15,.85])ellip('iron',x+sx*(w/2-.08),y+hh*sy,.07,.025,.025,.012,fgWcPal('iron'),0,4);}
    else if(u<.94){const pc=fgCol('carpaint',C),cw=Math.min(w,2.4),ch=Math.min(hh,1.5);S.cars++;
     /* a wrecked car's shell cut open and flattened on: a bowed panel, its window holes plated */
     W(x,y,.03,0,()=>{psurf('paint',(a,b)=>[(a-.5)*cw,b*ch,Math.sin(a*Math.PI)*.18],6,2,pc);psurf('paint',(a,b)=>[(a-.5)*cw,b*ch,Math.sin(a*Math.PI)*.18-.02],6,2,pc,{flip:true});
      box('rust',cw*.18,ch*.55,.2,cw*.32,ch*.3,.02,fgCol('rust',C));});}
    else{const pc=fgCol('container',C);box('paint',x,y,.03,w,hh,.04,pc,0,0,rz);for(let k=0;k<Math.floor(w/.32);k++)box('paint',x-w/2+.16+k*.32,y,.06,.06,hh,.02,pc.clone().multiplyScalar(.85),0,0,rz);}
    S.faced++;}}
   /* the vigas: fir beam ends in a row under each storey's roof, a scrap rail or pipe end among them (the front and back faces) */
   if((side==='front'||side==='back')&&y1-y0>1.2&&y1>=(j+1)*h-.01){const n=Math.max(2,Math.floor(L/.9)),yv=(j+1)*h-.32;
    for(let k=0;k<n;k++){const x=-L/2+(k+.5)*L/n,rail=fgWcU(P,c.seg*16+k,j*4+si,91)<.2;if(rail)box('iron',x,yv,.2,.09,.13,.42,fgWcPal('iron'));else box('pole',x,yv-.02,.22,.17,.17,.46,fgCol('pole',C));}S.vigas+=n;}}});}
/* ---------------------------------------------------------------- doors and windows */
/* the T-door's frame (the opening is in the wall: fgWcRoom): two mammoth tusks under a fir lintel, a hide curtain rolled up
   over it or a plate leaf stood open beside it; a window's plate shutter swung back */
function fgWcDoor(P,r,C,S){const c=P.byId[r.cell],E=fgWcEdge(c,'front'),y0=r.y0,p=c.pts,fx=p[1][0]-p[0][0],fz=p[1][1]-p[0][1],sg=Math.sign(fx*Math.cos(E.ry)-fz*Math.sin(E.ry))||1;
 W(E.m[0],0,E.m[1],E.ry,()=>{const x=sg*r.u;
  if(r.face==='door'){for(const s of [-1,1])beam('skull',[x+s*.62,y0,.07],[x+s*.55,y0+1.98,.09],.075,fgWcPal('skull'),true,5,.04);
   pole('pole',[x-.82,y0+1.98,.1],[x+.82,y0+1.98,.1],.08,fgCol('pole',C),6);
   if(fgWcU(P,c.seg,r.storey,93)<.55)beam('hide',[x-.52,y0+1.86,.08],[x+.52,y0+1.86,.08],.11,fgCol('hide',C),true,7);else box('plate',x-.9,y0+.04,.38,.05,1.8,.66,fgCol('plate',C),.6);S.doors++;}
  else box('rust',x+.42,y0+1.2,.08,.4,.48,.03,fgCol('rust',C),-.5);});}
function fgWcHatch(P,H,C,S){const c=P.byId[H.cell],ry=Math.atan2(c.n[0],c.n[1]);
 const hk=['rust','rust','wood','plate'][Math.floor(fgWcU(P,c.seg,c.row*7+c.bi,103)*4)];
 W(H.x,H.y+.14,H.z,ry,()=>{box(hk,0,0,0,.9,.06,.9,fgCol(hk,C));box('plain',0,.02,-.2,.6,.05,.25,FG_WC_DARK);
  if(H.ladder&&!C.worn)fgWcRails(-1,1.7,-.18,-.42,C,fgWcU(P,c.seg,c.row,94)<.6);});S.hatches++;}
/* two rails and rungs from (y0, z0) to (y1, z1) in the current frame, x = +-.24: pipe (iron) or bell fir */
function fgWcRails(y0,y1,z0,z1,C,pipe){const mk=pipe?'iron':'pole',rc=pipe?fgWcPal('iron'):fgCol('pole',C);
 for(const s of [-1,1])beam(mk,[s*.24,y0,z0],[s*.24,y1,z1],pipe?.035:.045,rc,true,5);
 for(let y=y0+.3;y<y1-.15;y+=.32){const t=(y-y0)/(y1-y0);box('pole',0,y,z0+(z1-z0)*t,.52,.065,.065,fgCol('pole',C));}}
/* a ladder record: its foot on the lower level .55 m out from the face, its top against the face, .9 m over the roof it reaches */
function fgWcLadder(L,C,P,S){if(C.worn&&fgWcU(P,L.x*10|0,L.z*10|0,95)<.66)return;
 W(L.x,L.y0,L.z,L.ry,()=>fgWcRails(L.y0>0?.14:0,L.y1-L.y0+.9,0,-.42,C,fgWcU(P,L.x*10|0,L.z*10|0,96)<.6));S.ladders++;}
/* ---------------------------------------------------------------- the kivas */
/* sunk in the plaza: the round rim of drystone standing over its earth roof, the hatch and its ladder out; the great kiva
   (the round room) carries the Boast's stand on its roof (a plate dais and the horned post) and skulls round its rim */
function fgWcKiva(k,C,P,S){const r=k.r,rt=k.roof,rim=k.great?.6:.38,sc=fgCol('stone',C),x=k.x,z=k.z,dp=k.depth,seg=Math.max(18,Math.round(r*5));
 sector('stone',x,z,r-.5,r,0,TAU,-dp,rt+rim,sc,seg);
 /* inside (the storey section opens it): the floor, the bench round the wall, its pilasters under the cribbing, the hearth
    and the deflector between it and the ladder's side, earth plaster on the wall */
 cyl('stoneD',x,-dp-.12,z,r-.48,.12,fgCol('roofE',C),seg);sector('plain',x,z,r-.52,r-.5,0,TAU,-dp+.55,-.35,fgCol('plaster',C),seg);
 sector('stone',x,z,r-1.15,r-.5,0,TAU,-dp,-dp+.55,fgCol('stoneD',C),seg);
 for(let i=0;i<6;i++){const a=i/6*TAU+.26;box('stone',x+Math.cos(a)*(r-.82),-dp+.55,z+Math.sin(a)*(r-.82),.45,dp-1,.45,sc,-a);}
 {const ha=Math.atan2(k.hatch.z-z,k.hatch.x-x),fx=x+Math.cos(ha)*r*.12,fz=z+Math.sin(ha)*r*.12;W(fx,-dp,fz,0,()=>fgHearth(0,0,C,{r:.42,lit:true}));
  box('stone',x+Math.cos(ha)*r*.32,-dp,z+Math.sin(ha)*r*.32,1.1,.95,.16,sc,-ha+PI/2);}
 cyl('stoneD',x,-.3,z,r-.45,rt+.3,fgCol('roofE',C),Math.max(16,Math.round(r*4)));
 /* the cribbing's log ends showing at the rim, the roof's earth on them */
 const nl=Math.round(r*2.2);for(let i=0;i<nl;i++){const a=i/nl*TAU;box('pole',x+Math.cos(a)*(r-.25),rt-.12,z+Math.sin(a)*(r-.25),.16,.16,.7,fgCol('pole',C),-a+PI/2);}
 const hx=k.hatch.x,hz=k.hatch.z;box('plain',hx,rt+.02,hz,1.2,.04,1.2,FG_WC_DARK);for(const s of [-1,1])box('pole',hx+s*.65,rt,hz,.12,.12,1.4,fgCol('pole',C));
 W(hx,-dp,hz,0,()=>fgWcRails(0,dp+rt+2.7,.25,-.25,C,false));
 if(k.great){/* the Boast's stand: a dais of white plate, the horned post behind it */
  cyl('plate',x,rt,z,1.8,.36,fgCol('plate',C),20);cyl('stoneD',x,rt,z,2.1,.12,fgCol('stoneD',C),20);
  pole('pole',[x,rt+.36,z-1.4],[x,rt+3.6,z-1.4],.13,fgCol('pole',C),7);fgWcHorns(x,rt+3.5,z-1.32,0,1.5,C);
  if(!C.worn)for(let i=0;i<8;i++){const a=i/8*TAU;W(x+Math.cos(a)*(r-.25),rt+rim,z+Math.sin(a)*(r-.25),-a+PI/2,()=>fgWcSkull(0,0,0,0,.9,C));}}
 S.kivas++;}
/* an aurochs skull facing +z at (x, y, z), its horns sweeping out and up; s the scale */
function fgWcSkull(x,y,z,ry,s,C){W(x,y,z,ry,()=>{ellip('skull',0,.16*s,.02*s,.15*s,.17*s,.22*s,fgWcPal('skull'),0,6);ellip('skull',0,.07*s,.2*s,.09*s,.08*s,.11*s,fgWcPal('skull'),0,5);
 for(const sx of [-1,1]){beam('horn',[sx*.12*s,.24*s,0],[sx*.42*s,.34*s,.02*s],.05*s,fgWcPal('horn'),true,5,.035*s);beam('horn',[sx*.42*s,.34*s,.02*s],[sx*.55*s,.62*s,.08*s],.035*s,fgWcPal('horn'),true,5,.008*s);}});}
/* a great pair of aurochs horns on a frontlet of plate (the hero's crest, the Boast's post) */
function fgWcHorns(x,y,z,ry,span,C){W(x,y,z,ry,()=>{box('plate',0,-.25,.02,.5,.5,.06,fgCol('plate',C));ellip('skull',0,0,.08,.22,.26,.16,fgWcPal('skull'),0,6);
 for(const sx of [-1,1]){const a=[sx*.18,.12,.06],b=[sx*span*.32,.28,.14],c=[sx*span*.5,.72,.1],d=[sx*span*.44,1.05,0];
  beam('horn',a,b,.11,fgWcPal('horn'),true,6,.08);beam('horn',b,c,.08,fgWcPal('horn'),true,6,.05);beam('horn',c,d,.05,fgWcPal('horn'),true,5,.008);}});}
/* ---------------------------------------------------------------- the stockade */
/* stakes every ~.9 m along the ring (sharpened, leaning a little out), sheet panels lashed between them, tyres stacked at
   some posts; the gate: two tall posts, an aurochs skull over them, two plate leaves standing open. ring {pts, gate} (closed),
   or a run when o.open. The stakes stand on the ground (C.gl) */
function fgWcStockade(R,C,P,S,o){o=o||{};const pts=R.pts,n=pts.length,gate=R.gate,gw=gate?gate.w:0,pc=fgCol('pole',C);let acc=0;
 const segs=o.open?n-1:n;
 for(let i=0;i<segs;i++){const p=pts[i],q=pts[(i+1)%n],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<1e-6)continue;const ux=(q[0]-p[0])/L,uz=(q[1]-p[1])/L,nx=uz,nz=-ux;
  for(let t=0;t<L;t+=.9){const x=p[0]+ux*t,z=p[1]+uz*t;if(gate&&Math.hypot(x-gate.x,z-gate.z)<gw/2)continue;const g=C.gl(x,z),hs=2.3+fgWcU(P,i,t*10|0,97)*.8,lean=.18;
   beam('pole',[x,g-.4,z],[x+nx*lean,g+hs,z+nz*lean],.075,pc,true,5,.012);S.stakes++;
   acc+=.9;if(acc>=2.7){acc=0;const kind=['rust','tin','plate','scrap','rust'][Math.floor(fgWcU(P,i,t*10|0,98)*5)];if(C.worn&&fgWcU(P,i,t*10|0,99)<.4)continue;
    W(x-ux*1.3,g+.25,z-uz*1.3,Math.atan2(nx,nz),()=>box(kind,0,0,.06,2.4,1.5+fgWcU(P,i,t*10|0,100)*.4,.04,fgCol(kind==='plate'?'plate':kind,C),0,.04,(fgWcU(P,i,t*10|0,101)-.5)*.08));S.panels++;}
   if(fgWcU(P,i,t*10|0,102)<.04)for(let k=0;k<3;k++)ring('tyre',x-nx*.6,g+.18+k*.3,z-nz*.6,.38,.12,fgWcPal('tyre'),0,PI/2,0,10);}}
 if(gate){W(gate.x,0,gate.z,gate.ry,()=>{const g=C.gl(gate.x,gate.z);
  for(const s of [-1,1]){pole('pole',[s*gw/2,g-.5,0],[s*gw/2,g+4.2,0],.16,pc,7);box('plate',s*(gw/2-.1),g+.05,.9,.06,2.6,1.9,fgCol('plate',C),s*.25);}
  pole('pole',[-gw/2-.3,g+4,0],[gw/2+.3,g+4,0],.13,pc,7);fgWcSkull(0,g+4.05,.1,0,1.4,C);});}}
/* ---------------------------------------------------------------- the dress */
function fgWcDressDraw(P,D,C,S){
 for(const s of D.crest){if(s.kind==='crest')fgWcHorns(s.x,s.y,s.z,s.ry,s.span,C);else if(!C.worn)fgWcSkull(s.x,s.y,s.z,s.ry,.75,C);S.crest++;}
 for(const t of D.trophies){const g=0;pole('pole',[t.x,g-.3,t.z],[t.x,g+t.h,t.z],.09,fgCol('pole',C),6);
  W(t.x,g+t.h,t.z,0,()=>{if(t.what==='helmet'){/* a Labber's helmet: a white Ancient dome with its visor */
    lathe('plate',0,0,[[.24,-.05],[.25,.08],[.2,.2],[.1,.27],[0,.29]],12,fgCol('plate',C));box('plain',0,.02,.2,.34,.08,.06,hc(0x1c2a30));}
   else if(t.what==='scale'){/* a Lizard's scale, big as a shield, green and dull */box('paint',0,-.2,.04,.5,.62,.04,hc(0x4a6a3a),0,0,PI/4);}
   else if(t.what==='horns')fgWcHorns(0,-.2,.05,0,1.1,C);
   else for(let k=0;k<3;k++)fgWcSkull(0,-.35-k*.42,.08,k*.4,.7,C);});
  cord('cord',[[t.x+.08,t.h-.6,t.z],[t.x+.3,t.h-1.4,t.z+.15]],.012,fgWcPal('rope'));S.trophies++;}
 for(const d of D.deeds){W(d.x,d.y,d.z,d.ry,()=>{fgText('THE DEEDS',0,d.h-.28,.012,0,.24,fgWcPal('white'));const n=d.boasts.length,cw=(d.w-.6)/n;
   for(let i=0;i<n;i++){const b=d.boasts[i],x=-d.w/2+.3+(i+.5)*cw;fgMark(b.mark,x,d.h-.75,.012,0,Math.min(.34,cw*.9),0xe8e2d4);
    if(b.made)box('plain',x,.3,.012,cw*.5,cw*.5,.01,hc(0xe8e2d4));else for(const a of [PI/4,-PI/4])box('plain',x,.25,.012,.05,cw*.75,.01,hc(0xa8321e),0,0,a);
    for(let k=0;k<1+(i*7%4);k++)box('plain',x-cw*.3+k*cw*.18,.02,.012,.04,.2,.01,hc(0xe8e2d4));}});S.deeds++;}
 for(const s of D.slogans){W(s.x,0,s.z,s.ry,()=>{const w=fgTextW(s.text,s.ch);fgText(s.text,s.aurochs?-1.2:0,s.y,0,0,s.ch,fgWcPal('red'));
   if(s.aurochs){/* a painted aurochs head beside the words: the brow, the muzzle, the great horns */const x=w/2+.6,y=s.y+s.ch*.4,k=hc(0xe8e2d4);
    box('plain',x,y-.35,.012,.5,.75,.01,k);box('plain',x,y-.6,.012,.34,.3,.01,k);for(const sx of [-1,1]){box('plain',x+sx*.45,y+.22,.012,.55,.12,.01,k,0,0,sx*.35);box('plain',x+sx*.78,y+.5,.012,.1,.42,.01,k,0,0,-sx*.3);}}});S.slogans++;}
 for(const s of D.shells){W(s.x,s.y,s.z,s.ry,()=>{const r=s.r;ellip('horn',0,.02,0,r,r*.62,r*.82,hc(0x6a5a40),0,10);ring('horn',0,.12,0,r*.95,.07,hc(0x4e4232),0,PI/2,0,14);
   for(let k=0;k<7;k++){const a=k/7*TAU;ellip('horn',Math.cos(a)*r*.55,r*.45,Math.sin(a)*r*.48,r*.2,r*.07,r*.18,hc(0x7a6a4c),a,6);}});S.shells++;}
 for(const f of D.drums)fgWcPlace(f.key,f.x,.06,f.z,f.ry,0);}
/* ---------------------------------------------------------------- the whole plan */
/* register the plan's records as the current record's children (a placement that is not dry), before anything is drawn */
let FG_WC_LASTIDS={};
function fgWcRegister(P,D,T,parent,at,ry,name){const r=KPUEBLO.register(P,T,{parent,culture:'fellgang',at,ry,name,frag:KIT.frag});FG_WC_LASTIDS=r.ids;let n=r.count;
 const fx=(kind,name2,x,y,z,size,role)=>{T.child(parent,{'class':'fixture',kind,key:'fg-wc-'+kind,name:name+': '+name2,at:at(x,y,z),ry,size,tags:{culture:'fellgang',part:kind,role},frag:KIT.frag});n++;};
 D.crest.forEach(s=>fx(s.kind==='crest'?'crest':'skull',s.kind==='crest'?'the hero\'s horned crest':'an aurochs skull on the parapet',s.x,s.y,s.z,s.kind==='crest'?[s.span,.6,1.2]:[.8,.4,.6],'trophy'));
 D.trophies.forEach(t=>fx('trophy-pole','a trophy pole ('+t.what+')',t.x,0,t.z,[.6,.6,t.h+.4],'trophy'));
 D.deeds.forEach(d=>fx('deeds','the Deeds (every boast, and whether it was made good)',d.x,d.y,d.z,[d.w,.05,d.h],'record'));
 D.slogans.forEach(s=>fx('slogan','a slogan ('+s.text+')',s.x,s.y,s.z,[fgTextW(s.text,s.ch),.02,s.ch],'sign'));
 D.shells.forEach(s=>fx('cistern','a glyptodont shell as a cistern',s.x,s.y,s.z,[2*s.r,2*s.r,s.r*.7],'water'));
 /* a dress's other fixtures (Barricade's wrecks, gates, lookouts, pickets): {kind, name, x, y, z, size, role} */
 (D.fixtures||[]).forEach(q=>fx(q.kind,q.name,q.x,q.y,q.z,q.size,q.role));
 return n;}
/* ---------------------------------------------------------------- furniture and the plaza */
/* a catalog piece at a plan point (the def's frame): placed through FURNISH where the placement registers (the sheet's rows),
   else queued in the world frame for the host's own batch (TG.fg.pueblo: a dry draw, as a world's is) */
const FG_WC_PEND=[];
function fgWcPlace(key,x,y,z,ry,v){if(!PLACE_DRY)return fgFurn(key,x,y,z,ry,{v});const p=new THREE.Vector3(x,y,z).applyMatrix4(CM),e=CM.elements;
 FG_WC_PEND.push({key,x:p.x,y:p.y,z:p.z,ry:Math.atan2(e[8],e[10])+(ry||0),v:v|0});return null;}
/* the plazas' packed earth: a 1 m grid in runs, skipping the kivas' pits and a culvert's river (its keep-out strip) */
function fgWcPaving(P,C,S){const col=fgCol('earth',C).clone().multiplyScalar(1.08),river=(P.keepOut||[]).filter(k=>/culvert/.test(k.id));
 for(const pl of P.plazas){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pl.pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  const pits=P.kivas.filter(k=>k.plaza===pl.id),inP=(x,z)=>KPUEBLO.inPoly(pl.pts,x,z);
  for(let z=Math.floor(z0);z<z1;z++){let run=null;const flush=xe=>{if(run!=null){box('stoneD',(run+xe)/2,-.08,z+.5,xe-run,.08,1,col);S.paving++;}run=null;};
   for(let x=Math.floor(x0);x<=x1;x++){const cx=x+.5,cz=z+.5,on=(inP(x,z)||inP(x+1,z)||inP(x,z+1)||inP(x+1,z+1))&&!pits.some(k=>Math.hypot(k.x-cx,k.z-cz)<k.r-.35)&&!river.some(k=>KPUEBLO.inPoly(k.pts,cx,cz)&&Math.abs(cx-(k.pts[0][0]+k.pts[1][0])/2)<(Math.abs(k.pts[1][0]-k.pts[0][0])/2-2));
    if(on&&run==null)run=x;else if(!on)flush(x);}flush(Math.floor(x1)+1);}}}
function fgWcBuild(P,C,o){o=o||{};const D=o.dress||fgWcDress(P),S={faced:0,cars:0,vigas:0,doors:0,hatches:0,ladders:0,kivas:0,crest:0,trophies:0,deeds:0,slogans:0,shells:0,stakes:0,panels:0,rooms:0,furniture:0,paving:0};
 /* the faces the Deeds are painted on stay bare drystone */
 Object.defineProperty(S,'bare',{value:new Set([].concat(...D.deeds.map(d=>d.cells))),enumerable:false});
 if(!PLACE_DRY&&CURREC&&CURREC.tid&&SVTAGS){const M=CM.clone(),at=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).applyMatrix4(M);return [+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)];};
  fgSet('registered',fgWcRegister(P,D,SVTAGS,CURREC.tid,at,CURREC.ry,CURREC.name));}
 const RB={};P.rooms.forEach(r=>(RB[r.cell]||(RB[r.cell]=[])).push(r));
 P.cells.forEach(c=>fgWcCell(P,c,C,S,RB[c.id]));
 if(o.paving!==false)fgWcPaving(P,C,S);
 P.rooms.forEach(r=>{if(r.face)fgWcDoor(P,r,C,S);});
 P.hatches.forEach(H=>fgWcHatch(P,H,C,S));
 P.ladders.forEach(L=>fgWcLadder(L,C,P,S));
 P.kivas.forEach(k=>fgWcKiva(k,C,P,S));
 fgWcDressDraw(P,D,C,S);
 if(o.extra)o.extra(P,D,C,S);
 /* the rooms' and the kivas' furniture (core/pueblo's records), on each floor */
 for(const f of (P.furniture||[])){fgWcPlace(f.key,f.x,f.y+(f.kiva?0:.02),f.z,f.ry,f.v);S.furniture++;}
 if(C.worn)P.cells.filter(c=>!c.nb.back).forEach((c,i)=>{if(i%3)return;const E=fgWcEdge(c,'back');W(E.m[0],0,E.m[1],E.ry,()=>fgRubble(0,.4,4,C));});
 fgSet('plan',P.id);fgSet('cells',P.cells.length);fgSet('rooms',P.rooms.length);fgSet('pop',P.census.pop);for(const k in S)fgSet(k,S[k]);
 /* the house's door (core/engine's record front): the way in, the first entry ladder's foot */
 const L0=P.ladders.find(L=>L.kind==='entry')||P.ladders[0];if(L0)door(L0.x,0,L0.z,L0.ry,1,2);
 return S;}
/* the declared boxes: the default plan's footprint, the ladders' feet and parapets, the crest */
function fgWcBox(P,dw,dd,dh){return {w:+(P.bounds.w+dw).toFixed(2),d:+(P.bounds.d+dd).toFixed(2),h:+(P.bounds.h+dh).toFixed(2)};}
const FG_WC_GB=fgWcBox(fgWcPlan(FG_WC.GREAT),1.2,1.4,2),FG_WC_HB=fgWcBox(fgWcPlan(FG_WC.HAMLETS[0]),1.2,1.4,1.6),FG_WC_BB=fgWcBox(fgWcPlan(FG_WC.block(0)),1.2,1.4+FG_WC.block(0).yard,1.8);   /* the block's paved yard before it */
defBuilding({key:'fg-wc-greathouse',name:'Wildcat: the great house',seed:9201,cut:false,w:FG_WC_GB.w,d:FG_WC_GB.d,h:FG_WC_GB.h,budget:600000,
 tags:{types:['dwelling-multi','military'],wealth:'middle',style:'salvage',role:'dwelling'},
 note:'the scrap pueblo (core/pueblo): one great house of Pueblo Bonito\'s scale, a D of room blocks stepping up five storeys from two plazas, faced in salvage over drystone and rammed earth; no doors at the ground, ladders pulled up at night; the round room in the west plaza, the Deeds on the front, the hero\'s rooms under a horned crest',
 build(o){const C=fgCx(o),P=o.plan||fgWcPlan(FG_WC.GREAT);fgWcBuild(P,C,o);}});
defBuilding({key:'fg-wc-hamlet',name:'Wildcat: a scrap-pueblo hamlet',seed:9202,w:FG_WC_HB.w,d:FG_WC_HB.d,h:FG_WC_HB.h,budget:80000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'salvage',role:'dwelling'},
 note:'a small scrap pueblo (core/pueblo: a U or an L of room blocks round a yard, a kiva in it)',
 build(o){const C=fgCx(o),P=o.plan||fgWcPlan(FG_WC.HAMLETS[(o.v|0)%2]);fgWcBuild(P,C,o);}});
defBuilding({key:'fg-wc-block',name:'Wildcat: a room block',seed:9203,w:FG_WC_BB.w,d:FG_WC_BB.d,h:FG_WC_BB.h,budget:40000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'salvage',role:'dwelling'},
 note:'one block of the scrap pueblo alone: three rows stepping up to three storeys from its yard, stores below and homes above; the even seeds carry the hero\'s rooms under the horned crest',
 build(o){const C=fgCx(o);fgWcBuild(fgWcPlan(FG_WC.block(o.v|0)),C,o);}});
defBuilding({key:'fg-wc-round-room',name:'Wildcat: the round room',seed:9204,w:22.6,d:22.6,h:6.4,budget:30000,
 tags:{types:['civic'],wealth:'middle',style:'salvage',role:'civic'},
 note:'the Kimr\'s round room, the great kiva sunk in the plaza: its roof the Boast\'s stand (a hero stands on the dais and says what they will do), its floor where the hands are counted; skulls round its rim, trophy poles round it, no spirits on its walls',
 build(o){const C=fgCx(o),P={world:14700+(o.v|0),storey:2.6,byId:{}},k={id:'rr',x:0,z:0,r:8.5,depth:3,roof:.45,great:true,hatch:{x:2.55,z:-2.1}},S={kivas:0,trophies:0,crest:0,deeds:0,slogans:0,shells:0};
  fgWcKiva(k,C,P,S);fgWcDressDraw(P,{crest:[],trophies:[0,1,2,3,4,5].map(i=>({x:Math.cos((i+.3)/6*TAU)*10.9,z:Math.sin((i+.3)/6*TAU)*10.9,what:['helmet','scale','skulls','horns','helmet','skulls'][i],h:4+(i%3)*.6})),
   deeds:[],slogans:[],shells:[],drums:[{key:'fellgang_common_war_drum',x:7,z:7,ry:-.8},{key:'fellgang_common_brazier',x:-7.4,z:6.6,ry:0}]},C,S);fgSet('trophies',S.trophies);}});
defBuilding({key:'fg-wc-kiva',name:'Wildcat: a kiva',seed:9205,w:7.4,d:7.4,h:3.6,budget:8000,
 tags:{types:['civic'],wealth:'middle',style:'salvage',role:'civic'},
 note:'a small kiva, sunk: a household\'s or a band\'s round room, entered by its ladder through the roof',
 build(o){const C=fgCx(o),P={world:14710+(o.v|0),storey:2.6,byId:{}};fgWcKiva({id:'k',x:0,z:0,r:3.2+(o.v|0)%2*.2,depth:2.4,roof:.45,great:false,hatch:{x:.96,z:-.8}},C,P,{kivas:0});}});
defBuilding({key:'fg-wc-stockade',name:'Wildcat: the stockade',seed:9206,w:30,d:1.6,h:4.8,budget:60000,
 tags:{types:['military','infrastructure'],style:'salvage',role:'defence'},
 note:'stakes and scrap round the knoll\'s foot: sharpened fir stakes, sheet panels lashed between them, tyres stacked at some posts; the gate under an aurochs skull. A host passes the plan\'s ring (o.ring); alone, a 30 m run with its gate',
 build(o){const C=fgCx(o),P={world:14720+(o.v|0)},S={stakes:0,panels:0};
  if(o.ring)fgWcStockade(o.ring,C,P,S);else fgWcStockade({pts:[[-14.6,0],[14.6,0]],gate:{x:0,z:0,w:4,ry:0}},C,P,S,{open:true});fgSet('stakes',S.stakes);fgSet('panels',S.panels);}});
