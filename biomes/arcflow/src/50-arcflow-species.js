// ================================================================= ARCFLOW — 25 species, library materials, Earth flora & 5 Carnelian clades ([draw])
// Registers BIO.kit('arcflow') -> ARCFLOW: 25 native species spanning the Serpentine Crazy-Quilt Frontier (PLAN.md section 5.1):
//   Earth Foredeep, Valgekivi Klint, Musta-Neva Fen, Helme-Koski River, Vanguard & Auger-Oasis Flora (20 species, biosphere: 'earth'):
//     1. nevabirch              (11-21 m chalk-white lichened silver-birch; bark.birch.lichen + card.birch.silver)
//     2. klintspruce            (18-32 m narrow spire gorge conifer; bark.spruce + card.spruce)
//     3. mustaalder             (9-17 m water-loving humic bog-iron black alder; bark.alder.lichen + card.broadleaf)
//     4. klintlinden            (14-25 m domed kukersite-talus honey-linden; bark.madrone + card.lobed)
//     5. klintrowan             (5.5-11.5 m Valgekivi limestone klint lip berry tree; bark.cherry + card.starberry)
//     6. tremblingaspen         (12-22 m Auger-oasis rim & koski pioneer tree; bark.birch.b + card.aspen)
//     7. goatwillow             (5.0-10.5 m koski & neva flood-margin weeping treelet; bark.bark_willow_02 + card.weeper)
//     8. klintjuniper           (1.3-3.8 m dry Valgekivi limestone alvar shrub; bark.juniper + card.juniper)
//     9. sweetgale              (0.65-1.65 m aromatic Musta-Neva bog-myrtle shrub; card.dwarfbirch)
//    10. cloudberryfen          (0.25-0.75 m russet-emerald Sphagnum & amber cloudberry hummock; card.moss)
//    11. augerclover            (0.15-0.42 m nitrogen-fixing pioneer inside 45 m ecof_soil_auger dolomite oasis; card.crop.clover)
//    12. fencottongrass         (0.35-0.75 m Musta-Neva white-plumed bog tussock; card.cottongrass)
//    13. bleachfireweed         (0.65-1.55 m pioneer herb on neutralized vanguard soil along Bleach-Swath & seep margins; card.fireweed)
//    14. nevasundew             (0.14-0.34 m Musta-Neva Sphagnum insectivorous rosette; card.sundew.great)
//    15. bogcranberry           (0.15-0.36 m peat-string ruby berry mat on neva & klint; card.bulbheath)
//    16. koskireed              (1.35-2.65 m emergent Helme-Koski river & skerry-channel reedbed; card.reed)
//    17. serpentinespleenwort   (0.20-0.48 m edaphic boundary crevice fern at Mg/Ca ~ 5.0-7.8, <= 8.0; card.frond.needle)
//    18. klinthepatica          (0.14-0.30 m shaded klintlinden calcareous mull wildflower; card.flower.bluebell)
//    19. spraycliffpolypody     (0.32-0.76 m klint & koski waterfall mist lithophytic fern; card.fern.green)
//    20. kulanewawoad           (0.55-1.18 m Valgekivi calcareous meadow Kaarum dye herb; card.crop.woad)
//   Pre-Terraforming Carnelian Erythrophyll Clades (5 species, biosphere: 'carnelian', Mg/Ca > 8 serpentinite & pH 11.5 seeps):
//    21. carnelian_organpipe    (3.0-10.5 m clustered fluted silica-chitin chimneys via KFRONTIER.growOrganPipe)
//    22. erythra_veil           (1.4-4.2 m perforated vermilion-scarlet solar lattice-fan via KFRONTIER.growErythraVeil)
//    23. bladder_tether         (2.2-7.8 m buoyant 0.75 g translucent ruby gas-bladders via KFRONTIER.growBladderTether)
//    24. agate_window           (0.20-1.05 m armoured crimson rosette with chalcedony skylights via KFRONTIER.putAgateWindow)
//    25. blood_strangler        (0.45-3.2 m reactive arterial-red chitin-web along Bleach-Swath, Auger rim & seep margins)
BIO.kit('arcflow');
var ARCFLOW={
 PHYS:ARCFLOW_PHYS,
 SITES:ARCFLOW_SITES,
 CROPS:ARCFLOW_CROPS,
 FAUNA:ARCFLOW_FAUNA,
 PLACED:[],
 CROWNS:[]
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 ARCFLOW.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false,biosphere:'earth'
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true,biosphere:'carnelian'},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood==null?'none':wood,edible:edible||[],medicinal:!!medicinal,notes:notes==null?'':notes,fruit:fruit==null?'':fruit});

 const PAL=ARCFLOW.PAL={
  birch:[0x52803a,0x629046,0x467432,0x849e46],
  birchGold:[0xc49a38,0xd4aa42,0xb28830],
  spruce:[0x244a34,0x2e563e,0x1f402d,0x366044],
  alder:[0x345e34,0x3f6b3e,0x2c522c],
  linden:[0x467438,0x548244,0x3c6630],
  rowan:[0xc86238,0xb87838,0x74883a,0xd85230],
  aspen:[0x5c8c3e,0x749c44,0xc8a23c,0x4e7c36],
  willow:[0x628a58,0x729866,0x547c4c],
  juniper:[0x2b543c,0x366248,0x244834],
  sweetgale:[0x4c6e3a,0x5c7c44,0x6a7838],
  clover:[0xc8bcc8,0x88aa68,0xd8ccd8],
  cottongrass:[0xdcdad2,0xe8e6de,0xc8c8bc],
  fireweed:[0xd86ca8,0xe47cb8,0xc45c96],
  sundew:[0xc85842,0xd8684c,0x9e7838],
  cranberry:[0x8c5244,0xa4423c,0x5e743c],
  reed:[0x8a924c,0x9ca058,0x768240],
  spleenwort:[0x3a6c3c,0x487a46,0x2e5c32],
  hepatica:[0x7c92d8,0x8ea4e6,0x6c82c8],
  fern:[0x3b6e34,0x487c40,0x32602c],
  woad:[0xd8be48,0xc4ae3c,0x8ca248],
  sedge:[0x7c8640,0x8e964a,0x6c7838,0x9e8442],
  moss:[0x4e7834,0x5c863e,0x8a5432,0x9e6238],
  cloudberry:[0xe09628,0xeca634,0xd08420],
  serpentinite:[0x2a4638,0x325242,0x223b2e],
  cumulate:[0xb8b6b0,0x3a3c40,0xd6d2c8],
  basalt:[0x3e4248,0x484c52,0x34383e],
  bogore:[0x5a4232,0x684e3a,0x4c382a],
  amber:[0xe29424,0xf0a632,0xcf821c]
 };

 // ---------------------------------------------------------------- 25 species roster (verified by tools/check_botany.py)
 const SPECIES=ARCFLOW.SPECIES=[
  {key:'nevabirch',biosphere:'earth',name:'Kulaneva Silver-Birch (Betula kulanevensis)',
   how:'Graceful 11-21 m chalk-white lichened-bark pioneer broadleaf colonizing Ca/Mg > 1 alluvial levees, fen rims, and the 45 m lime-dosed Auger oasis.',
   items:['af_birch_fol','af_log'],tags:K('temperate','humid','both',['Cfa'],'foredeep',{kin:'nhighlands'})},
  {key:'klintspruce',biosphere:'earth',name:'Klint Gorge Spire-Spruce (Picea klintensis)',
   how:'Narrow 18-32 m dark-emerald spire conifer framing the misty Kulaneva-Klint waterfall gorge and Helme-Koski river terraces.',
   items:['af_spruce_fol'],tags:K('temperate','humid','no',['Cfa'],'klintgorge',{kin:'nhighlands'})},
  {key:'mustaalder',biosphere:'earth',name:'Bog-Iron Black Alder (Alnus ferrifera)',
   how:'Sturdy 9-17 m dark-barked riparian broadleaf with nitrogen-fixing nodules along pH 4.3-6.8 humic Musta-Jogi and Suur-Neva banks.',
   items:['af_alder_fol','af_sedge'],tags:K('temperate','humid','yes',['Cfa'],'humicfen')},
  {key:'klintlinden',biosphere:'earth',name:'Escarpment Honey-Linden (Tilia baltica)',
   how:'Broad 14-25 m domed broadleaf canopy thriving on mineral-rich Valgekivi kukersite oil-shale and glauconitic marl talus below the Klint.',
   items:['af_linden_fol'],tags:K('temperate','humid','no',['Cfa'],'klintgorge')},
  {key:'klintrowan',biosphere:'earth',name:'Valgekivi Cliff-Rowan (Sorbus valgekivensis)',
   how:'Slender 5.5-11.5 m smooth-barked Valgekivi limestone klint-lip tree bearing heavy scarlet starberry clusters above waterfall spray.',
   items:['af_rowan_fol'],tags:K('temperate','humid','no',['Cfa'],'klintgorge')},
  {key:'tremblingaspen',biosphere:'earth',name:'Kulaneva Trembling Aspen (Populus tremula kulanevae)',
   how:'Fast-colonizing 12-22 m pale-barked broadleaf ringing Station 5 Auger lime-dosed oasis rims and Helme-Koski gravel terraces.',
   items:['af_aspen_fol'],tags:K('temperate','subhumid','both',['Cfa'],'auger_oasis')},
  {key:'goatwillow',biosphere:'earth',name:'Helme-Koski Goat-Willow (Salix caprea borealis)',
   how:'Supple 5.0-10.5 m multi-limbed weeping flood-margin treelet anchoring Helme-Koski and Musta-Neva high-water banks.',
   items:['af_willow_fol'],tags:K('temperate','humid','yes',['Cfa'],'koskirapids')},
  {key:'klintjuniper',biosphere:'earth',name:'Valgekivi Alvar Juniper (Juniperus communis klintensis)',
   how:'Resinous 1.3-3.8 m gnarled evergreen shrub of dry calcareous Valgekivi klint alvars and limed upland ledges.',
   items:['af_juniper_fol'],tags:K('temperate','subhumid','no',['Cfa'],'foredeep')},
  {key:'sweetgale',biosphere:'earth',name:'Musta-Neva Sweet-Gale (Myrica gale)',
   how:'Aromatic 0.65-1.65 m nitrogen-fixing bog-myrtle shrub bordering acidic Musta-Neva peat channels and penny-ore shoals.',
   items:['af_sweetgale_fol'],tags:K('temperate','humid','yes',['Cfa'],'humicfen',{crop:'bog-myrtle'})},
  {key:'cloudberryfen',biosphere:'earth',name:'Amber-Cloudberry Sphagnum Hummock (Rubus chamaemorus)',
   how:'Cushioned 0.25-0.75 m russet-and-emerald peat moss hummocks studded with golden drupelets, acidifying fen water to leach garnierite nickel.',
   items:['af_moss','af_cloudberry_pod'],tags:K('temperate','humid','yes',['Cfa'],'humicfen',{crop:'cranberry'})},
  {key:'augerclover',biosphere:'earth',name:'Auger-Disc Lime-Clover (Trifolium repens kulanevae)',
   how:'Dedicated 0.15-0.42 m nitrogen-fixing pioneer sward blooming across Station 5 crushed-dolomite 45 m ecof_soil_auger oasis circles.',
   items:['af_clover'],tags:K('temperate','subhumid','no',['Cfa'],'auger_oasis',{crop:'clover'})},
  {key:'fencottongrass',biosphere:'earth',name:'Musta-Neva Hare-Tail Cottongrass (Eriophorum vaginatum)',
   how:'Silky 0.35-0.75 m white-plumed tussock sedge blanketing waterlogged Musta-Neva humic peat flats.',
   items:['af_cottongrass'],tags:K('temperate','humid','yes',['Cfa'],'humicfen')},
  {key:'bleachfireweed',biosphere:'earth',name:'Vanguard Bleach-Fireweed (Chamaenerion angustifolium)',
   how:'Tall 0.65-1.55 m magenta-spiked pioneer herb colonizing neutralized vanguard soil along Auger Bleach-Swath and non-caustic seep margins.',
   items:['af_fireweed_fol'],tags:K('temperate','subhumid','no',['Cfa','Am'],'foredeep')},
  {key:'nevasundew',biosphere:'earth',name:'Musta-Neva Great Sundew (Drosera anglica)',
   how:'Glistening 0.14-0.34 m mucilage-tentacled carnivorous rosette trapping midges across nitrogen-poor Musta-Neva Sphagnum.',
   items:['af_sundew_fol'],tags:K('temperate','humid','yes',['Cfa'],'humicfen')},
  {key:'bogcranberry',biosphere:'earth',name:'Musta-Neva Peat-String Cranberry (Vaccinium oxycoccos)',
   how:'Wiry 0.15-0.36 m evergreen trailing berry mat threading raised Sphagnum strings across Musta-Neva and Klint fens.',
   items:['af_cranberry_fol'],tags:K('temperate','humid','yes',['Cfa'],'humicfen',{crop:'cranberry'})},
  {key:'koskireed',biosphere:'earth',name:'Helme-Koski Channel Common-Reed (Phragmites australis)',
   how:'Stiff 1.35-2.65 m emergent silica-culm reedbed lining Helme-Koski eddy margins, Musta-Jogi skerry channels, and oasis tarns.',
   items:['af_reed_fol'],tags:K('temperate','humid','yes',['Cfa'],'koskirapids')},
  {key:'serpentinespleenwort',biosphere:'earth',name:'Kalju-Selka Serpentine Spleenwort (Asplenium cuneifolium)',
   how:'Leathery 0.20-0.48 m metallophyte crevice fern restricted to edaphic boundary ledges at Mg/Ca 5.0-7.8 (strictly <= 8.0).',
   items:['af_spleenwort_fol'],tags:K('temperate','subhumid','no',['Cfa','Am'],'foredeep')},
  {key:'klinthepatica',biosphere:'earth',name:'Valgekivi Noble-Hepatica (Hepatica nobilis)',
   how:'Shade-loving 0.14-0.30 m cobalt-violet spring wildflower carpeting calcareous mull beneath Escarpment Honey-Linden.',
   items:['af_hepatica_fol'],tags:K('temperate','humid','no',['Cfa'],'klintgorge')},
  {key:'spraycliffpolypody',biosphere:'earth',name:'Koski Waterfall-Mist Polypody (Polypodium vulgare)',
   how:'Lush 0.32-0.76 m lithophytic green fern thriving on mist-drenched Kulaneva-Klint and Helme-Koski cataract ledges.',
   items:['af_fern'],tags:K('temperate','humid','yes',['Cfa','Am'],'klintgorge')},
  {key:'kulanewawoad',biosphere:'earth',name:'Valgekivi Kaarum Dyer-Woad (Isatis tinctoria)',
   how:'Golden-panicled 0.55-1.18 m biennial indigo-dye herb naturalized across sunny calcareous Valgekivi foredeep meadows.',
   items:['af_woad_fol'],tags:K('temperate','subhumid','no',['Cfa'],'foredeep',{crop:'woad'})},
  {key:'carnelian_organpipe',biosphere:'carnelian',name:'Sanguine Flute-Colony (Sanguinitubus ophioliticus)',
   how:'Clustered 3.0-10.5 m fluted crimson-and-ivory silica-chitin chimneys thriving on toxic Mg/Ca > 8, Ni > 2,200 ppm serpentinite skerries and barrens.',
   items:['af_flute_collar','af_bleach_skel'],tags:N('temperate','subhumid','no',['Cfa','Am'],'serpentinite_island')},
  {key:'erythra_veil',biosphere:'carnelian',name:'Pleated Carnelian Lattice-Fan (Erythrophyllum flabellatum)',
   how:'Perforated 1.4-4.2 m vermilion-scarlet chitinous solar-fan sails oriented normal to sun-tracks across zebra-cumulate ribs and pH 11.5 tufa rims.',
   items:['af_veil_lobe'],tags:N('temperate','subhumid','both',['Cfa','Am'],'alkaline_seep')},
  {key:'bladder_tether',biosphere:'carnelian',name:'Pneumatophore Ruby Tether-Vine (Physophora rubra)',
   how:'Buoyant 2.2-7.8 m translucent ruby H2/CH4-filled spheres tethered on sinewy rust-black tendons in 1.55 atm / 0.75 g air.',
   items:['af_ruby_bladder'],tags:N('temperate','humid','both',['Cfa','Am'],'alkaline_seep')},
  {key:'agate_window',biosphere:'carnelian',name:'Chalcedony Window-Dome (Fenestraria carneliana)',
   how:'Armoured 0.20-1.05 m crimson Erythrophyll cushion domes capped by clear biogenic quartz skylight lenses on bare serpentinite whalebacks.',
   items:['af_agate_rosette','af_agate_lens'],tags:N('temperate','subhumid','no',['Cfa','Am'],'serpentinite_island')},
  {key:'blood_strangler',biosphere:'carnelian',name:'Reactive Arterial Chitin-Web (Haematoplexus strangularis)',
   how:'Mycelial 0.45-3.2 m arterial-red calcifying chitin-cables armoring Carnelian seams along Bleach-Swaths, the 45 m Auger rim, and pH 11.5 seep margins.',
   items:['af_strangler_rib'],tags:N('temperate','subhumid','both',['Cfa','Am'],'serpentinite_island')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 ARCFLOW.HARVEST={
  nevabirch:HV('timber, fuel',['birch sap'],true,'Peeling white bark yields Kulanewa tohu-kiri remittance-draft scroll paper and waterproof birch-tar caulk; spring sap tapped for tonic.'),
  klintspruce:HV('timber, resin',[],false,'Straight resonant mast, mill-bridge trestle, and nail-less shingle timber; pitch resin waterproofs lotja barges.'),
  mustaalder:HV('timber, charcoal',[],true,'Rot-proof submerged wharf piling timber, tannin bark for fishnets, and clean low-sulfur charcoal for sampo nickel-steel smelting.'),
  klintlinden:HV('timber, carving',['blossom honey'],true,'Strong inner bast fiber plaited into lotja tow-cordage; fragrant blossoms feed Kulanewa mead-apiaries.'),
  klintrowan:HV('carving, hafting',['rowanberries'],true,'Tough close-grained wood turned into sampo gear-cogs and tool hafts; frost-sweetened scarlet berries brewed into tart winter cordial.','berry'),
  tremblingaspen:HV('timber, carving',[],true,'Light splinter-free timber hollowed into Kulanewa haabjas dugout skiffs and sauna benches; bitter salicin inner bark relieves fever.'),
  goatwillow:HV('wicker, charcoal',[],true,'Supple flood-bank withies woven into raha-maak ore-washing baskets and eel traps; bark tannin cures river-otter pelts.'),
  klintjuniper:HV('carving, fuel',['juniper cones'],true,'Fragrant rot-proof heartwood joined into Kulanewa butter-staves and tankards; resinous cones spice sahti ale and smoke fish.','berry'),
  sweetgale:HV('fuel',['gale catkins'],true,'Aromatic resin-dotted leaves bitter Kulanewa gruit ale, repel bog midges, and yield golden-tan leather dye and tannin.','herb'),
  cloudberryfen:HV('none',['amber cloudberry'],true,'Antiscorbutic golden berry; dry sphagnum moss harvested as antiseptic surgical dressing and cabin chinking.','berry'),
  augerclover:HV('none',['clover blossoms','clover greens'],true,'Symbiotic root nodules fix nitrogen across 45 m ecof_soil_auger dolomite discs; sweet blossoms feed Kulanewa apiaries and stock.','greens'),
  fencottongrass:HV('cordage',[],false,'Silky white seed-plumes spun with flax into warm Kulanewa winter quilt batting, lamp wicks, and tinder.'),
  bleachfireweed:HV('cordage',['young shoots','fermented leaf tea'],true,'Pioneer herb stabilizing neutralized Bleach-Swath vanguard soils; fermented leaves brew Kulaneva tea and stalk bast twists into twine.','herb'),
  nevasundew:HV('none',[],true,'Dewy insectivorous bog rosette digesting midges on nitrogen-poor Sphagnum; mucilage tincture soothes foundry-smoke coughs.','reagent'),
  bogcranberry:HV('none',['bog cranberries'],true,'Tart crimson berries rich in benzoic acid keep under water all winter; prized antiscorbutic ration for lotja barge crews.','berry'),
  koskireed:HV('thatch',['reed rhizomes'],false,'Hollow silica-stiff culms bundle into durable Kulanewa boathouse thatch, windscreens, and loom reeds; starchy rhizomes roast.'),
  serpentinespleenwort:HV('none',[],true,'Obligate serpentine-edge crevice fern at Mg/Ca 5.0-7.8; Kulanewa prospectors read its fronds as an ore tell along garnierite contacts.','reagent'),
  klinthepatica:HV('none',[],true,'Three-lobed evergreen wildflower of shaded calcareous linden-mull talus; traditional Kulanewa herbalists steep mild astringent infusions.'),
  spraycliffpolypody:HV('none',['sweet rhizome'],true,'Creeping licorice-sweet rhizome anchored in waterfall-spray crevices; chewed by lotja rivermen to ease throat irritation.'),
  kulanewawoad:HV('none',[],true,'Fermented rosette leaves yield fast Kaarum-blue indigo dye for Kulanewa syndicate woollens and antiseptic wound-wash.','reagent'),
  carnelian_organpipe:HV('none',[],false,'Calcined nickel-rich silica-chitin tubes ground into refractory crucible grog and nickel bio-ore indicator.','reagent'),
  erythra_veil:HV('none',[],false,'Ashed Erythrophyll fan lattice yields brilliant carnelian-cobalt ceramic glaze pigment and prospecting tell.'),
  bladder_tether:HV('cordage',[],true,'Cured ruby float-bladders serve as waterproof net-buoys and lantern shades; sinewy tendons make bowstrings.'),
  agate_window:HV('none',[],true,'Clear biogenic chalcedony skylight lenses polished into assay loupes; cooling gel salve treats caustic tufa burns.','reagent'),
  blood_strangler:HV('cordage',[],false,'Calcified arterial-red chitin-silica cables harvested along Bleach-Swath and caustic seep seams for acid-proof crucible luting.','reagent')
 };
 SPECIES.forEach(S=>{S.tags.harvest=ARCFLOW.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 ARCFLOW.byKey=byKey;
 ARCFLOW.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 ARCFLOW.plantOfItem=ARCFLOW.speciesOfItem;

 ARCFLOW.GATHER={
  pasture:{foredeep:0.64,klintgorge:0.24,koskirapids:0.30,humicfen:0.18,serpentinite_island:0.0,alkaline_seep:0.0,auger_oasis:0.78},
  fish:{foredeep:0.42,klintgorge:0.86,koskirapids:0.82,humicfen:0.68,serpentinite_island:0.0,alkaline_seep:0.0,auger_oasis:0.12}
 };
 ARCFLOW.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in ARCFLOW.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*ARCFLOW.GATHER.pasture[k];
  for(const k in ARCFLOW.GATHER.fish)f+=(Z[k]==null?0:Z[k])*ARCFLOW.GATHER.fish[k];
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
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('arcflow',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.72:opt.roughness,
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

 // ---------------------------------------------------------------- ARCFLOW.M material table (100% mapped to materials.json)
 const M=ARCFLOW.M={
  'bark.birch':BIO.barkMat(grey(128,11)),
  'bark.spruce':BIO.barkMat(grey(128,12)),
  'bark.alder':BIO.barkMat(grey(128,13)),
  'bark.linden':BIO.barkMat(grey(128,14)),
  'bark.rowan':BIO.barkMat(grey(128,17)),
  'bark.aspen':BIO.barkMat(grey(128,18)),
  'bark.willow':BIO.barkMat(grey(128,19)),
  'bark.juniper':BIO.barkMat(grey(128,20)),
  'wood.log':BIO.barkMat(grey(128,15)),
  woodCedar:pbrMat('wood.cedar',16,{roughness:0.64,metalness:0.02,vertexColors:false,color:0xd8be9a}),

  rockSerpentinite:pbrMat('rock.serpentinite',21,{roughness:0.32,metalness:0.06,color:0x88aa98}),
  rockCumulate:pbrMat('rock.cumulate',22,{roughness:0.28,metalness:0.08}),
  rockBasalt:pbrMat('rock.basalt',23,{roughness:0.52,metalness:0.06}),
  stoneTufa:pbrMat('stone.tufa',24,{roughness:0.34,metalness:0.04,color:0xdcf2fc}),
  mineralBogore:pbrMat('mineral.bogore',25,{roughness:0.32,metalness:0.68}),
  mineralAmber:pbrMat('mineral.amber',26,{roughness:0.16,metalness:0.08,emissive:0x3e2204,emissiveIntensity:0.22}),
  carnelianChitin:pbrMat('carnelian.chitin',27,{roughness:0.36,metalness:0.06}),
  carnelianRuby:pbrMat('carnelian.ruby',28,{roughness:0.22,metalness:0.08,emissive:0x3a0808,emissiveIntensity:0.20}),
  carnelianChalcedony:pbrMat('carnelian.chalcedony',29,{roughness:0.16,metalness:0.10,emissive:0x1a161c,emissiveIntensity:0.14}),
  ancientCeramic:pbrMat('ancient.ceramic',30,{roughness:0.28,metalness:0.32,vertexColors:false,color:0xebe8e0}),
  worksBronze:pbrMat('works.bronze',31,{roughness:0.24,metalness:0.84,vertexColors:false,color:0xd4aa64}),

  // Stem-anchored foliage cutout cards (exact materials.json keys)
  spruce:BIO.leafMat(cardFallback(51),'af-spruce',{aN:true,swayW:'0.55',swayA:0.04}),
  birch:BIO.leafMat(cardFallback(52),'af-birch',{aN:true,swayW:'0.55',swayA:0.05}),
  alder:BIO.leafMat(cardFallback(57),'af-alder',{aN:true,swayW:'0.55',swayA:0.05}),
  linden:BIO.leafMat(cardFallback(53),'af-linden',{aN:true,swayW:'0.55',swayA:0.05}),
  rowan:BIO.leafMat(cardFallback(58),'af-rowan',{aN:true,swayW:'0.55',swayA:0.05}),
  aspen:BIO.leafMat(cardFallback(59),'af-aspen',{aN:true,swayW:'0.65',swayA:0.07}),
  willow:BIO.leafMat(cardFallback(60),'af-willow',{aN:true,swayW:'0.65',swayA:0.07}),
  juniper:BIO.leafMat(cardFallback(61),'af-juniper',{aN:true,swayW:'0.40',swayA:0.03}),
  sweetgale:BIO.leafMat(cardFallback(62),'af-sweetgale',{aN:false,swayW:'(position.y)',swayA:0.04}),
  clover:BIO.leafMat(cardFallback(63),'af-clover',{aN:false,swayW:'(position.y)',swayA:0.04}),
  cottongrass:BIO.leafMat(cardFallback(64),'af-cottongrass',{aN:false,swayW:'(position.y)',swayA:0.07}),
  fireweed:BIO.leafMat(cardFallback(65),'af-fireweed',{aN:false,swayW:'(position.y)',swayA:0.06}),
  sundew:BIO.leafMat(cardFallback(66),'af-sundew',{aN:false,swayW:'(position.y)',swayA:0.02}),
  cranberry:BIO.leafMat(cardFallback(67),'af-cranberry',{aN:false,swayW:'(position.y)',swayA:0.03}),
  reed:BIO.leafMat(cardFallback(68),'af-reed',{aN:false,swayW:'(position.y)',swayA:0.08}),
  spleenwort:BIO.leafMat(cardFallback(69),'af-spleenwort',{aN:false,swayW:'(position.y)',swayA:0.04}),
  hepatica:BIO.leafMat(cardFallback(70),'af-hepatica',{aN:false,swayW:'(position.y)',swayA:0.04}),
  fern:BIO.leafMat(cardFallback(54),'af-fern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  woad:BIO.leafMat(cardFallback(71),'af-woad',{aN:false,swayW:'(position.y)',swayA:0.05}),
  sedge:BIO.leafMat(cardFallback(55),'af-sedge',{aN:false,swayW:'(position.y)',swayA:0.07}),
  moss:BIO.leafMat(cardFallback(56),'af-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 ARCFLOW.SWAP=BIO.libSwap('arcflow',M);

 if(typeof AF_VSTACK!=='undefined'){
  AF_VSTACK.dilateCardTextures('arcflow',M);
  AF_VSTACK.applyRoughAA(M.rockSerpentinite,'serpentinite',[0.003,0.011,0.028,0.058,0.102,0.155,0.205,0.255],512.0);
  AF_VSTACK.applyRoughAA(M.rockCumulate,'cumulate',[0.002,0.009,0.022,0.048,0.088,0.138,0.188,0.238],512.0);
  AF_VSTACK.applyRoughAA(M.stoneTufa,'tufa',[0.003,0.010,0.025,0.054,0.096,0.148,0.198,0.248],512.0);
  AF_VSTACK.applyRoughAA(M.mineralAmber,'amber',[0.002,0.007,0.018,0.042,0.078,0.125,0.172,0.220],256.0);
  AF_VSTACK.applyRoughAA(M.carnelianRuby,'ruby',[0.002,0.008,0.020,0.045,0.082,0.130,0.180,0.230],512.0);
 }

 if(typeof tick==='function'){
  tick(()=>{
   const dusk=typeof AF_STATE!=='undefined'&&(AF_STATE.mode==='dusk'||AF_STATE.dusk01>0.35);
   M.carnelianRuby.emissiveIntensity=lerp(M.carnelianRuby.emissiveIntensity,dusk?0.46:0.20,0.12);
  });
 }

 // ---------------------------------------------------------------- merged bark & Carnelian silica-chitin buckets
 BIO.bucket('af_birch',M['bark.birch'],{label:'Kulaneva silver-birch chalk-white lichened trunks & limbs'});
 BIO.bucket('af_spruce',M['bark.spruce'],{label:'Klint gorge spire-spruce straight trunks & limbs'});
 BIO.bucket('af_alder',M['bark.alder'],{label:'Bog-iron black alder trunks & roots'});
 BIO.bucket('af_linden',M['bark.linden'],{label:'Escarpment honey-linden trunks & limbs'});
 BIO.bucket('af_rowan',M['bark.rowan'],{label:'Valgekivi cliff-rowan cherry-reddish smooth trunks & limbs'});
 BIO.bucket('af_aspen',M['bark.aspen'],{label:'Kulaneva trembling aspen pale lenticel trunks & limbs'});
 BIO.bucket('af_willow',M['bark.willow'],{label:'Helme-Koski goat-willow flood-bank trunks & limbs'});
 BIO.bucket('af_juniper',M['bark.juniper'],{label:'Valgekivi alvar juniper twisted resinous stems'});
 BIO.bucket('af_chitin',M.carnelianChitin,{label:'Carnelian Erythrophyll fluted silica-chitin tubes & tendons'});
 BIO.bucket('af_skel',M.stoneTufa,{label:'Petrified bone-white Bleach-Swath chitin skeletons'});

 // Spheroidal multi-lobe rock geometry (zero BoxGeometry cubes; FBM-displaced IcosahedronGeometry(1, 2))
 function makeSpheroidalRockGeo(seed,flatY,lobes){
  const g=new T3.IcosahedronGeometry(1,2),p=g.attributes.position,J={},c=[],uv=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined){
    const fb=KRAND.fbm(x*1.6+seed*0.1,y*1.6,z*1.6,2,seed)-0.5;
    const lobe=lobes?0.14*Math.cos(Math.atan2(z,x)*lobes):0;
    J[k]=0.84+0.28*fb+lobe;
   }
   const s=J[k];
   const nx=x*s,ny=y*s*flatY,nz=z*s;
   p.setXYZ(i,nx,ny,nz);
   uv.push(nx*0.5+0.5,nz*0.5+0.5);
   const sh=0.76+0.24*clamp(y*0.5+0.5,0,1);
   c.push(sh,sh,sh);
  }
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- single-line BIO.def cutout items (100% check_cells.py compliant)
 BIO.def('af_spruce_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Klint gorge spire-spruce needle sprays'});
 BIO.def('af_birch_fol',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Kulaneva silver-birch airy crown'});
 BIO.def('af_alder_fol',BIO.geo.clump(),M.alder,{attrs:['aN'],label:'Bog-iron black alder glossy broadleaf crown'});
 BIO.def('af_linden_fol',BIO.geo.clump(),M.linden,{attrs:['aN'],label:'Escarpment honey-linden heart-leaf crown'});
 BIO.def('af_rowan_fol',BIO.geo.clump(),M.rowan,{attrs:['aN'],label:'Valgekivi cliff-rowan starberry & pinnate crown'});
 BIO.def('af_aspen_fol',BIO.geo.clump(),M.aspen,{attrs:['aN'],label:'Kulaneva trembling aspen shimmering crown'});
 BIO.def('af_willow_fol',BIO.geo.clump(),M.willow,{attrs:['aN'],label:'Helme-Koski goat-willow weeping crown'});
 BIO.def('af_juniper_fol',BIO.geo.clump(),M.juniper,{attrs:['aN'],label:'Valgekivi alvar juniper needle spray'});
 BIO.def('af_sweetgale_fol',BIO.geo.clump(),M.sweetgale,{label:'Musta-Neva aromatic sweet-gale bog-myrtle spray'});
 BIO.def('af_clover',BIO.geo.clump(),M.clover,{label:'Auger-disc nitrogen-fixing lime-clover sward'});
 BIO.def('af_cottongrass',BIO.geo.clump(),M.cottongrass,{label:'Musta-Neva hare-tail cottongrass white tussock'});
 BIO.def('af_fireweed_fol',BIO.geo.clump(),M.fireweed,{label:'Vanguard bleach-fireweed magenta floral spike'});
 BIO.def('af_sundew_fol',BIO.geo.clump(),M.sundew,{label:'Musta-Neva great sundew dewy carnivore rosette'});
 BIO.def('af_cranberry_fol',BIO.geo.clump(),M.cranberry,{label:'Musta-Neva peat-string bog cranberry mat'});
 BIO.def('af_reed_fol',BIO.geo.clump(),M.reed,{label:'Helme-Koski emergent channel common-reed'});
 BIO.def('af_spleenwort_fol',BIO.geo.clump(),M.spleenwort,{label:'Kalju-Selka serpentine-edge crevice spleenwort'});
 BIO.def('af_hepatica_fol',BIO.geo.clump(),M.hepatica,{label:'Valgekivi calcareous linden-mull noble-hepatica'});
 BIO.def('af_fern',BIO.geo.clump(),M.fern,{label:'Koski waterfall-mist polypody fern frond'});
 BIO.def('af_woad_fol',BIO.geo.clump(),M.woad,{label:'Valgekivi Kaarum golden dyer-woad rosette'});
 BIO.def('af_sedge',BIO.geo.clump(),M.sedge,{label:'Musta-Jogi fen sedge tussock'});
 BIO.def('af_moss',BIO.geo.mat(),M.moss,{label:'Humic Sphagnum & cloudberry bog mat'});

 // 3D Carnelian Erythrophyll clade items (registered via shared core/frontier KFRONTIER.defCladeItems)
 KFRONTIER.defCladeItems(BIO,{
  chitin:M.carnelianChitin,
  ruby:M.carnelianRuby,
  chalcedony:M.carnelianChalcedony,
  bleach:M.stoneTufa
 },'af');

 // 3D berry, nurse-log, spheroidal serpentinite/cumulate/basalt boulders, raha-maak penny-ore & merevaik amber
 BIO.def('af_cloudberry_pod',BIO.fung.crust({lobes:6,lobeA:0.24,seg:10,rings:3,seed:81101}),M.mineralAmber,{label:'Golden amber-cloudberry drupelet cluster'});
 BIO.def('af_log',BIO.fung.stalk({r0:0.16,r1:0.12,bend:0.06,ribs:7,ribA:0.05,seg:8,rings:5}),M['wood.log'],{label:'Mossy birch & spruce nurse log'});
 BIO.def('af_rock_serpentinite',makeSpheroidalRockGeo(81201,0.68,2),M.rockSerpentinite,{label:'Waxy green-black Arch serpentinite whaleback boulder'});
 BIO.def('af_rock_cumulate',makeSpheroidalRockGeo(81202,0.58,3),M.rockCumulate,{label:'Striped chromitite-anorthosite zebra-cumulate slab'});
 BIO.def('af_rock_basalt',makeSpheroidalRockGeo(81203,0.82,5),M.rockBasalt,{label:'Columnar arch-rift-basalt talus block'});
 BIO.def('af_penny_ore',makeSpheroidalRockGeo(81204,0.28,0),M.mineralBogore,{label:'Discoid Fe-Ni raha-maak penny-ore bog nodule'});
 BIO.def('af_amber_nodule',makeSpheroidalRockGeo(81205,0.64,0),M.mineralAmber,{label:'Water-rolled golden merevaik foredeep amber nodule'});

 // ---------------------------------------------------------------- Earth tree & shrub builders (BIO.flareJoin + 0.00 m stem float)
 const TREE_CFG={
  nevabirch:{bucket:'af_birch',fol:'af_birch_fol',pal:PAL.birch,barkCol:0xe6e2da,H:[11,21],rK:0.024,tiers:4,droop:0.09,broad:true},
  klintspruce:{bucket:'af_spruce',fol:'af_spruce_fol',pal:PAL.spruce,barkCol:0x664e42,H:[18,32],rK:0.025,tiers:6,droop:0.12,conifer:true},
  mustaalder:{bucket:'af_alder',fol:'af_alder_fol',pal:PAL.alder,barkCol:0x524c48,H:[9,17],rK:0.028,tiers:4,droop:0.07,buttress:true},
  klintlinden:{bucket:'af_linden',fol:'af_linden_fol',pal:PAL.linden,barkCol:0x685c52,H:[14,25],rK:0.031,tiers:4,droop:0.08,broad:true},
  klintrowan:{bucket:'af_rowan',fol:'af_rowan_fol',pal:PAL.rowan,barkCol:0x78524a,H:[5.5,11.5],rK:0.029,tiers:3,droop:0.06,broad:true},
  tremblingaspen:{bucket:'af_aspen',fol:'af_aspen_fol',pal:PAL.aspen,barkCol:0xc8cabf,H:[12,22],rK:0.025,tiers:4,droop:0.08,broad:true},
  goatwillow:{bucket:'af_willow',fol:'af_willow_fol',pal:PAL.willow,barkCol:0x5e584c,H:[5.0,10.5],rK:0.034,tiers:3,droop:0.22,buttress:true}
 };

 const SHRUB_CFG={
  klintjuniper:{bucket:'af_juniper',fol:'af_juniper_fol',pal:PAL.juniper,barkCol:0x6a584c,H:[1.35,3.75],stems:3},
  sweetgale:{bucket:'af_alder',fol:'af_sweetgale_fol',pal:PAL.sweetgale,barkCol:0x56483e,H:[0.70,1.62],stems:3}
 };

 ARCFLOW.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:8,r0:0.2};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.10,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  const leanX=0.024*(H(seed,3,0,0x301)-0.5);
  const leanZ=0.024*(H(seed,4,0,0x301)-0.5);
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=5,trunk=[],sinkY=cfg.buttress?0.72:0.55;
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=0.014*H0*Math.sin(t*3.2+seed*0.7);
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed);
    const ty=y-sinkY+(H0+sinkY)*t;
    const flare=cfg.buttress?(1+0.72*Math.pow(Math.max(0,1-t/0.22),2)):(1+0.26*Math.pow(Math.max(0,1-t/0.15),2));
    const rad=Math.max(0.042,r0*(1-0.82*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{seg:r0>0.36?7:5});

   if(cfg.buttress){
    for(let k=0;k<3;k++){
     const az=(k/3)*TAU+0.4*H(seed,10+k,1,0x302);
     const rSpan=r0*(2.1+0.8*H(seed,10+k,2,0x302));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.45,y:y+r0*1.4,z:z+Math.sin(az)*r0*0.45,r:r0*0.42},
      {x:x+Math.cos(az)*rSpan*0.62,y:y+r0*0.25,z:z+Math.sin(az)*rSpan*0.62,r:r0*0.25},
      {x:x+Math.cos(az)*rSpan,y:y-0.75,z:z+Math.sin(az)*rSpan,r:r0*0.12}
     ],{parentR:r0,k:1.5,sink:0.5,len:1.7});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:4});
    }
   }

   const nTiers=cfg.tiers;
   let maxReach=1.6;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.conifer?(0.22+0.72*tf):(0.34+0.60*tf);
    const nBr=cfg.conifer?4:3;
    for(let b=0;b<nBr;b++){
     const az=(b/nBr)*TAU+ti*1.18+0.32*H(seed,30+ti*4+b,1,0x304);
     const reach=H0*(cfg.conifer?(0.22*(1-0.68*tf)):(0.24*Math.sin(tf*Math.PI*0.9+0.25)));
     if(reach>maxReach)maxReach=reach;
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.05,r0*(1-0.76*baseT));
     const lift=cfg.conifer?-0.04:(kind==='goatwillow'?0.08:0.18);
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.56)+reach*0.04,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.042,pR*0.46)},
      {x:mx,y:my,z:mz,r:Math.max(0.032,pR*0.28)},
      {x:ex,y:ey,z:ez,r:Math.max(0.025,pR*0.15)}
     ],{parentR:pR,k:1.55,sink:0.58,len:1.9});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     const palUse=(kind==='nevabirch'&&H(seed,55+b,1,0x305)<0.24)?PAL.birchGold:cfg.pal;
     const fCol=C(palUse[Math.floor(H(seed,60+ti*5+b,2,0x305)*palUse.length)%palUse.length]);
     const padW=reach*(cfg.conifer?1.08:0.94),padH=padW*(cfg.conifer?0.45:(kind==='goatwillow'?0.86:0.70));
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.05*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>1.8){
      const fCol2=C(palUse[Math.floor(H(seed,70+ti*5+b,3,0x305)*palUse.length)%palUse.length]);
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.74,padH*0.76,padW*0.74],fCol2);
     }
    }
   }
   const topX=x+leanX*H0,topZ=z+leanZ*H0,topY=y+H0;
   const topW=H0*(cfg.conifer?0.14:0.22),topH=topW*(cfg.conifer?0.95:0.68);
   BIO.put(cfg.fol,[topX,topY,topZ],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));
   if(!opt.impostor){
    ARCFLOW.CROWNS.push({x:x,z:z,y0:y+H0*0.28,h:H0*0.74,r:maxReach*1.25});
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0};
 };

 ARCFLOW.growShrub=function(kind,x,y,z,seed,scale){
  const cfg=SHRUB_CFG[kind];
  if(!cfg)return{tris:0,H:1.2};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x321))*sc;
  let tris=0;
  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   for(let k=0;k<cfg.stems;k++){
    const az=(k/cfg.stems)*TAU+0.45*H(seed,10+k,1,0x322);
    const sp=H0*(0.32+0.26*H(seed,10+k,2,0x322));
    const hS=H0*(0.78+0.28*H(seed,10+k,3,0x322));
    const ex=x+Math.cos(az)*sp,ez=z+Math.sin(az)*sp,ey=y+hS;
    const mx=lerp(x,ex,0.52),my=y+hS*0.54,mz=lerp(z,ez,0.52);
    const pts=[
     {x:x,y:y-0.30,z:z,r:Math.max(0.032,H0*0.036)},
     {x:mx,y:my,z:mz,r:Math.max(0.024,H0*0.024)},
     {x:ex,y:ey,z:ez,r:Math.max(0.016,H0*0.016)}
    ];
    tris+=BIO.tube(cfg.bucket,pts,cfg.barkCol,{seg:4});
    const fCol=C(cfg.pal[Math.floor(H(seed,30+k,4,0x323)*cfg.pal.length)%cfg.pal.length]);
    const wF=H0*0.54,hF=H0*0.44;
    BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.06*(H(seed,k,5,0x324)-0.5),az,0),[wF,hF,wF],fCol);
    BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.2,0),[wF*0.80,hF*0.80,wF*0.80],fCol);
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0};
 };

 // Carnelian Erythrophyll builders delegating to core/frontier KFRONTIER (all 5 clades)
 ARCFLOW.growCarnelian=function(kind,x,y,z,seed,scale,opt){
  const cfg={bucket:'af_chitin',skelBucket:'af_skel',prefix:'af',sunAzimuthRad:0.68};
  if(kind==='carnelian_organpipe')return KFRONTIER.growOrganPipe(BIO,cfg,x,y,z,seed,scale,opt);
  if(kind==='erythra_veil')return KFRONTIER.growErythraVeil(BIO,cfg,x,y,z,seed,scale);
  if(kind==='bladder_tether')return KFRONTIER.growBladderTether(BIO,cfg,x,y,z,seed,scale);
  if(kind==='blood_strangler'){
   KFRONTIER.putBloodStrangler(BIO,'af',x,y,z,seed,scale);
   return{tris:0,H:1.8};
  }
  KFRONTIER.putAgateWindow(BIO,'af',x,y,z,seed,scale,!!(opt&&opt.petrified));
  return{tris:0,H:0.8};
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 7 m forms
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('af_trees',{grid:8,cell:64,slots:9});
  ARCFLOW.IMP={
   set:impSet,
   nevabirch:BIO.impostor('af_imp_birch',()=>ARCFLOW.growTree('nevabirch',0,0,0,8101,1.0,{impostor:true}),{set:impSet,label:'Kulaneva silver-birch (impostor)'}),
   klintspruce:BIO.impostor('af_imp_spruce',()=>ARCFLOW.growTree('klintspruce',0,0,0,8102,1.0,{impostor:true}),{set:impSet,label:'Klint gorge spire-spruce (impostor)'}),
   mustaalder:BIO.impostor('af_imp_alder',()=>ARCFLOW.growTree('mustaalder',0,0,0,8103,1.0,{impostor:true}),{set:impSet,label:'Bog-iron black alder (impostor)'}),
   klintlinden:BIO.impostor('af_imp_linden',()=>ARCFLOW.growTree('klintlinden',0,0,0,8104,1.0,{impostor:true}),{set:impSet,label:'Escarpment honey-linden (impostor)'}),
   klintrowan:BIO.impostor('af_imp_rowan',()=>ARCFLOW.growTree('klintrowan',0,0,0,8105,1.0,{impostor:true}),{set:impSet,label:'Valgekivi cliff-rowan (impostor)'}),
   tremblingaspen:BIO.impostor('af_imp_aspen',()=>ARCFLOW.growTree('tremblingaspen',0,0,0,8106,1.0,{impostor:true}),{set:impSet,label:'Kulaneva trembling aspen (impostor)'}),
   goatwillow:BIO.impostor('af_imp_willow',()=>ARCFLOW.growTree('goatwillow',0,0,0,8107,1.0,{impostor:true}),{set:impSet,label:'Helme-Koski goat-willow (impostor)'}),
   organpipe:BIO.impostor('af_imp_organpipe',()=>ARCFLOW.growCarnelian('carnelian_organpipe',0,0,0,8108,1.0,{impostor:true}),{set:impSet,label:'Sanguine flute-colony (impostor)'})
  };
  BIO.impostorItem('af_imp_trees',impSet,{minRange:195,label:'Arcflow Earth & Carnelian canopy impostor'});
 }else{
  ARCFLOW.IMP=null;
 }
})();
