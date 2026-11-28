// ================================================================= ARCFLOW — deterministic Crazy-Quilt cell-seeded placement ([G data])
// Pure deterministic placement of all 25 Arcflow species across all 5 stations (klint, koski, seep, neva, auger):
//   - Partitioned strictly by ARCFLOW_PHYS.frontierQuiltAt(x, z, site) onto 'earth', 'carnelian', and 'bleach' biospheres:
//       * Zero chlorophyll Earth plants where mgCaRatio > 8.0 unless augerOasis01 > 0.35 (45 m ecof_soil_auger dolomite oasis)
//       * Zero chlorophyll Earth plants where bleachScar01 > 0.55 (sterilized Ancient Bleach-Swath hardpan)
//       * All 20 Earth species carry meta.biosphere = 'earth'; all 5 Carnelian clades place strictly on biosphere === 'carnelian'
//         with meta.biosphere = 'carnelian' (carnelian_organpipe, erythra_veil, bladder_tether, agate_window, blood_strangler)
//   - Raha-maak Fe-Ni penny-ore nodules on Musta-Jogi shoals; merevaik amber nodules in Helme-Koski swirl-kettles
//   - Camera exclusion zones keep every preset view eye >= 4.5 m clear of foliage crowns!
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=ARCFLOW.C,PAL=ARCFLOW.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.20,rr(-j,j)*0.6,rr(-j,j)*0.6);
  return c;
 };

 const CAM_CLEAR={
  klint:[[135,-124],[58,-34],[-8,52],[-64,-28],[124,38],[88,-52]],
  koski:[[118,-112],[-34,-42],[14,42],[-18,-36],[68,38],[-128,-30]],
  seep:[[112,-96],[52,-36],[-18,-34],[-38,24],[84,28],[96,-58]],
  neva:[[-118,-112],[-24,-34],[18,-26],[46,-16],[-68,-14],[-86,-68]],
  auger:[[-118,-116],[18,-56],[98,-18],[-46,12],[-14,46],[-98,-64]]
 };

 function earthSafe(fq,seep){
  if(fq.biosphere!=='earth')return false;
  if(fq.bleachScar01>0.55)return false;
  if(fq.mgCaRatio>8.0&&!(fq.augerOasis01>0.35))return false;
  if(seep&&seep.caustic01>0.45)return false;
  return true;
 }

 function earthMeta(fq,extra){
  const m={
   biosphere:'earth',
   mgCaRatio:fq.mgCaRatio,
   mgCa:fq.mgCaRatio,
   bleachScar01:fq.bleachScar01,
   augerOasis01:fq.augerOasis01
  };
  if(extra){for(const k in extra)m[k]=extra[k];}
  return m;
 }

 function carnMeta(fq,extra){
  const m={
   biosphere:'carnelian',
   mgCaRatio:fq.mgCaRatio,
   mgCa:fq.mgCaRatio,
   niPpm:fq.niPpm,
   bleachScar01:fq.bleachScar01
  };
  if(extra){for(const k in extra)m[k]=extra[k];}
  return m;
 }

 ARCFLOW.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'klint';
  const site=ARCFLOW_SITES[skey]||ARCFLOW_SITES.klint;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?630:opt.R;
  const seedBase=opt.seed==null?8117:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const rockFn=opt.rock||(typeof FIELD!=='undefined'&&FIELD.rock)||(()=>0.18);
  const wetFn=opt.wet||(typeof FIELD!=='undefined'&&FIELD.wet)||((x,z)=>{const w=W(x,z);return w>-1e5?smooth(4.2,-0.2,Y(x,z)-w):(skey==='neva'?0.52:0.24);});
  const sp=opt.space||null;
  const reg=opt.register||null;

  ARCFLOW.PLACED.length=0;
  ARCFLOW.CROWNS.length=0;

  const st={
   nevabirch:0,
   klintspruce:0,
   mustaalder:0,
   klintlinden:0,
   klintrowan:0,
   tremblingaspen:0,
   goatwillow:0,
   klintjuniper:0,
   sweetgale:0,
   cloudberryfen:0,
   augerclover:0,
   fencottongrass:0,
   bleachfireweed:0,
   nevasundew:0,
   bogcranberry:0,
   koskireed:0,
   serpentinespleenwort:0,
   klinthepatica:0,
   spraycliffpolypody:0,
   kulanewawoad:0,
   carnelian_organpipe:0,
   erythra_veil:0,
   bladder_tether:0,
   agate_window:0,
   blood_strangler:0,
   bleachSkeletons:0,
   pennyOre:0,
   amberNodules:0,
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
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.82)return true;
   }
   return false;
  };

  const seed=KRAND.child(seedBase,'arcflow/'+skey);
  const IMP=ARCFLOW.IMP;
  const NEAR_TREE_R=195.0;

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   ARCFLOW.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
  }

  // ---------------------------------------------------------------- 1. SPECIALIZED HYDRO-MINERAL DEPOSITS (PENNY-ORE SHOALS & SWIRL-KETTLE AMBER)
  if(site.shoals&&site.shoals.length){
   for(let s=0;s<site.shoals.length;s++){
    const sh=site.shoals[s];
    const ore=ARCFLOW_PHYS.bogOreShoalAt(4.35,0.85,0.78);
    for(let i=0;i<26;i++){
     reseed(KRAND.hash(seed+110+s*19,i,1));
     const a=rr(0,TAU),rad=rr(2.0,sh.r*0.92);
     const ox=sh.x+Math.cos(a)*rad,oz=sh.z+Math.sin(a)*rad;
     if(nearCam(ox,oz,3.5))continue;
     const oy=Y(ox,oz),sc=rr(0.32,0.68);
     BIO.put('af_penny_ore',[ox,oy-sc*0.08,oz],qEuler(rr(-0.08,0.08),rr(0,TAU),0),[sc*1.35,sc*0.42,sc*1.25],pickC(PAL.bogore,0.03));
     st.pennyOre++;
    }
    if(reg){
     reg({
      tagId:'arcflow:penny-shoal-'+skey+'-'+s,
      name:'Musta-Jogi Regenerating Fe-Ni Raha-Maak Penny-Ore Shoal ('+ore.pennyOreKgM2+' kg/m2, '+ore.niWtPct+'% Ni)',
      tagClass:'feature',
      x:sh.x,y:Y(sh.x,sh.z)-1.0,z:sh.z,r:sh.r,h:6,
      tags:{biome:'arcflow',resource:'iron-nickel-bog-ore',cycleYears:20}
     });
    }
   }
  }

  if(site.kettles&&site.kettles.length){
   for(let k=0;k<site.kettles.length;k++){
    const kt=site.kettles[k];
    for(let i=0;i<14;i++){
     reseed(KRAND.hash(seed+150+k*23,i,2));
     const a=rr(0,TAU),rad=rr(0.4,kt.r*1.12);
     const ax=kt.x+Math.cos(a)*rad,az=kt.z+Math.sin(a)*rad;
     const ay=Y(ax,az),sc=rr(0.18,0.40);
     BIO.put('af_amber_nodule',[ax,ay+0.02,az],qEuler(rr(-0.2,0.2),rr(0,TAU),0),[sc*1.2,sc*0.85,sc],pickC(PAL.amber,0.03));
     st.amberNodules++;
    }
    if(reg){
     reg({
      tagId:'arcflow:hiidenkirnu-'+k,
      name:'Helme-Koski Cylindrical Hiidenkirnu Swirl-Kettle & Merevaik Amber Eddy',
      tagClass:'feature',
      x:kt.x,y:Y(kt.x,kt.z)-1.0,z:kt.z,r:kt.r+2.5,h:kt.depth+5.0,
      tags:{biome:'arcflow',resource:'ria-amber'}
     });
    }
   }
  }

  // ---------------------------------------------------------------- 2. CRAZY-QUILT CANOPY & CARNELIAN SPIRE MATRIX
  {
   const cell=16.5,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.95)continue;
    reseed(KRAND.cell(seed+310,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,8.2))continue;
    const py=Y(px,pz),wy=W(px,pz);
    // Keep woody trees & spires >= 0.42 m above active water channels & pools
    if(wy>-1e5&&py<=wy+0.42)continue;
    const sl=rockFn(px,pz);
    if(sl>0.82)continue;

    const fq=ARCFLOW_PHYS.frontierQuiltAt(px,pz,site);
    const seep=ARCFLOW_PHYS.alkalineSeepAt(px,pz,site);
    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+310,ix,iz);

    if(fq.biosphere==='bleach'){
     // Sterilized Ancient Bleach-Swath hardpan: zero living chlorophyll, sparse petrified white chitin skeletons!
     if(fq.skeleton01>0.25&&rng()<0.42*q&&free(px,pz,3.2)){
      claim('skel',px,pz,3.2);
      ARCFLOW.growCarnelian('carnelian_organpipe',px,py,pz,tSeed,rr(0.68,0.98),{petrified:true,useInstSkel:dCam>165});
      st.bleachSkeletons++;
     }
     continue;
    }

    if(fq.biosphere==='carnelian'){
     // Toxic Mg/Ca > 8, Ni > 2,200 ppm serpentinite skerry / pH 11.5 tufa refuge: 100% Erythrophyll Carnelian clades!
     if(rng()>0.72*q||!free(px,pz,3.6))continue;
     claim('carnelian',px,pz,3.6);
     const sc=rr(0.82,1.18);
     const uRoll=rng();
     if((seep.h2FlameProb01>0.12||skey==='seep'||skey==='neva')&&uRoll<0.28&&dCam<210){
      ARCFLOW.growCarnelian('bladder_tether',px,py,pz,tSeed,sc,{});
      recordPlaced('bladder_tether',px,py,pz,'alkaline_seep',carnMeta(fq));
      st.bladder_tether++;
     }else if(uRoll<0.56&&dCam<210){
      ARCFLOW.growCarnelian('erythra_veil',px,py,pz,tSeed,sc,{});
      recordPlaced('erythra_veil',px,py,pz,'alkaline_seep',carnMeta(fq));
      st.erythra_veil++;
     }else{
      if(dCam<NEAR_TREE_R||!IMP){
       ARCFLOW.growCarnelian('carnelian_organpipe',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('af_imp_trees',IMP.organpipe,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('carnelian_organpipe',px,py,pz,'serpentinite_island',carnMeta(fq));
      st.carnelian_organpipe++;
     }
     continue;
    }

    // Earth biosphere (Ca/Mg > 1 foredeep loams, humic fen rims, or 45 m lime-dosed Auger oasis disc!)
    if(!earthSafe(fq,seep))continue;
    if(rng()>0.66*q||!free(px,pz,4.4))continue;
    const wetV=wetFn(px,pz);
    const floodBank=(wy>-1e5&&py<=wy+2.10)||wetV>0.58;
    let kind='nevabirch',zone='foredeep';
    const rPick=rng();

    if(fq.augerOasis01>0.35){
     kind=(fq.augerOasis01<0.74&&rPick<0.44)?'tremblingaspen':'nevabirch';
     zone='auger_oasis';
    }else if(floodBank&&(skey==='koski'||skey==='neva'||skey==='klint')){
     if(rPick<0.40){kind='goatwillow';zone=skey==='koski'?'koskirapids':'humicfen';}
     else if(rPick<0.80){kind='mustaalder';zone='humicfen';}
     else{kind='nevabirch';zone='humicfen';}
    }else if(wetV>0.44&&(skey==='neva'||skey==='klint'||skey==='koski'||skey==='seep')){
     kind=rPick<0.56?'mustaalder':(rPick<0.80?'goatwillow':'nevabirch');
     zone='humicfen';
    }else if(skey==='klint'){
     if((Math.abs(px+14)<48||sl>0.30)&&rPick<0.36){kind='klintrowan';zone='klintgorge';}
     else if(py<28.0&&rPick<0.58){kind='klintlinden';zone='klintgorge';}
     else if(rPick<0.80){kind='klintspruce';zone='klintgorge';}
     else if(rPick<0.90){kind='tremblingaspen';zone='foredeep';}
     else{kind='nevabirch';zone='foredeep';}
    }else if(skey==='koski'){
     if(rPick<0.28){kind='tremblingaspen';zone='koskirapids';}
     else if(rPick<0.56){kind='klintspruce';zone='klintgorge';}
     else if(rPick<0.72){kind='klintrowan';zone='klintgorge';}
     else if(rPick<0.84){kind='klintlinden';zone='klintgorge';}
     else{kind='nevabirch';zone='foredeep';}
    }else{
     kind=rPick<0.28?'tremblingaspen':(rPick<0.48?'klintspruce':'nevabirch');
     zone='foredeep';
    }

    claim(kind,px,pz,kind==='klintrowan'||kind==='goatwillow'?3.6:4.5);
    const sc=rr(0.84,1.15);
    if(dCam<NEAR_TREE_R||!IMP||!IMP[kind]){
     ARCFLOW.growTree(kind,px,py,pz,tSeed,sc,{});
    }else{
     BIO.impostorPut('af_imp_trees',IMP[kind],[px,py,pz],rr(0,TAU),sc,null);
    }
    if(kind==='nevabirch'&&dCam<135&&rng()<0.14&&free(px+2.2,pz,1.8)){
     BIO.put('af_log',[px+1.8,Y(px+1.8,pz)-0.08,pz],qEuler(1.52,rr(0,TAU),rr(-0.08,0.08)),[0.85,2.4,0.85],C(0x887c6e));
    }
    recordPlaced(kind,px,py,pz,zone,earthMeta(fq));
    st[kind]++;
   }
  }

  // ---------------------------------------------------------------- 3. EMERGENT CHANNEL REEDBEDS & SWEET-GALE FEN MARGINS
  {
   const cell=10.5,N=Math.ceil((R*1.45)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.72+(ix+0.5)*cell,cz=-R*0.72+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.76)continue;
    reseed(KRAND.cell(seed+410,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,4.5))continue;
    const wy=W(px,pz);
    if(wy<=-1e5)continue;
    const py=Y(px,pz),dh=py-wy;
    if(dh<-0.14||dh>1.65)continue;
    const fq=ARCFLOW_PHYS.frontierQuiltAt(px,pz,site);
    const seep=ARCFLOW_PHYS.alkalineSeepAt(px,pz,site);
    if(!earthSafe(fq,seep))continue;

    if(dh<=0.85&&rng()<0.62*q){
     const rSc=rr(0.72,1.28);
     BIO.put('af_reed_fol',[px,py-0.05,pz],qEuler(0,rr(0,TAU),0),[rSc*0.88,rSc*1.32,rSc*0.88],pickC(PAL.reed,0.04));
     recordPlaced('koskireed',px,py,pz,skey==='neva'?'humicfen':'koskirapids',earthMeta(fq));
     st.koskireed++;
    }else if(dh>0.32&&rng()<0.48*q&&free(px,pz,1.4)){
     claim('sweetgale',px,pz,1.3);
     ARCFLOW.growShrub('sweetgale',px,py,pz,KRAND.hash(seed+415,ix,iz),rr(0.82,1.18));
     recordPlaced('sweetgale',px,py,pz,'humicfen',earthMeta(fq));
     st.sweetgale++;
    }
   }
  }

  // ---------------------------------------------------------------- 4. SHRUBS, HERBS, FERNS, BERRIES, VANGUARD, SPLEENWORT & CARNELIAN SEAMS
  {
   const cell=11.8,N=Math.ceil((R*1.65)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.82+(ix+0.5)*cell,cz=-R*0.82+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.84)continue;
    reseed(KRAND.cell(seed+510,ix,iz));
    const px=cx+rr(-0.44,0.44)*cell,pz=cz+rr(-0.44,0.44)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,4.2))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.18)continue;

    const fq=ARCFLOW_PHYS.frontierQuiltAt(px,pz,site);
    const oph=ARCFLOW_PHYS.ophioliteBeltAt(px,pz,site);
    const seep=ARCFLOW_PHYS.alkalineSeepAt(px,pz,site);

    if(fq.biosphere==='bleach'){
     if(rng()<0.22*q){
      KFRONTIER.putAgateWindow(BIO,'af',px,py,pz,KRAND.hash(seed+525,ix,iz),rr(0.65,1.15),true);
      st.bleachSkeletons++;
     }
     continue;
    }

    if(fq.biosphere==='carnelian'){
     // 5th Carnelian clade: blood_strangler along Auger Bleach-Swath & 45 m rim, seep pH 11.5 margins, & skerry seams
     const onSeepMargin=skey==='seep'&&seep.ph>=9.55;
     const onSkerrySeam=fq.redDominance01>=0.50&&fq.redDominance01<=0.64;
     if((fq.stranglerEdge01>0.16||onSeepMargin||(onSkerrySeam&&rng()<0.24))&&rng()<0.78*q){
      ARCFLOW.growCarnelian('blood_strangler',px,py,pz,KRAND.hash(seed+520,ix,iz),rr(0.85,1.42),{});
      recordPlaced('blood_strangler',px,py,pz,onSeepMargin?'alkaline_seep':'serpentinite_island',carnMeta(fq,{stranglerEdge01:fq.stranglerEdge01,ph:seep.ph}));
      st.blood_strangler++;
      continue;
     }
     if(rng()<0.62*q){
      ARCFLOW.growCarnelian('agate_window',px,py,pz,KRAND.hash(seed+530,ix,iz),rr(0.75,1.35),{});
      recordPlaced('agate_window',px,py,pz,'serpentinite_island',carnMeta(fq));
      st.agate_window++;
     }
     if(rng()<0.26*q){
      const bSc=rr(0.95,2.45);
      const rItem=oph.cumulateStripe01>0.42?'af_rock_cumulate':'af_rock_serpentinite';
      const rPal=oph.cumulateStripe01>0.42?PAL.cumulate:PAL.serpentinite;
      BIO.put(rItem,[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[bSc*1.25,bSc*0.72,bSc],pickC(rPal,0.03));
      st.boulders++;
     }
     continue;
    }

    // Strictly verified Earth substrate (biosphere === 'earth', mgCaRatio <= 8.0 unless augerOasis01 > 0.35, bleachScar01 <= 0.55)
    if(!earthSafe(fq,seep))continue;

    // 4a. Edaphic serpentine-boundary crevice fern (Mg/Ca ~ 4.8-8.0, outside limed oasis)
    if(fq.mgCaRatio>=4.8&&fq.mgCaRatio<=8.0&&fq.augerOasis01<=0.35&&rng()<0.76*q){
     const spSc=rr(0.36,0.68);
     BIO.put('af_spleenwort_fol',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[spSc,spSc*0.88,spSc],pickC(PAL.spleenwort,0.03));
     recordPlaced('serpentinespleenwort',px,py,pz,'foredeep',earthMeta(fq));
     st.serpentinespleenwort++;
     continue;
    }

    // 4b. Bleach-Swath neutralized vanguard & seep outer margin pioneer fireweed
    const isVanguard=fq.vanguard01>0.12||(skey==='seep'&&seep.ph>=7.15&&seep.ph<=9.25)||(fq.augerOasis01>0.35&&fq.augerOasis01<0.58);
    if(isVanguard&&rng()<0.72*q){
     const fwSc=rr(0.58,1.08);
     BIO.put('af_fireweed_fol',[px,py-0.04,pz],qEuler(0,rr(0,TAU),0),[fwSc*0.85,fwSc*1.18,fwSc*0.85],pickC(PAL.fireweed,0.03));
     recordPlaced('bleachfireweed',px,py,pz,fq.augerOasis01>0.35?'auger_oasis':'foredeep',earthMeta(fq,{vanguard01:fq.vanguard01}));
     st.bleachfireweed++;
     continue;
    }

    // 4c. Station 5 45 m crushed-dolomite ecof_soil_auger oasis sward (augerclover + woad + alvar juniper)
    if(fq.augerOasis01>0.35){
     const uO=rng();
     if(uO<0.62*q){
      const cSc=rr(0.42,0.82);
      BIO.put('af_clover',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.72,cSc],pickC(PAL.clover,0.03));
      recordPlaced('augerclover',px,py,pz,'auger_oasis',earthMeta(fq));
      st.augerclover++;
     }else if(uO<0.78*q){
      const wSc=rr(0.52,0.92);
      BIO.put('af_woad_fol',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[wSc*0.88,wSc,wSc*0.88],pickC(PAL.woad,0.03));
      recordPlaced('kulanewawoad',px,py,pz,'auger_oasis',earthMeta(fq));
      st.kulanewawoad++;
     }else if(uO<0.90*q&&free(px,pz,1.8)){
      claim('klintjuniper',px,pz,1.6);
      ARCFLOW.growShrub('klintjuniper',px,py,pz,KRAND.hash(seed+536,ix,iz),rr(0.78,1.12));
      recordPlaced('klintjuniper',px,py,pz,'auger_oasis',earthMeta(fq));
      st.klintjuniper++;
     }
     continue;
    }

    const wetV=wetFn(px,pz);
    const sl=rockFn(px,pz);

    // 4d. Musta-Neva & humic fen peatland assemblage (cloudberry, cottongrass, cranberry, sundew, sweetgale)
    if(wetV>0.32||skey==='neva'){
     const uF=rng();
     if(uF<0.28*q){
      const mSc=rr(0.72,1.32);
      BIO.put('af_moss',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.moss,0.04));
      const pSc=rr(0.22,0.40);
      BIO.put('af_cloudberry_pod',[px+rr(-0.22,0.22),py+0.04,pz+rr(-0.22,0.22)],qEuler(0,rr(0,TAU),0),[pSc,pSc*0.65,pSc],pickC(PAL.cloudberry,0.03));
      recordPlaced('cloudberryfen',px,py,pz,'humicfen',earthMeta(fq));
      st.cloudberryfen++;
     }else if(uF<0.50*q){
      const cgSc=rr(0.46,0.82);
      BIO.put('af_cottongrass',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[cgSc*0.92,cgSc,cgSc*0.92],pickC(PAL.cottongrass,0.02));
      recordPlaced('fencottongrass',px,py,pz,'humicfen',earthMeta(fq));
      st.fencottongrass++;
     }else if(uF<0.66*q){
      const crSc=rr(0.36,0.66);
      BIO.put('af_cranberry_fol',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[crSc*1.12,crSc*0.62,crSc*1.12],pickC(PAL.cranberry,0.03));
      recordPlaced('bogcranberry',px,py,pz,'humicfen',earthMeta(fq));
      st.bogcranberry++;
     }else if(uF<0.80*q){
      const sdSc=rr(0.26,0.48);
      BIO.put('af_sundew_fol',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[sdSc,sdSc*0.72,sdSc],pickC(PAL.sundew,0.03));
      recordPlaced('nevasundew',px,py,pz,'humicfen',earthMeta(fq));
      st.nevasundew++;
     }else if(uF<0.90*q&&free(px,pz,1.4)){
      claim('sweetgale',px,pz,1.3);
      ARCFLOW.growShrub('sweetgale',px,py,pz,KRAND.hash(seed+542,ix,iz),rr(0.80,1.16));
      recordPlaced('sweetgale',px,py,pz,'humicfen',earthMeta(fq));
      st.sweetgale++;
     }
     if(rng()<0.28*q){
      const sSc=rr(0.46,0.88);
      BIO.put('af_sedge',[px+rr(-0.6,0.6),py-0.03,pz+rr(-0.6,0.6)],qEuler(0,rr(0,TAU),0),[sSc,sSc,sSc],pickC(PAL.sedge,0.04));
     }
     continue;
    }

    // 4e. Valgekivi Klint, Koski cataract mist, calcareous linden-mull & foredeep meadow assemblage
    const uM=rng();
    if((skey==='klint'||skey==='koski'||skey==='seep')&&(sl>0.26||wetV>0.16)&&uM<0.34*q){
     const fSc=rr(0.46,0.88);
     BIO.put('af_fern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*0.86,fSc],pickC(PAL.fern,0.04));
     recordPlaced('spraycliffpolypody',px,py,pz,'klintgorge',earthMeta(fq));
     st.spraycliffpolypody++;
    }else if((skey==='klint'||skey==='koski')&&py<32.0&&uM<0.54*q){
     const hpSc=rr(0.28,0.52);
     BIO.put('af_hepatica_fol',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[hpSc,hpSc*0.76,hpSc],pickC(PAL.hepatica,0.03));
     recordPlaced('klinthepatica',px,py,pz,'klintgorge',earthMeta(fq));
     st.klinthepatica++;
    }else if(uM<0.68*q&&free(px,pz,1.8)){
     claim('klintjuniper',px,pz,1.6);
     ARCFLOW.growShrub('klintjuniper',px,py,pz,KRAND.hash(seed+548,ix,iz),rr(0.82,1.22));
     recordPlaced('klintjuniper',px,py,pz,'foredeep',earthMeta(fq));
     st.klintjuniper++;
    }else if(uM<0.80*q){
     const wdSc=rr(0.50,0.94);
     BIO.put('af_woad_fol',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[wdSc*0.88,wdSc,wdSc*0.88],pickC(PAL.woad,0.03));
     recordPlaced('kulanewawoad',px,py,pz,'foredeep',earthMeta(fq));
     st.kulanewawoad++;
    }else if(uM<0.90*q){
     const clSc=rr(0.40,0.74);
     BIO.put('af_clover',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[clSc,clSc*0.70,clSc],pickC(PAL.clover,0.03));
     recordPlaced('augerclover',px,py,pz,'foredeep',earthMeta(fq));
     st.augerclover++;
    }else if(uM<0.97*q){
     const fwSc=rr(0.54,0.96);
     BIO.put('af_fireweed_fol',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fwSc*0.84,fwSc*1.12,fwSc*0.84],pickC(PAL.fireweed,0.03));
     recordPlaced('bleachfireweed',px,py,pz,'foredeep',earthMeta(fq));
     st.bleachfireweed++;
    }

    if(rng()<0.15*q){
     const bSc=rr(0.80,2.10);
     const bItem=skey==='klint'?'af_rock_basalt':(skey==='koski'?'af_rock_cumulate':'af_rock_serpentinite');
     const bPal=skey==='klint'?PAL.basalt:(skey==='koski'?PAL.cumulate:PAL.serpentinite);
     BIO.put(bItem,[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bSc*1.18,bSc*0.76,bSc],pickC(bPal,0.02));
     st.boulders++;
    }
   }
  }

  // ---------------------------------------------------------------- 5. TARGETED CHEMICAL SEAM PASS (AUGER RIM, BLEACH VANGUARD & SEEP MARGINS)
  if(site.auger){
   // 45 m Auger-disc Carnelian contact rim (blood_strangler) + inner crushed-dolomite clover sward (augerclover)
   for(let i=0;i<36;i++){
    reseed(KRAND.hash(seed+620,i,1));
    const az=(i/36)*TAU+rr(-0.04,0.04);
    const rRim=site.auger.radiusM+rr(2.2,6.2);
    const rx=site.auger.x+Math.cos(az)*rRim,rz=site.auger.z+Math.sin(az)*rRim;
    if(!nearCam(rx,rz,4.2)&&!inReserveCore(rx,rz)){
     const fqR=ARCFLOW_PHYS.frontierQuiltAt(rx,rz,site);
     if(fqR.biosphere==='carnelian'){
      const ry=Y(rx,rz);
      ARCFLOW.growCarnelian('blood_strangler',rx,ry,rz,KRAND.hash(seed+621,i,2),rr(0.88,1.38),{});
      recordPlaced('blood_strangler',rx,ry,rz,'serpentinite_island',carnMeta(fqR,{stranglerEdge01:fqR.stranglerEdge01}));
      st.blood_strangler++;
     }
    }
    const rIn=rr(8.5,site.auger.radiusM*0.76);
    const ix0=site.auger.x+Math.cos(az+0.12)*rIn,iz0=site.auger.z+Math.sin(az+0.12)*rIn;
    const wyIn=W(ix0,iz0),iy0=Y(ix0,iz0);
    if(!nearCam(ix0,iz0,4.0)&&(wyIn<=-1e5||iy0>wyIn+0.25)){
     const fqI=ARCFLOW_PHYS.frontierQuiltAt(ix0,iz0,site);
     const spI=ARCFLOW_PHYS.alkalineSeepAt(ix0,iz0,site);
     if(earthSafe(fqI,spI)&&fqI.augerOasis01>0.40){
      const cSc=rr(0.45,0.82);
      BIO.put('af_clover',[ix0,iy0-0.03,iz0],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.72,cSc],pickC(PAL.clover,0.03));
      recordPlaced('augerclover',ix0,iy0,iz0,'auger_oasis',earthMeta(fqI));
      st.augerclover++;
     }
    }
   }
  }

  if(site.swath){
   // Bleach-Swath tri-band seam: blood_strangler on Carnelian wall & bleachfireweed / serpentinespleenwort in neutralized vanguard pockets
   const sw=site.swath;
   const dRaw=Math.hypot(sw.dx,sw.dz),dl=dRaw>1e-6?dRaw:1;
   const tx=sw.dx/dl,tz=sw.dz/dl,nx=-tz,nz=tx;
   for(let i=0;i<64;i++){
    reseed(KRAND.hash(seed+640,i,1));
    const along=rr(-260,260);
    const side=(i%2===0?1:-1)*(sw.halfWidthM+rr(3.5,16.5));
    const sx=sw.x0+tx*along+nx*side,sz=sw.z0+tz*along+nz*side;
    if(Math.hypot(sx,sz)>R*0.86||nearCam(sx,sz,4.2)||inReserveCore(sx,sz))continue;
    const wyS=W(sx,sz),sy=Y(sx,sz);
    if(wyS>-1e5&&sy<=wyS+0.20)continue;
    const fqS=ARCFLOW_PHYS.frontierQuiltAt(sx,sz,site);
    const spS=ARCFLOW_PHYS.alkalineSeepAt(sx,sz,site);
    if(fqS.biosphere==='carnelian'&&fqS.stranglerEdge01>0.14){
     ARCFLOW.growCarnelian('blood_strangler',sx,sy,sz,KRAND.hash(seed+641,i,2),rr(0.88,1.40),{});
     recordPlaced('blood_strangler',sx,sy,sz,'serpentinite_island',carnMeta(fqS,{stranglerEdge01:fqS.stranglerEdge01}));
     st.blood_strangler++;
    }else if(earthSafe(fqS,spS)){
     if(fqS.mgCaRatio>=4.8&&fqS.mgCaRatio<=8.0&&i%3===0){
      const spSc=rr(0.38,0.66);
      BIO.put('af_spleenwort_fol',[sx,sy-0.03,sz],qEuler(0,rr(0,TAU),0),[spSc,spSc*0.88,spSc],pickC(PAL.spleenwort,0.03));
      recordPlaced('serpentinespleenwort',sx,sy,sz,'foredeep',earthMeta(fqS,{vanguard01:fqS.vanguard01}));
      st.serpentinespleenwort++;
     }else{
      const fwSc=rr(0.60,1.08);
      BIO.put('af_fireweed_fol',[sx,sy-0.04,sz],qEuler(0,rr(0,TAU),0),[fwSc*0.85,fwSc*1.18,fwSc*0.85],pickC(PAL.fireweed,0.03));
      recordPlaced('bleachfireweed',sx,sy,sz,'foredeep',earthMeta(fqS,{vanguard01:fqS.vanguard01}));
      st.bleachfireweed++;
     }
    }
   }
  }

  if(site.seep){
   // Station 3 pH 11.5 cerulean travertine margin: blood_strangler along caustic rim & bleachfireweed on neutral outer edge
   for(let i=0;i<36;i++){
    reseed(KRAND.hash(seed+660,i,1));
    const az=(i/36)*TAU+rr(-0.05,0.05);
    const rad=rr(36,98);
    const sx=site.seep.x+Math.cos(az)*rad,sz=site.seep.z+Math.sin(az)*rad*0.82;
    if(nearCam(sx,sz,4.2)||inReserveCore(sx,sz))continue;
    const wyS=W(sx,sz),sy=Y(sx,sz);
    if(wyS>-1e5&&sy<=wyS+0.22)continue;
    const fqS=ARCFLOW_PHYS.frontierQuiltAt(sx,sz,site);
    const spS=ARCFLOW_PHYS.alkalineSeepAt(sx,sz,site);
    if(fqS.biosphere==='carnelian'&&spS.ph>=9.5){
     ARCFLOW.growCarnelian('blood_strangler',sx,sy,sz,KRAND.hash(seed+661,i,2),rr(0.84,1.34),{});
     recordPlaced('blood_strangler',sx,sy,sz,'alkaline_seep',carnMeta(fqS,{ph:spS.ph}));
     st.blood_strangler++;
    }else if(earthSafe(fqS,spS)){
     const fwSc=rr(0.56,1.02);
     BIO.put('af_fireweed_fol',[sx,sy-0.04,sz],qEuler(0,rr(0,TAU),0),[fwSc*0.85,fwSc*1.15,fwSc*0.85],pickC(PAL.fireweed,0.03));
     recordPlaced('bleachfireweed',sx,sy,sz,'foredeep',earthMeta(fqS,{ph:spS.ph}));
     st.bleachfireweed++;
    }
   }
  }

  if(site.skerries&&site.skerries.length&&reg){
   for(let i=0;i<site.skerries.length;i++){
    const sk=site.skerries[i];
    reg({
     tagId:'arcflow:skerry-'+skey+'-'+i,
     name:'Kalju-Selka Onshore Arch Serpentinite Refugium Island (Mg/Ca > 8 Carnelian Crown)',
     tagClass:'feature',
     x:sk.x,y:Y(sk.x,sk.z)-2.0,z:sk.z,r:Math.max(sk.rx,sk.rz),h:24,
     tags:{biome:'arcflow',biosphere:'carnelian',lithology:'arch-ophiolite'}
    });
   }
  }
  if(site.swath&&reg){
   reg({
    tagId:'arcflow:bleach-swath-'+skey,
    name:'Ancient Orbital-Azimuth Defoliant Bleach-Swath & Petrified Chitin Seam',
    tagClass:'feature',
    x:site.swath.x0,y:Y(site.swath.x0,site.swath.z0)-1.0,z:site.swath.z0,r:site.swath.halfWidthM*1.5,h:16,
    tags:{biome:'arcflow',origin:'ancient-ecocide'}
   });
  }
  if(site.auger&&reg){
   reg({
    tagId:'arcflow:auger-oasis-'+skey,
    name:'45 m Lime-Phosphate Neutralized Birch & Clover Oasis Disc',
    tagClass:'flora',
    x:site.auger.x,y:Y(site.auger.x,site.auger.z)-1.0,z:site.auger.z,r:site.auger.radiusM,h:24,
    tags:{biome:'arcflow',biosphere:'earth',ecoformer:'ecof_soil_auger'}
   });
  }

  return st;
 };
})();
