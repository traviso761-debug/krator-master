/* ======================================================================
   kits/beast-riders/towns/hook.js: the kit's side of a town's marks (core/ports), SEALED INTO the town's closure by
   towns.py, after the town's 45-kit.js and its port table (towns/<town>-ports.js: BRT_DEFS). The town then runs as it
   does on its own page (its layout, structure and architecture, every random number and furniture seed as there);
   this keeps the marked buildings the port table names and makes each one a group in its local frame.
     BRT_TOWN  { name, port(T), furn() }   the town's bindings (towns.py writes them): its PORT's tracker, its furniture pass
     BRT_DEFS  [{ key, name, variants: [{ name, parts: [{ kind, id }], frame?, clip?, pick? }] }]  (the port table)
   What the closure returns (BRT_API()):
     { defs, build() -> { key: [ { group, def, box, furn, doors, panes } per variant ] }, info }
   A group: the building's fabric (the town's instanced shapes made plain meshes, its merged meshes, its walls cut for its
   doors and windows by the town's 54-openings.js), its door leaves (one mesh each, posed as the town built them; the
   records in group.userData.brDoors, local), its panes (KGLASS, as 81-glow.js draws them) and its furniture, moved so the
   frame's origin is (0,0,0) and its front looks down +z. Nothing outside a wanted mark is kept, and no
   furniture outside one is drawn (the furniture pass is muted there: the records are still made, so every seed falls
   as in the town).
   ====================================================================== */
var BRT_WANT = null, BRT_BATCH = {}, BRT_ALL = {};
function brtWanted(){
  if(BRT_WANT) return BRT_WANT;
  BRT_WANT = {};
  BRT_DEFS.forEach(function(D){
    if(D.all) BRT_ALL[D.all] = true;                                     /* every mark of a kind (picked after the run) */
    D.variants.forEach(function(v){ (v.parts||[]).forEach(function(p){ BRT_WANT[p.kind+'|'+p.id] = true; }); });
  });
  return BRT_WANT;
}
function brtIsWanted(mk){ var W = brtWanted(); return !!(W[mk.kind+'|'+mk.id] || BRT_ALL[mk.kind]); }
BRT_TOWN.port(KPORT.create({ bucket:function(){ return BUCKET; }, mbk:function(){ return MBK; }, merged:function(){ return MB_MESHES; },
  shape:function(s){ return SHAPES[s](); }, placed:function(){ var F = BRT_TOWN.furn(); return F ? F.placed : null; },
  hooks: {
    before: function(mk){
      mk.brt = { d0: KDOOR.list.length, w0: NL_WINDOWS.length };          /* its doors (54-openings.js) and panes (WINPANE) */
      var F = BRT_TOWN.furn(); if(!F) return;
      if(brtIsWanted(mk)){ var k = mk.kind+'|'+mk.id;
        if(BRT_BATCH[k]) F.batch = BRT_BATCH[k]; else BRT_BATCH[k] = KFURN.useBatch(F, KratorFurniture, KratorInteriors, { indexed: true });
        F.on = true; }
      else F.on = false;
    },
    after: function(mk){ mk.brt.d1 = KDOOR.list.length; mk.brt.w1 = NL_WINDOWS.length; var F = BRT_TOWN.furn(); if(F) F.on = false; }
  } }));

/* ---- after the run: a variant's group ---- */
var _brtV = new THREE.Vector3(), _brtN = new THREE.Vector3(), _brtNM = new THREE.Matrix3();
/* an InstancedMesh as one plain mesh: each instance's vertices, normals and colour baked, and the UVs the town's
   world-UV hook (45-kit.js applyWorldUV) would give it, so the library maps tile as in the town */
function brtPlain(im, only){                                            /* only: that one instance (a door leaf) */
  var g = im.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, idx = g.index, n = only == null ? im.count : 1;
  var src = idx ? idx.array : null, vpi = idx ? idx.count : P.count;
  var pos = new Float32Array(n*vpi*3), nor = new Float32Array(n*vpi*3), uv = new Float32Array(n*vpi*2), col = new Float32Array(n*vpi*3);
  var M = new THREE.Matrix4(), e, sx, sy, sz, ux, uz, uo0, uo1, fr = function(x){ return x - Math.floor(x); };
  var sc = (im.material.userData.brtScale) || [3,3], worldUV = !!im.material.userData.brtWorldUV;
  for(var i=0;i<n;i++){
    var ii = only == null ? i : only;
    im.getMatrixAt(ii, M); _brtNM.getNormalMatrix(M); e = M.elements;
    sx = Math.hypot(e[0],e[1],e[2]); sy = Math.hypot(e[4],e[5],e[6]); sz = Math.hypot(e[8],e[9],e[10]);
    uo0 = fr(Math.sin(e[12]*12.9898 + e[14]*78.233)*43758.5453); uo1 = fr(Math.sin(e[12]*39.3468 + e[14]*11.1352)*24634.6345);
    var cr = 1, cg = 1, cb = 1;
    if(im.instanceColor){ cr = im.instanceColor.array[ii*3]; cg = im.instanceColor.array[ii*3+1]; cb = im.instanceColor.array[ii*3+2]; }
    for(var k=0;k<vpi;k++){
      var j = src ? src[k] : k, o = (i*vpi+k);
      _brtV.fromBufferAttribute(P, j).applyMatrix4(M); pos[o*3] = _brtV.x; pos[o*3+1] = _brtV.y; pos[o*3+2] = _brtV.z;
      _brtN.fromBufferAttribute(N, j); var onx = _brtN.x, ony = _brtN.y;
      _brtN.applyMatrix3(_brtNM).normalize(); nor[o*3] = _brtN.x; nor[o*3+1] = _brtN.y; nor[o*3+2] = _brtN.z;
      var u0 = U ? U.getX(j) : 0, v0 = U ? U.getY(j) : 0;
      if(worldUV){
        var ay = Math.abs(ony) >= 0.5 ? 1 : 0, ax = Math.abs(onx) >= 0.5 ? 1 : 0;
        var uu = ay ? sx : (ax ? sz : sx), vv = ay ? sz : sy;
        uv[o*2] = u0*uu/sc[0] + uo0; uv[o*2+1] = v0*vv/sc[1] + uo1;
      } else { uv[o*2] = u0; uv[o*2+1] = v0; }
      col[o*3] = cr; col[o*3+1] = cg; col[o*3+2] = cb;
    }
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  var m0 = im.material, m = m0.clone();
  m.vertexColors = true; m.onBeforeCompile = m0.onBeforeCompile; m.customProgramCacheKey = m0.customProgramCacheKey;
  m.userData = Object.assign({}, m0.userData);
  var mesh = new THREE.Mesh(out, m);
  mesh.name = im.name || ('fabric:' + (im.userData.shape||'') + '|' + (im.userData.fam||''));
  mesh.userData = Object.assign({}, im.userData, { fabric: true, plainOf: im.userData.shape });
  return mesh;
}
/* ---- the openings: a building's doors (KDOOR records, 54-openings.js goLeaf) and its panes (NL_WINDOWS, WINPANE) ---- */
var BRT_LEAF = { doorleaf: true, doorlacq: true };                        /* the leaves' bucket families (54-openings.js) */
function brtOpenings(parts, frame, clip){
  var T = BRT_TOWN.tracker, def = { clip: clip }, doors = [], wins = [];
  parts.forEach(function(p){ T.find(p).forEach(function(mk){ var o = mk.brt; if(!o) return;
    for(var i = o.d0; i < o.d1; i++){ var D = KDOOR.list[i]; if(KPORT.keep(def, frame, D.at[0], D.at[2])) doors.push(D); }
    for(var j = o.w0; j < o.w1; j++){ var W = NL_WINDOWS[j]; if(KPORT.keep(def, frame, W[0], W[2])) wins.push(W); } }); });
  return { doors: doors, wins: wins };
}
/* a door record in the frame's local space (the page's KDOOR takes it at each copy's place: src/60-br-ports.js host) */
function brtDoorLocal(D, frame){
  function L(p){ var l = KPORT.toLocal(frame, p[0], p[2]); return [+l[0].toFixed(4), +(p[1] - (frame.y||0)).toFixed(4), +l[1].toFixed(4)]; }
  return { id: D.id, at: L(D.at), hinge: L(D.hinge), p0: L(D.p0), yaw: +KPORT.wrap(D.yaw - (frame.ry||0)).toFixed(5), sign: D.sign,
    w: D.w, h: D.h, t: D.t, locked: !!D.locked, open: D.open, kind: D.kind, s: D.s ? D.s.slice() : null, leaf: !!D.fam, fam: D.fam || null };
}
/* the panes as two merged meshes in the local frame, as 81-glow.js draws them: KGLASS 'clear' in a cut opening (W[11]) or
   3.5 cm proud of a solid body, which gets KGLASS's room card 2 cm behind the glass. Unlit: the sheet has no night */
function brtPanes(wins, toLocal){
  var glass = [], card = [], o = new THREE.Object3D();
  wins.forEach(function(W){
    var d = W[11] ? -0.03 : 0.035;
    o.position.set(W[0]+W[3]*d, W[1], W[2]+W[4]*d); o.rotation.set(0, Math.atan2(W[3], W[4]), 0); o.scale.set(W[5], W[6], 1); o.updateMatrix();
    glass.push(o.matrix.clone());
    if(!W[11]){ o.position.set(W[0]+W[3]*0.015, W[1], W[2]+W[4]*0.015); o.updateMatrix(); card.push(o.matrix.clone()); }
  });
  function merged(list, mat, name){
    if(!list.length) return null;
    var q = new THREE.PlaneGeometry(1, 1).toNonIndexed(), P = q.attributes.position, N = q.attributes.normal, U = q.attributes.uv, n = P.count;
    var pos = new Float32Array(list.length*n*3), nor = new Float32Array(list.length*n*3), uv = new Float32Array(list.length*n*2);
    var v = new THREE.Vector3(), nm = new THREE.Matrix3(), WM = new THREE.Matrix4();
    list.forEach(function(M, k){ WM.multiplyMatrices(toLocal, M); nm.getNormalMatrix(WM);
      for(var i=0;i<n;i++){ var o3 = (k*n+i)*3;
        v.fromBufferAttribute(P, i).applyMatrix4(WM); pos[o3] = v.x; pos[o3+1] = v.y; pos[o3+2] = v.z;
        v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor[o3] = v.x; nor[o3+1] = v.y; nor[o3+2] = v.z;
        uv[(k*n+i)*2] = U.getX(i); uv[(k*n+i)*2+1] = U.getY(i); } });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeBoundingSphere(); g.computeBoundingBox();
    var m = new THREE.Mesh(g, mat); m.name = name; m.renderOrder = 4; m.userData.glass = true; m.userData.inspectLabel = 'Window'; m.userData.panes = list.length;
    return m;
  }
  return [merged(glass, KGLASS.material(THREE, 'clear'), 'window glass'), merged(card, KGLASS.material(THREE, 'room'), 'window room cards')].filter(Boolean);
}
/* a variant's parts drawn into one group in the frame's local space */
function brtGroup(v){
  var F = BRT_TOWN.furn(), T = BRT_TOWN.tracker, parts = v.parts,
      frame = typeof v.frame === 'function' ? v.frame() : (v.frame || T.find(parts[0])[0].frame);
  var take = { buckets: {}, mbk: {} }, batches = [];
  parts.forEach(function(p){
    var t = T.take({ kind: p.kind, id: p.id, frame: frame, clip: v.clip });
    for(var k in t.buckets){ var d = take.buckets[k] || (take.buckets[k] = { shape: t.buckets[k].shape, fam: t.buckets[k].fam, list: [] }); d.list = d.list.concat(t.buckets[k].list); }
    for(var f in t.mbk){ var D = take.mbk[f] || (take.mbk[f] = { pos: [], nor: [], uv: [], col: [], tris: 0 }), S = t.mbk[f];
      D.pos = D.pos.concat(S.pos); D.nor = D.nor.concat(S.nor); D.uv = D.uv.concat(S.uv); D.col = D.col.concat(S.col); D.tris += S.tris; }
    var b = BRT_BATCH[p.kind+'|'+p.id]; if(b && batches.indexOf(b) < 0) batches.push(b);
  });
  /* the leaves leave the fabric: each door's own instance (its bucket record, D.idx) goes into a bucket of its own, keyed so
     54-openings.js goFlush (which poses a town-wide bucket's instances by index) does not find it; each leaf is then a
     mesh of its own, posed as the town built it (ajar or shut), which the page's KDOORHOST turns as the door swings */
  var OP = brtOpenings(parts, frame, v.clip), leaves = [];
  for(var lk in take.buckets) if(BRT_LEAF[take.buckets[lk].fam]) delete take.buckets[lk];
  OP.doors.forEach(function(D){ if(!D.fam) return; var src = BUCKET['box|'+D.fam]; if(!src || !src.list[D.idx]) return;
    var key = 'brtleaf|'+D.fam, lb = take.buckets[key] || (take.buckets[key] = { shape: src.shape, fam: D.fam, list: [] });
    leaves.push({ D: D, fam: D.fam, i: lb.list.length }); lb.list.push(src.list[D.idx]); });
  var world = new THREE.Group(), keepB = BUCKET, keepM = MBK, keepS = scene;
  scene = world; KIT_EMITTED = false;
  /* the furniture: each batch flushed by the town's own emit (its materials, its colour hook), then the fabric */
  if(!batches.length) batches.push(null);
  batches.forEach(function(b, i){
    BUCKET = i === 0 ? take.buckets : {}; MBK = {};
    if(F){ F.group = null; if(b) F.batch = b; else KFURN.useBatch(F, KratorFurniture, KratorInteriors, { indexed: true }); }
    brtEmitInst();
  });
  MBK = take.mbk; emitMerged();
  BUCKET = keepB; MBK = keepM; scene = keepS;
  /* into the local frame: origin the frame's, front +z */
  var toLocal = new THREE.Matrix4().makeRotationY(-(frame.ry||0));
  toLocal.multiply(new THREE.Matrix4().makeTranslation(-frame.x, -frame.y, -frame.z));
  var out = new THREE.Group();
  world.updateMatrixWorld(true);
  var meshes = []; world.traverse(function(o){ if(o.isMesh) meshes.push(o); });
  meshes.forEach(function(o){
    if(o.isInstancedMesh && BRT_LEAF[o.userData.fam]){                  /* the leaves, one mesh each, in the leaf's own frame */
      leaves.forEach(function(L){ if(L.fam !== o.userData.fam) return;
        var m = brtPlain(o, L.i), loc = brtDoorLocal(L.D, frame), sh = new THREE.Matrix4().makeRotationY(loc.yaw).setPosition(loc.p0[0], loc.p0[1], loc.p0[2]);
        m.geometry.applyMatrix4(toLocal); m.geometry.applyMatrix4(sh.clone().invert());
        m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox();
        var P = KDOOR.leaves(L.D)[0], pl = KPORT.toLocal(frame, P.p[0], P.p[2]);           /* posed as the town built it */
        m.position.set(pl[0], P.p[1] - (frame.y||0), pl[1]); m.rotation.set(0, loc.yaw + P.ang, 0);
        m.castShadow = true; m.receiveShadow = true; m.name = 'door leaf ' + L.D.id;
        m.userData = Object.assign({}, m.userData, { fabric: false, brDoorId: L.D.id, inspectLabel: 'Door' });
        out.add(m); });
      return;
    }
    var m = o.isInstancedMesh ? brtPlain(o) : o;
    if(!o.isInstancedMesh){ m.geometry = o.geometry.clone(); m.geometry.applyMatrix4(o.matrixWorld); }
    m.geometry.applyMatrix4(toLocal); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox();
    m.position.set(0,0,0); m.rotation.set(0,0,0); m.scale.set(1,1,1); m.updateMatrix();
    m.frustumCulled = true; m.castShadow = true; m.receiveShadow = true;
    if(!o.isInstancedMesh && !o.userData.merged) m.userData.brFurniture = true; else m.userData.fabric = true;
    out.add(m);
  });
  brtPanes(OP.wins, toLocal).forEach(function(m){ out.add(m); });
  var doors = OP.doors.map(function(D){ return brtDoorLocal(D, frame); });
  out.userData.brDoors = doors;                                           /* every door record, leaf or none (a carved front's) */
  return { group: out, frame: frame, doors: doors,
    panes: OP.wins.map(function(W){ var l = KPORT.toLocal(frame, W[0], W[2]), n = KPORT.toLocal({ x: 0, z: 0, ry: frame.ry }, W[3], W[4]);
      return { at: [+l[0].toFixed(3), +(W[1] - (frame.y||0)).toFixed(3), +l[1].toFixed(3)], n: [+n[0].toFixed(4), +n[1].toFixed(4)], w: W[5], h: W[6], cut: !!W[11] }; }) };
}
function brtEmitInst(){
  /* the town's emitBuckets (with its furniture flush), noting on each new material whether the world-UV hook tiles it */
  var before = scene.children.length;
  emitBuckets();
  for(var i = before; i < scene.children.length; i++){
    var o = scene.children[i];
    if(o.isInstancedMesh){ var fm = FAMMAT[o.userData.fam] || {};
      o.material.userData.brtWorldUV = !!fm.tex && !(fm.panel && fm.lib);
      o.material.userData.brtScale = fm.lib ? fm.lib.scale : (fm.scale || [3,3]); }
  }
}
function BRT_API(){
  var T = BRT_TOWN.tracker, out = {}, info = { marks: T.marks.length, built: 0, ms: 0 };
  function build(){
    var t0 = Date.now();
    BRT_DEFS.forEach(function(D){
      var vs = [];
      D.variants.forEach(function(v){
        if(v.pick){ var mk = v.pick(T.marks.filter(function(m){ return m.kind === D.all; })); if(!mk) return; v.parts = [{ kind: mk.kind, id: mk.id }]; }
        if(!v.parts || !T.find(v.parts[0]).length) return;
        var r = brtGroup(v), def = { kind: v.parts[0].kind, id: v.parts[0].id, frame: r.frame, clip: v.clip || null };
        vs.push({ name: v.name, group: r.group, def: def, parts: v.parts, doors: r.doors, panes: r.panes,
          box: T.box(def), furn: v.parts.reduce(function(a, p){ return a.concat(T.furn({ kind: p.kind, id: p.id, frame: r.frame, clip: v.clip })); }, []) });
        info.built++; console.log("BRTDBG", BRT_TOWN.name, D.key, v.name, r.doors.length, r.panes.length, (performance.memory||{}).usedJSHeapSize);
      });
      out[D.key] = vs;
    });
    info.ms = Date.now() - t0;
    return out;
  }
  return { town: BRT_TOWN.name, defs: BRT_DEFS, build: build, info: info, tracker: T,
    data: { trunkR: typeof trunkR !== 'undefined' ? trunkR : null, TREES: typeof TREES !== 'undefined' ? TREES : null } };
}
