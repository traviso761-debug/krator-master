// ================================================================= THE KIT: identity, library families, wind buckets & palette ([G data])
// The Hueru-Kuran ("Whale Clans", maritime sister-branch of Hayrant) of Crookshore's Four Drowned Ejecta Craters
// (89,604; 81,677; 104,562; 123,659) and +690 m cypress-flume terrace (124,710), culture 'hueru-kuran' (kits/hueru-kuran/PLAN.md).
const KIT={id:'hueru-kuran',title:'Hueru-Kuran Whale Clans of Crookshore Kit',pack:'hueru-kuran',culture:'hueru-kuran',
 faction:'Hueru-Kuran Whale Clans',band:'Hayrant-Crookshore',frag:'kits/hueru-kuran',
 ground:0x585c58,groundProc:0x525652,fog:0xc2cecc,furnDetail:.6};
const HK={DOOR_H:2.1,WALL:.46,SOCLE:.52,PLINTH:.48,RISER:.18,RING_W:2.4};
const HK_POLITIES={
 kuranOta:{clan:'Kuran-Ota',coords:[89,604],elev:'+78 m terrace & drowned caldera throat',role:'High Matron Ukor citadel, Santa Cristina drawdown step-well & Leviathan wave-splitter'},
 nephriteThroat:{clan:'Kuran-Hueru',coords:[81,677],elev:'+86 m basalt bench',role:'jade=200 emerald-nephrite pendulum wire-saw mills & chime-maker guild'},
 baleenSound:{clan:'Kuran-Rik',coords:[104,562],elev:'+72 m marine terrace',role:'deep-sound filter-whale flensing stages, try-works & baidarka shipyards'},
 prouCaldera:{clan:'Kuran-Prou',coords:[123,659],elev:'+94 m rim & intertidal throat',role:'intertidal Nuraghe Prou-Torre refuge keeps, kelp-soda glassworks & 90-second cliff hoists'},
 ukorTera:{clan:'Kuran-Tera',coords:[124,710],elev:'+690 m high terrace',role:'30 m red-cypress ship-log flume headworks, upland granary-nuraghi & Hayrant sister-clan pass'}};
/* MAT key -> packed library family (materials.json). Includes kits/resources ore keys and engine fallback keys so 100% of
   opaque/lit surfaces in the scene carry real library maps. */
const SV_LIB={
 basalt:'basalt',columnar:'columnar',ashlar:'ashlar',corbel:'corbel',paving:'paving',
 nephrite:'nephrite',jade:'jade',chime:'chime',
 whalebone:'whalebone',baleen:'baleen',ivory:'ivory',
 turf:'turf',peat:'peat',bark:'bark',cypress:'cypress',driftwood:'driftwood',totemWood:'totemWood',nauticalCrest:'nauticalCrest',nauticalCrestB:'nauticalCrestB',tarwood:'tarwood',wood:'wood',floor:'floor',
 kaen:'kaen',glaze:'glaze',bronze:'bronze',verdigris:'verdigris',iron:'iron',seaglass:'seaglass',
 gutskin:'gutskin',hide:'hide',pelt:'pelt',kelp:'kelp',netting:'netting',banner:'banner',
 rope:'rope',reed:'reed',flag:'flag',plain:'plain',brass:'brass',bone:'bone',
 stone:'stone',earth:'earth',sand:'sand',marble:'marble',gossan:'gossan',malachite:'malachite',quartz:'quartz',
 cassiterite:'cassiterite',galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',
 tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'};
const SV_TILE0={
 basalt:2,columnar:1.8,ashlar:1.5,corbel:1.6,paving:2.2,
 nephrite:1.1,jade:.75,chime:.65,
 whalebone:1.1,baleen:.65,ivory:.5,
 turf:1.8,peat:1.6,bark:1.3,cypress:1.5,driftwood:1.6,totemWood:1.2,nauticalCrest:1.8,nauticalCrestB:1.8,tarwood:1.4,wood:1.5,floor:1.8,
 kaen:1,glaze:1.1,bronze:.8,verdigris:.9,iron:.8,seaglass:.7,
 gutskin:.95,hide:1.2,pelt:.8,kelp:.9,netting:.65,banner:1.1,
 rope:.28,reed:1,flag:1,plain:1.4,brass:.5,bone:.5,
 stone:2.4,earth:2.8,sand:3,marble:1.6,gossan:2,malachite:1.5,quartz:1.5,
 cassiterite:1.5,galena:1.5,pegmatite:1.5,coal:1.5,sulphur:1.6,efflor:2,tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8};
/* Every wind-responsive membrane, drying kelp curtain, net, banner and suspended nephrite chime joins SV_CLOTH:
   double-sided, carries aFlut pin-weights from CLOTHW, and hooks live ATMOS wind in 90z-hk-atmos.js. */
const SV_CLOTH={gutskin:1,hide:1,kelp:1,netting:1,banner:1,chime:1,flag:1};
const SV_CUT=Object.assign({
 basalt:1,columnar:1,ashlar:1,corbel:1,nephrite:1,jade:1,whalebone:1,baleen:1,
 turf:1,peat:1,bark:1,cypress:1,driftwood:1,totemWood:1,nauticalCrest:1,nauticalCrestB:1,tarwood:1,wood:1,kaen:1,glaze:1,
 bronze:1,verdigris:1,iron:1,seaglass:1,pelt:1,reed:1,plain:1},SV_CLOTH);
const KIT_FALLBACK=[];
const SVPAL={
 basalt:[0x3b3f44,0x34383d,0x43484e],basaltD:[0x2a2d31,0x24272b],
 columnar:[0x31363c,0x2b3036,0x393f46],ashlar:[0x484e54,0x40464c,0x50565c],
 corbel:[0x4c5056,0x44484e],paving:[0x5e6266,0x54585c],
 nephrite:[0x247a54,0x1e6c4a,0x2e8860],nephriteBright:[0x36a270,0x2e9464],
 jade:[0x328e68,0x28805c,0x3c9c74],chime:[0x2c8e62,0x247e56,0x389c6e],
 whalebone:[0xe8e1cf,0xdfd7c3,0xf0ead9],whaleboneAged:[0xd2c9b2,0xc8be9f],
 baleen:[0x2b292c,0x232124,0x353236],ivory:[0xf2ecdc,0xe8e1ce],
 turf:[0x4c6838,0x425c30,0x567440],turfMoss:[0x5a7a3e,0x4e6e36],
 peat:[0x3a322a,0x322a23],bark:[0x784430,0x6c3c29,0x844c37],
 cypress:[0x8e4c34,0x82442d,0x9a543b],cypressD:[0x5e3322,0x522b1c],
 driftwood:[0x9c9282,0x908676,0xa89e8e],totemWood:[0x968c7c,0x8e4c34,0xa29686],nauticalCrest:[0xf8f4ec],nauticalCrestB:[0xf8f4ec],tarwood:[0x2e2824,0x26201d],
 wood:[0x7a583c,0x6e4e34],floor:[0x886446,0x7c5a3e],
 kaen:[0xb85834,0xaa4e2c,0xc4623c],kaenSoot:[0x7e3e28,0x703622],
 glaze:[0x468878,0x3c7c6c,0x529484],
 bronze:[0xa67c40,0x987036,0xb2884a],verdigris:[0x4a8a74,0x3e7e68],
 iron:[0x403e3c,0x363432],brass:[0xc0943c,0xb08632],bone:[0xebe3d0,0xe0d7c2],
 seaglass:[0x68b49e,0x5ca892,0x74c0aa],
 gutskin:[0xe6d49e,0xdcc890,0xf0dea8],hide:[0x8c6848,0x7e5c3e,0x987452],
 pelt:[0x5c4a3c,0x504034,0x685444],kelp:[0x3c5832,0x324c28,0x46643a],
 netting:[0xa69474,0x9a8868],banner:[0xd8ccb4,0xcec0a8],
 rope:[0xb89a64,0xac8e58],reed:[0xb6a06c,0xaa9460],
 stone:[0x6e7072,0x626466],stoneD:[0x484b4e,0x3e4144],earth:[0x6e5c48,0x625240],sand:[0xbcb49e,0xb0a892],
 water:[0x22585e,0x1b4c52],flame:[0xffb450],ember:[0xff6e20],jadeGlow:[0x4ce098]};
function P(k){return jc(pick(SVPAL[k]),.04);}
