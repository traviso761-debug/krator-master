// ================================================================= THE KIT: its identity, its library families, its palette
// The Coyote kit (kits/coyote/PLAN.md): the Coyote Men's buildings, catalog and core/tags culture 'coyote'. The engine
// (core/engine) reads these names:
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: a family not packed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
// And the kit's own:
//   CY           the kit's constants: SCALE (the people's stature against a human's: the owner, 2026-11-16, human height),
//                the door's clear height (2.0 m for the ears), the riser and the ladder's rung spacing
//   CY_TRIBES    the five ways of living, keyed in English for the data, each with its Hum name and gloss (PLAN.md section 2;
//                the words are proposed until the owner confirms them). A record carries its tribe as tags.style
const KIT={id:'coyote',title:'Coyote Kit',pack:'coyote',culture:'coyote',faction:'The Coyote Men',band:'(by tribe)',frag:'kits/coyote',
 ground:0xa08a62,groundProc:0xa8906a,fog:0xd8c8a6,furnDetail:.6};
const CY={SCALE:1,DOOR_H:2.0,RISER:.2,RUNG:.3,LEAN:2.4,WALL:.42,SOCLE:.35};   /* LEAN: a pole ladder's rise over its run */
const CY_TRIBES={
 valley:{hum:'Hām-Hau',gloss:'river hounds',life:'sedentary bronze-age farmers in mud-brick river villages'},
 peak:{hum:'Kām-Hau',gloss:'copper-gold hounds',life:'miners and gem tappers on the fog wall and the gem hills'},
 sunrise:{hum:'Tōng-Hau',gloss:'east-gate hounds',life:'nomadic goat-and-ostrich herders of the eastern plains'},
 sunset:{hum:'Sī-Hau',gloss:'west-pass hounds',life:'nomadic goat-and-ostrich herders of the western plains'},
 tier:{hum:'Lōk-Hau',gloss:'step-bench hounds',life:'the Kingdom of the Tiers: the Tierhounds'}};
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat. */
const SV_LIB={brick:'brick',render:'render',lime:'lime',floor:'floor',roof:'roof',timber:'timber',wood:'wood',reed:'reed',stone:'stone',
 hide:'hide',rope:'rope',ash:'ash',slab:'slab',carve:'slab',iron:'none'};
/* metres per tile when there is no pack (?mat=proc) */
const SV_TILE0={brick:2,render:2.4,lime:2,floor:2,roof:3,timber:1.5,wood:1.2,reed:1,stone:1.6,hide:.8,rope:.3,ash:.8,slab:1.2,carve:1.2,iron:1};
const SV_CLOTH={hide:1,flag:1};
const SV_CUT=Object.assign({brick:1,render:1,lime:1,roof:1,timber:1,reed:1,stone:1,wood:1,plain:1,ash:1,slab:1,carve:1},SV_CLOTH);   /* buckets that carry the cut-away attribute */
const KIT_FALLBACK=[['slab','stone'],['carve','stone']];
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 mud:[0xb8a284,0xae987a,0xc0aa8c],mudD:[0x947e62,0x8a7458],mudL:[0xccb898,0xc4ae8c],
 lime:[0xeee8da,0xe8e0cc,0xf2ecdf],ochre:[0xb06a34,0xa25e2c],red:[0x9a3a22,0x8e3420],
 floor:[0xc4b292,0xbcaa8a],roof:[0x9e8a6a,0x947f60],
 timber:[0xa49478,0x988868,0xb0a084],wood:[0x7a5c3c,0x6e5234],reed:[0xc4a86e,0xb89c62],
 stone:[0x9a9284,0x8e8678,0xa69e8e],carve:[0x7a7266,0x6e665a],hide:[0x9a7650,0x8a6a46],rope:[0xb89a6a,0xa88a5a],
 ash:[0x8a8680,0x7a766e],soot:[0x2e2a26],ember:[0xff6a1a],bone:[0xe4dac4,0xd8ccb0],horn:[0x5a4a3a,0x4e4032]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
