// ================================================================= DRAW BASE — KTAGS registration + Harbour, Sub-Cliff, Park & Linear City
// 1. Registers the arcology and every part, vessel, and tree in core/tags (`AF_TAGS`) BEFORE drawing (`README.md`).
// 2. Registers inspector/probe volumes (`REGISTER`).
// 3. Draws Zone 1 (Multilevel Harbour Lift Platform, gantries, vessels, NW Marina, Sub-Cliff Works, Sealed Automated Vaults + KRUBBLE),
//    Zone 3 (Sheltered Central Park, Ribbed Amphitheatre, Arched Viaduct Bridges, trees), and Zone 4 (Southern Linear City & Drums).
const AF_TAGS = KTAGS.page = KTAGS.create({ build: 'arcoforte' });
const AF_DRAWN = { rubbleMeshes: [], vesselGroups: [], archTris: 0, archMeshes: 0 };

(function tagAndDrawBase() {
  const P = AF_PLAN, D = P.dim, A = AF_ACC;
  reseed(14810);
  KOFF = [0, 0, 0];

  // ---------------- 1. REGISTER EVERYTHING IN CORE/TAGS BEFORE DRAWING ----------------
  const rootStyle = P.state === 'intact' ? 'intact' : P.state === 'ruined' ? 'ruined' : 'kept';
  const TYPE_FOR = {
    harbour: ['infrastructure', 'industry'],
    marina: ['infrastructure'],
    industry: ['industry'],
    vault: ['industry', 'infrastructure'],
    civic: ['civic', 'market'],
    dwelling: ['dwelling-multi'],
    court: ['plaza'],
    pavilion: ['tavern', 'civic'],
    amphitheatre: ['civic', 'plaza'],
    bridge: ['infrastructure'],
    linear: ['dwelling-multi', 'market'],
    gate: ['civic', 'infrastructure'],
    rotunda: ['civic', 'inn', 'dwelling-multi'],
    tower: ['dwelling-multi', 'industry'],
    crown: ['civic', 'park'],
    pad: ['infrastructure']
  };

  const rootRec = AF_TAGS.add({
    id: P.id,
    'class': 'building',
    kind: 'arcology',
    key: 'ancients:arcoforte',
    name: 'Arcoforte — Sea-Cliff Arcology',
    at: [0, 0, 0],
    r: 340,
    h: D.H_MAX,
    tags: {
      culture: 'ancient',
      types: ['civic', 'dwelling-multi', 'industry', 'infrastructure'],
      state: P.state === 'ruined' ? 'ruined' : 'intact',
      style: rootStyle,
      landmark: true
    }
  });
  AF_DRAWN.rootId = rootRec.id;

  P.parts.forEach(pt => {
    const s = pt.shape;
    const cx = s[0] === 'box' ? (s[1] + s[2]) / 2 : s[1];
    const cz = s[0] === 'box' ? (s[3] + s[4]) / 2 : s[2];
    const sz = s[0] === 'box' ? [s[2] - s[1], s[4] - s[3], pt.h] : undefined;
    AF_TAGS.child(rootRec.id, Object.assign({
      id: pt.id,
      'class': 'part',
      kind: pt.kind,
      key: pt.id,
      name: pt.name,
      at: [cx, pt.y, cz],
      h: pt.h,
      tags: {
        culture: 'ancient',
        types: TYPE_FOR[pt.kind] || ['civic'],
        state: pt.state === 'ruined' ? 'ruined' : 'intact'
      },
      note: pt.sector.toUpperCase() + (pt.note ? ' — ' + pt.note : '')
    }, sz ? { size: sz } : { r: s[3] }));

    /* Register key volumes in the probe's REG list */
    const rad = s[0] === 'box' ? Math.max(12, Math.hypot(s[2] - s[1], s[4] - s[3]) * 0.45) : Math.max(10, s[3]);
    REGISTER({ name: pt.name + ' [' + pt.sector.toUpperCase() + ']', x: cx, y: pt.y, z: cz, r: rad, h: Math.max(4, pt.h) });
  });

  P.harbour.vessels.forEach(v => {
    AF_TAGS.child(rootRec.id, {
      id: v.id, 'class': 'prop', kind: 'vessel', key: 'af:fishing_vessel', name: 'Coastal Fishing & Salvage Vessel',
      at: [v.x, v.y, v.z], size: [v.B, v.L, 5.5],
      tags: { culture: 'post-apoc', types: ['infrastructure'] }
    });
  });

  P.trees.forEach(tr => {
    AF_TAGS.child(rootRec.id, {
      id: tr.id, 'class': 'flora', kind: 'tree', key: 'af:park_tree', name: 'Sheltered Park & Promenade Tree',
      at: [tr.x, tr.y, tr.z], h: tr.h,
      tags: { biome: 'coast', climate: 'temperate', aridity: 'mild', riparian: 'both' }
    });
  });

  // ---------------- 2. DRAW MULTILEVEL HARBOUR LIFT PLATFORM & NW MARINA ----------------
  const zHarbour = ARCOFORTE.zoneState('harbour');
  const zVaults = ARCOFORTE.zoneState('vaults');
  const zRing = ARCOFORTE.zoneState('ring');
  const zBastions = ARCOFORTE.zoneState('bastions');
  const KH = b => A.key(b, zHarbour);
  const KV = b => A.key(b, zVaults === 'intact' ? 'intact' : 'ruined');
  const KR = b => A.key(b, zRing);
  const KB = b => A.key(b, zBastions);

  const H = P.harbour;
  /* Sea caisson piers descending to seabed (-14 m) */
  for (const px of [-70, -46, -22, 22, 46, 70]) {
    for (const pz of [-328, -296, -264]) {
      if (Math.abs(px) > 58 && pz < -302) continue;
      A.box(KH('CONC'), px, -14, pz < -310 ? 14 : 23, pz, 7.5, 7.5, 0, KH('PAVE'), false);
    }
  }
  /* Stacked concrete harbour decks with central lift-well cutouts on Deck 0 & Deck 1 */
  H.decks.forEach((dk, di) => {
    if (di === 0) {
      /* Split around twin boat-lift slips at x = -34 and +34 (z = -334..-286) */
      A.box(KH('CONC'), 0, 3.2, dk.y, -266, dk.x1 - dk.x0, 40, 0, KH('PAVE'), KH('SOFF'));
      A.box(KH('CONC'), -62, 3.2, dk.y, -310, 28, 48, 0, KH('PAVE'), KH('SOFF'));
      A.box(KH('CONC'), 0, 3.2, dk.y, -310, 22, 48, 0, KH('PAVE'), KH('SOFF'));
      A.box(KH('CONC'), 62, 3.2, dk.y, -310, 28, 48, 0, KH('PAVE'), KH('SOFF'));
    } else {
      A.box(KH('SHELL'), 0, dk.y - 1.3, dk.y, (dk.z0 + dk.z1) / 2, dk.x1 - dk.x0, dk.z1 - dk.z0, 0, KH('PAVE'), KH('SOFF'));
    }
    /* Parapet curbs & bollards */
    A.box(KH('SHELL'), 0, dk.y, dk.y + 1.1, dk.z0 + 0.6, dk.x1 - dk.x0, 1.0, 0, KH('SHELL'), KH('SOFF'));
  });

  /* Twin Overhead Boat-Lift Gantries & Lifting Cradles */
  H.lifts.forEach(lf => {
    for (const sx of [-lf.w / 2, lf.w / 2]) {
      for (const sz of [lf.z0 + 4, (lf.z0 + lf.z1) / 2, lf.z1 - 4]) {
        kput('afBoxB', [lf.x + sx, 16.5, sz], null, [1.8, 25, 1.8], null);
      }
      /* Overhead gantry beam */
      kput('afBoxB', [lf.x + sx, 29.2, (lf.z0 + lf.z1) / 2], null, [2.0, 2.2, lf.z1 - lf.z0 + 4], null);
    }
    for (const sz of [lf.z0 + 4, (lf.z0 + lf.z1) / 2, lf.z1 - 4]) {
      kput('afBoxB', [lf.x, 30.4, sz], null, [lf.w + 3, 1.8, 2.0], null);
      /* Hoist cables down to boat cradle */
      const cabH = 29.5 - lf.cradleY;
      kput('afPostB', [lf.x - lf.w * 0.36, lf.cradleY + cabH / 2, sz], null, [0.16, cabH, 0.16], null);
      kput('afPostB', [lf.x + lf.w * 0.36, lf.cradleY + cabH / 2, sz], null, [0.16, cabH, 0.16], null);
    }
    /* Boat cradle platform */
    A.box(KH('BRONZE'), lf.x, lf.cradleY - 0.6, lf.cradleY, (lf.z0 + lf.z1) / 2, lf.w * 0.78, 30, 0, 'TIMBER', KH('SOFF'));
  });

  /* Coastal Fishing & Provision Vessels (one lifted in west cradle, others afloat) */
  H.vessels.forEach(v => {
    const vg = new THREE.Group();
    vg.position.set(v.x, v.y, v.z);
    vg.rotation.y = v.ry;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(v.B, 2.2, v.L * 0.78), MAT.afTimber);
    hull.position.y = 0.8;
    vg.add(hull);
    const prow = new THREE.Mesh(new THREE.ConeGeometry(v.B * 0.52, v.L * 0.28, 4), MAT.afTimber);
    prow.rotation.x = -Math.PI / 2;
    prow.rotation.z = Math.PI / 4;
    prow.position.set(0, 0.9, -v.L * 0.48);
    vg.add(prow);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(v.B * 0.64, 2.4, v.L * 0.28), MAT.afShell);
    cabin.position.set(0, 2.8, v.L * 0.1);
    vg.add(cabin);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 8.5, 6), MAT.afBronze);
    mast.position.set(0, 5.4, -v.L * 0.12);
    vg.add(mast);
    scene.add(vg);
    AF_DRAWN.vesselGroups.push({ rec: v, group: vg });
  });

  /* NW Marina Breakwater Mole, Quay & 4 Finger Piers */
  const M = H.marina;
  /* Outer L-shaped sea breakwater */
  A.box(KH('CONC'), (M.box[0] + M.box[1]) / 2, -6, M.y + 2.2, M.box[2] + 3, M.box[1] - M.box[0], 6.5, 0, KH('PAVE'), false);
  A.box(KH('CONC'), M.box[0] + 3, -6, M.y + 2.2, (M.box[2] + M.box[3]) / 2 + 10, 6.5, M.box[3] - M.box[2] - 18, 0, KH('PAVE'), false);
  /* Inner quay apron & finger piers */
  A.box(KH('CONC'), M.box[1] - 10, -3, M.y, (M.box[2] + M.box[3]) / 2, 20, M.box[3] - M.box[2], 0, KH('PAVE'), false);
  M.piers.forEach(pr => {
    A.box('TIMBER', (pr.x0 + pr.x1) / 2, pr.y - 0.5, pr.y, pr.z, pr.x1 - pr.x0, pr.w, 0, 'TIMBER', KH('SOFF'));
  });
  /* Marina stepped cliff ramp climbing proud along the outer cliff face to the West Wing (y = 3.5 -> 84 m) */
  for (let s = 0; s < 16; s++) {
    const t0 = s / 16, t1 = (s + 1) / 16, tm = (t0 + t1) / 2;
    const rx = -214 + 48 * tm, rz = ARCOFORTE.cliffZ(rx) - 3 + 44 * tm, ry = 3.5 + 80.5 * t1;
    A.box(KH('CONC'), rx, Math.max(0, ry - 9), ry, rz, 8.0, 8.5, -0.52, KH('PAVE'), false);
    kput('afPostB', [rx, ry + 0.65, rz - 3.6], null, [0.16, 1.3, 0.16], null);
  }

  // ---------------- 3. SUB-CLIFF FISHING WORKS, SEALED AUTOMATED VAULTS & INCLINED SHAFTS ----------------
  const SC = P.subcliff, wk = SC.works, av = SC.autoVaults;
  /* Fishing & Cold-Storage Hall: arched dock fronts on both harbour (-z) and Sub-Cliff Gallery Street (+z) */
  A.box(KH('CONC'), 0, wk.y0, wk.y1, (wk.box[2] + wk.box[3]) / 2, wk.box[1] - wk.box[0], wk.box[3] - wk.box[2], 0, KH('PAVE'), KH('SOFF'));
  for (let i = -3; i <= 3; i++) {
    const bx0 = i * 22 - 9, bx1 = i * 22 + 9;
    A.archBay(KH('SHELL'), [bx0, wk.box[2] - 0.5], [bx1, wk.box[2] - 0.5], wk.y0, wk.y1, wk.y0 + 8, 0.72, [0, 0, -1]);
    A.wall(KH('GLAZE'), [bx0 + 2, wk.box[2] - 0.25], [bx1 - 2, wk.box[2] - 0.25], wk.y0 + 3.5, wk.y0 + 13, [0, 0, -1], 8);
    A.archBay(KH('SHELL'), [bx1, wk.box[3] + 0.5], [bx0, wk.box[3] + 0.5], wk.y0, wk.y1, wk.y0 + 7.5, 0.72, [0, 0, 1]);
    A.wall(KH('GLAZE'), [bx1 - 2, wk.box[3] + 0.25], [bx0 + 2, wk.box[3] + 0.25], wk.y0 + 3.5, wk.y0 + 12.5, [0, 0, 1], 8);
    if (zHarbour === 'refurbished' && Math.abs(i) <= 2) {
      kput('afAwning', [i * 22, wk.y0 + 4.2, wk.box[2] - 3.0], null, [14, 1, 4.8], null);
      kput('afLamp', [i * 22, wk.y0 + 6.5, (wk.box[3] + av.box[2]) / 2], null, 1.1, null);
    }
  }

  /* Sealed / Ruined Automated Industry Vaults across the 12 m Sub-Cliff Gallery Street */
  A.box(KV('CONC'), 0, av.y0, av.y1, (av.box[2] + av.box[3]) / 2, av.box[1] - av.box[0], av.box[3] - av.box[2], 0, KV('CONC'), KV('SOFF'));
  /* Gated bronze bulkhead portal & dark silent turbine drums visible at the vault threshold */
  kput('afBoxB', [0, av.y0 + 4.5, av.box[2] - 0.4], null, [14, 9, 0.8], null);
  for (const tx of [-24, 24]) {
    A.frustum(KV('BRONZE'), tx, av.box[2] - 2.2, 3.8, 3.4, av.y0, av.y0 + 9.5, 12, false, KV('CONC'));
  }
  /* Dedicated Sub-Cliff Vault Ruin group + KRUBBLE collapse mounds seated on D.BENCH (y = 5.5 m), watched by core/ruins */
  const ruinGrp = new THREE.Group();
  ruinGrp.name = 'arcoforte:subcliff-vault-ruin';
  {
    const pierGeo = new THREE.BoxGeometry(16, 12, 6);
    pierGeo.translate(0, av.y0 + 6, av.box[2] - 3);
    const pierMesh = new THREE.Mesh(pierGeo, MAT.afConc);
    pierMesh.name = 'vault-bulkhead-body';
    ruinGrp.add(pierMesh);
    if (zVaults !== 'intact') {
      const fallenGeo = new THREE.BoxGeometry(7.5, 2.0, 4.4);
      fallenGeo.translate(-14, av.y0 + 1.0, av.box[2] - 4.5);
      const fallenMesh = new THREE.Mesh(fallenGeo, MAT.afShell);
      fallenMesh.name = 'vault-fallen-lintel';
      ruinGrp.add(fallenMesh);
    }
  }
  if (typeof KRUBBLE !== 'undefined' && av.rubble.length) {
    av.rubble.forEach((rb, ri) => {
      const H = KRUBBLE.heap({
        id: rb.id, x: rb.x, z: rb.z, y0: D.BENCH, rx: rb.r, rz: rb.r * 0.85, h: rb.h,
        blocks: 14, cover: 2.4, seed: 14840 + ri
      });
      const M = KRUBBLE.mesh(H, { cell: 2.5 });
      const rg = new THREE.BufferGeometry();
      rg.setAttribute('position', new THREE.BufferAttribute(M.pos, 3));
      rg.setAttribute('uv', new THREE.BufferAttribute(M.uv, 2));
      rg.setIndex(Array.isArray(M.idx) ? M.idx : Array.from(M.idx));
      rg.computeVertexNormals();
      const rm = new THREE.Mesh(rg, MAT.afConc);
      rm.name = 'arcoforte:rubble:' + rb.id;
      rm.userData.decor = true;
      ruinGrp.add(rm);
      AF_DRAWN.rubbleMeshes.push(rm);
      if (typeof KWALK !== 'undefined') {
        KRUBBLE.walkTris(H, 4).forEach(tri => KWALK.poly({ pts: tri, name: rb.id }));
      }
    });
  }
  scene.add(ruinGrp);
  AF_DRAWN.ruinVaultGroup = ruinGrp;

  /* Twin Inclined Cliff Cargo/Passenger Lift Housings (climbing from Sub-Cliff Works y=9.5 up to y=84 m) */
  SC.shafts.forEach(sh => {
    const steps = 14;
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps, t1 = (i + 1) / steps, tm = (t0 + t1) / 2;
      const sz = sh.z0 + (sh.z1 - sh.z0) * tm, sy = sh.y0 + (sh.y1 - sh.y0) * tm;
      A.box(KH('CONC'), sh.x, sy - 4.5, sy + 4.5, sz, sh.w, 7.2, 0, KH('SHELL'), KH('SOFF'));
      A.box(KH('GLAZE'), sh.x, sy + 1.0, sy + 4.8, sz, sh.w - 3, 5.4, 0, KH('GLAZE'), false);
    }
  });

  // ---------------- 4. SHELTERED CENTRAL PARK, AMPHITHEATRE, BRIDGES & TREES ----------------
  const PK = P.park, amp = PK.amphitheatre;
  /* Raked semicircular stone seating tiers + Soleri ribbed acoustic shell dome (Plate 1!) */
  for (let tier = 0; tier < 6; tier++) {
    const rIn = 8 + tier * 2.8, rOut = rIn + 2.7, ty = amp.y + 0.5 + tier * 1.1;
    const pts = [];
    for (let k = 0; k <= 14; k++) {
      const a = amp.ry - 1.35 + 2.7 * k / 14;
      pts.push([amp.x + rOut * Math.cos(a), amp.z + rOut * Math.sin(a)]);
    }
    for (let k = 14; k >= 0; k--) {
      const a = amp.ry - 1.35 + 2.7 * k / 14;
      pts.push([amp.x + rIn * Math.cos(a), amp.z + rIn * Math.sin(a)]);
    }
    A.prism(KR('PAVE'), pts, amp.y - 1.5, ty, KR('PAVE'), false);
  }
  /* Stage disc & acoustic shell ribs */
  A.frustum(KR('PAVE'), amp.x, amp.z, 8.2, 8.0, amp.y - 1.0, amp.y + 0.6, 20, false, KR('PAVE'));
  for (let k = 0; k <= 8; k++) {
    const a = amp.ry + Math.PI - 1.15 + 2.3 * k / 8;
    const rx = amp.x + 11 * Math.cos(a), rz = amp.z + 11 * Math.sin(a);
    kput('pierW', [rx, amp.y + 6.5, rz], qEuler(0.28 * Math.sin(a), -a, 0.28 * Math.cos(a)), [1.4, 13.5, 2.8], null);
  }
  /* Crown canopy of the acoustic shell */
  {
    const shellPts = [];
    for (let k = 0; k <= 12; k++) {
      const a = amp.ry + Math.PI - 1.2 + 2.4 * k / 12;
      shellPts.push([amp.x + 13 * Math.cos(a), amp.z + 13 * Math.sin(a)]);
    }
    shellPts.push([amp.x, amp.z]);
    A.prism(KR('SHELL'), shellPts, amp.y + 11.8, amp.y + 13.2, KR('BRONZE'), KR('SOFF'));
  }

  /* Two Arched Concrete Park Viaduct Footbridges */
  PK.bridges.forEach(br => {
    const dx = br.b[0] - br.a[0], dz = br.b[1] - br.a[1], L = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
    const mx = (br.a[0] + br.b[0]) / 2, mz = (br.a[1] + br.b[1]) / 2;
    A.box(KR('SHELL'), mx, br.y - 1.4, br.y, mz, br.w, L, yaw, KR('PAVE'), KR('SOFF'));
    /* Parapet rails & pier arches */
    for (const u of [0.2, 0.5, 0.8]) {
      const px = br.a[0] + dx * u, pz = br.a[1] + dz * u, gy = AF_STAGE.ground(px, pz);
      A.box(KR('CONC'), px, gy - 1, br.y - 1.3, pz, br.w * 0.72, 3.2, yaw, KR('CONC'), false);
      if (zRing !== 'ruined') kput('afLamp', [px, br.y + 2.6, pz], null, 1.0, null);
    }
  });

  /* Park & Promenade Trees (using kits/ancients `VEG.tree(x, y, z, species, h)` leaf-card system) */
  P.trees.forEach((tr, ti) => {
    if (typeof VEG !== 'undefined' && VEG.tree) {
      VEG.tree(tr.x, tr.y, tr.z, ti % 3, tr.h);
    } else {
      kput('postW', [tr.x, tr.y + tr.h * 0.35, tr.z], null, [0.35, tr.h * 0.7, 0.35], null);
    }
  });

  // ---------------- 5. SOUTHERN LINEAR CITY SPINE & THREE PLAZA DRUMS ----------------
  P.linearCity.bars.forEach(lb => {
    const cx = (lb.x0 + lb.x1) / 2, cz = (lb.z0 + lb.z1) / 2, bw = lb.x1 - lb.x0, bd = lb.z1 - lb.z0;
    /* Lower arcade colonnade + stepped upper residential tiers */
    A.box(KB('CONC'), cx, lb.y0 - 2, lb.y0 + 7.5, cz, bw, bd, 0, KB('PAVE'), KB('SOFF'));
    A.box(KB('SHELL'), cx, lb.y0 + 7.5, lb.y1 - 8, cz, bw - 3, bd - 4, 0, KB('PAVE'), KB('SOFF'));
    A.box(KB('SHELL'), cx, lb.y1 - 8, lb.y1, cz, bw - 9, bd - 10, 0, KB('TURF'), KB('SOFF'));
    /* Glazed ribbon bands facing both the central canal and outer plateau */
    for (const wy of [lb.y0 + 9.2, lb.y0 + 14.8, lb.y0 + 21.5]) {
      A.box(KB('GLAZE'), cx, wy, wy + 2.8, cz, bw - 2.2, bd - 6, 0, false, false);
    }
    /* Ground colonnade piers along the central canal avenue */
    const edgeX = lb.side === 'w' ? lb.x1 - 1.2 : lb.x0 + 1.2;
    for (let pz = lb.z0 + 8; pz <= lb.z1 - 8; pz += 14) {
      A.box(KB('CONC'), edgeX, lb.y0, lb.y0 + 7.5, pz, 2.2, 2.6, 0, false, false);
    }
  });

  /* Three Circular Plaza Bridge Drums spanning the 40 m central canal avenue */
  P.linearCity.drums.forEach(dr => {
    /* Bridge deck spanning between West & East Linear City bars */
    A.box(KB('SHELL'), dr.x, dr.y0 - 2.2, dr.y0, dr.z, D.LIN_GAP * 2 + 8, dr.r * 1.4, 0, KB('PAVE'), KB('SOFF'));
    /* Drum rotunda above the bridge */
    A.frustum(KB('SHELL'), dr.x, dr.z, dr.r, dr.r * 0.9, dr.y0, dr.y1 - 4, 20, false, KB('PAVE'));
    A.frustum(KB('GLAZE'), dr.x, dr.z, dr.r * 0.94, dr.r * 0.92, dr.y0 + 3, dr.y1 - 7, 20, false, false);
    A.frustum(KB('BRONZE'), dr.x, dr.z, dr.r * 0.92, 4.0, dr.y1 - 4, dr.y1, 20, false, KB('BRONZE'));
  });
})();
