// ================================================================= ARCFLOW — species, library materials, Earth trees & Carnelian clades ([draw])
// Registers BIO.kit('arcflow') -> ARCFLOW: 9 species spanning the Serpentine Crazy-Quilt Frontier (PLAN.md section 5.1):
//   Earth Foredeep Flora (Ca/Mg > 1 loams, levees, fens & 45 m Auger lime-dosed oasis):
//     1. nevabirch            (11-22 m chalk-white peeling-bark silver-birch; BIO.flareJoin)
//     2. klintspruce          (18-34 m narrow spire gorge conifer; BIO.flareJoin)
//     3. mustaalder           (9-18 m water-loving humic bog-iron black alder; BIO.flareJoin)
//     4. klintlinden          (14-26 m domed kukersite-talus honey-linden; BIO.flareJoin)
//     5. cloudberryfen        (0.25-0.75 m russet-emerald Sphagnum & amber cloudberry hummock)
//   Pre-Terraforming Carnelian Erythrophyll Clades (Mg/Ca > 8, Ni > 2,200 ppm serpentinite skerries & pH 11.5 seeps):
//     6. carnelian_organpipe  (3.0-10.5 m clustered fluted silica-chitin chimneys via KFRONTIER.growOrganPipe)
//     7. erythra_veil         (1.4-4.2 m perforated vermilion-scarlet solar lattice-fan via KFRONTIER.growErythraVeil)
//     8. bladder_tether       (2.2-7.8 m buoyant 0.75 g translucent ruby gas-bladders via KFRONTIER.growBladderTether)
//     9. agate_window         (0.20-1.05 m armoured crimson rosette with chalcedony skylights via KFRONTIER.putAgateWindow)
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
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=ARCFLOW.PAL={
  birch:[0x4e7c38,0x5e8c42,0x447030,0x829c44],
  birchGold:[0xc49a38,0xd4aa42,0xb28830],
  spruce:[0x244a34,0x2e563e,0x1f402d,0x366044],
  alder:[0x345e34,0x3f6b3e,0x2c522c],
  linden:[0x467438,0x548244,0x3c6630],
  fern:[0x3b6e34,0x487c40,0x32602c],
  sedge:[0x7c8640,0x8e964a,0x6c7838,0x9e8442],
  moss:[0x4e7834,0x5c863e,0x8a5432,0x9e6238],
  cloudberry:[0xe09628,0xeca634,0xd08420],
  clover:[0x4e8638,0x5c9444,0xd8d0dc],
  serpentinite:[0x2a4638,0x325242,0x223b2e],
  cumulate:[0xb8b6b0,0x3a3c40,0xd6d2c8],
  basalt:[0x3e4248,0x484c52,0x34383e],
  bogore:[0x5a4232,0x684e3a,0x4c382a],
  amber:[0xe29424,0xf0a632,0xcf821c]
 };

 // ---------------------------------------------------------------- 9 species roster (verified by tools/check_botany.py)
 const SPECIES=ARCFLOW.SPECIES=[
  {key:'nevabirch',name:'Kulaneva Silver-Birch (Betula kulanevensis)',
   how:'Graceful 11-22 m chalk-white peeling-bark pioneer broadleaf colonizing Ca/Mg > 1 alluvial levees, fen rims, and the 45 m lime-dosed Auger oasis.',
   items:['af_birch_fol','af_log','af_clover'],tags:K('temperate','humid','both',['Cfa'],'foredeep',{kin:'nhighlands'})},
  {key:'klintspruce',name:'Klint Gorge Spire-Spruce (Picea klintensis)',
   how:'Narrow 18-34 m dark-emerald spire conifer framing the misty Kulaneva-Klint waterfall gorge and Helme-Koski river terraces.',
   items:['af_spruce_fol','af_fern'],tags:K('temperate','humid','no',['Cfa'],'klintgorge',{kin:'nhighlands'})},
  {key:'mustaalder',name:'Bog-Iron Black Alder (Alnus ferrifera)',
   how:'Sturdy 9-18 m dark-barked riparian broadleaf with nitrogen-fixing nodules along pH 4.3-6.8 humic Musta-Jogi and Suur-Neva banks.',
   items:['af_alder_fol','af_sedge'],tags:K('temperate','humid','yes',['Cfa'],'humicfen')},
  {key:'klintlinden',name:'Escarpment Honey-Linden (Tilia baltica)',
   how:'Broad 14-26 m domed broadleaf canopy thriving on mineral-rich kukersite oil-shale and glauconitic marl talus below the Klint.',
   items:['af_linden_fol'],tags:K('temperate','humid','no',['Cfa'],'klintgorge')},
  {key:'cloudberryfen',name:'Amber-Cloudberry Sphagnum Hummock (Rubus chamaemorus)',
   how:'Cushioned 0.25-0.75 m russet-and-emerald peat moss hummocks studded with golden drupelets, acidifying fen water to leach garnierite nickel.',
   items:['af_moss','af_cloudberry_pod'],tags:K('temperate','humid','yes',['Cfa'],'humicfen',{crop:'cranberry'})},
  {key:'carnelian_organpipe',name:'Sanguine Flute-Colony (Sanguinitubus ophioliticus)',
   how:'Clustered 3.0-10.5 m fluted crimson-and-ivory silica-chitin chimneys thriving on toxic Mg/Ca > 8, Ni > 2,200 ppm serpentinite skerries and barrens.',
   items:['af_flute_collar','af_bleach_skel'],tags:N('temperate','subhumid','no',['Cfa','Am'],'serpentinite_island')},
  {key:'erythra_veil',name:'Pleated Carnelian Lattice-Fan (Erythrophyllum flabellatum)',
   how:'Perforated 1.4-4.2 m vermilion-scarlet chitinous solar-fan sails oriented normal to sun-tracks across zebra-cumulate ribs and pH 11.5 tufa rims.',
   items:['af_veil_lobe'],tags:N('temperate','subhumid','both',['Cfa','Am'],'alkaline_seep')},
  {key:'bladder_tether',name:'Pneumatophore Ruby Tether-Vine (Physophora rubra)',
   how:'Buoyant 2.2-7.8 m translucent ruby H2/CH4-filled spheres tethered on sinewy rust-black tendons in 1.55 atm / 0.75 g air.',
   items:['af_ruby_bladder'],tags:N('temperate','humid','both',['Cfa','Am'],'alkaline_seep')},
  {key:'agate_window',name:'Chalcedony Window-Dome (Fenestraria carneliana)',
   how:'Armoured 0.20-1.05 m crimson Erythrophyll cushion domes capped by clear biogenic quartz skylight lenses on bare serpentinite whalebacks.',
   items:['af_agate_rosette','af_agate_lens','af_strangler_rib'],tags:N('temperate','subhumid','no',['Cfa','Am'],'serpentinite_island')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 ARCFLOW.HARVEST={
  nevabirch:HV('timber, fuel',[],true,'Peeling white bark yields Kulanewa tohu-kiri remittance-draft scroll paper and waterproof birch-tar caulk.'),
  klintspruce:HV('timber, resin',[],false,'Straight resonant mast, mill-bridge trestle, and nail-less shingle timber; pitch resin waterproofs lotja barges.'),
  mustaalder:HV('timber, charcoal',[],true,'Rot-proof submerged wharf piling timber and clean low-sulfur charcoal for sampo nickel-steel smelting.'),
  klintlinden:HV('timber, carving',['blossom honey'],true,'Strong inner bast fiber plaited into lotja tow-cordage; fragrant blossoms feed Kulanewa mead-apiaries.'),
  cloudberryfen:HV('none',['amber cloudberry'],true,'Antiscorbutic golden berry; dry sphagnum moss harvested as antiseptic surgical dressing and cabin chinking.','berry'),
  carnelian_organpipe:HV('none',[],false,'Calcined nickel-rich silica-chitin tubes ground into refractory crucible grog and nickel bio-ore indicator.','reagent'),
  erythra_veil:HV('none',[],false,'Ashed Erythrophyll fan lattice yields brilliant carnelian-cobalt ceramic glaze pigment and prospecting tell.'),
  bladder_tether:HV('cordage',[],true,'Cured ruby float-bladders serve as waterproof net-buoys and lantern shades; sinewy tendons make bowstrings.'),
  agate_window:HV('none',[],true,'Clear biogenic chalcedony skylight lenses polished into assay loupes; cooling gel salve treats caustic tufa burns.','reagent')
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
  pasture:{foredeep:0.64,klintgorge:0.24,koskirapids:0.30,humicfen:0.18,serpentinite_island:0.0,alkaline_seep:0.0,auger_oasis:0.72},
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
  linden:BIO.leafMat(cardFallback(53),'af-linden',{aN:true,swayW:'0.55',swayA:0.05}),
  fern:BIO.leafMat(cardFallback(54),'af-fern',{aN:false,swayW:'(position.y)',swayA:0.05}),
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

 tick(()=>{
  const dusk=AF_STATE.mode==='dusk'||AF_STATE.dusk01>0.35;
  M.carnelianRuby.emissiveIntensity=lerp(M.carnelianRuby.emissiveIntensity,dusk?0.46:0.20,0.12);
 });

 // ---------------------------------------------------------------- merged bark & Carnelian silica-chitin buckets
 BIO.bucket('af_birch',M['bark.birch'],{label:'Kulaneva silver-birch chalk-white trunks & limbs'});
 BIO.bucket('af_spruce',M['bark.spruce'],{label:'Klint gorge spire-spruce straight trunks & limbs'});
 BIO.bucket('af_alder',M['bark.alder'],{label:'Bog-iron black alder trunks & roots'});
 BIO.bucket('af_linden',M['bark.linden'],{label:'Escarpment honey-linden trunks & limbs'});
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
 BIO.def('af_alder_fol',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Bog-iron black alder glossy crown'});
 BIO.def('af_linden_fol',BIO.geo.clump(),M.linden,{attrs:['aN'],label:'Escarpment honey-linden heart-leaf crown'});
 BIO.def('af_fern',BIO.geo.clump(),M.fern,{label:'Klint gorge spray-mist fern frond'});
 BIO.def('af_sedge',BIO.geo.clump(),M.sedge,{label:'Musta-Jogi fen sedge & cottongrass tuft'});
 BIO.def('af_clover',BIO.geo.clump(),M.sedge,{label:'Lime-dosed Auger oasis clover & ryegrass'});
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

 // ---------------------------------------------------------------- Earth tree builders (BIO.flareJoin + 0.00 m stem float)
 const TREE_CFG={
  nevabirch:{bucket:'af_birch',fol:'af_birch_fol',pal:PAL.birch,barkCol:0xe6e2da,H:[11,21],rK:0.024,tiers:4,droop:0.09,broad:true},
  klintspruce:{bucket:'af_spruce',fol:'af_spruce_fol',pal:PAL.spruce,barkCol:0x664e42,H:[18,32],rK:0.025,tiers:6,droop:0.12,conifer:true},
  mustaalder:{bucket:'af_alder',fol:'af_alder_fol',pal:PAL.alder,barkCol:0x524c48,H:[9,17],rK:0.028,tiers:4,droop:0.07,buttress:true},
  klintlinden:{bucket:'af_linden',fol:'af_linden_fol',pal:PAL.linden,barkCol:0x685c52,H:[14,25],rK:0.031,tiers:4,droop:0.08,broad:true}
 };

 ARCFLOW.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:8,r0:0.2};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.12,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
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
    const rad=Math.max(0.045,r0*(1-0.82*Math.pow(t,0.88))*flare);
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
     const reach=H0*(cfg.conifer?(0.22*(1-0.68*tf)):(0.22*Math.sin(tf*Math.PI*0.9+0.25)));
     if(reach>maxReach)maxReach=reach;
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.05,r0*(1-0.76*baseT));
     const lift=cfg.conifer?-0.04:0.18;
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.56)+reach*0.04,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.045,pR*0.46)},
      {x:mx,y:my,z:mz,r:Math.max(0.035,pR*0.28)},
      {x:ex,y:ey,z:ez,r:Math.max(0.028,pR*0.15)}
     ],{parentR:pR,k:1.55,sink:0.58,len:1.9});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     const palUse=(kind==='nevabirch'&&H(seed,55+b,1,0x305)<0.24)?PAL.birchGold:cfg.pal;
     const fCol=C(palUse[Math.floor(H(seed,60+ti*5+b,2,0x305)*palUse.length)%palUse.length]);
     const padW=reach*(cfg.conifer?1.08:0.92),padH=padW*(cfg.conifer?0.45:0.70);
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.05*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>2.0){
      const fCol2=C(palUse[Math.floor(H(seed,70+ti*5+b,3,0x305)*palUse.length)%palUse.length]);
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.74,padH*0.76,padW*0.74],fCol2);
     }
    }
   }
   const topX=x+leanX*H0,topZ=z+leanZ*H0,topY=y+H0;
   const topW=H0*(cfg.conifer?0.14:0.21),topH=topW*(cfg.conifer?0.95:0.66);
   BIO.put(cfg.fol,[topX,topY,topZ],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));
   if(!opt.impostor){
    ARCFLOW.CROWNS.push({x:x,z:z,y0:y+H0*0.28,h:H0*0.74,r:maxReach*1.25});
   }
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0};
 };

 // Carnelian Erythrophyll builders delegating to core/frontier KFRONTIER
 ARCFLOW.growCarnelian=function(kind,x,y,z,seed,scale,opt){
  const cfg={bucket:'af_chitin',skelBucket:'af_skel',prefix:'af',sunAzimuthRad:0.68};
  if(kind==='carnelian_organpipe')return KFRONTIER.growOrganPipe(BIO,cfg,x,y,z,seed,scale,opt);
  if(kind==='erythra_veil')return KFRONTIER.growErythraVeil(BIO,cfg,x,y,z,seed,scale);
  if(kind==='bladder_tether')return KFRONTIER.growBladderTether(BIO,cfg,x,y,z,seed,scale);
  KFRONTIER.putAgateWindow(BIO,'af',x,y,z,seed,scale,!!(opt&&opt.petrified));
  return{tris:0,H:0.8};
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for >= 7 m forms
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('af_trees',{grid:8,cell:64,slots:4});
  ARCFLOW.IMP={
   set:impSet,
   birch:BIO.impostor('af_imp_birch',()=>ARCFLOW.growTree('nevabirch',0,0,0,8101,1.0,{impostor:true}),{set:impSet,label:'Kulaneva silver-birch (impostor)'}),
   spruce:BIO.impostor('af_imp_spruce',()=>ARCFLOW.growTree('klintspruce',0,0,0,8102,1.0,{impostor:true}),{set:impSet,label:'Klint gorge spire-spruce (impostor)'}),
   linden:BIO.impostor('af_imp_linden',()=>ARCFLOW.growTree('klintlinden',0,0,0,8103,1.0,{impostor:true}),{set:impSet,label:'Escarpment honey-linden (impostor)'}),
   organpipe:BIO.impostor('af_imp_organpipe',()=>ARCFLOW.growCarnelian('carnelian_organpipe',0,0,0,8104,1.0,{impostor:true}),{set:impSet,label:'Sanguine flute-colony (impostor)'})
  };
  BIO.impostorItem('af_imp_trees',impSet,{minRange:195,label:'Arcflow Earth & Carnelian canopy impostor'});
 }else{
  ARCFLOW.IMP=null;
 }
})();
