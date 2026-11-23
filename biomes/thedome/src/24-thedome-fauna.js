/* ================================================================= THE DOME — endemic bornhardt, vernal-pan & cloud-crown fauna ([G data])
   6 endemic / montane laccolith fauna species (PLAN.md section 5.1; kits/fauna pure [G data] record shape):
     gnammatriops, atentgecko, garlandtragopan, slabklipspringer, moatnewt, cleftswift.
   Zero THREE, zero DOM.
*/
var DOME_FAUNA = (function () {
  'use strict';

  var SPECIES = [
    {
      key: 'gnammatriops',
      name: 'Mirror-Pan Shield-Shrimp',
      clade: 'branchiopod crustacean',
      scaleM: [0.06, 0.11],
      stations: ['apron', 'crown'],
      minHydroperiod01: 0.35,
      diet: 'detritivore-filter',
      yields: ['dried-roe-paste'],
      niche: 'Hatches within 36 hours when rain fills perched gnamma pans, schooling in iridescent bronze flashes before laying drought-proof cysts in rim feldspar grit.',
      schedule: [
        { from: 6, to: 18, state: 'FILTER_PAN' },
        { from: 18, to: 6, state: 'GRAZE_GNAMMAMOSS' }
      ],
      tags: { biome: 'thedome', climate: 'subtropic..montane', aridity: 'subhumid..humid', abyssal: false, riparian: 'yes', diet: 'filter' }
    },
    {
      key: 'atentgecko',
      name: 'Pancake Crevice-Skink',
      clade: 'dorsoventrally flattened granite hexapod-skink',
      scaleM: [0.34, 0.42],
      bodyThicknessM: 0.018,
      stations: ['apron', 'cleft'],
      tapPitchHz: 90.0,
      diet: 'insectivore',
      yields: ['scale-hide', 'small-meat'],
      niche: 'Rib-hinged 1.8 cm-flat body slips into horizontal exfoliation cracks under hollow A-tent buckles and signals mates by tapping belly-plates at 90 Hz into lithophone slabs.',
      schedule: [
        { from: 7, to: 11, state: 'BASK_APRON' },
        { from: 11, to: 16, state: 'SHADE_ATENT' },
        { from: 16, to: 20, state: 'HUNT_PAN_RIM' },
        { from: 20, to: 7, state: 'WEDGED_SLEEP' }
      ],
      tags: { biome: 'thedome', climate: 'subtropic..temperate', aridity: 'subhumid..humid', abyssal: false, riparian: 'no', diet: 'insectivore' }
    },
    {
      key: 'garlandtragopan',
      name: 'Crown-Veil Bell-Pheasant',
      clade: 'iridescent montane galliform',
      scaleM: [0.58, 0.66],
      stations: ['crown', 'apron'],
      callHz: 120.0,
      diet: 'omnivore-seed',
      yields: ['fowl', 'iridescent-plumes'],
      niche: 'Walks concentric cloudgarlandpine contour ribbons under The Crown-Veil cap-cloud, booming a 120 Hz throat-sac note that rings around the amphitheatre risers.',
      schedule: [
        { from: 5, to: 10, state: 'FORAGE_GARLAND' },
        { from: 10, to: 16, state: 'ROOST_CLOUDPINE' },
        { from: 16, to: 20, state: 'DISPLAY_RISER' },
        { from: 20, to: 5, state: 'SLEEP_BOUGH' }
      ],
      tags: { biome: 'thedome', climate: 'temperate..montane', aridity: 'humid', abyssal: false, riparian: 'no', diet: 'omnivore' }
    },
    {
      key: 'slabklipspringer',
      name: 'Porphyry Tip-Hoof Antelope',
      clade: 'rubber-hooved bornhardt ungulate',
      scaleM: [0.74, 0.84],
      stations: ['apron', 'moat', 'crown', 'cleft'],
      maxSlabDeg: 36.0,
      diet: 'herbivore-browser',
      yields: ['venison', 'sinew', 'hide', 'horn'],
      niche: 'Balances on coin-sized cylindrical rubbery hoof-tips gripping 32 deg bare quartz-porphyry slabs and drinking from perched gnamma sky-mirrors.',
      schedule: [
        { from: 5, to: 10, state: 'GRAZE_STEP' },
        { from: 10, to: 16, state: 'STAND_SENTINEL' },
        { from: 16, to: 21, state: 'DRINK_GNAMMA' },
        { from: 21, to: 5, state: 'BED_ARCH' }
      ],
      tags: { biome: 'thedome', climate: 'subtropic..montane', aridity: 'subhumid..humid', abyssal: false, riparian: 'no', diet: 'herbivore' }
    },
    {
      key: 'moatnewt',
      name: 'Fen-Amber Giant Salamander',
      clade: 'annular seepage-fen amphibian',
      scaleM: [0.68, 0.82],
      stations: ['moat'],
      diet: 'carnivore-ambush',
      yields: ['mucilage-salve', 'meat'],
      niche: 'Lurks in cool tannin-gold ring-moat spring channels beneath moatpitcher sedge hummocks and upturned sandstone hogbacks.',
      schedule: [
        { from: 0, to: 8, state: 'PROWL_MOAT' },
        { from: 8, to: 18, state: 'HIDE_SPHAGNUM' },
        { from: 18, to: 24, state: 'AMBUSH_RILL' }
      ],
      tags: { biome: 'thedome', climate: 'subtropic', aridity: 'humid', abyssal: false, riparian: 'yes', diet: 'carnivore' }
    },
    {
      key: 'cleftswift',
      name: 'Kluft Wind-Harrier',
      clade: 'acoustic-gliding raptor',
      scaleM: [0.50, 0.58],
      wingspanM: 1.52,
      stations: ['cleft', 'crown', 'apron', 'moat'],
      diet: 'carnivore-aerial',
      yields: ['feathers'],
      niche: 'Rides laminar radial updrafts from the perimeter moat to the +2,924.8 m crown and nests on wedged chockstones inside 45 m radial Kluft fissures.',
      schedule: [
        { from: 7, to: 19, state: 'SOAR_UPDRAFT' },
        { from: 19, to: 7, state: 'NEST_KLUFT' }
      ],
      tags: { biome: 'thedome', climate: 'subtropic..montane', aridity: 'subhumid..humid', abyssal: false, riparian: 'both', diet: 'carnivore' }
    }
  ];

  var BY_KEY = {};
  for (var i = 0; i < SPECIES.length; i++) BY_KEY[SPECIES[i].key] = SPECIES[i];

  function stateAt(key, hour24, hydroperiod01) {
    var sp = BY_KEY[key];
    if (!sp) return null;
    if (sp.minHydroperiod01 != null && (hydroperiod01 == null ? 0.65 : hydroperiod01) < sp.minHydroperiod01) {
      return 'DORMANT_CYST';
    }
    var h = ((hour24 == null ? 12 : hour24) % 24 + 24) % 24;
    for (var k = 0; k < sp.schedule.length; k++) {
      var s = sp.schedule[k];
      if (s.from < s.to) {
        if (h >= s.from && h < s.to) return s.state;
      } else {
        if (h >= s.from || h < s.to) return s.state;
      }
    }
    return sp.schedule[0].state;
  }

  var api = {
    SPECIES: SPECIES,
    BY_KEY: BY_KEY,
    stateAt: stateAt,
    forStation: function (st) {
      return SPECIES.filter(function (s) { return s.stations.indexOf(st) >= 0; });
    }
  };
  if (typeof DOME_PHYS !== 'undefined') DOME_PHYS.FAUNA = api;
  return api;
})();

if (typeof window !== 'undefined') window.DOME_FAUNA = DOME_FAUNA;
if (typeof module !== 'undefined' && module.exports) module.exports = DOME_FAUNA;
