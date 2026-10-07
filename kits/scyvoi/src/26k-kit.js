// ================================================================= THE KIT: its identity, its library families, its palette
// Everything a kit forked from this one changes is here; 27-mat.js and the other engine fragments read it and are the same
// file in every such kit (kits/desert-nomads and kits/ash-nomads vendor them from kits/scyvoi: build.py --vendor-check).
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: an owner's sheet not processed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it)
const KIT={id:'scyvoi',title:'Scyvoi Kit',pack:'scyvoi',culture:'scyvoi',faction:'Scyvoi',band:'Baer-San of the Red Rock',frag:'kits/scyvoi',
 ground:0x9a8060,groundProc:0xa8916a,fog:0xd8c4a4,furnDetail:.6};
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat. */
const SV_LIB={felt:'felt',canvas:'canvas',goat:'goat',hide:'hide',skin:'skin',wood:'wood',carved:'carved',lacq:'lacq',stone:'stone',rock:'rock',
 paving:'paving',earth:'earth',rug:'rug',rope:'rope',iron:'iron',patFelt:'patFelt',patArch:'patArch',patBlue:'patBlue',patBlack:'patBlack',patRose:'patRose',patPoly:'patPoly',patFlame:'patFlame',patBloom:'patBloom',patKilim:'patKilim',patCold:'patCold',patApp:'patApp',patApp2:'patApp2',patCelest:'patCelest',patStep:'patStep',patQuatre:'patQuatre',
 medSal:'medSal',medBlades:'medBlades',medMoon:'medMoon',medCloud:'medCloud',medStar:'medStar',medSun:'medSun'};   // med*: single panels, mapped once (30-geo.js medallion)
/* metres per tile when there is no pack (?mat=proc), so the UVs a later pass might use still mean something */
const SV_TILE0={felt:.8,canvas:2.4,goat:.5,hide:.7,skin:.35,wood:1.6,carved:1.2,lacq:1.5,stone:2.6,rock:5,paving:3,earth:3,rug:1,rope:.3,iron:.8,patFelt:1.6,patArch:1.4,patBlue:1.2,patBlack:1.2,patRose:2.4,patPoly:2.4,patFlame:2,patBloom:1.8,patKilim:1.6,patCold:1.8,patApp:1.5,patApp2:1.5,patCelest:2.4,patStep:1.6,patQuatre:1.4,medSal:1,medBlades:1,medMoon:1,medCloud:1,medStar:1,medSun:1};
const SV_CLOTH={felt:1,canvas:1,goat:1,hide:1,patFelt:1,patArch:1,patBlue:1,patBloom:1,patKilim:1,patCold:1,patApp:1,patApp2:1,patCelest:1,flag:1};   // thin sheets: double-sided; the flutter attribute (aFlut)
const SV_CUT={felt:1,canvas:1,goat:1,hide:1,patFelt:1,patArch:1,patBlue:1,patBlack:1,patRose:1,patPoly:1,patFlame:1,patBloom:1,patKilim:1,patCold:1,patApp:1,patApp2:1,patCelest:1,lacq:1,wood:1,carved:1,flag:1,plain:1,rope:1,brass:1,bone:1,iron:1,glass:1};   // buckets that carry the cut-away attribute (aCut)
const KIT_FALLBACK=[['patRose','patBlack'],['patPoly','patBlue'],['patFlame','patFelt'],['patBloom','patArch'],['patKilim','patFelt'],['patCold','patBlue']];
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 feltW:[0xf2ece0,0xebe3d2,0xf4efe6,0xe6dcc8],          // white and cream felt (yurt covers)
 feltG:[0x9a9284,0x8a8274,0xa49c8c],                    // grey felt
 feltB:[0x6a5040,0x5c4434,0x7a5a46],                    // brown felt
 canvas:[0xd8c4a0,0xcdb690,0xe0ceaa],                   // bleached tent canvas
 canvasO:[0xd88a2a,0xe0962e,0xc87a22],                  // saffron canvas (bell tent, pavilion)
 khaima:[0x8a6446,0x7c583c,0x946c4c,0x6e4e36],          // brown khaima cloth
 goat:[0xffffff,0xf2eee8,0xe6e2dc],                     // black goat hair: the library set carries the colour (cloth.tent.black); this only varies it
 goatS:[0x9a8a72,0xb0a080,0x7a6a54],                    // the pale woven stripe in a goat-hair roof
 hide:[0x9a6a42,0x8a5c38,0xa8784c,0x7a5032],            // tanned hides
 hideD:[0x4a3020,0x5a3a28],
 madder:[0xa8282a,0x9a2024,0xb43030],crimson:[0xb01a28,0x9e1422],teal:[0x1f5a5e,0x23666a],indigo:[0x23345a,0x2a3c66],
 saffron:[0xd49a2a,0xc88a22],gold:[0xc8a050,0xd8b060],black:[0x1c1a18,0x24201c],cream:[0xece2cc,0xf0e8d6],
 wood:[0xb09a6a,0xa48c5c,0xbca676],woodD:[0x5a3c26,0x4e3220,0x664430],
 lacq:[0xffffff],                                       // the lacquer set keeps its own red
 stone:[0x8e8c86,0x86847e,0x96938a,0x7e7c76,0x9a968c],   // grey andesite (the Baelu)
 stoneD:[0x6a6862,0x5e5c56],
 rock:[0xb07a56,0xa06c4a,0xbc8862],                     // red outcrop
 paving:[0x9a948a,0x8c867c],earth:[0x8a6a4a,0x7a5c40],
 iron:[0x3a3632,0x2e2a26],brass:[0xc8963a,0xb8862e],bone:[0xe4dac4,0xd8ccb0],rope:[0xb89a6a,0xa88a5a],
 skinA:[0x1a1716],skinB:[0x3a2014],spotA:[0xf07818,0xf4a020,0xe85a10],spotB:[0xe8c040,0xd8a830],belly:[0xe8a050,0xd88a3c],
 flame:[0xffb04a],ember:[0xff6a1a],glassR:[0xc0204a],glassA:[0xe0902a],glassB:[0x2a60b0]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
