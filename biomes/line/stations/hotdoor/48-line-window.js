// ================================================================= LINE — the hot door's window: bore km 54.35-55.55, the hot section's north door  [G data]
// biomes/line/PLAN.md sections 2, 2.1, 5 (station 4) and 6. The plain gallery north of the doors, every track kept; the OUTER DOOR WALL at z 300 and
// the INNER at z 560 (each 1.2 m thick: a bulkhead across the gallery with four train leaves, a walkway hatch and a road gate; the airlock between
// them longer than a train); the POWER AND COOLING PLANT in a hall off the east wall (z 120-260), its two heat exchanger pipes out through its
// doorway and along the east wall through both door walls into the hot rock; a sealed train waiting in the airlock; past the inner door the deep
// stretch as the Ancients left it (their guideways, their cyan burning, no lamp code), spalls in the vault; a crystal cleft shrine behind a rail
// in the granite of the west wall (z 80). The seal holds while no two door walls stand open at once.
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1050,walk0:0,walk1:900},PY=SEC.platformY,G=SEC.guide;
 const PROF=LK.profileOf(SEC,36);
 const RW=RIFT.window(S0,WIN),trackX=RW.trackX;   /* the window of the one Rift record (47c-line-record.js): its tracks' offsets, states, crossovers */
 const OUT=300,INN=560,T=1.2;
 /* THE DOORS: each wall's openings and their leaves (a train leaf 4.6 x 5.6 over each guideway, the walkway hatch, the road gate) */
 const leavesOf=(wid,open)=>SEC.tracks.map(t=>({id:wid+'.'+t.id,kind:'train',track:t.id,x0:t.x-2.3,x1:t.x+2.3,y0:.01,y1:5.6}))
  .concat([{id:wid+'.hatch',kind:'walk',x0:14.2,x1:15.4,y0:SEC.walk.y+.01,y1:SEC.walk.y+2.2},{id:wid+'.gate',kind:'road',x0:SEC.road.x0,x1:SEC.road.x1,y0:SEC.road.y+.01,y1:SEC.road.y+5}])
  .map(L=>Object.assign(L,{state:open.indexOf(L.kind==='train'?L.track:L.kind)>=0?'open':'shut'}));
 const doors=[{id:'line.door.N.out',name:'The outer door wall (the north door)',z:OUT,leaves:leavesOf('line.door.N.out',[])},
  {id:'line.door.N.in',name:'The inner door wall (the north door)',z:INN,leaves:leavesOf('line.door.N.in',['walk'])}];
 /* THE PLANT: its hall off the east wall, its doorways, its two pipes (r 0.5) out of the second doorway's head and south along the wall */
 const plant={id:'line.plant.N',name:'The power and cooling plant of the north door (geothermal; kept by rite)',x0:SEC.x1+SEC.lining,x1:46,z0:120,z1:262,y:SEC.walk.y,h:9,rise:5,
  gens:[{x:30,z:150},{x:30,z:175},{x:30,z:200}],cells:{x0:40,x1:45,z0:228,z1:258},banks:[{x0:20,x1:26,z0:232,z1:256}],state:'kept',cellsOnCharge:24};
 const pipes=[{id:'line.pipe.N1',x:13.9,y:4.9,r:.5,z0:230},{id:'line.pipe.N2',x:15.0,y:4.9,r:.5,z0:232.5}].map(p=>Object.assign(p,{z1:WIN.z1,from:24}));
 /* THE OPENINGS: the niches north of the doors, the plant's two doorways (the pipes leave by the second's head), the cleft */
 const niches=[];for(let z=25;z<OUT-20;z+=50)if(z<110||z>270)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h}))
  .concat([{id:'line.plant.door1',kind:'door',name:'The plant\'s doorway',wall:'e',z0:148,z1:152,y0:SEC.walk.y,y1:6},{id:'line.plant.door2',kind:'door',name:'The plant\'s doorway (the pipes overhead)',wall:'e',z0:228,z1:234,y0:SEC.walk.y,y1:6},
   {id:'line.cleft',kind:'cleft',name:'A crystal cleft in the granite (the Tungangs\' shrine)',wall:'w',z0:79.3,z1:80.7,y0:SEC.road.footY,y1:4}]);
 /* THE CROSSING (the Tungangs'): plates flush with the guideways' tops between the beams (clear of the cars), a ramp off the walkway, a stile over
    the road's barrier: where a walker crosses the four tracks north of the outer door */
 const crossing={id:'line.crossing.N',z0:276,z1:280,y:G.h};
 const cleft={id:'line.cleft.shrine',name:'The cleft shrine: a quartz-lined pocket in the granite behind a rail',c:[-27.5,SEC.road.footY,80],rx:3.6,rz:3.2,h:5,z:80};
 /* THE TRACKS: kept north of the inner door, as the Ancients built them past it; the cyan lit only past it */
 const cond=RW.cond;
 const trackRuns=id=>cond[id].map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(t=>routes[t.id]=LK.makeRoute(z=>trackX(t.id,z),WIN.z0,WIN.z1,4));
 const cyanLit=z=>z>INN+T;
 /* THE LAMPS: the code north of the inner door (green on the ways, white hooded at the door walls, amber at the plant's doorways); none past it */
 const lamps=[],nearDoor=z=>doors.some(D=>z>D.z-15&&z<D.z+T+15);
 for(let z=0;z<INN;z+=50){if(nearDoor(z))continue;lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:SEC.walk.y+2.3,z,base:SEC.walk.y});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});
  if(!nearDoor(z+25)&&z+25<INN)lamps.push({id:'line.lamp.s'+Math.round(S0+z+25),kind:'green',x:0,y:SEC.strip.y+4,z:z+25,base:SEC.strip.y,mast:true});}
 doors.forEach(D=>[[D.z-3,'n'],[D.z+T+3,'s']].forEach(([z,f])=>{if(D.z===INN&&f==='s')return;
  lamps.push({id:'line.lamp.white.'+D.id+'.'+f,kind:'white',x:15.6,y:SEC.walk.y+2.8,z,base:SEC.walk.y});lamps.push({id:'line.lamp.white.'+D.id+'.r'+f,kind:'white',x:-20.6,y:SEC.road.footY+2.8,z,base:SEC.road.footY});}));
 openings.filter(o=>o.kind==='door').forEach(o=>lamps.push({id:'line.lamp.amber.'+o.id,kind:'amber',x:15.7,y:SEC.walk.y+2.6,z:o.z0-1.2,base:SEC.walk.y}));
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10){if(nearDoor(z))continue;for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});}
 /* THE SPALLS past the inner door: a vault segment gone where its hash says (above 7 m), the rock behind it showing, its slab on the floor */
 const spall=new Set(),spallPts=[];
 for(let z=640;z<980;z+=2){const ring=Math.round(z/2);for(let i=0;i+1<PROF.length;i++){const y=(PROF[i][1]+PROF[i+1][1])/2;if(y<7)continue;
  if(KRAND.unit(KRAND.hash(SITE.world,ring,i,5))<.03){spall.add(ring+':'+i);spallPts.push([(PROF[i][0]+PROF[i+1][0])/2,y,z+1,i]);}}}
 /* THE TRAINS: the sealed train waiting in the airlock on T2; a kept train on T4 comes up to the outer door, waits, and backs away */
 const standingTrains=[],trains=[];
 {const cars=LK.consist(null,141,1),len=LK.trainLen(cars);standingTrains.push({id:'line.train.sealed',label:'The sealed train waiting in the airlock (its seals tested before the inner door opens)',track:'t2',route:routes.t2,cars,len,s:INN-15});}
 {const cars=LK.consist(null,151,1),len=LK.trainLen(cars),a=WIN.z0-20,b=OUT-12,d=(b-a)/LK.KEPT;
  trains.push({id:'line.train.T4',track:'t4',route:routes.t4,dir:1,cars,len,timeline:KSCHED.timeline({period:240,segments:[{dur:d,from:a,to:b,ease:'linear',name:'run'},{dur:60,from:b,name:'stop:door'},{dur:d,from:b,to:a,ease:'linear',name:'back'},{dur:240-60-2*d,from:a,name:'stop:off'}]})});}
 const standing=[{id:'line.work.trolley',key:'tg_trolley',variant:0,seed:7,x:trackX('t1'),y:G.h,z:200,yaw:0,label:'A Fixers\' trolley at the plant'}];
 /* THE VOID: the gallery, the niches, the plant's hall and doorways, the cleft's slot and pocket */
 function cavern(){const L=SEC.lining,C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  C.room({id:'line.gallery',owner:'line',poly:[[SEC.x0-L,WIN.z0],[SEC.x1+L,WIN.z0],[SEC.x1+L,WIN.z1],[SEC.x0-L,WIN.z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'granite',finish:'raw'});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'granite',finish:'hewn'}));
  C.room({id:plant.id,owner:'line',poly:[[plant.x0+2,plant.z0],[plant.x1,plant.z0],[plant.x1,plant.z1],[plant.x0+2,plant.z1]],y:plant.y,h:plant.h,ceil:'vault',rise:plant.rise,rock:'granite',finish:'hewn'});
  openings.filter(o=>o.kind==='door').forEach(o=>C.room({id:o.id,owner:'line',poly:[[SEC.x1+L-.1,o.z0],[plant.x0+2.5,o.z0],[plant.x0+2.5,o.z1],[SEC.x1+L-.1,o.z1]],y:o.y0,h:o.y1-o.y0,rock:'granite',finish:'hewn'}));
  C.room({id:'line.cleft.slot',owner:'line',poly:[[cleft.c[0]+2,79.3],[SEC.x0-L+.1,79.3],[SEC.x0-L+.1,80.7],[cleft.c[0]+2,80.7]],y:cleft.c[1],h:3.4,rock:'granite',finish:'raw'});
  C.hall({id:cleft.id,owner:'line',c:cleft.c,rx:cleft.rx,rz:cleft.rz,h:cleft.h,belly:.3,blend:1.5,rock:'granite',finish:'raw'});
  return C.build();}
 /* THE WALK: the gallery's floors; the niches, the plant's doorways and hall, the cleft; the door walls and the lamp posts as blocks */
 function walk(W){LW.gallery(W,SEC,WIN.z0,WIN.z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+SEC.lining+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  openings.filter(o=>o.kind==='door').forEach(o=>W.floor({rect:[SEC.x1-.1,plant.x0+3,o.z0,o.z1],y:o.y0,name:o.name,tag:'line.plant'}));
  W.floor({rect:[plant.x0+2,plant.x1-.5,plant.z0+.5,plant.z1-.5],y:plant.y,name:'the plant\'s hall',tag:'line.plant'});
  W.floor({rect:[cleft.c[0]+.5,SEC.x0+.1,79.4,80.6],y:cleft.c[1],name:'the cleft\'s slot',tag:'line.cleft'});
  W.floor({rect:[cleft.c[0]-2,cleft.c[0]+2,cleft.z-1.8,cleft.z+1.8],y:cleft.c[1],name:'the cleft shrine',tag:'line.cleft'});
  {const X=crossing,zm=(X.z0+X.z1)/2;W.strip({a:[SEC.walk.x0+.3,zm,SEC.walk.y],b:[12.0,zm,X.y],w:X.z1-X.z0,name:"the crossing's ramp",tag:'line.crossing'});
   W.floor({rect:[-12.2,12.0,X.z0,X.z1],y:X.y,name:"the crossing's plates",tag:'line.crossing'});W.floor({rect:[-12.75,-12.2,X.z0,X.z1],y:.85,name:"the stile's step",tag:'line.crossing'});
   W.floor({rect:[-13.25,-12.7,X.z0,X.z1],y:SEC.road.y+SEC.road.barrierH,name:'the stile over the barrier',tag:'line.crossing'});W.floor({rect:[-13.8,-13.25,X.z0,X.z1],y:.75,name:"the stile's step",tag:'line.crossing'});W.floor({rect:[-14.35,-13.8,X.z0,X.z1],y:.45,name:"the stile's step",tag:'line.crossing'});}
  doors.forEach(D=>W.block([SEC.x0-1,SEC.x1+1,D.z,D.z+T,-1,SEC.crown+1],'line.doorwall'));
  W.block([-21.35,-21.05,79.3,80.7,SEC.road.footY,SEC.road.footY+1.0],'line.cleft.rail');
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 /* the hot door's own checks (each with its negative) */
 const CHK={
  airlock(o,i,len){const room=i-(o+T);return{ok:room>=len+20,detail:'the airlock '+room.toFixed(0)+' m between the door walls; a train '+len.toFixed(0)+' m and 20 m to spare'};},
  sealed(D){const open=D.map(d=>d.leaves.filter(L=>L.state==='open').map(L=>L.id));const both=open.every(a=>a.length>0);
   const full=D.every(d=>SEC.tracks.every(t=>d.leaves.some(L=>L.track===t.id))&&d.leaves.some(L=>L.kind==='walk')&&d.leaves.some(L=>L.kind==='road'));
   return{ok:full&&!both,detail:(full?'every opening in both door walls has its leaf':'a door wall lacks a leaf')+'; open: '+D.map((d,k)=>(k?'inner ':'outer ')+(open[k].length?open[k].map(x=>x.split('.').pop()).join(', '):'none')).join('; ')};},
  pipes(P,o,i){const bad=P.filter(p=>!(p.z0<o&&p.z1>i+T+50));return{ok:!bad.length&&P.length>0,detail:P.length+' pipe(s) from z '+Math.round(Math.min(...P.map(p=>p.z0)))+' to '+Math.round(Math.max(...P.map(p=>p.z1)))+(bad.length?'; '+bad.map(p=>p.id).join(', ')+' stop short of the hot rock':'; through both door walls into the hot rock')};},
  cyan(f){const bad=[];for(let z=WIN.z0;z<WIN.z1;z+=10)if(f(z)!==(z>INN+T))bad.push(z);return{ok:!bad.length,detail:bad.length?'cyan wrong at z '+bad.slice(0,4).join(', '):'the cyan dead north of the inner door, burning past it'};},
  cleftOpen(p){const s=CAVE_C.sdf(p[0],p[1],p[2]);return{ok:s>.5,detail:'the cleft shrine at '+p.map(v=>v.toFixed(1)).join(', ')+': '+(s>.5?'open ('+s.toFixed(1)+' m to the rock)':'rock ('+s.toFixed(1)+')')};}};
 const sealedLen=standingTrains[0].len,cp=[cleft.c[0],cleft.c[1]+1.6,cleft.z];
 return {S0,SEC,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers:[],lamps,crown,trains,standingTrains,standing,doors,plant,pipes,cleft,crossing,OUT,INN,T,spallPts,
  sectionAt:()=>SEC,profileAt:()=>PROF,rockLayer:'rock.granite',rockName:'granite (km 54-57: tin in greisen veins)',
  liningCut:(z,i)=>z>=640&&z<980&&spall.has(Math.round(z/2)+':'+i),
  gallerySpans:[[WIN.z0,WIN.z1]],cavern,walk,cyanLit,
  floorAt:(x,z)=>LW.sectionFloor(SEC,x,trackX,z),
  rockShows:(x0,z0,cs,y0)=>(x0+cs>SEC.x1+SEC.lining-2&&z0<OUT)||(x0<SEC.x0-SEC.lining+2&&z0+cs>70&&z0<92)||
   spallPts.some(p=>p[0]>x0-1&&p[0]<x0+cs+1&&p[1]>y0-1&&p[1]<y0+cs+1&&p[2]>z0-1&&p[2]<z0+cs+1),
  lights:[{x:30,y:plant.y+6,z:165,color:0xffb060,intensity:1.4,range:34},{x:34,y:plant.y+6,z:240,color:0xffb060,intensity:1.2,range:30},
   {x:cleft.c[0],y:cleft.c[1]+1.2,z:cleft.z,color:0xffc890,intensity:.9,range:7},
   {x:0,y:9,z:660,color:0xbff0f6,intensity:.5,range:42},{x:0,y:9,z:820,color:0xbff0f6,intensity:.5,range:42},{x:0,y:9,z:980,color:0xbff0f6,intensity:.5,range:42}],
  ambient:{k:.4},
  clearSpans:[[WIN.walk0,WIN.walk1]],lampSpans:[[WIN.walk0,INN]],
  works(){const O=LW.galleryWorks(SEC,WIN,lamps,crown);
   /* the door walls: their solid parts between the openings (a train passes a leaf's opening when it stands open) */
   doors.forEach(D=>{const xs=D.leaves.filter(L=>L.kind==='train').map(L=>[L.x0,L.x1]).sort((a,b)=>a[0]-b[0]);let x=SEC.x0;
    xs.forEach(([a,b])=>{if(a>x)O.push({name:D.name,x0:x,x1:a,y0:0,y1:SEC.crown,z0:D.z,z1:D.z+T});O.push({name:D.name+' (over a leaf)',x0:a,x1:b,y0:5.6,y1:SEC.crown,z0:D.z,z1:D.z+T});x=b;});
    O.push({name:D.name,x0:x,x1:SEC.x1,y0:0,y1:SEC.crown,z0:D.z,z1:D.z+T});});
   pipes.forEach(p=>O.push({name:'a heat exchanger pipe',x0:p.x-p.r,x1:p.x+p.r,y0:p.y-p.r,y1:p.y+p.r,z0:p.z0,z1:p.z1}));
   return O;},
  walkWant:[[SEC.walk.x0+1,SEC.walk.y,100,'the walkway'],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,100,'the road'],[34,plant.y,190,'the plant\'s hall'],[cleft.c[0],cleft.c[1],cleft.z,'the cleft shrine'],
   [SEC.walk.x0+1,SEC.walk.y,620,'the walkway past the inner door']],
  reach:{start:[SEC.walk.x0+1,SEC.walk.y,100],box:[-34,48,0,295],targets:[[34,plant.y,190],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,250],[-20.4,SEC.road.footY,84]],note:'from the walkway into the plant\'s hall, over the crossing to the road and its footway at the cleft (the shrine itself is barred by its rail)'},
  hazards(){const H=[{name:'The hot section: the air past the inner door (about '+SITE.hotT+' degC, rising with the rock)',key:'hazard.heat.N',x:-2.5,z:(INN+T+WIN.z1)/2,y:0,r:20,h:SEC.crown,
    tags:{hazard:{kind:'heat',effect:'burn',danger:.45,dose:.6,soak:{full:900,from:.2,out:600},shape:{type:'box',w:SEC.x1-SEC.x0,h:SEC.crown,d:WIN.z1-INN-T}}}}];
   if(typeof KHAZ!=='undefined'&&KHAZ.seal)H.push({name:'The hot section turns airless if both door walls stand open (the crest over it is near-airless)',key:'hazard.seal.N',x:-2.5,z:(INN+T+WIN.z1)/2,y:0,r:20,h:SEC.crown,
    tags:{hazard:KHAZ.seal({door:doors[1].id,shape:{type:'box',w:SEC.x1-SEC.x0,h:SEC.crown,d:WIN.z1-INN-T}})}});
   if(typeof KHAZ!=='undefined'&&KHAZ.rockburst)H.push({name:'Rockburst: the vault past the inner door spalls (its slabs on the floor)',key:'hazard.rockburst.N',x:-2.5,z:810,y:6,r:20,h:9,
    tags:{hazard:KHAZ.rockburst({shape:{type:'box',w:SEC.x1-SEC.x0,h:9,d:340},period:1200,seed:SITE.world})}});
   return H;},
  records(){const R=doors.map(D=>({name:D.name,key:D.id,x:-2.5,z:D.z+T/2,y:0,r:19,h:SEC.crown,tags:{line:{kind:'door',hot:true,leaves:D.leaves.map(L=>({id:L.id,kind:L.kind,track:L.track,state:L.state}))}}}));
   R.push({name:plant.name,key:plant.id,x:(plant.x0+plant.x1)/2,z:(plant.z0+plant.z1)/2,y:plant.y,r:(plant.x1-plant.x0)/2,h:plant.h+plant.rise,tags:{line:{kind:'plant',source:'geothermal',state:plant.state,cells:plant.cellsOnCharge,door:doors[1].id}}});
   pipes.forEach(p=>R.push({name:'A heat exchanger pipe (the plant into the hot rock)',key:p.id,x:p.x,z:(p.z0+p.z1)/2,y:p.y-p.r,r:p.r+.5,h:2*p.r,tags:{line:{kind:'pipe',z0:p.z0,z1:p.z1}}}));
   R.push({name:cleft.name,key:cleft.id,x:cleft.c[0],z:cleft.z,y:cleft.c[1],r:cleft.rx,h:cleft.h,tags:{line:{kind:'shrine',by:'tungang',crystal:'quartz'}}});
   return R;},
  checks(){const open2=doors.map(D=>Object.assign({},D,{leaves:D.leaves.map(L=>Object.assign({},L,{state:L.kind==='walk'?'open':L.state}))}));
   return {checks:[Object.assign({name:'the airlock is longer than a train'},CHK.airlock(OUT,INN,sealedLen)),Object.assign({name:'the hot section sealed: every opening has its leaf, never both door walls open'},CHK.sealed(doors)),
    Object.assign({name:'the plant\'s pipes pass both door walls into the hot rock'},CHK.pipes(pipes,OUT,INN)),Object.assign({name:'the Ancients\' cyan burns only past the inner door'},CHK.cyan(cyanLit)),
    Object.assign({name:'the cleft shrine is open behind its rail'},CHK.cleftOpen(cp))],
   negatives:[{name:'negative: the door walls 150 m apart',failed:!CHK.airlock(OUT,OUT+150,sealedLen).ok,detail:CHK.airlock(OUT,OUT+150,sealedLen).detail},
    {name:'negative: both walls\' hatches open',failed:!CHK.sealed(open2).ok,detail:CHK.sealed(open2).detail},
    {name:'negative: the pipes stopped at the outer door',failed:!CHK.pipes(pipes.map(p=>Object.assign({},p,{z1:OUT-2})),OUT,INN).ok,detail:CHK.pipes(pipes.map(p=>Object.assign({},p,{z1:OUT-2})),OUT,INN).detail},
    {name:'negative: the cyan lit everywhere',failed:!CHK.cyan(()=>true).ok,detail:CHK.cyan(()=>true).detail},
    {name:'negative: a point in the granite beside the cleft',failed:!CHK.cleftOpen([cleft.c[0],cleft.c[1]+1.6,cleft.z+12]).ok,detail:CHK.cleftOpen([cleft.c[0],cleft.c[1]+1.6,cleft.z+12]).detail}]};},
  exportProfile:['registry','hazards','terrain','stage','atmos'],exportBox:[-25,540,25,860],
  describe(p){return p.z>INN+T?'\npast the inner door: the hot section ('+SITE.hotT+' degC air)':p.z>OUT+T?'\nthe airlock':'';},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,niches,lamps,doors,plant,pipes,cleft,
   standingTrains:standingTrains.map(T=>({id:T.id,track:T.track,s:T.s,cars:T.cars})),trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),standing,routes};}};
})();
