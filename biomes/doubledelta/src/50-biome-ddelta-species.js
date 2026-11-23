// ================================================================= DOUBLEDELTA — species, biogenic structures & gather contract (PLAN.md §5, §7)
// Declares window.DOUBLEDELTA (aliased as DDELTA) in BIO.kit('doubledelta').
// 22 species & biogenic features:
//   - 17 wild delta-bowl species/features (< +25 m): colonial siliceous sponge bioherms (chimneysponge fluted barrel, organ-pipe & terraced reef-mound,
//     brainsponge, glassbasket), rainbow tarfelt, flexible sea-pens & hydroids (seapen, whippen, snaphydroid), bivalves (penshell, visoroyster),
//     hydro-elastic reeds & floating peat-mats (bellowsreed, bamboorice, tetherpad, wildrice, brimreed, fensedge), tsunami driftwrack, and scoured riaamber.
//   - 5 maritime bluff-forest woody species (bluffoak, bluffcedar, bluffcypress, bluffpine, bluffbamboo) strictly gated above DDELTA_PHYS.trimlineAt!
// Every material slot maps to a genuine packed library texture via BIO.libSwap('doubledelta', M) + PBR normal/roughness maps (0 untextured meshes).
BIO.kit('doubledelta');
var DOUBLEDELTA={SITES:DDELTA_SITES,PHYS:DDELTA_PHYS};
var DDELTA=DOUBLEDELTA;
(function(){
 const {TAU,clamp,smooth}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 DOUBLEDELTA.C=C;

 const KT=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,origin:'krator'},o||{});
 const ET=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,origin:'earth'},o||{});
 const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});

 // ---------------------------------------------------------------- palettes (sRGB hex)
 const PAL=DOUBLEDELTA.PAL={
  spongeOchre:[0xc89648,0xb8843c,0xd4a456,0x9e7c44],
  spongeTeal:[0x52887a,0x649684,0x487a6e,0x789c78],
  spongePlum:[0x7e4e68,0x8e5a74,0x6c445a],
  brain:[0x8a9a68,0xa68e52,0xb8aa7c,0x748862],
  glass:[0xe8ece8,0xdce6e4,0xf2f4ef],
  tarfelt:[0x3e2c4a,0x2e4a4c,0x5a4228,0x48324e],
  seapenPink:[0xd8687e,0xe27c6a,0xc85878],
  seapenOchre:[0xdca244,0xe6b456,0xc88a38],
  seapenViolet:[0x8a62a8,0x9c72b6,0x745296],
  whippen:[0xe6dcd8,0xd4789c,0xead8e2],
  hydroid:[0x9ab464,0xb4be68,0x84a458],
  penshell:[0x9c6e38,0x8a5e30,0xb07e44],
  byssus:[0xdcb044,0xe8c258,0xc89a34],
  oyster:[0xd8dad4,0xc8ccc4,0xe4e6df],
  reed:[0x6e8c48,0x7e9a52,0x5e7c3e,0x8aa05c],
  culm:[0x7a8e4c,0x8c9a56,0x687e42],
  bamboo:[0x4e7e3e,0x5c8c48,0x447236],
  rice:[0xb8a44c,0xc8b458,0x969848],
  wildrice:[0x7c8a46,0x8e9850,0x6e7c3e],
  lotus:[0x487c5c,0x568a68,0x3e7052],
  brimreed:[0x6e5434,0x7c603c,0x5c462c],
  sedge:[0x6c8044,0x7c8e4e,0x5e723c],
  wrack:[0x7c3442,0x685834,0x8c3e4a],
  driftwood:[0x8c8274,0x7c7266,0x9a9082],
  amber:[0xe29824,0xd47418,0xf0b238,0xb84a18],
  bark:[0x6c5c4c,0x5e5042,0x7a6a58],
  cedarBark:[0x7a4e3a,0x6c4432,0x885842],
  oakLeaf:[0x3a6434,0x46723e,0x32582e],
  cedarLeaf:[0x2c5236,0x365e40,0x264830],
  cypressLeaf:[0x34583c,0x3e6446,0x2c4e34],
  pineLeaf:[0x305434,0x3a603e,0x2a4a2e]
 };

 // ---------------------------------------------------------------- species roster
 const SPECIES=DOUBLEDELTA.SPECIES=[
  {key:'chimneysponge',name:'Great Chimney-Sponge (Oscularia turris)',
   how:'house-sized colonial siliceous-spongin bioherm (2-6.2 m) in fluted barrel, organ-pipe and terraced reef-mound forms; compresses 45% under Ghost-Tsunami bores and exhales warm mist from apical oscula',
   items:['ddchimney','ddorgan','ddmound'],gather:'sponge-felt',
   tags:KT('tropic','humid','both',['Am'],{zone:'spongebraid',form:'sponge-bioherm'})},
  {key:'brainsponge',name:'Cushion Brain-Hummock (Spongilla labyrinthica)',
   how:'low hemispherical siliceous-spongin dome (0.5-2.2 m) covered in convoluted meandroid ridges stabilizing distributary point-bars',
   items:['ddbrain'],gather:'sponge-felt',
   tags:KT('tropic','humid','both',['Am'],{zone:'spongebraid',form:'sponge-bioherm'})},
  {key:'glassbasket',name:'Venus-Lattice Tower (Euplectella riaensis)',
   how:'opal-white cylindrical silica-spongin lattice spire (0.8-2.6 m) along silica-rich distributary levee toes',
   items:['ddglass'],gather:'silica-cullet',
   tags:KT('tropic','humid','yes',['Am'],{zone:'spongebraid',form:'sponge-bioherm'})},
  {key:'tarfelt',name:'Rainbow Seep-Mat (Bituminaria iridescens)',
   how:'glossy black-violet and bronze-teal iridescent hydrocarbon-oxidising fungoid collar ringing natural bitumen = 118 tar-seeps',
   items:['ddtarfelt'],gather:'bitumen-pitch',
   tags:KT('tropic','humid','no',['Am'],{zone:'scourseep',form:'crust'})},
  {key:'seapen',name:'Calcified Feather Sea-Pen (Pennatula elastica)',
   how:'flexible feathered octocoral plume (0.6-2.4 m) in pink, saffron-ochre and violet; bends 85 deg flush into silt under tidal wash and bores',
   items:['ddseapen'],
   tags:KT('tropic','humid','yes',['Am'],{zone:'seapenflat',form:'seapen-whip'})},
  {key:'whippen',name:'Wire-Whip Sea-Pen (Funiculina flagellum)',
   how:'slender spiralled ivory-and-magenta octocoral whip (1.2-3.5 m) streaming in tidal channel margins',
   items:['ddwhippen'],
   tags:KT('tropic','humid','yes',['Am'],{zone:'seapenflat',form:'seapen-whip'})},
  {key:'snaphydroid',name:'Clap-Plume Hydroid (Aglaophenia mordax)',
   how:'amber-green colonial hydrozoan fan on intertidal mudflats that snaps shut on stranded shrimp during post-surge drain-off',
   items:['ddhydroid'],
   tags:KT('tropic','humid','yes',['Am'],{zone:'seapenflat',form:'hydroid'})},
  {key:'penshell',name:'Giant Sea-Byssus Fan-Mussel (Pinna aurata)',
   how:'upright triangular ribbed shell (0.6-1.35 m) anchored two-thirds deep in shell-lag bars by gleaming golden keratin byssus cables',
   items:['ddpenshell','ddbyssus'],gather:'sea-byssus',
   tags:ET('tropic','humid','yes',['Am'],{zone:'surfbar',form:'byssus-bivalve'})},
  {key:'visoroyster',name:'Surge-Clamp Reef Oyster (Crassostrea librata)',
   how:'cemented silver-white shell bioherm encrusting shell lags and Ria Sound limestone libration notches; slams watertight on pre-bore drawdown',
   items:['ddoyster'],
   tags:ET('tropic','humid','yes',['Am'],{zone:'surfbar',form:'byssus-bivalve'})},
  {key:'bellowsreed',name:'Pneumatophore Bellows-Reed (Phragmites follis)',
   how:'giant segmented salt-reed (1.8-4.2 m) with swollen pleated basal air-bladders that pump oxygen to anoxic clay roots and fold flat under bores',
   items:['ddreed','ddculm','ddbladder'],
   tags:KT('tropic','humid','yes',['Am'],{zone:'spongebraid',form:'reed'})},
  {key:'bamboorice',name:'Delta Bamboo-Rice (Bambusa oryzoides)',
   how:'supple emerald culms heavy with golden grain panicles riding surges on 20 m elastomeric tap-rhizome floating peat-mats',
   items:['ddbambooculm','ddbambooleaf','ddpanicle'],
   tags:ET('tropic','humid','yes',['Am'],{zone:'peatmat',form:'tethered-mat'})},
  {key:'tetherpad',name:'Cable-Lotus (Nelumbo funis)',
   how:'broad waxy peltate pads floating in slackwater peat-ponds on spiral-coiled 20 m anchor petioles',
   items:['ddpad','ddtether'],
   tags:ET('tropic','humid','yes',['Am'],{zone:'peatmat',form:'tethered-mat'})},
  {key:'wildrice',name:'Estuarine Wild-Rice (Zizania palustris var.)',
   how:'feathery olive-gold grain ribbons lining fresher inner distributary channels',
   items:['ddwildrice'],
   tags:ET('tropic','humid','yes',['Am'],{zone:'peatmat',form:'reed'})},
  {key:'brimreed',name:'Bitumen-Reed (Juncus bituminosus)',
   how:'dark-bronze hydrocarbon-waxy rush fringing bitumen tar-seeps and lignite scour ledges',
   items:['ddbrimreed'],
   tags:ET('tropic','humid','both',['Am'],{zone:'scourseep',form:'reed'})},
  {key:'fensedge',name:'Brackish Tussock-Sedge (Carex aestuaria)',
   how:'dense fibrous tussock sedge binding peat benches and scour-channel shoulders',
   items:['ddsedge'],
   tags:ET('tropic','humid','both',['Am'],{zone:'peatmat',form:'sedge'})},
  {key:'driftwrack',name:'Tsunami Storm-Wrack and Driftwood',
   how:'crimson wineweed sheets and salt-bleached upriver timber stranded in long wrack lines by tsunami backwash',
   items:['ddwrack','dddriftlog'],gather:'storm-wrack',
   tags:KT('tropic','humid','both',['Am'],{zone:'surfbar',form:'wrack'})},
  {key:'riaamber',name:'Scoured Blue-Clay Ria-Amber Nodule (Succinum riaense)',
   how:'translucent golden, honey-orange and cherry-red fossil resin nodules winnowed out of slate-blue glauconite clay in tsunami scour-channels',
   items:['ddamber'],gather:'ria-amber',
   tags:ET('tropic','humid','yes',['Am'],{zone:'scourseep',form:'nodule'})},
  /* Bluff-only woody trees: strictly forbidden below MIN_WOODY_Y (>= +25..+38 m) */
  {key:'bluffoak',name:'Maritime Bluff Oak (Quercus maritima)',
   how:'broad wind-firm evergreen oak crowning Ria Sound loess-capped bluffs strictly above the Ghost-Tsunami trimline',
   items:['ddoaktrunk','ddoakcrown'],woody:true,
   tags:ET('tropic..subtropic','humid','no',['Am','Cfa'],{zone:'riabluff',form:'woody-tree'})},
  {key:'bluffcedar',name:'Ria Bluff Redcedar (Thuja riaensis)',
   how:'aromatic rot-resistant coastal redcedar on safe >= +42 m Ria Sound headlands above tsunami runup',
   items:['ddcedartrunk','ddcedarcrown'],woody:true,
   tags:ET('tropic..subtropic','humid','no',['Am','Cfa'],{zone:'riabluff',form:'woody-tree'})},
  {key:'bluffcypress',name:'Headland Sea-Cypress (Cupressus litoralis)',
   how:'fluted wind-sculpted coastal cypress along safe upper limestone bluff brows overlooking the delta throat',
   items:['ddcyptrunk','ddcypcrown'],woody:true,
   tags:ET('tropic..subtropic','humid','no',['Am','Cfa'],{zone:'riabluff',form:'woody-tree'})},
  {key:'bluffpine',name:'Maritime Stone-Pine (Pinus maritima)',
   how:'umbrella-crowned coastal pine on well-drained upper limestone and loess spurs above +45 m',
   items:['ddpinetrunk','ddpinecrown'],woody:true,
   tags:ET('tropic..subtropic','humid','no',['Am','Cfa'],{zone:'riabluff',form:'woody-tree'})},
  {key:'bluffbamboo',name:'Bluff Timber-Bamboo (Phyllostachys altus)',
   how:'tall thick-walled timber bamboo groves on the safe Ria Sound bluff supplying sacrificial delta harvesting racks and poles',
   items:['ddbluffculm','ddbluffleaf'],woody:true,
   tags:ET('tropic..subtropic','humid','no',['Am','Cfa'],{zone:'riabluff',form:'woody-tree'})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 DOUBLEDELTA.HARVEST={
  chimneysponge:HV('none',[],true,'Cut outer spongin-felt cured as surgical dressings, shock-absorbing brigandine padding, water filters, and reagent silica-ash.'),
  brainsponge:HV('none',[],false,'Dense elastic bath and hull-caulking sponge; upper chambers hold fresh rainwater.'),
  glassbasket:HV('none',[],false,'Calcined spicule-glass cullet reagent for optical lantern glassmaking and fine polishing powder.'),
  tarfelt:HV('none',[],true,'Scraped with bitumen pitch as antiseptic marine hull-caulking and waterproof boot salve.'),
  seapen:HV('none',[],false,'Dried calcified axial rods bundled into flexible fish-weir wattle and basket ribs.'),
  whippen:HV('none',[],false,'Tough gorgonin-lime cores twisted into rot-proof skiff painter cordage.'),
  snaphydroid:HV('none',[],true,'Diluted nematocyst vinegar-wash used by Ria boatmen as a counter-irritant liniment.'),
  penshell:HV('none',['adductor meat'],false,'Combed golden holdfast beard spun into weightless iridescent Sea-Byssus silk cloth; nacreous shell inlay.'),
  visoroyster:HV('none',['oyster'],false,'Rich estuarine oyster meat; burnt shells yield high-purity hydraulic slaked lime mortar.'),
  bellowsreed:HV('thatch, weaving, fuel (dried reed)',['young shoot'],false,'Split culms woven into duck-blinds, skiff fenders, and floating mat-rafts.'),
  bamboorice:HV('straw, thatch',['bamboo-rice grain','culm shoot'],false,'Harvested from seasonal skiffs at low water; primary wild grain of the delta.'),
  tetherpad:HV('none',['lotus-root','lotus-seed'],true,'Starchy rhizome dug in dry-season lows; astringent medicinal seed-head tea.'),
  wildrice:HV('thatch',['wild-rice grain'],false,'Nutty black grain knocked directly into Ria Sound harvesting skiffs.'),
  brimreed:HV('fuel (resin-wicks)',[],false,'Pith dipped in seep-bitumen makes waterproof storm-torches.'),
  fensedge:HV('thatch, matting',[],false,'Plaited into resilient salt-proof kneeling mats and skiff cushions.'),
  driftwrack:HV('timber (seasoned driftwood), fertiliser',['dried nori sheet'],false,'Tsunami-seasoned drift logs salvaged by skiff-crews; wineweed boiled for agar sizing.'),
  riaamber:HV('none',[],true,'Golden and cherry fossil resin prized for electrostatic insulators, liquid-amber compasses, succinic varnish, and medicinal incense.'),
  bluffoak:HV('timber (ship frames, heavy joinery), firewood',['acorn'],false,'Dense bluff timber safely above the tsunami trimline; tanbark cures fishing nets.'),
  bluffcedar:HV('timber (rot-proof skiff planking, carving)',[],false,'Light fragrant redcedar split for Ria Sound harvesting skiffs and hórreo granary posts.'),
  bluffcypress:HV('timber (slipway piles, chests)',[],true,'Resinous water-resistant timber for lower bench slipway rails.'),
  bluffpine:HV('timber (masts, spars), resin',['pine nut'],false,'Tapped for turpentine pitch blended with delta bitumen.'),
  bluffbamboo:HV('poles, scaffolding, weaving',['bamboo shoot'],false,'Fast-regrowing poles for sacrificial delta sponge-racks and amber sluice-boxes.')
 };
 SPECIES.forEach(S=>{
  S.tags.harvest=DOUBLEDELTA.HARVEST[S.key];
  if(S.gather)S.tags.role='gather:'+S.gather;
 });
 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 DOUBLEDELTA.byKey=byKey;
 DOUBLEDELTA.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};

 /* KTRAPS record for snaphydroid (core/biome 37-core-traps.js) */
 DOUBLEDELTA.TRAP=typeof KTRAPS!=='undefined'?KTRAPS.make({
  kind:'snap',mouth:0.12,preyMax:'small',cycle:{wait:18,shut:0.35,digest:45,reopen:4},lure:'motion',danger:0.08
 }):null;
 if(DOUBLEDELTA.TRAP)byKey.snaphydroid.tags.trap=DOUBLEDELTA.TRAP;

 /* core/hamlet gather contract (KHAMLET.GATHER_KEYS = {pasture, fish, salt}) + resource query */
 DOUBLEDELTA.GATHER={
  pasture:{peatmat:0.35,riabluff:0.55,spongebraid:0.12,surfbar:0,seapenflat:0,scourseep:0.05},
  fish:{surfbar:0.95,seapenflat:0.88,spongebraid:0.72,peatmat:0.45,scourseep:0.20,riabluff:0}
 };
 DOUBLEDELTA.gatherOf=function(Z){
  const G=DOUBLEDELTA.GATHER;
  let p=0,f=0;
  for(const k in G.pasture)p+=(Z[k]||0)*G.pasture[k];
  for(const k in G.fish)f+=(Z[k]||0)*G.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:Boolean((Z.surfbar||0)>0.65&&(Z.evap||0)>0.5)};
 };
 DOUBLEDELTA.zonesAt=function(x,z){
  const eco=ECOTONE_AT(x,z),out={surfbar:0,seapenflat:0,spongebraid:0,peatmat:0,scourseep:0,riabluff:0};
  out[eco.zone]=1;
  return out;
 };
 DOUBLEDELTA.gather=function(x,z){return DOUBLEDELTA.gatherOf(DOUBLEDELTA.zonesAt(x,z));};
 DOUBLEDELTA.resourcesAt=function(x,z){
  return{
   amber:L.AMBER(x,z),
   bitumen:L.BITUMEN(x,z),
   blueClay:L.BLUECLAY(x,z),
   sponge:ECOTONE_AT(x,z).spongeOk?clamp(SILICA_AT(x,z)/26,0,1):0,
   byssus:ECOTONE_AT(x,z).byssusOk?L.LAG(x,z):0
  };
 };

 // ---------------------------------------------------------------- procedural fallback cards & PBR materials (swapped to packed library textures)
 const mkCard=(rgb,draw)=>BIO.alphaTex(256,(g,S)=>draw(g,S),rgb);
 const TX={
  seapen:mkCard([225,175,185],(g,S)=>{g.strokeStyle='rgba(240,210,215,1)';g.lineWidth=4;g.beginPath();g.moveTo(S*0.5,S*0.96);g.quadraticCurveTo(S*0.46,S*0.5,S*0.52,S*0.08);g.stroke();
   for(let k=0;k<22;k++){const t=0.12+0.78*(k/21),y=S*(1-t),w=S*0.32*Math.sin(t*Math.PI);g.lineWidth=3;g.beginPath();g.moveTo(S*0.5,y);g.lineTo(S*0.5-w,y-S*0.05);g.moveTo(S*0.5,y);g.lineTo(S*0.5+w,y-S*0.05);g.stroke();}}),
  whippen:mkCard([235,215,225],(g,S)=>{g.strokeStyle='rgba(240,225,232,1)';g.lineWidth=3.5;for(let k=0;k<7;k++){const x0=S*(0.2+0.6*(k/6));g.beginPath();g.moveTo(x0,S*0.98);g.bezierCurveTo(x0-S*0.08,S*0.62,x0+S*0.1,S*0.32,x0+S*0.04,S*0.04);g.stroke();}}),
  hydroid:mkCard([195,215,160],(g,S)=>{g.strokeStyle='rgba(205,225,175,1)';g.lineWidth=2.5;for(let k=0;k<11;k++){const a=-0.8+1.6*(k/10);g.beginPath();g.moveTo(S*0.5,S*0.96);g.quadraticCurveTo(S*0.5+a*S*0.22,S*0.52,S*0.5+a*S*0.42,S*0.14);g.stroke();}}),
  reed:mkCard([195,215,165],(g,S)=>{g.strokeStyle='rgba(210,225,180,1)';g.lineWidth=3;for(let k=0;k<36;k++){const x0=S*(0.24+0.52*((k*37)%100)/100),dx=(-0.5+((k*53)%100)/100)*S*0.34;g.beginPath();g.moveTo(x0,S*0.98);g.quadraticCurveTo(x0+dx*0.4,S*0.5,x0+dx,S*(0.05+0.2*((k*19)%100)/100));g.stroke();}}),
  pad:mkCard([160,200,175],(g,S)=>{g.fillStyle='rgba(185,220,195,1)';g.beginPath();g.arc(S*0.5,S*0.5,S*0.42,0.18,TAU-0.18);g.lineTo(S*0.5,S*0.5);g.closePath();g.fill();}),
  leaf:mkCard([190,215,180],(g,S)=>{g.fillStyle='rgba(205,228,195,1)';for(let k=0;k<42;k++){const x=S*(0.14+0.72*((k*61)%100)/100),y=S*(0.14+0.72*((k*29+7)%100)/100);g.beginPath();g.ellipse(x,y,S*0.075,S*0.04,((k*41)%100)/100*TAU,0,TAU);g.fill();}})
 };

 /* Procedural fallback solid detail texture so even with ?mat=proc zero meshes are untextured */
 const SOLID_FALLBACK=BIO.canvasTex(128,128,(g,w,h)=>{
  const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,v=clamp(206+(BIO.fn.fbm(x/12,y/12,3.1,2)-0.5)*46,0,255);
   d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;
  }
  g.putImageData(id,0,0);
 });
 const stdMat=(o)=>new T3.MeshStandardMaterial(Object.assign({map:SOLID_FALLBACK,color:0xffffff,roughness:0.82,metalness:0,vertexColors:true},o||{}));

 const M=DOUBLEDELTA.M={
  sponge:stdMat({roughness:0.78}),
  brainsponge:stdMat({roughness:0.74}),
  glassbasket:stdMat({roughness:0.36,metalness:0.08}),
  tarfelt:stdMat({roughness:0.26,metalness:0.18}),
  penshell:stdMat({roughness:0.48,metalness:0.05}),
  byssus:stdMat({roughness:0.34,metalness:0.22}),
  oyster:stdMat({roughness:0.84}),
  culm:stdMat({roughness:0.62}),
  driftwood:stdMat({roughness:0.88}),
  amber:stdMat({roughness:0.16,metalness:0.06,emissive:0x2a1200,emissiveIntensity:0.18}),
  bark:stdMat({roughness:0.90}),
  cedarbark:stdMat({roughness:0.88}),
  rackwood:stdMat({roughness:0.82,vertexColors:false,color:0xc8b48a}),
  seapen:BIO.leafMat(TX.seapen,'dd-seapen',{aN:false,swayW:'1.35',swayA:0.18}),
  whippen:BIO.leafMat(TX.whippen,'dd-whippen',{aN:false,swayW:'1.45',swayA:0.22}),
  hydroid:BIO.leafMat(TX.hydroid,'dd-hydroid',{aN:false,swayW:'1.15',swayA:0.12}),
  reed:BIO.leafMat(TX.reed,'dd-reed',{aN:false,swayW:'1.05',swayA:0.11}),
  bambooleaf:BIO.leafMat(TX.leaf,'dd-bambooleaf',{aN:false,swayW:'0.95',swayA:0.09}),
  rice:BIO.leafMat(TX.reed,'dd-rice',{aN:false,swayW:'1.10',swayA:0.12}),
  brimreed:BIO.leafMat(TX.reed,'dd-brimreed',{aN:false,swayW:'0.85',swayA:0.07}),
  sedge:BIO.leafMat(TX.reed,'dd-sedge',{aN:false,swayW:'0.90',swayA:0.08}),
  lotuspad:BIO.leafMat(TX.pad,'dd-lotuspad',{aN:false,swayW:'0.35',swayA:0.02}),
  wrack:BIO.leafMat(TX.hydroid,'dd-wrack',{aN:false,swayW:'0.25',swayA:0.02}),
  oakleaf:BIO.leafMat(TX.leaf,'dd-oakleaf',{aN:false,swayW:'0.65',swayA:0.05}),
  cypressleaf:BIO.leafMat(TX.leaf,'dd-cypressleaf',{aN:false,swayW:'0.55',swayA:0.04}),
  pineleaf:BIO.leafMat(TX.leaf,'dd-pineleaf',{aN:false,swayW:'0.60',swayA:0.05})
 };

 // ---------------------------------------------------------------- geometry definitions (all with full position, normal, uv, color)
 /* 1. Fluted barrel chimney-sponge with deep concave apical oscular atrium (ddchimney) */
 {
  const seg=16,rings=10,pos=[],nor=[],uv=[],col=[],idx=[];
  for(let r=0;r<=rings;r++){
   const t=r/rings;
   /* Outer wall rises t=0..0.78, curves over lip t=0.78..0.86, plunges into oscular atrium t=0.86..1.0 */
   const over=t<=0.80?(t/0.80):(1-(t-0.80)/0.20*0.42);
   const radBase=t<=0.80
    ?(0.56+0.12*Math.sin(t/0.80*Math.PI)-0.16*Math.pow(t/0.80,1.6))
    :lerp(0.52,0.22,(t-0.80)/0.20);
   for(let s=0;s<=seg;s++){
    const u=s/seg,ang=u*TAU;
    const flute=t<=0.84?0.065*Math.cos(ang*9)*(1-0.5*Math.abs(t-0.4)):0;
    const rr0=Math.max(0.08,radBase+flute);
    const px=Math.cos(ang)*rr0,pz=Math.sin(ang)*rr0,py=over;
    pos.push(px,py,pz);
    const nx=t<=0.84?Math.cos(ang):-Math.cos(ang)*0.6,nz=t<=0.84?Math.sin(ang):-Math.sin(ang)*0.6,ny=t>0.76&&t<0.88?0.75:0.15;
    const nl=Math.hypot(nx,ny,nz)||1;
    nor.push(nx/nl,ny/nl,nz/nl);
    uv.push(u*3,t*2.2);
    /* Darker plum-shaded inner atrium, warm sun-lit outer ribs */
    const shade=t>0.84?lerp(1.05,0.42,(t-0.84)/0.16):(0.78+0.24*(0.5+0.5*Math.cos(ang*9))*(0.65+0.35*t));
    col.push(shade,shade*(t>0.84?0.78:1),shade*(t>0.84?0.92:0.96));
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
  BIO.def('ddchimney',g,M.sponge,{label:'Great Chimney-Sponge (fluted barrel bioherm)'});
 }
 /* 2. Organ-pipe sponge colony (ddorgan) & terraced reef-mound sponge (ddmound) */
 BIO.def('ddorgan',BIO.fung.tube({n:7,r:0.15,hMin:0.45,spread:0.36,seg:8,seed:55101}),M.sponge,{label:'Great Chimney-Sponge (organ-pipe cluster)'});
 BIO.def('ddmound',BIO.fung.cap({form:'dome',h:0.58,seg:14,rings:5,ribs:12,lump:0.32,wav:7,wavA:0.07,under:'pores',seed:55102}),M.sponge,{label:'Great Chimney-Sponge (terraced reef-mound)'});
 BIO.def('ddbrain',BIO.fung.cap({form:'dome',h:0.52,seg:14,rings:4,ribs:16,lump:0.28,wav:8,wavA:0.05,under:'pores',seed:55103}),M.brainsponge,{label:'Cushion Brain-Hummock'});
 BIO.def('ddglass',BIO.fung.bladder({swell:0.22,neck:0.36,pleats:12,pleatA:0.09,seg:12,rings:7,h:2.1}),M.glassbasket,{label:'Venus-Lattice Silica Tower'});
 BIO.def('ddtarfelt',BIO.fung.crust({lobes:7,lobeA:0.28,seg:18,rings:3,seed:55104}),M.tarfelt,{label:'Rainbow Seep-Mat'});

 /* 3. Whip-flexible sea-pens & clap-plume hydroids */
 BIO.def('ddseapen',BIO.geo.clump(),M.seapen,{label:'Calcified Feather Sea-Pen'});
 BIO.def('ddwhippen',BIO.geo.clump(),M.whippen,{label:'Wire-Whip Sea-Pen'});
 BIO.def('ddhydroid',BIO.geo.clump(),M.hydroid,{label:'Clap-Plume Hydroid'});

 /* 4. Giant Sea-Byssus fan-mussel wedge shell (ddpenshell) + golden keratin beard (ddbyssus) + visor oyster (ddoyster) */
 {
  const seg=10,rings=5,pos=[],nor=[],uv=[],col=[],idx=[];
  for(let r=0;r<=rings;r++){
   const t=r/rings,w=0.06+0.34*Math.pow(t,0.82),th=0.03+0.11*Math.sin(t*Math.PI*0.85);
   for(let s=0;s<=seg;s++){
    const u=s/seg,ang=u*TAU,rib=1+0.08*Math.cos(ang*10);
    pos.push(Math.cos(ang)*w*rib,t,Math.sin(ang)*th*rib);
    nor.push(Math.cos(ang),0.12,Math.sin(ang)*2.2);
    uv.push(u*2,t*1.6);
    const sh=0.68+0.32*t;
    col.push(sh,sh*0.95,sh*0.88);
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
  BIO.def('ddpenshell',g,M.penshell,{label:'Giant Sea-Byssus Fan-Mussel'});
 }
 BIO.def('ddbyssus',BIO.fung.stalk({r0:0.18,r1:0.06,seg:6,rings:4,ribs:8,ribA:0.18,bend:0.22}),M.byssus,{label:'Golden Sea-Byssus Holdfast Beard'});
 BIO.def('ddoyster',BIO.fung.bracket({arc:Math.PI*1.15,seg:9,thick:0.32,droop:0.10,wav:6,wavA:0.09,seed:55105}),M.oyster,{label:'Surge-Clamp Reef Oyster'});

 /* 5. Hydro-elastic salt-reeds, bamboo-rice, cable-lotus, wild-rice, bitumen-reeds & sedges */
 BIO.def('ddreed',BIO.geo.clump(),M.reed,{label:'Pneumatophore Bellows-Reed (plumes)'});
 BIO.def('ddculm',BIO.fung.stalk({r0:0.045,r1:0.024,seg:6,rings:5,bend:0.16}),M.culm,{label:'Pneumatophore Bellows-Reed (culm)'});
 BIO.def('ddbladder',BIO.fung.bladder({swell:0.78,neck:0.28,pleats:10,pleatA:0.14,seg:10,rings:5,h:1.25}),M.culm,{label:'Bellows-Reed Basal Air-Bladder'});
 BIO.def('ddbambooculm',BIO.fung.stalk({r0:0.04,r1:0.022,seg:6,rings:5,bend:0.22}),M.culm,{label:'Delta Bamboo-Rice (culm)'});
 BIO.def('ddbambooleaf',BIO.geo.clump(),M.bambooleaf,{label:'Delta Bamboo-Rice (foliage)'});
 BIO.def('ddpanicle',BIO.geo.clump(),M.rice,{label:'Delta Bamboo-Rice (grain panicle)'});
 BIO.def('ddpad',BIO.geo.mat(1.0,6),M.lotuspad,{label:'Cable-Lotus Floating Pad'});
 BIO.def('ddtether',BIO.fung.stalk({r0:0.035,r1:0.03,seg:6,rings:6,bend:0.32,ribs:6,ribA:0.15}),M.culm,{label:'Coiled Elastomeric Rhizome Tether'});
 BIO.def('ddwildrice',BIO.geo.clump(),M.rice,{label:'Estuarine Wild-Rice'});
 BIO.def('ddbrimreed',BIO.geo.clump(),M.brimreed,{label:'Bitumen-Reed'});
 BIO.def('ddsedge',BIO.geo.clump(),M.sedge,{label:'Brackish Tussock-Sedge'});

 /* 6. Tsunami storm-wrack, stranded driftwood logs & scoured ria-amber nodules */
 BIO.def('ddwrack',BIO.geo.clump(),M.wrack,{label:'Tsunami Wineweed Storm-Wrack'});
 {
  const g=new T3.CylinderGeometry(0.14,0.19,1.0,8,3,false);
  g.rotateZ(Math.PI*0.5);
  g.translate(0,0.11,0);
  const p=g.attributes.position,c=[];
  for(let i=0;i<p.count;i++){const sh=0.76+0.24*(p.getY(i)/0.25);c.push(sh,sh*0.97,sh*0.93);}
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  BIO.def('dddriftlog',g,M.driftwood,{cls:'feature',kind:'driftwood',label:'Tsunami-Stranded Driftwood Log'});
 }
 BIO.def('ddamber',BIO.fung.pod({tip:0.45,h:1.15,seg:9,rings:5,seed:55106}),M.amber,{cls:'feature',kind:'gather',label:'Ria-Amber Nodule (gather: ria-amber)',tags:{role:'gather:ria-amber'}});

 /* 7. Safe >= +38 m Ria Sound bluff forest species (strictly above tsunami trimline!) */
 BIO.def('ddoaktrunk',BIO.fung.stalk({r0:0.085,r1:0.042,seg:7,rings:5,bend:0.14}),M.bark,{label:'Maritime Bluff Oak (trunk)'});
 BIO.def('ddoakcrown',BIO.geo.clump(),M.oakleaf,{label:'Maritime Bluff Oak (crown)'});
 BIO.def('ddcedartrunk',BIO.fung.stalk({r0:0.075,r1:0.025,seg:7,rings:6,bend:0.06}),M.cedarbark,{label:'Ria Bluff Redcedar (trunk)'});
 BIO.def('ddcedarcrown',BIO.geo.clump(),M.cypressleaf,{label:'Ria Bluff Redcedar (crown)'});
 BIO.def('ddcyptrunk',BIO.fung.stalk({r0:0.068,r1:0.028,seg:7,rings:6,bend:0.10,ribs:8,ribA:0.10}),M.cedarbark,{label:'Headland Sea-Cypress (trunk)'});
 BIO.def('ddcypcrown',BIO.geo.clump(),M.cypressleaf,{label:'Headland Sea-Cypress (crown)'});
 BIO.def('ddpinetrunk',BIO.fung.stalk({r0:0.065,r1:0.032,seg:7,rings:6,bend:0.16}),M.bark,{label:'Maritime Stone-Pine (trunk)'});
 BIO.def('ddpinecrown',BIO.geo.clump(),M.pineleaf,{label:'Maritime Stone-Pine (crown)'});
 BIO.def('ddbluffculm',BIO.fung.stalk({r0:0.032,r1:0.018,seg:6,rings:6,bend:0.14}),M.culm,{label:'Bluff Timber-Bamboo (culm)'});
 BIO.def('ddbluffleaf',BIO.geo.clump(),M.bambooleaf,{label:'Bluff Timber-Bamboo (crown)'});

 /* Swap every material slot to its packed library texture (materials.json -> tex/pack.json) */
 DOUBLEDELTA.SWAP=BIO.libSwap('doubledelta',M);
 if(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed){
  const solidSlots=['sponge','brainsponge','glassbasket','tarfelt','penshell','byssus','oyster','culm','driftwood','amber','bark','cedarbark','rackwood'];
  for(const sl of solidSlots){
   const L0=KMAT.packed('doubledelta',sl),mat=M[sl];
   if(!L0||!mat)continue;
   const tx=KMAT.textures(L0,{aniso:4});
   if(tx.map){
    mat.map=tx.map;
    if(L0.scale){tx.map.repeat.set(1/Math.max(0.25,L0.scale[0]),1/Math.max(0.25,L0.scale[1]));}
   }
   if(tx.normalMap){
    mat.normalMap=tx.normalMap;
    if(L0.scale)tx.normalMap.repeat.copy(tx.map.repeat);
   }
   if(tx.roughnessMap){
    mat.roughnessMap=tx.roughnessMap;
    if(L0.scale)tx.roughnessMap.repeat.copy(tx.map.repeat);
   }
   mat.needsUpdate=true;
  }
 }
})();
