// ================================================================= BLAKHED — the presented site simulation (`BK_SIM`) [G data]
// Phase F4 (settlements/blakhed/PLAN.md step B6; kits/tungang/PLAN.md 1.3.3; core/region/WEST-RIFT-SCOPE.md).
// Engine-neutral ([G data]: no THREE, no DOM): declares Blakhed's town, Market Truce Sanctuary, Icegarth (great, barrow and
// dugout ice-houses), Ropewalk, Fairfell, Winterings (7 Traveller vardo circles), Dalab mission, Golden Tears compound and
// Stairhead gin-wheel hoists into `core/simulation` (`SIM`):
//   BK_SIM.nav(plan, rings)       connected pedestrian + sledge navigation graph over BK_TOWN.WAYS, Market Truce walks,
//                                 Fairfell oval, Traveller circles and Stairhead switchbacks
//   BK_SIM.inTruce(x, z)          true inside the 16 `fg-truce-post` boundary stones (`|u| <= 40.2, |v| <= 30.2`)
//   BK_SIM.dressOf(actor)         deterministic outfit & appearance record (`fellgang`, `traveller`, `kradz`, `wildcat`,
//                                 `dalab`, `tears`) with snow-goggles, salvage plates, rope coils, vardo waistcoats & horns
//   BK_SIM.declare(clock, o)      registers factions, orgs, places, economy (with ice-keeping spoilage on `77-sim-6-govern.js`),
//                                 needs (`eat`, `sleep`, `warmth`, `company`, `voice` on `77-sim-6-needs.js`), citizens,
//                                 pack-sledges, weekly Double Meeting (`fg-doublehall`), and Market Truce enforcement
var BK_SIM = (function () {
  'use strict';
  var B = {
    S: 'wr.blakhed',
    inited: false,
    problems: [],
    meetings: [],
    truceEvents: [],
    truceChecked: 0,
    doubleHall: { ropeSide: 0, tallySide: 0, lastMinute: null },
    counts: {}
  };
  function D0(x, d) { return x == null ? d : x; }

  B.ACTS = ['SLEEP', 'WORK', 'EAT', 'WARM', 'SOCIALIZE', 'TRADE', 'BUY', 'MEET', 'GUARD', 'PRAY', 'RACE', 'HOIST', 'DELIVER', 'REST'];

  /* Needs tuned for 3,653 m subpolar rim (`warmth` rises steadily and faster at night; `voice` filled at the Double Meeting) */
  B.NEEDS = {
    list: ['eat', 'sleep', 'warmth', 'company', 'voice'],
    rate: { eat: 3.6, sleep: 2.8, warmth: 3.4, company: 1.8, voice: 0.45 },
    work: { eat: 1.1, sleep: 0.7, warmth: 0.9, company: 0, voice: 0 },
    weight: { eat: 1.4, sleep: 1.2, warmth: 1.35, company: 0.8, voice: 0.75 },
    vital: { eat: 68, warmth: 72 },
    fill: {
      EAT: { eat: 58, warmth: 24, company: 12 },
      SLEEP: { sleep: 15, warmth: 22 },
      WARM: { warmth: 65, company: 18 },
      SOCIALIZE: { company: 42, warmth: 18 },
      MEET: { voice: 55, company: 32, warmth: 20 },
      PRAY: { voice: 22, company: 18, warmth: 14 },
      TRADE: { company: 16 },
      BUY: { eat: 28, company: 14 },
      REST: { sleep: 6, warmth: 20, company: 10 }
    },
    free: ['EAT', 'WARM', 'SOCIALIZE', 'BUY', 'PRAY', 'REST'],
    interrupt: { warmth: { at: 78, act: 'WARM', until: 22, max: 35, cool: 90 } },
    bands: [
      { label: 'thriving', min: 80, eff: 1.1 },
      { label: 'content', min: 60, eff: 1.0 },
      { label: 'strained', min: 40, eff: 0.88 },
      { label: 'cold-worn', min: 0, eff: 0.72 }
    ],
    init: [18, 16, 20, 22, 18],
    dwell: 45,
    jitter: 17,
    secPerMinute: 3
  };

  /* Ice-keeping spoilage rules (`77-sim-6-govern.js`): meat, dairy and eggs kept by ice in great, barrow and dugout vaults */
  B.SPOIL = {
    spoil: { meat: 0.05, dairy: 0.06, eggs: 0.04 },
    keep: { by: 'ice', goods: ['meat', 'dairy', 'eggs'], share: 0.85, per: 2 },
    season: { by: 'salt', mult: 1.15, least: 10 }
  };

  /* Weekly Double Meeting in `fg-doublehall`: Fowlers' kin by the 72-peg rope wall, Ice-cutters' kin by the 48-slat tally board */
  B.MEETINGS = [
    { id: 'double-meeting', name: 'The Double Meeting (rope wall and tally board)', day: 0, every: 7, hour: 17, hours: 2 },
    { id: 'fair-moot', name: 'The Autumn Fair Truce Moot', day: 3, every: 7, hour: 11, hours: 2 }
  ];

  /* Market Truce Sanctuary check: inside the 16 `fg-truce-post` monoliths (`|u| <= 40.2, |v| <= 30.2` in BK_TOWN's UV frame) */
  B.inTruce = function (x, z) {
    if (typeof BK_TOWN === 'undefined' || !BK_TOWN.frame) return Math.abs(x) <= 40.2 && Math.abs(z) <= 30.2;
    var F = BK_TOWN.frame, U = F.U, N = F.N;
    var u = x * U[0] + z * U[1], v = x * N[0] + z * N[1];
    return Math.abs(u) <= 40.2 && Math.abs(v) <= 30.2;
  };

  /* Deterministic cultural outfit & appearance generator (`fellgang`, `traveller`, `kradz`, `wildcat`, `dalab`, `tears`) */
  var PAL = {
    fellgang: {
      coats: [0x6e624c, 0x565c4a, 0x7c6848, 0x4e5258, 0x8a5e3c, 0x5c4c3e],
      trims: [0xa8321e, 0xc8902e, 0xd8d4c8, 0x2e5a8a],
      skins: [0x9e7658, 0x8d6548, 0xa88062, 0x7e583e]
    },
    traveller: {
      coats: [0xa8321e, 0x28587a, 0x3b6e42, 0xc48424, 0x6e3652, 0x8c4626],
      trims: [0xe6c24c, 0xe8e2d4, 0xc83c28, 0x3a82b8],
      skins: [0xa67c5e, 0x946b4e, 0xb2886a, 0x865e44]
    },
    kradz: {
      coats: [0x2a282c, 0x343036, 0x242a2e, 0x3a322c],
      trims: [0x7ab4ff, 0x9a8868, 0xb8a890],
      skins: [0x987864, 0x8a6c58, 0xa48672]
    },
    wildcat: {
      coats: [0x6e5238, 0x5a422c, 0x7e6042, 0x4c3a2a],
      trims: [0xd0c4a8, 0x9e3020, 0xb89a6c],
      skins: [0x8c6244, 0x7c5438, 0x9a6e4e]
    },
    dalab: {
      coats: [0xb87830, 0x9e4228, 0xc8963e, 0x6e5240],
      trims: [0xe8d49a, 0x3a2e28],
      skins: [0x9a7254, 0x886246, 0xa88060]
    },
    tears: {
      coats: [0x2a486e, 0x7a2838, 0x2e5e52, 0x8c6828],
      trims: [0xe6c258, 0xeae4d8],
      skins: [0xa27a58, 0x8e6648, 0xb08866]
    }
  };

  B.dressOf = function (actorOrId, groupHint, roleHint) {
    var id = typeof actorOrId === 'string' ? actorOrId : actorOrId.id;
    var role = roleHint || (actorOrId && actorOrId.role) || 'townsfolk';
    var org = (actorOrId && actorOrId.org) || '';
    var grp = groupHint || (org === 'bk.travellers' ? 'traveller' : org === 'bk.kradz' ? 'kradz' :
      org === 'bk.wildcat' ? 'wildcat' : org === 'bk.dalab' ? 'dalab' : org === 'bk.tears' ? 'tears' : 'fellgang');
    var P = PAL[grp] || PAL.fellgang;
    var h0 = KRAND.hash(44178, id.length, id.charCodeAt(0) || 1, id.charCodeAt(id.length - 1) || 2, id.charCodeAt(id.length >> 1) || 3);
    var pick = function (arr, salt) { return arr[Math.floor(KRAND.unit(KRAND.hash(h0, salt)) * arr.length)]; };
    var kin = KRAND.unit(KRAND.hash(h0, 11)) < 0.5 ? 'fowlers' : 'icecut';
    return {
      id: id,
      culture: grp,
      kin: kin,
      body: KRAND.unit(KRAND.hash(h0, 3)) < 0.48 ? 'mpfb_female' : 'mpfb_male',
      scale: role === 'child' ? 0.7 : (0.95 + KRAND.unit(KRAND.hash(h0, 5)) * 0.1),
      coat: pick(P.coats, 7),
      trim: pick(P.trims, 13),
      skin: pick(P.skins, 17),
      goggles: grp === 'fellgang' || grp === 'kradz',
      salvagePlate: grp === 'fellgang' || grp === 'wildcat',
      ropeCoil: role === 'ropemaker' || role === 'stairman' || (grp === 'fellgang' && kin === 'fowlers'),
      shawl: grp === 'traveller',
      lamp: grp === 'kradz',
      horns: grp === 'wildcat' && KRAND.unit(KRAND.hash(h0, 23)) < 0.45,
      turban: grp === 'tears',
      unarmedInTruce: grp === 'wildcat'
    };
  };

  /* Build a single-component pedestrian & sledge nav graph from BK_TOWN.WAYS, Market Sanctuary, Fairfell, Winterings and Stairhead */
  B.nav = function (plan, rings) {
    var G = BK_GROUND, hfn = G.h, nodes = [], edges = [], cellMap = {};
    var SNAP = 6.5;
    function addNode(x, z, tag) {
      var cx = Math.round(x / SNAP), cz = Math.round(z / SNAP), dx, dz;
      for (dx = -1; dx <= 1; dx++) {
        for (dz = -1; dz <= 1; dz++) {
          var hit = cellMap[(cx + dx) + ':' + (cz + dz)];
          if (hit != null && Math.hypot(nodes[hit].x - x, nodes[hit].z - z) <= SNAP) return hit;
        }
      }
      var id = nodes.length;
      nodes.push({ id: id, x: +x.toFixed(2), y: +hfn(x, z).toFixed(2), z: +z.toFixed(2), tag: tag || 'way' });
      cellMap[cx + ':' + cz] = id;
      return id;
    }
    var edgeSeen = {};
    function addEdge(a, b, kind, w) {
      if (a === b) return;
      var k = a < b ? a + ':' + b : b + ':' + a;
      if (edgeSeen[k]) return;
      edgeSeen[k] = 1;
      var len = Math.max(0.5, Math.hypot(nodes[b].x - nodes[a].x, nodes[b].z - nodes[a].z));
      edges.push({ id: edges.length, a: a, b: b, kind: kind || 'street', len: +len.toFixed(2), w: D0(w, 5) });
    }
    function addPoly(pts, step, kind, w, tag) {
      var prev = null, i, k;
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (Math.abs(p[0]) > 22000 || Math.abs(p[1]) > 22000) continue;
        if (prev != null) {
          var a0 = nodes[prev], L = Math.hypot(p[0] - a0.x, p[1] - a0.z), n = Math.max(1, Math.ceil(L / step));
          for (k = 1; k <= n; k++) {
            var nx = a0.x + (p[0] - a0.x) * k / n, nz = a0.z + (p[1] - a0.z) * k / n;
            var cur = addNode(nx, nz, tag);
            addEdge(prev, cur, kind, w);
            prev = cur;
          }
        } else {
          prev = addNode(p[0], p[1], tag);
        }
      }
    }

    var ways = (plan && plan.ways) || BK_TOWN.WAYS || [];
    ways.forEach(function (w) {
      addPoly(w.pts, 34, w.cls === 'main' ? 'main' : 'lane', w.cls === 'main' ? 7 : 4.2, w.id);
    });

    /* Market Truce Sanctuary cross-walks and central Hospitality Hearth / Peace Stone ring */
    var W = BK_TOWN.frame.W;
    addPoly([W(-46, 0), W(-20, 0), [0, 0], W(20, 0), W(46, 0)], 16, 'sanctuary', 6, 'truce');
    addPoly([W(0, -36), W(0, -16), [0, 0], W(0, 16), W(0, 36)], 16, 'sanctuary', 6, 'truce');

    /* Fairfell oval race-and-muster track */
    var fq = (plan && plan.quarters || []).find(function (q) { return q.id === 'fairfell'; });
    if (fq && fq.poly && fq.poly.length) {
      var fc = fq.poly.reduce(function (s, p) { return [s[0] + p[0] / fq.poly.length, s[1] + p[1] / fq.poly.length]; }, [0, 0]);
      var oval = [], oi;
      for (oi = 0; oi <= 16; oi++) {
        var ang = oi / 16 * Math.PI * 2;
        oval.push([fc[0] + Math.cos(ang) * 78, fc[1] + Math.sin(ang) * 42]);
      }
      addPoly(oval, 24, 'fair', 6, 'fair');
    }

    /* Traveller family camp circles */
    ((plan && plan.camps) || []).forEach(function (cp) {
      var cId = addNode(cp.x, cp.z, 'camp'), ring = [], ci;
      for (ci = 0; ci <= 8; ci++) {
        var a = ci / 8 * Math.PI * 2;
        ring.push([cp.x + Math.cos(a) * cp.R, cp.z + Math.sin(a) * cp.R]);
      }
      addPoly(ring, 14, 'camp', 4, 'camp');
      addEdge(cId, addNode(ring[0][0], ring[0][1], 'camp'), 'camp', 4);
    });

    /* Stairhead hamlet lanes and switchbacks */
    if (rings && rings.stairhead) {
      (rings.stairhead.lanes || []).forEach(function (ln) { addPoly(ln.pts, 28, 'lane', 4, 'stairhead'); });
      if (rings.stair && rings.stair.pts) addPoly(rings.stair.pts.slice(0, 14), 30, 'stair', 2.8, 'stair');
    }

    /* Connect any separate graph components deterministically so every place in town and Stairhead sits on one graph */
    function connectComponents() {
      var n = nodes.length;
      if (n < 2) return;
      var adj = nodes.map(function () { return []; });
      edges.forEach(function (e) { adj[e.a].push(e.b); adj[e.b].push(e.a); });
      for (var guard = 0; guard < 128; guard++) {
        var comp = new Int32Array(n).fill(-1), cid = 0, s;
        for (s = 0; s < n; s++) {
          if (comp[s] >= 0) continue;
          var q = [s]; comp[s] = cid;
          while (q.length) {
            var u = q.pop(), nb = adj[u], j;
            for (j = 0; j < nb.length; j++) if (comp[nb[j]] < 0) { comp[nb[j]] = cid; q.push(nb[j]); }
          }
          cid++;
        }
        if (cid <= 1) break;
        /* link component 1..cid-1 to component 0 at closest pair */
        var bestA = -1, bestB = -1, bestD = 1e18, i, k;
        for (i = 0; i < n; i++) {
          if (comp[i] !== 0) continue;
          for (k = 0; k < n; k++) {
            if (comp[k] === 0) continue;
            var d = Math.hypot(nodes[i].x - nodes[k].x, nodes[i].z - nodes[k].z);
            if (d < bestD) { bestD = d; bestA = i; bestB = k; }
          }
        }
        if (bestA < 0) break;
        addEdge(bestA, bestB, 'road', 5);
        adj[bestA].push(bestB); adj[bestB].push(bestA);
      }
    }
    connectComponents();

    var streetCount = nodes.length;
    function doorNode(x, z, ry, d) {
      var dx = x + Math.sin(D0(ry, 0)) * (D0(d, 6) / 2 + 2.2);
      var dz = z + Math.cos(D0(ry, 0)) * (D0(d, 6) / 2 + 2.2);
      var best = 0, bd = 1e18, i;
      for (i = 0; i < streetCount; i++) {
        var dist = (nodes[i].x - dx) * (nodes[i].x - dx) + (nodes[i].z - dz) * (nodes[i].z - dz);
        if (dist < bd) { bd = dist; best = i; }
      }
      var id = nodes.length;
      nodes.push({ id: id, x: +dx.toFixed(2), y: +hfn(dx, dz).toFixed(2), z: +dz.toFixed(2), tag: 'door' });
      addEdge(id, best, 'door', 3);
      return nodes[id];
    }

    return { nodes: nodes, edges: edges, doorNode: doorNode, streetCount: streetCount };
  };

  /* Map placed records to SIM place kinds and activity slot capacities */
  function placeSpecOf(r) {
    var k = r.key;
    if (k === 'fg-doublehall') return { kind: 'doublehall', act: { MEET: 160, SOCIALIZE: 40, WARM: 45 }, indoor: true };
    if (k === 'fg-markethall') return { kind: 'market', act: { TRADE: 16, BUY: 45, SOCIALIZE: 25 }, indoor: true };
    if (k === 'fg-booth') return { kind: 'market', act: { TRADE: 4, BUY: 14, SOCIALIZE: 8 }, indoor: false };
    if (k === 'fg-halting-house') return { kind: 'inn', act: { EAT: 28, WARM: 32, SOCIALIZE: 26, SLEEP: 16, WORK: 4 }, indoor: true };
    if (k === 'fg-great-icehouse' || k === 'fg-icehouse' || k === 'fg-dugout-icehouse') return { kind: 'icehouse', act: { WORK: 8, DELIVER: 6 }, indoor: true };
    if (k === 'fg-ropewalk' || k === 'fg-ropehouse') return { kind: 'ropewalk', act: { WORK: 10 }, indoor: false };
    if (k === 'fg-smithy') return { kind: 'smithy', act: { WORK: 6, WARM: 8 }, indoor: true };
    if (k === 'fg-tannery') return { kind: 'tannery', act: { WORK: 6 }, indoor: true };
    if (k === 'fg-granary' || k === 'fg-store' || k === 'fg-barn' || k === 'fg-smokehouse' || k === 'fg-sledgeshed') return { kind: 'warehouse', act: { WORK: 4, DELIVER: 6 }, indoor: true };
    if (k === 'fg-pens') return { kind: 'folds', act: { WORK: 4 }, indoor: false };
    if (k === 'fg-fair-stand') return { kind: 'fairstand', act: { RACE: 24, SOCIALIZE: 24, TRADE: 8 }, indoor: false };
    if (k === 'fg-cairnhall') return { kind: 'shrine', act: { PRAY: 24, SOCIALIZE: 10 }, indoor: true };
    if (k === 'fg-hut' || k === 'fg-house' || k === 'fg-longhouse' || k === 'fg-headhouse') {
      var beds = k === 'fg-hut' ? 4 : k === 'fg-house' ? 6 : k === 'fg-longhouse' ? 8 : 10;
      return { kind: 'home', act: { SLEEP: beds, EAT: beds, WARM: beds, REST: beds }, indoor: true };
    }
    if (/^dalab_/.test(k)) {
      if (k === 'dalab_temple' || k === 'dalab_shrine') return { kind: 'dalab_temple', act: { PRAY: 18, SOCIALIZE: 10 }, indoor: true, org: 'bk.dalab' };
      if (k === 'dalab_watchtower' || k === 'dalab_compound') return { kind: 'dalab_post', act: { GUARD: 8, SLEEP: 10, EAT: 10, WARM: 10 }, indoor: true, org: 'bk.dalab' };
      if (k === 'dalab_shops' || k === 'dalab_scribes' || k === 'dalab_warehouse') return { kind: 'dalab_work', act: { WORK: 8, TRADE: 6, DELIVER: 6 }, indoor: true, org: 'bk.dalab' };
      return { kind: 'dalab_home', act: { SLEEP: 12, EAT: 12, WARM: 12, REST: 12 }, indoor: true, org: 'bk.dalab' };
    }
    if (/^xa_/.test(k)) {
      if (k === 'xa_temple') return { kind: 'tears_temple', act: { PRAY: 16, SOCIALIZE: 8 }, indoor: true, org: 'bk.tears' };
      if (k === 'xa_barracks' || k === 'xa_watch') return { kind: 'tears_post', act: { GUARD: 10, SLEEP: 16, EAT: 16, WARM: 16 }, indoor: true, org: 'bk.tears' };
      if (k === 'xa_serai' || k === 'xa_teahouse' || k === 'xa_warehouse') return { kind: 'tears_work', act: { WORK: 8, TRADE: 8, EAT: 18, WARM: 18, SOCIALIZE: 16 }, indoor: true, org: 'bk.tears' };
      return { kind: 'tears_home', act: { SLEEP: 10, EAT: 10, WARM: 10, REST: 10 }, indoor: true, org: 'bk.tears' };
    }
    return null;
  }

  B.declare = function (clock, o) {
    o = o || {};
    var plan = o.plan, rings = o.rings;
    if (!plan) throw new Error('BK_SIM.declare: pass {plan, rings}');
    B.inited = true; B.problems = []; B.meetings = []; B.truceEvents = []; B.truceChecked = 0;
    var seed = D0(o.seed, 44178);
    SIM.init({
      seed: seed,
      hour: function () { return clock.hour; },
      day: function () { return clock.day; },
      t: function () { return clock.t; },
      err: function (m) { B.problems.push(m); }
    });

    /* Calendar windows matching WR_TUNE */
    if (SIM.calendar) {
      SIM.calendar({
        year: { yearD: 365, startDay: 0, solsticeDay: 350 },
        windows: {
          'bk.harvest': [185, 235], 'bk.shielings': [120, 235], 'bk.winter': [315, 75],
          'bk.thaw': [85, 305], 'bk.fowling': [90, 220], 'bk.salt': [110, 240], 'bk.fair': [255, 265]
        }
      });
    }

    B.ACTS.forEach(function (id) {
      SIM.activity({ id: id, indoor: /^(SLEEP|EAT|WARM|MEET|PRAY|REST)$/.test(id) });
    });

    /* Factions, relations & orgs */
    SIM.faction({ id: 'fellgang', name: 'The Fellgangs of Blakhed', culture: 'fellgang' });
    SIM.faction({ id: 'wildcat', name: 'Wildcat (visiting under the Market Truce)', culture: 'wildcat' });
    SIM.faction({ id: 'dalab', name: 'The Realm of Dalab (Mission & Stairhead Toll)', culture: 'dalab' });
    SIM.faction({ id: 'tears', name: 'The Golden Tears (Xanadu Escort Mission)', culture: 'tears' });

    var facs = ['fellgang', 'wildcat', 'dalab', 'tears'];
    facs.forEach(function (a) {
      facs.forEach(function (b) {
        if (a === b) return;
        var hostile = (a === 'wildcat' && (b === 'dalab' || b === 'tears')) || (b === 'wildcat' && (a === 'dalab' || a === 'tears'));
        SIM.relation({ a: a, b: b, stance: hostile ? 'hostile' : 'wary', trade: !hostile });
      });
    });

    SIM.settlement({ id: B.S, faction: 'fellgang', name: 'Blakhed' });
    SIM.org({ id: 'bk.town', faction: 'fellgang', name: 'The households and guilds of Blakhed' });
    SIM.org({ id: 'bk.travellers', faction: 'fellgang', name: 'The Travellers of the Winterings' });
    SIM.org({ id: 'bk.kradz', faction: 'fellgang', name: 'The Kradz shaft-factors' });
    SIM.org({ id: 'bk.dalab', faction: 'dalab', name: 'Dalab\'s mission and Stairhead toll post' });
    SIM.org({ id: 'bk.tears', faction: 'tears', name: 'The Golden Tears\' compound' });
    SIM.org({ id: 'bk.wildcat', faction: 'wildcat', name: 'Unarmed Wildcat Fair envoys' });

    var N = B.nav(plan, rings);
    B.navGraph = N;

    /* Economy with ice-keeping spoilage on 77-sim-6-govern.js */
    var goods = {
      grain: { unit: 'kg' }, potato: { unit: 'kg' }, meat: { unit: 'kg' }, dairy: { unit: 'kg' },
      eggs: { unit: 'kg' }, honey: { unit: 'kg' }, salt: { unit: 'kg' }, ice: { unit: 'kg' },
      rope: { unit: 'kg' }, wool: { unit: 'kg' }, felt: { unit: 'kg' }, tools: { unit: 'kg' },
      ivory: { unit: 'kg' }, obsidian: { unit: 'kg' }, hides: { unit: 'kg' }
    };
    SIM.economy(Object.assign({ goods: goods, every: 60, window: 3 }, B.SPOIL), { settlement: B.S });

    /* Central Market Sanctuary Hearth & Peace Stone (`bk.truce.hearth`) */
    var pHearth = N.doorNode(0, 0, 0, 2);
    SIM.place({
      id: 'bk.truce.hearth', name: 'The Market Truce Ring, Peace Stone and Perpetual Hospitality Hearth',
      kind: 'sanctuary', x: 0, y: BK_GROUND.h(0, 0), z: 0, door: { x: pHearth.x, y: pHearth.y, z: pHearth.z },
      activities: { WARM: 48, SOCIALIZE: 60, TRADE: 24, BUY: 40, MEET: 40 }, indoor: false, settlement: B.S
    });
    SIM.store('bk.truce.hearth', { kind: 'warehouse' });

    /* Register town buildings */
    var byKind = {}, doubleHallId = null, iceStores = [];
    function notePlace(P) { (byKind[P.kind] || (byKind[P.kind] = [])).push(P.id); }
    notePlace(SIM.R.place['bk.truce.hearth']);

    plan.records.forEach(function (r) {
      var sp = placeSpecOf(r);
      if (!sp) return;
      var dn = N.doorNode(r.x, r.z, r.ry, r.d);
      var P = SIM.place({
        id: r.id, name: r.name || r.key, kind: sp.kind, x: r.x, y: BK_GROUND.h(r.x, r.z), z: r.z, ry: r.ry,
        door: { x: dn.x, y: dn.y, z: dn.z }, activities: Object.assign({}, sp.act),
        indoor: sp.indoor, settlement: B.S, org: sp.org
      });
      notePlace(P);
      if (sp.kind === 'doublehall') doubleHallId = P.id;
      if (sp.kind === 'icehouse' || sp.kind === 'warehouse' || sp.kind === 'market') {
        SIM.store(P.id, { kind: 'warehouse' });
        if (sp.kind === 'icehouse') iceStores.push(P.id);
      }
    });

    /* Register the 7 Traveller family circles in The Winterings */
    (plan.camps || []).forEach(function (cp) {
      var dn = N.doorNode(cp.x, cp.z, 0, 4);
      var P = SIM.place({
        id: 'bk.camp.' + cp.id, name: cp.name + ' (vardo ring & tripod hearth)', kind: 'vardo_camp',
        x: cp.x, y: BK_GROUND.h(cp.x, cp.z), z: cp.z, door: { x: dn.x, y: dn.y, z: dn.z },
        activities: { SLEEP: 24, EAT: 24, WARM: 24, SOCIALIZE: 20, WORK: 8, TRADE: 6, REST: 16 },
        indoor: false, settlement: B.S, org: 'bk.travellers'
      });
      notePlace(P);
    });

    /* Register Stairhead gin-wheel hoists, Stairmen homes, and Dalab's Stairhead toll post */
    if (rings) {
      (rings.hoists || []).forEach(function (h) {
        var dn = N.doorNode(h.x, h.z, h.ry, 4);
        var P = SIM.place({
          id: h.id, name: h.name, kind: 'stair_hoist', x: h.x, y: h.y, z: h.z, ry: h.ry,
          door: { x: dn.x, y: dn.y, z: dn.z }, activities: { HOIST: 8, WORK: 8, DELIVER: 6 }, indoor: false, settlement: B.S
        });
        notePlace(P);
      });
      ((rings.stairhead && rings.stairhead.records) || []).slice(0, 10).forEach(function (r, idx) {
        var sp = placeSpecOf(r);
        if (!sp) return;
        var dn = N.doorNode(r.x, r.z, r.ry, r.d);
        var pid = 'bk.sh.' + idx;
        var P = SIM.place({
          id: pid, name: 'Stairhead: ' + r.key, kind: sp.kind === 'home' ? 'stair_home' : sp.kind,
          x: r.x, y: r.y, z: r.z, ry: r.ry, door: { x: dn.x, y: dn.y, z: dn.z },
          activities: Object.assign({}, sp.act), indoor: sp.indoor, settlement: B.S
        });
        notePlace(P);
      });
      (rings.toll || []).forEach(function (t) {
        var dn = N.doorNode(t.x, t.z, t.ry, 12);
        var P = SIM.place({
          id: t.id, name: t.name, kind: 'dalab_toll', x: t.x, y: BK_GROUND.h(t.x, t.z), z: t.z, ry: t.ry,
          door: { x: dn.x, y: dn.y, z: dn.z }, activities: { GUARD: 6, WORK: 6, SLEEP: 8, EAT: 8, WARM: 8 },
          indoor: true, settlement: B.S, org: 'bk.dalab'
        });
        notePlace(P);
      });
    }

    /* Register the full pedestrian + door graph now that every place door has been attached to the street network */
    SIM.nav.layer('pedestrian', { nodes: N.nodes, edges: N.edges, speed: { main: 1.1, sanctuary: 0.95, stair: 0.7 } });

    /* Seed ice-houses & Market stores with ice, salt and perishables so `77-sim-6-govern.js` ice-keeping runs live! */
    iceStores.forEach(function (id) {
      Object.assign(SIM.R.place[id].stock, { ice: 1200, meat: 320, dairy: 280, eggs: 180 });
    });
    Object.assign(SIM.R.place['bk.truce.hearth'].stock, { grain: 2400, potato: 1200, meat: 600, dairy: 500, eggs: 300, salt: 450, ice: 800, rope: 400 });

    if (SIM.needs) SIM.needs(B.NEEDS);
    B.doubleHallId = doubleHallId || 'bk.truce.hearth';

    /* Roles & Schedules across all quarters */
    var ROLES = [
      { id: 'market-trader', org: 'bk.town', n: 26, home: 'home', work: 'market', act: 'TRADE',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'TRADE'], [12, 'EAT'], [13, 'TRADE'], [17, 'SOCIALIZE'], [19, 'WARM'], [21, 'SLEEP']] },
      { id: 'ice-keeper', org: 'bk.town', n: 20, home: 'home', work: 'icehouse', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [11, 'DELIVER'], [13, 'EAT'], [14, 'WORK'], [18, 'WARM'], [21, 'SLEEP']] },
      { id: 'ropemaker', org: 'bk.town', n: 18, home: 'home', work: 'ropewalk', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'SOCIALIZE'], [20, 'WARM'], [22, 'SLEEP']] },
      { id: 'smith', org: 'bk.town', n: 12, home: 'home', work: 'smithy', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'WARM'], [20, 'SOCIALIZE'], [22, 'SLEEP']] },
      { id: 'felter', org: 'bk.town', n: 10, home: 'home', work: 'tannery', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [17, 'BUY'], [19, 'WARM'], [21, 'SLEEP']] },
      { id: 'herder', org: 'bk.town', n: 18, home: 'home', work: 'folds', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [10, 'RACE'], [12, 'EAT'], [13, 'WORK'], [18, 'WARM'], [21, 'SLEEP']] },
      { id: 'innkeeper', org: 'bk.town', n: 10, home: 'inn', work: 'inn', act: 'WORK',
        sched: [[0, 'SLEEP'], [6, 'WORK'], [12, 'EAT'], [13, 'WORK'], [20, 'WARM'], [23, 'SLEEP']] },
      { id: 'townsfolk', org: 'bk.town', n: 36, home: 'home', work: 'warehouse', act: 'WORK',
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'BUY'], [10, 'WORK'], [13, 'EAT'], [14, 'SOCIALIZE'], [17, 'PRAY'], [19, 'WARM'], [21, 'SLEEP']] },
      { id: 'child', org: 'bk.town', n: 16, home: 'home', work: 'fairstand', act: 'RACE', speed: 1.45,
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'RACE'], [11, 'SOCIALIZE'], [13, 'EAT'], [14, 'RACE'], [17, 'WARM'], [20, 'SLEEP']] },
      { id: 'elder', org: 'bk.town', n: 12, home: 'home', work: 'sanctuary', act: 'SOCIALIZE', speed: 0.92,
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'PRAY'], [10, 'SOCIALIZE'], [13, 'EAT'], [15, 'WARM'], [18, 'SOCIALIZE'], [20, 'SLEEP']] },
      { id: 'traveller', org: 'bk.travellers', n: 35, home: 'vardo_camp', work: 'fairstand', act: 'RACE',
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'TRADE'], [10, 'RACE'], [13, 'EAT'], [14, 'SOCIALIZE'], [18, 'WARM'], [22, 'SLEEP']] },
      { id: 'vardo-smith', org: 'bk.travellers', n: 14, home: 'vardo_camp', work: 'vardo_camp', act: 'WORK',
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'WORK'], [12, 'EAT'], [13, 'TRADE'], [17, 'WARM'], [20, 'SOCIALIZE'], [22, 'SLEEP']] },
      { id: 'kradz-factor', org: 'bk.kradz', n: 8, home: 'inn', work: 'icehouse', act: 'DELIVER',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'DELIVER'], [10, 'TRADE'], [13, 'EAT'], [14, 'DELIVER'], [18, 'WARM'], [21, 'SLEEP']] },
      { id: 'dalab-factor', org: 'bk.dalab', n: 14, home: 'dalab_home', work: 'dalab_work', act: 'TRADE',
        sched: [[0, 'SLEEP'], [6, 'PRAY'], [7, 'EAT'], [8, 'TRADE'], [12, 'EAT'], [13, 'WORK'], [17, 'TRADE'], [19, 'WARM'], [21, 'SLEEP']] },
      { id: 'dalab-guard', org: 'bk.dalab', n: 10, home: 'dalab_post', work: 'dalab_toll', act: 'GUARD',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'GUARD'], [13, 'EAT'], [14, 'GUARD'], [19, 'WARM'], [22, 'SLEEP']] },
      { id: 'tears-factor', org: 'bk.tears', n: 12, home: 'tears_home', work: 'tears_work', act: 'TRADE',
        sched: [[0, 'SLEEP'], [7, 'PRAY'], [8, 'EAT'], [9, 'TRADE'], [13, 'EAT'], [14, 'TRADE'], [18, 'SOCIALIZE'], [20, 'WARM'], [22, 'SLEEP']] },
      { id: 'tears-guard', org: 'bk.tears', n: 8, home: 'tears_post', work: 'tears_post', act: 'GUARD',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'GUARD'], [13, 'EAT'], [14, 'GUARD'], [19, 'WARM'], [22, 'SLEEP']] },
      { id: 'wildcat-trader', org: 'bk.wildcat', n: 10, home: 'vardo_camp', work: 'sanctuary', act: 'TRADE',
        sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'TRADE'], [11, 'RACE'], [13, 'EAT'], [14, 'TRADE'], [17, 'WARM'], [20, 'SLEEP']] },
      { id: 'stairman', org: 'bk.town', n: 12, home: 'stair_home', work: 'stair_hoist', act: 'HOIST',
        sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'HOIST'], [12, 'EAT'], [13, 'HOIST'], [18, 'WARM'], [21, 'SLEEP']] },
      { id: 'pack-sledge', org: 'bk.travellers', n: 10, home: 'vardo_camp', work: 'market', act: 'DELIVER', speed: 1.15, cls: 'sledge',
        sched: [[0, 'REST'], [6, 'DELIVER'], [10, 'TRADE'], [13, 'DELIVER'], [17, 'REST']] }
    ];

    var actorCount = 0;
    ROLES.forEach(function (R) {
      var homes = byKind[R.home] || byKind.home || ['bk.truce.hearth'];
      var works = byKind[R.work] || byKind.market || ['bk.truce.hearth'];
      SIM.role({
        id: R.id, org: R.org, speed: D0(R.speed, 1.25), sched: R.sched,
        needs: { labour: /^(WORK|HOIST|DELIVER)$/.test(R.act) ? 0.8 : 0.25 },
        prefers: {
          SLEEP: { pin: 'home' },
          EAT: { kinds: ['inn', 'vardo_camp', 'sanctuary', R.home] },
          WARM: { kinds: ['sanctuary', 'inn', 'vardo_camp', 'doublehall', R.home] },
          SOCIALIZE: { kinds: ['sanctuary', 'inn', 'fairstand', 'vardo_camp', 'doublehall'] },
          BUY: { kinds: ['market', 'sanctuary'] },
          TRADE: { kinds: ['market', 'sanctuary', R.work] },
          PRAY: { kinds: ['shrine', 'dalab_temple', 'tears_temple'] },
          RACE: { kinds: ['fairstand', 'folds'] },
          HOIST: { kinds: ['stair_hoist'] },
          DELIVER: { kinds: ['market', 'icehouse', 'warehouse', 'stair_hoist'] }
        }
      });
      for (var i = 0; i < R.n; i++) {
        var aid = 'bk.' + R.id + '.' + i;
        var hId = homes[(i * 7 + actorCount) % homes.length];
        var wId = works[(i * 5 + actorCount) % works.length];
        var dress = B.dressOf({ id: aid, role: R.id, org: R.org });
        var a = SIM.actor({
          id: aid, role: R.id, org: R.org, home: hId, work: wId,
          cls: R.cls || 'citizen', culture: dress.culture, kin: dress.kin
        });
        a.dress = dress;
        actorCount++;
      }
    });
    B.counts.actors = actorCount;

    /* Hourly & per-minute hooks:
       1. Cold 3,653 m night chill (`warmth` meter rises faster between 19:00 and 06:00);
       2. Market Truce Sanctuary enforcement inside the 16 `fg-truce-post` stones (suppresses Wildcat <-> Dalab/Tears hostility);
       3. Weekly Double Meeting in `fg-doublehall` (Fowlers' rope-wall side + Ice-cutters' tally-board side)! */
    SIM.stepHooks.push(function (minute) {
      var h = Math.floor((minute % 1440) / 60), m = minute % 60, day = Math.floor(minute / 1440);
      var all = SIM.all('actor');

      /* 1. Night chill at 3,653 m on the rim */
      if (m === 0 && (h >= 19 || h < 6) && SIM.NEED) {
        var wi = SIM.NEED.idx.warmth;
        if (wi != null) {
          all.forEach(function (a) {
            if (a.nd && a.activity !== 'SLEEP' && a.activity !== 'WARM') {
              a.nd[wi] = Math.min(100, a.nd[wi] + 2.2);
            }
          });
        }
      }

      /* 2. Market Truce Sanctuary enforcement every 10 minutes */
      if (m % 10 === 0) {
        var tNow = SIM.time ? SIM.time() : 0, inRing = { wildcat: 0, dalab: 0, tears: 0, fellgang: 0 };
        all.forEach(function (a) {
          var p = SIM.pose ? SIM.pose(a, tNow) : null;
          var x = p ? p.x : (SIM.R.place[a.home] ? SIM.R.place[a.home].x : 0);
          var z = p ? p.z : (SIM.R.place[a.home] ? SIM.R.place[a.home].z : 0);
          if (B.inTruce(x, z)) {
            a.inTruce = true;
            inRing[a.culture] = (inRing[a.culture] || 0) + 1;
            B.truceChecked++;
            if (a.hostile || a.combat) {
              a.hostile = false; a.combat = false;
              SIM.command(a, { act: 'MEET', place: 'bk.truce.hearth', mins: 20, by: 'The Peace Stone & Truce Bell' });
              B.truceEvents.push({ minute: minute, actor: a.id, culture: a.culture, why: 'weapon bound at the Truce Stones' });
            }
          } else {
            a.inTruce = false;
          }
        });
        B.counts.inTruce = inRing;
      }

      /* 3. Scheduled Double Meeting & Fair Moot */
      if (m === 0) {
        B.MEETINGS.forEach(function (M) {
          if (h !== M.hour || (day % M.every) !== M.day) return;
          var ropeSide = 0, tallySide = 0, called = 0;
          all.forEach(function (a) {
            if (a.org !== 'bk.town' && a.org !== 'bk.travellers') return;
            if (a.role === 'child' || a.cls === 'sledge') return;
            if (called >= 140) return;
            SIM.command(a, { act: 'MEET', place: B.doubleHallId, mins: M.hours * 60, by: M.name });
            if (a.kin === 'fowlers') ropeSide++; else tallySide++;
            called++;
          });
          B.doubleHall = { ropeSide: ropeSide, tallySide: tallySide, lastMinute: minute, id: M.id };
          B.meetings.push({ id: M.id, name: M.name, minute: minute, day: day, hour: h, called: called, ropeSide: ropeSide, tallySide: tallySide });
        });
      }
    });

    if (SIM.level) SIM.level(B.S, 'presented');
    SIM.jump();
    B.problems = B.problems.concat(SIM.check());
    return B;
  };

  /* Trigger a Double Meeting on demand (for verify / inspection) */
  B.callDoubleMeeting = function (mins) {
    var dur = D0(mins, 90), ropeSide = 0, tallySide = 0, called = 0;
    SIM.all('actor').forEach(function (a) {
      if ((a.org !== 'bk.town' && a.org !== 'bk.travellers') || a.role === 'child' || a.cls === 'sledge' || called >= 140) return;
      SIM.command(a, { act: 'MEET', place: B.doubleHallId, mins: dur, by: 'The Double Meeting' });
      if (a.kin === 'fowlers') ropeSide++; else tallySide++;
      called++;
    });
    B.doubleHall = { ropeSide: ropeSide, tallySide: tallySide, lastMinute: SIM.minute(), id: 'double-meeting' };
    return B.doubleHall;
  };

  return B;
})();
if (typeof module !== 'undefined') module.exports = BK_SIM;
