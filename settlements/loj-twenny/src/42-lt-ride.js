// prefix: ltr
// ================================================================= LOJ TWENNY: THE BRANCH SHUTTLE AND RIDING (PLAN.md section 3; core/simulation/PLAN-RIDING.md) [G data]
// The branch's kept train shuttles the 25 km between the Twenny junction (station 3 on the Line) and the hold's terminus, on
// the riding hook the Line and the riding session agreed (biomes/line/PLAN.md section 8): a ride source whose cars are the Line's
// own (kits/motor-vehicles, the Kept variant: KratorVehicles.dataOf(key, 1).ride), s(t) its A end along the track, a dwell at
// each end named stop:<id>:<side>; the cars are walk frames (core/walk/frame: KWALKFRAME) whose doors open in their windows,
// so the walker boards at the platform and rides. Written on the ride lab's pattern (core/simulation/ride/lab/40-ride-lab-world.js).
// The track runs +x along track 1 (z -2.6) from the junction (x -24500, off the page west) to the terminus; the cars face +x, so
// their side +1 is -z: the north platform (lt.pn). The guideway's top is y 0.6, the car floor and platforms 1.8 (the Line's).
//   LTR.declare({cars: KratorVehicles, secPerMinute}) -> L    the consist, the stops' places, the ride source
//   LTR.walk(W, L)        the cars' floors, walls, doors (tagged door:<id>) and step plates as frames on the walk registry W
//   LTR.doors(L, t, W)    each door's block off and its plate on while its car's window is open on its side
const LTR=(function(){
 const Y=LT.HALL.platformY,G=LT.HALL.guide.h,TZ=LT.HALL.tracks[0].z,SIDE=1.75,WALLH=2.2,DOORW=1.4,GAP=1.0;
 /* the branch shuttle: a power car, a saloon, the crew car, a van, a power car turned round (the bore's consist, short) */
 const CONSIST=[['anc_line_power',22,false],['anc_line_saloon',24,false],['anc_line_crew',24,false],['anc_line_van',24,false],['anc_line_power',22,true]];
 const RIDERS={anc_line_saloon:true,anc_line_crew:true};
 const X0=-24500,XJ=-24300,DWELL=300,DWELLJ=240,SPEED=15;
 function mirror(R){const M=JSON.parse(JSON.stringify(R)),P=p=>[-p[0],p[1],-p[2]],rect=r=>[-r[1],-r[0],-r[3],-r[2]].concat(r.slice(4));
  (M.seats||[]).forEach(q=>{q.at=P(q.at);q.yaw=(q.yaw==null?0:q.yaw)+Math.PI;});(M.doors||[]).forEach(q=>{q.at=P(q.at);q.side=-q.side;});
  (M.slots||[]).forEach(q=>{if(q.at)q.at=P(q.at);});M.stand=(M.stand||[]).map(rect);if(M.floor)M.floor=rect(M.floor);return M;}
 function consist(KV){if(!KV||!KV.dataOf)throw new Error('LTR.declare: the Line\'s cars (KratorVehicles with the line culture)');let off=0;
  return CONSIST.map((c,k)=>{const d=KV.dataOf(c[0],1);if(!d||!d.ride)throw new Error('LTR: '+c[0]+' has no data.ride');
   const R=c[2]?mirror(d.ride):JSON.parse(JSON.stringify(d.ride));if(!RIDERS[c[0]])R.cap={seats:0,stand:0};
   const car={k,key:c[0],len:c[1],flip:c[2],off:off+c[1]/2,ride:R};off+=c[1]+GAP;return car;});}
 function declare(o){o=o||{};const train=consist(o.cars),last=train[train.length-1],tlen=last.off+last.len/2,aend=tlen/2;
  /* the terminus's stop: the train's middle at x 82 (its length along the north platform, x 22-142, the buffers at 148) */
  const xT=82,track=SIM.rideRoute([[X0,G,TZ],[LT.HALL.buffers,G,TZ]]),sOf=x=>x-X0;
  const L={train,trainLen:tlen,aend,floorY:Y,side:SIDE,stops:{},xT,xJ:XJ,track};
  const wait=x=>{const W=[];train.forEach(c=>{if(!(c.ride.cap.seats+c.ride.cap.stand>0))return;const mid=x+aend-c.off;(c.ride.doors||[]).forEach(D=>{if(D.side===1)W.push([mid+D.at[2],Y,TZ-SIDE-1.4]);});});return W;};
  SIM.place({id:'lt.train',kind:'station',name:'Loj Twenny\'s platform (the shuttle)',x:xT,y:Y,z:-7,door:{x:xT,y:Y,z:-7},activities:{},settlement:LTS.S});
  SIM.place({id:'jn.train',kind:'station',name:'The Twenny junction\'s branch platform',x:XJ,y:Y,z:-7,door:{x:XJ,y:Y,z:-7},activities:{},settlement:LTS.J});
  L.stops.lt={place:'lt.train',side:1,gap:.15,wait:wait(xT),x:xT,name:'Loj Twenny'};L.stops.jn={place:'jn.train',side:1,gap:.15,wait:wait(XJ),x:XJ,name:'the Twenny junction'};
  /* the timetable: a dwell at the hold (5 min), the run west (25 km at 15 m/s, eased), a dwell at the junction, the run back */
  const sa=sOf(xT)+aend,sb=sOf(XJ)+aend,run=Math.round(Math.abs(sa-sb)/SPEED*1.08);
  /* o.at: a motion time the train should stand 30 s into its dwell at the hold (the page starts with it at the platform) */
  const per=DWELL+DWELLJ+2*run,ph=o.at==null?0:(((30-o.at)%per)+per)%per;
  L.timeline={period:per,phase:ph,segments:[{dur:DWELL,from:sa,name:'stop:lt:1'},{dur:run,from:sa,to:sb,ease:'smooth',name:'run'},
   {dur:DWELLJ,from:sb,name:'stop:jn:1'},{dur:run,from:sb,to:sa,ease:'smooth',name:'run'}]};
  L.source=SIM.rideSource({id:'lt.shuttle',kind:'train',track,timeline:L.timeline,stops:L.stops,stepSec:o.secPerMinute==null?3:o.secPerMinute,
   cars:train.map(c=>{const R=c.ride;return {off:c.off,b:R.b,cap:R.cap,seats:R.seats,stand:R.stand,doors:R.doors};})});
  return L;}
 function walk(W,L){L.frames=[];const S=L.source;
  S.cars.forEach(C=>{const car=L.train[C.k],R=car.ride,hl=car.len/2,fl=R.floor||[-1.6,1.6,-hl+.4,hl-.4,1.2],fy=fl[4],wy=[fy,fy+WALLH];
   const F=KWALKFRAME.frame(W,{id:S.id+'.car'+C.k,pose:t=>SIM.rideCarPose(S.id,C.k,t),r:hl+3,source:{ride:S.id,k:C.k}});
   F.floor({rect:[fl[0],fl[1],fl[2],fl[3]],y:fy,name:car.key,tag:'car'});
   F.block([-SIDE,SIDE,fl[2]-.15,fl[2],wy[0],wy[1]],'end');F.block([-SIDE,SIDE,fl[3],fl[3]+.15,wy[0],wy[1]],'end');
   const doorsW={};
   [1,-1].forEach(side=>{const x0=side>0?fl[1]:-SIDE,x1=side>0?SIDE:fl[0];
    const mine=(R.doors||[]).filter(D=>D.side===side&&D.at[2]>fl[2]&&D.at[2]<fl[3]).sort((a,b)=>a.at[2]-b.at[2]);let z=fl[2];
    mine.forEach(D=>{const z0=D.at[2]-DOORW/2,z1=D.at[2]+DOORW/2;if(z0>z)F.block([x0,x1,z,z0,wy[0],wy[1]],'wall');
     const px0=side>0?fl[1]:-SIDE-.4,px1=side>0?SIDE+.4:fl[0];
     doorsW[D.id]={block:F.block([x0,x1,z0,z1,wy[0],wy[1]],'door:'+D.id),plate:F.floor({rect:[px0,px1,z0,z1],y:fy,name:'plate '+D.id,tag:'plate',off:true})};z=z1;});
    if(z<fl[3])F.block([x0,x1,z,fl[3],wy[0],wy[1]],'wall');});
   L.frames.push({src:S.id,k:C.k,F,doors:doorsW,car});});
  return L.frames;}
 function doors(L,t,W){L.frames.forEach(fr=>{Object.keys(fr.doors).forEach(id=>{const open=SIM.rideDoorOpen(fr.src,fr.k,id,t),d=fr.doors[id];W.setBlock(d.block,!open);KWALKFRAME.setFloor(d.plate,open);});});}
 return {declare,walk,doors,CONSIST};})();
