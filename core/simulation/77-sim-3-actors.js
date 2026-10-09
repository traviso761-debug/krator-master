// ================================================================= CORE — simulation 3: roles, actors, groups, events, the resolver
// PLAN.md 4.4 and 4.5. Every actor has a faction, an org, a role and a schedule (sched[24] of activities). Once per
// SIMULATED MINUTE, SIM.step() asks each actor what its schedule (or its event's itinerary) wants now; when that changes
// it RESOLVES a place (its pinned home or work place, the place it used for this activity last, else the nearest place
// of the role's preferred kinds with a free slot, else any place offering it), reserves a slot, and bakes the MOTION to
// get there: a list of legs, each a route on one navigation layer at one speed and mode (walk, ride, drive, boat). Pose
// is then a pure function of time (77-sim-5-motion.js). Decisions draw only from SIM.rng; the order is the actor order.
//
//   SIM.role({id, org, name, sched, prefers?:{ACT:{pin?:'home'|'work', kinds?:[..], ids?:[..], via?:'boat'|'buggy'}},
//             speed?, layer?, mode?, fallback?:{ACT:ACT}})
//   SIM.actor({id, role, org?, faction?, home, work?, sched?, transient?, group?, boat?:{dock}, speed?})
//   SIM.group({id, kind, org, members:[actor ids], beasts?, mount?, vehicle?})
//   SIM.event({id, kind, org, every:[minH,maxH] (world hours between firings), window?:[h0,h1], from:[ports], to:[ports]|'other',
//              spread?: metres either side of the leader its members walk in pairs (1.6, a caravan 1.1); 0: single file, 1.4 m apart
//              size:[a,b] (units), unit:[{role, n}], arrive:{kinds:[..]}, stay:{untilHour, nights}, layer, mode, speed, beasts?, mount?,
//              legs?:[{activity, mins, kinds?}] (an itinerary instead of arrive and stay: stop to stop together, then out)})
//   SIM.port({id, x, z, layer, kind, y?, node?})        a map-edge entry (y and node: where it stands in a world of levels,
//                                                       an entry inside it: a group starts there and its route ends on that node)
//   SIM.step()                                          one simulated minute (the host calls it as the world minute advances)
//   SIM.jump()                                          the clock jumped: everyone is re-placed from the schedule (a share mid-trip)
//   SIM.desire(actor) -> activity now                   SIM.decide(actor) -> the place it chose (or null)
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.STEP_MAX = 260;           /* decisions per simulated minute; the rest wait a minute (rotating start) */
  SIM.FALLBACK = ['SOCIALIZE','REST','IDLE'];
  SIM.SPEED = { walk:1.3, ride:3.6, drive:9.5, boat:2.4, cart:1.3 };
  SIM.role = function(o){ if(o.sched) o.sched=SIM.sched(o.sched); o.prefers=o.prefers||{}; return SIM.add('role', o); };
  SIM.port = function(o){ o.layer=o.layer||'pedestrian'; return SIM.add('port', o); };
  SIM.group = function(o){ o.members=o.members||[]; return SIM.add('group', o); };
  SIM.event = function(o){ o.fired=0; o.next=null; return SIM.add('event', o); };
  SIM.actor = function(o){
    var R=SIM.R.role[o.role]; if(!R) throw new Error('SIM.actor '+o.id+': unknown role '+o.role);
    o.org = o.org || R.org; var O=SIM.R.org[o.org]; o.faction = o.faction || (O && O.faction);
    if(o.sched) o.sched=SIM.sched(o.sched);
    o.present = o.present!==false; o.activity=null; o.place=null; o.task=null; o.slot=null; o.mem={}; o.plan=null;
    o.speed = o.speed || R.speed || SIM.SPEED.walk;
    o.k = SIM.order.actor.length;
    return SIM.add('actor', o);
  };
  function schedOf(a){ return a.sched || SIM.R.role[a.role].sched; }
  function hourOf(m){ return Math.floor((m%1440)/60); }

  /* ---------------------------------------------------------------- what the actor wants now */
  SIM.desire = function(a, minute){
    if(a.plan){ var L=a.plan[a.planI]; if(L && L.activity) return L.activity; }
    var s=schedOf(a); return s ? s[hourOf(minute==null?SIM.minute():minute)] : 'IDLE';
  };
  function placeXZ(P){ return [P.x, P.z]; }
  function anchor(a){ var H=SIM.R.place[a.home]; return H ? placeXZ(H) : (a.at || [0,0]); }
  /* the place for an activity: pinned, remembered, preferred kinds, anything; then the role's fallback */
  function choose(a, act, hour){
    var R=SIM.R.role[a.role], pref=(R.prefers&&R.prefers[act])||{}, near=anchor(a), P;
    if(pref.pin==='home' && a.home){ P=SIM.R.place[a.home]; if(P && SIM.offers(P,act)) return P; }
    if(pref.pin==='work' && a.work){ P=SIM.R.place[a.work]; if(P && SIM.offers(P,act)) return P; }
    if(a.plan && a.plan[a.planI] && a.plan[a.planI].place){ P=SIM.R.place[a.plan[a.planI].place]; if(P) return P; }
    var m=a.mem[act]; if(m){ P=SIM.R.place[m]; if(P && SIM.isOpen(P,act,hour) && (SIM.free(P,act)>0 || P.who[a.id]===act)) return P; }
    var c = SIM.placesFor(act, a, hour, { near:near, kinds:pref.kinds, ids:pref.ids, exclude:a.bad });
    if(c.length){ /* the nearest few, one picked from SIM.rng so a crowd spreads over a district's taverns and shops */
      var k=Math.min(c.length, pref.spread||3); return c[Math.floor(SIM.rng.next()*k)]; }
    return null;
  }
  SIM.choose = choose;

  /* ---------------------------------------------------------------- the decision */
  SIM.decide = function(a, minute, t){
    minute = minute==null ? SIM.minute() : minute; t = t==null ? SIM.time() : t;
    var hour=hourOf(minute), want=SIM.desire(a, minute), R=SIM.R.role[a.role];
    var chain=[want].concat((R.fallback&&R.fallback[want]) ? [R.fallback[want]] : []).concat(SIM.FALLBACK);
    var from=SIM.pose(a, t), P=null, act=want, task=null;
    a.bad = a.bad || {};
    for(var i=0; i<chain.length && !task; i++){ act=chain[i];
      /* a place the actor cannot reach is struck off for it and the next one tried (three at most per activity) */
      for(var tries=0; tries<3; tries++){
        P=choose(a, act, hour);
        if(!P && (act==='REST'||act==='IDLE') && a.home) P=SIM.R.place[a.home];
        if(!P) break;
        if(a.place===P.id && a.task && !a.task.failed){ if(!a.slot || a.slot.act!==act || a.slot.place!==P.id) SIM.reserve(a, P, act); task=a.task; task.act=act; task.indoor=SIM.indoor(P, act); break; }
        SIM.reserve(a, P, act);
        var T=SIM.plan(a, P, act, from, t);
        if(!T.failed){ task=T; break; }
        SIM.release(a); a.bad[P.id]=1; a.mem[act]=null; P=null; } }
    a.wanted = want;
    if(!task){ a.activity=act; a.task=a.task||null; SIM.logEvent('stuck', { actor:a.id, wanted:want }); return null; }
    a.mem[act]=P.id; a.activity=act; a.place=P.id; a.task=task; a.since=minute;
    SIM.logEvent('decide', { actor:a.id, act:act, place:P.id });
    return P;
  };

  /* ---------------------------------------------------------------- the motion, baked at decision time */
  function spotOf(a, P){
    var k = (a.slot && a.slot.k) || 0;
    if(P.spots && P.spots.length){ var s=P.spots[k % P.spots.length]; return { x:s[0], z:s[1], y:s[2]==null?P.y:s[2] }; }
    var r = P.r || 0; if(!r) return { x:P.door.x, z:P.door.z, y:P.door.y };
    var u=((a.k*2654435761)>>>0)/4294967296, v=((a.k*40503+k*977)>>>0)%1000/1000, ang=u*Math.PI*2, rr=r*Math.sqrt(0.15+0.85*v);
    return { x:P.x+Math.cos(ang)*rr, z:P.z+Math.sin(ang)*rr, y:P.y };
  }
  function leg(layer, from, to, speed, mode, minW){
    var r=SIM.nav.route(layer, from, to, { minW:minW||0 }); if(!r) return null;
    return { route:r, speed:speed, mode:mode, layer:layer, dur:r.len/speed };
  }
  /* the legs to a place: walk (or ride / drive) on the actor's layer; a place on another layer is reached through a
     boarding place (a fisher's dock, the buggy park): walk there, then go on in the boat or the buggy */
  SIM.plan = function(a, P, act, from, t){
    var legs=[], R=SIM.R.role[a.role], pref=(R.prefers&&R.prefers[act])||{}, mode=a.mode||R.mode||'walk', layer=a.layer||R.layer||'pedestrian';
    var spot=spotOf(a, P), cur=from, inVeh = a.inVehicle;           /* a.inVehicle: 'boat' | 'buggy' while out on the water / the road */
    var via = pref.via || P.via;
    if(via && !inVeh){ var B=SIM.R.place[via==='boat' ? (a.boat&&a.boat.dock) : (a.vehicle&&a.vehicle.base)];
      if(B){ var l1=leg(layer, cur, B.door, a.speed, mode, 0); if(l1){ legs.push(l1); cur=B.door; }
        var vm = via==='boat'?'boat':'drive', vl = via==='boat'?'water':'road', vs = SIM.SPEED[vm==='boat'?'boat':'drive'];
        var board = via==='boat' && a.boat && a.boat.pier ? a.boat.pier : B.door;
        var l2=leg(vl, board, P.layer===vl?spot:P.door, vs, vm, vm==='drive'?5:0); if(l2){ legs.push(l2); } a.inVehicle = vm==='boat'?'boat':'buggy'; } }
    else if(inVeh && P.layer!==(inVeh==='boat'?'water':'road')){                   /* back from the water / the road: to the base, then walk */
      var base=SIM.R.place[inVeh==='boat' ? (a.boat&&a.boat.dock) : (a.vehicle&&a.vehicle.base)], vl2=inVeh==='boat'?'water':'road';
      if(base){ var land = inVeh==='boat' && a.boat && a.boat.pier ? a.boat.pier : base.door;
        var l3=leg(vl2, cur, land, SIM.SPEED[inVeh==='boat'?'boat':'drive'], inVeh==='boat'?'boat':'drive', inVeh==='boat'?0:5); if(l3){ legs.push(l3); cur=base.door; } }
      a.inVehicle = null;
      var l4=leg(layer, cur, spot, a.speed, mode, 0); if(l4) legs.push(l4); }
    else {
      var lay = inVeh ? (inVeh==='boat'?'water':'road') : (P.layer && P.layer!=='pedestrian' && SIM.nav.layers[P.layer] && layer!=='animal' ? P.layer : layer);
      var l5=leg(lay, cur, spot, inVeh?SIM.SPEED[inVeh==='boat'?'boat':'drive']:a.speed, inVeh?(inVeh==='boat'?'boat':'drive'):mode, a.minW||0); if(l5) legs.push(l5); }
    var T={ act:act, place:P.id, t0:t, legs:legs, spot:spot, dur:0, indoor:SIM.indoor(P, act), wander:P.wander||0, failed:!legs.length && Math.hypot(cur.x-spot.x,cur.z-spot.z)>3 };
    legs.forEach(function(L){ T.dur+=L.dur; }); T.arrive=t+T.dur;
    if(T.failed) SIM.logEvent('nopath', { actor:a.id, place:P.id });
    return T;
  };

  /* ---------------------------------------------------------------- events: caravans, riders, excursions */
  function nextFiring(E, minute){ var e=E.every||[6,12]; return minute + Math.round(SIM.rng.range(e[0], e[1])*60); }
  function pickPort(list, not){ var L=(list||[]).filter(function(p){ return p!==not && SIM.R.port[p]; }); return L.length ? L[Math.floor(SIM.rng.next()*L.length)] : null; }
  SIM.fire = function(E, minute, t){
    var from=pickPort(E.from), to = E.to==='other' || !E.to ? pickPort(E.from, from) || from : pickPort(E.to, from);
    if(!from){ SIM.err('event '+E.id+': no port'); return null; }
    if(E.kind==='excursion') return excursion(E, minute, t, from);
    var P0=SIM.R.port[from], units=SIM.rng.int(E.size?E.size[0]:1, E.size?E.size[1]:1), gid=E.id+'#'+(++E.fired), members=[];
    var G=SIM.group({ id:gid, kind:E.kind, org:E.org, event:E.id, spread:E.spread, members:members, beasts:E.beasts?units*(E.beasts||1):0, mount:E.mount||null, from:from, to:to, units:units, mode:E.mode||'walk', layer:E.layer||'pedestrian', speed:E.speed||SIM.SPEED.walk });
    for(var u=0;u<units;u++) (E.unit||[]).forEach(function(U){ for(var n=0;n<U.n;n++){
      var id=gid+'.'+members.length, a=SIM.actor({ id:id, role:U.role, org:E.org, transient:true, group:gid, home:null });
      a.at=[P0.x, P0.z]; a.pos={ x:P0.x, y:P0.y||0, z:P0.z }; a.inVehicle=null; members.push(id); } });
    if(!members.length){ SIM.err('event '+E.id+': its unit makes no one (unit:[{role, n}])'); SIM.remove('group', gid); return null; }
    if(E.legs && E.legs.length) return itinerary(E, G, members, P0, to, minute, t);
    /* the itinerary: arrive together, stay to the depart hour (the members' own schedules meanwhile), leave together */
    var stayUntil = minute - (minute%1440) + 1440*(E.stay&&E.stay.nights!=null?E.stay.nights:1) + 60*((E.stay&&E.stay.untilHour)||7);
    G.plan = { arriveKinds:(E.arrive&&E.arrive.kinds)||[], stayUntil:stayUntil, phase:'arrive' };
    var dest = SIM.placesFor(E.arrive && E.arrive.activity || 'STABLE', null, null, { near:[P0.x,P0.z], kinds:G.plan.arriveKinds, ignoreSlots:true })[0];
    members.forEach(function(id, i){ var a=SIM.R.actor[id];
      a.plan=[{ activity:(E.arrive&&E.arrive.activity)||'STABLE', place:dest&&dest.id, together:true },{ stay:true, until:stayUntil },{ activity:'DEPART', port:to, together:true }];
      a.planI=0; a.fi=i; });
    G.leader = members[0]; G.dest = dest && dest.id;
    SIM.logEvent('event', { event:E.id, group:gid, from:from, to:to, units:units, people:members.length, dest:G.dest });
    groupLeg(G, minute, t);
    return G;
  };
  /* an event with `legs` ([{activity, mins, kinds?}]): the group goes together from stop to stop, each the nearest place
     offering the leg's activity to the stop before (the first from the port), stays `mins` world minutes there doing
     it, and leaves by its port after the last (Shade's convoy: water, trade, rest, out by the switchback) */
  function itinerary(E, G, members, P0, to, minute, t){
    var at=[P0.x, P0.z], plan=[];
    E.legs.forEach(function(L){ var P=SIM.placesFor(L.activity, null, null, { near:at, kinds:L.kinds, ignoreSlots:true })[0];
      if(!P){ SIM.err('event '+E.id+': no place offers '+L.activity); return; }
      plan.push({ activity:L.activity, place:P.id, together:true, mins:L.mins||0 }); at=[P.x, P.z]; });
    plan.push({ activity:'DEPART', port:to, together:true });
    G.plan = { legs:true, phase:'arrive' };
    members.forEach(function(id, i){ var a=SIM.R.actor[id]; a.plan=plan.map(function(L){ var o={}; for(var k in L) o[k]=L[k]; return o; }); a.planI=0; a.fi=i; });
    G.leader = members[0]; G.dest = plan[0].place || null;
    SIM.logEvent('event', { event:E.id, group:G.id, from:G.from, to:to, units:G.units, people:members.length, legs:plan.length-1 });
    groupLeg(G, minute, t);
    return G;
  }
  /* a group's TOGETHER leg: the leader's route, the others behind and beside it (KSCHED.formation's offsets) */
  function groupLeg(G, minute, t){
    var lead=SIM.R.actor[G.leader], L=lead.plan[lead.planI], P;
    if(L.port){ var Pt=SIM.R.port[L.port]; P={ id:'port:'+L.port, x:Pt.x, z:Pt.z, y:Pt.y||0, door:{ x:Pt.x, z:Pt.z, y:Pt.y||0, node:Pt.node }, layer:Pt.layer }; }
    else P=SIM.R.place[L.place];
    if(!P) return;
    var from=SIM.pose(lead, t), layer=G.layer||'pedestrian', mode=G.mode||'walk', spd=G.speed||lead.speed;
    var to = L.port ? P.door : (P.spots && P.spots.length ? { x:P.spots[0][0], z:P.spots[0][1], y:P.y } : P.door);
    var r=SIM.nav.route(layer, from, to, { minW:G.kind==='caravan'?5:0 });
    G.members.forEach(function(id, i){ var a=SIM.R.actor[id]; if(L.place && P.occ!=null) SIM.reserve(a, P, L.activity);
      a.activity=L.activity; a.place=L.place||null;
      var file=G.spread===0, row=file?i:Math.floor(i/2), side=file?0:(i%2?1:-1)*(G.spread!=null?G.spread:G.kind==='caravan'?1.1:1.6);   /* spread 0: single file on the leader's path */
      a.task={ act:L.activity, place:a.place, t0:t, legs:r?[{ route:r, speed:spd, mode:mode, layer:layer, dur:r.len/spd, back:row*(file?1.4:G.kind==='caravan'?3.2:3.0), side:i?side:0 }]:[], spot:to, dur:r?r.len/spd:0, indoor:false, together:G.id };
      a.task.arrive=t+a.task.dur; });
    G.legAt=t; G.legArrive=t+(r?r.len/spd:0); G.route=r; G.phase=L.port?'depart':'arrive';
    if(!r) SIM.logEvent('nopath', { group:G.id, layer:layer, to:L.port||L.place });
  }
  function excursion(E, minute, t, port){
    /* one of the org's people on duty at the base takes a vehicle out to a port, stays away, and drives back */
    var base=SIM.R.place[E.base], pool=SIM.all('actor').filter(function(a){ return a.present && !a.plan && a.org===E.org && a.vehicle && a.place && (a.place===E.base || SIM.R.place[a.place] && SIM.R.place[a.place].kind===E.fromKind) && a.task && !a.task.failed && SIM.time() >= a.task.arrive; });
    if(!pool.length || !base) return null;
    var a=pool[Math.floor(SIM.rng.next()*pool.length)], away=Math.round(SIM.rng.range(E.away[0], E.away[1])*60);
    a.plan=[{ activity:'DRIVE', port:port },{ away:true, until:minute+away },{ activity:'DRIVE_BACK', place:E.base }]; a.planI=0;
    var Pt=SIM.R.port[port]; SIM.release(a);
    var legs=[], b=leg('pedestrian', SIM.pose(a,t), base.door, a.speed, 'walk', 0); if(b) legs.push(b);
    var d=leg('road', base.door, { x:Pt.x, z:Pt.z, y:0 }, SIM.SPEED.drive, 'drive', 5); if(d) legs.push(d);
    a.activity='DRIVE'; a.place=null; a.inVehicle='buggy';
    a.task={ act:'DRIVE', place:null, t0:t, legs:legs, spot:{ x:Pt.x, z:Pt.z, y:0 }, dur:legs.reduce(function(s,L){ return s+L.dur; },0), indoor:false };
    a.task.arrive=t+a.task.dur; E.fired++;
    SIM.logEvent('event', { event:E.id, actor:a.id, to:port, awayMinutes:away });
    return a;
  }

  /* ---------------------------------------------------------------- the stepper */
  var rot=0;
  SIM.step = function(){
    var minute=SIM.minute(), t=SIM.time(), hour=hourOf(minute), budget=SIM.STEP_MAX;
    SIM.lastStep = minute;
    SIM.all('event').forEach(function(E){
      if(E.next==null) E.next = minute + Math.round(SIM.rng.range(0, (E.every?E.every[0]:2)*60));
      if(minute >= E.next){ var ok=!E.window || (hour>=E.window[0] && hour<E.window[1]); var live=SIM.all('group').filter(function(G){ return G.event===E.id && !G.done; }).length;
        if(ok && live < (E.maxLive||3)) SIM.fire(E, minute, t); E.next = nextFiring(E, minute); } });
    /* groups: advance their itineraries */
    SIM.all('group').forEach(function(G){ if(G.done || !G.plan) return; var lead=SIM.R.actor[G.leader]; if(!lead) return;
      if(G.phase==='arrive' && t >= G.legArrive && G.plan.legs){ var Lc=lead.plan[lead.planI];      /* an itinerary stop: stay its minutes */
        G.members.forEach(function(id){ var a=SIM.R.actor[id]; a.pos=SIM.pose(a, t); }); G.phase='dwell'; G.until=minute+(Lc.mins||0);
        SIM.logEvent('arrived', { group:G.id, place:Lc.place, act:Lc.activity }); }
      else if(G.phase==='dwell' && minute >= G.until){ G.members.forEach(function(id){ var a=SIM.R.actor[id]; SIM.release(a); a.planI++; }); groupLeg(G, minute, t); }
      else if(G.phase==='arrive' && t >= G.legArrive){ G.members.forEach(function(id){ var a=SIM.R.actor[id]; a.pos=SIM.pose(a, t); a.planI=1; a.task=null; a.wanted=null; }); G.phase='stay'; SIM.logEvent('arrived', { group:G.id, place:G.dest }); }
      else if(G.phase==='stay' && minute >= G.plan.stayUntil){ G.members.forEach(function(id){ var a=SIM.R.actor[id]; SIM.release(a); a.planI=2; }); groupLeg(G, minute, t); }
      else if(G.phase==='depart' && t >= G.legArrive){ G.done=true; G.members.forEach(function(id){ var a=SIM.R.actor[id]; SIM.release(a); a.present=false; SIM.remove('actor', id); });
        SIM.logEvent('left', { group:G.id, port:G.to }); SIM.remove('group', G.id); } });
    /* actors */
    var A=SIM.all('actor'), n=A.length; if(!n) return 0; rot=(rot+37)%n; var made=0;
    for(var q=0;q<n && budget>0;q++){ var a=A[(q+rot)%n];
      if(a.plan){ var L=a.plan[a.planI];
        if(L && L.away){ if(minute >= L.until){ a.planI++; a.present=true; var Pt=null, Bp=SIM.R.place[a.plan[a.planI].place]; var prev=a.plan[0].port; Pt=SIM.R.port[prev];
            var d=leg('road', { x:Pt.x, z:Pt.z, y:0 }, Bp.door, SIM.SPEED.drive, 'drive', 5); a.inVehicle='buggy';
            a.task={ act:'DRIVE_BACK', place:Bp.id, t0:t, legs:d?[d]:[], spot:Bp.door, dur:d?d.dur:0, indoor:false }; a.task.arrive=t+a.task.dur; a.activity='DRIVE_BACK'; }
          continue; }
        if(L && L.activity==='DRIVE' && a.task && t >= a.task.arrive){ a.planI++; a.present=false; a.task=null; continue; }
        if(L && L.activity==='DRIVE_BACK' && a.task && t >= a.task.arrive){ a.pos=SIM.pose(a, t); a.plan=null; a.inVehicle=null; a.task=null; a.activity=null; a.wanted=null; }
        if(L && (L.together || L.away)) continue;                                  /* the group (or the trip) moves it */
      }
      if(!a.present) continue;
      var want=SIM.desire(a, minute), Rr=SIM.R.role[a.role], cyc=Rr.cycle && Rr.cycle[a.activity];
      if(want!==a.wanted || !a.task || (a.task.failed && (minute%15===0))){ SIM.decide(a, minute, t); budget--; made++; }
      else if(cyc && a.since!=null && minute-a.since >= cyc && t >= a.task.arrive && a.activity===want){   /* a role that moves on (the watch, a merchant doing the rounds) */
        var here=a.place; a.mem[want]=null; a.bad=a.bad||{}; var had=a.bad[here]; a.bad[here]=1; SIM.decide(a, minute, t); if(!had) delete a.bad[here]; budget--; made++; }
    }
    return made;
  };
  /* the clock jumped: decide everyone afresh and put most of them where they are going (a share stays mid-trip) */
  SIM.jump = function(){
    var minute=SIM.minute(), t=SIM.time();
    SIM.all('actor').forEach(function(a){ if(!a.present || a.plan) return; a.wanted=null; SIM.decide(a, minute, t);
      if(a.task && SIM.rng.next() > 0.12){ var d=a.task.dur; a.task.t0 -= d; a.task.arrive -= d; } });
    SIM.logEvent('jump', { minute:minute });
  };
})(typeof window!=='undefined'?window:globalThis);
