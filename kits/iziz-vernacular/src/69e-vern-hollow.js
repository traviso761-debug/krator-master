// ================================================================= 69e. HOLLOW BODIES: the vernacular's walls with rooms behind them
// The owner (2026-10-16): "Build interiors for the Iziz residences and trade buildings". A builder with an interior draws
// its wall block through vnBody(...) where it used to draw a solid box (vB). With VERN.interiors on (the vernacular sheet;
// ?interiors=0 turns it off) and an item for the def in the interiors kit's Iziz set (kits/interiors/sets/iziz.js), the
// body is FOUR WALLS of thickness t, cut where the builder's own vnDoor / vnWin calls on its faces open them, over a board
// floor; and once the builder returns, the item's planned storeys are drawn inside it in the kit's items (69b): each upper
// floor with its stairwell, the partitions with their doorways, the stairs and ladders (vnIxStructure). With interiors off,
// or no item, or a scaled placement, vnBody draws the solid box it replaced, so a world that never asks (the city, Verge,
// Ys) builds what it always did.
// 69c stays as it is (vendored byte-identical by Dalab, Xanadu, Highlands, Reed Lake and Ys): this wraps VERN.def,
// vnDoor and vnWin by assignment, as 69f does. A door on a hollow face is drawn OPEN (no dark recess, the leaf swung in
// against the wall) and a window has no dark backing plate, so the room shows through; 'shut' boards and glazing stay.
// Every opening on a hollow face is noted for the furnishing (95-iziz-interiors.js): the drawn windows replace the
// planner's own on each room, so furniture keeps clear of the windows the building really has.
//   vnBody(item, x, y, z, w, h, d, ry, c, o)   o = {t: wall thickness (.25), floor: item ('vWood'; false: none), floorC,
//                                              k: batter (0; .07 = the face recedes 7 % of the half-width over the height,
//                                              vpBanco7's; each wall piece is tilted to the face and set back by it)}
//                                              -> the body record, or null when it drew a solid box
//   VERN.interiors     the flag (set by the target: 89z-rows.js)
//   VHOLLOW.jobs       one per hollow placement: {key, item, x, z, ry, y, ops: the drawn openings in the world frame}
const VHOLLOW={jobs:[],bodies:0,walls:0,structure:0,plans:{}};
VERN.interiors=false;
// the interiors kit's item for a def and variant ('<key>#<v>' for a variant whose rooms differ, else the def's own), or null
function vnIxItem(key,v){if(typeof KratorInteriors==='undefined')return null;const S=KratorInteriors.sets;
 const it=(v?S.find(key+'#'+v):null)||S.find(key);return it&&!it.skip?it:null;}
function vnBody(item,x,y,z,w,h,d,ry,c,o){o=o||{};const C=VERN.cur;
 if(!C||!C.hollow){vB(item,x,y,z,w,h,d,ry,c);return null;}
 const B={item,x,y,z,w,h,d,ry:ry||0,c:c||null,t:o.t==null?.25:o.t,k:o.k||0,floor:o.floor==null?'vWood':o.floor,floorC:o.floorC||null,ops:[]};
 C.hollow.push(B);VHOLLOW.bodies++;return B;}
// the face of a hollow body that a point on it (local x, z, outward ry) lies on: {B, face: 0 +z | 1 -z | 2 +x | 3 -x, u}
function vnFaceOf(x,y,z,ry){const C=VERN.cur;if(!C||!C.hollow)return null;
 for(const B of C.hollow){if(y<B.y-.35||y>B.y+B.h)continue;const dx=x-B.x,dz=z-B.z,c=Math.cos(B.ry),s=Math.sin(B.ry);
  const lx=dx*c-dz*s,lz=dx*s+dz*c,a=((ry-B.ry)%TAU+TAU)%TAU;
  const near=(v,t)=>Math.abs(v-t)<.4,dir=t=>Math.min(Math.abs(a-t),TAU-Math.abs(a-t))<.35;
  const f=B.k?Math.max(0,Math.min(1,(y-B.y)/B.h)):0,hd=B.d/2*(1-B.k*f),hw=B.w/2*(1-B.k*f);   // a battered face recedes with height
  if(near(lz,hd)&&Math.abs(lx)<B.w/2&&dir(0))return{B,face:0,u:lx};
  if(near(lz,-hd)&&Math.abs(lx)<B.w/2&&dir(Math.PI))return{B,face:1,u:-lx};
  if(near(lx,hw)&&Math.abs(lz)<B.d/2&&dir(Math.PI/2))return{B,face:2,u:-lz};
  if(near(lx,-hw)&&Math.abs(lz)<B.d/2&&dir(3*Math.PI/2))return{B,face:3,u:lz};}
 return null;}
(function(){
 const _door=vnDoor,_win=vnWin;
 vnDoor=function(x,y,z,ry,w,h,frameItem,c,leafC,step){const F=vnFaceOf(x,y,z,ry);if(!F)return _door.apply(this,arguments);
  F.B.ops.push({face:F.face,u:F.u,w,y0:y-F.B.y,y1:y-F.B.y+h,door:true});
  frameItem=frameItem||'vWood';
  // the leaf, swung in a quarter turn on its -x jamb, standing into the room
  {const hx=-w/2,q=loc(x,z,hx+.04,-F.B.t-w*.46,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry+Math.PI/2,0,0),[w*.92,h-.05,.06],leafC||c||null);}
  for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.09),.12,ry);vB(frameItem,q[0],y,q[1],.18,h+.18,.2,ry,c);}
  const p=loc(x,z,0,.12,ry);vB(frameItem,p[0],y+h+.06,p[1],w+.5,.2,.26,ry,c);
  if(step!==false){const s=loc(x,z,0,.5,ry);vB(frameItem==='vStone'?'vStone':'vWood',s[0],y-.18,s[1],w+.6,.18,.8,ry,c);}
  if(vLit()){vnLamp(x,y+h+.5,z,ry);}
  if(window.DOORS&&VERN.cur){const C=VERN.cur,sc=C.o.scale||1;const wp=loc(C.x,C.z,x*sc,z*sc,C.ry);DOORS.push({x:wp[0],z:wp[1],ry:ry+C.ry,y:(C.o.y||0)+y*sc,key:C.D.key});}};
 vnWin=function(x,y,z,ry,w,h,kind,frameItem,c,shutters){const F=vnFaceOf(x,y,z,ry);if(!F)return _win.apply(this,arguments);
  F.B.ops.push({face:F.face,u:F.u,w,y0:y-F.B.y,y1:y-F.B.y+h,door:false});
  const f=loc(x,z,0,.05-F.B.t/2,ry);   // glazing sits in the middle of the wall; an unglazed window is a clear hole
  if(kind==='lit')vB('vWinLit',f[0],y,f[1],w,h,.06,ry);else if(kind==='glass')vB('vWinGlass',f[0],y,f[1],w,h,.06,ry);
  if(kind==='shut'){const p=loc(x,z,0,.12,ry);for(let k=0;k<Math.round(h/.3);k++)vB('vWood',p[0],y+k*.3,p[1],w+.1,.26,.08,ry,c);}
  frameItem=frameItem||'vWood';const p=loc(x,z,0,.14,ry);
  for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.07),.14,ry);vB(frameItem,q[0],y-.08,q[1],.14,h+.16,.16,ry,c);}
  vB(frameItem,p[0],y+h,p[1],w+.3,.14,.18,ry,c);vB(frameItem,p[0],y-.12,p[1],w+.34,.12,.28,ry,c);
  if(kind==='glass'||kind==='lit'){const g=loc(x,z,0,.05-F.B.t/2,ry);vB(frameItem,g[0],y,g[1],.06,h,.08,ry,c);vB(frameItem,g[0],y+h*.5,g[1],w,.06,.08,ry,c);}
  if(shutters){for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.15+w*.22),.2,ry);kput('vWood',[q[0],y+h/2,q[1]],vQ(ry,0,0).multiply(qEuler(0,-s*.55,0)),[w*.48,h,.05],c||null);}}};
 // every def's builder runs with the hollow list open when its placement takes an interior; the walls and the planned
 // storeys are drawn when it returns, still inside the placement's transform
 const _def=VERN.def;
 VERN.def=function(D){const r=_def.apply(this,arguments),b=D.build;
  D.build=function(G,o){const C=VERN.cur,item=VERN.interiors&&C&&(o.scale||1)===1?vnIxItem(D.key,o.v|0):null;
   if(item){C.hollow=[];C.ixItem=item;}
   const out=b.apply(this,arguments);if(C&&C.bands)vnBandsDraw(C);if(C&&C._stoops&&typeof vnStoopsDraw==='function')vnStoopsDraw(C);
   if(item&&(C.hollow.length||(item.rooms&&item.rooms.length&&!(item.bodies&&item.bodies.length)))){vnHollowFlush(C);vnIxStructure(C,item);}   // an item of explicit rooms only (an open-fronted hall the builder draws as walls) is planned without a hollow body   // a builder that drew no hollow body keeps its solids, and no rooms
   if(item)C.hollow=null;
   return out;};
  return r;};
})();
// the four walls of every hollow body, cut round its openings; the long faces (+z, -z) run the full width, the ends butt in
// (a body standing over another's storey, more than a metre above the lowest, gets no floor plate: the planned floor is its floor)
function vnHollowFlush(C){if(!C.hollow.length)return;const y0=Math.min(...C.hollow.map(B=>B.y));for(const B of C.hollow){const t=B.t;if(B.y>y0+1)B.floor=false;
  for(let f=0;f<4;f++){const along=f<2,L=along?B.w:B.d-2*t,n=f===0?[0,1]:f===1?[0,-1]:f===2?[1,0]:[-1,0];
   // the face's frame: centre at the face, inset t/2; u runs along it as vnFaceOf measures (left to right seen from outside)
   const fr=along?B.d/2-t/2:B.w/2-t/2,cx=n[0]*fr,cz=n[1]*fr,ux=f===0?1:f===1?-1:0,uz=f===2?-1:f===3?1:0;
   const half=along?B.d/2:B.w/2,tilt=B.k?Math.atan(B.k*half/B.h):0,sg=f===0||f===3?-1:1;
   const at=(u,y,len,h)=>{if(len<.02||h<.02)return;let lx=cx+ux*u,lz=cz+uz*u;
    if(tilt){const r=B.k*half*Math.max(0,Math.min(1,(y+h/2-B.y)/B.h));lx-=n[0]*r;lz-=n[1]*r;const p=loc(B.x,B.z,lx,lz,B.ry);   // battered: set back and leaning in
     kput(B.item,[p[0],y+h/2,p[1]],along?vQ(B.ry,sg*tilt,0):vQ(B.ry,0,sg*tilt),[along?len:t,h/Math.cos(tilt),along?t:len],B.c);VHOLLOW.walls++;return;}
    const p=loc(B.x,B.z,lx,lz,B.ry);vB(B.item,p[0],y,p[1],along?len:t,h,along?t:len,B.ry,B.c);VHOLLOW.walls++;};
   const ops=B.ops.filter(o=>o.face===f).map(o=>({a:Math.max(-L/2,o.u-o.w/2),b:Math.min(L/2,o.u+o.w/2),y0:Math.max(0,o.y0),y1:Math.min(B.h,o.y1)}))
    .filter(o=>o.b-o.a>.05).sort((p,q)=>p.a-q.a);
   let u=-L/2;
   for(const o of ops){if(o.a>u)at((u+o.a)/2,B.y,o.a-u,B.h);const a=Math.max(u,o.a);if(o.b>a){
     if(o.y0>.02)at((a+o.b)/2,B.y,o.b-a,o.y0);if(o.y1<B.h-.02)at((a+o.b)/2,B.y+o.y1,o.b-a,B.h-o.y1);}
    u=Math.max(u,o.b);}
   if(u<L/2)at((u+L/2)/2,B.y,L/2-u,B.h);}
  if(B.floor)vB(B.floor,B.x,B.y-.02,B.z,B.w-2*t+.02,.04,B.d-2*t+.02,B.ry,B.floorC||vC(VPAL.woodMid[0]).multiplyScalar(.82));}}
// the planned storeys inside the bodies: the item planned in the placement's own frame (origin, no yaw), so its floors,
// partitions and stairs are drawn in local coordinates; the job for the furnishing is noted with the drawn openings
function vnIxStructure(C,item){const IX=KratorInteriors,inst=VHOLLOW.plans[item.key]||(VHOLLOW.plans[item.key]=IX.sets.instantiate(item,0,0,0,{baseY:0,register:false,seed:0,prefix:'local.'}));   // planned once per item (the city places thousands)
 const rich=(item.wealth||0)>=.7,poor=(item.wealth||0)<.35;
 // (fixed picks, no rng(): the stream after a builder is the next builder's, which reseeds, but nothing here should draw from it)
 const partC=poor?vC(VPAL.woodPoor[0]):vC(rich?0xe8dcc4:VPAL.sand[0]).multiplyScalar(1.05),partI=poor?'vWood':'vPlaster';
 const floorC=vC((rich?VPAL.woodRich:poor?VPAL.woodPoor:VPAL.woodMid)[0]).multiplyScalar(.85),stairC=vC((rich?VPAL.woodRich:VPAL.woodMid)[0]);
 for(const Bd of inst.buildings){
  // upper floors: the outline minus its holes, as boxes on the grid of every corner
  // (the planner's floor is the outer footprint: each box is clipped to its bounds inset by the wall, so no slab edge
  // shows on the facade)
  const wt=(Bd.body&&Bd.body.wall!=null?Bd.body.wall:.25)-.02;
  for(const F of Bd.floors){if(!F.level)continue;const th=F.thick||.25,bx=F.poly.map(p=>p[0]),bz=F.poly.map(p=>p[1]);
   const X0=Math.min(...bx)+wt,X1=Math.max(...bx)-wt,Z0=Math.min(...bz)+wt,Z1=Math.max(...bz)-wt;
   vnRectFill(F.poly,F.holes||[],(x0,x1,z0,z1)=>{x0=Math.max(x0,X0);x1=Math.min(x1,X1);z0=Math.max(z0,Z0);z1=Math.min(z1,Z1);
    if(x1-x0>.02&&z1-z0>.02)vB('vWood',(x0+x1)/2,F.y-th,(z0+z1)/2,x1-x0,th,z1-z0,0,floorC);});VHOLLOW.structure++;}
  // partitions, each with its doorway and the header over it
  for(const Wl of Bd.walls){if(Wl.kind!=='partition')continue;const a=Wl.a,b=Wl.b,len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.05)continue;
   const tx=(b[0]-a[0])/len,tz=(b[1]-a[1])/len,ry=Math.atan2(-tz,tx),th=Wl.thick||.12;
   const seg=(u0,u1,y0,y1)=>{if(u1-u0<.03||y1-y0<.03)return;const m=(u0+u1)/2;vB(partI,a[0]+tx*m,y0,a[1]+tz*m,u1-u0,y1-y0,th,ry,partC);};
   let u=0;for(const o of (Wl.openings||[]).slice().sort((p,q)=>p.u-q.u)){const u0=o.u-o.w/2,u1=o.u+o.w/2;seg(u,u0,Wl.y,Wl.y+Wl.h);seg(u0,u1,Wl.y+(o.y1||2.1),Wl.y+Wl.h);u=u1;}
   seg(u,len,Wl.y,Wl.y+Wl.h);VHOLLOW.structure++;}
  // stairs: a solid flight of steps, or a ladder
  for(const S of Bd.stairs){if(!S.foot)continue;const d=S.dir;
   if(S.kind==='stair'){const n=S.risers,tread=S.run/Math.max(1,n-1),rise=(S.y1-S.y0)/n;
    for(let i=0;i<n-1;i++){const s=i*tread+tread/2;vB('vWood',S.foot[0]+d[0]*s,S.y0,S.foot[1]+d[1]*s,S.w,rise*(i+1),tread,S.ry,stairC);}}
   else{const L=Math.hypot(S.run,S.y1-S.y0),side=[-d[1],d[0]];
    for(const sg of[-1,1])vBeam([S.foot[0]+side[0]*sg*S.w/2,S.y0,S.foot[1]+side[1]*sg*S.w/2],[S.top[0]+side[0]*sg*S.w/2,S.y1,S.top[1]+side[1]*sg*S.w/2],.07,stairC);
    for(let i=1;i<Math.floor(L/.3);i++){const f=i/Math.floor(L/.3);vB('vWood',S.foot[0]+(S.top[0]-S.foot[0])*f,S.y0+(S.y1-S.y0)*f-.02,S.foot[1]+(S.top[1]-S.foot[1])*f,S.w,.04,.05,S.ry,stairC);}}
   VHOLLOW.structure++;}}
 // the job: the openings of every hollow body in the world frame (a window's foot and head as heights above the base)
 const ops=[];for(const B of C.hollow)for(const o of B.ops){if(o.door)continue;const f=o.face,along=f<2,n=f===0?[0,1]:f===1?[0,-1]:f===2?[1,0]:[-1,0];
  const fr=along?B.d/2:B.w/2,ux=f===0?1:f===1?-1:0,uz=f===2?-1:f===3?1:0;const l=loc(B.x,B.z,n[0]*fr+ux*o.u,n[1]*fr+uz*o.u,B.ry),wp=loc(C.x,C.z,l[0],l[1],C.ry);
  ops.push({at:[wp[0],wp[1]],w:o.w,y0:B.y+o.y0,y1:B.y+o.y1});}
 const lv=[];for(const Bd of inst.buildings)for(const L of Bd.levels)lv.push({y:L.y,h:L.h});for(const R of inst.rooms)if(R.explicit)lv.push({y:R.y,h:R.h});
 VHOLLOW.jobs.push({key:C.D.key,name:C.D.name,v:C.o.v|0,item,x:C.x,z:C.z,ry:C.ry,y:C.o.y||0,w:C.D.w,d:C.D.d,ops,levels:lv,r0:C.r0});}
// a rectilinear outline (axis-aligned, any winding) minus rectangular holes, filled with boxes: cut on every corner's x and
// z, keep the cells inside the outline and outside every hole, and join each row's runs
function vnRectFill(poly,holes,box){const xs=new Set(),zs=new Set();for(const P of[poly].concat(holes))for(const p of P){xs.add(+p[0].toFixed(3));zs.add(+p[1].toFixed(3));}
 const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
 const inside=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 for(let j=0;j+1<Z.length;j++){const zm=(Z[j]+Z[j+1])/2;let run=null;
  for(let i=0;i+1<X.length;i++){const xm=(X[i]+X[i+1])/2,on=inside(poly,xm,zm)&&!holes.some(H=>inside(H,xm,zm));
   if(on&&run===null)run=X[i];if(!on&&run!==null){box(run,X[i],Z[j],Z[j+1]);run=null;}}
  if(run!==null)box(run,X[X.length-1],Z[j],Z[j+1]);}}
// a band or string course over a body: the solid slab it always was, or, over a hollow body, a ring whose opening is the
// room below (inset by the wall, t) so the planned floor and stair show through
// A band round a hollow body (its own outline) is drawn when the builder returns (vnBandsDraw), open wherever a door was cut
// in the face it runs along, so a floor-line band is no sill across the doorway (the owner, 2026-10-19: the Order's
// chapterhouse had a 0.9 m whitewash band standing in its door)
function vnBand(item,x,y,z,w,h,d,ry,c,t){const C=VERN.cur;if(!C||!C.hollow){vB(item,x,y,z,w,h,d,ry,c);return;}t=t==null?.3:t;
 const B=C.ixItem?C.hollow.find(B=>Math.hypot(B.x-x,B.z-z)<.5&&Math.abs(B.ry-ry)<.01&&y<B.y+B.h&&y+h>B.y-.4):null;
 if(B){(C.bands=C.bands||[]).push({B,item,x,y,z,w,h,d,ry,c,t});return;}
 for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2-t/2),ry),q=loc(x,z,s*(w/2-t/2),0,ry);vB(item,p[0],y,p[1],w,h,t,ry,c);vB(item,q[0],y,q[1],t,h,d-2*t,ry,c);}}
function vnBandsDraw(C){for(const R of C.bands||[]){const {B,item,x,y,z,w,h,d,ry,c,t}=R;
  const gaps=f=>B.ops.filter(o=>o.door&&o.face===f&&o.y0<y+h-B.y&&o.y1>y-B.y).map(o=>[o.u-o.w/2-.05,o.u+o.w/2+.05]);
  // a run [a, b] along a side, less the gaps (in the side's own coordinate, sgn maps a face's u onto it)
  const runs=(a,b,G,sgn)=>{let out=[[a,b]];for(const g of G){const g0=Math.min(sgn*g[0],sgn*g[1]),g1=Math.max(sgn*g[0],sgn*g[1]),nx=[];for(const r of out){if(g1<=r[0]||g0>=r[1]){nx.push(r);continue;}if(g0>r[0])nx.push([r[0],g0]);if(g1<r[1])nx.push([g1,r[1]]);}out=nx;}return out.filter(r=>r[1]-r[0]>.05);};
  for(const [f,s] of[[0,1],[1,-1]])for(const r of runs(-w/2,w/2,gaps(f),f===0?1:-1)){const p=loc(x,z,(r[0]+r[1])/2,s*(d/2-t/2),ry);vB(item,p[0],y,p[1],r[1]-r[0],h,t,ry,c);}
  for(const [f,s] of[[2,1],[3,-1]])for(const r of runs(-(d/2-t),d/2-t,gaps(f),f===2?-1:1)){const q=loc(x,z,s*(w/2-t/2),(r[0]+r[1])/2,ry);vB(item,q[0],y,q[1],t,h,r[1]-r[0],ry,c);}}
 C.bands=null;}
