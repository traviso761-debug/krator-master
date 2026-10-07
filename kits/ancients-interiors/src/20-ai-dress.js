/* ======================== Ancients interiors: the dress ========================
   A recipe names ROLES (a long table, a bench, a hanging lamp); a dress says which catalog piece plays each.
   'ancient' is the arcology as the Ancients fitted it: their moulded benches, refectory runs, consoles, light rings
   and stems, with the deck and harbour fittings and the salvage that fills the gaps. 'occupied' is the same halls as
   the pirates hold them (Noah's Regret): long tables, scrap benches, drop lamps, their loot and banners. A role a dress
   sets to null is left out (the Ancients kept no market stalls on their plaza).
   ====================================================================== */
(function (AI) {
  'use strict';
  const BASE = {
    /* eating */
    table: 'yuni_ancient_refectory_run', bench: 'yuni_ancient_moulded_bench', servery: 'pa_servery', stove: 'yuni_salvage_hearth_hood',
    headTable: 'post-apoc_court_table', chair: 'post-apoc_common_chair', water: 'pa_water_butt', barrel: 'generic_barrel',
    /* light */
    ceilingLamp: 'ancients_light_strip_ring', lampStem: 'yuni_ancient_light_stem', lampStd: 'ancients_lamp_standard',
    /* command and work */
    console: 'yuni_ancient_glass_console', station: 'ancients_workstation', control: 'ancients_control_stand',
    helm: 'post-apoc_court_throne', rack: 'yuni_ancient_socket_rack', cells: 'yuni_ancient_cell_wall',
    workbench: 'pa_vice_bench', toolRack: 'pa_tool_rack', radio: 'pa_radio_sets',
    /* rest and display */
    rug: 'post-apoc_court_carpet', divan: 'post-apoc_court_divan', lowTable: 'post-apoc_court_low_table',
    bookcase: 'post-apoc_common_bookcase', books: 'post-apoc_common_books', desk: 'post-apoc_common_desk',
    statue: 'post-apoc_court_statue', banner: 'post-apoc_court_banner', hanging: 'post-apoc_court_hanging',
    counter: 'post-apoc_common_counter',
    /* stores */
    drums: 'pa_drum_store', drum: 'pa_drum', crate: 'generic_crate', pallet: 'pa_pallet_load', sacks: 'pa_sacks',
    /* the greenhouse and the plaza */
    bed: 'ancients_planting_bed', coldFrame: 'pa_cold_frame', fountain: 'ancients_plaza_fountain', scarecrow: null,
    stall: null, marketTable: null,
    /* deck and harbour */
    bollard: 'ancients_bollard', capstan: 'ancients_capstan', vent: 'ancients_deck_vent', chain: 'ancients_chain_heap',
    anchor: 'ancients_stowed_anchor', netPile: 'pa_net_pile',
    /* drill */
    target: 'pa_archery_target', weaponRack: 'pa_weapon_rack', mannequin: 'pa_armour_mannequin', spears: 'pa_spear_drum'
  };
  AI.DRESS = {
    ancient: Object.assign({}, BASE),
    occupied: Object.assign({}, BASE, {
      table: 'pa_long_table', bench: 'pa_bench', stove: 'pa_brick_grill', ceilingLamp: 'pa_hanging_lamp', lampStem: 'pa_lamp_post',
      banner: 'post-apoc_common_banner', scarecrow: 'pa_scarecrow', stall: 'pa_lean_to_stall', marketTable: 'pa_market_table'
    })
  };
  AI.dress = function (name) {
    const D = AI.DRESS[name || 'ancient'];
    if (!D) throw new Error('ancients-interiors: no dress ' + name);
    return D;
  };
})(KratorAncientsInteriors);
