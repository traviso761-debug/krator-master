// ================================================================= NORTHERN HIGHLANDS — species (data + kit items)
// The old-growth flank of the Inner Wall: temperate rainforest low (the Pacific
// North-West, the Black Forest, the primeval woods of eastern Europe), boreal
// forest high (Scandinavian taiga, the woods north of the Wall). Giants with
// great closed canopies, moss and ferns on everything, mist in the hollows;
// ancient, gnarled in places, never unfriendly. The palette is green, every
// green; dark blue and dark purple seep in only in the understorey. The alien
// touches are few and deliberate: the TRUMPET TREES (the Rift's trumpet grown
// old, huge and gnarled here, and a large part of the understorey), the
// BELL-BULBS and LANTERN PODS that hang from the boughs and glow faintly at
// night, the LACE FERN, the RED-STEM FAN by the water and the DISC STALKS in
// the glades (the "alienflora" reference). Everything here is DATA and kit
// definitions; no placement.
//
// Tags follow the project rule: climate / aridity / abyssal / riparian, and this
// kit adds HARVEST, the pattern later kits copy:
//   harvest:{wood:'timber'|'fuel'|'none', edible:[parts], medicinal:bool, notes:''}
BIO.kit('nhighlands');   // this kit's own registry of items and buckets (core/biome: kits)
var NHL={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
NHL.TAGS={climate:'temperate..cold',aridity:'subhumid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- palettes
const PAL=NHL.PAL={
 // the greens: moss to bottle-green, the conifers blue-green
 moss:[0x5a7a26,0x6a8a2c,0x4a6a22,0x7a9a30,0x587a34,0x86a63a],
 mossDark:[0x34501e,0x3e5a22,0x2e4a1c,0x46622a],
 fern:[0x3e6a26,0x4a782c,0x355e22,0x568434,0x2e5420],
 lace:[0x7ac83a,0x88d444,0x6ab832,0x9ae050],                    // the lace fern: brighter than any terrestrial green
 conifer:[0x2a4a34,0x2e5238,0x26442e,0x34583c,0x223e2c],
 coniferBlue:[0x3a5a5a,0x42625e,0x34524e,0x4a6a68],              // the fir's and the frost fir's blue-grey
 broad:[0x4a7a2e,0x56862f,0x3e6c28,0x62903a,0x4a7034],
 beech:[0x5a8a30,0x6a9a34,0x4e7a2c,0x78a43c],
 birch:[0x7aa840,0x8ab848,0x6a9a3a,0x98c050],
 larch:[0x8ab860,0x9ac868,0x7aa858,0xa8d070],
 oak:[0x3e6228,0x4a6e2c,0x34561f,0x56782f],
 laurel:[0x2e5226,0x3a5e2a,0x284822,0x44682e],
 yew:[0x1e3222,0x243a26,0x1a2c1e],
 drape:[0x7a9a38,0x8aaa40,0x6a8a30,0x98b048],                    // hanging moss: chartreuse
 lichen:[0xb8c4a8,0xa8b498,0xc8d0b8,0x9aa890],                   // beard lichen and reindeer lichen: pale grey-green
 // the understorey's dark accents (no more than ~15% of the floor, never the canopy)
 violet:[0x3a2a4a,0x2e2240,0x46305a,0x2a2036],                   // black mondo grass, the painted understorey's violets
 plum:[0x4a2a3e,0x5a3048,0x3e2234,0x6a3a58],                     // smoke-bush purple, purple millet
 tealDark:[0x1e4a4e,0x24585a,0x1a3e44,0x2a6262],                 // blue-teal aroids
 spurge:[0x2e3e3e,0x34484a,0x283838],                            // dark spurge rosettes (chartreuse heads)
 bluebell:[0x4a50c8,0x5a5ad8,0x3e46b8,0x6a62e0],
 // the glow
 bulb:[0xf2dcae,0xeed2a0,0xf6e4bc,0xe8c890],                     // bell-bulbs: pale cream to amber
 pod:[0x9a62c8,0x8a52b8,0xb07ad8,0x7a48a8],                      // lantern pods: violet
 // the alien floor
 disc:[0xd8a838,0xe0b440,0xc89a30,0xe8c050],                     // disc stalks: gold, amber in the boreal band
 fanGreen:[0x4a9a48,0x58a850,0x3e8a44,0x66b058],
 fanRed:[0xa8283a,0xb83448,0x982030],
 trumpet:[0x9ac860,0xa8d468,0x8ab858,0xb4dc70],                  // the funnels' inside: pale yellow-green
 trumpetRim:[0x3a8a72,0x449a7e,0x2e7a66],                        // the rim: teal-green
 throat:[0x5a3a7a,0x6a4488,0x4a3268],                            // and violet down the throat
 rock:[0x7a7c76,0x6e706c,0x868882,0x707468],
 litter:[0x5a4430,0x4a3a2a,0x6a4e36],
 fireweed:[0xc0407a,0xd0508a,0xb03868],
 berry:[0xc8282a,0xd83a2a,0xb81e24],
 bilberry:[0x2a3a6a,0x34406e],
 snow:[0xeef2f6,0xe4eaf0,0xf6f8fa],
 mush:[0xc8281e,0xd8a040,0xe8dcc8,0x8a4a2a],
};
// iridescence pairs (the core's foliage hook): the trumpets' funnels and the lace fern only
PAL.irid={TV:[0x8a62b8,0x7a58a8,0x9a70c8],LG:[0xb8f070,0xc8f880]};

// ---------------------------------------------------------------- the tree species
// H height band (m), rb bole radius, crownR crown radius, bk bark texture kind,
// bark colours (sRGB, tinted onto a near-grey texture), leaf colours, item (the
// foliage card), habit (the builder) and its parameters.
const HV=(wood,edible,medicinal,notes)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||''});
const TG=(climate,aridity,riparian,harvest)=>({climate,aridity,abyssal:false,riparian,harvest});
NHL.SPECIES=[
 /*0*/{key:'greatspruce',name:'Great spruce',habit:'conifer',H:[62,92],rb:[1.7,2.6],crownR:[9,13],bk:0,bark:[0x8a5a40,0x7a5a4a,0x6a6a5e],leaf:PAL.conifer,item:'needle',
  form:{clear:.32,crown:'cone',step:2.6,droop:.25,L:1,buttress:.7,flutes:7,fluteA:.06,top:'spire',moss:.8,drape:.45},
  tags:TG('temperate','humid','no',HV('timber',['young tips'],true,'The tips make a tea against scurvy; the resin a salve.'))},
 /*1*/{key:'cathedralcedar',name:'Cathedral cedar',habit:'conifer',H:[54,80],rb:[2.0,3.1],crownR:[8,12],bk:1,bark:[0x9a5a3a,0x8a4e34,0xa86842],leaf:PAL.conifer.map(c=>C(c).lerp(C(0x4a6a2a),.35).getHex()),item:'spray',
  form:{clear:.3,crown:'dome',step:3.0,droop:.55,L:.95,buttress:1.1,flutes:11,fluteA:.10,top:'candelabra',moss:.9,drape:.5},
  tags:TG('temperate','humid','both',HV('timber',[],true,'Rot-proof wood for canoes, roofs and poles; the inner bark makes cord and cloth.'))},
 /*2*/{key:'shadowhemlock',name:'Shadow hemlock',habit:'conifer',H:[34,54],rb:[.8,1.3],crownR:[5,8],bk:1,bark:[0x5a4238,0x4e3a32,0x664a3e],leaf:PAL.conifer.map(c=>C(c).multiplyScalar(.85).getHex()),item:'spray',
  form:{clear:.14,crown:'cone',step:1.9,droop:.7,L:1,buttress:.3,flutes:4,fluteA:.04,top:'nod',moss:.7,drape:.35},
  tags:TG('temperate','humid','both',HV('timber',['inner bark'],true,'Inner bark eaten in famine; tannin for hides.'))},
 /*3*/{key:'mossmaple',name:'Moss maple',habit:'broad',H:[22,34],rb:[1.0,1.6],crownR:[11,16],bk:4,bark:[0x6a6a58,0x5e5e4e,0x76766a],leaf:PAL.broad,item:'maple',
  form:{hB:.32,boughs:[6,9],el:[.15,.55],L:[.9,1.25],wig:.22,curve:-.08,moss:1,drape:1,bulbs:.35,clump:[4.4,6.4]},
  tags:TG('temperate','humid','both',HV('timber',['sap'],false,'Sap boiled to syrup; the moss it carries is gathered for bedding.'))},
 /*4*/{key:'bluebeech',name:'Blue beech',habit:'broad',H:[30,44],rb:[.8,1.3],crownR:[9,13],bk:2,bark:[0x7a8a9a,0x6e8090,0x8a98a8],leaf:PAL.beech,item:'broad',
  form:{hB:.48,boughs:[5,7],el:[.6,1.05],L:[.75,1.05],wig:.12,curve:-.1,moss:.4,drape:0,bulbs:.12,clump:[4.6,6.8],roots:true},
  tags:TG('temperate','humid','no',HV('timber',['nuts'],false,'Beechmast: small oily nuts, roasted.'))},
 /*5*/{key:'silverfir',name:'Silver fir',habit:'conifer',H:[40,60],rb:[.9,1.5],crownR:[5,8],bk:0,bark:[0x8a8e8a,0x7a807c,0x969a94],leaf:PAL.coniferBlue.map(c=>C(c).lerp(C(0x2e5238),.5).getHex()),item:'needle',
  form:{clear:.24,crown:'cone',step:2.2,droop:.1,L:.9,buttress:.3,flutes:0,fluteA:0,top:'flat',moss:.6,drape:.25},
  tags:TG('temperate','humid','no',HV('timber',[],true,'Resin from the bark blisters, for wounds.'))},
 /*6*/{key:'greattrumpet',name:'Great trumpet',habit:'greattrumpet',H:[30,50],rb:[2.2,3.4],crownR:[13,22],bk:5,bark:[0x5a6a3a,0x4e5e34,0x667640],leaf:PAL.trumpet,ribs:12,arms:[3,7],
  tags:TG('temperate','humid','both',HV('none',['rain water in the cups'],false,'The cups hold clean water all summer; travellers drink from the low ones.'))},
 /*7*/{key:'trumpet',name:'Understory trumpet',habit:'trumpet',H:[4,14],rb:[.22,.55],crownR:[1.6,3.6],bk:5,bark:[0x6a7a44,0x5e6e3c,0x76864e],leaf:PAL.trumpet,ribs:10,
  tags:TG('temperate','humid','both',HV('none',['young funnel'],false,'The furled young funnel is cooked like a green.'))},
 /*8*/{key:'gnarloak',name:'Gnarled oak',habit:'gnarl',H:[8,16],rb:[.7,1.3],crownR:[7,11],bk:4,bark:[0x5a5448,0x4e4a40,0x666054],leaf:PAL.oak,item:'small',
  form:{stems:[1,2],limbs:[4,7],wig:.45,el:[-.05,.45],moss:1,drape:.7,bulbs:.25},
  tags:TG('temperate','subhumid','no',HV('fuel',['acorns'],true,'Acorns leached and ground; galls for ink; the bark for tanning.'))},
 /*9*/{key:'foglaurel',name:'Fog laurel',habit:'gnarl',H:[10,20],rb:[.35,.6],crownR:[5,8],bk:4,bark:[0x5a5040,0x4e463a,0x665c48],leaf:PAL.laurel,item:'small',
  form:{stems:[4,7],limbs:[2,3],wig:.55,el:[.5,1.05],moss:1,drape:.45,bulbs:.15},
  tags:TG('temperate','humid','both',HV('fuel',[],true,'Leaves for seasoning and for a steam against colds.'))},
 /*10*/{key:'normanspruce',name:'Norway spruce',habit:'conifer',H:[32,48],rb:[.6,1.0],crownR:[4,6],bk:0,bark:[0x7a5440,0x6a4a3a,0x86604a],leaf:PAL.conifer,item:'needle',
  form:{clear:.18,crown:'cone',step:1.7,droop:.45,L:1,buttress:.2,flutes:0,fluteA:0,top:'spire',moss:.5,drape:.15,curtain:true},
  tags:TG('cold','humid','no',HV('timber',['young tips'],true,'Tonewood; the tips for syrup.'))},
 /*11*/{key:'mountainmaple',name:'Mountain maple',habit:'broad',H:[18,28],rb:[.6,1.0],crownR:[8,11],bk:4,bark:[0x7a7064,0x6a6258,0x86806e],leaf:PAL.broad.map(c=>C(c).lerp(C(0x7a9a3a),.3).getHex()),item:'maple',
  form:{hB:.4,boughs:[5,7],el:[.45,.9],L:[.8,1.1],wig:.12,curve:-.06,moss:.6,drape:.3,bulbs:.12,clump:[3.6,5.2]},
  tags:TG('temperate','subhumid','no',HV('timber',['sap'],false,''))},
 /*12*/{key:'elderyew',name:'Elder yew',habit:'yew',H:[9,16],rb:[1.3,2.2],crownR:[7,10],bk:4,bark:[0x6a3a3a,0x5a3040,0x7a4446],leaf:PAL.yew,item:'needle',
  tags:TG('temperate','humid','no',HV('timber',['arils (not the seed)'],true,'Every part poisonous but the red aril; bows from the heartwood.'))},
 /*13*/{key:'spirespruce',name:'Spire spruce',habit:'conifer',H:[24,40],rb:[.4,.7],crownR:[1.8,3.0],bk:0,bark:[0x5a5048,0x4e463e,0x665c52],leaf:PAL.conifer.map(c=>C(c).multiplyScalar(.82).getHex()),item:'needle',
  form:{clear:.08,crown:'spire',step:1.3,droop:.55,L:1,buttress:0,flutes:0,fluteA:0,top:'spire',moss:.2,drape:0,lichen:.6},
  tags:TG('cold','subhumid','no',HV('timber',[],false,'The straight poles of every boreal lodge.'))},
 /*14*/{key:'frostfir',name:'Frost fir',habit:'conifer',H:[18,30],rb:[.35,.6],crownR:[1.8,2.8],bk:0,bark:[0x8a9090,0x7a8282,0x969c9c],leaf:PAL.coniferBlue,item:'needle',
  form:{clear:.05,crown:'spire',step:1.1,droop:.2,L:1,buttress:0,flutes:0,fluteA:0,top:'spire',moss:.1,drape:0,lichen:.7},
  tags:TG('cold','subhumid','no',HV('fuel',[],true,'Balsam from the bark blisters.'))},
 /*15*/{key:'larch',name:'Larch',habit:'conifer',H:[24,36],rb:[.5,.85],crownR:[4,6],bk:0,bark:[0x7a4a3a,0x6a4234,0x86564a],leaf:PAL.larch,item:'larch',
  form:{clear:.25,crown:'open',step:2.4,droop:.15,L:.95,buttress:0,flutes:0,fluteA:0,top:'spire',moss:.2,drape:0,lichen:.5,sparse:true},
  tags:TG('cold','subhumid','both',HV('timber',['gum'],false,'The gum is chewed; the wood takes no rot under water.'))},
 /*16*/{key:'birch',name:'Birch',habit:'birch',H:[14,24],rb:[.18,.32],crownR:[4,6],bk:3,bark:[0xf0f0ea,0xe8e8e2,0xf6f4ee],leaf:PAL.birch,item:'birch',
  tags:TG('cold','subhumid','both',HV('fuel',['sap'],true,'Sap in spring; the bark for boxes, canoes and tinder; chaga on the old trunks.'))},
 /*17*/{key:'cragpine',name:'Crag pine',habit:'pine',H:[14,28],rb:[.45,.8],crownR:[5,8],bk:6,bark:[0xc8784a,0xb86a40,0xd88a58],leaf:PAL.conifer.map(c=>C(c).lerp(C(0x3e6a4a),.4).getHex()),item:'needle',
  tags:TG('cold','subhumid','no',HV('timber',['inner bark'],true,'Pitch from the stumps; pine-bark bread in hard winters.'))},
 /*18*/{key:'burnsnag',name:'Burn snag',habit:'snag',H:[10,30],rb:[.3,.7],crownR:[1,2],bk:7,bark:[0x2a2624,0x3a3430,0xa8a49a],leaf:[],
  tags:TG('cold','subhumid','no',HV('fuel',[],false,'Standing dead wood: the best firewood on the mountain.'))},
 /*19*/{key:'windspruce',name:'Wind spruce',habit:'krumm',H:[2,6],rb:[.15,.35],crownR:[1.5,3],bk:0,bark:[0x5a4a40,0x4e4038,0x665448],leaf:PAL.conifer,item:'needle',
  tags:TG('cold','subhumid','no',HV('fuel',[],false,'Krummholz: centuries old at knee height.'))},
 /*20*/{key:'frosttrumpet',name:'Boreal trumpet',habit:'trumpet',H:[3,8],rb:[.4,.75],crownR:[1.2,2.2],bk:5,bark:[0x6a7a6e,0x5e6e64,0x76867a],leaf:[0x8ab0a0,0x9ac0aa,0x7aa092],ribs:14,frost:true,
  tags:TG('cold','subhumid','no',HV('none',['sap'],false,'Tapped in thaw: a sweet, faintly peppery sap.'))},
 /*21*/{key:'greyalder',name:'Grey alder',habit:'broad',H:[12,20],rb:[.25,.45],crownR:[5,7],bk:2,bark:[0x8a8c84,0x7e8078,0x9a9c94],leaf:PAL.broad.map(c=>C(c).multiplyScalar(.9).getHex()),item:'broad',
  form:{hB:.35,boughs:[4,6],el:[.7,1.15],L:[.7,1],wig:.12,curve:-.04,moss:.8,drape:.4,bulbs:.3,clump:[2.8,4],stems:[1,3]},
  tags:TG('temperate','humid','yes',HV('fuel',[],true,'Smoking wood; the bark dyes red and black.'))},
 /*22*/{key:'brookwillow',name:'Brook willow',habit:'willow',H:[5,10],rb:[.18,.35],crownR:[3.5,6],bk:4,bark:[0x6a6450,0x5e5848,0x766e5a],leaf:[0x7a9a50,0x8aaa58,0x6a8a48],item:'lance',
  tags:TG('temperate','humid','yes',HV('fuel',[],true,'Withies for baskets; the bark chewed for pain.'))},
 /*23*/{key:'rowan',name:'Rowan',habit:'broad',H:[6,12],rb:[.15,.3],crownR:[3,5],bk:2,bark:[0x8a8478,0x7e786c,0x969084],leaf:[0x5a8a34,0x6a9a3a,0x4e7a2e],item:'pinnate',
  form:{hB:.4,boughs:[4,6],el:[.75,1.1],L:[.7,1],wig:.1,curve:-.05,moss:.3,drape:0,bulbs:0,clump:[1.8,2.6],berries:true,stems:[1,3]},
  tags:TG('temperate','subhumid','no',HV('fuel',['berries (cooked)'],true,'Bitter raw; jelly and wine when cooked.'))},
];
NHL.SPECIES.forEach((S,i)=>{S.index=i;});
// THE UNDERSTOREY PLANTS, for the inspector and the tags (the items carry the label)
NHL.PLANTS=[
 {label:'Sword ferns',name:'Sword fern',tags:TG('temperate','humid','both',HV('none',['fiddleheads (cooked)'],false,''))},
 {label:'Lady ferns',name:'Lady fern',tags:TG('temperate','humid','both',HV('none',['fiddleheads (cooked)'],false,''))},
 {label:'Lace ferns',name:'Lace fern',tags:TG('temperate','humid','both',HV('none',[],true,'Alien: a recursive frond, brighter than any terrestrial green.'))},
 {label:'Bracken',name:'Bracken',tags:TG('temperate','subhumid','no',HV('none',[],false,'Bedding and thatch; poisonous to eat.'))},
 {label:'Moss',name:'Moss',tags:TG('temperate','humid','both',HV('none',[],true,'Wound dressing, bedding, caulking.'))},
 {label:'Moss cushions',name:'Moss cushions',tags:TG('temperate','humid','both',HV('none',[],false,''))},
 {label:'Hanging moss',name:'Hanging moss',tags:TG('temperate','humid','both',HV('none',[],false,'Bedding, tinder, padding.'))},
 {label:'Beard lichen',name:'Beard lichen',tags:TG('cold','subhumid','no',HV('none',[],true,'An old wound dressing.'))},
 {label:'Bell-bulbs',name:'Bell-bulb epiphyte',tags:TG('temperate','humid','both',HV('none',[],false,'Alien: glows faintly at night. Not edible.'))},
 {label:'Lantern pods',name:'Lantern pod epiphyte',tags:TG('temperate','humid','both',HV('none',[],false,'Alien: violet, glows at night.'))},
 {label:'Disc stalks',name:'Disc stalk',tags:TG('temperate','subhumid','both',HV('none',['disc pith'],false,'Alien: gold discs on tall stalks.'))},
 {label:'Red-stem fans',name:'Red-stem fan',tags:TG('temperate','humid','yes',HV('none',[],false,'Alien: pleated round fans on red stems, by the water.'))},
 {label:'Trumpet saplings',name:'Trumpet sapling',tags:TG('temperate','humid','both',HV('none',['young funnel'],false,''))},
 {label:'Bluebells',name:'Bluebells',tags:TG('temperate','humid','no',HV('none',[],false,'Poisonous.'))},
 {label:'Wood sorrel',name:'Wood sorrel',tags:TG('temperate','humid','no',HV('none',['leaves'],false,'Sour leaves.'))},
 {label:'Black grass',name:'Black mondo grass',tags:TG('temperate','humid','no',HV('none',[],false,''))},
 {label:'Smoke bush',name:'Smoke bush',tags:TG('temperate','subhumid','no',HV('none',[],false,'Dye.'))},
 {label:'Dark spurge',name:'Dark spurge',tags:TG('temperate','subhumid','no',HV('none',[],false,'Caustic sap.'))},
 {label:'Spikes',name:'Purple millet / fireweed spikes',tags:TG('temperate','subhumid','no',HV('none',['fireweed shoots'],false,''))},
 {label:'Teal aroids',name:'Teal aroid',tags:TG('temperate','humid','both',HV('none',[],false,''))},
 {label:'Zebra rosettes',name:'Zebra rosette',tags:TG('temperate','humid','no',HV('none',[],false,'Alien, rare.'))},
 {label:'Mountain cane',name:'Mountain cane',tags:TG('temperate','humid','both',HV('fuel',['shoots'],false,'Canes for arrows and frames.'))},
 {label:'Heath and bilberry',name:'Heath and bilberry',tags:TG('cold','subhumid','no',HV('none',['bilberries'],true,'Berries in late summer.'))},
 {label:'Reindeer lichen',name:'Reindeer lichen',tags:TG('cold','subhumid','no',HV('none',['(boiled, in famine)'],false,'Fodder.'))},
 {label:'Mushrooms',name:'Mushrooms',tags:TG('temperate','humid','no',HV('none',['some'],false,'Fly agaric among them: do not.'))},
 {label:'Grass',name:'Grass and sedge',tags:TG('temperate','subhumid','both',HV('none',[],false,''))},
 {label:'Wood shrubs',name:'Understorey shrubs',tags:TG('temperate','humid','no',HV('none',[],false,''))},
];

// ---------------------------------------------------------------- leaf and frond textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(500031);
const TX={},G2=BIO.tex.grey;
/* NEEDLES: dense short strokes in tufts -- spruce, fir, yew, pine */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<620;i++){const p=BIO.tex.clPt(S,.10,.72),a=rr(0,TAU),L=rr(14,28),lum=lerp(90,225,rng());
  g.strokeStyle=G2(lum);g.lineWidth=1.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[120,120,120]);
/* SPRAYS: flat scale-leaf sprays that droop -- the cedar's and the hemlock's (a frond card, pinned at x=0) */
TX.spray=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const y0=S/2;
 for(let k=0;k<3;k++){const off=(k-1)*S*.18;g.strokeStyle=G2(120);g.lineWidth=2.4;g.beginPath();g.moveTo(0,y0);g.quadraticCurveTo(S*.5,y0+off,S*.97,y0+off*1.6);g.stroke();
  for(let x=6;x<S*.95;x+=5){const t=x/S,yy=y0+off*(t<.5?t*2*.5:.5+(t-.5)*2*1.1),L=lerp(26,8,t)*rr(.8,1.1),lum=lerp(130,235,rng());
   g.strokeStyle=G2(lum);g.lineWidth=3;for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(x,yy);g.lineTo(x+L*.45,yy+sd*L);g.stroke();}}}},[130,130,130]);
/* MAPLE: palmate five-lobed leaves in sprays */
TX.maple=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.64);
 for(let i=0;i<70;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(105,236,i/70)+rr(-14,12),r=rr(16,26),a0=rr(0,TAU);
  g.fillStyle=G2(lum);g.beginPath();for(let k=0;k<=40;k++){const a=a0+k/40*TAU,lobe=.55+.45*Math.pow(Math.abs(Math.cos(a*2.5-a0*2.5)),.6);g.lineTo(c[0]+Math.cos(a)*r*lobe,c[1]+Math.sin(a)*r*lobe);}g.fill();
  g.strokeStyle=G2(lum*.72);g.lineWidth=1;for(let k=0;k<5;k++){const a=a0+k/5*TAU;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*r*.85,c[1]+Math.sin(a)*r*.85);g.stroke();}}},[150,150,150]);
/* BROAD: oval leaves in flat sprays -- beech, alder */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/64)+rr(-15,12),n=ri(4,7),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(30,48),rr(11,16),a0+(k-(n-1)/2)*.55,lum*rr(.9,1.05),true);}},[150,150,150]);
/* SMALL: dense little leaves -- the gnarled oak, the fog laurel */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);
 for(let i=0;i<420;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(95,230,rng());BIO.tex.leaf(g,c[0],c[1],rr(14,22),rr(5,8),rr(0,TAU),lum,false);}},[120,120,120]);
/* BIRCH: small loose triangular leaves, light through them */
TX.birch=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.66);
 for(let i=0;i<260;i++){const c=BIO.tex.clPt(S,.12,.74),lum=lerp(120,245,rng()),a=rr(0,TAU),r=rr(7,11);g.fillStyle=G2(lum);g.beginPath();
  g.moveTo(c[0]+Math.cos(a)*r*1.4,c[1]+Math.sin(a)*r*1.4);g.lineTo(c[0]+Math.cos(a+2.3)*r,c[1]+Math.sin(a+2.3)*r);g.lineTo(c[0]+Math.cos(a-2.3)*r,c[1]+Math.sin(a-2.3)*r);g.fill();}},[170,170,170]);
/* LARCH: soft rosettes of short needles */
TX.larch=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<300;i++){const c=BIO.tex.clPt(S,.11,.72),lum=lerp(140,245,rng());g.strokeStyle=G2(lum);g.lineWidth=1.3;
  for(let k=0;k<12;k++){const a=k/12*TAU+rr(-.2,.2),L=rr(6,10);g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*L,c[1]+Math.sin(a)*L);g.stroke();}}},[180,180,180]);
/* LANCE: narrow willow leaves */
TX.lance=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.1,.72),lum=lerp(120,240,i/110),n=ri(5,9),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(30,46),rr(3.5,5.5),a0+(k-(n-1)/2)*.42,lum*rr(.9,1.06),false);}},[160,160,160]);
/* PINNATE: rowan leaves (leaflet ladders) and their red berry clusters drawn in light grey (tinted per instance) */
TX.pinnate=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<80;i++){const c=BIO.tex.clPt(S,.1,.72),lum=lerp(110,236,i/80),a=rr(0,TAU),L=rr(36,52);g.strokeStyle=G2(lum*.7);g.lineWidth=1.4;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*L,c[1]+Math.sin(a)*L);g.stroke();
  for(let s=6;s<L;s+=6)for(let sd=-1;sd<=1;sd+=2)BIO.tex.leaf(g,c[0]+Math.cos(a)*s,c[1]+Math.sin(a)*s,rr(10,14),rr(3,4),a+sd*1.1,lum*rr(.9,1.05),false);}},[150,150,150]);
/* HANGING MOSS: stringy clumps along a strand (v=0 at the top) */
TX.drape=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){let x=rr(16,S-16),y=rr(0,S*.15);const lum=lerp(120,240,rng()),L=S*rr(.55,.98);g.strokeStyle=G2(lum);g.lineWidth=rr(2,4);g.beginPath();g.moveTo(x,y);
  while(y<L){x+=rr(-3,3);y+=rr(4,8);g.lineTo(x,y);}g.stroke();
  for(let j=0;j<8;j++){const yy=rr(0,L),xx=x+rr(-6,6);g.fillStyle=G2(lum*rr(.85,1.05));g.beginPath();g.ellipse(xx,yy,rr(3,7),rr(5,12),0,0,TAU);g.fill();}}},[150,150,150]);
/* BEARD LICHEN: fine pale strands (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<70;k++){let x=rr(10,S-10),y=0;const lum=lerp(160,250,rng()),L=S*rr(.4,.98);g.strokeStyle=G2(lum);g.lineWidth=rr(.8,1.6);g.beginPath();g.moveTo(x,y);
  while(y<L){x+=rr(-2.5,2.5);y+=rr(5,9);g.lineTo(x,y);}g.stroke();}},[180,180,180]);
/* FROND: a sword fern frond (pinned at x=0, arching along x) */
TX.frond=BIO.alphaTex(256,(g,S)=>{const y0=S/2;g.strokeStyle=G2(110);g.lineWidth=3;g.beginPath();g.moveTo(0,y0);g.lineTo(S,y0);g.stroke();
 for(let x=8;x<S-4;x+=6){const t=x/S,L=lerp(S*.36,S*.06,t)*(t<.1?t/.1:1);for(let sd=-1;sd<=1;sd+=2){g.fillStyle=G2(lerp(150,230,rng()));g.beginPath();g.moveTo(x,y0);g.quadraticCurveTo(x+L*.35,y0+sd*L*.6,x+L*.25,y0+sd*L);g.quadraticCurveTo(x+L*.05,y0+sd*L*.5,x+5,y0);g.fill();}}},[140,140,140]);
/* LADY FERN: twice-cut, lacy, lighter */
TX.lady=BIO.alphaTex(256,(g,S)=>{const y0=S/2;g.strokeStyle=G2(120);g.lineWidth=2.4;g.beginPath();g.moveTo(0,y0);g.lineTo(S,y0);g.stroke();g.lineWidth=1.3;
 for(let x=8;x<S-4;x+=7){const t=x/S,L=lerp(S*.34,S*.05,Math.abs(t-.35)*1.4)*(t<.08?t/.08:1);
  for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=G2(lerp(150,230,rng()));g.beginPath();g.moveTo(x,y0);g.lineTo(x+L*.3,y0+sd*L);g.stroke();
   for(let s=.15;s<1;s+=.14){const px=x+L*.3*s,py=y0+sd*L*s,l=L*.22*(1-s*.6);g.fillStyle=G2(lerp(160,240,rng()));g.beginPath();g.ellipse(px+l*.3,py,l*.5,l*.22,sd*.4,0,TAU);g.fill();}}}},[150,150,150]);
/* LACE FERN: the alien one -- a frond that branches into fronds that branch again, every tip a little rounded lobe */
TX.lace=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 function br(x,y,a,L,d){const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=G2(lerp(150,215,d/3));g.lineWidth=Math.max(.8,3-d*.8);g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(d>=3){g.fillStyle=G2(rr(200,250));for(let k=0;k<3;k++){g.beginPath();g.arc(ex+rr(-2,2),ey+rr(-2,2),rr(2.2,3.6),0,TAU);g.fill();}return;}
  const n=d===0?7:4;for(let k=1;k<=n;k++){const t=k/(n+1),px=x+Math.cos(a)*L*t,py=y+Math.sin(a)*L*t;for(let sd=-1;sd<=1;sd+=2)br(px,py,a+sd*rr(.75,1.05),L*lerp(.42,.2,t)*(d===0?1:.85),d+1);}
  br(ex,ey,a+rr(-.2,.2),L*.3,d+1);}
 br(2,S/2,0,S*.62,0);},[150,150,150]);
/* BRACKEN: a triangular, horizontal frond, seen from above (flat card) */
TX.bracken=BIO.alphaTex(256,(g,S)=>{const c=S/2;g.strokeStyle=G2(130);g.lineWidth=2.5;
 for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*S*.46,c+Math.sin(a)*S*.46);g.stroke();
  for(let s=.1;s<.95;s+=.07){const px=c+Math.cos(a)*S*.46*s,py=c+Math.sin(a)*S*.46*s,L=S*.13*(1-s*.75);for(let sd=-1;sd<=1;sd+=2){g.fillStyle=G2(lerp(140,230,rng()));g.beginPath();g.ellipse(px+Math.cos(a+sd*1.3)*L*.5,py+Math.sin(a+sd*1.3)*L*.5,L*.5,L*.16,a+sd*1.3,0,TAU);g.fill();}}}},[140,140,140]);
/* BLADES: grass and black mondo grass (vertical tuft card, base at the bottom) */
TX.blade=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<70;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.75,.75),L=S*rr(.5,.95),lum=lerp(110,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.5,3.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*.9+(a+Math.PI/2)*30,S+Math.sin(a)*L);g.stroke();}},[140,140,140]);
/* SPIKE: a bloom spike on a leafy base -- fireweed, purple millet, bluebells (vertical card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.lineCap='round';
 for(let k=0;k<5;k++){const x0=cx+rr(-30,30),top=S*rr(.08,.3);g.strokeStyle=G2(100);g.lineWidth=2;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,top);g.stroke();
  for(let y=top;y<top+S*.4;y+=5){g.fillStyle=G2(rr(190,250));g.beginPath();g.ellipse(x0+rr(-5,5),y,rr(4,7),rr(3,5),0,0,TAU);g.fill();}}},[150,150,150]);
/* BELL: bluebells -- arching stems of nodding bells, one side (vertical card) */
TX.bell=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<7;k++){const x0=S*.5+rr(-40,40),h=S*rr(.5,.9);g.strokeStyle=G2(120);g.lineWidth=2;g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0,S-h,x0+h*.35,S-h*.85);g.stroke();
  for(let j=0;j<7;j++){const t=.35+j*.09,x=x0+h*.35*t*t,y=S-h*(.2+.65*t);g.fillStyle=G2(rr(200,250));g.beginPath();g.moveTo(x-4,y);g.lineTo(x+4,y);g.lineTo(x+6,y+13);g.lineTo(x-6,y+13);g.closePath();g.fill();}}},[160,160,160]);
/* HEATH: bilberry and ling, dense little twigs (vertical tuft card) */
TX.heath=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let i=0;i<500;i++){const x=S/2+rr(-1,1)*S*.45*Math.sqrt(rng()),y=S-rr(0,S*.85)*(1-Math.abs(x-S/2)/(S*.6)),lum=lerp(90,220,rng());g.fillStyle=G2(lum);g.beginPath();g.ellipse(x,y,rr(2,4),rr(1.5,3),rr(0,TAU),0,TAU);g.fill();}},[110,110,110]);
/* UNDER: understorey leaves (a flat clump card) -- sorrel, shrubs */
TX.under=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,6,.6);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.12,.72),lum=lerp(110,235,i/70);for(let k=0;k<3;k++){const a=p[2]+k*TAU/3;g.fillStyle=G2(lum*rr(.9,1.05));g.beginPath();g.moveTo(p[0],p[1]);g.arc(p[0]+Math.cos(a)*7,p[1]+Math.sin(a)*7,7,a-1.6,a+1.6);g.fill();}}},[140,140,140]);
/* PADDLE: one great dark leaf (the teal aroid), base at the bottom */
TX.paddle=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=G2(190);g.beginPath();g.moveTo(cx,S);g.bezierCurveTo(cx-S*.44,S*.7,cx-S*.36,S*.08,cx,0);g.bezierCurveTo(cx+S*.36,S*.08,cx+S*.44,S*.7,cx,S);g.fill();
 g.strokeStyle=G2(235);g.lineWidth=3;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,6);g.stroke();for(let y=20;y<S;y+=14){g.lineWidth=1.4;for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sd*S*.2,y-10,cx+sd*S*.38,y-26);g.stroke();}}},[150,150,150]);
/* ZEBRA: striped blades, base at the bottom */
TX.zebra=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<6;k++){const x0=S/2+(k-2.5)*14,a=(k-2.5)*.16,w=13;g.save();g.translate(x0,S);g.rotate(a);
  g.fillStyle=G2(240);g.beginPath();g.moveTo(-w,0);g.quadraticCurveTo(-w*1.1,-S*.5,0,-S*.88);g.quadraticCurveTo(w*1.1,-S*.5,w,0);g.fill();
  g.globalCompositeOperation='source-atop';g.fillStyle=G2(40);for(let y=-8;y>-S*.88;y-=13)g.fillRect(-w*1.2,y,w*2.4,6);g.globalCompositeOperation='source-over';g.restore();}},[140,140,140]);
/* MOSS MAT */
TX.moss=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<1600;i++){const a=rr(0,TAU),r=S*.48*Math.sqrt(rng()),x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r;g.fillStyle=G2(lerp(110,235,rng()));g.beginPath();g.arc(x,y,rr(2,5),0,TAU);g.fill();}},[120,120,120]);
/* FIN: the fine fins of a trumpet's fringe (a frond card) */
TX.fin=BIO.alphaTex(128,(g,S)=>{const y0=S/2;g.fillStyle=G2(220);g.beginPath();g.moveTo(0,y0-S*.12);g.quadraticCurveTo(S*.6,y0-S*.3,S,y0);g.quadraticCurveTo(S*.6,y0+S*.3,0,y0+S*.12);g.fill();
 g.strokeStyle=G2(150);g.lineWidth=1.4;for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(0,y0+k*2);g.lineTo(S*.95,y0+k*S*.035);g.stroke();}},[200,200,200]);
/* GLOW: a soft round halo (night only) */
TX.glow=(function(){const Sz=64,c=document.createElement('canvas');c.width=c.height=Sz;const g=c.getContext('2d'),gr=g.createRadialGradient(Sz/2,Sz/2,0,Sz/2,Sz/2,Sz/2);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,Sz,Sz);
 const t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;return t;})();
NHL.TX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders. Kinds:
//  0 PLATED: scaly plates (spruce, fir, larch)       1 FIBROUS: long red shreds (cedar, hemlock)
//  2 SMOOTH: pale, faint rings (beech, alder, rowan) 3 BIRCH: white with black lenticels and scars
//  4 FURROWED: deep ridges (oak, maple, laurel, yew) 5 RIBBED + jointed (the trumpets)
//  6 PINE: orange flakes above, plates below          7 CHARRED: black alligator checks, silver where weathered
NHL.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0||kind===6){for(let i=0;i<340;i++){const x=rng()*w,y=rng()*h,l=rng()<.5?rr(98,128):rr(150,190),pw=rr(10,26),ph=rr(8,18);g.fillStyle='rgba('+(l|0)+','+(l|0)+','+(l|0)+',.8)';g.beginPath();
   for(let k=0;k<6;k++){const a=k/6*TAU;g.lineTo(x+Math.cos(a)*pw*rr(.8,1.1),y+Math.sin(a)*ph*rr(.8,1.1));}g.closePath();g.fill();
   g.strokeStyle='rgba(50,50,50,.5)';g.lineWidth=1.2;g.stroke();}}
 else if(kind===1){for(let i=0;i<320;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'60,60,60':'175,175,175')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2.5);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-12,12),h*.33,x+rr(-12,12),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===2){for(let k=0;k<30;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'125,125,125':'165,165,165')+',.30)';g.fillRect(0,y,w,rr(2,12));}
  for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(90,90,90,'+(.25+rng()*.3).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(6,18),rr(2,5),0,0,TAU);g.fill();}}
 else if(kind===3){g.fillStyle='#e0e0e0';g.fillRect(0,0,w,h);
  for(let i=0;i<160;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(30,30,30,'+(.5+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(8,30),rr(1.5,3.5));}
  for(let i=0;i<22;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(40,40,40,.85)';g.beginPath();g.moveTo(x-rr(10,20),y);g.quadraticCurveTo(x,y-rr(8,16),x+rr(10,20),y);g.quadraticCurveTo(x,y+rr(4,10),x-rr(10,20),y);g.fill();}}
 else if(kind===4){for(let i=0;i<180;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.6?'50,50,50':'170,170,170')+','+(.35+rng()*.4).toFixed(2)+')';g.lineWidth=rr(3,8);g.beginPath();g.moveTo(x,-10);
   let xx=x;for(let y=0;y<=h+10;y+=24){xx+=rr(-7,7);g.lineTo(xx,y);}g.stroke();}
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba(55,55,55,.5)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-10,10),y+rr(2,6));g.stroke();}}
 else if(kind===5){for(let i=0;i<110;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'165,165,165')+',.45)';g.lineWidth=rr(1.5,3.5);g.beginPath();g.moveTo(x,-4);g.lineTo(x+rr(-3,3),h+4);g.stroke();}
  for(let y=24;y<h;y+=72){g.fillStyle='rgba(50,50,50,.7)';g.fillRect(0,y,w,5);g.fillStyle='rgba(190,190,190,.55)';g.fillRect(0,y+5,w,3);}}
 else{g.fillStyle='#4a4a4a';g.fillRect(0,0,w,h);for(let j=0;j<h/14;j++)for(let i=0;i<w/18;i++){const x=i*18+(j%2?9:0)+rr(-2,2),y=j*14+rr(-2,2),l=rr(30,80);g.fillStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.fillRect(x+1.5,y+1.5,15,11);}
  for(let i=0;i<40;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(200,200,200,.55)';g.fillRect(x,y,rr(10,40),rr(20,90));}}
 if(kind===6){const id=g.getImageData(0,0,w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=id.data[i];id.data[i]=id.data[i+1]=id.data[i+2]=clamp(v+12*Math.sin(x*.3+y*.07),0,255);}g.putImageData(id,0,0);}
});};
NHL.BARKTEX=[0,1,2,3,4,5,6,7].map(k=>NHL.barkTex(k));
NHL.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=120+(fbm(x/30,y/6,7,3)-.5)*70+(h3(x,y,3)-.5)*14;d[i]=v;d[i+1]=v*.94;d[i+2]=v*.86;d[i+3]=255;}g.putImageData(id,0,0);});
NHL.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=120+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*26,lic=smooth(.62,.7,fbm(x/12,y/12,6,2));
  d[i]=v*(1-.1*lic);d[i+1]=v*(1+.08*lic);d[i+2]=v*(.98-.12*lic);d[i+3]=255;}g.putImageData(id,0,0);});
/* a mossy skin for cushions and mounds (colour texture, tinted per instance) */
NHL.MOSSTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=150+(fbm(x/7,y/7,4,2)-.5)*90+(h3(x,y,8)-.5)*40;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
G.card=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
const vc=(g,cfn)=>{g=g.index?g.toNonIndexed():g;const p=g.attributes.position,col=[];for(let i=0;i<p.count;i++){const c=cfn(p.getX(i),p.getY(i),p.getZ(i));col.push(c[0],c[1],c[2]);}g.setAttribute('color',new T3.Float32BufferAttribute(col,3));return g;};
// a BELL-BULB: a thread and a pale teardrop bulb, hung from y=0 down to y=-1 (vertex-coloured: the thread dark)
G.bulb=function(){const thread=new T3.CylinderGeometry(.01,.01,.55,3,1,true).translate(0,-.275,0).toNonIndexed();
 const bulb=new T3.SphereGeometry(.17,6,4);const p=bulb.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),k=y<0?1+(-y/.17)*.15:1-.35*(y/.17);p.setXYZ(i,p.getX(i)*k,y*1.5,p.getZ(i)*k);}
 bulb.translate(0,-.76,0);const b2=bulb.toNonIndexed();
 const pos=[],nor=[],uv=[],col=[];[[thread,.25],[b2,1]].forEach(e=>{const a=e[0].attributes.position.array,n=e[0].attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);const sh=e[1]===1?lerp(.82,1.08,clamp((-a[i+1]-.6)/.3,0,1)):e[1];col.push(sh,sh,sh);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a LANTERN POD: a papery five-ribbed calyx hung from y=0 to y=-1 (the physalis reference)
G.lantern=function(){const pts=[];for(let i=0;i<=5;i++){const t=i/5;pts.push(new T3.Vector2(Math.max(.01,Math.sin(t*Math.PI)*.34*(1-.25*t)),-.12-t*.86));}
 const g=new T3.LatheGeometry(pts,10).toNonIndexed(),p=g.attributes.position;   // ten segments: two to each of the five ribs
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.22*Math.cos(5*a);p.setXYZ(i,x*k,p.getY(i),z*k);}
 g.computeVertexNormals();const thread=new T3.CylinderGeometry(.012,.012,.14,3,1,true).translate(0,-.07,0).toNonIndexed();
 const pos=[],nor=[],uv=[],col=[];[[thread,.3],[g,1]].forEach(e=>{const a=e[0].attributes.position.array,n=e[0].attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);
  const x=a[i],z=a[i+2],rib=e[1]===1?.82+.18*Math.cos(5*Math.atan2(z,x)):e[1];col.push(rib,rib,rib);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a DISC: the disc stalk's head -- a shallow ribbed dish with a boss, unit radius, face up, vertex-coloured (the rim paler, the ribs dark)
G.disc=function(){const pos=[],nor=[],uv=[],col=[];const n=18;
 for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,rib=k%2;
  const P=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  const A=P(0,0,.06),B=P(a0,1,.16+(rib?.03:0)),Cc=P(a1,1,.16+(rib?0:.03)),M0=P(a0,.5,.08),M1=P(a1,.5,.08);
  const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(c[0],c[1],c[2]);};
  const cc=rib?[.78,.72,.6]:[1,1,1],cr=[1.18,1.12,.95],cb=[.6,.48,.32];
  push(A,cb);push(M1,cc);push(M0,cc);push(M0,cc);push(M1,cc);push(Cc,cr);push(M0,cc);push(Cc,cr);push(B,cr);}
 return BIO.geo._make(pos,nor,uv,col);};
// a PLEAT FAN: a round pleated fan (the red-stem fan's leaf), unit radius in the xz plane, the pleats radial, red at the heart
G.pleat=function(){const pos=[],nor=[],uv=[],col=[];const n=22;
 for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,up=k%2?.07:-.04,dn=k%2?-.04:.07;
  const P=(a,r,y)=>[Math.cos(a)*r,y+r*r*.12,Math.sin(a)*r];const O=[0,0,0],B=P(a0,1,up),Cc=P(a1,1,dn),M=P((a0+a1)/2,.55,(up+dn)/2);
  const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(c[0],c[1],c[2]);};
  const red=[1.35,.42,.48],g1=[1,1,1],g2=[.84,.9,.84];push(O,red);push(M,k%2?g1:g2);push(B,k%2?g1:g2);push(O,red);push(Cc,k%2?g2:g1);push(M,k%2?g1:g2);}
 return BIO.geo._make(pos,nor,uv,col);};
// a CUSHION: a lumpy dome, origin at the centre (moss mounds, smoke bush, yew domes)
G.cushion=function(){const g=new T3.SphereGeometry(1,8,5,0,TAU,0,Math.PI*.62).toNonIndexed(),p=g.attributes.position,col=[];
 const lump=(x,y,z)=>1+.08*Math.sin(x*5.1+z*3.3)*Math.cos(y*4.7+x*1.9)+.05*Math.sin(z*7.3-y*5.2);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=lump(x,y,z);p.setXYZ(i,x*k,y*k,z*k);const ao=lerp(.45,1.1,smooth(-.8,.7,y));col.push(ao,ao,ao);}
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;};
// a BOULDER: a displaced icosphere, flat-ish bottom, origin at the base
G.boulder=function(seed){const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.22*(fbm(x*1.3+seed,y*1.3,z*1.3,2)-.5)*2+.08*Math.sin(x*6+seed);p.setXYZ(i,x*k,Math.max(-.25,y*k*.78)+.25,z*k);}
 const ng=g.toNonIndexed();ng.computeVertexNormals();return ng;};
// a MUSHROOM: pale stem, cap takes the colour (vertex-coloured), origin at the base, 1 high
G.mushroom=function(){const pos=[],nor=[],uv=[],col=[];
 const add=(g,c)=>{g=g.toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);col.push(c,c,c);}};
 add(new T3.CylinderGeometry(.09,.12,.75,5,1,true).translate(0,.375,0),1.6);add(new T3.SphereGeometry(.42,7,3,0,TAU,0,Math.PI*.5).scale(1,.62,1).translate(0,.72,0),1);
 return BIO.geo._make(pos,nor,uv,col);};
G.berry=function(){return new T3.OctahedronGeometry(1,0);};
// a ROD: an open-ended pentagonal cylinder along y, centred (for BIO.beam): twigs, stalks, stems -- ten triangles, not twenty-four
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
NHL.G=G;

// ---------------------------------------------------------------- an iridescent bark (shared hook; the Rift kit's)
BIO.iridBarkMat=BIO.iridBarkMat||function(tex,key,colA,colB){const m=BIO.barkMat(tex);
 const A=colA||[0.78,1.18,0.92],B=colB||[1.45,0.82,0.74];
 m.onBeforeCompile=sh=>{sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvIWP=(modelMatrix*vec4(transformed,1.0)).xyz;vIWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 V=normalize(cameraPosition-vIWP);vec3 N=normalize(vIWN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.5+0.5*sin(dot(vIWP,vec3(0.21,0.37,0.29))+uWindT*0.35);float k=smoothstep(0.12,0.82,fr*0.85+sh*0.3);'+
    'diffuseColor.rgb*=mix(vec3('+A.map(v=>v.toFixed(3)).join(',')+'),vec3('+B.map(v=>v.toFixed(3)).join(',')+'),k);}');};
 const ck='bioiridbark|'+BIO.kitKey(key||'x');m.customProgramCacheKey=function(){return ck;};BIO._tickWind();return m;};

// ---------------------------------------------------------------- materials
// the bark buckets: one per texture kind; the trumpets' bucket shimmers (the Rift's iridescent bark)
const M=NHL.MAT={
 needle:BIO.leafMat(TX.needle,'nh-needle',{aN:true,swayW:'1.0',swayA:.05}),
 spray:BIO.leafMat(TX.spray,'nh-spray',{swayW:'(position.x)',swayA:.10}),
 maple:BIO.leafMat(TX.maple,'nh-maple',{aN:true,swayW:'1.0',swayA:.10}),
 broad:BIO.leafMat(TX.broad,'nh-broad',{aN:true,swayW:'1.0',swayA:.10}),
 small:BIO.leafMat(TX.small,'nh-small',{aN:true,swayW:'1.0',swayA:.07}),
 birch:BIO.leafMat(TX.birch,'nh-birch',{aN:true,swayW:'1.0',swayA:.14}),
 larch:BIO.leafMat(TX.larch,'nh-larch',{aN:true,swayW:'1.0',swayA:.10}),
 lance:BIO.leafMat(TX.lance,'nh-lance',{aN:true,swayW:'1.0',swayA:.12}),
 pinnate:BIO.leafMat(TX.pinnate,'nh-pinnate',{aN:true,swayW:'1.0',swayA:.10}),
 drape:BIO.leafMat(TX.drape,'nh-drape',{swayW:'(-position.y)',swayA:.06,axis:1,alphaTest:.35}),
 beard:BIO.leafMat(TX.beard,'nh-beard',{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.35}),
 frond:BIO.leafMat(TX.frond,'nh-frond',{swayW:'(position.x)',swayA:.07}),
 lady:BIO.leafMat(TX.lady,'nh-lady',{swayW:'(position.x)',swayA:.08}),
 lace:BIO.leafMat(TX.lace,'nh-lace',{irid:true,swayW:'(position.x)',swayA:.08,alphaTest:.38}),
 bracken:BIO.leafMat(TX.bracken,'nh-bracken',{swayW:'1.0',swayA:.04}),
 blade:BIO.leafMat(TX.blade,'nh-blade',{swayW:'(position.y)',swayA:.10,alphaTest:.4}),
 spike:BIO.leafMat(TX.spike,'nh-spike',{swayW:'(position.y)',swayA:.08,alphaTest:.38}),
 bell:BIO.leafMat(TX.bell,'nh-bell',{swayW:'(position.y)',swayA:.06,alphaTest:.38}),
 heath:BIO.leafMat(TX.heath,'nh-heath',{swayW:'(position.y)',swayA:.03,alphaTest:.4}),
 under:BIO.leafMat(TX.under,'nh-under',{swayW:'1.0',swayA:.05}),
 paddle:BIO.leafMat(TX.paddle,'nh-paddle',{aN:true,swayW:'(position.y)',swayA:.05,alphaTest:.45}),
 zebra:BIO.leafMat(TX.zebra,'nh-zebra',{swayW:'(position.y)',swayA:.02,alphaTest:.42}),
 moss:BIO.leafMat(TX.moss,'nh-moss',{swayW:'1.0',swayA:.01,alphaTest:.3}),
 fin:BIO.leafMat(TX.fin,'nh-fin',{aN:true,irid:true,swayW:'(position.x)',swayA:.05,alphaTest:.4}),
 cushion:new T3.MeshLambertMaterial({map:NHL.MOSSTEX,vertexColors:true}),
 vcol:BIO.leafMat(null,'nh-vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'nh-vsway',{swayW:'(position.y)',swayA:.03,alphaTest:0,vertexColors:true}),
 rock:BIO.solidMat(NHL.ROCKTEX),
 solid:BIO.solidMat(null,0xffffff),
 // THE GLOW. Lambert with an emissive the host's night raises (NHL.setNight). In daylight the
 // bulbs are barely lit from within; at night they are the understorey's light. The halo is
 // additive, small and dim (the nwlowlands lesson: at full strength it reads as fog), and only
 // drawn at night.
 bulb:new T3.MeshLambertMaterial({color:0xffffff,vertexColors:true,emissive:0xffb766,emissiveIntensity:.05,side:T3.DoubleSide}),
 pod:new T3.MeshLambertMaterial({color:0xffffff,vertexColors:true,emissive:0xa060ff,emissiveIntensity:.04,side:T3.DoubleSide}),
 halo:new T3.MeshBasicMaterial({map:TX.glow,color:0xffd8a0,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide,fog:false}),
 haloV:new T3.MeshBasicMaterial({map:TX.glow,color:0xc090ff,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide,fog:false}),
};
M.halo.visible=M.haloV.visible=false;
// the bulbs sway on their threads like the pods of the core
[M.bulb,M.pod].forEach((m,i)=>{m.onBeforeCompile=sh=>{sh.uniforms.uWindT=BIO.WIND.t;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;')
 .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n{float ph=dot(instanceMatrix[3].xyz,vec3(.13,.07,.11));transformed.x+=-position.y*.05*sin(uWindT*1.1+ph);transformed.z+=-position.y*.05*cos(uWindT*.8+ph*1.3);}\n#endif');};
 const ck=BIO.kitKey('nh-glow'+i);m.customProgramCacheKey=()=>ck;});
NHL._glowMaterials=[M.bulb,M.pod];
NHL._night=0;
NHL.setNight=function(k){k=clamp(+k||0,0,1);NHL._night=k;
 M.bulb.emissiveIntensity=lerp(.05,1.35,k);M.pod.emissiveIntensity=lerp(.04,1.5,k);
 M.halo.opacity=.20*k;M.haloV.opacity=.18*k;M.halo.visible=M.haloV.visible=k>0;
 return{bulb:M.bulb.emissiveIntensity,pod:M.pod.emissiveIntensity,halo:M.halo.opacity};};
const BK=['Plated bark','Fibrous bark','Smooth bark','Birch bark','Furrowed bark','Trumpet stalks','Pine bark','Charred snags'];
BK.forEach((lab,i)=>{if(i===5)return;BIO.bucket('nbark'+i,BIO.barkMat(NHL.BARKTEX[i]),{label:lab,uvScale:[i===3?3:4,i===3?4:6]});});
// the trumpets: stalk bark into a funnel of leaf, a green that goes violet-blue at grazing angles
BIO.bucket('nbark5',BIO.iridBarkMat(NHL.BARKTEX[5],'nh-trumpet',[1.0,1.06,0.94],[0.92,0.86,1.22]),{label:'Trumpet stalks and funnels',uvScale:[3,5]});
// the funnels: leaf, not bark. Lit like a leaf card (the core's foliage hook: the normal bent toward the sky,
// the back face lit through), so a funnel seen from below glows pale green as a thin leaf does, never the
// black of an opaque cone in its own shadow
BIO.bucket('nfunnel',BIO.leafMat(NHL.BARKTEX[5],'nh-funnel',{vertexColors:true,swayW:'0.0',swayA:0,alphaTest:0}),{label:'Trumpet funnels',uvScale:[3,5]});
BIO.bucket('nwood',BIO.barkMat(NHL.WOODTEX),{label:'Fallen wood',uvScale:[3,4]});
BIO.bucket('nrock',BIO.barkMat(NHL.ROCKTEX),{label:'Boulders',uvScale:[6,6]});
BIO.bucket('nfar',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Conifer needles'});
BIO.def('spray',BIO.geo.frond(3),M.spray,{label:'Cedar and hemlock sprays'});
BIO.def('maple',BIO.geo.clump(),M.maple,{attrs:['aN'],label:'Maple leaves'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN'],label:'Broadleaf canopy'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Oak and laurel leaves'});
BIO.def('birch',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Birch leaves'});
BIO.def('larch',BIO.geo.clump(),M.larch,{attrs:['aN'],label:'Larch needles'});
BIO.def('lance',BIO.geo.clump(),M.lance,{attrs:['aN'],label:'Willow leaves'});
BIO.def('pinnate',BIO.geo.clump(),M.pinnate,{attrs:['aN'],label:'Rowan leaves'});
BIO.def('drape',BIO.geo.ribbon(4,.7,.14),M.drape,{label:'Hanging moss'});
BIO.def('beard',BIO.geo.ribbon(4,.55,.10),M.beard,{label:'Beard lichen'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Sword ferns'});
BIO.def('lady',BIO.geo.frond(3),M.lady,{label:'Lady ferns'});
BIO.def('lace',BIO.geo.frond(3),M.lace,{attrs:['aC2'],label:'Lace ferns'});
BIO.def('bracken',G.flat(),M.bracken,{label:'Bracken'});
BIO.def('blade',G.tuft(),M.blade,{label:'Grass'});
BIO.def('mondo',G.tuft(),M.blade,{label:'Black grass'});
BIO.def('spike',G.tuft(),M.spike,{label:'Spikes'});
BIO.def('bell',G.tuft(),M.bell,{label:'Bluebells'});
BIO.def('heath',G.tuft(),M.heath,{label:'Heath and bilberry'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Wood shrubs'});
BIO.def('sorrel',G.flat(),M.under,{label:'Wood sorrel'});
BIO.def('paddle',G.card(),M.paddle,{attrs:['aN'],label:'Teal aroids'});
BIO.def('zebra',G.tuft(),M.zebra,{label:'Zebra rosettes'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('cushion',G.cushion(),M.cushion,{label:'Moss cushions'});
BIO.def('smoke',G.cushion(),M.cushion,{label:'Smoke bush'});
BIO.def('spurge',G.tuft(),M.heath,{label:'Dark spurge'});
BIO.def('fin',BIO.geo.frond(2),M.fin,{attrs:['aN','aC2'],label:'Trumpet fringes'});
BIO.def('bulb',G.bulb(),M.bulb,{label:'Bell-bulbs'});
BIO.def('lantern',G.lantern(),M.pod,{label:'Lantern pods'});
BIO.def('halo',BIO.geo.bloom(),M.halo,{label:'Bulb glow'});
BIO.def('haloV',BIO.geo.bloom(),M.haloV,{label:'Pod glow'});
BIO.def('disc',G.disc(),M.vcol,{label:'Disc stalks'});
BIO.def('pleat',G.pleat(),M.vsway,{label:'Red-stem fans'});
BIO.def('boulderA',G.boulder(1.3),M.rock,{label:'Boulders'});
BIO.def('boulderB',G.boulder(4.7),M.rock,{label:'Boulders'});
BIO.def('mushroom',G.mushroom(),M.vcol,{label:'Mushrooms'});
BIO.def('berry',G.berry(),M.solid,{label:'Berries'});
BIO.def('rod',G.rod(),M.solid,{label:'Twigs and stems'});
BIO.def('trunk',BIO.geo.trunk(7),BIO.solidMat(NHL.BARKTEX[0]),{label:'Saplings'});
BIO.def('cane',G.rod(),M.solid,{label:'Mountain cane'});
})();
