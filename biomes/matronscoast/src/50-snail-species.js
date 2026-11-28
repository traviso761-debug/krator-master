// ================================================================= MATRONSCOAST — 10 native species, PBR shell/nacre materials & 3D giant molluscs ([draw])
// Registers BIO.kit('matronscoast') -> MATRON:
//   10 snail-coevolved native flora species (PLAN.md section 5.1):
//     1. nacretree        (18-32 m Pearl-Plum / Nacre-Fig; 2.2 m browse-skirt + cauliflorous white calcium-fruit balls at 1.2-1.8 m)
//     2. radulathorn      (8-16 m Glass-Collar Palm; lower 2.45 m trunk armed with downward opaline-silica spine whorls)
//     3. conchorchid      (0.5-1.2 m Matrons Twin-Slipper Orchid on cemented coquina conch-middens)
//     4. bitterfern       (0.9-1.8 m Alkaloid Shield-Fern forming ungrazed saponin islands beside slime-highways)
//     5. scrapelichen     (Radula-Stripe Rock Crust on skerry & intertidal granite)
//     6. slimecup         (0.4-0.9 m Mucus-Trap Pitcher fermenting snail mucin along highway rims)
//     7. shellreed        (1.0-2.0 m Coquina Sedge ringing shell-dammed lime pools)
//     8. velvetkelp_stub  (0.3-1.1 m Rasped Kelp Holdfast; Farside landkelp cropped by giant snails on kelpfront)
//     9. cloudpodocarp    (22-38 m Skerry Mist-Yew on +2,150 m Cfb cloudslope hung with Painted Lantern-Snails)
//    10. murexwort        (Purple-Spore Liverwort; fixative moss boiled with snail glands for Yonni Tyrian-purple dye)
//   Plus procedural 3D Giant Molluscs & Predators (dextral & 2% sinistral Queen-Shell helicospirals, 8-plated Megachiton,
//   Velvet Keel-Slug, Harpoon Cone-Snail, Painted Lantern-Snail, Shag-Shell Mountain Snail, and Skerry Anvil-Stork).
BIO.kit('matronscoast');
var MATRON={
 PHYS:SNAIL_PHYS,
 SITES:SNAIL_SITES,
 CROPS:SNAIL_CROPS,
 FAUNA:SNAIL_FAUNA,
 PLACED:[],
 CROWNS:[],
 SKY_PONDS:[],
 WALKERS:[]
};
(function(){
 'use strict';
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=h=>new T3.Color(h);
 MATRON.C=C;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 const K=(clim,arid,rip,kp,zone,o)=>Object.assign({
  climate:clim,aridity:arid,abyssal:false,riparian:rip,koppen:kp,zone:zone,holy:false,shared:null,alien:false,native:false
 },o||{});
 const HV=(wood,edible,medicinal,notes,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||''});

 const PAL=MATRON.PAL={
  nacreLeaf:[0x3a7034,0x467e3e,0x2f602b,0x548c46],
  palmLeaf:[0x427c36,0x508c40,0x366c2c,0x5e9648],
  yewLeaf:[0x28523a,0x325e44,0x214631,0x3c6a4c],
  bitterFern:[0x245848,0x2c6654,0x1e4c3e,0x34725e],
  shellReed:[0x6c8644,0x7c9650,0x5c783a,0x8c9858],
  orchid:[0xd83278,0xe8488c,0xf2dce8,0xc42868],
  slimeCup:[0x963248,0x6e8438,0xb43e54,0x587432],
  scrapeLichen:[0x388878,0xc89e34,0x449884,0xd6ae40],
  murexWort:[0x6c2468,0x822c7c,0x581c56,0x94388c],
  pearlFruit:[0xf6f2ec,0xede8fc,0xfaf4ea,0xe6f0f4],
  towerShell:[0x7c482c,0x945836,0x683a22,0xa86c44],
  queenShell:[0xf2eaf6,0xe4d8f4,0xf8f0ea],
  chitonValve:[0x324648,0x3c5454,0x283a3c,0x4a5e58],
  keelSlug:[0x246844,0x2e784e,0xc89c2c,0x1e5838],
  lanternSnail:[0x28a478,0xe8a424,0xd83248,0xf2ece2],
  coneSnail:[0xd8c8b0,0x8c442c,0xe6d8c4],
  shagSnail:[0x5c683c,0x6e7846,0x4e5834]
 };

 // ---------------------------------------------------------------- 10 endemic & snail-coevolved species
 const SPECIES=MATRON.SPECIES=[
  {key:'nacretree',name:'Pearl-Plum Nacre-Fig (Ficus margaritifera)',
   how:'Buttressed 18-32 m calcified-bark rainforest tree trimmed cleanly at the 2.2 m snail browse-skirt while dangling clusters of chalky white calcium-rich fruits on trunk cords at 1.2-1.8 m for giant snail seed dispersal.',
   items:['mc_nacre_fol','mc_pearl_fruit'],tags:K('tropic..subtropic','humid','both',['Af','Cfa'],'browse_cathedral')},
  {key:'radulathorn',name:'Glass-Collar Silica Palm (Bactris opalina)',
   how:'Slender 8-16 m coastal palm ringing its lower 2.45 m trunk in downward-angled whorls of razor-hard biogenic opal spines that deflect giant snail radulae.',
   items:['mc_palm_frond','mc_silica_whorl'],tags:K('tropic..subtropic','humid','no',['Af','Cfa'],'browse_cathedral')},
  {key:'conchorchid',name:'Matrons Twin-Slipper Orchid (Cypripedium matronae)',
   how:'Calciphile 0.5-1.2 m magenta-and-ivory twin-pouch slipper orchid rooted exclusively on cemented pH 8.1 coquina conch-middens.',
   items:['mc_orchid','mc_orchid_pouch'],tags:K('tropic..subtropic','humid','no',['Af','Cfa'],'coquina_midden',{holy:true})},
  {key:'bitterfern',name:'Alkaloid Shield-Fern (Dryopteris saponaria)',
   how:'Saponin-bitter 0.9-1.8 m dark blue-green floor fern left untouched by grazing Tower-Snails, forming lush emerald islands beside bare mucus highways.',
   items:['mc_fern'],tags:K('tropic..temperate','humid','both',['Af','Cfa','Cfb'],'browse_cathedral')},
  {key:'scrapelichen',name:'Radula-Stripe Rock Crust (Verrucaria radularis)',
   how:'Fast-regenerating teal-and-gold epilithic lichen and algal crust etched with parallel zigzag mollusc grazing tracks across skerry granite.',
   items:['mc_scrapelichen'],tags:K('tropic..temperate','humid','yes',['Af','Cfa','Cfb'],'skerry_intertidal')},
  {key:'slimecup',name:'Mucus-Trap Calcareous Pitcher (Nepenthes mucivora)',
   how:'Low 0.4-0.9 m fluted crimson-and-jade pitcher clusters lining slime-highway rims, fermenting stray snail mucus into a sweet fly-trapping lure.',
   items:['mc_slimecup','mc_slimecup_lid'],tags:K('tropic..subtropic','humid','yes',['Af','Cfa'],'mucus_highway')},
  {key:'shellreed',name:'Coquina Pool Sedge (Cladium conchiferum)',
   how:'Sharp-edged 1.0-2.0 m silica-and-lime marsh sedge ringing shell-dammed emerald pools and coastal cataracts.',
   items:['mc_sedge'],tags:K('tropic..temperate','humid','yes',['Af','Cfa','Cfb'],'coquina_midden',{crop:'eelgrass'})},
  {key:'velvetkelp_stub',name:'Rasped Landkelp Holdfast (Macrocystis abrasa)',
   how:'Scarred 0.3-1.1 m lime-stiffened landkelp holdfasts and gnawed stipe stumps cropped relentlessly by littoral Tower-Snails and Megachitons along the southern Farside border.',
   items:['mc_kelp_shred'],tags:K('tropic..temperate','humid','yes',['Af'],'kelp_front',{kin:'farside.landkelp',crop:'kelp-ash'})},
  {key:'cloudpodocarp',name:'Skerry Mist-Yew (Podocarpus nubicola)',
   how:'Salt- and mist-tolerant 22-38 m upper Cfb cloud-rainforest conifer draped in jewel-banded Painted Lantern-Snails above +1,900 m.',
   items:['mc_yew_fol'],tags:K('temperate','humid','both',['Cfb','Dfb'],'cloud_cataract')},
  {key:'murexwort',name:'Purple-Spore Fixative Liverwort (Marchantia purpurea)',
   how:'Royal plum-violet thallose liverwort mat on wet coquina and skerry spray-ledges, boiled as mordant with snail hypobranchial glands to set Yonni Tyrian-purple cloth dye.',
   items:['mc_murexwort'],tags:K('tropic..temperate','humid','yes',['Af','Cfa','Cfb'],'skerry_intertidal',{crop:'bay-purple'})}
 ];
 SPECIES.forEach((S,i)=>{S.i=i;});

 MATRON.HARVEST={
  nacretree:HV('timber, lime-ash',['pearl-plum pulp'],false,'Dense stone-bark timber; chalky calcium-rich fruit pulp eaten sweet or burned for shell-lime ash.','fruit'),
  radulathorn:HV('thatch',['palm heart'],false,'Waterproof coastal thatch fronds; glassy biogenic silica spines harvested as Yonni surgical lancets and strike-sparks.'),
  conchorchid:HV('none',[],true,'Mucilaginous twin-pouch salve cools salt-spray chafing and harpoon-snail stings; sacred to Yonni Twin-Queens.','medicine'),
  bitterfern:HV('none',[],true,'Boiled saponin frond-wash repels leeches and Shroud-Ants along inland border trails.','reagent'),
  scrapelichen:HV('none',['scraped golden thallus'],false,'Emergency coastal broth thickener and golden-ochre mineral indicator on granite skerries.'),
  slimecup:HV('none',[],true,'Sterile viscoelastic pitcher mucilage sets clean waterproof wound dressings and feather-fletching glue.','medicine'),
  shellreed:HV('weaving',[],false,'Plaited into heavy snail-gathering creels; calcined silica-lime ash tempers Yonni hydraulic sealime mortar.'),
  velvetkelp_stub:HV('none',['kombu rind'],false,'Cropped holdfasts burned for potash, soda, and iodine reagent along the southern kelp frontier.','reagent'),
  cloudpodocarp:HV('boat-timber, bow-stave',[],false,'Rot-proof resinous planking for skerry surf-skiffs and laminated Spear-Queen war-bows.'),
  murexwort:HV('none',[],false,'Indispensable mordant moss fixing snail hypobranchial royal Tyrian-purple and crimson dyes on linen and ramie.','dye')
 };
 SPECIES.forEach(S=>{S.tags.harvest=MATRON.HARVEST[S.key];});

 const byKey={};
 SPECIES.forEach(S=>{byKey[S.key]=S;});
 MATRON.byKey=byKey;
 MATRON.speciesOfItem=it=>{
  for(let i=0;i<SPECIES.length;i++)if(SPECIES[i].items.indexOf(it)>=0)return SPECIES[i];
  return null;
 };
 MATRON.plantOfItem=MATRON.speciesOfItem;

 // ---------------------------------------------------------------- procedural fallbacks (100% replaced by packed library tex/)
 const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{
  const d=g.createImageData(w,h);
  for(let i=0;i<w*h;i++){
   const v=202+(H(seed,i%w,(i/w)|0,0x71)-0.5)*46;
   d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=clamp(v,0,255);d.data[i*4+3]=255;
  }
  g.putImageData(d,0,0);
 });
 const cardFallback=seed=>BIO.alphaTex(128,(g,S)=>{
  g.fillStyle='rgba(214,236,210,1)';
  for(let k=0;k<32;k++){
   const x=S*(0.16+0.68*H(seed,k,1,0x81)),y=S*(0.15+0.70*H(seed,k,2,0x81)),r=S*(0.06+0.05*H(seed,k,3,0x81));
   g.beginPath();g.ellipse(x,y,r,r*0.54,H(seed,k,4,0x81)*TAU,0,TAU);g.fill();
  }
 },[174,202,170]);

 function pbrMat(slot,seed,opt){
  opt=opt||{};
  const fb=grey(128,seed);
  const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('matronscoast',slot):null;
  const tx=L?KMAT.textures(L,{aniso:8}):{map:fb,normalMap:null,roughnessMap:null};
  const m=new T3.MeshStandardMaterial({
   color:opt.color==null?0xffffff:opt.color,
   map:tx.map||fb,
   normalMap:tx.normalMap||null,
   roughnessMap:tx.roughnessMap||null,
   roughness:opt.roughness==null?0.68:opt.roughness,
   metalness:opt.metalness==null?0.04:opt.metalness,
   emissive:opt.emissive==null?0x000000:opt.emissive,
   emissiveIntensity:opt.emissiveIntensity==null?0:opt.emissiveIntensity,
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

 // ---------------------------------------------------------------- MATRON.M material table (100% mapped to materials.json)
 const M=MATRON.M={
  'bark.nacre':BIO.barkMat(grey(128,11)),
  'bark.palm':BIO.barkMat(grey(128,12)),
  'bark.yew':BIO.barkMat(grey(128,13)),
  'bark.kelp':BIO.barkMat(grey(128,14)),

  rockGranite:pbrMat('rock.granite',21,{roughness:0.56,metalness:0.04}),
  rockIronstone:pbrMat('rock.ironstone',22,{roughness:0.62,metalness:0.08}),
  stoneCoquina:pbrMat('stone.coquina',23,{roughness:0.42,metalness:0.05,color:0xf6f0e6}),
  shellTower:pbrMat('shell.tower',24,{roughness:0.22,metalness:0.08}),
  shellNacre:pbrMat('shell.nacre',25,{roughness:0.14,metalness:0.14,color:0xfaf4fa,emissive:0x1c1624,emissiveIntensity:0.10}),
  shellChiton:pbrMat('shell.chiton',26,{roughness:0.26,metalness:0.28}),
  shellLantern:pbrMat('shell.lantern',27,{roughness:0.16,metalness:0.10,emissive:0x141818,emissiveIntensity:0.12}),
  shellShag:pbrMat('shell.shag',28,{roughness:0.78,metalness:0.02}),
  skinMollusc:pbrMat('skin.mollusc',29,{roughness:0.18,metalness:0.06}),
  organicPitcher:pbrMat('organic.pitcher',30,{roughness:0.28,metalness:0.04}),
  organicLichen:pbrMat('organic.lichen',31,{roughness:0.68,metalness:0.02}),
  mineralOpaline:pbrMat('mineral.opaline',32,{roughness:0.12,metalness:0.12,color:0xe8f6fa,emissive:0x102026,emissiveIntensity:0.14}),
  worksLime:pbrMat('works.lime',33,{roughness:0.52,metalness:0.02,vertexColors:false,color:0xf4efe4}),
  worksWicker:pbrMat('works.wicker',34,{roughness:0.76,metalness:0.02,vertexColors:false,color:0xc8ab78}),

  // Stem-anchored foliage cutout cards (exact materials.json keys)
  nacrefol:BIO.leafMat(cardFallback(51),'mc-nacrefol',{aN:true,swayW:'0.55',swayA:0.05}),
  palmfrond:BIO.leafMat(cardFallback(52),'mc-palmfrond',{aN:false,swayW:'0.65',swayA:0.07}),
  yewfol:BIO.leafMat(cardFallback(53),'mc-yewfol',{aN:true,swayW:'0.50',swayA:0.04}),
  fern:BIO.leafMat(cardFallback(54),'mc-fern',{aN:false,swayW:'(position.y)',swayA:0.05}),
  orchid:BIO.leafMat(cardFallback(55),'mc-orchid',{aN:false,swayW:'(position.y)',swayA:0.06}),
  sedge:BIO.leafMat(cardFallback(56),'mc-sedge',{aN:false,swayW:'(position.y)',swayA:0.07}),
  kelpstub:BIO.leafMat(cardFallback(57),'mc-kelpstub',{aN:false,swayW:'(0.45)',swayA:0.08})
 };

 MATRON.SWAP=BIO.libSwap('matronscoast',M);

 if(typeof MC_VSTACK!=='undefined'){
  MC_VSTACK.dilateCardTextures('matronscoast',M);
  MC_VSTACK.applyRoughAA(M.shellTower,'shell-tower',[0.002,0.008,0.020,0.046,0.086,0.136,0.186,0.236],512.0);
  MC_VSTACK.applyRoughAA(M.shellNacre,'shell-nacre',[0.001,0.006,0.016,0.038,0.072,0.118,0.165,0.215],512.0);
  MC_VSTACK.applyRoughAA(M.shellChiton,'shell-chiton',[0.002,0.009,0.022,0.048,0.088,0.138,0.188,0.238],512.0);
  MC_VSTACK.applyRoughAA(M.stoneCoquina,'coquina',[0.003,0.010,0.025,0.054,0.096,0.148,0.198,0.248],512.0);
  MC_VSTACK.applyRoughAA(M.skinMollusc,'skin-mollusc',[0.002,0.008,0.020,0.045,0.082,0.130,0.180,0.230],256.0);
  MC_VSTACK.applyNacreSheen(M.shellNacre,'nacre',0.34,12.5);
  MC_VSTACK.applyNacreSheen(M.shellTower,'tower',0.18,10.5);
  MC_VSTACK.applyNacreSheen(M.shellLantern,'lantern',0.26,14.0);
  MC_VSTACK.applyNacreSheen(M.stoneCoquina,'coquina-nacre',0.12,9.5);
 }

 // ---------------------------------------------------------------- merged bark & kelp-stipe buckets
 BIO.bucket('mc_nacre_bark',M['bark.nacre'],{label:'Pearl-Plum Nacre-Fig buttressed stone-bark trunks & cauliflory cords'});
 BIO.bucket('mc_palm_bark',M['bark.palm'],{label:'Glass-Collar Silica Palm ringed trunks'});
 BIO.bucket('mc_yew_bark',M['bark.yew'],{label:'Skerry Mist-Yew cloud-forest trunks & boughs'});
 BIO.bucket('mc_kelp_stipe',M['bark.kelp'],{label:'Rasped Farside landkelp holdfast haptera & stipe stumps'});

 // ---------------------------------------------------------------- 3D procedural geometries (MATRON.G — zero BoxGeometry!)
 const G=MATRON.G={};

 function pushPart(acc,geo,sx,sy,sz,ox,oy,oz,rx,ry,rz,rgb){
  const g=geo.index?geo.toNonIndexed():geo.clone();
  if(rx||ry||rz){
   const m4=new T3.Matrix4().makeRotationFromEuler(new T3.Euler(rx||0,ry||0,rz||0));
   g.applyMatrix4(m4);
  }
  const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
  for(let i=0;i<p.count;i++){
   acc.pos.push(p.getX(i)*sx+ox,p.getY(i)*sy+oy,p.getZ(i)*sz+oz);
   acc.nor.push(n?n.getX(i):0,n?n.getY(i):1,n?n.getZ(i):0);
   acc.uv.push(u?u.getX(i):0.5,u?u.getY(i):0.5);
   const cr=typeof rgb==='function'?rgb(p.getX(i),p.getY(i),p.getZ(i)):rgb;
   acc.col.push(cr[0],cr[1],cr[2]);
  }
 }

 function finishGeo(acc){
  const g=BIO.geo._make(acc.pos,acc.nor,acc.uv,acc.col);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
 }

 /* 1. True 3D Raup Logarithmic Helicospiral Gastropod Shell (supports dextral +1 AND sacred 2% sinistral -1 Queen-Shell!)
       Unit length ~1.0 m along -Z/+Z, resting cleanly with aperture above y = 0.08 m over pedal saddle. */
 G.makeSpiralShellGeo=function(opt){
  opt=opt||{};
  const sign=opt.sinistral?-1:1;
  const whorls=opt.whorls==null?3.8:opt.whorls;
  const spireLen=opt.spireLen==null?0.92:opt.spireLen;
  const bellyR=opt.bellyR==null?0.30:opt.bellyR;
  const nSteps=opt.steps==null?38:opt.steps;
  const nRad=opt.radSeg==null?10:opt.radSeg;
  const tiltPitch=opt.pitch==null?-0.28:opt.pitch;
  const cp=Math.cos(tiltPitch),sp=Math.sin(tiltPitch);

  const rings=[],uvV=[];
  for(let i=0;i<=nSteps;i++){
   const t=i/nSteps;
   const ang=sign*t*whorls*TAU;
   const grow=Math.pow(t,1.38);
   const lipFlare=t>0.88?1.0+0.18*smooth(0.88,1.0,t):1.0;
   const rib=1.0+0.038*Math.sin(t*86.0)*(opt.shaggy?2.1:1.0);
   const tubeR=Math.max(0.008,bellyR*grow*lipFlare*rib);
   const helR=bellyR*0.68*grow;
   /* Apex points backward (-z) and slightly up; body whorl sits forward (+z) */
   const axisZ=-spireLen*0.56+spireLen*0.86*grow;
   const cx0=Math.cos(ang)*helR;
   const cy0=Math.sin(ang)*helR*0.88+bellyR*0.78;
   const cz0=axisZ;

   /* Radial basis around tangent */
   const nx0=Math.cos(ang),ny0=Math.sin(ang);
   const ring=[];
   for(let j=0;j<=nRad;j++){
    const phi=(j/nRad)*TAU;
    const cph=Math.cos(phi),sph=Math.sin(phi);
    const shaggyLift=opt.shaggy?(1.0+0.12*Math.max(0,Math.sin(phi*5+i))):1.0;
    const rx=cx0+tubeR*shaggyLift*(nx0*cph*0.92);
    const ry=cy0+tubeR*shaggyLift*(ny0*cph*0.92+sph*0.35);
    const rz=cz0+tubeR*shaggyLift*(sph*0.94);
    /* Tilt spire gently over the snail's back */
    const fy=ry*cp-rz*sp+0.12;
    const fz=ry*sp+rz*cp;
    /* Longitudinal spiral colour banding + nacre lip brightening */
    const band=0.72+0.28*Math.sin(phi*3.0+t*12.0);
    const lipNacre=t>0.90?smooth(0.90,1.0,t):0;
    const cr=lerp(band*1.04,1.15,lipNacre);
    const cg=lerp(band*0.92,1.10,lipNacre);
    const cb=lerp(band*0.80,1.16,lipNacre);
    ring.push([rx,Math.max(0.02,fy),fz,j/nRad,cr,cg,cb]);
   }
   rings.push(ring);
   uvV.push(t*3.0);
  }

  const pos=[],nor=[],uv=[],col=[];
  for(let i=0;i<nSteps;i++){
   const rA=rings[i],rB=rings[i+1];
   for(let j=0;j<nRad;j++){
    const a=rA[j],b=rB[j],c=rB[j+1],d=rA[j+1];
    const quads=sign>0?[a,b,c,a,c,d]:[a,c,b,a,d,c];
    for(let q=0;q<6;q++){
     const v=quads[q];
     pos.push(v[0],v[1],v[2]);
     nor.push(0,1,0);
     uv.push(v[3],q===1||q===2||q===4?uvV[i+1]:uvV[i]);
     col.push(v[4],v[5],v[6]);
    }
   }
  }
  const g=BIO.geo._make(pos,nor,uv,col);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
 };

 /* 2. Muscular Gastropod Pedal Foot, Ruffled Mantle Collar & 4 Stalked Optic/Sensory Tentacles (facing +Z) */
 G.makeSnailBodyGeo=function(withMantle){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const sole=new T3.SphereGeometry(0.5,14,10);
  pushPart(acc,sole,0.52,0.22,1.18,0,0.08,0.04,0,0,0,(x,y,z)=>{
   const ruffle=0.82+0.18*Math.sin(z*18.0+x*12.0);
   const top=clamp(y+0.5,0.2,1.0);
   return[ruffle*(0.78+0.22*top),ruffle*(0.82+0.18*top),ruffle*(0.76+0.20*top)];
  });
  if(withMantle!==false){
   const neck=new T3.CylinderGeometry(0.14,0.22,0.34,10,2);
   pushPart(acc,neck,1.0,1.0,1.1,0,0.20,0.34,0.68,0,0,[0.92,0.94,0.88]);
   const head=new T3.SphereGeometry(0.15,10,8);
   pushPart(acc,head,1.05,0.88,1.15,0,0.28,0.48,0,0,0,[0.96,0.96,0.90]);
  }
  /* Upper pair of long optic eye-stalks + dark terminal eye-bulbs */
  const stalk=new T3.CylinderGeometry(0.016,0.032,0.32,6,1);
  const bulb=new T3.SphereGeometry(0.028,7,6);
  for(let s=-1;s<=1;s+=2){
   pushPart(acc,stalk,1,1,1,s*0.11,0.44,0.58,0.52,0,-s*0.36,[0.95,0.92,0.84]);
   pushPart(acc,bulb,1,1,1,s*0.17,0.56,0.66,0,0,0,[0.28,0.24,0.26]);
   /* Lower pair of chemosensory trail-feelers */
   pushPart(acc,stalk,0.75,0.52,0.75,s*0.09,0.20,0.60,1.15,0,-s*0.28,[0.90,0.88,0.82]);
  }
  return finishGeo(acc);
 };

 /* 3. 8-Plated Armoured Skerry Megachiton (1.0 unit long along +Z, clinging flat on wave-washed rock) */
 G.makeMegachitonGeo=function(){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const girdle=new T3.SphereGeometry(0.5,16,10);
  pushPart(acc,girdle,0.72,0.16,1.12,0,0.04,0,0,0,0,[0.56,0.46,0.38]);
  const plate=new T3.SphereGeometry(0.5,12,8);
  for(let i=0;i<8;i++){
   const u=i/7;
   const arch=Math.sin(u*Math.PI);
   const w=0.46*(0.68+0.36*arch);
   const h=0.15*(0.72+0.34*arch);
   const z=-0.38+0.76*u;
   const y=0.11+0.05*arch;
   const shade=0.78+0.22*((i%2)*0.4+arch*0.6);
   pushPart(acc,plate,w*1.6,h*2.0,0.24,0,y,z,0.14,0,0,[shade*0.92,shade*1.02,shade*1.0]);
  }
  return finishGeo(acc);
 };

 /* 4. Velvet Keel-Slug (0.75 m emerald-and-gold forest floor decomposer with raised dorsal keel) */
 G.makeKeelSlugGeo=function(){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const body=new T3.SphereGeometry(0.5,14,10);
  pushPart(acc,body,0.36,0.24,1.24,0,0.09,0,0,0,0,(x,y,z)=>{
   const keel=Math.abs(x)<0.08&&y>0.12?1.28:0.88;
   return[keel*0.85,keel*1.06,keel*0.78];
  });
  const shield=new T3.SphereGeometry(0.5,10,8);
  pushPart(acc,shield,0.40,0.22,0.48,0,0.16,0.18,0,0,0,[1.08,1.02,0.74]);
  const stalk=new T3.CylinderGeometry(0.014,0.026,0.22,5,1);
  for(let s=-1;s<=1;s+=2){
   pushPart(acc,stalk,1,1,1,s*0.07,0.24,0.58,0.62,0,-s*0.30,[0.94,0.98,0.78]);
  }
  return finishGeo(acc);
 };

 /* 5. Venomous Midden Harpoon Cone-Snail (Terraconus rox: biconical shell + red siphon + chitinous radular harpoon) */
 G.makeConeSnailGeo=function(){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const cone=new T3.ConeGeometry(0.24,0.78,12,4);
  pushPart(acc,cone,1.0,1.0,0.88,0,0.19,-0.04,-Math.PI*0.46,0,0,(x,y)=>{
   const chevron=0.72+0.28*Math.sin(y*22.0+x*16.0);
   return[chevron*1.06,chevron*0.92,chevron*0.80];
  });
  const spire=new T3.ConeGeometry(0.23,0.20,12,2);
  pushPart(acc,spire,1.0,1.0,0.88,0,0.23,-0.46,Math.PI*0.54,0,0,[0.92,0.84,0.74]);
  const siphon=new T3.CylinderGeometry(0.018,0.032,0.34,6,1);
  pushPart(acc,siphon,1,1,1,0,0.18,0.46,1.18,0,0,[0.96,0.36,0.42]);
  const harpoon=new T3.ConeGeometry(0.012,0.22,5,1);
  pushPart(acc,harpoon,1,1,1,0.04,0.12,0.54,Math.PI*0.48,0,0,[0.98,0.94,0.88]);
  return finishGeo(acc);
 };

 /* 6. Skerry Anvil-Stork (1.12 m malacophagous wading bird with heavy shell-cracking bill) */
 G.makeAnvilStorkGeo=function(){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const leg=new T3.CylinderGeometry(0.014,0.018,0.54,5,1);
  pushPart(acc,leg,1,1,1,-0.06,0.27,0,0.04,0,0,[0.86,0.52,0.36]);
  pushPart(acc,leg,1,1,1,0.06,0.27,0,-0.03,0,0,[0.86,0.52,0.36]);
  const torso=new T3.SphereGeometry(0.5,10,8);
  pushPart(acc,torso,0.28,0.30,0.52,0,0.60,-0.02,-0.18,0,0,[0.88,0.90,0.94]);
  pushPart(acc,torso,0.30,0.22,0.44,0,0.64,-0.08,-0.22,0,0,[0.34,0.38,0.44]);
  const neck=new T3.CylinderGeometry(0.036,0.052,0.34,6,2);
  pushPart(acc,neck,1,1,1,0,0.82,0.14,0.28,0,0,[0.92,0.94,0.96]);
  const head=new T3.SphereGeometry(0.068,8,6);
  pushPart(acc,head,1.0,0.92,1.18,0,0.98,0.22,0,0,0,[0.90,0.92,0.95]);
  const bill=new T3.ConeGeometry(0.038,0.28,6,1);
  pushPart(acc,bill,0.85,1.0,1.0,0,0.95,0.38,Math.PI*0.54,0,0,[0.84,0.62,0.28]);
  return finishGeo(acc);
 };

 /* 7. Downward-angled Whorl of Biogenic Opal Spines for Glass-Collar Palm (radulathorn) */
 G.makeSilicaWhorlGeo=function(){
  const acc={pos:[],nor:[],uv:[],col:[]};
  const collar=new T3.CylinderGeometry(0.24,0.26,0.10,10,1);
  pushPart(acc,collar,1,1,1,0,0,0,0,0,0,[0.76,0.82,0.84]);
  const spine=new T3.ConeGeometry(0.026,0.44,5,1);
  const nSp=11;
  for(let i=0;i<nSp;i++){
   const a=(i/nSp)*TAU;
   const cx=Math.cos(a)*0.34,cz=Math.sin(a)*0.34;
   /* Point outward and downward at ~38 deg to impale climbing giant snail pedal soles */
   const g=spine.toNonIndexed();
   g.rotateX(Math.PI*0.70);
   g.rotateY(-a+Math.PI*0.5);
   const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
   for(let k=0;k<p.count;k++){
    acc.pos.push(p.getX(k)+cx,p.getY(k)-0.08,p.getZ(k)+cz);
    acc.nor.push(n.getX(k),n.getY(k),n.getZ(k));
    acc.uv.push(u.getX(k),u.getY(k));
    acc.col.push(0.94,0.98,1.0);
   }
  }
  return finishGeo(acc);
 };

 /* 8. Spheroidal multi-lobe granite / coquina boulder & broken anvil-shell shard */
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
 G.makeSpheroidalRockGeo=makeSpheroidalRockGeo;

 // ---------------------------------------------------------------- Instanced BIO.def items (100% leaf-stems compliant)
 BIO.def('mc_nacre_fol',BIO.geo.clump(),M.nacrefol,{attrs:['aN'],label:'Pearl-Plum Nacre-Fig canopy spray'});
 BIO.def('mc_palm_frond',BIO.geo.clump(),M.palmfrond,{label:'Glass-Collar Silica Palm crown fronds'});
 BIO.def('mc_yew_fol',BIO.geo.clump(),M.yewfol,{attrs:['aN'],label:'Skerry Mist-Yew cloud-conifer sprays'});
 BIO.def('mc_fern',BIO.geo.clump(),M.fern,{label:'Alkaloid Shield-Fern ungrazed saponin rosette'});
 BIO.def('mc_orchid',BIO.geo.clump(),M.orchid,{label:'Matrons Twin-Slipper Orchid bloom spray'});
 BIO.def('mc_sedge',BIO.geo.clump(),M.sedge,{label:'Coquina Pool Sedge calcareous tussock'});
 BIO.def('mc_kelp_shred',BIO.geo.clump(),M.kelpstub,{label:'Snail-rasped landkelp blade shred'});

 // 3D coevolved botanical structures (BIO.fung & custom opaline whorls)
 BIO.def('mc_pearl_fruit',BIO.fung.pod({tip:0.18,h:1.18,seg:10,rings:6,hang:true}),M.shellNacre,{label:'Pearl-Plum cauliflorous calcium-bribe fruit'});
 BIO.def('mc_silica_whorl',G.makeSilicaWhorlGeo(),M.mineralOpaline,{label:'Biogenic opal anti-radula trunk spine-whorl'});
 BIO.def('mc_orchid_pouch',BIO.fung.pod({tip:0.24,h:1.35,seg:9,rings:5}),M.organicPitcher,{label:'Twin-Slipper Orchid inflated calciphile labellum'});
 BIO.def('mc_slimecup',BIO.fung.tube({n:4,r:0.16,hMin:0.55,spread:0.28,seg:8,seed:92011}),M.organicPitcher,{label:'Mucus-Trap Calcareous Pitcher cluster'});
 BIO.def('mc_slimecup_lid',BIO.fung.cap({form:'disc',h:0.22,seg:8,rings:2,under:'none',seed:92012}),M.organicPitcher,{label:'Mucus-Trap Pitcher nectar operculum'});
 BIO.def('mc_scrapelichen',BIO.fung.crust({lobes:7,lobeA:0.26,seg:14,rings:3,seed:92013}),M.organicLichen,{label:'Radula-Stripe grazed rock lichen crust'});
 BIO.def('mc_murexwort',BIO.fung.crust({lobes:6,lobeA:0.30,seg:14,rings:3,seed:92014}),M.organicLichen,{label:'Purple-Spore Tyrian-mordant liverwort mat'});

 // 3D Giant Molluscs, Predators, Coquina Conch-Clasts & Anvil Boulders
 G.shellDex=G.makeSpiralShellGeo({sinistral:false,whorls:3.9});
 G.shellSin=G.makeSpiralShellGeo({sinistral:true,whorls:4.1});
 G.shellShag=G.makeSpiralShellGeo({sinistral:false,whorls:3.2,spireLen:0.68,bellyR:0.34,shaggy:true});
 G.shellLantern=G.makeSpiralShellGeo({sinistral:false,whorls:3.6,spireLen:0.78,bellyR:0.32});
 G.snailBody=G.makeSnailBodyGeo(true);
 G.keelSlug=G.makeKeelSlugGeo();

 BIO.def('mc_snail_shell_dex',G.shellDex,M.shellTower,{label:'Matrons Tower-Snail dextral spiral shell (0.7-1.1 m)'});
 BIO.def('mc_snail_shell_sin',G.shellSin,M.shellNacre,{label:'Sacred Lone-Born sinistral Queen-Shell (2% chirality)'});
 BIO.def('mc_snail_body',G.snailBody,M.skinMollusc,{label:'Matrons Tower-Snail muscular pedal foot & optic tentacles'});
 BIO.def('mc_conch_clast_dex',G.shellDex,M.stoneCoquina,{label:'Cemented coquina Conch-Midden fossil spiral shell'});
 BIO.def('mc_conch_clast_sin',G.shellSin,M.shellNacre,{label:'Fossil nacreous Queen-Shell embedded in coquina midden'});
 BIO.def('mc_megachiton',G.makeMegachitonGeo(),M.shellChiton,{label:'8-plated Skerry Megachiton (0.85-1.25 m magnetite-radula grazer)'});
 BIO.def('mc_keelslug',G.keelSlug,M.skinMollusc,{label:'Velvet Keel-Slug (0.7 m saponin-mucus trail builder)'});
 BIO.def('mc_conesnail',G.makeConeSnailGeo(),M.shellLantern,{label:'Midden Harpoon Cone-Snail (Terraconus ambush predator)'});
 BIO.def('mc_lantern_snail',G.shellLantern,M.shellLantern,{label:'Painted Lantern-Snail (porcelain-banded canopy grazer)'});
 BIO.def('mc_shagshell',G.shellShag,M.shellShag,{label:'Shag-Shell Mountain Snail (furry periostracum Cfb grazer)'});
 BIO.def('mc_anvil_stork',G.makeAnvilStorkGeo(),M.shellNacre,{label:'Skerry Anvil-Stork (malacophagous shell-cracking wader)'});
 BIO.def('mc_rock_granite',makeSpheroidalRockGeo(92101,0.62,3),M.rockGranite,{label:'Granite skerry & anvil boulder'});
 BIO.def('mc_rock_ironstone',makeSpheroidalRockGeo(92103,0.58,3),M.rockIronstone,{label:'Coastal ironstone boulder'});
 BIO.def('mc_rock_coquina',makeSpheroidalRockGeo(92102,0.54,4),M.stoneCoquina,{label:'Biogenic coquina shell-limestone block'});

 // ---------------------------------------------------------------- Native Tree & Kelp-Stub Builders (BIO.flareJoin + 0.00 m stem float!)
 /* 1. Pearl-Plum Nacre-Fig (nacretree, 18-32 m):
       Strict >= 2.25 m browse-skirt clearance! Dangles chalky white 0.28-0.44 m calcium-fruit balls in 1.2-1.6 m cauliflorous clusters
       along short trunk cords at y + 1.15..1.85 m so giant Tower-Snails gorge on the calcium without harming canopy foliage. */
 MATRON.growNacreTree=function(x,y,z,seed,scale,opt){
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(18.5,30.5,H(seed,1,0,0x401))*sc;
  const r0=Math.max(0.28,H0*0.034*(0.88+0.24*H(seed,2,0,0x401)));
  const leanX=0.022*(H(seed,3,0,0x401)-0.5),leanZ=0.022*(H(seed,4,0,0x401)-0.5);
  let tris=0,lanternSpots=[];

  BIO.tree(x,z,()=>{
   const nSeg=6,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const tx=x+leanX*H0*t*t,tz=z+leanZ*H0*t*t,ty=y-0.85+(H0+0.85)*t;
    const flare=1+0.92*Math.pow(Math.max(0,1-t/0.20),2);
    trunk.push({x:tx,y:ty,z:tz,r:i===nSeg?0.04:Math.max(0.08,r0*(1-0.78*Math.pow(t,0.88))*flare)});
   }
   tris+=BIO.tube('mc_nacre_bark',trunk,0xc8c0b4,{seg:r0>0.42?8:6});

   /* Calcified stone-bark plank buttresses */
   for(let k=0;k<4;k++){
    const az=(k/4)*TAU+0.35*H(seed,10+k,1,0x402);
    const rSpan=r0*(2.4+0.7*H(seed,10+k,2,0x402));
    const rootPts=BIO.flareJoin([
     {x:x+Math.cos(az)*r0*0.45,y:y+2.15,z:z+Math.sin(az)*r0*0.45,r:r0*0.44},
     {x:x+Math.cos(az)*rSpan*0.64,y:y+0.55,z:z+Math.sin(az)*rSpan*0.64,r:r0*0.28},
     {x:x+Math.cos(az)*rSpan,y:y-0.85,z:z+Math.sin(az)*rSpan,r:r0*0.14}
    ],{parentR:r0,k:1.65,sink:0.55,len:2.0});
    tris+=BIO.tube('mc_nacre_bark',rootPts,0xbeb6aa,{seg:5});
   }

   /* Cauliflorous "Pearl-Bribe" white calcium-fruit clusters dangling at 1.15-1.85 m height (reachable by giant snails!) */
   if(!opt.impostor){
    const nCords=3+(seed%3);
    for(let c=0;c<nCords;c++){
     const az=(c/nCords)*TAU+0.5*H(seed,20+c,1,0x403);
     const cy0=y+lerp(1.35,1.88,H(seed,20+c,2,0x403));
     const crOut=r0*(1.12+0.25*H(seed,20+c,3,0x403));
     const cordEnd=[x+Math.cos(az)*crOut,cy0-0.24,z+Math.sin(az)*crOut];
     tris+=BIO.tube('mc_nacre_bark',[
      {x:x+Math.cos(az)*r0*0.65,y:cy0+0.12,z:z+Math.sin(az)*r0*0.65,r:0.045},
      {x:cordEnd[0],y:cordEnd[1],z:cordEnd[2],r:0.028}
     ],0x9e9282,{seg:4});
     /* Dense 1.2-1.5 m grape-like cluster of chalky white nacreous calcium spheres */
     for(let b=0;b<4;b++){
      const ba=az+(b-1.5)*0.42;
      const fx=cordEnd[0]+Math.cos(ba)*0.18,fz=cordEnd[2]+Math.sin(ba)*0.18,fy=cordEnd[1]+0.06-b*0.07;
      const fs=0.26+0.12*H(seed,25+c*4+b,4,0x403);
      BIO.put('mc_pearl_fruit',[fx,fy,fz],qEuler(0,ba,0),[fs,fs*1.05,fs],C(PAL.pearlFruit[(c+b)%PAL.pearlFruit.length]));
     }
    }
   }

   /* Vaulted canopy boughs strictly above the 2.20 m browse-skirt (baseT >= 0.36 -> y >= 6.8 m, lowest pad tips > 4.2 m!) */
   let maxReach=2.4;
   const nTiers=4;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=0.38+0.56*tf;
    for(let b=0;b<3;b++){
     const az=(b/3)*TAU+ti*1.15+0.35*H(seed,40+ti*3+b,1,0x404);
     const reach=H0*0.24*Math.sin(tf*Math.PI*0.88+0.28);
     if(reach>maxReach)maxReach=reach;
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.08,r0*(1-0.72*baseT));
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*0.18;
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.58)+reach*0.05,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.06,pR*0.48)},
      {x:mx,y:my,z:mz,r:Math.max(0.045,pR*0.30)},
      {x:ex,y:ey,z:ez,r:0.035}
     ],{parentR:pR,k:1.6,sink:0.58,len:2.1});
     tris+=BIO.tube('mc_nacre_bark',brPts,0xc2bab0,{seg:5});

     const fCol=C(PAL.nacreLeaf[(ti*3+b)%PAL.nacreLeaf.length]);
     const padW=reach*0.92,padH=padW*0.64;
     BIO.put('mc_nacre_fol',[ex,ey,ez],qEuler(0.04*(H(seed,ti,b,0x405)-0.5),az,0),[padW,padH,padW],fCol);
     BIO.put('mc_nacre_fol',[mx,my,mz],qEuler(0,az+1.05,0),[padW*0.76,padH*0.74,padW*0.76],fCol);
     if(!opt.impostor&&ti<=1){
      lanternSpots.push([mx,my-0.14,mz,az]);
     }
    }
   }
   const topX=x+leanX*H0,topZ=z+leanZ*H0,topY=y+H0;
   const topW=H0*0.22;
   BIO.put('mc_nacre_fol',[topX,topY,topZ],qEuler(0,seed*1.1,0),[topW,topW*0.64,topW],C(PAL.nacreLeaf[0]));
   if(!opt.impostor){
    MATRON.CROWNS.push({x:x,z:z,y0:y+H0*0.36,h:H0*0.66,r:maxReach*1.22});
   }
  },{range:opt.impostor?null:440});
  return{tris:tris,H:H0,r0:r0,lanternSpots:lanternSpots};
 };

 /* 2. Glass-Collar Silica Palm (radulathorn, 8-16 m):
       Lower 2.45 m trunk bristling with 5 whorls of downward-angled biogenic opal spines; crown fronds stem-anchored at trunk apex! */
 MATRON.growRadulaThorn=function(x,y,z,seed,scale){
  const sc=scale==null?1:scale;
  const H0=lerp(8.5,15.2,H(seed,1,0,0x411))*sc;
  const r0=Math.max(0.16,H0*0.022);
  const bowX=0.05*(H(seed,2,0,0x411)-0.5),bowZ=0.05*(H(seed,3,0,0x411)-0.5);
  let tris=0;

  BIO.tree(x,z,()=>{
   const nSeg=6,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const tx=x+bowX*H0*t*t,tz=z+bowZ*H0*t*t,ty=y-0.45+(H0+0.45)*t;
    trunk.push({x:tx,y:ty,z:tz,r:r0*(1-0.36*t)*(1+0.32*Math.pow(Math.max(0,1-t/0.15),2))});
   }
   const topX=x+bowX*H0,topZ=z+bowZ*H0,topY=y+H0;
   /* Tapered apical crown-shaft bud (r=0.032 m) so stem-held fronds at [topX, topY, topZ] sit <= 0.04 m from bark! */
   trunk.push({x:topX,y:topY+0.08,z:topZ,r:0.032});
   tris+=BIO.tube('mc_palm_bark',trunk,0x7c6e5c,{seg:6});

   /* 5 rings of biogenic opaline-silica spines between y + 0.42 m and y + 2.38 m */
   for(let w=0;w<5;w++){
    const wy=y+0.42+w*0.48;
    if(wy>y+H0*0.65)break;
    const wt=clamp((wy-y)/H0,0,1);
    const wx=x+bowX*H0*wt*wt,wz=z+bowZ*H0*wt*wt;
    const ws=(r0/0.22)*(1.05-w*0.04);
    BIO.put('mc_silica_whorl',[wx,wy,wz],qEuler(0,w*0.58+seed*0.3,0),[ws,ws,ws],0xe8f6fa);
   }

   /* Crown fronds anchored directly to trunk apex [topX, topY, topZ] (<= 0.04 m stem float!) */
   const span=H0*0.34;
   for(let f=0;f<3;f++){
    const az=(f/3)*TAU+seed*0.7;
    const col=C(PAL.palmLeaf[f%PAL.palmLeaf.length]);
    BIO.put('mc_palm_frond',[topX,topY,topZ],qEuler(0.18,az,0),[span,span*0.72,span],col);
   }
   MATRON.CROWNS.push({x:topX,z:topZ,y0:topY-1.2,h:3.2,r:span*0.9});
  },{range:400});
  return{tris:tris,H:H0,r0:r0};
 };

 /* 3. Skerry Mist-Yew (cloudpodocarp, 22-38 m, Cfb cloudslope conifer draped with Lantern-Snails) */
 MATRON.growCloudPodocarp=function(x,y,z,seed,scale,opt){
  opt=opt||{};
  const sc=scale==null?1:scale;
  const H0=lerp(21.5,35.5,H(seed,1,0,0x421))*sc;
  const r0=Math.max(0.26,H0*0.028*(0.88+0.24*H(seed,2,0,0x421)));
  const leanX=0.025*(H(seed,3,0,0x421)-0.5),leanZ=0.025*(H(seed,4,0,0x421)-0.5);
  let tris=0,lanternSpots=[];

  BIO.tree(x,z,()=>{
   const nSeg=6,trunk=[];
   for(let i=0;i<=nSeg;i++){
    const t=i/nSeg;
    const tx=x+leanX*H0*t*t,tz=z+leanZ*H0*t*t,ty=y-0.80+(H0+0.80)*t;
    const flare=1+0.55*Math.pow(Math.max(0,1-t/0.18),2);
    trunk.push({x:tx,y:ty,z:tz,r:i===nSeg?0.036:Math.max(0.06,r0*(1-0.82*Math.pow(t,0.88))*flare)});
   }
   const topX=x+leanX*H0,topZ=z+leanZ*H0,topY=y+H0;
   trunk.push({x:topX,y:topY+0.08,z:topZ,r:0.028});
   tris+=BIO.tube('mc_yew_bark',trunk,0x6e5446,{seg:r0>0.38?7:5});

   let maxReach=2.0;
   const nTiers=5;
   for(let ti=0;ti<nTiers;ti++){
    const tf=(ti+0.5)/nTiers;
    const baseT=0.26+0.68*tf;
    for(let b=0;b<4;b++){
     const az=(b/4)*TAU+ti*0.95+0.30*H(seed,30+ti*4+b,1,0x422);
     const reach=H0*0.21*(1-0.58*tf);
     if(reach>maxReach)maxReach=reach;
     const bx0=x+leanX*H0*baseT*baseT,bz0=z+leanZ*H0*baseT*baseT,by0=y+H0*baseT;
     const pR=Math.max(0.06,r0*(1-0.76*baseT));
     const ex=bx0+Math.cos(az)*reach,ez=bz0+Math.sin(az)*reach,ey=by0+reach*0.06;
     const mx=lerp(bx0,ex,0.52),my=lerp(by0,ey,0.55)+reach*0.04,mz=lerp(bz0,ez,0.52);
     const brPts=BIO.flareJoin([
      {x:bx0,y:by0,z:bz0,r:Math.max(0.05,pR*0.44)},
      {x:mx,y:my,z:mz,r:Math.min(0.08,Math.max(0.038,pR*0.26))},
      {x:ex,y:ey,z:ez,r:0.032}
     ],{parentR:pR,k:1.55,sink:0.55,len:1.9});
     tris+=BIO.tube('mc_yew_bark',brPts,0x684e40,{seg:4});

     const fCol=C(PAL.yewLeaf[(ti*4+b)%PAL.yewLeaf.length]);
     const padW=reach*1.04,padH=padW*0.48;
     BIO.put('mc_yew_fol',[ex,ey,ez],qEuler(0,az,0),[padW,padH,padW],fCol);
     if(reach>1.8){
      BIO.put('mc_yew_fol',[mx,my,mz],qEuler(0,az+0.9,0),[padW*0.76,padH*0.76,padW*0.76],fCol);
      if(!opt.impostor&&ti<=2&&b%2===0)lanternSpots.push([mx,my-0.12,mz,az]);
     }
    }
   }
   const topW=H0*0.15;
   BIO.put('mc_yew_fol',[topX,topY,topZ],qEuler(0,seed,0),[topW,topW*0.88,topW],C(PAL.yewLeaf[0]));
   if(!opt.impostor){
    MATRON.CROWNS.push({x:x,z:z,y0:y+H0*0.24,h:H0*0.76,r:maxReach*1.2});
   }
  },{range:opt.impostor?null:440});
  return{tris:tris,H:H0,r0:r0,lanternSpots:lanternSpots};
 };

 /* 4. Rasped Landkelp Holdfast (velvetkelp_stub, 0.3-1.1 m): gnawed Farside stipe stumps & haptera on Station 3 */
 MATRON.growKelpStub=function(x,y,z,seed,stipeH){
  const h=clamp(stipeH==null?0.65:stipeH,0.32,1.25);
  let tris=0;
  BIO.tree(x,z,()=>{
   /* Splaying calcified haptera holdfast claws gripping spray rock */
   for(let k=0;k<4;k++){
    const az=(k/4)*TAU+0.4*H(seed,k,1,0x431);
    const L=0.55+0.45*H(seed,k,2,0x431);
    tris+=BIO.tube('mc_kelp_stipe',[
     {x:x,y:y+0.12,z:z,r:0.09},
     {x:x+Math.cos(az)*L*0.55,y:y+0.04,z:z+Math.sin(az)*L*0.55,r:0.055},
     {x:x+Math.cos(az)*L,y:y-0.12,z:z+Math.sin(az)*L,r:0.025}
    ],0xb6ae90,{seg:4});
   }
   /* Gnawed olive-buff lime-stipe stump + bruised blade shred anchored directly to stump top */
   const topX=x+0.10*(H(seed,9,1,0x432)-0.5),topZ=z+0.10*(H(seed,9,2,0x432)-0.5),topY=y+h;
   tris+=BIO.tube('mc_kelp_stipe',[
    {x:x,y:y-0.14,z:z,r:0.11},
    {x:topX,y:topY,z:topZ,r:0.075}
   ],0x928442,{seg:5});
   BIO.put('mc_kelp_shred',[topX,topY,topZ],qEuler(0.35,H(seed,11,1,0x433)*TAU,0),[0.65,0.52,0.65],0x9c8e48);
  },{range:360});
  return{tris:tris,H:h};
 };

 /* BIO.kin source contract (make + grow) so neighbour kits & openworld/ can borrow nacretree & cloudpodocarp */
 MATRON.make=function(sp,x,y,z){
  const S=SPECIES[sp]||SPECIES[0];
  const sd=KRAND.hash(9290,Math.round(x*10),Math.round(z*10),sp);
  return{sp:sp,key:S.key,x:x,y0:y,z:z,seed:sd,H:S.key==='cloudpodocarp'?28:24,crownR:5.5};
 };
 MATRON.grow=function(T){
  if(T.key==='cloudpodocarp')return MATRON.growCloudPodocarp(T.x,T.y0,T.z,T.seed,1.0);
  if(T.key==='radulathorn')return MATRON.growRadulaThorn(T.x,T.y0,T.z,T.seed,1.0);
  return MATRON.growNacreTree(T.x,T.y0,T.z,T.seed,1.0);
 };

 // ---------------------------------------------------------------- octahedral impostors (34-core-impostor.js)
 if(typeof BIO.impostorSet==='function'&&typeof BIO.impostor==='function'){
  const impSet=BIO.impostorSet('mc_trees',{grid:4,cell:32,slots:1});
  MATRON.IMP=SKEY==='cloudslope'
   ?{set:impSet,cloudpodocarp:BIO.impostor('mc_imp_yew',()=>MATRON.growCloudPodocarp(0,0,0,9252,1.0,{impostor:true}),{set:impSet,label:'Skerry Mist-Yew (impostor)'})}
   :{set:impSet,nacretree:BIO.impostor('mc_imp_nacre',()=>MATRON.growNacreTree(0,0,0,9251,1.0,{impostor:true}),{set:impSet,label:'Pearl-Plum Nacre-Fig (impostor)'})};
  BIO.impostorItem('mc_imp_trees',impSet,{minRange:220,label:'Matrons Coast rainforest canopy impostor'});
 }else{
  MATRON.IMP=null;
 }
})();
