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
//   SIM.placesFor(act, actor, hour, {near:[x,z], kinds:[...], ids:[...], limit}) -> candidates, nearest first, open, free
//                                 and letting the actor in (SIM.welcome). With `limit` and `near` (and no ids) only the
//                                 nearest `limit` are returned, found on a grid of the places (rings out from `near`):
//                                 exactly the first `limit` of the full list, without looking at every place (a grid per
//                                 activity; a host that changes places' activities after searching calls SIM.placesChanged());
//                                 `maxR` (metres) stops the search there (nothing farther is returned). An EMPTY answer is
//                                 remembered for the rest of the simulated minute for its grid cell, activity, hour, kinds
//                                 and org (a crowd of 20,000 finding every tavern full asks once per cell, not once each)
//   SIM.slotsFromFurniture(pieces, map?) -> {ACT: n}: a placed piece's job / type / role read as activity slots (PLAN 4.3);
//                                 map: a world's own {job|type|role: ACT} over SIM.FURN_ACT
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
  function passes(P, act, actor, hour, opt){
    if(!SIM.offers(P, act)) return false;
    if(opt.kinds && opt.kinds.indexOf(P.kind)<0) return false;
    if(opt.exclude && opt.exclude[P.id]) return false;
    if(hour!=null && !SIM.isOpen(P, act, hour)) return false;
    if(!opt.ignoreSlots && SIM.free(P, act) <= 0) return false;
    if(actor && SIM.welcome && !SIM.welcome(actor, P, act)) return false;
    return true;
  }
  function byNear(near){ return function(p,q){ return (Math.hypot(p.x-near[0],p.z-near[1]) + (p.bias||0)) - (Math.hypot(q.x-near[0],q.z-near[1]) + (q.bias||0)) || (p.id<q.id?-1:1); }; }
  /* a grid per activity of the places offering it, rebuilt when places are added or removed, or when a host says their
     activities changed (SIM.placesChanged()); a place with a `bias` makes the nearest-first order not a distance, so
     the grid stands aside. An activity no place offers is answered at once. A private place (a home) is not on the grids:
     its own people reach it by their pins (it lets no one else in), but for an activity it takes guests for (`guests:
     {ACT: metres}`: a house the neighbours visit) it is on that activity's grid */
  var GRIDS={}, GSIG=null, GCELL=120, EMPTY={ m:null, k:{} };
  SIM.placesChanged = function(){ SIM.placeVersion=(SIM.placeVersion||0)+1; EMPTY={ m:null, k:{} }; };
  function grid(act){
    var sig=SIM.order.place.length+':'+(SIM.placeVersion||0);
    if(GSIG!==sig){ GRIDS={}; GSIG=sig; }
    if(GRIDS[act]) return GRIDS[act];
    var G={ cells:{}, n:0, x0:Infinity, x1:-Infinity, z0:Infinity, z1:-Infinity, bias:false };
    SIM.all('place').forEach(function(P){ if(!SIM.offers(P, act) || (P.access==='private' && !(P.guests && P.guests[act]))) return; var k=Math.floor(P.x/GCELL)+','+Math.floor(P.z/GCELL); (G.cells[k]||(G.cells[k]=[])).push(P); G.n++;
      if(P.bias) G.bias=true; G.x0=Math.min(G.x0,P.x); G.x1=Math.max(G.x1,P.x); G.z0=Math.min(G.z0,P.z); G.z1=Math.max(G.z1,P.z); });
    return (GRIDS[act]=G);
  }
  SIM.placesFor = function(act, actor, hour, opt){
    opt = opt || {}; var out=[], near=opt.near, ids=opt.ids;
    if(opt.limit && near && !ids){ var G=grid(act); if(!G.n) return out; if(!G.bias){
      var ek=null; if(!opt.exclude || !Object.keys(opt.exclude).length){ ek=act+'|'+hour+'|'+Math.floor(near[0]/GCELL)+','+Math.floor(near[1]/GCELL)+'|'+(opt.kinds||'')+'|'+(actor&&actor.org||'')+'|'+opt.maxR;
        var mm=SIM.host ? SIM.minute() : 0; if(EMPTY.m!==mm){ EMPTY={ m:mm, k:{} }; } if(EMPTY.k[ek]) return out; }
      /* rings of cells out from `near`: once `limit` are found, a ring whose inner edge lies past the limit-th distance
         cannot change the first `limit`, so stop there */
      var ci=Math.floor(near[0]/GCELL), cj=Math.floor(near[1]/GCELL), D=function(P){ return Math.hypot(P.x-near[0], P.z-near[1]); };
      var rmax=Math.ceil(Math.max(Math.abs(near[0]-G.x0), Math.abs(near[0]-G.x1), Math.abs(near[1]-G.z0), Math.abs(near[1]-G.z1))/GCELL)+1;
      for(var r=0;r<=rmax;r++){
        for(var i=ci-r;i<=ci+r;i++) for(var j=cj-r;j<=cj+r;j++){ if(r && i>ci-r && i<ci+r && j>cj-r && j<cj+r) continue;
          var C=G.cells[i+','+j]; if(!C) continue; for(var q=0;q<C.length;q++) if(passes(C[q], act, actor, hour, opt)) out.push(C[q]); }
        if(out.length>=opt.limit){ out.sort(byNear(near)); if(D(out[opt.limit-1]) < r*GCELL) break; }
        if(opt.maxR!=null && r*GCELL > opt.maxR) break;
      }
      out.sort(byNear(near)); if(opt.maxR!=null) out=out.filter(function(P){ return D(P) <= opt.maxR; });
      if(!out.length && ek) EMPTY.k[ek]=1;
      return out.slice(0, opt.limit);
    } }
    var list = ids ? ids.map(function(id){ return SIM.R.place[id]; }).filter(Boolean) : SIM.all('place');
    for(var k=0;k<list.length;k++) if(passes(list[k], act, actor, hour, opt)) out.push(list[k]);
    if(near) out.sort(byNear(near));
    return out;
  };
  /* furniture -> slots. A catalog piece carries `job` (FURN_JOBS) or a `type` / interiors walker target type */
  SIM.FURN_ACT = { bed:'SLEEP', mat:'SLEEP', bunk:'SLEEP', seat:'EAT', chair:'EAT', bench:'SOCIALIZE', stool:'DRINK', table:'EAT',
    counter:'KEEP_SHOP', stall:'SELL', stove:'COOK', hearth:'COOK', desk:'STUDY', altar:'WORSHIP', shrine:'WORSHIP',
    forge:'CRAFT', anvil:'CRAFT', loom:'WEAVE', smithing:'CRAFT', fishing:'MEND_NETS', farming:'FARM', carpentry:'CRAFT', milling:'CRAFT' };
  /* map: a world's own vocabulary over SIM.FURN_ACT (Voth's city: a rack is DRAW_TOOLS, a well DRINK, a tomb HONOUR);
     a key it maps to null is no activity there */
  SIM.slotsFromFurniture = function(pieces, map){
    var M = map ? Object.assign({}, SIM.FURN_ACT, map) : SIM.FURN_ACT, out={};
    (pieces||[]).forEach(function(p){ var a = M[p.job] || M[p.type] || M[p.role]; if(a) out[a]=(out[a]||0)+(p.seats||1); });
    return out;
  };
})(typeof window!=='undefined'?window:globalThis);
