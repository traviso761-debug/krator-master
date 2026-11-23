// ================================================================= TORUS — 8bj: Stage 4 Walk Graph, KDOOR Leaves & KFURN Interiors ([draw])
// Populates KWALK + KDOOR across the 10-terrace radial stair cascade, Forest Ring (Foot, Barrel Hoists, 4 Wheel Bridges,
// Wheel Town, Crown), Board Hall, Vothic Emissary, Ordinator Palace, Great Cider-Press Hall, 8 Surviving Ag-Domes,
// 4 Quarantined Feral Ag-Domes (locked!), and 6 Customs Gates; instances KDOORLEAF + KDOORHOST; and batches KFURN.

const TORUS_WALK_STATS = (function buildTorusWalkAndDoors() {
  const deg = Math.PI / 180;

  // 1. Register the 6 Light Customs & Granary Wall gates in KDOOR before D.walk(KWALK)
  for (let i = 0; i < TORUS_PLAN.gates.length; i++) {
    const g = TORUS_PLAN.gates[i];
    const a = g.deg * deg;
    KDOOR.add({
      id: 'door_' + g.id,
      at: [g.x, 0.5, g.z],
      yaw: 0.5 * Math.PI - a,
      w: 5.8,
      h: 4.6,
      t: 0.28,
      preset: 'double',
      style: 'banded',
      open: 1
    });
  }

  // 2. Populate Forest Ring, 10-terrace stairs, 4 multi-storey landmarks & 12 Ag-Domes into KWALK + KDOOR
  const stats = TORUS.populateStage4WalkAndDoors(TORUS_PLAN, TORUS_STAGE4, KWALK, KDOOR);

  // 3. Instance KDOORLEAF meshes grouped by leaf style and bind to KDOORHOST
  const doorGroup = new THREE.Group();
  doorGroup.name = 'torus_doors_root';
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
    let frameMat = TORUS_DRAW.MATS.timber;
    let hwMat = TORUS_DRAW.MATS.bronze;
    if (style === 'plate') {
      frameMat = TORUS_DRAW.MATS.tankSteel;
      hwMat = TORUS_DRAW.MATS.rustPlate;
    } else if (style === 'grille') {
      frameMat = TORUS_DRAW.MATS.rustPlate;
      hwMat = TORUS_DRAW.MATS.bronze;
    } else if (style === 'banded') {
      frameMat = TORUS_DRAW.MATS.porphyry;
      hwMat = TORUS_DRAW.MATS.gold;
    } else if (style === 'panel+pull' || style === 'glazed+pull') {
      frameMat = TORUS_DRAW.MATS.ancientDark;
      hwMat = TORUS_DRAW.MATS.gold;
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

const TORUS_FURN = (function buildTorusStage4Furniture() {
  const furnGroup = new THREE.Group();
  furnGroup.name = 'torus_stage4_furniture_root';
  scene.add(furnGroup);

  const R = KFURN.create({
    idPrefix: 'torus_furn',
    catalog: KFURN.catalogOf(KratorFurniture),
    tags: TORUS_TAGS,
    seed: function (o, ctx, reg, x, y, z) {
      return KRAND.hash(TORUS_SEED, Math.round(x * 10), Math.round(y * 10), Math.round(z * 10), reg.placed.length);
    },
    draw: function (rec, ctx) {
      const w = (ctx && typeof ctx.wealth === 'number') ? ctx.wealth : 0.6;
      KFURN.drawRec(R, rec, w);
    }
  });

  KratorFurniture.setDetail(0.62);
  KFURN.useBatch(R, KratorFurniture, null, { indexed: true });

  const sets = [
    TORUS_STAGE4.arcology.furn,
    TORUS_STAGE4.boardHall.furn,
    TORUS_STAGE4.emissary.furn,
    TORUS_STAGE4.ordinators.furn,
    TORUS_STAGE4.ciderHall.furn,
    TORUS_STAGE4.domes.furn
  ];

  const keyToTagId = {};
  for (let k = 0; k < TORUS_TAGS.records.length; k++) {
    const tr = TORUS_TAGS.records[k];
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
        { building: parentId, room: it.room || null, wealth: it.wealth == null ? 0.6 : it.wealth }
      );
    }
  }

  const fm = TORUS_DRAW.getFurnDetailMaps();
  R.batch.flush(furnGroup);
  furnGroup.traverse(function (o) {
    if (o.isMesh && o.geometry) {
      KFURN.linearColours(o.geometry);
      if (o.geometry.attributes.position) {
        if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        TORUS_DRAW.addTriplanarUvs(o.geometry, 1.8);
      }
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (let k = 0; k < mats.length; k++) {
          const mat = mats[k];
          if (!mat) continue;
          mat.side = THREE.DoubleSide;
          if (!mat.map) {
            mat.map = fm.map;
            if (mat.roughness !== undefined && !mat.roughnessMap) mat.roughnessMap = fm.roughnessMap;
            mat.needsUpdate = true;
          }
        }
      }
    }
  });
  R.group = furnGroup;
  return R;
})();
