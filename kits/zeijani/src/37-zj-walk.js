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
/* a floor outline less its stairwells (core/walk polygons have no holes; a level one may be any simple polygon): each convex
   hole is taken away edge by edge, the part outside each edge kept (a half-plane clip), so it holds at any placement's turn.
   The hole's own edges are not inset, so a stair's top meets the floor */
function zwClip(P,a,n){const out=[],s=p=>(p[0]-a[0])*n[0]+(p[1]-a[1])*n[1];for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],sp=s(p),sq=s(q);
  if(sp>=0)out.push(p);if((sp>=0)!==(sq>=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;}
function zwArea(P){let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[1]-b[0]*a[1];}return Math.abs(s/2);}
function zwMinusHoles(poly,holes){let parts=[poly];
 for(const H of holes){const cx=H.reduce((s,p)=>s+p[0],0)/H.length,cz=H.reduce((s,p)=>s+p[1],0)/H.length,next=[];
  for(const P of parts){let rest=P;for(let i=0;i<H.length&&rest.length>=3;i++){const a=H[i],b=H[(i+1)%H.length];let n=[b[1]-a[1],a[0]-b[0]];
    if((cx-a[0])*n[0]+(cz-a[1])*n[1]>0)n=[-n[0],-n[1]];next.push(zwClip(rest,a,n));rest=zwClip(rest,a,[-n[0],-n[1]]);}}
  parts=next.filter(P=>P.length>=3&&zwArea(P)>.05);}
 return parts;}
function zwItem(item,rec,o){o=o||{};if(!item)return null;
 const inst=KratorInteriors.sets.instantiate(item,rec.x,rec.z,rec.ry,{baseY:rec.y,register:false,prefix:zwPrefix(rec)}),carvedDef=!!item.carved;
 /* the floors, walls, stairs and entry flights are the interiors kit's (IX.walk, kits/interiors/src/49b-walk.js): a room marked carved (a carved def's, unless it says carved:false) is the cavern's */
 return KratorInteriors.walk.register(inst,KWALK,{tag:'built:'+rec.key,blockStep:ZW_STEP,
  skipRoom:R=>{const src=(item.rooms||[]).find(r=>(r.id||'')===R.setBody)||{};return src.carved===true||(carvedDef&&src.carved!==false);}});}
