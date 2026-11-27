// ================================================================= OUTLANDS — the colony pass (OUTLCOL): territories, seams, roles
// [G data] Plain maths of (x, z) on core/rand (KRAND) and core/space (KSPACE): no THREE, no DOM, no Math.random, no Math.sin.
// biomes/outlands/PLAN.md section 4, "The colony rule" and "Territories and seams" (the owner, 2026-11-09). The Outlands' native
// flora is colonial: a buried mycelium raises three or four forms, and colonies that meet wall each other off along a seam.
// This fragment decides WHERE the colonies are and which one holds a point; it draws nothing (60-outl-colonies.js places the
// forms on it, 84-host-ground.js paints the seams). Nothing here reads draw order: every colony is drawn from
// KRAND.hash(seed, cell i, cell j, salt), so a window over the same world finds the same colonies.
//
//   const M=OUTLCOL.create({seed, box:[x0,z0,x1,z1], cell (220), p (.75), types:[{key, reach:[r0,r1], share}],
//                           allow(typeKey, x, z) -> 0 (no) | 1 (reach: the cords only) | 2 (core: the colony feeds there),
//                           seamW:[lo,hi] (2..8 m), warp (25 m), warpScale (1/180), ageK (.7), seeds:[{id, x, z, type}]})
//     seeds     extra colonies where a cell's jittered seed rarely lands (a wadi's 10 m floor): each kept where allow() is 2 for its
//               type, aged by a hash of its id
//     colonies  each cell of `cell` metres holds a colony with chance p: its seed jittered inside the cell, its age a unit
//               draw, its reach R = r0 + age^ageK (r1 - r0) metres (young colonies small, old ones a valley wall); its type
//               one of those whose allow() is 2 (core) at the seed, picked by hash weighted by `share`; none: no colony
//   M.colonies               [{id, n, i, j, type, x, z, age, R}] in cell order (n its index)
//   M.at(x, z, out)          {c, c2, level, d, u, gap, seam, ring} or c null (unclaimed ground). The point is warped by
//                            value noise (warp m) before the distances, so seams wander; allow() reads the true point.
//                            c owns the point: the least POWER distance d^2 - R^2 among the colonies that reach it (d < R)
//                            and are allowed there (a weighted Voronoi: an old colony pushes its border into a young one's).
//                            c2 the runner-up; gap the distance (m) from the point to the c|c2 border (the power bisector:
//                            (p2 - p1) / (2 |c1 - c2|)), or to c's own reach edge when no c2; seam: c2 and gap < half the
//                            pair's seam width; level allow(c.type) at the point; u = d / R; ring = R - d (m inside its edge)
//   M.seamWidth(a, b)        the seam's width between two colonies (m), symmetric, hashed from the pair
//   M.records()              the colonies as core/tags-ready records: {id:'colony:<id>', kind:'colony', type, x, z, age, R}
//   OUTLCOL.ROLES            the five fourth roles and the three common ones (PLAN.md section 4)
(function(root){
'use strict';
var KR=root.KRAND,KS=root.KSPACE;
var nz=function(x,d){return x==null?d:x;};
var ROLES=['collector','drinker','breeder','runner','warden','miner','nurse','pump'];
function create(o){
  if(!KR)throw new Error('OUTLCOL: core/rand (KRAND) must be loaded first');
  if(!KS)throw new Error('OUTLCOL: core/space (KSPACE) must be loaded first');
  if(!o||!o.box||!o.types||!o.allow)throw new Error('OUTLCOL.create: box, types and allow are needed');
  var seed=nz(o.seed,1)>>>0,cell=nz(o.cell,220),p=nz(o.p,.75),ageK=nz(o.ageK,.7),warp=nz(o.warp,25),ws=nz(o.warpScale,1/180);
  var sw=o.seamW||[2,8],allow=o.allow,T=o.types,byKey={};
  T.forEach(function(t){byKey[t.key]=t;});
  var rMax=0;T.forEach(function(t){rMax=Math.max(rMax,t.reach[1]);});
  var b=o.box,i0=Math.floor((b[0]-rMax)/cell),i1=Math.floor((b[2]+rMax)/cell),j0=Math.floor((b[1]-rMax)/cell),j1=Math.floor((b[3]+rMax)/cell);
  var cols=[],S=KS.create({cell:Math.max(64,cell)});
  for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){
    var u=function(k){return KR.unit(KR.hash(seed,i,j,k));};
    if(u(1)>=p)continue;
    var x=(i+.1+.8*u(2))*cell,z=(j+.1+.8*u(3))*cell;
    // the types whose core is at the seed, picked by share
    var cand=[],tot=0;
    for(var k=0;k<T.length;k++)if(allow(T[k].key,x,z)===2){var sh=nz(T[k].share,1);cand.push([T[k],sh]);tot+=sh;}
    if(!cand.length)continue;
    var pick=u(4)*tot,ty=cand[cand.length-1][0];
    for(k=0;k<cand.length;k++){pick-=cand[k][1];if(pick<0){ty=cand[k][0];break;}}
    var age=u(5),R=ty.reach[0]+Math.pow(age,ageK)*(ty.reach[1]-ty.reach[0]);
    var C={id:i+'_'+j,n:cols.length,i:i,j:j,type:ty.key,x:x,z:z,age:age,R:R};
    cols.push(C);S.insert(C,x,z,R);}
  // explicit seeds (o.seeds: [{id, x, z, type}]): ground a cell's jittered seed rarely hits (a wadi's floor); aged by a hash of the id,
  // kept only where their type's core is
  (o.seeds||[]).forEach(function(q,k){var ty=byKey[q.type];if(!ty||allow(q.type,q.x,q.z)!==2)return;
    var h=KR.child(seed,'seed:'+q.id),age=KR.unit(KR.hash(h,1)),R=ty.reach[0]+Math.pow(age,ageK)*(ty.reach[1]-ty.reach[0]);
    var C={id:'s'+q.id,n:cols.length,i:-1000000-k,j:0,type:ty.key,x:q.x,z:q.z,age:age,R:R};cols.push(C);S.insert(C,q.x,q.z,R);});
  var wseed=KR.child(seed,'warp');
  function seamWidth(a,c){var lo=Math.min(a.n,c.n),hi=Math.max(a.n,c.n);
    return sw[0]+(sw[1]-sw[0])*KR.unit(KR.hash(seed,a.i*7919+a.j,c.i*7919+c.j,lo===a.n?1:2,0x5EA));}
  // symmetric: hash the pair in a fixed order
  function seamW2(a,c){return a.n<c.n?seamWidth(a,c):seamWidth(c,a);}
  var buf=[];
  function at(x,z,out){out=out||{};
    var wx=x+warp*(2*KR.fbm(x*ws,.5,z*ws,2,wseed)-1),wz=z+warp*(2*KR.fbm(x*ws+31.7,.5,z*ws-17.3,2,wseed)-1);
    S.query(wx,wz,0,buf);
    var b1=null,b2=null,p1=Infinity,p2=Infinity,d1=0,l1=0;
    for(var k=0;k<buf.length;k++){var C=buf[k],dx=wx-C.x,dz=wz-C.z,dd=dx*dx+dz*dz;if(dd>=C.R*C.R)continue;
      var lv=allow(C.type,x,z);if(!lv)continue;
      var pw=dd-C.R*C.R;
      if(pw<p1){b2=b1;p2=p1;b1=C;p1=pw;d1=Math.sqrt(dd);l1=lv;}else if(pw<p2){b2=C;p2=pw;}}
    out.c=b1;out.c2=b2;out.level=l1;
    if(!b1){out.d=0;out.u=1;out.gap=0;out.seam=false;out.ring=0;return out;}
    out.d=d1;out.u=d1/b1.R;out.ring=b1.R-d1;
    if(b2){var L=Math.hypot(b1.x-b2.x,b1.z-b2.z)||1e-6;out.gap=(p2-p1)/(2*L);out.seam=out.gap<seamW2(b1,b2)/2;}
    else{out.gap=out.ring;out.seam=false;}
    return out;}
  function records(){return cols.map(function(C){return {id:'colony:'+C.id,kind:'colony',type:C.type,x:C.x,z:C.z,age:C.age,R:C.R};});}
  return {colonies:cols,at:at,seamWidth:seamW2,records:records,types:byKey,seed:seed,cell:cell,index:S};}
root.OUTLCOL={create:create,ROLES:ROLES};
})(typeof window!=='undefined'?window:globalThis);
