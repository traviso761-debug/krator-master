// ================================================================= LINE — the bore's window: bore km 208.0-209.2 of the long run, every track kept  [G data]
// biomes/line/PLAN.md section 5, station 1. Built on the shared core (stations/common/47-line-core.js, LK) in the window contract the shared
// fragments read (stations/common/README in INDEX.md): the section by z, the tracks' x by z and their runs, the openings, the lamps, the trains,
// the carved void and the walk. Here the plain gallery all the way: a crossover, the niches every 50 m, the Fixers' vein working, two kept trains.
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1350,walk0:0,walk1:1200};
 const PROF=LK.profileOf(SEC,36);
 const RW=RIFT.window(S0,WIN),trackX=RW.trackX;   /* the window of the one Rift record (47c-line-record.js): its tracks' offsets, states, crossovers */
 /* the refuge niches: every 50 m in the east wall at the walkway's level (openings in the lining) */
 const niches=[];for(let z=25;z<WIN.walk1;z+=50)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h}));
 const crossovers=RW.crossovers;
 const inXO=z=>crossovers.some(X=>z>X.z0-10&&z<X.z1+10);
 /* the lamp code (PLAN.md section 6): green on the walkway's posts, the road's footway and the strip's masts every 50 m (masts off the crossover) */
 const lamps=[];
 for(let z=0;z<=WIN.walk1;z+=50){lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:SEC.walk.y+2.3,z,base:SEC.walk.y});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});}
 for(let z=25;z<WIN.walk1;z+=50)if(!inXO(z))lamps.push({id:'line.lamp.s'+Math.round(S0+z),kind:'green',x:0,y:SEC.strip.y+4,z,base:SEC.strip.y,mast:true});
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10)for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});
 /* THE VEIN (PLAN.md section 2.1): a Fixers' side gallery off the niche at z 725, following the rift fill's rare earths and copper */
 const vein={id:'line.vein.'+Math.round(S0+725),z:725,family:'rare-earth',with:['copper'],grade:'mid',
  pts:[[SEC.x1+SEC.lining+1.2,SEC.walk.y,725],[30,1.0,728],[44,.7,731]],w:2.4,h:2.6,state:'kept'};
 const cond=RW.cond;
 const trackRuns=id=>cond[id].filter(c=>c.state!=='cut').map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(T=>routes[T.id]=LK.makeRoute(z=>trackX(T.id,z),WIN.z0,WIN.z1,4));
 /* THE TRAINS: A passes south on T2, B north on T3, on 4-minute timelines (the page's clock; the long run's real timetable is four hours) */
 const trains=[];
 {const cars=LK.consist(null,11),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT;
  trains.push({id:'line.train.A',track:'t2',route:routes.t2,dir:1,cars,len,timeline:KSCHED.timeline({period:240,segments:[{dur,from:WIN.z0-20,to:WIN.z0-20+run,ease:'linear',name:'run'},{dur:240-dur,from:WIN.z0-20+run,name:'stop:south'}]})});}
 {const cars=LK.consist(null,31),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT,a=WIN.z1+len+20;
  trains.push({id:'line.train.B',track:'t3',route:routes.t3,dir:-1,cars,len,timeline:KSCHED.timeline({period:240,phase:120,segments:[{dur,from:a,to:a-run,ease:'linear',name:'run'},{dur:240-dur,from:a-run,name:'stop:north'}]})});}
 const standing=[{id:'line.work.trolley',key:'tg_trolley',variant:0,seed:3,x:trackX('t1'),y:SEC.guide.h,z:718,yaw:0,label:'The Fixers\' work train at the vein'},
  {id:'line.work.flat',key:'tg_flat',variant:1,seed:2,x:trackX('t1'),y:SEC.guide.h,z:707,yaw:0,label:'The Fixers\' work train at the vein (spoil)'},
  {id:'line.road.van',key:'anc_van',variant:0,seed:5,state:'weathered',x:-17.7,y:SEC.road.y,z:955,yaw:.06,label:'A derelict Ancient service van on the access road'}];
 function cavern(){const L=SEC.lining,C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  C.room({id:'line.gallery',owner:'line',poly:[[SEC.x0-L,WIN.z0],[SEC.x1+L,WIN.z0],[SEC.x1+L,WIN.z1],[SEC.x0-L,WIN.z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'tuff',finish:'raw'});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'tuff',finish:'hewn'}));
  C.tube({id:vein.id,owner:'line',pts:vein.pts,w:vein.w,h:vein.h,spring:.5,rock:'tuff',finish:'raw'});
  return C.build();}
 /* the walk: the section's floors along the gallery, the niches, the vein's gallery; the barrier and the lamp posts as blocks */
 function walk(W){const z0=WIN.z0,z1=WIN.z1;LW.gallery(W,SEC,z0,z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+SEC.lining+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  LW.strips(W,vein.pts,vein.w-.6,'the vein\'s gallery','line.vein');
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,0,l.y],'line.lamppost'));
  return W;}
 return {S0,SEC,WIN,sectionAt:()=>SEC,profileAt:()=>PROF,trackX,trackRuns,gallerySpans:[[WIN.z0,WIN.z1]],openings,niches,crossovers,lamps,crown,vein,cond,routes,trains,standing,
  cavern,walk,
  rockShows:(x0,z0,cs)=>x0+cs>SEC.x1+SEC.lining-2,
  rockWeight:LW.veinWeight(vein),
  floorAt:(x,z)=>LW.sectionFloor(SEC,x,trackX,z),
  lights:[{x:vein.pts[0][0]+1,y:vein.pts[0][1]+2,z:vein.z,color:0xffb060,intensity:2.2,range:26}],
  clearSpans:[[WIN.walk0,WIN.walk1]],lampSpans:[[WIN.walk0,WIN.walk1]],
  works(){return LW.galleryWorks(SEC,WIN,lamps,crown);},
  walkWant:[[SEC.walk.x0+1,SEC.walk.y,600,'the walkway'],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,600,'the road'],[0,SEC.strip.y,600,'the strip'],
   [vein.pts[1][0],vein.pts[1][1],vein.pts[1][2],'the vein\'s gallery']].concat(SEC.tracks.map(T=>[T.x,SEC.guide.h,600,'guideway '+T.id])),
  reach:{start:[SEC.walk.x0+1,SEC.walk.y,600],box:[SEC.walk.x0+.05,48,560,760],note:'along the east side: the walkway, its niches and the vein\'s gallery'},
  records(){const V=vein;return [{name:'The Fixers\' vein working: rare earths and copper in the rift fill (KRES nodes; PLAN.md 2.1)',key:V.id,x:(V.pts[0][0]+V.pts[2][0])/2,z:V.z+3,y:V.pts[0][1],r:15,h:V.h,
   tags:{line:{kind:'vein',family:V.family,with:V.with,grade:V.grade,state:V.state}}}];},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,crossovers,niches,lamps,vein,standing,
   trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
