/* ================================================================= HIGHLANDS — the Voth census trades [G data]
   HL_TRADES: every trade of the Voth city's census (tools/trades_census.json, 44 trades) and the Highlands building keys
   (Republican hl_rep_, Rustic hl_rus_; the Painted Men moved to kits/painted-men) that carry it, or `na` and why the
   temperate/subalpine highlands have none. Every applicable trade has explicit `republican` and `rustic` building keys
   (80-rus-dwell.js, 81-rus-village.js, 81b-rus-salvage.js, 81c-rus-trades.js, 81d-rus-water.js).
   Plain data, no three.js, no DOM; `python3 tools/check_trades.py kits/highlands` and the `voth-trades` assert in verify.py
   read it, and every key must appear in src/. */
const HL_TRADES = [
  { trade: 'bakers', republican: ['hl_rep_shops'], rustic: ['hl_rus_bakehouse'], note: 'the Slavic log bakehouse with its clay pech oven; the bakery in the Republican shop row' },
  { trade: 'butchers', republican: ['hl_rep_market_hall'], rustic: ['hl_rus_butcher'], note: 'the Carpathian log butcher shop and koptilnya smokehouse; the Republican market shambles' },
  { trade: 'weavers and dyers', republican: ['hl_rep_workshop_a'], rustic: ['hl_rus_weaver'], note: 'the weaver and dyer log hall with outdoor dye vats and veshala racks; the Republican craft workshop' },
  { trade: 'brewers', republican: ['hl_rep_workshop_b'], rustic: ['hl_rus_distillery'], note: 'the Highland peat-fired pot-still distillery and ale brewhouse; the Republican brewery and cooperage' },
  { trade: 'tanners', republican: ['hl_rep_workshop_a'], rustic: ['hl_rus_tannery'], note: 'the bark-tanning pit yard and turf-roofed currier shed; the Republican craft yard' },
  { trade: 'shipwrights and boatbuilders', republican: ['hl_rep_shipbreak'], rustic: ['hl_rus_boatyard', 'hl_rus_hull_naust'], note: 'the Novgorodian lodya slipway boatyard and hull naust; Republican hullwrights' },
  { trade: 'innkeepers and grooms', republican: ['hl_rep_inn', 'hl_rep_stables'], rustic: ['hl_rus_inn'], note: 'the coaching inn and stables; the Slavic postoyaly dvor coaching inn' },
  { trade: 'town guard', republican: ['hl_rep_watch', 'hl_rep_gate', 'hl_rep_wall_tower'], rustic: ['hl_rus_watchtower', 'hl_rus_gate'], note: 'the Republican watch and gates; the ostrog cantilevered blockhouse tower and palisade gatehouse' },
  { trade: 'coast guard', republican: [], rustic: ['hl_rus_patrol_boathouse'], note: 'fortified ostrog patrol-cutter boathouse and watch-pier on the highland lakes and fjords' },
  { trade: 'temple priests and servants', republican: ['hl_rep_temple'], rustic: ['hl_rus_temple'], note: 'the Temple of the Pantheon; the stave church' },
  { trade: 'shrine keepers', republican: ['hl_rep_temple'], rustic: ['hl_rus_shrine'], note: 'the wayside Slavic chasovnya / kapliczka shrine on its fieldstone plinth' },
  { trade: 'shopkeepers and assistants', republican: ['hl_rep_shops', 'hl_rep_cont_shops'], rustic: ['hl_rus_shops'] },
  { trade: 'smiths and craftsmen', republican: ['hl_rep_smithy_small', 'hl_rep_smithy_large', 'hl_rep_workshop_a', 'hl_rep_hydro_forge'], rustic: ['hl_rus_smithy', 'hl_rus_woodcarver'] },
  { trade: 'innkeepers and servers', republican: ['hl_rep_tavern_a', 'hl_rep_tavern_b', 'hl_rep_tavern_c'], rustic: ['hl_rus_tavern', 'hl_rus_inn'] },
  { trade: 'porters and warehousemen', republican: ['hl_rep_warehouse_a', 'hl_rep_warehouse_b', 'hl_rep_hull_vault'], rustic: ['hl_rus_warehouse'], note: 'the Republican warehouses; the raised Slavic log ambar storehouse' },
  { trade: 'industrial workers', republican: ['hl_rep_forgehouse', 'hl_rep_smelter', 'hl_rep_press_works', 'hl_rep_powder_works', 'hl_rep_hydro_forge', 'hl_rep_hydro_sawmill', 'hl_rep_hydro_stampmill'], rustic: ['hl_rus_charcoal_works'], note: 'the Republican mills and smelters; the highland peat-charcoal, birch-tar and bloomery works' },
  { trade: 'power-house stokers and engineers', republican: ['hl_rep_generator'], rustic: ['hl_rus_generator'], note: 'the Republican generator house; the salvaged Ancient turbine and peat-boiler rustic powerhouse' },
  { trade: 'household service', republican: ['hl_rep_house_rich_a', 'hl_rep_house_rich_b', 'hl_rep_house_rich_c'], rustic: ['hl_rus_house_rich_a', 'hl_rus_house_rich_b'] },
  { trade: 'soldiers', republican: ['hl_rep_barracks', 'hl_rep_muster', 'hl_rep_arsenal', 'hl_rep_fortress'], rustic: ['hl_rus_barracks', 'hl_rus_muster'] },
  { trade: 'teachers and scholars', republican: ['hl_rep_school', 'hl_rep_guild_astro'], rustic: ['hl_rus_school'], note: 'the schoolhouse and Astronomers Guild; the village gramota schoolhouse and chronicler lodge' },
  { trade: 'guild officers and clerks', republican: ['hl_rep_guild_smith', 'hl_rep_guild_mech', 'hl_rep_guild_scav', 'hl_rep_guild_farm', 'hl_rep_town_hall'], rustic: ['hl_rus_guild_lodge', 'hl_rus_hall'] },
  { trade: 'customs officers and clerks', republican: ['hl_rep_gate', 'hl_rep_kontor'], rustic: ['hl_rus_tollhouse'], note: 'the zastava mountain-pass and quay tollhouse; the Republican town gate and kontor' },
  { trade: 'healers and nurses', republican: ['hl_rep_hospital'], rustic: ['hl_rus_healer'], note: 'the Republican hospital; the znakhar herbalist infirmary and log banya' },
  { trade: 'priests and undertakers', republican: ['hl_rep_temple'], rustic: ['hl_rus_pogost'], note: 'the wooden pogost funerary chapel and golubets grave-post yard' },
  { trade: 'lighthouse keepers', republican: [], rustic: ['hl_rus_beacon'], note: 'headland stone-and-log fire-beacon tower on the highland lakes and fjords' },
  { trade: 'dockers and stevedores', republican: [], rustic: ['hl_rus_quay'], note: 'log-cribwork lake and fjord cargo quay with sheerlegs crane' },
  { trade: 'river bargemen and quay hands', republican: [], rustic: ['hl_rus_quay'], note: 'log-cribwork river and lake barge quay' },
  { trade: 'fishers', republican: [], rustic: ['hl_rus_fishdock'], note: 'timber pile fishing stage, veshala net-drying racks and fish smokehouse' },
  { trade: 'market traders', republican: ['hl_rep_market_hall', 'hl_rep_wreck_market', 'hl_rep_lantern_stall'], rustic: ['hl_rus_market', 'hl_rus_scrap_market'] },
  { trade: 'farmhands and ploughmen', republican: ['hl_rep_farmhouse', 'hl_rep_farm'], rustic: ['hl_rus_farmhouse', 'hl_rus_farm'] },
  { trade: 'chinampa growers', na: 'no warm marsh or chinampa lake-beds in the cold temperate highlands: crops grow on drained strips and stone terraces' },
  { trade: 'orchardmen', republican: ['hl_rep_farm'], rustic: ['hl_rus_orchard'], note: 'wattle-and-stone terraced highland apple and plum orchard, paseka beehives and cider press' },
  { trade: 'miners', republican: ['hl_rep_mine'], rustic: ['hl_rus_mine'] },
  { trade: 'quarrymen and masons', republican: ['hl_rep_quarry'], rustic: ['hl_rus_quarry'] },
  { trade: 'granary keepers and millers', republican: ['hl_rep_granary', 'hl_rep_windmill', 'hl_rep_watermill', 'hl_rep_hydro_gristmill'], rustic: ['hl_rus_granary', 'hl_rus_mill'] },
  { trade: 'beetle herders', na: 'no giant beetles in the highlands: highland stock is cattle, sheep, goats, swine and horses' },
  { trade: 'dairymen', republican: ['hl_rep_pens'], rustic: ['hl_rus_dairy'], note: 'the Carpathian koliba octagonal log sheep-and-cattle cheese dairy' },
  { trade: 'swineherds and duck keepers', republican: ['hl_rep_pens'], rustic: ['hl_rus_pens'], note: 'the animal pens' },
  { trade: 'mushroom growers', republican: [], rustic: ['hl_rus_mushroom_cellar'], note: 'sunken turf-roofed pogreb dark cellars for highland alecap and cellar mushrooms' },
  { trade: 'envoys and embassy staff', republican: ['hl_rep_hall_republic'], rustic: ['hl_rus_envoy_lodge'], note: 'the posolsky dvor carved clan truce and envoy guest-house' },
  { trade: 'ferrymen', republican: [], rustic: ['hl_rus_ferry'], note: 'mountain river and lake cable-ferry landing stage, capstan winch hut and timber ferry scow' },
  { trade: 'elephant bug handlers and station hands', na: 'no elephant bugs in the highlands: freight moves by horse wagon, crawler and lake barge' },
  { trade: 'monks and lay brothers', republican: ['hl_rep_temple'], rustic: ['hl_rus_skete'], note: 'wooden skit monastery compound with shatyor log chapel, monk cells and wattle cloister' },
  { trade: 'palace and canton staffs', republican: ['hl_rep_hall_republic', 'hl_rep_town_hall', 'hl_rep_mint'], rustic: ['hl_rus_hall', 'hl_rus_house_rich_b'], note: 'the Hall of the Republic, town hall and Mint; the clan moot hall and chieftain hall-house' }
];
globalThis.HL_TRADES = HL_TRADES;
