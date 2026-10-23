// ================================================================= CORE — simulation 7: what things hold, the settlement's stocks
// ROADMAP.md section 10 (the owner, 2026-10-14: "what things hold, and the settlement's stocks"). Read only: nothing
// here changes a record or draws a number, so a world decides exactly as before. It reads the economy's stores
// (77-sim-6-economy.js) and the items' holders (77-sim-6-items.js); with neither on, SIM.stocks() is null.
//
//   SIM.contents(id) -> {id, type:'place'|'actor'|'group', name, items:[{item, n, state, as, wear?, life?, workLife?, slot?}], ...}
//                       or null for an id no record has. A place: its store's stock (store:{kind, cap, held, state}),
//                       what it makes from what (makes, inputs), its household's food (household:{people, servings,
//                       days}), what it sells (sells; its shelf is the warehouses, `shelf`), a mess. An actor: what it
//                       wears (wear 0..1 of its `life` in days), its tool (of its `workLife` in worked hours), what it
//                       keeps at home (inv), a cart's load; its household's food and its group's load beside. A group (a
//                       carrier): the lot it brings in, the cargo it takes out.
//   SIM.stocks()     -> {minute, order:[item ids], by:{item: row}, day, today, households, rule} or null. A row: total,
//                       production, transit, storage, owned, ordered; days of cover and use a day (a good); `day` and
//                       `today`: the change of the total and the flows over the last day and since midnight; `low`,
//                       `out`, `wanting` (the marks: see below)
//   SIM.holders(item, top) -> {item, count, total, list:[{id, type, name, state, n, as}]}: who holds it, most first
//   SIM.placeAt(x, z, r)   -> the id of the nearest place that holds anything within its reach (or r metres), or null
//   SIM.whereIs(id, t)     -> {x, y, z} of a place, an actor (its pose at motion time t) or a group (its leader's)
//   SIM.stocksStep(minute) / SIM.stocksJump(minute)    SIM.step's and SIM.jump's: the daily snapshot
//
// THE STATES. `production`: in the store of a place with a recipe (made, not yet moved: a field's crop, a bakery's
// bread, a herd's milk, a slaughter's meat). `transit`: a cart's load, a carrier's load (a caravan, a barge or a ship
// bringing a lot in, or taking an export out, while the group is on the map), and a lot landed at a carrier's
// unloading place (a site store with no recipe: the caravanserai, a quay, a pier) waiting for the carts. `storage`:
// the warehouses (the settlement's store: warehouse buildings, granaries) and the households' food stores. `owned`:
// what people wear, keep at home and work with (the items module's things). `ordered`, apart from the total: an
// import sent for by timer (no carrier on the map). A shop has no shelf of its own: it sells from the warehouses.
// THE DAY. At the first step of each world day the totals and the economy's and the items' running counters are
// snapshot; `day` is the last two snapshots' difference (from one midnight to the next; `partial` when the first began
// mid-day, `jumped` when the clock jumped in between), `today` the current state's against the last snapshot. A good's
// flows: made, imported (when it enters the map: a carrier's lot from its arrival on the map, as the total counts it in
// transit; a timer's on landing), exported (when it leaves the map: a carrier's cargo counts in transit until its group
// is gone), used (drawn from the warehouses or a site's own store:
// purchases, meals out, inputs, and a household's food bought, which is a move, not a use), stocked (food bought into
// the households' stores), eaten (meals at home from those stores), consumed = used - stocked + eaten. An item's:
// bought, issued (a slave's keeper), worn out, broken (a tool), consumed = worn + broken.
// THE MARKS. `low`: a good whose warehoused stock lasts fewer days than the economy's import threshold (`imports.days`:
// the sim's own "send for more"; SIM.economyDays: the stock over its use a day). `out`: a draw on the warehouses or a
// purchase that went unmet over the last day or today (the economy's `short`, the items' `outOf`). `wanting`: the
// citizens short of it now (a kept set short, a tool broken), the items' own demand.
(function(root){
  'use strict';
  var SIM = root.SIM;
  SIM.STOCKS = null;
  var POS = ['head', 'torso', 'torso+', 'legs', 'legs+', 'feet', 'lhand', 'rhand'], STATES = ['production', 'transit', 'storage', 'owned'];
  var CUM = { made:'E', used:'E', imported:'E', exported:'E', short:'E', bought:'I', eaten:'I', worn:'I', issued:'I', brokenBy:'I', outOf:'I' };
  function round(v){ return Math.round(v*100)/100; }
  function storeState(P){ var E=SIM.ECON; if(!E || !E.stores[P.id]) return null; if(P.storeKind==='warehouse') return 'storage'; return E.recipes[P.id] ? 'production' : 'transit'; }
  var AS = { production:'made here, not yet hauled', transit:'landed, waiting for the carts', storage:'in store' };
  function shipOf(gid){ var E=SIM.ECON; if(!E) return null; for(var i=0;i<E.inflight.length;i++){ var s=E.inflight[i]; if(s.group===gid && !s.done) return s; } return null; }
  function held(P){ var n=0; for(var g in P.stock) n+=P.stock[g]; return n; }
  function nameOf(id){ var P=SIM.R.place[id]; if(P) return P.name || P.kind; var A=SIM.R.actor[id]; if(A){ var R=SIM.R.role[A.role]; return (R && R.name) || A.role; }
    var G=SIM.R.group[id]; return G ? G.kind : String(id); }

  /* ---------------------------------------------------------------- one record's contents */
  function placeContents(P){
    var E=SIM.ECON, I=SIM.ITEMS, out={ id:P.id, type:'place', name:P.name || P.kind, kind:P.kind, items:[] };
    if(E && E.stores[P.id]){ var st=storeState(P);
      out.store={ kind:P.storeKind, cap:P.cap===Infinity ? null : P.cap, held:held(P), state:st };
      Object.keys(P.stock).sort().forEach(function(g){ if(P.stock[g]>0) out.items.push({ item:g, n:P.stock[g], state:st, as:AS[st] }); });
      var R=E.recipes[P.id];
      if(R){ var mk=[]; R.out.concat(R.herd ? R.herd.out : []).forEach(function(g){ if(mk.indexOf(g)<0) mk.push(g); }); out.makes=mk; out.inputs={};
        mk.forEach(function(g){ if(E.inputs[g]) out.inputs[g]=Object.assign({}, E.inputs[g]); }); if(R.herd) out.herd=true; }
      out.carts=E.carts.filter(function(a){ return a.cart.site===P.id || (a.cart.phase==='toWarehouse' && a.cart.wh===P.id); }).length; }
    if(P.store){ var tot=0; Object.keys(P.store).sort().forEach(function(f){ if(P.store[f]>0){ out.items.push({ item:f, n:P.store[f], state:'storage', as:'household food' }); tot+=P.store[f]; } });
      var per=I ? (P.people || 1)*I.meals*I.perMeal : 0; out.household={ people:P.people || 0, servings:round(tot), days:per ? round(tot/per) : null, low:I ? I.low : null }; }
    if(P.mess) out.mess=true;
    if(I && I.sells[P.id]){ out.sells=I.sells[P.id].slice(); out.shelf=E ? 'warehouses' : 'abstract'; }
    return out;
  }
  function groupContents(G){
    var out={ id:G.id, type:'group', name:G.kind, kind:G.kind, members:(G.members || []).length, items:[] }, s=shipOf(G.id);
    if(s) out.items.push({ item:s.good, n:s.n, state:'transit', as:'its load, coming in' });
    if(G.cargo && G.cargo.n>0) out.items.push({ item:G.cargo.good, n:G.cargo.n, state:'transit', as:'its cargo, going out (exported)' });
    return out;
  }
  function actorContents(a){
    var I=SIM.ITEMS, out={ id:a.id, type:'actor', name:nameOf(a.id), role:a.role, items:[], home:a.home || null };
    if(I){
      POS.forEach(function(p){ var e=a.eq && a.eq[p]; if(!e) return; var K=I.kinds[e.k] || {}; out.items.push({ item:e.k, n:1, state:'owned', as:'worn', slot:p, wear:round(e.w), life:K.life || null }); });
      if(a.tool){ var Kt=I.kinds[a.tool.k] || {}; out.items.push({ item:a.tool.k, n:1, state:'owned', as:'tool', wear:round(a.tool.w), workLife:Kt.workLife || null }); }
      Object.keys(a.inv || {}).sort().forEach(function(k){ if(a.inv[k]>0) out.items.push({ item:k, n:a.inv[k], state:'owned', as:'kept at home' }); });
      if(a.toolRack) out.toolRack=true; if(a.toolNeed) out.toolNeed=a.toolNeed; if(a.issued) out.issued=true;
    }
    if(a.cart){ out.cart={ phase:a.cart.phase, site:a.cart.site || null, to:a.cart.phase==='toWarehouse' ? a.cart.wh : null };
      if(a.cart.load && a.cart.load.n>0) out.items.push({ item:a.cart.load.good, n:a.cart.load.n, state:'transit', as:'its load' }); }
    var H=a.home && SIM.R.place[a.home];
    if(H && (H.store || H.mess)){ var hc=placeContents(H); out.household={ id:H.id, mess:!!H.mess, people:hc.household ? hc.household.people : H.people || 0, days:hc.household ? hc.household.days : null,
      items:hc.items.filter(function(e){ return e.as==='household food'; }) }; }
    var G=a.group && SIM.R.group[a.group]; if(G){ var gc=groupContents(G); out.group={ id:G.id, kind:G.kind, items:gc.items }; }
    return out;
  }
  SIM.contents = function(id){
    if(id==null) return null;
    var P=SIM.R.place[id]; if(P) return placeContents(P);
    var A=SIM.R.actor[id]; if(A) return actorContents(A);
    var G=SIM.R.group[id]; if(G) return groupContents(G);
    return null;
  };

  /* ---------------------------------------------------------------- the tally: every holder once */
  /* -> {T:{item:{production, transit, storage, owned, ordered}}, H:[holders of `want`], wanting:{item:n}, homes:{n, low, empty}} */
  function tally(want){
    var E=SIM.ECON, I=SIM.ITEMS, T={}, H=want!=null ? {} : null, wanting={}, homes={ n:0, low:0, empty:0 };
    var town=SIM.ECONS && E ? E.settlement : null, mine=function(x){ return town==null || SIM.settlementOf(x)===town; };   /* a keyed page: this town's own (P7a) */
    function row(k){ return T[k] || (T[k]={ production:0, transit:0, storage:0, owned:0, ordered:0 }); }
    function put(k, st, n, id, type, as){ if(!(n>0)) return; row(k)[st]+=n;
      if(H && k===want){ var h=H[id] || (H[id]={ id:id, type:type, name:nameOf(id), state:st, n:0, as:[] }); h.n+=n; if(h.as.indexOf(as)<0) h.as.push(as); } }
    if(E) Object.keys(E.stores).forEach(function(id){ var P=E.stores[id], st=storeState(P); for(var g in P.stock) put(g, st, P.stock[g], id, 'place', AS[st]); });
    SIM.all('place').forEach(function(P){ if(!P.store || !mine(P)) return; var tot=0; for(var f in P.store){ put(f, 'storage', P.store[f], P.id, 'place', 'household food'); tot+=P.store[f]>0 ? P.store[f] : 0; }
      if(P.people && I){ homes.n++; if(tot<=0) homes.empty++; else if(tot < P.people*I.meals*I.perMeal*I.low) homes.low++; } });
    SIM.all('actor').forEach(function(a){
      if(!mine(a)) return;   /* a cart too: it is its home town's economy's */
      if(a.cart && a.cart.load) put(a.cart.load.good, 'transit', a.cart.load.n, a.id, 'actor', 'cart load');
      if(!I) return;
      if(a.eq) for(var i=0;i<POS.length;i++){ var e=a.eq[POS[i]]; if(e) put(e.k, 'owned', 1, a.id, 'actor', 'worn'); }
      if(a.tool) put(a.tool.k, 'owned', 1, a.id, 'actor', 'tool');
      if(a.inv) for(var k in a.inv) put(k, 'owned', a.inv[k], a.id, 'actor', 'kept at home');
      if(a.toolNeed) wanting[a.toolNeed]=(wanting[a.toolNeed] || 0)+1;
      if(a.wears) a.wears.forEach(function(k){ var keep=(a.keep && a.keep[k]) || a.sets || 1; if(SIM.owns(a, k)<keep) wanting[k]=(wanting[k] || 0)+1; });
    });
    if(E){ E.inflight.forEach(function(s){ if(s.done) return; if(s.group && SIM.R.group[s.group]) put(s.good, 'transit', s.n, s.group, 'group', 'load coming in'); else row(s.good).ordered+=s.n; });
      SIM.all('group').forEach(function(G){ if(G.cargo && G.cargo.n>0 && (town==null || G.cargo.settlement===town)) put(G.cargo.good, 'transit', G.cargo.n, G.id, 'group', 'cargo going out'); }); }
    var list=null; if(H){ list=Object.keys(H).map(function(id){ var h=H[id]; h.as=h.as.join(', '); h.n=round(h.n); return h; }); }
    return { T:T, H:list, wanting:wanting, homes:homes };
  }
  function totalOf(r){ return r ? r.production+r.transit+r.storage+r.owned : 0; }
  function universe(T){
    var E=SIM.ECON, I=SIM.ITEMS, ids=[], seen={}; function add(k){ if(!seen[k]){ seen[k]=1; ids.push(k); } }
    if(E) Object.keys(E.goods).forEach(add);
    if(I) Object.keys(I.kinds).forEach(function(k){ if(I.kinds[k].cat!=='meal') add(k); });
    Object.keys(T).forEach(add);   /* anything held that neither names */
    return ids;
  }
  /* the running counters; imported and exported as the total sees them: a carrier's lot on the map counts as come in,
     a carrier's cargo on the map as not yet gone (the economy counts them on landing and on loading), so that over any
     span change = made + imported - exported - consumed */
  function counters(){ var E=SIM.ECON, I=SIM.ITEMS, c={}, IS=I && (SIM.ECONS && E && E.settlement!=null ? ((I.statsBy || {})[E.settlement] || {}) : I.stats);   /* a keyed page: the items' books of this town */
    Object.keys(CUM).forEach(function(k){ var src=CUM[k]==='E' ? (E && E[k]) : (IS && IS[k]); c[k]=Object.assign({}, src || {}); });
    if(E){ E.inflight.forEach(function(s){ if(!s.done && s.group && SIM.R.group[s.group]) c.imported[s.good]=(c.imported[s.good] || 0)+s.n; });
      SIM.all('group').forEach(function(G){ if(G.cargo && G.cargo.n>0 && (!SIM.ECONS || G.cargo.settlement===E.settlement)) c.exported[G.cargo.good]=(c.exported[G.cargo.good] || 0)-G.cargo.n; }); }
    return c; }
  function snap(minute, S){ var t=tally(null), tot={}; Object.keys(t.T).forEach(function(k){ tot[k]=totalOf(t.T[k]); }); return { minute:minute, tot:tot, cum:counters(), skipped:S.skipped }; }
  function state(){ if(SIM.ECONS) return keyedState(); var S=SIM.STOCKS; if(!S || S.econ!==SIM.ECON || S.items!==SIM.ITEMS) S=SIM.STOCKS={ econ:SIM.ECON, items:SIM.ITEMS, snaps:[], day:null, last:null, skipped:0 }; return S; }
  /* a settlement's own snapshots (P7a: keyed economies), kept on its economy */
  function keyedState(){ var E=SIM.ECON, S=E._stocks; if(!S || S.items!==SIM.ITEMS) S=E._stocks={ econ:E, items:SIM.ITEMS, snaps:[], day:null, last:null, skipped:0 }; return S; }

  /* ---------------------------------------------------------------- the daily snapshot (SIM.step, SIM.jump) */
  SIM.stocksStep = function(minute){
    if(!SIM.ECON && !SIM.ITEMS) return; var S=state(), d=Math.floor(minute/1440);
    if(S.day!==d){ S.day=d; S.snaps.push(snap(minute, S)); if(S.snaps.length>3) S.snaps.shift(); }
    S.last=minute;
  };
  /* a jump forward by more than a minute or back at all: the day it falls in is not a day of flows */
  SIM.stocksJump = function(minute){ var S=SIM.ECONS ? SIM.ECON && SIM.ECON._stocks : SIM.STOCKS; if(!S || S.last==null) return; if(minute-S.last>1 || minute<S.last) S.skipped++; S.last=minute; };

  /* ---------------------------------------------------------------- the stocks */
  function flows(a, b, k, isGood, isFood){   /* the change and the flows of item k between two snapshots */
    var d=function(c){ return ((b.cum[c] || {})[k] || 0) - ((a.cum[c] || {})[k] || 0); }, f={ change:round((b.tot[k] || 0)-(a.tot[k] || 0)) };
    if(isGood){ f.made=d('made'); f.imported=d('imported'); f.exported=d('exported'); f.used=d('used');
      if(isFood){ f.stocked=d('bought'); f.eaten=d('eaten'); } f.consumed=round(f.used-(f.stocked || 0)+(f.eaten || 0)); f.unmet=d('short')+d('outOf'); }
    else{ f.bought=d('bought'); f.issued=d('issued'); f.worn=d('worn'); f.broken=d('brokenBy'); f.consumed=f.worn+f.broken; f.unmet=d('outOf');
      if(isFood){ f.eaten=d('eaten'); f.consumed+=f.eaten; } }
    return f;
  }
  SIM.stocks = function(){
    var E=SIM.ECON, I=SIM.ITEMS; if(!E && !I) return null;
    var S=state(), t=tally(null), m=SIM.minute(), ids=universe(t.T), now={ minute:m, tot:{}, cum:counters(), skipped:S.skipped };
    ids.forEach(function(k){ now.tot[k]=totalOf(t.T[k]); });
    var sn=S.snaps, last=sn[sn.length-1] || null, prev=sn[sn.length-2] || null, by={};
    ids.forEach(function(k){
      var r=t.T[k] || { production:0, transit:0, storage:0, owned:0, ordered:0 }, K=I && I.kinds[k], isGood=!!(E && E.goods[k]), isFood=!!(K && K.food);
      var o={ item:k, cat:K ? K.cat : 'good', good:isGood, madeOf:K && K.good ? K.good : null, total:round(totalOf(r)), production:round(r.production), transit:round(r.transit), storage:round(r.storage), owned:round(r.owned), ordered:round(r.ordered) };
      if(isGood){ var use=SIM.economyUse(k), st=SIM.stockOf(k); o.use=round(use); o.days=use>0 ? round(st/use) : null; o.low=o.days!=null && o.days<E.imports.days; }
      o.day=prev && last ? flows(prev, last, k, isGood, isFood) : null;
      o.today=last ? flows(last, now, k, isGood, isFood) : null;
      o.wanting=t.wanting[k] || 0;
      o.out=!!((o.day && o.day.unmet>0) || (o.today && o.today.unmet>0));
      by[k]=o; });
    var pt=function(s){ return s.minute%1440!==0; };
    return { minute:m, order:ids, by:by, households:t.homes,
      day:prev && last ? { from:prev.minute, to:last.minute, partial:pt(prev), jumped:last.skipped!==prev.skipped } : null,
      today:last ? { from:last.minute, to:m, jumped:S.skipped!==last.skipped } : null,
      rule:{ lowDays:E ? E.imports.days : null } };
  };
  SIM.holders = function(item, top){
    var t=tally(item), L=t.H.sort(function(p, q){ return q.n-p.n || (p.id<q.id ? -1 : 1); });
    return { item:item, count:L.length, total:round(totalOf(t.T[item])), list:L.slice(0, top==null ? 10 : top) };
  };
  SIM.placeAt = function(x, z, r){
    var E=SIM.ECON, I=SIM.ITEMS, best=null, bd=Infinity;
    SIM.all('place').forEach(function(P){
      if(!((E && E.stores[P.id]) || P.store || P.mess || (I && I.sells[P.id]))) return;
      var d=Math.hypot(P.x-x, P.z-z), lim=Math.max(P.r || 0, r==null ? 12 : r); if(d<=lim && d<bd){ bd=d; best=P.id; } });
    return best;
  };
  SIM.whereIs = function(id, t){
    var P=SIM.R.place[id]; if(P) return { x:P.x, y:P.y || 0, z:P.z };
    var a=SIM.R.actor[id], G=SIM.R.group[id]; if(!a && G) a=SIM.R.actor[G.leader || G.members[0]];
    if(!a) return null;
    if(a.present){ var p=SIM.pose(a, t==null ? SIM.time() : t, { cheap:true }); if(p) return { x:p.x, y:p.y || 0, z:p.z }; }
    var H=a.home && SIM.R.place[a.home]; return H ? { x:H.x, y:H.y || 0, z:H.z } : null;
  };
  /* ---------------------------------------------------------------- by settlement (P7a) */
  /* On a page that keys its economies (77-sim-6-economy.js SIM.settlement): SIM.stocks(s) is settlement s's own stocks,
     SIM.stocksBy() every settlement's, and the daily snapshot is taken for each in turn. An unkeyed page is as before.
     Each town counts only its own households' food and its own people's things (their home's town), and its item flows
     from the items module's books by town (I.statsBy). With trade between settlements (77-sim-6-trade.js) a good's row
     also carries `inbound` and `outbound`: units at sea toward and from the town, in neither town's total. */
  var stocks0=SIM.stocks, step0=SIM.stocksStep, jump0=SIM.stocksJump;
  SIM.stocks = function(s){ if(!SIM.ECONS || s==null) return stocks0(); return SIM.withEcon(s, function(){ var o=stocks0();
    if(o && SIM.TRADE) o.order.forEach(function(k){ var r=o.by[k]; if(!r.good) return; r.inbound=SIM.tradeInbound(k, s); r.outbound=SIM.tradeOutbound(k, s); });
    return o; }); };
  SIM.stocksBy = function(){ if(!SIM.ECONS) return null; var out={}; SIM.ECON_ORDER.forEach(function(k){ out[k]=SIM.stocks(k); }); return out; };
  SIM.stocksStep = function(minute){ if(!SIM.ECONS) return step0(minute); SIM.ECON_ORDER.forEach(function(k){ SIM.withEcon(k, function(){ step0(minute); }); }); };
  SIM.stocksJump = function(minute){ if(!SIM.ECONS) return jump0(minute); SIM.ECON_ORDER.forEach(function(k){ SIM.withEcon(k, function(){ jump0(minute); }); }); };
})(typeof window!=='undefined'?window:globalThis);
