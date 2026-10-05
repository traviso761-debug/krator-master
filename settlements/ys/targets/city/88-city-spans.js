// ================================================================= YS CITY — the bridge graph (PLAN.md P3 step 3), as records
// Runs after the placer (88-city-place) and before the lived floors (88a), so the pods it adds are lived round too.
//  1. HOST TO HOST: every pair of neighbouring drowned blocks that both carry a host is joined by a rib bridge. Each
//     host grows a way-in pod facing the other (the bridge enters the host through it), both on plates as near each
//     other in height as the hosts allow (within 8 m) and near the L2 datum (+28); the bridge runs landing to landing,
//     at L2 above +20, at L1 below. A pair whose hosts have no free plate face to face is left to the boats.
//  2. THE AMPHITRITON: a walkway at the quay datum from the shore to the Temple of the Tides' mole, and the drawbridge from
//     the mole's seaward edge up to the Amphitriton's drawbridge port (+12): its one foot link to land.
// The draw pass (88b) builds them with the spans helpers (65-hyk-spans.js) once the pods' landings exist.
const SPANS={list:[],refused:[]};
(function spanPass(){const st=KRAND.stream(KRAND.child(PLACE.SEED,'spans'));
 const byBlock={};for(const h of PLACE.hosts)if(!h.land)byBlock[h.block]=h;
 const ang=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
 // can host h take pod `key` at world floor y, world bearing a? (the cut, its own ledges, the pods it has)
 const fits=(h,key,y,a)=>{const T=YS_HOST_TYPES[h.type],D=HYK.defs[key];if(y+D.h+2>h.top||(T.avoid&&T.avoid(y-h.sink,D.h)))return false;
  const r=h.rAt(y,a);for(const p of h.pods){if(p.core&&p.core!=='A')continue;const E=HYK.defs[p.key];if(y>=p.y+E.h+1||y+D.h<=p.y-1)continue;if(ang(a,p.a)*r<D.w/2+E.w/2+2.5)return false;}return true;};
 const addPod=(h,key,y,a)=>{const D=HYK.defs[key];const p={key,a:+a.toFixed(4),y,level:y>=20?'L2':'L1',into:true,wealth:D.tags.wealth,bridge:true};h.pods.push(p);h.ways.push({a:p.a,y,R:D.w/2});ysPlCount(key);return h.pods.length-1;};
 for(const b of LAYOUT.blocks){const hA=byBlock[b.i+','+b.j];if(!hA)continue;
  for(const [di,dj] of [[1,0],[0,1]]){const hB=byBlock[(b.i+di)+','+(b.j+dj)];if(!hB)continue;
   const aA=Math.atan2(hB.z-hA.z,hB.x-hA.x),aB=aA+Math.PI;
   const kA=ysPlPick(st,PL_WAYS[hA.wealth]),kB=ysPlPick(st,PL_WAYS[hB.wealth]);
   let best=null;for(const yA of hA.plates)for(const yB of hB.plates){if(Math.abs(yA-yB)>8)continue;const c=Math.abs(yA-yB)*3+Math.abs((yA+yB)/2-28);if(best&&c>=best.c)continue;
     if(!fits(hA,kA,yA,aA)||!fits(hB,kB,yB,aB))continue;best={yA,yB,c};}
   if(!best){SPANS.refused.push(hA.n+' / '+hB.n);continue;}
   const iA=addPod(hA,kA,best.yA,aA),iB=addPod(hB,kB,best.yB,aB);
   SPANS.list.push({kind:'bridge',a:{host:hA.n,pod:iA},b:{host:hB.n,pod:iB},level:(best.yA+best.yB)/2>=20?'L2':'L1'});}}
 // the Amphitriton's link: shore -> the Tides mole (walkway, quay datum) -> the drawbridge port (+12)
 const A=LAYOUT.A,Tb=LAYOUT.landmarks.temple_tides;
 if(A&&Tb){const dx=A.x-Tb.x,dz=A.z-Tb.z,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;const fA=[-LAYOUT.N[0],-LAYOUT.N[1]];   // the Amphitriton faces the land
  const Lx=-uz,Lz=ux,lat=34;   /* beside the temple: its back is flush with the mole's seaward edge, its front fills the middle */
  const port={x:A.x+fA[0]*47.7,y:12,z:A.z+fA[1]*47.7};const moleSea={x:Tb.x+ux*29+Lx*lat,y:2.5,z:Tb.z+uz*29+Lz*lat};
  SPANS.list.push({kind:'drawbridge',A:moleSea,B:port,level:'L1'});
  // the shore end: walk landward from the mole's landward edge until the natural ground stands at the quay datum
  const moleLand={x:Tb.x-ux*44+Lx*lat,y:2.5,z:Tb.z-uz*44+Lz*lat};let s=44,shore=null;for(;s<420;s+=4){const x=Tb.x-ux*s+Lx*lat,z=Tb.z-uz*s+Lz*lat;if(terrainH(x,z)>=2.2){shore={x,y:2.5,z};break;}}
  if(shore&&s>50)SPANS.list.push({kind:'walkway',A:shore,B:moleLand,level:'quay'});}
})();
