// ================================================================= LINE — the gap's window: G2, bore km 235.7-236.95  [G data]
// biomes/line/PLAN.md sections 2 and 5 (station 2). The long run's last stretch (z -150 to 470): its gap station (a Tungang platform beside T1, the
// turning crossover, the shed over T4, the porters' hold), the buffers; then the fall: the gallery broken off (the lining ragged to z 498) and fallen
// whole into a drained hypogene chamber 16 m under the invert, 560 m long; the Fixers' ramp down the rubble, the path across the chamber floor by
// green lamps every 20 m, the sump waded (0.65 m), the Fixers' stair up the far fall to S1's walkway (z 1016) and S1's platform with its own train.
// Every track is cut from z 470 to 1012: the record derives the gap, and its walk is a route (LINE.gaps[0].walk). On the shared core (LK, LW).
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1250,walk0:0,walk1:1100};
 const PROF=LK.profileOf(SEC,36),LIP=470,FAR=1012,FLOOR=SITE.chamber.floor,LEVEL=-16.15,POOL={x0:-30,x1:30,z0:722,z1:758,floor:-16.8};
 const RW=RIFT.window(S0,WIN),trackX=RW.trackX;   /* the window of the one Rift record (47c-line-record.js): its tracks' offsets, states, crossovers */
 /* THE RUBBLE (the near fall z 466-612, the far fall z 925-1016): a heap at each lip, the slope down to the chamber's floor, rising toward the walls,
    roughened by core/rand's noise. Plain functions: the drawing, the walk and the floor all read them */
 const nz=(x,z,s)=>(KRAND.vnoise(x*.35,1,z*.35,s)-.5);
 function nearH(x,z){const wall=Math.pow(Math.min(1,Math.abs(x+2.5)/19),2)*3;let y=z<488?.6+(z-466)/22*1.6:2.2-(z-488)/(612-488)*18.2;
  return Math.max(FLOOR,y+wall*(z<500?.3:1)+nz(x,z,7)*1.2);}
 function farH(x,z){const wall=Math.pow(Math.min(1,Math.abs(x+2.5)/19),2)*3;let y=z>1000?.6+(1016-z)/16*1.6:2.2-(1000-z)/(1000-925)*18.2;
  return Math.max(FLOOR,y+wall*(z>990?.3:1)+nz(x,z,9)*1.2);}
 const inNear=z=>z>=466&&z<=612,inFar=z=>z>=925&&z<=1016;
 /* the refuge niches in both stretches of gallery */
 const niches=[];for(let z=25;z<LIP-20;z+=50)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});
 for(let z=1035;z<WIN.z1-10;z+=50)niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:SEC.walk.y});
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h}));
 const crossovers=RW.crossovers;
 const inXO=z=>crossovers.some(X=>z>X.z0-10&&z<X.z1+10);
 /* THE TRACKS: every track kept to the lip, cut across the fall, kept again on S1 */
 const cond=RW.cond;
 const trackRuns=id=>cond[id].filter(c=>c.state!=='cut').map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(T=>routes[T.id]=LK.makeRoute(z=>trackX(T.id,z),WIN.z0,WIN.z1,4));
 /* THE PLATFORMS (the Tungangs' plate decks at the car floor's height, beside T1 over the walkway): the gap station's and S1's */
 const PY=SEC.platformY,PX0=trackX('t1')+SEC.car.half+SEC.platformGap,PX1=SEC.x1;
 const platforms=[{id:'line.gap.platform',name:'The gap station\'s platform (the long run\'s last)',x0:PX0,x1:PX1,z0:250,z1:440},{id:'line.s1.platform',name:'S1\'s platform',x0:PX0,x1:PX1,z0:1030,z1:1210}];
 /* THE WALK ACROSS THE GAP (a route: PLAN.md section 4, LINE.gaps[i].walk): the walkway to the lip, the Fixers' ramp down the near fall, the path across
    the chamber, the sump, the Fixers' stair up the far fall, S1's walkway and its platform's steps */
 const ramp=[[SEC.walk.x0+1.2,SEC.walk.y,466]];for(let z=476;z<=612;z+=8){const x=14.8+(8-14.8)*(z-466)/(612-466);ramp.push([x,nearH(x,z)+.35,z]);}
 ramp[ramp.length-1][1]=FLOOR;
 const path=[[8,FLOOR,612],[6.5,FLOOR,714],[6.5,POOL.floor,724],[6.5,POOL.floor,756],[6.5,FLOOR,766],[7,FLOOR,925]];
 const stair=[[7,FLOOR,925]];for(let z=933;z<1016;z+=8){const x=7+(14.8-7)*(z-925)/(1016-925);stair.push([x,farH(x,z)+.35,z]);}stair.push([SEC.walk.x0+1.2,SEC.walk.y,1016]);
 for(let i=1;i<ramp.length;i++)ramp[i][1]=Math.min(ramp[i][1],ramp[i-1][1]+3.5);for(let i=stair.length-2;i>0;i--)stair[i][1]=Math.min(stair[i][1],stair[i+1][1]+3.5);
 const walkPts=[[SEC.walk.x0+1.2,PY,440],[SEC.walk.x0+1.2,SEC.walk.y,444]].concat(ramp,path.slice(1),stair.slice(1),[[SEC.walk.x0+1.2,PY,1030]]);
 let wlen=0;for(let i=1;i<walkPts.length;i++)wlen+=Math.hypot(walkPts[i][0]-walkPts[i-1][0],walkPts[i][1]-walkPts[i-1][1],walkPts[i][2]-walkPts[i-1][2]);
 const D={gaps:RW.gaps,segments:RW.segments};   /* the record's gaps and segments over the window */
 const gaps=D.gaps.map((g,i)=>({id:'line.gap.G2',s0:g.s0,s1:g.s1,kind:'fall',walk:{id:'line.gap.G2.walk',pts:walkPts,len:Math.round(wlen),minutes:Math.round(wlen/.6/60),hazards:['fall','drown','gas']}}));
 /* THE LAMPS: green on the walkways, the road and the strip's masts in both stretches; green on posts every 20 m down the ramp, across the chamber and up
    the stair (the gap's walk); white hooded at each lip (danger: stop); amber at the porters' hold and at S1's platform (work) */
 const lamps=[],inGal=z=>(z>=0&&z<=LIP-10)||(z>=FAR+10&&z<=WIN.walk1+100);
 for(let z=0;z<=WIN.z1-20;z+=50)if(inGal(z)){lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:SEC.walk.y+2.3,z,base:SEC.walk.y});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});}
 for(let z=25;z<WIN.z1-20;z+=50)if(inGal(z)&&!inXO(z))lamps.push({id:'line.lamp.s'+Math.round(S0+z),kind:'green',x:0,y:SEC.strip.y+4,z,base:SEC.strip.y,mast:true});
 const along=(pts,step)=>{const out=[];let acc=step;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[2]-a[2]);for(let d=0;d<L;d+=1){acc+=1;if(acc>=step){acc=0;const u=d/L;out.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u]);}}}return out;};
 along(ramp.concat(path.slice(1),stair.slice(1)),20).forEach((p,i)=>{lamps.push({id:'line.lamp.p'+i,kind:'green',x:p[0]+1.6,y:p[1]+2.4,z:p[2],base:p[1]-.1,path:true});});
 for(const [z,x] of [[LIP-2,14.6],[LIP-2,-12],[FAR+3,14.6],[FAR+3,-12]])lamps.push({id:'line.lamp.white.'+Math.round(S0+z)+(x>0?'e':'w'),kind:'white',x,y:(x>0?SEC.walk.y:SEC.road.footY)+2.3,z,base:x>0?SEC.walk.y:SEC.road.footY});
 lamps.push({id:'line.lamp.amber.hold',kind:'amber',x:15.6,y:PY+2.4,z:395,base:PY},{id:'line.lamp.amber.s1',kind:'amber',x:15.6,y:PY+2.4,z:1060,base:PY});
 const crown=[];for(let z=WIN.z0+5;z<WIN.z1;z+=10)if(z<LIP+20||z>FAR-20)for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});
 /* THE TRAINS: the long run's train at its last platform on T1 (A end at its south end), S1's own at S1's platform; a derelict car in the shed on T4 */
 const standingTrains=[];
 {const cars=LK.consist(null,41),len=LK.trainLen(cars);standingTrains.push({id:'line.train.M.last',label:'The long run\'s train at its last platform',track:'t1',route:routes.t1,cars,len,s:438});}
 {const cars=LK.consist(null,61),len=LK.trainLen(cars);standingTrains.push({id:'line.train.S1',label:'S1\'s train at its platform',track:'t1',route:routes.t1,cars,len,s:1030+len});}
 const standing=[{id:'line.shed.car',key:'anc_line_saloon',variant:1,seed:71,state:'weathered',x:trackX('t4'),y:SEC.guide.h,z:405,yaw:0,label:'A worn-out saloon kept in the shed'}];
 /* THE VOID: both stretches of gallery as rooms, the chamber as a hall whose floor ellipse runs under both galleries' ends (so the fall opens the invert
    into it), the sump a trench in its floor, the niches */
 function cavern(){const L=SEC.lining,C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  const room=(id,z0,z1)=>C.room({id,owner:'line',poly:[[SEC.x0-L,z0],[SEC.x1+L,z0],[SEC.x1+L,z1],[SEC.x0-L,z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'tuff',finish:'raw'});
  room('line.gallery.M',WIN.z0,500);room('line.gallery.S1',1010,WIN.z1);
  C.hall({id:'line.chamber.G2',owner:'line',c:[-2.5,FLOOR,760],rx:60,rz:280,h:34,belly:.25,blend:4,rock:'tuff',finish:'raw'});
  C.trench({id:'line.sump',owner:'line',poly:[[POOL.x0,POOL.z0],[POOL.x1,POOL.z0],[POOL.x1,POOL.z1],[POOL.x0,POOL.z1]],y0:POOL.floor,y1:FLOOR+.2});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'tuff',finish:'hewn'}));
  return C.build();}
 function walk(W){LW.gallery(W,SEC,WIN.z0,LIP,trackX);LW.gallery(W,SEC,FAR,WIN.z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+SEC.lining+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  platforms.forEach(P=>{W.floor({rect:[P.x0,P.x1,P.z0,P.z1],y:PY,name:P.name,tag:'line.platform'});
   W.strip({a:[SEC.walk.x0+1.2,P.z0-4,SEC.walk.y],b:[SEC.walk.x0+1.2,P.z0+.5,PY],w:2.2,name:'the platform\'s steps',tag:'line.platform'});
   W.strip({a:[SEC.walk.x0+1.2,P.z1-.5,PY],b:[SEC.walk.x0+1.2,P.z1+4,SEC.walk.y],w:2.2,name:'the platform\'s steps',tag:'line.platform'});});
  LW.strips(W,ramp,2.4,'the Fixers\' ramp down the fall','line.gapwalk');LW.strips(W,stair,2.0,'the Fixers\' stair up the far fall','line.gapwalk');
  /* the chamber's floor round the sump, the sump's floor, the path's wade in and out */
  W.floor({rect:[-40,36,612,POOL.z0],y:FLOOR,name:'the chamber\'s floor',tag:'line.chamber'});W.floor({rect:[-40,36,POOL.z1,925],y:FLOOR,name:'the chamber\'s floor',tag:'line.chamber'});
  W.floor({rect:[-40,POOL.x0,POOL.z0,POOL.z1],y:FLOOR,name:'the chamber\'s floor',tag:'line.chamber'});W.floor({rect:[POOL.x1,36,POOL.z0,POOL.z1],y:FLOOR,name:'the chamber\'s floor',tag:'line.chamber'});
  W.floor({rect:[POOL.x0,POOL.x1,POOL.z0,POOL.z1],y:POOL.floor,name:'the sump\'s floor (waded)',tag:'line.sump'});
  W.strip({a:[6.5,POOL.z0-8,FLOOR],b:[6.5,POOL.z0+2,POOL.floor],w:3,name:'the wade into the sump',tag:'line.gapwalk'});W.strip({a:[6.5,POOL.z1-2,POOL.floor],b:[6.5,POOL.z1+8,FLOOR],w:3,name:'the wade out of the sump',tag:'line.gapwalk'});
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 const waterH=(x,z)=>x>POOL.x0&&x<POOL.x1&&z>POOL.z0&&z<POOL.z1?LEVEL:-1e9;
 function floorAt(x,z){if(z<LIP)return LW.sectionFloor(SEC,x,trackX,z);if(z>=FAR)return LW.sectionFloor(SEC,x,trackX,z);if(inNear(z))return nearH(x,z);if(inFar(z))return farH(x,z);return FLOOR;}
 /* the window's own checks (each with its negative): the gap and its walk, the path's lamps, the sump wadeable, the lips' white lamps */
 const CHK={
  gap(C){const g=LK.derive(C,SEC.tracks.map(t=>t.id),S0+WIN.z0,S0+WIN.z1).gaps,W=gaps[0]&&gaps[0].walk,ok=g.length===1&&Math.abs(g[0].s0-(S0+LIP))<2&&Math.abs(g[0].s1-(S0+FAR))<3&&W&&W.pts[0][2]<LIP+5&&W.pts[W.pts.length-1][2]>FAR-5;
   return{ok:!!ok,detail:g.length?g.length+' gap(s): bore m '+g.map(x=>x.s0+'-'+x.s1).join(', ')+(W?'; its walk '+W.len+' m, about '+W.minutes+' min, z '+Math.round(W.pts[0][2])+' to '+Math.round(W.pts[W.pts.length-1][2]):''):'no gap: a track runs across the fall'};},
  pathLamps(L){const G=L.filter(l=>l.kind==='green'&&l.on!==false),pts=along(ramp.concat(path.slice(1),stair.slice(1)),5);let worst=0,at=null;
   for(const p of pts){const d=Math.min(...G.map(l=>Math.hypot(l.x-p[0],l.z-p[2])));if(d>worst){worst=d;at=p;}}
   return{ok:worst<=16&&pts.length>0,detail:'the farthest point of the gap\'s walk from a green lamp: '+worst.toFixed(1)+' m'+(at?' at z '+Math.round(at[2]):'')+' (16 m allowed)'};},
  sump(level){const d=level-POOL.floor;return{ok:d>=.3&&d<=.9,detail:'the sump '+d.toFixed(2)+' m deep over the walk (waded: 0.3 to 0.9 m)'};},
  platformEdge(P){const bad=P.filter(Q=>{const d=Q.x0-(trackX('t1',(Q.z0+Q.z1)/2)+SEC.car.half);return Math.abs(d-SEC.platformGap)>.05;});
   return{ok:!bad.length&&P.length>0,detail:bad.length?bad.map(Q=>Q.name+': '+(Q.x0-(trackX('t1',(Q.z0+Q.z1)/2)+SEC.car.half)).toFixed(2)+' m off the car').join('; '):P.length+' platforms, each edge '+SEC.platformGap+' m off the side of the car'};},
  whites(L){const W=L.filter(l=>l.kind==='white'),miss=[LIP,FAR].filter(z=>!W.some(l=>Math.abs(l.z-z)<12));return{ok:!miss.length,detail:miss.length?'no hooded white lamp at the lip at z '+miss.join(', '):W.length+' hooded white lamps at the two lips (danger)'};}};
 return {S0,SEC,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers,lamps,crown,standingTrains,standing,trains:[],platforms,gaps,segments:D.segments,
  sectionAt:z=>(z<498||z>=FAR)?SEC:null,profileAt:()=>PROF,
  /* the ragged edge: near the lips the vault fell first; a segment is gone where its height and its hash say */
  liningCut(z,i,P){const y=(P[i][1]+P[i+1][1])/2,u=KRAND.unit(KRAND.hash(SITE.world,i,Math.floor(z/2))),k=y/SEC.crown*(.55+.45*u);
   if(z>=466&&z<498)return z>498-32*k;if(z>=FAR&&z<FAR+32)return z<FAR+32*k;return false;},
  gallerySpans:[[WIN.z0,LIP],[FAR,WIN.z1]],cavern,walk,waterH,floorAt,nearH,farH,POOL,LEVEL,LIP,FAR,ramp,stair,path,
  rockShows:(x0,z0,cs,y0)=>z0+cs>458&&z0<1024,
  gypWeight:(x,y,z,nx,ny,nz)=>z>495&&z<1015&&y<-3?Math.min(1,(ny>.55?.85:0)+(y<-11?.55:0)):0,
  lights:[{x:15,y:PY+2.6,z:395,color:0xffb060,intensity:1.6,range:20},{x:15,y:PY+2.6,z:1060,color:0xffb060,intensity:1.6,range:20},
   {x:4,y:FLOOR+6,z:690,color:0xd8e0c8,intensity:.22,range:34},{x:4,y:FLOOR+6,z:840,color:0xd8e0c8,intensity:.22,range:34}],
  clearSpans:[[WIN.walk0,LIP-5],[FAR+5,WIN.walk1]],lampSpans:[[WIN.walk0,LIP-10],[FAR+10,WIN.walk1]],
  works(){const O=LW.galleryWorks(SEC,WIN,lamps,crown.filter(c=>c.z<LIP||c.z>FAR),[[WIN.z0,LIP],[FAR,WIN.z1]]);
   return O;},   /* the platforms are not works to clear by the margin: their edge stands 0.1 m off the car (the platform-edge check) */
  walkWant:[[14.4,PY,400,'the gap station\'s platform'],[SEC.walk.x0+1,SEC.walk.y,100,'the long run\'s walkway'],[0,FLOOR,650,'the chamber\'s floor'],[6.5,POOL.floor,740,'the sump\'s floor'],
   [SEC.walk.x0+1,SEC.walk.y,1020,'S1\'s walkway'],[14.4,PY,1100,'S1\'s platform']],
  reach:{start:[14.4,PY,400],box:[-42,20,240,1240],targets:[[14.4,PY,1100]],note:'from the gap station\'s platform down the ramp, across the chamber and the sump, up the stair to S1\'s platform'},
  hazards(){return [{name:'The sump: seepage across the chamber\'s low ground (waded at 0.65 m)',key:'hazard.sump',x:0,z:(POOL.z0+POOL.z1)/2,y:POOL.floor,r:6,h:1,tags:{hazard:{kind:'drown',danger:.3,shape:{type:'box',w:POOL.x1-POOL.x0,h:1.2,d:POOL.z1-POOL.z0}}}},
   {name:'Bad air pooled on the chamber\'s low ground (CO2 from the rift fill)',key:'hazard.gas.G2',x:-18,z:800,y:FLOOR,r:28,h:1.4,tags:{hazard:{kind:'gas',danger:.4,shape:{type:'cyl',r:28,h:1.4}}}},
   {name:'The near lip: the gallery broken off over the fall',key:'hazard.fall.near',x:-2.5,z:LIP+18,y:-2,r:4,h:4,tags:{hazard:{kind:'fall',shape:{type:'box',w:37,h:4,d:20}}}},
   {name:'The far lip: S1\'s gallery broken off over the fall',key:'hazard.fall.far',x:-2.5,z:FAR-14,y:-2,r:4,h:4,tags:{hazard:{kind:'fall',shape:{type:'box',w:37,h:4,d:20}}}}];},
  records(){const R=platforms.map(P=>({name:P.name,key:P.id,x:(P.x0+P.x1)/2,z:(P.z0+P.z1)/2,y:PY-1,r:(P.z1-P.z0)/2,h:3,tags:{line:{kind:'platform',by:'tungang'}}}));
   R.push({name:'The gap G2: the gallery fallen whole into a hypogene chamber (walk '+gaps[0].walk.len+' m, about '+gaps[0].walk.minutes+' min)',key:'line.gap.G2',x:-2.5,z:760,y:FLOOR,r:200,h:30,tags:{line:{kind:'gap',s0:gaps[0].s0,s1:gaps[0].s1,walk:gaps[0].walk.len}}});
   R.push({name:'The porters\' hold (crates, sacks, a plate hut)',key:'line.gap.hold',x:15,z:405,y:PY,r:8,h:3,tags:{line:{kind:'hold',by:'tungang'}}});
   R.push({name:'The shed over T4 (plate on posts)',key:'line.gap.shed',x:trackX('t4'),z:400,y:0,r:35,h:7,tags:{line:{kind:'shed',by:'tungang'}}});
   R.push({name:'The sump (seepage, waded)',key:'line.sump',x:0,z:740,y:POOL.floor,r:18,h:1.2,tags:{line:{kind:'sump'}}});return R;},
  checks(){const C2=JSON.parse(JSON.stringify(cond));C2.t1=[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:'kept'}];
   return {checks:[Object.assign({name:'the gap: every track cut across the fall, and a walk across it (LINE.gaps)'},CHK.gap(cond)),
     Object.assign({name:'green lamps along the gap\'s walk (within 16 m everywhere)'},CHK.pathLamps(lamps)),
     Object.assign({name:'the sump is waded, not swum'},CHK.sump(LEVEL)),
     Object.assign({name:'a hooded white lamp at each lip (danger)'},CHK.whites(lamps)),
     Object.assign({name:"the platforms' edges 0.1 m off the car (no step to fall in, no rub)"},CHK.platformEdge(platforms))],
    negatives:[{name:'negative: T1 left running across the fall',failed:!CHK.gap(C2).ok,detail:CHK.gap(C2).detail},
     {name:'negative: the path\'s lamps taken away',failed:!CHK.pathLamps(lamps.filter(l=>!l.path)).ok,detail:CHK.pathLamps(lamps.filter(l=>!l.path)).detail},
     {name:'negative: the sump a metre deeper',failed:!CHK.sump(LEVEL+1).ok,detail:CHK.sump(LEVEL+1).detail},
     {name:'negative: a platform edge 0.5 m out',failed:!CHK.platformEdge([Object.assign({},platforms[0],{x0:platforms[0].x0+.5})]).ok,detail:CHK.platformEdge([Object.assign({},platforms[0],{x0:platforms[0].x0+.5})]).detail},
     {name:'negative: the white lamps taken away',failed:!CHK.whites(lamps.filter(l=>l.kind!=='white')).ok,detail:CHK.whites(lamps.filter(l=>l.kind!=='white')).detail}]};},
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],exportBox:[-30,700,30,780],
  ambient:{k:.34,fog:.0026},
  describe(p){return p.z>LIP&&p.z<FAR?'\nthe gap G2: '+(p.y<-10?'the chamber\'s floor, '+(SITE.chamber.temp)+' degC, damp':'the fall'):'';},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,crossovers,niches,lamps,platforms,gaps,segments:D.segments,
   standingTrains:standingTrains.map(T=>({id:T.id,track:T.track,s:T.s,cars:T.cars})),standing,routes,pool:POOL,level:LEVEL};}};
})();
