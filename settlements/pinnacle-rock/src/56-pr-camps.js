// ================================================================= PINNACLE ROCK — the bands' grounds (P3c)  [G data]
// PRC.plan(o) pitches every band's ground (PLAN.md section 1, "The upper camp grounds", "The lower camp grounds and
// pastures"; the kit's table, BR_CAMP in kits/beast-riders/src/79-br-camp.js): on the top, a ground for each of nine
// tribes (the flyers' three only there, by their Wing's fins, about nine tents and their perch frames; the six ground
// tribes' smaller, about five tents and a hitching line); on the floor, nine bands' camps, each with its pasture, the two
// inside the band's own thorn hedge (two gates), the pasture fenced in rails within it (one gate, toward the camp).
// Plain records only: no THREE, no DOM.
//
//   o = {PR, CAMP (BR_CAMP), RUN (BR_RUN), dims(key, v) -> {w, d, h}, upperOk(x, z) (a point of the top a tent may stand
//        on), lowerOk(x, z) (of the floor), h(x, z) (the ground), gates ([{name, x, z}]: the palisade's), tags, seed}
//   -> {grounds: [{tribe, ground, name, ell, items, hedge, fence, banner, track}], tracks, log}
//
// PITCHING. A ground's tents and pens, largest first, each the first fit on rings out from its place (the chief's
// pavilion and the council at the middle; the pens toward the pasture below, toward the fins and the rim above), turned to
// face the chief's pavilion (or across it), its box 2 m clear of every other and wholly inside the ground (its corners,
// its edges' middles and its centre in the ellipse and on ground the band may use). A band that cannot pitch an item
// says so (log.short). The tribe's banner stands before the chief's pavilion.
const PRC = (function () {
  'use strict';
  const GAP = 2;
  // the order a ground is pitched in: the chief, the council, the pens (larger first), then the tents (larger first)
  const RANK = k => /chief/.test(k) ? 0 : /council/.test(k) ? 1 : /paddock|grove|training_yard|lunge|corral|pond_nets|breaking|perch|kennel|crawler_shed|hitch|feed|net_house|spinning/.test(k) ? 2 : 3;
  function plan(o) {
    const PR = o.PR, LOG = { short: [] }, tags = o.tags || null, grounds = [], TRACKS = [];
    const seed = KRAND.child(o.seed == null ? 20261019 : o.seed, 'pinnacle-camps') >>> 0;
    const u = (...k) => KRAND.unit(KRAND.hash(seed, ...k));
    const box = (x, z, ry, w, d) => { const ux = Math.cos(ry), uz = -Math.sin(ry), vx = Math.sin(ry), vz = Math.cos(ry);
      return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(q => [x + ux * w / 2 * q[0] + vx * d / 2 * q[1], z + uz * w / 2 * q[0] + vz * d / 2 * q[1]]); };
    const sep = (A, B) => { for (const Q of [A, B]) for (let j = 0; j < 4; j++) { const a = Q[j], b = Q[(j + 1) % 4], n = [-(b[1] - a[1]), b[0] - a[0]];
      const pa = A.map(q => q[0] * n[0] + q[1] * n[1]), pb = B.map(q => q[0] * n[0] + q[1] * n[1]);
      if (Math.max(...pa) <= Math.min(...pb) + 0.01 || Math.max(...pb) <= Math.min(...pa) + 0.01) return true; } return false; };
    const inE = (E, q, k) => ((q[0] - E.x) / (E.rx * k)) ** 2 + ((q[1] - E.z) / (E.rz * k)) ** 2 <= 1;
    const facing = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);

    // pitch one ground: E the ellipse, ok(x, z) the ground's rule, lean ([x, z] or null: where the pens go), pens (on the
    // floor: {inside(pts) -> bool, R}, the hedged ground the pens may take, a pasture's corral or ring among them)
    const pitch = (tribe, ground, G, E, ok, lean, name, pens) => {
      const list = []; G.tents.concat(G.pens).forEach(e => { for (let i = 0; i < e.n; i++) list.push({ key: e.key, v: e.v }); });
      list.forEach(it => { const D = o.dims(it.key, it.v); it.D = D; it.area = D ? D.w * D.d : 0; });
      list.sort((a, b) => (RANK(a.key) - RANK(b.key)) || (b.area - a.area));
      const items = [], boxes = [];
      let chief = null;
      list.forEach((it, idx) => {
        if (!it.D) { LOG.short.push(tribe + ' ' + ground + ': no ' + it.key); return; }
        const pen = RANK(it.key) === 2, c0 = chief ? [chief.x, chief.z] : [E.x, E.z];
        // where to start looking: the middle for the chief and the council, toward `lean` for the pens, round the chief
        // for the tents
        const start = !chief || RANK(it.key) === 1 ? [E.x, E.z] : pen && lean ? [E.x + (lean[0] - E.x) * 0.55, E.z + (lean[1] - E.z) * 0.55] : c0;
        let done = null;
        const Rmax = pen && pens ? pens.R : Math.max(E.rx, E.rz), st = pen && pens ? 5 : 3;
        for (let r = 0; r <= Rmax && !done; r += st) {
          const n = r === 0 ? 1 : Math.max(8, Math.round(2 * Math.PI * r / (st + 1)));
          for (let k = 0; k < n && !done; k++) {
            const a = k / n * Math.PI * 2 + u(1, idx, r) * 0.6, x = start[0] + Math.cos(a) * r, z = start[1] + Math.sin(a) * r;
            const f = chief ? facing(x, z, chief.x, chief.z) : (lean ? facing(x, z, lean[0], lean[1]) + Math.PI : 0);
            for (const ry of [f, f + Math.PI / 2]) {
              const B = box(x, z, ry, it.D.w, it.D.d), Bg = box(x, z, ry, it.D.w + 2 * GAP, it.D.d + 2 * GAP);
              const pts = B.concat(B.map((q, j) => [(q[0] + B[(j + 1) % 4][0]) / 2, (q[1] + B[(j + 1) % 4][1]) / 2]), [[x, z]]);
              if (pen && pens ? !(pens.inside(pts) && pts.every(q => ok(q[0], q[1]))) : !pts.every(q => inE(E, q, 0.97) && ok(q[0], q[1]))) continue;
              if (boxes.some(Q => !sep(Bg, Q))) continue;
              const hs = B.map(q => o.h(q[0], q[1]));
              done = { key: it.key, v: it.v, x: +x.toFixed(2), z: +z.toFixed(2), y: +Math.max(...hs).toFixed(2), ry: +ry.toFixed(4), w: it.D.w, d: it.D.d, h: it.D.h,
                drop: +(Math.max(...hs) - Math.min(...hs)).toFixed(2), name: 'the ' + tribe + ' band\'s ' + it.key.replace(/^br_tent_/, '').replace(/_/g, ' '), tag: null };
              boxes.push(B); break;
            }
          }
        }
        if (!done) { LOG.short.push(tribe + ' ' + ground + ': ' + it.key + ' #' + it.v); return; }
        if (!chief && /chief/.test(it.key)) chief = done;
        items.push(done);
      });
      // the banner before the chief's pavilion: 4 m out from its front
      const ban = chief ? { x: +(chief.x + Math.sin(chief.ry) * (chief.d / 2 + 4)).toFixed(2), z: +(chief.z + Math.cos(chief.ry) * (chief.d / 2 + 4)).toFixed(2) } : { x: E.x, z: E.z };
      ban.y = +o.h(ban.x, ban.z).toFixed(2); ban.col = o.CAMP[tribe].banner;
      return { tribe, ground, name, ell: { x: E.x, z: E.z, rx: E.rx, rz: E.rz }, items, banner: ban, hedge: [], fence: [], track: null };
    };

    // ---------------------------------------------------------------- the top: nine grounds
    PR.TOP.camps.forEach(E => { const G = o.CAMP[E.tribe] && o.CAMP[E.tribe].grounds.upper; if (!G) { LOG.short.push(E.tribe + ': no upper ground in BR_CAMP'); return; }
      // the pens (the flyers' perch frames) toward the rim: the ground's middle pushed out from the mesa's middle
      const l = Math.hypot(E.x, E.z) || 1, lean = [E.x + E.x / l * 60, E.z + E.z / l * 60];
      grounds.push(pitch(E.tribe, 'upper', G, E, o.upperOk, lean, E.name)); });
    // ---------------------------------------------------------------- the floor: nine camps, their pastures, their hedges
    PR.CAMPS.forEach((E, i) => { const T = E.tribe, G = o.CAMP[T] && o.CAMP[T].grounds.lower; if (!G) { LOG.short.push(T + ': no lower ground in BR_CAMP'); return; }
      const P = PR.PASTURES[i], Hd = PR.HEDGES[i];
      const inPoly = (q, Pg) => { let c = false; for (let a = 0, b = Pg.length - 1; a < Pg.length; b = a++) { const A = Pg[a], B2 = Pg[b];
        if ((A[1] > q[1]) !== (B2[1] > q[1]) && q[0] < (B2[0] - A[0]) * (q[1] - A[1]) / (B2[1] - A[1]) + A[0]) c = !c; } return c; };
      const edgeD = q => { let d = 1e9; for (let a = 0, b = Hd.pts.length - 1; a < Hd.pts.length; b = a++) { const A = Hd.pts[a], B2 = Hd.pts[b], dx = B2[0] - A[0], dz = B2[1] - A[1],
        t = Math.max(0, Math.min(1, ((q[0] - A[0]) * dx + (q[1] - A[1]) * dz) / Math.max(1e-9, dx * dx + dz * dz))); d = Math.min(d, Math.hypot(q[0] - A[0] - dx * t, q[1] - A[1] - dz * t)); } return d; };
      const penArea = { R: Math.hypot(P.x - E.x, P.z - E.z) + Math.max(P.rx, P.rz),
        inside: pts => pts.every(q => inPoly(q, Hd.pts) && edgeD(q) > 6) && (pts.every(q => inE(P, q, 0.95)) || pts.every(q => !inE(P, q, 1.05))) };
      const g = pitch(T, 'lower', G, E, (x, z) => o.lowerOk(x, z) || PR.zoneAt(x, z).zone === 'pasture', [P.x, P.z], E.name, penArea);
      // THE HEDGE: the plan's hull resampled at equal steps (so every piece is one span), its gates toward the mesa (the
      // farms' gates) and away from it (the forest)
      const L = Hd.pts.concat([Hd.pts[0]]), S = [0]; for (let k = 1; k < L.length; k++) S.push(S[k - 1] + Math.hypot(L[k][0] - L[k - 1][0], L[k][1] - L[k - 1][1]));
      const tot = S[S.length - 1], n = Math.ceil(tot / 8), at = s => { let k = 1; while (k < L.length - 1 && S[k] < s) k++; const t = (s - S[k - 1]) / Math.max(1e-9, S[k] - S[k - 1]); return [L[k - 1][0] + (L[k][0] - L[k - 1][0]) * t, L[k - 1][1] + (L[k][1] - L[k - 1][1]) * t]; };
      const R = []; for (let k = 0; k < n; k++) R.push(at(tot * k / n));
      const near = q => { let b = 0, bd = 1e9; R.forEach((p, k) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; b = k; } }); return b; };
      const cx = (E.x + P.x) / 2, cz = (E.z + P.z) / 2, l = Math.hypot(cx, cz) || 1;
      const gIn = near([cx - cx / l * 400, cz - cz / l * 400]), gOut = near([cx + cx / l * 400, cz + cz / l * 400]), step = tot / n;
      g.hedge = o.RUN(R, { key: 'br_hedge_thorn', closed: true, seg: step + 0.01, gates: [gIn * step + step / 2, gOut * step + step / 2], gateLen: step, seed: KRAND.hash(seed, 7, i) })
        .map(p => Object.assign(p, { x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +o.h(p.x, p.z).toFixed(2), ry: +p.ry.toFixed(4), span: +p.span.toFixed(2) }));
      // THE PASTURE'S FENCE (where the band has a pasture): its ellipse, one gate toward the camp
      if (G.pasture) { const m = Math.max(24, Math.round(2 * Math.PI * Math.sqrt((P.rx * P.rx + P.rz * P.rz) / 2) / 8)), F = [];
        for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2; F.push([P.x + Math.cos(a) * P.rx, P.z + Math.sin(a) * P.rz]); }
        const fs = F.map((q, k) => Math.hypot(F[(k + 1) % m][0] - q[0], F[(k + 1) % m][1] - q[1])), fn = (q) => { let b = 0, bd = 1e9; F.forEach((p, k) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; b = k; } }); return b; };
        const gk = fn([E.x, E.z]); let sg = 0; for (let k = 0; k < gk; k++) sg += fs[k];
        g.fence = o.RUN(F, { key: 'br_fence_rail', closed: true, seg: Math.max(...fs) + 0.01, gates: [sg + fs[gk] / 2], gateLen: fs[gk], seed: KRAND.hash(seed, 8, i) })
          .map(p => Object.assign(p, { x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +o.h(p.x, p.z).toFixed(2), ry: +p.ry.toFixed(4), span: +p.span.toFixed(2) })); }
      // THE TRACK from the hedge's inner gate to a palisade gate: the nearest whose way is clear. The way comes in to the gate
      // along its outward normal (the gatehouse's front), from an approach point far enough out that the run to it crosses
      // neither the farms nor another band's hedge; a gate with no such way gives way to the next nearest
      const gi = R[gIn], line = (A, B) => { const L2 = Math.hypot(B[0] - A[0], B[1] - A[1]), k2 = Math.max(1, Math.ceil(L2 / 8)), out = [];
        for (let k = 0; k <= k2; k++) out.push([A[0] + (B[0] - A[0]) * k / k2, A[1] + (B[1] - A[1]) * k / k2]); return out; };
      const others = PR.HEDGES.filter((H, k) => k !== i), blocked = q => PR.inFarms(q[0], q[1]) || others.some(H => PR.inPoly(q[0], q[1], H.pts));
      let way = null, best = null;
      for (const Gt of o.gates.slice().sort((A, B) => Math.hypot(A.x - gi[0], A.z - gi[1]) - Math.hypot(B.x - gi[0], B.z - gi[1]))) {
        const nx = Math.sin(Gt.ry), nz = Math.cos(Gt.ry);
        for (let d = 20; d <= 300 && !way; d += 20) { const ap = [Gt.x + nx * d, Gt.z + nz * d], P1 = line(gi, ap), P2 = line(ap, [Gt.x, Gt.z]);
          // the last 4 m reach the gate on the palisade's line
          if (P1.some(blocked) || P2.slice(0, -1).some(q => Math.hypot(q[0] - Gt.x, q[1] - Gt.z) > 4 && blocked(q))) continue;
          way = P1.concat(P2.slice(1)); }
        if (way) { best = Gt; break; } }
      // boxed in (the Staghorn's, between two hedges and the farms): one bend, at a point on rings round the mesa, the
      // shortest clear way through it to any gate
      if (!way) { let bl = 1e9;
        for (const Gt of o.gates) { const nx = Math.sin(Gt.ry), nz = Math.cos(Gt.ry);
          for (let d = 20; d <= 200; d += 30) { const ap = [Gt.x + nx * d, Gt.z + nz * d], P2 = line(ap, [Gt.x, Gt.z]);
            if (P2.slice(0, -1).some(q => Math.hypot(q[0] - Gt.x, q[1] - Gt.z) > 4 && blocked(q))) continue;
            for (let rr = 900; rr <= 1700; rr += 100) for (let ag = 0; ag < 360; ag += 5) { const v = [Math.cos(ag * Math.PI / 180) * rr, Math.sin(ag * Math.PI / 180) * rr];
              const len = Math.hypot(v[0] - gi[0], v[1] - gi[1]) + Math.hypot(ap[0] - v[0], ap[1] - v[1]) + d; if (len >= bl) continue;
              const P0 = line(gi, v), P1 = line(v, ap); if (P0.some(blocked) || P1.some(blocked)) continue;
              bl = len; way = P0.concat(P1.slice(1), P2.slice(1)); best = Gt; } } } }
      if (!way) LOG.short.push(T + ': no clear track to a gate');
      if (way) { const pts = way.map(p => [+p[0].toFixed(2), +p[1].toFixed(2)]);
        g.track = { id: 'way-camp-' + T, name: 'the track from the ' + T + ' band\'s hedge to ' + best.name.replace(/ \(.*/, ''), pts, w: 5 }; TRACKS.push(g.track); }
      grounds.push(g); });
    // ---------------------------------------------------------------- core/tags: every record before anything draws it
    if (tags) grounds.forEach(g => {
      g.items.forEach(it => { const T = tags.add({ 'class': /tent_(dome|chief|council|shrine|shaman|smithy|hidemaker|trader|tackmaker|silk|net_house)/.test(it.key) ? 'building' : 'infrastructure',
        kind: /tent_(dome|chief|council|shrine|shaman|smithy|hidemaker|trader|tackmaker|silk|net_house)/.test(it.key) ? 'tent' : 'pen', key: it.key, at: [it.x, it.y, it.z], ry: it.ry, size: [it.w, it.d, it.h], note: it.name, src: 'pinnacle-rock' }); if (T) it.tag = T.id; });
      g.hedge.concat(g.fence).forEach(p => { const T = tags.add({ 'class': 'infrastructure', kind: p.key === 'br_hedge_thorn' ? 'hedge' : 'fence', key: p.key, at: [p.x, p.y, p.z], ry: p.ry, size: [p.span, 1, 2], note: 'the ' + g.tribe + ' band\'s ' + (p.key === 'br_hedge_thorn' ? 'thorn hedge' : 'pasture fence') + (p.v ? ' (a gate)' : ''), src: 'pinnacle-rock' }); if (T) p.tag = T.id; });
      { const T = tags.add({ 'class': 'prop', kind: 'banner', key: 'banner:' + g.tribe, at: [g.banner.x, g.banner.y, g.banner.z], ry: 0, size: [1.4, 0.2, 7], note: 'the ' + g.tribe + ' band\'s banner', src: 'pinnacle-rock' }); if (T) g.banner.tag = T.id; }
      if (g.track) { const m = g.track.pts[g.track.pts.length >> 1], T = tags.add({ 'class': 'infrastructure', kind: 'track', key: 'track', at: [m[0], o.h(m[0], m[1]), m[1]], ry: 0, size: [g.track.w, 0, 0], note: g.track.name, src: 'pinnacle-rock' }); if (T) g.track.tag = T.id; }
    });
    LOG.grounds = grounds.length + ' grounds (' + grounds.filter(g => g.ground === 'upper').length + ' on the top, ' + grounds.filter(g => g.ground === 'lower').length + ' on the floor), ' +
      grounds.reduce((s, g) => s + g.items.length, 0) + ' tents and pens, ' + grounds.reduce((s, g) => s + g.hedge.length, 0) + ' hedge pieces, ' + grounds.reduce((s, g) => s + g.fence.length, 0) + ' fence pieces';
    return { grounds, tracks: TRACKS, log: LOG };
  }
  return { plan, GAP, RANK };
})();
