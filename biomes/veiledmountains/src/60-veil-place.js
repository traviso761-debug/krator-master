// ================================================================= VEILED MOUNTAINS — deterministic cell-seeded placement ([G data])
// Pure deterministic placement across all 5 stations (hall, gorge, kanopi, veilpass, southvale):
//   - Registers every placed hero tree, nurse-log colonnade, giant tree-fern grove, mire spore-spike patch, epiphyte host,
//     pillow-moss moraine field, and perched crag spruce in core/tags BEFORE drawing!
//   - Straight nurse-log colonnades (image_2, image_3) where veilcedar & sitkaspruce stand on arched stilt-roots
//   - 8-14 m giant veilfern groves & 3-5 m mire sporespike colonies along stream bars & tarn coves (image_6, image_10)
//   - Z3 cloud-belt writhing cloudoak vaults, pillowmoss boulder domes, crimsonchalice & tankstrap epiphytes (image_9, 12, 13, 14)
//   - Z4-Z5 Veilpass slidealder avalanche chutes, furlarch, perched KSTACKS crag spruces, and krummholz (image_5, image_7)
//   - Camera exclusion circles keep every preset view eye >= 6.0 m clear of foliage crowns!
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=VEIL.C,PAL=VEIL.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.18,rr(-j,j)*0.5,rr(-j,j)*0.5);
  return c;
 };

 const CAM_CLEAR={
  hall:[[-108,-28],[-56,-14],[-8,-36],[18,12],[-32,42],[82,-48]],
  gorge:[[58,-20],[42,-16],[14,16],[-6,38],[54,48],[68,-64]],
  kanopi:[[78,-32],[48,-22],[22,26],[-4,38],[66,34],[74,-44]],
  veilpass:[[-104,-36],[-58,-28],[12,-34],[64,28],[145,-32],[-88,-40]],
  southvale:[[68,-36],[-42,-10],[14,-6],[-8,-28],[48,32],[-78,46]]
 };

 VEIL.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'hall';
  const site=VEIL_SITES[skey]||VEIL_SITES.hall;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?610:opt.R;
  const seedBase=opt.seed==null?9217:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;

  VEIL.PLACED.length=0;
  VEIL.CROWNS.length=0;

  const st={
   veilcedar:0,
   sitkaspruce:0,
   clubmaple:0,
   cloudoak:0,
   umbrellaelm:0,
   veilfern:0,
   sporespike:0,
   crimsonchalice:0,
   tankstrap:0,
   veilcomb:0,
   clubdrape:0,
   pillowmoss:0,
   swordfern:0,
   devilsclub:0,
   slidealder:0,
   furlarch:0,
   krumm:0,
   nurseLogs:0,
   boulders:0
  };

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
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.84)return true;
   }
   return false;
  };

  // Keep Kanopi's 95 m oculus face & waterfall plunge sightline clear of tall trees!
  const inOculusClear=(x,z)=>{
   if(skey!=='kanopi'||!site.oculus)return false;
   const oc=site.oculus;
   if(Math.hypot(x-oc.cx,z-oc.cz)<54.0)return true;
   if(x>-38&&x<32&&Math.abs(z)<24.0)return true;
   return false;
  };

  // Pre-draw registration in core/tags & VEIL.PLACED
  let tagSeq=0;
  function preRegisterPlant(speciesKey,x,y,z,r,h,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   VEIL.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
   if(typeof KTAGS!=='undefined'&&KTAGS.page&&tagSeq<480){
    tagSeq++;
    try{
     KTAGS.page.add({
      id:'veil:plant-'+skey+'-'+speciesKey+'-'+tagSeq,
      name:(VEIL.byKey[speciesKey]?VEIL.byKey[speciesKey].name:speciesKey),
      class:'flora',
      at:[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2)],
      r:r,
      h:h,
      tags:{biome:'veiledmountains',species:speciesKey,zone:zone}
     });
    }catch(e){}
   }
  }

  function tallyEpi(epi,px,py,pz,zone){
   if(!epi)return;
   if(epi.crimsonchalice>0){st.crimsonchalice+=epi.crimsonchalice;preRegisterPlant('crimsonchalice',px,py+8,pz,1.8,2.4,zone,{host:true});}
   if(epi.tankstrap>0){st.tankstrap+=epi.tankstrap;preRegisterPlant('tankstrap',px,py+6,pz,1.2,1.0,zone,{host:true});}
   if(epi.clubdrape>0){st.clubdrape+=epi.clubdrape;preRegisterPlant('clubdrape',px,py+7,pz,1.5,3.8,zone,{host:true});}
   if(epi.veilcomb>0){st.veilcomb+=epi.veilcomb;preRegisterPlant('veilcomb',px,py+2,pz,1.1,0.9,zone,{host:true});}
  }

  const seed=KRAND.child(seedBase,'veil/'+skey);
  const IMP=VEIL.IMP;
  const NEAR_TREE_R=195.0;

  // ---------------------------------------------------------------- 1. FALLEN GIANT NURSE-LOG COLONNADES (image_2, image_3)
  if(site.nurseLogs&&site.nurseLogs.length){
   for(let l=0;l<site.nurseLogs.length;l++){
    const L=site.nurseLogs[l];
    const len=Math.hypot(L.x1-L.x0,L.z1-L.z0),yaw=Math.atan2(L.z1-L.z0,L.x1-L.x0);
    const mx=(L.x0+L.x1)*0.5,mz=(L.z0+L.z1)*0.5,my=Y(mx,mz);
    if(reg){
     reg({
      tagId:'veil:nurselog-colonnade-'+skey+'-'+l,
      name:'Fallen Hoh-Scale Nurse-Log Stilt-Root Colonnade',
      tagClass:'flora',
      x:mx,y:my-1.0,z:mz,r:len*0.52,h:58,
      tags:{biome:'veiledmountains',feature:'nurse-log-colonnade'}
     });
    }
    // Draw the mossy fallen giant trunk along (x0,z0)->(x1,z1)
    const nLogPts=7,logPts=[];
    const ownPrev=BIO.owner;BIO.owner=[mx,mz];
    try{
     for(let k=0;k<=nLogPts;k++){
      const t=k/nLogPts,lx=lerp(L.x0,L.x1,t),lz=lerp(L.z0,L.z1,t),ly=Y(lx,lz)+L.r*0.58;
      logPts.push({x:lx,y:ly,z:lz,r:L.r*lerp(1.08,0.76,t)});
     }
     BIO.tube('vm_log',logPts,0x485638,{seg:7});
     st.nurseLogs++;
     // Dress the nurse log with sword-ferns, tankstrap rosettes & veilcomb shelves right on its upper/side bark!
     for(let d=0;d<8;d++){
      reseed(KRAND.hash(seed+50+l*13,d,1));
      const ut=(d+0.5)/8,lx=lerp(L.x0,L.x1,ut),lz=lerp(L.z0,L.z1,ut),lr=L.r*lerp(1.08,0.76,ut);
      const topY=Y(lx,lz)+L.r*0.58+lr*0.92;
      if(nearCam(lx,lz,5.5))continue;
      if(d%2===0){
       const fs=rr(0.65,1.15);
       preRegisterPlant('swordfern',lx,topY,lz,1.0,1.2,'mistfloor',{onNurseLog:true});
       BIO.put('vm_swordfern',[lx,topY-0.04,lz],qEuler(0,rr(0,TAU),0),[fs,fs*0.92,fs],pickC(PAL.swordfern,0.03));
       st.swordfern++;
      }else{
       const ts=rr(0.55,0.95);
       preRegisterPlant('tankstrap',lx,topY,lz,0.8,0.8,'mistfloor',{onNurseLog:true});
       BIO.put('vm_tankstrap_fol',[lx,topY-0.03,lz],qEuler(0,rr(0,TAU),0),[ts,ts*0.85,ts],pickC(PAL.tankstrap,0.03));
       st.tankstrap++;
      }
     }
    }finally{BIO.owner=ownPrev;}

    // Place 3-4 colossal stilt-rooted veilcedar & sitkaspruce directly along the nurse-log line!
    const nCol=Math.max(2,Math.floor(len/14));
    for(let c=0;c<nCol;c++){
     reseed(KRAND.hash(seed+90+l*17,c,2));
     const t=(c+0.5)/nCol+rr(-0.06,0.06);
     const tx=lerp(L.x0,L.x1,t),tz=lerp(L.z0,L.z1,t);
     if(nearCam(tx,tz,9.0)||inReserveCore(tx,tz)||!free(tx,tz,5.2))continue;
     const ty=Y(tx,tz);
     const kind=c%2===0?'veilcedar':'sitkaspruce';
     claim(kind,tx,tz,5.2);
     preRegisterPlant(kind,tx,ty,tz,4.5,52,'mistfloor',{nurseColonnade:true});
     const info=VEIL.growTree(kind,tx,ty,tz,KRAND.hash(seed+95+l*17,c,3),rr(0.92,1.12),{
      stiltLift:L.r*1.22,
      elevAsl:site.baseElevM+ty,
      mist01:FIELD.mist(tx,tz)
     });
     tallyEpi(info.epi,tx,ty,tz,'mistfloor');
     st[kind]++;
    }
   }
  }

  // ---------------------------------------------------------------- 2. HERO GIANT TREE-FERN GROVES & MIRE SPORE-SPIKE BACKWATERS (image_6, image_10)
  if(skey==='hall'||skey==='kanopi'||skey==='gorge'){
   const nHeroFern=skey==='hall'?28:(skey==='kanopi'?18:14);
   for(let i=0;i<nHeroFern;i++){
    reseed(KRAND.hash(seed+160,i,1));
    const rad=skey==='kanopi'?rr(56,125):rr(16,125);
    const a=rr(0,TAU);
    const fx=Math.cos(a)*rad,fz=Math.sin(a)*rad;
    if(nearCam(fx,fz,8.0)||inReserveCore(fx,fz)||inOculusClear(fx,fz)||!free(fx,fz,3.8))continue;
    const fy=Y(fx,fz),wy=W(fx,fz);
    if(wy>-1e5&&fy<=wy+0.35)continue;
    if(FIELD.rock(fx,fz)>0.62)continue;
    claim('veilfern',fx,fz,3.8);
    const sc=rr(0.88,1.16);
    preRegisterPlant('veilfern',fx,fy,fz,4.2,11.5,'mistfloor',{hero:true});
    VEIL.growTreeFern(fx,fy,fz,KRAND.hash(seed+165,i,2),sc,{});
    st.veilfern++;
   }

   // Mire spore-spike colonies along wet stream bars & tarn edges (image_10)
   const nSpore=skey==='hall'?22:(skey==='kanopi'?16:10);
   for(let i=0;i<nSpore;i++){
    reseed(KRAND.hash(seed+190,i,1));
    let sx,sz;
    if(skey==='hall'){
     sx=rr(-110,110);
     const zs=13.5*Math.sin((sx+60)*0.0085)+4.2*Math.cos(sx*0.021);
     sz=zs+(i%2===0?1:-1)*rr(9.5,21.0);
    }else if(skey==='kanopi'){
     const a=rr(-1.3,1.3);
     sx=10+Math.cos(a)*rr(48,62);sz=Math.sin(a)*rr(36,48);
    }else{
     sx=rr(38,135);sz=(i%2===0?1:-1)*rr(10,19);
    }
    if(nearCam(sx,sz,5.5)||inReserveCore(sx,sz)||!free(sx,sz,2.2))continue;
    const sy=Y(sx,sz),wy=W(sx,sz);
    if(wy>-1e5&&sy<=wy+0.12)continue;
    claim('sporespike',sx,sz,2.2);
    const sc=rr(0.85,1.18);
    preRegisterPlant('sporespike',sx,sy,sz,1.8,4.0,'mistfloor',{riparian:true});
    VEIL.growSporeSpike(sx,sy,sz,KRAND.hash(seed+195,i,2),sc);
    st.sporespike++;
   }
  }

  // ---------------------------------------------------------------- 3. PERCHED CONIFERS ON KSTACKS MEGABRECCIA SPIRES (Station 4 veilpass, image_7!)
  if(skey==='veilpass'&&site.spires&&site.spires.length&&typeof VEIL_STACKS!=='undefined'&&VEIL_STACKS.length){
   for(let s=0;s<VEIL_STACKS.length;s++){
    const S=VEIL_STACKS[s];
    for(let p=0;p<4;p++){
     reseed(KRAND.hash(seed+220+s*11,p,1));
     const ang=rr(0,TAU),rad=p===0?0.15:rr(0.4,Math.min(3.2,S.r*0.24));
     const px=S.x+Math.cos(ang)*rad,pz=S.z+Math.sin(ang)*rad;
     const surf=KSTACKS.surface([S],px,pz);
     if(!surf||surf.steep>2.4)continue;
     const py=surf.top;
     preRegisterPlant('sitkaspruce',px,py,pz,2.5,12,'alderchute',{perchedOnSpire:S.id});
     const info=VEIL.growTree('cragspruce',px,py,pz,KRAND.hash(seed+225+s*11,p,2),rr(0.75,1.08),{
      elevAsl:site.baseElevM+py,mist01:0.78
     });
     tallyEpi(info.epi,px,py,pz,'alderchute');
     st.sitkaspruce++;
    }
   }
  }

  // ---------------------------------------------------------------- 4. CELL-SEEDED ALTITUDINAL CANOPY MATRIX (Z1..Z5)
  {
   const cell=skey==='southvale'?18.5:16.0,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.95)continue;
    reseed(KRAND.cell(seed+310,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||inOculusClear(px,pz)||nearCam(px,pz,8.8))continue;
    // Keep Hush-Edge red-peat trail open on southvale!
    if(skey==='southvale'&&FIELD.peat(px,pz)>0.45)continue;

    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.45)continue;
    const rockV=FIELD.rock(px,pz);
    if(rockV>0.82)continue;

    const elevAsl=site.baseElevM+py;
    const chuteV=FIELD.chute(px,pz);
    const slotV=(skey==='gorge'&&Math.abs(pz)<32)?0.85:(rockV*0.65);
    const zInfo=VEIL_PHYS.zoneAt(elevAsl,slotV,chuteV);
    const zone=zInfo.zone;
    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+315,ix,iz);

    if(zone==='highcol'||(skey==='veilpass'&&FIELD.snow(px,pz)>0.62)){
     // Z5: stunted krummholz pine mats below +5,100 m
     if(elevAsl<5150&&rng()<0.44*q&&free(px,pz,2.4)){
      claim('krumm',px,pz,2.4);
      const ks=rr(0.95,1.65);
      preRegisterPlant('krumm',px,py,pz,ks,1.4,'highcol',{});
      BIO.put('vm_krumm_fol',[px,py-0.04,pz],qEuler(0.08,rr(0,TAU),0),[ks*1.35,ks*0.58,ks*1.35],pickC(PAL.krumm,0.03));
      st.krumm++;
     }
     continue;
    }

    if(chuteV>0.42||zone==='alderchute'||skey==='veilpass'){
     // Z4: vivid lime-green slide-alder avalanche chutes splitting subalpine fur-larch & crag spruce!
     if(chuteV>0.38){
      if(rng()<0.78*q&&free(px,pz,2.8)){
       claim('slidealder',px,pz,2.8);
       const bowAz=pz>0?-Math.PI*0.5:Math.PI*0.5;
       preRegisterPlant('slidealder',px,py,pz,2.6,4.2,'alderchute',{avalancheApron:true});
       VEIL.growTree('slidealder',px,py,pz,tSeed,rr(0.85,1.22),{bowAz:bowAz,noEpi:true});
       st.slidealder++;
      }
      continue;
     }
     if(rng()>0.62*q||!free(px,pz,4.2))continue;
     const kindZ4=rng()<0.55?'furlarch':'cragspruce';
     const spKey=kindZ4==='cragspruce'?'sitkaspruce':'furlarch';
     claim(spKey,px,pz,4.2);
     preRegisterPlant(spKey,px,py,pz,3.5,16,'alderchute',{});
     const inf4=VEIL.growTree(kindZ4,px,py,pz,tSeed,rr(0.85,1.16),{elevAsl:elevAsl,mist01:FIELD.mist(px,pz)});
     tallyEpi(inf4.epi,px,py,pz,'alderchute');
     st[spKey]++;
     continue;
    }

    if(skey==='southvale'||zone==='cloudbelt'){
     // Z3: writhing moss-velvet cloud-oaks + giant tree-ferns + bolster maples in perpetual fog
     if(rng()>0.68*q||!free(px,pz,4.2))continue;
     const farFog=skey==='southvale'&&Math.hypot(px,pz)>220;
     const u=rng();
     if(u<0.58||skey==='southvale'&&u<0.76){
      claim('cloudoak',px,pz,4.2);
      preRegisterPlant('cloudoak',px,py,pz,4.0,12,'cloudbelt',{});
      const infO=VEIL.growTree('cloudoak',px,py,pz,tSeed,rr(0.88,1.20),{elevAsl:elevAsl,mist01:0.88,noEpi:farFog});
      tallyEpi(infO.epi,px,py,pz,'cloudbelt');
      st.cloudoak++;
     }else if(u<0.78&&dCam<NEAR_TREE_R){
      claim('veilfern',px,pz,3.8);
      preRegisterPlant('veilfern',px,py,pz,4.0,10.5,'cloudbelt',{});
      VEIL.growTreeFern(px,py,pz,tSeed,rr(0.82,1.08),{});
      st.veilfern++;
     }else{
      const kC=rng()<0.5?'veilcedar':'clubmaple';
      claim(kC,px,pz,4.8);
      preRegisterPlant(kC,px,py,pz,4.4,kC==='veilcedar'?44:19,'cloudbelt',{});
      if(dCam<NEAR_TREE_R||!IMP){
       const infC=VEIL.growTree(kC,px,py,pz,tSeed,rr(0.82,1.05),{elevAsl:elevAsl,mist01:0.86,noEpi:farFog});
       tallyEpi(infC.epi,px,py,pz,'cloudbelt');
      }else{
       BIO.impostorPut('vm_imp_trees',kC==='veilcedar'?IMP.cedar:IMP.maple,[px,py,pz],rr(0,TAU),0.95,null);
      }
      st[kC]++;
     }
     continue;
    }

    if(zone==='gorge'){
     // Z2: cantilevered gorge shelf-elms, bolster maples & giant conifers framing the cataract
     if(rng()>0.64*q||!free(px,pz,4.4))continue;
     const uG=rng();
     const kG=uG<0.44?'umbrellaelm':(uG<0.72?'clubmaple':'veilcedar');
     claim(kG,px,pz,4.4);
     preRegisterPlant(kG,px,py,pz,4.2,kG==='veilcedar'?48:18,'gorge',{});
     if(dCam<NEAR_TREE_R||!IMP||kG==='umbrellaelm'){
      const infG=VEIL.growTree(kG,px,py,pz,tSeed,rr(0.86,1.14),{elevAsl:elevAsl,mist01:0.90});
      tallyEpi(infG.epi,px,py,pz,'gorge');
     }else{
      BIO.impostorPut('vm_imp_trees',kG==='veilcedar'?IMP.cedar:IMP.maple,[px,py,pz],rr(0,TAU),0.95,null);
     }
     st[kG]++;
     continue;
    }

    // Z1 mistfloor: Hoh cathedral overstory of veilcedar, sitkaspruce, clubmaple & giant veilfern!
    if(rng()>0.66*q||!free(px,pz,4.8))continue;
    const u1=rng();
    if(u1<0.20){
     claim('veilfern',px,pz,3.8);
     preRegisterPlant('veilfern',px,py,pz,4.0,11.5,'mistfloor',{});
     if(dCam<NEAR_TREE_R||!IMP){
      VEIL.growTreeFern(px,py,pz,tSeed,rr(0.86,1.16),{});
     }else{
      BIO.impostorPut('vm_imp_trees',IMP.treefern,[px,py,pz],rr(0,TAU),1.0,null);
     }
     st.veilfern++;
    }else{
     const k1=u1<0.48?'veilcedar':(u1<0.76?'sitkaspruce':'clubmaple');
     claim(k1,px,pz,5.0);
     preRegisterPlant(k1,px,py,pz,4.6,k1==='clubmaple'?20:52,'mistfloor',{});
     if(dCam<NEAR_TREE_R||!IMP){
      const inf1=VEIL.growTree(k1,px,py,pz,tSeed,rr(0.88,1.12),{elevAsl:elevAsl,mist01:FIELD.mist(px,pz)});
      tallyEpi(inf1.epi,px,py,pz,'mistfloor');
     }else{
      const slotImp=k1==='veilcedar'?IMP.cedar:(k1==='sitkaspruce'?IMP.spruce:IMP.maple);
      BIO.impostorPut('vm_imp_trees',slotImp,[px,py,pz],rr(0,TAU),0.96,null);
     }
     st[k1]++;
    }
   }
  }

  // ---------------------------------------------------------------- 5. PILLOWMOSS BOULDER DOMES, SWORDFERN, DEVILSCLUB & GORGE VEILCOMBS
  {
   const cell=11.0,N=Math.ceil((R*1.64)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.82+(ix+0.5)*cell,cz=-R*0.82+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.84)continue;
    reseed(KRAND.cell(seed+510,ix,iz));
    const px=cx+rr(-0.44,0.44)*cell,pz=cz+rr(-0.44,0.44)*cell;
    if(inReserveCore(px,pz)||inOculusClear(px,pz)||nearCam(px,pz,4.5))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.16)continue;

    const elevAsl=site.baseElevM+py;
    const peatV=FIELD.peat(px,pz);
    const wetV=FIELD.wet(px,pz);
    const rockV=FIELD.rock(px,pz);

    // Keep southvale sunken red-peat trail walkable & distinct (image_13)!
    if(skey==='southvale'&&peatV>0.52)continue;

    // Pillowed hemispherical cushion-moss boulder domes (signature of southvale & cloudbelt, image_12, image_13!)
    const pillowProb=skey==='southvale'?0.76:(skey==='veilpass'?0.18:0.36);
    if(elevAsl<4650&&rng()<pillowProb*q){
     const ds=skey==='southvale'?rr(1.15,2.45):rr(0.75,1.65);
     preRegisterPlant('pillowmoss',px,py,pz,ds,ds*0.7,'cloudbelt',{});
     BIO.put('vm_pillow_dome',[px,py-ds*0.24,pz],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[ds*1.22,ds*0.74,ds],pickC(PAL.pillow,0.04));
     st.pillowmoss++;
     // Occasional veilcomb mist-gill shelf tucked on wet boulder flank
     if((skey==='gorge'||skey==='kanopi'||skey==='southvale')&&rng()<0.22){
      const azV=rr(0,TAU);
      preRegisterPlant('veilcomb',px,py,pz,0.6,0.5,'gorge',{onBoulder:true});
      BIO.put('vm_veilcomb_shelf',[px+Math.cos(azV)*ds*0.78,py+ds*0.18,pz+Math.sin(azV)*ds*0.78],qEuler(0,azV,0),[0.55,0.28,0.55],pickC(PAL.veilcomb,0.03));
      st.veilcomb++;
     }
    }

    // Hoh sword-fern & oxalis floor sward
    if(elevAsl<3900&&rng()<0.52*q){
     const fs=rr(0.58,1.22);
     preRegisterPlant('swordfern',px,py,pz,fs,fs,'mistfloor',{});
     BIO.put('vm_swordfern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fs,fs*0.90,fs],pickC(PAL.swordfern,0.04));
     if(rng()<0.55){
      const ms=rr(0.85,1.45);
      BIO.put('vm_moss_mat',[px+rr(-0.4,0.4),Y(px,pz)-0.02,pz+rr(-0.4,0.4)],qEuler(0,rr(0,TAU),0),[ms,ms,ms],pickC(PAL.pillow,0.03));
     }
     st.swordfern++;
    }

    // Spined gorge-palm (devilsclub) in wet seeps & canyon toes
    if(elevAsl<3550&&wetV>0.28&&rng()<0.24*q&&free(px,pz,1.8)){
     claim('devilsclub',px,pz,1.8);
     preRegisterPlant('devilsclub',px,py,pz,1.5,2.6,'gorge',{});
     VEIL.growDevilsClub(px,py,pz,KRAND.hash(seed+540,ix,iz),rr(0.85,1.15));
     st.devilsclub++;
    }

    // Megabreccia talus, cobbles, scree & peat root-clods (also guarantees every ground.* & rock.* family is sampled!)
    if(rng()<0.20*q){
     const bs=rr(0.75,2.05);
     const rKey=skey==='veilpass'&&py>18?'vm_scree':(wetV>0.45?'vm_cobble':(peatV>0.35?'vm_peat_clod':'vm_megabreccia_rock'));
     const rPal=rKey==='vm_scree'?PAL.scree:(rKey==='vm_cobble'?PAL.cobble:(rKey==='vm_peat_clod'?PAL.peat:PAL.megabreccia));
     BIO.put(rKey,[px,py-bs*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bs*1.18,bs*0.72,bs],pickC(rPal,0.02));
     st.boulders++;
    }
   }
  }

  // ---------------------------------------------------------------- 6. GUARANTEED SAMPLING ANCHORS (0 unsampled families on any station!)
  {
   const anchors=[
    ['vm_peat_clod',PAL.peat,0.65],
    ['vm_cobble',PAL.cobble,0.55],
    ['vm_scree',PAL.scree,0.62],
    ['vm_moss_boulder',PAL.pillow,0.75],
    ['vm_megabreccia_rock',PAL.megabreccia,0.95],
    ['vm_pillow_dome',PAL.pillow,0.90],
    ['vm_cedar_slab',PAL.peat,0.85],
    ['vm_ancient_stone',PAL.megabreccia,0.72],
    ['vm_bronze_ring',PAL.veilcomb,0.48],
    ['vm_veilcomb_shelf',PAL.veilcomb,0.45],
    ['vm_nurselog',PAL.pillow,0.65],
    ['vm_log_cedar',PAL.peat,0.60],
    ['vm_log_spruce',PAL.peat,0.58],
    ['vm_log_mossy',PAL.pillow,0.58],
    ['vm_log_alder',PAL.pillow,0.52],
    ['vm_log_treefern',PAL.peat,0.55]
   ];
   for(let a=0;a<anchors.length;a++){
    reseed(KRAND.hash(seed+710,a,1));
    const ang=(a/anchors.length)*TAU+0.3,rad=48+a*2.6;
    const ax=Math.cos(ang)*rad,az=Math.sin(ang)*rad;
    if(nearCam(ax,az,5.0))continue;
    const ay=Y(ax,az),sc=anchors[a][2];
    BIO.put(anchors[a][0],[ax,ay-sc*0.22,az],qEuler(0,ang,0),[sc,sc*0.65,sc],pickC(anchors[a][1],0.02));
   }
  }

  return st;
 };
})();
