// ================================================================= HIGHLANDS — a great building's rooms drawn from its plan (2026-11-09)
// The Hall of the Republic and the Fortress are planned room by room (their blueprints: kits/highlands/hall/BLUEPRINT.md,
// kits/highlands/fortress/BLUEPRINT.md; their items in kits/interiors/sets/highlands.js: explicit `rooms`, the `shells`
// the builder's blocks become, the `stairs`). With the interiors on, the builder's blocks are hollow (the Vernacular's auto
// bodies, 69e6) and, before it returns, it calls hnPlan() to draw what the rooms need inside them:
//   floors      a slab under every room above its shell's ground floor (less the stairs' wells)
//   partitions  every room edge that is not a shell's wall, once (two rooms that share an edge share one wall), cut at the
//               doors on it; a `rail` edge (a balcony over the chamber, a landing over the vestibule) is a balustrade
//   doors       a leaf (core/door, UNLOCKED: an inner door opens) in every door between two rooms; a door on a shell's wall
//               cuts it (both shells' walls, where two stand back to back), and gets a leaf unless the builder draws one
//               (`drawn`) or it is an opening (`open`)
//   stairs      every flight of `stairs` as solid steps, and a strip in core/walk from its foot to its head
// The rooms' floors, walls and doorways go into core/walk with the furnishing (89y: IX.walk), as for every set item.
//   hnPlan(o) -> {rooms, walls, doors, stairs} drawn, or null when the interiors are off (the builder draws as it always did)
//   hnPlanOn() -> the placement is being built hollow with an item of explicit rooms
//   o: {wallC, wallItem ('vPlaster'), floorC, stairC, railC, t (.2)}
function hnPlanOn(){const C=VERN.cur;return !!(C&&C.hollow&&C.ixItem&&C.ixItem.rooms&&C.ixItem.rooms.length);}
function hnPlan(o){if(!hnPlanOn())return null;o=o||{};const C=VERN.cur,it=C.ixItem,R=it.rooms,t=o.t==null?.2:o.t,out={rooms:R.length,walls:0,doors:0,stairs:0};
 const wallI=o.wallItem||'vPlaster',wallC=o.wallC||hC(HPAL.stucco[0]),floorC=o.floorC||hC(HPAL.pine[0]).multiplyScalar(.8),stairC=o.stairC||hC(HPAL.pine[0]),railC=o.railC||hC(HPAL.redwood[0]);   // fixed picks: no rng() here
 // the shells' ground floors: a room standing on one gets no slab (69e6 floored it)
 const ground=(it.shells||[]).filter(S=>S.floor!==false).map(S=>S.y0);
 const onShellWall=(axis,c,a,b)=>C.hollow.some(B=>{if(Math.abs(Math.sin(B.ry))>.01)return false;const hw=B.w/2,hd=B.d/2,lo=Math.min(a,b),hi=Math.max(a,b);
  if(axis==='z')return(Math.abs(c-(B.z+hd))<.6||Math.abs(c-(B.z-hd))<.6)&&lo>=B.x-hw-.3&&hi<=B.x+hw+.3;
  return(Math.abs(c-(B.x+hw))<.6||Math.abs(c-(B.x-hw))<.6)&&lo>=B.z-hd-.3&&hi<=B.z+hd+.3;});
 // the stairs' wells: where a flight passes within 2.3 m under the floor it climbs to
 const wells=(it.stairs||[]).map(S=>{const a=S.a,b=S.b,f=Math.max(0,(b[2]-a[2]-2.3)/(b[2]-a[2])),p=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],hw=S.w/2+.15;
  return{y:b[2],x0:Math.min(p[0],b[0])-(Math.abs(b[0]-a[0])<.01?hw:0)-.05,x1:Math.max(p[0],b[0])+(Math.abs(b[0]-a[0])<.01?hw:0)+.05,
   z0:Math.min(p[1],b[1])-(Math.abs(b[1]-a[1])<.01?hw:0)-.05,z1:Math.max(p[1],b[1])+(Math.abs(b[1]-a[1])<.01?hw:0)+.05};});
 const box=r=>{const xs=r.poly.map(p=>p[0]),zs=r.poly.map(p=>p[1]);return[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];};
 // ---- the floors
 for(const r of R){if(ground.some(y=>Math.abs(y-r.y)<.3))continue;const[x0,x1,z0,z1]=box(r),th=.3;
  const holes=wells.filter(W=>Math.abs(W.y-r.y)<.3&&W.x1>x0&&W.x0<x1&&W.z1>z0&&W.z0<z1).map(W=>[[W.x0,W.z0],[W.x1,W.z0],[W.x1,W.z1],[W.x0,W.z1]]);
  vnRectFill([[x0-.1,z0-.1],[x1+.1,z0-.1],[x1+.1,z1+.1],[x0-.1,z1+.1]],holes,(a,b,c,d)=>{vB('vWood',(a+b)/2,r.y-th,(c+d)/2,b-a,th,d-c,0,floorC);});}
 // ---- the doors, once each (both rooms list a shared door)
 const D=[];for(const r of R)for(const d of r.doors||[]){if(D.some(q=>Math.hypot(q.at[0]-d.at[0],q.at[1]-d.at[1])<.3&&Math.abs(q.y-r.y)<.5))continue;const[x0,x1,z0,z1]=box(r);D.push(Object.assign({y:r.y,hr:r.h,zline:Math.min(Math.abs(d.at[1]-z0),Math.abs(d.at[1]-z1))<Math.min(Math.abs(d.at[0]-x0),Math.abs(d.at[0]-x1))},d));}
 // ---- the partitions: each line (axis, coordinate) gathers its rooms' edges as rectangles in (u, y), less the doors on it
 const lines=new Map(),rails=[];
 for(const r of R){const[x0,x1,z0,z1]=box(r),y0=r.y,y1=r.y+r.h,rl=r.rail||[];
  for(const [nm,axis,c,a,b] of[['z0','z',z0,x0,x1],['z1','z',z1,x0,x1],['x0','x',x0,z0,z1],['x1','x',x1,z0,z1]]){
   if(rl.includes(nm)){rails.push({axis,c,a,b,y:y0});continue;}if(onShellWall(axis,c,a,b))continue;
   const k=axis+(Math.round(c*20)/20);(lines.get(k)||lines.set(k,{axis,c,rs:[]}).get(k)).rs.push([a,b,y0,y1]);}}
 for(const L of lines.values()){
  const ops=D.filter(d=>Math.abs((L.axis==='z'?d.at[1]:d.at[0])-L.c)<.4).map(d=>{const u=L.axis==='z'?d.at[0]:d.at[1];return[u-d.w/2,u+d.w/2,d.y,d.y+(d.h||Math.min(2.4,d.hr-.2))];});
  const us=new Set(),ys=new Set();for(const q of L.rs.concat(ops)){us.add(+q[0].toFixed(3));us.add(+q[1].toFixed(3));ys.add(+q[2].toFixed(3));ys.add(+q[3].toFixed(3));}
  const U=[...us].sort((a,b)=>a-b),Y=[...ys].sort((a,b)=>a-b),inR=(q,u,y)=>u>q[0]&&u<q[1]&&y>q[2]&&y<q[3];
  for(let j=0;j+1<Y.length;j++){const ym=(Y[j]+Y[j+1])/2;let run=null;
   const end=(u1)=>{if(run!==null&&u1-run>.02){const m=(run+u1)/2,h=Y[j+1]-Y[j];
     if(L.axis==='z')vB(wallI,m,Y[j],L.c,u1-run,h,t,0,wallC);else vB(wallI,L.c,Y[j],m,t,h,u1-run,0,wallC);out.walls++;}run=null;};
   for(let i=0;i+1<U.length;i++){const um=(U[i]+U[i+1])/2,on=L.rs.some(q=>inR(q,um,ym))&&!ops.some(q=>inR(q,um,ym));
    if(on&&run===null)run=U[i];if(!on)end(U[i]);}
   end(U[U.length-1]);}}
 // the balustrades: a rail and its balusters along an open edge, a gap where a door or a stair's head meets it
 for(const L of rails){const gaps=D.filter(d=>Math.abs((L.axis==='z'?d.at[1]:d.at[0])-L.c)<.4&&Math.abs(d.y-L.y)<.5).map(d=>{const u=L.axis==='z'?d.at[0]:d.at[1];return[u-d.w/2,u+d.w/2];});
  let segs=[[L.a,L.b]];for(const g of gaps){const nx=[];for(const s of segs){if(g[1]<=s[0]||g[0]>=s[1]){nx.push(s);continue;}if(g[0]>s[0])nx.push([s[0],g[0]]);if(g[1]<s[1])nx.push([g[1],s[1]]);}segs=nx;}
  for(const s of segs){const len=s[1]-s[0];if(len<.1)continue;const m=(s[0]+s[1])/2,P=u=>L.axis==='z'?[u,L.c]:[L.c,u];
   {const p=P(m);vB('vWood',p[0],L.y+.95,p[1],L.axis==='z'?len:.12,.1,L.axis==='z'?.12:len,0,railC);}
   const n=Math.max(2,Math.round(len/.6));for(let i=0;i<=n;i++){const p=P(s[0]+len*i/n);vB('vWood',p[0],L.y,p[1],.07,.95,.07,0,railC);}}}
 // the leaves: an inner door's in its partition; a door on a shell's wall cuts it
 for(const d of D){if(d.drawn)continue;const zline=d.zline;
  const ry=zline?0:Math.PI/2,h=d.h||Math.min(2.4,d.hr-.2);
  // a shell wall here: cut it, facing whichever way it faces
  let F=null;for(const a of[ry,ry+Math.PI]){F=vaOpen(d.at[0],d.y,d.at[1],a,d.w,h,true);if(F)break;}
  if(!F)vaThreshold(d.at[0],d.y,d.at[1],ry,d.w,.2);   // a partition's doorway: the floor through it (a shell's: vaOpen laid it)
  if(d.open)continue;const m=F?loc(d.at[0],d.at[1],0,-F.B.t/2,F.B.ry+[0,Math.PI,Math.PI/2,-Math.PI/2][F.face]):[d.at[0],d.at[1]];const fry=F?F.B.ry+[0,Math.PI,Math.PI/2,-Math.PI/2][F.face]:ry;
  if(d.w>=1.8){for(const s of[-1,1]){const q=loc(m[0],m[1],s*d.w/4,0,fry);IZDOOR.leaf(q[0],d.y,q[1],fry,d.w/2-.02,h-.04,.07,null,{mirror:s>0});}}
  else IZDOOR.leaf(m[0],d.y,m[1],fry,d.w*.96,h-.04,.06,null);out.doors++;}
 // the stairs: solid steps of at most 0.19 m, each from the flight's foot level; a strip in core/walk
 for(const S of it.stairs||[]){const a=S.a,b=S.b,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),rise=b[2]-a[2],n=Math.max(2,Math.ceil(rise/.19)),tr=L/n,ry=Math.atan2(dx,dz);
  for(let k=0;k<n;k++){const f=(k+.5)/n;vB('vWood',a[0]+dx*f,a[2],a[1]+dz*f,S.w,rise*(k+1)/n,tr+.01,ry,stairC);}
  if(typeof KWALK!=='undefined'){const W2=(x,z,y)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};
   KWALK.strip({a:W2(a[0]-dx/L*.3,a[1]-dz/L*.3,a[2]),b:W2(b[0]+dx/L*.25,b[1]+dz/L*.25,b[2]),w:Math.max(.6,S.w-.1),name:(S.id||'stair')+' flight',tag:'interior:hl-plan'});}
  out.stairs++;}
 return out;}
