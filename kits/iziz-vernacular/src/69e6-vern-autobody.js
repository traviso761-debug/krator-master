// ================================================================= 69e6. AUTO BODIES: a kit's solid blocks made hollow where its rooms are planned
// The Highlands and Xanadu kits (2026-11-09; TODO.md "Doors and glass: what is left"): their builders draw each wall block as
// one solid box (hnStucco, hnLogBox, hnFachBox, xnWall ...), so every door was locked and the interiors kit's rooms stood
// inside solid boxes. 69e (vnBody) makes a body hollow where a builder asks for it by name; this asks for it on the
// builder's behalf, so no builder had to be rewritten: while a placement with an interior set item is being built (69e's
// VERN.def wrap opens C.hollow; VERN.interiors on), a box drawn through vB, or a battered block drawn through a kit's own
// mass helper (vaBattered), whose footprint matches one of the item's SHELLS and whose height spans one of its storeys is
// drawn as 69e's hollow body instead: four walls of the shell's thickness, cut where the builder's openings are.
//   shells   the item's bodies (a 4-corner poly, the outer face of the walls; y the floor; levels the storeys) and its
//            `shells` ([{id, at: [x, z], w, d, ry?, y0, h, t?}]: a block the builder draws whose rooms are the item's
//            explicit rooms: a ring hall round its chamber, a keep's storeys)
//   match    every corner of the box within 0.6 m of a corner of the shell (a jetty's oversail, a quoined face), the box
//            1.8 m tall or more, and overlapping the shell's storeys by 1.8 m (or most of the box)
//   floors   the lowest hollow box of a shell gets a floor at the shell's floor height (filled solid below it, a plinth
//            raised inside its walls); a storey higher up is floored by the plan (69e vnIxStructure, the plan drawer)
//   openings vaOpen(x, y, z, ry, w, h, door) cuts a hollow face where a kit's own opening helper stands (hnDoorway,
//            hnPane, xnDoorway ...: the kits wrap their helpers with vaWrapDoorway / vaWrapPane / vaWrapRoom); the
//            Vernacular's vnDoor and vnWin cut it already (69e5)
// A placement without an item, a scaled one, or a page with the interiors off builds exactly what it always did.
// VAUTO.stats(): {matched, bodies by key}. [G data] for the shells and the matching; the boxes are the draw side.
const VAUTO={matched:0,byKey:{},busy:false,
 // the shells of an item, in the builder's frame: {poly, y, top, t, id}
 shells(item){if(item._vaS)return item._vaS;const S=[];
  for(const b of item.bodies||[]){if(!b.poly||b.poly.length!==4)continue;   // a storey per level (a level's own poly: a stepped or battered stack)
   const L=Array.isArray(b.levels)?b.levels:Array.from({length:b.levels==null?1:b.levels},()=>({h:3}));let y=b.y==null?0:b.y;
   L.forEach((l,i)=>{const h=l.h==null?3:l.h,P=l.poly&&l.poly.length===4?l.poly:b.poly;
    S.push({poly:P,y,top:y+h,t:b.wall==null?.3:b.wall,id:b.id+'.'+i,level:i,floor:i?false:undefined,body:true,inset:!!b.inset});y+=h;});}
  for(const s of item.shells||[]){const ry=s.ry||0,P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>loc(s.at[0],s.at[1],a*s.w/2,b*s.d/2,ry));
   S.push({poly:P,y:s.y0,top:s.y0+s.h,t:s.t==null?.4:s.t,id:s.id,floor:s.floor});}
  return item._vaS=S;},
 // the shell a box (a block standing on y, w x d turned by ry) is a storey of, or null
 match(item,x,y,z,w,h,d,ry,k){if(h<1.8||w<2.2||d<2.2)return null;const m=k==null?1:(1+k)/2;   // a battered block: its footprint at mid-height
  const K=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>loc(x,z,a*w*m/2,b*d*m/2,ry||0));
  for(const S of VAUTO.shells(item)){
   const ov=Math.min(y+h,S.top)-Math.max(y,S.y-.6);if(ov<Math.min(1.8,h*.6))continue;
   // an INSET body (the item's `inset: true`: Xanadu's battered and stepped stacks, planned on the footprint every storey
   // shares, inside the builder's blocks): a block that holds the footprint, at most 1.8 m wider a side, is one of its storeys
   const inset=S.inset&&(()=>{const c=loc(x,z,0,0,0),q=S.poly,cx=q.reduce((a,p)=>a+p[0],0)/4,cz=q.reduce((a,p)=>a+p[1],0)/4,c2=Math.cos(ry||0),s2=Math.sin(ry||0);
    return q.every(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],lx=dx*c2-dz*s2,lz=dx*s2+dz*c2;return Math.abs(lx)<=w*m/2+.15&&Math.abs(lz)<=d*m/2+.15&&Math.abs(lx)>=w*m/2-2&&Math.abs(lz)>=d*m/2-2;})&&Math.hypot(cx-x,cz-z)<2;})();
   if(inset||K.every(p=>S.poly.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<.6))){
    // a box spanning several storeys (one block for a two-storey wall) is the lowest storey's: it takes that one's floor
    if(S.level)for(const S0 of VAUTO.shells(item))if(S0.level===0&&S0.id.split('.')[0]===S.id.split('.')[0]&&y<S0.top-.6)return S0;
    return S;}}
  return null;},
 // a matched box as a hollow body (69e vnBody), noted for its floor
 body(S,item,x,y,z,w,h,d,ry,c,k){const C=VERN.cur,B=vnBody(item,x,y,z,w,h,d,ry,c,{t:S.inset?Math.min(.35,S.t):Math.max(.2,Math.min(.6,S.t)),floor:false,k:k||0});   // an inset body's walls no thicker than its plan's: their lean never reaches the rooms
  if(!B)return null;B.shell=S;VAUTO.matched++;VAUTO.byKey[C.D.key]=(VAUTO.byKey[C.D.key]||0)+1;return B;},
 stats(){return{matched:VAUTO.matched,keys:Object.keys(VAUTO.byKey).length,byKey:VAUTO.byKey};}};
// vB: a box that matches a shell is drawn hollow
{const vB0=vB;vB=function(item,x,y,z,w,h,d,ry,c){const C=VERN.cur;
  if(C&&C.hollow&&C.ixItem&&!VAUTO.busy){const S=VAUTO.match(C.ixItem,x,y,z,w,h,d,ry);if(S&&VAUTO.body(S,item,x,y,z,w,h,d,ry,c))return;}
  return vB0.apply(this,arguments);};}
// a battered block (Xanadu's xnWall): flat is the box item its faces are drawn in, k its top as a fraction of the base
// (the kit's xnBatterK); true when it was drawn hollow
function vaBattered(flat,x,y,z,w,h,d,ry,c,k){const C=VERN.cur;if(!C||!C.hollow||!C.ixItem||VAUTO.busy)return false;
 const S=VAUTO.match(C.ixItem,x,y,z,w,h,d,ry,k);if(!S)return false;return !!VAUTO.body(S,flat,x,y,z,w,h,d,ry,c,1-(k==null?1:k));}
// the floors: the lowest hollow box of each shell is floored at the shell's floor (filled below it when the shell stands
// higher than the box's foot); 69e's flush draws the walls
{const fl0=vnHollowFlush;vnHollowFlush=function(C){VAUTO.busy=true;try{fl0.apply(this,arguments);
  const low=new Map();for(const B of C.hollow)if(B.shell&&(!low.has(B.shell)||B.y<low.get(B.shell).y))low.set(B.shell,B);
  for(const [S,B] of low){if(S.floor===false)continue;const t=B.t,fy=Math.max(B.y,S.y),fw=B.w*(1-B.k*Math.max(0,Math.min(1,(fy-B.y)/B.h)))-2*t+.02,
    fd=B.d*(1-B.k*Math.max(0,Math.min(1,(fy-B.y)/B.h)))-2*t+.02;
   if(fy-B.y>.06)vB(B.item,B.x,B.y,B.z,fw,fy-B.y-.04,fd,B.ry,B.c);
   vB('vWood',B.x,fy-.04,B.z,fw,.04,fd,B.ry,vC(VPAL.woodMid[0]).multiplyScalar(.82));}}
 finally{VAUTO.busy=false;}};}
// a kit's own opening on a hollow face: the face is cut (and a second body's wall right behind it), -> the face or null
function vaOpen(x,y,z,ry,w,h,door){const F=typeof vnFaceOf==='function'?vnFaceOf(x,y,z,ry):null;if(!F)return null;
 F.B.ops.push({face:F.face,u:F.u,w,y0:y-F.B.y,y1:y-F.B.y+h,door:!!door});let deep=F.B.t;
 if(door)for(const dd of[.3,.6,.9,1.2]){const q=loc(x,z,0,-dd,ry),F2=vnFaceOf(q[0],y,q[1],ry+Math.PI);if(F2&&F2.B!==F.B){F2.B.ops.push({face:F2.face,u:F2.u,w,y0:y-F2.B.y,y1:y-F2.B.y+h,door:true});deep=dd+F2.B.t;break;}}
 if(door)vaThreshold(x,y,z,ry,w,deep);
 return F;}
// the floor through a doorway cut in a thick wall (or two walls back to back), at the sill, in core/walk: a room's floor
// stops short of its walls (the interiors kit's walk records inset it), so without it a walker could not step through
function vaThreshold(x,y,z,ry,w,deep){if(typeof KWALK==='undefined')return;const hw=Math.max(.3,w/2-.1);
 KWALK.poly({pts:[[-hw,.35],[hw,.35],[hw,-deep-.6],[-hw,-deep-.6]].map(([u,v])=>{const q=loc(x,z,u,v,ry),p=IZDOOR._w(q[0],y,q[1]);return[p[0],p[2],p[1]];}),name:'threshold',tag:'interior:threshold'});}
// the kits' helpers wrapped: a doorway on a hollow face gets its leaf (two for a wide one) in the middle of the wall,
// UNLOCKED (a room is behind it); a pane its glass in the wall and no room card; an unglazed opening a clear hole
function vaWrapDoorway(f0){return function(x,y,z,ry,w,h,o){o=o||{};const F=vaOpen(x,y,z,ry,w,h,true);if(!F)return f0.apply(this,arguments);
 const t=o.t==null?.08:o.t,c=o.c||null,two=o.double==null?w>=1.8:!!o.double,m0=-F.B.t/2;
 if(!two){const m=loc(x,z,0,m0,ry);return[IZDOOR.leaf(m[0],y,m[1],ry,w*.96,h-.04,t,c)];}
 return[-1,1].map(s=>{const m=loc(x,z,s*w/4,m0,ry);return IZDOOR.leaf(m[0],y,m[1],ry,w/2-.02,h-.04,t,c,{mirror:s>0});});};}
function vaWrapPane(f0,items){return function(x,y,z,w,h,d,ry,kind){kind=kind||'glass';const F=vaOpen(x,y,z,ry,w,h,false);if(!F)return f0.apply(this,arguments);
 if(kind==='open')return;const g=loc(x,z,0,.05-F.B.t/2,ry);vB((items&&items[kind])||(kind==='lit'?'vWinLit':'vWinClear'),g[0],y,g[1],w,h,.04,ry);};}
// a def whose builder runs another def's builder in its own placement (a reclaimed or repainted twin: 88-hl-dress.js,
// 88-xa-dress.js) builds the inner one inside the outer's open hollow list: 69e's wrap would open a second list, close it
// and leave the outer's null. The inner build runs with 69e's wrap stood down; its blocks join the outer's bodies
{const def0=VERN.def;VERN.def=function(D){const r=def0.apply(this,arguments),b=D.build;
  D.build=function(G,o){const C=VERN.cur;if(!(C&&C.hollow))return b.apply(this,arguments);
   const f=VERN.interiors;VERN.interiors=false;try{return b.apply(this,arguments);}finally{VERN.interiors=f;}};return r;};}
// the item's planned doors that no builder drew: a body door (the set item's, on its footprint) standing on a hollow face
// with no opening cut within its width is cut and given a leaf (unlocked), so a room the plan enters by a door has one
function vaPlanDoors(C){const it=C.ixItem;if(!it)return;
 for(const b of it.bodies||[])for(const d of b.doors||[]){if(!d.at)continue;const y=b.y==null?0:b.y,P=b.poly;
  // the door's face: the edge of the footprint it stands on, its outward yaw
  let best=null,bd=1e9;for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length],ex=q[0]-a[0],ez=q[1]-a[1],L2=ex*ex+ez*ez||1,
   t=Math.max(0,Math.min(1,((d.at[0]-a[0])*ex+(d.at[1]-a[1])*ez)/L2)),dd=Math.hypot(d.at[0]-a[0]-ex*t,d.at[1]-a[1]-ez*t);if(dd<bd){bd=dd;best=[ex,ez];}}
  if(!best||bd>.6)continue;const cx=P.reduce((s,p)=>s+p[0],0)/P.length,cz=P.reduce((s,p)=>s+p[1],0)/P.length;
  let nx=best[1],nz=-best[0];const nl=Math.hypot(nx,nz)||1;nx/=nl;nz/=nl;if(nx*(d.at[0]-cx)+nz*(d.at[1]-cz)<0){nx=-nx;nz=-nz;}
  const ry=Math.atan2(nx,nz),F=vnFaceOf(d.at[0],y+.1,d.at[1],ry);if(!F)continue;const w=d.w||1;
  if(F.B.ops.some(o=>o.door&&o.face===F.face&&Math.abs(o.u-F.u)<(o.w+w)/2+.3))continue;
  vaOpen(d.at[0],y,d.at[1],ry,w,d.h||2.2,true);const m=loc(d.at[0],d.at[1],0,-F.B.t/2,ry);IZDOOR.leaf(m[0],y,m[1],ry,w*.96,(d.h||2.2)-.04,.07,null);VAUTO.planDoors=(VAUTO.planDoors||0)+1;}}
{const fl1=vnHollowFlush;vnHollowFlush=function(C){if(C.ixItem)try{vaPlanDoors(C);}catch(e){reportErr('vaPlanDoors '+(C.D&&C.D.key)+': '+e);}return fl1.apply(this,arguments);};}
function vaWrapRoom(f0){return function(x,y,z,w,h,d,ry){if(vaOpen(x,y,z,ry,w,h,false))return;return f0.apply(this,arguments);};}
