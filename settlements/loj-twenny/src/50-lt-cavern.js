// prefix: ltc
// ================================================================= LOJ TWENNY: THE ROCK CARVED (KCAVERN: the station and the hold, one cavern) [G data]
// One KCAVERN (core/terrain/39-core-cavern.js) under the rift fill's 2.2 km: station 3's own void, as the Line's window carves it
// (biomes/line/stations/station/48-line-window.js `cavern()`: the galleries north and south, the station cavern under its vault,
// the rooms behind its doors, the refuge niches, the branch's tube, the great shaft), and every way and site of the hold's plan
// carved from KCITY.cavern.carve(H, {plan: TG.tg.planOf}) (its sidings out through the station's doors, the ramps and stairs
// between the decks, each def's void plan behind its front). At a 0.5 m cell (the Line's own page carves at 1 m; the hold's
// doorways are 1.1 m), so the two are one surface where the hold's streets leave the station's door rooms. The walk floors are
// the Line's (LINE.walk) and the hold's rooms' (the cavern writes those it carves for the plan).
const LTC={cell:.5,chunk:16};
LTC.build=function(W){const H=LT.plan(),SEC=LINE.SEC,CAV=LINE.CAV,L=SEC.lining,WIN=LINE.WIN;
 const C=KCAVERN.create({ground:()=>SITE.cover,cell:LTC.cell,chunk:LTC.chunk,seed:SITE.world,walk:null,minRock:.8});
 /* station 3's own void, as LINE.cavern() has it */
 const room=(id,S,z0,z1)=>C.room({id,owner:'line',poly:[[S.x0-L,z0],[S.x1+L,z0],[S.x1+L,z1],[S.x0-L,z1]],y:-L,h:S.spring+L,ceil:'vault',rise:S.crown-S.spring+L,rock:'tuff',finish:'raw'});
 room('line.gallery.N',SEC,WIN.z0,LINE.CZ0+4);room('line.station',CAV,LINE.CZ0,LINE.CZ1);room('line.gallery.S',SEC,LINE.CZ1-4,WIN.z1);
 LINE.openings.filter(o=>o.kind==='door'||o.kind==='niche').forEach(o=>{const S=o.kind==='niche'?SEC:CAV,d=o.d==null?1.2:o.d,xi=o.wall==='e'?S.x1+L-.1:S.x0-L+.1,xo=o.wall==='e'?S.x1+L+d:S.x0-L-d;
  C.room({id:o.id,owner:'line',poly:[[Math.min(xi,xo),o.z0],[Math.max(xi,xo),o.z0],[Math.max(xi,xo),o.z1],[Math.min(xi,xo),o.z1]],y:o.y0,h:o.y1-o.y0,rock:'tuff',finish:'hewn'});});
 C.tube({id:LINE.branch.id,owner:'line',pts:LINE.branch.pts,w:LINE.branch.w,h:LINE.branch.h,spring:.55,rock:'tuff',finish:'raw'});
 C.shaft({id:LINE.shaft.id,owner:'line',c:LINE.shaft.c,y0:LINE.shaft.y0,y1:120,r0:LINE.shaft.r+.6});
 /* the hold's plan (the station's box is the Line's: skipped) */
 let n=0;const skip={'lt.station':1};
 for(const p of KCITY.cavern.carve(H,{plan:TG.tg.planOf})){if(skip[p.owner])continue;
  if(p.prim==='room')C.room({id:p.id,owner:p.owner,poly:p.poly,y:p.y,h:p.h,finish:'hewn'});
  else if(p.prim==='stair')C.stair({id:p.id,owner:p.owner,a:p.a,b:p.b,w:p.w,h:p.h});
  else if(p.prim==='tube')C.tube({id:p.id,owner:p.owner,pts:p.pts,w:p.w,h:p.h});
  else if(p.prim==='shaft')C.shaft({id:p.id,owner:p.owner,c:p.c,y0:p.y0,y1:p.y1,r0:p.r0,floor:true});
  else continue;n++;}
 C.build();LTC.C=C;LTC.prims=n;
 /* the hold's rooms' floors (the plan's primitives: the station's own floors are LINE.walk's), inset as KCAVERN writes them */
 C.prims.forEach(P=>{if(P.owner==='line')return;if(P.kind==='room')W.poly({pts:P.poly.map(q=>[q[0],q[1],P.y]),name:P.id,tag:'cavern:room'});
  else if(P.kind==='stair')W.strip({a:[P.a[0],P.a[2],P.a[1]],b:[P.b[0],P.b[2],P.b[1]],w:Math.max(.6,P.w-.6),name:P.id,tag:'cavern:stair'});});
 return C;};
/* the chunks worth drawing: those that touch a primitive other than the lined volumes (the hold's rooms and ways, the station's door
   rooms and niches, its branch, the great shaft), so the rock behind the lining is not meshed (the chunk is C.chunk metres) */
LTC.chunksOut=function(C){const cs=C.chunk,LINED={'line.gallery.N':1,'line.gallery.S':1,'line.station':1},g=2;
 const B=C.prims.filter(P=>!LINED[P.id]&&P.box).map(P=>P.box);
 return C.chunks.filter(k=>{const [i,j,kk]=k.split(',').map(Number),x0=i*cs,y0=j*cs,z0=kk*cs;
  return B.some(b=>b[0]-g<x0+cs&&b[1]+g>x0&&b[2]-g<y0+cs&&b[3]+g>y0&&b[4]-g<z0+cs&&b[5]+g>z0);});};
