// ================================================================= CORE — simulation 8: the export ('krator-sim')
// PLAN.md Phase 7: everything the simulation knows, as data, in the same record shapes world/*.json uses, so an export
// can be edited and dropped back in as the overlay. The convention block is the atmos / biome / Yuni exports' own.
//
//   SIM.export({log:n, nav:true}) -> {format:'krator-sim', version, convention, clock, activities, factions, orgs,
//        relations, presence, places, roles, actors, groups, events, ports, transports, nav, log}
//   SIM.exportMotion({times, actors}) -> {t, times, actors, routes, rows}: the motion a port replays (core/simulation/
//        ksim.gd, KSim.pose): every actor's baked task (its legs: a route by index, speed, duration, back, side, mode; the
//        spot it idles at, the wander), its pose fields (pos, the home's door, at, h0, present, inVehicle), the routes once
//        each (points, cumulative lengths, length), and the trace: SIM.pose of every actor at `times` (motion seconds after
//        now; default 0, 7.5, 45, 300, 1200, 5000) as rows [t, actor index, hidden, moving, x, y, z, h]. `actors`: the
//        actors to take (default all). Lifted from Dhelv's export (settlements/dhelv/src/92-dhelv-export.js) on 2026-10-20
//        for the isle demo (P8); Dhelv's parts come out as before.
(function(root){
  'use strict';
  var SIM = root.SIM;
  var RUNTIME = { occ:1, who:1, fired:0, next:1, task:1, slot:1, mem:1, pos:1, wanted:1, plan:1, planI:1, k:1, at:1, inVehicle:1, h0:1, fi:1 };
  function clean(r){ var o={}; for(var k in r){ if(RUNTIME[k] || typeof r[k]==='function') continue; o[k]=r[k]; } return o; }
  SIM.export = function(opt){
    opt = opt || {};
    var out = { format:'krator-sim', version:1,
      convention:{ units:'metres', up:'+Y', x:'east', z:'south', handedness:'right', angles:'radians about +Y (atan2(dx,dz))', time:'world minutes (day*1440+minute) for decisions, motion seconds for poses' },
      clock:{ minute:SIM.minute(), hour:SIM.hour(), seed:SIM.seed } };
    ['activity','faction','org','relation','presence','place','role','event','port'].forEach(function(k){ out[k==='activity'?'activities':k==='presence'?'presence':k+'s'] = SIM.all(k).map(clean); });
    out.actors = SIM.all('actor').filter(function(a){ return !a.transient; }).map(function(a){ return { id:a.id, role:a.role, org:a.org, faction:a.faction, home:a.home||null, work:a.work||null }; });
    out.transports = SIM.all('transport').map(function(R){ return { id:R.id, layer:R.layer, stops:R.stops.slice(), vehicle:R.vehicle, vehicles:R.vehicles, speed:R.speed, dwell:R.dwell, phase:R.phase, capacity:R.capacity, faction:R.faction, org:R.org, period:R.period, segments:R.segments }; });
    out.groups = SIM.all('group').map(function(G){ return { id:G.id, kind:G.kind, org:G.org, event:G.event, members:G.members.slice(), from:G.from, to:G.to, beasts:G.beasts, phase:G.phase }; });
    out.nav = {};
    Object.keys(SIM.nav.layers).forEach(function(k){ var L=SIM.nav.layers[k];
      out.nav[k] = L.kind==='graph' && opt.nav!==false ? { kind:'graph', nodes:L.nodes.map(function(n){ return { id:n.id, x:+n.x.toFixed(2), y:+(n.y||0).toFixed(2), z:+n.z.toFixed(2), tag:n.tag }; }),
        edges:L.edges.map(function(e){ return { a:e.a, b:e.b, kind:e.kind, len:+(e.len||0).toFixed(2), w:e.w==null?null:e.w }; }) } : { kind:L.kind }; });
    out.log = SIM.LOG.slice(-(opt.log==null?500:opt.log));
    return out;
  };
  SIM.exportMotion = function(opt){
    opt = opt || {};
    const A=opt.actors||SIM.all('actor'),routes=[],rIdx=new Map(),t=SIM.time(),T=(opt.times||[0,7.5,45,300,1200,5000]).map(d=>t+d);
    const rt=R=>{if(!rIdx.has(R)){rIdx.set(R,routes.length);routes.push({pts:R.pts.map(p=>[p[0],p[1],p[2]]),cum:R.cum.slice(),len:R.len});}return rIdx.get(R);};
    const actors=A.map((a,i)=>{const H=SIM.R.place[a.home],o={i,id:a.id,role:a.role,k:a.k||0,present:!!a.present,h0:a.h0||0,inVehicle:a.inVehicle||null,
      pos:a.pos?{x:a.pos.x,y:a.pos.y||0,z:a.pos.z}:null,homeDoor:H&&H.door?{x:H.door.x,y:H.door.y||0,z:H.door.z}:null,at:a.at||null,task:null};
     const K=a.task;if(K)o.task={t0:K.t0,spot:K.spot?{x:K.spot.x,y:K.spot.y||0,z:K.spot.z}:null,wander:K.wander||0,indoor:!!K.indoor,
      legs:K.legs.map(L=>({route:rt(L.route),speed:L.speed,dur:L.dur,back:L.back||0,side:L.side||0,mode:L.mode||'walk'}))};
     return o;});
    const rows=[];for(const tt of T)A.forEach((a,i)=>{const p=SIM.pose(a,tt);rows.push([tt,i,p.hidden?1:0,p.moving?1:0,p.x,p.y,p.z,p.h]);});
    return {t,times:T,actors,routes,rows};
  };
})(typeof window!=='undefined'?window:globalThis);
