// ================================================================= VERGE — the life layer drawn ([draw])
// Evaluates SIM (74) at the clock's motion time and poses the figures (RIGS, 77). Nothing here decides anything a
// port would need: a group member's pose is a function of t (its group's timeline, its distance behind the leader,
// its slot at a dispersing stop); a citizen's is a function of t along the walk SIM.decide() chose.
//   follow      the member stands SIM.path(leader's s - its lag) aside by its side offset: each one turns at the
//               corner the leader turned at, later, so a caravan bends like a caravan and not like a plank
//   disperse    at a caravanserai or a rest stop each member walks from its place in the queue to the gate and on
//               to its own reserved slot, waits there, and is back in the queue the moment the leader sets off
//   ride        a nomad sits on its mount's saddle (RIGS.SADDLE) except while dispersed, when it walks
const LIFE=(function(){
if(typeof RIGS==='undefined'){reportErr('life: no RIGS (77-verge-rigs.js)');return null;}
const {clamp,mix}=VG,T=SIM.T,cyc=a=>((a%T)+T)%T;
// the pools: one instance per (group, copy, member) and per citizen
let nP=0,nC=0,nL=0;
for(const G of SIM.GROUPS)for(let c=0;c<G.copies;c++)for(const M of G.members){if(M.kind==='person')nP++;else if(M.kind==='camel')nC++;else nL++;}
nP+=SIM.CITIZENS.length;
const PP=RIGS.person(Math.max(1,nP)),PC=RIGS.camel(Math.max(1,nC)),PL=RIGS.lizard(Math.max(1,nL));
const pool=k=>k==='person'?PP:k==='camel'?PC:PL;
let iP=0,iC=0,iL=0;
const slotsOf=[];   // [group][copy][member] -> instance
for(const G of SIM.GROUPS){const per=[];for(let c=0;c<G.copies;c++){per.push(G.members.map(M=>{const i=M.kind==='person'?iP++:M.kind==='camel'?iC++:iL++;
  pool(M.kind).label(i,G.name+'\n'+(M.role||M.kind)+' · '+(SIM.FACTIONS[G.faction]?SIM.FACTIONS[G.faction].name:G.faction)+' / '+G.org+(M.kind!=='person'?' · '+M.kind:''));return i;}));}slotsOf.push(per);}
SIM.CITIZENS.forEach(C=>{C.inst=iP++;PP.label(C.inst,'A townsperson of '+(C.city==='upper'?'Upper':'Lower')+' Verge\n'+C.role+' · '+(SIM.FACTIONS[C.faction].name)+' / '+C.org);});
const SADDLE=RIGS.SADDLE||{camel:2.1,lizard:1.0},STRIDE={person:1.45,camel:2.8,lizard:1.9};
const _p=[0,0,0,0],_q=[0,0,0,0];
const out={x:0,y:0,z:0,yaw:0,speed:0,phase:0,pitch:0,vis:false,pose:'walk',load:null};
const memberPose=SIM.memberPose;
const LOAD_EMPTY={};
function lookWith(look,load){if(load==null)return look;const k=look;return LOAD_EMPTY[JSON.stringify(k)]||(LOAD_EMPTY[JSON.stringify(k)]=Object.assign({},k,{load}));}
// the citizens: walk, or stand at a plaza, or be indoors
function citizenPose(C,t,hour,o){let tr=C.trip;
 if(!tr||t>=tr.t1+(tr.dwellAfter||0)){if(LIFE_BUDGET.n<=0){o.vis=false;return o;}LIFE_BUDGET.n--;tr=SIM.decide(C,t,hour);}
 if(tr.dwell){const P=tr.at;if(P&&P.tags&&P.tags.kind){o.vis=true;o.x=P.x+((C.seed&255)/255-.5)*P.capacity*.08;o.z=P.z+(((C.seed>>8)&255)/255-.5)*P.capacity*.08;o.y=terrainH(o.x,o.z);o.yaw=(C.seed%628)/100;o.speed=0;o.pose='stand';return o;}o.vis=false;return o;}
 if(t>tr.t1){o.vis=false;return o;}                        // arrived: indoors
 const s=(t-tr.t0)*tr.v;SIM.pathAt(tr.path,s,_p);const h=_p[3];o.x=_p[0]+Math.cos(h)*tr.side;o.z=_p[1]-Math.sin(h)*tr.side;o.y=Math.max(terrainH(o.x,o.z),_p[2]-.3);
 o.yaw=h;o.speed=tr.v;o.phase=(s/STRIDE.person)%1;o.pose='walk';o.vis=true;return o;}
const LIFE_BUDGET={n:0};
let first=true,frame=0;
// the first walks start spread over the first minutes, from home
SIM.CITIZENS.forEach((C,i)=>{const R=KRAND.stream(C.seed);C.trip={t0:0,t1:R.range(0,300),dwell:true,at:SIM.PBY[C.home]};C.at=SIM.PBY[C.home];});
const stats={groupsActive:0,membersShown:0,citizensOut:0};
tick((dt,t)=>{frame++;LIFE_BUDGET.n=first?60:14;first=false;
 const hour=CLOCK.hour,cp=camera.position,far=QS.has('lifeR')?+QS.get('lifeR'):2200;let ga=0,ms=0,co=0;
 SIM.GROUPS.forEach((G,gi)=>{const base=cyc(t-G.phase);let any=false;
  for(let c=0;c<G.copies;c++){const tau=base+c*T,inst=slotsOf[gi][c];let mountPose=null;const poses=[];
   for(let k=0;k<G.members.length;k++){const M=G.members[k],P=pool(M.kind);memberPose(G,M,tau,out);
    if(out.vis&&Math.hypot(out.x-cp.x,out.z-cp.z)>far)out.vis=false;
    poses[k]=out.vis?{x:out.x,y:out.y,z:out.z,yaw:out.yaw,speed:out.speed,phase:out.phase,pitch:out.pitch,pose:out.pose}:null;
    if(!out.vis){P.hide(inst[k]);continue;}
    // a rider on its mount (the mount was posed just before it), unless it has dismounted at a stop
    if(M.rides!=null&&!out.dispersed){const m=poses[M.rides];if(m){P.set(inst[k],m.x,m.y+SADDLE[G.members[M.rides].kind],m.z,m.yaw,{phase:0,speed:0,pitch:m.pitch,look:M.look,pose:'ride'});ms++;any=true;continue;}}
    P.set(inst[k],out.x,out.y,out.z,out.yaw,{phase:out.phase,speed:out.speed,pitch:out.pitch,look:lookWith(M.look,out.load),pose:out.pose});ms++;any=true;}}
  if(any)ga++;});
 for(const C of SIM.CITIZENS){citizenPose(C,t,hour,out);if(out.vis&&Math.hypot(out.x-cp.x,out.z-cp.z)>far)out.vis=false;
  if(!out.vis){PP.hide(C.inst);continue;}PP.set(C.inst,out.x,out.y,out.z,out.yaw,{phase:out.phase,speed:out.speed,pitch:0,look:C.look,pose:out.pose});co++;}
 PP.flush();PC.flush();PL.flush();
 stats.groupsActive=ga;stats.membersShown=ms;stats.citizensOut=co;
 if(frame%30===0)window._life={groupsActive:ga,membersShown:ms,citizensOut:co,decisions:SIM.LOG.length,rigs:RIGS.stats()};});
return{stats,memberPose,citizenPose};})();
