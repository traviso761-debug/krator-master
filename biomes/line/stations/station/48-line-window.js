// ================================================================= LINE — the station's window: the Twenny junction, bore km 217.7-218.75  [G data]
// biomes/line/PLAN.md sections 3 and 5 (station 3). The gallery north and south; between them the station cavern (z 220-680): 52.5 m wide (x -30 to
// 22.5), walls plumb to 11 m, a flattened vault to 20 m; the tracks splay over the throats (z 220-300, 600-680) round the island platform (x -5.5 to
// 5.5) to the side platforms (x 15.3 to 22.5, and -15.3 to -29.4 with the road's apron); every platform at the car floor's height (1.8 m), its edge
// 0.1 m off the car. The footbridges (deck 7.6 m) from the island over the tracks to the mezzanine balconies in the walls; the doors to the
// station's rooms (workshops, cistern, stores, the signal room); the branch's mouth toward Loj Twenny (east wall, z 405-417); the great shaft's foot
// (x -22, z 540, through the vault). The state (STATION.state) sets the tracks' state, the lamps, the light and the trains.
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1050,walk0:0,walk1:900},ST=STATION.state;
 const CAV={x0:-30,x1:22.5,spring:11,crown:20,lining:.6,wsplit:[0,1.8,4.2,7.6,10],esplit:[10,7.6,7.0,4.2,1.8,0],key:'cavern'};
 const CZ0=220,CZ1=680,P0=300,P1=600,PY=SEC.platformY,G=SEC.guide;
 const PROF={gallery:LK.profileOf(SEC,36),cavern:LK.profileOf(CAV,40)};
 const sectionAt=z=>(z>=CZ0&&z<CZ1)?CAV:SEC;
 /* THE TRACKS splay over the throats: nominal (the gallery's) to the station's x */
 const NOM={t1:10.5,t2:4.5,t3:-4.5,t4:-10.5},STA={t1:13.4,t2:7.4,t3:-7.4,t4:-13.4};
 const spl=z=>z<CZ0||z>CZ1?0:z<P0?LK.sm((z-CZ0)/(P0-CZ0)):z>P1?LK.sm((CZ1-z)/(CZ1-P1)):1;
 const trackX=(id,z)=>NOM[id]+(STA[id]-NOM[id])*spl(z);
 const tstate=ST==='kept'?'kept':'built';   /* abandoned: the Ancients' guideways left sound, unkept (no plate patches, no lamp code) */
 const cond={};SEC.tracks.forEach(T=>cond[T.id]=[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:tstate}]);
 const trackRuns=id=>cond[id].map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(T=>routes[T.id]=LK.makeRoute(z=>trackX(T.id,z),WIN.z0,WIN.z1,2));
 /* THE PLATFORMS: their edges 0.1 m off the car on the straight (z 300-600) */
 const edge=(id,side)=>STA[id]+side*(SEC.car.half+SEC.platformGap);
 const platforms=[{id:'line.st.island',name:'The island platform',x0:edge('t3',1),x1:edge('t2',-1),z0:P0,z1:P1,faces:[['t3',-1],['t2',1]]},
  {id:'line.st.east',name:'The east platform',x0:edge('t1',1),x1:CAV.x1,z0:P0,z1:P1,faces:[['t1',-1]]},
  {id:'line.st.west',name:'The west platform and the road\'s apron',x0:CAV.x0+.6,x1:edge('t4',-1),z0:262,z1:638,faces:[['t4',1]]}];
 /* THE FOOTBRIDGE DECKS (7.6 m: its underside 7.3, the car's envelope 5.4) and the mezzanine balconies in the walls */
 const DECK=7.6,BRZ=[445,450];
 const bridges=[{id:'line.st.bridge.e',name:'The east footbridge',x0:2.5,x1:CAV.x1,z0:BRZ[0],z1:BRZ[1],over:['t2','t1']},{id:'line.st.bridge.w',name:'The west footbridge',x0:CAV.x0+.6,x1:-2.5,z0:BRZ[0],z1:BRZ[1],over:['t3','t4']}];
 const balconies=[{id:'line.st.mezz.e',name:'The east mezzanine',x0:CAV.x1-3,x1:CAV.x1,z0:320,z1:580},{id:'line.st.mezz.w',name:'The west mezzanine',x0:CAV.x0+.6,x1:CAV.x0+3.6,z0:320,z1:580}];
 const stairs=[{id:'line.st.stair.ie',a:[3.6,PY,420],b:[3.6,DECK,BRZ[0]],w:1.8},{id:'line.st.stair.iw',a:[-3.6,PY,420],b:[-3.6,DECK,BRZ[0]],w:1.8},
  {id:'line.st.stair.e',a:[17.4,PY,500],b:[17.4,DECK,476],w:1.8},{id:'line.st.stair.w',a:[-21,PY,500],b:[-21,DECK,476],w:1.8}];
 const landings=[{x0:16.4,x1:CAV.x1,z0:470,z1:477},{x0:CAV.x0+.6,x1:-20,z0:470,z1:477}];
 /* THE OPENINGS: the gallery's niches; the doors to the station's rooms at the platforms and the mezzanine; the branch's mouth */
 const openings=[];const niches=[];
 for(const [a,b] of [[25,CZ0-20],[CZ1+20,WIN.walk1]])for(let z=a;z<b;z+=50){niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});openings.push({id:'line.niche.'+Math.round(S0+z),kind:'niche',wall:'e',z0:z-.6,z1:z+.6,y0:SEC.walk.y,y1:SEC.walk.y+2.2});}
 const ROOMS={e:[[330,'a workshop'],[380,'the cistern'],[520,'the stores'],[570,'the ventilation plant']],w:[[340,'the signal room'],[560,'a workshop']]};
 for(const wall of ['e','w'])for(const [z,name] of ROOMS[wall])openings.push({id:'line.st.door.'+wall+z,kind:'door',name:'A door: '+name,wall,z0:z-1.2,z1:z+1.2,y0:PY,y1:4.2,d:3});
 for(const wall of ['e','w'])for(let z=340;z<=580;z+=40)if(z<440||z>460)openings.push({id:'line.st.mdoor.'+wall+z,kind:'door',name:'A door to the mezzanine\'s rooms',wall,z0:z-.8,z1:z+.8,y0:DECK,y1:10,d:3});
 const branch={id:'line.st.branch',kind:'branch',name:'The branch toward Loj Twenny (25 km east)',wall:'e',z0:405,z1:417,y0:PY,y1:7.0,
  pts:[[CAV.x1-.5,PY,411],[45,PY,413],[85,1.6,418]],w:8,h:6};openings.push(branch);
 const shaft={id:'line.st.shaft',name:'The great shaft\'s foot (2.2 km up to the fells)',c:[-22,540],r:3.5,y0:CAV.crown-6};
 const inShaft=(x,z)=>Math.hypot(x-shaft.c[0],z-shaft.c[1])<shaft.r+.2;
 /* THE LAMPS by state: kept: the code (green on the ways, amber at the rooms' doors, white hooded at the branch's mouth until a way is lit); built:
    none (the Ancients' light); abandoned: the posts left, dead */
 const lamps=[];if(ST!=='built'){const on=ST==='kept';
  for(const [a,b] of [[0,CZ0-10],[CZ1+10,WIN.walk1]])for(let z=a;z<=b;z+=50){lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:SEC.walk.y+2.3,z,base:SEC.walk.y,on});
   lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY,on});
   if(z+25<b)lamps.push({id:'line.lamp.s'+Math.round(S0+z+25),kind:'green',x:0,y:SEC.strip.y+4,z:z+25,base:SEC.strip.y,mast:true,on});}
  for(let z=310;z<=590;z+=40){lamps.push({id:'line.lamp.i'+z,kind:'green',x:0,y:PY+2.6,z,base:PY,on});lamps.push({id:'line.lamp.e'+z,kind:'green',x:21.6,y:PY+2.6,z,base:PY,on});
   lamps.push({id:'line.lamp.wp'+z,kind:'green',x:-28.4,y:PY+2.6,z,base:PY,on});}
  for(const z of [240,280,620,660])lamps.push({id:'line.lamp.t'+z,kind:'green',x:21.4,y:SEC.walk.y+2.3,z,base:SEC.walk.y,on});
  for(const O of openings.filter(o=>o.kind==='door'&&o.y0<2))lamps.push({id:'line.lamp.a.'+O.id,kind:'amber',x:O.wall==='e'?CAV.x1-.7:CAV.x0+.7,y:4.6,z:O.z1+.9,base:PY,on});}
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10){const S=sectionAt(z);for(const x of (S===CAV?[-24,-16,-8,0,8,16]:[-15,-9,-3,3,9]))if(!(S===CAV&&inShaft(x,z)))crown.push({x,z,y:LK.ceilOf(S,x)-.45});}
 /* THE TRAINS by state */
 const trains=[],standingTrains=[],standing=[];
 const run=(id,track,seed,variant,phase,dir)=>{const cars=LK.consist(null,seed,variant),len=LK.trainLen(cars),R=WIN.z1-WIN.z0+len+40,dur=R/LK.KEPT;
  const a=dir>0?WIN.z0-20:WIN.z1+len+20,b=dir>0?a+R:a-R;trains.push({id,track,route:routes[track],dir,cars,len,timeline:KSCHED.timeline({period:240,phase,segments:[{dur,from:a,to:b,ease:'linear',name:'run'},{dur:240-dur,from:b,name:'stop:off'}]})});};
 if(ST==='kept'){const cars=LK.consist(null,81,1),len=LK.trainLen(cars);standingTrains.push({id:'line.train.st.T2',label:'A kept train at the island platform',track:'t2',route:routes.t2,cars,len,s:P1-6});
  run('line.train.st.T3','t3',91,1,30,-1);
  standing.push({id:'line.st.trolley',key:'tg_trolley',variant:0,seed:4,x:trackX('t1',180),y:G.h,z:180,yaw:0,label:'A Fixers\' trolley waiting at the north throat'});}
 if(ST==='built'){const cars=LK.consist(null,101,0),len=LK.trainLen(cars);standingTrains.push({id:'line.train.st.T2',label:'An Ancient train at the island platform, as built',track:'t2',route:routes.t2,cars,len,s:P1-6});
  run('line.train.st.T3','t3',111,0,30,-1);}
 if(ST==='abandoned'){const cars=LK.consist(null,121,1).map((c,i)=>Object.assign(c,{state:i===3?'wreck':'weathered'})),len=LK.trainLen(cars);
  standingTrains.push({id:'line.train.st.T4',label:'A derelict train left at the west platform',track:'t4',route:routes.t4,cars,len,s:P1-4});
  standing.push({id:'line.st.van',key:'anc_van',variant:0,seed:9,state:'weathered',x:-25,y:PY,z:330,yaw:.2,label:'A derelict service van on the apron'});}
 /* THE VOID: the galleries north and south, the cavern, the rooms behind the doors, the branch's gallery, the great shaft */
 function cavern(){const L=SEC.lining,C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  const room=(id,S,z0,z1)=>C.room({id,owner:'line',poly:[[S.x0-L,z0],[S.x1+L,z0],[S.x1+L,z1],[S.x0-L,z1]],y:-L,h:S.spring+L,ceil:'vault',rise:S.crown-S.spring+L,rock:'tuff',finish:'raw'});
  room('line.gallery.N',SEC,WIN.z0,CZ0+4);room('line.station',CAV,CZ0,CZ1);room('line.gallery.S',SEC,CZ1-4,WIN.z1);
  openings.filter(o=>o.kind==='door'||o.kind==='niche').forEach(o=>{const S=o.kind==='niche'?SEC:CAV,d=o.d==null?1.2:o.d,xi=o.wall==='e'?S.x1+L-.1:S.x0-L+.1,xo=o.wall==='e'?S.x1+L+d:S.x0-L-d;
   C.room({id:o.id,owner:'line',poly:[[Math.min(xi,xo),o.z0],[Math.max(xi,xo),o.z0],[Math.max(xi,xo),o.z1],[Math.min(xi,xo),o.z1]],y:o.y0,h:o.y1-o.y0,rock:'tuff',finish:'hewn'});});
  C.tube({id:branch.id,owner:'line',pts:branch.pts,w:branch.w,h:branch.h,spring:.55,rock:'tuff',finish:'raw'});
  C.shaft({id:shaft.id,owner:'line',c:shaft.c,y0:shaft.y0,y1:SITE.cover>120?120:SITE.cover,r0:shaft.r+.6});
  return C.build();}
 /* THE WALK: the galleries; the cavern's invert; the platforms; the road's jog and ramps to the apron; the walkway's jogs and steps; the stairs,
    the bridges and the balconies (tagged bridge: the floor under them is the eye's) */
 function walk(W){LW.gallery(W,SEC,WIN.z0,CZ0,trackX);LW.gallery(W,SEC,CZ1,WIN.z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+SEC.lining+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  W.floor({rect:[CAV.x0,CAV.x1,CZ0,CZ1],y:0,name:'the cavern\'s invert',tag:'line.invert'});
  for(let z=CZ0;z<CZ1;z+=4)SEC.tracks.forEach(T=>{const x=trackX(T.id,z+2);W.floor({rect:[x-G.w/2,x+G.w/2,z,z+4],y:G.h,name:'guideway '+T.id.toUpperCase(),tag:'line.guideway'});});
  platforms.forEach(P=>W.floor({rect:[P.x0,P.x1,P.z0,P.z1],y:PY,name:P.name,tag:'line.platform'}));
  /* the road: its jog west over the throat (strips), its ramps up to the apron and down */
  W.strip({a:[-16.5,CZ0,SEC.road.y],b:[-26.1,CZ0+22,SEC.road.y],w:6.6,name:'the road\'s jog',tag:'line.road'});W.strip({a:[-26.1,CZ0+20,SEC.road.y],b:[-26.1,264,PY],w:6.6,name:'the road\'s ramp to the apron',tag:'line.road'});
  W.strip({a:[-26.1,636,PY],b:[-26.1,CZ1-20,SEC.road.y],w:6.6,name:'the road\'s ramp down',tag:'line.road'});W.strip({a:[-26.1,CZ1-22,SEC.road.y],b:[-16.5,CZ1,SEC.road.y],w:6.6,name:'the road\'s jog',tag:'line.road'});
  /* the walkway: its jog to the east wall over the throat, along the wall to the platform, its steps up */
  W.strip({a:[14.8,CZ0,SEC.walk.y],b:[21.3,CZ0+20,SEC.walk.y],w:2.4,name:'the walkway\'s jog',tag:'line.walkway'});W.floor({rect:[20.1,CAV.x1,CZ0+18,P0-4],y:SEC.walk.y,name:'the walkway (the throat)',tag:'line.walkway'});
  W.strip({a:[21.3,P0-5,SEC.walk.y],b:[21.3,P0+.5,PY],w:2.4,name:'the steps up to the east platform',tag:'line.platform'});
  W.strip({a:[21.3,P1-.5,PY],b:[21.3,P1+5,SEC.walk.y],w:2.4,name:'the steps down from the east platform',tag:'line.platform'});W.floor({rect:[20.1,CAV.x1,P1+4,CZ1-18],y:SEC.walk.y,name:'the walkway (the throat)',tag:'line.walkway'});
  W.strip({a:[21.3,CZ1-20,SEC.walk.y],b:[14.8,CZ1,SEC.walk.y],w:2.4,name:'the walkway\'s jog',tag:'line.walkway'});
  stairs.forEach(S=>W.strip({a:[S.a[0],S.a[2],S.a[1]],b:[S.b[0],S.b[2],S.b[1]],w:S.w,name:'a stair to the footbridge',tag:'line.bridge'}));
  bridges.forEach(B=>W.floor({rect:[B.x0,B.x1,B.z0,B.z1],y:DECK,name:B.name,tag:'line.bridge'}));
  balconies.forEach(B=>W.floor({rect:[B.x0,B.x1,B.z0,B.z1],y:DECK,name:B.name,tag:'line.bridge'}));
  landings.forEach(Lg=>W.floor({rect:[Lg.x0,Lg.x1,Lg.z0,Lg.z1],y:DECK,name:'a stair\'s landing',tag:'line.bridge'}));
  openings.filter(o=>o.kind==='door').forEach(o=>{const xi=o.wall==='e'?CAV.x1-.1:CAV.x0+.1,xo=o.wall==='e'?CAV.x1+CAV.lining+o.d:CAV.x0-CAV.lining-o.d;W.floor({rect:[Math.min(xi,xo),Math.max(xi,xo),o.z0,o.z1],y:o.y0,name:o.name,tag:'line.room'});});
  LW.strips(W,branch.pts,branch.w-1,'the branch toward Loj Twenny','line.branch');
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 function floorAt(x,z){if(z<CZ0||z>=CZ1)return LW.sectionFloor(SEC,x,trackX,z);for(const T of SEC.tracks)if(Math.abs(x-trackX(T.id,z))<=G.w/2)return G.h;
  for(const P of platforms)if(x>=P.x0&&x<=P.x1&&z>=P.z0&&z<=P.z1)return PY;return 0;}
 /* the station's own checks (each with its negative) */
 const CHK={
  edges(P){const bad=[];P.forEach(Q=>Q.faces.forEach(([id,side])=>{for(const z of [P0+5,(P0+P1)/2,P1-5]){if(z<Q.z0||z>Q.z1)continue;const e=side<0?Q.x0:Q.x1,d=Math.abs(e-trackX(id,z))-SEC.car.half;if(Math.abs(d-SEC.platformGap)>.05)bad.push(Q.name+' to '+id.toUpperCase()+' at z '+z+': '+d.toFixed(2)+' m');}}));
   return{ok:!bad.length,detail:bad.length?bad.slice(0,3).join('; '):'every platform face '+SEC.platformGap+' m off the car (the island both faces, the side platforms)'};},
  bridges(deck){const top=G.h+SEC.car.h+SEC.car.margin,u=deck-.3;return{ok:u>=top,detail:'the footbridges\' underside '+u.toFixed(1)+' m over the invert; the car\'s envelope '+top.toFixed(1)+' m'};},
  branchOpen(p){const s=CAVE_C.sdf(p[0],p[1],p[2]);return{ok:s>1,detail:'20 m into the branch toward Loj Twenny: '+(s>1?'open ('+s.toFixed(1)+' m to the rock)':'rock ('+s.toFixed(1)+')')};}};
 const bp=[branch.pts[0][0]+20,PY+2.5,412];
 return {S0,SEC,CAV,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers:[],lamps,crown,trains,standingTrains,standing,platforms,bridges,balconies,stairs,landings,branch,shaft,DECK,BRZ,CZ0,CZ1,P0,P1,
  sectionAt,profileAt:z=>PROF[sectionAt(z).key],
  liningCut:(z,i,P)=>{if(z<shaft.c[1]-shaft.r-2||z>shaft.c[1]+shaft.r+2)return false;const x=(P[i][0]+P[i+1][0])/2,y=(P[i][1]+P[i+1][1])/2;return y>CAV.spring&&inShaft(x,z+1);},
  gallerySpans:[[WIN.z0,CZ0],[CZ1,WIN.z1]],cavern,walk,floorAt,
  cyanLit:ST==='built',
  rockShows:(x0,z0,cs,y0)=>(x0+cs>CAV.x1&&z0+cs>390&&z0<435)||(Math.abs(x0+cs/2-shaft.c[0])<cs&&Math.abs(z0+cs/2-shaft.c[1])<cs&&y0+cs>CAV.crown-8)||(x0+cs>SEC.x1+SEC.lining-2&&(z0<CZ0||z0>CZ1))||
   openings.some(o=>o.kind==='door'&&z0<o.z1+1&&z0+cs>o.z0-1&&(o.wall==='e'?x0+cs>CAV.x1:x0<CAV.x0)),
  lights:ST==='built'?[-12,0,12].flatMap(x=>[330,450,570].map(z=>({x,y:16,z,color:0xe8f2ff,intensity:.9,range:70}))):
   ST==='kept'?[{x:0,y:PY+3,z:380,color:0xffd8a0,intensity:1.1,range:24},{x:0,y:PY+3,z:520,color:0xffd8a0,intensity:1.1,range:24},{x:-22,y:8,z:540,color:0xe8eef8,intensity:.8,range:20}]:[],
  ambient:ST==='built'?{k:.62,exposure:1.25}:ST==='abandoned'?{k:.26,fog:.0034}:{k:.46},
  clearSpans:[[WIN.walk0,WIN.walk1]],lampSpans:ST==='kept'?[[WIN.walk0,WIN.walk1]]:[],   /* the lamp code is the keepers': built has the Ancients' light, abandoned none */
  works(){const O=LW.galleryWorks(SEC,WIN,lamps,crown,[[WIN.z0,CZ0],[CZ1,WIN.z1]]);
   bridges.forEach(B=>O.push({name:B.name,x0:B.x0,x1:B.x1,y0:DECK-.3,y1:DECK+1.1,z0:B.z0,z1:B.z1}));
   balconies.forEach(B=>O.push({name:B.name,x0:B.x0,x1:B.x1,y0:DECK-.3,y1:DECK+1.1,z0:B.z0,z1:B.z1}));
   lamps.filter(l=>l.z>=CZ0&&l.z<CZ1).forEach(l=>O.push({name:'a platform lamp',x0:l.x-.15,x1:l.x+.15,y0:l.base,y1:l.y+.1,z0:l.z-.15,z1:l.z+.15}));
   return O;},
  walkWant:[[0,PY,350,'the island platform'],[18,PY,350,'the east platform'],[-22,PY,350,'the west platform'],[10,DECK,447.5,'the east footbridge'],[CAV.x1-1.5,DECK,400,'the east mezzanine'],
   [SEC.walk.x0+1,SEC.walk.y,100,'the north gallery\'s walkway'],[bp[0],PY,412,'the branch toward Loj Twenny']],
  reach:{start:[-2,PY,352],box:[CAV.x0-6,64,300,600],targets:[[18,PY,350],[-22,PY,350],[CAV.x1-1.5,DECK,400]],note:'from the island over the footbridges to both side platforms and the mezzanine'},
  records(){const R=platforms.map(P=>({name:P.name,key:P.id,x:(P.x0+P.x1)/2,z:(P.z0+P.z1)/2,y:PY-1,r:Math.max(5,(P.x1-P.x0)/2),h:3,tags:{line:{kind:'platform',by:'ancients',state:ST}}}));
   bridges.concat(balconies).forEach(B=>R.push({name:B.name,key:B.id,x:(B.x0+B.x1)/2,z:(B.z0+B.z1)/2,y:DECK-1,r:Math.max(3,(B.x1-B.x0)/2),h:3,tags:{line:{kind:'bridge'}}}));
   R.push({name:branch.name,key:branch.id,x:CAV.x1+6,z:411,y:PY,r:8,h:7,tags:{line:{kind:'branch',to:'Loj Twenny',km:25}}});
   R.push({name:shaft.name,key:shaft.id,x:shaft.c[0],z:shaft.c[1],y:PY,r:4,h:20,tags:{line:{kind:'shaft',depth:2200,hidden:true,road:{id:'dalab-ledge',d:34000,reach:false}}}});
   R.push({name:'The station cavern ('+ST+')',key:'line.st.cavern',x:(CAV.x0+CAV.x1)/2,z:450,y:0,r:230,h:CAV.crown,tags:{line:{kind:'station',num:3,state:ST}}});
   return R;},
  checks(){return {checks:[Object.assign({name:'every platform face 0.1 m off the car'},CHK.edges(platforms)),Object.assign({name:'the footbridges clear the car\'s envelope'},CHK.bridges(DECK)),
    Object.assign({name:'the branch toward Loj Twenny is open'},CHK.branchOpen(bp))],
   negatives:[{name:'negative: the island\'s edge 0.4 m out',failed:!CHK.edges([Object.assign({},platforms[0],{x1:platforms[0].x1+.4})]).ok,detail:CHK.edges([Object.assign({},platforms[0],{x1:platforms[0].x1+.4})]).detail},
    {name:'negative: the footbridges at 5 m',failed:!CHK.bridges(5).ok,detail:CHK.bridges(5).detail},
    {name:'negative: a point 20 m into the rock beside the branch',failed:!CHK.branchOpen([bp[0],PY+2.5,370]).ok,detail:CHK.branchOpen([bp[0],PY+2.5,370]).detail}]};},
  exportBox:[-30,420,22,480],
  describe(p){return p.z>=CZ0&&p.z<CZ1?'\nthe station cavern ('+ST+')':'';},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,state:ST,s0:S0,sec:SEC,cav:CAV,win:WIN,cond,platforms,bridges,balconies,stairs,openings,branch,shaft,lamps,
   standingTrains:standingTrains.map(T=>({id:T.id,track:T.track,s:T.s,cars:T.cars})),trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
