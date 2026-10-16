/* ============================== 8. HOST: THE VOTH KIT, INSTANCED ============================== */
/* [draw] Thousands of lots, a few dozen distinct pieces. Each (key, variant, slot) is built once with the
   catalog's own builder, merged by the catalog LOD (settlements/voth/catalog/lod.js) into its three levels,
   and drawn as InstancedMeshes: one per piece, level and material. Each instance picks its level by its own
   distance from the camera, so the whole city costs a few hundred draw calls. */

/* placeholder public art: a plaza fountain (kits/furniture SPEC: outdoor decoration; replace with a catalog piece) */
ASSET({ key: 'sl_fountain', name: 'Plaza fountain (placeholder)', culture: 'voth', family: 'street', types: ['infrastructure'], w: 5.4, d: 5.4, h: 3.4,
  build: function (F) {
    var st = 0x8c8273, dk = 0x6d6458;
    F.cyl(0, 0, 0, 2.7, 0.7, 0, st, 'stone'); F.cyl(0, 0.62, 0, 2.35, 0.12, 0, 0x3f6f86, 'stone');
    F.cyl(0, 0, 0, 0.42, 2.4, 0, dk, 'stone'); F.cyl(0, 2.2, 0, 1.0, 0.28, 0, st, 'stone'); F.cyl(0, 2.45, 0, 0.22, 0.9, 0, dk, 'stone');
  } });

HOST.WEALTH = { rich: 0.85, manor: 0.9, middle: 0.5, poor: 0.15, shop: 0.5, tavern: 0.5, industrial: 0.3, civic: 0.9, landmark: 1, art: 0.6 };
HOST.LODK = { near: 4.5, far: 13 };
HOST.buildBuildings = function () {
  KratorLOD.enabled = true;
  var protos = {}, list = [], failed = {};
  /* every thing to draw: lots, plaza art, market stalls */
  var items = [];
  PLAN.lots.forEach(function (L) { items.push({ key: L.key, v: L.v, slot: L.slot, x: L.x, y: L.y, z: L.z, ry: L.ry, born: L.born, died: L.died, cls: L.cls, lot: L }); });
  PLAN.greens.forEach(function (G) { if (G.art) items.push({ key: G.art.key === 'fountain' ? 'sl_fountain' : G.art.key, v: 0, slot: 0, x: G.art.x, y: G.art.y - 0.1, z: G.art.z, ry: G.art.ry, born: G.born, died: null, cls: 'art', green: G }); });
  PLAN.districts.forEach(function (D) { (D.art || []).forEach(function (a) { items.push({ key: a.key, v: a.v || 0, slot: 0, x: a.x, y: a.y - 0.05, z: a.z, ry: a.ry, born: D.born, died: null, cls: 'art' }); }); });
  items.forEach(function (it) {
    var pk = it.key + '|' + it.v + '|' + it.slot;
    var P = protos[pk];
    if (!P && !failed[pk]) {
      /* a furniture catalog piece (FURN: benches, statues) has no LOD of its own: its meshes serve near and mid, and it is
         not drawn far */
      var furn = typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[it.key] && !(typeof ASSET_BY_KEY !== 'undefined' && ASSET_BY_KEY[it.key]);
      var g = (furn ? buildFurn : buildAsset)(it.key, 0, 0, 0, { variant: it.v, seed: 7 + it.v * 13 + it.slot * 101, wealth: HOST.WEALTH[it.cls] == null ? 0.5 : HOST.WEALTH[it.cls] });
      if (furn && g && !g.userData.error) {
        var parts = []; g.updateMatrixWorld(true);
        g.traverse(function (m) { if (m.isMesh) parts.push({ geo: m.geometry.clone().applyMatrix4(m.matrixWorld), mat: m.material }); });
        P = protos[pk] = { key: it.key, v: it.v, slot: it.slot, levels: [parts, parts, []], S: 4, items: [], meshes: [] };
        list.push(P);
        scene.remove(g); INSTANCES.splice(INSTANCES.indexOf(g), 1);
      }
      else if (!g || g.userData.error || !g.userData.lod) { failed[pk] = (g && g.userData.error) || 'no build'; if (g) { scene.remove(g); INSTANCES.splice(INSTANCES.indexOf(g), 1); } }
      else {
        var lod = g.userData.lod, levels = lod.levels.map(function (Lv) { return Lv.object.children.map(function (m) { return { geo: m.geometry, mat: m.material }; }); });
        var bb = new THREE.Box3(); lod.levels[0].object.children.forEach(function (m) { m.geometry.computeBoundingBox(); bb.union(m.geometry.boundingBox); });
        var sz = bb.getSize(new THREE.Vector3());
        P = protos[pk] = { key: it.key, v: it.v, slot: it.slot, levels: levels, S: Math.max(sz.y, Math.sqrt(sz.x * sz.z), 4), items: [], meshes: [] };
        list.push(P);
        scene.remove(g); INSTANCES.splice(INSTANCES.indexOf(g), 1);
      }
    }
    if (P) { P.items.push(it); it.proto = P; }
  });
  list.forEach(function (P) {
    P.meshes = P.levels.map(function (lv, li) {
      return lv.map(function (part) {
        var M = new THREE.InstancedMesh(part.geo, part.mat, P.items.length);
        M.frustumCulled = false; M.count = 0; M.visible = false;
        M.userData = { kind: 'building', proto: P.key, level: li, probeSkip: true };
        scene.add(M);
        return M;
      });
    });
  });
  HOST.protos = list; HOST.items = items; HOST.failed = failed;
  HOST.camLast = new THREE.Vector3(1e9, 0, 0);
};

HOST.alive = function (it) { var st = HOST.step; return it.born <= st && (it.died == null || it.died > st); };
var _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _y4 = new THREE.Vector3(0, 1, 0), _p4 = new THREE.Vector3(), _s4 = new THREE.Vector3(1, 1, 1);
HOST.updateBuildings = function (force) {
  if (!HOST.protos) return;
  var cp = camera.position;
  if (!force && cp.distanceTo(HOST.camLast) < 4) return;
  HOST.camLast.copy(cp);
  var on = HOST.layers.buildings, tris = 0, calls = 0;
  HOST.protos.forEach(function (P) {
    var cnt = [0, 0, 0];
    if (on) P.items.forEach(function (it) {
      if (!HOST.alive(it)) return;
      var d = Math.hypot(it.x - cp.x, it.y - cp.y, it.z - cp.z), li = d < P.S * HOST.LODK.near ? 0 : d < P.S * HOST.LODK.far ? 1 : 2;
      _q4.setFromAxisAngle(_y4, it.ry); _p4.set(it.x, it.y, it.z); _m4.compose(_p4, _q4, _s4);
      P.meshes[li].forEach(function (M) { M.setMatrixAt(cnt[li], _m4); });
      cnt[li]++;
    });
    P.meshes.forEach(function (ms, li) {
      ms.forEach(function (M) {
        M.count = cnt[li]; M.visible = cnt[li] > 0; M.instanceMatrix.needsUpdate = true;
        if (M.visible) { calls++; tris += cnt[li] * M.geometry.attributes.position.count / 3; }
      });
    });
  });
  HOST.drawStats = { calls: calls, tris: Math.round(tris) };
};
(window._frameHooks = window._frameHooks || []).push(function () { if (HOST.updateBuildings) HOST.updateBuildings(false); });
