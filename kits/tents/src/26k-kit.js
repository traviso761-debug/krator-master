// ================================================================= THE KIT: its identity, its library families, its palette
// The Tents kit belongs to no culture (like kits/construction and kits/resources): KIT.culture is 'generic', and every placed
// tent carries the culture of its DRESS (41-tn-dress.js) in its core/tags record. The engine (core/engine) reads these names:
//   KIT          ids, names, the ground and fog colours, the furniture detail level
//   SV_LIB       MAT key -> pack family (materials.json); SV_TILE0 metres per tile without a pack (?mat=proc)
//   SV_CLOTH     thin sheets: double-sided, flutter; SV_CUT the buckets the cut-away opens
//   KIT_FALLBACK [key, stand-in]: a family not packed yet draws as the stand-in
//   SVPAL, P(k)  the palette (sRGB hex; P picks one and jitters it). The tent toolkit (kits/scyvoi/src/40-tk-tentkit.js,
//                read in place) asks for feltW feltG feltB canvasO goat goatS madder crimson woodD; the dresses carry their own.
const KIT={id:'tents',title:'Tents Kit',pack:'tents',culture:'generic',faction:'(none: the dress names the people)',band:'(none)',frag:'kits/tents',
 ground:0x9c8a66,groundProc:0xa8946e,fog:0xd6c8aa,furnDetail:.6};
/* the pennants: one MAT key per dress that flies one ('emb_<dress>'), its canvas map drawn by 88-tn-emblem.js from the dress's
   field and ink and its culture's symbol (core/sockets/38-symbols.js SYMBOLS). A dress not listed here flies no pennant. */
const TN_EMBLEMS=['scyvoi','desert','ash','beast-rider','iziz','republican','xanadu','islander','postapoc','eternian'];
/* the library families: MAT key -> pack family (materials.json). A key missing from the pack, or ?mat=proc, draws flat. */
const SV_LIB={felt:'felt',canvas:'canvas',armyc:'armyc',ripstop:'ripstop',goat:'goat',hide:'hide',ashc:'ashc',brownc:'brownc',silk:'silk',tarp:'tarp',stripe:'stripe',mat:'mat',brocade:'brocade',
 patApp:'patApp',patSadu:'patSadu',patFret:'patFret',patBR:'patBR',patXan:'patXan',patTapa:'patTapa',patKilim:'patKilim',patIziz:'patIziz',patEter:'patEter',patFelt:'patFelt',
 wood:'wood',lacq:'lacq',carved:'carved',bamboo:'bamboo',iron:'iron',scrapm:'scrapm',rope:'rope',rug:'rug',earth:'earth'};
for(const s of TN_EMBLEMS)SV_LIB['emb_'+s]='none';   // no library set: 88-tn-emblem.js gives each its canvas map
/* metres per tile when there is no pack (?mat=proc) */
const SV_TILE0={felt:.8,canvas:2.4,armyc:2,ripstop:1.5,goat:.6,hide:1.2,ashc:1.2,brownc:1.2,silk:1.2,tarp:2,stripe:1.6,mat:1,brocade:1,patApp:1.5,patSadu:1.2,patFret:1,patBR:1,patXan:1,patTapa:1.2,
 patKilim:2.2,patIziz:1.6,patEter:1.4,patFelt:1.6,wood:1.6,lacq:1.5,carved:1.2,bamboo:1.2,iron:.8,scrapm:1.6,rope:.3,rug:1,earth:3};
for(const s of TN_EMBLEMS)SV_TILE0['emb_'+s]=1;
const SV_CLOTH={felt:1,canvas:1,armyc:1,ripstop:1,goat:1,hide:1,ashc:1,brownc:1,silk:1,tarp:1,stripe:1,mat:1,brocade:1,patApp:1,patSadu:1,patFret:1,patBR:1,patXan:1,patTapa:1,patKilim:1,patIziz:1,patEter:1,patFelt:1,flag:1};
for(const s of TN_EMBLEMS)SV_CLOTH['emb_'+s]=1;
const SV_CUT=Object.assign({wood:1,lacq:1,carved:1,bamboo:1,iron:1,scrapm:1,plain:1,rope:1,brass:1,bone:1,glass:1},SV_CLOTH);   // buckets that carry the cut-away attribute
const KIT_FALLBACK=[['brocade','silk'],['armyc','canvas'],['ripstop','canvas'],['patEter','patKilim'],['ashc','felt'],['brownc','canvas']];
/* ---------------------------------------------------------------- the palette (sRGB hex). Arrays are picked with P(k). */
const SVPAL={
 feltW:[0xf2ece0,0xebe3d2,0xf4efe6,0xe6dcc8],feltG:[0x9a9284,0x8a8274,0xa49c8c],feltB:[0x6a5040,0x5c4434,0x7a5a46],
 canvas:[0xd8c4a0,0xcdb690,0xe0ceaa],canvasO:[0xd88a2a,0xe0962e,0xc87a22],
 goat:[0xffffff,0xf2eee8,0xe6e2dc],goatS:[0x9a8a72,0xb0a080,0x7a6a54],
 madder:[0xa8282a,0x9a2024,0xb43030],crimson:[0xb01a28,0x9e1422],
 wood:[0xb09a6a,0xa48c5c,0xbca676],woodD:[0x5a3c26,0x4e3220,0x664430],
 iron:[0x3a3632,0x2e2a26],brass:[0xc8963a,0xb8862e],bone:[0xe4dac4,0xd8ccb0],rope:[0xb89a6a,0xa88a5a],
 earth:[0x8a6a4a,0x7a5c40],flame:[0xffb04a],ember:[0xff6a1a]
};
function P(k){return jc(pick(SVPAL[k]),.05);}
