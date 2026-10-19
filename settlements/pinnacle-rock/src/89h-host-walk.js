// ================================================================= HOST — the walk registry (core/walk): the floors the ground does not carry
// Every floor the plans made that the page's ground (terrainH: the floor, the debris slope, the tops) does not hold, in
// KWALK (core/walk/20-core-walk.js), so the walker (core/host: F), the minimap and the Godot export stand on what was
// built: each roost deck's ring (a quad per sample of its edge), every tread of the climbs and the ways up the Garden and
// the Heart, the bridges, the Stair's flights and landings, the lift road. The Deep Root writes its own (KCAVERN, 57b).
// The town, the farms and the camps stand on the ground.
const WALK_FLOORS=(function(){if(typeof KWALK==='undefined')return null;const W=KWALK;let n=0;
 const strip=(a,b,w,name,tag)=>{W.strip({a:[a[0],a[2],a[1]],b:[b[0],b[2],b[1]],w,name,tag});n++;};   /* core/walk's points are [x, z, y] */
 ROOST.decks.forEach(D=>{const N=D.inner.length;for(let i=0;i<N;i++){const j=(i+1)%N,a=D.inner[i],b=D.inner[j],c=D.outer[j],d=D.outer[i];
  W.poly({pts:[[a[0],a[1],D.y],[b[0],b[1],D.y],[c[0],c[1],D.y],[d[0],d[1],D.y]],name:D.id,tag:'roost.deck'});n++;}});
 ROOST.climbs.concat(ROOST.ascents||[]).forEach(C=>{const P=C.pts;for(let i=1;i<P.length;i++)strip(P[i-1],P[i],C.w,C.id,C.kind==='ramp'?'roost.ramp':'roost.climb');});
 ROOST.bridges.forEach(B=>strip([B.a.x,B.a.y,B.a.z],[B.b.x,B.b.y,B.b.z],B.w||2.4,B.id,'roost.bridge'));
 if(ROOST.stair){const P=ROOST.stair.pts;for(let i=1;i<P.length;i++)strip(P[i-1],P[i],Math.max(P[i-1][6]||3,P[i][6]||3),'the Stair','roost.stair');}
 (ROOST.roads||[]).forEach(Rd=>{const P=Rd.pts;for(let i=1;i<P.length;i++)strip(P[i-1],P[i],Rd.w,Rd.id,'road');});
 return {floors:n};})();
_mark('walk');
