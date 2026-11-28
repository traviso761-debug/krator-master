// ================================================================= JIMJAM — P4: ROOM() + KFURN Interiors, KDOOR Leaves & Cutaway ([draw])
// Wires ROOM() + KratorInteriors (IX.furnishRoom / IX.buildRoom / IX.exportInteriors) + indexed KFURN catalog batch
// across Sun Temple, Raja Palace (3 storeys), Almanac College of the Eye (2 storeys), Raja Eye Observatory, Order of
// Historians Chapterhouse, High Law Court, Cut-Gate Caravanserai (2 storeys), White-Pass Trans-Rim Fondouk, Decayed
// Izani Governor House, and all 3 Jimjam house tiers (rich, mid, poor); hangs operable KDOOR + KDOORLEAF + KDOORHOST
// portals on every furnished building & all 9 city/water gates; and registers KWALK interior floors, stairs & cutaway units.
const JJ_INTERIORS = (function buildJjInteriorsAndDoors() {
  'use strict';

  const L = JJ_LAYOUT.plan;
  const T = (typeof KTAGS !== 'undefined' && KTAGS.page) ? KTAGS.page : KTAGS.create({ build: 'jimjam' });
  KTAGS.page = T;

  function findStructById(id) {
    for (let i = 0; i < L.structures.length; i++) {
      if (L.structures[i].id === id) return L.structures[i];
    }
    return null;
  }

  function findFirstHouseByKey(prefix) {
    let best = null, bestD = 1e9;
    for (let i = 0; i < L.structures.length; i++) {
      const s = L.structures[i];
      if (!s || s.construct || s.key.indexOf(prefix) !== 0) continue;
      const d = Math.hypot(s.x + 80, s.z + 20);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }

  function worldPt(b, lx, lz) {
    const c = Math.cos(b.ry || 0), s = Math.sin(b.ry || 0);
    return [
      +(b.x + lx * c + lz * s).toFixed(3),
      +(b.z - lx * s + lz * c).toFixed(3)
    ];
  }

  function worldPoly(b, lx0, lz0, lx1, lz1) {
    return [
      worldPt(b, lx0, lz0),
      worldPt(b, lx1, lz0),
      worldPt(b, lx1, lz1),
      worldPt(b, lx0, lz1)
    ];
  }

  /* 1. Register operable KDOOR portals on all 7 City Gates & 2 Fortified Water-Portals */
  const gateDoors = [];
  if (typeof KDOOR !== 'undefined' && KDOOR) {
    for (let i = 0; i < L.walls.length; i++) {
      const w = L.walls[i];
      if (!w) continue;
      if (w.key === 'jj_wall_gate') {
        gateDoors.push(KDOOR.add({
          id: 'gate.' + w.id,
          at: [w.x, w.y, w.z],
          yaw: w.ry || 0,
          w: 5.2,
          h: 5.4,
          t: 0.24,
          preset: 'double',
          style: 'banded',
          open: 1,
          walk: false
        }));
      } else if (w.key === 'jj_wall_watergate') {
        gateDoors.push(KDOOR.add({
          id: 'watergate.' + w.id,
          at: [w.x, w.y + 0.6, w.z],
          yaw: w.ry || 0,
          w: 8.8,
          h: 5.0,
          t: 0.22,
          preset: 'portcullis',
          style: 'grille',
          open: 1,
          walk: false
        }));
      }
    }
  }

  /* 2. Build ROOM() + KFURN (indexed: true) Furnished Interiors & Cutaway Units */
  const units = [];
  const placedPieces = [];
  const plansByRoom = {};
  const roomsBuilt = [];
  const interiorDoors = [];
  let auditFails = 0;

  const furnGroup = new THREE.Group();
  furnGroup.name = 'jj_interiors_furniture_root';
  furnGroup.userData.probeSkip = true;
  scene.add(furnGroup);

  if (typeof KratorInteriors !== 'undefined' && typeof KratorFurniture !== 'undefined' && typeof KFURN !== 'undefined' && typeof ROOM === 'function') {
    const IX = KratorInteriors;
    if (IX.CULTURE_FAMILY) {
      IX.CULTURE_FAMILY.jimjam = ['jimjam', 'iziz', 'hykkousoi', 'order', 'generic'];
      IX.CULTURE_FAMILY.order = ['order', 'jimjam', 'iziz', 'generic'];
      IX.CULTURE_FAMILY.khaayken = ['khaayken', 'jimjam', 'generic'];
      IX.CULTURE_FAMILY.republican = ['republican', 'iziz', 'jimjam', 'generic'];
    }
    if (typeof IX.clearRooms === 'function') IX.clearRooms();

    /* Map structure id -> KTAGS building record id so furniture parents resolve in EXPORT.check */
    const tagIdByKey = {};
    for (let ti = 0; ti < T.records.length; ti++) {
      const tr = T.records[ti];
      if (!tr || !tr.at) continue;
      if (tr['class'] === 'building' || tr['class'] === 'landmark') {
        tagIdByKey[Math.round(tr.at[0]) + '|' + Math.round(tr.at[2]) + '|' + tr.key] = tr.id;
      }
    }
    function tagParentOf(b) {
      if (!b) return null;
      return tagIdByKey[Math.round(b.x) + '|' + Math.round(b.z) + '|' + b.key] || null;
    }

    KratorFurniture.setDetail(0.45);
    const kfurnReg = KFURN.create({
      idPrefix: 'jj_ixf',
      catalog: KFURN.catalogOf(KratorFurniture),
      interiors: IX,
      tags: T,
      seed: function (o, ctx, reg, x, y, z) {
        return KRAND.hash(745546, Math.round(x * 10), Math.round(y * 10), Math.round(z * 10), reg.placed.length);
      },
      draw: function (rec, ctx) {
        const w = (ctx && typeof ctx.wealth === 'number') ? ctx.wealth : 0.65;
        KFURN.drawRec(kfurnReg, rec, w);
      }
    });
    KFURN.useBatch(kfurnReg, KratorFurniture, IX, { indexed: true });

    let activeParentTagId = null;
    const baseAdapter = IX.runtimeAdapter(KratorFurniture, kfurnReg.batch);
    const origBuild = baseAdapter.build;
    baseAdapter.build = function (p, room) {
      const E = KratorFurniture.FURN_BY_KEY[p.key] || {};
      const ftags = { setting: 'room' };
      if (E.culture) ftags.culture = E.culture;
      if (E.tier) ftags.tier = E.tier;
      if (room && room.id != null) ftags.room = String(room.id);
      const rec = T.add({
        prefix: 'ixf',
        'class': 'furniture',
        kind: E.type || 'prop',
        key: p.key,
        name: E.name || p.key,
        parent: activeParentTagId,
        at: [+(p.x).toFixed(3), +(p.y == null ? 0 : p.y).toFixed(3), +(p.z).toFixed(3)],
        ry: +(p.ry == null ? 0 : p.ry).toFixed(4),
        size: E.w ? [E.w, E.d, E.h] : [0.8, 0.8, 0.8],
        tags: ftags,
        frag: '90-jj-interiors.js'
      });
      placedPieces.push({
        id: rec.id,
        key: p.key,
        variant: p.variant | 0,
        seed: p.seed,
        wealth: room ? room.wealth : 0.6,
        x: +p.x.toFixed(3),
        y: +(p.y == null ? 0 : p.y).toFixed(3),
        z: +p.z.toFixed(3),
        ry: +(p.ry == null ? 0 : p.ry).toFixed(4),
        room: room ? String(room.id) : null,
        building: activeParentTagId
      });
      return origBuild.call(this, p, room);
    };

    const houseRich = findFirstHouseByKey('jj_house_rich_');
    const houseMid  = findFirstHouseByKey('jj_house_mid_');
    const housePoor = findFirstHouseByKey('jj_house_poor_');

    /* Program specs for all P4 hero landmarks + all 3 house tiers */
    const SPECS = [
      {
        struct: findStructById('lm.temple_sun'),
        unitId: 'cut.temple_sun',
        title: 'Great Solstice Temple (Sanctuary & Ephemeris Undercroft)',
        culture: 'jimjam',
        wealth: 0.92,
        levels: [
          {
            dy: 0.4, h: 4.6, name: 'Long-Count Ephemeris Undercroft',
            rooms: [
              { suffix: 'undercroft', kind: 'study', box: [-10, -14, 10, 4], doors: [{ lx: 0, lz: 4, w: 1.8, to: 'street', style: 'banded' }] },
              { suffix: 'archive',    kind: 'library', box: [-10, 4, 10, 18], doors: [{ lx: 0, lz: 4, w: 1.4, to: 'undercroft', leaf: false }] }
            ],
            stairToNext: { x0: 8.0, z0: -12.0, x1: 8.0, z1: -4.0, w: 2.2 }
          },
          {
            dy: 6.2, h: 6.5, name: 'Solstice Sanctuary Nave & New-Fire Hall',
            rooms: [
              { suffix: 'sanctuary',   kind: 'shrine',      box: [-12, -16, 12, 6], doors: [{ lx: 0, lz: 6, w: 2.4, to: 'antechamber', style: 'banded' }] },
              { suffix: 'antechamber', kind: 'antechamber', box: [-11, 6, 11, 20],  doors: [{ lx: 0, lz: 6, w: 2.4, to: 'sanctuary', leaf: false }, { lx: 0, lz: 20, w: 2.4, to: 'street', style: 'banded' }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.palace'),
        unitId: 'cut.palace',
        title: 'The Rajas Palace (Petition Court, Great Darbar & Ruby Zenana)',
        culture: 'jimjam',
        wealth: 0.96,
        levels: [
          {
            dy: 4.5, h: 5.0, name: 'Ground Storey — Petition Vestibule & Solar Treasury',
            rooms: [
              { suffix: 'vestibule', kind: 'antechamber', box: [-16, -24, 16, -4], doors: [{ lx: 0, lz: -24, w: 2.6, to: 'street', style: 'banded' }, { lx: 0, lz: -4, w: 2.0, to: 'treasury', style: 'panel+pull' }] },
              { suffix: 'treasury',  kind: 'store',       box: [-14, -4, 14, 14],  doors: [{ lx: 0, lz: -4, w: 2.0, to: 'vestibule', leaf: false }] }
            ],
            stairToNext: { x0: -13.0, z0: -18.0, x1: -13.0, z1: -8.0, w: 2.6 }
          },
          {
            dy: 10.2, h: 5.4, name: 'Piano Nobile — Great Darbar Hall & Council of Three Wheels',
            rooms: [
              { suffix: 'darbar',  kind: 'hall',  box: [-18, -20, 18, 4],  doors: [{ lx: 0, lz: 4, w: 2.2, to: 'council', style: 'glazed+pull' }] },
              { suffix: 'council', kind: 'study', box: [-15, 4, 15, 20],   doors: [{ lx: 0, lz: 4, w: 2.2, to: 'darbar', leaf: false }] }
            ],
            stairToNext: { x0: 13.0, z0: -16.0, x1: 13.0, z1: -6.0, w: 2.4 }
          },
          {
            dy: 16.2, h: 4.6, name: 'Upper Suite — Ruby Zenana & Split Alabaster Oracle Screen',
            rooms: [
              { suffix: 'zenana', kind: 'bedroom', box: [-14, -14, 14, 2],  doors: [{ lx: 0, lz: 2, w: 1.6, to: 'oracle', style: 'scrolled' }] },
              { suffix: 'oracle', kind: 'shrine',  box: [-12, 2, 12, 16],   doors: [{ lx: 0, lz: 2, w: 1.6, to: 'zenana', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.school_eye'),
        unitId: 'cut.school_eye',
        title: 'Almanac College of the Eye',
        culture: 'jimjam',
        wealth: 0.78,
        levels: [
          {
            dy: 0.4, h: 4.0, name: 'Ground Cloister — Lecture Hall & Ephemeris Scriptorium',
            rooms: [
              { suffix: 'lecture',     kind: 'school',  box: [-10, -9, 0, 9], doors: [{ lx: -5, lz: 9, w: 1.5, to: 'street', style: 'panel+pull' }, { lx: 0, lz: 0, w: 1.3, to: 'scriptorium', style: 'panel+pull' }] },
              { suffix: 'scriptorium', kind: 'library', box: [0, -9, 10, 9],  doors: [{ lx: 0, lz: 0, w: 1.3, to: 'lecture', leaf: false }] }
            ],
            stairToNext: { x0: 7.5, z0: -7.0, x1: 7.5, z1: 1.0, w: 1.8 }
          },
          {
            dy: 4.7, h: 3.6, name: 'Upper Gallery — Kauntavan Fellows Dormitory',
            rooms: [
              { suffix: 'dorm', kind: 'bedroom', box: [-9, -8, 9, 8], doors: [{ lx: 0, lz: 8, w: 1.3, to: 'street', style: 'panel+pull' }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.rajas_eye'),
        unitId: 'cut.rajas_eye',
        title: 'The Rajas Eye Observatory Pavilion',
        culture: 'jimjam',
        wealth: 0.90,
        levels: [
          {
            dy: 0.6, h: 4.8, name: 'Meridian Chronograph Rotunda & Lens Vault',
            rooms: [
              { suffix: 'rotunda', kind: 'study', box: [-7, -7, 7, 3], doors: [{ lx: 0, lz: -7, w: 1.5, to: 'street', style: 'glazed+pull' }, { lx: 0, lz: 3, w: 1.2, to: 'vault', style: 'panel+pull' }] },
              { suffix: 'vault',   kind: 'store', box: [-6, 3, 6, 8],  doors: [{ lx: 0, lz: 3, w: 1.2, to: 'rotunda', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.order_chapterhouse'),
        unitId: 'cut.chapterhouse',
        title: 'Order of Historians Small Chapterhouse',
        culture: 'order',
        wealth: 0.80,
        levels: [
          {
            dy: 0.4, h: 4.2, name: 'Chronicle Reading Hall & Savant Lodging',
            rooms: [
              { suffix: 'archives', kind: 'library', box: [-9, -8, 2, 8], doors: [{ lx: -3, lz: 8, w: 1.5, to: 'street', style: 'banded' }, { lx: 2, lz: 0, w: 1.2, to: 'cells', style: 'panel+pull' }] },
              { suffix: 'cells',    kind: 'bedroom', box: [2, -8, 9, 8],  doors: [{ lx: 2, lz: 0, w: 1.2, to: 'archives', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.court_sun'),
        unitId: 'cut.court_sun',
        title: 'High Law & Handu Land-Tax Court',
        culture: 'jimjam',
        wealth: 0.84,
        levels: [
          {
            dy: 0.5, h: 4.6, name: 'White-Marble Civil Bench & Black-Clinker Tribunal',
            rooms: [
              { suffix: 'civil_bench',    kind: 'hall',  box: [-12, -9, 0, 9], doors: [{ lx: -6, lz: 9, w: 1.8, to: 'street', style: 'banded' }, { lx: 0, lz: 0, w: 1.4, to: 'criminal_bench', style: 'panel+pull' }] },
              { suffix: 'criminal_bench', kind: 'study', box: [0, -9, 12, 9],  doors: [{ lx: 0, lz: 0, w: 1.4, to: 'civil_bench', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.caravanserai_cut'),
        unitId: 'cut.caravanserai',
        title: 'Cut-Gate Royal Caravanserai',
        culture: 'jimjam',
        wealth: 0.72,
        levels: [
          {
            dy: 0.35, h: 4.1, name: 'Ground Arcade — Caravan Taproom & Marble Weigh-Store',
            rooms: [
              { suffix: 'taproom', kind: 'tavern', box: [-14, -12, 2, 12], doors: [{ lx: -6, lz: -12, w: 2.0, to: 'street', style: 'plank+ring' }, { lx: 2, lz: 0, w: 1.4, to: 'bales', style: 'plank+ring' }] },
              { suffix: 'bales',   kind: 'store',  box: [2, -12, 14, 12],  doors: [{ lx: 2, lz: 0, w: 1.4, to: 'taproom', leaf: false }] }
            ],
            stairToNext: { x0: -11.0, z0: 3.0, x1: -11.0, z1: 10.5, w: 2.0 }
          },
          {
            dy: 4.75, h: 3.6, name: 'Upper Gallery — Merchant Sleeping Chambers',
            rooms: [
              { suffix: 'gallery_beds', kind: 'bedroom', box: [-13, -10, 13, 10], doors: [{ lx: 0, lz: -10, w: 1.4, to: 'street', style: 'plank+ring' }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.whitepass_compound'),
        unitId: 'cut.whitepass',
        title: 'White-Pass Khaayken Yeti & Yonni/Rian Scholar Fondouk',
        culture: 'khaayken',
        wealth: 0.74,
        levels: [
          {
            dy: 0.35, h: 4.4, name: 'Barter Hall & Trans-Pass Ephemeris Study',
            rooms: [
              { suffix: 'barter_hall',   kind: 'hall',  box: [-12, -10, 2, 10], doors: [{ lx: -5, lz: 10, w: 2.0, to: 'street', style: 'plank+ring' }, { lx: 2, lz: 0, w: 1.4, to: 'scholar_study', style: 'panel+pull' }] },
              { suffix: 'scholar_study', kind: 'study', box: [2, -10, 12, 10],  doors: [{ lx: 2, lz: 0, w: 1.4, to: 'barter_hall', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: findStructById('lm.izani_gov_ruin'),
        unitId: 'cut.izani_ruin',
        title: 'Decayed Izani Governors House (Sidkin-Palu)',
        culture: 'iziz',
        wealth: 0.45,
        ruin: true,
        levels: [
          {
            dy: 0.45, h: 4.4, name: 'Ruined Praetorium — Rag-Paper Vats & Republican Minder Desk',
            rooms: [
              { suffix: 'rag_paper',   kind: 'workshop', box: [-13, -9, 1, 9], doors: [{ lx: -6, lz: 9, w: 1.8, to: 'street', style: 'plank+ring' }, { lx: 1, lz: 0, w: 1.3, to: 'minder_cell', style: 'plank+ring' }] },
              { suffix: 'minder_cell', kind: 'study',    box: [1, -9, 12, 9],  doors: [{ lx: 1, lz: 0, w: 1.3, to: 'rag_paper', leaf: false }] }
            ]
          }
        ]
      },
      {
        struct: houseRich,
        unitId: 'cut.house_rich',
        title: 'Rich Lotus-Court Mansion (jj_house_rich_a)',
        culture: 'jimjam',
        wealth: 0.88,
        levels: [
          {
            dy: 0.35, h: 3.8, name: 'Ground Courtyard — Reception Diwan, Kitchen & Larder',
            rooms: [
              { suffix: 'diwan',   kind: 'hall',    box: [-7, -6, 1, 6],  doors: [{ lx: -3, lz: 6, w: 1.4, to: 'street', style: 'scrolled' }, { lx: 1, lz: -2, w: 1.1, to: 'kitchen', style: 'panel+pull' }] },
              { suffix: 'kitchen', kind: 'kitchen', box: [1, -6, 7, 1],   doors: [{ lx: 1, lz: -2, w: 1.1, to: 'diwan', leaf: false }, { lx: 4, lz: 1, w: 1.0, to: 'larder', style: 'plank+ring' }] },
              { suffix: 'larder',  kind: 'store',   box: [1, 1, 7, 6],    doors: [{ lx: 4, lz: 1, w: 1.0, to: 'kitchen', leaf: false }] }
            ],
            stairToNext: { x0: -5.5, z0: -4.5, x1: -5.5, z1: 1.5, w: 1.5 }
          },
          {
            dy: 4.35, h: 3.5, name: 'Upper Terrace — Household Sleeping Suite',
            rooms: [
              { suffix: 'bedroom', kind: 'bedroom', box: [-6.5, -5.5, 6.5, 5.5], doors: [{ lx: 0, lz: 5.5, w: 1.2, to: 'street', style: 'scrolled' }] }
            ]
          }
        ]
      },
      {
        struct: houseMid,
        unitId: 'cut.house_mid',
        title: 'Middle Artisan Chimney-House (jj_house_mid_a)',
        culture: 'jimjam',
        wealth: 0.58,
        levels: [
          {
            dy: 0.30, h: 3.4, name: 'Ground Storey — Shop-Kitchen & Spice Store',
            rooms: [
              { suffix: 'kitchen', kind: 'kitchen', box: [-5.5, -5, 1.5, 5], doors: [{ lx: -2, lz: 5, w: 1.2, to: 'street', style: 'panel+pull' }, { lx: 1.5, lz: 0, w: 1.0, to: 'store', style: 'plank+ring' }] },
              { suffix: 'store',   kind: 'store',   box: [1.5, -5, 5.5, 5],  doors: [{ lx: 1.5, lz: 0, w: 1.0, to: 'kitchen', leaf: false }] }
            ],
            stairToNext: { x0: -4.2, z0: -3.8, x1: -4.2, z1: 1.5, w: 1.3 }
          },
          {
            dy: 3.90, h: 3.2, name: 'Upper Gable — Family Bedroom',
            rooms: [
              { suffix: 'bedroom', kind: 'bedroom', box: [-5, -4.5, 5, 4.5], doors: [{ lx: 0, lz: 4.5, w: 1.1, to: 'street', style: 'panel+pull' }] }
            ]
          }
        ]
      },
      {
        struct: housePoor,
        unitId: 'cut.house_poor',
        title: 'Leeward Ochre Courtyard House (jj_house_poor_a)',
        culture: 'jimjam',
        wealth: 0.25,
        levels: [
          {
            dy: 0.25, h: 3.1, name: 'Single Storey — Hearth Room, Loom & Sleeping Alcove',
            rooms: [
              { suffix: 'hearth',  kind: 'kitchen', box: [-4.5, -4, 0.5, 4], doors: [{ lx: -2, lz: 4, w: 1.1, to: 'street', style: 'plank+ring' }, { lx: 0.5, lz: 0, w: 1.0, to: 'alcove', style: 'plank+ring' }] },
              { suffix: 'alcove',  kind: 'bedroom', box: [0.5, -4, 4.5, 4],  doors: [{ lx: 0.5, lz: 0, w: 1.0, to: 'hearth', leaf: false }] }
            ]
          }
        ]
      }
    ];

    for (let si = 0; si < SPECS.length; si++) {
      const sp = SPECS[si];
      const b = sp.struct;
      if (!b) continue;
      activeParentTagId = tagParentOf(b);
      const unitLevels = [];
      let unitRooms = 0;
      let unitPieces = 0;

      for (let li = 0; li < sp.levels.length; li++) {
        const lv = sp.levels[li];
        const floorY = +(b.y + lv.dy).toFixed(3);
        unitLevels.push({ y: floorY, h: lv.h, name: lv.name });

        for (let ri = 0; ri < lv.rooms.length; ri++) {
          const rSpec = lv.rooms[ri];
          const roomId = sp.unitId + '.' + rSpec.suffix;
          const poly = worldPoly(b, rSpec.box[0], rSpec.box[1], rSpec.box[2], rSpec.box[3]);
          const doors = [];
          for (let di = 0; di < rSpec.doors.length; di++) {
            const dSpec = rSpec.doors[di];
            const dAt = worldPt(b, dSpec.lx, dSpec.lz);
            const targetTo = dSpec.to === 'street' ? 'street' : (sp.unitId + '.' + dSpec.to);
            doors.push({
              id: roomId + '.d' + di,
              at: dAt,
              w: dSpec.w == null ? 1.2 : dSpec.w,
              h: 2.15,
              to: targetTo,
              swing: dSpec.leaf === false ? 'out' : 'in',
              leaf: dSpec.leaf !== false
            });

            if (dSpec.leaf !== false && typeof KDOOR !== 'undefined' && KDOOR) {
              const bRy = b.ry == null ? 0 : b.ry;
              const dW = dSpec.w == null ? 1.2 : dSpec.w;
              const outwardYaw = bRy + (Math.abs(dSpec.lx - rSpec.box[0]) < 0.05 || Math.abs(dSpec.lx - rSpec.box[2]) < 0.05 ? Math.PI * 0.5 : 0);
              interiorDoors.push(KDOOR.add({
                id: roomId + '.door.' + di,
                at: [dAt[0], floorY, dAt[1]],
                yaw: outwardYaw,
                w: dW,
                h: 2.15,
                t: 0.09,
                preset: dW >= 1.9 ? 'double' : 'single',
                style: dSpec.style || 'panel+pull',
                open: 1,
                walk: false,
                key: b.key
              }));
            }
          }

          let rm = null;
          try {
            rm = ROOM({
              id: roomId,
              building: b.id,
              kind: rSpec.kind,
              poly: poly,
              y: floorY,
              h: lv.h,
              doors: doors,
              culture: sp.culture,
              wealth: sp.wealth,
              level: li,
              seed: KRAND.hash(745546, roomId)
            });
          } catch (e) {
            if (typeof reportErr === 'function') reportErr('JJ_INTERIORS ROOM ' + roomId + ': ' + (e && e.message ? e.message : e));
            continue;
          }

          const plan = IX.furnishRoom(rm, baseAdapter, {
            seed: KRAND.hash(745546, roomId, 9),
            cell: 0.2,
            nbr: 4,
            passes: 2,
            backtrack: 16
          });
          if (sp.ruin && plan && plan.placements) {
            const keep = new Set();
            plan.placements = plan.placements.filter(function (p, idx) {
              const ok = (idx % 3 === 0) && (!p.host || keep.has(p.host));
              if (ok) keep.add(p.id);
              return ok;
            });
            plan.lights = [];
          }
          IX.buildRoom(plan, baseAdapter, rm);
          const aud = IX.audit ? IX.audit(rm, plan, baseAdapter) : { ok: true, fails: [] };
          if (aud && aud.fails && aud.fails.length && !sp.ruin) auditFails += aud.fails.length;

          plansByRoom[rm.id] = plan;
          roomsBuilt.push(rm);
          unitRooms++;
          unitPieces += plan.placements.length;

          /* Register walkable interior floor polygon in KWALK */
          if (typeof KWALK !== 'undefined' && KWALK && typeof KWALK.poly === 'function') {
            KWALK.poly({
              pts: poly.map(function (p) { return [p[0], p[1], floorY]; }),
              name: sp.title + ' — ' + rSpec.suffix,
              tag: 'interior:' + sp.unitId
            });
          }
        }

        /* Register walkable stair strip connecting storey li to li + 1 */
        if (lv.stairToNext && sp.levels[li + 1] && typeof KWALK !== 'undefined' && KWALK && typeof KWALK.strip === 'function') {
          const st = lv.stairToNext;
          const p0 = worldPt(b, st.x0, st.z0);
          const p1 = worldPt(b, st.x1, st.z1);
          const nextY = +(b.y + sp.levels[li + 1].dy).toFixed(3);
          KWALK.strip({
            a: [p0[0], p0[1], floorY],
            b: [p1[0], p1[1], nextY],
            w: st.w == null ? 1.8 : st.w,
            name: sp.title + ' stair L' + (li + 1),
            tag: 'stair'
          });
        }
      }

      units.push({
        id: sp.unitId,
        name: sp.title,
        x: b.x,
        z: b.z,
        ry: b.ry || 0,
        w: b.w,
        d: b.d,
        levels: unitLevels,
        parent: activeParentTagId,
        rooms: unitRooms,
        pieces: unitPieces
      });
      activeParentTagId = null;
    }

    if (kfurnReg && kfurnReg.batch && typeof kfurnReg.batch.flush === 'function') {
      kfurnReg.batch.flush(furnGroup);
    } else if (kfurnReg && typeof kfurnReg.flush === 'function') {
      kfurnReg.flush(furnGroup);
    }
    furnGroup.traverse(function (o) {
      if (o.isMesh && o.geometry) {
        o.userData.probeSkip = true;
        o.userData.interiors = true;
        KFURN.linearColours(o.geometry);
        if (!o.geometry.attributes.normal && o.geometry.attributes.position) {
          o.geometry.computeVertexNormals();
        }
      }
    });
  }

  /* 3. Instance 3D KDOORLEAF meshes grouped by style & bind KDOORHOST */
  const doorGroup = new THREE.Group();
  doorGroup.name = 'jj_doors_root';
  doorGroup.userData.probeSkip = true;
  scene.add(doorGroup);

  const allDoorMeshes = [];
  if (typeof KDOOR !== 'undefined' && typeof KDOORLEAF !== 'undefined' && typeof KDOORHOST !== 'undefined' && typeof KGLASS !== 'undefined') {
    const byStyle = new Map();
    for (let i = 0; i < KDOOR.list.length; i++) {
      const D = KDOOR.list[i];
      const st = D.style || 'panel+pull';
      let bucket = byStyle.get(st);
      if (!bucket) {
        bucket = { doors: [], leaves: 0 };
        byStyle.set(st, bucket);
      }
      bucket.doors.push(D);
      bucket.leaves += KDOOR.leafCount(D);
    }

    const glassMat = KGLASS.material(THREE, 'clear');
    glassMat.side = THREE.DoubleSide;
    const matTeak   = new THREE.MeshStandardMaterial({ color: 0x5c3a24, roughness: 0.78, metalness: 0.06 });
    const matBrass  = new THREE.MeshStandardMaterial({ color: 0xc89b3c, roughness: 0.36, metalness: 0.74 });
    const matIron   = new THREE.MeshStandardMaterial({ color: 0x2c2d30, roughness: 0.48, metalness: 0.68 });
    const upY = new THREE.Vector3(0, 1, 0);

    byStyle.forEach(function (bucket, style) {
      if (bucket.leaves <= 0) return;
      const frameM = style === 'grille' ? matIron : matTeak;
      const hwM = style === 'grille' ? matIron : matBrass;
      const meshes = KDOORLEAF.meshes(THREE, style, { frame: frameM, glass: glassMat, hw: hwM }, bucket.leaves);
      for (let m = 0; m < meshes.length; m++) {
        meshes[m].userData.probeSkip = true;
        meshes[m].frustumCulled = false;
        doorGroup.add(meshes[m]);
        allDoorMeshes.push(meshes[m]);
      }
      let cursor = 0;
      for (let i = 0; i < bucket.doors.length; i++) {
        const D = bucket.doors[i];
        const lc = KDOOR.leafCount(D);
        const idxs = [];
        for (let k = 0; k < lc; k++) idxs.push(cursor++);
        const q0 = new THREE.Quaternion().setFromAxisAngle(upY, D.yaw || 0);
        KDOORHOST.instanced(D, meshes, idxs, q0);
        KDOORHOST.pose(D);
      }
    });

    for (let m = 0; m < allDoorMeshes.length; m++) {
      allDoorMeshes[m].instanceMatrix.needsUpdate = true;
    }

    const doorTip = KDOORHOST.tip(
      function () { return camera.position; },
      function () { return !!(window.KHOST && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk); }
    );
    TICKS.push(function (dt) {
      KDOORHOST.tick(dt == null ? 0.016 : dt);
      doorTip();
    });
  }

  window._interiors = {
    on: units.length > 0,
    units: units.length,
    rooms: roomsBuilt.length,
    pieces: placedPieces.length,
    doors: typeof KDOOR !== 'undefined' ? KDOOR.list.length : 0,
    auditFails: auditFails
  };

  function exportInteriorsSection(ctx) {
    const regIds = new Set();
    if (ctx && ctx.out && ctx.out.registry && Array.isArray(ctx.out.registry.records)) {
      for (let i = 0; i < ctx.out.registry.records.length; i++) {
        if (ctx.out.registry.records[i] && ctx.out.registry.records[i].id) {
          regIds.add(ctx.out.registry.records[i].id);
        }
      }
    }
    const bMap = new Map();
    for (let ui = 0; ui < units.length; ui++) {
      const u = units[ui];
      if (!u.parent) continue;
      if (ctx && ctx.box && !ctx.inBox(u.x, u.z)) continue;
      if (regIds.size && !regIds.has(u.parent)) continue;
      bMap.set(u.unitId || u.id, { id: u.parent, storeys: [], links: [], walls: [], _storeyByY: new Map(), _roomIds: new Set() });
    }

    for (let ri = 0; ri < roomsBuilt.length; ri++) {
      const rm = roomsBuilt[ri];
      const uid = rm.id.split('.').slice(0, 2).join('.');
      const B = bMap.get(uid);
      if (!B) continue;
      B._roomIds.add(rm.id);
    }

    for (let ri = 0; ri < roomsBuilt.length; ri++) {
      const rm = roomsBuilt[ri];
      const uid = rm.id.split('.').slice(0, 2).join('.');
      const B = bMap.get(uid);
      if (!B) continue;
      let st = B._storeyByY.get(rm.y);
      if (!st) {
        st = { y: rm.y, rooms: [] };
        B._storeyByY.set(rm.y, st);
        B.storeys.push(st);
      }
      const dRefs = [];
      const rDoors = rm.doors || [];
      for (let di = 0; di < rDoors.length; di++) {
        const d = rDoors[di];
        const lid = rm.id + '.lnk.' + di;
        const bEnd = (d.to && B._roomIds.has(d.to)) ? d.to : 'outside';
        B.links.push({
          id: lid,
          a: rm.id,
          b: bEnd,
          kind: 'door',
          at: [+(d.at[0]).toFixed(3), +(d.at[1]).toFixed(3)]
        });
        dRefs.push(lid);
      }
      st.rooms.push({
        id: rm.id,
        kind: rm.kind,
        poly: rm.poly.map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; }),
        h: rm.h,
        doors: dRefs
      });
    }

    const bList = [];
    bMap.forEach(function (B) {
      delete B._storeyByY;
      delete B._roomIds;
      if (B.storeys.length) bList.push(B);
    });

    const v2 = (typeof KratorInteriors !== 'undefined' && KratorInteriors.exportInteriors)
      ? KratorInteriors.exportInteriors(roomsBuilt, plansByRoom)
      : null;

    return {
      format: 'krator-interiors',
      version: 1,
      build: 'jimjam',
      buildings: bList,
      roomLightV2: v2
    };
  }

  function exportFurnitureSection(ctx) {
    const list = [];
    for (let i = 0; i < placedPieces.length; i++) {
      const p = placedPieces[i];
      if (ctx && ctx.box && !ctx.inBox(p.x, p.z)) continue;
      list.push(p);
    }
    return {
      format: 'krator-furniture',
      version: 1,
      build: 'jimjam',
      records: list,
      count: list.length
    };
  }

  return {
    units: units,
    rooms: roomsBuilt,
    plans: plansByRoom,
    placed: placedPieces,
    gateDoors: gateDoors,
    interiorDoors: interiorDoors,
    doorMeshes: allDoorMeshes.length,
    furnGroup: furnGroup,
    doorGroup: doorGroup,
    exportInteriors: exportInteriorsSection,
    exportFurniture: exportFurnitureSection
  };
})();
