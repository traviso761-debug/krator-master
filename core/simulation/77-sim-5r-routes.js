// ================================================================= CORE — simulation 5r: transport routes (ferries, striders)
// PLAN.md 4.3 (TransportRoute {id, layer, stops[place], period, phase, segments[[dur, ease, from, to]], capacity,
// faction, vehicle}) and ROADMAP Phase 2 ("Ferries and striders -> TransportRoute {stops, schedule, capacity, faction,
// vehicle}; passengers are temporary occupants of the route"). A route is DATA: its stops are places (a ferry stop, a
// strider station) or ports (a line that comes in from off the map, or leaves by an edge), each leg between two stops
// is routed on the route's navigation layer (SIM.nav.route: a host's water or strider grid answers it), and every
// vehicle's position is a pure function of motion time, as SIM.pose is: no state, nothing integrated.
//
//   SIM.transport({id, layer, stops:[place id | 'port:<id>'], vehicle, vehicles?, headway?, speed?, dwell?, phase?,
//                  capacity?, faction?, org?, exclusive?, queueGap?, horizon?})   a route; first stop === last makes a loop.
//        exclusive: `berths` vehicles at a time at a stop (default 1; a ferry pier has 2, one each side, berthSide m
//        either side of the stop); a vehicle that finds them taken stops queueGap metres back
//        along its way in (twice that behind a second), waits, then comes up. Each vehicle's day is then laid out once
//        (an event list over `horizon` seconds, then it repeats), so its pose is still a pure function of time
//   SIM.transportBake(id) -> route                    routes each leg, lays out the round:
//        route.legs     [{from, to, path:{pts,cum,len}, failed}]   (an open line runs out and back: the back legs too)
//        route.segments [[dur, ease, from, to], ...]   a dwell is a segment whose from === to (PLAN.md's shape)
//        route.period   seconds for one round; vehicles are spaced period / vehicles apart
//   SIM.vehiclePose(id, k, t) -> {x, y, z, h, at, seg, moving, waiting, offMap}    vehicle k (0..vehicles-1) at motion
//        time t; at: the stop it is standing at, or null; waiting: queued for a berth; offMap: past a port (hidden)
//   SIM.stopsServing(stopId) -> [route ids]           the routes that call at a place or port
//   SIM.transportQueue([ids]) -> n                     exclusive routes that share stops share their berths: their days
//                                                       are laid out together (call after baking each)
// A stop's point: the place's pier (where boats board; {x, z, dx?, dz?}, dx/dz the way the pier runs), else its door,
// else its x/z; a port's x/z.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.TRANSPORT = { speed:{ ferry:4.0, strider:3.2 }, dwell:{ ferry:45, strider:60 }, headway:240, queueGap:50, horizon:172800, berthClear:5 };
  SIM.transport = function(o){
    if(!o.layer) throw new Error('SIM.transport '+o.id+': a layer');
    if(!o.stops || o.stops.length < 2) throw new Error('SIM.transport '+o.id+': at least two stops');
    o.stops = o.stops.map(String);
    return SIM.add('transport', o);
  };
  function stopPoint(id){
    if(id.indexOf('port:')===0){ var P=SIM.R.port[id.slice(5)]; return P ? { x:P.x, z:P.z, y:P.y||0, port:true } : null; }
    var Q=SIM.R.place[id]; if(!Q) return null;
    var b = Q.pier || Q.door || Q; return { x:b.x, z:b.z, y:b.y||Q.y||0, port:false, dx:b.dx, dz:b.dz };
  }
  function straight(a, b){ var L=Math.hypot(b.x-a.x, b.z-a.z); return { pts:[[a.x,a.y||0,a.z],[b.x,b.y||0,b.z]], cum:[0,L], len:L }; }
  function reverse(p){ var P=p.pts.slice().reverse(), cum=[0]; for(var i=1;i<P.length;i++) cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0], P[i][2]-P[i-1][2])); return { pts:P, cum:cum, len:cum[cum.length-1] }; }
  SIM.transportBake = function(id){
    var R = SIM.R.transport[id]; if(!R) throw new Error('SIM.transportBake: unknown route '+id);
    var kind = R.vehicleKind || (R.layer==='water' ? 'ferry' : 'strider');
    var spd = R.speed || SIM.TRANSPORT.speed[kind] || 3, dwell = R.dwell==null ? (SIM.TRANSPORT.dwell[kind] || 30) : R.dwell;
    var S = R.stops, loop = S[0]===S[S.length-1], out = [];
    for(var i=1;i<S.length;i++){
      var a=stopPoint(S[i-1]), b=stopPoint(S[i]);
      if(!a || !b){ SIM.err('transport '+id+': unknown stop '+(!a?S[i-1]:S[i])); continue; }
      var p = SIM.nav.route(R.layer, a, b), failed = !p;
      out.push({ from:S[i-1], to:S[i], path:p || straight(a, b), failed:failed });
      if(failed) SIM.logEvent('transportFail', { route:id, from:S[i-1], to:S[i] });
    }
    if(!loop){ for(var j=out.length-1;j>=0;j--) out.push({ from:out[j].to, to:out[j].from, path:reverse(out[j].path), failed:out[j].failed, back:true }); }
    var seg = [], T = 0;
    out.forEach(function(L){
      var dw = L.from.indexOf('port:')===0 ? 0 : dwell;
      if(dw){ seg.push([dw, 'hold', L.from, L.from]); T += dw; }
      var d = L.path.len / spd; L.t0 = T; L.dur = d;
      seg.push([d, 'linear', L.from, L.to]); T += d;
    });
    R.legs = out; R.segments = seg; R.period = T; R.loop = loop; R.spd = spd;
    R.vehicles = R.vehicles || Math.max(1, Math.round(T / (R.headway || SIM.TRANSPORT.headway)));
    R.phase = R.phase || 0;
    R.sched = null; if(R.exclusive) bakeQueues([R]);
    return R;
  };
  /* a berth holds `berths` vehicles at a time: every vehicle's movements over the horizon, as events [t0, t1, kind,
     leg, s0, s1, stop, slot] (kind 0 travel along legs[leg] from s0 to s1 metres, 1 standing at stop in a berth slot, 2
     waiting on legs[leg] at s0), found by running all the given routes' timetables forward together in time order,
     first come first served at each stop, so lines that share a stop share its berths */
  function bakeQueues(Rs){
    var berth = {}, next = [], clear = SIM.TRANSPORT.berthClear, H = 0;
    Rs.forEach(function(R, r){
      var n = R.vehicles, P = R.period;
      /* the round as steps: stand at a leg's first stop (dw seconds, none at a port), then travel the leg */
      var steps = R.legs.map(function(L, i){ return { stop:L.from, leg:i, dur:L.dur, len:L.path.len, end:L.t0 + L.dur }; });
      steps.forEach(function(st, i){ st.start = i ? steps[i-1].end : 0; st.dw = R.legs[i].t0 - st.start; });
      R._steps = steps; R.sched = []; H = Math.max(H, R.horizon || SIM.TRANSPORT.horizon);
      var m = steps.length;
      for(var k=0;k<n;k++){
        R.sched.push([]);
        var tau = ((k * P / n + R.phase) % P + P) % P, i = 0;
        while(i < m - 1 && tau >= steps[i].end) i++;
        var st = steps[i];
        if(tau < st.start + st.dw){ next.push({ r:r, k:k, t:st.start - tau, i:i }); }
        else { var s0 = (tau - st.start - st.dw) * R.spd, tEnd = st.end - tau; R.sched[k].push([0, tEnd, 0, i, s0, st.len, null]); next.push({ r:r, k:k, t:tEnd, i:(i + 1) % m }); }
      }
    });
    for(var guard = 0; guard < 5000000; guard++){
      var bi = -1; for(var q=0;q<next.length;q++) if(next[q] && (bi < 0 || next[q].t < next[bi].t)) bi = q;
      if(bi < 0) break;
      var a = next[bi], R = Rs[a.r], E = R.sched[a.k], steps = R._steps, m = steps.length, sp = steps[a.i], t = a.t;
      if(t >= H){ next[bi] = null; continue; }
      var start = t, slots = R.berths || 1, gap = R.queueGap || SIM.TRANSPORT.queueGap;
      if(sp.dw > 0){
        var b = berth[sp.stop] || (berth[sp.stop] = { free:[], starts:[] });
        for(var sl=0; sl<slots; sl++) if(b.free[sl] == null) b.free[sl] = -Infinity;
        var slot = 0; for(var s2=1; s2<slots; s2++) if(b.free[s2] < b.free[slot]) slot = s2;
        start = Math.max(t, b.free[slot]);
        if(start > t + 1e-6){
          /* the berths are taken: stop short, behind whoever is already waiting, then come up when one is free */
          var ahead = b.starts.filter(function(x){ return x > t; }).length, g = gap * (ahead + 1), last = E[E.length - 1], prev = (a.i - 1 + m) % m;
          if(last && last[2] === 0 && last[3] === prev && last[5] - last[4] > g){
            var sQ = last[5] - g, tQ = last[0] + (sQ - last[4]) / R.spd;
            last[1] = tQ; last[5] = sQ;
            E.push([tQ, start - g / R.spd, 2, prev, sQ, sQ, null]);
            E.push([start - g / R.spd, start, 0, prev, sQ, sQ + g, null]);
          } else E.push([t, start, 2, prev, last ? last[5] : 0, last ? last[5] : 0, null]);
        }
        b.free[slot] = start + sp.dw + clear; b.starts.push(start);
        E.push([start, start + sp.dw, 1, a.i, 0, 0, sp.stop, slot]);
      }
      var t1 = start + sp.dw;
      E.push([t1, t1 + sp.dur, 0, a.i, 0, sp.len, null]);
      next[bi] = { r:a.r, k:a.k, t:t1 + sp.dur, i:(a.i + 1) % m };
    }
    Rs.forEach(function(R){ R.horizonS = H; delete R._steps; });
  }
  /* routes that share stops share their berths: lay their days out together (after transportBake of each) */
  SIM.transportQueue = function(ids){
    var Rs = (ids || SIM.order.transport).map(function(id){ return SIM.R.transport[id]; }).filter(function(R){ return R && R.period && R.exclusive; });
    if(Rs.length) bakeQueues(Rs);
    return Rs.length;
  };
  function poseOn(R, li, s, moving, waiting){
    var leg = R.legs[li], q = SIM.at(leg.path, Math.max(0, Math.min(s, leg.path.len)));
    var off = (leg.from.indexOf('port:')===0 && s < 60) || (leg.to.indexOf('port:')===0 && leg.path.len - s < 60);
    return { x:q.x, y:q.y, z:q.z, h:Math.atan2(q.tx, q.tz), at:null, seg:li, moving:moving, waiting:waiting, offMap:off };
  }
  function schedPose(R, k, t){
    var E = R.sched[k]; if(!E || !E.length) return null;
    var tt = ((t % R.horizonS) + R.horizonS) % R.horizonS, lo = 0, hi = E.length - 1;
    while(lo < hi){ var md = (lo + hi + 1) >> 1; if(E[md][0] <= tt) lo = md; else hi = md - 1; }
    var e = E[lo];
    if(e[2] === 1){
      /* berth `slot`: with two (a pier's two sides) the second lies across the stop from the first, berthSide metres out */
      var p = stopPoint(e[6]), L = R.legs[e[3]], q = SIM.at(L.path, 0), side = (R.berths || 1) > 1 ? (e[7] ? 1 : -1) * (R.berthSide || 0) : 0;
      /* a pier that says which way it runs (pier.dx, dz): the vehicle lies alongside it, parallel to it */
      var ax = p.dx != null ? [p.dx, p.dz] : [q.tx, q.tz];
      return { x:p.x - ax[1] * side, y:p.y, z:p.z + ax[0] * side, h:Math.atan2(ax[0], ax[1]), at:e[6], seg:e[3], slot:e[7], moving:false, waiting:false, offMap:!!p.port }; }
    if(e[2] === 2) return poseOn(R, e[3], e[4], false, true);
    var u = e[1] > e[0] ? Math.min(1, Math.max(0, (tt - e[0]) / (e[1] - e[0]))) : 1;
    return poseOn(R, e[3], e[4] + (e[5] - e[4]) * u, true, false);
  }
  SIM.vehiclePose = function(id, k, t){
    var R = SIM.R.transport[id]; if(!R || !R.period) return null;
    if(R.sched) return schedPose(R, k, t);
    var tt = ((t + R.phase + k * R.period / R.vehicles) % R.period + R.period) % R.period, li = -1;
    for(var i=0, T=0; i<R.segments.length; i++){
      var g = R.segments[i];
      if(tt < T + g[0]){
        if(g[2]===g[3]){ var p=stopPoint(g[2]), L=R.legs[Math.min(R.legs.length-1, li+1)], q=SIM.at(L.path, 0);
          return { x:p.x, y:p.y, z:p.z, h:Math.atan2(q.tx, q.tz), at:g[2], seg:i, moving:false, offMap:!!p.port }; }
        li++; var leg = R.legs[li], s = (tt - T) * R.spd, q2 = SIM.at(leg.path, Math.min(s, leg.path.len));
        var off = (leg.from.indexOf('port:')===0 && s < 60) || (leg.to.indexOf('port:')===0 && leg.path.len - s < 60);
        return { x:q2.x, y:q2.y, z:q2.z, h:Math.atan2(q2.tx, q2.tz), at:null, seg:i, moving:true, offMap:off };
      }
      T += g[0]; if(g[2]!==g[3]) li++;
    }
    return null;
  };
  SIM.stopsServing = function(stop){ return SIM.all('transport').filter(function(R){ return R.stops.indexOf(stop) >= 0; }).map(function(R){ return R.id; }); };
})(typeof window!=='undefined'?window:globalThis);
