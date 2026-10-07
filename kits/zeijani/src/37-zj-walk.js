// ================================================================= WALK: a built def's floors and walls into core/walk
// A carved def's floors come from its void plan (the cavern writes them as it carves). A constructed or wooden def's come
// from the same interiors item the furniture comes from (kits/interiors/sets/zeijani.js), instantiated at its placement:
// each explicit room's floor (its polygon, drawn in by the walker's radius) and its walls as blocks with gaps at its doors;
// each planned body's storeys, wall segments (gaps at their door openings) and stairs. So the walker, the furniture and the
// rooms read one record. A room marked carved (a carved def's, unless it says carved:false) is the cavern's.
const ZW_STEP=.3;
function zwInset(P,d){return KCAVERN.insetPoly(P,d);}
/* wall blocks along a segment a->b at height y0..y1, thickness t, leaving gaps of half-width at the given points */
function zwWall(a,b,y0,y1,t,gaps,tag){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<1e-3)return 0;const n=Math.max(1,Math.ceil(L/ZW_STEP));let k=0;
 for(let i=0;i<n;i++){const u=(i+.5)/n,x=a[0]+dx*u,z=a[1]+dz*u;if(gaps.some(g=>Math.hypot(x-g[0],z-g[1])<g[2]))continue;
  const h=Math.max(t,ZW_STEP)/2;KWALK.block([x-h,x+h,z-h,z+h,y0,y1],tag);k++;}return k;}
function zwItem(item,rec,o){o=o||{};if(!item)return null;const out={floors:0,blocks:0,strips:0};
 const inst=KratorInteriors.sets.instantiate(item,rec.x,rec.z,rec.ry,{baseY:rec.y,register:false,prefix:(rec.tid||rec.key)+'.'});
 const tag='built:'+rec.key,carvedDef=!!item.carved;
 for(const R of inst.rooms){if(R.setBody&&inst.buildings.length&&!R.explicit)continue;
  const src=(item.rooms||[]).find(r=>(r.id||'')===R.setBody)||{};if(src.carved===true||(carvedDef&&src.carved!==false))continue;
  KWALK.poly({pts:zwInset(R.poly,.3).map(p=>[p[0],p[1],R.y]),name:R.id,tag});out.floors++;
  /* the room's own walls, a half-thickness out from its inner face, open at its doors */
  const t=src.wall||item.wall||.22,ring=zwInset(R.poly,-t/2),gaps=R.doors.map(d=>[d.at[0],d.at[1],d.w/2+.15]);
  for(let i=0;i<ring.length;i++)out.blocks+=zwWall(ring[i],ring[(i+1)%ring.length],R.y,R.y+R.h,t,gaps,tag);}
 for(const B of inst.buildings){
  for(const F of B.floors)KWALK.poly({pts:zwInset(F.poly,.3).map(p=>[p[0],p[1],F.y]),name:B.id+'.floor.'+F.level,tag}),out.floors++;
  for(const Wl of B.walls){const dx=Wl.b[0]-Wl.a[0],dz=Wl.b[1]-Wl.a[1],L=Math.hypot(dx,dz)||1;
   const gaps=(Wl.openings||[]).filter(q=>q.door).map(q=>[Wl.a[0]+dx*(q.u/L),Wl.a[1]+dz*(q.u/L),q.w/2+.1]);
   out.blocks+=zwWall(Wl.a,Wl.b,Wl.y,Wl.y+(Wl.h||2.6),Wl.thick||.22,gaps,tag);}
  const G=B.graph||{nodes:[]};for(const S of B.stairs){const f=G.nodes.find(n=>n.tag==='stairfoot'&&n.ref===S.id),tp=G.nodes.find(n=>n.tag==='stairtop'&&n.ref===S.id);
   if(f&&tp){KWALK.strip({a:[f.x,f.z,f.y],b:[tp.x,tp.z,tp.y],w:Math.max(.6,S.w-.3),name:S.id,tag});out.strips++;}}}
 return out;}
