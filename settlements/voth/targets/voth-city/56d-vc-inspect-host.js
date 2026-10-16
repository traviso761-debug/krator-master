/* ============================== 6e. HOST: THE PAUSE AND THE CITIZENS' INSPECTOR ============================== */
/* [web] Two tools on the simulation as it is drawn (owner, 2026-10-14):
   - THE PAUSE (k, or the "pause" button by the clock): everything holds where it is. The world clock's motion time and
     its hour (so the citizens, animals, pets, carts, carriers, ferries and elephant bugs, which are all poses of that
     time, and the sky, the sun and the lamps), and every animation the page drives from the frame's time (the sails,
     the water, the windmills, the lighthouse beams, the plants' sway, the animals' gaits, the weather's rain, ash and
     smoke). The simulation is not stepped: SIM.step runs when the clock's minute moves, and it does not. How: every
     frame hook (window._frameHooks, the page's one frame loop) is handed the page's ANIMATION time, VC.animNow(now),
     the real time less the time spent paused, which stands still while paused; hooks added later are wrapped as they
     are added. A hook that must follow the camera while paused reads performance.now() itself (who is drawn near the
     camera, 56c; the cutaway's refresh, 56b). Unpausing takes the time paused off for good, so nothing jumps. The
     camera, the panels, the hour slider and the inspector keep working.
   - THE CITIZENS' INSPECTOR (i, the inspector): the tooltip names the person (or animal, or cart) under the cursor among
     those drawn this frame: who, their job (workplace, post, shift, rota day off), what they are doing (the activity and
     where, the leg of the trip they are on and where it ends, when they arrive, what the schedule says next and when),
     their desires (the needs' meters, happiness, efficiency, loyalty, what the meters ask for in free time, an errand)
     and their things (what they wear and how worn, the tool, what they carry, the household's food store: read from
     core/simulation's SIM.contents since 2026-10-14, 56e). An animal:
     species, its pen or its household, its age, what it is doing. Picking costs nothing per actor in the city: only the
     bodies drawn near the camera (VC.SIMBODY, at most TUNE.sim.embody.max) are tested, each as a point against the
     cursor's ray (within 12 pixels, or half a metre), behind the ground or another lot's box left out. The card is read
     from the actors' state and changes nothing: the meters are read at this minute by SIM.needsPeek (core), never
     brought forward; nothing that decides is called. */
VC.PAUSE = { on: false, at: 0, held: 0, last: 0 };
VC.animNow = function (now) { var P = VC.PAUSE, v = (P.on ? P.at : now) - P.held; if (v < P.last) v = P.last; P.last = v; return v; };
(function () {
  var H = window._frameHooks = window._frameHooks || [];
  var wrap = function (fn) {
    if (typeof fn !== 'function' || fn.__anim) return fn;
    var w = function (now) { return fn(VC.animNow(now == null ? performance.now() : now)); }; w.__anim = true; return w;
  };
  for (var i = 0; i < H.length; i++) H[i] = wrap(H[i]);
  var push = H.push, unshift = H.unshift;
  H.push = function () { return push.apply(H, Array.prototype.map.call(arguments, wrap)); };
  H.unshift = function () { return unshift.apply(H, Array.prototype.map.call(arguments, wrap)); };
})();
VC.pause = function (on) {
  var P = VC.PAUSE, n = performance.now(); on = on == null ? !P.on : !!on; if (on === P.on) return P.on;
  if (on) P.at = n; else P.held += n - P.at;
  P.on = on;
  var b = $('clk-pause'); if (b) { b.classList.toggle('on', on); b.textContent = on ? 'paused (k)' : 'pause (k)'; }
  return on;
};

/* ---------------------------------------------------------------- picking: the drawn bodies against the cursor's ray */
VC.INSP = { a: null, kind: null, at: 0, mark: null };
VC.pickBody = function (r) {
  var B = VC.SIMBODY, E = TUNE.sim.embody; if (!B || typeof SIM === 'undefined' || !(ctl.walk || ctl.dist < E.dist)) return null;
  var o = r.origin, d = r.direction, t = SIM.time(), best = null, bs = Infinity;
  var tol = 12 * 2 * Math.tan(camera.fov * Math.PI / 360) / innerHeight;   /* 12 pixels, as a slope off the ray */
  var test = function (a, x, y, z, kind) {
    var vx = x - o.x, vy = y - o.y, vz = z - o.z, along = vx * d.x + vy * d.y + vz * d.z; if (along < 0.5) return;
    var px = vx - d.x * along, py = vy - d.y * along, pz = vz - d.z * along, k = Math.sqrt(px * px + py * py + pz * pz) / along, lim = Math.max(tol, 0.5 / along);
    if (k > lim) return;
    var sc = k / lim + along * 1e-4; if (sc < bs) { bs = sc; best = { a: a, kind: kind, d: along, x: x, y: y, z: z }; }
  };
  B.list.forEach(function (a) { var P = SIM.pose(a, t, { cheap: true }); if (!P.hidden) test(a, P.x, P.y + 0.95, P.z, 'citizen'); });
  var AN = B.animals; if (AN) AN.list.forEach(function (a) { var g = AN.live[a.id]; if (g && g.visible) test(a, g.position.x, g.position.y + 0.5 * g.scale.y, g.position.z, 'animal'); });
  if (SIM.ECON && B.cartsShown) SIM.ECON.carts.forEach(function (a) { var P = SIM.pose(a, t, { cheap: true }); if (!P.hidden) test(a, P.x, P.y + 1, P.z, 'cart'); });
  if (!best) return null;
  /* behind the ground or a building: not this one */
  var gh = VIEW.pick(r); if (gh && Math.hypot(gh[0] - o.x, VIEW.surf(gh[0], gh[1]) - o.y, gh[1] - o.z) < best.d - 2) return null;
  /* a lot's box is its whole plot: one standing in it (its yard, its outside stairs) is not hidden by it */
  var L = VC.pickLot(r);
  if (L && VC.pickLotT < best.d - 1.5) {
    var c = Math.cos(L.ry), s = Math.sin(L.ry), ox = best.x - L.x, oz = best.z - L.z, lx = ox * c - oz * s, lz = ox * s + oz * c;
    if (!(Math.abs(lx) <= L.w / 2 + 0.5 && Math.abs(lz) <= L.d / 2 + 0.5 && best.y >= L.y - 1 && best.y <= L.y + L.h + 1)) return null;
  }
  return best;
};

/* ---------------------------------------------------------------- the card (read only) */
VC.hm = function (m) {
  if (m == null || !isFinite(m)) return '-';
  var now = SIM.minute(), d = Math.floor(m / 1440), mm = ((Math.floor(m) % 1440) + 1440) % 1440, h = Math.floor(mm / 60), s = ('0' + h).slice(-2) + ':' + ('0' + (mm % 60)).slice(-2);
  return d === Math.floor(now / 1440) ? s : s + ' day ' + (d + 1);
};
VC.placeName = function (id) {
  if (id == null) return '-';
  var P = SIM.R.place[id]; if (!P) return String(id);
  var n = P.name || P.kind, u = /^ix\.\d+$/.test(id) ? VC.IX.units[+id.slice(3)] : null;
  return n + (u ? ' <span class="k">(' + u.cls + ', ' + u.district + ')</span>' : P.kind && P.kind !== n ? ' <span class="k">(' + P.kind + ')</span>' : '');
};
VC.meterBar = function (v) {
  var c = v < 35 ? '#7dbb6a' : v < 65 ? '#d9b24a' : '#d9654a';
  return '<span class="mt"><b style="width:' + Math.max(2, Math.min(100, v)).toFixed(0) + '%;background:' + c + '"></b></span>';
};
VC.itemName = function (k) { var I = SIM.ITEMS, K = I && I.kinds[k]; return (K && K.name) || String(k).replace(/_/g, ' '); };
/* the household's residents (a pet's owners): one pass over the actors, the first time it is asked */
VC.homeOf = function (id) {
  var X = VC.INSP; if (!X.homes) { X.homes = {}; SIM.all('actor').forEach(function (a) { if (!a.animal && !a.driven && a.home) (X.homes[a.home] = X.homes[a.home] || []).push(a.id); }); }
  return X.homes[id] || [];
};
/* what the meters ask for in free time: the world's (or the role's) free activities scored as the needs score them
   (fills times meters times weights), without asking for a place: the read changes nothing */
VC.needsAsk = function (a, nd) {
  var N = SIM.NEED, R = SIM.R.role[a.role], F = (R && R.needs && R.needs.free) || N.free, T = a.trait && N.traits[a.trait], C = a.culture && N.cultures[a.culture], out = [];
  F.forEach(function (act) { var f = (C && C.fill[act]) || N.fill[act] || N.zero, s = 0; for (var i = 0; i < f.length; i++) if (f[i] > 0 && nd[i] > N.done) s += f[i] * nd[i] * N.weight[i] * (T ? T[i] : 1); if (s > 0) out.push([s, act]); });
  return out.sort(function (p, q) { return q[0] - p[0]; }).slice(0, 3).map(function (e) { return e[1]; });
};
VC.desiresHTML = function (a, m) {
  var N = SIM.NEED; if (!N) return '';
  var nd = SIM.needsPeek(a, m); if (!nd) return '';
  var h = '<div class="sec">desires</div>', hp = SIM.happiness(a, nd), band = function (L, v) { for (var i = 0; i < L.length; i++) if (v >= L[i].min) return L[i]; return L[L.length - 1]; };
  h += N.list.map(function (n, i) { return '<span style="display:inline-block;width:49%">' + n + VC.meterBar(nd[i]) + '<span class="k">' + nd[i].toFixed(0) + '</span></span>'; }).join('');
  if (hp != null) { var Bd = band(N.bands, hp), eff = (Bd.eff == null ? 1 : Bd.eff) * (SIM.ITEMS ? SIM.itemsEff(a) : 1);
    h += '<br>happiness <b>' + hp.toFixed(0) + '</b> (' + Bd.label + ') &middot; efficiency ' + Math.round(eff * 100) + '%' +
      (N.loyalty && N.loyalty.bands && a.loyal != null ? ' &middot; loyalty ' + a.loyal.toFixed(0) + ' (' + band(N.loyalty.bands, a.loyal).label + ')' : ''); }
  var ask = VC.needsAsk(a, nd);
  h += '<br>wants <b>' + (a.wanted || '-') + '</b>' + (a.wanted && a.activity && a.wanted !== a.activity ? ' <span style="color:#ff9a7a">(not had: ' + a.activity + ')</span>' : '') +
    (ask.length ? ' &middot; in free time the meters ask for ' + ask.join(', then ') : ' &middot; every need met');
  if (a.intr) h += '<br>off work for ' + a.intr.act + ' (' + a.intr.need + ' at ' + a.intr.at + ')';
  if (a.errand) h += '<br>errand: ' + (a.errand.item === 'food' ? 'food for the household' : a.errand.item === 'meal' ? 'a meal out' : 'buy ' + VC.itemName(a.errand.item)) + (a.errand.place ? ' at ' + VC.placeName(a.errand.place) : '') + ' <span class="k">(' + a.errand.when + ' time, since ' + VC.hm(a.errand.since) + ')</span>';
  return h;
};
VC.taskHTML = function (a, t, m) {
  var T = a.task, P = SIM.pose(a, t, { cheap: true }), spm = VC.simSecPerMin(), h = '<div class="sec">now</div>';
  h += '<b>' + (a.activity || 'nothing') + '</b>' + (a.place ? ' at ' + VC.placeName(a.place) : '') + (T && T.indoor && t >= T.arrive ? ' <span class="k">(indoors)</span>' : '');
  if (a.cmd) h += '<br>commanded: ' + a.cmd.act + ' until ' + VC.hm(a.cmd.until) + (a.cmd.by ? ' by ' + a.cmd.by : '');
  if (T && t < T.arrive && T.legs.length) {
    var i = Math.max(0, P.leg), L = T.legs[i], end = L.lazy ? L.lazy.to : L.route ? L.route.pts[L.route.pts.length - 1] : null, ex = end ? (end.x != null ? end.x : end[0]) : null, ez = end ? (end.z != null ? end.z : end[2]) : null;
    h += '<br>on the way: leg <b>' + (i + 1) + '</b> of ' + T.legs.length + ', ' + (L.mode || 'walk') + ' on the ' + L.layer + ' layer' + (i < T.legs.length - 1 ? ' to ' + (ex != null ? ex.toFixed(0) + ', ' + ez.toFixed(0) : 'its end') + ', then on' : '') +
      ' to ' + VC.placeName(T.place) + '<br>arrives ' + VC.hm(m + (T.arrive - t) / spm) + ' <span class="k">(' + Math.max(0, (T.arrive - t) / spm).toFixed(0) + ' min; the trip ' + (T.dur / spm).toFixed(0) + ' min)</span>';
  } else if (T) h += '<br>there since ' + VC.hm(a.arrM != null ? a.arrM : a.since) + (T.failed ? ' <span style="color:#ff9a7a">(no path: drawn straight)</span>' : '');
  else h += '<br><span class="k">no task</span>';
  /* until when: the schedule's next change, on its own (lagged) day */
  var lag = a.lagFor != null && a.lag != null ? a.lag : (a.lagBase || 0), ml = m - lag, sc = SIM.schedOf(a, ml);
  if (sc && !a.plan) {
    var hr = Math.floor((((ml % 1440) + 1440) % 1440) / 60), k = 1, nx = null;
    for (; k <= 24; k++) { var hh = hr + k, s2 = hh < 24 ? sc : SIM.schedOf(a, ml - ((ml % 1440) + 1440) % 1440 + 1440); if (s2 && s2[hh % 24] !== sc[hr]) { nx = s2[hh % 24]; break; } }
    h += '<br>schedule: ' + sc[hr] + (nx ? ' until ' + VC.hm(ml - (((ml % 1440) + 1440) % 1440) % 60 + k * 60 + lag) + ', then <b>' + nx + '</b>' : ' all day');
  }
  if (a.plan) { var Lp = a.plan[a.planI]; h += '<br>itinerary: stop ' + ((a.planI || 0) + 1) + ' of ' + a.plan.length + (Lp && Lp.activity ? ' (' + Lp.activity + (Lp.place ? ' at ' + VC.placeName(Lp.place) : '') + ')' : ''); }
  if (a.wake != null && isFinite(a.wake)) h += ' <span class="k">&middot; asked again at ' + VC.hm(a.wake) + '</span>';
  return h;
};
/* what it holds: read from core/simulation (SIM.contents, 77-sim-7-stocks.js), not from the actor's fields */
VC.thingsHTML = function (a) {
  var C = SIM.contents && SIM.contents(a.id); if (!C || (!SIM.ITEMS && !C.items.length && !C.group)) return '';
  var by = function (as) { return C.items.filter(function (e) { return e.as === as; }); }, h = '<div class="sec">things</div>';
  var worn = by('worn').map(function (e) { return VC.itemName(e.item) + ' <span class="k">' + e.slot + ', ' + Math.round(e.wear * 100) + '% worn' + (e.life ? ' of ' + e.life + ' days' : '') + '</span>'; });
  if (SIM.ITEMS) h += worn.length ? 'wears ' + worn.join(' &middot; ') : '<span class="k">wears nothing the items count</span>';
  by('tool').forEach(function (e) { h += '<br>tool ' + VC.itemName(e.item) + ' <span class="k">' + Math.round(e.wear * 100) + '% worn' + (e.workLife ? ' of ' + e.workLife + ' worked hours' : '') + '</span>'; });
  if (C.toolRack) h += '<br>tools drawn at work';
  if (C.toolNeed) h += '<br><span style="color:#ff9a7a">tool broken: needs a ' + VC.itemName(C.toolNeed) + '</span>';
  var home = by('kept at home'); if (home.length) h += '<br>at home: ' + home.map(function (e) { return VC.itemName(e.item) + (e.n > 1 ? ' &times;' + e.n : ''); }).join(', ');
  C.items.forEach(function (e) { if (e.state === 'transit') h += '<br>carrying ' + VC.fmt(e.n) + ' ' + VC.itemName(e.item) + ' <span class="k">(in transit)</span>'; });
  if (a.hurt != null) h += '<br><span style="color:#ff9a7a">hurt on day ' + (a.hurt + 1) + '</span>';
  if (C.issued) h += '<br><span class="k">issued: the keeper replaces what wears out</span>';
  var Hh = C.household;
  if (Hh && Hh.mess) h += '<br>the household eats at its mess';
  else if (Hh) h += '<br>household food: ' + (Hh.items.length ? Hh.items.map(function (e) { return VC.itemName(e.item) + ' ' + Math.floor(e.n); }).join(', ') : 'none') + ' <span class="k">(' + (Hh.people || 1) + ' people, ' + (Hh.days != null ? Hh.days.toFixed(1) : '-') + ' days)</span>';
  if (C.group && C.group.items.length) h += '<br>its ' + C.group.kind + ' carries ' + C.group.items.map(function (e) { return VC.fmt(e.n) + ' ' + VC.itemName(e.item) + ' <span class="k">(' + e.as + ')</span>'; }).join(', ');
  return h;
};
VC.actorHTML = function (a, kind) {
  if (typeof SIM === 'undefined' || !a) return '';
  var t = SIM.time(), m = SIM.minute(), R = SIM.R.role[a.role] || {}, h = '';
  if (kind === 'cart' || a.cart) {
    var K = a.cart || {};
    var Cc = SIM.contents ? SIM.contents(a.id) : null, ld = Cc ? Cc.items.filter(function (e) { return e.state === 'transit'; })[0] : null;
    return '<b>Cart</b> <span class="k">' + a.id + '</span><br>' + (K.phase || 'idle') + (ld ? ', carrying ' + VC.fmt(ld.n) + ' ' + VC.itemName(ld.item) + ' <span class="k">(in transit)</span>' : '') +
      (K.site ? '<br>bound for ' + VC.placeName(K.site) : '') + (K.wh ? '<br>to the warehouse ' + VC.placeName(K.wh) : '') + (K.until != null ? '<br>until ' + VC.hm(K.until) : '') + '<br>yard: ' + VC.placeName(a.home) + VC.taskHTML(a, t, m);
  }
  if (a.animal) {
    var o = a.animal, young = a.grownAt != null && a.grownAt > m;
    h = '<b>' + (R.name || o.sp) + '</b> <span class="k">' + a.id + '</span><br>' + (a.pet ? 'a pet' : 'livestock') + (o.breed ? ', ' + o.breed : '') + (young ? ', young (grown ' + VC.hm(a.grownAt) + ')' : '') + (o.meat ? ', raised for meat' : '') +
      ' <span class="k">' + o.mass + ' kg, aggression ' + o.aggression + '</span>';
    if (a.pet) { var who = VC.homeOf(a.home); h += '<br>home ' + VC.placeName(a.home) + (who.length ? '<br>its household: ' + who.slice(0, 4).join(', ') + (who.length > 4 ? ' and ' + (who.length - 4) + ' more' : '') : ''); }
    else h += '<br>kept at ' + VC.placeName(a.herd || a.home);
    return h + VC.taskHTML(a, t, m) + VC.desiresHTML(a, m);
  }
  h = '<b>' + a.id + '</b> &middot; ' + (R.name || a.role) + ' <span class="k">' + (a.cls || '') + (a.wealth != null ? ', wealth ' + a.wealth.toFixed(2) : '') + (a.trait ? ', ' + a.trait : '') + (a.culture ? ', ' + a.culture : '') + '</span>';
  h += '<br>home ' + VC.placeName(a.home);
  h += '<div class="sec">job</div>';
  if (a.job) {
    var W = a.work && SIM.R.place[a.work], post = a.slot && a.slot.act === 'WORK' && a.slot.place === a.work ? a.slot.k + 1 : null, posts = W && W.activities && W.activities.WORK;
    h += '<b>' + a.job + '</b>' + (a.how ? ' <span class="k">(' + a.how + ')</span>' : '') + '<br>at ' + (W ? VC.placeName(a.work) : 'no workplace in reach');
    h += '<br>' + (post ? 'post <b>' + post + '</b> of ' + posts : 'not at a post now' + (posts ? ' (' + posts + ' posts there)' : '')) +
      (R.shift ? ' &middot; shift from ' + ('0' + Math.floor(R.shift[0])).slice(-2) + ':00, ' + R.shift[1] + ' h' + (a.lagBase ? ' (+' + a.lagBase + ' min)' : '') : '') +(a.off != null ? ' &middot; day off: day ' + (a.off + 1) + ' of 7' : '');
  } else h += R.name || 'none';
  return h + VC.taskHTML(a, t, m) + VC.desiresHTML(a, m) + VC.thingsHTML(a);
};

/* ---------------------------------------------------------------- the inspector's wiring and the pause's */
(function () {
  var describe = VC.describe;
  VC.describe = function (r) {
    var X = VC.INSP, hit = null;
    try { hit = VC.pickBody(r); } catch (e) { console.warn('pickBody: ' + e.message); }
    if (hit) { X.a = hit.a; X.kind = hit.kind; return VC.actorHTML(hit.a, hit.kind); }
    X.a = null;
    return describe(r);
  };
})();
VC.inspectUI = function () {
  var b = $('clk-pause'); if (b) b.onclick = function () { VC.pause(); };
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'k' || e.key === 'K' || e.key === 'Pause') { VC.pause(); e.preventDefault(); }
  });
  /* the marker over the one described, and the card kept current while the cursor rests (on real time): in core/host's
     hover tip (93-host-inspect.js, #khost-tip), which shows VC.describe's card (97-vc-host-take.js VC.inspectRay) */
  var mk = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: 0xffd34a, depthTest: false, transparent: true, opacity: 0.9 }));
  mk.renderOrder = 60; mk.visible = false; mk.userData.probeSkip = true; mk.frustumCulled = false; scene.add(mk); VC.INSP.mark = mk;
  window._frameHooks.push(function () {
    var X = VC.INSP, tip = $('khost-tip'), a = X.a, on = a && tip && tip.style.display === 'block' && window.KHOST && KHOST.hoverOn;
    if (!on) { mk.visible = false; return; }
    var t = SIM.time(), y = 2.3;
    if (X.kind === 'animal') { var g = VC.SIMBODY.animals && VC.SIMBODY.animals.live[a.id]; if (g) { mk.position.set(g.position.x, g.position.y + 1.2 + 1.2 * g.scale.y, g.position.z); mk.visible = g.visible; } else mk.visible = false; }
    else { var P = SIM.pose(a, t, { cheap: true }); if (X.kind === 'cart') y = 2.6; mk.position.set(P.x, P.y + y, P.z); mk.visible = !P.hidden; }
    var n = performance.now(); if (n - X.at < 500) return; X.at = n;
    tip.innerHTML = VC.actorHTML(a, X.kind);
    var r = tip.getBoundingClientRect(); if (r.bottom > innerHeight - 8) tip.style.top = Math.max(8, innerHeight - 8 - r.height) + 'px'; if (r.right > innerWidth - 8) tip.style.left = Math.max(8, innerWidth - 8 - r.width) + 'px';
  });
};
