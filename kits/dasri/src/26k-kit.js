// ================================================================= THE DASRI KIT: identity, library families, palette ([G data])
// Yemeni-inspired architecture of the Dasri (LORE.md 6.8, 3.1; kits/dasri/PLAN.md):
//   Register 1 (urban): Jabal (capital of the Jabal Sheikhdom, Train of Jabal salt guild) — basalt/ashlar stone bases,
//                       warm fired red brick, crisp white juss/qadad geometric chevron & diamond bands, stained-glass
//                       qamariya fanlights, carved cedar mashrabiya boxes, horned shurfat parapets & rooftop mafraj belvederes.
//   Register 2 (village): Dasri foothill, wadi-ledge & Catch/Bowl oasis settlements (Arfwai, Solta) — coursed rubble &
//                         battered zabur mudbrick, madamik mud courses, restrained whitewash lintel eyebrows, exposed pole
//                         roofs, beehive granaries, saqiya wells, halite salt sheds & fortified oasis qasr.
const KIT={
 id:'dasri',
 title:'Dasri Kit',
 pack:'dasri',
 culture:'dasri',
 faction:'The Dasri',
 band:'Train of Jabal',
 frag:'kits/dasri',
 ground:0xc2a882,
 groundProc:0xc8ae88,
 fog:0xe2ceb0,
 furnDetail:.65
};

const DS_CFG={
 SCALE:1.0,
 DOOR_H:2.15,
 DOOR_VIL_H:1.95,
 WALL_URB:.44,
 WALL_VIL:.48,
 SOCLE_URB:.55,
 SOCLE_VIL:.85,
 CLIFF_SKIRT:4.8,
 HUMAN_H:1.75
};

/* MAT key -> packed family in materials.json */
const SV_LIB={
 brick:'brick',
 banco:'banco',
 roof:'roof',
 floor:'floor',
 qadad:'qadad',
 stucco:'stucco',
 ashlar:'ashlar',
 basalt:'basalt',
 rubble:'rubble',
 cliff:'cliff',
 halite:'halite',
 cedar:'cedar',
 timber:'timber',
 awning:'awning',
 rug:'rug',
 bronze:'bronze',
 iron:'iron',
 rope:'rope'
};

/* metres per tile when ?mat=proc */
const SV_TILE0={
 brick:1.5,banco:2.2,roof:2.8,floor:2.0,qadad:1.8,stucco:1.1,ashlar:2.4,basalt:1.8,
 rubble:2.0,cliff:6.0,halite:.9,cedar:1.2,timber:1.4,awning:1.2,rug:1.5,bronze:.8,iron:.8,rope:.35
};

const SV_CLOTH={awning:1,flag:1};
const SV_CUT=Object.assign({
 brick:1,banco:1,roof:1,qadad:1,stucco:1,ashlar:1,basalt:1,rubble:1,cedar:1,timber:1,rug:1,bronze:1,iron:1,plain:1
},SV_CLOTH);
const KIT_FALLBACK=[['stucco','qadad'],['basalt','rubble'],['ashlar','rubble'],['halite','qadad']];

/* sRGB palette arrays picked deterministically via P(k) */
const SVPAL={
 brick:[0xa86044,0x9e583e,0xb26a4c],
 brickD:[0x864832,0x7c422d],
 brickOchre:[0xba7848,0xb07040],
 banco:[0xc69a6b,0xbc9062,0xd0a475],
 bancoD:[0xa47a4f,0x997046],
 bancoL:[0xd8b488,0xcfa97c],
 qadad:[0xfaf8f2,0xf6f3eb,0xfdfcf8],
 qadadWarm:[0xf0e9da,0xeae1cf],
 stucco:[0xf5f0e4,0xefe9dc],
 ashlar:[0xd4bc96,0xc9b08a,0xdec6a0],
 ashlarD:[0xb49c78,0xa8906c],
 basalt:[0x504a46,0x47423e,0x5a534e],
 rubble:[0x948470,0x8a7a66,0x9e8e7a],
 cliff:[0xc48a62,0xb67d56,0xd0966e],
 cliffD:[0x9a6846,0x8e5e3e],
 halite:[0xf4f1ea,0xeae5da,0xf8f6f0],
 cedar:[0x563824,0x4c301e,0x62402a],
 shutter:[0x4a3222,0x344c46,0x5c3c28],
 timber:[0x9c866a,0x907a5e,0xa89276],
 roof:[0xdcc8a8,0xd2be9e],
 roofVil:[0xbea078,0xb4966e],
 floor:[0xcab696,0xc0ac8c],
 awning:[0xc85238,0x2e6e78,0xc88e32,0x9e3c2e],
 rug:[0xa6382c,0x285868,0xb87c28,0x6e2c3e],
 dye:[0x24487a,0xb23228,0xd49224,0x2a6e64],
 bronze:[0xb88c46,0xa67c3a],
 iron:[0x383432,0x2e2a28],
 rope:[0xb89c6c,0xa88c5c]
};

const DS_GLASS_HEX=[0xd88c24,0x249490,0x3268bc,0xc43e34,0x44985a];
function P(k){return jc(pick(SVPAL[k]),.04);}
