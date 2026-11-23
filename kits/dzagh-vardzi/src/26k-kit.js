// ================================================================= THE KIT: Dzagh-Vardzi identity, library families, and palette ([G data])
// Petty Gorge-Kingdoms of Dzagh-Vardzi ("Gorge-Wards") of Vardzieti / Crookwash (+950..+2,274 m, K1-K7 + Flumi-Bridzi),
// culture `dzagh-vardzi`. Engine: core/engine read in place.
// Synthesis (DV2 + DV4 + DV3): warm apricot-rose volcanic tuff & dark charcoal columnar-basalt horizontal ablaq courses,
// sawn emerald-green nephrite (jade = 200) cross-medallions, golden-skarn arched tympanums, stacked Dagestani stone roof-plazas,
// clustered 5:1 battered defense needle-towers crowned with gleaming stepped snow-white quartz pyramids, 12-pleat fluted conical
// Akhtamar umbrella spires (gumbat) in patinated verdigris copper (Cu = 130) & crimson/apricot tuff, and chasm-straddling
// gravity log-flume keeps & triple overshot waterwheel trip-hammer forges.
const KIT={id:'dzagh-vardzi',title:'Dzagh-Vardzi Gorge-Kingdoms Kit',pack:'dzagh-vardzi',culture:'dzagh-vardzi',
 faction:'Petty Gorge-Kingdoms of Dzagh-Vardzi',band:'Vardzieti (Crookwash)',frag:'kits/dzagh-vardzi',
 ground:0x62704b,groundProc:0x576642,fog:0xcad3d8,furnDetail:.65};

/* the 7 lateral gorge-kingdoms (K1-K7) + neutral confluence hamlet Flumi-Bridzi */
const DV_KINGDOMS={
 K1:{code:'K1',name:'Khai-Geti',title:'High-Gate Gorge'},
 K2:{code:'K2',name:'Red-Spairi',title:'Apricot-Spire Gorge'},
 K3:{code:'K3',name:'Tin-Flitsi',title:'Tin-Fleece Gorge'},
 K4:{code:'K4',name:'Airn-Dzaghi',title:'Magnetite-Gorge'},
 K5:{code:'K5',name:'Rozi-Vardzi',title:'Rose-Tuff Ward'},
 K6:{code:'K6',name:'Mist-Khopri',title:'Copper-Mist Gorge'},
 K7:{code:'K7',name:'Dzedi-Khrosi',title:'Jade-Cross Gorge'},
 H0:{code:'H0',name:'Flumi-Bridzi',title:'Confluence Flume-Bridge Hamlet'}
};

/* the two structural modes (tags.style and the life layer's sub-faction) */
const DV_SUB={
 aul:{name:'Terraced Cliff-Auls & Gumbat Courts',band:'Vardzieti Lateral Valleys (K1-K7)'},
 flume:{name:'Flume-Forge & Chasm-Mill Hamlets',band:'Flumi-Bridzi Confluence'}
};

/* the library families (materials.json -> tex/ -> 26-matlib-pack.js) */
const SV_LIB={
 tuff:'tuff',tuffPolished:'tuffPolished',basalt:'basalt',colBasalt:'colBasalt',
 jade:'jade',jadeInlay:'jadeInlay',skarn:'skarn',carve:'carve',quartz:'quartz',
 cobble:'cobble',rivercobble:'rivercobble',cliff:'cliff',slate:'slate',flagstone:'flagstone',shellrender:'shellrender',
 verdigris:'verdigris',bronze:'bronze',scaleMail:'scaleMail',silver:'silver',gold:'gold',brass:'brass',iron:'iron',
 cypress:'cypress',wood:'wood',planks:'planks',floor:'floor',endgrain:'endgrain',
 terracotta:'terracotta',fleece:'fleece',kilim:'kilim',wool:'wool',flag:'flag',rope:'rope',bone:'bone',plain:'plain',
 turf:'turf',earth:'earth',stone:'cobble',sand:'earth',coal:'coal',cassiterite:'cassiterite',gossan:'gossan',efflor:'efflor',malachite:'malachite',flumeWater:'flumeWater'
};

const SV_TILE0={
 tuff:1.8,tuffPolished:1.5,basalt:1.6,colBasalt:2.8,
 jade:.7,jadeInlay:1.1,skarn:1.5,carve:1.3,quartz:1.3,
 cobble:1.9,rivercobble:2.2,cliff:4,slate:1.5,flagstone:2,shellrender:2.2,
 verdigris:1.4,bronze:.9,scaleMail:.45,silver:.6,gold:.5,brass:.7,iron:.85,
 cypress:1.5,wood:1.6,planks:1.8,floor:1.8,endgrain:.6,
 terracotta:1.1,fleece:.85,kilim:1.6,wool:1.1,flag:.6,rope:.28,bone:.5,plain:1,
 turf:2.2,earth:2.6,stone:2,sand:2.6,coal:1.2,cassiterite:1.2,gossan:1.4,efflor:1.4,malachite:1.1,flumeWater:1.8
};

const SV_CLOTH={flag:1,kilim:1,wool:1};

/* buckets the X cut-away opens on buildings with cut:true (floors, flagstones, root-skirts & cliff rock stay uncut) */
const SV_CUT={
 tuff:1,tuffPolished:1,basalt:1,jade:1,jadeInlay:1,skarn:1,carve:1,quartz:1,
 slate:1,shellrender:1,verdigris:1,bronze:1,scaleMail:1,silver:1,gold:1,brass:1,iron:1,
 cypress:1,wood:1,planks:1,terracotta:1,fleece:1,kilim:1,wool:1,flag:1,rope:1,bone:1,plain:1,glass:1
};

const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);

/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // DV2 polychrome masonry: apricot-rose volcanic tuff, crimson tuff, charcoal basalt & golden skarn
 tuff:[0xd6896b,0xce8062,0xde9375],
 tuffCrimson:[0xb85844,0xae503c,0xc2624e],
 tuffPale:[0xe2a88c,0xd89e82,0xebb296],
 basalt:[0x3b3d42,0x33353a,0x44464c],
 colBasalt:[0x32353a,0x2b2e33,0x3b3e44],
 skarn:[0xd8a85a,0xce9e50,0xe2b264],
 carve:[0xdcb292,0xd2a888,0xe5bc9c],
 // DV2/DV4 nephrite jade inlays (jade = 200) & snow-white quartz needle-tower pyramids
 jade:[0x28865a,0x227a50,0x329466],
 jadeBright:[0x38a46e,0x2e9862,0x42b078],
 quartz:[0xf2f0ea,0xeae8e0,0xf8f6f2],
 // gorge cobbles, flagstones & cliff bedrock
 cobble:[0x7e7a74,0x74706a,0x88847e],
 rivercobble:[0x887e72,0x7e7468,0x92887c],
 stone:[0x848078,0x7a766e,0x8e8a82],
 stoneD:[0x58544e,0x4e4a44],
 cliff:[0x6e6660,0x645c56,0x78706a],
 slate:[0x4e5c68,0x465460,0x586672],
 flagstone:[0x8e8880,0x847e76,0x98928a],
 shellrender:[0xe6ded0,0xdcd4c6],
 // metals: patinated verdigris copper (Cu = 130), heirloom tin-bronze, magnetite scale, silver & placer gold
 verdigris:[0x4e9482,0x448876,0x5aa08e],
 bronze:[0xb88a44,0xac7e3a,0xc4964e],
 brass:[0xc69a46,0xba8e3c],
 silver:[0xd0d5dc,0xc4cad2],
 gold:[0xe0ac3c,0xd4a032],
 iron:[0x343538,0x2b2c2f],
 // red-cypress logs, heavy flume beams & weathered chutes
 cypress:[0x743c2a,0x6a3424,0x804432],
 cypressDark:[0x4a2419,0x401e14],
 wood:[0x6c5038,0x624832,0x76583e],
 planks:[0x8a6e52,0x806448,0x94785c],
 floor:[0x7c6248,0x725840],
 endgrain:[0xc69c70,0xbc9266],
 // qvevri terracotta, golden-fleece sheepskins, kilims & apricot harvest
 terracotta:[0xba5e3e,0xb05434,0xc46848],
 fleece:[0xeee6d2,0xe4dcc8],
 crimson:[0xa22e2a,0x962622,0xae3632],
 saffron:[0xc88c30,0xbc8228],
 indigo:[0x2c486a,0x243e5c],
 apricot:[0xe8862e,0xdc7c26,0xf29238],
 apricotBlossom:[0xf2c2c6,0xe8b6ba],
 rope:[0x9c8054,0x90744a],
 bone:[0xe8e0ca,0xded6c0],
 turf:[0x5c7240,0x526838],
 earth:[0x765c44,0x6c523c],
 leaf:[0x4c7034,0x587c3c,0x40622a],
 cypressFoliage:[0x284a32,0x22402a,0x30563a],
 flame:[0xffb24c],
 ember:[0xff6420],
 water:[0x388892],
 flumeWater:[0x68ccd6,0x76d6df,0x5cc0ca],
 flumeFoam:[0xd6f4f7,0xc8eef2],
 foam:[0xdcf0f2]
};
function P(k){return jc(pick(SVPAL[k]),.04);}
