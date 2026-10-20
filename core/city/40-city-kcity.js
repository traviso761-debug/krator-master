/* ============================== 7. THE INSTANCE: KCITY.create, STEPS AS DATA, RUN, EXPORT ============================== */
/* [G data] A city is an instance:

     var C = KCITY.create({ tune, site, ground, kit, rules, seed, steps, finish, rand, tags, index })
     C.run()      lays the city out: a fresh plan, then each step in order (its `after` hooks after it), then `finish`
     C.export()   the plan as plain JSON-ready records (KCITY.exportPlan)
     C.bind()     makes C the bound instance (below); run and export bind first
     C.plan, C.raster, C.index ({lots, roads, fields}), C.steps, C.tune, C.ground, C.site

   tune    the method's numbers (core/city/README.md, "What the world provides"; Voth's 15-vc-tune.js is the reference)
   site    the world's site data (districts, markers, avenues...), read by its steps 0-5 and the site layer (25)
   ground  {h, base, pad, foot, grid}: 15-city-ground.js (a world may give only h)
   kit     {dims(key, v) -> {key, v, w, d, h}}: the kit's footprints
   rules   the world's rules, each optional: wealth(p), choosers {avenue, main, side, alley}, vacant(p, rs),
           interiorOk(k), groundOk(bo, lot), roleAt(p) (a point's district role), near {name: scorer(c, name)} (the
           civic `near` scorers over KCITY.NEAR, 31-city-steps-b.js)
   seed    the city's seed (SL.seed: SL's streams and value noise). rand 'krand' draws every stream from core/rand
           (SL.stream); a new city takes it, Voth keeps SL's own (moving it changes its layout: PLAN.md)
   steps   [{name, run(C, k), after: [fn(C, k)]}]: the steps in order, as data (KCITY.STEPS names the default 13)
   finish  [fn(C)]: after the last step (Voth: the owner's deletions, the census, the lights...)
   tags    a core/tags registry (KTAGS.create), or a build name (one is made at the first run): every lot the builder
           places is registered (opt-in, like BIO.init({tags}))
   index   {order: 'insertion' | 'buckets'} (12-city-index.js; Voth: 'buckets', its old probe order)

   SL, PLAN and TUNE are the bound instance's view: KCITY.bind(C) points them (and SL.R, SL.F, SL.index, SL.HASH, the
   ground CG and the rules) at C, after saving the instance bound before. Several cities share a page by taking turns;
   Voth's fragments, written against the globals, run unchanged on its instance (35-vc-steps.js). The data side is
   engine-neutral: a GDScript twin keeps the same records in the instance itself. */

KCITY.RULES = ['wealth', 'choosers', 'vacant', 'interiorOk', 'groundOk', 'near', 'roleAt'];
KCITY.defaults = { dims: SL.dims, wealth: SL.wealth, choosers: SL.choosers, vacant: SL.vacant || null, interiorOk: SL.interiorOk || null, groundOk: null, near: null,
  /* a point's district role: the smallest site district holding it (PLAN.site), else 'res' */
  roleAt: function (p) { return KCITY.site.roleAt(p, PLAN.site || [], { skip: ['zone', 'wall', 'misc'], fallback: function () { return 'res'; } }); } };
KCITY.cur = null;
KCITY.instances = [];   /* every instance made on the page, in order: the export's city section reads them */
KCITY.STEPS = SL.STEPS;
/* what a run leaves on SL, saved into the instance when another is bound */
KCITY.sync = function (C) {
  if (!C) return;
  C.plan = PLAN; C.raster = SL.R; C.F = SL.F; C.items = SL._items; C.minSpacing = SL.minSpacing; C.groundGrid = SL.ground;
};
KCITY.bind = function (C) {
  if (KCITY.cur === C) return C;
  KCITY.sync(KCITY.cur);
  KCITY.cur = C;
  TUNE = C.tune; PLAN = C.plan; SL.R = C.raster; SL.F = C.F; SL._items = C.items; SL.minSpacing = C.minSpacing;
  if (C.groundGrid !== undefined) SL.ground = C.groundGrid;
  SL.seed = C.seed; SL.rand = C.rand;
  SL.index = C.index.lots; SL.HASH = C.index.lots.legacy; SL.roads = C.index.roads; SL.fieldIndex = C.index.fields;
  SL.tags = C.tags; SL.site = C.site;
  CG = C.ground;
  KCITY.RULES.forEach(function (k) { SL[k] = C.rules[k] !== undefined ? C.rules[k] : KCITY.defaults[k]; });
  SL.dims = C.kit && C.kit.dims ? C.kit.dims : KCITY.defaults.dims;
  return C;
};

KCITY.create = function (o) {
  o = o || {};
  var ix = o.index || {};
  var C = {
    tune: o.tune || TUNE, site: o.site || null, ground: KCITY.groundOf(o.ground), kit: o.kit || null, rules: o.rules || {},
    seed: o.seed == null ? 7 : o.seed, rand: o.rand || null, tags: o.tags || null,
    steps: o.steps || KCITY.defaultSteps(), finish: o.finish || [],
    index: {
      lots: KCITY.boxIndex({ legacy: true, order: ix.order }),
      roads: KCITY.segIndex({ order: ix.order, window: ix.roadWindow }),
      fields: KCITY.boxIndex({ bucket: ix.fieldBucket || 80, reach: 2, eps: 0, live: false, order: ix.order, window: ix.fieldWindow })
    },
    plan: null, raster: null, F: null, items: {}, minSpacing: null, groundGrid: undefined,
    name: o.name == null ? 'city' + KCITY.instances.length : String(o.name)
  };
  KCITY.instances.push(C);
  C.bind = function () { return KCITY.bind(C); };
  C.run = function () {
    KCITY.bind(C);
    if (typeof C.tags === 'string') C.tags = SL.tags = KTAGS.create({ build: C.tags });
    C.plan = SL.newPlan(); SL.F = null; SL._items = {}; SL._sdt = null; if (SL.pads) SL.pads.length = 0;
    C.index.lots.clear(); C.index.roads.clear(); C.index.fields.clear();
    PLAN.stats.ms = [];
    C.steps.forEach(function (st, k) {
      var t = Date.now();
      st.run(C, k);
      (st.after || []).forEach(function (f) { f(C, k); });
      PLAN.stats.ms[k] = Date.now() - t;
    });
    C.finish.forEach(function (f) { f(C); });
    SL.count();
    PLAN.stats.index = { lots: C.index.lots.stats, roads: C.index.roads.stats, fields: C.index.fields.stats };
    KCITY.sync(C);
    return PLAN;
  };
  C.export = function () { KCITY.bind(C); return KCITY.exportPlan(); };
  C.step = function (name) { for (var i = 0; i < C.steps.length; i++) if (C.steps[i].name === name) return C.steps[i]; return null; };
  return C;
};

/* the default steps: 0-5 the world's (SL.pass0..pass5, its site), 6-12 the builder's. Read when run, so a world may
   define its passes after making the instance */
KCITY.defaultSteps = function () {
  return KCITY.STEPS.map(function (name, k) { return { name: name, run: function () { SL['pass' + k](); } }; });
};

/* ---------------------------------------------------------------- the export */
/* the plan as plain records (the export a Godot importer or another world reads): every record without its frames.
   The wall is the instance's wall records (25-city-site.js KCITY.site.wall: line, gates and towers, standing runs),
   or a world's polygon wall ({poly}); none is null (SL.exportPlan read PLAN.wall.poly, which Voth never set) */
KCITY.exportWall = function (W) {
  if (!W) return null;
  var r2 = function (v) { return v == null ? null : +(+v).toFixed(2); };
  var out = {};
  if (W.poly) out.poly = W.poly;
  if (W.line) out.line = W.line.map(function (p) { return [r2(p[0]), r2(p[1])]; });
  if (W.nodes) out.nodes = W.nodes.map(function (n) {
    return { kind: n.kind, name: n.name || null, named: !!n.named, x: r2(n.gx != null ? n.gx : n.x), z: r2(n.gz != null ? n.gz : n.z), ry: r2(n.ry),
      health: n.health, way: n.way ? n.way.id : null, skip: !!n.skip, deleted: !!n.deleted, pad: n.pad || null };
  });
  if (W.segs) out.segs = W.segs.map(function (s) { return { a: [r2(s.ax), r2(s.az)], b: [r2(s.bx), r2(s.bz)], health: s.health }; });
  return out;
};
KCITY.exportPlan = function () {
  var r = function (v, k) { return v == null ? v : +(+v).toFixed(k); };
  return {
    format: 'krator-city', version: 1, seed: SL.seed,
    tune: TUNE, wall: KCITY.exportWall(PLAN.wallRec || PLAN.wall), gates: PLAN.gates, districts: PLAN.districts,
    ways: PLAN.ways.map(function (w) { return { id: w.id, cls: w.cls, w: w.w, born: w.born, tag: w.tag, closed: w.closed, pts: w.pts.map(function (p) { return [r(p[0], 2), r(p[1], 2)]; }) }; }),
    lots: PLAN.lots.map(function (L) {
      return { id: L.id, cls: L.cls, key: L.key, v: L.v, slot: L.slot, x: r(L.x, 2), z: r(L.z, 2), y: r(L.y, 2), ry: r(L.ry, 4), w: L.w, d: L.d, h: L.h,
        way: L.way, side: L.side, born: L.born, died: L.died, wealth: r(L.wealth, 2), drop: L.drop == null ? undefined : r(L.drop, 2), tag: L.tag,
        lot: L.lot ? { c: L.lot.c, u: L.lot.u, hw: L.lot.hw, hd: L.lot.hd } : null };
    }),
    greens: PLAN.greens, entrances: PLAN.entrances, knocks: PLAN.knocks, fields: (PLAN.fields || []).map(function (F) { return { poly: F.poly, kind: F.kind }; }),
    stats: PLAN.stats, log: PLAN.log
  };
};
SL.exportPlan = function () { return JSON.stringify(KCITY.exportPlan()); };

/* ---------------------------------------------------------------- the export's city section (core/export) */
/* Every instance on the page that has run, as {format: 'krator-city', version, plans: [{name, ...KCITY.exportPlan()}]}.
   In a tile (ctx.box) a plan keeps the lots whose centre lies in the box and the ways with a point in it (cropped says
   how many of how many); the wall, gates, districts and greens are kept whole. Exporting binds each instance in turn and
   rebinds the one that was bound. A page that loads core/export after core/city calls KCITY.registerExport() itself. */
KCITY.registerExport = function () {
  if (typeof EXPORT === 'undefined' || KCITY._exportReg) return false;
  KCITY._exportReg = EXPORT.register('city', function (ctx) {
    var ran = KCITY.instances.filter(function (C) { return C.plan; });
    if (!ran.length) return null;
    var prev = KCITY.cur, plans = [];
    try {
      ran.forEach(function (C) {
        var P = C.export(), lots = P.lots.length, ways = P.ways.length;
        if (ctx.box) {
          P.lots = P.lots.filter(function (L) { return ctx.inBox(L.x, L.z); });
          P.ways = P.ways.filter(function (w) { return w.pts.some(function (q) { return ctx.inBox(q[0], q[1]); }); });
          P.cropped = { lots: [P.lots.length, lots], ways: [P.ways.length, ways] };
        }
        P.name = C.name; plans.push(P);
      });
    } finally { if (prev) KCITY.bind(prev); }
    return { format: 'krator-city', version: 1, plans: plans, edits: null };
  }, { by: 'city' });
  return true;
};
KCITY.registerExport();
