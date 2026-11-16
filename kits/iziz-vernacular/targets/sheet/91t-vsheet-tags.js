/* ============================== CORE TAGS: THE VERNACULAR SHEET'S REG ==============================
   The sheet's registry (REG: 50-registry.js, VERN.place / vnReg in 69c-vern-helpers.js) as core/tags records in KTAGS.page,
   so core/host's inspector and minimap read the buildings (core/tags/README.md). Built once the world is built (90-vsheet-scene.js)
   and before the take (99-vsheet-start.js), as Iziz's 91t-iziz-tags.js does, with its classes: cls building a building; farm a
   feature (farm-plot); furniture by its first type (plaza a feature, statue a landmark, else a prop). The vocabulary takes the
   Vernacular's spellings on input (52-core-tags-vocab.js), so nothing is mapped. A record keeps REG's r and h, its key and name;
   a tag note becomes its note. The fixtures 69f-iziz-fixtures.js noted (doors, windows, lamps) become each building's children,
   class fixture, as on Iziz's page (Iziz's lots and kit item sets are its export's, not the sheet's).
   VSHEET_REG_ID (a Map) gives each REG entry's record id. */
const VSHEET_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'iziz-vernacular/sheet' }));
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note;
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life'; kind = w[w.length - 1]; }
   const rec = T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z],
     r: r.r, h: r.h, tags: t, note: note == null ? null : note, frag: '91t-vsheet-tags.js' });
   VSHEET_REG_ID.set(r, rec.id);
 }
 if (typeof IZFIX !== 'undefined') {
   IZFIX.dropped = 0;
   for (const f of IZFIX.list) {
     const regs = f.place.regs || [];
     const own = regs.find(r => VSHEET_REG_ID.has(r) && r.cls === 'building') || regs.find(r => VSHEET_REG_ID.has(r));
     if (!own) { IZFIX.dropped++; continue; }
     const tags = { lit: !!f.lit };
     if (f.kind === 'door') tags.door = f.style; else if (f.kind === 'light') tags.light = f.style; else tags.style = f.style;
     if (own.tags && own.tags.culture) tags.culture = own.tags.culture;
     T.child(VSHEET_REG_ID.get(own), { 'class': 'fixture', kind: f.kind, key: f.place.key, name: f.kind + ' (' + (own.name || f.place.key) + ')',
       at: f.at, ry: f.ry, size: [f.w, .2, f.h], tags, frag: '69f-iziz-fixtures' });
   }
 }
})();
