// TARGET: sheet — the Dilihan vassal-city kit sheet (kits/dilihan/build.py; laid out by kits/iziz-vernacular/src/90-vsheet-scene.js),
// front (+z) toward the camera. Showcases all 24 dil_* red-and-orange kiln-brick passive-cooling buildings across Dwellings,
// Markets and Monsoon Workshops, and Civic and Garrison, followed by Row 4 (Mixed Street - Dilihan and Iziz Vernacular)
// proving plinth, storey, cornice and Iziz-orange harmony across poor, middle, trade, rich and civic tiers.

VERN.interiors = false;
const SHEET = {
  title: 'Dilihan Vassal Building Kit',
  build: 'dilihan',
  ground: 'dirt',
  groundRepeat: 150,
  haze: 0.00055,
  gap: 6,
  owns: function (k) { return /^dil_/.test(k); },
  trades: function () { return dlTradesAudit(); },
  panes: ['vWinClear', 'vWinLit'],
  budget: { showcase: { tris: 4200000, calls: 500 } },
  rows: [
    {
      family: 'Dwellings',
      keys: [
        'dil_house_poor_dogtrot',
        'dil_house_poor_yard',
        'dil_house_mid_courtyard',
        'dil_house_mid_veranda',
        'dil_tenement_windwell',
        'dil_villa_impluvium',
        'dil_manor_breezeway'
      ]
    },
    {
      family: 'Markets and Monsoon Workshops',
      keys: [
        'dil_shop_arcade',
        'dil_bazaar_pavilion',
        'dil_tavern_pergola',
        'dil_inn_courtyard',
        'dil_godown_ventilated',
        'dil_bakery_breezeway',
        'dil_smithy_monitor',
        'dil_brick_pottery',
        'dil_weaver_dyecourt',
        'dil_press_mill',
        'dil_butcher_icehouse',
        'dil_carpenter_yard'
      ]
    },
    {
      family: 'Civic, Garrison and Fortifications',
      keys: [
        'dil_cooling_baths',
        'dil_customs_loggia',
        'dil_guildhall_peristyle',
        'dil_barracks_arcade',
        'dil_shrine_suncourt',
        'dil_wall_seg',
        'dil_wall_tower',
        'dil_wall_corner',
        'dil_wall_gate'
      ],
      gapAfter: 18
    },
    {
      family: 'Mixed Street - Dilihan and Iziz Vernacular',
      keys: [
        { key: 'vern_house_poor_c', label: 'Vernacular Poor House C (Mixed)' },
        { key: 'dil_house_poor_dogtrot', o: { v: 1 }, label: 'Dilihan Dogtrot Cottage (Mixed)' },
        { key: 'vern_house_mid_a', label: 'Vernacular Townhouse A (Mixed)' },
        { key: 'dil_house_mid_courtyard', o: { v: 1 }, label: 'Dilihan Courtyard House (Mixed)' },
        { key: 'vern_shops', label: 'Vernacular Shops (Mixed)' },
        { key: 'dil_shop_arcade', o: { v: 1 }, label: 'Dilihan Arcaded Shophouse (Mixed)' },
        { key: 'vern_weaver', label: 'Vernacular Weaver (Mixed)' },
        { key: 'dil_weaver_dyecourt', o: { v: 1 }, label: 'Dilihan Dyecourt Weaver (Mixed)' },
        { key: 'vern_house_rich_a', label: 'Vernacular Rich House A (Mixed)' },
        { key: 'dil_villa_impluvium', o: { v: 1 }, label: 'Dilihan Impluvium Villa (Mixed)' },
        { key: 'vern_school', label: 'Vernacular School (Mixed)' },
        { key: 'dil_customs_loggia', o: { v: 1 }, label: 'Dilihan Customs Loggia (Mixed)' }
      ]
    }
  ]
};
