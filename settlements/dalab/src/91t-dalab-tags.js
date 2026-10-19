/* ============================== CORE TAGS: DALAB'S REG ==============================
   Dalab's registry (REG: 50-registry.js, VERN.place / vnReg in 69c-vern-helpers.js, the biome's trees through REGISTER) as
   core/tags records in KTAGS.page, so core/host's inspector and minimap read the buildings (core/host/README.md; ROADMAP.md
   section 10, step 5). Built once the world is built and before the take (99-start.js), as Iziz's 91t-iziz-tags.js does,
   with its classes: cls building a building; farm a feature (farm-plot); furniture by its first type (plaza a feature,
   statue a landmark, else a prop); flora (a garden tree, 86-bio-45-init.js) flora; no cls flora (every one is a swlowlands tree,
   86-bio-55's REGISTER: a madrone, an oak; Iziz's rule would call those life). A record keeps REG's r and h, its key and name; a tag note becomes its note.
   Dalab's own spellings are mapped onto the vocabulary here (core/tags/README.md: a build that adopts core/tags reads zero
   unknowns); core/tags is not edited. DALAB_REG_ID (a Map) gives each REG entry's record id. */
const DALAB_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: window.CITY ? 'dalab' : 'dalab-set' }));
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 // Dalab's spellings onto the vocabulary. 'dalab' is not (yet) a core/tags culture: the record's culture is null and its style
 // 'dalab' (KNOWN_ISSUES.md: when core/tags takes the culture, this line goes). The castes (peasant, noble, priest) are a
 // wealth (poor, rich, rich) and the caste kept as the role; an embassy's guest is its role ('embassy:voth'); the lab's
 // `ancient: true` is the Ancients' building lived in again (state reclaimed); the Republican house's `kit` is said by its key.
 const CULTURE = { dalab: null, 'highland-republican': 'republican' };
 const TYPE = { garden: 'farm' };
 const STATE = {};
 const WEALTH = { peasant: 'poor', noble: 'rich', priest: 'rich' };
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note; delete t.kit;
   if (t.culture === 'dalab') t.style = t.style || 'dalab';
   if (t.culture in CULTURE) t.culture = CULTURE[t.culture];
   if (t.wealth in WEALTH) { t.role = t.role || t.wealth; t.wealth = WEALTH[t.wealth]; }
   if (t.guest != null) { t.role = (t.role || 'embassy') + ':' + t.guest; delete t.guest; }
   if (t.ancient) t.state = t.state || 'reclaimed';
   delete t.ancient;
   if (t.type != null) { const out = [];
     for (const y of [].concat(t.type)) { if (STATE[y]) t.state = t.state || STATE[y]; else if (TYPE[y] !== null) out.push(TYPE[y] || y); }
     t.type = out; }
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = 'flora'; kind = w[w.length - 1]; }   // only the biome's trees register with no cls here
   const rec = T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z],
     r: r.r, h: r.h, tags: t, note: note == null ? null : note, frag: '91t-dalab-tags.js' });
   DALAB_REG_ID.set(r, rec.id);
 }
})();
