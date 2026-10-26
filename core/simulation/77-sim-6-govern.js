// ================================================================= CORE — simulation 6: the economy's rules (governor, spoilage, keeping, seasoning)
// Proved on the isle demo (settlements/isle-demo 49, 2026-10-19: the owner's go-ahead after a forked session's survey of
// economy balancing) and lifted here (2026-10-26) so the next settlement takes them, not a copy. Opt-in per economy:
// nothing here runs until an economy's config names a rule; an economy without one keeps its books exactly as before.
//
//   SIM.economy({ ...,
//     govern: { every, cover, ti, alpha, min, max, smooth?, window?, minBy?:{good: floor}, buys?:{good: a day}, least?:{good: n} },
//     spoil:  { good: share of its stock that rots a night },
//     keep:   { by (the preserving good: 'salt'), goods:[the goods it keeps], share (of what would rot), per (servings a unit keeps) },
//     season: { by (the seasoning good: 'salt'), mult (a meal's quality while the town holds it), least? (1) } }, {settlement})
//   SIM.economyRules(minute)       SIM.step's last act, after the world's own minute (SIM.stepHooks): every economy's
//                                  governor, then its spoilage, then its seasoning, each in the economies' order
//   SIM.economyGoverned(s?)  -> {good: {use, pos, cap, mult, target}}   the governor's last look (its demand a day, its
//                                  supply line, what the town makes at the full rate, the multiplier it set, its target)
//   SIM.economySeasoned(s?)  -> true while the town's warehouses hold its seasoning (items' meals read it: 77-sim-6-items.js)
//
// THE GOVERNOR (an order-up-to rule with its supply line: POUT; Sterman's Beer Game, Towill's IOBPCS). Every `every`
// minutes, for each good the town makes: its DEMAND a day is its use and unmet draws over the last `window` whole days
// (the economy's own window when unset; today so far on the first day), plus whichever is more of its exports and the
// want of it in the other towns its trade routes carry it to from here (77-sim-6-trade.js: their use and unmet draws,
// the unmet at most once more the use) plus what buyers are set to take a day (`buys`), plus what the goods made from it
// here want of it (their demand less what was made of them, times the inputs). Its SUPPLY LINE is its stock in the
// warehouses, at the sites, on the carts and at sea toward the town. Wanted output a day = demand + alpha (target - supply
// line) / ti, the target `cover` days of demand or the shelf stock `least[good]` kept with no demand (a town at the
// abstract level buys no treats: watched again, it finds some), whichever is more; over what the town makes of it at the full rate (made a day over the multiplier it was made at,
// both smoothed over `smooth` days), clamped to [min (or minBy[good]), max]; a good never made yet asks for max only
// when it is wanted. A recipe of several goods runs at the rate its scarcest wanted good asks for (none wanted: the
// lowest of its goods' floors); its full rate is the one it had when the governor first looked. On the first day (no
// history) a recipe runs at its full rate, unless every good it makes has a shelf stock (`least`) already held: then
// at its floor.
// SPOILAGE. At midnight `spoil[good]` of each perishable's stock in the warehouses and at the sites rots, booked as used
// (consumed: the books balance) and tallied in E.spoiled. The households' own stores do not spoil.
// KEEPING. Of what would rot of `keep.goods` in a place, `keep.share` is kept instead while the warehouses hold `keep.by`,
// one drawn for every `per` servings kept (E.kept: {good: kept, <by>: drawn}).
// SEASONING. Every hour, whether the warehouses hold at least `least` of `season.by`; while they do, a meal's foods count
// `mult` times their quality. Deterministic: no draws.
(function(root){
  'use strict';
  var SIM = root.SIM;
  var economy1 = SIM.economy;
  SIM.economy = function(o, opt){
    var E = economy1(o, opt);
    if(o.govern) E.govern = { cfg:o.govern, rates:{}, last:{}, est:{}, view:{} };
    if(o.spoil) E.spoil = o.spoil;
    if(o.keep) E.keep = o.keep;
    if(o.season) E.season = { cfg:o.season, on:null };
    return E;
  };
  function each(fn){ if(SIM.ECONS) SIM.ECON_ORDER.forEach(function(k){ SIM.withEcon(k, function(){ fn(SIM.ECON); }); }); else if(SIM.ECON) fn(SIM.ECON); }

  /* ---------------------------------------------------------------- the governor */
  /* a good's flows a day (the kinds of the economy's day books) over the governor's window */
  function rate(E, g, minute, kinds){
    var G = E.govern && E.govern.cfg, w = G && G.window != null ? G.window : E.window;
    var d = Math.floor(minute/1440), m = minute%1440, tot = {}, days = 0;
    var add = function(D){ kinds.forEach(function(k){ tot[k] = (tot[k]||0) + ((D[k]||{})[g]||0); }); };
    for(var k=Math.max(0, d-w); k<d; k++) if(E.day[k]){ add(E.day[k]); days++; }
    if(!days && E.day[d] && m>60){ add(E.day[d]); days += m/1440; }
    var out = {}; kinds.forEach(function(k){ out[k] = days>0 ? (tot[k]||0)/days : 0; }); return out;
  }
  /* the other towns a trade route carries g to from settlement s */
  function carriedTo(s, g){
    var T = SIM.TRADE, out = []; if(!T || s==null) return out;
    T.order.forEach(function(id){ var R = T.routes[id];
      if(!R.stops.some(function(x){ return x.settlement===s; })) return;
      if(R.goods && !(R.goods[s]||[]).some(function(x){ return x===g; })) return;
      var seen = {}; R.stops.forEach(function(x){ var o = x.settlement; if(o===s || seen[o] || !SIM.econ(o)) return; seen[o] = 1; out.push(o); }); });
    return out;
  }
  function demand(E, g, minute, memo){
    if(memo[g] != null) return memo[g]; memo[g] = 0;
    var s = E.settlement, G = E.govern.cfg, r = rate(E, g, minute, ['used', 'short', 'exported']), want = 0;
    carriedTo(s, g).forEach(function(o){ var q = rate(SIM.econ(o), g, minute, ['used', 'short']); want += q.used + (q.used>0 ? Math.min(q.short, q.used) : q.short); });
    var dem = r.used + r.short + Math.max(r.exported, want + ((G.buys||{})[g]||0));
    var made = {}; Object.keys(E.recipes).forEach(function(id){ E.recipes[id].out.forEach(function(o){ made[o] = 1; }); });
    Object.keys(E.inputs||{}).forEach(function(o){ var q = E.inputs[o]; if(!q || !q[g] || !made[o]) return;
      dem += (demand(E, o, minute, memo) - rate(E, o, minute, ['made']).made) * q[g]; });
    if(dem<0) dem = 0;
    memo[g] = dem; return dem;
  }
  function position(E, g){
    var have = 0; E.warehouses.forEach(function(W){ have += W.stock[g]||0; }); E.sites.forEach(function(P){ have += P.stock[g]||0; });
    E.carts.forEach(function(a){ var L = a.cart.load; if(L && L.good===g) have += L.n; });
    if(SIM.tradeInbound) have += SIM.tradeInbound(g, E.settlement);
    return have;
  }
  function govern(E, minute){
    var M = E.govern, G = M.cfg; if(minute % G.every) return;
    var a = G.every/(1440*(G.smooth==null ? 2 : G.smooth)), first = minute<1440, memo = {}, want = {}, wanted = {}, floor = {}, made = {};
    Object.keys(E.recipes).forEach(function(id){ if(M.rates[id]===undefined) M.rates[id] = E.recipes[id].rate;   /* its full rate: the one it had at the first look */
      E.recipes[id].out.forEach(function(g){ (made[g] || (made[g] = [])).push(id); }); });
    Object.keys(made).forEach(function(g){
      var st = M.est[g] || (M.est[g] = { made:0, k:0, last:E.made[g]||0 });
      var k0 = 0; made[g].forEach(function(id){ k0 += M.last[id]==null ? 1 : M.last[id]; }); k0 /= made[g].length;
      var dm = ((E.made[g]||0) - st.last) * 1440 / G.every; st.last = E.made[g]||0;
      st.made += a*(dm - st.made); st.k += a*(k0 - st.k);
      var use = demand(E, g, minute, memo), pos = position(E, g), cap = st.k>0 ? st.made/st.k : 0;
      var target = Math.max(G.cover*use, (G.least||{})[g]||0), out = use + G.alpha*(target - pos)/G.ti;   /* `least`: a shelf stock kept with no demand */
      var lo = G.minBy && G.minBy[g]!=null ? G.minBy[g] : G.min, m = cap>0 ? out/cap : out>0 ? G.max : lo; want[g] = Math.max(lo, Math.min(G.max, m));   /* never made yet: the most only if it is wanted */
      wanted[g] = out>0; floor[g] = lo;
      M.view[g] = { use:use, pos:pos, cap:cap, mult:want[g], target:target };
    });
    Object.keys(E.recipes).forEach(function(id){
      var R = E.recipes[id], base = M.rates[id]; if(base==null) return;
      /* the scarcest wanted good's rate; none wanted, the lowest of its goods' floors */
      var k = 1, least = G.least||{};
      if(first){ if(R.out.every(function(g){ return least[g]!=null && M.view[g] && M.view[g].pos>=least[g]; })){ k = Infinity; R.out.forEach(function(g){ if(floor[g]<k) k = floor[g]; }); } }   /* the first day: full, but a shelf already held is not filled */
      else { k = 0; R.out.forEach(function(g){ if(wanted[g] && want[g]>k) k = want[g]; });
        if(!k){ k = Infinity; R.out.forEach(function(g){ if(floor[g]<k) k = floor[g]; }); } }
      R.rate = base*k; M.last[id] = k;
    });
  }

  /* ---------------------------------------------------------------- spoilage and keeping */
  function spoil(E, minute){
    if(minute % 1440) return;
    var P0 = E.spoil, K = E.keep, o = E.spoiled || (E.spoiled = {}), sv = K ? E.kept || (E.kept = {}) : null; if(K && sv[K.by]==null) sv[K.by] = 0;
    Object.keys(P0).forEach(function(g){ if(!E.goods[g] || !(P0[g]>0)) return; var n = 0, keeps = K && K.goods.indexOf(g)>=0 && E.goods[K.by];
      E.warehouses.concat(E.sites).forEach(function(P){ var k = Math.floor((P.stock[g]||0)*P0[g]);
        if(k>0 && keeps){ var want = Math.floor(k*K.share), q = Math.min(Math.ceil(want/K.per), Math.floor(SIM.stockOf(K.by)));   /* kept, not rotten */
          if(q>0){ var got = SIM.supply(K.by, q), kept = Math.min(want, got*K.per); k -= kept; sv[g] = (sv[g]||0) + kept; sv[K.by] += got; } }
        if(k>0){ P.stock[g] -= k; n += k; } });
      if(n>0){ SIM.economyBook('used', g, n); o[g] = (o[g]||0) + n; } });
  }

  /* ---------------------------------------------------------------- seasoning */
  function holds(E){ var C = E.season.cfg, n = 0; E.warehouses.forEach(function(W){ n += W.stock[C.by]||0; }); return n >= (C.least==null ? 1 : C.least); }
  function season(E, minute){ if(minute % 60) return; E.season.on = holds(E); }
  SIM.economySeasoned = function(s){ var E = s!=null ? SIM.econ(s) : SIM.ECON; if(!E || !E.season) return false; if(E.season.on==null) E.season.on = holds(E); return E.season.on; };
  /* a meal's foods' quality times this (77-sim-6-items.js): the town's seasoning while it holds it, else 1 */
  SIM.economySeasoning = function(){ var E = SIM.ECON; return E && E.season && SIM.economySeasoned() ? E.season.cfg.mult : 1; };

  /* ---------------------------------------------------------------- the step */
  SIM.economyRules = function(minute){
    each(function(E){ if(E.govern) govern(E, minute); });
    each(function(E){ if(E.spoil) spoil(E, minute); });
    each(function(E){ if(E.season) season(E, minute); });
  };
  SIM.economyGoverned = function(s){ var E = s!=null ? SIM.econ(s) : SIM.ECON; return E && E.govern ? E.govern.view : null; };
})(typeof window!=='undefined'?window:globalThis);
