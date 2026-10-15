// ================================================================= RING SEA ISLES — species (data)
// The islands of the Ring Sea at the sea's level (~1.9 atm, 27-39 degC annual means, 550-4,000 mm of rain): the isle
// demo's archipelago (settlements/isle-demo/PLAN.md, section 2). One kit for every class the isles' land carries, its
// zones chosen by the scale model's climate class (BIO.field('koppen:Aw') and its siblings, soft weights that sum to 1
// on land; WORLD.md, "Koppen as fields"), the first kit to place by class. Trees are at an island's scale (canopy
// 10-35 m, savanna trees 6-20 m, baobabs 25-40 m), never the hyperjungle's giants.
//
// What exists elsewhere is GROWN IN PLACE, by its own kit's builder (BORROW below: the kit's make/grow or treeAt), never
// copied: the Throne's isle and savanna trees, swbay's umbrella thorn and baobab, eastabyss's fan palm and back-mangroves,
// sedesert's bottle tree. What nothing drew is this kit's own (SPECIES, PLANTS): the thorn scrub, corkwood, salt cedar,
// strand pandanus, sea grape, the island crops; warm steppe bunchgrass, the burn mosaic's grass, the salt pan's
// halophytes, the beach creeper, naupaka, beach grass, wrack, seagrass, coral heads, the reef flat and its tide pools.
// Everything here is DATA (no drawing, no placement). Tags follow the project rule (climate / aridity / abyssal /
// riparian / Koppen) plus origin and zone, and harvest (biomes/FRUIT.md).
BIO.kit('ringisles');   // this kit's own registry of items and buckets (core/biome: kits)
var RINGISLES={};
(function(){
RINGISLES.TAGS={climate:'tropic..hypertropic',aridity:'arid..humid',abyssal:true,riparian:'both',koppen:['XA','Af','Am','Aw','XV','BSh','XS']};
// the classes of the isle demo's land, by area (the assay of scale model 4.21: km2 of land in the polygon)
RINGISLES.KOPPEN={XA:2588,Af:2012,Am:588,Aw:1780,XV:1564,BSh:784,XS:648};
RINGISLES.CLASSES=['XA','Af','Am','Aw','XV','BSh','XS'];
RINGISLES.ZONES=['forest','savanna','steppe','salt','strand','mangal','lagoon','reef','bench','thermal','garden'];

// ---------------------------------------------------------------- palettes (sRGB hex; bark a stop dark)
RINGISLES.PAL={
 thornLeaf:[0x6a7a3a,0x74843e,0x5e6e34,0x808a44],thornBark:[0x5a4a3a,0x4e4034,0x66543e],thornDry:[0x9a8a4a,0x8a7a44,0xa8964e],
 corkBark:[0x7a8a5a,0x8a8a5e,0x9a8a62,0x6e7e52],corkPeel:[0xb0a070,0xc0a878,0xa89062],corkLeaf:[0x5e7a3a,0x6a8640,0x52702e],
 tamLeaf:[0x7a8a74,0x86947c,0x6e8068,0x8e9a80],tamBloom:[0xe0a0b4,0xd890a8,0xe8b4c4],tamBark:[0x5a4a44,0x4e403a,0x66564e],
 pandanLeaf:[0x5a7a36,0x668440,0x4e7030,0x72883e],pandanBark:[0x7a6a52,0x6e5e48,0x86765c],pandanFruit:[0xe08a2a,0xd87a22,0xc86a1e,0x9aa040],
 grapeLeaf:[0x4e7a34,0x5a863a,0x6a8a3a,0x3e6a2e],grapeVein:[0xb8402a,0xa83a28],grapeBark:[0x6a5a4a,0x5e5040,0x76664e],grapeFruit:[0x6a2a5a,0x7a3a6a,0x5a8a3a],
 breadLeaf:[0x3e6a2a,0x4a7630,0x346026],breadBark:[0x6a6a5a,0x5e5e50,0x767462],breadFruit:[0x9ab43e,0xa8bc48,0x8aa436],
 bananaLeaf:[0x5e8a34,0x6a963a,0x52802e,0x78a040],bananaStem:[0x6a7a3a,0x7a8a44,0x5e6e34],bananaDead:[0x8a7444,0x7a6a3e],bananaBunch:[0x8aa43a,0x9ab040],
 grassGreen:[0x6a8a34,0x76963a,0x5e7e2e,0x84a042],grassFlush:[0x7aa83a,0x88b444,0x6e9c32],grassCured:[0xc8b070,0xbca266,0xd4bc7c,0xb09860],
 grassBlack:[0x24201c,0x2e2a24,0x1a1816],grassXV:[0xb0a058,0xa4945a,0xbaa864,0x96884e],
 bunch:[0xb8a870,0xa8986a,0xc4b47c,0x9a8c5e],bunchGreen:[0x7a8a4a,0x86964e],
 thornbush:[0x6a7a3a,0x5e6e34,0x76843e],
 samphire:[0x7a9a3a,0x8aa040,0xa8382a,0xb84a30,0x9a6a34],saltbush:[0x9aa494,0xa8b0a0,0x8a9484],saltCrust:[0xf0ece4,0xe4e0d4,0xf4f2ea],
 creeper:[0x4e8a30,0x5a9636,0x447c2a],creeperBloom:[0xb85ac8,0xc86ad0,0xa84ab8,0xd07ad8],
 naupaka:[0x6aa04a,0x78ac52,0x5e9440],naupakaBloom:[0xf4f0e4,0xf0e8d8],naupakaBerry:[0xf0f0e8,0xe8e8dc],
 beachgrass:[0x9aa064,0xa8aa6e,0x8a945a,0xb4b078],wrack:[0x4a3a22,0x5a4a2a,0x3a301c,0x6a5a34],drift:[0xb8b0a0,0xa8a090,0xc8c0b0],
 seagrass:[0x4a7a3a,0x568444,0x3e6e32,0x627e40],sand:[0xe8dcc0,0xdcd0b4],
 coralBrain:[0xc8b48a,0xb8a47a,0xd4c09a,0x9a8a6a],coralRose:[0xc87a7a,0xb86a74,0xd89a8a],coralTeal:[0x5a9a94,0x4a8a88,0x6aaaa0],
 coralViolet:[0x8a6aa8,0x7a5a98],coralGold:[0xc8a040,0xd8b04a],coralDead:[0xa8a49a,0x989488,0xb8b4a8],
 reefRock:[0x9a9482,0x8a8474,0xaaa490,0x7a7466],urchin:[0x1a1416,0x2a1e22],anemone:[0x5ab48a,0xd86a8a,0xe8a04a,0x7ac0c0],limpet:[0xc8c0b0,0xb8b0a0],
 fern:[0x3e7a2e,0x4a8634,0x346a26],ginger:[0x3a6a2a,0x467634],gingerBloom:[0xd8283a,0xe8402a,0xc81830],aroid:[0x2e5e26,0x386a2c,0x26521e],
 liana:[0x4a6a2e,0x3e5e26],lianaRope:[0x5a4a34,0x4e4030],epiphyte:[0xc84a3a,0x9aa03a,0x5a8a3a],moss:[0x4a6a2a,0x56762e],
 mound:[0x9a6a48,0x8a5e40,0xa8764e],moundXV:[0x7a5a44,0x6e5040],stone:[0x8a8274,0x7a7466,0x9a9282],
 rice:[0x6a9a3a,0x7aa844,0x88b04a],riceGold:[0xc8b45a,0xd4c062],taro:[0x3e6a34,0x4a7a3a,0x3a5e30],taroStalk:[0x7a5a6a,0x6a5a4a],
 kava:[0x4e7a34,0x5a8a3a],kavaStem:[0x5a6a3a,0x6a7a44],yam:[0x4a7a30,0x568a36],stake:[0x7a6a52,0x6a5a44],cane:[0x7a9a44,0x88a84e,0x6a8a3a],
 mangoLeaf:[0x2e5226,0x365c2a,0x284a22,0x6a3a2a],mangoBark:[0x5a4a3e,0x4e4036,0x665446],mangoFruit:[0xe8a030,0xd8702a,0x9ab03a,0xe8c040],
 coffeeLeaf:[0x2a5226,0x305c2a,0x244a20],coffeeBark:[0x7a7466,0x6e6a5c],coffeeCherry:[0xc8202a,0xa81a24,0xd84a2a,0x8aa03a],
 cloveLeaf:[0x3a5e2a,0x426a30,0x8a4a3a],cloveBark:[0x7a7468,0x6a665a],cloveBud:[0xd8504a,0xc83a3a,0xe8a07a],
 sweetpotato:[0x4e7a30,0x5a8636,0x6a4a5a],herb:[0x6a9a4a,0x7aa850,0x5a8a40,0x9aa860],herbBloom:[0xf0e0a0,0xffffff,0xe8d070],greens:[0x6aa040,0x7ab048,0x5a9038,0x8ab858],
 caneStalk:[0xa89a5a,0x9a8a4e,0x8a9a4a],bund:[0x6a5a40,0x5e5038],paddyWater:[0x4a6a5a,0x3e5e52],soil:[0x5a4630,0x4e3e2a],
};

// ---------------------------------------------------------------- the kit's own tree species
// H height band, rb bole radius, crownR (metres); far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour
// A, colour B]); zone the zone that plants it; origin 'earth' (Earth's, descended), 'krator' (Krator's own), 'crop' (an
// island crop, planted)
const K=(c,a,ab,r,kp,origin,zone)=>({climate:c,aridity:a,abyssal:ab,riparian:r,koppen:kp,origin,zone});
const PAL=RINGISLES.PAL;
RINGISLES.SPECIES=[
 /*0*/{key:'scrubthorn',name:'Scrub thorn (a low flat-topped acacia)',H:[2.4,5],rb:[.06,.12],crownR:[1.8,3.4],bark:PAL.thornBark,leaf:PAL.thornLeaf,
  far:{poleU:.4,blobs:[[.78,1.0,.16,'L0','L2']]},tags:K('tropic','semiarid',true,'no',['Aw','XV','BSh'],'earth','savanna')},
 /*1*/{key:'corkwood',name:'Corkwood (a commiphora)',H:[3,6.5],rb:[.18,.34],crownR:[1.6,3],bark:PAL.corkBark,leaf:PAL.corkLeaf,
  far:{poleU:.5,blobs:[[.75,.9,.22,'L0','L1']]},tags:K('tropic','arid',true,'no',['BSh','XV','Aw','XS'],'earth','steppe')},
 /*2*/{key:'tamarisk',name:'Salt cedar (a tamarisk)',H:[3,7],rb:[.1,.2],crownR:[2,3.6],bark:PAL.tamBark,leaf:PAL.tamLeaf,
  far:{poleU:.35,blobs:[[.62,1.0,.32,'L0','L2']]},tags:K('tropic','arid',true,'both',['XS','BSh'],'earth','salt')},
 /*3*/{key:'strandpandan',name:'Strand pandanus',H:[4,9],rb:[.12,.22],crownR:[2.2,4],bark:PAL.pandanBark,leaf:PAL.pandanLeaf,
  far:{poleU:.6,blobs:[[.8,.95,.2,'L0','L1']]},tags:K('tropic','subhumid',true,'both',['XA','Af','Am','Aw','XV','BSh'],'earth','strand')},
 /*4*/{key:'seagrape',name:'Sea grape',H:[2.2,6],rb:[.08,.16],crownR:[2,3.8],bark:PAL.grapeBark,leaf:PAL.grapeLeaf,
  far:{poleU:.3,blobs:[[.6,1.0,.34,'L0','L2']]},tags:K('tropic','subhumid',true,'both',['XA','Af','Am','Aw','XV','BSh','XS'],'earth','strand')},
 /*5*/{key:'breadfruit',name:'Breadfruit',H:[10,18],rb:[.25,.42],crownR:[4.2,7],bark:PAL.breadBark,leaf:PAL.breadLeaf,
  far:{poleU:.4,blobs:[[.66,1.0,.32,'L0','L2']]},tags:K('tropic','humid',true,'no',['XA','Af','Am'],'crop','garden')},
 /*6*/{key:'banana',name:'Banana',H:[3,6],rb:[.11,.17],crownR:[1.8,2.8],bark:PAL.bananaStem,leaf:PAL.bananaLeaf,
  far:{poleU:.7,blobs:[[.85,.9,.2,'L0','L1']]},tags:K('tropic','humid',true,'yes',['XA','Af','Am'],'crop','garden')},
 /*7*/{key:'mango',name:'Mango',H:[8,15],rb:[.25,.4],crownR:[4,6.5],bark:PAL.mangoBark,leaf:PAL.mangoLeaf,
  far:{poleU:.35,blobs:[[.6,1.0,.36,'L0','L2']]},tags:K('tropic','subhumid',true,'no',['Aw','Am','Af','XV'],'crop','garden')},
 /*8*/{key:'coffee',name:'Coffee',H:[2,3.6],rb:[.04,.07],crownR:[.9,1.4],bark:PAL.coffeeBark,leaf:PAL.coffeeLeaf,
  far:{poleU:.2,blobs:[[.55,1.0,.45,'L0','L1']]},tags:K('tropic','humid',false,'no',['Af','Am'],'crop','garden')},
 /*9*/{key:'clove',name:'Clove',H:[7,12],rb:[.14,.24],crownR:[2,3.2],bark:PAL.cloveBark,leaf:PAL.cloveLeaf,
  far:{poleU:.25,blobs:[[.58,1.0,.42,'L0','L1']]},tags:K('tropic','humid',false,'no',['Af','Am'],'crop','garden')},
];
RINGISLES.byKey={};RINGISLES.SPECIES.forEach((S,i)=>{S.i=i;RINGISLES.byKey[S.key]=S;});

// ---------------------------------------------------------------- borrowed: other kits' trees, grown in place
// kit: the registry name (its own make/grow, or its treeAt); key its species; scale the kit's size band times this (an
// island's trees are smaller); xa: the height multiplier at full XA weight (the hypertropic forest is the same species
// taller and denser); the koppen classes and zone are this kit's (a borrowed species keeps its own other tags)
RINGISLES.BORROW=[
 {key:'lehua',kit:'throne',src:'lehua',scale:1.25,xa:1.45,koppen:['XA','Af','Am'],zone:'forest'},
 {key:'treefern',kit:'throne',src:'treefern',scale:1,xa:1.3,koppen:['XA','Af'],zone:'forest'},
 {key:'archpalm',kit:'throne',src:'archpalm',scale:1,xa:1.3,koppen:['XA','Af','Am'],zone:'forest'},
 {key:'palmfrill',kit:'throne',src:'palmfrill',scale:.9,xa:1.25,koppen:['XA','Af','Am'],zone:'forest'},
 {key:'coconut',kit:'throne',src:'coconut',scale:.9,koppen:['XA','Af','Am','Aw','XV','BSh','XS'],zone:'strand'},
 {key:'mangrove',kit:'throne',src:'mangrove',scale:.6,koppen:['XA','Af','Am','Aw','XV'],zone:'mangal'},
 {key:'staraloe',kit:'throne',src:'staraloe',scale:.85,koppen:['BSh','XS','Aw'],zone:'steppe'},
 {key:'gillparasol',kit:'throne',src:'gillparasol',scale:.75,koppen:['Aw','XV'],zone:'savanna'},
 {key:'umbrellathorn',kit:'swbay',src:'thorn',scale:1,koppen:['Aw','XV','BSh'],zone:'savanna',treeAt:true},
 {key:'baobab',kit:'swbay',src:'baobab',scale:.5,koppen:['Aw','XV','BSh'],zone:'savanna',treeAt:true},
 {key:'fanpalm',kit:'eastabyss',src:'fanpalm',scale:1,koppen:['Aw','XV','Am'],zone:'savanna'},
 {key:'stiltwood',kit:'eastabyss',src:'stiltwood',scale:.9,koppen:['XA','Af'],zone:'mangal'},
 {key:'kneetree',kit:'eastabyss',src:'kneetree',scale:.5,koppen:['XA'],zone:'mangal'},
 {key:'bottle',kit:'sedesert',src:'bottle',scale:.7,koppen:['BSh','XS'],zone:'steppe'},
];
RINGISLES.borrowOf={};RINGISLES.BORROW.forEach((B,i)=>{B.i=i;RINGISLES.borrowOf[B.key]=B;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
RINGISLES.HARVEST={
 scrubthorn:HV('fuel, fence thorn',['gum','pods (fodder)'],false,'Cut and laid in rings for the pens: the goats\' and the pigs\' thorn fences.'),
 corkwood:HV('carving (light)',['young leaves','resin'],true,'The bark peels in paper; the resin is the islanders\' myrrh, burnt at the ancestor stones.'),
 tamarisk:HV('fuel, posts',['manna (sweet exudate)'],true,'Grows where nothing else will on the salt; the salt workers burn it under the boiling pans.'),
 strandpandan:HV('thatch, matting',['fruit keys (cooked)'],false,'The leaves are stripped, dried and plaited into mats and sails; the keys are baked.','generic_fruit_pandan_keys'),
 seagrape:HV('fuel',['grapes'],true,'The purple grapes ripen in bunches through the dry season; the big leaves wrap food in the earth oven.'),
 breadfruit:HV('timber, canoes',['fruit (roasted, baked, fermented)'],true,'The staple of the windward villages: roasted whole in the fire or pit-fermented for the lean months; the latex caulks canoes.'),
 banana:HV('none',['fruit','flower'],false,'Cooking plantains and sweet bananas; the leaves are plates and oven covers.','generic_fruit_plantain'),
 mango:HV('timber',['fruit'],true,'Eaten green with salt and ripe from the tree; the bark is a remedy for the flux.'),
 coffee:HV('none',['beans (roasted)','cherries'],false,'Grown under shade on the windward upper slopes; a trade crop.'),
 clove:HV('none',['flower buds (dried: cloves)'],true,'The buds are picked pink before they open and dried in the sun: the dearest trade crop of the isles.'),
};
RINGISLES.SPECIES.forEach(S=>{S.tags.harvest=RINGISLES.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60 (the floor) and 62 (the gardens). items: the instanced items that draw them, for the inspector
const PK=(name,c,a,ab,r,kp,origin,zone,items,hv)=>({name,tags:Object.assign(K(c,a,ab,r,kp,origin,zone),{harvest:hv||HV('none')}),items});
RINGISLES.PLANTS={
 savgrass:PK('Tall savanna grass (green, cured gold or burnt by the mosaic)','tropic','semiarid',false,'no',['Aw','XV'],'earth','savanna',['tallgrass','tallgrassb'],HV('thatch',['seed'],false,'The thatch of every island roof: cut cured in the dry season.')),
 xvgrass:PK('Abyssal savanna grass (head-high)','hypertropic','semiarid',true,'no',['XV'],'earth','savanna',['tallgrass','tallgrassb'],HV('thatch',['seed'],false,'')),
 bunch:PK('Steppe bunchgrass (warm)','tropic','arid',true,'no',['BSh','XS','XV'],'earth','steppe',['bunch'],HV('thatch',[],false,'')),
 stubble:PK('Burnt stubble and ash','tropic','semiarid',false,'no',['Aw','XV','BSh'],'earth','savanna',['stubble','ash'],HV('none')),
 thornbush:PK('Thorn scrub (low acacia and commiphora)','tropic','arid',true,'no',['Aw','XV','BSh'],'earth','savanna',['thornspray','lobe'],HV('fuel',[],false,'The scrub layer the browsers keep low.')),
 mound:PK('Termite mounds','tropic','semiarid',true,'no',['Aw','XV','BSh'],'earth','savanna',['mound'],HV('none',[],false,'Mound clay is the islanders\' oven and pot clay.')),
 samphire:PK('Glasswort and samphire mats','tropic','arid',true,'both',['XS'],'earth','salt',['samphire'],HV('none',['young tips (pickled)'],false,'')),
 saltbush:PK('Saltbush','tropic','arid',true,'no',['XS','BSh'],'earth','salt',['saltbush'],HV('fodder',[],false,'')),
 crust:PK('Salt crust plates','tropic','arid',true,'no',['XS'],'dead','salt',['crust'],HV('none',['salt'],false,'Raked from the pan in the dry season.')),
 creeper:PK('Beach morning glory (a creeper)','tropic','subhumid',true,'both',['XA','Af','Am','Aw','XV','BSh','XS'],'earth','strand',['creeper','gloryflower','runner'],HV('none',[],true,'Its runners bind the sand; a leaf poultice for stings.')),
 naupaka:PK('Naupaka (beach shrub)','tropic','subhumid',true,'both',['XA','Af','Am','Aw','XV','BSh','XS'],'earth','strand',['naupaka','halfflower'],HV('none',[],true,'')),
 beachgrass:PK('Beach grass','tropic','semiarid',true,'both',['Aw','XV','BSh','XS','Am','Af','XA'],'earth','strand',['beachgrass'],HV('thatch',[],false,'')),
 wrack:PK('Wrack and drift','tropic','humid',true,'yes',['XA','Af','Am','Aw','XV','BSh','XS'],'dead','strand',['wrack','drift'],HV('fuel',[],false,'Dried wrack mulches the taro; driftwood for the fires.')),
 seagrass:PK('Seagrass meadow','tropic','humid',true,'yes',['XA','Af','Am','Aw','XV','BSh','XS'],'earth','lagoon',['seagrass'],HV('none',[],false,'The turtles\' pasture.')),
 coral:PK('Coral heads','tropic','humid',true,'yes',['XA','Af','Am','Aw','XV','BSh','XS'],'native','reef',['brain','branchcoral','tablecoral','rubble'],HV('none',[],false,'Dead heads are cut as building stone (the coral quarry).')),
 tidepool:PK('Tide-pool life (anemones, urchins, limpets)','tropic','humid',true,'yes',['XA','Af','Am','Aw','XV','BSh','XS'],'native','bench',['anemone','urchin','limpet'],HV('none',['urchin roe','limpets'],false,'')),
 fern:PK('Rainforest ferns','tropic','humid',true,'both',['XA','Af','Am'],'earth','forest',['fern'],HV('none',['fiddleheads'],true,'')),
 ginger:PK('Red ginger','tropic','humid',true,'both',['XA','Af','Am'],'earth','forest',['gingerleaf','gingerbloom'],HV('none',['rhizome'],true,'')),
 aroid:PK('Elephant ears (aroids)','tropic','humid',true,'yes',['XA','Af'],'earth','forest',['aroid'],HV('none',[],false,'')),
 liana:PK('Lianas','hypertropic','humid',true,'both',['XA','Af'],'earth','forest',['liana'],HV('rope',[],false,'')),
 epiphyte:PK('Epiphytes (bromeliads, moss)','hypertropic','humid',true,'both',['XA','Af','Am'],'earth','forest',['epiphyte','mossclump'],HV('none',[],false,'')),
 stone:PK('Stones and coral rubble','tropic','arid',false,'no',['Aw','XV','BSh','XS'],'dead','steppe',['stone'],HV('none')),
};
RINGISLES.plantOfItem=item=>{for(const k in RINGISLES.PLANTS)if(RINGISLES.PLANTS[k].items.indexOf(item)>=0)return RINGISLES.PLANTS[k];return null;};

// ---------------------------------------------------------------- the gardens (keyed as kits/islanders' placed flora)
// One stand per key: a world (a town, the islanders' kit) asks for it by key over a plot {x, z, w, d, a} and the kit
// plants it (62: RINGISLES.stand). w, d the islanders' own footprint for its placeholder (kits/islanders 57-fl-flora.js)
RINGISLES.GARDEN={
 // the owner's crops (2026-10-15): tree crops coconut, mango, banana, coffee, cloves; ground crops rice, taro, sweet potato,
 // medicinal herbs, greens, sugar cane; and breadfruit and kava (kept); yam dropped
 'crop-coconut':{name:'Coconut plantation',w:9,d:9,koppen:['XA','Af','Am','Aw','XV','BSh'],harvest:HV('timber, coir',['nuts','toddy'],false,'In rows, the ground under them grazed.','generic_fruit_coconut'),borrow:'coconut',tree:true},
 'crop-mango':{name:'Mango orchard',w:14,d:14,koppen:['Aw','Am','Af','XV'],harvest:HV('timber',['fruit'],true,''),species:'mango',tree:true},
 'crop-banana':{name:'Banana grove',w:4.2,d:4.2,koppen:['XA','Af','Am','Aw'],harvest:HV('none',['fruit','flower','leaves'],false,'','generic_fruit_plantain'),species:'banana',tree:true},
 'crop-coffee':{name:'Coffee garden (under shade)',w:10,d:8,koppen:['Af','Am'],harvest:HV('none',['beans','cherries'],false,'On the wetter, cooler upper slopes.'),species:'coffee',tree:true},
 'crop-clove':{name:'Clove grove',w:12,d:12,koppen:['Af','Am'],harvest:HV('none',['flower buds (cloves)'],true,'On the wetter, cooler upper slopes.'),species:'clove',tree:true},
 'crop-breadfruit':{name:'Breadfruit grove',w:9,d:9,koppen:['XA','Af','Am'],harvest:HV('timber',['fruit'],true,''),species:'breadfruit',tree:true},
 'crop-rice':{name:'Rice paddy',w:10.4,d:8.4,koppen:['XA','Af','Am'],harvest:HV('straw',['grain'],false,'In wet lowland paddies, twice a year.')},
 'crop-taro':{name:'Taro patch',w:4.4,d:3.4,koppen:['XA','Af','Am'],harvest:HV('none',['corms','leaves'],false,'In wet beds fed by the water of the paddies.')},
 'crop-sweetpotato':{name:'Sweet potato beds',w:6,d:4,koppen:['Af','Am','Aw','XV'],harvest:HV('none',['tubers','leaves'],false,'Ridged; it tolerates the dry season of the savanna.')},
 'crop-herbs':{name:'Medicinal herb garden',w:5,d:4,koppen:['XA','Af','Am','Aw'],harvest:HV('none',['herbs'],true,'Lemongrass, ginger, turmeric, basil: the beds of the healers.')},
 'crop-greens':{name:'Greens',w:5,d:4,koppen:['XA','Af','Am','Aw'],harvest:HV('none',['leaves'],false,'Leafy greens in rows by the houses.')},
 'crop-sugarcane':{name:'Sugar cane',w:6,d:4,koppen:['Af','Am','Aw','XV'],harvest:HV('thatch',['juice','sugar'],false,'It tolerates the savanna (Aw).')},
 'crop-kava':{name:'Kava garden',w:6,d:4,koppen:['XA','Af','Am'],harvest:HV('none',['root (the kava drink)'],true,'Shaded, staked; the root pounded for the kava houses.')},
};
// kits/islanders' placed flora by its own keys (its placeholders): the same stands
RINGISLES.GARDEN_ALIAS={'fl-paddy':'crop-rice','fl-taro':'crop-taro','fl-banana':'crop-banana','fl-breadfruit':'crop-breadfruit','fl-coconut':'crop-coconut'};
for(const k in RINGISLES.GARDEN){const G=RINGISLES.GARDEN[k];G.key=k;G.tags=Object.assign(K('tropic','humid',true,'no',G.koppen,'crop','garden'),{harvest:G.harvest});}
RINGISLES.FRUIT_KEYS=[...new Set(RINGISLES.SPECIES.map(S=>S.tags.harvest.fruit).filter(Boolean).concat(['generic_fruit_coconut']))];
})();
