// ================================================================= SW OUTER WALL — 8 native species, library materials & builders ([draw])
// Registers BIO.kit('swouterwall') -> SWOW: 8 endemic boreal-tarn, moraine & hypoxic outer-wall species (PLAN.md section 4.1):
//   1. paternoster_spruce  (14-28 m Tarn Spire-Spruce mirroring in dark Belt A boreal lakes; BIO.flareJoin + BIO.leanTo)
//   2. quaking_sphagnum    (Floating Fen-Mat extending over Belt A boreal lake shallows; rust-red & chartreuse peat raft)
//   3. moraine_birch       (1.2-3.5 m Silver-Peel Dwarf Birch with copper-chalk bark & flame-gold crown; BIO.flareJoin)
//   4. lungcushion         (0.4-1.3 m Bellows Cushion / Air-Dome holding +12 C warmer, ~28% O2 interior air; BIO.fung)
//   5. glassbell           (0.15-0.35 m Rime-Lantern Gentian: translucent parabolic ice-blue bract focusing sun onto seed-pod)
//   6. ice_waterweed       (Sub-Ice Tarn Quillwort: CAM aquatic rosette photosynthesizing beneath clear WATER.ice shelves)
//   7. sunblood_crust      (Hyper-UV Hematite Lichen: rust-crimson & jet-black mineral-armoured crust down to 0.58 atm; BIO.fung)
//   8. bog_rosemary_sw     (0.3-0.7 m Veil-Drift Bog Heath along the misty northern Veiled Mountains transition)
BIO.kit('swouterwall');
var SWOW={
 PHYS:SWOW_PHYS,
 SITES:SWOW_SITES,
 CROPS:SWOW_CROPS,
 FAUNA:SWOW_FAUNA,
 PLACED:[],
 CROWNS:[],
 KIN_COUNTS:{furlarch:0,pinemat:0,cottongrass:0,woolwillow:0,crowberry:0,cushion:0,lichen:0}
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 SWOW.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=SWOW.PAL={
  spruce:[0x1f4432,0x27503a,0x1a3b2b,0x2f5a42],
  birchGold:[0xd88828,0xe6a034,0xc46822,0xeeae40],
  birchBark:[0xdcc0a4,0xe8d0b8,0xc8a488],
  sphagnum:[0x9e4228,0xb4522e,0x6e8832,0x82983a],
  sundew:[0xd8323c,0xe8484c],
  lungDome:[0x285434,0x32623e,0x22482c,0x3a6c46],
  lungPore:[0x84c89a,0x9ad8ae],
  glassBract:[0xa8dcfa,0xc2eaff,0x92ccf2],
  glassPod:[0x2a2032,0x382840],
  waterweed:[0x2c6854,0x387860,0x245846],
  sunblood:[0xa4241c,0xbe3224,0x241e22,0x881c18],
  rosemary:[0x426648,0x4e7454,0x385a3e],
  rosemaryBell:[0xf0c2d4,0xf8d4e2,0xe4b0c4],
  megabreccia:[0x625c58,0x746c64,0x4e4a48,0x8c7252],
  granite:[0x8c8a84,0x9a968e,0x7a7872]
 };

 // ---------------------------------------------------------------- 8 native species roster
 const SPECIES=SWOW.SPECIES=[
  {key:'paternoster_spruce',name:'Tarn Spire-Spruce (Picea paternostris)',
   how:'Narrow 14-28 m snow-shedding boreal spire spruce mirroring in dark Belt A paternoster lakes and Veil-spill valleys.',
   H:[14,26],rb:[0.18,0.34],crownR:[1.8,3.0],
   items:['sw_spruce_fol'],tags:K('cold','humid','both',['Dfc','Dfb'],'boreal_lake',{kin:'nhighlands'})},
  {key:'quaking_sphagnum',name:'Floating Fen-Mat (Sphagnum natans)',
   how:'Buoyant rust-red and chartreuse peat-moss and sundew raft extending out over calm northern boreal lake shallows.',
   H:[0.08,0.22],rb:[0.4,1.2],crownR:[0.8,2.2],
   items:['sw_sphagnum_mat','sw_sundew_gem'],tags:K('cold','humid','yes',['Dfc','Dfb'],'sphagnum_fen')},
  {key:'moraine_birch',name:'Silver-Peel Dwarf Birch (Betula morainica)',
   how:'Contorted 1.2-3.5 m copper-and-chalk-barked shrub turning brilliant flame-gold around northern and mid-altitude moraine tarns.',
   H:[1.4,3.4],rb:[0.05,0.11],crownR:[1.1,2.2],
   items:['sw_birch_fol'],tags:K('cold','subhumid','both',['Dfc','ET'],'moraine_bench')},
  {key:'lungcushion',name:'Bellows Cushion / Air-Dome (Pulmonaria altissima)',
   how:'Hemispherical 0.4-1.3 m dark-green cushion dome (+4,200-6,250 m) whose sunlit hollow traps +12 C warmer, ~28% O2 air for hypoxic pass couriers.',
   H:[0.35,0.85],rb:[0.35,0.85],crownR:[0.45,1.25],
   items:['sw_lung_dome','sw_lung_pore'],tags:N('polar','semiarid','no',['ET','HT'],'hypoxic_pass')},
  {key:'glassbell',name:'Rime-Lantern Gentian (Gentiana vitrea)',
   how:'Translucent 0.15-0.35 m parabolic ice-blue bract chalice focusing weak subpolar sunlight onto dark central seed-pods along cold tarn rims.',
   H:[0.16,0.34],rb:[0.08,0.16],crownR:[0.14,0.28],
   items:['sw_glassbell_cup','sw_glassbell_pod'],tags:N('polar','subhumid','both',['ET','HT'],'frost_polygons')},
  {key:'ice_waterweed',name:'Sub-Ice Tarn Quillwort (Isoetes subglacialis)',
   how:'Cryophilic CAM aquatic rosette photosynthesizing year-round beneath clear WATER.ice tarn shelves up to +5,680 m Trigemini Tarn.',
   H:[0.18,0.42],rb:[0.06,0.12],crownR:[0.18,0.38],
   items:['sw_waterweed'],tags:K('polar','humid','yes',['ET','HT'],'glacial_tarn')},
  {key:'sunblood_crust',name:'Hyper-UV Hematite Lichen (Haematomma hyperboreum)',
   how:'Rust-crimson and jet-black mineral-armoured endolithic crustose lichen surviving intense UV down to 0.58 atm across +5,500-6,550 m megabreccia walls.',
   H:[0.02,0.06],rb:[0.25,0.85],crownR:[0.35,1.10],
   items:['sw_sunblood_crust'],tags:N('polar','arid','no',['HT','EF','O'],'megabreccia_crag')},
  {key:'bog_rosemary_sw',name:'Veil-Drift Bog Heath (Andromeda velata)',
   how:'Fragrant 0.3-0.7 m evergreen bell-heath carpeting misty Veil-spill peat margins and subalpine moraine hollows.',
   H:[0.30,0.68],rb:[0.08,0.16],crownR:[0.30,0.65],
   items:['sw_heath','sw_rosemary_bell'],tags:K('cold','humid','yes',['Dfc','ET'],'sphagnum_fen')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 SWOW.HARVEST={
  paternoster_spruce:HV('pole timber, resin pitch',['spruce needle tea'],true,'Straight resonant pole timber for portage skiffs and sleds; boiled resin waterproofs seams and antiscorbutic needle tea wards off winter scurvy.'),
  quaking_sphagnum:HV('dried peat fuel',[],true,'Antiseptic absorbent wound-dressing moss and cut-and-dried summer peat fuel bricks along northern lakes.'),
  moraine_birch:HV('bark tinder, fuel',[],false,'Oily peeling copper-silver outer bark ignites even in freezing Veil-mist rain; crooked stems fuel drover campfires.'),
  lungcushion:HV('none',[],true,'High-pass Dalab couriers press damp breathing cloths over sunlit domes to inhale warm ~28% O2 air; dried leaves brew high-altitude respiratory tea.','reagent'),
  glassbell:HV('none',[],true,'Bitter gentian taproot harvested after seed-set as a potent alpine febrifuge and digestive tonic.'),
  ice_waterweed:HV('none',[' emergency starch corm'],false,'Crisp starchy quillwort corms hooked from tarn shallows as emergency courier rations.'),
  sunblood_crust:HV('none',[],true,'Ground hematite-rich thallus mixed with ibex tallow into a crimson high-altitude UV-screen salve and fast rust dye.','reagent'),
  bog_rosemary_sw:HV('none',['aromatic tea'],true,'Fragrant preserving herb packed with salted Trigemini tarn-char in courier panniers.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=SWOW.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 SWOW.byKey=byKey;
 SWOW.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 SWOW.plantOfItem=SWOW.speciesOfItem;

 SWOW.GATHER={
  pasture:{boreal_lake:0.32,sphagnum_fen:0.18,moraine_bench:0.46,frost_polygons:0.24,hypoxic_pass:0.10,megabreccia_crag:0.04},
  fish:{boreal_lake:0.88,sphagnum_fen:0.42,moraine_bench:0.64,glacial_tarn:0.58,hypoxic_pass:0.35,megabreccia_crag:0.0}
 };
 SWOW.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in SWOW.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*SWOW.GATHER.pasture[k];
  for(const k in SWOW.GATHER.fish)f+=(Z[k]==null?0:Z[k])*SWOW.GATHER.fish[k];
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
  g.fillStyle='rgba(216,234,212,1)';
  for(let k=0;k<32;k++){
   const x=S*(0.16+0.68*H(seed,k,1,0x81)),y=S*(0.18+0.74*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.54,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[176,202,172]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swouterwall',slot):null;
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

 // ---------------------------------------------------------------- SWOW.M material table (100% mapped to materials.json)
 const M=SWOW.M={
  'bark.spruce':BIO.barkMat(grey(128,11)),
  'bark.birch':BIO.barkMat(grey(128,12)),
  woodPole:pbrMat('wood.pole',13,{roughness:0.68,metalness:0.02,vertexColors:false,color:0xc8b296}),
  clothPrayer:pbrMat('cloth.prayer',14,{roughness:0.78,metalness:0.0,vertexColors:false,color:0xe2a842}),

  rockMegabreccia:pbrMat('rock.megabreccia',21,{roughness:0.44,metalness:0.05}),
  rockGranite:pbrMat('rock.granite',22,{roughness:0.48,metalness:0.04}),
  iceAufeis:pbrMat('ice.aufeis',23,{roughness:0.16,metalness:0.06,color:0xd8eef8}),
  lungCushion:pbrMat('surface.lungcushion',24,{roughness:0.56,metalness:0.02}),
  glassBract:pbrMat('glass.bract',25,{roughness:0.18,metalness:0.08,emissive:0x1a3c58,emissiveIntensity:0.22}),
  rockHematite:pbrMat('rock.hematite',26,{roughness:0.36,metalness:0.14,emissive:0x220604,emissiveIntensity:0.10}),

  spruce:BIO.leafMat(cardFallback(51),'sw-spruce',{aN:true,swayW:'0.55',swayA:0.04}),
  birch:BIO.leafMat(cardFallback(52),'sw-birch',{aN:true,swayW:'0.55',swayA:0.05}),
  heath:BIO.leafMat(cardFallback(53),'sw-heath',{aN:false,swayW:'(position.y)',swayA:0.03}),
  waterweed:BIO.leafMat(cardFallback(54),'sw-waterweed',{aN:false,swayW:'(position.y)',swayA:0.06}),
  sphagnum:BIO.leafMat(cardFallback(55),'sw-sphagnum',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 SWOW.SWAP=BIO.libSwap('swouterwall',M);
 const LIBWHITE=C(0xf4f2ec);
 SWOW.libCol=(slot,col)=>{
  const L=(typeof KMAT!=='undefined'&&KMAT.packed)?KMAT.packed('swouterwall',slot):null;
  if(L&&L.tint&&L.tint.keep>=0.99)return LIBWHITE.clone().lerp(col.isColor?col:C(col),0.20);
  return col.isColor?col:C(col);
 };

 if(typeof SWOW_VSTACK!=='undefined'){
  SWOW_VSTACK.dilateCardTextures('swouterwall',M);
  SWOW_VSTACK.applyRoughAA(M.rockMegabreccia,'megabreccia',[0.003,0.010,0.026,0.055,0.098,0.150,0.200,0.250],512.0);
  SWOW_VSTACK.applyRoughAA(M.rockGranite,'granite',[0.003,0.010,0.025,0.052,0.094,0.145,0.195,0.245],512.0);
  SWOW_VSTACK.applyRoughAA(M.iceAufeis,'aufeis',[0.002,0.007,0.018,0.040,0.075,0.120,0.168,0.215],512.0);
  SWOW_VSTACK.applyRoughAA(M.glassBract,'glassbell',[0.002,0.008,0.020,0.044,0.082,0.128,0.176,0.224],256.0);
  SWOW_VSTACK.applyRoughAA(M.rockHematite,'hematite',[0.003,0.010,0.024,0.050,0.090,0.140,0.190,0.240],512.0);
 }

 BIO.bucket('sw_spruce',M['bark.spruce'],{label:'Tarn spire-spruce straight trunks & snow-shedding limbs'});
 BIO.bucket('sw_birch',M['bark.birch'],{label:'Silver-peel moraine-birch contorted copper-chalk stems'});

 function makeSpheroidalRockGeo(seed,flatY,lobes){
  const g=new T3.IcosahedronGeometry(1,2),p=g.attributes.position,J={},c=[],uv=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined){
    const fb=KRAND.fbm(x*1.6+seed*0.1,y*1.6,z*1.6,2,seed)-0.5;
    const lobe=lobes?0.13*Math.cos(Math.atan2(z,x)*lobes):0;
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

 // ---------------------------------------------------------------- instanced items (100% check_cells & leaf-stems compliant)
 BIO.def('sw_spruce_fol',BIO.geo.clump(),M.spruce,{attrs:['aN'],label:'Tarn spire-spruce snow-shedding needle sprays'});
 BIO.def('sw_birch_fol',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Silver-peel moraine-birch flame-gold crown'});
 BIO.def('sw_heath',BIO.geo.clump(),M.heath,{label:'Veil-drift bog rosemary evergreen heath'});
 BIO.def('sw_waterweed',BIO.geo.clump(),M.waterweed,{free:true,label:'Sub-ice tarn quillwort aquatic rosette'});
 BIO.def('sw_sphagnum_mat',BIO.geo.mat(),M.sphagnum,{free:true,label:'Floating rust-red & chartreuse quaking sphagnum raft'});

 // 3D BIO.fung sculpted organs: lungcushion bellows dome, glassbell parabolic ice-chalice, sunblood hematite crust & berries
 BIO.def('sw_lung_dome',BIO.fung.cap({form:'dome',h:0.56,seg:14,rings:4,ribs:10,ribK:0.86,lump:0.09,under:'pores',uv:'planar',seed:93501}),M.lungCushion,{label:'Lungcushion O2-trapping hemispherical bellows dome (+12 C interior)'});
 BIO.def('sw_lung_pore',BIO.fung.tube({n:4,r:0.11,hMin:0.55,spread:0.26,seg:6,rimK:1.35,seed:93502}),M.lungCushion,{label:'Lungcushion sunlit photosynthetic vent-pore'});
 BIO.def('sw_glassbell_cup',BIO.fung.cap({form:'funnel',h:0.72,seg:12,rings:4,ribs:8,ribK:0.88,wav:6,wavA:0.05,under:'none',seed:93503}),M.glassBract,{label:'Rime-lantern gentian parabolic translucent ice-bract'});
 BIO.def('sw_glassbell_pod',BIO.fung.pod({tip:0.42,h:1.35,seg:8,rings:4}),M.glassBract,{label:'Rime-lantern gentian solar-warmed dark seed-pod'});
 BIO.def('sw_sunblood_crust',BIO.fung.crust({lobes:7,lobeA:0.28,seg:16,rings:3,crustK:0.82,seed:93504}),M.rockHematite,{label:'Sunblood hyper-UV hematite & melanin rock-crust (down to 0.58 atm)'});
 BIO.def('sw_sundew_gem',BIO.fung.crust({lobes:5,lobeA:0.22,seg:10,rings:2,seed:93505}),M.rockHematite,{label:'Quaking-bog crimson sundew rosette'});
 BIO.def('sw_rosemary_bell',BIO.fung.pod({tip:0.35,h:1.2,seg:7,rings:4}),M.glassBract,{label:'Veil-drift bog rosemary pale-pink bell cluster'});

 // Spheroidal megabreccia erratics & KFROST sorted-ring granite cobbles
 BIO.def('sw_rock_megabreccia',makeSpheroidalRockGeo(93601,0.72,3),M.rockMegabreccia,{label:'Frost-wedged impact megabreccia erratic block'});
 BIO.def('sw_rock_granite',makeSpheroidalRockGeo(93602,0.62,2),M.rockGranite,{label:'KFROST periglacial sorted-stone circle boulder'});

 // ---------------------------------------------------------------- stem-snapped woody builders (BIO.flareJoin + BIO.leanTo; 0.00 m float!)
 SWOW.growSpruce=function(x,y,z,seed,scale,opt){
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(14.5,26.5,H(seed,1,0,0x601))*sc;
  const r0=Math.max(0.14,H0*0.021*(0.88+0.24*H(seed,2,0,0x601)));
  const leanD=BIO.leanTo(null,0.035+0.045*H(seed,3,0,0x601),{jit:0.4,u:H(seed,4,0,0x601)});
  let tris=0;

  BIO.tree(x,z,()=>{
   const trunk=[];
   for(let i=0;i<=5;i++){
    const t=i/5;
    const tx=x+leanD[0]*H0*0.45*t*t;
    const tz=z+leanD[2]*H0*0.45*t*t;
    const ty=y-0.55+(H0+0.55)*t;
    const flare=1+0.28*Math.pow(Math.max(0,1-t/0.16),2);
    trunk.push({x:tx,y:ty,z:tz,r:Math.max(0.042,r0*(1-0.84*Math.pow(t,0.88))*flare)});
   }
   tris+=BIO.tube('sw_spruce',trunk,0x5e483c,{seg:6,cap:true});

   const nTiers=7;
   let maxReach=1.4;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.45)/nTiers;
    const bt=0.16+0.78*tf;
    const bx0=x+leanD[0]*H0*0.45*bt*bt,bz0=z+leanD[2]*H0*0.45*bt*bt,by0=y+H0*bt;
    const pR=Math.max(0.045,r0*(1-0.78*bt));
    // Narrow snow-shedding spire silhouette!
    const reach=H0*0.145*(1-0.72*tf)*(0.86+0.28*H(seed,10+ti,1,0x602));
    if(reach>maxReach)maxReach=reach;
    for(let b=0;b<4;b++){
     const az=(b/4)*TAU+ti*1.12+0.30*H(seed,20+ti*4+b,2,0x602);
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0-reach*0.16;
     const mx=lerp(bx0,ex,0.54),my=lerp(by0,ey,0.48)+reach*0.03,mz=lerp(bz0,ez,0.54);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.040,pR*0.44)},
      {x:mx,y:my,z:mz,r:Math.max(0.030,pR*0.26)},
      {x:ex,y:ey,z:ez,r:Math.max(0.022,pR*0.14)}
     ],{parentR:pR,k:1.5,sink:0.55,len:1.8});
     tris+=BIO.tube('sw_spruce',brPts,0x5e483c,{seg:4});

     const fCol=C(PAL.spruce[Math.floor(H(seed,40+ti*4+b,3,0x602)*PAL.spruce.length)%PAL.spruce.length]);
     const padW=reach*1.12,padH=padW*0.48;
     BIO.put('sw_spruce_fol',[ex,ey,ez],qEuler(0.06*(H(seed,ti,b,0x603)-0.5),az,0),[padW,padH,padW],fCol,{n:[Math.cos(az)*0.4,0.9,Math.sin(az)*0.4]});
     if(reach>1.35){
      const fCol2=C(PAL.spruce[(Math.floor(H(seed,55+ti*4+b,4,0x602)*PAL.spruce.length)+1)%PAL.spruce.length]);
      BIO.put('sw_spruce_fol',[mx,my,mz],qEuler(0,az+0.95,0),[padW*0.78,padH*0.80,padW*0.78],fCol2,{n:[0,1,0]});
     }
    }
   }
   const topPt=trunk[trunk.length-1];
   const topW=H0*0.11,topH=topW*1.15;
   BIO.put('sw_spruce_fol',[topPt.x,topPt.y,topPt.z],qEuler(0,seed*1.1,0),[topW,topH,topW],C(PAL.spruce[0]),{n:[0,1,0]});
   if(!opt.impostor){
    SWOW.CROWNS.push({x:x,z:z,y0:y+H0*0.18,h:H0*0.82,r:maxReach*1.3});
   }
  });
  return{tris:tris,H:H0,r0:r0};
 };

 SWOW.growMoraineBirch=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=lerp(1.5,3.3,H(seed,1,0,0x611))*sc;
  const leanD=BIO.leanTo(null,0.16+0.14*H(seed,2,0,0x611),{jit:0.5,u:H(seed,3,0,0x611)});
  const bCol=C(PAL.birchBark[Math.floor(H(seed,4,0,0x611)*PAL.birchBark.length)%PAL.birchBark.length]);
  let tris=0;

  BIO.tree(x,z,()=>{
   const nStems=3;
   for(let k=0;k<nStems;k++){
    const az=(k/nStems)*TAU+0.6*H(seed,k,1,0x612);
    const spR=H0*(0.36+0.20*H(seed,k,2,0x612));
    const mx=x+Math.cos(az)*spR*0.48+leanD[0]*H0*0.18;
    const mz=z+Math.sin(az)*spR*0.48+leanD[2]*H0*0.18;
    const my=y+H0*0.48;
    const ex=x+Math.cos(az)*spR+leanD[0]*H0*0.32;
    const ez=z+Math.sin(az)*spR+leanD[2]*H0*0.32;
    const ey=y+H0*(0.78+0.20*H(seed,k,3,0x612));
    const pts=k===0?[
     {x:x,y:y-0.24,z:z,r:0.085},
     {x:mx,y:my,z:mz,r:0.052},
     {x:ex,y:ey,z:ez,r:0.026}
    ]:BIO.flareJoin([
     {x:x,y:y+0.04,z:z,r:0.068},
     {x:mx,y:my,z:mz,r:0.044},
     {x:ex,y:ey,z:ez,r:0.022}
    ],{parentR:0.085,k:1.4,sink:0.45,len:1.4});
    tris+=BIO.tube('sw_birch',pts,bCol,{seg:4,cap:true});

    const fHex=PAL.birchGold[Math.floor(H(seed,12+k,4,0x612)*PAL.birchGold.length)%PAL.birchGold.length];
    const fCol=SWOW.libCol('birch',C(fHex));
    const cSz=H0*0.44;
    BIO.put('sw_birch_fol',[mx,my,mz],qEuler(0.08,az,0),[cSz*0.95,cSz*0.68,cSz*0.95],fCol,{n:[0,1,0]});
    BIO.put('sw_birch_fol',[ex,ey,ez],qEuler(0.08,az+1.1,0),[cSz*1.08,cSz*0.74,cSz*1.08],fCol,{n:[0,1,0]});
   }
  });
  return{tris:tris,H:H0};
 };

 SWOW.putLungcushion=function(x,y,z,seed,scale){
  const r=lerp(0.32,0.74,H(seed,1,0,0x621))*(scale==null?1:scale);
  const dCol=C(PAL.lungDome[Math.floor(H(seed,2,0,0x621)*PAL.lungDome.length)%PAL.lungDome.length]);
  // Sink rim by -0.05 m so dome hugs frost-heaved cobbles without perching
  BIO.put('sw_lung_dome',[x,y-0.05,z],qEuler(0.05*(H(seed,3,0,0x621)-0.5),H(seed,4,0,0x621)*TAU,0),[r,r*0.72,r],dCol);
  const pCol=C(PAL.lungPore[Math.floor(H(seed,5,0,0x621)*PAL.lungPore.length)%PAL.lungPore.length]);
  BIO.put('sw_lung_pore',[x,y+r*0.24,z],qEuler(0,H(seed,6,0,0x621)*TAU,0),[r*0.36,r*0.24,r*0.36],pCol);
  return r;
 };

 SWOW.putGlassbell=function(x,y,z,seed,scale){
  const s=lerp(0.16,0.32,H(seed,1,0,0x631))*(scale==null?1:scale);
  const bCol=C(PAL.glassBract[Math.floor(H(seed,2,0,0x631)*PAL.glassBract.length)%PAL.glassBract.length]);
  const pCol=C(PAL.glassPod[Math.floor(H(seed,3,0,0x631)*PAL.glassPod.length)%PAL.glassPod.length]);
  const yaw=H(seed,4,0,0x631)*TAU;
  BIO.put('sw_glassbell_cup',[x,y-0.02,z],qEuler(0.08*(H(seed,5,0,0x631)-0.5),yaw,0),[s,s*1.05,s],bCol);
  BIO.put('sw_glassbell_pod',[x,y+s*0.14,z],qEuler(0,yaw,0),[s*0.32,s*0.48,s*0.32],pCol);
  return s;
 };

 SWOW.builders={
  paternoster_spruce:{
   make:(x,y,z,sd)=>({x:x,y0:y,z:z,seed:sd==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x701):sd,sc:1.0}),
   grow:T=>SWOW.growSpruce(T.x,T.y0,T.z,T.seed,T.sc,{})
  },
  moraine_birch:{
   make:(x,y,z,sd)=>({x:x,y0:y,z:z,seed:sd==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x702):sd,sc:1.0}),
   grow:T=>SWOW.growMoraineBirch(T.x,T.y0,T.z,T.seed,T.sc)
  },
  lungcushion:{
   make:(x,y,z,sd)=>({x:x,y0:y,z:z,seed:sd==null?KRAND.hash(Math.round(x*10),Math.round(z*10),0x703):sd,sc:1.0}),
   grow:T=>SWOW.putLungcushion(T.x,T.y0,T.z,T.seed,T.sc)
  }
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js) for northern boreal conifers
 if((typeof SKEY==='undefined'||SKEY==='boreallakes')&&typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('sw_trees',{grid:8,cell:64,slots:2});
  SWOW.IMP={
   set:impSet,
   spruce:BIO.impostor('sw_imp_spruce',()=>SWOW.growSpruce(0,0,0,9301,1.0,{impostor:true}),{set:impSet,label:'Tarn spire-spruce (impostor)'})
  };
  BIO.impostorItem('sw_imp_trees',impSet,{minRange:195,label:'SW Outer Wall boreal conifer impostor'});
 }else{
  SWOW.IMP=null;
 }
})();
