// ================================================================= CORE — simulation 8: the export ('krator-sim')
// PLAN.md Phase 7: everything the simulation knows, as data, in the same record shapes world/*.json uses, so an export
// can be edited and dropped back in as the overlay. The convention block is the atmos / biome / Yuni exports' own.
//
//   SIM.export({log:n, nav:true}) -> {format:'krator-sim', version, convention, clock, activities, factions, orgs,
//        relations, presence, places, roles, actors, groups, events, ports, transports, nav, log}
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
})(typeof window!=='undefined'?window:globalThis);
