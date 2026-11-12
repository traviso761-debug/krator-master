// ================================================================= THE KIT: its identity, its library families, its palette, the registry
// The Kimr kit (biomes/labyrinth/KIMR.md is its design sheet; LORE.md 6.24 the culture): the Labyrinth's people and their raised
// pueblos, "southwestern meets Cimmerian". The engine is core/engine, read in place; the plans are core/pueblo's (KPUEBLO). So far
// one def, the example house (46-km-draw.js); everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours
//   SV_LIB       MAT key -> pack family (materials.json, none yet: the house draws on vertex colours; KIMR.md section 4 names the
//                library sets each key takes, PROMPTS-NEEDED.md section 41 the new ones owed)
//   SVPAL, P(k)  the palette (sRGB hex, KIMR.md section 2; P picks one and jitters it)
//   KM           the kit's registry: KM.spec (the plans), KM.check (a world's --assert)
const KIT={id:'kimr',title:'Kimr Kit',pack:'kimr',culture:'kimr',faction:'Kimr',band:'the Labyrinth',
 frag:'kits/kimr',ground:0x7c7a52,groundProc:0x6e6c48,fog:0xc8ccc4,furnDetail:.6};
/* the families a pack will fill (KIMR.md section 4): the chaos's stone, adobe and its kaolin wash, the earth roofs, larch poles,
   hide, fur, horn, ivory, skull, glyptodont shell, dung cakes */
const SV_LIB={stone:'stone',stoneD:'stone',adobe:'adobe',kaolin:'kaolin',roofE:'roofE',pole:'pole',hide:'hide',fur:'fur',horn:'horn',
 ivory:'ivory',skull:'skull',shell:'shell',dung:'dung',sinew:'sinew'};
const SV_TILE0={stone:2.4,stoneD:1.6,adobe:2,kaolin:2,roofE:2.2,pole:1.2,hide:1.4,fur:1,horn:.7,ivory:.6,skull:.6,shell:1.2,dung:1.2,sinew:.3};
const SV_CLOTH={hide:1};
const SV_CUT={stone:1,stoneD:1,adobe:1,kaolin:1,roofE:1,pole:1,hide:1,fur:1,horn:1,ivory:1,skull:1,shell:1,dung:1,sinew:1,plain:1,bone:1};
const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex; KIMR.md section 2) */
const SVPAL={
 /* the chaos's grey-brown rock for the plinth and the lower courses; adobe and the dung-and-straw plaster above; kaolin, the white
    wash of the richest walls; the earth roofs */
 stone:[0x8a7a66,0x82735f,0x94836d,0x7c6e5c],stoneD:[0x5e5446,0x564c40],adobe:[0xb48552,0xaa7c4c,0xbc8c58,0xa67a4e],
 kaolin:[0xece5d3,0xe4dcc8],roofE:[0x7a6248,0x725a42,0x826a4e],dungP:[0x8e7656,0x86704f],
 /* larch and poplar poles, the vigas; mammoth long bones */
 pole:[0x8e7a5c,0x846f52,0x987f60],
 /* the beasts: tanned aurochs and tusker hide, fur and mammoth wool, horn (dark root, pale tip), ivory, bone, skulls, the
    glyptodont's shell, dung cakes, sinew */
 hide:[0x8b6a48,0x7e6040,0x967352],fur:[0x5e4a38,0x54402e,0x6a5440],horn:[0x4a3524,0x5a432e],hornTip:[0xc7b48c,0xbca880],
 ivory:[0xe3d6b4,0xdccca6],bone:[0xd8ccb0,0xcec2a4],skull:[0xe2d8bc,0xd6caac],shell:[0x6e5c42,0x665438,0x76644a],shellB:[0x8a7652,0x806c4a],
 dung:[0x5a4a36,0x52422e,0x62503a],sinew:[0x9a8466],
 /* the paints: red ochre (life, the taking, the dead's hands), yellow ochre, charcoal, kaolin white; turquoise for the Ancients'
    things only */
 ochre:[0x9c3b23,0x94361f],ochreY:[0xd0a03c],char:[0x221c18],white:[0xece5d3],turq:[0x3a9e94],
 meat:[0x7a2e22,0x6e2a1e],ember:[0xff7a2a],flame:[0xffb04a],dark:[0x16120e]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
/* ---------------------------------------------------------------- the registry: KM (44-km-plan.js and 46-km-draw.js fill it) */
const KM={version:1};
