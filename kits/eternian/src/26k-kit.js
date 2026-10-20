// ================================================================= THE KIT: its identity, its library families, its palette
// The Eternian kit (the Eternal State, catalog and core/tags culture `eternian`), forked from kits/scyvoi (2026-10-20, as
// kits/islanders was). 27-mat.js and the other engine fragments are the Scyvoi kit's, vendored (build.py --vendor-check);
// everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json, P1); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: a sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (kits/eternian/PLAN.md section 2, LORE.md 6.19): Gothic remixed with Art Deco, the Soviet monumental and the
// faceted head; the master mass the stepped pier bundle; the lancet and the oculus; pale brick, dark stone, celadon
// glaze, verdigris, pewter, bronze, gold only as an accent; the canal town in white lime and grey tile with cast
// pattern block and a mask over every door. Never Warhammer: no skulls, no grime, no rust.
const KIT={id:'eternian',title:'Eternian Kit',pack:'eternian',culture:'eternian',faction:'The Eternal State',band:'the north-western lowlands',
 frag:'kits/eternian',ground:0x6e7a4a,groundProc:0x66724a,fog:0xc4cac2,furnDetail:.6};
/* the tiers, in the tag `style` (PLAN.md section 4) */
const ET_STYLES={host:'host',court:'court',ministry:'ministry',common:'common',poor:'poor'};
/* the library families (materials.json; ?mat=proc draws every key in its vertex colour). screen/screenB and maze/mazeB/mazeC
   are one key each with alternate takes: src/38-et-alt.js picks the take per placed instance */
const SV_LIB={lime:'lime',block:'block',brick:'brick',stone:'stone',tile:'tile',celadon:'celadon',timber:'timber',planks:'planks',
 shutter:'shutter',paving:'paving',earth:'earth',reed:'reed',silt:'silt',iron:'iron',bronze:'bronze',verdigris:'verdigris',onyx:'onyx',
 gold:'gold',alabaster:'alabaster',screen:'screen',screenB:'screenB',maze:'maze',mazeB:'mazeB',mazeC:'mazeC',frieze:'frieze',sign:'sign'};
const SV_TILE0={lime:2.4,block:1.2,brick:1.2,stone:2.6,tile:1.2,celadon:1.2,timber:1.6,planks:2,shutter:1,paving:2,earth:3,reed:2,silt:1.6,
 iron:.8,bronze:.8,verdigris:1.2,onyx:1,gold:.8,alabaster:1,screen:2,screenB:2,maze:3,mazeB:3,mazeC:3,frieze:10,sign:1};
const SV_CLOTH={flag:1,sign:1};
const SV_CUT={lime:1,block:1,brick:1,stone:1,tile:1,celadon:1,timber:1,planks:1,shutter:1,reed:1,silt:1,iron:1,bronze:1,verdigris:1,onyx:1,
 gold:1,alabaster:1,screen:1,screenB:1,maze:1,mazeB:1,mazeC:1,frieze:1,sign:1,plain:1,brass:1,bone:1,glass:1,flag:1};
const KIT_FALLBACK=[];
/* is a sheet in the pack */
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // the canal town: white lime over block, grey tile, the shutters' grey-blue and celadon
 lime:[0xe8e2d4,0xece6d8,0xe2dccc],limeShade:[0xc8c0ae,0xbeb6a4],block:[0xd4ccb8,0xccc4ae,0xdad2be],tile:[0x6a6e72,0x62666a,0x72767a],
 shutter:[0x7e98a4,0x86a0a8,0x768e9a],shutterC:[0x8fb8a0,0x86b098,0x98c0a8],
 // the State's materials: pale brick, dark stone, celadon glaze, verdigris, pewter, bronze, gold (accent only), gunmetal
 brick:[0xd9cdb4,0xe8e0cc,0xd2c6ac],stoneD:[0x4a4a50,0x52525a,0x44444a],celadon:[0x8fb8a0,0x86b098,0x98c0a8],verdigris:[0x5e9c86,0x56947e],
 pewter:[0x8a8f96,0x82878e],bronze:[0x9c7a3c,0x94723a],gold:[0xd8b24a],gunmetal:[0x4a5058,0x444a52],alabaster:[0xefe7d6],
 // the kit colours (banners, awnings, flags): black, gold, green
 black:[0x141416],green:[0x3f8a5a,0x387e50],
 // timber, the poor's silt brick and reed, the masks' terracotta and lead
 timber:[0x4a3426,0x52392a,0x443022],timberL:[0x6e5038,0x76563c],silt:[0x9a8a6e,0x928266,0xa29276],reed:[0xb8a476,0xae9a6c,0xc2ae80],
 terracotta:[0xb06a44,0xa8623e],lead:[0x6e7278,0x666a70],paving:[0xb4ac9c,0xaca494,0xbcb4a4],earth:[0x7a6a4e,0x72624a],
 glass:[0x2e3a42,0x34404a],glassLit:[0xe8c890],iron:[0x3a3632,0x2e2a26],flame:[0xffb04a],ember:[0xff7a2a],leaf:[0x4a6a2a,0x56762e]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
