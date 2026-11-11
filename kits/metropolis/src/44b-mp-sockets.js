// ================================================================= METROPOLIS — the sockets: where a ruin can carry a plant  [G data]
// The owner, 2026-11-09: the ruins themselves overgrown, like the middle sections of Girder but all over, Midgar at the end of FF7. The kit
// says WHERE on every family and every look a plant can take hold, as plain records in the hero's own frame; the drawing (59e) and the
// biome's own kits (through a host's planter) grow what grows there. No THREE, no DOM: the sockets are read off the records (40, 46, 46c)
// and the same shape numbers the builders (52, 53, 54) draw from, so a socket sits on the drawn skin without reading any geometry.
//
//   MP.skin(F) -> the family's skin as parts: {kind:'polar'|'arc'|'box', cx, cz, r(y) | rect(y), y0, y1, sides, a0, a1, inward, roof, hole,
//                 terraces:[{y, rIn, rOut} | {y, e0, e1}], blank, helix}; cached a family
//   MP.skinAt(F, P, t, f, y) -> {x, z, nx, nz}: the point of part P's skin at height y under the socket's parameter (t the angle of a polar
//                 or arc part, f and t the face and its -1..1 run of a box), so a strand hung from a socket can follow the wall down
//   MP.sockets(F, look, seed, o) -> [{x, y, z, nx, ny, nz, kind, size, r, u, seed, p, t, f}] in the hero's frame:
//       kind   floor  a storey's slab open to the weather (a gutted or torn storey's edge, a skeleton's bare slab), ny up, 1.5 m in from the skin
//              ledge  a window sill, a balcony, a terrace, a parapet planter, the Spiral's ramp tread: out and a little up
//              edge   the torn rim of a broken floor, where the tear leaves the storey: out and up
//              top    the cut top (a torn storey's floor open to the sky), or a flat roof that stands (a roof park): up
//              wall   a crack, a seam between panels, mid-storey: out
//              root   the foot: a metre outside the plinth, on the ground: out
//              heap   a fallen ruin's rubble mound (MP.debrisPlan), on its slope: up
//       size   'vine' | 'shrub' | 'tree': how big a plant the socket holds; r the room it has, in metres
//       u      a unit hash: a host keeps the sockets with u < its density, so the same ones come first as the density rises
//       seed   a u32 for the plant drawn there; p, t, f the skin part and its parameter (MP.skinAt)
//   Deterministic: every number is a KRAND hash of (family, state, seed, part, level, index, salt), never of how many came before.
//   o.spacing (6 m between sockets along the skin), o.kinds (a Set of kinds to make; all when null)
(function () {
  var PI2 = Math.PI * 2, r3 = function (v) { return Math.round(v * 1000) / 1000; };
  var polyK = function (t, n) { if (!n) return 1; var s = PI2 / n, u = ((t % s) + s) % s; return Math.cos(Math.PI / n) / Math.cos(u - Math.PI / n); };
  var cache = {};
  // ---- the skins: the same numbers the builders draw from (54), as parts
  function skinOf(F) {
    var D = MP.DESIGNS && MP.DESIGNS[F.id], P = [], sh = F.levels && F.levels.length ? F.levels[0].h : 3.6;
    var polar = function (o) { return Object.assign({ kind: 'polar', cx: 0, cz: 0, y0: 0, sides: 0, roof: false, terraces: [] }, o); };
    var box = function (o) { return Object.assign({ kind: 'box', y0: 0, roof: false, terraces: [] }, o); };
    var rectOf = function (hw, hd) { return function () { return { cx: 0, cz: 0, hw: hw, hd: hd, yaw: 0 }; }; };
    switch (F.id) {
      case 'spindle': P.push(polar({ r: MP.spindleR, y1: 222, sill: 0.9 }), polar({ r: function () { return 20; }, y0: 222, y1: 234, roof: true, hole: 13.5, sill: 0.9, blank: true })); break;
      case 'ledger': P.push(box({ rect: rectOf(F.footprint.w / 2, F.footprint.d / 2), y0: F.levels[1].y, y1: F.height.roof, roof: true, holeRect: { hw: F.massing[1].w / 2 + 1, hd: F.massing[1].d / 2 + 1 }, sill: 0.9 })); break;
      case 'organ': D.pipes.forEach(function (p) { P.push(polar({ cx: p[0], cz: p[1], r: function () { return p[2]; }, y0: F.levels[0].h, y1: p[3] - 6 })); }); break;
      case 'wedge': { var H = F.height.roof, b = { hw: D.footprint.w / 2, hd: D.footprint.d / 2 }, T = D.top, rect = function (y) { var t = Math.max(0, Math.min(1, y / H)); return { cx: 0, cz: D.lean * Math.pow(t, 1.5), hw: b.hw + (T.hw - b.hw) * t, hd: b.hd + (T.hd - b.hd) * t, yaw: 0 }; };
        P.push(box({ rect: rect, y0: sh, y1: H, roof: true, terraces: [{ y: D.slot[0], e0: 0, e1: 3 }] })); break; }
      case 'yoke': { var L = D.legs, Bd = D.body, legR = function (y) { return L.r + L.swell * Math.sin(Math.PI * Math.min(1, Math.max(0, y) / L.y1)); }, bodyR = function (y) { var v = Math.abs((y - Bd.y) / Bd.ry); return v >= 1 ? 0.01 : Math.max(0.01, Bd.rx * Math.pow(1 - Math.pow(v, 4), 0.25)); };
        var yJ = Math.floor(L.y1 / D.sh + 1e-6) * D.sh, b1 = Bd.y + Bd.ry, yB = yJ + Math.floor((b1 - 12 - yJ) / D.sh) * D.sh;
        [-1, 1].forEach(function (s) { P.push(polar({ cx: s * L.x, r: legR, y0: sh, y1: yJ })); });
        P.push(polar({ r: bodyR, y0: yJ, y1: yB })); break; }
      case 'reed': { var H2 = F.height.roof, hw = D.footprint.w / 2, hd = D.footprint.d / 2, rect2 = function (y) { var t = Math.min(1, Math.max(0, y) / H2), s = 1 + D.widen * t; return { cx: 0, cz: 0, hw: hw * s, hd: hd * s, yaw: D.twist * Math.PI / 180 * t }; };
        P.push(box({ rect: rect2, y0: sh, y1: H2, roof: true })); break; }
      case 'telescope': { var st = D.stages, hS = F.height.roof / st.length;
        st.forEach(function (r, k) { var y0 = k * hS, y1 = y0 + hS, q = polar({ r: function () { return r; }, sides: 8, y0: k ? y0 : sh, y1: y1, sill: 0.42 }); if (k + 1 < st.length) q.terraces.push({ y: y1, rIn: st[k + 1] + 0.4, rOut: r + 0.5 }); P.push(q); }); break; }
      case 'stalk': { var S = D.stalk, s0 = function (y) { return S.r0 + (S.r1 - S.r0) * Math.min(1, Math.max(0, y) / 170); };
        P.push(polar({ r: function () { return S.r0 + 5; }, y0: 0, y1: 4.5, blank: true }), polar({ r: s0, y0: 12, y1: 170, blank: true }));
        D.saucers.forEach(function (sc) { var b0 = sc.y - sc.t * 0.3, b1 = sc.y + sc.t * 0.2, q = polar({ r: function (y) { return sc.r - (Math.min(b1, Math.max(b0, y)) - b0) * 0.25; }, y0: b0, y1: b1, sill: 0.12 }); q.terraces.push({ y: sc.y + sc.t * 0.32, rIn: s0(sc.y) + 1.5, rOut: sc.r * 0.78 }); P.push(q); }); break; }
      case 'swell': { var H3 = F.height.roof, Lb = D.lobes, lr = function (y) { return Lb.r + Lb.swell * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, y) / H3)), 0.6); }, n3 = Math.round(H3 / D.sh);
        for (var k = 0; k < Lb.n; k++) { var a = Math.PI / 4 + k * PI2 / Lb.n, q3 = polar({ cx: Math.cos(a) * Lb.at, cz: Math.sin(a) * Lb.at, r: lr, y0: sh, y1: H3 });
          for (var i = D.balcony; i < n3; i += D.balcony) { var yb = i * H3 / n3; q3.terraces.push({ y: yb, rIn: lr(yb) + 0.1, rOut: lr(yb) + 2.5 }); } P.push(q3); }
        P.push(polar({ r: function () { return D.core; }, y0: 0, y1: H3, blank: true })); break; }
      case 'terrace': { var R = D.rings, hT = F.height.roof / R.length;
        R.forEach(function (r, k) { var y0 = k * hT, y1 = y0 + hT, last = k + 1 === R.length, q4 = polar({ r: function () { return r; }, y0: k ? y0 : sh, y1: y1, roof: last, hole: last ? D.court + 0.5 : 0 });
          if (!last) { q4.terraces.push({ y: y1, rIn: R[k + 1] + 0.4, rOut: r - 1.7 }); q4.terraces.push({ y: y1 + 0.45, rIn: r - 1.7, rOut: r - 0.3, soil: true }); } P.push(q4); });
        P.push(polar({ r: function () { return D.court; }, y0: 0, y1: F.height.roof, inward: true })); break; }
      case 'cupola': P.push(polar({ r: function () { return D.r; }, y0: 0, y1: F.height.roof, sill: 0.3 })); break;
      case 'crescent': { var Rr = D.R, w = D.width, cz = Rr, mid = -Math.PI / 2, a0 = mid - D.span / 2, a1 = mid + D.span / 2, cut = [a0, a0 + D.span * D.stepAt]; for (var j = 1; j < D.steps.length; j++) cut.push(cut[1] + (a1 - cut[1]) * j / (D.steps.length - 1));
        D.steps.forEach(function (h, i) { P.push({ kind: 'arc', cx: 0, cz: cz, r: function () { return Rr + w / 2; }, rIn: Rr - w / 2, a0: cut[i], a1: cut[i + 1], y0: i ? 0 : sh, y1: h, roof: true, terraces: [], sides: 0 }); P.push({ kind: 'arc', cx: 0, cz: cz, r: function () { return Rr - w / 2; }, a0: cut[i], a1: cut[i + 1], y0: 0, y1: h, inward: true, roof: false, terraces: [], sides: 0 }); }); break; }
      case 'terrarium': { var Sp = D.sphere, cy = Sp.y, rs = Sp.r, bot = cy - rs, rr = function (y) { return Math.max(0.01, Math.sqrt(Math.max(0, rs * rs - (y - cy) * (y - cy)))); };
        P.push(polar({ r: rr, y0: bot + 8, y1: cy, roof: true, hole: 4.5 }), polar({ r: function () { return 3.7; }, y0: 6.6, y1: bot + 8, blank: true })); break; }
      case 'arcades': { var hw4 = D.footprint.w / 2, hd4 = D.footprint.d / 2, cw = D.court.w / 2, cd = D.court.d / 2;
        P.push(box({ rect: rectOf(hw4, hd4), y0: D.arch.h, y1: F.height.roof, roof: true, holeRect: { hw: cw, hd: cd } }), box({ rect: rectOf(hw4, hd4), y0: 0, y1: D.arch.h, blank: true, holeRect: { hw: cw, hd: cd } }), box({ rect: rectOf(cw, cd), y0: 0, y1: F.height.roof, inward: true })); break; }
      case 'pods': D.pods.forEach(function (p) { P.push(polar({ cx: p.x, cz: p.z, r: function (y) { return Math.max(0.01, Math.sqrt(Math.max(0, p.r * p.r - (y - p.y) * (y - p.y)))); }, y0: p.y - p.r * 0.7, y1: p.y + p.r * 0.55, sill: 0.25 }), polar({ cx: p.x, cz: p.z, r: function () { return 7; }, y0: 0, y1: 4.2, blank: true })); });
        { var Dm = D.dome; P.push(polar({ cx: Dm.x, cz: Dm.z, r: function (y) { return Math.max(0.01, Dm.r * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, y) / Dm.h, 2)))); }, y0: 3.6, y1: Dm.h * 0.8 })); } break;
      case 'spiral': { var H5 = F.height.roof, R5 = function (y) { return D.r0 + (D.r1 - D.r0) * Math.min(1, Math.max(0, y) / H5); };
        P.push(polar({ r: R5, y0: sh, y1: H5, helix: { ts: Math.PI + 0.5, turns: D.turns, n: Math.round(D.turns * 64), rw: D.ramp, H: H5 } })); break; }
      default: { /* an Ancients kit building or a family not listed: its footprint, as a box or a drum */
        var fp = F.footprint || {}; if (fp.r != null && fp.w == null) P.push(polar({ r: function () { return fp.r; }, y1: F.height.roof, roof: true })); else P.push(box({ rect: rectOf((fp.w == null ? 30 : fp.w) / 2, (fp.d == null ? 30 : fp.d) / 2), y1: F.height.roof, roof: true })); }
    }
    P.forEach(function (q, i) { q.i = i; if (q.sill == null) q.sill = null; });
    return P;
  }
  MP.skin = function (F) { return cache[F.id] || (cache[F.id] = skinOf(F)); };
  // a part's skin point under (t, f) at height y
  MP.skinAt = function (F, P, t, f, y) {
    if (P.kind === 'box') { var r = P.rect(y), c = Math.cos(r.yaw == null ? 0 : r.yaw), s = Math.sin(r.yaw == null ? 0 : r.yaw), x, z, nx, nz;
      if (f === 0) { x = t * r.hw; z = r.hd; nx = 0; nz = 1; } else if (f === 1) { x = r.hw; z = -t * r.hd; nx = 1; nz = 0; } else if (f === 2) { x = -t * r.hw; z = -r.hd; nx = 0; nz = -1; } else { x = -r.hw; z = t * r.hd; nx = -1; nz = 0; }
      var k = P.inward ? -1 : 1; return { x: r.cx + x * c + z * s, z: r.cz - x * s + z * c, nx: k * (nx * c + nz * s), nz: k * (-nx * s + nz * c) }; }
    var rr = P.r(y) * polyK(t, P.sides), kk = P.inward ? -1 : 1; return { x: P.cx + Math.cos(t) * rr, z: P.cz + Math.sin(t) * rr, nx: kk * Math.cos(t), nz: kk * Math.sin(t) };
  };
  // the perimeter of a part at height y, a point every `sp` metres (phase: a turn of the first point, so the rows do not stack)
  function ring(F, P, y, sp, phase) {
    var out = [];
    if (P.kind === 'box') { var r = P.rect(y); for (var f = 0; f < 4; f++) { var L = (f % 2 === 0 ? r.hw : r.hd) * 2, n = Math.max(1, Math.round(L / sp)); for (var i = 0; i < n; i++) { var t = -1 + 2 * ((i + 0.5 + phase) % n) / n, q = MP.skinAt(F, P, t, f, y); q.t = t; q.f = f; q.len = L / n; out.push(q); } } return out; }
    var a0 = P.a0 == null ? 0 : P.a0, a1 = P.a1 == null ? PI2 : P.a1, rad = P.r(y), n2 = Math.max(P.a1 == null ? 6 : 2, Math.round((a1 - a0) * rad / sp));
    for (var j = 0; j < n2; j++) { var tt = a0 + (a1 - a0) * (((j + 0.5 + phase) % n2) / n2), q2 = MP.skinAt(F, P, tt, -1, y); q2.t = tt; q2.f = -1; q2.len = (a1 - a0) * rad / n2; out.push(q2); }
    return out;
  }
  // the plan points inside a part at height y (a roof, a torn floor), on rings or a grid `sp` apart, each with how far it is from the rim
  function inside(F, P, y, sp, phase) {
    var out = [];
    if (P.kind === 'box') { var r = P.rect(y), c = Math.cos(r.yaw == null ? 0 : r.yaw), s = Math.sin(r.yaw == null ? 0 : r.yaw), nx = Math.max(1, Math.round(2 * r.hw / sp)), nz = Math.max(1, Math.round(2 * r.hd / sp)), H = P.holeRect;
      for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) { var x = -r.hw + 2 * r.hw * (i + 0.5 + 0.3 * ((j + phase) % 2)) / nx, z = -r.hd + 2 * r.hd * (j + 0.5) / nz; if (Math.abs(x) > r.hw - 1.5 || Math.abs(z) > r.hd - 1.5) continue;
        if (H && Math.abs(x) < H.hw && Math.abs(z) < H.hd) continue; var room = Math.min(r.hw - Math.abs(x), r.hd - Math.abs(z)); if (H) room = Math.min(room, Math.max(0, Math.max(Math.abs(x) - H.hw, Math.abs(z) - H.hd))); out.push({ x: r.cx + x * c + z * s, z: r.cz - x * s + z * c, room: room }); }
      return out; }
    var R = P.r(y), rIn = P.kind === 'arc' ? (P.rIn == null ? 0 : P.rIn) : (P.hole == null ? 0 : P.hole), a0 = P.a0 == null ? 0 : P.a0, a1 = P.a1 == null ? PI2 : P.a1;
    for (var rr = R - 1.5; rr > rIn + 1.2; rr -= sp) { var n = Math.max(1, Math.round((a1 - a0) * rr / sp)); for (var k = 0; k < n; k++) { var t = a0 + (a1 - a0) * (((k + 0.5 + phase) % n) / n); out.push({ x: P.cx + Math.cos(t) * rr * polyK(t, P.sides), z: P.cz + Math.sin(t) * rr * polyK(t, P.sides), room: Math.min(R - rr, rr - rIn), t: t }); } }
    return out;
  }
  // the top of what stands of part P's skin at a plan point (the state's tear: by sectors and storeys for the Spindle, by bays for the Ledger,
  // by the tear's line for a design); a skeleton's skin stands to its skin line, its bare frame above (its floors are floor sockets)
  function standTop(F, R, P, x, z, t) {
    if (R.state === 'intact') return P.y1;
    if (R.state === 'gutted') return Math.min(R.cut, P.y1);   /* a flat cut (the Spindle's lamp goes with its glass); a design's gutted cut is its roof */
    if (R.frame) return Math.min(R.skin, R.cut, P.y1);   /* (a record whose plant floor stands above its cut, the Spiral's, keeps its skin to the cut) */
    var lim;
    if (F.id === 'spindle') { var SEC = 24, sec = Math.floor((((t % PI2) + PI2) % PI2) / (PI2 / SEC)), c = MP.tearAt(F, R, (sec + 0.5) * (PI2 / SEC) * 24), y = 0; F.levels.forEach(function (L) { if (L.y < c && L.y < R.cut) y = Math.max(y, Math.min(L.y + L.h, R.cut)); }); lim = y; }
    else if (F.id === 'ledger') { var hw = F.footprint.w / 2, W = F.bays.width, bay = Math.max(0, Math.min(F.bays.n - 1, Math.floor((x + hw) / W))), c2 = MP.tearAt(F, R, -hw + (bay + 0.5) * W), y2 = 0; F.levels.forEach(function (L) { if (L.y < c2 && L.y < R.cut) y2 = Math.max(y2, Math.min(L.y + L.h, R.cut)); }); lim = y2; }
    else lim = MP.tearAtXZ(F, R, x, z);
    return Math.max(0, Math.min(lim, P.y1));
  }
  var SIZES = ['vine', 'shrub', 'tree'];
  MP.sockets = function (F, look, seed, o) {
    o = o || {}; var state = MP.look(look).state, R = MP.ruin(F, state), sp = o.spacing == null ? 6 : o.spacing, want = o.kinds || null, out = [];
    var seedK = KRAND.hash(MP.SEED, MP.idHash(F.id + '.' + state), seed == null ? 0 : seed | 0), P = MP.skin(F), top = R.top;
    var h = function (p, l, i, salt) { return KRAND.unit(KRAND.hash(seedK, p, l, i, salt)); };
    var put = function (kind, p, l, i, q, y, n, size, room) {
      if (want && !want.has(kind)) return; if (kind !== 'heap' && y > top + 0.05) return; var ln = Math.hypot(n[0], n[1], n[2]) || 1;
      out.push({ x: r3(q.x), y: r3(y), z: r3(q.z), nx: r3(n[0] / ln), ny: r3(n[1] / ln), nz: r3(n[2] / ln), kind: kind, size: size, r: r3(room), u: Math.floor(h(p, l, i, 1) * 1000) / 1000, seed: KRAND.hash(seedK, p, l, i, 9), p: p, t: q.t == null ? 0 : r3(q.t), f: q.f == null ? -1 : q.f });
    };
    var pick = function (p, l, i, salt, a, b) { var v = h(p, l, i, salt); return v < a ? SIZES[0] : v < a + b ? SIZES[1] : SIZES[2]; };
    var cutState = R.state !== 'intact', rowPh = KRAND.hash(MP.SEED, MP.idHash(F.id), seed == null ? 0 : seed | 0, 77) & 1;
    P.forEach(function (Q, p) {
      var yTop = Math.min(Q.y1, cutState ? R.cut : Q.y1);
      // ---- the storeys: a ledge at each sill on every other storey (the rows alternate by family), a wall crack mid-storey on every fourth, a
      // floor just inside on an open storey
      var levels = Q.blank ? [] : F.levels.filter(function (L) { return L.y + 0.5 >= Q.y0 && L.y + 0.5 < Q.y1 && (L.k + rowPh) % 2 === 0; });
      if (Q.blank) { for (var yy = Q.y0 + 4; yy < Q.y1 - 2; yy += 10.8) levels.push({ k: Math.round(yy), y: yy, h: 3.6, blank: true }); }
      levels.forEach(function (L) {
        var l = L.k, yS = L.y + (Q.sill != null ? (Q.sill < 1 ? Q.sill * L.h : Q.sill) : 0.28 * L.h), ph = h(p, l, 0, 3);
        ring(F, Q, yS, sp, ph).forEach(function (q, i) {
          var st = standTop(F, R, Q, q.x, q.z, q.t); if (yS > st - 0.3) return;
          if (!L.blank) put('ledge', p, l, i, q, yS, [q.nx, 0.35, q.nz], h(p, l, i, 4) < 0.8 ? 'vine' : 'shrub', 0.6);
          var yW = L.y + L.h * (0.5 + 0.3 * (h(p, l, i, 5) - 0.5));
          if (((l + rowPh) % 4 === 0 || L.blank) && i % 2 === 0 && yW < st - 0.3) put('wall', p, l, i, q, yW, [q.nx, 0, q.nz], 'vine', 0.3);
          /* an open storey (its glass gone: every look but intact) takes the weather a metre and a half in */
          if (cutState && !L.blank && i % 3 === (l % 3)) put('floor', p, l, i, { x: q.x - q.nx * 1.5, z: q.z - q.nz * 1.5, t: q.t, f: q.f }, L.y + 0.06, [0, 1, 0], pick(p, l, i, 6, 0.3, 0.6), 1.5);
        });
      });
      if (Q.inward) { foot(Q, p); return; }   /* a court's wall: its sills and cracks only; its floor is the court */
      // ---- a skeleton's bare slabs: floors all over them, open to the sky; the highest one is its top
      var frameLv = R.frame && Q.y1 > R.frame[0] ? F.levels.filter(function (L) { return L.y >= R.frame[0] - 0.01 && L.y < Math.min(R.cut, Q.y1); }) : [];
      frameLv.forEach(function (L, li) {
        inside(F, Q, L.y, sp * 1.5, h(p, L.k, 0, 7)).forEach(function (q, i) { put(li === frameLv.length - 1 ? 'top' : 'floor', p, L.k, 1000 + i, q, L.y + 0.06, [0, 1, 0], pick(p, L.k, i, 8, 0.2, 0.6), Math.min(3, q.room)); });
      });
      // ---- the torn rim and the cut top: where the state's tear can reach this part under its top, an edge socket at the rim and top
      // sockets on the storey's floor; where the part's roof stands and is flat, top sockets on it (a roof park)
      var ph2 = h(p, 0, 0, 10), cutHere = cutState && (!R.frame || !frameLv.length) && R.cut - R.torn < Q.y1 - 0.3;   /* a skeleton with no bare band (its plant floor at its cut) is a plain cut */
      if (cutHere) ring(F, Q, Math.max(Q.y0, yTop - 1), sp, ph2).forEach(function (q, i) { var st = standTop(F, R, Q, q.x, q.z, q.t); if (st <= Q.y0 + 0.5 || st >= Q.y1 - 0.3) return; var q2 = MP.skinAt(F, Q, q.t, q.f, st - 0.2); q2.t = q.t; q2.f = q.f; put('edge', p, 0, i, q2, st - 0.15, [q2.nx, 0.7, q2.nz], h(p, 0, i, 11) < 0.5 ? 'vine' : 'shrub', 1.2); });
      var yRoof = cutHere ? yTop : Q.y1;
      /* a top is the thickest ground a ruin has (Midgar's roofs): its sockets at six tenths of the spacing */
      if (cutHere || (Q.roof && (!R.frame || Q.y1 <= R.skin + 0.3))) inside(F, Q, Math.max(Q.y0, yRoof - 0.5), sp * 0.6, ph2).forEach(function (q, i) {
        var st = cutHere ? standTop(F, R, Q, q.x, q.z, q.t == null ? Math.atan2(q.z - Q.cz, q.x - Q.cx) : q.t) : Q.y1; if (cutHere && (st <= Q.y0 + 0.5 || st > Q.y1 - 0.3 && !Q.roof)) return;
        put('top', p, 1, i, q, st + 0.04, [0, 1, 0], pick(p, 1, i, 12, 0.1, 0.45), Math.min(5, q.room));
      });
      // ---- the terraces: a ledge socket along each (a balcony, a setback, a parapet planter), out and up
      Q.terraces.forEach(function (T, ti) {
        if (T.y > yTop + 0.3) return; var w = T.e0 != null ? Math.abs(T.e1 - T.e0) : T.rOut - T.rIn, mid = T.e0 != null ? (T.e0 + T.e1) / 2 : (T.rIn + T.rOut) / 2;
        var pts = T.e0 != null ? (function () { var r = Q.rect(T.y), r2 = Object.assign({}, Q, { rect: function () { return { cx: r.cx, cz: r.cz, hw: r.hw - mid, hd: r.hd - mid, yaw: r.yaw }; } }); return ring(F, r2, T.y, sp, h(p, 50 + ti, 0, 13)); })()
          : (function () { var r2 = Object.assign({}, Q, { r: function () { return mid; }, sides: 0 }); return ring(F, r2, T.y, sp, h(p, 50 + ti, 0, 13)); })();
        pts.forEach(function (q, i) { if (cutState && !R.frame && standTop(F, R, Q, q.x, q.z, q.t) < T.y - 0.2) return; put('ledge', p, 50 + ti, i, q, T.y + 0.05, [q.nx * 0.4, 1, q.nz * 0.4], T.soil ? (h(p, 50 + ti, i, 14) < 0.5 ? 'shrub' : 'tree') : pick(p, 50 + ti, i, 14, 0.35, 0.5), Math.max(0.4, w / 2)); });
      });
      // ---- the Spiral's ramp: a ledge on the tread every spacing along it
      if (Q.helix) { var X = Q.helix, step = Math.max(1, Math.round(sp / (PI2 * X.turns * (Q.r(X.H / 2) + X.rw / 2) / X.n)));
        for (var i = 0; i < X.n; i += step) { var t = X.ts + i / X.n * X.turns * PI2, y = X.H * i / X.n + 0.6; if (y > yTop - 0.3) break; var rr = Q.r(y) + X.rw / 2; put('ledge', p, 90, i, { x: Q.cx + Math.cos(t) * rr, z: Q.cz + Math.sin(t) * rr, t: t, f: -1 }, y, [Math.cos(t) * 0.3, 1, Math.sin(t) * 0.3], pick(p, 90, i, 15, 0.4, 0.5), X.rw / 2 - 0.3); } }
      foot(Q, p);
    });
    // ---- the foot: roots a metre out from the plinth
    function foot(Q, p) { if (Q.y0 < 8) ring(F, Q, Math.max(Q.y0, 0.2), sp * 1.5, h(p, 0, 0, 16)).forEach(function (q, i) { put('root', p, 2, i, { x: q.x + q.nx * 1.2, z: q.z + q.nz * 1.2, t: q.t, f: q.f }, 0.08, [q.nx, 0.2, q.nz], pick(p, 2, i, 17, 0, 0.6), 3); }); }
    // ---- a fallen ruin's heaps: on the slope of each mound, where a seed can lodge
    if (MP.RUINS.indexOf(R.state) > 1) { var Dp = MP.debrisPlan(F, state); (Dp ? Dp.mounds : []).forEach(function (m, mi) {
      var c = Math.cos(m.ry), s = Math.sin(m.ry), nx = Math.max(1, Math.round(2 * m.rx / (sp * 1.3))), nz = Math.max(1, Math.round(2 * m.rz / (sp * 1.3)));
      for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) { var lx = -m.rx + 2 * m.rx * (i + 0.5) / nx, lz = -m.rz + 2 * m.rz * (j + 0.5) / nz, q = Math.hypot(lx / m.rx, lz / m.rz); if (q > 0.85 || (q < 0.08 && nx * nz > 1)) continue; q = Math.max(q, 0.08);
        var hgt = m.h * Math.pow(1 - q * q, 0.8), gx = -lx / (m.rx * m.rx) * 1.6 * m.h * Math.pow(1 - q * q, -0.2), gz = -lz / (m.rz * m.rz) * 1.6 * m.h * Math.pow(1 - q * q, -0.2);
        put('heap', 200 + mi, 0, i * nz + j, { x: m.x + lx * c - lz * s, z: m.z + lx * s + lz * c, t: 0, f: -1 }, (m.y0 == null ? 0 : m.y0) + hgt + 0.05, [-gx, 1, -gz], pick(200 + mi, 0, i * nz + j, 18, 0.1, 0.55), 2.5); } }); }
    return out;
  };
  // the sockets a host keeps at a density: those whose unit hash is under it
  MP.socketsAt = function (F, look, seed, density, o) { var d = density == null ? 1 : density; return MP.sockets(F, look, seed, o).filter(function (s) { return s.u < d; }); };
  // does a socket sit on its skin part, within pad metres of the drawn surface (a heap's on its mound): the test's and a host's sanity check
  MP.socketInside = function (F, s, pad) {
    pad = pad == null ? 3.5 : pad;
    if (s.kind === 'heap') { var Dp = MP.debrisPlan(F, s.state == null ? 'stump' : s.state); return !Dp ? false : Dp.mounds.some(function (m) { var c = Math.cos(m.ry), sn = Math.sin(m.ry), dx = s.x - m.x, dz = s.z - m.z, lx = dx * c + dz * sn, lz = -dx * sn + dz * c; return Math.hypot(lx / m.rx, lz / m.rz) <= 1 && s.y <= (m.y0 == null ? 0 : m.y0) + m.h + 0.5; }); }
    var P = MP.skin(F)[s.p]; if (!P) return false; var y = Math.max(P.kind === 'box' ? P.y0 : 0, Math.min(P.y1, s.y));
    if (P.kind === 'box') { var r = P.rect(y), c = Math.cos(r.yaw == null ? 0 : r.yaw), sn = Math.sin(r.yaw == null ? 0 : r.yaw), dx = s.x - r.cx, dz = s.z - r.cz, lx = dx * c - dz * sn, lz = dx * sn + dz * c; return Math.abs(lx) <= r.hw + pad && Math.abs(lz) <= r.hd + pad; }
    var d = Math.hypot(s.x - P.cx, s.z - P.cz), R = P.r(y) * (P.sides ? 1 : 1) + pad; if (P.kind === 'arc') return d <= R && d >= (P.rIn == null ? P.r(y) : P.rIn) - pad - 0.01; return d <= R;
  };
})();
