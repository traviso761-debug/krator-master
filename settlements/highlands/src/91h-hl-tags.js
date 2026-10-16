/* ============================== CORE TAGS: HIGHLANDS' REG ==============================
   The sites of the rows and of Roketstad (REG: 50-registry.js, vnReg in 69c-vern-helpers.js and every builder that pushes
   to it) as core/tags records, added to the registry the furniture is already in (KTAGS.page, 89y-hl-furnish.js), so
   core/host's inspector and minimap read the buildings as well as the pieces (core/host/README.md; ROADMAP.md section 10,
   step 3). Built once the world is built and before the take (99-start.js), as Iziz's 91t-iziz-tags.js does, with its
   classes: cls building a building; farm a feature (farm-plot); furniture by its first type (plaza a feature, statue a
   landmark, else a prop); no cls (the biome's) a tree as flora, anything else life. A record keeps REG's r and h, its key
   and name; a tag note becomes its note. HL_REG_ID (a Map) gives each REG entry's record id. */
const HL_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: window.CITY ? 'roketstad' : 'highlands' }));
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 // Highlands' own spellings onto the vocabulary (core/tags/README.md: a build that adopts core/tags reads zero unknowns): the
 // branch cultures are the catalog's (DESIGN.md: the Tribal branch is the Painted Men); a type the catalog lacks is its nearest
 // building type, or a state (a ruin, a salvage yard); `kit` (the def's kit) and `salvage: true` are said by the key and state
 const CULTURE = { 'highland-republican': 'republican', 'highland-rustic': 'rustic', 'highland-tribal': 'painted' };
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
     r: r.r, h: r.h, tags: t, note: note == null ? null : note, frag: '91h-hl-tags.js' });
   HL_REG_ID.set(r, rec.id);
 }
})();
