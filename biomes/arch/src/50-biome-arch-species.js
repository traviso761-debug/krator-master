// ================================================================= ARCH — species (data + kit items; PLAN.md section 7)
// Two floras by the ground's chemistry (ARCH.lifeAt, ARCH.earthOk: 40). EARTH, New Caledonia's ultramafic maquis on the laterite: the candelabra
// araucaria, the she-oak that fixes its own nitrogen (Gymnostoma), the blue-sap hoarder (Pycnandra) and its kin, the maquis sedge, the pitcher plant on
// the seeps (Nepenthes vieillardii, with a trap record), plus Hawaiian / Indo-Pacific pioneers and strand trees (Ohia lehua, Uluhe staghorn fern, Beach
// she-oak Casuarina, Naupaka, Coconut, Red mangrove). NATIVE, fungoid hosts with three partners: the curtain and its young hem in the confluences (a
// proton-gradient partner), the lime shelf on the aprons and the verdigris cap on the richest nickel (photosynthetic), the seep comb by the flames
// (hydrogen-eating), the acid felt on the acid ground (iron-oxidising), the steam fan in the solfatara's steam. Working names (PLAN.md section 16).
// Everything here is DATA, procedural botanical textures, and kit definitions; placement is 60-biome-arch-place.js.
BIO.kit('arch');   // this kit's own registry of items and buckets (core/biome: kits)
var ARCHB={SITES:ARCH_SITES};
(function(){const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);ARCHB.C=C;
const H01=(a,b,c)=>KRAND.unit(KRAND.hash(0x4a2c19,a|0,b|0,c|0));
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true},o||{});
const E=(c,a,r,kp,o)=>Object.assign(K(c,a,r,kp,o),{alien:false,native:false});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex)
const PAL=ARCHB.PAL={
 curtainHem:[0x9ab88a,0xa8c49a,0x8aac7e],hem:[0xdfe6da,0xcfdccc,0xb8cca8],lime:[0xeef0ea,0xe2e8e4,0xd8e2e2],limeUnder:[0xb8c8b0,0xa8bca4],
 verd:[0x5a9a7a,0x4a8a72,0x6aa886,0x3f7f6a],verdFlesh:[0xe8e0cc,0xdcd4c0],comb:[0xe6dcc0,0xf0e6cc,0xd8ccb0],felt:[0xc06a2a,0xb85a24,0xd0843a,0xa84e1e],
 fan:[0x8a9a7a,0x7a8a6e,0x96a486],
 trunk:[0x827668,0x74685c,0x8c8072],araucBark:[0x786c60,0x6c6054,0x84786c],kauriBark:[0x8c8074,0x7e7266,0x988c7e],
 ohiaBark:[0x8e867c,0x7e766c,0x989086],rataBark:[0x6e5c50,0x604e44,0x7a6658],casBark:[0x6c6258,0x5e544c,0x786e64],
 paperBark:[0xd8d2c6,0xccc4b6,0xe2dcd0],mangroveBark:[0x544a42,0x483e38,0x60544a],pandanBark:[0x8c8270,0x7e7464,0x988e7c],
 needles:[0x2e4a32,0x36553a,0x284430,0x3a5a3e],kauriLeaf:[0x345838,0x3e6440,0x2c4e32,0x486e46],kauriGum:[0xd89628,0xe6a834,0xc4821e],
 casuar:[0x465e3e,0x526a46,0x3d5436],casuar2:[0x5a7456,0x668060,0x506a4c,0x6e8868],
 naupaka:[0x589848,0x66a654,0x4c8c40],ipomoea:[0x4a8a3a,0x5a9846],
 palm:[0x4c7832,0x58863a,0x426c2c,0x649042],palmOld:[0x7e7838,0x8c8240],palmtrunk:[0x8a7a62,0x7e705a],coconutNut:[0x6c7a36,0x867238,0x5e6e30],
 pandanLeaf:[0x487634,0x54843e,0x3e6a2e,0x608e46],pandanFruit:[0xd86e24,0xe4802c,0xc85e1e],
 fernBark:[0x4a3a2e,0x3e3026,0x564436],fernLeaf:[0x487e34,0x568c3e,0x3e722c,0x629646],nephro:[0x568e36,0x649c40,0x4a802e],
 ohia:[0x5c784e,0x688458,0x526e46,0x728a5e],ohiaFlush:[0x84764a,0x768252],ohiaFlower:[0xdc2e24,0xe83e2c,0xc8241e,0xf05228],
 rataLeaf:[0x345c3c,0x3e6844,0x2c5034],paperLeaf:[0x647e62,0x708a6c,0x587256],tamanuLeaf:[0x285832,0x32643c,0x224e2a],
 hibiscusLeaf:[0x488438,0x549242,0x3e7830],hibiscusBloom:[0xecc82c,0xf4d43a,0xdcb424],
 uluhe:[0x8eb83c,0x9cc446,0x7ea834,0xa6cc50],
 mangrove:[0x2a4a2a,0x30522e,0x26442a],avicennia:[0x586e56,0x647a62,0x4e644c],verdMangrove:[0x285642,0x32624c,0x224a38],
 tealsap:[0x1ec4ba,0x28d2c6,0x18b0a8],prop:[0x6a5a48,0x5e5040],
 glossy:[0x2e5a34,0x3a6a3e,0x2a5030,0x46743e],phyllanthus:[0x386c3e,0x447848,0x2e6034],
 draco:[0x6e4e34,0x7c583a,0x5e6238,0x865e3c],codia:[0x4e6c44,0x5a784e,0x44603c],codiaBloom:[0xf2efe2,0xe8e4d4,0xf8f6ec],
 grevillea:[0x566e4e,0x627a58,0x4c6444],grevBloom:[0xd44628,0xe25832,0xc83a22],
 sedge:[0x8a8a52,0x7a7c48,0x9a9660,0x6e7044],lepido:[0x787e46,0x868a50,0x6c723e],
 pitcher:[0x9a3a2a,0x8a4a2a,0x6a8a3a,0xb8562e],drosera:[0xb82e28,0xc83c32,0x9e2622],
 kelp:[0x8c7828,0x9c8632,0x786822,0xa6903a],seagrass:[0x2c7846,0x368650,0x246c3e],
 byssus:[0x3c2e38,0x483842,0x32262e,0x564238],oyster:[0xe2d8d6,0xd6ccca,0xece4e2],barnacle:[0xd8d6cc,0xcccac0,0xe2e0d6]};
// ---------------------------------------------------------------- the species (39 total: 7 native, 28 Earth terrestrial/coastal, 4 marine/intertidal)
const SPECIES=ARCHB.SPECIES=[
 // NATIVE (7)
 {key:'curtain',name:'Curtain',how:'a living wall standing in a confluence where alkaline water from the mantle meets acid water from the vents: a ribbed sheet 0.5-4 m tall, glossy black-green on its acid face (iron-nickel sulphide), chalk white on its alkaline face (brucite and aragonite), a pale-green living hem along its top. It keeps the two waters apart and lives on the difference: protons through the wall (PLAN.md 2.1)',
  items:['arcurtain','arcurtainhem'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[2,11.9],partner:'proton-gradient chemolithotroph'})},
 {key:'hem',name:'Hem frill (young curtain)',how:'low mineral frills along a meeting line where a curtain could stand and none has yet: the curtain\'s young, a hand high',
  items:['arhem'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[2,11.9],partner:'proton-gradient chemolithotroph'})},
 {key:'limeshelf',name:'Lime shelf',how:'white-crusted fungoid shelves on the travertine rims (pH 9.5-11): the alkaline water\'s carbonate laid on its own skin, a photosynthetic partner under it',
  items:['arlime'],tags:K('tropical','humid','both',['Am','Aw'],{ph:[9.5,12],partner:'photosynthetic, alkaliphile'})},
 {key:'verdigris',name:'Verdigris cap',how:'a fungoid cap 0.3-2 m on the richest nickel, beside the Earth hoarders: a green nickel crust over pale flesh, bleeding blue-green where it is cut; nothing grazes it but the verdigris browser',
  items:['arverd','arverdstalk'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[4.5,8],partner:'photosynthetic',nickel:'hyper'})},
 {key:'seepcomb',name:'Seep comb',how:'cream combs round the hydrogen seeps outside the flames, a thin-film sheen where the hydrogen wets them: their partner eats hydrogen with the air\'s oxygen (knallgas)',
  items:['arcomb'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[6,10],partner:'hydrogen-oxidising'})},
 {key:'acidfelt',name:'Acid felt',how:'rust-orange and ochre mats and streamers on the acid stream\'s banks and the solfatara\'s ground (pH 1-4): an iron-oxidising partner, Rio Tinto\'s colours',
  items:['arfelt'],tags:K('tropical','humid','yes',['Am','Aw'],{ph:[1,4],partner:'iron-oxidising acidophile'})},
 {key:'steamfan',name:'Steam fan',how:'low grey-green fans in the steam on ground at 45-90 degC',
  items:['arfan'],tags:K('tropical','humid','no',['Am','Aw'],{ph:[2,8],heat:[45,90],partner:'photosynthetic, thermophile'})},
 // EARTH — ultramafic maquis, gully & pioneer flora (19)
 {key:'araucaria',name:'Candelabra araucaria (Araucaria rulei / muelleri)',how:'the ultramafic maquis\'s emblem: a straight hoop-barked spar trunk and stiff upturned arms of scale-leaved rope, a candelabra 8-20 m, scattered over the low scrub',
  items:['artrunk','arbough'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'arkauri',name:'Maquis kauri (Agathis ovata / lanceolata)',how:'a stout columnar ultramafic conifer 7-18 m with flaking silver-bronze bark, heavy upper crown boughs and golden kauri-gum resin stalactites weeping from bough forks',
  items:['arkauri_trunk','arkauri_fol','arkauri_gum'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'gymnostoma',name:'Maquis she-oak (Gymnostoma deplancheanum)',how:'a dark, wiry she-oak 1.5-6 m whose root nodules (Frankia) fix the nitrogen the laterite lacks: the maquis\'s commonest shrub',
  items:['argymno'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'indicator',fixer:'nitrogen'})},
 {key:'pycnandra',name:'Sève bleue (Pycnandra acuminata)',how:'a glossy-leaved shrub to small tree 3-8 m in the wetter hollows whose latex is a quarter nickel: cut, it bleeds blue-green',
  items:['arpycn','arpycntrunk'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7.5],nickel:'hyper'})},
 {key:'arphyllanthus',name:'Green-sap hyperaccumulator (Phyllanthus balgooyi)',how:'a multi-stemmed ultramafic maquis shrub 1.5-4 m with vivid jade-green nickel-bearing phloem and glossy distichous sprays on rich garnierite rims',
  items:['arphyllanthus'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,7.8],nickel:'hyper'})},
 {key:'costularia',name:'Maquis sedge (Costularia)',how:'stiff tussocks of sedge between the shrubs on the bare laterite',
  items:['arsedge'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'arlepidosperma',name:'Sword-sedge (Lepidosperma perteres)',how:'tall flat-bladed ochre-olive sword-sedge clumps 0.7-1.6 m edging laterite cuirasse slabs and drainage lines',
  items:['arlepidosperma'],tags:E('tropical','humid','both',['Am','Aw'],{ph:[4.5,8.5],nickel:'excluder'})},
 {key:'ardracophyllum',name:'Dragon-heath (Dracophyllum ramosum)',how:'a candelabrum-branched ultramafic shrub 1.2-3.5 m bearing stiff terminal rosettes of bronzed recurved leaves on bare ringed twigs',
  items:['ardracophyllum'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'arcodia',name:'White-puff maquis shrub (Codia montana)',how:'a rounded sclerophyll shrub of the laterite barrens 1-3 m covered in cream-white globose pom-pom flowerheads',
  items:['arcodia','arcodia_bloom'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'argrevillea',name:'Serpentine grevillea (Grevillea exul)',how:'a wiry proteaceous shrub 1.2-3.2 m on red ironstone and serpentinite scree, with silvery divided leaves and rust-red brush racemes',
  items:['argrevillea','argrevillea_bloom'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'nepenthes',name:'Pitcher plant (Nepenthes vieillardii)',how:'red-green pitchers on the seeps of the laterite, where the ground is poorest and wettest: it eats what drowns in it (a trap record)',
  items:['arpitch'],tags:E('tropical','humid','both',['Am'],{ph:[4.5,7],nickel:'excluder'})},
 {key:'ardrosera',name:'Ultramafic sundew (Drosera neocaledonica)',how:'rosettes of ruby-red glandular-tentacled leaves glistening on wet nitrogen-poor laterite seeps beside the pitchers',
  items:['ardrosera'],tags:E('tropical','humid','yes',['Am','Aw'],{ph:[4.5,7.2],nickel:'excluder'})},
 {key:'artreefern',name:'Gully tree-fern (Cyathea intermedia)',how:'a slender fibrous caudex trunk 2.5-6.5 m in wet laterite gullies and ravine heads, crowned with an arching fountain of lacy bipinnate fronds',
  items:['artreefern_trunk','artreefern_frond'],tags:E('tropical','humid','yes',['Am'],{ph:[4.5,7.8],nickel:'excluder'})},
 {key:'arpaperbark',name:'Niaouli paperbark (Melaleuca quinquenervia)',how:'a twisted cream-barked tree 4-12 m on wet laterite benches and seasonal seeps, shedding thick waterproof sheets of papery bark',
  items:['arpaperbark_trunk','arpaperbark_fol'],tags:E('tropical','humid','both',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'ohia',name:'Ohia lehua (Metrosideros polymorpha)',how:'the first tree on new lava in the wet tropics (Hawaii): a crooked grey-barked tree 3-11 m, leathery grey-green leaves, scarlet brush flowers; it roots in the flow\'s cracks once the lava is a few decades old',
  items:['arohia','arohiatrunk','arohia_bloom'],tags:E('tropical','humid','no',['Am'],{ph:[4.5,8],lava:'pioneer'})},
 {key:'arrata',name:'Gorge rata (Metrosideros nautica / demonstrans)',how:'a wind-braced coastal and gorge hardwood 6-15 m with J-curved reaction-wood limbs and dike-clasping buttress knees prized by shipwrights',
  items:['arrata_trunk','arrata_fol'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],nickel:'excluder'})},
 {key:'uluhe',name:'Uluhe (Dicranopteris linearis)',how:'a dichotomously forking staghorn fern that scrambles over lava and coastal bluffs in thickets, bright yellow-green: with the ohia, the lava\'s first cover',
  items:['aruluhe'],tags:E('tropical','humid','no',['Am'],{ph:[4.5,8],lava:'pioneer'})},
 {key:'arnephrolepis',name:'Sword fern (Nephrolepis exaltata)',how:'tufts of erect pinnate sword-fronds 0.4-1.1 m rooting in cooling lava crevices, tuff ledges and coastal rock cracks',
  items:['arnephrolepis'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[4.5,8.2],lava:'pioneer'})},
 // EARTH — mangroves & tropical strand (9)
 {key:'mangrove',name:'Red mangrove (Rhizophora)',how:'the sound\'s sheltered shores: a dense dark crown on arching prop roots, standing in the tidal mud',
  items:['armangrove','armangroveprop'],tags:E('tropical','humid','yes',['Am'],{ph:[6,8.5],tidal:true})},
 {key:'aravicennia',name:'Grey mangrove (Avicennia marina)',how:'outer-mudflat and brackish-shore mangrove 3-8 m with silvery-olive foliage and a wide carpet of erect pencil pneumatophores',
  items:['aravicennia_fol','aravicennia_pneum'],tags:E('tropical','humid','yes',['Am','Aw'],{ph:[6,8.8],tidal:true})},
 {key:'arverdigrismangrove',name:'Teal-sap prop-wood (Rhizophora pycnandroides)',how:'ultramafic shore and gjar-mouth mangrove 4.5-9.5 m on braided elastoplastic stilt roots that bleed vivid teal-blue 20% nickel latex from bark scars',
  items:['arverdigris_fol','artealsap_scar'],tags:E('tropical','humid','yes',['Am'],{ph:[5.5,8.8],tidal:true,nickel:'hyper'})},
 {key:'casuarina',name:'Beach she-oak (Casuarina equisetifolia)',how:'a drooping, wiry, grey-green she-oak 6-18 m on coastal headlands and dunes behind black sand; it fixes its own nitrogen and holds the shore',
  items:['arcastrunk','arcas','arcas_drape'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'arpandan',name:'Strand pandanus (Pandanus tectorius)',how:'a ringed prop-rooted screw-palm 3.5-8.5 m leaning on strand dunes and coastal bluffs, crowned with spiral rosettes of keeled strap leaves and orange fruit keys',
  items:['arpandan_trunk','arpandan_strap','arpandan_fruit'],tags:E('tropical','humid','both',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'artamanu',name:'Tamanu (Calophyllum inophyllum)',how:'a stout leaning coastal hardwood 7-16 m behind the strand and on basalt bluffs, with dense dark glossy leaves and curved hull-knee limbs',
  items:['artamanu_trunk','artamanu_fol'],tags:E('tropical','humid','no',['Am'],{ph:[5,8.8],strand:true})},
 {key:'arhibiscus',name:'Sea hibiscus (Hibiscus tiliaceus)',how:'a scrambling multi-stemmed coastal thicket tree 3-7 m with broad heart leaves and yellow cup flowers, stripped for rot-proof bast cordage',
  items:['arhibiscus_fol','arhibiscus_bloom'],tags:E('tropical','humid','both',['Am','Aw'],{ph:[5,8.8],strand:true})},
 {key:'naupaka',name:'Beach naupaka (Scaevola taccada)',how:'a rounded shrub of fleshy bright-green leaves on the dune\'s front, white half-flowers',
  items:['arnaupaka'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'ipomoea',name:'Beach morning glory (Ipomoea pes-caprae)',how:'a creeping vine of round leaves running over the black sand toward the tide line, pink flowers',
  items:['aripomoea'],tags:E('tropical','humid','no',['Am','Aw'],{ph:[5,9],strand:true})},
 {key:'coconut',name:'Coconut palm (Cocos nucifera), drift-sown',how:'leaning ringed palms along the back of the beach and coastal benches, crowned with arching-and-drooping pinnate fronds and green-bronze nut clusters',
  items:['arpalmtrunk','arpalm','arcoconut_nut'],tags:E('tropical','humid','both',['Am'],{ph:[5,9],strand:true})},
 // EARTH — marine & macrotidal zonation (4)
 {key:'arkelp',name:'Shoal kombu kelp (Ecklonia / Macrocystis)',how:'golden-olive undulating kelp blades and holdfast stipes anchored on low-spring-tide rock ledges (-6.8 to -0.5 m) and pillow-lava tide pools',
  items:['arkelp','arkelp_stipe'],tags:E('tropical','humid','yes',['Am'],{ph:[7.5,8.6],submarine:true,tidal:true})},
 {key:'arseagrass',name:'Ribbon seagrass (Enhalus / Cymodocea)',how:'emerald strap-leaved seagrass meadows carpeting sheltered shallow sand and lagoon pockets (-4.5 to -0.4 m)',
  items:['arseagrass'],tags:E('tropical','humid','yes',['Am'],{ph:[7.5,8.6],submarine:true,tidal:true})},
 {key:'arbyssus',name:'Giant sea-byssus mussel bed (Pinna / Bathymodiolus)',how:'dense beds of dark bronze-violet fan-shells anchored by golden byssus threads in the lower sill tidal race (-6.6 to -1.0 m), exposed only on spring ebbs',
  items:['arbyssus'],tags:E('tropical','humid','yes',['Am'],{ph:[7.6,8.8],submarine:true,tidal:true})},
 {key:'aroyster',name:'Coralline-oyster visor (Saccostrea / Lithophyllum)',how:'cemented rose-chalk visor-oyster reefs (-0.5 to +2.6 m) and upper-littoral barnacle crusts (+2.6 to +6.8 m) banding macrotidal gorge walls',
  items:['aroyster','arbarnacle'],tags:E('tropical','humid','yes',['Am'],{ph:[7.6,9.2],tidal:true})}];
SPECIES.forEach((S,i)=>{S.i=i;});
ARCHB.HARVEST={
 curtain:HV('none',[],false,'Nothing eats a curtain but the seam wader, which grazes its hem. Its black face, dried, is an iron-nickel sulphide reagent.'),
 hem:HV('none',[],false,'Juvenile mineral frill along active pH meetings.'),
 limeshelf:HV('none',[],false,'Burnt in coastal clamps for slaked brucite-carbonate lime mortar and whitewash.'),
 verdigris:HV('none',[],false,'Poisonous nickel crust; calcined into 15-20% nickel bio-ore ash for paktong smelting.'),
 seepcomb:HV('none',[],false,'Marks H2-bearing serpentinite fault seeps where abiotic gas burns.'),
 acidfelt:HV('dye (ochre)',[],false,'Dried and ground into rust-ochre mineral pigment.'),
 steamfan:HV('none',[],false,'Thermophile fan on 45-90 degC fumarole ground.'),
 araucaria:HV('timber (straight spars), pitch, resin',[],false,'Yard spar timber for masts and yards; houses take the offcuts and resin.'),
 arkauri:HV('timber (spars), gum, pitch',[],false,'Straight spar wood and golden kauri gum boiled into marine pitch, caulking and hull varnish.'),
 gymnostoma:HV('fuel (hard, hot)',[],false,'Hot-burning ironwood fuel; Frankia root nodules feed nitrogen into the laterite.'),
 pycnandra:HV('none',[],false,'Latex is 25% nickel: tapped and calcined into rich bio-ore ash for paktong smelting.'),
 arphyllanthus:HV('fuel',[],false,'Coppiced hyperaccumulator burned into green nickel-rich ash for paktong smelting.'),
 costularia:HV('thatch',[],false,'Bundled with uluhe for tiered Shore-kin roof thatch.'),
 arlepidosperma:HV('thatch, mats, basketry',[],false,'Stiff silica-edged sword-sedge woven into floor mats, fish-drying screens and ridge thatch.'),
 ardracophyllum:HV('fuel, torch resin',[],false,'Resinous dry twigs catch fire in wet sea air for kindling and night torches.'),
 arcodia:HV('fuel, tanbark',[],false,'Astringent bark steeped for tanning hides and fishing lines.'),
 argrevillea:HV('fuel, carving',[],false,'Silky-grained red heartwood turned for toggles, pins and shrine pegs.'),
 nepenthes:HV('cordage (tough vine stems)',['filtered pitcher fluid'],false,'Tough woody stems twisted into rough lashing; fluid drunk in need.'),
 ardrosera:HV('none',[],true,'Mucilaginous sundew extract used as a soothing cough physic.'),
 artreefern:HV('posts (rot-slow caudex trunks), thatch',[],false,'Fibrous caudex trunks set as damp-ground fence and shed posts; fronds for temporary thatch.'),
 arpaperbark:HV('bark sheet (caulking and roof lining), fuel',[],true,'Layered waterproof paperbark stripped in sheets for hull seam caulking and under-thatch roof lining; aromatic leaf oil.'),
 ohia:HV('fuel, carving, knees',[],false,'Hard close-grained wood carved into Rian-strand ridge finials and boat cleats.'),
 arrata:HV('knees (ship knees), timber, carving',[],false,'J-curved reaction-wood limbs prized for borer-proof ship knees, hull ribs and hoist frames.'),
 uluhe:HV('thatch, mulch',[],false,'Springy rain-shedding staghorn fern thatch layered over Costularia sedge.'),
 arnephrolepis:HV('mulch',[],true,'Pioneer fern rhizomes pounded as a cooling poultice.'),
 mangrove:HV('timber (dense, rot-proof piles), knees, tannin',[],false,'Rot-proof boardwalk planks and piles; red-brown bark tannin stains Fleet-born sails and nets.'),
 aravicennia:HV('knees, fuel, tannin',['leached mangrove propagules'],false,'Curved boat-rib knees and smokehouse fuel; bark yields astringent net tannin.'),
 arverdigrismangrove:HV('knees (worm-proof ship knees), timber, tannin, fuel',[],false,'Worm-proof ship knees; coppiced limbs burned into 18-24% nickel bio-ore ash for paktong.'),
 casuarina:HV('fuel (hot, slow charcoal)',[],false,'Premier smelter and lime-kiln fuelwood; nitrogen-fixing shelterbelt.'),
 arpandan:HV('fibre (strap leaves), mats, thatch',['cooked pandan keys'],false,'Stripped, dried and plaited into waterproof boat-mats, sails, fenders and baskets.'),
 artamanu:HV('timber (coastal spars), knees, carving',[],true,'Tough interlocking-grain coastal hardwood for keels, knees and spars; pressed nut oil caulks seams.'),
 arhibiscus:HV('bast, cordage, fibre, knees',[],false,'Inner bast stripped and retted into salt-proof marine cordage, caulking oakum and net twine; light outrigger knees.'),
 naupaka:HV('none',[],true,'Fleshy coastal leaves crushed as a salt-burn poultice.'),
 ipomoea:HV('none',[],true,'Sand-binding runner; leaves used externally on sores.'),
 coconut:HV('timber, thatch, coir, fibre',['coconuts'],false,'Posts from old trunks, plaited frond thatch, and twisted coir fibre for spring-tide mooring warps.'),
 arkelp:HV('none',['dried kombu kelp'],true,'Stipes and blades burned in shore kilns for potash-soda kelp ash mortar, glass flux and marine soap.'),
 arseagrass:HV('thatch, mats, fibre',[],false,'Rot-resistant salt-hay cured for roof insulation, mattress stuffing and woven deck mats.'),
 arbyssus:HV('spinning (sea-silk byssus)',['mussel meat'],false,'Golden sea-silk byssus beard spun into prized Fleet-born cloth; valves burned for shell lime.'),
 aroyster:HV('none',['rock oysters'],false,'Cemented oyster shells and coralline crusts burned in coastal kilns into slaked shell limewash and mortar.')};
ARCHB.HARVEST_TAGS={
 curtain:['ash'],hem:[],limeshelf:['lime'],verdigris:['ash'],seepcomb:[],acidfelt:[],steamfan:[],
 araucaria:['timber','pitch'],arkauri:['timber','gum','pitch'],gymnostoma:[],pycnandra:['ash'],arphyllanthus:['ash'],
 costularia:['thatch'],arlepidosperma:['thatch','fibre'],ardracophyllum:[],arcodia:['tannin'],argrevillea:[],
 nepenthes:['fibre'],ardrosera:[],artreefern:['timber','thatch'],arpaperbark:['caulking','thatch'],
 ohia:['knees'],arrata:['knees','timber'],uluhe:['thatch'],arnephrolepis:[],
 mangrove:['timber','knees','tannin'],aravicennia:['knees','tannin'],arverdigrismangrove:['knees','timber','tannin','ash'],
 casuarina:[],arpandan:['fibre','thatch'],artamanu:['timber','knees','caulking'],arhibiscus:['bast','fibre','knees','caulking'],
 naupaka:[],ipomoea:[],coconut:['timber','thatch','fibre'],
 arkelp:['ash'],arseagrass:['thatch','fibre'],arbyssus:['byssus','fibre','lime'],aroyster:['lime']};
SPECIES.forEach(S=>{const h=ARCHB.HARVEST[S.key];if(h)h.tags=ARCHB.HARVEST_TAGS[S.key]||[];S.tags.harvest=h;});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);byKey.arcoconut=byKey.coconut;ARCHB.byKey=byKey;
ARCHB.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
ARCHB.speciesOfItem=ARCHB.plantOfItem;
ARCHB.CROPS=(ARCH.registerCrops(),typeof CROPS!=='undefined'&&CROPS&&CROPS.forBiome?CROPS.forBiome('arch'):ARCH.CROPS);
ARCHB.TRAP=typeof KTRAPS!=='undefined'?KTRAPS.make({kind:'pitfall',mouth:.06,preyMax:'insect',cycle:{wait:86400,shut:0,digest:0,reopen:0},lure:'nectar',danger:0}):null;
ARCHB.SUNDEW_TRAP=typeof KTRAPS!=='undefined'?KTRAPS.make({kind:'flypaper',mouth:.03,preyMax:'insect',cycle:{wait:43200,shut:1800,digest:28800,reopen:7200},lure:'dew',danger:0}):null;
if(BIO.kits&&BIO.kits.arch)BIO.kits.arch.api=ARCHB;

// ---------------------------------------------------------------- High-detail procedural bark & unclipped botanical foliage cards
// NOTE on DataTexture UV convention (30-core-foliage.js): canvas row y = 0 is v = 0 (the low/stem edge of clump(), hang(), and
// custom fronds); canvas row y = S is v = 1 (the outer/tip edge). Every card keeps a strict transparent perimeter margin so zero
// clipped straight quad edges can ever appear, and clamps to edge so mipmaps never wrap across borders.
function cardTex(S,draw,fillRGB){const t=BIO.alphaTex(S,draw,fillRGB);t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;return t;}

const TX={};
/* 1. Fissured silvery-ash & warm inner-bark texture for 'Ōhi'a Lehua */
TX.ohiaBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#8c857c';g.fillRect(0,0,W,H);
 for(let i=0;i<180;i++){const x=H01(i,1,11)*W,y=H01(i,2,11)*H,w=3+9*H01(i,3,11),h=28+70*H01(i,4,11);
  const v=Math.round(112+56*H01(i,5,11));g.fillStyle='rgb('+(v+6)+','+(v+2)+','+(v-4)+')';g.fillRect(x,y,w,h);
  if(y+h>H)g.fillRect(x,y-H,w,h);}
 for(let i=0;i<110;i++){const x=H01(i,6,12)*W,y=H01(i,7,12)*H,h=22+58*H01(i,8,12);
  g.strokeStyle=i%3===0?'rgba(58,48,40,0.68)':'rgba(74,66,58,0.52)';g.lineWidth=1.2+2.0*H01(i,9,12);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+(H01(i,10,12)-.5)*6,y+h);g.stroke();}
 /* Subtle pale crustose lava-lichen flecks */
 for(let i=0;i<36;i++){const x=H01(i,1,13)*W,y=H01(i,2,13)*H,r=2.5+5.5*H01(i,3,13);
  g.fillStyle='rgba(196,202,186,0.34)';g.beginPath();g.ellipse(x,y,r,r*.65,H01(i,4,13)*TAU,0,TAU);g.fill();}
},[1,1]);

/* 2. Deeply furrowed coastal ironwood bark for Casuarina & Gymnostoma she-oaks */
TX.casBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#766c62';g.fillRect(0,0,W,H);
 for(let i=0;i<32;i++){const x=(i+.5)*(W/32);
  g.fillStyle=i%2?'rgba(142,134,124,0.55)':'rgba(64,54,46,0.65)';g.fillRect(x-2.2,0,4.4,H);}
 for(let i=0;i<150;i++){const x=H01(i,1,14)*W,y=H01(i,2,14)*H,h=18+44*H01(i,3,14);
  g.strokeStyle=i%2?'rgba(46,38,32,0.62)':'rgba(164,156,146,0.38)';g.lineWidth=1.4+1.6*H01(i,4,14);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+(H01(i,5,14)-.5)*4,y+h);g.stroke();}
},[1,1]);

/* 3. Ringed & scaly tropical bark for Araucaria, Palm, Pycnandra & Mangrove */
TX.bark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#84786a';g.fillRect(0,0,W,H);
 for(let j=0;j<28;j++){const y=(j+.5)*(H/28);
  g.fillStyle=j%2?'rgba(62,54,46,0.42)':'rgba(156,146,132,0.36)';g.fillRect(0,y-1.6,W,3.2);}
 for(let i=0;i<95;i++){const x=H01(i,1,15)*W,y=H01(i,2,15)*H,w=6+14*H01(i,3,15),h=8+16*H01(i,4,15);
  const v=Math.round(108+48*H01(i,5,15));g.fillStyle='rgba('+v+','+(v-6)+','+(v-12)+',0.45)';g.fillRect(x,y,w,h);}
},[1,1]);

/* 4. Imbricated scale-leaf rope texture for Candelabra Araucaria boughs */
TX.rope=BIO.canvasTex(128,128,(g,W,H)=>{
 g.fillStyle='#6c7c64';g.fillRect(0,0,W,H);
 for(let row=0;row<16;row++)for(let col=0;col<10;col++){
  const cx=((col+(row%2)*.5)/10)*W,cy=(row/16)*H;
  const v=Math.round(138+54*H01(row,col,16));
  g.fillStyle='rgb('+(v-12)+','+(v+12)+','+(v-16)+')';
  g.beginPath();g.moveTo(cx,cy+9);g.lineTo(cx-6.5,cy);g.lineTo(cx+6.5,cy);g.closePath();g.fill();
 }
},[1,1]);

/* 5. 'Ōhi'a Lehua (Metrosideros polymorpha) branching leathery elliptic-leaf spray (512px, unclipped) */
TX.ohiaLeaf=cardTex(512,(g,S)=>{
 const drawLeaf=(cx,cy,rx,ry,ang,lum)=>{
  g.save();g.translate(cx,cy);g.rotate(ang);
  const v0=Math.round(clamp(lum,110,248)),vEdge=Math.round(clamp(lum+22,130,255));
  const grd=g.createLinearGradient(0,-ry,0,ry);
  grd.addColorStop(0,'rgb('+vEdge+','+Math.min(255,vEdge+6)+','+Math.max(95,vEdge-12)+')');
  grd.addColorStop(.5,'rgb('+v0+','+Math.min(255,v0+8)+','+Math.max(90,v0-14)+')');
  grd.addColorStop(1,'rgb('+Math.max(95,v0-24)+','+Math.max(100,v0-16)+','+Math.max(80,v0-28)+')');
  g.fillStyle=grd;
  g.beginPath();g.moveTo(-rx,0);g.quadraticCurveTo(0,-ry*1.12,rx,0);g.quadraticCurveTo(0,ry*1.12,-rx,0);g.closePath();g.fill();
  g.strokeStyle='rgba(236,244,216,0.55)';g.lineWidth=1.3;
  g.beginPath();g.moveTo(-rx*.88,0);g.lineTo(rx*.82,0);g.stroke();
  g.restore();
 };
 /* Woody branchlets radiating from (0.5S, 0.08S) out into 7 twigs inside [0.10S..0.90S] */
 const twigs=[
  [.50,.07,.50,.80],[.50,.14,.23,.68],[.50,.14,.77,.68],
  [.36,.38,.16,.48],[.64,.38,.84,.48],[.42,.46,.31,.83],[.58,.46,.69,.83]
 ];
 g.lineCap='round';
 twigs.forEach((tw,ti)=>{
  g.strokeStyle='rgba(116,104,92,0.94)';g.lineWidth=S*(ti===0?.013:.009);
  g.beginPath();g.moveTo(tw[0]*S,tw[1]*S);g.quadraticCurveTo((tw[0]+tw[2])*.5*S+(ti%2?8:-8),(tw[1]+tw[3])*.5*S,tw[2]*S,tw[3]*S);g.stroke();
 });
 /* Under-layer shaded leaves first, then sunlit upper-layer opposite pairs + terminal rosettes */
 for(let layer=0;layer<2;layer++){
  twigs.forEach((tw,ti)=>{
   const nNodes=layer===0?5:6;
   for(let k=1;k<=nNodes;k++){
    const f=k/(nNodes+.6),bx=lerp(tw[0],tw[2],f)*S,by=lerp(tw[1],tw[3],f)*S;
    const dir=Math.atan2((tw[3]-tw[1]),(tw[2]-tw[0]));
    const sz=S*(.044+.018*(1-f*.45))*(layer?1.0:.92);
    for(const side of [-1,1]){
     const j=H01(ti*17+k,layer*3+(side>0?1:2),21);
     const la=dir+side*(.68+.28*j)+(layer?.08:-.08);
     const lx=bx+Math.cos(la)*sz*.88,ly=by+Math.sin(la)*sz*.88;
     if(lx<S*.09||lx>S*.91||ly<S*.07||ly>S*.91)continue;
     const lum=(layer===0?148:206)+34*H01(ti*13+k,side+5,22);
     drawLeaf(lx,ly,sz,sz*.54,la,lum);
    }
   }
   /* Terminal 4-leaf rosette at twig tip */
   if(layer===1){
    const tx=tw[2]*S,ty=tw[3]*S,dir=Math.atan2(tw[3]-tw[1],tw[2]-tw[0]);
    for(let r=0;r<4;r++){
     const ra=dir+(r-1.5)*.62,sz=S*.040;
     const lx=tx+Math.cos(ra)*sz*.75,ly=ty+Math.sin(ra)*sz*.75;
     if(lx>=S*.09&&lx<=S*.91&&ly>=S*.08&&ly<=S*.91)drawLeaf(lx,ly,sz,sz*.52,ra,224+20*H01(ti,r,23));
    }
   }
  });
 }
},[178,194,162]);

/* 6. Lehua scarlet stamen-brush pom-pom blossom cluster (256px, unclipped) */
TX.ohiaBloom=cardTex(256,(g,S)=>{
 const puffs=[[.50,.52,.32],[.31,.44,.22],[.69,.46,.22]];
 puffs.forEach((pf,pi)=>{
  const cx=pf[0]*S,cy=pf[1]*S,rad=pf[2]*S;
  /* Small pale-green tomentose calyx cup at base */
  g.fillStyle='rgba(128,136,112,0.92)';
  g.beginPath();g.arc(cx,cy+rad*.18,rad*.22,0,TAU);g.fill();
  /* 44 glowing stamen filaments radiating in a brush hemisphere + bright pollen tips */
  for(let k=0;k<44;k++){
   const a=-Math.PI*.12+Math.PI*1.24*(k/43)+(H01(pi,k,31)-.5)*.14;
   const len=rad*(.68+.34*H01(pi,k,32));
   const ex=cx+Math.cos(a)*len,ey=cy+Math.sin(a)*len;
   const lum=Math.round(198+54*H01(pi,k,33));
   g.strokeStyle='rgba('+lum+','+Math.round(lum*.88)+','+Math.round(lum*.84)+',0.95)';
   g.lineWidth=2.1;
   g.beginPath();g.moveTo(cx+Math.cos(a)*rad*.12,cy+Math.sin(a)*rad*.12);
   g.quadraticCurveTo((cx+ex)*.5,(cy+ey)*.5+3,ex,ey);g.stroke();
   g.fillStyle='rgba(255,246,196,0.98)';
   g.beginPath();g.arc(ex,ey,1.8,0,TAU);g.fill();
  }
 });
},[216,64,52]);

/* 7. Uluhe / Eluhe (Dicranopteris linearis) dichotomously Y-forked pectinate staghorn fern frond (512px, razor-sharp cutout!) */
TX.uluhe=cardTex(512,(g,S)=>{
 /* Draws one comb-like pectinate pinna blade from (x0,y0) to (x1,y1) with acute tapering segments and zero border clip */
 const drawPectinateBlade=(x0,y0,x1,y1,maxPinnaL,lumBase,seedSalt)=>{
  const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
  const nPairs=Math.max(12,Math.round(L/(S*.016)));
  for(let i=1;i<nPairs;i++){
   const t=i/nPairs;
   /* Smooth envelope: rises rapidly from fork, stays lush across mid-blade, tapers cleanly to pointed apex at t->1 */
   const env=Math.sin(Math.pow(t,.72)*Math.PI)*(1-.18*t);
   const pLen=maxPinnaL*env;
   if(pLen<2.2)continue;
   const bx=x0+dx*t,by=y0+dy*t;
   const halfW=S*.0068*(.65+.45*env);
   for(const side of [-1,1]){
    /* Pinnae angle slightly forward (~74 deg from rachis) like true Dicranopteris linearis */
    const sweep=.26,pxDir=nx*side*Math.cos(sweep)+ux*Math.sin(sweep),pyDir=ny*side*Math.cos(sweep)+uy*Math.sin(sweep);
    const tx=bx+pxDir*pLen,ty=by+pyDir*pLen;
    if(tx<S*.05||tx>S*.95||ty<S*.04||ty>S*.95)continue;
    const lum=Math.round(clamp(lumBase+26*t+14*(side>0?1:0)+12*(H01(i,side+2,seedSalt)-.5),138,248));
    g.fillStyle='rgb('+Math.round(lum*.94)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.66)+')';
    g.beginPath();
    g.moveTo(bx-ux*halfW,by-uy*halfW);
    g.quadraticCurveTo(bx+pxDir*pLen*.55+ux*halfW*.4,by+pyDir*pLen*.55+uy*halfW*.4,tx,ty);
    g.quadraticCurveTo(bx+pxDir*pLen*.52-ux*halfW*.5,by+pyDir*pLen*.52-uy*halfW*.5,bx+ux*halfW,by+uy*halfW);
    g.closePath();
    g.fill();
    /* Fine pale midvein down each comb pinna */
    g.strokeStyle='rgba(238,248,196,0.42)';g.lineWidth=.9;
    g.beginPath();g.moveTo(bx,by);g.lineTo(bx+pxDir*pLen*.82,by+pyDir*pLen*.82);g.stroke();
   }
  }
  /* Wiry russet-olive rachis stem */
  g.strokeStyle='rgba(128,118,68,0.96)';g.lineWidth=S*.0075;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
 };

 /* Main stipe from (0.50S, 0.04S) up to primary Y-fork at (0.50S, 0.25S) */
 g.lineCap='round';
 g.strokeStyle='rgba(114,96,56,0.98)';g.lineWidth=S*.011;
 g.beginPath();g.moveTo(.50*S,.04*S);g.lineTo(.50*S,.25*S);g.stroke();

 /* Characteristic reflexed basal accessory pinnae at the primary fork */
 drawPectinateBlade(.50*S,.24*S,.20*S,.20*S,S*.048,176,41);
 drawPectinateBlade(.50*S,.24*S,.80*S,.20*S,S*.048,176,42);

 /* Primary Y-arms to secondary forks at (0.33S, 0.44S) and (0.67S, 0.44S) */
 g.strokeStyle='rgba(120,106,60,0.96)';g.lineWidth=S*.009;
 g.beginPath();g.moveTo(.50*S,.25*S);g.lineTo(.34*S,.43*S);g.moveTo(.50*S,.25*S);g.lineTo(.66*S,.43*S);g.stroke();
 /* Dormant fiddlehead bud in the primary fork axil */
 g.fillStyle='rgba(156,142,74,0.95)';g.beginPath();g.arc(.50*S,.27*S,S*.012,0,TAU);g.fill();

 /* Four lush terminal forked pectinate staghorn blades fanning cleanly inside [0.10S..0.90S, 0.43S..0.91S] */
 drawPectinateBlade(.34*S,.43*S,.16*S,.83*S,S*.074,192,43);
 drawPectinateBlade(.34*S,.43*S,.43*S,.90*S,S*.078,206,44);
 drawPectinateBlade(.66*S,.43*S,.57*S,.90*S,S*.078,206,45);
 drawPectinateBlade(.66*S,.43*S,.84*S,.83*S,S*.074,192,46);
},[176,198,104]);

/* 8. Beach She-Oak (Casuarina equisetifolia) feathery jointed cladode-needle spray (512px, unclipped) */
TX.casuarina=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const subBranches=[
  [.50,.06,.50,.56],[.50,.12,.26,.48],[.50,.12,.74,.48],[.38,.30,.18,.68],[.62,.30,.82,.68],[.46,.42,.36,.78],[.54,.42,.64,.78]
 ];
 subBranches.forEach((sb,si)=>{
  g.strokeStyle='rgba(104,94,82,0.92)';g.lineWidth=S*(si===0?.010:.0065);
  g.beginPath();g.moveTo(sb[0]*S,sb[1]*S);g.lineTo(sb[2]*S,sb[3]*S);g.stroke();
  /* Feathery, sweeping/drooping jointed Casuarina needle-branchlets along every woody twig */
  for(let k=0;k<28;k++){
   const f=.18+.82*(k/27),bx=lerp(sb[0],sb[2],f)*S,by=lerp(sb[1],sb[3],f)*S;
   const side=k%2===0?-1:1;
   const baseAng=Math.atan2(sb[3]-sb[1],sb[2]-sb[0])+side*(.35+.52*H01(si,k,51));
   const nLen=S*(.095+.075*H01(si,k,52))*(1-.18*f);
   const mx=bx+Math.cos(baseAng)*nLen*.55,my=by+Math.sin(baseAng)*nLen*.55+S*.018;
   const ex=bx+Math.cos(baseAng+side*.18)*nLen*.92,ey=by+Math.sin(baseAng)*nLen*.85+S*.045;
   if(ex<S*.07||ex>S*.93||ey<S*.06||ey>S*.93)continue;
   const lum=Math.round(166+68*H01(si,k,53));
   g.strokeStyle='rgba('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.02))+','+Math.round(lum*.88)+',0.90)';
   g.lineWidth=1.85;
   g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(mx,my,ex,ey);g.stroke();
   /* Pale whorled scale-node dot mid-cladode */
   g.fillStyle='rgba(226,236,214,0.65)';g.fillRect((bx+mx)*.5-.8,(by+my)*.5-.8,1.6,1.6);
  }
 });
},[148,168,138]);

/* 9. Weeping pendulous Casuarina needle curtain for BIO.geo.hang() (v=0 at top twig -> v=0.91 at hanging tips) */
TX.casDrape=cardTex(512,(g,S)=>{
 g.lineCap='round';
 /* Short woody twig collar at top center (0.50S, 0.03S) */
 g.strokeStyle='rgba(102,92,80,0.92)';g.lineWidth=S*.010;
 g.beginPath();g.moveTo(.34*S,.03*S);g.quadraticCurveTo(.50*S,.07*S,.66*S,.03*S);g.stroke();
 for(let k=0;k<46;k++){
  const x0=S*(.22+.56*H01(k,1,61)),y0=S*(.03+.08*H01(k,2,61));
  const len=S*(.52+.36*H01(k,3,61));
  const sway=(H01(k,4,61)-.5)*S*.14;
  const ex=clamp(x0+sway,S*.09,S*.91),ey=Math.min(S*.92,y0+len);
  const lum=Math.round(168+68*H01(k,5,61));
  g.strokeStyle='rgba('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.02))+','+Math.round(lum*.88)+',0.88)';
  g.lineWidth=1.75+.6*H01(k,6,61);
  g.beginPath();g.moveTo(x0,y0);g.bezierCurveTo(x0+sway*.35,y0+len*.35,x0+sway*.85,y0+len*.68,ex,ey);g.stroke();
 }
},[148,168,138]);

/* 10. Maquis She-Oak (Gymnostoma deplancheanum) upturned candelabrum needle-whorl spray (512px, unclipped) */
TX.gymno=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const stems=[[.50,.06,.50,.62],[.50,.14,.28,.56],[.50,.14,.72,.56],[.38,.34,.22,.72],[.62,.34,.78,.72]];
 stems.forEach((st,si)=>{
  g.strokeStyle='rgba(92,82,72,0.94)';g.lineWidth=S*.009;
  g.beginPath();g.moveTo(st[0]*S,st[1]*S);g.lineTo(st[2]*S,st[3]*S);g.stroke();
  /* Upturned brush-like photosynthetic branchlet tufts at stem tips */
  const tx=st[2]*S,ty=st[3]*S;
  for(let k=0;k<22;k++){
   const ang=Math.PI*.5+(H01(si,k,71)-.5)*1.65;
   const len=S*(.08+.085*H01(si,k,72));
   const ex=tx+Math.cos(ang)*len,ey=ty+Math.sin(ang)*len;
   if(ex<S*.08||ex>S*.92||ey<S*.08||ey>S*.92)continue;
   const lum=Math.round(160+72*H01(si,k,73));
   g.strokeStyle='rgba('+Math.round(lum*.90)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.84)+',0.92)';
   g.lineWidth=2.0;
   g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo((tx+ex)*.5,ty+len*.35,ex,ey);g.stroke();
  }
 });
},[136,156,120]);

/* 11. Broad glossy tropical leaf rosette for Sève bleue, Naupaka & Red Mangrove (512px, unclipped) */
TX.glossy=cardTex(512,(g,S)=>{
 const twigs=[[.50,.07,.50,.76],[.50,.16,.24,.64],[.50,.16,.76,.64],[.38,.42,.26,.82],[.62,.42,.74,.82]];
 twigs.forEach(tw=>{
  g.strokeStyle='rgba(108,96,82,0.92)';g.lineWidth=S*.010;
  g.beginPath();g.moveTo(tw[0]*S,tw[1]*S);g.lineTo(tw[2]*S,tw[3]*S);g.stroke();
 });
 for(let layer=0;layer<2;layer++){
  for(let k=0;k<34;k++){
   const tw=twigs[k%twigs.length],f=.22+.74*H01(k,layer+1,81);
   const bx=lerp(tw[0],tw[2],f)*S,by=lerp(tw[1],tw[3],f)*S;
   const ang=Math.atan2(tw[3]-tw[1],tw[2]-tw[0])+((k%2?1:-1)*(.55+.45*H01(k,layer+3,81)));
   const rx=S*(.062+.026*H01(k,5,81)),ry=rx*.48;
   const cx=bx+Math.cos(ang)*rx*.78,cy=by+Math.sin(ang)*rx*.78;
   if(cx<S*.10||cx>S*.90||cy<S*.09||cy>S*.90)continue;
   const lum=Math.round((layer?208:156)+36*H01(k,layer+7,81));
   g.save();g.translate(cx,cy);g.rotate(ang);
   g.fillStyle='rgb('+Math.round(lum*.94)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.90)+')';
   g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.fill();
   g.strokeStyle='rgba(242,248,228,0.52)';g.lineWidth=1.4;
   g.beginPath();g.moveTo(-rx*.82,0);g.lineTo(rx*.82,0);g.stroke();
   g.restore();
  }
 }
},[182,202,174]);

/* 12. Upright arching Costularia sedge tussock blades (rooted at v=0.04 -> arching tips at v=0.90) */
TX.sedge=cardTex(256,(g,S)=>{
 g.lineCap='round';
 for(let k=0;k<64;k++){
  const x0=S*(.34+.32*H01(k,1,91)),spread=(H01(k,2,91)-.5)*2;
  const h=S*(.62+.28*H01(k,3,91));
  const lum=Math.round(176+64*H01(k,4,91));
  g.strokeStyle='rgba('+lum+','+lum+','+Math.round(lum*.86)+',0.94)';g.lineWidth=2.3;
  g.beginPath();g.moveTo(x0,S*.04);
  g.quadraticCurveTo(x0+spread*S*.12,S*.04+h*.58,clamp(x0+spread*S*.34,S*.06,S*.94),S*.04+h);
  g.stroke();
 }
},[208,208,184]);

/* 13. Hoop-scarred Araucaria & Kauri conifer bark fallback (swapped to library bark.araucaria) */
TX.araucariaBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#7c7064';g.fillRect(0,0,W,H);
 for(let j=0;j<34;j++){const y=(j+.5)*(H/34);
  g.fillStyle=j%2?'rgba(54,46,38,0.52)':'rgba(162,150,136,0.40)';g.fillRect(0,y-1.8,W,3.4);}
 for(let i=0;i<90;i++){const x=H01(i,1,92)*W,y=H01(i,2,92)*H,r=4+10*H01(i,3,92);
  g.fillStyle='rgba(148,136,120,0.32)';g.beginPath();g.ellipse(x,y,r*1.4,r*.55,0,0,TAU);g.fill();}
},[1,1]);

/* 14. Layered cream-buff peeling Melaleuca paperbark fallback (swapped to library bark.paperbark) */
TX.paperbark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#cfc8ba';g.fillRect(0,0,W,H);
 for(let i=0;i<120;i++){const x=H01(i,1,93)*W,y=H01(i,2,93)*H,w=8+22*H01(i,3,93),h=24+68*H01(i,4,93);
  const v=Math.round(182+58*H01(i,5,93));g.fillStyle='rgba('+v+','+(v-6)+','+(v-16)+',0.55)';g.fillRect(x,y,w,h);
  g.strokeStyle='rgba(112,98,82,0.42)';g.lineWidth=1.1;g.strokeRect(x,y,w,h);}
},[1,1]);

/* 15. Lenticelled dark mangrove prop-root bark fallback (swapped to library bark.mangrove) */
TX.mangroveBark=BIO.canvasTex(256,256,(g,W,H)=>{
 g.fillStyle='#584e46';g.fillRect(0,0,W,H);
 for(let i=0;i<160;i++){const x=H01(i,1,94)*W,y=H01(i,2,94)*H,w=3+7*H01(i,3,94),h=14+38*H01(i,4,94);
  const v=Math.round(68+46*H01(i,5,94));g.fillStyle='rgba('+v+','+(v-6)+','+(v-10)+',0.48)';g.fillRect(x,y,w,h);}
 for(let i=0;i<90;i++){const x=H01(i,6,94)*W,y=H01(i,7,94)*H;
  g.fillStyle='rgba(176,164,148,0.42)';g.fillRect(x,y,3.2,1.6);}
},[1,1]);

/* 16. Pinnate coconut palm frond card (512px, v=0 petiole base -> v=0.95 tapering plume tip, unclipped) */
TX.palmFrond=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const nPairs=38;
 for(let i=1;i<=nPairs;i++){
  const t=i/(nPairs+1),ry=S*(.05+.88*t);
  const env=Math.sin(Math.pow(t,.68)*Math.PI)*(1-.12*t);
  const pLen=S*.40*env;
  if(pLen<4)continue;
  for(const side of [-1,1]){
   const sweep=.34+.26*t,ang=side*(Math.PI*.5-sweep)+(H01(i,side+2,95)-.5)*.05;
   const mx=S*.5+Math.cos(ang)*pLen*.56,my=ry+Math.sin(Math.abs(sweep))*pLen*.42;
   const tx=clamp(S*.5+Math.cos(ang)*pLen,.04*S,.96*S),ty=clamp(ry+Math.sin(Math.abs(sweep))*pLen*.88,.04*S,.96*S);
   const hw=S*.0078*(.6+.5*env);
   const lum=Math.round(168+64*env+22*(H01(i,side+5,95)-.5));
   g.fillStyle='rgb('+Math.round(lum*.92)+','+Math.min(255,Math.round(lum*1.05))+','+Math.round(lum*.74)+')';
   g.beginPath();g.moveTo(S*.5,ry-hw);g.quadraticCurveTo(mx,my-hw*.7,tx,ty);g.quadraticCurveTo(mx,my+hw*.9,S*.5,ry+hw);g.closePath();g.fill();
  }
 }
 g.strokeStyle='rgba(168,176,112,0.96)';g.lineWidth=S*.012;
 g.beginPath();g.moveTo(S*.5,S*.03);g.lineTo(S*.5,S*.94);g.stroke();
},[154,182,112]);

/* 17. Keeled toothed Pandanus strap leaf fallback (swapped to library card.strap.pandan) */
TX.pandanStrap=cardTex(256,(g,S)=>{
 for(let i=0;i<36;i++){
  const t0=i/36,t1=(i+1)/36,y0=S*(.04+.90*t0),y1=S*(.04+.90*t1);
  const w0=S*.11*(1-.78*Math.pow(t0,1.25)),w1=S*.11*(1-.78*Math.pow(t1,1.25));
  const lum=Math.round(176+48*Math.sin(t0*Math.PI));
  g.fillStyle='rgb('+Math.round(lum*.90)+','+Math.min(255,Math.round(lum*1.04))+','+Math.round(lum*.78)+')';
  g.beginPath();g.moveTo(S*.5-w0,y0);g.lineTo(S*.5+w0,y0);g.lineTo(S*.5+w1,y1);g.lineTo(S*.5-w1,y1);g.closePath();g.fill();
 }
 g.strokeStyle='rgba(232,242,196,0.65)';g.lineWidth=2.0;g.beginPath();g.moveTo(S*.5,S*.04);g.lineTo(S*.5,S*.92);g.stroke();
},[158,186,118]);

/* 18. Lacy bipinnate Cyathea tree-fern & Nephrolepis sword-fern frond card (512px, unclipped) */
TX.fernFrond=cardTex(512,(g,S)=>{
 g.lineCap='round';
 const nPin=26;
 for(let i=1;i<=nPin;i++){
  const t=i/(nPin+1),ry=S*(.07+.85*t),env=Math.sin(Math.pow(t,.65)*Math.PI)*(1-.15*t),pL=S*.36*env;
  if(pL<4)continue;
  for(const side of [-1,1]){
   const px1=S*.5+side*pL,py1=ry+pL*.22;
   const nSub=Math.max(5,Math.round(12*env));
   for(let k=1;k<nSub;k++){
    const f=k/nSub,bx=lerp(S*.5,px1,f),by=lerp(ry,py1,f),sl=S*.032*env*(1-.45*f);
    const lum=Math.round(168+62*env+18*(H01(i*9+k,side+2,96)-.5));
    g.fillStyle='rgb('+Math.round(lum*.90)+','+Math.min(255,Math.round(lum*1.06))+','+Math.round(lum*.72)+')';
    g.beginPath();g.ellipse(bx,by,sl*.48,sl,side*.25,0,TAU);g.fill();
   }
   g.strokeStyle='rgba(116,126,72,0.9)';g.lineWidth=1.5;g.beginPath();g.moveTo(S*.5,ry);g.lineTo(px1,py1);g.stroke();
  }
 }
 g.strokeStyle='rgba(92,76,48,0.96)';g.lineWidth=S*.011;g.beginPath();g.moveTo(S*.5,S*.04);g.lineTo(S*.5,S*.93);g.stroke();
},[146,178,104]);

/* 19. Corrugated golden-olive kombu kelp blade card (256px, unclipped) */
TX.kelpBlade=cardTex(256,(g,S)=>{
 for(let i=0;i<32;i++){
  const t0=i/32,t1=(i+1)/32,y0=S*(.04+.90*t0),y1=S*(.04+.90*t1);
  const w0=S*.22*Math.sin(Math.pow(t0,.6)*Math.PI*.94),w1=S*.22*Math.sin(Math.pow(t1,.6)*Math.PI*.94);
  const wav0=Math.sin(t0*14)*S*.03,wav1=Math.sin(t1*14)*S*.03;
  const lum=Math.round(170+52*Math.sin(t0*9)*.5+24*t0);
  g.fillStyle='rgb('+lum+','+Math.round(lum*.94)+','+Math.round(lum*.58)+')';
  g.beginPath();g.moveTo(S*.5-w0+wav0,y0);g.lineTo(S*.5+w0+wav0,y0);g.lineTo(S*.5+w1+wav1,y1);g.lineTo(S*.5-w1+wav1,y1);g.closePath();g.fill();
 }
},[164,148,74]);

const vcol=(o)=>new T3.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.8,metalness:0,vertexColors:true},o||{}));
const M=ARCHB.M={
 needles:BIO.leafMat(TX.gymno,'ar-needles',{aN:true,swayW:'.65',swayA:.045,alphaTest:.38}),
 casuarina:BIO.leafMat(TX.casuarina,'ar-casuarina',{aN:true,swayW:'.70',swayA:.06,alphaTest:.36}),
 casDrape:BIO.leafMat(TX.casDrape,'ar-casdrape',{aN:false,swayW:'(-position.y)',swayA:.11,axis:1,alphaTest:.34}),
 ohiaLeaf:BIO.leafMat(TX.ohiaLeaf,'ar-ohialeaf',{aN:true,swayW:'.55',swayA:.045,alphaTest:.40}),
 ohiaBloom:BIO.leafMat(TX.ohiaBloom,'ar-ohiabloom',{aN:false,swayW:'.60',swayA:.05,alphaTest:.42}),
 uluhe:BIO.leafMat(TX.uluhe,'ar-uluhe',{aN:false,swayW:'(position.y)',swayA:.055,alphaTest:.44}),
 glossy:BIO.leafMat(TX.glossy,'ar-glossy',{aN:true,swayW:'.55',swayA:.045,alphaTest:.40}),
 sedge:BIO.leafMat(TX.sedge,'ar-sedge',{aN:false,swayW:'(position.y+.5)',swayA:.07,alphaTest:.36}),
 palmFrond:BIO.leafMat(TX.palmFrond,'ar-palmfrond',{aN:false,swayW:'(position.x)',swayA:.085,alphaTest:.36}),
 pandanStrap:BIO.leafMat(TX.pandanStrap,'ar-pandanstrap',{aN:false,swayW:'(position.x)',swayA:.065,alphaTest:.38}),
 fernFrond:BIO.leafMat(TX.fernFrond,'ar-fernfrond',{aN:false,swayW:'(position.x)',swayA:.06,alphaTest:.38}),
 kelpBlade:BIO.leafMat(TX.kelpBlade,'ar-kelpblade',{aN:false,swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.34}),
 curtain:vcol({roughness:.38,envMapIntensity:.35}),lime:vcol({roughness:.7}),flesh:vcol({roughness:.6}),comb:vcol({roughness:.25,metalness:.15}),felt:vcol({roughness:.95}),
 amber:vcol({roughness:.24,metalness:.06}),tealsap:vcol({roughness:.28,metalness:.10,emissive:0x0a4a46,emissiveIntensity:.22}),
 byssus:vcol({roughness:.46,metalness:.12}),oyster:vcol({roughness:.78,metalness:.03}),
 bark:BIO.barkMat(TX.bark),araucariaBark:BIO.barkMat(TX.araucariaBark),paperbark:BIO.barkMat(TX.paperbark),mangroveBark:BIO.barkMat(TX.mangroveBark),
 ohiaBark:BIO.barkMat(TX.ohiaBark),casBark:BIO.barkMat(TX.casBark),rope:BIO.barkMat(TX.rope)};
ARCHB.SWAP=BIO.libSwap('arch',M);

/* Merged bark buckets for multi-limbed structural trees */
BIO.bucket('ar_ohia_bark',M.ohiaBark,{label:'Ohia, rata & tamanu gnarled trunks & limbs',uvScale:[0.85,1.35]});
BIO.bucket('ar_cas_bark',M.casBark,{label:'Beach she-oak furrowed trunks & boughs',uvScale:[1.05,1.55]});
BIO.bucket('ar_gymno_bark',M.casBark,{label:'Maquis she-oak & dragon-heath wiry stems',uvScale:[0.55,1.05]});
BIO.bucket('ar_araucaria_bark',M.araucariaBark,{label:'Kauri & araucaria hoop-barked trunks & boughs',uvScale:[1.2,1.6]});
BIO.bucket('ar_paper_bark',M.paperbark,{label:'Niaouli paperbark trunks & boughs',uvScale:[1.1,1.5]});
BIO.bucket('ar_mangrove_bark',M.mangroveBark,{label:'Mangrove prop-roots, pandanus & sea-hibiscus stems',uvScale:[0.9,1.3]});

/* Custom 7-frond arching 3D rosette geometry for scrambling Uluhe staghorn fern thickets (single-span v=0..1 per forked frond!) */
function makeUluheThicketGeo(){
 const pos=[],nor=[],uv=[];
 const rings=[
  {n:5,tilt:.62,len:1.00,w:.54,arch:.42,droop:.18,az0:.15},
  {n:3,tilt:.34,len:.82,w:.46,arch:.48,droop:.08,az0:.78}
 ];
 const nSeg=4;
 rings.forEach(R=>{
  for(let f=0;f<R.n;f++){
   const az=R.az0+(f/R.n)*TAU,ca=Math.cos(az),sa=Math.sin(az);
   const P=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const rad=R.len*t*Math.sin(R.tilt+.28*t);
    const yy=R.arch*Math.sin(t*1.85)+R.len*t*Math.cos(R.tilt)*.42-R.droop*t*t;
    const hw=R.w*(.22+.78*Math.sin(Math.pow(t,.65)*Math.PI*.88));
    const cx=ca*rad,cz=sa*rad,tx=-sa*hw,tz=ca*hw;
    P.push([cx-tx,yy,cz-tz,0,t],[cx+tx,yy,cz+tz,1,t]);
   }
   for(let i=0;i<nSeg;i++){
    const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
    const nx=ca*.28,ny=.92,nz=sa*.28,nl=Math.hypot(nx,ny,nz);
    [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(nx/nl,ny/nl,nz/nl);});
   }
  }
 });
 return BIO.geo._make(pos,nor,uv);
}

/* Multi-segment V-cambered arching-and-drooping pinnate frond geometry (pinned at origin, arching along +x, v=0..1 once) */
function makeDroopFrondGeo(nSeg,arch,droop,halfW,vFold){
 const pos=[],nor=[],uv=[],L=[],C0=[],R0=[];
 for(let i=0;i<=nSeg;i++){
  const t=i/nSeg,x=t*(1-.14*t*t),y=arch*Math.sin(t*1.95)-droop*t*t*t;
  const env=Math.sin(Math.pow(t,.62)*Math.PI*.96)*(.88+.12*(1-t)),w=halfW*(.08+.92*env),vf=vFold*env;
  L.push([x,y-vf,-w,0,t]);C0.push([x,y,0,.5,t]);R0.push([x,y-vf,w,1,t]);
 }
 for(let i=0;i<nSeg;i++){
  [[L[i],C0[i],L[i+1],C0[i+1],-.28],[C0[i],R0[i],C0[i+1],R0[i+1],.28]].forEach(s=>{
   const a=s[0],b=s[1],c=s[2],d=s[3],nz=s[4],nl=Math.hypot(.15,.94,nz);
   [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(.15/nl,.94/nl,nz/nl);});
  });
 }
 return BIO.geo._make(pos,nor,uv);
}

/* 6-frond upright arching Nephrolepis sword-fern tuft geometry */
function makeSwordFernGeo(){
 const pos=[],nor=[],uv=[],nF=6,nSeg=4;
 for(let f=0;f<nF;f++){
  const az=(f/nF)*TAU+(f%2)*.18,ca=Math.cos(az),sa=Math.sin(az),tilt=.42+(f%2)*.24,P=[];
  for(let i=0;i<=nSeg;i++){
   const t=i/nSeg,rad=t*Math.sin(tilt+.24*t)*.82,yy=t*Math.cos(tilt)*.92-.16*t*t;
   const hw=.22*(.18+.82*Math.sin(Math.pow(t,.65)*Math.PI*.92)),cx=ca*rad,cz=sa*rad,tx=-sa*hw,tz=ca*hw;
   P.push([cx-tx,yy,cz-tz,0,t],[cx+tx,yy,cz+tz,1,t]);
  }
  for(let i=0;i<nSeg;i++){
   const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3],nl=Math.hypot(ca*.3,.9,sa*.3);
   [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(ca*.3/nl,.9/nl,sa*.3/nl);});
  }
 }
 return BIO.geo._make(pos,nor,uv);
}

/* Clustered weeping golden kauri-gum stalactite geometry (origin at top bough attachment, hanging down -y) */
function makeKauriGumGeo(){
 const pos=[],nor=[],col=[],idx=[],lobes=[[0,0,1,.22],[.14,.08,.68,.14],[-.13,.06,.58,.13]],nr=5,ns=6;
 lobes.forEach(lb=>{
  const b=pos.length/3;
  for(let j=0;j<=nr;j++){
   const t=j/nr,y=-t*lb[2],r=t===1?.015:lb[3]*Math.sin(Math.pow(t,.55)*Math.PI*.92+.22)*(1+.12*Math.sin(t*9));
   for(let i=0;i<=ns;i++){
    const a=i/ns*TAU,px=lb[0]+Math.cos(a)*r,pz=lb[1]+Math.sin(a)*r,sh=.78+.22*(1-t);
    pos.push(px,y,pz);nor.push(Math.cos(a),-.15,Math.sin(a));col.push(sh,sh*.92,sh*.76);
   }
  }
  for(let j=0;j<nr;j++)for(let i=0;i<ns;i++){const a=b+j*(ns+1)+i,c=a+ns+1;idx.push(a,c,a+1,a+1,c,c+1);}
 });
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();return g;
}

/* Clustered upright Pinna / Bathymodiolus fan-mussel bed geometry with golden byssus base */
function makeByssusBedGeo(){
 const pos=[],nor=[],col=[],idx=[];
 for(let m=0;m<5;m++){
  const az=(m/5)*TAU+.35*m,d=m?.26:0,ox=Math.cos(az)*d,oz=Math.sin(az)*d,tilt=m?.28:.08,h=m?.78:.95,b=pos.length/3;
  const ca=Math.cos(az),sa=Math.sin(az);
  for(let j=0;j<=3;j++){
   const t=j/3,w=.05+.22*Math.pow(t,.75),th=.04+.07*Math.sin(t*Math.PI),yy=t*h,rr0=t*tilt*h;
   for(let i=0;i<=6;i++){
    const a=i/6*TAU,lx=Math.cos(a)*w,lz=Math.sin(a)*th;
    pos.push(ox+ca*rr0-sa*lx+ca*lz,yy,oz+sa*rr0+ca*lx+sa*lz);nor.push(ca*.3,.85,sa*.3);
    const bys=t<.25?1:0;col.push(bys?.92:(.55+.35*t),bys?.78:(.48+.32*t),bys?.32:(.58+.32*t));
   }
  }
  for(let j=0;j<3;j++)for(let i=0;i<6;i++){const a=b+j*7+i,c=a+7;idx.push(a,a+1,c,a+1,c+1,c);}
 }
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setIndex(idx);g.computeVertexNormals();return g;
}

/* Hanging cluster of 4 coconuts under the crownshaft */
function makeCoconutClusterGeo(){
 const pos=[],nor=[],col=[],idx=[],offs=[[.14,-.10,0],[-.12,-.12,.09],[.02,-.14,-.13],[0,-.24,.02]];
 offs.forEach(o=>{
  const s=new T3.IcosahedronGeometry(.13,1),p=s.attributes.position,n=s.attributes.normal,b=pos.length/3;
  for(let i=0;i<p.count;i++){pos.push(p.getX(i)+o[0],p.getY(i)*1.22+o[1],p.getZ(i)+o[2]);nor.push(n.getX(i),n.getY(i),n.getZ(i));
   const sh=.76+.24*clamp(p.getY(i)/.13*.5+.5,0,1);col.push(sh,sh,sh*.92);}
  if(s.index){const ix=s.index.array;for(let i=0;i<ix.length;i++)idx.push(b+ix[i]);}
  else for(let i=0;i<p.count;i++)idx.push(b+i);
 });
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
 g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
 g.setIndex(idx);return g;
}

const PALM_FROND_GEO=makeDroopFrondGeo(5,.34,.42,.28,.075);
const TREEFERN_FROND_GEO=makeDroopFrondGeo(4,.28,.22,.26,.045);

// ---------------------------------------------------------------- the items
// THE CURTAIN: a unit wall 1 long (+x) and 1 tall (+y), two sheets 3 cm apart with a wave through them; the +z sheet white (the alkaline face), the -z
// sheet black-green (the acid face); ribs up the sheet; a row of blisters near the foot. The kit turns +z toward the alkaline water (60)
{const nx=16,ny=8,pos=[],col=[],nor=[],idx=[];const W=(x,y)=>.07*Math.sin(x*TAU*1.3+y*1.1)+.03*Math.sin(x*TAU*4.1+1.7);
 for(const side of [1,-1]){const b=pos.length/3;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=i/nx,y=j/ny,rib=.012*Math.cos(x*TAU*9),z=W(x,y)+side*(.015+rib);
   pos.push(x,y*(1-.06*Math.sin(x*TAU)),z);nor.push(0,0,side);
   const t=y,k=.85+.15*Math.cos(x*TAU*9);if(side>0)col.push(.92*k,.93*k,.9*k);else col.push((.025+.03*t)*k,(.045+.05*t)*k,(.035+.03*t)*k);}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=b+j*(nx+1)+i,c=a+nx+1;if(side>0)idx.push(a,a+1,c,a+1,c+1,c);else idx.push(a,c,a+1,a+1,c,c+1);}}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 BIO.def('arcurtain',g,M.curtain,{label:'Curtain (acid face black-green, alkaline face white)'});}
{const g=new T3.CylinderGeometry(.5,.5,1,7,1,true);g.rotateZ(Math.PI/2);g.translate(.5,0,0);const c=[],p=g.attributes.position;for(let i=0;i<p.count;i++)c.push(1,1,1);
 g.setAttribute('color',new T3.Float32BufferAttribute(c,3));BIO.def('arcurtainhem',g,M.flesh,{label:'Curtain (its living hem)'});}
BIO.def('arhem',BIO.fung.comb({w:1,d:.25,tilt:.1,lobes:4,seg:6}),M.lime,{label:'Hem frill (young curtain)'});
BIO.def('arlime',BIO.fung.bracket({arc:Math.PI*.9,seg:8,thick:.25,droop:.08,wav:4,wavA:.08}),M.lime,{label:'Lime shelf'});
BIO.def('arverd',BIO.fung.cap({form:'dome',h:.42,seg:12,rings:3,lump:.25,wav:6,wavA:.05,under:'gills',seed:20201}),M.flesh,{label:'Verdigris cap'});
BIO.def('arverdstalk',BIO.fung.stalk({r0:.16,r1:.11,seg:7,rings:3}),M.flesh,{label:'Verdigris cap (stalk)'});
BIO.def('arcomb',BIO.fung.comb({w:1,d:.45,tilt:.3,lobes:3,seg:6}),M.comb,{label:'Seep comb'});
BIO.def('arfelt',BIO.fung.cap({form:'disc',h:.08,seg:10,rings:2,lump:.5,wav:7,wavA:.15,under:'none',uv:'planar',seed:20202}),M.felt,{label:'Acid felt'});
BIO.def('arfan',BIO.fung.cap({form:'funnel',h:.3,seg:9,rings:2,wav:5,wavA:.2,under:'none',seed:20203}),M.flesh,{label:'Steam fan'});
// EARTH items (single-line BIO.def for check_cells.py)
BIO.def('artrunk',BIO.fung.stalk({r0:.05,r1:.025,seg:7,rings:6}),M.araucariaBark,{label:'Candelabra araucaria (trunk)'});
BIO.def('arbough',BIO.fung.stalk({r0:.11,r1:.08,seg:6,rings:6,bend:.35}),M.rope,{label:'Candelabra araucaria (arm)'});
BIO.def('arkauri_trunk',BIO.fung.stalk({r0:.14,r1:.10,seg:7,rings:4}),M.araucariaBark,{label:'Maquis kauri (trunk)'});
BIO.def('arkauri_fol',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Maquis kauri (crown)'});
BIO.def('arkauri_gum',makeKauriGumGeo(),M.amber,{label:'Maquis kauri (weeping kauri-gum resin)'});
BIO.def('argymno',BIO.geo.clump(),M.needles,{attrs:['aN'],label:'Maquis she-oak'});
BIO.def('arpycn',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Sève bleue'});
BIO.def('arpycntrunk',BIO.fung.stalk({r0:.06,r1:.04,seg:6,rings:3}),M.bark,{label:'Sève bleue (stem)'});
BIO.def('arphyllanthus',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Green-sap hyperaccumulator'});
BIO.def('arsedge',BIO.geo.clump(),M.sedge,{label:'Maquis sedge'});
BIO.def('arlepidosperma',BIO.geo.clump(),M.sedge,{label:'Sword-sedge'});
BIO.def('ardracophyllum',BIO.geo.clump(),M.sedge,{label:'Dragon-heath'});
BIO.def('arcodia',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'White-puff maquis shrub'});
BIO.def('arcodia_bloom',BIO.geo.bloom(),M.ohiaBloom,{onLeaf:true,label:'White-puff maquis shrub (blossom)'});
BIO.def('argrevillea',BIO.geo.clump(),M.needles,{attrs:['aN'],label:'Serpentine grevillea'});
BIO.def('argrevillea_bloom',BIO.geo.bloom(),M.ohiaBloom,{onLeaf:true,label:'Serpentine grevillea (raceme)'});
BIO.def('arpitch',BIO.fung.bladder({swell:.55,neck:.42,pleats:0,seg:9,rings:5,h:1.6}),M.flesh,{label:'Pitcher plant'});
BIO.def('ardrosera',BIO.fung.cap({form:'disc',h:.06,seg:9,rings:2,lump:.45,wav:8,wavA:.22,under:'none',uv:'planar',seed:20205}),M.amber,{label:'Ultramafic sundew'});
BIO.def('artreefern_trunk',BIO.fung.stalk({r0:.09,r1:.065,seg:6,rings:6,bend:.10,ribs:12,ribA:.07}),M.bark,{label:'Gully tree-fern (caudex trunk)'});
BIO.def('artreefern_frond',TREEFERN_FROND_GEO,M.fernFrond,{label:'Gully tree-fern (frond)'});
BIO.def('arpaperbark_trunk',BIO.fung.stalk({r0:.13,r1:.085,seg:7,rings:4,bend:.08}),M.paperbark,{label:'Niaouli paperbark (trunk)'});
BIO.def('arpaperbark_fol',BIO.geo.clump(),M.ohiaLeaf,{attrs:['aN'],label:'Niaouli paperbark (crown)'});
BIO.def('arohiatrunk',BIO.fung.stalk({r0:.13,r1:.08,seg:7,rings:4,bend:.08}),M.ohiaBark,{label:'Ohia lehua (trunk)'});
BIO.def('arohia',BIO.geo.clump(),M.ohiaLeaf,{attrs:['aN'],label:'Ohia lehua'});
BIO.def('arohia_bloom',BIO.geo.bloom(),M.ohiaBloom,{onLeaf:true,label:'Ohia lehua (scarlet brush flower)'});
BIO.def('arrata_trunk',BIO.fung.stalk({r0:.15,r1:.09,seg:7,rings:4,bend:.16}),M.ohiaBark,{label:'Gorge rata (reaction-wood trunk)'});
BIO.def('arrata_fol',BIO.geo.clump(),M.ohiaLeaf,{attrs:['aN'],label:'Gorge rata (crown)'});
BIO.def('aruluhe',makeUluheThicketGeo(),M.uluhe,{label:'Uluhe fern'});
BIO.def('arnephrolepis',makeSwordFernGeo(),M.fernFrond,{label:'Sword fern'});
BIO.def('armangroveprop',BIO.fung.stalk({r0:.05,r1:.04,seg:5,rings:5,bend:.45}),M.mangroveBark,{label:'Red mangrove (prop roots)'});
BIO.def('armangrove',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Red mangrove'});
BIO.def('aravicennia_fol',BIO.geo.clump(),M.ohiaLeaf,{attrs:['aN'],label:'Grey mangrove'});
BIO.def('aravicennia_pneum',BIO.fung.stalk({r0:.028,r1:.016,seg:5,rings:3,bend:.06}),M.mangroveBark,{label:'Grey mangrove (pneumatophores)'});
BIO.def('arverdigris_fol',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Teal-sap prop-wood (crown)'});
BIO.def('artealsap_scar',BIO.fung.stalk({r0:.10,r1:.06,seg:6,rings:4,bend:.18,ribs:5,ribA:.15}),M.tealsap,{label:'Teal-sap prop-wood (20% Ni latex scar)'});
BIO.def('arcastrunk',BIO.fung.stalk({r0:.14,r1:.09,seg:7,rings:4,bend:.05}),M.casBark,{label:'Beach she-oak (trunk)'});
BIO.def('arcas',BIO.geo.clump(),M.casuarina,{attrs:['aN'],label:'Beach she-oak'});
BIO.def('arcas_drape',BIO.geo.hang(),M.casDrape,{label:'Beach she-oak (weeping cladodes)'});
BIO.def('arpandan_trunk',BIO.fung.stalk({r0:.09,r1:.065,seg:6,rings:5,bend:.14,ribs:14,ribA:.06}),M.mangroveBark,{label:'Strand pandanus (ringed stem)'});
BIO.def('arpandan_strap',BIO.geo.frond(4),M.pandanStrap,{label:'Strand pandanus (strap leaf)'});
BIO.def('arpandan_fruit',BIO.fung.bladder({swell:.68,neck:.35,pleats:8,pleatA:.08,seg:8,rings:4,h:1.15}),M.flesh,{label:'Strand pandanus (fruit key)'});
BIO.def('artamanu_trunk',BIO.fung.stalk({r0:.16,r1:.10,seg:7,rings:4,bend:.18}),M.ohiaBark,{label:'Tamanu (coastal hardwood trunk)'});
BIO.def('artamanu_fol',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Tamanu (crown)'});
BIO.def('arhibiscus_fol',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Sea hibiscus'});
BIO.def('arhibiscus_bloom',BIO.geo.bloom(),M.ohiaBloom,{onLeaf:true,label:'Sea hibiscus (yellow flower)'});
BIO.def('arnaupaka',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Beach naupaka'});
BIO.def('aripomoea',BIO.fung.cap({form:'disc',h:.05,seg:8,rings:2,lump:.6,wav:6,wavA:.2,under:'none',uv:'planar',seed:20204}),M.flesh,{label:'Beach morning glory'});
BIO.def('arpalmtrunk',BIO.fung.stalk({r0:.05,r1:.035,seg:7,rings:8,bend:.25,ribs:18,ribA:.08}),M.araucariaBark,{label:'Coconut palm (trunk)'});
BIO.def('arpalm',PALM_FROND_GEO,M.palmFrond,{label:'Coconut palm (drooping pinnate frond)'});
BIO.def('arcoconut_nut',makeCoconutClusterGeo(),M.flesh,{label:'Coconut palm (nut cluster)'});
BIO.def('arkelp',BIO.geo.ribbon(4,.48,.22),M.kelpBlade,{label:'Shoal kombu kelp (frond)'});
BIO.def('arkelp_stipe',BIO.fung.stalk({r0:.035,r1:.02,seg:5,rings:4,bend:.22}),M.mangroveBark,{label:'Shoal kombu kelp (holdfast stipe)'});
BIO.def('arseagrass',BIO.geo.clump(),M.sedge,{sward:false,label:'Ribbon seagrass'});
BIO.def('arbyssus',makeByssusBedGeo(),M.byssus,{label:'Giant sea-byssus mussel bed'});
BIO.def('aroyster',BIO.fung.tube({n:6,r:.18,hMin:.48,spread:.34,seg:8,rimK:1.25,inK:.38,seed:20206}),M.oyster,{label:'Coralline-oyster visor'});
BIO.def('arbarnacle',BIO.fung.cap({form:'disc',h:.12,seg:9,rings:2,lump:.45,wav:6,wavA:.12,under:'none',uv:'planar',seed:20207}),M.oyster,{label:'Upper-littoral barnacle crust'});

// ---------------------------------------------------------------- Structural multi-limbed tree builders (BIO.tree + BIO.tube + BIO.flareJoin)
const recTree=(key,x,y,z,r,h)=>{const S=byKey[key];if(S&&BIO.record)BIO.record({name:S.name,key:S.key,kind:'tree',x,y,z,r,h,tags:S.tags});};
ARCHB.recTree=recTree;

/* 1. 'Ōhi'a Lehua (Metrosideros polymorpha): gnarled multi-stemmed silvery-barked pioneer tree, spreading cloud-tiers & scarlet brush blossoms */
ARCHB.growOhia=function(x,y,z,H,tSeed,flw){
 const h= (i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.ohiaBark[(tSeed>>>0)%PAL.ohiaBark.length];
 const yaw=h(1,1)*TAU;
 const rBase=clamp(H*.024*(.85+.3*h(2,1)),.08,.22);
 recTree('ohia',x,y,z,H*.42,H);

 BIO.tree(x,z,()=>{
  /* Root-collar bole instance keeps 'arohiatrunk' registered for SPECIES & Arcoforte tall-trunk audit */
  BIO.put('arohiatrunk',[x,y-.22,z],qEuler(0,yaw,0),[rBase/.13,Math.min(1.35,H*.22),rBase/.13],C(barkHex));

  /* 3 lava-gripping surface buttress roots */
  for(let rt=0;rt<3;rt++){
   const ra=yaw+(rt/3)*TAU+.4*(h(rt+10,2)-.5),rSpan=rBase*(2.4+1.2*h(rt+10,3));
   const rPts=BIO.flareJoin([
    {x:x+Math.cos(ra)*rBase*.4,y:y+rBase*1.1,z:z+Math.sin(ra)*rBase*.4,r:rBase*.46},
    {x:x+Math.cos(ra)*rSpan*.6,y:y+rBase*.22,z:z+Math.sin(ra)*rSpan*.6,r:rBase*.28},
    {x:x+Math.cos(ra)*rSpan,y:y-.45,z:z+Math.sin(ra)*rSpan,r:rBase*.12}
   ],{parentR:rBase,k:1.4,sink:.45,len:1.4});
   BIO.tube('ar_ohia_bark',rPts,barkHex,{seg:5});
  }

  /* 2 or 3 crooked ascending main stems splitting low above the root collar */
  const nStems=H>4.6?3:2;
  for(let s=0;s<nStems;s++){
   const az=yaw+(s/nStems)*TAU+.45*(h(20+s,1)-.5);
   const spread=H*(.22+.14*h(20+s,2));
   const stemH=H*(.76+.22*h(20+s,3));
   const wob=(h(20+s,4)-.5)*H*.10;
   const m1x=x+Math.cos(az)*spread*.38-Math.sin(az)*wob,m1y=y+stemH*.38,m1z=z+Math.sin(az)*spread*.38+Math.cos(az)*wob;
   const m2x=x+Math.cos(az)*spread*.78+Math.sin(az)*wob*.6,m2y=y+stemH*.72,m2z=z+Math.sin(az)*spread*.78-Math.cos(az)*wob*.6;
   const tx=x+Math.cos(az)*spread,ty=y+stemH,tz=z+Math.sin(az)*spread;
   const sr0=rBase*(s===0?.78:.64);
   const stemPts=BIO.flareJoin([
    {x:x,y:y-.25,z:z,r:rBase},
    {x:m1x,y:m1y,z:m1z,r:sr0*.72},
    {x:m2x,y:m2y,z:m2z,r:sr0*.46},
    {x:tx,y:ty,z:tz,r:Math.max(.028,sr0*.24)}
   ],{parentR:rBase*1.05,k:1.35,sink:.35,len:1.5});
   BIO.tube('ar_ohia_bark',stemPts,barkHex,{seg:6});

   /* 3 spreading crooked lateral boughs per main stem, each socketed directly into dome foliage pads */
   const nBranches=3;
   for(let b=0;b<nBranches;b++){
    const bf=.46+.44*(b/(nBranches-1));
    const bx=lerp(m1x,tx,bf),by=lerp(m1y,ty,bf),bz=lerp(m1z,tz,bf);
    const baz=az+(b-1)*1.25+.35*(h(40+s*4+b,1)-.5);
    const bSpan=H*(.18+.11*h(40+s*4+b,2));
    const bRise=bSpan*(.32+.24*h(40+s*4+b,3));
    const bmx=bx+Math.cos(baz)*bSpan*.55,bmy=by+bRise*.45,bmz=bz+Math.sin(baz)*bSpan*.55;
    const bex=bx+Math.cos(baz)*bSpan,bey=by+bRise,bez=bz+Math.sin(baz)*bSpan;
    const br0=Math.max(.032,sr0*.38);
    const bPts=BIO.flareJoin([
     {x:bx,y:by,z:bz,r:br0},
     {x:bmx,y:bmy,z:bmz,r:br0*.62},
     {x:bex,y:bey,z:bez,r:Math.max(.02,br0*.32)}
    ],{parentR:sr0*.55,k:1.45,sink:.5,len:1.5});
    BIO.tube('ar_ohia_bark',bPts,barkHex,{seg:5});

    const padS=clamp(H*(.26+.08*h(40+s*4+b,4)),1.15,2.85);
    const lHex=PAL.ohia[(s*3+b+(tSeed>>>0))%PAL.ohia.length];
    const nx=Math.cos(baz)*.42,nz=Math.sin(baz)*.42;
    BIO.put('arohia',[bex,bey,bez],qEuler(0,baz+h(40+s*4+b,5)*.8,0),[padS,padS*.58,padS],C(lHex),{n:[nx,.88,nz]});
    if(flw&&h(40+s*4+b,6)<.68){
     const blS=.42+.28*h(40+s*4+b,7);
     const flHex=PAL.ohiaFlower[(s+b+(tSeed>>>0))%PAL.ohiaFlower.length];
     BIO.put('arohia_bloom',[bex+nx*.22,bey+padS*.24,bez+nz*.22],qEuler(0,baz*1.3,0),[blS,blS*.88,blS],C(flHex));
    }
   }

   /* Stem apex crown pad + optional scarlet lehua blossom */
   const topS=clamp(H*(.30+.07*h(60+s,1)),1.3,3.1);
   const topHex=PAL.ohia[(s+(tSeed>>>0))%PAL.ohia.length];
   BIO.put('arohia',[tx,ty,tz],qEuler(0,az,0),[topS,topS*.56,topS],C(topHex),{n:[Math.cos(az)*.25,.94,Math.sin(az)*.25]});
   if(flw){
    const blS=.48+.30*h(60+s,2);
    const flHex=PAL.ohiaFlower[(s*2+(tSeed>>>0))%PAL.ohiaFlower.length];
    BIO.put('arohia_bloom',[tx,ty+topS*.25,tz],qEuler(0,az+.7,0),[blS,blS*.9,blS],C(flHex));
   }
  }
 });
};

/* 2. Beach She-Oak (Casuarina equisetifolia): furrowed wind-swept trunk, sweeping scaffold limbs & weeping cladode-needle curtains */
ARCHB.growCasuarina=function(x,y,z,H,tSeed){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.casBark[(tSeed>>>0)%PAL.casBark.length];
 const yaw=h(1,1)*TAU;
 const lean=(.05+.08*h(2,1));
 const rBase=clamp(H*.019*(.88+.26*h(3,1)),.11,.29);
 recTree('casuarina',x,y,z,H*.36,H);

 BIO.tree(x,z,()=>{
  BIO.put('arcastrunk',[x,y-.24,z],qEuler(0,yaw,0),[rBase/.14,Math.min(1.6,H*.18),rBase/.14],C(barkHex));

  /* Flared coastal root buttresses anchoring into dune/headland */
  for(let rt=0;rt<3;rt++){
   const ra=yaw+(rt/3)*TAU+.3*(h(rt+5,1)-.5),rSpan=rBase*(2.2+.9*h(rt+5,2));
   const rPts=BIO.flareJoin([
    {x:x+Math.cos(ra)*rBase*.4,y:y+rBase*1.2,z:z+Math.sin(ra)*rBase*.4,r:rBase*.44},
    {x:x+Math.cos(ra)*rSpan*.65,y:y+rBase*.25,z:z+Math.sin(ra)*rSpan*.65,r:rBase*.24},
    {x:x+Math.cos(ra)*rSpan,y:y-.5,z:z+Math.sin(ra)*rSpan,r:rBase*.11}
   ],{parentR:rBase,k:1.4,sink:.5,len:1.5});
   BIO.tube('ar_cas_bark',rPts,barkHex,{seg:5});
  }

  /* Gently leaning main bole up to 0.94 H */
  const ldx=Math.cos(yaw)*lean*H,ldz=Math.sin(yaw)*lean*H;
  const nSeg=6,bole=[];
  for(let i=0;i<=nSeg;i++){
   const t=i/nSeg,curve=t*t;
   const wob=Math.sin(t*3.6+(tSeed%11))*H*.018;
   const bx=x+ldx*curve-Math.sin(yaw)*wob,by=y-.3+(H*.94+.3)*t,bz=z+ldz*curve+Math.cos(yaw)*wob;
   const flare=1+.34*Math.pow(Math.max(0,1-t/.15),2);
   bole.push({x:bx,y:by,z:bz,r:Math.max(.032,rBase*(1-.82*Math.pow(t,.86))*flare)});
  }
  BIO.tube('ar_cas_bark',bole,barkHex,{seg:7});

  /* 5 tiers of slender, gracefully sweeping & slightly drooping lateral Casuarina limbs + socketed sprays + weeping drapes */
  const nTiers=5;
  for(let ti=0;ti<nTiers;ti++){
   const f=.32+.60*(ti/(nTiers-1));
   const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
   const ox=lerp(bole[idx].x,bole[idx+1].x,tf);
   const oy=lerp(bole[idx].y,bole[idx+1].y,tf);
   const oz=lerp(bole[idx].z,bole[idx+1].z,tf);
   const pR=lerp(bole[idx].r,bole[idx+1].r,tf);
   const nB=ti<3?3:2;

   for(let b=0;b<nB;b++){
    const sIdx=ti*6+b;
    const az=yaw+(b/nB)*TAU+ti*1.32+.42*(h(30+sIdx,1)-.5);
    const span=H*(.22+.11*h(30+sIdx,2))*(1.08-.44*(ti/nTiers));
    const midRise=span*(.24+.14*(ti/nTiers));
    const tipRise=midRise-span*.12; /* Graceful outward arch with drooping outer tip */
    const mx=ox+Math.cos(az)*span*.56,my=oy+midRise,mz=oz+Math.sin(az)*span*.56;
    const ex=ox+Math.cos(az)*span,ey=oy+tipRise,ez=oz+Math.sin(az)*span;
    const br0=Math.max(.028,pR*.45);
    const bPts=BIO.flareJoin([
     {x:ox,y:oy,z:oz,r:br0},
     {x:mx,y:my,z:mz,r:br0*.62},
     {x:ex,y:ey,z:ez,r:Math.max(.018,br0*.28)}
    ],{parentR:pR,k:1.5,sink:.55,len:1.7});
    BIO.tube('ar_cas_bark',bPts,barkHex,{seg:5});

    const cHex1=PAL.casuar2[(sIdx+(tSeed>>>0))%PAL.casuar2.length];
    const cHex2=PAL.casuar2[(sIdx+1+(tSeed>>>0))%PAL.casuar2.length];
    const padS=clamp(span*.94,1.35,6.2);
    const nx=Math.cos(az)*.4,nz=Math.sin(az)*.4;
    /* Feathery crown sprays socketed directly onto mid-bough and tip (zero floating!) */
    BIO.put('arcas',[mx,my,mz],qEuler(0,az+.9,0),[padS*.84,padS*.58,padS*.84],C(cHex1),{n:[nx*.6,.92,nz*.6]});
    BIO.put('arcas',[ex,ey,ez],qEuler(0,az,0),[padS,padS*.56,padS],C(cHex2),{n:[nx,.86,nz]});

    /* Pendulous weeping Casuarina needle curtains hanging directly from the bough & tip */
    const drW=clamp(span*.44,.85,1.85),drL=clamp(H*(.14+.06*h(30+sIdx,3)),1.1,2.35);
    BIO.put('arcas_drape',[ex,ey+.12,ez],qEuler(0,az*1.3,0),[drW,drL,drW],C(cHex2));
    if(ti<3){
     BIO.put('arcas_drape',[mx,my+.10,mz],qEuler(0,az+1.1,0),[drW*.85,drL*.88,drW*.85],C(cHex1));
    }
   }
  }

  /* Feathery crown leader spray at bole apex */
  const top=bole[bole.length-1],topS=clamp(H*.28,1.5,5.8);
  const topHex=PAL.casuar2[(tSeed>>>0)%PAL.casuar2.length];
  BIO.put('arcas',[top.x,top.y,top.z],qEuler(0,yaw,0),[topS,topS*.62,topS],C(topHex),{n:[0,1,0]});
 });
};

/* 3. Maquis She-Oak (Gymnostoma deplancheanum): wiry candelabrum stems on near/mid shrubs, grounded tuft afar */
ARCHB.growGymnostoma=function(x,y,z,s,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const cHex=PAL.casuar[(tSeed>>>0)%PAL.casuar.length];
 if(lv<1||s<1.3){
  BIO.put('argymno',[x,y-.08,z],qEuler(0,h(1,1)*TAU,0),[s*.85,s*.82,s*.85],C(cHex),{n:[0,1,0]});
  return;
 }
 const barkHex=PAL.casBark[(tSeed>>>0)%PAL.casBark.length];
 const nSt=2+(tSeed%2);
 BIO.tree(x,z,()=>{
  for(let k=0;k<nSt;k++){
   const az=(k/nSt)*TAU+.5*(h(k+2,1)-.5);
   const sp=s*(.22+.14*h(k+2,2)),sh=s*(.62+.24*h(k+2,3));
   const mx=x+Math.cos(az)*sp*.55,my=y+sh*.52,mz=z+Math.sin(az)*sp*.55;
   const ex=x+Math.cos(az)*sp,ey=y+sh,ez=z+Math.sin(az)*sp;
   const r0=clamp(s*.022,.025,.075);
   BIO.tube('ar_gymno_bark',[
    {x:x,y:y-.15,z:z,r:r0},
    {x:mx,y:my,z:mz,r:r0*.68},
    {x:ex,y:ey,z:ez,r:Math.max(.015,r0*.38)}
   ],barkHex,{seg:5});
   const ts=s*(.48+.14*h(k+2,4));
   BIO.put('argymno',[ex,ey-.05,ez],qEuler(0,az,0),[ts,ts*.68,ts],C(cHex),{n:[Math.cos(az)*.3,.92,Math.sin(az)*.3]});
  }
 });
};

/* 4. Coconut Palm (Cocos nucifera): ringed leaning trunk, nut cluster & 3-tier spiralling V-cambered drooping pinnate fronds */
ARCHB.growCoconut=function(x,y,z,H,yaw,lean,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const r0=clamp(.24+H*.006,.24,.36);
 recTree('coconut',x,y,z,3.6,H+2.2);
 BIO.tree(x,z,()=>{
  BIO.put('arpalmtrunk',[x,y-.22,z],qEuler(0,yaw,lean),[r0/.05,H,r0/.05],C(PAL.palmtrunk[(tSeed>>>0)%PAL.palmtrunk.length]));
  const tx=x-Math.cos(yaw)*Math.sin(lean)*H,ty=y+H*Math.cos(lean)*.97,tz=z+Math.sin(yaw)*Math.sin(lean)*H;
  const nutS=.95+.25*h(1,2);
  BIO.put('arcoconut_nut',[tx,ty-.18,tz],qEuler(0,yaw+1.1,0),[nutS,nutS,nutS],C(PAL.coconutNut[(tSeed>>>0)%PAL.coconutNut.length]));
  const nF=lv!=null&&lv<1?9:13,gold=2.399963,fLen=clamp(2.5+H*.11,2.8,4.3);
  for(let k=0;k<nF;k++){
   const age=k/(nF-1),az=yaw+k*gold+.16*(h(k+3,1)-.5);
   const pitch=lerp(.78,-.32,Math.pow(age,.88))+.08*(h(k+3,2)-.5);
   const Lf=fLen*(age<.2?.82:age>.82?.88:1)*(.92+.16*h(k+3,3));
   const cHex=age>.80?PAL.palmOld[k%PAL.palmOld.length]:PAL.palm[(k+(tSeed>>>0))%PAL.palm.length];
   BIO.put('arpalm',[tx,ty+.05-.16*age,tz],qEuler((h(k+3,4)-.5)*.14,-az,pitch),[Lf,Lf*.95,Lf*1.08],C(cHex));
  }
 });
};

/* 5. Maquis Kauri (Agathis ovata / lanceolata): columnar silver-bronze spar trunk, heavy upper boughs & weeping kauri-gum resin */
ARCHB.growKauri=function(x,y,z,H,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.kauriBark[(tSeed>>>0)%PAL.kauriBark.length];
 const yaw=h(1,1)*TAU,rBase=clamp(H*.028*(.88+.24*h(2,1)),.16,.44),forkH=H*(.56+.12*h(3,1));
 recTree('arkauri',x,y,z,H*.32,H);
 BIO.tree(x,z,()=>{
  BIO.put('arkauri_trunk',[x,y-.25,z],qEuler(0,yaw,0),[rBase/.14,Math.min(2.2,H*.24),rBase/.14],C(barkHex));
  const bole=[];
  for(let i=0;i<=4;i++){
   const t=i/4,flare=1+.38*Math.pow(Math.max(0,1-t/.22),2);
   bole.push({x:x+(h(4,i)-.5)*.12,y:y-.3+(forkH+.3)*t,z:z+(h(5,i)-.5)*.12,r:rBase*(1-.26*t)*flare});
  }
  BIO.tube('ar_araucaria_bark',bole,barkHex,{seg:7});
  const top=bole[4],nB=lv!=null&&lv<1?4:6;
  for(let b=0;b<nB;b++){
   const az=yaw+(b/nB)*TAU+.28*(h(10+b,1)-.5),reach=H*(.20+.10*h(10+b,2)),rise=(H-forkH)*(.68+.28*h(10+b,3));
   const ox=top.x,oy=lerp(y+forkH*.82,top.y,b/(nB-1)),oz=top.z,br0=top.r*.44;
   const mx=ox+Math.cos(az)*reach*.54,my=oy+rise*.62,mz=oz+Math.sin(az)*reach*.54;
   const ex=ox+Math.cos(az)*reach,ey=oy+rise,ez=oz+Math.sin(az)*reach;
   const bPts=BIO.flareJoin([{x:ox,y:oy,z:oz,r:br0},{x:mx,y:my,z:mz,r:br0*.66},{x:ex,y:ey,z:ez,r:Math.max(.04,br0*.34)}],{parentR:top.r,k:1.45,sink:.5,len:1.5});
   BIO.tube('ar_araucaria_bark',bPts,barkHex,{seg:5});
   if(b%2===0){
    const gW=.55+.35*h(20+b,1),gH=.85+.75*h(20+b,2);
    BIO.put('arkauri_gum',[mx,my-br0*.35,mz],qEuler(0,az,0),[gW,gH,gW],C(PAL.kauriGum[(b+(tSeed>>>0))%PAL.kauriGum.length]));
   }
   const pS=clamp(H*(.28+.06*h(30+b,1)),1.4,6.8),lHex=PAL.kauriLeaf[(b+(tSeed>>>0))%PAL.kauriLeaf.length];
   BIO.put('arkauri_fol',[ex,ey,ez],qEuler(0,az,0),[pS,pS*.62,pS],C(lHex),{n:[Math.cos(az)*.35,.9,Math.sin(az)*.35]});
   if(b%2===1)BIO.put('arkauri_fol',[mx,my+.2,mz],qEuler(0,az+1.1,0),[pS*.82,pS*.56,pS*.82],C(lHex),{n:[0,1,0]});
  }
  const apPts=BIO.flareJoin([{x:top.x,y:top.y,z:top.z,r:top.r*.68},{x:top.x,y:y+H,z:top.z,r:.06}],{parentR:top.r,k:1.35,sink:.4,len:1.2});
  BIO.tube('ar_araucaria_bark',apPts,barkHex,{seg:5});
  const apS=clamp(H*.32,1.6,7.2);
  BIO.put('arkauri_fol',[top.x,y+H,top.z],qEuler(0,yaw,0),[apS,apS*.62,apS],C(PAL.kauriLeaf[(tSeed>>>0)%PAL.kauriLeaf.length]),{n:[0,1,0]});
 });
};

/* 6. Strand & Gorge Pandanus (Pandanus tectorius): prop-root skirt, forked ringed stems, spiral strap rosettes & orange fruit keys */
ARCHB.growPandan=function(x,y,z,H,tSeed,leanA,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.pandanBark[(tSeed>>>0)%PAL.pandanBark.length];
 const la=leanA==null?h(1,1)*TAU:leanA+(h(1,2)-.5)*.5,rb=clamp(H*.024,.10,.20);
 recTree('arpandan',x,y,z,H*.42,H);
 BIO.tree(x,z,()=>{
  const hubY=y+.65+H*.08;
  BIO.put('arpandan_trunk',[x,y-.18,z],qEuler(0,la,.14),[rb/.09,Math.min(1.6,H*.28),rb/.09],C(barkHex));
  const nP=lv!=null&&lv<1?4:6;
  for(let k=0;k<nP;k++){
   const az=(k/nP)*TAU+.28*(h(k+4,1)-.5),sp=.75+.65*h(k+4,2),rx=x+Math.cos(az)*sp,rz=z+Math.sin(az)*sp;
   const fy=Math.min(y+.2,BIO.host.terrainH(rx,rz))-.28;
   BIO.tube('ar_mangrove_bark',[{x,y:hubY,z,r:rb*.38},{x:lerp(x,rx,.55),y:lerp(hubY,fy,.42),z:lerp(z,rz,.55),r:rb*.30},{x:rx,y:fy,z:rz,r:rb*.24}],barkHex,{seg:4});
  }
  const topX=x+Math.cos(la)*H*.18,topZ=z+Math.sin(la)*H*.18,topY=y+H*.56;
  BIO.tube('ar_mangrove_bark',[{x,y:hubY-.2,z,r:rb},{x:lerp(x,topX,.5),y:lerp(hubY,topY,.5),z:lerp(z,topZ,.5),r:rb*.86},{x:topX,y:topY,z:topZ,r:rb*.74}],barkHex,{seg:5});
  const nHeads=lv!=null&&lv<1?2:3,gold=2.399963;
  for(let hd=0;hd<nHeads;hd++){
   const haz=la+(hd-(nHeads-1)*.5)*1.65+.3*(h(20+hd,1)-.5),hLen=H*(.30+.12*h(20+hd,2));
   const hx=topX+Math.cos(haz)*hLen*.65,hy=topY+hLen*.76,hz=topZ+Math.sin(haz)*hLen*.65;
   const hPts=BIO.flareJoin([{x:topX,y:topY,z:topZ,r:rb*.62},{x:hx,y:hy,z:hz,r:rb*.42}],{parentR:rb*.74,k:1.35,sink:.4,len:1.2});
   BIO.tube('ar_mangrove_bark',hPts,barkHex,{seg:4});
   const nS=lv!=null&&lv<1?8:14,sL=clamp(H*.30,1.25,2.45);
   for(let s=0;s<nS;s++){
    const age=s/(nS-1),saz=s*gold+hd*1.1,pitch=lerp(.95,-.38,age);
    const lHex=PAL.pandanLeaf[(s+hd+(tSeed>>>0))%PAL.pandanLeaf.length];
    BIO.put('arpandan_strap',[hx,hy,hz],qEuler((h(40+s,hd)-.5)*.12,-saz,pitch),[sL*(age<.22?.75:1),sL*.85,sL*.55],C(lHex));
   }
   if(hd===0&&h(60,1)<.68){
    const fs=.20+.08*h(60,2);
    BIO.put('arpandan_fruit',[hx+Math.cos(haz)*.16,hy-.28,hz+Math.sin(haz)*.16],qEuler(.15,haz,0),[fs,fs*1.25,fs],C(PAL.pandanFruit[(tSeed>>>0)%PAL.pandanFruit.length]));
   }
  }
 });
};

/* 7. Gully Tree-Fern (Cyathea intermedia): fibrous caudex post-trunk & radial umbrella of lacy bipinnate fronds */
ARCHB.growTreeFern=function(x,y,z,H,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const yaw=h(1,1)*TAU,lean=.05+.10*h(1,2),r0=clamp(.11+H*.012,.12,.20);
 recTree('artreefern',x,y,z,H*.55,H+1.0);
 BIO.tree(x,z,()=>{
  BIO.put('artreefern_trunk',[x,y-.18,z],qEuler(0,yaw,lean),[r0/.09,H,r0/.09],C(PAL.fernBark[(tSeed>>>0)%PAL.fernBark.length]));
  const tx=x-Math.cos(yaw)*Math.sin(lean)*H,ty=y+H*Math.cos(lean)*.97,tz=z+Math.sin(yaw)*Math.sin(lean)*H;
  const nF=lv!=null&&lv<1?7:11,fLen=clamp(H*.56,1.55,3.6);
  for(let f=0;f<nF;f++){
   const az=yaw+(f/nF)*TAU+.18*(h(f+3,1)-.5),pitch=.26+.28*(f%2)+.10*(h(f+3,2)-.5);
   const lHex=PAL.fernLeaf[(f+(tSeed>>>0))%PAL.fernLeaf.length];
   BIO.put('artreefern_frond',[tx,ty,tz],qEuler((h(f+3,3)-.5)*.10,-az,pitch),[fLen,fLen*.92,fLen*.95],C(lHex));
  }
 });
};

/* 8. Gorge Rata (Metrosideros nautica): J-curved reaction-wood bole, dike-clasping ship-knee buttresses & crimson brush blooms */
ARCHB.growRata=function(x,y,z,H,tSeed,flw){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.rataBark[(tSeed>>>0)%PAL.rataBark.length],yaw=h(1,1)*TAU,rBase=clamp(H*.028*(.88+.28*h(2,1)),.15,.36);
 recTree('arrata',x,y,z,H*.44,H);
 BIO.tree(x,z,()=>{
  BIO.put('arrata_trunk',[x,y-.24,z],qEuler(0,yaw,.14),[rBase/.15,Math.min(1.8,H*.22),rBase/.15],C(barkHex));
  for(let rt=0;rt<4;rt++){
   const ra=yaw+(rt/4)*TAU+.35*(h(rt+5,1)-.5),rSpan=rBase*(2.8+1.3*h(rt+5,2));
   const rPts=BIO.flareJoin([
    {x:x+Math.cos(ra)*rBase*.45,y:y+rBase*1.45,z:z+Math.sin(ra)*rBase*.45,r:rBase*.50},
    {x:x+Math.cos(ra)*rSpan*.58,y:y+rBase*.42,z:z+Math.sin(ra)*rSpan*.58,r:rBase*.32},
    {x:x+Math.cos(ra)*rSpan,y:y-.48,z:z+Math.sin(ra)*rSpan,r:rBase*.14}
   ],{parentR:rBase,k:1.5,sink:.5,len:1.6});
   BIO.tube('ar_ohia_bark',rPts,barkHex,{seg:5});
  }
  const rings=[],nR=6,lean=.12+.14*h(3,1);
  for(let i=0;i<=nR;i++){
   const t=i/nR,jBow=Math.sin(t*Math.PI)*H*.09;
   const rx=x+Math.cos(yaw)*lean*H*t*t-Math.sin(yaw)*jBow,rz=z+Math.sin(yaw)*lean*H*t*t+Math.cos(yaw)*jBow;
   rings.push({x:rx,y:y-.25+H*.88*t,z:rz,r:Math.max(.045,rBase*(1-.72*t)*(i===0?1.35:1))});
  }
  BIO.tube('ar_ohia_bark',rings,barkHex,{seg:7});
  const nB=4+(tSeed%2);
  for(let b=0;b<nB;b++){
   const idxS=Math.min(nR-1,2+Math.floor(b/(nB)*3.5)),sp=rings[idxS];
   const ba=yaw+(b/nB)*TAU+.3*(h(20+b,1)-.5),span=H*(.24+.12*h(20+b,2)),rise=H*(.14+.10*h(20+b,3));
   const mx=sp.x+Math.cos(ba)*span*.52,my=sp.y+rise*.68+.35,mz=sp.z+Math.sin(ba)*span*.52;
   const bx=sp.x+Math.cos(ba)*span,by=sp.y+rise,bz=sp.z+Math.sin(ba)*span;
   const bPts=BIO.flareJoin([{x:sp.x,y:sp.y,z:sp.z,r:sp.r*.52},{x:mx,y:my,z:mz,r:sp.r*.34},{x:bx,y:by,z:bz,r:.04}],{parentR:sp.r,k:1.45,sink:.5,len:1.5});
   BIO.tube('ar_ohia_bark',bPts,barkHex,{seg:5});
   const pS=clamp(H*.35,1.5,6.8),lHex=PAL.rataLeaf[(b+(tSeed>>>0))%PAL.rataLeaf.length];
   BIO.put('arrata_fol',[bx,by,bz],qEuler(0,ba,0),[pS,pS*.58,pS],C(lHex),{n:[Math.cos(ba)*.35,.9,Math.sin(ba)*.35]});
   if(flw&&h(30+b,1)<.6){
    const blS=.46+.28*h(30+b,2);
    BIO.put('arohia_bloom',[bx,by+pS*.24,bz],qEuler(0,ba*1.2,0),[blS,blS*.88,blS],C(PAL.ohiaFlower[(b+(tSeed>>>0))%PAL.ohiaFlower.length]));
   }
  }
  const tp=rings[nR],tS=clamp(H*.37,1.6,7.0);
  BIO.put('arrata_fol',[tp.x,tp.y,tp.z],qEuler(0,yaw,0),[tS,tS*.58,tS],C(PAL.rataLeaf[(tSeed>>>0)%PAL.rataLeaf.length]),{n:[0,1,0]});
 });
};

/* 9. Niaouli Paperbark (Melaleuca quinquenervia): twisted shaggy cream-white bark trunk & airy grey-green crown */
ARCHB.growPaperbark=function(x,y,z,H,tSeed){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.paperBark[(tSeed>>>0)%PAL.paperBark.length],yaw=h(1,1)*TAU,rBase=clamp(H*.024*(.88+.24*h(2,1)),.11,.28);
 recTree('arpaperbark',x,y,z,H*.34,H);
 BIO.tree(x,z,()=>{
  BIO.put('arpaperbark_trunk',[x,y-.22,z],qEuler(0,yaw,.06),[rBase/.13,Math.min(1.7,H*.24),rBase/.13],C(barkHex));
  const nSt=2+(tSeed%2);
  for(let s=0;s<nSt;s++){
   const az=yaw+(s/nSt)*TAU+.4*(h(10+s,1)-.5),sp=H*(.16+.10*h(10+s,2)),sh=H*(.80+.18*h(10+s,3));
   const m1x=x+Math.cos(az)*sp*.45,m1y=y+sh*.46,m1z=z+Math.sin(az)*sp*.45;
   const tx=x+Math.cos(az)*sp,ty=y+sh,tz=z+Math.sin(az)*sp,sr=rBase*(s===0?.82:.65);
   const pts=BIO.flareJoin([{x,y:y-.22,z,r:rBase},{x:m1x,y:m1y,z:m1z,r:sr*.68},{x:tx,y:ty,z:tz,r:Math.max(.03,sr*.28)}],{parentR:rBase*1.05,k:1.35,sink:.4,len:1.4});
   BIO.tube('ar_paper_bark',pts,barkHex,{seg:6});
   const pS=clamp(H*(.32+.07*h(20+s,1)),1.3,5.8),lHex=PAL.paperLeaf[(s+(tSeed>>>0))%PAL.paperLeaf.length];
   BIO.put('arpaperbark_fol',[tx,ty,tz],qEuler(0,az,0),[pS,pS*.66,pS],C(lHex),{n:[Math.cos(az)*.28,.94,Math.sin(az)*.28]});
   BIO.put('arpaperbark_fol',[m1x,m1y+sh*.16,m1z],qEuler(0,az+1.2,0),[pS*.84,pS*.60,pS*.84],C(lHex),{n:[0,1,0]});
  }
 });
};

/* 10. Tamanu (Calophyllum inophyllum): stout seaward-leaning coastal hardwood with curved knee boughs & dark glossy dome */
ARCHB.growTamanu=function(x,y,z,H,tSeed){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.rataBark[(tSeed>>>0)%PAL.rataBark.length],yaw=h(1,1)*TAU,lean=.18+.16*h(2,1),rBase=clamp(H*.030,.16,.38);
 recTree('artamanu',x,y,z,H*.46,H);
 BIO.tree(x,z,()=>{
  BIO.put('artamanu_trunk',[x,y-.24,z],qEuler(0,yaw,lean*.6),[rBase/.16,Math.min(1.9,H*.24),rBase/.16],C(barkHex));
  const bole=[],nR=5;
  for(let i=0;i<=nR;i++){
   const t=i/nR,bx=x+Math.cos(yaw)*lean*H*t*(.65+.35*t),bz=z+Math.sin(yaw)*lean*H*t*(.65+.35*t);
   bole.push({x:bx,y:y-.25+H*.82*t,z:bz,r:Math.max(.05,rBase*(1-.68*t)*(i===0?1.32:1))});
  }
  BIO.tube('ar_ohia_bark',bole,barkHex,{seg:7});
  for(let b=0;b<4;b++){
   const sp=bole[2+Math.min(2,b>>1)],ba=yaw+(b/4)*TAU+.35*(h(10+b,1)-.5),span=H*(.26+.10*h(10+b,2));
   const ex=sp.x+Math.cos(ba)*span,ey=sp.y+H*(.12+.08*h(10+b,3)),ez=sp.z+Math.sin(ba)*span;
   const bPts=BIO.flareJoin([{x:sp.x,y:sp.y,z:sp.z,r:sp.r*.52},{x:(sp.x+ex)*.5,y:(sp.y+ey)*.5+.3,z:(sp.z+ez)*.5,r:sp.r*.34},{x:ex,y:ey,z:ez,r:.04}],{parentR:sp.r,k:1.45,sink:.5,len:1.5});
   BIO.tube('ar_ohia_bark',bPts,barkHex,{seg:5});
   const pS=clamp(H*.38,1.7,7.4),lHex=PAL.tamanuLeaf[(b+(tSeed>>>0))%PAL.tamanuLeaf.length];
   BIO.put('artamanu_fol',[ex,ey,ez],qEuler(0,ba,0),[pS,pS*.62,pS],C(lHex),{n:[Math.cos(ba)*.32,.92,Math.sin(ba)*.32]});
  }
  const tp=bole[nR],tS=clamp(H*.40,1.8,7.6);
  BIO.put('artamanu_fol',[tp.x,tp.y,tp.z],qEuler(0,yaw,0),[tS,tS*.64,tS],C(PAL.tamanuLeaf[(tSeed>>>0)%PAL.tamanuLeaf.length]),{n:[0,1,0]});
 });
};

/* 11. Sea Hibiscus (Hibiscus tiliaceus): scrambling decumbent bast-cordage thicket with yellow cup flowers */
ARCHB.growHibiscus=function(x,y,z,H,tSeed){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.mangroveBark[(tSeed>>>0)%PAL.mangroveBark.length],nSt=3+(tSeed%2);
 recTree('arhibiscus',x,y,z,H*.55,H);
 BIO.tree(x,z,()=>{
  for(let s=0;s<nSt;s++){
   const az=(s/nSt)*TAU+.5*(h(s+2,1)-.5),sp=H*(.36+.16*h(s+2,2)),sh=H*(.68+.24*h(s+2,3));
   const mx=x+Math.cos(az)*sp*.55,my=y+sh*.42,mz=z+Math.sin(az)*sp*.55;
   const ex=x+Math.cos(az)*sp,ey=y+sh,ez=z+Math.sin(az)*sp,r0=clamp(H*.024,.045,.11);
   BIO.tube('ar_mangrove_bark',[{x,y:y-.18,z,r:r0},{x:mx,y:my,z:mz,r:r0*.68},{x:ex,y:ey,z:ez,r:r0*.34}],barkHex,{seg:5});
   const pS=clamp(H*.38,1.2,2.7),lHex=PAL.hibiscusLeaf[(s+(tSeed>>>0))%PAL.hibiscusLeaf.length];
   BIO.put('arhibiscus_fol',[ex,ey,ez],qEuler(0,az,0),[pS,pS*.58,pS],C(lHex),{n:[Math.cos(az)*.35,.9,Math.sin(az)*.35]});
   if(h(s+20,1)<.65){
    const blS=.34+.18*h(s+20,2);
    BIO.put('arhibiscus_bloom',[ex,ey+pS*.22,ez],qEuler(0,az*1.4,0),[blS,blS*.85,blS],C(PAL.hibiscusBloom[s%PAL.hibiscusBloom.length]));
   }
  }
 });
};

/* 12. Grey Mangrove (Avicennia marina): spreading grey-barked mudflat tree ringed by erect pencil pneumatophores */
ARCHB.growAvicennia=function(x,y,z,r0Y,H,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.mangroveBark[(tSeed>>>0)%PAL.mangroveBark.length],yaw=h(1,1)*TAU;
 recTree('aravicennia',x,r0Y,z,H*.48,H);
 BIO.tree(x,z,()=>{
  const nSt=2+(tSeed%2);
  for(let s=0;s<nSt;s++){
   const az=yaw+(s/nSt)*TAU+.4*(h(s+3,1)-.5),sp=H*(.24+.12*h(s+3,2)),ty=r0Y+H*(.68+.20*h(s+3,3));
   const ex=x+Math.cos(az)*sp,ez=z+Math.sin(az)*sp,rb=clamp(H*.024,.06,.14);
   BIO.tube('ar_mangrove_bark',[{x,y:Math.min(y,r0Y)-.25,z,r:rb},{x:lerp(x,ex,.5),y:lerp(r0Y,ty,.52),z:lerp(z,ez,.5),r:rb*.68},{x:ex,y:ty,z:ez,r:rb*.34}],barkHex,{seg:5});
   const pS=clamp(H*.38,1.3,2.9),lHex=PAL.avicennia[(s+(tSeed>>>0))%PAL.avicennia.length];
   BIO.put('aravicennia_fol',[ex,ty,ez],qEuler(0,az,0),[pS,pS*.58,pS],C(lHex),{n:[Math.cos(az)*.3,.92,Math.sin(az)*.3]});
  }
  const nPn=lv!=null&&lv<1?6:14;
  for(let p=0;p<nPn;p++){
   const pa=h(30+p,1)*TAU,pd=.65+2.1*h(30+p,2),px=x+Math.cos(pa)*pd,pz=z+Math.sin(pa)*pd,th=BIO.host.terrainH(px,pz);
   if(th<y-.45)continue;
   const py=Math.max(th,r0Y-.25),ph=.22+.26*h(30+p,3);
   BIO.put('aravicennia_pneum',[px,py-.04,pz],qEuler((h(30+p,4)-.5)*.16,pa,0),[1.1,ph,1.1],C(barkHex));
  }
 });
};

/* 13. Teal-Sap Prop-Wood (Rhizophora pycnandroides): braided ultramafic stilt-roots & weeping 20% Ni teal-blue latex scars */
ARCHB.growVerdigrisMangrove=function(x,y,z,r0Y,H,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const barkHex=PAL.mangroveBark[(tSeed>>>0)%PAL.mangroveBark.length],rHub=clamp(H*.026,.10,.20);
 const propTopY=Math.max(r0Y+1.15,y+1.1),crownY=propTopY+H*.22;
 recTree('arverdigrismangrove',x,r0Y,z,H*.45,H);
 BIO.tree(x,z,()=>{
  BIO.tube('ar_mangrove_bark',[{x,y:Math.min(y,r0Y)-.3,z,r:rHub*.74},{x,y:propTopY,z,r:rHub},{x,y:crownY,z,r:rHub*.78}],barkHex,{seg:6});
  const nP=lv!=null&&lv<1?4:6;
  for(let k=0;k<nP;k++){
   const az=(k/nP)*TAU+.34*(h(10+k,1)-.5),sp=1.15+1.1*h(10+k,2),rx=x+Math.cos(az)*sp,rz=z+Math.sin(az)*sp;
   const fy=Math.min(r0Y+.2,BIO.host.terrainH(rx,rz))-.32;
   const pPts=BIO.flareJoin([{x,y:propTopY,z,r:rHub*.44},{x:lerp(x,rx,.52),y:lerp(propTopY,fy,.36)+.35,z:lerp(z,rz,.52),r:rHub*.34},{x:rx,y:fy,z:rz,r:rHub*.24}],{parentR:rHub,k:1.5,sink:.5,len:1.6});
   BIO.tube('ar_mangrove_bark',pPts,barkHex,{seg:5});
  }
  const sAz=h(25,1)*TAU;
  BIO.put('artealsap_scar',[x+Math.cos(sAz)*rHub*.72,propTopY+.12,z+Math.sin(sAz)*rHub*.72],qEuler(.16,sAz,.10),[.75,.85,.75],C(PAL.tealsap[(tSeed>>>0)%PAL.tealsap.length]));
  for(let b=0;b<4;b++){
   const az=(b/4)*TAU+.45*h(40+b,1),sp=H*(.24+.10*h(40+b,2)),ty=crownY+H*(.38+.14*h(40+b,3));
   const ex=x+Math.cos(az)*sp,ez=z+Math.sin(az)*sp;
   const lPts=BIO.flareJoin([{x,y:crownY,z,r:rHub*.44},{x:(x+ex)*.5,y:(crownY+ty)*.54,z:(z+ez)*.5,r:rHub*.30},{x:ex,y:ty,z:ez,r:rHub*.18}],{parentR:rHub*.78,k:1.45,sink:.5,len:1.5});
   BIO.tube('ar_mangrove_bark',lPts,barkHex,{seg:5});
   const pS=clamp(H*.34,1.4,3.1),lHex=PAL.verdMangrove[(b+(tSeed>>>0))%PAL.verdMangrove.length];
   BIO.put('arverdigris_fol',[ex,ty,ez],qEuler(0,az,0),[pS,pS*.60,pS],C(lHex),{n:[Math.cos(az)*.3,.92,Math.sin(az)*.3]});
  }
  const apY=crownY+H*.48,apS=clamp(H*.36,1.5,3.2);
  BIO.tube('ar_mangrove_bark',[{x,y:crownY,z,r:rHub*.40},{x,y:apY,z,r:rHub*.20}],barkHex,{seg:4});
  BIO.put('arverdigris_fol',[x,apY,z],qEuler(0,sAz,0),[apS,apS*.58,apS],C(PAL.verdMangrove[(tSeed>>>0)%PAL.verdMangrove.length]),{n:[0,1,0]});
 });
};

/* 14. Dragon-Heath (Dracophyllum ramosum): candelabrum ringed twigs & bronzed terminal grass-rosettes */
ARCHB.growDracophyllum=function(x,y,z,s,tSeed,lv){
 const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
 const cHex=PAL.draco[(tSeed>>>0)%PAL.draco.length];
 if(lv<1||s<1.1){BIO.put('ardracophyllum',[x,y-.05,z],qEuler(0,h(1,1)*TAU,0),[s*.55,s*.75,s*.55],C(cHex));return;}
 const barkHex=PAL.casBark[(tSeed>>>0)%PAL.casBark.length],nSt=2+(tSeed%3);
 BIO.tree(x,z,()=>{
  for(let k=0;k<nSt;k++){
   const az=(k/nSt)*TAU+.4*(h(k+2,1)-.5),sp=s*(.18+.12*h(k+2,2)),sh=s*(.68+.24*h(k+2,3));
   const ex=x+Math.cos(az)*sp,ey=y+sh,ez=z+Math.sin(az)*sp,r0=clamp(s*.018,.02,.05);
   BIO.tube('ar_gymno_bark',[{x,y:y-.12,z,r:r0},{x:lerp(x,ex,.45),y:y+sh*.48,z:lerp(z,ez,.45),r:r0*.72},{x:ex,y:ey,z:ez,r:r0*.45}],barkHex,{seg:4});
   const ts=clamp(s*.36,.32,.78);
   BIO.put('ardracophyllum',[ex,ey-.04,ez],qEuler(0,az,0),[ts,ts*1.15,ts],C(cHex));
  }
 });
};
})();
