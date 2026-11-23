// prefix: ec
// ================================================================= SHUANG-ZHA — World assembly on kits/transit: KDRAWN terrain, 4-pound core/water,
// KCANAL miter-lock chambers, end-to-end lock-transiting barges, KMASK road raster, KWALK towpaths & NW-lowlands flora ([draw] + [web])

if (typeof groundM !== 'undefined' && groundM) {
  scene.remove(groundM);
}
camera.far = 28000;
camera.updateProjectionMatrix();
skyCam.far = 28000;
skyCam.updateProjectionMatrix();
scene.fog.density = 0.00014;
{
  var sc = sun.shadow.camera;
  sc.left = -210; sc.right = 210; sc.top = 210; sc.bottom = -210; sc.near = 10; sc.far = 950;
  sc.updateProjectionMatrix();
}

autoViews = function () { return EC_VIEWS; };

/* Lock clock control: ?lockPhase=<sec> freezes or initializes the 1080 s (3 x 360 s) hydraulic transit cycle.
   Default t = 28.0 s frames ves.barge.lock.L1.0 gliding right through the open bronze miter gates into L1a_low! */
var EC_LOCK_PIN = qs.get('lockPhase') !== null ? +qs.get('lockPhase') : null;
var EC_LOCK_T = EC_LOCK_PIN !== null ? EC_LOCK_PIN : 28.0;

var EC_PLAN = null;
var EC_WATER_RECS = { open: null, still: [], locks: [], flows: [], fall: null };
var EC_GATE_LEAVES = [];
var EC_MOORED_HULLS = [];
var EC_MOVING_HULLS = [];
var EC_FLORA_STATS = null;

function ecRegisterWorldGroup(world, grp, cls, kind, key, name, x, y, z, ry, w, d, h, tagsObj, fragPath) {
  grp.position.set(x, y, z);
  grp.rotation.y = ry;
  world.add(grp);
  var tid = null;
  if (SVTAGS) {
    tid = SVTAGS.add({
      'class': cls,
      kind: kind,
      key: key,
      name: name,
      at: [x, y, z],
      ry: ry,
      size: [w, d, h],
      tags: Object.assign({ culture: 'eternian' }, tagsObj || { types: ['infrastructure'] }),
      frag: fragPath || 'kits/transit/src/70-tr-canal-draw.js'
    }).id;
    grp.userData.tid = tid;
  }
  var bb = new THREE.Box3().setFromObject(grp);
  REG.push({
    key: key,
    name: name,
    cls: cls,
    x: x, y: y, z: z, ry: ry,
    tid: tid,
    decl: { w: w, d: d, h: h, budget: 48000 },
    bbox: { mn: [bb.min.x, bb.min.y, bb.min.z], mx: [bb.max.x, bb.max.y, bb.max.z] },
    tris: grp.userData.tris || 0,
    front: { x: 0, z: d * 0.5, yaw: 0 },
    doorCount: 0,
    furniture: [],
    children: []
  });
  return REG[REG.length - 1];
}

/* Vertex colour for Shuang-Zha terrain: uses KMASK road/towpath raster (strictly 0 on all canals/locks/basins!) */
function ecTerrainCol(x, z, y, out) {
  var us = EC_GROUND.us(x, z), u = us[0], s = us[1];
  var pw = EC_GROUND.poundWaterAt(x, z);
  var gx = (EC_GROUND.h(x + 3, z) - EC_GROUND.h(x - 3, z)) / 6.0;
  var gz = (EC_GROUND.h(x, z + 3) - EC_GROUND.h(x, z - 3)) / 6.0;
  var slope = Math.hypot(gx, gz);
  var n = 0.92 + 0.14 * vnoise(x * 0.035, 0, z * 0.035);
  var rm = EC_PLAN && EC_PLAN.roadMask ? EC_PLAN.roadMask.sample(x, z) : { road: 0, towpath: 0 };
  var r, g, b;
  if (y < pw - 0.12 || KCANAL.pointInCanalTrough(EC_HYD.NET, x, z, 0.2)) {
    r = 0.23; g = 0.26; b = 0.25;
  } else if (s < -392 && y < 46.85) {
    r = 0.56; g = 0.54; b = 0.47;
  } else if (slope > 0.42) {
    r = 0.36; g = 0.37; b = 0.38;
  } else if (rm.road > 0.25 || rm.towpath > 0.25) {
    /* KMASK road/towpath stone tint (guaranteed 0 inside all canals!) */
    r = 0.66; g = 0.64; b = 0.58;
  } else {
    var inBurgh = Math.abs(u) < 358 && s > -432 && s < 445;
    if (inBurgh) {
      r = 0.59; g = 0.58; b = 0.50;
    } else {
      var up = smooth(62.0, 135.0, y);
      r = lerp(0.36, 0.42, up);
      g = lerp(0.47, 0.44, up);
      b = lerp(0.28, 0.29, up);
    }
  }
  out[0] = clamp(r * n, 0, 1);
  out[1] = clamp(g * n, 0, 1);
  out[2] = clamp(b * n, 0, 1);
}

/* Build watertight two-tier terrain (3.6 m inner grid [-1080..1080] + non-overlapping 120 m regional ring [-14400..14400]) */
function ecBuildTerrain(world) {
  KDRAWN.clear();
  var tMat = groundMat;
  tMat.vertexColors = true;
  tMat.color.setHex(0xffffff);
  if (tMat.map) {
    var sc0 = KMAT.mode === 'lib' && KMAT.packed(KIT.pack, 'ground') ? KMAT.packed(KIT.pack, 'ground').scale : [4, 4];
    for (var ti = 0; ti < 3; ti++) {
      var tex = [tMat.map, tMat.normalMap, tMat.roughnessMap][ti];
      if (tex) {
        tex.repeat.set(2160 / sc0[0], 2160 / sc0[1]);
      }
    }
  }

  var x0 = -1080, z0 = -1080, dx = 3.6, dz = 3.6, nx = 600, nz = 600;
  var geo = new THREE.PlaneGeometry(nx * dx, nz * dz, nx, nz);
  geo.rotateX(-PI / 2);
  geo.translate(x0 + nx * dx * 0.5, 0, z0 + nz * dz * 0.5);
  var pos = geo.attributes.position;
  var nv = (nx + 1) * (nz + 1);
  var H = new Float32Array(nv);
  var col = new Float32Array(nv * 3);
  var rgb = [0, 0, 0];
  for (var iz = 0; iz <= nz; iz++) {
    var z = z0 + iz * dz;
    for (var ix = 0; ix <= nx; ix++) {
      var idx = iz * (nx + 1) + ix;
      var x = x0 + ix * dx;
      var y = EC_GROUND.h(x, z);
      H[idx] = y;
      pos.setY(idx, y);
      ecTerrainCol(x, z, y, rgb);
      col[idx * 3] = rgb[0];
      col[idx * 3 + 1] = rgb[1];
      col[idx * 3 + 2] = rgb[2];
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  var fineMesh = new THREE.Mesh(geo, tMat);
  fineMesh.receiveShadow = true;
  fineMesh.userData.isGround = true;
  fineMesh.userData.probeSkip = true;
  fineMesh.name = 'terrain:fine';
  world.add(fineMesh);
  KDRAWN.add(KDRAWN.grid({ x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H }));

  var rx0 = -14400, rz0 = -14400, rcell = 120.0, rnx = 240, rnz = 240;
  var rnv = (rnx + 1) * (rnz + 1);
  var rPos = new Float32Array(rnv * 3);
  var rCol = new Float32Array(rnv * 3);
  var rUv = new Float32Array(rnv * 2);
  for (var jz = 0; jz <= rnz; jz++) {
    var wz = rz0 + jz * rcell;
    for (var jx = 0; jx <= rnx; jx++) {
      var k = jz * (rnx + 1) + jx;
      var wx = rx0 + jx * rcell;
      var wy = EC_GROUND.h(wx, wz);
      rPos[k * 3] = wx; rPos[k * 3 + 1] = wy; rPos[k * 3 + 2] = wz;
      rUv[k * 2] = wx / 24.0; rUv[k * 2 + 1] = wz / 24.0;
      ecTerrainCol(wx, wz, wy, rgb);
      rCol[k * 3] = rgb[0]; rCol[k * 3 + 1] = rgb[1]; rCol[k * 3 + 2] = rgb[2];
    }
  }
  var rIdx = [];
  for (var qz = 0; qz < rnz; qz++) {
    for (var qx = 0; qx < rnx; qx++) {
      if (qx >= 111 && qx < 129 && qz >= 111 && qz < 129) continue;
      var a = qz * (rnx + 1) + qx, d = a + 1, b = a + (rnx + 1), c = b + 1;
      rIdx.push(a, b, d, b, c, d);
    }
  }
  var rGeo = new THREE.BufferGeometry();
  rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
  rGeo.setAttribute('color', new THREE.BufferAttribute(rCol, 3));
  rGeo.setAttribute('uv', new THREE.BufferAttribute(rUv, 2));
  rGeo.setIndex(rIdx);
  rGeo.computeVertexNormals();
  var farMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.0 });
  var farMesh = new THREE.Mesh(rGeo, farMat);
  farMesh.receiveShadow = false;
  farMesh.userData.isGround = true;
  farMesh.userData.probeSkip = true;
  farMesh.userData.farField = true;
  farMesh.name = 'terrain:regional';
  world.add(farMesh);
  KDRAWN.add(KDRAWN.mesh(rPos, rIdx, null, { cell: 240 }));
}

/* Build all 4 stepped hydraulic pounds (P0 open lake + P1/P2/P3 still sheets + 8 dynamic lock chambers + 2 rivers + spillway) */
function ecBuildWater(world) {
  WATER.surfaces.length = 0;
  if (WATER.drawn) WATER.drawn.length = 0;
  EC_WATER_RECS = { open: null, still: [], locks: [], flows: [], fall: null };

  var mx0 = -15000, mz0 = -15000, mcell = 24, mnx = 1250, mnz = 1250;
  var mdata = new Uint8Array(mnx * mnz);
  for (var j = 0; j < mnz; j++) {
    var wz = mz0 + (j + 0.5) * mcell;
    for (var i = 0; i < mnx; i++) {
      var wx = mx0 + (i + 0.5) * mcell;
      var us = EC_GROUND.us(wx, wz);
      if (us[1] <= -396.4 || (us[0] > 260 && EC_GROUND.h(wx, wz) < 46.2)) {
        mdata[j * mnx + i] = 255;
      }
    }
  }
  var p0 = WATER.open({
    name: 'Jing-Hai Mirror Sea (Pound P0)',
    level: 45.87,
    swell: [[0.032, 24, 135, 0, 0.12], [0.018, 14, 95, 1.1, 0.08]],
    field: 0.16,
    chop: 0.14,
    bounds: [-14800, -14800, 14800, 14800],
    mask: { x0: mx0, z0: mz0, cell: mcell, nx: mnx, nz: mnz, data: mdata },
    bed: terrainH,
    bedBox: [-1080, -1080, 1080, 1080],
    bedCell: 6,
    damp: 2.2
  });
  EC_WATER_RECS.open = WATER.draw(p0, {
    scene: world,
    shallow: 0x3b6c63,
    deep: 0x163336,
    surf: false,
    breakers: false
  });
  if (SVTAGS) {
    var hp = EC_GROUND.at(0, -520);
    SVTAGS.add({ 'class': 'feature', kind: 'harbour_basin', key: 'pound_p0', name: 'Pound P0 — Jing-Hai Harbour (+45.87 m)',
      at: [hp[0], 45.87, hp[1]], ry: 0, size: [400, 220, 8], tags: { culture: 'eternian', types: ['infrastructure'] }, frag: KIT.frag });
  }

  for (var si = 0; si < EC_HYD.STILL_POLYS.length; si++) {
    var sp = EC_HYD.STILL_POLYS[si];
    var S = WATER.still({ name: sp.id, level: sp.level, poly: sp.poly });
    var col = sp.pound === 'P3' ? 0x25504a : (sp.pound === 'P2' ? 0x214842 : 0x1c3f3b);
    var D = WATER.drawStill(S, { scene: world, color: col, roughness: 0.06, metalness: 0.15 });
    EC_WATER_RECS.still.push({ spec: sp, S: S, D: D });
  }
  for (var pi = 0; pi < EC_HYD.POUNDS.length; pi++) {
    var pd = EC_HYD.POUNDS[pi];
    if (pd.id === 'P0' || !SVTAGS) continue;
    var cp = EC_GROUND.at(pd.id === 'P3' ? 105 : 0, pd.id === 'P3' ? 875 : (pd.id === 'P2' ? 680 : 0));
    SVTAGS.add({ 'class': 'feature', kind: 'canal_pound', key: 'pound_' + pd.id.toLowerCase(), name: pd.name,
      at: [cp[0], pd.wlev, cp[1]], ry: 0, size: [60, 400, 4], tags: { culture: 'eternian', types: ['infrastructure'] }, frag: KIT.frag });
  }

  for (var ci = 0; ci < EC_HYD.CHAMBERS.length; ci++) {
    var ch = EC_HYD.CHAMBERS[ci];
    var Sc = WATER.still({ name: 'lock.' + ch.id, level: ch.yLow, poly: ch.poly });
    var Dc = WATER.drawStill(Sc, { scene: world, color: 0x234c46, roughness: 0.05, metalness: 0.16 });
    EC_WATER_RECS.locks.push({ ch: ch, S: Sc, D: Dc });
  }

  var fHak = WATER.flow({ name: 'Hak-Ma River', pts: EC_HYD.HAK_MA_PTS, width: 28, speed: 1.85, densify: 12 });
  EC_WATER_RECS.flows.push(WATER.drawFlow(fHak, { scene: world, step: 8, margin: 1.8, shallow: 0x4f7d72, deep: 0x1b3d40 }));

  var fLok = WATER.flow({ name: 'Lok-Ma Stream', pts: EC_HYD.LOK_MA_PTS, width: 9.2, speed: 1.55, densify: 8 });
  EC_WATER_RECS.flows.push(WATER.drawFlow(fLok, { scene: world, step: 6, margin: 1.2, shallow: 0x558377, deep: 0x1e4244 }));

  var spw = EC_HYD.SPILLWAY;
  var lipA = EC_GROUND.at(spw.u, spw.s - spw.lipW * 0.5);
  var lipB = EC_GROUND.at(spw.u, spw.s + spw.lipW * 0.5);
  var fSpill = WATER.fall({
    name: 'P2 Ancestor Spillway',
    lip: [[lipA[0], lipA[1], spw.lip[1]], [lipB[0], lipB[1], spw.lip[1]]],
    dir: spw.dir,
    speed: spw.speed,
    drop: spw.drop
  });
  EC_WATER_RECS.fall = WATER.drawFall(fSpill, { scene: world, plungeY: spw.plungeY, spray: false });
}

/* Build all transit-kit canal infrastructure (quays, twin miter-lock chambers, 32 articulated miter-gate leaves,
   cart bridges, 3-arch Lok-Ma aqueduct, intake weir, sluice gatehouse, cranes) & vessel fleet via KCANAL! */
function ecBuildTransitWorksAndFleet(world, plan) {
  EC_GATE_LEAVES.length = 0;
  EC_MOORED_HULLS.length = 0;
  EC_MOVING_HULLS.length = 0;
  var F = EC_GROUND.FRAME;

  /* 1. Static canal infrastructure drawn via KCANAL.draw */
  for (var ii = 0; ii < plan.infra.length; ii++) {
    var inf = plan.infra[ii];
    if (!inf.transitKind) continue;
    var grp = null, cls = 'feature', kind = inf.transitKind;
    var seedVal = 77000 + ii * 13;
    if (inf.transitKind === 'quay') {
      grp = KCANAL.draw.quay({ len: inf.len == null ? 24.0 : inf.len, v: inf.v }, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'lockRiser') {
      grp = KCANAL.draw.lockRiser({ lanes: 2, chamberW: 5.6, chamberLen: 28.0, islandW: 4.0, v: inf.v }, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'bridge') {
      var br = inf.bridge;
      grp = KCANAL.draw.bridge({ width: br.width, clearSpan: br.clearSpan, totalLen: br.rampHalfLen * 2.0, crownRise: 1.50 }, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'aqueduct') {
      grp = KCANAL.draw.aqueduct({ len: inf.len == null ? 48.0 : inf.len, arches: inf.arches == null ? 3 : inf.arches, waterW: inf.waterW == null ? 8.3 : inf.waterW }, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'weir') {
      grp = KCANAL.draw.weir({}, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'sluiceGate') {
      grp = KCANAL.draw.sluiceGate({}, { style: 'eternian', seed: seedVal });
    } else if (inf.transitKind === 'crane') {
      cls = 'prop';
      grp = KCANAL.draw.crane({}, { style: 'eternian', seed: seedVal });
    }
    if (grp) {
      ecRegisterWorldGroup(world, grp, cls, kind, inf.key, inf.id, inf.x, inf.y, inf.z, inf.ry, inf.w, inf.d, inf.h, { types: ['infrastructure'] });
    }
  }

  /* 2. 32 Articulated Bronze Miter-Gate Leaves (4 per lock chamber) via KCANAL.gateLeafPoses */
  for (var ci = 0; ci < EC_HYD.CHAMBERS.length; ci++) {
    var ch = EC_HYD.CHAMBERS[ci];
    var st0 = KCANAL.lockState(ch, EC_LOCK_T);
    var leafPoses = KCANAL.gateLeafPoses(ch, st0, F);
    for (var li = 0; li < leafPoses.length; li++) {
      var lp = leafPoses[li];
      var lGrp = KCANAL.draw.miterLeaf({ leafLen: ch.leafLen }, { style: 'eternian', seed: 78000 + ci * 8 + li });
      ecRegisterWorldGroup(world, lGrp, 'part', 'lock_gate', 'tr_miter_leaf',
        ch.id + '.' + lp.which + '.' + (lp.side < 0 ? 'L' : 'R'),
        lp.hingeX, lp.baseY, lp.hingeZ, lp.yaw, ch.leafLen, 0.4, 6.4, { types: ['infrastructure'] });
      EC_GATE_LEAVES.push({ ch: ch, index: li, grp: lGrp });
    }
  }

  /* 3. Moored Canal Fleet (all tagged in SVTAGS as class 'vessel' + walkable decks in KWALK!) */
  for (var mi = 0; mi < EC_HYD.MOORED_FLEET.length; mi++) {
    var mf = EC_HYD.MOORED_FLEET[mi];
    var built = KCANAL.buildVessel(mf.key, { v: mf.v });
    if (!built) continue;
    var mp = EC_GROUND.at(mf.u, mf.s);
    built.group.position.set(mp[0], mf.y, mp[1]);
    built.group.rotation.y = mf.yaw;
    world.add(built.group);
    var mPose = { x: mp[0], y: mf.y, z: mp[1], yaw: mf.yaw };
    var vTag = KCANAL.registerVesselTag(SVTAGS, built.def, mPose, { name: built.def.name + ' (' + mf.id + ')' });
    if (vTag) built.group.userData.tid = vTag.id;
    KCANAL.registerVesselWalk(typeof KWALK !== 'undefined' ? KWALK : null, built, mPose, mf.id);
    var mbb = new THREE.Box3().setFromObject(built.group);
    REG.push({
      key: mf.key, name: mf.id, cls: 'vessel', x: mp[0], y: mf.y, z: mp[1], ry: mf.yaw,
      tid: vTag ? vTag.id : null,
      decl: { w: built.def.L, d: built.def.B, h: built.def.H + built.def.draft, budget: 18000 },
      bbox: { mn: [mbb.min.x, mbb.min.y, mbb.min.z], mx: [mbb.max.x, mbb.max.y, mbb.max.z] },
      tris: built.group.userData.tris || 0,
      front: { x: built.def.L * 0.5, z: 0, yaw: 0 }, doorCount: 0, furniture: [], children: []
    });
    EC_MOORED_HULLS.push({ spec: mf, built: built, tag: vTag });
  }

  /* 4. Active Lock-Transiting & Aqueduct-Cruising Barges, Scows & Launches */
  for (var vi = 0; vi < EC_HYD.TRANSIT_COURSES.length; vi++) {
    var crs = EC_HYD.TRANSIT_COURSES[vi];
    var pose0 = KCANAL.vesselPoseAt(crs, EC_LOCK_T);
    var vBuilt = KCANAL.buildVessel(crs.vesselKey, { v: crs.v });
    if (!vBuilt) continue;
    vBuilt.group.position.set(pose0.x, pose0.y, pose0.z);
    vBuilt.group.rotation.y = pose0.yaw;
    world.add(vBuilt.group);
    var mvTag = KCANAL.registerVesselTag(SVTAGS, vBuilt.def, pose0, { name: vBuilt.def.name + ' (' + crs.id + ')' });
    if (mvTag) vBuilt.group.userData.tid = mvTag.id;
    var vbb = new THREE.Box3().setFromObject(vBuilt.group);
    var regEntry = {
      key: crs.vesselKey, name: crs.id, cls: 'vessel', x: pose0.x, y: pose0.y, z: pose0.z, ry: pose0.yaw,
      tid: mvTag ? mvTag.id : null,
      decl: { w: vBuilt.def.L, d: vBuilt.def.B, h: vBuilt.def.H + vBuilt.def.draft, budget: 18000 },
      bbox: { mn: [vbb.min.x, vbb.min.y, vbb.min.z], mx: [vbb.max.x, vbb.max.y, vbb.max.z] },
      tris: vBuilt.group.userData.tris || 0,
      front: { x: vBuilt.def.L * 0.5, z: 0, yaw: 0 }, doorCount: 0, furniture: [], children: []
    };
    REG.push(regEntry);
    EC_MOVING_HULLS.push({ course: crs, built: vBuilt, tag: mvTag, reg: regEntry });
  }
}

/* Update lock chamber water levels, articulated miter-gate angles & moving barges at clock t */
function ecStepHydraulics(t) {
  var F = EC_GROUND.FRAME;
  var stateByChamber = {};
  for (var i = 0; i < EC_WATER_RECS.locks.length; i++) {
    var lk = EC_WATER_RECS.locks[i];
    var ls = EC_HYD.lockState(lk.ch, t);
    stateByChamber[lk.ch.id] = ls;
    lk.D.mesh.position.y = ls.y - lk.ch.yLow;
    lk.S.level = ls.y;
  }
  var posesCache = {};
  for (var gi = 0; gi < EC_GATE_LEAVES.length; gi++) {
    var lf = EC_GATE_LEAVES[gi];
    var cid = lf.ch.id;
    if (!posesCache[cid]) {
      posesCache[cid] = KCANAL.gateLeafPoses(lf.ch, stateByChamber[cid] || EC_HYD.lockState(lf.ch, t), F);
    }
    var gp = posesCache[cid][lf.index];
    lf.grp.position.set(gp.hingeX, gp.baseY, gp.hingeZ);
    lf.grp.rotation.y = gp.yaw;
  }
  for (var vi = 0; vi < EC_MOVING_HULLS.length; vi++) {
    var mh = EC_MOVING_HULLS[vi];
    var mp = KCANAL.vesselPoseAt(mh.course, t);
    mh.built.group.position.set(mp.x, mp.y, mp.z);
    mh.built.group.rotation.y = mp.yaw;
    if (mh.tag) {
      mh.tag.at[0] = mp.x;
      mh.tag.at[1] = +(mp.y - mh.built.def.draft).toFixed(4);
      mh.tag.at[2] = mp.z;
      mh.tag.ry = +mp.yaw.toFixed(4);
    }
    if (mh.reg) {
      var hr = Math.max(mh.built.def.L, mh.built.def.B) * 0.5;
      mh.reg.x = mp.x; mh.reg.y = mp.y; mh.reg.z = mp.z; mh.reg.ry = mp.yaw;
      mh.reg.bbox.mn[0] = mp.x - hr; mh.reg.bbox.mx[0] = mp.x + hr;
      mh.reg.bbox.mn[1] = mp.y - mh.built.def.draft; mh.reg.bbox.mx[1] = mp.y + mh.built.def.H;
      mh.reg.bbox.mn[2] = mp.z - hr; mh.reg.bbox.mx[2] = mp.z + hr;
    }
  }
}

/* Wire continuous walkable towpaths, bridges, lock staircases & clipped ward streets into KWALK */
function ecRegisterWalk(plan) {
  if (typeof KWALK === 'undefined') return;
  var nodes = plan.towpath.nodes, edges = plan.towpath.edges;
  for (var id in nodes) {
    var nd = nodes[id];
    KWALK.floor({ rect: [nd.x - 2.4, nd.x + 2.4, nd.z - 2.4, nd.z + 2.4], y: nd.y, name: nd.id, tag: 'towpath:node' });
  }
  for (var i = 0; i < edges.length; i++) {
    var ed = edges[i], a = nodes[ed.a], b = nodes[ed.b];
    KWALK.strip({ a: [a.x, a.z, a.y], b: [b.x, b.z, b.y], w: ed.w, name: ed.a + '->' + ed.b, tag: 'towpath:' + ed.kind });
  }
  for (var wi = 0; wi < plan.ways.length; wi++) {
    var w = plan.ways[wi];
    if (!w.pts) continue;
    for (var k = 0; k + 1 < w.pts.length; k++) {
      var p0 = w.pts[k], p1 = w.pts[k + 1];
      var ww = w.w == null ? (w.width == null ? 6 : w.width) : w.w;
      KWALK.strip({
        a: [p0[0], p0[1], EC_GROUND.h(p0[0], p0[1])],
        b: [p1[0], p1[1], EC_GROUND.h(p1[0], p1[1])],
        w: Math.max(3.5, ww * 0.7),
        name: w.id,
        tag: 'street:' + w.cls
      });
    }
  }
}

/* Scatter NW-lowlands bamboo, spire-cedar, willow & shore reed flora strictly outside canals, wards & camera eyes */
function ecBuildFlora(world, plan) {
  if (typeof EC_FLORA === 'undefined' || qs.get('flora') === '0') return;
  var BIO = EC_FLORA.BIO, NWLOW = EC_FLORA.NWLOW;
  var obs = [];
  for (var i = 0; i < SITES.length; i++) {
    var s = SITES[i], d = DEFS[s.key];
    if (d) obs.push({ x: s.x, z: s.z, r: Math.hypot(d.w, d.d) * 0.55 + 4.5 });
  }
  for (var vk in EC_VIEWS) {
    var vv = EC_VIEWS[vk];
    obs.push({ x: vv[0], z: vv[2], r: 18.0 });
  }
  BIO.host.scene = world;
  BIO.host.terrainH = terrainH;
  BIO.host.waterH = function (x, z) {
    var us = EC_GROUND.us(x, z);
    return us[1] < -392 ? 45.87 : EC_GROUND.poundWaterAt(x, z) - 4.0;
  };
  BIO.host.obstacles = obs;
  BIO.host.mask = function (x, z) {
    var us = EC_GROUND.us(x, z), u = us[0], s = us[1];
    if (s < -388 && EC_GROUND.h(x, z) < 46.55) return 0;
    if (Math.abs(u) < 385 && s > -450 && s < 455) return 0;
    if (Math.abs(u) < 56 && s >= 430 && s <= 840) return 0;
    if (u > 45 && u < 195 && s > 790 && s < 935) return 0;
    if (Math.abs(s - 680) < 26 && Math.abs(u) < 120) return 0;
    var y = EC_GROUND.h(x, z), pw = EC_GROUND.poundWaterAt(x, z);
    if (y < pw + 0.85) return 0;
    return 1;
  };
  BIO.host.fields = {
    wet: function (x, z) { var y = EC_GROUND.h(x, z); return clamp(0.92 - (y - 46.0) * 0.0035, 0.45, 0.96); },
    tropic: function () { return 0.52; },
    dry: function (x, z) { return clamp((EC_GROUND.h(x, z) - 85.0) * 0.008, 0.0, 0.38); },
    flow: function (x, z) { var us = EC_GROUND.us(x, z); return Math.abs(us[1] - 680) < 55 || us[0] > 140 ? 0.65 : 0.15; },
    upland: function (x, z) { return smooth(68.0, 145.0, EC_GROUND.h(x, z)); },
    shoreM: function (x, z) { var us = EC_GROUND.us(x, z); return Math.max(0, us[1] + 410); }
  };
  NWLOW.IMPOSTORS = false;
  var st = NWLOW.build({ R: 840, quality: 0.14 });
  var bk = BIO.bake();
  EC_FLORA_STATS = { build: st, inst: bk.inst, calls: bk.calls };
}

/* Populate SITES and wrap buildWorld so Shuang-Zha builds cleanly before 92-world.js runs */
{
  var _ecBaseBuildWorld = buildWorld;
  buildWorld = function () {
    if (typeof KWALK !== 'undefined') KWALK.clear();
    EC_PLAN = EC_CITY.make({
      dims: function (k) {
        var d = DEFS[k];
        return d ? { w: d.w, d: d.d, h: d.h } : null;
      }
    });

    SITES.length = 0;
    for (var ii = 0; ii < EC_PLAN.infra.length; ii++) {
      var inf = EC_PLAN.infra[ii];
      if (inf.transitKind || !DEFS[inf.key]) continue;
      SITES.push({ key: inf.key, x: inf.x, z: inf.z, ry: inf.ry, o: { y: inf.y, v: inf.v == null ? 0 : inf.v, name: inf.id } });
    }
    for (var li = 0; li < EC_PLAN.lots.length; li++) {
      var lt = EC_PLAN.lots[li];
      if (!DEFS[lt.key]) continue;
      SITES.push({ key: lt.key, x: lt.x, z: lt.z, ry: lt.ry, o: { y: lt.padY, v: lt.v == null ? 0 : lt.v, name: lt.id } });
    }
    for (var hi = 0; hi < EC_PLAN.hamlets.length; hi++) {
      var hm = EC_PLAN.hamlets[hi];
      for (var rj = 0; rj < hm.records.length; rj++) {
        var hr = hm.records[rj];
        if (!DEFS[hr.key]) continue;
        SITES.push({ key: hr.key, x: hr.x, z: hr.z, ry: hr.ry == null ? 0 : hr.ry, o: { y: hr.y, v: hr.v == null ? 0 : hr.v, name: hm.id + '.' + rj } });
      }
    }
    for (var ci = 0; ci < EC_PLAN.cropPlots.length; ci++) {
      var cp = EC_PLAN.cropPlots[ci];
      if (!DEFS[cp.key]) continue;
      SITES.push({ key: cp.key, x: cp.x, z: cp.z, ry: cp.ry == null ? 0 : cp.ry, o: { y: cp.y, v: 0, name: cp.id } });
    }

    var w = _ecBaseBuildWorld.apply(this, arguments);
    var world = w || WORLD;

    /* Remove kits/eternian's static kit-sheet box('water') bucket so 100% of visible water is real core/water */
    var staleWater = [];
    world.traverse(function (m) {
      if (m.isMesh && m.userData && m.userData.mk === 'water') staleWater.push(m);
    });
    for (var sw = 0; sw < staleWater.length; sw++) {
      if (staleWater[sw].parent) staleWater[sw].parent.remove(staleWater[sw]);
      if (staleWater[sw].geometry) staleWater[sw].geometry.dispose();
    }

    /* Clipped flagstone street & towpath slabs via KCANAL.draw.pavedWays (guaranteed 0 canal intrusions!) */
    world.add(KCANAL.draw.pavedWays(EC_PLAN.ways, EC_PLAN.towpath, EC_HYD.NET, EC_GROUND.h, { style: 'eternian' }));

    ecBuildTerrain(world);
    ecBuildWater(world);
    ecBuildTransitWorksAndFleet(world, EC_PLAN);
    ecStepHydraulics(EC_LOCK_T);
    ecRegisterWalk(EC_PLAN);
    ecBuildFlora(world, EC_PLAN);
    if (typeof nightRebuild === 'function') nightRebuild();
    KCANAL.setNightGlow(!!(typeof NIGHT !== 'undefined' && NIGHT.on));
    return world;
  };
}

FRAME_HOOKS.push(function (dt) {
  if (EC_LOCK_PIN === null) {
    EC_LOCK_T = (EC_LOCK_T + Math.min(0.1, dt == null ? 0.016 : dt)) % EC_HYD.TRANSIT_PERIOD;
  }
  ecStepHydraulics(EC_LOCK_T);
  if (typeof NIGHT !== 'undefined') KCANAL.setNightGlow(!!NIGHT.on);
  if (EC_WATER_RECS.open && EC_WATER_RECS.open.update) {
    EC_WATER_RECS.open.update(camera);
  }
});
