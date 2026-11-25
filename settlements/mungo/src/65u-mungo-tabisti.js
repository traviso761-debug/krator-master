/* ============================== 16U. THE URBAN TABISTI KIT — Mungo adapter ==============================
   Registers all 50 Urban Tabisti buildings from TBK (65t-tabisti-bundle.js, kits/tabisti/kit_bundle.py)
   into Locus/Mungo's ASSET_BY_KEY registry so 30-layout.js and 68-place.js place them through buildAsset()
   identically to native assets.

   Each placed Tabisti building is cached by (key, variant) from TBK.proto(), its doors are rotated into
   world space for F.doors (core/simulation walks up to them), its warm oil/naphtha lamps are registered
   into NL_LAMPS (never electric — electric light remains strictly inside the Geomancer quarter), and all
   placed geometry is merged by material into one THREE.Mesh per material in YUNI_FINISHERS so 40+ Tabisti
   buildings cost only ~14 draw calls total. */
var MUNGO_TABISTI = { placed: 0, drawCalls: 0, tris: 0, lamps: 0, byKey: {} };
(function(){
  if(typeof TBK === 'undefined' || !TBK || !TBK.dims) return;
  var dims = TBK.dims(), protoCache = {}, queued = [];

  function getProto(key, v){
    var ck = key + '#' + (v | 0);
    if(!protoCache[ck]){
      var g = TBK.proto(key, v | 0);
      if(g) g.updateMatrixWorld(true);
      protoCache[ck] = g;
    }
    return protoCache[ck];
  }

  function mergeByMaterial(list){
    var totalV = 0, totalI = 0, hasUv = false, hasCol = false;
    for(var i = 0; i < list.length; i++){
      var g = list[i], p = g.getAttribute('position');
      if(!p) continue;
      totalV += p.count;
      totalI += g.index ? g.index.count : p.count;
      if(g.getAttribute('uv')) hasUv = true;
      if(g.getAttribute('color')) hasCol = true;
    }
    if(!totalV) return null;
    var pos = new Float32Array(totalV * 3);
    var nrm = new Float32Array(totalV * 3);
    var uv = hasUv ? new Float32Array(totalV * 2) : null;
    var col = hasCol ? new Float32Array(totalV * 3) : null;
    var idx = new Uint32Array(totalI);
    var vo = 0, io = 0;
    for(var j = 0; j < list.length; j++){
      var g2 = list[j], p2 = g2.getAttribute('position');
      if(!p2) continue;
      var vc = p2.count, n2 = g2.getAttribute('normal'), u2 = g2.getAttribute('uv'), c2 = g2.getAttribute('color');
      pos.set(p2.array, vo * 3);
      if(n2) nrm.set(n2.array, vo * 3);
      else { for(var k = 0; k < vc; k++) nrm[(vo + k) * 3 + 1] = 1; }
      if(uv){
        if(u2) uv.set(u2.array, vo * 2);
      }
      if(col){
        if(c2) col.set(c2.array, vo * 3);
        else { for(var k2 = 0; k2 < vc * 3; k2++) col[vo * 3 + k2] = 1; }
      }
      if(g2.index){
        var ia = g2.index.array;
        for(var m = 0; m < ia.length; m++) idx[io + m] = ia[m] + vo;
        io += ia.length;
      } else {
        for(var m2 = 0; m2 < vc; m2++) idx[io + m2] = vo + m2;
        io += vc;
      }
      vo += vc;
    }
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    if(uv) out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if(col) out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    out.computeBoundingSphere();
    return out;
  }

  Object.keys(dims).forEach(function(key){
    var D = dims[key];
    ASSET({
      key: key,
      name: D.name,
      family: 'tabisti',
      culture: 'eastabyss',
      type: D.types && D.types.length ? D.types[0] : 'house',
      w: D.w,
      d: D.d,
      h: D.h,
      variants: D.variants == null ? 1 : D.variants,
      build: function(F){
        var proto = getProto(key, F.variant || 0);
        if(!proto) return;
        queued.push({ proto: proto, x: F.x, y: F.y, z: F.z, ry: F.ry || 0, key: key });
        MUNGO_TABISTI.placed++;
        MUNGO_TABISTI.byKey[key] = (MUNGO_TABISTI.byKey[key] || 0) + 1;
        MUNGO_TABISTI.tris += (proto.userData && proto.userData.tris) || 0;
        var fix = proto.userData && proto.userData.fixtures;
        if(fix){
          var c = Math.cos(F.ry || 0), s = Math.sin(F.ry || 0);
          (fix.doors || []).forEach(function(dr){
            var wx = F.x + dr.x * c + dr.z * s, wz = F.z - dr.x * s + dr.z * c;
            (F.doors || (F.doors = [])).push([wx, F.y + (dr.y || 0), wz]);
            (F.doorIds || (F.doorIds = [])).push(null);
          });
          (fix.lamps || []).forEach(function(lp){
            var lx = F.x + lp.x * c + lp.z * s, lz = F.z - lp.x * s + lp.z * c;
            nlLampAdd(lx, F.y + (lp.y || 2.5), lz, lp.big ? 1.05 : 0.72, lp.big ? 14 : 9, false);
            MUNGO_TABISTI.lamps++;
          });
        }
      }
    });
  });

  (window.YUNI_FINISHERS = window.YUNI_FINISHERS || []).push(function(){
    if(!queued.length) return;
    var buckets = {}, matOrder = [], tmpM = new THREE.Matrix4(), rotM = new THREE.Matrix4(), worldM = new THREE.Matrix4();
    queued.forEach(function(item){
      tmpM.makeTranslation(item.x, item.y, item.z);
      rotM.makeRotationY(item.ry);
      tmpM.multiply(rotM);
      item.proto.traverse(function(o){
        if(!o.isMesh || !o.geometry || !o.material) return;
        var mat = o.material, id = mat.uuid;
        if(!buckets[id]){ buckets[id] = { mat: mat, geos: [] }; matOrder.push(id); }
        var g = o.geometry.clone();
        worldM.copy(tmpM).multiply(o.matrixWorld);
        g.applyMatrix4(worldM);
        buckets[id].geos.push(g);
      });
    });
    var calls = 0;
    matOrder.forEach(function(id){
      var B = buckets[id], merged = mergeByMaterial(B.geos);
      B.geos.forEach(function(g){ g.dispose(); });
      if(!merged) return;
      var m = new THREE.Mesh(merged, B.mat);
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.inspectLabel = 'Urban Tabisti masonry (kits/tabisti) · culture: eastabyss';
      scene.add(m);
      calls++;
    });
    MUNGO_TABISTI.drawCalls = calls;
    BUDGET.drawCalls += calls;
    if(TBK.ANIMU && TBK.ANIMU.uTime){
      TICKS.push(function(dt){ TBK.ANIMU.uTime.value += dt; });
    }
    window._tabisti = MUNGO_TABISTI;
  });
})();
