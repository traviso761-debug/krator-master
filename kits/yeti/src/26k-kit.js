// ================================================================= THE KIT: its identity, its library families, its palette
// The Yeti kit (the Khaayken of Khaay Qantir, the High Country; catalog and core/tags culture `khaayken`), forked from
// kits/scyvoi (2026-10-25, as kits/eternian was). 27-mat.js and the other engine fragments are the Scyvoi kit's, vendored
// (build.py --vendor-check); everything that makes this kit its own is here and in 28 and 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   YT_S         the Khaayken stand 1.15 times a human: every opening, platform, step and passage is drawn at YT_S
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: a sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (kits/yeti/PLAN.md sections 1, 2 and 5): Inuit-derived catenary domes of pycrete (ice set with larch sawdust)
// or dry slab stone, half-sunk, joined by half-buried tunnels; austere outside (pale domes, grey stone, drifts, turf
// caps in summer), rich inside (sewn hide linings, musk-ox and caribou robes, hangings, soapstone and antler).
const KIT={id:'yeti',title:'Yeti Kit',pack:'yeti',culture:'khaayken',faction:'Khaay Qantir',band:'the north-western Outer Wall',
 frag:'kits/yeti',ground:0xe4eaee,groundProc:0xdfe6ea,fog:0xc8d2da,furnDetail:.6};
/* the Khaayken's height over a human's (the owner, 2026-10-25; PLAN.md, the scale note) */
const YT_S=1.15;
/* the tiers, in the tag `style` (PLAN.md section 6) */
const YT_STYLES={state:'state',rich:'rich',common:'common',poor:'poor'};
/* the library families (materials.json; ?mat=proc draws every key in its vertex colour) */
const SV_LIB={pycrete:'pycrete',pycreteOld:'pycreteOld',course:'course',slab:'slab',soap:'soap',muskox:'muskox',caribou:'caribou',
 gut:'gut',hide:'hide',serge:'serge',amur:'amur',ob:'ob',bead:'bead',mosaic:'mosaic',applique:'applique',antler:'antler',
 turf:'turf',turfCap:'turfCap',snowCap:'snowCap',hideCap:'hideCap',flag:'flag',larch:'larch',carved:'carved',ice:'ice',snow:'snow',felt:'felt',horn:'horn',earth:'earth'};
const SV_TILE0={pycrete:1,pycreteOld:1,course:2,slab:2,soap:.5,muskox:1,caribou:1,gut:1,hide:2,serge:1,amur:1,ob:1,bead:.6,mosaic:1.5,
 applique:2,antler:1,turf:2,turfCap:1,snowCap:1,hideCap:1,flag:2,larch:1.6,carved:1,ice:4,snow:3,felt:.5,horn:1.2,earth:3};
const SV_CLOTH={};
const SV_CUT={pycrete:1,pycreteOld:1,course:1,slab:1,soap:1,muskox:1,caribou:1,gut:1,hide:1,serge:1,amur:1,ob:1,bead:1,mosaic:1,
 applique:1,antler:1,turf:1,turfCap:1,snowCap:1,hideCap:1,flag:1,larch:1,carved:1,ice:1,snow:1,felt:1,horn:1,earth:1,plain:1,brass:1,bone:1,glass:1};
/* the circular cap sheets (one unrolled dome each, mapped from the crown: ytShell); until one is packed it draws as the
   tiled set it replaces */
const YT_CAPS={turfCap:1,snowCap:1,hideCap:1};
const KIT_FALLBACK=[['turfCap','turf'],['snowCap','snow'],['hideCap','hide']];
/* is a sheet in the pack */
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // the shells: pycrete's sets keep their own colour (a near-white tint); the slab stone and the turf take theirs from here
 ice:[0xffffff,0xf8fbff,0xf4f8fc],slab:[0x8a8c8a,0x828480,0x929490],turf:[0x9a9468,0x8e8a5e,0xa29c6e],snow:[0xffffff,0xf6f9fc],
 // inside: the hide lining's smoke-cream, the flagged floor, the packed earth of the pit
 hide:[0xdac8a8,0xd2bea0,0xe0d0b0],flag:[0x7e7a74,0x76726c],earth:[0x7a6a56,0x726250],
 // larch: fresh gold-brown, weathered silver-grey (the serge); felt
 larch:[0xa07a50,0x987248],larchOld:[0xa8a49c,0xa09c94],felt:[0x6e5a44,0x7a2e22,0xc8a030,0x2c3448],
 // the lamp and its fire
 flame:[0xffb04a],ember:[0xff7a2a],glassLit:[0xf0c888],soot:[0x2a2622],
 // antler and horn, fat
 bone:[0xe0d4bc,0xd8ccb2],fat:[0xe8dcb8]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
