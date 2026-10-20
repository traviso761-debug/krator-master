// ================================================================= THE KIT: its identity, its library families, its palette
// The Lizardmen kit (catalog and core/tags culture `lizardmen`: the Lizardmen of the Rift floor, DESIGN.md), forked from
// kits/islanders (2026-10-16). 27-mat.js and the other engine fragments are the Islanders kit's (the Scyvoi engine),
// vendored (build.py --vendor-check); everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   LZ_CASTE     the six castes (DESIGN.md section 3): height, name, role; each 1.25 x the one below
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (DESIGN.md section 2 and the references of 2026-10-16, section 9): primitive yet strangely sophisticated, uncanny.
// Ribs, horns and tusks are the structure, outside the skin (an exoskeleton that runs on past the ridge); the squared spiral
// (the leiwen) is the built ornament, the round whorl the carved one; spiral-eye oculi mark rank; nothing meets at 90 degrees;
// odd counts; every leiwen band carries one flaw. Bone white, reed ochre, black and oxblood lacquer, verdigris, turquoise
// and jade, grey-green basalt. Bronze only: no iron.
const KIT={id:'lizardmen',title:'Lizardmen Kit',pack:'lizardmen',culture:'lizardmen',faction:'Lizardmen',band:'the Rift floor',
 frag:'kits/lizardmen',ground:0x5e6a46,groundProc:0x56603f,fog:0xb8c4b0,furnDetail:.6};
/* the six castes: rank is a phase, not a size (the Interpreters are 5, the Bulwarks 6). h is the body height in metres;
   a caste's own door is doorH = h * 1.15 (a Tender's 1.4 m slit, a Bulwark's 4.4 m portal); 'all' takes nested portals */
const LZ_CASTE=[null,
 {n:1,h:1.22,name:'Tenders',role:'nest attendants, scribes, carvers, lacquer'},
 {n:2,h:1.53,name:'Makers',role:'bronze, reed and bone crafts'},
 {n:3,h:1.92,name:'Drovers',role:'farming, herding, hauling'},
 {n:4,h:2.41,name:'Line warriors',role:'the line'},
 {n:5,h:3.03,name:'Interpreters',role:'seers and strategists: spiral pupils'},
 {n:6,h:3.80,name:'Bulwarks',role:'shock troops, heavy labour'}];
const LZ_RATIO=1.25;
function lzDoorH(c){return +(LZ_CASTE[c].h*1.15).toFixed(2);}
/* the library families (materials.json) */
const SV_LIB={reed:'reed',thatch:'thatch',mat:'mat',cane:'cane',lacq:'lacq',lacqR:'lacqR',irid:'irid',
 bones:'bones',ivory:'ivory',horn:'horn',skull:'skull',ossuary:'ossuary',bronze:'bronze',bronzeC:'bronzeC',
 basalt:'basalt',stoneP:'stoneP',cyclo:'cyclo',brick:'brick',earth:'earth',earthR:'earthR',
 hide:'hide',hideP:'hideP',scale:'scale',shingle:'shingle',rope:'rope',wood:'wood',jade:'jade',scaleB:'scaleB',scaleOlive:'scaleOlive',scaleOliveB:'scaleOliveB',ropeT:'ropeT',marine:'marine',marineB:'marineB',
 /* the same sets as SOLID (single-sided) keys for roofs and gables: a double-sided cloth key self-shadows (acne) at a grazing sun */
 matW:'mat',hideW:'hide',hidePW:'hideP',
 /* the owner's ornament sheets (2026-10-16): the leiwen block and its busier take, the glyph band and its take, the spiral eye */
 leiwenS:'leiwenS',leiwenS2:'leiwenS2',glyphS:'glyphS',glyphS2:'glyphS2',eyeS:'eyeS'};
const SV_TILE0={reed:1.2,thatch:1.6,mat:1,cane:.9,lacq:1.4,lacqR:1.4,irid:.8,bones:.9,ivory:.8,horn:.7,skull:.6,ossuary:1.2,bronze:1,bronzeC:1.2,
 basalt:2.4,stoneP:1.8,cyclo:3.2,brick:1.4,earth:2.2,earthR:2.4,hide:1.4,hideP:1.4,scale:.5,shingle:1.2,rope:.3,wood:1.4,jade:.6,scaleB:.5,scaleOlive:.5,scaleOliveB:.5,ropeT:.3,marine:1.4,marineB:1.4,matW:1,hideW:1.4,hidePW:1.4,leiwenS:1.2,leiwenS2:1.6,glyphS:2.4,glyphS2:2.4,eyeS:1};
const SV_CLOTH={marine:1,marineB:1,hide:1,hideP:1,mat:1,flag:1};
const SV_CUT={reed:1,thatch:1,mat:1,cane:1,lacq:1,lacqR:1,irid:1,bones:1,ivory:1,horn:1,skull:1,ossuary:1,bronze:1,bronzeC:1,basalt:1,stoneP:1,cyclo:1,brick:1,
 earth:1,earthR:1,hide:1,hideP:1,scale:1,shingle:1,rope:1,wood:1,jade:1,scaleB:1,scaleOlive:1,scaleOliveB:1,ropeT:1,marine:1,marineB:1,matW:1,hideW:1,hidePW:1,leiwenS:1,leiwenS2:1,glyphS:1,glyphS2:1,eyeS:1,flag:1,plain:1,brass:1,bone:1,glass:1};
const KIT_FALLBACK=[];
const KIT_HAS=k=>KMAT.mode==='lib'&&!!KMAT.packed(KIT.pack,k);
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 // bone: fresh white, old ivory, the brown of a bone in a wall for a century; horn and tusk
 bone:[0xe4dcc6,0xdcd2b8,0xeae2cc],boneO:[0xc8b890,0xbca882,0xd0c09a],boneD:[0x9a8a66,0x8e7e5c],horn:[0xb8a47c,0xa89470,0xc4b088],tusk:[0xd8ccae,0xcfc2a2],
 // reed and cane: ochre, sun-bleached, the dark of smoke-cured reed; hide: tan, pale, the dark cured hide
 reed:[0xb89a5a,0xc0a262,0xae9052],reedL:[0xd2b87c,0xc8ae72],reedD:[0x7a6238,0x6e5832],cane:[0xc4aa70,0xb89e66],
 hide:[0x8a6a44,0x80603c,0x947250],hideP:[0xb89c76,0xae926c],hideD:[0x4e3a26,0x44321e],
 // lacquer: black, oxblood, and the high castes' iridescent sheen (tinted for the chitin set)
 lacq:[0x1a1612,0x201a16,0x16120e],oxblood:[0x5a1a16,0x62201a,0x521612],irid:[0x3a4a52,0x3e4652,0x404a4e],
 // bronze and verdigris (the only metal), turquoise and jade (the lead colours)
 bronze:[0x7a6a3e,0x6e6038,0x847244],verd:[0x4a8a7a,0x428072,0x529484],turq:[0x2c8a8a,0x268080,0x329494],jade:[0x3a7a5a,0x2e6a4c,0x44865f],
 // stone: grey-green basalt, the polished dark, the cleaner stones of a repair, baked brick, the Rift's earth
 basalt:[0x5e6a5e,0x566256,0x667266,0x5a665c],basaltD:[0x3a423c,0x343c36],basaltC:[0x7a8678,0x82907f],brick:[0xa88050,0x9e7648,0xb28a58],
 earth:[0x8a6e4e,0x80664a,0x947654],earthP:[0xb09070,0xa88868],
 // the ground and small things
 ground:[0x5e6a46],black:[0x16120e,0x1c1814],white:[0xece6d4],eye:[0x1a0e08],glowC:[0x7adacf],ember:[0xff7a2a],flame:[0xffb04a],
 moss:[0x4a6a3a,0x40603a],spore:[0x8a9a7a,0x7e9272,0x96a486]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
