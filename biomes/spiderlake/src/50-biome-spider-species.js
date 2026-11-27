// ================================================================= SPIDER LAKE — species, library materials, trees & ATMOS silk builders ([draw])
// Registers BIO.kit('spiderlake') -> SPIDERLAKE: 12 botanical & colonial arachnid species (PLAN.md section 5):
//   - Trees & Woody Flora: spindlewillow, crowncypress (with submerged knees), ambermulberry (extrafloral nectar),
//     chinkapinoak, porphyrypine (all using BIO.flareJoin + octahedral impostors >= 7 m)
//   - Littoral, Fen & Cliff Understory: lakesmokesedge, silkfenpitcher, porphyryfern, rampartgossamer
//   - Eusocial Arachneapolita Silk Architecture: bridgecurtain (50-220 m Golden Cable catenaries), broodpavilion
//     (2-6 m insulated Cloud-Fleece canopy domes + littoral/fen diving-bell air-bell silk domes), weirframe_wild
// 100% of bark, foliage, silk, organic, crystal, wood, and rock surfaces bind packed library textures (materials.json).
BIO.kit('spiderlake');
var SPIDERLAKE={
 PHYS:SPIDER_PHYS,
 SITES:SPIDER_SITES,
 FAUNA:SPIDER_PHYS.FAUNA,
 CROPS:SPIDER_PHYS.CROPS,
 PLACED:[],
 SILK_AUDIT:{anchors:0,pinnedZero:0,bellies:0,maxAnchorDrift:0,minBellyDisp:1e9,weirMinSlotClearM:0.06,curtainSpans:0,canopySheets:0,airBells:0},
 RIGGERS:[]
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 SPIDERLAKE.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const N=(clim,arid,rip,kp,zone,o)=>K(clim,arid,rip,kp,zone,Object.assign({alien:true,native:true},o||{}));
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 // ---------------------------------------------------------------- sRGB palettes
 const PAL=SPIDERLAKE.PAL={
  willow:[0x5d8264,0x6b9070,0x4f7458,0x789c7c],
  cypress:[0x355e44,0x406b4e,0x2d523a,0x4c7858],
  mulberry:[0x4e7c3a,0x5c8a44,0x436e32,0x6a964e],
  oak:[0x3f6836,0x4c7640,0x355c2e,0x588248],
  pine:[0x2c5238,0x365e42,0x254830,0x3e684a],
  sedge:[0x748848,0x849652,0x667a3e,0x92a25e],
  cotton:[0xebe8dc,0xf4f1e6,0xdedbd0],
  pfern:[0x6e7838,0x7e8642,0x5e6830,0x8e9248],
  floorfern:[0x3e6c36,0x4a7a40,0x345e2e],
  moss:[0x4e7434,0x5c823e,0x42662c],
  pitcher:[0x9c3844,0xb0464e,0x7c8a38,0xa63e48],
  nectar:[0xe89e24,0xf2b238,0xd8881c],
  silkGold:[0xf2dc96,0xebd07e,0xf7e6ad,0xe2c46e],
  silkSilver:[0xedeae0,0xf5f2e8,0xe2dfd4],
  pavilion:[0xf0e6cc,0xe8dcc0,0xf6eed8],
  airbell:[0xdceee8,0xe8f4f0,0xcfe6e0],
  gossamer:[0xf2efe4,0xe8e4d6,0xf7f5ec],
  rigger:[0xc88228,0xd89434,0xb47020],
  ejecta:[0x746e66,0x827b72,0x666058],
  dolomite:[0xdcd8ce,0xe6e2d8,0xcfcac0],
  porphyry:[0x7e3e44,0x8c484e,0x6e343a],
  travertine:[0xe4dccb,0xede5d6,0xd8cfc0]
 };

 // ---------------------------------------------------------------- 12 species roster (verified by tools/check_botany.py)
 const SPECIES=SPIDERLAKE.SPECIES=[
  {key:'spindlewillow',name:'Spindle-Willow (Salix arachnophila)',
   how:'Supple 12-19 m smooth-barked bench tree with horizontal whorled limbs (BIO.flareJoin) bearing heavy colonial silk pavilions and guy-lines without snapping.',
   items:['sl_willow_fol','sl_anchor_collar'],tags:N('subtropic','humid','yes',['Cfa','Cfb'],'pavilion_wood')},
  {key:'crowncypress',name:'Buttressed Crown-Cypress (Taxodium coronatum)',
   how:'Towering 24-38 m fluted littoral conifer standing in 0-2.5 m turquoise shallows with flared root buttresses, emergent pneumatophore knees, and flat table-crowns anchoring 180 m Bridge-Curtains.',
   items:['sl_cypress_fol','sl_cypress_knee'],tags:N('subtropic','humid','yes',['Cfa'],'narrows')},
  {key:'ambermulberry',name:'Nectar Amber-Mulberry (Morus chrysophaea)',
   how:'Broadleaf 6-13 m cut-stone terrace tree exuding glistening amber extrafloral nectar droplets along leaf veins that feed worker spiders while berries sustain silk-wright towns.',
   items:['sl_mulberry_fol','sl_nectar'],tags:N('subtropic','humid','no',['Cfa'],'spindle_terrace',{crop:'mulberry'})},
  {key:'chinkapinoak',name:'Dolomite Chinkapin Oak (Quercus muehlenbergii)',
   how:'Limestone-loving 10-20 m broadleaf oak crowning cream carbonate-shelf bluffs and upper impact-ejecta shoulders.',
   items:['sl_oak_fol','sl_log'],tags:K('temperate','humid','no',['Cfa','Cfb'],'rim_rampart',{kin:'springhollows'})},
  {key:'porphyrypine',name:'Porphyry Rim-Pine (Pinus porphyritica)',
   how:'Wind-firm 11-22 m conifer rooted in purple-red porphyry dikes and +2,040 m North Rampart megabreccia.',
   items:['sl_pine_fol'],tags:K('temperate','humid','no',['Cfa','Cfb'],'rim_rampart',{kin:'springhollows'})},
  {key:'lakesmokesedge',name:'Lake-Smoke Tussock Sedge (Carex nebulosa)',
   how:'Buoyant 0.5-1.4 m littoral sedge and fen cottongrass tussocks whose submerged root-curtains shelter trillions of hydrothermal midge and mayfly larvae.',
   items:['sl_sedge','sl_cotton','sl_moss'],tags:N('subtropic','humid','yes',['Cfa'],'fumarole_fen')},
  {key:'silkfenpitcher',name:'Snare-Mouth Fen Pitcher (Sarracenia sericea)',
   how:'Fluted 0.35-0.85 m crimson-and-chartreuse bog trumpets around warm degumming seeps co-inhabited by juvenile Arachneapolita spinning dew-snare rims.',
   items:['sl_pitcher'],tags:N('subtropic','humid','yes',['Cfa'],'fumarole_fen',{mutualist:true})},
  {key:'porphyryfern',name:'Calming Smudge Cliff-Fern (Polypodium porphyriticum)',
   how:'Leathery bronze-green fern on dolomite, porphyry, and ejecta boulders bearing heavy golden sporangia burned in smudge-pots for zero-kill silk reeling.',
   items:['sl_pfern','sl_floorfern'],tags:N('temperate','humid','no',['Cfa','Cfb'],'rim_rampart')},
  {key:'bridgecurtain',name:'Golden Dragline Bridge-Curtain (Arachneapolita span work)',
   how:'Multi-tier 15-40 m tall by 50-220 m wide 1.3 GPa golden suspension curtain pinned to karst stacks and crown-cypress pylons above +6.5 m skiff arches.',
   items:['sl_curtain_node','sl_rigger'],gather:'spider-silk-cable',tags:N('subtropic','humid','yes',['Cfa'],'narrows',{silkGrade:'spider-silk-cable'})},
  {key:'broodpavilion',name:'Communal Silk Brood-Pavilion and Fen Air-Bell (Arachneapolita nest dome)',
   how:'Insulated 2-6 m ivory-gold nonwoven Cloud-Fleece canopy domes in willow forks plus glistening silver submerged air-bell domes in calm turquoise fen shallows.',
   items:['sl_pavilion_dome','sl_pavilion_lobe','sl_airbell'],gather:'spider-silk-fleece',tags:N('subtropic','humid','both',['Cfa'],'pavilion_wood',{silkGrade:'spider-silk-fleece'})},
  {key:'weirframe_wild',name:'Tended Spindle-Weir Sheet (Symbiotic silk-on-frame)',
   how:'Iridescent pearl-gold capture and structural silk sheet spun across removable cedar-and-porphyry terrace frames for 6-day zero-kill reeling.',
   items:['sl_weir_node'],gather:'spider-silk',tags:N('subtropic','humid','no',['Cfa'],'spindle_terrace',{silkGrade:'spider-silk'})},
  {key:'rampartgossamer',name:'Ballooning Spiderling Gossamer Skein',
   how:'Silvery-gold wind-lofted juvenile dispersion threads streaming from dolomite bluffs, cypress crowns, and +2,040 m North Ejecta Rampart boulders.',
   items:['sl_gossamer'],tags:N('temperate','humid','both',['Cfa','Cfb'],'rim_rampart')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 SPIDERLAKE.HARVEST={
  spindlewillow:HV('weaving, cordage, fuel',[],true,'Salicin-rich bark tea; supple pollard wands framed into removable silk-weir reels.'),
  crowncypress:HV('timber',[],false,'Rot-proof littoral piling, skiff planking, and weir-dock timber.'),
  ambermulberry:HV('timber, weaving',['amber mulberry'],false,'Sweet berries; inner bast beaten into crisp treaty-parchment stitched with gossamer.'),
  chinkapinoak:HV('timber, tannin',['chinkapin acorn'],false,'Sweet roasted acorns; dense joinery timber and tanbark for skiff cordage.'),
  porphyrypine:HV('timber, resin',['pine nut'],false,'Straight rampart spar timber and aromatic waterproof caulking pitch.'),
  lakesmokesedge:HV('thatch, weaving',[],false,'Woven into airy cocoon-drying baskets, skiff cushions, and reed mats.'),
  silkfenpitcher:HV('none',[],true,'Enzymatic pitcher fluid used as a mild spot-cleanser for raw gossamer bolts; alchemical reagent.','reagent'),
  porphyryfern:HV('none',[],true,'Dried golden spore-fronds burned with bog-myrtle in silk-wright smudge-pots to calm colonies peacefully into brood-domes; alchemical reagent.','reagent'),
  bridgecurtain:HV('cordage',[],false,'Outer structural cables harvested rotationally without harming spiders as 1.3 GPa Golden Cable rigging.'),
  broodpavilion:HV('fiber, padding',[],true,'Shed seasonal outer weather-shells carded into waterproof Cloud-Fleece parkas and sterile surgical dressings.'),
  weirframe_wild:HV('spinning, textile',[],false,'Reeled every 6 days under 132 Hz Hum resonance and degummed in +38 C alkaline springs into iridescent Lake-Sheen Gossamer.'),
  rampartgossamer:HV('fiber',[],false,'Windfall ridge gossamer twisted into fine fly-fishing leaders and acoustic Hum harp strings.')
 };
 SPECIES.forEach(S=>{
  S.tags.harvest=SPIDERLAKE.HARVEST[S.key];
  if(S.gather)S.tags.role='gather:'+S.gather;
 });
 const byKey={};SPECIES.forEach(S=>{byKey[S.key]=S;});
 SPIDERLAKE.byKey=byKey;
 SPIDERLAKE.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 SPIDERLAKE.plantOfItem=SPIDERLAKE.speciesOfItem;

 if(typeof KTRAPS!=='undefined'){
  byKey.silkfenpitcher.tags.trap=KTRAPS.make({
   kind:'pitfall',mouth:0.09,preyMax:'small',cycle:{wait:12,shut:0.0,digest:72,reopen:0},lure:'nectar',danger:0.02
  });
 }

 // core/hamlet gather contract
 SPIDERLAKE.GATHER={
  pasture:{narrows:0.15,fumarole_fen:0.28,pavilion_wood:0.32,spindle_terrace:0.55,rim_rampart:0.42},
  fish:{narrows:0.92,fumarole_fen:0.88,pavilion_wood:0.45,spindle_terrace:0.15,rim_rampart:0.0}
 };
 SPIDERLAKE.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in SPIDERLAKE.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*SPIDERLAKE.GATHER.pasture[k];
  for(const k in SPIDERLAKE.GATHER.fish)f+=(Z[k]==null?0:Z[k])*SPIDERLAKE.GATHER.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:false};
 };

 // ---------------------------------------------------------------- procedural fallbacks (every slot has a real map even under ?mat=proc)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=204+(H(seed,i%w,(i/w)|0,0x71)-0.5)*46;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(220,234,216,1)';
  for(let k=0;k<34;k++){
   const x=S*(0.15+0.70*H(seed,k,1,0x81)),y=S*(0.14+0.72*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[182,202,178]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('spiderlake',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.78:opt.roughness,
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

 // ---------------------------------------------------------------- SPIDERLAKE.M material table (100% mapped to materials.json)
 const M=SPIDERLAKE.M={
  'bark.willow':BIO.barkMat(grey(128,11)),
  'bark.cypress':BIO.barkMat(grey(128,12)),
  'bark.mulberry':BIO.barkMat(grey(128,13)),
  'bark.oak':BIO.barkMat(grey(128,14)),
  'bark.pine':BIO.barkMat(grey(128,15)),
  'wood.log':BIO.barkMat(grey(128,16)),
  woodCedar:pbrMat('wood.cedar',17,{roughness:0.68,metalness:0.02,vertexColors:false,color:0xd8bea0}),

  // Luminous woven gossamer & architectural silk materials
  silkCurtain:pbrMat('silk.curtain',21,{roughness:0.26,metalness:0.22,emissive:0x423518,emissiveIntensity:0.26,transparent:true,opacity:0.74,depthWrite:false}),
  silkWeir:pbrMat('silk.weir',22,{roughness:0.22,metalness:0.18,emissive:0x3c341c,emissiveIntensity:0.22,transparent:true,opacity:0.80,depthWrite:false}),
  silkPavilion:pbrMat('silk.pavilion',23,{roughness:0.52,metalness:0.06,emissive:0x282112,emissiveIntensity:0.14}),
  silkCocoon:pbrMat('silk.cocoon',24,{roughness:0.24,metalness:0.16,emissive:0x223836,emissiveIntensity:0.22,transparent:true,opacity:0.84,depthWrite:false}),
  silkLantern:pbrMat('silk.cocoon',25,{roughness:0.32,metalness:0.04,emissive:0xffa838,emissiveIntensity:0.62,vertexColors:false,color:0xffe4b8}),
  silkCable:pbrMat('silk.cable',26,{roughness:0.30,metalness:0.34,emissive:0x34280e,emissiveIntensity:0.18}),

  // Organic nectar, carnivorous fen pitchers, karst rocks, grotto crystals & arachniculture works
  organicPitcher:pbrMat('organic.pitcher',31,{roughness:0.46,metalness:0.04}),
  organicNectar:pbrMat('organic.nectar',32,{roughness:0.14,metalness:0.10,emissive:0x4a2804,emissiveIntensity:0.24}),
  rockEjecta:pbrMat('rock.ejecta',33,{roughness:0.82,metalness:0.03}),
  rockDolomite:pbrMat('rock.dolomite',34,{roughness:0.68,metalness:0.03}),
  rockPorphyry:pbrMat('rock.porphyry',35,{roughness:0.54,metalness:0.06}),
  rockTravertine:pbrMat('rock.travertine',36,{roughness:0.62,metalness:0.03}),
  crystalCalcite:pbrMat('crystal.calcite',37,{roughness:0.18,metalness:0.12,emissive:0x2e2410,emissiveIntensity:0.18}),
  crystalCelestine:pbrMat('crystal.celestine',38,{roughness:0.12,metalness:0.18,emissive:0x142c42,emissiveIntensity:0.26}),
  rockGalena:pbrMat('rock.galena',39,{roughness:0.26,metalness:0.72}),
  worksLacquer:pbrMat('works.lacquer',40,{roughness:0.30,metalness:0.08,vertexColors:false,color:0xc84238}),
  worksBronze:pbrMat('works.bronze',41,{roughness:0.26,metalness:0.80,vertexColors:false,color:0xd6ab5e}),
  worksTerracotta:pbrMat('works.terracotta',42,{roughness:0.74,metalness:0.02,vertexColors:false,color:0xc87854}),

  // Foliage & cutout cards
  willow:BIO.leafMat(cardFallback(51),'sl-willow',{aN:true,swayW:'0.75',swayA:0.07}),
  cypress:BIO.leafMat(cardFallback(52),'sl-cypress',{aN:true,swayW:'0.55',swayA:0.04}),
  mulberry:BIO.leafMat(cardFallback(53),'sl-mulberry',{aN:true,swayW:'0.65',swayA:0.06}),
  oak:BIO.leafMat(cardFallback(54),'sl-oak',{aN:true,swayW:'0.55',swayA:0.05}),
  sedge:BIO.leafMat(cardFallback(55),'sl-sedge',{aN:false,swayW:'(position.y)',swayA:0.08}),
  cotton:BIO.leafMat(cardFallback(56),'sl-cotton',{aN:false,swayW:'(position.y)',swayA:0.09}),
  pfern:BIO.leafMat(cardFallback(57),'sl-pfern',{aN:false,swayW:'(position.x)',swayA:0.05}),
  floorfern:BIO.leafMat(cardFallback(58),'sl-floorfern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  gossamer:BIO.leafMat(cardFallback(59),'sl-gossamer',{aN:false,swayW:'(-position.y)',swayA:0.14,axis:1,alphaTest:0.28}),
  moss:BIO.leafMat(cardFallback(60),'sl-moss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.32})
 };

 SPIDERLAKE.SWAP=BIO.libSwap('spiderlake',M);

 // ---------------------------------------------------------------- ATMOS wind-pinned silk shader hook (unified with kits/spider-lake 90z)
 const SILK_GLSL=[
  '{float slPin=length(aFlut);',
  'if(slPin>1e-5){',
  ' vec4 slW4=vec4(position,1.0);',
  ' #ifdef USE_INSTANCING',
  ' slW4=instanceMatrix*slW4;',
  ' #endif',
  ' vec3 slWPos=(modelMatrix*slW4).xyz;',
  ' vec2 slFw=atmWind(uAtmTime,slWPos.xz,uAtmWind,uAtmGust);',
  ' float slWMag=length(slFw);',
  ' vec2 slWDir=slWMag>1e-4?slFw/slWMag:vec2(1.0,0.0);',
  ' float slPh1=dot(slWPos.xz,slWDir)*2.4-uAtmTime*(2.7+0.6*slWMag)+slWPos.y*1.7;',
  ' float slPh2=dot(slWPos,vec3(1.1,1.9,1.3))*2.1-uAtmTime*(4.3+0.45*slWMag);',
  ' float slWave=0.65*sin(slPh1)+0.35*sin(slPh2);',
  ' vec3 slDrift=vec3(slFw.x*0.28,0.06*slWMag*(0.5+0.5*sin(slPh1)),slFw.y*0.28)*slPin;',
  ' vec3 slRip=aFlut*slWave*(0.35+0.45*slWMag)+vec3(slWDir.x,0.12,slWDir.y)*(slPin*0.18*sin(slPh1));',
  ' transformed+=slDrift+slRip;',
  '}}'
 ].join('\n');

 SPIDERLAKE.bindAtmosSilk=function(){
  if(typeof ATMOS==='undefined'||!ATMOS.U||!ATMOS.GLSL_WIND)return false;
  const targets=[['curtain',M.silkCurtain],['weir',M.silkWeir],['cable',M.silkCable]];
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
   mat.customProgramCacheKey=()=>'spiderlake-atmos-silk-'+tag;
   mat.needsUpdate=true;
  }
  return true;
 };

 // ---------------------------------------------------------------- merged bark & timber buckets
 BIO.bucket('sl_willow',M['bark.willow'],{label:'Spindle-willow smooth silver-celadon limbs'});
 BIO.bucket('sl_cypress',M['bark.cypress'],{label:'Buttressed crown-cypress fluted trunks & knees'});
 BIO.bucket('sl_mulberry',M['bark.mulberry'],{label:'Nectar amber-mulberry terrace trunks'});
 BIO.bucket('sl_oak',M['bark.oak'],{label:'Dolomite chinkapin oak trunks'});
 BIO.bucket('sl_pine',M['bark.pine'],{label:'Porphyry rim-pine trunks'});

 function makeRockGeo(seed,flatY,angular){
  const g=new T3.IcosahedronGeometry(1,angular?1:2),p=g.attributes.position,J={},c=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.75+0.40*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
   const sh=0.80+0.20*clamp(y*0.5+0.5,0,1);
   c.push(sh,sh,sh);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }
 function addZeroFlut(g){
  const n=g.attributes.position.count;
  g.setAttribute('aFlut',new T3.Float32BufferAttribute(new Float32Array(n*3),3));
  return g;
 }

 // ---------------------------------------------------------------- single-line BIO.def cutout items (100% check_cells.py compliant)
 BIO.def('sl_willow_fol',BIO.geo.clump(),M.willow,{attrs:['aN'],label:'Spindle-willow foliage'});
 BIO.def('sl_cypress_fol',BIO.geo.clump(),M.cypress,{attrs:['aN'],label:'Buttressed crown-cypress table sprays'});
 BIO.def('sl_pine_fol',BIO.geo.clump(),M.cypress,{attrs:['aN'],label:'Porphyry rim-pine needle sprays'});
 BIO.def('sl_mulberry_fol',BIO.geo.clump(),M.mulberry,{attrs:['aN'],label:'Nectar amber-mulberry broad leaves'});
 BIO.def('sl_oak_fol',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Chinkapin oak foliage'});
 BIO.def('sl_sedge',BIO.geo.clump(),M.sedge,{label:'Lake-smoke tussock sedge'});
 BIO.def('sl_cotton',BIO.geo.clump(),M.cotton,{label:'Fen cottongrass tuft'});
 BIO.def('sl_floorfern',BIO.geo.clump(),M.floorfern,{label:'Bench understory sword-fern'});
 BIO.def('sl_pfern',BIO.geo.frond(4),M.pfern,{label:'Calming smudge porphyry cliff-fern'});
 BIO.def('sl_gossamer',BIO.geo.hang(),M.gossamer,{label:'Ballooning spiderling gossamer skein'});
 BIO.def('sl_moss',BIO.geo.mat(),M.moss,{label:'Littoral & spray sphagnum mat'});

 // 3D fungoid, silk, pitcher, cypress-knee, spider-rigger & karst boulder items
 BIO.def('sl_cypress_knee',BIO.fung.stalk({r0:0.24,r1:0.06,bend:0.04,ribs:7,ribA:0.12,seg:8,rings:5}),M['bark.cypress'],{label:'Emergent bald-cypress pneumatophore knee'});
 BIO.def('sl_nectar',BIO.fung.pod({tip:0.42,h:1.1,seg:8,rings:4,seed:58101}),M.organicNectar,{label:'Amber extrafloral mulberry nectar droplet'});
 BIO.def('sl_pitcher',BIO.fung.bladder({swell:0.55,neck:0.68,h:1.45,pleats:9,pleatA:0.08,seg:10,rings:5,seed:58102}),M.organicPitcher,{label:'Snare-mouth fen pitcher trumpet'});
 BIO.def('sl_pavilion_dome',BIO.fung.cap({form:'dome',h:0.68,seg:14,rings:5,lump:0.26,wav:7,wavA:0.06,under:'pores',uv:'planar',seed:58103}),M.silkPavilion,{label:'Communal Cloud-Fleece Brood-Pavilion dome'});
 BIO.def('sl_pavilion_lobe',BIO.fung.bladder({swell:0.72,neck:0.42,h:1.05,pleats:8,pleatA:0.06,seg:10,rings:4,seed:58104}),M.silkPavilion,{label:'Brood-Pavilion insulated nursery chamber'});
 BIO.def('sl_airbell',BIO.fung.cap({form:'dome',h:0.74,seg:14,rings:5,lump:0.12,wav:5,wavA:0.03,under:'none',uv:'planar',seed:58105}),M.silkCocoon,{label:'Submerged diving-bell silk air-dome'});
 BIO.def('sl_anchor_collar',BIO.fung.crust({lobes:6,lobeA:0.24,seg:12,rings:3,seed:58106}),M.silkPavilion,{label:'Golden Cable rock & limb anchor collar'});
 BIO.def('sl_curtain_node',BIO.fung.pod({tip:0.35,h:0.95,seg:8,rings:4,seed:58107}),M.silkPavilion,{label:'Bridge-Curtain dragline tension node'});
 BIO.def('sl_weir_node',BIO.fung.pod({tip:0.45,h:0.85,seg:8,rings:4,seed:58108}),M.worksBronze,{label:'Spindle-Weir silk reel bobbin'});
 BIO.def('sl_rigger',BIO.fung.pod({tip:0.52,h:0.72,seg:8,rings:4,seed:58109}),M.organicNectar,{label:'Arachneapolita sericifera Rigger caste'});
 BIO.def('sl_log',BIO.fung.stalk({r0:0.17,r1:0.13,bend:0.07,ribs:7,ribA:0.06,seg:8,rings:5}),M['wood.log'],{label:'Mossy littoral nurse log'});

 BIO.def('sl_rock_ejecta',makeRockGeo(58201,0.78,true),M.rockEjecta,{label:'Secondary-ejecta impact megabreccia block'});
 BIO.def('sl_rock_dolomite',makeRockGeo(58202,0.88,true),M.rockDolomite,{label:'Cream carbonate-shelf dolomite pinnacle block'});
 BIO.def('sl_rock_porphyry',makeRockGeo(58203,0.76,true),M.rockPorphyry,{label:'Imperial red-porphyry dike block'});
 BIO.def('sl_rock_travertine',makeRockGeo(58204,0.48,false),M.rockTravertine,{label:'Alkaline degumming travertine sinter slab'});
 BIO.def('sl_crystal_celestine',BIO.fung.stalk({r0:0.16,r1:0.04,bend:0.0,ribs:4,ribA:0.18,seg:4,rings:3}),M.crystalCelestine,{label:'Hydrothermal pale-blue celestine crystal prism'});
 BIO.bucket('sl_chitin',M.rockPorphyry,{label:'Carnelian Erythrophyll fluted silica-chitin tubes & tendons'});
 if(typeof KFRONTIER!=='undefined'&&typeof KFRONTIER.defCladeItems==='function'){
  KFRONTIER.defCladeItems(BIO,{chitin:M.rockPorphyry,ruby:M.organicPitcher,chalcedony:M.crystalCalcite,bleach:M.rockTravertine},'sl_kf');
 }

 // ---------------------------------------------------------------- procedural tree builders (BIO.flareJoin + cypress knees + anchor forks)
 const TREE_CFG={
  crowncypress:{bucket:'sl_cypress',fol:'sl_cypress_fol',pal:PAL.cypress,barkCol:0x785846,H:[24,36],rK:0.030,tiers:5,droop:0.04,buttress:true,flatCrown:true,knees:true},
  spindlewillow:{bucket:'sl_willow',fol:'sl_willow_fol',pal:PAL.willow,barkCol:0x8c9484,H:[12,18.5],rK:0.028,tiers:4,droop:0.14,whorled:true},
  ambermulberry:{bucket:'sl_mulberry',fol:'sl_mulberry_fol',pal:PAL.mulberry,barkCol:0x86684e,H:[6.5,12.5],rK:0.032,tiers:4,droop:0.08,broad:true,nectar:true},
  chinkapinoak:{bucket:'sl_oak',fol:'sl_oak_fol',pal:PAL.oak,barkCol:0x6e665c,H:[10,19],rK:0.029,tiers:4,droop:0.07,broad:true},
  porphyrypine:{bucket:'sl_pine',fol:'sl_pine_fol',pal:PAL.pine,barkCol:0x7a5644,H:[11,21],rK:0.024,tiers:4,droop:0.09,flatCrown:true}
 };

 SPIDERLAKE.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,forks:[],crownY:y+8,knees:0};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.14,H0*cfg.rK*(0.86+0.28*H(seed,2,0,0x301)));
  const leanX=(opt.windLeanX==null?0:opt.windLeanX)+0.03*(H(seed,3,0,0x301)-0.5);
  const leanZ=(opt.windLeanZ==null?0:opt.windLeanZ)+0.03*(H(seed,4,0,0x301)-0.5);
  const forks=[];
  let tris=0,knees=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=5,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const wob=0.018*H0*Math.sin(t*3.4+seed*0.7);
    const tx=x+leanX*H0*t*t+wob*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+wob*Math.sin(seed);
    const ty=y-0.55+(H0+0.55)*t;
    const flare=cfg.buttress?(1+0.92*Math.pow(Math.max(0,1-t/0.22),2)):(1+0.26*Math.pow(Math.max(0,1-t/0.14),2));
    const rad=Math.max(0.05,r0*(1-0.80*Math.pow(t,0.88))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   tris+=BIO.tube(cfg.bucket,trunk,cfg.barkCol,{
    seg:r0>0.42?7:5,
    rfn:cfg.buttress?(q,ang)=>q<=2?(1+0.32*Math.max(0,Math.cos(ang*6+(seed%7)))):1:null
   });

   // Flared root buttresses (BIO.flareJoin) + emergent bald-cypress pneumatophore knees in shallow water
   if(cfg.buttress){
    for(let k=0;k<4;k++){
     const az=(k/4)*TAU+0.35*H(seed,10+k,1,0x302);
     const rSpan=r0*(2.4+1.1*H(seed,10+k,2,0x302));
     const rootPts=BIO.flareJoin([
      {x:x+Math.cos(az)*r0*0.48,y:y+r0*1.65,z:z+Math.sin(az)*r0*0.48,r:r0*0.44},
      {x:x+Math.cos(az)*rSpan*0.65,y:y+r0*0.38,z:z+Math.sin(az)*rSpan*0.65,r:r0*0.28},
      {x:x+Math.cos(az)*rSpan,y:y-0.65,z:z+Math.sin(az)*rSpan,r:r0*0.14}
     ],{parentR:r0,k:1.5,sink:0.55,len:1.9});
     tris+=BIO.tube(cfg.bucket,rootPts,cfg.barkCol,{seg:4});
     if(cfg.knees&&opt.wetFeet){
      const kd=rSpan*(1.15+0.85*H(seed,20+k,1,0x303));
      const kx=x+Math.cos(az+0.25)*kd,kz=z+Math.sin(az+0.25)*kd;
      const ky=BIO.host.terrainH(kx,kz),kh=0.65+0.95*H(seed,20+k,2,0x303);
      BIO.put('sl_cypress_knee',[kx,ky-0.15,kz],qEuler(0,az,0),[0.55+0.35*kh,kh,0.55+0.35*kh],C(cfg.barkCol));
      knees++;
     }
    }
   }

   // Primary limbs with BIO.flareJoin + stem-socketed foliage pads + recorded silk-anchor forks
   const nTiers=cfg.tiers;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.flatCrown?(0.52+0.44*tf):(0.32+0.62*tf);
    const nBr=cfg.whorled?4:3;
    for(let b=0;b<nBr;b++){
     const az=(b/nBr)*TAU+ti*1.18+0.35*H(seed,30+ti*4+b,1,0x304);
     const reach=H0*(cfg.flatCrown?(0.18+0.18*Math.sin(tf*Math.PI*0.85)):cfg.whorled?(0.26*(1-0.45*tf)):(0.24*Math.sin(tf*Math.PI*0.9+0.25)));
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.07,r0*(1-0.76*baseT));
     const lift=cfg.flatCrown?0.06:cfg.whorled?0.04:0.18;
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.58)+reach*0.06,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.05,pR*0.48)},
      {x:mx,y:my,z:mz,r:Math.max(0.04,pR*0.30)},
      {x:ex,y:ey,z:ez,r:Math.max(0.03,pR*0.16)}
     ],{parentR:pR,k:1.65,sink:0.65,len:2.2});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     if(ti>=1&&ti<=nTiers-2&&b===0){
      forks.push([lerp(bx0,ex,0.58),lerp(by0,ey,0.58),lerp(bz0,ez,0.58)]);
     }
     const fCol=C(cfg.pal[Math.floor(H(seed,60+ti*5+b,2,0x305)*cfg.pal.length)%cfg.pal.length]);
     const padW=reach*(cfg.flatCrown?1.08:0.92),padH=padW*(cfg.flatCrown?0.46:0.72);
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.06*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     if(reach>2.2){
      const fCol2=C(cfg.pal[Math.floor(H(seed,70+ti*5+b,3,0x305)*cfg.pal.length)%cfg.pal.length]);
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.76,padH*0.80,padW*0.76],fCol2);
     }

     if(cfg.nectar&&ti===1&&b===0&&H(seed,90+ti*3+b,1,0x307)<0.65){
      const nx0=lerp(bx0,ex,0.72),ny0=lerp(by0,ey,0.72)-0.12,nz0=lerp(bz0,ez,0.72);
      BIO.put('sl_nectar',[nx0,ny0,nz0],qEuler(0,az,0),[0.12,0.18,0.12],C(PAL.nectar[(ti+b)%PAL.nectar.length]));
     }
    }
   }
   // Apical crown pad socketed onto trunk tip
   const topX=x+leanX*H0,topZ=z+leanZ*H0,topY=y+H0;
   const topW=H0*(cfg.flatCrown?0.28:0.22),topH=topW*(cfg.flatCrown?0.42:0.68);
   BIO.put(cfg.fol,[topX,topY,topZ],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));
   forks.push([topX,topY-topH*0.25,topZ]);
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0,forks:forks,crownY:y+H0*0.82,knees:knees};
 };

 // ---------------------------------------------------------------- world-space ATMOS wind-pinned catenary silk batch builder
 SPIDERLAKE.createSilkBatch=function(sceneRef){
  const batches={
   curtain:{pos:[],nrm:[],uv:[],col:[],flut:[],idx:[],n:0,mat:M.silkCurtain,label:'Golden Dragline Bridge-Curtain & Canopy Gossamer Sheet (ATMOS wind-pinned)'},
   cable:{pos:[],nrm:[],uv:[],col:[],flut:[],idx:[],n:0,mat:M.silkCable,label:'1.3 GPa Golden Cable Catenary & Guy-Stay Rigging'},
   weir:{pos:[],nrm:[],uv:[],col:[],flut:[],idx:[],n:0,mat:M.silkWeir,label:'Lake-Sheen Gossamer Tended Spindle-Weir Sheet'}
  };
  const audit=SPIDERLAKE.SILK_AUDIT;
  audit.anchors=0;audit.pinnedZero=0;audit.bellies=0;audit.maxAnchorDrift=0;audit.minBellyDisp=1e9;
  audit.weirMinSlotClearM=0.06;audit.curtainSpans=0;audit.canopySheets=0;audit.airBells=0;

  function pushCable(pts,r,colRgb,fluts){
   const B=batches.cable,seg=5,m=pts.length;
   if(m<2)return;
   const base=B.n;
   for(let i=0;i<m;i++){
    const p=pts[i],pPrev=pts[Math.max(0,i-1)],pNext=pts[Math.min(m-1,i+1)];
    let dx=pNext[0]-pPrev[0],dy=pNext[1]-pPrev[1],dz=pNext[2]-pPrev[2];
    const dl=Math.hypot(dx,dy,dz);
    const inv=dl>1e-6?1/dl:1;
    dx*=inv;dy*=inv;dz*=inv;
    let ux=-dz,uy=0,uz=dx;
    let ul=Math.hypot(ux,uy,uz);
    if(ul<1e-4){ux=1;uy=0;uz=0;ul=1;}
    ux/=ul;uz/=ul;
    const vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;
    const fl=fluts?fluts[i]:[0,0,0];
    for(let s=0;s<=seg;s++){
     const ang=(s/seg)*TAU,ca=Math.cos(ang),sa=Math.sin(ang);
     const nx=ux*ca+vx*sa,ny=uy*ca+vy*sa,nz=uz*ca+vz*sa;
     B.pos.push(p[0]+nx*r,p[1]+ny*r,p[2]+nz*r);
     B.nrm.push(nx,ny,nz);
     B.uv.push(s/seg,i*0.6);
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

  function recordAuditPin(wx,wy,wz,fx,fy,fz,isAnchor,isBelly){
   if(isAnchor){
    audit.anchors++;
    const d=SPIDER_PHYS.displaceSilk(wx,wy,wz,fx,fy,fz,11.4,18.0,-9.0,1.0);
    const mag=Math.hypot(d[0],d[1],d[2]);
    if(Math.hypot(fx,fy,fz)===0&&mag===0)audit.pinnedZero++;
    if(mag>audit.maxAnchorDrift)audit.maxAnchorDrift=mag;
   }else if(isBelly){
    audit.bellies++;
    const d=SPIDER_PHYS.displaceSilk(wx,wy,wz,fx,fy,fz,11.4,6.5,2.4,0.65);
    const mag=Math.hypot(d[0],d[1],d[2]);
    if(mag<audit.minBellyDisp)audit.minBellyDisp=mag;
   }
  }

  // 1. Hero 50-220 m Golden Dragline Bridge-Curtain + Catenary Cables + Boat Navigation Arch
  function addBridgeCurtain(span,wMs){
   const ax=span.a[0],ay=span.a[1],az=span.a[2];
   const bx=span.b[0],by=span.b[1],bz=span.b[2];
   const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);
   const invL=L>1e-5?1/L:1,tx=dx*invL,tz=dz*invL,nx=-tz,nz=tx;
   const aero=SPIDER_PHYS.aerodynamicsAt({
    elevM:SITE.baseElevM,windSpeedMs:wMs,threadDiaUm:4.2,spanM:L,anchorHighM:0.5*(ay+by),curtainDropM:span.dropM
   });
   const sag=aero.catenarySagM;
   const NU=36,NV=14,B=batches.curtain,base=B.n;
   const topPts=[],topFlut=[],botPts=[],botFlut=[];
   const tiers=span.tiers==null?3:span.tiers;

   for(let iu=0;iu<=NU;iu++){
    const u=iu/NU;
    const px=lerp(ax,bx,u),pz=lerp(az,bz,u);
    const yTop=lerp(ay,by,u)-sag*4*u*(1-u);
    let archLift=0;
    if(span.boatArch){
     const au=clamp((u-0.22)/0.56,0,1);
     archLift=Math.sin(au*Math.PI)*(span.dropM*0.58);
    }
    const minY=span.boatArch?Math.max(span.clearMinM==null?7.2:span.clearMinM,6.8):-40.0;
    const yBot=Math.max(minY,yTop-span.dropM+archLift);

    for(let iv=0;iv<=NV;iv++){
     const v=iv/NV;
     const py=lerp(yTop,yBot,v);
     const pin=SPIDER_PHYS.silkPinWeight('bridgecurtain',u,v);
     const fx=nx*pin*0.86,fy=0.07*pin,fz=nz*pin*0.86;
     B.pos.push(px,py,pz);
     B.nrm.push(nx,0.08,nz);
     B.uv.push(u*(L/7.5),v*2.4);
     const tierWave=0.5+0.5*Math.cos(v*Math.PI*tiers*2);
     const edgeBead=(iv===0||iv===NV)?1.12:(0.80+0.22*tierWave);
     B.col.push(0.96*edgeBead,0.86*edgeBead,0.58*edgeBead);
     B.flut.push(fx,fy,fz);

     const isAnchor=(iu===0||iu===NU);
     const isBelly=(iu===18&&iv===7);
     recordAuditPin(px,py,pz,fx,fy,fz,isAnchor,isBelly);
     if(iv===0){topPts.push([px,py,pz]);topFlut.push([fx,fy,fz]);}
     if(iv===NV){botPts.push([px,py,pz]);botFlut.push([fx,fy,fz]);}
    }
   }
   for(let iu=0;iu<NU;iu++)for(let iv=0;iv<NV;iv++){
    const a=base+iu*(NV+1)+iv,b=a+NV+1;
    B.idx.push(a,b,a+1,a+1,b,b+1);
   }
   B.n+=(NU+1)*(NV+1);

   // Primary 1.3 GPa Golden Cable top catenary, lower boat-arch rim cable, vertical hangers & 4 rock guy-stays
   pushCable(topPts,0.085,[0.96,0.82,0.44],topFlut);
   pushCable(botPts,0.052,[0.94,0.80,0.46],botFlut);
   for(let hIdx=4;hIdx<=NU-4;hIdx+=4){
    pushCable([topPts[hIdx],botPts[hIdx]],0.028,[0.95,0.86,0.56],[topFlut[hIdx],botFlut[hIdx]]);
   }
   // Diagonal rock-pinned guy-stays at u = 0.14 and u = 0.86 (anchor end strictly [0,0,0]!)
   const g1=Math.round(NU*0.14),g2=Math.round(NU*0.86);
   const stayA0=[ax+nx*7.5,ay-4.8,az+nz*7.5],stayA1=[ax-nx*7.5,ay-4.8,az-nz*7.5];
   const stayB0=[bx+nx*7.5,by-4.8,bz+nz*7.5],stayB1=[bx-nx*7.5,by-4.8,bz-nz*7.5];
   recordAuditPin(stayA0[0],stayA0[1],stayA0[2],0,0,0,true,false);
   recordAuditPin(stayB0[0],stayB0[1],stayB0[2],0,0,0,true,false);
   pushCable([stayA0,topPts[g1]],0.042,[0.94,0.80,0.42],[[0,0,0],topFlut[g1]]);
   pushCable([stayA1,topPts[g1]],0.042,[0.94,0.80,0.42],[[0,0,0],topFlut[g1]]);
   pushCable([stayB0,topPts[g2]],0.042,[0.94,0.80,0.42],[[0,0,0],topFlut[g2]]);
   pushCable([stayB1,topPts[g2]],0.042,[0.94,0.80,0.42],[[0,0,0],topFlut[g2]]);

   BIO.put('sl_anchor_collar',[ax,ay-0.25,az],qEuler(0,0,0),[1.4,0.8,1.4],C(0xebd07e));
   BIO.put('sl_anchor_collar',[bx,by-0.25,bz],qEuler(0,0,0),[1.4,0.8,1.4],C(0xebd07e));
   BIO.put('sl_curtain_node',[topPts[18][0],topPts[18][1],topPts[18][2]],qEuler(0,0,0),[0.55,0.55,0.55],C(0xf2dc96));
   audit.curtainSpans++;
   return{aero:aero,spanM:L};
  }

  // 2. Canopy-to-Canopy Silvery-Gold Communal Gossamer Sheet & Guyed Bridge-Cables between Cypress/Willow Forks
  function addCanopySheet(p0,p1,p2,p3,sagM){
   const NU=10,NV=10,B=batches.curtain,base=B.n;
   const sag=sagM==null?0.85:sagM;
   for(let iu=0;iu<=NU;iu++){
    const u=iu/NU;
    const ax=lerp(p0[0],p1[0],u),ay=lerp(p0[1],p1[1],u),az=lerp(p0[2],p1[2],u);
    const bx=lerp(p3[0],p2[0],u),by=lerp(p3[1],p2[1],u),bz=lerp(p3[2],p2[2],u);
    for(let iv=0;iv<=NV;iv++){
     const v=iv/NV;
     const px=lerp(ax,bx,v),pz=lerp(az,bz,v);
     const py=lerp(ay,by,v)-sag*Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
     const isCorner=(iu===0&&iv===0)||(iu===NU&&iv===0)||(iu===NU&&iv===NV)||(iu===0&&iv===NV);
     const pin=isCorner?0:SPIDER_PHYS.silkPinWeight('funnelsheet',u,v);
     const fx=0.22*pin,fy=-0.48*pin,fz=0.22*pin;
     B.pos.push(px,py,pz);
     B.nrm.push(0,1,0);
     B.uv.push(u*2.5,v*2.5);
     B.col.push(0.95,0.92,0.80);
     B.flut.push(fx,fy,fz);
     recordAuditPin(px,py,pz,fx,fy,fz,isCorner,iu===5&&iv===5);
    }
   }
   for(let iu=0;iu<NU;iu++)for(let iv=0;iv<NV;iv++){
    const a=base+iu*(NV+1)+iv,b=a+NV+1;
    B.idx.push(a,b,a+1,a+1,b,b+1);
   }
   B.n+=(NU+1)*(NV+1);
   // Guyed perimeter bridge-cables connecting the 4 tree/pinnacle anchors
   const edges=[[p0,p1],[p1,p2],[p2,p3],[p3,p0]];
   for(let e=0;e<4;e++){
    const ea=edges[e][0],eb=edges[e][1],cPts=[],cFlut=[];
    for(let k=0;k<=8;k++){
     const t=k/8,sp=SPIDER_PHYS.slSilkMath.spanPin(t);
     cPts.push([lerp(ea[0],eb[0],t),lerp(ea[1],eb[1],t)-0.32*Math.sin(Math.PI*t),lerp(ea[2],eb[2],t)]);
     cFlut.push((k===0||k===8)?[0,0,0]:[0.18*sp,-0.25*sp,0.18*sp]);
    }
    pushCable(cPts,0.026,[0.95,0.86,0.58],cFlut);
   }
   audit.canopySheets++;
  }

  // 3. Tended Spindle-Weir Sheet (inset 0.06 m inside 3.20 x 2.32 m cedar frame crossbars -> >= 0.03 m slot separation!)
  function addWeirSheet(cx,cy,cz,yaw,innerW,innerH){
   const NU=10,NV=8,B=batches.weir,base=B.n;
   const ca=Math.cos(yaw),sa=Math.sin(yaw),nx=-sa,nz=ca;
   for(let iu=0;iu<=NU;iu++){
    const u=iu/NU,offU=(u-0.5)*innerW;
    for(let iv=0;iv<=NV;iv++){
     const v=iv/NV,py=cy+v*innerH;
     const px=cx+ca*offU,pz=cz+sa*offU;
     const isEdge=(iu===0||iu===NU||iv===0||iv===NV);
     const pin=SPIDER_PHYS.silkPinWeight('weirframe_wild',u,v);
     const fx=nx*pin*0.65,fy=0.04*pin,fz=nz*pin*0.65;
     B.pos.push(px,py,pz);
     B.nrm.push(nx,0.05,nz);
     B.uv.push(u*1.8,v*1.4);
     B.col.push(0.97,0.94,0.86);
     B.flut.push(fx,fy,fz);
     recordAuditPin(px,py,pz,fx,fy,fz,isEdge,iu===5&&iv===4);
    }
   }
   for(let iu=0;iu<NU;iu++)for(let iv=0;iv<NV;iv++){
    const a=base+iu*(NV+1)+iv,b=a+NV+1;
    B.idx.push(a,b,a+1,a+1,b,b+1);
   }
   B.n+=(NU+1)*(NV+1);
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
    mesh.name='spiderlake:silk-'+k;
    mesh.userData.host=true;
    mesh.userData.silkBatch=k;
    mesh.userData.inspectLabel=B.label;
    mesh.renderOrder=k==='cable'?1:3;
    sceneRef.add(mesh);
    out.push(mesh);
   });
   return out;
  }

  return{addBridgeCurtain:addBridgeCurtain,addCanopySheet:addCanopySheet,addWeirSheet:addWeirSheet,pushCable:pushCable,finalize:finalize};
 };
})();
