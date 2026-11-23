// ================================================================= THE CROOK — species, library materials & builders ([draw])
// Registers BIO.kit('crook') -> CROOK: 24 species (85-90% lush Olympic/Yakushima/Fiordland/Caucasus montane forest matrix +
// 10-15% grounded physical/geochemical weirdness across Crookshore, Crookwash, and Crookhead).
// 100% of bark, foliage, sponge, rimstone, cushion, wood, and rock surfaces bind genuine packed library textures (materials.json).
BIO.kit('crook');
var CROOK={PHYS:CROOK_PHYS,SITES:CROOK_SITES,FAUNA:CROOK_PHYS.FAUNA,CROPS:CROOK_PHYS.CROPS,PLACED:[]};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler,qUp}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 CROOK.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||''});

 // ---------------------------------------------------------------- palettes (sRGB hex)
 const PAL=CROOK.PAL={
  spruce:[0x2b4b3e,0x315446,0x254236,0x385c4c],
  cedar:[0x2f5236,0x395e3e,0x28482f,0x426845],
  cypress:[0x2a4e38,0x355a40,0x244430,0x3d6448],
  maple:[0x4e7436,0x5c823e,0x43682e,0x6a8e46],
  fir:[0x2c4842,0x34524c,0x263f3a,0x3d5c54],
  larch:[0x6e8438,0x829642,0x5e7632,0x98a44a],
  rhodoLeaf:[0x28462c,0x305034,0x223d26],
  rhodoBloom:[0xc84a78,0xd8628a,0xe8d8c8,0xd4526e],
  fern:[0x3d6a34,0x48783c,0x345c2c,0x548444],
  skarnFern:[0x2e5e48,0x366852,0x285440],
  palmate:[0x4c7838,0x588642,0x406a30],
  sedge:[0x7e8248,0x8e9054,0x6e7440,0x9ea062],
  frostSedge:[0xb8c8cc,0xc8d6da,0xa6b8be,0xd6e2e6],
  cotton:[0xe8e6dc,0xf2f0e8,0xdcdad0],
  moss:[0x4e7232,0x5a7e3a,0x42642a,0x688a42],
  spongeChimney:[0xc47e38,0x4e6478,0xb8522a,0x5c7286,0xd08c42],
  spongeCushion:[0xb87634,0x52687a,0xc25a30,0x8e7c58],
  canopyCup:[0x8ec4a8,0xd49a48,0x9ed0b4,0xdca856],
  spongeBeard:[0x98c8a8,0xd8a452,0xa6d2b4,0xc89646],
  rustBark:[0x8e4e32,0x78422c,0x9c5a3a,0x5c5854],
  bamboo:[0x8ea062,0x9ca86c,0x7e9056,0xb2a468],
  horsetail:[0x789878,0x88a686,0x6a8a6c,0xa2b89c],
  rimstone:{
   terracotta:[0xb45234,0xc25e3e,0x9e462c],
   ochre:[0xc48c3a,0xd09a46,0xb27c32],
   celadon:[0x7ca68e,0x8cb49c,0x6e9880]
  },
  malachiteCushion:[0x388c78,0x449a84,0xb46834,0x2e7c6a,0xc2763e],
  hearthBract:[0x7a3242,0x8a3c4c,0x426e52,0x682a38],
  hearthSpadix:[0xe6b862,0xf0c674,0xdca852],
  cryoAlgae:[0x3a9482,0x48a490,0xc27e38,0x2e8474],
  seedChimney:[0xeae6dc,0xf2efe6,0xdedad0,0xe4e0d4],
  basalt:[0x383c42,0x42464e,0x2e3238],
  breccia:[0x78726a,0x847e74,0x6c665e],
  gneiss:[0x7c7a74,0x8a8680,0x6e6c66],
  nephrite:[0x4e8468,0x5c9476,0x42745a],
  malachiteRock:[0xd8ece0,0xcce4d6,0xe2f0e8],
  gossanRock:[0xe8d4c4,0xdcc6b4,0xf0dcd0],
  granite:[0xa29e96,0xb0aca4,0x928e86]
 };

 // ---------------------------------------------------------------- 24 botanical & sponge species (verified by check_botany.py)
 const SPECIES=CROOK.SPECIES=[
  // A. 85-90% Earthlike Coastal-to-Alpine Montane Matrix (10 species)
  {key:'coastspruce',name:'Crookshore Sitka Spruce',how:'Towering 35-58 m salt-fog tolerant coastal conifer crowning the +65 m megatsunami bluff with plated bark and blue-green whorled boughs.',
   items:['ck_spruce_fol'],tags:K('temperate','humid','both',['Cfa','Am','Cfb'],'cloudforest')},
  {key:'westernredcedar',name:'Cathedral Western Redcedar',how:'Fluted, buttressed 30-54 m coastal and gorge giant with sweeping scale-leaf sprays and rot-proof red heartwood.',
   items:['ck_cedar_fol','ck_nurselog'],tags:K('temperate','humid','both',['Cfa','Cfb','Dfb'],'cloudforest')},
  {key:'redcypress',name:'Benihi Cloud Red-Cypress',how:'Ancient multi-buttressed 28-52 m mountain cypress with fibrous cinnamon bark and flat cloud-catching emerald tiers across Crookshore collars and Crookwash gorges.',
   items:['ck_cypress_fol'],tags:K('temperate','humid','both',['Cfa','Cfb','Dfb'],'gorge')},
  {key:'bigleafmaple',name:'Moss-Sleeved Bigleaf Maple',how:'Spreading 14-26 m canyon and rainforest broadleaf with lichen-crusted limbs draped in hanging moss and fog-sponges.',
   items:['ck_maple_fol','ck_mossbeard'],tags:K('temperate','humid','yes',['Cfa','Cfb','Dfb'],'cloudforest')},
  {key:'silverfir',name:'Vardzieti Silver Fir',how:'Symmetrical 24-42 m upper-montane conifer with smooth pale bark and dense silver-backed needles framing steep V-gorges.',
   items:['ck_fir_fol'],tags:K('cold','humid','no',['Dfb','Cfb','Dfc'],'gorge')},
  {key:'gorgerhodo',name:'Chasm Rhododendron',how:'Twisted 2.5-7 m canyon-wall evergreen understory thicket bursting with rose-magenta, coral, and cream flower trusses.',
   items:['ck_rhodo_fol','ck_rhodo_bloom'],tags:K('temperate','humid','both',['Cfa','Cfb','Dfb'],'gorge')},
  {key:'cloudtreefern',name:'Fiordland Plume Tree-Fern',how:'Frost-free 3-8 m fibrous trunk crowned by an arching rosette of lacy emerald fronds in sheltered caldera gullies above +65 m.',
   items:['ck_treefern_stem','ck_treefern_frond'],tags:K('temperate','humid','yes',['Cfa','Am'],'cloudforest')},
  {key:'devilsclub',name:'Thorny Gorge-Panax',how:'Wet seep-hollow understory shrub with arching pale stems and broad palmate leaf umbrellas.',
   items:['ck_palmate'],tags:K('temperate','humid','yes',['Cfa','Cfb','Dfb'],'cloudforest')},
  {key:'furlarch',name:'Subalpine Krummholz Larch',how:'Wind-flagged 4-13 m treeline larch around Crookhead moraine tarns with golden-green deciduous needle tufts.',
   items:['ck_larch_fol'],tags:K('cold','humid','both',['Dfc','ET','Dfb'],'tarn')},
  {key:'morainesedge',name:'Montane Sword-Fern and Tarn Tuft-Sedge',how:'Lush forest floor ferns in the gorges grading into olive-gold sedge and cottongrass tussocks around alpine tarns and sunny rain-shadow rims.',
   items:['ck_floorfern','ck_sedge','ck_cotton','ck_mossmat'],tags:K('cold','humid','both',['Dfb','Dfc','ET','Csa'],'tarn')},

  // B. Crookshore (< +65 m Spray-Bench Lithistids & >= +65 m Canopy Fog-Sponges, 4 species)
  {key:'basaltchimney',name:'Lithistid Basalt Chimney-Sponge',how:'Rock-hard fused-silica oscular chimneys (0.35-1.35 m) in ochre, slate-blue, and rust-orange anchored to < +65 m tsunami-scoured columnar basalt benches.',
   items:['ck_chimney_tube','ck_chimney_rim'],tags:N('temperate','humid','no',['Cfa','Am'],'spraybench',{substrate:'basalt',silica:true})},
  {key:'spraycushion',name:'Surf-Bench Cushion-Sponge',how:'Streamlined hemispherical porous lithistid crusts (0.15-0.55 m) drinking 1.60 atm surf spray on tree-free basalt colonnades below +65 m.',
   items:['ck_spraycushion'],tags:N('temperate','humid','no',['Cfa','Am'],'spraybench',{substrate:'basalt',silica:true})},
  {key:'canopycup',name:'Celadon Canopy Cup-Sponge',how:'Ultralight celadon-jade and warm amber spongin chalice-cups perched on lower rainforest boughs above +65 m to condense marine fog.',
   items:['ck_canopycup'],tags:N('temperate','humid','no',['Cfa','Am'],'cloudforest',{epiphyte:true})},
  {key:'spongebeard',name:'Amber Fog-Beard Sponge',how:'Pendulous reticulated amber-gold and celadon spongin skeins hanging from Sitka spruce and redcedar limbs in the coastal fog belt.',
   items:['ck_spongebeard'],tags:N('temperate','humid','no',['Cfa','Am'],'cloudforest',{epiphyte:true})},

  // C. Crookwash (+950..+2,800 m Skarn Biomineralizers, Rimstone Bryophytes & Chambered Brakes, 5 species)
  {key:'rustcedar',name:'Burnished Skarn-Cedar',how:'Gnarly chasm-wall cedar over iron-nephrite skarn seeps sequestering dissolved Fe and Cu into rust-burnished metallic bronze bark scales.',
   items:['ck_rustcedar_fol'],tags:N('temperate','humid','yes',['Dfb','Cfb'],'gorge',{metallophyte:true,indicator:'iron-skarn'})},
  {key:'skarnfern',name:'Porcelain-Margin Jade-Fern',how:'Dark gorge fern over nephrite-skarn seeps precipitating translucent opalescent jade-white silica frond margins that clink like thin porcelain in canyon drafts.',
   items:['ck_skarnfern'],tags:N('temperate','humid','yes',['Dfb','Cfb'],'gorge',{metallophyte:true,indicator:'nephrite-jade'})},
  {key:'jadeequisetum',name:'Opalescent Canyon Horsetail',how:'Jointed celadon-and-ivory silica-ribbed hollow horsetails colonizing skarn gravel bars and windy gorge rims.',
   items:['ck_equisetum_stem','ck_equisetum_whorl'],tags:N('temperate','humid','yes',['Dfb','Cfb'],'gorge',{metallophyte:true})},
  {key:'rimstonemoss',name:'Iron-Jade Rimstone Step-Bryophyte',how:'Cold-seep iron-oxidizing bryophyte and bacterial mats cementing stepped terracotta, ochre, and celadon travertine rimstone dams.',
   items:['ck_rimstone_lip','ck_rimstone_shelf'],tags:N('temperate','humid','yes',['Dfb','Cfb'],'gorge',{travertine:true})},
  {key:'chamberbamboo',name:'Wind-Tuned Chambered Canyon Bamboo',how:'Silica-stiffened hollow canyon bamboo along 1.20 atm chasm rims whose beetle-bored nodal apertures hum in quiet breathy fifths.',
   items:['ck_bamboo_holed','ck_bamboo_plain','ck_bamboo_leaf0','ck_bamboo_leaf1','ck_bamboo_leaf2','ck_bamboo_shoot'],tags:N('temperate','humid','no',['Dfb','Cfb'],'gorge',{acoustic:true})},

  // D. Crookhead (+1,800..+6,000 m Malachite Metallophytes, Thermogenic Hearth-Rings & Pass Seed-Chimneys, 5 species)
  {key:'malachitecushion',name:'Malachite-Rind Cushion-Heath',how:'Rock-hard yareta-like alpine domes chelating glacial copper and iron into banded malachite-teal and rust-ochre mineral rinds.',
   items:['ck_malachite_dome'],tags:N('cold','humid','no',['ET','Dfc'],'tarn',{metallophyte:true,indicator:'copper-iron'})},
  {key:'frostsedge',name:'Spun Frost-Glass Silica Sedge',how:'High-moraine sedge tussocks tipped with clear opaline-silica awns that catch low mountain sun like spun frost-glass.',
   items:['ck_frostsedge'],tags:N('cold','humid','no',['ET','Dfc'],'tarn',{metallophyte:true})},
  {key:'hearthring',name:'Thermogenic Hearth-Ring Rosette',how:'Colonial starch-burning alpine rosettes maintaining +15 degC internal warmth to melt crisp 1-2 m circular wells through spring snowpack.',
   items:['ck_hearth_bract','ck_hearth_spadix'],tags:N('cold','humid','yes',['ET','Dfc'],'tarn',{thermogenic:true})},
  {key:'cryosnow',name:'Malachite-Teal Cryo-Snow Algae',how:'Cryophilic microalgae chelating Copper Glacier dust into malachite-teal and rust-ochre rings around thermogenic melt-wells and firn drifts.',
   items:['ck_cryoalgae'],tags:N('cold','humid','yes',['ET','EF'],'tarn',{metallophyte:true})},
  {key:'seedchimney',name:'Bone-White Wind-Fluted Seed-Chimney',how:'Austere bone-white silica-fluted hollow alpine stalks sighing in harmonic fourths on Crookhead gusts, falling abruptly silent inside Silent Vales.',
   items:['ck_chimney_stalk0','ck_chimney_stalk1','ck_chimney_umbel'],tags:N('cold','humid','no',['ET'],'fellpass',{acoustic:true})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 CROOK.HARVEST={
  coastspruce:HV('timber',['spruce tip'],true,'High strength-to-weight mast and spar timber; antiscorbutic young shoots and pitch resin.'),
  westernredcedar:HV('timber, cordage',[],false,'Rot-proof hull planking and fibrous inner bast cordage.'),
  redcypress:HV('timber',[],true,'Aromatic rot-proof benihi heartwood shot down mountain flumes for Hueru-Kuran and Ark-Fleet hulls; distilled leaf incense.'),
  bigleafmaple:HV('timber, carving',['maple sap'],false,'Close-grained paddle and lute wood; spring sap boiled to syrup.'),
  silverfir:HV('timber, resin',[],true,'Straight flume-trestle timber and clear antiseptic blister resin.'),
  gorgerhodo:HV('fuel, carving',[],false,'Dense tool-handle wood; spring blossoms yield cliff-honey.'),
  cloudtreefern:HV('none',['fiddlehead','steamed pith'],false,'Fibrous trunk slabs line root-storage pits.'),
  devilsclub:HV('none',[],true,'Peeled root-bark prized by Hueru-Kuran and Dzagh-Vardzi healers as a wound poultice and fever remedy.'),
  furlarch:HV('timber, tannin',[],false,'Tough rot-resistant snow-stake timber and tanbark.'),
  morainesedge:HV('thatch, weaving',[],false,'Dried boot-insulation hay, basketry sedge, and pack-saddle stuffing.'),
  basaltchimney:HV('none',[],false,'Ground siliceous desma-grit used as abrasive paste for nephrite wire saws; alchemical reagent.'),
  spraycushion:HV('none',[],true,'Boiled elastic spongin core used for boat-bailing pads and wound sponges.'),
  canopycup:HV('none',[],true,'Soft sterile rainwater sponge harvested from windfall limbs for surgical dressing.'),
  spongebeard:HV('fiber, padding',[],false,'Cured spongin felt used as shock-absorbing padding inside nephrite lamellar helmets.'),
  rustcedar:HV('timber',[],false,'Iron-hard waterwheel-axle timber; shed metallic bark scales smelted as bio-ore indicator flux.'),
  skarnfern:HV('none',[],false,'Prospector indicator for nephrite-jade lenses; calcined fronds yield white porcelain-glaze flux reagent.'),
  jadeequisetum:HV('none',[],false,'Silica-ribbed stems bundled by Vardzieti smiths and jade-carvers for satin polishing.'),
  rimstonemoss:HV('none',[],false,'Calc-iron sinter crust roasted into Venetian-red, yellow-ochre, and celadon fresco pigment dyes.'),
  chamberbamboo:HV('weaving, cordage, instrument',['bamboo shoot'],false,'Seasoned holed culms cut for chasm-wind warning pipes, flume horns, and light scaffold poles.'),
  malachitecushion:HV('fuel',[],false,'Dried copper-crusted domes burn with a bright emerald-green flame in high-pass cairn beacons; copper indicator.'),
  frostsedge:HV('thatch, fuel',[],false,'Silica-stiffened tussocks gathered as dry spark-tinder and pot-scourers.'),
  hearthring:HV('none',['roasted starch-taproot'],true,'Autumn-dug starch taproot dried by mountain drovers; warm bracts bound over frostbitten fingers.'),
  cryosnow:HV('none',[],false,'Visual snow-streak indicator of copper-dust plumes downwind of Copper Glacier.'),
  seedchimney:HV('fuel, instrument',['parched oily seed'],false,'Hollow bone-white stalks set on pass cairns as wind-flutes and Silent Vales hush boundary markers.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=CROOK.HARVEST[S.key];});
 const byKey={};SPECIES.forEach(S=>{byKey[S.key]=S;});
 CROOK.byKey=byKey;
 CROOK.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 CROOK.plantOfItem=CROOK.speciesOfItem;

 // ---------------------------------------------------------------- procedural fallbacks (every slot has a real map even under ?mat=proc)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=196+(H(seed,i%w,(i/w)|0,0x71)-0.5)*54;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=(seed)=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(220,232,216,1)';
  for(let k=0;k<36;k++){
   const x=S*(0.14+0.72*H(seed,k,1,0x81)),y=S*(0.12+0.76*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[180,198,176]);

 // Helper for full PBR Standard materials backed by packed library albedo + normal + roughness maps
 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('crook',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.82:opt.roughness,
   metalness:opt.metalness==null?0.04:opt.metalness,
   vertexColors:opt.vertexColors!==false,
   side:opt.side||T3.DoubleSide
  });
  if(L&&L.scale)m.userData.libScale=L.scale;
  if(L&&typeof KMAT.libHooks==='function'){
   const key='crook-pbr-'+slot+KMAT.libKey(L);
   m.onBeforeCompile=sh=>{KMAT.libHooks(sh,L);};
   m.customProgramCacheKey=()=>key;
  }
  return m;
 }

 // ---------------------------------------------------------------- CROOK.M material table (100% textured!)
 const M=CROOK.M={
  // Bark & wood materials (swapped to packed library WebPs by BIO.libSwap)
  'bark.spruce':BIO.barkMat(grey(128,11)),
  'bark.cedar':BIO.barkMat(grey(128,12)),
  'bark.cypress':BIO.barkMat(grey(128,13)),
  'bark.maple':BIO.barkMat(grey(128,14)),
  'bark.fir':BIO.barkMat(grey(128,15)),
  'bark.larch':BIO.barkMat(grey(128,16)),
  'bark.bamboo':BIO.barkMat(grey(128,17)),
  'bark.bone':BIO.barkMat(grey(128,18)),
  'wood.log':BIO.barkMat(grey(128,19)),
  'bark.rust':pbrMat('bark.rust',20,{roughness:0.38,metalness:0.46}),

  // PBR sponges, rimstone sinter, mineral-rind cushions, and rocks
  spongeChimney:pbrMat('sponge.chimney',21,{roughness:0.74,metalness:0.04}),
  spongeCushion:pbrMat('sponge.cushion',22,{roughness:0.78,metalness:0.03}),
  spongeCup:pbrMat('sponge.cup',23,{roughness:0.48,metalness:0.02}),
  rimstoneLip:pbrMat('rimstone.lip',24,{roughness:0.44,metalness:0.06}),
  cushionRind:pbrMat('cushion.rind',25,{roughness:0.72,metalness:0.08}),
  rockBasalt:pbrMat('rock.basalt',26,{roughness:0.68,metalness:0.06,vertexColors:false}),
  rockBreccia:pbrMat('rock.breccia',27,{roughness:0.84,metalness:0.02,vertexColors:false}),
  rockGneiss:pbrMat('rock.gneiss',28,{roughness:0.78,metalness:0.04,vertexColors:false}),
  rockNephrite:pbrMat('rock.nephrite',29,{roughness:0.32,metalness:0.08,vertexColors:false}),
  rockMalachite:pbrMat('rock.malachite',30,{roughness:0.46,metalness:0.10,vertexColors:false}),
  rockGossan:pbrMat('rock.gossan',31,{roughness:0.74,metalness:0.14,vertexColors:false}),
  rockGranite:pbrMat('rock.granite',32,{roughness:0.76,metalness:0.03,vertexColors:false}),

  // Foliage & card cutouts
  spruce:BIO.leafMat(cardFallback(41),'ck-spruce',{aN:true,swayW:'0.55',swayA:0.04}),
  cedar:BIO.leafMat(cardFallback(42),'ck-cedar',{aN:true,swayW:'0.65',swayA:0.05}),
  larch:BIO.leafMat(cardFallback(43),'ck-larch',{aN:true,swayW:'0.75',swayA:0.06}),
  maple:BIO.leafMat(cardFallback(44),'ck-maple',{aN:true,swayW:'0.75',swayA:0.07}),
  rhodo:BIO.leafMat(cardFallback(45),'ck-rhodo',{aN:true,swayW:'0.45',swayA:0.04}),
  blossom:BIO.leafMat(cardFallback(46),'ck-blossom',{aN:false,swayW:'0.55',swayA:0.05}),
  palmate:BIO.leafMat(cardFallback(47),'ck-palmate',{aN:false,swayW:'(position.y)',swayA:0.06}),
  treefern:BIO.leafMat(cardFallback(48),'ck-treefern',{aN:false,swayW:'(position.x)',swayA:0.07}),
  skarnfern:BIO.leafMat(cardFallback(49),'ck-skarnfern',{aN:false,swayW:'(position.x)',swayA:0.06,irid:true}),
  floorfern:BIO.leafMat(cardFallback(50),'ck-floorfern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  beard:BIO.leafMat(cardFallback(51),'ck-beard',{aN:false,swayW:'(-position.y)',swayA:0.11,axis:1,alphaTest:0.35}),
  bamboo:BIO.leafMat(cardFallback(52),'ck-bamboo',{aN:false,swayW:'(-position.y)',swayA:0.10,axis:1,alphaTest:0.38}),
  horsetail:BIO.leafMat(cardFallback(53),'ck-horsetail',{aN:false,swayW:'(position.y)',swayA:0.07}),
  sedge:BIO.leafMat(cardFallback(54),'ck-sedge',{aN:false,swayW:'(position.y)',swayA:0.08}),
  frostsedge:BIO.leafMat(cardFallback(55),'ck-frostsedge',{aN:false,swayW:'(position.y)',swayA:0.07,irid:true}),
  cotton:BIO.leafMat(cardFallback(56),'ck-cotton',{aN:false,swayW:'(position.y)',swayA:0.09}),
  rosette:BIO.leafMat(cardFallback(57),'ck-rosette',{aN:false,swayW:'(position.y)',swayA:0.02}),
  moss:BIO.leafMat(cardFallback(58),'ck-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 // Opalescent milk-jade porcelain margin hook on skarnfern (wraps BIO.foliageHook cleanly without cameraPosition)
 {
  const baseHook=M.skarnfern.onBeforeCompile;
  M.skarnfern.onBeforeCompile=sh=>{
   baseHook(sh);
   sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',
    '#include <alphatest_fragment>\n{float _pEdge=smoothstep(0.56,0.88,diffuseColor.a)*(1.0-smoothstep(0.88,0.99,diffuseColor.a));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.82,0.93,0.86),clamp(_pEdge*1.35,0.0,0.88));}');
  };
  M.skarnfern.customProgramCacheKey=()=>'biofol|crook-skarnfern-porcelain'+BIO._fx();
 }

 CROOK.SWAP=BIO.libSwap('crook',M);

 // ---------------------------------------------------------------- merged bark & fallen-wood buckets
 BIO.bucket('ck_spruce',M['bark.spruce'],{label:'Sitka spruce trunks & boughs'});
 BIO.bucket('ck_cedar',M['bark.cedar'],{label:'Western redcedar fluted trunks'});
 BIO.bucket('ck_cypress',M['bark.cypress'],{label:'Benihi red-cypress buttressed trunks'});
 BIO.bucket('ck_maple',M['bark.maple'],{label:'Moss-sleeved bigleaf maple limbs'});
 BIO.bucket('ck_fir',M['bark.fir'],{label:'Silver fir & chasm rhododendron stems'});
 BIO.bucket('ck_larch',M['bark.larch'],{label:'Krummholz larch trunks'});
 BIO.bucket('ck_rust',M['bark.rust'],{label:'Burnished metallic-scale skarn-cedar trunks'});
 BIO.bucket('ck_wood',M['wood.log'],{label:'Mossy nurse logs & tsunami driftwood'});

 // ---------------------------------------------------------------- rock & boulder geometries (closed icosahedra with vertex UVs)
 function makeRockGeo(seed,flatY,angular){
  const g=new T3.IcosahedronGeometry(1,angular?1:2),p=g.attributes.position,J={};
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.76+0.38*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
  }
  g.computeVertexNormals();
  return g;
 }
 function makeColBasaltGeo(seed){
  const g=new T3.CylinderGeometry(0.92,1.0,1.0,6,2,false);
  g.translate(0,0.5,0);
  const p=g.attributes.position,c=[];
  for(let i=0;i<p.count;i++){
   const y=p.getY(i),sh=0.82+0.18*y+0.06*(H(seed,i,3,0x92)-0.5);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- instanced item definitions (single-line BIO.def for check_cells.py!)
 BIO.def('ck_spruce_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Crookshore Sitka spruce foliage'});
 BIO.def('ck_cedar_fol',BIO.geo.clump(),M.cedar,{attrs:['aN'],label:'Western redcedar scale sprays'});
 BIO.def('ck_cypress_fol',BIO.geo.clump(),M.cedar,{attrs:['aN'],label:'Benihi red-cypress cloud pads'});
 BIO.def('ck_fir_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Vardzieti silver fir whorls'});
 BIO.def('ck_rustcedar_fol',BIO.geo.clump(),M.cedar,{attrs:['aN'],label:'Burnished skarn-cedar sprays'});
 BIO.def('ck_maple_fol',BIO.geo.clump(),M.maple,{attrs:['aN'],label:'Bigleaf maple foliage'});
 BIO.def('ck_larch_fol',BIO.geo.clump(),M.larch,{attrs:['aN'],label:'Subalpine krummholz larch needles'});
 BIO.def('ck_rhodo_fol',BIO.geo.clump(),M.rhodo,{attrs:['aN'],label:'Chasm rhododendron evergreen leaves'});
 BIO.def('ck_rhodo_bloom',BIO.geo.bloom(),M.blossom,{label:'Chasm rhododendron flower trusses'});
 BIO.def('ck_palmate',BIO.geo.clump(),M.palmate,{label:'Thorny gorge-panax umbrellas'});
 BIO.def('ck_treefern_stem',BIO.fung.stalk({r0:0.14,r1:0.09,bend:0.12,ribs:7,ribA:0.08,seg:7,rings:5}),M['bark.cypress'],{label:'Fiordland tree-fern fibrous trunk'});
 BIO.def('ck_treefern_frond',BIO.geo.frond(4),M.treefern,{label:'Fiordland tree-fern arching frond'});
 BIO.def('ck_skarnfern',BIO.geo.frond(4),M.skarnfern,{attrs:['aC2'],label:'Porcelain-margin jade-fern frond'});
 BIO.def('ck_floorfern',BIO.geo.clump(),M.floorfern,{label:'Montane sword-fern clump'});
 BIO.def('ck_mossbeard',BIO.geo.hang(),M.beard,{label:'Epiphytic rain-moss skein'});
 BIO.def('ck_spongebeard',BIO.geo.hang(),M.beard,{label:'Amber & celadon fog-beard sponge'});
 BIO.def('ck_sedge',BIO.geo.clump(),M.sedge,{label:'Tarn tuft-sedge tussock'});
 BIO.def('ck_frostsedge',BIO.geo.clump(),M.frostsedge,{attrs:['aC2'],label:'Spun frost-glass silica sedge'});
 BIO.def('ck_cotton',BIO.geo.clump(),M.cotton,{label:'Moraine cottongrass tuft'});
 BIO.def('ck_hearth_bract',BIO.geo.clump(),M.rosette,{label:'Thermogenic hearth-ring rosette bracts'});
 BIO.def('ck_mossmat',BIO.geo.mat(),M.moss,{label:'Forest & moraine moss mat'});
 BIO.def('ck_cryoalgae',BIO.geo.mat(),M.moss,{label:'Malachite-teal cryo-snow algae ring'});

 // Fungoid & sponge 3D forms (33-core-fungoid.js)
 BIO.def('ck_chimney_tube',BIO.fung.tube({n:5,r:0.16,hMin:0.42,spread:0.32,seg:8,rimK:1.35,inK:0.35,seed:52101}),M.spongeChimney,{label:'Lithistid basalt chimney-sponge oscula'});
 BIO.def('ck_chimney_rim',BIO.fung.bladder({swell:0.65,neck:0.52,h:1.15,pleats:7,pleatA:0.09,lump:0.22,seg:10,rings:5,seed:52102}),M.spongeChimney,{label:'Lithistid chimney-sponge barrel'});
 BIO.def('ck_spraycushion',BIO.fung.cap({form:'dome',h:0.46,seg:12,rings:4,lump:0.28,wav:5,wavA:0.05,under:'pores',uv:'planar',seed:52103}),M.spongeCushion,{label:'Surf-bench cushion-sponge'});
 BIO.def('ck_canopycup',BIO.fung.cap({form:'funnel',h:0.56,seg:11,rings:4,wav:6,wavA:0.08,lump:0.16,under:'pores',stem:{h:0.22,r:0.14,seg:6},seed:52104}),M.spongeCup,{label:'Celadon & amber canopy cup-sponge'});
 BIO.def('ck_rimstone_lip',BIO.fung.crust({lobes:7,lobeA:0.22,seg:18,rings:3,crustK:0.88,seed:52105}),M.rimstoneLip,{label:'Iron-jade rimstone sinter dam'});
 BIO.def('ck_rimstone_shelf',BIO.fung.bracket({arc:Math.PI*0.92,seg:10,thick:0.34,droop:0.14,wav:5,wavA:0.06,lump:0.18,seed:52106}),M.rimstoneLip,{label:'Stepped rimstone bryophyte lip'});
 BIO.def('ck_malachite_dome',BIO.fung.cap({form:'dome',h:0.52,seg:12,rings:4,lump:0.24,wav:6,wavA:0.04,under:'none',uv:'planar',seed:52107}),M.cushionRind,{label:'Malachite & ochre mineral-rind cushion-heath'});
 BIO.def('ck_hearth_spadix',BIO.fung.bladder({swell:0.45,neck:0.22,h:1.45,pleats:9,pleatA:0.06,seg:10,rings:5,seed:52108}),M.spongeCup,{label:'Thermogenic +15 degC hearth-ring spadix'});
 BIO.def('ck_nurselog',BIO.fung.stalk({r0:0.18,r1:0.14,bend:0.06,ribs:8,ribA:0.06,seg:8,rings:5}),M['wood.log'],{label:'Mossy nurse log'});

 // Chambered canyon bamboo, opalescent horsetails & bone-white wind-fluted alpine seed-chimneys (33b-core-bamboo.js)
 {
  const B=BIO.bamboo;
  const holedGeo=B.culm({n:16,seg:9,jit:0.18,grade:0.2,sheaths:2,seed:52201,holes:B.holeSet({n:16,rows:3,from:3,to:13,every:2,r:[0.22,0.34],miss:0.18,seed:52202})});
  const plainGeo=B.culm({n:16,seg:9,jit:0.18,grade:0.2,sheaths:2,seed:52203});
  BIO.def('ck_bamboo_holed',holedGeo,M['bark.bamboo'],{label:'Wind-tuned chambered bamboo culm (holed resonator)'});
  BIO.def('ck_bamboo_plain',plainGeo,M['bark.bamboo'],{label:'Chambered canyon bamboo culm'});
  [0,4,8].forEach((cellIdx,i)=>{
   BIO.def('ck_bamboo_leaf'+i,B.spray({cell:cellIdx}) /* geo.cells( */,M.bamboo,{label:'Chambered canyon bamboo leaf spray'});
  });
  BIO.def('ck_bamboo_shoot',B.shoot({n:4,seg:7}),M['bark.bamboo'],{label:'Canyon bamboo shoot'});

  // Opalescent canyon horsetail (jadeequisetum)
  const eqGeo=B.culm({n:11,seg:8,taper:0.42,swell:0.07,seed:52210});
  BIO.def('ck_equisetum_stem',eqGeo,M['bark.bamboo'],{label:'Opalescent canyon horsetail silica stem'});
  BIO.def('ck_equisetum_whorl',BIO.geo.clump(),M.horsetail,{label:'Opalescent canyon horsetail whorl'});

  // Bone-white wind-fluted alpine seed-chimneys (seedchimney)
  for(let v=0;v<2;v++){
   const chGeo=B.culm({
    n:9,seg:10,taper:0.48,swell:0.08,bend:0.06*(v?1:-1),aspect:36,seed:52220+v,
    holes:B.holeSet({n:9,rows:2,from:5,to:8,every:1,r:[0.20,0.32],miss:0.15,seed:52230+v})
   });
   BIO.def('ck_chimney_stalk'+v,chGeo,M['bark.bone'],{label:'Bone-white wind-fluted alpine seed-chimney'});
  }
  BIO.def('ck_chimney_umbel',BIO.fung.cap({form:'disc',h:0.22,seg:9,rings:2,ribs:9,ribK:0.78,under:'gills',seed:52240}),M['bark.bone'],{label:'Seed-chimney dry silica capsule'});
 }

 // Textured geological boulders & colonnades
 BIO.def('ck_rock_basalt',makeColBasaltGeo(52301),M.rockBasalt,{label:'Columnar basalt prism'});
 BIO.def('ck_rock_chevron',makeRockGeo(52302,0.68,true),M.rockBasalt,{label:'Megatsunami basalt chevron boulder'});
 BIO.def('ck_rock_breccia',makeRockGeo(52303,0.78,true),M.rockBreccia,{label:'Caldera ejecta breccia block'});
 BIO.def('ck_rock_gneiss',makeRockGeo(52304,0.74,false),M.rockGneiss,{label:'Banded gneiss gorge boulder'});
 BIO.def('ck_rock_nephrite',makeRockGeo(52305,0.66,false),M.rockNephrite,{label:'Water-worn emerald nephrite float boulder'});
 BIO.def('ck_rock_malachite',makeRockGeo(52306,0.72,true),M.rockMalachite,{label:'Malachite-stained skarn boulder'});
 BIO.def('ck_rock_gossan',makeRockGeo(52307,0.75,true),M.rockGossan,{label:'Rusty iron-skarn gossan boulder'});
 BIO.def('ck_rock_granite',makeRockGeo(52308,0.82,true),M.rockGranite,{label:'Frost-riven alpine granite tor boulder'});

 // ---------------------------------------------------------------- procedural tree builders (BIO.flareJoin + canopy sponges + octahedral impostors)
 const TREE_CFG={
  coastspruce:{bucket:'ck_spruce',fol:'ck_spruce_fol',pal:PAL.spruce,barkCol:0x6a605a,H:[34,56],rK:0.019,tiers:9,droop:0.12,conifer:true,spongeHost:true},
  westernredcedar:{bucket:'ck_cedar',fol:'ck_cedar_fol',pal:PAL.cedar,barkCol:0x7c5442,H:[30,50],rK:0.025,tiers:8,droop:0.22,buttress:true,conifer:true,spongeHost:true},
  redcypress:{bucket:'ck_cypress',fol:'ck_cypress_fol',pal:PAL.cypress,barkCol:0x865640,H:[28,48],rK:0.029,tiers:7,droop:0.05,buttress:true,flatCrown:true,conifer:false,spongeHost:true},
  bigleafmaple:{bucket:'ck_maple',fol:'ck_maple_fol',pal:PAL.maple,barkCol:0x8e9284,H:[14,24],rK:0.026,tiers:5,droop:0.08,broad:true,spongeHost:true},
  silverfir:{bucket:'ck_fir',fol:'ck_fir_fol',pal:PAL.fir,barkCol:0x848682,H:[24,40],rK:0.018,tiers:8,droop:0.08,conifer:true,spongeHost:false},
  rustcedar:{bucket:'ck_rust',fol:'ck_rustcedar_fol',pal:PAL.cedar,barkCol:0x9c6244,H:[15,28],rK:0.028,tiers:6,droop:0.14,buttress:true,gnarled:true,spongeHost:false},
  furlarch:{bucket:'ck_larch',fol:'ck_larch_fol',pal:PAL.larch,barkCol:0x766254,H:[5,13],rK:0.028,tiers:5,droop:0.15,krummholz:true,spongeHost:false}
 };

 CROOK.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,cups:0,beards:0};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.14,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  const leanX=(opt.windLeanX==null?0:opt.windLeanX)+0.04*(H(seed,3,0,0x301)-0.5)*(cfg.krummholz?3.2:1.0);
  const leanZ=(opt.windLeanZ==null?0:opt.windLeanZ)+0.04*(H(seed,4,0,0x301)-0.5)*(cfg.krummholz?3.2:1.0);
  const spongeK=clamp(opt.canopySponge==null?0:opt.canopySponge,0,1);
  let tris=0,cups=0,beards=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   // Main trunk polyline sunk 0.45 m into ground
   const nSeg=cfg.krummholz?6:8;
   const trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=cfg.gnarled||cfg.krummholz?0.055*H0*Math.sin(t*4.2+seed*0.7):0.012*H0*Math.sin(t*3.1+seed);
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed);
    const ty=y-0.45+(H0+0.45)*t;
    const flare=cfg.buttress?(1+0.68*Math.pow(Math.max(0,1-t/0.16),2)):(1+0.28*Math.pow(Math.max(0,1-t/0.12),2));
    const rad=Math.max(0.05,r0*(1-0.82*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{
    seg:r0>0.45?9:7,
    rfn:cfg.buttress?(q,ang)=>q<=2?(1+0.26*Math.max(0,Math.cos(ang*5+(seed%7)))):1:null
   });

   // Flared root buttress claws on ancient benihi red-cypress, western redcedar & skarn rustcedar
   if(cfg.buttress){
    const nRoot=4;
    for(let k=0;k<nRoot;k++){
     const az=(k/nRoot)*TAU+0.4*H(seed,10+k,1,0x302);
     const rSpan=r0*(2.1+0.9*H(seed,10+k,2,0x302));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.45,y:y+r0*1.35,z:z+Math.sin(az)*r0*0.45,r:r0*0.42},
      {x:x+Math.cos(az)*rSpan*0.65,y:y+r0*0.32,z:z+Math.sin(az)*rSpan*0.65,r:r0*0.26},
      {x:x+Math.cos(az)*rSpan,y:y-0.55,z:z+Math.sin(az)*rSpan,r:r0*0.14}
     ],{parentR:r0,k:1.45,sink:0.55,len:1.8});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:6});
    }
   }

   // Primary boughs joined via BIO.flareJoin + stem-socketed foliage clumps + perched canopy sponges
   const tiers=cfg.tiers;
   const tStart=cfg.broad?0.34:cfg.flatCrown?0.42:0.24;
   for(let ti=0;ti<tiers;ti++){
    const f=tStart+(0.94-tStart)*(ti/(tiers-1));
    const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
    const bx=lerp(trunk[idx].x,trunk[idx+1].x,tf);
    const by=lerp(trunk[idx].y,trunk[idx+1].y,tf);
    const bz=lerp(trunk[idx].z,trunk[idx+1].z,tf);
    const pR=lerp(trunk[idx].r,trunk[idx+1].r,tf);
    const nB=cfg.broad?3:(ti<tiers-2?4:3);

    for(let b=0;b<nB;b++){
     const sIdx=ti*8+b;
     const az=(b/nB)*TAU+ti*1.15+0.5*(H(seed,sIdx,1,0x303)-0.5);
     const span=(cfg.conifer?(1.05-0.68*(ti/tiers)):cfg.flatCrown?(0.55+0.52*Math.sin((ti/(tiers-1))*Math.PI)):0.88)*H0*(0.16+0.09*H(seed,sIdx,2,0x303));
     const rise=cfg.broad?0.42*span:(cfg.flatCrown?0.08*span:(-cfg.droop*span+0.12*span*(ti/tiers)));
     const mx=bx+Math.cos(az)*span*0.52,my=by+rise*0.45+0.06*span,mz=bz+Math.sin(az)*span*0.52;
     const ex=bx+Math.cos(az)*span,ey=by+rise,ez=bz+Math.sin(az)*span;
     const br0=Math.max(0.04,pR*0.44);
     const limbPts=BIO.flareJoin([
      {x:bx,y:by,z:bz,r:br0},
      {x:mx,y:my,z:mz,r:br0*0.66},
      {x:ex,y:ey,z:ez,r:br0*0.34}
     ],{parentR:pR,k:1.6,sink:0.65,len:2.1});
     tris+=BIO.tube(cfg.bucket,limbPts,cfg.barkCol,{seg:5});

     // Foliage pads socketed directly onto mid-bough and tip
     const padS=clamp(span*(cfg.conifer?0.80:0.94),1.4,6.4);
     const col1=cfg.pal[(sIdx+seed)%cfg.pal.length];
     const col2=cfg.pal[(sIdx+1+seed)%cfg.pal.length];
     const flatY=cfg.flatCrown?0.48:cfg.conifer?0.60:0.78;
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0,az,0),[padS,padS*flatY,padS],col1,{n:[Math.cos(az)*0.35,0.9,Math.sin(az)*0.35]});
     if(span>2.2){
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.2,0),[padS*0.78,padS*flatY*0.8,padS*0.78],col2,{n:[0,1,0]});
     }

     // Celadon & amber spongin canopy cup- & beard-sponges on lower/mid boughs in the >= +65 m coastal fog belt!
     if(cfg.spongeHost&&spongeK>0.15&&ti<=Math.ceil(tiers*0.62)){
      if(H(seed,sIdx,5,0x304)<0.58*spongeK){
       const cs=0.28+0.42*H(seed,sIdx,6,0x304);
       const cCol=PAL.canopyCup[(sIdx+seed)%PAL.canopyCup.length];
       BIO.put('ck_canopycup',[mx,my+br0*0.55,mz],qEuler(0.08*(H(seed,sIdx,7,0x304)-0.5),az,0),[cs,cs*0.95,cs],cCol);
       cups++;
      }
      if(H(seed,sIdx,8,0x304)<0.62*spongeK){
       const bl=0.65+1.15*H(seed,sIdx,9,0x304),bw=0.38+0.28*H(seed,sIdx,10,0x304);
       const bCol=PAL.spongeBeard[(sIdx+1+seed)%PAL.spongeBeard.length];
       BIO.put('ck_spongebeard',[lerp(bx,ex,0.62),lerp(by,ey,0.62)-br0*0.35,lerp(bz,ez,0.62)],qEuler(0,az*1.7,0),[bw,bl,bw],bCol);
       beards++;
      }
     }else if(kind==='bigleafmaple'&&H(seed,sIdx,11,0x305)<0.45){
      const ml=0.55+0.75*H(seed,sIdx,12,0x305);
      BIO.put('ck_mossbeard',[mx,my-br0*0.3,mz],qEuler(0,az,0),[0.32,ml,0.32],0x7c9658);
     }
    }
   }
   // Crown apex pad socketed directly onto trunk tip
   const topPt=trunk[trunk.length-1];
   const topS=clamp(H0*0.16,1.5,5.2);
   BIO.put(cfg.fol,[topPt.x,topPt.y,topPt.z],qEuler(0,H(seed,99,1,0x306)*TAU,0),[topS,topS*0.74,topS],cfg.pal[seed%cfg.pal.length],{n:[0,1,0]});
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0,cups:cups,beards:beards};
 };

 // Chasm Rhododendron multi-stem flowering thicket (2.5-7 m)
 CROOK.growRhodo=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale,H0=(2.8+3.8*H(seed,1,0,0x311))*sc;
  const nStem=3+(seed%3);
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   for(let k=0;k<nStem;k++){
    const az=(k/nStem)*TAU+0.6*H(seed,k,2,0x311);
    const sp=H0*(0.36+0.22*H(seed,k,3,0x311));
    const ex=x+Math.cos(az)*sp,ey=y+H0*(0.72+0.25*H(seed,k,4,0x311)),ez=z+Math.sin(az)*sp;
    const pts=BIO.flareJoin([
     {x:x,y:y-0.25,z:z,r:0.09*sc},
     {x:lerp(x,ex,0.5),y:lerp(y,ey,0.55),z:lerp(z,ez,0.5),r:0.06*sc},
     {x:ex,y:ey,z:ez,r:0.035*sc}
    ],{parentR:0.12*sc,k:1.4,sink:0.4,len:1.6});
    BIO.tube('ck_fir',pts,0x5e5248,{seg:5});
    const ps=H0*(0.52+0.18*H(seed,k,5,0x311));
    BIO.put('ck_rhodo_fol',[ex,ey,ez],qEuler(0,az,0),[ps,ps*0.70,ps],PAL.rhodoLeaf[(seed+k)%PAL.rhodoLeaf.length],{n:[0,1,0]});
    if(H(seed,k,6,0x311)<0.78){
     const bs=0.42+0.28*H(seed,k,7,0x311);
     BIO.put('ck_rhodo_bloom',[ex+Math.cos(az)*0.18,ey+ps*0.24,ez+Math.sin(az)*0.18],qEuler(0,az*1.3,0),[bs,bs,bs],PAL.rhodoBloom[(seed+k)%PAL.rhodoBloom.length]);
    }
   }
  }finally{BIO.owner=ownPrev;}
 };

 // Fiordland Plume Tree-Fern (3-8 m)
 CROOK.growTreeFern=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale,H0=(3.4+4.4*H(seed,1,0,0x321))*sc;
  const yaw=H(seed,2,0,0x321)*TAU;
  BIO.put('ck_treefern_stem',[x,y-0.18,z],qEuler(0,yaw,0),[0.85*sc,H0,0.85*sc],0x4e382a);
  const topX=x+Math.cos(yaw)*0.12*H0,topY=y-0.18+H0*0.97,topZ=z-Math.sin(yaw)*0.12*H0;
  const nFr=9;
  for(let k=0;k<nFr;k++){
   const az=(k/nFr)*TAU+0.18*H(seed,k,3,0x321);
   const fl=(1.8+1.1*H(seed,k,4,0x321))*sc;
   const pitch=-0.28+0.22*H(seed,k,5,0x321);
   BIO.put('ck_treefern_frond',[topX,topY,topZ],qEuler(0,az,pitch),[fl,fl*0.85,fl*0.78],PAL.fern[(seed+k)%PAL.fern.length]);
  }
 };

 // Octahedral impostors (34-core-impostor.js) scoped to active station tree species
 if(BIO.impostorSet&&BIO.impostor&&BIO.impostorItem){
  const impKeys=SKEY==='shore'
   ?['coastspruce','westernredcedar','redcypress','bigleafmaple']
   :SKEY==='wash'
   ?['redcypress','silverfir','westernredcedar','bigleafmaple','rustcedar']
   :['furlarch'];
  const IMP_SET=CROOK.IMP_SET=BIO.impostorSet('crook-trees',{grid:4,cell:48,slots:impKeys.length});
  CROOK.IMP={};
  impKeys.forEach(tk=>{
   CROOK.IMP[tk]=BIO.impostor('crook-'+tk,()=>{
    CROOK.growTree(tk,0,0,0,7700+tk.length*31,1.0,{canopySponge:0});
   },{set:IMP_SET,label:byKey[tk]?byKey[tk].name:tk});
  });
  BIO.impostorItem('ck_tree_imp',IMP_SET,{label:'Montane forest far impostors'});
 }
})();
