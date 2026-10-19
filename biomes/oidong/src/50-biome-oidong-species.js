// ================================================================= OIDONG VALLEY — species (data + kit items)
// The Oidong Valley east of the Vale of Xanadu, in the East Rift Highlands (LORE.md 6.15): a chilly, enclosed high valley,
// the country of Longsong and the History Monks, reached by a hard trek over the passes and, once reached, the safest ground
// on Krator. SERENE before anything else (the owner, 2026-10-19): still pools, moss, blossom, pale sand; no fauna; nothing
// here stings, hunts or burns. A wilderness, but one with something of a zen garden about it: standing stones in odd groups,
// clipped-looking domes, cloud pines leaning over raked-looking flats (the wind rakes them), moss over everything in the
// shade. The holy plants are common: giant lotuses on the pools, sacred figs, cherry blossom, peyote buttons in the gravel.
// The alien plants here take the same palette: pastel, calm, quietly colourful, a little psychedelic. Xanadu's garden
// wildwood runs over the pass into it, so five of Xanadu's species grow here too (tagged `shared:'xanadu'`), and the lotus
// trumpet's fringe and the water lilies carry the one streak of every-colour-at-once.
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian / Koppen) plus `holy` (the monks' sacred plants) and `shared` (a species Xanadu's kit also draws).
BIO.kit('oidong');   // this kit's own registry of items and buckets (core/biome: kits)
var OIDONG={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);OIDONG.C=C;
const GOLD=2.399963;OIDONG.GOLD=GOLD;
OIDONG.TAGS={climate:'cool-temperate',aridity:'humid',abyssal:false,riparian:'both',koppen:['Cwb','Cfb','Dwb','ET']};
// the classes of the region: an ESTIMATE (the scale model's climate rasters were not read for this kit: KNOWN_ISSUES)
OIDONG.KOPPEN={Cwb:.4,Cfb:.35,Dwb:.15,ET:.1};

// ---------------------------------------------------------------- palettes
// THE PALETTE IS PASTEL. Every leaf, flower and bark set below sits low in saturation and high in lightness (the probe
// measures it: 'a calm palette'); the only saturated colours are the second colours of the iridescent cards (PAL.irid),
// which show for a moment at a grazing angle and are gone: the psychedelic streak.
const PAL=OIDONG.PAL={
 blush:[0xf4c6d2,0xf7d3dc,0xefb7c7,0xf9dde3],rose:[0xeaa8bc,0xf0b8c8,0xe49cb2],
 lavender:[0xcbb8e6,0xd8c9ee,0xbfa9dc,0xe2d6f2],lilac:[0xdcc8f0,0xe8d8f8],
 mint:[0xbfe6d0,0xcdeedb,0xaedcc2,0xd9f2e3],celadon:[0xbed4c0,0xcbdcc9,0xaec8b1,0xd4e2d2],
 powder:[0xb9d3ea,0xc9def0,0xa9c7e2,0xd4e4f4],sky:[0xa8c8ec,0xb8d4f0,0x98b8e0],
 cream:[0xf6efe0,0xfaf5ea,0xf0e6d2,0xfcf8f0],ivory:[0xf8f4ec,0xfdfaf4],
 peach:[0xf6cdb2,0xf9d8c2,0xf2bf9e,0xfbe2d0],coral:[0xf0b0a0,0xf4bcaa,0xeaa290],
 gold:[0xeadca2,0xf0e4b4,0xe2d08e,0xf4ead0],teal:[0x8ec7c0,0x9fd2cb,0x7ab8b0,0xb0dcd6],
 jade:[0xa9cf9a,0xb8d8a8,0x98c088,0xc4e0b6],sage:[0xb4c4a4,0xc0ccb0,0xa4b494],
 moss:[0x9cc24a,0xa8cc56,0x8cb442,0xb4d262],mossDark:[0x6a8a36,0x7a9a3e,0x5e7e30],mossPale:[0xc2d88a,0xcde098],
 sand:[0xe8e2d4,0xefe9dc,0xe0d9c8,0xf2ede2],granite:[0xb4b0a8,0xa8a49c,0xc0bcb4,0x9c9890],darkStone:[0x6e6c68,0x7a7874,0x626060],
 // barks (written a stop DARK: tinted on near-grey canvases, they render about where they are written)
 cherryBark:[0x5a4a48,0x66544e,0x4e403e],bodhiBark:[0xb8b4a8,0xc4c0b4,0xaaa69a],mapleBark:[0x9a9088,0xa89e94,0x8c8278],
 marble:[0xf4ece4,0xf8f0ea,0xeee4dc],chaliceStem:[0xd8e4e2,0xe4ecea,0xc8d8d6],bambooCane:[0xa9cf9a,0xb8d8a8,0x98c088],
 mossballBark:[0x6a5a50,0x76665a,0x5e4e46],pineBark:[0x8a6a58,0x9a7a64,0x7a5e4e],cushionBark:[0x8a7a70,0x968678],
 lotusStalk:[0x9ab888,0xa8c494],wisteriaBark:[0x8a7a9a,0x9a8aa8],trumpetBark:[0xa89a7c,0xb4a688],bellBark:[0xd0a0a8,0xdcb0b8],
 // the one streak of every colour (the irid second colours, the lilies' pairs): shown at grazing angles only
 irid:{
  lily:[0x6a7ae8,0xa060e0,0xff70c0,0x40d0e0,0xffb040],
  marble:[0xf0a0c0,0x9ac8f0,0xf6d890,0xc0a0f0,0x90e0c8],
  blossom:[0xffd6e6,0xffe9f1,0xf0c8e8],
  heart:[0xe0b0a0,0xf0c8b8,0xd0a890],
  lace:[0xf8e8f0,0xe8f0f8,0xf8f0e8],
  wisteria:[0x8a90e8,0x9a80d8,0x7aa0f0],
  cap:[0x6ab0a8,0xf0b070,0x80c0d0],
  gloss:[0x5a8a60,0x4a7a58,0x6a9a70]},
 lilyPair:[[0x7a86e8,0xffb860],[0xc080e8,0x60e0d0],[0xff86c8,0xfff0a0],[0x60c8f0,0xf080b0],[0xf0f0ff,0xa060ff]],
 mooncap:[0xf4c0c8,0xf8ccd4,0xf0b4c0,0xf6d4dc],bracket:[0x8ab0a0,0xe0b070,0xa0c0d8,0x6a9a8a,0xf0e0c0],
 poppy:[0x8ab8f0,0x9ac4f4,0x7aa8e8],snowlotus:[0xf4f0e8,0xece8d8],peyote:[0xa8c8b4,0xb4d0bc,0x98b8a8],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 cherry: dark, banded with lenticels; 1 smooth
// pale with faint creases: bodhi, chalice, maple, bellpod; 2 ribbed green stalks: the giant lotus and the lotus trumpet;
// 3 MARBLE, painted in colour: the marble birch's cream bole with swirled pastel bands; 4 whorled (Xanadu's helix stripes):
// cloud pine, cushion tree, haze blossom, wisteria, mossball; 5 bamboo: nodes). far: the impostor recipe (blobs
// [y of H, rx of crownR, ry of H, colour A, colour B]). `holy`: a plant the monks hold sacred. `shared`: Xanadu draws it too.
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:false},o||{});
OIDONG.SPECIES=[
 /*0*/{key:'giantlotus',name:'Giant lotus',H:[5,11],rb:[.25,.5],crownR:[2.6,5],barkK:2,bark:PAL.lotusStalk,leaf:[0xa8cc90,0xb4d49c,0x9cc488,0xc0dcaa],
  how:'a lotus grown to the size of a tree: pads three to ten metres across floating on the still water, their rims turned up like trays, and the flowers held up on stalks taller than a house',
  far:{poleU:.9,taper:.1,blobs:[[.98,.32,.06,0xf4c6d2,0xfcf8f0]]},tags:K('cool-temperate','humid','yes',['Cwb','Cfb'],{holy:true,alien:true})},
 /*1*/{key:'bodhi',name:'Sacred fig',H:[14,26],rb:[.9,1.6],crownR:[9,15],barkK:1,bark:PAL.bodhiBark,leaf:[0xa8c49c,0xb4cca4,0x9cbc90,0xc0d4b0],
  how:'a pale, smooth, buttressed bole, a wide low crown of heart-shaped leaves with long drip tips that tremble in no wind, the new leaves bronze-pink; aerial roots from the lower limbs',
  far:{poleU:.5,taper:.45,blobs:[[.68,1.0,.26,'L0','L2'],[.84,.6,.14,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'],{holy:true})},
 /*2*/{key:'cherry',name:'Cherry blossom',H:[6,12],rb:[.3,.55],crownR:[4,7],barkK:0,bark:PAL.cherryBark,leaf:PAL.blush,
  how:'a dark banded trunk, a wide umbrella of blossom in blush and white, the petals lying round its foot and on the water',
  far:{poleU:.5,taper:.4,blobs:[[.72,1.0,.22,'L0','L2'],[.86,.6,.12,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb','Dwb'],{holy:true})},
 /*3*/{key:'marblebirch',name:'Marble birch',H:[18,34],rb:[.5,1.0],crownR:[5,9],barkK:3,bark:PAL.marble,leaf:[0xf4ece8,0xf8f0ec,0xeee6e2,0xf6f0f2],
  how:'a tall pale bole painted in swirled bands of every pastel at once, like cut marble, rising to a lace of near-white foliage; the ground round a grove is marbled too',
  far:{poleU:.72,taper:.5,blobs:[[.84,1.15,.22,'L0','L2'],[.95,.75,.1,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'],{alien:true})},
 /*4*/{key:'cloudpine',name:'Cloud pine',H:[6,14],rb:[.35,.7],crownR:[4,7],barkK:4,bark:PAL.pineBark,leaf:[0x6e8a68,0x7a9a74,0x628060,0x88a880],
  how:'a bonsai nobody trimmed (biomes/xanadu): a whorled trunk in an S, level boughs, a flat pad of needles on every tip; on the flats it leans with the wind',
  far:{poleU:.7,taper:.4,blobs:[[.6,.8,.12,'L0','L1'],[.9,.6,.1,'L1','L2']]},tags:K('cool-temperate','subhumid','no',['Cwb','Cfb','Dwb'],{shared:'xanadu'})},
 /*5*/{key:'topiary',name:'Cushion tree',H:[6,12],rb:[.25,.45],crownR:[5,8],barkK:4,bark:PAL.cushionBark,leaf:[0x9ab888,0xa8c494,0x8cac7c,0xb4cc9e],
  how:'braided stems from one foot and over them a lumpy dome of smooth leafy cushions, as if clipped (biomes/xanadu)',
  far:{poleU:.5,taper:.3,blobs:[[.66,1.0,.28,'L0','L2']]},tags:K('cool-temperate','subhumid','no',['Cwb','Cfb'],{shared:'xanadu'})},
 /*6*/{key:'hazeblossom',name:'Haze blossom',H:[7,13],rb:[.4,.7],crownR:[6,9],barkK:4,bark:[0x7a5a5c,0x6c4e50,0x886662],leaf:[0xf4f6f0,0xe4f2dc,0xeee2f8,0xd8ecd0,0xf8f0fc],
  how:'a low gnarled trunk, a wide umbrella wholly in blossom, white going green or lavender with the light (biomes/xanadu)',
  far:{poleU:.5,taper:.4,blobs:[[.74,1.0,.2,'L0','L2'],[.88,.55,.1,'L1','L3']]},tags:K('cool-temperate','subhumid','both',['Cwb','Cfb'],{shared:'xanadu'})},
 /*7*/{key:'lotustrumpet',name:'Lotus trumpet',H:[10,18],rb:[1.0,1.7],crownR:[3,5],barkK:2,bark:PAL.trumpetBark,leaf:[0x9ab888,0xa8c494,0x8cac7c,0xb4cc9e],
  how:'a fat fluted bole and arms each ending in a shallow trumpet with a fringe of lotus flowers round its rim (biomes/xanadu); the fringe is the one place every colour shows',
  far:{poleU:.45,taper:.4,blobs:[[.72,.8,.14,'L0',0xf0b0c8],[.9,.5,.1,'L1',0xf4c6d2]]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'],{shared:'xanadu',holy:true,alien:true})},
 /*8*/{key:'wisteria',name:'Wisteria tree',H:[6,11],rb:[.5,.9],crownR:[6,9],barkK:4,bark:PAL.wisteriaBark,leaf:[0xcbb8e6,0xd8c9ee,0xbfa9dc,0xe2d6f2,0xf0ecf8],
  how:'two stems wound round each other, an umbrella of low boughs and curtains of racemes in lavender and white (biomes/xanadu)',
  far:{poleU:.5,taper:.4,blobs:[[.7,1.0,.24,'L0','L2'],[.55,.9,.2,'L1','L3']]},tags:K('cool-temperate','subhumid','both',['Cwb','Cfb'],{shared:'xanadu'})},
 /*9*/{key:'chalice',name:'Chalice tree',H:[16,30],rb:[.7,1.2],crownR:[6,11],barkK:1,bark:PAL.chaliceStem,leaf:[0x8ec7c0,0x9fd2cb,0x7ab8b0,0xb0dcd6],
  how:'a pale smooth column holding up one great shallow cap, teal above and veined underneath, that fills with rain and cloud-drip and spills it over its rim in threads that fall the whole height of the tree; a fringe of pale grass grows on the rim',
  far:{poleU:.88,taper:.35,blobs:[[.9,1.0,.05,'L0','L2']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'],{alien:true})},
 /*10*/{key:'bellpod',name:'Bell-pod willow',H:[4,8],rb:[.25,.45],crownR:[3,5],barkK:1,bark:PAL.bellBark,leaf:[0xcfe0d4,0xd8e8dc,0xc4d8ca,0xdcecd8],
  how:'a small weeping tree whose pink stems hang in strings of pale green beads, each string ending in a coral bell; the beads are sweet and the bells are the monks\' sleeping draught',
  far:{poleU:.6,taper:.3,blobs:[[.62,1.0,.3,'L0',0xf0b0a0]]},tags:K('cool-temperate','humid','yes',['Cwb','Cfb'],{alien:true})},
 /*11*/{key:'bamboo',name:'Jade bamboo',H:[10,20],rb:[.07,.13],crownR:[1.5,3],barkK:5,bark:PAL.bambooCane,leaf:[0xa9cf9a,0xb8d8a8,0x98c088,0xc4e0b6],
  how:'a clump of pale jade canes, ringed at the nodes, bending a little at the top into a haze of narrow leaves; the groves stand so close the light inside is green',
  far:{poleU:.95,taper:.05,blobs:[[.85,.9,.14,'L0','L2']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'])},
 /*12*/{key:'mossball',name:'Moss-ball tree',H:[7,13],rb:[.3,.55],crownR:[3.5,6],barkK:4,bark:PAL.mossballBark,leaf:[0xa6c45e,0xb0cc68,0x98b852,0xbcd47c],
  how:'a gnarled dark trunk that forks and forks again, and on every fork a ball of moss-fine foliage, the balls stacked up it like a cloud-pruned tree',
  far:{poleU:.6,taper:.35,blobs:[[.5,.6,.18,'L0','L2'],[.78,.5,.14,'L1','L3'],[.95,.35,.08,'L0','L1']]},tags:K('cool-temperate','humid','no',['Cwb','Cfb'],{alien:true})},
 /*13*/{key:'maple',name:'Paper maple',H:[5,10],rb:[.2,.4],crownR:[4,7],barkK:1,bark:PAL.mapleBark,leaf:[0xf4c8ae,0xf6d2bc,0xeeb8a4,0xf9dcc8,0xf2bfb0],
  how:'a small layered maple whose palmate leaves are coral and peach the year round, laid in flat tiers over the moss',
  far:{poleU:.45,taper:.4,blobs:[[.7,1.0,.22,'L0','L2'],[.5,.8,.16,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb','Dwb'])},
 // THE DARK EVERGREENS (the owner, 2026-10-19: the valley was a little too pastel; these give it its contrast)
 /*14*/{key:'cedar',name:'Temple cedar',H:[18,34],rb:[.5,.9],crownR:[3,5.5],barkK:6,bark:[0x6a4a3c,0x5e4236,0x785248],leaf:[0x2e5a34,0x366a3c,0x2a5030,0x3e7244],
  how:'a straight red-barked column of dark green, its short level boughs in tiers to the tip: the temple timber, the incense wood',
  far:{poleU:.9,taper:.6,blobs:[[.5,.9,.42,'L0','L2'],[.86,.5,.14,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb','Dwb'])},
 /*15*/{key:'camphor',name:'Camphor laurel',H:[12,22],rb:[.7,1.3],crownR:[7,12],barkK:1,bark:[0x7a7064,0x86786c,0x6e645a],leaf:[0x2c5a30,0x34663a,0x28502c,0x3c7040],irid:'gloss',
  how:'a heavy grey bole and a great dark dome of glossy leaves, the darkest shade in the valley; the wood is steamed for its camphor',
  far:{poleU:.42,taper:.45,blobs:[[.66,1.0,.3,'L0','L2'],[.82,.7,.16,'L1','L3']]},tags:K('cool-temperate','humid','both',['Cwb','Cfb'])},
 /*16*/{key:'pagodafir',name:'Pagoda fir',H:[14,28],rb:[.4,.7],crownR:[4,7],barkK:6,bark:[0x4e4a44,0x5a5650,0x444038],leaf:[0x24503a,0x2c5c44,0x1e4834,0x346a4c],
  how:'an alien conifer whose limbs leave the bole in level whorls, each whorl a flat plate of blue-green needles like a pagoda roof, smaller to the spire; the snow lies on them in winter',
  far:{poleU:.95,taper:.6,blobs:[[.4,1.0,.1,'L0','L2'],[.62,.8,.09,'L1','L3'],[.82,.55,.08,'L0','L1']]},tags:K('cool-temperate','humid','no',['Cwb','Cfb','Dwb','ET'],{alien:true})},
];
OIDONG.byKey={};OIDONG.SPECIES.forEach((S,i)=>{S.i=i;OIDONG.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md, kits/crops)
// What each species yields (wood, edible parts, medicinal, a note) and `fruit`: a catalog piece when the kit draws a fruit
// the catalog holds (kits/catalog/krator-master-furniture-generic-fruit.js, the Oidong section). Medicinal plants and
// reagents are common here (the owner): the monks' physic terraces grow what the valley grows wild.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
OIDONG.HARVEST={
 giantlotus:HV('none',['seeds (fresh, dried)','root (a staple starch)','lotus silk (the stem fibre, spun)'],true,'The seed heads are the size of a basin; the roots are dug from the mud in autumn and the stem fibre is drawn out and spun into the monks\' lotus silk. The seed heart is a sedative tea.','generic_fruit_lotus_seed'),
 bodhi:HV('none (never cut)',['figs (small, purple)'],true,'The latex closes wounds; the bark is a fever tea. The tree is never felled: a bodhi\'s shade is a place to sit.','generic_fruit_bodhi_fig'),
 cherry:HV('turnery, carving',['cherries'],true,'Cherries in early summer; the bark is a cough tea. The petals are gathered for the spring cakes.','generic_fruit_cherry'),
 marblebirch:HV('none (it will not take an edge)',[],true,'The bark peels in painted sheets the monks use for the covers of books; the sap, tapped in spring, is a tonic.'),
 cloudpine:HV('carving, fuel',[],true,'The resin is a salve (biomes/xanadu).'),
 topiary:HV('none',[],false,'Grows as if clipped; never cut (biomes/xanadu).'),
 hazeblossom:HV('carving',[],false,'Ornamental: blossom only (biomes/xanadu).'),
 lotustrumpet:HV('none',['fringe petals (steeped)'],false,'The trumpets hold rainwater; the fringe petals are steeped for a rose-scented tea (biomes/xanadu).'),
 wisteria:HV('none',['flowers (fritters)'],false,'The racemes are battered and fried; the pods and seeds are poison (biomes/xanadu).'),
 chalice:HV('none',['cap water (sweet)'],true,'The water a cap holds is sweet and faintly bitter; a cup of it settles the stomach and the mind. The rim grass is cut for the finest paper.'),
 bellpod:HV('withies',['beads (sweet, fresh)'],true,'The beads are eaten fresh or dried like raisins; the coral bells, dried, are the monks\' sleeping draught and a reagent of their stillness rites: never more than one.','generic_fruit_bell_pod'),
 bamboo:HV('canes (building, pipes, pens), weaving, paper',['shoots (boiled)'],false,'The young shoots are boiled; the canes are everything else: scaffold, water pipe, pen, basket, and pulped for the printing house\'s paper.'),
 mossball:HV('none',[],true,'The moss of the balls dresses wounds; the dead balls stuff cushions.'),
 maple:HV('carving',['sap (boiled to syrup)'],false,'Tapped in late winter; the syrup is the valley\'s sweetener.'),
 cedar:HV('timber (the temple beams), incense',[],true,'The heartwood is Longsong\'s timber; the shavings are burned as incense and the resin seals wounds.'),
 camphor:HV('chests and boxes (the wood keeps the moth out)',[],true,'Camphor: the wood is steamed for its crystals, the monks\' liniment and a reagent that clears the head.'),
 pagodafir:HV('poles, resin',['nuts (roasted)'],false,'Its tiers hold the snow like roofs; the cones of the top tier drop oily nuts.'),
};
OIDONG.SPECIES.forEach(S=>{S.tags.harvest=OIDONG.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60-floor. `items` names the instanced items that draw them, for the inspector. The medicinal plants and the
// reagents are here: the monks' physic (kits/crops has them as crop records, home 'oidong').
const PK=(name,c,a,r,kp,items,hv,o)=>({name,tags:Object.assign(K(c,a,r,kp,o),{harvest:hv||HV('none')}),items});
OIDONG.PLANTS={
 moss:PK('Moss','cool-temperate','humid','both',['Cwb','Cfb','Dwb'],['mossmat','moss','cushion'],HV('none',[],true,'The moss garden: over the floor, the stones, the fallen wood and the roots, bright in the shade.')),
 lotus:PK('Lotus','cool-temperate','humid','yes',['Cwb','Cfb'],['lilypad','cup','lotuspod'],HV('none',['seeds (fresh)','root'],true,'The ordinary lotus among the giants: pads and flowers on the pools, green seed heads after the flowers.','generic_fruit_lotus_seed'),{holy:true}),
 lily:PK('Iridescent water lily','cool-temperate','humid','yes',['Cwb','Cfb'],['lily'],HV('none',[],true,'A lily of no fixed colour: violet, blue, rose and gold shift across it as the eye moves. Its root is a dream reagent, steeped.'),{alien:true}),
 peyote:PK('Peyote buttons','cool-temperate','subhumid','no',['Cwb','Dwb'],['peyote'],HV('none',[],true,'Pale blue-green buttons flush with the gravel, a pink flower in the crown of each; dried, the monks\' seeing reagent, taken on the flats at dawn.'),{holy:true}),
 stonebloom:PK('Stone-blooms','cool-temperate','subhumid','no',['Cwb','Dwb'],['stonebloom'],HV('none',[],false,'Pebble plants that pass for the gravel they lie in until they flower, each a pair of fleshy stones with a daisy between.'),{alien:true}),
 fern:PK('Shade ferns','cool-temperate','humid','both',['Cwb','Cfb'],['fern'],HV('none',['fiddleheads'],false,'')),
 mooncap:PK('Moon caps','cool-temperate','humid','both',['Cwb','Cfb'],['mooncap'],HV('none',['caps (cooked)'],true,'Pink pleated parasols on dark stems, in rings under the cherries; a mild dream mushroom, eaten dried in the winter rites.')),
 bracket:PK('Rainbow brackets','cool-temperate','humid','both',['Cwb','Cfb'],['bracket'],HV('none',[],true,'Shelf fungi banded in rings of teal, gold and blue on the old trunks; a tea of them is the monks\' long-life tonic.')),
 reed:PK('Reeds and iris','cool-temperate','humid','yes',['Cwb','Cfb'],['reed','blade'],HV('thatch, weaving',[],false,'')),
 box:PK('Box domes','cool-temperate','subhumid','no',['Cwb','Cfb'],['boxdome'],HV('none',[],false,'Clipped-looking domes of small leaves on the meadows, nobody\'s clipping.')),
 tea:PK('Mist tea','cool-temperate','humid','no',['Cwb','Cfb'],['teabush'],HV('none',['leaves (dried, steeped)'],true,'Xanadu\'s mist tea, wild on the terraces; the valley\'s drink.')),
 poppy:PK('Sky poppy','cool-temperate','humid','no',['Cwb','Cfb','Dwb'],['poppy'],HV('dye (the leaves: the Order\'s blue)',[],true,'A powder-blue poppy on the slopes; its seed is a sleeping draught and a reagent of the stillness rites, and its leaves are the vat the Order\'s blue is dyed in.'),{holy:true}),
 snowlotus:PK('Snow lotus','cool-temperate','subhumid','no',['Cwb','ET'],['snowlotus'],HV('none',[],true,'A pale woolly rosette high on the cold slopes; the whole plant, dried, is the valley\'s strongest medicine, for the heart and the breath.'),{holy:true}),
 ginseng:PK('Valley ginseng','cool-temperate','humid','no',['Cwb','Cfb'],['ginseng'],HV('none',['root'],true,'A whorl of five leaflets and a cluster of coral berries over a man-shaped root: the monks\' tonic and reagent, dug after seven years.')),
 sage:PK('Monk\'s sage','cool-temperate','subhumid','no',['Cwb','Dwb'],['sagebush'],HV('incense',[],true,'A silver wormwood on the flats, burned for incense and brewed bitter for the stomach.')),
 coin:PK('Coin vine','cool-temperate','humid','both',['Cwb','Cfb'],['coin'],HV('none',[],false,'Strings of round leaves hung from the limbs like coins on a thread.'),{alien:true}),
 petals:PK('Fallen petals','cool-temperate','humid','both',['Cwb','Cfb'],['petal'],HV('none',['petals (cakes)'],false,'')),
 stones:PK('Standing stones','cool-temperate','subhumid','no',['Cwb','Cfb','Dwb'],['standing','boulder','stone'],HV('none',[],false,'The valley\'s stones stand in threes, fives and sevens, as if set; the monks say the valley set them.')),
};
OIDONG.plantOfItem=item=>{for(const k in OIDONG.PLANTS)if(OIDONG.PLANTS[k].items.indexOf(item)>=0)return OIDONG.PLANTS[k];return null;};
OIDONG.FRUIT_KEYS=[...new Set(OIDONG.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(OIDONG.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];
// the item that draws each catalogued fruit (the probe's "fruit tagged, catalogued and drawn")
OIDONG.FRUIT_ITEM={giantlotus:'giantpod',bodhi:'ball',cherry:'ball',bellpod:'beads',lotus:'lotuspod'};

// ---------------------------------------------------------------- leaf and flower textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(510019);
const TX={};
const G2=BIO.tex.grey;
/* HEART leaves with drip tips (the sacred fig): cordate leaves in loose sprays */
TX.heart=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<70;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(120,240,i/70)+rr(-12,10),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+(k-(n-1)/2)*.6,L=rr(30,46),W=L*.62,x=c[0],y=c[1];g.fillStyle=G2(lum*rr(.92,1.05));
   g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+Math.cos(a-1.2)*W,y+Math.sin(a-1.2)*W,x+Math.cos(a-.3)*L,y+Math.sin(a-.3)*L,x+Math.cos(a)*L*1.35,y+Math.sin(a)*L*1.35);
   g.bezierCurveTo(x+Math.cos(a+.3)*L,y+Math.sin(a+.3)*L,x+Math.cos(a+1.2)*W,y+Math.sin(a+1.2)*W,x,y);g.fill();
   g.strokeStyle=G2(lum*.7);g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L*1.2,y+Math.sin(a)*L*1.2);g.stroke();}}},[160,160,160]);
/* BLOSSOM: dense five-petalled florets (the cherry, the haze blossom; Xanadu's painter) */
TX.blossom=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<520;i++){const p=BIO.tex.clPt(S,.1,.74),lum=lerp(150,250,rng()),r=rr(5,9);g.fillStyle=G2(lum);
  for(let k=0;k<5;k++){const a=k/5*TAU+p[2];g.beginPath();g.arc(p[0]+Math.cos(a)*r*.55,p[1]+Math.sin(a)*r*.55,r*.5,0,TAU);g.fill();}
  g.fillStyle=G2(lum*.72);g.beginPath();g.arc(p[0],p[1],r*.22,0,TAU);g.fill();}},[200,200,200]);
/* LACE: the marble birch's foliage, fine pale sprays like frost on a window */
TX.lace=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<120;i++){const p=BIO.tex.clPt(S,.1,.72),a=rr(0,TAU),L=rr(24,44),lum=lerp(150,250,rng());
  g.strokeStyle=G2(lum*.8);g.lineWidth=1.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=3.5){const t=s/L,nl=lerp(9,2,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=G2(lum*rr(.9,1.06));g.lineWidth=1.1;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.1;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[150,150,150]);
/* NEEDLES: the cloud pine's pads (Xanadu's painter) */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<560;i++){const p=BIO.tex.clPt(S,.10,.72),a=rr(0,TAU),L=rr(16,30),lum=lerp(100,228,rng());
  g.strokeStyle=G2(lum);g.lineWidth=1.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[135,135,135]);
/* MAPLE: palmate leaves, five lobes, in flat sprays */
TX.maple=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.74),lum=lerp(120,240,i/64)+rr(-12,10),R=rr(16,24),a0=rr(0,TAU);
  g.fillStyle=G2(lum);g.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,r=k%2?R*.42:R;g.lineTo(c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r);}g.closePath();g.fill();
  g.strokeStyle=G2(lum*.7);g.lineWidth=1;for(let k=0;k<5;k++){const a=a0+k/5*TAU;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*R*.9,c[1]+Math.sin(a)*R*.9);g.stroke();}}},[160,160,160]);
/* SMALL dense leaves (the moss-ball tree, the bell-pod willow, the cushions' fringe) */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);
 for(let i=0;i<420;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/420)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(6,11),rr(2.5,4.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* BROAD: oval leaves in flat sprays (the wisteria's leaf) */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/60)+rr(-15,12),n=ri(4,7),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(34,54),rr(11,17),a0+(k-(n-1)/2)*.55,lum*rr(.9,1.05),true);}},[160,160,160]);
/* BAMBOO: narrow lanceolate leaves in loose sprays */
TX.bambooleaf=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.1,.74),lum=lerp(125,240,i/110),n=ri(3,6),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,62),rr(5,8),a0+(k-(n-1)/2)*.5,lum*rr(.9,1.06),false);}},[160,160,160]);
/* RACEME: a hanging cone of florets, widest at the top (v=0): the wisteria */
TX.raceme=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<700;i++){const t=Math.pow(rng(),.8),y=t*S*.96+2,w=S*.34*(1-t*.85),x=S/2+rr(-1,1)*w,lum=lerp(245,150,t)*rr(.88,1.05),r=lerp(8,3,t);
 g.fillStyle=G2(lum);g.beginPath();g.ellipse(x,y,r,r*.8,rr(0,TAU),0,TAU);g.fill();}
 g.strokeStyle=G2(110);g.lineWidth=2;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S*.9);g.stroke();},[200,200,200]);
/* BEADS: a hanging string of round beads on a thread (the bell-pod willow; v=0 at the top) */
TX.beads=BIO.alphaTex(256,(g,S)=>{g.strokeStyle=G2(120);g.lineWidth=2.4;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S*.92);g.stroke();
 for(let y=12;y<S*.92;y+=15){const r=rr(6,8.5),lum=lerp(170,245,rng());g.fillStyle=G2(lum);g.beginPath();g.arc(S/2+rr(-3,3),y,r,0,TAU);g.fill();
  g.fillStyle=G2(Math.min(255,lum*1.15));g.beginPath();g.arc(S/2-r*.3,y-r*.3,r*.35,0,TAU);g.fill();}},[200,200,200]);
/* COINS: round leaves strung along a hanging stem (the coin vine; v=0 at the top) */
TX.coin=BIO.alphaTex(256,(g,S)=>{g.strokeStyle=G2(110);g.lineWidth=2;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S*.95);g.stroke();
 for(let y=10;y<S*.95;y+=13){const r=rr(8,11),lum=lerp(150,235,rng()),x=S/2+(y%26<13?-1:1)*r*.8;g.fillStyle=G2(lum);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.strokeStyle=G2(lum*.7);g.lineWidth=.8;for(let k=0;k<6;k++){const a=k/6*TAU;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9);g.stroke();}}},[180,180,180]);
/* THREADS: the water spilling from a chalice cap, fine white threads with drops (v=0 at the rim) */
TX.thread=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<7;k++){const x0=S*(.15+.7*k/6)+rr(-6,6),lum=lerp(200,255,rng());g.strokeStyle=G2(lum);g.lineWidth=rr(1.2,2.4);g.beginPath();g.moveTo(x0,0);
  let x=x0,y=0;while(y<S){x+=rr(-.8,.8);y+=rr(8,14);g.lineTo(x,y);}g.stroke();
  for(let y=rr(10,40);y<S;y+=rr(26,60)){g.fillStyle=G2(255);g.beginPath();g.ellipse(x0+rr(-3,3),y,1.8,3.2,0,0,TAU);g.fill();}}},[235,235,235]);
/* the LOTUS from above: two rings of pointed petals, a pale seed-head (Xanadu's painter) */
TX.lotus=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;[[10,.46,0,205],[8,.30,.3,240]].forEach(r=>{for(let k=0;k<r[0];k++){const a=k/r[0]*TAU+r[2];g.fillStyle=G2(r[3]*rr(.92,1.02));g.beginPath();g.ellipse(cx+Math.cos(a)*S*r[1]*.5,cy+Math.sin(a)*S*r[1]*.5,S*r[1]*.5,S*.09,a,0,TAU);g.fill();}});
 g.fillStyle=G2(170);g.beginPath();g.arc(cx,cy,S*.08,0,TAU);g.fill();},[210,210,210]);
/* the WATER LILY from above: many narrow pointed petals in three rings, a bright heart */
TX.lily=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;[[14,.48,0,195],[12,.38,.2,225],[9,.26,.45,250]].forEach(r=>{for(let k=0;k<r[0];k++){const a=k/r[0]*TAU+r[2];g.fillStyle=G2(r[3]*rr(.94,1.02));g.beginPath();g.ellipse(cx+Math.cos(a)*S*r[1]*.5,cy+Math.sin(a)*S*r[1]*.5,S*r[1]*.5,S*.055,a,0,TAU);g.fill();}});
 g.fillStyle=G2(255);g.beginPath();g.arc(cx,cy,S*.07,0,TAU);g.fill();},[210,210,210]);
/* a POPPY: four broad crinkled petals, a dark heart */
TX.poppy=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;for(let p=0;p<4;p++){const a=p/4*TAU+.4;g.fillStyle=G2(lerp(190,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.2,cy+Math.sin(a)*S*.2,S*.26,S*.2,a,0,TAU);g.fill();}
 g.fillStyle=G2(90);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=G2(230);g.beginPath();g.arc(cx,cy,S*.035,0,TAU);g.fill();},[200,200,200]);
/* a DAISY (the stone-blooms' flower, the peyote's crown): a ring of petals round a disc */
TX.daisy=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;for(let p=0;p<13;p++){const a=p/13*TAU;g.fillStyle=G2(lerp(205,250,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.28,cy+Math.sin(a)*S*.28,S*.19,S*.06,a,0,TAU);g.fill();}
 g.fillStyle=G2(140);g.beginPath();g.arc(cx,cy,S*.12,0,TAU);g.fill();},[200,200,200]);
/* a flat PETAL (fallen cherry petals): one oval with a notch */
TX.petal=BIO.alphaTex(64,(g,S)=>{g.fillStyle=G2(235);g.beginPath();g.ellipse(S/2,S/2,S*.42,S*.28,0,0,TAU);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(S*.92,S/2,S*.1,0,TAU);g.fill();},[230,230,230]);
/* FRONDS: the shade fern (Xanadu's painter) */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=G2(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
/* tufts: GRASS, BLADES (iris, reeds), the silver SAGE, the cap-rim grass */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.blade=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<24;k++){const x0=S/2+rr(-22,22),a=-Math.PI/2+rr(-.35,.35),L=S*rr(.6,.97),lum=lerp(140,245,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(3.5,6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L*1.05,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
TX.clubmoss=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=S/2+rr(-70,70),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.3,.7),lum=lerp(110,230,rng());
  g.strokeStyle=G2(lum*.7);g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();
  for(let s=5;s<L;s+=5.5){const bx=x0+Math.cos(a)*s,by=S+Math.sin(a)*s;g.fillStyle=G2(lum*rr(.9,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*6,by+Math.sin(a+sd*1.3)*6,8,3.6,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* MOSS: a dense fuzz of tiny shoots (the mats and the clumps on the limbs) */
TX.moss=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,7,.6);g.lineCap='round';
 for(let i=0;i<900;i++){const c=BIO.tex.clPt(S,.13,.94),lum=lerp(120,250,rng()),r=rr(1.5,3.5);g.strokeStyle=G2(lum);g.lineWidth=1.1;
  for(let k=0;k<5;k++){const a=k/5*TAU+i;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r);g.stroke();}}},[150,150,150]);
/* UNDER: understorey foliage (the ginseng's whorl, the tea bush) */
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
/* a plain opaque card: the stand-in map of a material the library card replaces (and the whole map of a pad without its card) */
TX.blank=BIO.alphaTex(64,(g,S)=>{g.fillStyle=G2(235);g.fillRect(0,0,S,S);},[230,230,230]);
OIDONG.TEX=TX;
/* the CUSHION skin: tiny leaves packed solid, opaque (the cushion tree's domes, the box domes; Xanadu's) */
OIDONG.CUSHIONTEX=BIO.canvasTex(512,512,(g,w,h)=>{g.fillStyle='#4a4a4a';g.fillRect(0,0,w,h);
 for(let i=0;i<9000;i++){const x=rng()*w,y=rng()*h,l=Math.round(lerp(110,240,Math.pow(rng(),.7))),a=rr(0,TAU),L=rr(3,5.5);g.fillStyle='rgb('+l+','+l+','+l+')';
  g.beginPath();g.ellipse(x,y,L,L*.45,a,0,TAU);g.fill();g.strokeStyle='rgba(60,60,60,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(x-Math.cos(a)*L*.8,y-Math.sin(a)*L*.8);g.lineTo(x+Math.cos(a)*L*.8,y+Math.sin(a)*L*.8);g.stroke();}},3);
/* the MOSS-BALL skin: the same, finer and softer (the moss-ball tree's balls, opaque) */
OIDONG.MOSSBALLTEX=BIO.canvasTex(512,512,(g,w,h)=>{g.fillStyle='#5a5a5a';g.fillRect(0,0,w,h);
 for(let i=0;i<16000;i++){const x=rng()*w,y=rng()*h,l=Math.round(lerp(120,245,Math.pow(rng(),.6))),r=rr(1.2,2.6);g.fillStyle='rgb('+l+','+l+','+l+')';
  g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}},3);
/* the CHALICE CAP skin: veins radiating from the centre (u) over a soft gradient, opaque; the cap tints it */
OIDONG.CAPTEX=BIO.canvasTex(512,256,(g,w,h)=>{g.fillStyle='#9a9a9a';g.fillRect(0,0,w,h);
 for(let k=0;k<36;k++){const x=k/36*w+rr(-4,4);g.strokeStyle='rgba(60,60,60,.5)';g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rr(-10,10),h*.5,x+rr(-20,20),0);g.stroke();
  for(let b=0;b<4;b++){const y=rr(0,h);g.strokeStyle='rgba(70,70,70,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-16,16),y-rr(10,30));g.stroke();}}
 for(let i=0;i<400;i++){g.fillStyle='rgba(200,200,200,.18)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(4,14),rr(2,6),rr(0,TAU),0,TAU);g.fill();}});

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders, except the MARBLE (3), painted in its own pastels.
OIDONG.barkTex=function(kind){
 if(kind===3)return BIO.canvasTex(256,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  // cream, and swirled bands of every pastel at once: rose, powder blue, lavender, mint, peach, gold (refs: the marble forest)
  const cols=[[246,238,230],[244,198,210],[185,211,234],[203,184,230],[191,230,208],[246,205,178],[234,220,162],[250,246,240],[240,184,200],[160,200,236]];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=x/w;
   const yy=y+22*Math.sin(u*TAU*1.5+y*.013)+9*Math.sin(u*TAU*4+2.1)+8*(fbm(x/30,y/50,3,2)-.5)*2;
   const f=((yy/h*12)%12+12)%12,b=Math.floor(f),t=f-b,c0=cols[b%cols.length],c1=cols[(b+1)%cols.length],k=smooth(.55,.98,t);
   const grain=.95+.05*Math.sin(yy*2.1)+.03*(h3(x,y,5)-.5),pale=smooth(.3,.7,fbm(x/60+9,y/90,7,2));   // most of the bole stays cream
   const r=mix(c0[0]*(1-k)+c1[0]*k,246,pale),gg=mix(c0[1]*(1-k)+c1[1]*k,238,pale),bb=mix(c0[2]*(1-k)+c1[2]*k,230,pale);
   d[i]=clamp(r*grain,0,255);d[i+1]=clamp(gg*grain,0,255);d[i+2]=clamp(bb*grain,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){   // the cherry: horizontal lenticel bands on a dark bark, peeling in rings
  for(let y=0;y<h;y+=rr(14,34)){g.fillStyle='rgba(190,190,190,'+(.25+rng()*.3).toFixed(2)+')';g.fillRect(0,y,w,rr(2,5));
   for(let k=0;k<6;k++){const x=rng()*w;g.fillStyle='rgba(60,60,60,.5)';g.fillRect(x,y+rr(-3,3),rr(6,22),rr(1.5,3));}}
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba(50,50,50,'+(.15+rng()*.25).toFixed(2)+')';g.lineWidth=rr(1,2);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(20,60));g.stroke();}}
 else if(kind===1){   // smooth and pale: faint vertical creases, a few lenticels
  for(let i=0;i<90;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'100,100,100':'175,175,175')+',.35)';g.lineWidth=rr(1,2.5);g.beginPath();g.moveTo(x,-4);g.bezierCurveTo(x+rr(-6,6),h*.33,x+rr(-6,6),h*.66,x+rr(-5,5),h+4);g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(70,70,70,.35)';g.fillRect(rng()*w,rng()*h,rr(4,14),rr(1.2,2.4));}}
 else if(kind===2){   // ribbed green stalks: vertical ribs
  for(let i=0;i<70;i++){const x=i/70*w+rr(-2,2);g.strokeStyle='rgba('+(i%2?'70,70,70':'170,170,170')+',.45)';g.lineWidth=rr(1.5,3.5);g.beginPath();g.moveTo(x,-4);g.lineTo(x+rr(-3,3),h+4);g.stroke();}}
 else if(kind===4){const id=g.getImageData(0,0,w,h),d=id.data;   // whorled (Xanadu's): a helix stripe, tileable
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=(x+y)/64*TAU+.9*Math.sin((x-y)/128*TAU),band=Math.sin(s),fine=Math.sin(s*5+1.1);
   const v=140+62*smooth(-.2,.6,band)-40*smooth(.3,.9,-band)+10*fine+14*(h3(x,y,7)-.5);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);}
  g.putImageData(id,0,0);}
 else if(kind===6){   // fibrous: long shreds, the cedar's red bark (Xanadu's rufous painter)
  for(let i=0;i<300;i++){const x=rng()*w,d2=rng();g.strokeStyle='rgba('+(d2<.5?'55,55,55':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d2<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-10,10),h*.33,x+rr(-10,10),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else{   // bamboo: a smooth cane with a node every 64 px (the lathe's v tile), a sheath scar under it
  for(let i=0;i<40;i++){const x=rng()*w;g.strokeStyle='rgba(120,120,120,.2)';g.lineWidth=rr(1,2);g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
  for(let y=30;y<h;y+=64){g.fillStyle='rgba(60,60,60,.7)';g.fillRect(0,y,w,4);g.fillStyle='rgba(215,215,215,.7)';g.fillRect(0,y+4,w,5);g.fillStyle='rgba(90,90,90,.35)';g.fillRect(0,y+9,w,10);}}
});};
OIDONG.BARKTEX=[0,1,2,3,4,5,6].map(k=>OIDONG.barkTex(k));
OIDONG.WOODTEX=OIDONG.barkTex(1);
// pale granite: fine speckle, the valley's stones tint it
OIDONG.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=h3(x,y,41),v=(150+(fbm(x/26,y/26,3.7,3)-.5)*34+(s<.06?-30:s>.92?20:0)+(fbm(x/3,y/3,9.2,1)-.5)*16);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
const mk=(pos,nor,uv,col)=>BIO.geo._make(pos,nor,uv,col);
// a mesh builder: tri(a,b,c, ca,cb,cc) with colours [r,g,b]; out() gives the geometry with flat or smooth normals
function smoothN(pos){const map=new Map(),n=new Float32Array(pos.length),key=i=>Math.round(pos[i]*1e3)+','+Math.round(pos[i+1]*1e3)+','+Math.round(pos[i+2]*1e3);
 for(let i=0;i<pos.length;i+=9){const a=[pos[i],pos[i+1],pos[i+2]],b=[pos[i+3],pos[i+4],pos[i+5]],c=[pos[i+6],pos[i+7],pos[i+8]];
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  for(let j=0;j<3;j++){const k=key(i+j*3);const s=map.get(k)||[0,0,0];s[0]+=nx;s[1]+=ny;s[2]+=nz;map.set(k,s);}}
 for(let i=0;i<pos.length;i+=3){const s=map.get(key(i)),l=Math.hypot(s[0],s[1],s[2])||1;n[i]=s[0]/l;n[i+1]=s[1]/l;n[i+2]=s[2]/l;}
 return Array.from(n);}
function Mesh(){const pos=[],col=[],uv=[];return{tri(a,b,c,ca,cb,cc,ua,ub,uc){pos.push(...a,...b,...c);col.push(...ca,...(cb||ca),...(cc||ca));uv.push(...(ua||[0,0]),...(ub||[0,0]),...(uc||[0,0]));},
 quad(a,b,c,d,ca,cb,cc,cd,q){this.tri(a,b,c,ca,cb,cc,q&&q[0],q&&q[1],q&&q[2]);this.tri(a,c,d,ca,cc,cd,q&&q[0],q&&q[2],q&&q[3]);},
 out(flat){let nor;if(flat){nor=[];for(let i=0;i<pos.length;i+=9){const ux=pos[i+3]-pos[i],uy=pos[i+4]-pos[i+1],uz=pos[i+5]-pos[i+2],vx=pos[i+6]-pos[i],vy=pos[i+7]-pos[i+1],vz=pos[i+8]-pos[i+2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;for(let j=0;j<3;j++)nor.push(nx/l,ny/l,nz/l);}}else nor=smoothN(pos);
  return mk(pos,nor,uv,col);}};}
const vadd=(o,g,c)=>{g=g.toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<a.length;i+=3){o.pos.push(a[i],a[i+1],a[i+2]);o.nor.push(n[i],n[i+1],n[i+2]);o.uv.push(0,0);o.col.push(c[0],c[1],c[2]);}};
// a TUFT card: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return mk(pos,nor,uv);};
// a flat CARD in the xz plane, face up, centred (petals, lilies seen from above)
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return mk(pos,nor,uv);};
// a leaf STRIP along +x from its base at the origin, arching up then drooping, face up (the fern)
G.strip=function(nseg,arch,droop){const pos=[],uv=[],nor=[],P=[];
 for(let i=0;i<=nseg;i++){const t=i/nseg,y=arch*Math.sin(t*Math.PI*.8)-droop*t*t;P.push([t,y,t]);}
 for(let i=0;i<nseg;i++){const a=P[i],b=P[i+1];
  const v=[[a[0],a[1],-.5,0,a[2]],[b[0],b[1],-.5,0,b[2]],[b[0],b[1],.5,1,b[2]],[a[0],a[1],.5,1,a[2]]];
  [0,1,2,0,2,3].forEach(k=>{pos.push(v[k][0],v[k][1],v[k][2]);uv.push(v[k][3],v[k][4]);nor.push(0,1,0);});}
 return mk(pos,nor,uv);};
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
G.ball=function(){return new T3.SphereGeometry(1,6,4);};
// a CUSHION: a smooth lumpy dome, origin at its centre (Xanadu's)
G.cushion=function(){const g=new T3.SphereGeometry(1,12,8).toNonIndexed(),p=g.attributes.position,col=[];
 const lump=(x,y,z)=>1+.07*Math.sin(x*5.1+z*3.3)*Math.cos(y*4.7+x*1.9)+.05*Math.sin(z*7.3-y*5.2)+.04*Math.cos(x*9.1+y*8.3+z*6.7);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=lump(x,y,z);p.setXYZ(i,x*k,y*k,z*k);
  const ao=lerp(.45,1.12,smooth(-.8,.7,y))*(.9+.2*(k-1)/.16);col.push(ao,ao,ao);}
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;};
// a LILY PAD: a flat disc with a notch, paler at the rim (Xanadu's)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=12;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.93+.22,a1=((k+1)/n)*TAU*.93+.22;
  [[0,0,0,.8],[Math.cos(a1),0,Math.sin(a1),1.05],[Math.cos(a0),0,Math.sin(a0),1.05]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return mk(pos,nor,uv,col);};
// a GIANT PAD (the Victoria lily's tray): a disc whose rim turns up in a lip, ribbed underneath, a notch; unit radius,
// vertex-coloured paler at the lip and darker in the ribs' shade
G.giantpad=function(){const M=Mesh(),n=28,rings=[0,.35,.65,.86,.95,1.0,1.0],lip=[0,0,0,0,.02,.09,.11];
 const P=[];for(let r=0;r<rings.length;r++){const row=[];for(let s=0;s<=n;s++){const a=s/n*TAU*.96+.08,R=rings[r]*(1+.012*Math.sin(s*7));row.push([Math.cos(a)*R,lip[r]+(r<5?.004*Math.sin(s*5.3):0)+(r===6?-.012:0),Math.sin(a)*R]);}P.push(row);}
 const cT=t=>{const k=.85+.3*t;return[k,k,k*.98];},cLip=[1.08,1.0,1.02];
 for(let r=0;r<rings.length-1;r++)for(let s=0;s<n;s++){const a=P[r][s],b=P[r+1][s],c=P[r+1][s+1],d=P[r][s+1],c0=r>=4?cLip:cT(rings[r]),c1=r+1>=4?cLip:cT(rings[r+1]);
  if(r<5)M.quad(a,b,c,d,c0,c1,c1,c0);else M.quad(a,d,c,b,c0,c0,c1,c1);}   // the lip's outer face turns down
 // the underside: ribs radiating under the pad (seen from the shore, between the pads)
 for(let s=0;s<n;s+=2){const a=s/n*TAU*.96+.08,ca=Math.cos(a),sa=Math.sin(a),w=.025;
  M.quad([ca*.1-sa*w,-.02,sa*.1+ca*w],[ca*.95-sa*w,-.03,sa*.95+ca*w],[ca*.95+sa*w,-.03,sa*.95-ca*w],[ca*.1+sa*w,-.02,sa*.1-ca*w],[.55,.5,.45],[.55,.5,.45],[.55,.5,.45],[.55,.5,.45]);}
 const g=M.out(true),p=g.attributes.position,uv=new Float32Array(p.count*2);   // mapped from above, one card over the disc
 for(let i=0;i<p.count;i++){uv[i*2]=(p.getX(i)+1)/2;uv[i*2+1]=(p.getZ(i)+1)/2;}
 g.setAttribute('uv',new T3.BufferAttribute(uv,2));return g;};
// a LOTUS in the round: two rings of cupped petals, white at the base to full at the tip, unit radius, origin at the base (Xanadu's)
G.cup=function(){const pos=[],nor=[],uv=[],col=[];
 [[8,1.0,.55,.9,0],[6,.62,.95,.75,.35]].forEach(r=>{const n=r[0],R=r[1],el=r[2],L=r[3];
  for(let k=0;k<n;k++){const a=k/n*TAU+r[4],ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=R*.36;
   const b=[ca*.1,.05,sa*.1],m=[ca*R*.55,Math.sin(el)*L*.45+.05,sa*R*.55],t=[ca*R*.8,Math.sin(el)*L+.08,sa*R*.8];
   const nrm=[ca*Math.cos(el)*-.5,.8,sa*Math.cos(el)*-.5];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(b,.95);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push([m[0]-px*W,m[1],m[2]-pz*W],.9);
   push([m[0]-px*W,m[1],m[2]-pz*W],.9);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push(t,.55);}});
 const s=new T3.CylinderGeometry(.16,.12,.14,7).toNonIndexed();s.translate(0,.2,0);const a=s.attributes.position.array,nn=s.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(nn[i],nn[i+1],nn[i+2]);uv.push(0,0);col.push(1.4,1.3,.5);}
 return mk(pos,nor,uv,col);};
// a GIANT LOTUS FLOWER in the round: three rings of petals, the outer ones laid open, the inner ones cupped, blush to cream;
// a seed head in the middle; unit radius, origin at the base; vertex-coloured in full (the instance colour near white)
G.giantcup=function(){const M=Mesh();const petal=(a,R,el,L,W,cB,cT)=>{const ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
  const b=[ca*.12,.04,sa*.12],m=[ca*R*.5,Math.sin(el)*L*.45+.05,sa*R*.5],t=[ca*R*.86,Math.sin(el)*L+.1,sa*R*.86],mm=[m[0],m[1]-.04,m[2]];
  M.tri(b,[m[0]+px*W,m[1],m[2]+pz*W],mm,cB,cB,cB);M.tri(b,mm,[m[0]-px*W,m[1],m[2]-pz*W],cB,cB,cB);
  M.tri([m[0]+px*W,m[1],m[2]+pz*W],t,mm,cB,cT,cB);M.tri(mm,t,[m[0]-px*W,m[1],m[2]-pz*W],cB,cT,cB);};
 const cream=[.98,.95,.9],blush=[.96,.78,.84],rose=[.94,.68,.78];
 for(let k=0;k<10;k++)petal(k/10*TAU,1.0,.25,.9,.3,cream,blush);
 for(let k=0;k<8;k++)petal(k/8*TAU+.3,.78,.7,.8,.24,cream,rose);
 for(let k=0;k<6;k++)petal(k/6*TAU+.1,.5,1.1,.6,.17,[1,.96,.9],rose);
 const o={pos:[],nor:[],uv:[],col:[]};vadd(o,new T3.CylinderGeometry(.2,.13,.18,8).translate(0,.3,0),[.95,.9,.55]);
 const g=M.out(true),p=Array.from(g.attributes.position.array),n=Array.from(g.attributes.normal.array),c=Array.from(g.attributes.color.array),u=Array.from(g.attributes.uv.array);
 return mk(p.concat(o.pos),n.concat(o.nor),u.concat(o.uv),c.concat(o.col));};
// a LOTUS SEED HEAD: the green receptacle on its stalk, face up, seeds set in it (Xanadu's; the catalog's colours)
G.lotuspod=function(){const o={pos:[],nor:[],uv:[],col:[]},pod=C(0x8a9a5a),shade=(c,f)=>c.clone().lerp(C(f>=0?0xffffff:0x120f0a),Math.abs(f));
 vadd(o,new T3.CylinderGeometry(.018,.024,.82,4,1,true).translate(0,.41,0),[shade(pod,-.15).r,shade(pod,-.15).g,shade(pod,-.15).b]);
 vadd(o,new T3.CylinderGeometry(.2,.07,.18,8,1,false).translate(0,.91,0),[pod.r,pod.g,pod.b]);
 for(let i=0;i<7;i++){const a=i*2.4,r=i?.11:0,s=new T3.CircleGeometry(.032,4).rotateX(-Math.PI/2).translate(Math.cos(a)*r,1.002,Math.sin(a)*r);
  const cc=i%2?shade(pod,-.35):C(0xe8e0c0);vadd(o,s,[cc.r,cc.g,cc.b]);}
 return mk(o.pos,o.nor,o.uv,o.col);};
// a GIANT SEED HEAD: the receptacle alone, a basin a metre across with its seed sockets, face up; unit radius, origin at the base
G.giantpod=function(){const o={pos:[],nor:[],uv:[],col:[]},pod=C(0x8a9a5a);
 vadd(o,new T3.CylinderGeometry(1,.4,.55,12,1,false).translate(0,.275,0),[pod.r,pod.g,pod.b]);
 for(let i=0;i<19;i++){const a=i*GOLD,r=i?.16*Math.sqrt(i):0,s=new T3.CircleGeometry(.1,6).rotateX(-Math.PI/2).translate(Math.cos(a)*r,.552,Math.sin(a)*r);
  const cc=i%3?C(0xe8e0c0):C(0x4a5a30);vadd(o,s,[cc.r,cc.g,cc.b]);}
 return mk(o.pos,o.nor,o.uv,o.col);};
// a CHALICE CAP: a shallow inverted dome with a thick turned lip, uvs radial (u round, v out); origin at the stem's top,
// unit radius; vertex-coloured: the top takes the instance colour whole, the underside darker, the lip pale
G.cap=function(){const M=Mesh(),n=36,prof=[[0,.0],[.2,.02],[.45,.05],[.7,.06],[.88,.04],[.97,-.02],[1.0,-.1],[.98,-.17],[.9,-.2],[.75,-.17],[.55,-.14],[.3,-.1],[.0,-.06]];
 const P=prof.map(q=>{const row=[];for(let s=0;s<=n;s++){const a=s/n*TAU,R=q[0]*(1+.03*Math.sin(s*5+q[1]*20));row.push([Math.cos(a)*R,q[1],Math.sin(a)*R]);}return row;});
 for(let r=0;r<prof.length-1;r++)for(let s=0;s<n;s++){const a=P[r][s],b=P[r+1][s],c=P[r+1][s+1],d=P[r][s+1];
  const top=r<5,lip=r>=4&&r<=8,c0=top?[1,1,1]:lip?[1.05,1.0,.95]:[.55,.6,.6],c1=r+1<5?[1,1,1]:(r+1>=4&&r+1<=8)?[1.05,1.0,.95]:[.55,.6,.6];
  const ua=[s/n*4,prof[r][0]],ub=[s/n*4,prof[r+1][0]],uc=[(s+1)/n*4,prof[r+1][0]],ud=[(s+1)/n*4,prof[r][0]];   // u round the rim (four times), v out from the stem
  if(r<6)M.quad(a,d,c,b,c0,c0,c1,c1,[ua,ud,uc,ub]);else M.quad(a,b,c,d,c0,c1,c1,c0,[ua,ub,uc,ud]);}
 return M.out(false);};
// a MOON CAP: a pleated parasol on a thin dark stem, the cap's pleats vertex-shaded; origin at the base, 1 high
G.mooncap=function(){const M=Mesh(),o={pos:[],nor:[],uv:[],col:[]};vadd(o,new T3.CylinderGeometry(.018,.03,.78,4,1,true).translate(0,.39,0),[.42,.3,.36]);
 const n=18,prof=[[.0,1.0],[.14,.98],[.3,.93],[.42,.84],[.46,.74],[.44,.68]];
 const P=prof.map(q=>{const row=[];for(let s=0;s<=n;s++){const a=s/n*TAU,R=q[0]*(1+.08*Math.cos(s*TAU/n*9));row.push([Math.cos(a)*R,q[1],Math.sin(a)*R]);}return row;});
 for(let r=0;r<prof.length-1;r++)for(let s=0;s<n;s++){const a=P[r][s],b=P[r+1][s],c=P[r+1][s+1],d=P[r][s+1],pl=.86+.14*Math.cos(s*TAU/n*9),c0=[pl,pl*.97,pl],c1=[pl*(1-.08*r),pl*.97*(1-.08*r),pl*(1-.06*r)];
  M.quad(a,d,c,b,c0,c0,c1,c1);M.quad(a,b,c,d,[.9,.84,.86],[.86,.8,.82],[.86,.8,.82],[.9,.84,.86]);}
 const g=M.out(false),p=Array.from(g.attributes.position.array),nn=Array.from(g.attributes.normal.array),c=Array.from(g.attributes.color.array),u=Array.from(g.attributes.uv.array);
 return mk(p.concat(o.pos),nn.concat(o.nor),u.concat(o.uv),c.concat(o.col));};
// a BRACKET: a half-disc shelf fungus, banded in rings (vertex colours: the rings take turns from the instance colour and
// its shades); it stands out from a trunk along +z with its flat face down. Unit radius.
G.bracket=function(){const M=Mesh(),n=14,rings=[0,.3,.5,.66,.8,.9,1.0],lift=[.0,.1,.15,.17,.17,.15,.1];
 const rc=[[.7,.6,.4],[1,1,1],[.5,.7,.9],[1.1,.9,.5],[.6,.9,.8],[1,1,1],[1.1,1.05,.95]];
 const P=rings.map((R,r)=>{const row=[];for(let s=0;s<=n;s++){const a=s/n*Math.PI;row.push([Math.cos(a)*R,lift[r]*(1-.3*Math.abs(Math.cos(a))),Math.sin(a)*R*.9]);}return row;});
 for(let r=0;r<rings.length-1;r++)for(let s=0;s<n;s++){const a=P[r][s],b=P[r+1][s],c=P[r+1][s+1],d=P[r][s+1];M.quad(a,d,c,b,rc[r],rc[r],rc[r+1],rc[r+1]);
  M.quad([a[0],-.03,a[2]],[b[0],-.03,b[2]],[c[0],-.03,c[2]],[d[0],-.03,d[2]],[.95,.9,.8],[.95,.9,.8],[.95,.9,.8],[.95,.9,.8]);}
 return M.out(true);};
// PEYOTE: a cluster of flattened ribbed buttons flush with the ground, a pink crown on the biggest; unit across
G.peyote=function(){const o={pos:[],nor:[],uv:[],col:[]};
 const buttons=[[0,0,.26],[.3,.12,.17],[-.26,.2,.15],[.1,-.3,.14],[-.2,-.24,.11]];
 buttons.forEach((b,i)=>{const s=new T3.SphereGeometry(b[2],9,5).scale(1,.45,1).translate(b[0],b[2]*.3,b[1]).toNonIndexed();
  const a=s.attributes.position.array,nn=s.attributes.normal.array;for(let k=0;k<a.length;k+=3){const ang=Math.atan2(a[k+2]-b[1],a[k]-b[0]),rib=.9+.1*Math.cos(ang*8);o.pos.push(a[k],a[k+1],a[k+2]);o.nor.push(nn[k],nn[k+1],nn[k+2]);o.uv.push(0,0);o.col.push(rib,rib,rib);}
  if(i<2){const f=new T3.CircleGeometry(b[2]*.3,6).rotateX(-Math.PI/2).translate(b[0],b[2]*.62,b[1]);vadd(o,f,[1.25,.8,.95]);}});
 return mk(o.pos,o.nor,o.uv,o.col);};
// a STONE-BLOOM: two fleshy half-stones with a cleft, a daisy standing out of it; unit across
G.stonebloom=function(){const o={pos:[],nor:[],uv:[],col:[]};
 [[-.17,0],[.17,0]].forEach(p=>{vadd(o,new T3.SphereGeometry(.2,7,5).scale(.8,.7,1).translate(p[0],.1,p[1]),[1,1,1]);});
 vadd(o,new T3.CylinderGeometry(.015,.015,.3,3,1,true).translate(0,.32,0),[.7,.75,.6]);
 return mk(o.pos,o.nor,o.uv,o.col);};
// a SNOW LOTUS: a woolly pale rosette of bracts with a cupped head; unit radius, origin at the base
G.snowlotus=function(){const M=Mesh();
 for(let k=0;k<16;k++){const t=k/16,a=k*GOLD,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,L=1-.5*t,W=.22*L,el=mix(.15,1.0,t);
  const b=[ca*.05,.02+.12*t,sa*.05],m=[ca*L*.55*Math.cos(el),b[1]+L*.55*Math.sin(el),sa*L*.55*Math.cos(el)],tp=[ca*L*Math.cos(el),b[1]+L*Math.sin(el),sa*L*Math.cos(el)];
  const cB=[.78,.8,.7],cT=[1.02,1.0,.94];M.tri(b,[m[0]+px*W,m[1],m[2]+pz*W],[m[0]-px*W,m[1],m[2]-pz*W],cB,cB,cB);M.tri([m[0]+px*W,m[1],m[2]+pz*W],tp,[m[0]-px*W,m[1],m[2]-pz*W],cB,cT,cB);}
 return M.out(true);};
// a BELL flower: a five-lobed bell hanging mouth down from y=0, flared; vertex-coloured coral to a pale throat; unit height
G.bell=function(){const M=Mesh(),n=10,prof=[[.05,0],[.12,-.3],[.17,-.6],[.24,-.85],[.3,-1.0]];
 const P=prof.map(q=>{const row=[];for(let s=0;s<=n;s++){const a=s/n*TAU,R=q[0]*(1+(q[1]<-.8?.18*Math.cos(a*5):0));row.push([Math.cos(a)*R,q[1],Math.sin(a)*R]);}return row;});
 for(let r=0;r<prof.length-1;r++)for(let s=0;s<n;s++){const a=P[r][s],b=P[r+1][s],c=P[r+1][s+1],d=P[r][s+1],c0=[1,1,1],c1=r>=2?[1.05,.92,.9]:[1,1,1];M.quad(a,b,c,d,c0,c1,c1,c0);}
 return M.out(false);};
// a STANDING STONE: a tall irregular monolith, origin at the base, 1 high
G.standing=function(){const g=new T3.IcosahedronGeometry(1,1).toNonIndexed(),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.12*Math.sin(x*4.1+y*3.3)+.08*Math.cos(z*5.7-y*2.2);p.setXYZ(i,x*.42*k*(1-.25*y),(y+1)*.5,z*.3*k*(1-.2*y));}
 g.computeVertexNormals();return g;};
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,7,1,true);};
OIDONG.G=G;
const LO={giantpad:1,giantcup:1};
OIDONG.it=(name,lv)=>lv===2||!LO[name]?name:name+'lo';

// ---------------------------------------------------------------- materials
OIDONG.MAT={
 bark:OIDONG.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(OIDONG.WOODTEX),
 heart:BIO.leafMat(TX.heart,'heart',{aN:true,irid:true,swayW:'1.0',swayA:.07}),
 blossom:BIO.leafMat(TX.blossom,'blossom',{aN:true,irid:true,swayW:'1.0',swayA:.06}),
 lace:BIO.leafMat(TX.lace,'lace',{aN:true,irid:true,swayW:'1.0',swayA:.08}),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.04}),
 maple:BIO.leafMat(TX.maple,'maple',{aN:true,swayW:'1.0',swayA:.07}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 broad:BIO.leafMat(TX.broad,'broad',{aN:true,irid:true,swayW:'1.0',swayA:.08}),
 bambooleaf:BIO.leafMat(TX.bambooleaf,'bambooleaf',{aN:true,swayW:'1.0',swayA:.1}),
 cushion:new T3.MeshLambertMaterial({map:OIDONG.CUSHIONTEX,vertexColors:true}),
 mossdome:new T3.MeshLambertMaterial({map:OIDONG.MOSSBALLTEX,vertexColors:true}),
 raceme:BIO.leafMat(TX.raceme,'raceme',{irid:true,swayW:'(-position.y)',swayA:.09,axis:1,alphaTest:.38}),
 beads:BIO.leafMat(TX.beads,'beads',{swayW:'(-position.y)',swayA:.08,axis:1,alphaTest:.4}),
 coin:BIO.leafMat(TX.coin,'coin',{swayW:'(-position.y)',swayA:.07,axis:1,alphaTest:.4}),
 thread:BIO.leafMat(TX.thread,'thread',{swayW:'(-position.y)',swayA:.02,axis:1,alphaTest:.3}),
 hang:BIO.leafMat(TX.under,'hang',{swayW:'(-position.y)',swayA:.05,axis:1}),
 lotus:BIO.leafMat(TX.lotus,'lotus',{irid:true,swayW:'1.0',swayA:.04,alphaTest:.4}),
 lily:BIO.leafMat(TX.lily,'lily',{irid:true,swayW:'1.0',swayA:.02,alphaTest:.4}),
 poppy:BIO.leafMat(TX.poppy,'poppy',{irid:true,swayW:'1.0',swayA:.06,alphaTest:.4}),
 daisy:BIO.leafMat(TX.daisy,'daisy',{swayW:'1.0',swayA:.03,alphaTest:.4}),
 petal:BIO.leafMat(TX.petal,'petal',{swayW:'0.0',swayA:0,alphaTest:.4}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.06}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 blade:BIO.leafMat(TX.blade,'blade',{swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'clubmoss',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 moss:BIO.leafMat(TX.moss,'moss',{aN:true,swayW:'0.0',swayA:0,alphaTest:.38}),
 mossmat:BIO.leafMat(TX.moss,'mossmat',{swayW:'0.0',swayA:0,alphaTest:.3}),
 under:BIO.leafMat(TX.under,'under',{swayW:'1.0',swayA:.05}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.03,alphaTest:0,vertexColors:true}),
 vhang:BIO.leafMat(null,'vhang',{swayW:'(-position.y)',swayA:.05,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'pad',{swayW:'1.0',swayA:.012,alphaTest:0,vertexColors:true}),
 capskin:new T3.MeshLambertMaterial({map:OIDONG.CAPTEX,vertexColors:true,side:T3.DoubleSide}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(OIDONG.ROCKTEX),
 // the owner's cards (2026-10-19): each stands in for a procedural card or a vertex-coloured model while the library pack has it
 cherrybloom:BIO.leafMat(TX.blossom,'cherrybloom',{aN:true,swayW:'1.0',swayA:.06}),
 mooncapcard:BIO.leafMat(TX.blank,'mooncapcard',{swayW:'(position.y)',swayA:.02,alphaTest:.4}),
 peyotecard:BIO.leafMat(TX.blank,'peyotecard',{swayW:'0.0',swayA:0,alphaTest:.4}),
 padcard:BIO.leafMat(TX.blank,'padcard',{swayW:'1.0',swayA:.012,alphaTest:.4,vertexColors:true}),
 beadscard:BIO.leafMat(TX.beads,'beadscard',{swayW:'(-position.y)',swayA:.07,axis:1,alphaTest:.4}),
};
const M=OIDONG.MAT;

// ---------------------------------------------------------------- the library (materials.json; core/materials/PLAN.md)
// With this kit's pack on the page (KMAT.pack('oidong'): the showcase), the library's maps replace the procedural canvases
// named below: the cherry's bark, the smooth pale bark, the whorled bark, the moss cards, the granite. The painters above
// still ran, so the random stream, and every plant's place and shape, are unchanged. A page without the pack (an open
// world) keeps the procedural ones; ?mat=proc shows them here.
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('oidong',n):null;
OIDONG.LIB={has:n=>!!LIBP(n)};
function libCard(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;
 t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;return t;}
{const use=(k,t,at)=>{if(t){M[k].map=t;M[k].alphaTest=at==null?.4:at;}};
 use('moss',libCard('leaf.moss'),.38);use('small',libCard('leaf.small'));}
// the cards named by their material's slot (BIO.libSwap: heart, lace, lily and the new cards); OIDONG.CARD says which the pack had
OIDONG.SWAP=BIO.libSwap('oidong',M);
OIDONG.CARD={};['heart','lace','lily','cherrybloom','mooncapcard','peyotecard','padcard','beadscard'].forEach(k=>OIDONG.CARD[k]=!!OIDONG.SWAP[k]);
// the barks: grey detail under the species' vertex colours (keep 0); the marble (3) is always its own painting.
// The bucket's uvScale becomes the set's tile size, and means() (55) divides out the pack's brightness instead of the canvas's
const LIBBARK=['bark.cherry','bark.smooth',null,'bark.marble','bark.whorled','bark.bamboo','bark.cedar'];
OIDONG.LIBMEAN={};
const libMap=(n,k)=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;OIDONG.LIBMEAN[k]=L.mean;return{t,scale:L.scale};};
['Cherry bark (banded)','Smooth pale bark','Ribbed stalks','Marble bark (painted)','Whorled bark','Bamboo canes','Fibrous bark'].forEach((lab,i)=>{
 const L=LIBBARK[i]&&libMap(LIBBARK[i],'bark'+i);if(L){M.bark[i].map=L.t;if(i===3)OIDONG.MARBLE=L;}
 BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:L?L.scale:[i===5?1.2:i===3?4:3,i===5?4:i===3?6:4]});});
{const L=libMap('stone.granite','rock');if(L)M.rock.map=L.t;}
// the chalice cap's veins and the moss balls' skin (the library's own): the cap tiles round its rim, the moss repeats over the ball
{const Lc=libMap('organic.cap','cap');if(Lc){Lc.t.wrapS=Lc.t.wrapT=T3.RepeatWrapping;M.capskin.map=Lc.t;}}
{const Lm=libMap('organic.mossball','mossball');if(Lm){Lm.t.wrapS=Lm.t.wrapT=T3.RepeatWrapping;Lm.t.repeat.set(3,3);M.mossdome.map=Lm.t;}}
BIO.bucket('wood',M.wood,{label:'Fallen wood'});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});
// the chalice cap: a lathe skinned in its veined canvas, vertex-coloured teal, the underside darker
BIO.bucket('capskin',M.capskin,{label:'Chalice caps',uvScale:[2,3]});
// the lotus trumpet's trumpets: iridescent, a pale green that goes gold at grazing angles (Xanadu's, paler)
BIO.bucket('barkT',BIO.iridBarkMat(OIDONG.BARKTEX[2],'oidong-trumpet',[1.0,1.06,0.96],[1.12,1.06,0.9]),{label:'Lotus trumpet (stems and trumpets)',uvScale:[3,5]});
// the marble birch's bole: a soft shimmer over the painted bands, pinker facing the eye, bluer at grazing angles
{const bm=BIO.iridBarkMat(OIDONG.BARKTEX[3],'oidong-marble',[1.0,0.98,0.97],[0.94,0.97,1.06]);if(OIDONG.MARBLE)bm.map=OIDONG.MARBLE.t;
 BIO.bucket('barkM',bm,{label:'Marble birch bole (iridescent)',uvScale:OIDONG.MARBLE?OIDONG.MARBLE.scale:[4,6]});}

// ---------------------------------------------------------------- instanced items
BIO.def('heart',BIO.geo.clump(),M.heart,{attrs:['aN','aC2'],label:'Sacred fig leaves'});
BIO.def('blossom',BIO.geo.clump(),M.blossom,{attrs:['aN','aC2'],label:'Blossom'});
BIO.def('cherrybloom',BIO.geo.clump(),M.cherrybloom,{attrs:['aN'],label:'Cherry blossom'});
BIO.def('lace',BIO.geo.clump(),M.lace,{attrs:['aN','aC2'],label:'Marble birch lace'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Needle pads'});
BIO.def('darkneedle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Cedar and pagoda-fir needles'});
BIO.def('gloss',BIO.geo.clump(),M.broad,{attrs:['aN','aC2'],label:'Camphor leaves'});
BIO.def('maple',BIO.geo.clump(),M.maple,{attrs:['aN'],label:'Maple leaves'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Small leaves'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN','aC2'],label:'Broad leaves'});
BIO.def('bambooleaf',BIO.geo.clump(),M.bambooleaf,{attrs:['aN'],label:'Bamboo leaves'});
BIO.def('cushion',G.cushion(),M.cushion,{label:'Cushion domes'});
BIO.def('boxdome',G.cushion(),M.cushion,{label:'Box domes'});
BIO.def('mossdome',G.cushion(),M.mossdome,{label:'Moss balls'});
BIO.def('raceme',BIO.geo.ribbon(3,.45,.08),M.raceme,{attrs:['aC2'],label:'Wisteria racemes'});
if(OIDONG.CARD.beadscard)BIO.def('beads',BIO.geo.hang(),M.beadscard,{label:'Bead strings (the willow\'s, a bell at the end)'});   // the card is the whole string: beads and bell
else BIO.def('beads',BIO.geo.ribbon(3,.7,.1),M.beads,{label:'Bead strings'});
BIO.def('coin',BIO.geo.ribbon(3,.8,.1),M.coin,{label:'Coin vines'});
BIO.def('thread',BIO.geo.ribbon(4,.5,.04),M.thread,{label:'Falling water'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Aerial roots'});
BIO.def('lotusbloom',BIO.geo.bloom(),M.lotus,{attrs:['aC2'],label:'Trumpet fringe blooms'});
BIO.def('lily',G.flat(),M.lily,{attrs:['aC2'],label:'Iridescent water lilies'});
BIO.def('poppy',BIO.geo.bloom(),M.poppy,{attrs:['aC2'],label:'Sky poppies'});
BIO.def('daisy',G.flat(),M.daisy,{label:'Daisies (stone-blooms, peyote crowns)'});
BIO.def('petal',G.flat(),M.petal,{label:'Fallen petals'});
BIO.def('fern',G.strip(4,.18,.32),M.frond,{label:'Fern fronds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('blade',G.tuft(),M.blade,{label:'Iris blades'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('sagebush',G.tuft(),M.clubmoss,{label:'Monk\'s sage'});
BIO.def('rimgrass',G.tuft(),M.grass,{label:'Cap-rim grass'});
BIO.def('moss',BIO.geo.clump(),M.moss,{attrs:['aN'],label:'Moss on the limbs'});
BIO.def('mossmat',BIO.geo.mat(),M.mossmat,{label:'Moss'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('ginseng',BIO.geo.clump(),M.under,{label:'Valley ginseng'});
BIO.def('teabush',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Mist tea'});
BIO.def('cup',G.cup(),M.vcol,{label:'Lotus flowers'});
BIO.def('giantcup',G.giantcup(),M.vsway,{label:'Giant lotus flowers'});
BIO.def('giantcuplo',G.cup(),M.vcol,{label:'Giant lotus flowers (mid distance)'});
BIO.def('lilypad',G.pad(),M.pad,{label:'Lotus pads'});
BIO.def('giantpad',G.giantpad(),OIDONG.CARD.padcard?M.padcard:M.pad,{label:'Giant lotus pads'});
BIO.def('giantpadlo',G.pad(),M.pad,{label:'Giant lotus pads (mid distance)'});
BIO.def('lotuspod',G.lotuspod(),M.vsway,{label:'Lotus seed heads'});
BIO.def('giantpod',G.giantpod(),M.vcol,{label:'Giant lotus seed heads'});
BIO.def('cap',G.cap(),M.capskin,{label:'Chalice caps'});
if(OIDONG.CARD.mooncapcard)BIO.def('mooncap',G.tuft(),M.mooncapcard,{label:'Moon caps'});
else BIO.def('mooncap',G.mooncap(),M.vcol,{label:'Moon caps'});
BIO.def('bracket',G.bracket(),M.vcol,{label:'Rainbow brackets'});
if(OIDONG.CARD.peyotecard)BIO.def('peyote',G.flat(),M.peyotecard,{label:'Peyote buttons'});
else BIO.def('peyote',G.peyote(),M.vcol,{label:'Peyote buttons'});
BIO.def('stonebloom',G.stonebloom(),M.vcol,{label:'Stone-blooms'});
BIO.def('snowlotus',G.snowlotus(),M.vcol,{label:'Snow lotus'});
BIO.def('bell',G.bell(),M.vhang,{label:'Coral bells'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub masses'});
BIO.def('cone',G.cone(),M.solid,{label:'Buds and cones'});
BIO.def('ball',G.ball(),M.solid,{label:'Fruit and berries'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems and stalks'});
BIO.def('standing',G.standing(),M.rock,{label:'Standing stones'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
})();
