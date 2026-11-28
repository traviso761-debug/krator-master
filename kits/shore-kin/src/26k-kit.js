// ================================================================= THE KIT: identity, Arch material limits, rigging math & palette ([G data])
// Shore-Kin Vernacular Architectural Kit (Arcoforte Phase P3c, §2.2b):
//   Mixed Fleet-born (cFlit-qBon) + Rian (Ria Sound) + Eternian + Hueru-Kuran client villages & harbour crews in the Arch
//   hinterland around Arcoforte. Strictly constrained to Arch local & sea-derived materials (ZERO Crookshore nephrite/jade,
//   ZERO red cypress):
//     - Rian strand: arched laterite cuirasse & pillow-basalt flood socles, mangrove boardwalks & drying decks, 2-to-3 tier
//       Costularia/uluhe/pandanus thatch roofs with upswept carved Metrosideros ohia gable horns.
//     - Eternian strand: hexagonal plans, oyster-shell & limeshelf whitewash, pierced brucite-travertine block screens,
//       closed-eyed fired laterite-clay (or paktong for house heads) ancestor door masks, tarred mangrove-pile harbour cribs.
//     - Hueru-Kuran strand: battered dry-laid white-veined green serpentinite & buff-rind dunite ring walls, steamed mangrove-knee
//       & drift whale-rib vaults under paperbark-lined coastal turf domes, oiled sharkskin & ray-hide awnings, flame-rimmed
//       laterite-terracotta kiln/chimney crowns.
//     - Fleet-born accents: mangrove-tannin catechu red-brown sails/awnings, verdigris nickel-ash trim, paktong fittings,
//       vesicular pumice net-floats, spun golden sea-byssus banners.
const KIT={
 id:'shore-kin',
 title:'Shore-Kin Vernacular Architectural Kit',
 pack:'shore-kin',
 culture:'shore-kin',
 faction:'Caretaker House of Arcoforte',
 band:'Shore-Kin Hinterland Villages',
 frag:'kits/shore-kin',
 ground:0x948d7e,
 groundProc:0x8b8475,
 fog:0xd4ddde,
 furnDetail:.62
};

const SK={
 DOOR_H:2.18,
 WALL:.38,
 SOCLE:.44,
 RISER:.18,
 HEX_AP:Math.cos(Math.PI/6),
 TIDE_MEAN:12.0,
 TIDE_NEAP:8.2,
 TIDE_SPRING:14.3,
 TIDE_DOUBLE_DARK:15.6
};

/* Explicit blacklist of non-Arch / Crookshore materials forbidden anywhere in kits/shore-kin */
const SK_FORBIDDEN_MATERIALS=['nephrite','jade','red-cypress','red_cypress','cypress'];

/* Canonical Arch local & sea-derived material table ([G data]) for SIM billing & KCONS site piles */
const SK_ARCH_MATERIALS={
 serpentinite:{cat:'stone',good:'stone',bucket:'serpentinite',origin:'Arch ultramafic massif (white-veined green serpentinite)'},
 dunite:{cat:'stone',good:'stone',bucket:'dunite',origin:'Arch peridotite/dunite slopes (buff-ochre weathered rind)'},
 laterite:{cat:'stone',good:'brick',bucket:'laterite',origin:'Arch ferricrete plateau (sawn laterite cuirasse block)'},
 pillow_basalt:{cat:'stone',good:'stone',bucket:'pillowbasalt',origin:'Arch submarine headland toes (intertidal pillow basalt)'},
 brucite_travertine:{cat:'stone',good:'stone',bucket:'brucite',origin:'Arch alkaline spring curtains (brucite-travertine block)'},
 pumice:{cat:'stone',good:'pumice',bucket:'pumice',origin:'Arch volcanic strand drift (vesicular pumice block & floats)'},
 araucaria:{cat:'timber',good:'timber',bucket:'araucaria',origin:'Arch upper gjár slopes (Araucaria & Agathis spar offcuts)'},
 mangrove:{cat:'timber',good:'timber',bucket:'mangrove',origin:'Arch intertidal belt (Avicennia & verdigris-mangrove posts & knees)'},
 tarred_mangrove:{cat:'timber',good:'timber',bucket:'tarmangrove',origin:'Arch harbour cribs (bitumen-tarred worm-proof mangrove piles)'},
 ohia:{cat:'timber',good:'timber',bucket:'ohia',origin:'Arch wet gullies (hard Metrosideros rata/ohia carved finials)'},
 coconut:{cat:'timber',good:'timber',bucket:'coconut',origin:'Arch strand groves (Cocos round posts & purlins)'},
 salvage_hull:{cat:'timber',good:'planks',bucket:'salvage',origin:'Arcoforte cove & strand (drift & salvaged ship hull planks)'},
 paperbark:{cat:'timber',good:'bark',bucket:'paperbark',origin:'Arch swamp margin (Melaleuca paperbark roof lining & caulk)'},
 casuarina_fuel:{cat:'fuel',good:'fuel',bucket:'casuarina',origin:'Arch maquis & barrens (Casuarina & Gymnostoma fuel billets)'},
 shell_limewash:{cat:'binder',good:'lime',bucket:'limewash',origin:'Arch visor & curtains (burnt oyster shell & limeshelf lime)'},
 shell_terrazzo:{cat:'binder',good:'lime',bucket:'paving',origin:'Arch kilns (crushed shell & kelp-ash mortar floor)'},
 laterite_terracotta:{cat:'ceramic',good:'terracotta',bucket:'terracotta',origin:'Arch laterite clay pits (fired clay masks & kaen crowns)'},
 catechu_stain:{cat:'finish',good:'dye',bucket:'catechu',origin:'Arch mangrove bark vats (red-brown Fleet-born catechu tannin)'},
 verdigris_ash:{cat:'finish',good:'nickel_ash',bucket:'verdigris',origin:'Arch barrens clamps (Pycnandra & verdigris-mangrove nickel ash)'},
 paktong:{cat:'metal',good:'paktong',bucket:'paktong',origin:'Arcoforte spring-campaign cupola (white copper-nickel-zinc paktong)'},
 copper_zinc_ore:{cat:'metal',good:'copper_ore',bucket:'copperore',origin:'Arch KRES node / Copper Tarn fair (roasted copper-zinc charge)'},
 iron_fittings:{cat:'metal',good:'iron',bucket:'iron',origin:'Arcoforte salvage & smithy (forged iron dogs, saws & hoops)'},
 bitumen_gum:{cat:'binder',good:'pitch',bucket:'bitumen',origin:'Arch gjár seep & Agathis groves (bitumen & kauri-gum pitch)'},
 thatch_costularia:{cat:'fibre',good:'thatch',bucket:'thatch',origin:'Arch maquis & gullies (Costularia sedge, uluhe fern & pandanus thatch)'},
 turf_dome:{cat:'fibre',good:'turf',bucket:'turf',origin:'Arch coastal sedge turf (interlocking peat & sedge dome sods)'},
 pandanus_mat:{cat:'fibre',good:'matting',bucket:'pandanus',origin:'Arch strand pandan (plaited Pandanus strap-fibre mats & screens)'},
 coir_hibiscus:{cat:'fibre',good:'cordage',bucket:'rope',origin:'Arch strand & hibiscus thickets (twisted coir & bast cordage)'},
 byssus_cloth:{cat:'fibre',good:'byssus',bucket:'byssus',origin:'Arch spring-low mussel beds (spun golden sea-byssus cloth)'},
 shark_ray_hide:{cat:'organic',good:'hide',bucket:'sharkhide',origin:'Arch outer shoals (oiled sharkskin & spotted ray-hide awnings)'},
 whalebone_drift:{cat:'organic',good:'bone',bucket:'whalebone',origin:'Arch outer strand (stranded pelagic whale-rib vault arches)'},
 shell_chime:{cat:'organic',good:'shell',bucket:'shellchime',origin:'Arch intertidal visor (nacreous oyster, Trochus & conch shells)'},
 kelp_wrack:{cat:'organic',good:'kelp',bucket:'kelp',origin:'Arch subtidal shoals (harvested shoalkelp fronds for ash & drying)'},
 sea_salt:{cat:'mineral',good:'salt',bucket:'salt',origin:'Arch outer-sill solar pans (evaporated sea salt)'}
};

/* Pure engine-neutral geometry & rigging math ([G data]), tested by tests/test-shore-kin.js */
const skRigMath={
 cornerPin(u,v){
  const uu=Math.max(0,Math.min(1,u)),vv=Math.max(0,Math.min(1,v));
  const c00=Math.hypot(uu,vv),c10=Math.hypot(1-uu,vv),c01=Math.hypot(uu,1-vv),c11=Math.hypot(1-uu,1-vv);
  const minC=Math.min(c00,c10,c01,c11);
  const edge=4*uu*(1-uu)*0.55+4*vv*(1-vv)*0.45;
  return Math.min(1,minC/0.24)*(0.32+0.68*edge);
 },
 hangPin(v){
  const vv=Math.max(0,Math.min(1,v));
  return Math.pow(vv,1.25);
 },
 chimePin(v){
  return Math.max(0,Math.min(1,v));
 },
 ringRadius(rBase,rTop,t){
  const tt=Math.max(0,Math.min(1,t));
  return rBase+(rTop-rBase)*Math.pow(tt,0.86);
 },
 ribVaultArc(rSpring,ySpring,rCrown,yCrown,t){
  const tt=Math.max(0,Math.min(1,t));
  const r=rSpring+(rCrown-rSpring)*Math.pow(tt,1.18);
  const y=ySpring+(yCrown-ySpring)*Math.sin(tt*Math.PI*0.5);
  return [r,y];
 },
 tideMarkY(baseY,scale,rangeM){
  return +(baseY+scale*(rangeM*0.5)).toFixed(4);
 }
};

const SV_LIB={
 serpentinite:'serpentinite',dunite:'dunite',laterite:'laterite',pillowbasalt:'pillowbasalt',
 brucite:'brucite',pumice:'pumice',limewash:'limewash',paving:'paving',
 araucaria:'araucaria',mangrove:'mangrove',tarmangrove:'tarmangrove',ohia:'ohia',
 coconut:'coconut',salvage:'salvage',casuarina:'casuarina',paperbark:'paperbark',floor:'floor',
 terracotta:'terracotta',catechu:'catechu',catechutrim:'catechutrim',
 verdigris:'verdigris',paktong:'paktong',bronze:'bronze',iron:'iron',
 copperore:'copperore',bitumen:'bitumen',
 thatch:'thatch',turf:'turf',pandanus:'pandanus',rope:'rope',byssus:'byssus',
 sharkhide:'sharkhide',rayhide:'rayhide',whalebone:'whalebone',shellchime:'shellchime',
 kelp:'kelp',netting:'netting',salt:'salt',ash:'ash',
 plain:'plain',brass:'brass',bone:'bone',flag:'flag',stone:'stone',earth:'earth',sand:'sand'
};

const SV_TILE0={
 serpentinite:1.8,dunite:1.9,laterite:1.7,pillowbasalt:2.0,brucite:1.5,pumice:1.3,
 limewash:2.1,paving:2.0,araucaria:1.5,mangrove:1.4,tarmangrove:1.4,ohia:1.1,
 coconut:1.2,salvage:1.6,casuarina:1.3,paperbark:1.3,floor:1.8,
 terracotta:1.0,catechu:1.1,catechutrim:1.2,verdigris:.95,paktong:.75,bronze:.8,iron:.8,
 copperore:1.1,bitumen:1.6,thatch:1.5,turf:1.8,pandanus:1.0,rope:.28,byssus:.95,
 sharkhide:1.0,rayhide:.95,whalebone:1.1,shellchime:.55,kelp:.9,netting:.65,salt:1.5,ash:1.4,
 plain:1.4,brass:.5,bone:.5,flag:1.0,stone:2.4,earth:2.8,sand:3.0
};

const SV_CLOTH={
 sharkhide:1,rayhide:1,catechu:1,byssus:1,kelp:1,netting:1,shellchime:1,flag:1
};

const SV_CUT=Object.assign({
 serpentinite:1,dunite:1,laterite:1,pillowbasalt:1,brucite:1,pumice:1,limewash:1,
 araucaria:1,mangrove:1,tarmangrove:1,ohia:1,coconut:1,salvage:1,paperbark:1,
 terracotta:1,catechutrim:1,verdigris:1,paktong:1,bronze:1,iron:1,
 thatch:1,turf:1,pandanus:1,whalebone:1,plain:1
},SV_CLOTH);

const KIT_FALLBACK=[];

const SVPAL={
 serpentinite:[0x3b5847,0x334d3e,0x456452],
 serpentiniteL:[0x587663,0x4e6b58],
 dunite:[0x8d7b58,0x816f4e,0x998662],
 duniteD:[0x6e5f42,0x63553a],
 laterite:[0x9c472c,0x8f3e25,0xa95135],
 lateriteD:[0x78331e,0x6c2c19],
 pillowbasalt:[0x3b3f44,0x32363b,0x45494f],
 brucite:[0xe7e1d2,0xddd6c6,0xf0eadc],
 bruciteD:[0xcbc3b0,0xc0b7a4],
 pumice:[0xc6bfb2,0xbab3a6,0xd1cabe],
 limewash:[0xf4f0e6,0xebe6da,0xf8f5ee],
 limeShade:[0xdad3c3,0xcfc8b7],
 paving:[0xd2cab8,0xc6beac,0xdcd4c4],
 araucaria:[0x8a6443,0x7e5a3b,0x966e4c],
 araucariaL:[0xa47b56,0x98704c],
 mangrove:[0x5b3f2e,0x503627,0x674835],
 tarmangrove:[0x2b221d,0x231b17,0x342a24],
 ohia:[0x6e3528,0x622d21,0x7b3d2f],
 coconut:[0x7b5c42,0x6f523a,0x87664a],
 salvage:[0x745c48,0x68513f,0x806752],
 casuarina:[0x64503e,0x584636,0x705a47],
 paperbark:[0xd8ccb8,0xccbfaa,0xe2d7c4],
 floor:[0x825d3e,0x765336,0x8e6746],
 terracotta:[0xbe5636,0xb04c2e,0xcb6140],
 catechu:[0x8c3526,0x7e2d1f,0x9a3e2e],
 catechutrim:[0x7a291d,0x6c2217,0x883124],
 verdigris:[0x4c947e,0x408670,0x58a28b],
 paktong:[0xdce1e6,0xd0d6dc,0xe6ebf0],
 bronze:[0xa67a3e,0x986e35,0xb28648],
 iron:[0x484b50,0x3e4146,0x52565c],
 copperore:[0x3b8468,0x31765b,0x469275],
 bitumen:[0x1d1b1a,0x161413,0x252321],
 thatch:[0xa88c56,0x9b804c,0xb59860],
 thatchD:[0x8a7042,0x7e653a],
 turf:[0x556e42,0x4b6239,0x607a4b],
 pandanus:[0xc2ab78,0xb69f6d,0xceb784],
 rope:[0xc4a262,0xb89656,0xd0ae6e],
 byssus:[0xd8ad48,0xcca13e,0xe4b954],
 sharkhide:[0xb8ad96,0xaca18a,0xc4b9a2],
 rayhide:[0x5e6668,0x525a5c,0x6a7274],
 whalebone:[0xdcd5c4,0xd0c8b6,0xe6dfd0],
 whaleboneAged:[0xc2b9a4,0xb6ad98],
 shellchime:[0xf0ebe2,0xe6e0d5,0xf7f3ec],
 kelp:[0x384828,0x2e3d20,0x435431],
 netting:[0x9c8662,0x907a56,0xa8926e],
 salt:[0xf2efe8,0xe8e4dc,0xf8f6f0],
 ash:[0x626864,0x565c58,0x6e7470],
 water:[0x24626c,0x1d545e],
 ember:[0xe86a24],
 flame:[0xffbe58]
};

function P(k){return jc(pick(SVPAL[k]),.035);}
