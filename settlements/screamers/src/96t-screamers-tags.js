/* ============================== CORE TAGS: THE SCREAMERS' REG ==============================
   The registry (REG: 50-registry.js's REGISTER, called by the Hexahedron, the village, the hypertrees, the biome and the
   furniture catalogue) as core/tags records, so core/host's inspector and minimap read the structures (core/host/README.md;
   ROADMAP.md section 10, step 5). On the village page they join the registry the salvage homes' furniture is already in
   (KTAGS.page: the Post-Apoc bundle's, 70e), as Highlands' 91h-hl-tags.js joins the furniture's; the furniture catalogue page
   makes its own. Built once the world is built and before the take (99-start.js), after the life layer (94-life.js)
   registers its walkers and herd.
   REG here carries only a name, a volume and a builder type (hex, vill, jung), so the class and the tags are read from them:
     hex                     the Ancients' arcology: a building, culture ancient, state ruined
     vill                    the Screamers' village: a building, culture screamer; the wall, the pylon, the gate and the
                             helipad infrastructure; the fields, the orchard and the lobby features; a salvage home state
                             salvage
     jung                    the hyperjungle biome: a feature
     a hypertree             flora (a fallen one too), kind hypertree
     the living, the herd    life
     the catalogue           a feature, each of its pieces furniture of the screamer culture, kind the piece
   SCREAMERS_REG_ID (a Map) gives each REG entry's record id. */
const SCREAMERS_REG_ID = new Map();
(function(){
 const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'screamers/' + TITLE }));
 const part = n => { const i = String(n).indexOf(' — '); return i < 0 ? '' : String(n).slice(i + 3); };
 const word = s => { const w = String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/^the /, '').trim().split(/\s+/); return w[w.length - 1] || null; };
 for (const r of REG) {
   const name = String(r.name || ''), p = part(name), tags = {};
   let cls = 'building', kind = r.type || null;
   if (/hypertree/i.test(name)) { cls = 'flora'; kind = 'hypertree'; }
   else if (r.type === 'hex') { tags.culture = 'ancient'; tags.state = 'ruined'; kind = 'hexahedron'; }
   else if (r.type === 'jung') { cls = 'feature'; kind = 'biome'; }
   else if (/^Furniture catalogue/.test(name)) { cls = 'feature'; kind = 'catalogue'; tags.culture = 'screamer'; }
   else if (/^Furniture — /.test(name)) { cls = 'furniture'; kind = p; tags.culture = 'screamer'; }
   else if (/^Screamer village/.test(name)) {
     tags.culture = 'screamer'; kind = word(p);
     if (/living|herd/.test(p)) cls = 'life';
     else if (/wall|pylon|gate|helipad/.test(p)) cls = 'infrastructure';
     else if (/fields|orchard \(|lobby/.test(p)) cls = 'feature';
     if (/salvage home/.test(p)) tags.state = 'salvage';
   }
   const rec = T.add({ 'class': cls, kind: kind, key: r.type || null, name: name || null, at: [r.x, r.y || 0, r.z],
     r: r.r, h: r.h, tags: tags, frag: '96t-screamers-tags.js' });
   SCREAMERS_REG_ID.set(r, rec.id);
 }
})();
