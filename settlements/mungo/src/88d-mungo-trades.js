/* ============================== THE VOTH CENSUS OF TRADES [G data] ==============================
   2026-10-19. Which of the Voth city's 44 trades (tools/trades_census.json) Mungo carries. The table records what the
   page places and builds nothing. A row is { trade, keys:[...], note? } for a trade Mungo carries, { trade, na:'why' }
   where it cannot or should not exist, or { trade, keys:[], gap:'what is missing' } (keys and a gap together: partly
   carried). The keys are the ASSET keys the layout schedules or places (src/30-layout.js, src/68-place.js): the Eastern
   Abyssal kit's abyss_*, Locus's civic_*, ind_*, infra_*, trade_*, farm_*, the Yuni houses (mid_*) and the Reed Lake
   kit's rl_* (settlements/reedlake). tools/check_trades.py reads it (verify.py 'voth-trades'); KNOWN_ISSUES.md lists the
   gaps. Mungo (DESIGN.md): a trade village at the bottom of the Eastern Abyss on a salt lake and a small river; a
   floating reed village, a pontoon bridge, a landward town with the bridgehead market, the caravanserai, two inns, the
   city watch, the Geomancers' chapterhouse and their generator, fields on the river flats, a reed marsh, forest
   lumber. Locus has its own table (LO_TRADES); this one is for the page Mungo places, which is the smaller town. */
const MUNGO_TRADES = [
  { trade: 'bakers', keys: [], gap: 'a bakery with ovens: the cookshop and the tavern kitchens cook, nobody bakes for the town' },
  { trade: 'butchers', keys: [], gap: 'a butcher\'s shop and slaughter yard' },
  { trade: 'weavers and dyers', keys: ['rl_weaver', 'tb_weaver_dyehouse'], note: 'the reed weaver\'s workshops and the bridgehead Tabisti weaver-dyehouse' },
  { trade: 'brewers', keys: [], gap: 'a brewhouse or date-wine press (Reed\'s Local and the inns serve drink they do not make)' },
  { trade: 'tanners', keys: [], gap: 'a tannery' },
  { trade: 'shipwrights and boatbuilders', keys: [], gap: 'a small boatyard for the reed canoes and the fishing fleet (26 boat fishers)' },
  { trade: 'innkeepers and grooms', keys: ['tb_caravanserai_urban', 'tb_oriel_townhouse', 'tb_tahawst_mid'], note: 'the Tabisti caravanserai stables the caravans\' animals' },
  { trade: 'town guard', keys: ['tb_barracks_court', 'rl_watchtower'], note: 'the Tabisti city watch barracks, day and night; the reed village\'s watchtower' },
  { trade: 'coast guard', na: 'a salt lake, not a sea: the watch and the watchtower keep the shore' },
  { trade: 'temple priests and servants', keys: ['rl_shaman'], note: 'the reed village\'s shaman\'s house; the landward town has no temple' },
  { trade: 'shrine keepers', keys: ['rl_spirit_circle'], note: 'the spirit circle' },
  { trade: 'shopkeepers and assistants', keys: ['tb_souq_arcade', 'tb_tea_tavern', 'tb_incense_distillery', 'tb_shop_house'], note: '16 shopkeepers at the bridgehead Tabisti souq and shops' },
  { trade: 'smiths and craftsmen', keys: ['tb_bronze_foundry', 'tb_weaver_dyehouse', 'tb_ganch_mason_yard', 'rl_smithy'], note: 'bronze weaponsmith, outfitter, ganch/hazarbaf builders\' yard, the reed village\'s scrap smithy' },
  { trade: 'innkeepers and servers', keys: ['tb_oriel_townhouse', 'tb_tahawst_mid', 'tb_tea_tavern', 'rl_tavern'], note: 'two Tabisti inns, the bridgehead tea tavern, and Reed\'s Local' },
  { trade: 'porters and warehousemen', keys: ['tb_bonded_warehouse', 'tb_lake_quay_customs', 'tb_fish_curing_pier', 'rl_warehouse'], note: '12 warehouse hands' },
  { trade: 'industrial workers', keys: [], gap: 'a works: the town has the fuel station and the builders\' yard but no refinery or mill; logging landings are open yards' },
  { trade: 'power-house stokers and engineers', keys: ['ind_generator_house'], note: 'the Geomancers\' generator house; the Geomancer quarter\'s grid (71g-mungo-grid.js)' },
  { trade: 'household service', keys: ['tb_capricho_villa'], note: 'the Ahedman\'s house (tb_capricho_villa)' },
  { trade: 'soldiers', keys: ['tb_barracks_court', 'rl_warrior_hall'], note: 'the watch\'s barracks; the reed warriors\' hall (8 warriors)' },
  { trade: 'teachers and scholars', keys: [], gap: 'a school (56 children play, nobody teaches)' },
  { trade: 'guild officers and clerks', keys: ['civic_geomancer_chapterhouse'], note: 'the Geomancers\' chapterhouse; no hall of records for the trading houses' },
  { trade: 'customs officers and clerks', keys: ['tb_lake_quay_customs'], note: 'the Tabisti salt-and-goods customs warehouse' },
  { trade: 'healers and nurses', keys: [], gap: 'a house of healing (the alchemist sells remedies only)' },
  { trade: 'priests and undertakers', keys: [], gap: 'a funerary court or burial ground' },
  { trade: 'lighthouse keepers', na: 'a salt lake with fishing boats, no sea routes to light' },
  { trade: 'dockers and stevedores', na: 'no harbour: the pontoon bridge and a fishing dock serve a trade village' },
  { trade: 'river bargemen and quay hands', na: 'the river is small and shallow; goods move on the highways and the pontoon bridge' },
  { trade: 'fishers', keys: ['infra_fishing_dock', 'rl_dock', 'rl_fishfarm', 'tb_fish_curing_pier', 'tb_shop_house'], note: 'boat and shore fishers (26 and 12): the fishing dock, the reed docks, the fish weirs and duck runs, the curing pier and fish merchant' },
  { trade: 'market traders', keys: ['prop_market_stall', 'tb_souq_arcade'], note: 'the stalls and Tabisti souq arcade of the bridgehead market' },
  { trade: 'farmhands and ploughmen', keys: ['abyss_farmhouse', 'farm_saltrice', 'rl_farm'], note: '34 farmers on the river flats; the salt-rice farm; the reed village\'s floating gardens' },
  { trade: 'chinampa growers', keys: ['rl_farm', 'farm_saltrice_paddies'], note: 'the floating gardens of the reed village; the salt-rice paddies' },
  { trade: 'orchardmen', keys: [], gap: 'an orchard: the forest fruit is gathered (16 gatherers), not grown' },
  { trade: 'miners', na: 'a marsh and forest valley at a river mouth with no ore or oil node placed; metal and salt arrive by caravan' },
  { trade: 'quarrymen and masons', keys: ['tb_ganch_mason_yard'], note: 'the Tabisti ganch carving loggia and hazarbaf brickyard at the bridgehead' },
  { trade: 'granary keepers and millers', keys: ['abyss_granary', 'rl_granary'], gap: 'a mill: the windmill lifts water only', note: 'the silo granary; the reed granaries' },
  { trade: 'beetle herders', na: 'the beetles are the Staghorn riders\' stock (LORE 6.6); the abyss herds goats and oxen' },
  { trade: 'dairymen', keys: [], gap: 'a dairy and byre' },
  { trade: 'swineherds and duck keepers', keys: ['rl_pen', 'rl_fishfarm', 'prop_animal_pen'], note: 'the reed village\'s animal pen, the fish weir and duck run, the thorn-fenced pen' },
  { trade: 'mushroom growers', na: 'a salt lake and marsh: no mushroom farming in the abyssal lore' },
  { trade: 'envoys and embassy staff', na: 'tabled until embassies have an in-game purpose' },
  { trade: 'ferrymen', na: 'the pontoon bridge carries the road to the reed village: no ferry' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs: caravans are drawn by oxen and camels' },
  { trade: 'monks and lay brothers', keys: ['civic_geomancer_chapterhouse'], note: 'the Geomancers\' brothers (the monks_mungo organisation) live at the chapterhouse' },
  { trade: 'palace and canton staffs', keys: ['tb_capricho_villa'], note: 'the Ahedman\'s villa (tb_capricho_villa) closing the main street' }
];
globalThis.MUNGO_TRADES = MUNGO_TRADES;
