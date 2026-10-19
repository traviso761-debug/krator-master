/* ================================================================= CORE PORTS — a building marked where it is drawn ([draw])
   core/ports/README.md. A town on the Voth-lineage kit (45-kit.js: BUCKET, the instanced shapes; MBK, the merged
   triangles; a catalog furniture pass) draws its buildings into town-wide buckets, so nothing there is per building.
   Each builder is a function of its site; the town calls it through its PORT(kind, id, frame, fn), which notes what
   fn() added: the bucket and merged ranges and the furniture records. The town draws exactly as before (no rnd() is
   drawn here, nothing is moved or copied); the marks are what the Beast Riders kit (kits/beast-riders) takes a
   building by, and what its check measures the building in the town by.

     var T = KPORT.create(acc)       acc: { bucket(), mbk(), merged(), shape(name) -> a geometry, placed() -> the
                                     furniture records or null, hooks: { before(m), after(m) } (the kit's, optional) }
     T.mark(kind, id, frame, fn)     -> fn()'s result; the mark { kind, id, frame, s, e } is pushed on T.marks.
                                     frame { x, y, z, ry }: the building's LOCAL frame: origin the footprint centre on
                                     its floor, ry turning its front (+z) to (sin ry, cos ry), the catalog's rotation.y
     T.find(def)                     -> the marks of def { kind, id } (a building drawn in several passes has several)
     T.take(def)                     -> { buckets: {k: {shape, fam, list}}, mbk: {fam: {pos, nor, uv, col, tris}} }: the
                                     records the marks added, kept by def.clip (below); read before the kit is emitted
     T.box(def)                      -> { min, max, inst, tris } of the fabric (no furniture) in def's local frame
     T.furn(def)                     -> the furniture records, each { key, variant, lx, ly, lz, lry } in that frame
   def: { kind, id, frame?, clip? }: frame overrides the first mark's; clip { hx, hz } keeps only what stands within
   |x| <= hx (and |z| <= hz) of the frame (an instance by its origin, a triangle by its centroid): a stretch of a
   palisade that rings the whole town.                                                                              */
var KPORT = (function(){
  var K = {};
  K.toLocal = function(F, x, z){ var c = Math.cos(F.ry||0), s = Math.sin(F.ry||0), dx = x - F.x, dz = z - F.z; return [dx*c - dz*s, dx*s + dz*c]; };
  K.wrap = function(a){ while(a > Math.PI) a -= 2*Math.PI; while(a <= -Math.PI) a += 2*Math.PI; return a; };
  K.keep = function(def, F, x, z){
    var C = def.clip; if(!C) return true;
    var l = K.toLocal(F, x, z);
    return Math.abs(l[0]) <= C.hx && (C.hz == null || Math.abs(l[1]) <= C.hz);
  };
  var _o = null, _sp = {};
  K.instMatrix = function(r){                               /* a bucket record's transform, as 45-kit.js emitBuckets */
    _o = _o || new THREE.Object3D();
    var rot = r[6];
    _o.position.set(r[0], r[1], r[2]); _o.scale.set(r[3], r[4], r[5]);
    if(typeof rot === 'number') _o.rotation.set(0, rot, 0, 'YXZ');
    else if(rot.q) _o.quaternion.set(rot.q[0], rot.q[1], rot.q[2], rot.q[3]);
    else _o.rotation.set(rot[0], rot[1], rot[2], 'YXZ');
    _o.updateMatrix();
    return _o.matrix;
  };
  K.create = function(acc){
    var T = { marks: [], acc: acc };
    function snap(){
      var B = acc.bucket(), M = acc.mbk(), P = acc.placed(), b = {}, m = {};
      for(var k in B) b[k] = B[k].list.length;
      for(var f in M) m[f] = M[f].pos ? M[f].pos.length : 0;
      return { b: b, m: m, f: P ? P.length : 0 };
    }
    T.mark = function(kind, id, frame, fn){
      var mk = { kind: kind, id: id, frame: frame, s: snap(), e: null };
      if(acc.hooks && acc.hooks.before) acc.hooks.before(mk);
      var r = fn();
      mk.e = snap();
      T.marks.push(mk);
      if(acc.hooks && acc.hooks.after) acc.hooks.after(mk);
      return r;
    };
    T.find = function(def){ return T.marks.filter(function(mk){ return mk.kind === def.kind && mk.id === def.id; }); };
    function frameOf(def, ms){ return def.frame || (ms[0] && ms[0].frame); }
    T.take = function(def){
      var ms = T.find(def), F = frameOf(def, ms), B = acc.bucket(), M = acc.mbk(), out = { buckets: {}, mbk: {} };
      ms.forEach(function(mk){
        for(var k in mk.e.b){
          var a = mk.s.b[k] || 0, z = mk.e.b[k]; if(z <= a) continue;
          var src = B[k], dst = out.buckets[k] || (out.buckets[k] = { shape: src.shape, fam: src.fam, list: [] });
          for(var i = a; i < z; i++){ var r = src.list[i]; if(K.keep(def, F, r[0], r[2])) dst.list.push(r); }
        }
        for(var f in mk.e.m){
          var a2 = mk.s.m[f] || 0, z2 = mk.e.m[f]; if(z2 <= a2) continue;
          var S = M[f], D = out.mbk[f] || (out.mbk[f] = { pos: [], nor: [], uv: [], col: [], tris: 0 });
          for(var t = a2; t < z2; t += 9){
            var cx = (S.pos[t] + S.pos[t+3] + S.pos[t+6]) / 3, cz = (S.pos[t+2] + S.pos[t+5] + S.pos[t+8]) / 3;
            if(!K.keep(def, F, cx, cz)) continue;
            var u = t / 3 * 2;
            for(var q = 0; q < 9; q++){ D.pos.push(S.pos[t+q]); D.nor.push(S.nor[t+q]); D.col.push(S.col[t+q]); }
            for(var q2 = 0; q2 < 6; q2++) D.uv.push(S.uv[u+q2]);
            D.tris++;
          }
        }
      });
      return out;
    };
    function shapePos(name){ return _sp[name] || (_sp[name] = acc.shape(name).attributes.position.array.slice()); }
    T.box = function(def){
      var ms = T.find(def), F = frameOf(def, ms), B = acc.bucket(), M = acc.mbk(), MM = acc.merged ? acc.merged() : {};
      var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], inst = 0, tris = 0, v = new THREE.Vector3();
      function add(x, y, z){ var l = K.toLocal(F, x, z), yy = y - (F.y||0);
        if(l[0] < lo[0]) lo[0] = l[0]; if(yy < lo[1]) lo[1] = yy; if(l[1] < lo[2]) lo[2] = l[1];
        if(l[0] > hi[0]) hi[0] = l[0]; if(yy > hi[1]) hi[1] = yy; if(l[1] > hi[2]) hi[2] = l[1]; }
      ms.forEach(function(mk){
        for(var k in mk.e.b){
          var a = mk.s.b[k] || 0, z = mk.e.b[k]; if(z <= a) continue;
          var src = B[k], P = shapePos(src.shape);
          for(var i = a; i < z; i++){
            var r = src.list[i]; if(!K.keep(def, F, r[0], r[2])) continue;
            var Mx = K.instMatrix(r); inst++;
            for(var p = 0; p < P.length; p += 3){ v.set(P[p], P[p+1], P[p+2]).applyMatrix4(Mx); add(v.x, v.y, v.z); }
          }
        }
        for(var f in mk.e.m){
          var a2 = mk.s.m[f] || 0, z2 = mk.e.m[f]; if(z2 <= a2) continue;
          var pos = (M[f] && M[f].pos) || (MM[f] && MM[f].geometry.attributes.position.array);
          if(!pos) continue;
          for(var t = a2; t < z2; t += 9){
            if(!K.keep(def, F, (pos[t] + pos[t+3] + pos[t+6]) / 3, (pos[t+2] + pos[t+5] + pos[t+8]) / 3)) continue;
            tris++; add(pos[t], pos[t+1], pos[t+2]); add(pos[t+3], pos[t+4], pos[t+5]); add(pos[t+6], pos[t+7], pos[t+8]);
          }
        }
      });
      return { min: lo, max: hi, inst: inst, tris: tris };
    };
    T.furn = function(def){
      var ms = T.find(def), F = frameOf(def, ms), P = acc.placed(), out = [];
      if(!P) return out;
      ms.forEach(function(mk){
        for(var i = mk.s.f; i < mk.e.f; i++){
          var r = P[i]; if(!K.keep(def, F, r.x, r.z)) continue;
          var l = K.toLocal(F, r.x, r.z);
          out.push({ key: r.key, variant: r.variant, lx: +l[0].toFixed(3), ly: +(r.y - (F.y||0)).toFixed(3), lz: +l[1].toFixed(3), lry: +K.wrap(r.ry - (F.ry||0)).toFixed(4) });
        }
      });
      return out;
    };
    return T;
  };
  return K;
})();
