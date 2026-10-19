// ================================================================= CORE — simulation 6: the population, from the roles' data
// A settlement's residents are not typed one by one: each ROLE says how many (`count`), which kinds of home it lives in
// (`homes`, in order of preference), the work place it is pinned to (`work: {kinds, act}`, dealt round-robin over the
// places of those kinds that offer `act`), and whether it keeps a boat at a dock (`boat`) or a vehicle at a base
// (`vehicle: {base}`). A role marked `fill` takes every bed the others leave. Beds are a home's SLEEP slots.
// A `homes` entry is a place kind or, when no place has that kind, a place id. A role with `deal:'round'` deals its
// actors round-robin over its homes list (the i-th to homes[i % n]) whatever the beds say: Shade's rule, where a
// quarter holds `cap` people across all its activities and the hourly capacity audit, not a bed count, says they fit.
//
//   SIM.populate({ prefix:'p', boatOf:(actor, homePlace)=>{dock, pier}|null }) -> {actors, byRole, beds, bedsLeft, homeless}
//   Roles that may live in fewer kinds of home are housed first. A role's `variants` (a list of schedules) are dealt
//   round-robin to its actors, so a crowd of one role does not all move at the same hour.
//   Every actor gets id prefix+n, its role's org, a home (place id) and, as the role asks, work / boat / vehicle.
// SETTLEMENTS (P7a, opt-in: a page that made SIM.settlement records): a role's `settlement` keeps its actors' homes in
// that town, and an actor's work is dealt among the places of its home's town only. SIM.populate({settlement}) deals
// only that town's roles over its own beds (call it once a town, each with its own prefix); out.bySettlement counts
// the actors dealt per town. A page without settlements deals exactly as before.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.populate = function(opt){
    opt = opt || {}; var pre = opt.prefix || 'p', n = 0, out = { actors:0, byRole:{}, beds:0, bedsLeft:0, homeless:[] };
    var keyed = !!SIM.R.settlement, only = keyed && opt.settlement!=null ? opt.settlement : null;
    function townOf(P){ return keyed && P && P.settlement!=null ? P.settlement : null; }
    if(keyed) out.bySettlement = {};
    var homes = SIM.all('place').filter(function(P){ return SIM.offers(P, 'SLEEP') > 0 && !P.transient && (only==null || townOf(P)===only); });
    var beds = {}; homes.forEach(function(P){ beds[P.id] = P.activities.SLEEP; out.beds += P.activities.SLEEP; });
    var byKind = {}; homes.forEach(function(P){ (byKind[P.kind]||(byKind[P.kind]=[])).push(P); });
    var workLoad = {};
    function homesOf0(k){ return byKind[k] || (beds[k]!=null ? [SIM.R.place[k]] : []); }
    function homeFor(R){
      var kinds = R.homes || Object.keys(byKind), rt = keyed && R.settlement!=null ? R.settlement : null;
      function homesOf(k){ var L=homesOf0(k); return rt==null ? L : L.filter(function(P){ return townOf(P)===rt; }); }   /* a town's role: its own town's homes */
      if(R.deal==='round' && R.homes && R.homes.length){ var i=out.byRole[R.id]||0, L0=homesOf(kinds[i % kinds.length]); if(!L0.length) return null;
        var P0=L0[Math.floor(i / kinds.length) % L0.length]; if(beds[P0.id] > 0) beds[P0.id]--; return P0; }
      for(var k=0;k<kinds.length;k++){ var L=homesOf(kinds[k]).filter(function(P){ return beds[P.id] > 0; });
        if(L.length){ var P=L[Math.floor(SIM.rng.next()*Math.min(L.length, 6))]; beds[P.id]--; return P; } }
      return null;
    }
    function workFor(R, H){
      var W=R.work; if(!W) return null; var ht=townOf(H);
      var L=SIM.all('place').filter(function(P){ return W.kinds.indexOf(P.kind)>=0 && SIM.offers(P, W.act) > 0 && (ht==null || townOf(P)===ht); });   /* work in the home's own town */
      if(!L.length) return null;
      L.sort(function(p,q){ return ((workLoad[p.id]||0)/SIM.offers(p,W.act)) - ((workLoad[q.id]||0)/SIM.offers(q,W.act)) || (p.id<q.id?-1:1); });
      workLoad[L[0].id] = (workLoad[L[0].id]||0) + 1; return L[0];
    }
    function make(R){
      var H=homeFor(R); if(!H){ out.homeless.push(R.id); return null; }
      var W=workFor(R, H);
      var made=out.byRole[R.id]||0, V=R.variants, a=SIM.actor({ id:pre+(n++), role:R.id, home:H.id, work:W?W.id:undefined, sched:V && V.length ? V[made % V.length] : undefined });
      if(R.boat && opt.boatOf){ var b=opt.boatOf(a, H); if(b) a.boat=b; }
      if(R.vehicle) a.vehicle = { base:R.vehicle.base, n:out.byRole[R.id]||0 };
      out.byRole[R.id]=(out.byRole[R.id]||0)+1; out.actors++; if(out.bySettlement){ var tk=townOf(H); if(tk!=null) out.bySettlement[tk]=(out.bySettlement[tk]||0)+1; } return a;
    }
    /* the most particular first: a role that can live in fewer kinds of home chooses before a broad one */
    var roles = SIM.all('role').filter(function(R){ return !R.transient && (only==null || R.settlement===only); }).sort(function(p,q){ return ((p.homes||[]).length||99) - ((q.homes||[]).length||99) || (p.id<q.id?-1:1); });
    roles.forEach(function(R){ if(R.fill) return; for(var i=0;i<(R.count||0);i++) if(!make(R)) break; });
    roles.forEach(function(R){ if(!R.fill) return; var guard=0; while(guard++ < 5000){ if(!make(R)) break; } });
    out.homeless = out.homeless.filter(function(r){ var R=SIM.R.role[r]; return R && !R.fill; });
    for(var k in beds) out.bedsLeft += beds[k];
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
