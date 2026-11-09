// ================================================================= METROPOLIS — plans on a grid: the Ancients kit's buildings  [G data]
// The owner, 2026-11-03: full layouts for the imported buildings too. Their shapes are the kit's own (no record says where a wall is), so a plan
// is laid on the grid MP.floors (59) reads off the drawn hero: a storey's inside cells (1 m), the core square every storey shares. MP.gridPlan
// turns one storey's cells into an ancients-interiors STOREY like 41's:
//  - each cell's depth in from the skin; by depth, bands outside in: rooms 6 m deep at the skin, a corridor 2 m, then (a deep plate) rooms
//    6 m and a corridor 2 m in turn. A plate 6 m deep or less is one hall; one under 16 m has its corridor down the middle.
//  - the core's two (or one) shaft bays in its square, a corridor from its door (the south face's middle) to the nearest corridor.
//  - a band's rooms cut along the corridor they open on: every corridor cell takes the nearest of seeds 6 m apart along it, a room cell the
//    corridor cell it is nearest; walls on the cells' edges between rooms and between a room and a corridor (the skin is the hero's).
//  - an inner band's every fourth room a passage from its corridor to the next one in; a room with no skin loses its window kind.
// No THREE, no DOM: the grid is plain numbers (Godot reads the same cells off its own mesh).
(function () {
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  /* a polyline's straight runs (Ramer-Douglas-Peucker): a grid's 1 m steps along a slant or a curve become one line */
  function dp(P, tol) {
    if (P.length < 3) return P; var a = P[0], b = P[P.length - 1], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz), bi = 0, bd = -1;
    for (var i = 1; i < P.length - 1; i++) { var d = l ? Math.abs((P[i][0] - a[0]) * dz - (P[i][1] - a[1]) * dx) / l : Math.hypot(P[i][0] - a[0], P[i][1] - a[1]); if (d > bd) { bd = d; bi = i; } }
    if (bd <= tol) return [a, b]; return dp(P.slice(0, bi + 1), tol).slice(0, -1).concat(dp(P.slice(bi), tol));
  }
  function dpLoop(P, tol) {
    if (P.length < 5) return P; var far = 0, fd = -1; for (var i = 1; i < P.length; i++) { var d = Math.hypot(P[i][0] - P[0][0], P[i][1] - P[0][1]); if (d > fd) { fd = d; far = i; } }
    var A = dp(P.slice(0, far + 1), tol), B = dp(P.slice(far).concat([P[0]]), tol), Q = A.slice(0, -1).concat(B.slice(0, -1));
    return Q.length >= 3 ? Q : P;
  }
  /* a plate's inside cells as rectangles (runs of a row joined down the rows): the walk's floor, no slab (the hero's own plates, 59) */
  function walkRects(M, W, D, wx, wz) {
    var N = W * D, used = new Uint8Array(N), out = [], i, j, k;
    for (j = 0; j < D; j++) for (i = 0; i < W; i++) {
      k = j * W + i; if (!M[k] || used[k]) continue; var i2 = i; while (i2 + 1 < W && M[k + i2 + 1 - i] && !used[k + i2 + 1 - i]) i2++;
      var j2 = j; for (;;) { var rr = j2 + 1; if (rr >= D) break; var full = true; for (var a2 = i; a2 <= i2; a2++) if (!M[rr * W + a2] || used[rr * W + a2]) { full = false; break; } if (!full) break; j2 = rr; }
      for (var b3 = j; b3 <= j2; b3++) for (a2 = i; a2 <= i2; a2++) used[b3 * W + a2] = 1;
      out.push({ noSlab: true, outline: [[r3(wx(i)), r3(wz(j))], [r3(wx(i2 + 1)), r3(wz(j))], [r3(wx(i2 + 1)), r3(wz(j2 + 1))], [r3(wx(i)), r3(wz(j2 + 1))]] });
    }
    return out;
  }
  var WANTS = { office: 'meeting', classroom: 'store', clinic: 'store', bedroom: 'store', living: 'store' };
  /* a cell set's outline: its boundary edges chained into loops (the interior on the left), the largest kept, straight runs merged */
  function trace(cells, W, x0, z0, cs) {
    var has = function (i, j) { return i >= 0 && j >= 0 && i < W && cells.has(j * W + i); }, nx = {}, key = function (a, b) { return a + ',' + b; };
    cells.forEach(function (k) {
      var i = k % W, j = (k - i) / W;
      if (!has(i, j - 1)) nx[key(i, j)] = [i + 1, j];
      if (!has(i + 1, j)) nx[key(i + 1, j)] = [i + 1, j + 1];
      if (!has(i, j + 1)) nx[key(i + 1, j + 1)] = [i, j + 1];
      if (!has(i - 1, j)) nx[key(i, j + 1)] = [i, j];
    });
    var best = null, ba = 0, seen = {};
    Object.keys(nx).forEach(function (s) {
      if (seen[s]) return; var loop = [], c = s;
      while (c && !seen[c]) { seen[c] = 1; var p = c.split(','); loop.push([+p[0], +p[1]]); var n = nx[c]; c = n ? key(n[0], n[1]) : null; }
      var a = 0; for (var q = 0; q < loop.length; q++) { var u = loop[q], v = loop[(q + 1) % loop.length]; a += u[0] * v[1] - v[0] * u[1]; }
      if (Math.abs(a) > ba) { ba = Math.abs(a); best = loop; }
    });
    if (!best) return null;
    var out = [];
    for (var q = 0; q < best.length; q++) { var a0 = best[(q + best.length - 1) % best.length], b = best[q], c2 = best[(q + 1) % best.length]; if ((b[0] - a0[0]) * (c2[1] - b[1]) - (b[1] - a0[1]) * (c2[0] - b[0]) !== 0) out.push([r3(x0 + b[0] * cs), r3(z0 + b[1] * cs)]); }
    var sa = 0; for (q = 0; q < out.length; q++) { var e = out[q], f = out[(q + 1) % out.length]; sa += e[0] * f[1] - f[0] * e[1]; }
    return sa < 0 ? out.reverse() : out;
  }
  /* MP.gridPlan(F, L, o) -> STOREY. o: { id, grid: {x0, z0, cell, W, D}, mask (Uint8Array, 1 inside), core: {x0, z0, n} | null, shafts (the
     record's), kinds(i, n), inner(i, n) (the windowless rooms' kinds), entries ([{x, z, yaw}]: street doors on this storey) } */
  /* a hall (the owner, 2026-11-03: the Crown Library's reading floor cut into cells was an unwalkable mess): each part of the storey one room of
     o.hall's kind, its outline the floor's (straightened), open to the street on the ground; the placer furnishes it whole (a library: shelves
     along its walls, tables in the floor) */
  function hallPlan(F, L, o) {
    var G = o.grid, W = G.W, D = G.D, N = W * D, cs = G.cell, X0 = G.x0, Z0 = G.z0, M = o.mask, kindOf = MP.planLib.kindOf;
    var wx = function (i) { return X0 + i * cs; }, wz = function (j) { return Z0 + j * cs; };
    var st = { id: o.id, level: L.k, y: L.y, h: L.h, rooms: [], walls: [], outline: [], windowsOwn: true, parts: walkRects(M, W, D, wx, wz) }, comp = new Int32Array(N).fill(-1), hallOfComp = [], big = 0;
    var cellAt = function (x, z) { var i = Math.floor((x - X0) / cs), j = Math.floor((z - Z0) / cs); return i < 0 || j < 0 || i >= W || j >= D ? -1 : j * W + i; };
    var hallOf = function (c) { return c >= 0 && comp[c] >= 0 ? hallOfComp[comp[c]] : null; }, lay = o.hall === 'servers' || o.hall === 'works' ? o.hall : null;
    /* a machine hall's parts are its floor's, the cores' squares left out (a core standing in the air between a tall hall's floors is no hall) */
    var cores = o.cores || (o.core ? [o.core] : []), inCore = function (c) { var i = c % W, j = (c - i) / W, x = wx(i) + cs / 2, z = wz(j) + cs / 2; return cores.some(function (C) { return x > C.x0 && x < C.x0 + C.n && z > C.z0 && z < C.z0 + C.n; }); };
    var floor = new Uint8Array(N); for (var k = 0; k < N; k++) floor[k] = M[k] && !(lay && inCore(k)) ? 1 : 0;
    for (k = 0; k < N; k++) if (floor[k] && comp[k] < 0) {
      var ci = hallOfComp.length, cells = new Set(), s = [k]; comp[k] = ci; hallOfComp.push(null);
      while (s.length) { var c = s.pop(); cells.add(c); [c - 1, c + 1, c - W, c + W].forEach(function (n) { if (n >= 0 && n < N && floor[n] && comp[n] < 0) { comp[n] = ci; s.push(n); } }); }
      /* a sliver (a ledge, a sill: under 25 m2, which the family's bridges do not join) is no hall */
      if (cells.size * cs * cs < (lay ? 25 : 4)) continue;
      var P = trace(cells, W, X0, Z0, cs); if (!P) continue; P = dpLoop(P, 0.5);
      var R = { id: o.id + '.hall' + st.rooms.length, kind: kindOf(lay ? (lay === 'servers' ? 'plant' : 'workshop') : o.hall), mpKind: o.hall, poly: P, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: o.hall !== 'stack' && !lay, stacks: o.hall === 'stack', layout: lay, street: !!o.ground };
      R.area = cells.size * cs * cs; st.rooms.push(R); hallOfComp[ci] = R;
      if (cells.size > big) { big = cells.size; st.outline = P; }
    }
    /* the core's bays (a machine hall's storeys have shafts), each opening through the core's doors on its own faces into the hall there */
    var lone = {}, strips = [];
    (o.shafts || []).filter(function (s) { return L.k >= s.from && L.k <= s.to; }).forEach(function (s) {
      var C = cores[s.core || 0]; if (!C) return; var x0 = s.bay[0], x1 = s.bay[1], z0 = C.z0, z1 = C.z0 + C.n, m = C.n / 2;
      var R = { id: o.id + '.' + s.id, kind: 'core', mpKind: 'core', poly: [[r3(x0), r3(z0)], [r3(x1), r3(z0)], [r3(x1), r3(z1)], [r3(x0), r3(z1)]], y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false, shaft: s.id };
      st.rooms.push(R);
      [{ f: 'S', c: cellAt(C.x0 + m, C.z0 + C.n + 0.5), at: [C.x0 + m, C.z0 + C.n] }, { f: 'N', c: cellAt(C.x0 + m, C.z0 - 0.5), at: [C.x0 + m, C.z0] }, { f: 'E', c: cellAt(C.x0 + C.n + 0.5, C.z0 + m), at: [C.x0 + C.n, C.z0 + m] }, { f: 'W', c: cellAt(C.x0 - 0.5, C.z0 + m), at: [C.x0, C.z0 + m] }].forEach(function (Fc) {
        var on = Fc.f === 'W' ? Math.abs(x0 - C.x0) < 0.01 : Fc.f === 'E' ? Math.abs(x1 - C.x0 - C.n) < 0.01 : x0 <= Fc.at[0] + 0.01 && x1 >= Fc.at[0] - 0.01, H = hallOf(Fc.c);
        if (!on || !H) return; var at = [r3(Fc.at[0]), r3(Fc.at[1])]; R.doors.push({ at: at, w: 1.2, to: H.id }); H.doors.push({ at: at, w: 1.2, to: R.id });
      });
      if (!R.doors.length) (lone[s.core || 0] = lone[s.core || 0] || []).push(R);
    });
    /* a core standing alone (its part's floor not at this storey: the Assembler's sheds): bridged from its nearest face over the gap to the
       nearest hall, 15 m at most (as the room plan does) */
    var extra = [];
    Object.keys(lone).forEach(function (ci) {
      var C = cores[ci], m = C.n / 2, best = null;
      [[C.x0 + m, C.z0 + C.n + 0.5, 0, 1], [C.x0 + m, C.z0 - 0.5, 0, -1], [C.x0 + C.n + 0.5, C.z0 + m, 1, 0], [C.x0 - 0.5, C.z0 + m, -1, 0]].forEach(function (Fc) {
        var c0 = cellAt(Fc[0], Fc[1]); if (c0 < 0) return; var dist = {}, q = [c0]; dist[c0] = 0;
        for (var h = 0; h < q.length; h++) { var x = q[h]; if (dist[x] > 15) break; if (hallOf(x)) { if (!best || dist[x] < best.d) best = { d: dist[x], a: [Fc[0] - Fc[2] * 0.5, Fc[1] - Fc[3] * 0.5], e: x }; break; }
          [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && dist[n] === undefined && !inCore(n)) { dist[n] = dist[x] + 1; q.push(n); } }); }
      });
      if (best) extra.push({ core: lone[ci], a: best.a, e: best.e });
    });
    /* the bridges between parts (46d's ancientFamily finds them): a walk 2.4 m wide, a door at each end into the hall it lands in */
    var near = function (c) { if (hallOf(c)) return hallOf(c); for (var r = 1; r <= 3; r++) for (var dj = -r; dj <= r; dj++) for (var di = -r; di <= r; di++) { var n = c + dj * W + di; if (n >= 0 && n < N && hallOf(n)) return hallOf(n); } return null; };
    extra.forEach(function (Ex, xi) {
      var i5 = Ex.e % W, j5 = (Ex.e - i5) / W, b = [r3(wx(i5) + cs / 2), r3(wz(j5) + cs / 2)], a = [r3(Ex.a[0]), r3(Ex.a[1])], H = hallOf(Ex.e);
      var S = MP.planLib.strip(F, L, { id: o.id + '.reach' + xi, a: a, b: b, w: 2.4 }), Q = S.rooms[0];
      Ex.core.forEach(function (R) { Q.doors.push({ at: a, w: 1.2, to: R.id }); R.doors.push({ at: a, w: 1.2, to: Q.id }); });
      Q.doors.push({ at: b, w: 1.6, to: H.id }); H.doors.push({ at: b, w: 1.6, to: Q.id });
      st.rooms.push(Q); st.parts.push(S.part); strips.push(S); st.rails = (st.rails || []).concat(S.rails);
    });
    (o.bridges || []).forEach(function (Bg, bi) {
      var ends = [[Bg.s, Bg.sd], [Bg.e, Bg.ed]].map(function (E) { var c = E[0], i5 = c % W, j5 = (c - i5) / W; return { R: near(c), at: [r3(wx(i5) + cs / 2 + E[1][0] * cs / 2), r3(wz(j5) + cs / 2 + E[1][1] * cs / 2)] }; });
      if (!ends[0].R || !ends[1].R || ends[0].R === ends[1].R) return;
      var S = MP.planLib.strip(F, L, { id: o.id + '.bridge' + bi, a: ends[0].at, b: ends[1].at, w: 2.4 }), Q = S.rooms[0];
      ends.forEach(function (E) { Q.doors.push({ at: E.at, w: 1.6, to: E.R.id }); E.R.doors.push({ at: E.at, w: 1.6, to: Q.id }); });
      st.rooms.push(Q); st.parts.push(S.part); strips.push(S); st.rails = (st.rails || []).concat(S.rails);
    });
    /* a machine hall's part no shaft, bridge or street reaches and under 200 m2 (a shelf of the kit's in a tall hall, a mezzanine's end) is a
       ledge, walked but not worked, as the room plan's thin parts are corridors */
    if (lay) {
      var byId = {}, seen = {}, q = []; st.rooms.forEach(function (R) { byId[R.id] = R; if (R.kind === 'core' || R.street) { seen[R.id] = 1; q.push(R); } });
      while (q.length) q.pop().doors.forEach(function (d) { var T = byId[d.to]; if (T && !seen[T.id]) { seen[T.id] = 1; q.push(T); } });
      st.rooms.forEach(function (R) { if (R.layout && !seen[R.id] && R.area < 200) { R.kind = 'corridor'; R.mpKind = 'ledge'; R.layout = null; R.furnish = false; } });
    }
    st.inside = function (x, z) { for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) { var i = Math.floor((x + a * 0.02 - X0) / cs), j = Math.floor((z + b * 0.02 - Z0) / cs); if (i >= 0 && j >= 0 && i < W && j < D && M[j * W + i]) return true; } if (strips.some(function (S) { return S.inside(x, z); })) return true; return false; };
    return st;
  }
  /* a reading hall's layout (MP.furnish lays it in a hall marked `stacks`): stacks (the Ancients' archive, 1150 triangles: a storey of them is held
     near 200 k) in rows 4.5 m apart along the hall's long side, each row facing the aisle on alternate sides, 2 m clear of the walls, a cross of
     3 m aisles to the middle, a reading floor of desks in a circle there (four tenths of the hall's radius).
     Placements as the placer's ({key, x, y, z, ry}) */
  MP.stackLayout = function (P, y, seed) {
    var inPoly = function (x, z) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > z) !== (P[j][1] > z)) && (x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; };
    var edge = function (x, z) { var b = 1e9; for (var m = 0; m < P.length; m++) { var a = P[m], q = P[(m + 1) % P.length], dx = q[0] - a[0], dz = q[1] - a[1], l2 = dx * dx + dz * dz, t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0; b = Math.min(b, Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z)); } return b; };
    var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, ar = 0, cx = 0, cz = 0;
    P.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
    for (var m = 0; m < P.length; m++) { var u = P[m], v = P[(m + 1) % P.length], cr = u[0] * v[1] - v[0] * u[1]; ar += cr; cx += (u[0] + v[0]) * cr; cz += (u[1] + v[1]) * cr; } cx /= 3 * ar; cz /= 3 * ar; ar = Math.abs(ar / 2);
    var out = [], rr = Math.max(4, 0.4 * Math.sqrt(ar / Math.PI)), alongX = x1 - x0 >= z1 - z0;
    /* the reading floor: desks on a 3.5 m grid in the circle, a low table at its middle */
    for (var a = -rr; a <= rr; a += 3.5) for (var b = -rr; b <= rr; b += 3.5) { var x = cx + a, z = cz + b; if (Math.hypot(a, b) > rr - 1 || Math.hypot(a, b) < 2.5 || !inPoly(x, z) || edge(x, z) < 2.5) continue; out.push({ key: 'ancients_desk', x: x, y: y, z: z, ry: (Math.round((a + b) / 3.5) % 2) * Math.PI }); }
    if (inPoly(cx, cz)) out.push({ key: 'ancients_low_table', x: cx, y: y, z: cz, ry: 0 });
    /* the stacks: a double stack every 2 m along a row, rows every 3 m; none on the cross aisles, the reading floor or within 2 m of a wall */
    for (var r = (alongX ? z0 : x0) + 2.5, row = 0; r <= (alongX ? z1 : x1) - 2.5; r += 4.5, row++) for (var t = (alongX ? x0 : z0) + 3; t <= (alongX ? x1 : z1) - 3; t += 2) {
      var px = alongX ? t : r, pz = alongX ? r : t;
      if (Math.abs(px - cx) < 1.6 || Math.abs(pz - cz) < 1.6 || Math.hypot(px - cx, pz - cz) < rr + 1.5) continue;
      var ok = true; [[-1.1, -0.35], [1.1, -0.35], [1.1, 0.35], [-1.1, 0.35]].forEach(function (c) { var qx = px + (alongX ? c[0] : c[1]), qz = pz + (alongX ? c[1] : c[0]); if (!inPoly(qx, qz) || edge(qx, qz) < 2) ok = false; });
      if (!ok) continue;
      out.push({ key: 'ancients_archive', x: px, y: y, z: pz, ry: (alongX ? 0 : Math.PI / 2) + (row % 2 ? Math.PI : 0) });
    }
    return out;
  };
  /* a machine hall's layout (the owner, 2026-11-03: the ruins need industry; an industrial floor cut into 6 m rooms was thousands of cells on the
     Vault's 400 m plate): one hall each part, laid in runs. 'servers' the data centers': runs of ten racks back to back (a hot aisle between, 2 m
     cold aisles), a control stand at each run's head. 'works' the factories' and the fuel stations': bays 6 m by 5 m, each a machine (a lab bench)
     with a workstation at it, every fifth a store of cargo pods. Runs are kept whole, the nearest the hall's heart (its core, else its middle)
     first, to `cap` pieces (a storey held near the reading hall's 200 k): a big hall is furnished round its core, and the runs past the cap
     go into o.far as blocks ({x, z, ry, w, d, h}: a run of racks one box), so the rest of the floor is not bare. None within 2 m of a wall
     or 3 m of a core (o.avoid: [{x0, z0, n}]). Placements as the placer's ({key, x, y, z, ry}) */
  MP.machineLayout = function (P, y, seed, use, o) {
    o = o || {}; var avoid = o.avoid || [], cap = o.cap == null ? 240 : o.cap;
    /* the outline's edges in buckets 4 m square (a 400 m hall's outline has some 200 edges; a run asks about each of its pieces): inPoly asks
       only the edges across its row, edge only those within reach of its square */
    var inPoly, edge;
    var clear = function (x, z) { if (!inPoly(x, z) || edge(x, z) < 2) return false; for (var a = 0; a < avoid.length; a++) { var Q = avoid[a]; if (x > Q.x0 - 3 && x < Q.x0 + Q.n + 3 && z > Q.z0 - 3 && z < Q.z0 + Q.n + 3) return false; } return true; };
    var x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, ar = 0, cx = 0, cz = 0;
    P.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); });
    var BC = 4, BW = Math.max(1, Math.ceil((x1 - x0) / BC) + 1), BD = Math.max(1, Math.ceil((z1 - z0) / BC) + 1), rows = [], near = [];
    for (var e0 = 0; e0 < P.length; e0++) { var ea = P[e0], eb = P[(e0 + 1) % P.length];
      for (var rj = Math.max(0, Math.floor((Math.min(ea[1], eb[1]) - z0) / BC)); rj <= Math.min(BD - 1, Math.floor((Math.max(ea[1], eb[1]) - z0) / BC)); rj++) (rows[rj] = rows[rj] || []).push(e0);
      for (var bj = Math.max(0, Math.floor((Math.min(ea[1], eb[1]) - 2 - z0) / BC)); bj <= Math.min(BD - 1, Math.floor((Math.max(ea[1], eb[1]) + 2 - z0) / BC)); bj++)
        for (var bi = Math.max(0, Math.floor((Math.min(ea[0], eb[0]) - 2 - x0) / BC)); bi <= Math.min(BW - 1, Math.floor((Math.max(ea[0], eb[0]) + 2 - x0) / BC)); bi++) (near[bj * BW + bi] = near[bj * BW + bi] || []).push(e0); }
    inPoly = function (x, z) { var rj = Math.floor((z - z0) / BC), E = rj >= 0 && rj < BD ? rows[rj] : null, c = false; if (!E) return false;
      for (var q = 0; q < E.length; q++) { var a = P[E[q]], b = P[(E[q] + 1) % P.length]; if (((a[1] > z) !== (b[1] > z)) && (x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])) c = !c; } return c; };
    edge = function (x, z) { var bi = Math.floor((x - x0) / BC), bj = Math.floor((z - z0) / BC), E = bi >= 0 && bj >= 0 && bi < BW && bj < BD ? near[bj * BW + bi] : null, b = 1e9; if (!E) return b;
      for (var q = 0; q < E.length; q++) { var a = P[E[q]], qq = P[(E[q] + 1) % P.length], dx = qq[0] - a[0], dz = qq[1] - a[1], l2 = dx * dx + dz * dz, t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0; b = Math.min(b, Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z)); } return b; };
    for (var m = 0; m < P.length; m++) { var u = P[m], v = P[(m + 1) % P.length], cr = u[0] * v[1] - v[0] * u[1]; ar += cr; cx += (u[0] + v[0]) * cr; cz += (u[1] + v[1]) * cr; }
    if (Math.abs(ar) > 1e-6) { cx /= 3 * ar; cz /= 3 * ar; } else { cx = (x0 + x1) / 2; cz = (z0 + z1) / 2; }
    var hx = cx, hz = cz, hb = 1e9; avoid.forEach(function (Q) { var qx = Q.x0 + Q.n / 2, qz = Q.z0 + Q.n / 2, d = inPoly(qx, qz) ? Math.hypot(qx - cx, qz - cz) : 1e9; if (d < hb) { hb = d; hx = qx; hz = qz; } });
    var alongX = x1 - x0 >= z1 - z0, A0 = alongX ? x0 : z0, A1 = alongX ? x1 : z1, R0 = alongX ? z0 : x0, R1 = alongX ? z1 : x1;
    var pt = function (t, r) { return alongX ? [t, r] : [r, t]; }, rot = function (ry) { return (alongX ? 0 : Math.PI / 2) + ry; };
    /* the runs: each a list of pieces (all clear, or the run is dropped), its middle for the sort */
    /* each run also as one block (its pieces' box: a run of racks, a bay's bench and station), which o.far takes for the runs past the cap */
    var runs = [], run = function (list, blk) { var ok = list.length > 0, sx = 0, sz = 0; list.forEach(function (p) { if (ok && !clear(p.x, p.z)) ok = false; sx += p.x; sz += p.z; }); if (ok) runs.push({ list: list, blk: blk, d: Math.hypot(sx / list.length - hx, sz / list.length - hz) }); };
    var block = function (t, r, w, d, h) { var q = pt(t, r); return { x: r3(q[0]), z: r3(q[1]), ry: r3(rot(0)), w: w, d: d, h: h }; };
    var piece = function (key, t, r, ry) { var q = pt(t, r); return { key: key, x: q[0], y: y, z: q[1], ry: rot(ry) }; };
    if (use === 'servers') {
      /* a pair of rows 1.2 m apart (the hot aisle), pairs 4.2 m apart; a run 10 racks (0.85 m each) and a stand, 1.6 m between runs */
      var nr = Math.floor((R1 - R0 - 5.2) / 4.2) + 1, na = Math.floor((A1 - A0 - 4 - 8.5) / 10.1) + 1, rs = R0 + (R1 - R0 - (nr - 1) * 4.2 - 1.2) / 2, as = A0 + (A1 - A0 - (na - 1) * 10.1 - 8.5) / 2;
      for (var r = rs, row = 0; row < nr; r += 4.2, row++) for (var t = as, ai = 0; ai < na; t += 10.1, ai++) {
        var L = []; for (var k = 0; k < 10; k++) { L.push(piece('ancients_server_rack', t + 0.425 + k * 0.85, r, Math.PI)); L.push(piece('ancients_server_rack', t + 0.425 + k * 0.85, r + 1.2, 0)); }
        /* the stand in the cold aisle at the run's head (none where the aisle is the wall's margin) */
        if (nr > 1) L.push(piece('ancients_control_stand', t + 7.8, r + 0.6 + (row % 2 ? 1.75 : -1.75), row % 2 ? 0 : Math.PI)); run(L, block(t + 4.25, r + 0.6, 8.5, 2.2, 2.2));
      }
    } else {
      /* a bay 6 m along by 5 m across: the machine at its back, its workstation before it; every fifth bay a store, pods in a pair */
      var nr2 = Math.floor((R1 - R0 - 5.8) / 5) + 1, na2 = Math.floor((A1 - A0 - 6) / 6) + 1, rs2 = R0 + (R1 - R0 - (nr2 - 1) * 5) / 2, as2 = A0 + (A1 - A0 - (na2 - 1) * 6) / 2;
      for (var r2 = rs2, row2 = 0; row2 < nr2; r2 += 5, row2++) for (var t2 = as2, b = 0; b < na2; t2 += 6, b++) {
        var u2 = MP.u ? MP.u(seed, row2 * 997 + b, 1) : ((row2 * 7 + b * 3) % 10) / 10, face = row2 % 2 ? Math.PI : 0, sg = row2 % 2 ? -1 : 1;
        if (u2 < 0.2) run([piece('ancients_cargo_pods', t2 - 1, r2, face), piece('ancients_cargo_pods', t2 + 1, r2, face)], block(t2, r2, 3.7, 1.2, 1.3));
        else run([piece('ancients_lab_bench', t2, r2 - 0.9 * sg, face), piece('ancients_workstation', t2, r2 + 0.7 * sg, face + Math.PI)], block(t2, r2 - 0.1 * sg, 2, 2.6, 1.6));
      }
    }
    runs.sort(function (a, b) { return a.d - b.d; });
    var out = [], i; for (i = 0; i < runs.length && out.length + runs[i].list.length <= cap; i++) out.push.apply(out, runs[i].list);
    if (o.far) for (; i < runs.length; i++) o.far.push(runs[i].blk);
    out.forEach(function (p) { p.x = r3(p.x); p.z = r3(p.z); p.ry = r3(p.ry); });
    return out;
  };
  MP.gridPlan = function (F, L, o) {
    if (o.hall) return hallPlan(F, L, o);
    var G = o.grid, W = G.W, D = G.D, N = W * D, cs = G.cell, X0 = G.x0, Z0 = G.z0, M = new Uint8Array(o.mask), id = o.id, kindOf = MP.planLib.kindOf;
    var wx = function (i) { return X0 + i * cs; }, wz = function (j) { return Z0 + j * cs; }, cellAt = function (x, z) { var i = Math.floor((x - X0) / cs), j = Math.floor((z - Z0) / cs); return i < 0 || j < 0 || i >= W || j >= D ? -1 : j * W + i; };
    var st = { id: id, level: L.k, y: L.y, h: L.h, rooms: [], walls: [], outline: [], windowsOwn: true, parts: [] };
    /* the depth of every inside cell from the skin */
    var dep = new Int16Array(N), q = [], h, k, i, j;
    for (k = 0; k < N; k++) if (M[k]) { i = k % W; j = (k - i) / W; if (i === 0 || j === 0 || i === W - 1 || j === D - 1 || !M[k - 1] || !M[k + 1] || !M[k - W] || !M[k + W]) { dep[k] = 1; q.push(k); } }
    var maxD = 0; for (h = 0; h < q.length; h++) { k = q[h]; maxD = Math.max(maxD, dep[k]); [k - 1, k + 1, k - W, k + W].forEach(function (n) { if (n >= 0 && n < N && M[n] && !dep[n]) { dep[n] = dep[k] + 1; q.push(n); } }); }
    /* the core square's cells */
    /* the cores (one a building standing apart: the Apartments' blocks), each square's cells */
    var cores = o.cores || (o.core ? [o.core] : []), inCore = new Uint8Array(N);
    /* a core's four doors (59 draws one in the middle of each face): the cell before each, the point in the face */
    var faces = function (C) { var m = C.n / 2; return [{ f: 'S', c: cellAt(C.x0 + m, C.z0 + C.n + 0.5), at: [C.x0 + m, C.z0 + C.n] }, { f: 'N', c: cellAt(C.x0 + m, C.z0 - 0.5), at: [C.x0 + m, C.z0] }, { f: 'E', c: cellAt(C.x0 + C.n + 0.5, C.z0 + m), at: [C.x0 + C.n, C.z0 + m] }, { f: 'W', c: cellAt(C.x0 - 0.5, C.z0 + m), at: [C.x0, C.z0 + m] }]; };
    cores.forEach(function (C) { for (j = 0; j < D; j++) for (i = 0; i < W; i++) { var cx = wx(i) + cs / 2, cz = wz(j) + cs / 2; if (cx > C.x0 && cx < C.x0 + C.n && cz > C.z0 && cz < C.z0 + C.n && M[j * W + i]) inCore[j * W + i] = 1; } });
    /* the bands: 0 the skin's rooms, then corridor 1, rooms 1, corridor 2 ... (band b: rooms 2b, corridor 2b - 1) */
    /* each part of the storey banded by its own depth (a thin block beside a deep one gets its own corridor) */
    var pc = new Int32Array(N).fill(-1), pmax = [];
    for (k = 0; k < N; k++) if (M[k] && pc[k] < 0) { var sp = [k], mxd = 0; pc[k] = pmax.length; while (sp.length) { var x3 = sp.pop(); mxd = Math.max(mxd, dep[x3]); [x3 - 1, x3 + 1, x3 - W, x3 + W].forEach(function (n) { if (n >= 0 && n < N && M[n] && pc[n] < 0) { pc[n] = pmax.length; sp.push(n); } }); } pmax.push(mxd); }
    /* a round or lobed part (the Watch's drum, the Reliquary's flower, Sky A's office ring; the owner, 2026-11-03: a curved floor cut by its
       corridor's seeds was a maze of small jagged rooms) is cut by angle about its middle instead: each band's rooms are wedges about 6 m wide at
       the band's middle, their partitions straight rays. A part is round when its outline is never under 0.55 of its farthest reach from its
       middle and it fills under 0.9 of its box (a rectangle keeps the corridor's cut) */
    var radial = pmax.map(function (md, pi) {
      var cells = new Set(), sx = 0, sz = 0, i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
      for (var c = 0; c < N; c++) if (pc[c] === pi) { cells.add(c); var ci = c % W, cj = (c - ci) / W; sx += ci + 0.5; sz += cj + 0.5; i0 = Math.min(i0, ci); i1 = Math.max(i1, ci); j0 = Math.min(j0, cj); j1 = Math.max(j1, cj); }
      if (cells.size < 150) return null; var mx = sx / cells.size, mz = sz / cells.size;
      var P = trace(cells, W, 0, 0, 1); if (!P) return null;
      var dmin = 1e9, dmax = 0; P.forEach(function (p) { var d = Math.hypot(p[0] - mx, p[1] - mz); dmin = Math.min(dmin, d); dmax = Math.max(dmax, d); });
      if (dmin / dmax < 0.55 || cells.size / ((i1 - i0 + 1) * (j1 - j0 + 1)) >= 0.9) return null;
      return { x: mx, z: mz, rb: {} };
    });
    var r0Of = function (md) { return md <= 3 ? 0 : md <= 8 ? Math.max(2, md - 2) : 6; }, band = new Int16Array(N).fill(-1), r0;
    for (k = 0; k < N; k++) {
      if (!M[k] || inCore[k]) continue; var d = dep[k]; r0 = r0Of(pmax[pc[k]]);
      if (!r0) { band[k] = 1; continue; }
      if (d <= r0) { band[k] = 0; continue; }
      var e = d - r0 - 1, p8 = Math.floor(e / 8), w8 = e % 8; band[k] = w8 < 2 ? 2 * p8 + 1 : 2 * p8 + 2;
      /* a round part keeps two rings of rooms; deeper is one open floor round the core (the Reliquary's middle was ring on ring of small rooms) */
      if (radial[pc[k]] && band[k] > 2) band[k] = 3;
    }
    /* in each part, its deepest band, when it is thin (under 3 cells), joins the corridor outside it */
    pmax.forEach(function (md, pi) {
      var rp = r0Of(md), bmax = 0; for (k = 0; k < N; k++) if (pc[k] === pi) bmax = Math.max(bmax, band[k]);
      if (!(bmax > 0 && bmax % 2 === 0)) return; var thick = 0; for (k = 0; k < N; k++) if (pc[k] === pi && band[k] === bmax) thick = Math.max(thick, dep[k]);
      if (thick - (rp + 1 + 8 * (bmax / 2 - 1) + 2) + 1 < 3) for (k = 0; k < N; k++) if (pc[k] === pi && band[k] === bmax) band[k] = bmax - 1;
    });
    /* the core's way out: from the cell before its door (the south face's middle) to the nearest corridor, two cells wide */
    cores.forEach(function (C) { faces(C).forEach(function (Fc) {
      var start = Fc.c, k, h;
      /* the door's cell off the floor (a shaft through a thin storey): the shortest way, 2 cells at most (the floor's margin along the core's walls), made floor */
      if (start >= 0 && !M[start]) { var pv = {}, qd = [start], got = -1; pv[start] = -1; for (h = 0; h < qd.length && got < 0; h++) { k = qd[h]; if (h > 400) break; [k - 1, k + 1, k - W, k + W].forEach(function (n) { if (got >= 0 || n < 0 || n >= N || pv[n] !== undefined || inCore[n]) return; pv[n] = k; if (M[n]) got = n; else qd.push(n); }); }
        if (got >= 0) { var len = 0; for (k = pv[got]; k !== -1; k = pv[k]) len++; if (len <= 2) for (k = pv[got]; k !== -1; k = pv[k]) M[k] = 1; } }
      if (start >= 0 && M[start] && !inCore[start]) {
        var prev = new Int32Array(N).fill(-2), qq = [start], hit = -1; prev[start] = -1;
        for (h = 0; h < qq.length && hit < 0; h++) { k = qq[h]; if (band[k] % 2 === 1) { hit = k; break; } [k - 1, k + 1, k - W, k + W].forEach(function (n) { if (n >= 0 && n < N && M[n] && !inCore[n] && prev[n] === -2) { prev[n] = k; qq.push(n); } }); }
        if (hit >= 0) { var cb = band[hit]; for (k = hit; k >= 0; k = prev[k]) { band[k] = cb; if (k + 1 < N && M[k + 1] && !inCore[k + 1] && band[k + 1] % 2 === 0) band[k + 1] = cb; } }
      }
    }); });
    /* every corridor joined to the one the core opens on (else the one with the most cells): a corridor cut off (a ring split by the core, a
       wing past a thin neck) is carved a way through to the nearest corridor already joined, two cells wide */
    (function () {
      var comp = new Int32Array(N).fill(-1), sizes = [], nC = 0;
      for (k = 0; k < N; k++) if (band[k] > 0 && band[k] % 2 === 1 && comp[k] < 0) { var s0 = [k], n0 = 0; comp[k] = nC; while (s0.length) { var c = s0.pop(); n0++; [c - 1, c + 1, c - W, c + W].forEach(function (n) { if (n >= 0 && n < N && band[n] > 0 && band[n] % 2 === 1 && comp[n] < 0) { comp[n] = nC; s0.push(n); } }); } sizes.push(n0); nC++; }
      if (nC < 2) return;
      var joined = {}, any0 = false; cores.forEach(function (C) { faces(C).forEach(function (Fc) { var dc0 = Fc.c; if (dc0 >= 0 && comp[dc0] >= 0) { joined[comp[dc0]] = 1; any0 = true; } }); });
      if (!any0) joined[sizes.indexOf(Math.max.apply(null, sizes))] = 1;
      for (var guard = 0; guard < 2 * nC; guard++) {
        /* from the joined corridors out through the plate (not the core) to the nearest corridor not yet joined */
        var prev = new Int32Array(N).fill(-2), qq = [], hit = -1;
        for (k = 0; k < N; k++) if (comp[k] >= 0 && joined[comp[k]]) { prev[k] = -1; qq.push(k); }
        for (var hh = 0; hh < qq.length && hit < 0; hh++) { var c2 = qq[hh]; [c2 - 1, c2 + 1, c2 - W, c2 + W].forEach(function (n) { if (hit >= 0 || n < 0 || n >= N || !M[n] || inCore[n] || prev[n] !== -2) return; prev[n] = c2; if (comp[n] >= 0 && !joined[comp[n]]) hit = n; else qq.push(n); }); }
        /* none in reach through this part of the storey: the largest corridor not joined starts its own part (the bridges join the parts) */
        if (hit < 0) { var bestC = -1; for (var cI = 0; cI < nC; cI++) if (!joined[cI] && (bestC < 0 || sizes[cI] > sizes[bestC])) bestC = cI; if (bestC < 0) break; joined[bestC] = 1; continue; }
        var to = comp[hit], b0 = band[hit]; joined[to] = 1;
        for (var p = prev[hit]; p >= 0 && prev[p] !== -1; p = prev[p]) { band[p] = b0; comp[p] = to; if (p + 1 < N && M[p + 1] && !inCore[p + 1] && comp[p + 1] < 0) { band[p + 1] = b0; comp[p + 1] = to; } }
      }
    })();
    /* the corridors: connected runs of corridor cells (of any band: a joining path meets another band's), one corridor room each (region ids) */
    var reg = new Int32Array(N).fill(-1), R = [], add = function (Q) { R.push(Q); return R.length - 1; };
    for (k = 0; k < N; k++) if (band[k] > 0 && band[k] % 2 === 1 && reg[k] < 0) {
      var ri = add({ id: id + '.corr' + R.length, kind: 'corridor', mpKind: r0Of(pmax[pc[k]]) ? 'corridor' : 'concourse', poly: null, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false, band: band[k], cells: [] }), s = [k]; reg[k] = ri;
      while (s.length) { var c = s.pop(); R[ri].cells.push(c); [c - 1, c + 1, c - W, c + W].forEach(function (n) { if (n >= 0 && n < N && band[n] > 0 && band[n] % 2 === 1 && reg[n] < 0) { reg[n] = ri; s.push(n); } }); }
    }
    /* seeds along each corridor 6 m apart (in its own walk order), each corridor cell the nearest seed's */
    var seedOf = new Int32Array(N).fill(-1), seeds = [];
    R.forEach(function (Q, ci) {
      var order = [Q.cells[0]], seen = {}; seen[Q.cells[0]] = 1;
      for (var a = 0; a < order.length; a++) { var c = order[a]; [c - 1, c + 1, c - W, c + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] === ci && !seen[n]) { seen[n] = 1; order.push(n); } }); }
      var mine = [];
      order.forEach(function (c) { var ci2 = c % W, cj = (c - ci2) / W; if (mine.every(function (sd) { return Math.hypot(sd[0] - ci2, sd[1] - cj) >= 6 / cs; })) { mine.push([ci2, cj]); seeds.push({ c: c, corr: ci }); } });
      var base = seeds.length - mine.length, qs = [];
      mine.forEach(function (sd, m) { var c = sd[1] * W + sd[0]; seedOf[c] = base + m; qs.push(c); });
      for (var b = 0; b < qs.length; b++) { var c3 = qs[b]; [c3 - 1, c3 + 1, c3 - W, c3 + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] === ci && seedOf[n] < 0) { seedOf[n] = seedOf[c3]; qs.push(n); } }); }
    });
    /* a rooms band's cells take the seed of the corridor cell they are nearest: the corridor in (the skin's band) or out (an inner band) */
    var lab = new Int32Array(N).fill(-1), qs2 = [];
    for (k = 0; k < N; k++) if (reg[k] >= 0) { qs2.push(k); }
    var from = new Int32Array(N).fill(-1); qs2.forEach(function (c) { from[c] = c; });
    for (h = 0; h < qs2.length; h++) {
      k = qs2[h]; var bk = band[k];
      [k - 1, k + 1, k - W, k + W].forEach(function (n) {
        if (n < 0 || n >= N || !M[n] || inCore[n] || from[n] >= 0 || band[n] % 2 !== 0) return;
        /* a room cell opens on its door corridor: band 0 on corridor 1, band 2b on corridor 2b - 1; a room cell reached from another room cell keeps its source */
        var src = from[k], sb = band[src]; if (reg[k] >= 0 && !(band[n] === 0 ? sb === 1 : sb === band[n] - 1)) return;
        from[n] = src; qs2.push(n);
      });
    }
    /* cells no door corridor reaches (a thin wing) take any corridor's */
    for (h = 0; h < qs2.length; h++) { k = qs2[h]; [k - 1, k + 1, k - W, k + W].forEach(function (n) { if (n >= 0 && n < N && M[n] && !inCore[n] && from[n] < 0 && band[n] % 2 === 0) { from[n] = from[k]; qs2.push(n); } }); }
    /* each band's middle radius in a round part, so its wedges are about 6 m wide there */
    for (k = 0; k < N; k++) { var rp = radial[pc[k]]; if (!rp || band[k] < 0 || band[k] % 2) continue; var ki = k % W, rb = rp.rb[band[k]] = rp.rb[band[k]] || [0, 0]; rb[0] += Math.hypot(ki + 0.5 - rp.x, (k - ki) / W + 0.5 - rp.z); rb[1]++; }
    var byLab = {}, meta = {};
    for (k = 0; k < N; k++) if (band[k] >= 0 && band[k] % 2 === 0 && from[k] >= 0) {
      var rp2 = radial[pc[k]], key2, sec = null;
      if (rp2) { var kx = k % W, rbb = rp2.rb[band[k]], rm = rbb[0] / rbb[1] * cs, nS = Math.max(4, Math.round(2 * Math.PI * rm / 6)); sec = Math.floor((Math.atan2((k - kx) / W + 0.5 - rp2.z, kx + 0.5 - rp2.x) + Math.PI) / (2 * Math.PI) * nS) % nS; key2 = band[k] + ':p' + pc[k] + 'a' + sec; }
      else key2 = band[k] + ':' + seedOf[from[k]];
      if (!byLab[key2]) { byLab[key2] = []; meta[key2] = { seed: seedOf[from[k]], sec: sec }; }
      byLab[key2].push(k);
    }
    /* the rooms; a sliver (under 5 m2) joins its corridor */
    var nRooms = 0, keys = Object.keys(byLab).sort(function (a, b) { return byLab[a][0] - byLab[b][0]; });
    keys.forEach(function (kk) {
      var cells = byLab[kk], b2 = +kk.split(':')[0], sd = seeds[meta[kk].seed];
      if (cells.length * cs * cs < 5) { cells.forEach(function (c) { reg[c] = sd.corr; }); return; }
      var inner = b2 > 0, src = inner ? o.inner(nRooms, keys.length) : o.kinds(nRooms, keys.length);
      var ri2 = add({ id: id + '.r' + nRooms, kind: kindOf(src), mpKind: src, poly: null, y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: true, band: b2, corr: sd.corr, cells: cells, seed: meta[kk].sec != null ? meta[kk].sec : meta[kk].seed });
      cells.forEach(function (c) { reg[c] = ri2; }); nRooms++;
    });
    /* a room in pieces (its cells cut apart by a corridor or the core) keeps its largest; a smaller piece goes to the region it touches most */
    R.forEach(function (Q, ri5) {
      if (Q.kind === 'corridor' || Q.cells.length < 2) return;
      var mine = new Set(Q.cells), compOf = {}, comps = [];
      Q.cells.forEach(function (c) { if (compOf[c] != null) return; var s = [c], cc = []; compOf[c] = comps.length; while (s.length) { var x = s.pop(); cc.push(x); [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (mine.has(n) && compOf[n] == null) { compOf[n] = comps.length; s.push(n); } }); } comps.push(cc); });
      if (comps.length < 2) return;
      comps.sort(function (a, b) { return b.length - a.length; }); Q.cells = comps[0];
      comps.slice(1).forEach(function (cc) {
        var cnt = {}; cc.forEach(function (x) { [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] >= 0 && reg[n] !== ri5) cnt[reg[n]] = (cnt[reg[n]] || 0) + 1; }); });
        var to = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0]; if (to == null) return; to = +to;
        cc.forEach(function (x) { reg[x] = to; R[to].cells.push(x); });
      });
    });
    /* a corridor no room but one touches (a pocket the room wraps round) is that room's, unless it is the way out of a core, or the room has no
       other way out than it */
    var doorCells = {}; cores.forEach(function (C) { faces(C).forEach(function (Fc) { if (Fc.c >= 0) doorCells[Fc.c] = 1; }); });
    R.forEach(function (Q, ri8) {
      if (Q.kind !== 'corridor' || !Q.cells.length || Q.cells.some(function (x) { return doorCells[x]; })) return;
      var nb = {}; Q.cells.forEach(function (x) { [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] >= 0 && reg[n] !== ri8) nb[reg[n]] = 1; }); });
      var ks = Object.keys(nb).map(Number); if (ks.length !== 1 || R[ks[0]].kind === 'corridor') return;
      var other = {}; R[ks[0]].cells.forEach(function (x) { [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] >= 0 && reg[n] !== ks[0] && reg[n] !== ri8) other[reg[n]] = 1; }); });
      if (!Object.keys(other).length) return;
      var to = ks[0]; Q.cells.forEach(function (x) { reg[x] = to; R[to].cells.push(x); }); Q.cells = []; Q.gone = true;
    });
    /* a room left under 5 m2 (its pieces gone to others) goes whole to the region it touches most */
    R.forEach(function (Q, ri7) {
      if (Q.kind === 'corridor' || !Q.cells.length || Q.cells.length * cs * cs >= 5) return;
      var cnt = {}; Q.cells.forEach(function (x) { [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && reg[n] >= 0 && reg[n] !== ri7) cnt[reg[n]] = (cnt[reg[n]] || 0) + 1; }); });
      var to = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0]; if (to == null) return; to = +to;
      Q.cells.forEach(function (x) { reg[x] = to; R[to].cells.push(x); }); Q.cells = []; Q.gone = true;
    });
    /* the core's bays: the stair's (west, or the whole square) and the lift's (east) */
    var shafts = (o.shafts || []).filter(function (s) { return L.k >= s.from && L.k <= s.to; }), coreIds = [];
    shafts.forEach(function (s) {
      var C = cores[s.core || 0]; if (!C) return;
      var x0 = s.bay[0], x1 = s.bay[1], z0 = C.z0, z1 = C.z0 + C.n, cid = id + '.' + s.id;
      var cr = add({ id: cid, kind: 'core', mpKind: 'core', poly: [[r3(x0), r3(z0)], [r3(x1), r3(z0)], [r3(x1), r3(z1)], [r3(x0), r3(z1)]], y: L.y, h: L.h, level: L.k, doors: [], windows: [], furnish: false, shaft: s.id, cells: [] });
      coreIds.push([cr, C, s.bay]);
    });
    /* the walls: every cell edge between two regions where one is a room (not the core: the hero's core box stands there), chained per pair */
    var edges = {};
    var edge = function (a, b, p, q2) { var ka = a < b ? a + '|' + b : b + '|' + a; (edges[ka] = edges[ka] || []).push([p, q2]); };
    for (j = 0; j < D; j++) for (i = 0; i < W; i++) {
      k = j * W + i; var ra = reg[k]; if (ra < 0) continue;
      [[1, 0], [0, 1]].forEach(function (dv) {
        var ii = i + dv[0], jj = j + dv[1]; if (ii >= W || jj >= D) return; var rb = reg[jj * W + ii]; if (rb < 0 || rb === ra) return;
        if (R[ra].kind === 'corridor' && R[rb].kind === 'corridor') return;
        var p = dv[0] ? [i + 1, j] : [i, j + 1], p2 = dv[0] ? [i + 1, j + 1] : [i + 1, j + 1]; edge(ra, rb, p, p2);
      });
    }
    var wallsOf = {};
    Object.keys(edges).forEach(function (ka) {
      var E = edges[ka], adj = {}, kk2 = function (p) { return p[0] + ',' + p[1]; };
      E.forEach(function (e) { (adj[kk2(e[0])] = adj[kk2(e[0])] || []).push(e[1]); (adj[kk2(e[1])] = adj[kk2(e[1])] || []).push(e[0]); });
      var used = {}, ek = function (a, b) { var x = kk2(a), y = kk2(b); return x < y ? x + '|' + y : y + '|' + x; }, chains = [];
      var walk = function (s0) { var ch = [s0], cur = s0; for (;;) { var nxt = (adj[kk2(cur)] || []).filter(function (n) { return !used[ek(cur, n)]; })[0]; if (!nxt) break; used[ek(cur, nxt)] = 1; ch.push(nxt); cur = nxt; } return ch; };
      Object.keys(adj).filter(function (v) { return adj[v].length === 1; }).concat(Object.keys(adj)).forEach(function (v) { var p = v.split(',').map(Number); if ((adj[v] || []).some(function (n) { return !used[ek(p, n)]; })) chains.push(walk(p)); });
      var ab = ka.split('|').map(Number);
      chains.forEach(function (ch, ci) {
        var pts = []; ch.forEach(function (p, m) { if (m && m < ch.length - 1) { var a = ch[m - 1], c = ch[m + 1]; if ((p[0] - a[0]) * (c[1] - p[1]) - (p[1] - a[1]) * (c[0] - p[0]) === 0) return; } pts.push([r3(wx(p[0])), r3(wz(p[1]))]); });
        var len = 0; for (var m = 0; m + 1 < pts.length; m++) len += Math.hypot(pts[m + 1][0] - pts[m][0], pts[m + 1][1] - pts[m][1]);
        var Wl = { id: id + '.w' + st.walls.length, pts: pts, y: L.y, h: L.h, rooms: [R[ab[0]].id, R[ab[1]].id], door: null, broken: false, len: len, a: ab[0], b: ab[1] };
        st.walls.push(Wl); (wallsOf[ka] = wallsOf[ka] || []).push(Wl);
      });
    });
    /* polygons (before the doors: a door goes only on its room's own outline) and windows (a room on the skin: one at the middle of its skin) */
    R.forEach(function (Q) {
      if (Q.cells.length && Q.kind !== 'corridor') {
        var set = new Set(Q.cells); Q.poly = trace(set, W, X0, Z0, cs);
        var sk = Q.cells.filter(function (c) { return dep[c] === 1; });
        if (sk.length && !MP.WINDOWLESS[Q.mpKind]) { var c0 = sk[Math.floor(sk.length / 2)], ci4 = c0 % W, cj4 = (c0 - ci4) / W, S2 = MP.BAYSIZE.window; Q.windows.push({ at: [r3(wx(ci4) + cs / 2), r3(wz(cj4) + cs / 2)], w: Math.min(3, Math.max(1, sk.length * cs * 0.4)), sill: S2[1], h: S2[2] - S2[1] }); }
        else if (!sk.length && WANTS[Q.mpKind]) { Q.mpKind = WANTS[Q.mpKind]; Q.kind = kindOf(Q.mpKind); }
        /* the reception's recipe is laid in a rectangle, its frame square to the door's wall (kits/ancients-interiors 37-ai-kit.js): a room of more corners is a stall */
        if (Q.mpKind === 'reception' && Q.poly && Q.poly.length !== 4) { Q.mpKind = 'stall'; Q.kind = kindOf('stall'); }
      }
    });
    var midOf = function (Wl) { var P = Wl.pts, half = Wl.len / 2, s = 0; for (var m = 0; m + 1 < P.length; m++) { var l = Math.hypot(P[m + 1][0] - P[m][0], P[m + 1][1] - P[m][1]); if (s + l >= half) { var f = (half - s) / l; return [r3(P[m][0] + (P[m + 1][0] - P[m][0]) * f), r3(P[m][1] + (P[m + 1][1] - P[m][1]) * f)]; } s += l; } return P[0]; };
    var onPoly = function (p, P) { if (!P) return true; for (var m = 0; m < P.length; m++) { var a = P[m], b = P[(m + 1) % P.length], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2)) : 0; if (Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]) < 0.05) return true; } return false; };
    /* a point s metres along a wall */
    var along = function (Wl, d) { var P = Wl.pts, s = 0; for (var m = 0; m + 1 < P.length; m++) { var l = Math.hypot(P[m + 1][0] - P[m][0], P[m + 1][1] - P[m][1]); if (s + l >= d) { var f = l ? (d - s) / l : 0; return [r3(P[m][0] + (P[m + 1][0] - P[m][0]) * f), r3(P[m][1] + (P[m + 1][1] - P[m][1]) * f)]; } s += l; } return P[P.length - 1]; };
    /* a door: on the longest wall between a and b, at its middle or the nearest point to it on a's own outline (a room round a hole) */
    var door = function (a, b, w) {
      var ka = a < b ? a + '|' + b : b + '|' + a, Ws = (wallsOf[ka] || []).filter(function (x) { return x.len >= w + 0.6; }).sort(function (x, y) { return y.len - x.len; });
      for (var q = 0; q < Ws.length; q++) { var Wl = Ws[q], mid = Wl.len / 2; for (var dd = 0; dd <= mid - w / 2 - 0.3; dd += 0.5) for (var sg = -1; sg <= 1; sg += 2) { var at = along(Wl, mid + sg * dd); if (onPoly(at, R[a].poly)) { Wl.door = { at: at, w: w }; R[a].doors.push({ at: at, w: w, to: R[b].id }); return true; } } }
      return false;
    };
    /* the rooms' doors: on their corridor, else on any corridor they touch; every fourth inner room a passage between the corridors on its two sides */
    R.forEach(function (Q, ri3) {
      if (Q.kind === 'corridor' || Q.kind === 'core' || Q.gone) return;
      var touch = {}; Object.keys(wallsOf).forEach(function (ka) { var ab = ka.split('|').map(Number); if (ab.indexOf(ri3) < 0) return; var o2 = ab[0] === ri3 ? ab[1] : ab[0]; if (R[o2].kind === 'corridor') touch[o2] = 1; });
      var cs2 = Object.keys(touch).map(Number);
      if (Q.band > 0 && Q.seed % 4 === 0 && cs2.length >= 2) { Q.kind = 'corridor'; Q.mpKind = 'passage'; Q.furnish = false; cs2.slice(0, 2).forEach(function (c) { door(ri3, c, 1.6); }); return; }
      if (!(touch[Q.corr] && door(ri3, Q.corr, 1)) && !cs2.some(function (c) { return door(ri3, c, 1); })) { var any = Object.keys(wallsOf).map(function (ka) { return ka.split('|').map(Number); }).filter(function (ab) { return ab.indexOf(ri3) >= 0; })[0]; if (any) door(ri3, any[0] === ri3 ? any[1] : any[0], 0.9); }
    });
    /* the core bays open on the way out before the core's south face (the hero's door): a room or a corridor */
    /* each bay opens through the core's doors on its own faces (the stair's west half the north, south and west; the lift's the north, south and east) */
    coreIds.forEach(function (e) { var C = e[1], bay = e[2]; faces(C).forEach(function (Fc) {
      var on = Fc.f === 'W' ? Math.abs(bay[0] - C.x0) < 0.01 : Fc.f === 'E' ? Math.abs(bay[1] - C.x0 - C.n) < 0.01 : bay[0] <= Fc.at[0] + 0.01 && bay[1] >= Fc.at[0] - 0.01;
      var out2 = Fc.c >= 0 ? reg[Fc.c] : -1; if (on && out2 >= 0 && !R[out2].gone) R[e[0]].doors.push({ at: [r3(Fc.at[0]), r3(Fc.at[1])], w: 1.2, to: R[out2].id });
    }); });
    /* on the ground every room and corridor on the skin opens on the street (a shop, a lobby): the ground's rooms need no shaft */
    if (o.ground) R.forEach(function (Q, ri6) { if (Q.kind === 'core') return; for (var c = 0; c < N; c++) if (reg[c] === ri6 && dep[c] === 1) { Q.street = true; break; } });
    (o.entries || []).forEach(function (E) { var c = cellAt(E.x - Math.sin(E.yaw) * 1.5, E.z - Math.cos(E.yaw) * 1.5); if (c < 0 || reg[c] < 0) c = cellAt(E.x - Math.sin(E.yaw) * 3, E.z - Math.cos(E.yaw) * 3); if (c >= 0 && reg[c] >= 0) R[reg[c]].street = true; });
    /* the bridges (the family's, MP.ancientFamily): a corridor from one part of the storey over the gap to another (Sky A's atrium round its
       core), a door at each end on the edge of the cell it lands in, its own slab and glass rails */
    var strips = [];
    /* a core standing alone on its square (the top of its run, where its part's floor has drawn back: no face within two cells of the floor) is
       bridged too, from its nearest face over the gap to the floor, 15 m at most */
    var extra = [];
    cores.forEach(function (C) {
      var fs = faces(C); if (fs.some(function (Fc) { return Fc.c >= 0 && reg[Fc.c] >= 0; })) return;
      var best = null;
      fs.forEach(function (Fc) {
        if (Fc.c < 0) return; var pv = {}, q = [Fc.c], dist = {}; pv[Fc.c] = -1; dist[Fc.c] = 0;
        for (var h7 = 0; h7 < q.length; h7++) { var x = q[h7]; if (dist[x] > 15) continue; if (reg[x] >= 0 && !R[reg[x]].gone && R[reg[x]].kind !== 'core') { if (!best || dist[x] < best.d) { var path = [x]; for (var p7 = pv[x]; p7 >= 0; p7 = pv[p7]) path.push(p7); best = { d: dist[x], path: path }; } break; }
          [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && pv[n] === undefined && !inCore[n]) { pv[n] = x; dist[n] = dist[x] + 1; q.push(n); } }); }
      });
      if (!best || best.path.length < 2) return;
      var P = best.path, dv = function (a, b) { var ai = a % W, bi = b % W; return [bi - ai, (b - bi) / W - (a - ai) / W]; }, st0 = P[P.length - 1];
      extra.push({ s: st0, sd: dv(st0, P[P.length - 2]), e: P[0], ed: dv(P[0], P[1]) });
    });
    (o.bridges || []).concat(extra).forEach(function (Bg, bi) {
      /* the region the end lands in: the cell's, or (a core's, a sliver's) the nearest one's within two cells */
      /* a room or corridor within three cells; else a core bay (a shaft standing alone on its square: its doors are on every face) */
      var coreAt = {}; R.forEach(function (Q, ri) { if (Q.kind === 'core' && Q.poly) { var P = Q.poly; for (var j6 = 0; j6 < D; j6++) for (var i6 = 0; i6 < W; i6++) { var x6 = wx(i6) + cs / 2, z6 = wz(j6) + cs / 2; if (x6 >= P[0][0] && x6 <= P[1][0] && z6 >= P[0][1] && z6 <= P[2][1]) coreAt[j6 * W + i6] = ri; } } });
      var ok5 = function (r, avoid) { return r >= 0 && r !== avoid && !R[r].gone && R[r].kind !== 'core'; };
      var regNear = function (c, avoid) {
        if (ok5(reg[c], avoid)) return reg[c]; var rr2, dj, di, n;
        for (rr2 = 1; rr2 <= 3; rr2++) for (dj = -rr2; dj <= rr2; dj++) for (di = -rr2; di <= rr2; di++) { n = c + dj * W + di; if (n >= 0 && n < N && ok5(reg[n], avoid)) return reg[n]; }
        for (rr2 = 0; rr2 <= 2; rr2++) for (dj = -rr2; dj <= rr2; dj++) for (di = -rr2; di <= rr2; di++) { n = c + dj * W + di; if (n >= 0 && n < N && coreAt[n] != null && coreAt[n] !== avoid) return coreAt[n]; }
        return -1;
      };
      var ends = [[Bg.s, Bg.sd], [Bg.e, Bg.ed]].map(function (E) { var c = E[0], ci5 = c % W, cj5 = (c - ci5) / W; return { c: c, at: [r3(wx(ci5) + cs / 2 + E[1][0] * cs / 2), r3(wz(cj5) + cs / 2 + E[1][1] * cs / 2)] }; });
      /* the far end's region is never the near end's (a short bridge's two ends within two cells of one region) */
      ends[0].reg = regNear(ends[0].c, -1); ends[1].reg = regNear(ends[1].c, ends[0].reg);
      if (ends[0].reg < 0 || ends[1].reg < 0 || ends[0].reg === ends[1].reg || R[ends[0].reg].gone || R[ends[1].reg].gone) return;
      var S = MP.planLib.strip(F, L, { id: id + '.bridge' + bi, a: ends[0].at, b: ends[1].at, w: 2.4 }), Q = S.rooms[0];
      ends.forEach(function (E) { var T = R[E.reg]; Q.doors.push({ at: E.at, w: 1.6, to: T.id }); T.doors.push({ at: E.at, w: 1.6, to: Q.id }); });
      R.push(Q); st.parts.push(S.part); strips.push(S); st.rails = (st.rails || []).concat(S.rails);
    });
    /* the last word: whatever is still cut off from a shaft and the street (a pocket, a part whose corridor is cut by the core) gets a door through
       a wall it shares with what is reached, a room's into the next room if need be, until nothing more joins */
    (function () {
      var idx = {}; R.forEach(function (Q, i) { if (!Q.gone) idx[Q.id] = i; });
      var adj = R.map(function () { return []; }); R.forEach(function (Q, i) { if (Q.gone) return; Q.doors.forEach(function (d) { var j = idx[d.to]; if (j != null) { adj[i].push(j); adj[j].push(i); } }); });
      var seen = new Uint8Array(R.length), q = [];
      var spread = function () { while (q.length) adj[q.pop()].forEach(function (n) { if (!seen[n]) { seen[n] = 1; q.push(n); } }); };
      R.forEach(function (Q, i) { if (!Q.gone && (Q.kind === 'core' || Q.street)) { seen[i] = 1; q.push(i); } }); spread();
      for (var pass = 0; pass < R.length; pass++) {
        var added = false;
        Object.keys(wallsOf).forEach(function (ka) {
          var ab = ka.split('|').map(Number), a = ab[0], b = ab[1]; if (R[a].gone || R[b].gone || seen[a] === seen[b]) return;
          var un = seen[a] ? b : a, re = seen[a] ? a : b, from = R[un].poly ? un : re, to = from === un ? re : un;
          if (door(from, to, 1)) { adj[un].push(re); adj[re].push(un); seen[un] = 1; q.push(un); spread(); added = true; }
        });
        if (!added) break;
      }
    })();
    R.forEach(function (Q) { if (Q.gone) return; delete Q.cells; delete Q.band; delete Q.corr; delete Q.seed; st.rooms.push(Q); });
    st.walls.forEach(function (Wl) { delete Wl.len; delete Wl.a; delete Wl.b; });
    /* straightened, once the doors are placed on the cells' edges (each within half a metre of its line: the furnisher snaps within 0.6) */
    st.walls.forEach(function (Wl) { Wl.pts = dp(Wl.pts, 0.5); });
    st.rooms.forEach(function (Q) { if (Q.poly && Q.kind !== 'core' && !/\.bridge\d+$/.test(Q.id)) { var P2 = dpLoop(Q.poly, 0.5), a = 0; for (var m = 0; m < P2.length; m++) { var u = P2[m], v = P2[(m + 1) % P2.length]; a += u[0] * v[1] - v[0] * u[1]; } if (a / 2 >= 1.5) Q.poly = P2; } });
    /* every room's own doors on its own (straightened) outline, for the furnisher: one within 2 m moved onto it, one further off (a bridge's end
       that landed on the next region) left to the other side's list, which still joins them */
    st.rooms.forEach(function (Q) {
      if (!Q.poly || Q.kind === 'corridor' || Q.kind === 'core') return; var P = Q.poly;
      Q.doors = Q.doors.filter(function (d) {
        var best = null, bd = 1e9; for (var m = 0; m < P.length; m++) { var a = P[m], b = P[(m + 1) % P.length], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = l2 ? Math.max(0, Math.min(1, ((d.at[0] - a[0]) * dx + (d.at[1] - a[1]) * dz) / l2)) : 0, px = a[0] + dx * t, pz = a[1] + dz * t, e = Math.hypot(px - d.at[0], pz - d.at[1]); if (e < bd) { bd = e; best = [r3(px), r3(pz)]; } }
        if (bd <= 0.5) return true; if (bd <= 2) { d.at = best; return true; } return false;
      });
    });
    /* the floor the walk takes: the plate's rows as rectangles (no slab: the hero's own plates, 59) */
    st.parts = st.parts.concat(walkRects(M, W, D, wx, wz));
    var all = new Set(); for (k = 0; k < N; k++) if (M[k]) all.add(k); st.outline = trace(all, W, X0, Z0, cs) || [];
    st.inside = function (x, z) { for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) { var c = cellAt(x + a * 0.02, z + b * 0.02); if (c >= 0 && M[c]) return true; } return strips.some(function (S) { return S.inside(x, z); }); };
    return st;
  };
})();

/* ---- the Ancients kit's buildings with plans: batch 1 (the owner, 2026-11-03: full layouts and ruins in threes). A family made from the hero's
   grid (55 calls MP.ancientFamily the first time it builds one): a ground storey (its inside cells and the core's) and a storey at each of the
   grid's levels, what each is for from the building's programme (MP.ANCIENT_USES: [use, storeys] in turn, the last repeating), the core
   square's stair and lift (a 4 m square holds the stair alone), its ruin states as a design's (40's debris, 59b's cut). */
MP.ANCIENT_PLANNED = ['bunker', 'skya', 'comb', 'apartments', 'lab', 'starlab', 'offices', 'library', 'police', 'quad', 'houses', 'stalks', 'bellhall',
  'datacenter', 'stacks', 'robotics', 'rig', 'foundry', 'works', 'well', 'tankyard', 'coolers', 'gantry', 'furnace', 'spheres'];
MP.ANCIENT_USES = {
  bunker: [['records', 1], ['clinic', 1], ['offices', 2], ['plant', 1], ['offices', 9]],
  skya: [['market', 2], ['clinic', 3], ['offices', 20], ['plant', 1], ['offices', 20], ['records', 2], ['school', 3], ['plant', 1], ['lodging', 30], ['plant', 1], ['offices', 13], ['hydroponics', 4], ['skylobby', 9]],
  comb: [['lodging', 9]],
  /* batch 2 */
  apartments: [['market', 1], ['lodging', 99]],
  lab: [['clinic', 1], ['labs', 8], ['plant', 1], ['labs', 9]],
  starlab: [['labs', 9]],
  /* batch 3 */
  offices: [['market', 1], ['clinic', 1], ['offices', 9], ['plant', 1], ['offices', 99]],
  library: [],
  police: [['offices', 1], ['records', 1], ['offices', 9]],
  /* batch 4: the Cloisters a college (schoolrooms, lodging, its stacks above), the Houses and the Capsule Stalks lodging; the Bell Hall a hall */
  quad: [['school', 2], ['lodging', 2], ['records', 9]],
  houses: [['lodging', 9]],
  stalks: [['lodging', 99]],
  bellhall: [],
  /* industry: machine halls in the data centers, workshops and stores in the factories and the fuel stations */
  datacenter: [['servers', 99]], stacks: [['servers', 99]], robotics: [['works', 99]], rig: [['works', 99]], foundry: [['works', 99]], works: [['works', 99]], well: [['works', 99]], tankyard: [['works', 99]],
  coolers: [['servers', 99]], gantry: [['works', 99]], furnace: [['works', 99]], spheres: [['works', 99]]
};
/* what a building's ground storey is for, where it is not a lobby: the Crown Library's reading hall (its stacks at the skin, reading rooms inside) */
MP.ANCIENT_GROUND = { library: 'reading', bellhall: 'assembly', datacenter: 'servers', stacks: 'servers', robotics: 'works', rig: 'works', foundry: 'works', works: 'works', well: 'works', tankyard: 'works', coolers: 'servers', gantry: 'works', furnace: 'works', spheres: 'works' };
/* the storeys that are one hall each part (by use): the Crown Library's reading floor, its stacks a library throughout; industry's machine halls
   (MP.machineLayout) */
MP.ANCIENT_HALL = { reading: 'stack', assembly: 'hall', servers: 'servers', works: 'works' };
(function () {
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  var SKIN = { lobby: function (i) { return i % 4 === 0 ? 'reception' : 'stall'; }, market: function () { return 'stall'; }, clinic: function (i) { return i % 6 === 2 ? 'store' : 'clinic'; }, offices: function (i) { return i % 4 === 3 ? 'meeting' : 'office'; },
    plant: function () { return 'plant'; }, records: function () { return 'stack'; }, school: function (i) { return i % 7 === 3 ? 'store' : 'classroom'; }, hydroponics: function () { return 'greenhouse'; }, skylobby: function (i) { return i % 3 ? 'cafe' : 'concourse'; },
    lodging: function (i) { return i % 5 === 4 ? 'living' : 'bedroom'; }, labs: function (i) { return i % 3 === 2 ? 'office' : 'workshop'; }, works: function (i) { return i % 4 === 3 ? 'store' : 'workshop'; }, servers: function (i) { return i % 5 === 4 ? 'store' : 'plant'; }, reading: function (i) { return i % 4 === 3 ? 'reception' : 'stack'; } };
  var INNER = { works: function (i) { return i % 3 ? 'store' : 'plant'; }, servers: function () { return 'plant'; }, reading: function (i) { return i % 3 ? 'study' : 'store'; }, labs: function (i) { return i % 4 === 1 ? 'meeting' : 'store'; }, offices: function (i) { return i % 3 ? 'meeting' : 'store'; }, lodging: function (i) { return i % 2 ? 'bath' : 'store'; }, clinic: function () { return 'store'; }, school: function () { return 'store'; }, market: function () { return 'store'; }, lobby: function () { return 'store'; }, skylobby: function () { return 'store'; } };
  MP.ancientFamily = function (A, grid, entries) {
    var lv = grid.levels.filter(function (l) { return !l.roof; }), cores = grid.cores || (grid.core ? [grid.core] : []), C = cores[0], W = grid.W, D = grid.D, cs = grid.cell, N = W * D, L = [], masks = [];
    var inSq = function (Q, i, j) { var x = grid.x0 + (i + 0.5) * cs, z = grid.z0 + (j + 0.5) * cs; return x > Q.x0 && x < Q.x0 + Q.n && z > Q.z0 && z < Q.z0 + Q.n; };
    /* the ground storey: its own inside cells and the core's square (a tower on pilotis is entered by its core) */
    var g0 = new Uint8Array(grid.ground);
    for (var j = 0; j < D; j++) for (var i = 0; i < W; i++) if (cores.some(function (Q) { return inSq(Q, i, j); })) g0[j * W + i] = 1;
    /* a hall on a plinth (floors false, its doors up steps: the Crown Library's at 1.9 m) has its storey at its lowest door's sill */
    var gy = A.floors === false && (entries || []).length ? Math.max(0, Math.min.apply(null, entries.map(function (E) { return E.y; }))) : 0;
    L.push({ k: 0, y: r3(gy), h: lv.length ? lv[0].y - gy : A.sh, use: MP.ANCIENT_GROUND[A.id] || 'lobby' }); masks.push(g0);
    var prog = (MP.ANCIENT_USES[A.id] || []).length ? MP.ANCIENT_USES[A.id] : [['offices', 99]], pi = 0, left = prog[0][1];
    lv.forEach(function (l, q) {
      var nx = lv[q + 1], h = nx && nx.y - l.y <= A.sh * 1.01 ? nx.y - l.y : A.sh;
      if (left <= 0 && pi + 1 < prog.length) { pi++; left = prog[pi][1]; } left--;
      L.push({ k: L.length, y: r3(l.y), h: r3(h), use: prog[pi][0] }); masks.push(l.g);
    });
    /* each core's square is floor on every storey its shaft passes (a storey thinner than the square, the Apartments' lowest, gets it whole) */
    masks = masks.map(function (m, k) { var y = L[k].y, add = cores.filter(function (Q) { return k === 0 || (Q.levels || []).some(function (q) { return q >= y - 0.01; }); }); if (!add.length) return m; var c = new Uint8Array(m); for (var j2 = 0; j2 < D; j2++) for (var i2 = 0; i2 < W; i2++) if (add.some(function (Q) { return inSq(Q, i2, j2); })) c[j2 * W + i2] = 1; return c; });
    var last = L.length - 1, shafts = [];
    /* each core's stair and lift (a 4 m square: the stair alone), from the ground to its part's top storey; the first core's ids plain */
    cores.forEach(function (Q, ci) {
      var sfx = ci ? '.' + ci : '', top = 0; L.forEach(function (l) { if (l.k && (Q.levels || []).some(function (y) { return Math.abs(y - l.y) < 0.01; })) top = l.k; }); if (!Q.levels) top = last;
      if (Q.n >= 6) shafts.push({ id: 'stair' + sfx, kind: 'stair', x: r3(Q.x0 + 1.6), z: r3(Q.z0 + 2.55), w: 2.7, d: 4.6, from: 0, to: top, face: 2, bay: [Q.x0, Q.x0 + 3], core: ci }, { id: 'lift' + sfx, kind: 'lift', x: r3(Q.x0 + 4.55), z: r3(Q.z0 + 1.45), w: 2.4, d: 2.4, from: 0, to: top, face: 2, bay: [Q.x0 + 3, Q.x0 + Q.n], core: ci });
      else shafts.push({ id: 'stair' + sfx, kind: 'stair', x: r3(Q.x0 + Q.n / 2), z: r3(Q.z0 + 1.95), w: 3, d: 3.4, from: 0, to: top, face: 2, bay: [Q.x0, Q.x0 + Q.n], core: ci });
    });
    /* the bridges: a storey in parts (Sky A's landing round its core in the atrium, its office ring) has each part joined to the core's, the
       nearest first, over a gap of 25 m at most: a search out from the joined parts through the cells between, to the first of another */
    var inCore = new Uint8Array(N); for (j = 0; j < D; j++) for (i = 0; i < W; i++) if (cores.some(function (Q) { return inSq(Q, i, j); })) inCore[j * W + i] = 1;
    var bridgesFor = function (M, lk) {
      var comp = new Int32Array(N).fill(-1), size = [], out = [];
      for (var c = 0; c < N; c++) if (M[c] && comp[c] < 0) { var s0 = [c], n0 = 0; comp[c] = size.length; while (s0.length) { var x = s0.pop(); n0++; [x - 1, x + 1, x - W, x + W].forEach(function (n) { if (n >= 0 && n < N && M[n] && comp[n] < 0) { comp[n] = size.length; s0.push(n); } }); } size.push(n0); }
      if (size.length < 2) return out;
      var joined = {}, any0 = false;
      /* a core joins its part only on the storeys its shaft serves */
      cores.forEach(function (Q, ci) { if (!shafts.some(function (s) { return (s.core || 0) === ci && lk >= s.from && lk <= s.to; })) return; var cc = comp[Math.floor((Q.z0 + Q.n / 2 - grid.z0) / cs) * W + Math.floor((Q.x0 + Q.n / 2 - grid.x0) / cs)]; if (cc >= 0) { joined[cc] = 1; any0 = true; } });
      if (!any0) joined[size.indexOf(Math.max.apply(null, size))] = 1;
      for (var guard = 0; guard < size.length; guard++) {
        var prev = new Int32Array(N).fill(-2), dist = new Int16Array(N), q = [], hit = -1;
        for (c = 0; c < N; c++) if (M[c] && joined[comp[c]] && !inCore[c]) { prev[c] = -1; q.push(c); }
        for (var h = 0; h < q.length && hit < 0; h++) {
          var x2 = q[h]; if (dist[x2] >= 40) continue;
          [x2 - 1, x2 + 1, x2 - W, x2 + W].forEach(function (n) {
            if (hit >= 0 || n < 0 || n >= N || prev[n] !== -2) return;
            if (M[n]) { if (!joined[comp[n]] && size[comp[n]] >= 8 && !(M[x2])) { prev[n] = x2; hit = n; } return; }
            prev[n] = x2; dist[n] = dist[x2] + 1; q.push(n);
          });
        }
        if (hit < 0) break;
        joined[comp[hit]] = 1;
        var path = [hit]; for (var p = prev[hit]; p >= 0; p = prev[p]) path.push(p);
        var e = path[0], e1 = path[1], s1 = path[path.length - 2], st0 = path[path.length - 1], dv = function (a, b) { var ai = a % W, bi = b % W; return [bi - ai, (b - bi) / W - (a - ai) / W]; };
        out.push({ s: st0, sd: dv(st0, s1), e: e, ed: dv(e, e1) });
      }
      return out;
    };
    var bridges = masks.map(bridgesFor);
    MP.ancientBridges = MP.ancientBridges || {}; MP.ancientBridges[A.id] = bridges;
    /* a bridge of 8 m or less crosses a wall of the kit's, not the air: the hero gets a doorway cut there (55, MP.ancientDoorways) */
    var doorways = []; bridges.forEach(function (Bs, k) { Bs.forEach(function (b) { var ax = grid.x0 + (b.s % W + 0.5) * cs, az = grid.z0 + (Math.floor(b.s / W) + 0.5) * cs, bx = grid.x0 + (b.e % W + 0.5) * cs, bz = grid.z0 + (Math.floor(b.e / W) + 0.5) * cs; if (Math.hypot(bx - ax, bz - az) <= 8) doorways.push({ a: [r3(ax), r3(az)], b: [r3(bx), r3(bz)], y0: L[k].y, y1: L[k].y + 2.3 }); }); });
    var cache = {}, tall = A.height.roof > Math.min(A.footprint.w, A.footprint.d);
    var F = MP.FAMILY[A.id] = {
      id: A.id, name: A.name, kind: A.kind, language: 0, culture: 'ancient', tris: A.tris, design: true, anc: true,
      footprint: { w: A.footprint.w, d: A.footprint.d }, height: A.height, storeys: L.length, levels: L, zones: [], grid: grid, doorways: doorways,
      envR: function () { return Math.min(A.footprint.w, A.footprint.d) / 2; }, portals: [], crown: { k: 'flat' }, secScale: 1, mat: 'concrete', fall: 0,
      core: { kind: 'rects', shafts: shafts }, bays: { width: 3, n: 0 },
      towers: [{ x: 0, z: 0, r: Math.min(A.footprint.w, A.footprint.d) / 2, sr: Math.min(A.footprint.w, A.footprint.d) / 3, h: A.height.roof, fall: Math.PI / 2, squat: !tall }],
      entryAt: function () { return C ? [r3(C.x0 + C.n / 2), r3(C.z0 + C.n + 1)] : [0, 0]; },
      plan: function (F2, Lv) {
        if (cache[Lv.k]) return cache[Lv.k];
        var en = (entries || []).filter(function (E) { return E.y >= Lv.y - 0.6 && E.y < Lv.y + Lv.h - 0.6; });
        return (cache[Lv.k] = MP.gridPlan(F2, Lv, { id: F2.id + '.' + Lv.k, grid: grid, mask: masks[Lv.k], cores: cores, shafts: shafts, kinds: SKIN[Lv.use] || SKIN.offices, inner: INNER[Lv.use] || SKIN[Lv.use] || INNER.offices, entries: en, ground: Lv.k === 0, bridges: bridges[Lv.k], hall: MP.ANCIENT_HALL[Lv.use] }));
      },
      hitIn: function (x, z, y, mg) {
        var k = 0, m = mg || 0; L.forEach(function (l) { if (y >= l.y - 0.1) k = l.k; }); var M = masks[k];
        for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) { var ii = Math.floor((x + a * m - grid.x0) / cs), jj = Math.floor((z + b * m - grid.z0) / cs); if (ii >= 0 && jj >= 0 && ii < W && jj < D && M[jj * W + ii]) return true; }
        return false;
      },
      ruins: {
        intact: { note: 'whole, as built' }, gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'glass gone, burnt out, streaked' }, crown: { keep: 0.8, note: 'the top fallen in' },
        broken: { keep: 0.55, note: 'torn through the middle, the upper part in the street' }, stump: { keep: 0.2, note: 'the lowest storeys and the core' },
        skeleton: { keep: 0.6, bare: 0.7, note: 'the skin gone above the plant floor; slabs and piers stand' }, fallen: { keep: 0.08, along: 1, note: 'down: a long mound' }
      }
    };
    return F;
  };
})();
