/* ======================== Occupancy grid and walk search ========================
   One grid per room, at the room's floor. A cell is walkable when its centre is inside the
   room polygon, at least `agent` metres from every wall (except in a doorway's mouth), and
   not under a floor piece's footprint grown by `agent`. Ceiling and surface pieces do not
   block. The placer keeps every door connected to every usable piece on this grid; a life
   layer takes the same grid for its nav (API.md "Reading the grid", 47-life.js).

     const g = IX.makeGrid(room, { cell: 0.1, agent: 0.2, nbr: 8, cutCorners: false });
     g.nx, g.nz, g.cell, g.nbr               cell (i, j) has centre (x0 + (i + .5) cell, z0 + (j + .5) cell)
     g.k(i, j) / g.ij(k) / g.centre(k) / g.at(x, z)  index helpers (at() is -1 outside the grid)
     g.walkable(k)                            base free and no footprint on it
     g.stamp(rect, +1 | -1)                   block / unblock a footprint (rect: IX.geom.rect)
     g.cellsIn(rect)                          cells whose centre lies in rect
     g.doorCells(door)                        the walkable cells just inside a door (walk starts)
     g.bfs(starts) -> { dist: Int32Array (-1 = unreached, in moves), prev: Int32Array }
     g.path(bfs, k) -> [[x, z], ...]          start -> cell k, along the BFS tree
     g.reaches(starts, groups) -> bool        every group (an array of cells) has a cell reached
                                              (early exit, no allocation: what the placer calls)
     g.route(starts, goals) -> [k, ...]|null  cheapest path (octile cost) from any start to any goal
     g.smooth([[x, z], ...]) -> [[x, z], ...] drops waypoints a straight walk can skip
     g.toJSON()                               { cell, x0, z0, nx, nz, nbr, rows: ['0101..', ...] } 1 = blocked

   Moves: nbr 8 (default) moves diagonally only when both cells it passes between are walkable
   (no corner cutting), so what is CONNECTED is exactly what 4-neighbour moves connect: the
   reach checks run 4-neighbour and nbr only shapes the paths. cutCorners: true lets a diagonal
   squeeze past a corner (then reach runs 8-neighbour too). { cell: 0.2, nbr: 4 } is the old grid.
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom;
  IX.GRID_DEFAULTS = { cell: 0.1, agent: 0.2, nbr: 8, cutCorners: false };

  /* The area a door keeps free, as CONVEX polygons (each [[x, z], ...]):
       swing 'in'           the leaf's true quarter disc (hinge, radius = leaf width) plus a
                            threshold band 0.45 m deep across the opening
       swing 'out' | 'none' an approach band 0.7 m deep across the opening (w + 0.2 wide)       */
  IX.doorZones = function (room, d) {
    const left = [-d.n[1], d.n[0]], w = d.w;
    const band = function (depth, wide) {
      return G.corners(G.rect(d.at[0] + d.n[0] * depth / 2, d.at[1] + d.n[1] * depth / 2, d.ry, wide, depth));
    };
    if (d.swing !== 'in') return [band(0.7, w + 0.2)];
    const hs = d.hinge === 'right' ? -1 : 1;
    const h = [d.at[0] + left[0] * hs * w / 2, d.at[1] + left[1] * hs * w / 2];
    return [G.quarterDisc(h, w + 0.05, [-left[0] * hs, -left[1] * hs], [d.n[0], d.n[1]]), band(0.45, w + 0.1)];
  };
  IX.windowZone = function (room, w) {         /* kept clear of anything taller than the sill */
    return G.rect(w.at[0] + w.n[0] * 0.175, w.at[1] + w.n[1] * 0.175, room.walls[w.wall].ry, w.w + 0.1, 0.35);
  };

  IX.makeGrid = function (room, opts) {
    opts = opts || {};
    const D = IX.GRID_DEFAULTS;
    const cell = opts.cell || D.cell, agent = opts.agent == null ? D.agent : opts.agent;
    const nbr = (opts.nbr || D.nbr) === 4 ? 4 : 8, cutCorners = opts.cutCorners == null ? D.cutCorners : !!opts.cutCorners;
    const bb = room.bbox, x0 = bb[0] - cell, z0 = bb[1] - cell;
    const nx = Math.ceil((bb[2] - bb[0]) / cell) + 2, nz = Math.ceil((bb[3] - bb[1]) / cell) + 2, N = nx * nz;
    const base = new Uint8Array(N), occ = new Uint16Array(N);
    const mouths = room.doors.map(function (d) {
      return G.localRect(d.at[0], d.at[1], d.ry, -(d.w / 2 - 0.08), d.w / 2 - 0.08, -0.3, agent + cell);
    });
    const g = { cell: cell, agent: agent, nbr: nbr, cutCorners: cutCorners, x0: x0, z0: z0, nx: nx, nz: nz, base: base, occ: occ, room: room.id };
    g.k = function (i, j) { return j * nx + i; };
    g.ij = function (k) { return [k % nx, Math.floor(k / nx)]; };
    g.centre = function (k) { return [x0 + (k % nx + 0.5) * cell, z0 + (Math.floor(k / nx) + 0.5) * cell]; };
    g.at = function (x, z) {
      const i = Math.floor((x - x0) / cell), j = Math.floor((z - z0) / cell);
      return (i < 0 || j < 0 || i >= nx || j >= nz) ? -1 : j * nx + i;
    };
    for (let k = 0; k < N; k++) {
      const c = g.centre(k);
      let blocked = !G.inside(room.poly, c[0], c[1]) || G.edgeDist(room.poly, c[0], c[1]) < agent;
      if (blocked) for (const m of mouths) if (G.containsPt(m, c[0], c[1])) { blocked = false; break; }
      base[k] = blocked ? 1 : 0;
    }
    function free(k) { return base[k] === 0 && occ[k] === 0; }
    g.walkable = function (k) { return k >= 0 && k < N && free(k); };
    g.cellsIn = function (r) {
      const cs = G.corners(r), b = G.bbox(cs), out = [];
      const i0 = Math.max(0, Math.floor((b[0] - x0) / cell)), i1 = Math.min(nx - 1, Math.floor((b[2] - x0) / cell));
      const j0 = Math.max(0, Math.floor((b[1] - z0) / cell)), j1 = Math.min(nz - 1, Math.floor((b[3] - z0) / cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const k = j * nx + i, c = g.centre(k);
        if (G.containsPt(r, c[0], c[1])) out.push(k);
      }
      return out;
    };
    g.stamp = function (r, s) { for (const k of g.cellsIn(G.grow(r, agent))) occ[k] += s; };
    g.doorCells = function (d) {
      const r = G.localRect(d.at[0], d.at[1], d.ry, -(d.w / 2 - 0.08), d.w / 2 - 0.08, 0, agent + 2 * cell);
      return g.cellsIn(r).filter(g.walkable);
    };
    /* the neighbours of k that a walker may step to, written into out[]; returns the count.
       diag[] (if given) gets 1 for a diagonal move. */
    function neighbours(k, out, diag, eight) {
      const i = k % nx, j = (k - i) / nx;
      let n = 0;
      const W = i > 0 && free(k - 1), E = i < nx - 1 && free(k + 1), S = j > 0 && free(k - nx), Nn = j < nz - 1 && free(k + nx);
      if (W) { out[n] = k - 1; if (diag) diag[n] = 0; n++; }
      if (E) { out[n] = k + 1; if (diag) diag[n] = 0; n++; }
      if (S) { out[n] = k - nx; if (diag) diag[n] = 0; n++; }
      if (Nn) { out[n] = k + nx; if (diag) diag[n] = 0; n++; }
      if (eight) {
        const cand = [[i > 0 && j > 0, k - nx - 1, W, S], [i < nx - 1 && j > 0, k - nx + 1, E, S],
          [i > 0 && j < nz - 1, k + nx - 1, W, Nn], [i < nx - 1 && j < nz - 1, k + nx + 1, E, Nn]];
        for (const c of cand) {
          if (!c[0] || !free(c[1])) continue;
          if (!cutCorners && !(c[2] && c[3])) continue;
          if (cutCorners && !(c[2] || c[3])) continue;     /* never through two blocked cells */
          out[n] = c[1]; if (diag) diag[n] = 1; n++;
        }
      }
      return n;
    }
    g.neighbours = function (k) { const o = [0, 0, 0, 0, 0, 0, 0, 0], n = neighbours(k, o, null, nbr === 8); return o.slice(0, n); };
    /* reach-only moves: with corner cutting off, 8-neighbour connectivity IS 4-neighbour connectivity */
    const reachEight = nbr === 8 && cutCorners;
    g.bfs = function (starts) {
      const dist = new Int32Array(N).fill(-1), prev = new Int32Array(N).fill(-1), q = new Int32Array(N), nb = new Int32Array(8);
      let h = 0, t = 0;
      for (const s of starts) if (g.walkable(s) && dist[s] < 0) { dist[s] = 0; q[t++] = s; }
      while (h < t) {
        const k = q[h++], n = neighbours(k, nb, null, nbr === 8);
        for (let a = 0; a < n; a++) { const m = nb[a]; if (dist[m] < 0) { dist[m] = dist[k] + 1; prev[m] = k; q[t++] = m; } }
      }
      return { dist: dist, prev: prev };
    };
    g.path = function (B, k) {
      if (k < 0 || B.dist[k] < 0) return null;
      const out = [];
      for (let c = k; c >= 0; c = B.prev[c]) out.push(g.centre(c));
      return out.reverse();
    };
    /* scratch for reaches(): a generation stamp per cell, so nothing is cleared or allocated */
    let seen = null, gen = 0, rq = null, rnb = null;
    g.reaches = function (starts, groups) {
      if (!seen) { seen = new Uint32Array(N); rq = new Int32Array(N); rnb = new Int32Array(8); }
      gen++;
      if (gen === 0xffffffff) { seen.fill(0); gen = 1; }
      /* an empty group can never be reached: report it unreached */
      for (const cells of groups) if (!cells.length) return false;
      let left = groups.length;
      const tag = new Map();
      groups.forEach(function (cells, gi) { for (const k of cells) { let a = tag.get(k); if (!a) tag.set(k, a = []); a.push(gi); } });
      const done = new Uint8Array(groups.length);
      if (!left) return true;
      let h = 0, t = 0;
      function visit(k) {
        seen[k] = gen; rq[t++] = k;
        const a = tag.get(k);
        if (a) for (const gi of a) if (!done[gi]) { done[gi] = 1; left--; }
      }
      for (const s of starts) if (g.walkable(s) && seen[s] !== gen) { visit(s); if (!left) return true; }
      while (h < t) {
        const k = rq[h++], n = neighbours(k, rnb, null, reachEight);
        for (let a = 0; a < n; a++) { const m = rnb[a]; if (seen[m] !== gen) { visit(m); if (!left) return true; } }
      }
      return left === 0;
    };
    /* Dijkstra, octile costs (10 straight, 14 diagonal), stops at the first goal reached */
    g.route = function (starts, goals) {
      const goal = new Uint8Array(N);
      for (const k of goals) if (k >= 0 && k < N) goal[k] = 1;
      const dist = new Int32Array(N).fill(0x7fffffff), prev = new Int32Array(N).fill(-1);
      const heap = [], nb = new Int32Array(8), dg = new Uint8Array(8);
      function push(k, d) {
        heap.push([d, k]);
        let i = heap.length - 1;
        while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] < d || (heap[p][0] === d && heap[p][1] <= k)) break; heap[i] = heap[p]; i = p; }
        heap[i] = [d, k];
      }
      function pop() {
        const top = heap[0], last = heap.pop();
        if (heap.length) {
          let i = 0;
          for (;;) {
            const l = 2 * i + 1, r = l + 1;
            let m = i, mv = last;
            if (l < heap.length && (heap[l][0] < mv[0] || (heap[l][0] === mv[0] && heap[l][1] < mv[1]))) { m = l; mv = heap[l]; }
            if (r < heap.length && (heap[r][0] < mv[0] || (heap[r][0] === mv[0] && heap[r][1] < mv[1]))) { m = r; mv = heap[r]; }
            if (m === i) break;
            heap[i] = heap[m]; i = m;
          }
          heap[i] = last;
        }
        return top;
      }
      for (const s of starts) if (g.walkable(s) && dist[s] > 0) { dist[s] = 0; push(s, 0); }
      while (heap.length) {
        const e = pop(), k = e[1];
        if (e[0] > dist[k]) continue;
        if (goal[k]) { const out = []; for (let c = k; c >= 0; c = prev[c]) out.push(c); return out.reverse(); }
        const n = neighbours(k, nb, dg, nbr === 8);
        for (let a = 0; a < n; a++) {
          const m = nb[a], d = dist[k] + (dg[a] ? 14 : 10);
          if (d < dist[m]) { dist[m] = d; prev[m] = k; push(m, d); }
        }
      }
      return null;
    };
    /* is the straight walk a -> b on walkable cells? (sampled at a third of a cell) */
    g.clearLine = function (a, b) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / (cell / 3)));
      for (let s = 0; s <= n; s++) {
        const t = s / n, k = g.at(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        if (!g.walkable(k)) return false;
      }
      return true;
    };
    g.smooth = function (pts) {
      if (!pts || pts.length < 3) return pts;
      const out = [pts[0]];
      let i = 0;
      while (i < pts.length - 1) {
        let j = pts.length - 1;
        while (j > i + 1 && !g.clearLine(pts[i], pts[j])) j--;
        out.push(pts[j]); i = j;
      }
      return out;
    };
    g.toJSON = function () {
      const rows = [];
      for (let j = 0; j < nz; j++) { let s = ''; for (let i = 0; i < nx; i++) s += free(j * nx + i) ? '0' : '1'; rows.push(s); }
      return { room: room.id, cell: cell, agent: agent, nbr: nbr, cutCorners: cutCorners, x0: IX.round(x0), z0: IX.round(z0), nx: nx, nz: nz, rows: rows };
    };
    return g;
  };
})(KratorInteriors);
