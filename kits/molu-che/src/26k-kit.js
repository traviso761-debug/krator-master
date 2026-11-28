// ================================================================= THE KIT: identity, library families, clan metadata & palette ([G data])
// The Molu-Che Fossorial Clans of Moleshelf (peoples.json: molu_che, speaking Mapuche-shifted Molu-Dungu: -we "sunken yard",
// -che "folk", -mapu "bench-land") on the rain-shadowed BSk golden-loess step-bench of Moleshelf:
//   - Compact engineered fossorial human lineage (translucent nictitating dust-lids, amber-gold tapetum low-light eyes,
//     acute plantar/inner-ear seismic vibration sense) herding ox-sized (800-1,400 kg) engineered plough-moles (Talpatheres,
//     ktrama-molu) shod in replaceable tin-bronze and Kulanewa iron claw-shoes.
//   - Style 'dikengyuan' (19 buildings, seeds 8301..8319): Pastoral, Tuber-Gallery & Craft Clans excavating open-sky square
//     sunken loess courtyards, lime-washed yaodong barrel-vaults, hydraulic-lime rain cisterns, luma-papa seep-wall tuber
//     drifts, and composted blind amber-grub galleries.
//   - Style 'bonduwe' (19 buildings, seeds 8320..8338): Sworn neutral Claw-and-Salt Compact Bonded Strong-Vaults (dipu-bonduwe)
//     holding Kulanewa raha silver-bullion, ampala-kiri sealed amber-tablets, Ria reserves, and 10-year dry-loess famine grain,
//     plus the Weeping Valley overland caravan sled bypass and concealed steppe rim-redoubts.
const KIT={id:'molu-che',title:'Molu-Che Fossorial Clans and Bonded Vaults Kit',pack:'molu-che',culture:'molu-che',
 faction:'Molu-Che Fossorial Clans of Moleshelf',band:'Moleshelf',frag:'kits/molu-che',
 ground:0xba9c6e,groundProc:0xb09264,fog:0xe6dac4,furnDetail:.62};
const MC={DOOR_H:2.28,WALL:.42,SOCLE:.38,RISER:.18,BAY:3.4};
const MC_CLANS={
 dikengyuan:{
  style:'dikengyuan',name:'Molu-Che Bench Pastoral and Craft Clans',zone:'Moleshelf BSk Golden-Loess Step-Bench (Molu-Mapu)',
  polity:'Lonko and Ulmen fossorial clan-councils herding bronze- and iron-shod Talpathere plough-moles (ktrama-molu)',
  emblem:'Tin-Bronze Talpathere Claw-Shoe and Basalt Seismic Way-Stone',
  institutions:['open-sky square sunken dikengyuan courtyards','stamp-coded Talpathere excavation teams','luma-papa seep-wall tuber and blind amber-grub drifts','hydraulic-lime rain cisterns']
 },
 bonduwe:{
  style:'bonduwe',name:'Dipu-Bonduwe Bonded Strong-Vault and Bypass Guilds',zone:'Moleshelf Overland Trunk and Subterranean Strong-Vaults',
  polity:'Sworn neutral Claw-and-Salt Compact vault-wardens and Weeping Valley bypass drover-syndicates',
  emblem:'Amber-Sealed Bonded Vault Key and Stepped Cucuteni Diamond Tally',
  institutions:['siege/flood/fireproof Dipu-Bonduwe strong-vaults','Kulanewa raha silver-bullion and ampala-kiri amber-tablet reserves','10-year dry-loess treaty famine-grain silos','inviolable Weeping Valley overland caravan sled-trains']
 }
};
const SV_LIB={
 loess:'loess',rammed:'rammed',limewash:'limewash',dolomite:'dolomite',kilnbrick:'kilnbrick',
 basalt:'basalt',paving:'paving',cobble:'cobble',
 ochre:'ochre',ironred:'ironred',indigo:'indigo',terracotta:'terracotta',slate:'slate',
 darkcedar:'darkcedar',cedar:'cedar',carvedwood:'carvedwood',floor:'floor',
 bronze:'bronze',copper:'copper',iron:'iron',nickel:'nickel',
 halite:'halite',amber:'amber',coal:'coal',
 molefelt:'molefelt',tapestry:'tapestry',flag:'flag',reedmat:'reedmat',hide:'hide',
 rope:'rope',foliage:'foliage',
 plain:'plain',brass:'brass',bone:'bone',stone:'stone',earth:'earth',sand:'sand'};
const SV_TILE0={
 loess:2.2,rammed:2.0,limewash:1.9,dolomite:1.7,kilnbrick:1.45,
 basalt:1.65,paving:2.2,cobble:1.95,
 ochre:1.4,ironred:1.4,indigo:1.25,terracotta:1.3,slate:1.35,
 darkcedar:1.45,cedar:1.5,carvedwood:1.15,floor:1.8,
 bronze:.85,copper:1.2,iron:.85,nickel:.85,
 halite:1.2,amber:1.3,coal:1.3,
 molefelt:1.1,tapestry:1.15,flag:1.0,reedmat:.9,hide:.95,
 rope:.28,foliage:.8,
 plain:1.4,brass:.5,bone:.5,stone:2.2,earth:2.8,sand:3.0};
const SV_CLOTH={molefelt:1,tapestry:1,flag:1};
const SV_CUT=Object.assign({
 loess:1,rammed:1,limewash:1,dolomite:1,kilnbrick:1,basalt:1,
 ochre:1,ironred:1,indigo:1,terracotta:1,slate:1,
 darkcedar:1,cedar:1,carvedwood:1,bronze:1,copper:1,iron:1,nickel:1,
 halite:1,amber:1,hide:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 loess:[0xd4ab6a,0xca9f5e,0xdeb574],loessD:[0xba9052,0xae8448],
 rammed:[0xc49758,0xb88b4e,0xcfa262],
 limewash:[0xf4f0e6,0xebe6db,0xf8f5ed],
 dolomite:[0xcfc5b0,0xc3b9a4,0xd9cfba],
 kilnbrick:[0xb4563a,0xa64c32,0xc16044],kilnbrickD:[0x8c3e28,0x7e3622],
 basalt:[0x2e3136,0x26292e,0x383b42],
 paving:[0xc2baa8,0xb6ae9c,0xccbfa8],
 cobble:[0x948c7e,0x888072,0xa0988a],
 ochre:[0xdc9e36,0xd0922e,0xe6a840],
 ironred:[0xa83c28,0x9a3422,0xb64630],
 indigo:[0x24426e,0x1d385e,0x2e4e7e],
 terracotta:[0xc25c3a,0xb45030,0xcf6644],
 slate:[0x484f58,0x3e454e,0x545c66],
 darkcedar:[0x422a1c,0x382216,0x4e3222],
 cedar:[0x7e5236,0x72482e,0x8a5c3e],cedarL:[0x966848,0x8a5e40],
 carvedwood:[0x563824,0x4c301e,0x62402a],
 floor:[0x8a6444,0x7e5a3c,0x966e4c],
 bronze:[0xa2763c,0x946a34,0xb08244],bronzeD:[0x7a582c,0x6e4e26],
 copper:[0x4c8a76,0x407c68,0x589682],
 iron:[0x363a40,0x2e3238,0x40444a],
 nickel:[0xdce2e8,0xd0d7de,0xe6ecf0],
 halite:[0xf0ece6,0xe6e0d8,0xf7f4ef],
 amber:[0xe0a238,0xd4962e,0xecae44],
 coal:[0x222428,0x1b1d20,0x2a2d32],
 molefelt:[0x5c463c,0x503c34,0x685046],feltOchre:[0xd6962e,0xc88a26],feltCrimson:[0xa83228,0x982a20],
 tapestry:[0xa83628,0x982e20,0xb64030],tapestryIndigo:[0x264472,0x1e3862],
 flag:[0xe2a22e,0xd69624],flagSalt:[0xf0ece2,0xe6e0d4],
 reedmat:[0xc8ae74,0xbca268,0xd2b87e],
 hide:[0x62483a,0x563e32,0x6e5242],
 rope:[0xc6a658,0xba9a4e],
 foliage:[0x567848,0x4a6a3e,0x628452],
 bone:[0xebe2ce,0xe0d7c2],plain:[0xd2cab6,0xc6beaa],brass:[0xa67c3e,0x987034],
 stone:[0x847e74,0x787268],earth:[0x745c42,0x68523a],sand:[0xcab892,0xbead86],
 water:[0x2e6c74,0x265e66],flame:[0xffbe58]};
function P(k){return jc(pick(SVPAL[k]),.035);}
