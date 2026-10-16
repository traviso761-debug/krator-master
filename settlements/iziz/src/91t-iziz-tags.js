/* ============================== CORE TAGS: IZIZ'S REG ==============================
   Iziz's registry (REG, 50-registry.js and every builder that pushes to it) as core/tags records
   (core/tags/README.md, step 4 of core/tags/PROPOSAL.md's order of adoption). Built once the world is
   built and before the first frame (92-camera.js), not as REG grows: 77z-iziz-style.js builds trial
   copies and rolls REG back (REG.length = r0, splices), and only what stays is registered.
   REG keeps working as it does; core/tags reads it. The vocabulary takes Iziz's spellings on input
   (type, place, market/shop, ancients-reclaimed, destroyed...: 52-core-tags-vocab.js). Here only
   what is Iziz's own: the class, which REG's cls does not always say.
     cls building            building
     cls farm                feature, kind farm-plot
     cls furniture           by its first type: plaza a feature, statue a landmark, else a prop
     no cls (the biome's)    a tree is flora, anything else life; the kind is the name's last word
   A record keeps REG's r and h (a round footprint), its key and name; a tag note becomes the record's note.
   M5 (2026-10-13; core/export/README.md, "Iziz"), the KRATOR_EXPORT shape on top:
     a building's lot     a building record whose centre lies in a city placement (OCC.list: the footprints 88-city-place.js
                          and 90b place, rotated rectangles) takes the lot's yaw and size [2 hx, 2 hz, h] in place of r
     fixtures             each door, window and lamp 69f-iziz-fixtures.js noted, a child of the first record its VERN.place
                          registered ('bld_00042.door.0'), class fixture, kind door | window | light, tags door/light/style/lit
                          and the building's culture; IZFIX.host[id] keeps its host (side, sill) for the fixtures section
     the kit's item sets  every baked kit item (KIT.meshes: one InstancedMesh each) as a core/tags item set, class part, kind
                          and key the kit item; its instances are rows read from the instance matrices themselves (float32,
                          as the export writes them), so 'part_00012#37' names an instance and its uid recomputes from the
                          matrix. IZFIX.sets[kit item] is the set's id
   REG_ID (a Map) gives each REG entry's record id. */
const REG_ID = new Map();
(function(){
 const T = KTAGS.page = KTAGS.create({ build: 'iziz/' + TITLE });
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 const LOTS = typeof OCC !== 'undefined' ? OCC.list : [];
 const lotOf = (x, z) => { for (const o of LOTS) { const dx = x - o.x, dz = z - o.z, c = Math.cos(o.ry), s = Math.sin(o.ry);
   if (Math.abs(dx * c - dz * s) <= o.hx + 1e-6 && Math.abs(dx * s + dz * c) <= o.hz + 1e-6) return o; } return null; };
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note;
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life'; kind = w[w.length - 1]; }
   const lot = cls === 'building' ? lotOf(r.x, r.z) : null;
   const rec = T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z],
     ry: lot ? lot.ry : 0, size: lot ? [2 * lot.hx, 2 * lot.hz, r.h || 0] : null, r: lot ? null : r.r, h: r.h,
     tags: t, note: note, frag: '91t-iziz-tags' });
   REG_ID.set(r, rec.id);
 }
 if (typeof IZFIX !== 'undefined') {
   IZFIX.sets = {}; IZFIX.dropped = 0;
   for (const f of IZFIX.list) {
     const regs = f.place.regs || [];
     const own = regs.find(r => REG_ID.has(r) && r.cls === 'building') || regs.find(r => REG_ID.has(r));
     if (!own) { IZFIX.dropped++; continue; }
     const tags = { lit: !!f.lit };
     if (f.kind === 'door') tags.door = f.style; else if (f.kind === 'light') tags.light = f.style; else tags.style = f.style;
     if (own.tags && own.tags.culture) tags.culture = own.tags.culture;
     const rec = T.child(REG_ID.get(own), { 'class': 'fixture', kind: f.kind, key: f.place.key, name: f.kind + ' (' + (own.name || f.place.key) + ')',
       at: f.at, ry: f.ry, size: [f.w, .2, f.h], tags, frag: '69f-iziz-fixtures' });
     IZFIX.host[rec.id] = { wall: null, side: 'outside', sill: +f.sill.toFixed(4) };
   }
 }
 if (typeof KIT !== 'undefined' && KIT.meshes && typeof IZFIX !== 'undefined')
   for (const name of KIT.order) {
     const im = KIT.meshes[name]; if (!im) continue;
     const a = im.instanceMatrix.array;
     const S = T.addSet({ 'class': 'part', kind: name, key: 'kit:' + name, name: name, at: [0, 0, 0], tags: { part: name }, frag: '91t-iziz-tags' },
       { n: () => im.count, pos: (i, o) => { o[0] = a[i * 16 + 12]; o[1] = a[i * 16 + 13]; o[2] = a[i * 16 + 14]; return o; } });
     IZFIX.sets[name] = S.id;
   }
})();
