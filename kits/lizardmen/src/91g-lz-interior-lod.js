// ================================================================= INTERIOR LOD: spatial-cell streaming & culling for indoor furniture ([draw])
// Sorts after 91f-furnish.js and before 92-world.js. On showcase kit sheets (SITES.length <= 120) nothing changes: every piece builds
// eagerly as before. On settlement pages (SITES.length > 120, e.g. Basilisk's 2,300+ buildings and ~23,000 indoor pieces):
//   - Outdoor pieces (rec.setting !== 'indoor') still draw eagerly into SVF.batch at world build so yards and streets are complete.
//   - Indoor pieces (rec.setting === 'indoor') still register their full records in SVF.placed, rec.furniture and SVTAGS, and lamp/
//     hearth/forge pieces still register night-time halos, while their 3D catalog meshes are bucketed into 120 x 120 m spatial cells
//     and ONLY built/rendered when interiors are actually viewed — i.e. when Cut-away (X) is on or Walk mode (F) is active:
//       * Cut-away ON  (X on): cells within 220 m stream LOD 0 (detail 0.50); cells at 220..450 m stream coarse LOD 1 (detail 0.12).
//       * Walk mode ON (F on): cells within 95 m of the walker stream LOD 0 (detail 0.50).
//       * Otherwise:           hidden behind solid roofs and walls (0 indoor triangles built or drawn).
//   - All streamed cells share two lightweight vertex-colour materials (opaque + glow) so zero extra shader programs ever compile.
(function () {
  if (typeof SVF === 'undefined' || typeof KFURN === 'undefined' || typeof KratorFurniture === 'undefined') return;

  var CELL = 120;
  var HI_DETAIL = 0.50;
  var LO_DETAIL = 0.12;
  var MAX_HI_BUILT = 14;
  var MAX_LO_BUILT = 22;

  var origDraw = SVF.cfg.draw;
  var active = false;
  var cells = Object.create(null);
  var cellList = [];
  var lodRoot = null;
  var hiOrder = [];
  var loOrder = [];
  var sharedBodyMat = null;
  var sharedGlowMat = null;

  function ensureSharedMats() {
    if (!sharedBodyMat) {
      sharedBodyMat = new THREE.MeshLambertMaterial({ vertexColors: true });
      sharedGlowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    }
  }

  function disposeGroup(g) {
    if (!g) return;
    g.traverse(function (m) {
      if (m.isMesh && m.geometry) m.geometry.dispose();
    });
    if (g.parent) g.parent.remove(g);
  }

  function resetLod() {
    for (var i = 0; i < cellList.length; i++) {
      disposeGroup(cellList[i].hi);
      disposeGroup(cellList[i].lo);
    }
    cells = Object.create(null);
    cellList = [];
    hiOrder = [];
    loOrder = [];
    if (lodRoot && lodRoot.parent) lodRoot.parent.remove(lodRoot);
    lodRoot = null;
  }

  function buildCellTier(cell, detail) {
    ensureSharedMats();
    var B = KratorFurniture.batch({ indexed: true });
    var prevD = KIT.furnDetail == null ? 0.5 : KIT.furnDetail;
    KratorFurniture.setDetail(detail);
    var items = cell.items, i, it, rec, k, po, x0, y0, z0;
    try {
      for (i = 0; i < items.length; i++) {
        it = items[i];
        rec = it.rec;
        po = { variant: rec.variant, seed: rec.seed, wealth: it.wealth, building: rec.building, setting: rec.setting };
        k = rec.scale;
        if (k != null && k !== 1) {
          x0 = rec.x; y0 = rec.y || 0; z0 = rec.z;
          B.absorb = function (g) {
            g.scale.setScalar(k);
            g.position.set(x0 * (1 - k), y0 * (1 - k), z0 * (1 - k));
            g.updateMatrixWorld(true);
            return Object.getPrototypeOf(B).absorb.call(B, g);
          };
          try { B.place(rec.key, rec.x, rec.y, rec.z, rec.ry, po); } finally { delete B.absorb; }
        } else {
          B.place(rec.key, rec.x, rec.y, rec.z, rec.ry, po);
        }
      }
    } finally {
      KratorFurniture.setDetail(prevD);
    }
    var g = B.flush(lodRoot);
    g.userData.furniture = true;
    g.userData.lodSkip = true;
    g.traverse(function (m) {
      if (m.isMesh) {
        var f = (m.material && m.material.userData && m.material.userData.family) || '';
        var oldMat = m.material;
        KFURN.linearColours(m.geometry);
        m.material = f === 'glow' ? sharedGlowMat : sharedBodyMat;
        m.castShadow = false;
        m.receiveShadow = f !== 'glow';
        if (oldMat && oldMat !== m.material && oldMat.dispose) oldMat.dispose();
      }
    });
    return g;
  }

  function touchLru(arr, cell, cap, prop) {
    var idx = arr.indexOf(cell);
    if (idx >= 0) arr.splice(idx, 1);
    arr.push(cell);
    while (arr.length > cap) {
      var old = arr.shift();
      if (old && old[prop] && !old[prop].visible) {
        disposeGroup(old[prop]);
        old[prop] = null;
      } else {
        arr.unshift(old);
        break;
      }
    }
  }

  SVF.cfg.draw = function (rec, ctx, o, A) {
    if (!active || rec.setting !== 'indoor') {
      return origDraw(rec, ctx, o, A);
    }
    var gx = Math.floor(rec.x / CELL), gz = Math.floor(rec.z / CELL), ck = gx + ',' + gz;
    var cell = cells[ck];
    if (!cell) {
      cell = { key: ck, cx: (gx + 0.5) * CELL, cz: (gz + 0.5) * CELL, items: [], hi: null, lo: null };
      cells[ck] = cell;
      cellList.push(cell);
    }
    cell.items.push({ rec: rec, wealth: ctx.wealth });
    if (/hearth|hanging|candelabra|forge|brazier|cauldron|kiln|lamp|lantern/.test(rec.key)) {
      var hk = Math.round(rec.x / 0.6) + ',' + Math.round((rec.y + 0.65) / 0.6) + ',' + Math.round(rec.z / 0.6);
      if (!HALOKEY.has(hk)) {
        HALOKEY.add(hk);
        var fire = /fire|brazier|stove|forge|cauldron|kiln|hearth/.test(rec.key);
        var c = hc(fire ? 0xff8a30 : 0xffc878);
        HALOS.push({ x: rec.x, y: rec.y + (/hanging/.test(rec.key) ? 0.35 : 0.65), z: rec.z, r: c.r, g: c.g, b: c.b, big: fire });
      }
    }
    return {};
  };

  var prevBuildWorld = buildWorld;
  buildWorld = function () {
    resetLod();
    active = typeof SITES !== 'undefined' && SITES.length > 120 && !/[?&]furnlod=0\b/.test(location.search);
    var r = prevBuildWorld();
    if (active) {
      lodRoot = new THREE.Group();
      lodRoot.name = 'furniture-interior-lod';
      lodRoot.userData.furniture = true;
      WORLD.add(lodRoot);
      if (window._build && window._build.furniture) {
        window._build.furniture.lodCells = cellList.length;
        window._build.furniture.deferredIndoor = cellList.reduce(function (s, c) { return s + c.items.length; }, 0);
      }
    }
    return r;
  };

  FRAME_HOOKS.push(function tickInteriorLod() {
    if (!active || !lodRoot || !cellList.length) return;
    var cutOn = !!(ANIMU && ANIMU.uCut && ANIMU.uCut.value > 0.01);
    var isWalk = !!(typeof KHOST !== 'undefined' && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk);
    if (!cutOn && !isWalk) {
      if (lodRoot.visible) lodRoot.visible = false;
      return;
    }
    lodRoot.visible = true;
    var cx = camera.position.x, cz = camera.position.z;
    var tx = cx, tz = cz;
    if (!isWalk && typeof KHOST !== 'undefined' && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.target) {
      tx = KHOST.cam.ctl.target.x;
      tz = KHOST.cam.ctl.target.z;
    }
    var builtBudget = 1, i, cell, dCam, dTgt, d, wantHi, wantLo;
    for (i = 0; i < cellList.length; i++) {
      cell = cellList[i];
      dCam = Math.hypot(cell.cx - cx, cell.cz - cz);
      dTgt = Math.hypot(cell.cx - tx, cell.cz - tz);
      d = cutOn ? Math.min(dCam, dTgt) : dCam;
      wantHi = cutOn ? (d < 220) : (dCam < 95);
      wantLo = cutOn && !wantHi && (d < 450);
      if (wantHi) {
        if (!cell.hi && builtBudget > 0) {
          cell.hi = buildCellTier(cell, HI_DETAIL);
          builtBudget--;
        }
        if (cell.hi) {
          cell.hi.visible = true;
          touchLru(hiOrder, cell, MAX_HI_BUILT, 'hi');
          if (cell.lo) cell.lo.visible = false;
        } else if (cell.lo) {
          cell.lo.visible = true;
        }
      } else if (wantLo) {
        if (cell.hi) cell.hi.visible = false;
        if (!cell.lo && builtBudget > 0) {
          cell.lo = buildCellTier(cell, LO_DETAIL);
          builtBudget--;
        }
        if (cell.lo) {
          cell.lo.visible = true;
          touchLru(loOrder, cell, MAX_LO_BUILT, 'lo');
        }
      } else {
        if (cell.hi) cell.hi.visible = false;
        if (cell.lo) cell.lo.visible = false;
      }
    }
  });

  window._furnLod = {
    stats: function () {
      var hiB = 0, hiV = 0, loB = 0, loV = 0, i, c;
      for (i = 0; i < cellList.length; i++) {
        c = cellList[i];
        if (c.hi) { hiB++; if (c.hi.visible) hiV++; }
        if (c.lo) { loB++; if (c.lo.visible) loV++; }
      }
      return { active: active, cells: cellList.length, hiBuilt: hiB, hiVisible: hiV, loBuilt: loB, loVisible: loV };
    }
  };
})();
