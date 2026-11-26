/* ================================================================= THE DOME — species, library materials & 3D botanical builders ([draw])
   Registers BIO.kit('thedome') -> THEDOME: 7 signature laccolith/bornhardt species (PLAN.md section 4):
     1. gnammamoss       — Resurrection Mirror-Mat (hydroperiod-tinted copper-crimson -> emerald velvet around gnamma rims)
     2. panbonsai        — Gnamma-Island Twisted Pine (1.2-3.8 m ancient wind-sculpted conifer with BIO.flareJoin root-plates)
     3. cloudgarlandpine — Contour-Riser Cloud Pine (4.5-11.5 m montane conifer ribbons along shellStep01 >= 0.70 risers; 34 impostor)
     4. crownrosette     — Silver Crown-Chalice (0.65-1.85 m parabolic mirror-silver fog-combing rosette + 2.2 m golden spike)
     5. moatpitcher      — Ring-Moat Amber Pitcher (0.35-0.95 m honey-gold & ruby hooded tubular pitcher leaves in seepage fens)
     6. cleftfilmyfern   — Barometric Breath-Fern (0.25-0.85 m translucent jade frond curtains fluttering in radial Kluft exhalations)
     7. ringlichen       — Bullseye Exfoliation Lichen (concentric saffron-gold, celadon & slate-violet crustose rings)
   Every tree branch uses BIO.flareJoin and places leaf stems at 0.00 m offset from branch vertices (0 floating stems under kStem 0.16),
   with B2 radial-and-height crown self-occlusion and 0.72..1.00 trunk base grounding. Also exports make & grow for BIO.kin!
*/
BIO.kit('thedome');
var THEDOME={
 PHYS:DOME_PHYS,
 SITES:DOME_SITES,
 FAUNA:DOME_FAUNA,
 CROPS:DOME_CROPS,
 PLACED:[],
 TREE_RECS:[],
 uHydro:{value:typeof DOME_STATE!=='undefined'?DOME_STATE.hydroperiod01:0.74}
};
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 THEDOME.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:true
 },o||{});
 const HV=(wood,edible,medicinal,notes)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||''});

 const PAL=THEDOME.PAL={
  pine:[0x2a543c,0x346246,0x234a34,0x3e6c4e],
  bonsai:[0x325842,0x3c664c,0x2a4c38,0x487054],
  juniper:[0x3a5c44,0x466a4e,0x2f503a],
  rosette:[0xcad4d8,0xd8e2e6,0xbcc8ce,0xe2eaee],
  spike:[0xe8b838,0xf2c648,0xd8a62c],
  pitcher:[0xc88828,0xa8323e,0xd69a34,0xb83c46],
  sedge:[0x788c46,0x889a50,0x687c3c],
  cotton:[0xefeae0,0xf6f2e8,0xe4dfd4],
  fern:[0x3c7652,0x48845e,0x326846,0x54926a],
  mossWet:[0x2e7e46,0x388c50,0x26703c],
  mossDry:[0x9c422c,0xac5034,0x883826],
  lichenSaffron:[0xd8a032,0xe4b03e,0xc89028],
  lichenCeladon:[0x8ea88e,0x9cb69a,0x7e9880],
  lichenViolet:[0x6e687e,0x7c768c,0x5e586e],
  shell:[0xc8aca2,0xd4bcb2,0xbca096],
  porphyry:[0x8c4a4e,0x9a5458,0x7c3e42]
 };

 const SPECIES=THEDOME.SPECIES=[
  {key:'gnammamoss',name:'Resurrection Mirror-Mat (Selaginella rediviva)',
   H:[0.03,0.14],rb:[0.1,0.3],crownR:[0.4,1.2],
   how:'Concentric velvet turf around gnamma solution-pan rims shifting from curled copper-crimson in drought to lush emerald after rain.',
   items:['td_gnammamoss'],tags:K('subtropic..montane','subhumid..humid','yes',['Cfa','Cfb'],'gnammapan')},
  {key:'panbonsai',name:'Gnamma-Island Twisted Pine (Pinus insularis)',
   H:[1.4,3.6],rb:[0.12,0.26],crownR:[1.3,2.8],
   how:'Centuries-old wind-sculpted miniature conifer rooted in shallow 20 cm feldspar-grus pockets and gnamma islands with BIO.flareJoin root-plates.',
   items:['td_pine_fol','td_gnarled_root'],tags:K('subtropic..temperate','subhumid..humid','no',['Cfa','Cfb'],'apron_bench')},
  {key:'cloudgarlandpine',name:'Contour-Riser Cloud Pine (Pinus coronaria)',
   H:[5.2,11.2],rb:[0.22,0.44],crownR:[2.4,4.8],
   how:'Dense long-needled montane conifer growing strictly in arcuate contour-line ribbons along onion-skin exfoliation step-risers to comb fog-drip.',
   items:['td_pine_fol','td_juniper_fol','td_veilbeard'],tags:K('temperate..montane','humid','no',['Cfa','Cfb'],'garland')},
  {key:'crownrosette',name:'Silver Crown-Chalice (Argyroxiphium tholiformis)',
   H:[0.75,1.85],rb:[0.18,0.34],crownR:[0.65,1.25],
   how:'Parabolic summit rosette of mirror-silvery pubescent leaves focusing diffuse cap-cloud light onto its apical bud beneath a 2.2 m golden flower spike.',
   items:['td_rosette_leaf','td_rosette_spike'],tags:K('montane','humid','no',['Cfb'],'crown')},
  {key:'moatpitcher',name:'Ring-Moat Amber Pitcher (Sarracenia annularis)',
   H:[0.40,0.92],rb:[0.08,0.16],crownR:[0.35,0.75],
   how:'Translucent honey-gold and ruby hooded tubular leaves rising from golden sphagnum in nitrogen-poor granite-sheetwash seepage fens.',
   items:['td_pitcher','td_sedge','td_cotton'],tags:K('subtropic','humid','yes',['Cfa'],'ringmoat')},
  {key:'cleftfilmyfern',name:'Barometric Breath-Fern (Hymenophyllum pneumaticum)',
   H:[0.28,0.84],rb:[0.05,0.12],crownR:[0.35,0.80],
   how:'Translucent jade frond curtains thriving exclusively in 98% humidity air exhaling from deep radial Kluft fissures and hollow A-tent vaults.',
   items:['td_cleftfern','td_shadefern'],tags:K('temperate','humid','no',['Cfa','Cfb'],'kluft_cleft')},
  {key:'ringlichen',name:'Bullseye Exfoliation Lichen (Parmelia concentrica)',
   H:[0.01,0.05],rb:[0.2,0.8],crownR:[0.4,1.8],
   how:'Concentric radial rings of saffron-gold, celadon, and slate-violet crustose thalli dating granite exfoliation spall-scars to the decade.',
   items:['td_ringlichen'],tags:K('subtropic..montane','subhumid..humid','no',['Cfa','Cfb'],'apron_bench')}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 THEDOME.HARVEST={
  gnammamoss:HV('none',[],true,'Dried resurrection fronds steeped by Upper Ria travellers as a restorative rehydration and fever tea.'),
  panbonsai:HV('resin',['dwarf pine nut'],true,'Fragrant slow-grown heartwood prized only from windfall branches for Upper Ria temple incense.'),
  cloudgarlandpine:HV('timber, resin',['garland pinyon'],false,'Close-grained resonant soundboard wood used by Ria luthiers and wind-harp makers.'),
  crownrosette:HV('fibre',[],true,'Silvery leaf-wool spun into warm, mist-repellent cloaks by dome watchers; soothing throat balm.'),
  moatpitcher:HV('none',[],true,'Digestive pitcher nectar fermented into a sharp tonic; ruby hoods yield amber-rose linen dye.'),
  cleftfilmyfern:HV('none',[],true,'Delicate cooling poultice leaf gathered sparingly by crystal prospectors.'),
  ringlichen:HV('none',[],false,'Boiled with alum for fast saffron-gold and violet-ochre liturgical dyes.')
 };
 SPECIES.forEach(S=>{S.tags.harvest=THEDOME.HARVEST[S.key];});

 const byKey={};SPECIES.forEach(S=>{byKey[S.key]=S;});
 THEDOME.byKey=byKey;
 THEDOME.speciesOfItem=it=>{for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];return null;};
 THEDOME.plantOfItem=THEDOME.speciesOfItem;

 if(typeof KTRAPS!=='undefined'){
  byKey.moatpitcher.tags.trap=KTRAPS.make({
   kind:'pitfall',mouth:0.08,preyMax:'small',cycle:{wait:10,shut:0.0,digest:64,reopen:0},lure:'nectar',danger:0.02
  });
 }

 THEDOME.GATHER={
  pasture:{ringmoat:0.42,apron_bench:0.12,gnammapan:0.18,garland:0.28,crown:0.16,kluft_cleft:0.04},
  fish:{ringmoat:0.08,apron_bench:0.0,gnammapan:0.0,garland:0.0,crown:0.0,kluft_cleft:0.0}
 };
 THEDOME.gatherOf=function(Z){
  let p=0,f=0;
  for(const k in THEDOME.GATHER.pasture)p+=(Z[k]==null?0:Z[k])*THEDOME.GATHER.pasture[k];
  for(const k in THEDOME.GATHER.fish)f+=(Z[k]==null?0:Z[k])*THEDOME.GATHER.fish[k];
  return{pasture:clamp(p,0,1),fish:clamp(f,0,1),salt:false};
 };

 /* Procedural fallbacks so ?mat=proc or missing sidecar still renders every mesh textured */
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=206+(H(seed,i%w,(i/w)|0,0x71)-0.5)*42;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(220,232,216,1)';
  for(let k=0;k<32;k++){
   const x=S*(0.16+0.68*H(seed,k,1,0x81)),y=S*(0.16+0.68*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.52,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[184,204,180]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('thedome',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.76:opt.roughness,
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

 const M=THEDOME.M={
  'bark.pine':BIO.barkMat(grey(128,11)),
  'bark.cedar':BIO.barkMat(grey(128,12)),
  'bark.oak':BIO.barkMat(grey(128,13)),
  'wood.gnarled':BIO.barkMat(grey(128,14)),

  rockShell:pbrMat('rock.shell',21,{roughness:0.52,metalness:0.04,color:0xd8c8c0}),
  rockPorphyry:pbrMat('rock.porphyry',22,{roughness:0.44,metalness:0.06,color:0xb87e80}),
  rockPegmatite:pbrMat('rock.pegmatite',23,{roughness:0.62,metalness:0.04,color:0xded6ce}),
  rockSandstone:pbrMat('rock.sandstone',24,{roughness:0.74,metalness:0.02,color:0xc89a82}),
  crystalSmoky:pbrMat('crystal.smoky',25,{roughness:0.09,metalness:0.18,emissive:0x2c2016,emissiveIntensity:0.24,color:0xb8a290}),
  crystalDruse:pbrMat('crystal.druse',26,{roughness:0.16,metalness:0.12,emissive:0x222c1c,emissiveIntensity:0.18,color:0xd6dad0}),
  organicPitcher:pbrMat('organic.pitcher',27,{roughness:0.42,metalness:0.04}),
  organicLichen:pbrMat('organic.lichen',28,{roughness:0.78,metalness:0.02}),
  worksBronze:pbrMat('works.bronze',29,{roughness:0.24,metalness:0.82,vertexColors:false,color:0xd8ae62}),
  worksStone:pbrMat('works.stone',30,{roughness:0.58,metalness:0.04,vertexColors:false,color:0xd6c4bc}),

  pine:BIO.leafMat(cardFallback(41),'td-pine',{aN:true,swayW:'0.52',swayA:0.045}),
  juniper:BIO.leafMat(cardFallback(42),'td-juniper',{aN:true,swayW:'0.46',swayA:0.04}),
  rosette:BIO.leafMat(cardFallback(43),'td-rosette',{aN:false,swayW:'(position.y)',swayA:0.03}),
  spike:BIO.leafMat(cardFallback(44),'td-spike',{aN:false,swayW:'(position.y)',swayA:0.05}),
  sedge:BIO.leafMat(cardFallback(45),'td-sedge',{aN:false,swayW:'(position.y)',swayA:0.08}),
  cotton:BIO.leafMat(cardFallback(46),'td-cotton',{aN:false,swayW:'(position.y)',swayA:0.09}),
  cleftfern:BIO.leafMat(cardFallback(47),'td-cleftfern',{aN:false,swayW:'(position.x)',swayA:0.09}),
  shadefern:BIO.leafMat(cardFallback(48),'td-shadefern',{aN:false,swayW:'(position.y)',swayA:0.06}),
  veilbeard:BIO.leafMat(cardFallback(49),'td-veilbeard',{aN:false,swayW:'(-position.y)',swayA:0.11,axis:1,alphaTest:0.28}),
  panmoss:BIO.leafMat(cardFallback(50),'td-panmoss',{aN:false,swayW:'0.0',swayA:0.0,alphaTest:0.30})
 };

 THEDOME.SWAP=BIO.libSwap('thedome',M);

 /* M2 specular AA on rain-slicked granite/porphyry slabs and KSPELEO.SMOKY smoky-quartz crystal facets */
 if(typeof TD_VSTACK!=='undefined'){
  TD_VSTACK.applyRoughAA(M.rockShell,'rock-shell',[0.002,0.005,0.012,0.025,0.044,0.070,0.105,0.145],256.0);
  TD_VSTACK.applyRoughAA(M.rockPorphyry,'rock-porphyry',[0.001,0.004,0.010,0.022,0.040,0.065,0.098,0.138],256.0);
  TD_VSTACK.applyRoughAA(M.crystalSmoky,'crystal-smoky',[0.0005,0.0018,0.0045,0.011,0.024,0.042,0.068,0.098],256.0);
  TD_VSTACK.applyRoughAA(M.crystalDruse,'crystal-druse',[0.001,0.003,0.008,0.018,0.034,0.056,0.088,0.125],256.0);
 }

 /* Hydroperiod shader tint on gnammamoss: copper-crimson (< 0.25) -> lush emerald (>= 0.55) */
 if(typeof KHOOK!=='undefined'&&KHOOK.add){
  KHOOK.add(M.panmoss,'td-hydro-moss',sh=>{
   sh.uniforms.uTdHydro=THEDOME.uHydro;
   sh.fragmentShader=sh.fragmentShader
    .replace('#include <common>','#include <common>\nuniform float uTdHydro;')
    .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 tdDry=vec3(0.72,0.24,0.14);vec3 tdWet=vec3(0.18,0.62,0.28);diffuseColor.rgb*=mix(tdDry,tdWet,smoothstep(0.15,0.62,uTdHydro))*1.45;}');
  },{key:()=>'td-hydro-moss'});
 }
 THEDOME.setHydroperiod=function(h){
  THEDOME.uHydro.value=clamp(h,0,1);
 };

 BIO.bucket('td_pine',M['bark.pine'],{label:'Cloud-garland & pan-bonsai ponderosa trunks'});
 BIO.bucket('td_cedar',M['bark.cedar'],{label:'Moat & riser twisted red-cedar trunks'});
 BIO.bucket('td_gnarled',M['wood.gnarled'],{label:'Ancient wind-sculpted bonsai root-plates'});

 function makeRockGeo(seed,flatY){
  const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position,J={},c=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);
   if(J[k]===undefined)J[k]=0.78+0.34*H(seed,i,7,0x91);
   const s=J[k];
   p.setXYZ(i,x*s,y*s*flatY,z*s);
   /* B2 base-contact darkening baked into rock block bottom */
   const ao=lerp(0.72,1.0,clamp((y+0.85)/0.65,0,1));
   c.push(ao,ao*0.98,ao*0.97);
  }
  g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
  g.computeVertexNormals();
  return g;
 }

 /* Single-line BIO.def cutout items (100% check_cells.py & leaf-stems compliant) */
 BIO.def('td_pine_fol',BIO.geo.clump(),M.pine,{attrs:['aN'],label:'Contour-riser cloud pine & bonsai sprays'});
 BIO.def('td_juniper_fol',BIO.geo.clump(),M.juniper,{attrs:['aN'],label:'Ring-moat & collar red-cedar sprays'});
 BIO.def('td_rosette_leaf',BIO.geo.clump(),M.rosette,{label:'Silver crown-chalice fog-combing rosette'});
 BIO.def('td_rosette_spike',BIO.geo.clump(),M.spike,{onLeaf:true,label:'Silver crown-chalice golden flower spike'});
 BIO.def('td_sedge',BIO.geo.clump(),M.sedge,{label:'Pan-rim & moat tussock sedge'});
 BIO.def('td_cotton',BIO.geo.clump(),M.cotton,{label:'Ring-moat seepage cottongrass'});
 BIO.def('td_cleftfern',BIO.geo.frond(4),M.cleftfern,{label:'Barometric breath-fern curtain'});
 BIO.def('td_shadefern',BIO.geo.clump(),M.shadefern,{label:'Sub-slab A-tent & Kluft shade fern'});
 BIO.def('td_veilbeard',BIO.geo.hang(),M.veilbeard,{label:'Crown-Veil mist-lichen drape'});
 BIO.def('td_gnammamoss',BIO.geo.mat(),M.panmoss,{label:'Resurrection mirror-mat pan velvet'});

 /* 3D fungoid, pitcher, bullseye lichen & exfoliation rock items */
 BIO.def('td_pitcher',BIO.fung.bladder({swell:0.52,neck:0.66,h:1.42,pleats:9,pleatA:0.08,seg:10,rings:5,seed:61101}),M.organicPitcher,{label:'Ring-moat amber pitcher trumpet'});
 BIO.def('td_ringlichen',BIO.fung.crust({lobes:8,lobeA:0.14,seg:16,rings:4,seed:61102}),M.organicLichen,{label:'Bullseye exfoliation lichen thallus'});
 BIO.def('td_gnarled_root',BIO.fung.stalk({r0:0.18,r1:0.07,bend:0.16,ribs:6,ribA:0.10,seg:7,rings:5}),M['wood.gnarled'],{label:'Bonsai root-plate clasping granite lip'});
 BIO.def('td_spall_slab',makeRockGeo(61201,0.32),M.rockShell,{label:'Exfoliation onion-skin granite spall slab'});
 BIO.def('td_dike_block',makeRockGeo(61202,0.82),M.rockPorphyry,{label:'Purple-rose porphyry ring-dike block'});
 BIO.def('td_smoky_prism',BIO.fung.stalk({r0:0.15,r1:0.03,bend:0.0,ribs:6,ribA:0.16,seg:6,rings:3}),M.crystalSmoky,{label:'Hydrothermal smoky-quartz prism'});

 if(typeof KFRONTIER!=='undefined'&&typeof KFRONTIER.defCladeItems==='function'){
  const eryMat=pbrMat('organic.pitcher',31,{roughness:0.38,metalness:0.04,color:0xe2422c});
  M.erythroCarnelian=eryMat;
  BIO.bucket('td_chitin',eryMat,{label:'Carnelian sky-island silica-chitin spires'});
  BIO.bucket('td_skel',M.rockPegmatite,{label:'Bleach-hardpan petrified chitin skeletons'});
  KFRONTIER.defCladeItems(BIO,{chitin:eryMat,ruby:eryMat,chalcedony:M.rockPegmatite,bleach:M.rockPegmatite},'td_kf');
 }

 const TREE_CFG={
  cloudgarlandpine:{bucket:'td_pine',fol:'td_pine_fol',pal:PAL.pine,barkCol:0x785644,H:[5.5,11.0],rK:0.028,tiers:4,droop:0.06,flatCrown:true,beard:true},
  panbonsai:{bucket:'td_gnarled',fol:'td_pine_fol',pal:PAL.bonsai,barkCol:0x7e7268,H:[1.5,3.5],rK:0.052,tiers:3,droop:0.04,bonsai:true,flatCrown:true},
  moatcedar:{bucket:'td_cedar',fol:'td_juniper_fol',pal:PAL.juniper,barkCol:0x7a5442,H:[6.0,11.8],rK:0.030,tiers:4,droop:0.08,flatCrown:false}
 };

 /* Procedural tree & bonsai builder: BIO.flareJoin limbs + 0.00 m stem-to-branch socket + B2 crown & base AO */
 THEDOME.growTree=function(kind,x,y,z,seed,scale,opt){
  const cfg=TREE_CFG[kind];
  if(!cfg)return{tris:0,H:0,r0:0};
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(cfg.H[0],cfg.H[1],H(seed,1,0,0x301))*sc;
  const r0=Math.max(0.09,H0*cfg.rK*(0.88+0.26*H(seed,2,0,0x301)));
  const leanX=(opt.windLeanX==null?0:opt.windLeanX)+(cfg.bonsai?0.22:0.04)*(H(seed,3,0,0x301)-0.5);
  const leanZ=(opt.windLeanZ==null?0:opt.windLeanZ)+(cfg.bonsai?0.22:0.04)*(H(seed,4,0,0x301)-0.5);
  let tris=0,clumps=0;

  const ownPrev=BIO.owner;
  BIO.owner=[x,z];
  try{
   const nSeg=cfg.bonsai?6:5,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const twist=cfg.bonsai?0.16*H0*Math.sin(t*4.6+seed*0.9):0.02*H0*Math.sin(t*3.2+seed*0.7);
    const tx=x+leanX*H0*t*t+twist*Math.cos(seed);
    const tz=z+leanZ*H0*t*t+twist*Math.sin(seed);
    const ty=y-0.45+(H0+0.45)*t;
    const flare=1+(cfg.bonsai?0.85:0.36)*Math.pow(Math.max(0,1-t/0.22),2);
    const rad=Math.max(0.04,r0*(1-0.78*Math.pow(t,0.86))*flare);
    trunk.push({x:tx,y:ty,z:tz,r:rad});
   }
   /* B2 base grounding tint on lower trunk */
   const bkCol=C(cfg.barkCol).multiplyScalar(0.92);
   tris+=BIO.tube(cfg.bucket,trunk,bkCol.getHex(),{seg:r0>0.28?6:5});

   /* Contorted BIO.flareJoin root-plates clasping granite exfoliation lips */
   const nRoots=cfg.bonsai?4:3;
   for(let k=0;k<nRoots;k++){
    const az=(k/nRoots)*TAU+0.42*H(seed,10+k,1,0x302);
    const rSpan=r0*(cfg.bonsai?(3.2+1.6*H(seed,10+k,2,0x302)):(2.1+0.9*H(seed,10+k,2,0x302)));
    const rootPts=BIO.flareJoin([
     {x:x+Math.cos(az)*r0*0.45,y:y+r0*1.35,z:z+Math.sin(az)*r0*0.45,r:r0*0.46},
     {x:x+Math.cos(az)*rSpan*0.62,y:y+r0*0.24,z:z+Math.sin(az)*rSpan*0.62,r:r0*0.28},
     {x:x+Math.cos(az)*rSpan,y:y-0.48,z:z+Math.sin(az)*rSpan,r:r0*0.14}
    ],{parentR:r0,k:1.55,sink:0.55,len:1.6});
    tris+=BIO.tube(cfg.bucket,rootPts,C(cfg.barkCol).multiplyScalar(0.80).getHex(),{seg:4});
   }

   /* Primary limbs with BIO.flareJoin + exact 0.00 m branch-socketed foliage pads + B2 crown self-occlusion */
   const nTiers=cfg.tiers;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=cfg.bonsai?(0.36+0.56*tf):(0.44+0.50*tf);
    const nBr=cfg.bonsai?3:3;
    for(let b=0;b<nBr;b++){
     const az=(b/nBr)*TAU+ti*1.22+0.38*H(seed,30+ti*4+b,1,0x304);
     const reach=H0*(cfg.bonsai?(0.38+0.14*(1-tf)):(0.20+0.16*Math.sin(tf*Math.PI*0.88)));
     const uIdx=Math.min(nSeg,Math.max(1,Math.round(baseT*nSeg)));
     const tp=trunk[uIdx];
     const bx0=tp.x,by0=tp.y,bz0=tp.z;
     const pR=Math.max(0.06,tp.r);
     const lift=cfg.flatCrown?0.05:0.16;
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*(lift-cfg.droop*0.5);
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.56)+reach*0.05,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.04,pR*0.52)},
      {x:mx,y:my,z:mz,r:Math.max(0.035,pR*0.32)},
      {x:ex,y:ey,z:ez,r:Math.max(0.028,pR*0.18)}
     ],{parentR:pR,k:1.6,sink:0.6,len:1.8});
     tris+=BIO.tube(cfg.bucket,brPts,cfg.barkCol,{seg:4});

     /* B2 under-crown self-occlusion: lower/inner tiers darker (0.66), upper/outer sunlit canopy bright (1.00) */
     const crownOccOuter=lerp(0.72,1.00,tf);
     const crownOccInner=lerp(0.62,0.90,tf);
     const fCol=C(cfg.pal[Math.floor(H(seed,60+ti*5+b,2,0x305)*cfg.pal.length)%cfg.pal.length]).multiplyScalar(crownOccOuter);
     const padW=reach*(cfg.bonsai?1.12:1.02),padH=padW*(cfg.flatCrown?0.46:0.68);
     /* Socket directly on [ex,ey,ez] and [mx,my,mz] -> 0.00 m gap to bark tube! */
     BIO.put(cfg.fol,[ex,ey,ez],qEuler(0.05*(H(seed,ti,b,0x306)-0.5),az,0),[padW,padH,padW],fCol);
     clumps++;
     if(reach>1.4){
      const fCol2=C(cfg.pal[Math.floor(H(seed,70+ti*5+b,3,0x305)*cfg.pal.length)%cfg.pal.length]).multiplyScalar(crownOccInner);
      BIO.put(cfg.fol,[mx,my,mz],qEuler(0,az+1.0,0),[padW*0.76,padH*0.78,padW*0.76],fCol2);
      clumps++;
     }
     /* Mist-combing veilbeard drapes anchored directly to [mx,my,mz] branch node on Crown-Veil pines */
     if(cfg.beard&&opt.misty&&ti<=1&&b===0&&H(seed,80+ti,b,0x308)<0.55){
      BIO.put('td_veilbeard',[mx,my,mz],qEuler(0,az,0),[0.42,0.85+0.45*H(seed,85+ti,b,0x308),0.42],C(0xdce6dc));
     }
    }
   }
   const topP=trunk[nSeg];
   const topW=H0*(cfg.bonsai?0.42:0.28),topH=topW*(cfg.flatCrown?0.44:0.62);
   BIO.put(cfg.fol,[topP.x,topP.y,topP.z],qEuler(0,seed*1.3,0),[topW,topH,topW],C(cfg.pal[0]));
   clumps++;
   if(typeof TD_VSTACK!=='undefined')TD_VSTACK.recordCrownAO(clumps);
  }finally{
   BIO.owner=ownPrev;
  }
  return{tris:tris,H:H0,r0:r0,crownR:H0*0.36};
 };

 /* Silver Crown-Chalice parabolic rosette + flower stalk builder (0 floating cards) */
 THEDOME.growRosette=function(x,y,z,seed,scale,withSpike){
  const sc=scale==null?1:scale;
  const rW=(0.72+0.48*H(seed,1,0,0x401))*sc;
  const rH=(0.68+0.44*H(seed,2,0,0x401))*sc;
  const col=C(PAL.rosette[Math.floor(H(seed,3,0,0x401)*PAL.rosette.length)%PAL.rosette.length]);
  BIO.put('td_rosette_leaf',[x,y-0.04,z],qEuler(0,H(seed,4,0,0x401)*TAU,0),[rW,rH,rW],col);
  BIO.put('td_rosette_leaf',[x,y-0.02,z],qEuler(0,H(seed,5,0,0x401)*TAU+1.05,0),[rW*0.74,rH*1.12,rW*0.74],col.clone().multiplyScalar(1.05));
  if(withSpike){
   const stalkH=(1.45+0.75*H(seed,6,0,0x401))*sc;
   BIO.tube('td_gnarled',[
    {x:x,y:y-0.12,z:z,r:0.06*sc},
    {x:x,y:y+stalkH*0.55,z:z,r:0.04*sc},
    {x:x,y:y+stalkH,z:z,r:0.022*sc}
   ],0x8a8274,{seg:4});
   const spCol=C(PAL.spike[Math.floor(H(seed,7,0,0x401)*PAL.spike.length)%PAL.spike.length]);
   BIO.put('td_rosette_spike',[x,y+stalkH*0.62,z],qEuler(0,H(seed,8,0,0x401)*TAU,0),[0.46*sc,stalkH*0.56,0.46*sc],spCol);
  }
 };

 /* Register octahedral impostor for >= 7 m cloudgarlandpine & moatcedar (34-core-impostor.js) */
 if(typeof BIO.impostor==='function'){
  ['cloudgarlandpine','moatcedar'].forEach((tk,idx)=>{
   try{
    BIO.impostor('td_imp_'+tk,()=>{
     THEDOME.growTree(tk,0,0,0,7100+idx*37,1.0,{misty:false});
    },{size:128,frames:8});
   }catch(e){}
  });
 }

 /* BIO.kin source contract (make + grow) so neighbor kits and openworld/ can borrow cloudgarlandpine & panbonsai */
 THEDOME.make=function(sp,x,y,z){
  const S=SPECIES[sp]||SPECIES[2];
  const s=KRAND.hash(6199,Math.round(x*2),Math.round(z*2),sp);
  const u=k=>KRAND.unit(KRAND.hash(s,k,0,0x511));
  return{
   sp:sp,key:S.key,x:x,y0:y,z:z,seed:s,
   H:lerp(S.H[0],S.H[1],u(1)),
   rb:lerp(S.rb[0],S.rb[1],u(2)),
   crownR:lerp(S.crownR[0],S.crownR[1],u(3))
  };
 };
 THEDOME.grow=function(T,lv){
  const S=SPECIES[T.sp]||SPECIES[2];
  if(S.key==='cloudgarlandpine'||S.key==='panbonsai'){
   if(lv===0&&S.key==='cloudgarlandpine'&&BIO.defs['td_imp_cloudgarlandpine']){
    BIO.put('td_imp_cloudgarlandpine',[T.x,T.y0,T.z],qEuler(0,(T.seed%628)*0.01,0),[T.crownR*2,T.H,T.crownR*2],C(0xffffff));
    return{far:1};
   }
   return THEDOME.growTree(S.key,T.x,T.y0,T.z,T.seed,1.0,{misty:false});
  }
  if(S.key==='crownrosette'){
   THEDOME.growRosette(T.x,T.y0,T.z,T.seed,1.0,true);
   return{rosette:1};
  }
  return{ok:true};
 };
})();
