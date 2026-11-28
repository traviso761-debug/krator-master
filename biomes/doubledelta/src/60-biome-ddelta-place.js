// ================================================================= DOUBLEDELTA — deterministic KRAND.cell + KSPACE placement (PLAN.md §5, §10)
// Places Double Delta's 22 species & biogenic features strictly by DDELTA_PHYS.ecotoneAt, trimlineAt, salinityAt, and scourExpose.
// Every cell is seeded independently via KRAND.cell(seed + salt, ix, iz) — never from a running draw counter, Math.random, or sin-hash.
// Logs placed records to DOUBLEDELTA.LOG for verify.py --assert physical/geochemical invariant checks.
(function(){
 const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn;
 const C=DOUBLEDELTA.C,PAL=DOUBLEDELTA.PAL;
 const pickC=(a,j)=>{
  const c=C(a[Math.floor(rng()*a.length)%a.length]);
  if(j)c.offsetHSL(rr(-j,j)*0.3,rr(-j,j),rr(-j,j));
  return c;
 };
 const Y=(x,z)=>BIO.host.terrainH(x,z);
 const W=(x,z)=>BIO.host.waterH(x,z);

 DOUBLEDELTA.LOG=[];
 DOUBLEDELTA.OSCULA=[];

 DOUBLEDELTA.buildDelta=function(R,q,o){
  o=o||{};
  q=q==null?1:q;
  R=R==null?2450:R;
  DOUBLEDELTA.LOG.length=0;
  DOUBLEDELTA.OSCULA.length=0;

  const sp=o.space||(typeof KSPACE!=='undefined'?KSPACE.create({cell:18}):null);
  if(sp&&sp.clear)sp.clear();
  const free=(x,z,r)=>!sp||!sp.some(x,z,r,it=>Math.hypot(x-it.x,z-it.z)<it.r+r);
  const claim=(kind,x,z,r)=>{if(sp)sp.insert({kind,x,z,r},x,z,r);};

  const psuAt=o.psu||PSU_AT;
  const silicaAt=o.silica||SILICA_AT;
  const ecoAt=o.ecotone||ECOTONE_AT;
  const minWoodyY=o.minWoodyY==null?MIN_WOODY_Y:o.minWoodyY;
  const lagAt=o.lag||L.LAG;
  const peatAt=o.peat||L.PEAT;
  const wrackAt=o.wrack||L.WRACK;
  const amberAt=o.amber||L.AMBER;
  const bitAt=o.bitumen||L.BITUMEN;
  const blueAt=o.blueClay||L.BLUECLAY;
  const mireAt=o.mire||L.MIRE;
  const reserve=o.reserve||(SITE.settlementReserve||null);

  const st={
   chimneysponge:0,brainsponge:0,glassbasket:0,tarfelt:0,
   seapen:0,whippen:0,snaphydroid:0,penshell:0,visoroyster:0,
   bellowsreed:0,bamboorice:0,tetherpad:0,wildrice:0,brimreed:0,fensedge:0,
   driftwrack:0,driftwood:0,riaamber:0,coconut:0,
   bluffoak:0,bluffcedar:0,bluffcypress:0,bluffpine:0,bluffbamboo:0
  };
  const seed=KRAND.child(1000511,'doubledelta/life');
  const Lv=BIO.LOD(),c0=BIO.center();

  const log=(item,species,x,y,z,woody,clearM)=>{
   DOUBLEDELTA.LOG.push({
    item,species,x,y,z,woody:!!woody,clearM:clearM==null?0:+clearM,
    psu:psuAt(x,z),silicaMgL:silicaAt(x,z),amberLag01:amberAt(x,z),bitumen01:bitAt(x,z)
   });
  };

  /* Order-free cell pass: options allow shallow intertidal cells (allowWet) */
  const cellPass=(cell,salt,maxD,allowWet,fn)=>{
   const N=Math.ceil(R*2/cell);
   for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
    const x=c0[0]-R+(ix+0.5)*cell,z=c0[1]-R+(iz+0.5)*cell;
    if(Math.hypot(x-c0[0],z-c0[1])>R)continue;
    const ld=BIO.lodD(x,z);
    if(ld>maxD)continue;
    reseed(KRAND.cell(seed+salt,ix,iz));
    const px=x+rr(-0.48,0.48)*cell,pz=z+rr(-0.48,0.48)*cell;
    if(!allowWet&&BIO.mask(px,pz)<=0)continue;
    const py=Y(px,pz),wy=W(px,pz);
    fn(px,py,pz,wy,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);
   }
  };

  /* Keep the core terrace of site:ria-sound clear of tall trunks so the reserved town site reads cleanly */
  const inReserveCore=(x,z)=>reserve?Math.hypot(x-reserve.x,z-reserve.z)<reserve.r*0.58:false;

  // 1. GREAT CHIMNEY-SPONGE BIOHERMS: fluted barrel, organ-pipe & terraced reef-mound colonies (silica >= 14 mg/L, < +16 m)
  cellPass(24,1,Lv.far,false,(x,y,z,wy,lv)=>{
   const eco=ecoAt(x,z),si=silicaAt(x,z);
   if(!eco.spongeOk||si<14.0||bitAt(x,z)>0.18||mireAt(x,z)>0.25)return;
   if(wy>-1e8&&y<wy+0.12)return;
   let moundBoost=0;
   if(SITE.biohermMounds){
    for(const m of SITE.biohermMounds)moundBoost=Math.max(moundBoost,smooth(m.r*1.5,m.r*0.3,Math.hypot(x-m.x,z-m.z)));
   }
   const prob=(0.24+0.62*moundBoost)*smooth(14,21,si)*(1-0.6*blueAt(x,z))*q;
   if(rng()>prob)return;
   const H=rr(2.2,5.8)*(0.75+0.35*moundBoost),rad=rr(1.5,3.4)*(0.8+0.25*moundBoost);
   if(!free(x,z,rad*1.05))return;
   claim('bioherm',x,z,rad);
   const palPick=rng()<0.52?PAL.spongeOchre:rng()<0.68?PAL.spongeTeal:PAL.spongePlum;
   const colMain=pickC(palPick,0.03),yaw=rr(0,TAU),roll=rng();
   if(roll<0.44){
    BIO.put('ddchimney',[x,y-0.18,z],qEuler(rr(-0.04,0.04),yaw,rr(-0.04,0.04)),[rad,H,rad],colMain);
    log('ddchimney','chimneysponge',x,y,z,false);
   }else if(roll<0.78){
    BIO.put('ddorgan',[x,y-0.16,z],qEuler(rr(-0.04,0.04),yaw,rr(-0.04,0.04)),[rad*1.25,H*0.95,rad*1.25],colMain);
    log('ddorgan','chimneysponge',x,y,z,false);
   }else{
    BIO.put('ddmound',[x,y-0.14,z],qEuler(rr(-0.03,0.03),yaw,rr(-0.03,0.03)),[rad*1.35,H*0.62,rad*1.35],colMain);
    log('ddmound','chimneysponge',x,y,z,false);
   }
   /* Satellite reef-mound skirts around large bioherms */
   if(lv>0&&H>3.2){
    const nSat=ri(2,4);
    for(let k=0;k<nSat;k++){
     const a=yaw+k/nSat*TAU+rr(-0.35,0.35),d=rad*rr(0.75,1.25),sx=x+Math.cos(a)*d,sz=z+Math.sin(a)*d,sy=Y(sx,sz);
     if(W(sx,sz)>-1e8&&sy<W(sx,sz)-0.1)continue;
     const sr=rad*rr(0.42,0.68),sh=H*rr(0.32,0.52);
     BIO.put(k%2===0?'ddmound':'ddchimney',[sx,sy-0.12,sz],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[sr,sh,sr],pickC(palPick,0.04));
    }
   }
   if(H>3.5&&DOUBLEDELTA.OSCULA.length<36)DOUBLEDELTA.OSCULA.push([x,y+H*0.86,z]);
   st.chimneysponge++;
  });

  // 2. CUSHION BRAIN-HUMMOCKS: low meandroid sponge domes stabilizing bars & scour shoulders
  cellPass(15,2,Lv.mid,false,(x,y,z,wy,lv)=>{
   const eco=ecoAt(x,z),si=silicaAt(x,z);
   if(!eco.spongeOk||si<14.0||bitAt(x,z)>0.2||mireAt(x,z)>0.2)return;
   if(wy>-1e8&&y<wy-0.1)return;
   if(rng()>0.32*q||!free(x,z,1.1))return;
   const r0=rr(0.55,1.45),h0=r0*rr(0.55,0.88);
   claim('brainsponge',x,z,r0*0.9);
   BIO.put('ddbrain',[x,y-0.08,z],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[r0,h0,r0],pickC(PAL.brain,0.03));
   log('ddbrain','brainsponge',x,y,z,false);
   st.brainsponge++;
  });

  // 3. Venus-lattice silica spires (glassbasket): silica >= 15 mg/L along channel levee toes
  cellPass(18,3,Lv.mid,false,(x,y,z,wy,lv)=>{
   const eco=ecoAt(x,z),si=silicaAt(x,z);
   if(!eco.spongeOk||si<15.0||y>6.8||bitAt(x,z)>0.15)return;
   if(wy>-1e8&&y<wy)return;
   const nearW=BIO.field('wet',x,z);
   if(rng()>0.28*smooth(0.52,0.85,nearW)*q||!free(x,z,0.8))return;
   const h0=rr(0.85,2.4),r0=h0*rr(0.18,0.26);
   claim('glassbasket',x,z,r0*1.4);
   BIO.put('ddglass',[x,y-0.06,z],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[r0,h0*0.48,r0],pickC(PAL.glass,0.02));
   log('ddglass','glassbasket',x,y,z,false);
   st.glassbasket++;
  });

  // 4. RAINBOW SEEP-MATS (tarfelt) around natural bitumen seeps (Station 2 bitumen)
  cellPass(5.0,4,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   const bt=bitAt(x,z);
   if(bt<0.22)return;
   /* Ring the asphalt collar just outside the liquid tar surface */
   if(wy>-1e8&&y<wy-0.06)return;
   if(rng()>0.68*smooth(0.22,0.65,bt)*q)return;
   const s=rr(0.55,1.65);
   BIO.put('ddtarfelt',[x,y+0.02,z],qEuler(0,rr(0,TAU),0),[s,rr(0.6,1.4),s],pickC(PAL.tarfelt,0.04));
   log('ddtarfelt','tarfelt',x,y,z,false);
   st.tarfelt++;
  });

  // 5. FLEXIBLE CALCIFIED SEA-PEN MEADOWS (seapen, whippen, snaphydroid): intertidal mudbars & shallow tidal wash
  cellPass(7.0,5,Lv.mid,true,(x,y,z,wy,lv)=>{
   if(y>3.8||bitAt(x,z)>0.15||L.BLUFF(x,z)>0.2)return;
   const sub=wy>-1e8?(wy-y):-0.2;
   /* Intertidal & shallow subtidal zone: exposed mudbars down to 1.4 m shallow wash */
   if(sub>1.45||y<-2.2)return;
   const wet=BIO.field('wet',x,z),psu=psuAt(x,z);
   if(wet<0.55&&sub<0)return;
   const prob=(0.54*smooth(3.8,0.6,y)*(psu>=4?1:0.55))*q;
   if(rng()>prob||!free(x,z,0.55))return;
   const n=lv===2?ri(2,4):1;
   const fam=rng()<0.42?PAL.seapenPink:rng()<0.55?PAL.seapenOchre:PAL.seapenViolet;
   for(let k=0;k<n;k++){
    const a=rr(0,TAU),d=k?rr(0.35,1.6):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz);
    if(py>3.9||!free(px,pz,0.35))continue;
    const s=rr(0.75,2.15);
    BIO.put('ddseapen',[px,py-0.06,pz],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[s*0.72,s,s*0.72],pickC(fam,0.04));
    if(k===0){log('ddseapen','seapen',px,py,pz,false);st.seapen++;}
   }
  });

  cellPass(10.0,6,Lv.mid,true,(x,y,z,wy,lv)=>{
   if(y>2.6||bitAt(x,z)>0.15||L.BLUFF(x,z)>0.2)return;
   const sub=wy>-1e8?(wy-y):-0.3;
   if(sub>1.8||sub<-0.8)return;
   if(rng()>0.36*q||!free(x,z,0.6))return;
   const s=rr(1.2,2.9);
   BIO.put('ddwhippen',[x,y-0.08,z],qEuler(rr(-0.1,0.1),rr(0,TAU),rr(-0.1,0.1)),[s*0.52,s,s*0.52],pickC(PAL.whippen,0.03));
   log('ddwhippen','whippen',x,y,z,false);
   st.whippen++;
  });

  cellPass(8.0,7,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   if(y>2.8||bitAt(x,z)>0.15||L.BLUFF(x,z)>0.2)return;
   const sub=wy>-1e8?(wy-y):-0.2;
   if(sub>1.1||BIO.field('wet',x,z)<0.58)return;
   if(rng()>0.32*q)return;
   const s=rr(0.45,1.05);
   BIO.put('ddhydroid',[x,y-0.04,z],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[s*0.85,s,s*0.85],pickC(PAL.hydroid,0.03));
   log('ddhydroid','snaphydroid',x,y,z,false);
   st.snaphydroid++;
  });

  // 6. GIANT SEA-BYSSUS FAN-MUSSELS (penshell) & SURGE-CLAMP REEF OYSTERS (visoroyster)
  cellPass(9.5,8,Lv.mid,true,(x,y,z,wy,lv)=>{
   const lg=lagAt(x,z);
   if(lg<0.36||y>4.2||y<-1.8||bitAt(x,z)>0.15)return;
   if(rng()>0.44*lg*q||!free(x,z,0.7))return;
   const n=lv===2?ri(2,3):1;
   for(let k=0;k<n;k++){
    const px=x+rr(-1.1,1.1),pz=z+rr(-1.1,1.1),py=Y(px,pz),h0=rr(0.65,1.3);
    const yaw=rr(0,TAU);
    BIO.put('ddpenshell',[px,py-h0*0.32,pz],qEuler(rr(-0.14,0.14),yaw,rr(-0.14,0.14)),[h0*0.85,h0,h0*0.85],pickC(PAL.penshell,0.03));
    if(lv===2)BIO.put('ddbyssus',[px+0.08,py-0.04,pz],qEuler(0.35,yaw,0),[h0*0.45,h0*0.36,h0*0.45],pickC(PAL.byssus,0.03));
    if(k===0){log('ddpenshell','penshell',px,py,pz,false);st.penshell++;}
   }
  });

  cellPass(8.5,9,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   const lg=lagAt(x,z),bluffFoot=SKEY==='throat'?smooth(28,3,Math.abs(y-0.8))*L.BLUFF(x,z):0;
   const w0=Math.max(lg*smooth(3.2,-0.5,y),bluffFoot);
   if(w0<0.32||bitAt(x,z)>0.2)return;
   if(rng()>0.46*w0*q)return;
   const n=lv===2?ri(2,4):1;
   for(let k=0;k<n;k++){
    const px=x+rr(-0.9,0.9),pz=z+rr(-0.9,0.9),py=Y(px,pz),s=rr(0.28,0.78);
    BIO.put('ddoyster',[px,py+0.04,pz],qEuler(rr(-0.12,0.12),rr(0,TAU),0),[s,s*0.85,s],pickC(PAL.oyster,0.02));
    if(k===0){log('ddoyster','visoroyster',px,py,pz,false);st.visoroyster++;}
   }
  });

  // 7. GIANT SALT-REEDS (bellowsreed), BAMBOO-RICE, CABLE-LOTUS, WILD-RICE, BITUMEN-REED & TUSSOCK SEDGE
  cellPass(8.0,10,Lv.mid,false,(x,y,z,wy,lv)=>{
   if(y>14.0||y<-0.4||bitAt(x,z)>0.22||mireAt(x,z)>0.3||L.BLUFF(x,z)>0.35)return;
   const wet=BIO.field('wet',x,z);
   if(wet<0.48||!free(x,z,0.85))return;
   if(rng()>0.50*smooth(0.45,0.82,wet)*q)return;
   const h0=rr(1.9,4.1),yaw=rr(0,TAU);
   BIO.put('ddreed',[x,y-0.08,z],qEuler(rr(-0.06,0.06),yaw,rr(-0.06,0.06)),[h0*0.52,h0,h0*0.52],pickC(PAL.reed,0.04));
   if(lv===2){
    for(let k=0;k<2;k++){
     const a=yaw+k*Math.PI+rr(-0.3,0.3),px=x+Math.cos(a)*0.24,pz=z+Math.sin(a)*0.24,py=Y(px,pz);
     BIO.put('ddculm',[px,py-0.06,pz],qEuler(0,a,rr(0.04,0.12)),[1.1,h0*0.88,1.1],pickC(PAL.culm,0.03));
     if(k===0)BIO.put('ddbladder',[px,py+0.05,pz],qEuler(0,a,0),[0.22,0.34,0.22],pickC(PAL.culm,0.03));
    }
   }
   log('ddreed','bellowsreed',x,y,z,false);
   st.bellowsreed++;
  });

  cellPass(9.5,11,Lv.mid,false,(x,y,z,wy,lv)=>{
   const pt=peatAt(x,z);
   if(pt<0.35||y>12.5||y<0.2||bitAt(x,z)>0.2||L.BLUFF(x,z)>0.25)return;
   if(rng()>0.44*pt*q||!free(x,z,0.9))return;
   const h0=rr(1.5,2.9),yaw=rr(0,TAU);
   BIO.put('ddbambooculm',[x,y-0.06,z],qEuler(0,yaw,rr(0.05,0.15)),[1.2,h0,1.2],pickC(PAL.bamboo,0.03));
   BIO.put('ddbambooleaf',[x,y+h0*0.38,z],qEuler(0,yaw+1.1,0),[h0*0.55,h0*0.58,h0*0.55],pickC(PAL.bamboo,0.03));
   BIO.put('ddpanicle',[x,y+h0*0.56,z],qEuler(0,yaw+2.2,0),[h0*0.48,h0*0.46,h0*0.48],pickC(PAL.rice,0.03));
   log('ddpanicle','bamboorice',x,y,z,false);
   st.bamboorice++;
  });

  cellPass(6.5,12,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   if(wy<-1e8)return;
   const depth=wy-y;
   if(depth<0.15||depth>2.4||bitAt(x,z)>0.1)return;
   /* Slackwater ponds & calm inner marshes */
   const calm=SITE.ponds?SITE.ponds.some(p=>Math.hypot(x-p.x,z-p.z)<p.r*0.96):(psuAt(x,z)<10&&depth<1.4);
   if(!calm||rng()>0.52*q)return;
   const n=lv===2?ri(2,4):1;
   for(let k=0;k<n;k++){
    const px=x+rr(-1.4,1.4),pz=z+rr(-1.4,1.4),ww=W(px,pz),py=Y(px,pz);
    if(ww<-1e8||ww-py<0.1)continue;
    const r0=rr(0.42,0.95);
    BIO.put('ddpad',[px,ww+0.03,pz],qEuler(0,rr(0,TAU),0),[r0,1,r0],pickC(PAL.lotus,0.03));
    if(lv===2)BIO.put('ddtether',[px,py,pz],qEuler(0,rr(0,TAU),0),[1.0,Math.max(0.2,ww-py),1.0],pickC(PAL.culm,0.02));
    if(k===0){log('ddpad','tetherpad',px,ww,pz,false);st.tetherpad++;}
   }
  });

  cellPass(8.0,13,Lv.floor[1],false,(x,y,z,wy,lv)=>{
   const psu=psuAt(x,z);
   if(psu>16||y>6.0||y<-0.3||L.BLUFF(x,z)>0.2||bitAt(x,z)>0.2)return;
   if(BIO.field('wet',x,z)<0.55||rng()>0.38*q)return;
   const s=rr(1.2,2.2);
   BIO.put('ddwildrice',[x,y-0.06,z],qEuler(0,rr(0,TAU),0),[s*0.62,s,s*0.62],pickC(PAL.wildrice,0.03));
   log('ddwildrice','wildrice',x,y,z,false);
   st.wildrice++;
  });

  /* Bitumen-reed (brimreed) & tussock sedge (fensedge) — rich on Station 2 bitumen and marsh benches */
  cellPass(5.5,14,Lv.floor[1],false,(x,y,z,wy,lv)=>{
   const bt=bitAt(x,z),bl=blueAt(x,z);
   const w0=Math.max(bt*smooth(0.85,0.2,bt),bl*0.65);
   if(w0<0.18||mireAt(x,z)>0.35||(wy>-1e8&&y<wy))return;
   if(rng()>0.64*w0*q)return;
   const s=rr(0.75,1.55);
   BIO.put('ddbrimreed',[x,y-0.05,z],qEuler(rr(-0.08,0.08),rr(0,TAU),rr(-0.08,0.08)),[s*0.65,s,s*0.65],pickC(PAL.brimreed,0.03));
   log('ddbrimreed','brimreed',x,y,z,false);
   st.brimreed++;
  });

  cellPass(6.8,15,Lv.floor[1],false,(x,y,z,wy,lv)=>{
   if(y>18.0||y<0.2||bitAt(x,z)>0.45||mireAt(x,z)>0.3||L.BLUFF(x,z)>0.35)return;
   const pt=peatAt(x,z);
   if(pt<0.25||rng()>0.46*pt*q)return;
   const s=rr(0.55,1.25);
   BIO.put('ddsedge',[x,y-0.05,z],qEuler(rr(-0.06,0.06),rr(0,TAU),rr(-0.06,0.06)),[s*0.95,s*0.85,s*0.95],pickC(PAL.sedge,0.03));
   log('ddsedge','fensedge',x,y,z,false);
   st.fensedge++;
  });

  // 8. TSUNAMI-STRANDED DRIFTWOOD WRACK LINES & TAR-TRAPPED DRIFTWOOD LOGS
  cellPass(9.5,16,Lv.mid,false,(x,y,z,wy,lv)=>{
   const wr=wrackAt(x,z);
   if(wr<0.25||y>12.0||(wy>-1e8&&y<wy-0.1))return;
   if(rng()>0.58*wr*q)return;
   const yaw=rr(0,TAU);
   if(rng()<0.46&&free(x,z,2.4)){
    const len=rr(3.2,8.5),th=rr(0.75,1.45);
    claim('driftlog',x,z,len*0.4);
    BIO.put('dddriftlog',[x,y-0.04,z],qEuler(rr(-0.08,0.08),yaw,rr(-0.08,0.08)),[len,th,th],pickC(PAL.driftwood,0.03));
    log('dddriftlog','driftwrack',x,y,z,false);
    st.driftwood++;
   }
   const sw=rr(0.45,0.95);
   BIO.put('ddwrack',[x+rr(-0.8,0.8),Y(x,z)-0.03,z+rr(-0.8,0.8)],qEuler(0,rr(0,TAU),0),[sw*1.3,sw*0.55,sw*1.3],pickC(PAL.wrack,0.04));
   log('ddwrack','driftwrack',x,y,z,false);
   st.driftwrack++;
  });

  /* Deterministic tar-trapped driftwood trunks half-sunk in natural bitumen seeps (Station 2 bitumen) */
  if(SITE.tarSeeps){
   SITE.tarSeeps.forEach((ts,idx)=>{
    const nLogs=3;
    for(let k=0;k<nLogs;k++){
     reseed(KRAND.hash(seed+77,idx,k));
     const a=rr(0,TAU),d=ts.r*rr(0.22,0.82),lx=ts.x+Math.cos(a)*d,lz=ts.z+Math.sin(a)*d,ly=ts.level-0.06;
     const len=rr(3.8,7.6),th=rr(0.85,1.4);
     BIO.put('dddriftlog',[lx,ly,lz],qEuler(rr(-0.22,0.22),rr(0,TAU),rr(-0.18,0.18)),[len,th,th],C(0x3a322a));
     log('dddriftlog','driftwrack',lx,ly,lz,false);
     st.driftwood++;
    }
   });
  }

  // 9. SCOURED BLUE-CLAY RIA-AMBER NODULES (Station 2 bitumen: strictly where amberLag01 > 0.35!)
  cellPass(4.6,17,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   const amb=amberAt(x,z);
   if(amb<=0.35)return;
   if(wy>-1e8&&y<wy-0.35)return;
   if(rng()>0.66*amb*q)return;
   const n=lv===2?ri(2,4):ri(1,2);
   for(let k=0;k<n;k++){
    const px=x+rr(-0.9,0.9),pz=z+rr(-0.9,0.9),am2=amberAt(px,pz);
    if(am2<=0.35)continue;
    const py=Y(px,pz),s=rr(0.14,0.38);
    BIO.put('ddamber',[px,py+s*0.18,pz],qEuler(rr(-0.4,0.4),rr(0,TAU),rr(-0.4,0.4)),[s*1.2,s*0.85,s],pickC(PAL.amber,0.04));
    if(k===0){log('ddamber','riaamber',px,py,pz,false);st.riaamber++;}
   }
  });

  // 10. MARITIME BLUFF WOODS (Station 3 throat ONLY, strictly above tsunami trimline y >= minWoodyY!)
  cellPass(15.0,18,Lv.far,false,(x,y,z,wy,lv)=>{
   if(y<minWoodyY)return;
   const eco=ecoAt(x,z);
   if(!eco.woodyOk||inReserveCore(x,z))return;
   const slope=BIO.field('slope',x,z);
   if(slope>0.58||!free(x,z,3.6))return;
   if(rng()>0.58*(1-smooth(0.38,0.58,slope))*q)return;
   const yaw=rr(0,TAU),roll=rng();
   if(roll<0.30){
    const H=rr(8.5,15.5);
    claim('tree',x,z,3.8);
    BIO.put('ddoaktrunk',[x,y-0.25,z],qEuler(0,yaw,0),[H*0.42,H*0.82,H*0.42],pickC(PAL.bark,0.03));
    for(let k=0;k<3;k++){
     const ox=k?(k===1?0.24:-0.22):0,oz=k?(k===1?-0.20:0.22):0;
     BIO.put('ddoakcrown',[x+ox,y+H*(0.44+0.11*k),z+oz],qEuler(0,yaw+k*1.9,0),[H*0.46,H*0.38,H*0.46],pickC(PAL.oakLeaf,0.03));
    }
    log('ddoaktrunk','bluffoak',x,y,z,true);
    st.bluffoak++;
   }else if(roll<0.56){
    const H=rr(11.0,20.0);
    claim('tree',x,z,3.5);
    BIO.put('ddcedartrunk',[x,y-0.25,z],qEuler(0,yaw,0),[H*0.36,H*0.84,H*0.36],pickC(PAL.cedarBark,0.03));
    for(let t=0;t<3;t++){
     const s=H*(0.38-0.08*t);
     BIO.put('ddcedarcrown',[x,y+H*(0.40+0.16*t),z],qEuler(0,yaw+t*1.4,0),[s,s*0.95,s],pickC(PAL.cedarLeaf,0.03));
    }
    log('ddcedartrunk','bluffcedar',x,y,z,true);
    st.bluffcedar++;
   }else if(roll<0.78){
    const H=rr(9.5,17.0);
    claim('tree',x,z,3.2);
    BIO.put('ddcyptrunk',[x,y-0.25,z],qEuler(0,yaw,0),[H*0.34,H*0.80,H*0.34],pickC(PAL.cedarBark,0.03));
    BIO.put('ddcypcrown',[x,y+H*0.50,z],qEuler(0,yaw,0),[H*0.34,H*0.52,H*0.34],pickC(PAL.cypressLeaf,0.03));
    log('ddcyptrunk','bluffcypress',x,y,z,true);
    st.bluffcypress++;
   }else if(roll<0.92){
    const H=rr(10.0,18.0);
    claim('tree',x,z,3.6);
    BIO.put('ddpinetrunk',[x,y-0.25,z],qEuler(0,yaw,0),[H*0.35,H*0.84,H*0.35],pickC(PAL.bark,0.03));
    BIO.put('ddpinecrown',[x,y+H*0.64,z],qEuler(0,yaw,0),[H*0.52,H*0.28,H*0.52],pickC(PAL.pineLeaf,0.03));
    log('ddpinetrunk','bluffpine',x,y,z,true);
    st.bluffpine++;
   }else{
    const H=rr(7.0,12.5);
    claim('bamboo',x,z,2.4);
    for(let k=0;k<4;k++){
     const px=x+rr(-0.8,0.8),pz=z+rr(-0.8,0.8),py=Y(px,pz);
     if(py<minWoodyY)continue;
     BIO.put('ddbluffculm',[px,py-0.15,pz],qEuler(0,yaw+k,0),[1.3,H*0.92,1.3],pickC(PAL.bamboo,0.03));
     BIO.put('ddbluffleaf',[px,py+H*0.54,pz],qEuler(0,yaw+k*1.7,0),[H*0.34,H*0.38,H*0.34],pickC(PAL.bamboo,0.03));
    }
    log('ddbluffculm','bluffbamboo',x,y,z,true);
    st.bluffbamboo++;
   }
  });

  // 11. DRIFT-SOWN COCONUT PALMS (Cocos nucifera): elevated shell-and-sand chenier ridges, natural levee crests & strand pockets (> water + 1.2 m)
  const EYES=[
   [-1850,1450],[-285,-265],[-1180,-320],[690,-760],[-1580,520],[-980,-360],
   [-1750,1380],[-48,-248],[-215,48],[515,-160],[210,380],[-218,-76],
   [-1850,1520],[1060,-180],[-120,-420],[335,-195],[1020,-310],[-1680,-480]
  ];
  const nearEye=(x,z)=>EYES.some(e=>Math.hypot(x-e[0],z-e[1])<14);
  const chanDistAt=o.chanDist||(typeof L!=='undefined'&&L.chanDist?L.chanDist:null);
  cellPass(24.0,19,Lv.far,false,(x,y,z,wy,lv)=>{
   if(wy>-1e8||y<2.55||y>22.0||inReserveCore(x,z)||nearEye(x,z))return;
   let refW=SKEY==='bitumen'?0.75:SKEY==='throat'?1.20:1.45;
   let subNear=false;
   for(let k=0;k<8;k++){
    const a=k/8*TAU,wn=W(x+Math.cos(a)*14,z+Math.sin(a)*14);
    if(wn>-1e8){
     if(y<=wn+1.22){subNear=true;break;}
     if(wn>refW)refW=wn;
    }
   }
   if(subNear)return;
   const chBank=chanDistAt?smooth(85,18,Math.max(0,chanDistAt(x,z)))*0.48:0;
   const chenier=clamp(Math.max(lagAt(x,z),wrackAt(x,z)*0.92,blueAt(x,z)*0.85*smooth(2.6,3.6,y),chBank),0,1);
   const slope=BIO.field('slope',x,z);
   const cs=DDELTA_PHYS.coconutStrandAt({
    elevM:y,waterM:wy,nearWaterM:refW,chenier01:chenier,
    bitumen01:bitAt(x,z),mire01:mireAt(x,z),slope:slope,psu:psuAt(x,z)
   });
   if(!cs.strandOk||cs.clearM<=1.22||bitAt(x,z)>=0.09||!free(x,z,3.6))return;
   if(rng()>(0.38+0.44*cs.suitability01)*q)return;
   const H=rr(7.0,13.8),yaw=rr(0,TAU),lean=rr(0.14,0.32);
   claim('coconut',x,z,3.4);
   DOUBLEDELTA.growCoconut(x,y,z,H,yaw,lean,KRAND.hash(seed+191,Math.round(x*10),Math.round(z*10)),lv);
   log('ddpalmtrunk','coconut',x,y,z,false,cs.clearM);
   st.coconut++;
  });

  // 12. CHENIER SCREWPINE, PALMETTO FAN-PALM, BAYOU SEA-HIBISCUS & BUTTRESSED KNEE-TUPELO
  st.chenierpandan=0;st.bayouhibiscus=0;st.bayoufanpalm=0;st.bayoutupelo=0;
  st.bayoulily=0;st.chenierglory=0;st.deltalotus=0;st.redwaterfern=0;st.bayoucattail=0;st.silicarush=0;

  cellPass(28.0,20,Lv.far,false,(x,y,z,wy,lv)=>{
   if(wy>-1e8||y<1.85||y>21.0||inReserveCore(x,z)||nearEye(x,z))return;
   if(bitAt(x,z)>0.12||mireAt(x,z)>0.26||BIO.field('slope',x,z)>0.42||!free(x,z,3.0))return;
   if(rng()>0.42*q)return;
   const u=rng(),cSeed=KRAND.hash(seed+201,Math.round(x*10),Math.round(z*10)),sc=rr(0.82,1.18);
   if(y<3.2&&u<0.34){
    claim('bayoutupelo',x,z,2.8);
    DOUBLEDELTA.growBayouTupelo(x,y,z,cSeed,sc);
    log('dd_tupelo_fol','bayoutupelo',x,y,z,false);
    st.bayoutupelo++;
   }else if(u<0.62){
    claim('bayoufanpalm',x,z,2.6);
    DOUBLEDELTA.growFanPalm(x,y,z,cSeed,sc);
    log('dd_fanpalm_frond','bayoufanpalm',x,y,z,false);
    st.bayoufanpalm++;
   }else if(u<0.82){
    claim('chenierpandan',x,z,2.0);
    DOUBLEDELTA.growChenierWoody('chenierpandan',x,y,z,cSeed,sc);
    log('dd_pandan_fol','chenierpandan',x,y,z,false);
    st.chenierpandan++;
   }else{
    claim('bayouhibiscus',x,z,2.0);
    DOUBLEDELTA.growChenierWoody('bayouhibiscus',x,y,z,cSeed,sc);
    log('dd_hibiscus_fol','bayouhibiscus',x,y,z,false);
    st.bayouhibiscus++;
   }
  });

  // 13. LEVEE SPIDER-LILY, SHELL-RIDGE MORNING-GLORY, GIANT CATTAIL & HIGH-SILICA SCOUR-RUSH
  cellPass(13.5,21,Lv.floor[1],false,(x,y,z,wy,lv)=>{
   if(wy>-1e8||y<0.35||y>14.0||bitAt(x,z)>0.16||mireAt(x,z)>0.28)return;
   if(rng()>0.36*q)return;
   const u=rng(),yaw=rr(0,TAU);
   if(y<2.4&&u<0.34){
    const hc=rr(1.6,2.9);
    BIO.tree(x,z,()=>{
     BIO.beam('ddpalmtrunk',[x,y-0.10,z],[x,y+hc,z],0.032,0.020,C(0x6e7e42));
     BIO.put('dd_cattail_blade',[x,y-0.04,z],qEuler(0,yaw,0),[hc*0.42,hc*0.86,hc*0.42],C(0x688844));
     BIO.put('dd_cattail_spike',[x,y+hc-0.22,z],qEuler(0,yaw,0),[0.9,0.34,0.9],C(0x4c3422));
    });
    log('dd_cattail_blade','bayoucattail',x,y,z,false);
    st.bayoucattail++;
   }else if(silicaAt(x,z)>=14.0&&y<3.6&&u<0.62){
    const sr=rr(0.85,1.65);
    BIO.put('dd_silicarush',[x,y-0.04,z],qEuler(0,yaw,0),[sr*0.55,sr,sr*0.55],C(0x528858));
    log('dd_silicarush','silicarush',x,y,z,false);
    st.silicarush++;
   }else if(y>=2.2&&SKEY!=='bitumen'&&u<0.82){
    const gz=rr(0.75,1.25);
    BIO.put('dd_glory_mat',[x,y-0.01,z],qEuler(0,yaw,0),[gz,0.45,gz],C(0x529244));
    BIO.put('dd_glory_bloom',[x,y+0.03,z],qEuler(0,yaw+0.8,0),[gz*0.65,0.45,gz*0.65],C(0xd674b8));
    log('dd_glory_mat','chenierglory',x,y,z,false);
    st.chenierglory++;
   }else{
    const lz=rr(0.55,0.95);
    BIO.put('dd_lily_fol',[x,y-0.03,z],qEuler(0,yaw,0),[lz,lz*0.82,lz],C(0x4e8846));
    BIO.put('dd_lily_bloom',[x,y+0.16,z],qEuler(0,yaw+0.5,0),[lz*0.58,0.45,lz*0.58],C(0xf6f8f2));
    log('dd_lily_fol','bayoulily',x,y,z,false);
    st.bayoulily++;
   }
  });

  // 14. CALM SLACKWATER SACRED PINK DELTA-LOTUS & VELVET FLOATING AZOLLA-MATS
  cellPass(15.0,22,Lv.floor[1],true,(x,y,z,wy,lv)=>{
   if(wy<=-1e8)return;
   const depth=wy-y;
   if(depth<0.15||depth>2.4||psuAt(x,z)>16.0||bitAt(x,z)>0.12)return;
   if(rng()>0.38*q)return;
   const yaw=rr(0,TAU);
   if(rng()<0.48){
    const hl=rr(0.35,0.85);
    BIO.tree(x,z,()=>{
     BIO.beam('ddpalmtrunk',[x,y-0.08,z],[x,wy+hl,z],0.025,0.018,C(0x527a48));
     BIO.put('dd_lotus_leaf',[x,wy+hl-0.02,z],qEuler(0,yaw,0),[0.68,0.45,0.68],C(0x4a825c));
     BIO.put('dd_lotus_bloom',[x,wy+hl+0.02,z],qEuler(0,yaw+0.7,0),[0.34,0.32,0.34],C(0xf088a8));
    });
    log('dd_lotus_bloom','deltalotus',x,y,z,false);
    st.deltalotus++;
   }else{
    const az=rr(0.85,1.55);
    BIO.tree(x,z,()=>{
     BIO.beam('ddpalmtrunk',[x,y-0.05,z],[x,wy+0.02,z],0.016,0.012,C(0x5a3632));
     BIO.put('dd_azolla_mat',[x,wy+0.02,z],qEuler(0,yaw,0),[az,0.35,az],C(0x9a363c));
    });
    log('dd_azolla_mat','redwaterfern',x,y,z,false);
    st.redwaterfern++;
   }
  });

  return st;
 };
})();
