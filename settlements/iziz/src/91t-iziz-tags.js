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
   A record keeps REG's r and h (a round footprint), its key and name; a tag note becomes the record's note. */
(function(){
 const T = KTAGS.page = KTAGS.create({ build: 'iziz/' + TITLE });
 const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
 for (const r of REG) {
   const t = Object.assign({}, r.tags || {}), note = t.note, ty = [].concat(t.type || []);
   delete t.note;
   let cls = r.cls, kind = r.key || null;
   if (cls === 'farm') { cls = 'feature'; kind = 'farm-plot'; }
   else if (cls === 'furniture') cls = BY_TYPE[ty[0]] || 'prop';
   else if (!cls) { const w = String(r.name || '').toLowerCase().split(' '); cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life'; kind = w[w.length - 1]; }
   T.add({ 'class': cls, kind: kind, key: r.key || null, name: r.name || null, at: [r.x, r.y || 0, r.z], r: r.r, h: r.h,
     tags: t, note: note, frag: '91t-iziz-tags' });
 }
})();
