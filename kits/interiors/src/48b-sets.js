/* ======================== Interior sets: a building kit's interiors as data ========================
   IX.sets holds, per building SET (a kit or a settlement's building registry), the interior each
   building key declares: the bodies planBuilding() cuts into rooms, or explicit ROOM() outlines,
   in the building's OWN frame (origin at the plot centre on the ground, +z the front/door side,
   metres: the frame every kit's builders draw in). The files live in kits/interiors/sets/<set>.js
   (sets/README.md) and are inlined into dist/interiors-sets.html by build.py. Engine-neutral: a
   world that places a building at (x, z, ry) calls IX.sets.instantiate(item, x, z, ry) and gets
   planned buildings and rooms in world metres, ready for furnishRoom().

     IX.sets.add({ set, title, culture?, wealth?, items: [item, ...] })
     item = {
       key, name,                      the set's registry key and display name
       culture, wealth,                catalog furniture culture (kits/catalog FURN_CULTURES) and 0..1
       types: [...],                   the building's types (the set's tags); a dwelling type makes it a residence
       lot: [w, d],                    the set's declared footprint (layout only)
       residence: true|false, units: n a residence must hold, per unit, a bed, a FOOD container and an
                                       ITEM container (30-programs.js FOOD_ROLES / ITEM_ROLES); default:
                                       residence when types holds a dwelling type, units 1
       bodies: [{ id, poly, y, levels: n | [{ h, poly? }], doors: [{ at, w, hinge?, swing? }], program,
                  roof, pitch, wall, partition, slab, front, stair, minWidth, culture?, wealth? }]
                                       each a planBuilding() shell in the LOCAL frame (poly = the OUTER
                                       face of the walls; program as planBuilding takes it)
       rooms: [{ id, kind, poly, y, h, doors, windows, fixtures, culture?, wealth? }]
                                       explicit rooms (round huts, open halls, a tent) in the local frame
       like: '<key>',                  copy another item's bodies and rooms (a reclaimed variant)
       skip: 'reason',                 no interior: open structure, a field, or GEOMETRY THAT PRECLUDES
                                       ROOMS (noted for the kit's author; the page lists them)
       note: 'free text'               caveats worth keeping
     }
     IX.sets.instantiate(item, ox, oz, ry, { seed, register, baseY, prefix }) ->
       { item, id, buildings: [B], specs: [{ shell, program }], rooms: [R] (every room, world metres) }
     IX.sets.auditResidence(inst, plansByRoomId) -> { residence, units, beds, food, items, fails: [] }
     IX.sets.shape: rect(w, d, cx, cz), circle(r, n, cx, cz), ell(w, d, cw, cd, cx, cz), offset(poly, dx, dz)
   ====================================================================== */
(function (IX) {
  'use strict';
  const R3 = IX.round;
  const DWELLING = ['single-family dwelling', 'multi-family dwelling', 'dwelling-single', 'dwelling-multi', 'dwelling'];
  const S = IX.sets = { list: [], byName: {} };

  S.shape = {
    rect: function (w, d, cx, cz) { cx = cx || 0; cz = cz || 0; return [[cx - w / 2, cz - d / 2], [cx + w / 2, cz - d / 2], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]]; },
    circle: function (r, n, cx, cz) {
      cx = cx || 0; cz = cz || 0; n = n || 12; const out = [];
      for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2; out.push([R3(cx + r * Math.sin(a)), R3(cz + r * Math.cos(a))]); }
      return out;
    },
    /* a w x d rectangle with its back-right cw x cd corner taken out (back = -z) */
    ell: function (w, d, cw, cd, cx, cz) {
      cx = cx || 0; cz = cz || 0;
      return [[cx - w / 2, cz - d / 2], [cx + w / 2 - cw, cz - d / 2], [cx + w / 2 - cw, cz - d / 2 + cd], [cx + w / 2, cz - d / 2 + cd], [cx + w / 2, cz + d / 2], [cx - w / 2, cz + d / 2]];
    },
    offset: function (poly, dx, dz) { return poly.map(function (p) { return [p[0] + dx, p[1] + dz]; }); }
  };

  S.isResidence = function (item) {
    if (item.residence != null) return !!item.residence;
    return (item.types || []).some(function (t) { return DWELLING.indexOf(t) >= 0; });
  };
  S.add = function (def) {
    if (!def || !def.set) throw new Error('IX.sets.add needs { set, items }');
    if (S.byName[def.set]) throw new Error('interior set ' + def.set + ' added twice');
    const set = { set: def.set, title: def.title || def.set, culture: def.culture || null, wealth: def.wealth, items: [], byKey: {} };
    (def.items || []).forEach(function (it) {
      if (!it.key) throw new Error('set ' + def.set + ': an item has no key');
      if (set.byKey[it.key]) throw new Error('set ' + def.set + ': item ' + it.key + ' twice');
      const item = Object.assign({}, it);
      item.set = def.set;
      if (item.like) {
        const src = set.byKey[item.like];
        if (!src) throw new Error('set ' + def.set + ': ' + it.key + ' is like unknown ' + item.like);
        if (!item.bodies) item.bodies = src.bodies;
        if (!item.rooms) item.rooms = src.rooms;
        if (item.culture == null) item.culture = src.culture;
        if (item.wealth == null) item.wealth = src.wealth;
        if (item.types == null) item.types = src.types;
        if (item.lot == null) item.lot = src.lot;
        if (item.units == null) item.units = src.units;
        if (item.residence == null && src.residence != null) item.residence = src.residence;
        if (item.skip == null && src.skip) item.skip = src.skip;
      }
      if (item.culture == null) item.culture = set.culture;
      if (item.wealth == null) item.wealth = set.wealth == null ? 0.5 : set.wealth;
      item.bodies = item.bodies || [];
      item.rooms = item.rooms || [];
      item.units = item.units == null ? 1 : item.units;
      item.residence = S.isResidence(item);
      if (!item.skip && !item.bodies.length && !item.rooms.length) throw new Error('set ' + def.set + ': ' + it.key + ' has no bodies, no rooms and no skip reason');
      set.items.push(item); set.byKey[item.key] = item;
    });
    S.list.push(set); S.byName[set.set] = set;
    return set;
  };

  function xf(ox, oz, ry) {
    const c = Math.cos(ry || 0), s = Math.sin(ry || 0);
    return function (p) { return [R3(ox + p[0] * c + p[1] * s), R3(oz - p[0] * s + p[1] * c)]; };
  }
  S.instantiate = function (item, ox, oz, ry, o) {
    o = o || {};
    const T = xf(ox, oz, ry), baseY = o.baseY || 0, id = (o.prefix || item.set + '.') + item.key;
    const out = { item: item, id: id, buildings: [], specs: [], rooms: [], x: ox, z: oz, ry: ry || 0 };
    if (item.skip) return out;
    const poly = function (P) { return P.map(T); };
    const door = function (d) {
      const q = Object.assign({}, d); q.at = T(d.at);
      if (q.to == null) q.to = 'street';
      return q;
    };
    item.bodies.forEach(function (b, bi) {
      const shell = {
        id: id + '.' + (b.id || 'b' + bi), poly: poly(b.poly), y: baseY + (b.y || 0),
        levels: Array.isArray(b.levels) ? b.levels.map(function (l) { return Object.assign({}, l, l.poly ? { poly: poly(l.poly) } : {}); }) : (b.levels || 1),
        culture: b.culture || item.culture, wealth: b.wealth == null ? item.wealth : b.wealth,
        roof: b.roof || 'gable', pitch: b.pitch
      };
      if (b.h) shell.h = b.h;
      if (b.doors) shell.doors = b.doors.map(door);
      if (b.front != null) shell.front = b.front;
      ['wall', 'partition', 'slab', 'windows'].forEach(function (k) { if (b[k] != null) shell[k] = b[k]; });
      const po = { seed: o.seed || 0, register: o.register !== false };
      if (b.stair) po.stair = b.stair;
      if (b.minWidth) po.minWidth = b.minWidth;
      if (b.door) po.door = b.door;
      const B = IX.planBuilding(shell, b.program || 'dwelling', po);
      B.setItem = item; B.body = b;
      out.buildings.push(B); out.specs.push({ shell: shell, program: b.program || 'dwelling', opts: po });
      B.rooms.forEach(function (R) { R.setItem = item; R.setBody = b.id || 'b' + bi; out.rooms.push(R); });
    });
    item.rooms.forEach(function (r, ri) {
      const def = {
        id: id + '.' + (r.id || 'r' + ri), building: id, kind: r.kind || 'hall', poly: poly(r.poly), y: baseY + (r.y || 0), h: r.h || 3.0,
        culture: r.culture || item.culture, wealth: r.wealth == null ? item.wealth : r.wealth, level: r.level || 0,
        doors: (r.doors || []).map(door),
        windows: (r.windows || []).map(function (w) { const q = Object.assign({}, w); q.at = T(w.at); return q; }),
        fixtures: (r.fixtures || []).map(function (f) {
          const q = Object.assign({}, f), p = T([f.x, f.z]); q.x = p[0]; q.z = p[1]; q.ry = (f.ry || 0) + (ry || 0); return q;
        })
      };
      if (r.seed != null) def.seed = r.seed;
      const R = o.register !== false ? IX.ROOM(def) : IX.normRoom(def);
      R.setItem = item; R.setBody = r.id || 'r' + ri; R.explicit = true;
      out.rooms.push(R);
    });
    return out;
  };

  /* furnish a PLACED building in one call (a kit page, a settlement): instantiate the item at the building's
     placement, furnish every room through `catalog` (an adapter: IX.runtimeAdapter for a batch), build them.
     o: { baseY, seed, prefix, register (default false: a world of many buildings need not fill IX.rooms) }
     -> { inst, plans: { roomId: plan }, residence: IX.sets.auditResidence(...) } */
  S.furnish = function (item, ox, oz, ry, catalog, o) {
    o = o || {};
    const inst = S.instantiate(item, ox, oz, ry, { baseY: o.baseY || 0, register: !!o.register, seed: o.seed || 0, prefix: o.prefix });
    const plans = {};
    inst.rooms.forEach(function (R) {
      const P = IX.furnishRoom(R, catalog, { seed: o.seed || 0 });
      IX.buildRoom(P, catalog, R);
      plans[R.id] = P;
    });
    return { inst: inst, plans: plans, residence: S.auditResidence(inst, plans) };
  };
  S.find = function (key) { for (const set of S.list) if (set.byKey[key]) return set.byKey[key]; return null; };

  /* the residence check: per unit a bed (a bunk counts two), a FOOD container and an ITEM container somewhere in the building */
  S.auditResidence = function (inst, plans) {
    const item = inst.item, out = { residence: item.residence, units: item.units, beds: 0, food: 0, items: 0, fails: [] };
    if (!item.residence || item.skip) return out;
    const FOOD = IX.FOOD_ROLES || [], ITEM = IX.ITEM_ROLES || [];
    inst.rooms.forEach(function (R) {
      const P = plans[R.id]; if (!P) return;
      P.placements.forEach(function (p) {
        if (p.type === 'bed') out.beds += p.catRole === 'bunk' ? 2 : 1;     /* a bunk sleeps two */
        if (p.catRole && FOOD.indexOf(p.catRole) >= 0 && (p.type === 'storage' || p.type === 'vessel' || p.type === 'stack') && p.anchor !== 'surface') out.food++;
        if (p.catRole && ITEM.indexOf(p.catRole) >= 0 && p.type === 'storage') out.items++;
      });
    });
    const n = item.units;
    if (out.beds < n) out.fails.push(inst.id + ': residence of ' + n + ' unit(s) holds ' + out.beds + ' bed(s)');
    if (out.food < n) out.fails.push(inst.id + ': residence of ' + n + ' unit(s) holds ' + out.food + ' food container(s)');
    if (out.items < n) out.fails.push(inst.id + ': residence of ' + n + ' unit(s) holds ' + out.items + ' item container(s)');
    return out;
  };
})(KratorInteriors);
