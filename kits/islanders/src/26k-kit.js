// ================================================================= THE KIT: its identity, its library families, its palette
// The Islanders kit (the Ring Sea Islanders, catalog and core/tags culture `islander`), forked from kits/scyvoi (2026-10-12).
// 27-mat.js and the other engine fragments are the Scyvoi kit's, vendored (build.py --vendor-check); everything that makes
// this kit its own is here, in 28-is-paint.js and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: a sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (the owner's brief, 2026-10-12): two related styles, one people. The WEST (the western Ring Sea) builds after the
// Indonesian rumah: long houses on piles under saddle roofs whose ridges sweep up into horns (Minangkabau gonjong, Batak and
// Toraja prows), black palm-fibre thatch, dark timber, gables painted red, black and white. The EAST (Kautoa, the old island
// kingdom) builds after Sumba: tall peaked houses, a wide thatch skirt round a towering central spire, golden grass thatch,
// woven geometric facades, megalith tombs before the doors. Both carve their posts and paint their gables with the same
// motifs (spirals, figures, the white island moon), and the poor patch both with scrap: corrugated iron, tin, tarps, drums.
const KIT={id:'islanders',title:'Islanders Kit',pack:'islanders',culture:'islander',faction:'Ring Sea Islanders',band:'the Western Isles',
 frag:'kits/islanders',ground:0x7a8a56,groundProc:0x6e7e4c,fog:0xc8d4d2,furnDetail:.6};
/* the two subcultures (tags.style and the life layer's sub-faction) */
const IS_SUB={west:{name:'West Islanders',band:'the Western Isles'},east:{name:'Kautoa',band:'Kautoa'}};
/* the library families (materials.json). The painted sheets (patGableW and its variant W2, patGableE and E2, patBand, patStory,
   patWeave, patHinggi, medMoon) are the owner's (2026-10-14), and patMat, the East's plaited mat with its diamonds and zigzags (2026-10-18); 28-is-paint.js draws a canvas stand-in for any of them KMAT has
   no packed set of (?mat=proc) */
const SV_LIB={thatch:'thatch',thatchR:'thatchR',palm:'palm',bamboo:'bamboo',lattice:'lattice',mat:'mat',corr:'corr',corrW:'corrW',tin:'tin',
 carved:'carved',carvedR:'carvedR',lash:'lash',planks:'planks',reclaimed:'reclaimed',wood:'wood',tarred:'tarred',hull:'hull',floor:'floor',
 stone:'stone',coral:'coral',earth:'earth',sand:'sand',rope:'rope',tarp:'tarp',tyre:'tyre',tapa:'tapa',iron:'iron',
 patGableW:'patGableW',patGableE:'patGableE',patBand:'patBand',patStory:'patStory',patWeave:'patWeave',medMoon:'medMoon',
 patGableW2:'patGableW2',patGableE2:'patGableE2',patHinggi:'patHinggi',patMat:'patMat'};
const SV_TILE0={thatch:2,thatchR:2.2,palm:1.6,bamboo:1.4,lattice:.8,mat:1,corr:1.6,corrW:1.6,tin:1.4,carved:1.2,carvedR:1.2,lash:1.6,planks:2,
 reclaimed:2,wood:1.6,tarred:1.6,hull:1.8,floor:2,stone:2.6,coral:2.4,earth:3,sand:4,rope:.3,tarp:2,tyre:.8,tapa:1.6,iron:.8,
 patGableW:2.4,patGableE:2.2,patBand:1.2,patStory:3.2,patWeave:2.4,medMoon:1,patGableW2:2.4,patGableE2:2.2,patHinggi:2,patMat:1.6};
const SV_CLOTH={tarp:1,tapa:1,mat:1,flag:1,patHinggi:1,patMat:1};
const SV_CUT={thatch:1,thatchR:1,palm:1,bamboo:1,lattice:1,mat:1,corr:1,corrW:1,tin:1,carved:1,carvedR:1,lash:1,planks:1,reclaimed:1,wood:1,tarred:1,
 tarp:1,tapa:1,rope:1,iron:1,coral:1,patGableW:1,patGableE:1,patBand:1,patStory:1,patWeave:1,patGableW2:1,patGableE2:1,patHinggi:1,patMat:1,flag:1,plain:1,brass:1,bone:1,glass:1};
const KIT_FALLBACK=[];
/* is a sheet in the pack (28-is-paint.js draws the canvas stand-in when it is not) */
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // thatch: the West's black palm fibre (ijuk), the East's golden grass, the poor's faded leaf
 thatchW:[0x625648,0x6a5e50,0x5a4e42],thatchE:[0xc8b080,0xbca474,0xd2ba8a],thatchP:[0x9a8a6a,0x8e7e60,0xa69676],palmL:[0xb4a878,0xa89c6c],
 // timber: the West's dark (tarred, smoked), the East's bark, a pale bleached timber, bamboo
 woodD:[0x3a2a20,0x32241a,0x423026],wood:[0x7a5a3a,0x6e5034,0x86643f],woodL:[0xa88a64,0xb09470,0x9c805a],bamboo:[0xc8b080,0xbca474,0xd4bc8c],
 tarred:[0x5a4a3e,0x4e4036,0x645446],planks:[0x9a8670,0x8e7a64,0xa6927a],
 // the painted colours both styles share (the gables, the posts, the bands): red earth, black, white, ochre, the sea's teal
 red:[0x9a2a1e,0xa8301f,0x8e2418],black:[0x1e1a18,0x24201c],white:[0xece4d0,0xf2ead8],ochre:[0xc08a30,0xb88028,0xc89438],
 teal:[0x2a7a7a,0x267070,0x2e8282],sand:[0xc49a5a,0xbc9252],bark:[0x8a5a32,0x7e522e],
 // stone and ground
 stone:[0x8e8a80,0x86827a,0x969288,0x7e7a72],stoneD:[0x5e5a54,0x56524c],coral:[0xd8ccb4,0xe0d4bc,0xccc0a8],earth:[0x8a6a4a,0x7a5c40],sandG:[0xd8c49a,0xd0bc92],
 // scrap: rust, galvanised and painted iron, tarps, tyres, drums
 rust:[0xffffff,0xf2eee8],tin:[0x8e8a84,0x86827c,0x96928c],galv:[0x9aa0a0,0x8e9494],tarpB:[0x3a5a7a,0x34506c],tarpG:[0x4a6a4a,0x42603f],tarpO:[0xb86a2a,0xa85e24],
 drumR:[0x8a2a1e,0x7a2418],drumB:[0x2a4a6a,0x24405e],drumY:[0xc8a030,0xb89028],tyre:[0x2a2826,0x302d2a],
 carvR:[0x8a4a38,0x7e4232,0x94523e],carvN:[0xa88460,0x9c7a56],
 iron:[0x3a3632,0x2e2a26],brass:[0xc89a3a,0xb88a2e],bone:[0xe8e0cc,0xddd2bc],shell:[0xeee8dc,0xe4dccc],rope:[0xa08050,0x94764a],
 flame:[0xffb04a],ember:[0xff6a1a],leaf:[0x4a6a2a,0x56762e,0x3e5e24],water:[0x2a6a6a]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
