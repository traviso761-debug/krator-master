/* ============================== CAVERN: the cavern setting of core/city (KCITY.cavern) ============================== */
/* [G data] Plain records and pure functions: no THREE, no DOM. The city builder's setting for places carved into rock: a
   Tungang line hold (kits/tungang/PLAN.md sections 5.1-5.6), a cavern hold in natural chambers (the Hearth hold), the
   Glaziers' scarp, and Dhelv's braid of lava tubes (settlements/dhelv/src/41-dhelv-layout.js, ported later). The plan is
   core/city/cavern/PLAN.md. Self-contained: it registers on KCITY when the module is loaded and makes the namespace when it
   is not, so a build may take this folder alone (no existing core/city page lists it, so Voth's and Verge's pages and
   golden.json do not move). It needs core/rand (KRAND) and core/space (KSPACE) loaded first.

   The frame is three-dimensional: x east, z south, y up, metres (Dhelv's and the Line's). Every lookup takes y.

   THE RECORDS (keyed by stable ids; every number in metres, every angle in radians about +y, three's rotation.y: the
   front, local +z, turns to (sin ry, cos ry)):
     node   {id, kind: 'end' | 'junction' | 'door' | 'mouth' | 'stop', x, y, z, space}
     way    {id, kind: 'gallery' | 'siding' | 'passage' | 'tube' | 'stair' | 'ramp' | 'shaft' | 'bypass' | 'ledge', a, b,
             pts [[x, y, z]...] (the floor's centreline, a to b), w (clear width), h (clear height), prim (the KCAVERN
             primitive it carves to: 'tube' | 'room' | 'stair' | 'shaft' | 'pipe' | 'none' for a way the host already
             carved), state ('kept' | 'worn' | 'abandoned' | 'fallen'), deck, band (a siding's paint band), district}
     space  {id, kind: 'hall' | 'well' | 'deck' | 'face' | 'platform' | 'chamber', x, y, z (its floor's centre), w, d, h,
             ry, deck, prim ('room' | 'none')}
     deck   {id, i, y (its floor), h (deck to deck), clear, name, light}
     site   {id, at: 'wall' | 'floor' | 'shelf' | 'in-void' | 'sunk', key (the kit's def), way (its frontage), side
             (-1 left, +1 right of the way, looking from a to b), s (metres along the way), x, y, z (wall: the foot of its
             front at the doorway; the rest: the footprint's centre), ry (the door faces local +z), w, d, h (its void's
             box: a wall site's runs d metres into the rock behind its front), deck, district, wealth, tier, phase, state}
     edit   {id, op: 'set' | 'remove' | 'add', rec | fields}: a delta by id, kept in the plan, applied in order

   THE FUNCTIONS
     KCITY.cavern.create(o)            -> H {id, world, seed, tune, nodes, ways, spaces, decks, sites, edits, districts}
     addNode/addWay/addSpace/addDeck/addSite(H, rec) -> the stored record (defaults filled); a duplicate id throws
     get(H, id), wayAt(way, s) -> {x, y, z, tx, tz, len}, wayLen(way)
     voids(H) -> [{id, owner, kind, cx, cz, hx, hz, ry, y0, y1, joins}]: every carved box (a way's segments, spaces, sites)
     rules: rock(H, o), headroom(H, o), frontage(H, o), grade(H, o), decks(H, o), daylight(H, o): each -> [problems]
            (empty when it holds), audit(H) -> {ok, problems}: all of them
     graph(H), dist(H, from) (Dijkstra along the ways), wealth(H, o) (falls with the distance from the hub: Dhelv's rule)
     frontageRun(H, wayId, o)          the step that cuts sites along a way's walls (wall sites, KRAND by world, way, slot)
     age(H, o)                         growth by phases: the far end from the heart worn, then abandoned
     nav(H)                            {nodes, edges}: the walk graph (way nodes, each site's door joined to its way)
     applyEdits(H, edits), edit(H, e)  deltas by id
     carve(H, o)                       the KCAVERN primitives in KCAVERN's own record shapes (o.prims: which kinds)
     exportPlan(H)                     {format: 'krator-cavern', version: 1, ...}: every record, the edits, the digest
     digest(H)                         an 8-hex hash of every placed record: the golden a test pins
     lineHold(o)                       the strategy for a line hold: a spine, decks, sidings, ramps and stairs between
                                       decks, sites cut along the sidings by frontageRun (PLAN.md, "The line hold") */
(function (root) {
  'use strict';
  var K = root.KCITY || (root.KCITY = { version: 1 });
  var CV = K.cavern = { version: 1 };

  function need(n) {
    var g = root[n] || (typeof globalThis !== 'undefined' ? globalThis[n] : undefined);
    if (!g) throw new Error('KCITY.cavern needs ' + n + ' loaded first (core/' + (n === 'KRAND' ? 'rand' : 'space') + ')');
    return g;
  }
  function num(x, d) { return x == null ? d : +x; }
  function r3(v) { return Math.round(v * 1000) / 1000; }

  /* the numbers the rules hold a plan to (a build passes its own over these) */
  CV.TUNE = {
    rock: 0.8,          /* rock between two voids not joined (Dhelv's 0.8 m) */
    headroom: 2.0,      /* the least clear height of any void a walker enters */
    wayHead: 2.2,       /* a way's least clear height (the Tungangs' 0.94 galleries: 2.2 to 2.6) */
    grade: 0.06,        /* the steepest a level way may run */
    ramp: 0.125,        /* the steepest a ramp may run (1 in 8) */
    stair: 0.8,         /* the steepest a stair may run (rise over run) */
    riser: [0.15, 0.2], /* the step rule: a stair's risers between these */
    deckTol: 0.05,      /* a site's floor this close to its deck's */
    doorTol: 0.6,       /* a wall site's door this close to its way's wall */
    cell: 16,           /* the occupancy index's cell (KSPACE) */
    daylight: 40        /* a site that needs daylight within this of a well */
  };

  CV.create = function (o) {
    o = o || {};
    var tune = {}, k;
    for (k in CV.TUNE) tune[k] = CV.TUNE[k];
    if (o.tune) for (k in o.tune) tune[k] = o.tune[k];
    return { format: 'krator-cavern', version: 1, id: o.id || 'cavern', world: num(o.world, 1) >>> 0,
      seed: num(o.seed, 7) >>> 0, tune: tune, nodes: [], ways: [], spaces: [], decks: [], sites: [], edits: [],
      districts: o.districts ? o.districts.slice() : [], byId: {} };
  };

  function put(H, list, rec, what) {
    if (rec.id == null) throw new Error('KCITY.cavern: a ' + what + ' needs an id');
    if (H.byId[rec.id]) throw new Error('KCITY.cavern: id ' + rec.id + ' is taken');
    rec.type = what; H.byId[rec.id] = rec; list.push(rec); return rec;
  }
  CV.get = function (H, id) { return H.byId[id] || null; };

  CV.addNode = function (H, n) {
    return put(H, H.nodes, { id: n.id, kind: n.kind || 'junction', x: +n.x, y: num(n.y, 0), z: +n.z, space: n.space || null,
      on: n.on ? { way: n.on.way, s: +n.on.s } : null }, 'node');
  };
  CV.addWay = function (H, w) {
    var a = H.byId[w.a], b = H.byId[w.b];
    if (!a || !b) throw new Error('KCITY.cavern: way ' + w.id + ' joins unknown nodes ' + w.a + ', ' + w.b);
    var pts = w.pts ? w.pts.map(function (p) { return [+p[0], +p[1], +p[2]]; }) : [[a.x, a.y, a.z], [b.x, b.y, b.z]];
    var kind = w.kind || 'passage';
    var prim = w.prim || (kind === 'stair' ? 'stair' : kind === 'shaft' ? 'shaft' : kind === 'tube' ? 'tube' : 'room');
    return put(H, H.ways, { id: w.id, kind: kind, a: w.a, b: w.b, pts: pts, w: num(w.w, 2.4), h: num(w.h, 2.6), prim: prim,
      state: w.state || 'kept', deck: w.deck == null ? null : w.deck, band: w.band || null, district: w.district || null,
      joins: (w.joins || []).slice() }, 'way');
  };
  CV.addSpace = function (H, s) {
    return put(H, H.spaces, { id: s.id, kind: s.kind || 'hall', x: +s.x, y: num(s.y, 0), z: +s.z, w: +s.w, d: +s.d, h: +s.h,
      ry: num(s.ry, 0), deck: s.deck == null ? null : s.deck, prim: s.prim || 'room', joins: (s.joins || []).slice() }, 'space');
  };
  CV.addDeck = function (H, d) {
    return put(H, H.decks, { id: d.id, i: d.i, y: +d.y, h: num(d.h, 4.5), clear: num(d.clear, 2.6), name: d.name || '',
      light: d.light || null }, 'deck');
  };
  CV.addSite = function (H, s) {
    return put(H, H.sites, { id: s.id, at: s.at || 'wall', key: s.key, way: s.way || null, side: s.side == null ? null : s.side,
      s: s.s == null ? null : s.s, x: +s.x, y: num(s.y, 0), z: +s.z, ry: num(s.ry, 0), w: +s.w, d: +s.d, h: +s.h,
      deck: s.deck == null ? null : s.deck, district: s.district || null, wealth: s.wealth == null ? null : s.wealth,
      tier: s.tier || null, phase: num(s.phase, 0), state: s.state || 'kept', needs: s.needs || null,
      joins: (s.joins || []).slice() }, 'site');
  };

  /* ---------------------------------------------------------------- a way's geometry */
  CV.wayLen = function (w) {
    var L = 0;
    for (var i = 1; i < w.pts.length; i++) L += Math.hypot(w.pts[i][0] - w.pts[i - 1][0], w.pts[i][2] - w.pts[i - 1][2]);
    return L;
  };
  /* the point s metres (along the plan, x-z) from a: its floor, and the unit tangent */
  CV.wayAt = function (w, s) {
    var P = w.pts, acc = 0;
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[2] - a[2]);
      if (s <= acc + L || i === P.length - 1) {
        var t = L > 0 ? Math.max(0, Math.min(1, (s - acc) / L)) : 0;
        return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t,
          tx: L > 0 ? (b[0] - a[0]) / L : 1, tz: L > 0 ? (b[2] - a[2]) / L : 0, len: CV.wayLen(w) };
      }
      acc += L;
    }
    var p = P[0];
    return { x: p[0], y: p[1], z: p[2], tx: 1, tz: 0, len: 0 };
  };
  /* the nearest point of a way to (x, y, z): {s, x, y, z, d (plan), dy} */
  CV.nearestOn = function (w, x, y, z) {
    var P = w.pts, best = null, acc = 0;
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], dx = b[0] - a[0], dz = b[2] - a[2], L2 = dx * dx + dz * dz, L = Math.sqrt(L2);
      var t = L2 > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[2]) * dz) / L2)) : 0;
      var px = a[0] + dx * t, pz = a[2] + dz * t, py = a[1] + (b[1] - a[1]) * t, d = Math.hypot(x - px, z - pz);
      if (!best || d + Math.abs(y - py) * 0.5 < best.d + Math.abs(best.dy) * 0.5) best = { s: acc + L * t, x: px, y: py, z: pz, d: d, dy: y - py };
      acc += L;
    }
    return best;
  };

  /* ---------------------------------------------------------------- the voids: every carved box */
  function joinSet(H) {
    /* ids that may touch: a way and its end nodes' other ways, a site and its way, a space and the ways ending in it */
    var J = {};
    function link(a, b) { (J[a] = J[a] || {})[b] = 1; (J[b] = J[b] || {})[a] = 1; }
    var byNode = {};
    H.ways.forEach(function (w) { (byNode[w.a] = byNode[w.a] || []).push(w.id); (byNode[w.b] = byNode[w.b] || []).push(w.id); });
    Object.keys(byNode).forEach(function (n) {
      var L = byNode[n], node = H.byId[n];
      for (var i = 0; i < L.length; i++) { for (var j = i + 1; j < L.length; j++) link(L[i], L[j]); if (node && node.space) link(L[i], node.space); }
    });
    H.ways.forEach(function (w) { w.joins.forEach(function (j) { link(w.id, j); }); });
    H.nodes.forEach(function (n) { if (n.on) (byNode[n.id] || []).forEach(function (w) { link(w, n.on.way); }); });
    H.sites.forEach(function (s) { if (s.way) link(s.id, s.way); s.joins.forEach(function (j) { link(s.id, j); }); });
    H.spaces.forEach(function (s) { s.joins.forEach(function (j) { link(s.id, j); }); });
    /* a way that runs in a space (an end node names it: a platform in its station hall) is joined to it, and so are the sites
       on its walls and the ways that open off it through a node lying along it */
    function spacesOf(wid) { var w = H.byId[wid], out = []; if (!w) return out;
      [w.a, w.b].forEach(function (n) { var N = H.byId[n]; if (N && N.space && out.indexOf(N.space) < 0) out.push(N.space); }); return out; }
    H.ways.forEach(function (w) { spacesOf(w.id).forEach(function (sp) { link(w.id, sp); }); });
    H.sites.forEach(function (s) { if (s.way) spacesOf(s.way).forEach(function (sp) { link(s.id, sp); }); });
    H.nodes.forEach(function (n) { if (n.on) spacesOf(n.on.way).forEach(function (sp) { (byNode[n.id] || []).forEach(function (w) { link(w, sp); }); }); });
    return J;
  }
  CV.voids = function (H) {
    var out = [];
    H.ways.forEach(function (w) {
      if (w.prim === 'none') return;
      for (var i = 1; i < w.pts.length; i++) {
        var a = w.pts[i - 1], b = w.pts[i], L = Math.hypot(b[0] - a[0], b[2] - a[2]);
        if (L < 1e-6) continue;
        out.push({ id: w.id + '#' + i, owner: w.id, kind: 'way', cx: (a[0] + b[0]) / 2, cz: (a[2] + b[2]) / 2, hx: w.w / 2,
          hz: L / 2, ry: Math.atan2(b[0] - a[0], b[2] - a[2]), y0: Math.min(a[1], b[1]), y1: Math.max(a[1], b[1]) + w.h, h: w.h });
      }
    });
    H.spaces.forEach(function (s) {
      if (s.prim === 'none') return;
      out.push({ id: s.id, owner: s.id, kind: 'space', cx: s.x, cz: s.z, hx: s.w / 2, hz: s.d / 2, ry: s.ry, y0: s.y, y1: s.y + s.h, h: s.h });
    });
    H.sites.forEach(function (s) {
      if (s.state === 'removed') return;
      var c = siteCentre(s);
      out.push({ id: s.id, owner: s.id, kind: 'site', cx: c.x, cz: c.z, hx: s.w / 2, hz: s.d / 2, ry: s.ry, y0: s.y, y1: s.y + s.h, h: s.h });
    });
    return out;
  };
  /* a wall site's box runs d into the rock behind its front (local -z); the others are centred on x, z */
  function siteCentre(s) {
    if (s.at !== 'wall' && s.at !== 'shelf') return { x: s.x, z: s.z };
    return { x: s.x - Math.sin(s.ry) * s.d / 2, z: s.z - Math.cos(s.ry) * s.d / 2 };
  }
  CV.siteCentre = siteCentre;
  /* the door of a site: a wall site's front foot; another's front edge's middle */
  CV.door = function (s) {
    if (s.at === 'wall' || s.at === 'shelf') return { x: s.x, y: s.y, z: s.z };
    return { x: s.x + Math.sin(s.ry) * s.d / 2, y: s.y, z: s.z + Math.cos(s.ry) * s.d / 2 };
  };

  /* the gap between two oriented boxes in plan, grown each by m: true when they overlap (separating axes) */
  function obbHit(A, B, m) {
    var axes = [[Math.cos(A.ry), -Math.sin(A.ry)], [Math.sin(A.ry), Math.cos(A.ry)], [Math.cos(B.ry), -Math.sin(B.ry)], [Math.sin(B.ry), Math.cos(B.ry)]];
    var dx = B.cx - A.cx, dz = B.cz - A.cz;
    for (var i = 0; i < 4; i++) {
      var ax = axes[i][0], az = axes[i][1];
      var ra = (A.hx + m) * Math.abs(ax * Math.cos(A.ry) - az * Math.sin(A.ry)) + (A.hz + m) * Math.abs(ax * Math.sin(A.ry) + az * Math.cos(A.ry));
      var rb = (B.hx + m) * Math.abs(ax * Math.cos(B.ry) - az * Math.sin(B.ry)) + (B.hz + m) * Math.abs(ax * Math.sin(B.ry) + az * Math.cos(B.ry));
      if (Math.abs(dx * ax + dz * az) >= ra + rb - 1e-9) return false;
    }
    return true;
  }
  CV.obbHit = obbHit;
  function vHit(A, B, rock) {
    if (A.y1 + rock <= B.y0 + 1e-9 || B.y1 + rock <= A.y0 + 1e-9) return false;
    return obbHit(A, B, rock / 2);
  }
  /* the occupancy index: every void filed under its plan square in KSPACE */
  CV.index = function (H, V) {
    var S = need('KSPACE').create({ cell: H.tune.cell });
    (V || CV.voids(H)).forEach(function (v) { S.insert(v, v.cx, v.cz, Math.hypot(v.hx, v.hz)); });
    return S;
  };

  /* ---------------------------------------------------------------- THE RULES: each a plain function -> [problems] */
  CV.rock = function (H, o) {
    o = o || {};
    var rock = num(o.rock, H.tune.rock), V = CV.voids(H), S = CV.index(H, V), J = joinSet(H), out = [], seen = {}, q = [];
    V.forEach(function (A) {
      S.query(A.cx, A.cz, Math.hypot(A.hx, A.hz) + rock, q);
      q.forEach(function (B) {
        if (A === B || A.owner === B.owner) return;
        var key = A.id < B.id ? A.id + '|' + B.id : B.id + '|' + A.id;
        if (seen[key]) return; seen[key] = 1;
        if (J[A.owner] && J[A.owner][B.owner]) return;
        if (vHit(A, B, rock)) out.push({ rule: 'rock', a: A.owner, b: B.owner, msg: A.owner + ' and ' + B.owner + ' within ' + rock + ' m of rock' });
      });
    });
    return out;
  };
  CV.headroom = function (H) {
    var out = [], t = H.tune;
    H.ways.forEach(function (w) { if (w.kind !== 'shaft' && w.h < t.wayHead - 1e-9) out.push({ rule: 'headroom', a: w.id, msg: w.id + ' is ' + w.h + ' m high' }); });
    H.sites.forEach(function (s) { if (s.h < t.headroom - 1e-9) out.push({ rule: 'headroom', a: s.id, msg: s.id + ' is ' + s.h + ' m high' }); });
    H.spaces.forEach(function (s) { if (s.h < t.headroom - 1e-9) out.push({ rule: 'headroom', a: s.id, msg: s.id + ' is ' + s.h + ' m high' }); });
    return out;
  };
  /* every site's door on a way: within doorTol of the way's wall (a wall site) or of its floor (another), at its height,
     the front facing the way */
  CV.frontage = function (H) {
    var out = [], t = H.tune;
    H.sites.forEach(function (s) {
      var w = s.way && H.byId[s.way];
      if (!w) { out.push({ rule: 'frontage', a: s.id, msg: s.id + ' has no way' }); return; }
      var D = CV.door(s), n = CV.nearestOn(w, D.x, D.y, D.z), lim = (s.at === 'wall' || s.at === 'shelf') ? w.w / 2 + t.doorTol : w.w / 2 + Math.max(s.w, s.d) / 2 + t.doorTol;
      if (n.d > lim + 1e-9) out.push({ rule: 'frontage', a: s.id, msg: s.id + "'s door is " + n.d.toFixed(2) + ' m from ' + w.id });
      if (Math.abs(n.dy) > 0.35) out.push({ rule: 'frontage', a: s.id, msg: s.id + "'s door is " + n.dy.toFixed(2) + ' m off its way\'s floor' });
      var fx = Math.sin(s.ry), fz = Math.cos(s.ry), vx = n.x - D.x, vz = n.z - D.z, vl = Math.hypot(vx, vz);
      if (vl > 0.3 && (fx * vx + fz * vz) / vl < 0.5) out.push({ rule: 'frontage', a: s.id, msg: s.id + ' faces away from ' + w.id });
    });
    return out;
  };
  /* grades: level ways under `grade`, ramps under `ramp`, stairs under `stair` with risers by the step rule */
  CV.grade = function (H) {
    var out = [], t = H.tune;
    H.ways.forEach(function (w) {
      if (w.kind === 'shaft') return;
      var lim = w.kind === 'ramp' ? t.ramp : w.kind === 'stair' ? t.stair : t.grade;
      for (var i = 1; i < w.pts.length; i++) {
        var a = w.pts[i - 1], b = w.pts[i], L = Math.hypot(b[0] - a[0], b[2] - a[2]), g = L > 0 ? Math.abs(b[1] - a[1]) / L : (b[1] !== a[1] ? Infinity : 0);
        if (g > lim + 1e-9) out.push({ rule: 'grade', a: w.id, msg: w.id + ' (' + w.kind + ') runs at ' + g.toFixed(3) + ' over ' + lim });
      }
      if (w.kind === 'stair') {
        /* the treads: one every 0.28 m of run (the going), so the risers are the rise over that many */
        var rise = Math.abs(w.pts[w.pts.length - 1][1] - w.pts[0][1]), n = Math.max(1, Math.round(CV.wayLen(w) / 0.28)), r = rise / n;
        if (r < t.riser[0] - 1e-9 || r > t.riser[1] + 1e-9) out.push({ rule: 'grade', a: w.id, msg: w.id + "'s risers are " + r.toFixed(3) + ' m' });
      }
    });
    return out;
  };
  /* deck alignment: a site or way given a deck stands at that deck's floor */
  CV.decks = function (H) {
    var out = [], t = H.tune, D = {};
    H.decks.forEach(function (d) { D[d.i] = d; });
    function chk(r, y) {
      if (r.deck == null) return;
      var d = D[r.deck];
      if (!d) out.push({ rule: 'deck', a: r.id, msg: r.id + ' names deck ' + r.deck + ', which is not in the plan' });
      else if (Math.abs(y - d.y) > t.deckTol + 1e-9) out.push({ rule: 'deck', a: r.id, msg: r.id + ' stands ' + (y - d.y).toFixed(2) + ' m off deck ' + r.deck });
    }
    H.sites.forEach(function (s) { chk(s, s.y); });
    H.ways.forEach(function (w) { if (w.kind !== 'ramp' && w.kind !== 'stair' && w.kind !== 'shaft') w.pts.forEach(function (p) { chk(w, p[1]); }); });
    return out;
  };
  /* daylight: a site that needs it (needs: 'daylight') within `daylight` m of a well's open floor */
  CV.daylight = function (H) {
    var out = [], wells = H.spaces.filter(function (s) { return s.kind === 'well'; });
    H.sites.forEach(function (s) {
      if (s.needs !== 'daylight') return;
      if (!wells.some(function (w) { return Math.hypot(w.x - s.x, w.z - s.z) <= H.tune.daylight + Math.max(w.w, w.d) / 2; }))
        out.push({ rule: 'daylight', a: s.id, msg: s.id + ' needs daylight and no well is near' });
    });
    return out;
  };
  CV.audit = function (H) {
    var p = [].concat(CV.rock(H), CV.headroom(H), CV.frontage(H), CV.grade(H), CV.decks(H), CV.daylight(H));
    return { ok: p.length === 0, problems: p };
  };

  /* ---------------------------------------------------------------- the graph, distances and wealth */
  CV.graph = function (H) {
    var adj = {};
    H.nodes.forEach(function (n) { adj[n.id] = []; });
    H.ways.forEach(function (w) {
      if (w.state === 'fallen') return;
      var L = CV.wayLen(w) + Math.abs(w.pts[w.pts.length - 1][1] - w.pts[0][1]);
      adj[w.a].push({ to: w.b, way: w.id, len: L }); adj[w.b].push({ to: w.a, way: w.id, len: L });
    });
    /* the nodes that lie on a way (a siding's junction on the spine, a stair's foot) split it: its ends and those nodes are
       chained in order of their distance along it, so a walk from one to the next goes straight there */
    var on = {};
    H.nodes.forEach(function (n) { if (n.on) (on[n.on.way] = on[n.on.way] || []).push(n); });
    Object.keys(on).forEach(function (wid) {
      var w = H.byId[wid]; if (!w || w.state === 'fallen') return;
      var L = CV.wayLen(w), C = [{ id: w.a, s: 0 }].concat(on[wid].map(function (n) { return { id: n.id, s: n.on.s }; })
        .sort(function (a, b) { return a.s - b.s || (a.id < b.id ? -1 : 1); }), [{ id: w.b, s: L }]);
      for (var i = 1; i < C.length; i++) { var d = Math.max(0, C[i].s - C[i - 1].s);
        adj[C[i - 1].id].push({ to: C[i].id, way: wid, len: d }); adj[C[i].id].push({ to: C[i - 1].id, way: wid, len: d }); }
    });
    return adj;
  };
  /* Dijkstra from a node: {nodeId: metres}. Ties broken by id, so it is the same in every engine */
  CV.dist = function (H, from) {
    var adj = CV.graph(H), D = {}, done = {}, open = [from];
    D[from] = 0;
    while (open.length) {
      open.sort(function (a, b) { return D[a] - D[b] || (a < b ? -1 : a > b ? 1 : 0); });
      var n = open.shift();
      if (done[n]) continue; done[n] = 1;
      (adj[n] || []).forEach(function (e) {
        var d = D[n] + e.len;
        if (D[e.to] == null || d < D[e.to] - 1e-9) { D[e.to] = d; open.push(e.to); }
      });
    }
    return D;
  };
  /* a site's distance from a node along the graph: to its way's nearer end, then along the way to its door */
  CV.siteDist = function (H, D, s) {
    var w = H.byId[s.way];
    if (!w) return Infinity;
    var Dd = CV.door(s), n = CV.nearestOn(w, Dd.x, Dd.y, Dd.z), L = CV.wayLen(w);
    var da = D[w.a] == null ? Infinity : D[w.a] + n.s, db = D[w.b] == null ? Infinity : D[w.b] + (L - n.s);
    return Math.min(da, db);
  };
  /* wealth 1 at the hub falling to 0 at `reach` metres (Dhelv's rule); writes s.wealth and returns {siteId: wealth} */
  CV.wealth = function (H, o) {
    var D = CV.dist(H, o.hub), reach = num(o.reach, 300), out = {};
    H.sites.forEach(function (s) { var d = CV.siteDist(H, D, s); s.wealth = r3(Math.max(0, 1 - d / reach)); out[s.id] = s.wealth; });
    return out;
  };
  /* growth by phases (PLAN.md 5.3): a hold that moved when its heat moved leaves its far end worn, then abandoned. Sites past
     `worn` metres from the heart are worn, past `abandoned` abandoned; an explicit edit wins (applyEdits runs after) */
  CV.age = function (H, o) {
    var D = CV.dist(H, o.heart), wn = num(o.worn, Infinity), ab = num(o.abandoned, Infinity);
    H.sites.forEach(function (s) {
      var d = CV.siteDist(H, D, s);
      s.state = d > ab ? 'abandoned' : d > wn ? 'worn' : 'kept';
      s.phase = d > ab ? 2 : d > wn ? 1 : 0;
    });
    H.ways.forEach(function (w) {
      var d = Math.min(D[w.a] == null ? Infinity : D[w.a], D[w.b] == null ? Infinity : D[w.b]);
      if (w.state !== 'fallen') w.state = d > ab ? 'abandoned' : d > wn ? 'worn' : 'kept';
    });
  };

  /* ---------------------------------------------------------------- THE FRONTAGE RUN: sites cut along a way's walls
     frontageRun(H, wayId, o): walks the way from o.from to o.to (metres; default its whole length less o.ends) on each side
     in o.sides ([-1, 1]), choosing a def at each slot from o.defs [{key, w, d, h, weight, at}] by KRAND (world, way's index,
     side, slot, salt), cutting it into the wall (a wall site: its front on the wall, its box d into the rock) when the rock
     rule holds against every void already planned; else it tries the next def by weight order, then steps on by o.step.
     o.gap: rock between neighbours along the wall; o.deck, o.district, o.state; o.skip(s, side) -> true to leave a stretch
     (a door, a junction). Returns the sites it cut */
  CV.frontageRun = function (H, wayId, o) {
    var KR = need('KRAND'), w = H.byId[wayId];
    if (!w) throw new Error('KCITY.cavern.frontageRun: no way ' + wayId);
    var L = CV.wayLen(w), ends = num(o.ends, 2), s0 = num(o.from, ends), s1 = num(o.to, L - ends), gap = num(o.gap, H.tune.rock),
      sides = o.sides || [-1, 1], defs = o.defs, salt = num(o.salt, 0), made = [];
    var wi = H.ways.indexOf(w), seed = KR.child(H.world, 'cavern:' + H.id), tw = defs.reduce(function (a, d) { return a + num(d.weight, 1); }, 0);
    var V = CV.voids(H), J = joinSet(H), S = CV.index(H, V), q = [];
    sides.forEach(function (side) {
      var s = s0, slot = 0;
      while (s < s1 - 0.5) {
        if (o.skip && o.skip(s, side)) { s += num(o.step, 1); slot++; continue; }
        var u = KR.unit(KR.hash(seed, wi, side + 2, slot, salt)), acc = 0, first = 0;
        for (var i = 0; i < defs.length; i++) { acc += num(defs[i].weight, 1) / tw; if (u < acc) { first = i; break; } first = i; }
        var placed = null;
        for (var j = 0; j < defs.length && !placed; j++) {
          var d = defs[(first + j) % defs.length];
          if (s + d.w > s1 + 1e-9) continue;
          var mid = s + d.w / 2, P = CV.wayAt(w, mid), nx = -P.tz * side, nz = P.tx * side;
          /* the front on the wall (half the way's width out), facing back into the way */
          var rec = { id: (o.prefix || wayId) + (side < 0 ? '.l' : '.r') + slot, at: d.at || 'wall', key: d.key, way: wayId, side: side,
            s: r3(mid), x: r3(P.x + nx * w.w / 2), y: r3(P.y), z: r3(P.z + nz * w.w / 2), ry: Math.atan2(-nx, -nz), w: d.w, d: d.d, h: d.h,
            deck: o.deck == null ? w.deck : o.deck, district: o.district || w.district, state: o.state || 'kept', tier: d.tier || null };
          var c = siteCentre(rec), B = { id: rec.id, owner: rec.id, cx: c.x, cz: c.z, hx: d.w / 2 + gap / 2, hz: d.d / 2, ry: rec.ry, y0: rec.y, y1: rec.y + d.h };
          S.query(B.cx, B.cz, Math.hypot(B.hx, B.hz) + H.tune.rock, q);
          var clash = q.some(function (A) {
            if (A.owner === wayId) return false;
            return vHit(A, B, H.tune.rock);
          });
          if (!clash) placed = { rec: rec, d: d, B: B };
        }
        if (placed) {
          var r = CV.addSite(H, placed.rec);
          var v = { id: r.id, owner: r.id, kind: 'site', cx: placed.B.cx, cz: placed.B.cz, hx: r.w / 2, hz: r.d / 2, ry: r.ry, y0: r.y, y1: r.y + r.h };
          V.push(v); S.insert(v, v.cx, v.cz, Math.hypot(v.hx, v.hz));
          made.push(r); s += placed.d.w + gap;
        } else s += num(o.step, 1);
        slot++;
      }
    });
    return made;
  };

  /* ---------------------------------------------------------------- the walk graph */
  CV.nav = function (H) {
    var nodes = [], edges = [], seen = {};
    function node(id, x, y, z) { if (!seen[id]) { seen[id] = 1; nodes.push({ id: id, x: r3(x), y: r3(y), z: r3(z) }); } }
    var cuts = {};
    H.nodes.forEach(function (n) { if (n.on) (cuts[n.on.way] = cuts[n.on.way] || []).push({ s: n.on.s, id: n.id, x: n.x, y: n.y, z: n.z, site: null }); });
    H.sites.forEach(function (s) {
      var w = H.byId[s.way]; if (!w || s.state === 'removed') return;
      var D = CV.door(s), n = CV.nearestOn(w, D.x, D.y, D.z);
      (cuts[w.id] = cuts[w.id] || []).push({ s: n.s, id: s.id + ':way', x: n.x, y: n.y, z: n.z, site: s, door: D });
    });
    H.ways.forEach(function (w) {
      if (w.state === 'fallen') return;
      var A = H.byId[w.a], B = H.byId[w.b], L = CV.wayLen(w);
      node(A.id, A.x, A.y, A.z); node(B.id, B.x, B.y, B.z);
      var C = (cuts[w.id] || []).slice().sort(function (a, b) { return a.s - b.s || (a.id < b.id ? -1 : 1); });
      var prev = { id: A.id, s: 0, y: A.y };
      C.forEach(function (c) {
        node(c.id, c.x, c.y, c.z);
        edges.push({ id: w.id + ':' + prev.id + '>' + c.id, a: prev.id, b: c.id, way: w.id, kind: w.kind, w: w.w, len: r3(Math.max(0, c.s - prev.s) + Math.abs(c.y - prev.y)) });
        if (c.site) { node(c.site.id, c.door.x, c.door.y, c.door.z);
        edges.push({ id: c.site.id + ':door', a: c.id, b: c.site.id, way: w.id, kind: 'door', w: Math.min(1.2, c.site.w), len: r3(Math.hypot(c.door.x - c.x, c.door.z - c.z)) }); }
        prev = c;
      });
      edges.push({ id: w.id + ':' + prev.id + '>' + B.id, a: prev.id, b: B.id, way: w.id, kind: w.kind, w: w.w, len: r3(Math.max(0, L - prev.s) + Math.abs(B.y - prev.y)) });
    });
    return { nodes: nodes, edges: edges };
  };

  /* ---------------------------------------------------------------- edits: deltas by id */
  CV.edit = function (H, e) {
    var r = H.byId[e.id];
    if (e.op === 'add') {
      var t = e.rec.type || e.type;
      ({ node: CV.addNode, way: CV.addWay, space: CV.addSpace, deck: CV.addDeck, site: CV.addSite })[t](H, e.rec);
    } else if (e.op === 'remove') {
      if (!r) throw new Error('KCITY.cavern.edit: no ' + e.id);
      if (r.type === 'site') r.state = 'removed'; else if (r.type === 'way') r.state = 'fallen';
      else throw new Error('KCITY.cavern.edit: only sites and ways are removed (' + e.id + ')');
    } else if (e.op === 'set') {
      if (!r) throw new Error('KCITY.cavern.edit: no ' + e.id);
      for (var k in e.fields) if (k !== 'id' && k !== 'type') r[k] = e.fields[k];
    } else throw new Error('KCITY.cavern.edit: op ' + e.op);
    H.edits.push(JSON.parse(JSON.stringify(e)));
    return r || H.byId[e.rec.id];
  };
  CV.applyEdits = function (H, list) { (list || []).forEach(function (e) { CV.edit(H, e); }); return H; };

  /* ---------------------------------------------------------------- the carve: KCAVERN's primitives
     carve(H, o) -> [{id, prim, ...}] in KCAVERN's record shapes: a way's segment a `room` box (or a `tube`), a stair a `stair`,
     a shaft a `shaft`, a space a `room`, a site the kit's own void plan (o.plan(site) -> [boxes in the site's frame:
     {x, y, z, w, d, h} centred, y the floor], or its box). Each primitive carries `owner` (the record's id) and `deck`. */
  CV.carve = function (H, o) {
    o = o || {};
    var out = [], ov = num(o.overlap, 0.4);
    /* a box (centre x, z; floor y; w across local x, d along local z; turned ry) as a KCAVERN room's polygon */
    function polyOf(cx, cz, w, d, ry) {
      var c = Math.cos(ry), sn = Math.sin(ry), P = [];
      [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].forEach(function (q) {
        P.push([r3(cx + q[0] * c + q[1] * sn), r3(cz - q[0] * sn + q[1] * c)]);
      });
      return P;
    }
    function room(id, owner, cx, cy, cz, w, d, h, ry, deck, extra) {
      var r = { id: id, prim: 'room', owner: owner, poly: polyOf(cx, cz, w, d, ry), y: r3(cy), h: r3(h), deck: deck };
      if (extra) for (var k in extra) r[k] = extra[k];
      out.push(r);
    }
    H.ways.forEach(function (w) {
      if (w.prim === 'none' || w.state === 'fallen') return;
      var p0 = w.pts[0], pn = w.pts[w.pts.length - 1];
      if (w.prim === 'shaft') { out.push({ id: w.id, prim: 'shaft', owner: w.id, c: [p0[0], p0[2]], y0: Math.min(p0[1], pn[1]), y1: Math.max(p0[1], pn[1]) + w.h, r0: w.w / 2, floor: true, deck: w.deck }); return; }
      if (w.prim === 'tube') { out.push({ id: w.id, prim: 'tube', owner: w.id, pts: w.pts.map(function (p) { return p.slice(); }), w: w.w, h: w.h, deck: w.deck }); return; }
      for (var i = 1; i < w.pts.length; i++) {
        var a = w.pts[i - 1], b = w.pts[i], L = Math.hypot(b[0] - a[0], b[2] - a[2]);
        if (L < 1e-6) continue;
        /* a sloping run (a ramp or a stair) is KCAVERN's stair: a square section cut flat at both ends, run ov past each end so
           it overlaps the floors it joins (Dhelv's lesson: a doorway passage overlaps the floors it joins) */
        var ux = (b[0] - a[0]) / L, uz = (b[2] - a[2]) / L;
        if (w.prim === 'stair' || Math.abs(b[1] - a[1]) > 1e-6)
          out.push({ id: w.id + '#' + i, prim: 'stair', owner: w.id, a: [r3(a[0] - ux * ov), a[1], r3(a[2] - uz * ov)], b: [r3(b[0] + ux * ov), b[1], r3(b[2] + uz * ov)], w: w.w, h: w.h, deck: w.deck, ramp: w.kind === 'ramp' });
        else room(w.id + '#' + i, w.id, (a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2, w.w, L + 2 * ov, w.h, Math.atan2(b[0] - a[0], b[2] - a[2]), w.deck);
      }
    });
    H.spaces.forEach(function (s) { if (s.prim !== 'none') room(s.id, s.id, s.x, s.y, s.z, s.w, s.d, s.h, s.ry, s.deck); });
    H.sites.forEach(function (s) {
      if (s.state === 'removed') return;
      var plan = o.plan ? o.plan(s) : null, c = siteCentre(s), cs = Math.cos(s.ry), sn = Math.sin(s.ry);
      if (!plan || !plan.length) { room(s.id, s.id, c.x, s.y, c.z, s.w, s.d + ov, s.h, s.ry, s.deck, { site: s.id }); return; }
      plan.forEach(function (v, i) {
        /* a plan's stair (a climb cut in the rock: {kind: 'stair', a, b, w, h} in the site's frame) is KCAVERN's stair */
        if (v.kind === 'stair' && v.a && v.b) {
          var T = function (q) { return [r3(s.x + q[0] * cs + q[2] * sn), r3(s.y + q[1]), r3(s.z - q[0] * sn + q[2] * cs)]; };
          out.push({ id: s.id + '.' + (v.id || i), prim: 'stair', owner: s.id, a: T(v.a), b: T(v.b), w: v.w, h: v.h, deck: s.deck, site: s.id, room: v.id || i });
          return;
        }
        /* the plan's boxes in the site's frame (a wall site's origin at its front, the rooms at local -z) */
        var X = s.x + v.x * cs + v.z * sn, Z = s.z - v.x * sn + v.z * cs;
        room(s.id + '.' + (v.id || i), s.id, X, s.y + num(v.y, 0), Z, v.w, v.d, v.h, s.ry + num(v.ry, 0), s.deck, { site: s.id, room: v.id || i, kind: v.kind || null });
      });
    });
    return out;
  };

  /* ---------------------------------------------------------------- export and digest */
  function clean(r) { var o = {}; for (var k in r) if (k !== 'type') o[k] = r[k]; return o; }
  CV.digest = function (H) {
    var KR = need('KRAND'), h = 0x2545F491;
    function mix(v) { h = KR.hash(h, v); }
    function str(s) { s = String(s == null ? '' : s); for (var i = 0; i < s.length; i++) mix(s.charCodeAt(i)); }
    H.nodes.forEach(function (n) { str(n.id); mix(n.x * 100); mix(n.y * 100); mix(n.z * 100); });
    H.ways.forEach(function (w) { str(w.id); str(w.kind); str(w.state); w.pts.forEach(function (p) { mix(p[0] * 100); mix(p[1] * 100); mix(p[2] * 100); }); });
    H.sites.forEach(function (s) { str(s.id); str(s.key); str(s.state); mix(s.x * 100); mix(s.y * 100); mix(s.z * 100); mix(s.ry * 1000); mix(s.w * 100); mix(s.d * 100); });
    H.spaces.forEach(function (s) { str(s.id); mix(s.x * 100); mix(s.y * 100); mix(s.z * 100); });
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  };
  CV.exportPlan = function (H) {
    return { format: 'krator-cavern', version: 1, id: H.id, world: H.world, tune: H.tune, nodes: H.nodes.map(clean),
      ways: H.ways.map(clean), spaces: H.spaces.map(clean), decks: H.decks.map(clean), sites: H.sites.map(clean),
      districts: H.districts.slice(), edits: H.edits.slice(), nav: CV.nav(H), digest: CV.digest(H) };
  };

  /* ---------------------------------------------------------------- THE LINE HOLD: the strategy (PLAN.md, "The line hold")
     lineHold(o) -> H. A hold is a station on a line (kits/tungang/PLAN.md 5.1): the spine its platform (or the way that
     leads off the Line to it), decks 4.5 m apart (5.2), sidings off the spine as streets, ramps and stairs between decks,
     sites cut along the sidings. Everything comes in as data; the strategy decides only where along the walls.
       o.id, o.world, o.tune
       o.decks    [{i, y, name, light}]
       o.spine    {id, pts, w, h, deck, prim ('none': the host carved it), kind, space: a space record the spine runs in}
       o.spines   more spines of the same shape (a terminus's other platform); o.nodes more nodes (`on` a spine at s: a stair's
                  foot); o.links ways joining existing nodes (a footbridge, a stair, a branch); o.sites sites placed by hand
       o.spaces   [space records] (halls, the platform cavern: prim 'none' when the host carved it)
       o.sidings  [{id, at (metres along the spine), side, len, deck, w, h, band, district, kind, from (another siding's id:
                   branch off it instead), drop (a ramp or stair down or up to its deck before it runs level)}]
       o.civic    [{id, key, way, s, side, w, d, h, at, deck}]: sites placed by hand (the loj hall, the signal box...)
       o.fill     [{way, defs, sides, from, to, gap, state, prefix, salt}]: frontage runs, in order
       o.hub, o.reach   wealth from the hub node
       o.heart, o.worn, o.abandoned   the ages
       o.edits    deltas applied last */
  CV.lineHold = function (o) {
    var H = CV.create(o), sp = o.spine;
    (o.decks || []).forEach(function (d) { CV.addDeck(H, { id: 'deck' + d.i, i: d.i, y: d.y, h: d.h, clear: d.clear, name: d.name, light: d.light }); });
    (o.spaces || []).forEach(function (s) { CV.addSpace(H, s); });
    var a = sp.pts[0], b = sp.pts[sp.pts.length - 1];
    CV.addNode(H, { id: sp.id + ':a', kind: 'end', x: a[0], y: a[1], z: a[2], space: sp.space || null });
    CV.addNode(H, { id: sp.id + ':b', kind: 'end', x: b[0], y: b[1], z: b[2], space: sp.space || null });
    var spine = CV.addWay(H, { id: sp.id, kind: sp.kind || 'gallery', a: sp.id + ':a', b: sp.id + ':b', pts: sp.pts, w: sp.w, h: sp.h, prim: sp.prim, deck: sp.deck });
    /* more spines (a terminus's second platform), each with its own end nodes, and the links that join existing nodes (a
       concourse across the buffers' end, a footbridge): ways like any other, joined at their nodes */
    (o.spines || []).forEach(function (q) {
      var qa = q.pts[0], qb = q.pts[q.pts.length - 1];
      CV.addNode(H, { id: q.id + ':a', kind: 'end', x: qa[0], y: qa[1], z: qa[2], space: q.space || null });
      CV.addNode(H, { id: q.id + ':b', kind: 'end', x: qb[0], y: qb[1], z: qb[2], space: q.space || null });
      CV.addWay(H, { id: q.id, kind: q.kind || 'gallery', a: q.id + ':a', b: q.id + ':b', pts: q.pts, w: q.w, h: q.h, prim: q.prim, deck: q.deck, joins: q.joins });
    });
    /* nodes of the host's (a stair's foot along a platform: `on` a spine at s), then the links between nodes */
    (o.nodes || []).forEach(function (n) { CV.addNode(H, n); });
    (o.links || []).forEach(function (l) { CV.addWay(H, l); });
    (o.sidings || []).forEach(function (S) {
      var base = S.from ? H.byId[S.from] : spine, P = CV.wayAt(base, S.at), side = S.side == null ? 1 : S.side;
      var nx = -P.tz * side, nz = P.tx * side, out = base.w / 2, y0 = P.y;
      var deckY = S.deck == null ? y0 : H.decks.filter(function (d) { return d.i === S.deck; })[0].y;
      /* the first way out of the base's wall is joined to the base and to the space the base runs in (a platform's hall) */
      var bsp = [base.a, base.b].map(function (n) { return H.byId[n] && H.byId[n].space; }).filter(Boolean), j0 = [base.id].concat(bsp);
      var jn = S.id + ':j', x0 = P.x + nx * out, z0 = P.z + nz * out;
      CV.addNode(H, { id: S.id + ':on', kind: 'junction', x: P.x, y: y0, z: P.z, on: { way: base.id, s: S.at } });
      CV.addNode(H, { id: jn, kind: 'mouth', x: x0, y: y0, z: z0 });
      /* the joint between the base way's wall and the siding: a short level stub of the base way's floor (it carves the
         doorway through the base way's wall, so the two voids overlap there) */
      var cur = jn, cx = x0, cz = z0, cy = y0;
      CV.addWay(H, { id: S.id + ':stub', kind: 'passage', a: S.id + ':on', b: jn, pts: [[P.x, y0, P.z], [x0, y0, z0]], w: S.w == null ? 2.6 : S.w, h: S.h == null ? 2.8 : S.h, prim: 'none', deck: base.deck });
      if (Math.abs(deckY - y0) > 1e-6) {
        /* to the siding's deck: a ramp at 1 in 9 or a stair at 0.7 (S.drop), run outward, a landing at its foot */
        var stair = S.drop === 'stair', run = Math.abs(deckY - y0) / (stair ? 0.7 : 1 / 9), lx = cx + nx * run, lz = cz + nz * run;
        CV.addNode(H, { id: S.id + ':land', kind: 'junction', x: lx, y: deckY, z: lz });
        CV.addWay(H, { id: S.id + ':' + (stair ? 'stair' : 'ramp'), kind: stair ? 'stair' : 'ramp', a: cur, b: S.id + ':land', pts: [[cx, cy, cz], [lx, deckY, lz]],
          w: S.w == null ? 2.6 : S.w, h: S.h == null ? 2.8 : S.h, district: S.district, joins: j0 });
        cur = S.id + ':land'; cx = lx; cz = lz; cy = deckY;
      }
      var ex = cx + nx * S.len, ez = cz + nz * S.len;
      CV.addNode(H, { id: S.id + ':end', kind: 'end', x: ex, y: cy, z: ez });
      CV.addWay(H, { id: S.id, kind: S.kind || 'siding', a: cur, b: S.id + ':end', pts: [[cx, cy, cz], [ex, cy, ez]], w: S.w == null ? 2.6 : S.w,
        h: S.h == null ? 2.8 : S.h, deck: S.deck == null ? null : S.deck, band: S.band || null, district: S.district || null,
        joins: cur === jn ? j0 : [] });
    });
    (o.civic || []).forEach(function (c) {
      var w = H.byId[c.way], P = CV.wayAt(w, c.s), side = c.side == null ? 1 : c.side, nx = -P.tz * side, nz = P.tx * side;
      var at = c.at || 'wall', off = at === 'wall' ? w.w / 2 : w.w / 2 + c.d / 2;
      CV.addSite(H, { id: c.id, at: at, key: c.key, way: c.way, side: side, s: c.s, x: r3(P.x + nx * off), y: r3(P.y), z: r3(P.z + nz * off),
        ry: Math.atan2(-nx, -nz), w: c.w, d: c.d, h: c.h, deck: c.deck == null ? w.deck : c.deck, district: c.district || w.district,
        tier: c.tier || 'civic', needs: c.needs || null, joins: c.joins });
    });
    /* sites placed where the host wants them (a hall at a way's end), then the frontage runs round them */
    (o.sites || []).forEach(function (q) { CV.addSite(H, q); });
    (o.fill || []).forEach(function (F) { CV.frontageRun(H, F.way, F); });
    if (o.hub) CV.wealth(H, { hub: o.hub, reach: o.reach });
    if (o.heart) CV.age(H, { heart: o.heart, worn: o.worn, abandoned: o.abandoned });
    CV.applyEdits(H, o.edits);
    return H;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
