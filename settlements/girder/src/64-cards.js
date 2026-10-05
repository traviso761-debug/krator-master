/* ============================== 15b. LIBRARY CARDS: the rest of the Beast Rider plant and net sheets ==============================
   The library's cut-out sheets beyond the trees' own cards and the undergrowth atlas (62-jungle.js):
     bromeliad and screwpine rosettes and moss cushions on the forest floor, lying flat as they were drawn (from above),
     screwpines along the brook, young mahoganies and flowering shrubs as crossed cards, maize along the kitchen-garden
     fences, and cargo nets hung in every second roost stall.
   One atlas (4 x 2 cells of 512 px, filled as the packed images decode), one merged mesh, one draw call. It draws
   from its OWN generator, seeded here, so the world's random stream (rnd) is untouched, and it adds nothing under
   ?mat=proc or when no card is packed. window._cards: the counts. */
(function(){
  var CELLS = ['c_brom', 'c_screw', 'c_moss', 'c_crop', 'c_flower', 'c_mahog', 'c_net', 'c_screw2'];
  var CARDS = { on:false, brom:0, screw:0, moss:0, crop:0, flower:0, mahog:0, net:0, tris:0 };
  window._cards = CARDS;
  if(!(typeof KMAT !== 'undefined' && KMAT.mode === 'lib')) return;
  var Ls = CELLS.map(function(f){ return KMAT.packed('girder', f); });
  if(!Ls.some(Boolean)) return;
  CARDS.on = true;

  var st = 0x6c1f3a9b;                 /* mulberry32: this fragment's own stream */
  function rand(){ st = (st + 0x6D2B79F5) | 0; var t = Math.imul(st ^ (st >>> 15), 1 | st); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function rn(a, b){ return a + (b - a) * rand(); }

  /* the atlas: cell i at column i%4, row floor(i/4) from the top */
  var CW = 512, cv = document.createElement('canvas'); cv.width = CW * 4; cv.height = CW * 2;
  var g2 = cv.getContext('2d');
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding; tex.anisotropy = FAST ? 1 : 4;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  Ls.forEach(function(L, i){ if(!L) return;
    KMAT.image(L, function(img){ g2.drawImage(img, (i % 4) * CW, Math.floor(i / 4) * CW, CW, CW); tex.needsUpdate = true; }); });
  function cellUV(i){ var cx = i % 4, cy = Math.floor(i / 4), eu = 3 / (CW * 4), ev = 3 / (CW * 2);
    return [cx / 4 + eu, 1 - (cy + 1) / 2 + ev, (cx + 1) / 4 - eu, 1 - cy / 2 - ev]; }

  var pos = [], nor = [], uv = [], col = [];
  /* a quad bl, br, tr, tl (CCW from its normal side) on cell `cell`, shade k */
  function quad(P, n, cell, k){
    if(!Ls[cell]) return;
    var U = cellUV(cell), T = [[U[0],U[1]], [U[2],U[1]], [U[2],U[3]], [U[0],U[3]]];
    [0,1,2, 0,2,3].forEach(function(j){ pos.push(P[j][0], P[j][1], P[j][2]); nor.push(n[0], n[1], n[2]); uv.push(T[j][0], T[j][1]); col.push(k, k, k); });
    CARDS.tris += 2;
  }
  /* a rosette or cushion lying on the ground, seen from above: centre x z, size s, yaw a */
  function flat(x, z, s, a, cell, k){
    var y = terrainH(x, z) + 0.12, ux = Math.cos(a) * s / 2, uz = Math.sin(a) * s / 2, vx = -uz, vz = ux;
    quad([[x-ux-vx, y, z-uz-vz], [x+ux-vx, y, z+uz-vz], [x+ux+vx, y, z+uz+vz], [x-ux+vx, y, z-uz+vz]], [0,1,0], cell, k);
  }
  /* a plant as two crossed upright cards: base x z, width w, height h, yaw a */
  function cross(x, z, w, h, a, cell, k, y0){
    var y = y0 != null ? y0 : terrainH(x, z) - 0.05;
    for(var q = 0; q < 2; q++){ var b = a + q * Math.PI / 2, ux = Math.cos(b) * w / 2, uz = Math.sin(b) * w / 2;
      quad([[x-ux, y, z-uz], [x+ux, y, z+uz], [x+ux, y+h, z+uz], [x-ux, y+h, z-uz]], [-Math.sin(b), 0, Math.cos(b)], cell, k); }
  }
  function nearTrunk(x, z, pad){ for(var i = 0; i < TREES.length; i++){ var T = TREES[i]; if(Math.hypot(x - T.x, z - T.z) < T.rb * 1.6 + pad) return true; } return false; }

  /* 1. round every hypertree's foot: bromeliads, moss cushions, the odd screwpine */
  TREES.forEach(function(T){
    var n = 4 + Math.floor(rand() * 5);
    for(var i = 0; i < n; i++){
      var a = rn(0, TAU), r = T.rb * rn(1.9, 3.3), x = T.x + Math.cos(a) * r, z = T.z + Math.sin(a) * r, u = rand();
      if(riverDist(x, z) < 3) continue;
      if(u < 0.45){ flat(x, z, rn(1.6, 2.6), rn(0, TAU), 0, rn(0.85, 1)); CARDS.brom++; }
      else if(u < 0.82){ flat(x, z, rn(1.6, 3.2), rn(0, TAU), 2, rn(0.8, 1)); CARDS.moss++; }
      else { flat(x, z, rn(2.4, 3.8), rn(0, TAU), rand() < 0.5 ? 1 : 7, rn(0.85, 1)); CARDS.screw++; }
    }
  });
  /* 2. screwpines along the brook, outside the palisade */
  for(var t = 0, put = 0; t < 2400 && put < 70; t++){
    var x = rn(-1300, 1300), z = rn(-1300, 1300), d = riverDist(x, z);
    if(d < 3 || d > 16 || Math.hypot(x, z) < PALISADE.R + 30 || nearTrunk(x, z, 4)) continue;
    flat(x, z, rn(2.6, 4.4), rn(0, TAU), rand() < 0.5 ? 1 : 7, rn(0.85, 1)); CARDS.screw++; put++;
  }
  /* 3. young mahoganies in the forest ring */
  for(var t2 = 0, put2 = 0; t2 < 3000 && put2 < 36; t2++){
    var x2 = rn(-950, 950), z2 = rn(-950, 950), r2 = Math.hypot(x2, z2);
    if(r2 < PALISADE.R + 70 || r2 > 950 || riverDist(x2, z2) < 8 || nearTrunk(x2, z2, 10)) continue;
    cross(x2, z2, rn(3.2, 5), rn(3.8, 6.2), rn(0, TAU), 5, rn(0.82, 1)); CARDS.mahog++; put2++;
  }
  /* 4. flowering shrubs in a loose ring outside the palisade */
  for(var t3 = 0, put3 = 0; t3 < 2000 && put3 < 44; t3++){
    var a3 = rn(0, TAU), r3 = PALISADE.R + rn(8, 26), x3 = Math.cos(a3) * r3, z3 = Math.sin(a3) * r3, gate = false;
    GATES.forEach(function(g){ if(Math.abs(Math.atan2(Math.sin(a3 - Math.atan2(g.z, g.x)), Math.cos(a3 - Math.atan2(g.z, g.x)))) < 0.09) gate = true; });
    if(gate || riverDist(x3, z3) < 4) continue;
    cross(x3, z3, rn(1.4, 2.2), rn(1.1, 1.7), rn(0, TAU), 4, rn(0.88, 1)); CARDS.flower++; put3++;
  }
  /* 5. maize along the kitchen-garden and crop-plot fences, just inside them */
  PLOTS.forEach(function(p){
    if(p.kind !== 'garden' && p.kind !== 'crop') return;
    var hx = p.w / 2 - 0.55, hz = p.d / 2 - 0.55, step = 1.5;
    [[-hx,-hz,hx,-hz], [hx,-hz,hx,hz], [hx,hz,-hx,hz], [-hx,hz,-hx,-hz]].forEach(function(e, side){
      if(p.kind === 'crop' && side % 2) return;                 /* crop plots: two sides only, the rows run between */
      var L = Math.hypot(e[2] - e[0], e[3] - e[1]), n = Math.max(1, Math.floor(L / step));
      for(var i = 0; i <= n; i++){ if(rand() < 0.25) continue;
        var f = i / n, x = p.x + e[0] + (e[2] - e[0]) * f, z = p.z + e[1] + (e[3] - e[1]) * f;
        cross(x, z, rn(1.0, 1.5), rn(1.4, 2.1), rn(0, TAU), 3, rn(0.85, 1), p.y + 0.05); CARDS.crop++; }
    });
  });
  /* 6. a cargo net hung on a partition of every second roost stall */
  ROOSTS.forEach(function(R){
    if(R.id % 2) return;
    var rx = -R.oz, rz = R.ox, hw = R.w / 2, sd = (R.id % 4) ? -1 : 1, lat = sd * (hw - 0.14), z0 = -6.4, z1 = -4.5, y0 = R.y + 0.7, y1 = R.y + 2.5;
    function at(lz){ return [R.x + rx * lat + R.ox * lz, R.z + rz * lat + R.oz * lz]; }
    var a = at(z0), b = at(z1);
    quad([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], [rx * -sd, 0, rz * -sd], 6, 0.95); CARDS.net++;
  });

  if(!pos.length) return;
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeBoundingSphere();
  var mat = new THREE.MeshLambertMaterial({ map:tex, vertexColors:true, alphaTest:0.45, side:THREE.DoubleSide });
  nlMaterial(mat, 'libcards');
  var mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = !FAST;
  mesh.userData.inspectLabel = 'Bromeliads, screwpines, moss, young mahoganies, flowers, maize and nets (library cards)';
  scene.add(mesh);
})();
