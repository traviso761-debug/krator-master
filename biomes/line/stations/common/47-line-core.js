// ================================================================= LINE — the core every station shares: the section, routes, trains, segments  [G data]
// biomes/line/PLAN.md sections 3, 4, 7 and 8. Each station's 48-line-window.js builds its window of the Line from these: the gallery's section,
// a section's lining profile, the tracks' routes (their arc length, so a track that splays into a station is measured as it runs), the trains'
// consists and the riding hook's car pose (s(t) the fixed A end, car k's middle at s(t) - off_k, bogies at +- b_k), and the segments and gaps
// derived from the tracks' states (a gap: every track cut). The `line` kind's data, held here until KTRANSIT.line takes it (PLAN.md section 12).
// Frame: x across (east +), z along (south +, z = s - SITE.s0), y up from the invert. No three.js, no DOM.
const LK=(function(){
 /* THE GALLERY'S SECTION (PLAN.md section 3; the access road on the west wall: the owner, 2026-11-11) */
 const SEC={x0:-21,x1:16,spring:6,crown:14,lining:.6,
  tracks:[{id:'t1',x:10.5},{id:'t2',x:4.5},{id:'t3',x:-4.5},{id:'t4',x:-10.5}],
  guide:{w:2.8,h:.6,slot:.3},
  strip:{x0:-2.5,x1:2.5,y:.3},
  walk:{x0:13.6,x1:16,y:1.2},
  road:{x0:-19.8,x1:-13.2,y:.2,lane:-16.5,barrier:[-13.2,-12.75],barrierH:.9,foot:[-21,-19.8],footY:.45},
  car:{half:1.8,h:4.4,floor:1.2,margin:.4},
  platformY:1.8,platformGap:.1,          /* a platform's top: the car floor (1.2 over the guideway's 0.6); its edge 0.1 m off the car's side */
  /* the gallery's lining profile: the walls split where floors and openings meet them */
  wsplit:[0,.45,2,4],esplit:[3.4,1.2,0],key:'gallery'};
 const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
 /* a section's inner face over x: walls plumb to `spring`, a flattened elliptical vault to `crown` */
 function ceilOf(S,x){const cx=(S.x0+S.x1)/2,h=(S.x1-S.x0)/2;if(x<=S.x0||x>=S.x1)return S.spring;const u=(x-cx)/h;return S.spring+(S.crown-S.spring)*Math.sqrt(Math.max(0,1-u*u));}
 /* the inner face, west foot to east foot, as [[x, y, len]]: the west wall at its splits, the vault in n steps, the east wall at its splits (top down) */
 function profileOf(S,n){const P=[],cx=(S.x0+S.x1)/2,h=(S.x1-S.x0)/2;n=n||36;
  for(const y of (S.wsplit||[0]).concat([S.spring]))P.push([S.x0,y]);
  for(let i=1;i<n;i++){const a=Math.PI-i/n*Math.PI;P.push([cx+h*Math.cos(a),S.spring+(S.crown-S.spring)*Math.sin(a)]);}
  for(const y of [S.spring].concat(S.esplit||[0]))P.push([S.x1,y]);
  let L=0;return P.map((p,i)=>{if(i)L+=Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]);return [p[0],p[1],L];});}
 /* a route along a track's guideway top from z0 to z1: x by xAt(z) (a track that splays), sampled every `step` m, cum its arc length */
 function makeRoute(xAt,z0,z1,step){step=step||4;const pts=[],cum=[];let L=0,prev=null;
  for(let z=z0;z<=z1+1e-6;z+=step){const p=[xAt(z),SEC.guide.h,z];if(prev)L+=Math.hypot(p[0]-prev[0],p[2]-prev[2]);pts.push(p);cum.push(L);prev=p;}
  return {pts,cum,len:L,z0};}
 /* the point s along a route (s measured from the route's z0: s = z0 + arc length) */
 function routeAt(R,s){const t=Math.max(0,Math.min(R.len,s-R.z0));let lo=0,hi=R.cum.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.cum[m]<=t)lo=m;else hi=m;}
  const a=R.pts[lo],b=R.pts[hi],d=R.cum[hi]-R.cum[lo]||1,u=(t-R.cum[lo])/d;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
 /* THE TRAIN (PLAN.md section 7): two power cars and six between; the rear power car turned half round */
 const CONSIST8=[['anc_line_power',22,7.5,false],['anc_line_saloon',24,8.5,false],['anc_line_saloon',24,8.5,false],['anc_line_crew',24,8.5,false],
  ['anc_line_van',24,8.5,false],['anc_line_van',24,8.5,false],['anc_line_tank',22,7.5,false],['anc_line_power',22,7.5,true]];
 const GAP=1.0,KEPT=15;
 function consist(spec,seed,variant){let off=0;return (spec||CONSIST8).map((c,k)=>{const o={k,key:c[0],variant:variant==null?1:variant,seed:seed+k,len:c[1],b:c[2],flip:c[3],off:off+c[1]/2};off+=c[1]+GAP;return o;});}
 const trainLen=cars=>cars[cars.length-1].off+cars[cars.length-1].len/2;
 /* THE CAR POSE (the riding hook, item 3): car k's middle at s(t) - off_k on T.route, bogies at +- b_k, yaw and pitch rear -> front */
 function carPose(T,k,t){const c=T.cars[k],s=(T.timeline?T.timeline.at(t).value:T.s)-c.off,R=T.route,f=routeAt(R,s+c.b),r=routeAt(R,s-c.b);
  const dx=f[0]-r[0],dy=f[1]-r[1],dz=f[2]-r[2],h=Math.hypot(dx,dz)||1;
  return {x:(f[0]+r[0])/2,y:(f[1]+r[1])/2,z:(f[2]+r[2])/2,yaw:Math.atan2(dx,dz)+(c.flip?Math.PI:0),pitch:Math.atan2(dy,h),roll:0,s,front:f,rear:r};}
 /* SEGMENTS AND GAPS (PLAN.md section 4, derived): a gap where every track is cut (or flooded over 0.6 m); segments between */
 function derive(cond,ids,s0,s1){const cut=(id,s)=>(cond[id]||[]).some(c=>s>=c.s0&&s<c.s1&&(c.state==='cut'||(c.state==='flooded'&&c.depth>.6)));
  const gaps=[],segs=[];let g=null,sg=null;
  for(let s=s0;s<=s1;s+=1){const all=ids.every(id=>cut(id,s));
   if(all){if(sg){segs.push(sg);sg=null;}if(!g)g={s0:s,s1:s};else g.s1=s;}else{if(g){gaps.push(g);g=null;}if(!sg)sg={s0:s,s1:s};else sg.s1=s;}}
  if(g)gaps.push(g);if(sg)segs.push(sg);return {gaps,segments:segs};}
 return {SEC,sm,ceilOf,profileOf,makeRoute,routeAt,CONSIST8,GAP,KEPT,consist,trainLen,carPose,derive};
})();
