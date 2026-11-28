// ================================================================= THE KIT: identity, library families, wind buckets & palette ([G data])
// The Painted Men (Payntja-Mana, speaking Payntja-Tuka, "Paint-Talk") of the 3,000-4,000 m Painted Highlands
// (danxia sandstone hogbacks, banded badland bentonite clay hills, superbloom playas & 580 m Painted Canyon; kits/painted-men/PLAN.md).
const KIT={
 id:'painted-men',
 title:'Painted Men (Payntja-Mana) Building Kit of the Danxia and Badland Cliffs',
 pack:'painted-men',
 culture:'painted',
 faction:'Painted Men',
 band:'Payntja-Mana',
 frag:'kits/painted-men',
 ground:0x9c7252,
 groundProc:0x8c6446,
 fog:0xd4bfa8,
 furnDetail:.6
};
const PM={DOOR_H:2.05,WALL:.42,SOCLE:.44,PLINTH:.36,RISER:.18,VIGA_MAX:4.2};
const PM_STYLES={alcove:'alcove',maloca:'maloca',hung:'hung',salvage:'salvage'};
const PM_SITES={
 paintedCanyon:{
  site:'Painted Canyon Seep Alcoves',
  payntja:'Payntja-Warrka',
  region:'rmvkam8s13kwu',
  elev:'+3,000..+3,850 m',
  mode:'cliff-alcove',
  role:'Sandstone-bentonite seep-contact roomblocks, Mesa Verde keyhole doors, Wandjina & Yanta-Rringka rock art, WATER.still cisterns'
 },
 canyonFans:{
  site:'Talus Benches and Superbloom Playas',
  payntja:'Maluka-Pala',
  region:'rmvkam8s13kwu',
  elev:'+3,100..+3,600 m',
  mode:'talus-bench',
  role:'Bent oak & juniper cruck maloca halls thatched in Stripe bunchgrass, Dogon conical granaries, shamanic stone circles & truce moots'
 },
 silkheadRim:{
  site:'Korona Moat Lip and Silkhead Gorge',
  payntja:'Kuru-Rringka',
  region:'biomes/korona Station 7',
  elev:'+3,400 m lip over moat',
  mode:'cliff-ledge',
  role:'Cantilevered canyon-oak ledge houses, braided Korona wild-silk cargo winches, obsidian-pancake knapping & feathered Pukamani poles'
 }
};

/* Canonical Payntja-Mana mineral pigments + imported Korona hoar-table orchil lichen dye (PLAN.md §0, TRADE-SCOPE.md §7.1 & §7.6) */
const PM_PIGMENTS={
 ochreRed:0xb53324,
 rabbitGold:0xc98724,
 pipeclay:0xf4ede0,
 ligniteBlack:0x181614,
 celadoniteTeal:0x267974,
 orchilPurple:0x7e2854
};

/* MAT key -> packed library family (materials.json). Strictly zero bamboo and zero kiln-fired brick/tile/ceramic. */
const SV_LIB={
 danxia:'danxia',danxiaBuff:'danxiaBuff',danxiaCut:'danxiaCut',badland:'badland',
 bentonite:'bentonite',plasterOchre:'plasterOchre',ochreRed:'ochreRed',pipeclay:'pipeclay',
 celadoniteTeal:'celadoniteTeal',lignite:'lignite',
 stone:'stone',paving:'paving',earth:'earth',sand:'sand',cobble:'cobble',
 juniper:'juniper',canyonOak:'canyonOak',mahogany:'mahogany',planks:'planks',
 curedBark:'curedBark',juniperBark:'juniperBark',latilla:'latilla',pitchBasket:'pitchBasket',
 wicker:'wicker',bunchgrass:'bunchgrass',turf:'turf',
 handStencil:'handStencil',handStencilB:'handStencilB',rarrkBark:'rarrkBark',feather:'feather',featherWarm:'featherWarm',
 wildSilk:'wildSilk',hide:'hide',herbBundle:'herbBundle',pelt:'pelt',rope:'rope',
 obsidian:'obsidian',selenite:'selenite',
 salvageRust:'salvageRust',salvagePlate:'salvagePlate',iron:'iron',bronze:'bronze',
 brass:'brass',bone:'bone',flag:'flag',plain:'plain',
 marble:'marble',gossan:'gossan',malachite:'malachite',quartz:'quartz',cassiterite:'cassiterite',
 galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',
 tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'
};

const SV_TILE0={
 danxia:2.6,danxiaBuff:2.4,danxiaCut:1.8,badland:3,
 bentonite:2.2,plasterOchre:2,ochreRed:1.4,pipeclay:1.4,
 celadoniteTeal:1.1,lignite:1.2,
 stone:2.4,paving:2,earth:2.6,sand:2.8,cobble:2.2,
 juniper:1.4,canyonOak:1.6,mahogany:1.1,planks:1.8,
 curedBark:1.4,juniperBark:1.2,latilla:1.3,pitchBasket:.65,
 wicker:.9,bunchgrass:2,turf:1.8,
 handStencil:2.2,handStencilB:2.2,rarrkBark:1.4,feather:.45,featherWarm:.45,
 wildSilk:.85,hide:1.2,herbBundle:.7,pelt:.8,rope:.3,
 obsidian:.7,selenite:.9,
 salvageRust:1.4,salvagePlate:1.6,iron:.8,bronze:.6,
 brass:.5,bone:.5,flag:.9,plain:1.4,
 marble:1.6,gossan:2,malachite:1.5,quartz:1.5,cassiterite:1.5,
 galena:1.5,pegmatite:1.5,coal:1.5,sulphur:1.6,efflor:2,
 tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8
};

/* Canyon-updraught wind-rigged Korona feather crests, wild-silk hangings, pronghorn hide curtains & drying paintbrush herb bundles */
const SV_CLOTH={feather:1,featherWarm:1,wildSilk:1,hide:1,herbBundle:1,flag:1};
const SV_CUT=Object.assign({
 danxia:1,danxiaBuff:1,danxiaCut:1,badland:1,bentonite:1,plasterOchre:1,
 ochreRed:1,pipeclay:1,celadoniteTeal:1,lignite:1,stone:1,
 juniper:1,canyonOak:1,mahogany:1,planks:1,curedBark:1,juniperBark:1,
 latilla:1,pitchBasket:1,wicker:1,bunchgrass:1,turf:1,
 handStencil:1,handStencilB:1,rarrkBark:1,pelt:1,rope:1,obsidian:1,selenite:1,
 salvageRust:1,salvagePlate:1,iron:1,bronze:1,brass:1,bone:1,plain:1,glass:1
},SV_CLOTH);
const KIT_FALLBACK=[];
const KIT_HAS=k=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

const SVPAL={
 // Danxia sandstones & badland bentonite/smectite clay plasters
 danxia:[0xa84834,0xb4543c,0x983e2c],
 danxiaBuff:[0xc88a5e,0xd2966a,0xba7c52],
 danxiaCut:[0xb86848,0xc47452,0xa85c3e],
 badland:[0xc69e84,0xb88874,0xd4b296],
 bentonite:[0xe6d6c2,0xdecab4,0xede0ce],
 bentonitePink:[0xdcb29e,0xd2a490,0xe4beaa],
 plasterOchre:[0xc98724,0xbe7d20,0xd4922c],
 // Five canonical Arnhem/Payntja mineral pigments + imported Korona orchil lichen purple-crimson
 ochreRed:[0xb53324,0xa82e20,0xc23a2a],
 rabbitGold:[0xc98724,0xbc7c1e,0xd4922e],
 pipeclay:[0xf4ede0,0xebe3d4,0xf8f2e6],
 lignite:[0x181614,0x201d1a,0x141210],
 celadoniteTeal:[0x267974,0x206c68,0x2e8680],
 orchil:[0x7e2854,0x8c3060,0x6e2048],
 // Rubble, paving, playa & wash cobbles
 stone:[0x7a6254,0x6e584a,0x866c5e],
 stoneD:[0x524238,0x483a30,0x5c4a40],
 paving:[0xa47458,0x98684e,0xb07e62],
 earth:[0x7c5c44,0x70523c,0x88664c],
 sand:[0xc48662,0xb87a58,0xd0926c],
 cobble:[0x8a7464,0x7e6858,0x968070],
 // Plateau & canyon woods, bark, willow latillas & Stripe bunchgrass (zero bamboo)
 juniper:[0x7c543a,0x704a32,0x885e42],
 juniperD:[0x543826,0x4a3020],
 canyonOak:[0x684832,0x5e402c,0x74523a],
 mahogany:[0x58281e,0x4e221a,0x643024],
 planks:[0x846044,0x78563c,0x906a4c],
 curedBark:[0x8c664a,0x805c42,0x987052],
 juniperBark:[0x6a4a36,0x5e402e,0x76543e],
 latilla:[0xb89a68,0xac8e5e,0xc4a672],
 pitchBasket:[0x4c3422,0x422c1c,0x583c28],
 wicker:[0xa88a58,0x9c7e50,0xb49662],
 bunchgrass:[0xc6a058,0xba944e,0xd2ac64],
 bunchgrassAged:[0xa68448,0x9a7840],
 turf:[0x5c6e3c,0x526234,0x667844],
 // Korona bird feathers, braided wild-silk, pronghorn hides, obsidian & reclaimed salvage
 handStencil:[0xf8f2ea],
 handStencilB:[0xf8f2ea],
 rarrkBark:[0xf8f2ea],
 feather:[0x1e8c82,0x249c90,0x2ca876],
 featherWarm:[0xc84628,0xd67c22,0xb83820],
 wildSilk:[0xe8dfc8,0xded4bc,0xf0e8d4],
 wildSilkTeal:[0x2e827c,0x26746e],
 hide:[0x946c4a,0x886040,0xa07854],
 herbBundle:[0xb8462c,0xc47e28,0x748248],
 pelt:[0x8c6848,0x7e5c3e,0x9a7452],
 rope:[0xb69862,0xaa8c58],
 obsidian:[0x1c1e22,0x16181c,0x24272c],
 selenite:[0xefeae0,0xe6e0d4],
 salvageRust:[0x7e462c,0x703c24,0x8c5034],
 salvagePlate:[0x5a463c,0x4e3c34,0x665046],
 iron:[0x383430,0x2e2a27],
 bronze:[0x8e6c38,0x826232],
 brass:[0xb48a38,0xa67e30],
 bone:[0xebe3d0,0xe0d7c2],
 flag:[0xc88728,0xb53324],
 plain:[0x967e6c,0x8a7260],
 glass:[0x384248,0x2e383e],
 water:[0x1d5456,0x174648],
 flame:[0xffb44e],
 ember:[0xff6e24]
};
function P(k){return jc(pick(SVPAL[k]||SVPAL.stone),.04);}
