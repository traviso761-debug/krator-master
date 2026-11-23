/* ==================== DROWN — deterministic KRAND.cell + KSPACE placement ([G data], PLAN.md sections 4, 7) ==================== */
/* Zero THREE, zero DOM, zero Math.random, zero sin-hash; numeric defaults strictly x == null ? d : x.
   Every cell draws independently from KRAND.cell(seed + salt, ix, iz), gated by DROWN_PHYS:
   - brucitestack (+ limeshelf, seepcomb) only where bruciteStackAt.active === true (pH >= 10.5)
   - verdigrismangrove & tealcoppice only on ultramaficByte >= 128 below trimElevM
   - araucaria & pycnandra strictly above trimElevM (>= +48 m on skerry)
   - snaggrove in subsided sedimentary lagoons with oyster collars capped at <= +1.80 m
   - shoalkelp strictly submarine at bedY <= -0.5 m (down to -28 m trench lip). */

(function(){
 const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn;
 const C=DROWN.C,PAL=DROWN.PAL;
 const pickC=(a,j)=>{
  const c=C(a[Math.floor(rng()*a.length)%a.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.3,rr(-j,j),rr(-j,j));
  return c;
 };
 const Y=(x,z)=>BIO.host.terrainH(x,z);

 DROWN.buildDrown=function(R,q,o){
  o=o||{};
  q=q==null?1:q;
  R=R==null?660:R;
  DROWN.LOG.length=0;
  DROWN.VAPOUR.length=0;

  const sp=o.space||(typeof KSPACE!=='undefined'?KSPACE.create({cell:16}):null);
  if(sp&&sp.clear){
   sp.clear();
   if(typeof reserveStageObstacles==='function')reserveStageObstacles(sp);
  }
  const free=(x,z,r)=>!sp||!sp.some(x,z,r,it=>Math.hypot(x-it.x,z-it.z)<it.r+r);
  const claim=(kind,x,z,r)=>{if(sp)sp.insert({kind,x,z,r},x,z,r);};

  const site=o.site||SITE;
  const trimY=o.trimElevM==null?(site.trimElevM==null?48.0:site.trimElevM):o.trimElevM;
  const ultraByte=site.ultramaficByte==null?255:site.ultramaficByte;
  const niByte=site.niByte==null?180:site.niByte;
  const coalByte=site.coalByte==null?0:site.coalByte;
  const jadeByte=site.jadeByte==null?0:site.jadeByte;

  const faultDistAt=o.faultDist||(x=>L.faultDist(x,0));
  const shearAt=o.shear||L.shearAt;
  const shelterAt=o.shelter||L.shelterAt;
  const sandAt=o.sand||L.SAND;
  const coalAt=o.coal||L.COAL;
  const inPool=o.inBrucitePool||L.inBrucitePool;

  const st={
   verdigrismangrove:0,tealcoppice:0,brucitestack:0,spongecoral:0,
   tidefan:0,shoalkelp:0,ribbonseagrass:0,snaggrove:0,
   limeshelf:0,seepcomb:0,stormwrack:0,driftwood:0,
   araucaria:0,pycnandra:0,gymnostoma:0,verdigris:0,
   boulders:0,jadeNodes:0,coalNodes:0
  };
  const seed=KRAND.child(1000731,'drownlands/life');
  const Lv=BIO.LOD(),c0=BIO.center();

  const log=(rec)=>{DROWN.LOG.push(rec);};

  const cellPass=(cell,salt,maxD,fn)=>{
   const N=Math.ceil(R*2/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const x=c0[0]-R+(ix+0.5)*cell,z=c0[1]-R+(iz+0.5)*cell;
    if(Math.hypot(x-c0[0],z-c0[1])>R)continue;
    const ld=BIO.lodD(x,z);
    if(ld>maxD)continue;
    reseed(KRAND.cell(seed+salt,ix,iz));
    const px=x+rr(-0.46,0.46)*cell,pz=z+rr(-0.46,0.46)*cell;
    if(inPool(px,pz,0.92))continue;
    const py=Y(px,pz);
    fn(px,py,pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);
   }
  };

  /* 1. INTERTIDAL BRUCITE-ARAGONITE HYDROTHERMAL CHIMNEYS (Station 1 shoal fault step, pH 10.5-11.8) */
  cellPass(14.5,1,Lv.far,(x,y,z,lv)=>{
   const br=DROWN_PHYS.bruciteStackAt({
    ultramaficByte:ultraByte,
    faultDistM:L.faultDist(x,z),
    waterDepthM:y,
    tidalRangeM:site.tideRangeM,
    waveShearPa:shearAt(x,z)
   });
   if(!br.active)return;
   const poolRimBoost=site.brucitePools?site.brucitePools.reduce((m,p)=>Math.max(m,smooth(p.r*1.75,p.r*1.02,Math.hypot(x-p.x,z-p.z))),0):0;
   const prob=(0.34+0.52*poolRimBoost)*q;
   if(rng()>prob)return;
   const H0=br.stackHeightM*rr(0.78,1.0);
   const rad=clamp(H0*rr(0.22,0.34),0.32,1.25);
   if(!free(x,z,rad*1.35))return;
   claim('brucitestack',x,z,rad*1.25);
   const yaw=rr(0,TAU);
   BIO.put('dl_brucite_spire',[x,y-0.16,z],qEuler(rr(-0.03,0.03),yaw,rr(-0.03,0.03)),[rad*1.6,H0,rad*1.6],pickC(PAL.brucite,0.02));
   BIO.put('dl_brucite_collar',[x,y+0.02,z],qEuler(0,yaw+0.7,0),[rad*1.85,rr(0.5,0.95),rad*1.85],pickC(PAL.celadon,0.02));
   log({species:'brucitestack',x,y,z,pH:br.pH,stackHeightM:+H0.toFixed(2),ultramaficByte:ultraByte,woodyRefuge:false});
   st.brucitestack++;

   /* Twin satellite flutes + native Kratorian limeshelf & seepcomb rims */
   if(lv>0){
    const nShelf=ri(2,3);
    for(let k=0;k<nShelf;k++){
     const az=yaw+(k/nShelf)*TAU+rr(-0.3,0.3),sx=x+Math.cos(az)*rad*0.72,sz=z+Math.sin(az)*rad*0.72;
     const sy=Math.max(y+0.08,Math.min(y+H0*0.55,0.18+rr(-0.15,0.35)));
     const ss=rr(0.18,0.44);
     BIO.put('dl_limeshelf',[sx,sy,sz],qEuler(rr(-0.1,0.1),az,0),[ss,ss,ss],pickC(PAL.limeshelf,0.02));
     st.limeshelf++;
    }
    if(rng()<0.75){
     const ca=yaw+rr(0,TAU),cx=x+Math.cos(ca)*rad*1.12,cz=z+Math.sin(ca)*rad*1.12,cy=Y(cx,cz);
     const cs=rr(0.22,0.48);
     BIO.put('dl_seepcomb',[cx,cy+0.05,cz],qEuler(rr(-0.15,0.15),ca,0),[cs,cs,cs],pickC(PAL.seepcomb,0.02));
     st.seepcomb++;
    }
   }
   if(y+H0>0.12&&DROWN.VAPOUR.length<28){
    DROWN.VAPOUR.push([x,y+H0*0.92,z]);
   }
  });

  /* 2. AMPHIBIOUS TEAL-SAP PROP-ROOT MANGROVES (verdigrismangrove: ultramaficByte >= 128, -1.2 <= y <= +18 m) */
  cellPass(14.5,2,Lv.mid,(x,y,z,lv)=>{
   const nm=DROWN_PHYS.nickelMangroveAt({
    ultramaficByte:ultraByte,
    niByte:niByte,
    elevM:y,
    depthM:Math.max(0,-y),
    trimElevM:trimY,
    waveShearPa:shearAt(x,z)
   });
   if(!nm.propRootOk)return;
   const slope=BIO.field('slope',x,z);
   if(slope>0.62)return;
   /* Denser along sheltered intertidal skerry/cove margins (-1.0..+6.5 m) */
   const shorePref=smooth(14.0,2.2,y)*smooth(-1.25,-0.35,y);
   const prob=(0.18+0.56*shorePref)*(1-0.5*smooth(0.35,0.62,slope))*q;
   if(rng()>prob||!free(x,z,2.6))return;
   const sc=rr(0.78,1.22)*(0.75+0.3*shorePref);
   claim('verdigrismangrove',x,z,2.5*sc);
   const g=DROWN.growMangrove(x,y,z,KRAND.hash(seed,Math.round(x*10),Math.round(z*10),21),sc);
   log({species:'verdigrismangrove',x,y,z,H:g.H,ultramaficByte:ultraByte,latexNiPct:nm.latexNiPct,woodyRefuge:false});
   st.verdigrismangrove++;
  });

  /* 3. BLUE-BLEED SKERRY SCRUB (tealcoppice: ultramaficByte >= 128, +2.0 <= y < trimElevM) */
  cellPass(9.0,3,Lv.mid,(x,y,z,lv)=>{
   const nm=DROWN_PHYS.nickelMangroveAt({
    ultramaficByte:ultraByte,
    niByte:niByte,
    elevM:y,
    trimElevM:trimY,
    waveShearPa:shearAt(x,z)
   });
   if(!nm.coppiceShrubOk)return;
   const slope=BIO.field('slope',x,z);
   if(slope>0.68||!free(x,z,1.3))return;
   const benchBoost=SKEY==='bar'?smooth(1.3,0.4,ellipDist(x,z,site.coppiceBench.x,site.coppiceBench.z,site.coppiceBench.rx,site.coppiceBench.rz,-0.22)):0.35;
   if(rng()>(0.26+0.42*benchBoost)*q)return;
   const s=rr(0.95,2.15),yaw=rr(0,TAU);
   claim('tealcoppice',x,z,1.1);
   const ownPrev=BIO.owner;
   BIO.owner=[x,z];
   try{
    BIO.tube('dl_mangrove_wood',[{x,y:y-0.25,z,r:0.08*s},{x:x+0.08,y:y+0.45*s,z,r:0.045*s}],PAL.mangroveBark[0],{seg:5});
    BIO.put('dl_coppice_fol',[x,y+0.38*s,z],qEuler(0,yaw,0),[s*1.05,s*0.72,s*1.05],pickC(PAL.coppiceLeaf,0.03),{n:[0,1,0]});
    if(lv>0&&rng()<0.55){
     const rs=rr(0.16,0.32);
     BIO.put('dl_coppice_ring',[x+0.32*s,Y(x+0.32*s,z)+0.03,z],qEuler(0,yaw,0),[rs,rs,rs],pickC(PAL.tealsap,0.02));
    }
   }finally{
    BIO.owner=ownPrev;
   }
   log({species:'tealcoppice',x,y,z,ultramaficByte:ultraByte,latexNiPct:nm.latexNiPct,woodyRefuge:false});
   st.tealcoppice++;
  });

  /* 4. SALT-PETRIFIED DROWNED TSUNAMI SNAGS (Station 3 drowned sedimentary lagoon, oyster collar <= +1.80 m) */
  cellPass(13.5,4,Lv.far,(x,y,z,lv)=>{
   const sn=DROWN_PHYS.snagLagoonAt({
    sedimentary01:ultraByte<128?1.0:0.0,
    coalByte:coalByte,
    elevM:y,
    subsidenceM:site.subsidenceM==null?6.0:site.subsidenceM,
    shelter01:shelterAt(x,z)
   });
   if(!sn.snagOk)return;
   /* Keep navigation gut open */
   if(L.chute&&distToPoly(L.chute.pts,x,z).d<L.chute.width*0.85)return;
   if(rng()>0.62*sn.snagDensity01*q||!free(x,z,2.8))return;
   const sc=rr(0.75,1.25);
   claim('snaggrove',x,z,2.4*sc);
   const g=DROWN.growSnag(x,y,z,KRAND.hash(seed,Math.round(x*10),Math.round(z*10),41),sn.collarTopM,sc);
   log({species:'snaggrove',x,y,z,H:g.H,collarTopM:g.collarTopM,ultramaficByte:ultraByte,woodyRefuge:false});
   st.snaggrove++;
  });

  /* 5. HIGH SKERRY REFUGE CROWN FOREST (Station 4 skerry strictly >= trimElevM +48.0 m!) */
  if(SKEY==='skerry'){
   cellPass(15.5,5,Lv.far,(x,y,z,lv)=>{
    if(y<trimY)return;
    const nm=DROWN_PHYS.nickelMangroveAt({
     ultramaficByte:ultraByte,
     niByte:niByte,
     elevM:y,
     trimElevM:trimY,
     waveShearPa:shearAt(x,z)
    });
    if(!nm.refugeTreeOk)return;
    const slope=BIO.field('slope',x,z);
    if(slope>0.62||!free(x,z,3.4))return;
    if(rng()>0.64*(1-0.5*smooth(0.35,0.62,slope))*q)return;
    const roll=rng(),cSeed=KRAND.hash(seed,Math.round(x*10),Math.round(z*10),51);
    if(roll<0.58){
     const sc=rr(0.85,1.22);
     claim('araucaria',x,z,3.4);
     const g=DROWN.growAraucaria(x,y,z,cSeed,sc);
     log({species:'araucaria',x,y,z,H:g.H,ultramaficByte:ultraByte,woodyRefuge:true});
     st.araucaria++;
    }else{
     const sc=rr(0.85,1.25);
     claim('pycnandra',x,z,2.4);
     const g=DROWN.growPycnandra(x,y,z,cSeed,sc);
     log({species:'pycnandra',x,y,z,H:g.H,ultramaficByte:ultraByte,latexNiPct:nm.latexNiPct,woodyRefuge:true});
     st.pycnandra++;
    }
   });

   /* Maquis she-oak (gymnostoma) & nickel-crust verdigris caps on >= +48 m red laterite cuirasse */
   cellPass(9.5,6,Lv.mid,(x,y,z,lv)=>{
    if(y<trimY||BIO.field('slope',x,z)>0.65||!free(x,z,1.4))return;
    if(rng()>0.48*q)return;
    const s=rr(1.15,2.25),yaw=rr(0,TAU);
    claim('gymnostoma',x,z,1.2);
    const ownPrev=BIO.owner;
    BIO.owner=[x,z];
    try{
     BIO.tube('dl_arch_wood',[{x,y:y-0.25,z,r:0.07*s},{x,y:y+0.48*s,z,r:0.035*s}],PAL.archBark[0],{seg:5});
     BIO.put('dl_gymno_fol',[x,y+0.42*s,z],qEuler(0,yaw,0),[s*0.92,s*0.85,s*0.92],pickC(PAL.archScale,0.03),{n:[0,1,0]});
    }finally{
     BIO.owner=ownPrev;
    }
    log({species:'gymnostoma',x,y,z,ultramaficByte:ultraByte,woodyRefuge:false});
    st.gymnostoma++;
   });

   cellPass(11.0,7,Lv.mid,(x,y,z,lv)=>{
    if(y<trimY||BIO.field('slope',x,z)>0.55||rng()>0.34*q)return;
    const s=rr(0.42,1.15),hs=s*rr(0.35,0.62);
    BIO.put('dl_verdigris_stalk',[x,y-0.05,z],qEuler(0,rr(0,TAU),0),[s*0.58,hs,s*0.58],pickC(PAL.brucite,0.02));
    BIO.put('dl_verdigris_cap',[x,y+hs*0.92,z],qEuler(rr(-0.1,0.1),rr(0,TAU),rr(-0.1,0.1)),[s,s*0.85,s],pickC(PAL.verdigris,0.03));
    log({species:'verdigris',x,y,z,ultramaficByte:ultraByte,woodyRefuge:false});
    st.verdigris++;
   });
  }

  /* 6. SUBMARINE TETHERED BUOY-KELP (shoalkelp: STRICTLY bedY <= -0.5 m and >= -28.0 m!) */
  cellPass(15.5,8,Lv.floor[1],(x,y,z,lv)=>{
   const sf=DROWN_PHYS.shoalFloraAt({elevM:y,waveShearPa:shearAt(x,z),sand01:sandAt(x,z)});
   if(!sf.kelpOk||y>-0.5)return;
   if(rng()>0.48*q||!free(x,z,0.9))return;
   const len=clamp(sf.kelpLenM*rr(0.72,0.96),1.1,Math.max(1.1,-y-0.12));
   const yaw=rr(0,TAU),colK=pickC(PAL.kelp,0.04);
   const ownPrev=BIO.owner;
   BIO.owner=[x,z];
   try{
    BIO.put('dl_kelp_stipe',[x,y-0.08,z],qEuler(0,yaw,0),[1.0,len*0.92,1.0],colK);
    const nFr=lv===2?3:2;
    for(let k=0;k<nFr;k++){
     const ka=yaw+(k/nFr)*TAU+rr(-0.25,0.25);
     BIO.put('dl_kelp_blade',[x+Math.cos(ka)*0.12,y+0.04,z+Math.sin(ka)*0.12],qEuler(rr(-0.08,0.08),ka,rr(-0.08,0.08)),[0.85+0.35*rng(),len,0.85],colK);
    }
    if(lv>0){
     BIO.put('dl_kelp_float',[x,y+len*0.90,z],qEuler(0,yaw,0),[0.22,0.28,0.22],colK);
    }
   }finally{
    BIO.owner=ownPrev;
   }
   log({species:'shoalkelp',x,y,z,bedElevM:y,kelpLenM:len,woodyRefuge:false});
   st.shoalkelp++;
  });

  /* 7. SHOAL EEL-MEADOW SEAGRASS (ribbonseagrass: -11.5..+0.2 m sand/silt shoals & lagoons) */
  cellPass(10.5,9,Lv.floor[1],(x,y,z,lv)=>{
   const sf=DROWN_PHYS.shoalFloraAt({elevM:y,waveShearPa:shearAt(x,z),sand01:Math.max(sandAt(x,z),SKEY==='drowned'?0.65:0.3)});
   if(!sf.seagrassOk||y>0.2)return;
   if(rng()>0.54*q)return;
   const n=lv===2?ri(2,3):1;
   for(let k=0;k<n;k++){
    const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2),py=Y(px,pz);
    if(py>0.2||py<-11.5||inPool(px,pz,0.95))continue;
    const h0=rr(0.65,1.75);
    BIO.put('dl_seagrass',[px,py-0.04,pz],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[h0*0.55,h0,h0*0.55],pickC(PAL.seagrass,0.03));
    if(k===0){
     log({species:'ribbonseagrass',x:px,y:py,z:pz,bedElevM:py,woodyRefuge:false});
     st.ribbonseagrass++;
    }
   }
  });

  /* 8. OCHRE-TURQUOISE SHOAL BIOHERMS (spongecoral) & FLEXIBLE GORGONIAN FANS (tidefan) */
  cellPass(11.5,10,Lv.mid,(x,y,z,lv)=>{
   const sf=DROWN_PHYS.shoalFloraAt({elevM:y,waveShearPa:shearAt(x,z),sand01:sandAt(x,z)});
   if(!sf.spongeOk)return;
   const flatBoost=L.SPONGE(x,z);
   if(rng()>(0.24+0.52*flatBoost)*q||!free(x,z,0.75))return;
   const r0=rr(0.32,0.92),h0=r0*rr(0.48,0.82);
   claim('spongecoral',x,z,r0*0.9);
   const isBrain=rng()<0.44;
   const pal=isBrain?PAL.coralBrain:(rng()<0.55?PAL.spongeOchre:PAL.spongeTeal);
   BIO.put(isBrain?'dl_coral_brain':'dl_sponge_cushion',[x,y-0.06,z],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[r0,h0,r0],pickC(pal,0.03));
   log({species:'spongecoral',x,y,z,woodyRefuge:false});
   st.spongecoral++;
  });

  cellPass(12.5,11,Lv.floor[1],(x,y,z,lv)=>{
   const sf=DROWN_PHYS.shoalFloraAt({elevM:y,waveShearPa:shearAt(x,z),sand01:sandAt(x,z)});
   if(!sf.fanOk||y>0.35)return;
   if(rng()>0.38*q)return;
   const h0=rr(0.58,1.65);
   BIO.put('dl_tidefan',[x,y-0.04,z],qEuler(rr(-0.1,0.1),rr(0,TAU),rr(-0.1,0.1)),[h0*0.85,h0,h0*0.85],pickC(PAL.fanSaffron,0.04));
   log({species:'tidefan',x,y,z,woodyRefuge:false});
   st.tidefan++;
  });

  /* 9. TSUNAMI CRIMSON STORM-WRACK & DRIFTWOOD RAFTS (boulder-bar swash & drowned boom cove) */
  cellPass(10.5,12,Lv.mid,(x,y,z,lv)=>{
   if(y<-0.6||y>9.5)return;
   const boomBoost=(SKEY==='drowned'&&site.boomZone)?smooth(site.boomZone.r*1.3,site.boomZone.r*0.2,Math.hypot(x-site.boomZone.x,z-site.boomZone.z)):0;
   const strand=smooth(5.5,0.4,Math.abs(y-1.2));
   const w0=Math.max(strand*0.42,boomBoost*0.92);
   if(w0<0.18||rng()>w0*q)return;
   const sw=rr(0.5,1.05);
   BIO.put('dl_wrack',[x,y+0.02,z],qEuler(0,rr(0,TAU),0),[sw*1.25,sw*0.52,sw*1.25],pickC(PAL.wrack,0.03));
   log({species:'stormwrack',x,y,z,woodyRefuge:false});
   st.stormwrack++;
   if((boomBoost>0.3||rng()<0.28)&&free(x,z,2.5)){
    const len=rr(4.2,11.5),th=rr(0.85,1.55);
    claim('driftlog',x,z,len*0.35);
    const ly=boomBoost>0.3?Math.max(y,0.02):y-0.03;
    BIO.put('dl_driftlog',[x,ly,z],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[len,th,th],pickC(PAL.snagWood,0.02));
    st.driftwood++;
   }
  });

  /* 10. IMBRICATED SERPENTINITE, NEPHRITE JADE (jade = 200) & BITUMINOUS COAL (coal = 214) BOULDERS */
  cellPass(12.5,13,Lv.far,(x,y,z,lv)=>{
   if(SKEY==='drowned'){
    const cl=coalAt(x,z);
    if(cl<0.32||y<-1.5||!free(x,z,1.8))return;
    if(rng()>0.54*cl*q)return;
    const rx=rr(0.85,2.4),ry=rr(0.45,1.15);
    claim('coal',x,z,rx);
    const isJade=jadeByte>=150&&L.SAND(x,z)>0.35&&rng()<0.28;
    BIO.put(isJade?'dl_rock_jade':'dl_rock_coal',[x,y-ry*0.25,z],qEuler(rr(-0.12,0.12),rr(0,TAU),rr(-0.12,0.12)),[rx,ry,rx*rr(0.8,1.2)],
     pickC(isJade?PAL.jadeRock:PAL.coalRock,0.02));
    if(isJade)st.jadeNodes++;else st.coalNodes++;
    return;
   }
   const chBoost=(SKEY==='bar'&&L.chevH)?smooth(0.8,10.0,L.chevH(x,z)):0;
   const shoreRock=y>-2.5&&y<36.0?(0.16+0.68*chBoost):0;
   if(shoreRock<=0||rng()>shoreRock*q||!free(x,z,1.8))return;
   const rx=rr(0.75,2.8)*(1+0.45*chBoost),ry=rx*rr(0.52,0.84);
   claim('boulder',x,z,rx*0.9);
   /* Imbricated seaward tilt toward Steaming Seamounts on Station 2 bar */
   const pitch=SKEY==='bar'&&chBoost>0.2?rr(0.18,0.38):rr(-0.14,0.14);
   const isJade=jadeByte>=120&&rng()<(SKEY==='bar'?0.26:0.12);
   const isBasalt=SKEY==='bar'&&!isJade&&rng()<0.25;
   const item=isJade?'dl_rock_jade':isBasalt?'dl_rock_basalt':'dl_rock_serp';
   const pal=isJade?PAL.jadeRock:isBasalt?PAL.basaltRock:PAL.serpRock;
   BIO.put(item,[x,y-ry*0.28,z],qEuler(pitch,rr(0,TAU),rr(-0.12,0.12)),[rx,ry,rx*rr(0.78,1.18)],pickC(pal,0.03));
   if(isJade)st.jadeNodes++;else st.boulders++;
  });

  return st;
 };
})();
