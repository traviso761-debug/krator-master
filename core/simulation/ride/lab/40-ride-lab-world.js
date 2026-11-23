// ================================================================= RIDE LAB — the world: two Line segments and the gap between
// [G data] core/simulation/PLAN-RIDING.md section 8. A stand-in of the Line (kits/tungang/PLAN.md 0.2) on the hook agreed with
// the Line session (section 3): each segment a straight gallery with a train shuttling between two stations, the segments
// cut by a fall the travellers walk round through a cavern. The trains are the Line's own cars (kits/motor-vehicles/
// krator-vehicles-line.js, the Kept variant), read through KratorVehicles.dataOf: each car's `data.ride` (bogies, seats,
// standing room, doors, floor, in its own frame) is what SIM.rideSource and the walk frames take. The consist is the bore
// station's in short (biomes/line/stations/bore/48-line-gallery.js): a power car, two saloons, a van, a power car turned
// round. Every record is plain data, so the node tests (../test-ride*.js) and the page declare the same world. No THREE.
//
//   RIDELAB.declare({cars: KratorVehicles, secPerMinute}) -> L   the nav, the places, the stops and the two trains into SIM
//   RIDELAB.walk(W, L)                     the walk records: platforms, the cavern, the town floors (static), and each car's
//                                          floor, walls, doors (tagged door:<id>) and step plates as KWALKFRAME frames
//   RIDELAB.doors(L, t, W)                 each car's doors and plates switched by its door window at t (the walk side)
//   RIDELAB.people(L, n)                   n travellers: their homes at Ledge, their work at Twenny, past the gap
//   RIDELAB.CONSIST                        [[key, length, turned], ...]; L.train the cars: {k, key, len, flip, off, ride}
(function(root){
  'use strict';
  var Y=1.2, SIDE=1.75, WALLH=2.2, DOORW=1.4;   /* the Line's car floor and platform height; a car's half-width; door width */
  var CONSIST=[['anc_line_power', 22, false], ['anc_line_saloon', 24, false], ['anc_line_saloon', 24, false], ['anc_line_van', 24, false],
    ['anc_line_power', 22, true]], GAP=1.0;
  var RIDERS={ anc_line_saloon:true, anc_line_crew:true };   /* the cars that take travellers: the power cars' two seats are the crew's, the van takes goods */
  /* a car turned round (the train's far power car): its frame is the train's, so its own records turn half round */
  function mirror(R){
    var M=JSON.parse(JSON.stringify(R)), P=function(p){ return [-p[0], p[1], -p[2]]; }, rect=function(r){ return [-r[1], -r[0], -r[3], -r[2]].concat(r.slice(4)); };
    (M.seats||[]).forEach(function(q){ q.at=P(q.at); q.yaw=(q.yaw==null ? 0 : q.yaw)+Math.PI; });
    (M.doors||[]).forEach(function(q){ q.at=P(q.at); q.side=-q.side; });
    (M.slots||[]).forEach(function(q){ if(q.at) q.at=P(q.at); });
    M.stand=(M.stand||[]).map(rect); if(M.floor) M.floor=rect(M.floor);
    return M;
  }
  function consist(KV){
    if(!KV || !KV.dataOf) throw new Error('RIDELAB.declare: cars (KratorVehicles, with the line culture) are required');
    var off=0;
    return CONSIST.map(function(c, k){ var d=KV.dataOf(c[0], 1); if(!d || !d.ride) throw new Error('RIDELAB: '+c[0]+' has no data.ride (bundle the line culture)');
      var R=c[2] ? mirror(d.ride) : JSON.parse(JSON.stringify(d.ride)); if(!RIDERS[c[0]]) R.cap={ seats:0, stand:0 };
      var car={ k:k, key:c[0], len:c[1], flip:c[2], off:off+c[1]/2, ride:R }; off+=c[1]+GAP; return car; });
  }
  /* the two segments: tracks along +x at z = 0 (side +1 of a car facing +x is -z: the platforms lie at -z); a stop's `s` is
     where the train's middle stands */
  var SEG=[
    { id:'line.n', x0:0, x1:1000, stops:[{ id:'ledge', s:100, name:'Ledge' }, { id:'gap.n', s:880, name:'the north gap station' }] },
    { id:'line.s', x0:1100, x1:2100, stops:[{ id:'gap.s', s:100, name:'the south gap station' }, { id:'twenny', s:880, name:'Loj Twenny' }] } ];
  var DWELL=90, RUN=75;
  function track(S){ return SIM.rideRoute([[S.x0, 0, 0], [S.x1, 0, 0]]); }
  function timeline(S, aend){ var a=S.stops[0], b=S.stops[1];
    var sa=a.s+aend, sb=b.s+aend;   /* s(t) is the train's A end (biomes/line/PLAN.md section 8) */
    return { period:2*(DWELL+RUN), phase:0, segments:[{ dur:DWELL, from:sa, name:'stop:'+a.id+':1' }, { dur:RUN, from:sa, to:sb, ease:'smooth', name:'run' },
      { dur:DWELL, from:sb, name:'stop:'+b.id+':1' }, { dur:RUN, from:sb, to:sa, ease:'smooth', name:'run' }] }; }
  function stopX(S, st){ return S.x0+st.s; }
  function declare(o){
    o=o||{};
    var train=consist(o.cars), last=train[train.length-1], tlen=last.off+last.len/2, aend=tlen/2, half=Math.ceil(aend+10);
    var nodes=[], edges=[], id=0;
    function node(x, y, z, tag){ var n={ id:'n'+(id++), x:x, y:y, z:z, tag:tag||'' }; nodes.push(n); return n; }
    function edge(a, b, kind){ edges.push({ id:edges.length, a:a.id, b:b.id, kind:kind||'floor', w:3, len:Math.hypot(a.x-b.x, a.y-b.y, a.z-b.z) }); }
    function chain(L, kind){ for(var i=1;i<L.length;i++) edge(L[i-1], L[i], kind); }
    var L={ seg:SEG, stops:{}, places:{}, train:train, trainLen:tlen, aend:aend, platformHalf:half, floorY:Y, side:SIDE };
    /* each platform: a walk line at z = -4 every 10 m, the train's length and 10 m each end, 1.2 m up; a stair down to the town
       from the node nearest its middle */
    SEG.forEach(function(S){ S.stops.forEach(function(st){ var x=stopX(S, st), P=[], mid=0;
      for(var dx=-half+5;dx<=half-5;dx+=10){ P.push(node(x+dx, Y, -4, 'platform')); if(Math.abs(dx)<Math.abs(P[mid].x-x)) mid=P.length-1; }
      chain(P, 'platform'); st.nodes=P; st.x=x;
      var foot=node(P[mid].x, 0, -14, 'stair'); edge(P[mid], foot, 'stair'); st.foot=foot; st.stairX=P[mid].x; }); });
    /* the gap: from the north gap station's east end round the fall through a cavern to the south gap station's west end */
    var gn=SEG[0].stops[1], gs=SEG[1].stops[0], ge=gn.nodes[gn.nodes.length-1], gw=gs.nodes[0];
    var cav=[ge, node(ge.x+15, Y, -8, 'cavern'), node(ge.x+40, 2, -40, 'cavern'), node(1050, 0.5, -70, 'cavern'), node(gw.x-40, 1.5, -40, 'cavern'),
      node(gw.x-15, Y, -8, 'cavern'), gw];
    chain(cav, 'cavern'); L.cavern=cav.map(function(n){ return [n.x, n.y, n.z]; });
    /* the towns: Ledge's houses round its station, Twenny's works round its */
    var led=SEG[0].stops[0], twe=SEG[1].stops[1];
    var hA=node(led.x, 0, -40, 'town'), wB=node(twe.x, 0, -40, 'town');
    edge(led.foot, hA, 'street'); edge(twe.foot, wB, 'street');
    SIM.nav.layer('pedestrian', { nodes:nodes, edges:edges });
    L.nodes=nodes; L.edges=edges;
    SIM.place({ id:'ledge.homes', kind:'home', x:hA.x, z:hA.z, y:0, r:6, activities:{ SLEEP:400 } });
    SIM.place({ id:'twenny.works', kind:'works', x:wB.x, z:wB.z, y:0, r:6, activities:{ WORK:400 } });
    /* the stops: a place for each (its store, for the trade); waiting spots on the platform in front of each door that opens
       onto it (side +1) of the cars that take travellers, from where the cars stand in the dwell */
    SEG.forEach(function(S){ S.stops.forEach(function(st){ var x=st.x, wait=[];
        train.forEach(function(c){ if(!(c.ride.cap.seats+c.ride.cap.stand>0)) return; var mid=x+aend-c.off;
          (c.ride.doors||[]).forEach(function(D){ if(D.side===1) wait.push([mid+D.at[2], Y, -3.4]); }); });
        SIM.place({ id:st.id+'.stop', kind:'station', x:x, z:-4, y:Y, door:{ x:x, y:Y, z:-4 }, activities:{} });
        L.stops[st.id]={ place:st.id+'.stop', side:1, gap:0.10, wait:wait, x:x, name:st.name }; }); });
    var spm=o.secPerMinute==null ? 60 : o.secPerMinute;
    L.sources=SEG.map(function(S){ var stops={}; S.stops.forEach(function(st){ stops[st.id]=L.stops[st.id]; });
      return SIM.rideSource({ id:S.id, kind:'train', track:track(S), timeline:timeline(S, aend), stops:stops, stepSec:spm,
        cars:train.map(function(c){ var R=c.ride; return { off:c.off, b:R.b, cap:R.cap, seats:R.seats, stand:R.stand, doors:R.doors }; }) }); });
    /* the gap's walk as a route on the record (the Line's LN.gaps[i].walk): the north gap station's platform, the cavern, the south's */
    var w0=[ge.x, Y, -4], w1=[gw.x, Y, -4];
    SIM.rideFootpath({ from:'gap.n', to:'gap.s', pts:[w0].concat(L.cavern, [w1]) });
    return L;
  }
  /* the walk records, static and riding */
  function walk(W, L){
    var half=L.platformHalf, edgeZ=-(SIDE+0.10);
    L.seg.forEach(function(S){ S.stops.forEach(function(st){ W.floor({ rect:[st.x-half, st.x+half, -6, edgeZ], y:Y, name:'platform '+st.id, tag:'platform' });
        W.strip({ a:[st.stairX, -6, Y], b:[st.stairX, -14, 0], w:2.4, name:'stair '+st.id, tag:'stair' }); });
      W.floor({ rect:[S.x0, S.x1, edgeZ, 6], y:0, name:'trackbed '+S.id, tag:'trackbed' }); });
    for(var i=1;i<L.cavern.length;i++){ var a=L.cavern[i-1], b=L.cavern[i]; W.strip({ a:[a[0], a[2], a[1]], b:[b[0], b[2], b[1]], w:4, name:'cavern '+i, tag:'cavern' }); }
    var led=L.stops.ledge, twe=L.stops.twenny;
    W.floor({ rect:[led.x-30, led.x+30, -60, -14], y:0, name:'Ledge', tag:'town' });
    W.floor({ rect:[twe.x-30, twe.x+30, -60, -14], y:0, name:'Twenny', tag:'town' });
    L.frames=[];
    L.sources.forEach(function(S){ S.cars.forEach(function(C){
      var car=L.train[C.k], R=car.ride, hl=car.len/2, fl=R.floor || [-1.6, 1.6, -hl+0.4, hl-0.4, Y], fy=fl[4], wy=[fy, fy+WALLH];
      var F=KWALKFRAME.frame(W, { id:S.id+'.car'+C.k, pose:function(t){ return SIM.rideCarPose(S.id, C.k, t); }, r:hl+3, source:{ ride:S.id, k:C.k } });
      F.floor({ rect:[fl[0], fl[1], fl[2], fl[3]], y:fy, name:car.key, tag:'car' });
      F.block([-SIDE, SIDE, fl[2]-0.15, fl[2], wy[0], wy[1]], 'end');
      F.block([-SIDE, SIDE, fl[3], fl[3]+0.15, wy[0], wy[1]], 'end');
      var doorsW={};
      [1, -1].forEach(function(side){ var x0=side>0 ? fl[1] : -SIDE, x1=side>0 ? SIDE : fl[0];
        var mine=(R.doors||[]).filter(function(D){ return D.side===side && D.at[2]>fl[2] && D.at[2]<fl[3]; }).sort(function(a, b){ return a.at[2]-b.at[2]; });
        var z=fl[2];
        mine.forEach(function(D){ var z0=D.at[2]-DOORW/2, z1=D.at[2]+DOORW/2;
          if(z0>z) F.block([x0, x1, z, z0, wy[0], wy[1]], 'wall');
          /* the step plate: from the floor's edge across the doorway's threshold (the wall's thickness) and out over the
             platform's gap; a shut door's block fills the threshold, so the plate is switched with it */
          var px0=side>0 ? fl[1] : -SIDE-0.35, px1=side>0 ? SIDE+0.35 : fl[0];
          doorsW[D.id]={ block:F.block([x0, x1, z0, z1, wy[0], wy[1]], 'door:'+D.id), plate:F.floor({ rect:[px0, px1, z0, z1], y:fy, name:'plate '+D.id, tag:'plate', off:true }) };
          z=z1; });
        if(z<fl[3]) F.block([x0, x1, z, fl[3], wy[0], wy[1]], 'wall'); });
      L.frames.push({ src:S.id, k:C.k, F:F, doors:doorsW, car:car }); }); });
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
  /* the trade (PLAN-RIDING.md sections 5 and 8c): the four lojes as books only (SIM.lineEconomy, 80-sim-ride-line.js), each a
     settlement with one store at its station, making and using by the hour from its people: Ledge makes grain, Twenny wax,
     every loj eats grain and burns wax. The goods go the length of the line hop by hop, drawn by the through-demand: the
     north train, the porters across the gap (a crew walks it, resting four hours at each end: the Line's real gaps are
     walks of one to four hours, so the porters are the line's bottleneck), the south train. o.through false: each hop serves only its
     own receiver (the check's negative) */
  var LOJES=[{ id:'ledge', stop:'ledge.stop', pop:120, makes:{ grain:600 }, stock:{ grain:500, wax:40 } },
    { id:'gapn', stop:'gap.n.stop', pop:30, stock:{ grain:40, wax:40 } },
    { id:'gaps', stop:'gap.s.stop', pop:30, stock:{ grain:40, wax:40 } },
    { id:'twenny', stop:'twenny.stop', pop:150, makes:{ wax:500 }, stock:{ grain:40, wax:500 } }];
  var USE={ grain:1, wax:0.5 };
  function trade(L, o){
    o=o||{}; var spm=o.secPerMinute==null ? 60 : o.secPerMinute;
    var E=SIM.lineEconomy({ id:'line', faction:'tungang', goods:{ grain:{}, wax:{} }, secPerMinute:spm, through:o.through,
      lojes:LOJES.map(function(J){ return { id:J.id, stop:J.stop, pop:J.pop, makes:J.makes, uses:USE, stock:J.stock }; }),
      links:[{ from:'ledge', to:'gapn', rail:'line.n' }, { from:'gapn', to:'gaps', porters:{ speed:0.8, crew:o.crew==null ? 6 : o.crew, cap:200, stay:o.portersStay==null ? 240 : o.portersStay } },
        { from:'gaps', to:'twenny', rail:'line.s' }] });
    L.economy=E; L.lojes=E.lojes; L.start=E.start;
    L.routes={ north:E.routes['ledge-gapn'], porters:E.routes['gapn-gaps'], south:E.routes['gaps-twenny'] };
    L.porters=E.porters['gapn-gaps'];
    return L;
  }
  root.RIDELAB={ declare:declare, walk:walk, doors:doors, people:people, trade:trade, mirror:mirror, CONSIST:CONSIST, SEG:SEG, DWELL:DWELL, RUN:RUN, LOJES:LOJES, USE:USE };
})(typeof window!=='undefined'?window:globalThis);
