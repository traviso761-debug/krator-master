// ================================================================= JIMJAM — P4/P5: Regional Economy, Hinterlands & Foreign Trade Sim ([G data])
// Binds the Kingdom of Jimjam (JJ1-JJ4: Jimjam 50,000 urban + 8,500 slice handu, Tamarai-kuppam, Vellai-kal, JJ2 Barada-Quay
// & Periya-karai, JJ3 Mekam-turai & Uppu-metu, JJ4 Skywatch & Cempu-malai = 103,500 single-counted souls) plus Dilihan Province
// (Dilihan D1/D2 & Kotgeta/Visas D3/D4), Serai (Soda-Lake lbl=54 caravanserai & barge free-port), Silkhead (Korona/Outland
// gateway), Shell & Port Goto (Tentative Imperial Highway), Free Clans of Ardent (FC1-FC4), Palewharf (Eternal State &
// Republican portage on lbl=77), and Whitelake (5,400 m White-Pass Khaayken Yeti & Yonni/Rian corridor) into core/simulation:
//   - 14 active settlement economies, 22 canonical goods, 4 Jimjam industrial input-output chains (silica + alkali_salt -> glass,
//     clay_gypsum -> fine_ceramics, paper_cloth -> almanacs, bronze + glass -> instruments), and 4 street-routed SIM.cart haulers
//   - 10 multimodal barge & caravan SIM.trade corridors (including Crown handu tithes, beast-provisioned Cut/Ardent/Imperial/
//     White-Pass pack trains, Serai lbl=54 entrepot transshipment between Jimjam and Silkhead, and C5 Double-Dark barge holds)
//   - 91-day Kauntu calendar (-34.34 deg S, day-350 Solstice), Double-Dark observance, 6-stream pilgrimage & Great Pilgrim's Market
//   - 520 embodied citizens & visitors dressed from core/charactermodels/data/peoples.json + KSCHED barge/skiff/caravan timetables.
// Pure [G data]: zero THREE, zero DOM, zero Math.random; numeric defaults use x == null ? d : x.
var JJ_SIM = (function () {
  'use strict';

  function clearSim(S) {
    const kinds = Object.keys(S.R);
    for (let i = 0; i < kinds.length; i++) {
      const k = kinds[i];
      S.R[k] = {};
      S.order[k] = [];
    }
    S.problems = [];
    S.LOG = [];
    S.legsBy = {};
    /* Preserve module-load stepHooks registered by 77-sim-6-season.js and 77-sim-6p-pilgrims.js! */
    S._jjPulseTick = null;
    S.ECON = null;
    S.ECONS = null;
    S.ECON_ORDER = [];
    S.TRADE = null;
    S.STOCKS = null;
    S.NEED = null;
    S.UNREST = null;
    S.DECREES = null;
    S.PILGRIMS = null;
    S.ABSTRACT = null;
  }

  function findStruct(plan, id) {
    const list = plan.structures || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function pickFrom(arr, seed, salt) {
    if (!arr || !arr.length) return null;
    const h = KRAND.hash(745546, seed, salt);
    return arr[h % arr.length];
  }

  const ROLE_STYLE = {
    jj_kauntavan:      { people: 'jimjam',         robe: ['#d88a28', '#c4422a', '#e6d8b4'], hat: 'turban_gold',   prop: 'astrolabe' },
    jj_sibyl:          { people: 'jimjam',         robe: ['#9e1f32', '#b8283e', '#7c1828'], hat: 'sibyl_veil',    prop: 'censer' },
    jj_artisan:        { people: 'jimjam',         robe: ['#a8382c', '#367880', '#c8963c', '#7c4832'], hat: 'wrap', prop: 'tool' },
    jj_townsfolk:      { people: 'jimjam',         robe: ['#b64634', '#d4a03e', '#3c8882', '#dfd0ac', '#86302a'], hat: 'wrap', prop: 'none' },
    jj_guard:          { people: 'jimjam',         robe: ['#8c2220', '#6e1c1a'],            hat: 'helm_brass',    prop: 'spear' },
    jj_handu_farmer:   { people: 'jimjam',         robe: ['#c8b692', '#8c6b48', '#5e7448'], hat: 'straw',         prop: 'basket' },
    jj_mariner:        { people: 'jimjam',         robe: ['#2b6274', '#c88c38', '#dcd2bc'], hat: 'wrap',          prop: 'coil' },
    jj_carter:         { people: 'jimjam',         robe: ['#8a5e3c', '#745238'],            hat: 'wrap',          prop: 'pack' },
    cut_caravanner:    { people: 'izani',          robe: ['#d8742c', '#b65824', '#c8b28c'], hat: 'keffiyeh',      prop: 'pack' },
    ardent_trader:     { people: 'rustic_clansmen',robe: ['#486244', '#6e4e36', '#3c4e5c'], hat: 'wool_cap',      prop: 'pack' },
    serai_factor:      { people: 'xanadu',         robe: ['#c89838', '#486878', '#b85234'], hat: 'turban_white',  prop: 'pack' },
    silkhead_merchant: { people: 'xanadu',         robe: ['#6e2c58', '#c89e42', '#2c5c68'], hat: 'turban_gold',   prop: 'scroll' },
    republic_minder:   { people: 'iron_republic',  robe: ['#282e38', '#343c48'],            hat: 'tricorne',      prop: 'ledger' },
    order_chronicler:  { people: 'historians',     robe: ['#1d4c96', '#263a64'],            hat: 'hood_blue',     prop: 'scroll' },
    khaayken_envoy:    { people: 'khaayken',       robe: ['#eae4da', '#8a7258', '#606c78'], hat: 'fur_hood',      prop: 'pack', scale: 1.18 },
    yonni_scholar:     { people: 'yonni',          robe: ['#7a2c56', '#c89c42', '#366866'], hat: 'circlet',       prop: 'scroll' },
    rian_scholar:      { people: 'islanders',      robe: ['#6c2c38', '#485a72', '#c89e48'], hat: 'cap',           prop: 'scroll' },
    hykk_sailor:       { people: 'hykkousoi',      robe: ['#267882', '#ece4d2', '#cfa03c'], hat: 'band',          prop: 'coil' },
    eternian_pilgrim:  { people: 'eternian',       robe: ['#284d6e', '#d8e2ea'],            hat: 'court_cap',     prop: 'scroll' },
    eternian_minder:   { people: 'eternian',       robe: ['#1c2838', '#8c2832'],            hat: 'warden_cap',    prop: 'spear' },
    serai_pilgrim:     { people: 'jimjam',         robe: ['#d89c38', '#b84230', '#e4d6b4'], hat: 'turban_white',  prop: 'staff' }
  };

  function makeCharRecord(actorId, roleId, idx, peoplesMap) {
    const st = ROLE_STYLE[roleId] || ROLE_STYLE.jj_townsfolk;
    const pDef = (peoplesMap && peoplesMap[st.people]) ? peoplesMap[st.people] : null;
    const skins = (pDef && pDef.skin && pDef.skin.length) ? pDef.skin : ['#c0926b', '#a0744f', '#80583a', '#64432c'];
    const hairs = (pDef && pDef.hair && pDef.hair.length) ? pDef.hair : ['#0f0c0b', '#1a1511', '#271f18'];
    const eyes = (pDef && pDef.eyes && pDef.eyes.length) ? pDef.eyes : ['#2a1a10', '#3b2414'];
    const body = (KRAND.hash(745546, actorId, 11) % 2 === 0) ? 'mpfb_male' : 'mpfb_female';
    const skin = pickFrom(skins, actorId, 13);
    const hair = pickFrom(hairs, actorId, 17);
    const eye = pickFrom(eyes, actorId, 19);
    const robe = pickFrom(st.robe, actorId, 23);
    const anc = (pDef && pDef.ancestry) ? pDef.ancestry : { african: [0.2, 0.3], asian: [0.15, 0.25], caucasian: [0.45, 0.55] };
    const uA = KRAND.unit(KRAND.hash(745546, actorId, 29));
    const uB = KRAND.unit(KRAND.hash(745546, actorId, 31));
    const uC = KRAND.unit(KRAND.hash(745546, actorId, 37));
    const lerpR = function (pair, u) {
      if (!pair || pair.length < 2) return 0.33;
      return +(pair[0] + (pair[1] - pair[0]) * u).toFixed(3);
    };
    return {
      body: body,
      people: st.people,
      skin: skin,
      hair_color: hair,
      eye_color: eye,
      ancestry: {
        african: lerpR(anc.african, uA),
        asian: lerpR(anc.asian, uB),
        caucasian: lerpR(anc.caucasian, uC)
      },
      sliders: {
        height: +((KRAND.unit(KRAND.hash(745546, actorId, 41)) - 0.5) * 0.45).toFixed(3),
        weight: +((KRAND.unit(KRAND.hash(745546, actorId, 43)) - 0.5) * 0.40).toFixed(3),
        muscle: +((KRAND.unit(KRAND.hash(745546, actorId, 47)) - 0.4) * 0.40).toFixed(3)
      },
      armour: {
        torso: roleId === 'jj_sibyl' ? 'jimjam_m_sibyl_drape' : ('robe_' + st.people),
        head: roleId === 'jj_sibyl' ? 'jimjam_m_sibyl_veil' : st.hat,
        feet: 'xan_m_rich_slippers'
      },
      dye: { torso: robe, hair: hair },
      hatKind: st.hat,
      propKind: st.prop,
      scale: st.scale == null ? 1.0 : st.scale,
      seed: KRAND.hash(745546, actorId, idx)
    };
  }

  function buildPedestrianGraph(plan, groundFn) {
    const SNAP = 18.0;
    const nodes = [];
    const edges = [];
    const edgeSeen = {};

    function getOrAddNode(x, z, tag) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (Math.hypot(n.x - x, n.z - z) <= SNAP) return n.id;
      }
      const id = 'n' + nodes.length;
      const y = groundFn ? groundFn(x, z) : 0;
      nodes.push({ id: id, x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2), tag: tag || 'street' });
      return id;
    }

    function addEdge(a, b, kind, w) {
      if (a === b) return;
      const key = a < b ? (a + '|' + b) : (b + '|' + a);
      if (edgeSeen[key]) return;
      edgeSeen[key] = 1;
      const na = nodes[+a.slice(1)], nb = nodes[+b.slice(1)];
      if (!na || !nb) return;
      const len = Math.max(1.0, Math.hypot(nb.x - na.x, nb.y - na.y, nb.z - na.z));
      edges.push({ id: 'e' + edges.length, a: a, b: b, kind: kind || 'street', len: +len.toFixed(2), w: w == null ? 8.0 : w });
    }

    const ways = plan.ways || [];
    for (let wi = 0; wi < ways.length; wi++) {
      const w = ways[wi];
      const pts = w.pts || [];
      const ww = w.w == null ? 8.0 : w.w;
      let prev = null;
      for (let pi = 0; pi < pts.length; pi++) {
        const ax = pts[pi][0], az = pts[pi][1];
        if (pi > 0) {
          const bx = pts[pi - 1][0], bz = pts[pi - 1][1];
          const segL = Math.hypot(ax - bx, az - bz);
          const steps = Math.max(1, Math.ceil(segL / 110.0));
          for (let s = 1; s <= steps; s++) {
            const u = s / steps;
            const sx = bx + (ax - bx) * u, sz = bz + (az - bz) * u;
            const nid = getOrAddNode(sx, sz, w.cls || 'street');
            if (prev) addEdge(prev, nid, w.cls || 'street', ww);
            prev = nid;
          }
        } else {
          prev = getOrAddNode(ax, az, w.cls || 'street');
        }
      }
    }

    const parent = nodes.map(function (_, i) { return i; });
    function find(i) { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; }
    for (let ei = 0; ei < edges.length; ei++) {
      const ia = +edges[ei].a.slice(1), ib = +edges[ei].b.slice(1);
      const ra = find(ia), rb = find(ib);
      if (ra !== rb) parent[ra] = rb;
    }
    const hubIdx = 0;
    for (let pass = 0; pass < 16; pass++) {
      const root0 = find(hubIdx);
      let bridged = 0;
      for (let i = 0; i < nodes.length; i++) {
        if (find(i) === root0) continue;
        let bestJ = -1, bestD = 1e9;
        for (let j = 0; j < nodes.length; j++) {
          if (find(j) !== root0) continue;
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z);
          if (d < bestD) { bestD = d; bestJ = j; }
        }
        if (bestJ >= 0) {
          addEdge(nodes[i].id, nodes[bestJ].id, 'lane', 6.5);
          parent[find(i)] = root0;
          bridged++;
        }
      }
      if (!bridged) break;
    }

    return { nodes: nodes, edges: edges };
  }

  function buildSchedules(groundFn, lakeY) {
    if (typeof KSCHED === 'undefined' || !KSCHED) return { on: false, barges: [], skiffs: [], caravans: [], bell: null };
    const qy = lakeY == null ? -56.42 : lakeY;
    const h = function (x, z) { return groundFn ? groundFn(x, z) : 0; };

    const bargePhases = KSCHED.slots(3, 240, 60);
    const berths = [[-820, -1686], [-745, -1686], [-560, -1686]];
    const barges = [];
    for (let bi = 0; bi < 3; bi++) {
      const bx = berths[bi][0], bz = berths[bi][1];
      barges.push({
        id: 'sched_barge_' + bi,
        name: bi === 0 ? 'Vellai-kal Alabaster Lighter' : bi === 1 ? 'Barada-Quay Silica Barge' : 'Palewharf Treaty Packet',
        timeline: KSCHED.timeline({
          period: 240,
          phase: bargePhases[bi],
          segments: [
            { dur: 65, from: [bx - 160, qy, -2120], to: [bx - 40, qy, -1845], ease: 'inOut', name: 'lake_approach' },
            { dur: 35, from: [bx - 40, qy, -1845],  to: [bx, qy, bz],         ease: 'out',   name: 'mole_entry' },
            { dur: 45, from: [bx, qy, bz],                                     ease: 'linear',name: 'quay_unloading' },
            { dur: 35, from: [bx, qy, bz],          to: [bx + 35, qy, -1855], ease: 'in',    name: 'mole_depart' },
            { dur: 60, from: [bx + 35, qy, -1855],  to: [bx - 160, qy, -2120],ease: 'inOut', name: 'lake_outbound' }
          ]
        })
      });
    }

    const skiffPhases = KSCHED.slots(4, 120, 22);
    const skiffRoutes = [
      [[-707, qy, -1684], [-845, qy, -1812], [-707, qy, -1684]],
      [[-707, qy, -1684], [-502, qy, -1768], [-707, qy, -1684]],
      [[-610, qy + 0.06, -1678], [-610, qy + 0.14, -1594], [-610, qy + 0.06, -1678]],
      [[-660, qy, -1710], [-795, qy, -1735], [-660, qy, -1710]]
    ];
    const skiffs = [];
    for (let si = 0; si < 4; si++) {
      const r = skiffRoutes[si];
      skiffs.push({
        id: 'sched_skiff_' + si,
        name: si === 2 ? 'Monsoon Water-Portal Sluice Skiff' : 'Lotus Ferry Ghat Skiff #' + (si + 1),
        timeline: KSCHED.timeline({
          period: 120,
          phase: skiffPhases[si],
          segments: [
            { dur: 45, from: r[0], to: r[1], ease: 'inOut', name: 'outbound' },
            { dur: 15, from: r[1],           ease: 'linear',name: 'berth' },
            { dur: 45, from: r[1], to: r[2], ease: 'inOut', name: 'inbound' },
            { dur: 15, from: r[2],           ease: 'linear',name: 'ghat_wait' }
          ]
        })
      });
    }

    const caravans = [
      {
        id: 'sched_caravan_cut',
        name: 'Cut-Sill & Dilihan Marble Pack-Train',
        culture: 'izani',
        offsets: [[0, 0, 0], [-1.4, 3.6, 0], [1.4, 6.8, 0], [0, 10.2, 0]],
        timeline: KSCHED.timeline({
          period: 180,
          phase: 0,
          segments: [
            { dur: 65, from: [65, h(65, 1620), 1620], to: [65, h(65, 1065), 1065], ease: 'inOut', name: 'arrive_cut' },
            { dur: 25, from: [65, h(65, 1065), 1065],                              ease: 'linear',name: 'customs_weigh' },
            { dur: 65, from: [65, h(65, 1065), 1065], to: [65, h(65, 1620), 1620], ease: 'inOut', name: 'depart_cut' },
            { dur: 25, from: [65, h(65, 1620), 1620],                              ease: 'linear',name: 'sill_turn' }
          ]
        })
      },
      {
        id: 'sched_caravan_whitepass',
        name: 'White-Pass Khaayken Yeti & Yonni/Rian Caravan',
        culture: 'khaayken',
        offsets: [[0, 0, 0], [-1.6, 4.0, 0], [1.6, 7.8, 0], [0, 11.5, 0]],
        timeline: KSCHED.timeline({
          period: 200,
          phase: 70,
          segments: [
            { dur: 70, from: [545, h(545, -1820), -1820], to: [358, h(358, -1385), -1385], ease: 'inOut', name: 'descend_pass' },
            { dur: 30, from: [358, h(358, -1385), -1385],                                  ease: 'linear',name: 'fondouk_barter' },
            { dur: 70, from: [358, h(358, -1385), -1385], to: [545, h(545, -1820), -1820], ease: 'inOut', name: 'ascend_pass' },
            { dur: 30, from: [545, h(545, -1820), -1820],                                  ease: 'linear',name: 'ridge_camp' }
          ]
        })
      }
    ];

    const bell = KSCHED.eruption({ interval: 90, duration: 12, phase: 15, rise: 2, fade: 5, tail: 0.1, pre: 8, preAmp: 0.15, after: 12 });
    return { on: true, barges: barges, skiffs: skiffs, caravans: caravans, bell: bell };
  }

  /* Regional & Hinterland Settlement Table (15 settlements across JJ1-JJ4, Dilihan, Serai, Silkhead, Shell, Free Clans FC1-FC4, Palewharf & White-Pass) */
  const REGIONAL_TOWNS = [
    /* 1-6: Kingdom of Jimjam (JJ1-JJ4 = 103,500 single-counted souls) */
    { id: 'jimjam',            faction: 'jimjam',        name: 'Jimjam Capital (JJ1, 50k urban + 8.5k slice handu)', pop: 58500, wh: 'jj_harbour_wh', x: -670,  z: -1625 },
    { id: 'tamarai_kuppam',    faction: 'jimjam',        name: 'Tamarai-kuppam & SSW Handu Paddy/Brick (JJ1)',       pop: 19600, wh: 'tk_wh',         x: 80,    z: 1650 },
    { id: 'vellai_kal',        faction: 'jimjam',        name: 'Vellai-kal Gypsum & Alabaster Quarry (JJ1)',         pop: 900,   wh: 'vk_wh',         x: -1950, z: -1680 },
    { id: 'jj2_barada_periya', faction: 'jimjam',        name: 'Periya-karai & Barada-Quay Silica Shore (JJ2)',      pop: 12500, wh: 'jj2_wh',        x: -2250, z: -1580 },
    { id: 'jj3_mekam_uppu',    faction: 'jimjam',        name: 'Mekam-turai Terraces & Uppu-metu Salt (JJ3)',        pop: 7000,  wh: 'jj3_wh',        x: 1780,  z: -80 },
    { id: 'jj4_skywatch',      faction: 'jimjam',        name: 'Skywatch Observatory & Cempu-malai Skarn (JJ4)',     pop: 5000,  wh: 'jj4_wh',        x: 920,   z: -1780 },
    /* 7-8: Dilihan Province (D1-D4 = ~21,000 souls, Iziz-by-Letter; zero closed Port Visas sea trade) */
    { id: 'dilihan',           faction: 'izani_dilihan', name: 'Dilihan City, Wine Cellars & Salt-Lake Works (D1-D2)',pop: 17500, wh: 'dl_wh',         x: 75,    z: 1920 },
    { id: 'kotgeta_visas',     faction: 'izani_dilihan', name: 'Kotgeta Cut-Gate & Visas Coalfield (D3-D4)',         pop: 3500,  wh: 'kv_wh',         x: 68,    z: 1780 },
    /* 9-11: Soda-Lake lbl=54 & Tentative Shell -> Silkhead Imperial Highway Axis */
    { id: 'serai',             faction: 'matok_serai',   name: 'Serai Soda-Delta Caravanserai & Barge Port (lbl=54)',pop: 3500,  wh: 'sr_wh',         x: 1860,  z: -420 },
    { id: 'silkhead',          faction: 'korona_silk',   name: 'Silkhead Dry-Shore Korona & Silk Gateway (lbl=54)',  pop: 4500,  wh: 'sh_wh',         x: 2150,  z: -620 },
    { id: 'shell_goto',        faction: 'izani_shell',   name: 'Shell Arcology, Korona K10 & Port Goto Highway (S1-S3)', pop: 18500, wh: 'sg_wh',     x: 2240,  z: 480 },
    /* 12-13: Free Clans of Ardent (FC1-FC4 = 27,200 souls across 9 Clans, 4 Great Scotch Distilleries & R1-R4 spurs) */
    { id: 'ardent',            faction: 'free_clans',    name: 'Ardent Capital, Kopparberg & Klippeport Sill (FC1/FC3)', pop: 19200, wh: 'ar_wh',     x: 1920,  z: 220 },
    { id: 'fc_oster_jarnhold', faction: 'free_clans',    name: 'Osterbank Whiskey, Koppardal & Jarnhold Spur (FC2/FC4)', pop: 8000,  wh: 'fo_wh',     x: 2040,  z: -80 },
    /* 14-15: Foreign West-Lake & Trans-Pass Corridors */
    { id: 'palewharf',         faction: 'eternian',      name: 'Palewharf Eternian & Republican Portage (lbl=77)',   pop: 4200,  wh: 'pw_wh',         x: -2420, z: -1720 },
    { id: 'whitelake_pass',    faction: 'khaayken',      name: 'Whitelake 5,400m White-Pass & Veladiga Corridor',    pop: 3800,  wh: 'wp_wh',         x: 560,   z: -1860 }
  ];

  /* Daily steady-state extraction/harvest & consumption rates per settlement (scaled to 1 unit = ~100 kg / 1 barge = 45-65 units,
     applied cleanly across 4 six-hour ticks/day via SIM.produce & SIM.supply so SIM.ledger closes to 0.00 everywhere!) */
  const TOWN_FLOWS = {
    jimjam: {
      opening: {
        rice: 1800, cotton_cloth: 420, brick: 540, alabaster: 380, clay_gypsum: 260,
        silica: 180, alkali_salt: 190, glass: 220, fine_ceramics: 240, paper_cloth: 180,
        almanacs: 260, bronze: 140, instruments: 110, marble: 95, coal: 65,
        potash: 70, timber: 90, tea: 85, saltpeter: 110, spider_silk: 35,
        magnets: 25, qiviut: 35, goldroot: 25, ancient_salvage: 30, machine_parts: 25,
        mounts_wool: 55, scotch: 45, tartan: 30, spices: 40
      },
      /* Local inner-handu farms, cotton looms & urban craft output supplementing embodied workshops */
      makePerDay: { rice: 110, cotton_cloth: 44, brick: 36, clay_gypsum: 18 },
      /* Metropolitan daily consumption + masonry/palace/kiln/zenana/observatory draws */
      usePerDay: {
        rice: 145, marble: 22, bronze: 16, coal: 12, potash: 10, timber: 16,
        tea: 12, spider_silk: 9, magnets: 5, qiviut: 8, goldroot: 5,
        ancient_salvage: 6, machine_parts: 6, mounts_wool: 10, scotch: 8, tartan: 5, spices: 8,
        alkali_salt: 10, brick: 18, fine_ceramics: 8, glass: 6
      }
    },
    tamarai_kuppam: {
      opening: { rice: 960, clay_gypsum: 420, brick: 360, cotton_cloth: 60, glass: 30, alkali_salt: 40, almanacs: 25 },
      makePerDay: { rice: 92, clay_gypsum: 38, brick: 30 },
      usePerDay:  { rice: 26, cotton_cloth: 9, glass: 4, alkali_salt: 6, almanacs: 3 }
    },
    vellai_kal: {
      opening: { alabaster: 680, clay_gypsum: 320, rice: 160, cotton_cloth: 45, almanacs: 20, bronze: 20 },
      makePerDay: { alabaster: 68, clay_gypsum: 26 },
      usePerDay:  { rice: 14, cotton_cloth: 5, almanacs: 2, bronze: 3 }
    },
    jj2_barada_periya: {
      opening: { rice: 880, silica: 540, cotton_cloth: 320, alabaster: 45, fine_ceramics: 45, almanacs: 35, bronze: 30 },
      makePerDay: { rice: 76, silica: 42, cotton_cloth: 28 },
      usePerDay:  { rice: 24, alabaster: 7, fine_ceramics: 8, almanacs: 5, bronze: 5 }
    },
    jj3_mekam_uppu: {
      opening: { tea: 360, saltpeter: 420, alkali_salt: 380, rice: 320, cotton_cloth: 50, fine_ceramics: 40, almanacs: 30 },
      makePerDay: { tea: 28, saltpeter: 34, alkali_salt: 30, rice: 24 },
      usePerDay:  { rice: 18, cotton_cloth: 7, fine_ceramics: 6, almanacs: 4 }
    },
    jj4_skywatch: {
      opening: { bronze: 280, ancient_salvage: 180, qiviut: 90, rice: 140, glass: 35, instruments: 30, almanacs: 30 },
      makePerDay: { bronze: 22, ancient_salvage: 12, qiviut: 6 },
      usePerDay:  { rice: 16, glass: 6, instruments: 6, almanacs: 5 }
    },
    dilihan: {
      opening: { marble: 620, potash: 480, paper_cloth: 380, spices: 260, wine_butts: 340, rice: 520, alabaster: 55, almanacs: 45, fine_ceramics: 55, glass: 45, bronze: 50, scotch: 45 },
      makePerDay: { marble: 46, potash: 34, paper_cloth: 30, spices: 18, wine_butts: 26, rice: 32 },
      usePerDay:  { rice: 30, alabaster: 14, almanacs: 10, fine_ceramics: 12, glass: 9, bronze: 10, scotch: 8 }
    },
    kotgeta_visas: {
      opening: { coal: 560, marble: 280, timber: 310, potash: 140, paper_cloth: 140, spices: 110, wine_butts: 120, rice: 220, alabaster: 50, cotton_cloth: 40, almanacs: 40, fine_ceramics: 40, scotch: 35, bronze: 35, powder: 25 },
      makePerDay: { coal: 42, marble: 18, timber: 22, rice: 14 },
      usePerDay:  { rice: 16, alabaster: 5, cotton_cloth: 7, almanacs: 3, scotch: 5, powder: 3 }
    },
    serai: {
      /* Autonomous Soda-Delta Caravanserai & Barge Entrepot on Lake lbl=54: harvests alkali_salt & potash, receives Osterbank Gold Whiskey, transships Jimjam rice/alabaster <-> Silkhead silk/magnets */
      opening: { alkali_salt: 560, potash: 260, wine_butts: 160, rice: 360, alabaster: 120, saltpeter: 95, almanacs: 70, bronze: 65, spider_silk: 75, magnets: 55, fine_ceramics: 45, scotch: 45, timber: 50 },
      makePerDay: { alkali_salt: 44, potash: 18, wine_butts: 12 },
      usePerDay:  { rice: 10, fine_ceramics: 5, almanacs: 3, scotch: 7, timber: 8 }
    },
    silkhead: {
      /* Korona & Spider-Lake Gateway on dry shore (934,424): depends on Jimjam rice via Serai lbl=54 barges! */
      opening: { spider_silk: 520, magnets: 360, marble: 240, wine_butts: 180, rice: 180, alabaster: 45, saltpeter: 40, almanacs: 30, bronze: 35, glass: 30, scotch: 35 },
      makePerDay: { spider_silk: 36, magnets: 24, marble: 14, wine_butts: 12 },
      usePerDay:  { rice: 26, alabaster: 8, saltpeter: 7, almanacs: 5, bronze: 6, glass: 5, scotch: 5 }
    },
    shell_goto: {
      opening: { ancient_salvage: 420, spices: 360, rice: 460, spider_silk: 40, magnets: 30, bronze: 40, mounts_wool: 40, alabaster: 40, saltpeter: 40, powder: 30, scotch: 35 },
      makePerDay: { ancient_salvage: 26, spices: 24, rice: 30 },
      usePerDay:  { rice: 28, spider_silk: 8, magnets: 6, bronze: 8, mounts_wool: 8, alabaster: 7, saltpeter: 7, powder: 5, scotch: 5 }
    },
    ardent: {
      /* Free Clans FC1/FC3 (Ardent Walled Capital, Kopparberg Bronze & Klippeport Cut-Sill Scotch): reverberatory bronze, Stor-Branneriet & Hjart-Branneriet Hearth-Peat + Klippe-Branneriet Cut-Glen Scotch, clan tartan, timber, Visas-coal tempering & wine-butt finishing */
      opening: { bronze: 680, scotch: 480, tartan: 260, timber: 540, mounts_wool: 360, powder: 180, rice: 280, alkali_salt: 65, alabaster: 55, fine_ceramics: 55, glass: 45, almanacs: 40, cotton_cloth: 55, tea: 45, coal: 60, wine_butts: 65 },
      makePerDay: { bronze: 52, scotch: 36, tartan: 18, timber: 34, mounts_wool: 22, powder: 12, rice: 16 },
      usePerDay:  { rice: 28, alkali_salt: 10, alabaster: 9, fine_ceramics: 8, glass: 7, almanacs: 6, cotton_cloth: 9, tea: 6, coal: 8, wine_butts: 8 }
    },
    fc_oster_jarnhold: {
      /* Free Clans FC2/FC4 (Osterbank Caravan-Cask Gold Whiskey, Koppardal Copper/Timber, Jarnhold #3 Highland Mounts & Salpetervik Powder/MC-06 Spur S-A) */
      opening: { scotch: 360, mounts_wool: 380, saltpeter: 340, powder: 220, timber: 380, bronze: 240, spider_silk: 55, magnets: 40, rice: 200, alkali_salt: 50, wine_butts: 60, spices: 40, tea: 35 },
      makePerDay: { scotch: 24, mounts_wool: 24, saltpeter: 24, powder: 16, timber: 24, bronze: 14, rice: 10 },
      usePerDay:  { rice: 18, alkali_salt: 7, wine_butts: 7, spices: 5, tea: 5, spider_silk: 3 }
    },
    palewharf: {
      /* Eternal State & Iron Republic West-Shore Portage on Great Trough Lake (lbl=77) */
      opening: { marble: 460, timber: 440, paper_cloth: 360, machine_parts: 280, rice: 320, alabaster: 55, fine_ceramics: 50, glass: 45, cotton_cloth: 55, almanacs: 40, saltpeter: 45 },
      makePerDay: { marble: 28, timber: 28, paper_cloth: 24, machine_parts: 18, rice: 22 },
      usePerDay:  { rice: 20, alabaster: 12, fine_ceramics: 10, glass: 8, cotton_cloth: 10, almanacs: 6, saltpeter: 9 }
    },
    whitelake_pass: {
      /* Khaayken Yeti of Whitelake (5,400m White Pass) + Yonni/Rian & Veladiga salvage relay */
      opening: { qiviut: 420, goldroot: 300, ancient_salvage: 240, rice: 180, cotton_cloth: 45, tea: 40, glass: 35, bronze: 35 },
      makePerDay: { qiviut: 26, goldroot: 18, ancient_salvage: 14, rice: 10 },
      usePerDay:  { rice: 20, cotton_cloth: 8, tea: 7, glass: 5, bronze: 6 }
    }
  };

  function init(plan, groundFn, opts) {
    opts = opts || {};
    const S = (typeof SIM !== 'undefined' && SIM) ? SIM : null;
    const peoplesList = (typeof JJ_PEOPLES !== 'undefined' && JJ_PEOPLES && JJ_PEOPLES.peoples) ? JJ_PEOPLES.peoples : [];
    const peoplesMap = {};
    for (let pi = 0; pi < peoplesList.length; pi++) {
      if (peoplesList[pi] && peoplesList[pi].id) peoplesMap[peoplesList[pi].id] = peoplesList[pi];
    }

    const lakeY = (typeof JJ_GROUND !== 'undefined' && JJ_GROUND) ? JJ_GROUND.lakeY : -56.42;
    const sched = buildSchedules(groundFn, lakeY);

    if (!S || typeof S.init !== 'function') {
      return { available: false, sched: sched, actors: [] };
    }

    clearSim(S);

    let clockObj = opts.clock || { hour: 10.4, day: 10, t: 10 * 86400 + 10.4 * 3600 };
    S.init({
      seed: 745546,
      hour: function () { return clockObj.hour == null ? 10.4 : clockObj.hour; },
      day: function () { return clockObj.day == null ? 10 : clockObj.day; },
      t: function () {
        const d = clockObj.day == null ? 10 : clockObj.day;
        const hr = clockObj.hour == null ? 10.4 : clockObj.hour;
        return clockObj.t != null ? clockObj.t : (d * 86400 + hr * 3600);
      }
    });
    S.WAKE = true;
    S.LAG = 6;

    /* 1. Activities */
    const ACTS = [
      ['SLEEP', true], ['REST', true], ['EAT', false], ['WORK', false], ['CRAFT', false],
      ['STUDY', true], ['WORSHIP', false], ['VIGIL', false], ['TRIAL', true], ['BUY', false],
      ['GUARD', false], ['TRADE', false], ['DEPART', false]
    ];
    for (let ai = 0; ai < ACTS.length; ai++) {
      S.activity({ id: ACTS[ai][0], indoor: ACTS[ai][1] });
    }

    /* 2. Factions, 14 Regional/Foreign Settlements & Canonical Diplomatic Matrix */
    const FACS = [
      ['jimjam',        'Kingdom of Jimjam (Three Wheels)'],
      ['free_clans',    'Free Clans of Ardent (Nine Clans)'],
      ['izani_dilihan', 'Dilihan Province (Iziz-by-Letter)'],
      ['izani_shell',   'Shell Province & Port Goto (Iziz-by-Convoy)'],
      ['matok_serai',   'Serai Autonomous Soda-Delta Caravanserai'],
      ['korona_silk',   'Silkhead & Korona Gateway'],
      ['iron_republic', 'Iron Republic Astronomers Guild'],
      ['hykkousoi',     'Hykkousoi Maritime League'],
      ['eternian',      'The Eternal State (Palewharf)'],
      ['order',         'Order of Historians'],
      ['khaayken',      'Khaayken Yeti of Whitelake (White Pass)'],
      ['yonni_ria',     'Yonni & Rian Trans-Pass Scholars']
    ];
    for (let fi = 0; fi < FACS.length; fi++) S.faction({ id: FACS[fi][0], name: FACS[fi][1] });

    for (let ti = 0; ti < REGIONAL_TOWNS.length; ti++) {
      const rt = REGIONAL_TOWNS[ti];
      S.settlement({ id: rt.id, faction: rt.faction, name: rt.name });
    }

    const OPEN_PAIRS = [
      ['jimjam', 'free_clans'], ['jimjam', 'izani_dilihan'], ['jimjam', 'izani_shell'],
      ['jimjam', 'matok_serai'], ['jimjam', 'korona_silk'], ['jimjam', 'iron_republic'],
      ['jimjam', 'hykkousoi'], ['jimjam', 'eternian'], ['jimjam', 'order'],
      ['jimjam', 'khaayken'], ['jimjam', 'yonni_ria'],
      ['matok_serai', 'korona_silk'], ['matok_serai', 'free_clans'], ['matok_serai', 'izani_shell'],
      ['free_clans', 'korona_silk'], ['free_clans', 'izani_shell'], ['free_clans', 'izani_dilihan'],
      ['korona_silk', 'izani_shell']
    ];
    for (let rpi = 0; rpi < OPEN_PAIRS.length; rpi++) {
      const a = OPEN_PAIRS[rpi][0], b = OPEN_PAIRS[rpi][1];
      S.relation({ a: a, b: b, stance: 'friendly', trade: 'open' });
      S.relation({ a: b, b: a, stance: 'friendly', trade: 'open' });
    }
    /* Canonical LORE lock: zero peaceful Khaayken Yeti <-> Eternian trade! */
    S.relation({ a: 'khaayken', b: 'eternian', stance: 'hostile', trade: 'closed' });
    S.relation({ a: 'eternian', b: 'khaayken', stance: 'hostile', trade: 'closed' });

    S.presence({ faction: 'eternian',      settlement: 'jimjam', status: opts.eternianExpelled ? 'EXPELLED' : 'VISITING' });
    S.presence({ faction: 'iron_republic', settlement: 'jimjam', status: 'RESIDENT' });
    S.presence({ faction: 'khaayken',      settlement: 'jimjam', status: 'VISITING' });
    S.presence({ faction: 'izani_dilihan', settlement: 'jimjam', status: 'RESIDENT' });

    /* 3. Organizations */
    S.org({ id: 'jj_crown',         faction: 'jimjam' });
    S.org({ id: 'jj_kauntavan',     faction: 'jimjam' });
    S.org({ id: 'jj_citizens',      faction: 'jimjam' });
    S.org({ id: 'jj_kiln_guild',    faction: 'jimjam' });
    S.org({ id: 'jj_handu_villages',faction: 'jimjam' });
    S.org({ id: 'rep_legation',     faction: 'iron_republic' });
    S.org({ id: 'ord_chapter',      faction: 'order' });
    S.org({ id: 'wp_caravan',       faction: 'khaayken' });
    S.org({ id: 'wp_scholars',      faction: 'yonni_ria' });
    S.org({ id: 'cut_factors',      faction: 'izani_dilihan' });
    S.org({ id: 'ardent_drovers',   faction: 'free_clans' });
    S.org({ id: 'serai_factors',    faction: 'matok_serai' });
    S.org({ id: 'silkhead_guild',   faction: 'korona_silk' });
    S.org({ id: 'hykk_mariners',    faction: 'hykkousoi' });
    S.org({ id: 'et_cohorts',       faction: 'eternian' });

    /* 4. Connected Pedestrian Nav Layer + Frontier Ports */
    const navG = buildPedestrianGraph(plan, groundFn);
    S.nav.layer('pedestrian', navG);

    S.port({ id: 'port_lotus_cove',    x: -707, z: -1662, layer: 'pedestrian', kind: 'water' });
    S.port({ id: 'port_whitepass_n',   x: 380,  z: -1520, layer: 'pedestrian', kind: 'road' });
    S.port({ id: 'port_serai_ardent',  x: 1460, z: 120,   layer: 'pedestrian', kind: 'road' });
    S.port({ id: 'port_cut_dilihan',   x: 65,   z: 1120,  layer: 'pedestrian', kind: 'road' });

    /* 5. Places across Jimjam's 8 Celestial Districts + All 13 Partner Settlements */
    function placeAt(id, kind, fallbackX, fallbackZ, district, openSpan, acts, extra) {
      const st = findStruct(plan, id);
      const px = st ? st.x : fallbackX;
      const pz = st ? st.z : fallbackZ;
      const py = st ? st.y : (groundFn ? groundFn(px, pz) : 0);
      const rec = Object.assign({
        id: id,
        name: (st && st.name) ? st.name : id,
        kind: kind,
        x: px,
        y: py,
        z: pz,
        settlement: 'jimjam',
        district: district,
        activities: acts
      }, extra || {});
      if (openSpan) rec.open = openSpan;
      S.place(rec);
      return rec;
    }

    placeAt('lm.temple_sun',         'jj_temple_sun',          -760, -100,  'sun',       [5, 22], { WORSHIP: 120, VIGIL: 120, STUDY: 24 });
    placeAt('lm.palace',             'jj_palace',               0,    40,   'sun',       [6, 22], { WORK: 45, STUDY: 20, GUARD: 30, SLEEP: 24 });
    placeAt('lm.palace_plaza',       'jj_palace_plaza',         0,   -45,   'sun',       [5, 23], { WORSHIP: 80, VIGIL: 90, GUARD: 24 });
    placeAt('lm.rajas_eye',          'jj_observatory',         -815, -210,  'sun',       [0, 24], { STUDY: 24, WORK: 12, VIGIL: 24 });
    placeAt('lm.school_eye',         'jj_school',              -650, -160,  'sun',       [6, 21], { STUDY: 36, WORK: 16, SLEEP: 18 });
    placeAt('lm.school_hand',        'jj_school',              -650,  -40,  'sun',       [6, 21], { STUDY: 32, WORK: 14 });
    placeAt('lm.republic_legation',  'jj_legation',            -152,  -48,  'sun',       [0, 24], { WORK: 12, STUDY: 12, SLEEP: 8 });
    placeAt('lm.court_sun',          'jj_court',               -148,   52,  'week',      [8, 17], { TRIAL: 24, WORK: 12 });
    placeAt('lm.court_week',         'jj_court',               -630,  445,  'week',      [8, 17], { TRIAL: 24, WORK: 12 });
    placeAt('lm.temple_companion',   'jj_temple_companion',    -310, -760,  'companion', [5, 22], { WORSHIP: 60, VIGIL: 60 });
    placeAt('lm.hostel_eternian',    'jj_hostel_eternian',     -420, -820,  'companion', [0, 24], { SLEEP: 36, EAT: 24, REST: 24 });
    placeAt('lm.giant_ghat',         'jj_giant_ghat',          -540, -1625, 'giant',     [4, 23], { WORSHIP: 90, VIGIL: 90 });
    placeAt('lm.temple_twoday',      'jj_temple_twoday',       -860, -720,  'twoday',    [0, 24], { WORSHIP: 50, VIGIL: 60, STUDY: 16 });
    placeAt('lm.temple_week',        'jj_temple_week',         -760,  430,  'week',      [6, 21], { WORSHIP: 65, VIGIL: 65 });
    placeAt('lm.temple_thirteen',    'jj_temple_thirteen',      160,  585,  'thirteen',  [5, 23], { WORSHIP: 95, VIGIL: 110 });
    placeAt('lm.order_chapterhouse', 'jj_chapterhouse_order',    45,  540,  'thirteen',  [0, 24], { STUDY: 30, WORSHIP: 24, SLEEP: 20, EAT: 20 });
    placeAt('lm.temple_fourday',     'jj_temple_fourday',       680, -560,  'fourday',   [6, 21], { WORSHIP: 65, REST: 30 });
    placeAt('lm.temple_day',         'jj_temple_day',          1050,  110,  'day',       [5, 21], { WORSHIP: 65, WORK: 16 });
    placeAt('lm.izani_gov_ruin',     'jj_izani_ruin',           860,  740,  'izani',     [6, 20], { WORK: 20, STUDY: 14, TRADE: 18 });
    placeAt('lm.shrine_wanderer',    'jj_shrine_wanderer',      940,  785,  'izani',     [0, 24], { WORSHIP: 24, VIGIL: 30 });
    placeAt('lm.whitepass_compound', 'jj_whitepass_compound',   340, -1370, 'companion', [0, 24], { TRADE: 40, BUY: 30, SLEEP: 36, EAT: 30 });
    placeAt('lm.caravanserai_cut',   'jj_caravanserai',         145, 1055,  'thirteen',  [0, 24], { TRADE: 45, BUY: 35, SLEEP: 45, EAT: 36 });
    placeAt('lm.fortress_crest',     'jj_fortress',            1140,  860,  'izani',     [0, 24], { GUARD: 40, SLEEP: 36, EAT: 30 });
    placeAt('lm.amphitheater',       'jj_amphitheater',        -210,  810,  'thirteen',  [7, 22], { REST: 80, WORSHIP: 60 });

    /* Jimjam Warehouses, Markets, Industrial Recipe Workshops & Camps */
    S.place({ id: 'jj_harbour_wh',     name: 'Lotus Harbour Customs Warehouse',         kind: 'warehouse',       x: -670, y: groundFn ? groundFn(-670, -1625) : -54, z: -1625, settlement: 'jimjam', district: 'giant',    open: [5, 21], activities: { WORK: 36, TRADE: 36, BUY: 36, EAT: 24 } });
    S.place({ id: 'jj_serai_gate_wh',  name: 'East Serai-Ardent Gate Bonded Depot',     kind: 'warehouse',       x: 1310, y: groundFn ? groundFn(1310, 145) : 20,   z: 145,   settlement: 'jimjam', district: 'day',      open: [5, 21], activities: { WORK: 24, TRADE: 28, BUY: 24 } });
    S.place({ id: 'jj_handu_granary',  name: 'Handu Canal Estate Granary',              kind: 'warehouse',       x: 1620, y: groundFn ? groundFn(1620, -320) : 12,  z: -320,  settlement: 'jimjam', district: 'day',      open: [5, 20], activities: { WORK: 48, EAT: 30 } });
    S.place({ id: 'jj_strand_bazaar',  name: 'Lotus Strand Bazaar',                     kind: 'jj_market',       x: -755, y: groundFn ? groundFn(-755, -1618) : -54, z: -1618, settlement: 'jimjam', district: 'giant',    open: [6, 21], activities: { BUY: 55, TRADE: 35, EAT: 40 } });
    S.place({ id: 'jj_day_kilns',      name: 'Day-Ward 1.51-atm Brick & Ceramic Kilns', kind: 'jj_kiln',         x: 1090, y: groundFn ? groundFn(1090, 210) : 18,   z: 210,   settlement: 'jimjam', district: 'day',      open: [6, 18], activities: { WORK: 36, CRAFT: 36 } });
    S.place({ id: 'jj_glassworks',     name: 'Barada-Silica & Serai-Alkali Glassworks', kind: 'jj_glassworks',   x: 1140, y: groundFn ? groundFn(1140, 290) : 22,   z: 290,   settlement: 'jimjam', district: 'day',      open: [6, 18], activities: { WORK: 24, CRAFT: 24 } });
    S.place({ id: 'jj_fourday_vats',   name: 'Four-Day Indigo & Saffron Dye-Vats',      kind: 'jj_dyer',         x: 745,  y: groundFn ? groundFn(745, -490) : -2,   z: -490,  settlement: 'jimjam', district: 'fourday',  open: [6, 19], activities: { WORK: 28, CRAFT: 28 } });
    S.place({ id: 'jj_almanac_press',  name: 'Royal Almanac Block-Press',               kind: 'jj_press',        x: 115,  y: groundFn ? groundFn(115, 495) : 14,    z: 495,   settlement: 'jimjam', district: 'thirteen', open: [6, 19], activities: { WORK: 24, CRAFT: 24, BUY: 20 } });
    S.place({ id: 'jj_brass_works',    name: 'Kauntavan Brass Astrolabe & Optics Guild',kind: 'jj_instrument',   x: -185, y: groundFn ? groundFn(-185, -120) : 12,  z: -120,  settlement: 'jimjam', district: 'sun',      open: [6, 19], activities: { WORK: 20, CRAFT: 20 } });
    S.place({ id: 'jj_dharmashala_13', name: 'Thirteen Pilgrim Dharmashala',            kind: 'jj_dharmashala',  x: -95,  y: groundFn ? groundFn(-95, 920) : 34,    z: 920,   settlement: 'jimjam', district: 'thirteen', activities: { SLEEP: 48, EAT: 40, REST: 40 } });
    S.place({ id: 'jj_pilgrim_bazaar', name: 'The Great Pilgrims Market',               kind: 'jj_pilgrim_market', x: -160, y: groundFn ? groundFn(-160, 1060) : 40,z: 1060,  settlement: 'jimjam', district: 'thirteen', closed: true, activities: { BUY: 90, TRADE: 60, EAT: 50 } });
    S.place({ id: 'jj_camp_cut',       name: 'Cut-Gate Pilgrim Tent Maidan',            kind: 'jj_camp',         x: -615, y: groundFn ? groundFn(-615, 1120) : 38,  z: 1120,  settlement: 'jimjam', closed: true, transient: true, activities: { SLEEP: 120, REST: 80 } });
    S.place({ id: 'jj_camp_serai',     name: 'Serai-Gate Pilgrim Tent Maidan',          kind: 'jj_camp',         x: 1515, y: groundFn ? groundFn(1515, 165) : 22,   z: 165,   settlement: 'jimjam', closed: true, transient: true, activities: { SLEEP: 120, REST: 80 } });

    const HOMES = [
      ['jj_home_sun_rich',  -420, -140, 'sun',       70],
      ['jj_home_comp_mid',  -240, -640, 'companion', 80],
      ['jj_home_giant_mid', -680, -1420,'giant',     80],
      ['jj_home_twoday',    -740, -580, 'twoday',    65],
      ['jj_home_week_mid',  -560,  340, 'week',      75],
      ['jj_home_13_mid',      90,  690, 'thirteen',  85],
      ['jj_home_4day_mid',   580, -440, 'fourday',   75],
      ['jj_home_day_poor',   960,  260, 'day',       95],
      ['jj_home_izani_dil',  820,  680, 'izani',     65],
      ['jj_home_handu',     1560, -260, 'day',       75]
    ];
    for (let hi = 0; hi < HOMES.length; hi++) {
      const h = HOMES[hi];
      S.place({
        id: h[0], name: 'Ward Residences (' + h[3] + ')', kind: 'jj_house',
        x: h[1], y: groundFn ? groundFn(h[1], h[2]) : 0, z: h[2],
        settlement: 'jimjam', district: h[3],
        activities: { SLEEP: h[4], REST: h[4], EAT: h[4] }
      });
    }

    /* Partner Settlement Warehouses (13 hinterland, provincial & foreign trade hubs) */
    for (let ti = 1; ti < REGIONAL_TOWNS.length; ti++) {
      const rt = REGIONAL_TOWNS[ti];
      S.place({
        id: rt.wh,
        name: rt.name + ' Depot',
        kind: 'warehouse',
        x: rt.x,
        y: groundFn ? groundFn(rt.x, rt.z) : 0,
        z: rt.z,
        settlement: rt.id,
        activities: { WORK: 24, TRADE: 24 }
      });
    }

    /* 6. Multi-Settlement Economies, 31 Goods & Jimjam Input-Output Craft Chains */
    const GOODS = {
      rice: {}, cotton_cloth: {}, brick: {}, alabaster: {}, clay_gypsum: {},
      silica: {}, alkali_salt: {}, glass: {}, fine_ceramics: {}, paper_cloth: {},
      almanacs: {}, bronze: {}, instruments: {}, marble: {}, coal: {},
      potash: {}, timber: {}, tea: {}, saltpeter: {}, spider_silk: {},
      magnets: {}, qiviut: {}, goldroot: {}, ancient_salvage: {}, machine_parts: {},
      mounts_wool: {}, scotch: {}, tartan: {}, wine_butts: {}, powder: {},
      spices: {}, reagents: {}
    };

    const JJ_INPUTS = {
      glass:         { silica: 1, alkali_salt: 1 },
      fine_ceramics: { clay_gypsum: 1 },
      almanacs:      { paper_cloth: 1 },
      instruments:   { bronze: 1, glass: 1 }
    };

    for (let ti = 0; ti < REGIONAL_TOWNS.length; ti++) {
      const rt = REGIONAL_TOWNS[ti];
      S.economy({
        goods: GOODS,
        inputs: rt.id === 'jimjam' ? JJ_INPUTS : {},
        every: 60,
        window: 3,
        useShort: true,
        cart: { cap: 60, load: 15, unload: 15, minLoad: 8, urgent: 4 },
        imports: { days: 4, scan: 60 },
        exports: { minDays: 2, made: false },
        meal: { per: 1, foods: ['rice'] }
      }, { settlement: rt.id });
    }

    /* Register Warehouses & Jimjam Industrial Sites */
    S.store('jj_harbour_wh',          { kind: 'warehouse' });
    S.store('jj_serai_gate_wh',       { kind: 'warehouse' });
    S.store('jj_handu_granary',       { kind: 'warehouse' });
    S.store('jj_pilgrim_bazaar',      { kind: 'warehouse' });
    S.store('lm.caravanserai_cut',    { kind: 'warehouse' });
    S.store('lm.whitepass_compound',  { kind: 'warehouse' });
    S.store('jj_strand_bazaar',       { kind: 'warehouse' });
    for (let ti = 1; ti < REGIONAL_TOWNS.length; ti++) {
      S.store(REGIONAL_TOWNS[ti].wh, { kind: 'warehouse' });
    }

    /* Seed Opening Inventories Across All 14 Settlements */
    for (let ti = 0; ti < REGIONAL_TOWNS.length; ti++) {
      const rt = REGIONAL_TOWNS[ti];
      const spec = TOWN_FLOWS[rt.id];
      if (!spec || !spec.opening) continue;
      S.withEcon(rt.id, function () {
        const gks = Object.keys(spec.opening);
        for (let gi = 0; gi < gks.length; gi++) {
          const g = gks[gi];
          const qty = spec.opening[g];
          let targetWh = rt.wh;
          if (rt.id === 'jimjam') {
            if (g === 'marble' || g === 'coal' || g === 'potash' || g === 'spices') targetWh = 'lm.caravanserai_cut';
            else if (g === 'qiviut' || g === 'goldroot') targetWh = 'lm.whitepass_compound';
            else if (g === 'bronze' || g === 'alkali_salt' || g === 'spider_silk' || g === 'magnets') targetWh = 'jj_serai_gate_wh';
            else if (g === 'rice') targetWh = 'jj_handu_granary';
          }
          S.produce(targetWh, g, qty);
        }
      });
    }

    /* Active Jimjam Industrial Recipes (halted automatically on Double Dark via SIM.observance holdRecipes!) */
    S.withEcon('jimjam', function () {
      S.recipe('jj_day_kilns',     { out: ['brick', 'fine_ceramics'], rate: 2.5, cap: 240 });
      S.recipe('jj_glassworks',    { out: ['glass'],                  rate: 2.2, cap: 180 });
      S.recipe('jj_fourday_vats',  { out: ['cotton_cloth'],           rate: 2.2, cap: 200 });
      S.recipe('jj_almanac_press', { out: ['almanacs'],               rate: 2.0, cap: 180 });
      S.recipe('jj_brass_works',   { out: ['instruments'],            rate: 1.6, cap: 140 });
    });

    /* Continuous 6-hour Regional Harvest/Extraction & Consumption Pulse Across All 15 Settlements (100% ledger-closed!) */
    const pulseCarry = {};
    let lastPulseBucket = Math.floor(S.minute() / 360);
    S._jjPulseTick = function (minute) {
      const bucket = Math.floor(minute / 360); /* every 6 hours = 4 pulses/day */
      if (bucket <= lastPulseBucket) return;
      const nBuckets = Math.min(8, bucket - lastPulseBucket);
      lastPulseBucket = bucket;

      /* Respect Double-Dark industrial/harvest pause inside Kingdom of Jimjam */
      const seasonNow = S.CAL ? S.season(minute) : null;
      const inDoubleDark = !!(seasonNow && seasonNow.windows && seasonNow.windows['double-dark']);

      for (let bStep = 0; bStep < nBuckets; bStep++) {
        for (let ti = 0; ti < REGIONAL_TOWNS.length; ti++) {
          const rt = REGIONAL_TOWNS[ti];
          const spec = TOWN_FLOWS[rt.id];
          if (!spec) continue;
          const isJjKingdom = rt.faction === 'jimjam';
          S.withEcon(rt.id, function () {
            if (!inDoubleDark || !isJjKingdom) {
              const mks = Object.keys(spec.makePerDay || {});
              for (let mi = 0; mi < mks.length; mi++) {
                const g = mks[mi];
                const ck = rt.id + ':m:' + g;
                const val = (pulseCarry[ck] || 0) + spec.makePerDay[g] * 0.25;
                const whole = Math.floor(val);
                pulseCarry[ck] = val - whole;
                if (whole > 0) {
                  const whId = (rt.id === 'jimjam' && g === 'rice') ? 'jj_handu_granary' : rt.wh;
                  S.produce(whId, g, whole);
                }
              }
            }
            const uks = Object.keys(spec.usePerDay || {});
            for (let ui = 0; ui < uks.length; ui++) {
              const g = uks[ui];
              const ck = rt.id + ':u:' + g;
              const val = (pulseCarry[ck] || 0) + spec.usePerDay[g] * 0.25;
              const whole = Math.floor(val);
              pulseCarry[ck] = val - whole;
              if (whole > 0) S.supply(g, whole, false);
            }
          });
        }
      }
    };
    if (!S._jjPulseHooked) {
      S._jjPulseHooked = true;
      S.stepHooks = S.stepHooks || [];
      S.stepHooks.push(function (minute, t) {
        if (S._jjPulseTick) S._jjPulseTick(minute, t);
      });
    }

    /* Items & Money */
    S.items({
      kinds: {
        rice:               { food: true, good: 'rice', per: 1 },
        royal_almanac:      { cat: 'book',     good: 'almanacs' },
        carved_alabaster:   { cat: 'craft',    good: 'alabaster' },
        tethyan_bio_vial:   { cat: 'reagent' },
        dalab_pressure_gel: { cat: 'reagent' },
        yuni_vault_cell:    { cat: 'tech' },
        dam_servo_relic:    { cat: 'artifact' },
        tete_codex:         { cat: 'artifact' },
        khaayken_goldroot:  { cat: 'reagent' }
      },
      free: ['VIGIL', 'WORSHIP', 'STUDY']
    });
    S.shop('jj_strand_bazaar', ['rice']);
    S.shop('jj_harbour_wh',    ['rice']);

    S.money({ currencies: { talent: { name: 'Raja Solar Talent', talent: 1 } } });
    S.account({ id: 'treasury:jimjam',       owner: 'jimjam',         kind: 'treasury', currency: 'talent', settlement: 'jimjam' });
    S.account({ id: 'treasury:vellai_kal',   owner: 'vellai_kal',     kind: 'treasury', currency: 'talent', settlement: 'vellai_kal' });
    S.account({ id: 'treasury:dilihan',      owner: 'izani_dilihan',  kind: 'treasury', currency: 'talent', settlement: 'dilihan' });
    S.account({ id: 'treasury:serai',        owner: 'matok_serai',    kind: 'treasury', currency: 'talent', settlement: 'serai' });
    S.account({ id: 'treasury:silkhead',     owner: 'korona_silk',    kind: 'treasury', currency: 'talent', settlement: 'silkhead' });
    S.account({ id: 'org:kauntavan',         owner: 'jj_kauntavan',   kind: 'guild',    currency: 'talent', settlement: 'jimjam' });
    S.account({ id: 'org:order_chapter',     owner: 'ord_chapter',    kind: 'guild',    currency: 'talent', settlement: 'jimjam' });
    S.account({ id: 'org:whitepass_factors', owner: 'wp_caravan',     kind: 'guild',    currency: 'talent', settlement: 'jimjam' });
    S.account({ id: 'player:expedition',     owner: 'player',         kind: 'player',   currency: 'talent', settlement: 'jimjam' });
    S.mint('treasury:jimjam',       12500, 'opening');
    S.mint('treasury:vellai_kal',    2400, 'opening');
    S.mint('treasury:dilihan',       6000, 'opening');
    S.mint('treasury:serai',         4200, 'opening');
    S.mint('treasury:silkhead',      4800, 'opening');
    S.mint('org:kauntavan',          3200, 'opening');
    S.mint('org:order_chapter',      1100, 'opening');
    S.mint('org:whitepass_factors',  1600, 'opening');
    S.mint('player:expedition',      1000, 'opening');

    /* 7. Calendar (-34.34 deg S, 91-day Kauntu Double Dark) & Observances */
    S.calendar({
      year: { yearD: 365, startDay: 259, solsticeDay: 350 },
      latitude: -34.34,
      windows: { 'day-outside': [364, 365], 'solstice-festival': [348, 352] },
      cycles: {
        'double-dark':       { periodD: 91,   phase0: 0,   spanD: 1 },
        'double-dark-flood': { periodD: 91,   phase0: 89,  spanD: 4 },
        'day-transit':       { periodM: 1440, phase0: 600, spanM: 120 },
        'twoday-occult':     { periodM: 2880, phase0: 360, spanM: 240 }
      }
    });

    /* 8. All 10 Canonical Hinterland, Provincial, Soda-Lake, Cut & Foreign SIM.trade Corridors */

    /* R1: JJ1 Tamarai-kuppam & SSW Handu Paddy/Brick Canal (Crown 25% rice/clay tithe + return manufactures; held on Double Dark) */
    S.trade({
      id: 'r01_jj1_tamarai_canal',
      stops: [{ settlement: 'tamarai_kuppam', place: 'tk_wh' }, { settlement: 'jimjam', place: 'jj_handu_granary' }],
      cap: 65, carriers: 2, stagger: 120, offset: 10, minutes: 150, mins: 60,
      share: { tamarai_kuppam: { rice: 0.35, clay_gypsum: 0.45, brick: 0.30 } },
      goods: {
        tamarai_kuppam: ['rice', 'clay_gypsum', 'brick'],
        jimjam: ['cotton_cloth', 'glass', 'alkali_salt', 'almanacs']
      },
      expect: {
        tamarai_kuppam: { cotton_cloth: 10, glass: 5, alkali_salt: 7, almanacs: 4 }
      },
      closed: [{ legs: [0, 1], window: 'double-dark' }]
    });

    /* R2: JJ1 Vellai-kal Lake-Shore Quarry Lighters (Jimjam's #1 export alabaster + gypsum; held on Double Dark) */
    S.trade({
      id: 'r02_jj1_vellai_barge',
      stops: [{ settlement: 'vellai_kal', place: 'vk_wh' }, { settlement: 'jimjam', place: 'jj_harbour_wh' }],
      cap: 60, carriers: 2, stagger: 150, offset: 25, minutes: 180, mins: 60,
      keep: 1, want: 10,
      goods: {
        vellai_kal: ['alabaster', 'clay_gypsum'],
        jimjam: ['rice', 'cotton_cloth', 'almanacs', 'bronze']
      },
      expect: {
        jimjam:     { alabaster: 55, clay_gypsum: 26 },
        vellai_kal: { rice: 15, cotton_cloth: 6, almanacs: 3, bronze: 3 }
      },
      closed: [{ legs: [0, 1], window: 'double-dark' }]
    });

    /* R3: JJ2 Floodzone Drawdown Granary & Barada-Quay Silica Sand Barges across Great Trough Lake (lbl=77) */
    S.trade({
      id: 'r03_jj2_barada_granary_barge',
      stops: [{ settlement: 'jj2_barada_periya', place: 'jj2_wh' }, { settlement: 'jimjam', place: 'jj_harbour_wh' }],
      cap: 70, carriers: 2, stagger: 180, offset: 40, minutes: 240, mins: 75,
      keep: 2, want: 9,
      goods: {
        jj2_barada_periya: ['silica', 'rice', 'cotton_cloth'],
        jimjam: ['alabaster', 'fine_ceramics', 'almanacs', 'bronze']
      },
      expect: {
        jimjam:            { silica: 36, rice: 145, cotton_cloth: 30 },
        jj2_barada_periya: { alabaster: 8, fine_ceramics: 9, almanacs: 6, bronze: 5 }
      },
      closed: [{ legs: [0, 1], window: 'double-dark' }]
    });

    /* R4: JJ3 Mekam-aru Tea/Saltpeter & JJ4 Skywatch Observatory / Cempu-malai Skarn Crown Road */
    S.trade({
      id: 'r04_jj3_jj4_crown_road',
      stops: [
        { settlement: 'jj3_mekam_uppu', place: 'jj3_wh' },
        { settlement: 'jimjam',         place: 'jj_serai_gate_wh' },
        { settlement: 'jj4_skywatch',   place: 'jj4_wh' },
        { settlement: 'jimjam',         place: 'jj_serai_gate_wh' }
      ],
      cap: 50, carriers: 2, stagger: 180, offset: 55, legs: [180, 210, 210, 180], mins: 60,
      keep: 2, want: 9,
      provision: { beasts: 8, eat: { rice: 0.25 }, home: 1, maxDays: 2 },
      goods: {
        jj3_mekam_uppu: ['tea', 'saltpeter', 'alkali_salt'],
        jimjam:         ['rice', 'cotton_cloth', 'fine_ceramics', 'glass', 'instruments', 'almanacs'],
        jj4_skywatch:   ['bronze', 'ancient_salvage', 'qiviut']
      },
      expect: {
        jimjam:         { tea: 22, saltpeter: 28, alkali_salt: 28, bronze: 22, ancient_salvage: 10 },
        jj3_mekam_uppu: { cotton_cloth: 8, fine_ceramics: 7, almanacs: 5 },
        jj4_skywatch:   { rice: 18, glass: 7, instruments: 7, almanacs: 6 }
      }
    });

    /* R5: The Cut Trunk & Klippeport Sill Pass (Dilihan D1/D2 <-> Kotgeta & Visas Coal D3/D4 <-> Jimjam Cut-Gate + Klippeport/Ardent Sill) */
    S.trade({
      id: 'r05_cut_dilihan_trunk',
      stops: [
        { settlement: 'dilihan',       place: 'dl_wh' },
        { settlement: 'kotgeta_visas', place: 'kv_wh' },
        { settlement: 'jimjam',        place: 'lm.caravanserai_cut' },
        { settlement: 'kotgeta_visas', place: 'kv_wh' },
        { settlement: 'ardent',        place: 'ar_wh' },
        { settlement: 'kotgeta_visas', place: 'kv_wh' }
      ],
      cap: 65, carriers: 3, stagger: 160, offset: 70, legs: [150, 170, 170, 150, 150, 150], mins: 65,
      keep: 1, want: 9,
      provision: { beasts: 10, eat: { rice: 0.25 }, home: 0, maxDays: 2 },
      goods: {
        dilihan:       ['marble', 'potash', 'paper_cloth', 'spices', 'wine_butts'],
        kotgeta_visas: ['coal', 'marble', 'timber', 'potash', 'paper_cloth', 'spices', 'wine_butts', 'alabaster', 'almanacs', 'fine_ceramics', 'glass', 'scotch', 'bronze'],
        jimjam:        ['alabaster', 'almanacs', 'fine_ceramics', 'glass', 'cotton_cloth'],
        ardent:        ['scotch', 'bronze', 'powder', 'tartan']
      },
      expect: {
        jimjam:        { marble: 26, potash: 14, paper_cloth: 24, spices: 10, coal: 16, timber: 18 },
        ardent:        { coal: 12, wine_butts: 12 },
        kotgeta_visas: { potash: 18, paper_cloth: 26, spices: 12, wine_butts: 18, alabaster: 18, almanacs: 13, fine_ceramics: 14, glass: 10, cotton_cloth: 9, scotch: 14, bronze: 12, powder: 5 },
        dilihan:       { alabaster: 16, almanacs: 12, fine_ceramics: 14, glass: 10, bronze: 12, scotch: 10 }
      }
    });

    /* R6: Ardent (FC1) - Jimjam - Serai (lbl=54) - Osterbank (FC2) Scarp & Soda-Descent Loop */
    S.trade({
      id: 'r06_ardent_jimjam_serai_triangle',
      stops: [
        { settlement: 'ardent',            place: 'ar_wh' },
        { settlement: 'jimjam',            place: 'jj_serai_gate_wh' },
        { settlement: 'serai',             place: 'sr_wh' },
        { settlement: 'fc_oster_jarnhold', place: 'fo_wh' },
        { settlement: 'serai',             place: 'sr_wh' },
        { settlement: 'jimjam',            place: 'jj_serai_gate_wh' }
      ],
      cap: 65, carriers: 3, stagger: 150, offset: 85, legs: [185, 180, 165, 165, 180, 185], mins: 65,
      keep: 1, want: 9,
      provision: { beasts: 10, eat: { rice: 0.25 }, home: 0, maxDays: 2 },
      goods: {
        ardent:            ['bronze', 'scotch', 'tartan', 'timber', 'mounts_wool'],
        jimjam:            ['rice', 'alabaster', 'almanacs', 'fine_ceramics', 'cotton_cloth', 'saltpeter', 'glass', 'tea'],
        serai:             ['alkali_salt', 'potash', 'spider_silk', 'magnets', 'wine_butts'],
        fc_oster_jarnhold: ['scotch', 'timber', 'bronze']
      },
      expect: {
        jimjam:            { bronze: 24, scotch: 10, tartan: 7, timber: 20, mounts_wool: 12, alkali_salt: 32, spider_silk: 12, magnets: 7 },
        ardent:            { rice: 30, alkali_salt: 11, alabaster: 10, fine_ceramics: 9, glass: 8, almanacs: 7, cotton_cloth: 10, tea: 7 },
        fc_oster_jarnhold: { alkali_salt: 9, wine_butts: 9, spider_silk: 12, magnets: 8, rice: 18 },
        /* Serai builds entrepot buffer of Jimjam rice, alabaster, saltpeter, almanacs + Osterbank Gold Whiskey & timber across lbl=54! */
        serai:             { rice: 42, alabaster: 14, saltpeter: 12, almanacs: 8, bronze: 9, fine_ceramics: 6, scotch: 14, timber: 12 }
      }
    });

    /* R7: Soda-Lake (lbl=54) 25t Barge Line (Serai <-> Silkhead, 262 km flat lake: Jimjam grain & Osterbank whiskey east, Spider-Silk & Magnets west!) */
    S.trade({
      id: 'r07_serai_silkhead_sodalake_barge',
      stops: [{ settlement: 'serai', place: 'sr_wh' }, { settlement: 'silkhead', place: 'sh_wh' }],
      cap: 65, carriers: 2, stagger: 180, offset: 105, minutes: 240, mins: 75,
      keep: 1, want: 9,
      goods: {
        serai:    ['rice', 'alabaster', 'saltpeter', 'almanacs', 'bronze', 'scotch'],
        silkhead: ['spider_silk', 'magnets', 'marble', 'wine_butts']
      },
      expect: {
        silkhead: { rice: 30, alabaster: 10, saltpeter: 9, almanacs: 6, bronze: 7, scotch: 6 },
        serai:    { spider_silk: 18, magnets: 12, marble: 6, wine_butts: 8 }
      }
    });

    /* R8: Tentative Shell -> Korona K10 -> Silkhead Imperial Highway & Spur S-A (Shell/K10 <-> Jarnhold/Salpetervik FC4 <-> Silkhead) */
    S.trade({
      id: 'r08_shell_silkhead_imperial_hwy',
      stops: [
        { settlement: 'shell_goto',        place: 'sg_wh' },
        { settlement: 'fc_oster_jarnhold', place: 'fo_wh' },
        { settlement: 'silkhead',          place: 'sh_wh' },
        { settlement: 'fc_oster_jarnhold', place: 'fo_wh' }
      ],
      cap: 55, carriers: 2, stagger: 210, offset: 125, legs: [220, 210, 210, 220], mins: 75,
      keep: 1, want: 8,
      provision: { beasts: 8, eat: { rice: 0.25 }, home: 1, maxDays: 2 },
      goods: {
        shell_goto:        ['ancient_salvage', 'spices', 'rice'],
        fc_oster_jarnhold: ['mounts_wool', 'saltpeter', 'powder', 'scotch', 'bronze', 'spider_silk', 'magnets'],
        silkhead:          ['spider_silk', 'magnets', 'alabaster']
      },
      expect: {
        shell_goto:        { spider_silk: 10, magnets: 7, bronze: 9, mounts_wool: 9, alabaster: 8, saltpeter: 8, powder: 6, scotch: 6 },
        silkhead:          { ancient_salvage: 6, spices: 6, mounts_wool: 6 },
        fc_oster_jarnhold: { spices: 7, ancient_salvage: 6, spider_silk: 12, magnets: 8, alabaster: 8 }
      }
    });

    /* R9: Great Trough Lake (lbl=77) 425 km Treaty Barge Line (Palewharf Eternian/Republican Portage <-> Jimjam Lotus Harbour) */
    S.trade({
      id: 'r09_lbl77_palewharf_eternian_barge',
      stops: [{ settlement: 'palewharf', place: 'pw_wh' }, { settlement: 'jimjam', place: 'jj_harbour_wh' }],
      cap: 65, carriers: 2, stagger: 240, offset: 145, minutes: 300, mins: 80,
      keep: 2, want: 9,
      goods: {
        palewharf: ['marble', 'timber', 'paper_cloth', 'machine_parts'],
        jimjam:    ['alabaster', 'fine_ceramics', 'glass', 'cotton_cloth', 'almanacs', 'saltpeter']
      },
      expect: {
        jimjam:    { marble: 24, timber: 18, paper_cloth: 20, machine_parts: 8 },
        palewharf: { alabaster: 14, fine_ceramics: 11, glass: 9, cotton_cloth: 11, almanacs: 7, saltpeter: 10 }
      },
      closed: [{ legs: [0, 1], window: 'double-dark' }]
    });

    /* R10: White-Pass 5,400 m Trans-Rim Yak Caravan (Whitelake Khaayken Yeti & Yonni/Rian <-> Jimjam Separate North Fondouk) */
    S.trade({
      id: 'r10_whitepass_yeti_trans_rim',
      stops: [{ settlement: 'whitelake_pass', place: 'wp_wh' }, { settlement: 'jimjam', place: 'lm.whitepass_compound' }],
      cap: 50, carriers: 2, stagger: 220, offset: 165, minutes: 260, mins: 80,
      keep: 2, want: 9,
      provision: { beasts: 8, eat: { rice: 0.25 }, home: 0, maxDays: 2 },
      goods: {
        whitelake_pass: ['qiviut', 'goldroot', 'ancient_salvage'],
        jimjam:         ['rice', 'cotton_cloth', 'tea', 'glass', 'bronze']
      },
      expect: {
        jimjam:         { qiviut: 10, goldroot: 7, ancient_salvage: 8 },
        whitelake_pass: { rice: 22, cotton_cloth: 9, tea: 8, glass: 6, bronze: 7 }
      }
    });

    /* 9. Double-Dark Liturgical Observance */
    S.observance({
      id: 'jj.double-dark',
      window: 'double-dark',
      settlement: 'jimjam',
      forbidActs: ['CRAFT', 'WORK', 'TRIAL'],
      closeKinds: ['jj_kiln', 'jj_glassworks', 'jj_dyer', 'jj_press', 'jj_instrument', 'jj_court'],
      openKinds: ['jj_temple_sun', 'jj_temple_thirteen', 'jj_giant_ghat', 'jj_palace_plaza', 'jj_observatory'],
      holdRecipes: 'observance: double-dark',
      roleSched: 'double_dark',
      banners: 'double_dark',
      lamps: 0.05,
      priority: 100
    });

    /* 10. Citizen, Factor, Scholar & Minder Roles + 520 Embodied Actors + 4 Driven Street Carts */
    const VIGIL_SCHED = [[0, 'VIGIL'], [4, 'SLEEP'], [9, 'WORSHIP'], [14, 'REST'], [18, 'VIGIL']];
    function defRole(id, name, org, daySched, prefers) {
      S.role({
        id: id,
        name: name,
        org: org,
        settlement: 'jimjam',
        prefers: prefers || { SLEEP: { pin: 'home' }, WORK: { pin: 'work' }, CRAFT: { pin: 'work' }, STUDY: { pin: 'work' }, GUARD: { pin: 'work' }, TRADE: { pin: 'work' } },
        scheds: { work: daySched, double_dark: VIGIL_SCHED },
        when: { 'double-dark': 'double_dark' }
      });
    }

    defRole('jj_kauntavan',      'Kauntavan Ephemeris Priest',      'jj_kauntavan',     [[0, 'SLEEP'], [5, 'WORSHIP'], [8, 'STUDY'], [13, 'EAT'], [14, 'STUDY'], [18, 'WORSHIP'], [22, 'SLEEP']]);
    defRole('jj_sibyl',          'Ruby Zenana Coin-Veiled Sibyl',   'jj_crown',         [[0, 'SLEEP'], [7, 'WORSHIP'], [11, 'STUDY'], [15, 'REST'], [18, 'VIGIL'], [22, 'SLEEP']]);
    /* Note: SIM.economy counts workers doing WORK at a recipe site! */
    defRole('jj_artisan',        'Kiln, Glass & Dye Guild Master',  'jj_kiln_guild',    [[0, 'SLEEP'], [6, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'BUY'], [20, 'WORSHIP'], [22, 'SLEEP']]);
    defRole('jj_townsfolk',      'Jimjam Citizen & Shopkeeper',     'jj_citizens',      [[0, 'SLEEP'], [6, 'WORK'], [12, 'EAT'], [13, 'BUY'], [16, 'WORK'], [19, 'WORSHIP'], [21, 'SLEEP']]);
    defRole('jj_guard',          'Raja Banded-Brick Watchman',      'jj_crown',         [[0, 'GUARD'], [6, 'SLEEP'], [13, 'EAT'], [14, 'GUARD'], [21, 'GUARD']]);
    defRole('jj_handu_farmer',   'Handu Irrigated Allotment Farmer','jj_handu_villages',[[0, 'SLEEP'], [5, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'BUY'], [21, 'SLEEP']]);
    defRole('jj_mariner',        'Lotus Harbour 25t Barge Mariner', 'jj_citizens',      [[0, 'SLEEP'], [5, 'WORK'], [11, 'TRADE'], [14, 'WORK'], [18, 'EAT'], [21, 'SLEEP']]);
    defRole('jj_carter',         'Jimjam Ox-Cart Hauler',           'jj_citizens',      [[0, 'WORK']]);
    defRole('cut_caravanner',    'Dilihan & Cut Marble Factor',     'cut_factors',      [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'BUY'], [17, 'TRADE'], [21, 'SLEEP']]);
    defRole('ardent_trader',     'Free-Clan Bronze & Mount Drover', 'ardent_drovers',   [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'BUY'], [18, 'REST'], [21, 'SLEEP']]);
    defRole('serai_factor',      'Serai Soda-Delta Barge Factor',   'serai_factors',    [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'TRADE'], [18, 'BUY'], [21, 'SLEEP']]);
    defRole('silkhead_merchant', 'Silkhead Korona Silk Merchant',   'silkhead_guild',   [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'TRADE'], [18, 'REST'], [21, 'SLEEP']]);
    defRole('republic_minder',   'Iron Republic Astronomer-Minder', 'rep_legation',     [[0, 'SLEEP'], [7, 'STUDY'], [11, 'WORK'], [14, 'STUDY'], [18, 'EAT'], [22, 'SLEEP']]);
    defRole('order_chronicler',  'Order of Historians Chronicler',  'ord_chapter',      [[0, 'SLEEP'], [6, 'STUDY'], [12, 'EAT'], [13, 'STUDY'], [18, 'WORSHIP'], [22, 'SLEEP']]);
    defRole('khaayken_envoy',    'Whitelake Khaayken Qiviut Factor','wp_caravan',       [[0, 'SLEEP'], [7, 'TRADE'], [12, 'EAT'], [13, 'TRADE'], [18, 'REST'], [21, 'SLEEP']]);
    defRole('yonni_scholar',     'Yonni Trans-Pass Savant-Pilgrim', 'wp_scholars',      [[0, 'SLEEP'], [7, 'STUDY'], [12, 'EAT'], [13, 'WORSHIP'], [18, 'STUDY'], [22, 'SLEEP']]);
    defRole('rian_scholar',      'Rian Sound Ephemeris Pilgrim',    'wp_scholars',      [[0, 'SLEEP'], [7, 'WORSHIP'], [12, 'EAT'], [13, 'STUDY'], [18, 'WORSHIP'], [22, 'SLEEP']]);
    defRole('hykk_sailor',       'Hykkousoi Tide-Clergy Sailor',    'hykk_mariners',    [[0, 'SLEEP'], [6, 'WORSHIP'], [11, 'TRADE'], [14, 'WORSHIP'], [19, 'EAT'], [22, 'SLEEP']]);
    defRole('eternian_pilgrim',  'Escorted Eternian Barge Pilgrim', 'et_cohorts',       [[0, 'SLEEP'], [7, 'WORSHIP'], [12, 'EAT'], [13, 'WORSHIP'], [19, 'SLEEP']]);
    defRole('eternian_minder',   'Eternian Censorate Cohort Warden','et_cohorts',       [[0, 'SLEEP'], [7, 'WORSHIP'], [12, 'EAT'], [13, 'WORSHIP'], [19, 'SLEEP']]);
    defRole('serai_pilgrim',     'Serai Soda-Shore Pilgrim',        'jj_citizens',      [[0, 'SLEEP'], [7, 'WORSHIP'], [12, 'BUY'], [15, 'WORSHIP'], [20, 'SLEEP']]);

    const ROSTER = [
      { role: 'jj_kauntavan',      n: 44, homes: ['jj_home_sun_rich', 'lm.school_eye'],          works: ['lm.temple_sun', 'lm.rajas_eye', 'lm.school_eye', 'lm.school_hand', 'lm.temple_companion', 'lm.temple_week', 'lm.temple_thirteen'] },
      { role: 'jj_sibyl',          n: 16, homes: ['lm.palace', 'jj_home_twoday'],                works: ['lm.palace', 'lm.temple_twoday'] },
      { role: 'jj_artisan',        n: 76, homes: ['jj_home_day_poor', 'jj_home_4day_mid', 'jj_home_13_mid'], works: ['jj_day_kilns', 'jj_glassworks', 'jj_fourday_vats', 'jj_almanac_press', 'jj_brass_works'] },
      { role: 'jj_townsfolk',      n: 144,homes: ['jj_home_comp_mid', 'jj_home_week_mid', 'jj_home_13_mid', 'jj_home_4day_mid', 'jj_home_sun_rich'], works: ['jj_strand_bazaar', 'lm.court_sun', 'lm.court_week', 'lm.palace', 'lm.temple_fourday', 'lm.temple_day'] },
      { role: 'jj_guard',          n: 34, homes: ['lm.fortress_crest', 'lm.palace'],             works: ['lm.palace_plaza', 'lm.palace', 'lm.fortress_crest'] },
      { role: 'jj_handu_farmer',   n: 40, homes: ['jj_home_handu', 'jj_home_day_poor'],          works: ['jj_handu_granary', 'jj_strand_bazaar'] },
      { role: 'jj_mariner',        n: 42, homes: ['jj_home_giant_mid'],                          works: ['jj_harbour_wh', 'jj_strand_bazaar', 'lm.giant_ghat'] },
      { role: 'cut_caravanner',    n: 20, homes: ['lm.caravanserai_cut', 'jj_home_izani_dil'],   works: ['lm.caravanserai_cut', 'lm.izani_gov_ruin'] },
      { role: 'ardent_trader',     n: 14, homes: ['lm.caravanserai_cut'],                        works: ['jj_serai_gate_wh', 'lm.caravanserai_cut'] },
      { role: 'serai_factor',      n: 12, homes: ['jj_home_day_poor'],                           works: ['jj_serai_gate_wh', 'jj_strand_bazaar'] },
      { role: 'silkhead_merchant', n: 8,  homes: ['lm.caravanserai_cut'],                        works: ['jj_serai_gate_wh', 'lm.caravanserai_cut'] },
      { role: 'republic_minder',   n: 6,  homes: ['lm.republic_legation'],                       works: ['lm.izani_gov_ruin', 'lm.rajas_eye', 'lm.republic_legation'] },
      { role: 'order_chronicler',  n: 14, homes: ['lm.order_chapterhouse'],                      works: ['lm.order_chapterhouse', 'lm.temple_thirteen', 'lm.rajas_eye'] },
      { role: 'khaayken_envoy',    n: 14, homes: ['lm.whitepass_compound'],                      works: ['lm.whitepass_compound'] },
      { role: 'yonni_scholar',     n: 8,  homes: ['lm.whitepass_compound', 'lm.order_chapterhouse'], works: ['lm.order_chapterhouse', 'lm.rajas_eye', 'lm.whitepass_compound'] },
      { role: 'rian_scholar',      n: 6,  homes: ['lm.whitepass_compound', 'lm.order_chapterhouse'], works: ['lm.order_chapterhouse', 'lm.school_eye', 'lm.whitepass_compound'] },
      { role: 'hykk_sailor',       n: 18, homes: ['jj_home_giant_mid'],                          works: ['lm.giant_ghat', 'jj_harbour_wh'] }
    ];

    const charByActor = {};
    const actorList = [];
    let seq = 0;
    for (let ri = 0; ri < ROSTER.length; ri++) {
      const grp = ROSTER[ri];
      for (let k = 0; k < grp.n; k++) {
        seq++;
        const aid = 'jj_act_' + seq;
        const homeId = grp.homes[k % grp.homes.length];
        const workId = grp.works[k % grp.works.length];
        const charRec = makeCharRecord(aid, grp.role, seq, peoplesMap);
        charByActor[aid] = charRec;
        const a = S.actor({
          id: aid,
          role: grp.role,
          home: homeId,
          work: workId,
          culture: charRec.people,
          skin: charRec.skin
        });
        actorList.push(a);
      }
    }

    /* 4 Driven Ox-Cart Haulers inside Jimjam moving workshop goods into Harbour, Cut-Gate & Serai-Gate Warehouses */
    S.withEcon('jimjam', function () {
      const cartBases = ['jj_harbour_wh', 'jj_serai_gate_wh', 'lm.caravanserai_cut', 'jj_handu_granary'];
      for (let ci = 0; ci < 4; ci++) {
        seq++;
        const cid = 'jj_cart_' + (ci + 1);
        const charRec = makeCharRecord(cid, 'jj_carter', seq, peoplesMap);
        charByActor[cid] = charRec;
        const ca = S.actor({ id: cid, role: 'jj_carter', home: cartBases[ci], work: cartBases[ci], culture: 'jimjam', skin: charRec.skin });
        S.cart(ca);
        actorList.push(ca);
      }
    });

    /* 11. Six-Stream Pilgrimage & The Great Pilgrim's Market */
    S.pilgrimage({
      id: 'jj.flood',
      to: 'jimjam',
      faction: 'jimjam',
      baseMult: 0.25,
      leadDays: 0,
      windows: { 'double-dark-flood': 5.0, 'solstice-festival': 6.5 },
      stayNights: [2, 3],
      partySize: [4, 5],
      lodging: {
        hostelKinds: ['jj_dharmashala'],
        overflowCamps: ['jj_camp_cut', 'jj_camp_serai'],
        tentCap: 6
      },
      circuit: [
        { act: 'WORSHIP', kinds: ['jj_temple_sun', 'jj_temple_thirteen', 'jj_giant_ghat', 'jj_chapterhouse_order'], weight: 1.0 }
      ],
      souvenirs: ['almanacs'],
      souvenirRate: 0.35,
      offering: { acct: 'org:kauntavan', currency: 'talent', perPersonDay: 2 },
      streams: [
        { id: 'serai',     fromPort: 'port_serai_ardent', faction: 'jimjam',    basePerDay: 5, role: 'serai_pilgrim' },
        { id: 'local_jj1', fromPort: 'port_lotus_cove',   faction: 'jimjam',    basePerDay: 3, role: 'serai_pilgrim' },
        { id: 'hykkousoi', fromPort: 'port_lotus_cove',   faction: 'hykkousoi', basePerDay: 3, role: 'hykk_sailor',
          circuitBoost: { kinds: ['jj_giant_ghat'], mult: 3.5 } },
        { id: 'eternian',  fromPort: 'port_lotus_cove',   faction: 'eternian',  basePerDay: 3, role: 'eternian_pilgrim',
          governance: { mode: 'escorted_cohort', wardenRole: 'eternian_minder', cohortSize: 4, maxCohorts: 2,
                        lodgeOnly: ['jj_hostel_eternian'], forbidKinds: ['jj_shrine_wanderer', 'jj_whitepass_compound'] } },
        { id: 'scholars',  fromPort: 'port_cut_dilihan',  faction: 'order',     basePerDay: 2, role: 'order_chronicler',
          lodgePrefer: ['jj_chapterhouse_order'] },
        { id: 'whitepass', fromPort: 'port_whitepass_n',  faction: 'yonni_ria', basePerDay: 2,
          mix: [['yonni_scholar', 0.55], ['rian_scholar', 0.45]],
          lodgePrefer: ['jj_whitepass_compound', 'jj_chapterhouse_order'] }
      ]
    });

    S.pilgrimMarket({
      id: 'jj.great_market',
      pilgrimage: 'jj.flood',
      settlement: 'jimjam',
      place: 'jj_pilgrim_bazaar',
      minPilgrims: 10,
      currency: 'talent',
      hostAcct: 'treasury:jimjam',
      treasuryTax: 0.10,
      pools: {
        hykkousoi: [{ id: 'tethyan_vial', cat: 'reagent',  good: 'reagents', item: 'tethyan_bio_vial',   qty: [2, 4], price: 45,  rarity: 1.0 }],
        scholars:  [{ id: 'dalab_gel',    cat: 'reagent',  item: 'dalab_pressure_gel', qty: [2, 3], price: 80,  rarity: 1.0 },
                    { id: 'yuni_cell',    cat: 'tech',     item: 'yuni_vault_cell',    qty: [1, 2], price: 120, rarity: 1.0 }],
        serai:     [{ id: 'dam_relic',    cat: 'artifact', item: 'dam_servo_relic',    qty: [1, 2], price: 95,  rarity: 1.0 }],
        whitepass: [{ id: 'goldroot_lot', cat: 'reagent',  item: 'khaayken_goldroot',  qty: [2, 4], price: 70,  rarity: 1.0 }],
        eternian:  [{ id: 'tete_codex',   cat: 'artifact', item: 'tete_codex',         qty: [1, 1], price: 150, rarity: 1.0, covert: true }]
      }
    });

    /* 12. Class-Stratified Citizen Needs & Unrest Pool (poor / artisan / elite) */
    if (typeof S.needs === 'function' && typeof S.unrest === 'function') {
      const ROLE_CLASS = {
        jj_kauntavan: 'elite', jj_sibyl: 'elite', silkhead_merchant: 'elite',
        serai_factor: 'elite', cut_caravanner: 'elite', republic_minder: 'elite', order_chronicler: 'elite',
        jj_artisan: 'artisan', ardent_trader: 'artisan', khaayken_envoy: 'artisan', yonni_scholar: 'artisan', rian_scholar: 'artisan'
      };
      const jjClassOf = function (a) { return (a && ROLE_CLASS[a.role]) ? ROLE_CLASS[a.role] : 'poor'; };
      S.needs({
        list: ['sleep', 'food', 'faith'],
        rate: { sleep: 2.6, food: 2.2, faith: 1.4 },
        fill: {
          SLEEP: { sleep: 9.0, rest: 3.0 },
          REST:  { sleep: 2.5 },
          EAT:   { food: 12.0 },
          BUY:   { food: 6.0 },
          WORSHIP: { faith: 10.0 },
          VIGIL:   { faith: 11.0 },
          STUDY:   { faith: 5.0 }
        },
        init: 18,
        pain: 1.5
      });
      S.unrest({
        classOf: jjClassOf,
        smooth: 4,
        hyst: 5,
        stages: { grumble: 50, demand: 40, strike: 30, treason: 20 },
        grumble: { arrest: 0.7 },
        demand: { goods: 2, days: 5, keep: 3, every: 6, grant: 0.4, granted: { n: -8, days: 8 }, refused: { n: 4, days: 8 } },
        strike: { after: 6, share: 0.35, days: 1 }
      });
    }

    /* Lower the 14 off-screen settlements to ABSTRACT so multi-day runs fly at full speed while keeping 100% ledger parity */
    if (typeof S.level === 'function') {
      for (let ti = 1; ti < REGIONAL_TOWNS.length; ti++) {
        S.level(REGIONAL_TOWNS[ti].id, 'abstract');
      }
    }

    S.jump();

    const openingSnap = (S.ledgerSnap && typeof S.ledgerSnap === 'function') ? S.ledgerSnap() : null;

    const holds = {
      settlement: 'jimjam',
      stocks: function () {
        return S.stocks ? S.stocks('jimjam') : null;
      },
      at: function (x, z) {
        return (S.stocks && S.stocks.at) ? S.stocks.at(x, z, 28) : null;
      }
    };

    function syncClock(day, hour, tSec) {
      clockObj.day = day == null ? 10 : day;
      clockObj.hour = hour == null ? 10.4 : hour;
      clockObj.t = tSec != null ? tSec : (clockObj.day * 86400 + clockObj.hour * 3600);
    }

    function charOf(actor) {
      if (!actor) return null;
      if (charByActor[actor.id]) return charByActor[actor.id];
      const rec = makeCharRecord(actor.id, actor.role || 'jj_townsfolk', actor.k == null ? 1 : actor.k, peoplesMap);
      charByActor[actor.id] = rec;
      return rec;
    }

    function summary() {
      const nowSnap = (S.ledgerSnap && typeof S.ledgerSnap === 'function') ? S.ledgerSnap() : null;
      const ledgerAudit = (openingSnap && nowSnap && typeof S.ledger === 'function')
        ? S.ledger(openingSnap, nowSnap)
        : { ok: true, problems: [] };
      const allActors = S.all('actor');
      let repMinders = 0, wpEnvoys = 0, kauntavans = 0;
      for (let i = 0; i < allActors.length; i++) {
        const r = allActors[i].role;
        if (r === 'republic_minder') repMinders++;
        else if (r === 'khaayken_envoy' || r === 'yonni_scholar' || r === 'rian_scholar') wpEnvoys++;
        else if (r === 'jj_kauntavan' || r === 'jj_sibyl') kauntavans++;
      }
      const routeCount = (S.TRADE && S.TRADE.order) ? S.TRADE.order.length : 0;
      return {
        available: true,
        settlements: S.order.settlement ? S.order.settlement.length : 0,
        places: S.order.place ? S.order.place.length : 0,
        navNodes: navG.nodes.length,
        navEdges: navG.edges.length,
        actors: allActors.length,
        kauntavans: kauntavans,
        republicMinders: repMinders,
        whitePassActors: wpEnvoys,
        trades: routeCount,
        schedBarges: sched.barges.length,
        schedSkiffs: sched.skiffs.length,
        schedCaravans: sched.caravans.length,
        ledgerOk: !!ledgerAudit.ok,
        ledgerProblems: (ledgerAudit.problems || []).length
      };
    }

    return {
      available: true,
      towns: REGIONAL_TOWNS,
      openingSnap: openingSnap,
      sched: sched,
      holds: holds,
      charOf: charOf,
      syncClock: syncClock,
      summary: summary,
      nav: navG
    };
  }

  return {
    REGIONAL_TOWNS: REGIONAL_TOWNS,
    TOWN_FLOWS: TOWN_FLOWS,
    init: init,
    buildSchedules: buildSchedules,
    makeCharRecord: makeCharRecord
  };
})();
