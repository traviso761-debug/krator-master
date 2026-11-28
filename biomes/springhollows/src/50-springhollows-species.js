// ================================================================= SPRINGHOLLOWS — 25 species, library materials, BIO.flareJoin trees, Carnelian clades & tufabryum ([draw])
// Registers BIO.kit('springhollows') -> SPRINGHOLLOWS: 25 native karst, spring, shut-in, dolomite-glade, gossan, Weeping-border & Carnelian species (PLAN.md section 4):
//   1-8.   springcypress, chinkapinoak, porphyrypine (card.pine.b), redbudkarst, tufabryum, calaminefern, springsponge, stranglervine
//   9-12.  whorlolive, karstsaffron (card.crop.saffron), fenestreglowmush (card.mushroom.glow), karstalecap (card.mushroom.alecap)
//   13-16. carnelian_organpipe, erythra_veil, agate_window, blood_strangler (25% Red Porphyry-Knob KFRONTIER clades)
//   17-25. weepingamberstorax, dolomitehornbeam, springtupelo, fenestrespicebush, artesianwatercress, travertinemaidenhair, zincviolet, karstwildtea, bleachfireweed
// 100% of bark, foliage, tufa, onyx, crystal, galena, ashlar, and rock surfaces bind packed library textures (materials.json).
BIO.kit('springhollows');
var SPRINGHOLLOWS={
 PHYS:HOLLOW_PHYS,
 SITES:HOLLOW_SITES,
 CROPS:SPRINGHOLLOWS_CROPS,
 FAUNA:SPRINGHOLLOWS_FAUNA,
 PLACED:[],
 CROWNS:[]
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 SPRINGHOLLOWS.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=SPRINGHOLLOWS.PAL={
  cypress:[0x366446,0x427050,0x2e583e,0x587c52],
  cypressGold:[0x9c6e38,0xb07c40,0x866032],
  oak:[0x3f6b36,0x4d7840,0x365e2f,0x5a844a],
  pine:[0x2a5036,0x345c40,0x23462e,0x3d6648],
  redbud:[0xb8628c,0xc8749c,0xa6547e,0x648248],
  olive:[0x587452,0x668260,0x4e6848],
  saffron:[0xd8cde6,0xe8d8f2,0xf0a642],
  storax:[0x6c7c34,0x8c8a38,0xb87e2c,0x526e32],
  hornbeam:[0x3d6836,0x4a7642,0x345c2e],
  tupelo:[0x326642,0x3e744e,0x2a5838,0x4c8054],
  spicebush:[0x48763c,0x588448,0x3e6834],
  watercress:[0x2e8854,0x3a9660,0x267848],
  maidenhair:[0x3c7848,0x488854,0x326a3e],
  zincviolet:[0x8c72d8,0x9e84ea,0xd8b848],
  wildtea:[0x38683a,0x447646,0x2f5a32],
  fireweed:[0xd85898,0xe66aa8,0xc44886],
  calamine:[0x2c6648,0x367452,0x24583e],
  soriBlue:[0x7ad0f8,0x92dcff,0x66c2f0],
  floorfern:[0x3b6c34,0x487a40,0x325e2c],
  gladegrass:[0x9c8e48,0xac9c52,0x8a7e3e],
  moss:[0x487434,0x56823e,0x3e662c],
  tufa:[0xdad2be,0xe4dcc8,0xcbc2ae],
  tufaMoss:[0x387862,0x42866e,0x2f6a56],
  sponge:[0x229e88,0x2cb098,0x1c8c78],
  strangler:[0x6e2852,0x823262,0x4e2844,0x385234],
  glowMush:[0x54e2c8,0x68f0d8,0x44ccb4],
  alecap:[0xc8a46e,0xd6b27c,0xb89460],
  dolomite:[0xdcd7cb,0xe6e1d6,0xcfc9bd],
  porphyry:[0x7c3a44,0x8c444e,0x6c303a],
  onyx:[0xe6d4b2,0xd8c29c,0xf0e2c6],
  galena:[0x5c626c,0x6c727e,0x4e545e]
 };

 // ---------------------------------------------------------------- 25 species roster (verified by tools/check_botany.py)
 const SPECIES=SPRINGHOLLOWS.SPECIES=[
  {key:'springcypress',name:'Sapphire-Run Bald-Cypress (Taxodium fontanum)',
   how:'Towering 24-40 m fluted buttressed russet-grey conifer standing on shallow +18 C artesian spring margins surrounded by conical pneumatophore knees (BIO.flareJoin).',
   items:['sh_cypress_fol','sh_cypress_knee'],tags:K('temperate','humid','yes',['Cfa'],'springrun',{kin:'swlowlands'})},
  {key:'chinkapinoak',name:'Karst Chinkapin Oak (Quercus muehlenbergii)',
   how:'Dominant 14-26 m silver-grey flaky-barked calciphile broadleaf oak across 100% carbonate cherty-dolomite valley shoulders and sinkhole benches.',
   items:['sh_oak_fol','sh_log'],tags:K('temperate','humid','no',['Cfa'],'dolomitebench',{crop:'acorn',kin:'nhighlands'})},
  {key:'porphyrypine',name:'Shut-In Red-Rock Pine (Pinus porphyritica)',
   how:'Wind-twisted 9-20 m dark-plated resinous pine rooting directly into insoluble acidic purple-red rhyolite porphyry dikes and sunny glade knobs.',
   items:['sh_pine_fol','sh_gladegrass'],tags:K('temperate','subhumid','no',['Cfa'],'shutingorge')},
  {key:'redbudkarst',name:'Hollow Rose-Cercis (Cercis calcicola)',
   how:'Graceful 4.5-9.0 m spreading understory tree bearing rose-lilac cauliflorous blossoms along damp cherty-dolomite ledges and sinkhole rims.',
   items:['sh_redbud_fol'],tags:K('temperate','humid','both',['Cfa'],'dolomitebench')},
  {key:'tufabryum',name:'Twilight Calcifying Glow-Curtain (Bryofungus stalactiticus)',
   how:'Pendulous 0.5-3.0 m fluted curtains of velvet moss over self-precipitated cream tufa stalactites confined to humid cave-mouth brows (0.04 <= skyOpen <= 0.42), glowing 495 nm cyan-jade at dusk.',
   items:['sh_tufa_curtain','sh_tufa_cone'],tags:N('temperate','humid','yes',['Cfa'],'fenestrecavern')},
  {key:'calaminefern',name:'Celestine-Sori Zinc-Fern (Asplenium calaminare)',
   how:'Leathery 0.30-0.85 m dark-emerald rock-cleft metallophyte fern bearing luminous sky-blue Sr/Zn-chelated spore sori directly over MVT galena-sphalerite veins.',
   items:['sh_calaminefern','sh_sori_cluster','sh_floorfern'],tags:N('temperate','humid','no',['Cfa'],'shutingorge')},
  {key:'springsponge',name:'Sapphire Resurgence Cushion (Spongilla sapphirina)',
   how:'Vivid 0.18-0.55 m emerald-turquoise lobate freshwater sponge colonies carpeting submerged chert cobbles in gin-clear +18 C karst spring runs.',
   items:['sh_springsponge','sh_moss'],tags:N('temperate','humid','yes',['Cfa'],'springrun')},
  {key:'stranglervine',name:'Bleach-Edge Strangler-Creeper (Liana & Retinol-Plum Front)',
   how:'Dense 1.5-6.5 m tangled plum-violet and dark-ivy pioneer wall actively re-invading the chemical margins of Ancient incomplete-ecocide bleach-belt hardpans.',
   items:['sh_strangler_arch','sh_strangler_pod'],tags:N('temperate','humid','no',['Cfa'],'bleachscar')},
  {key:'whorlolive',name:'High-Ria Terraced Whorl-Olive (Olea verticillata)',
   how:'Gnarled 4.5-7.2 m silver-green orchard tree cultivated across dry-stone Sikwingi dolomite terraces for rich golden culinary and lamp oil.',
   items:['sh_olive_fol'],tags:K('temperate','subhumid','no',['Cfa'],'dolomitebench',{crop:'whorl-olive'})},
  {key:'karstsaffron',name:'Sikwingi Karst Saffron Crocus (Crocus sikwingensis)',
   how:'Autumn-blooming violet-petalled crocus tufts bearing vivid crimson-gold stigmas across sun-warmed High-Ria cherty-dolomite terraces.',
   items:['sh_saffron_tuft'],tags:K('temperate','subhumid','no',['Cfa'],'dolomitebench',{crop:'saffron'})},
  {key:'fenestreglowmush',name:'Fenestre Phreatic Glow-Mushroom (Mycena cyanophreatica)',
   how:'Subterranean 0.25-0.65 m cyan-jade bioluminescent gilled mushroom colonies fruiting on damp dolomite ledges inside tube_ozarks_15 dark halls.',
   items:['sh_glow_mush','sh_glowmush_card'],tags:N('temperate','humid','yes',['Cfa'],'fenestrecavern',{crop:'glow-mushroom'})},
  {key:'karstalecap',name:'Subterranean Karst Alecap (Boletus spelaeus)',
   how:'Stout 0.25-0.60 m russet-tan porous dome mushroom cultivated in constant-temperature tube_ozarks_15 dark beds for Sikwingi cave-ale.',
   items:['sh_alecap','sh_alecap_card'],tags:K('temperate','humid','no',['Cfa'],'fenestrecavern',{crop:'alecap'})},
  {key:'carnelian_organpipe',name:'Sanguine Flute-Colony (Sanguinitubus porphyriticus)',
   how:'Clustered 3.0-10.5 m fluted crimson-and-ivory silica-chitin chimneys crowning insoluble purple-red rhyolite porphyry knobs above green dolomite hollows.',
   items:['sh_kf_flute_collar','sh_kf_bleach_skel'],tags:N('temperate','subhumid','no',['Cfa'],'porphyryglade')},
  {key:'erythra_veil',name:'Pleated Carnelian Lattice-Fan (Erythrophyllum flabellatum)',
   how:'Perforated 1.5-4.2 m vermilion-scarlet chitinous solar-fan sails oriented normal to sun-tracks across exposed red-porphyry tors and shut-in crowns.',
   items:['sh_kf_veil_lobe'],tags:N('temperate','subhumid','no',['Cfa'],'porphyryglade')},
  {key:'agate_window',name:'Chalcedony Window-Dome (Fenestraria carneliana)',
   how:'Armoured 0.20-1.05 m crimson Erythrophyll cushion rosettes capped by clear biogenic chalcedony skylight lenses on sun-baked porphyry balds.',
   items:['sh_kf_agate_rosette','sh_kf_agate_lens'],tags:N('temperate','subhumid','no',['Cfa'],'porphyryglade')},
  {key:'blood_strangler',name:'Reactive Chitin-Web (Haematoplexus calcificans)',
   how:'Arterial-red calcifying mycelial chitin cables armouring native Carnelian margins along Ancient Bleach-Scar seams and defoliant pool edges.',
   items:['sh_kf_strangler_rib'],tags:N('temperate','subhumid','no',['Cfa'],'bleachscar')},
  {key:'weepingamberstorax',name:'Weeping-Amber Karst Storax (Liquidambar lachrymans)',
   how:'Resinous 13-23 m amber-barked broadleaf bearing winged samaras and golden ria-amber tears across warm western benches bridging toward Weeping Valley.',
   items:['sh_storax_fol'],tags:K('temperate','humid','both',['Cfa'],'dolomitebench')},
  {key:'dolomitehornbeam',name:'Karst Fluted Hornbeam (Carpinus dolomitica)',
   how:'Muscular 9-17 m mossy-barked calciphile broadleaf gripping stepped cherty-dolomite terraces and bluff shoulders.',
   items:['sh_hornbeam_fol'],tags:K('temperate','humid','no',['Cfa'],'dolomitebench')},
  {key:'springtupelo',name:'Artesian Buttress-Tupelo (Nyssa sapphirina)',
   how:'Swollen-buttressed 14-26 m mottled-bark riparian broadleaf sharing moist artesian spring levees and calm dolomite pool banks beside springcypress.',
   items:['sh_tupelo_fol'],tags:K('temperate','humid','yes',['Cfa'],'springrun')},
  {key:'fenestrespicebush',name:'Sinkhole Karst Spicebush (Lindera fenestralis)',
   how:'Aromatic 2.4-4.8 m shade-loving understory shrub framing cool sinkhole fenestre rims, resurgence hollows, and damp dolomite ravines.',
   items:['sh_spicebush_fol'],tags:K('temperate','humid','both',['Cfa'],'fenestrecavern')},
  {key:'artesianwatercress',name:'Sapphire-Boil Watercress (Nasturtium fontanum)',
   how:'Lush 0.20-0.55 m emergent emerald herb colonizing ice-free +18 C calcium-rich artesian spring boils and shallow chert gravel riffles.',
   items:['sh_watercress'],tags:K('temperate','humid','yes',['Cfa'],'springrun')},
  {key:'travertinemaidenhair',name:'Travertine Drip-Wall Maidenhair (Adiantum tuficola)',
   how:'Delicate 0.25-0.65 m fan-laced fern rooted strictly on wet travertine tufa lips, spring-seep ledges, and shaded fenestre skylight rims.',
   items:['sh_maidenhair'],tags:K('temperate','humid','yes',['Cfa'],'fenestrecavern')},
  {key:'zincviolet',name:'Gossan Calamine-Violet (Viola calaminaria)',
   how:'Compact 0.15-0.38 m violet-and-gold metallophyte cushion colonizing MVT Pb-Zn sphalerite-galena gossan seams alongside calaminefern.',
   items:['sh_zincviolet'],tags:K('temperate','subhumid','no',['Cfa'],'shutingorge')},
  {key:'karstwildtea',name:'Sikwingi Terraced Wild-Tea (Camellia sikwingensis)',
   how:'Dense 1.4-2.6 m glossy evergreen camellia bush tended along mist-kissed High-Ria dolomite terrace risers and karst valley slopes.',
   items:['sh_wildtea_fol'],tags:K('temperate','humid','no',['Cfa'],'dolomitebench',{crop:'tea'})},
  {key:'bleachfireweed',name:'Bleach-Scar Vanguard Fireweed (Chamaenerion calicicola)',
   how:'Tall 0.55-1.35 m magenta-spiked pioneer herb spearheading Earth recolonization along neutralized Bleach-Scar vanguard edges and mist-pylon rims.',
   items:['sh_fireweed'],tags:K('temperate','subhumid','no',['Cfa'],'bleachscar')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 SPRINGHOLLOWS.HARVEST={
  springcypress:HV('timber',[],false,'Waterproof heartwood used for Ria Dynasty shut-in boat-lift tanks, sluices, and Swan-barge planking.'),
  chinkapinoak:HV('timber, fuel',['sweet acorn'],false,'Sweet low-tannin acorns roasted for flour and mast-fed pork; dense white-oak cooperage timber.'),
  porphyrypine:HV('timber, fuel',['pine nut'],true,'Pitch-pine tar and resin for waterproofing High-Ria boat-lift caissons.'),
  redbudkarst:HV('fuel, weaving',['edible flower'],true,'Astringent inner bark tea; flexible basket shoots.'),
  tufabryum:HV('none',[],true,'Porous light tufa-stone sawn for acoustic vaulting; glowing mucilage salve and alchemical reagent.','reagent'),
  calaminefern:HV('none',[],false,'Ashed indicator fronds assayed by High-Ria metallurgists to locate high-grade MVT zinc-silver pockets.'),
  springsponge:HV('none',[],false,'Fine sponge buffing pad for polishing optical celestine prisms and Imperial Red Porphyry.'),
  stranglervine:HV('cordage',[],true,'Bitter alkaloid bark extract used as pest-repellent varnish and tough bast cordage.'),
  whorlolive:HV('timber, carving',['whorl olive'],true,'Pressed golden culinary and lamp oil; dense burled heartwood turned for Pioneer flux-compass housings.','whorl-olive'),
  karstsaffron:HV('none',['saffron stigma'],true,'Luxury High-Ria crimson-gold spice and ceremonial textile dye grown on dry-stone dolomite terraces.','saffron'),
  fenestreglowmush:HV('none',['glow mushroom'],true,'Cold-light subterranean lantern phosphor and soothing cave-damp poultice grown in tube_ozarks_15 dark beds.','reagent'),
  karstalecap:HV('none',['alecap'],false,'Nutty meaty cavern mushroom malted into Sikwingi cave-ale and dried for river-barge rations.'),
  carnelian_organpipe:HV('none',[],false,'Calcined fluted silica-chitin chimneys ground into refractory Calamine Brass crucible grog.','reagent'),
  erythra_veil:HV('none',[],false,'Ashed Erythrophyll solar-fan lattice yields vivid carnelian ceramic glaze pigment for Ria water-gates.'),
  agate_window:HV('none',[],true,'Clear biogenic chalcedony skylight lenses polished into Pioneer survey loupes; inner gel cools chemical burns.','reagent'),
  blood_strangler:HV('cordage',[],false,'Calcified arterial-red chitin cables harvested along Bleach-Scar seams as acid-resistant lashing.','reagent'),
  weepingamberstorax:HV('timber, resin',[],true,'Exudes electrostatic golden ria-amber resin prized by Pioneer Sap-Breakers for dielectric coil-varnish and Seal-Bank wax.','reagent'),
  dolomitehornbeam:HV('timber, fuel',['hornbeam nutlet'],false,'Iron-hard sinewy white timber carved into boat-lift gear teeth, windlass cogs, and lock levers.'),
  springtupelo:HV('timber',['tupelo honey','sour drupe'],false,'Swollen hollow base carved into lightweight bee-gums yielding non-granulating golden tupelo honey.'),
  fenestrespicebush:HV('fuel',['allspice berry','aromatic twig'],true,'Fragrant oil-rich red drupes dried as warming karst pepper; steeped bark eases chill fever.'),
  artesianwatercress:HV('none',['peppery greens'],true,'Crisp antiscorbutic spring greens harvested year-round from ice-free +18 C calcium-rich resurgence boils.'),
  travertinemaidenhair:HV('weaving',[],true,'Glossy black wire-rachis woven into fine High-Ria hat-braid; soothing demulcent frond syrup.'),
  zincviolet:HV('none',[],true,'Obligate zinc-lead gossan hyperaccumulator whose violet-gold cushions pinpoint shallow sphalerite-galena lodes.'),
  karstwildtea:HV('fuel',['karst mist-tea'],true,'Shade-sweetened spring leaf buds pan-fired in Calamine Brass woks for High-Ria court tea.','tea'),
  bleachfireweed:HV('cordage',['young shoot','blossom tea'],true,'Pioneer herb colonizing neutralized Ancient defoliant hardpans; silky seed-down stuffs waterproofed vests.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=SPRINGHOLLOWS.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 SPRINGHOLLOWS.byKey=byKey;
 SPRINGHOLLOWS.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 SPRINGHOLLOWS.plantOfItem=SPRINGHOLLOWS.speciesOfItem;

 // core/hamlet gather contract
 SPRINGHOLLOWS.GATHER={
  pasture:{springrun:0.22,shutingorge:0.12,dolomitebench:0.62,porphyryglade:0.45,fenestrecavern:0.0,bleachscar:0.04},
  fish:{springrun:0.88,shutingorge:0.54,dolomitebench:0.05,porphyryglade:0.0,fenestrecavern:0.18,bleachscar:0.0}
 };
 SPRINGHOLLOWS.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in SPRINGHOLLOWS.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*SPRINGHOLLOWS.GATHER.pasture[k];
  for(const k in SPRINGHOLLOWS.GATHER.fish)f+=(Z[k]==null?0:Z[k])*SPRINGHOLLOWS.GATHER.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:false};
 };

 // ---------------------------------------------------------------- procedural fallbacks (for ?mat=proc)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=204+(H(seed,i%w,(i/w)|0,0x71)-0.5)*46;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(218,236,214,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[178,204,174]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('springhollows',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.76:opt.roughness,
   metalness:opt.metalness==null?0.04:opt.metalness,
   emissive:opt.emissive==null?0x000000:opt.emissive,
   emissiveIntensity:opt.emissiveIntensity==null?0:opt.emissiveIntensity,
   transparent:!!opt.transparent,
   opacity:opt.opacity==null?1.0:opt.opacity,
   depthWrite:opt.depthWrite==null?true:opt.depthWrite,
   vertexColors:opt.vertexColors!==false,
   side:opt.side||T3.DoubleSide
  });
  if(L&&L.scale){
   m.userData.libScale=L.scale;
   const rx=1/Math.max(0.2,L.scale[0]),ry=1/Math.max(0.2,L.scale[1]);
   if(tx.map)tx.map.repeat.set(rx,ry);
   if(tx.normalMap)tx.normalMap.repeat.set(rx,ry);
   if(tx.roughnessMap)tx.roughnessMap.repeat.set(rx,ry);
  }
  return m;
 }

 // ---------------------------------------------------------------- SPRINGHOLLOWS.M material table (100% mapped to materials.json)
 const M=SPRINGHOLLOWS.M={
  'bark.cypress':BIO.barkMat(grey(128,11)),
  'bark.oak':BIO.barkMat(grey(128,12)),
  'bark.pine':BIO.barkMat(grey(128,13)),
  'bark.redbud':BIO.barkMat(grey(128,14)),
  'bark.amber':BIO.barkMat(grey(128,17)),
  'bark.mossy':BIO.barkMat(grey(128,18)),
  'bark.plane':BIO.barkMat(grey(128,19)),
  'wood.log':BIO.barkMat(grey(128,15)),
  woodCypress:pbrMat('wood.cypress',16,{roughness:0.66,metalness:0.02,vertexColors:false,color:0xd8be9e}),

  // Karst dolomite, wet polished purple-red porphyry, banded cave-onyx, calcifying tufa, MVT crystals & works
  rockDolomite:pbrMat('rock.dolomite',21,{roughness:0.70,metalness:0.03}),
  rockPorphyry:pbrMat('rock.porphyry',22,{roughness:0.28,metalness:0.06,color:0xd48e98}),
  stoneOnyx:pbrMat('stone.onyx',23,{roughness:0.24,metalness:0.05,emissive:0x261d10,emissiveIntensity:0.14}),
  stoneTufa:pbrMat('stone.tufa',24,{roughness:0.62,metalness:0.03,emissive:0x10988e,emissiveIntensity:(typeof INIT_DUSK!=='undefined'&&INIT_DUSK)?0.85:0.14}),
  stoneAshlar:pbrMat('stone.ashlar',25,{roughness:0.56,metalness:0.03,vertexColors:false,color:0xe8e2d4}),
  crystalCelestine:pbrMat('crystal.celestine',26,{roughness:0.14,metalness:0.16,emissive:0x1c4468,emissiveIntensity:0.32}),
  crystalCalcite:pbrMat('crystal.calcite',27,{roughness:0.18,metalness:0.10,emissive:0x342610,emissiveIntensity:0.22}),
  rockGalena:pbrMat('rock.galena',28,{roughness:0.24,metalness:0.76}),
  organicSponge:pbrMat('organic.sponge',29,{roughness:0.58,metalness:0.02,emissive:0x0a3830,emissiveIntensity:0.16}),
  organicStrangler:pbrMat('organic.strangler',30,{roughness:0.62,metalness:0.03}),
  organicGlowMush:pbrMat('stone.tufa',31,{roughness:0.42,metalness:0.04,emissive:0x22d8ba,emissiveIntensity:0.72}),
  worksBrass:pbrMat('works.brass',32,{roughness:0.24,metalness:0.84,vertexColors:false,color:0xdcb262}),

  // Stem-anchored foliage & crop/herb cutout cards
  cypress:BIO.leafMat(cardFallback(51),'sh-cypress',{aN:true,swayW:'0.55',swayA:0.04}),
  pine:BIO.leafMat(cardFallback(58),'sh-pine',{aN:true,swayW:'0.55',swayA:0.04}),
  oak:BIO.leafMat(cardFallback(52),'sh-oak',{aN:true,swayW:'0.55',swayA:0.05}),
  olive:BIO.leafMat(cardFallback(53),'sh-olive',{aN:true,swayW:'0.55',swayA:0.05}),
  saffron:BIO.leafMat(cardFallback(59),'sh-saffron',{aN:false,swayW:'(position.y)',swayA:0.05}),
  glowmush:BIO.leafMat(cardFallback(60),'sh-glowmush',{aN:false,swayW:'0.0',swayA:0.0}),
  alecap:BIO.leafMat(cardFallback(61),'sh-alecap',{aN:false,swayW:'0.0',swayA:0.0}),
  samara:BIO.leafMat(cardFallback(62),'sh-samara',{aN:true,swayW:'0.55',swayA:0.05}),
  broadleaf:BIO.leafMat(cardFallback(63),'sh-broadleaf',{aN:true,swayW:'0.55',swayA:0.05}),
  heartleaf:BIO.leafMat(cardFallback(64),'sh-heartleaf',{aN:true,swayW:'0.55',swayA:0.05}),
  spicebush:BIO.leafMat(cardFallback(65),'sh-spicebush',{aN:true,swayW:'0.55',swayA:0.04}),
  watercress:BIO.leafMat(cardFallback(66),'sh-watercress',{aN:false,swayW:'(position.y)',swayA:0.06}),
  maidenhair:BIO.leafMat(cardFallback(67),'sh-maidenhair',{aN:false,swayW:'(position.y)',swayA:0.05}),
  zincviolet:BIO.leafMat(cardFallback(68),'sh-zincviolet',{aN:false,swayW:'(position.y)',swayA:0.03}),
  wildtea:BIO.leafMat(cardFallback(69),'sh-wildtea',{aN:true,swayW:'0.55',swayA:0.04}),
  fireweed:BIO.leafMat(cardFallback(70),'sh-fireweed',{aN:false,swayW:'(position.y)',swayA:0.07}),
  calaminefern:BIO.leafMat(cardFallback(54),'sh-calamine',{aN:false,swayW:'(position.x)',swayA:0.05}),
  floorfern:BIO.leafMat(cardFallback(55),'sh-floorfern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  gladegrass:BIO.leafMat(cardFallback(56),'sh-gladegrass',{aN:false,swayW:'(position.y)',swayA:0.07}),
  moss:BIO.leafMat(cardFallback(57),'sh-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 SPRINGHOLLOWS.SWAP=BIO.libSwap('springhollows',M);

 // Vertical-Stack B4: dilate cut-out card fringes (alpha < 48 filled with neighbor/mean opaque RGB)
 if(typeof SH_VSTACK!=='undefined'){
  SH_VSTACK.dilateCardTextures('springhollows',M);
  // Vertical-Stack M1/M2: KMAT_M1 km1RoughAA normal mipVariance specular AA on wet porphyry, onyx & crystals
  SH_VSTACK.applyRoughAA(M.rockPorphyry,'porphyry',[0.003,0.011,0.028,0.058,0.102,0.155,0.205,0.255],512.0);
  SH_VSTACK.applyRoughAA(M.stoneOnyx,'onyx',[0.002,0.008,0.020,0.045,0.082,0.130,0.180,0.230],512.0);
  SH_VSTACK.applyRoughAA(M.crystalCelestine,'celestine',[0.002,0.007,0.018,0.042,0.078,0.125,0.172,0.220],512.0);
  SH_VSTACK.applyRoughAA(M.crystalCalcite,'calcite',[0.003,0.010,0.025,0.054,0.096,0.148,0.198,0.248],512.0);
 }

 // Modulate 495 nm cyan-jade tufabryum emissive radiance dynamically from HOLLOW_PHYS.caveMouthGlowAt
 if(typeof tick==='function'){
  tick(()=>{
   const isNight=(typeof SH_STATE!=='undefined')&&(SH_STATE.mode==='dusk'||SH_STATE.glow01>0.35);
   const g=HOLLOW_PHYS.caveMouthGlowAt({skyOpenness01:0.19,springHumidity01:0.88,isNight:isNight});
   const targetEm=isNight?(0.25+0.95*g.biolumRadiance01):0.14;
   M.stoneTufa.emissiveIntensity=lerp(M.stoneTufa.emissiveIntensity,targetEm,0.12);
  });
 }

 // ---------------------------------------------------------------- merged bark & Carnelian chitin buckets
 BIO.bucket('sh_cypress',M['bark.cypress'],{label:'Sapphire-run bald-cypress fluted trunks & buttresses'});
 BIO.bucket('sh_oak',M['bark.oak'],{label:'Karst chinkapin oak trunks & limbs'});
 BIO.bucket('sh_pine',M['bark.pine'],{label:'Shut-in red-rock pine trunks & limbs'});
 BIO.bucket('sh_redbud',M['bark.redbud'],{label:'Hollow rose-cercis, spicebush & whorl-olive trunks'});
 BIO.bucket('sh_amber',M['bark.amber'],{label:'Weeping-amber karst storax resinous trunks & limbs'});
 BIO.bucket('sh_mossy',M['bark.mossy'],{label:'Karst fluted hornbeam & terraced wild-tea mossy trunks'});
 BIO.bucket('sh_plane',M['bark.plane'],{label:'Artesian buttress-tupelo mottled trunks & swollen bases'});
 BIO.bucket('sh_chitin',M.organicStrangler,{label:'Carnelian Erythrophyll fluted silica-chitin spires'});
 if(typeof KFRONTIER!=='undefined'&&typeof KFRONTIER.defCladeItems==='function'){
  KFRONTIER.defCladeItems(BIO,{chitin:M.organicStrangler,ruby:M.rockPorphyry,chalcedony:M.crystalCalcite,bleach:M.stoneAshlar},'sh_kf');
 }

 function makeRockGeo(seed,flatY,angular){
  const g=new T3.IcosahedronGeometry(1,angular?1:2),p=g.attributes.position,J={},c=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.76+0.38*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
   const sh=0.78+0.22*clamp(y*0.5+0.5,0,1);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- single-line BIO.def cutout items (100% check_cells.py compliant)
 BIO.def('sh_cypress_fol',BIO.geo.clump(),M.cypress,{attrs:['aN'],label:'Sapphire-run bald-cypress feathery sprays'});
 BIO.def('sh_pine_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Shut-in red-rock pine needle sprays'});
 BIO.def('sh_oak_fol',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Karst chinkapin oak toothed foliage'});
 BIO.def('sh_redbud_fol',BIO.geo.clump(),M.olive,{attrs:['aN'],label:'Hollow rose-cercis blossom & leaf sprays'});
 BIO.def('sh_olive_fol',BIO.geo.clump(),M.olive,{attrs:['aN'],label:'High-Ria terraced whorl-olive crown'});
 BIO.def('sh_storax_fol',BIO.geo.clump(),M.samara,{attrs:['aN'],label:'Weeping-amber karst storax lobed crown & samaras'});
 BIO.def('sh_hornbeam_fol',BIO.geo.clump(),M.broadleaf,{attrs:['aN'],label:'Karst fluted hornbeam calciphile broadleaf sprays'});
 BIO.def('sh_tupelo_fol',BIO.geo.clump(),M.heartleaf,{attrs:['aN'],label:'Artesian buttress-tupelo glossy foliage'});
 BIO.def('sh_spicebush_fol',BIO.geo.clump(),M.spicebush,{attrs:['aN'],label:'Sinkhole karst spicebush understory sprays'});
 BIO.def('sh_wildtea_fol',BIO.geo.clump(),M.wildtea,{attrs:['aN'],label:'Sikwingi terraced wild-tea bush crown'});
 BIO.def('sh_calaminefern',BIO.geo.frond(4),M.calaminefern,{label:'Celestine-sori zinc-indicator fern frond'});
 BIO.def('sh_floorfern',BIO.geo.clump(),M.floorfern,{label:'Karst bench & fenestre sword-fern'});
 BIO.def('sh_gladegrass',BIO.geo.clump(),M.gladegrass,{label:'Porphyry glade bluestem & chert grass'});
 BIO.def('sh_saffron_tuft',BIO.geo.clump(),M.saffron,{label:'Terraced High-Ria karst saffron crocus tuft'});
 BIO.def('sh_glowmush_card',BIO.geo.clump(),M.glowmush,{label:'Fenestre phreatic glow-mushroom cluster'});
 BIO.def('sh_alecap_card',BIO.geo.clump(),M.alecap,{label:'Subterranean karst alecap cluster'});
 BIO.def('sh_watercress',BIO.geo.clump(),M.watercress,{label:'Artesian +18 C sapphire-boil watercress clump'});
 BIO.def('sh_maidenhair',BIO.geo.clump(),M.maidenhair,{label:'Travertine drip-wall maidenhair fern fan'});
 BIO.def('sh_zincviolet',BIO.geo.clump(),M.zincviolet,{label:'MVT gossan calamine-violet cushion'});
 BIO.def('sh_fireweed',BIO.geo.clump(),M.fireweed,{label:'Bleach-Scar vanguard fireweed spike'});
 BIO.def('sh_moss',BIO.geo.mat(),M.moss,{label:'Resurgence margin & sinkhole sphagnum mat'});

 // 3D fungoid, stalactitic tufabryum, sponge, cypress-knee, strangler, cave-fungus & mineral items
 BIO.def('sh_cypress_knee',BIO.fung.stalk({r0:0.25,r1:0.06,bend:0.04,ribs:7,ribA:0.14,seg:8,rings:5}),M['bark.cypress'],{label:'Fluted bald-cypress pneumatophore knee'});
 BIO.def('sh_tufa_curtain',BIO.fung.stalk({r0:0.32,r1:0.04,bend:0.05,ribs:8,ribA:0.22,seg:9,rings:6}),M.stoneTufa,{label:'Twilight calcifying tufabryum stalactite curtain (495 nm dusk glow)'});
 BIO.def('sh_tufa_cone',BIO.fung.pod({tip:0.28,h:1.25,seg:8,rings:5,seed:74101}),M.stoneTufa,{label:'Porous tufabryum cave-brow sinter boss'});
 BIO.def('sh_sori_cluster',BIO.fung.crust({lobes:5,lobeA:0.22,seg:10,rings:3,seed:74102}),M.crystalCelestine,{label:'Sky-blue Sr/Zn-chelated calamine-fern spore sori'});
 BIO.def('sh_springsponge',BIO.fung.crust({lobes:7,lobeA:0.28,seg:12,rings:4,seed:74103}),M.organicSponge,{label:'Sapphire resurgence freshwater sponge cushion'});
 BIO.def('sh_strangler_arch',BIO.fung.stalk({r0:0.18,r1:0.09,bend:0.32,ribs:6,ribA:0.14,seg:7,rings:6}),M.organicStrangler,{label:'Bleach-edge strangler-creeper liana coil'});
 BIO.def('sh_strangler_pod',BIO.fung.cap({form:'shelf',h:0.42,seg:10,rings:4,lump:0.22,wav:5,wavA:0.08,under:'gills',uv:'planar',seed:74104}),M.organicStrangler,{label:'Retinol-plum pioneer strangler bracket'});
 BIO.def('sh_glow_mush',BIO.fung.cap({form:'bell',h:0.65,seg:10,rings:4,lump:0.12,wav:6,wavA:0.04,under:'gills',uv:'planar',seed:74105}),M.organicGlowMush,{label:'Dark-zone bioluminescent cave glow-mushroom'});
 BIO.def('sh_alecap',BIO.fung.cap({form:'dome',h:0.55,seg:10,rings:4,lump:0.18,wav:5,wavA:0.05,under:'pores',uv:'planar',seed:74106}),M.stoneOnyx,{label:'Subterranean tube_ozarks_15 dark-bed alecap fungus'});
 BIO.def('sh_log',BIO.fung.stalk({r0:0.17,r1:0.13,bend:0.07,ribs:7,ribA:0.06,seg:8,rings:5}),M['wood.log'],{label:'Mossy hollow nurse log'});

 BIO.def('sh_rock_dolomite',makeRockGeo(74201,0.82,true),M.rockDolomite,{label:'Cream cherty-dolomite karst boulder'});
 BIO.def('sh_rock_porphyry',makeRockGeo(74202,0.78,true),M.rockPorphyry,{label:'Water-polished purple-red rhyolite porphyry monolith'});
 BIO.def('sh_pillar_onyx',BIO.fung.stalk({r0:0.42,r1:0.36,bend:0.02,ribs:9,ribA:0.09,seg:10,rings:6}),M.stoneOnyx,{label:'Banded honey-cream cave-onyx column'});
 BIO.def('sh_crystal_celestine',BIO.fung.stalk({r0:0.18,r1:0.04,bend:0.0,ribs:4,ribA:0.18,seg:4,rings:3}),M.crystalCelestine,{label:'MVT pale sky-blue celestine crystal prism (SrSO4)'});
 BIO.def('sh_crystal_calcite',BIO.fung.pod({tip:0.18,h:1.15,seg:6,rings:4,seed:74205}),M.crystalCalcite,{label:'Scalenohedral honey dogtooth calcite crystal'});
 BIO.def('sh_ore_galena',makeRockGeo(74206,0.92,true),M.rockGalena,{label:'Metallic MVT galena-sphalerite (zinc=90) ore cluster'});

 // ---------------------------------------------------------------- procedural tree builders (BIO.flareJoin + grounded knees + 0 floating stems)
 const TREE_CFG={
  springcypress:{bucket:'sh_cypress',fol:'sh_cypress_fol',pal:PAL.cypress,barkCol:0x785846,H:[24,38],rK:0.031,tiers:5,droop:0.04,buttress:true,flatCrown:true,knees:true},
  chinkapinoak:{bucket:'sh_oak',fol:'sh_oak_fol',pal:PAL.oak,barkCol:0x767066,H:[14,25],rK:0.030,tiers:4,droop:0.07,broad:true},
  porphyrypine:{bucket:'sh_pine',fol:'sh_pine_fol',pal:PAL.pine,barkCol:0x765242,H:[9,19],rK:0.026,tiers:4,droop:0.09,flatCrown:true},
  redbudkarst:{bucket:'sh_redbud',fol:'sh_redbud_fol',pal:PAL.redbud,barkCol:0x6e5450,H:[4.8,8.8],rK:0.028,tiers:3,droop:0.10,broad:true},
  whorlolive:{bucket:'sh_redbud',fol:'sh_olive_fol',pal:PAL.olive,barkCol:0x726858,H:[4.5,7.2],rK:0.032,tiers:3,droop:0.08,broad:true},
  weepingamberstorax:{bucket:'sh_amber',fol:'sh_storax_fol',pal:PAL.storax,barkCol:0x8c6238,H:[13,23],rK:0.031,tiers:4,droop:0.14,broad:true},
  dolomitehornbeam:{bucket:'sh_mossy',fol:'sh_hornbeam_fol',pal:PAL.hornbeam,barkCol:0x666c5c,H:[9,17],rK:0.029,tiers:4,droop:0.08,buttress:true,broad:true},
  springtupelo:{bucket:'sh_plane',fol:'sh_tupelo_fol',pal:PAL.tupelo,barkCol:0x787468,H:[14,26],rK:0.034,tiers:4,droop:0.09,buttress:true,broad:true},
  fenestrespicebush:{bucket:'sh_redbud',fol:'sh_spicebush_fol',pal:PAL.spicebush,barkCol:0x5e5248,H:[2.4,4.8],rK:0.024,tiers:2,droop:0.12,broad:true},
  karstwildtea:{bucket:'sh_mossy',fol:'sh_wildtea_fol',pal:PAL.wildtea,barkCol:0x5c5848,H:[1.4,2.6],rK:0.028,tiers:2,droop:0.06,broad:true}
 };

 SPRINGHOLLOWS.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:8,r0:0.2,knees:0};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.08,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  const leanX=(opt.windLeanX==null?0:opt.windLeanX)+0.025*(H(seed,3,0,0x301)-0.5);
  const leanZ=(opt.windLeanZ==null?0:opt.windLeanZ)+0.025*(H(seed,4,0,0x301)-0.5);
  let tris=0,knees=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=5,trunk=[];
   // Grounded sink (-0.85 m on buttressed trees, -0.55 m on upland trees) so bole & buttresses never float on slopes
   const sinkY=cfg.buttress?0.85:0.55;
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=0.016*H0*Math.sin(t*3.3+seed*0.7);
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed);
    const ty=y-sinkY+(H0+sinkY)*t;
    const flare=cfg.buttress?(1+0.96*Math.pow(Math.max(0,1-t/0.24),2)):(1+0.28*Math.pow(Math.max(0,1-t/0.15),2));
    const rad=Math.max(0.04,r0*(1-0.80*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{
    seg:r0>0.40?7:5,
    rfn:cfg.buttress?(q,ang)=>q<=2?(1+0.34*Math.max(0,Math.cos(ang*6+(seed%7)))):1:null
   });

   // Flared root buttresses (BIO.flareJoin) + emergent bald-cypress pneumatophore knees
   if(cfg.buttress){
    for(let k=0;k<4;k++){
     const az=(k/4)*TAU+0.34*H(seed,10+k,1,0x302);
     const rSpan=r0*(2.4+1.0*H(seed,10+k,2,0x302));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.46,y:y+r0*1.70,z:z+Math.sin(az)*r0*0.46,r:r0*0.45},
      {x:x+Math.cos(az)*rSpan*0.64,y:y+r0*0.35,z:z+Math.sin(az)*rSpan*0.64,r:r0*0.28},
      {x:x+Math.cos(az)*rSpan,y:y-0.85,z:z+Math.sin(az)*rSpan,r:r0*0.14}
     ],{parentR:r0,k:1.55,sink:0.55,len:1.9});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:4});
     if(cfg.knees&&!opt.impostor&&opt.wetFeet){
      const kd=rSpan*(1.12+0.80*H(seed,20+k,1,0x303));
      const kx=x+Math.cos(az+0.26)*kd,kz=z+Math.sin(az+0.26)*kd;
      const ky=BIO.host.terrainH(kx,kz),kh=0.62+0.92*H(seed,20+k,2,0x303);
      BIO.put('sh_cypress_knee',[kx,ky-0.22,kz],qEuler(0,az,0),[0.52+0.34*kh,kh,0.52+0.34*kh],C(cfg.barkCol));
      knees++;
     }
    }
   }

   // Primary limbs with BIO.flareJoin + foliage pads socketed strictly onto limb coordinates (0.00 m stem float!)
   const nTiers=cfg.tiers;
   let maxReach=1.2;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.flatCrown?(0.50+0.45*tf):(0.34+0.60*tf);
    const nBr=3;
    for(let b=0;b<nBr;b++){
     const az=(b/nBr)*TAU+ti*1.22+0.34*H(seed,30+ti*4+b,1,0x304);
     const reach=H0*(cfg.flatCrown?(0.17+0.17*Math.sin(tf*Math.PI*0.85)):(0.23*Math.sin(tf*Math.PI*0.9+0.25)));
     if(reach>maxReach)maxReach=reach;
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.04,r0*(1-0.75*baseT));
     const lift=cfg.flatCrown?0.06:0.18;
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.58)+reach*0.05,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.03,pR*0.48)},
      {x:mx,y:my,z:mz,r:Math.max(0.025,pR*0.30)},
      {x:ex,y:ey,z:ez,r:Math.max(0.02,pR*0.16)}
     ],{parentR:pR,k:1.6,sink:0.62,len:Math.min(2.1,H0*0.25)});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     const palUse=(kind==='springcypress'&&ti===nTiers-1&&H(seed,55+b,1,0x305)<0.22)?PAL.cypressGold:cfg.pal;
     const fCol=C(palUse[Math.floor(H(seed,60+ti*5+b,2,0x305)*palUse.length)%palUse.length]);
     const padW=reach*(cfg.flatCrown?1.05:0.90),padH=padW*(cfg.flatCrown?0.46:0.70);
     const endPt=brPts[brPts.length-1],midPt=brPts[Math.max(0,brPts.length-2)];
     BIO.put(cfg.fol,[endPt.x,endPt.y,endPt.z],qEuler(0.05*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>2.1){
      const fCol2=C(cfg.pal[Math.floor(H(seed,70+ti*5+b,3,0x305)*cfg.pal.length)%cfg.pal.length]);
      BIO.put(cfg.fol,[midPt.x,midPt.y,midPt.z],qEuler(0,az+1.05,0),[padW*0.75,padH*0.78,padW*0.75],fCol2);
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const topW=H0*(cfg.flatCrown?0.26:0.21),topH=topW*(cfg.flatCrown?0.42:0.66);
   BIO.put(cfg.fol,[topPt.x,topPt.y,topPt.z],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));
   if(!opt.impostor&&H0>=5.0){
    SPRINGHOLLOWS.CROWNS.push({x:x,z:z,y0:y+H0*0.32,h:H0*0.72,r:maxReach*1.25});
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0,knees:knees};
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 7 m trees
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('sh_trees',{grid:8,cell:64,slots:9});
  SPRINGHOLLOWS.IMP={
   set:impSet,
   cypress:BIO.impostor('sh_imp_cypress',()=>SPRINGHOLLOWS.growTree('springcypress',0,0,0,7401,1.0,{impostor:true}),{set:impSet,label:'Sapphire-run bald-cypress (impostor)'}),
   oak:BIO.impostor('sh_imp_oak',()=>SPRINGHOLLOWS.growTree('chinkapinoak',0,0,0,7402,1.0,{impostor:true}),{set:impSet,label:'Karst chinkapin oak (impostor)'}),
   pine:BIO.impostor('sh_imp_pine',()=>SPRINGHOLLOWS.growTree('porphyrypine',0,0,0,7403,1.0,{impostor:true}),{set:impSet,label:'Shut-in red-rock pine (impostor)'}),
   storax:BIO.impostor('sh_imp_storax',()=>SPRINGHOLLOWS.growTree('weepingamberstorax',0,0,0,7404,1.0,{impostor:true}),{set:impSet,label:'Weeping-amber karst storax (impostor)'}),
   hornbeam:BIO.impostor('sh_imp_hornbeam',()=>SPRINGHOLLOWS.growTree('dolomitehornbeam',0,0,0,7405,1.0,{impostor:true}),{set:impSet,label:'Karst fluted hornbeam (impostor)'}),
   tupelo:BIO.impostor('sh_imp_tupelo',()=>SPRINGHOLLOWS.growTree('springtupelo',0,0,0,7406,1.0,{impostor:true}),{set:impSet,label:'Artesian buttress-tupelo (impostor)'})
  };
  BIO.impostorItem('sh_imp_trees',impSet,{minRange:195,label:'Springhollows gallery & plateau tree impostor'});
 }else{
  SPRINGHOLLOWS.IMP=null;
 }
})();
