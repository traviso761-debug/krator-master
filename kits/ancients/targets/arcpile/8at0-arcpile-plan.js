// ================================================================= THE PILE — a stack of blocks: the plan (records)
// The Rift's ruined arcology (owner, 2026-10-27), in place of the Arccube: "a pile of blocks, stacked on each other
// with generous spaces in between them, with gardens on the upper surfaces of the blocks", holding about 150 000 at its
// height and tapering to the top, so that "with the destruction or blockage of a few choice elevator shafts and
// stairways, about 20% of the mass can be cut off from ground access with plenty of garden and farming space".
// "The Pile" is a working name. The owner's references: the Interlace (Singapore), Atlantis The Royal, a terraced
// ziggurat with grand outside stairs, towers carrying blocks (kits/ancients/targets/arcpile/NOTES.md).
//
// THE FORM
//   the blocks   slabs 28 m deep (lit from both long sides: no unlit floor) and 10 storeys (36.6 m) tall, laid in TIERS
//                that alternate direction, so every block rests crosswise on the blocks of the tier under it. A quarter
//                of each tier is block; the rest is the space between, gaps of 44-84 m: courts, light, the gardens below.
//   the taper    10 tiers of blocks, 940 m square at the ground narrowing toward 260 m, and on them
//   the capstone a terraced ziggurat (five terraces of three storeys, glass under sloping fascias, decks planted)
//                and its summit pavilion, 435 m up
//   the gardens  every roof that no block of the tier above covers: lawns, orchards, fields
//   the neck     tiers 0-5 are THE BASE; tiers 6-9 and the capstone are THE CROWN, about a fifth of the floor. The crown's lowest
//                storey is a sealed plinth (tanks and structure): no stair passes from a base block into a crown block
//                where they cross. The crown is reached from the ground only by FOUR GREAT CORES (lifts and stairs from
//                the ground to the top) and TWO GRAND STAIRS (open stairs up slots in the east and west faces to the
//                crown's two gate blocks). Base cores stop at the neck; crown cores start there. Cut the four cores at
//                the neck and break the two stairs' last flights, and the crown is an island 220 m up with its gardens.
//
// [G data]: no three.js, no DOM. Every number is a function of the plan's seed and a record's own tier, row and
// index (core/rand: KRAND.hash), never of how many draws came before it. Records carry stable ids (pile.b.6.2.1,
// pile.core.great.0); the ruin is a set of deltas by those ids (ARCPILE.ruin). The drawing (8at1) decides nothing.
const ARCPILE={};
ARCPILE.DIM={NT:12,ST:10,STO:25.6/7,DEP:28,S0:940,S1:260,PITCH:112,NECK:6,
 SEG:[150,290],GAP:[44,74],CANT:50,SKIP:.14,SLOT:20,
 GREAT:{off:96,r:15},BASE:{step:120,r:7,n:18},CROWN:{step:80,r:6,n:10},
 STAIR:{w:16},
 // THE CAPSTONE: blocks stop at tier NB (10); a terraced ziggurat stands on that tier's roofs in place of the top two
 // tiers: five terraces of three storeys, each a glazed band under a heavy sloped fascia with a planted deck, stepping in
 // from 120 m to 50 m (half-widths), and a pavilion on the summit. THE ATRIA: open courts cut down through every terrace
 // and out of its underside, over the gaps between the blocks it stands on, so the sky reaches the courts below; a
 // quarter of its footprint (atria), split round the pavilion where a gap runs under the summit
 NB:10,CAP:{h0:120,h1:50,n:5,st:3,pav:{h:22,y:14},atria:.25},
 // the population: the low case of targets/lozenge/plan (a home needs a window; here every storey has two), 65% of
 // the floor dwellings, 45 m2 gross a person
 SHARE:.65,M2:45};
ARCPILE.TS=ARCPILE.DIM.ST*ARCPILE.DIM.STO;

ARCPILE.u=function(seed,a,b,c){return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0,c==null?0:c|0));};
ARCPILE.half=function(k){const D=ARCPILE.DIM;return (D.S0+(D.S1-D.S0)*k/(D.NT-1))/2;};
// a block's footprint as [x0,x1,z0,z1]
ARCPILE.rect=function(b){const h=ARCPILE.DIM.DEP/2;return b.ax==='x'?[b.a,b.b,b.c-h,b.c+h]:[b.c-h,b.c+h,b.a,b.b];};
ARCPILE.over=function(r,q){const w=Math.min(r[1],q[1])-Math.max(r[0],q[0]),d=Math.min(r[3],q[3])-Math.max(r[2],q[2]);return w>0&&d>0?w*d:0;};
ARCPILE.inter=function(r,q){const o=[Math.max(r[0],q[0]),Math.min(r[1],q[1]),Math.max(r[2],q[2]),Math.min(r[3],q[3])];return o[1]>o[0]&&o[3]>o[2]?o:null;};
ARCPILE.inAtrium=function(P,x,z,m){m=m||0;return P.cap.atria.some(a=>x>a.rect[0]-m&&x<a.rect[1]+m&&z>a.rect[2]-m&&z<a.rect[3]+m);};
ARCPILE.discRect=function(x,z,rad,r){const cx=Math.max(r[0],Math.min(x,r[1])),cz=Math.max(r[2],Math.min(z,r[3]));return (cx-x)*(cx-x)+(cz-z)*(cz-z)<rad*rad;};

// ---- the plan -----------------------------------------------------------------------------------------------------
ARCPILE.plan=function(o){o=o||{};const D=ARCPILE.DIM,S=o.seed==null?9690:o.seed,TS=ARCPILE.TS,U=ARCPILE.u;
 const P={id:'pile',seed:S,dim:D,ts:TS,blocks:[],cores:[],stairs:[],tiers:[]};
 const H6=ARCPILE.half(D.NECK),YN=D.NECK*TS;
 // the rows of every tier first: a tier's gaps are then cut only BETWEEN the next tier's rows, so every block of the
 // tier above crosses unbroken blocks below it and is carried at every row it passes over
 const ROWS=[];
 for(let k=0;k<D.NB;k++){const half=ARCPILE.half(k),pitch=D.PITCH*(k>=D.NECK?.96:1);
  let n=Math.floor((2*half-D.DEP)/pitch)+1;if(k===D.NECK&&n%2===0)n--;   // an odd count at the neck: a row on the axis
  const span=(n-1)*pitch,ph=k===D.NECK?0:(U(S,k,0,1)-.5)*Math.min(pitch*.5,2*half-D.DEP-span),R=[];
  for(let i=0;i<n;i++){const c=Math.round((-span/2+i*pitch+ph+(k===D.NECK?0:(U(S,k,i,2)-.5)*10))*10)/10;
   R.push({i:i,c:c,gate:k===D.NECK&&Math.abs(c)<1,skip:!(k===D.NECK&&Math.abs(c)<1)&&U(S,k,i,3)<D.SKIP});}
  ROWS.push(R);}
 // TOP DOWN. Each tier's segments are laid out first, its gaps cut only between the rows of the tier above; then the
 // tier is made to CARRY the tier above: every block above needs two rows of this tier under it (a skipped row is put
 // back if it must be), and every crossing is under a block (a gap is closed, a row's end run out). Last, bottom up,
 // a block with fewer than two blocks under it is dropped, so nothing in the record floats.
 const DH=D.DEP/2,SEGS=[];
 const slotCut=(k,ax,c,sg)=>{if(k>=D.NECK)return [sg];
  if(ax==='x'&&Math.abs(c)<D.SLOT+DH)return [[Math.max(sg[0],-H6),Math.min(sg[1],H6)]];
  if(ax==='z'&&Math.abs(c)>H6-DH){const o=[];if(sg[0]<-D.SLOT)o.push([sg[0],Math.min(sg[1],-D.SLOT)]);if(sg[1]>D.SLOT)o.push([Math.max(sg[0],D.SLOT),sg[1]]);return o;}
  return [sg];};
 const inSlot=(k,xAlong,zRow,ax)=>{if(k>=D.NECK)return false;const x=ax==='x'?xAlong:zRow,z=ax==='x'?zRow:xAlong;return Math.abs(z)<D.SLOT+DH&&Math.abs(x)>H6-DH;};
 for(let k=D.NB-1;k>=0;k--){const half=ARCPILE.half(k),R=ROWS[k],up=SEGS[k+1]||null;
  // the tier above's crossings: [row index of this tier, coordinate along this row]
  const segs={};
  for(const row of R){const i=row.i,s=[];
   let a=-half-(U(S,k,i,4)<.5?U(S,k,i,5)*D.CANT:0),j=0;const end=half+(U(S,k,i,6)<.5?U(S,k,i,7)*D.CANT:0);
   const blocked=up?up.map(u=>u.c):[];
   while(a<end-40&&j<20){
    const Ln=D.SEG[0]+(D.SEG[1]-D.SEG[0])*U(S,k,i,100+j);let G=D.GAP[0]+(D.GAP[1]-D.GAP[0])*U(S,k,i,200+j);
    let b=Math.min(a+Ln,end);
    // slide the gap off any block above that crosses here
    for(let t=0;t<6&&b<end;t++){const hit=blocked.find(c=>b+G>c-DH-3&&b<c+DH+3);if(!hit)break;b=hit-DH-3-G;}
    if(b-a<50)b=Math.min(a+Ln,end);
    if(end-b<70)b=end;
    s.push([a,b]);a=b+G;j++;}
   if(row.gate)s.splice(0,s.length,[-half,half]);
   segs[i]={row:row,s:s,skip:row.skip};}
  if(up){
   for(const u of up){const lo=Math.min(u.a,u.b),hi=Math.max(u.a,u.b);
    const under=R.filter(r=>r.c>lo+DH&&r.c<hi-DH&&!inSlot(k,u.c,r.c,k%2?'z':'x'));
    let have=under.filter(r=>!segs[r.i].skip).length;
    for(const r of under.slice().sort((p,q)=>Math.abs(p.c-(lo+hi)/2)-Math.abs(q.c-(lo+hi)/2))){if(have>=2)break;if(segs[r.i].skip){segs[r.i].skip=false;have++;}}
    for(const r of under){const g=segs[r.i];if(g.skip)continue;const need0=u.c-DH-4,need1=u.c+DH+4,s=g.s;
     if(need0<s[0][0])s[0][0]=need0;if(need1>s[s.length-1][1])s[s.length-1][1]=need1;
     for(let m=0;m+1<s.length;m++)if(s[m][1]<need1&&s[m+1][0]>need0){s[m][1]=s[m+1][1];s.splice(m+1,1);m--;}}}}
  const out=[];
  for(const row of R){const g=segs[row.i];if(g.skip)continue;
   for(const sg of g.s)for(const p of slotCut(k,k%2?'z':'x',row.c,sg))if(p[1]-p[0]>=60)
    out.push({k:k,i:row.i,c:row.c,a:Math.round(p[0]*10)/10,b:Math.round(p[1]*10)/10,gate:row.gate});}
  SEGS[k]=out;}
 for(let k=0;k<D.NB;k++){const ax=k%2?'z':'x',y0=k*TS,crown=k>=D.NECK;
  const T={k:k,half:ARCPILE.half(k),ax:ax,y0:y0,y1:y0+TS,crown:crown,blocks:[]};P.tiers.push(T);
  for(const sg of SEGS[k]){
   const b={id:'pile.b.'+k+'.'+sg.i+'.'+T.blocks.length,k:k,row:sg.i,ax:ax,c:sg.c,a:sg.a,b:sg.b,
    y0:y0,y1:y0+TS,crown:crown,plinth:k===D.NECK,gate:!!sg.gate};
   if(k>0){const r=ARCPILE.rect(b);if(P.tiers[k-1].blocks.filter(q=>ARCPILE.over(r,ARCPILE.rect(q))>0).length<2)continue;}
   T.blocks.push(b);P.blocks.push(b);}}
 // ---- the capstone ----
 {const C=D.CAP,y0=D.NB*TS,T=[];
  for(let i=0;i<C.n;i++){const h=C.h0+(C.h1-C.h0)*i/(C.n-1),ya=y0+i*C.st*D.STO;T.push({i:i,h:h,y0:ya,y1:ya+C.st*D.STO});}
  const top=T[T.length-1].y1;
  P.cap={id:'pile.cap',y0:y0,terraces:T,pav:{h:C.pav.h,y0:top,y1:top+C.pav.y},top:top+C.pav.y,
   under:P.tiers[D.NB-1].blocks.filter(b=>ARCPILE.over(ARCPILE.rect(b),[-C.h0,C.h0,-C.h0,C.h0])>0).map(b=>b.id)};
  const rows=P.tiers[D.NB-1].blocks,ax=rows.length?rows[0].ax:'z',DH=D.DEP/2,lim=C.h0-14,pv=C.pav.h+8;
  const cs=[...new Set(rows.map(b=>b.c))].sort((a,b)=>a-b),gaps=[];
  for(let i=0;i+1<cs.length;i++){const a=Math.max(cs[i]+DH+5,-lim),b=Math.min(cs[i+1]-DH-5,lim);if(b-a>=20)gaps.push([a,b]);}
  const mid=g=>g[0]<pv&&g[1]>-pv,W=gaps.reduce((t,g)=>t+g[1]-g[0],0),Wm=gaps.filter(mid).reduce((t,g)=>t+g[1]-g[0],0);
  const L=W?Math.min(lim,(C.atria*4*C.h0*C.h0+2*pv*Wm)/(2*W)):0;
  const A=P.cap.atria=[];
  for(const g of gaps){const spans=mid(g)?[[pv,L],[-L,-pv]]:[[-L,L]];
   for(const sp of spans){if(sp[1]-sp[0]<15)continue;const r=ax==='z'?[g[0],g[1],sp[0],sp[1]]:[sp[0],sp[1],g[0],g[1]];
    A.push({id:'pile.cap.atrium.'+A.length,rect:r.map(v=>Math.round(v*10)/10)});}}
  P.cap.atriumArea=A.reduce((t,a)=>t+(a.rect[1]-a.rect[0])*(a.rect[3]-a.rect[2]),0);}
 // ---- the cores ----
 // A core is a shaft of lifts and stairs, and it is built only where it joins things: it stands on the ground or
 // inside a block, it ends at the roof of the highest block it passes through (never in the air), and it joins at
 // least two of the ground and the blocks. Base and crown cores stand where two blocks cross, so each pierces both;
 // base cores from the ground, crown cores from the floor of the lowest crown block they pass through.
 const pierce=(x,z,r,k0,k1)=>P.blocks.filter(b=>b.k>=k0&&b.k<=k1&&ARCPILE.discRect(x,z,r,ARCPILE.rect(b)));
 const G=D.GREAT,far=(x,z,d)=>P.cores.every(c=>Math.hypot(c.x-x,c.z-z)>d);
 for(let q=0;q<4;q++){const x=(q&1?1:-1)*G.off,z=(q&2?1:-1)*G.off,hit=pierce(x,z,G.r,0,D.NB-1);
  // a great core under the capstone runs on up into it, to the roof of the last terrace it fits inside
  const inT=P.cap.terraces.filter(t=>Math.abs(x)+G.r<t.h&&Math.abs(z)+G.r<t.h);
  P.cores.push({id:'pile.core.great.'+q,sys:'great',x:x,z:z,r:G.r,y0:0,y1:inT.length?inT[inT.length-1].y1:Math.max(...hit.map(b=>b.y1)),inCap:inT.length>0});}
 const crossings=(k0,k1)=>{const out=[];
  for(let k=k0;k<k1;k++)for(const b of P.tiers[k].blocks)for(const q of P.tiers[k+1].blocks){const r=ARCPILE.rect(b),s=ARCPILE.rect(q);
   if(ARCPILE.over(r,s)<=0)continue;
   const x=(Math.max(r[0],s[0])+Math.min(r[1],s[1]))/2,z=(Math.max(r[2],s[2])+Math.min(r[3],s[3]))/2;
   out.push({x:Math.round(x*10)/10,z:Math.round(z*10)/10,h:KRAND.hash(S,9001,Math.round(x),Math.round(z))});}
  return out.sort((a,b)=>a.h-b.h);};
 let nb=0;
 for(const c of crossings(0,D.NECK-1)){if(nb>=D.BASE.n)break;const r=D.BASE.r;
  if(Math.abs(c.x)<G.off+40&&Math.abs(c.z)<G.off+40)continue;
  if(Math.abs(c.z)<D.SLOT+20&&Math.abs(c.x)>H6-20)continue;
  if(!far(c.x,c.z,D.BASE.step))continue;
  const hit=pierce(c.x,c.z,r,0,D.NECK-1);if(!hit.some(b=>b.k===0))continue;   // from the ground: it must meet tier 1
  P.cores.push({id:'pile.core.base.'+(nb++),sys:'base',x:c.x,z:c.z,r:r,y0:0,y1:Math.max(...hit.map(b=>b.y1))});}
 let nc=0;
 for(const c of crossings(D.NECK,D.NB-1)){if(nc>=D.CROWN.n)break;const r=D.CROWN.r;
  if(!far(c.x,c.z,D.CROWN.step))continue;
  const hit=pierce(c.x,c.z,r,D.NECK,D.NB-1);if(hit.length<2)continue;
  P.cores.push({id:'pile.core.crown.'+(nc++),sys:'crown',x:c.x,z:c.z,r:r,y0:Math.min(...hit.map(b=>b.y0)),y1:Math.max(...hit.map(b=>b.y1))});}
 // ---- the grand stairs: from the plain at the base's edge up the slot to the gate block's end, at the plinth's top ----
 for(const sx of [-1,1]){const g=P.blocks.find(b=>b.gate);
  const xTop=sx>0?g.b:g.a,yTop=YN+D.STO,xFoot=sx*(D.S0/2+60);
  P.stairs.push({id:'pile.stair.'+(sx>0?'east':'west'),sx:sx,w:D.STAIR.w,x0:xFoot,x1:xTop+sx*2,y0:0,y1:yTop,gate:g.id});}
 ARCPILE.measure(P);
 return P;};

// ---- the circulation graph, the floor, the gardens, the people --------------------------------------------------------
// Who can walk where: the ground to every tier-0 block, every base and great core, both stairs; a block to the blocks
// it crosses in the tiers above and below (stairs at every crossing), except across the neck; a core to every block
// it passes through within its own span (base cores below the neck, crown cores above, great cores all the way); a
// stair to its gate block. reach(P, cut) is the floor that can still walk to the ground with `cut` (ids) removed.
ARCPILE.graph=function(P){const D=P.dim,adj=new Map(),add=(a,b)=>{(adj.get(a)||adj.set(a,[]).get(a)).push(b);(adj.get(b)||adj.set(b,[]).get(b)).push(a);};
 const R=new Map(P.blocks.map(b=>[b.id,ARCPILE.rect(b)]));
 for(const b of P.blocks)if(b.k===0)add('ground',b.id);
 for(let k=1;k<D.NB;k++){if(k===D.NECK)continue;
  for(const b of P.tiers[k].blocks)for(const q of P.tiers[k-1].blocks)if(ARCPILE.over(R.get(b.id),R.get(q.id))>0)add(b.id,q.id);}
 for(const c of P.cores){if(c.sys!=='crown')add('ground',c.id);
  for(const b of P.blocks)if(b.y0>=c.y0-1&&b.y0<c.y1-1&&ARCPILE.discRect(c.x,c.z,c.r,R.get(b.id))){
   if(c.sys==='base'&&b.crown)continue;add(c.id,b.id);}}
 for(const s of P.stairs){add('ground',s.id);add(s.id,s.gate);}
 // the capstone: stairs down into every block it stands on, and the great cores that rise into it
 for(const id of P.cap.under)add(P.cap.id,id);
 for(const c of P.cores)if(c.inCap)add(c.id,P.cap.id);
 return adj;};
ARCPILE.reach=function(P,cut){const adj=ARCPILE.graph(P),seen=new Set(['ground']),q=['ground'],cs=new Set(cut||[]);
 while(q.length){const n=q.pop();for(const m of adj.get(n)||[])if(!seen.has(m)&&!cs.has(m)){seen.add(m);q.push(m);}}
 return seen;};
ARCPILE.floor=function(b){const D=ARCPILE.DIM;return (b.b-b.a)*D.DEP*(b.plinth?D.ST-1:D.ST);};
ARCPILE.measure=function(P){const D=P.dim;let floor=0,crown=0,gard=0,gardC=0;
 for(const b of P.blocks){const f=ARCPILE.floor(b);floor+=f;if(b.crown)crown+=f;
  const r=ARCPILE.rect(b),up=b.k+1<D.NB?P.tiers[b.k+1].blocks:[];
  let cov=0;for(const q of up)cov+=ARCPILE.over(r,ARCPILE.rect(q));
  for(const c of P.cores)if(c.y1>b.y1&&ARCPILE.discRect(c.x,c.z,c.r,r))cov+=Math.PI*c.r*c.r;
  if(b.k===D.NB-1){const ic=ARCPILE.inter(r,[-D.CAP.h0,D.CAP.h0,-D.CAP.h0,D.CAP.h0]);
   if(ic){cov+=ARCPILE.over(r,ic);for(const a of P.cap.atria)cov-=ARCPILE.over(ic,a.rect);}}   // an atrium lets the sky back down
  b.garden=Math.max(0,(r[1]-r[0])*(r[3]-r[2])-cov);gard+=b.garden;if(b.crown)gardC+=b.garden;}
 // the capstone: three storeys a terrace less its atria, the planted ring of every deck a garden
 {const T=P.cap.terraces;let f=0,g=0;
  const net=h=>{let a=4*h*h;for(const at of P.cap.atria)a-=ARCPILE.over([-h,h,-h,h],at.rect);return a;};
  for(let i=0;i<T.length;i++){const a=net(T[i].h);f+=a*D.CAP.st;g+=a-(i+1<T.length?net(T[i+1].h):4*P.cap.pav.h*P.cap.pav.h);}
  P.cap.floor=f;P.cap.garden=g;floor+=f;crown+=f;gard+=g;gardC+=g;}
 const pop=f=>Math.round(f*D.SHARE/D.M2);
 P.stats={blocks:P.blocks.length,floor:floor,crownFloor:crown,crownShare:crown/floor,pop:pop(floor),crownPop:pop(crown),
  garden:gard,crownGarden:gardC,height:P.cap.top,capFloor:P.cap.floor,atria:P.cap.atria.length,atriumShare:P.cap.atriumArea/(4*D.CAP.h0*D.CAP.h0),cores:P.cores.length};
 return P.stats;};
// the cut: the four great cores and the two stairs. What is left of the crown is an island.
ARCPILE.CUT=function(P){return P.cores.filter(c=>c.sys==='great').map(c=>c.id).concat(P.stairs.map(s=>s.id));};

// ---- the ruin: deltas by id ------------------------------------------------------------------------------------------
// What the Rift has made of it (owner, 2026-10-27; the Tungangs and the Loj Nahn live in the crown, their numbers a
// later task). The four great cores are cut at the neck — two fell, two were walled up by the crown's people — and both
// stairs' last flights are down, so the crown is an island.
//   THE CORNER   one corner of the pile is wholly down: every block mostly inside x + z > CORNER is gone, a block the
//                line crosses is torn off at it (b, its far end, is cut back), and what fell lies in a slope of debris
//                in the corner. The diagonal keeps the capstone whole; the other three quarters stand.
//   THE CRASHES  two blocks of the base whose supports failed at one end: each hinges on its other end and drops a
//                tier, its far end crashed through the roof and floors of the block it fell onto.
//   THE BRIDGES  rope bridges the crown's people slung between the roofs of neighbouring crown blocks.
// Nothing is decided by the order of draws: every choice is a hash of the record's id or index.
ARCPILE.CORNER=275;
ARCPILE.ruin=function(P){const D=P.dim,S=P.seed,U=ARCPILE.u,YN=D.NECK*P.ts,DH=D.DEP/2,CN=ARCPILE.CORNER;
 const d={id:'pile.ruin',corner:CN,gone:[],cut:[],cores:[],stairs:[],fallen:[],crashed:[],pierced:[],bridges:[]};
 const R=new Map(P.blocks.map(b=>[b.id,ARCPILE.rect(b)])),mix=(a,b,t)=>a+(b-a)*t;
 // ---- the corner ----
 const frac=r=>{let n=0,m=0;for(let i=0;i<8;i++)for(let j=0;j<4;j++){const x=mix(r[0],r[1],(i+.5)/8),z=mix(r[2],r[3],(j+.5)/4);m++;if(x+z>CN)n++;}return n/m;};
 const gone=new Set(),cutB=new Map();
 for(const b of P.blocks){const r=R.get(b.id),f=frac(r);if(f<=0)continue;
  if(f>.5){gone.add(b.id);continue;}
  const nb=Math.min(b.b,CN-b.c);                                   // the line, met on the block's centre line
  if(nb-b.a<40)gone.add(b.id);else if(nb<b.b)cutB.set(b.id,Math.round(nb*10)/10);}
 const rectOf=q=>cutB.has(q.id)?ARCPILE.rect(Object.assign({},q,{b:cutB.get(q.id)})):R.get(q.id);
 // what lost its carrying: bottom up, a block with no crossing left under it falls too
 for(let k=1;k<D.NB;k++)for(const b of P.tiers[k].blocks){if(gone.has(b.id))continue;
  const rb=rectOf(b);if(!P.tiers[k-1].blocks.some(q=>!gone.has(q.id)&&ARCPILE.over(rb,rectOf(q))>0))gone.add(b.id);}
 // the debris slope: the corner's blocks come down as great torn slabs, lying in the corner, never under the standing pile
 let n=0;
 for(const b of P.blocks){if(!gone.has(b.id))continue;const r=R.get(b.id);
  for(let j=0;j<Math.max(1,Math.round((b.b-b.a)/90));j++){n++;
   let x=(r[0]+r[1])/2+(U(S,7200,n)-.5)*80,z=(r[2]+r[3])/2+(U(S,7201,n)-.5)*80;
   if(x+z<CN+30){const sh=(CN+30-x-z)/2;x+=sh;z+=sh;}
   d.fallen.push({id:b.id+'.fall.'+j,x:Math.round(x),z:Math.round(z),len:40+50*U(S,7202,n),w:DH*2,t:P.ts*(.5+.4*U(S,7203,n)),
    yaw:U(S,7204,n)*Math.PI,tilt:(U(S,7205,n)-.5)*.7});}}
 d.gone=[...gone];d.cut=[...cutB].map(e=>({id:e[0],b:e[1]}));
 // ---- the cores and the stairs ----
 for(const c of P.cores){const q=+c.id.split('.').pop();
  if(c.x+c.z>CN-c.r){d.cores.push({id:c.id,breakY0:Math.min(c.y1,8+20*U(S,7003,q,c.sys.length)),breakY1:c.y1,how:'fell'});continue;}
  if(c.sys==='great')d.cores.push({id:c.id,breakY0:YN-(q&1?22:6),breakY1:YN+(q&1?14:2),how:q&1?'fell':'walled'});
  else if(c.sys==='base'&&U(S,7001,q)<.35)d.cores.push({id:c.id,breakY0:Math.max(c.y0,c.y1-P.ts*(1+Math.floor(U(S,7002,q)*2))),breakY1:c.y1,how:'fell'});}
 for(const s of P.stairs)d.stairs.push({id:s.id,from:s.x0>CN?0:.68});
 // ---- the crashes ----
 const standing=b=>!gone.has(b.id);
 const cands=P.blocks.filter(b=>{if(!standing(b)||b.crown||b.k<2||b.k>5||cutB.has(b.id))return false;const r=R.get(b.id);
   if(r[1]+r[3]>CN-120)return false;
   return !(b.k+1<D.NB&&P.tiers[b.k+1].blocks.some(q=>standing(q)&&ARCPILE.over(r,rectOf(q))>0));})
  .sort((p,q)=>KRAND.hash(S,7300,P.blocks.indexOf(p))-KRAND.hash(S,7300,P.blocks.indexOf(q)));
 for(const b of cands){if(d.crashed.length>=2)break;
  if(d.crashed.some(c=>{const o=P.blocks.find(q=>q.id===c.id);return Math.abs(o.k-b.k)<1&&Math.abs(o.c-b.c)<200;}))continue;
  const end=b.b,len=b.b-b.a,under=P.tiers[b.k-1].blocks.filter(q=>standing(q)&&q.c>end-len*.45&&q.c<end+DH);
  if(!under.length)continue;
  d.crashed.push({id:b.id,pivot:'a',drop:P.ts*.92,angle:Math.atan2(P.ts*.92,len)});
  for(const q of under){const r=rectOf(q),hit=b.ax==='x'?[q.c-DH,q.c+DH,b.c-DH-4,b.c+DH+4]:[b.c-DH-4,b.c+DH+4,q.c-DH,q.c+DH];
   d.pierced.push({id:q.id,by:b.id,rect:ARCPILE.inter(r,hit)||hit,depth:P.ts*.92});}}
 // ---- the rope bridges, between neighbouring crown roofs ----
 for(let k=D.NECK;k<D.NB;k++){const T=P.tiers[k].blocks.filter(standing).sort((p,q)=>p.c-q.c);
  const up=k+1<D.NB?P.tiers[k+1].blocks.filter(standing).map(rectOf):[];
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const p=T[i],q=T[j];if(q.c-p.c>D.PITCH*1.2||q.c-p.c<DH*2+10)continue;
   const pb=cutB.get(p.id)||p.b,qb=cutB.get(q.id)||q.b,a0=Math.max(p.a,q.a)+10,a1=Math.min(pb,qb)-10;if(a1<=a0)continue;
   const t=a0+(a1-a0)*U(S,7400,k,i*31+j),y=p.y1;
   const X=(al,ac)=>p.ax==='x'?[al,ac]:[ac,al],e0=X(t,p.c+DH),e1=X(t,q.c-DH);
   if(up.some(r=>[e0,e1].some(e=>e[0]>r[0]-3&&e[0]<r[1]+3&&e[1]>r[2]-3&&e[1]<r[3]+3)))continue;
   if(k===D.NB-1&&[e0,e1].some(e=>Math.abs(e[0])<D.CAP.h0+3&&Math.abs(e[1])<D.CAP.h0+3))continue;
   if(U(S,7401,k,i*31+j)<.2)continue;
   d.bridges.push({id:'pile.bridge.'+k+'.'+i+'.'+j,from:[e0[0],y,e0[1]],to:[e1[0],y,e1[1]],sag:(q.c-p.c-2*DH)/9});}}
 return d;};
// a block as the ruin leaves it: its extent after a corner cut
ARCPILE.ruinRect=function(b,ruin){const c=ruin&&ruin.cut.find(x=>x.id===b.id);return ARCPILE.rect(c?Object.assign({},b,{b:c.b}):b);};

// ---- the gardens: what grows on the roofs, as records ------------------------------------------------------------------
// Every roof that nothing covers is a garden: a lawn and orchards on the base, fields on the crown (the crown's food).
// THE RUIN (owner, 2026-10-27): the base's roofs and the bare surfaces are left as ground for the Rift's own flora, which
// the settlement placement grows over them (AP_SITE.roofs lists them); only the crown's inhabited roofs are dressed,
// and as REAL FARMS: plots across each roof, a crop in ridged rows, an orchard, a polytunnel, a paddy or fallow ground,
// with sheds, water tanks and people working.
ARCPILE.dress=function(P,ruin){const D=P.dim,S=P.seed,U=ARCPILE.u,out=[],gone=new Set(ruin?ruin.gone:[]);
 const R=new Map(P.blocks.map(b=>[b.id,ARCPILE.ruinRect(b,ruin)]));
 const pierced=ruin?ruin.pierced.map(x=>x.rect):[],crashed=new Set(ruin?ruin.crashed.map(x=>x.id):[]);
 for(const b of P.blocks){if(gone.has(b.id)||crashed.has(b.id))continue;
  if(ruin&&!b.crown)continue;                                     // the Rift's flora grows these
  const r=R.get(b.id),up=b.k+1<D.NB?P.tiers[b.k+1].blocks.filter(q=>!gone.has(q.id)).map(q=>R.get(q.id)):[];
  const bb=b.a+(b.ax==='x'?r[1]-r[0]:r[3]-r[2]);
  const cores=P.cores.filter(c=>c.y1>b.y1);
  const inR=(q,x,z,m)=>x>q[0]-m&&x<q[1]+m&&z>q[2]-m&&z<q[3]+m;
  const covered=(x,z,m)=>up.some(q=>inR(q,x,z,m))||cores.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+m+1)||pierced.some(q=>inR(q,x,z,m))||
   (b.k===D.NB-1&&Math.abs(x)<D.CAP.h0+m&&Math.abs(z)<D.CAP.h0+m&&!ARCPILE.inAtrium(P,x,z,-m));
  const bi=P.blocks.indexOf(b);
  if(ruin){
   // THE FARMS: plots 12 m along the roof, two across it
   const n=Math.floor((bb-b.a-4)/12);
   for(let j=0;j<n;j++)for(const s of [-1,1]){const al=b.a+2+(j+.5)*12,ac=b.c+s*(D.DEP/4);
    const x=b.ax==='x'?al:ac,z=b.ax==='x'?ac:al;if(covered(x,z,6))continue;
    const h=U(S,8700+bi,j,s+1),id='pile.f.'+bi+'.'+j+'.'+(s+1),at=[x,b.y1,z];
    const sub=h<.42?'rows':h<.58?'orchard':h<.7?'tunnel':h<.8?'paddy':h<.88?'fallow':h<.94?'shed':'tank';
    out.push({id:id,kind:'plot',sub:sub,at:at,ax:b.ax,len:11,wid:D.DEP/2-1.2,crop:Math.floor(U(S,8701+bi,j,s+1)*8)});
    if(U(S,8702+bi,j,s+1)<.12)out.push({id:id+'.w',kind:'figure',at:[x+2,b.y1,z+1],ry:h*6.283});}
   continue;}
  const n=Math.floor((b.b-b.a-6)/9);
  for(let j=0;j<n;j++)for(const s of [-1,1]){
   const al=b.a+6+j*9+(U(S,8000+bi,j,s+1)-.5)*3,ac=b.c+s*(D.DEP/4)+(U(S,8100+bi,j,s+1)-.5)*3;
   const x=b.ax==='x'?al:ac,z=b.ax==='x'?ac:al;
   if(covered(x,z,3))continue;
   const h=U(S,8200+bi,j,s+1),id='pile.g.'+bi+'.'+j+'.'+(s+1),at=[x,b.y1,z];
   if(b.crown&&h<.7)out.push({id:id,kind:'bed',at:at,ax:b.ax,len:8,wid:10,crop:Math.floor(U(S,8300+bi,j,s+1)*8)});
   else if(h<(b.crown?.85:.34))out.push({id:id,kind:'tree',at:at,h:5+U(S,8400+bi,j,s+1)*7});
   else if(h>.97)out.push({id:id,kind:'figure',at:at,ry:U(S,8500+bi,j,s+1)*6.283});}}
 // the capstone's decks: a planter row and trees round each; in the ruin, farmed
 const T=P.cap.terraces;
 for(let i=0;i<T.length;i++){const ho=T[i].h-7,y=T[i].y1,n=Math.floor(8*ho/(ruin?12:10));
  for(let j=0;j<n;j++){const t=j/n*8*ho,sd=Math.floor(t/(2*ho)),u=t%(2*ho)-ho;
   const x=[u,ho,-u,-ho][sd],z=[-ho,u,ho,-u][sd],h=U(S,8600+i,j,1);
   if(ARCPILE.inAtrium(P,x,z,4))continue;
   if(ruin){out.push({id:'pile.cap.f.'+i+'.'+j,kind:'plot',sub:h<.6?'rows':h<.8?'orchard':'tunnel',at:[x,y,z],ax:sd%2?'z':'x',len:11,wid:4.4,crop:Math.floor(U(S,8602+i,j,1)*8)});continue;}
   if(h<.35)out.push({id:'pile.cap.g.'+i+'.'+j,kind:'tree',at:[x,y,z],h:4+5*U(S,8601+i,j,1)});
   else out.push({id:'pile.cap.g.'+i+'.'+j,kind:'bed',at:[x,y,z],ax:sd%2?'z':'x',len:8,wid:5,crop:Math.floor(U(S,8602+i,j,1)*8)});}}
 return out;};
