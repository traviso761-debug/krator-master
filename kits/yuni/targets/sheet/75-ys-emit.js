/* ============================== KIT SHEET: EMIT + GROUND ==============================
   The engine's buckets become meshes once (45-kit.js emitBuckets, emitMerged), as Yuni's 75-terrain.js drains them; then
   nothing may push into the kit (KIT_EMITTED). The ground is one flat plane under the rows: a 10 m grid, the family bands,
   each footprint outlined, a blue tab on its FRONT (+z of the asset, here the north side), painted on a canvas (a texture
   only: nothing is placed from it). 81-glow.js (the engine's, after this) then bakes the night light volume and the panes. */
var EMIT = emitBuckets(), EMITM = emitMerged();
KIT_EMITTED = true;
window._stats = { instances:EMIT.instances, instMeshes:EMIT.meshes, mergedTris:EMITM.tris, mergedMeshes:EMITM.meshes };

var ysGround = (function(){
  var E = YS_EXT, W = E.x1-E.x0, D = E.z1-E.z0, PX = 4;   /* canvas pixels a metre */
  var c = document.createElement('canvas'); c.width = Math.ceil(W*PX); c.height = Math.ceil(D*PX);
  var g = c.getContext('2d'); g.scale(PX, PX); g.translate(-E.x0, -E.z0);
  g.fillStyle = YS_GROUND_COL; g.fillRect(E.x0, E.z0, W, D);
  SHEET_ROWS.forEach(function(r, i){ g.fillStyle = i%2 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'; g.fillRect(E.x0, r.z0-8, W, r.z1-r.z0-4); });
  g.strokeStyle = 'rgba(90,70,40,0.35)'; g.lineWidth = 0.15; g.beginPath();
  for(var k = Math.ceil(E.x0/10)*10; k <= E.x1; k += 10){ g.moveTo(k, E.z0); g.lineTo(k, E.z1); }
  for(var m = Math.ceil(E.z0/10)*10; m <= E.z1; m += 10){ g.moveTo(E.x0, m); g.lineTo(E.x1, m); }
  g.stroke();
  SHEET_ITEMS.forEach(function(it){ g.fillStyle = 'rgba(205,191,159,0.9)'; g.fillRect(it.x-it.w/2-1.5, it.z-it.d/2-1.5, it.w+3, it.d+3);
    g.strokeStyle = 'rgba(40,60,110,0.8)'; g.lineWidth = 0.25; g.strokeRect(it.x-it.w/2, it.z-it.d/2, it.w, it.d);
    g.fillStyle = 'rgba(40,60,110,0.9)'; g.fillRect(it.x-1.5, it.z-it.d/2-2.4, 3, 2.4); });   /* the front faces north (ry = PI) */
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = FAST ? 2 : 8;
  var mat = nlMaterial(new THREE.MeshLambertMaterial({ map:t }), 'ys-ground');
  var geo = new THREE.PlaneGeometry(W, D).rotateX(-Math.PI/2).translate((E.x0+E.x1)/2, 0, (E.z0+E.z1)/2);
  var mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = !FAST; mesh.name = 'ground'; mesh.userData.inspectLabel = 'Inspection ground'; mesh.userData.isGround = true;
  scene.add(mesh); return mesh;
})();
