// prefix: ltr
// ================================================================= LOJ TWENNY: THE SEGMENT'S TRAIN AND RIDING (PLAN.md section 3; core/simulation/PLAN-RIDING.md) [G data]
// The train that runs the hold's segment of the Line (rift.seg0: the kept trains trapped between the north end and the G2 gap since
// the collapses) stops at station 3 on track 1, at the east platform (the hold's side), and runs on south 18 km to the G2 gap
// station, where the porters carry across toward Ledge: on the riding hook the Line and the riding session agreed (biomes/line/PLAN.md
// section 8): a ride source whose cars are the Line's own (kits/motor-vehicles, the Kept variant: KratorVehicles.dataOf(key, 1).ride),
// s(t) its A end along the track, a dwell at each end named stop:<id>:<side>; the cars are walk frames (core/walk/frame: KWALKFRAME)
// whose doors open in their windows, so the walker boards at the platform and rides. On the ride lab's pattern
// (core/simulation/ride/lab/40-ride-lab-world.js). The track: track 1's guideway top (y 0.6) through the station's window, its x the
// Line's own (LINE.trackX: the splay to 13.4 round the platforms), on south at its nominal 10.5 m to the gap station. The cars face
// +z (the Line's south), so their side +1 is east: the east platform.
//   LTR.declare({cars: KratorVehicles, secPerMinute, at}) -> L    the consist, the stops' places, the ride source
//   LTR.walk(W, L)        the cars' floors, walls, doors (tagged door:<id>) and step plates as frames on the walk registry W
//   LTR.doors(L, t, W)    each door's block off and its plate on while its car's window is open on its side
const LTR=(function(){
 const SIDE=1.75,WALLH=2.2,DOORW=1.4,GAP=1.0;
 /* the segment's train: a power car, a saloon, the crew car, a van, a power car turned round (the bore's consist, short) */
 const CONSIST=[['anc_line_power',22,false],['anc_line_saloon',24,false],['anc_line_crew',24,false],['anc_line_van',24,false],['anc_line_power',22,true]];
 const RIDERS={anc_line_saloon:true,anc_line_crew:true};
 const ZT=450,ZG=18400,DWELL=300,DWELLG=240,SPEED=15;
 function mirror(R){const M=JSON.parse(JSON.stringify(R)),P=p=>[-p[0],p[1],-p[2]],rect=r=>[-r[1],-r[0],-r[3],-r[2]].concat(r.slice(4));
  (M.seats||[]).forEach(q=>{q.at=P(q.at);q.yaw=(q.yaw==null?0:q.yaw)+Math.PI;});(M.doors||[]).forEach(q=>{q.at=P(q.at);q.side=-q.side;});
  (M.slots||[]).forEach(q=>{if(q.at)q.at=P(q.at);});M.stand=(M.stand||[]).map(rect);if(M.floor)M.floor=rect(M.floor);return M;}
 function consist(KV){if(!KV||!KV.dataOf)throw new Error('LTR.declare: the Line\'s cars (KratorVehicles with the line culture)');let off=0;
  return CONSIST.map((c,k)=>{const d=KV.dataOf(c[0],1);if(!d||!d.ride)throw new Error('LTR: '+c[0]+' has no data.ride');
   const R=c[2]?mirror(d.ride):JSON.parse(JSON.stringify(d.ride));if(!RIDERS[c[0]])R.cap={seats:0,stand:0};
   const car={k,key:c[0],len:c[1],flip:c[2],off:off+c[1]/2,ride:R};off+=c[1]+GAP;return car;});}
 /* track 1 along the window (its splay round the station: LINE.trackX), then straight on to the gap station */
 function trackPts(){const P=[],G=LINE.SEC.guide.h,W=LINE.WIN;for(let z=W.z0;z<=W.z1;z+=2)P.push([LINE.trackX('t1',z),G,z]);
  P.push([LINE.trackX('t1',W.z1),G,W.z1+200]);P.push([LINE.trackX('t1',W.z1),G,ZG+300]);return P;}
 function declare(o){o=o||{};const train=consist(o.cars),last=train[train.length-1],tlen=last.off+last.len/2,aend=tlen/2,PY=LINE.SEC.platformY;
  const track=SIM.rideRoute(trackPts()),z0=track.pts[0][2],sOf=z=>{let best=0;for(let i=0;i<track.pts.length;i++)if(track.pts[i][2]<=z)best=i;const p=track.pts[best],q=track.pts[Math.min(best+1,track.pts.length-1)];
   const t=q[2]>p[2]?(z-p[2])/(q[2]-p[2]):0;return track.cum[best]+t*(track.cum[Math.min(best+1,track.pts.length-1)]-track.cum[best]);};
  const L={train,trainLen:tlen,aend,floorY:PY,side:SIDE,stops:{},zT:ZT,zG:ZG,track};
  const wait=z=>{const W=[];train.forEach(c=>{if(!(c.ride.cap.seats+c.ride.cap.stand>0))return;const mid=z+aend-c.off;(c.ride.doors||[]).forEach(D=>{if(D.side===1)W.push([LINE.trackX('t1',z)+SIDE+1.4,PY,mid+D.at[2]]);});});return W;};
  SIM.place({id:'lt.train',kind:'station',name:'Station 3\'s east platform (the segment\'s train)',x:18.9,y:PY,z:ZT,door:{x:18.9,y:PY,z:ZT},activities:{},settlement:LTS.S});
  SIM.place({id:'g2.train',kind:'station',name:'The G2 gap station\'s platform',x:14,y:PY,z:ZG,door:{x:14,y:PY,z:ZG},activities:{},settlement:LTS.J});
  L.stops.lt={place:'lt.train',side:1,gap:.1,wait:wait(ZT),z:ZT,name:'Loj Twenny (station 3)'};L.stops.g2={place:'g2.train',side:1,gap:.1,wait:wait(ZG),z:ZG,name:'the G2 gap station'};
  /* the timetable: a dwell at the hold (5 min), the run south (18 km at 15 m/s, eased), a dwell at the gap, the run back. o.at: a
     motion time the train should stand 30 s into its dwell at the hold (the page starts with it at the platform) */
  const sa=sOf(ZT)+aend,sb=sOf(ZG)+aend,run=Math.round(Math.abs(sb-sa)/SPEED*1.08),per=DWELL+DWELLG+2*run,ph=o.at==null?0:(((30-o.at)%per)+per)%per;
  L.timeline={period:per,phase:ph,segments:[{dur:DWELL,from:sa,name:'stop:lt:1'},{dur:run,from:sa,to:sb,ease:'smooth',name:'run'},
   {dur:DWELLG,from:sb,name:'stop:g2:1'},{dur:run,from:sb,to:sa,ease:'smooth',name:'run'}]};
  L.source=SIM.rideSource({id:'lt.train',kind:'train',track,timeline:L.timeline,stops:L.stops,stepSec:o.secPerMinute==null?3:o.secPerMinute,
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
