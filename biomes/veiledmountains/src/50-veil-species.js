// ================================================================= VEILED MOUNTAINS — 17 species, packed materials, nurse-log cathedrals, giant tree-ferns & alien epiphytes ([draw])
// Registers BIO.kit('veiledmountains') -> VEIL (PLAN.md section 6):
//   Hoh-Scale Overstory & Cloud-Forest Canopy:
//     1. veilcedar        (40-62 m Veil red-cypress straddling nurse logs on BIO.flareJoin stilt-roots; Timpar-Kuran plank timber)
//     2. sitkaspruce      (35-58 m nurse-stilt Sitka spruce on Z1 floors & 8-18 m wind-clipped crag form on Z4 spires)
//     3. clubmaple        (14-25 m wide-arching maple with 3x mossy branch bolsters & 3-5 m Selaginella clubmoss curtains)
//     4. cloudoak         (7-16 m writhing multi-stemmed serpentine cloud-oak encased in blue-emerald moss velvet)
//     5. umbrellaelm      (12-23 m flat-topped cantilevered gorge shelf-elm catching cataract light shafts)
//   Paleobotanical & Kratorian Cloud Gigantism:
//     6. veilfern         (8-14 m giant arborescent tree-fern with moss-furred trunk & 14 radiating 4-5 m lacy fronds)
//     7. sporespike       (2.5-5.0 m prehistoric mire quill-rosette sending up tall fuzzy bronze-brown flash-spore columns)
//     8. crimsonchalice   (1.2-2.8 m crimson-magenta-violet structural-tinted crown-tank epiphytes + purple KSPAN lianas)
//     9. tankstrap        (0.5-1.1 m glossy emerald bromeliad cistern clusters crowding horizontal limbs & nurse logs)
//    10. veilcomb         (0.4-1.4 m opalescent celadon-violet BIO.fung mist-gill brackets with faint cold night glimmer)
//   Bryophytes, Understory & Subalpine Chutes:
//    11. clubdrape        (1.5-5.0 m pendulous yellow-green Selaginella & pale Usnea curtains)
//    12. pillowmoss       (0.4-1.8 m hemispherical cushion-moss domes burying megabreccia boulder fields)
//    13. swordfern        (0.6-1.5 m Hoh sword-fern & oxalis sward blanketing nurse logs & gorge walls)
//    14. devilsclub       (1.8-3.4 m spined gorge-palm canes with broad palmate leaves & scarlet autumn berry cones)
//    15. slidealder       (2.5-5.8 m downslope-bowed vivid lime-green avalanche-chute thickets)
//    16. furlarch         (10-22 m shaggy moss-barked subalpine fur-larch hung with Usnea beard-lichen)
//    17. krumm            (0.8-2.4 m wind-sheared megabreccia creeping stone-pine krummholz mats)
BIO.kit('veiledmountains');
var VEIL={
 PHYS:VEIL_PHYS,
 SITES:VEIL_SITES,
 CROPS:VEIL_CROPS,
 FAUNA:VEIL_FAUNA,
 PLACED:[],
 CROWNS:[]
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler,qFacing}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 VEIL.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=VEIL.PAL={
  cedar:[0x234e2c,0x2c5c34,0x1d4226,0x35683c],
  spruce:[0x1f4830,0x28543a,0x193c28,0x306042],
  maple:[0x42782e,0x528a38,0x386a26,0x6a9c3e],
  cloudoak:[0x2c5c3c,0x366a46,0x244e34,0x3f744e],
  elm:[0x386c32,0x467c3c,0x2e5e2a],
  treefern:[0x2e7630,0x3b883a,0x256628,0x489642],
  swordfern:[0x34722e,0x428238,0x2b6226],
  devilsclub:[0x448232,0x54943c,0x38702a],
  slidealder:[0x62a82e,0x74ba38,0x529626,0x82c642],
  larch:[0x466e38,0x567e42,0x8c9844],
  krumm:[0x264a32,0x2f563c,0x1e3e28],
  drape:[0x58862e,0x6a9838,0x4a7626,0x7aa444],
  usnea:[0x849c78,0x94ac86,0x748c6a],
  chalice:[0xc61c66,0x9c1872,0xd82876,0x741c82],
  liana:[0x52204c,0x64285c,0x42183e],
  tankstrap:[0x2e8e32,0x3ca23e,0x24782a,0x4ab246],
  sporespike:[0x8c6432,0x9e743c,0x785428],
  sporequill:[0x486e30,0x567c3a,0x3c5e28],
  veilcomb:[0x84bcb4,0x98b0cc,0x76aea8,0xa8bce0],
  pillow:[0x38682e,0x467838,0x2e5826,0x528640],
  scarlet:[0xc82624,0xdc322c,0xb21e1c],
  megabreccia:[0x545c60,0x464e52,0x646c70],
  peat:[0x583428,0x4a2a20,0x663e30],
  cobble:[0x7e847e,0x8c928a,0x6e746e],
  scree:[0x646a6c,0x747a7c,0x565c5e]
 };

 // ---------------------------------------------------------------- 17 species roster (PLAN.md section 6)
 const SPECIES=VEIL.SPECIES=[
  {key:'veilcedar',name:'Veil Red-Cypress (Thuja velata)',
   how:'Colossal 40-62 m fluted red-brown rainforest conifer straddling fallen nurse logs on arched stilt-roots, hung with mossy bark sleeves.',
   items:['vm_cedar_fol','vm_nurselog','vm_cedar_slab'],tags:K('temperate','wet','both',['Cfb','Cfa'],'mistfloor')},
  {key:'sitkaspruce',name:'Nurse-Stilt Spruce (Picea sitchensis var. velata)',
   how:'Towering 35-58 m straight-boled valley spruce regenerating in straight nurse-log colonnades, or stunted 8-18 m crag trees on Z4 spires.',
   items:['vm_spruce_fol'],tags:K('temperate','wet','both',['Cfb','Dfb','Dfc'],'mistfloor',{kin:'nhighlands'})},
  {key:'clubmaple',name:'Bolster Maple (Acer bryophorum)',
   how:'Wide-arching 14-25 m mid-canopy broadleaf whose horizontal boughs are swollen 3x by spongy yellow-green moss bolsters and 4 m clubmoss drapes.',
   items:['vm_maple_fol'],tags:K('temperate','wet','both',['Cfb'],'mistfloor',{kin:'nhighlands'})},
  {key:'cloudoak',name:'Writhing Cloud-Oak (Quercus nubigena)',
   how:'Contorted 7-16 m multi-stemmed serpentine elfin cloud-tree with knotted moss-velvet root bridges over boulder labyrinths.',
   items:['vm_cloudoak_fol'],tags:K('cool','wet','no',['Cfc','Dfb'],'cloudbelt')},
  {key:'umbrellaelm',name:'Gorge Shelf-Elm (Ulmus cataractae)',
   how:'Flat-topped 12-23 m cantilevered broadleaf clinging to sheer misty cataract ledges, catching crepuscular sun-breaks.',
   items:['vm_elm_fol'],tags:K('temperate','wet','yes',['Cfb','Cfc'],'gorge')},
  {key:'veilfern',name:'Giant Veil Tree-Fern (Cyathea titanica)',
   how:'Arborescent 8-14 m moss-furred root-mantle trunk crowned by 14 radiating 4-5 m lacy emerald fronds in 1.21 atm / 0.75 g valley mist.',
   items:['vm_treefern_frond','vm_crozier_pod'],tags:K('temperate','wet','both',['Cfb','Cfc'],'mistfloor',{kin:'shighlands'})},
  {key:'sporespike',name:'Mire Spore-Column (Lycopodiella colossea)',
   how:'Prehistoric 2.5-5.0 m bog rosette sending up 3-5 tall fuzzy bronze-brown flash-spore strobilus columns along misty backwaters.',
   items:['vm_sporespike_quill','vm_sporespike_tip'],tags:N('temperate','wet','yes',['Cfb'],'mistfloor',{crop:'mire-sporespike'})},
  {key:'crimsonchalice',name:'Crimson Crown-Chalice (Vrieseomorpha purpurea)',
   how:'Massive 1.2-2.8 m structural-tinted crimson, magenta, and deep-violet canopy tank-rosettes and purple lianas harvesting green-filtered mist light.',
   items:['vm_chalice_fol'],tags:N('temperate','wet','no',['Cfb','Cfc','Dfb'],'cloudbelt',{crop:'crimson-chalice'})},
  {key:'tankstrap',name:'Emerald Cistern-Strap (Guzmania velata)',
   how:'Dense 0.5-1.1 m glossy emerald bromeliad strap-rosette clusters crowding horizontal boughs, crotches, and fallen nurse logs.',
   items:['vm_tankstrap_fol'],tags:K('temperate','wet','no',['Cfb','Cfc','Dfb'],'cloudbelt')},
  {key:'veilcomb',name:'Opalescent Mist-Gill (Pleurotus nebulae)',
   how:'Translucent 0.4-1.4 m celadon-to-pale-violet pleated bracket shelves on cataract walls and wet boles with faint cold night spore-glimmer.',
   items:['vm_veilcomb_shelf'],tags:N('temperate','wet','yes',['Cfb','Cfc','Dfb'],'gorge',{kin:'farside'})},
  {key:'clubdrape',name:'Pendulous Veil-Moss (Selaginella pendula)',
   how:'Ribboned 1.5-5.0 m yellow-green clubmoss curtains in Z1-Z3 grading into pale grey-green Usnea witch-hair strands in Z4.',
   items:['vm_drape_curtain'],tags:K('temperate','wet','no',['Cfb','Cfc','Dfb','Dfc'],'mistfloor')},
  {key:'pillowmoss',name:'Boulder Cushion-Moss (Leucobryum pulvillus)',
   how:'Thick 0.4-1.8 m hemispherical bryophyte cushions turning raw megabreccia talus into continuous sculpted emerald waves.',
   items:['vm_pillow_dome','vm_moss_mat'],tags:K('cool','wet','no',['Cfb','Cfc','Dfb'],'cloudbelt',{crop:'sphagnum'})},
  {key:'swordfern',name:'Hoh Sword-Fern & Oxalis Sward (Polystichum munitum)',
   how:'Lush 0.6-1.5 m arching pinnate fern clumps and wood-sorrel carpeting nurse-log floors and dripping canyon walls.',
   items:['vm_swordfern'],tags:K('temperate','wet','both',['Cfb','Dfb'],'mistfloor',{kin:'nhighlands'})},
  {key:'devilsclub',name:'Spined Gorge-Palm (Oplopanax horridus)',
   how:'Curving 1.8-3.4 m spine-armoured canes bearing 0.5 m palmate leaves and upright cones of scarlet autumn berries in wet seeps.',
   items:['vm_palmate_fol','vm_scarlet_cone'],tags:K('temperate','wet','yes',['Cfb','Dfb'],'gorge')},
  {key:'slidealder',name:'Avalanche Slide-Alder (Alnus viridis ssp. sinuata)',
   how:'Downslope-bowed 2.5-5.8 m springy multi-stem thickets painting steep Z4 snow-slide paths vivid lime-green.',
   items:['vm_alder_fol'],tags:K('cool','humid','both',['Dfc'],'alderchute',{crop:'alder-bark'})},
  {key:'furlarch',name:'Subalpine Fur-Larch (Larix velata)',
   how:'Shaggy moss-barked 10-22 m subalpine conifer flanking Veilpass boulder torrents and avalanche chutes.',
   items:['vm_larch_fol'],tags:K('cool','humid','no',['Dfc','ET'],'alderchute',{kin:'nwouterwall'})},
  {key:'krumm',name:'Megabreccia Krummholz Pine (Pinus pumila)',
   how:'Prostrate 0.8-2.4 m wind-flagged creeping stone-pine mats hugging periglacial scree below the +5,400 m snowline.',
   items:['vm_krumm_fol'],tags:K('polar','subhumid','no',['ET'],'highcol',{kin:'nwouterwall'})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});
 VEIL.PLANTS=SPECIES;

 VEIL.HARVEST={
  veilcedar:HV('timber, fibre',[],true,'Primary Timpar-Kuran split-plank & totem timber, rot-proof roof shakes, inner-bark attus fibre & antiseptic steam-tea.'),
  sitkaspruce:HV('timber, resin',[],true,'Resonant mast/beam wood, spruce-root lashing for kerfed chests & canoes, vitamin-rich tip tea & pitch torch resin.'),
  clubmaple:HV('carving, fuel',['early-spring sap'],false,'Tough carved war-visor, paddle & bowl wood; sweet boiled early-spring maple sap.'),
  cloudoak:HV('charcoal, fuel',['leached acorn meal'],false,'Dense smokeless irori hearth charcoal, leached acorn meal, and dark tannin bark dye.'),
  umbrellaelm:HV('cordage, timber',[],true,'Woven inner-bark attus cloth staple shared by Timpar-Kuran & Hayrant; mucilaginous wound-poultice.'),
  veilfern:HV('fencing, fuel',['steamed pith starch','fiddlehead croziers'],true,'Steamed trunk pith starch & young croziers, rot-resistant trunk-core fencing & ember-punk, soothing burn-poultice.'),
  sporespike:HV('none',[],false,'Water-repellent golden flash-spore dust cast onto irori hearth coals by Timpar-Kuran shamans for raid-signals; silica stems scour wood.','reagent'),
  crimsonchalice:HV('none',[],true,'Prized Timpar-Kuran crimson-magenta structural dye, antiseptic tank-gel, and clean aerial rainwater high above valley mud.','reagent'),
  tankstrap:HV('cordage',[],true,'Tough leaf-base fibre cordage and cooling febrifuge leaf-sap.'),
  veilcomb:HV('fuel',[],true,'Dried spore-sponge tinder and numbing wound-pack gathered along cataract spray walls.'),
  clubdrape:HV('none',[],true,'Antiseptic Selaginella & Usnea wound-packing moss, dry bedding, and Timpar-Kuran slat-armour padding.'),
  pillowmoss:HV('none',[],true,'Thick peat-turf chinking for Jomon pit-roofs and antiseptic sphagnum surgical dressing.'),
  swordfern:HV('none',['roasted fern rhizomes','sour oxalis greens'],true,'Roasted fern rhizomes, sour oxalis greens, and cooling spore rub for nettle stings.'),
  devilsclub:HV('none',[],true,'Sacred Timpar-Kuran shamanic protection ward, rheumatism root-bark tonic, and charcoal face-paint.','berry'),
  slidealder:HV('fuel',[],true,'Sweet smokehouse salmon-curing wood, orange-red inner-bark dye, and astringent bark wash.'),
  furlarch:HV('fuel, timber',[],true,'High-camp resinous firewood, red-brown bark tannin, and antiscorbutic needle tea.'),
  krumm:HV('fuel',[],true,'High Veilpass bivouac resin firewood and scurvy-preventing pine-needle infusion.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=VEIL.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 VEIL.byKey=byKey;
 VEIL.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 VEIL.plantOfItem=VEIL.speciesOfItem;

 VEIL.zones=['mistfloor','gorge','cloudbelt','alderchute','highcol'];
 VEIL.GATHER={
  pasture:{mistfloor:0.44,gorge:0.12,cloudbelt:0.28,alderchute:0.32,highcol:0.04},
  fish:{mistfloor:0.88,gorge:0.78,cloudbelt:0.18,alderchute:0.54,highcol:0.0}
 };
 VEIL.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in VEIL.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*VEIL.GATHER.pasture[k];
  for(const k in VEIL.GATHER.fish)f+=(Z[k]==null?0:Z[k])*VEIL.GATHER.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:false};
 };

 // ---------------------------------------------------------------- procedural fallbacks (for ?mat=proc)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=202+(H(seed,i%w,(i/w)|0,0x71)-0.5)*46;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(214,236,212,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[174,204,172]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('veiledmountains',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.68:opt.roughness,
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

 // ---------------------------------------------------------------- VEIL.M material table (100% mapped to materials.json)
 const M=VEIL.M={
  'bark.cedar':BIO.barkMat(grey(128,11)),
  'bark.spruce':BIO.barkMat(grey(128,12)),
  'bark.mossy':BIO.barkMat(grey(128,13)),
  'bark.alder':BIO.barkMat(grey(128,14)),
  'bark.treefern':BIO.barkMat(grey(128,15)),
  'wood.log':BIO.barkMat(grey(128,16)),

  woodCedar:pbrMat('wood.cedar',17,{roughness:0.62,metalness:0.02,color:0xd0b28e}),
  rockMegabreccia:pbrMat('rock.megabreccia',21,{roughness:0.44,metalness:0.06}),
  surfaceCushion:pbrMat('surface.cushion',22,{roughness:0.78,metalness:0.02}),
  organicVeilcomb:pbrMat('organic.veilcomb',23,{roughness:0.28,metalness:0.06,emissive:0x286e68,emissiveIntensity:0.04}),
  ancientConcrete:pbrMat('ancient.concrete',24,{roughness:0.58,metalness:0.08}),
  ancientBronze:pbrMat('ancient.bronze',25,{roughness:0.32,metalness:0.76}),

  // Ground-family solid companions so every packed ground.* family is sampled on all 5 stations
  peatClod:pbrMat('ground.peat',26,{roughness:0.86,metalness:0.02}),
  riverCobble:pbrMat('ground.cobble',27,{roughness:0.52,metalness:0.04}),
  screeTalus:pbrMat('ground.scree',28,{roughness:0.64,metalness:0.04}),
  mossClod:pbrMat('ground.moss',29,{roughness:0.84,metalness:0.02}),

  // Stem-calibrated foliage, frond, epiphyte & hanging-drape cutout cards (exact materials.json keys)
  spruce:BIO.leafMat(cardFallback(51),'vm-spruce',{aN:true,swayW:'0.50',swayA:0.04}),
  cedar:BIO.leafMat(cardFallback(52),'vm-cedar',{aN:true,swayW:'0.52',swayA:0.04}),
  larch:BIO.leafMat(cardFallback(53),'vm-larch',{aN:true,swayW:'0.55',swayA:0.05}),
  maple:BIO.leafMat(cardFallback(54),'vm-maple',{aN:true,swayW:'0.55',swayA:0.05}),
  cloudoak:BIO.leafMat(cardFallback(55),'vm-cloudoak',{aN:true,swayW:'0.48',swayA:0.04}),
  palmate:BIO.leafMat(cardFallback(56),'vm-palmate',{aN:false,swayW:'(position.y)',swayA:0.05}),
  treefern:BIO.leafMat(cardFallback(57),'vm-treefern',{aN:false,swayW:'(position.y)',swayA:0.06}),
  swordfern:BIO.leafMat(cardFallback(58),'vm-swordfern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  chalice:BIO.leafMat(cardFallback(59),'vm-chalice',{aN:false,swayW:'(position.y)',swayA:0.03}),
  tankstrap:BIO.leafMat(cardFallback(60),'vm-tankstrap',{aN:false,swayW:'(position.y)',swayA:0.03}),
  sporespike:BIO.leafMat(cardFallback(61),'vm-sporespike',{aN:false,swayW:'(position.y)',swayA:0.04}),
  drape:BIO.leafMat(cardFallback(62),'vm-drape',{aN:false,swayW:'(-position.y)',swayA:0.08}),
  moss:BIO.leafMat(cardFallback(63),'vm-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 VEIL.SWAP=BIO.libSwap('veiledmountains',M);

 if(typeof VEIL_VSTACK!=='undefined'){
  VEIL_VSTACK.dilateCardTextures('veiledmountains',M);
  VEIL_VSTACK.applyRoughAA(M.rockMegabreccia,'megabreccia',[0.003,0.011,0.028,0.058,0.102,0.155,0.205,0.255],512.0);
  VEIL_VSTACK.applyRoughAA(M.surfaceCushion,'cushion',[0.003,0.012,0.030,0.062,0.110,0.165,0.215,0.265],512.0);
  VEIL_VSTACK.applyRoughAA(M.organicVeilcomb,'veilcomb',[0.002,0.008,0.020,0.045,0.084,0.132,0.182,0.232],256.0);
  VEIL_VSTACK.applyRoughAA(M.ancientConcrete,'concrete',[0.003,0.011,0.026,0.056,0.098,0.150,0.200,0.250],512.0);
  VEIL_VSTACK.applyRoughAA(M.ancientBronze,'bronze',[0.002,0.009,0.022,0.048,0.088,0.138,0.188,0.238],256.0);
 }

 // Faint cold celadon spore-glimmer on veilcomb mist-gill brackets at night / deep-veil (PLAN.md section 6 & Q3)
 tick(()=>{
  const hr=(typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock)?KHOST.host.clock.hour:(VEIL_STATE.night?22.0:9.5);
  const isDark=VEIL_STATE.night||hr<5.5||hr>19.0;
  const targetEm=isDark?0.28:(VEIL_STATE.mode==='deepveil'?0.08:0.03);
  M.organicVeilcomb.emissiveIntensity=lerp(M.organicVeilcomb.emissiveIntensity,targetEm,0.10);
 });

 // ---------------------------------------------------------------- merged bark, nurse-log, tree-fern & liana buckets
 BIO.bucket('vm_cedar',M['bark.cedar'],{label:'Veil red-cypress fluted trunks & stilt-roots'});
 BIO.bucket('vm_spruce',M['bark.spruce'],{label:'Nurse-stilt Sitka spruce trunks & boughs'});
 BIO.bucket('vm_mossy',M['bark.mossy'],{label:'Moss-bolstered maple, writhing cloud-oak & shelf-elm limbs'});
 BIO.bucket('vm_alder',M['bark.alder'],{label:'Slide-alder, fur-larch & devil-club stems'});
 BIO.bucket('vm_treefern',M['bark.treefern'],{label:'Giant veil tree-fern fibrous root-mantle trunks & petioles'});
 BIO.bucket('vm_log',M['wood.log'],{label:'Fallen giant nurse-logs, chasm span logs & purple epiphyte lianas'});

 function makeSpheroidalRockGeo(seed,flatY,lobes,domeBias){
  const g=new T3.IcosahedronGeometry(1,2),p=g.attributes.position,J={},c=[],uv=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined){
    const fb=KRAND.fbm(x*1.6+seed*0.1,y*1.6,z*1.6,2,seed)-0.5;
    const lobe=lobes?0.13*Math.cos(Math.atan2(z,x)*lobes):0;
    J[k]=0.86+0.26*fb+lobe;
   }
   const s=J[k];
   const yMod=domeBias&&y<0?flatY*0.62:flatY;
   const nx=x*s,ny=y*s*yMod,nz=z*s;
   p.setXYZ(i,nx,ny,nz);
   uv.push(nx*0.5+0.5,nz*0.5+0.5);
   const sh=0.74+0.26*clamp(y*0.5+0.5,0,1);
   c.push(sh,sh,sh);
  }
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- single-line BIO.def cutout items (100% check_cells.py compliant)
 BIO.def('vm_cedar_fol',BIO.geo.clump(),M.cedar,{attrs:['aN'],label:'Veil red-cypress flat scale-leaf sprays'});
 BIO.def('vm_spruce_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Nurse-stilt Sitka spruce needle sprays'});
 BIO.def('vm_krumm_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Megabreccia krummholz creeping stone-pine mat'});
 BIO.def('vm_larch_fol',BIO.geo.clump(),M.larch,{attrs:['aN'],label:'Subalpine fur-larch soft needle sprays'});
 BIO.def('vm_maple_fol',BIO.geo.clump(),M.maple,{attrs:['aN'],label:'Bolster maple broad lobed canopy'});
 BIO.def('vm_elm_fol',BIO.geo.clump(),M.maple,{attrs:['aN'],label:'Gorge shelf-elm cantilevered leaf tier'});
 BIO.def('vm_cloudoak_fol',BIO.geo.clump(),M.cloudoak,{attrs:['aN'],label:'Writhing cloud-oak moss-velvet crown'});
 BIO.def('vm_alder_fol',BIO.geo.clump(),M.cloudoak,{attrs:['aN'],label:'Avalanche slide-alder vivid lime-green crown'});
 BIO.def('vm_palmate_fol',BIO.geo.clump(),M.palmate,{label:'Spined gorge-palm broad palmate leaf'});
 BIO.def('vm_treefern_frond',BIO.geo.frond(4),M.treefern,{label:'Giant veil tree-fern 4.5 m bipinnate emerald frond'});
 BIO.def('vm_swordfern',BIO.geo.clump(),M.swordfern,{label:'Hoh sword-fern arching pinnate clump'});
 BIO.def('vm_chalice_fol',BIO.geo.clump(),M.chalice,{label:'Crimson crown-chalice structural magenta-violet tank rosette'});
 BIO.def('vm_tankstrap_fol',BIO.geo.clump(),M.tankstrap,{label:'Emerald cistern-strap glossy bromeliad rosette'});
 BIO.def('vm_sporespike_quill',BIO.geo.clump(),M.sporespike,{label:'Mire spore-column basal quill rosette'});
 BIO.def('vm_drape_curtain',BIO.geo.hang(),M.drape,{label:'Pendulous Selaginella clubmoss & Usnea veil curtain'});
 BIO.def('vm_moss_mat',BIO.geo.mat(),M.moss,{label:'Feather-moss & sour oxalis forest floor sward'});

 // ---------------------------------------------------------------- 3D fungoid brackets, cushion-moss domes, strobili, nurse-logs & boulders
 BIO.def('vm_veilcomb_shelf',BIO.fung.bracket({seg:9,thick:0.28,droop:0.14,wav:5,wavA:0.07,seed:92101}),M.organicVeilcomb,{label:'Opalescent mist-gill cloud-combing bracket'});
 BIO.def('vm_pillow_dome',makeSpheroidalRockGeo(92102,0.66,3,true),M.surfaceCushion,{label:'Hemispherical boulder cushion-moss dome'});
 BIO.def('vm_sporespike_tip',BIO.fung.pod({tip:0.28,h:2.4,seg:8,rings:5}),M.organicVeilcomb,{label:'Mire spore-column fuzzy bronze strobilus cone'});
 BIO.def('vm_crozier_pod',BIO.fung.pod({tip:0.45,h:1.3,seg:7,rings:4}),M['bark.treefern'],{label:'Coiled giant tree-fern fiddlehead crozier'});
 BIO.def('vm_scarlet_cone',BIO.fung.pod({tip:0.35,h:1.6,seg:7,rings:4}),M.peatClod,{label:'Spined gorge-palm upright scarlet berry cone'});
 BIO.def('vm_nurselog',BIO.fung.stalk({r0:0.18,r1:0.15,bend:0.03,ribs:8,ribA:0.05,seg:8,rings:5}),M['wood.log'],{label:'Moss-furred fallen nurse log'});
 BIO.def('vm_log_cedar',BIO.fung.stalk({r0:0.16,r1:0.13,bend:0.02,ribs:7,ribA:0.04,seg:7,rings:4}),M['bark.cedar'],{label:'Fallen red-cypress bark log'});
 BIO.def('vm_log_spruce',BIO.fung.stalk({r0:0.15,r1:0.12,bend:0.02,ribs:7,ribA:0.04,seg:7,rings:4}),M['bark.spruce'],{label:'Fallen Sitka spruce bark log'});
 BIO.def('vm_log_mossy',BIO.fung.stalk({r0:0.15,r1:0.12,bend:0.04,ribs:6,ribA:0.05,seg:7,rings:4}),M['bark.mossy'],{label:'Fallen moss-bolstered hardwood limb'});
 BIO.def('vm_log_alder',BIO.fung.stalk({r0:0.12,r1:0.10,bend:0.04,ribs:6,ribA:0.03,seg:7,rings:4}),M['bark.alder'],{label:'Fallen avalanche slide-alder stem'});
 BIO.def('vm_log_treefern',BIO.fung.stalk({r0:0.14,r1:0.12,bend:0.02,ribs:7,ribA:0.04,seg:7,rings:4}),M['bark.treefern'],{label:'Fallen fibrous tree-fern trunk segment'});
 BIO.def('vm_cedar_slab',makeSpheroidalRockGeo(92106,0.22,2,false),M.woodCedar,{label:'Split red-cypress weathered plank slab'});
 BIO.def('vm_megabreccia_rock',makeSpheroidalRockGeo(92107,0.78,4,false),M.rockMegabreccia,{label:'Tilted impact megabreccia talus boulder'});
 BIO.def('vm_peat_clod',makeSpheroidalRockGeo(92108,0.45,3,true),M.peatClod,{label:'Dark red-brown root-throw peat hummock'});
 BIO.def('vm_cobble',makeSpheroidalRockGeo(92109,0.42,0,false),M.riverCobble,{label:'Water-rounded U-valley meltwater cobble'});
 BIO.def('vm_scree',makeSpheroidalRockGeo(92110,0.58,5,false),M.screeTalus,{label:'Angular high-col frost-shattered scree block'});
 BIO.def('vm_moss_boulder',makeSpheroidalRockGeo(92111,0.68,2,true),M.mossClod,{label:'Feather-moss upholstered stream boulder'});
 BIO.def('vm_ancient_stone',makeSpheroidalRockGeo(92112,0.55,4,false),M.ancientConcrete,{label:'Moss-grown Ancient Kanopi concrete fragment'});
 BIO.def('vm_bronze_ring',new T3.TorusGeometry(0.42,0.09,7,14),M.ancientBronze,{label:'Verdigris Ancient Kanopi bronze flange ring'});

 // ---------------------------------------------------------------- Epiphyte & bryophyte branch/bole dresser (0.00 m bark surface attachment!)
 VEIL.dressEpiphytes=function(info,seed,opt){
  opt=opt||{};
  const epi=VEIL_PHYS.epiphyteLoadAt(opt.elevAsl==null?2550:opt.elevAsl,opt.mist01==null?0.74:opt.mist01,0.58);
  const st={crimsonchalice:0,tankstrap:0,clubdrape:0,veilcomb:0};
  const forks=info.forks||[];
  const boughs=info.boughs||[];

  // 1. Crimson crown-chalice (1.2-2.8 m magenta-violet structural rosettes right ON trunk/fork bark surface + purple KSPAN lianas)
  if(epi.crimsonChalice01>0.22&&forks.length&&!opt.impostor){
   for(let i=0;i<forks.length;i++){
    if(H(seed,i,1,0x511)>epi.crimsonChalice01*0.82)continue;
    const fk=forks[i];
    const az=H(seed,i,2,0x511)*TAU;
    const sx=fk.x+Math.cos(az)*fk.r*0.96,sz=fk.z+Math.sin(az)*fk.r*0.96,sy=fk.y;
    const sc=lerp(1.15,2.45,H(seed,i,3,0x511));
    const col=C(PAL.chalice[Math.floor(H(seed,i,4,0x511)*PAL.chalice.length)%PAL.chalice.length]);
    BIO.put('vm_chalice_fol',[sx,sy,sz],qEuler(0.14*(H(seed,i,5,0x511)-0.5),az,0),[sc,sc*0.92,sc],col);
    st.crimsonchalice++;
    // Optional purple climbing rhizome liana draped via KSPAN down to a lower trunk anchor
    if(i>0&&typeof KSPAN!=='undefined'&&H(seed,i,6,0x511)<0.45){
     const lo=forks[0];
     const dx=sx-lo.x,dz=sz-lo.z;
     if(Math.hypot(dx,dz)>0.35){
      const sp=KSPAN.solve([sx,sy,sz],[lo.x+Math.cos(az+1.1)*lo.r,lo.y,lo.z+Math.sin(az+1.1)*lo.r],{slack:0.06});
      const pts=KSPAN.points(sp,5).map(p=>({x:p[0],y:p[1],z:p[2],r:0.045}));
      BIO.tube('vm_log',pts,PAL.liana[i%PAL.liana.length],{seg:4});
     }
    }
   }
  }

  // 2. Emerald tank-strap bromeliads & pendulous clubdrape curtains right ON horizontal bough points (r <= 0.11 m!)
  if(!opt.impostor&&boughs.length){
   for(let i=0;i<boughs.length;i++){
    const bg=boughs[i];
    if(epi.tankStrap01>0.24&&H(seed,i,1,0x512)<epi.tankStrap01*0.76){
     const ts=lerp(0.55,1.05,H(seed,i,2,0x512));
     const tCol=C(PAL.tankstrap[Math.floor(H(seed,i,3,0x512)*PAL.tankstrap.length)%PAL.tankstrap.length]);
     BIO.put('vm_tankstrap_fol',[bg.x,bg.y+bg.r*0.75,bg.z],qEuler(0,H(seed,i,4,0x512)*TAU,0),[ts,ts*0.85,ts],tCol);
     st.tankstrap++;
    }
    if(epi.drapeLenM>1.2&&H(seed,i,5,0x512)<0.68){
     const dl=epi.drapeLenM*lerp(0.58,1.02,H(seed,i,6,0x512));
     const palD=opt.usnea?PAL.usnea:PAL.drape;
     const dCol=C(palD[Math.floor(H(seed,i,7,0x512)*palD.length)%palD.length]);
     BIO.put('vm_drape_curtain',[bg.x,bg.y-bg.r*0.65,bg.z],qEuler(0,H(seed,i,8,0x512)*TAU,0),[dl*0.34,dl,dl*0.34],dCol);
     st.clubdrape++;
    }
   }
  }

  // 3. Opalescent veilcomb mist-gill brackets on lower bole via BIO.fung.shelves
  if(!opt.impostor&&epi.veilComb01>0.26&&forks.length&&H(seed,1,9,0x513)<epi.veilComb01*0.72){
   const fk0=forks[0];
   const azB=H(seed,2,9,0x513)*TAU;
   const nx=Math.cos(azB),nz=Math.sin(azB);
   const recs=BIO.fung.shelves({
    at:[fk0.x+nx*fk0.r*0.92,fk0.y,fk0.z+nz*fk0.r*0.92],
    n:[nx,0,nz],
    rows:2,
    per:2,
    dy:0.32,
    spread:0.26,
    size:[0.28,0.62],
    thick:0.42,
    seed:seed+77
   });
   BIO.fung.put('vm_veilcomb_shelf',recs,r=>C(PAL.veilcomb[Math.floor(r.u*PAL.veilcomb.length)%PAL.veilcomb.length]));
   st.veilcomb+=recs.length;
  }

  return st;
 };

 // ---------------------------------------------------------------- Overstory, Cloud-Oak, Shelf-Elm, Fur-Larch & Slide-Alder builders
 const TREE_CFG={
  veilcedar:{bucket:'vm_cedar',fol:'vm_cedar_fol',pal:PAL.cedar,barkCol:0x785240,H:[42,60],rK:0.024,tiers:8,droop:0.16,conifer:true,stilt:true},
  sitkaspruce:{bucket:'vm_spruce',fol:'vm_spruce_fol',pal:PAL.spruce,barkCol:0x62544a,H:[36,56],rK:0.023,tiers:8,droop:0.14,conifer:true,stilt:true},
  cragspruce:{bucket:'vm_spruce',fol:'vm_spruce_fol',pal:PAL.spruce,barkCol:0x5a4e46,H:[9,17],rK:0.030,tiers:5,droop:0.12,conifer:true,stilt:false},
  clubmaple:{bucket:'vm_mossy',fol:'vm_maple_fol',pal:PAL.maple,barkCol:0x587042,H:[14,24],rK:0.036,tiers:4,droop:0.06,broad:true,bolster:true},
  cloudoak:{bucket:'vm_mossy',fol:'vm_cloudoak_fol',pal:PAL.cloudoak,barkCol:0x426646,H:[8,15],rK:0.044,tiers:4,droop:0.04,serpentine:true,bolster:true},
  umbrellaelm:{bucket:'vm_mossy',fol:'vm_elm_fol',pal:PAL.elm,barkCol:0x546448,H:[12,21],rK:0.032,tiers:4,droop:0.02,umbrella:true},
  furlarch:{bucket:'vm_alder',fol:'vm_larch_fol',pal:PAL.larch,barkCol:0x665c50,H:[11,21],rK:0.026,tiers:5,droop:0.14,conifer:true},
  slidealder:{bucket:'vm_alder',fol:'vm_alder_fol',pal:PAL.slidealder,barkCol:0x686e62,H:[3.0,5.6],rK:0.034,tiers:3,droop:0.05,bowed:true}
 };

 VEIL.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:8,r0:0.2,epi:{}};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.11,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  const stiltLift=cfg.stilt?clamp(opt.stiltLift==null?0:opt.stiltLift,0,1.8):0;
  const baseY=y+stiltLift;
  const bowAz=opt.bowAz==null?(H(seed,3,0,0x301)*TAU):opt.bowAz;
  const bowAmt=cfg.bowed?0.34:(cfg.serpentine?0.16:0.022);
  const leanX=Math.cos(bowAz)*bowAmt,leanZ=Math.sin(bowAz)*bowAmt;
  let tris=0;
  const forks=[],boughs=[];

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=cfg.serpentine?6:5,trunk=[],sinkY=stiltLift>0.15?0.05:0.62;
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const serp=cfg.serpentine?(0.11*H0*Math.sin(t*4.6+seed*1.1)):(0.014*H0*Math.sin(t*3.1+seed*0.7));
    const tx=x+leanX*H0*t*t+serp*Math.cos(seed*0.9+t*2.0);
    const tz=z+leanZ*H0*t*t+serp*Math.sin(seed*0.9+t*2.0);
    const ty=baseY-sinkY+(H0+sinkY)*t;
    const flare=(1+0.38*Math.pow(Math.max(0,1-t/0.18),2));
    // Taper top vertex cleanly to <= 0.055 m so top crown stem sits within 0.06 m of bark triangles!
    const rad=i===nSeg?0.05:Math.max(0.055,r0*(1-0.88*Math.pow(t,0.86))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
    if(i>=1&&i<=nSeg-1){
     forks.push({x:tx,y:ty,z:tz,r:rad});
    }
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{seg:r0>0.42?7:5});

   // Arched nurse-log stilt-roots (image_2, image_3) or knotted cloud-oak moss-root bridges (image_15)
   if(stiltLift>0.12||cfg.serpentine||r0>0.45){
    const nRoots=stiltLift>0.12?4:3;
    for(let k=0;k<nRoots;k++){
     const az=(k/nRoots)*TAU+0.35*H(seed,10+k,1,0x302);
     const rSpan=r0*(stiltLift>0.12?2.8:2.2)*(0.85+0.3*H(seed,10+k,2,0x302));
     const archY=baseY+r0*0.9;
     const midY=y+stiltLift*0.55+r0*0.28;
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.48,y:archY,z:z+Math.sin(az)*r0*0.48,r:r0*0.44},
      {x:x+Math.cos(az)*rSpan*0.58,y:midY,z:z+Math.sin(az)*rSpan*0.58,r:r0*0.26},
      {x:x+Math.cos(az)*rSpan,y:y-0.78,z:z+Math.sin(az)*rSpan,r:r0*0.13}
     ],{parentR:r0,k:1.55,sink:0.52,len:1.8});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:5});
    }
   }

   const nTiers=cfg.tiers;
   let maxReach=1.8;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.conifer?(0.20+0.74*tf):(cfg.umbrella?(0.52+0.44*tf):(0.32+0.62*tf));
    const nBr=cfg.conifer?4:3;
    for(let b=0;b<nBr;b++){
     const az=(b/nBr)*TAU+ti*1.22+0.34*H(seed,30+ti*4+b,1,0x304);
     const reach=H0*(cfg.conifer?(0.20*(1-0.68*tf)):(cfg.umbrella?(0.28*(0.65+0.35*tf)):(0.25*Math.sin(tf*Math.PI*0.9+0.25))));
     if(reach>maxReach)maxReach=reach;
     // Interpolate exact trunk center at baseT
     const segF=baseT*nSeg,si=Math.min(nSeg-1,Math.floor(segF)),su=segF-si;
     const bx0=lerp(trunk[si].x,trunk[si+1].x,su);
     const by0=lerp(trunk[si].y,trunk[si+1].y,su);
     const bz0=lerp(trunk[si].z,trunk[si+1].z,su);
     const pR=lerp(trunk[si].r,trunk[si+1].r,su);
     const lift=cfg.conifer?-0.05:(cfg.umbrella?0.06:0.20);
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.54),my=lerp(by0,ey,0.58)+(cfg.bolster?reach*0.08:reach*0.04),mz=lerp(bz0,ez,0.54);
     // Moss-bolstered clubmaple & cloudoak limbs have thicker mid-sleeves tapering to <= 0.06 m at the twig tip!
     const midR=cfg.bolster?Math.min(0.11,Math.max(0.06,pR*0.52)):Math.min(0.09,Math.max(0.04,pR*0.28));
     const tipR=Math.min(0.065,Math.max(0.03,pR*0.15));
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.05,pR*0.48)},
      {x:mx,y:my,z:mz,r:midR},
      {x:ex,y:ey,z:ez,r:tipR}
     ],{parentR:pR,k:1.55,sink:0.56,len:1.8});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:cfg.bolster?5:4});

     boughs.push({x:mx,y:my,z:mz,r:midR});

     const fCol=C(cfg.pal[Math.floor(H(seed,60+ti*5+b,2,0x305)*cfg.pal.length)%cfg.pal.length]);
     const padW=Math.max(1.1,reach*(cfg.conifer?1.08:(cfg.umbrella?1.15:0.96)));
     const padH=padW*(cfg.conifer?0.46:(cfg.umbrella?0.38:0.68));
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.05*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>2.1&&midR<=0.115){
      const fCol2=C(cfg.pal[Math.floor(H(seed,70+ti*5+b,3,0x305)*cfg.pal.length)%cfg.pal.length]);
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.76,padH*0.76,padW*0.76],fCol2);
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const topW=Math.max(1.0,H0*(cfg.conifer?0.13:0.22)),topH=topW*(cfg.conifer?0.95:0.58);
   BIO.put(cfg.fol,[topPt.x,topPt.y,topPt.z],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));

   let epi={crimsonchalice:0,tankstrap:0,clubdrape:0,veilcomb:0};
   if(!opt.impostor&&!opt.noEpi){
    epi=VEIL.dressEpiphytes(
     {forks:forks,boughs:boughs},
     seed+901,
     {elevAsl:opt.elevAsl==null?2500:opt.elevAsl,mist01:opt.mist01==null?0.76:opt.mist01,usnea:kind==='furlarch'||kind==='cragspruce'}
    );
    VEIL.CROWNS.push({x:x,z:z,y0:baseY+H0*0.26,h:H0*0.74,r:maxReach*1.25});
   }
   return{tris:tris,H:H0,r0:r0,epi:epi};
  }finally{
   BIO.owner=ownPrev;
  }
 };

 // ---------------------------------------------------------------- Giant Veil Tree-Fern builder (8-14 m tall! image_6, image_10)
 VEIL.growTreeFern=function(x,y,z,seed,scale,opt){
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(8.2,13.8,H(seed,1,0,0x401))*sc;
  const r0=lerp(0.28,0.42,H(seed,2,0,0x401))*sc;
  const leanAz=H(seed,3,0,0x401)*TAU,leanAmt=0.05+0.06*H(seed,4,0,0x401);
  let tris=0;
  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=5,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const tx=x+Math.cos(leanAz)*H0*leanAmt*t*t;
    const tz=z+Math.sin(leanAz)*H0*leanAmt*t*t;
    const ty=y-0.45+(H0+0.45)*t;
    const rad=lerp(r0*1.25,r0*0.64,Math.pow(t,0.75));
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube('vm_treefern',trunk,0x485236,{seg:6});

   const top=trunk[nSeg];
   const nFronds=13;
   const frondLen=lerp(3.6,4.9,H(seed,5,0,0x401))*sc;
   for(let f=0;f<nFronds;f++){
    const tier=f<5?0:1;
    const az=(f/nFronds)*TAU+tier*0.28+0.12*H(seed,10+f,1,0x402);
    const pitch=tier===0?0.42:0.16;
    const stubL=0.55;
    const sx=top.x+Math.cos(az)*stubL,sz=top.z+Math.sin(az)*stubL,sy=top.y+0.18*tier+stubL*0.25;
    // Short petiole stub tapering to 0.035 m so frond base is held 0.00 m on wood!
    tris+=BIO.tube('vm_treefern',[
     {x:top.x,y:top.y-0.08,z:top.z,r:0.08},
     {x:sx,y:sy,z:sz,r:0.035}
    ],0x425632,{seg:4});
    const fCol=C(PAL.treefern[f%PAL.treefern.length]);
    const q=qFacing([Math.cos(az)*Math.cos(pitch),Math.sin(pitch),Math.sin(az)*Math.cos(pitch)]);
    BIO.put('vm_treefern_frond',[sx,sy,sz],q,[frondLen*0.38,frondLen,frondLen*0.38],fCol);
   }
   // Coiled fiddlehead croziers at the crown apex
   for(let c=0;c<3;c++){
    const azC=(c/3)*TAU+seed;
    BIO.put('vm_crozier_pod',[top.x+Math.cos(azC)*0.16,top.y+0.12,top.z+Math.sin(azC)*0.16],qEuler(0.18,azC,0),[0.22,0.55,0.22],C(0x526e32));
   }
   if(!opt.impostor){
    VEIL.CROWNS.push({x:x,z:z,y0:top.y-1.2,h:3.6,r:frondLen*0.95});
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0};
 };

 // ---------------------------------------------------------------- Mire Spore-Column builder (2.5-5.0 m! image_10)
 VEIL.growSporeSpike=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  let tris=0;
  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   // Basal stiff olive-green quill rosette on ground
   for(let q=0;q<3;q++){
    const az=(q/3)*TAU+0.4*H(seed,q,1,0x451);
    const qs=lerp(1.15,1.65,H(seed,q,2,0x451))*sc;
    BIO.put('vm_sporespike_quill',[x,y-0.03,z],qEuler(0,az,0),[qs,qs*0.88,qs],C(PAL.sporequill[q%PAL.sporequill.length]));
   }
   // 3 to 5 tall fuzzy bronze-brown strobilus spikes (2.6..4.9 m)
   const nSpikes=3+Math.floor(H(seed,1,3,0x451)*3);
   for(let s=0;s<nSpikes;s++){
    const az=(s/nSpikes)*TAU+0.35*H(seed,10+s,1,0x452);
    const rOff=0.22+0.32*H(seed,10+s,2,0x452);
    const hSp=lerp(2.5,4.9,H(seed,10+s,3,0x452))*sc;
    const bx=x+Math.cos(az)*rOff,bz=z+Math.sin(az)*rOff;
    const tx=bx+Math.cos(az)*0.24*sc,tz=bz+Math.sin(az)*0.24*sc;
    tris+=BIO.tube('vm_alder',[
     {x:bx,y:y-0.25,z:bz,r:0.085*sc},
     {x:lerp(bx,tx,0.5),y:y+hSp*0.5,z:lerp(bz,tz,0.5),r:0.068*sc},
     {x:tx,y:y+hSp*0.74,z:tz,r:0.048*sc}
    ],0x6e542e,{seg:5});
    const stCol=C(PAL.sporespike[s%PAL.sporespike.length]);
    BIO.put('vm_sporespike_tip',[tx,y+hSp*0.70,tz],qEuler(0.05,az,0),[0.16*sc,hSp*0.34,0.16*sc],stCol);
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris};
 };

 // ---------------------------------------------------------------- Spined Gorge-Palm (Devil's Club, 1.8-3.4 m)
 VEIL.growDevilsClub=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const hC=lerp(1.9,3.3,H(seed,1,0,0x461))*sc;
  let tris=0;
  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nCanes=2+Math.floor(H(seed,2,0,0x461)*2);
   for(let c=0;c<nCanes;c++){
    const az=(c/nCanes)*TAU+0.5*H(seed,10+c,1,0x462);
    const tx=x+Math.cos(az)*0.55*sc,tz=z+Math.sin(az)*0.55*sc,ty=y+hC*(0.82+0.18*H(seed,10+c,2,0x462));
    tris+=BIO.tube('vm_alder',[
     {x:x,y:y-0.22,z:z,r:0.055},
     {x:lerp(x,tx,0.5),y:y+hC*0.48,z:lerp(z,tz,0.5),r:0.042},
     {x:tx,y:ty,z:tz,r:0.030}
    ],0x786c52,{seg:4});
    const pSc=lerp(0.85,1.25,H(seed,10+c,3,0x462))*sc;
    BIO.put('vm_palmate_fol',[tx,ty,tz],qEuler(0.10,az,0),[pSc,pSc*0.62,pSc],C(PAL.devilsclub[c%PAL.devilsclub.length]));
    BIO.put('vm_scarlet_cone',[tx,ty+0.08,tz],qEuler(0,az,0),[0.11*sc,0.34*sc,0.11*sc],C(PAL.scarlet[c%PAL.scarlet.length]));
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris};
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 7 m forms
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('vm_trees',{grid:8,cell:64,slots:4});
  VEIL.IMP={
   set:impSet,
   cedar:BIO.impostor('vm_imp_cedar',()=>VEIL.growTree('veilcedar',0,0,0,9201,0.88,{impostor:true}),{set:impSet,label:'Veil red-cypress (impostor)'}),
   spruce:BIO.impostor('vm_imp_spruce',()=>VEIL.growTree('sitkaspruce',0,0,0,9202,0.88,{impostor:true}),{set:impSet,label:'Nurse-stilt spruce (impostor)'}),
   maple:BIO.impostor('vm_imp_maple',()=>VEIL.growTree('clubmaple',0,0,0,9203,1.0,{impostor:true}),{set:impSet,label:'Bolster maple (impostor)'}),
   treefern:BIO.impostor('vm_imp_treefern',()=>VEIL.growTreeFern(0,0,0,9204,1.0,{impostor:true}),{set:impSet,label:'Giant veil tree-fern (impostor)'})
  };
  BIO.impostorItem('vm_imp_trees',impSet,{minRange:195,label:'Veiled Mountains rainforest canopy impostor'});
 }else{
  VEIL.IMP=null;
 }
})();
