/* ======================================================================
   Krator Extraplanar: the drawing (kits/extraplanar/xp-draw.js)   [draw]

   The phenomena and the portals of xp-records.js as THREE groups, their weather on core/atmos (the module's own
   calls, never a copy of its code), and the shared silhouette card of the far tier. Nothing here decides where a
   thing is or what it is: a record does, and a record that was never registered is refused (XP.registry.markDrawn
   throws), so a host cannot draw what it has not registered.

     XPDRAW.phenomenon(rec, R)        -> THREE.Group (userData { kind, key, id, rec }); R the registry it is in
     XPDRAW.portal(rec, R)            -> THREE.Group
     XPDRAW.weather(g, ATMOS, o)      the record's weather on the group: a pool of mist (ATMOS.mistRing, kept on), a plume and
                                      a ring of steam (ATMOS.smoke), a glow (ATMOS.glowAdd). Call after ATMOS.init / bindHost and
                                      before ATMOS.finish; returns what it made
     XPDRAW.tick(g, t, eye)           pose the group at module time t (XP.pose / XP.openness): drift, yaw, the eyes, the spin,
                                      a portal's rim; eye [x, z] where the viewer stands (a presence turns to it)
     XPDRAW.card(set, h)              the far tier: one flat black shape of XP.SILHOUETTES[set], scaled to h metres, origin on
                                      the ground; XPDRAW.face(mesh, eye) yaws it to the eye each frame
     XPDRAW.gazeRod()                 the Haloed's beam, 4 m, +z forward (KratorExtraplanar.projectile('gaze'))
   ====================================================================== */
const XPDRAW = (function () {
  'use strict';
  const D = {};
  const L = function (hex) { return new THREE.Color(hex).convertSRGBToLinear(); };
  const TAU2 = Math.PI * 2;
  let MATS = null;
  function mats() {
    if (MATS) return MATS;
    MATS = {
      void: new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }),
      eyeWhite: new THREE.MeshBasicMaterial({ color: L(0xf2efe6) }),
      eyeGold: new THREE.MeshBasicMaterial({ color: L(0xffd56a) }),
      pupil: new THREE.MeshBasicMaterial({ color: 0x000000 }),
      chrome: new THREE.MeshStandardMaterial({ color: L(0x3a3c42), roughness: 0.32, metalness: 0.85, flatShading: true }),
      bone: new THREE.MeshStandardMaterial({ color: L(0xd8d2c4), roughness: 0.85, metalness: 0.0 }),
      boneDk: new THREE.MeshStandardMaterial({ color: L(0xa8a094), roughness: 0.9, metalness: 0.0 }),
      seam: new THREE.LineBasicMaterial({ color: L(0x7fd4ff), transparent: true, opacity: 0.9 }),
      star: new THREE.PointsMaterial({ color: L(0xdfefff), size: 0.14, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false }),
      halo: new THREE.MeshBasicMaterial({ color: L(0x9fe8ff) }),
      card: new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
    };
    return MATS;
  }
  /* a rim material of its own per portal (its opacity is the openness) */
  function rimMat(hex) { return new THREE.MeshBasicMaterial({ color: L(hex), transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }); }
  function planeMat() { return new THREE.MeshBasicMaterial({ color: 0x000000, fog: false, side: THREE.DoubleSide }); }
  function reg(rec, R) {
    if (!R || typeof R.markDrawn !== 'function') throw new Error('XPDRAW: a registry (XP.registry.create) is needed to draw ' + (rec && rec.key));
    R.markDrawn(rec);
  }
  function u(rec, a, b) { return XP.u(rec.seed, a, b == null ? 0 : b); }

  /* ---------------------------------------------------------------- the phenomena */
  D.phenomenon = function (rec, R) {
    reg(rec, R);
    const M = mats(), g = new THREE.Group();
    g.name = 'phenomenon:' + rec.key + ':' + rec.id;
    g.userData = { kind: 'phenomenon', key: rec.key, id: rec.id, rec: rec, eyes: [], glows: [] };
    if (rec.key === 'void') {
      const s = new THREE.Mesh(new THREE.SphereGeometry(rec.r, 28, 18), M.void);
      s.renderOrder = 1; g.add(s);
      /* the eyes sit on the sphere, each a disc and a pupil facing out; the tick opens them toward the viewer and shuts the far side */
      for (const E of rec.look.eyes) {
        const eg = new THREE.Group(), dir = new THREE.Vector3(Math.cos(E.el) * Math.sin(E.az), Math.sin(E.el), Math.cos(E.el) * Math.cos(E.az));
        eg.position.copy(dir).multiplyScalar(rec.r * 1.002);
        eg.lookAt(dir.clone().multiplyScalar(rec.r * 3));
        const er = rec.r * E.s;
        const w = new THREE.Mesh(new THREE.CircleGeometry(er, 14), M.eyeWhite); w.position.z = 0.01;
        const p = new THREE.Mesh(new THREE.CircleGeometry(er * 0.45, 10), M.pupil); p.position.z = 0.02;
        eg.add(w, p); eg.userData.dir = dir; g.add(eg); g.userData.eyes.push(eg);
      }
    } else if (rec.key === 'solid') {
      const F = rec.look.form, r = rec.r;
      const geo = F === 'icosahedron' ? new THREE.IcosahedronGeometry(r, 0) : new THREE.OctahedronGeometry(r, 0);
      const body = new THREE.Mesh(geo, M.chrome); body.castShadow = true; g.add(body);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), M.seam));
      if (F === 'stellated') {   /* a second octahedron through the first, turned: the seams of both show */
        const g2 = new THREE.OctahedronGeometry(r * 0.92, 0); g2.rotateY(Math.PI / 4); g2.rotateX(0.6);
        const b2 = new THREE.Mesh(g2, M.chrome); b2.castShadow = true; g.add(b2);
        g.add(new THREE.LineSegments(new THREE.EdgesGeometry(g2), M.seam));
      }
      /* a core of light seen through the seams: a small glow inside */
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 0.35, 1), new THREE.MeshBasicMaterial({ color: L(0x7fd4ff) }));
      g.add(core); g.userData.glows.push(core);
      g.userData.axis = new THREE.Vector3().fromArray(rec.look.axis).normalize();
    } else {
      /* a presence: a dark standing figure's envelope, the stars in it, one eye, a halo over it */
      const dark = new THREE.Group();
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 1.2, 10), M.void);   /* r128 has no CapsuleGeometry */
      torso.position.y = 1.45; dark.add(torso);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10), M.void); head.position.set(0, 2.05, 0.05); dark.add(head);
      for (const s of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 8), M.void); leg.position.set(s * 0.17, 0.5, 0); dark.add(leg); }
      for (const s of [-1, 1]) { const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.1, 8), M.void); arm.position.set(s * 0.46, 1.3, 0.05); arm.rotation.z = s * 0.15; dark.add(arm); }
      dark.traverse(function (o) { if (o.isMesh) o.renderOrder = 1; });
      g.add(dark);
      const pos = [];
      for (const st of rec.look.stars) pos.push(st[0], st[1], st[2]);
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const pts = new THREE.Points(pg, M.star); pts.renderOrder = 2; g.add(pts); g.userData.glows.push(pts);
      const eye = new THREE.Mesh(new THREE.CircleGeometry(0.075, 12), M.pupil); eye.position.fromArray(rec.look.eye); eye.position.z += 0.22; g.add(eye);
      const ring = new THREE.Mesh(new THREE.CircleGeometry(0.1, 12), M.eyeWhite); ring.position.copy(eye.position); ring.position.z -= 0.005; g.add(ring);
      const H = rec.look.halo, halo = new THREE.Mesh(new THREE.TorusGeometry(H.r, 0.025, 6, 40), M.halo);
      halo.position.y = H.y; halo.rotation.x = Math.PI / 2 + H.tilt; g.add(halo); g.userData.glows.push(halo);
    }
    g.traverse(function (o) { o.userData.xp = rec.id; });
    D.tick(g, 0, null);
    return g;
  };

  /* ---------------------------------------------------------------- the portals */
  D.portal = function (rec, R) {
    reg(rec, R);
    const M = mats(), g = new THREE.Group(), w = rec.size[0], h = rec.size[1];
    g.name = 'portal:' + rec.key + ':' + rec.id;
    const rim = rimMat(rec.key === 'drowned' ? 0x7fd4ff : 0xc9a8ff), plane = planeMat();
    g.userData = { kind: 'portal', key: rec.key, id: rec.id, rec: rec, rim: rim, plane: plane, glows: [] };
    if (rec.key === 'door') {
      const t = 0.18;
      for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(t, h, t * 1.4), M.chrome); j.position.set(s * (w / 2 + t / 2), h / 2, 0); j.castShadow = true; g.add(j); }
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(w + t * 2, t, t * 1.4), M.chrome); lintel.position.y = h + t / 2; lintel.castShadow = true; g.add(lintel);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(w + t * 2, 0.06, t * 1.8), M.boneDk); sill.position.y = 0.03; g.add(sill);
      const P = new THREE.Mesh(new THREE.PlaneGeometry(w, h), plane); P.position.y = h / 2; g.add(P); g.userData.planeMesh = P;
      const Rm = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.5, 4, 1), rim);   /* a thin frame of light just inside the jambs: four strips */
      Rm.visible = false; g.add(Rm);
      for (const e of [[0, h, w, 0.08], [0, 0.04, w, 0.08], [-w / 2, h / 2, 0.08, h], [w / 2, h / 2, 0.08, h]]) {
        const st = new THREE.Mesh(new THREE.PlaneGeometry(e[2], e[3]), rim); st.position.set(e[0], e[1], 0.02); g.add(st);
      }
    } else if (rec.key === 'tear') {
      /* a jagged slit: the lips as a polygon (the seed), black inside, a wider glowing lip behind */
      const n = 7, pts = [];
      for (let i = 0; i <= n; i++) { const y = h * i / n, k = Math.sin(Math.PI * i / n), x = w / 2 * (0.2 + 0.8 * k) * (0.7 + 0.6 * u(rec, 1, i)); pts.push([x, y]); }
      const outline = pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      for (let i = n; i >= 0; i--) outline.push(new THREE.Vector2(-pts[i][0] * (0.7 + 0.6 * u(rec, 2, i)), pts[i][1]));
      const shape = new THREE.Shape(outline), P = new THREE.Mesh(new THREE.ShapeGeometry(shape), plane); g.add(P); g.userData.planeMesh = P;
      const lip = new THREE.Mesh(new THREE.ShapeGeometry(shape), rim); lip.scale.set(1.18, 1.03, 1); lip.position.set(0, -h * 0.015, -0.03); g.add(lip);
      /* loose matter: a few bone-coloured shards floating round the lips */
      for (let i = 0; i < 6; i++) {
        const sh = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05 + 0.1 * u(rec, 3, i), 0), M.bone);
        sh.position.set((u(rec, 4, i) - 0.5) * w * 1.8, h * (0.1 + 0.8 * u(rec, 5, i)), (u(rec, 6, i) - 0.5) * 0.8); sh.rotation.set(u(rec, 7, i) * 3, u(rec, 8, i) * 3, 0);
        g.add(sh); g.userData.glows.push(sh);
      }
    } else {
      /* drowned: a hall's arch standing in the water (the host sets the water line; the record's at is the hall floor), its plane under the
         springing lit from below, the arch leaning and half gone */
      const r = w / 2, tube = 0.32, lean = (u(rec, 1) - 0.5) * 0.3;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 36, Math.PI * (0.78 + 0.2 * u(rec, 2))), M.boneDk);
      arch.position.y = h - r; arch.rotation.z = Math.PI * (0.11 - 0.1 * u(rec, 2)); arch.rotation.x = lean; arch.castShadow = true; g.add(arch);
      for (const s of [-1, 1]) { const pier = new THREE.Mesh(new THREE.BoxGeometry(tube * 2, h - r, tube * 2), M.boneDk); pier.position.set(s * r, (h - r) / 2, 0); pier.rotation.x = lean; pier.castShadow = true; g.add(pier); }
      const P = new THREE.Mesh(new THREE.PlaneGeometry(w - tube, h - 0.2), plane); P.position.set(0, (h - 0.2) / 2, 0); P.rotation.x = lean; g.add(P); g.userData.planeMesh = P;
      const glow = new THREE.Mesh(new THREE.CircleGeometry(r * 0.9, 24), rim); glow.rotation.x = -Math.PI / 2; glow.position.set(0, 0.05, 0.4); g.add(glow);
      const lip = new THREE.Mesh(new THREE.PlaneGeometry(w - tube + 0.3, h), rim); lip.position.set(0, h / 2 - 0.1, -0.04); lip.rotation.x = lean; g.add(lip);
    }
    g.traverse(function (o) { o.userData.xp = rec.id; });
    g.position.fromArray(rec.at); g.rotation.y = rec.ry;
    D.tick(g, 0, null);
    return g;
  };

  /* ---------------------------------------------------------------- the weather, on core/atmos */
  D.weather = function (g, A, o) {
    o = o || {};
    const rec = g.userData.rec, W = rec.weather, out = {};
    if (!A || !A.T) throw new Error('XPDRAW.weather: bind core/atmos first (ATMOS.bindHost / ATMOS.init)');
    if (rec.kind !== 'phenomenon') return out;
    if (W.fog > 0) {
      /* a pool of mist round where it is, drifting with it: the ring is parented to the group, its height below the hover */
      const rr = rec.r * 2.2, p = A.mistRing(function () { return rr; }, { n: o.mistN == null ? Math.round(24 + 24 * W.fog) : o.mistN, inner: rec.r * 1.3, outer: rec.r * 3.2, y0: -rec.hover + 0.2, y1: -rec.hover + 0.9 });
      if (p) {
        g.add(p);                                             /* out of ATMOS.root and onto the group */
        /* the preset's sprites are a moat's (26 to 60 m across): a pool round a thing a few metres wide takes them at a fraction of that */
        const pp = p.geometry.attributes.pp, ks = Math.min(1, (0.35 + 0.25 * rec.r) / 26);
        for (let i = 0; i < pp.count; i++) pp.setX(i, pp.getX(i) * ks);
        pp.needsUpdate = true;
        const k = W.fog;
        A.hook(function () { p.visible = true; p.material.uniforms.k.value = k; });   /* kept on: the mist is the thing's own, not the dawn's */
        out.mist = p;
      }
    }
    if (W.plume > 0) {
      const em = rec.key === 'solid' ? [[0, rec.r * 0.9, 0, 'chimney']] : [[0, -rec.hover + 0.1, 0, 'steam']];
      if (rec.key === 'solid') for (let i = 0; i < 6; i++) { const a = i / 6 * TAU2; em.push([Math.cos(a) * rec.r * 1.1, -rec.r * 0.6, Math.sin(a) * rec.r * 1.1, 'steam']); }
      const s = A.smoke(em, { n: o.smokeN == null ? (rec.key === 'solid' ? 48 : 24) : o.smokeN });
      if (s) { g.add(s); out.plume = s; }
    }
    const col = rec.key === 'solid' ? [0.5, 0.83, 1] : rec.key === 'presence' ? [0.87, 0.93, 1] : null;
    if (col) { A.glowAdd(rec.at[0], rec.at[1] + rec.hover + (rec.key === 'presence' ? 2.5 : 0), rec.at[2], col, rec.key === 'solid' ? 14 : 6, 0, 30); out.glow = true; }
    return out;
  };

  /* ---------------------------------------------------------------- the tick */
  const _ax = new THREE.Vector3(), _q = new THREE.Quaternion();
  D.tick = function (g, t, eye) {
    const U = g.userData, rec = U.rec;
    if (!rec) return;
    if (U.kind === 'phenomenon') {
      const p = XP.pose(rec, t, eye);
      g.position.fromArray(p.at); g.rotation.set(0, p.ry, 0);
      if (rec.key === 'void') {
        /* the eyes: open toward the viewer, shut on the far side, and the breath over all */
        const ex = eye ? eye[0] - p.at[0] : 0, ez = eye ? eye[1] - p.at[2] : 1, n = Math.hypot(ex, ez) || 1;
        for (const E of U.eyes) {
          const d = E.userData.dir, face = eye ? Math.max(0, (d.x * ex + d.z * ez) / n) : 1;
          const k = Math.max(0.001, p.open * (0.15 + 0.85 * face));
          E.scale.set(1, k, 1);
        }
      } else if (rec.key === 'solid') {
        _q.setFromAxisAngle(U.axis, p.spin); g.quaternion.copy(_q); g.rotateY(p.ry);
        for (const c of U.glows) c.scale.setScalar(0.8 + 0.4 * p.pulse * p.open);
      } else {
        for (const c of U.glows) if (c.isPoints) c.material.opacity = 0.5 + 0.5 * p.pulse; else c.scale.setScalar(0.9 + 0.2 * p.pulse);
      }
    } else if (U.kind === 'portal') {
      const o = XP.openness(rec, t);
      U.rim.opacity = 0.08 + 0.92 * o;
      if (U.planeMesh) U.planeMesh.visible = o > 0.05;
      for (const s of U.glows) s.position.y += Math.sin(t * 0.7 + s.position.x * 3) * 0.002;
    }
  };

  /* ---------------------------------------------------------------- the far tier: one flat black card */
  const _cards = {};
  D.card = function (set, h) {
    const S = XP.SILHOUETTES[set];
    if (!S) throw new Error('XPDRAW.card: no silhouette set ' + set + ' (' + Object.keys(XP.SILHOUETTES).join(', ') + ')');
    let geo = _cards[set];
    if (!geo) {
      const pos = [];
      for (const P of S.parts) {
        const sh = new THREE.Shape(P.map(function (p) { return new THREE.Vector2(p[0], p[1]); })), g2 = new THREE.ShapeGeometry(sh), a = g2.attributes.position, ix = g2.index;
        const cnt = ix ? ix.count : a.count;
        for (let i = 0; i < cnt; i++) { const j = ix ? ix.getX(i) : i; pos.push(a.getX(j), a.getY(j), 0); }
        g2.dispose();
      }
      geo = _cards[set] = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.computeBoundingSphere();
    }
    const m = new THREE.Mesh(geo, mats().card);
    const k = (h == null ? S.h : h) / S.h;
    m.scale.set(k, k, k);
    m.name = 'far:' + set; m.userData = { kind: 'far', set: set, h: h == null ? S.h : h, tris: geo.attributes.position.count / 3 };
    m.frustumCulled = true;
    return m;
  };
  D.face = function (m, eye) { m.rotation.y = Math.atan2(eye[0] - m.position.x, (eye.length > 2 ? eye[2] : eye[1]) - m.position.z); return m; };

  /* the Haloed's gaze: a 4 m rod of gold light, +z forward, origin at its middle */
  D.gazeRod = function () {
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: L(0xffd56a) });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 8), m); core.rotation.x = Math.PI / 2; g.add(core);
    const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 10, 1, true), new THREE.MeshBasicMaterial({ color: L(0xfff2c8), transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    sheath.rotation.x = Math.PI / 2; g.add(sheath);
    g.name = 'projectile:gaze';
    return g;
  };
  return D;
})();
