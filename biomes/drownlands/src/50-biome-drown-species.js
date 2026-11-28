/* ==================== DROWN — species, builders, PBR library materials & gather contract ==================== */
/* Registers BIO.kit('drownlands') -> DROWN (aliased as DROWNLANDS):
   - 8 core Drownlands species (PLAN.md section 4): verdigrismangrove, tealcoppice, brucitestack, spongecoral,
     tidefan, shoalkelp, ribbonseagrass, snaggrove.
   - 7 ultramafic-refuge, vent-rim & strand kin species (PLAN.md sections 0, 2, 3.4): araucaria, pycnandra,
     gymnostoma, verdigris, limeshelf, seepcomb, stormwrack.
   - 100% of bark, foliage, brucite sinter, drowned snag, oyster collar, sponge-coral, rock, and ?works=0 props
     bind packed library textures from materials.json (0 untextured lit meshes). */

BIO.kit('drownlands');
var DROWN={SITES:DROWN_SITES,PHYS:DROWN_PHYS,FAUNA:DROWN_FAUNA,LOG:[],VAPOUR:[]};
var DROWNLANDS=DROWN;

(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 DROWN.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const KT=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:true,native:true
 },o||{});
 const ET=(clim,arid,rip,kp,zone,o)=>Object.assign(KT(clim,arid,rip,kp,zone,o),{alien:false,native:false});
 const HV=(wood,edible,medicinal,note)=>({wood:wood==null?'none':wood,edible:edible||[],medicinal:!!medicinal,note:note||''});

 /* ==================== palettes (sRGB hex) ==================== */
 const PAL=DROWN.PAL={
  mangroveBark:[0x4e463e,0x585046,0x443e38],
  mangroveLeaf:[0x2b5634,0x34623c,0x254c2e,0x3d6c42],
  tealsap:[0x1ec8be,0x28d6ca,0x18b4ac],
  coppiceLeaf:[0x3a6c52,0x46785e,0x326048,0x528468],
  brucite:[0xf0f4f2,0xe4eeec,0xd8eae8,0xf6f8f6],
  celadon:[0xc6e2de,0xb8dad6,0xd4ece8],
  limeshelf:[0xecf2ee,0xe0eae6,0xd6e4e2],
  seepcomb:[0xeee4ca,0xf4ecd4,0xe2d8be],
  spongeOchre:[0xc8923e,0xd6a24c,0xb87e34,0x46988e],
  spongeTeal:[0x3e968c,0x4ca69a,0x7e5270,0xc68c42],
  coralBrain:[0xb88c48,0x589488,0x8c5e74,0xc89c56],
  fanSaffron:[0xd89638,0xe2a648,0x88589c,0x9866ac],
  kelp:[0x8c7c2e,0x9c8a36,0x786c28,0xa6943e],
  seagrass:[0x2e7848,0x388652,0x266c40,0x42925c],
  snagWood:[0xc8cac4,0xd4d6d0,0xbabcb6,0xdedfd9],
  oyster:[0xe4e6e0,0xd6d8d0,0xeeefe9],
  wrack:[0x7e323e,0x8e3c48,0x6c4c34],
  archBark:[0x726458,0x66584e,0x7e6e62],
  archScale:[0x2e4e32,0x365a3a,0x28462c,0x3e6240],
  verdigris:[0x42987c,0x388a70,0x52a68a],
  serpRock:[0x283e36,0x324a40,0x22342e],
  jadeRock:[0x2e8a68,0x389a76,0x26785a],
  basaltRock:[0x3a3e44,0x444850,0x32363c],
  coalRock:[0x1c1c20,0x242428,0x16161a],
  palm:[0x4c7832,0x58863a,0x426c2c,0x649042],
  palmOld:[0x7e7838,0x8c8240],
  palmtrunk:[0x8a7a62,0x7e705a,0x94846c],
  coconutNut:[0x6c7a36,0x867238,0x5e6e30]
 };

 /* ==================== species roster (verified by check_botany.py) ==================== */
 const SPECIES=DROWN.SPECIES=[
  {key:'verdigrismangrove',name:'Teal-Sap Prop-Wood (Rhizophora pycnandroides)',
   how:'4.5-11.5 m multi-stemmed ultramafic salt-tree on braided elastoplastic stilt/prop-roots (BIO.flareJoin) that flex through 15 m bores and bleed vivid teal-blue 18-24% nickel latex from storm scars.',
   items:['dl_mangrove_fol','dl_tealsap_scar'],gather:'nickel-bio-ash',
   tags:ET('tropical','wet','yes',['Am','Cfa'],'propwood',{ultramafic:true,nickel:'hyper'})},
  {key:'tealcoppice',name:'Blue-Bleed Skerry Scrub (Pycnandra thalassia)',
   how:'0.8-2.8 m wind-sheared resprouting ultramafic shrub with turquoise-veined leaves and bright teal nickel-latex cut-rings on coppiced stumps.',
   items:['dl_coppice_fol','dl_coppice_ring'],gather:'nickel-bio-ash',
   tags:ET('tropical','wet','both',['Am','Cfa'],'propwood',{ultramafic:true,nickel:'hyper'})},
  {key:'brucitestack',name:'Intertidal Brucite-Aragonite Chimney',
   how:'0.8-6.5 m fluted chalk-white and pale-celadon Lost-City carbonate/brucite hydrothermal vents steaming at low libration water along pH 10.5-11.7 serpentinite detachment faults.',
   items:['dl_brucite_spire','dl_brucite_collar'],gather:'alkali-sinter',
   tags:KT('tropical','wet','yes',['Am'],'bruciteflat',{ph:[10.5,11.8],partner:'alkaliphile chemolithotroph'})},
  {key:'spongecoral',name:'Ochre-Turquoise Shoal Bioherm (Spongocorallum aestuarium)',
   how:'0.20-0.95 m wave-streamlined hemispherical siliceous-calcareous cushions and brain-plates mottled ochre, verdigris-turquoise, and plum that seal watertight at low tide.',
   items:['dl_sponge_cushion','dl_coral_brain'],gather:'sponge-felt',
   tags:KT('tropical','wet','yes',['Am','Cfa'],'boulderbar',{silica:true})},
  {key:'tidefan',name:'Flexible Gorgonian Shoal-Fan (Subergorgia elastica)',
   how:'0.5-1.8 m perforated saffron-ochre and sea-violet lattice fans that fold flat against rock pavements during tsunami backwash.',
   items:['dl_tidefan'],
   tags:KT('tropical','wet','yes',['Am','Cfa'],'kelpchannel',{elastic:true})},
  {key:'shoalkelp',name:'Tethered Buoy-Kelp (Macrocystis ancoratum)',
   how:'3.0-14.0 m golden-olive submarine fronds buoyed by gas pneumatocysts, anchored strictly to submerged rock at bedY <= -0.5 m.',
   items:['dl_kelp_blade','dl_kelp_stipe','dl_kelp_float'],crop:'kelp',
   tags:ET('tropical','wet','yes',['Am','Cfa'],'kelpchannel',{submarine:true})},
  {key:'ribbonseagrass',name:'Shoal Eel-Meadow (Enhalus lata)',
   how:'0.6-1.9 m emerald strap-meadows carpeting < 12 m sunlit carbonate/olivine sand flats and brackish lagoons.',
   items:['dl_seagrass'],crop:'eelgrass',
   tags:ET('tropical','wet','yes',['Am','Cfa'],'kelpchannel',{submarine:true})},
  {key:'snaggrove',name:'Salt-Petrified Drowned Tsunami Snag',
   how:'6.0-22.0 m bleach-white mineralized cedar/cypress tsunami ghost trunks in subsided coal-measure lagoons, sleeved strictly below <= +1.8 m high-water line in visor-oysters and sponges.',
   items:['dl_oyster_collar','dl_snag_kelp'],
   tags:ET('tropical','wet','yes',['Am','Cfa'],'snaglagoon',{sedimentary:true})},
  {key:'limeshelf',name:'Alkaliphile Brucite-Rim Shelf',
   how:'White carbonate-crusted fungoid brackets colonizing pH 10.5-11.7 brucite sinter rims.',
   items:['dl_limeshelf'],
   tags:KT('tropical','wet','yes',['Am'],'bruciteflat',{kin:'arch.limeshelf',ph:[9.5,11.8]})},
  {key:'seepcomb',name:'Hydrogen-Eating Seep Comb',
   how:'Cream hydrogen-oxidizing mineral-organic combs fringing warm H2-rich serpentinization fault seeps.',
   items:['dl_seepcomb'],
   tags:KT('tropical','wet','yes',['Am'],'bruciteflat',{kin:'arch.seepcomb',ph:[9.0,11.6]})},
  {key:'stormwrack',name:'Tsunami Crimson Storm-Wrack',
   how:'Stranded crimson seaweed ribbons and salt-bleached tsunami drift logs lining boulder-bars and snag booms.',
   items:['dl_wrack','dl_driftlog'],gather:'storm-wrack',
   tags:KT('tropical','wet','both',['Am','Cfa'],'boulderbar',{kin:'crook.stormwrack'})},
  {key:'coconut',name:'Drift-Sown Coconut Palm (Cocos nucifera)',
   how:'6.5-14.5 m leaning ringed monocot strand palm sprouting from sea-dispersed drift nuts on sheltered leeward skerry strand pockets, sedimentary lagoon levee benches and above-scour horst shoulders (pH 5.0-8.8, strictly outside caustic brucite pools).',
   items:['dl_palmtrunk','dl_palm','dl_coconut_nut'],crop:'coconut',
   tags:ET('tropical','wet','both',['Am','Cfa'],'boulderbar',{strand:true,ph:[5.0,8.8]})},
  {key:'araucaria',name:'Refuge-Crown Candelabra Araucaria (Araucaria rulei)',
   how:'8.0-20.0 m straight-boled ultramafic conifer with upturned scale-leaf candelabra arms standing strictly above the +48 m megatsunami trimline on high laterite skerry crowns.',
   items:['dl_arch_scale'],woodyRefuge:true,
   tags:ET('tropical','wet','no',['Am','Cfa'],'refugeskerry',{kin:'arch.araucaria',ultramafic:true})},
  {key:'pycnandra',name:'Refuge Seve-Bleue Tree (Pycnandra acuminata)',
   how:'3.5-8.0 m glossy-leaved nickel-hyperaccumulating refuge tree in >= +48 m red-laterite hollows.',
   items:['dl_pycn_fol'],gather:'nickel-bio-ash',woodyRefuge:true,
   tags:ET('tropical','wet','both',['Am'],'refugeskerry',{kin:'arch.pycnandra',ultramafic:true,nickel:'hyper'})},
  {key:'gymnostoma',name:'Laterite Maquis She-Oak (Gymnostoma deplancheanum)',
   how:'1.5-5.0 m nitrogen-fixing ultramafic shrub enriching storm-safe >= +48 m laterite cuirasse crowns.',
   items:['dl_gymno_fol'],
   tags:ET('tropical','wet','no',['Am','Cfa'],'refugeskerry',{kin:'arch.gymnostoma',ultramafic:true})},
  {key:'verdigris',name:'Nickel-Crust Verdigris Cap',
   how:'0.35-1.5 m turquoise-crusted fungoid dome growing on high-nickel ultramafic laterite.',
   items:['dl_verdigris_cap','dl_verdigris_stalk'],gather:'nickel-bio-ash',
   tags:KT('tropical','wet','no',['Am'],'refugeskerry',{kin:'arch.verdigris',ultramafic:true,nickel:'hyper'})},
  {key:'refugekauri',name:'Refuge-Crown Maquis Kauri (Agathis ovata)',
   how:'7.5-17.5 m stout columnar ultramafic conifer strictly above the +48 m megatsunami trimline on high laterite skerry crowns, weeping golden kauri-gum stalactites.',
   items:['dl_kauri_fol','dl_kauri_gum'],woodyRefuge:true,
   tags:ET('tropical','wet','no',['Am','Cfa'],'refugeskerry',{ultramafic:true})},
  {key:'skerrypaperbark',name:'Skerry Niaouli Paperbark (Melaleuca quinquenervia)',
   how:'3.8-8.5 m twisted cream-barked tree on wet skerry benches and lagoon shoulders shedding thick waterproof sheets of papery caulking bark.',
   items:['dl_paperbark_fol'],
   tags:ET('tropical','wet','both',['Am','Cfa'],'boulderbar',{strand:true})},
  {key:'skerryphyllanthus',name:'Jade-Phloem Nickel Shrub (Phyllanthus balgooyi)',
   how:'1.2-3.0 m multi-stemmed ultramafic hyperaccumulator shrub with vivid emerald nickel-bearing phloem on garnierite skerries.',
   items:['dl_phyllanthus_fol'],gather:'nickel-bio-ash',
   tags:ET('tropical','wet','no',['Am','Cfa'],'propwood',{ultramafic:true,nickel:'hyper'})},
  {key:'skerrysedge',name:'Laterite Tussock-Sedge (Costularia stagnalis)',
   how:'0.5-1.3 m stiff ochre-olive silica sedge tussocks binding wet ultramafic benches and skerry crowns.',
   items:['dl_skerrysedge'],
   tags:ET('tropical','wet','both',['Am','Cfa'],'refugeskerry',{ultramafic:true})},
  {key:'skerrypitcher',name:'Laterite Seep Pitcher-Vine (Nepenthes vieillardii)',
   how:'0.35-0.95 m crimson-olive insectivorous pitchers on nitrogen-poor freshwater ultramafic seeps outside caustic brucite pools.',
   items:['dl_pitcher_rosette','dl_pitcher_cup'],
   tags:ET('tropical','wet','yes',['Am'],'refugeskerry',{ultramafic:true})},
  {key:'skerrycasuarina',name:'Leeward Strand Ironwood (Casuarina equisetifolia)',
   how:'5.5-12.5 m drooping grey-green needle-clad shelterbelt tree fixing nitrogen along sheltered skerry strand berms.',
   items:['dl_casuarina_fol','dl_casuarina_drape'],
   tags:ET('tropical','wet','no',['Am','Cfa'],'boulderbar',{strand:true})},
  {key:'skerrypandan',name:'Prop-Rooted Skerry Screwpine (Pandanus tectorius)',
   how:'3.2-7.2 m stilt-rooted coastal screwpine crowned with spiral keeled strap rosettes and orange fruit keys.',
   items:['dl_pandan_fol','dl_pandan_fruit'],crop:'pandan',
   tags:ET('tropical','wet','both',['Am','Cfa'],'boulderbar',{strand:true})},
  {key:'skerryhibiscus',name:'Tide-Margin Sea-Hibiscus (Hibiscus tiliaceus)',
   how:'2.4-5.2 m scrambling bast-cordage thicket tree with broad heart leaves and yellow cup blooms on sheltered lagoon levees.',
   items:['dl_hibiscus_fol','dl_hibiscus_bloom'],
   tags:ET('tropical','wet','both',['Am','Cfa'],'boulderbar',{strand:true})},
  {key:'skerrynaupaka',name:'Strand Salt-Naupaka (Scaevola taccada)',
   how:'0.8-2.0 m fleshy bright-green rounded strand cushion shrub above high-libration swash.',
   items:['dl_naupaka_fol'],
   tags:ET('tropical','wet','no',['Am','Cfa'],'boulderbar',{strand:true})},
  {key:'greymangrove',name:'Pneumatophore Grey-Mangrove (Avicennia marina)',
   how:'3.0-7.5 m silvery-olive intertidal mangrove ringed by carpets of erect pencil pneumatophores in sheltered lagoons and shoal margins.',
   items:['dl_avicennia_fol','dl_pneumatophore'],
   tags:ET('tropical','wet','yes',['Am','Cfa'],'snaglagoon',{tidal:true})},
  {key:'byssusmussel',name:'Golden Sea-Byssus Fan-Mussel (Pinna pectinata)',
   how:'0.5-1.2 m upright bronze-violet triangular shell anchored in subtidal sand/shell guts by gleaming golden sea-silk byssus beards.',
   items:['dl_byssus_shell','dl_byssus_beard'],gather:'sea-byssus',
   tags:ET('tropical','wet','yes',['Am','Cfa'],'kelpchannel',{submarine:true})},
  {key:'skerryoyster',name:'Libration Visor Rock-Oyster (Saccostrea librata)',
   how:'Cemented rose-chalk oyster and barnacle cushions banding intertidal shoal ledges (-0.8 to +1.75 m).',
   items:['dl_rock_oyster'],
   tags:ET('tropical','wet','yes',['Am','Cfa'],'boulderbar',{tidal:true})},
  {key:'halimedaturf',name:'Calcifying Coin-Alga Turf (Halimeda opuntia)',
   how:'0.25-0.75 m emerald-jade segmented calcareous green shoal-alga carpeting sunlit shallow shoals and shedding white aragonite sand.',
   items:['dl_halimeda'],
   tags:ET('tropical','wet','yes',['Am','Cfa'],'kelpchannel',{submarine:true})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 DROWN.HARVEST={
  verdigrismangrove:HV('timber (worm-proof ship-knees), fuel',[],true,'Worm-proof boat knees; coppiced limbs burned by cFlit-qBon into 18-24% nickel bio-ore ash for Paktong smelting.'),
  tealcoppice:HV('fuel',[],false,'Harvested on 3-year coppice rotation and calcined with local coal into rich green nickel-oxide bio-ore ash.'),
  brucitestack:HV('none',[],true,'Natural pH-11 pool water used by Ark-Wards to saponify whale-oil soap and degrease Paktong castings; soft brucite chalk reagent.'),
  spongecoral:HV('none',[],true,'Elastic hull-caulking sponge and calcined lime-silica flux reagent.'),
  tidefan:HV('weaving',[],false,'Tough horny axial skeletons dried for rot-proof fish-trap screens and basket ribs.'),
  shoalkelp:HV('none',['kelp blade'],true,'Burned for potash-iodine ash reagent and boiled with alkaline spring water into salt-lathering marine soap.'),
  ribbonseagrass:HV('thatch, weaving',['seagrass nut'],false,'Rot-resistant salt-hay insulation and woven catamaran deck-mats.'),
  snaggrove:HV('timber (borer-proof iron-hard keel wood)',['visor oyster'],false,'Winched up by cFlit-qBon divers as rock-hard, borer-proof keel and rudder-post timber.'),
  limeshelf:HV('none',[],false,'Calcined into pure slaked lime mortar and flux reagent.'),
  seepcomb:HV('none',[],false,'Prospector indicator marking H2-bearing serpentinization fault seeps.'),
  stormwrack:HV('timber (seasoned driftwood)',['dried wrack sheet'],false,'Tsunami-seasoned Crookshore drift logs salvaged at harvest booms; crimson wrack boiled for agar sizing.'),
  coconut:HV('timber (monocot posts), thatch, coir, cordage',['coconuts'],false,'Drift-sown along sheltered leeward beaches and lagoon levees; yields potable coconut water on brackish skerries, plaited frond thatch, and rot-proof coir mooring warps.'),
  araucaria:HV('timber (straight mastwood), resin',[],false,'Storm-safe refuge crown spar timber strictly above +48 m megatsunami trimline.'),
  pycnandra:HV('none',[],false,'Tapped and calcined for 25% nickel bio-ore latex.'),
  gymnostoma:HV('fuel (dense, hot)',[],false,'Hot-burning ironwood fuel; Frankia root nodules enrich laterite.'),
  verdigris:HV('none',[],false,'Calcined into 15% nickel bio-ore ash.'),
  refugekauri:HV('timber (spars), gum, pitch',[],false,'Storm-safe >= +48 m refuge spar wood; golden kauri gum boiled into waterproof Ark-Ward hull pitch and varnish.'),
  skerrypaperbark:HV('bark (waterproof caulking sheets), fuel',[],true,'Thick spongy paperbark stripped in sheets to caulk twin-hull seams; aromatic cajeput leaf oil.'),
  skerryphyllanthus:HV('fuel',[],false,'Coppiced ultramafic hyperaccumulator calcined into 16% nickel-oxide bio-ore ash reagent for Paktong charges.'),
  skerrysedge:HV('thatch, weaving',[],false,'Silica-edged tussock blades bundled for shed thatch and plaited into dry stowage baskets.'),
  skerrypitcher:HV('cordage (vine lashing), water reservoir',['filtered pitcher fluid'],false,'Tough woody stems twisted into rough lashing; unopened pitchers hold emergency rainwater.'),
  skerrycasuarina:HV('fuel (smelter charcoal), timber',[],false,'Dense slow-burning charcoal wood prized for Paktong crucible furnaces; nitrogen-fixing strand roots.'),
  skerrypandan:HV('weaving, thatch, cordage',['cooked pandan key'],false,'Keeled strap leaves cured and plaited into twin-hull lateen sail-mats and mooring fenders.'),
  skerryhibiscus:HV('bast, cordage, knees',[],false,'Retted inner bark yields rot-proof diving-line cordage and net twine; curved limbs frame outrigger floats.'),
  skerrynaupaka:HV('none',[],true,'Salt-succulent leaves crushed as a soothing poultice for alkali-sinter and salt burns.'),
  greymangrove:HV('knees, fuel, tannin',['leached propagule'],false,'Elastoplastic intertidal boat-rib knees and smokehouse fuel; bark yields astringent net preservative.'),
  byssusmussel:HV('spinning (sea-silk byssus)',['adductor meat'],false,'Combed golden holdfast fibres spun into prized iridescent sea-silk cloth; valves burned for shell lime.'),
  skerryoyster:HV('none',['rock oyster'],false,'Harvested at low libration water; shells calcined in shore clamps for hydraulic limewash and flux.'),
  halimedaturf:HV('fertiliser, reagent (lime sand)',[],false,'Calcified segments break down into white aragonite lagoon sand; dredged to sweeten garden beds.')
 };
 SPECIES.forEach(S=>{
  S.tags.harvest=DROWN.HARVEST[S.key];
  if(S.gather)S.tags.role='gather:'+S.gather;
 });
 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 DROWN.byKey=byKey;
 DROWN.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 DROWN.plantOfItem=DROWN.speciesOfItem;

 /* core/hamlet gather contract ({pasture, fish, salt}) */
 DROWN.GATHER={
  pasture:{kelpchannel:0,bruciteflat:0,propwood:0.06,boulderbar:0.04,snaglagoon:0.18,refugeskerry:0.32},
  fish:{kelpchannel:0.96,bruciteflat:0.55,propwood:0.84,boulderbar:0.78,snaglagoon:0.88,refugeskerry:0}
 };
 DROWN.gatherOf=function(Z){
  const G=DROWN.GATHER;
  let p=0,f=0;
  for(const k in G.pasture)p+=(Z[k]==null?0:Z[k])*G.pasture[k];
  for(const k in G.fish)f+=(Z[k]==null?0:Z[k])*G.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:Boolean((Z.bruciteflat||0)>0.4||(Z.boulderbar||0)>0.5)};
 };
 DROWN.zonesAt=function(x,z){
  const eco=physSampleAt(x,z);
  const out={kelpchannel:0,bruciteflat:0,propwood:0,boulderbar:0,snaglagoon:0,refugeskerry:0};
  out[eco.zone]=1;
  return out;
 };
 DROWN.gather=function(x,z){return DROWN.gatherOf(DROWN.zonesAt(x,z));};

 /* ==================== procedural fallback maps & PBR library material table ==================== */
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=clamp(202+(H(seed,i%w,(i/w)|0,0x71)-0.5)*50,0,255);
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;
   d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });

 const cardFallback=(seed)=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(215,232,212,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.065+0.045*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.5,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[185,205,182]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L0=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('drownlands',slot):null;
  const tx=L0?KMAT.textures(L0,{aniso:6}):{map:fb,normalMap:null,roughnessMap:null};
  if(L0&&L0.scale&&tx.map){
   const rx=1/Math.max(0.25,L0.scale[0]),ry=1/Math.max(0.25,L0.scale[1]);
   tx.map.repeat.set(rx,ry);
   if(tx.normalMap)tx.normalMap.repeat.set(rx,ry);
   if(tx.roughnessMap)tx.roughnessMap.repeat.set(rx,ry);
  }
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.80:opt.roughness,
   metalness:opt.metalness==null?0.04:opt.metalness,
   emissive:opt.emissive==null?0x000000:opt.emissive,
   emissiveIntensity:opt.emissiveIntensity==null?0:opt.emissiveIntensity,
   vertexColors:opt.vertexColors!==false,
   side:opt.side||T3.DoubleSide
  });
  if(L0&&L0.scale)m.userData.libScale=L0.scale;
  return m;
 }

 const M=DROWN.M={
  bark:pbrMat('bark',11,{roughness:0.86,side:T3.FrontSide}),
  tealsap:pbrMat('tealsap',12,{roughness:0.28,metalness:0.12,emissive:0x0a5652,emissiveIntensity:0.28}),
  brucite:pbrMat('brucite',13,{roughness:0.68,metalness:0.04}),
  snag:pbrMat('snag',14,{roughness:0.84,side:T3.FrontSide}),
  oyster:pbrMat('oyster',15,{roughness:0.78,metalness:0.04}),
  sponge:pbrMat('sponge',16,{roughness:0.76,metalness:0.03}),
  coral:pbrMat('coral',17,{roughness:0.74,metalness:0.04}),
  serpRock:pbrMat('serpRock',18,{roughness:0.56,metalness:0.10}),
  jadeRock:pbrMat('jadeRock',19,{roughness:0.28,metalness:0.12}),
  basaltRock:pbrMat('basaltRock',20,{roughness:0.72,metalness:0.06}),
  coalRock:pbrMat('coalRock',21,{roughness:0.46,metalness:0.14}),
  bronze:pbrMat('bronze',22,{roughness:0.38,metalness:0.62,vertexColors:false,color:0x7eb8a2}),
  brick:pbrMat('brick',23,{roughness:0.86,metalness:0.02,vertexColors:false,color:0xc87458}),
  rope:pbrMat('rope',24,{roughness:0.88,metalness:0.0,vertexColors:false,color:0xb89e74}),
  archBark:pbrMat('archBark',25,{roughness:0.86,side:T3.FrontSide}),
  archScale:pbrMat('archScale',26,{roughness:0.78,side:T3.FrontSide}),
  mangroveLeaf:BIO.leafMat(cardFallback(31),'dl-mangrove',{aN:true,swayW:'0.75',swayA:0.06}),
  coppiceLeaf:BIO.leafMat(cardFallback(32),'dl-coppice',{aN:true,swayW:'0.85',swayA:0.07}),
  kelpBlade:BIO.leafMat(cardFallback(33),'dl-kelp',{aN:false,swayW:'(position.y)',swayA:0.22}),
  seagrassBlade:BIO.leafMat(cardFallback(34),'dl-seagrass',{aN:false,swayW:'(position.y)',swayA:0.16}),
  fanCard:BIO.leafMat(cardFallback(35),'dl-fan',{aN:false,swayW:'(position.y)',swayA:0.14}),
  wrackCard:BIO.leafMat(cardFallback(36),'dl-wrack',{aN:false,swayW:'0.35',swayA:0.03}),
  palmFrond:BIO.leafMat((function(){
   const t=BIO.alphaTex(512,(g,S)=>{
    g.lineCap='round';
    const nPairs=38;
    for(let i=1;i<=nPairs;i++){
     const u=i/(nPairs+1),ry=S*(0.05+0.88*u);
     const env=Math.sin(Math.pow(u,0.68)*Math.PI)*(1-0.12*u),pLen=S*0.40*env;
     if(pLen<4)continue;
     for(const side of [-1,1]){
      const sweep=0.34+0.26*u,ang=side*(Math.PI*0.5-sweep)+(H(0x5d1095,i,side+2,95)-0.5)*0.05;
      const mx=S*0.5+Math.cos(ang)*pLen*0.56,my=ry+Math.sin(Math.abs(sweep))*pLen*0.42;
      const tx=clamp(S*0.5+Math.cos(ang)*pLen,0.04*S,0.96*S),ty=clamp(ry+Math.sin(Math.abs(sweep))*pLen*0.88,0.04*S,0.96*S);
      const hw=S*0.0078*(0.6+0.5*env),lum=Math.round(168+64*env+22*(H(0x5d1095,i,side+5,95)-0.5));
      g.fillStyle='rgb('+Math.round(lum*0.92)+','+Math.min(255,Math.round(lum*1.05))+','+Math.round(lum*0.74)+')';
      g.beginPath();g.moveTo(S*0.5,ry-hw);g.quadraticCurveTo(mx,my-hw*0.7,tx,ty);g.quadraticCurveTo(mx,my+hw*0.9,S*0.5,ry+hw);g.closePath();g.fill();
     }
    }
    g.strokeStyle='rgba(168,176,112,0.96)';g.lineWidth=S*0.012;
    g.beginPath();g.moveTo(S*0.5,S*0.03);g.lineTo(S*0.5,S*0.94);g.stroke();
   },[154,182,112]);
   t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;
   return t;
  })(),'dl-palmfrond',{aN:false,swayW:'(position.x)',swayA:0.085,alphaTest:0.36})
 };
 DROWN.SWAP=BIO.libSwap('drownlands',M);

 /* Merged structural bark/wood buckets (for BIO.flareJoin + BIO.tube) */
 BIO.bucket('dl_mangrove_wood',M.bark,{label:'Teal-sap prop-wood trunks and braided stilt-roots'});
 BIO.bucket('dl_snag_wood',M.snag,{label:'Bleach-white salt-petrified tsunami cedar and cypress snags'});
 BIO.bucket('dl_arch_wood',M.archBark,{label:'Refuge-crown candelabra araucaria and seve-bleue trunks'});
 BIO.bucket('dl_arch_bough',M.archScale,{label:'Candelabra araucaria upturned scale-leaf arms'});

 /* ==================== custom fluted brucite chimney & rock boulder geometries ==================== */
 function makeBruciteSpireGeo(seed){
  const seg=14,rings=9,pos=[],nor=[],uv=[],col=[],idx=[];
  for(let r=0;r<=rings;r++){
   const t=r/rings;
   const over=t<=0.86?(t/0.86):(1-(t-0.86)/0.14*0.24);
   const radBase=t<=0.86?(0.48*(1-0.54*Math.pow(t/0.86,0.92))+0.06*Math.sin(t*9.0)):lerp(0.22,0.08,(t-0.86)/0.14);
   for(let s=0;s<=seg;s++){
    const u=s/seg,ang=u*TAU;
    const flute=t<=0.88?0.065*Math.cos(ang*8+t*2.2)*(1-0.35*t):0;
    const ledge=t<=0.82?0.035*Math.max(0,Math.cos(t*TAU*3.5+Math.sin(ang*3))):0;
    const rr0=Math.max(0.05,radBase+flute+ledge);
    pos.push(Math.cos(ang)*rr0,over,Math.sin(ang)*rr0);
    const nx=t<=0.86?Math.cos(ang):-Math.cos(ang)*0.5,nz=t<=0.86?Math.sin(ang):-Math.sin(ang)*0.5,ny=t>0.82?0.75:0.18;
    const nl=Math.hypot(nx,ny,nz)||1;
    nor.push(nx/nl,ny/nl,nz/nl);
    uv.push(u*2.4,t*2.6);
    /* Pale turquoise-celadon wet base grading to chalk-white subaerial brucite-aragonite crown */
    const cr=lerp(0.76,0.98,t),cg=lerp(0.92,0.99,t),cb=lerp(0.91,0.97,t);
    col.push(cr,cg,cb);
   }
  }
  for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){
   const a=r*(seg+1)+s,b=a+seg+1;
   idx.push(a,b,a+1,a+1,b,b+1);
  }
  const g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
 }

 function makeRockGeo(seed,flatY,angular){
  const g=new T3.IcosahedronGeometry(1,angular?1:2),p=g.attributes.position,J={},c=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.74+0.42*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
   const sh=0.80+0.20*clamp((y+1)*0.5,0,1);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 function makeLogGeo(){
  const g=new T3.CylinderGeometry(0.14,0.19,1.0,8,2,false);
  g.rotateZ(Math.PI*0.5);
  g.translate(0,0.12,0);
  const p=g.attributes.position,c=[];
  for(let i=0;i<p.count;i++){const sh=0.78+0.22*clamp(p.getY(i)/0.26,0,1);c.push(sh,sh*0.98,sh*0.95);}
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  return g;
 }

 const BRUCITE_SPIRE_GEO=makeBruciteSpireGeo(57101);
 const DRIFT_LOG_GEO=makeLogGeo();

 /* ==================== single-line BIO.def declarations (strict check_cells.py compliance) ==================== */
 BIO.def('dl_mangrove_fol',BIO.geo.clump(),M.mangroveLeaf,{attrs:['aN'],label:'Teal-Sap Prop-Wood sclerophyll crown'});
 BIO.def('dl_pycn_fol',BIO.geo.clump(),M.mangroveLeaf,{attrs:['aN'],label:'Refuge Seve-Bleue glossy crown'});
 BIO.def('dl_coppice_fol',BIO.geo.clump(),M.coppiceLeaf,{attrs:['aN'],label:'Blue-Bleed Skerry Scrub foliage'});
 BIO.def('dl_gymno_fol',BIO.geo.clump(),M.coppiceLeaf,{attrs:['aN'],label:'Laterite Maquis She-Oak crown'});
 BIO.def('dl_kelp_blade',BIO.geo.ribbon(4),M.kelpBlade,{label:'Tethered Buoy-Kelp submarine frond'});
 BIO.def('dl_snag_kelp',BIO.geo.ribbon(3),M.kelpBlade,{label:'Intertidal snag kelp curtain'});
 BIO.def('dl_seagrass',BIO.geo.ribbon(3),M.seagrassBlade,{label:'Shoal Eel-Meadow strap-blade'});
 BIO.def('dl_tidefan',BIO.geo.frond(2),M.fanCard,{label:'Flexible Gorgonian Shoal-Fan'});
 BIO.def('dl_wrack',BIO.geo.clump(),M.wrackCard,{label:'Tsunami Crimson Storm-Wrack'});

 /* Solid mineral, sponge-coral, teal-latex scar, oyster sleeve & boulder defs */
 BIO.def('dl_tealsap_scar',BIO.fung.stalk({r0:0.11,r1:0.06,seg:6,rings:4,bend:0.18,ribs:5,ribA:0.16}),M.tealsap,{label:'Weeping 22% nickel teal-latex bark scar'});
 BIO.def('dl_coppice_ring',BIO.fung.cap({form:'disc',h:0.12,seg:9,rings:2,lump:0.18,under:'none',uv:'planar',seed:57102}),M.tealsap,{label:'Coppiced teal-blue nickel-latex stump ring'});
 BIO.def('dl_brucite_spire',BRUCITE_SPIRE_GEO,M.brucite,{cls:'feature',kind:'chimney',label:'Intertidal Brucite-Aragonite Chimney (pH 11.4)'});
 BIO.def('dl_brucite_collar',BIO.fung.crust({lobes:8,lobeA:0.24,seg:16,rings:3,seed:57103}),M.brucite,{cls:'feature',kind:'sinter',label:'Brucite-aragonite sinter apron collar'});
 BIO.def('dl_limeshelf',BIO.fung.bracket({arc:Math.PI*0.95,seg:9,thick:0.26,droop:0.09,wav:5,wavA:0.07,seed:57104}),M.brucite,{label:'Alkaliphile Brucite-Rim Shelf'});
 BIO.def('dl_seepcomb',BIO.fung.comb({w:1.0,d:0.42,tilt:0.28,lobes:4,seg:7}),M.brucite,{label:'Hydrogen-Eating Seep Comb'});
 BIO.def('dl_sponge_cushion',BIO.fung.cap({form:'dome',h:0.52,seg:13,rings:4,ribs:12,lump:0.28,wav:6,wavA:0.06,under:'pores',seed:57105}),M.sponge,{label:'Ochre-Turquoise Shoal Bioherm cushion'});
 BIO.def('dl_coral_brain',BIO.fung.cap({form:'dome',h:0.48,seg:14,rings:4,ribs:16,lump:0.24,wav:8,wavA:0.05,under:'pores',seed:57106}),M.coral,{label:'Meandroid Shoal Brain-Plate'});
 BIO.def('dl_kelp_stipe',BIO.fung.stalk({r0:0.035,r1:0.022,seg:5,rings:5,bend:0.18}),M.bark,{label:'Tethered Buoy-Kelp holdfast stipe'});
 BIO.def('dl_kelp_float',BIO.fung.bladder({swell:0.72,neck:0.24,h:1.1,pleats:6,pleatA:0.06,seg:8,rings:4,seed:57107}),M.sponge,{label:'Buoy-Kelp gas pneumatocyst'});
 BIO.def('dl_oyster_collar',BIO.fung.tube({n:6,r:0.18,hMin:0.52,spread:0.34,seg:8,rimK:1.28,inK:0.38,seed:57108}),M.oyster,{label:'Cemented Visor-Oyster and Barnacle Collar (<= +1.8 m)'});
 BIO.def('dl_driftlog',DRIFT_LOG_GEO,M.snag,{cls:'feature',kind:'driftwood',label:'Tsunami-Seasoned Crookshore Driftwood Log'});
 BIO.def('dl_arch_scale',BIO.fung.stalk({r0:0.11,r1:0.075,seg:6,rings:5,bend:0.34}),M.archScale,{label:'Candelabra Araucaria scale-leaf arm'});
 BIO.def('dl_verdigris_cap',BIO.fung.cap({form:'dome',h:0.44,seg:12,rings:3,lump:0.24,wav:6,wavA:0.05,under:'gills',seed:57109}),M.tealsap,{label:'Nickel-Crust Verdigris Cap'});
 BIO.def('dl_verdigris_stalk',BIO.fung.stalk({r0:0.15,r1:0.10,seg:7,rings:3}),M.brucite,{label:'Verdigris Cap stalk'});

 /* Geological boulders & resource nodes (serpentinite, nephrite jade = 200, basalt, coal = 214) */
 BIO.def('dl_rock_serp',makeRockGeo(57201,0.62,true),M.serpRock,{cls:'feature',kind:'boulder',label:'Slickensided Serpentinite Megaboulder'});
 BIO.def('dl_rock_jade',makeRockGeo(57202,0.68,false),M.jadeRock,{cls:'feature',kind:'gather',label:'Sea-Tumbled Emerald Nephrite Jade Boulder (jade = 200)',tags:{role:'gather:jade'}});
 BIO.def('dl_rock_basalt',makeRockGeo(57203,0.74,true),M.basaltRock,{cls:'feature',kind:'boulder',label:'Ophiolite Pillow-Basalt Block'});
 BIO.def('dl_rock_coal',makeRockGeo(57204,0.52,true),M.coalRock,{cls:'feature',kind:'gather',label:'Bituminous Coal-Measure Seam Block (coal = 214)',tags:{role:'gather:coal'}});

 /* ==================== procedural multi-part builders (BIO.flareJoin + BIO.owner LOD lock) ==================== */

 /* 1. Teal-Sap Prop-Wood (verdigrismangrove): 4.5-11.5 m multi-stemmed crown on arched braided stilt-roots + weeping teal latex */
 DROWN.growMangrove=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(5.2+5.8*H(seed,1,0,0x401))*sc;
  const propTopY=Math.max(y+1.45*sc,0.85+1.15*H(seed,2,0,0x401));
  const crownBaseY=propTopY+H0*0.24;
  const rHub=0.18*sc*(0.88+0.26*H(seed,3,0,0x401));
  const barkCol=PAL.mangroveBark[seed%PAL.mangroveBark.length];
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   /* Central trunk rising from prop-root hub into 3-4 spreading boughs */
   const hubPts=[
    {x:x,y:Math.max(y-0.35,propTopY-1.6),z:z,r:rHub*0.72},
    {x:x+0.12*(H(seed,4,0,0x401)-0.5),y:propTopY,z:z+0.12*(H(seed,5,0,0x401)-0.5),r:rHub},
    {x:x+0.22*(H(seed,6,0,0x401)-0.5),y:crownBaseY,z:z+0.22*(H(seed,7,0,0x401)-0.5),r:rHub*0.78}
   ];
   tris+=BIO.tube('dl_mangrove_wood',hubPts,barkCol,{seg:7});

   /* 5-7 arched, braided elastoplastic stilt/prop-roots (BIO.flareJoin) gripping ultramafic rock */
   const nProps=5+(seed%3);
   for(let k=0;k<nProps;k++){
    const az=(k/nProps)*TAU+0.38*(H(seed,10+k,1,0x402)-0.5);
    const span=(1.55+1.35*H(seed,10+k,2,0x402))*sc;
    const rx=x+Math.cos(az)*span,rz=z+Math.sin(az)*span;
    const footY=Math.min(y+0.35,BIO.host.terrainH(rx,rz))-0.35;
    const archX=lerp(x,rx,0.52),archZ=lerp(z,rz,0.52),archY=lerp(propTopY,footY,0.34)+0.42*sc;
    const pr0=rHub*0.44;
    const pPts=BIO.flareJoin([
     {x:hubPts[1].x,y:propTopY,z:hubPts[1].z,r:pr0},
     {x:archX,y:archY,z:archZ,r:pr0*0.78},
     {x:rx,y:footY,z:rz,r:pr0*0.56}
    ],{parentR:rHub,k:1.55,sink:0.55,len:1.8});
    tris+=BIO.tube('dl_mangrove_wood',pPts,barkCol,{seg:6});
   }

   /* Vivid teal-blue 18-24.5% Ni latex storm-check scars on main stem & upper prop-root shoulder */
   const scarAz=H(seed,30,1,0x403)*TAU;
   BIO.put('dl_tealsap_scar',[hubPts[1].x+Math.cos(scarAz)*rHub*0.72,propTopY+0.15*sc,hubPts[1].z+Math.sin(scarAz)*rHub*0.72],
    qEuler(0.18,scarAz,0.12),[sc*0.85,sc*0.95,sc*0.85],PAL.tealsap[seed%PAL.tealsap.length]);

   /* 4 spreading crown limbs + sclerophyll leaf pads directly attached to limb tips */
   const nLimb=4;
   for(let b=0;b<nLimb;b++){
    const az=(b/nLimb)*TAU+0.55*H(seed,40+b,1,0x404);
    const span=H0*(0.26+0.12*H(seed,40+b,2,0x404));
    const topY=crownBaseY+H0*(0.42+0.16*H(seed,40+b,3,0x404));
    const mx=lerp(hubPts[2].x,x+Math.cos(az)*span,0.52),mz=lerp(hubPts[2].z,z+Math.sin(az)*span,0.52),my=lerp(crownBaseY,topY,0.56);
    const ex=x+Math.cos(az)*span,ez=z+Math.sin(az)*span;
    const br0=rHub*0.46;
    const lPts=BIO.flareJoin([
     {x:hubPts[2].x,y:crownBaseY,z:hubPts[2].z,r:br0},
     {x:mx,y:my,z:mz,r:br0*0.68},
     {x:ex,y:topY,z:ez,r:br0*0.38}
    ],{parentR:rHub*0.78,k:1.55,sink:0.6,len:1.9});
    tris+=BIO.tube('dl_mangrove_wood',lPts,barkCol,{seg:5});

    const padS=clamp(H0*0.34,1.6,3.8);
    const lCol=PAL.mangroveLeaf[(seed+b)%PAL.mangroveLeaf.length];
    BIO.put('dl_mangrove_fol',[ex,topY,ez],qEuler(0,az,0),[padS,padS*0.62,padS],lCol,{n:[Math.cos(az)*0.3,0.92,Math.sin(az)*0.3]});
    if(b%2===0){
     BIO.put('dl_mangrove_fol',[mx,my,mz],qEuler(0,az+1.4,0),[padS*0.76,padS*0.54,padS*0.76],PAL.mangroveLeaf[(seed+b+1)%PAL.mangroveLeaf.length],{n:[0,1,0]});
    }
   }
   const apexY=crownBaseY+H0*0.52,apexS=clamp(H0*0.36,1.8,4.0);
   const apexPts=BIO.flareJoin([
    {x:hubPts[2].x,y:crownBaseY,z:hubPts[2].z,r:rHub*0.42},
    {x:x,y:apexY,z:z,r:rHub*0.22}
   ],{parentR:rHub*0.78,k:1.4,sink:0.5,len:1.6});
   tris+=BIO.tube('dl_mangrove_wood',apexPts,barkCol,{seg:5});
   BIO.put('dl_mangrove_fol',[x,apexY,z],qEuler(0,H(seed,55,1,0x404)*TAU,0),[apexS,apexS*0.58,apexS],PAL.mangroveLeaf[seed%PAL.mangroveLeaf.length],{n:[0,1,0]});
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris,H:H0};
 };

 /* 2. Salt-Petrified Drowned Tsunami Snag (snaggrove): 6.0-22.0 m bleach-white cedar/cypress ghost trunk + <= +1.8 m oyster collar */
 DROWN.growSnag=function(x,y,z,seed,collarTopM,scale){
  const sc=scale==null?1:scale;
  const H0=(6.8+14.2*H(seed,1,0,0x411))*sc;
  const r0=Math.max(0.18,H0*0.032*(0.85+0.32*H(seed,2,0,0x411)));
  const woodCol=PAL.snagWood[seed%PAL.snagWood.length];
  const leanX=0.04*(H(seed,3,0,0x411)-0.5),leanZ=0.04*(H(seed,4,0,0x411)-0.5);
  /* Enforce strict high-water oyster/sponge collar ceiling <= +1.8 m (PLAN.md section 7.3 invariant 4) */
  const maxCollarTop=clamp(collarTopM==null?1.45:collarTopM,0.55,1.80);
  let tris=0,collarPlacedTop=y;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=7,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const tx=x+leanX*H0*t*t+0.02*H0*Math.sin(t*3.6+seed);
    const tz=z+leanZ*H0*t*t+0.02*H0*Math.cos(t*3.2+seed);
    const ty=y-0.55+(H0+0.55)*t;
    const flare=1+0.78*Math.pow(Math.max(0,1-t/0.18),2);
    const rad=Math.max(0.055,r0*(1-0.78*Math.pow(t,0.86))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube('dl_snag_wood',trunk,woodCol,{seg:8});

   /* 4 flared drowned cedar/cypress root buttresses (BIO.flareJoin) */
   for(let k=0;k<4;k++){
    const az=(k/4)*TAU+0.42*H(seed,10+k,1,0x412);
    const rSpan=r0*(2.2+0.9*H(seed,10+k,2,0x412));
    const bPts=BIO.flareJoin([
     {x:x+Math.cos(az)*r0*0.42,y:y+r0*1.4,z:z+Math.sin(az)*r0*0.42,r:r0*0.44},
     {x:x+Math.cos(az)*rSpan*0.65,y:y+r0*0.25,z:z+Math.sin(az)*rSpan*0.65,r:r0*0.28},
     {x:x+Math.cos(az)*rSpan,y:y-0.55,z:z+Math.sin(az)*rSpan,r:r0*0.15}
    ],{parentR:r0,k:1.5,sink:0.55,len:1.8});
    tris+=BIO.tube('dl_snag_wood',bPts,woodCol,{seg:6});
   }

   /* 3-5 stripped bleach-white stag-horn limbs high in the air (zero green tree crown!) */
   const nStag=3+(seed%3);
   for(let b=0;b<nStag;b++){
    const f=0.48+0.44*(b/Math.max(1,nStag-1));
    const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
    const bx=lerp(trunk[idx].x,trunk[idx+1].x,tf),by=lerp(trunk[idx].y,trunk[idx+1].y,tf),bz=lerp(trunk[idx].z,trunk[idx+1].z,tf);
    const pR=lerp(trunk[idx].r,trunk[idx+1].r,tf);
    const az=(b/nStag)*TAU+0.8*H(seed,20+b,1,0x413);
    const span=H0*(0.12+0.11*H(seed,20+b,2,0x413));
    const rise=span*(0.35+0.45*H(seed,20+b,3,0x413));
    const sPts=BIO.flareJoin([
     {x:bx,y:by,z:bz,r:pR*0.52},
     {x:bx+Math.cos(az)*span*0.55,y:by+rise*0.42,z:bz+Math.sin(az)*span*0.55,r:pR*0.34},
     {x:bx+Math.cos(az)*span,y:by+rise,z:bz+Math.sin(az)*span,r:pR*0.14}
    ],{parentR:pR,k:1.55,sink:0.6,len:1.9});
    tris+=BIO.tube('dl_snag_wood',sPts,woodCol,{seg:5});
   }

   /* Intertidal visor-oyster / barnacle collar & kelp skirt strictly capped at <= +1.80 m */
   if(y<maxCollarTop-0.22){
    const baseY=Math.max(y-0.12,-2.6);
    const availH=Math.max(0.24,Math.min(2.2,maxCollarTop-baseY));
    const cScaleY=availH;
    const cRad=r0*2.15;
    BIO.put('dl_oyster_collar',[x,baseY,z],qEuler(0,H(seed,35,1,0x414)*TAU,0),[cRad,cScaleY,cRad],PAL.oyster[seed%PAL.oyster.length]);
    collarPlacedTop=+(baseY+cScaleY).toFixed(3);
    /* Intertidal barnacle-zone kelp/wrack skirt hanging below collarTop */
    if(baseY<0.15){
     const kY=Math.min(0.05,collarPlacedTop-0.35);
     const kLen=clamp(kY-Math.max(y,-2.2),0.45,1.65);
     for(let k=0;k<2;k++){
      const ka=k*Math.PI+H(seed,40+k,1,0x414)*TAU;
      BIO.put('dl_snag_kelp',[x+Math.cos(ka)*r0*0.95,Math.max(y,kY-kLen),z+Math.sin(ka)*r0*0.95],qEuler(0,ka,0),[0.55,kLen,0.55],PAL.kelp[(seed+k)%PAL.kelp.length]);
     }
    }
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris,H:H0,collarTopM:collarPlacedTop};
 };

 /* 3. Refuge-Crown Candelabra Araucaria (araucaria, kin of arch.araucaria): strictly >= +48 m on Station 4 skerry! */
 DROWN.growAraucaria=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(9.5+9.8*H(seed,1,0,0x421))*sc;
  const r0=Math.max(0.16,H0*0.024*(0.88+0.24*H(seed,2,0,0x421)));
  const barkCol=PAL.archBark[seed%PAL.archBark.length];
  const scaleCol=PAL.archScale[seed%PAL.archScale.length];
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=7,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    trunk.push({x:x+0.015*H0*Math.sin(t*2.8+seed),y:y-0.4+(H0+0.4)*t,z:z+0.015*H0*Math.cos(t*2.5+seed),r:Math.max(0.06,r0*(1-0.68*t))});
   }
   tris+=BIO.tube('dl_arch_wood',trunk,barkCol,{seg:7});
   const tiers=4+(seed%3);
   for(let ti=0;ti<tiers;ti++){
    const f=0.46+0.48*(ti/Math.max(1,tiers-1));
    const by=y+H0*f,pR=r0*(1-0.65*f);
    const nArm=ti===tiers-1?3:4;
    const span=(1.15-0.45*(ti/tiers))*H0*0.18;
    for(let a=0;a<nArm;a++){
     const az=(a/nArm)*TAU+ti*0.9+0.35*H(seed,ti*6+a,1,0x422);
     const mx=x+Math.cos(az)*span*0.58,mz=z+Math.sin(az)*span*0.58,my=by+span*0.08;
     const ex=x+Math.cos(az)*span,ez=z+Math.sin(az)*span,ey=by+span*0.48;
     const armPts=BIO.flareJoin([
      {x:x,y:by,z:z,r:Math.max(0.055,pR*0.58)},
      {x:mx,y:my,z:mz,r:Math.max(0.05,pR*0.48)},
      {x:ex,y:ey,z:ez,r:Math.max(0.045,pR*0.42)}
     ],{parentR:pR,k:1.5,sink:0.55,len:1.8});
     tris+=BIO.tube('dl_arch_bough',armPts,scaleCol,{seg:5});
     BIO.put('dl_arch_scale',[ex,ey-0.05,ez],qEuler(0,az,-0.18),[1.35,0.95+0.4*H(seed,ti*6+a,2,0x422),1.35],scaleCol);
    }
   }
   BIO.put('dl_arch_scale',[x,y+H0*0.94,z],qEuler(0,H(seed,50,1,0x422)*TAU,0),[1.6,1.45,1.6],scaleCol);
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris,H:H0};
 };

 /* 4. Refuge Seve-Bleue Tree (pycnandra, >= +48 m on Station 4 skerry) */
 DROWN.growPycnandra=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(4.0+3.6*H(seed,1,0,0x431))*sc;
  const r0=0.14*sc;
  const barkCol=PAL.archBark[(seed+1)%PAL.archBark.length];
  let tris=0;
  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const pts=[{x,y:y-0.3,z,r:r0},{x:x+0.12,y:y+H0*0.52,z:z-0.08,r:r0*0.65},{x,y:y+H0*0.82,z,r:r0*0.35}];
   tris+=BIO.tube('dl_arch_wood',pts,barkCol,{seg:6});
   BIO.put('dl_tealsap_scar',[x+r0*0.6,y+H0*0.32,z],qEuler(0.1,seed%6,0),[0.65*sc,0.7*sc,0.65*sc],PAL.tealsap[seed%PAL.tealsap.length]);
   const padS=H0*0.48;
   BIO.put('dl_pycn_fol',[x,y+H0*0.82,z],qEuler(0,H(seed,2,0,0x431)*TAU,0),[padS,padS*0.72,padS],PAL.mangroveLeaf[seed%PAL.mangroveLeaf.length],{n:[0,1,0]});
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris,H:H0};
 };

 /* 5. Drift-Sown Coconut Palm (coconut, sheltered leeward strand pockets & lagoon levees, pH 5.0-8.8) */
 function makePalmSegGeo(){
  const seg=8,rings=5,pos=[],nor=[],uv=[],col=[],idx=[];
  for(let r=0;r<=rings;r++){
   const t=r/rings,yy=-0.5+t,taper=lerp(0.54,0.46,t),rib=1+0.065*Math.cos(t*TAU*5),rad=taper*rib;
   const sh=0.82+0.14*t+0.05*Math.cos(t*TAU*5);
   for(let s=0;s<=seg;s++){
    const u=s/seg,ang=u*TAU;
    pos.push(Math.cos(ang)*rad,yy,Math.sin(ang)*rad);
    nor.push(Math.cos(ang),0.06,Math.sin(ang));
    uv.push(u*1.6,t*1.8);
    col.push(sh,sh*0.98,sh*0.94);
   }
  }
  for(let r=0;r<rings;r++)for(let s=0;s<seg;s++){
   const a=r*(seg+1)+s,b=a+seg+1;
   idx.push(a,b,a+1,a+1,b,b+1);
  }
  const g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
 }
 function makeDroopFrondGeo(nSeg,arch,droop,halfW,vFold){
  const pos=[],nor=[],uv=[],L0=[],C0=[],R0=[];
  for(let i=0;i<=nSeg;i++){
   const t=i/nSeg,x=t*(1-0.14*t*t),y=arch*Math.sin(t*1.95)-droop*t*t*t;
   const env=Math.sin(Math.pow(t,0.62)*Math.PI*0.96)*(0.88+0.12*(1-t)),w=halfW*(0.08+0.92*env),vf=vFold*env;
   L0.push([x,y-vf,-w,0,t]);C0.push([x,y,0,0.5,t]);R0.push([x,y-vf,w,1,t]);
  }
  for(let i=0;i<nSeg;i++){
   [[L0[i],C0[i],L0[i+1],C0[i+1],-0.28],[C0[i],R0[i],C0[i+1],R0[i+1],0.28]].forEach(s=>{
    const a=s[0],b=s[1],c=s[2],d=s[3],nz=s[4],nl=Math.hypot(0.15,0.94,nz);
    [a,b,c,b,d,c].forEach(q=>{pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);nor.push(0.15/nl,0.94/nl,nz/nl);});
   });
  }
  const g=BIO.geo._make(pos,nor,uv);
  g.userData.card={base:'top',kind:'frond'};
  return g;
 }
 function makeCoconutClusterGeo(){
  const pos=[],nor=[],uv=[],col=[],idx=[],offs=[[0.14,-0.10,0],[-0.12,-0.12,0.09],[0.02,-0.14,-0.13],[0,-0.24,0.02]];
  offs.forEach(o=>{
   const s=new T3.IcosahedronGeometry(0.13,1),p=s.attributes.position,n=s.attributes.normal,u=s.attributes.uv,b=pos.length/3;
   for(let i=0;i<p.count;i++){
    pos.push(p.getX(i)+o[0],p.getY(i)*1.22+o[1],p.getZ(i)+o[2]);
    nor.push(n.getX(i),n.getY(i),n.getZ(i));
    uv.push(u?u.getX(i):0.5,u?u.getY(i):0.5);
    const sh=0.76+0.24*clamp(p.getY(i)/0.13*0.5+0.5,0,1);
    col.push(sh,sh,sh*0.92);
   }
   if(s.index){const ix=s.index.array;for(let i=0;i<ix.length;i++)idx.push(b+ix[i]);}
   else for(let i=0;i<p.count;i++)idx.push(b+i);
  });
  const g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
  g.setIndex(idx);
  return g;
 }
 const DL_PALM_FROND_GEO=makeDroopFrondGeo(5,0.34,0.42,0.28,0.075);
 BIO.def('dl_palmtrunk',makePalmSegGeo(),M.archBark,{label:'Drift-Sown Coconut Palm (ringed trunk)'});
 BIO.def('dl_palm',DL_PALM_FROND_GEO,M.palmFrond,{label:'Drift-Sown Coconut Palm (drooping pinnate frond)'});
 BIO.def('dl_coconut_nut',makeCoconutClusterGeo(),M.sponge,{label:'Drift-Sown Coconut Palm (nut cluster)'});

 const recTree=(key,x,y,z,r,h)=>{const S=byKey[key];if(S&&BIO.record)BIO.record({name:S.name,key:S.key,kind:'tree',x,y,z,r,h,tags:S.tags});};
 DROWN.recTree=recTree;

 DROWN.growCoconut=function(x,y,z,H0,yaw,lean,tSeed,lv){
  const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
  const r0=clamp(0.22+H0*0.006,0.22,0.34);
  const dx=-Math.cos(yaw)*Math.sin(lean)*H0,dz=Math.sin(yaw)*Math.sin(lean)*H0;
  const baseY=y-0.26,ty=y+H0*Math.cos(lean)*0.97,tx=x+dx,tz=z+dz;
  /* Register in KTAGS strictly before drawing */
  recTree('coconut',x,y,z,Math.max(3.6,Math.hypot(dx,dz)+2.0),H0+2.4);
  const trunkCol=C(PAL.palmtrunk[(tSeed>>>0)%PAL.palmtrunk.length]);
  const rSeg=[r0*1.08,r0*0.88,r0*0.73];
  const pts=[];
  for(let i=0;i<=3;i++){
   const t=i/3,ht=Math.pow(t,0.78);
   pts.push([x+dx*ht,baseY+(ty+0.04-baseY)*t,z+dz*ht]);
  }
  BIO.tree(x,z,()=>{
   for(let i=0;i<3;i++){
    const a=pts[i],b=pts[i+1];
    const ex=i>0?[a[0]-(b[0]-a[0])*0.05,a[1]-(b[1]-a[1])*0.05,a[2]-(b[2]-a[2])*0.05]:a;
    BIO.beam('dl_palmtrunk',ex,b,rSeg[i],rSeg[i],trunkCol);
   }
   const nutS=0.95+0.25*h(1,2);
   BIO.put('dl_coconut_nut',[tx,ty-0.10,tz],qEuler(0,yaw+1.1,0),[nutS,nutS,nutS],C(PAL.coconutNut[(tSeed>>>0)%PAL.coconutNut.length]));
   const nF=lv!=null&&lv<1?9:13,gold=2.399963,fLen=clamp(2.5+H0*0.11,2.8,4.3);
   for(let k=0;k<nF;k++){
    const age=k/(nF-1),az=yaw+k*gold+0.16*(h(k+3,1)-0.5);
    const pitch=lerp(0.78,-0.32,Math.pow(age,0.88))+0.08*(h(k+3,2)-0.5);
    const Lf=fLen*(age<0.2?0.82:age>0.82?0.88:1)*(0.92+0.16*h(k+3,3));
    const cHex=age>0.80?PAL.palmOld[k%PAL.palmOld.length]:PAL.palm[(k+(tSeed>>>0))%PAL.palm.length];
    BIO.put('dl_palm',[tx,ty+0.04-0.14*age,tz],qEuler((h(k+3,4)-0.5)*0.14,-az,pitch),[Lf,Lf*0.95,Lf*1.08],C(cHex));
   }
  },{range:580});
  return{H:H0};
 };

 /* ==================== 13-species diversity pass: refuge kauri, skerry/strand shrubs, grey mangrove & shoal bivalves/algae ==================== */
 M.broadCard=BIO.leafMat(cardFallback(41),'dl-broad',{aN:true,swayW:'0.75',swayA:0.06});
 M.needleCard=BIO.leafMat(cardFallback(42),'dl-needle',{aN:false,swayW:'(-position.y)',swayA:0.09});
 M.bloomCard=BIO.leafMat(cardFallback(43),'dl-bloom',{aN:false,swayW:'0.65',swayA:0.06});
 M.strapCard=BIO.leafMat(cardFallback(44),'dl-strap',{aN:false,swayW:'(position.y)',swayA:0.08});

 BIO.def('dl_kauri_fol',BIO.geo.clump(),M.broadCard,{attrs:['aN'],label:'Refuge-Crown Maquis Kauri foliage'});
 BIO.def('dl_kauri_gum',BIO.fung.stalk({r0:0.09,r1:0.03,seg:6,rings:3,bend:0.12}),M.sponge,{label:'Golden Kauri-Gum resin stalactite'});
 BIO.def('dl_paperbark_fol',BIO.geo.clump(),M.broadCard,{attrs:['aN'],label:'Skerry Niaouli Paperbark crown'});
 BIO.def('dl_phyllanthus_fol',BIO.geo.clump(),M.coppiceLeaf,{attrs:['aN'],label:'Jade-Phloem Nickel Shrub spray'});
 BIO.def('dl_skerrysedge',BIO.geo.clump(),M.strapCard,{label:'Laterite Tussock-Sedge clump'});
 BIO.def('dl_pitcher_rosette',BIO.geo.mat(0.85,0.28),M.strapCard,{label:'Laterite Seep Pitcher-Vine rosette'});
 BIO.def('dl_pitcher_cup',BIO.fung.bladder({swell:0.68,neck:0.32,h:0.42,pleats:5,pleatA:0.05,seg:7,rings:3,seed:57121}),M.sponge,{label:'Nepenthes insectivorous pitcher'});
 BIO.def('dl_casuarina_fol',BIO.geo.clump(),M.needleCard,{label:'Leeward Strand Ironwood crown'});
 BIO.def('dl_casuarina_drape',BIO.geo.hang(4,0.34,0.22),M.needleCard,{label:'Leeward Strand Ironwood drooping needles'});
 BIO.def('dl_pandan_fol',BIO.geo.clump(),M.strapCard,{label:'Prop-Rooted Skerry Screwpine strap rosette'});
 BIO.def('dl_pandan_fruit',BIO.fung.cap({form:'dome',h:0.38,seg:8,rings:3,lump:0.22,under:'none',uv:'planar',seed:57122}),M.sponge,{label:'Pandanus compound fruit key'});
 BIO.def('dl_hibiscus_fol',BIO.geo.clump(),M.broadCard,{attrs:['aN'],label:'Tide-Margin Sea-Hibiscus heart leaves'});
 BIO.def('dl_hibiscus_bloom',BIO.geo.clump(),M.bloomCard,{label:'Tide-Margin Sea-Hibiscus yellow cup flowers'});
 BIO.def('dl_naupaka_fol',BIO.geo.clump(),M.broadCard,{attrs:['aN'],label:'Strand Salt-Naupaka fleshy shrub'});
 BIO.def('dl_avicennia_fol',BIO.geo.clump(),M.coppiceLeaf,{attrs:['aN'],label:'Pneumatophore Grey-Mangrove crown'});
 BIO.def('dl_pneumatophore',BIO.fung.stalk({r0:0.032,r1:0.014,seg:5,rings:3,bend:0.06}),M.bark,{label:'Avicennia erect pencil pneumatophore'});
 BIO.def('dl_byssus_shell',BIO.fung.stalk({r0:0.045,r1:0.19,seg:6,rings:4,bend:0.08,ribs:7,ribA:0.12}),M.oyster,{label:'Golden Sea-Byssus Fan-Mussel valve'});
 BIO.def('dl_byssus_beard',BIO.fung.cap({form:'disc',h:0.14,seg:8,rings:2,lump:0.26,under:'none',uv:'planar',seed:57123}),M.sponge,{label:'Golden sea-silk byssus anchor beard'});
 BIO.def('dl_rock_oyster',BIO.fung.crust({lobes:6,lobeA:0.22,seg:10,rings:2,seed:57124}),M.oyster,{label:'Libration Visor Rock-Oyster reef cushion'});
 BIO.def('dl_halimeda',BIO.geo.clump(),M.seagrassBlade,{label:'Calcifying Coin-Alga Turf'});

 DROWN.growRefugeKauri=function(x,y,z,tSeed,scale){
  const sc=scale==null?1:scale;
  const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
  const H0=(8.5+7.5*h(1,1))*sc,r0=0.26*sc;
  recTree('refugekauri',x,y,z,3.6*sc,H0+2.0);
  const barkCol=PAL.archBark[(tSeed>>>0)%PAL.archBark.length];
  const leafCol=C(0x365c3a);
  BIO.tree(x,z,()=>{
   const bole=[];
   for(let i=0;i<=4;i++){
    const t=i/4;
    bole.push({x:x+0.08*(h(i+2,1)-0.5),y:y-0.35+(H0+0.35)*t,z:z+0.08*(h(i+2,2)-0.5),r:Math.max(0.08,r0*(1-0.46*t))});
   }
   BIO.tube('dl_arch_wood',bole,barkCol,{seg:7});
   for(let b=0;b<4;b++){
    const az=(b/4)*TAU+0.4*h(b+8,1),span=H0*(0.18+0.07*h(b+8,2));
    const sy=y+H0*(0.62+0.07*b),ey=sy+H0*0.16;
    const ex=x+Math.cos(az)*span,ez=z+Math.sin(az)*span;
    BIO.tube('dl_arch_wood',[{x:x,y:sy,z:z,r:r0*0.42},{x:ex,y:ey,z:ez,r:0.05}],barkCol,{seg:5});
    const cSz=(1.45+0.45*h(b+8,3))*sc;
    BIO.put('dl_kauri_fol',[ex,ey,ez],qEuler(0,az,0),[cSz,cSz*0.76,cSz],leafCol,{n:[0,1,0]});
    if(b%2===0)BIO.put('dl_kauri_gum',[x+Math.cos(az)*r0*0.8,sy-0.18,z+Math.sin(az)*r0*0.8],qEuler(Math.PI,az,0),[0.55*sc,0.55*sc,0.55*sc],C(0xdca02c));
   }
   BIO.put('dl_kauri_fol',[bole[4].x,bole[4].y,bole[4].z],qEuler(0,h(20,1)*TAU,0),[1.85*sc,1.35*sc,1.85*sc],leafCol,{n:[0,1,0]});
  },{range:580});
  return{H:H0};
 };

 DROWN.growStrandWoody=function(kind,x,y,z,tSeed,scale){
  const sc=scale==null?1:scale;
  const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
  const isCas=kind==='skerrycasuarina',isPap=kind==='skerrypaperbark',isPan=kind==='skerrypandan',isHib=kind==='skerryhibiscus',isNaup=kind==='skerrynaupaka';
  const H0=(isCas?6.2+5.2*h(1,1):isPap?4.2+3.6*h(1,1):isPan?3.4+3.0*h(1,1):isHib?2.5+2.2*h(1,1):isNaup?0.9+0.9*h(1,1):1.3+1.4*h(1,1))*sc;
  recTree(kind,x,y,z,(isCas||isPap?2.6:1.6)*sc,H0+1.2);
  const stemCol=C(isPap?0xd8d2c4:0x7c6e5c);
  const folItem=isCas?'dl_casuarina_fol':isPap?'dl_paperbark_fol':isPan?'dl_pandan_fol':isHib?'dl_hibiscus_fol':isNaup?'dl_naupaka_fol':'dl_phyllanthus_fol';
  const leafCol=C(isCas?0x506c4c:isPap?0x627e60:isPan?0x4c8038:isHib?0x4a883a:isNaup?0x5a9c48:0x387448);
  const nStems=isCas||isPap?3:(isNaup?2:3);
  BIO.tree(x,z,()=>{
   if(isPan){
    for(let p=0;p<3;p++){
     const pa=(p/3)*TAU+0.3*h(p+2,1);
     BIO.beam('dl_palmtrunk',[x,y+H0*0.28,z],[x+Math.cos(pa)*0.55*sc,y-0.18,z+Math.sin(pa)*0.55*sc],0.055*sc,0.04*sc,stemCol);
    }
   }
   for(let s=0;s<nStems;s++){
    const az=(s/nStems)*TAU+0.4*(h(s+5,1)-0.5);
    const sp=(isCas||isPap?0.55+0.55*h(s+5,2):0.35+0.45*h(s+5,2))*sc;
    const tx=x+Math.cos(az)*sp,tz=z+Math.sin(az)*sp,ty=y+H0*(0.78+0.22*(s/nStems));
    BIO.beam('dl_palmtrunk',[x,y-0.16,z],[tx,ty,tz],(isCas||isPap?0.12:0.065)*sc,0.035*sc,stemCol);
    const sz=(isCas||isPap?1.45+0.55*h(s+5,3):isNaup?0.78+0.32*h(s+5,3):1.05+0.45*h(s+5,3))*sc;
    BIO.put(folItem,[tx,ty-0.04,tz],qEuler(0,h(s+5,4)*TAU,0),[sz,sz*0.80,sz],leafCol,isCas||isPan?undefined:{n:[0,1,0]});
    if(isCas)BIO.put('dl_casuarina_drape',[tx,ty-0.02,tz],qEuler(0,az,0),[sz*0.52,sz*0.92,sz*0.52],leafCol);
    if(isPan&&s===0)BIO.put('dl_pandan_fruit',[tx,ty-0.14,tz],qEuler(0,az,0),[0.34*sc,0.38*sc,0.34*sc],C(0xdc7224));
    if(isHib)BIO.put('dl_hibiscus_bloom',[tx,ty-0.02,tz],qEuler(0,az+1.0,0),[sz*0.52,sz*0.44,sz*0.52],C(0xf0cc32));
   }
  },{range:520});
  return{H:H0};
 };

 DROWN.growGreyMangrove=function(x,y,z,tSeed,scale){
  const sc=scale==null?1:scale;
  const h=(i,k)=>KRAND.unit(KRAND.hash(tSeed>>>0,i|0,k|0));
  const H0=(3.4+3.6*h(1,1))*sc,r0=0.14*sc;
  recTree('greymangrove',x,y,z,2.6*sc,H0+1.2);
  const barkCol=PAL.mangroveBark[(tSeed>>>0)%PAL.mangroveBark.length];
  const leafCol=C(0x5c765a);
  BIO.tree(x,z,()=>{
   for(let b=0;b<3;b++){
    const az=(b/3)*TAU+0.45*(h(b+2,1)-0.5),span=(0.65+0.55*h(b+2,2))*sc;
    const tx=x+Math.cos(az)*span,tz=z+Math.sin(az)*span,ty=y+H0*(0.76+0.20*h(b+2,3));
    BIO.tube('dl_mangrove_wood',[{x:x,y:y-0.25,z:z,r:r0},{x:tx,y:ty,z:tz,r:0.045}],barkCol,{seg:6});
    const sz=(1.35+0.45*h(b+2,4))*sc;
    BIO.put('dl_avicennia_fol',[tx,ty-0.04,tz],qEuler(0,az,0),[sz,sz*0.74,sz],leafCol,{n:[0,1,0]});
   }
   for(let p=0;p<6;p++){
    const pa=(p/6)*TAU+0.3*h(p+9,1),pr=(0.85+1.15*h(p+9,2))*sc;
    const px=x+Math.cos(pa)*pr,pz=z+Math.sin(pa)*pr,py=BIO.host.terrainH(px,pz);
    BIO.put('dl_pneumatophore',[px,py-0.05,pz],qEuler(0,pa,0),[1.0,0.32+0.26*h(p+9,3),1.0],C(barkCol));
   }
  },{range:520});
  return{H:H0};
 };
})();
