// ================================================================= DRUM — 8bj: Stage 4 Walk Graph, KDOOR Leaves & KFURN Interiors ([draw])
// Populates KWALK + KDOOR across the 15-level Drum Arcology, Garrison Fortress, Ordinator Fortress, The Cauldron Arena,
// and City Wall Gates; instances KDOORLEAF + KDOORHOST interactive doors; and batches KratorFurniture via KFURN.

const DRUM_WALK_STATS = (function buildDrumWalkAndDoors() {
  const deg = Math.PI / 180;

  // 1. Register Inner Ancient Wall & Outer Scrap Palisade gates in KDOOR before D.walk(KWALK)
  for (let i = 0; i < DRUM_PLAN.gates.length; i++) {
    const g = DRUM_PLAN.gates[i];
    const a = g.deg * deg;
    const isInner = g.wall === 'inner_wall_ancient';
    KDOOR.add({
      id: 'door_' + g.id,
      at: [g.x, 0, g.z],
      yaw: 0.5 * Math.PI - a,
      w: isInner ? 5.4 : 5.8,
      h: isInner ? 4.8 : 4.2,
      t: isInner ? 0.36 : 0.30,
      preset: isInner ? 'portcullis' : 'blastside',
      style: isInner ? 'grille' : 'plate',
      open: 1
    });
  }

  // 2. Populate Arcology (L1..L15 + Sky-Terrace) and Landmark (F-1..F2) walk slabs, stairs, wall blocks & doors
  const stats = DRUM.populateStage4WalkAndDoors(DRUM_PLAN, DRUM_STAGE4, KWALK, KDOOR);

  // 3. Instance KDOORLEAF meshes grouped by leaf style and bind to KDOORHOST
  const doorGroup = new THREE.Group();
  doorGroup.name = 'drum_doors_root';
  scene.add(doorGroup);

  const byStyle = new Map();
  for (let i = 0; i < KDOOR.list.length; i++) {
    const D = KDOOR.list[i];
    const st = D.style || 'plank+ring';
    let b = byStyle.get(st);
    if (!b) {
      b = { doors: [], leaves: 0 };
      byStyle.set(st, b);
    }
    b.doors.push(D);
    b.leaves += KDOOR.leafCount(D);
  }

  const glassMat = KGLASS.material(THREE, 'smoked');
  glassMat.side = THREE.DoubleSide;
  const upY = new THREE.Vector3(0, 1, 0);
  const allDoorMeshes = [];

  byStyle.forEach(function (bucket, style) {
    if (bucket.leaves <= 0) return;
    let frameMat = DRUM_DRAW.MATS.timber;
    let hwMat = DRUM_DRAW.MATS.bronze;
    if (style === 'plate') {
      frameMat = DRUM_DRAW.MATS.tankSteel;
      hwMat = DRUM_DRAW.MATS.rustPlate;
    } else if (style === 'grille') {
      frameMat = DRUM_DRAW.MATS.rustPlate;
      hwMat = DRUM_DRAW.MATS.bronze;
    } else if (style === 'banded') {
      frameMat = DRUM_DRAW.MATS.porphyry;
      hwMat = DRUM_DRAW.MATS.gold;
    } else if (style === 'panel+pull' || style === 'glazed+pull') {
      frameMat = DRUM_DRAW.MATS.ancientDark;
      hwMat = DRUM_DRAW.MATS.gold;
    }
    const meshes = KDOORLEAF.meshes(THREE, style, { frame: frameMat, glass: glassMat, hw: hwMat }, bucket.leaves);
    for (let m = 0; m < meshes.length; m++) {
      doorGroup.add(meshes[m]);
      allDoorMeshes.push(meshes[m]);
    }
    let cursor = 0;
    for (let i = 0; i < bucket.doors.length; i++) {
      const D = bucket.doors[i];
      const lc = KDOOR.leafCount(D);
      const idxs = [];
      for (let k = 0; k < lc; k++) idxs.push(cursor++);
      const q0 = new THREE.Quaternion().setFromAxisAngle(upY, D.yaw);
      KDOORHOST.instanced(D, meshes, idxs, q0);
      KDOORHOST.pose(D);
    }
  });

  for (let m = 0; m < allDoorMeshes.length; m++) {
    allDoorMeshes[m].instanceMatrix.needsUpdate = true;
  }

  const doorTip = KDOORHOST.tip(
    function () { return camera.position; },
    function () { return !!(window.KHOST && KHOST.cam && KHOST.cam.ctl.walk); }
  );

  ANC_TICKS.push(function (dt) {
    KDOORHOST.tick(dt == null ? 0.016 : dt);
    doorTip();
  });

  return {
    floors: KWALK.floors.length,
    blocks: KWALK.blocks.length,
    doors: KDOOR.list.length,
    doorMeshes: allDoorMeshes.length,
    baseFloors: stats.floors
  };
})();

const DRUM_FURN = (function buildDrumStage4Furniture() {
  const furnGroup = new THREE.Group();
  furnGroup.name = 'drum_stage4_furniture_root';
  scene.add(furnGroup);

  const R = KFURN.create({
    idPrefix: 'drum_furn',
    catalog: KFURN.catalogOf(KratorFurniture),
    tags: DRUM_TAGS,
    seed: function (o, ctx, reg, x, y, z) {
      return KRAND.hash(DRUM_SEED, Math.round(x * 10), Math.round(y * 10), Math.round(z * 10), reg.placed.length);
    },
    draw: function (rec, ctx) {
      const w = (ctx && typeof ctx.wealth === 'number') ? ctx.wealth : 0.5;
      KFURN.drawRec(R, rec, w);
    }
  });

  KratorFurniture.setDetail(0.34);
  KFURN.useBatch(R, KratorFurniture, null, { indexed: true });

  const sets = [
    DRUM_STAGE4.arcology.furn,
    DRUM_STAGE4.garrison.furn,
    DRUM_STAGE4.ordinator.furn,
    DRUM_STAGE4.arena.furn,
    DRUM_STAGE4.marketQuarry.furn
  ];

  const keyToTagId = {};
  for (let k = 0; k < DRUM_TAGS.records.length; k++) {
    const tr = DRUM_TAGS.records[k];
    if (tr && tr.key && !keyToTagId[tr.key]) keyToTagId[tr.key] = tr.id;
  }

  for (let s = 0; s < sets.length; s++) {
    const list = sets[s];
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const parentId = (it.building && keyToTagId[it.building]) ? keyToTagId[it.building] : null;
      R.place(
        it.key,
        it.x,
        it.y,
        it.z,
        it.ry,
        { v: it.v == null ? 0 : it.v, seed: it.seed, setting: it.setting || 'indoor', room: it.room || null },
        null,
        { building: parentId, room: it.room || null, wealth: it.wealth == null ? 0.5 : it.wealth }
      );
    }
  }

  R.batch.flush(furnGroup);
  const fm = DRUM_DRAW.getFurnDetailMaps();
  furnGroup.traverse(function (o) {
    if (o.isMesh && o.geometry) {
      KFURN.linearColours(o.geometry);
      const p = o.geometry.attributes.position;
      let n = o.geometry.attributes.normal;
      if (!n && p) {
        o.geometry.computeVertexNormals();
        n = o.geometry.attributes.normal;
      }
      if (p) {
        const uv = new Float32Array(p.count * 2);
        for (let vi = 0; vi < p.count; vi++) {
          const ax = n ? Math.abs(n.getX(vi)) : 0;
          const ay = n ? Math.abs(n.getY(vi)) : 1;
          const az = n ? Math.abs(n.getZ(vi)) : 0;
          if (ay >= ax && ay >= az) { uv[vi * 2] = p.getX(vi) / 1.8; uv[vi * 2 + 1] = p.getZ(vi) / 1.8; }
          else if (ax >= az) { uv[vi * 2] = p.getZ(vi) / 1.8; uv[vi * 2 + 1] = p.getY(vi) / 1.8; }
          else { uv[vi * 2] = p.getX(vi) / 1.8; uv[vi * 2 + 1] = p.getY(vi) / 1.8; }
        }
        o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      }
      if (o.material) {
        const applyMat = function (m) {
          m.side = THREE.DoubleSide;
          if (!m.map) m.map = fm.map;
          if (!m.roughnessMap) m.roughnessMap = fm.roughnessMap;
          m.bumpMap = fm.roughnessMap;
          m.bumpScale = 0.014;
          m.needsUpdate = true;
        };
        if (Array.isArray(o.material)) {
          for (let k = 0; k < o.material.length; k++) applyMat(o.material[k]);
        } else {
          applyMat(o.material);
        }
      }
    }
  });
  R.group = furnGroup;
  return R;
})();
