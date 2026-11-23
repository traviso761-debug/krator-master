// ================================================================= DRUM — 8bg: Restored Inner Wall & Stacked-Vehicle Rampart Palisade ([draw])
// 1. Restored Ancient Inner Wall W1 (r=402m): grounded Ancient ceramic-concrete + Vothic basalt repairs, wall-walk deck,
//    crenellated merlons, 24 machicolated bastions with conical roofs, and 6 fenestrated twin-pylon gatehouses.
// 2. Outer Stacked-Vehicle Rampart Palisade W2 (r=636m): continuous 3-tier wall of ~780 jammed, tilted, overturned & nose-to-tail
//    KratorVehicles (buses, semi-haulers, dump trucks, APCs, vans, police cruisers, pods & saloons) pinned by driven steel H-beams,
//    interior timber defender catwalks, raking A-frame shores, and 5 upended-bus/container Scrap Gatehouses.

const DRUM_WALLS_GROUP = (function buildDrumWalls3D() {
  const root = new THREE.Group();
  root.name = 'drum_walls_root';
  scene.add(root);

  const deg = Math.PI / 180;
  const rng = KRAND.stream(KRAND.child(DRUM_SEED, 'drum_walls_3d_v2'));
  const buckets = {
    ancientStone: [], ancientDark: [], basalt: [], ashStone: [], porphyry: [],
    gold: [], bronze: [], rustPlate: [], tankSteel: [], verdigris: [],
    timber: [], floorTile: [], roofDeck: [], windowPane: [], windowLit: [], warmGlow: []
  };
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eu = new THREE.Euler(0, 0, 0, 'YXZ');
  const v3 = new THREE.Vector3();
  const s1 = new THREE.Vector3(1, 1, 1);

  function pushB(matName, geo) {
    if (!geo) return;
    (buckets[matName] || buckets.ashStone).push(geo);
  }
  function addBox(matName, x, y, z, w, h, d, ry, rz, rx) {
    eu.set(rx == null ? 0 : rx, ry == null ? 0 : ry, rz == null ? 0 : rz);
    q.setFromEuler(eu);
    v3.set(x, y + 0.5 * h, z);
    m4.compose(v3, q, s1);
    pushB(matName, DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(w, h, d), m4));
  }
  function addCyl(matName, x, y, z, rt, rb, h, segs, ry) {
    m4.makeRotationY(ry == null ? 0 : ry).setPosition(x, y + 0.5 * h, z);
    pushB(matName, DRUM_DRAW.bakeGeo(new THREE.CylinderGeometry(rt, rb, h, segs == null ? 10 : segs), m4));
  }
  function angDiff(a, b) {
    const d = Math.abs(((a % 360) + 360) % 360 - (((b % 360) + 360) % 360));
    return d > 180 ? 360 - d : d;
  }

  const innerGates = DRUM_PLAN.gates.filter(function (g) { return g.wall === 'inner_wall_ancient'; });
  const outerGates = DRUM_PLAN.gates.filter(function (g) { return g.wall === 'outer_palisade_scrap'; });

  // ----------------------------------------------------------------- 1. Restored Ancient Inner Wall W1 (r = 402 m)
  const W1_R = 402.0;
  const N1 = 144;
  for (let i = 0; i < N1; i++) {
    const d0 = (360 * i) / N1, d1 = (360 * (i + 1)) / N1, dm = 0.5 * (d0 + d1);
    const a = dm * deg, ca = Math.cos(a), sa = Math.sin(a);
    const mx = W1_R * ca, mz = W1_R * sa;
    if (DRUM.inRiverCorridor(mx, mz, 2)) continue;
    let atGate = false;
    for (let g = 0; g < innerGates.length; g++) {
      if (angDiff(dm, innerGates[g].deg) < 1.65) atGate = true;
    }
    if (atGate) continue;

    const arcLen = (W1_R * (d1 - d0) * deg) + 0.32;
    const yaw = -a;
    const patched = (angDiff(dm, 20) < 34) || (rng.next() < 0.24);
    // Grounded battered plinth base (y = -0.35 .. +1.65 m)
    addBox('ancientDark', mx, -0.35, mz, 10.6, 2.0, arcLen + 0.1, yaw);
    if (patched) {
      // Vothic battered basalt & ash-stone breach repair over Ancient lower stump
      addBox('ancientStone', mx, 1.65, mz, 9.8, 3.2, arcLen, yaw);
      addBox('basalt', mx, 4.85, mz, 8.8, 5.55, arcLen, yaw);
      // Flagstone wall-walk deck (y = 10.40 m) + inner guard kerb + outer crenellated merlons
      addBox('floorTile', (W1_R - 0.6) * ca, 10.40, (W1_R - 0.6) * sa, 6.2, 0.28, arcLen, yaw);
      addBox('ashStone', (W1_R - 3.9) * ca, 10.68, (W1_R - 3.9) * sa, 0.55, 1.05, arcLen, yaw);
      addBox('ashStone', (W1_R + 3.8) * ca, 10.40, (W1_R + 3.8) * sa, 1.25, 0.95, arcLen, yaw);
      for (let m = -1; m <= 1; m++) {
        const md = (dm + m * 0.72) * deg;
        addBox('basalt', (W1_R + 3.8) * Math.cos(md), 11.35, (W1_R + 3.8) * Math.sin(md), 1.25, 1.05, 3.2, -md);
      }
    } else {
      // Standing worn Ancient ceramic-concrete curtain + stringcourse cornice + crenellated merlons
      addBox('ancientStone', mx, 1.65, mz, 9.4, 8.95, arcLen, yaw);
      addBox('ancientDark', (W1_R + 4.5) * ca, 9.85, (W1_R + 4.5) * sa, 0.85, 0.55, arcLen, yaw);
      addBox('floorTile', (W1_R - 0.5) * ca, 10.60, (W1_R - 0.5) * sa, 6.4, 0.28, arcLen, yaw);
      addBox('ancientDark', (W1_R - 3.9) * ca, 10.88, (W1_R - 3.9) * sa, 0.55, 1.05, arcLen, yaw);
      addBox('ancientStone', (W1_R + 4.0) * ca, 10.60, (W1_R + 4.0) * sa, 1.2, 0.95, arcLen, yaw);
      for (let m = -1; m <= 1; m++) {
        const md = (dm + m * 0.72) * deg;
        addBox('ancientStone', (W1_R + 4.0) * Math.cos(md), 11.55, (W1_R + 4.0) * Math.sin(md), 1.2, 1.15, 3.4, -md);
      }
    }
  }

  // 24 Machicolated Bastion Towers on W1 (grounded at y=-0.35m, watch-slit windows, conical roofDeck/verdigris caps)
  for (let b = 0; b < 24; b++) {
    const bd = (360 * b) / 24 + 7.5;
    const ba = bd * deg, ca = Math.cos(ba), sa = Math.sin(ba);
    const bx = (W1_R + 3.6) * ca, bz = (W1_R + 3.6) * sa;
    if (DRUM.inRiverCorridor(bx, bz, 4)) continue;
    let skip = false;
    for (let g = 0; g < innerGates.length; g++) if (angDiff(bd, innerGates[g].deg) < 4.0) skip = true;
    if (skip) continue;
    addCyl('ancientDark', bx, -0.35, bz, 7.2, 7.8, 2.4, 10, -ba);
    addCyl(b % 3 === 1 ? 'basalt' : 'ancientStone', bx, 2.05, bz, 6.3, 7.0, 10.8, 10, -ba);
    addCyl('ancientDark', bx, 12.85, bz, 6.9, 6.3, 1.1, 10, -ba);
    // Watch-chamber slit windows on outer bastion face
    for (let w = -1; w <= 1; w++) {
      const wa = ba + w * 0.38;
      addBox(w === 0 ? 'windowLit' : 'windowPane', bx + 6.35 * Math.cos(wa), 8.6, bz + 6.35 * Math.sin(wa), 0.35, 1.9, 0.72, -wa);
    }
    if (b % 2 === 0) {
      addCyl(b % 4 === 0 ? 'verdigris' : 'roofDeck', bx, 13.95, bz, 0.35, 7.3, 3.6, 10, -ba);
    } else {
      addCyl('tankSteel', bx, 13.95, bz, 5.2, 5.8, 1.5, 10, -ba);
    }
  }

  // 6 Inner Wall Gatehouses (Twin Fenestrated Pylons + Pitched Roofs + Portcullis Reveal + Vothic Banner & Gold Diamond)
  for (let g = 0; g < innerGates.length; g++) {
    const gt = innerGates[g];
    const ga = gt.deg * deg, ca = Math.cos(ga), sa = Math.sin(ga);
    const yaw = -ga + 0.5 * Math.PI;
    for (let s = -1; s <= 1; s += 2) {
      const tx = gt.x + s * 6.9 * (-sa), tz = gt.z + s * 6.9 * ca;
      addBox('ancientDark', tx, -0.35, tz, 6.0, 2.2, 14.8, yaw);
      addBox('ancientStone', tx, 1.85, tz, 5.5, 12.6, 14.0, yaw);
      addBox('basalt', tx, 14.45, tz, 6.1, 1.25, 14.6, yaw);
      // Pitched standing-seam roof cap on each gatehouse tower
      addBox('roofDeck', tx - 1.3 * s * (-sa), 15.70, tz - 1.3 * s * ca, 3.6, 0.35, 15.0, yaw, s * 0.32);
      addBox('roofDeck', tx + 1.3 * s * (-sa), 15.70, tz + 1.3 * s * ca, 3.6, 0.35, 15.0, yaw, -s * 0.32);
      // Mullioned guard-chamber windows on outer & inner faces
      for (let face = -1; face <= 1; face += 2) {
        const wx = tx + face * 7.08 * ca, wz = tz + face * 7.08 * sa;
        addBox('basalt', wx, 8.6, wz, 2.2, 2.6, 0.36, yaw);
        addBox('windowLit', wx + face * 0.08 * ca, 8.85, wz + face * 0.08 * sa, 1.65, 2.05, 0.24, yaw);
        addBox('tankSteel', wx + face * 0.14 * ca, 8.85, wz + face * 0.14 * sa, 0.14, 2.05, 0.28, yaw);
      }
    }
    // Over-portal bridge chamber + pitched roof + portcullis iron frame + Vothic porphyry banner + gold diamond seal
    addBox('basalt', gt.x, 9.2, gt.z, 19.4, 4.8, 13.4, yaw);
    addBox('roofDeck', gt.x, 14.0, gt.z, 19.8, 0.45, 14.0, yaw);
    addBox('windowLit', gt.x - 6.8 * ca, 10.5, gt.z - 6.8 * sa, 4.2, 1.8, 0.28, yaw);
    addBox('porphyry', gt.x + 6.85 * ca, 9.8, gt.z + 6.85 * sa, 4.8, 3.4, 0.45, yaw);
    const dM = new THREE.Matrix4().makeRotationZ(0.25 * Math.PI);
    const pM = new THREE.Matrix4().makeRotationY(yaw).multiply(dM).setPosition(gt.x + 7.18 * ca, 11.5, gt.z + 7.18 * sa);
    pushB('gold', DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(1.75, 1.75, 0.35), pM));
  }

  // ----------------------------------------------------------------- 2. Outer Stacked-Vehicle Rampart Palisade W2 (r = 636 m)
  // Instead of an opaque slab with isolated cars strewn in front, W2 is a genuine 3-course continuous wall of ~780 stacked,
  // crushed, tilted, and overturned Ancient Valley vehicles locked between driven steel H-beam pilings and raking interior shores!
  const W2_R = 636.0;
  function w2SkipDeg(dm) {
    const d = ((dm % 360) + 360) % 360;
    if (d >= 296.0 && d <= 344.0) return true; // NW Drim Rivrh bank
    for (let g = 0; g < outerGates.length; g++) {
      if (angDiff(d, outerGates[g].deg) < 1.60) return true;
    }
    return false;
  }

  // 2a. Driven steel H-beam pilings, low earth-and-tyre crib berm, raking interior A-frame shores & continuous defender catwalk
  const N2 = 180;
  for (let i = 0; i < N2; i++) {
    const d0 = (360 * i) / N2, d1 = (360 * (i + 1)) / N2, dm = 0.5 * (d0 + d1);
    if (w2SkipDeg(dm)) continue;
    const a = dm * deg, ca = Math.cos(a), sa = Math.sin(a);
    const yaw = -a;
    const arcLen = (W2_R * (d1 - d0) * deg) + 0.25;

    // Grounded compacted rubble/tyre crib toe-berm + recessed inner crushed-scrap/tyre core crib (w=2.1m inside the 5.2m-wide vehicle stack so ZERO daylight leaks!)
    addBox('basalt', W2_R * ca, -0.28, W2_R * sa, 5.2, 0.72, arcLen, yaw);
    addBox(i % 2 === 0 ? 'rustPlate' : 'tankSteel', W2_R * ca, 0.44, W2_R * sa, 2.1, 3.25, arcLen * 0.96, yaw);

    // Driven steel I-beam / pipe pilings clamping both faces of the stacked vehicle wall
    const postH = 6.2 + (i % 3) * 0.55;
    addBox('tankSteel', (W2_R + 2.45) * ca, -0.30, (W2_R + 2.45) * sa, 0.36, postH, 0.40, yaw, 0.04);
    addBox('rustPlate', (W2_R - 2.45) * ca, -0.30, (W2_R - 2.45) * sa, 0.36, postH - 0.3, 0.40, yaw, -0.03);
    // Horizontal steel tie-cable / girder walers binding the vehicle courses
    addBox('rustPlate', (W2_R + 2.52) * ca, 2.22, (W2_R + 2.52) * sa, 0.18, 0.26, arcLen, yaw);
    addBox('tankSteel', (W2_R - 2.52) * ca, 4.10, (W2_R - 2.52) * sa, 0.22, 0.28, arcLen, yaw);

    // Continuous interior timber defender catwalk at r = 631.5 m, y = 3.75 m + raking timber shores to ground!
    addBox('timber', (W2_R - 4.4) * ca, 3.75, (W2_R - 4.4) * sa, 2.6, 0.28, arcLen, yaw);
    addBox('timber', (W2_R - 5.55) * ca, 4.03, (W2_R - 5.55) * sa, 0.22, 1.05, arcLen, yaw);
    if (i % 2 === 0) {
      addBox('timber', (W2_R - 4.4) * ca, -0.25, (W2_R - 4.4) * sa, 0.32, 4.05, 0.32, yaw);
      addBox('tankSteel', (W2_R - 5.7) * ca, -0.20, (W2_R - 5.7) * sa, 0.28, 4.65, 0.28, yaw, 0.48);
    }
    if (i % 9 === 0) {
      addBox('timber', (W2_R - 6.5) * ca, -0.10, (W2_R - 6.5) * sa, 0.85, 4.2, 1.2, yaw, 0.32);
      addBox('roofDeck', (W2_R - 4.2) * ca, 6.35, (W2_R - 4.2) * sa, 3.6, 0.26, 4.4, yaw, -0.10);
      addBox('timber', (W2_R - 5.4) * ca, 4.03, (W2_R - 5.4) * sa, 0.18, 2.35, 0.18, yaw);
      addBox('warmGlow', (W2_R - 4.1) * ca, 5.95, (W2_R - 4.1) * sa, 0.45, 0.32, 0.45, yaw);
    }
  }

  // 2b. 5 Outer Scrap Voth Palisade Gatehouses (Flanked by Twin Upended Bus/Truck Pylons + Overhead Shipping-Container Bridge!)
  const gatePylonPlacements = [];
  for (let g = 0; g < outerGates.length; g++) {
    const gt = outerGates[g];
    const ga = gt.deg * deg, ca = Math.cos(ga), sa = Math.sin(ga);
    const yaw = -ga + 0.5 * Math.PI;
    for (let s = -1; s <= 1; s += 2) {
      const tx = gt.x + s * 6.4 * (-sa), tz = gt.z + s * 6.4 * ca;
      addBox('basalt', tx, -0.35, tz, 5.2, 4.8, 9.6, yaw);
      addBox('rustPlate', tx, 4.45, tz, 4.6, 4.8, 8.8, yaw);
      addBox('roofDeck', tx, 11.4, tz, 5.4, 0.38, 9.4, yaw);
      addBox('windowLit', tx + 4.45 * ca, 6.4, tz + 4.45 * sa, 1.4, 1.5, 0.25, yaw);
      gatePylonPlacements.push({
        kvKey: s < 0 ? 'anc_tram' : 'anc_hauler',
        state: 'wreck',
        vVar: (g + (s < 0 ? 0 : 1)) % 2,
        x: tx + 3.2 * ca + s * 1.4 * (-sa),
        y: 4.8,
        z: tz + 3.2 * sa + s * 1.4 * ca,
        rx: 0.47 * Math.PI,
        ry: yaw + s * 0.12,
        rz: s * 0.06,
        scale: 1.12
      });
    }
    addBox('tankSteel', gt.x, 6.8, gt.z, 17.8, 3.2, 8.6, yaw);
    addBox('roofDeck', gt.x, 10.0, gt.z, 18.4, 0.36, 9.2, yaw);
    addBox('porphyry', gt.x + 4.45 * ca, 7.2, gt.z + 4.45 * sa, 4.2, 2.5, 0.38, yaw);
    const dM = new THREE.Matrix4().makeRotationZ(0.25 * Math.PI);
    const pM = new THREE.Matrix4().makeRotationY(yaw).multiply(dM).setPosition(gt.x + 4.72 * ca, 8.45, gt.z + 4.72 * sa);
    pushB('gold', DRUM_DRAW.bakeGeo(new THREE.BoxGeometry(1.45, 1.45, 0.30), pM));
  }

  Object.keys(buckets).forEach(function (matKey) {
    const list = buckets[matKey];
    if (!list.length) return;
    const mesh = new THREE.Mesh(DRUM_DRAW.mergeGeoList(list), DRUM_DRAW.MATS[matKey]);
    mesh.name = 'drum_wall_' + matKey;
    root.add(mesh);
  });

  // ----------------------------------------------------------------- 3. Continuous Bumper-to-Bumper 3-Course Stacked-Vehicle Rampart (~1,420 KratorVehicles!)
  const VEH_MAP = {
    bus_transit: 'anc_tram',
    truck_semi: 'anc_hauler',
    truck_dump: 'anc_utility',
    truck_cargo: 'anc_hauler',
    van_step: 'anc_van',
    van_panel: 'anc_van',
    apc_wheeled: 'anc_tank',
    car_sedan: 'anc_saloon'
  };
  let vehicleCount = 0;
  if (typeof KratorVehicles !== 'undefined') {
    KratorVehicles.setDetail(0.36);
    const fm = DRUM_DRAW.getFurnDetailMaps();
    const protoMap = new Map();

    function getCompactProtoParts(kvKey, st, vVar) {
      const pKey = kvKey + '|' + st + '|' + vVar;
      if (protoMap.has(pKey)) return pKey;
      const grp = KratorVehicles.build(kvKey, { variant: vVar, seed: 4100 + protoMap.size * 37, state: st });
      if (!grp) return null;
      const raw = DRUM_DRAW.extractProtoParts(grp);
      const byMat = new Map();
      for (let i = 0; i < raw.length; i++) {
        const pt = raw[i];
        let g = pt.geo;
        if (!g.attributes.uv) {
          const p = g.attributes.position, n = g.attributes.normal;
          const uv = new Float32Array(p.count * 2);
          for (let vi = 0; vi < p.count; vi++) {
            const ax = n ? Math.abs(n.getX(vi)) : 0, ay = n ? Math.abs(n.getY(vi)) : 1, az = n ? Math.abs(n.getZ(vi)) : 0;
            if (ay >= ax && ay >= az) { uv[vi * 2] = p.getX(vi) / 2.2; uv[vi * 2 + 1] = p.getZ(vi) / 2.2; }
            else if (ax >= az) { uv[vi * 2] = p.getZ(vi) / 2.2; uv[vi * 2 + 1] = p.getY(vi) / 2.2; }
            else { uv[vi * 2] = p.getX(vi) / 2.2; uv[vi * 2 + 1] = p.getY(vi) / 2.2; }
          }
          g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        }
        let m = pt.mat;
        if (m && !m.map && !m.isMeshBasicMaterial) {
          if (!m.userData._drumTexMat) {
            const cm = m.clone();
            cm.map = fm.map;
            cm.roughnessMap = fm.roughnessMap;
            cm.needsUpdate = true;
            m.userData._drumTexMat = cm;
          }
          m = m.userData._drumTexMat;
        }
        let b = byMat.get(m);
        if (!b) { b = []; byMat.set(m, b); }
        b.push(g);
      }
      const mergedParts = [];
      byMat.forEach(function (geos, mat) {
        const mg = DRUM_DRAW.mergeGeoList(geos);
        if (mg) mergedParts.push({ geo: mg, mat: mat });
      });
      protoMap.set(pKey, mergedParts);
      return pKey;
    }

    const placements = [];
    function pushVeh(kvKey, st, vVar, x, y, z, rx, ry, rz, scale, degAng) {
      const pKey = getCompactProtoParts(kvKey, st, vVar);
      if (!pKey) return;
      const quad = Math.floor((((degAng % 360) + 360) % 360) / 90) % 4;
      placements.push({ protoKey: pKey, quad: quad, x: x, y: y, z: z, rx: rx, ry: ry, rz: rz, scale: scale });
      vehicleCount++;
    }

    // Course 1A: All 118 layout-registered palisadeVehicles seated in the heavy base course
    const occupiedC1 = [];
    for (let i = 0; i < DRUM_PLAN.palisadeVehicles.length; i++) {
      const pv = DRUM_PLAN.palisadeVehicles[i];
      if (w2SkipDeg(pv.deg)) continue;
      let kvKey = VEH_MAP[pv.vehicleKey] || 'anc_tram';
      if (kvKey === 'anc_saloon') kvKey = (i % 2 === 0) ? 'anc_van' : 'anc_utility';
      const st = (pv.state === 'burnt' || pv.state === 'weathered' || pv.state === 'wreck') ? pv.state : 'wreck';
      const a = pv.deg * deg;
      occupiedC1.push(pv.deg);
      pushVeh(
        kvKey, st, i % 2,
        (W2_R + rng.range(-0.55, 0.65)) * Math.cos(a),
        0.34 + rng.range(-0.06, 0.12),
        (W2_R + rng.range(-0.55, 0.65)) * Math.sin(a),
        rng.range(-0.08, 0.08),
        0.5 * Math.PI - a + rng.range(-0.12, 0.12),
        rng.range(-0.11, 0.11),
        1.20,
        pv.deg
      );
    }

    // Course 1B: Tight bumper-to-bumper heavy chassis infill (every 0.54 deg = ~6.0m arc) — ZERO gaps along the base!
    const heavyKeys = ['anc_tram', 'anc_hauler', 'anc_utility', 'anc_tank', 'anc_van', 'anc_hauler', 'anc_tram', 'anc_utility'];
    const states = ['wreck', 'burnt', 'weathered'];
    let idx1 = 0;
    for (let dm = 0.25; dm < 360.0; dm += 0.54) {
      if (w2SkipDeg(dm)) continue;
      let nearExisting = false;
      for (let k = 0; k < occupiedC1.length; k++) {
        if (angDiff(dm, occupiedC1[k]) < 0.34) { nearExisting = true; break; }
      }
      if (nearExisting) continue;
      const a = dm * deg;
      const kvKey = heavyKeys[idx1 % heavyKeys.length];
      const st = states[(idx1 * 3) % states.length];
      const flip = (idx1 % 2 === 0) ? 0 : Math.PI;
      const rShift = (idx1 % 2 === 0 ? 0.55 : -0.45) + rng.range(-0.25, 0.25);
      pushVeh(
        kvKey, st, idx1 % 2,
        (W2_R + rShift) * Math.cos(a),
        0.34 + rng.range(-0.06, 0.14),
        (W2_R + rShift) * Math.sin(a),
        rng.range(-0.09, 0.09),
        0.5 * Math.PI - a + flip + rng.range(-0.14, 0.14),
        rng.range(-0.12, 0.12),
        1.20,
        dm
      );
      idx1++;
    }

    // Course 2: Dense Mid Stacked, Tilted & Overturned Vehicle Course (every 0.58 deg = ~6.4m arc -> ~515 jammed vehicles!)
    const midKeys = ['anc_van', 'anc_utility', 'anc_tram', 'anc_saloon', 'anc_hauler', 'anc_police', 'anc_tank', 'anc_pod'];
    let idx2 = 0;
    for (let dm = 0.15; dm < 360.0; dm += 0.58) {
      if (w2SkipDeg(dm)) continue;
      const a = dm * deg;
      const kvKey = midKeys[idx2 % midKeys.length];
      const st = states[(idx2 + 1) % states.length];
      const poseRoll = idx2 % 5;
      let rz = rng.range(-0.22, 0.22);
      let yLift = 2.15 + rng.range(-0.12, 0.22);
      if (poseRoll === 1) {
        rz = Math.PI + rng.range(-0.20, 0.20);
        yLift = 3.55 + rng.range(-0.10, 0.16);
      } else if (poseRoll === 3) {
        rz = (idx2 % 2 === 0 ? 1 : -1) * 0.46 * Math.PI + rng.range(-0.12, 0.12);
        yLift = 2.85 + rng.range(-0.10, 0.15);
      }
      const flip = (idx2 % 3 === 0) ? Math.PI : 0;
      const rShift = (idx2 % 2 === 0 ? -0.40 : 0.48) + rng.range(-0.25, 0.25);
      pushVeh(
        kvKey, st, idx2 % 2,
        (W2_R + rShift) * Math.cos(a),
        yLift,
        (W2_R + rShift) * Math.sin(a),
        rng.range(-0.16, 0.16),
        0.5 * Math.PI - a + flip + rng.range(-0.20, 0.20),
        rz,
        1.16,
        dm
      );
      idx2++;
    }

    // Course 3: Continuous Interlocking Crest Breastwork Course (every 0.68 deg = ~7.5m arc -> ~440 vehicles crowning the rampart!)
    const topKeys = ['anc_van', 'anc_saloon', 'anc_police', 'anc_utility', 'anc_pod', 'anc_tank'];
    let idx3 = 0;
    for (let dm = 0.42; dm < 360.0; dm += 0.68) {
      if (w2SkipDeg(dm)) continue;
      const a = dm * deg;
      const kvKey = topKeys[idx3 % topKeys.length];
      const st = states[(idx3 + 2) % states.length];
      const upside = (idx3 % 3 === 1);
      const rz = upside ? (Math.PI + rng.range(-0.24, 0.24)) : rng.range(-0.28, 0.28);
      const yTop = upside ? (4.95 + rng.range(-0.14, 0.18)) : (3.85 + rng.range(-0.14, 0.22));
      pushVeh(
        kvKey, st, idx3 % 2,
        (W2_R + rng.range(-0.45, 0.45)) * Math.cos(a),
        yTop,
        (W2_R + rng.range(-0.45, 0.45)) * Math.sin(a),
        rng.range(-0.20, 0.20),
        0.5 * Math.PI - a + (idx3 % 2 === 0 ? 0 : Math.PI) + rng.range(-0.26, 0.26),
        rz,
        1.14,
        dm
      );
      idx3++;
    }

    // Upended vertical Gate Pylon buses & semi-haulers flanking the 5 Outer Palisade Gates
    for (let gp = 0; gp < gatePylonPlacements.length; gp++) {
      const p = gatePylonPlacements[gp];
      const gDeg = ((Math.atan2(p.z, p.x) / deg) + 360) % 360;
      pushVeh(p.kvKey, p.state, p.vVar, p.x, p.y, p.z, p.rx, p.ry, p.rz, p.scale, gDeg);
    }

    // Emit quadrant-chunked InstancedMeshes (low memory, frustum-culled per 90-deg arc, zero EXPORT issues!)
    const byQuadProto = new Map();
    for (let i = 0; i < placements.length; i++) {
      const pl = placements[i];
      const qk = pl.quad + '::' + pl.protoKey;
      let list = byQuadProto.get(qk);
      if (!list) { list = []; byQuadProto.set(qk, list); }
      list.push(pl);
    }

    byQuadProto.forEach(function (list, qk) {
      const protoKey = qk.split('::')[1];
      const parts = protoMap.get(protoKey);
      if (!parts || !list.length) return;
      let cx = 0, cy = 0, cz = 0;
      for (let i = 0; i < list.length; i++) {
        cx += list[i].x; cy += list[i].y; cz += list[i].z;
      }
      cx /= list.length; cy /= list.length; cz /= list.length;
      let rMax = 12.0;
      for (let i = 0; i < list.length; i++) {
        const d = Math.hypot(list[i].x - cx, list[i].y - cy, list[i].z - cz) + 14.0;
        if (d > rMax) rMax = d;
      }
      const qSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), rMax);
      for (let pi = 0; pi < parts.length; pi++) {
        const pt = parts[pi];
        const qGeo = pt.geo.clone();
        qGeo.boundingSphere = qSphere;
        const im = new THREE.InstancedMesh(qGeo, pt.mat, list.length);
        im.name = 'drum_w2_veh_' + qk.replace(/\|/g, '_') + '_' + pi;
        im.userData.palisadeVehicle = true;
        for (let i = 0; i < list.length; i++) {
          const pl = list[i];
          eu.set(pl.rx, pl.ry, pl.rz);
          q.setFromEuler(eu);
          s1.set(pl.scale, pl.scale, pl.scale);
          v3.set(pl.x, pl.y, pl.z);
          m4.compose(v3, q, s1);
          im.setMatrixAt(i, m4);
        }
        im.instanceMatrix.needsUpdate = true;
        root.add(im);
      }
      s1.set(1, 1, 1);
    });
  }
  root.userData.palisadeVehicleCount = vehicleCount;

  return root;
})();
