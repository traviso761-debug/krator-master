// ================================================================= THE KIT: its identity, its library families, its palette
// The Desert Nomads kit, forked from kits/scyvoi (2026-10-07). 27-mat.js and the other engine fragments are the Scyvoi
// kit's, vendored (build.py --vendor-check); everything that makes this kit its own is here and in 40-79.
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: an owner's sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// The look (the owner's brief, 2026-10-07): austere outside, brown or white with simple patterns in a contrasting colour
// (the Yemeni tower houses' white-on-brown bands); inside, Moroccan and Arabian but more muted than the Scyvoi.
const KIT={id:'desert-nomads',title:'Desert Nomads Kit',pack:'desert-nomads',culture:'nomad',faction:'Desert Nomads',band:'the clan of the Horned Well',
 frag:'kits/desert-nomads',ground:0xc4a47a,groundProc:0xcfb08a,fog:0xe6d2b0,furnDetail:.6};
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat.
   hair: the brown goat-and-camel hair cloth; patSadu, patLining: the owner's sheets (optional until processed) */
const SV_LIB={felt:'felt',canvas:'canvas',goat:'goat',hair:'hair',hide:'hide',wood:'wood',carved:'carved',lacq:'lacq',stone:'stone',rock:'rock',
 earth:'earth',rug:'rug',rope:'rope',iron:'iron',patKilim:'patKilim',patSadu:'patSadu',patLining:'patLining',patZellige:'patZellige'};
const SV_TILE0={felt:.8,canvas:2.4,goat:.5,hair:.6,hide:.7,wood:1.6,carved:1.2,lacq:1.5,stone:2.6,rock:5,earth:3,rug:1,rope:.3,iron:.8,patKilim:1.6,patSadu:1.2,patLining:1.6,patZellige:1.2};
const SV_CLOTH={felt:1,canvas:1,goat:1,hair:1,hide:1,patKilim:1,patSadu:1,patLining:1,flag:1};
const SV_CUT={felt:1,canvas:1,goat:1,hair:1,hide:1,patKilim:1,patSadu:1,patLining:1,patZellige:1,lacq:1,wood:1,carved:1,flag:1,plain:1,rope:1,brass:1,bone:1,iron:1,glass:1};
/* until the owner's sheets come (core/materials/PROMPTS-ready.md): the brown hair cloth draws as the canvas set dyed by its
   palette brown, the sadu band and the lining as the star kilim */
const KIT_FALLBACK=[['hair','canvas'],['patSadu','patKilim'],['patLining','patKilim']];
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 hair:[0x6a4a32,0x5e402a,0x74523a],                     // brown goat-and-camel hair cloth (Bedouin, Berber)
 hairD:[0x3e2c20,0x4a3424],                             // the dark stripes in it
 cream:[0xe8dcc4,0xf0e6d2,0xe2d4b8],                    // undyed wool, the white caidal canvas
 canvas:[0xe6dcc8,0xddd0b8,0xeee6d6],                   // white tent canvas
 khaima:[0x8a6446,0x7c583c,0x946c4c,0x6e4e36],          // brown khaima cloth
 goat:[0xffffff,0xf2eee8,0xe6e2dc],                     // black goat hair: the library set carries the colour
 goatS:[0x9a8a72,0xb0a080,0x7a6a54],                    // the pale woven stripe in a goat-hair roof
 trim:[0x4a3022,0x3e281c],                              // the dark brown appliqué on white
 trimW:[0xe8dcc4,0xf0e6d4],                             // the white appliqué on brown
 rust:[0x8e3a24,0x9a4228,0x7e3220],madder:[0x8a2a22,0x7a241e],indigo:[0x2c3448,0x343c52],ochre:[0xb08a3a,0xa07a30],
 sand:[0xc8a87a,0xbc9c70],black:[0x1c1a18,0x24201c],
 hide:[0x9a6a42,0x8a5c38,0xa8784c,0x7a5032],hideD:[0x4a3020,0x5a3a28],
 wood:[0xa48c64,0x98805a,0xb09870],woodD:[0x4e3626,0x44301e,0x58402c],
 lacq:[0xffffff],
 stone:[0xb09a7a,0xa48e70,0xbca686],stoneD:[0x7a6a56,0x6e5e4c],
 earth:[0x9a7a56,0x8a6c4a],thorn:[0x6a5a40,0x5e4e36,0x7a6a4c],palm:[0x8a7a4a,0x7a6c40],
 iron:[0x3a3632,0x2e2a26],brass:[0xb8924a,0xa8823e],bone:[0xe4dac4,0xd8ccb0],rope:[0xb89a6a,0xa88a5a],
 flame:[0xffb04a],ember:[0xff6a1a],
 // the tent kit's (40-tk-tentkit.js) defaults, muted for the desert
 feltW:[0xe8dcc4,0xe2d6be],feltG:[0x9a9284,0x8a8274],feltB:[0x5e4434,0x54402e],canvasO:[0xc8a46a,0xbc9a62],crimson:[0x7e2a24,0x6e241e]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
