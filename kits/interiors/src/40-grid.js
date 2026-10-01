/* ======================== Occupancy grid and walk search ========================
   One grid per room, at the room's floor. A cell is walkable when its centre is inside the
   room polygon, at least `agent` metres from every wall (except in a doorway's mouth), and
   not under a floor piece's footprint grown by `agent`. Ceiling and surface pieces do not
   block. The placer keeps every door connected to every usable piece on this grid; a life
   layer can take the same grid for its nav (API.md "Reading the grid").

     const g = IX.makeGrid(room, { cell: 0.2, agent: 0.2 });
     g.nx, g.nz, g.cell, g.x0, g.z0          cell (i, j) has centre (x0 + (i + .5) cell, z0 + (j + .5) cell)
     g.k(i, j) / g.ij(k) / g.centre(k) / g.at(x, z)  index helpers (at() is -1 outside the grid)
     g.walkable(k)                            base free and no footprint on it
     g.stamp(rect, +1 | -1)                   block / unblock a footprint (rect: IX.geom.rect)
     g.cellsIn(rect)                          cells whose centre lies in rect
     g.doorCells(door)                        the walkable cells just inside a door (BFS starts)
     g.bfs(starts) -> { dist: Int32Array (-1 = unreached), prev: Int32Array }
     g.path(bfs, k) -> [[x, z], ...]          door -> cell k, along the BFS tree
     g.toJSON()                               { cell, x0, z0, nx, nz, rows: ['0101..', ...] } 1 = blocked
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom;

  IX.doorZone = function (room, d) {           /* the swing (or approach) a door keeps free */
    const depth = d.swing === 'in' ? Math.max(d.w, 0.9) + 0.1 : 0.7;
    return G.rect(d.at[0] + d.n[0] * depth / 2, d.at[1] + d.n[1] * depth / 2, d.ry, d.w + 0.2, depth);
  };
  IX.windowZone = function (room, w) {         /* kept clear of anything taller than the sill */
    return G.rect(w.at[0] + w.n[0] * 0.175, w.at[1] + w.n[1] * 0.175, room.walls[w.wall].ry, w.w + 0.1, 0.35);
  };

  IX.makeGrid = function (room, opts) {
    opts = opts || {};
    const cell = opts.cell || 0.2, agent = opts.agent == null ? 0.2 : opts.agent;
    const bb = room.bbox, x0 = bb[0] - cell, z0 = bb[1] - cell;
    const nx = Math.ceil((bb[2] - bb[0]) / cell) + 2, nz = Math.ceil((bb[3] - bb[1]) / cell) + 2, N = nx * nz;
    const base = new Uint8Array(N), occ = new Uint16Array(N);
    const mouths = room.doors.map(function (d) {
      return G.localRect(d.at[0], d.at[1], d.ry, -(d.w / 2 - 0.08), d.w / 2 - 0.08, -0.3, agent + cell);
    });
    const g = { cell: cell, agent: agent, x0: x0, z0: z0, nx: nx, nz: nz, base: base, occ: occ, room: room.id };
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
    g.walkable = function (k) { return k >= 0 && base[k] === 0 && occ[k] === 0; };
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
    g.bfs = function (starts) {
      const dist = new Int32Array(N).fill(-1), prev = new Int32Array(N).fill(-1), q = new Int32Array(N);
      let h = 0, t = 0;
      for (const s of starts) if (g.walkable(s) && dist[s] < 0) { dist[s] = 0; q[t++] = s; }
      while (h < t) {
        const k = q[h++], i = k % nx, j = (k - i) / nx;
        const nb = [i > 0 ? k - 1 : -1, i < nx - 1 ? k + 1 : -1, j > 0 ? k - nx : -1, j < nz - 1 ? k + nx : -1];
        for (const m of nb) if (m >= 0 && dist[m] < 0 && base[m] === 0 && occ[m] === 0) { dist[m] = dist[k] + 1; prev[m] = k; q[t++] = m; }
      }
      return { dist: dist, prev: prev };
    };
    g.path = function (B, k) {
      if (k < 0 || B.dist[k] < 0) return null;
      const out = [];
      for (let c = k; c >= 0; c = B.prev[c]) out.push(g.centre(c));
      return out.reverse();
    };
    g.toJSON = function () {
      const rows = [];
      for (let j = 0; j < nz; j++) { let s = ''; for (let i = 0; i < nx; i++) s += g.walkable(j * nx + i) ? '0' : '1'; rows.push(s); }
      return { room: room.id, cell: cell, agent: agent, x0: IX.round(x0), z0: IX.round(z0), nx: nx, nz: nz, rows: rows };
    };
    return g;
  };
})(KratorInteriors);
