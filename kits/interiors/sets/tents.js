/* kits/interiors/sets/tents.js: the Tents kit's interiors (kits/tents, 2026-11-09).
   One item per def key of the Tents kit ('tn-<form>-<size>': kits/tents/src/33-tn-table.js, whose tnRoom() these rooms are;
   kits/tents/tests/test-tents.js checks they match), in the def's own frame (origin on the ground at the tent's centre, +z the
   door). Each room is the inner face of the cover where a walker stands up and furniture fits under it (a bell tent's and a
   cone's room is drawn in from the hem to where the cloth is high enough); the poles standing in it are fixtures with
   reach: false, so nothing is placed on them. The open forms (fly, awning, screen), the wedge and the wagon have no room.

   A tent's ROLE is a placement option, not a key: the same bell tent is a family's home (cottage), a sleeping tent
   (dormitory), a council tent (hall) or a mess (kitchen). IX.TENTS.item(key, {kind, culture, wealth}) gives the item as the
   role's room kind in the dress's furniture culture (the residence rule follows the kind). The kind and types each item
   declares here are the def's natural role's (the kit's TN_ROLE_OF), which the sets sheet audits.
     IX.TENTS.KINDS     the role -> room kind table the kit uses (kits/tents/src/33-tn-table.js TN_ROLES, TN_TRADES)
     IX.TENTS.item(key, o) -> a copy of the item: rooms as o.kind, culture o.culture, wealth o.wealth; types and the
                         residence flag from the kind (a cottage or dormitory is a residence)
   Uses only room kinds IX.PROGRAMS already has (cottage dormitory hall kitchen workshop smithy shrine store shop barracks
   stable): this file adds no programme. */
(function (IX) {
  'use strict';
  const RES = { cottage: ['dwelling-single'], dormitory: ['dwelling-multi'], living: ['dwelling-single'], bedroom: ['dwelling-single'] };
  IX.TENTS = {
    KINDS: { family: 'cottage', sleeping: 'dormitory', chief: 'hall', council: 'hall', workshop: 'workshop', supply: 'store', trade: 'shop', guard: 'barracks',
      mess: 'kitchen', stable: 'stable', smith: 'smithy', hide: 'workshop', seer: 'shrine', weaver: 'workshop' },
    item: function (key, o) {
      o = o || {};
      const set = IX.sets.byName.tents, base = set && set.byKey[key];
      if (!base || base.skip) return base || null;
      const kind = o.kind || base.rooms[0].kind, res = RES[kind];
      return Object.assign({}, base, {
        culture: o.culture == null ? base.culture : o.culture, wealth: o.wealth == null ? base.wealth : o.wealth,
        types: res || ['civic'], residence: !!res,
        rooms: base.rooms.map(function (r) { return Object.assign({}, r, { kind: kind }); })
      });
    }
  };
  IX.sets.add({ set: 'tents', title: 'Tents (kits/tents): every form and size, culture-neutral', culture: 'generic', wealth: 0.45, items: [
    { key: 'tn-ridge-s', name: 'Ridge tent, small', types: ['dwelling-multi'], lot: [6.6, 6.8],
      rooms: [{ id: 'in', kind: 'dormitory', poly: [[-1.4, -1.9], [1.4, -1.9], [1.4, 1.9], [-1.4, 1.9]], y: 0, h: 1.5,
        doors: [{ at: [0, 1.9], w: 1, swing: 'none' }] }] },
    { key: 'tn-ridge-m', name: 'Ridge tent, medium', types: ['dwelling-multi'], lot: [7.6, 8.4],
      rooms: [{ id: 'in', kind: 'dormitory', poly: [[-1.9, -2.7], [1.9, -2.7], [1.9, 2.7], [-1.9, 2.7]], y: 0, h: 1.7,
        doors: [{ at: [0, 2.7], w: 1.1, swing: 'none' }] }] },
    { key: 'tn-ridge-l', name: 'Ridge tent, large', types: ['dwelling-multi'], lot: [8.6, 10.8],
      rooms: [{ id: 'in', kind: 'dormitory', poly: [[-2.4, -3.9], [2.4, -3.9], [2.4, 3.9], [-2.4, 3.9]], y: 0, h: 1.9,
        doors: [{ at: [0, 3.9], w: 1.2, swing: 'none' }] }] },
    { key: 'tn-bell-s', name: 'Bell tent, small', types: ['dwelling-single'], lot: [7.7, 7.7],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.4, 2.011], [1.139, 1.705], [1.705, 1.139], [2.011, 0.4], [2.011, -0.4], [1.705, -1.139], [1.139, -1.705], [0.4, -2.011], [-0.4, -2.011], [-1.139, -1.705], [-1.705, -1.139], [-2.011, -0.4], [-2.011, 0.4], [-1.705, 1.139], [-1.139, 1.705], [-0.4, 2.011]], y: 0, h: 1.35,
        doors: [{ at: [0, 2.05], w: 1, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: 0, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-bell-m', name: 'Bell tent, medium', types: ['dwelling-single'], lot: [9.3, 9.3],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.556, 2.795], [1.583, 2.37], [2.37, 1.583], [2.795, 0.556], [2.795, -0.556], [2.37, -1.583], [1.583, -2.37], [0.556, -2.795], [-0.556, -2.795], [-1.583, -2.37], [-2.37, -1.583], [-2.795, -0.556], [-2.795, 0.556], [-2.37, 1.583], [-1.583, 2.37], [-0.556, 2.795]], y: 0, h: 1.45,
        doors: [{ at: [0, 2.85], w: 1.1, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: 0, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-bell-l', name: 'Bell tent, large', types: ['dwelling-single'], lot: [11.3, 11.3],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.751, 3.776], [2.139, 3.201], [3.201, 2.139], [3.776, 0.751], [3.776, -0.751], [3.201, -2.139], [2.139, -3.201], [0.751, -3.776], [-0.751, -3.776], [-2.139, -3.201], [-3.201, -2.139], [-3.776, -0.751], [-3.776, 0.751], [-3.201, 2.139], [-2.139, 3.201], [-0.751, 3.776]], y: 0, h: 1.55,
        doors: [{ at: [0, 3.85], w: 1.2, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: 0, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-yurt-s', name: 'Yurt, small', types: ['dwelling-single'], lot: [6, 6.1],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.472, 2.374], [1.344, 2.012], [2.012, 1.344], [2.374, 0.472], [2.374, -0.472], [2.012, -1.344], [1.344, -2.012], [0.472, -2.374], [-0.472, -2.374], [-1.344, -2.012], [-2.012, -1.344], [-2.374, -0.472], [-2.374, 0.472], [-2.012, 1.344], [-1.344, 2.012], [-0.472, 2.374]], y: 0, h: 1.5,
        doors: [{ at: [0, 2.42], w: 0.9, swing: 'in' }] }] },
    { key: 'tn-yurt-m', name: 'Yurt, medium', types: ['dwelling-single'], lot: [7.4, 7.5],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.609, 3.06], [1.733, 2.594], [2.594, 1.733], [3.06, 0.609], [3.06, -0.609], [2.594, -1.733], [1.733, -2.594], [0.609, -3.06], [-0.609, -3.06], [-1.733, -2.594], [-2.594, -1.733], [-3.06, -0.609], [-3.06, 0.609], [-2.594, 1.733], [-1.733, 2.594], [-0.609, 3.06]], y: 0, h: 1.6,
        doors: [{ at: [0, 3.12], w: 0.9, swing: 'in' }] }] },
    { key: 'tn-yurt-l', name: 'Yurt, large', types: ['dwelling-single'], lot: [9.8, 9.9],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.843, 4.237], [2.4, 3.592], [3.592, 2.4], [4.237, 0.843], [4.237, -0.843], [3.592, -2.4], [2.4, -3.592], [0.843, -4.237], [-0.843, -4.237], [-2.4, -3.592], [-3.592, -2.4], [-4.237, -0.843], [-4.237, 0.843], [-3.592, 2.4], [-2.4, 3.592], [-0.843, 4.237]], y: 0, h: 1.8,
        doors: [{ at: [0, 4.32], w: 1, swing: 'in' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: -0.382, z: 0, w: 0.2, d: 0.2, reach: false }, { id: 'pole1', kind: 'post', x: 0.383, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-cone-s', name: 'Conical tent, small', types: ['dwelling-single'], lot: [4.9, 4.9],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.41, 1.53], [1.12, 1.12], [1.53, 0.41], [1.53, -0.41], [1.12, -1.12], [0.41, -1.53], [-0.41, -1.53], [-1.12, -1.12], [-1.53, -0.41], [-1.53, 0.41], [-1.12, 1.12], [-0.41, 1.53]], y: 0, h: 1.134,
        doors: [{ at: [0, 1.584], w: 0.8, swing: 'none' }] }] },
    { key: 'tn-cone-m', name: 'Conical tent, medium', types: ['dwelling-single'], lot: [6.5, 6.5],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.559, 2.086], [1.527, 1.527], [2.086, 0.559], [2.086, -0.559], [1.527, -1.527], [0.559, -2.086], [-0.559, -2.086], [-1.527, -1.527], [-2.086, -0.559], [-2.086, 0.559], [-1.527, 1.527], [-0.559, 2.086]], y: 0, h: 1.512,
        doors: [{ at: [0, 2.16], w: 0.9, swing: 'none' }] }] },
    { key: 'tn-cone-l', name: 'Conical tent, large', types: ['dwelling-single'], lot: [8.5, 8.5],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[0.745, 2.782], [2.036, 2.036], [2.782, 0.745], [2.782, -0.745], [2.036, -2.036], [0.745, -2.782], [-0.745, -2.782], [-2.036, -2.036], [-2.782, -0.745], [-2.782, 0.745], [-2.036, 2.036], [-0.745, 2.782]], y: 0, h: 1.89,
        doors: [{ at: [0, 2.88], w: 1, swing: 'none' }] }] },
    { key: 'tn-black-m', name: 'Black tent, medium', types: ['dwelling-single'], lot: [8, 9.5],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[-3.25, -1.95], [3.25, -1.95], [3.25, 1.95], [-3.25, 1.95]], y: 0, h: 1.6,
        doors: [{ at: [0, 1.95], w: 3.85, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: -2.333, z: -0.3, w: 0.2, d: 0.2, reach: false }, { id: 'pole1', kind: 'post', x: 0, z: -0.3, w: 0.2, d: 0.2, reach: false }, { id: 'pole2', kind: 'post', x: 2.333, z: -0.3, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-black-l', name: 'Black tent, large', types: ['dwelling-single'], lot: [12, 10.5],
      rooms: [{ id: 'in', kind: 'cottage', poly: [[-5.25, -2.45], [5.25, -2.45], [5.25, 2.45], [-5.25, 2.45]], y: 0, h: 1.65,
        doors: [{ at: [0, 2.45], w: 6.05, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: -4.125, z: -1, w: 0.2, d: 0.2, reach: false }, { id: 'pole1', kind: 'post', x: -1.375, z: -1, w: 0.2, d: 0.2, reach: false }, { id: 'pole2', kind: 'post', x: 1.375, z: -1, w: 0.2, d: 0.2, reach: false }, { id: 'pole3', kind: 'post', x: 4.125, z: -1, w: 0.2, d: 0.2, reach: false }, { id: 'pole4', kind: 'post', x: -4.125, z: 1, w: 0.2, d: 0.2, reach: false }, { id: 'pole5', kind: 'post', x: -1.375, z: 1, w: 0.2, d: 0.2, reach: false }, { id: 'pole6', kind: 'post', x: 1.375, z: 1, w: 0.2, d: 0.2, reach: false }, { id: 'pole7', kind: 'post', x: 4.125, z: 1, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-marquee-m', name: 'Marquee, medium', types: ['civic'], lot: [9.5, 9.5],
      rooms: [{ id: 'in', kind: 'hall', poly: [[-2.85, -2.85], [2.85, -2.85], [2.85, 2.85], [-2.85, 2.85]], y: 0, h: 2.2,
        doors: [{ at: [0, 2.85], w: 2, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: 0, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-marquee-l', name: 'Marquee, large', types: ['civic', 'dwelling-single'], lot: [14, 14],
      rooms: [{ id: 'in', kind: 'hall', poly: [[-4.35, -4.35], [4.35, -4.35], [4.35, 4.35], [-4.35, 4.35]], y: 0, h: 2.4,
        doors: [{ at: [0, 4.35], w: 2.4, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: 0, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-wedge-s', name: 'Wedge tent, small', types: ['infrastructure'], lot: [2.7, 4.6], skip: 'too low to furnish: two bedrolls are its own (FURNISH)' },
    { key: 'tn-wedge-m', name: 'Wedge tent, medium', types: ['infrastructure'], lot: [3.2, 5.199999999999999], skip: 'too low to furnish: two bedrolls are its own (FURNISH)' },
    { key: 'tn-fly-m', name: 'Fly (lean-to), medium', types: ['infrastructure'], lot: [4.2, 6.4], skip: 'open-sided: its gear is placed by the builder' },
    { key: 'tn-fly-l', name: 'Fly (lean-to), large', types: ['infrastructure'], lot: [5.6, 7.4], skip: 'open-sided: its gear is placed by the builder' },
    { key: 'tn-awning-m', name: 'Awning (stall), medium', types: ['infrastructure'], lot: [5.4, 5], skip: 'open-sided: a stall; its gear is placed by the builder' },
    { key: 'tn-roundend-m', name: 'Round-ended tent, medium', types: ['civic'], lot: [11.2, 7.4],
      rooms: [{ id: 'in', kind: 'kitchen', poly: [[2, -1.85], [2.925, -1.602], [3.602, -0.925], [3.85, 0], [3.602, 0.925], [2.925, 1.602], [2, 1.85], [-2, 1.85], [-2.925, 1.602], [-3.602, 0.925], [-3.85, 0], [-3.602, -0.925], [-2.925, -1.602], [-2, -1.85]], y: 0, h: 1.6,
        doors: [{ at: [0, 1.85], w: 1.2, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: -2, z: 0, w: 0.2, d: 0.2, reach: false }, { id: 'pole1', kind: 'post', x: 2, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-roundend-l', name: 'Round-ended tent, large', types: ['civic'], lot: [15.2, 8.4],
      rooms: [{ id: 'in', kind: 'kitchen', poly: [[3.5, -2.35], [4.675, -2.035], [5.535, -1.175], [5.85, 0], [5.535, 1.175], [4.675, 2.035], [3.5, 2.35], [-3.5, 2.35], [-4.675, 2.035], [-5.535, 1.175], [-5.85, 0], [-5.535, -1.175], [-4.675, -2.035], [-3.5, -2.35]], y: 0, h: 1.8,
        doors: [{ at: [0, 2.35], w: 1.4, swing: 'none' }],
        fixtures: [{ id: 'pole0', kind: 'post', x: -3.5, z: 0, w: 0.2, d: 0.2, reach: false }, { id: 'pole1', kind: 'post', x: 3.5, z: 0, w: 0.2, d: 0.2, reach: false }] }] },
    { key: 'tn-wagon-m', name: 'Wagon tilt, medium', types: ['infrastructure'], lot: [2.5, 6], skip: 'a cart bed: loaded, not furnished' },
    { key: 'tn-screen-s', name: 'Screen, small', types: ['infrastructure'], lot: [2, 2], skip: 'a screen round a pit: not a room' }
  ] });
})(KratorInteriors);
