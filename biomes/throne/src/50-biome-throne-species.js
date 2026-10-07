// ================================================================= THE THRONE — species (data + kit items)
// The volcano at the crater's centre (biomes/throne/NOTES.md). This first station is its south-east shoulder at the
// plume's edge: the shoulder's familiar life (Earth's descendants and Krator's standbys: ash pines, ruff trees,
// trumpet trees, star aloes, the spice tree) gives way, under the plume, to KRATOR'S OWN LIFE: fungiform, often
// glowing, living on the vents and the plume's acid drizzle as much as on the light (the owner, 2026-10-06: "an alien
// world down there except the hardiest of Earth life"). Everything here is DATA and kit definitions; no placement.
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `origin` (earth: Earth's
// descendants; krator: the crater's long-settled flora, the kits' standbys; native: Krator's own life, the plume's)
// and `plume` (where it lives: shoulder, seam, plume, vent).
BIO.kit('throne');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);THRONE.C=C;
THRONE.TAGS={climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both',koppen:['BSk','Csa','BSh','Csb']};
// the classes of the station, read off the scale model's rasters (NOTES.md: the S and SE transects at ~1.9 km)
THRONE.KOPPEN={BSk:.45,Csa:.3,BSh:.15,Csb:.1,Af:0,Cfa:0,Cfb:0,Aw:0,Dfc:0,ET:0};   // Af, Cfa, Cfb: the windward stations (the kipuka, the isle, the cloud forest: NOTES.md); their pages weight them

// ---------------------------------------------------------------- palettes
const PAL=THRONE.PAL={
 needle:[0x3e5e34,0x48683a,0x36542e,0x4e6e40],pineBark:[0x8a5a3e,0x7a4e36,0x966646],
 spiceLeaf:[0x2a5226,0x2e5a2a,0x34622e,0x264a22],spiceBark:[0x7a6a5a,0x6e5e50,0x86766a],resin:[0xb01818,0xc02a1a,0x981010],
 spiceFungus:[0x2a8a7a,0x34968a,0x24786a],spiceFungusRim:[0xe0702a,0xf08a3a],
 trumpet:[0xa8b468,0xb8bc70,0x98a85e,0xc0b870],trumpetBark:[0x6a5a48,0x5e5040,0x746450],
 frillLeaf:[0x4e6e34,0x5a7a3a,0x46642e],
 gillTrunk:[0xc8d4dc,0xbac8d2,0xd4dce2],gillCap:[0xe0702a,0xe88032,0xd86424,0xf09040],
 stilt:[0x9aa8a0,0xa8b4aa,0x8e9c94],stiltCap:[0xc8682a,0xd07430,0xb85a24,0xd88a3a],
 aloeTrunk:[0x8a8a90,0x7e7e86,0x96969a],star:[0xd84a2a,0xe0602a,0xc83a24,0xe87a3a],
 pagodaTrunk:[0x3a2a24,0x46342a,0x30241e],pagoda:[0xe0401a,0xe85a22,0xd0341a,0xf06a2a],
 pitcher:[0x6ac040,0x7ad04a,0x5ab038,0x88d858],pitcherStalk:[0x4a8a30,0x569638,0x3e7a28],
 bell:[0xe8e2d4,0xf0ece2,0xddd6c6],bellStreak:[0xc8a878,0xb89868],
 ropeA:[0x6a7a80,0x748490,0x5e6e74],ropeB:[0xd0702a,0xc0602a,0xe0803a],puff:[0x8e969e,0x9aa2aa,0x828a94,0xa4a8ac],
 lamp:[0x40d0ff,0x5a80ff,0x9a60ff,0x40ffd0],lampStem:[0x3aa860,0x48b870,0x2e9450],
 creeper:[0xa8d0a8,0xb4dab0,0x98c49c],creeperRoot:[0x7a7a74,0x8a8a82,0x6a6a66],
 plumebush:[0x8a1a1a,0xa0221e,0x7a1414,0xb02a22],
 soot:[0x1e2a20,0x243226,0x1a241c],sootRim:[0x5a8a50,0x6a9a5a,0x4e7e48],
 daisyStalk:[0xc02a40,0xd03a50,0xb02238],daisy:[0xf0b0b8,0xf4c4c8,0xe8a0b0],
 sulphurLeaf:[0x5a9a3a,0x68a844,0x4e8a32],sulphurRim:[0x7a1a2a,0x8a2232],
 gcCap:[0xe8735a,0xf08a6a,0xe06048,0xf09a70,0xe87e58],gcBark:[0x3a8a9a,0x5a2a24,0x4a9aa8,0x6a3428,0x2e7a88],cushion:[0x2a6a72,0x3a7a80,0x22585e,0x4a8a8a],
 brimBark:[0xcdbb86,0xd8c896,0xbfa874],brimCrust:[0xe8d040,0xf0dc58,0xdcc236],brimCup:[0xe07a20,0xd8601a,0xe89428],
 reedLow:[0x8a5a2a,0x7a4a22,0x9a6430],reedHigh:[0xc8c040,0xd4cc4c,0xb8b034],tassel:[0xf0dc50,0xe8d040,0xf4e468],
 acidPad:[0x8a3a1e,0x7a2e1a,0x9a4a22,0x6a2a1a],bladder:[0xd8e060,0xc8d848,0xe8d870],bladderStalk:[0x6a5a2a,0x5a4a22],
 coral:[0x2a7aa8,0x3488b4,0x22709a],anemone:[0xe040a0,0xf060b8,0xa0e040],
 brain:[0xd8c030,0xe0cc40,0xc8b028],brainStem:[0x2e4a26,0x365430],
 mat:[0xe02070,0xd0186a,0xf03080],cone:[0x40c060,0x50d070,0x38a850],
 bracket:[0x20a080,0x28b08c,0x1a9070],bracketGlow:[0xff9020,0xffa030],
 scale:[0xe890a8,0xf0a0b4,0xd87a96],
 lichen:[0xd88a3a,0xe0a048,0xc0c0a0,0x9aa090,0xe0b040,0xb8b088],grass:[0x7a9a44,0x86a44a,0x6e8e3c],straw:[0xc8b47a,0xb8a46a,0xd0bc84],
 fern:[0x4a7a34,0x568a3a,0x3e6e2c],broom:[0xf0d020,0xf8e030,0xe8c820],broomLeaf:[0x5a6a34,0x667a3a],moss:[0x6a8a3a,0x7a944a],
 lava:[0x1e1c1c,0x262322,0x2e2a28],cinder:[0x6a2a1e,0x7a3424,0x4a2a26,0x8a4a30],ash:[0x8a8682,0x9a9690,0x7a7672],sulphur:[0xe8d040,0xf0dc58],
 deadwood:[0xb8b0a4,0xa8a094,0x989084],
 // the windward station (kipuka): Earth's pioneers on young lava, the crater's palms, the great ruff, the frill tree, the siphon tree
 hfrillBark:[0x5e4c3e,0x544436,0x685446],hfrillLeaf:[0x3e6a2e,0x4a7634,0x365e28],
 siphon:[0x8a9a86,0x7e8e7a,0x96a690],siphonLip:[0x6a8a6a,0x5e7e5e],siphonFrond:[0x5a8a4a,0x6a9a52,0x4e7e40],
 lehuaBark:[0x8a8478,0x7e786c,0x96907e],lehuaLeaf:[0x6a7a5a,0x76866a,0x5e6e50],pompom:[0xd8202a,0xe8302a,0xc81828,0xf04a3a],
 treeFernTrunk:[0x4a3a2a,0x54422e,0x403224],treeFern:[0x4a7a2e,0x56883a,0x3e6a28],
 palmTrunk:[0x7a6a50,0x6e5e46,0x86765a],palm:[0x2e5a2e,0x3a6a36,0x264e28],
 glassfern:[0x14161c,0x1a1c24,0x101218],glassIrid:[0x3a5aa8,0x5a3ab0,0x2a7a8a],
 bromeliad:[0xc82a2a,0xd8402e,0xb82020],moss:[0x5a7a2e,0x6a8a36,0x4e6a28],
 // the frill tree (the Rift's, biomes/rift: a ribbed teal column finned all the way up)
 frillCol:[0x2e4a4a,0x263e42,0x385654],frillFin:[0x4a8a5a,0x3a7a60,0x5a9a5a],frillIrid:[0x8ad0ff,0xc8a0ff,0xa0e8d0],frillBud:[0x2e5a52,0x3a6a5a,0x284e48],
 // the geyser isle's shore (stations/isle): the palm frill tree's ringed trunk, the hyper-mangrove's grey bark and glossy leaves,
 // the shore palms' fronds, the kelp's stipes and the wrack on the sand
 palmfrillBark:[0x8a7a62,0x7e6e56,0x968670],mangroveBark:[0x6e6a62,0x625e56,0x7a766c],mangroveLeaf:[0x2e5a2a,0x3a6630,0x285024],
 palmFrond:[0x4a7a2e,0x5a8a36,0x3e6a28,0x6a8a3a],
 // the cloud forest's (stations/cloudforest): the elfin trees' bark under its moss and their small hard leaves; the veil tree's pale trunk
 elfinBark:[0x6a6450,0x5e5a48,0x746c58],elfinLeaf:[0x2e4a2a,0x3a5430,0x344a2c],elfinMoss:[0x5a7a2e,0x6a8a34,0x4e6a28,0x7a8a3a],veilBark:[0xd8d4c8,0xccc8bc,0xe4e0d4],veilLeaf:[0xe8a0b0,0xd88898],coconutTrunk:[0x6a6256,0x5e574c,0x766e62],
 coconut:[0x6a8a2e,0x7a9a34,0xa89a3a,0x8a6a34],coconutFallen:[0x7a5a34,0x6a4a2a,0x8a6a3e],kelpStipe:[0x5a4a22,0x6a5a2a],wrack:[0x3a3218,0x4a3e1e,0x2e2814],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 furrowed, 1 plates, 2 pale smooth,
// 3 scaly, 4 deadwood, 5 banded, 8 rope strands, 9 fungal flesh); far the impostor recipe (blobs [y of H, rx of crownR,
// ry of H, colour A, colour B, options]); alien: Krator's own life (drawn from the plume's palette).
const K=(c,a,r,kp,origin,plume)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,origin,plume});
THRONE.SPECIES=[
 /*0*/{key:'spice',name:'Spice tree',H:[8,15],rb:[.22,.4],crownR:[3.2,5.2],barkK:10,bark:PAL.spiceBark,leaf:PAL.spiceLeaf,
  far:{poleU:.4,blobs:[[.66,1.0,.32,'L0','L2']]},tags:K('temperate','semiarid','no',['BSk','Csa'],'earth','seam')},
 /*1*/{key:'trumpet',name:'Trumpet tree',H:[9,18],rb:[.25,.45],crownR:[3,5],barkK:0,bark:PAL.trumpetBark,leaf:PAL.trumpet,
  far:{poleU:.55,blobs:[[.8,.9,.2,'L0','L1']]},tags:K('temperate','subhumid','both',['Csa','Csb','BSk'],'krator','shoulder')},
 /*2*/{key:'ruff',name:'Ruff tree',alien:true,H:[5,10],rb:[.25,.45],crownR:[2.4,4.2],barkK:0,bark:[0x5a4a3c,0x4e4034,0x665446],leaf:PAL.frillLeaf,
  far:{poleU:.4,blobs:[[.66,.95,.3,'L0','L2']]},tags:K('tropic','semiarid','no',['BSk','BSh','Csa'],'krator','shoulder')},
 /*3*/{key:'gillparasol',name:'Gill-parasol',alien:true,H:[10,22],rb:[.3,.6],crownR:[4,7],barkK:2,bark:PAL.gillTrunk,leaf:PAL.gillCap,
  far:{poleU:.7,taper:.35,blobs:[[.85,1.0,.09,'L0','L2']]},tags:K('temperate','semiarid','no',['BSk','Csa','BSh'],'native','seam')},
 /*4*/{key:'stilt',name:'Stilt parasol',alien:true,H:[12,26],rb:[.12,.24],crownR:[2.6,5],barkK:2,bark:PAL.stilt,leaf:PAL.stiltCap,
  far:{poleU:.9,taper:.2,blobs:[[.97,.9,.04,'L0','L2']]},tags:K('temperate','subhumid','yes',['BSk','Csa'],'native','seam')},
 /*5*/{key:'staraloe',name:'Star aloe',H:[4,9],rb:[.2,.38],crownR:[2.2,4],barkK:3,bark:PAL.aloeTrunk,leaf:PAL.star,
  far:{poleU:.6,taper:.3,blobs:[[.82,.85,.16,'L0','L1']]},tags:K('temperate','arid','no',['BSk','BSh'],'krator','shoulder')},
 /*6*/{key:'pagoda',name:'Pagoda cap',alien:true,H:[8,20],rb:[.6,1.2],crownR:[3.5,7],barkK:8,bark:PAL.pagodaTrunk,leaf:PAL.pagoda,
  far:{poleU:.55,taper:.15,blobs:[[.62,1.0,.08,'L0','L2'],[.8,.78,.08,'L1','L2'],[.95,.5,.07,'L3','L2']]},tags:K('temperate','arid','no',['BSk','BSh'],'native','plume')},
 /*7*/{key:'drizzle',name:'Drizzle trumpet',alien:true,H:[5,13],rb:[.18,.32],crownR:[1.4,2.6],barkK:2,bark:PAL.pitcherStalk,leaf:PAL.pitcher,
  far:{poleU:.85,taper:.1,blobs:[[.9,.8,.12,'L0','L1']]},tags:K('temperate','semiarid','both',['BSk','Csa'],'native','plume')},
 /*8*/{key:'bonebell',name:'Bone bell',alien:true,H:[9,24],rb:[.6,1.1],crownR:[4,8],barkK:9,bark:PAL.bell,leaf:PAL.bell,
  far:{poleU:.6,taper:.0,blobs:[[.82,1.0,.17,'L0','L1']]},tags:K('temperate','subhumid','no',['BSk','Csa'],'native','vent')},
 /*9*/{key:'ropepuff',name:'Puffball rope-tree',alien:true,H:[6,14],rb:[.5,1.0],crownR:[2.8,5],barkK:8,bark:PAL.ropeA,leaf:PAL.puff,
  far:{poleU:.5,taper:.4,blobs:[[.78,.9,.25,'L0','L1']]},tags:K('temperate','semiarid','no',['BSk','Csb'],'native','plume')},
 /*10*/{key:'lampcap',name:'Lamp cap',alien:true,H:[1.6,4.5],rb:[.04,.08],crownR:[.6,1.4],barkK:9,bark:PAL.lampStem,leaf:PAL.lamp,
  far:null,tags:K('temperate','subhumid','both',['BSk','Csa'],'native','plume')},
 /*11*/{key:'ashpine',name:'Ash pine',H:[14,28],rb:[.3,.6],crownR:[3.5,6],barkK:1,bark:PAL.pineBark,leaf:PAL.needle,
  far:{poleU:.5,taper:.45,blobs:[[.62,.9,.3,'L0','L2'],[.85,.55,.14,'L1','L2']]},tags:K('temperate','semiarid','no',['BSk','Csa','Csb'],'earth','shoulder')},
 /*12*/{key:'greatruff',name:'Great ruff',alien:true,H:[100,165],rb:[4.2,6.5],crownR:[50,75],barkK:0,bark:PAL.hfrillBark,leaf:PAL.hfrillLeaf,
  far:{poleU:.6,taper:.6,blobs:[[.72,1.0,.22,'L0','L2'],[.9,.6,.1,0xe8782a,0xd8402a]]},tags:K('tropic','humid','both',['Af','Cfa'],'krator','windward')},
 /*13*/{key:'siphon',name:'Siphon tree',alien:true,H:[14,30],rb:[1.1,1.9],crownR:[3,5],barkK:9,bark:PAL.siphon,leaf:PAL.siphonFrond,
  far:{poleU:.95,taper:-.2,blobs:[[.98,.9,.08,'L0','L1']]},tags:K('tropic','humid','no',['Af','Cfa'],'native','windward')},
 /*14*/{key:'lehua',name:'Lehua',H:[6,20],rb:[.2,.45],crownR:[3,6],barkK:3,bark:PAL.lehuaBark,leaf:PAL.lehuaLeaf,
  far:{poleU:.45,blobs:[[.68,.95,.3,'L0','L2']]},tags:K('tropic','humid','no',['Af','Cfa'],'earth','windward')},
 /*15*/{key:'treefern',name:'Tree fern',H:[3,9],rb:[.15,.28],crownR:[2.5,4],barkK:8,bark:PAL.treeFernTrunk,leaf:PAL.treeFern,
  far:{poleU:.9,taper:.1,blobs:[[.95,.9,.12,'L0','L1']]},tags:K('tropic','humid','both',['Af','Cfa'],'earth','windward')},
 /*16*/{key:'archpalm',name:'Arch palm',H:[8,18],rb:[.2,.35],crownR:[2.5,4],barkK:3,bark:PAL.palmTrunk,leaf:PAL.palm,
  far:{poleU:.85,taper:.2,blobs:[[.9,.8,.12,'L0','L1']]},tags:K('tropic','humid','no',['Af','Cfa'],'krator','windward')},
 /*17*/{key:'frilltree',name:'Frill tree',alien:true,H:[70,125],rb:[3,5],crownR:[8,13],barkK:11,bark:PAL.frillCol,leaf:PAL.frillFin,ribs:12,
  far:{poleU:.9,taper:.55,blobs:[[.5,.9,.42,'L0','L1'],[.9,.7,.08,'L2','L1']]},tags:K('tropic','humid','both',['Af','Cfa'],'krator','windward')},
 // the geyser isle's (isle:true: only its page plants them; stations/isle, the owner 2026-10-06: "a palm frill tree with super wide upper frills", "some sort of
 // hyper-mangrove"; an island's trees are smaller)
 /*18*/{key:'palmfrill',name:'Palm frill tree',alien:true,isle:true,H:[12,26],rb:[.28,.5],crownR:[5,9],barkK:6,bark:PAL.palmfrillBark,leaf:PAL.frillFin,
  far:{poleU:.92,taper:.25,blobs:[[.94,.9,.16,'L0','L1']]},tags:K('tropic','humid','both',['Af'],'krator','windward')},
 /*19*/{key:'mangrove',name:'Hyper-mangrove',isle:true,H:[18,34],rb:[.8,1.4],crownR:[11,18],barkK:7,bark:PAL.mangroveBark,leaf:PAL.mangroveLeaf,
  far:{poleU:.5,taper:.15,blobs:[[.7,1.2,.32,'L0','L1'],[.88,.8,.16,'L1','L2']]},tags:K('tropic','humid','yes',['Af'],'earth','windward')},
 /*20*/{key:'coconut',name:'Coconut palm',isle:true,H:[12,24],rb:[.16,.26],crownR:[4,5.5],barkK:6,bark:PAL.coconutTrunk,leaf:PAL.palmFrond,
  far:{poleU:.95,taper:.2,blobs:[[.97,.75,.12,'L0','L1']]},tags:K('tropic','humid','both',['Af'],'earth','windward')},
 // the cloud forest's (cloud:true: only its page plants them; the owner 2026-10-06: "elfin forest in the mist"). The elfin
 // tree has no far impostor: in the cloud nothing is seen that far, and the ground's canopy layer stands in when it clears
 /*21*/{key:'elfin',name:'Elfin tree',cloud:true,H:[3,9],rb:[.16,.36],crownR:[2.4,4.4],barkK:3,bark:PAL.elfinBark,leaf:PAL.elfinLeaf,
  far:null,tags:K('temperate','humid','both',['Cfb'],'earth','windward')},
 /*22*/{key:'veil',name:'Veil tree',alien:true,cloud:true,H:[8,16],rb:[.18,.3],crownR:[4,7],barkK:7,bark:PAL.veilBark,leaf:PAL.veilLeaf,
  far:{poleU:.8,taper:.4,blobs:[[.75,.8,.25,'L0','L1']]},tags:K('temperate','humid','yes',['Cfb'],'native','windward')},
 // vent country's (stations/vents; 'vents': only a station with the 'sulph' field plants it)
 /*23*/{key:'brimstone',name:'Brimstone candelabra',alien:true,vents:true,H:[5,12],rb:[.32,.55],crownR:[2.4,4.4],barkK:9,bark:PAL.brimBark,leaf:PAL.brimCup,
  far:null,tags:K('temperate','humid','yes',['BSk'],'native','vent')},
 // the glacier's cold belt (stations/glacier; 'cold': only a station with the 'cbelt' field plants it)
 /*24*/{key:'gillcoral',name:'Gill-coral tree',cold:true,H:[7,18],rb:[.3,.55],crownR:[3,6],barkK:7,bark:PAL.gcBark,leaf:PAL.gcCap,
  far:{poleU:.7,taper:.4,blobs:[[.85,1.05,.3,'L0','L1']]},tags:K('temperate','subhumid','yes',['Dfc','ET'],'krator','shoulder')},
 /*25*/{key:'glasswillow',name:'Glass willow',alien:true,cold:true,H:[5,11],rb:[.16,.3],crownR:[3,5.5],barkK:7,bark:[0x4a4450,0x3e3a46,0x585260],leaf:[0xc8e4f4,0xd8eef8,0xb4d8ee],
  far:{poleU:.7,taper:.4,blobs:[[.7,.85,.25,'L0','L1']]},tags:K('temperate','subhumid','no',['Dfc','ET'],'native','shoulder')},
];
THRONE.byKey={};THRONE.SPECIES.forEach((S,i)=>{S.i=i;THRONE.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
THRONE.HARVEST={
 spice:HV('none',['bark (chewed: a stimulant)'],true,'THE SPICE (NOTES.md): symbiotic with a fungus that thrives only in limited and enigmatic conditions; where the fungus has got into a wound the tree bleeds a red resin that seals and regrows it. In people it closes wounds and knits bone in days; too much and the body heals too much. The Throne\'s vent country is its surest ground; the Spice Coast farther away is another.'),
 trumpet:HV('fuel',['funnel water'],false,'The funnels hold rain; the plume\'s drizzle makes it sour.'),
 ruff:HV('fuel',['roasted seed'],false,'Its collars of spiked fronds burst in the heat of a flow and throw their seed over the fresh lava.'),
 gillparasol:HV('none',['young caps (cooked)'],false,'Edible young, bitter old. The pale wood is light and rots fast.'),
 stilt:HV('poles',[],false,'The stalks make light poles and spear shafts.'),
 staraloe:HV('none',['nectar'],true,'The leaf gel dresses burns.'),
 pagoda:HV('none',[],false,'Inedible. The fibrous trunk makes rope that does not rot in acid.'),
 drizzle:HV('none',['the water (boiled)'],false,'The funnels catch the plume\'s acid drizzle and digest what falls in.'),
 bonebell:HV('none',[],true,'Grows only in vent steam. The natives cut its flesh for poultices; colonists call it poisonous.'),
 ropepuff:HV('fibre',[],false,'The spore clouds of a ripe puff make the eyes run for a day.'),
 lampcap:HV('none',[],false,'Glows at night. Carried as a lamp by the plume\'s people: it lasts a few days cut.'),
 greatruff:HV('timber',['roasted seed'],false,'The ruff tree grown to hypertree size, on the windward kipuka (the owner\'s, 2026-10-06: "an interesting effect... name that tree something else and keep it"). When a flow reaches the forest its collars burst in the heat and throw their seed over the fresh lava: the ruff trees on the young flows round a kipuka are its seedlings.'),
 siphon:HV('none',['the condensed water at its lip'],false,'Roots in a lava tube\'s skylight; its hollow trunk is a chimney, and the tube\'s warm wet air breathes out of its top as a plume of mist that its crown lives in.'),
 lehua:HV('timber (hard)',['nectar'],true,'Earth\'s pioneer of new lava (the ohia lehua\'s descendant): the first tree on a young flow, red with pompom flowers.'),
 treefern:HV('fibre (the trunk\'s mat)',['fiddleheads','starch (the core)'],false,''),
 frilltree:HV('timber (light)',['young fins (boiled)'],false,'The Rift\'s frill tree, a crater standby: a tapering ribbed column, a fin on every rib on every row, a splay of long fins and a pale bud at the top. On the Throne\'s windward kipuka its fins are fractal fronds.'),
 archpalm:HV('poles, thatch',['palm heart'],false,'Arches out over the red laterite slopes; its crowns hold red bromeliads. On the geyser isle it leans out over the beaches.'),
 palmfrill:HV('poles (light, ringed)',['the bud (bitter)'],false,'A palm\'s ringed trunk with the frill tree\'s fractal fins: a few short ones up the trunk, then a crown of very wide fins at the top, spread like a palm\'s. A Krator native of the geyser isles\' shores.'),
 coconut:HV('poles, thatch, coir (the husk\'s fibre)',['coconut (water and meat)','palm heart'],true,'Earth\'s coconut, on every shore of the Ring Sea. The nuts float: the isle\'s palms came on the current.','generic_fruit_coconut'),
 elfin:HV('fuel (wet: it smokes)',['bilberries in its moss'],false,'The cloud belt\'s gnarled dwarf: crooked stems a man\'s height or two, every limb cushioned in moss and hung with moss curtains, bromeliads in its forks, a flat crown shorn by the wind.'),
 veil:HV('none',[],true,'Krator\'s own, in the cloud: a pale slender tree whose arching limbs hang veils of fine pink filaments that comb the water out of the passing cloud and drip it to its roots. The veils glow faintly at night. Its sap stops nosebleeds (the natives say).'),
 glasswillow:HV('none',[],false,'Krator\'s own at the treeline over the glaciers: a dark slender tree whose limbs arch out and down, hung with long translucent strands that sheathe themselves in ice each night and ring like glass in the wind; by day they drip. The natives tie the strands into wind-chimes for the dead.'),
 gillcoral:HV('poles (light, hollow)',['the young caps (boiled, in famine)'],false,'A crater standby of the shoulders\' cold belt (the owner\'s reference): a few twisted stems streaked teal and dark red, each crowned with a broad salmon cap ridged like a plate coral on top, standing among the conifers in the snow. The caps freeze through each winter and thaw again; the old ones break off and lie bright on the snow.'),
 brimstone:HV('none',[],true,'Krator\'s own sulphur life, of the vents\' acid marshes: it lives on the vents\' gas, oxidising it to the sulphur that crusts it in yellow bands. It stands on stilt roots in the acid shallows and on the sulphur ground, its arms curving up like a candelabrum to fluted orange cups that breathe a little of the gas back out (and glow faintly at night). The natives scrape the crust as a salve for skin rot.'),
 mangrove:HV('timber (dense, rot-proof: piles and hulls)',['propagules (boiled)'],true,'A hypertree\'s mangrove: stands in the warm lagoon on arching prop roots taller than a man, drops roots from its limbs, a broad flat crown of glossy leaves. The bark tans hides and stops bleeding.'),
 ashpine:HV('timber',['pine nuts'],false,'Thick bark and epicormic buds: it stands through ash falls and the edges of flows.'),
};
THRONE.SPECIES.forEach(S=>{S.tags.harvest=THRONE.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
const PK=(name,c,a,r,kp,origin,plume,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,origin,plume),{harvest:hv||HV('none')}),items});
THRONE.PLANTS={
 lichen:PK('Lichen crust','temperate','arid','no',['BSk','Csa','BSh','Csb'],'earth','shoulder',['lichen'],HV('none',[],false,'Earth\'s hardiest: the first life on a fresh flow, everywhere on the mountain.')),
 grass:PK('Grasses','temperate','semiarid','no',['BSk','Csa'],'earth','shoulder',['grass','bunch'],HV('thatch',['seed'],false,'')),
 fern:PK('Lava fern','temperate','subhumid','both',['Csa','BSk'],'earth','shoulder',['fern'],HV('none',['fiddleheads'],false,'Roots in the cracks of a young flow.')),
 broom:PK('Ash broom','temperate','semiarid','no',['BSk','Csa'],'earth','shoulder',['small','plume'],HV('fuel',[],false,'')),
 creeper:PK('Ash creeper','temperate','arid','no',['BSk','BSh'],'native','plume',['rosette','rod','tendril0','tendril1','tendril2','tendril3','tendril4','tendril5','tendril6','tendril7','tendril8'],HV('none',[],false,'Rosettes that ride the ash on long grey runners; when the ash buries one, the runners send up another.')),
 plumebush:PK('Plume-bush','temperate','semiarid','no',['BSk'],'native','plume',['plumebush'],HV('none',[],false,'Dark red feathers that shed the ash.')),
 soot:PK('Soot cups','temperate','arid','no',['BSk','BSh'],'native','plume',['cup'],HV('none',[],false,'Black cups that drink the drizzle.')),
 daisy:PK('Stalk daisies','temperate','semiarid','no',['BSk'],'native','plume',['rod','bloom'],HV('none',[],false,'')),
 glowshroom:PK('Glow mushrooms','temperate','humid','both',['BSk','Csa'],'native','plume',['glowshroom0','glowshroom1','glowshroom2','glowshroom3','glowshroom4','glowshroom5','glowshroom6','glowshroom7','glowshroom8'],HV('none',[],false,'Blue clusters in the dark places: skylights, gullies, hollows. They light the plume\'s night.')),
 glowtuft:PK('Glow tufts','temperate','semiarid','no',['BSk'],'native','plume',['aflora0','aflora1','aflora2','aflora3','aflora4','aflora5','aflora6','aflora7','aflora8'],HV('none',[],false,'')),
 snare:PK('Snare flowers','temperate','semiarid','no',['BSk'],'native','plume',['carnivore0','carnivore1','carnivore2','carnivore3','carnivore4','carnivore5','carnivore6','carnivore7','carnivore8'],HV('none',[],true,'Carnivorous: they close on the insects the plume drives down. Their sap is part of the arrow poison (NOTES.md).')),
 plumefungi:PK('Plume fungi','temperate','semiarid','both',['BSk','Csa'],'native','plume',['specimen0','specimen1','specimen2','specimen3','specimen4','specimen5','specimen6','specimen7','specimen8','specimen9','specimen10','specimen11','specimen12','specimen13','specimen14','specimen15'],HV('none',['some caps (cooked; the natives know which)'],false,'')),
 drip:PK('Dripping fungi','temperate','humid','no',['BSk'],'native','plume',['drip0','drip1','drip2','drip3','drip4','drip5','drip6','drip7','drip8'],HV('none',[],false,'Hang under the caps and tiers of the plume\'s trees.')),
 shelf:PK('Lantern bracket','temperate','subhumid','both',['BSk','Csa'],'native','plume',['shelf0','shelf1','shelf2','shelf3','shelf4'],HV('none',[],false,'Glows orange where it is dark.')),
 lavaleaf:PK('Lava-leaf','temperate','semiarid','no',['BSk','Csa'],'krator','seam',['lavaleaf'],HV('none',[],false,'Black leaves veined red: a shrub of the seam.')),
 ashshrub:PK('Withered ash shrub','temperate','arid','no',['BSk'],'earth','seam',['distressed'],HV('fuel',[],false,'Earth\'s shrubs where the plume\'s acid reaches: alive, but barely.')),
 succulent:PK('Spotted succulent','temperate','arid','no',['BSk','Csa'],'krator','shoulder',['succulent0','succulent1','succulent2'],HV('none',['leaves (sour)'],false,'Covers the shoulder\'s young flows.')),
 embersucc:PK('Ember succulents','temperate','arid','no',['BSk','BSh'],'native','plume',['moltensucc0','moltensucc1','moltensucc2','moltensucc3','moltensucc4','moltensucc5','moltensucc6','moltensucc7','moltensucc8'],HV('none',[],false,'Dark succulents whose tips glow like coals: the first on cinder and young lava.')),
 snaremoss:PK('Snare moss','temperate','subhumid','no',['BSk','Csa'],'native','seam',['moss0','moss1','moss2','moss3','moss4','moss5','moss6','moss7','moss8'],HV('none',[],false,'Hangs from the parasols\' caps, its pitchers and sundews fed by the insects of the seam.')),
 trumpetfungi:PK('Trumpet fungi','temperate','semiarid','both',['BSk','Csa'],'native','plume',['trumpets0','trumpets1','trumpets2','trumpets3','trumpets4','trumpets5','trumpets6','trumpets7','trumpets8'],HV('none',[],false,'Clusters of trumpet-capped stalks from one knotted base.')),
 snareplant:PK('Snare plants','temperate','subhumid','both',['BSk','Csa'],'native','plume',['carnplant0','carnplant1','carnplant2','carnplant3','carnplant4','carnplant5','carnplant6','carnplant7','carnplant8'],HV('none',[],true,'Pitchers, sticky discs and toothed traps: the plume drives the insects down to them. Part of the arrow poison (NOTES.md).')),
 ventgrowth:PK('Vent growths','temperate','humid','yes',['BSk'],'native','vent',['coralcard0','coralcard1','coralcard2','coralcard3','coralcard4','coralcard5','coralcard6','coralcard7','coralcard8'],HV('none',[],false,'Crusts, tubes, glassy bulbs and ruffles round the vents and the hot pools: they live on the steam\'s chemistry, not the light.')),
 plumemush:PK('Plume mushrooms','temperate','semiarid','both',['BSk','Csa'],'native','plume',['mushalien0','mushalien1','mushalien2','mushalien3','mushalien4','mushalien5','mushalien6','mushalien7','mushalien8'],HV('none',['a few (the natives know which)'],false,'')),
 angeltrumpet:PK('Angel trumpet','tropic','humid','no',['Af','Cfa'],'earth','windward',['angel0','angel1','angel2','small'],HV('none',[],true,'Earth\'s brugmansia gone feral at the forest\'s edge, tended there by the natives: the leaves and the hanging trumpets are a poison. One of the arrow poisons (NOTES.md).')),
 spiderlily:PK('Spider lily','tropic','humid','no',['Af','Cfa'],'earth','windward',['spiderlily0','spiderlily1','spiderlily2','rod'],HV('none',[],true,'Red lilies along the trails and round the stumps of the cleared forest. The bulb is poison.')),
 glassfern:PK('Glassfern','tropic','humid','no',['Af','Cfa'],'native','windward',['glassfern'],HV('none',[],false,'Black glassy fronds that drink the young lava\'s heat: the first life on a windward flow.')),
 bromeliad:PK('Red bromeliads','tropic','humid','both',['Af','Cfa'],'krator','windward',['bromeliad'],HV('none',['the water in its cup'],false,'')),
 mossclump:PK('Moss','tropic','humid','both',['Af','Cfa'],'earth','windward',['mossclump'],HV('none',[],false,'')),
 sulphurrosette:PK('Sulphur rosette','temperate','humid','yes',['BSk','Csa'],'native','vent',['rosette','rod'],HV('none',[],true,'Grows in acid water. A source of the arrow poison (NOTES.md).')),
 ventcoral:PK('Vent coral','temperate','humid','yes',['BSk'],'native','vent',['column','plumebush'],HV('none',[],false,'Blue lumps round the hot pools, crowned with anemone tufts.')),
 braincap:PK('Brain cap','temperate','humid','yes',['BSk'],'native','vent',['brain','rod'],HV('none',[],false,'')),
 mat:PK('The mat','temperate','arid','both',['BSk','BSh'],'native','plume',['mat','ventcone'],HV('none',[],false,'A slime mould. It takes over a hollow in a night and digests what sleeps on it (NOTES.md).')),
 bracket:PK('Lantern bracket','temperate','subhumid','both',['BSk','Csa'],'native','plume',['bracket'],HV('none',[],false,'Glows orange where it is dark: tube mouths, flow fronts, crater walls.')),
 kelp:PK('Kelp','tropic','humid','yes',['Af'],'earth','windward',['kelp0','kelp1','kelp2'],HV('none',['fronds (dried)'],false,'Brown kelp in the isle\'s shallows, 3-15 m down, its fronds lying on the surface.')),
 wrack:PK('Wrack (cast kelp)','tropic','humid','yes',['Af'],'earth','windward',['wrack0','wrack1','wrack2','wrack3','wrack4','wrack5','wrack6','wrack7','wrack8'],HV('none',[],false,'Seaweed torn loose and thrown up along the high-water line.')),
 seaweed:PK('Seaweed','tropic','humid','yes',['Af'],'earth','windward',['seaweed0','seaweed1','seaweed2','seaweed3','seaweed4','seaweed5','seaweed6','seaweed7','seaweed8'],HV('none',['sea lettuce, dulse (eaten)'],false,'Kelp, wrack, dulse, feather weed and sea lettuce on the isle\'s shallow rocks and sand, from the tide line to 3 m down.')),
 ferngreen:PK('Cloud ferns','temperate','humid','both',['Cfb'],'earth','windward',['ferngreen0','ferngreen1','ferngreen2','ferngreen3','ferngreen4','ferngreen5','ferngreen6','ferngreen7','ferngreen8'],HV('none',['fiddleheads'],false,'')),
 mosshang:PK('Moss curtains','temperate','humid','both',['Cfb'],'earth','windward',['mosshang0','mosshang1','mosshang2','mosshang3','mosshang4','mosshang5'],HV('none',[],false,'Moss, lichen and filmy ferns hung in curtains from every limb in the cloud.')),
 tallgrass:PK('Tall grass','tropic','semiarid','no',['Aw','BSh'],'earth','shoulder',['grassdry0','grassdry1','grassdry2','grassdry3','grassdry4','grassdry5','grassdry6','grassdry7','grassdry8','bunch'],HV('none',['seed (ground, in famine)'],false,'Man-high tussocks gone gold in the dry season, burnt every few years and green again in weeks.')),
 fireflowers:PK('Fire flowers','tropic','semiarid','no',['Aw','BSh'],'earth','shoulder',['flowerspike0','flowerspike1','flowerspike2','flowerspike3','flowerspike4','flowerspike5','flowerspike6','flowerspike7','flowerspike8'],HV('none',[],true,'Spikes of pale flowers that come up through the ash a fortnight after a fire.')),
 brimreed:PK('Brimstone reeds','temperate','humid','yes',['BSk'],'native','vent',['rod','tassel'],HV('fibre',[],false,'Krator\'s own: stands of hollow stems a man high and more in the acid shallows and round the vents, banded rust below and sulphur-yellow above, each topped by a tassel of crusted sulphur. They live on the gas bubbling up round their roots.')),
 acidpad:PK('Acid pads','temperate','humid','yes',['BSk'],'native','vent',['acidpad','bladder'],HV('none',[],false,'Krator\'s own: leathery rust-red pads floating on the sulphur marsh\'s acid water, their rims crusted yellow; some carry a gas bladder that keeps them afloat.')),
 gasbladder:PK('Gas bladders','temperate','humid','yes',['BSk'],'native','vent',['bladder','rod'],HV('none',[],true,'Krator\'s own: clusters of translucent yellow bladders on short stalks round the vents, swollen with the gas they live on; they glow faintly at night. Burst one and the stink of rotten eggs carries a hundred metres. The natives use the gas to drive vermin from their stores.')),
 cushion:PK('Teal cushions','temperate','subhumid','no',['Dfc','ET'],'krator','shoulder',['cushion'],HV('none',[],false,'Dense blue-green cushions in the snow of the cold belt, round the gill-coral trees\' feet.')),
 gcfallen:PK('Fallen gill-coral caps','temperate','subhumid','no',['Dfc','ET'],'krator','shoulder',['gcoral'],HV('none',[],false,'Old caps broken off by the frost, bright salmon on the snow.')),
 scalecone:PK('Scale cone','temperate','humid','yes',['Csa','BSk'],'native','seam',['scalecone'],HV('none',[],false,'Pink scaled fingers in the gullies.')),
};
THRONE.plantOfItem=item=>{for(const k in THRONE.PLANTS)if(THRONE.PLANTS[k].items.indexOf(item)>=0)return THRONE.PLANTS[k];return null;};

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(510047);
const TX={};
const G2=BIO.tex.grey;
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.09,.62),lum=lerp(105,232,i/70)+rr(-18,18),n=ri(14,22),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU*.8+rr(-.12,.12),L=rr(40,70);g.strokeStyle=G2(lum*rr(.85,1.08));g.lineWidth=rr(1.4,2.4);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[120,120,120]);
/* glossy leaves in dense clusters (the spice tree: clove-like) */
TX.glossy=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.62);
 for(let i=0;i<150;i++){const c=BIO.tex.clPt(S,.11,.88),lum=lerp(100,235,i/150);
  for(let k=0;k<3;k++)BIO.tex.leaf(g,c[0],c[1],rr(30,48),rr(9,13),rr(0,TAU),lum+rr(-20,15),true);
  if(rng()<.3){g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(c[0]+rr(-6,6),c[1]+rr(-6,6),rr(3,7),rr(1.5,3),rr(0,TAU),0,TAU);g.fill();}}},[140,140,140]);
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<440;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/440)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,9),rr(2,3.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* feathers: the plume-bush's dark red plumes, and the anemone tufts of the vent coral (radiating curved spikes) */
TX.feather=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<9;k++){const x0=S/2+rr(-40,40),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.55,.95);let px=x0,py=S;
  for(let t=0;t<1;t+=.04){const x=x0+Math.cos(a)*L*t+Math.sin(t*5+k)*6,y=S+Math.sin(a)*L*t,w=18*(1-t*.6)*Math.sin(Math.PI*Math.min(1,t*1.4+.1));
   g.strokeStyle=G2(lerp(110,240,rng()));g.lineWidth=rr(1.5,3);
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(x,y);g.lineTo(x+sd*w*rr(.6,1),y-rr(4,14));g.stroke();}px=x;py=y;}}},[150,150,150]);
/* FUZZ: fine hairs radiating from just inside a circle out past it, and a few spore dots (the rope-tree's puffs) */
TX.fuzz=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const c=S/2;
 for(let i=0;i<900;i++){const a=rr(0,TAU),r0=S*rr(.33,.4),L=S*rr(.03,.12)*(rng()<.1?1.8:1),bend=rr(-.25,.25);g.strokeStyle=G2(lerp(170,250,rng()));g.lineWidth=rr(.6,1.4);
  g.beginPath();g.moveTo(c+Math.cos(a)*r0,c+Math.sin(a)*r0);g.lineTo(c+Math.cos(a+bend*L/S)*(r0+L),c+Math.sin(a+bend*L/S)*(r0+L));g.stroke();}
 for(let i=0;i<120;i++){const a=rr(0,TAU),r=S*rr(.36,.48);g.fillStyle=G2(lerp(180,250,rng()));g.beginPath();g.arc(c+Math.cos(a)*r,c+Math.sin(a)*r,rr(.8,1.8),0,TAU);g.fill();}},[220,220,220]);
TX.flame=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,6,.5);
 for(let i=0;i<34;i++){const p=BIO.tex.clPt(S,.08,.5),lum=lerp(140,250,i/34),n=ri(22,34),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),L=rr(50,95);g.strokeStyle=G2(lum*rr(.8,1.05));g.lineWidth=rr(2.5,4.5);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a+.25)*L*.55,p[1]+Math.sin(a+.25)*L*.55,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[200,200,200]);
TX.plume=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<340;i++){const t=rng(),y=S*(.06+.9*t),w=S*.42*Math.sin(Math.PI*Math.pow(t,.7))*(1-.35*t),x=S/2+(rng()-.5)*2*w;
 g.fillStyle=G2(lerp(140,250,rng()));g.beginPath();g.arc(x,y,rr(3,6),0,TAU);g.fill();}},[200,200,200]);
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<14;p++){const a=p/14*TAU;g.fillStyle=G2(lerp(185,245,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.24,cy+Math.sin(a)*S*.24,S*.2,S*.06,a,0,TAU);g.fill();}
 g.fillStyle=G2(150);g.beginPath();g.arc(cx,cy,S*.1,0,TAU);g.fill();},[210,210,210]);
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<60;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.45,.95),lum=lerp(110,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.6,3);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.15,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.bunch=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<46;k++){const x0=S/2+rr(-18,18),a=-Math.PI/2+rr(-.6,.6),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.3,2.4);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.85);g.beginPath();g.ellipse(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L,2.5,10,a+Math.PI/2,0,TAU);g.fill();}}},[160,160,160]);
// a palm's pinnate frond: a midrib along the card, long leaflets swept back and drooping either side (one frond a card)
TX.palm=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const y0=S/2;g.strokeStyle=G2(110);g.lineWidth=3;g.beginPath();g.moveTo(2,y0);g.lineTo(S-2,y0);g.stroke();
 for(let x=6;x<S-4;x+=3.2){const t=x/S,L=S*(.08+.4*Math.sin(Math.min(1,t*1.15)*Math.PI*.92)),lum=lerp(150,235,rng());
  for(let sd=-1;sd<=1;sd+=2){if(rng()<.06)continue;g.strokeStyle=G2(lum);g.lineWidth=rr(1.4,2.4);g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+L*.25,y0+sd*L*.55,x+L*.55,y0+sd*L*.95);g.stroke();}}},[160,160,160]);
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-6;x+=6){const t=x/S,L=Math.sin(Math.min(1,t*1.4)*Math.PI*.9)*30+4;for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(120,235,rng()));g.lineWidth=3.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
TX.litter=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<700;i++){const p=BIO.tex.discPt(S,.94),a=rr(0,TAU),L=rr(6,16);
 g.strokeStyle=G2(lerp(90,210,rng()));g.lineWidth=rr(1,2);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[130,130,130]);
/* THE MAT (ref 7): dark tiles parted by bright veins; the instance colour tints the veins, the tiles stay dark */
TX.mat=(function(){const S=256,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.clearRect(0,0,S,S);
 const id=g.createImageData(S,S),d=id.data;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const i=(y*S+x)*4,r=Math.hypot(x-S/2,y-S/2)/(S/2);if(r>.97)continue;
  const v=fbm(x/18,y/18,7.7,3),w=1-Math.abs(v*2-1),vein=smooth(.86,.95,w),edge=smooth(.97,.8,r)*smooth(.98,.6,r+(fbm(x/9,y/9,3.1,2)-.5)*.5);
  const l=vein?lerp(60,250,vein):60+40*fbm(x/4,y/4,5.5,2);d[i]=d[i+1]=d[i+2]=l;d[i+3]=255*smooth(.25,.5,edge);}
 g.putImageData(id,0,0);const t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;t.anisotropy=4;return t;})();
/* a GLOW disc: radial veins bright toward the rim (the lamp caps, ref 20) */
TX.lampTex=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,dx=x/w-.5,dy=y/h-.5,r=Math.hypot(dx,dy)*2,a=Math.atan2(dy,dx);
  const vein=Math.pow(.5+.5*Math.cos(a*22+3*fbm(r*3,a,8.8,2)),6),v=clamp(.35+.5*r+.45*vein*(1-r*.4),0,1)*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
 g.putImageData(id,0,0);});
THRONE.TEX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders: 0 furrowed, 1 plates, 2 pale smooth, 3 scaly,
// 4 deadwood (the crater drylands' painters), 8 rope strands (the pagoda cap, the rope-tree), 9 fungal flesh (pores).
THRONE.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){for(let i=0;i<240;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'165,165,165')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===1){g.fillStyle='#3a3a3a';g.fillRect(0,0,w,h);
  for(let x=-10;x<w;x+=rr(22,34)){let y=-rr(0,40);while(y<h){const pw=rr(16,30),ph=rr(30,70),j=()=>rr(-4,4),l=rng()<.5?175:150;
   g.fillStyle='rgb('+l+','+l+','+l+')';g.beginPath();g.moveTo(x+j(),y+j());g.lineTo(x+pw*.5,y-rr(2,8));g.lineTo(x+pw+j(),y+j());g.lineTo(x+pw+j(),y+ph+j());g.lineTo(x+pw*.5,y+ph+rr(2,8));g.lineTo(x+j(),y+ph+j());g.closePath();g.fill();
   y+=ph+rr(3,7);}}}
 else if(kind===2){g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(40,40,40,'+(.25+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(5,16),rr(1.5,4),0,0,TAU);g.fill();}}
 else if(kind===3){for(let i=0;i<900;i++){const x=rng()*w,y=rng()*h,r=rr(4,9);g.fillStyle='rgba('+(rng()<.5?'60,60,60':'150,150,150')+','+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*.6,0,0,TAU);g.fill();}}
 else if(kind===4){g.fillStyle='#b4b4b4';g.fillRect(0,0,w,h);
  for(let i=0;i<300;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'90,90,90':'220,220,220')+','+(.25+rng()*.4).toFixed(2)+')';g.lineWidth=rr(1,3);
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-30,30),h*.33,x+rr(-30,30),h*.66,x+rr(-20,20),h+10);g.stroke();}}
 else if(kind===8){for(let x=0;x<w;x+=rr(5,10)){const l=rr(90,220);g.strokeStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.lineWidth=rr(4,9);
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-20,20),h*.33,x+rr(-20,20),h*.66,x,h+10);g.stroke();}}
 else{g.fillStyle='#d0d0d0';g.fillRect(0,0,w,h);
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(rng()<.7?'110,110,110':'240,240,240')+',.35)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,3.2),0,TAU);g.fill();}
  for(let k=0;k<30;k++){const x=rng()*w;g.strokeStyle='rgba(120,120,120,.25)';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,0);g.lineTo(x+rr(-10,10),h);g.stroke();}}
});};
THRONE.BARKTEX=[0,1,2,3,4,5,6,7,8,9,2,0].map(k=>THRONE.barkTex(k));   // 10: the spice tree's (pale smooth), 11: the frill tree's column (furrowed), procedurally
THRONE.WOODTEX=THRONE.BARKTEX[4];
// basalt: a dark fine grain with vesicles (the boulders, the spatter, the stones)
THRONE.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=h3(x,y,47),v=(150+(fbm(x/22,y/22,4.7,3)-.5)*46+(s<.07?-60:s>.95?18:0)+(fbm(x/3,y/3,9.4,1)-.5)*22);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// A LATHE: a surface of revolution from a profile [[y, r, colour]] (colour a grey multiplier or [r,g,b]), unit-sized,
// vertex-coloured. o: ribN/ribA ribs in the radius; wavN/wavA a wave in y growing toward the last ring (a frilled or
// folded rim); gillN/gillA stripes in the colour by angle (gills); checker a light/dark checker (scales); jit a
// random radius jitter; arc a part of the circle (a bracket); flip the normals. Almost every alien shape is one.
G.lathe=function(prof,seg,o){o=o||{};const pos=[],nor=[],uv=[],col=[],n=prof.length,arc=o.arc||1,P=[],CC=[];
 for(let i=0;i<n;i++){const y=prof[i][0],r=prof[i][1],c=prof[i][2],t=n>1?i/(n-1):0,row=[],crow=[];
  for(let s=0;s<=seg;s++){const a=(o.a0||0)+s/seg*TAU*arc,sw=s%seg;
   const rad=r*(1+(o.ribA||0)*Math.cos(a*(o.ribN||0)))*(1+(o.jit||0)*(h3(i,arc<1?s:sw,o.seed||5)-.5)*2);
   const yy=y+(o.wavA||0)*Math.sin(a*(o.wavN||0)+(o.wavP||0))*Math.pow(t,o.wavE==null?2:o.wavE)+(o.bumpA||0)*(h3(i*3.1,sw,o.seed||7)-.5)*r;
   row.push([Math.cos(a)*rad,yy,Math.sin(a)*rad]);
   const k=typeof c==='number'?[c,c,c]:c;let m=1;if(o.gillA)m*=1-o.gillA*(.5+.5*Math.cos(a*o.gillN));if(o.checker)m*=((sw+i)%2)?1.12:.74;
   crow.push([k[0]*m,k[1]*m,k[2]*m]);}
  P.push(row);CC.push(crow);}
 const nrm=(i,s)=>{const a=P[i][Math.min(seg,s+1)],b=P[i][Math.max(0,s-1)],u=P[Math.min(n-1,i+1)][s],d=P[Math.max(0,i-1)][s];
  const px=u[0]-d[0],py=u[1]-d[1],pz=u[2]-d[2],ax=a[0]-b[0],ay=a[1]-b[1],az=a[2]-b[2];
  let x=py*az-pz*ay,y=pz*ax-px*az,z=px*ay-py*ax;const l=Math.hypot(x,y,z),f=o.flip?-1:1;
  // at a pole every vertex of the ring is the same point and the cross product vanishes: take the next ring's normal
  // (a zero normal turns to NaN in the foliage shader's normalize, and the triangle renders black)
  if(l<1e-9)return i>0&&i===n-1?nrm(i-1,s):i<n-1?nrm(i+1,s):[0,f,0];
  return[f*x/l,f*y/l,f*z/l];};
 // planar: uv from above (a cap's radial texture centred on it); otherwise round the lathe and along it
 const pv=(i,s)=>{const p=P[i][s],q=nrm(i,s),c=CC[i][s];pos.push(p[0],p[1],p[2]);nor.push(q[0],q[1],q[2]);if(o.planar)uv.push(p[0]*.5+.5,p[2]*.5+.5);else uv.push(s/seg,n>1?i/(n-1):0);col.push(c[0],c[1],c[2]);};
 for(let i=0;i<n-1;i++)for(let s=0;s<seg;s++){pv(i,s);pv(i+1,s+1);pv(i+1,s);pv(i,s);pv(i,s+1);pv(i+1,s+1);}
 return BIO.geo._make(pos,nor,uv,col);};
const L=G.lathe;
// a GILLED DISC (the gill-parasol's and the stilt parasol's caps, ref 10, 11): a low dome over flat radial gills; unit
// radius, origin at the stalk's top; the instance colour is the cap's, the gills a darker band of it
G.disc=()=>L([[-.02,.06,.55],[-.06,.5,[.75,.62,.55]],[-.04,.92,[.9,.8,.7]],[0,1.0,1.0],[.07,.86,1.05],[.13,.55,1.12],[.16,.0,1.15]],28,{gillN:40,gillA:.0,wavN:7,wavA:.025,planar:true});
G.gills=()=>L([[-.05,.07,.45],[-.055,.55,.62],[-.03,.97,.8]],56,{gillN:56,gillA:.55});
// a BELL (the bone bell, ref 1): a tall dome, a little waisted at the rim, a hollow underside; unit radius and height
G.bell=()=>L([[.0,.82,.72],[.04,1.0,.9],[.25,.98,1.0],[.55,.86,1.04],[.8,.6,1.08],[.95,.3,1.1],[1.0,0,1.12]],24,{wavN:5,wavA:.03,wavE:0,bumpA:.03,planar:true});
// a FUNNEL with a frilled rim: the trumpet tree's (ref: the Rift), the drizzle trumpet's pitcher (ref 19), the soot cup
G.funnel=()=>L([[0,.05,.45],[.3,.12,.6],[.6,.26,.8],[.82,.5,.95],[.94,.8,1.05],[1.0,1.0,1.1]],22,{ribN:11,ribA:.06,wavN:9,wavA:.08,wavE:3});
G.pitcher=()=>L([[0,.08,.6],[.35,.14,.7],[.7,.3,.85],[.88,.62,1.0],[.97,.95,1.12],[1.0,1.05,1.2]],22,{ribN:14,ribA:.05,wavN:5,wavA:.12,wavE:4,gillN:30,gillA:.25});
G.cup=()=>L([[0,.12,.35],[.45,.2,.5],[.8,.4,.75],[.95,.62,1.3],[1.0,.66,1.5]],12,{wavN:4,wavA:.04,wavE:4});
// a TIER of the pagoda cap (ref 12): a flattened lumpy dome, dark fibrous underneath
G.tier=()=>L([[-.12,.1,.35],[-.1,.6,.45],[-.02,.98,.75],[.05,1.0,1.0],[.16,.86,1.08],[.24,.55,1.12],[.27,0,1.15]],24,{wavN:11,wavA:.03,wavE:0,bumpA:.06,jit:.04,planar:true});
// a PUFF (the rope-tree's spore balls, ref 9): a lumpy sphere
// a PUFF (the rope-tree's spore balls, ref 9): a lumpy sphere, evenly coloured (a lathe's poles shaded light and dark
// read as an iris turned at random: the owner saw eyeballs), its normals the sphere's so it shades soft; the FUZZ (below)
// gives it a soft edge
G.puff=function(){const g=new T3.IcosahedronGeometry(1,2),p=g.attributes.position,nor=[],col=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),l=Math.hypot(x,y,z)||1,nx=x/l,ny=y/l,nz=z/l;
  const k=1+.07*(vnoise(nx*3.1+7,ny*3.1,nz*3.1)-.5)*2+.03*(vnoise(nx*9,ny*9+3,nz*9)-.5)*2;p.setXYZ(i,nx*k,ny*k,nz*k);nor.push(nx,ny,nz);
  const c=.88+.2*vnoise(nx*5+1,ny*5,nz*5-2);col.push(c,c,c*1.02);}
 g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));return g;};
// the HAIR of a near puff: fine strands rooted all over the sphere (a golden spiral of roots), each a thin curved
// spike, pale at its tip; double-sided, so it reads from every side
G.hair=function(){const pos=[],nor=[],uv=[],col=[],N=130,push=(p,n,c)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(c,c,c*1.02);};
 for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996,n=[Math.cos(a)*r,y,Math.sin(a)*r];
  const t=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],u=[n[1]*t[2]-n[2]*t[1],n[2]*t[0]-n[0]*t[2],n[0]*t[1]-n[1]*t[0]],ul=Math.hypot(...u),w=.034;
  const L=1.18+.32*h3(i,3,7),bend=(h3(i,5,9)-.5)*.25,b0=n.map((v,k)=>v*.96+u[k]/ul*w),b1=n.map((v,k)=>v*.96-u[k]/ul*w),tip=n.map((v,k)=>v*L+u[k]/ul*bend);
  push(b0,n,.82);push(b1,n,.82);push(tip,n,1.18);}
 return BIO.geo._make(pos,nor,uv,col);};
// the FUZZ round a puff: three crossed cards through its centre, a ring of fine radiating hairs beyond the sphere's edge
G.fuzz=function(){const pos=[],uv=[],nor=[];[[1,0,0],[0,1,0],[0,0,1],[.707,.707,0],[0,.707,.707],[.707,0,-.707]].forEach((n,k)=>{
  const a=Math.abs(n[1])<.9?[0,1,0]:[1,0,0],b=[n[1]*a[2]-n[2]*a[1],n[2]*a[0]-n[0]*a[2],n[0]*a[1]-n[1]*a[0]];
  [[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(q=>{pos.push(a[0]*q[0]+b[0]*q[1],a[1]*q[0]+b[1]*q[1],a[2]*q[0]+b[2]*q[1]);uv.push(q[0]*.5+.5,q[1]*.5+.5);nor.push(n[0],n[1],n[2]);});});
 return BIO.geo._make(pos,nor,uv);};
// a STAR (the star aloe's head, ref 13): long pointed leaves radiating and curling up, dark at the tips
G.star=function(){const pos=[],nor=[],uv=[],col=[];const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 [[12,1.0,.25,.14],[8,.7,.75,.15],[5,.45,1.2,.14]].forEach(([n,R,el,wd],ti)=>{for(let k=0;k<n;k++){const a=ti*.37+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
  const P=t=>{const e=el+.9*t*t;return[ca*R*t*Math.cos(e),R*t*Math.sin(e)+.05,sa*R*t*Math.cos(e)];},W=wd*R;
  const A=P(0),M=P(.45),T=P(1),m0=[M[0]-px*W,M[1],M[2]-pz*W],m1=[M[0]+px*W,M[1],M[2]+pz*W];
  const base=[.7,.6,.55],mid=[1.05,1.0,.95],tip=[.25,.2,.22];
  push(A,base);push(m1,mid);push(m0,mid);push(m0,mid);push(m1,mid);push(T,tip);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a ROSETTE of broad wavy leaves (the ash creeper, ref 15; the sulphur rosette, ref 4, darker at the rim)
G.rosette=function(rim){const pos=[],nor=[],uv=[],col=[];const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 [[11,1.0,.35,.2],[8,.75,.75,.2],[5,.5,1.15,.18]].forEach(([n,R,el,wd],ti)=>{for(let k=0;k<n;k++){const a=ti*.41+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=wd*R;
  const P=t=>{const e=el-.6*t*t;return[ca*R*t*Math.cos(e),R*t*Math.sin(e)+.03,sa*R*t*Math.cos(e)];};
  const A=P(0),M=P(.55),T=P(1),m0=[M[0]-px*W,M[1]+.04,M[2]-pz*W],m1=[M[0]+px*W,M[1]-.04,M[2]+pz*W];
  const c0=[.65,.7,.65],c1=[1,1,1],c2=rim?[1.2,.35,.45]:[1.05,1.08,1.0];
  push(A,c0);push(m1,c1);push(m0,c1);push(m0,c1);push(m1,c1);push(T,c2);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a BRAIN CAP (ref 17): a dome folded into deep ridges
G.brain=()=>L([[-.05,.15,.5],[0,.7,.7],[.12,1.0,.95],[.35,.95,1.1],[.55,.7,1.15],[.66,.3,1.2],[.68,0,1.2]],40,{wavN:13,wavA:.09,wavE:.3,ribN:17,ribA:.08});
// a VENT CONE of the mat (ref 7): a low cone with a hollow, bright green heart
G.ventcone=()=>L([[0,1.0,.35],[.35,.62,.55],[.6,.38,.8],[.5,.22,1.6],[.2,.0,2.0]],16,{jit:.1});
// a VENT CORAL column (ref 16): a lumpy ribbed pillar
G.column=()=>L([[0,.5,.6],[.25,.55,.8],[.5,.48,.95],[.75,.52,1.0],[.92,.4,1.05],[1,.0,1.1]],12,{ribN:5,ribA:.18,jit:.12,bumpA:.15});
// a BRACKET (the lantern bracket, ref 6): half a shallow funnel, a hollow upper face; on a wall it faces +z
G.bracket=()=>L([[0,.05,.5],[.25,.35,.8],[.5,.75,1.0],[.6,1.0,1.15],[.55,1.05,.7]],14,{arc:.5,a0:0,wavN:10,wavA:.04,wavE:3,checker:true});
// a LAMP CAP (ref 20): a wide shallow dish, glowing
G.lamp=()=>L([[-.12,.05,.6],[-.08,.5,.8],[0,.95,1.0],[.06,1.0,1.05],[.08,.6,.95],[.09,0,.9]],24,{wavN:6,wavA:.05});
// a SCALE CONE (ref 18): a tall pink finger, scaled
G.scalecone=()=>L([[0,.42,.7],[.15,.5,.85],[.4,.48,.95],[.65,.4,1.0],[.85,.26,1.05],[.97,.1,1.1],[1,0,1.1]],12,{checker:true});
// RESIN: a drip, a teardrop hanging from a wound (the spice)
G.resin=()=>L([[-1,0,.7],[-.7,.35,.8],[-.2,.5,1.0],[.3,.35,1.1],[.7,.15,1.15],[1,0,1.2]],8,{});
// the RUFF POD (the ruff tree's collar without the library: a ruffled cup flaring from a stalk)
G.frill=function(){const pos=[],nor=[],uv=[],col=[];const seg=20,rings=[[0,.12,.06],[.35,.25,.42],[.7,.32,.78],[1,.36,1.0]];
 const P=rings.map(([t,y,r])=>{const o=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,fl=1+.16*Math.sin(a*9)*t,yy=y+.09*Math.sin(a*9+1)*t*t;o.push([Math.cos(a)*r*fl,yy,Math.sin(a)*r*fl,t]);}return o;});
 const ramp=t=>[lerp(.62,1.2,t),lerp(.22,.82,t*t),lerp(.18,.26,t)];
 const push=p=>{const l=Math.hypot(p[0],.6,p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,.6/l,p[2]/l);uv.push(0,0);const c=ramp(p[3]);col.push(c[0],c[1],c[2]);};
 for(let i=0;i<rings.length-1;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 return BIO.geo._make(pos,nor,uv,col);};
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
// a LEAF QUAD: one broad frond card lying along +x from its base at the origin, gently arched, face up; the texture's
// frond stands upright in it (base at the bottom of the image: v 1 at x 0), u across (the crater drylands')
G.leafquad=function(){const pos=[],uv=[],nor=[],X=[0,.5,1],Yb=[0,.1,0];
 for(let i=0;i<2;i++)for(const q of [[i,-.5],[i+1,-.5],[i+1,.5],[i,-.5],[i+1,.5],[i,.5]]){const x=X[q[0]];pos.push(x,Yb[q[0]],q[1]);uv.push(q[1]+.5,1-x);nor.push(0,1,0);}
 return BIO.geo._make(pos,nor,uv);};
THRONE.G=G;

// ---------------------------------------------------------------- materials
// THE GLOW: Lambert whose emissive takes the vertex and instance colour (so a cap glows its own colour and its stalk
// does not), at a low level by day and a high one at night (THRONE.setNight). Krator's own life lights the plume's dusk.
function glowMat(key,day,night,map){const m=new T3.MeshLambertMaterial({color:0xffffff,vertexColors:true,emissive:0xffffff,emissiveIntensity:day,map:map||null,side:T3.DoubleSide});
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance *= vColor.rgb'+(map?' * texture2D(map,vUv).rgb':'')+';');};
 const ck=BIO.kitKey('throne-glow-'+key);m.customProgramCacheKey=()=>ck;m.userData.bio={kind:'glow',key:BIO.kitKey(key),opts:{night:[day,night]}};return m;}
THRONE.MAT={
 bark:THRONE.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(THRONE.WOODTEX),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.06}),
 glossy:BIO.leafMat(TX.glossy,'glossy',{aN:true,swayW:'1.0',swayA:.05}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 feather:BIO.leafMat(TX.feather,'feather',{swayW:'(position.y)',swayA:.07,alphaTest:.4}),
 flame:BIO.leafMat(TX.flame,'flame',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 bunch:BIO.leafMat(TX.bunch,'bunch',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 fuzz:BIO.leafMat(TX.fuzz,'fuzz',{swayW:'0.3',swayA:.02,alphaTest:.3}),
 glassfern:BIO.leafMat(TX.fern,'glassfern',{aN:true,irid:true,swayW:'(position.x)',swayA:.03}),
 treefrond:BIO.leafMat(TX.fern,'treefrond',{aN:true,swayW:'(position.x)',swayA:.06}),
 pompom:BIO.leafMat(TX.flame,'pompom',{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 fern:BIO.leafMat(TX.fern,'fern',{aN:true,swayW:'(position.x)',swayA:.05}),
 palmfrond:BIO.leafMat(TX.palm,'palmfrond',{aN:true,swayW:'(position.x)',swayA:.07,alphaTest:.4}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 litter:BIO.leafMat(TX.litter,'litter',{swayW:'0.0',swayA:0,alphaTest:.35}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.04,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(THRONE.ROCKTEX),
 resin:new T3.MeshPhongMaterial({color:0xffffff,vertexColors:true,shininess:90,specular:0x886666,side:T3.DoubleSide}),
 // the glowing ones: lamp caps, the lantern brackets, the mat's vent cones, the drizzle trumpets' pitchers (faintly:
 // they read as translucent), the mat itself (its veins)
 lamp:glowMat('lamp',.18,1.25,TX.lampTex),bracket:glowMat('bracket',.1,1.1),ventcone:glowMat('ventcone',.08,.9),
 pitcher:glowMat('pitcher',.16,.32),
 mat:(function(){const m=BIO.leafMat(TX.mat,'mat',{swayW:'0.0',swayA:0,alphaTest:.3});m.emissive=new T3.Color(0xffffff);m.emissiveIntensity=.05;
  m.emissiveMap=TX.mat;return m;})(),
};
const M=THRONE.MAT;
M.brimcup=glowMat('brimcup',.06,.8);M.bladder=glowMat('bladder',.2,.75);
// ---------------------------------------------------------------- the library (core/materials/PLAN.md, The Throne)
// When the page carries this kit's pack (materials.json -> KMAT.pack('throne'): the showcase), the owner's textures of
// 2026-10-06 take over: the needles, ferns and broom, four barks, the fungal flesh, and new card plants (glowing shelf
// fungi, glowing mushrooms, alien flora and carnivorous flowers, fungus specimens, dripping fungi, lava-leaf, withered
// and succulent leaves) that the floor (60) and the trees (55) place only when THRONE.LIB has them. A page without the
// pack (an open world, ?mat=proc) keeps the procedural kit. A sheet is cut into single cells (libCell); a cut cell loads
// asynchronously, counted in window._texPending.
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('throne',n):null;
THRONE.LIB={has:n=>!!LIBP(n)};
function libCard(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;
 t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;return t;}
function libCell(n,box,W,H,rot,k){const L=LIBP(n);if(!L)return null;const c=document.createElement('canvas');c.width=W;c.height=H;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const img=new Image();if(typeof window!=='undefined')window._texPending=(window._texPending||0)+1;
 img.onload=()=>{const w=img.width,h=img.height,sw=(box[2]-box[0])*w,sh=(box[3]-box[1])*h,g=c.getContext('2d');
  if(rot){const s=(k||1)*H/Math.hypot(sw,sh);g.translate(W/2,H/2);g.rotate(rot);g.drawImage(img,box[0]*w,box[1]*h,sw,sh,-sw*s/2,-sh*s/2,sw*s,sh*s);}
  else g.drawImage(img,box[0]*w,box[1]*h,sw,sh,0,0,W,H);
  t.needsUpdate=true;window._texPending--;};
 img.onerror=()=>{window._texPending--;BIO.err('throne: a library card failed to decode: '+n);};
 img.src=L.map;return t;}
const CELL=(i,j,N)=>{N=N||3;return[i/N+.005,j/N+.005,(i+1)/N-.005,(j+1)/N-.005];};   // column i, row j of an N x N sheet
// a card plant's material: alpha-tested, swaying from its foot; glow: its own colours lit at night (THRONE.setNight)
function cardMat(t,key,o){o=o||{};if(o.glow){const m=glowMat(key,o.glow[0],o.glow[1],t);m.alphaTest=.42;m.vertexColors=false;
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance *= texture2D(map,vUv).rgb * smoothstep(0.35,0.75,max(max(texture2D(map,vUv).r,texture2D(map,vUv).g),texture2D(map,vUv).b));');};
  return m;}
 return BIO.leafMat(t,key,{swayW:o.swayW||'(position.y)',swayA:o.swayA==null?.05:o.swayA,alphaTest:.42});}
{const use=(k,t,at)=>{if(t){M[k].map=t;M[k].alphaTest=at==null?.4:at;}};
 use('needle',libCard('leaf.needle'));}
THRONE.LIB.cards={};
{const C3=[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]],sheet=(lib,key,cells,N,o)=>{if(!LIBP(lib))return;const L=[];
  cells.forEach((c,i)=>{const t=libCell(lib,CELL(c[0],c[1],N),256,256);if(!t)return;const k=key+i;M[k]=cardMat(t,k,o);L.push(k);});THRONE.LIB.cards[key]=L;};
 sheet('card.shelf','shelf',[[0,0],[1,1],[2,0],[0,2],[2,2]],3,{glow:[.1,1.0]});
 sheet('card.glowshroom','glowshroom',C3,3,{glow:[.15,1.2]});
 sheet('card.alienflora','aflora',C3,3,{glow:[.05,.5]});
 sheet('card.carnivore','carnivore',C3,3,{});
 sheet('card.specimens','specimen',[[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3],[3,3]],4,{});
 sheet('card.drip','drip',C3,3,{swayW:'(-position.y)',swayA:.04});
 sheet('card.succulent','succulent',[[1,1],[0,0],[2,2]],3,{swayA:.02});
 sheet('card.tendril','tendril',C3,3,{swayA:.03});
 sheet('card.moltensucc','moltensucc',C3,3,{swayA:.02});
 sheet('card.moss','moss',C3,3,{swayW:'(-position.y)',swayA:.05});
 sheet('card.carnplants','carnplant',C3,3,{});
 sheet('card.coral','coralcard',C3,3,{swayA:.02});
 sheet('card.mushalien','mushalien',C3,3,{swayA:.02});
 sheet('card.trumpets','trumpets',C3,3,{swayA:.02});
 // the angel trumpets hang from their calyx (the cells whose flower hangs straight down); the spider lilies seen from above
 sheet('card.angel','angel',[[1,0],[0,1],[1,2]],3,{swayW:'(-position.y)',swayA:.04});
 sheet('card.spiderlily','spiderlily',[[0,0],[1,1],[2,2]],3,{swayA:.02});
 // THE CLOUD FOREST's cards: moss curtains hung from limbs (each cell hangs from its top edge), green fern fronds, and the veil
 // tree's veils (the weeper's pink strands, hung, glowing faintly at night)
 sheet('card.mosshang','mosshang',[[0,0],[1,0],[0,1],[2,1],[1,2],[2,2]],3,{swayW:'(-position.y)',swayA:.05});   // the greener six (its red and orange cells read as autumn)
 sheet('card.ferngreen','ferngreen',C3,3,{swayA:.05});
 // THE SAVANNA's cards (stations/savanna): tall seeding grass tussocks, and the flowers that come up after a fire
 sheet('card.grassdry','grassdry',C3,3,{swayW:'(position.y)',swayA:.1});
 sheet('card.flowerspike','flowerspike',C3,3,{swayW:'(position.y)',swayA:.06});
 // THE STAR ALOE's BLOSSOMS (the owner's, 2026-10-06): the six upright spikes (single and candelabra), each rising out of its
 // own small leaf star at the foot of its cell
 sheet('card.aloeflower','aloeflower',[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],3,{swayW:'(position.y)',swayA:.04});
 sheet('card.weeper','weeper',C3,3,{glow:[.04,.65]});
 // THE SEAWEED (the owner's nine, 3 x 3): standing in the isle's shallows, and the same cells cast up flat on the sand as wrack
 sheet('card.seaweed','seaweed',C3,3,{swayW:'(position.y)',swayA:.08});
 // THE BRIMSTONE REEDS (the owner's nine stands, 3 x 3): vent country's reeds in the shallows and round the vents
 sheet('card.reedbrim','reedbrim',C3,3,{swayW:'(position.y)',swayA:.05});
 // THE KELP (the library's single kelp cards, as Ys has them): standing 3-15 m down; the wrack is the seaweed's where the pack has it
 {const L=[],W=[],SW=THRONE.LIB.cards.seaweed||[];['card.kelp0','card.kelp1','card.kelp2'].forEach((n,i)=>{const t=libCard(n);if(!t)return;M['kelp'+i]=cardMat(t,'kelp'+i,{swayW:'(position.y)',swayA:.09});L.push('kelp'+i);
   if(!SW.length){M['wrack'+i]=BIO.leafMat(t,'wrack'+i,{swayW:'0.0',swayA:0,alphaTest:.42});W.push('wrack'+i);}});
  SW.forEach((k,i)=>{M['wrack'+i]=BIO.leafMat(M[k].map,'wrack'+i,{swayW:'0.0',swayA:0,alphaTest:.42});W.push('wrack'+i);});THRONE.LIB.cards.kelp=L;THRONE.LIB.wrack=W;}
 // THE COCONUT'S FRONDS (the owner's, 2026-10-06): three across the sheet, each upright in its third, its base at the top (the
 // frond geometry's v runs from the base); without the pack the procedural frond
 {const L=[];for(let i=0;i<3;i++){const t=libCell('card.frond.coconut',[i/3+.008,.01,(i+1)/3-.008,.99],256,512);if(!t)continue;const k='palmfrond'+i;
   M[k]=BIO.leafMat(t,k,{aN:true,swayW:'(position.x)',swayA:.07,alphaTest:.4});L.push(k);}THRONE.LIB.cards.palmfrond=L;}
 ['card.lavaleaf','card.distressed'].forEach(n=>{const t=libCard(n);if(t){const k=n.split('.')[1];M[k]=BIO.leafMat(t,k,{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4});THRONE.LIB.cards[k]=[k];}});
 // THE RUFF (the owner's spiked fronds, 2026-10-06): the ruff trees' collars as a ring of fronds round a dark throat.
 // The four cells whose fan stands upright (base at the bottom), each its own material
 {const L=[];[[1,0],[1,1],[0,2],[1,2]].forEach((c,i)=>{const t=libCell('card.ruff',CELL(c[0],c[1],3),256,256);if(!t)return;const k='frillfrond'+i;
   M[k]=BIO.leafMat(t,k,{aN:true,swayW:'(position.x)',swayA:.04,alphaTest:.4});L.push(k);});THRONE.LIB.cards.frillfrond=L;}
 // THE FRILL TREE'S FINS (the owner's fractal fronds, 2026-10-06): three fronds across a landscape sheet, each upright in
 // its third (the sheet was squared with padding: the fronds fill 0.18..0.82 of its height)
 {const L=[];[[.01,.18,.335,.82],[.335,.18,.666,.82],[.666,.18,.99,.82]].forEach((b,i)=>{const t=libCell('card.fractal',b,256,512);if(!t)return;const k='fin'+i;
   M[k]=BIO.leafMat(t,k,{aN:true,irid:true,swayW:'(position.x)',swayA:.05,alphaTest:.4});L.push(k);});THRONE.LIB.cards.fin=L;}
 // THE GREAT RUFF'S COLLAR (the owner's coral petals, 2026-10-06): the four petals that stand upright in their cells
 {const L=[];[[1,0],[0,1],[2,1],[1,2]].forEach((c,i)=>{const t=libCell('card.petal',CELL(c[0],c[1],3),256,256);if(!t)return;const k='petal'+i;
   M[k]=BIO.leafMat(t,k,{aN:true,swayW:'(position.x)',swayA:.03,alphaTest:.4});L.push(k);});THRONE.LIB.cards.petal=L;}
 const fb=libCard('leaf.broom');if(fb){M.broom=BIO.leafMat(fb,'broom',{aN:true,swayW:'1.0',swayA:.06,alphaTest:.4});THRONE.LIB.broom=true;}}
THRONE.LIB.cardsOf=k=>THRONE.LIB.cards[k]||[];
// the windward cards (scan library): the fern stands upright in its image, the tree-fern frond lies diagonal (base bottom
// left) and is turned -45 degrees to stand upright in the leaf quad; bromeliads, screwpine crowns and moss are clumps
{const f=libCard('leaf.fern');if(f){M.fern.map=f;M.fern.alphaTest=.4;THRONE.LIB.fern=true;}
 const tf=libCell('card.treefern',[0,0,1,1],512,512,-Math.PI/4,1.0);if(tf){M.treefrond.map=tf;M.treefrond.alphaTest=.38;THRONE.LIB.treefrond=true;}
 [['card.bromeliad','bromeliad'],['card.screwpine','screwpine'],['card.mossclump','mossclump']].forEach(([n,k])=>{const t=libCard(n);
  M[k]=BIO.leafMat(t||TX.small,k,{aN:true,swayW:'1.0',swayA:.04,alphaTest:.4});THRONE.LIB[k]=!!t;});}
// THE CAPS' OWN SURFACES (the owner's fungal skins): the gill-parasol's and stilt parasol's orange cracked tops, the
// pagoda's glossy tiers (tinted red by the instance), the bone bell's porous cream dome; mapped from above (G.lathe planar)
const capMat=(fam,key)=>{const L=LIBP(fam);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;THRONE.LIB[key]=true;return BIO.leafMat(t,key,{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true});};
M.discT=capMat('cap.disc','disc');M.tierT=capMat('cap.tier','tier');M.bellT=capMat('cap.bell','bell');
// the trumpet tree's funnels: the owner's ribbed, frill-rimmed funnel seen from above (2026-10-06), on a funnel of its own
M.funnelT=capMat('cap.funnel','funnelT');
M.gcoralT=capMat('cap.gillcoral','gcoralT');   // the owner's gill-coral cap (radial, mapped from above)
// the drizzle trumpet's pitcher: the cells-and-veins skin as grey detail under its green, still faintly lit from within
{const L=LIBP('pitcher.cells');if(L){M.pitcher=glowMat('pitcher',.16,.32,KMAT.textures(L,{aniso:4}).map);THRONE.LIB.pitcher=true;}}
THRONE._glow=[M.lamp,M.bracket,M.ventcone,M.pitcher,M.mat];
THRONE._night=0;
// the glow's day and night levels: the procedural glowers and every glowing card (their material's own pair)
THRONE.setNight=function(k){k=clamp(+k||0,0,1);THRONE._night=k;
 for(const key in M){const m=M[key];const n=m&&m.userData&&m.userData.bio&&m.userData.bio.opts&&m.userData.bio.opts.night;if(n&&m!==M.mat)m.emissiveIntensity=lerp(n[0],n[1],k);}
 M.mat.emissiveIntensity=lerp(.05,.7,k);M.mat.emissive.setHex(k>0?0xff3a90:0xffffff);
 if(THRONE.MOLTEN){const n=THRONE.MOLTEN.userData.bio.opts.night;THRONE.MOLTEN.emissiveIntensity=lerp(n[0],n[1],k);}
 return{lamp:M.lamp.emissiveIntensity,bracket:M.bracket.emissiveIntensity};};
// the barks (materials.json bark.*): keep-0 grey detail under the species' vertex colours. The bucket's uvScale becomes the
// set's tile size, and means() (55) divides out the pack's brightness instead of the canvas's. bark.molten (the pagoda
// cap's trunk) keeps its own colour, and its red cracks glow at night.
const LIBBARK={0:'bark.charred',1:'bark.charcoal',3:'bark.armored',6:'bark.palm',7:'bark.mangrove',8:'bark.twisted',10:'bark.honeycomb',11:'bark.frillcol'};
THRONE.LIBMEAN={};
const libMap=(n,k)=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;THRONE.LIBMEAN[k]=L.mean;return{t,scale:L.scale};};
['Furrowed bark','Plated bark','Pale bark','Scaly bark','Deadwood','Banded','Palm rings (the palm frill tree)','Mangrove bark','Rope strands','Fungal flesh','Spice-tree bark','Frill-tree column'].forEach((lab,i)=>{
 const L=LIBBARK[i]&&libMap(LIBBARK[i],'bark'+i);if(L)M.bark[i].map=L.t;
 BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:L?L.scale:[i===2||i===9?3:4,i===1?4:6]});});
// the elfin tree's bark: the owner's moss-grown bark in its own colour (B[21] gives its vertices near white)
{const L=libMap('bark.elfin','elfin');BIO.bucket('elfin',BIO.barkMat(L?L.t:null),{label:'Elfin bark (moss-grown)',uvScale:L?L.scale:[1,1.4]});THRONE.LIB.elfin=!!L;}
// the coconut palm's trunk: the owner's coir, in its own colour (B[20] gives its vertices white)
{const L=libMap('bark.brimstone','brimstone');BIO.bucket('brimstone',BIO.barkMat(L?L.t:null),{label:'Brimstone bark (sulphur-banded)',uvScale:L?L.scale:[1,1.4]});THRONE.LIB.brimstone=!!L;}
{const L=libMap('bark.coir','coir');BIO.bucket('coir',BIO.barkMat(L?L.t:null),{label:'Coir (the coconut palm\'s trunk)',uvScale:L?L.scale:[1,1.4]});THRONE.LIB.coir=!!L;}
{const L=libMap('wood.sulphur','wood');if(L)M.wood.map=L.t;BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:L?L.scale:[3,4]});}
// the alien bodies too big to instance (a bone bell's root curtain) go into vertex-coloured buckets
{const fm=BIO.barkMat(THRONE.BARKTEX[9]),L=libMap('flesh.porous','flesh');if(L)fm.map=L.t;BIO.bucket('flesh',fm,{label:'Fungal flesh (bells, caps)',uvScale:L?L.scale:[3,3]});}
{const L=libMap('bark.molten','molten');if(L){const m=BIO.barkMat(L.t);m.emissive=new T3.Color(0xffffff);m.emissiveIntensity=.04;
  m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n {vec3 _c=texture2D(map,vUv).rgb;totalEmissiveRadiance *= _c*smoothstep(0.12,0.35,_c.r-_c.g*0.9);}');};
  m.customProgramCacheKey=()=>BIO.kitKey('throne-molten');m.userData.bio={kind:'bark',key:BIO.kitKey('molten'),opts:{night:[.04,1.4]}};
  THRONE.MOLTEN=m;BIO.bucket('molten',m,{label:'Molten bark (the pagoda cap)',uvScale:L.scale});}}
// the library barks that keep their own colour: their species' bark colours go near white under them
if(LIBP('bark.honeycomb'))THRONE.byKey.spice.bark=[0xf4f0ea,0xe8e2da,0xfaf6f0];
if(LIBP('flesh.porous')){PAL.bell=[0xf4f0e6,0xfaf8f2,0xece6da];PAL.bellStreak=[0xe8d8b0,0xdccca0];}
// pumice and vesicular basalt for the boulders, stones and spatter
{const L=libMap('stone.pumice','rock');if(L)M.rock.map=L.t;}
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Pine needles'});
BIO.def('glossy',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Spice-tree leaves'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Shrub foliage'});
BIO.def('feather',G.tuft(),M.feather,{label:'Plume-bush feathers and anemone tufts'});
BIO.def('flame',BIO.geo.clump(),M.flame,{attrs:['aN'],label:'Tufts'});
BIO.def('plume',G.tuft(),M.plume,{label:'Broom flowers'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Stalk daisies'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Bunchgrass'});
BIO.def('fern',THRONE.LIB.fern?G.leafquad():BIO.geo.frond(3),M.fern,{attrs:['aN'],label:'Lava ferns'});
BIO.def('glassfern',BIO.geo.frond(3),M.glassfern,{attrs:['aN','aC2'],label:'Glassferns'});
BIO.def('treefrond',THRONE.LIB.treefrond?G.leafquad():BIO.geo.frond(3),M.treefrond,{attrs:['aN'],label:'Tree-fern fronds'});
BIO.def('pompom',BIO.geo.clump(),M.pompom,{attrs:['aN'],label:'Lehua flowers'});
BIO.def('bromeliad',BIO.geo.clump(),M.bromeliad,{attrs:['aN'],label:'Red bromeliads'});
BIO.def('screwpine',BIO.geo.clump(),M.screwpine,{attrs:['aN'],label:'Arch-palm crowns'});
BIO.def('palmfrond',BIO.geo.frond(5),M.palmfrond,{attrs:['aN'],label:'Palm fronds'});
THRONE.LIB.cardsOf('palmfrond').forEach(k=>BIO.def(k,BIO.geo.frond(5),M[k],{attrs:['aN'],label:'Coconut fronds'}));
BIO.def('coconut',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Coconuts'});
BIO.def('mossclump',BIO.geo.clump(),M.mossclump,{attrs:['aN'],label:'Moss'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichen crust'});
BIO.def('litter',BIO.geo.mat(),M.litter,{label:'Litter and ash'});
BIO.def('mat',BIO.geo.mat(),M.mat,{label:'The mat (a slime mould)'});
BIO.def('rosette',G.rosette(false),M.vsway,{label:'Ash creepers'});
BIO.def('srosette',G.rosette(true),M.vsway,{label:'Sulphur rosettes'});
BIO.def('star',G.star(),M.vsway,{label:'Star-aloe heads'});
BIO.def('frill',G.frill(),M.vsway,{label:'Ruff pods'});
BIO.def('disc',G.disc(),M.discT||M.vcol,{label:'Parasol caps'});
BIO.def('gills',G.gills(),M.vcol,{label:'Parasol gills'});
BIO.def('bell',G.bell(),M.bellT||M.vcol,{label:'Bone bells'});
BIO.def('funnel',G.funnel(),M.vsway,{label:'Funnels (the siphon tree\'s lip)'});
BIO.def('tfunnel',M.funnelT?G.lathe([[0,.05,.45],[.3,.12,.6],[.6,.26,.8],[.82,.5,.95],[.94,.8,1.05],[1.0,1.0,1.1]],22,{ribN:11,ribA:.06,wavN:9,wavA:.08,wavE:3,planar:true}):G.funnel(),M.funnelT||M.vsway,{label:'Trumpet funnels'});
BIO.def('pitcher',G.pitcher(),M.pitcher,{label:'Drizzle-trumpet pitchers'});
BIO.def('cup',G.cup(),M.vsway,{label:'Soot cups'});
BIO.def('tier',G.tier(),M.tierT||M.vcol,{label:'Pagoda-cap tiers'});
BIO.def('puff',G.puff(),M.vcol,{label:'Spore puffs'});
BIO.def('fuzz',G.fuzz(),M.fuzz,{label:'Spore-puff fuzz'});
BIO.def('hair',G.hair(),M.vcol,{label:'Spore-puff hairs'});
BIO.def('brain',G.brain(),M.vcol,{label:'Brain caps'});
BIO.def('column',G.column(),M.vcol,{label:'Vent coral'});
BIO.def('ventcone',G.ventcone(),M.ventcone,{label:'The mat\'s vent cones'});
BIO.def('bracket',G.bracket(),M.bracket,{label:'Lantern brackets'});
BIO.def('lamp',G.lamp(),M.lamp,{label:'Lamp caps'});
BIO.def('scalecone',G.scalecone(),M.vsway,{label:'Scale cones'});
BIO.def('resin',G.resin(),M.resin,{label:'Spice resin'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub masses'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems and runners'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Basalt boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones and spatter'});
// vent country's sulphur life: the candelabra's fluted cups, the reeds' tassels, the floating pads (a flat ruffled disc,
// its rim lighter: the yellow crust over the instance's rust), the gas bladders
BIO.def('brimcup',L([[0,.08,.6],[.25,.18,.75],[.55,.36,.9],[.8,.62,1.05],[.95,.86,1.25],[1.0,.92,1.4]],16,{ribN:8,ribA:.12,wavN:8,wavA:.06,wavE:3}),M.brimcup,{label:'Brimstone-candelabra cups'});
// the cold belt's: the gill-coral tree's cap (a dome ridged like a plate coral on top, its rim curling under; the ridges
// shaded light and dark by angle) and the teal cushions
BIO.def('gcoral',M.gcoralT?L([[1.0,0,1.05],[.98,.3,1.0],[.9,.58,1.0],[.76,.82,.96],[.6,1.0,.9],[.5,1.05,.75],[.44,.9,.5]],48,{ribN:56,ribA:.015,wavN:9,wavA:.06,wavE:1,planar:true}):L([[1.0,0,1.05],[.98,.3,1.0],[.9,.58,1.0],[.76,.82,.96],[.6,1.0,.9],[.5,1.05,.75],[.44,.9,.5]],48,{gillN:56,gillA:.35,ribN:56,ribA:.025,wavN:9,wavA:.06,wavE:1}),M.gcoralT||M.vcol,{label:'Gill-coral caps'});
BIO.def('cushion',(function(){const parts=[];let q=7;const hr=(lo,hi)=>{q=(q*16807)%2147483647;return lo+(hi-lo)*q/2147483647;};   // its own little generator: the kit's PRNG untouched
 for(let k=0;k<5;k++){const g=new T3.IcosahedronGeometry(1,0),r=k?hr(.45,.7):.8,a=hr(0,TAU),d=k?hr(.35,.6):0;
  g.scale(r,r*hr(.6,.85),r);g.translate(Math.cos(a)*d,r*.35,Math.sin(a)*d);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*hr(.9,1.1),p.getY(i)*hr(.9,1.1),p.getZ(i)*hr(.9,1.1));parts.push(g);}
 const n=parts.reduce((t,g)=>t+g.attributes.position.count,0),pos=new Float32Array(n*3);let o=0;parts.forEach(g=>{pos.set(g.attributes.position.array,o);o+=g.attributes.position.array.length;});
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pos,3));g.computeVertexNormals();return g;})(),M.solid,{label:'Teal cushions'});
BIO.def('tassel',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Brimstone-reed tassels'});
BIO.def('acidpad',L([[0,0,.55],[.01,.5,.8],[.02,.88,1.0],[.05,1.0,1.45],[.06,.97,1.5]],14,{wavN:5,wavA:.03,jit:.08,planar:true}),M.vcol,{label:'Acid pads'});
// (the glow material takes the vertex colour: a bare sphere has none and renders black; lighter toward its top)
BIO.def('bladder',(function(){const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position,c=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const v=.7+.3*(p.getY(i)+1)/2;c[i*3]=c[i*3+1]=c[i*3+2]=v;}g.setAttribute('color',new T3.BufferAttribute(c,3));return g;})(),M.bladder,{label:'Gas bladders'});
// the library's card plants (only when the pack carries them): crossed cards standing on their foot, single cards on a
// wall facing out (+z), crossed cards hanging from their top; and the leaf clumps
{const quad=()=>{const pos=[],uv=[],nor=[];[[-.5,0],[.5,0],[.5,1],[-.5,0],[.5,1],[-.5,1]].forEach(q=>{pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
 // a hanging card: the tuft turned upside down, its texture turned with it, so the sheet's top (where the plant is
 // attached) is at the card's top and what dangles hangs below
 const flipV=g=>{const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));uv.needsUpdate=true;return g;};
 const hang=()=>{const g=G.tuft();g.scale(1,-1,1);return flipV(g);};
 // the angel cells are drawn calyx-up, so the hung card keeps the cell's own V (calyx at the top of the hang)
 const hangUp=()=>{const g=G.tuft();g.scale(1,-1,1);return g;};
 // the tendril sheet draws its rosettes crown-up with the tendrils trailing down: on the ground they stand crown-down
 const tuftUp=()=>flipV(G.tuft());
 const LAB={reedbrim:'Brimstone reeds',angel:'Angel trumpets',spiderlily:'Spider lilies',trumpets:'Trumpet fungi',aloeflower:'Star-aloe blossoms',grassdry:'Tall grass',flowerspike:'Fire flowers',kelp:'Kelp',seaweed:'Seaweed',mosshang:'Moss curtains',ferngreen:'Cloud ferns',weeper:'Veil-tree veils',carnplant:'Snare plants',coralcard:'Vent growths',mushalien:'Plume mushrooms',moltensucc:'Ember succulents',moss:'Snare moss (hanging)',tendril:'Ash creepers (tendrils)',shelf:'Lantern brackets (glowing shelf fungi)',glowshroom:'Glow mushrooms',aflora:'Glow tufts',carnivore:'Snare flowers',specimen:'Plume fungi',drip:'Dripping fungi',succulent:'Spotted succulents'};
 // the wrack lies flat on the sand: a quad in the ground's plane, face up
 (THRONE.LIB.wrack||[]).forEach(k=>BIO.def(k,quad().rotateX(-Math.PI/2),M[k],{label:'Wrack (cast kelp)'}));
 for(const key in THRONE.LIB.cards){if(key==='lavaleaf'||key==='distressed')continue;if(key==='frillfrond'||key==='fin'||key==='petal'||key==='palmfrond')continue;THRONE.LIB.cards[key].forEach(k=>BIO.def(k,key==='shelf'?quad():(key==='drip'||key==='moss'||key==='mosshang'||key==='weeper')?hang():key==='angel'?hangUp():key==='spiderlily'?flipV(BIO.geo.bloom()):key==='tendril'?tuftUp():G.tuft(),M[k],{label:LAB[key]}));}
 if(M.lavaleaf)BIO.def('lavaleaf',BIO.geo.clump(),M.lavaleaf,{attrs:['aN'],label:'Lava-leaf shrubs'});
 if(M.distressed)BIO.def('distressed',BIO.geo.clump(),M.distressed,{attrs:['aN'],label:'Withered ash shrubs'});
 if(M.broom)BIO.def('broom',BIO.geo.clump(),M.broom,{attrs:['aN'],label:'Ash broom'});
 THRONE.LIB.cardsOf('petal').forEach(k=>BIO.def(k,G.leafquad(),M[k],{attrs:['aN'],label:'Great-ruff petals'}));
 THRONE.LIB.cardsOf('fin').forEach(k=>BIO.def(k,G.leafquad(),M[k],{attrs:['aN','aC2'],label:'Frill-tree fins'}));
 THRONE.LIB.cardsOf('frillfrond').forEach(k=>BIO.def(k,G.leafquad(),M[k],{attrs:['aN'],label:'Ruff-tree collars'}));}
})();
