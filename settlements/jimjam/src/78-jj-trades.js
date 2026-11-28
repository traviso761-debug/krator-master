// ================================================================= JIMJAM — the Voth census trades [G data]
/* JJ_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Jimjam building keys
   that carry it, or `na` and why Jimjam has none. Plain data, no three.js, no DOM; `python3 tools/check_trades.py
   settlements/jimjam` and the `voth-trades` assert in verify.py read it, and every key must be a building or vessel key
   found elsewhere in src/. Zero census gaps remain: all 15 former gaps plus lakeside barge, customs, embassy & Order
   chapterhouse trades are carried by src/70b-jj-housing-more.js, src/73b-jj-work.js, and src/74b-jj-celestial.js. */
const JJ_TRADES = [
  { trade: 'bakers', keys: ['jj_shop_food'], note: 'the grocer and baker, with the beehive bread oven in the yard' },
  { trade: 'butchers', keys: ['jj_butcher'], note: 'the butcher shop with porous-clay evaporative coolhouse and smokehouse' },
  { trade: 'weavers and dyers', keys: ['jj_weaver_dyer', 'jj_tailor_cobbler', 'jj_shop_textiles'], note: 'the four-vat indigo, saffron and wineweed weaver-dyeworks, the garment tailor/cobbler, and the cloth merchant' },
  { trade: 'brewers', keys: ['jj_brewhouse'], note: 'the grain-arrack and whiskey brewhouse with copper alembic dome' },
  { trade: 'tanners', keys: ['jj_tannery', 'jj_tailor_cobbler'], note: 'the leeward lime-and-bark soaking tannery and the cobbler bench' },
  { trade: 'shipwrights and boatbuilders', keys: ['jj_boatyard', 'jj_timber_yard'], note: 'the monsoon-timber Great Trough Lake 25t barge slipway and sawpit yard' },
  { trade: 'innkeepers and grooms', keys: ['jj_caravanserai', 'jj_whitepass_compound', 'jj_carter_corral'], note: 'the Cut-Gate caravanserai, the White-Pass trans-rim factor compound, and the draught-mule/cart depot' },
  { trade: 'town guard', keys: ['jj_wall_gate', 'jj_wall_tower', 'jj_wall_corner'] },
  { trade: 'coast guard', na: 'inland Great Trough Lake (+429.8 m ASL): no open Ring Sea coast; harbour and wall watchtowers keep the lake watch' },
  { trade: 'temple priests and servants', keys: ['jj_temple_sun', 'jj_temple_week', 'jj_temple_thirteen', 'jj_temple_companion', 'jj_temple_day', 'jj_temple_twoday', 'jj_temple_fourday'], note: 'the Great Solstice Temple and all six astrologically aligned Moon Temples' },
  { trade: 'shrine keepers', keys: ['jj_shrine_veil', 'jj_shrine_crown', 'jj_shrine_rust_cinder', 'jj_shrine_ash', 'jj_shrine_frost', 'jj_shrine_wanderer'], note: 'the five planetary shrines and the unroofed 13-stone Wanderer circle' },
  { trade: 'shopkeepers and assistants', keys: ['jj_shop_general', 'jj_shop_spice', 'jj_shop_jeweler', 'jj_money_changer', 'jj_house_mid_c', 'jj_house_mid_f'], note: 'the street shops, sarraf money-changer, and corner arcade shop-houses' },
  { trade: 'smiths and craftsmen', keys: ['jj_smithy_brass', 'jj_pottery', 'jj_timber_yard', 'jj_shop_weapons', 'jj_shop_armor', 'jj_shop_jeweler', 'jj_almanac_press'] },
  { trade: 'innkeepers and servers', keys: ['jj_inn', 'jj_tavern'] },
  { trade: 'porters and warehousemen', keys: ['jj_warehouse_a', 'jj_warehouse_b', 'jj_carter_corral'] },
  { trade: 'industrial workers', keys: ['jj_brick_kiln', 'jj_pottery', 'jj_gypsum_works', 'jj_oil_press', 'jj_glassworks', 'jj_almanac_press', 'jj_saltpeter_ery', 'jj_izani_gov_ruin'], note: '1.51-atm clinker brick kilns, fine-ceramics potteries, gypsum-plaster works, whorl-olive oil presses, optical glassworks, Royal Almanac block-presses, saltpeter boilers, and rag-paper/ink works in Sid\'kin-Palu' },
  { trade: 'power-house stokers and engineers', na: 'selective low-voltage battery and instrument circuits only (Raja\'s Eye chronograph, harbour beacon, Order oculus, Republican minder); the city prefers oil lamps and has no municipal coal powerhouse' },
  { trade: 'household service', keys: ['jj_house_rich_a', 'jj_house_rich_b', 'jj_house_rich_c', 'jj_house_rich_d', 'jj_house_rich_e', 'jj_house_rich_f'] },
  { trade: 'soldiers', keys: ['jj_barracks', 'jj_fortress'] },
  { trade: 'teachers and scholars', keys: ['jj_school', 'jj_library', 'jj_rajas_eye'], note: 'the Four Calendar Schools, royal library, and Raja\'s Eye observatory' },
  { trade: 'guild officers and clerks', keys: ['jj_guild_hall'], note: 'the Hall of the Three Wheels and Merchant Guilds' },
  { trade: 'customs officers and clerks', keys: ['jj_customs_house', 'jj_whitepass_compound'], note: 'the harbour/caravan assay customs house and the northern White-Pass toll compound' },
  { trade: 'healers and nurses', keys: ['jj_healing_house', 'jj_bathhouse', 'jj_shop_alchemy'], note: 'the Four-Temper humoral infirmary, lotus hammam, and alchemist' },
  { trade: 'priests and undertakers', keys: ['jj_funerary_ghat', 'jj_temple_sun'], note: 'the Memorial Chhatri Court of the Completed Count and the Solstice Temple' },
  { trade: 'lighthouse keepers', keys: ['jj_barge_quay'], note: 'keepers of the staged brick Electric Harbour Leading-Beacon on the Lotus Water-Gate wharf' },
  { trade: 'dockers and stevedores', keys: ['jj_barge_quay', 'jj_customs_house'], note: 'quay hands working the sheer-legs crane and transit shed at the Great Trough Lake harbour' },
  { trade: 'river bargemen and quay hands', keys: ['jj_barge_quay', 'jj_lake_barge'], note: 'crews of the 25-ton shallow-draft lateen lake barges linking Jimjam, Serai, Veladiga, and Barada-Quay' },
  { trade: 'fishers', keys: ['jj_fish_quay'], note: 'the stepped red-brick lake fish-landing, net racks, and Serai-salt curing shed' },
  { trade: 'market traders', keys: ['jj_market_hall', 'jj_furn_market_stall'], note: 'the domed chār-sūq bazaar chowk and the Great Pilgrim\'s Market stalls' },
  { trade: 'farmhands and ploughmen', keys: ['jj_farm_field', 'jj_farmhouse_a', 'jj_farmhouse_b'] },
  { trade: 'chinampa growers', na: 'no floating chinampa beds in Jimjam: its hanḍu farms use diked monsoon paddy and brick-walled fields' },
  { trade: 'orchardmen', keys: ['jj_orchard', 'jj_oil_press'], note: 'walled citron, ironplum, and whorl-olive groves and the rotary lamp-oil press' },
  { trade: 'miners', na: 'alluvial clay bench: clay and gypsum/alabaster are surface-quarried; copper/iron skarn comes 127 km south from Cempu-malai' },
  { trade: 'quarrymen and masons', keys: ['jj_masons_yard', 'jj_gypsum_works', 'jj_clay_pit', 'jj_brick_kiln'], note: 'Cut-marble/alabaster carvers, gypsum-plaster calcining kilns, slackwater rhythmite clay pits, and brick kilns' },
  { trade: 'granary keepers and millers', keys: ['jj_granary', 'jj_windmill'] },
  { trade: 'beetle herders', na: 'no beetle ranches in Jimjam; draught and dairy stock are water-buffalo and mules' },
  { trade: 'dairymen', keys: ['jj_dairy'], note: 'the ventilated jali-brick water-buffalo byre and whitewashed ghee/curd cellar' },
  { trade: 'swineherds and duck keepers', keys: ['jj_farmhouse_a'], note: 'the courtyard and pens of farmhouse A' },
  { trade: 'mushroom growers', na: 'sun-drenched surface lake bench: no subterranean mushroom farms' },
  { trade: 'envoys and embassy staff', keys: ['jj_whitepass_compound', 'jj_izani_gov_ruin'], note: 'Khaayken Yeti, Yonni and Rian envoys in the White-Pass compound; Dilihan factors and the Iron Republic minder in the intact NW pavilion of Sid\'kin-Palu' },
  { trade: 'ferrymen', keys: ['jj_fish_quay', 'jj_lake_barge'], note: 'lake-cove passenger skiffs and Serai pilgrim barges' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in the NW lowlands; highland caravans come over the White Pass by yak and mule' },
  { trade: 'monks and lay brothers', keys: ['jj_order_chapterhouse'], note: 'chronicle-keepers of the Order of Historians chapterhouse' },
  { trade: 'palace and canton staffs', keys: ['jj_palace', 'jj_palace_plaza'], note: 'the Raja\'s palace and the great sunray plaza' }
];
globalThis.JJ_TRADES = JJ_TRADES;
