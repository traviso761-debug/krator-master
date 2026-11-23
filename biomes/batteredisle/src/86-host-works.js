// ================================================================= HOST — KTAGS reserves, KHAZ registration & ?works=0 exile props [draw]
const WORKS = [];
const RESERVES_DRAWN = [];

(function(){
 /* 1. Always register KTAGS site:* settlement/beacon reserves (site:battered-port-rim & site:seamount-beacon) */
 const reserves = STAGE.reserves || [];
 for (let i = 0; i < reserves.length; i++) {
  const rv = reserves[i];
  const y = terrainH(rv.x, rv.z);
  REGISTER({
   tagId: rv.id,
   tagClass: 'site',
   name: rv.name,
   key: rv.id,
   kind: 'site',
   x: rv.x, y: y, z: rv.z,
   r: rv.r, h: 24,
   tags: { reserve: rv.id, settlement: 'battered-port', elevASL: +(STAGE.elevOffset + y).toFixed(1) }
  });
  RESERVES_DRAWN.push(rv);
 }

 /* 2. Register all data-driven KHAZ hazard volumes (blowholes, tsunami bench, radial-dike reefs) */
 const hazards = STAGE.hazards || [];
 for (let i = 0; i < hazards.length; i++) {
  const hz = hazards[i];
  const hazObj = hz.haz || (typeof KHAZ !== 'undefined' && hz.hazSpec ? KHAZ.make(hz.hazSpec) : hz.hazSpec);
  hz.haz = hazObj;
  REGISTER({
   tagId: hz.id,
   tagClass: 'feature',
   name: hz.name,
   key: hz.kind,
   kind: 'hazard',
   x: hz.x, y: hz.y, z: hz.z,
   r: hz.r, h: hz.h,
   tags: { biome: 'batteredisle', hazardKind: hz.kind, hazard: hazObj }
  });
 }

 /* 3. Optional ?works=0 Unpainted Exile leading-cairns, spring cooperage landing & coal=201 bunkering cuts */
 if (PQ.get('works') === '0') return;

 function makeBoxMesh(w, h, d, mat, aoBot){
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
   const ao = p.getY(i) < 0 ? aoBot : 1.0;
   col[i * 3] = ao; col[i * 3 + 1] = ao; col[i * 3 + 2] = ao;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(g, mat);
 }

 let woodMat = BATTER.MAT.rockScoria;
 if (typeof KMAT !== 'undefined' && KMAT.mode === 'lib' && KMAT.packed) {
  const pw = KMAT.packed('batteredisle', 'works.wood');
  if (pw) {
   const tx = KMAT.textures(pw, { aniso: 8 });
   woodMat = new THREE.MeshStandardMaterial({ vertexColors: true, map: tx.map, normalMap: tx.normalMap, roughnessMap: tx.roughnessMap, roughness: 0.78, metalness: 0.04 });
  }
 }

 const wList = STAGE.works || [];
 for (let i = 0; i < wList.length; i++) {
  const w = wList[i];
  const y = terrainH(w.x, w.z);
  const grp = new THREE.Group();
  grp.position.set(w.x, y, w.z);
  grp.name = w.id;

  if (w.kind === 'cairn') {
   /* Unmasked chiselled-blank basalt leading-mark cairn ("No Mask Above the Door") */
   const base = makeBoxMesh(2.2, 0.9, 2.2, BATTER.MAT.rockBasalt, 0.72);
   base.position.y = 0.35;
   const shaft = makeBoxMesh(1.1, 2.4, 0.85, BATTER.MAT.rockBasalt, 0.78);
   shaft.position.y = 1.95;
   /* Recessed chiselled-blank plaque in place of any ancestor mask */
   const blank = makeBoxMesh(0.65, 0.55, 0.92, BATTER.MAT.rockScoria, 0.85);
   blank.position.y = 2.15;
   grp.add(base, shaft, blank);
  } else if (w.kind === 'cooperage') {
   /* Palagonite freshwater spring-cask landing platform & tarred timber water casks */
   const deck = makeBoxMesh(4.6, 0.45, 3.2, woodMat, 0.72);
   deck.position.y = 0.2;
   const wall = makeBoxMesh(4.6, 1.1, 0.55, BATTER.MAT.rockPalagonite, 0.74);
   wall.position.set(0, 0.55, -1.35);
   grp.add(deck, wall);
   for (let k = -1; k <= 1; k++) {
    const cg = new THREE.CylinderGeometry(0.42, 0.46, 0.95, 10);
    const cp = cg.attributes.position, cc = new Float32Array(cp.count * 3);
    for (let v = 0; v < cp.count; v++) { cc[v * 3] = 0.86; cc[v * 3 + 1] = 0.82; cc[v * 3 + 2] = 0.78; }
    cg.setAttribute('color', new THREE.BufferAttribute(cc, 3));
    const cask = new THREE.Mesh(cg, woodMat);
    cask.position.set(k * 1.15, 0.9, 0.35);
    grp.add(cask);
   }
  } else {
   /* Smuggler upturned coal=201 bunkering cut / veiled strait lantern niche */
   const bench = makeBoxMesh(4.2, 1.2, 2.6, BATTER.MAT.rockCoal, 0.70);
   bench.position.y = 0.45;
   const timber = makeBoxMesh(4.4, 0.28, 0.32, woodMat, 0.80);
   timber.position.set(0, 1.15, 1.15);
   grp.add(bench, timber);
  }

  grp.traverse(function(o){
   if (o.isMesh) {
    o.userData.host = true;
    o.userData.inspectLabel = w.name + ' (Unpainted Exile coastal mark, ?works=0 hides)';
   }
  });
  scene.add(grp);
  OBSTACLES.push({ x: w.x, z: w.z, r: w.r + 1.5 });
  REGISTER({
   tagId: w.id,
   tagClass: 'furniture',
   name: w.name,
   key: w.kind,
   kind: 'furniture',
   x: w.x, y: y, z: w.z,
   r: w.r, h: 3.2,
   tags: { culture: 'eternian', subculture: 'exile-unpainted' }
  });
  WORKS.push(Object.assign({ y: y }, w));
 }
})();
