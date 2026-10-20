/* ======================== Walk records: a placed set item's floors, walls and stairs into core/walk ========================
   IX.walk.register(inst, W, o) writes what IX.sets.instantiate() planned into a KWALK registry (core/walk), so the
   walker, the minimap and the Godot export read the floors the building was built with. Engine-neutral: W is anything
   with floor / strip / poly / block (KWALK, or KWALK.create()). Lifted from kits/zeijani (37-zj-walk.js zwItem).
     - each planned storey's floor (its polygon drawn in by the walker's radius, less its stairwells), at its y
     - each wall as small blocks, gapped at its door openings (windows stay shut)
     - each stair or ladder as a strip from its foot to its top
     - each explicit room's floor and walls, gapped at its doors
     - a RAISED base (a plinth, a deck on piles: the body's y above the ground) gets an entry flight from the ground
       outside every street door up to its sill, so the walker can get in; a rise within `step` needs none
   o: { tag, doorBlocks (false: fill every door opening with blocks, a door that is SHUT, and hand them to onBlock; KWALK.setBlock(recs, false) opens it),
        onBlock (fn(recs, { door: the opening's id (or true), wall, building, room, kind: 'door' })), ground (the ground y outside; default inst.baseY), inset (.3), blockStep (.3: a smaller block leaves a doorway its full width), step (.5: the rise a walker
        steps unaided; core/walk's floorBelow takes .6), skipRoom (fn(R) -> true to leave a room to someone else,
        Zeijani's carved rooms), flightRise (run per metre of rise, 1.4),
        maxRise (3.5: above it the base is a tower, a cliff ledge or a crown, not a plinth or a deck; no flight is
        drawn and the body is listed in `elevated` for the host to route to) }
   -> { floors, blocks, strips, entries, elevated: [body id] }
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, WK = IX.walk = {};
  function area(P) { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
  function inset(P, d) { return G.offset(P, -d); }
  /* a half-plane clip: the part of P on the side of edge (a, n) that n points to */
  function clip(P, a, n) {
    const out = [], s = p => (p[0] - a[0]) * n[0] + (p[1] - a[1]) * n[1];
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], sp = s(p), sq = s(q);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  }
  /* a floor outline less its (convex) holes: each hole taken away edge by edge, so it holds at any turn */
  WK.minusHoles = function (poly, holes) {
    let parts = [poly];
    for (const H of holes) {
      const cx = H.reduce((s, p) => s + p[0], 0) / H.length, cz = H.reduce((s, p) => s + p[1], 0) / H.length, next = [];
      for (const P of parts) {
        let rest = P;
        for (let i = 0; i < H.length && rest.length >= 3; i++) {
          const a = H[i], b = H[(i + 1) % H.length]; let n = [b[1] - a[1], a[0] - b[0]];
          if ((cx - a[0]) * n[0] + (cz - a[1]) * n[1] > 0) n = [-n[0], -n[1]];
          next.push(clip(rest, a, n)); rest = clip(rest, a, [-n[0], -n[1]]);
        }
      }
      parts = next.filter(P => P.length >= 3 && Math.abs(area(P)) > 0.05);
    }
    return parts;
  };
  function wall(W, a, b, y0, y1, t, gaps, tag, st) {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 1e-3) return 0;
    const n = Math.max(1, Math.ceil(L / st)), h = Math.max(t, st) / 2; let k = 0;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = a[0] + dx * u, z = a[1] + dz * u;
      if (gaps.some(g => Math.hypot(x - g[0], z - g[1]) < g[2])) continue;
      W.block([x - h, x + h, z - h, z + h, y0, y1], tag); k++;
    }
    return k;
  }
  /* the blocks that fill a doorway: centre (cx,cz), width w along the unit vector u, from y0 to y1, as thick as the wall (a door that is shut) */
  function doorFill(W, cx, cz, ux, uz, w, y0, y1, t, tag, st) {
    const n = Math.max(1, Math.ceil(w / st)), h = Math.max(t, st) / 2, out = [];
    for (let i = 0; i < n; i++) { const f = ((i + 0.5) / n - 0.5) * w, x = cx + ux * f, z = cz + uz * f; out.push(W.block([x - h, x + h, z - h, z + h, y0, y1], tag)); }
    return out;
  }
  /* the unit vector from a polygon's centroid out through the point `at`'s nearest edge: which way is outside a door */
  function outward(poly, at) {
    let best = null, bd = 1e9;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((at[0] - a[0]) * dx + (at[1] - a[1]) * dz) / L2)), px = a[0] + dx * t, pz = a[1] + dz * t, d = Math.hypot(at[0] - px, at[1] - pz);
      if (d < bd) { bd = d; best = [dz, -dx]; }
    }
    const L = Math.hypot(best[0], best[1]) || 1, s = area(poly) > 0 ? 1 : -1;     /* the right-hand normal points out of a counter-clockwise outline */
    const n = [best[0] / L * s, best[1] / L * s];
    /* a door in a recess or a corner: trust the outline only when a step out really is outside it */
    return inPoly(poly, at[0] + n[0] * 0.4, at[1] + n[1] * 0.4) && !inPoly(poly, at[0] - n[0] * 0.4, at[1] - n[1] * 0.4) ? [-n[0], -n[1]] : n;
  }
  function inPoly(P, x, z) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  WK.outward = outward;

  WK.register = function (inst, W, o) {
    o = o || {};
    const out = { floors: 0, blocks: 0, strips: 0, entries: 0, elevated: [] };
    if (!inst || !W) return out;
    const tag = o.tag || 'built:' + inst.id, ins = o.inset == null ? 0.3 : o.inset, st = o.blockStep == null ? 0.3 : o.blockStep,
      stepOK = o.step == null ? 0.5 : o.step, run = o.flightRise == null ? 1.4 : o.flightRise, maxRise = o.maxRise == null ? 3.5 : o.maxRise,
      ground = o.ground != null ? o.ground : (inst.baseY || 0);
    /* a flight from the ground outside a door at `at` up to the floor at y (only when the rise is more than a step) */
    const pending = [];
    function entry(poly, at, w, y, name, others) {
      const rise = y - ground; if (rise <= stepOK) return;
      if (rise > maxRise) { if (out.elevated.indexOf(name) < 0) out.elevated.push(name); return; }
      const n = outward(poly, at), len = Math.max(0.9, rise * run);
      if (others && others.length) for (let t = 0.2; t <= len; t += 0.25) for (const sd of [-0.5, 0, 0.5]) {
        const px = at[0] + n[0] * t - n[1] * sd * (w || 1) / 2, pz = at[1] + n[1] * t + n[0] * sd * (w || 1) / 2;
        if (others.some(P => inPoly(P, px, pz))) { if (out.elevated.indexOf(name) < 0) out.elevated.push(name); return; }
      }
      pending.push({ a: [at[0] + n[0] * len, at[1] + n[1] * len, ground], b: [at[0] - n[0] * (ins + 0.15), at[1] - n[1] * (ins + 0.15), y],
        w: Math.max(0.9, (w || 1) - 0.1), name: name + '.entry', body: name, tag });
    }
    for (const R of inst.rooms) {
      if (R.setBody && inst.buildings.length && !R.explicit) continue;         /* a planned room: its building's floor covers it */
      if (o.skipRoom && o.skipRoom(R)) continue;
      W.poly({ pts: inset(R.poly, ins).map(p => [p[0], p[1], R.y]), name: R.id, tag }); out.floors++;
      const item = inst.item || {}, src = (item.rooms || []).find(r => (r.id || '') === R.setBody) || {}, t = src.wall || item.wall || 0.22,
        ring = inset(R.poly, -t / 2), gaps = (R.doors || []).map(d => [d.at[0], d.at[1], d.w / 2 + 0.15]);
      for (let i = 0; i < ring.length; i++) out.blocks += wall(W, ring[i], ring[(i + 1) % ring.length], R.y, R.y + R.h, t, gaps, tag, st);
      for (const d of R.doors || []) if (d.to === 'street') entry(R.poly, d.at, d.w, R.y, R.id);
      if (o.doorBlocks) for (const d of R.doors || []) {                         /* an explicit room's door: along the wall it stands in */
        let best = null, bd = 1e9;
        for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length], ex = b[0] - a[0], ez = b[1] - a[1], L2 = ex * ex + ez * ez || 1,
          tt = Math.max(0, Math.min(1, ((d.at[0] - a[0]) * ex + (d.at[1] - a[1]) * ez) / L2)), dd = Math.hypot(d.at[0] - (a[0] + ex * tt), d.at[1] - (a[1] + ez * tt)); if (dd < bd) { bd = dd; best = [ex, ez]; } }
        if (!best) continue; const bl = Math.hypot(best[0], best[1]) || 1;
        const recs = doorFill(W, d.at[0], d.at[1], best[0] / bl, best[1] / bl, d.w, R.y, R.y + Math.min(R.h, d.h || 2.1), t, tag, st);
        out.blocks += recs.length; out.doors = (out.doors || 0) + 1;
        if (o.onBlock) o.onBlock(recs, { door: d.id || true, wall: null, building: inst.id, room: R.id, kind: 'door' });
      }
    }
    for (const B of inst.buildings) {
      for (const F of B.floors || []) {
        const parts = WK.minusHoles(inset(F.poly, ins), F.holes || []);
        parts.forEach((pts, i) => { W.poly({ pts: pts.map(p => [p[0], p[1], F.y]), name: B.id + '.floor.' + F.level + (parts.length > 1 ? '.' + i : ''), tag }); out.floors++; });
      }
      for (const Wl of B.walls || []) {
        const dx = Wl.b[0] - Wl.a[0], dz = Wl.b[1] - Wl.a[1], L = Math.hypot(dx, dz) || 1,
          gaps = (Wl.openings || []).filter(q => q.door).map(q => [Wl.a[0] + dx * (q.u / L), Wl.a[1] + dz * (q.u / L), q.w / 2 + 0.1]);
        out.blocks += wall(W, Wl.a, Wl.b, Wl.y, Wl.y + (Wl.h || 2.6), Wl.thick || 0.22, gaps, tag, st);
        if (o.doorBlocks) for (const q of Wl.openings || []) if (q.door) {
          const recs = doorFill(W, Wl.a[0] + dx * (q.u / L), Wl.a[1] + dz * (q.u / L), dx / L, dz / L, q.w, Wl.y + (q.y0 || 0), Wl.y + (q.y1 || 2.1), Wl.thick || 0.22, tag, st);
          out.blocks += recs.length; out.doors = (out.doors || 0) + 1;
          if (o.onBlock) o.onBlock(recs, { door: q.door, wall: Wl.id, building: B.id, room: null, kind: 'door' });
        }
      }
      const G0 = B.graph || { nodes: [] };
      for (const S of B.stairs || []) {
        const f = G0.nodes.find(n => n.tag === 'stairfoot' && n.ref === S.id), tp = G0.nodes.find(n => n.tag === 'stairtop' && n.ref === S.id);
        if (f && tp) { W.strip({ a: [f.x, f.z, f.y], b: [tp.x, tp.z, tp.y], w: Math.max(0.6, S.w - 0.3), name: S.id, tag }); out.strips++; }
      }
      const f0 = (B.floors || []).find(F => F.level === 0), outline = B.poly || (f0 && f0.poly);
      /* a flight that would run into another body of the same item (a tower beside a hall, a block under a block; their walls grown by 0.45 m) is not drawn: that body is entered from its neighbour */
      if (outline && f0) for (const d of B.doors || []) if (d.kind === 'street') entry(outline, d.at, d.w, f0.y, B.id, inst.buildings.filter(O => O !== B).map(O => (O.floors || []).find(F => F.level === 0)).filter(Boolean).map(F => G.offset(F.poly, 0.45)));
    }
    /* a flight is kept only if a walker can climb it once every wall is in: walked in 0.1 m steps up to the doorway, nothing solid in the way */
    for (const f of pending) {
      let clear = true;
      if (W.blocked && W.floorBelow) {
        const L = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]);
        for (let t = 0; t <= L - 0.3 && clear; t += 0.1) {
          const u = t / L, x = f.a[0] + (f.b[0] - f.a[0]) * u, z = f.a[1] + (f.b[1] - f.a[1]) * u, y = f.a[2] + (f.b[2] - f.a[2]) * u;
          if (W.blocked(x, y, z, 0.3, 1.7)) clear = false;
        }
      }
      if (!clear) { if (out.elevated.indexOf(f.body) < 0) out.elevated.push(f.body); continue; }
      W.strip({ a: f.a, b: f.b, w: f.w, name: f.name, tag: f.tag }); out.strips++; out.entries++;
    }
    return out;
  };
})(KratorInteriors);
