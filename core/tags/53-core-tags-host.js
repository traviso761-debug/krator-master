// ================================================================= CORE TAGS — the label ([web])
// The inspector's text, made from the record and never stored (PROPOSAL.md, Decisions 6, "A label, generated").
// The inspector hook itself belongs to core/host (GODOT-PLAN.md Phase 1); this is only the text.
//
//   KTAGS.label(rec, instance)  -> 'Name\nclass · Culture · types or kind · ...\nsize · id' (+ '\n' + note)
//
// The parts, in a fixed order, each left out when it has no value:
//   line 1  the name; else the kind or key; else the class
//   line 2  class, culture (its display name), types (else kind, when the name is not already it), job, state,
//           setting, wealth, 'Köppen <code>', 'harvest: ...', the flags (lit), 'in <parent>'
//   line 3  'w × d m' (or '⌀ d m'), ', h m tall' from 2 m up; then the id ('#<instance>' for an instance)
//   line 4  the note
(function(){
 'use strict';
 var K = typeof KTAGS !== 'undefined' ? KTAGS : globalThis.KTAGS;
 if (!K) throw new Error('53-core-tags-host: load 50-core-tags.js first');
 function num(v){ return String(+(+v).toFixed(2)); }
 function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

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
})();
