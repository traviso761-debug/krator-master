// ================================================================= MATRONSCOAST — deterministic flora, BIO.kin & giant mollusc placement ([draw])
// Places all 10 native snail-coevolved flora species, BIO.kin cousins from biomes/shroudhills & biomes/farside
// (strictly excluding Shroud-Ants & drum-galls on mucus-glazed lowland trunks!), coquina conch-clasts, KHAZ zones,
// instanced mollusc herds, and 36-core-walker animated gliding Tower-Snails & Velvet Keel-Slugs.
(function(){
 'use strict';
 const {TAU,clamp,lerp,smooth,reseed,qEuler}=BIO.fn;
 const T3=BIO.host.THREE,C=MATRON.C,PAL=MATRON.PAL;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 function inReserve(x,z,pad){
  const res=SITE.reserves||[],p=pad==null?2:pad;
  for(let i=0;i<res.length;i++){
   const R=res[i];
   if(Math.hypot(x-R.x,z-R.z)<R.r+p)return true;
  }
  return false;
 }

 function makeDiscPoly(cx,cz,rad){
  const poly=[];
  for(let k=0;k<10;k++){
   const a=(k/10)*TAU;
   poly.push([+(cx+Math.cos(a)*rad).toFixed(3),+(cz+Math.sin(a)*rad).toFixed(3)]);
  }
  return poly;
 }

 MATRON.placeAll=function(opt){
  opt=opt||{};
  const q=opt.quality==null?1:opt.quality;
  MATRON.PLACED.length=0;
  MATRON.CROWNS.length=0;
  MATRON.SKY_PONDS.length=0;
  MATRON.WALKERS.length=0;

  const counts={
   nacretree:0,radulathorn:0,conchorchid:0,bitterfern:0,scrapelichen:0,
   slimecup:0,shellreed:0,velvetkelp_stub:0,cloudpodocarp:0,murexwort:0,
   kinTrees:0,sisterCups:0,farsideKin:0,
   towerSnails:0,queenSnails:0,megachitons:0,keelSlugs:0,coneSnails:0,
   lanternSnails:0,shagSnails:0,anvilStorks:0,walkers:0,drumGalls:0
  };
  const lanternAnchors=[];
  const cupForks=[];

  const canKin=PQ.get('kin')!=='0'&&typeof BIO.kin==='function';
  const KIN_KOHE=(canKin&&typeof SHROUDHILLS!=='undefined')?BIO.kin('shroudhills.shroud_kohekohe',{
   key:'snail_kohekohe',
   name:'Browse-Pruned Shroud-Mahogany',
   scale:{H:0.88,rb:0.92,crownR:0.90},
   tags:{borrowed:true,browseSkirtM:2.20}
  }):null;
  const KIN_KAURI=(canKin&&typeof SHROUDHILLS!=='undefined')?BIO.kin('shroudhills.shroud_amber_kauri',{
   key:'snail_amber_kauri',
   name:'Coastal Amber-Podocarp',
   scale:{H:0.84,rb:0.88,crownR:0.86},
   tags:{borrowed:true,browseSkirtM:2.20}
  }):null;
  const KIN_CUPS=(canKin&&typeof SHROUDHILLS!=='undefined')?BIO.kin('shroudhills.shroud_sister_cups',{
   key:'snail_sister_cups',
   name:'Paired Sister-Cup Cistern Sky-Pond',
   tags:{borrowed:true}
  }):null;
  const KIN_WRACK=(canKin&&typeof FARSIDE!=='undefined')?BIO.kin('farside.stormwrack',{
   key:'skerry_stormwrack',
   name:'Cast Storm-Wrack Heap',
   tags:{borrowed:true}
  }):null;
  const KIN_WINE=(canKin&&typeof FARSIDE!=='undefined')?BIO.kin('farside.wineweed',{
   key:'skerry_wineweed',
   name:'Crimson Tide-Wineweed',
   tags:{borrowed:true}
  }):null;
  const KIN_CORAL=(canKin&&typeof FARSIDE!=='undefined')?BIO.kin('farside.spraycoral',{
   key:'skerry_spraycoral',
   name:'Intertidal Spray-Coral Crust',
   tags:{borrowed:true}
  }):null;

  // ---------------------------------------------------------------- 1. Canopy Rainforest Matrix (nacretree, radulathorn, cloudpodocarp + BIO.kin)
  const treeCell=SKEY==='skerry'?14.5:(SKEY==='browsewood'?19.5:(SKEY==='cloudslope'?20.5:22.0));
  const treeR=460,nT=Math.ceil(treeR/treeCell);
  let regTreeCount=0;

  for(let j=-nT;j<=nT;j++)for(let i=-nT;i<=nT;i++){
   const h=KRAND.hash(SITE.seed+101,i,j,0x501);
   const u=s=>KRAND.unit(KRAND.hash(h,s,0,0x502));
   const x=(i+0.18+0.64*u(1))*treeCell;
   const z=(j+0.18+0.64*u(2))*treeCell;
   const dist=Math.hypot(x,z);
   if(dist>treeR||inCamPad(x,z,8)||inReserve(x,z,5))continue;

   const y=DRAWN_H(x,z),wy=waterH(x,z);
   if(wy>-1e8&&y<wy+1.05)continue;
   if(SITE.hasSea&&y<(SKEY==='skerry'?1.45:2.4))continue;
   if(FIELD.slope(x,z)>(SKEY==='skerry'?0.72:0.56))continue;

   const mh=SNAIL_PHYS.mucusHighwayAt(x,z,SITE,0.1);
   if(mh.trail01>0.42)continue;
   const cm=SNAIL_PHYS.coquinaMiddenAt(x,z,SITE);
   if(cm.midden01>0.55)continue;

   /* Keep kelpfront's western littoral grazing bench open so rasped kelp stubs & snail herds read clearly */
   if(SKEY==='kelpfront'&&x<38)continue;

   const dens=(SKEY==='browsewood'?0.64:(SKEY==='cloudslope'?0.58:(SKEY==='skerry'?0.62:0.48)))*q;
   if(u(3)>dens)continue;
   if(SPACE.some(x,z,5.2,()=>true))continue;

   /* Verify ant-exclusion physics: lowland mucus coat blocks Shroud-Ants 100% */
   const antChk=SNAIL_PHYS.antExclusionAt(SITE.baseElevM+y,Math.max(SITE.ambientMucus01,mh.mucusCoat01),SITE.rainMm);
   if(antChk.drumGallAllowed&&SITE.baseElevM<1400)counts.drumGalls++;

   const pickV=u(4);
   const dLod=BIO.lodD(x,z);

   if(SKEY==='cloudslope'){
    if(pickV<0.56){
     if(dLod<250){
      const tr=MATRON.growCloudPodocarp(x,y,z,h,0.92+0.20*u(5));
      for(let ls=0;ls<tr.lanternSpots.length;ls++)lanternAnchors.push(tr.lanternSpots[ls]);
      if(regTreeCount<28){
       REGISTER({name:'Skerry Mist-Yew',key:'cloudpodocarp',kind:'tree',x:x,y:y,z:z,r:5.2,h:tr.H,tags:{species:'cloudpodocarp'}});
       regTreeCount++;
      }
     }else if(MATRON.IMP){
      BIO.impostorPut('mc_imp_trees',MATRON.IMP.cloudpodocarp,[x,y-0.4,z],u(6)*TAU,0.92+0.22*u(5),null);
     }
     counts.cloudpodocarp++;
     MATRON.PLACED.push(['cloudpodocarp',x,y,z,h,1,{zone:'cloud_cataract'}]);
    }else if(pickV<0.78&&KIN_KAURI&&dLod<310){
     reseed(h);
     const KT=KIN_KAURI.make(x,y,z);
     KIN_KAURI.grow(KT,1);
     if(KT.cupForks){for(let cf=0;cf<KT.cupForks.length;cf++)cupForks.push(KT.cupForks[cf]);}
     counts.kinTrees++;
    }else if(KIN_KOHE&&dLod<310){
     reseed(h);
     const KT=KIN_KOHE.make(x,y,z);
     KIN_KOHE.grow(KT,1);
     if(KT.cupForks){for(let cf=0;cf<KT.cupForks.length;cf++)cupForks.push(KT.cupForks[cf]);}
     counts.kinTrees++;
    }else continue;
   }else{
    if(pickV<0.38){
     if(dLod<250){
      const tr=MATRON.growNacreTree(x,y,z,h,0.90+0.22*u(5));
      for(let ls=0;ls<tr.lanternSpots.length;ls++)lanternAnchors.push(tr.lanternSpots[ls]);
      if(regTreeCount<28){
       REGISTER({name:'Pearl-Plum Nacre-Fig (2.2 m browse-skirt)',key:'nacretree',kind:'tree',x:x,y:y,z:z,r:5.5,h:tr.H,tags:{species:'nacretree',browseSkirtM:2.20}});
       regTreeCount++;
      }
     }else if(MATRON.IMP){
      BIO.impostorPut('mc_imp_trees',MATRON.IMP.nacretree,[x,y-0.4,z],u(6)*TAU,0.90+0.22*u(5),null);
     }
     counts.nacretree++;
     MATRON.PLACED.push(['nacretree',x,y,z,h,1,{zone:'browse_cathedral',browseSkirtM:2.20}]);
    }else if(pickV<0.58&&dLod<240){
     const tr=MATRON.growRadulaThorn(x,y,z,h,0.92+0.20*u(5));
     if(regTreeCount<34){
      REGISTER({name:'Glass-Collar Silica Palm',key:'radulathorn',kind:'tree',x:x,y:y,z:z,r:3.8,h:tr.H,tags:{species:'radulathorn'}});
      regTreeCount++;
     }
     counts.radulathorn++;
     MATRON.PLACED.push(['radulathorn',x,y,z,h,1,{zone:'browse_cathedral',silicaArmour:true}]);
    }else if(pickV<0.80&&KIN_KOHE&&dLod<300){
     reseed(h);
     const KT=KIN_KOHE.make(x,y,z);
     KIN_KOHE.grow(KT,1);
     if(KT.cupForks){for(let cf=0;cf<KT.cupForks.length;cf++)cupForks.push(KT.cupForks[cf]);}
     counts.kinTrees++;
    }else if(KIN_KAURI&&dLod<300){
     reseed(h);
     const KT=KIN_KAURI.make(x,y,z);
     KIN_KAURI.grow(KT,1);
     if(KT.cupForks){for(let cf=0;cf<KT.cupForks.length;cf++)cupForks.push(KT.cupForks[cf]);}
     counts.kinTrees++;
    }else continue;
   }
   SPACE.insert({kind:'tree',x:x,z:z},x,z,4.4);
  }

  // ---------------------------------------------------------------- 2. Paired Sister-Cup Sky-Ponds (BIO.kin) & Canopy Painted Lantern-Snails
  if(KIN_CUPS&&cupForks.length){
   const maxCups=SKEY==='browsewood'?26:(SKEY==='cloudslope'?18:10);
   for(let i=0;i<cupForks.length&&counts.sisterCups<maxCups;i++){
    const F=cupForks[i];
    if(Math.hypot(F.x,F.z)>220)continue;
    reseed(F.seed||KRAND.hash(SITE.seed+205,i,1,0x511));
    const CRec=KIN_CUPS.make(F.x,F.y,F.z,F.yaw);
    KIN_CUPS.grow(CRec,1);
    const cupR=CRec.cupR==null?0.72:CRec.cupR;
    const lipH=CRec.lipH==null?0.68:CRec.lipH;
    const cy=Math.cos(CRec.yaw||0),sy=Math.sin(CRec.yaw||0);
    for(let sd=-1;sd<=1;sd+=2){
     MATRON.SKY_PONDS.push({
      x:+(F.x+cy*sd*0.62*cupR).toFixed(2),
      z:+(F.z-sy*sd*0.62*cupR).toFixed(2),
      level:+(F.y+lipH*0.76).toFixed(2),
      poly:makeDiscPoly(F.x+cy*sd*0.62*cupR,F.z-sy*sd*0.62*cupR,cupR*0.52)
     });
    }
    counts.sisterCups++;
    /* Hang Painted Lantern-Snails under Sister-Cup rims! */
    const lsCol=C(PAL.lanternSnail[i%PAL.lanternSnail.length]);
    BIO.put('mc_lantern_snail',[F.x+0.25,F.y-0.08,F.z-0.18],qEuler(Math.PI,i*1.4,0),[0.20,0.20,0.20],lsCol);
    counts.lanternSnails++;
   }
  }

  for(let i=0;i<lanternAnchors.length&&counts.lanternSnails<64;i++){
   const A=lanternAnchors[i];
   if(H(SITE.seed+209,i,1,0x514)>0.55)continue;
   const sc=0.16+0.07*H(SITE.seed+209,i,2,0x514);
   const col=C(PAL.lanternSnail[i%PAL.lanternSnail.length]);
   BIO.put('mc_lantern_snail',[A[0],A[1],A[2]],qEuler(0.15,A[3]+1.2,0),[sc,sc,sc],col);
   counts.lanternSnails++;
  }

  // ---------------------------------------------------------------- 3. Coquina Conch-Middens: Fossil Conch-Clasts, Twin-Slipper Orchids & Harpoon Cone-Snails
  const mids=SITE.middens||[];
  for(let m=0;m<mids.length;m++){
   const M=mids[m];
   let placedOnMid=0;
   const nClasts=26;
   for(let k=0;k<nClasts;k++){
    const sd=KRAND.hash(SITE.seed+301,m,k,0x521);
    const a=H(sd,1,0,1)*TAU,rad=Math.sqrt(H(sd,2,0,1))*0.92;
    const ca=Math.cos(M.yaw),sa=Math.sin(M.yaw);
    const lx=Math.cos(a)*M.rx*rad,lz=Math.sin(a)*M.rz*rad;
    const x=M.x+lx*ca-lz*sa,z=M.z+lx*sa+lz*ca;
    if(inCamPad(x,z,3))continue;
    const y=DRAWN_H(x,z);
    const chir=SNAIL_PHYS.chiralityOf(sd,0x522);
    const sc=0.68+0.36*H(sd,3,0,1);
    const item=chir.sinistral?'mc_conch_clast_sin':'mc_conch_clast_dex';
    BIO.put(item,[x,y-0.06,z],qEuler(0.28*(H(sd,4,0,1)-0.5),H(sd,5,0,1)*TAU,0.32*(H(sd,6,0,1)-0.5)),[sc,sc,sc],chir.sinistral?0xf6eefc:0xefe8dc);
    placedOnMid++;

    /* Calciphile Matron's Twin-Slipper Orchid (conchorchid) exclusively on cemented coquina middens */
    if(k%2===0){
     const ox=x+0.45*(H(sd,7,0,1)-0.5),oz=z+0.45*(H(sd,8,0,1)-0.5);
     const oy=DRAWN_H(ox,oz);
     const osc=0.58+0.42*H(sd,9,0,1);
     const oCol=C(PAL.orchid[k%PAL.orchid.length]);
     BIO.put('mc_orchid',[ox,oy,oz],qEuler(0,H(sd,10,0,1)*TAU,0),[osc,osc,osc],oCol);
     BIO.put('mc_orchid_pouch',[ox+0.06,oy+osc*0.38,oz],qEuler(0.22,H(sd,11,0,1)*TAU,0),[osc*0.24,osc*0.28,osc*0.24],0xf6dce8);
     BIO.put('mc_orchid_pouch',[ox-0.06,oy+osc*0.34,oz+0.04],qEuler(-0.18,H(sd,11,0,1)*TAU+1.2,0),[osc*0.22,osc*0.26,osc*0.22],oCol);
     counts.conchorchid++;
     MATRON.PLACED.push(['conchorchid',ox,oy,oz,sd,osc,{zone:'coquina_midden'}]);
    }
   }

   /* Ambush venomous Harpoon Cone-Snails (Terraconus rox) + KHAZ snail:harpoon inside hollow middens */
   if(M.harpoonHollow){
    for(let hc=0;hc<4;hc++){
     const hsd=KRAND.hash(SITE.seed+319,m,hc,0x528);
     const ha=(hc/4)*TAU+0.4,hr=0.45;
     const hx=M.x+Math.cos(ha)*M.rx*hr,hz=M.z+Math.sin(ha)*M.rz*hr;
     const hy=DRAWN_H(hx,hz);
     const csc=0.40+0.12*H(hsd,1,0,1);
     BIO.put('mc_conesnail',[hx,hy,hz],qEuler(0,ha+Math.PI,0),[csc,csc,csc],C(PAL.coneSnail[hc%PAL.coneSnail.length]));
     counts.coneSnails++;
     placedOnMid++;
    }
    if(typeof KHAZ!=='undefined'){
     const hzSpec=KHAZ.make(SNAIL_PHYS.hazardSpec('harpoon'));
     const my=DRAWN_H(M.x,M.z);
     const hRec={
      id:'matronscoast:harpoon-'+M.id,
      name:'Harpoon Cone-Snail Midden Crevice ('+M.id+')',
      class:'feature',
      at:[M.x,my,M.z],
      r:Math.max(8,M.rz*0.75),
      h:4.5,
      tags:{biome:'matronscoast',hazard:hzSpec}
     };
     HAZARDS.push(hRec);
     if(typeof KTAGS!=='undefined'&&KTAGS.page){KTAGS.page.add(hRec);}
    }
   }
   if(placedOnMid>0){
    const my0=DRAWN_H(M.x,M.z);
    REGISTER({
     tagId:'matronscoast:'+M.id,
     tagClass:'feature',
     name:'Biogenic Coquina Conch-Midden ('+M.id+')',
     x:M.x,y:my0-2.0,z:M.z,r:M.rx,h:M.h+4.0,
     tags:{biome:'matronscoast'}
    });
   }
  }

  // ---------------------------------------------------------------- 4. Understorey Floor, Slime-Cups, Sedge, Scrape-Lichen, Murexwort & Kelp-Front Stubs
  const flCell=9.5,flR=240,nF=Math.ceil(flR/flCell);
  for(let j=-nF;j<=nF;j++)for(let i=-nF;i<=nF;i++){
   const sd=KRAND.hash(SITE.seed+401,i,j,0x531);
   const u=s=>KRAND.unit(KRAND.hash(sd,s,0,0x532));
   const x=(i+0.15+0.70*u(1))*flCell;
   const z=(j+0.15+0.70*u(2))*flCell;
   if(Math.hypot(x,z)>flR||inCamPad(x,z,3.5)||inReserve(x,z,2.5))continue;

   const y=DRAWN_H(x,z),wy=waterH(x,z);
   if(wy>-1e8&&y<wy+0.08)continue;
   if(SITE.hasSea&&y<-0.15)continue;

   const mh=SNAIL_PHYS.mucusHighwayAt(x,z,SITE,FIELD.slope(x,z));
   const wet=FIELD.wet(x,z),spray=FIELD.spray(x,z),rock=FIELD.rock(x,z),coq=FIELD.coquina(x,z);

   /* Station 3 (kelpfront): Farside landkelp cropped down to 0.35-1.05 m holdfast stubs + cast stormwrack, wineweed & spraycoral! */
   if(SKEY==='kelpfront'&&x<46&&y>0.25&&y<15.5&&mh.trail01<0.35){
    const kb=SNAIL_PHYS.kelpFrontBalanceAt(x,z,SITE,{spray01:spray});
    if(kb.kelpArrival01>0.18&&u(3)<0.56*q){
     MATRON.growKelpStub(x,y,z,sd,kb.survivingStipeM);
     counts.velvetkelp_stub++;
     MATRON.PLACED.push(['velvetkelp_stub',x,y,z,sd,kb.survivingStipeM,{zone:'kelp_front',rasped:true}]);
     if(KIN_WRACK&&u(4)<0.42){
      reseed(sd^0x19);
      const WT=KIN_WRACK.make(x+0.9,DRAWN_H(x+0.9,z),z);
      KIN_WRACK.grow(WT,1);
      counts.farsideKin++;
     }
     if(KIN_WINE&&u(5)<0.34){
      reseed(sd^0x29);
      const WT2=KIN_WINE.make(x-0.7,DRAWN_H(x-0.7,z+0.5),z+0.5);
      KIN_WINE.grow(WT2,1);
      counts.farsideKin++;
     }else if(KIN_CORAL&&spray>0.16&&u(5)<0.68){
      reseed(sd^0x39);
      const CT2=KIN_CORAL.make(x+0.5,DRAWN_H(x+0.5,z-0.5),z-0.5);
      KIN_CORAL.grow(CT2,1);
      counts.farsideKin++;
     }
     continue;
    }
   }

   /* Station 1 (skerry): Farside stormwrack, wineweed & spraycoral on outer intertidal benches */
   if(SKEY==='skerry'&&y>0.20&&y<4.8&&u(3)<0.34*q){
    if(KIN_WRACK&&u(4)<0.55){
     reseed(sd^0x31);
     const WT=KIN_WRACK.make(x,y,z);
     KIN_WRACK.grow(WT,1);
     counts.farsideKin++;
    }else if(KIN_CORAL&&u(4)<0.82){
     reseed(sd^0x32);
     const CT=KIN_CORAL.make(x,y,z);
     KIN_CORAL.grow(CT,1);
     counts.farsideKin++;
    }else if(KIN_WINE){
     reseed(sd^0x33);
     const W2=KIN_WINE.make(x,y,z);
     KIN_WINE.grow(W2,1);
     counts.farsideKin++;
    }
   }

   /* Mucus-Trap Calcareous Pitchers (slimecup) lining the edges of Mucus Silver-Highways (distM 2.0..6.4 m) */
   if(mh.distM>=2.0&&mh.distM<=6.4&&mh.trail01<0.55&&u(6)<(SKEY==='cloudslope'?0.28:0.52)*q){
    const psc=0.48+0.38*u(7);
    const pCol=C(PAL.slimeCup[(i+j)&3]);
    BIO.put('mc_slimecup',[x,y,z],qEuler(0,u(8)*TAU,0),[psc,psc,psc],pCol);
    BIO.put('mc_slimecup_lid',[x,y+psc*0.92,z],qEuler(0.32,u(8)*TAU,0),[psc*0.32,psc*0.26,psc*0.32],0xd85868);
    counts.slimecup++;
    MATRON.PLACED.push(['slimecup',x,y,z,sd,psc,{zone:'mucus_highway'}]);
    continue;
   }

   /* Coquina Pool Sedge (shellreed) around pools, streams & damp coquina margins */
   if(wet>0.38&&mh.trail01<0.25&&u(7)<0.46*q){
    const ssc=1.05+0.75*u(8);
    BIO.put('mc_sedge',[x,y,z],qEuler(0,u(9)*TAU,0),[ssc*0.85,ssc,ssc*0.85],C(PAL.shellReed[(i*3+j)&3]));
    counts.shellreed++;
    MATRON.PLACED.push(['shellreed',x,y,z,sd,ssc,{zone:'coquina_midden'}]);
    continue;
   }

   /* Radula-Stripe Lichen (scrapelichen) & Purple-Spore Liverwort (murexwort) on wet skerry/cataract rock & coquina */
   if((rock>0.25||coq>0.32||spray>0.28)&&mh.trail01<0.40&&u(8)<0.48*q){
    if(u(9)<0.54){
     const lsc=0.65+0.65*u(10);
     BIO.put('mc_scrapelichen',[x,y+0.02,z],qEuler(0,u(11)*TAU,0),[lsc,0.35,lsc],C(PAL.scrapeLichen[(i+j)&3]));
     counts.scrapelichen++;
     MATRON.PLACED.push(['scrapelichen',x,y,z,sd,lsc,{zone:'skerry_intertidal'}]);
    }else{
     const msc=0.55+0.55*u(10);
     BIO.put('mc_murexwort',[x,y+0.02,z],qEuler(0,u(11)*TAU,0),[msc,0.35,msc],C(PAL.murexWort[(i+j)&3]));
     counts.murexwort++;
     MATRON.PLACED.push(['murexwort',x,y,z,sd,msc,{zone:'skerry_intertidal'}]);
    }
    continue;
   }

   /* Alkaloid Shield-Fern (bitterfern): unpalatable saponin islands thriving untouched beside bare cathedral floors */
   if(mh.trail01<0.18&&y>1.6&&u(10)<(SKEY==='browsewood'?0.44:0.34)*q){
    const fsc=0.95+0.75*u(11);
    BIO.put('mc_fern',[x,y,z],qEuler(0,u(12)*TAU,0),[fsc*1.05,fsc,fsc*1.05],C(PAL.bitterFern[(i+j*2)&3]));
    counts.bitterfern++;
    MATRON.PLACED.push(['bitterfern',x,y,z,sd,fsc,{zone:'browse_cathedral',alkaloid:true}]);
   }
  }

  // ---------------------------------------------------------------- 5. Intertidal Skerry Megachitons, Anvil-Storks, Static Snails & KHAZ Slip Zones
  if(SITE.hasSea){
   /* Skerry Megachitons (0.85-1.25 m 8-plated grazers) clinging along wave-washed intertidal visors */
   const nChit=SKEY==='skerry'?34:24;
   let surfRegDone=false;
   for(let c=0;c<nChit;c++){
    const sd=KRAND.hash(SITE.seed+501,c,1,0x541);
    const a=(c/nChit)*TAU+0.25*H(sd,1,0,1);
    /* Scan radially to land right in the +0.25..+2.8 m intertidal splash zone */
    let bx=0,bz=0,by=-99;
    for(let rTry=24;rTry<=210;rTry+=8){
     const tx=(SKEY==='skerry'?(c%2===0?-88:96):-32)+Math.cos(a)*rTry*(SKEY==='skerry'?1.0:0.45);
     const tz=(SKEY==='skerry'?8:(-150+300*(c/nChit)))+Math.sin(a)*(SKEY==='skerry'?rTry:18);
     const ty=DRAWN_H(tx,tz);
     if(ty>=0.22&&ty<=3.1&&!inCamPad(tx,tz,3)){bx=tx;bz=tz;by=ty;break;}
    }
    if(by<-10)continue;
    const sc=0.88+0.36*H(sd,2,0,1);
    const col=C(PAL.chitonValve[c%PAL.chitonValve.length]);
    BIO.put('mc_megachiton',[bx,by+0.02,bz],qEuler(0,H(sd,3,0,1)*TAU,0),[sc,sc,sc],col);
    counts.megachitons++;
    if(!surfRegDone){
     REGISTER({name:'Wave-Rasped Skerry Megachiton Ledge',key:'skerry_megachiton',kind:'fauna',x:bx,y:by-1,z:bz,r:14,h:6});
     if(typeof KHAZ!=='undefined'){
      const sRec={
       id:'matronscoast:surf-'+SKEY,
       name:'Outer Skerry Surf-Surge Zone',
       class:'feature',
       at:[bx,by,bz],
       r:18,
       h:5,
       tags:{biome:'matronscoast',hazard:KHAZ.make(SNAIL_PHYS.hazardSpec('surf'))}
      };
      HAZARDS.push(sRec);
      if(typeof KTAGS!=='undefined'&&KTAGS.page){KTAGS.page.add(sRec);}
     }
     surfRegDone=true;
    }
   }
  }

  /* Skerry Anvil-Storks, Granite & Ironstone Anvil Stones ringed by shattered snail-shell shards (all 4 stations!) */
  const anvilSpots=SKEY==='skerry'?[[-86,16],[88,-18]]:SKEY==='browsewood'?[[-28,-44],[54,-18]]:SKEY==='kelpfront'?[[28,48],[62,-18]]:[[-22,-22],[62,24]];
  for(let a=0;a<anvilSpots.length;a++){
   let ax=anvilSpots[a][0],az=anvilSpots[a][1],ay=DRAWN_H(ax,az);
   if(inCamPad(ax,az,4)||inReserve(ax,az,4)||(SITE.hasSea&&ay<1.25)||(waterH(ax,az)>-1e8&&ay<waterH(ax,az)+0.4)){
    let found=false;
    for(let rTry=8;rTry<=150&&!found;rTry+=8){
     for(let k=0;k<12;k++){
      const ang=(k/12)*TAU+a*0.5;
      const tx=anvilSpots[a][0]+Math.cos(ang)*rTry,tz=anvilSpots[a][1]+Math.sin(ang)*rTry;
      const ty=DRAWN_H(tx,tz),tw=waterH(tx,tz);
      if(!inCamPad(tx,tz,4)&&!inReserve(tx,tz,4)&&(!SITE.hasSea||ty>=1.25)&&(tw<-1e8||ty>=tw+0.4)){
       ax=tx;az=tz;ay=ty;found=true;break;
      }
     }
    }
    if(!found)continue;
   }
   BIO.put('mc_rock_granite',[ax,ay+0.12,az],qEuler(0,a*1.1,0),[1.45,0.65,1.25],0xbec0ba);
   BIO.put('mc_rock_ironstone',[ax+1.35,DRAWN_H(ax+1.35,az-0.85)+0.10,az-0.85],qEuler(0,a*0.7+0.9,0),[0.92,0.52,0.85],0x8c7868);
   BIO.put('mc_anvil_stork',[ax-0.85,ay,az+0.35],qEuler(0,0.8+a,0),[1.12,1.12,1.12],0xf4f6f8);
   counts.anvilStorks++;
   for(let sh=0;sh<6;sh++){
    const sa=(sh/6)*TAU;
    const sx=ax+Math.cos(sa)*1.55,sz=az+Math.sin(sa)*1.55;
    BIO.put('mc_conch_clast_dex',[sx,DRAWN_H(sx,sz)-0.04,sz],qEuler(0.7,sa,0.5),[0.28,0.18,0.28],0xece4d8);
   }
   if(a===0){
    REGISTER({name:'Granite Anvil-Stone and Crusher-Stork Feeding Ring',key:'anvil_stork',kind:'fauna',x:ax,y:ay-1,z:az,r:6,h:4});
   }
  }

  /* Instanced grazing herds of Matron's Tower-Snails, Velvet Keel-Slugs & (on cloudslope) Shag-Shell Mountain Snails */
  const nHerd=SKEY==='browsewood'?34:(SKEY==='kelpfront'?36:(SKEY==='skerry'?22:26));
  for(let g=0;g<nHerd;g++){
   const sd=KRAND.hash(SITE.seed+601,g,1,0x551);
   const ways=SITE.highways||[];
   let gx=0,gz=0;
   if(ways.length&&g%2===0){
    const W=ways[g%ways.length],pts=W.pts;
    const seg=g%(pts.length-1),t=H(sd,1,0,1);
    gx=lerp(pts[seg][0],pts[seg+1][0],t)+(H(sd,2,0,1)-0.5)*7.5;
    gz=lerp(pts[seg][1],pts[seg+1][1],t)+(H(sd,3,0,1)-0.5)*7.5;
   }else{
    const ang=H(sd,1,0,1)*TAU,rad=16+125*H(sd,2,0,1);
    gx=(SKEY==='kelpfront'?24:0)+Math.cos(ang)*rad*(SKEY==='kelpfront'?0.55:1.0);
    gz=Math.sin(ang)*rad;
   }
   if(inCamPad(gx,gz,3.5)||inReserve(gx,gz,3))continue;
   const gy=DRAWN_H(gx,gz),gwy=waterH(gx,gz);
   if((gwy>-1e8&&gy<gwy+0.25)||(SITE.hasSea&&gy<0.85))continue;

   const yaw=H(sd,4,0,1)*TAU;
   if(SKEY==='cloudslope'){
    if(g%3===0){
     const ksc=0.62+0.24*H(sd,5,0,1);
     BIO.put('mc_keelslug',[gx,gy,gz],qEuler(0,yaw,0),[ksc,ksc,ksc],C(PAL.keelSlug[g%PAL.keelSlug.length]));
     counts.keelSlugs++;
    }else{
     const ssc=0.45+0.20*H(sd,5,0,1);
     BIO.put('mc_shagshell',[gx,gy,gz],qEuler(0,yaw,0),[ssc,ssc,ssc],C(PAL.shagSnail[g%PAL.shagSnail.length]));
     BIO.put('mc_snail_body',[gx,gy,gz],qEuler(0,yaw,0),[ssc*0.95,ssc*0.95,ssc*0.95],0x7a8062);
     counts.shagSnails++;
    }
   }else{
    if(g%4===3){
     const ksc=0.60+0.28*H(sd,5,0,1);
     BIO.put('mc_keelslug',[gx,gy,gz],qEuler(0,yaw,0),[ksc,ksc,ksc],C(PAL.keelSlug[g%PAL.keelSlug.length]));
     counts.keelSlugs++;
    }else{
     /* Force index 0 to showcase a sacred 2% Lone-Born sinistral Queen-Shell alongside natural chiralityOf draws! */
     const chir=g===0?{sinistral:true}:SNAIL_PHYS.chiralityOf(sd,0x552);
     const tsc=0.74+0.34*H(sd,5,0,1);
     const shItem=chir.sinistral?'mc_snail_shell_sin':'mc_snail_shell_dex';
     const shCol=chir.sinistral?C(PAL.queenShell[0]):C(PAL.towerShell[g%PAL.towerShell.length]);
     BIO.put(shItem,[gx,gy+tsc*0.04,gz],qEuler(0,yaw,0),[tsc,tsc,tsc],shCol);
     BIO.put('mc_snail_body',[gx,gy,gz],qEuler(0,yaw,0),[tsc,tsc,tsc],chir.sinistral?0xd8d0dc:0x8c7c68);
     counts.towerSnails++;
     if(chir.sinistral)counts.queenSnails++;
    }
   }
  }

  /* Register KHAZ snail:mucusslip along the primary Mucus Silver-Highway */
  if(typeof KHAZ!=='undefined'&&SITE.highways&&SITE.highways.length){
   const wp=SITE.highways[0].pts[Math.floor(SITE.highways[0].pts.length*0.5)];
   const wy0=DRAWN_H(wp[0],wp[1]);
   const mRec={
    id:'matronscoast:mucusslip-'+SKEY,
    name:'Opalescent Mucus Silver-Highway Slip Zone',
    class:'feature',
    at:[wp[0],wy0,wp[1]],
    r:16,
    h:4,
    tags:{biome:'matronscoast',hazard:KHAZ.make(SNAIL_PHYS.hazardSpec('mucusslip'))}
   };
   HAZARDS.push(mRec);
   if(typeof KTAGS!=='undefined'&&KTAGS.page){KTAGS.page.add(mRec);}
  }

  // ---------------------------------------------------------------- 6. Animated Gliding Giant Snails & Slugs on 36-core-walker.js!
  if(typeof BIO.walker==='function'&&typeof BIO.walkAt==='function'&&SITE.highways&&SITE.highways.length){
   const walkerGroup=new T3.Group();
   walkerGroup.name='mc-gliding-molluscs';
   walkerGroup.userData.biome=true;
   scene.add(walkerGroup);

   const ways=SITE.highways;
   for(let wIdx=0;wIdx<ways.length;wIdx++){
    const basePts=ways[wIdx].pts;
    if(basePts.length<3)continue;
    /* Build a smooth closed loop offset slightly out-and-back along the Mucus Silver-Highway */
    const loopPts=[];
    for(let k=0;k<basePts.length;k++){
     loopPts.push([basePts[k][0]+0.9,basePts[k][1]-0.9]);
    }
    for(let k=basePts.length-1;k>=0;k--){
     loopPts.push([basePts[k][0]-0.9,basePts[k][1]+0.9]);
    }
    const stops=[{i:0,d:3.5},{i:basePts.length,d:3.5}];
    const speed=SKEY==='cloudslope'?0.07:0.095;
    const W=BIO.walker(loopPts,stops,speed,1.5,wIdx*19.0,0.45);

    const nOnLoop=SKEY==='browsewood'?4:3;
    for(let m=0;m<nOnLoop;m++){
     const isQueen=(wIdx===0&&m===0&&SKEY!=='cloudslope');
     const isSlug=(m===nOnLoop-1);
     const sc=isSlug?0.74:(SKEY==='cloudslope'?0.58:(isQueen?1.06:0.90+0.12*(m%2)));
     const grp=new T3.Group();
     grp.name='mc-walker:'+(isSlug?'velvet_keelslug':(SKEY==='cloudslope'?'shagshell_snail':'matron_towersnail'));
     grp.userData.biome=true;
     grp.userData.inspectLabel=isQueen
      ?'Sacred Lone-Born Sinistral Queen-Snail (gliding on Mucus Silver-Highway)'
      :(isSlug?'Gliding Velvet Keel-Slug (laying viscoelastic saponin mucus)'
      :(SKEY==='cloudslope'?'Gliding Shag-Shell Mountain Snail':'Gliding Matrons Tower-Snail (0.95 m shell)'));

     let footMesh=null;
     if(isSlug){
      footMesh=new T3.Mesh(MATRON.G.keelSlug,MATRON.M.skinMollusc);
     }else{
      const shGeo=SKEY==='cloudslope'?MATRON.G.shellShag:(isQueen?MATRON.G.shellSin:MATRON.G.shellDex);
      const shMat=SKEY==='cloudslope'?MATRON.M.shellShag:(isQueen?MATRON.M.shellNacre:MATRON.M.shellTower);
      const shMesh=new T3.Mesh(shGeo,shMat);
      shMesh.position.y=0.04;
      shMesh.userData.biome=true;
      shMesh.userData.inspectLabel=grp.userData.inspectLabel;
      grp.add(shMesh);
      footMesh=new T3.Mesh(MATRON.G.snailBody,MATRON.M.skinMollusc);
     }
     footMesh.userData.biome=true;
     footMesh.userData.inspectLabel=grp.userData.inspectLabel;
     grp.add(footMesh);
     grp.scale.set(sc,sc,sc);
     walkerGroup.add(grp);

     const backDist=(m/nOnLoop)*W.L;
     const pose0=BIO.walkAt(W,0,backDist,1.2);
     grp.position.set(pose0.x,DRAWN_H(pose0.x,pose0.z),pose0.z);
     grp.rotation.y=pose0.hd;

     MATRON.WALKERS.push({W:W,back:backDist,grp:grp,foot:footMesh,sc:sc,phase:m*2.1+wIdx});
     counts.walkers++;
    }
   }

   let animT=0;
   tick(dt=>{
    animT+=Math.min(0.1,dt==null?0.016:dt);
    for(let i=0;i<MATRON.WALKERS.length;i++){
     const wk=MATRON.WALKERS[i];
     const p=BIO.walkAt(wk.W,animT,wk.back,1.2);
     const pitch=BIO.walkPitch(wk.W,p.s,0.45);
     const gy=DRAWN_H(p.x,p.z);
     wk.grp.position.set(p.x,gy,p.z);
     wk.grp.rotation.set(pitch,p.hd,0);
     /* Sinusoidal muscular pedal-wave elongation during active glide */
     const wave=1.0+0.055*p.vf*Math.sin(animT*3.2+wk.phase);
     wk.foot.scale.set(1.0/Math.sqrt(wave),1.0,wave);
    }
   });
  }

  return counts;
 };
})();
