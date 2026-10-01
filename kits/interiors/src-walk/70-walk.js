/* ======================== Walk mockup: furnished rooms inside the real buildings ========================
   The page behind dist/interiors-walk.html: a street of buildings from the Highlands, Post-Apoc, Beast
   Rider, Locus and Abyss kits, each standing in its REAL geometry (walk/shells/*.js, cut out of the kit's
   own page by tools/export_shells.py; the Beast Rider buildings built directly from the catalog's
   ASSETs), with the rooms its interior set (sets/*.js) declares planned and furnished from the master
   catalog. WALK (F) is first person with collision: you move only on open ground, through doors, on a
   room's walk grid (the placer's own: walls, furniture and stair wells block it) and up the planned
   stairs. In orbit, the cut-away (C) clips each building above its chosen storey (L) so the rooms show.
   Exposes window._interiors (items, rooms, plans, buildings, gotoItem, walkTo, support, ...) and sets
   window._ready.
   ====================================================================== */
(function () {
  'use strict';
  const IX = KratorInteriors, G = IX.geom;
  const catalog = IX.catalogAdapter({ lights: 'strip' });
  camera.near = 0.2; camera.far = 4500; camera.updateProjectionMatrix();   /* depth precision: the engine's 0.1 near plane halves it */
  const GAP = 8, EYE = 1.62, STEP = 0.45, ENTER = 3.6;
  const SHELLS = window.KRATOR_SHELLS || {};
  /* the street: [set, item key, kit key for a catalog-built shell (Beast Rider), variant] */
  const STREET = [
    ['highlands', 'hl_rep_house_poor_b'], ['highlands', 'hl_rep_house_mid_a'], ['highlands', 'hl_rep_tavern_b'],
    ['highlands', 'hl_rus_house_mid_a'], ['highlands', 'hl_tri_small_b'],
    ['post-apoc', 'dw-silo'], ['post-apoc', 'dw-bottle'], ['post-apoc', 'shop-general'], ['post-apoc', 'lg-stack'],
    ['beast-rider', 'br_bldg_girder_house', 'br_bldg_girder_house', 0], ['beast-rider', 'br_bldg_deck_lot', 'br_bldg_deck_lot', 0],
    ['locus', 'stilt_mid'], ['abyss', 'abyss_house_mid#2'], ['abyss', 'abyss_shop_food']
  ];

  /* ---------- the real shells */
  function decode(b64, T) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); }
  const SHELL_MATS = [];
  function shellMesh(data) {
    const g = new THREE.Group();
    ['solid', 'double', 'glass', 'glow'].forEach(function (k) {
      const B = data[k]; if (!B) return;
      const C = decode(B.c, Uint8Array), col = new Float32Array(C.length);
      let pos;
      if (B.f === 'f32') pos = decode(B.p, Float32Array);
      else { const P = decode(B.p, Int16Array); pos = new Float32Array(P.length); for (let i = 0; i < P.length; i++) pos[i] = P[i] / 100; }
      for (let i = 0; i < C.length; i++) col[i] = C[i] / 255;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      geo.computeVertexNormals();
      /* the kits draw solids single-sided: two-sided here would let the hidden back faces of touching boxes fight */
      const side = k === 'solid' ? THREE.FrontSide : THREE.DoubleSide;
      const mat = k === 'glow' ? new THREE.MeshBasicMaterial({ vertexColors: true, side: side })
        : new THREE.MeshLambertMaterial({ vertexColors: true, side: side, transparent: k === 'glass', opacity: k === 'glass' ? 0.4 : 1, depthWrite: k !== 'glass' });
      SHELL_MATS.push(mat);
      const m = new THREE.Mesh(geo, mat); m.userData.shellPart = k; g.add(m);
    });
    return g;
  }

  /* ---------- lay out the street, plan and register the rooms */
  const items = [];
  let x = 0;
  STREET.forEach(function (row) {
    const S = IX.sets.byName[row[0]]; if (!S) return;
    const it = S.byKey[row[1]]; if (!it || it.skip) return;
    const lot = it.lot || [12, 12], w = Math.max(10, lot[0]), d = Math.max(10, lot[1]);
    const ox = x + w / 2, oz = 0;
    x += w + GAP;
    const inst = IX.sets.instantiate(it, ox, oz, 0, { baseY: 0, register: true, prefix: 'walk.' + row[0] + '.' });
    const E = { set: S, item: it, inst: inst, ox: ox, oz: oz, lot: [w, d], shell: null, real: false };
    const data = SHELLS[row[0]] && SHELLS[row[0]][row[1]];
    if (data) { E.shell = shellMesh(data); E.real = true; }
    else if (row[2] && typeof buildAsset === 'function') {
      const g = buildAsset(row[2], 0, 0, 0, { variant: row[3] || 0, seed: 1, y: 0 });
      if (g) {
        scene.remove(g); const ii = INSTANCES.indexOf(g); if (ii >= 0) INSTANCES.splice(ii, 1);
        /* the engine caches materials by colour and family (shared with furniture): clone them, so the cut-away clips this shell only */
        g.traverse(function (o) { if (o.material) { o.material = Array.isArray(o.material) ? o.material.map(function (m) { return m.clone(); }) : o.material.clone(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { SHELL_MATS.push(m); }); } });
        g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); E.shell = g; E.real = true;
      }
    }
    if (E.shell) {
      E.shell.position.set(ox, 0, oz);
      E.shell.userData.building = inst.buildings[0] ? inst.buildings[0].id : null; E.shell.userData.part = 'real shell';
      E.shell.traverse(function (o) { o.userData.walkItem = items.length; });
      scene.add(E.shell);
    }
    items.push(E);
  });
  /* ---------- openings: the kits draw doors as panels on solid walls (a dark void) and floors over the
     planner's stairs, so each real shell gets CUT BOXES, one per planned door (the doorway through the wall)
     and one per flight (the well through the floor above), and its shader discards what lies inside them */
  const HOLES_MAX = 24;
  function boxInverse(c, ax, ay, az, hx, hy, hz) {        /* world -> unit cube of a box at c with axes ax ay az, half sizes */
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(ax[0] * hx, ax[1] * hx, ax[2] * hx), new THREE.Vector3(ay[0] * hy, ay[1] * hy, ay[2] * hy), new THREE.Vector3(az[0] * hz, az[1] * hz, az[2] * hz));
    m.setPosition(c[0], c[1], c[2]);
    return m.invert();
  }
  function holesOf(E) {
    const out = [];
    E.inst.rooms.forEach(function (R) {
      R.doors.forEach(function (d) {
        if (d.to !== 'street' && !R.explicit) return;      /* interior doors are the planner's own partitions */
        const W = R.walls[d.wall], h = Math.min(d.h || 2.1, R.h - 0.05);
        out.push(boxInverse([d.at[0], R.y + 0.03 + h / 2, d.at[1]], [W.t[0], 0, W.t[1]], [0, 1, 0], [W.n[0], 0, W.n[1]], d.w / 2, h / 2, 0.6));
      });
    });
    E.inst.buildings.forEach(function (B) {
      B.stairs.forEach(function (S) {
        const c = [(S.foot[0] + S.top[0]) / 2, (S.y0 + 1.9 + S.y1 + 0.05) / 2, (S.foot[1] + S.top[1]) / 2];
        out.push(boxInverse(c, [S.dir[0], 0, S.dir[1]], [0, 1, 0], [-S.dir[1], 0, S.dir[0]], S.run / 2 + 0.25, (S.y1 + 0.05 - S.y0 - 1.9) / 2, S.w / 2 - 0.04));   /* narrower than the flight: the wall it runs along keeps its face */
      });
    });
    return out.slice(0, HOLES_MAX);
  }
  function cutHoles(E) {
    if (!E.shell) return;
    const H = holesOf(E); if (!H.length) return;
    const mats = new THREE.Matrix4(), arr = [];
    for (let i = 0; i < HOLES_MAX; i++) arr.push(H[i] || mats);
    /* the shell group is placed at (ox, 0, oz) unturned: holes are in world metres, the shader works in world space */
    E.shell.traverse(function (o) {
      if (!o.material) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
        m.onBeforeCompile = function (sh) {
          sh.uniforms.holeM = { value: arr }; sh.uniforms.holeN = { value: H.length };
          sh.vertexShader = 'varying vec3 vHoleW;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vHoleW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
          sh.fragmentShader = 'varying vec3 vHoleW;\nuniform mat4 holeM[' + HOLES_MAX + '];\nuniform int holeN;\n' +
            sh.fragmentShader.replace('void main() {', 'void main() {\n  for (int i = 0; i < ' + HOLES_MAX + '; i++) { if (i >= holeN) break; vec3 q = (holeM[i] * vec4(vHoleW, 1.0)).xyz; if (abs(q.x) < 1.0 && abs(q.y) < 1.0 && abs(q.z) < 1.0) discard; }');
        };
        m.customProgramCacheKey = function () { return 'walkholes'; };
        m.needsUpdate = true;
      });
    });
    E.holes = H.length;
  }
  const rooms = [], buildings = [], stairs = [], roomItem = {};
  items.forEach(cutHoles);
  items.forEach(function (E) {
    E.inst.buildings.forEach(function (B) { buildings.push(B); B.stairs.forEach(function (S) { stairs.push(S); }); });
    E.inst.rooms.forEach(function (R) { rooms.push(R); roomItem[R.id] = E; });
  });

  /* ---------- planned shells (the planner's own walls), off by default: B toggles them. Inside a REAL shell
     the planner's INNER parts stand in what the kit does not draw: partitions with their doors, the stairs,
     the upper floors (the real building's own walls, roof and ground slab stay; the planned ones hide) */
  const planned = [], overlays = [];
  function cloneMats(g, list) {
    g.traverse(function (o) { if (o.material && !o.material.userData.walkClone) { o.material = o.material.clone(); o.material.userData.walkClone = true; list.push(o.material); } });
  }
  items.forEach(function (E) {
    E.overlayMats = [];
    E.inst.buildings.forEach(function (B) {
      const s = IX.view.building(B); s.visible = false; scene.add(s); planned.push(s);
      if (!E.real) return;
      const o = IX.view.building(B), sh = o.userData.shell;
      sh.roof.visible = false;
      sh.walls.forEach(function (w) { if (!w.partition) { w.full.visible = false; w.stub.visible = false; } else w.stub.visible = false; });
      /* upper floors sink 4 cm under the real building's own slab where it has one, so the two never share a plane */
      o.traverse(function (m) { if (m.isMesh && m.userData.part === 'floor') { if (!m.userData.level) m.visible = false; else m.position.y -= 0.04; } });
      cloneMats(o, E.overlayMats);
      o.userData.overlay = true; scene.add(o); overlays.push(o);
    });
    E.inst.rooms.forEach(function (R) { if (R.explicit) { const s = IX.view.shell(R); s.visible = false; scene.add(s); planned.push(s); } });
  });

  /* ---------- furnish */
  let seed = 0, plans = [], plansById = {};
  function furnish() {
    for (const P of plans) for (const g of (P.objects || [])) { if (!g) continue; scene.remove(g); const i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1); }
    plansById = {};
    plans = rooms.map(function (R) { const P = furnishRoom(R, catalog, { seed: seed }); IX.buildRoom(P, catalog, R); plansById[R.id] = P; return P; });
    applyClip();
  }

  /* ---------- the ground: a street */
  const W = x + 20;
  /* the street and the road are pushed back in depth: the buildings' own yards and paving lie on y = 0 */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 80, 140), new THREE.MeshLambertMaterial({ color: 0x9a9478, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 8 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2 - 20, -0.03, 10); ground.userData.label = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(W + 20, 6), new THREE.MeshLambertMaterial({ color: 0x7c7564, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }));
  road.rotation.x = -Math.PI / 2; road.position.set(W / 2 - 10, -0.01, Math.max.apply(null, items.map(function (E) { return E.lot[1] / 2; })) + 6); road.userData.label = true; scene.add(road);
  const ROAD_Z = road.position.z;

  /* ---------- labels */
  function labelTex(text, sub) {
    const c = document.createElement('canvas'); c.width = 640; c.height = 120;
    const g = c.getContext('2d'); g.fillStyle = 'rgba(38,33,24,0.9)'; g.fillRect(0, 0, 640, 120);
    g.fillStyle = '#f2ead4'; g.textAlign = 'center'; let fs = 38; g.font = 'bold ' + fs + 'px Georgia, serif';
    while (g.measureText(text).width > 610 && fs > 14) { fs -= 2; g.font = 'bold ' + fs + 'px Georgia, serif'; }
    g.fillText(text, 320, 50); let s2 = 24; g.font = s2 + 'px Georgia, serif';
    while (g.measureText(sub).width > 620 && s2 > 11) { s2 -= 1; g.font = s2 + 'px Georgia, serif'; }
    g.globalAlpha = 0.8; g.fillText(sub, 320, 96);
    return new THREE.CanvasTexture(c);
  }
  items.forEach(function (E) {
    const nb = E.inst.rooms.length;
    const tex = labelTex(E.item.name, E.set.title.split(':')[0] + ' · ' + nb + ' room(s)' + (E.item.residence ? ' · residence' : '') + (E.real ? '' : ' · planned walls only'));
    const w = Math.min(E.lot[0], 12), m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 120 / 640), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(E.ox, 0.03, ROAD_Z - 1.2); m.userData.label = true; scene.add(m);
  });

  /* ---------- cut-away: clip each building above its chosen storey (orbit only) */
  let cutOn = true, level = 0;
  /* a building's floors are its rooms' distinct floor heights (a stack of containers, each its own body, has
     several); storey k is the k-th from the ground; the cut is 1.5 m above it, and furniture above it hides */
  function floorsOf(E) {
    if (E.floors) return E.floors;
    const ys = E.inst.rooms.map(function (R) { return R.y; }).sort(function (a, b) { return a - b; }), out = [];
    ys.forEach(function (y) { if (!out.length || y - out[out.length - 1] > 0.6) out.push(y); });
    return (E.floors = out.length ? out : [0]);
  }
  function levelY(E) { const f = floorsOf(E); return f[Math.min(level, f.length - 1)]; }
  function levelTop(E) { return levelY(E) + 1.5; }
  function applyClip() {
    renderer.localClippingEnabled = true;
    items.forEach(function (E) {
      const on = cutOn && !ctl.walk;
      const plane = on ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), levelTop(E))] : [];
      if (E.shell) E.shell.traverse(function (o) { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.clippingPlanes = plane; }); });
      (E.overlayMats || []).forEach(function (m) { m.clippingPlanes = plane; });
      E.inst.rooms.forEach(function (R) {
        const P = plansById[R.id]; if (!P) return;
        const hide = on && R.y > levelY(E) + 0.6;
        (P.objects || []).forEach(function (g) { if (g) g.visible = !hide; });
      });
    });
  }

  /* ---------- the walk: where can a walker stand? support(x, z, y) -> floor height, or null (blocked) */
  const footprints = [];   /* { poly, y0, y1 } a body's outer face, or an explicit room grown by a wall */
  items.forEach(function (E) {
    E.inst.buildings.forEach(function (B) {
      const top = B.levels[B.levels.length - 1];
      footprints.push({ poly: B.outer, y0: B.y - 0.3, y1: top.y + top.h });
    });
    E.inst.rooms.forEach(function (R) { if (R.explicit) footprints.push({ poly: G.offset(R.poly, 0.3), y0: R.y - 0.3, y1: R.y + R.h, room: R }); });
  });
  const doorways = [];     /* a door's passage through its wall (a street door's reaches 1.4 m out): { room, rect, y } */
  rooms.forEach(function (R) {
    R.doors.forEach(function (d) {
      const W2 = R.walls[d.wall], t = W2.t, n = W2.n, hw = Math.max(0.3, d.w / 2 - 0.12);
      const c = d.at, out = d.to === 'street' ? 1.4 : 0.45, inn = 0.6;
      const rect = [[c[0] - t[0] * hw - n[0] * out, c[1] - t[1] * hw - n[1] * out], [c[0] + t[0] * hw - n[0] * out, c[1] + t[1] * hw - n[1] * out],
        [c[0] + t[0] * hw + n[0] * inn, c[1] + t[1] * hw + n[1] * inn], [c[0] - t[0] * hw + n[0] * inn, c[1] - t[1] * hw + n[1] * inn]];
      doorways.push({ room: R, rect: rect, y: R.y, street: d.to === 'street' });
    });
  });
  let curStair = null;      /* the flight the walker stood on last frame: it may move freely along it */
  function onStair(S, x, z, y) {
    const dx = x - S.foot[0], dz = z - S.foot[1];
    const along = dx * S.dir[0] + dz * S.dir[1], across = -dx * S.dir[1] + dz * S.dir[0];
    if (along < -0.35 || along > S.run + 0.35 || Math.abs(across) > S.w / 2) return null;
    const t = Math.max(0, Math.min(1, along / S.run)), sy = S.y0 + (S.y1 - S.y0) * t;
    return (S === curStair || Math.abs(sy - y) < 0.7) ? sy : null;
  }
  let lastStairHit = null;
  function support(x, z, y) {
    lastStairHit = null;
    for (const S of stairs) { const sy = onStair(S, x, z, y); if (sy != null) { lastStairHit = S; return sy; } }
    let inRoom = false;
    for (const R of rooms) {
      if (Math.abs(R.y - y) > STEP || !G.inside(R.poly, x, z)) continue;
      inRoom = true;
      const P = plansById[R.id], g = P && P.grid; if (!g) return R.y;
      const k = g.at(x, z);
      if (k >= 0 && g.walkable(k)) return R.y;
    }
    for (const D of doorways) if (G.inside(D.rect, x, z) && Math.abs(D.y - y) <= (D.street ? ENTER : STEP)) return D.y;
    if (inRoom) return null;
    /* a body's walls stand from the ground up to its top; a floor raised 1.5 m or more (stilts, piles) can be walked under */
    for (const F of footprints) if (y > F.y0 - 1.5 && y < F.y1 && G.inside(F.poly, x, z)) return null;
    return 0;   /* open ground (stepping off a raised doorway drops you to it) */
  }
  let floorY = 0, last = new THREE.Vector3(), walkLight = new THREE.PointLight(0xffd9a0, 0, 9, 2);
  scene.add(walkLight);
  window._onWalkChange = function (on) {
    if (on) {
      /* step out onto the road in front of the nearest building, facing it */
      let best = items[0], bd = Infinity;
      items.forEach(function (E) { const dd = Math.abs(E.ox - ctl.target.x); if (dd < bd) { bd = dd; best = E; } });
      walkTo(best);
    } else { walkLight.intensity = 0; }
    applyClip(); $('walkBtn').classList.toggle('on', on);
  };
  /* stand 2.4 m outside a building's first street door, facing in (G in walk mode: the next building's door) */
  function doorOf(E) {
    for (const R of E.inst.rooms) for (const d of R.doors) if (d.to === 'street') return { R: R, d: d };
    return null;
  }
  let doorIdx = -1;
  function walkToDoor(i) {
    const E = items[i], D = E && doorOf(E); if (!D) return false;
    if (!ctl.walk) { ctl.walk = true; }
    doorIdx = i;
    const n = D.R.walls[D.d.wall].n;                  /* inward normal */
    const x0 = D.d.at[0] - n[0] * 2.4, z0 = D.d.at[1] - n[1] * 2.4;
    floorY = support(x0, z0, D.R.y) != null ? support(x0, z0, D.R.y) : 0;
    if (floorY > 0.6 && support(x0, z0, 0) === 0) floorY = 0;
    ctl.target.set(x0, floorY + EYE, z0); ctl.az = Math.atan2(-n[0], -n[1]); ctl.el = 0.02;
    last.copy(ctl.target); updateCamera(); applyClip(); $('walkBtn').classList.toggle('on', true);
    return true;
  }
  function walkTo(E) {
    if (!ctl.walk) { ctl.walk = true; }
    floorY = 0;
    ctl.target.set(E.ox, EYE, ROAD_Z); ctl.az = 0; ctl.el = 0.05;
    last.copy(ctl.target); updateCamera(); applyClip(); $('walkBtn').classList.toggle('on', true);
  }
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (window.KratorSky) KratorSky.update(camera.position, 10.5, 200, 1.6);
    if (!ctl.walk) { assignLights(); return; }
    const nx = ctl.target.x, nz = ctl.target.z;
    let fy = support(nx, nz, floorY), hit = lastStairHit;
    if (fy != null) { last.x = nx; last.z = nz; }
    else {
      const fx = support(nx, last.z, floorY), hx = lastStairHit, fz = support(last.x, nz, floorY), hz = lastStairHit;   /* slide along a wall */
      if (fx != null) { last.x = nx; fy = fx; hit = hx; } else if (fz != null) { last.z = nz; fy = fz; hit = hz; } else { fy = floorY; hit = curStair; }
    }
    curStair = hit;
    if (curStair) floorY = fy;                       /* on a flight the feet follow it exactly */
    else { floorY += (fy - floorY) * 0.25; if (Math.abs(fy - floorY) < 0.01) floorY = fy; }
    ctl.target.set(last.x, floorY + EYE, last.z);
    updateCamera();
    walkLight.position.set(last.x, floorY + 2.1, last.z); walkLight.intensity = 0.9;
    const R = roomAt(last.x, last.z, floorY);
    $('where').textContent = R ? R.kind + ' · ' + R.id.replace(/^walk\./, '') + ' · storey ' + (R.level || 0) : 'outside';
  });
  function roomAt(x, z, y) { for (const R of rooms) if (Math.abs(R.y - y) < 0.6 && G.inside(R.poly, x, z)) return R; return null; }

  /* ---------- lights: the catalog's are stripped; a small pool lights the rooms nearest the camera */
  const pool = [];
  for (let i = 0; i < 6; i++) { const l = new THREE.PointLight(0xffc488, 0, 9, 2); scene.add(l); pool.push(l); }
  let poolFrame = 0;
  function assignLights() {
    if ((poolFrame++ % 15) !== 0) return;
    const tx = ctl.target.x, tz = ctl.target.z, cand = rooms.map(function (R, i) { return { i: i, d: Math.hypot(R.centroid[0] - tx, R.centroid[1] - tz) }; });
    cand.sort(function (a, b) { return a.d - b.d || a.i - b.i; });
    pool.forEach(function (l, k) { const c = cand[k]; if (!c || c.d > 40) { l.intensity = 0; return; } const R = rooms[c.i];
      l.position.set(R.centroid[0], R.y + Math.min(R.h, 2.4) * 0.8, R.centroid[1]); l.distance = 9; l.intensity = 0.8; });
  }

  /* ---------- sky */
  if (window.KratorSky) { KratorSky.attach(scene, 4200); KratorSky.update(camera.position, 10.5, 200, 1.6); scene.fog.color.copy(KratorSky.lighting().fog); }

  /* ---------- toolbar */
  const $ = function (id) { return document.getElementById(id); };
  const sel = $('roomSel');
  items.forEach(function (E, i) { const o = document.createElement('option'); o.value = String(i); o.textContent = E.set.set + ' · ' + E.item.name; sel.appendChild(o); });
  function gotoItem(i) {
    const E = items[i]; if (!E) return;
    if (ctl.walk) { ctl.walk = false; walkLight.intensity = 0; $('walkBtn').classList.remove('on'); }
    ctl.target.set(E.ox, 1.5, E.oz); ctl.dist = Math.max(14, Math.max(E.lot[0], E.lot[1]) * 1.25 + 4); ctl.az = 0.35; ctl.el = 0.9;
    updateCamera(); applyClip(); sel.value = String(i); report(i);
  }
  function overview() {
    if (ctl.walk) { ctl.walk = false; walkLight.intensity = 0; }
    ctl.target.set(W / 2 - 10, 0, 0); ctl.dist = Math.max(60, W * 0.55); ctl.az = 0.2; ctl.el = 0.85; updateCamera(); applyClip(); report(-1);
  }
  sel.onchange = function () { if (sel.value === '') overview(); else gotoItem(+sel.value); };
  function report(i) {
    const el = $('rep');
    const tot = plans.reduce(function (a, P) { return a + P.placements.length; }, 0);
    $('count').textContent = items.length + ' buildings · ' + rooms.length + ' rooms · ' + tot + ' pieces · seed ' + seed;
    if (i == null || i < 0) { el.innerHTML = '<span class="n">F walk (WASD, drag to look, Shift run): enter by the doors, climb the stairs; G jumps to the next front door. C cut-away · L storey · B planned walls · O outlines · T tags · R reseed.</span>'; return; }
    const E = items[i], h = ['<b>' + E.item.name + '</b> ' + E.item.key + ' · ' + E.set.title + (E.item.note ? '<br><span class="n">' + E.item.note + '</span>' : '')];
    E.inst.rooms.forEach(function (R) { const P = plansById[R.id]; h.push(R.kind + ' (storey ' + (R.level || 0) + ', ' + R.area.toFixed(1) + ' m²): <span class="n">' + P.placements.map(function (p) { return FURN_BY_KEY[p.key] ? FURN_BY_KEY[p.key].name : p.key; }).join(', ') + '</span>'); });
    el.innerHTML = h.join('<br>');
  }
  $('walkBtn').onclick = function () { window._setWalk(!ctl.walk); };
  function setCut(v) { cutOn = v; $('cutBtn').textContent = 'Cut-away: ' + (cutOn ? 'on' : 'off') + ' (C)'; $('cutBtn').classList.toggle('on', cutOn); applyClip(); }
  function setLevel(k) { level = k; $('levelBtn').textContent = 'Storey: ' + level + ' (L)'; applyClip(); }
  $('cutBtn').onclick = function () { setCut(!cutOn); };
  const maxFloors = function () { return Math.max.apply(null, items.map(function (E) { return floorsOf(E).length; })); };
  $('levelBtn').onclick = function () { setLevel((level + 1) % maxFloors()); };
  let showPlanned = false, outlines = [];
  function setPlanned(v) { showPlanned = v; planned.forEach(function (s) { s.visible = v; }); overlays.forEach(function (s) { s.visible = !v; }); items.forEach(function (E) { if (E.shell) E.shell.visible = !v; }); $('planBtn').classList.toggle('on', v); }
  $('planBtn').onclick = function () { setPlanned(!showPlanned); };
  function setOutline(v) {
    outlines.forEach(function (o) { scene.remove(o); }); outlines = [];
    if (v) rooms.forEach(function (R) { const o = IX.view.outline(R, plansById[R.id], { grid: false }); scene.add(o); outlines.push(o); });
    $('olBtn').classList.toggle('on', v);
  }
  $('olBtn').onclick = function () { setOutline(!outlines.length); };
  $('seedBtn').onclick = function () { seed++; $('seedBtn').textContent = 'Seed ' + seed + ' (R)'; furnish(); report(-1); };
  window.addEventListener('keydown', function (e) {
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (k === 'c') setCut(!cutOn); else if (k === 'l') setLevel((level + 1) % maxFloors()); else if (k === 'b') setPlanned(!showPlanned);
    else if (k === 'o') setOutline(!outlines.length); else if (k === 'r') $('seedBtn').onclick();
    else if (k === 'g' && ctl.walk) { let i = doorIdx; for (let n = 0; n < items.length; n++) { i = (i + 1) % items.length; if (walkToDoor(i)) break; } }
  });

  furnish();
  overview();
  window._interiors = {
    items: items, rooms: rooms, get plans() { return plans; }, get plansById() { return plansById; }, buildings: buildings, stairs: stairs,
    shells: planned, pickables: items.map(function (E) { return E.shell; }).filter(Boolean),
    catalog: catalog, gotoItem: gotoItem, overview: overview, walkTo: function (i) { walkTo(items[i]); }, walkToDoor: walkToDoor, support: support, setCut: setCut, setLevel: setLevel, setPlanned: setPlanned,
    stand: function (x, z, y, az) { if (!ctl.walk) ctl.walk = true; floorY = y || 0; ctl.target.set(x, floorY + EYE, z); ctl.az = az || 0; ctl.el = 0.1; last.copy(ctl.target); updateCamera(); applyClip(); },
    pose: function () { return { x: last.x, y: floorY, z: last.z, room: (roomAt(last.x, last.z, floorY) || {}).id || null }; }
  };
  window._ready = true;
})();
