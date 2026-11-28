// ================================================================= ARACHNOID CANYONS — 25 species, packed materials & catenary bridge-web builder ([draw])
// Registers BIO.kit('arachnoids') -> ARACHNOIDS: 25 native/regional species across the 4.1 km vertical inversion gradient
// (+660-1,250 m 1.43-1.47 atm Cfa slot-jungle & Tsek-Gompa silk/fumarole corridor -> +1,150-2,400 m Csa basalt benches &
// radial vitrophyre dikes -> +3,800-4,800 m 0.88 atm ET prostrate frost-rim), plus the 0.75 g ATMOS wind-pinned communal
// Tsek-Ma Bridge-Web catenary & horizontal-sheet batcher. 100% packed library textures (materials.json / tex/pack.json).
BIO.kit('arachnoids');
var ARACHNOIDS={
 PHYS:ARACH_PHYS,
 SITES:ARACH_SITES,
 FAUNA:ARACH_PHYS.FAUNA,
 CROPS:ARACH_PHYS.CROPS,
 PLACED:[],
 WEB_SPANS:[],
 WEB_AUDIT:{anchors:0,pinnedZero:0,bellies:0,maxAnchorDrift:0,minBellyDisp:1e9,spans:0,minWaterClearM:1e9,maxAnchorGapM:0}
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler,qUp}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 ARACHNOIDS.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 // ---------------------------------------------------------------- palettes (sRGB hex)
 const PAL=ARACHNOIDS.PAL={
  pine:[0x2f5438,0x386040,0x274830,0x426a48],
  hemlock:[0x264a3e,0x2e5648,0x204036,0x366050],
  oak:[0x425832,0x4e643a,0x384c2a,0x586e42],
  krummholz:[0x2c4e38,0x355840,0x244230,0x3e6248],
  fumaroleFern:[0x3c6e38,0x4c7c40,0x5e7634,0x346232],
  floorFern:[0x3a6834,0x46763c,0x305a2c],
  bamboo:[0x7e9854,0x8ca660,0x6e884a,0x9ab068],
  sinterHot:[0xd86e28,0xe48832,0xc85822],
  sinterWarm:[0xd6a23a,0xc49434,0x6ca478,0x4e8e68],
  dikeclawSilver:[0xb8c4c8,0xc6d0d4,0xa4b2b8],
  dikeclawCarmine:[0xb83244,0xc83e50,0x9e2838],
  vineLeaf:[0x385e34,0x446a3e,0x2e502a],
  vinePad:[0xc88a34,0xd89a42,0xb4782a],
  frostCushion:[0x7ea292,0x8eb0a0,0x6e9282,0x9abca8],
  sedge:[0x84864c,0x949458,0x747842,0xa2a064],
  moss:[0x486e32,0x567c3a,0x3e602a],
  mulberry:[0x467834,0x54883e,0x3c6a2c,0x629448],
  taro:[0x3c7638,0x4a8642,0x326830],
  tea:[0x386630,0x44743a,0x2e5828],
  orchid:[0xf4eef2,0xecdce8,0xf8e6f0],
  seepMoss:[0x467638,0x548442,0x3a662e],
  pistache:[0x4c6e38,0x627c3e,0x8a5838,0x567640],
  juniper:[0x38583c,0x446646,0x2e4c32],
  saffron:[0x9258be,0xa268ce,0x824cae,0xd44c3c],
  lipFern:[0x587248,0x688054,0x4c643e],
  hangIvy:[0x385e36,0x446a40,0x2e502c],
  dwarfBirch:[0x586e38,0x687c42,0x866838,0x4c6030],
  cladonia:[0xdadcd2,0xe4e6dc,0xcacdc2],
  edelweiss:[0xf0efe8,0xe6e5dc,0xf6f5ee],
  frostroot:[0xe6d8de,0xdccad2,0xf0e2e8],
  basalt:[0x343840,0x3e424c,0x2c3038],
  vitrophyre:[0x1e2228,0x262a32,0x181c22],
  bolus:[0x8e3c2e,0x9c4636,0x7c3428],
  sandstone:[0xb2845e,0xc0926a,0xa27652],
  tuff:[0xc8beaa,0xd4cab6,0xb8ae9a],
  granite:[0xa4a098,0xb2aea6,0x949088],
  sinterRock:[0xe4dfd4,0xede8de,0xd6d0c4]
 };

 // ---------------------------------------------------------------- species registry (25 species across 3 vertical inversion zones)
 const SPECIES=ARACHNOIDS.SPECIES=[
  // A. Original 7 Signature Arachnoid Canyons Species (PLAN.md section 4)
  {key:'fumarolefern',name:'Steam-Plume Tree-Fern',
   how:'Frost-free 3.2-7.0 m silica-armoured tree-fern crowning 1.43 atm +28 C fumarole and basalt step-pool terraces with arching bronze-emerald fronds.',
   items:['ar_fern_trunk','ar_fern_frond'],
   tags:N('subtropic','humid','yes',['Cfa'],'slotfloor',{thermal:true,frostFree:true})},
  {key:'sintermat',name:'Thermophilic Sinter-Cushion',
   how:'Terraced 0.03-0.16 m copper-orange, ochre-gold, and jade gelatinous biofilm cushions precipitating porous silica-travertine micro-rims around +34-62 C step-pools.',
   items:['ar_sinter_crust','ar_sinter_dome'],
   tags:N('subtropic','humid','yes',['Cfa'],'slotfloor',{thermal:true,travertine:true,frostFree:true})},
  {key:'dikeclaw',name:'Hex-Joint Cliff Lithophyte',
   how:'Spiky 0.45-1.40 m silver-pruinose and carmine cliff rosette wedging velamen anchor-roots into horizontal cooling cracks of radial basalt colonnades.',
   items:['ar_dikeclaw_rosette','ar_dikeclaw_spike'],
   tags:N('temperate','subhumid','no',['Cfa','Csa'],'ledgewood',{lithophyte:true,dye:'carmine'})},
  {key:'webanchorvine',name:'Gum-Pad Chasm Creeper',
   how:'Woody 4-18 m slot-wall liana with discoid amber adhesive pads around whose lignified stem loops Tsek-Ma bridge-spiders anchor primary guy-cables.',
   items:['ar_vine_leaf','ar_vine_pad'],
   tags:N('temperate','humid','no',['Cfa','Csa'],'slotfloor',{lithophyte:true,symbiotic:'bridgearachnid'})},
  {key:'columnarpine',name:'Basalt-Claw Ledge Pine',
   how:'Flat-topped 8-22 m thick-barked conifer prying octagonal BIO.flareJoin root-buttresses into mid-wall columnar basalt and tuff benches while leaning out over 900 m chasms.',
   items:['ar_pine_fol'],
   tags:K('temperate','subhumid','no',['Csa','Cfa'],'ledgewood')},
  {key:'rimkrummholz',name:'Updraft-Flagged Rim Pine-Juniper',
   how:'Prostrate 0.45-1.90 m streamlined alpine conifer banner on 0.88 atm ET chasm lips, sheared strictly radially away from rising canyon updrafts.',
   items:['ar_krumm_fol'],
   tags:N('cold','semiarid','no',['ET','Dfc'],'frostrim',{windVane:true,prostrate:true})},
  {key:'frostcushion',name:'Vitrophyre Glass-Wort Cushion',
   how:'Hemispherical 0.08-0.32 m silver-emerald wooly cushion dome hugging solar-warmed jet-black obsidian-vitrophyre dike selvages on -2 C frost-polygon rims.',
   items:['ar_frost_dome'],
   tags:N('cold','semiarid','no',['ET'],'frostrim',{substrate:'vitrophyre',prostrate:true})},

  // B. Montane-Gorge Vascular Matrix (kin guilds of nwlowlands, swlowlands & korona)
  {key:'gorgehemlock',name:'Mist-Slot Gorge Hemlock',
   how:'Shade-tolerant 16-32 m humid canyon-bench conifer sheltering beneath radial basalt dike walls in the warm 1.43-1.47 atm mist belt.',
   items:['ar_hemlock_fol'],
   tags:K('temperate','humid','both',['Cfa'],'slotfloor',{kin:'nwlowlands'})},
  {key:'ledgeoak',name:'Colonnade Evergreen Canyon Oak',
   how:'Gnarled 7-15 m sun-baked Csa sclerophyll oak sharing mid-wall welded tuff and horizontal basalt benches with columnarpine.',
   items:['ar_oak_fol'],
   tags:K('temperate','subhumid','no',['Csa','Cfa'],'dryrim',{kin:'swlowlands'})},
  {key:'canyonbamboo',name:'Ham-Tsek Mist-Slot Bamboo',
   how:'Dense 6-11 m hollow culm thickets thriving in frost-free river spray and warm hydrothermal canyon-floor hollows.',
   items:['ar_bamboo_culm','ar_bamboo_leaf0','ar_bamboo_leaf1','ar_bamboo_shoot'],
   tags:K('subtropic','humid','yes',['Cfa'],'slotfloor',{kin:'swlowlands',frostFree:true})},
  {key:'alpinesedge',name:'Gorge Sword-Fern and Rim Cushion-Sedge',
   how:'Mist-fed gorge floor sword-ferns and moss mats grading upward into Csa bunch-sedge and ET periglacial polygon tussocks.',
   items:['ar_floorfern','ar_sedge','ar_mossmat'],
   tags:K('cold','subhumid','both',['Cfa','Csa','Dfc','ET'],'frostrim',{kin:'korona'})},

  // C. Zone 1 Expansion (+660-1,250 m Frost-Free 1.43-1.47 atm Cfa Slot Trough: fumarole & nexus; frost01 === 0 && aslM <= 1450)
  {key:'slotmulberry',name:'Tsek-Gompa Canyon Silk-Mulberry',
   how:'Frost-free 5.5-10.5 m spreading heartleaf canopy tree along warm 9102 Ham-Tsek river benches feeding Tsek-Gompa silk-guild broods along the Spider Lake to Silkhead corridor.',
   items:['ar_mulberry_fol'],
   tags:K('subtropic','humid','yes',['Cfa'],'slotfloor',{frostFree:true,silkGuild:true})},
  {key:'steambedtaro',name:'Steambed Megaphyll Taro',
   how:'Lush 0.75-1.35 m broad-bladed aroid rosettes lining +24-38 C turquoise basalt-weir step-pools and mist-drenched Ham-Tsek eddy bars.',
   items:['ar_taro_leaf'],
   tags:K('subtropic','humid','yes',['Cfa'],'slotfloor',{thermal:true,frostFree:true})},
  {key:'mistcanyontea',name:'Mist-Bench Canyon Tea',
   how:'Compact 0.95-1.65 m glossy evergreen tea shrub thriving on diffuse-lit, mist-saturated lower basalt benches inside the inverted Cfa canyon lid.',
   items:['ar_tea_fol'],
   tags:K('subtropic','humid','no',['Cfa'],'slotfloor',{frostFree:true})},
  {key:'plumeorchid',name:'Steam-Mist Dendrobium Orchid',
   how:'Fragrant 0.28-0.62 m ivory-magenta epiphytic dendrobium sprays perched on warm wet basalt dike faces and mossy gorgehemlock and slotmulberry trunks.',
   items:['ar_orchid_spray'],
   tags:N('subtropic','humid','no',['Cfa'],'slotfloor',{epiphyte:true,frostFree:true})},
  {key:'seepcurtainmoss',name:'Dripping Slot-Seep Curtain-Moss',
   how:'Trailing 0.85-2.30 m emerald-jade bryophyte curtains streaming from weeping basalt dike overhangs, step-pool lips, and lower gorgehemlock boughs.',
   items:['ar_seep_moss'],
   tags:K('subtropic','humid','yes',['Cfa'],'slotfloor',{frostFree:true})},

  // D. Zone 2 Expansion (+1,150-2,400 m Warm-Dry Csa Basalt Benches & Radial Vitrophyre Dikes: ledges & upper nexus; aslM <= 2600)
  {key:'amberpistache',name:'Ham-Tsek Amber-Bark Pistache',
   how:'Crooked 5.5-11.5 m resin-gleaming amber-barked broadleaf tree on sun-baked Csa tuff and colonnade benches linking down-gorge to the Silkhead and Ria amber-lacquer trade.',
   items:['ar_pistache_fol'],
   tags:K('temperate','subhumid','no',['Csa','Cfa'],'ledgewood',{resin:'amber'})},
  {key:'spokedikejuniper',name:'Radial Spoke-Dike Juniper',
   how:'Twisted 4.2-9.5 m scale-needled aromatic conifer anchoring into chilled radial obsidian-vitrophyre dike ribs alongside columnarpine.',
   items:['ar_juniper_fol'],
   tags:K('temperate','semiarid','no',['Csa','Cfa'],'dryrim',{substrate:'vitrophyre'})},
  {key:'gompasaffron',name:'Tsek-Gompa Basalt-Terrace Saffron',
   how:'Sunny 0.18-0.36 m violet-petalled, crimson-stigma geophyte clumps carpeting dry-summer Csa welded-tuff and columnar-basalt terraces.',
   items:['ar_saffron_clump'],
   tags:K('temperate','semiarid','no',['Csa','Cfa'],'dryrim',{dye:'saffron'})},
  {key:'vitrophyrelipfern',name:'Vitrophyre Glass-Dike Lip-Fern',
   how:'Compact 0.32-0.65 m xeric resurrection-fern rosettes wedged into glassy chilled basalt-dike contact crevices where vitrophyre01 > 0.35.',
   items:['ar_lipfern'],
   tags:N('temperate','semiarid','no',['Csa','Cfa'],'dryrim',{lithophyte:true,substrate:'vitrophyre'})},
  {key:'entablatureivy',name:'Basalt-Entablature Cliff Ivy',
   how:'Trailing 1.8-5.2 m evergreen cliff liana draping horizontal-hex columnar-basalt entablature risers and outland-tuff scarps.',
   items:['ar_entab_ivy'],
   tags:K('temperate','subhumid','no',['Csa','Cfa'],'ledgewood',{lithophyte:true})},

  // E. Zone 3 Expansion (+3,800-4,800 m Thin-Air 0.88 atm ET Frost-Rim: frostrim; strictly prostrate <= 1.4 m)
  {key:'snowbeddwarfbirch',name:'Snowbed Prostrate Dwarf-Birch',
   how:'Strictly prostrate 0.32-1.05 m creeping micro-leaved shrub sheltering in leeward snowbed hollows behind updraft-sheared rimkrummholz.',
   items:['ar_dwarfbirch_fol'],
   tags:K('cold','semiarid','no',['ET','Dfc'],'frostrim',{prostrate:true})},
  {key:'rimcladonia',name:'Polygon-Rim Cladonia Lichen',
   how:'Low 0.04-0.14 m silver-cream fruticose lichen mats colonising wind-scoured KFROST basalt-vitrophyre and diapir-granite stone polygons.',
   items:['ar_cladonia_mat'],
   tags:K('cold','semiarid','no',['ET'],'frostrim',{prostrate:true})},
  {key:'rimedelweiss',name:'Chasm-Lip Alpine Wool-Star',
   how:'Compact 0.10-0.26 m UV-shielded white-felted wool-star rosettes tucked into sheltered lee-pockets beside frostcushion domes.',
   items:['ar_edelweiss_bloom'],
   tags:K('cold','semiarid','no',['ET'],'frostrim',{prostrate:true})},
  {key:'wildfrostroot',name:'Polygon-Crack Wild Frostroot',
   how:'Hardy 0.14-0.38 m bell-flowered taproot geophyte wedged along periglacial polygon seams on the 0.88 atm frost-rim, wild ancestor of cultivated frostroot.',
   items:['ar_frostroot_tuft'],
   tags:N('cold','semiarid','no',['ET','Dfc'],'frostrim',{prostrate:true,cropAncestor:'frostroot'})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 ARACHNOIDS.HARVEST={
  fumarolefern:HV('none',['steamed crosier pith'],true,'Silica-rich trunk fibre braided into heat-proof tongs by Hum sulfur and placer crews; mucilage salve for steam burns.',''),
  sintermat:HV('none',[],true,'Dried ochre-orange mineral crust ground for antiseptic poultices and warm saffron-ochre pottery slip.','reagent'),
  dikeclaw:HV('none',['nectar spike'],false,'Crushed carmine bracts yield fast gorge-red silk dye; rosette tanks hold clean drinking water on sheer climbs.',''),
  webanchorvine:HV('cordage',[],false,'Boiled adhesive pads yield waterproof caulking pitch for Hum river-barges and cable bindings.',''),
  columnarpine:HV('timber, resin',['ledge pinyon nut'],true,'Resinous rot-proof bridge-deck planking and pitch torches.','cone'),
  rimkrummholz:HV('fuel',['rime-berry'],true,'Dense twisted root-wood burned in high-pass cairn braziers; aromatic juniper-like berries.','berry'),
  frostcushion:HV('fuel',[],true,'Dried resinous turf blocks burned on treeless alpine portages; febrifuge tea.',''),
  gorgehemlock:HV('timber, tannin',[],false,'Straight gorge-bridge stringer timber and tannin-rich bark for curing silk-rigging leather.','cone'),
  ledgeoak:HV('timber, fuel',['canyon acorn'],false,'Hard pulley-block and capstan-pawls heartwood; leached sweet acorns.','acorn'),
  canyonbamboo:HV('weaving, cordage',['bamboo shoot'],false,'Light scaffolding poles, sulfur-condenser baskets, and woven silk-reeling trays.',''),
  alpinesedge:HV('thatch, weaving',[],false,'Boot-insulation hay and pack-frame padding.',''),
  slotmulberry:HV('carving, bast',['mulberry'],false,'Tender heart-shaped leaves feed Tsek-Gompa canyon silk-moth broods along the Spider Lake to Silkhead and Ria corridor; inner bast beaten into Amber-Seal toll ledger paper.','mulberry'),
  steambedtaro:HV('none',['taro corm','steambed-yam'],false,'Starchy corms steamed in warm basalt-weir step-pools by Hum gorge wardens and placer crews; broad waxy blades wrap degummed silk skeins.',''),
  mistcanyontea:HV('fuel',['tea flush'],true,'Shade-sweetened canyon-mist leaf flushes bricked into Hum caravan tea for the Ham-Tsek to Silkhead and Upper Ria silk road; astringent wash.',''),
  plumeorchid:HV('none',[],true,'Mucilaginous pseudobulbs steeped into throat-soothing demulcent tonic against sulfur-fumarole mist; fragrant sizing extract for gossamer silk.','reagent'),
  seepcurtainmoss:HV('padding, weaving',[],true,'Absorbent antiseptic seep-moss wrung clean for wound dressings, live-spider transport humidifiers, and cushioned silk-bale packing.',''),
  amberpistache:HV('timber, resin',['pistache kernel'],true,'Fissured golden-amber bark bleeds clear mastic-amber lacquer traded down Ham-Tsek to Silkhead and the Court of the Amber Seal in Ria Sound for sealing silk chests and Pioneer dielectric coils.','drupe'),
  spokedikejuniper:HV('carving, fuel',['juniper cone'],true,'Rot-proof aromatic heartwood carved into Hum cliff-stair pegs and cable cleats; resinous smudge-smoke calms Tsek-Ma bridge-spiders during hawser maintenance.','berry'),
  gompasaffron:HV('none',['saffron stigma'],true,'Crimson stigmas plucked on sunny Tsek-Gompa basalt benches to dye top-grade Golden-Cable and Hum ceremonial silk sashes traded toward Silkhead and Ria.','reagent'),
  vitrophyrelipfern:HV('none',[],true,'Poikilohydric glass-dike resurrection fronds brewed by cliff-stair crews for altitude headache tea; crisp silica ash polishes nephrite and bronze sheaves.',''),
  entablatureivy:HV('cordage, weaving',[],false,'Tough pliant cliff-liana runners plaited into rock-climbing slings, tool lanyards, and basket rims along mid-wall colonnade stairs.',''),
  snowbeddwarfbirch:HV('fuel, tannin',[],true,'Oil-rich papery bark curls ignite even in thin 0.88 atm sleet at high-rim cairn braziers; astringent twig decoction.',''),
  rimcladonia:HV('none',['boiled lichen jelly'],true,'Leached and boiled emergency famine starch for high-rim portage crews; yields warm lichen-gold wool and silk mordant dye.','reagent'),
  rimedelweiss:HV('none',[],true,'UV-shielding white-felted bracts infused into alpine windburn balm and worn as a high-pass token by Hum gorge guides.',''),
  wildfrostroot:HV('none',['frostroot taproot'],true,'Antifreeze-sweetened taproot dug from frost-polygon seams as high-calorie trail rations; wild progenitor of Krator alpine frostroot.','')
 };
 SPECIES.forEach(S=>{S.tags.harvest=ARACHNOIDS.HARVEST[S.key];});
 const byKey={};SPECIES.forEach(S=>{byKey[S.key]=S;});
 ARACHNOIDS.byKey=byKey;
 ARACHNOIDS.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 ARACHNOIDS.plantOfItem=ARACHNOIDS.speciesOfItem;

 // ---------------------------------------------------------------- procedural fallbacks + packed library PBR materials
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=196+(H(seed,i%w,(i/w)|0,0x71)-0.5)*54;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(218,230,214,1)';
  for(let k=0;k<36;k++){
   const x=S*(0.14+0.72*H(seed,k,1,0x81)),y=S*(0.12+0.76*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[180,198,176]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('arachnoids',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.78:opt.roughness,
   metalness:opt.metalness==null?0.05:opt.metalness,
   transparent:!!opt.transparent,
   opacity:opt.opacity==null?1.0:opt.opacity,
   depthWrite:opt.depthWrite!==false,
   vertexColors:opt.vertexColors!==false,
   side:opt.side||T3.DoubleSide
  });
  if(L&&L.scale)m.userData.libScale=L.scale;
  if(L&&typeof KMAT.libHooks==='function'&&!opt.skipLibHook){
   const key='arach-pbr-'+slot+KMAT.libKey(L);
   m.onBeforeCompile=sh=>{KMAT.libHooks(sh,L);};
   m.customProgramCacheKey=()=>key;
  }
  return m;
 }

 const M=ARACHNOIDS.M={
  // Bark & timber slots (swapped to packed library WebPs via BIO.libSwap)
  'bark.pine':BIO.barkMat(grey(128,11)),
  'bark.juniper':BIO.barkMat(grey(128,12)),
  'bark.oak':BIO.barkMat(grey(128,13)),
  'bark.fern':BIO.barkMat(grey(128,14)),
  'bark.bamboo':BIO.barkMat(grey(128,15)),
  'wood.plank':BIO.barkMat(grey(128,16)),
  'bark.willow':BIO.barkMat(grey(128,17)),
  'bark.amber':BIO.barkMat(grey(128,18)),

  // World-space ATMOS-swaying golden-gunmetal silk sheet & guy-cable materials + instanced anchor-collar/spider material
  silkSheet:pbrMat('silk.sheet',21,{roughness:0.28,metalness:0.24,transparent:true,opacity:0.84,depthWrite:false,skipLibHook:true}),
  silkCable:pbrMat('silk.cable',22,{roughness:0.32,metalness:0.28,skipLibHook:true}),
  silkCollar:pbrMat('silk.cable',23,{roughness:0.36,metalness:0.22}),

  // PBR rocks, sinter cushions, frost cushions & KSPELEO crystals
  rockBasalt:pbrMat('rock.basalt',24,{roughness:0.64,metalness:0.08,vertexColors:false}),
  rockBasaltVC:pbrMat('rock.basalt',25,{roughness:0.64,metalness:0.08,vertexColors:true}),
  rockVitrophyre:pbrMat('rock.vitrophyre',26,{roughness:0.18,metalness:0.22,vertexColors:false}),
  rockVitrophyreVC:pbrMat('rock.vitrophyre',27,{roughness:0.18,metalness:0.22,vertexColors:true}),
  rockBolus:pbrMat('rock.bolus',28,{roughness:0.76,metalness:0.06,vertexColors:false}),
  rockSandstone:pbrMat('rock.sandstone',29,{roughness:0.82,metalness:0.03,vertexColors:false}),
  rockTuff:pbrMat('rock.tuff',30,{roughness:0.80,metalness:0.03,vertexColors:false}),
  rockGranite:pbrMat('rock.granite',31,{roughness:0.76,metalness:0.03,vertexColors:false}),
  rockSinter:pbrMat('rock.sinter',32,{roughness:0.46,metalness:0.04,vertexColors:false}),
  organicSinter:pbrMat('organic.sinter',33,{roughness:0.38,metalness:0.04}),
  cushionFrost:pbrMat('cushion.frost',34,{roughness:0.74,metalness:0.04}),
  crystalNitre:pbrMat('crystal.nitre',35,{roughness:0.26,metalness:0.08}),
  crystalSmoky:pbrMat('crystal.smoky',36,{roughness:0.16,metalness:0.12}),

  // Foliage & lithophyte cards
  pine:BIO.leafMat(cardFallback(41),'ar-pine',{aN:true,swayW:'0.55',swayA:0.04}),
  hemlock:BIO.leafMat(cardFallback(42),'ar-hemlock',{aN:true,swayW:'0.60',swayA:0.05}),
  oak:BIO.leafMat(cardFallback(43),'ar-oak',{aN:true,swayW:'0.50',swayA:0.04}),
  fern:BIO.leafMat(cardFallback(44),'ar-fern',{aN:false,swayW:'(position.x)',swayA:0.07}),
  floorfern:BIO.leafMat(cardFallback(45),'ar-floorfern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  bamboo:BIO.leafMat(cardFallback(46),'ar-bamboo',{aN:false,swayW:'(-position.y)',swayA:0.09,axis:1,alphaTest:0.38}),
  dikeclaw:BIO.leafMat(cardFallback(47),'ar-dikeclaw',{aN:false,swayW:'(position.y)',swayA:0.03}),
  bromeliad:BIO.leafMat(cardFallback(48),'ar-bromeliad',{aN:false,swayW:'(position.y)',swayA:0.03}),
  vine:BIO.leafMat(cardFallback(49),'ar-vine',{aN:false,swayW:'0.35',swayA:0.03}),
  sedge:BIO.leafMat(cardFallback(50),'ar-sedge',{aN:false,swayW:'(position.y)',swayA:0.07}),
  moss:BIO.leafMat(cardFallback(51),'ar-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32}),
  mulberry:BIO.leafMat(cardFallback(52),'ar-mulberry',{aN:true,swayW:'0.55',swayA:0.05}),
  taro:BIO.leafMat(cardFallback(53),'ar-taro',{aN:false,swayW:'(position.y)',swayA:0.06}),
  tea:BIO.leafMat(cardFallback(54),'ar-tea',{aN:false,swayW:'(position.y)',swayA:0.04}),
  orchid:BIO.leafMat(cardFallback(55),'ar-orchid',{aN:false,swayW:'(position.y)',swayA:0.04}),
  hangmoss:BIO.leafMat(cardFallback(56),'ar-hangmoss',{aN:false,swayW:'(-position.y)',swayA:0.07,axis:1}),
  pistache:BIO.leafMat(cardFallback(57),'ar-pistache',{aN:true,swayW:'0.55',swayA:0.05}),
  juniper:BIO.leafMat(cardFallback(58),'ar-juniper',{aN:true,swayW:'0.42',swayA:0.03}),
  saffron:BIO.leafMat(cardFallback(59),'ar-saffron',{aN:false,swayW:'(position.y)',swayA:0.04}),
  hangivy:BIO.leafMat(cardFallback(60),'ar-hangivy',{aN:false,swayW:'(-position.y)',swayA:0.06,axis:1}),
  dwarfbirch:BIO.leafMat(cardFallback(61),'ar-dwarfbirch',{aN:true,swayW:'0.35',swayA:0.03}),
  cladonia:BIO.leafMat(cardFallback(62),'ar-cladonia',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32}),
  edelweiss:BIO.leafMat(cardFallback(63),'ar-edelweiss',{aN:false,swayW:'(position.y)',swayA:0.02}),
  bulbheath:BIO.leafMat(cardFallback(64),'ar-bulbheath',{aN:false,swayW:'(position.y)',swayA:0.03})
 };

 ARACHNOIDS.SWAP=BIO.libSwap('arachnoids',M);

 // ---------------------------------------------------------------- ATMOS wind-pinned catenary bridge-web shader hook
 const SILK_GLSL=[
  '{float arPin=length(aFlut);',
  'if(arPin>1e-5){',
  ' vec3 arWPos=(modelMatrix*vec4(position,1.0)).xyz;',
  ' vec2 arFw=atmWind(uAtmTime,arWPos.xz,uAtmWind,uAtmGust);',
  ' float arWMag=length(arFw);',
  ' vec2 arWDir=arWMag>1e-4?arFw/arWMag:vec2(1.0,0.0);',
  ' float arPh1=dot(arWPos.xz,arWDir)*2.2-uAtmTime*(2.6+0.55*arWMag)+arWPos.y*1.5;',
  ' float arPh2=dot(arWPos,vec3(1.1,1.8,1.3))*2.0-uAtmTime*(4.1+0.4*arWMag);',
  ' float arWave=0.65*sin(arPh1)+0.35*sin(arPh2);',
  ' vec3 arDrift=vec3(arFw.x*0.24,0.05*arWMag*(0.5+0.5*sin(arPh1)),arFw.y*0.24)*arPin;',
  ' vec3 arRip=aFlut*arWave*(0.30+0.38*arWMag);',
  ' transformed+=arDrift+arRip;',
  '}}'
 ].join('\n');

 ARACHNOIDS.bindAtmosSilk=function(){
  if(typeof ATMOS==='undefined'||!ATMOS.U||!ATMOS.GLSL_WIND)return false;
  const targets=[['sheet',M.silkSheet],['cable',M.silkCable]];
  for(let i=0;i<targets.length;i++){
   const tag=targets[i][0],mat=targets[i][1];
   if(!mat||mat.userData.atmosSilkBound)continue;
   mat.userData.atmosSilkBound=true;
   mat.onBeforeCompile=sh=>{
    sh.uniforms.uAtmTime=ATMOS.U.time;
    sh.uniforms.uAtmWind=ATMOS.U.wind;
    sh.uniforms.uAtmGust=ATMOS.U.gustAmp;
    sh.vertexShader='uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n'+ATMOS.GLSL_WIND+'\n'+sh.vertexShader;
    sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+SILK_GLSL);
   };
   mat.customProgramCacheKey=()=>'arachnoids-atmos-silk-'+tag;
   mat.needsUpdate=true;
  }
  return true;
 };

 // ---------------------------------------------------------------- merged bark & wood buckets (shared per zone -> low draw calls)
 BIO.bucket('ar_pine',M['bark.pine'],{label:'Columnar-pine & gorge-hemlock furrowed trunks'});
 BIO.bucket('ar_juniper',M['bark.juniper'],{label:'Spoke-dike juniper, rim-krummholz, dwarf-birch & chasm-vine stems'});
 BIO.bucket('ar_oak',M['bark.oak'],{label:'Colonnade evergreen canyon oak trunks'});
 BIO.bucket('ar_wood',M['wood.plank'],{label:'Seasoned canyon timber & root-claws'});
 BIO.bucket('ar_willow',M['bark.willow'],{label:'Tsek-Gompa silk-mulberry & canyon tea stems'});
 BIO.bucket('ar_amber',M['bark.amber'],{label:'Ham-Tsek amber-pistache resinous trunks'});

 // ---------------------------------------------------------------- rock & column geometries
 function makeRockGeo(seed,flatY,angular){
  const g=new T3.IcosahedronGeometry(1,angular?1:2),p=g.attributes.position,J={};
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.75+0.40*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
  }
  g.computeVertexNormals();
  return g;
 }
 function makeHexPrismGeo(seed,horizontal){
  const g=new T3.CylinderGeometry(0.94,1.0,1.0,6,2,false);
  if(horizontal){
   g.rotateZ(Math.PI*0.5);
  }else{
   g.translate(0,0.5,0);
  }
  const p=g.attributes.position,c=[];
  for(let i=0;i<p.count;i++){
   const sh=0.82+0.18*clamp(p.getY(i)*0.5+0.5,0,1)+0.05*(H(seed,i,3,0x92)-0.5);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- single-line BIO.def items (check_cells.py compliant)
 BIO.def('ar_pine_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Basalt-claw columnarpine needle pads'});
 BIO.def('ar_hemlock_fol',BIO.geo.clump(),M.hemlock,{attrs:['aN'],label:'Mist-slot gorge hemlock sprays'});
 BIO.def('ar_oak_fol',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Colonnade evergreen canyon oak crown'});
 BIO.def('ar_krumm_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Updraft-flagged rimkrummholz banner needles'});
 BIO.def('ar_fern_trunk',BIO.fung.stalk({r0:0.16,r1:0.10,bend:0.10,ribs:8,ribA:0.09,seg:8,rings:5}),M['bark.fern'],{label:'Steam-plume fumarolefern silica-armoured trunk'});
 BIO.def('ar_fern_frond',BIO.geo.frond(4),M.fern,{label:'Steam-plume fumarolefern bronze-emerald frond'});
 BIO.def('ar_sinter_crust',BIO.fung.crust({lobes:8,lobeA:0.24,seg:18,rings:3,crustK:0.86,seed:59101}),M.organicSinter,{label:'Thermophilic sintermat terraced biofilm'});
 BIO.def('ar_sinter_dome',BIO.fung.cap({form:'dome',h:0.28,seg:12,rings:3,lump:0.22,wav:6,wavA:0.05,under:'none',uv:'planar',seed:59102}),M.organicSinter,{label:'Thermophilic sintermat cushion'});
 BIO.def('ar_dikeclaw_rosette',BIO.geo.clump(),M.dikeclaw,{label:'Hex-joint dikeclaw silver-pruinose rosette'});
 BIO.def('ar_dikeclaw_spike',BIO.geo.bloom(),M.bromeliad,{label:'Hex-joint dikeclaw carmine nectar spike'});
 BIO.def('ar_vine_leaf',BIO.geo.clump(),M.vine,{label:'Gum-pad webanchorvine cliff foliage'});
 BIO.def('ar_vine_pad',BIO.fung.crust({lobes:6,lobeA:0.18,seg:12,rings:2,crustK:0.82,seed:59103}),M.organicSinter,{label:'Gum-pad webanchorvine amber adhesive disc'});
 BIO.def('ar_frost_dome',BIO.fung.cap({form:'dome',h:0.48,seg:12,rings:4,lump:0.20,wav:5,wavA:0.04,under:'none',uv:'planar',seed:59104}),M.cushionFrost,{label:'Vitrophyre glass-wort frostcushion dome'});
 BIO.def('ar_floorfern',BIO.geo.clump(),M.floorfern,{label:'Slot-gorge mist sword-fern'});
 BIO.def('ar_sedge',BIO.geo.clump(),M.sedge,{label:'Ledge & frost-polygon tuft-sedge'});
 BIO.def('ar_mossmat',BIO.geo.mat(),M.moss,{label:'Canyon spray moss mat'});
 BIO.def('ar_mulberry_fol',BIO.geo.clump(),M.mulberry,{attrs:['aN'],label:'Tsek-Gompa canyon silk-mulberry heartleaf crown'});
 BIO.def('ar_taro_leaf',BIO.geo.bloom(),M.taro,{label:'Steambed taro megaphyll rosette'});
 BIO.def('ar_tea_fol',BIO.geo.bloom(),M.tea,{label:'Mist-bench canyon tea shrub foliage'});
 BIO.def('ar_orchid_spray',BIO.geo.bloom(),M.orchid,{label:'Steam-mist dendrobium plume-orchid spray'});
 BIO.def('ar_seep_moss',BIO.geo.ribbon(4,0.55,0.16),M.hangmoss,{label:'Dripping slot-gorge seep moss curtain'});
 BIO.def('ar_pistache_fol',BIO.geo.clump(),M.pistache,{attrs:['aN'],label:'Ham-Tsek amber-pistache resinous crown'});
 BIO.def('ar_juniper_fol',BIO.geo.clump(),M.juniper,{attrs:['aN'],label:'Radial spoke-dike juniper foliage'});
 BIO.def('ar_saffron_clump',BIO.geo.clump(),M.saffron,{label:'Tsek-Gompa basalt-terrace saffron crocus clump'});
 BIO.def('ar_lipfern',BIO.geo.frond(3),M.fern,{label:'Vitrophyre glass-dike xeric lip-fern frond'});
 BIO.def('ar_entab_ivy',BIO.geo.ribbon(4,0.52,0.16),M.hangivy,{label:'Columnar-basalt entablature hanging ivy'});
 BIO.def('ar_dwarfbirch_fol',BIO.geo.clump(),M.dwarfbirch,{attrs:['aN'],label:'Snowbed prostrate dwarf-birch spray'});
 BIO.def('ar_cladonia_mat',BIO.geo.mat(),M.cladonia,{label:'Wind-scoured polygon-rim cladonia lichen mat'});
 BIO.def('ar_edelweiss_bloom',BIO.geo.bloom(),M.edelweiss,{label:'Chasm-lip alpine edelweiss wool-star'});
 BIO.def('ar_frostroot_tuft',BIO.geo.bloom(),M.bulbheath,{label:'Polygon-crack wild frostroot heath tuft'});

 // Silk anchor collars & Tsek-Ma spider colony cocoons/bodies on instanced PBR silkCollar
 BIO.def('ar_web_collar',BIO.fung.crust({lobes:6,lobeA:0.22,seg:12,rings:2,seed:59105}),M.silkCollar,{label:'Tsek-Ma braided silk basalt-anchor pad'});
 BIO.def('ar_spider_cocoon',BIO.fung.pod({tip:0.42,h:0.78,seg:8,rings:4,seed:59106}),M.silkCollar,{label:'Colonial Tsek-Ma golden-gunmetal silk cocoon & weaver node'});

 // Canyon bamboo (33b-core-bamboo.js)
 {
  const B=BIO.bamboo;
  if(B){
   BIO.def('ar_bamboo_culm',B.culm({n:14,seg:8,jit:0.16,grade:0.18,sheaths:2,seed:59201}),M['bark.bamboo'],{label:'Ham-Tsek mist-slot bamboo culm'});
   [0,4].forEach((cellIdx,i)=>{
    BIO.def('ar_bamboo_leaf'+i,B.spray({cell:cellIdx}) /* geo.cells( */,M.bamboo,{label:'Mist-slot bamboo leaf spray'});
   });
   BIO.def('ar_bamboo_shoot',B.shoot({n:4,seg:7}),M['bark.bamboo'],{label:'Mist-slot bamboo shoot'});
  }
 }

 // Geological boulders & horizontal hexagonal basalt prisms
 BIO.def('ar_rock_hex_horiz',makeHexPrismGeo(59301,true),M.rockBasaltVC,{label:'Horizontal hex-jointed arch-rift-basalt column'});
 BIO.def('ar_rock_basalt',makeHexPrismGeo(59302,false),M.rockBasaltVC,{label:'Columnar basalt dike block'});
 BIO.def('ar_rock_vitrophyre',makeRockGeo(59303,0.68,true),M.rockVitrophyre,{label:'Chilled jet-black obsidian-vitrophyre shard block'});
 BIO.def('ar_rock_bolus',makeRockGeo(59304,0.74,true),M.rockBolus,{label:'Baked brick-red bolus contact rock'});
 BIO.def('ar_rock_sandstone',makeRockGeo(59305,0.78,false),M.rockSandstone,{label:'Tepui sandstone gorge boulder'});
 BIO.def('ar_rock_tuff',makeRockGeo(59306,0.76,false),M.rockTuff,{label:'Welded outland-tuff ledge block'});
 BIO.def('ar_rock_granite',makeRockGeo(59307,0.82,true),M.rockGranite,{label:'Frost-riven diapir granite boulder'});
 BIO.def('ar_rock_sinter',makeRockGeo(59308,0.52,false),M.rockSinter,{label:'Porous hydrothermal silica sinter lip'});

 // ---------------------------------------------------------------- tree & guild builders
 const TREE_CFG={
  columnarpine:{bucket:'ar_pine',fol:'ar_pine_fol',pal:PAL.pine,barkCol:0x785c48,H:[10,20],rK:0.028,tiers:6,droop:0.06,buttress:true,flatCrown:true,conifer:true},
  gorgehemlock:{bucket:'ar_pine',fol:'ar_hemlock_fol',pal:PAL.hemlock,barkCol:0x5e544c,H:[17,30],rK:0.021,tiers:8,droop:0.18,buttress:true,flatCrown:false,conifer:true},
  ledgeoak:{bucket:'ar_oak',fol:'ar_oak_fol',pal:PAL.oak,barkCol:0x6a5c50,H:[7,14],rK:0.032,tiers:5,droop:0.08,buttress:true,flatCrown:false,conifer:false},
  slotmulberry:{bucket:'ar_willow',fol:'ar_mulberry_fol',pal:PAL.mulberry,barkCol:0x6e6254,H:[5.6,10.2],rK:0.030,tiers:4,droop:0.04,buttress:false,flatCrown:false,conifer:false},
  amberpistache:{bucket:'ar_amber',fol:'ar_pistache_fol',pal:PAL.pistache,barkCol:0x8a5e3c,H:[5.5,11.0],rK:0.033,tiers:4,droop:0.06,buttress:true,flatCrown:false,conifer:false},
  spokedikejuniper:{bucket:'ar_juniper',fol:'ar_juniper_fol',pal:PAL.juniper,barkCol:0x68584a,H:[4.4,9.2],rK:0.034,tiers:5,droop:0.05,buttress:true,flatCrown:false,conifer:true}
 };

 ARACHNOIDS.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:0};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.14,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  // Cliff-wedged columnarpine leans 15-25 deg out toward chasm light!
  const leanX=(opt.leanX==null?0:opt.leanX)+0.04*(H(seed,3,0,0x301)-0.5);
  const leanZ=(opt.leanZ==null?0:opt.leanZ)+0.04*(H(seed,4,0,0x301)-0.5);
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=7,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=0.025*H0*Math.sin(t*3.6+(seed%13));
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed%7);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed%7);
    const ty=y-0.45+(H0+0.45)*t;
    const flare=1.0+0.58*Math.pow(Math.max(0,1.0-t/0.16),2);
    const rad=Math.max(0.05,r0*(1.0-0.80*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{seg:7});

   // Octagonal BIO.flareJoin root-buttresses straddling fractured basalt/tuff column tops
   if(cfg.buttress&&typeof BIO.flareJoin==='function'){
    const nRoot=kind==='columnarpine'?5:4;
    for(let k=0;k<nRoot;k++){
     const az=(k/nRoot)*TAU+0.35*H(seed,10+k,1,0x302);
     const rSpan=r0*(2.2+1.0*H(seed,10+k,2,0x302));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.42,y:y+r0*1.25,z:z+Math.sin(az)*r0*0.42,r:r0*0.40},
      {x:x+Math.cos(az)*rSpan*0.65,y:y+r0*0.28,z:z+Math.sin(az)*rSpan*0.65,r:r0*0.24},
      {x:x+Math.cos(az)*rSpan,y:y-0.60,z:z+Math.sin(az)*rSpan,r:r0*0.13}
     ],{parentR:r0,k:1.5,sink:0.55,len:1.8});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:5});
    }
   }

   const tiers=cfg.tiers,tStart=cfg.flatCrown?0.44:0.28;
   for(let ti=0;ti<tiers;ti++){
    const f=tStart+(0.95-tStart)*(ti/(tiers-1));
    const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
    const bx=lerp(trunk[idx].x,trunk[idx+1].x,tf);
    const by=lerp(trunk[idx].y,trunk[idx+1].y,tf);
    const bz=lerp(trunk[idx].z,trunk[idx+1].z,tf);
    const pR=lerp(trunk[idx].r,trunk[idx+1].r,tf);
    const nB=ti<tiers-2?4:3;
    for(let b=0;b<nB;b++){
     const sIdx=ti*8+b;
     const az=(b/nB)*TAU+ti*1.18+0.45*(H(seed,sIdx,1,0x303)-0.5);
     const span=(cfg.flatCrown?(0.55+0.58*Math.sin((ti/(tiers-1))*Math.PI)):cfg.conifer?(1.02-0.65*(ti/tiers)):0.86)*H0*(0.17+0.09*H(seed,sIdx,2,0x303));
     const rise=cfg.flatCrown?0.06*span:(-cfg.droop*span+0.14*span*(ti/tiers));
     const mx=bx+Math.cos(az)*span*0.52,my=by+rise*0.48+0.05*span,mz=bz+Math.sin(az)*span*0.52;
     const ex=bx+Math.cos(az)*span,ey=by+rise,ez=bz+Math.sin(az)*span;
     const br0=Math.max(0.04,pR*0.44);
     const limbPts=BIO.flareJoin([
      {x:bx,y:by,z:bz,r:br0},
      {x:mx,y:my,z:mz,r:br0*0.66},
      {x:ex,y:ey,z:ez,r:br0*0.34}
     ],{parentR:pR,k:1.55,sink:0.6,len:2.0});
     tris+=BIO.tube(cfg.bucket,limbPts,cfg.barkCol,{seg:5});

     const padS=clamp(span*0.86,1.3,5.8);
     const flatY=cfg.flatCrown?0.46:cfg.conifer?0.60:0.76;
     const col1=cfg.pal[(sIdx+seed)%cfg.pal.length];
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0,az,0),[padS,padS*flatY,padS],col1,{n:[Math.cos(az)*0.3,0.92,Math.sin(az)*0.3]});
     if(span>2.0){
      const col2=cfg.pal[(sIdx+1+seed)%cfg.pal.length];
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.1,0),[padS*0.76,padS*flatY*0.82,padS*0.76],col2,{n:[0,1,0]});
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const topS=clamp(H0*(cfg.flatCrown?0.24:0.16),1.5,5.2);
   BIO.put(cfg.fol,[topPt.x,topPt.y,topPt.z],qEuler(0,H(seed,99,1,0x306)*TAU,0),[topS,topS*(cfg.flatCrown?0.44:0.70),topS],cfg.pal[seed%cfg.pal.length],{n:[0,1,0]});
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0};
 };

 // Station 4 (frostrim): 0.88 atm updraft-sheared prostrate rimkrummholz banner locked radially away from chasm lip!
 ARACHNOIDS.growKrummholz=function(x,y,z,seed,shear){
  const yaw=shear.yawRad==null?Math.PI:shear.yawRad;
  const dx=Math.sin(yaw),dz=Math.cos(yaw);
  const H0=clamp(shear.prostrateH*(0.82+0.36*H(seed,1,0,0x311)),0.45,1.90);
  const bLen=clamp(shear.bannerLenM*(0.88+0.28*H(seed,2,0,0x311)),1.80,3.85);
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   const pts=BIO.flareJoin([
    {x:x,y:y-0.28,z:z,r:0.16},
    {x:x+dx*bLen*0.38,y:y+H0*0.62,z:z+dz*bLen*0.38,r:0.11},
    {x:x+dx*bLen*0.92,y:y+H0*0.78,z:z+dz*bLen*0.92,r:0.05}
   ],{parentR:0.18,k:1.4,sink:0.4,len:1.4});
   BIO.tube('ar_juniper',pts,0x645448,{seg:5});
   for(let k=0;k<4;k++){
    const u=0.35+0.20*k,segF=u*(pts.length-1),si=Math.min(pts.length-2,Math.floor(segF)),sf=segF-si;
    const pa=pts[si],pb=pts[si+1];
    const px=lerp(pa.x,pb.x,sf),py=lerp(pa.y,pb.y,sf),pz=lerp(pa.z,pb.z,sf);
    const w=0.85+0.42*(1.0-0.18*k);
    const col=PAL.krummholz[(seed+k)%PAL.krummholz.length];
    BIO.put('ar_krumm_fol',[px,py,pz],qEuler(0,yaw,0),[w*0.85,H0*0.42,w*1.35],col,{n:[dx*0.35,0.9,dz*0.35]});
   }
  }finally{BIO.owner=ownPrev;}
  return{H:H0,bannerLenM:bLen,yawRad:yaw};
 };

 // Station 4 (frostrim): Snowbed Prostrate Dwarf-Birch (strictly <= 1.10 m height!)
 ARACHNOIDS.growDwarfBirch=function(x,y,z,seed,yawRad){
  const yaw=yawRad==null?0:yawRad;
  const dx=Math.sin(yaw),dz=Math.cos(yaw);
  const H0=clamp(0.34+0.68*H(seed,1,0,0x314),0.32,1.05);
  const span=0.85+0.95*H(seed,2,0,0x314);
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   for(let b=0;b<3;b++){
    const az=yaw+(b-1)*0.68+0.20*(H(seed,b,3,0x314)-0.5);
    const bx=Math.sin(az),bz=Math.cos(az);
    const pts=[
     {x:x,y:y-0.12,z:z,r:0.048},
     {x:x+bx*span*0.48,y:y+H0*0.52,z:z+bz*span*0.48,r:0.032},
     {x:x+bx*span,y:y+H0*0.76,z:z+bz*span,r:0.018}
    ];
    BIO.tube('ar_juniper',pts,0x5a4c42,{seg:4});
    const w=0.62+0.34*H(seed,b,4,0x314);
    const pmx=0.5*(pts[1].x+pts[2].x),pmy=0.5*(pts[1].y+pts[2].y),pmz=0.5*(pts[1].z+pts[2].z);
    BIO.put('ar_dwarfbirch_fol',[pmx,pmy,pmz],qEuler(0,az,0),[w,H0*0.56,w],PAL.dwarfBirch[(seed+b)%PAL.dwarfBirch.length],{n:[dx*0.2,0.96,dz*0.2]});
   }
  }finally{BIO.owner=ownPrev;}
  return{H:H0};
 };

 // Zone 1 (nexus & fumarole): Steambed Megaphyll Taro (steambedtaro, 0.75-1.35 m) & Mist-Bench Canyon Tea (mistcanyontea, 0.95-1.65 m)
 ARACHNOIDS.growTaroClump=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(0.78+0.52*H(seed,1,0,0x316))*sc;
  for(let k=0;k<3;k++){
   const az=(k/3)*TAU+0.35*H(seed,k,2,0x316);
   const rOff=0.14+0.12*H(seed,k,3,0x316);
   const bs=H0*(0.78+0.22*H(seed,k,4,0x316));
   BIO.put('ar_taro_leaf',[x+Math.cos(az)*rOff,y+bs*0.44,z+Math.sin(az)*rOff],qEuler(0.22,az,0),[bs*0.95,bs,bs*0.95],PAL.taro[(seed+k)%PAL.taro.length]);
  }
  return{H:H0};
 };

 ARACHNOIDS.growTeaShrub=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(0.96+0.64*H(seed,1,0,0x318))*sc;
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   for(let b=0;b<3;b++){
    const az=(b/3)*TAU+0.4*H(seed,b,2,0x318);
    const sp=0.36+0.24*H(seed,b,3,0x318);
    BIO.tube('ar_willow',[
     {x:x,y:y-0.14,z:z,r:0.052},
     {x:x+Math.cos(az)*sp,y:y+H0*0.62,z:z+Math.sin(az)*sp,r:0.024}
    ],0x5c5044,{seg:4});
    const ls=H0*(0.62+0.18*H(seed,b,4,0x318));
    BIO.put('ar_tea_fol',[x+Math.cos(az)*sp*0.85,y+H0*0.64,z+Math.sin(az)*sp*0.85],qEuler(0,az,0),[ls,ls*0.82,ls],PAL.tea[(seed+b)%PAL.tea.length]);
   }
  }finally{BIO.owner=ownPrev;}
  return{H:H0};
 };

 // Zone 2 (ledges & upper nexus): Vitrophyre Glass-Dike Lip-Fern (vitrophyrelipfern, 0.32-0.65 m rosette)
 ARACHNOIDS.growLipFern=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const fl=(0.34+0.28*H(seed,1,0,0x319))*sc;
  for(let k=0;k<6;k++){
   const az=(k/6)*TAU+0.22*H(seed,k,2,0x319);
   BIO.put('ar_lipfern',[x,y+0.04,z],qEuler(0,az,-0.18+0.12*H(seed,k,3,0x319)),[fl,fl*0.84,fl*0.80],PAL.lipFern[(seed+k)%PAL.lipFern.length]);
  }
  return{H:fl*0.82};
 };

 // Station 2 (fumarole): Steam-Plume Tree-Fern (fumarolefern, 3.2-7.0 m)
 ARACHNOIDS.growFumaroleFern=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=(3.4+3.4*H(seed,1,0,0x321))*sc;
  const yaw=H(seed,2,0,0x321)*TAU;
  BIO.put('ar_fern_trunk',[x,y-0.18,z],qEuler(0,yaw,0),[0.92*sc,H0,0.92*sc],0x543c2c);
  const topX=x+Math.cos(yaw)*0.10*H0,topY=y-0.18+H0*0.97,topZ=z-Math.sin(yaw)*0.10*H0;
  const nFr=10;
  for(let k=0;k<nFr;k++){
   const az=(k/nFr)*TAU+0.16*H(seed,k,3,0x321);
   const fl=(2.1+1.2*H(seed,k,4,0x321))*sc;
   const pitch=-0.26+0.20*H(seed,k,5,0x321);
   BIO.put('ar_fern_frond',[topX,topY,topZ],qEuler(0,az,pitch),[fl,fl*0.86,fl*0.80],PAL.fumaroleFern[(seed+k)%PAL.fumaroleFern.length]);
  }
  return{H:H0};
 };

 // Stations 1-3: Gum-Pad Chasm Creeper (webanchorvine, 4-18 m liana with amber adhesive discs)
 ARACHNOIDS.growWebVine=function(x,y0,z,nx,nzN,seed,heightM){
  const H0=clamp(heightM==null?8.5:heightM,4.2,16.5);
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   const pts=[];
   for(let i=0;i<=6;i++){
    const t=i/6;
    const lat=0.65*Math.sin(t*4.5+(seed%11));
    const vx=x+nx*0.08-nzN*lat;
    const vz=z+nzN*0.08+nx*lat;
    const vy=y0+H0*t;
    pts.push({x:vx,y:vy,z:vz,r:0.065*(1.0-0.45*t)});
    if(i>=1&&i<=5){
     // Offset adhesive pad >= 0.04 m along outward cliff normal so zero z-fighting
     const yaw=Math.atan2(nx,nzN);
     BIO.put('ar_vine_pad',[vx+nx*0.05,vy,vz+nzN*0.05],qEuler(Math.PI*0.5,yaw,0),[0.34,0.22,0.34],PAL.vinePad[(seed+i)%PAL.vinePad.length]);
     BIO.put('ar_vine_leaf',[vx+nx*0.24,vy+0.15,vz+nzN*0.24],qEuler(0,yaw+i,0),[1.05,0.85,1.05],PAL.vineLeaf[(seed+i)%PAL.vineLeaf.length]);
    }
   }
   BIO.tube('ar_juniper',pts,0x58483a,{seg:5});
  }finally{BIO.owner=ownPrev;}
 };

 // ---------------------------------------------------------------- 0.75 g ATMOS wind-pinned communal Bridge-Web batch builder
 ARACHNOIDS.createBridgeWebBatch=function(sceneRef){
  const batches={
   sheet:{pos:[],nrm:[],uv:[],col:[],flut:[],idx:[],n:0,mat:M.silkSheet,label:'Tsek-Ma Communal Multi-Tier Catenary Capture-Sheet (0.75 g, ATMOS wind-pinned)'},
   cable:{pos:[],nrm:[],uv:[],col:[],flut:[],idx:[],n:0,mat:M.silkCable,label:'Braided Golden-Gunmetal Chasm Hawser & Guy-Stay Rigging'}
  };
  const audit=ARACHNOIDS.WEB_AUDIT;
  audit.anchors=0;audit.pinnedZero=0;audit.bellies=0;audit.maxAnchorDrift=0;
  audit.minBellyDisp=1e9;audit.spans=0;audit.minWaterClearM=1e9;audit.maxAnchorGapM=0;
  ARACHNOIDS.WEB_SPANS.length=0;

  function recordPin(wx,wy,wz,fx,fy,fz,isAnchor,isBelly){
   if(isAnchor){
    audit.anchors++;
    const d=ARACH_PHYS.displaceSilk(wx,wy,wz,fx,fy,fz,11.2,16.0,-7.5,1.0);
    const mag=Math.hypot(d[0],d[1],d[2]);
    if(Math.hypot(fx,fy,fz)===0&&mag===0)audit.pinnedZero++;
    if(mag>audit.maxAnchorDrift)audit.maxAnchorDrift=mag;
   }else if(isBelly){
    audit.bellies++;
    const d=ARACH_PHYS.displaceSilk(wx,wy,wz,fx,fy,fz,11.2,6.2,-2.8,0.65);
    const mag=Math.hypot(d[0],d[1],d[2]);
    if(mag<audit.minBellyDisp)audit.minBellyDisp=mag;
   }
  }

  function pushCable(pts,r,colRgb,fluts){
   const B=batches.cable,seg=5,m=pts.length;
   if(m<2)return;
   const base=B.n;
   for(let i=0;i<m;i++){
    const p=pts[i],pPrev=pts[Math.max(0,i-1)],pNext=pts[Math.min(m-1,i+1)];
    let dx=pNext[0]-pPrev[0],dy=pNext[1]-pPrev[1],dz=pNext[2]-pPrev[2];
    const dl=Math.hypot(dx,dy,dz),inv=dl>1e-6?1/dl:1;
    dx*=inv;dy*=inv;dz*=inv;
    let ux=-dz,uy=0,uz=dx,ul=Math.hypot(ux,uy,uz);
    if(ul<1e-4){ux=1;uy=0;uz=0;ul=1;}
    ux/=ul;uz/=ul;
    const vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;
    const fl=fluts?fluts[i]:[0,0,0];
    for(let s=0;s<=seg;s++){
     const ang=(s/seg)*TAU,ca=Math.cos(ang),sa=Math.sin(ang);
     const nx=ux*ca+vx*sa,ny=uy*ca+vy*sa,nz=uz*ca+vz*sa;
     B.pos.push(p[0]+nx*r,p[1]+ny*r,p[2]+nz*r);
     B.nrm.push(nx,ny,nz);
     B.uv.push(s/seg,i*0.65);
     B.col.push(colRgb[0],colRgb[1],colRgb[2]);
     B.flut.push(fl[0],fl[1],fl[2]);
    }
   }
   for(let i=0;i<m-1;i++){
    for(let s=0;s<seg;s++){
     const a=base+i*(seg+1)+s,b=a+seg+1;
     B.idx.push(a,b,a+1,a+1,b,b+1);
    }
   }
   B.n+=m*(seg+1);
  }

  // Build one multi-tier horizontal & catenary communal Bridge-Web between solid basalt dike walls a and b
  function addBridgeWeb(spec,tH,wH){
   const ax=spec.a[0],az=spec.a[2],bx=spec.b[0],bz=spec.b[2];
   // Lock both endpoints directly onto solid rock surface (gap === 0.00 m <= 0.15 m!)
   const rockYA=tH(ax,az),rockYB=tH(bx,bz);
   const ay=Math.min(rockYA-0.35,Math.max(rockYA-4.5,spec.a[1]));
   const by=Math.min(rockYB-0.35,Math.max(rockYB-4.5,spec.b[1]));
   const aPt=[ax,ay,az],bPt=[bx,by,bz];
   const midX=0.5*(ax+bx),midZ=0.5*(az+bz);
   const waterMid=Math.max(wH(midX,midZ),-14.0);
   const invMid=ARACH_PHYS.inversionAt(midX,midZ,0.5*(ay+by),typeof SITE!=='undefined'?SITE:ARACH_SITES.nexus);
   const gapA=Math.max(0,ay-rockYA),gapB=Math.max(0,by-rockYB);

   const ws=ARACH_PHYS.webSpanAt(aPt,bPt,7.4,{
    waterY:waterMid,
    updraftMs:invMid.updraftMs,
    frost01:invMid.frost01,
    aslM:invMid.aslM,
    anchorGapAM:gapA,
    anchorGapBM:gapB
   });
   if(!ws.validSpan)return null;

   const dx=bx-ax,dz=bz-az,L=Math.max(1.0,Math.hypot(dx,dz));
   const tx=dx/L,tz=dz/L,nx=-tz,nzN=tx;
   const tiers=spec.tiers==null?ws.tierCount:spec.tiers;
   const halfDeckW=2.45;
   const NU=28,NV=6;
   const tierStepY=1.85;
   const topRailL=[],topRailR=[],botRailL=[],botRailR=[];
   const topFlut=[],botFlut=[];

   // Horizontal multi-tier catenary capture decks (tiers = 2..4)
   for(let ti=0;ti<tiers;ti++){
    const B=batches.sheet,base=B.n;
    const tierOffY=-ti*tierStepY;
    const deckW=halfDeckW*(1.0-0.12*ti);
    for(let iu=0;iu<=NU;iu++){
     const u=iu/NU;
     const sCoord=(u-0.5)*L;
     const catSag=ws.catenaryAM*(Math.cosh(sCoord/ws.catenaryAM)-1.0);
     const maxSag=ws.sagM;
     // Exact catenary y(u) = linear(ay, by, u) - (maxSag - catSag)
     const yCenter=lerp(ay,by,u)-(maxSag-catSag)+tierOffY;
     const cx=lerp(ax,bx,u),cz=lerp(az,bz,u);

     for(let iv=0;iv<=NV;iv++){
      const v=iv/NV,lat=(v-0.5)*2.0*deckW;
      const crossDip=0.22*Math.sin(Math.PI*v)*Math.sin(Math.PI*u);
      const px=cx+nx*lat,py=yCenter-crossDip,pz=cz+nzN*lat;
      const pin=ARACH_PHYS.silkPinWeight('bridgeweb',u,v);
      const fx=nx*pin*0.58,fy=0.14*pin,fz=nzN*pin*0.58;
      B.pos.push(px,py,pz);
      B.nrm.push(0,1,0);
      B.uv.push(u*(L/5.5),v*1.6);
      // Golden-gunmetal iridescent silk tint
      const gunmetal=0.74+0.24*Math.cos((v-0.5)*Math.PI*2);
      B.col.push(0.92*gunmetal,0.82*gunmetal,0.56+0.18*(1.0-gunmetal));
      B.flut.push(fx,fy,fz);

      const isAnc=(iu===0||iu===NU);
      const isBel=(ti===0&&iu===14&&iv===3);
      recordPin(px,py,pz,fx,fy,fz,isAnc,isBel);

      if(ti===0&&iv===0){topRailL.push([px,py,pz]);topFlut.push([fx,fy,fz]);}
      if(ti===0&&iv===NV){topRailR.push([px,py,pz]);}
      if(ti===tiers-1&&iv===0){botRailL.push([px,py,pz]);botFlut.push([fx,fy,fz]);}
      if(ti===tiers-1&&iv===NV){botRailR.push([px,py,pz]);}
     }
    }
    for(let iu=0;iu<NU;iu++)for(let iv=0;iv<NV;iv++){
     const a0=base+iu*(NV+1)+iv,b0=a0+NV+1;
     B.idx.push(a0,b0,a0+1,a0+1,b0,b0+1);
    }
    B.n+=(NU+1)*(NV+1);
   }

   // Primary golden-gunmetal braided catenary edge hawsers & vertical inter-tier hangers
   pushCable(topRailL,0.075,[0.94,0.80,0.42],topFlut);
   pushCable(topRailR,0.075,[0.94,0.80,0.42],topFlut);
   if(tiers>1){
    pushCable(botRailL,0.052,[0.78,0.74,0.58],botFlut);
    pushCable(botRailR,0.052,[0.78,0.74,0.58],botFlut);
    for(let hIdx=4;hIdx<=NU-4;hIdx+=4){
     pushCable([topRailL[hIdx],botRailL[hIdx]],0.026,[0.90,0.82,0.52],[topFlut[hIdx],botFlut[hIdx]]);
     pushCable([topRailR[hIdx],botRailR[hIdx]],0.026,[0.90,0.82,0.52],[topFlut[hIdx],botFlut[hIdx]]);
    }
   }

   // 4 diagonal rock-pinned guy-stays anchored strictly onto solid rock (flut = [0,0,0] at wall!)
   const g1=Math.round(NU*0.18),g2=Math.round(NU*0.82);
   const stayPts=[
    [ax+nx*5.8,tH(ax+nx*5.8,az+nzN*5.8)-0.25,az+nzN*5.8,topRailR[g1],topFlut[g1]],
    [ax-nx*5.8,tH(ax-nx*5.8,az-nzN*5.8)-0.25,az-nzN*5.8,topRailL[g1],topFlut[g1]],
    [bx+nx*5.8,tH(bx+nx*5.8,bz+nzN*5.8)-0.25,bz+nzN*5.8,topRailR[g2],topFlut[g2]],
    [bx-nx*5.8,tH(bx-nx*5.8,bz-nzN*5.8)-0.25,bz-nzN*5.8,topRailL[g2],topFlut[g2]]
   ];
   for(let si=0;si<stayPts.length;si++){
    const st=stayPts[si];
    recordPin(st[0],st[1],st[2],0,0,0,true,false);
    pushCable([[st[0],st[1],st[2]],st[3]],0.042,[0.92,0.78,0.40],[[0,0,0],st[4]]);
   }

   // Normal-offset (>= 0.04 m) silk anchor collars on both basalt dike faces + colonial Tsek-Ma cocoon/weaver nodes
   BIO.put('ar_web_collar',[ax+tx*0.06,ay,az+tz*0.06],qEuler(0,Math.atan2(tx,tz),0),[1.35,0.75,1.35],0xe6cb78);
   BIO.put('ar_web_collar',[bx-tx*0.06,by,bz-tz*0.06],qEuler(0,Math.atan2(-tx,-tz),0),[1.35,0.75,1.35],0xe6cb78);
   for(let ci=6;ci<=NU-6;ci+=8){
    const cp=topRailL[ci];
    BIO.put('ar_spider_cocoon',[cp[0],cp[1]-0.28,cp[2]],qEuler(0,ci*1.1,0),[0.46,0.46,0.46],0xd8c074);
   }

   audit.spans++;
   const lowestBottom=ws.lowestY-(tiers-1)*tierStepY;
   const clearW=lowestBottom-waterMid;
   if(clearW<audit.minWaterClearM)audit.minWaterClearM=+clearW.toFixed(2);
   if(ws.anchorGapMaxM>audit.maxAnchorGapM)audit.maxAnchorGapM=ws.anchorGapMaxM;
   const rec=Object.assign({id:spec.id,a:aPt,b:bPt},ws,{clearBottomWaterM:+clearW.toFixed(2)});
   ARACHNOIDS.WEB_SPANS.push(rec);
   return rec;
  }

  function finalize(){
   const out=[];
   Object.keys(batches).forEach(k=>{
    const B=batches[k];
    if(!B.idx.length)return;
    const g=new T3.BufferGeometry();
    g.setAttribute('position',new T3.Float32BufferAttribute(B.pos,3));
    g.setAttribute('normal',new T3.Float32BufferAttribute(B.nrm,3));
    g.setAttribute('uv',new T3.Float32BufferAttribute(B.uv,2));
    g.setAttribute('color',new T3.Float32BufferAttribute(B.col,3));
    g.setAttribute('aFlut',new T3.Float32BufferAttribute(B.flut,3));
    g.setIndex(B.n>65535?new T3.Uint32BufferAttribute(B.idx,1):new T3.Uint16BufferAttribute(B.idx,1));
    g.computeBoundingSphere();
    const mesh=new T3.Mesh(g,B.mat);
    mesh.name='arachnoids:bridgeweb-'+k;
    mesh.userData.host=true;
    mesh.userData.silkBatch=k;
    mesh.userData.inspectLabel=B.label;
    mesh.renderOrder=k==='cable'?1:3;
    sceneRef.add(mesh);
    out.push(mesh);
   });
   return out;
  }

  return{addBridgeWeb:addBridgeWeb,pushCable:pushCable,finalize:finalize};
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 5 m trees
 if(BIO.impostorSet&&BIO.impostor&&BIO.impostorItem){
  const impKeys=['columnarpine','gorgehemlock','ledgeoak','slotmulberry','amberpistache','spokedikejuniper'];
  const IMP_SET=ARACHNOIDS.IMP_SET=BIO.impostorSet('arachnoids-trees',{grid:4,cell:48,slots:impKeys.length});
  ARACHNOIDS.IMP={};
  impKeys.forEach(tk=>{
   ARACHNOIDS.IMP[tk]=BIO.impostor('arachnoids-'+tk,()=>{
    ARACHNOIDS.growTree(tk,0,0,0,7900+tk.length*29,1.0,{});
   },{set:IMP_SET,label:byKey[tk]?byKey[tk].name:tk});
  });
  BIO.impostorItem('ar_tree_imp',IMP_SET,{label:'Canyon & colonnade ledge tree far impostors'});
 }
})();
