// ================================================================= RICOCHET PEAKS — deterministic cell-seeded crater-boreal placement ([G data])
// Pure deterministic placement across all 5 stations (ringlake, notch, vents, glasssheet, highbowl):
//   - Partitioned strictly by RICOCHET_PHYS.bowlTreelineAt(x, z, elevAboveFloor, heatLiftC, site):
//       * Unheated lowest crater-floor frost hollows (< 5.8 m above lake/floor): trees excluded, dominated by frost_hollow_sedge!
//       * Lower talus aprons & central rebound islands (+6..+105 m): dense crater_spruce, shatter_larch & ejecta_birch thermal-belt taiga!
//       * Upper crater walls & Skippers Notch (+95 m+): BIO.kin wind-flagged krummholz larch & glass_pine leaning with notchVenturiAt!
//       * East Hearth hydrothermal oasis (vents) & Erebus chimney mouths (highbowl): lush vent_willow & emerald steam_moss!
//       * Glass-Pan impact-melt sheet (glasssheet): bonsai glass_pine, silver shock_lichen & metallic-blue nickel_heather over Fe-Ni ore!
//   - Camera keep-clear circles keep every preset view eye >= 6.5 m clear of foliage crowns!
// Zero THREE, zero DOM, zero Math.random, zero || <nonzero>; deterministic on KRAND.cell / KRAND.hash.
(function(){
 const {TAU,clamp,lerp,smooth,reseed,rng,rr,qEuler}=BIO.fn;
 const C=RICOCHET.C,PAL=RICOCHET.PAL;
 const pickC=(arr,j)=>{
  const c=C(arr[Math.floor(rng()*arr.length)%arr.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.18,rr(-j,j)*0.5,rr(-j,j)*0.5);
  return c;
 };

 const CAM_CLEAR={
  ringlake:[[0,-62],[84,-78],[-68,42],[44,-14],[-142,-98],[28,68]],
  notch:[[-58,-44],[0,-18],[56,34],[-42,36],[46,-46],[12,72]],
  vents:[[64,-96],[-24,-54],[-74,-34],[94,24],[-18,-136],[138,16]],
  glasssheet:[[-96,-72],[-14,-52],[54,-24],[-64,14],[22,42],[-62,-84]],
  highbowl:[[24,-84],[-24,-6],[-64,-28],[68,-34],[-76,-68],[-88,18]]
 };

 RICOCHET.placeAll=function(opt){
  opt=opt||{};
  const skey=opt.station||'ringlake';
  const site=RICOCHET_SITES[skey]||RICOCHET_SITES.ringlake;
  const q=opt.quality==null?1:opt.quality;
  const R=opt.R==null?630:opt.R;
  const seedBase=opt.seed==null?9117:opt.seed;
  const Y=opt.terrainH||BIO.host.terrainH;
  const W=opt.waterH||BIO.host.waterH;
  const sp=opt.space||null;
  const reg=opt.register||null;

  RICOCHET.PLACED.length=0;
  RICOCHET.CROWNS.length=0;

  const st={
   crater_spruce:0,
   shatter_larch:0,
   glass_pine:0,
   ejecta_birch:0,
   vent_willow:0,
   nickel_heather:0,
   shock_lichen:0,
   frost_hollow_sedge:0,
   steam_moss:0,
   kinKrummholz:0,
   boulders:0,
   logs:0
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
    if(Math.hypot(x-rv.x,z-rv.z)<rv.r*0.85)return true;
   }
   if(site.shrines){
    for(let i=0;i<site.shrines.length;i++){
     if(Math.hypot(x-site.shrines[i].x,z-site.shrines[i].z)<8.5)return true;
    }
   }
   if(site.banditWorks){
    for(let i=0;i<site.banditWorks.length;i++){
     if(Math.hypot(x-site.banditWorks[i].x,z-site.banditWorks[i].z)<7.5)return true;
    }
   }
   if(site.chimneys){
    for(let i=0;i<site.chimneys.length;i++){
     const ch=site.chimneys[i];
     if(Math.hypot(x-ch.x,z-ch.z)<ch.r*1.55)return true;
    }
   }
   return false;
  };

  const seed=KRAND.child(seedBase,'ricochetpeaks/'+skey);
  const IMP=RICOCHET.IMP;
  const NEAR_TREE_R=skey==='glasssheet'?265.0:195.0;
  const floorRefY=skey==='notch'?22.0:(skey==='ringlake'?2.40:(skey==='vents'?1.80:(skey==='glasssheet'?1.50:1.20)));

  // BIO.kin (core/biome 32) cousins for upper-rim krummholz & wind-flagged notch pines
  const KIN=typeof RICOCHET.kinCousins==='function'?RICOCHET.kinCousins():null;

  function recordPlaced(speciesKey,x,y,z,zone,meta){
   const asl=+(site.baseElevM+y).toFixed(2);
   RICOCHET.PLACED.push([speciesKey,x,y,z,asl,zone,meta||null]);
  }

  // ---------------------------------------------------------------- 1. HYDROTHERMAL FUMAROLE PLUME-WILLOW & STEAM-MOSS RINGS (vents & highbowl)
  if(site.vents&&site.vents.length){
   for(let v=0;v<site.vents.length;v++){
    const vt=site.vents[v];
    const nRing=skey==='vents'?28:18;
    for(let i=0;i<nRing;i++){
     reseed(KRAND.hash(seed+110+v*23,i,1));
     const a=(i/nRing)*TAU+rr(-0.12,0.12);
     const rad=vt.r*rr(1.22,2.45);
     const px=vt.x+Math.cos(a)*rad,pz=vt.z+Math.sin(a)*rad;
     if(inReserveCore(px,pz)||nearCam(px,pz,4.8))continue;
     const py=Y(px,pz),wy=W(px,pz);
     if(wy>-1e5&&py<=wy+0.25)continue;
     // Emerald steam_moss & sinter cushions right around every hot spring and Erebus ice-chimney base!
     const mSc=rr(0.75,1.45);
     BIO.put('rp_moss',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[mSc,mSc,mSc],pickC(PAL.steamMoss,0.04));
     if(rng()<0.45){
      const cSc=rr(0.28,0.56);
      BIO.put('rp_sinter_cushion',[px+rr(-0.3,0.3),py+0.02,pz+rr(-0.3,0.3)],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.55,cSc],pickC(PAL.sinterMat,0.03));
     }
     recordPlaced('steam_moss',px,py,pz,'cryofumarole_mouth',{heatLiftC:vt.T-site.soilTempC});
     st.steam_moss++;

     // Fumarole Plume-Willow thickets in East Hearth warm steam (vents) & dwarfed steam-willow cushions on Old Rim fumaroles (highbowl)
     if((skey==='vents'||skey==='highbowl')&&i%3===0&&rad>vt.r*1.35&&free(px,pz,2.4)){
      claim('vent_willow',px,pz,2.4);
      const wSc=skey==='highbowl'?rr(0.46,0.68):rr(0.82,1.22);
      RICOCHET.growTree('vent_willow',px,py,pz,KRAND.hash(seed+130+v*17,i,2),wSc,{});
      recordPlaced('vent_willow',px,py,pz,skey==='highbowl'?'cryofumarole_mouth':'hydrothermal_oasis',{heatLiftC:vt.T-site.soilTempC});
      st.vent_willow++;
     }
    }
   }
  }

  // ---------------------------------------------------------------- 2. METEORITIC NICKEL-HEATHER INDICATOR STANDS (glasssheet & impactor anomalies)
  if(site.anomalies&&site.anomalies.length){
   for(let aIdx=0;aIdx<site.anomalies.length;aIdx++){
    const an=site.anomalies[aIdx];
    const count=skey==='glasssheet'?46:20;
    for(let i=0;i<count;i++){
     reseed(KRAND.hash(seed+210+aIdx*31,i,1));
     const ang=rr(0,TAU),rad=Math.sqrt(rng())*an.r*0.92;
     const px=an.x+Math.cos(ang)*rad,pz=an.z+Math.sin(ang)*rad;
     if(inReserveCore(px,pz)||nearCam(px,pz,4.2))continue;
     const py=Y(px,pz),wy=W(px,pz);
     if(wy>-1e5&&py<=wy+0.25)continue;
     const ma=RICOCHET_PHYS.meteoricAnomalyAt(px,pz,site);
     if(ma.indicator01<0.25)continue;
     const hSc=rr(0.42,0.82);
     BIO.put('rp_heather',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[hSc,hSc*0.78,hSc],pickC(PAL.nickelHeather,0.04));
     const bSc=rr(0.18,0.34);
     BIO.put('rp_nickel_bell',[px,py+hSc*0.24,pz],qEuler(0,rr(0,TAU),0),[bSc,bSc*0.70,bSc],pickC(PAL.nickelBell,0.03));
     recordPlaced('nickel_heather',px,py,pz,'tagamite_barren',{niPpm:ma.niPpm,heatherTell:ma.heatherTell});
     st.nickel_heather++;
    }
    if(reg){
     reg({
      tagId:'ricochet:nickel-tell-'+skey+'-'+aIdx,
      name:'Meteoric Bell-Heath Indicator Stand (Ni '+an.niPpm+' ppm, Au '+an.auPpb+' ppb)',
      tagClass:'flora',
      x:an.x,y:Y(an.x,an.z)-1.0,z:an.z,r:an.r,h:6,
      tags:{biome:'ricochetpeaks',indicator:'meteoric-nickel-iron',niPpm:an.niPpm}
     });
    }
   }
  }

  // ---------------------------------------------------------------- 3. INVERTED BOWL-TREELINE BOREAL CANOPY MATRIX
  if(site.koppen!=='ET'){
   const cell=16.5,N=Math.ceil((R*2)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R+(ix+0.5)*cell,cz=-R+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.95)continue;
    reseed(KRAND.cell(seed+310,ix,iz));
    const px=cx+rr(-0.42,0.42)*cell,pz=cz+rr(-0.42,0.42)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,8.8))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.48)continue;
    const sl=FIELD.rock(px,pz);
    if(sl>0.82)continue;

    const heatLift=FIELD.heat(px,pz);
    const bt=RICOCHET_PHYS.bowlTreelineAt(px,pz,py-floorRefY,heatLift,site);
    const glass01=FIELD.glass(px,pz);
    const venturi=RICOCHET_PHYS.notchVenturiAt(px,pz,site);
    const dCam=BIO.lodD(px,pz);
    const tSeed=KRAND.hash(seed+310,ix,iz);

    // Inverted bowl treeline rule: unheated katabatic frost-hollow floor (< 5.8 m above water) freezes out tall trees!
    if(bt.band==='frost_hollow'&&bt.frostHollow01>0.58){
     continue;
    }
    // Scalding sinter aprons (> 32 C lift) take vent_willow / steam_moss instead of tall conifers
    if(heatLift>28.0){
     if(rng()<0.48*q&&free(px,pz,2.8)&&dCam<220){
      claim('vent_willow',px,pz,2.8);
      RICOCHET.growTree('vent_willow',px,py,pz,tSeed,rr(0.85,1.20),{});
      recordPlaced('vent_willow',px,py,pz,'hydrothermal_oasis',{band:bt.band,heatLiftC:heatLift});
      st.vent_willow++;
     }
     continue;
    }

    // Upper rim krummholz band: grow BIO.kin dwarfed cousins!
    if(bt.band==='rim_krummholz'){
     if(rng()>0.38*q||!free(px,pz,3.2)||dCam>230)continue;
     claim('krummholz',px,pz,3.2);
     if(KIN&&KIN.rimLarch){
      const T=KIN.rimLarch.make(px,py,pz,tSeed,rr(0.75,1.10),{leanRad:0.22,windDir:venturi.dir});
      KIN.rimLarch.grow(T,2);
      st.kinKrummholz++;
     }else{
      RICOCHET.growTree('glass_pine',px,py,pz,tSeed,rr(0.45,0.68),{leanRad:0.22,windDir:venturi.dir});
     }
     recordPlaced('shatter_larch',px,py,pz,'rim_krummholz',{band:bt.band});
     st.shatter_larch++;
     continue;
    }

    // Black tagamite impact-melt floor (glasssheet) or wind-blasted Skippers Notch throat: twisted bonsai/flagged glass_pine!
    if(skey==='glasssheet'&&glass01>0.48){
     if(rng()>0.44*q||!free(px,pz,3.8))continue;
     claim('glass_pine',px,pz,3.8);
     const sc=rr(0.68,1.04);
     if(dCam<NEAR_TREE_R||!IMP){
      RICOCHET.growTree('glass_pine',px,py,pz,tSeed,sc,{leanRad:venturi.leanRad,windDir:venturi.dir});
     }else{
      BIO.impostorPut('rp_imp_trees',IMP.pine,[px,py,pz],rr(0,TAU),sc,null);
     }
     recordPlaced('glass_pine',px,py,pz,'tagamite_barren',{band:bt.band,tagamite01:glass01});
     st.glass_pine++;
     continue;
    }

    if(skey==='notch'&&venturi.speedup>1.55){
     if(rng()>0.46*q||!free(px,pz,3.8))continue;
     claim('glass_pine',px,pz,3.8);
     const sc=rr(0.76,1.08);
     if(KIN&&KIN.notchPine&&dCam<NEAR_TREE_R){
      const T=KIN.notchPine.make(px,py,pz,tSeed,sc,{leanRad:venturi.leanRad,windDir:venturi.dir});
      KIN.notchPine.grow(T,2);
      st.kinKrummholz++;
     }else if(dCam<NEAR_TREE_R||!IMP){
      RICOCHET.growTree('glass_pine',px,py,pz,tSeed,sc,{leanRad:venturi.leanRad,windDir:venturi.dir});
     }else{
      BIO.impostorPut('rp_imp_trees',IMP.pine,[px,py,pz],rr(0,TAU),sc,null);
     }
     recordPlaced('glass_pine',px,py,pz,'breach_notch',{band:bt.band,leanRad:venturi.leanRad});
     st.glass_pine++;
     continue;
    }

    // Dense thermal-belt boreal taiga (+6..+95 m on central rebound island & lower talus aprons!)
    if(rng()>0.68*q||!free(px,pz,4.5))continue;
    const uRoll=rng();
    let kind='crater_spruce';
    if(uRoll<0.30)kind='shatter_larch';
    else if(uRoll<(skey==='vents'&&heatLift>5.0?0.62:0.52))kind='ejecta_birch';
    else if(glass01>0.38&&uRoll<0.68)kind='glass_pine';

    claim(kind,px,pz,4.5);
    const sc=rr(0.84,1.16);
    if(dCam<NEAR_TREE_R||!IMP){
     RICOCHET.growTree(kind,px,py,pz,tSeed,sc,{leanRad:venturi.leanRad,windDir:venturi.dir});
    }else{
     const slot=kind==='shatter_larch'?IMP.larch:(kind==='ejecta_birch'?IMP.birch:(kind==='glass_pine'?IMP.pine:IMP.spruce));
     BIO.impostorPut('rp_imp_trees',slot,[px,py,pz],rr(0,TAU),sc,null);
    }
    recordPlaced(kind,px,py,pz,bt.band,{band:bt.band,frostHollow01:bt.frostHollow01});
    st[kind]++;
   }
  }

  // ---------------------------------------------------------------- 4. UNDERSTOREY FROST-HOLLOW SEDGE, SHOCK-LICHEN, BOULDERS & NURSE LOGS
  {
   const cell=12.0,N=Math.ceil((R*1.65)/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const cx=-R*0.82+(ix+0.5)*cell,cz=-R*0.82+(iz+0.5)*cell;
    if(Math.hypot(cx,cz)>R*0.84)continue;
    reseed(KRAND.cell(seed+510,ix,iz));
    const px=cx+rr(-0.44,0.44)*cell,pz=cz+rr(-0.44,0.44)*cell;
    if(inReserveCore(px,pz)||nearCam(px,pz,4.5))continue;
    const py=Y(px,pz),wy=W(px,pz);
    if(wy>-1e5&&py<=wy+0.18)continue;

    const heatLift=FIELD.heat(px,pz);
    const bt=RICOCHET_PHYS.bowlTreelineAt(px,pz,py-floorRefY,heatLift,site);
    const glass01=FIELD.glass(px,pz);
    const wetV=FIELD.wet(px,pz);

    // Crater-bottom frost hollows & alpine turf: dense Cold-Pool Tussock Sedge!
    if(bt.frostHollow01>0.48||wetV>0.38){
     if(rng()<0.64*q){
      const sSc=rr(0.52,0.98);
      const palS=(skey==='notch'&&rng()<0.25)?PAL.fireweed:PAL.sedge;
      BIO.put('rp_sedge',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[sSc,sSc*0.92,sSc],pickC(palS,0.04));
      recordPlaced('frost_hollow_sedge',px,py,pz,'frost_hollow',{frostHollow01:bt.frostHollow01});
      st.frost_hollow_sedge++;
     }
     if(skey==='highbowl'&&rng()<0.24*q){
      const bSc=rr(0.75,1.85);
      BIO.put('rp_rock_suevite',[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bSc*1.18,bSc*0.72,bSc],pickC(PAL.suevite,0.03));
      st.boulders++;
     }
     continue;
    }

    // Tagamite melt-sheet & stony aprons: silver-gold Star-Burst Reindeer Moss (shock_lichen), nurse logs & black melt bombs!
    if(glass01>0.36||skey==='glasssheet'||skey==='notch'){
     if(rng()<0.58*q){
      const lSc=rr(0.72,1.38);
      BIO.put('rp_lichen_mat',[px,py-0.02,pz],qEuler(0,rr(0,TAU),0),[lSc,lSc,lSc],pickC(PAL.lichen,0.03));
      if(rng()<0.38){
       const cSc=rr(0.24,0.46);
       BIO.put('rp_lichen_cushion',[px+rr(-0.25,0.25),py+0.01,pz+rr(-0.25,0.25)],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.65,cSc],pickC(PAL.lichen,0.03));
      }
      recordPlaced('shock_lichen',px,py,pz,'tagamite_barren',{tagamite01:glass01});
      st.shock_lichen++;
     }
     if(rng()<0.06*q){
      const lgLen=rr(2.2,4.2);
      BIO.put('rp_log',[px,py+0.08,pz],qEuler(Math.PI*0.5,rr(0,TAU),0),[1.0,lgLen,1.0],C(0x6e5c4c));
      st.logs++;
     }else if(rng()<0.22*q){
      const bSc=rr(0.85,2.20);
      const rItem=(glass01>0.42||rng()<0.35)?'rp_rock_tagamite':'rp_rock_suevite';
      const rPal=rItem==='rp_rock_tagamite'?PAL.tagamite:PAL.suevite;
      BIO.put(rItem,[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[bSc*1.24,bSc*0.68,bSc],pickC(rPal,0.03));
      st.boulders++;
     }
     continue;
    }

    // Forested thermal-belt floor: ferns, reindeer-moss patches & cushions, nurse logs, suevite blocks & tagamite melt bombs
    if(rng()<0.42*q){
     const fSc=rr(0.46,0.88);
     BIO.put('rp_fern',[px,py-0.03,pz],qEuler(0,rr(0,TAU),0),[fSc,fSc*0.86,fSc],pickC(PAL.willow,0.04));
    }
    if(rng()<0.28*q){
     const lSc=rr(0.65,1.18);
     BIO.put('rp_lichen_mat',[px+rr(-0.5,0.5),py-0.02,pz+rr(-0.5,0.5)],qEuler(0,rr(0,TAU),0),[lSc,lSc,lSc],pickC(PAL.lichen,0.03));
     if(rng()<0.35){
      const cSc=rr(0.24,0.44);
      BIO.put('rp_lichen_cushion',[px+rr(-0.25,0.25),py+0.01,pz+rr(-0.25,0.25)],qEuler(0,rr(0,TAU),0),[cSc,cSc*0.65,cSc],pickC(PAL.lichen,0.03));
     }
     recordPlaced('shock_lichen',px,py,pz,'thermal_taiga',{});
     st.shock_lichen++;
    }
    if(rng()<0.08*q){
     const lgLen=rr(2.4,4.6);
     BIO.put('rp_log',[px,py+0.08,pz],qEuler(Math.PI*0.5,rr(0,TAU),0),[1.0,lgLen,1.0],C(0x6e5c4c));
     st.logs++;
    }else if(rng()<0.14*q){
     const bSc=rr(0.80,2.05);
     const isTag=rng()<0.28;
     BIO.put(isTag?'rp_rock_tagamite':'rp_rock_suevite',[px,py-bSc*0.28,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[bSc*1.20,bSc*0.74,bSc],pickC(isTag?PAL.tagamite:PAL.suevite,0.03));
     st.boulders++;
    }
   }
  }

  return st;
 };
})();
