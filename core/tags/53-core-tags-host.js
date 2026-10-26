// ================================================================= CORE TAGS — the label ([web])
// The inspector's text, made from the record and never stored (PROPOSAL.md, Decisions 6, "A label, generated").
// The inspector hook itself belongs to core/host (GODOT-PLAN.md Phase 1); this is only the text.
//
//   KTAGS.label(rec, instance)  -> 'Name\nclass · Culture · types or kind · ...\nsize · id' (+ '\n' + note)
//
// The parts, in a fixed order, each left out when it has no value:
//   line 1  the name; else the kind or key; else the class
//   line 2  class, culture (its display name), types (else kind, when the name is not already it), job, state,
//           setting, wealth, 'Köppen <code>', 'harvest: ...', the flags (lit), 'hazard: <kind> (<effect>), danger d', 'in <parent>'
//   line 3  'w × d m' (or '⌀ d m'), ', h m tall' from 2 m up; then the id ('#<instance>' for an instance)
//   line 4  the note
(function(){
 'use strict';
 var K = typeof KTAGS !== 'undefined' ? KTAGS : globalThis.KTAGS;
 if (!K) throw new Error('53-core-tags-host: load 50-core-tags.js first');
 function num(v){ return String(+(+v).toFixed(2)); }
 function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

 // a hazard on line 2: 'hazard: acid (corrode), danger 0.7' (the kind's row fills what the record leaves out)
 function hazardWords(h){
   var row = ((K.VOCAB || {}).hazardKinds || {})[h.kind] || {}, eff = h.effect !== undefined ? h.effect : row.effect, dg = h.danger != null ? h.danger : row.danger;
   return 'hazard: ' + h.kind + (eff ? ' (' + eff + ')' : '') + (dg != null ? ', danger ' + num(dg) : '');
 }
 K.label = function(rec, instance){
   var t = rec.tags || {}, V = K.VOCAB || {}, names = V.cultureNames || {}, p = [];
   var title = rec.name || (rec.kind && cap(String(rec.kind))) || (rec.key && String(rec.key)) || cap(rec['class']);
   p.push(rec['class']);
   if (t.culture) p.push(names[t.culture] || t.culture);
   if (t.types && t.types.length) p.push(t.types.join(', '));
   else if (rec.kind && rec.name) p.push(rec.kind);
   if (t.job) p.push(t.job);
   if (t.state) p.push(t.state);
   if (t.setting) p.push(t.setting);
   if (t.wealth) p.push(t.wealth);
   if (t.koppen) p.push('Köppen ' + (Array.isArray(t.koppen) ? t.koppen.join(', ') : t.koppen));
   if (t.harvest) {
     var h = [];
     if (t.harvest.wood) h.push('wood');
     if (t.harvest.edible) h = h.concat(t.harvest.edible);
     if (t.harvest.medicinal) h.push('medicinal');
     if (h.length) p.push('harvest: ' + h.join(', '));
   }
   if (t.lit) p.push('lit');
   if (t.hazard && t.hazard.kind) p.push(hazardWords(t.hazard));
   if (rec.parent) p.push('in ' + rec.parent);
   var s = '', id = instance != null ? K.instanceId(rec.id, instance) : rec.id;
   if (rec.size) {
     s = num(rec.size[0]) + ' × ' + num(rec.size[1]) + ' m';
     if (rec.size[2] >= 2) s += ', ' + num(rec.size[2]) + ' m tall';
   } else if (rec.r != null) {
     s = '⌀ ' + num(rec.r * 2) + ' m';
     if (rec.h >= 2) s += ', ' + num(rec.h) + ' m tall';
   }
   var out = title + '\n' + p.join(' · ') + '\n' + (s ? s + ' · ' : '') + id;
   if (rec.note) out += '\n' + rec.note;
   return out;
 };

 // ---------------------------------------------------------------- the hazard overlay ([web]: THREE, the host's clock)
 // KTAGS.hazardLayer({scene, tags?, time?, max?}) -> {on: false, set(on), objects(), update(t), count}: hand it to the host
 // as o.layers.hazards and its button shows each hazard record's shape (core/hazard KHAZ.list of tags, else KTAGS.page):
 // cylinders, spheres and boxes as three instanced draws, polygons as one extruded mesh each, additive and unlit, coloured
 // by the kind's tell colour times (.25 + .75 danger) times its state now (KHAZ.state: a vent between plays fades out; a
 // warn pulses). time() is the motion clock (KHOST.host.clock.t); the meshes are made on first show, and skipped by the
 // inspector and the probe (userData.khost, probeSkip). Godot: a debug draw of the Area3D shapes (core/hazard/GODOT.md).
 K.hazardLayer = function(o){
   o = o || {};
   var root = typeof globalThis !== 'undefined' ? globalThis : window, THREE = root.THREE, H = root.KHAZ;
   var L = { on: false, count: 0, group: null };
   var max = o.max == null ? 4000 : o.max, rows = [], meshes = [], sub = null, col = null;
   function clock(){ if (o.time) return o.time(); var h = root.KHOST && root.KHOST.host; return h && h.clock ? h.clock.t : 0; }
   function make(){
     if (!THREE || !H) throw new Error('KTAGS.hazardLayer: needs THREE and core/hazard (KHAZ)');
     var T = o.tags || K.page, recs = H.list(T).slice(0, max), G = new THREE.Group();
     G.name = 'hazards'; G.userData.khost = true; G.userData.probeSkip = true; G.renderOrder = 30;
     var unit = { cyl: new THREE.CylinderGeometry(1, 1, 1, 28, 1, false), sphere: new THREE.SphereGeometry(1, 20, 12), box: new THREE.BoxGeometry(1, 1, 1) };
     unit.cyl.translate(0, .5, 0); unit.box.translate(0, .5, 0);
     var mat = function(){ return new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending,
       depthWrite: false, side: THREE.DoubleSide, fog: false }); };
     var by = { cyl: [], sphere: [], box: [] }, polys = [];
     recs.forEach(function(r){ var s = H.shape(r); if (s.type === 'poly') polys.push([r, s]); else by[s.type].push([r, s]); });
     col = new THREE.Color();
     var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
     ['cyl', 'sphere', 'box'].forEach(function(k){
       var A = by[k]; if (!A.length) return;
       var im = new THREE.InstancedMesh(unit[k], mat(), A.length);
       A.forEach(function(p, i){ var r = p[0], s = p[1], y0 = s.y0 == null ? 0 : s.y0, h = (s.y1 == null ? s.h : s.y1) - y0;
         v.set(r.at[0], r.at[1] + y0, r.at[2]); q.setFromEuler(e.set(0, r.ry || 0, 0));
         if (k === 'box') sc.set(s.w, Math.max(h, .2), s.d); else if (k === 'cyl') sc.set(s.r, Math.max(h, .2), s.r); else sc.set(s.r, s.r, s.r);
         im.setMatrixAt(i, m4.compose(v, q, sc)); im.setColorAt(i, col.set(0x000000));
         rows.push({ rec: r, mesh: im, i: i, base: new THREE.Color(H.of(r).tell.colour).multiplyScalar(.25 + .75 * H.of(r).danger) }); });
       im.userData.khost = true; im.userData.probeSkip = true; im.frustumCulled = false; im.renderOrder = 30; G.add(im); meshes.push(im); });
     polys.forEach(function(p){ var r = p[0], s = p[1], sh = new THREE.Shape(), y0 = s.y0 == null ? 0 : s.y0, h = Math.max((s.y1 == null ? s.h : s.y1) - y0, .2);
       s.pts.forEach(function(pt, i){ if (i) sh.lineTo(pt[0], -pt[1]); else sh.moveTo(pt[0], -pt[1]); });
       var g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
       var m = new THREE.Mesh(g, mat()); m.position.set(r.at[0], r.at[1] + y0, r.at[2]); m.rotation.y = r.ry || 0;
       m.userData.khost = true; m.userData.probeSkip = true; m.renderOrder = 30; G.add(m); meshes.push(m);
       rows.push({ rec: r, mesh: m, i: -1, base: new THREE.Color(H.of(r).tell.colour).multiplyScalar(.25 + .75 * H.of(r).danger) }); });
     L.count = rows.length; L.group = G;
     (o.scene || (root.KHOST && root.KHOST.host && root.KHOST.host.scene)).add(G);
   }
   L.update = function(t){
     if (!L.group || !L.on) return;
     t = t == null ? clock() : t;
     var dirty = new Set();
     for (var i = 0; i < rows.length; i++) {
       var w = rows[i], s = H.state(w.rec, t), k = s.warn ? .35 + .25 * Math.sin(t * 6) : .15 + .85 * s.k;
       col.copy(w.base).multiplyScalar(k);
       if (w.i >= 0) { w.mesh.setColorAt(w.i, col); dirty.add(w.mesh); } else w.mesh.material.color.copy(col);
     }
     dirty.forEach(function(m){ if (m.instanceColor) m.instanceColor.needsUpdate = true; });
   };
   L.set = function(on){
     L.on = !!on;
     if (L.on && !L.group) make();
     if (L.group) L.group.visible = L.on;
     if (L.on && !sub && root.KHOST && root.KHOST.on) { sub = function(dt, t){ L.update(t); }; sub.khostName = 'hazard overlay'; root.KHOST.on(sub); }
     if (L.on) L.update();
   };
   L.objects = function(){ return []; };
   return L;
 };
})();
