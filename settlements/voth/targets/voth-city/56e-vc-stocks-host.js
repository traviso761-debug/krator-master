/* ============================== 6f. HOST: WHAT THINGS HOLD AND THE SETTLEMENT'S STOCKS ============================== */
/* [web] The owner's 2026-10-14 brief (ROADMAP.md section 10, "what things hold, and the settlement's stocks"), so the
   economy's tuning can be seen. Every number here is read from core/simulation's data side (77-sim-7-stocks.js:
   SIM.contents, SIM.stocks, SIM.holders, SIM.placeAt, SIM.whereIs), never from VC's own records; VC is read only for
   which simulation place a lot or a piece of furniture is (VC.IX's units, the pick's `place`).
   - THE CONTENTS, in the inspector (i): a building (its lot's places: a producer's stock, made here, and what it makes
     from what; a warehouse's or a granary's store; a household's food and its days; what a shop sells, from the
     warehouses), a container (a chest, a barrel, a rack, a stall, a counter: the simulation keeps stock by place, not
     by piece, so a container shows its place's store), the ground of an outdoor site (a field, a fishers' dock, a mine,
     a quay, the granaries: the nearest place that holds something there) and a citizen (56d's card: what it wears and
     how worn, its tool, what it keeps at home, a cart's load, its household's food, its carrier's load).
   - THE STOCKS (o, or "stocks (o)" on the bar): every good and item in the settlement, its total, at the production
     site, in transit, in storage and owned (the citizens' things), the last day's change (the daily snapshot's) and
     days of cover; low and out marked. Click an item for its flows and its holders; click a holder to fly there and
     open it in the inspector. Sorted by name, total or change. Read when opened, then every few seconds while the
     simulated minute moves (at most once a second's tick: never every frame); paused, only by "refresh". Nothing is
     kept beyond the page. */
VC.STK = { on: false, sort: 'total', dir: -1, show: 'all', open: null, minute: null, at: 0, data: null, pin: null, ms: 0, byLot: null, mark: null };
/* furniture that holds things (the catalog's types, and by name) */
VC.CONTAINER = { storage: 1, rack: 1, vessel: 1, stack: 1, shelf: 1, counter: 1, stall: 1, supply: 1, food: 1, drink: 1 };
VC.isContainer = function (key) {
  var F = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[key]) || {};
  return !!VC.CONTAINER[F.type] || /chest|barrel|crate|bin|sack|jar|amphora|cask|trunk|basket|cabinet|wardrobe|granary|silo|coffer|keg/.test(key) && F.type !== 'shrine';
};
VC.fmt = function (v) {
  if (v == null || !isFinite(v)) return '-';
  var a = Math.abs(v); return a >= 100 || v === Math.round(v) ? Math.round(v).toLocaleString('en-GB') : v.toFixed(1);
};
VC.signed = function (v) { if (v == null) return '-'; if (!v) return '0'; return '<span class="' + (v > 0 ? 'up' : 'dn') + '">' + (v > 0 ? '+' : '&minus;') + VC.fmt(Math.abs(v)) + '</span>'; };
VC.STATE = { production: ['#d9b24a', 'at the site'], transit: ['#5aa6d9', 'in transit'], storage: ['#9fd49a', 'in storage'], owned: ['#c7a1e0', 'owned'] };
VC.chip = function (st) { var S = VC.STATE[st]; return S ? '<i style="background:' + S[0] + ';width:8px;height:8px"></i>' : ''; };
/* a lot's simulation places: its buildings' units (VC.IX), mapped once */
VC.lotPlaces = function (L) {
  var S = VC.STK;
  if (!S.byLot) { S.byLot = new Map(); (VC.IX && VC.IX.units || []).forEach(function (u) { if (u.lot == null || u.lot < 0 || !SIM.R.place['ix.' + u.i]) return; var Lr = PLAN.lots[u.lot]; if (!Lr) return; var a = S.byLot.get(Lr) || []; a.push('ix.' + u.i); S.byLot.set(Lr, a); }); }
  return S.byLot.get(L) || [];
};

/* ---------------------------------------------------------------- the contents (read only) */
VC.itemsTable = function (items) {
  return '<table class="ct">' + items.map(function (e) {
    return '<tr><td>' + VC.chip(e.state) + VC.itemName(e.item) + '</td><td style="text-align:right">' + VC.fmt(e.n) + '</td><td class="k">' + e.as + (e.wear != null ? ', ' + Math.round(e.wear * 100) + '% worn' : '') + '</td></tr>';
  }).join('') + '</table>';
};
VC.contentsHTML = function (id, title) {
  var C = SIM.contents(id); if (!C) return '';
  var h = '<div class="sec">' + (title || 'holds') + '</div>', I = SIM.ITEMS;
  if (C.type === 'place') {
    if (C.makes) h += 'makes ' + C.makes.map(function (g) { var inp = C.inputs[g]; return VC.itemName(g) + (inp ? ' <span class="k">(from ' + Object.keys(inp).map(function (k) { return inp[k] + ' ' + VC.itemName(k); }).join(', ') + ')</span>' : ''); }).join(', ') + (C.herd ? ' <span class="k">(its herd)</span>' : '') + '<br>';
    if (C.store) h += '<span class="k">' + { production: 'its store (made, not yet hauled)', transit: 'its landing store (for the carts)', storage: 'the settlement\'s store' }[C.store.state] + ': ' + VC.fmt(C.store.held) + (C.store.cap ? ' of ' + VC.fmt(C.store.cap) : '') + (C.carts ? ' &middot; ' + C.carts + ' cart' + (C.carts > 1 ? 's' : '') + ' bound here' : '') + '</span>';
    var stock = C.items.filter(function (e) { return e.as !== 'household food'; });
    if (stock.length) h += VC.itemsTable(stock); else if (C.store) h += ' <span class="k">&middot; empty</span>';
    if (C.household) { var hf = C.items.filter(function (e) { return e.as === 'household food'; });
      h += (C.store ? '<br>' : '') + 'household food: ' + (hf.length ? hf.map(function (e) { return VC.itemName(e.item) + ' ' + VC.fmt(e.n); }).join(', ') : '<span class="out">none</span>') +
        ' <span class="k">(' + C.household.people + ' people, ' + VC.fmt(C.household.days) + ' days' + (C.household.days != null && C.household.days < C.household.low ? ': low, someone goes to buy' : '') + ')</span>'; }
    if (C.mess) h += '<br>its residents eat at a mess <span class="k">(no food store of their own: fed from the warehouses)</span>';
    if (C.sells) h += '<br>sells ' + C.sells.map(VC.itemName).join(', ') + ' <span class="k">(' + (C.shelf === 'warehouses' ? 'no shelf of its own: it sells from the settlement\'s warehouses' : 'abstract stock') + ')</span>';
    if (!C.items.length && !C.store && !C.household && !C.mess && !C.sells) h += '<span class="k">holds nothing the simulation counts</span>';
  } else if (C.type === 'group') {
    h += C.members + ' people &middot; ' + C.kind + (C.items.length ? VC.itemsTable(C.items) : ' <span class="k">&middot; carries nothing</span>');
  }
  return h;
};
/* the card of a holder that is not drawn under the cursor (a place, a carrier), opened from the stocks */
VC.pinHTML = function (id) {
  var A = SIM.R.actor[id], G = SIM.R.group && SIM.R.group[id];
  if (G) return '<b>' + G.kind + '</b> <span class="k">' + id + '</span>' + VC.contentsHTML(id, 'carries');
  if (A) return VC.actorHTML(A, A.cart ? 'cart' : A.animal ? 'animal' : 'citizen');
  return '<b>' + VC.placeName(id) + '</b> <span class="k">' + id + '</span>' + VC.contentsHTML(id);
};
/* what the description is of (55-vc-host.js VC.DESC): its contents under it */
VC.descContents = function (D) {
  if (D.kind === 'furn') {
    var id = D.furn.place; if (!id || !SIM.R.place[id] || !VC.isContainer(D.furn.key)) return '';
    return '<div class="k" style="margin-top:4px">a container: the simulation keeps stock by place, not by piece; this one is part of ' + VC.placeName(id) + '</div>' + VC.contentsHTML(id, 'its place holds');
  }
  if (D.kind === 'lot') { var ids = VC.lotPlaces(D.lot); return ids.map(function (p) { return VC.contentsHTML(p, ids.length > 1 ? 'holds: ' + VC.placeName(p) : 'holds'); }).join(''); }
  if (D.kind === 'ground') { var g = SIM.placeAt(D.at[0], D.at[1], 12); return g ? '<div class="sec">' + VC.placeName(g) + '</div>' + VC.contentsHTML(g, 'holds') : ''; }
  return '';
};
(function () {
  var describe = VC.describe;
  VC.describe = function (r) {
    VC.DESC = null; VC.STK.pin = null;
    var h = describe(r), D = VC.DESC;
    if (!D || VC.INSP.a || typeof SIM === 'undefined' || !SIM.contents) return h;
    try { h += VC.descContents(D); } catch (e) { console.warn('contents: ' + e.message); }
    return h;
  };
})();

/* ---------------------------------------------------------------- the stocks panel */
VC.CATS = [['food', 'food'], ['good', 'materials and goods'], ['owned', 'the citizens\' things']];
VC.catOf = function (o) { return o.cat === 'food' ? 'food' : o.good ? 'good' : 'owned'; };
VC.flowsHTML = function (f, o) {
  if (!f) return '<span class="k">none yet</span>';
  var p = [];
  if (o.good) { p.push('made ' + VC.fmt(f.made), 'imported ' + VC.fmt(f.imported), 'exported ' + VC.fmt(f.exported), 'drawn from the stores ' + VC.fmt(f.used));
    if (f.stocked != null) p.push('of it into households\' stores ' + VC.fmt(f.stocked), 'eaten at home ' + VC.fmt(f.eaten)); }
  else { p.push('bought ' + VC.fmt(f.bought), 'issued ' + VC.fmt(f.issued), 'worn out ' + VC.fmt(f.worn), 'broken ' + VC.fmt(f.broken)); if (f.eaten != null) p.push('eaten ' + VC.fmt(f.eaten)); }
  p.push('<b>used up ' + VC.fmt(f.consumed) + '</b>', 'change ' + VC.signed(f.change));
  if (f.unmet) p.push('<span class="out">unmet ' + VC.fmt(f.unmet) + '</span>');
  return p.join(' &middot; ');
};
VC.hmDay = function (m) { var mm = ((Math.floor(m) % 1440) + 1440) % 1440; return ('0' + Math.floor(mm / 60)).slice(-2) + ':' + ('0' + (mm % 60)).slice(-2) + ' day ' + (Math.floor(m / 1440) + 1); };
VC.spanText = function (s) {
  if (!s) return '';
  return VC.hmDay(s.from) + ' to ' + VC.hmDay(s.to) + (s.partial ? ' <span class="k">(a partial day: the first snapshot was taken mid-day)</span>' : '') + (s.jumped ? ' <span class="out">(the clock jumped in between: hours skipped)</span>' : '');
};
VC.stocksRefresh = function () {
  var S = VC.STK; if (!S.on || typeof SIM === 'undefined' || !SIM.stocks) return;
  var t0 = performance.now(); S.data = SIM.stocks(); S.hold = S.open && S.data ? SIM.holders(S.open, 12) : null;
  S.ms = Math.round(performance.now() - t0); S.minute = SIM.minute(); S.at = performance.now();
  VC.stocksDraw();
};
VC.stocksDraw = function () {
  var S = VC.STK, D = S.data, body = $('stk-body'); if (!body) return;
  if (!D) { body.innerHTML = '<div class="k">This world has neither the economy nor the items on: nothing is stocked.</div>'; return; }
  var useDay = !!D.day, E = SIM.ECON;
  $('stk-when').textContent = 'read at ' + VC.hmDay(D.minute) + ' ('  + S.ms + ' ms)' + (VC.PAUSE.on ? ' \u00b7 paused' : '');
  var rows = D.order.map(function (k) { return D.by[k]; }).filter(function (o) { return S.show === 'all' || (S.show === 'goods' ? o.good : !o.good); });
  var chg = function (o) { var f = useDay ? o.day : o.today; return f ? f.change : 0; };
  var key = S.sort === 'name' ? function (o) { return VC.itemName(o.item); } : S.sort === 'change' ? chg : function (o) { return o.total; };
  rows.sort(function (p, q) { var a = key(p), b = key(q); return (a < b ? -1 : a > b ? 1 : 0) * S.dir || (p.item < q.item ? -1 : 1); });
  var arrow = function (s) { return S.sort === s ? (S.dir < 0 ? ' &#9660;' : ' &#9650;') : ''; };
  var h = '<table><tr><th class="s" data-s="name">item' + arrow('name') + '</th><th class="s" data-s="total">total' + arrow('total') + '</th>' +
    ['production', 'transit', 'storage', 'owned'].map(function (st) { return '<th>' + VC.chip(st) + VC.STATE[st][1] + '</th>'; }).join('') +
    '<th class="s" data-s="change" title="' + (useDay ? 'the last day, midnight to midnight' : 'since the last snapshot: no whole day yet') + '">' + (useDay ? 'change / day' : 'change today') + arrow('change') + '</th><th title="days of cover: the warehoused stock over its use a day">days</th><th></th></tr>';
  VC.CATS.forEach(function (c) {
    var rs = rows.filter(function (o) { return VC.catOf(o) === c[0]; }); if (!rs.length) return;
    h += '<tr class="cat"><td colspan="9">' + c[1] + '</td></tr>';
    rs.forEach(function (o) {
      var f = useDay ? o.day : o.today, mark = (o.out ? '<span class="out" title="a draw or a purchase went unmet">out</span> ' : '') + (o.low ? '<span class="low" title="fewer days of cover than the import threshold">low</span> ' : '') + (o.wanting ? '<span class="k" title="citizens short of a kept set, or with a broken tool">' + VC.fmt(o.wanting) + ' want</span>' : '');
      var z = function (v) { return v ? VC.fmt(v) : '<span class="k">&middot;</span>'; };
      h += '<tr class="it' + (S.open === o.item ? ' sel' : '') + '" data-k="' + o.item + '"><td' + (o.out ? ' class="out"' : o.low ? ' class="low"' : '') + '>' + VC.itemName(o.item) + '</td><td>' + VC.fmt(o.total) + (o.ordered ? '<span class="k" title="an import sent for by timer, not yet landed: not in the total"> +' + VC.fmt(o.ordered) + '</span>' : '') + '</td><td>' + z(o.production) + '</td><td>' + z(o.transit) + '</td><td>' + z(o.storage) + '</td><td>' + z(o.owned) + '</td><td>' + (f ? VC.signed(f.change) : '-') + '</td><td>' + (o.days != null ? VC.fmt(o.days) : '<span class="k">' + (o.good ? 'no use' : '') + '</span>') + '</td><td style="text-align:left">' + mark + '</td></tr>';
      if (S.open === o.item) h += '<tr><td class="det" colspan="9">' + VC.stocksDetail(o, D) + '</td></tr>';
    });
  });
  h += '</table>';
  var Hh = D.households;
  h += '<div class="lg">' + (D.day ? 'the last day: ' + VC.spanText(D.day) : 'no whole day yet: the change is since ' + VC.spanText(D.today)) +
    (Hh && Hh.n ? '<br>households: ' + VC.fmt(Hh.n) + ' with a food store, ' + VC.fmt(Hh.low) + ' low (under ' + SIM.ITEMS.low + ' days: one of them goes to buy), ' + VC.fmt(Hh.empty) + ' empty' : '') +
    (E ? '<br>the economy: ' + E.warehouses.length + ' warehouses and granaries, ' + E.sites.length + ' sites, ' + E.carts.length + ' carts, ' + E.inflight.length + ' imports on the way' : '<br>the economy is off: nothing is made, hauled or stored') + '</div>';
  body.innerHTML = h;
  Array.prototype.forEach.call(body.querySelectorAll('th.s'), function (th) { th.onclick = function () { var s = th.dataset.s; if (S.sort === s) S.dir = -S.dir; else { S.sort = s; S.dir = s === 'name' ? 1 : -1; } VC.stocksDraw(); }; });
  Array.prototype.forEach.call(body.querySelectorAll('tr.it'), function (tr) { tr.onclick = function () { var k = tr.dataset.k; S.open = S.open === k ? null : k; S.hold = S.open ? SIM.holders(S.open, 12) : null; VC.stocksDraw(); }; });
  Array.prototype.forEach.call(body.querySelectorAll('tr.hd'), function (tr) { tr.onclick = function (e) { e.stopPropagation(); VC.stocksGo(tr.dataset.id); }; });
};
VC.stocksDetail = function (o, D) {
  var S = VC.STK, h = '', K = SIM.ITEMS && SIM.ITEMS.kinds[o.item];
  h += '<b>' + VC.itemName(o.item) + '</b> <span class="k">' + (o.good ? 'a good' + (o.cat === 'food' ? ', a food' : '') : 'an item (' + o.cat + ')') + (o.madeOf ? ', bought for ' + (K && K.per != null ? K.per + ' ' : '') + VC.itemName(o.madeOf) : '') + '</span>';
  if (o.good) h += '<br>use a day ' + VC.fmt(o.use) + ' &middot; days of cover ' + (o.days != null ? VC.fmt(o.days) : '-') + (D.rule.lowDays != null ? ' <span class="k">(low under ' + D.rule.lowDays + ': the economy sends for an import then' + (SIM.ECON.goods[o.item] && SIM.ECON.goods[o.item].import ? ', by the ' + SIM.ECON.goods[o.item].import.route : ', but this good has no import route') + ')</span>' : '');
  if (o.ordered) h += '<br>ordered by timer, not yet landed: ' + VC.fmt(o.ordered);
  if (o.wanting) h += '<br>' + VC.fmt(o.wanting) + ' citizens short of it now (a kept set short, a tool broken)';
  h += '<br>the last day: ' + VC.flowsHTML(o.day, o) + '<br>today so far: ' + VC.flowsHTML(o.today, o);
  var Hd = S.hold;
  if (Hd && Hd.item === o.item) {
    h += '<br><span class="k">held by ' + VC.fmt(Hd.count) + (Hd.count > Hd.list.length ? ', the ' + Hd.list.length + ' holding most' : '') + ' (click one to fly there and inspect it):</span><table>';
    Hd.list.forEach(function (x) { h += '<tr class="hd" data-id="' + x.id + '"><td>' + VC.chip(x.state) + x.name + ' <span class="k">' + x.id + '</span></td><td class="k" style="text-align:left">' + x.as + '</td><td>' + VC.fmt(x.n) + '</td></tr>'; });
    h += '</table>';
    if (!Hd.list.length) h += '<span class="k">nobody holds any</span>';
  }
  return h;
};
/* a holder: fly there and open it in the inspector (a citizen, a cart, a carrier's leader: the citizens' card; a place
   or a carrier: its contents, kept on screen until the cursor moves over the view) */
VC.stocksGo = function (id) {
  var p = SIM.whereIs(id); if (!p) return;
  var S = VC.STK, A = SIM.R.actor[id], G = SIM.R.group && SIM.R.group[id];
  if (ctl.walk) window._setWalk(false);
  ctl.target.set(p.x, p.y, p.z); ctl.dist = A || G ? 30 : 80; ctl.el = 0.7; updateCamera();
  var tip = $('tip'); if (tip.style.display !== 'block') $('ly-inspect').onclick();
  if (A) { VC.INSP.a = A; VC.INSP.kind = A.cart ? 'cart' : A.animal ? 'animal' : 'citizen'; VC.INSP.at = performance.now(); tip.classList.add('card'); tip.innerHTML = VC.actorHTML(A, VC.INSP.kind); S.pin = null; }
  else { VC.INSP.a = null; tip.classList.remove('card'); S.pin = id; tip.innerHTML = VC.pinHTML(id); }
  tip.style.left = Math.round(innerWidth / 2 + 24) + 'px'; tip.style.top = Math.max(8, Math.round(innerHeight / 2 - 80)) + 'px';
};
VC.stocksToggle = function (on) {
  var S = VC.STK, el = $('stocks'), b = $('ly-stocks'); S.on = on == null ? !S.on : !!on;
  if (el) el.style.display = S.on ? 'block' : 'none'; if (b) b.classList.toggle('on', S.on);
  if (S.on) VC.stocksRefresh();
  return S.on;
};
VC.stocksUI = function () {
  var S = VC.STK, b = $('ly-stocks'); if (b) b.onclick = function () { VC.stocksToggle(); };
  var c = $('stk-close'); if (c) c.onclick = function () { VC.stocksToggle(false); };
  var r = $('stk-refresh'); if (r) r.onclick = function () { VC.stocksRefresh(); };
  Array.prototype.forEach.call(document.querySelectorAll('#stocks button[data-f]'), function (bt) {
    var paint = function () { bt.classList.toggle('on', S.show === bt.dataset.f); };
    bt.onclick = function () { S.show = bt.dataset.f; Array.prototype.forEach.call(document.querySelectorAll('#stocks button[data-f]'), function (x) { x.classList.toggle('on', S.show === x.dataset.f); }); VC.stocksDraw(); }; paint(); });
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'o' || e.key === 'O') { VC.stocksToggle(); e.preventDefault(); }
  });
  /* the slow tick: every 4 s of real time while open, when the simulated minute has moved (not while paused) */
  setInterval(function () { if (!S.on || VC.PAUSE.on || typeof SIM === 'undefined') return; if (SIM.minute() !== S.minute && performance.now() - S.at > 4000) VC.stocksRefresh(); }, 1000);
  /* a place opened from the stocks: its card kept current (each second) and a marker over it */
  var mk = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.6, 4).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: 0x5aa6d9, depthTest: false, transparent: true, opacity: 0.9 }));
  mk.renderOrder = 60; mk.visible = false; mk.userData.probeSkip = true; mk.frustumCulled = false; scene.add(mk); S.mark = mk;
  var last = 0;
  window._frameHooks.push(function () {
    var tip = $('tip'), on = S.pin && tip && tip.style.display === 'block' && !VC.INSP.a;
    if (!on) { mk.visible = false; return; }
    var p = SIM.whereIs(S.pin); if (!p) { mk.visible = false; return; }
    mk.position.set(p.x, p.y + 9, p.z); mk.visible = true;
    var n = performance.now(); if (n - last < 1000) return; last = n; tip.innerHTML = VC.pinHTML(S.pin);
  });
};
