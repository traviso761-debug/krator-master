/* ==== KCharCrowd: figures baked into still, instanced meshes, to draw a crowd far off. [draw] (Godot: not yet) ====
   README, "The plan" 1: a figure (50-figure.js) costs a CPU morph, a skeleton and a draw per piece, so a page can keep
   only the nearest few dozen as figures. Past them a crowd is drawn from a few LOOKS: a figure dressed in one record,
   posed at a frame of a clip and baked into one still mesh (each skinned piece's vertices through its bones, the
   colour its textures and tints give each vertex), then drawn instanced, an instance per citizen who wears that look.
   One draw per look and pose, whatever the crowd's size. Far enough off that a texture is a few pixels, the baked
   colours read as the figure's clothes; the faces and the cloth chains' sway are left to the near figures.

   KCharCrowd.bake(fig, clip, t, cell?) -> Promise of {geo, tris, from}: the figure (applied: fig.apply resolved) as it
       stands at time t of clip (a name in its anims.glb; null: the bind pose), in its own frame (feet at the origin,
       facing +z), every visible piece merged: position, normal, and colour (the piece's map sampled at each vertex's uv,
       64 px, times its material's colour: the skin tone, the hair colour and the dyes, KCharFigure.apply). A piece
       without a map takes its colour. Then made light: its vertices clustered on a grid of `cell` metres (default
       0.05; `from` the triangles before). The figure is left at that frame; play another clip to move on.
   KCharCrowd.set(geo, n, mat?) -> an InstancedMesh with room for n on geo, vertex-coloured (mat: one per page is
       enough, KCharCrowd.material()); put(i, x, y, z, ry, s?) places instance i, flush(k) after a frame's puts draws the
       first k (an instance past them costs nothing).
   KCharCrowd.material() -> the vertex-coloured Lambert every set may share.
*/
var KCharCrowd = (function(){
  var V = function(){ return new THREE.Vector3(); };
  var sampled = new WeakMap();           // a texture's image -> {w, h, px: RGBA bytes}, 64 px on its long side
  function pixels(tex){
    var im = tex && tex.image;
    if(!im || !(im.width > 0)) return null;
    if(sampled.has(im)) return sampled.get(im);
    var s = 64 / Math.max(im.width, im.height), w = Math.max(1, Math.round(im.width * s)), h = Math.max(1, Math.round(im.height * s)), out = null;
    try {
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      var g = cv.getContext('2d'); g.drawImage(im, 0, 0, w, h);
      out = { w: w, h: h, px: g.getImageData(0, 0, w, h).data, flipY: tex.flipY !== false };
    } catch(e){ out = null; }
    sampled.set(im, out);
    return out;
  }
  var lin = function(b){ b /= 255; return b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4); };
  function bakeNow(fig, cell){
    fig.group.updateMatrixWorld(true);
    var inv = new THREE.Matrix4().copy(fig.group.matrixWorld).invert(), pos = [], nor = [], col = [], idx = [], v = V(), M = new THREE.Matrix4();
    fig.group.traverseVisible(function(m){
      if(!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
      var g = m.geometry, P = g.attributes.position, U = g.attributes.uv, I = g.index, mat = Array.isArray(m.material) ? m.material[0] : m.material;
      if(mat && (mat.visible === false || mat.opacity === 0)) return;
      if(m.isSkinnedMesh) m.skeleton.update();
      M.multiplyMatrices(inv, m.matrixWorld);
      var base = pos.length / 3, px = mat && pixels(mat.map), c = mat && mat.color ? mat.color : new THREE.Color(1, 1, 1);
      for(var i = 0; i < P.count; i++){
        v.fromBufferAttribute(P, i);
        if(m.isSkinnedMesh) m.boneTransform(i, v);
        v.applyMatrix4(M);
        pos.push(v.x, v.y, v.z);
        var r = 1, gg = 1, b = 1;
        if(px && U){
          var u = U.getX(i) - Math.floor(U.getX(i)), w = U.getY(i) - Math.floor(U.getY(i));
          var x = Math.min(px.w - 1, Math.floor(u * px.w)), y = Math.min(px.h - 1, Math.floor((px.flipY ? 1 - w : w) * px.h)), k = (y * px.w + x) * 4;
          r = lin(px.px[k]); gg = lin(px.px[k + 1]); b = lin(px.px[k + 2]);
        }
        col.push(r * c.r, gg * c.g, b * c.b);
      }
      var start = g.drawRange ? g.drawRange.start : 0, count = I ? I.count : P.count, end = Math.min(count, g.drawRange && isFinite(g.drawRange.count) ? start + g.drawRange.count : count);
      for(var j = start; j < end; j++) idx.push(base + (I ? I.getX(j) : j));
    });
    return cluster(pos, col, idx, cell);
  }
  /* the baked figure made light for the distance: its vertices clustered on a grid of `cell` metres (each cell's
     vertices one, at their mean, its colour their mean), the triangles that fold to a line or a point dropped. A figure
     of some 60,000 triangles comes to a few thousand at 5 cm, which reads the same past 40 m */
  function cluster(pos, col, idx, cell){
    var nv = pos.length / 3, key = new Map(), of = new Int32Array(nv), P = [], C = [], W = [];
    for(var i = 0; i < nv; i++){
      var k = Math.floor(pos[i * 3] / cell) + ',' + Math.floor(pos[i * 3 + 1] / cell) + ',' + Math.floor(pos[i * 3 + 2] / cell), j = key.get(k);
      if(j === undefined){ j = W.length; key.set(k, j); P.push(0, 0, 0); C.push(0, 0, 0); W.push(0); }
      of[i] = j; W[j]++;
      for(var q = 0; q < 3; q++){ P[j * 3 + q] += pos[i * 3 + q]; C[j * 3 + q] += col[i * 3 + q]; }
    }
    for(j = 0; j < W.length; j++) for(q = 0; q < 3; q++){ P[j * 3 + q] /= W[j]; C[j * 3 + q] /= W[j]; }
    var I = [], seen = new Set();
    for(i = 0; i < idx.length; i += 3){
      var a = of[idx[i]], b = of[idx[i + 1]], c = of[idx[i + 2]];
      if(a === b || b === c || a === c) continue;
      var t = [a, b, c].sort(function(x, y){ return x - y; }).join(',') + (((b - a) * (c - a)) > 0 ? '+' : '-');
      if(seen.has(t)) continue; seen.add(t); I.push(a, b, c);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
    geo.setIndex(W.length > 65535 ? new THREE.Uint32BufferAttribute(I, 1) : new THREE.Uint16BufferAttribute(I, 1));
    geo.computeVertexNormals(); geo.computeBoundingSphere();
    return { geo: geo, tris: I.length / 3, from: idx.length / 3 };
  }
  function bake(fig, clip, t, cell){
    // from a standstill: no cross-fade from the clip before (play() fades over 0.25 s when one is playing)
    fig.mixer.stopAllAction(); fig.action = null;
    return Promise.resolve(fig.play(clip || null)).then(function(){
      if(clip){ fig.update(1e-4); if(t > 0) fig.update(t / (fig.cadence || 1)); }
      return bakeNow(fig, cell == null ? 0.05 : cell);
    });
  }
  var MAT = null;
  function material(){ return MAT || (MAT = new THREE.MeshLambertMaterial({ vertexColors: true })); }
  function set(geo, n, mat){
    var im = new THREE.InstancedMesh(geo, mat || material(), Math.max(1, n));
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; im.count = 0;
    var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = V(), S = V(), Y = new THREE.Vector3(0, 1, 0);
    im.put = function(i, x, y, z, ry, s){ Q.setFromAxisAngle(Y, ry || 0); P.set(x, y, z); S.setScalar(s == null ? 1 : s); M.compose(P, Q, S); im.setMatrixAt(i, M); };
    // the first n instances drawn (put them 0 .. n-1 each frame): an instance past n costs nothing
    im.flush = function(n){ im.count = n; im.instanceMatrix.needsUpdate = true; };
    return im;
  }
  return { bake: bake, set: set, material: material };
})();
