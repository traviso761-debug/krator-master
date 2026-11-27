// ================================================================= COMPASS HILLS — species, library materials & builders ([draw])
// Registers BIO.kit('compasshills') -> COMPASS: 14 species pairing the 85% Earthlike Mediterranean-continental cuesta woodland
// matrix (stone pine, cork oak, iron-pistache, wild whorl-olive, cuesta juniper, riparian plane, white mulberry, saffron & macchia)
// with the 15% grounded ferromagnetic biota & landmarks (meridian-aligned compassbush, magnetite-awn fluxgrass, concentric
// isogauss fluxlichen, bristling ferrotuft, and fulgurite-veined lodestonespire crags). 100% library-textured (materials.json).
BIO.kit('compasshills');
var COMPASS={PHYS:COMPASS_PHYS,SITES:COMPASS_SITES,FAUNA:COMPASS_PHYS.FAUNA,CROPS:COMPASS_PHYS.CROPS_BIOME,PLACED:[],SPIRES:[]};
var COMPASSHILLS=COMPASS;
(function(){
 const {TAU,clamp,lerp,smooth,qEuler,qUp}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 COMPASS.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||''});

 // ---------------------------------------------------------------- palettes (sRGB hex)
 const PAL=COMPASS.PAL={
  pine:[0x355834,0x3f643a,0x2d4d2e,0x486e40],
  oak:[0x465d34,0x52693c,0x3d522d,0x5d7444],
  pistache:[0x4e6c38,0x647a3c,0x8c5636,0x587440],
  drupe:[0xb83e38,0x3c8682,0xc84e42,0x48948e],
  olive:[0x788868,0x869676,0x6c7c5e,0x92a082],
  juniper:[0x3b583c,0x466446,0x324c34],
  plane:[0x4f763a,0x5d8442,0x446a32,0x6b904c],
  mulberry:[0x487836,0x568840,0x3f6c2f],
  compassLeaf:[0x8c9e7e,0x9aa88a,0x7e9072,0xa6b496],
  fluxGrass:[0xb4944e,0xc2a25a,0x9e8042,0xceb066],
  dryGrass:[0xb89e5c,0xc6ac68,0xa68e50,0xd0b874],
  macchia:[0x5e7248,0x6c8054,0x52643e,0x7a8c60],
  saffron:[0x8c52b8,0x9e62c8,0x7c44a8,0xd44838],
  isogauss:[0x484e56,0xb87834,0x586068,0xc8863e],
  ferrotuft:[0x282c34,0x343a44,0x1e2228],
  ironstone:[0x262830,0x30333c,0x1e2026],
  fulgurite:[0x2c7c82,0x389298,0x22646a],
  sandstone:[0xc49662,0xb88854,0xd0a46e],
  gossan:[0x7c463c,0x683a38,0x8e5242]
 };

 // ---------------------------------------------------------------- 14 botanical & geological-landmark species (check_botany.py)
 const SPECIES=COMPASS.SPECIES=[
  // A. 6 Signature Ferromagnetic & Cuesta Species (PLAN.md section 4)
  {key:'compassbush',name:'Flux-Leaf Compass-Shrub',how:'0.9-2.6 m woody Mediterranean sclerophyll shrub whose biogenic Fe3O4 magnetosome petioles torque every vertical silver-olive leaf blade parallel to local horizontal magnetic flux lines to shed +32 degC noon sun.',
   items:['ch_compass_blade'],tags:N('temperate','subhumid','no',['Cfa','Csa'],'cuestawood',{magnetotropic:true,ferromagnetic:true})},
  {key:'ironpistache',name:'Cuesta Terebinth Iron-Pistache',how:'4.5-11.0 m crooked, fluted resinous broadleaf tree with coppery spring shoots and crimson-to-turquoise drupe clusters prying into fractured ironstone-sandstone cuesta joints.',
   items:['ch_pistache_fol','ch_pistache_drupe'],tags:K('temperate','subhumid','no',['Cfa','Csa'],'cuestawood')},
  {key:'fluxgrass',name:'Magnetite-Awn Plume-Grass',how:'0.45-1.15 m golden-bronze tussock grass whose feathery 12 cm seed-awns chelate fine magnetite dust and stream along local magnetic flux lines.',
   items:['ch_fluxgrass'],tags:N('temperate','dry','no',['Cfa','Csa'],'magnetor',{magnetotropic:true})},
  {key:'fluxlichen',name:'Isogauss Stripe-Lichen',how:'Concentric raised bands of specular gunmetal-black and rust-gold crustose thalli steered along constant-|B| isogauss contours on black magnetite tors.',
   items:['ch_fluxlichen'],tags:N('temperate','subhumid','no',['Cfa','Csa'],'magnetor',{metallophyte:true,indicator:'lodestone'})},
  {key:'ferrotuft',name:'Tor-Edge Ferro-Moss',how:'0.05-0.20 m dark-metallic bristling cushion moss along high-gradient crag corners trapping upright single-domain magnetite needles.',
   items:['ch_ferrotuft'],tags:N('temperate','subhumid','no',['Cfa','Csa'],'magnetor',{metallophyte:true,ferromagnetic:true})},
  {key:'lodestonespire',name:'Fulgurite-Veined Magnetite Crag',how:'4.0-18.0 m angular column of jet-black banded-ironstone and specular hematite laced with glassy teal-black lightning fulgurite melt-veins.',
   items:['ch_spire_col','ch_spire_rib','ch_fulgurite_vein'],tags:N('temperate','subhumid','no',['Cfa','Csa'],'magnetor',{landmark:true,resource:'lodestone'})},

  // B. 8 Earthlike Mediterranean-Continental Cuesta & Riparian Matrix Species (85% of instances; PLAN.md sections 1, 2 & 4)
  {key:'stonepine',name:'Umbrella Cuesta Stone Pine',how:'9-20 m flat-crowned Mediterranean umbrella pine clothing warm golden-buff ferruginous sandstone dip-slopes.',
   items:['ch_pine_fol'],tags:K('temperate','subhumid','no',['Cfa','Csa'],'cuestawood',{shared:'swlowlands'})},
  {key:'corkoak',name:'Cuesta Cork and Pubescent Oak',how:'7-15 m thick-barked gnarled evergreen and semi-deciduous oak forming open sunlit savanna-woodland across Compass Hills.',
   items:['ch_oak_fol'],tags:K('temperate','subhumid','no',['Cfa','Csa'],'cuestawood',{shared:'swlowlands'})},
  {key:'whorlolive',name:'Wild Cuesta Whorl-Olive',how:'3.5-7.5 m twisted silver-backed Mediterranean olive tree thriving on dry-summer Csa dip-slopes and terraced benches.',
   items:['ch_olive_fol'],tags:K('temperate','dry','no',['Csa','Cfa'],'dipslope')},
  {key:'cuestajuniper',name:'Red-Berry Cuesta Juniper',how:'1.6-4.2 m aromatic resinous juniper gripping rocky sandstone scarps and domain-wall saddles.',
   items:['ch_juniper_fol'],tags:K('temperate','dry','no',['Csa','Cfa'],'cuestawood',{shared:'wouterwall'})},
  {key:'gorgeplane',name:'Web-Cleaver Riparian Plane',how:'12-22 m mottled-bark oriental plane shading the 1,080 m^3/s Ham-Tsek magnetite river narrows and cuesta brooks.',
   items:['ch_plane_fol'],tags:K('temperate','humid','yes',['Cfa'],'irongorge')},
  {key:'silkmulberry',name:'Ham-Tsek White Mulberry',how:'4.5-8.5 m lush broadleaf mulberry planted and naturalized along river terraces near Ham-Tsek Silk Post.',
   items:['ch_mulberry_fol'],tags:K('temperate','subhumid','yes',['Cfa'],'irongorge')},
  {key:'saffroncrocus',name:'Cuesta Autumn Saffron',how:'0.18-0.35 m violet-petalled, crimson-stigma crocus carpets blooming across sunny Csa limestone-sandstone benches.',
   items:['ch_saffron'],tags:K('temperate','dry','no',['Csa','Cfa'],'dipslope')},
  {key:'macchiasage',name:'Rosemary and Cuesta Bunchgrass Macchia',how:'0.35-0.85 m aromatic Mediterranean rosemary-sage scrub and warm golden bunchgrass carpeting sunlit dip-slopes.',
   items:['ch_macchia','ch_drygrass','ch_mossmat'],tags:K('temperate','subhumid','no',['Cfa','Csa'],'cuestawood')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 COMPASS.HARVEST={
  compassbush:HV('fuel',[],true,'Aromatic mastic-like resin chewed by delvers; calcined iron-rich leaf ash ground into fine magnetic-ink pigment and reagent.'),
  ironpistache:HV('timber, carving',['pistache nut'],true,'Hard non-sparking mallet and wedge handle timber prized inside Lodestone cryo-tunnels; turpentine resin.'),
  fluxgrass:HV('thatch, weaving, padding',[],false,'Woven into non-static cushioned baskets for carrying raw lodestones and salvaged Ancient superconductors.'),
  fluxlichen:HV('none',[],false,'Scraped for rust-gold and gunmetal wool dye; prospectors read tight isogauss ring spacing as a high-grade lodestone ore indicator.'),
  ferrotuft:HV('none',[],false,'Brushed with tin-bronze combs to harvest pure single-domain magnetite sand for hourglasses and compass fluid reagent.'),
  lodestonespire:HV('none',[],false,'Split with non-sparking tin-bronze plug-and-feather wedges into Krator natural permanent magnets; lightning marker.'),
  stonepine:HV('timber, resin',['pine nut'],false,'Straight structural timber for river barges and oil-rich edible pine kernels.'),
  corkoak:HV('timber, tannin',['roasted acorn'],false,'Thick insulating outer cork stripped for non-magnetic tool sheaths, floats, and tanbark.'),
  whorlolive:HV('carving, fuel',['whorl-olive'],true,'Pressed for golden culinary and lamp oil, soap, and tunnel-leather dressing.'),
  cuestajuniper:HV('carving, fuel',['juniper berry'],true,'Fragrant rot-proof survey-stake wood and spiced berry extract.'),
  gorgeplane:HV('timber, carving',[],false,'Tough cross-grained ferry-deck planking and bronze-capstan blocks along Ham-Tsek.'),
  silkmulberry:HV('carving, bast',['mulberry'],false,'Tender leaves feed silk-moth broods along the Spider Lake to Korona silk road; fibrous inner bast paper.'),
  saffroncrocus:HV('none',['saffron stigma'],true,'Hand-plucked crimson stigmas traded down Ham-Tsek as high-value golden dye and spice.'),
  macchiasage:HV('fuel, thatch',['rosemary herb'],true,'Distilled essential oil rub and dry kindling tinder.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=COMPASS.HARVEST[S.key];});
 const byKey={};SPECIES.forEach(S=>{byKey[S.key]=S;});
 COMPASS.byKey=byKey;
 COMPASS.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 COMPASS.plantOfItem=COMPASS.speciesOfItem;

 // ---------------------------------------------------------------- procedural fallbacks (used only when ?mat=proc)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=194+(H(seed,i%w,(i/w)|0,0x71)-0.5)*52;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(220,230,212,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.48,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[182,196,174]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('compasshills',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.78:opt.roughness,
   metalness:opt.metalness==null?0.05:opt.metalness,
   vertexColors:opt.vertexColors!==false,
   side:opt.side||T3.DoubleSide
  });
  if(L&&L.scale)m.userData.libScale=L.scale;
  if(L&&typeof KMAT.libHooks==='function'){
   const key='compass-pbr-'+slot+KMAT.libKey(L);
   m.onBeforeCompile=sh=>{KMAT.libHooks(sh,L);};
   m.customProgramCacheKey=()=>key;
  }
  return m;
 }

 // ---------------------------------------------------------------- COMPASS.M material table (100% library-textured!)
 const M=COMPASS.M={
  'bark.pine':BIO.barkMat(grey(128,11)),
  'bark.cork':BIO.barkMat(grey(128,12)),
  'bark.pistache':BIO.barkMat(grey(128,13)),
  'bark.juniper':BIO.barkMat(grey(128,14)),
  'bark.plane':BIO.barkMat(grey(128,15)),
  'wood.gnarled':BIO.barkMat(grey(128,16)),

  // PBR rocks, minerals, lichens & non-ferrous bronze/nephrite/copper works
  rockIronstone:pbrMat('rock.ironstone',21,{roughness:0.28,metalness:0.52}),
  rockBanded:pbrMat('rock.banded',22,{roughness:0.56,metalness:0.24}),
  rockFulgurite:pbrMat('rock.fulgurite',23,{roughness:0.16,metalness:0.28}),
  rockGossan:pbrMat('rock.gossan',24,{roughness:0.74,metalness:0.14,vertexColors:false}),
  rockSandstone:pbrMat('rock.sandstone',25,{roughness:0.80,metalness:0.03,vertexColors:false}),
  rockGranite:pbrMat('rock.granite',26,{roughness:0.76,metalness:0.03,vertexColors:false}),
  rockNephrite:pbrMat('rock.nephrite',27,{roughness:0.26,metalness:0.08,vertexColors:false}),
  metalBronze:pbrMat('metal.bronze',28,{roughness:0.28,metalness:0.82,vertexColors:false}),
  metalCopper:pbrMat('metal.copper',29,{roughness:0.38,metalness:0.65,vertexColors:false}),
  isogauss:pbrMat('organic.isogauss',30,{roughness:0.54,metalness:0.22}),
  ferrotuft:pbrMat('organic.ferrotuft',31,{roughness:0.24,metalness:0.62}),

  // Foliage & card cutouts
  pine:BIO.leafMat(cardFallback(41),'ch-pine',{aN:true,swayW:'0.50',swayA:0.04}),
  oak:BIO.leafMat(cardFallback(42),'ch-oak',{aN:true,swayW:'0.60',swayA:0.05}),
  pistache:BIO.leafMat(cardFallback(43),'ch-pistache',{aN:true,swayW:'0.65',swayA:0.05}),
  olive:BIO.leafMat(cardFallback(44),'ch-olive',{aN:true,swayW:'0.55',swayA:0.04}),
  juniper:BIO.leafMat(cardFallback(45),'ch-juniper',{aN:true,swayW:'0.40',swayA:0.03}),
  macchia:BIO.leafMat(cardFallback(52),'ch-macchia',{aN:false,swayW:'(position.y)',swayA:0.04}),
  compassleaf:BIO.leafMat(cardFallback(46),'ch-compassleaf',{aN:false,swayW:'(position.y)',swayA:0.03,alphaTest:0.36}),
  fluxgrass:BIO.leafMat(cardFallback(47),'ch-fluxgrass',{aN:false,swayW:'(position.y)',swayA:0.08}),
  drygrass:BIO.leafMat(cardFallback(48),'ch-drygrass',{aN:false,swayW:'(position.y)',swayA:0.07}),
  saffron:BIO.leafMat(cardFallback(49),'ch-saffron',{aN:false,swayW:'(position.y)',swayA:0.04}),
  drupe:BIO.leafMat(cardFallback(50),'ch-drupe',{aN:false,swayW:'0.45',swayA:0.04}),
  moss:BIO.leafMat(cardFallback(51),'ch-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 COMPASS.SWAP=BIO.libSwap('compasshills',M);

 // ---------------------------------------------------------------- merged bark & timber buckets
 BIO.bucket('ch_pine',M['bark.pine'],{label:'Umbrella stone pine trunks & boughs'});
 BIO.bucket('ch_cork',M['bark.cork'],{label:'Cuesta cork & pubescent oak trunks'});
 BIO.bucket('ch_pistache',M['bark.pistache'],{label:'Iron-pistache & compass-shrub stems'});
 BIO.bucket('ch_juniper',M['bark.juniper'],{label:'Whorl-olive & cuesta juniper trunks'});
 BIO.bucket('ch_plane',M['bark.plane'],{label:'Ham-Tsek riparian plane & mulberry trunks'});
 BIO.bucket('ch_wood',M['wood.gnarled'],{label:'Sun-bleached cuesta deadwood'});

 // ---------------------------------------------------------------- custom geometries
 // Vertical meridian-aligned isobilateral leaf-fin cluster for compassbush:
 // 5 parallel vertical fins all standing edge-on in the local XY plane (+X = bladeYawRad), so every leaf lamina
 // visibly points along local horizontal magnetic flux B_horiz(x, z) with crisp silhouette from both side and overhead!
 function makeCompassBladeGeo(){
  const pos=[],nrm=[],uv=[],col=[],idx=[];
  const fins=[
   {zOff:0.00,xOff:0.00,w:0.86,h:0.96,tiltZ:0.03,cell:0},
   {zOff:-0.14,xOff:0.06,w:0.74,h:0.86,tiltZ:-0.06,cell:1},
   {zOff:0.14,xOff:-0.05,w:0.74,h:0.84,tiltZ:0.06,cell:2},
   {zOff:-0.26,xOff:-0.08,w:0.62,h:0.72,tiltZ:-0.09,cell:4},
   {zOff:0.26,xOff:0.08,w:0.62,h:0.72,tiltZ:0.09,cell:5}
  ];
  let vBase=0;
  for(let f=0;f<fins.length;f++){
   const F=fins[f];
   const cx=(F.cell%3)/3,cy=Math.floor(F.cell/3)/3, pad=0.015;
   const u0=cx+pad,u1=cx+1/3-pad,v0=cy+pad,v1=cy+1/3-pad;
   const x0=F.xOff-F.w*0.5,x1=F.xOff+F.w*0.5;
   const zTop=F.zOff+F.tiltZ*F.h;
   pos.push(
    x0,0.02,F.zOff,
    x1,0.02,F.zOff,
    x1,F.h,zTop,
    x0,F.h,zTop
   );
   nrm.push(0,0.35,0.94, 0,0.35,0.94, 0,0.45,0.89, 0,0.45,0.89);
   uv.push(u0,v1, u1,v1, u1,v0, u0,v0);
   const sh=0.88+0.12*(f%2);
   col.push(sh*0.86,sh*0.92,sh*0.84, sh*0.86,sh*0.92,sh*0.84, sh,sh,sh, sh,sh,sh);
   idx.push(vBase,vBase+1,vBase+2, vBase,vBase+2,vBase+3);
   vBase+=4;
  }
  const g=new T3.BufferGeometry();
  g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new T3.Float32BufferAttribute(nrm,3));
  g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new T3.Float32BufferAttribute(col,3));
  g.setIndex(idx);
  return g;
 }

 // Angular faceted magnetite/banded-ironstone spire prism (sunk 0.6 m at base, tapered craggy summit)
 function makeSpirePrismGeo(seed,sides,taper){
  const g=new T3.CylinderGeometry(taper,1.0,1.0,sides,5,false);
  g.translate(0,0.44,0);
  const p=g.attributes.position,c=[],J={};
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.82+0.34*H(seed,i,5,0x91);
   const rK=J[k]*(1-0.18*Math.max(0,y));
   p.setXYZ(i,x*rK,y,z*rK);
   const band=0.72+0.28*Math.sin(y*18.0+seed)+0.08*(H(seed,i,9,0x92)-0.5);
   c.push(band,band,band*1.04);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // Proud external branching glassy fulgurite lightning melt-vein (stands +0.08 m clear of spire face -> zero z-fighting!)
 function makeFulguriteVeinGeo(seed){
  const g=new T3.CylinderGeometry(0.055,0.11,1.0,5,6,false);
  g.translate(0,0.5,0);
  const p=g.attributes.position,c=[];
  for(let i=0;i<p.count;i++){
   const y=p.getY(i);
   const zigX=0.14*Math.sin(y*13.0+seed*1.7),zigZ=0.08*Math.cos(y*9.5+seed);
   p.setXYZ(i,p.getX(i)+zigX,y,p.getZ(i)+zigZ);
   const gl=0.82+0.18*y;
   c.push(gl*0.85,gl,gl);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // Bristling spiky magnetite-grain ferro-tuft cushion
 function makeFerroTuftGeo(seed){
  const g=new T3.IcosahedronGeometry(0.5,2),p=g.attributes.position,c=[],J={};
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined){
    const up=Math.max(0,y*2);
    J[k]=0.68+0.78*up*H(seed,i,3,0x95);
   }
   const s=J[k];
   p.setXYZ(i,x*s,Math.max(-0.08,y*s*1.25)+0.12,z*s);
   const sh=0.72+0.28*Math.max(0,y*2);
   c.push(sh,sh*1.02,sh*1.08);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 function makeRockGeo(seed,flatY){
  const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position,c=[],J={};
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.76+0.38*H(seed,i,7,0x96);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
   const sh=0.84+0.16*H(seed,i,11,0x96);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 // ---------------------------------------------------------------- instanced item definitions (single-line BIO.def for check_cells.py!)
 BIO.def('ch_pine_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Umbrella stone pine needle crown'});
 BIO.def('ch_oak_fol',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Cuesta cork & pubescent oak foliage'});
 BIO.def('ch_pistache_fol',BIO.geo.clump(),M.pistache,{attrs:['aN'],label:'Cuesta iron-pistache compound foliage'});
 BIO.def('ch_pistache_drupe',BIO.geo.bloom(),M.drupe,{label:'Iron-pistache crimson & turquoise drupe panicles'});
 BIO.def('ch_olive_fol',BIO.geo.clump(),M.olive,{attrs:['aN'],label:'Wild whorl-olive silver-backed foliage'});
 BIO.def('ch_juniper_fol',BIO.geo.clump(),M.juniper,{attrs:['aN'],label:'Red-berry cuesta juniper sprays'});
 BIO.def('ch_plane_fol',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Web-Cleaver riparian plane canopy'});
 BIO.def('ch_mulberry_fol',BIO.geo.clump(),M.pistache,{attrs:['aN'],label:'Ham-Tsek white mulberry foliage'});
 BIO.def('ch_compass_blade',makeCompassBladeGeo() /* geo.cells( */,M.compassleaf,{label:'Compass-shrub vertical flux-aligned sclerophyll blades'});
 BIO.def('ch_fluxgrass',BIO.geo.clump(),M.fluxgrass,{label:'Magnetite-awn plume-grass tussock'});
 BIO.def('ch_drygrass',BIO.geo.clump(),M.drygrass,{label:'Mediterranean cuesta bunchgrass'});
 BIO.def('ch_macchia',BIO.geo.clump(),M.macchia,{label:'Rosemary & aromatic cuesta macchia'});
 BIO.def('ch_saffron',BIO.geo.clump(),M.saffron,{label:'Cuesta autumn saffron crocus'});
 BIO.def('ch_mossmat',BIO.geo.mat(),M.moss,{label:'Riparian & brookside moss mat'});

 // 3D geological & metallophyte forms
 BIO.def('ch_spire_col',makeSpirePrismGeo(91101,6,0.34),M.rockIronstone,{label:'Magnetite & specular-hematite lodestone spire'});
 BIO.def('ch_spire_rib',makeSpirePrismGeo(91102,5,0.48),M.rockBanded,{label:'Banded ironstone & jasper-chert crag rib'});
 BIO.def('ch_fulgurite_vein',makeFulguriteVeinGeo(91103),M.rockFulgurite,{label:'Lightning-vitrified teal-black fulgurite melt-vein'});
 BIO.def('ch_fluxlichen',BIO.fung.crust({lobes:8,lobeA:0.18,seg:18,rings:3,crustK:0.82,seed:91104}),M.isogauss,{label:'Isogauss gunmetal & rust-ochre stripe-lichen ring'});
 BIO.def('ch_ferrotuft',makeFerroTuftGeo(91105),M.ferrotuft,{label:'Tor-edge spiky magnetite ferro-tuft cushion'});
 BIO.def('ch_rock_ironstone',makeRockGeo(91106,0.72),M.rockIronstone,{label:'Magnetized black ironstone block'});
 BIO.def('ch_rock_sandstone',makeRockGeo(91107,0.68),M.rockSandstone,{label:'Warm ferruginous cuesta sandstone boulder'});
 BIO.def('ch_rock_gossan',makeRockGeo(91108,0.74),M.rockGossan,{label:'Vitrified quench-trench slag block'});

 // ---------------------------------------------------------------- tree & shrub builders (BIO.flareJoin + direct twig-tip stemClump socketing)
 const TREE_CFG={
  stonepine:{bucket:'ch_pine',fol:'ch_pine_fol',pal:PAL.pine,barkCol:0x785844,H:[10,19],rK:0.024,tiers:4,umbrella:true},
  corkoak:{bucket:'ch_cork',fol:'ch_oak_fol',pal:PAL.oak,barkCol:0x6e6256,H:[7.5,14.5],rK:0.032,tiers:5,gnarled:true},
  ironpistache:{bucket:'ch_pistache',fol:'ch_pistache_fol',pal:PAL.pistache,barkCol:0x7c5442,H:[5.0,10.5],rK:0.029,tiers:4,gnarled:true,drupes:true},
  whorlolive:{bucket:'ch_juniper',fol:'ch_olive_fol',pal:PAL.olive,barkCol:0x827e74,H:[3.8,7.2],rK:0.036,tiers:4,gnarled:true},
  gorgeplane:{bucket:'ch_plane',fol:'ch_plane_fol',pal:PAL.plane,barkCol:0xa8a496,H:[12,21],rK:0.028,tiers:6,gnarled:false},
  silkmulberry:{bucket:'ch_plane',fol:'ch_mulberry_fol',pal:PAL.mulberry,barkCol:0x867c6c,H:[4.8,8.2],rK:0.030,tiers:4,gnarled:true}
 };

 COMPASS.growTree=function(kind,x,y,z,seed,scale){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:0};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.12,H0*cfg.rK*(0.88+0.24*H(seed,2,0,0x301)));
  let tris=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=6;
   const trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=(cfg.gnarled?0.052:0.018)*H0*Math.sin(t*3.8+seed);
    const tx=x+wob*Math.cos(seed),tz=z+wob*Math.sin(seed);
    const ty=y-0.40+(H0*(cfg.umbrella?0.78:0.84)+0.40)*t;
    const flare=1+0.38*Math.pow(Math.max(0,1-t/0.16),2);
    trunk.push({x:tx,y:ty,z:tz,r:Math.max(0.05,r0*(1-0.72*t)*flare)});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{seg:7});

   const tiers=cfg.tiers;
   const tStart=cfg.umbrella?0.64:0.38;
   for(let ti=0;ti<tiers;ti++){
    const f=tStart+(0.96-tStart)*(ti/Math.max(1,tiers-1));
    const idx=Math.min(nSeg-1,Math.floor(f*nSeg)),tf=f*nSeg-idx;
    const bx=lerp(trunk[idx].x,trunk[idx+1].x,tf);
    const by=lerp(trunk[idx].y,trunk[idx+1].y,tf);
    const bz=lerp(trunk[idx].z,trunk[idx+1].z,tf);
    const pR=lerp(trunk[idx].r,trunk[idx+1].r,tf);
    const nB=cfg.umbrella?4:3;
    for(let b=0;b<nB;b++){
     const sIdx=ti*6+b;
     const az=(b/nB)*TAU+ti*1.25+0.45*(H(seed,sIdx,1,0x302)-0.5);
     const span=H0*(cfg.umbrella?(0.24+0.11*H(seed,sIdx,2,0x302)):(0.22+0.10*H(seed,sIdx,2,0x302)));
     const rise=cfg.umbrella?0.38*span:0.28*span;
     const mx=bx+Math.cos(az)*span*0.52,my=by+rise*0.55,mz=bz+Math.sin(az)*span*0.52;
     const ex=bx+Math.cos(az)*span,ey=by+rise,ez=bz+Math.sin(az)*span;
     const br0=Math.max(0.04,pR*0.48);
     const limb=BIO.flareJoin([
      {x:bx,y:by,z:bz,r:br0},
      {x:mx,y:my,z:mz,r:br0*0.68},
      {x:ex,y:ey,z:ez,r:br0*0.36}
     ],{parentR:pR,k:1.5,sink:0.55,len:1.8});
     tris+=BIO.tube(cfg.bucket,limb,cfg.barkCol,{seg:5});

     if(cfg.umbrella){
      for(let fk=-1;fk<=1;fk+=2){
       const faz=az+fk*(0.42+0.12*H(seed,sIdx,6+fk,0x302));
       const fSpan=span*0.38,fRise=fSpan*0.26;
       const fx=ex+Math.cos(faz)*fSpan,fy=ey+fRise,fz=ez+Math.sin(faz)*fSpan;
       const fPts=BIO.flareJoin([
        {x:ex,y:ey,z:ez,r:br0*0.34},
        {x:fx,y:fy,z:fz,r:br0*0.16}
       ],{parentR:br0*0.36,k:1.4,sink:0.5,len:1.5});
       tris+=BIO.tube(cfg.bucket,fPts,cfg.barkCol,{seg:4});
       const fPad=clamp(span*0.76,1.2,4.4);
       const fCol=cfg.pal[(sIdx+seed+(fk>0?1:0))%cfg.pal.length];
       BIO.put(cfg.fol,[fx,fy,fz],qEuler(0,faz,0),[fPad,fPad*0.46,fPad],fCol,{n:[Math.cos(faz)*0.28,0.94,Math.sin(faz)*0.28]});
      }
     }else{
      const padS=clamp(span*0.92,1.3,5.2);
      const col1=cfg.pal[(sIdx+seed)%cfg.pal.length];
      BIO.put(cfg.fol,[ex,ey,ez],qEuler(0,az,0),[padS,padS*0.68,padS],col1,{n:[Math.cos(az)*0.3,0.92,Math.sin(az)*0.3]});
      if(span>1.8){
       const tAz=az+0.65,tLen=span*0.26,tx=mx+Math.cos(tAz)*tLen,ty=my+tLen*0.32,tz=mz+Math.sin(tAz)*tLen;
       tris+=BIO.tube(cfg.bucket,[{x:mx,y:my,z:mz,r:br0*0.42},{x:tx,y:ty,z:tz,r:br0*0.18}],cfg.barkCol,{seg:4});
       BIO.put(cfg.fol,[tx,ty,tz],qEuler(0,tAz,0),[padS*0.76,padS*0.58,padS*0.76],cfg.pal[(sIdx+seed+1)%cfg.pal.length],{n:[0,1,0]});
      }
      if(cfg.drupes&&H(seed,sIdx,4,0x303)<0.55){
       const ds=0.38+0.24*H(seed,sIdx,5,0x303);
       BIO.put('ch_pistache_drupe',[ex,ey+0.08*padS,ez],qEuler(0,az*1.4,0),[ds,ds,ds],PAL.drupe[(sIdx+seed)%PAL.drupe.length]);
      }
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const leadTopY=topPt.y+H0*(cfg.umbrella?0.12:0.08);
   tris+=BIO.tube(cfg.bucket,[{x:topPt.x,y:topPt.y,z:topPt.z,r:topPt.r*0.85},{x:topPt.x,y:leadTopY,z:topPt.z,r:Math.max(0.035,topPt.r*0.38)}],cfg.barkCol,{seg:5});
   const topS=clamp(H0*(cfg.umbrella?0.28:0.22),1.5,5.0);
   BIO.put(cfg.fol,[topPt.x,leadTopY,topPt.z],qEuler(0,H(seed,77,1,0x304)*TAU,0),[topS,topS*(cfg.umbrella?0.42:0.66),topS],cfg.pal[seed%cfg.pal.length],{n:[0,1,0]});
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0};
 };

 // Signature Flux-Leaf Compass-Shrub: woody Mediterranean base + vertical meridian-aligned sclerophyll leaf fins
 // Note: Three.js Y-rotation by yaw maps local +X (1, 0, 0) to (cos(yaw), 0, -sin(yaw)); to align local +X with
 // world azimuth (cos(az), 0, sin(az)), we pass -bladeYawRad to qEuler(0, -bladeYawRad, 0)!
 COMPASS.growCompassBush=function(x,y,z,seed,scale,bladeYawRad,align01){
  const sc=scale==null?1:scale;
  const hBush=(1.05+1.35*H(seed,1,0,0x331))*sc;
  const rotY=-bladeYawRad;
  const spread=0.55+0.25*sc;
  // Woody stem fork
  const ownPrev=BIO.owner;BIO.owner=[x,z];
  try{
   for(let s=0;s<2;s++){
    const a=bladeYawRad+(s===0?0.35:-0.35);
    const pts=[
     {x:x,y:y-0.18,z:z,r:0.055*sc},
     {x:x+Math.cos(a)*0.22*sc,y:y+hBush*0.32,z:z+Math.sin(a)*0.22*sc,r:0.028*sc}
    ];
    BIO.tube('ch_pistache',pts,0x6a5242,{seg:4});
   }
  }finally{BIO.owner=ownPrev;}

  // 3 stacked/staggered vertical leaf-blade tiers: tightly locked to bladeYawRad when align01 >= 0.8, splaying in zero-field seams!
  for(let k=0;k<3;k++){
   const jAng=(1-align01)*(k-1)*1.05;
   const ox=(k-1)*0.24*sc*Math.cos(bladeYawRad+1.1);
   const oz=(k-1)*0.24*sc*Math.sin(bladeYawRad+1.1);
   const col=PAL.compassLeaf[(seed+k)%PAL.compassLeaf.length];
   const wS=(0.95+0.28*H(seed,k,2,0x331))*spread*1.45;
   const hS=hBush*(0.78+0.22*H(seed,k,3,0x331));
   BIO.put('ch_compass_blade',[x+ox,y+0.08*k,z+oz],qEuler(0,rotY-jAng,0),[wS,hS,wS],col);
  }
  return{H:hBush};
 };

 // Fulgurite-veined Magnetite Crag (lodestonespire) + concentric fluxlichen contours + ferrotuft rims
 COMPASS.growLodestoneSpire=function(x,y,z,seed,hM,fulgurite01){
  const rBase=clamp(hM*0.23,1.2,3.8);
  const yaw=H(seed,1,0,0x341)*TAU;
  const colMain=PAL.ironstone[seed%PAL.ironstone.length];
  BIO.put('ch_spire_col',[x,y-0.55,z],qEuler(0.04*(H(seed,2,0,0x341)-0.5),yaw,0.04*(H(seed,3,0,0x341)-0.5)),[rBase,hM+0.6,rBase],colMain);
  // Secondary buttress ribs
  for(let k=0;k<3;k++){
   const az=yaw+(k/3)*TAU+0.35*H(seed,k,4,0x341);
   const rx=x+Math.cos(az)*rBase*0.72,rz=z+Math.sin(az)*rBase*0.72;
   const rh=hM*(0.48+0.24*H(seed,k,5,0x341));
   BIO.put('ch_spire_rib',[rx,y-0.45,rz],qEuler(0,az,0),[rBase*0.58,rh,rBase*0.58],colMain);
  }
  // Proud glassy teal-black lightning fulgurite melt-veins (+0.12 m outside spire face -> zero z-fighting!)
  let veins=0;
  if(fulgurite01>=0.35){
   const nV=fulgurite01>=0.7?3:2;
   for(let v=0;v<nV;v++){
    const vaz=yaw+v*2.1+0.3*H(seed,v,6,0x341);
    const vr=rBase*0.86+0.14;
    const vx=x+Math.cos(vaz)*vr,vz=z+Math.sin(vaz)*vr;
    BIO.put('ch_fulgurite_vein',[vx,y+0.25,vz],qEuler(0,vaz,-0.16),[1.15,hM*0.84,1.15],PAL.fulgurite[(seed+v)%PAL.fulgurite.length]);
    veins++;
   }
  }
  return{rBase:rBase,hM:hM,veins:veins};
 };

 // Octahedral impostors (34-core-impostor.js) for >= 7 m cuesta & gorge trees
 if(BIO.impostorSet&&BIO.impostor&&BIO.impostorItem){
  const impKeys=SKEY==='gorge'
   ?['gorgeplane','stonepine','corkoak','ironpistache','silkmulberry']
   :['stonepine','corkoak','ironpistache','whorlolive'];
  const IMP_SET=COMPASS.IMP_SET=BIO.impostorSet('compass-trees',{grid:4,cell:48,slots:impKeys.length});
  COMPASS.IMP={};
  impKeys.forEach(tk=>{
   COMPASS.IMP[tk]=BIO.impostor('compass-'+tk,()=>{
    COMPASS.growTree(tk,0,0,0,8100+tk.length*29,1.0);
   },{set:IMP_SET,label:byKey[tk]?byKey[tk].name:tk});
  });
  BIO.impostorItem('ch_tree_imp',IMP_SET,{label:'Compass Hills woodland far impostors'});
 }
})();
