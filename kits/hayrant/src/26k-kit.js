// ================================================================= THE KIT: identity, library families, wind buckets & palette ([G data])
// The Hayrant ("Highlanders", Ainu-shifted Outer Wall vassals of the Eternal State and inland sister-branch of the
// Hueru-Kuran Whale Clans) of Circuit E6 (Mirabilis 350,726 & Sheritu 384,666 on biomes/wouterwall, kits/hayrant/PLAN.md).
const KIT={id:'hayrant',title:'Hayrant Vassal Kit of the Western Outer Wall',pack:'hayrant',culture:'hayrant',
 faction:'The Eternal State',band:'Hayrant-Outer-Wall',frag:'kits/hayrant',
 ground:0x666452,groundProc:0x5e5c4b,fog:0xc6cbc6,furnDetail:.6};
const HY={DOOR_H:2.15,WALL:.44,SOCLE:.48,PLINTH:.44,RISER:.18,RING_W:2.1};
const HY_STYLES={bench:'bench',hybrid:'hybrid',prefect:'prefect',sanctuary:'sanctuary'};
const HY_SEATS={
 mirabilis:{seat:'Mirabilis',hayrant:'Mirapiris (Sutar-Kotan)',coords:[350,726],elev:'+3,125 m (1.08 atm)',
  role:'Circuit E6 prefectural seat, Sutar-Tawar Clock-Observatory, saltpeter caves (b=200), iron/tin/silver assay & insulator kilns'},
 sheritu:{seat:'Sheritu',hayrant:'Seritu (Sip-Rarc-Kotan)',coords:[384,666],elev:'+3,598 m (1.02 atm)',
  role:'Fur-larch & needle-cypress ship-timber escarpment flumes to Fulcrum, gold-silver-tin adits & Siru-Hom Withdrawn True-Heir sanctuaries'},
 ukorPass:{seat:'Ukor-Tera Divide Pass',hayrant:'Hueru-Kuran Pas',coords:[124,710],elev:'+690..+3,400 m divide trail',
  role:'Cross-pass sister-clan trade exchanging E6 iron, tin, tea & saltpeter for Crookshore 3-ton sawn emerald-nephrite lintels, seismic chimes & Leviathan whalebone'}};

/* MAT key -> packed library family (materials.json). Covers Hayrant, Hueru-Kuran cousin, Eternian suzerain peer,
   kits/resources ore node, and engine fallback keys so 100% of opaque/lit surfaces carry real library maps. */
const SV_LIB={
 megabreccia:'megabreccia',basalt:'basalt',columnar:'columnar',ashlar:'ashlar',corbel:'corbel',
 loess:'loess',silt:'silt',earth:'earth',lime:'lime',brick:'brick',block:'block',blockB:'blockB',blockC:'blockC',
 stone:'stone',paving:'paving',tile:'tile',celadon:'celadon',glaze:'glaze',kaen:'kaen',terracotta:'terracotta',
 scale:'scale',gilt:'gilt',nephrite:'nephrite',jade:'jade',chime:'chime',alabaster:'alabaster',onyx:'onyx',
 larch:'larch',timber:'timber',planks:'planks',shutter:'shutter',tarwood:'tarwood',bark:'bark',turf:'turf',reed:'reed',puya:'puya',
 whalebone:'whalebone',bone:'bone',
 bronze:'bronze',brass:'brass',verdigris:'verdigris',iron:'iron',gold:'gold',silver:'silver',gunmetal:'gunmetal',lead:'lead',titanium:'titanium',white:'white',
 plaid:'plaid',hemp:'hemp',hide:'hide',pelt:'pelt',netting:'netting',rope:'rope',flag:'flag',plain:'plain',
 screen:'screen',screenB:'screenB',maze:'maze',mazeB:'mazeB',mazeC:'mazeC',frieze:'frieze',sign:'sign',faces:'faces',
 sand:'sand',marble:'marble',gossan:'gossan',malachite:'malachite',quartz:'quartz',cassiterite:'cassiterite',
 galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'};

const SV_TILE0={
 megabreccia:3.2,basalt:2,columnar:1.8,ashlar:1.5,corbel:1.6,
 loess:3,silt:1.6,earth:2.8,lime:2.4,brick:1.2,block:1.6,blockB:1.6,blockC:1.6,
 stone:2.4,paving:2,tile:1.2,celadon:2.2,glaze:.6,kaen:1,terracotta:.6,
 scale:1.2,gilt:1.2,nephrite:1.1,jade:.75,chime:.65,alabaster:1,onyx:1,
 larch:1.5,timber:1.6,planks:2,shutter:1,tarwood:1.4,bark:1.3,turf:1.8,reed:2,puya:1.1,
 whalebone:1.1,bone:.5,
 bronze:.8,brass:.5,verdigris:1.1,iron:.8,gold:.8,silver:.8,gunmetal:.8,lead:.6,titanium:3,white:2,
 plaid:1,hemp:.95,hide:1.2,pelt:.8,netting:.65,rope:.28,flag:1,plain:1.4,
 screen:2,screenB:2,maze:3,mazeB:3,mazeC:3,frieze:10,sign:1,faces:1,
 sand:3,marble:1.6,gossan:2,malachite:1.5,quartz:1.5,cassiterite:1.5,galena:1.5,pegmatite:1.5,
 coal:1.5,sulphur:1.6,efflor:2,tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8};

/* Wind-rigged katabatic membranes, Hayrant cave-madder plaid banners, wallhemp lines, hide wind-flaps & nephrite chimes */
const SV_CLOTH={plaid:1,hemp:1,hide:1,netting:1,chime:1,flag:1,sign:1};
const SV_CUT=Object.assign({
 megabreccia:1,basalt:1,columnar:1,ashlar:1,corbel:1,loess:1,silt:1,lime:1,brick:1,block:1,blockB:1,blockC:1,
 stone:1,tile:1,celadon:1,glaze:1,kaen:1,terracotta:1,scale:1,gilt:1,nephrite:1,jade:1,alabaster:1,onyx:1,
 larch:1,timber:1,planks:1,shutter:1,tarwood:1,bark:1,turf:1,reed:1,puya:1,whalebone:1,bone:1,
 bronze:1,brass:1,verdigris:1,iron:1,gold:1,silver:1,gunmetal:1,lead:1,titanium:1,white:1,
 pelt:1,plain:1,screen:1,screenB:1,maze:1,mazeB:1,mazeC:1,frieze:1,faces:1,glass:1},SV_CLOTH);
const KIT_FALLBACK=[];
const KIT_HAS=k=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

const SVPAL={
 // Western Outer Wall bedrock, loess & Sardinian nuraghe masonry
 megabreccia:[0x46484e,0x3e4046,0x4e5158],basalt:[0x3a3e44,0x33373d,0x42474e],basaltD:[0x2a2d32,0x24272c],
 columnar:[0x31363c,0x2b3036,0x383e45],ashlar:[0x494f56,0x41474e,0x51575e],corbel:[0x4d5158,0x454950],
 loess:[0xc9b186,0xc1a87d,0xd1ba90],loessD:[0xa89068,0x9e865f],silt:[0xb29d7a,0xa89370],earth:[0x74644a,0x6a5b42],
 // Eternian suzerain lime, buff brick, cast block, celadon & ancestor metals (shared with read-in-place et_* peers)
 lime:[0xeae2d0,0xeee6d6,0xe2dac8],limeShade:[0xc8c0ae,0xbeb6a4],
 block:[0xd4ccb8,0xccc4ae,0xdad2be],brick:[0xd9cdb4,0xe4dac4,0xd0c4aa],
 stone:[0x66686c,0x5c5e62],stoneD:[0x4a4a50,0x52525a,0x44444a],stoneH:[0xd8d0bf,0xccc4b2],
 paving:[0x9c968a,0x928c80,0xa6a094],tile:[0x666b70,0x5e6368,0x6e7378],
 celadon:[0x8fb8a0,0x86b098,0x98c0a8],glaze:[0x78ac96,0x6ea08a,0x84b6a0],
 shutter:[0x6e8892,0x76909a,0x66808a],shutterC:[0x8fb8a0,0x86b098],
 bronze:[0x9c7a3c,0x94723a,0xa68244],brass:[0xc0943c,0xb08632],verdigris:[0x569680,0x4c8c76],
 gold:[0xd8b24a],silver:[0xc9ccd2,0xc2c6cc],gunmetal:[0x4a5058,0x444a52],pewter:[0x8a8f96,0x82878e],
 lead:[0x6e7278,0x666a70],titanium:[0x9aa1a8],alabaster:[0xefe7d6],onyx:[0xd8cfb8],white:[0xeeebe5],
 black:[0x141416],green:[0x3f8a5a,0x387e50],
 // Crookshore cousin nephrite jade, Jomon kaen-doki terracotta, larch crucks, turf & prized whalebone
 nephrite:[0x2a7e58,0x22704d,0x328a62],nephriteBright:[0x3aa272,0x329466],
 jade:[0x348e68,0x2a805c,0x3e9a74],chime:[0x2e8e64,0x267e58,0x389c70],
 kaen:[0xb65a36,0xa8502e,0xc26440],kaenSoot:[0x7c3e28,0x6e3622],terracotta:[0xb06a44,0xa8623e],
 larch:[0x8a4e34,0x7e462e,0x96563b],larchD:[0x583222,0x4e2b1d],
 timber:[0x52392a,0x4a3426,0x5a4030],timberL:[0x72533a,0x7a5b40],planks:[0x84684c,0x785e44],
 tarwood:[0x2c2622,0x241f1c],bark:[0x764430,0x6a3c29,0x824c36],
 turf:[0x566c3a,0x4c6032,0x607642],reed:[0xb6a272,0xaa9668],puya:[0xa89a74,0x9c8e68],
 whalebone:[0xe8e1cf,0xded6c2,0xf0ead9],whaleboneAged:[0xd0c6af,0xc6bc9e],bone:[0xebe3d0,0xe0d7c2],
 // Hayrant cave-madder plaid (CROPS.canPlaid('wouterwall'): madder red, larch red-brown, birch-tar black, lichen ochre)
 plaid:[0x94322a,0x862b24,0xa23a31],plaidGold:[0xc69642,0xb88a38],plaidDark:[0x2c2628,0x242022],
 hemp:[0xcabca0,0xbfb094,0xd4c6aa],hide:[0x8a6646,0x7c5a3c],pelt:[0x5c4a3c,0x504034,0x685444],
 netting:[0xa69474,0x9a8868],rope:[0xb69862,0xaa8c56],
 glass:[0x2e3a42,0x34404a],glassLit:[0xe8c890],iron:[0x3c3834,0x322e2b],
 water:[0x1c484c,0x163c40],flame:[0xffb44e],ember:[0xff7224],leaf:[0x4c6a2e,0x587634]};
function P(k){return jc(pick(SVPAL[k]||SVPAL.stone),.04);}
