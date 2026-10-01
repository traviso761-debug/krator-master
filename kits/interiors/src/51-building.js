/* ======================== View: planned building shells (THREE) ========================
   IX.view.building(B, { palette }) draws an IX.planBuilding() plan: per storey a floor slab (the
   storey above has the stair's well cut out), the exterior walls (standing inside the footprint,
   the footprint is their outer face), the PARTITIONS (one wall per cut, drawn once, centred on
   the cut, with its door opening), the stairs (a solid flight, or a ladder), the door leaves
   (each drawn once, by the room it swings into) and a pitched roof:
     gable   per rectangle of the footprint, ridge along its longer side, gable ends in wall colour
     hip     per rectangle, four slopes (a pyramid on a square)
     pyramid a footprint that is not rectilinear: every eave rises to one apex
     flat    a slab
   userData.shell = { building, roof, walls: [{ level, out|null, mid, full, stub, partition }],
   levels: [{ k, group }], mats, top }: what IX.view.cutaway reads (55-cutaway.js), so the cut
   and the level selector work on it as on the single-room shells (50-shell.js).
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom, V = IX.view = IX.view || {};
  const DEFAULT_PAL = { wall: 0xd8d0c0, floor: 0x8a8070, roof: 0x9a9080, trim: 0x5a5040 };

  function slab(poly, holes, y0, y1, mat) {
    const sh = new THREE.Shape(poly.map(function (p) { return new THREE.Vector2(p[0], -p[1]); }));
    (holes || []).forEach(function (h) { sh.holes.push(new THREE.Path(h.map(function (p) { return new THREE.Vector2(p[0], -p[1]); }))); });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false }), mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y0;
    return m;
  }
  /* a box along a -> b from u0 to u1, y0..y1, offset `off` along n (centre line), thickness thick */
  function box(a, t, n, off, u0, u1, y0, y1, thick, mat) {
    const len = u1 - u0, h = y1 - y0;
    if (len < 0.01 || h < 0.01) return null;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, thick), mat);
    const uc = (u0 + u1) / 2;
    m.position.set(a[0] + t[0] * uc + n[0] * off, y0 + h / 2, a[1] + t[1] * uc + n[1] * off);
    m.rotation.y = Math.atan2(-t[1], t[0]);
    return m;
  }
  function tris(pos, mat) {                    /* a non-indexed triangle soup, flat shaded */
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }

  /* one rectangle of roof: centre c, axes U V, half extents hu hv, eave y, overhang o */
  function roofRect(P, kind, pitch, y, o, mats) {
    const grp = new THREE.Group();
    const along = P.hu >= P.hv;                 /* ridge along the longer side */
    const A = (along ? P.hu : P.hv) + o, Bh = (along ? P.hv : P.hu) + o, wallA = along ? P.hu : P.hv;
    const ax = along ? P.U : P.V, bx = along ? P.V : P.U, H = Bh * Math.tan(pitch);
    const W = function (a, b, h) { return [P.centre[0] + ax[0] * a + bx[0] * b, y + h, P.centre[1] + ax[1] * a + bx[1] * b]; };
    const pos = [], wall = [];
    function quad(p, q, r, s, out) { out.push.apply(out, p.concat(q, r, p, r, s)); }
    function tri(p, q, r, out) { out.push.apply(out, p.concat(q, r)); }
    if (kind === 'flat') {
      const m = slab([W(-A, -Bh, 0), W(A, -Bh, 0), W(A, Bh, 0), W(-A, Bh, 0)].map(function (p) { return [p[0], p[2]]; }), null, y, y + 0.22, mats.roof);
      grp.add(m); return grp;
    }
    if (kind === 'hip') {
      const r = Math.max(0, A - Bh);
      quad(W(-A, -Bh, 0), W(A, -Bh, 0), W(r, 0, H), W(-r, 0, H), pos);
      quad(W(A, Bh, 0), W(-A, Bh, 0), W(-r, 0, H), W(r, 0, H), pos);
      tri(W(A, -Bh, 0), W(A, Bh, 0), W(r, 0, H), pos);
      tri(W(-A, Bh, 0), W(-A, -Bh, 0), W(-r, 0, H), pos);
    } else {                                     /* gable */
      quad(W(-A, -Bh, 0), W(A, -Bh, 0), W(A, 0, H), W(-A, 0, H), pos);
      quad(W(A, Bh, 0), W(-A, Bh, 0), W(-A, 0, H), W(A, 0, H), pos);
      const hb = Bh - o, Hg = hb * Math.tan(pitch) + o * Math.tan(pitch);
      tri(W(wallA, -hb, 0), W(wallA, hb, 0), W(wallA, 0, Hg), wall);
      tri(W(-wallA, hb, 0), W(-wallA, -hb, 0), W(-wallA, 0, Hg), wall);
    }
    grp.add(tris(pos, mats.roofDS));
    if (wall.length) grp.add(tris(wall, mats.wallDS));
    return grp;
  }
  function roofPyramid(poly, pitch, y, o, mats) {
    const out = G.offset(poly, o), c = G.centroid(poly);
    let r = Infinity;
    for (let i = 0; i < poly.length; i++) r = Math.min(r, G.segDist(c[0], c[1], poly[i], poly[(i + 1) % poly.length]));
    const H = (r + o) * Math.tan(pitch), pos = [];
    for (let i = 0; i < out.length; i++) {
      const p = out[i], q = out[(i + 1) % out.length];
      pos.push(p[0], y, p[1], q[0], y, q[1], c[0], y + H, c[1]);
    }
    return tris(pos, mats.roofDS);
  }

  V.building = function (B, opt) {
    opt = opt || {};
    const pal = Object.assign({}, DEFAULT_PAL, (V.PALETTES || {})[B.culture] || {}, opt.palette || {});
    const grp = new THREE.Group();
    grp.name = 'building:' + B.id;
    const mats = { wall: V.lambert(pal.wall), floor: V.lambert(pal.floor), roof: V.lambert(pal.roof), trim: V.lambert(pal.trim),
      part: V.lambert(new THREE.Color(pal.wall).multiplyScalar(0.92).getHex()),
      stair: V.lambert(pal.trim),
      roofDS: V.lambert(pal.roof, { side: THREE.DoubleSide }), wallDS: V.lambert(pal.wall, { side: THREE.DoubleSide }),
      glass: V.lambert(0x9fc4d8, { transparent: true, opacity: 0.35, depthWrite: false }),
      fade: V.lambert(pal.wall, { transparent: true, opacity: 0.16, depthWrite: false }) };
    const tag = function (o, part, level) { o.traverse(function (m) { m.userData.building = B.id; m.userData.part = part; m.userData.level = level; }); return o; };
    const levels = B.levels.map(function (Lv) { const g = new THREE.Group(); g.name = 'level:' + Lv.k; grp.add(g); return { k: Lv.k, group: g }; });
    /* floors */
    B.floors.forEach(function (F) {
      const m = slab(F.poly, F.holes, F.y - (F.level ? F.thick : 0.25), F.y, mats.floor);
      levels[F.level].group.add(tag(m, 'floor', F.level));
    });
    /* walls */
    const walls = [];
    B.walls.forEach(function (Wl) {
      const a = Wl.a, b = Wl.b, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1e-6) return;
      const t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      const ext = Wl.kind === 'exterior';
      const n = ext ? [-Wl.out[0], -Wl.out[1]] : [-t[1], t[0]], off = ext ? Wl.thick / 2 : 0;
      let ea = 0, eb = 0;
      if (ext) {                                 /* overlap at a reflex corner of the footprint, so no notch shows */
        const po = B.levels[Wl.level].outer, ia = indexOf(po, a), ib = indexOf(po, b);
        if (ia >= 0 && !G.convexAt(po, ia)) ea = Wl.thick;
        if (ib >= 0 && !G.convexAt(po, ib)) eb = Wl.thick;
      }
      const y0 = Wl.y, top = Wl.y + Wl.h, H = Wl.h, mat = ext ? mats.wall : mats.part;
      const full = new THREE.Group(), stub = new THREE.Group(), SH = Math.min(0.45, H);
      const add = function (g, m) { if (m) g.add(m); };
      let u = -ea;
      for (const o of Wl.openings.slice().sort(function (p, q) { return p.u - q.u; })) {
        const u0 = o.u - o.w / 2, u1 = o.u + o.w / 2;
        add(full, box(a, t, n, off, u, u0, y0, top, Wl.thick, mat));
        add(stub, box(a, t, n, off, u, u0, y0, y0 + SH, Wl.thick, mat));
        add(full, box(a, t, n, off, u0, u1, y0 + o.y1, top, Wl.thick, mat));
        if (o.y0 > 0) {
          add(full, box(a, t, n, off, u0, u1, y0, y0 + o.y0, Wl.thick, mat));
          add(stub, box(a, t, n, off, u0, u1, y0, y0 + Math.min(o.y0, SH), Wl.thick, mat));
          add(full, box(a, t, n, off, u0, u1, y0 + o.y0, y0 + o.y1, 0.04, mats.glass));
        }
        u = u1;
      }
      add(full, box(a, t, n, off, u, len + eb, y0, top, Wl.thick, mat));
      add(stub, box(a, t, n, off, u, len + eb, y0, y0 + SH, Wl.thick, mat));
      stub.visible = false;
      tag(full, 'wall', Wl.level); tag(stub, 'wall', Wl.level);
      levels[Wl.level].group.add(full); levels[Wl.level].group.add(stub);
      walls.push({ wall: Wl.id, level: Wl.level, partition: !ext, out: ext ? Wl.out : null,
        mid: [a[0] + t[0] * len / 2 + n[0] * off, a[1] + t[1] * len / 2 + n[1] * off], full: full, stub: stub });
    });
    function indexOf(po, p) { for (let i = 0; i < po.length; i++) if (Math.abs(po[i][0] - p[0]) < 1e-3 && Math.abs(po[i][1] - p[1]) < 1e-3) return i; return -1; }
    /* stairs: a solid flight of steps, or a ladder */
    B.stairs.forEach(function (S) {
      if (!S.centre) return;
      const g = new THREE.Group(), d = S.dir, side = [-d[1], d[0]];
      if (S.kind === 'stair') {
        const n = S.risers, tread = S.run / Math.max(1, n - 1), rise = (S.y1 - S.y0) / n;
        for (let i = 0; i < n - 1; i++) {
          const m = new THREE.Mesh(new THREE.BoxGeometry(S.w, rise * (i + 1), tread), mats.stair);
          const s = i * tread + tread / 2;
          m.position.set(S.foot[0] + d[0] * s, S.y0 + rise * (i + 1) / 2, S.foot[1] + d[1] * s);
          m.rotation.y = S.ry;
          g.add(m);
        }
      } else {
        const L = Math.hypot(S.run, S.y1 - S.y0), rungs = Math.floor(L / 0.3);
        for (const sg of [-1, 1]) {
          const a = new THREE.Vector3(S.foot[0] + side[0] * sg * S.w / 2, S.y0, S.foot[1] + side[1] * sg * S.w / 2);
          const b = new THREE.Vector3(S.top[0] + side[0] * sg * S.w / 2, S.y1, S.top[1] + side[1] * sg * S.w / 2);
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, a.distanceTo(b), 6), mats.stair);
          m.position.copy(a).add(b).multiplyScalar(0.5);
          m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
          g.add(m);
        }
        for (let i = 1; i < rungs; i++) {
          const f = i / rungs, m = new THREE.Mesh(new THREE.BoxGeometry(S.w, 0.04, 0.05), mats.stair);
          m.position.set(S.foot[0] + (S.top[0] - S.foot[0]) * f, S.y0 + (S.y1 - S.y0) * f, S.foot[1] + (S.top[1] - S.foot[1]) * f);
          m.rotation.y = S.ry;
          g.add(m);
        }
      }
      levels[S.from].group.add(tag(g, 'stair', S.from));
    });
    /* door leaves: drawn by the room each door swings into (a shared door has leaf: false in the other) */
    B.rooms.forEach(function (R) {
      R.doors.forEach(function (d) {
        if (d.swing === 'none' || !d.leaf) return;
        const left = [-d.n[1], d.n[0]], hs = d.hinge === 'right' ? -1 : 1;
        const hx = d.at[0] + left[0] * hs * d.w / 2, hz = d.at[1] + left[1] * hs * d.w / 2;
        const dir = d.swing === 'out' ? -1 : 1, a = 75 * Math.PI / 180;
        const cx = -left[0] * hs, cz = -left[1] * hs, ox = d.n[0] * dir, oz = d.n[1] * dir;
        const vx = cx * Math.cos(a) + ox * Math.sin(a), vz = cz * Math.cos(a) + oz * Math.sin(a);
        const leafH = Math.min(d.h, R.h - 0.1) - 0.02;
        const m = new THREE.Mesh(new THREE.BoxGeometry(d.w - 0.04, leafH, 0.05), mats.trim);
        m.position.set(hx + vx * (d.w / 2), R.y + leafH / 2 + 0.01, hz + vz * (d.w / 2));
        m.rotation.y = Math.atan2(-vz, vx);
        levels[R.level].group.add(tag(m, 'door', R.level));
      });
    });
    /* roof */
    const roof = new THREE.Group(), RF = B.roof;
    if (RF.kind === 'pyramid' && RF.poly) roof.add(roofPyramid(RF.poly, RF.pitch, RF.y, RF.overhang, mats));
    else RF.parts.forEach(function (P) { roof.add(roofRect(P, RF.kind, RF.pitch, RF.y, RF.overhang, mats)); });
    tag(roof, 'roof', B.levels.length - 1);
    grp.add(roof);
    grp.userData.shell = { room: B.id, building: B.id, roof: roof, walls: walls, levels: levels, mats: mats, top: B.levels.length - 1 };
    return grp;
  };
})(KratorInteriors);
