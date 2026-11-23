/* ============================== CORE TAGS: THE DILIHAN SHEET'S REG ==============================
   Registers every building volume placed on the Dilihan kit sheet (all 24 dil_* sites and the Mixed Street vern_* neighbors)
   plus IZFIX door/window/lamp children into KTAGS.page with zero unknown keys or cultures. */
const DLS_REG_ID = new Map();
(function () {
  const T = KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'dilihan/sheet' }));
  const BY_TYPE = { plaza: 'feature', statue: 'landmark' };
  for (const r of REG) {
    const t = Object.assign({}, r.tags || {});
    const note = t.note;
    const ty = [].concat(t.type || []);
    delete t.note;
    let cls = r.cls;
    let kind = r.key || null;
    if (cls === 'farm') {
      cls = 'feature';
      kind = 'farm-plot';
    } else if (cls === 'furniture') {
      cls = BY_TYPE[ty[0]] || 'prop';
    } else if (!cls) {
      const w = String(r.name || '').toLowerCase().split(' ');
      cls = /tree$/.test(w[w.length - 1]) ? 'flora' : 'life';
      kind = w[w.length - 1];
    }
    const rec = T.add({
      'class': cls,
      kind: kind,
      key: r.key || null,
      name: r.name || null,
      at: [r.x, r.y || 0, r.z],
      r: r.r,
      h: r.h,
      tags: t,
      note: note == null ? null : note,
      frag: '91t-dlsheet-tags.js'
    });
    DLS_REG_ID.set(r, rec.id);
  }
  if (typeof IZFIX !== 'undefined') {
    IZFIX.dropped = 0;
    for (const f of IZFIX.list) {
      const regs = f.place.regs || [];
      const own = regs.find(function (r) { return DLS_REG_ID.has(r) && r.cls === 'building'; })
        || regs.find(function (r) { return DLS_REG_ID.has(r); });
      if (!own) {
        IZFIX.dropped++;
        continue;
      }
      const tags = { lit: !!f.lit };
      if (f.kind === 'door') tags.door = f.style;
      else if (f.kind === 'light') tags.light = f.style;
      else tags.style = f.style;
      if (own.tags && own.tags.culture) tags.culture = own.tags.culture;
      T.child(DLS_REG_ID.get(own), {
        'class': 'fixture',
        kind: f.kind,
        key: f.place.key,
        name: f.kind + ' (' + (own.name || f.place.key) + ')',
        at: f.at,
        ry: f.ry,
        size: [f.w, 0.2, f.h],
        tags: tags,
        frag: '69f-iziz-fixtures'
      });
    }
  }
})();
