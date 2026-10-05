// ================================================================= CORE — simulation 2: places, activities, slots
// A PLACE advertises the activities it offers and how many people each can hold at once (its SLOTS), never a
// coordinate a population is told to walk to. Derived from placed geometry by the build (a house's beds, a shop's
// counter, a dock's net frames), then overridden by the hand-edited JSON.
//
//   SIM.activity({id, indoor?:bool, group?:bool, note?})          the vocabulary (ROADMAP section 26 plus a build's own)
//   SIM.place({id, name, kind, x, z, y?, ry?, door?:{x,z,y?}, layer?:'pedestrian', activities:{ACT:slots},
//              hours?:{ACT:[open,close]}, open?:[h0,h1], indoor?:{ACT:true}|true, org?, faction?, access?, tags?,
//              spots?:[[x,z,y?],...] (where people stand: tables, stalls, the counter), r?:metres (an open place's reach),
//              cap?:n (people present at once over ALL its activities, Shade's quarters: a bed and a seat at the hearth
//              are one person's room. Without it each activity's slots stand alone)})
//   SIM.offers(P, act) -> slots (0 if not offered)            SIM.isOpen(P, act, hour)
//   SIM.free(P, act) -> slots left (within cap)               SIM.reserve(actor, P, act) / SIM.release(actor)
//   SIM.placesFor(act, actor, hour, {near:[x,z], kinds:[...], ids:[...]}) -> candidates, nearest first, open, free and
//                                 letting the actor in (SIM.welcome)
//   SIM.slotsFromFurniture(pieces) -> {ACT: n}: a placed piece's job / type / role read as activity slots (PLAN 4.3)
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.activity = function(o){ if(typeof o==='string') o={ id:o }; return SIM.add('activity', o); };
  SIM.place = function(o){
    if(o.x==null || o.z==null) throw new Error('SIM.place '+o.id+': needs x, z');
    o.layer = o.layer || 'pedestrian'; o.activities = o.activities || {}; o.occ = {}; o.who = {};
    if(!o.door) o.door = { x:o.x, z:o.z, y:o.y||0 };
    return SIM.add('place', o);
  };
  SIM.offers = function(P, act){ return (P.activities && P.activities[act]) || 0; };
  function inHours(h, w){ if(!w) return true; var a=w[0], b=w[1]; return a<=b ? (h>=a && h<b) : (h>=a || h<b); }
  SIM.isOpen = function(P, act, hour){ if(P.closed) return false; var w=(P.hours && P.hours[act]) || P.open; return inHours(hour, w); };
  SIM.free = function(P, act){ var f=SIM.offers(P, act) - (P.occ[act]||0);
    if(P.cap!=null){ var n=0; for(var k in P.occ) n+=P.occ[k]; f=Math.min(f, P.cap-n); } return f; };
  SIM.indoor = function(P, act){ if(P.indoor===true) return true; if(P.indoor && P.indoor[act]!=null) return !!P.indoor[act];
    var A=SIM.R.activity[act]; return !!(A && A.indoor && P.roof!==false); };
  SIM.reserve = function(a, P, act){
    SIM.release(a);
    P.occ[act] = (P.occ[act]||0) + 1; P.who[a.id] = act; a.slot = { place:P.id, act:act, k:P.occ[act]-1 };
  };
  SIM.release = function(a){
    var s=a.slot; if(!s) return; var P=SIM.R.place[s.place]; a.slot=null; if(!P) return;
    P.occ[s.act] = Math.max(0, (P.occ[s.act]||0) - 1); delete P.who[a.id];
  };
  SIM.placesFor = function(act, actor, hour, opt){
    opt = opt || {}; var out=[], near=opt.near, kinds=opt.kinds, ids=opt.ids;
    var list = ids ? ids.map(function(id){ return SIM.R.place[id]; }).filter(Boolean) : SIM.all('place');
    for(var i=0;i<list.length;i++){ var P=list[i];
      if(!SIM.offers(P, act)) continue;
      if(kinds && kinds.indexOf(P.kind)<0) continue;
      if(opt.exclude && opt.exclude[P.id]) continue;
      if(hour!=null && !SIM.isOpen(P, act, hour)) continue;
      if(!opt.ignoreSlots && SIM.free(P, act) <= 0) continue;
      if(actor && SIM.welcome && !SIM.welcome(actor, P)) continue;
      out.push(P); }
    if(near) out.sort(function(p,q){ return (Math.hypot(p.x-near[0],p.z-near[1]) + (p.bias||0)) - (Math.hypot(q.x-near[0],q.z-near[1]) + (q.bias||0)) || (p.id<q.id?-1:1); });
    return out;
  };
  /* furniture -> slots. A catalog piece carries `job` (FURN_JOBS) or a `type` / interiors walker target type */
  SIM.FURN_ACT = { bed:'SLEEP', mat:'SLEEP', bunk:'SLEEP', seat:'EAT', chair:'EAT', bench:'SOCIALIZE', stool:'DRINK', table:'EAT',
    counter:'KEEP_SHOP', stall:'SELL', stove:'COOK', hearth:'COOK', desk:'STUDY', altar:'WORSHIP', shrine:'WORSHIP',
    forge:'CRAFT', anvil:'CRAFT', loom:'WEAVE', smithing:'CRAFT', fishing:'MEND_NETS', farming:'FARM', carpentry:'CRAFT', milling:'CRAFT' };
  SIM.slotsFromFurniture = function(pieces){
    var out={}; (pieces||[]).forEach(function(p){ var a = SIM.FURN_ACT[p.job] || SIM.FURN_ACT[p.type] || SIM.FURN_ACT[p.role]; if(a) out[a]=(out[a]||0)+(p.seats||1); });
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
