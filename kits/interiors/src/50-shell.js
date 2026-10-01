/* ======================== View: procedural room shells (THREE) ========================
   THREE.js from here on (fragments 50-59); still no catalog. A build with real buildings
   does not need this: it is the demo's stand-in for a building around a ROOM().

   IX.view.shell(room, { thick, palette }) -> THREE.Group, userData.shell = {
     floor, roof, walls: [{ wall, out:[x,z], mid:[x,z], full: Group, stub: Group }] }
   Walls stand OUTSIDE the polygon (the polygon is the inner face), with openings for every
   door (to its h) and window (sill .. sill + h). A wall is drawn twice: `full`, and `stub`,
   a knee-high cut of it the cut-away shows instead of a wall that faces the camera.
   Door leaves hang from their hinge, opened 75 degrees the way they swing.
   ====================================================================== */
(function (IX) {
  'use strict';
  const G = IX.geom;
  const V = IX.view = IX.view || {};
  V.PALETTES = {
    'ancient':          { wall: 0x9aa3a8, floor: 0x6f7880, roof: 0x5d656b, trim: 0x46525c },
    'ancients-salvage': { wall: 0x8f8573, floor: 0x5f5a50, roof: 0x6e5a48, trim: 0x7a4a30 },
    'yuni-common':      { wall: 0xe8dfcc, floor: 0xb06d47, roof: 0xc9b89a, trim: 0x8a6a48 },
    'yuni-court':       { wall: 0xf1ece0, floor: 0x3f6f8f, roof: 0xd8cdb5, trim: 0x2f5f7f },
    'yuni-poor':        { wall: 0xc9a77f, floor: 0x9a7a58, roof: 0xb79a6a, trim: 0x6a5038 },
    'order':            { wall: 0xece6d8, floor: 0x8c8478, roof: 0xbdb3a2, trim: 0x5c5448 },
    'sahelian':         { wall: 0xc08a5c, floor: 0x9a6f4a, roof: 0xa98058, trim: 0x6a4a30 },
    'nomad':            { wall: 0xc9b48a, floor: 0x8a6f4f, roof: 0xb09a72, trim: 0x6a5a40 },
    'voth':             { wall: 0x6e6658, floor: 0x4e4a42, roof: 0x3f3a33, trim: 0x8a7350 },
    'iziz':             { wall: 0xd8d0c0, floor: 0x7a7468, roof: 0xa49a88, trim: 0x5a5448 },
    'beast-rider':      { wall: 0x8a6a4a, floor: 0x6a5238, roof: 0x5a7a3a, trim: 0x4a3626 }
  };
  const DEFAULT_PAL = { wall: 0xd8d0c0, floor: 0x8a8070, roof: 0x9a9080, trim: 0x5a5040 };
  V.lambert = function (c, extra) { return new THREE.MeshLambertMaterial(Object.assign({ color: c }, extra || {})); };

  function slab(poly, y0, y1, mat) {           /* a prism over a polygon, from y0 to y1 */
    const sh = new THREE.Shape(poly.map(function (p) { return new THREE.Vector2(p[0], -p[1]); }));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y0;
    return m;
  }
  /* a box from u0..u1 along a wall, y0..y1, standing outside it (thick) */
  function wallBox(W, u0, u1, y0, y1, thick, mat) {
    const len = u1 - u0, h = y1 - y0;
    if (len < 0.01 || h < 0.01) return null;
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, thick), mat);
    const uc = (u0 + u1) / 2;
    m.position.set(W.a[0] + W.t[0] * uc - W.n[0] * thick / 2, y0 + h / 2, W.a[1] + W.t[1] * uc - W.n[1] * thick / 2);
    m.rotation.y = Math.atan2(-W.t[1], W.t[0]);
    return m;
  }

  V.shell = function (room, opt) {
    opt = opt || {};
    const thick = opt.thick || 0.22, pal = Object.assign({}, DEFAULT_PAL, V.PALETTES[room.culture] || {}, opt.palette || {});
    const y0 = room.y, H = room.h, top = y0 + H;
    const grp = new THREE.Group();
    grp.name = 'shell:' + room.id;
    const mats = { wall: V.lambert(pal.wall), floor: V.lambert(pal.floor), roof: V.lambert(pal.roof), trim: V.lambert(pal.trim),
      glass: V.lambert(0x9fc4d8, { transparent: true, opacity: 0.35, depthWrite: false }),
      fade: V.lambert(pal.wall, { transparent: true, opacity: 0.16, depthWrite: false }) };
    const outer = G.offset(room.poly, thick);
    const floor = slab(outer, y0 - 0.25, y0, mats.floor);
    floor.userData.room = room.id; floor.userData.part = 'floor';
    grp.add(floor);
    const roof = new THREE.Group();
    roof.add(slab(G.offset(room.poly, thick + 0.25), top, top + 0.22, mats.roof));
    roof.add(slab(G.offset(room.poly, thick + 0.05), top + 0.22, top + 0.42, mats.trim));
    roof.traverse(function (o) { o.userData.room = room.id; o.userData.part = 'roof'; });
    grp.add(roof);
    const walls = [];
    const n = room.poly.length;
    room.walls.forEach(function (W) {
      /* extend past a CONVEX corner so neighbours meet; at a reflex corner the boxes already overlap */
      const ia = room.poly.indexOf(W.a), ib = (ia + 1) % n;
      const ea = G.convexAt(room.poly, ia) ? thick : 0, eb = G.convexAt(room.poly, ib) ? thick : 0;
      const ops = [];
      room.doors.forEach(function (d) { if (d.wall === W.i) ops.push({ u0: d.u - d.w / 2, u1: d.u + d.w / 2, y0: 0, y1: Math.min(d.h, H - 0.1), door: d }); });
      room.windows.forEach(function (w) { if (w.wall === W.i) ops.push({ u0: w.u - w.w / 2, u1: w.u + w.w / 2, y0: w.sill, y1: Math.min(w.sill + w.h, H - 0.1), win: w }); });
      ops.sort(function (p, q) { return p.u0 - q.u0; });
      const full = new THREE.Group(), stub = new THREE.Group(), SH = Math.min(0.45, H);
      let u = -ea;
      function add(g, m) { if (m) g.add(m); }
      for (const o of ops) {
        add(full, wallBox(W, u, o.u0, y0, top, thick, mats.wall));
        add(stub, wallBox(W, u, o.u0, y0, y0 + SH, thick, mats.wall));
        add(full, wallBox(W, o.u0, o.u1, y0 + o.y1, top, thick, mats.wall));            /* lintel */
        if (o.y0 > 0) {
          add(full, wallBox(W, o.u0, o.u1, y0, y0 + o.y0, thick, mats.wall));          /* under a window */
          add(stub, wallBox(W, o.u0, o.u1, y0, y0 + Math.min(o.y0, SH), thick, mats.wall));
          add(full, wallBox(W, o.u0, o.u1, y0 + o.y0, y0 + o.y1, 0.04, mats.glass));
        }
        u = o.u1;
      }
      add(full, wallBox(W, u, W.len + eb, y0, top, thick, mats.wall));
      add(stub, wallBox(W, u, W.len + eb, y0, y0 + SH, thick, mats.wall));
      stub.visible = false;
      const mid = [W.a[0] + W.t[0] * W.len / 2, W.a[1] + W.t[1] * W.len / 2];
      const rec = { wall: W.i, out: [-W.n[0], -W.n[1]], mid: mid, full: full, stub: stub };
      [full, stub].forEach(function (g) { g.traverse(function (o) { o.userData.room = room.id; o.userData.part = 'wall'; }); grp.add(g); });
      walls.push(rec);
    });
    /* door leaves, hung from the hinge and opened 75 degrees */
    room.doors.forEach(function (d) {
      if (d.swing === 'none' || !d.leaf) return;
      const left = [-d.n[1], d.n[0]], hs = d.hinge === 'right' ? -1 : 1;
      const hx = d.at[0] + left[0] * hs * d.w / 2, hz = d.at[1] + left[1] * hs * d.w / 2;
      const dir = d.swing === 'out' ? -1 : 1, a = 75 * Math.PI / 180;
      /* closed: from the hinge toward the other jamb (-left*hs); open: rotated toward +n*dir */
      const cx = -left[0] * hs, cz = -left[1] * hs, ox = d.n[0] * dir, oz = d.n[1] * dir;
      const vx = cx * Math.cos(a) + ox * Math.sin(a), vz = cz * Math.cos(a) + oz * Math.sin(a);
      const leafH = Math.min(d.h, H - 0.1) - 0.02;
      const m = new THREE.Mesh(new THREE.BoxGeometry(d.w - 0.04, leafH, 0.05), mats.trim);
      m.position.set(hx + vx * (d.w / 2), y0 + leafH / 2 + 0.01, hz + vz * (d.w / 2));
      m.rotation.y = Math.atan2(-vz, vx);
      m.userData.room = room.id; m.userData.part = 'door';
      grp.add(m);
    });
    grp.userData.shell = { room: room.id, floor: floor, roof: roof, walls: walls, mats: mats };
    return grp;
  };
})(KratorInteriors);
