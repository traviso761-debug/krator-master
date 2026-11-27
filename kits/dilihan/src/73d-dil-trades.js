// ================================================================= 73d. DILIHAN VASSAL KIT — Voth Census Trades Table ([G data])
// [G data] Pure data and audit function over the 44 trades of tools/trades_census.json (checked by tools/check_trades.py
// and sheet_verify.py). Dilihan sits at -888.6 m ASL on the southern bench of the Cut (landlocked highland-basin pass city
// above the hypersaline -1,608 m Cut Salt Lake), and stands alongside kits/iziz-vernacular on the Mixed Street and in
// settlements/dilihan: urban monsoon trades are carried directly by dil_* buildings below, landlocked/maritime rows are
// marked na, and rural/specialist slots carried by paired Vernacular or Dellu-Handu hinterland works note their gap.

const DL_TRADES = [
  { trade: 'bakers', voth: 'voth_bldg_bakery', keys: ['dil_bakery_breezeway'] },
  { trade: 'butchers', voth: 'voth_bldg_butcher', keys: ['dil_butcher_icehouse'] },
  { trade: 'weavers and dyers', voth: 'voth_bldg_weaver', keys: ['dil_weaver_dyecourt'] },
  { trade: 'brewers', voth: 'voth_bldg_brewery', keys: ['dil_tavern_pergola'], note: 'palm-wine and spiced chay brewed in courtyard taverns' },
  { trade: 'tanners', voth: 'voth_bldg_tannery', gap: 'carried by paired vern_tannery on downwind Vernacular terrace edges' },
  { trade: 'shipwrights and boatbuilders', voth: 'voth_bldg_shipwright', na: 'landlocked Cut bench above hypersaline endorheic salt pan' },
  { trade: 'innkeepers and grooms', voth: 'voth_bldg_caravanserai', keys: ['dil_inn_courtyard'] },
  { trade: 'town guard', voth: 'voth_bldg_watchhouse', keys: ['dil_barracks_arcade'] },
  { trade: 'coast guard', voth: 'voth_bldg_coastguard_berth', na: 'landlocked Cut bench: pass gates replace sea berths' },
  { trade: 'temple priests and servants', voth: 'voth_bldg_temple_ash', keys: ['dil_shrine_suncourt'] },
  { trade: 'shrine keepers', voth: 'village shrine', keys: ['dil_shrine_suncourt'] },
  { trade: 'shopkeepers and assistants', voth: 'voth_shop_trader', keys: ['dil_shop_arcade'] },
  { trade: 'smiths and craftsmen', voth: 'voth_shop_smithy', keys: ['dil_smithy_monitor', 'dil_carpenter_yard', 'dil_brick_pottery'] },
  { trade: 'innkeepers and servers', voth: 'voth_tavern_b', keys: ['dil_tavern_pergola', 'dil_inn_courtyard'] },
  { trade: 'porters and warehousemen', voth: 'voth_warehouse_b', keys: ['dil_godown_ventilated'] },
  { trade: 'industrial workers', voth: 'industrial lot', keys: ['dil_smithy_monitor', 'dil_brick_pottery', 'dil_carpenter_yard'] },
  { trade: 'power-house stokers and engineers', voth: 'voth_generator', gap: 'carried by paired vern_generator in municipal Izani wards' },
  { trade: 'household service', voth: 'rich house, manor, clan compound', keys: ['dil_villa_impluvium', 'dil_manor_breezeway'] },
  { trade: 'soldiers', voth: 'voth_barracks', keys: ['dil_barracks_arcade'] },
  { trade: 'teachers and scholars', voth: 'voth_school', gap: 'carried by paired vern_school and Colonia jj_school' },
  { trade: 'guild officers and clerks', voth: 'voth_bldg_guild_hall', keys: ['dil_guildhall_peristyle'] },
  { trade: 'customs officers and clerks', voth: 'customs house', keys: ['dil_customs_loggia'] },
  { trade: 'healers and nurses', voth: 'house of healing', keys: ['dil_cooling_baths'], note: 'sardab cooling baths and heat-stroke infirmary; paired with vern_hospital' },
  { trade: 'priests and undertakers', voth: 'funerary temple', keys: ['dil_shrine_suncourt'] },
  { trade: 'lighthouse keepers', voth: 'lighthouse', na: 'landlocked mountain-pass bench' },
  { trade: 'dockers and stevedores', voth: 'harbour pier', na: 'landlocked Cut bench; caravan porters work dil_godown_ventilated' },
  { trade: 'river bargemen and quay hands', voth: 'river quay', na: 'mountain spring stream is non-navigable' },
  { trade: 'fishers', voth: 'fishing dock', na: 'Cut Salt Lake (-1,608 m) is hypersaline potash brine with no fish' },
  { trade: 'market traders', voth: 'market stall', keys: ['dil_bazaar_pavilion', 'dil_shop_arcade'] },
  { trade: 'farmhands and ploughmen', voth: 'fields', gap: 'carried by Dellu-Handu veteran hamlets (vern_farmhouse, jj_farmhouse_a)' },
  { trade: 'chinampa growers', voth: 'chinampa bed', na: 'rain-fed terraced Cut paddy benches, no lake chinampas' },
  { trade: 'orchardmen', voth: 'orchards', gap: 'whorl-olive and canyon-grape terraces worked from Dellu-Handu farmsteads' },
  { trade: 'miners', voth: 'mine', gap: 'carried by NE granite-contact cassiterite tin and magnetite skarn adits (dl_skarn_adit, vern_mine)' },
  { trade: 'quarrymen and masons', voth: 'quarry', keys: ['dil_brick_pottery'], note: 'alluvial clay brickmakers and terracotta masons; stone quarry is vern_quarry' },
  { trade: 'granary keepers and millers', voth: 'granary, windmill, watermill', keys: ['dil_press_mill', 'dil_godown_ventilated'] },
  { trade: 'beetle herders', voth: 'beetle ranch', na: 'pack mules and horses serve the Cut highway, no giant beetles' },
  { trade: 'dairymen', voth: 'dairy', gap: 'carried by paired vern_byre in Dellu-Handu allotments' },
  { trade: 'swineherds and duck keepers', voth: 'sty, coop', gap: 'carried by paired vern_pens in Dellu-Handu allotments' },
  { trade: 'mushroom growers', voth: 'mushroom farm', gap: 'carried by paired vern_fungus_shed dark-beds' },
  { trade: 'envoys and embassy staff', voth: 'embassy', na: 'tabled: Hykkousoi legation is bespoke in settlements/dilihan' },
  { trade: 'ferrymen', voth: 'ferry, stop', na: 'three-arch stone bridge crosses the spring stream; no ferries' },
  { trade: 'elephant bug handlers and station hands', voth: 'bug station', na: 'no elephant bugs on the southern Cut highway' },
  { trade: 'monks and lay brothers', voth: 'monastery', na: 'Izani veterans colony has Sun-Orb shrines rather than Order monasteries' },
  { trade: 'palace and canton staffs', voth: 'the cantons', gap: 'carried by bespoke dl_gov_palace in settlements/dilihan Zone 2' }
];

function dlTradesAudit() {
  const bad = [];
  let carried = 0;
  let na = 0;
  for (let i = 0; i < DL_TRADES.length; i++) {
    const row = DL_TRADES[i];
    if (row.na || row.gap) {
      na++;
      continue;
    }
    const ks = row.keys || [];
    const miss = typeof VERN !== 'undefined' ? ks.filter(function (k) { return !VERN.defs[k]; }) : [];
    if (!ks.length || miss.length) {
      bad.push(row.trade + ': ' + (miss.length ? 'no def ' + miss.join(', ') : 'no building'));
    } else {
      carried++;
    }
  }
  return { trades: DL_TRADES.length, carried: carried, na: na, bad: bad };
}
