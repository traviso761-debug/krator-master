// ================================================================= SHEET ROWS ([G data])
// Every def in DEFS is placed at least once so kit-coverage passes 100%.
// Special sculpted rows (90y-dv-terrain.js):
//   hillside: true -> 25 deg terraced gorge slope proving zero boxy podiums & battered basalt root-skirts!
//   chasm: true    -> Crookwash mountain river chasm (#include <atmos_waves>) + rim timber log-flume feeder channel!
const TITLE='Dzagh-Vardzi Gorge-Kingdoms Kit - Vardzieti (Crookwash, K1-K7 & Flumi-Bridzi)';
const DV_RES_KEYS=[];
for(const k of Object.keys(RES_ORE.kinds))for(const g of Object.keys(RES_ORE.grades))DV_RES_KEYS.push(resNodeKey(k,g));

const FAMILIES=[
 {name:'Poor Terraced Aul Cots (DV4 + DV2)',keys:['dv-aul-cot-shepherd','dv-aul-cot-orchard','dv-aul-cot-quarry']},
 {name:'Middle Roof-Plaza & 5-to-1 Slate-Needle Houses',keys:['dv-aul-house-terrace','dv-aul-house-koshki','dv-aul-house-ropeway']},
 {name:'Rich Chivalric Cousin-Lord Compounds',keys:['dv-manor-cousins','dv-manor-gumbat','dv-manor-envoy']},
 {name:'Valley-King Citadel, Hall of Seven Strings & Gumbat Courts',keys:[
  'dv-citadel-mepe','dv-hall-troubadour','dv-vault-mepe-qvevri','dv-sanctuary-gumbat','dv-hall-weregild',
  'dv-tavern-qvevri','dv-bath-sulfur','dv-scriptorium-lore','dv-shrine-cross','dv-healer-apricot'
 ]},
 {name:'Archaic Gorge Defence & Flume-Tunnel Gatehouse',keys:[
  'dv-wall-curtain','dv-gate-flume','dv-tower-vovnashki','dv-barracks-retinue','dv-beacon-gorge'
 ]},
 {name:'Flume-Forge Crafts, Qvevri Distilleries & Kilims',keys:[
  'dv-foundry-bronze','dv-smithy-armourer','dv-winery-qvevri','dv-bakery-tone',
  'dv-butcher-smokehouse','dv-weaver-kilim','dv-tannery-fleece','dv-potter-qvevri','dv-joiner-cypress'
 ]},
 {name:'Confluence Market, Granary, Orchards & Mines',keys:[
  'dv-customs-bridgehead','dv-market-confluence','dv-shophouse-lapidary','dv-granary-stilted',
  'dv-warehouse-flume','dv-orchard-terrace','dv-byre-mountain','dv-quarry-tuff',
  {key:'dv-mine-gorge',o:{metal:'tin'}},{key:'dv-mine-gorge',o:{v:1,metal:'iron'}}
 ]},
 {name:'Vardzieti 25 deg Gorge-Slope Showcase (Zero Podiums)',hillside:true,keys:[
  {key:'dv-aul-cot-shepherd',o:{v:1}},{key:'dv-aul-house-terrace',o:{v:1}},
  {key:'dv-aul-house-koshki',o:{v:1}},{key:'dv-manor-gumbat',o:{v:1}},{key:'dv-tower-vovnashki',o:{v:1}}
 ]},
 {name:'Livestock & Vardzieti Gorge Flora',keys:[
  'dvb-sheep','dvb-goat','dvb-horse','dvb-hen','dvb-apricot-tree','dvb-red-cypress','dvb-gorge-barley','dvb-dyer-madder'
 ]},
 {name:'Resource Nodes (kits-resources)',keys:DV_RES_KEYS},
 {name:'Crookwash Chasm, Duel Sky-Bridge, Chasm-Organ & Waterwheel Mills',chasm:true,keys:[
  {key:'dv-bridge-duel',o:{y:0}},{key:'dv-flume-keep',o:{y:0}},'dv-organ-beacon','dv-flume-forge','dv-flume-trestle',
  'dv-sawmill-jade','dv-sluice-fleece','dv-ferry-ropeway','dv-boatwright-raft','dv-fishweir-trout'
 ]}
];
