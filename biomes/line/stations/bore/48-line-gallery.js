// ================================================================= LINE — the gallery: the section, the window's records, the trains, the void  [G data]
// biomes/line/PLAN.md sections 3, 4, 7 and 8. The station's window of the Line: bore km 208.0-209.2 of the long run, south of the south door,
// every track kept. Frame: x across the gallery (east +), z along it (south +, the chainage: z = s - SITE.s0), y up from the invert (the
// running surface's base: y = 0). No three.js, no DOM: the records, the timetables, the car poses and the cavern's plan are plain data.
//
// This is the `line` kind's data for one window, written here until kits/ancient-transit is on main (PLAN.md section 12): the section's
// numbers, the tracks' routes, the crossover, the lamps, the niches and the vein, the trains on KSCHED timelines with the riding hook's car pose
// (PLAN.md section 8: s(t) is the train's fixed A end, car k's middle at s(t) - off_k). When KTRANSIT.line lands, this fragment reads its
// record instead and keeps its output.
//
//   LINE.SEC                the section (PLAN.md section 3): the lining's inner face, the tracks, guideways, strip, walkway, road
//   LINE.profile(n)         the lining's inner face, west foot to east foot: [[x, y, len], ...] (len: the distance along it)
//   LINE.ceilAt(x)          the inner face's height over x (the walls plumb, the vault a flattened ellipse)
//   LINE.niches, .lamps, .crown, .crossover, .vein, .work, .derelict   the window's records (core/tags registers them in 89z)
//   LINE.cond               per track: [{s0, s1, state}] (kept; t1 blocked at the vein's work train)
//   LINE.routes[track]      {pts, cum, len} along the guideway top (the riding hook, item 1)
//   LINE.trains             [{id, track, cars:[{k, key, variant, seed, len, off, b, flip}], timeline (KSCHED), len}]
//   LINE.carPose(T, k, t)   {x, y, z, yaw, pitch, roll} (the riding hook, item 3)
//   LINE.cavern()           the KCAVERN plan carved and built (the gallery room, the niches, the vein's gallery)
//   LINE.walk(W)            the walk floors and blocks into a KWALK registry
const LINE=(function(){
 const S0=SITE.s0;
 /* THE SECTION (PLAN.md section 3; the access road on the west wall: the owner, 2026-11-11) */
 const SEC={x0:-21,x1:16,spring:6,crown:14,lining:.6,
  tracks:[{id:'t1',x:10.5},{id:'t2',x:4.5},{id:'t3',x:-4.5},{id:'t4',x:-10.5}],
  guide:{w:2.8,h:.6,slot:.3},
  strip:{x0:-2.5,x1:2.5,y:.3},
  walk:{x0:13.6,x1:16,y:1.2},
  road:{x0:-19.8,x1:-13.2,y:.2,lane:-16.5,barrier:[-13.2,-12.75],barrierH:.9,foot:[-21,-19.8],footY:.45},
  car:{half:1.8,h:4.4,floor:1.2,margin:.4}};
 SEC.cx=(SEC.x0+SEC.x1)/2;SEC.half=(SEC.x1-SEC.x0)/2;
 const ceilAt=x=>{if(x<=SEC.x0||x>=SEC.x1)return SEC.spring;const u=(x-SEC.cx)/SEC.half;return SEC.spring+(SEC.crown-SEC.spring)*Math.sqrt(Math.max(0,1-u*u));};
 /* the inner face, west foot to east foot: the west wall (split where the footway and road meet it), the vault in n steps, the east wall (split at
    the walkway's floor and the niches' heads, so a niche's opening is whole quads) */
 function profile(n){const P=[];n=n||36;
  for(const y of [0,.45,2,4,SEC.spring])P.push([SEC.x0,y]);
  for(let i=1;i<n;i++){const a=Math.PI-i/n*Math.PI;P.push([SEC.cx+SEC.half*Math.cos(a),SEC.spring+(SEC.crown-SEC.spring)*Math.sin(a)]);}
  for(const y of [SEC.spring,3.4,1.2,0])P.push([SEC.x1,y]);
  let L=0;return P.map((p,i)=>{if(i)L+=Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]);return [p[0],p[1],L];});}
 /* THE WINDOW: walked from z 0 to 1200; carved and lined from -150 to 1350 so its ends are lost in the dark */
 const WIN={z0:-150,z1:1350,walk0:0,walk1:1200};
 /* the refuge niches: every 50 m in the east wall at the walkway's level */
 const niches=[];for(let z=25;z<WIN.walk1;z+=50)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});
 /* the crossover between T2 and T3 (PLAN.md section 3: two flexing beams and the beam between), the central strip (and its masts) cleared over it */
 const crossover={id:'line.xo.'+Math.round(S0+300),a:'t2',b:'t3',z0:300,z1:420,state:'kept'};
 /* THE LAMP CODE (PLAN.md section 6): green on the walkway's posts, the central strip's masts and the road's footway every 50 m (the Line's
    colour: these are kept tracks); amber at the vein's working; the Ancients' crown fittings every 10 m, dead */
 const lamps=[];
 for(let z=0;z<=WIN.walk1;z+=50){lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:SEC.walk.y+2.3,z});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z});}
 for(let z=25;z<WIN.walk1;z+=50)if(z<crossover.z0-10||z>crossover.z1+10)lamps.push({id:'line.lamp.s'+Math.round(S0+z),kind:'green',x:0,y:SEC.strip.y+4,z});
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10)for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:ceilAt(x)-.45});
 /* THE VEIN (PLAN.md section 2.1; the rift fill's copper and rare earths, the geology bake's bytes 120 and 190): a Fixers' side gallery off the
    niche at z 725, following the vein east and a little down; its work train on T1 beside it (the trolley and a flat of spoil) */
 const vein={id:'line.vein.'+Math.round(S0+725),z:725,family:'rare-earth',with:['copper'],grade:'mid',
  pts:[[SEC.x1+SEC.lining+1.2,SEC.walk.y,725],[30,1.0,728],[44,.7,731]],w:2.4,h:2.6,state:'kept'};
 const work=[{id:'line.work.trolley',key:'tg_trolley',variant:0,seed:3,track:'t1',z:718,yaw:0},{id:'line.work.flat',key:'tg_flat',variant:1,seed:2,track:'t1',z:707.5-.5,yaw:0}];
 const derelict=[{id:'line.road.van',key:'anc_van',variant:0,seed:5,state:'weathered',x:-17.7,z:955,yaw:.06}];
 /* the tracks' state (PLAN.md section 3): every track kept; T1 blocked where the work train stands */
 const cond={t1:[{s0:S0+WIN.z0,s1:S0+695,state:'kept'},{s0:S0+695,s1:S0+725,state:'blocked'},{s0:S0+725,s1:S0+WIN.z1,state:'kept'}],
  t2:[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:'kept'}],t3:[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:'kept'}],t4:[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:'kept'}]};
 /* THE ROUTES (the riding hook, item 1): along each guideway's top, sampled every 4 m, in this window's frame */
 const routes={};SEC.tracks.forEach(T=>{const pts=[],cum=[];for(let z=WIN.z0;z<=WIN.z1+1e-6;z+=4){pts.push([T.x,SEC.guide.h,z]);cum.push(z-WIN.z0);}routes[T.id]={pts,cum,len:WIN.z1-WIN.z0};});
 function routeAt(R,s){const t=Math.max(0,Math.min(R.len,s-WIN.z0)),i=Math.min(R.pts.length-2,Math.floor(t/4)),u=(t-R.cum[i])/4,a=R.pts[i],b=R.pts[i+1];
  return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
 /* THE TRAINS (PLAN.md section 7): the long run's kept trains, eight cars each, the Tungangs' livery (variant 1). A passes south on T2, B north on
    T3, on 4-minute timelines (the page's clock; the long run's real timetable is four hours a run). s(t): the A end (facing +z) */
 const CONSIST=[['anc_line_power',22,7.5,false],['anc_line_saloon',24,8.5,false],['anc_line_saloon',24,8.5,false],['anc_line_crew',24,8.5,false],
  ['anc_line_van',24,8.5,false],['anc_line_van',24,8.5,false],['anc_line_tank',22,7.5,false],['anc_line_power',22,7.5,true]];
 const GAP=1.0;
 function consist(seed){let off=0;return CONSIST.map((c,k)=>{const o={k,key:c[0],variant:1,seed:seed+k,len:c[1],b:c[2],flip:c[3],off:off+c[1]/2};off+=c[1]+GAP;return o;});}
 const KEPT=15;   /* m/s: a kept train's speed (PLAN.md section 2) */
 const trains=[];
 {const cars=consist(11),len=cars[cars.length-1].off+cars[cars.length-1].len/2,run=WIN.z1-WIN.z0+len+40,dur=run/KEPT;
  trains.push({id:'line.train.A',track:'t2',dir:1,cars,len,timeline:KSCHED.timeline({period:240,segments:[{dur,from:WIN.z0-20,to:WIN.z0-20+run,ease:'linear',name:'run'},{dur:240-dur,from:WIN.z0-20+run,name:'stop:south'}]})});}
 {const cars=consist(31),len=cars[cars.length-1].off+cars[cars.length-1].len/2,run=WIN.z1-WIN.z0+len+40,dur=run/KEPT,a=WIN.z1+len+20;
  trains.push({id:'line.train.B',track:'t3',dir:-1,cars,len,timeline:KSCHED.timeline({period:240,phase:120,segments:[{dur,from:a,to:a-run,ease:'linear',name:'run'},{dur:240-dur,from:a-run,name:'stop:north'}]})});}
 /* THE CAR POSE (the riding hook, item 3): car k's middle at s(t) - off_k, its bogies at +- b_k along the route, the origin at their midpoint on the
    guideway's top, yaw and pitch from the rear bogie to the front; a flipped car (the rear power car) turned half round */
 function carPose(T,k,t){const c=T.cars[k],s=T.timeline.at(t).value-c.off,R=routes[T.track],f=routeAt(R,s+c.b),r=routeAt(R,s-c.b);
  const dx=f[0]-r[0],dy=f[1]-r[1],dz=f[2]-r[2],h=Math.hypot(dx,dz)||1;
  return {x:(f[0]+r[0])/2,y:(f[1]+r[1])/2,z:(f[2]+r[2])/2,yaw:Math.atan2(dx,dz)+(c.flip?Math.PI:0),pitch:Math.atan2(dy,h),roll:0,s};}
 /* THE VOID (KCAVERN): the gallery as one room the lining's outer face wide (its vault the section's ellipse grown by the lining), the niches as
    rooms behind the east wall, the vein's gallery a tube from the niche's back. One owner: no rock thickness is asked between them */
 function cavern(){const L=SEC.lining,C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  C.room({id:'line.gallery',owner:'line',poly:[[SEC.x0-L,WIN.z0],[SEC.x1+L,WIN.z0],[SEC.x1+L,WIN.z1],[SEC.x0-L,WIN.z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'tuff',finish:'raw'});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'tuff',finish:'hewn'}));
  C.tube({id:vein.id,owner:'line',pts:vein.pts,w:vein.w,h:vein.h,spring:.5,rock:'tuff',finish:'raw'});
  return C.build();}
 /* THE WALK (core/walk): the walkway, the road and its footway, the central strip, the guideways' tops and the invert between them, the niches
    and the vein's gallery; the barrier, the masts and the lamp posts as blocks */
 function walk(W){const z0=WIN.z0,z1=WIN.z1,G=SEC.guide;
  W.floor({rect:[SEC.walk.x0,SEC.walk.x1,z0,z1],y:SEC.walk.y,name:'the walkway (east wall)',tag:'line.walkway'});
  W.floor({rect:[SEC.road.x0,SEC.road.x1,z0,z1],y:SEC.road.y,name:'the access road',tag:'line.road'});
  W.floor({rect:[SEC.road.foot[0],SEC.road.foot[1],z0,z1],y:SEC.road.footY,name:'the road\'s footway',tag:'line.road'});
  W.floor({rect:[SEC.strip.x0,SEC.strip.x1,z0,z1],y:SEC.strip.y,name:'the central strip',tag:'line.strip'});
  SEC.tracks.forEach(T=>W.floor({rect:[T.x-G.w/2,T.x+G.w/2,z0,z1],y:G.h,name:'guideway '+T.id.toUpperCase(),tag:'line.guideway'}));
  const xs=[SEC.road.barrier[1]].concat(SEC.tracks.slice().reverse().map(T=>[T.x-G.w/2,T.x+G.w/2]).flat(),[SEC.walk.x0]);
  xs.splice(xs.indexOf(SEC.tracks[2].x+G.w/2)+1,0,SEC.strip.x0,SEC.strip.x1);
  for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>.05)W.floor({rect:[xs[i],xs[i+1],z0,z1],y:0,name:'the invert',tag:'line.invert'});
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+SEC.lining+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  for(let i=0;i+1<vein.pts.length;i++){const a=vein.pts[i],b=vein.pts[i+1];W.strip({a:[a[0],a[2],a[1]],b:[b[0],b[2],b[1]],w:vein.w-.6,name:'the vein\'s gallery',tag:'line.vein'});}
  W.block([SEC.road.barrier[0],SEC.road.barrier[1],z0,z1,SEC.road.y,SEC.road.y+SEC.road.barrierH],'line.barrier');
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,0,l.y],'line.lamppost'));
  return W;}
 return {SEC,WIN,ceilAt,profile,niches,lamps,crown,crossover,vein,work,derelict,cond,routes,routeAt,trains,carPose,cavern,walk,KEPT,
  /* the export: the window's records as the line kind would hold them */
  export(){return {format:'krator-line-window',version:1,s0:S0,sec:SEC,win:WIN,cond,crossover,niches,lamps,vein,work,derelict,
   trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
