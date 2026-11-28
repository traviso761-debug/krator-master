// ================================================================= SPIDER LAKE — deterministic cell-seeded placement ([G data])
// Pure deterministic placement of all 27 Spider Lake species: trees & bamboo (crowncypress, spindlewillow, ambermulberry,
// weepingliquidambar, chinkapinoak, porphyrypine, dolomitebamboo), Hum-Ria arachniculture & warm-seep flora (silkbogmyrtle
// smudge-myrtle, lakelotus, nurserywildrice, dyersindigo, grottocamellia, lakesmokesedge, silkfenpitcher, fensundew,
// porphyryfern, shorespiderlily, bleachfireweed), all 5 pre-terraforming Carnelian Erythrophyll clades + Bleach-Scar
// petrified organ-pipe skeletons (carnelian_organpipe, erythra_veil, bladder_tether, agate_window, blood_strangler),
// and ATMOS wind-pinned Arachneapolita silk architecture (bridgecurtain, broodpavilion, weirframe_wild, rampartgossamer).
// Every cell is seeded independently via KRAND.cell / KRAND.hash; zero Math.random, zero THREE, zero DOM, zero || <number>.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn;
 const C=SPIDERLAKE.C,PAL=SPIDERLAKE.PAL;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.25,rr(-j,j)*0.8,rr(-j,j)*0.8);
  return c;
 };

 SPIDERLAKE.WEIR_SLOTS=[];

 SPIDERLAKE.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'spillway';
  const site=SPIDER_SITES[skey]||SPIDER_SITES.spillway;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?690:opt.R;
  const seedBase=opt.seed==null?5813:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;
  const silkBatch=opt.silkBatch||null;

  SPIDERLAKE.PLACED.length=0;
  SPIDERLAKE.RIGGERS.length=0;

  const st={
   spindlewillow:0,crowncypress:0,ambermulberry:0,chinkapinoak:0,porphyrypine:0,
   weepingliquidambar:0,silkbogmyrtle:0,dolomitebamboo:0,lakelotus:0,nurserywildrice:0,
   dyersindigo:0,grottocamellia:0,lakesmokesedge:0,silkfenpitcher:0,fensundew:0,
   porphyryfern:0,shorespiderlily:0,bleachfireweed:0,
   carnelian_organpipe:0,erythra_veil:0,bladder_tether:0,agate_window:0,blood_strangler:0,
   bridgecurtain:0,broodpavilion:0,weirframe_wild:0,rampartgossamer:0,
   carnelianRelicts:0,bleachSkeletons:0,boulders:0,celestine:0,airbells:0
  };

  const free=(x,z,r)=>!sp||!sp.some(x,z,r,it=>Math.hypot(x-it.x,z-it.z)<it.r+r);
  const claim=(kind,x,z,r)=>{if(sp)sp.insert({kind:kind,x:x,z:z,r:r},x,z,r);};
  const inReserveCore=(x,z)=>{
   if(!site.reserves||!site.reserves.length)return false;
   for(let i=0;i<site.reserves.length;i++){
    const rv=site.reserves[i];
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.72)return true;
   }
   return false;
  };
  const inGrottoHole=(x,z)=>{
   if(skey!=='dolomite'||!site.grotto)return false;
   return Math.hypot(x-site.grotto.portal[0],z-site.grotto.portal[1])<16.0;
  };

  const seed=KRAND.child(seedBase,'spiderlake/'+skey);
  const Lv=BIO.LOD(),c0=BIO.center();
  const wMs=Math.hypot(site.wind[0],site.wind[1]);

  function smokeAtPoint(x,y){
   const asl=site.baseElevM+y;
   const elevAbove=asl-SPIDER_PHYS.CONST.LAKE_DATUM_M;
   const shoreD=site.hasOpenLake?(y<=0.2?0:site.shoreDistBaseM+Math.max(0,y)*6.2):site.shoreDistBaseM;
   return SPIDER_PHYS.lakeSmokeAt({
    shoreDistM:shoreD,elevAboveLakeM:elevAbove,seepProximity01:site.seepProximity01,hour24:18.5,windOnshore01:0.78
   });
  }

  function frontierAtPoint(x,y,z){
   return SPIDER_PHYS.frontierAt({
    station:skey,
    x:x,y:y,z:z,
    rock01:BIO.field('rock',x,z),
    slope01:BIO.field('slope',x,z),
    wet01:BIO.field('wet',x,z),
    swath:site.bleachSwath||null,
    seed:seed
   });
  }

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   SPIDERLAKE.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
  }

  const cellPass=(cell,salt,maxD,allowWet,fn)=>{
   const N=Math.ceil(R*2/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const x=c0[0]-R+(ix+0.5)*cell,z=c0[1]-R+(iz+0.5)*cell;
    if(Math.hypot(x-c0[0],z-c0[1])>R)continue;
    const ld=BIO.lodD(x,z);
    if(ld>maxD)continue;
    reseed(KRAND.cell(seed+salt,ix,iz));
    const px=x+rr(-0.46,0.46)*cell,pz=z+rr(-0.46,0.46)*cell;
    if(inGrottoHole(px,pz))continue;
    if(!allowWet&&BIO.mask(px,pz)<=0)continue;
    const py=Y(px,pz),wy=W(px,pz);
    fn(px,py,pz,wy,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0,KRAND.hash(seed+salt,ix,iz));
   }
  };

  // ---------------------------------------------------------------- 1. HERO GOLDEN DRAGLINE BRIDGE-CURTAINS (Stations 1-5; strictly 0 on rampart!)
  if(site.curtainSpans&&site.curtainSpans.length){
   for(let i=0;i<site.curtainSpans.length;i++){
    const cs=site.curtainSpans[i];
    const mx=0.5*(cs.a[0]+cs.b[0]),my=0.5*(cs.a[1]+cs.b[1]),mz=0.5*(cs.a[2]+cs.b[2]);
    const sm=smokeAtPoint(mx,0);
    if(!sm.eusocialOk||sm.midgeFluxGm2Day<12.0)continue;
    const spanM=Math.hypot(cs.b[0]-cs.a[0],cs.b[2]-cs.a[2]);
    if(reg){
     reg({
      tagId:'spiderlake:'+cs.id,
      name:'Golden Dragline Bridge-Curtain ('+cs.id+', '+Math.round(spanM)+' m span)',
      tagClass:'feature',
      x:mx,y:my-cs.dropM,z:mz,r:spanM*0.52,h:cs.dropM+6,
      tags:{biome:'spiderlake',species:'bridgecurtain',gather:'spider-silk-cable',boatArch:!!cs.boatArch}
     });
    }
    let aeroInfo=null;
    if(silkBatch){
     aeroInfo=silkBatch.addBridgeCurtain(cs,wMs).aero;
    }
    // Place Rigger caste workers along anchor collars (peaceful zero-kill colony)
    for(let k=0;k<6;k++){
     reseed(KRAND.hash(seed+901,i,k));
     const t=k<3?rr(0.02,0.12):rr(0.88,0.98);
     const rx=lerp(cs.a[0],cs.b[0],t),ry=lerp(cs.a[1],cs.b[1],t)-rr(0.2,1.4),rz=lerp(cs.a[2],cs.b[2],t);
     BIO.put('sl_rigger',[rx,ry,rz],qEuler(0,rr(0,TAU),0),[0.16,0.12,0.22],C(PAL.rigger[k%PAL.rigger.length]));
    }
    recordPlaced('bridgecurtain',mx,my,mz,'narrows',{
     spanM:+spanM.toFixed(1),
     midgeFlux:sm.midgeFluxGm2Day,
     boatClearM:aeroInfo?aeroInfo.boatClearanceM:cs.clearMinM
    });
    st.bridgecurtain++;
   }
  }

  // ---------------------------------------------------------------- 2. KARST DOLOMITE PINNACLES, CELESTINE CRYSTALS & EJECTA MEGABLOCKS
  if(site.stacks&&site.stacks.length){
   for(let i=0;i<site.stacks.length;i++){
    const sk=site.stacks[i];
    if(reg){
     reg({
      tagId:'spiderlake:'+sk.id,
      name:(sk.rock==='dolomite'?'Cream Dolomite Karst Pinnacle':'Secondary-Ejecta Megabreccia Stack')+' ('+sk.id+')',
      tagClass:'feature',
      x:sk.x,y:-2,z:sk.z,r:sk.r,h:sk.top+4,
      tags:{biome:'spiderlake',rock:sk.rock}
     });
    }
    for(let k=0;k<14;k++){
     reseed(KRAND.hash(seed+810,i,k));
     const ang=(k/14)*TAU+rr(-0.2,0.2),rad=sk.r*rr(0.22,0.92);
     const bx=sk.x+Math.cos(ang)*rad,bz=sk.z+Math.sin(ang)*rad,by=Y(bx,bz);
     const sc=rr(1.6,4.2);
     const item=sk.rock==='dolomite'?'sl_rock_dolomite':'sl_rock_ejecta';
     const pal=sk.rock==='dolomite'?PAL.dolomite:PAL.ejecta;
     BIO.put(item,[bx,by-sc*0.28,bz],qEuler(rr(-0.18,0.18),rr(0,TAU),rr(-0.18,0.18)),[sc*1.1,sc*(sk.rock==='dolomite'?1.45:0.95),sc],pickC(pal,0.02));
     st.boulders++;
     if(sk.rock==='dolomite'&&k%3===0){
      const ch=rr(0.85,2.1);
      BIO.put('sl_crystal_celestine',[bx+rr(-0.6,0.6),by+sc*0.25,bz+rr(-0.6,0.6)],qEuler(rr(-0.35,0.35),rr(0,TAU),rr(-0.35,0.35)),[ch*0.42,ch,ch*0.42],C(0xcce8f8));
      st.celestine++;
     }
    }
   }
  }

  // Thermal-pool travertine sinter rims & dolomite grotto celestine floor prisms
  if(site.thermalPools&&site.thermalPools.length){
   for(let pi=0;pi<site.thermalPools.length;pi++){
    const tp=site.thermalPools[pi];
    for(let k=0;k<4;k++){
     reseed(KRAND.hash(seed+815,pi,k));
     const ang=(k/4)*TAU+rr(-0.2,0.2),rad=tp.r+rr(0.4,1.6);
     const tx=tp.x+Math.cos(ang)*rad,tz=tp.z+Math.sin(ang)*rad,ty=Y(tx,tz);
     const sc=rr(1.0,1.9);
     BIO.put('sl_rock_travertine',[tx,ty-sc*0.18,tz],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[sc*1.15,sc*0.42,sc],pickC(PAL.travertine,0.02));
     st.boulders++;
    }
   }
  }
  if(skey==='dolomite'&&site.grotto){
   for(let k=0;k<6;k++){
    reseed(KRAND.hash(seed+819,k,1));
    const ang=(k/6)*TAU,rad=rr(4.5,9.5);
    const gx=site.grotto.hall[0]+Math.cos(ang)*rad,gz=site.grotto.hall[1]+Math.sin(ang)*rad;
    const ch=rr(0.9,2.1);
    BIO.put('sl_crystal_celestine',[gx,site.grotto.floorY+0.25,gz],qEuler(rr(-0.28,0.28),ang,rr(-0.28,0.28)),[ch*0.42,ch,ch*0.42],C(0xcce8f8));
    st.celestine++;
   }
  }

  // Scattered ejecta megablocks (dense on Station 6 rampart & Station 1 spillway), dolomite ribs, porphyry dike blocks & travertine sinter
  cellPass(skey==='rampart'?18:26,11,Lv.mid,false,(x,y,z,wy,lv)=>{
   if(inReserveCore(x,z)||(wy>-1e8&&y<wy-0.3))return;
   const rockW=BIO.field('rock',x,z),porphW=BIO.field('porphyry',x,z),travW=BIO.field('travertine',x,z);
   const pBase=skey==='rampart'?0.62:(0.14+0.42*rockW+0.45*porphW+0.35*travW);
   if(rng()>pBase*q||!free(x,z,2.2))return;
   let item='sl_rock_ejecta',pal=PAL.ejecta,sc=rr(1.4,skey==='rampart'?5.4:3.2),tall=0.85;
   if(site.thermalPools&&site.thermalPools.length&&travW>0.35){item='sl_rock_travertine';pal=PAL.travertine;sc=rr(1.1,2.4);tall=0.45;}
   else if(skey==='dolomite'&&porphW>0.24&&rng()<0.38){item='sl_rock_galena';pal=PAL.ejecta;sc=rr(0.95,2.0);tall=0.78;}
   else if(porphW>0.35||(skey==='pavilion'&&y>16&&rng()<0.42)){item='sl_rock_porphyry';pal=PAL.porphyry;sc=rr(1.2,2.8);tall=0.82;}
   else if((skey==='dolomite'&&!(y>24&&rng()<0.38))||(skey==='fen'&&rng()<0.55)){item='sl_rock_dolomite';pal=PAL.dolomite;sc=rr(1.5,3.8);tall=1.35;}
   claim('boulder',x,z,sc*0.75);
   BIO.put(item,[x,y-sc*0.26,z],qEuler(rr(-0.2,0.2),rr(0,TAU),rr(-0.2,0.2)),[sc,sc*tall,sc*rr(0.85,1.15)],pickC(pal,0.02));
   st.boulders++;
   if(item==='sl_rock_dolomite'&&skey==='dolomite'&&rng()<0.35){
    const ch=rr(0.7,1.8);
    BIO.put('sl_crystal_celestine',[x+rr(-0.5,0.5),y+sc*0.25,z+rr(-0.5,0.5)],qEuler(rr(-0.3,0.3),rr(0,TAU),rr(-0.3,0.3)),[ch*0.4,ch,ch*0.4],C(0xcce8f8));
    st.celestine++;
   }
  });

  // ---------------------------------------------------------------- 3. TREES: CROWNCYPRESS, SPINDLEWILLOW, AMBERMULBERRY, OAK & PINE
  const heroForks=[];

  // 3A. Littoral Buttressed Bald-Cypress (crowncypress) standing in 0-1.15 m calm turquoise lake margins (strictly 0 in river/spillway channels!)
  if(skey!=='rampart'){
   cellPass(22,21,Lv.far,true,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0)return;
    if(skey==='spillway'&&x<8)return;
    const sub=wy>-1e8?(wy-y):-1.0;
    if(sub>1.15||sub<-2.4||y>8.5)return;
    if(BIO.field('slope',x,z)>0.52||BIO.field('travertine',x,z)>0.45)return;
    const litBoost=(sub>=-0.8&&sub<=1.10)?1.0:smooth(8.5,1.5,y)*0.55;
    if(rng()>0.56*litBoost*q||!free(x,z,4.6))return;
    claim('crowncypress',x,z,4.6);
    const wetFeet=sub>-0.45&&lv>=1;
    const g=SPIDERLAKE.growTree('crowncypress',x,y,z,hSeed,rr(0.86,1.14),{wetFeet:wetFeet});
    if(Math.hypot(x,z)<240&&g.forks.length>=2){
     heroForks.push({x:x,y:y,z:z,kind:'crowncypress',forks:g.forks,crownY:g.crownY});
    }
    recordPlaced('crowncypress',x,y,z,'narrows',{wetFeet:wetFeet,knees:g.knees});
    st.crowncypress++;
   });
  }

  // 3B. Supple Whorled Spindle-Willow (spindlewillow) on moist dry benches & shores (strictly above water & clear of river channels!)
  if(skey!=='rampart'){
   cellPass(skey==='pavilion'?18:22,22,Lv.far,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.35)||y>24.0)return;
    if(BIO.field('slope',x,z)>0.50||BIO.field('travertine',x,z)>0.40)return;
    if(frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const pW=skey==='pavilion'?(y<17.5?0.68:0.28):0.42*smooth(24.0,2.0,y);
    if(rng()>pW*q||!free(x,z,3.6))return;
    claim('spindlewillow',x,z,3.6);
    const g=SPIDERLAKE.growTree('spindlewillow',x,y,z,hSeed,rr(0.88,1.15),{});
    if(Math.hypot(x,z)<240&&g.forks.length>=2){
     heroForks.push({x:x,y:y,z:z,kind:'spindlewillow',forks:g.forks,crownY:g.crownY});
    }
    recordPlaced('spindlewillow',x,y,z,'pavilion_wood',null);
    st.spindlewillow++;
   });
  }

  // 3C. Nectar Amber-Mulberry (ambermulberry) in structured rows on SITE.terraces + wild bench groves (dry land only!)
  if(site.terraces&&site.terraces.length){
   for(let ti=0;ti<site.terraces.length;ti++){
    const tr=site.terraces[ti];
    for(let rx=-96;rx<=96;rx+=16){
     const hSeed=KRAND.hash(seed+310,ti,rx+200);
     reseed(hSeed);
     const mx=rx+rr(-1.4,1.4),mz=tr.z+rr(-2.5,2.5),my=Y(mx,mz),mwy=W(mx,mz);
     if(BIO.field('river',mx,mz)>0||(mwy>-1e8&&my<mwy+0.45)||!free(mx,mz,3.0))continue;
     claim('ambermulberry',mx,mz,3.0);
     SPIDERLAKE.growTree('ambermulberry',mx,my,mz,hSeed,rr(0.92,1.12),{});
     recordPlaced('ambermulberry',mx,my,mz,'spindle_terrace',{terrace:ti});
     st.ambermulberry++;
    }
   }
  }
  if(skey!=='rampart'){
   cellPass(23,23,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.45)||y<2.8||y>38.0||BIO.field('slope',x,z)>0.46||BIO.field('travertine',x,z)>0.3)return;
    if(frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const pM=skey==='pavilion'?0.34:0.26;
    if(rng()>pM*q||!free(x,z,3.2))return;
    claim('ambermulberry',x,z,3.2);
    SPIDERLAKE.growTree('ambermulberry',x,y,z,hSeed,rr(0.85,1.15),{});
    recordPlaced('ambermulberry',x,y,z,'spindle_terrace',null);
    st.ambermulberry++;
   });
  }

  // 3C-bis. Weeping Ria-Amber Sweetgum (weepingliquidambar: bark.amber + card.samara.maple) on lakeside & bench woods bridging toward Weeping Valley
  if(skey!=='rampart'){
   cellPass(26,25,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.55))return;
    if(skey==='spillway'&&x<12)return;
    if(y<2.2||y>32.0||BIO.field('slope',x,z)>0.48||BIO.field('travertine',x,z)>0.32)return;
    if(frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const pL=(skey==='pavilion'||skey==='haugel')?0.36:0.28;
    if(rng()>pL*q||!free(x,z,3.8))return;
    claim('weepingliquidambar',x,z,3.8);
    const g=SPIDERLAKE.growTree('weepingliquidambar',x,y,z,hSeed,rr(0.86,1.14),{});
    if(Math.hypot(x,z)<220&&g.forks.length>=2){
     heroForks.push({x:x,y:y,z:z,kind:'weepingliquidambar',forks:g.forks,crownY:g.crownY});
    }
    recordPlaced('weepingliquidambar',x,y,z,'pavilion_wood',null);
    st.weepingliquidambar++;
   });
  }

  // 3C-ter. Karst Jade-Culm Bamboo (dolomitebamboo: bark.bamboo.jade + card.grass.panic) on narrows, dolomite & haugel karst banks
  if(skey==='narrows'||skey==='dolomite'||skey==='haugel'){
   cellPass(19,26,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.50))return;
    if(y<1.4||y>26.0||BIO.field('slope',x,z)>0.54||BIO.field('travertine',x,z)>0.35)return;
    if(frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const pB=skey==='dolomite'?0.44:(skey==='narrows'?0.38:0.32);
    if(rng()>pB*q||!free(x,z,2.4))return;
    claim('dolomitebamboo',x,z,2.4);
    SPIDERLAKE.growBamboo(x,y,z,hSeed,rr(0.85,1.16));
    recordPlaced('dolomitebamboo',x,y,z,'narrows',null);
    st.dolomitebamboo++;
   });
  }

  // 3D-bis. SW->NE Carnelian Frontier & Ballistic Ejecta Relicts (30% Red, Tier 1-2; docs/CARNELIAN-FRONTIER-PLAN.md):
  //   - Station 7 haugel: all 5 Carnelian clades on dry secondary-ejecta gorge walls above green ambermulberry benches +
  //     orbital Bleach-Scar survey seam with petrified organ-pipe skeletons (petrified: true), blood_strangler seam & bleachfireweed!
  //   - Station 6 rampart (+2,040 m boulder-collar) & Station 1 spillway high dry ejecta stacks: edaphic agate_window, erythra_veil & carnelian_organpipe!
  if(site.carnelianWalls&&typeof KFRONTIER!=='undefined'){
   // Orbital Bleach-Scar tri-band seam on dry SE Hau-Gel bench (x0: 88, z0: 118)
   if(site.bleachSwath){
    cellPass(8.5,27,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
     if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+2.0))return;
     const fq=frontierAtPoint(x,y,z);
     if(fq.bleachScar01>=0.42&&free(x,z,2.0)){
      if(rng()<0.64*q){
       claim('bleach-skel',x,z,2.0);
       SPIDERLAKE.growCarnelian('carnelian_organpipe',x,y,z,hSeed,rr(0.72,1.06),{petrified:true,useInstSkel:lv===0});
       recordPlaced('carnelian_organpipe',x,y,z,'bleach_scar',{biosphere:'carnelian',clade:'carnelian-organpipe',petrified:true});
       st.carnelian_organpipe++;
       st.bleachSkeletons++;
       st.carnelianRelicts++;
      }else if(rng()<0.75*q){
       SPIDERLAKE.growCarnelian('agate_window',x,y,z,hSeed,rr(0.75,1.15),{petrified:true});
       recordPlaced('agate_window',x,y,z,'bleach_scar',{biosphere:'carnelian',clade:'agate-window',petrified:true});
       st.agate_window++;
       st.carnelianRelicts++;
      }
     }else if(fq.stranglerEdge01>=0.16&&free(x,z,1.8)&&rng()<0.78*q){
      claim('blood_strangler',x,z,1.8);
      SPIDERLAKE.growCarnelian('blood_strangler',x,y,z,hSeed,rr(0.82,1.25),{});
      recordPlaced('blood_strangler',x,y,z,'bleach_scar',{biosphere:'carnelian',clade:'blood-strangler'});
      st.blood_strangler++;
      st.carnelianRelicts++;
     }
    });
    if(reg&&(st.bleachSkeletons>0||st.blood_strangler>0)){
     reg({
      tagId:'spiderlake:haugel-bleach-scar',
      name:'Hau-Gel Orbital Survey Bleach-Scar Seam and Petrified Organ-Pipe Skeletons',
      tagClass:'feature',
      x:site.bleachSwath.x0,y:Y(site.bleachSwath.x0,site.bleachSwath.z0)-4,z:site.bleachSwath.z0,r:48,h:24,
      tags:{biome:'spiderlake',biosphere:'bleach',ecocideTier:2,clades:'carnelian-organpipe,blood-strangler'}
     });
    }
   }

   // Dry secondary-ejecta gorge walls above green ambermulberry benches: all 5 Carnelian clades!
   cellPass(14.5,28,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+2.0))return;
    if(y<15.0||Math.abs(z)<44.0||!free(x,z,3.0))return;
    const fq=frontierAtPoint(x,y,z);
    if(fq.bleachScar01>=0.42)return;
    if(rng()>0.72*q)return;
    claim('carnelian',x,z,3.0);
    const sc=rr(0.84,1.18),roll=rng();
    if(y<20.5&&roll<0.18){
     SPIDERLAKE.growCarnelian('blood_strangler',x,y,z,hSeed,sc,{});
     recordPlaced('blood_strangler',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'blood-strangler'});
     st.blood_strangler++;
    }else if(roll<0.44){
     SPIDERLAKE.growCarnelian('bladder_tether',x,y,z,hSeed,sc,{});
     recordPlaced('bladder_tether',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'bladder-kelp-land'});
     st.bladder_tether++;
    }else if(roll<0.72){
     SPIDERLAKE.growCarnelian('erythra_veil',x,y,z,hSeed,sc,{});
     recordPlaced('erythra_veil',x,y,z, 'carnelian_ejecta',{biosphere:'carnelian',clade:'erythra-veil'});
     st.erythra_veil++;
    }else if(roll<0.88){
     SPIDERLAKE.growCarnelian('carnelian_organpipe',x,y,z,hSeed,sc,{});
     recordPlaced('carnelian_organpipe',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'carnelian-organpipe'});
     st.carnelian_organpipe++;
    }else{
     SPIDERLAKE.growCarnelian('agate_window',x,y,z,hSeed,rr(0.88,1.32),{});
     recordPlaced('agate_window',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'agate-window'});
     st.agate_window++;
    }
    st.carnelianRelicts++;
   });
   if(reg&&st.carnelianRelicts>0){
    reg({
     tagId:'spiderlake:haugel-carnelian-cliffs',
     name:'Hau-Gel Dry Secondary-Ejecta Carnelian Erythrophyll Cliff Refugia',
     tagClass:'flora',
     x:68,y:Y(68,86)-4,z:86,r:62,h:32,
     tags:{biome:'spiderlake',biosphere:'carnelian',lithology:'secondary-ejecta'}
    });
   }
  }

  // Station 6 rampart (+2,040 m dry ballistic secondary-ejecta boulder-collar): edaphic relict agate_window, erythra_veil & carnelian_organpipe
  if(site.carnelianEjecta&&typeof KFRONTIER!=='undefined'){
   cellPass(15.5,29,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||!free(x,z,2.6))return;
    const fq=frontierAtPoint(x,y,z);
    const onDryCrest=fq.biosphere==='carnelian'||(y>15.0&&BIO.field('rock',x,z)>0.28);
    if(!onDryCrest||rng()>0.58*q)return;
    claim('carnelian',x,z,2.6);
    const sc=rr(0.82,1.18),roll=rng();
    if(roll<0.45){
     SPIDERLAKE.growCarnelian('agate_window',x,y,z,hSeed,rr(0.85,1.35),{});
     recordPlaced('agate_window',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'agate-window'});
     st.agate_window++;
    }else if(roll<0.78){
     SPIDERLAKE.growCarnelian('erythra_veil',x,y,z,hSeed,sc,{});
     recordPlaced('erythra_veil',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'erythra-veil'});
     st.erythra_veil++;
    }else{
     SPIDERLAKE.growCarnelian('carnelian_organpipe',x,y,z,hSeed,sc*0.92,{});
     recordPlaced('carnelian_organpipe',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'carnelian-organpipe'});
     st.carnelian_organpipe++;
    }
    st.carnelianRelicts++;
   });
   if(reg&&st.carnelianRelicts>0){
    reg({
     tagId:'spiderlake:rampart-carnelian-ejecta',
     name:'North Rampart Ballistic Ejecta Carnelian Relict Colony',
     tagClass:'flora',
     x:12,y:Y(12,4)-4,z:4,r:64,h:28,
     tags:{biome:'spiderlake',biosphere:'carnelian',lithology:'secondary-ejecta'}
    });
   }
  }

  // Station 1 spillway: edaphic Carnelian relicts on high dry secondary-ejecta stacks & dry gorge-rim crowns
  if(site.carnelianStacks&&typeof KFRONTIER!=='undefined'){
   if(site.stacks){
    for(let si=0;si<site.stacks.length;si++){
     const sk=site.stacks[si];
     if(sk.rock!=='ejecta')continue;
     for(let k=0;k<5;k++){
      const hSeed=KRAND.hash(seed+295,si,k);
      reseed(hSeed);
      const ang=(k/5)*TAU+rr(-0.25,0.25),rad=sk.r*rr(0.18,0.52);
      const cx=sk.x+Math.cos(ang)*rad,cz=sk.z+Math.sin(ang)*rad,cy=Y(cx,cz);
      if(cy<13.5||!free(cx,cz,2.2))continue;
      claim('carnelian',cx,cz,2.2);
      if(k%3===0){
       SPIDERLAKE.growCarnelian('agate_window',cx,cy,cz,hSeed,rr(0.85,1.25),{});
       recordPlaced('agate_window',cx,cy,cz,'carnelian_ejecta',{biosphere:'carnelian',stack:sk.id});
       st.agate_window++;
      }else if(k%3===1){
       SPIDERLAKE.growCarnelian('erythra_veil',cx,cy,cz,hSeed,rr(0.80,1.08),{});
       recordPlaced('erythra_veil',cx,cy,cz,'carnelian_ejecta',{biosphere:'carnelian',stack:sk.id});
       st.erythra_veil++;
      }else{
       SPIDERLAKE.growCarnelian('carnelian_organpipe',cx,cy,cz,hSeed,rr(0.76,1.02),{});
       recordPlaced('carnelian_organpipe',cx,cy,cz,'carnelian_ejecta',{biosphere:'carnelian',stack:sk.id});
       st.carnelian_organpipe++;
      }
      st.carnelianRelicts++;
     }
    }
   }
   cellPass(19.0,30,Lv.mid,false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||x>-32||Math.abs(z)<58||y<18.5||!free(x,z,2.8))return;
    if(rng()>0.48*q)return;
    claim('carnelian',x,z,2.8);
    const roll=rng();
    if(roll<0.46){
     SPIDERLAKE.growCarnelian('agate_window',x,y,z,hSeed,rr(0.85,1.28),{});
     recordPlaced('agate_window',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'agate-window'});
     st.agate_window++;
    }else if(roll<0.80){
     SPIDERLAKE.growCarnelian('erythra_veil',x,y,z,hSeed,rr(0.82,1.12),{});
     recordPlaced('erythra_veil',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'erythra-veil'});
     st.erythra_veil++;
    }else{
     SPIDERLAKE.growCarnelian('carnelian_organpipe',x,y,z,hSeed,rr(0.78,1.05),{});
     recordPlaced('carnelian_organpipe',x,y,z,'carnelian_ejecta',{biosphere:'carnelian',clade:'carnelian-organpipe'});
     st.carnelian_organpipe++;
    }
    st.carnelianRelicts++;
   });
  }

  // 3D. Upland Chinkapin Oak & Porphyry Rim-Pine (Stations 1-7; dominant woody matrix on dolomite bluffs & +2,040 m Earth pockets!)
  cellPass(skey==='rampart'?22:27,24,Lv.far,false,(x,y,z,wy,lv,hSeed)=>{
   if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.60))return;
   const minOakY=skey==='fen'?4.5:11.5;
   if(skey!=='rampart'&&y<minOakY)return;
   if(frontierAtPoint(x,y,z).biosphere!=='earth')return;
   const slope=BIO.field('slope',x,z);
   if(slope>0.58||!free(x,z,3.8))return;
   const pU=skey==='rampart'?0.48:(skey==='dolomite'?0.52:0.34*smooth(minOakY,24,y));
   if(rng()>pU*q)return;
   const isPine=rng()<(skey==='rampart'||BIO.field('porphyry',x,z)>0.3?0.56:0.38);
   const kind=isPine?'porphyrypine':'chinkapinoak';
   claim(kind,x,z,3.8);
   SPIDERLAKE.growTree(kind,x,y,z,hSeed,rr(0.82,1.12),{
    windLeanX:skey==='rampart'?0.08:0.02,
    windLeanZ:skey==='rampart'?0.04:0.01
   });
   if(!isPine&&rng()<0.45){
    const lx=x+rr(-2.4,2.4),lz=z+rr(-2.4,2.4),ly=Y(lx,lz);
    BIO.put('sl_log',[lx,ly+0.06,lz],qEuler(Math.PI*0.5,rr(0,TAU),0),[0.85,rr(1.8,3.2),0.85],C(0x6e5c4a));
   }
   recordPlaced(kind,x,y,z,'rim_rampart',null);
   st[kind]++;
  });

  // ---------------------------------------------------------------- 4. BROOD-PAVILION DOMES, CANOPY GOSSAMER SHEETS & SUBMERGED AIR-BELLS
  // Strictly gated by SPIDER_PHYS.lakeSmokeAt(...).eusocialOk (midgeFluxGm2Day >= 12.0 -> 0 on +2,040 m North Rampart!)
  if(heroForks.length){
   const maxPav=skey==='pavilion'?34:skey==='narrows'?22:16;
   for(let i=0;i<heroForks.length&&st.broodpavilion<maxPav;i++){
    const tf=heroForks[i];
    const sm=smokeAtPoint(tf.x,tf.y);
    if(!sm.eusocialOk||sm.midgeFluxGm2Day<12.0)continue;
    reseed(KRAND.hash(seed+410,i,1));
    if(skey!=='pavilion'&&rng()>0.62)continue;
    const fk=tf.forks[0];
    const rad=rr(1.35,2.65),hDome=rad*rr(0.72,0.95);
    BIO.put('sl_pavilion_dome',[fk[0],fk[1],fk[2]],qEuler(0,rr(0,TAU),0),[rad,hDome,rad],pickC(PAL.pavilion,0.02));
    for(let lb=0;lb<2;lb++){
     const ang=rr(0,TAU),ox=Math.cos(ang)*rad*0.58,oz=Math.sin(ang)*rad*0.58;
     BIO.put('sl_pavilion_lobe',[fk[0]+ox,fk[1]-0.22,fk[2]+oz],qEuler(0,ang,0),[rad*0.52,hDome*0.68,rad*0.52],pickC(PAL.pavilion,0.02));
    }
    if(silkBatch&&tf.forks.length>=2){
     const f2=tf.forks[1];
     silkBatch.pushCable([[fk[0],fk[1]+hDome*0.35,fk[2]],[f2[0],f2[1],f2[2]]],0.028,[0.95,0.88,0.62],[[0,0,0],[0,0,0]]);
    }
    if(reg&&st.broodpavilion<8){
     reg({
      tagId:'spiderlake:pavilion-'+skey+'-'+st.broodpavilion,
      name:'Arachneapolita Insulated Cloud-Fleece Brood-Pavilion',
      tagClass:'feature',
      x:fk[0],y:fk[1]-1,z:fk[2],r:rad+1.5,h:hDome+2.5,
      tags:{biome:'spiderlake',species:'broodpavilion',gather:'spider-silk-fleece',inviolate:true}
     });
    }
    recordPlaced('broodpavilion',fk[0],fk[1],fk[2],'pavilion_wood',{midgeFlux:sm.midgeFluxGm2Day,kind:'canopy-dome'});
    st.broodpavilion++;
   }

   // Connect neighboring cypress & willow crowns with silvery-gold communal gossamer canopy sheets!
   if(silkBatch){
    let sheets=0;
    const maxSheets=skey==='pavilion'?22:skey==='narrows'?16:12;
    for(let i=0;i<heroForks.length&&sheets<maxSheets;i++){
     const A=heroForks[i];
     const sm=smokeAtPoint(A.x,A.y);
     if(!sm.eusocialOk)continue;
     let bestJ=-1,bestD=1e9;
     for(let j=i+1;j<heroForks.length;j++){
      const B=heroForks[j],d=Math.hypot(B.x-A.x,B.z-A.z);
      if(d>=11.0&&d<=38.0&&d<bestD){bestD=d;bestJ=j;}
     }
     if(bestJ>=0){
      const B=heroForks[bestJ];
      const dx=B.x-A.x,dz=B.z-A.z,L=Math.hypot(dx,dz),nx=-dz/L*2.4,nz=dx/L*2.4;
      const ay=A.forks[0][1],by=B.forks[0][1];
      silkBatch.addCanopySheet(
       [A.x+nx,ay,A.z+nz],
       [B.x+nx,by,B.z+nz],
       [B.x-nx,by-0.35,B.z-nz],
       [A.x-nx,ay-0.35,A.z-nz],
       0.65+0.03*bestD
      );
      sheets++;
     }
    }
   }
  }

  // Submerged & half-emergent glistening pearl-silver Diving-Bell Air-Bell Silk Domes in calm turquoise fen & littoral shallows!
  if(skey!=='rampart'){
   cellPass(skey==='fen'?11:16,42,Lv.mid,true,(x,y,z,wy,lv)=>{
    if(wy<-1e8)return;
    const depth=wy-y;
    if(depth<0.18||depth>1.65)return;
    if(skey==='spillway'&&x<-12)return;
    const sm=smokeAtPoint(x,0);
    if(!sm.eusocialOk)return;
    const pBell=skey==='fen'?0.58:skey==='narrows'?0.42:0.32;
    if(rng()>pBell*q)return;
    const nB=lv===2?ri(2,3):1;
    for(let k=0;k<nB;k++){
     const bx=x+rr(-1.6,1.6),bz=z+rr(-1.6,1.6),by=Y(bx,bz),bw=W(bx,bz);
     if(bw<-1e8||bw-by<0.15||bw-by>1.8)continue;
     const rad=rr(0.48,1.15),hB=rad*rr(0.75,1.05);
     // Crown gleams right at / just beneath the turquoise water surface, anchored to sedge/cypress roots below
     const bellY=bw-hB*rr(0.32,0.68);
     BIO.put('sl_airbell',[bx,bellY,bz],qEuler(0,rr(0,TAU),0),[rad,hB,rad],pickC(PAL.airbell,0.02));
     if(silkBatch&&lv>=1){
      silkBatch.pushCable([[bx,by,bz],[bx,bellY+hB*0.35,bz]],0.018,[0.92,0.94,0.88],[[0,0,0],[0,0,0]]);
     }
     st.airbells++;
    }
    recordPlaced('broodpavilion',x,wy,z,'fumarole_fen',{midgeFlux:sm.midgeFluxGm2Day,kind:'airbell'});
    st.broodpavilion++;
   });
  }

  // ---------------------------------------------------------------- 5. TENDED SPINDLE-WEIR SHEETS & HUM-RIA SHRUBS
  if(skey!=='rampart'){
   const slots=SPIDERLAKE.WEIR_SLOTS;
   if(slots&&slots.length){
    for(let i=0;i<slots.length;i++){
     const sl=slots[i];
     const sm=smokeAtPoint(sl.x,sl.y);
     if(!sm.eusocialOk)continue;
     if(silkBatch){
      silkBatch.addWeirSheet(sl.x,sl.y,sl.z,sl.yaw,sl.innerW,sl.innerH);
     }
     BIO.put('sl_weir_node',[sl.x,sl.y+sl.innerH+0.09,sl.z],qEuler(0,sl.yaw,0),[0.22,0.18,0.22],C(0xf2dc96));
     // Record Rigger spider position for peaceful Hum & smudge retreat animation
     const rx=sl.x+Math.cos(sl.yaw)*0.35,ry=sl.y+sl.innerH*0.55,rz=sl.z+Math.sin(sl.yaw)*0.35;
     BIO.put('sl_rigger',[rx,ry,rz],qEuler(0,sl.yaw,0),[0.15,0.11,0.20],C(PAL.rigger[i%PAL.rigger.length]));
     SPIDERLAKE.RIGGERS.push({x:rx,y:ry,z:rz,frameIdx:i});
     recordPlaced('weirframe_wild',sl.x,sl.y,sl.z,'spindle_terrace',{slotClearM:sl.slotClearM});
     st.weirframe_wild++;
    }
   }else{
    // Wild willow-fork spindle sheets when ?works=0 disables cedar frames
    for(let i=0;i<Math.min(8,heroForks.length);i++){
     const hf=heroForks[i],sm=smokeAtPoint(hf.x,hf.y);
     if(!sm.eusocialOk)continue;
     if(silkBatch)silkBatch.addWeirSheet(hf.x+1.8,hf.y+1.4,hf.z,i*0.7,2.6,1.8);
     BIO.put('sl_weir_node',[hf.x+1.8,hf.y+3.25,hf.z],qEuler(0,i*0.7,0),[0.20,0.16,0.20],C(0xf2dc96));
     recordPlaced('weirframe_wild',hf.x+1.8,hf.y+1.4,hf.z,'spindle_terrace',{slotClearM:0.08});
     st.weirframe_wild++;
    }
   }

   // 5B. Canonical Hum-Ria Smudge Bog-Myrtle (silkbogmyrtle: card.dwarfbirch + shared sl_willow stems) along weir benches & fen margins
   cellPass(15.5,51,Lv.floor[1],false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.25)||y>26.0)return;
    if(BIO.field('slope',x,z)>0.46||frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const wet=BIO.field('wet',x,z),terr=BIO.field('terrace',x,z);
    const pMy=0.22+0.36*Math.max(wet,terr);
    if(rng()>pMy*q||!free(x,z,1.5))return;
    claim('silkbogmyrtle',x,z,1.5);
    SPIDERLAKE.growShrub('silkbogmyrtle',x,y,z,hSeed,rr(0.82,1.18));
    recordPlaced('silkbogmyrtle',x,y,z,'spindle_terrace',null);
    st.silkbogmyrtle++;
   });
  }

  // 5C. Dolomite Mist-Tea Bush (grottocamellia: card.crop.tea + shared sl_mulberry stems) on misty dolomite karst & pavilion/narrows terraces
  if(skey==='dolomite'||skey==='pavilion'||skey==='narrows'){
   cellPass(16.0,52,Lv.floor[1],false,(x,y,z,wy,lv,hSeed)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.80))return;
    if(y<3.2||y>36.0||BIO.field('slope',x,z)>0.50)return;
    const pTea=skey==='dolomite'?0.44:(skey==='pavilion'?0.36:0.28);
    if(rng()>pTea*q||!free(x,z,1.6))return;
    claim('grottocamellia',x,z,1.6);
    SPIDERLAKE.growShrub('grottocamellia',x,y,z,hSeed,rr(0.85,1.16));
    recordPlaced('grottocamellia',x,y,z,'spindle_terrace',null);
    st.grottocamellia++;
   });
  }

  // ---------------------------------------------------------------- 6. AQUATIC, FEN, TERRACE & VANGUARD UNDERSTORY
  // 6A. Lake-Smoke Tussock Sedge, Cottongrass & Littoral Sphagnum
  cellPass(8.2,61,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   if(inReserveCore(x,z))return;
   const sub=wy>-1e8?(wy-y):-0.5;
   if(sub>0.55)return;
   const wet=BIO.field('wet',x,z),slope=BIO.field('slope',x,z);
   if(slope>0.55)return;
   const pS=skey==='rampart'?0.28*(1-slope):(0.58*wet+0.15);
   if(rng()>pS*q)return;
   const sc=rr(0.65,1.35);
   BIO.put('sl_sedge',[x,y-0.05,z],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[sc*0.95,sc,sc*0.95],pickC(PAL.sedge,0.03));
   if(skey!=='rampart'&&lv===2&&wet>0.46&&rng()<0.45){
    const cs=rr(0.55,1.05);
    BIO.put('sl_cotton',[x+rr(-0.7,0.7),y-0.04,z+rr(-0.7,0.7)],qEuler(0,rr(0,TAU),0),[cs*0.7,cs,cs*0.7],pickC(PAL.cotton,0.02));
   }
   if(skey!=='rampart'&&lv>=1&&wet>0.42&&rng()<0.38){
    const ms=rr(0.8,1.6);
    BIO.put('sl_moss',[x,y+0.02,z],qEuler(0,rr(0,TAU),0),[ms,1,ms],pickC(PAL.moss,0.03));
   }
   st.lakesmokesedge++;
  });

  // 6A-bis. Warm-Seep Sacred Lotus (lakelotus: card.lotus.bloom + floating peltate pad) in calm pavilion, fen & narrows backwaters
  if(skey==='pavilion'||skey==='fen'||skey==='narrows'){
   cellPass(9.5,65,Lv.floor[1],true,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||wy<-1e8||BIO.field('river',x,z)>0)return;
    const depth=wy-y;
    if(depth<0.14||depth>1.35)return;
    const pLo=skey==='fen'?0.52:(skey==='pavilion'?0.48:0.34);
    if(rng()>pLo*q)return;
    const nL=lv===2?ri(2,3):1;
    for(let k=0;k<nL;k++){
     const lx=x+rr(-1.2,1.2),lz=z+rr(-1.2,1.2),lw=W(lx,lz),ly=Y(lx,lz);
     if(lw<-1e8||lw-ly<0.10||lw-ly>1.5)continue;
     const padS=rr(0.65,1.15),blS=rr(0.42,0.72);
     BIO.put('sl_moss',[lx,lw+0.03,lz],qEuler(0,rr(0,TAU),0),[padS,1,padS],pickC(PAL.lotusPad,0.02));
     BIO.put('sl_lotus_bloom',[lx,lw+0.05,lz],qEuler(rr(-0.05,0.05),rr(0,TAU),rr(-0.05,0.05)),[blS,blS*0.92,blS],pickC(PAL.lotus,0.02));
    }
    recordPlaced('lakelotus',x,wy,z,'fumarole_fen',null);
    st.lakelotus++;
   });
  }

  // 6A-ter. Lake-Smoke Nursery Wild-Rice (nurserywildrice: card.crop.rice) in shallow emergent chironomid-nursery belts
  if(skey==='spillway'||skey==='narrows'||skey==='pavilion'||skey==='fen'||skey==='haugel'){
   cellPass(9.0,66,Lv.floor[1],true,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||wy<-1e8||BIO.field('river',x,z)>0)return;
    if(skey==='spillway'&&x<16)return;
    const depth=wy-y;
    if(depth<-0.06||depth>0.72)return;
    const pWr=skey==='fen'?0.56:0.42;
    if(rng()>pWr*q)return;
    const sc=rr(0.78,1.38);
    BIO.put('sl_wildrice',[x,Math.min(y,wy-0.08),z],qEuler(rr(-0.05,0.05),rr(0,TAU),rr(-0.05,0.05)),[sc*0.88,sc*1.12,sc*0.88],pickC(PAL.wildrice,0.03));
    recordPlaced('nurserywildrice',x,wy,z,'fumarole_fen',null);
    st.nurserywildrice++;
   });
  }

  // 6B. Carnivorous Snare-Mouth Fen Pitcher (silkfenpitcher) & Warm-Seep Great Sundew (fensundew) around warm seeps & fens
  if(skey!=='rampart'){
   cellPass(skey==='fen'?6.8:10.5,62,Lv.floor[1],false,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||(wy>-1e8&&y<wy-0.05)||y>9.5)return;
    const wet=BIO.field('wet',x,z),matW=BIO.field('mat',x,z);
    const pP=skey==='fen'?(0.55*wet+0.35*matW):(0.32*wet*smooth(7.5,0.2,y));
    if(pP<0.12||rng()>pP*q)return;
    const nP=lv===2?ri(2,3):1;
    for(let k=0;k<nP;k++){
     const px=x+rr(-0.65,0.65),pz=z+rr(-0.65,0.65),py=Y(px,pz),hP=rr(0.38,0.82);
     BIO.put('sl_pitcher',[px,py-0.04,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[hP*0.36,hP*0.68,hP*0.36],pickC(PAL.pitcher,0.03));
    }
    recordPlaced('silkfenpitcher',x,y,z,'fumarole_fen',null);
    st.silkfenpitcher++;
    if((skey==='fen'||skey==='haugel'||skey==='spillway')&&rng()<0.62){
     const sx=x+rr(-0.85,0.85),sz=z+rr(-0.85,0.85),sy=Y(sx,sz),sSc=rr(0.26,0.48);
     BIO.put('sl_sundew',[sx,sy-0.02,sz],qEuler(0,rr(0,TAU),0),[sSc*1.15,sSc*0.78,sSc*1.15],pickC(PAL.sundew,0.03));
     recordPlaced('fensundew',sx,sy,sz,'fumarole_fen',null);
     st.fensundew++;
    }
   });
  }

  // 6B-bis. Liwa-Toga Canal Indigo (dyersindigo: card.crop.indigo) on sunny cut-stone terraces & lakeshore dye-gardens
  if(skey==='spillway'||skey==='narrows'||skey==='pavilion'||skey==='dolomite'||skey==='haugel'){
   cellPass(12.5,67,Lv.floor[1],false,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.45))return;
    if(y<2.0||y>34.0||BIO.field('slope',x,z)>0.44||frontierAtPoint(x,y,z).biosphere!=='earth')return;
    const terr=BIO.field('terrace',x,z);
    const pIn=(skey==='pavilion'?0.38:0.26)+0.28*terr;
    if(rng()>pIn*q)return;
    const sc=rr(0.68,1.22);
    BIO.put('sl_indigo',[x,y-0.04,z],qEuler(0,rr(0,TAU),0),[sc*0.92,sc,sc*0.92],pickC(PAL.indigo,0.03));
    recordPlaced('dyersindigo',x,y,z,'spindle_terrace',null);
    st.dyersindigo++;
   });
  }

  // 6C. Calming Smudge Cliff-Fern (porphyryfern) on rock ledges, terraces & rampart megablocks + bench sword-fern
  cellPass(9.2,63,Lv.floor[1],false,(x,y,z,wy,lv)=>{
   if(inReserveCore(x,z)||(wy>-1e8&&y<wy+0.1))return;
   const rock=BIO.field('rock',x,z),porph=BIO.field('porphyry',x,z),terr=BIO.field('terrace',x,z);
   const pF=skey==='rampart'?0.58:(0.22+0.48*Math.max(rock,porph,terr*0.7));
   if(rng()>pF*q)return;
   if(skey==='rampart'||rock>0.28||porph>0.25||y>14.0){
    const nF=lv===2?2:1,sc=rr(0.45,0.82);
    for(let k=0;k<nF;k++){
     const az=(k/nF)*TAU+rr(-0.25,0.25);
     BIO.put('sl_pfern',[x,y+0.02,z],qEuler(0.45+rr(-0.1,0.15),az,0),[sc*0.65,sc,sc],pickC(PAL.pfern,0.03));
    }
   }else{
    const sc=rr(0.65,1.25);
    BIO.put('sl_floorfern',[x,y-0.04,z],qEuler(0,rr(0,TAU),0),[sc,sc*0.85,sc],pickC(PAL.floorfern,0.03));
   }
   st.porphyryfern++;
  });

  // 6C-bis. Golden-Filament Shore Spider-Lily (shorespiderlily: card.flower.spiderlily) along spillway, narrows, pavilion & dolomite shores
  if(site.hasOpenLake&&(skey==='spillway'||skey==='narrows'||skey==='pavilion'||skey==='dolomite')){
   cellPass(10.2,68,Lv.floor[1],false,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.08))return;
    if(skey==='spillway'&&x<-6)return;
    const aboveW=y-site.lakeLevelLocal;
    if(aboveW<0.10||aboveW>4.2||BIO.field('slope',x,z)>0.54)return;
    if(rng()>0.58*q)return;
    const sc=rr(0.46,0.82);
    BIO.put('sl_spiderlily',[x,y-0.03,z],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[sc*0.95,sc,sc*0.95],pickC(PAL.spiderlily,0.02));
    recordPlaced('shorespiderlily',x,y,z,'narrows',null);
    st.shorespiderlily++;
   });
  }

  // 6C-ter. Bleach-Scar Vanguard Fireweed (bleachfireweed: card.fireweed) along Hau-Gel Bleach-Scar seam & North Rampart gravel pockets
  if(skey==='haugel'||skey==='rampart'){
   cellPass(9.6,69,Lv.floor[1],false,(x,y,z,wy,lv)=>{
    if(inReserveCore(x,z)||BIO.field('river',x,z)>0||(wy>-1e8&&y<wy+0.8))return;
    const fq=frontierAtPoint(x,y,z);
    const pFw=skey==='haugel'
     ?Math.max(fq.vanguard01*0.92,fq.bleachScar01*0.55)
     :(fq.biosphere==='earth'?0.34*(1-BIO.field('slope',x,z)):0.0);
    if(pFw<0.08||rng()>pFw*q)return;
    const sc=rr(0.68,1.32);
    BIO.put('sl_fireweed',[x,y-0.04,z],qEuler(rr(-0.05,0.05),rr(0,TAU),rr(-0.05,0.05)),[sc*0.65,sc*1.12,sc*0.65],pickC(PAL.fireweed,0.02));
    recordPlaced('bleachfireweed',x,y,z,'bleach_scar',{vanguard:skey==='haugel'});
    st.bleachfireweed++;
   });
  }

  // 6D. Ballooning Spiderling Gossamer Skeins (rampartgossamer) anchored directly to tree forks & ground boulders
  for(let hi=0;hi<heroForks.length;hi++){
   const hf=heroForks[hi];
   if(!hf.forks||!hf.forks.length)continue;
   reseed(KRAND.hash(seed+640,hi));
   if(rng()>0.55*q)continue;
   const fk=hf.forks[0],sc=rr(0.85,1.55);
   BIO.put('sl_gossamer',[fk[0],fk[1],fk[2]],qEuler(0,rr(0,TAU),0),[sc*0.65,sc,sc*0.65],pickC(PAL.gossamer,0.02));
   if(st.rampartgossamer<40)recordPlaced('rampartgossamer',fk[0],fk[1],fk[2],'rim_rampart',null);
   st.rampartgossamer++;
  }
  cellPass(skey==='rampart'?9.5:14.0,64,Lv.mid,false,(x,y,z,wy,lv)=>{
   if(inReserveCore(x,z)||(wy>-1e8&&y<wy+0.2))return;
   const pG=skey==='rampart'?0.52:0.28;
   if(rng()>pG*q)return;
   const sc=rr(0.75,1.45),lift=0.34;
   BIO.put('sl_gossamer',[x,y+lift,z],qEuler(0,rr(0,TAU),0),[sc*0.65,sc*0.62,sc*0.65],pickC(PAL.gossamer,0.02));
   if(st.rampartgossamer<40)recordPlaced('rampartgossamer',x,y+lift,z,'rim_rampart',null);
   st.rampartgossamer++;
  });

  return st;
 };
})();
