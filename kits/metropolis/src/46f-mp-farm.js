// ================================================================= METROPOLIS â€” the farm belt: Soleri's planned developments, records  [G data]
// The owner, 2026-11-04 (biomes/ancientsvalley/PLAN.md section 13, question 9): the farm families live in this kit, beside the towers and
// the industry; 2026-11-10 (PLAN.md section 12, 2b): the Terraces station needs them. Soleri's planned farm developments (reference
// *landscape* 8): hexagonal growing pods (a glazed dome or a glazed vault on a hex plinth), terraced growing stacks stepping down a slope,
// the hub town's civic buildings (a hall, a market, a water tower), an aqueduct on arches and a pump house. Each is a design (MP.DESIGNS:
// the shape's numbers, drawn by 54f) with a family record beside the towers' (MP.FAMILY, design: true): its storeys and what each is for,
// its core, its skin's radius at a height (envR), its ruin states; so the kit's machinery serves it unchanged: MP.storey plans it, MP.audit
// checks it, MP.ruinDesign cuts it, MP.debrisPlan heaps it, KSHELL bakes it (a box shell), the impostors card it. No THREE, no DOM.
//   MP.FARM_KEYS        the eight, in the order the stage shows them
//   MP.FARM_DESIGN      the shape's numbers each builder reads (also MP.DESIGNS[k])
//   MP.aqueductJoin     the aqueduct module's joint: its length, the channel's floor over its base, the clear span under each arch
(function () {
  /* the ruin states a farm building answers: the towers' seven, with notes of its own (46c's defaults) */
  function ruins(o) {
    return Object.assign({
      intact: { note: 'whole, as built' },
      gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.75, keep: 1, note: 'glass gone, the beds burnt out, streaked' },
      crown: { keep: 0.8, note: 'the top fallen in' },
      broken: { keep: 0.55, note: 'torn through, half of it down' },
      stump: { keep: 0.2, core: 0.3, note: 'the plinth and the core' },
      skeleton: { keep: 0.75, bare: 0.7, note: 'the skin gone above the plant floor: the floor slabs and the core stand' },
      fallen: { keep: 0.08, along: 1, note: 'down: a low mound on the plinth' }
    }, o || {});
  }
  /* storeys from zones, each zone with its own height (46c's levels), from y0 */
  function levels(zones, y0) {
    var L = [], y = y0 || 0;
    zones.forEach(function (Z, zi) { for (var i = 0; i < Z.n; i++) { L.push({ k: L.length, y: Math.round(y * 1000) / 1000, h: Z.h, use: Z.use, zone: zi, nth: i }); y += Z.h; } });
    return L;
  }
  /* a round core of a stair and a lift side by side (under 6 m: 46c's small core) */
  function core(r, last) {
    return { kind: 'round', r: r, stepAt: Infinity, rUp: r, shafts: [{ id: 'stair.n', kind: 'stair', x: 0, z: -1.45, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'lift.s', kind: 'lift', x: 0, z: 1.45, w: 2.4, d: 2.6, from: 0, to: last }] };
  }
  /* a rect core: the stair and the lift side by side on x at z (the Reed's) */
  function rectCore(z, last) {
    return { kind: 'rects', shafts: [{ id: 'stair', kind: 'stair', x: -2.2, z: z, w: 3.2, d: 2.6, from: 0, to: last }, { id: 'lift', kind: 'lift', x: 2.2, z: z, w: 2.4, d: 2.6, from: 0, to: last }] };
  }
  var HEX = Math.cos(Math.PI / 6);   /* a hexagon's inner radius over its outer */
  var greens = function () { return 'greenhouse'; };
  var KINDS = { plant: function () { return 'plant'; }, hydroponics: greens, market: function (i) { return i % 6 === 5 ? 'store' : 'stall'; }, offices: function (i) { return i % 4 === 3 ? 'meeting' : 'office'; } };

  var D = MP.FARM_DESIGN = {
    /* a growing pod: a hexagonal plinth (one storey of pumps and nutrient tanks, a ring of louvres, two doors), a terrace walk round a faceted
       hexagonal glass dome; inside, the growing floor and a mezzanine of beds round a core that rises to a glazed lantern */
    pod: { id: 'pod', name: 'The Growing Pod', kind: 'farm', language: 9, tris: 16000, footprint: { w: 52, d: 46 }, height: { roof: 19, tip: 27 }, sh: 4.5,
      hex: 26, plinth: 4.2, dome: { r: 23.5, h: 20 }, mezz: 8.7, lantern: 3.2, doors: [Math.PI / 2, -Math.PI / 2] },
    /* a vault house: an elongated hexagonal plinth (its ends pointed) under a glazed barrel vault, ribbed every 8 m, glazed half-domes at its ends */
    vault: { id: 'vault', name: 'The Vault House', kind: 'farm', language: 9, tris: 16000, footprint: { w: 100, d: 40 }, height: { roof: 18, tip: 21.6 }, sh: 4.5,
      len: 80, tipX: 10, half: 20, plinth: 4.2, vault: { r: 17 }, rib: 8 },
    /* a growing stack: five glazed tiers stepping back up a slope (its front, +z, downhill), each tier's roof the planted terrace of the one above;
       the back (-z) a blank retaining wall into the hill */
    stack: { id: 'stack', name: 'The Growing Stack', kind: 'farm', language: 9, tris: 18000, footprint: { w: 64, d: 72 }, height: { roof: 35, tip: 37.5 }, sh: 7,
      tiers: 5, tierH: 7, step: 11 },
    /* the hub town's hall: a drum of two storeys under a ribbed shell dome with an oculus, a great glazed apse arch on +z over the doors */
    hall: { id: 'hall', name: 'The Hub Hall', kind: 'farm', language: 9, tris: 16000, footprint: { w: 64, d: 64 }, height: { roof: 15.6, tip: 27 }, sh: 4.2,
      r: 30, hall: 7.2, ribs: 16, oculus: 4 },
    /* the market: a glass drum on piers, two storeys of stalls, under a folded concrete umbrella of twelve petals to a lantern */
    market: { id: 'market', name: 'The Market', kind: 'farm', language: 9, tris: 16000, footprint: { w: 76, d: 76 }, height: { roof: 9.4, tip: 18 }, sh: 4.7,
      r: 34, petals: 12, lantern: 5 },
    /* the water tower: a pump drum at its foot, a fluted shaft holding the stair and the lift, a tank bowl with a gallery round it, a vent cap */
    watertower: { id: 'watertower', name: 'The Water Tower', kind: 'farm', language: 9, tris: 14000, footprint: { w: 36, d: 36 }, height: { roof: 46, tip: 54 }, sh: 5,
      base: { r: 12, h: 5 }, shaft: { r: 7, flutes: 12 }, bowl: { y0: 36, y1: 41, r: 16, top: 50 } },
    /* the aqueduct: a module of three arches, laid end to end along its line; half piers at its ends, so two modules meet in one pier; a trough on top */
    aqueduct: { id: 'aqueduct', name: 'The Aqueduct', kind: 'farm', language: 9, tris: 6000, footprint: { w: 66, d: 5.6 }, height: { roof: 26.2, tip: 26.2 }, sh: 26.2,
      len: 66, arches: 3, pier: 4.4, spring: 14, deck: 23, trough: { y: 24.4, w: 5.6, wall: 0.5, h: 1.8 } },
    /* the pump house: an octagonal drum of two storeys (a tall pump hall, then the switch floor), an eight-sided roof, a standpipe, a sluice
       channel out on +x */
    pumphouse: { id: 'pumphouse', name: 'The Pump House', kind: 'farm', language: 9, tris: 12000, footprint: { w: 62, d: 32 }, height: { roof: 10.5, tip: 24 }, sh: 5,
      r: 14, hall: 6, roof: 16, pipe: { r: 1.4, h: 24, x: -8 }, sluice: { len: 17, w: 4 } }
  };
  MP.FARM_KEYS = ['pod', 'vault', 'stack', 'hall', 'market', 'watertower', 'aqueduct', 'pumphouse'];
  MP.FARM_KEYS.forEach(function (k) { MP.DESIGNS[k] = D[k]; });

  var fam = function (k, o) { var d = D[k]; MP.FAMILY[k] = Object.assign({ id: k, name: d.name, kind: d.kind, language: d.language, culture: 'ancient', tris: d.tris, design: true, farm: true, height: d.height, secScale: 1 }, o); return MP.FAMILY[k]; };

  // ---- the pod: the plinth's storey (plant), the growing floor and the mezzanine of beds under the dome (hydroponics); the skin is the
  // hexagon's inner circle (the plinth's) or the dome's at the storey's middle, less the glazing's depth
  (function () {
    var d = D.pod, zones = [{ use: 'plant', n: 1, h: d.plinth }, { use: 'hydroponics', n: 2, h: d.sh }], L = levels(zones), last = L.length - 1;
    var domeR = function (y) { var t = Math.min(1, Math.max(0, (y - d.plinth) / d.dome.h)); return d.dome.r * Math.sqrt(1 - t * t); };
    fam('pod', { footprint: { shape: 'circle', r: d.hex, w: 2 * d.hex, d: 2 * d.hex }, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { return (y < d.plinth ? d.hex * HEX - 0.9 : domeR(y) * HEX - 0.6); }, portals: d.doors, crown: { k: 'dome', r: d.dome.r }, core: core(4.4, last), mat: 'concrete',
      bays: { low: 36, high: 36, split: Infinity }, fall: Math.PI / 6,
      ruins: ruins({ crown: { keep: 0.8, note: 'the dome\'s cap and lantern fallen in' }, broken: { keep: 0.5, note: 'half the dome down, its ribs bent outward' }, stump: { keep: 0.21, core: 0.55, note: 'the plinth and the core' }, skeleton: { keep: 0.9, bare: 0.8, note: 'the dome gone to its plinth: the beds and the mezzanine\'s slab open to the sky about the core' } }) });
  })();

  // ---- the vault house: the plinth (plant), the growing floor and a gallery floor under the vault (hydroponics), each a rectangle the
  // vault's width at that height; rooms round four sides (MP.planLib.rectRings), the stair and the lift in the middle
  (function () {
    var d = D.vault, zones = [{ use: 'plant', n: 1, h: d.plinth }, { use: 'hydroponics', n: 2, h: d.sh }], L = levels(zones), last = L.length - 1;
    var halfW = function (y) { var u = y - d.plinth; return u < 0 ? d.half : Math.sqrt(Math.max(0, d.vault.r * d.vault.r - u * u)); };
    var rect = function (y) { return { hw: d.len / 2, hd: y < d.plinth ? d.half : halfW(y) }; };
    fam('vault', { footprint: { shape: 'rect', w: d.footprint.w, d: d.footprint.d }, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { var r = rect(y); return Math.min(r.hw, r.hd); }, portals: [], crown: { k: 'vault' }, mat: 'concrete', fall: Math.PI / 2,
      core: rectCore(0, last), bays: { width: 4, n: 0 },
      plan: function (F, Lv, lib) { var r = rect(Lv.y + Lv.h); return lib.rectRings(F, Lv, { hw: r.hw - 1.4, hd: Math.min(r.hd, rect(Lv.y + Lv.h * 0.5).hd) - 1.4, bands: [{ d: 6, roomW: 8, kinds: KINDS[Lv.use] || greens, door: 'in' }, { d: lib.CW, corr: true }], shafts: F.core.shafts }); },
      ruins: ruins({ crown: { keep: 0.8, note: 'the vault\'s crown fallen in along its length' }, broken: { keep: 0.5, note: 'the vault down to its haunches' }, stump: { keep: 0.24, core: 0.4, note: 'the plinth and the core' }, skeleton: { keep: 1, bare: 0.8, note: 'the vault gone to its plinth: the beds and the gallery\'s slab open to the sky' } }) });
  })();

  // ---- the stack: one storey a tier, each a rectangle stepping back (its front toward -z as it rises); the plant at the foot, the growing
  // tiers above; the stair and the lift at the back where every tier holds them
  (function () {
    var d = D.stack, zones = [{ use: 'plant', n: 1, h: d.tierH }, { use: 'hydroponics', n: d.tiers - 1, h: d.tierH }], L = levels(zones), last = L.length - 1;
    var tier = function (y) { return Math.max(0, Math.min(d.tiers - 1, Math.floor(y / d.tierH))); };
    var rect = function (y) { var k = tier(y), front = d.footprint.d / 2 - k * d.step, back = -d.footprint.d / 2; return { cx: 0, cz: (front + back) / 2, hw: d.footprint.w / 2, hd: (front - back) / 2 }; };
    var zc = -d.footprint.d / 2 + (d.footprint.d - (d.tiers - 1) * d.step) / 2;   /* the top tier's middle: every tier's core zone holds it */
    fam('stack', { footprint: { shape: 'rect', w: d.footprint.w, d: d.footprint.d }, storeys: L.length, levels: L, zones: zones,
      envR: function (y) { var r = rect(y); return Math.min(r.hw, r.hd); }, portals: [], crown: { k: 'terrace' }, mat: 'concrete', fall: Math.PI / 2,
      core: rectCore(zc, last), bays: { width: 4, n: 0 }, rect: rect,
      plan: function (F, Lv, lib) { var r = rect(Lv.y + Lv.h / 2); return lib.rectRings(F, Lv, { hw: r.hw - 0.9, hd: r.hd - 0.9, cx: r.cx, cz: r.cz, bands: [{ d: 7, roomW: 8, kinds: KINDS[Lv.use] || greens, door: 'in' }, { d: lib.CW, corr: true }], shafts: F.core.shafts }); },
      ruins: ruins({ crown: { keep: 0.8, note: 'the top tier fallen in' }, broken: { keep: 0.5, note: 'the upper tiers slid down the slope' }, stump: { keep: 0.22, core: 0.4, note: 'the foot tier and the retaining wall' }, skeleton: { keep: 1, bare: 0.75, note: 'the tiers\' slabs and mullions bare' } }) });
  })();

  // ---- the hall: the assembly hall (a concourse at the apse's doors, stalls round), the offices and the records over it, round the core
  (function () {
    var d = D.hall, zones = [{ use: 'hall', n: 1, h: d.hall }, { use: 'offices', n: 1, h: d.sh }, { use: 'records', n: 1, h: d.sh }], L = levels(zones), last = L.length - 1;
    fam('hall', { footprint: { shape: 'circle', r: d.r + 2, w: 2 * d.r + 4, d: 2 * d.r + 4 }, storeys: L.length, levels: L, zones: zones,
      envR: function () { return d.r - 0.6; }, portals: [Math.PI / 2], crown: { k: 'dome', r: d.r }, core: core(4.4, last), secScale: 1, mat: 'white',
      bays: { low: 64, high: 64, split: Infinity }, fall: -Math.PI / 2,
      ruins: ruins({ crown: { keep: 0.85, note: 'the shell dome fallen into the hall' }, broken: { keep: 0.55, note: 'the apse\'s arch down, a third of the drum with it' }, stump: { keep: 0.35, core: 0.6, note: 'the hall\'s walls' } }) });
  })();

  // ---- the market: two storeys of stalls round the core
  (function () {
    var d = D.market, zones = [{ use: 'market', n: 2, h: d.sh }], L = levels(zones), last = L.length - 1;
    fam('market', { footprint: { shape: 'circle', r: d.r + 4, w: 2 * d.r + 8, d: 2 * d.r + 8 }, storeys: L.length, levels: L, zones: zones,
      envR: function () { return d.r - 0.6; }, portals: [0, Math.PI / 2, Math.PI, -Math.PI / 2], crown: { k: 'dome', r: d.r + 4 }, core: core(4.4, last), mat: 'concrete',
      bays: { low: 72, high: 72, split: Infinity }, fall: Math.PI / 4,
      ruins: ruins({ crown: { keep: 0.9, note: 'the umbrella\'s petals fallen in' }, broken: { keep: 0.6, note: 'half the umbrella down on the stalls' }, stump: { keep: 0.45, core: 0.9, note: 'the ground storey\'s piers' } }) });
  })();

  // ---- the water tower: the pump drum (plant), then the bowl's two storeys of tanks; the stair and the lift rise in the shaft between
  (function () {
    var d = D.watertower, b = d.bowl, sh = (b.top - b.y0) / 3;
    var L = [{ k: 0, y: 0, h: d.base.h, use: 'plant', zone: 0, nth: 0 }, { k: 1, y: b.y0, h: sh, use: 'tanks', zone: 1, nth: 0 }, { k: 2, y: b.y0 + sh, h: sh, use: 'tanks', zone: 1, nth: 1 }, { k: 3, y: b.y0 + 2 * sh, h: sh, use: 'tanks', zone: 1, nth: 2 }];
    var bowlR = function (y) { return y < b.y1 ? d.shaft.r + (b.r - d.shaft.r) * Math.max(0, (y - b.y0) / (b.y1 - b.y0)) : b.r; };
    fam('watertower', { footprint: { shape: 'circle', r: b.r + 2, w: 2 * b.r + 4, d: 2 * b.r + 4 }, storeys: L.length, levels: L, zones: [{ use: 'plant', n: 1, h: d.base.h }, { use: 'tanks', n: 3, h: sh }],
      envR: function (y) { return y < d.base.h ? d.base.r - 0.8 : y < b.y0 ? d.shaft.r - 0.6 : bowlR(y) - 0.6; }, portals: [Math.PI / 2], crown: { k: 'bowl', r: b.r, neck: [b.y0, b.y1] }, core: core(4.4, L.length - 1), mat: 'concrete',
      bays: { low: 24, high: 24, split: Infinity }, fall: Math.PI / 3,
      ruins: ruins({ crown: { keep: 0.92, note: 'the vent cap and the gallery\'s rail gone' }, broken: { keep: 0.6, note: 'the bowl fallen, the shaft standing to its neck' }, stump: { keep: 0.22, core: 0.3, note: 'the pump drum and the foot of the shaft' }, skeleton: { keep: 1, bare: 0.4, note: 'the bowl\'s cladding off its frame' } }) });
  })();

  // ---- the aqueduct: no storeys (a channel on arches, walked only on its trough's floor); three arches a module, each heaped where it stood
  (function () {
    var d = D.aqueduct, sp = d.len / d.arches;
    fam('aqueduct', { footprint: { shape: 'rect', w: d.len, d: d.footprint.d }, storeys: 0, levels: [], zones: [],
      envR: function () { return d.footprint.d / 2; }, secR: function () { return d.pier / 2; }, portals: [], crown: { k: 'flat' }, mat: 'concrete', fall: Math.PI / 2,
      core: { kind: 'none', r: 0, shafts: [] }, bays: { width: sp, n: 0 },
      towers: [0, 1, 2].map(function (i) { return { x: -d.len / 2 + (i + 0.5) * sp, z: 0, r: sp / 2, h: d.height.roof, fall: Math.PI / 2, squat: true }; }),
      ruins: ruins({ gutted: { glass: 0, strips: 0, breach: 0.1, stain: 0.72, keep: 0.96, note: 'dry, its trough cracked and streaked' }, crown: { keep: 0.9, note: 'the trough\'s walls broken off' }, broken: { keep: 0.6, note: 'the deck and the arches\' crowns down, the piers standing' }, stump: { keep: 0.25, note: 'the piers\' feet' }, skeleton: { keep: 0.9, bare: 0.2, note: 'the arches\' facing fallen from the core' }, fallen: { keep: 0.08, along: 1, note: 'down: a heap at each arch' } }) });
    /* the joint, for a line laid of modules: each module from x -len/2 to +len/2 in its frame, the channel's floor at trough.y over its base, an arch
       clear from (k + 1/2) sp - (sp - pier)/2 to (k + 1/2) sp + (sp - pier)/2 under its spring */
    MP.aqueductJoin = { len: d.len, channelY: d.trough.y, spring: d.spring, arches: d.arches, span: sp, clear: sp - d.pier, pier: d.pier, depth: d.footprint.d,
      archAt: function (u) { var k = Math.floor((u + d.len / 2) / sp); if (k < 0 || k >= d.arches) return null; var c = -d.len / 2 + (k + 0.5) * sp; return Math.abs(u - c) <= (sp - d.pier) / 2 ? { k: k, c: c, half: (sp - d.pier) / 2 } : null; } };
  })();

  // ---- the pump house: the pump hall and the switch floor round the core
  (function () {
    var d = D.pumphouse, zones = [{ use: 'plant', n: 1, h: d.hall }, { use: 'plant', n: 1, h: d.height.roof - d.hall }], L = levels(zones), last = L.length - 1;
    fam('pumphouse', { footprint: { shape: 'circle', r: d.r + 1, w: 2 * d.r + 2, d: 2 * d.r + 2 }, storeys: L.length, levels: L, zones: zones,
      envR: function () { return d.r * Math.cos(Math.PI / 8) - 0.8; }, portals: [-Math.PI / 2], crown: { k: 'roof', r: d.r }, core: core(4.4, last), mat: 'concrete',
      bays: { low: 8, high: 8, split: Infinity }, fall: Math.PI,
      ruins: ruins({ crown: { keep: 0.85, note: 'the roof fallen into the switch floor' }, broken: { keep: 0.6, note: 'half the drum down, the pumps in the open' }, stump: { keep: 0.4, core: 0.6, note: 'the pump hall\'s walls' } }) });
  })();
})();
