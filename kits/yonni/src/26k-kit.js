// ================================================================= THE KIT: Yonni identity, library families, and palette ([G data])
// The Twin-Born Spear-Queens (Sfira-Kandetae) of Yonni (346, 418) and the Scoured Hills (rmwetizlzivnz), culture `yonni`.
// Engine: core/engine read in place. Wet coastal mountains (+166..+4,402 m, 1,647-2,200 mm/yr): coarse coastal granite &
// rust-ironstone river-cobble lower drums with telescoping battered root-skirts, pale crushed-shell hydraulic sea-lime
// rendered shafts, dark oiled coastal ironwood arcades, slate-blue shingle & patinated verdigris bronze Round Rain-Canopies,
// tin-bronze (tin = 200) ribs & twin-spear finials, and warm woven wool / carnelian-dyed interior textiles.
const KIT={id:'yonni',title:'Yonni Spear-Queens Kit',pack:'yonni',culture:'yonni',faction:'Twin-Born Spear-Queens of Yonni',band:'Yonni Coast',
 frag:'kits/yonni',ground:0x6b7c54,groundProc:0x5f704a,fog:0xc6d4d8,furnDetail:.65};
/* the two structural modes / sub-regions (tags.style and the life layer's sub-faction) */
const YN_SUB={freestanding:{name:'Yonni Round-Towers',band:'Yonni Coast'},cliff:{name:'Scoured-Hills Cliff-Holds',band:'Scoured Hills'}};
/* the library families (materials.json -> tex/ -> 26-matlib-pack.js) */
const SV_LIB={
 cobble:'cobble',rivercobble:'rivercobble',ironstone:'ironstone',stone:'stone',granite:'granite',cliff:'cliff',corbel:'corbel',ashlar:'ashlar',
 sealime:'sealime',sealimeWarm:'sealimeWarm',shellrender:'shellrender',travertine:'travertine',relief:'relief',
 slate:'slate',shingle:'shingle',turf:'turf',verdigris:'verdigris',bronze:'bronze',brass:'brass',gilt:'gilt',iron:'iron',seam:'seam',
 ironwood:'ironwood',wood:'wood',carved:'carved',planks:'planks',floor:'floor',endgrain:'endgrain',
 flagstone:'flagstone',terracotta:'terracotta',wool:'wool',kilim:'kilim',sail:'sail',flag:'flag',rope:'rope',bone:'bone',plain:'plain',
 earth:'earth',sand:'sand',coal:'coal',cassiterite:'cassiterite',gossan:'gossan',efflor:'efflor'
};
const SV_TILE0={
 cobble:1.9,rivercobble:2.2,ironstone:2.2,stone:2.4,granite:2.8,cliff:4.2,corbel:1.6,ashlar:1.8,
 sealime:2.4,sealimeWarm:2.5,shellrender:1.8,travertine:1.8,relief:1.4,
 slate:1.5,shingle:1.6,turf:2.2,verdigris:1.6,bronze:1,brass:.8,gilt:.9,iron:.9,seam:1.4,
 ironwood:1.6,wood:1.6,carved:1.2,planks:1.8,floor:1.8,endgrain:.6,
 flagstone:2,terracotta:1.2,wool:1.2,kilim:1.8,sail:1.8,flag:.6,rope:.3,bone:.5,plain:1,
 earth:2.8,sand:3.6,coal:1.2,cassiterite:1.2,gossan:1.4,efflor:1.4
};
const SV_CLOTH={sail:1,flag:1,kilim:1};
/* buckets the X cut-away opens on buildings with cut:true (ground/cliff/root-skirts stay uncut) */
const SV_CUT={
 cobble:1,rivercobble:1,ironstone:1,stone:1,corbel:1,ashlar:1,sealime:1,sealimeWarm:1,shellrender:1,travertine:1,relief:1,
 slate:1,shingle:1,turf:1,verdigris:1,bronze:1,brass:1,gilt:1,iron:1,seam:1,
 ironwood:1,wood:1,carved:1,planks:1,terracotta:1,wool:1,kilim:1,sail:1,flag:1,rope:1,bone:1,plain:1,glass:1
};
const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // coarse coastal granite, river cobble & rust-ironstone bases
 cobble:[0x8c877d,0x827d74,0x948e84],
 rivercobble:[0x968878,0x8c7e6e,0xa09282],
 ironstone:[0x8c6852,0x825e48,0x96725c],
 granite:[0x8a8e92,0x7e8286,0x94989c],
 stone:[0x88847c,0x7e7a72,0x928e86],
 stoneD:[0x5c5852,0x524e48],
 cliff:[0x8e7c68,0x82705c,0x988672],
 corbel:[0xc8beaa,0xbeb4a0,0xd0c6b2],
 ashlar:[0xc4baa6,0xbab09c,0xcec4b0],
 travertine:[0xded2bc,0xd5c8b0,0xe6dac4],
 relief:[0xd6c8b0,0xccbda4],
 foam:[0xf0f6f8,0xe6f0f4],
 // pale crushed-shell hydraulic sea-lime renders (warm coastal cream & pale shell-white)
 sealime:[0xe4dac6,0xdcd2be,0xebe2ce],
 sealimeW:[0xd8c6aa,0xcfbda0,0xe0ceb2],
 sealimeIn:[0xdfd5c2,0xd6ccba],
 // conical rain-canopies: slate-blue shingle, patinated verdigris copper/bronze, tin-bronze & burnished copper-gilt
 slate:[0x526472,0x4a5b68,0x5c6e7c],
 slateD:[0x3e4c58,0x364450],
 shingle:[0xc8a47c,0xbe9a72,0xd2ae86],
 verdigris:[0x5c9688,0x528a7c,0x68a294],
 bronze:[0xb88e4a,0xac8240,0xc49a54],
 brass:[0xc89e48,0xbc923e],
 gilt:[0xd48e42,0xc88238,0xdf984c],
 copperTrim:[0xc86438,0xbc5a30],
 iron:[0x383634,0x2e2c2a],
 seam:[0x5a6e76,0x50646c],
 // dark oiled coastal ironwood joinery & weathered deck planks
 ironwood:[0x3e2c20,0x36261b,0x483426],
 wood:[0x6e5038,0x644832,0x78583e],
 planks:[0x8e765c,0x846c52,0x988066],
 floor:[0x7e664c,0x745c44],
 endgrain:[0xc29e74,0xb8946a],
 // stone paving, terracotta, textiles (carnelian-dyed wool, indigo, amber, bleached sailcloth)
 flagstone:[0x969086,0x8c867c,0xa09a90],
 terracotta:[0xb66242,0xaa5838,0xc06c4c],
 carnelian:[0xa83828,0xb4402e,0x983020],
 indigo:[0x2e4c6e,0x284260],
 amberCl:[0xc88a32,0xbc802a],
 woolPale:[0xe2d8c4,0xd8ceba],
 sail:[0xe6dfd0,0xdcd5c6],
 turf:[0x627642,0x586c3a],
 rope:[0x9e8256,0x92764c],
 bone:[0xe6dec8,0xdcd4be],
 earth:[0x7c6248,0x705840],
 sandG:[0xd4c29c,0xcab892],
 flame:[0xffb24c],
 ember:[0xff6820],
 leaf:[0x4e7032,0x5a7c3a,0x426228],
 pine:[0x385834,0x2e4c2a],
 water:[0x2a6870]
};
function P(k){return jc(pick(SVPAL[k]),.04);}
