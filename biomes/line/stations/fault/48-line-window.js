// ================================================================= LINE — the fault's window: bore km 43.85-45.05, twin bores through the impact breccia  [G data]
// biomes/line/PLAN.md section 5, station 6: the ruin states by track. The four-track gallery from the north (z < 150); a JUNCTION HALL (z 150-260)
// where the tracks splay apart and the trains cross over from the east pair to the west (t1 to t2, t2 to t3, kept); TWIN BORES past it (z > 260),
// the west (t3, t4 and the road) kept, the east (t1, t2 and the walkway) left: a SLUMP FAULT shears the east bore at z 620 (its two tracks cut,
// its beams and the bore itself offset 3 m east beyond), and past it a LOW POINT floods both its tracks 0.9 m deep with CO2 pooled over the water.
// A ring here may hold two sections (LINE.sectionsAt): the shared lining and checks draw each.
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1050,walk0:0,walk1:1000},G=SEC.guide,L=SEC.lining,WY=SEC.walk.y;
 const J0=150,J1=260,FZ=620,FW=[605,635],FLOOD={x0:0,x1:0,z0:700,z1:800,level:.9};
 const JUNC={x0:-30,x1:26,spring:9,crown:16,lining:L,wsplit:[0,.45,2,4],esplit:[3.4,1.2,0],key:'junction'};
 const EB={x0:5,x1:22,spring:6,crown:12.5,lining:L,wsplit:[0,2,4],esplit:[3.4,1.2,0],key:'east'};
 const EB2=Object.assign({},EB,{x0:EB.x0+3,x1:EB.x1+3,key:'east2'});
 const WB={x0:-27,x1:-5,spring:6,crown:12.5,lining:L,wsplit:[0,.45,2,4],esplit:[3.4,1.2,0],key:'west'};
 FLOOD.x0=EB2.x0;FLOOD.x1=EB2.x1;
 const PROFS={gallery:LK.profileOf(SEC,36),junction:LK.profileOf(JUNC,40),east:LK.profileOf(EB,28),east2:LK.profileOf(EB2,28),west:LK.profileOf(WB,28)};
 const sectionsAt=z=>z<J0?[SEC]:z<J1?[JUNC]:z<FZ?[WB,EB]:[WB,EB2];
 /* THE TRACKS: splayed 5 m apart through the junction; the east pair 3 m further east past the fault (the slump's offset) */
 const SPL={t1:5,t2:5,t3:-5,t4:-5},nom=id=>SEC.tracks.find(t=>t.id===id).x;
 const RW=RIFT.window(S0,WIN),trackX=RW.trackX;   /* the window of the one Rift record (47c-line-record.js): its tracks' offsets, states, crossovers */
 const cond=RW.cond;
 const trackRuns=id=>cond[id].filter(c=>c.state!=='cut').map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(t=>routes[t.id]=LK.makeRoute(z=>trackX(t.id,z),WIN.z0,WIN.z1,4));
 const crossovers=RW.crossovers;
 /* THE NICHES: in the gallery's east wall and the east bore's */
 const niches=[];for(let z=25;z<WIN.walk1;z+=50){if(z>J0-15&&z<J1+15||(z>FW[0]-15&&z<FW[1]+15))continue;niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:WY,sec:z<J0?SEC:z<FZ?EB:EB2});}
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h,sec:N.sec}));
 /* THE LAMPS: the code on the kept ways (the gallery, the junction, the west bore's footway); the east bore's posts dead; white at its mouth and the fault */
 const lamps=[];
 for(let z=0;z<=WIN.walk1;z+=50){if(z<J0-10){lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:WY+2.3,z,base:WY});lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});}
  else if(z>J1+10){lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-26.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});
   if(!(z>FW[0]-10&&z<FW[1]+10)){const x=(z<FZ?EB:EB2).x1-.8;lamps.push({id:'line.lamp.e'+Math.round(S0+z),kind:'green',x,y:WY+2.3,z,base:WY,on:false});}}}
 for(const z of [185,225])lamps.push({id:'line.lamp.j'+z,kind:'green',x:0,y:4.4,z,base:0,mast:true});
 lamps.push({id:'line.lamp.white.mouth',kind:'white',x:EB.x1-.6,y:WY+2.8,z:J1+6,base:WY},{id:'line.lamp.white.fault',kind:'white',x:EB.x1-.6,y:WY+2.8,z:FW[0]-4,base:WY});
 const crown=[];for(let z=WIN.z0+5;z<J0;z+=10)for(const x of [-15,-9,-3,3,9])crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});
 /* THE TRAINS: two kept trains in the west bore, through the junction on t3 and t4 */
 const trains=[];
 for(const [id,tr,seed,phase] of [['line.train.W3','t3',181,0],['line.train.W4','t4',191,120]]){const cars=LK.consist(null,seed),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT,dir=tr==='t3'?1:-1,a=dir>0?WIN.z0-20:WIN.z1+len+20;
  trains.push({id,track:tr,route:routes[tr],dir,cars,len,timeline:KSCHED.timeline({period:240,phase,segments:[{dur,from:a,to:a+dir*run,ease:'linear',name:'run'},{dur:240-dur,from:a+dir*run,name:'stop:off'}]})});}
 /* THE VOID: the gallery, the junction hall, the twin bores (the east one in two pieces across the fault), the niches */
 function cavern(){const C=KCAVERN.create({ground:()=>SITE.cover,cell:1,chunk:16,seed:SITE.world,walk:null});
  const room=(id,S,z0,z1)=>C.room({id,owner:'line',poly:[[S.x0-L,z0],[S.x1+L,z0],[S.x1+L,z1],[S.x0-L,z1]],y:-L,h:S.spring+L,ceil:'vault',rise:S.crown-S.spring+L,rock:'breccia',finish:'raw'});
  room('line.gallery',SEC,WIN.z0,J0+4);room('line.junction',JUNC,J0,J1);room('line.bore.W',WB,J1-4,WIN.z1);room('line.bore.E',EB,J1-4,FZ+2);room('line.bore.E2',EB2,FZ-2,WIN.z1);
  niches.forEach(N=>{const S=N.sec;C.room({id:N.id,owner:'line',poly:[[S.x1+L-.1,N.z-N.w/2],[S.x1+L+N.d,N.z-N.w/2],[S.x1+L+N.d,N.z+N.w/2],[S.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'breccia',finish:'hewn'});});
  return C.build();}
 /* THE WALK: the gallery; the junction's invert, guideways and the jogs of the walkway and the road; each bore's floors; the scramble over the
    fault's rubble from the east bore's walkway to its offset piece; the lamp posts and the west bore's barrier as blocks */
 function walk(W){LW.gallery(W,SEC,WIN.z0,J0,trackX);
  W.floor({rect:[JUNC.x0,JUNC.x1,J0,J1],y:0,name:'the junction\'s invert',tag:'line.invert'});
  for(let z=J0;z<J1;z+=4)SEC.tracks.forEach(t=>{const x=trackX(t.id,z+2);W.floor({rect:[x-G.w/2,x+G.w/2,z,z+4],y:G.h,name:'guideway '+t.id.toUpperCase(),tag:'line.guideway'});});
  W.strip({a:[14.8,J0,WY],b:[20.8,J1,WY],w:2.4,name:'the walkway\'s jog',tag:'line.walkway'});W.strip({a:[-16.5,J0,SEC.road.y],b:[-22.5,J1,SEC.road.y],w:6.6,name:'the road\'s jog',tag:'line.road'});
  /* a bore's guideways and the invert between lo and hi round them */
  const bore=(z0,z1,tr,lo,hi)=>{const xs=tr.map(id=>trackX(id,(z0+z1)/2)).sort((a,b)=>a-b);
   xs.forEach(x=>W.floor({rect:[x-G.w/2,x+G.w/2,z0,z1],y:G.h,name:'a guideway',tag:'line.guideway'}));
   let x=lo;xs.map(x=>[x-G.w/2,x+G.w/2]).concat([[hi,hi]]).forEach(([a,b])=>{if(a>x+.05)W.floor({rect:[x,a,z0,z1],y:0,name:'the invert',tag:'line.invert'});x=b;});};
  bore(J1,WIN.z1,['t3','t4'],-18.75,WB.x1);
  W.floor({rect:[-25.8,-19.2,J1,WIN.z1],y:SEC.road.y,name:'the west bore\'s road',tag:'line.road'});W.floor({rect:[WB.x0,-25.8,J1,WIN.z1],y:SEC.road.footY,name:'the west bore\'s footway',tag:'line.road'});
  W.block([-19.2,-18.75,J1,WIN.z1,SEC.road.y,SEC.road.y+SEC.road.barrierH],'line.barrier');
  bore(J1,FW[0],['t1','t2'],EB.x0,EB.x1-2.4);bore(FW[1],WIN.z1,['t1','t2'],EB2.x0,EB2.x1-2.4);
  W.floor({rect:[EB.x1-2.4,EB.x1,J1,FW[0]],y:WY,name:'the east bore\'s walkway',tag:'line.walkway'});W.floor({rect:[EB2.x1-2.4,EB2.x1,FW[1],WIN.z1],y:WY,name:'the east bore\'s walkway (past the fault)',tag:'line.walkway'});
  W.strip({a:[EB.x1-1.2,FW[0]-.5,WY],b:[EB.x1+.3,FZ,3.2],w:2,name:'the scramble over the fault',tag:'line.fault'});W.strip({a:[EB.x1+.3,FZ,3.2],b:[EB2.x1-1.2,FW[1]+.5,WY],w:2,name:'the scramble over the fault',tag:'line.fault'});
  niches.forEach(N=>W.floor({rect:[N.sec.x1-.1,N.sec.x1+L+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 function floorAt(x,z){if(z<J0)return LW.sectionFloor(SEC,x,trackX,z);for(const t of SEC.tracks)if(Math.abs(x-trackX(t.id,z))<=G.w/2)return G.h;
  if(z>=J1){const E=z<FZ?EB:EB2;if(x>E.x1-2.4&&x<=E.x1)return WY;if(x>=-25.8&&x<=-19.2)return SEC.road.y;if(x<-25.8)return SEC.road.footY;}return 0;}
 const waterH=(x,z)=>x>FLOOD.x0&&x<FLOOD.x1&&z>FLOOD.z0&&z<FLOOD.z1?FLOOD.level:-1e9;
 const CHK={
  shear(C,dx){const cut=id=>(C[id]||[]).some(c=>c.state==='cut'&&c.s0<=S0+FZ-10&&c.s1>=S0+FZ+10),off=trackX('t1',FW[1]+2)-trackX('t1',FW[0]-2);
   return{ok:cut('t1')&&cut('t2')&&Math.abs(off-dx)<1e-6,detail:'t1 '+(cut('t1')?'cut':'running')+', t2 '+(cut('t2')?'cut':'running')+' across the fault; the beams offset '+off.toFixed(1)+' m'};},
  through(C,X){const xo=X.find(x=>x.a==='t2'&&x.b==='t3'),run=id=>(C[id]||[]).every(c=>c.state==='kept');
   return{ok:!!xo&&xo.state==='kept'&&run('t3')&&run('t4'),detail:(xo?'the crossover t2 to t3 '+xo.state:'no crossover')+'; the west bore\'s tracks '+(run('t3')&&run('t4')?'kept end to end':'broken')};},
  flood(C){const f=id=>(C[id]||[]).some(c=>c.state==='flooded'&&c.depth>.6);return{ok:f('t1')&&f('t2'),detail:'the low point: t1 '+(f('t1')?'flooded over 0.6 m':'passable')+', t2 '+(f('t2')?'flooded over 0.6 m':'passable')};},
  pillar(x){const bad=[];for(let z=J1+10;z<WIN.z1-10;z+=20)for(const y of [1,5,9])if(CAVE_C.sdf(x,y,z)>0)bad.push('z '+z+' y '+y);return{ok:!bad.length,detail:bad.length?'open at x '+x+': '+bad.slice(0,3).join(', '):'rock between the bores (x '+x+') from z '+(J1+10)+' to '+(WIN.z1-10)};},
  noGap(C){const D=LK.derive(C,SEC.tracks.map(t=>t.id),S0+WIN.z0,S0+WIN.z1);return{ok:!D.gaps.length,detail:D.gaps.length?D.gaps.length+' gap(s): every track cut':'no gap: the west bore runs while the east is cut and flooded'};}};
 const brokenWest=Object.assign({},cond,{t3:[{s0:S0+WIN.z0,s1:S0+FZ-20,state:'kept'},{s0:S0+FZ-20,s1:S0+FZ+20,state:'cut'},{s0:S0+FZ+20,s1:S0+WIN.z1,state:'kept'}],t4:[{s0:S0+WIN.z0,s1:S0+FZ-20,state:'kept'},{s0:S0+FZ-20,s1:S0+FZ+20,state:'cut'},{s0:S0+FZ+20,s1:S0+WIN.z1,state:'kept'}]});
 return {S0,SEC,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers,lamps,crown,trains,standingTrains:[],standing:[],JUNC,EB,EB2,WB,J0,J1,FZ,FW,FLOOD,
  sectionsAt,sectionAt:z=>sectionsAt(z)[0],profileAt:(z,S)=>PROFS[(S||sectionsAt(z)[0]).key],
  liningCut:(z,i,P,S)=>!!S&&(S.key==='east'||S.key==='east2')&&z>=FW[0]&&z<FW[1]&&(P[i][1]+P[i+1][1])/2>1,
  gallerySpans:[[WIN.z0,J0]],cavern,walk,floorAt,waterH,rockLayer:'rock.breccia',rockName:'impact breccia (km 33-53)',
  rockShows:(x0,z0,cs)=>(x0+cs>SEC.x1+L-2&&z0<J0)||(z0+cs>J1-6&&x0<7&&x0+cs>-7)||(z0+cs>FW[0]-8&&z0<FW[1]+8&&x0+cs>3)||(x0+cs>EB.x1+L-2&&z0+cs>J1),
  lights:[{x:-2,y:12,z:205,color:0xffd8a0,intensity:.7,range:40}],
  ambient:{k:.38,fog:.0026},
  clearSpans:[[WIN.walk0,J1-20],[J1-20,WIN.walk1]],lampSpans:[[WIN.walk0,WIN.walk1]],
  works(){const O=LW.galleryWorks(SEC,WIN,lamps.filter(l=>l.z<J0),crown,[[WIN.z0,J0]]);
   O.push({name:'the west bore\'s barrier',x0:-19.2,x1:-18.75,y0:0,y1:SEC.road.y+SEC.road.barrierH,z0:J1,z1:WIN.z1});
   lamps.filter(l=>l.mast).forEach(l=>O.push({name:'a junction mast',x0:l.x-.14,x1:l.x+.62,y0:0,y1:l.y+.1,z0:l.z-.15,z1:l.z+.15}));
   return O;},
  walkWant:[[14.8,WY,60,'the gallery\'s walkway'],[0,0,205,'the junction\'s invert'],[-22.5,SEC.road.y,400,'the west bore\'s road'],[EB.x1-1.2,WY,400,'the east bore\'s walkway'],[EB2.x1-1.2,WY,700,'the east bore\'s walkway past the fault']],
  reach:{start:[EB.x1-1.4,WY,412],box:[3,27,0,1000],targets:[[EB2.x1-1.2,WY,750],[14.8,WY,60]],note:'along the east bore\'s walkway: back to the gallery, over the fault and past the flood'},
  hazards(){return [{name:'The slump fault: the east bore\'s fallen section (loose breccia over the scramble)',key:'hazard.crush.fault',x:(EB.x0+EB2.x1)/2,z:FZ,y:0,r:10,h:12,tags:{hazard:{kind:'crush',danger:.4,shape:{type:'box',w:EB2.x1-EB.x0,h:12,d:FW[1]-FW[0]}}}},
   {name:'The low point: the east bore flooded 0.9 m deep',key:'hazard.drown.low',x:(FLOOD.x0+FLOOD.x1)/2,z:(FLOOD.z0+FLOOD.z1)/2,y:0,r:10,h:1,tags:{hazard:{kind:'drown',danger:.45,shape:{type:'box',w:FLOOD.x1-FLOOD.x0,h:1.2,d:FLOOD.z1-FLOOD.z0}}}},
   {name:'CO2 pooled over the low point (from the breccia\'s faults)',key:'hazard.gas.low',x:(FLOOD.x0+FLOOD.x1)/2,z:(FLOOD.z0+FLOOD.z1)/2,y:FLOOD.level,r:10,h:1.5,tags:{hazard:{kind:'gas',effect:'suffocate',danger:.55,shape:{type:'box',w:FLOOD.x1-FLOOD.x0,h:1.5,d:FLOOD.z1-FLOOD.z0+40}}}}];},
  records(){return [{name:'The junction hall: the gallery divides into twin bores; the trains cross over to the west',key:'line.junction.F',x:-2,z:(J0+J1)/2,y:0,r:30,h:JUNC.crown,tags:{line:{kind:'junction',form:'twin'}}},
   {name:'The slump fault: the east bore sheared, its beams offset 3 m',key:'line.fault.slump',x:(EB.x0+EB2.x1)/2,z:FZ,y:0,r:12,h:12,tags:{line:{kind:'fault',offset:3,tracks:['t1','t2']}}},
   {name:'The low point: both east tracks flooded 0.9 m',key:'line.flood.low',x:(FLOOD.x0+FLOOD.x1)/2,z:(FLOOD.z0+FLOOD.z1)/2,y:0,r:20,h:1.2,tags:{line:{kind:'flood',depth:FLOOD.level}}}];},
  checks(){const C2=JSON.parse(JSON.stringify(cond));C2.t2=[{s0:S0+WIN.z0,s1:S0+WIN.z1,state:'worn'}];const C3=JSON.parse(JSON.stringify(cond));C3.t1.forEach(c=>{if(c.state==='flooded')c.depth=.3;});
   return {checks:[Object.assign({name:'the fault shears the east bore: both its tracks cut, its beams offset 3 m'},CHK.shear(cond,3)),Object.assign({name:'the trains run on through the west bore over the junction\'s crossover'},CHK.through(cond,crossovers)),
    Object.assign({name:'the low point floods both east tracks over 0.6 m'},CHK.flood(cond)),Object.assign({name:'the pillar between the bores is rock'},CHK.pillar(0)),Object.assign({name:'no gap: the line runs on'},CHK.noGap(cond))],
   negatives:[{name:'negative: t2 left running across the fault',failed:!CHK.shear(C2,3).ok,detail:CHK.shear(C2,3).detail},
    {name:'negative: the crossover frozen',failed:!CHK.through(cond,crossovers.map(x=>Object.assign({},x,{state:'frozen'}))).ok,detail:CHK.through(cond,crossovers.map(x=>Object.assign({},x,{state:'frozen'}))).detail},
    {name:'negative: the flood 0.3 m',failed:!CHK.flood(C3).ok,detail:CHK.flood(C3).detail},{name:'negative: the same test in the east bore',failed:!CHK.pillar(14).ok,detail:CHK.pillar(14).detail},
    {name:'negative: the west bore cut at the fault too',failed:!CHK.noGap(brokenWest).ok,detail:CHK.noGap(brokenWest).detail}]};},
  exportProfile:['registry','hazards','terrain','stage','atmos','water'],exportBox:[0,560,28,820],
  describe(p){return p.z>=J1?(p.x>0?'\nthe east bore'+(p.z>=FZ?' (past the fault)':''):'\nthe west bore'):p.z>=J0?'\nthe junction hall':'';},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,crossovers,niches,lamps,sections:{junction:JUNC,east:EB,east2:EB2,west:WB},fault:{z:FZ,offset:3},flood:FLOOD,
   trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
