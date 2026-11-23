/* ============================== CORE TAGS: THE PAINTED MEN SHEET'S REG ==============================
   Registers every site volume placed on the Painted Men kit sheet into KTAGS.page alongside the catalog furniture
   (culture: 'painted'), so core/host's inspector and minimap read every hut, longhouse, cliff walk and salvage hall. */
const PMS_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'painted-men/sheet' }));
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 const CULTURE = { 'highland-tribal': 'painted', 'highland-republican': 'republican', 'highland-rustic': 'rustic' };
 const TYPE = { guild: 'industry', warehouse: 'industry', fuel: 'industry', storage: 'infrastructure', spaceport: 'infrastructure', garden: 'farm', dwelling: 'dwelling-single' };
 const STATE = { ruin: 'ruined', salvage: 'salvage' };
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note; delete t.kit;
   if (CULTURE[t.culture]) t.culture = CULTURE[t.culture];
   if (t.salvage) t.state = t.state || 'salvage';
   delete t.salvage;
   if (t.type != null) { const out = [];
     for (const y of [].concat(t.type)) { if (STATE[y]) t.state = t.state || STATE[y]; else out.push(TYPE[y] || y); }
     t.type = out; }
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life'; kind = w[w.length - 1]; }
   const rec = T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z],
     r: r.r, h: r.h, tags: t, note: note == null ? null : note, frag: '91t-pmsheet-tags.js' });
   PMS_REG_ID.set(r, rec.id);
 }
})();
