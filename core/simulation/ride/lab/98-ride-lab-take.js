// ================================================================= RIDE LAB — the take: core/host, the rider, the checks' API
// [web] The page on core/host's shell with the opt-in ride host fragment (core/walk/frame/95-walk-frame-host.js): walk (F), walk through an
// open car door, ride; E by a seat sits, E again stands. The views look at the Line, Ledge's station, the gap and Twenny;
// "Walk at Ledge" stands the walker on Ledge's platform. window._api.lab is what verify.py drives.
var RLRIDE=null;
const LABH=KHOST.take({
 build:'ride-lab',title:'Ride lab',hint:'riding on core/walk/frame and core/simulation/ride: F walks; walk through an open door to board; E sits',
 scene,camera,renderer,ground:labGround,walk:KWALK,clear:1.2,maxR:3000,minR:2,
 views:{'The Line':[1050,520,520,1050,0,0],'Ledge station':[60,16,-46,60,1.5,0],'The gap':[1000,150,-230,1010,0,-30],'Twenny':[1980,16,-46,1980,1.5,0]},
 clock:{obj:LABCLOCK,speeds:[0,1,2,4,8,16]},
 registry:Object.keys(RL.L.stops).map(id=>{const s=RL.L.stops[id];return {name:s.name,x:s.x,y:1.1,z:-4,r:36,h:6};}),
 controls:[{button:'Walk at Ledge',on:()=>RLAPI.standAt(RL.L.stops.ledge.x-4,1.1,-3.6,Math.PI)}],
 stats:()=>{const t=LABCLOCK.t,rep=SIM.tradeReport(),A=SIM.rideAudit(),aboard=Object.keys(SIM.RIDE.riders).length,R=RLRIDE?RLRIDE.state():{aboard:null};
  const tr=RL.L.sources.map(S=>{const d=SIM.rideDwellAt(S.id,t);return S.id+': '+(d?'at '+d.stop+(d.open?' (doors open)':''):'running');}).join('\n');
  const goods=Object.keys(rep).map(id=>id+': '+rep[id].carriers.map(C=>C.phase+(C.cargo.length?' '+C.cargo.map(c=>c.good+' '+c.n).join(', '):'')).join('; ')).join('\n');
  return tr+'\n'+goods+'\ntravellers on journeys: '+aboard+', journeys '+RL.journeys+(RL.failed?' ('+RL.failed+' waited)':'')+'\ndoor windows kept: '+(A.ok?'yes':'NO')+'\nyou: '+(R.aboard?'aboard '+R.aboard+(R.sitting!=null?', seated':''):'on foot');},
 legend:[['#e0b050','a traveller'],['#b4552e','a porter (a crate: carrying)']],
});
RLRIDE=KHOST.ride(LABH,{walk:KWALK,t:()=>LABCLOCK.t,seats:()=>RIDELAB.CAR.seats});
LABH.on(function rideLab(dt,clock){RL.tick(clock.t);},'tick');
LABH.on(function rideLabDraw(dt,clock){labDraw(clock.t,dt,camera.position);},'view');
/* the verify's handles: everything it asks is read from SIM and the walk registry, never kept apart */
const RLAPI={
 standAt(x,y,z,theta){const C=LABH.cam;if(!LABH.ctl.walk)C.walk(true,true);C.walkAt=[x,z,y];LABH.ctl.target.set(x,y+LABH.ctl.eye,z);if(theta!=null)LABH.ctl.theta=theta;},
 feet(){const w=LABH.cam.walkAt;return w?[w[0],w[2],w[1]]:null;},
 /* the next dwell of a train at a stop after t: its door window */
 nextDwell(src,stop,after){for(let g=0;g<4000;g++){const d=SIM.rideDwell(src,g);if(d.stop===stop&&d.o0>after)return d;}return null;},
 doorWorld(src,k,doorId,t){const D=RIDELAB.CAR.doors.find(d=>d.id===doorId);return SIM.rideToWorld(SIM.rideCarPose(src,k,t),D.at);},
 setT(t){LABCLOCK.t=t;},clock(){return {t:LABCLOCK.t,hour:LABCLOCK.hour,day:LABCLOCK.day,scale:LABCLOCK.scale};},scale(s){LABCLOCK.scale=s;},
 run(min){RL.run(min);},
 ride:()=>RLRIDE.state(),
 audit:()=>{const A=SIM.rideAudit();return {ok:A.ok,boards:A.boards,alights:A.alights,outside:A.outside.length,over:A.over.length,journeys:RL.journeys,failed:RL.failed};},
 /* every rider in a frame leg now stands on its own car's floor (the walk side, posed by the same function) */
 onFloors(lift){const t=LABCLOCK.t;let n=0,miss=0,worst=0;KWALKFRAME.at(KWALK,t);
  RL.people.forEach(a=>{const p=SIM.pose(a,t);if(!p.frame)return;n++;const f=KWALK.floorBelow(p.x,p.z,p.y+(lift||0),0.6),fr=RL.L.frames.find(q=>q.src===p.frame.source&&q.k===p.frame.k).F;
   if(!f||f[1].frame!==fr)miss++;else worst=Math.max(worst,Math.abs(f[0]-p.y-(lift||0)));});return {n,miss,worst};},
 cargo(){const led=SIM.ledger(RL.snap0,SIM.ledgerSnap()),r=id=>SIM.TRADE.routes[id].landed;
  return {ledger:led.ok,problems:led.problems.slice(0,3),twennyGrain:SIM.econ('twenny').imported.grain||0,ledgeWax:SIM.econ('ledge').imported.wax||0,
   north:(r('rail.n')['ledge>gapn']||{}).grain||0,porters:(r('gap.porters')['gapn>gaps']||{}).grain||0,south:(r('rail.s')['gaps>twenny']||{}).grain||0,trips:RL.L.porters.trips};},
 porters(){const C=SIM.TRADE.routes['gap.porters'].carriers[0],a=SIM.R.actor[RL.L.porters.crew[0]],p=SIM.pose(a,LABCLOCK.t+0.5);return {phase:C.phase,moving:p.moving};},
 exportMotion(){return SIM.rideExportMotion({actors:RL.people.slice(0,8)});},
};
window._api=window._api||{};window._api.lab=RLAPI;
