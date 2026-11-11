// ================================================================= CORE — simulation ride: people aboard moving vehicles
// [G data] core/simulation/PLAN-RIDING.md section 4. Opt-in: a page lists this fragment (after core/sched and every
// 77-sim-*.js) only when something rides, so no other page changes. It extends SIM: a RIDE SOURCE is one train (later a
// tram, a ship) whose cars move as a pure function of motion time; a task's leg may carry `frame: {source, k}`, its route
// then in that car's frame and its pose the car's pose applied to the point along it. Boarding, finding a seat, riding and
// alighting are all such legs, so riding adds one idea to the motion and none to the stepper.
//
//   SIM.rideSource({id, track:{pts:[[x,y,z]...], cum, len}, timeline, cars:[{k, off, b, cap:{seats, stand}, seats:[{id, at, yaw}],
//                   stand:[[x0,x1,z0,z1,y]...], doors:[{id, side, at}], sealed}], stops:{id:{place, side, gap, wait:[[x,y,z]...]}},
//                   doorLag:4, doorClose:6, stepSec:60})
//        timeline: a KSCHED.timeline record (period, phase, segments) of the train's fixed A END (the end facing +s) along its
//        track, s metres (biomes/line/PLAN.md section 8: Line trains shuttle and never turn round); a dwell is a segment that
//        holds (no `to`, or to === from) named 'stop:<stopId>:<side>' (its doors open on that side: +1, -1 or 0 for both) or
//        'stop:<stopId>' (the stop record's `side`). Car k's middle is at s(t) - off (off measured from the A end toward -s);
//        its bogies at +-b along the track; its frame's origin their midpoint, +z toward rising s, +x side +1, y up
//        (KTRANSIT.frame's axes). A stop's `gap` (0.10 m) is the platform edge's gap to the car side. A seat's `at`, a door's `at` and the
//        stand rects are in that frame. Every car must stay on the track over the whole timetable, and every dwell must outlast
//        `stepSec` motion seconds (a minute's step), so a step sees each stop (SIM.trade's carriers dock by looking)
//   SIM.rideHead(id, t) -> s            SIM.rideCarPose(id, k, t) -> {x, y, z, yaw, pitch, roll}
//   SIM.rideToWorld(pose, [x,y,z]) -> [x,y,z]    a point of a car's frame in the world
//   SIM.rideDwellAt(id, t) -> {g, stop, side, t0, t1, o0, o1, open} | null   the dwell standing now; [o0, o1] its door window
//   SIM.rideDwell(id, g) -> the same for the g-th dwell since the timetable's start (negative before it)
//   SIM.rideRuns(id, t0, t1) -> [{id, src, g, from, to, dep:[o0, o1], arr:[o0, o1]}]   every hop between two dwells departing
//        in [t0, t1]: the unit capacity is counted in
//   SIM.rideDoorOpen(id, k, doorId, t) -> bool
//   SIM.rideFromTransport(routeId, {car:{b, cap, seats, stand, doors}, stops:{id:{wait, side, gap}}, stepSec}) -> [sources]
//        a SIM.transport route (baked, not exclusive) as one ride source a vehicle, id '<route>#<k>': a ferry or a ship's deck
//        carries riders as a train's car does; its pose follows SIM.vehiclePose (the track is its legs joined)
//   SIM.vehiclePose(id, k, t)           answers a ride source's id too: car k's pose, h its yaw, `at` the stop's place through
//        a dwell (so SIM.trade({line: id}) carries goods on a train: PLAN-RIDING.md section 5)
//   SIM.rideFootpath({from, to, pts:[[x,y,z]...]})   a recorded walk between two stops (a gap's walk on the Line's record,
//        LN.gaps[i].walk): the planner and the journeys walk it, both ways, in place of the nav's route
//   SIM.journeyPlan(from:{x,y,z}, to:{x,y,z}, t, opt) -> {arrive, steps:[{kind:'walk'|'ride', ...}]} | null
//        a connection scan over every source's runs (earliest arrival; with fewer rides on a tie); its walks are the nav's
//        routes (opt.layer 'pedestrian', opt.speed), the walk between two stops (a gap) among them when under opt.maxWalk (2000 m)
//   SIM.rideBake(a, {to, from?, t?, act?, speed?, layer?, plan?}) -> task | null   the journey's legs alone (seats taken, crossings
//        logged), the actor untouched: the resolver's (81-sim-ride-choose.js)
//   SIM.journey(a, {to: place id | {x,y,z}, t?, act?, speed?, hold?}) -> task | null
//        plans and bakes the actor's legs: walk to the platform, wait, board inside the door window, walk to a seat (or a
//        standing place) in the car's frame, ride, walk to the door when the stop's window opens, alight, walk on (a gap is
//        an ordinary walk leg), ride again, walk to the end. The actor is `driven` (the stepper leaves it alone) until it
//        arrives (hold: still driven after: a world's own clock sends it on its next journey)
//   SIM.rideStep(minute, t)             the step hook (pushed on the first source): releases arrived riders, prunes old runs
//   SIM.rideOcc(runId)                  {cars:{k:{seats:{id: actor}, stand:[actor...]}}} on a run
//   SIM.RIDE.log                        [{kind:'board'|'alight', actor, src, k, door, t, o0, o1, g}]: t is when it crosses the door
//   SIM.rideExport() / SIM.rideExportMotion(opt)   the sources as data, and SIM.exportMotion with each leg's frame and the
//        sources (Godot: core/simulation/ride/kride.gd replays them)
(function(root){
  'use strict';
  var SIM = root.SIM;
  if(!SIM) throw new Error('core/simulation/ride: load every 77-sim-*.js first');
  var nz=function(v,d){ return v==null ? d : v; };
  SIM.RIDE = { sources:{}, order:[], occ:{}, log:[], foot:{}, riders:{}, LOG_MAX:20000, horizon:10800, maxWalk:2000,
               boardSec:20, alightSec:30, margin:1, jitter:0.1 };
  function route(pts){ var cum=[0], len=0; for(var i=1;i<pts.length;i++){ len+=Math.hypot(pts[i][0]-pts[i-1][0], pts[i][2]-pts[i-1][2]); cum.push(len); }
    return { pts:pts.map(function(p){ return [p[0], p[1], p[2]]; }), cum:cum, len:len }; }
  SIM.rideRoute = route;
  function h32(a, b){ var h=Math.imul((a|0)^0x9E3779B1, 0x85ebca6b) ^ Math.imul(b|0, 0xc2b2ae35); h^=h>>>15; h=Math.imul(h, 0x27d4eb2d); h^=h>>>13; return (h>>>0)/4294967296; }
  function md(x, n){ return ((x%n)+n)%n; }
  function ridesOf(j){ return j && j.rides ? j.rides : 0; }

  /* ---------------------------------------------------------------- sources */
  SIM.rideSource = function(o){
    var K=root.KSCHED; if(!K) throw new Error('SIM.rideSource: core/sched (KSCHED) must load first');
    if(!o || o.id==null) throw new Error('SIM.rideSource: an id');
    var id=String(o.id); if(SIM.RIDE.sources[id]) throw new Error('SIM.rideSource: duplicate id '+id);
    var T=o.track; if(!T || !T.pts || !T.cum || !(T.len>0)) throw new Error('SIM.rideSource '+id+': a track {pts, cum, len}');
    var tl=o.timeline; if(!tl || !tl.segments || !tl.segments.length) throw new Error('SIM.rideSource '+id+': a timeline');
    tl.segments.forEach(function(s){ if(typeof s.ease==='function') throw new Error('SIM.rideSource '+id+': a timeline ease must be a name (it is exported)'); });
    var TL=K.timeline(tl), segs=tl.segments, start=0, D=[], smin=1e300, smax=-1e300;
    segs.forEach(function(s, i){ var to=s.to===undefined ? s.from : s.to; smin=Math.min(smin, s.from, to); smax=Math.max(smax, s.from, to);
      var nm=s.name||''; if(nm.indexOf('stop:')===0){ if(to!==s.from) throw new Error('SIM.rideSource '+id+': dwell '+nm+' must hold (to === from)');
        var part=nm.slice(5).split(':'); D.push({ i:i, stop:part[0], nameSide:part.length>1 ? +part[1] : null, start:start, dur:s.dur, s:s.from }); }
      start+=s.dur; });
    if(!D.length) throw new Error('SIM.rideSource '+id+': no dwell (a segment named stop:<id>)');
    var stops=o.stops||{}, lag=nz(o.doorLag, 4), close=nz(o.doorClose, 6), step=nz(o.stepSec, 60);
    D.forEach(function(d){ var S=stops[d.stop]; if(!S) throw new Error('SIM.rideSource '+id+': dwell at unknown stop '+d.stop);
      if(d.dur<=step) throw new Error('SIM.rideSource '+id+': the dwell at '+d.stop+' ('+d.dur+' s) must outlast a step ('+step+' s)');
      if(d.dur-lag-close<10) throw new Error('SIM.rideSource '+id+': the door window at '+d.stop+' is under 10 s');
      d.side=d.nameSide!=null ? d.nameSide : nz(S.side, 0); });
    var cars=(o.cars||[]).map(function(c, k){ if(c.off==null || !(c.b>0)) throw new Error('SIM.rideSource '+id+': car '+k+' needs off and b');
      if(smin-c.off-c.b<0 || smax-c.off+c.b>T.len) throw new Error('SIM.rideSource '+id+': car '+k+' leaves the track');
      var cap=c.cap||{}; return { k:k, off:c.off, b:c.b, cap:{ seats:nz(cap.seats, (c.seats||[]).length), stand:nz(cap.stand, 0) }, seats:(c.seats||[]).slice(0, nz(cap.seats, (c.seats||[]).length)),
        stand:c.stand||[], doors:c.doors||[], sealed:!!c.sealed }; });
    if(!cars.length) throw new Error('SIM.rideSource '+id+': no cars');
    var S={ id:id, kind:o.kind||'train', track:T, timeline:TL.export(), TL:TL, period:TL.period, phase:nz(tl.phase, 0), dwells:D, cars:cars, stops:stops,
            doorLag:lag, doorClose:close, stepSec:step };
    SIM.RIDE.sources[id]=S; SIM.RIDE.order.push(id);
    if(SIM.stepHooks.indexOf(SIM.rideStep)<0) SIM.stepHooks.push(SIM.rideStep);
    return S;
  };
  function src(id){ var S=SIM.RIDE.sources[id]; if(!S) throw new Error('SIM.ride: unknown source '+id); return S; }
  SIM.rideHead = function(id, t){ return src(id).TL.at(t).value; };
  function carPose(S, k, t){
    var C=S.cars[k], s=S.TL.at(t).value-C.off, F=SIM.at(S.track, s+C.b), R=SIM.at(S.track, s-C.b);
    var dx=F.x-R.x, dz=F.z-R.z, dy=F.y-R.y, L=Math.hypot(dx, dz);
    if(L<0.25*C.b){ dx=F.tx; dz=F.tz; dy=0; L=1; }   /* the bogies on one spot (a track that turns back on itself: a ferry's far stop): the way ahead */
    return { x:(F.x+R.x)/2, y:(F.y+R.y)/2, z:(F.z+R.z)/2, yaw:Math.atan2(dx, dz), pitch:L>0 ? Math.atan2(dy, L) : 0, roll:0 };
  }
  SIM.rideCarPose = function(id, k, t){ return carPose(src(id), k, t); };
  /* a point of the car's frame in the world: pitch lifting +z, then yaw (+z to (sin yaw, cos yaw)); the roll is 0 */
  function toWorld(P, p){ var cp=Math.cos(P.pitch), sp=Math.sin(P.pitch), cy=Math.cos(P.yaw), sy=Math.sin(P.yaw);
    var y2=p[1]*cp+p[2]*sp, z2=-p[1]*sp+p[2]*cp, x2=p[0];
    return [P.x+x2*cy+z2*sy, P.y+y2, P.z-x2*sy+z2*cy]; }
  SIM.rideToWorld = toWorld;
  function dwell(S, g){ var n=S.dwells.length, c=Math.floor(g/n), j=md(g, n), d=S.dwells[j], t0=c*S.period-S.phase+d.start;
    return { g:g, j:j, stop:d.stop, side:d.side, s:d.s, t0:t0, t1:t0+d.dur, o0:t0+S.doorLag, o1:t0+d.dur-S.doorClose }; }
  SIM.rideDwell = function(id, g){ return dwell(src(id), g); };
  function firstG(S, t){ return (Math.floor((t+S.phase)/S.period)-1)*S.dwells.length; }
  SIM.rideDwellAt = function(id, t){ var S=src(id);
    for(var g=firstG(S, t);;g++){ var d=dwell(S, g); if(d.t0>t) return null; if(t<d.t1){ d.open=t>=d.o0 && t<=d.o1; return d; } } };
  SIM.rideRuns = function(id, t0, t1){ var S=src(id), out=[];
    for(var g=firstG(S, t0);;g++){ var a=dwell(S, g); if(a.o1>t1) break; if(a.o1<t0) continue; var b=dwell(S, g+1);
      out.push({ id:S.id+':'+g, src:S.id, g:g, from:a.stop, to:b.stop, dep:[a.o0, a.o1], arr:[b.o0, b.o1], sideA:a.side, sideB:b.side }); }
    return out; };
  function doorOn(side, dside){ return dside===0 || side===dside; }
  SIM.rideDoorOpen = function(id, k, doorId, t){ var S=src(id), d=SIM.rideDwellAt(id, t); if(!d || !d.open) return false;
    var D=S.cars[k].doors.filter(function(x){ return x.id===doorId; })[0]; return !!D && doorOn(D.side, d.side); };

  /* a SIM.transport route as ride sources, one a vehicle: its legs joined into one track (padded at both ends so the car's
     bogies stay on it), its segments into a KSCHED timeline of s along that track with the vehicle's phase; its stops'
     dwells are the door windows (both sides, a ferry's deck). Not an `exclusive` route (its day is laid out by events) */
  SIM.rideFromTransport = function(id, o){
    var R=SIM.R.transport[id]; if(!R || !R.period) throw new Error('SIM.rideFromTransport: bake '+id+' first (SIM.transportBake)');
    if(R.sched) throw new Error('SIM.rideFromTransport '+id+': an exclusive route (its day is laid out by events) is not supported');
    o=o||{}; var car=o.car||{}, b=nz(car.b, 0.25), pad=b+0.5, pts=[], first=[];
    R.legs.forEach(function(L){ var P=L.path.pts; first.push(pts.length ? pts.length-1 : 0);
      for(var j=0;j<P.length;j++){ if(j===0 && pts.length){ var q=pts[pts.length-1]; if(Math.abs(q[0]-P[0][0])<1e-9 && Math.abs(q[2]-P[0][2])<1e-9) continue; first[first.length-1]=pts.length; }
        pts.push([P[j][0], nz(P[j][1], 0), P[j][2]]); } });
    function along(a, c, d){ var dx=c[0]-a[0], dz=c[2]-a[2], l=Math.hypot(dx, dz)||1; return [a[0]+dx/l*d, a[1], a[2]+dz/l*d]; }
    pts.unshift(along(pts[0], pts[1], -pad)); pts.push(along(pts[pts.length-1], pts[pts.length-2], -pad));
    var track=route(pts), legS=first.map(function(i){ return track.cum[i+1]; });
    var legE=R.legs.map(function(L, i){ return i+1<legS.length ? legS[i+1] : track.len-pad; });
    var segs=[], li=-1, stops={};
    R.segments.forEach(function(g){
      if(g[2]===g[3]){ var nx=Math.min(R.legs.length-1, li+1), st=String(g[2]); segs.push({ dur:g[0], from:legS[nx], name:'stop:'+st });
        if(!stops[st]){ var Q=SIM.R.place[st], b0=Q ? (Q.pier || Q.door || Q) : null, own=(o.stops||{})[st]||{};
          stops[st]={ place:st, side:nz(own.side, 0), gap:nz(own.gap, 0.10), wait:own.wait || (b0 ? [[b0.x, nz(b0.y, nz(Q.y, 0)), b0.z]] : []) }; } }
      else { li++; segs.push({ dur:g[0], from:legS[li], to:legE[li], ease:'linear', name:'run' }); } });
    var out=[];
    for(var k=0;k<R.vehicles;k++) out.push(SIM.rideSource({ id:id+'#'+k, kind:o.kind||R.vehicleKind||'ferry', track:track, stops:stops, stepSec:o.stepSec,
      doorLag:o.doorLag, doorClose:o.doorClose, timeline:{ period:R.period, phase:nz(R.phase, 0)+k*R.period/R.vehicles, segments:segs },
      cars:[{ off:0, b:b, cap:car.cap, seats:car.seats, stand:car.stand, doors:car.doors, sealed:car.sealed }] }));
    return out;
  };

  /* SIM.vehiclePose answers a ride source's id (SIM.trade's line carriers read `at`) */
  var baseVP=SIM.vehiclePose;
  SIM.vehiclePose = function(id, k, t){
    var S=SIM.RIDE.sources[id]; if(!S) return baseVP ? baseVP(id, k, t) : null;
    var kk=Math.max(0, Math.min(S.cars.length-1, k|0)), P=carPose(S, kk, t), d=SIM.rideDwellAt(id, t), st=d ? S.stops[d.stop] : null;
    return { x:P.x, y:P.y, z:P.z, h:P.yaw, pitch:P.pitch, at:st ? (st.place==null ? d.stop : st.place) : null, seg:d ? d.g : -1, moving:!d, waiting:false, offMap:false };
  };

  /* ---------------------------------------------------------------- occupancy */
  function occ(runId){ return SIM.RIDE.occ[runId] || (SIM.RIDE.occ[runId]={ cars:{} }); }
  function carOcc(runId, k){ var O=occ(runId); return O.cars[k] || (O.cars[k]={ seats:{}, stand:[] }); }
  SIM.rideOcc = function(runId){ return SIM.RIDE.occ[runId] || { cars:{} }; };
  function room(S, g){ for(var k=0;k<S.cars.length;k++){ var C=S.cars[k], O=SIM.RIDE.occ[S.id+':'+g], c=O && O.cars[k];
      var used=c ? Object.keys(c.seats).length+c.stand.length : 0; if(used<C.cap.seats+C.cap.stand) return true; } return false; }
  /* a place for the actor over runs g0..g1-1: a seat free on all of them, else standing room; cars tried from a hashed start */
  function allot(S, g0, g1, a){
    var n=S.cars.length, k0=Math.floor(h32(a.k, 41)*n);
    for(var pass=0;pass<2;pass++) for(var q=0;q<n;q++){ var k=(k0+q)%n, C=S.cars[k];
      if(pass===0){ for(var si=0;si<C.seats.length;si++){ var sid=C.seats[si].id, free=true;
          for(var g=g0;g<g1;g++){ var c=SIM.RIDE.occ[S.id+':'+g]; if(c && c.cars[k] && c.cars[k].seats[sid]){ free=false; break; } }
          if(free) return { k:k, seat:C.seats[si] }; } }
      else { var ok=C.cap.stand>0; for(var g2=g0;g2<g1 && ok;g2++){ var c2=SIM.RIDE.occ[S.id+':'+g2]; if(c2 && c2.cars[k] && c2.cars[k].stand.length>=C.cap.stand) ok=false; }
        if(ok && C.stand.length){ var R=C.stand[Math.floor(h32(a.k, 43)*C.stand.length)], u=h32(a.k, 47), v=h32(a.k, 53);
          return { k:k, stand:[R[0]+(R[1]-R[0])*u, nz(R[4], C.doors.length ? C.doors[0].at[1] : 0), R[2]+(R[3]-R[2])*v] }; } } }
    return null;
  }

  /* ---------------------------------------------------------------- walking (the nav's routes, cached between fixed points) */
  function walkLeg(from, to, speed, layer){
    if(Math.hypot(to.x-from.x, to.z-from.z)<0.05) return { route:route([[from.x, nz(from.y, 0), from.z], [to.x, nz(to.y, 0), to.z]]), speed:speed, dur:0, mode:'walk', layer:layer };
    var L=SIM.leg(layer, from, to, speed, 'walk', 0); if(!L) return null;
    if(!L.route) SIM.legRoute(L);
    return L;
  }
  /* a recorded walk between two stops (a gap's walk on the Line's record), both ways */
  SIM.RIDE.paths = {};
  SIM.rideFootpath = function(o){
    if(!o || o.from==null || o.to==null || !o.pts || o.pts.length<2) throw new Error('SIM.rideFootpath: from, to and pts (two or more)');
    var R=route(o.pts), B=route(o.pts.slice().reverse()); SIM.RIDE.paths[o.from+'>'+o.to]=R; SIM.RIDE.paths[o.to+'>'+o.from]=B; SIM.RIDE.foot={}; return R;
  };
  function foot(sa, sb, opt){
    var key=sa+'>'+sb+'@'+opt.layer+'@'+opt.speed, F=SIM.RIDE.foot, Pth=SIM.RIDE.paths[sa+'>'+sb];
    if(F[key]!==undefined) return F[key];
    if(Pth){ F[key]={ dur:Pth.len/opt.speed, len:Pth.len, path:true }; return F[key]; }
    var A=stopPt(sa), B=stopPt(sb), L=null;
    if(A && B && Math.hypot(A.x-B.x, A.z-B.z)<=opt.maxWalk) L=walkLeg(A, B, opt.speed, opt.layer);
    F[key]=L ? { dur:L.dur, len:L.route.len } : null; return F[key];
  }
  /* a stop's platform point (its first waiting spot) */
  var STOPS=null;
  function stopIndex(){ if(STOPS) return STOPS; STOPS={}; SIM.RIDE.order.forEach(function(id){ var S=SIM.RIDE.sources[id];
      Object.keys(S.stops).forEach(function(s){ if(!STOPS[s]) STOPS[s]=S.stops[s]; }); }); return STOPS; }
  function stopPt(s){ var st=stopIndex()[s]; if(!st || !st.wait || !st.wait.length) return null; var w=st.wait[0]; return { x:w[0], y:w[1], z:w[2] }; }
  function waitSpot(s, a){ var st=stopIndex()[s], W=st.wait, w=W[Math.floor(h32(a.k, 61)*W.length)%W.length]; return { x:w[0], y:w[1], z:w[2] }; }

  /* ---------------------------------------------------------------- the planner: a connection scan */
  SIM.journeyPlan = function(from, to, t, opt){
    opt=opt||{}; STOPS=null; var layer=opt.layer||'pedestrian', speed=nz(opt.speed, SIM.SPEED.walk), maxWalk=nz(opt.maxWalk, SIM.RIDE.maxWalk), H=nz(opt.horizon, SIM.RIDE.horizon);
    var bs=nz(opt.boardSec, SIM.RIDE.boardSec), as=nz(opt.alightSec, SIM.RIDE.alightSec), fo={ layer:layer, speed:speed, maxWalk:maxWalk };
    var stops=Object.keys(stopIndex()).sort(), T={}, J={}, best=null;
    stops.forEach(function(s){ var P=stopPt(s); if(!P || Math.hypot(P.x-from.x, P.z-from.z)>maxWalk) return; var L=walkLeg(from, P, speed, layer); if(L){ T[s]=t+L.dur; J[s]={ kind:'start' }; } });
    var direct=Math.hypot(to.x-from.x, to.z-from.z)<=maxWalk ? walkLeg(from, to, speed, layer) : null;
    if(direct) best={ arrive:t+direct.dur, rides:0, via:null };
    var C=[]; SIM.RIDE.order.forEach(function(id){ if(opt.sources && opt.sources.indexOf(id)<0) return; SIM.rideRuns(id, t, t+H).forEach(function(r){ C.push(r); }); });
    C.sort(function(p, q){ return p.dep[1]-q.dep[1] || (p.id<q.id ? -1 : 1); });
    var inTrip={}, rides={};
    for(var ci=0;ci<C.length;ci++){ var c=C[ci], S=SIM.RIDE.sources[c.src];
      var can = inTrip[c.src] ? true : (T[c.from]!=null && T[c.from]+bs<=c.dep[1]);
      if(!can || !room(S, c.g)){ if(inTrip[c.src] && !room(S, c.g)) inTrip[c.src]=null; continue; }
      if(!inTrip[c.src]) inTrip[c.src]={ enter:c, rides:ridesOf(J[c.from])+1 };
      var tB=c.arr[0]+as, E=inTrip[c.src];
      if(T[c.to]==null || tB<T[c.to] || (tB===T[c.to] && E.rides<ridesOf(J[c.to]))){ T[c.to]=tB; J[c.to]={ kind:'ride', enter:E.enter, exit:c, rides:E.rides };
        stops.forEach(function(s2){ if(s2===c.to) return; var f=foot(c.to, s2, fo); if(!f) return; var t2=tB+f.dur;
          if(T[s2]==null || t2<T[s2]){ T[s2]=t2; J[s2]={ kind:'walk', from:c.to, rides:E.rides }; } }); } }
    stops.forEach(function(s){ if(T[s]==null || J[s].kind==='start') return; var P=stopPt(s); if(Math.hypot(P.x-to.x, P.z-to.z)>maxWalk) return;
      var L=walkLeg(P, to, speed, layer); if(!L) return; var arr=T[s]+L.dur;
      if(!best || arr<best.arrive-1e-9 || (Math.abs(arr-best.arrive)<1e-9 && J[s].rides<best.rides)) best={ arrive:arr, rides:J[s].rides, via:s }; });
    if(!best) return null;
    var steps=[], s=best.via, guard=0;
    while(s!=null && guard++<64){ var j=J[s]; if(j.kind==='start'){ break; }
      if(j.kind==='ride'){ steps.unshift({ kind:'ride', src:j.enter.src, from:j.enter.from, to:j.exit.to, g0:j.enter.g, g1:j.exit.g+1 }); s=j.enter.from; }
      else { steps.unshift({ kind:'walk', from:j.from, to:s }); s=j.from; } }
    return { arrive:best.arrive, rides:best.rides, steps:steps, first:steps.length ? steps[0].from : null, last:best.via };
  };

  /* ---------------------------------------------------------------- baking a journey */
  function frameLeg(S, k, pts, speed, face){ var R=route(pts); return { route:R, frame:{ source:S.id, k:k }, speed:speed, dur:R.len/speed, mode:'ride', layer:'ride', face:nz(face, 0) }; }
  function holdLeg(p, dur, mode, fr, face){ var R=route([p, p]); var L={ route:R, speed:1, dur:Math.max(0, dur), mode:mode, layer:fr ? 'ride' : 'wait', face:nz(face, 0) }; if(fr) L.frame=fr; return L; }
  function nearestDoor(C, side, local){ var best=null, bd=1e300; C.doors.forEach(function(D){ if(!doorOn(D.side, side)) return;
      var d=Math.abs(D.at[2]-local[2]); if(d<bd){ bd=d; best=D; } }); return best; }
  /* the legs of a journey from `from` (default: where the actor is) to a place's door or a point, its seats taken and its door
     crossings logged; the actor's own fields are the caller's (SIM.journey, the resolver: 81-sim-ride-choose.js) */
  SIM.rideBake = function(a, o){
    o=o||{}; var t=nz(o.t, SIM.time()), speed=nz(o.speed, a.speed||SIM.SPEED.walk), layer=o.layer||a.layer||'pedestrian';
    var here=o.from||SIM.pose(a, t), from={ x:here.x, y:nz(here.y, 0), z:here.z }, P=typeof o.to==='string' ? SIM.R.place[o.to] : null;
    var to=P ? (P.door ? { x:P.door.x, y:nz(P.door.y, 0), z:P.door.z } : { x:P.x, y:nz(P.y, 0), z:P.z }) : o.to;
    if(!to) throw new Error('SIM.journey '+a.id+': unknown destination');
    var plan=o.plan||SIM.journeyPlan(from, to, t, { layer:layer, speed:speed, sources:o.sources });
    if(!plan){ SIM.logEvent('nojourney', { actor:a.id, to:P ? P.id : null }); return null; }
    var legs=[], cur=from, tau=t, ok=true, boards=[], held=[];
    function push(L){ legs.push(L); tau+=L.dur; }
    function walkTo(p){ var L=walkLeg(cur, p, speed, layer); if(!L){ ok=false; return; } push(L); cur=p; }
    plan.steps.forEach(function(st){ if(!ok) return;
      if(st.kind==='walk'){ var Pth=SIM.RIDE.paths[st.from+'>'+st.to];
        if(!Pth){ walkTo(stopPt(st.to)); return; }
        var p0=Pth.pts[0], pn=Pth.pts[Pth.pts.length-1]; walkTo({ x:p0[0], y:p0[1], z:p0[2] }); if(!ok) return;
        push({ route:Pth, speed:speed, dur:Pth.len/speed, mode:'walk', layer:'gap' }); cur={ x:pn[0], y:pn[1], z:pn[2] }; return; }
      var S=SIM.RIDE.sources[st.src], A=dwell(S, st.g0), B=dwell(S, st.g1);
      var w0=waitSpot(st.from, a); walkTo(w0); if(!ok) return;
      var pl=allot(S, st.g0, st.g1, a); if(!pl){ ok=false; return; }
      var C=S.cars[pl.k], place=pl.seat ? pl.seat.at : pl.stand, face=pl.seat ? nz(pl.seat.yaw, 0) : h32(a.k, 67)*Math.PI*2;
      var dA=nearestDoor(C, A.side, place), dB=nearestDoor(C, B.side, place); if(!dA || !dB){ ok=false; return; }
      var PA=carPose(S, pl.k, A.t0+1), sideA=dA.side===0 ? 1 : dA.side;
      var gapA=nz(stopIndex()[st.from].gap, 0.10), gapB=nz(stopIndex()[st.to].gap, 0.10);
      var out=toWorld(PA, [dA.at[0]+sideA*(0.5+gapA), dA.at[1], dA.at[2]]), inn=toWorld(PA, [dA.at[0]-sideA*0.45, dA.at[1], dA.at[2]]);
      var bw=route([[w0.x, w0.y, w0.z], out, inn]), bdur=bw.len/speed, span=A.o1-A.o0-bdur-SIM.RIDE.margin;
      if(span<0 || tau>A.o1-bdur){ ok=false; return; }
      var start=Math.max(tau, A.o0+h32(a.k, A.g)*span);
      push(holdLeg([w0.x, w0.y, w0.z], start-tau, 'wait'));
      push({ route:bw, speed:speed, dur:bdur, mode:'walk', layer:'board' });
      boards.push({ kind:'board', actor:a.id, src:S.id, k:pl.k, door:dA.id, t:tau, o0:A.o0, o1:A.o1, g:A.g });
      var aisle=[0, dA.at[1], place[2]], doorIn=[dA.at[0]-sideA*0.45, dA.at[1], dA.at[2]];
      var fl=frameLeg(S, pl.k, [doorIn, [0, dA.at[1], dA.at[2]], aisle, place], speed, face); push(fl);
      var sideB=dB.side===0 ? 1 : dB.side, alight=B.o0+h32(a.k, B.g+7)*Math.max(0, (B.o1-B.o0)*SIM.RIDE.jitter);
      push(holdLeg(place, alight-tau, 'ride', { source:S.id, k:pl.k }, face));
      var dIn=[dB.at[0]-sideB*0.45, dB.at[1], dB.at[2]], fl2=frameLeg(S, pl.k, [place, [0, dB.at[1], place[2]], [0, dB.at[1], dB.at[2]], dIn], speed, face); push(fl2);
      var PB=carPose(S, pl.k, B.t0+1), w1=waitSpot(st.to, a), bo=route([toWorld(PB, dIn), toWorld(PB, [dB.at[0]+sideB*(0.5+gapB), dB.at[1], dB.at[2]]), [w1.x, w1.y, w1.z]]);
      boards.push({ kind:'alight', actor:a.id, src:S.id, k:pl.k, door:dB.id, t:tau, o0:B.o0, o1:B.o1, g:B.g });
      var bod=bo.len/speed; if(tau+bod>B.o1){ ok=false; return; }
      push({ route:bo, speed:speed, dur:bod, mode:'walk', layer:'board' }); cur=w1;
      held.push({ src:S.id, k:pl.k, g0:st.g0, g1:st.g1, seat:pl.seat ? pl.seat.id : null }); });
    if(ok) walkTo(to);
    if(!ok){ SIM.logEvent('nojourney', { actor:a.id, to:P ? P.id : null, why:'bake' }); return null; }
    held.forEach(function(h){ for(var g=h.g0;g<h.g1;g++){ var c=carOcc(h.src+':'+g, h.k); if(h.seat) c.seats[h.seat]=a.id; else c.stand.push(a.id); } });
    boards.forEach(function(b){ SIM.RIDE.log.push(b); }); if(SIM.RIDE.log.length>SIM.RIDE.LOG_MAX) SIM.RIDE.log.splice(0, SIM.RIDE.log.length-SIM.RIDE.LOG_MAX);
    var spot={ x:to.x, y:nz(to.y, 0), z:to.z }, task={ act:o.act||'TRAVEL', place:P ? P.id : null, t0:t, legs:legs, spot:spot, dur:tau-t, arrive:tau, indoor:false, wander:0,
      failed:false, ride:{ plan:plan, held:held } };
    SIM.logEvent('journey', { actor:a.id, to:task.place, rides:plan.rides, arrive:Math.round(tau) });
    return task;
  };
  SIM.journey = function(a, o){
    var task=SIM.rideBake(a, o); if(!task) return null;
    a.task=task; a.activity=task.act; a.driven='ride'; a.inVehicle=null; a.rideHold=!!(o && o.hold); a.wake=null;
    SIM.RIDE.riders[a.id]=true;
    return task;
  };

  /* ---------------------------------------------------------------- the pose: a frame leg through its car */
  var basePose=SIM.pose;
  SIM.pose = function(a, t, opt){
    var T=a.task; if(!T || !T.ride) return basePose(a, t, opt);
    var dt=t-T.t0;
    for(var i=0;i<T.legs.length;i++){ var L=T.legs[i];
      if(dt<L.dur){
        if(!L.frame) return basePose(a, t, opt);
        var S=SIM.RIDE.sources[L.frame.source], P=carPose(S, L.frame.k, t), s=Math.max(0, Math.min(dt*L.speed, L.route.len)), q=SIM.at(L.route, s);
        var w=toWorld(P, [q.x, q.y, q.z]), mv=L.route.len>0 && s>0 && s<L.route.len, cy=Math.cos(P.yaw), sy=Math.sin(P.yaw);
        var h=mv ? Math.atan2(q.tx*cy+q.tz*sy, -q.tx*sy+q.tz*cy) : P.yaw+nz(L.face, 0);
        return { x:w[0], y:w[1], z:w[2], h:h, moving:mv, hidden:!a.present || !!S.cars[L.frame.k].sealed, mode:'ride', act:a.activity, leg:i, frame:L.frame }; }
      dt-=L.dur; }
    return basePose(a, t, opt);
  };

  /* ---------------------------------------------------------------- the step hook */
  SIM.rideStep = function(minute, t){
    var R=SIM.RIDE; Object.keys(R.riders).forEach(function(id){ var a=SIM.R.actor[id]; if(!a){ delete R.riders[id]; return; }
      var T=a.task; if(!T || !T.ride){ delete R.riders[id]; return; }
      if(t>=T.arrive){ a.pos=SIM.pose(a, t); if(T.ride.resolver){ a.driven=false; a.wake=null; }   /* the resolver's: it takes up what it decided (wanted kept) */
        else if(!a.rideHold){ a.driven=false; a.wanted=null; a.wake=null; } delete R.riders[id]; SIM.logEvent('arrived', { actor:a.id, place:T.place }); } });
    if(minute%60===0) Object.keys(R.occ).forEach(function(rid){ var p=rid.lastIndexOf(':'), S=R.sources[rid.slice(0, p)]; if(!S) return;
      if(dwell(S, +rid.slice(p+1)+1).t1<t-3600) delete R.occ[rid]; });
  };

  /* ---------------------------------------------------------------- the audit: every door crossing inside its window
     (recomputed from the timetable now, not trusted from the log), no car over its seats and standing room on any run */
  SIM.rideAudit = function(opt){
    opt=opt||{}; var log=opt.log||SIM.RIDE.log, occT=opt.occ||SIM.RIDE.occ, out={ boards:0, alights:0, outside:[], over:[], ok:true };
    log.forEach(function(e){ var S=SIM.RIDE.sources[e.src]; if(!S){ out.outside.push(e); return; } var d=dwell(S, e.g);
      if(e.kind==='board') out.boards++; else out.alights++;
      var D=S.cars[e.k].doors.filter(function(x){ return x.id===e.door; })[0];
      if(!(e.t>=d.o0-1e-6 && e.t<=d.o1+1e-6) || !D || !doorOn(D.side, d.side)) out.outside.push(e); });
    Object.keys(occT).forEach(function(rid){ var p=rid.lastIndexOf(':'), S=SIM.RIDE.sources[rid.slice(0, p)]; if(!S) return;
      Object.keys(occT[rid].cars).forEach(function(k){ var c=occT[rid].cars[k], C=S.cars[k], seats=Object.keys(c.seats).length;
        if(seats>C.cap.seats || c.stand.length>C.cap.stand) out.over.push({ run:rid, k:+k, seats:seats, stand:c.stand.length, cap:C.cap }); }); });
    out.ok=!out.outside.length && !out.over.length; return out;
  };

  /* ---------------------------------------------------------------- the export */
  SIM.rideExport = function(){ return { format:'krator-ride', version:1, sources:SIM.RIDE.order.map(function(id){ var S=SIM.RIDE.sources[id];
      return { id:S.id, kind:S.kind, track:{ pts:S.track.pts.map(function(p){ return [p[0], p[1], p[2]]; }), cum:S.track.cum.slice(), len:S.track.len }, timeline:S.timeline,
        cars:S.cars.map(function(C){ return { k:C.k, off:C.off, b:C.b, cap:C.cap, sealed:C.sealed, doors:C.doors, seats:C.seats, stand:C.stand }; }),
        stops:S.stops, doorLag:S.doorLag, doorClose:S.doorClose }; }) }; };
  SIM.rideExportMotion = function(opt){
    var M=SIM.exportMotion(opt), A=(opt && opt.actors) || SIM.all('actor'), idx={};
    SIM.RIDE.order.forEach(function(id, i){ idx[id]=i; });
    M.actors.forEach(function(o, i){ var K=A[i].task; if(!o.task || !K) return;
      o.task.legs.forEach(function(L, j){ var Lk=K.legs[j]; L.frame = Lk.frame ? [idx[Lk.frame.source], Lk.frame.k] : null; L.face = nz(Lk.face, 0); }); o.task.ride=!!K.ride; });
    M.ride=SIM.rideExport(); return M;
  };
})(typeof window!=='undefined'?window:globalThis);
