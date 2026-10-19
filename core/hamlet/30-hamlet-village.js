/* ==================== core/hamlet 30: a village from a spec (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 1. KHAMLET.village(spec) -> {id, census, records, lanes, green, site, error?}. No three.js,
   no DOM: a node test and Godot run it. Placement draws from core/rand (one stream per village and per lane, from a hash
   of the world, the village id and a salt: never from how many draws came before), overlap is found through core/space,
   and the lanes' houses are laid by core/city's frontage cursor (KCITY.prim, read in place: 33-city-strategies.js). The
   host registers the records in core/tags before it draws them; a builder draws a record, it does not decide.

   spec: {id, world (a seed), culture (a KHAMLET.CULTURES name or row), focus (KHAMLET.FOCI), site {x, z} (the village
          point), link {x, z} (the road or landing it joins: the main lane points at it), resource {x, z, workers?}
          (what the works take: a node's point or a field's nearest point; workers its capacity, resFieldWorkers),
          popMax (default and ceiling 500), dims(key) -> {w, d, h} (the kit's boxes; the row's pending boxes answer
          for keys the kit lacks), ground {ok(x, z) -> bool} (dry, not a cliff, not too steep; default everywhere),
          siteReach (m to look for dry flat ground round site when site itself is not: default 600)}

   The parts are kept apart for the other small settlements to come (a nomad camp swaps layout and siting):
     KHAMLET.census(spec, row)      what it needs and how many people staff it
     KHAMLET.program(census, row)   the buildings, in a fixed order (their ids follow it)
     KHAMLET.siteFor(spec, row)     where it stands
     KHAMLET.layout(...)            the green, the lanes, the houses and the works */

KHAMLET.POP_MAX = 500;
KHAMLET.TUNE = {
  green: [46, 34],          /* the green (along the main lane, across it), m */
  laneW: 6, setback: 3,     /* lane width; a house's front from the lane's edge */
  gap: [3, 8],              /* between houses along a lane */
  laneMax: 200,             /* a lane's longest run */
  chunk: 3,                 /* plots a lane side takes in its turn */
  pad: 1.5,                 /* clearance between footprints */
  siteR: 45                 /* the radius of dry flat ground a village point needs */
};

KHAMLET.row = function (c) { return typeof c === 'string' ? KHAMLET.CULTURES[c] : c; };

/* ---------------------------------------------------------------- census: jobs first, people follow */
KHAMLET.census = function (spec, row) {
  var popMax = Math.min(KHAMLET.POP_MAX, spec.popMax == null ? KHAMLET.POP_MAX : spec.popMax);
  var S = row.services, warehouses = 1;
  var services = function () { return S.religious + S.civic + S.general + S.food + S.warehouse * warehouses; };
  var maxWorkers = Math.floor(popMax * row.workShare);
  var wanted = spec.resource && spec.resource.workers != null ? spec.resource.workers : row.focusJobs[spec.focus];
  var focusJobs = Math.max(0, Math.min(wanted, maxWorkers - services()));
  warehouses = 1 + Math.floor(focusJobs / 80);
  focusJobs = Math.max(0, Math.min(focusJobs, maxWorkers - services()));
  /* the works buildings: each kind takes its share of the focus jobs, rounded up to whole buildings */
  var works = (row.works[spec.focus] || []).map(function (w) {
    var n = focusJobs > 0 ? Math.max(1, Math.ceil(focusJobs * w.share / w.jobs)) : 0;
    return {key: w.key, n: n, jobs: w.jobs};
  });
  var workers = focusJobs + services(), pop = Math.min(popMax, Math.ceil(workers / row.workShare));
  return {popMax: popMax, pop: pop, workers: workers, focusJobs: focusJobs, serviceJobs: services(), warehouses: warehouses,
          households: Math.ceil(pop / row.household), works: works, capped: wanted > focusJobs};
};

/* ---------------------------------------------------------------- the program: buildings in a fixed order */
KHAMLET.program = function (C, row, st) {
  var P = [{role: 'civic', key: row.civic}, {role: 'religious', key: row.religious}, {role: 'general', key: row.general},
           {role: 'food', key: row.food}];
  for (var i = 0; i < C.warehouses; i++) P.push({role: 'warehouse', key: row.warehouse});
  C.works.forEach(function (w) { for (var j = 0; j < w.n; j++) P.push({role: 'works', key: w.key}); });
  /* houses: the headman's, then drawn by weight (middling at middlingShare) until every household has a roof */
  var H = row.houses, left = C.households - H.head[0][1], draw = function (list) {
    var tot = 0, k; for (k = 0; k < list.length; k++) tot += list[k][2];
    var r = st.next() * tot; for (k = 0; k < list.length; k++) { r -= list[k][2]; if (r < 0) return list[k]; } return list[list.length - 1];
  };
  P.push({role: 'house', key: H.head[0][0], households: H.head[0][1], head: true});
  while (left > 0) { var h = draw(st.next() < H.middlingShare ? H.middling : H.poor); P.push({role: 'house', key: h[0], households: h[1]}); left -= h[1]; }
  return P;
};

/* ---------------------------------------------------------------- footprints */
KHAMLET.box = function (spec, row, key) {
  var d = spec.dims ? spec.dims(key) : null;
  if (!d && row.pending && row.pending[key]) d = row.pending[key];
  if (!d) throw new Error('KHAMLET: no box for ' + key);
  return {w: +d.w, d: +d.d, h: +(d.h || 8)};
};
/* an oriented rectangle: centre, unit axis u (its width), half sizes; the front faces +v (ry: (sin ry, cos ry) is +v) */
KHAMLET.rect = function (x, z, ux, uz, w, d) { return {x: x, z: z, ux: ux, uz: uz, hw: w / 2, hd: d / 2}; };
KHAMLET.rectR = function (R) { return Math.hypot(R.hw, R.hd); };
KHAMLET.overlap = function (A, B, pad) {             /* separating axes on the two rectangles' four axes */
  pad = pad || 0;
  var dx = B.x - A.x, dz = B.z - A.z, axes = [[A.ux, A.uz], [-A.uz, A.ux], [B.ux, B.uz], [-B.uz, B.ux]];
  for (var i = 0; i < 4; i++) {
    var ax = axes[i][0], az = axes[i][1];
    var ra = A.hw * Math.abs(A.ux * ax + A.uz * az) + A.hd * Math.abs(-A.uz * ax + A.ux * az);
    var rb = B.hw * Math.abs(B.ux * ax + B.uz * az) + B.hd * Math.abs(-B.uz * ax + B.ux * az);
    if (Math.abs(dx * ax + dz * az) > ra + rb + pad) return false;
  }
  return true;
};
KHAMLET.corners = function (R) {
  var vx = -R.uz, vz = R.ux, out = [];
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { out.push([R.x + R.ux * R.hw * s[0] + vx * R.hd * s[1], R.z + R.uz * R.hw * s[0] + vz * R.hd * s[1]]); });
  return out;
};

/* ---------------------------------------------------------------- siting: dry flat ground round the point */
KHAMLET.groundOk = function (spec, x, z) { return !spec.ground || !spec.ground.ok || spec.ground.ok(x, z); };
KHAMLET.discOk = function (spec, x, z, r) {
  if (!KHAMLET.groundOk(spec, x, z)) return false;
  for (var i = 0; i < 8; i++) { var a = i / 8 * 2 * Math.PI; if (!KHAMLET.groundOk(spec, x + Math.cos(a) * r, z + Math.sin(a) * r)) return false; }
  return true;
};
KHAMLET.siteFor = function (spec) {
  var c = [spec.site.x, spec.site.z], R = KHAMLET.TUNE.siteR;
  if (KHAMLET.discOk(spec, c[0], c[1], R)) return {x: c[0], z: c[1]};
  var hit = KCITY.prim.huntNear(c, {step: 15, reach: spec.siteReach == null ? 600 : spec.siteReach, arc: 15},
    function (q) { return KHAMLET.discOk(spec, q[0], q[1], R) ? q : null; });
  return hit ? {x: hit[0], z: hit[1]} : null;
};

/* ---------------------------------------------------------------- the village */
KHAMLET.village = function (spec) {
  var row = KHAMLET.row(spec.culture);
  if (!row) return {id: spec.id, error: 'no culture ' + spec.culture};
  if (KHAMLET.FOCI.indexOf(spec.focus) < 0) return {id: spec.id, error: 'no focus ' + spec.focus};
  var T = KHAMLET.TUNE, K = KRAND, idh = KHAMLET.idHash(spec.id), seed = K.hash(K.child(spec.world >>> 0, 'hamlet'), idh);
  var stream = function (salt, i) { return K.stream(K.hash(seed, salt, i || 0)); };
  var C = KHAMLET.census(spec, row), P = KHAMLET.program(C, row, stream(1));
  var site = KHAMLET.siteFor(spec);
  if (!site) return {id: spec.id, census: C, error: 'no dry flat ground within reach of the site'};

  /* the frame: u toward the link (the main lane), v across */
  var lx = spec.link ? spec.link.x - site.x : 1, lz = spec.link ? spec.link.z - site.z : 0, L0 = Math.hypot(lx, lz) || 1;
  var ux = lx / L0, uz = lz / L0, vx = -uz, vz = ux;
  var at = function (a, b) { return [site.x + ux * a + vx * b, site.z + uz * a + vz * b]; };
  var space = KSPACE.create({cell: 24}), placed = [], records = [], lanes = [];
  var free = function (R, pad) {
    var hit = space.some(R.x, R.z, KHAMLET.rectR(R) + 40, function (it) { return KHAMLET.overlap(R, it.R, pad); });
    if (hit) return false;
    var cs = KHAMLET.corners(R);
    for (var i = 0; i < 4; i++) if (!KHAMLET.groundOk(spec, cs[i][0], cs[i][1])) return false;
    return KHAMLET.groundOk(spec, R.x, R.z);
  };
  var hold = function (R, what) { space.insert({R: R, what: what}, R.x, R.z, KHAMLET.rectR(R)); };
  var put = function (p, i, x, z, fx, fz) {          /* the front faces (fx, fz) */
    var b = KHAMLET.box(spec, row, p.key), R = KHAMLET.rect(x, z, fz, -fx, b.w, b.d);
    if (!free(R, T.pad)) return null;
    hold(R, p.role);
    var rec = {id: spec.id + ':' + i, key: p.key, role: p.role, x: x, z: z, ry: Math.atan2(fx, fz), w: b.w, d: b.d, h: b.h,
               pending: !!(row.pending && row.pending[p.key] && !(spec.dims && spec.dims(p.key))), village: spec.id, focus: spec.focus};
    if (p.households) rec.households = p.households;
    if (p.head) rec.head = true;
    records[i] = rec; placed.push(rec); return rec;
  };

  /* the green, held open */
  var G = KHAMLET.rect(site.x, site.z, vx, vz, T.green[1], T.green[0]);   /* width across (v), depth along (u) */
  hold(G, 'green');
  var gu = T.green[0] / 2, gv = T.green[1] / 2;

  /* the lanes: the main one toward the link from the green's +u edge; then -u, then +v and -v; the works lane is the
     one nearest the resource's direction */
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var laneOf = function (k) {
    var d = dirs[k], o = d[0] ? gu : gv, ax = ux * d[0] + vx * d[1], az = uz * d[0] + vz * d[1];
    var s = at(d[0] * o, d[1] * o);
    return {k: k, x0: s[0], z0: s[1], ax: ax, az: az, len: 0, sides: [0, 0]};
  };
  var LN = dirs.map(function (d, k) { return laneOf(k); });
  /* a lane's run as a rectangle */
  var laneRect = function (l, len) {
    var cx = l.x0 + l.ax * len / 2, cz = l.z0 + l.az * len / 2;
    return KHAMLET.rect(cx, cz, -l.az, l.ax, T.laneW, len);
  };
  var rdx = spec.resource ? spec.resource.x - site.x : -ux, rdz = spec.resource ? spec.resource.z - site.z : -uz;
  /* every lane's corridor is held open from the start: nothing is built across a lane */
  LN.forEach(function (l) { hold(laneRect(l, T.laneMax), 'lane'); });
  var worksLane = LN.slice().sort(function (a, b) { return (b.ax * rdx + b.az * rdz) - (a.ax * rdx + a.az * rdz); })[0];

  /* the green's buildings: civic and religious face each other across it (on its v sides), the stores at its -u end,
     the warehouses along the main lane toward the link */
  var byRole = function (role) { var out = []; P.forEach(function (p, i) { if (p.role === role) out.push([p, i]); }); return out; };
  /* a building on the green's edge at frame point (a, b), set back by half its depth, facing (fu, fv) in the frame;
     slid along (along) 6 m at a time when the spot is taken */
  var edge = function (p, i, a, b, fu, fv, along) {
    var back = KHAMLET.box(spec, row, p.key).d / 2 + 2, gx = ux * fu + vx * fv, gz = uz * fu + vz * fv;
    for (var t = 0; t < 12; t++) {
      var s = at(a - fu * back + along[0] * t * 6, b - fv * back + along[1] * t * 6);
      if (put(p, i, s[0], s[1], gx, gz)) return true;
    }
    return false;
  };
  var fail = [];
  /* civic on the +v side facing -v, religious on the -v side facing +v */
  var civ = byRole('civic')[0], rel = byRole('religious')[0];
  if (!edge(civ[0], civ[1], 0, gv, 0, -1, [-1, 0])) fail.push(civ[0].key);
  if (!edge(rel[0], rel[1], 0, -gv, 0, 1, [-1, 0])) fail.push(rel[0].key);
  /* the stores at the -u end, facing +u, either side of the back lane */
  var gen = byRole('general')[0], food = byRole('food')[0];
  if (!edge(gen[0], gen[1], -gu, gv * .55, 1, 0, [0, 1])) fail.push(gen[0].key);
  if (!edge(food[0], food[1], -gu, -gv * .55, 1, 0, [0, -1])) fail.push(food[0].key);

  /* frontage along a lane: both sides, each house facing the lane, set back, a drawn gap between */
  var front = function (l, side, list, st, t0, t1, cur) {
    var sx = -l.az * side, sz = l.ax * side;     /* outward from the lane on this side */
    var n = 0;
    var run = KCITY.prim.frontageRun({t0: t0, t1: t1, max: list.length,
      attempt: function (t) {
        var it = list[n]; if (!it) return {stop: true};
        var b = KHAMLET.box(spec, row, it[0].key), off = T.laneW / 2 + T.setback + b.d / 2;
        var x = l.x0 + l.ax * (t + b.w / 2) + sx * off, z = l.z0 + l.az * (t + b.w / 2) + sz * off;
        if (put(it[0], it[1], x, z, -sx, -sz)) { n++; return {adv: b.w + T.gap[0] + st.next() * (T.gap[1] - T.gap[0]), rec: true}; }
        return {adv: 4};
      }});
    if (cur) cur.t = run.t;
    return n;
  };

  /* the warehouses: the main lane's first plots, both sides (they front the road the goods leave by) */
  var main = LN[0], ware = byRole('warehouse'), stM = stream(2, 0);
  var wN = front(main, 1, ware.filter(function (_, j) { return j % 2 === 0; }), stM, 2, 120);
  wN += front(main, -1, ware.filter(function (_, j) { return j % 2 === 1; }), stM, 2, 120);
  if (wN < ware.length) fail.push('warehouse');
  main.used = 60;

  /* the works: at the works lane's far end toward the resource, packed outward until they fit within reach */
  var works = byRole('works'), reach = row.reach[spec.focus], wl = worksLane, stW = stream(3, 0);
  var target = spec.resource ? [spec.resource.x, spec.resource.z] : [wl.x0 + wl.ax * 120, wl.z0 + wl.az * 120];
  var dR = Math.hypot(target[0] - site.x, target[1] - site.z);
  if (dR > reach) { var k = reach / dR; target = [site.x + (target[0] - site.x) * k, site.z + (target[1] - site.z) * k]; }
  works.forEach(function (w) {
    var p = w[0], i = w[1], fx = site.x - target[0], fz = site.z - target[1], fl = Math.hypot(fx, fz) || 1;
    var ok = KCITY.prim.huntNear(target, {step: 10, reach: 220, arc: 12}, function (q) {
      if (Math.hypot(q[0] - site.x, q[1] - site.z) > reach) return null;
      return put(p, i, q[0], q[1], fx / fl, fz / fl) ? true : null;
    });
    if (!ok) fail.push(p.key);
  });

  /* the houses: the headman's on the green's -u end behind the stores if it fits; then frontage along the lanes in
     turn, a few plots a side at a time (T.chunk), so the village grows evenly out from its green: the main lane past
     the warehouses, the cross lanes, the back lane; the works lane last, as it leads out to the works */
  var houses = byRole('house'), hi = 0, head = houses[0];
  if (head) { var hb = KHAMLET.box(spec, row, head[0].key), hs = at(-gu - 40 - hb.d / 2, 0);
    if (put(head[0], head[1], hs[0], hs[1], ux, uz)) hi = 1; }
  var runs = [];
  [0, 2, 3, 1].forEach(function (k) { if (LN[k] !== worksLane) [1, -1].forEach(function (sd) { runs.push({l: LN[k], side: sd, t: k === 0 ? main.used : 2, st: stream(4, k * 2 + (sd > 0 ? 0 : 1))}); }); });
  [1, -1].forEach(function (sd) { runs.push({l: worksLane, side: sd, t: 2, st: stream(5, sd > 0 ? 0 : 1)}); });
  for (var pass = 0; hi < houses.length && pass < 200; pass++) {
    var moved = false;
    for (var ri = 0; ri < runs.length && hi < houses.length; ri++) {
      var R = runs[ri]; if (R.t >= T.laneMax) continue;
      var n = front(R.l, R.side, houses.slice(hi, hi + T.chunk), R.st, R.t, Math.min(T.laneMax, R.t + T.chunk * 30), R);
      hi += n; if (n) moved = true;
      if (!n) R.t = Math.min(T.laneMax, R.t + 30);
    }
    if (!moved && runs.every(function (q) { return q.t >= T.laneMax; })) break;
  }
  if (hi < houses.length) fail.push((houses.length - hi) + ' houses');

  /* the lanes as records: each runs from the green to its last building's far edge */
  LN.forEach(function (l) {
    var far = 0;
    placed.forEach(function (r) { var t = (r.x - l.x0) * l.ax + (r.z - l.z0) * l.az, s = Math.abs((r.x - l.x0) * -l.az + (r.z - l.z0) * l.ax);
      if (t > 0 && s < T.laneW / 2 + T.setback + Math.max(r.w, r.d) + 2) far = Math.max(far, t + Math.max(r.w, r.d) / 2); });
    if (l === worksLane) placed.forEach(function (r) { if (r.role === 'works') far = Math.max(far, (r.x - l.x0) * l.ax + (r.z - l.z0) * l.az - Math.max(r.w, r.d) / 2); });
    if (l === LN[0] && spec.link) far = Math.max(far, Math.min(T.laneMax, Math.hypot(spec.link.x - l.x0, spec.link.z - l.z0)));
    if (far > 0) lanes.push({id: spec.id + ':lane:' + l.k, kind: 'lane', w: T.laneW, pts: [[l.x0, l.z0], [l.x0 + l.ax * far, l.z0 + l.az * far]],
                             main: l === LN[0], works: l === worksLane});
  });

  var out = {id: spec.id, culture: row.kit, focus: spec.focus, site: site, frame: {u: [ux, uz], v: [vx, vz]},
             green: {x: site.x, z: site.z, w: T.green[1], d: T.green[0], ry: Math.atan2(ux, uz)},
             census: C, records: records.filter(Boolean), lanes: lanes};
  if (fail.length) out.error = 'could not place: ' + fail.join(', ');
  return out;
};

/* a stable 32-bit number from an id string (FNV-1a), for the village's seed */
KHAMLET.idHash = function (s) {
  var h = 0x811c9dc5; s = String(s);
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h | 0;
};

/* a placement hash (ids, keys, positions to the cm), for determinism checks and a golden */
KHAMLET.hashOf = function (v) {
  var s = (v.records || []).map(function (r) { return r.id + '|' + r.key + '|' + Math.round(r.x * 100) + '|' + Math.round(r.z * 100) + '|' + Math.round(r.ry * 1000); }).join(';');
  return KHAMLET.idHash(s) >>> 0;
};
