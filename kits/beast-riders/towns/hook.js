/* ======================================================================
   kits/beast-riders/towns/hook.js: the kit's side of a town's marks (core/ports), SEALED INTO the town's closure by
   towns.py, after the town's 45-kit.js and its port table (towns/<town>-ports.js: BRT_DEFS). The town then runs as it
   does on its own page (its layout, structure and architecture, every random number and furniture seed as there);
   this keeps the marked buildings the port table names and makes each one a group in its local frame.
     BRT_TOWN  { name, port(T), furn() }   the town's bindings (towns.py writes them): its PORT's tracker, its furniture pass
     BRT_DEFS  [{ key, name, variants: [{ name, parts: [{ kind, id }], frame?, clip?, pick? }] }]  (the port table)
   What the closure returns (BRT_API()):
     { defs, build() -> { key: [ { group, def, box, furn } per variant ] }, info }
   A group: the building's fabric (the town's instanced shapes made plain meshes, its merged meshes) and its furniture,
   moved so the frame's origin is (0,0,0) and its front looks down +z. Nothing outside a wanted mark is kept, and no
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
      var F = BRT_TOWN.furn(); if(!F) return;
      if(brtIsWanted(mk)){ var k = mk.kind+'|'+mk.id;
        if(BRT_BATCH[k]) F.batch = BRT_BATCH[k]; else BRT_BATCH[k] = KFURN.useBatch(F, KratorFurniture, KratorInteriors, { indexed: true });
        F.on = true; }
      else F.on = false;
    },
    after: function(mk){ var F = BRT_TOWN.furn(); if(F) F.on = false; }
  } }));

/* ---- after the run: a variant's group ---- */
var _brtV = new THREE.Vector3(), _brtN = new THREE.Vector3(), _brtNM = new THREE.Matrix3();
/* an InstancedMesh as one plain mesh: each instance's vertices, normals and colour baked, and the UVs the town's
   world-UV hook (45-kit.js applyWorldUV) would give it, so the library maps tile as in the town */
function brtPlain(im){
  var g = im.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, idx = g.index, n = im.count;
  var src = idx ? idx.array : null, vpi = idx ? idx.count : P.count;
  var pos = new Float32Array(n*vpi*3), nor = new Float32Array(n*vpi*3), uv = new Float32Array(n*vpi*2), col = new Float32Array(n*vpi*3);
  var M = new THREE.Matrix4(), e, sx, sy, sz, ux, uz, uo0, uo1, fr = function(x){ return x - Math.floor(x); };
  var sc = (im.material.userData.brtScale) || [3,3], worldUV = !!im.material.userData.brtWorldUV;
  for(var i=0;i<n;i++){
    im.getMatrixAt(i, M); _brtNM.getNormalMatrix(M); e = M.elements;
    sx = Math.hypot(e[0],e[1],e[2]); sy = Math.hypot(e[4],e[5],e[6]); sz = Math.hypot(e[8],e[9],e[10]);
    uo0 = fr(Math.sin(e[12]*12.9898 + e[14]*78.233)*43758.5453); uo1 = fr(Math.sin(e[12]*39.3468 + e[14]*11.1352)*24634.6345);
    var cr = 1, cg = 1, cb = 1;
    if(im.instanceColor){ cr = im.instanceColor.array[i*3]; cg = im.instanceColor.array[i*3+1]; cb = im.instanceColor.array[i*3+2]; }
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
  var c = Math.cos(frame.ry||0), s = Math.sin(frame.ry||0), toLocal = new THREE.Matrix4().makeRotationY(-(frame.ry||0));
  toLocal.multiply(new THREE.Matrix4().makeTranslation(-frame.x, -frame.y, -frame.z));
  var out = new THREE.Group();
  world.updateMatrixWorld(true);
  var meshes = []; world.traverse(function(o){ if(o.isMesh) meshes.push(o); });
  meshes.forEach(function(o){
    var m = o.isInstancedMesh ? brtPlain(o) : o;
    if(!o.isInstancedMesh){ m.geometry = o.geometry.clone(); m.geometry.applyMatrix4(o.matrixWorld); }
    m.geometry.applyMatrix4(toLocal); m.geometry.computeBoundingSphere(); m.geometry.computeBoundingBox();
    m.position.set(0,0,0); m.rotation.set(0,0,0); m.scale.set(1,1,1); m.updateMatrix();
    m.frustumCulled = true; m.castShadow = true; m.receiveShadow = true;
    if(!o.isInstancedMesh && !o.userData.merged) m.userData.brFurniture = true; else m.userData.fabric = true;
    out.add(m);
  });
  return { group: out, frame: frame };
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
        vs.push({ name: v.name, group: r.group, def: def, parts: v.parts,
          box: T.box(def), furn: v.parts.reduce(function(a, p){ return a.concat(T.furn({ kind: p.kind, id: p.id, frame: r.frame, clip: v.clip })); }, []) });
        info.built++;
      });
      out[D.key] = vs;
    });
    info.ms = Date.now() - t0;
    return out;
  }
  return { town: BRT_TOWN.name, defs: BRT_DEFS, build: build, info: info, tracker: T,
    data: { trunkR: typeof trunkR !== 'undefined' ? trunkR : null, TREES: typeof TREES !== 'undefined' ? TREES : null } };
}
