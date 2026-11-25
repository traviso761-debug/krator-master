// ================================================================= ARCFLOW — deterministic Crazy-Quilt cell-seeded placement ([G data])
// Pure deterministic placement across all 5 stations (klint, koski, seep, neva, auger):
//   - Partitioned strictly by ARCFLOW_PHYS.frontierQuiltAt(x, z, site) onto 'earth', 'carnelian', and 'bleach' biospheres:
//       * Zero chlorophyll Earth trees inside toxic Mg/Ca > 8 serpentinite refugia (except inside the 45 m lime-dosed Auger oasis!)
//       * Zero chlorophyll Earth trees inside sterilized Ancient Bleach-Swath hardpans
//       * Carnelian clades (carnelian_organpipe, erythra_veil, bladder_tether, agate_window) crown every serpentinite skerry,
//         cumulate rib, and pH 11.5 cerulean travertine rim, while petrified white skeletons & blood-strangler line Bleach-Swaths
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

 ARCFLOW.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'klint';
  const site=ARCFLOW_SITES[skey]||ARCFLOW_SITES.klint;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?630:opt.R;
  const seedBase=opt.seed==null?8117:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;

  ARCFLOW.PLACED.length=0;
  ARCFLOW.CROWNS.length=0;

  const st={
   nevabirch:0,
   klintspruce:0,
   mustaalder:0,
   klintlinden:0,
   cloudberryfen:0,
   carnelian_organpipe:0,
   erythra_veil:0,
   bladder_tether:0,
   agate_window:0,
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
    const sl=FIELD.rock(px,pz);
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
      recordPlaced('bladder_tether',px,py,pz,'alkaline_seep',{biosphere:'carnelian',mgCa:fq.mgCaRatio,niPpm:fq.niPpm});
      st.bladder_tether++;
     }else if(uRoll<0.56&&dCam<210){
      ARCFLOW.growCarnelian('erythra_veil',px,py,pz,tSeed,sc,{});
      recordPlaced('erythra_veil',px,py,pz,'alkaline_seep',{biosphere:'carnelian',mgCa:fq.mgCaRatio,niPpm:fq.niPpm});
      st.erythra_veil++;
     }else{
      if(dCam<NEAR_TREE_R||!IMP){
       ARCFLOW.growCarnelian('carnelian_organpipe',px,py,pz,tSeed,sc,{});
      }else{
       BIO.impostorPut('af_imp_trees',IMP.organpipe,[px,py,pz],rr(0,TAU),sc,null);
      }
      recordPlaced('carnelian_organpipe',px,py,pz,'serpentinite_island',{biosphere:'carnelian',mgCa:fq.mgCaRatio,niPpm:fq.niPpm});
      st.carnelian_organpipe++;
     }
     continue;
    }

    // Earth biosphere (Ca/Mg > 1 foredeep loams, humic fen rims, or 45 m lime-dosed Auger oasis disc!)
    if(seep.caustic01>0.45)continue;
    if(rng()>0.66*q||!free(px,pz,4.6))continue;
    const wetV=FIELD.wet(px,pz);
    let kind='nevabirch',zone='foredeep';
    if(fq.augerOasis01>0.35){
     kind='nevabirch';zone='auger_oasis';
    }else if(wetV>0.48&&(skey==='neva'||skey==='klint'||skey==='koski')){
     kind=rng()<0.62?'mustaalder':'nevabirch';zone='humicfen';
    }else if(skey==='klint'&&py<26.0&&rng()<0.44){
     kind='klintlinden';zone='klintgorge';
    }else if((skey==='klint'||skey==='koski')&&rng()<0.48){
     kind='klintspruce';zone='klintgorge';
    }
    claim(kind,px,pz,4.6);
    const sc=rr(0.84,1.15);
    if(dCam<NEAR_TREE_R||!IMP||kind==='mustaalder'){
     ARCFLOW.growTree(kind,px,py,pz,tSeed,sc,{});
    }else{
     const impSlot=kind==='klintspruce'?IMP.spruce:(kind==='klintlinden'?IMP.linden:IMP.birch);
     BIO.impostorPut('af_imp_trees',impSlot,[px,py,pz],rr(0,TAU),sc,null);
    }
    recordPlaced(kind,px,py,pz,zone,{biosphere:'earth',augerOasis01:fq.augerOasis01,mgCa:fq.mgCaRatio});
    st[kind]++;
   }
  }

  // ---------------------------------------------------------------- 3. DENSE SKERRY AGATE-WINDOWS, CLOUDBERRY FENS, STRANGLER SEAMS & BOULDERS
  {
   const cell=12.0,N=Math.ceil((R*1.65)/cell);
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

    // Reactive arterial-red blood-strangler web along Bleach-Swath and Auger-Oasis chemical seams
    if(fq.stranglerEdge01>0.34&&rng()<0.75*q){
     KFRONTIER.putBloodStrangler(BIO,'af',px,py,pz,KRAND.hash(seed+520,ix,iz),rr(0.85,1.45));
     recordPlaced('agate_window',px,py,pz,'serpentinite_island',{biosphere:'carnelian',stranglerEdge01:fq.stranglerEdge01});
     st.agate_window++;
     continue;
    }

    if(fq.biosphere==='bleach'){
     if(rng()<0.22*q){
      KFRONTIER.putAgateWindow(BIO,'af',px,py,pz,KRAND.hash(seed+525,ix,iz),rr(0.65,1.15),true);
      st.bleachSkeletons++;
     }
     continue;
    }

    if(fq.biosphere==='carnelian'){
     if(rng()<0.64*q){
      ARCFLOW.growCarnelian('agate_window',px,py,pz,KRAND.hash(seed+530,ix,iz),rr(0.75,1.35),{});
      recordPlaced('agate_window',px,py,pz,'serpentinite_island',{biosphere:'carnelian',mgCa:fq.mgCaRatio});
      st.agate_window++;
     }
     if(rng()<0.28*q){
      const bSc=rr(0.95,2.45);
      const rItem=oph.cumulateStripe01>0.42?'af_rock_cumulate':'af_rock_serpentinite';
      const rPal=oph.cumulateStripe01>0.42?PAL.cumulate:PAL.serpentinite;
      // Spheroidal slope burial (-0.28 * bSc) so rocks never perch or float
      BIO.put(rItem,[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[bSc*1.25,bSc*0.72,bSc],pickC(rPal,0.03));
      st.boulders++;
     }
     continue;
    }

    // Earth ground cover: Auger clover, Musta-Jogi cloudberry sphagnum hummocks, Klint gorge ferns & boulders
    if(fq.augerOasis01>0.30){
     if(rng()<0.68*q){
      const cSc=rr(0.45,0.85);
      BIO.put('af_clover',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.78,cSc],pickC(PAL.clover,0.04));
      recordPlaced('cloudberryfen',px,py,pz,'auger_oasis',{biosphere:'earth',augerOasis01:fq.augerOasis01});
      st.cloudberryfen++;
     }
     continue;
    }
    const wetV=FIELD.wet(px,pz);
    if(wetV>0.30||skey==='neva'){
     if(rng()<0.58*q){
      const mSc=rr(0.72,1.35);
      BIO.put('af_moss',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.moss,0.04));
      if(rng()<0.52){
       const pSc=rr(0.22,0.42);
       BIO.put('af_cloudberry_pod',[px+rr(-0.25,0.25),py+0.04,pz+rr(-0.25,0.25)],qEuler(0,rr(0,TAU),0),[pSc,pSc*0.65,pSc],pickC(PAL.cloudberry,0.03));
      }
      recordPlaced('cloudberryfen',px,py,pz,'humicfen',{biosphere:'earth'});
      st.cloudberryfen++;
     }
     if(rng()<0.44*q){
      const sSc=rr(0.46,0.92);
      BIO.put('af_sedge',[px+rr(-0.6,0.6),py-0.03,pz+rr(-0.6,0.6)],qEuler(0,rr(0,TAU),0),[sSc,sSc,sSc],pickC(PAL.sedge,0.04));
     }
    }else{
     if(rng()<0.44*q){
      const fSc=rr(0.46,0.88);
      BIO.put('af_fern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*0.86,fSc],pickC(PAL.fern,0.04));
     }
     if(rng()<0.16*q){
      const bSc=rr(0.80,2.10);
      const bItem=skey==='klint'?'af_rock_basalt':(skey==='koski'?'af_rock_cumulate':'af_rock_serpentinite');
      const bPal=skey==='klint'?PAL.basalt:(skey==='koski'?PAL.cumulate:PAL.serpentinite);
      BIO.put(bItem,[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bSc*1.18,bSc*0.76,bSc],pickC(bPal,0.02));
      st.boulders++;
     }
    }
   }
  }

  // Ensure every station registers at least a cluster of cloudberryfen on Earth soil
  if(st.cloudberryfen===0){
   for(let i=0;i<24&&st.cloudberryfen<16;i++){
    reseed(KRAND.hash(seed+610,i,1));
    const px=site.auger?(site.auger.x+rr(-24,24)):(skey==='seep'?rr(88,165):rr(-42,42));
    const pz=site.auger?(site.auger.z+rr(-24,24)):rr(-65,65);
    if(nearCam(px,pz,4.0))continue;
    const fq=ARCFLOW_PHYS.frontierQuiltAt(px,pz,site);
    if(fq.biosphere!=='earth')continue;
    const py=Y(px,pz),mSc=rr(0.68,1.15);
    BIO.put('af_moss',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.moss,0.03));
    BIO.put('af_cloudberry_pod',[px,py+0.04,pz],qEuler(0,rr(0,TAU),0),[0.28,0.18,0.28],pickC(PAL.cloudberry,0.02));
    recordPlaced('cloudberryfen',px,py,pz,'humicfen',{biosphere:'earth'});
    st.cloudberryfen++;
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
