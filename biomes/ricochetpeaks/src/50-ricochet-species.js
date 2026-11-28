// ================================================================= RICOCHET PEAKS — 9 native species, library materials, BIO.flareJoin trees & impostors ([draw])
// Registers BIO.kit('ricochetpeaks') -> RICOCHET (PLAN.md section 4.1):
//   1. crater_spruce      (20-38 m narrow spire Black-Cone Crater Spruce; BIO.flareJoin; kin nhighlands)
//   2. shatter_larch      (18-32 m deciduous Shatter-Cone Gold Larch; BIO.variantPool green + autumn gold; kin nwouterwall)
//   3. glass_pine         (6-16 m twisted copper-barked Tagamite Melt-Pine on black impact-glass; BIO.leanTo; kin nwouterwall)
//   4. ejecta_birch       (10-22 m Chalk-Bark Pioneer Birch colonizing avalanche talus & clearings; kin nhighlands)
//   5. vent_willow        (3-8 m Fumarole Plume-Willow forming frost-free thickets in hydrothermal steam; kin highrift)
//   6. nickel_heather     (0.3-0.8 m metallic-blue Meteoric Bell-Heath over Fe-Ni impactor fragments; kin highrift)
//   7. shock_lichen       (silver-gold Star-Burst Reindeer Moss carpet on black suevite gravel; kin nwouterwall)
//   8. frost_hollow_sedge (0.5-1.1 m Cold-Pool Tussock surviving -25 C crater-bottom inversions; kin highrift)
//   9. steam_moss         (emerald Cryofumarole Ice-Moss & sinter mat in Erebus ice chimneys & hot vents; kin geyser)
BIO.kit('ricochetpeaks');
var RICOCHET={
 PHYS:RICOCHET_PHYS,
 SITES:RICOCHET_SITES,
 CROPS:RICOCHET_CROPS,
 FAUNA:RICOCHET_FAUNA,
 PLACED:[],
 CROWNS:[]
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 RICOCHET.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:true
 },o||{});
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=RICOCHET.PAL={
  spruce:[0x1f4534,0x27503d,0x193b2c,0x2f5a44],
  larchGreen:[0x3f6e38,0x4c7c42,0x366030],
  larchGold:[0xd89a28,0xe6ac32,0xc8861e,0xf0be42],
  pine:[0x285438,0x326042,0x224830,0x3c6a48],
  birch:[0x52803a,0x629044,0xd4a432,0xc49428],
  willow:[0x387a48,0x468a56,0x2e6c3e],
  nickelHeather:[0x3e6ea8,0x4c82be,0x5e94cf,0x345e96],
  fireweed:[0xb83878,0xc84688,0x6e883e],
  lichen:[0xd6d4c4,0xe2dfd0,0xc8c4b0,0xd8ce9e],
  sedge:[0x8c8448,0x9e9454,0x78723e,0xa89252],
  steamMoss:[0x2e8648,0x3c9854,0x24743c,0x52a85e],
  sinterMat:[0xc88a32,0xd8a23e,0x588a62],
  suevite:[0x6c6862,0x7a756e,0x5c5852],
  tagamite:[0x22242a,0x2c2f36,0x1b1d22],
  nickelBell:[0x5896dc,0x6caaff,0x4680c4]
 };

 // ---------------------------------------------------------------- 9 native species roster
 const SPECIES=RICOCHET.SPECIES=[
  {key:'crater_spruce',name:'Black-Cone Crater Spruce (Picea ricochetensis)',
   how:'Narrow 20-38 m spire conifer shedding heavy crater snow, dark blue-green needles absorbing low-angle ring-shadow sky light across thermal-belt aprons.',
   items:['rp_spruce_fol','rp_log'],tags:K('boreal','humid','no',['Dfb','Dfc'],'thermal_taiga',{kin:'nhighlands'})},
  {key:'shatter_larch',name:'Shatter-Cone Gold Larch (Larix impacta)',
   how:'Deciduous 18-32 m boreal conifer turning fiery autumn gold across suevite crater walls and rebound islands.',
   items:['rp_larch_fol','rp_larch_fol_gold'],tags:K('boreal','subhumid','no',['Dfb','Dfc'],'thermal_taiga',{kin:'nwouterwall'})},
  {key:'glass_pine',name:'Tagamite Melt-Pine (Pinus vitrifragrans)',
   how:'Twisted 6-16 m copper-barked five-needle pine whose organic-acid roots crack jet-black tagamite impact-glass pavements and wind-swept notch crags.',
   items:['rp_pine_fol'],tags:K('boreal','semiarid','no',['Dfc','ET'],'tagamite_barren',{kin:'nwouterwall'})},
  {key:'ejecta_birch',name:'Chalk-Bark Pioneer Birch (Betula suevitica)',
   how:'Graceful 10-22 m chalk-white pioneer broadleaf colonizing fresh avalanche talus, Yuni clearings, and warm lake margins alongside fireweed.',
   items:['rp_birch_fol','rp_fern'],tags:K('boreal','humid','both',['Dfb','Dfc'],'thermal_taiga',{kin:'nhighlands'})},
  {key:'vent_willow',name:'Fumarole Plume-Willow (Salix fumarolica)',
   how:'Lush 3-8 m multi-stem emerald shrub forming frost-free thickets bathed in the warm condensing steam of East Hearth Crater.',
   items:['rp_willow_fol'],tags:K('boreal','humid','yes',['Dfb','Dfc'],'hydrothermal_oasis',{kin:'highrift'})},
  {key:'nickel_heather',name:'Meteoric Bell-Heath (Calluna meteoritica)',
   how:'Compact 0.3-0.8 m cushion shrub hyperaccumulating meteoritic nickel and iron into metallic-blue bells — Yuni Geomancers indicator plant for impactor ore.',
   items:['rp_heather','rp_nickel_bell'],tags:K('boreal','subhumid','no',['Dfc'],'tagamite_barren',{kin:'highrift'})},
  {key:'shock_lichen',name:'Star-Burst Reindeer Moss (Cladonia suevitica)',
   how:'Pale silver-gold radial cushion lichen blanketing frost-cracked black suevite gravel and shatter-cone boulder aprons.',
   items:['rp_lichen_mat','rp_lichen_cushion'],tags:K('boreal','semiarid','no',['Dfc','ET'],'tagamite_barren',{kin:'nwouterwall'})},
  {key:'frost_hollow_sedge',name:'Cold-Pool Tussock Sedge (Carex katabatica)',
   how:'Dense 0.5-1.1 m insulated tussock sedge thriving in -25 C nighttime katabatic frost hollows on unheated crater bottoms where trees freeze out.',
   items:['rp_sedge'],tags:K('boreal','humid','yes',['Dfb','Dfc','ET'],'frost_hollow',{kin:'highrift'})},
  {key:'steam_moss',name:'Cryofumarole Ice-Moss (Bryum erebus)',
   how:'Luminous emerald bryophyte and thermophile mat lining the warm inner rims of 5,100 m Erebus steam-ice chimneys and East Hearth sinter terraces.',
   items:['rp_moss','rp_sinter_cushion'],tags:K('polar','humid','yes',['ET','Dfb','Dfc'],'cryofumarole_mouth',{kin:'geyser'})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 RICOCHET.HARVEST={
  crater_spruce:HV('timber, resin',['spruce tips'],true,'Straight Yuni pioneer house-logs & bandit notch palisades; antiscorbutic spruce-beer tips.'),
  shatter_larch:HV('timber, shingle',[],false,'Rot-proof steep snow-shedding Yuni roof shingles and meteoritic placer sluice-boxes.'),
  glass_pine:HV('timber, pitch',['pine nuts'],false,'Rich edible pine-nuts and amber-clear optical pitch glue prized by Yuni mosaicists.','nut'),
  ejecta_birch:HV('timber, bark',['birch syrup'],true,'Tapped by Yuni homesteaders for sweet spring birch-syrup; waterproof betulin bark tar.'),
  vent_willow:HV('withes',[],true,'Salicin fever-bark steeped at East Hearth bath-claims; flexible basket & snowshoe withes.'),
  nickel_heather:HV('none',[],false,'Calcined metallic-blue bells yield cobalt-nickel ceramic glaze flux and mark buried meteoric iron.','reagent'),
  shock_lichen:HV('none',['lichen flour'],false,'Leached emergency winter flour and prime winter browse for Crater Caribou and pack-mules.'),
  frost_hollow_sedge:HV('none',[],false,'Cut and dried into double-wall thermal insulation thatch for Yuni frontier roofs and bandit boots.'),
  steam_moss:HV('none',[],true,'Warm mineral-rich bryophyte poultice used on frostbite and scalds around fumarole refuges.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=RICOCHET.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 RICOCHET.byKey=byKey;
 RICOCHET.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 RICOCHET.plantOfItem=RICOCHET.speciesOfItem;

 RICOCHET.GATHER={
  pasture:{thermal_taiga:0.46,frost_hollow:0.54,hydrothermal_oasis:0.68,tagamite_barren:0.22,rim_krummholz:0.18,cryofumarole_et:0.08},
  fish:{thermal_taiga:0.62,frost_hollow:0.48,hydrothermal_oasis:0.74,tagamite_barren:0.35,rim_krummholz:0.0,cryofumarole_et:0.0}
 };
 RICOCHET.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in RICOCHET.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*RICOCHET.GATHER.pasture[k];
  for(const k in RICOCHET.GATHER.fish)f+=(Z[k]==null?0:Z[k])*RICOCHET.GATHER.fish[k];
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
  g.fillStyle='rgba(216,234,212,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[176,202,172]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ricochetpeaks',slot):null;
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

 // ---------------------------------------------------------------- RICOCHET.M material table (100% mapped to materials.json)
 const M=RICOCHET.M={
  'bark.spruce':BIO.barkMat(grey(128,11)),
  'bark.larch':BIO.barkMat(grey(128,12)),
  'bark.pine':BIO.barkMat(grey(128,13)),
  'bark.birch':BIO.barkMat(grey(128,14)),
  'bark.willow':BIO.barkMat(grey(128,15)),
  'wood.log':BIO.barkMat(grey(128,16)),
  woodCedar:pbrMat('wood.cedar',17,{roughness:0.66,metalness:0.02,vertexColors:false,color:0xd4ba96}),
  roofShingle:pbrMat('roof.shingle',18,{roughness:0.62,metalness:0.02,vertexColors:false,color:0x8a6c52}),

  rockSuevite:pbrMat('rock.suevite',21,{roughness:0.54,metalness:0.06}),
  stoneTagamite:pbrMat('stone.tagamite',22,{roughness:0.18,metalness:0.10,color:0x585e68}),
  stoneSinter:pbrMat('stone.sinter',23,{roughness:0.34,metalness:0.04,color:0xecf2f4}),
  iceChimney:pbrMat('ice.chimney',24,{roughness:0.20,metalness:0.06,color:0xdcf0fa,emissive:0x0a1c28,emissiveIntensity:0.14}),
  earthYuni:pbrMat('earth.yuni',25,{roughness:0.74,metalness:0.02,vertexColors:false,color:0xd8bea2}),
  mosaicYuni:pbrMat('mosaic.yuni',26,{roughness:0.22,metalness:0.08,vertexColors:false,color:0xffffff}),
  oreIron:pbrMat('ore.iron',27,{roughness:0.42,metalness:0.44,vertexColors:false}),
  oreNickel:pbrMat('ore.nickel',28,{roughness:0.26,metalness:0.78,vertexColors:false,color:0xc8d4de}),
  oreQuartz:pbrMat('ore.quartz',29,{roughness:0.30,metalness:0.08,vertexColors:false}),
  oreGold:pbrMat('ore.gold',30,{roughness:0.20,metalness:0.88,vertexColors:false,color:0xf4c848}),

  // Stem-anchored foliage cutout cards (exact materials.json keys; shared BIO._leafKey program classes)
  spruce:BIO.leafMat(cardFallback(51),'rp-spruce',{aN:true,swayW:'0.50',swayA:0.05}),
  larch:BIO.leafMat(cardFallback(52),'rp-larch',{aN:true,swayW:'0.50',swayA:0.05}),
  larchgold:BIO.leafMat(cardFallback(53),'rp-larchgold',{aN:true,swayW:'0.50',swayA:0.05}),
  pine:BIO.leafMat(cardFallback(54),'rp-pine',{aN:true,swayW:'0.50',swayA:0.05}),
  birch:BIO.leafMat(cardFallback(55),'rp-birch',{aN:true,swayW:'0.50',swayA:0.05}),
  willow:BIO.leafMat(cardFallback(56),'rp-willow',{aN:true,swayW:'0.50',swayA:0.05}),
  heather:BIO.leafMat(cardFallback(57),'rp-heather',{aN:false,swayW:'(position.y)',swayA:0.05}),
  sedge:BIO.leafMat(cardFallback(58),'rp-sedge',{aN:false,swayW:'(position.y)',swayA:0.05}),
  fern:BIO.leafMat(cardFallback(59),'rp-fern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  moss:BIO.leafMat(cardFallback(60),'rp-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 RICOCHET.SWAP=BIO.libSwap('ricochetpeaks',M);

 if(typeof RP_VSTACK!=='undefined'){
  RP_VSTACK.applyRoughAA(M.stoneTagamite,'tagamite',[0.002,0.008,0.020,0.046,0.086,0.136,0.186,0.236],512.0);
  RP_VSTACK.applyRoughAA(M.rockSuevite,'suevite',[0.003,0.011,0.028,0.058,0.102,0.155,0.205,0.255],512.0);
  RP_VSTACK.applyRoughAA(M.stoneSinter,'sinter',[0.003,0.010,0.025,0.054,0.096,0.148,0.198,0.248],512.0);
  RP_VSTACK.applyRoughAA(M.iceChimney,'icechimney',[0.002,0.008,0.021,0.047,0.088,0.138,0.188,0.238],512.0);
  RP_VSTACK.applyRoughAA(M.oreNickel,'orenickel',[0.002,0.007,0.018,0.042,0.078,0.125,0.172,0.220],256.0);
 }

 // ---------------------------------------------------------------- merged bark buckets
 BIO.bucket('rp_spruce',M['bark.spruce'],{label:'Black-cone crater spruce straight trunks & snow-shedding boughs'});
 BIO.bucket('rp_larch',M['bark.larch'],{label:'Shatter-cone gold larch furrowed trunks & limbs'});
 BIO.bucket('rp_pine',M['bark.pine'],{label:'Tagamite melt-pine twisted copper-bark trunks & acid roots'});
 BIO.bucket('rp_birch',M['bark.birch'],{label:'Chalk-bark pioneer birch trunks & limbs'});
 BIO.bucket('rp_willow',M['bark.willow'],{label:'Fumarole plume-willow multi-stem thickets'});

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

 // ---------------------------------------------------------------- single-line BIO.def cutout & 3D items (100% leaf-stems compliant)
 BIO.def('rp_spruce_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Black-cone crater spruce needle sprays'});
 BIO.def('rp_larch_fol',BIO.geo.clump(),M.larch,{attrs:['aN'],label:'Shatter-cone larch green needle sprays'});
 BIO.def('rp_larch_fol_gold',BIO.geo.clump(),M.larchgold,{attrs:['aN'],label:'Shatter-cone gold larch autumn sprays'});
 BIO.def('rp_pine_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Tagamite melt-pine five-needle tufts'});
 BIO.def('rp_birch_fol',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Chalk-bark pioneer birch crown'});
 BIO.def('rp_willow_fol',BIO.geo.clump(),M.willow,{attrs:['aN'],label:'Fumarole plume-willow emerald foliage'});
 BIO.def('rp_heather',BIO.geo.clump(),M.heather,{label:'Meteoric bell-heath shrub'});
 BIO.def('rp_sedge',BIO.geo.clump(),M.sedge,{label:'Cold-pool frost-hollow sedge & fireweed tuft'});
 BIO.def('rp_fern',BIO.geo.clump(),M.fern,{label:'Hydrothermal crater fern frond'});
 BIO.def('rp_lichen_mat',BIO.geo.mat(),M.moss,{label:'Star-burst silver reindeer-lichen carpet'});
 BIO.def('rp_moss',BIO.geo.mat(),M.moss,{label:'Cryofumarole emerald ice-moss mat'});

 // 3D BIO.fung cushions, metallic-blue bell clusters, nurse logs & suevite/tagamite boulders
 BIO.def('rp_nickel_bell',BIO.fung.crust({lobes:6,lobeA:0.26,seg:10,rings:3,seed:91101}),M.oreNickel,{label:'Metallic-blue meteoritic nickel bell-cluster'});
 BIO.def('rp_lichen_cushion',BIO.fung.cap({form:'dome',h:0.32,seg:9,rings:3,lump:0.28,under:'none',seed:91102}),M.stoneSinter,{label:'Star-burst Cladonia cushion'});
 BIO.def('rp_sinter_cushion',BIO.fung.crust({lobes:7,lobeA:0.22,seg:10,rings:3,seed:91103}),M.stoneSinter,{label:'Thermophile geyserite & bryophyte rim crust'});
 BIO.def('rp_log',BIO.fung.stalk({r0:0.16,r1:0.12,bend:0.06,ribs:7,ribA:0.05,seg:8,rings:5}),M['wood.log'],{label:'Mossy spruce & larch nurse log'});
 BIO.def('rp_rock_suevite',makeSpheroidalRockGeo(91201,0.74,3),M.rockSuevite,{label:'Shatter-cone striated suevite impact-breccia block'});
 BIO.def('rp_rock_tagamite',makeSpheroidalRockGeo(91202,0.52,2),M.stoneTagamite,{label:'Glazed jet-black tagamite impact-melt bomb'});

 // ---------------------------------------------------------------- Tree & shrub builders (BIO.flareJoin + BIO.leanTo + 0.00 m stem float)
 const TREE_CFG={
  crater_spruce:{bucket:'rp_spruce',fol:'rp_spruce_fol',pal:PAL.spruce,barkCol:0x58443a,H:[20,35],rK:0.024,tiers:7,droop:0.15,conifer:true,spire:true},
  shatter_larch:{bucket:'rp_larch',fol:'rp_larch_fol',pal:PAL.larchGold,palAlt:PAL.larchGreen,barkCol:0x6a5040,H:[18,30],rK:0.025,tiers:6,droop:0.10,conifer:true},
  glass_pine:{bucket:'rp_pine',fol:'rp_pine_fol',pal:PAL.pine,barkCol:0x8c5238,H:[6.5,14.5],rK:0.036,tiers:4,droop:0.04,twisted:true,roots:true},
  ejecta_birch:{bucket:'rp_birch',fol:'rp_birch_fol',pal:PAL.birch,barkCol:0xe8e4dc,H:[10,20],rK:0.024,tiers:4,droop:0.08,broad:true},
  vent_willow:{bucket:'rp_willow',fol:'rp_willow_fol',pal:PAL.willow,barkCol:0x5c624e,H:[3.5,7.5],rK:0.038,tiers:3,droop:0.06,shrub:true}
 };

 RICOCHET.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:6,r0:0.18};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x401))*sc;
  const r0=Math.max(0.10,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x401)));

  // Wind-flagging lean via core/biome 39 BIO.leanTo when standing in breach-notch venturi or upper rim!
  const leanRad=opt.leanRad==null?0.03:opt.leanRad;
  const leanDir=(typeof BIO.leanTo==='function'&&opt.windDir)
   ?BIO.leanTo(null,leanRad,{toward:opt.windDir,jit:0.12,u:H(seed,3,0,0x401)})
   :[0.03*(H(seed,3,0,0x401)-0.5),1.0,0.03*(H(seed,4,0,0x401)-0.5)];
  const leanX=leanDir[0]/Math.max(0.35,leanDir[1]);
  const leanZ=leanDir[2]/Math.max(0.35,leanDir[1]);
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   if(cfg.shrub){
    // Multi-stem Fumarole Plume-Willow thicket: 3 arching stems from base, foliage anchored strictly on stem mid/end points!
    for(let s=0;s<3;s++){
     const az=(s/3)*TAU+0.5*H(seed,10+s,1,0x402);
     const reach=H0*(0.36+0.14*H(seed,10+s,2,0x402));
     const topH=H0*(0.78+0.22*H(seed,10+s,3,0x402));
     const mx=x+Math.cos(az)*reach*0.48+leanX*topH*0.3,mz=z+Math.sin(az)*reach*0.48+leanZ*topH*0.3,my=y+topH*0.52;
     const ex=x+Math.cos(az)*reach+leanX*topH*0.7,ez=z+Math.sin(az)*reach+leanZ*topH*0.7,ey=y+topH;
     const pts=[
      {x:x,y:y-0.38,z:z,r:r0*0.62},
      {x:mx,y:my,z:mz,r:r0*0.38},
      {x:ex,y:ey,z:ez,r:r0*0.18}
     ];
     tris+=BIO.tube(cfg.bucket,pts,cfg.barkCol,{seg:5});
     const fCol=C(cfg.pal[(s+Math.floor(H(seed,20+s,1,0x403)*cfg.pal.length))%cfg.pal.length]);
     const pw=H0*0.34,ph=pw*0.72;
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0,az,0),[pw,ph,pw],fCol);
     BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.1,0),[pw*0.82,ph*0.78,pw*0.82],fCol);
    }
    if(!opt.impostor)RICOCHET.CROWNS.push({x:x,z:z,y0:y+H0*0.2,h:H0*0.8,r:H0*0.55});
    return{tris:tris,H:H0,r0:r0};
   }

   const nSeg=5,trunk=[],sinkY=cfg.roots?0.68:0.55;
   const twistAmp=cfg.twisted?0.055:0.014;
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=twistAmp*H0*Math.sin(t*3.8+seed*0.7);
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed);
    const ty=y-sinkY+(H0+sinkY)*t;
    const flare=cfg.roots?(1+0.68*Math.pow(Math.max(0,1-t/0.22),2)):(1+0.26*Math.pow(Math.max(0,1-t/0.15),2));
    const rad=Math.max(0.045,r0*(1-0.80*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{seg:r0>0.36?7:5});

   // Acid-etching surface root claws gripping black tagamite impact-glass on glass_pine
   if(cfg.roots){
    for(let k=0;k<3;k++){
     const az=(k/3)*TAU+0.4*H(seed,12+k,1,0x404);
     const rSpan=r0*(2.4+0.9*H(seed,12+k,2,0x404));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.45,y:y+r0*1.2,z:z+Math.sin(az)*r0*0.45,r:r0*0.42},
      {x:x+Math.cos(az)*rSpan*0.62,y:y+r0*0.18,z:z+Math.sin(az)*rSpan*0.62,r:r0*0.24},
      {x:x+Math.cos(az)*rSpan,y:y-0.65,z:z+Math.sin(az)*rSpan,r:r0*0.11}
     ],{parentR:r0,k:1.5,sink:0.5,len:1.6});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:4});
    }
   }

   const nTiers=cfg.tiers;
   let maxReach=1.5;
   const autumnGold=(kind==='shatter_larch'&&H(seed,50,1,0x405)<0.68);
   const palTree=kind==='shatter_larch'?(autumnGold?PAL.larchGold:PAL.larchGreen):cfg.pal;
   const folUse=(kind==='shatter_larch'&&autumnGold)?'rp_larch_fol_gold':cfg.fol;

   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.conifer?(0.18+0.76*tf):(0.32+0.62*tf);
    const nBr=cfg.conifer?4:3;
    for(let b=0;b<nBr;b++){
     let az=(b/nBr)*TAU+ti*1.18+0.30*H(seed,30+ti*4+b,1,0x406);
     // Wind-flagging in Skippers Notch biases limbs leeward along windDir
     if(leanRad>0.18&&opt.windDir){
      const wAz=Math.atan2(opt.windDir[1],opt.windDir[0]);
      az=lerp(az,wAz+0.55*(b-(nBr-1)*0.5),0.48);
     }
     const taper=cfg.spire?(0.16*(1-0.74*tf)):(cfg.conifer?(0.21*(1-0.68*tf)):(0.24*Math.sin(tf*Math.PI*0.9+0.25)));
     const reach=Math.max(0.65,H0*taper);
     if(reach>maxReach)maxReach=reach;
     const wobB=twistAmp*H0*Math.sin(baseT*3.8+seed*0.7);
     const bx0=x+leanX*H0*baseT*baseT+wobB*Math.cos(seed);
     const bz0=z+leanZ*H0*baseT*baseT+wobB*Math.sin(seed);
     const by0=y-sinkY+(H0+sinkY)*baseT;
     const pR=Math.max(0.05,r0*(1-0.76*baseT));
     const lift=cfg.conifer?-0.06:(cfg.twisted?0.08:0.18);
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.56)+reach*0.04,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.045,pR*0.46)},
      {x:mx,y:my,z:mz,r:Math.max(0.035,pR*0.28)},
      {x:ex,y:ey,z:ez,r:Math.max(0.028,pR*0.15)}
     ],{parentR:pR,k:1.55,sink:0.58,len:1.85});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     const fCol=C(palTree[Math.floor(H(seed,60+ti*5+b,2,0x407)*palTree.length)%palTree.length]);
     const padW=reach*(cfg.conifer?1.04:0.90),padH=padW*(cfg.conifer?0.46:0.68);
     BIO.put(folUse,[ex,ey,ez],qEuler(0.04*(H(seed,ti,b,0x408)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>1.85){
      const fCol2=C(palTree[Math.floor(H(seed,70+ti*5+b,3,0x407)*palTree.length)%palTree.length]);
      BIO.put(folUse,[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.74,padH*0.76,padW*0.74],fCol2);
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const topW=H0*(cfg.conifer?0.13:0.20),topH=topW*(cfg.conifer?0.95:0.66);
   BIO.put(folUse,[topPt.x,topPt.y,topPt.z],qEuler(0,seed*1.3,0),[topW,topH,topW],C(palTree[0]));
   if(!opt.impostor){
    RICOCHET.CROWNS.push({x:x,z:z,y0:y+H0*0.26,h:H0*0.74,r:maxReach*1.25});
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0};
 };

 // BIO.kitBuilder (core/biome 20 + 32 BIO.kin) contract: make(spIdx, x, y, z, seed, sc, opt) & grow(T, lv)
 RICOCHET.make=function(spIdx,x,y,z,seed,sc,opt){
  const S=SPECIES[spIdx]||SPECIES[0];
  const sd=seed==null?KRAND.hash(9191,Math.round(x*10),Math.round(z*10),spIdx):seed;
  const kScale=(S.H&&Array.isArray(S.H)&&TREE_CFG[S.key])?(S.H[1]/TREE_CFG[S.key].H[1]):1.0;
  return{
   sp:spIdx,
   key:S.key,
   x:x,
   y0:y,
   z:z,
   seed:sd,
   scale:(sc==null?1:sc)*kScale,
   opt:opt||{},
   rb:0.35,
   crownR:3.2,
   H:14.0
  };
 };
 RICOCHET.grow=function(T,lv){
  if(!T)return{tris:0,H:0};
  const baseKey=(SPECIES[T.sp]&&SPECIES[T.sp].kin&&SPECIES[T.sp].kin.key)||T.key;
  const res=RICOCHET.growTree(TREE_CFG[T.key]?T.key:baseKey,T.x,T.y0,T.z,T.seed,T.scale,T.opt);
  T.H=res.H;
  T.rb=res.r0;
  return res;
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 7 m conifers & birches
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('rp_trees',{grid:8,cell:64,slots:4});
  RICOCHET.IMP={
   set:impSet,
   spruce:BIO.impostor('rp_imp_spruce',()=>RICOCHET.growTree('crater_spruce',0,0,0,9101,1.0,{impostor:true}),{set:impSet,label:'Black-cone crater spruce (impostor)'}),
   larch:BIO.impostor('rp_imp_larch',()=>RICOCHET.growTree('shatter_larch',0,0,0,9102,1.0,{impostor:true}),{set:impSet,label:'Shatter-cone gold larch (impostor)'}),
   pine:BIO.impostor('rp_imp_pine',()=>RICOCHET.growTree('glass_pine',0,0,0,9103,1.0,{impostor:true}),{set:impSet,label:'Tagamite melt-pine (impostor)'}),
   birch:BIO.impostor('rp_imp_birch',()=>RICOCHET.growTree('ejecta_birch',0,0,0,9104,1.0,{impostor:true}),{set:impSet,label:'Chalk-bark pioneer birch (impostor)'})
  };
  BIO.impostorItem('rp_imp_trees',impSet,{minRange:195,label:'Ricochet Peaks boreal crater canopy impostor'});
 }else{
  RICOCHET.IMP=null;
 }
})();
