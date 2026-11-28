// ================================================================= THE KIT: identity, library families, wind buckets & palette ([G data])
// The Hush-Kin ("Sutiru-Kuran" Still-Clan to their Utari-Kuran neighbours; 9,000 souls, aggression: 0) of Silent Vales
// (twin ribbon lakes 196,928 & 186,1020, political polygons rmwzq292w0qc9 / rmw4wizrk66e1; LORE.md §6.26 & PLAN.md):
// living inside "The Great Hush" broadband acoustic-suppression field where speech, footsteps and clatter vanish to -inf dB
// and ONLY pure sinusoidal harmonics (440 / 660 Hz) pass undamped. 100% Two-Handed Sign Language (Handspeak) architecture:
// pale high-divide pegmatite granite & blue-grey slate terraces, gleaming stepped snow-white milky-quartz & rock-crystal
// optical heliograph spires, open sightline sign-loggias with chest-height parabolic lamps, bianzhong/nephrite harmonic racks,
// and carved raised open-palm boundary monoliths.
const KIT={id:'hush-kin',title:'Hush-Kin White-Quartz Sanctuary Kit of Silent Vales',pack:'hush-kin',culture:'hush-kin',
 faction:'Hush-Kin Sanctuary Folk',band:'Silent-Vales-Sanctuary',frag:'kits/hush-kin',
 ground:0x525c64,groundProc:0x48525a,fog:0xd2dce4,furnDetail:.62};
const HS={DOOR_H:2.14,WALL:.34,POST_R:.24,SOCLE:.38,RISER:.18,HAND_LAMP_Y:1.25,RELIEF_STEP:.02};
const HS_STYLES={terrace:'terrace',gallery:'gallery',spire:'spire'};

const HS_LAKES={
 northLake:{site:'North Ribbon Lake',coords:[196,928],elev:'+1,880 m',
  role:'Mirror-calm glacial ribbon lake linked by underwater-cable silent ferries and optical white-quartz heliograph spires'},
 southLake:{site:'South Ribbon Lake',coords:[186,1020],elev:'+1,840 m',
  role:'Stepped Handspeak council moot-amphitheatre, lakeside sign-galleries, reed-skiff slips and contoured berry/grain terraces'},
 pegmatiteDivide:{site:'High Pegmatite Divide',coords:[192,974],elev:'+2,340 m',
  role:'Milky-quartz & rock-crystal veins, water-driven nephrite lithophone lapidaries, and tended pre-Cataclysm Hush-pylons'},
 southernHushGate:{site:'Southern Hush Threshold',coords:[184,904],elev:'+2,190 m',
  role:'Raised Open-Palm monolith pass gates and 440 Hz alarm watch-spires watching the sole external foe: rare Timpar-Kuran raiders'}
};

const HS_HARMONICS=[
 {key:'fundamental_a4',hz:440,ratio:'1:1',medium:'bianzhong bronze & milky-quartz tuning fork',role:'sanctuary moot & ferry arrival tone'},
 {key:'fifth_e5',hz:660,ratio:'3:2',medium:'emerald-nephrite qing lithophone slab',role:'cross-lake shore hail & guild call'},
 {key:'octave_a5',hz:880,ratio:'2:1',medium:'upper-tier elliptic bianzhong bell',role:'dusk lamp-lighting & hospice welcome'},
 {key:'twelfth_e6',hz:1320,ratio:'3:1',medium:'high-divide border watch nephrite chime',role:'silent-border Timpar-Kuran incursion alert'}
];

/* MAT key -> packed library family (materials.json). Covers snow-white quartz/crystal, pale granite/slate, nephrite/bianzhong,
   Ancient Hush-pylon alloy, warm joinery, damping textiles, kits/resources ore veins & engine fallbacks (100% textured). */
const SV_LIB={
 quartz:'quartz',crystal:'crystal',alabaster:'alabaster',
 granite:'granite',ashlar:'ashlar',slate:'slate',slateWall:'slateWall',paving:'paving',cobble:'cobble',
 nephrite:'nephrite',chimeNephrite:'chimeNephrite',jade:'jade',
 bronze:'bronze',chimeBronze:'chimeBronze',verdigris:'verdigris',brass:'brass',
 hushWhite:'hushWhite',hushAlloy:'hushAlloy',
 cypress:'cypress',birch:'birch',wood:'wood',timber:'timber',bark:'bark',
 felt:'felt',linen:'linen',flag:'flag',netting:'netting',rope:'rope',reed:'reed',hide:'hide',
 stone:'stone',plain:'plain',earth:'earth',turf:'turf',terracotta:'terracotta',copper:'copper',iron:'iron',bone:'bone',
 sand:'sand',marble:'marble',gossan:'gossan',malachite:'malachite',cassiterite:'cassiterite',
 galena:'galena',pegmatite:'pegmatite',coal:'coal',sulphur:'sulphur',efflor:'efflor',tar:'tar',potash:'potash',soda:'soda',schistem:'schistem',turq:'turq'
};

const SV_TILE0={
 quartz:1.3,crystal:1.1,alabaster:1.3,
 granite:2.2,ashlar:1.9,slate:1.5,slateWall:1.8,paving:2,cobble:1.9,
 nephrite:.85,chimeNephrite:.75,jade:.8,
 bronze:.8,chimeBronze:.65,verdigris:1.1,brass:.55,
 hushWhite:2,hushAlloy:1.8,
 cypress:1.6,birch:1.6,wood:1.6,timber:1.6,bark:1.2,
 felt:.9,linen:.85,flag:1,netting:.65,rope:.28,reed:1.5,hide:1.1,
 stone:2.2,plain:1.4,earth:2.6,turf:2,terracotta:.75,copper:.85,iron:.8,bone:.6,
 sand:3,marble:1.6,gossan:2,malachite:1.5,cassiterite:1.5,galena:1.5,pegmatite:1.5,
 coal:1.5,sulphur:1.6,efflor:2,tar:3,potash:1.6,soda:1.6,schistem:2,turq:.8
};

/* Wind-rigged silent valley-breeze buckets: linen Handspeak banners, sound-damping felt hangings, lake nets, flags,
   AND rigid-pendulum swaying bianzhong bronze bells (chimeBronze) & sawn nephrite qing lithophones (chimeNephrite)! */
const SV_CLOTH={linen:1,felt:1,netting:1,flag:1,chimeBronze:1,chimeNephrite:1};
const SV_CUT=Object.assign({
 quartz:1,crystal:1,alabaster:1,
 granite:1,ashlar:1,slate:1,slateWall:1,paving:1,cobble:1,
 nephrite:1,jade:1,bronze:1,verdigris:1,brass:1,hushWhite:1,hushAlloy:1,
 cypress:1,birch:1,wood:1,timber:1,bark:1,
 rope:1,reed:1,hide:1,stone:1,plain:1,terracotta:1,copper:1,iron:1,bone:1,turf:1,glass:1},SV_CLOTH);
const KIT_FALLBACK=[];
const KIT_HAS=k=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

const SVPAL={
 /* Gleaming stepped snow-white milky quartz & rock-crystal optical prism palette */
 quartz:[0xf6f7fa,0xeff2f7,0xfafbfd],quartzPure:[0xfbfcfe,0xf5f8fc],
 crystal:[0xe6f0f8,0xdceaf5,0xf0f6fc],alabaster:[0xf0ece2,0xe8e3d8],
 /* High-divide pale silver-grey pegmatite granite, dressed ashlar & blue-grey Silent-Vales slate */
 granite:[0xb8bec6,0xaeb5be,0xc2c8d0],graniteD:[0x8c939c,0x828992],
 ashlar:[0xcad0d6,0xc0c6ce,0xd3d8de],
 slate:[0x465464,0x3e4b5a,0x4f5e6f],slateD:[0x323d4a,0x2b3540],slateWall:[0x566474,0x4d5b6a],
 paving:[0x98a0a8,0x8e969e,0xa2aab2],cobble:[0x747c84,0x6a727a],
 stone:[0x80868e,0x767c84],stoneD:[0x5a6068,0x50565e],
 /* Sinusoidal 440/660 Hz emerald nephrite lithophones, elliptic bianzhong bronze & Ancient Hush-pylon white alloy */
 nephrite:[0x28845c,0x207650,0x329268],chimeNephrite:[0x2a8a60,0x227c54],jade:[0x389474,0x2e8668],
 bronze:[0xa88240,0x9c7638,0xb48e48],chimeBronze:[0xb68e46,0xaa823c],brass:[0xc89e44],
 verdigris:[0x4e9680,0x448a74],copper:[0xb8683c,0xac5e34],iron:[0x42464c,0x383c42],
 hushWhite:[0xe8ecf0,0xdde2e8],hushAlloy:[0x9ca8b4,0x909ca8],
 /* Warm sanctuary cypress, silver birch & sound-damping indigo/cream wool felt & crisp Handspeak linen */
 cypress:[0x8c5236,0x824a30,0x965a3d],cypressD:[0x5c3422,0x502c1d],
 birch:[0xd8ccb8,0xcec2ae,0xe0d5c2],wood:[0x86563a,0x7c4e34],timber:[0x624430,0x583c2a],bark:[0xdad4ca,0xcfc8be],
 felt:[0x364c68,0x2e425c,0xd8d2c6],feltCream:[0xe6e0d4,0xdcd6ca],feltIndigo:[0x324866,0x2a3e58],
 linen:[0xeeeae0,0xe4e0d6,0xf4f1e8],flag:[0xeae6dc,0x385270],
 netting:[0x9e947e,0x928872],rope:[0xb29868,0xa68c5e],reed:[0x968862,0x8c7e58],hide:[0x8c6848],
 earth:[0x625648,0x584c3e],turf:[0x4c6642,0x445c3a],terracotta:[0xb26a46,0xa6603e],
 bone:[0xece6d8],plain:[0x888e96],sand:[0xb4ac9a],
 glass:[0xd4e6f2],glassLit:[0xffd996],water:[0x1c4a58],flame:[0xffbe5c],ember:[0xff7c32],prismGlow:[0xfff0c8]
};
function P(k){return jc(pick(SVPAL[k]||SVPAL.granite),.03);}
