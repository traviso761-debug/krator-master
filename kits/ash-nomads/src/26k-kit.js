// ================================================================= THE KIT: its identity, its library families, its palette
// The Ash Nomads kit, forked from kits/scyvoi (2026-10-07). 27-mat.js, the tent kit and the other engine fragments are the
// Scyvoi kit's, vendored (build.py --vendor-check); everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: an owner's sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (the owner's brief, 2026-10-07): peaked tents of every kind, black to grey, with ornate yellow and red patterns
// outside (a cross of Nazca line figures and Morrowind Dunmer frets); inside, the yellow-red palette, chitin, hanging banners,
// lanterns and ash screens.
const KIT={id:'ash-nomads',title:'Ash Nomads Kit',pack:'ash-nomads',culture:'ashnomad',faction:'Ash Nomads',band:'the Cinder-Walkers',
 frag:'kits/ash-nomads',ground:0x5a5651,groundProc:0x5e5a55,fog:0xb8b0a6,furnDetail:.6};
/* the library families. ashCloth: the black-to-grey tent cloth; patFret, patNazca, patEmber, medSun: the owner's sheets
   (optional until processed: KIT_FALLBACK) */
const SV_LIB={felt:'felt',canvas:'canvas',goat:'goat',ashCloth:'ashCloth',hide:'hide',chitin:'chitin',plates:'plates',wood:'wood',carved:'carved',lacq:'lacq',
 stone:'stone',rock:'rock',earth:'earth',rug:'rug',rope:'rope',iron:'iron',patFret:'patFret',patNazca:'patNazca',patEmber:'patEmber',patKilim:'patKilim',medSun:'medSun',medAshSun:'medAshSun'};
const SV_TILE0={felt:.8,canvas:2.4,goat:.5,ashCloth:.8,hide:.7,chitin:.8,plates:.9,wood:1.6,carved:1.2,lacq:1.5,stone:2.6,rock:5,earth:3,rug:1,rope:.3,iron:.8,
 patFret:1.2,patNazca:2.4,patEmber:1.6,patKilim:1.6,medSun:1,medAshSun:1};
const SV_CLOTH={felt:1,canvas:1,goat:1,ashCloth:1,hide:1,patFret:1,patNazca:1,patEmber:1,patKilim:1,flag:1};
const SV_CUT={felt:1,canvas:1,goat:1,ashCloth:1,hide:1,chitin:1,plates:1,patFret:1,patNazca:1,patEmber:1,patKilim:1,lacq:1,wood:1,carved:1,flag:1,plain:1,rope:1,brass:1,bone:1,iron:1,glass:1};
/* until the owner's sheets come (core/materials/PROMPTS-ready.md): the ash cloth draws as the felt dyed by its palette, the
   fret band and the Nazca panels as the procedural bands (40a-ak-ash.js draws them as geometry when the sheet is missing),
   the ember lining as the star kilim, the sun disc as the amber sun medallion */
const KIT_FALLBACK=[['ashCloth','felt'],['patEmber','patKilim'],['medAshSun','medSun']];
/* is an owner's sheet in the pack (the shape fragments draw the procedural pattern when it is not) */
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 ash:[0x2a2826,0x302d2a,0x24221f],                      // black tent cloth
 ashG:[0x4e4a45,0x56524c,0x48443f],                     // charcoal
 ashP:[0x7a756e,0x86817a,0x6e6a64],                     // ash-grey
 yellow:[0xe0b02a,0xd8a424,0xe8bc36],ochre:[0xc08a22,0xb07c1c],red:[0xa8281c,0x9a2418,0xb4301e],redD:[0x6a1a12,0x5e1610],vermilion:[0xc8401e,0xd04a24],
 bone:[0xe2d6bc,0xd6c8aa],boneD:[0xb8a888,0xa89878],
 chitin:[0x4a3a2a,0x3e3022,0x54402e],chitinA:[0x8a5a24,0x7a4e1e],chitinG:[0x34402c,0x2e3826],
 hide:[0x7a6a5a,0x6e5e50,0x86766a],hideD:[0x3a322c,0x443a32],
 wood:[0x7a6e62,0x6e6256,0x86786a],woodD:[0x3e3630,0x342e28,0x48403a],
 lacq:[0xffffff],stone:[0x5a5650,0x625e58,0x504c46],stoneD:[0x3a3834,0x423f3a],earth:[0x5a5550,0x4e4a45],
 iron:[0x3a3632,0x2e2a26],brass:[0xc89a3a,0xb88a2e],gold:[0xd4a83a,0xc89a30],rope:[0x9a8a6a,0x8a7a5a],paper:[0xe8c878,0xf0d488],
 flame:[0xffb04a],ember:[0xff6a1a],
 // the tent kit's (40-tk-tentkit.js) defaults, turned to ash and ember
 feltW:[0x4e4a45,0x56524c],feltG:[0x7a756e,0x86817a],feltB:[0x2a2826,0x302d2a],canvasO:[0x8a3a1e,0x7e341a],madder:[0xa8281c,0x9a2418],crimson:[0x8a2018,0x7a1c14],
 cream:[0xd8ccb0,0xccc0a4],canvas:[0x8a857e,0x7e7a72],khaima:[0x3a3632,0x423e38],goat:[0xffffff],goatS:[0x8a5a24,0x9a6a2e],saffron:[0xd8a424,0xc89a20],teal:[0x2a3a38,0x30403e]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
