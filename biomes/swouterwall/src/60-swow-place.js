// ================================================================= SW OUTER WALL — deterministic cell-seeded placement & BIO.kin ([G data])
// Pure deterministic placement across all 4 stations (boreallakes, morainetarn, trigemini, breathvale):
//   - Places all 8 native SWOW species (paternoster_spruce, quaking_sphagnum, moraine_birch, lungcushion, glassbell,
//     ice_waterweed, sunblood_crust, bog_rosemary_sw) + BIO.kin cousins from nwouterwall (fur larch, creeping stone pine
//     krummholz, cottongrass, woolly willow, crowberry) and copperglacier (alpine cushion, rock lichen).
//   - Enforces the < 0.60 atm hypoxia ceiling on Station 4 (breathvale): zero vascular flora above HYPOXIA_CEILING_M,
//     endolithic sunblood_crust surviving down to 0.58 atm on the megabreccia headwall, and 100% airless barren above 0.58 atm!
//   - Places KFROST sorted stone ring boulders along polygon troughs and buoyant quaking_sphagnum rafts over boreal fen bays.
//   - Zero THREE, zero DOM, zero Math.random, zero || numeric fallbacks; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=SWOW.C,PAL=SWOW.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.20,rr(-j,j)*0.55,rr(-j,j)*0.55);
  return c;
 };

 const CAM_CLEAR={
  boreallakes:[[-148,-96],[-36,-54],[38,-44],[-104,54],[94,-64],[-112,-64]],
  morainetarn:[[124,-84],[82,-18],[-118,-48],[-52,66],[22,-96],[108,-58]],
  trigemini:[[132,-98],[76,-32],[-88,-52],[-44,82],[18,-86],[94,-72]],
  breathvale:[[14,132],[-42,68],[58,42],[-64,-18],[46,-28],[68,58]]
 };

 SWOW.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'boreallakes';
  const site=SWOW_SITES[skey]||SWOW_SITES.boreallakes;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?630:opt.R;
  const seedBase=opt.seed==null?9300:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;
  const useKin=opt.kin!==false&&typeof BIO.kin==='function';

  SWOW.PLACED.length=0;
  SWOW.CROWNS.length=0;
  for(const k in SWOW.KIN_COUNTS)SWOW.KIN_COUNTS[k]=0;

  const st={
   paternoster_spruce:0,
   quaking_sphagnum:0,
   moraine_birch:0,
   lungcushion:0,
   glassbell:0,
   ice_waterweed:0,
   sunblood_crust:0,
   bog_rosemary_sw:0,
   kinTotal:0,
   stoneRingBoulders:0,
   erratics:0
  };

  // Instantiate BIO.kin cousins read in place (nwouterwall & copperglacier)
  const KIN=useKin?{
   furlarch:BIO.kin('nwouterwall.furlarch',{key:'swow_furlarch',name:'Veil-Spill Fur Larch (nwouterwall kin)',scale:skey==='morainetarn'?0.62:0.92}),
   pinemat:BIO.kin('nwouterwall.pinemat',{key:'swow_pinemat',name:'Moraine Krummholz Stone-Pine (nwouterwall kin)',scale:0.95}),
   cottongrass:BIO.kin('nwouterwall.cottongrass',{key:'swow_cottongrass',name:'Quaking-Fen Cottongrass (nwouterwall kin)'}),
   woolwillow:BIO.kin('nwouterwall.woolwillow',{key:'swow_woolwillow',name:'Tarn-Margin Woolly Willow (nwouterwall kin)',scale:0.90}),
   crowberry:BIO.kin('nwouterwall.crowberry',{key:'swow_crowberry',name:'Subalpine Moraine Crowberry (nwouterwall kin)'}),
   cushion:BIO.kin('copperglacier.cushion',{key:'swow_alpine_cushion',name:'High-Wall Sage Cushion (copperglacier kin)'}),
   lichen:BIO.kin('copperglacier.lichen',{key:'swow_rock_lichen',name:'Cirque Boulder Lichen (copperglacier kin)'})
  }:null;

  const cams=CAM_CLEAR[skey]||[];
  const nearCam=(x,z,rad)=>{
   for(let i=0;i<cams.length;i++){
    if(Math.hypot(x-cams[i][0],z-cams[i][1])<rad)return true;
   }
   return false;
  };
  const free=(x,z,r)=>!sp||!sp.some(x,z,r,it=>Math.hypot(x-it.x,z-it.z)<it.r+r);
  const claim=(kind,x,z,r)=>{if(sp)sp.insert({kind:kind,x:x,z:z,r:r},x,z,r);};

  const inReserveCore=(x,z)=>{
   if(!site.reserves||!site.reserves.length)return false;
   for(let i=0;i<site.reserves.length;i++){
    const rv=site.reserves[i];
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.82)return true;
   }
   return false;
  };

  const seed=KRAND.child(seedBase,'swouterwall/'+skey);
  const IMP=SWOW.IMP;
  const NEAR_TREE_R=195.0;

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   const pAtm=SWOW_PHYS.pressureAt(asl);
   SWOW.PLACED.push([speciesKey,x,y,z,asl,zone,Object.assign({pAtm:pAtm},meta||{})]);
  }

  // ---------------------------------------------------------------- 1. FLOATING QUAKING SPHAGNUM FEN-MATS & SUB-ICE TARN WATERWEED
  if(skey==='boreallakes'){
   const fenBays=[
    {x:-104,z:30,rx:30,rz:13,lvl:12.40,id:'upper-fen'},
    {x:94,z:-40,rx:34,rz:15,lvl:0.40,id:'lower-fen'}
   ];
   for(let b=0;b<fenBays.length;b++){
    const fb=fenBays[b];
    for(let i=0;i<56;i++){
     reseed(KRAND.hash(seed+110+b*31,i,1));
     const a=rr(0,TAU),rad=Math.sqrt(rng());
     const fx=fb.x+Math.cos(a)*fb.rx*rad,fz=fb.z+Math.sin(a)*fb.rz*rad;
     if(nearCam(fx,fz,4.5))continue;
     const wy=W(fx,fz),gy=Y(fx,fz);
     if(wy>-1e5&&gy<wy-0.18)continue;
     const surfY=gy+0.02;
     const mSc=rr(0.95,1.85);
     BIO.put('sw_sphagnum_mat',[fx,surfY-0.02,fz],qEuler(0,rr(0,TAU),0),[mSc,1,mSc],pickC(PAL.sphagnum,0.04));
     if(rng()<0.48){
      const sSc=rr(0.18,0.34);
      BIO.put('sw_sundew_gem',[fx+rr(-0.3,0.3),surfY+0.01,fz+rr(-0.3,0.3)],qEuler(0,rr(0,TAU),0),[sSc,1,sSc],pickC(PAL.sundew,0.03));
     }
     if(KIN&&KIN.cottongrass&&rng()<0.55){
      const ct=KIN.cottongrass.make(fx+rr(-0.4,0.4),gy,fz+rr(-0.4,0.4),KRAND.hash(seed+120+b,i,2));
      KIN.cottongrass.grow(ct,2);
      SWOW.KIN_COUNTS.cottongrass++;
      st.kinTotal++;
     }
     recordPlaced('quaking_sphagnum',fx,surfY,fz,'sphagnum_fen',{floating:wy>-1e5});
     st.quaking_sphagnum++;
    }
    if(reg){
     reg({
      tagId:'swow:quaking-fen-'+b,
      name:'Buoyant Quaking Sphagnum & Sundew Peat-Raft ('+fb.id+')',
      tagClass:'flora',
      x:fb.x,y:fb.lvl-1.0,z:fb.z,r:Math.max(fb.rx,fb.rz),h:5,
      tags:{biome:'swouterwall',zone:'sphagnum_fen'}
     });
    }
   }
  }

  // Sub-ice tarn quillwort (ice_waterweed) in shallow lake margins across Stations 1-3 (and seep rim on Station 4)
  {
   const tarnRings=skey==='boreallakes'
    ?[{x:-106,z:-14,rx:68,rz:46,lvl:12.40},{x:102,z:12,rx:78,rz:54,lvl:0.40}]
    :skey==='morainetarn'
    ?[{x:-16,z:-6,rx:86,rz:58,lvl:4.60}]
    :skey==='trigemini'
    ?[{x:0,z:4,rx:96,rz:66,lvl:2.20}]
    :[{x:-8,z:18,rx:23,rz:18,lvl:1.40}];

   for(let t=0;t<tarnRings.length;t++){
    const tr=tarnRings[t],nW=skey==='breathvale'?24:32;
    for(let i=0;i<nW;i++){
     reseed(KRAND.hash(seed+180+t*29,i,1));
     const a=(i/nW)*TAU+rr(-0.06,0.06),jit=rr(0.0,0.04);
     let wx=0,wz=0,gy=0,found=false;
     for(let s=0;s<=12;s++){
      const fr=lerp(0.55,1.18,s/12)+jit;
      const tx=tr.x+Math.cos(a)*tr.rx*fr,tz=tr.z+Math.sin(a)*tr.rz*fr;
      const ty=Y(tx,tz);
      if(ty<=tr.lvl+0.12&&ty>=tr.lvl-2.20){
       wx=tx;wz=tz;gy=ty;found=true;break;
      }
     }
     if(!found||nearCam(wx,wz,4.0))continue;
     const wSc=rr(0.26,0.48);
     BIO.put('sw_waterweed',[wx,gy-0.03,wz],qEuler(0,rr(0,TAU),0),[wSc*1.15,wSc,wSc*1.15],pickC(PAL.waterweed,0.03));
     recordPlaced('ice_waterweed',wx,gy,wz,'glacial_tarn',{submerged:gy<tr.lvl});
     st.ice_waterweed++;
    }
   }
  }

  // ---------------------------------------------------------------- 2. BOREAL CONIFER CANOPY, FUR LARCH, KRUMMHOLZ & MORAINE BIRCH
  if(skey==='boreallakes'||skey==='morainetarn'){
   const cell=skey==='boreallakes'?15.5:18.5,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.95)continue;
    reseed(KRAND.cell(seed+310,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,8.5))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.48)continue;
    const rk=BIO.field('rock',px,pz);
    if(rk>0.74)continue;
    const asl=site.baseElevM+py;
    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+310,ix,iz);

    if(skey==='boreallakes'){
     // Dense Veil-spill boreal taiga: Tarn Spire-Spruce + NWOW Fur Larch + Silver-Peel Moraine Birch & Woolly Willow along shore
     const wetV=BIO.field('wet',px,pz);
     if(wetV>0.14&&rng()<0.58*q&&free(px,pz,2.6)){
      claim('shrub',px,pz,2.6);
      if(KIN&&KIN.woolwillow&&rng()<0.48){
       const ww=KIN.woolwillow.make(px,py,pz,tSeed);
       KIN.woolwillow.grow(ww,2);
       SWOW.KIN_COUNTS.woolwillow++;
       st.kinTotal++;
      }else{
       SWOW.growMoraineBirch(px,py,pz,tSeed,rr(0.85,1.18));
       recordPlaced('moraine_birch',px,py,pz,'boreal_lake',{});
       st.moraine_birch++;
      }
      continue;
     }
     if(rng()>0.68*q||!free(px,pz,4.4))continue;
     claim('tree',px,pz,4.4);
     const sc=rr(0.84,1.16);
     if(KIN&&KIN.furlarch&&rng()<0.42&&dCam<NEAR_TREE_R){
      const fl=KIN.furlarch.make(px,py,pz,tSeed);
      KIN.furlarch.grow(fl,2);
      SWOW.KIN_COUNTS.furlarch++;
      st.kinTotal++;
     }else{
      if(dCam<NEAR_TREE_R||!IMP){
       SWOW.growSpruce(px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('sw_imp_trees',IMP.spruce,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('paternoster_spruce',px,py,pz,'boreal_lake',{});
      st.paternoster_spruce++;
     }
    }else{
     // Station 2 (morainetarn, +4,360 m treeline ecotone): sheltered stunted spruce/larch pockets below +4,378 m giving way upward
     // to wind-sheared Creeping Stone-Pine krummholz (nwouterwall.pinemat) and flame-gold Silver-Peel Moraine Birch!
     const auf=BIO.field('aufeis',px,pz);
     if(auf>0.25)continue;
     if(py<16.0&&asl<4376&&rng()<0.22*q&&free(px,pz,4.0)){
      claim('subalpine_tree',px,pz,4.0);
      if(KIN&&KIN.furlarch&&rng()<0.50&&dCam<NEAR_TREE_R){
       const fl=KIN.furlarch.make(px,py,pz,tSeed);
       KIN.furlarch.grow(fl,2);
       SWOW.KIN_COUNTS.furlarch++;
       st.kinTotal++;
      }else{
       SWOW.growSpruce(px,py,pz,tSeed,rr(0.55,0.78),{});
       recordPlaced('paternoster_spruce',px,py,pz,'moraine_bench',{krummholzEdge:true});
       st.paternoster_spruce++;
      }
     }else if(py<42.0&&rng()<0.52*q&&free(px,pz,3.0)){
      claim('krummholz',px,pz,3.0);
      if(KIN&&KIN.pinemat&&rng()<0.58){
       const pm=KIN.pinemat.make(px,py,pz,tSeed);
       KIN.pinemat.grow(pm,2);
       SWOW.KIN_COUNTS.pinemat++;
       st.kinTotal++;
      }else{
       SWOW.growMoraineBirch(px,py,pz,tSeed,rr(0.68,0.98));
       recordPlaced('moraine_birch',px,py,pz,'moraine_bench',{});
       st.moraine_birch++;
      }
     }
    }
   }
  }

  // ---------------------------------------------------------------- 3. KFROST SORTED STONE RINGS, LUNGCUSHION DOMES, GLASSBELL, HEATH & SUNBLOOD CRUSTS
  {
   const cell=11.0,N=Math.ceil((R*1.75)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.87+(ix+0.5)*cell,cz=-R*0.87+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.88)continue;
    reseed(KRAND.cell(seed+510,ix,iz));
    const px=cx+rr(-0.44,0.44)*cell,pz=cz+rr(-0.44,0.44)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,4.2))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.20)continue;

    const asl=site.baseElevM+py;
    const pAtm=SWOW_PHYS.pressureAt(asl);
    const polyW=BIO.field('poly',px,pz);
    const rk=BIO.field('rock',px,pz);
    const wetV=BIO.field('wet',px,pz);
    const auf=BIO.field('aufeis',px,pz);
    const cSeed=KRAND.hash(seed+510,ix,iz);

    // Above < 0.60 atm lethal hypoxia ceiling (upper Breath-Vale headwall!): ZERO vascular plants!
    // Endolithic sunblood_crust survives down to 0.58 atm (~6,550 m ASL); above 0.58 atm is 100% airless barren megabreccia!
    if(pAtm<SWOW_PHYS.HYPOXIA_LETHAL_ATM){
     const sb=SWOW_PHYS.sunbloodViableAt(asl,Math.max(0.5,rk));
     if(sb.viable&&rng()<0.64*q){
      const crSc=rr(0.45,1.05);
      BIO.put('sw_sunblood_crust',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[crSc,1,crSc],pickC(PAL.sunblood,0.03));
      recordPlaced('sunblood_crust',px,py,pz,'megabreccia_crag',{hypoxicHeadwall:true});
      st.sunblood_crust++;
     }
     if(rng()<0.18*q){
      const bSc=rr(0.9,2.2);
      BIO.put('sw_rock_megabreccia',[px,py-bSc*0.30,pz],qEuler(rr(-0.15,0.15),rr(0,TAU),0),[bSc*1.2,bSc*0.72,bSc],pickC(PAL.megabreccia,0.02));
      st.erratics++;
     }
     continue;
    }

    if(auf>0.35)continue;

    // KFROST sorted-stone circle boulders concentrated right along polygon frost-wedge troughs (polyW > 0.36)!
    if(polyW>0.36&&skey!=='boreallakes'){
     if(rng()<0.78*q){
      const gSc=rr(0.32,0.74);
      BIO.put('sw_rock_granite',[px,py-gSc*0.26,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[gSc*1.22,gSc*0.64,gSc],pickC(PAL.granite,0.02));
      st.stoneRingBoulders++;
     }
    }

    // Steep megabreccia crags & erratics: sunblood_crust (Belt C & high Belt B) + copperglacier rock lichen
    if(rk>0.46){
     if((skey==='trigemini'||skey==='breathvale'||(skey==='morainetarn'&&asl>4372))&&rng()<0.56*q){
      const crSc=rr(0.42,0.96);
      BIO.put('sw_sunblood_crust',[px,py+0.02,pz],qEuler(0,rr(0,TAU),0),[crSc,1,crSc],pickC(PAL.sunblood,0.03));
      recordPlaced('sunblood_crust',px,py,pz,'megabreccia_crag',{});
      st.sunblood_crust++;
     }else if(KIN&&KIN.lichen&&rng()<0.55*q){
      const lc=KIN.lichen.make(px,py,pz,cSeed);
      KIN.lichen.grow(lc,2);
      SWOW.KIN_COUNTS.lichen++;
      st.kinTotal++;
     }
     if(rng()<0.20*q){
      const bSc=rr(0.85,2.15);
      BIO.put('sw_rock_megabreccia',[px,py-bSc*0.30,pz],qEuler(rr(-0.14,0.14),rr(0,TAU),0),[bSc*1.2,bSc*0.72,bSc],pickC(PAL.megabreccia,0.02));
      st.erratics++;
     }
     continue;
    }

    // Belt B & Belt C floor (+4,200..+6,460 m, P >= 0.60 atm): lungcushion O2 bellows domes, glassbell ice-gentians & alpine cushions
    if(skey!=='boreallakes'){
     const lcPhys=SWOW_PHYS.lungcushionAt(asl,0.88,0.30);
     if(lcPhys.viable&&rng()<(skey==='trigemini'?0.48:skey==='breathvale'?0.42:0.32)*q){
      SWOW.putLungcushion(px,py,pz,cSeed,rr(0.80,1.35));
      recordPlaced('lungcushion',px,py,pz,'hypoxic_pass',{deltaTC:lcPhys.deltaTC,o2Pct:lcPhys.internalO2Pct});
      st.lungcushion++;
     }
     if((wetV>0.16||polyW>0.20)&&rng()<0.38*q){
      SWOW.putGlassbell(px+rr(-0.4,0.4),py,pz+rr(-0.4,0.4),KRAND.hash(cSeed,2,1),rr(0.85,1.28));
      recordPlaced('glassbell',px,py,pz,'frost_polygons',{});
      st.glassbell++;
     }
     if(KIN&&KIN.cushion&&rng()<0.30*q){
      const cu=KIN.cushion.make(px+rr(-0.5,0.5),py,pz+rr(-0.5,0.5),KRAND.hash(cSeed,3,1));
      KIN.cushion.grow(cu,2);
      SWOW.KIN_COUNTS.cushion++;
      st.kinTotal++;
     }
     if(skey==='morainetarn'&&KIN&&KIN.crowberry&&rng()<0.34*q){
      const cb=KIN.crowberry.make(px,py,pz,KRAND.hash(cSeed,4,1));
      KIN.crowberry.grow(cb,2);
      SWOW.KIN_COUNTS.crowberry++;
      st.kinTotal++;
     }
     if(skey==='morainetarn'&&wetV>0.10&&KIN&&KIN.cottongrass&&rng()<0.44*q){
      const cg=KIN.cottongrass.make(px,py,pz,KRAND.hash(cSeed,5,1));
      KIN.cottongrass.grow(cg,2);
      SWOW.KIN_COUNTS.cottongrass++;
      st.kinTotal++;
     }
     if(skey==='morainetarn'&&(wetV>0.06||polyW>0.14)&&rng()<0.42*q){
      const hSc=rr(0.32,0.58);
      BIO.put('sw_heath',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[hSc*1.4,hSc,hSc*1.4],pickC(PAL.rosemary,0.03));
      BIO.put('sw_rosemary_bell',[px,py+hSc*0.52,pz],qEuler(0,rr(0,TAU),0),[0.10,0.14,0.10],pickC(PAL.rosemaryBell,0.02));
      recordPlaced('bog_rosemary_sw',px,py,pz,'moraine_bench',{});
      st.bog_rosemary_sw++;
     }
     continue;
    }

    // Station 1 (boreallakes) ground layer: Veil-drift bog rosemary heath, moss hummocks, glassbell on cold north scree & erratics
    if(wetV>0.20&&rng()<0.52*q){
     const hSc=rr(0.36,0.68);
     BIO.put('sw_heath',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[hSc*1.45,hSc,hSc*1.45],pickC(PAL.rosemary,0.04));
     if(rng()<0.58){
      BIO.put('sw_rosemary_bell',[px+rr(-0.15,0.15),py+hSc*0.55,pz+rr(-0.15,0.15)],qEuler(0,rr(0,TAU),0),[0.11,0.15,0.11],pickC(PAL.rosemaryBell,0.02));
     }
     recordPlaced('bog_rosemary_sw',px,py,pz,'sphagnum_fen',{});
     st.bog_rosemary_sw++;
    }else if(py>42.0&&rng()<0.34*q){
     SWOW.putGlassbell(px,py,pz,cSeed,rr(0.80,1.15));
     recordPlaced('glassbell',px,py,pz,'boreal_lake',{highScree:true});
     st.glassbell++;
    }else if(rng()<0.18*q){
     const bSc=rr(0.75,1.85);
     BIO.put('sw_rock_megabreccia',[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bSc*1.18,bSc*0.74,bSc],pickC(PAL.megabreccia,0.02));
     st.erratics++;
    }
   }
  }

  // Register KFROST landform records (aufeis sheets & rock glaciers) into KTAGS / REG
  if(typeof FROST!=='undefined'&&FROST&&reg){
   const recs=FROST.records();
   for(let i=0;i<recs.length;i++){
    const rc=recs[i];
    const rVal=rc.r==null?24:rc.r;
    const hVal=rc.h!=null?rc.h:(rc.thick==null?4:rc.thick);
    reg({
     tagId:'swow:frost-'+skey+'-'+rc.id,
     name:'Periglacial '+rc.kind+' ('+rc.id+')',
     tagClass:'feature',
     x:rc.x,y:Y(rc.x,rc.z)-1.0,z:rc.z,r:Math.min(180,Math.max(18,rVal)),h:hVal+6,
     tags:{biome:'swouterwall',periglacial:rc.kind}
    });
   }
  }

  return st;
 };
})();
