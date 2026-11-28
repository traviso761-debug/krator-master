// ================================================================= SOUTHWEST BAY - endemic understorey, strand, karst-spring & skarn flora ([G data])
// Pure data ([G data]: no three.js, no geometry, no DOM). SWBAY.SPECIES (50) keeps its 14 tree keys and indices unchanged for external worlds that
// read 50-75 in place; SWBAY.PLANTS holds the 12 endemic shrubs, strand runners, karst-spring aquatics, drip-cap fungoids, epiphytes and Almua-Voth
// skarn-cliff metallophytes of the southwest bay and its raised marble coast (14 + 12 = 26 native species).
(function(){
 const HV=(wood,edible,med,note,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!med,fruit:fruit||null,note:note||''});
 const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
 const PK=(name,tags,items,hv,o)=>Object.assign({name,tags:Object.assign(tags,{harvest:hv||HV()}),items},o||{});
 SWBAY.ENDEMIC_PAL={
  seagrape:[0x486e42,0x547a4a,0x3f623a,0x6e5244],
  beachvine:[0x4e7c44,0x5a884e,0x44703c],
  vineBloom:[0xb84ca4,0xc85ab2,0x9e4290],
  crinum:[0xf4f0ea,0xece4dc,0xf8f4f0],
  arumLeaf:[0x346c52,0x3e785c,0x2c6048],
  arumSpathe:[0xeef4e4,0xdcecd4,0xf4f6ec],
  springStrap:[0x2e7862,0x38866e,0x266a56],
  dripCap:[0x8c5a38,0x7a4854,0x9a683e,0x6c4258],
  dripVeil:[0xd8c896,0xc4b89e,0xe2d4a4],
  bromeliad:[0xa82834,0xb8323e,0x8e2430,0x647e34],
  orchid:[0x9c52b8,0xb062c8,0xdca844,0x8844a4],
  gingerTorch:[0xc82438,0xd83044,0xb41e30],
  gingerCane:[0x427238,0x4e7e42,0x386630],
  starAloe:[0xd85828,0xe66832,0xc44a22],
  aloeLeaf:[0x5e7652,0x6c825c,0x7a6448],
  caperLeaf:[0x5c7258,0x687e64,0x50664c],
  samphire:[0x4a7e74,0x568c80,0x3e7068],
  samphireUmbel:[0xc8c248,0xd4ce54,0xb8b23e]
 };
 SWBAY.PLANTS={
  bayseagrape:PK('Ring-Sea sea-grape',K('tropical..warm','subhumid..humid','both',['Am','Af','Aw','Csb']),['seagrape'],
   HV('crooked boat-knees, charcoal',['grape-cluster (tart-sweet coastal fruit, fermented into bay wine)'],true,'A wind-planed littoral shrub of Ring Sea beaches and raised fossil shore benches with round salt-glazed leaves and hanging clusters of purple sea-grapes. Bark tannin cures fishing nets. 1.0-2.6 m.')),
  coquinavine:PK('Coquina beach-bean',K('tropical..warm','subhumid..humid','no',['Am','Af','Aw','Csb']),['beachvine'],
   HV('tough stem runners (crab-pot lashings)',['young pod (sliced and boiled)','bean (leached and roasted)'],true,'A vigorous creeping legume binding Ring Sea beach berms and carbonate-shelf visors with glossy paired leaflets and magenta-violet pea blossoms. Binds shifting sand. 0.15-0.4 m.')),
  spraycrinum:PK('Surf spider-lily',K('tropical..warm','subhumid..humid','both',['Am','Af','Aw','Csb']),['spiderlily'],
   HV('none',[],true,'A salt-spray amaryllis of beach ridges and karst-spring lips bearing fountains of glossy strap leaves and fragrant white spider-lily umbels. Mucilaginous bulb poultice draws sea-spine venom; lure wrap. 0.6-1.3 m.')),
  karstarum:PK('Turquoise spring-arum',K('tropical..warm','humid','yes',['Af','Am','Csb']),['arumspathe'],
   HV('broad leaves (steaming wraps for fish)',['corm (pit-baked twelve hours to break oxalate needles)'],false,'An aroid of gin-clear carbonate-shelf karst springs whose arrow-shaped paddles cluster round turquoise boils from the bay river to Almua\'s shelf visor. Pit-baked corms yield dense starch cake. 0.7-1.5 m.')),
  springstrap:PK('Karst ribbon-weed',K('tropical..warm','humid','yes',['Af','Am','Csb']),['springgrass'],
   HV('woven eel-traps and fish-basket linings',['tender white stolon base'],false,'Emerald ribbon-tufts waving in clear carbonate spring runs and river riffles. Dried straps weave springy sleeping mats; calcified ash serves as lime flux. 0.4-1.1 m.')),
  dripcap:PK('Drip-cap shelf-fungoid',K('tropical..warm','humid','both',['Af','Am','Csb']),['dripveil'],
   HV('dried bracket tinder (smoulders through monsoon squalls)',['young margin (parboiled)'],true,'The southwest bay\'s signature weeping shelf-fungoid: glazed amber-violet brackets fringed with mucilage threads on drowned masonry, hyperjungle logs and shaded cove rock. Yields waterproof caulk glue and monsoon fire-punk. 0.3-0.9 m.')),
  tankbromeliad:PK('Crimson cistern-urn',K('tropical','humid','no',['Af','Am','Csb']),['bromeliad'],
   HV('silky leaf-vascular thread (fine bowstring and suture)',['flower bract (sour nibble)','drinking water (filtered tank cistern)'],false,'A rainwater-holding urn rosette of the prism-gum hyperjungle and sheltered coastal coves, each leaf-tank cradling clear water and a scarlet flower spike. Silky leaf fibre spins rot-proof line. 0.5-1.1 m.')),
  prismorchid:PK('Violet cane-orchid',K('tropical..warm','subhumid..humid','no',['Af','Am','Csb']),['orchid'],
   HV('split golden cane-skin (decorative basket plaiting)',[],true,'A cane-forming orchid of mossy boulders and rainforest glades bearing sprays of violet-and-gold blooms that echo the prism gums\' iridescence. Pseudobulb tea soothes fever; boiled mucilage sets instrument inlays. 0.4-0.95 m.')),
  torchginger:PK('Bay torch-ginger',K('tropical','humid','yes',['Af','Am','Csb']),['gingertorch'],
   HV('beaten cane pulp (coarse wrapping paper)',['flower torch bud (aromatic sour-spicy stew relish)','seed-pod (cardamom-like spice)'],true,'An aromatic zingiber of rainforest streams and damp cove hollows sending up two-metre leafy canes beside waxy crimson torch-inflorescences. Buds season fish curries; crushed rhizome repels leeches. 1.2-2.4 m.')),
  savaloe:PK('Termite star-aloe',K('tropical..warm','semiarid..subhumid','no',['Aw','BSh','Csb']),['staraloe'],
   HV('dried flower-stalks (arrow foreshafts)',['nectar (drawn from tubular coral blooms)'],true,'A copper-green succulent rosette of the parasol savannah and dry coastal crowns raising branched torches of coral-orange star blooms. Bitter yellow sap dresses burns and keeps boring beetles out of timber. 0.5-1.3 m.')),
  epidotecaper:PK('Skarn cliff-caper',K('warm','semiarid..subhumid','no',['Csb','Csa','Aw']),['caperbush'],
   HV('tough root-bark',['flower bud (pickled in sea-salt as capers)','berry (peppery caperberry)'],true,'A deep-rooted cliff shrub wedged into Almua\'s contact-marble quarry steps and volcanic bluffs, cascading grey-green coin leaves and white-whiskered blooms. Pickled buds travel on Ring Sea ships against scurvy. 0.6-1.5 m.')),
  chalcosamphire:PK('Copper-seam rock-samphire',K('warm','semiarid..subhumid','no',['Csb','Csa','Aw','Am']),['samphire'],
   HV('burnt plant ash (soda-alkali flux for glass and soap)',['fleshy shoot (brined aromatic sea-pickle)'],true,'A fleshy blue-verdigris succulent of spray-washed rock and epidote-magnetite skarn selvages whose copper-tinted stems betray chalcopyrite and iron seams along the Almua-Voth coast. Brined shoots keep a year in amphorae. 0.25-0.6 m.'))
 };
 SWBAY.ENDEMIC_KEYS=Object.keys(SWBAY.PLANTS);
 SWBAY.plantOfItem=function(item){
  for(let i=0;i<SWBAY.ENDEMIC_KEYS.length;i++){const k=SWBAY.ENDEMIC_KEYS[i];if(SWBAY.PLANTS[k].items.indexOf(item)>=0)return SWBAY.PLANTS[k];}
  return null;};
})();
