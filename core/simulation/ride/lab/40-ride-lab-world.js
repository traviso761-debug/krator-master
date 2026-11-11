// ================================================================= RIDE LAB — the world: two Line segments and the gap between
// [G data] core/simulation/PLAN-RIDING.md section 8. A stand-in of the Line (kits/tungang/PLAN.md 0.2) in the hook's shape
// (section 3): each segment a straight two-track gallery with a train of three cars shuttling between two stations, the
// segments cut by a fall the travellers walk round through a cavern. The cars are stand-ins (the vehicles kit's Line cars
// replace them when merged); every record is plain data, so the node test (../test-ride.js) and the page declare the same
// world. No THREE, no DOM.
//
//   RIDELAB.declare({secPerMinute}) -> L   the nav, the places, the stops and the two trains into SIM (after SIM.init)
//   RIDELAB.walk(W, L)                     the walk records: platforms, the cavern, the town floors (static), and each car's
//                                          floors, walls, doors and step plates as KWALKFRAME frames posed by SIM.rideCarPose
//   RIDELAB.doors(L, t)                    each car's doors and plates switched by its door window at t (the walk side)
//   RIDELAB.people(L, n)                   n travellers: their homes at Ledge, their work at Twenny, past the gap
//   RIDELAB.CAR                            the stand-in car: 13 m x 2.6 m, its floor 1.1 m over the rail, 8 seats, 6 standing,
//                                          two doors a side
(function(root){
  'use strict';
  var Y=1.1, HW=1.3;
  var CAR={ len:13, w:2.6, floorY:Y, wallH:2.1,
    seats:[-5,-2.5,2.5,5].reduce(function(a,z,i){ a.push({ id:'s'+(2*i), at:[-0.85, Y, z], yaw:0 }, { id:'s'+(2*i+1), at:[0.85, Y, z], yaw:0 }); return a; }, []),
    stand:[[-0.35, 0.35, -6, 6, Y]],
    doors:[{ id:'d+f', side:1, at:[HW, Y, 3.5] }, { id:'d+r', side:1, at:[HW, Y, -3.5] }, { id:'d-f', side:-1, at:[-HW, Y, 3.5] }, { id:'d-r', side:-1, at:[-HW, Y, -3.5] }],
    cap:{ seats:8, stand:6 } };
  /* the two segments: tracks along +x at z = 0 (side +1 of a car facing +x is -z: the platforms lie at -z) */
  var SEG=[
    { id:'line.n', x0:0, x1:1000, stops:[{ id:'ledge', s:60, name:'Ledge' }, { id:'gap.n', s:880, name:'the north gap station' }] },
    { id:'line.s', x0:1100, x1:2100, stops:[{ id:'gap.s', s:60, name:'the south gap station' }, { id:'twenny', s:880, name:'Loj Twenny' }] } ];
  /* the train: three cars of 13 m, 1 m apart, 41 m long; s(t) is its A end (facing +s), each car's middle OFF behind it
     (biomes/line/PLAN.md section 8); a stop's `s` below is where the train's middle stands, so its timeline runs AEND on */
  var AEND=20.5, OFF=[34.5, 20.5, 6.5], B=4.5, DWELL=90, RUN=75;
  function track(S){ return SIM.rideRoute([[S.x0, 0, 0], [S.x1, 0, 0]]); }
  function timeline(S){ var a=S.stops[0], b=S.stops[1];
    var sa=a.s+AEND, sb=b.s+AEND;
    return { period:2*(DWELL+RUN), phase:0, segments:[{ dur:DWELL, from:sa, name:'stop:'+a.id+':1' }, { dur:RUN, from:sa, to:sb, ease:'smooth', name:'run' },
      { dur:DWELL, from:sb, name:'stop:'+b.id+':1' }, { dur:RUN, from:sb, to:sa, ease:'smooth', name:'run' }] }; }
  function stopX(S, st){ return S.x0+st.s; }
  function declare(o){
    o=o||{};
    var nodes=[], edges=[], id=0;
    function node(x, y, z, tag){ var n={ id:'n'+(id++), x:x, y:y, z:z, tag:tag||'' }; nodes.push(n); return n; }
    function edge(a, b, kind){ edges.push({ id:edges.length, a:a.id, b:b.id, kind:kind||'floor', w:3, len:Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z) }); }
    function chain(L, kind){ for(var i=1;i<L.length;i++) edge(L[i-1], L[i], kind); }
    var L={ seg:SEG, stops:{}, places:{} };
    /* each platform: a walk line at z = -4 every 10 m, 70 m long, 1.1 m up; a stair down to the town at its middle */
    SEG.forEach(function(S){ S.stops.forEach(function(st){ var x=stopX(S, st), P=[];
      for(var dx=-35;dx<=35;dx+=10) P.push(node(x+dx, Y, -4, 'platform'));
      chain(P, 'platform'); st.nodes=P; st.x=x;
      var foot=node(x, 0, -14, 'stair'); edge(P[3], foot, 'stair'); st.foot=foot; }); });
    /* the gap: from the north gap station's east end round the fall through a cavern to the south gap station's west end */
    var gn=SEG[0].stops[1], gs=SEG[1].stops[0];
    var cav=[gn.nodes[gn.nodes.length-1], node(gn.x+60, Y, -6, 'cavern'), node(gn.x+90, 2, -40, 'cavern'), node(gn.x+150, 0.5, -70, 'cavern'), node(gn.x+210, 1.5, -64, 'cavern'),
      node(gs.x-60, Y, -30, 'cavern'), node(gs.x-45, Y, -6, 'cavern'), gs.nodes[0]];
    chain(cav, 'cavern'); L.cavern=cav.map(function(n){ return [n.x, n.y, n.z]; });
    /* the towns: Ledge's houses round its station, Twenny's works round its */
    var led=SEG[0].stops[0], twe=SEG[1].stops[1];
    var hA=node(led.x, 0, -40, 'town'), wB=node(twe.x, 0, -40, 'town');
    edge(led.foot, hA, 'street'); edge(twe.foot, wB, 'street');
    SIM.nav.layer('pedestrian', { nodes:nodes, edges:edges });
    L.nodes=nodes; L.edges=edges;
    SIM.place({ id:'ledge.homes', kind:'home', x:hA.x, z:hA.z, y:0, r:6, activities:{ SLEEP:200 } });
    SIM.place({ id:'twenny.works', kind:'works', x:wB.x, z:wB.z, y:0, r:6, activities:{ WORK:200 } });
    /* the stops: a place for each (its store, for the trade), its platform's waiting spots by the doors */
    SEG.forEach(function(S){ S.stops.forEach(function(st){ var x=st.x, wait=[];
        [-18, -11, -4, 3, 10, 17].forEach(function(dx){ wait.push([x+dx, Y, -3.4]); });
        SIM.place({ id:st.id+'.stop', kind:'station', x:x, z:-4, y:Y, door:{ x:x, y:Y, z:-4 }, activities:{} });
        L.stops[st.id]={ place:st.id+'.stop', side:1, gap:0.10, wait:wait, x:x, name:st.name }; }); });
    var spm=o.secPerMinute==null ? 60 : o.secPerMinute;
    L.sources=SEG.map(function(S){ var stops={}; S.stops.forEach(function(st){ stops[st.id]=L.stops[st.id]; });
      return SIM.rideSource({ id:S.id, kind:'train', track:track(S), timeline:timeline(S), stops:stops, stepSec:spm,
        cars:OFF.map(function(off){ return { off:off, b:B, cap:CAR.cap, seats:CAR.seats, stand:CAR.stand, doors:CAR.doors }; }) }); });
    /* the gap's walk as a route on the record (the Line's LN.gaps[i].walk): the north gap station's platform, the cavern, the south's */
    var w0=L.stops['gap.n'].wait[0], w1=L.stops['gap.s'].wait[0];
    SIM.rideFootpath({ from:'gap.n', to:'gap.s', pts:[w0].concat(L.cavern, [w1]) });
    return L;
  }
  /* the walk records, static and riding */
  function walk(W, L){
    L.seg.forEach(function(S){ S.stops.forEach(function(st){ W.floor({ rect:[st.x-35, st.x+35, -6, -1.65], y:Y, name:'platform '+st.id, tag:'platform' });
        W.strip({ a:[st.x, -6, Y], b:[st.x, -14, 0], w:2.4, name:'stair '+st.id, tag:'stair' }); });
      W.floor({ rect:[S.x0, S.x1, -1.65, 6], y:0, name:'trackbed '+S.id, tag:'trackbed' }); });
    for(var i=1;i<L.cavern.length;i++){ var a=L.cavern[i-1], b=L.cavern[i]; W.strip({ a:[a[0], a[2], a[1]], b:[b[0], b[2], b[1]], w:4, name:'cavern '+i, tag:'cavern' }); }
    var led=L.stops.ledge, twe=L.stops.twenny;
    W.floor({ rect:[led.x-30, led.x+30, -60, -14], y:0, name:'Ledge', tag:'town' });
    W.floor({ rect:[twe.x-30, twe.x+30, -60, -14], y:0, name:'Twenny', tag:'town' });
    L.frames=[];
    L.sources.forEach(function(S){ S.cars.forEach(function(C){
      var F=KWALKFRAME.frame(W, { id:S.id+'.car'+C.k, pose:function(t){ return SIM.rideCarPose(S.id, C.k, t); }, r:8, source:{ ride:S.id, k:C.k } });
      var hl=CAR.len/2, wall=[Y, Y+CAR.wallH];
      F.floor({ rect:[-HW, HW, -hl, hl], y:Y, name:'saloon', tag:'car' });
      F.block([-HW-0.15, HW+0.15, -hl-0.15, -hl, wall[0], wall[1]], 'end');
      F.block([-HW-0.15, HW+0.15, hl, hl+0.15, wall[0], wall[1]], 'end');
      var doorsW={};
      [1, -1].forEach(function(side){ var x0=side>0 ? HW : -HW-0.15, x1=side>0 ? HW+0.15 : -HW, cuts=[-hl, -4.1, -2.9, 2.9, 4.1, hl];
        for(var j=0;j<cuts.length-1;j++){ var door=(j===1 || j===3), id=(side>0 ? 'd+' : 'd-')+(j===1 ? 'r' : 'f');
          var rec=F.block([x0, x1, cuts[j], cuts[j+1], wall[0], wall[1]], door ? 'door:'+id : 'wall');
          if(door){ var px0=side>0 ? HW : -HW-0.4, px1=side>0 ? HW+0.4 : -HW;
            doorsW[id]={ block:rec, plate:F.floor({ rect:[px0, px1, cuts[j], cuts[j+1]], y:Y, name:'plate '+id, tag:'plate', off:true }) }; } } });
      L.frames.push({ src:S.id, k:C.k, F:F, doors:doorsW }); }); });
    return L.frames;
  }
  /* the walk side of the door windows: each door's block off and its plate on while its car's window is open on its side */
  function doors(L, t, W){
    L.frames.forEach(function(fr){ Object.keys(fr.doors).forEach(function(id){ var open=SIM.rideDoorOpen(fr.src, fr.k, id, t), d=fr.doors[id];
      W.setBlock(d.block, !open); KWALKFRAME.setFloor(d.plate, open); }); });
  }
  function people(L, n){
    if(!SIM.R.activity.TRAVEL) ['TRAVEL', 'SLEEP', 'WORK'].forEach(function(a){ SIM.activity({ id:a }); });
    if(!SIM.R.faction.tungang){ SIM.faction({ id:'tungang', name:'The Tungangs' }); SIM.org({ id:'loj', faction:'tungang', name:'The lojes' }); }
    if(!SIM.R.role.traveller) SIM.role({ id:'traveller', org:'loj', sched:[[0, 'SLEEP']] });
    var H=SIM.R.place['ledge.homes'], out=[];
    for(var i=0;i<n;i++){ var u=((i*2654435761)>>>0)/4294967296, v=((i*40503+977)>>>0)%1000/1000, ang=u*Math.PI*2, r=1+4*v;
      out.push(SIM.actor({ id:'tr'+i, role:'traveller', home:'ledge.homes', work:'twenny.works', pos:{ x:H.x+Math.cos(ang)*r, y:0, z:H.z+Math.sin(ang)*r } })); }
    return out;
  }
  /* the trade (PLAN-RIDING.md section 5): four lojes, each a settlement keeping an economy, its store the station's; grain
     made at Ledge and wax at Twenny each go the length of the line hop by hop: the north train (SIM.trade on its ride
     source), the porters across the gap (a timer route, walked by a crew: 79-sim-ride-porters.js), the south train. Every
     loj eats grain and burns wax by the hour (RIDELAB.use, a step hook), which is the want the routes serve */
  var LOJES=[{ id:'ledge', stop:'ledge', stock:{ grain:3000, wax:20 } }, { id:'gapn', stop:'gap.n', stock:{ grain:20, wax:20 } },
    { id:'gaps', stop:'gap.s', stock:{ grain:20, wax:20 } }, { id:'twenny', stop:'twenny', stock:{ grain:20, wax:3000 } }];
  var USE={ ledge:{ grain:6, wax:3 }, gapn:{ grain:2, wax:1 }, gaps:{ grain:2, wax:1 }, twenny:{ grain:6, wax:3 } };
  function trade(L, o){
    o=o||{}; var spm=o.secPerMinute==null ? 60 : o.secPerMinute;
    if(!SIM.R.faction.tungang){ SIM.faction({ id:'tungang', name:'The Tungangs' }); SIM.org({ id:'loj', faction:'tungang', name:'The lojes' }); }
    L.lojes=LOJES.map(function(J){ SIM.settlement({ id:J.id, faction:'tungang', name:J.id });
      var P=SIM.R.place[J.stop+'.stop']; P.settlement=J.id;
      SIM.economy({ goods:{ grain:{}, wax:{} }, window:1 }, { settlement:J.id });
      SIM.store(P.id, { kind:'warehouse' }); P.stock=JSON.parse(JSON.stringify(J.stock)); return J; });
    L.start={ grain:0, wax:0 }; LOJES.forEach(function(J){ L.start.grain+=J.stock.grain; L.start.wax+=J.stock.wax; });
    var cap=o.cap==null ? 240 : o.cap, keep=o.keep==null ? 1 : o.keep;
    L.routes={
      north:SIM.trade({ id:'rail.n', line:'line.n', stops:[{ settlement:'ledge', place:'ledge.stop' }, { settlement:'gapn', place:'gap.n.stop' }], cap:cap, keep:keep }),
      porters:SIM.trade({ id:'gap.porters', stops:[{ settlement:'gapn', place:'gap.n.stop' }, { settlement:'gaps', place:'gap.s.stop' }], cap:o.portersCap==null ? 120 : o.portersCap,
        minutes:SIM.portersMinutes('gap.n.stop', 'gap.s.stop', 0.8, 'pedestrian', spm), mins:o.portersStay==null ? 15 : o.portersStay, keep:keep }),
      south:SIM.trade({ id:'rail.s', line:'line.s', stops:[{ settlement:'gaps', place:'gap.s.stop' }, { settlement:'twenny', place:'twenny.stop' }], cap:cap, keep:keep }) };
    if(!SIM.R.role.porter){ if(!SIM.R.activity.CARRY) SIM.activity({ id:'CARRY' }); SIM.role({ id:'porter', org:'loj', sched:[[0, 'CARRY']] }); }
    var crew=[]; for(var i=0;i<(o.crew==null ? 6 : o.crew);i++){ var a=SIM.actor({ id:'porter'+i, role:'porter', settlement:'gapn' }); crew.push(a.id); }
    L.porters=SIM.porters({ route:'gap.porters', crew:crew, secPerMinute:spm });
    if(SIM.stepHooks.indexOf(use)<0) SIM.stepHooks.unshift(use);
    return L;
  }
  function use(minute){ if(minute%60!==0) return; LOJES.forEach(function(J){ Object.keys(USE[J.id]).forEach(function(g){ SIM.supply(g, USE[J.id][g], false, J.id); }); }); }
  root.RIDELAB={ declare:declare, walk:walk, doors:doors, people:people, trade:trade, use:use, CAR:CAR, SEG:SEG, DWELL:DWELL, RUN:RUN, LOJES:LOJES, USE:USE };
})(typeof window!=='undefined'?window:globalThis);
