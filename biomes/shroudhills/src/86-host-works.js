// ================================================================= HOST — Yonni Spear-Queen works & ravine coal-seam ledges [draw]
// Registers every structure in KTAGS (REGISTER) and OBSTACLES BEFORE SHROUDHILLS.build() runs (88-host-scene.js).
// 100% genuine library PBR textures from materials.json: works.stone, works.lime, works.bronze, rock.granite, rock.coal.
const WORKS = [];
const COAL_LEDGES = [];

(function(){
 const makeLibStdMat = function(slot, fallbackHex, rough, metal, rep){
  let map = null, normalMap = null, roughnessMap = null;
  if (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed) {
   const P = KMAT.packed('shroudhills', slot);
   if (P) {
    const tx = KMAT.textures(P, { aniso: 8 });
    map = tx.map || null;
    normalMap = tx.normalMap || null;
    roughnessMap = tx.roughnessMap || null;
   }
  }
  if (!map) {
   map = BIO.canvasTex(64, 64, function(g, w, h){
    g.fillStyle = '#' + ('000000' + fallbackHex.toString(16)).slice(-6);
    g.fillRect(0, 0, w, h);
   });
  }
  [map, normalMap, roughnessMap].forEach(function(t){
   if (!t) return;
   t.wrapS = t.wrapT = THREE.RepeatWrapping;
   if (rep) t.repeat.set(rep[0], rep[1]);
  });
  return new THREE.MeshStandardMaterial({
   color: 0xffffff,
   map: map,
   normalMap: normalMap,
   roughnessMap: roughnessMap,
   roughness: rough,
   metalness: metal
  });
 };

 const MAT_STONE = makeLibStdMat('works.stone', 0x76746e, 0.88, 0.02, [2.2, 2.2]);
 const MAT_LIME = makeLibStdMat('works.lime', 0xdcdad0, 0.82, 0.02, [2.0, 1.5]);
 const MAT_BRONZE = makeLibStdMat('works.bronze', 0x567868, 0.42, 0.65, [1.5, 1.5]);
 const MAT_GRANITE = makeLibStdMat('rock.granite', 0xbcbab2, 0.84, 0.03, [2.0, 2.0]);
 const MAT_COAL = makeLibStdMat('rock.coal', 0x222428, 0.34, 0.12, [2.4, 1.2]);

 const addPart = function(grp, geo, mat, x, y, z, label){
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.userData.host = true;
  m.userData.inspectLabel = label;
  grp.add(m);
  return m;
 };

 // 1. Yonni Spear-Queen works (YC1 round watch-drum plinth, smudge-cairns, smoking myrtle-smudge braziers, dressed granite stones)
 const list = STAGE.works || [];
 for (let i = 0; i < list.length; i++) {
  const w = list[i];
  const y = terrainH(w.x, w.z);
  const grp = new THREE.Group();
  grp.position.set(w.x, y, w.z);
  grp.rotation.y = w.ry == null ? 0 : w.ry;
  grp.userData.host = true;

  if (w.kind === 'yc1_plinth') {
   const r = w.r == null ? 6.2 : w.r;
   // Register YC1 watch-drum site reserve BEFORE drawing (CROOK-RIA-DECISIONS.md section 2.5.6: zero-podium telescoping root-skirt!)
   REGISTER({
    name: w.name,
    key: 'yonni_yc1_watch_plinth',
    cls: 'landmark',
    kind: 'watch-plinth',
    x: w.x, z: w.z, y: y - 5.5,
    r: r + 2.2,
    h: 11.5,
    tags: {
     types: ['military'],
     style: 'yonni-yc1',
     role: 'spear-queen-watch-plinth',
     landmark: true
    }
   });
   OBSTACLES.push({ x: w.x, z: w.z, r: r + 4.5, y0: y - 8, y1: y + 16 });

   // Telescoping battered salt-grey granite & cobble root-skirt plunging 6.5 m below y = 0 (zero flat rectangular pad!)
   addPart(grp, new THREE.CylinderGeometry(r * 0.94, r * 1.18, 7.6, 24), MAT_STONE, 0, -2.7, 0, w.name + ' - battered cobble root-skirt');
   // Crushed-shell hydraulic sea-lime upper watch-drum collar
   addPart(grp, new THREE.CylinderGeometry(r * 0.90, r * 0.94, 2.3, 24), MAT_LIME, 0, 2.2, 0, w.name + ' - sea-lime drum wall');
   // Annular rain-shedding watershed skirt & verdigris-bronze Twin-Queen parapet ring
   addPart(grp, new THREE.CylinderGeometry(r * 1.06, r * 1.14, 0.34, 24), MAT_BRONZE, 0, 1.15, 0, w.name + ' - annular rain-visor skirt');
   addPart(grp, new THREE.TorusGeometry(r * 0.91, 0.22, 8, 28).rotateX(Math.PI * 0.5), MAT_BRONZE, 0, 3.38, 0, w.name + ' - verdigris-bronze Twin-Queen ring');
   // Paved granite watch deck & twin socketed spear-standard bosses
   addPart(grp, new THREE.CylinderGeometry(r * 0.88, r * 0.88, 0.26, 24), MAT_GRANITE, 0, 3.28, 0, w.name + ' - granite watch-drum deck');
   [-1.8, 1.8].forEach(function(sx){
    addPart(grp, new THREE.CylinderGeometry(0.45, 0.58, 0.85, 12), MAT_STONE, sx, 3.78, 0, w.name + ' - Twin-Queen standard socket');
    addPart(grp, new THREE.CylinderGeometry(0.08, 0.10, 3.4, 8), MAT_BRONZE, sx, 5.6, 0, w.name + ' - Spear-Queen bronze standard');
   });
   // Drum-hugging stone access steps on the SW trail approach
   for (let st = 0; st < 6; st++) {
    const sa = 2.35 + st * 0.22;
    const stepGeo = new THREE.BoxGeometry(1.4, 0.42, 0.9);
    const sm = addPart(grp, stepGeo, MAT_GRANITE, Math.cos(sa) * (r * 0.98), 0.35 + st * 0.52, Math.sin(sa) * (r * 0.98), w.name + ' - contour stair');
    sm.rotation.y = -sa;
   }
   WORKS.push({ kind: w.kind, x: w.x, y: y + 3.4, z: w.z, r: r, name: w.name });
  } else if (w.kind === 'cairn') {
   REGISTER({
    name: w.name,
    key: 'yonni_smudge_cairn',
    cls: 'landmark',
    kind: 'cairn',
    x: w.x, z: w.z, y: y - 1.2,
    r: 2.2,
    h: 4.4,
    tags: { style: 'yonni', role: 'smudge-cairn' }
   });
   OBSTACLES.push({ x: w.x, z: w.z, r: 2.6, y0: y - 2, y1: y + 5 });

   addPart(grp, new THREE.CylinderGeometry(0.92, 1.28, 1.5, 12), MAT_STONE, 0, 0.45, 0, w.name);
   addPart(grp, new THREE.CylinderGeometry(0.68, 0.88, 1.05, 12), MAT_LIME, 0, 1.65, 0, w.name);
   addPart(grp, new THREE.ConeGeometry(0.86, 0.58, 12), MAT_BRONZE, 0, 2.42, 0, w.name + ' - bronze rain-cap');
   WORKS.push({ kind: w.kind, x: w.x, y: y + 1.5, z: w.z, r: 1.4, name: w.name });
  } else if (w.kind === 'brazier') {
   REGISTER({
    name: w.name,
    key: 'yonni_smudge_brazier',
    cls: 'fixture',
    kind: 'brazier',
    x: w.x, z: w.z, y: y - 0.8,
    r: 1.8,
    h: 3.2,
    tags: { style: 'yonni', role: 'myrtle-smudge-brazier', light: 'brazier', lit: true }
   });
   OBSTACLES.push({ x: w.x, z: w.z, r: 2.0, y0: y - 2, y1: y + 4 });

   addPart(grp, new THREE.CylinderGeometry(0.42, 0.62, 1.15, 10), MAT_STONE, 0, 0.38, 0, w.name + ' - stone pedestal');
   addPart(grp, new THREE.CylinderGeometry(0.68, 0.36, 0.44, 12), MAT_BRONZE, 0, 1.12, 0, w.name + ' - bronze smudge bowl');
   // Rain-hood suspended on 3 struts so smudge-resin keeps smouldering in 2,700 mm/yr squalls!
   addPart(grp, new THREE.ConeGeometry(0.82, 0.38, 12), MAT_BRONZE, 0, 1.88, 0, w.name + ' - squall rain-hood');
   for (let p = 0; p < 3; p++) {
    const pa = p * TAU / 3;
    addPart(grp, new THREE.CylinderGeometry(0.035, 0.035, 0.62, 6), MAT_BRONZE, Math.cos(pa) * 0.52, 1.52, Math.sin(pa) * 0.52, w.name);
   }
   WORKS.push({ kind: w.kind, x: w.x, y: y + 1.4, z: w.z, r: 1.2, name: w.name, smokeY: y + 1.45 });
  } else {
   REGISTER({
    name: w.name,
    key: 'yonni_trail_stones',
    cls: 'infrastructure',
    kind: w.kind,
    x: w.x, z: w.z, y: y - 1.0,
    r: 4.2,
    h: 2.5,
    tags: { style: 'yonni', role: 'safe-stone-path' }
   });
   OBSTACLES.push({ x: w.x, z: w.z, r: 3.2, y0: y - 2, y1: y + 3 });
   for (let s = -2; s <= 2; s++) {
    const sy = terrainH(w.x + s * 0.3, w.z + s * 1.45) - y;
    addPart(grp, new THREE.CylinderGeometry(0.72, 0.82, 0.36, 8), MAT_GRANITE, s * 0.25, sy + 0.08, s * 1.45, w.name);
   }
   WORKS.push({ kind: w.kind, x: w.x, y: y + 0.3, z: w.z, r: 3.0, name: w.name });
  }

  scene.add(grp);
 }

 // 2. Exposed glossy black coal-seam ledges (coal = 219 in geology.json) cropping out of Station 2's ravine walls!
 const coals = STAGE.coalLedges || [];
 for (let c = 0; c < coals.length; c++) {
  const cl = coals[c];
  const cy = terrainH(cl.x, cl.z);
  const label = 'Exposed Shroudhills coal-seam outcrop (coal = 219)';
  REGISTER({
   name: label,
   key: 'shroudhills_coal_seam',
   cls: 'feature',
   kind: 'coal-seam',
   x: cl.x, z: cl.z, y: cy - 1.8,
   r: Math.max(cl.w, cl.d) * 0.65,
   h: cl.h + 2.8,
   tags: { rock: 'coal', role: 'coal-seam' }
  });
  OBSTACLES.push({ x: cl.x, z: cl.z, r: cl.d * 0.8, y0: cy - 2, y1: cy + cl.h + 2 });

  const seamGrp = new THREE.Group();
  seamGrp.position.set(cl.x, cy + cl.h * 0.28, cl.z);
  seamGrp.rotation.y = cl.ry == null ? 0 : cl.ry;
  seamGrp.userData.host = true;
  addPart(seamGrp, new THREE.BoxGeometry(cl.d, cl.h, cl.w), MAT_COAL, 0, 0, 0, label);
  addPart(seamGrp, new THREE.BoxGeometry(cl.d * 0.92, cl.h * 0.38, cl.w * 1.06), MAT_STONE, 0, cl.h * 0.62, 0, 'Ironstone caprock over coal seam');
  scene.add(seamGrp);
  COAL_LEDGES.push({ x: cl.x, y: cy + cl.h * 0.5, z: cl.z });
 }
})();
