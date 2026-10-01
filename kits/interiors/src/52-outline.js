/* ======================== View: room-outline debug view (THREE) ========================
   SPEC "What to build first" 1. IX.view.outline(room, plan?, { grid, paths }) -> THREE.Group,
   drawn over everything (no depth test) just above the floor:
     yellow   the room polygon (the inner face of its walls)
     green    each door's opening, its swing arc and the zone the placer keeps free (a
              quarter disc and a threshold band; an outward door: a band 0.7 m deep)
     violet   fixtures: a stair's flight, the well it rises through
     blue     each window's opening
     orange   footprints of the pieces the room kind REQUIRES; white: optional pieces
     cyan     every piece's declared clearance zone (filled)
   With plan and { grid: true }: the walkable cells (green dots: reached from a door; red:
   walkable but cut off) and, with { paths: true }, the walk from door 0 to every usable piece.
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, V = IX.view = IX.view || {};
  function lineMat(c, op) { return new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op || 1, depthTest: false }); }
  function loop(pts, y, mat) {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map(function (p) { return new THREE.Vector3(p[0], y, p[1]); }));
    const l = new THREE.LineLoop(g, mat); l.renderOrder = 10; return l;
  }
  function line(pts, y, mat) {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map(function (p) { return new THREE.Vector3(p[0], y, p[1]); }));
    const l = new THREE.Line(g, mat); l.renderOrder = 10; return l;
  }
  function fill(r, y, mat) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r.hw * 2, r.hd * 2), mat);
    m.rotation.order = 'YXZ'; m.rotation.y = r.ry; m.rotation.x = -Math.PI / 2;
    m.position.set(r.x, y, r.z); m.renderOrder = 9; return m;
  }
  function fillPoly(P, y, mat) {                 /* a convex polygon, as a triangle fan */
    const pos = [];
    for (let i = 1; i + 1 < P.length; i++) pos.push(P[0][0], y, P[0][1], P[i][0], y, P[i][1], P[i + 1][0], y, P[i + 1][1]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 9; return m;
  }
  V.outline = function (room, plan, opt) {
    opt = opt || {};
    const g = new THREE.Group(), y = room.y + 0.04;
    g.name = 'outline:' + room.id;
    const M = {
      poly: lineMat(0xffd84a), door: lineMat(0x5cff7a), win: lineMat(0x6ab8ff), req: lineMat(0xff9a3a), opt: lineMat(0xffffff, 0.9),
      path: lineMat(0xff5ad8, 0.85), fix: lineMat(0xb07aff),
      clear: new THREE.MeshBasicMaterial({ color: 0x46d8e8, transparent: true, opacity: 0.18, depthTest: false, depthWrite: false, side: THREE.DoubleSide }),
      dz: new THREE.MeshBasicMaterial({ color: 0x5cff7a, transparent: true, opacity: 0.14, depthTest: false, depthWrite: false, side: THREE.DoubleSide })
    };
    g.add(loop(room.poly, y, M.poly));
    room.doors.forEach(function (d) {
      const t = room.walls[d.wall].t;
      g.add(line([[d.at[0] - t[0] * d.w / 2, d.at[1] - t[1] * d.w / 2], [d.at[0] + t[0] * d.w / 2, d.at[1] + t[1] * d.w / 2]], y, M.door));
      if (d.swing !== 'none') {
        const left = [-d.n[1], d.n[0]], hs = d.hinge === 'right' ? -1 : 1, dir = d.swing === 'out' ? -1 : 1;
        const hx = d.at[0] + left[0] * hs * d.w / 2, hz = d.at[1] + left[1] * hs * d.w / 2, arc = [[hx, hz]];
        for (let i = 0; i <= 12; i++) {
          const a = i / 12 * Math.PI / 2, cx = -left[0] * hs, cz = -left[1] * hs;
          arc.push([hx + (cx * Math.cos(a) + d.n[0] * dir * Math.sin(a)) * d.w, hz + (cz * Math.cos(a) + d.n[1] * dir * Math.sin(a)) * d.w]);
        }
        arc.push([hx, hz]);
        g.add(line(arc, y, M.door));
      }
      for (const P of IX.doorZones(room, d)) g.add(fillPoly(P, y - 0.005, M.dz));
    });
    (room.fixtures || []).forEach(function (f) {   /* a stair's flight or well: violet, its landing filled */
      g.add(loop(G.corners(G.rect(f.x, f.z, f.ry, f.w, f.d)), y + 0.01, M.fix));
      const c = f.clearance || {};
      if (c.front > 0) g.add(fill(G.localRect(f.x, f.z, f.ry, -f.w / 2, f.w / 2, f.d / 2, f.d / 2 + c.front), y - 0.01, M.clear));
    });
    room.windows.forEach(function (w) {
      const t = room.walls[w.wall].t;
      g.add(line([[w.at[0] - t[0] * w.w / 2, w.at[1] - t[1] * w.w / 2], [w.at[0] + t[0] * w.w / 2, w.at[1] + t[1] * w.w / 2]], y + 0.01, M.win));
    });
    if (plan) {
      plan.placements.forEach(function (p) {
        const yy = p.anchor === 'ceiling' ? y + 0.02 : p.anchor === 'surface' ? p.y + 0.02 : y + 0.01;
        g.add(loop(G.corners(G.rect(p.x, p.z, p.ry, p.w, p.d)), yy, p.need ? M.req : M.opt));
        const c = p.clearance || {}, hw = p.w / 2, hd = p.d / 2;
        if (c.front > 0) g.add(fill(G.localRect(p.x, p.z, p.ry, -hw, hw, hd, hd + c.front), y - 0.01, M.clear));
        if (c.back > 0) g.add(fill(G.localRect(p.x, p.z, p.ry, -hw, hw, -hd - c.back, -hd), y - 0.01, M.clear));
        if (c.left > 0) g.add(fill(G.localRect(p.x, p.z, p.ry, -hw - c.left, -hw, -hd, hd), y - 0.01, M.clear));
        if (c.right > 0) g.add(fill(G.localRect(p.x, p.z, p.ry, hw, hw + c.right, -hd, hd), y - 0.01, M.clear));
        /* a tick toward the front */
        const f = [Math.sin(p.ry), Math.cos(p.ry)];
        g.add(line([[p.x, p.z], [p.x + f[0] * (hd + 0.25), p.z + f[1] * (hd + 0.25)]], yy, p.need ? M.req : M.opt));
      });
      if (opt.grid && plan.grid) {
        const gr = plan.grid, B = plan.reach, pos = [], col = [];
        for (let k = 0; k < gr.nx * gr.nz; k++) {
          if (!gr.walkable(k)) continue;
          const c = gr.centre(k), ok = !B || B.dist[k] >= 0;
          pos.push(c[0], y + 0.005, c[1]);
          col.push(ok ? 0.35 : 1, ok ? 0.95 : 0.25, ok ? 0.45 : 0.25);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, depthTest: false, transparent: true, opacity: 0.85 }));
        pts.renderOrder = 8; g.add(pts);
        if (opt.paths && B) {
          plan.placements.forEach(function (p) {
            const Q = { P: { w: p.w, d: p.d }, x: p.x, z: p.z, ry: p.ry, host: p.host,
              pairedHost: !!(p.host && IX.SEAT_TYPES.indexOf(p.type) >= 0),
              zones: IX.clearanceZones({ w: p.w, d: p.d, clear: p.clearance || {}, usable: true }, p.x, p.z, p.ry) };
            if (p.anchor === 'ceiling' || p.anchor === 'surface' || IX.NO_ACCESS_TYPES.indexOf(p.type) >= 0) return;
            let best = -1;
            for (const r of IX.useZones(Q)) for (const k of gr.cellsIn(r)) if (B.dist[k] >= 0 && (best < 0 || B.dist[k] < B.dist[best])) best = k;
            const path = gr.path(B, best);
            if (path && path.length > 1) g.add(line(path, y + 0.02, M.path));
          });
        }
      }
    }
    g.userData.outline = room.id;
    return g;
  };
})(KratorInteriors);
