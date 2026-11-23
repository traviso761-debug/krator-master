/* ======================== Interior set: the Shumari (kits/shumari) ========================
   The interiors of the Shumari kit's buildings (Kingdom of Shumar / Subaru-su, kits/shumari/PLAN.md):
   one item per defBuilding key across src/45-sm-samples.js, 50-52 dwellings, 56 gorge street, 60 cult,
   61 civic, 62 defence, 64 works, 65 trades and 66 farms (59 items: 49 furnished buildings, 10 open/solid skips).
   Local frame = the builders': origin at the plot centre on the ground, +z the front (the door side), metres.
   Every body's `poly` is the outer face of its `smHollowAblaq` walls in plot coordinates (including the
   builder's `W(cx, 0, cz)` offset), `y` the plinth/storey top, and `doors` the entrance portals on `poly`'s edge.
   Furniture culture: `shumari` (kits/catalog/krator-master-furniture-shumari.js: Cadet `-ko`, Hearth `-ra`,
   Sword `-su` and 1.55x `Gedu-su` Free Giant pieces, plus plateau trade stills/looms), chained to `generic` and `scrap`.
   sets/README.md says how an item is written.
   ====================================================================== */
(function (IX) {
  'use strict';
  const SH = IX.sets.shape, rect = SH.rect;
  const POOR = 0.22, MID = 0.52, CIVIC = 0.68, RICH = 0.80, COURT = 0.88;
  const SF = ['single-family dwelling'], MF = ['multi-family dwelling'];
  if (!IX.CULTURE_FAMILY.shumari) IX.CULTURE_FAMILY.shumari = ['generic', 'scrap'];
  const L = [];
  const add = function (it) {
    if (!it.culture) it.culture = 'shumari';
    L.push(it);
    return it;
  };
  const skip = function (key, name, why, types) {
    return add({ key: key, name: name, types: types || ['civic'], skip: why });
  };

  /* ---------------- TOOLKIT SAMPLES (src/45-sm-samples.js) */
  skip('sm_sample_pishtaq', 'Sample Giant pishtaq', 'Phase SM2 toolkit sample piece', ['civic']);
  skip('sm_sample_hearth_bay', 'Sample Hearth mashrabiya bay', 'Phase SM2 toolkit sample piece', SF);

  /* ---------------- POOR & UPLAND DWELLINGS (src/50-sm-dwell-poor.js) */
  add({
    key: 'sm_cadet_cell', name: 'Cadet probationer cell', wealth: POOR, types: SF, lot: [7.4, 8.6],
    bodies: [{
      id: 'cell', poly: rect(5.4, 5.8, 0, -0.4), y: 0.42, levels: [{ h: 3.05 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [0, 2.50], w: 1.24 }], program: ['cottage']
    }],
    note: 'austere dark-basalt Cadet (-ko) cell with slit lancets'
  });
  add({
    key: 'sm_giant_cadet_cell', name: 'Giant cadet cell', wealth: POOR, types: SF, lot: [9.8, 12.0],
    bodies: [{
      id: 'cell', poly: rect(7.4, 8.0, 0, -0.6), y: 0.76, levels: [{ h: 5.45 }], wall: 0.52, roof: 'flat',
      doors: [{ at: [0, 3.40], w: 1.8, swing: 'none' }], program: ['cottage']
    }],
    note: 'high-vaulted dark-basalt Gedu-ko Free Giant candidate cell (4.4 m portal, 5.45 m vault)'
  });
  add({
    key: 'sm_cliff_cot', name: 'Gorge-ledge cottage', wealth: POOR, types: SF, lot: [9.2, 9.8],
    bodies: [{
      id: 'cot', poly: rect(4.4, 6.4, -1.35, -0.45), y: 1.68, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
      doors: [{ at: [0.85, 1.00], w: 1.15 }], program: ['cottage']
    }],
    note: 'the upper basalt cottage on its gorge ledge; the lower slate-and-thatch fuel lean-to is open'
  });
  add({
    key: 'sm_herder_house', name: 'Upland herder house and fold', wealth: POOR, types: SF.concat(['farm']), lot: [11.6, 10.4],
    bodies: [{
      id: 'house', poly: rect(5.8, 7.2, -2.15, -0.3), y: 0.38, levels: [{ h: 3.15 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-2.15, 3.30], w: 1.24 }], program: ['cottage']
    }],
    note: 'the thick-walled upland stone house; the windward dry-stone sheepfold on +x is open'
  });
  add({
    key: 'sm_outlander_lodging', name: 'Outlander caravanner lodging', wealth: POOR, types: MF.concat(['inn']), units: 2, lot: [11.8, 10.6],
    bodies: [
      {
        id: 'common', poly: rect(8.6, 7.0, -0.65, -0.45), y: 0.46, levels: [{ h: 3.25 }], wall: 0.48, roof: 'flat',
        doors: [{ at: [-2.30, 3.05], w: 1.28 }], program: ['tavern', 'store']
      },
      {
        id: 'upper_west', poly: rect(4.3, 6.4, -2.80, -0.45), y: 3.71, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
        doors: [{ at: [-2.50, 2.75], w: 1.15 }], program: ['cottage']
      },
      {
        id: 'upper_east', poly: rect(4.3, 6.4, 1.50, -0.45), y: 3.71, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
        doors: [{ at: [1.20, 2.75], w: 1.15 }], program: ['cottage']
      }
    ],
    note: 'the caravanner common hall below and two flats reached from the upper cedar gallery via the external stone stair'
  });

  /* ---------------- HEARTH-COMMONS MIDDLE DWELLINGS (src/51-sm-dwell-mid.js) */
  add({
    key: 'sm_hearth_house', name: 'Hearth-Commons family house', wealth: MID, types: SF, lot: [10.6, 11.6],
    bodies: [{
      id: 'house', poly: rect(8.0, 8.2, 0, -0.45), y: 0.62, levels: [{ h: 3.45 }, { h: 3.35 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-1.45, 3.65], w: 1.30 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']]
    }],
    note: 'dressed highland basalt family house with upper crimson-lacquered winter gallery'
  });
  add({
    key: 'sm_courtyard_house', name: 'Artisan courtyard house', wealth: MID, types: SF, lot: [13.4, 13.6],
    bodies: [
      {
        id: 'ground_wing', poly: rect(11.2, 5.8, 0, -2.55), y: 0.48, levels: [{ h: 3.35 }], wall: 0.48, roof: 'flat',
        doors: [{ at: [-1.85, 0.35], w: 1.25 }], program: ['living', 'kitchen']
      },
      {
        id: 'upper_wing', poly: rect(11.2, 5.8, 0, -2.55), y: 3.83, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
        doors: [{ at: [2.45, 0.35], w: 1.20 }], program: ['bedroom', 'bedroom']
      }
    ],
    note: 'the two-storey rear wing reached from the walled snowmelt cistern court and its external stone stair'
  });
  add({
    key: 'sm_terrace_house', name: 'Canyon-ledge terrace house', wealth: MID, types: MF, units: 2, lot: [9.4, 11.8],
    bodies: [{
      id: 'tower_house', poly: rect(6.6, 7.8, 0, -0.65), y: 1.25,
      levels: [{ h: 3.15 }, { h: 3.05 }, { h: 2.95 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [0, 3.25], w: 1.28 }], program: [['store'], ['cottage'], ['cottage']]
    }],
    note: 'basalt street cellar below and two stacked family flats above, crowned by a cantilevered winter gallery'
  });
  add({
    key: 'sm_shop_house', name: 'Ablaq shop-house', wealth: MID, types: ['market/shop'].concat(SF), lot: [11.6, 11.4],
    bodies: [
      {
        id: 'shop', poly: rect(8.2, 8.0, -0.55, -0.45), y: 0.52, levels: [{ h: 3.55 }], wall: 0.48, roof: 'flat',
        doors: [{ at: [-2.00, 3.55], w: 1.6, swing: 'none' }], program: ['shop', 'store']
      },
      {
        id: 'flat', poly: rect(8.2, 8.0, -0.55, -0.45), y: 4.07, levels: [{ h: 3.25 }], wall: 0.44, roof: 'flat',
        doors: [{ at: [3.55, 1.20], w: 1.18 }], program: ['living', 'bedroom']
      }
    ],
    note: 'arched ground-floor ablaq shopfront and upper family flat reached by the external side stone stair'
  });

  /* ---------------- SWORD-CASTE & GIANT RICH COMPOUNDS (src/52-sm-dwell-rich.js) */
  add({
    key: 'sm_sword_villa', name: 'Sword-officer domed villa', wealth: RICH, types: SF, lot: [14.6, 16.8],
    bodies: [{
      id: 'villa', poly: rect(11.4, 11.2, 0, -0.85), y: 1.05, levels: [{ h: 5.80 }], wall: 0.50, roof: 'flat',
      doors: [{ at: [0, 4.75], w: 1.8, swing: 'none' }], program: ['living', 'bedroom', 'shrine']
    }],
    note: 'domed qa’a reception hall, bedchamber and crimson-lacquer ancestor blade-shrine'
  });
  add({
    key: 'sm_captain_bayt', name: 'Regiment captain bayt compound', wealth: RICH, types: MF, units: 2, lot: [18.2, 18.6],
    bodies: [
      {
        id: 'reception', poly: rect(12.2, 6.4, -1.65, -5.00), y: 0.92, levels: [{ h: 5.65 }], wall: 0.50, roof: 'flat',
        doors: [{ at: [-1.65, -1.80], w: 1.8, swing: 'none' }], program: ['living', 'bedroom']
      },
      {
        id: 'shrine_wing', poly: rect(5.4, 5.9, 5.15, 1.15), y: 0.92, levels: [{ h: 5.65 }], wall: 0.48, roof: 'flat',
        doors: [{ at: [5.15, 4.10], w: 1.8, swing: 'none' }], program: ['cottage']
      }
    ],
    note: 'the rear reception iwan hall and the east domed wing around the paved snowmelt court'
  });
  add({
    key: 'sm_giant_sword_hall', name: 'Gedu-su Free Giant sword hall', wealth: COURT, types: SF, lot: [16.4, 16.8],
    bodies: [{
      id: 'great_hall', poly: rect(13.6, 10.6, 0, -1.70), y: 1.15, levels: [{ h: 6.25 }], wall: 0.54, roof: 'flat',
      doors: [{ at: [0, 3.60], w: 2.0, swing: 'none' }], program: ['living', 'bedroom', 'shrine']
    }],
    note: 'the 6.25 m vaulted Free Giant hall behind its three-bay ablaq loggia arcade'
  });
  add({
    key: 'sm_rim_pavilion', name: 'Gorge-rim belvedere pavilion', wealth: COURT, types: ['dwelling-single'], residence: false, lot: [12.4, 14.2],
    bodies: [{
      id: 'belvedere', poly: rect(8.6, 8.8, 0, -0.65), y: 1.20, levels: [{ h: 5.35 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [0, 3.75], w: 1.8, swing: 'none' }], program: ['audience']
    }],
    note: 'a domed canyon-rim day belvedere pavilion: not a full household'
  });

  /* ---------------- STEPPED GORGE-RIM STREET ENSEMBLE (src/56-sm-gorge-street.js) */
  add({
    key: 'sm_gorge_street', name: 'Stepped gorge-rim street ensemble', wealth: RICH, types: ['infrastructure', 'civic'], lot: [22.4, 19.6],
    bodies: [
      {
        id: 'west_hearth_house', poly: rect(7.0, 12.8, -6.65, 0.35), y: 0.68, levels: [{ h: 3.55 }, { h: 3.35 }],
        wall: 0.48, roof: 'flat', wealth: MID,
        doors: [{ at: [-3.15, -1.30], w: 1.26 }], program: [['living', 'kitchen'], ['bedroom', 'bedroom']]
      },
      {
        id: 'east_street_qubba', poly: rect(7.8, 12.6, 6.85, -1.15), y: 1.48, levels: [{ h: 6.05 }],
        wall: 0.50, roof: 'flat', wealth: RICH,
        doors: [{ at: [2.95, -3.00], w: 1.8, swing: 'none' }], program: ['shrine']
      }
    ],
    note: 'the two-storey Hearth house on -x and the domed regimental qubba on +x flanking the stepped basalt street canyon'
  });

  /* ---------------- REGIMENTAL & ANCESTOR MONUMENTS (src/60-sm-cult.js) */
  add({
    key: 'sm_regiment_qubba', name: 'Regimental qubba', wealth: RICH, types: ['religious', 'funerary'], lot: [14.2, 17.2],
    bodies: [{
      id: 'qubba', poly: rect(10.4, 10.4, 0, -1.0), y: 1.20, levels: [{ h: 5.80 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [0, 4.20], w: 1.8, swing: 'none' }], program: ['shrine']
    }],
    note: 'both v=0 (right-handed spiral dome) and v=1 (star-carved dome) share the 10.4 m square mausoleum chamber'
  });
  skip('sm_doriyan_stele', 'Doriyan mirror cenotaph', 'open four-arch canopy pavilion over three NW-angled basalt impactite steles', ['religious', 'funerary', 'statue']);
  add({
    key: 'sm_hall_of_blades', name: 'Twin-domed Hall of Blades', wealth: RICH, types: ['religious', 'funerary'], lot: [24.8, 18.6],
    bodies: [{
      id: 'waqf', poly: rect(21.4, 12.4, 0, -0.85), y: 1.15, levels: [{ h: 6.15 }], wall: 0.52, roof: 'flat',
      doors: [{ at: [0, 5.35], w: 2.0, swing: 'none' }], program: ['lobby', 'shrine', 'shrine']
    }],
    note: 'central ablution vestibule flanked by the human and Gedu-su Free Giant regimental blade sanctuaries'
  });
  add({
    key: 'sm_sabil_shrine', name: 'Sabil snowmelt fountain and kuttab', wealth: RICH, types: ['religious', 'fountain'], lot: [12.6, 15.0],
    bodies: [{
      id: 'sabil', poly: rect(9.6, 9.8, 0, -0.65), y: 0.92, levels: [{ h: 5.45 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-1.95, 4.25], w: 1.8, swing: 'none' }], program: ['shrine', 'store']
    }],
    note: 'the domed street-corner shrine and snowmelt cistern hall; the upper crimson kuttab loggia is open'
  });
  skip('sm_ordeal_gate', 'Ordeal initiation gate', 'through-passage initiation gate astride the Urudiru trial ramp', ['religious', 'military']);
  skip('sm_wayside_cairn', 'Wayside ablaq blade cairn', 'solid roadside stepped ablaq blade-pillar and lamp niche', ['religious', 'statue']);

  /* ---------------- CIVIC & STATE BUILDINGS (src/61-sm-civic.js) */
  add({
    key: 'sm_diwan_hall', name: 'Diwan council hall of the Subaru-su', wealth: COURT, types: ['civic'], lot: [18.8, 20.4],
    bodies: [{
      id: 'diwan', poly: rect(15.2, 14.8, 0, -0.95), y: 1.25, levels: [{ h: 6.35 }], wall: 0.54, roof: 'flat',
      doors: [{ at: [0, 6.45], w: 2.0, swing: 'none' }], program: ['audience', 'committee']
    }],
    note: 'the domed council chamber of the Subaru-su'
  });
  add({
    key: 'sm_kattu_chancery', name: 'Sumaru-kattu chancery and registry', wealth: CIVIC, types: ['civic'], lot: [16.2, 16.2],
    bodies: [{
      id: 'chancery', poly: rect(13.2, 11.2, 0, -0.75), y: 0.96, levels: [{ h: 5.65 }], wall: 0.50, roof: 'flat',
      doors: [{ at: [0, 4.85], w: 1.8, swing: 'none' }], program: ['study', 'library', 'study']
    }],
    note: 'the cuneiform scriptorium and regimental roll archive'
  });
  add({
    key: 'sm_wikala_caravanserai', name: 'Wikala customs caravanserai', wealth: MID, types: ['inn', 'market', 'civic'], lot: [22.4, 21.6],
    bodies: [
      {
        id: 'rear_hall', poly: rect(18.4, 4.3, 0, -7.30), y: 0.72, levels: [{ h: 5.45 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [0, -5.15], w: 1.6, swing: 'none' }], program: ['tavern', 'store', 'study']
      },
      {
        id: 'west_range', poly: rect(4.4, 8.8, -7.60, -0.55), y: 0.72, levels: [{ h: 5.45 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [-5.40, -0.55], w: 1.3 }], program: ['dormitory']
      },
      {
        id: 'east_range', poly: rect(4.4, 8.8, 7.60, -0.55), y: 0.72, levels: [{ h: 5.45 }], wall: 0.45, roof: 'flat',
        doors: [{ at: [5.40, -0.55], w: 1.3 }], program: ['store']
      }
    ],
    note: 'the customs weighing hall, caravanner dormitory and bonded store around the open cobbled pack-court'
  });
  add({
    key: 'sm_hammam', name: 'Pierced-dome Mamluk hammam', wealth: MID, types: ['civic'], lot: [16.8, 16.4],
    bodies: [{
      id: 'hammam', poly: rect(13.8, 12.6, 0, -0.65), y: 0.76, levels: [{ h: 5.45 }], wall: 0.56, roof: 'flat',
      windows: false, doors: [{ at: [-2.85, 5.65], w: 1.8, swing: 'none' }], program: ['lobby', 'gallery']
    }],
    note: 'changing maslakh vestibule and vaulted steam-bench halls under pierced bathLens domes'
  });
  add({
    key: 'sm_bimaristan', name: 'Regimental bimaristan hospital', wealth: CIVIC, types: ['civic'], lot: [18.4, 19.0],
    bodies: [{
      id: 'bimaristan', poly: rect(15.4, 13.8, 0, -0.65), y: 0.88, levels: [{ h: 5.55 }], wall: 0.50, roof: 'flat',
      doors: [{ at: [0, 6.25], w: 1.8, swing: 'none' }], program: ['lobby', 'dormitory', 'dormitory', 'store']
    }],
    note: 'reception court, twin regimental wards and apothecary store'
  });
  add({
    key: 'sm_state_granary', name: 'Citadel vaulted state granary', wealth: MID, types: ['civic', 'infrastructure'], lot: [16.6, 16.0],
    bodies: [{
      id: 'granary', poly: rect(13.4, 10.4, 0, -0.65), y: 0.95, levels: [{ h: 5.85 }], wall: 0.58, roof: 'flat',
      windows: false, doors: [{ at: [0, 4.55], w: 1.8, swing: 'none' }], program: ['magazine', 'store']
    }],
    note: 'buttressed basalt grain and dried-apricot vaults'
  });
  skip('sm_cistern_hall', 'Vaulted snowmelt cistern hall', 'sunken snowmelt reservoir basin and bronze bucket-wheel filling the chamber', ['civic', 'infrastructure', 'fountain']);
  add({
    key: 'sm_envoy_house', name: 'Guarded envoy embassy residence', wealth: RICH, types: ['civic'].concat(MF), units: 2, lot: [15.4, 17.6],
    bodies: [{
      id: 'embassy', poly: rect(12.2, 11.6, 0, -0.65), y: 0.92, levels: [{ h: 5.55 }], wall: 0.50, roof: 'flat',
      doors: [{ at: [0, 5.15], w: 1.8, swing: 'none' }], program: ['living', 'kitchen', 'bedroom', 'bedroom']
    }],
    note: 'reception hall, kitchen and twin diplomatic suites in the outer -no ward'
  });

  /* ---------------- CITADEL & GORGE DEFENCE (src/62-sm-defence.js) */
  add({
    key: 'sm_citadel_keep', name: 'Dark-basalt citadel keep', wealth: RICH, types: ['military', 'civic'], lot: [19.6, 22.0],
    bodies: [{
      id: 'keep', poly: rect(14.8, 14.4, 0, -0.95), y: 1.45, levels: [{ h: 6.65 }], wall: 0.64, roof: 'flat',
      doors: [{ at: [0, 6.25], w: 1.8, swing: 'none' }], program: ['war_room', 'guard', 'armoury']
    }],
    note: 'command war-hall, guardroom and arsenal inside the battered basalt keep; corner bastions are solid'
  });
  skip('sm_curtain_wall', 'Battered basalt curtain wall', 'fortification rampart walk and sally-port passage', ['military', 'infrastructure']);
  skip('sm_pishtaq_gate', 'Twin-turret ablaq fortress gatehouse', 'through-passage fortress gatehouse and solid flanking drum-turrets', ['military', 'infrastructure']);
  add({
    key: 'sm_payaru_tower', name: 'Payaru polygonal watch-minaret', wealth: CIVIC, types: ['military'], lot: [11.6, 13.4],
    bodies: [{
      id: 'guard_base', poly: rect(7.8, 7.8, 0, -0.55), y: 0.92, levels: [{ h: 5.65 }], wall: 0.52, roof: 'flat',
      doors: [{ at: [0, 3.35], w: 1.8, swing: 'none' }], program: ['guard']
    }],
    note: 'the square Giant guardhouse base; the octagonal minaret shaft and signal brazier above are solid'
  });
  add({
    key: 'sm_regiment_barracks', name: 'Regimental tuppu barracks', wealth: MID, types: ['military'].concat(MF), units: 1, lot: [19.2, 17.2],
    bodies: [{
      id: 'barracks', poly: rect(16.2, 11.6, 0, -0.65), y: 0.84, levels: [{ h: 5.65 }], wall: 0.52, roof: 'flat',
      doors: [{ at: [0, 5.15], w: 1.8, swing: 'none' }], program: ['barracks', 'kitchen', 'dormitory']
    }],
    note: 'regimental tuppu muster barracks, mess kitchen and Giant/human dormitories'
  });
  skip('sm_ordeal_yard', 'Urudiru ordeal and drill yard', 'open sand-and-basalt drill arena and open viewing iwan', ['military']);
  add({
    key: 'sm_armoury', name: 'Vaulted citadel armoury and magazine', wealth: CIVIC, types: ['military', 'industry'], lot: [15.2, 15.6],
    bodies: [{
      id: 'armoury', poly: rect(12.0, 10.0, 0, -0.55), y: 0.88, levels: [{ h: 5.45 }], wall: 0.64, roof: 'flat',
      windows: false, doors: [{ at: [0, 4.45], w: 1.8, swing: 'none' }], program: ['armoury', 'magazine']
    }],
    note: 'iron-barred arsenal and saltpeter powder magazine'
  });
  skip('sm_gorge_bridge_tower', 'Gorge bridgehead and ferry toll-tower', 'canyon bridge deck and open through-arch toll vault', ['military', 'infrastructure']);

  /* ---------------- EXTRACTIVE WORKS & HEAVY CRAFTS (src/64-sm-works.js) */
  add({
    key: 'sm_blade_smithy', name: 'Watered-steel blade smithy', wealth: MID, types: ['industry', 'shop'], lot: [12.8, 12.4],
    bodies: [{
      id: 'smithy', poly: rect(10.0, 8.6, 0, -0.35), y: 0.44, levels: [{ h: 3.85 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-1.85, 3.95], w: 1.35 }], program: ['smithy', 'store']
    }],
    note: 'double-forge watered-steel blade smithy and bar-iron store'
  });
  add({
    key: 'sm_saltpeter_works', name: 'Saltpeter and sulfur leaching works', wealth: MID, types: ['industry'], lot: [13.4, 12.2],
    bodies: [{
      id: 'refinery', poly: rect(5.8, 7.8, -2.55, -0.65), y: 0.38, levels: [{ h: 3.45 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-2.55, 3.25], w: 1.25 }], program: ['workshop', 'store']
    }],
    note: 'the ventilated powder-drying and refining house; the stone leaching vats and cauldron on +x are open'
  });
  add({
    key: 'sm_lacquer_inlay_shop', name: 'Crimson-lacquer and damascene shop', wealth: MID, types: ['shop', 'industry'], lot: [10.8, 10.8],
    bodies: [{
      id: 'shop', poly: rect(8.2, 7.8, 0, -0.45), y: 0.48, levels: [{ h: 3.55 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-1.55, 3.45], w: 1.28 }], program: ['shop', 'workshop']
    }],
    note: 'scabbard showroom and crimson-lacquer/gold-inlay curing bench'
  });
  add({
    key: 'sm_stonecutters_yard', name: 'Ablaq stonecutters and dome-carving yard', wealth: MID, types: ['industry'], lot: [14.2, 12.6],
    bodies: [{
      id: 'lodge', poly: rect(5.4, 7.6, -3.15, -0.85), y: 0.36, levels: [{ h: 3.35 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-3.15, 2.95], w: 1.25 }], program: ['workshop']
    }],
    note: 'the master mason’s template lodge; the A-frame hoist crane and stone-dressing yard on +x are open'
  });
  add({
    key: 'sm_mine_head', name: 'Canyon adit mine-head and grizzly', wealth: POOR, types: ['industry'], lot: [13.8, 12.8],
    bodies: [{
      id: 'assay_hut', poly: rect(5.2, 6.4, -2.95, 0.65), y: 0.42, levels: [{ h: 3.20 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-2.95, 3.85], w: 1.22 }], program: ['workshop']
    }],
    note: 'the assay and tally hut; the gated adit collar, headframe and ore grizzly are outdoor'
  });
  add({
    key: 'sm_salt_evaporator', name: 'Terraced brine pans and salt-boiling house', wealth: MID, types: ['industry'], lot: [14.4, 12.4],
    bodies: [{
      id: 'boiling_house', poly: rect(5.2, 8.0, -3.35, -0.55), y: 0.36, levels: [{ h: 3.35 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-3.35, 3.45], w: 1.22 }], program: ['store']
    }],
    note: 'the flued salt-boiling and basket storehouse; the terraced solar brine pans on +x are open'
  });
  add({
    key: 'sm_charcoal_kiln', name: 'Stone beehive charcoal clamps and cordwood yard', wealth: POOR, types: ['industry'], lot: [14.2, 12.4],
    bodies: [{
      id: 'burner_hut', poly: rect(4.4, 5.8, -3.65, 0.85), y: 0.34, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
      doors: [{ at: [-3.65, 3.75], w: 1.18 }], program: ['store']
    }],
    note: 'the soot-burner’s tally and tool hut; the stone beehive clamps and cordwood stacks are outdoor'
  });
  add({
    key: 'sm_placer_sluice', name: 'Canyon placer-gold sluice and assay race', wealth: POOR, types: ['industry'], lot: [14.4, 12.2],
    bodies: [{
      id: 'assay_shed', poly: rect(4.6, 6.2, -3.55, 0.65), y: 0.36, levels: [{ h: 3.05 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-3.55, 3.75], w: 1.20 }], program: ['study']
    }],
    note: 'the locked gold-weighing assay shed; the basalt head-race and riffled timber sluices are open'
  });

  /* ---------------- TOWN TRADES, DISTILLERY & LAKE JETTY (src/65-sm-trades.js) */
  add({
    key: 'sm_bakery', name: 'Domed basalt tannur bakery', wealth: MID, types: ['shop', 'industry'], lot: [10.8, 10.8],
    bodies: [{
      id: 'bakery', poly: rect(8.2, 7.8, 0, -0.45), y: 0.46, levels: [{ h: 3.45 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-1.55, 3.45], w: 1.25 }], program: ['shop', 'kitchen']
    }],
    note: 'warm bread counter and domed basalt tannur oven room'
  });
  add({
    key: 'sm_butcher', name: 'Cold-stone butcher and jerky loft', wealth: MID, types: ['shop'], lot: [10.6, 10.8],
    bodies: [{
      id: 'butcher', poly: rect(8.0, 7.8, 0, -0.45), y: 0.48, levels: [{ h: 3.45 }], wall: 0.50, roof: 'flat',
      doors: [{ at: [-1.45, 3.45], w: 1.25 }], program: ['shop', 'store']
    }],
    note: 'the cold-stone ground carcass hall; the slatted wind-drying basturma loft above is unfloored for walk'
  });
  add({
    key: 'sm_weaver_dyer', name: 'Kilim weaver and crimson dye-vats', wealth: MID, types: ['industry', 'shop'], lot: [13.8, 13.0],
    bodies: [{
      id: 'loom_hall', poly: rect(6.0, 8.2, -2.75, -0.45), y: 0.42, levels: [{ h: 3.45 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-2.75, 3.65], w: 1.25 }], program: ['workshop']
    }],
    note: 'the sunlit kilim loom house; the sunken stone dye-vats and drying rack on +x are open'
  });
  add({
    key: 'sm_tannery', name: 'Shagreen leather and scabbard tannery', wealth: POOR, types: ['industry'], lot: [13.6, 12.0],
    bodies: [{
      id: 'currier', poly: rect(5.8, 8.0, -2.75, -0.45), y: 0.38, levels: [{ h: 3.35 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-2.75, 3.55], w: 1.22 }], program: ['workshop', 'store']
    }],
    note: 'the currier’s shagreen workshop; the lime and oak-gall pits on +x are open'
  });
  add({
    key: 'sm_brewery_teahouse', name: 'Boza brewhouse and samovar teahouse', wealth: MID, types: ['tavern', 'inn'], lot: [13.6, 13.4],
    bodies: [{
      id: 'teahouse', poly: rect(10.8, 9.8, 0, -0.55), y: 0.56, levels: [{ h: 3.85 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [0, 4.35], w: 1.35 }], program: ['tavern', 'kitchen']
    }],
    note: 'carved-dome samovar tea salon and millet-boza brewhouse'
  });
  add({
    key: 'sm_bazaar_hall', name: 'Qaysariyya vaulted stone bazaar hall', wealth: MID, types: ['market', 'shop'], lot: [16.8, 12.6],
    bodies: [{
      id: 'bazaar', poly: rect(14.2, 9.2, 0, -0.35), y: 0.48, levels: [{ h: 4.05 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [0, 4.25], w: 1.45 }], program: ['shop', 'shop', 'store']
    }],
    note: 'vaulted qaysariyya stalls and bonded back-store'
  });
  add({
    key: 'sm_spirits_still', name: 'Sunu-sikaru twin copper-dome spirits still', wealth: MID, types: ['industry', 'shop'], lot: [14.4, 12.6],
    bodies: [{
      id: 'still_house', poly: rect(6.0, 8.4, -2.95, -0.45), y: 0.44, levels: [{ h: 3.65 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-2.95, 3.75], w: 1.28 }], program: ['workshop', 'store']
    }],
    note: 'the cool basalt aging and bottling house; the twin copper-dome alembics and aloe roasting pit stand in the east court'
  });
  add({
    key: 'sm_lake_jetty', name: 'Siru-Yamu basalt lake jetty and trout-smoking quay', wealth: MID, types: ['infrastructure', 'market'], lot: [15.2, 13.6],
    bodies: [{
      id: 'quay_shed', poly: rect(5.2, 6.4, -3.55, 1.00), y: 0.72, levels: [{ h: 3.25 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-3.55, 4.20], w: 1.24 }], program: ['store']
    }],
    note: 'the basalt quaymaster and trout-curing shed; the tarred-pine skiff slipway and drying rack are open'
  });

  /* ---------------- HIGHLAND FARMS, ORCHARDS & WATERMILL (src/66-sm-farms.js) */
  add({
    key: 'sm_watermill', name: 'Snowmelt canyon-chute watermill', wealth: MID, types: ['industry', 'farm'], lot: [13.6, 11.8],
    bodies: [{
      id: 'millhouse', poly: rect(8.6, 8.0, -0.85, -0.35), y: 0.48, levels: [{ h: 3.65 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-2.30, 3.65], w: 1.30 }], program: ['workshop', 'store']
    }],
    note: 'the basalt millhouse; the stone aqueduct flume and overshot wheel stand on +x'
  });
  add({
    key: 'sm_apricot_orchard', name: 'Terraced twist-apricot orchard and kernel press', wealth: MID, types: ['farm'], lot: [15.2, 13.4],
    bodies: [{
      id: 'press_shed', poly: rect(5.0, 7.4, -3.85, 0.55), y: 0.36, levels: [{ h: 3.15 }], wall: 0.46, roof: 'flat',
      doors: [{ at: [-3.85, 4.25], w: 1.22 }], program: ['workshop', 'store']
    }],
    note: 'the apricot-kernel oil press and drying shed; the terraced twist-apricot orchard on +x is open'
  });
  add({
    key: 'sm_terrace_farm', name: 'Dry-stone millet terrace farm and threshing floor', wealth: POOR, types: ['farm'], lot: [15.6, 13.6],
    bodies: [{
      id: 'seed_house', poly: rect(4.6, 5.8, -4.15, 1.65), y: 0.34, levels: [{ h: 3.05 }], wall: 0.44, roof: 'flat',
      doors: [{ at: [-4.15, 4.55], w: 1.20 }], program: ['store']
    }],
    note: 'the seed and ploughshare storehouse; the flagstone threshing floor and stepped grain benches are open'
  });
  add({
    key: 'sm_fungus_cellar', name: 'Barrel-vaulted dark fungus cellar', wealth: POOR, types: ['farm'], lot: [11.6, 11.8],
    bodies: [{
      id: 'cellar', poly: rect(8.6, 8.2, 0, -0.35), y: 0.34, levels: [{ h: 2.85 }], wall: 0.54, roof: 'flat',
      windows: false, doors: [{ at: [0, 3.75], w: 1.24 }], program: ['store', 'store']
    }],
    note: 'earth-bermed windowless basalt vault for dark-grown alecap and pale fungi'
  });
  add({
    key: 'sm_stock_fold', name: 'Highland pack-mule and sheep stock-fold', wealth: POOR, types: ['farm'], lot: [14.6, 13.2],
    bodies: [{
      id: 'dairy_byre', poly: rect(12.2, 5.4, 0, -2.35), y: 0.36, levels: [{ h: 3.25 }], wall: 0.48, roof: 'flat',
      doors: [{ at: [-2.85, 0.35], w: 1.28 }], program: ['stable', 'store']
    }],
    note: 'the roofed winter byre and highland sheep-cheese dairy; the walled basalt corral in front is open'
  });

  IX.sets.add({ set: 'shumari', title: 'The Shumari (Kingdom of Shumar)', culture: 'shumari', items: L });
})(KratorInteriors);
