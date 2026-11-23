// ================================================================= LINE — the breach's window: bore km 224.55-225.75, the bore beside a hypogene chamber  [G data]
// biomes/line/PLAN.md section 5, station 5: the join of built and natural. The plain kept gallery; at z 448-478 the Ancients' works in the east
// wall: a BULKHEAD (a steel door in a bronze frame) onto a hewn landing, a glazed WINDOW at the end of a short passage looking into the chamber, and
// from the landing a STAIR cut 21 m down to the chamber's floor; the CHAMBER (a KCAVERN hall, its west side a few metres behind the lining) and,
// joined to it by a passage, the cave's RISING MAZE beyond (KKARST 'hypogene': its storey at the chamber's floor, the gypsum crust round the water
// table, KSPELEO's hypogene dress owed). The Tungangs' green lamps lead down the stair and across the chamber floor; bad air pools on it.
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1050,walk0:0,walk1:900},G=SEC.guide,L=SEC.lining,WY=SEC.walk.y;
 const PROF=LK.profileOf(SEC,36);
 const RW=RIFT.window(S0,WIN),trackX=RW.trackX;   /* the window of the one Rift record (47c-line-record.js): its tracks' offsets, states, crossovers */
 /* THE CAVE: the chamber, the stair, the landing, the window's passage, the maze beyond (its storey at the chamber's floor) */
 const FLOOR=-20,TABLE=-18;
 const chamber={id:'line.breach.chamber',name:'The hypogene chamber the bore passed',c:[40,FLOOR,495],rx:18,rz:45,h:28,belly:.25};
 const landing={id:'line.breach.landing',x0:SEC.x1+L+1.4,x1:26,z0:447,z1:457,y:WY,h:2.8};
 const stair={id:'line.breach.stair',a:[24.5,WY,455],b:[24.5,FLOOR,515],w:2.6,h:3.2};
 const window_={id:'line.breach.window',x0:SEC.x1+L-.1,x1:30.5,z0:470,z1:478,y:WY,h:2.2};
 const karst=KKARST.network({box:[62,300,262,700],ground:()=>SITE.cover,world:SITE.world,kind:'hypogene',level:FLOOR,table:TABLE,form:'maze',p:.45,joints:{angle:.35,sp:34},
  feeders:{cell:140,p:.8,depth:60,r:[1.5,3]},chamber:{p:.3,r:[9,18],h:[7,14]},cupola:false,temp:33});
 const near=karst.nodes.filter(n=>n.level===0||n.level==null).reduce((b,n)=>{const d=Math.hypot(n.x-58,n.z-495);return !b||d<b.d?{n,d}:b;},null);
 const join=near?{id:'line.breach.join',pts:[[56,FLOOR,495],[near.n.x,near.n.y,near.n.z]],w:4,h:3.6}:null;
 /* THE OPENINGS: the niches (off the breach's works), the bulkhead, the window */
 const niches=[];for(let z=25;z<WIN.walk1;z+=50)if(z<430||z>495)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:WY});
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h}))
  .concat([{id:'line.breach.bulkhead',kind:'door',name:'The bulkhead onto the chamber (the Ancients\' steel door)',wall:'e',z0:448,z1:452,y0:WY,y1:WY+2.2},
   {id:window_.id,kind:'window',name:'The window onto the chamber (glazed)',wall:'e',z0:window_.z0,z1:window_.z1,y0:WY,y1:WY+2.2}]);
 const cond=RW.cond;
 const trackRuns=id=>cond[id].map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(t=>routes[t.id]=LK.makeRoute(z=>trackX(t.id,z),WIN.z0,WIN.z1,4));
 /* THE LAMPS: the code on the ways; a white hooded lamp at the bulkhead (bad air below); green down the stair and across the chamber */
 const lamps=[];
 for(let z=0;z<=WIN.walk1;z+=50){if(z>435&&z<485)continue;lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:WY+2.3,z,base:WY});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});
  if(z+25<WIN.walk1)lamps.push({id:'line.lamp.s'+Math.round(S0+z+25),kind:'green',x:0,y:SEC.strip.y+4,z:z+25,base:SEC.strip.y,mast:true});}
 lamps.push({id:'line.lamp.white.bulkhead',kind:'white',x:15.6,y:WY+2.8,z:445.5,base:WY});
 const path=[];
 for(let k=1;k<=4;k++){const t=k/5,y=stair.a[1]+(stair.b[1]-stair.a[1])*t,z=stair.a[2]+(stair.b[2]-stair.a[2])*t;path.push({x:stair.a[0]-1.15,y,z});}
 for(const [x,z] of [[30,512],[38,500],[46,488],[52,478]])path.push({x,y:FLOOR,z});
 path.forEach((p,k)=>lamps.push({id:'line.lamp.path.'+k,kind:'green',x:p.x,y:p.y+2.3,z:p.z,base:p.y,path:true}));
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10)for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});
 /* THE TRAINS: two kept trains passing, as on the long run */
 const trains=[];
 {const cars=LK.consist(null,161),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT;
  trains.push({id:'line.train.A',track:'t2',route:routes.t2,dir:1,cars,len,timeline:KSCHED.timeline({period:240,segments:[{dur,from:WIN.z0-20,to:WIN.z0-20+run,ease:'linear',name:'run'},{dur:240-dur,from:WIN.z0-20+run,name:'stop:south'}]})});}
 {const cars=LK.consist(null,171),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT,a=WIN.z1+len+20;
  trains.push({id:'line.train.B',track:'t3',route:routes.t3,dir:-1,cars,len,timeline:KSCHED.timeline({period:240,phase:120,segments:[{dur,from:a,to:a-run,ease:'linear',name:'run'},{dur:240-dur,from:a-run,name:'stop:north'}]})});}
 /* THE VOID */
 function cavern(){const C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  C.room({id:'line.gallery',owner:'line',poly:[[SEC.x0-L,WIN.z0],[SEC.x1+L,WIN.z0],[SEC.x1+L,WIN.z1],[SEC.x0-L,WIN.z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'tuff',finish:'raw'});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'tuff',finish:'hewn'}));
  C.room({id:'line.breach.bulkhead.way',owner:'line',poly:[[SEC.x1+L-.1,448],[landing.x0+.5,448],[landing.x0+.5,452],[SEC.x1+L-.1,452]],y:WY,h:2.2,rock:'tuff',finish:'hewn'});
  C.room({id:landing.id,owner:'line',poly:[[landing.x0,landing.z0],[landing.x1,landing.z0],[landing.x1,landing.z1],[landing.x0,landing.z1]],y:landing.y,h:landing.h,rock:'tuff',finish:'hewn'});
  C.stair({id:stair.id,owner:'line',a:stair.a,b:stair.b,w:stair.w,h:stair.h,rock:'tuff',finish:'hewn'});
  C.room({id:window_.id,owner:'line',poly:[[window_.x0,window_.z0],[window_.x1,window_.z0],[window_.x1,window_.z1],[window_.x0,window_.z1]],y:window_.y,h:window_.h,rock:'tuff',finish:'hewn'});
  C.hall({id:chamber.id,owner:'line',c:chamber.c,rx:chamber.rx,rz:chamber.rz,h:chamber.h,belly:chamber.belly,blend:4,rock:'tuff',finish:'raw'});
  if(join)C.tube({id:join.id,owner:'line',pts:join.pts,w:join.w,h:join.h,spring:.5,rock:'tuff',finish:'raw'});
  KKARST.build(C,karst,{rock:'tuff'});
  return C.build();}
 /* THE WALK: the gallery; the niches; the bulkhead's sill and the landing; the stair; the chamber's floor; the lamp posts as blocks */
 function walk(W){LW.gallery(W,SEC,WIN.z0,WIN.z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+L+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  W.floor({rect:[SEC.x1-.1,landing.x1,448,452],y:WY,name:'the bulkhead\'s sill',tag:'line.breach'});
  W.floor({rect:[landing.x0,landing.x1,landing.z0,landing.z1],y:WY,name:'the landing',tag:'line.breach'});
  W.strip({a:[stair.a[0],stair.a[2],stair.a[1]],b:[stair.b[0],stair.b[2],stair.b[1]],w:stair.w-.2,name:'the stair down to the chamber',tag:'line.breach'});
  W.floor({rect:[23.6,28,505,525],y:FLOOR,name:'the stair\'s foot',tag:'line.cave'});
  W.floor({rect:[28,52,465,525],y:FLOOR,name:'the chamber\'s floor',tag:'line.cave'});
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 const CHK={
  behind(x,ys){const bad=[];for(let z=420;z<=560;z+=2){if(openings.some(o=>o.kind!=='niche'&&z>o.z0-1.5&&z<o.z1+1.5))continue;for(const y of ys)if(CAVE_C.sdf(x,y,z)>0)bad.push('z '+z+' y '+y);}
   return{ok:!bad.length,detail:bad.length?'open behind the lining at '+bad.slice(0,3).join(', '):'rock behind the lining from z 420 to 560 but at the bulkhead and the window'};},
  window(z,y){const bad=[];for(let x=SEC.x1+L+.4;x<=36;x+=1)if(CAVE_C.sdf(x,y,z)<.2)bad.push(x.toFixed(1));return{ok:!bad.length,detail:bad.length?'rock at x '+bad.slice(0,3).join(', ')+' on the window\'s line':'open from the glass into the chamber (z '+z+')'};},
  karst(N,J){const ok=N.passages.length>5&&!!J&&CAVE_C.sdf(J.pts[1][0],J.pts[1][1]+1.5,J.pts[1][2])>.2;return{ok,detail:N.passages.length+' passages, '+N.chambers.length+' chambers in the maze'+(J?'; joined at '+J.pts[1].map(v=>v.toFixed(0)).join(', '):'; not joined')};}};
 return {S0,SEC,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers:[],lamps,crown,trains,standingTrains:[],standing:[],chamber,landing,stair,window:window_,karst,join,FLOOR,TABLE,path,
  sectionAt:()=>SEC,profileAt:()=>PROF,gallerySpans:[[WIN.z0,WIN.z1]],cavern,walk,
  floorAt:(x,z)=>x>SEC.x1+L+.5?FLOOR:LW.sectionFloor(SEC,x,trackX,z),
  rockShows:(x0,z0,cs)=>x0+cs>SEC.x1+L-2,
  gypWeight:(x,y,z,nx,ny,nz)=>x>SEC.x1+L+2&&y>TABLE-1&&y<TABLE+6?(ny>.4?.95:.75):0,
  lights:[{x:40,y:FLOOR+12,z:495,color:0xd8ccb4,intensity:.3,range:45},{x:24,y:WY+2,z:452,color:0xffd8a0,intensity:.6,range:10}],
  ambient:{k:.36,fog:.0024},
  clearSpans:[[WIN.walk0,WIN.walk1]],lampSpans:[[WIN.walk0,WIN.walk1]],
  works(){return LW.galleryWorks(SEC,WIN,lamps.filter(l=>!l.path),crown);},
  walkWant:[[SEC.walk.x0+1,WY,300,'the walkway'],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,300,'the road'],[22,WY,452,'the landing'],[40,FLOOR,495,'the chamber\'s floor']],
  reach:{start:[SEC.walk.x0+1,WY,430],box:[SEC.walk.x0-.5,60,400,560],targets:[[22,WY,452],[40,FLOOR,495]],note:'from the walkway through the bulkhead, down the stair to the chamber\'s floor'},
  hazards(){return [{name:'Bad air pooled on the chamber\'s floor (CO2 and H2S from the rising water)',key:'hazard.gas.breach',x:40,z:495,y:FLOOR,r:18,h:1.5,
   tags:{hazard:{kind:'gas',effect:'suffocate',danger:.5,shape:{type:'cyl',r:18,h:1.5}}}}];},
  records(){const R=[{name:chamber.name,key:chamber.id,x:chamber.c[0],z:chamber.c[2],y:FLOOR,r:chamber.rx,h:chamber.h,tags:{line:{kind:'crossing',cave:'hypogene',by:'nature'}}},
   {name:'The bulkhead, the landing and the stair down (the Ancients\' works into the chamber)',key:stair.id,x:24,z:480,y:FLOOR,r:6,h:WY-FLOOR+3,tags:{line:{kind:'stair',from:'line.breach.bulkhead',to:chamber.id}}},
   {name:'The window onto the chamber',key:window_.id+'.rec',x:(window_.x0+window_.x1)/2,z:(window_.z0+window_.z1)/2,y:WY,r:4,h:2.2,tags:{line:{kind:'window'}}}];
   if(join)R.push({name:'The passage into the rising maze (KKARST hypogene: '+karst.passages.length+' passages)',key:join.id,x:(join.pts[0][0]+join.pts[1][0])/2,z:(join.pts[0][2]+join.pts[1][2])/2,y:FLOOR,r:Math.max(4,Math.hypot(join.pts[1][0]-join.pts[0][0],join.pts[1][2]-join.pts[0][2])/2),h:4,tags:{line:{kind:'cave',karst:'hypogene'}}});
   return R;},
  checks(){return {checks:[Object.assign({name:'the bore passes the chamber: rock behind the lining but at the bulkhead and the window'},CHK.behind(SEC.x1+L+1,[.5,3,6])),
    Object.assign({name:'the window looks into the chamber'},CHK.window(474,WY+1.1)),Object.assign({name:'the rising maze beyond joins the chamber (KKARST hypogene)'},CHK.karst(karst,join))],
   negatives:[{name:'negative: the same test 14 m in, in the chamber',failed:!CHK.behind(30,[-10]).ok,detail:CHK.behind(30,[-10]).detail},
    {name:'negative: the window\'s line moved 16 m south, into the rock',failed:!CHK.window(490,WY+1.1).ok,detail:CHK.window(490,WY+1.1).detail},
    {name:'negative: a maze with no passages',failed:!CHK.karst({passages:[],chambers:[]},join).ok,detail:CHK.karst({passages:[],chambers:[]},join).detail}]};},
  exportProfile:['registry','hazards','terrain','stage','atmos'],exportBox:[-25,440,60,540],
  describe(p){return p.x>SEC.x1+L+.5?'\nthe hypogene chamber ('+SITE.caveT+' degC, damp, sulphurous)':'';},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,niches,lamps,openings,chamber,landing,stair,window:window_,join,karst,
   trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
