/* ============================== CORE TAGS: REED LAKE'S REG ==============================
   Reed Lake's registry (REG: 50-registry.js, VERN.place / vnReg in 69c-vern-helpers.js and every builder that pushes to it)
   as core/tags records in KTAGS.page, so core/host's inspector and minimap read the buildings (core/host/README.md;
   ROADMAP.md section 10, step 5). Built once the world is built and before the take (99-start.js), as Iziz's
   91t-iziz-tags.js and Highlands' 91h-hl-tags.js do, with their classes: cls building a building; farm a feature
   (farm-plot); furniture by its first type (plaza a feature, statue a landmark, else a prop); no cls a tree as flora,
   anything else life. A record keeps REG's r and h, its key and name; a tag note becomes its note. Reed Lake's own
   spellings are mapped onto the vocabulary here (core/tags/README.md: a build that adopts core/tags reads zero unknowns);
   core/tags is not edited. REEDLAKE_REG_ID (a Map) gives each REG entry's record id. */
const REEDLAKE_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'reedlake/' + TITLE }));
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 const CULTURE = { 'reed-lake': 'reedlake' };   // the kit's spelling of the culture
 const TYPE = {};
 const STATE = {};
 const WEALTH = {};
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note; delete t.kit;   // the def's kit is said by its key
   if (t.culture in CULTURE) t.culture = CULTURE[t.culture];
   if (t.wealth in WEALTH) t.wealth = WEALTH[t.wealth];
   if (t.type != null) { const out = [];
     for (const y of [].concat(t.type)) { if (STATE[y]) t.state = t.state || STATE[y]; else if (TYPE[y] !== null) out.push(TYPE[y] || y); }
     t.type = out; }
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life'; kind = w[w.length - 1]; }
   const rec = T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z],
     r: r.r, h: r.h, tags: t, note: note == null ? null : note, frag: '91t-reedlake-tags.js' });
   REEDLAKE_REG_ID.set(r, rec.id);
 }
})();
