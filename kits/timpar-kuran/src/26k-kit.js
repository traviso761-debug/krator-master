// ================================================================= THE KIT: identity, library families, wind buckets & palette ([G data])
// The Timpar-Kuran ("Timber-Clans", mountain pronunciation Timpar-K'uran; political polygon rmwzqi9dwnd31, px 126-281 x 612-961)
// of the Veiled Mountains (biomes/veiledmountains, kits/timpar-kuran/PLAN.md): the unconquered raiding third branch of the
// Utari-Kuran complex (kin to Hueru-Kuran on Crookshore and Hayrant on the Western Outer Wall), fusing Jomon/Ainu pit-lodges,
// stepped cise roofs, kaen-doki flame-ware, pu rat-baffled stilt caches, inau spirit-wands & nusa skull-fences with monumental
// PNW/Tlingit split red-cypress plank-houses, black-red-teal formline screens, oval totem-mouth portals & chasi-noow ridge forts.
const KIT={id:'timpar-kuran',title:'Timpar-Kuran Timber-Clan Kit of the Veiled Mountains',pack:'timpar-kuran',culture:'timpar-kuran',
 faction:'Timpar-Kuran Timber Clans',band:'Veiled-Mountain-Clans',frag:'kits/timpar-kuran',
 ground:0x3f4c36,groundProc:0x384430,fog:0xb8c6c2,furnDetail:.62};
const TK={DOOR_H:2.12,WALL:.34,POST_R:.28,SOCLE:.42,RISER:.18,FORMLINE_STEP:.016};
const TK_STYLES={jomon:'jomon',plank:'plank',crest:'crest'};

const TK_CRESTS={
 kuma:{key:'kuma',name:'Kuma (Kim-un-kamuy Mountain Bear)',animal:'bear',primary:0x141619,secondary:0xb63124,tertiary:0x1f6e6c,eye:0xc6783e},
 kapac:{key:'kapac',name:'Kapac (Thunderbird and Storm-Eagle)',animal:'eagle',primary:0x141619,secondary:0xb63124,tertiary:0x1f6e6c,eye:0xd48844},
 rapan:{key:'rapan',name:'Rapan (Mist-Raven Trickster)',animal:'raven',primary:0x141619,secondary:0xae2e22,tertiary:0x227672,eye:0xc6783e},
 hueru:{key:'hueru',name:'Hueru (Ancestral Leviathan Whale)',animal:'whale',primary:0x141619,secondary:0xb63124,tertiary:0x1b6866,eye:0xc6783e},
 wurup:{key:'wurup',name:'Wurup (Cloud-Wolf Raider)',animal:'wolf',primary:0x141619,secondary:0xba3626,tertiary:0x1f6e6c,eye:0xd08242}
};
const TK_CREST_KEYS=['kuma','kapac','rapan','hueru','wurup'];

const TK_VALLEYS={
 veilpass:{valley:'Veilpass',kuran:'Timpar-Ru (Mist-Gate Gorge)',elev:'+2,420 m',
  role:'High gorge pass linking Crookshore Hueru-Kuran and Outer Wall Hayrant kin; chasi-noow toll forts & cousin truce-lodge'},
 mistValley:{valley:'Mist Valley',kuran:'Kotan-Pet (Great Salmon U-Valley)',elev:'+2,150 m',
  role:'Hoh-scale red-cypress & cloud-cedar valley floor, monumental Timpar-Cise clan halls, salmon weirs & potlatch courts'},
 mistValley2:{valley:'Mist Valley North',kuran:'Kanopi-Nupuri (Shattered Canopy Bench)',elev:'+2,580 m',
  role:'Crash-zone talus of Ancient arcology Kanopi; titanium-ceramic rib reliquaries, salvage delves & iomante bear shrines'},
 region177:{valley:'Region 177 Raid Marches',kuran:'Chasi-Kotan (Ridge-Fort Spurs)',elev:'+2,680 m',
  role:'Eastern megabreccia spurs overlooking Eternian lowlands; mustering grounds, rockfall traps & ransom stockades'}
};

/* MAT key -> packed library family (materials.json). Covers Timpar-Kuran timber/formline/kaen/salvage, Eternian war-loot,
   kits/resources ore veins, and engine fallbacks so 100% of opaque/lit surfaces carry decoded library maps. */
const SV_LIB={
 cypress:'cypress',cedar:'cedar',silverwood:'silverwood',totem:'totem',totemB:'totemB',inau:'inau',tarwood:'tarwood',timber:'timber',wood:'wood',
 formBlack:'formBlack',formRed:'formRed',formTeal:'formTeal',formCrest:'formCrest',formCrestB:'formCrestB',
 bark:'bark',shingle:'shingle',reed:'reed',thatch:'thatch',matting:'matting',
 megabreccia:'megabreccia',cobble:'cobble',basalt:'basalt',stone:'stone',earth:'earth',turf:'turf',
 kaen:'kaen',terracotta:'terracotta',celadon:'celadon',
 copper:'copper',bronze:'bronze',brass:'brass',verdigris:'verdigris',iron:'iron',kanopiAlloy:'kanopiAlloy',kanopiWhite:'kanopiWhite',
 jade:'jade',chilkat:'chilkat',attus:'attus',hide:'hide',pelt:'pelt',netting:'netting',rope:'rope',bone:'bone',antler:'antler',
 flag:'flag',plain:'plain',
 sand:'sand',marble:'marble',gossan:'gossan',malachite:'malachite',quartz:'quartz',cassiterite:'cassiterite',
 galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'
};

const SV_TILE0={
 cypress:1.8,cedar:2,silverwood:1.8,totem:1.2,totemB:1.2,inau:.85,tarwood:1.4,timber:1.6,wood:1.5,
 formBlack:1.1,formRed:1.1,formTeal:1.1,formCrest:2,formCrestB:2,
 bark:1.4,shingle:1.6,reed:1.8,thatch:1.6,matting:1,
 megabreccia:3,cobble:1.8,basalt:2,stone:2.2,earth:2.6,turf:2,
 kaen:.95,terracotta:.65,celadon:.6,
 copper:.85,bronze:.8,brass:.5,verdigris:1,iron:.8,kanopiAlloy:2.4,kanopiWhite:2,
 jade:.8,chilkat:1,attus:.85,hide:1.1,pelt:.8,netting:.65,rope:.28,bone:.6,antler:.5,
 flag:1,plain:1.4,
 sand:3,marble:1.6,gossan:2,malachite:1.5,quartz:1.5,cassiterite:1.5,galena:1.5,pegmatite:1.5,
 coal:1.5,sulphur:1.6,efflor:2,tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8
};

/* Wind-rigged valley-mist membranes: Chilkat crest blankets, elm-bark attus hangings, shaved-willow inau curls, smoked salmon/hides & nets */
const SV_CLOTH={chilkat:1,attus:1,inau:1,hide:1,netting:1,flag:1};
const SV_CUT=Object.assign({
 cypress:1,cedar:1,silverwood:1,totem:1,totemB:1,tarwood:1,timber:1,wood:1,
 formBlack:1,formRed:1,formTeal:1,formCrest:1,formCrestB:1,
 bark:1,shingle:1,reed:1,thatch:1,matting:1,
 megabreccia:1,cobble:1,basalt:1,stone:1,turf:1,
 kaen:1,terracotta:1,celadon:1,
 copper:1,bronze:1,brass:1,verdigris:1,iron:1,kanopiAlloy:1,kanopiWhite:1,
 jade:1,pelt:1,rope:1,bone:1,antler:1,plain:1,glass:1},SV_CLOTH);
const KIT_FALLBACK=[];
const KIT_HAS=k=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

const SVPAL={
 /* Veiled-Mountain conifers: split red-cypress, cloud-cedar, mist-silvered logs, tarred sills & shaved willow inau */
 cypress:[0x8c4c32,0x82442c,0x965438],cypressD:[0x5a301f,0x4e291a],cypressPale:[0xa86b49,0x9e6242],
 cedar:[0x7e6248,0x745940,0x886b50],cedarD:[0x523f2e,0x483628],
 silverwood:[0x8e8b82,0x848178,0x98958c],totem:[0x945c3c,0x885234,0xa06644],totemB:[0x945c3c,0x885234,0xa06644],
 inau:[0xefe8d5,0xe6dec8,0xf4eedc],tarwood:[0x2a231e,0x221c18],
 timber:[0x583e2c,0x4e3626],wood:[0x844830,0x7a422b],
 /* Salmon-egg-tempera Tlingit formline pigments: lignite black, cinnabar/ochre red, celadonite/verdigris teal */
 formBlack:[0x15171a],formRed:[0xb63124],formTeal:[0x1f6e6c],formOchre:[0xc88e32],formWhite:[0xede5d2],formCrest:[0xf6f0e8],formCrestB:[0xf6f0e8],
 /* Bark, cedar shakes, stepped Ainu reed/sedge thatch & woven mats */
 bark:[0x6e3e2b,0x633625,0x7a4632],shingle:[0x68523e,0x5e4936,0x725b46],
 reed:[0x7c6e4c,0x726444,0x867854],thatch:[0x94825a,0x8a7852],matting:[0xb8a478,0xac986c],
 /* Impact megabreccia, glacial river cobbles, basalt, packed earth & mossy rainforest sod */
 megabreccia:[0x464950,0x3e4148,0x4f535a],cobble:[0x5c5e60,0x525456,0x66686a],
 basalt:[0x363a40,0x2e3238],stone:[0x64666a,0x5a5c60],stoneD:[0x484a50,0x404248],
 earth:[0x5c4a38,0x524232],turf:[0x465e34,0x3e542e,0x4e683a],
 /* Cord-marked Jomon kaen-doki flame-ware clay & raided Eternian celadon */
 kaen:[0xb45834,0xa64e2c,0xc0623c],kaenSoot:[0x6e3622,0x5e2e1d],
 terracotta:[0xae6642,0xa25e3c],celadon:[0x88b49c,0x7ea890],
 /* Cold-hammered native copper tinaa, Kanopi arcology titanium-ceramic alloy, jade & raided Eternian bronze/iron */
 copper:[0xb8683c,0xac5e34,0xc47244],bronze:[0x98763a,0x8e6c34],brass:[0xbe923a],
 verdigris:[0x4e927c,0x448670],iron:[0x3a3632,0x302c28],
 kanopiAlloy:[0x9ea8b2,0x929ca6,0xaab4be],kanopiWhite:[0xe2e4e6,0xd6d8dc],
 jade:[0x2c7e58,0x24704c,0x368c64],
 /* Chilkat wool-and-bark weaving, elm-bark attus, smoked salmon/hide, bear pelts & nusa skulls */
 chilkat:[0xc89a3c,0x1f6e6c,0xb63124],attus:[0xc8b896,0xbcae8c,0xd2c2a0],
 hide:[0x8c6444,0x7e583a],salmon:[0xc44e34,0xb8442c],pelt:[0x4a382a,0x3e2e22,0x564232],
 netting:[0x9c8c6c,0x908062],rope:[0xad905c,0xa08452],
 bone:[0xe8e0cc,0xdcd4be],antler:[0xd8ccb2,0xccC0a6],
 flag:[0xc8b896],plain:[0x686a6e],sand:[0xa89c84],
 glass:[0x364246],glassLit:[0xefc888],water:[0x1a4648],flame:[0xffb24a],ember:[0xff6e22]
};
function P(k){return jc(pick(SVPAL[k]||SVPAL.stone),.035);}
