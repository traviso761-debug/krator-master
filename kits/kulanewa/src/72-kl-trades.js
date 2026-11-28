// prefix: kl
// ================================================================= THE TRADES: Voth city census coverage across all three Kulanewa styles ([G data])
// Engine-neutral data and pure functions (no THREE, no DOM):
//   KL_TRADES          all 44 Voth census trades mapped to Karum (karum: kl_karum_*), Ikki (ikki: kl_ikki_*) and Suudme (suudme: kl_suudme_*) defs
//   klTradeDefs(style) returns {trade -> [defKeys...]} for 'karum', 'ikki' or 'suudme'
const KL_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',karum:['kl_karum_mill_bridge','kl_karum_kura_granary'],ikki:['kl_ikki_covered_weir','kl_ikki_mujinzo_vault'],suudme:['kl_suudme_ziggurat_granary','kl_suudme_covered_bazaar']},
 {trade:'butchers',voth:'voth_bldg_butcher',karum:['kl_karum_mill_bridge','kl_karum_silk_exchange'],ikki:['kl_ikki_covered_weir','kl_ikki_pack_depot'],suudme:['kl_suudme_covered_bazaar','kl_suudme_caravanserai']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',karum:['kl_karum_silk_exchange','kl_karum_sanjhya_shophouse'],ikki:['kl_ikki_smith_shophouse','kl_ikki_commune_row'],suudme:['kl_suudme_silk_dyeworks','kl_suudme_sanjhya_villa']},
 {trade:'brewers',voth:'voth_bldg_brewery',karum:['kl_karum_caravanserai','kl_karum_guild_thermae'],ikki:['kl_ikki_debtor_cloister','kl_ikki_pack_depot'],suudme:['kl_suudme_caravanserai','kl_suudme_sauna_thermae']},
 {trade:'tanners',voth:'voth_bldg_tannery',karum:['kl_karum_glaze_pottery','kl_karum_caravanserai'],ikki:['kl_ikki_timber_sawmill','kl_ikki_pack_depot'],suudme:['kl_suudme_silk_dyeworks','kl_suudme_caravanserai']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',karum:['kl_karum_crane_quay','kl_karum_chain_boom'],ikki:['kl_ikki_timber_sawmill','kl_ikki_covered_weir'],suudme:['kl_suudme_tidal_wharf','kl_suudme_pontoon_factor','kl_suudme_paktong_braziery']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',karum:['kl_karum_caravanserai','kl_karum_guild_thermae'],ikki:['kl_ikki_pack_depot','kl_ikki_debtor_cloister'],suudme:['kl_suudme_caravanserai','kl_suudme_sauna_thermae']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',karum:['kl_karum_mercenary_keep','kl_karum_chain_boom','kl_karum_watch_frustum'],ikki:['kl_ikki_drum_gate','kl_ikki_moat_bastion','kl_ikki_pavise_armoury'],suudme:['kl_suudme_strategion_keep','kl_suudme_ishtar_watergate','kl_suudme_beacon_frustum']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',karum:['kl_karum_chain_boom','kl_karum_watch_frustum','kl_karum_crane_quay'],ikki:['kl_ikki_drum_gate','kl_ikki_moat_bastion','kl_ikki_covered_weir'],suudme:['kl_suudme_ishtar_watergate','kl_suudme_beacon_frustum','kl_suudme_tidal_wharf']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',karum:['kl_karum_clearing_hall','kl_karum_guild_thermae'],ikki:['kl_ikki_covenant_citadel','kl_ikki_debtor_cloister','kl_ikki_mujinzo_vault'],suudme:['kl_suudme_uktena_bell_shrine','kl_suudme_sauna_thermae']},
 {trade:'shrine keepers',voth:'village shrine',karum:['kl_karum_clearing_hall','kl_karum_banker_mansion'],ikki:['kl_ikki_covenant_citadel','kl_ikki_elder_manor','kl_ikki_debtor_cloister'],suudme:['kl_suudme_uktena_bell_shrine','kl_suudme_mandarin_court']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',karum:['kl_karum_sanjhya_shophouse','kl_karum_silk_exchange','kl_karum_mill_bridge'],ikki:['kl_ikki_smith_shophouse','kl_ikki_covered_weir','kl_ikki_quarry_mason'],suudme:['kl_suudme_sanjhya_villa','kl_suudme_covered_bazaar','kl_suudme_compass_atelier']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',karum:['kl_karum_paktong_mint','kl_karum_glaze_pottery','kl_karum_amber_press'],ikki:['kl_ikki_hydro_forge','kl_ikki_bell_foundry','kl_ikki_smith_shophouse'],suudme:['kl_suudme_paktong_braziery','kl_suudme_compass_atelier','kl_suudme_glaze_kilnworks']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',karum:['kl_karum_caravanserai','kl_karum_guild_thermae'],ikki:['kl_ikki_debtor_cloister','kl_ikki_pack_depot'],suudme:['kl_suudme_caravanserai','kl_suudme_sauna_thermae']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',karum:['kl_karum_crane_quay','kl_karum_kura_granary','kl_karum_porter_tenement'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_pack_depot','kl_ikki_foundry_tenement'],suudme:['kl_suudme_tidal_wharf','kl_suudme_ziggurat_granary','kl_suudme_quay_tenement']},
 {trade:'industrial workers',voth:'industrial lot',karum:['kl_karum_paktong_mint','kl_karum_amber_press','kl_karum_glaze_pottery'],ikki:['kl_ikki_hydro_forge','kl_ikki_bell_foundry','kl_ikki_coke_kiln','kl_ikki_timber_sawmill'],suudme:['kl_suudme_paktong_braziery','kl_suudme_glaze_kilnworks','kl_suudme_compass_atelier','kl_suudme_silk_dyeworks']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'pre-electric Arcflow free-towns; undershot river-wheels, mill-weirs and coke blast-bellows drive the works'},
 {trade:'household service',voth:'rich house, manor, clan compound',karum:['kl_karum_banker_mansion','kl_karum_syndicate_court','kl_karum_grand_bank'],ikki:['kl_ikki_elder_manor','kl_ikki_brotherhood_hall','kl_ikki_covenant_citadel'],suudme:['kl_suudme_mandarin_court','kl_suudme_patrician_palazzo','kl_suudme_amber_bourse']},
 {trade:'soldiers',voth:'voth_barracks',karum:['kl_karum_mercenary_keep','kl_karum_chain_boom','kl_karum_watch_frustum'],ikki:['kl_ikki_pavise_armoury','kl_ikki_drum_gate','kl_ikki_moat_bastion','kl_ikki_covenant_citadel'],suudme:['kl_suudme_strategion_keep','kl_suudme_ishtar_watergate','kl_suudme_beacon_frustum']},
 {trade:'teachers and scholars',voth:'voth_school',karum:['kl_karum_amber_press','kl_karum_clearing_hall','kl_karum_treaty_factor'],ikki:['kl_ikki_otona_hall','kl_ikki_debtor_cloister','kl_ikki_covenant_citadel'],suudme:['kl_suudme_compass_atelier','kl_suudme_amber_bourse','kl_suudme_pontoon_factor']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',karum:['kl_karum_grand_bank','kl_karum_clearing_hall','kl_karum_clerk_insula'],ikki:['kl_ikki_otona_hall','kl_ikki_mujinzo_vault','kl_ikki_brotherhood_hall'],suudme:['kl_suudme_amber_bourse','kl_suudme_pontoon_factor','kl_suudme_arcade_insula']},
 {trade:'customs officers and clerks',voth:'customs house',karum:['kl_karum_treaty_factor','kl_karum_chain_boom','kl_karum_crane_quay'],ikki:['kl_ikki_drum_gate','kl_ikki_covered_weir','kl_ikki_pack_depot'],suudme:['kl_suudme_pontoon_factor','kl_suudme_ishtar_watergate','kl_suudme_tidal_wharf']},
 {trade:'healers and nurses',voth:'house of healing',karum:['kl_karum_guild_thermae','kl_karum_syndicate_court'],ikki:['kl_ikki_infirmary_bath','kl_ikki_debtor_cloister'],suudme:['kl_suudme_sauna_thermae','kl_suudme_mandarin_court']},
 {trade:'priests and undertakers',voth:'funerary temple',karum:['kl_karum_clearing_hall','kl_karum_treaty_factor'],ikki:['kl_ikki_covenant_citadel','kl_ikki_debtor_cloister','kl_ikki_infirmary_bath'],suudme:['kl_suudme_uktena_bell_shrine','kl_suudme_sauna_thermae']},
 {trade:'lighthouse keepers',voth:'lighthouse',karum:['kl_karum_watch_frustum','kl_karum_chain_boom'],ikki:['kl_ikki_moat_bastion','kl_ikki_drum_gate'],suudme:['kl_suudme_beacon_frustum','kl_suudme_ishtar_watergate']},
 {trade:'dockers and stevedores',voth:'harbour pier',karum:['kl_karum_crane_quay','kl_karum_porter_tenement','kl_karum_chain_boom'],ikki:['kl_ikki_covered_weir','kl_ikki_timber_sawmill','kl_ikki_pack_depot'],suudme:['kl_suudme_tidal_wharf','kl_suudme_quay_tenement','kl_suudme_pontoon_factor']},
 {trade:'river bargemen and quay hands',voth:'river quay',karum:['kl_karum_crane_quay','kl_karum_trestle_cottage','kl_karum_mill_bridge'],ikki:['kl_ikki_covered_weir','kl_ikki_timber_sawmill','kl_ikki_drum_gate'],suudme:['kl_suudme_tidal_wharf','kl_suudme_trestle_cottage','kl_suudme_pontoon_factor']},
 {trade:'fishers',voth:'fishing dock',karum:['kl_karum_trestle_cottage','kl_karum_crane_quay'],ikki:['kl_ikki_covered_weir','kl_ikki_smelter_hut'],suudme:['kl_suudme_trestle_cottage','kl_suudme_tidal_wharf']},
 {trade:'market traders',voth:'market stall',karum:['kl_karum_silk_exchange','kl_karum_mill_bridge','kl_karum_sanjhya_shophouse'],ikki:['kl_ikki_covered_weir','kl_ikki_smith_shophouse','kl_ikki_mujinzo_vault'],suudme:['kl_suudme_covered_bazaar','kl_suudme_pontoon_factor','kl_suudme_sanjhya_villa']},
 {trade:'farmhands and ploughmen',voth:'fields',karum:['kl_karum_kura_granary','kl_karum_trestle_cottage'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_smelter_hut'],suudme:['kl_suudme_ziggurat_granary','kl_suudme_trestle_cottage']},
 {trade:'chinampa growers',voth:'chinampa bed',karum:['kl_karum_trestle_cottage','kl_karum_kura_granary'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_infirmary_bath'],suudme:['kl_suudme_trestle_cottage','kl_suudme_silk_dyeworks'],note:'riparian mulberry, hemp, bark-mulberry, lotus and parish herb beds'},
 {trade:'orchardmen',voth:'orchards',karum:['kl_karum_amber_press','kl_karum_kura_granary'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_debtor_cloister'],suudme:['kl_suudme_ziggurat_granary','kl_suudme_silk_dyeworks'],note:'paper-mulberry bark groves, saffron-garden and bluff fruit terraces'},
 {trade:'miners',voth:'mine',karum:['kl_karum_paktong_mint','kl_karum_glaze_pottery'],ikki:['kl_ikki_coke_kiln','kl_ikki_hydro_forge','kl_ikki_smelter_hut'],suudme:['kl_suudme_paktong_braziery','kl_suudme_glaze_kilnworks'],note:'coal-measure coking seams, ironstone, paktong copper-nickel and Arch-nickel smelting'},
 {trade:'quarrymen and masons',voth:'quarry',karum:['kl_karum_glaze_pottery','kl_karum_kura_granary'],ikki:['kl_ikki_quarry_mason','kl_ikki_moat_bastion'],suudme:['kl_suudme_glaze_kilnworks','kl_suudme_ziggurat_granary','kl_suudme_strategion_keep']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',karum:['kl_karum_kura_granary','kl_karum_mill_bridge'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_covered_weir'],suudme:['kl_suudme_ziggurat_granary','kl_suudme_paktong_braziery']},
 {trade:'beetle herders',voth:'beetle ranch',na:'river barges, mules and Molu-che caravan trains haul Arcflow freight; no giant beetles'},
 {trade:'dairymen',voth:'dairy',karum:['kl_karum_kura_granary','kl_karum_caravanserai'],ikki:['kl_ikki_mujinzo_vault','kl_ikki_pack_depot'],suudme:['kl_suudme_ziggurat_granary','kl_suudme_caravanserai']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',karum:['kl_karum_trestle_cottage','kl_karum_porter_tenement'],ikki:['kl_ikki_smelter_hut','kl_ikki_commune_row'],suudme:['kl_suudme_trestle_cottage','kl_suudme_quay_tenement']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'temperate-subtropical Suur-Neva, Mere-Upe and Ria Sound agriculture; no cavern fungus farms'},
 {trade:'envoys and embassy staff',voth:'embassy',karum:['kl_karum_treaty_factor','kl_karum_grand_bank','kl_karum_syndicate_court'],ikki:['kl_ikki_otona_hall','kl_ikki_elder_manor','kl_ikki_covenant_citadel'],suudme:['kl_suudme_pontoon_factor','kl_suudme_amber_bourse','kl_suudme_mandarin_court']},
 {trade:'ferrymen',voth:'ferry, stop',karum:['kl_karum_crane_quay','kl_karum_mill_bridge','kl_karum_trestle_cottage'],ikki:['kl_ikki_covered_weir','kl_ikki_drum_gate'],suudme:['kl_suudme_pontoon_factor','kl_suudme_tidal_wharf','kl_suudme_trestle_cottage']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'shallow-draft river barges and Moleshelf mule relays carry Kulanewa trade; no elephant bugs'},
 {trade:'monks and lay brothers',voth:'monastery',karum:['kl_karum_clearing_hall','kl_karum_amber_press'],ikki:['kl_ikki_debtor_cloister','kl_ikki_covenant_citadel','kl_ikki_otona_hall'],suudme:['kl_suudme_uktena_bell_shrine','kl_suudme_sauna_thermae']},
 {trade:'palace and canton staffs',voth:'the cantons',karum:['kl_karum_grand_bank','kl_karum_clearing_hall','kl_karum_treaty_factor'],ikki:['kl_ikki_covenant_citadel','kl_ikki_otona_hall','kl_ikki_mujinzo_vault'],suudme:['kl_suudme_amber_bourse','kl_suudme_mandarin_court','kl_suudme_patrician_palazzo']}
];
globalThis.KL_TRADES=KL_TRADES;

function klTradeDefs(style){
 const col=style==='ikki'?'ikki':style==='suudme'?'suudme':'karum';
 const out={};
 for(let i=0;i<KL_TRADES.length;i++){
  const row=KL_TRADES[i];
  if(row.na)continue;
  out[row.trade]=(row[col]||[]).slice();
 }
 return out;
}
globalThis.klTradeDefs=klTradeDefs;
