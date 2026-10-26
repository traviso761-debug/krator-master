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

 // ---------------------------------------------------------------- the hazard's state in words ([web]: the inspector's)
 // KTAGS.hazardNow(rec, t?, point?) -> 'hazard now: on · 100% · 40 s to the next · dose 0.85/s here · paths avoid it', or ''
 //   (no hazard, or no core/hazard). t defaults to the host's motion clock (KHOST.host.clock.t), as the shaders run on it.
 // KTAGS.hazardAt(x, y, z, t?, tags?) -> the same for every hazard whose shape holds the point (KHAZ.at, the worst first, at
 //   most three), one line each with its name and kind: a biome's own inspector words add it (its describe(hit))
 function now(){ var r = typeof globalThis !== 'undefined' ? globalThis : window, h = r.KHOST && r.KHOST.host; return h && h.clock ? h.clock.t : 0; }
 function zroot(){ return (typeof globalThis !== 'undefined' ? globalThis : window).KHAZ || null; }
 K.hazardNow = function(rec, t, p){
   var Z = zroot(); if (!Z || !rec || !rec.tags || !rec.tags.hazard) return '';
   try {
     t = t == null ? now() : t;
     var s = Z.state(rec, t), h = Z.of(rec);
     var line = 'hazard now: ' + s.state + (s.hidden ? ' (hidden)' : '') + (s.warn ? ' (warning)' : '') + ' · ' + Math.round(s.k * 100) + '%';
     if (s.left != null && isFinite(s.left)) line += ' · ' + (s.left < 90 ? s.left.toFixed(0) + ' s' : (s.left / 60).toFixed(0) + ' min') + ' to the next';
     if (p && h.dose > 0) line += ' · dose ' + Z.dose(rec, p.x, p.z, t, p.y).toFixed(2) + '/s here';
     if (h.nav.avoid) line += ' · paths avoid it'; else if (h.nav.travel > 1) line += ' · path cost x' + h.nav.travel;
     return line;
   } catch (e) { return ''; }
 };
 K.hazardAt = function(x, y, z, t, T){
   var Z = zroot(); if (!Z || !(T || K.page)) return '';
   try {
     t = t == null ? now() : t;
     return Z.at(x, z, t, y, T || K.page).slice(0, 3).map(function(a){
       return (a.rec.name || a.kind) + ' — ' + hazardWords(a.rec.tags.hazard) + '\n  ' + K.hazardNow(a.rec, t, { x: x, y: y, z: z }); }).join('\n');
   } catch (e) { return ''; }
 };
 // ---------------------------------------------------------------- the hazard overlay ([web]: THREE, the host's clock)
 // KTAGS.hazardLayer({scene, tags?, time?, max?, camera?}) -> {on: false, set(on), objects(), update(t), count}: hand it to the host
 // as o.layers.hazards and its button shows each hazard record's shape (core/hazard KHAZ.list of tags, else KTAGS.page):
 // cylinders, spheres and boxes as three instanced draws, polygons as one extruded mesh each, additive and unlit, coloured
 // by the kind's tell colour times (.25 + .75 danger) times its state now (KHAZ.state: a vent between plays fades out; a
 // warn pulses). time() is the motion clock (KHOST.host.clock.t); the meshes are made on show (the nearest max, 4000, to the
 // camera when there are more: shown again 60 m from where they were made, they are made again there), and skipped by the
 // inspector and the probe (userData.khost, probeSkip). Godot: a debug draw of the Area3D shapes (core/hazard/GODOT.md).
 K.hazardLayer = function(o){
   o = o || {};
   var root = typeof globalThis !== 'undefined' ? globalThis : window, THREE = root.THREE, H = root.KHAZ;
   var L = { on: false, count: 0, group: null };
   var max = o.max == null ? 4000 : o.max, rows = [], meshes = [], sub = null, col = null;
   function camPos(){ var h = root.KHOST && root.KHOST.host, c = o.camera || (h && h.camera); return c ? [c.position.x, c.position.y, c.position.z] : [0, 0, 0]; }
   function drop(){ if (!L.group) return; L.group.parent && L.group.parent.remove(L.group);
     L.group.traverse(function(m){ if (m.geometry) m.geometry.dispose(); if (m.material) m.material.dispose(); }); L.group = null; rows = []; meshes = []; }
   function clock(){ if (o.time) return o.time(); var h = root.KHOST && root.KHOST.host; return h && h.clock ? h.clock.t : 0; }
   function make(){
     if (!THREE || !H) throw new Error('KTAGS.hazardLayer: needs THREE and core/hazard (KHAZ)');
     var T = o.tags || K.page, all = H.list(T), recs = all, G = new THREE.Group(), cam = camPos();
     if (all.length > max) {   // the nearest max to the camera, when there are more (Korona's hollow has 27 840)
       recs = all.map(function(r){ var dx = r.at[0] - cam[0], dz = r.at[2] - cam[2]; return [dx * dx + dz * dz, r]; })
         .sort(function(a, b){ return a[0] - b[0]; }).slice(0, max).map(function(a){ return a[1]; });
     }
     L.from = cam;
     G.name = 'hazards'; G.userData.khost = true; G.userData.probeSkip = true; G.renderOrder = 30;
     var unit = { cyl: new THREE.CylinderGeometry(1, 1, 1, 20, 1, false), sphere: new THREE.SphereGeometry(1, 16, 10), box: new THREE.BoxGeometry(1, 1, 1) };
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
     if (L.on && L.group && L.count >= max) { var c = camPos(), f = L.from, d = Math.hypot(c[0] - f[0], c[2] - f[2]); if (d > 60) drop(); }
     if (L.on && !L.group) make();
     if (L.group) L.group.visible = L.on;
     if (L.on && !sub && root.KHOST && root.KHOST.on) { sub = function(dt, t){ L.update(t); }; sub.khostName = 'hazard overlay'; root.KHOST.on(sub); }
     if (L.on) L.update();
   };
   L.objects = function(){ return []; };
   return L;
 };
})();
