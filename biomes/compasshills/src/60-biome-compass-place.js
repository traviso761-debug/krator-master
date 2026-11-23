// ================================================================= COMPASS HILLS — deterministic cell-seeded placement ([G data])
// Order-free placement on KRAND.hash(seed, cx, cz, slot, salt), KSPACE non-overlap, and KTAGS pre-draw registration.
// Orients every compassbush & fluxgrass instance from COMPASS_PHYS.leafAzimuthAt(x, z, SKEY, u) and balances the 85%
// Earthlike Mediterranean-continental matrix against 15% ferromagnetic biota across all 4 stations.
BIO.kit('compasshills');
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const PAL=COMPASS.PAL;
 const H=(seed,cx,cz,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,(cx|0)*73856093^(cz|0)*19349663,k|0,salt|0));

 const FERRO_KEYS={compassbush:1,fluxgrass:1,fluxlichen:1,ferrotuft:1,lodestonespire:1};

 COMPASS.build=function(o){
  o=o||{};
  const SKEY=o.station||'foundry';
  const SITE=COMPASS.SITES[SKEY]||COMPASS.SITES.foundry;
  const tH=o.terrainH||BIO.host.terrainH;
  const wH=o.waterH||BIO.host.waterH;
  const space=o.space||null;
  const reg=o.register||BIO.host.register||function(){};
  const q=o.quality==null?1:o.quality;
  const seed=(o.seed==null?910220:o.seed)>>>0;
  const R=o.R==null?660:o.R;
  const heroR=225;

  const counts={};
  COMPASS.SPECIES.forEach(s=>{counts[s.key]=0;});
  counts.boulders=0;
  counts.impostors=0;
  COMPASS.PLACED.length=0;
  COMPASS.SPIRES.length=0;

  let nEarth=0,nFerro=0;
  const recPlace=(kind,x,y,z,asl,zone,extra)=>{
   counts[kind]=(counts[kind]==null?0:counts[kind])+1;
   if(FERRO_KEYS[kind])nFerro++;else nEarth++;
   COMPASS.PLACED.push([kind,+x.toFixed(2),+y.toFixed(2),+z.toFixed(2),+asl.toFixed(2),zone,extra||null]);
  };

  const inReserve=(x,z,pad)=>{
   if(!SITE.reserve)return false;
   const p=pad==null?2.0:pad;
   return Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z)<SITE.reserve.r+p;
  };
  const isDry=(x,z,margin)=>{
   const y=tH(x,z),w=wH(x,z);
   return !(w>-1e8&&y<w+(margin==null?0.22:margin));
  };
  const slopeOf=(x,z)=>{
   const e=1.5,hx=(tH(x+e,z)-tH(x-e,z))/(2*e),hz=(tH(x,z+e)-tH(x,z-e))/(2*e);
   return{slope:Math.hypot(hx,hz),nx:-hx,nz:-hz};
  };
  const claim=(kind,x,z,r)=>{
   if(inReserve(x,z,r+1.5))return false;
   if(!space)return true;
   const hits=space.query(x,z,r);
   for(let i=0;i<hits.length;i++){
    if(hits[i])return false;
   }
   space.insert({kind:kind,x:x,z:z},x,z,r);
   return true;
  };

  // Helper to place a fulgurite-veined lodestonespire + concentric fluxlichen rings + ferrotuft cushions
  const placeSpire=(sx,sz,hM,promM,idx)=>{
   if(!isDry(sx,sz,0.5)||inReserve(sx,sz,5.0))return;
   if(!claim('spire',sx,sz,Math.max(2.6,hM*0.24)))return;
   const sy=tH(sx,sz),sasl=SITE.baseElevM+sy;
   const mf=COMPASS_PHYS.fieldAt(sx,sz,SKEY);
   const ls=COMPASS_PHYS.lightningScoreAt({elevM:sasl+hM,localProminenceM:promM,ironByte:SITE.minerals.iron,bMagMt:mf.bMagMt});
   const spSeed=KRAND.hash(seed,idx*97+13,1,0x601);

   // Register resource node & landmark BEFORE drawing (AGENTS.md rule)
   reg({
    tagId:'compass:lodestone-spire-'+SKEY+'-'+idx,
    name:'Magnetite Lodestone Spire #'+(idx+1),
    x:sx,y:sy,z:sz,r:Math.max(3.5,hM*0.3),h:hM+2,
    tags:{biome:'compasshills',resource:'lodestone',grade:'high',strikeProb:ls.strikeProb01}
   });
   const built=COMPASS.growLodestoneSpire(sx,sy,sz,spSeed,hM,ls.fulgurite01);
   recPlace('lodestonespire',sx,sy,sz,sasl,'magnetor',{hM:hM,strikeProb01:ls.strikeProb01,fulgurite01:ls.fulgurite01,bMagMt:mf.bMagMt});
   COMPASS.SPIRES.push({x:sx,y:sy,topY:sy+hM,z:sz,hM:hM,strikeProb01:ls.strikeProb01,bMagMt:mf.bMagMt});

   // Concentric isogauss fluxlichen bands around spire foot (+0.035 m proud above ground -> zero coplanar overlap!)
   const nRing=4;
   for(let k=0;k<nRing;k++){
    const ang=(k/nRing)*TAU+0.25*H(spSeed,k,2,0x602);
    const rr=built.rBase+0.85+0.45*(k%2);
    const lx=sx+Math.cos(ang)*rr,lz=sz+Math.sin(ang)*rr;
    if(!isDry(lx,lz,0.2)||slopeOf(lx,lz).slope>0.85)continue;
    const ly=tH(lx,lz);
    const col=PAL.isogauss[(idx+k)%PAL.isogauss.length];
    BIO.put('ch_fluxlichen',[lx,ly+0.035,lz],qEuler(0,ang,0),[1.05,0.65,1.05],col);
    recPlace('fluxlichen',lx,ly,lz,SITE.baseElevM+ly,'magnetor',{bMagMt:mf.bMagMt});
   }

   // Spiky metallic ferrotuft cushions along high-gradient spire corners
   const nTuft=3;
   for(let k=0;k<nTuft;k++){
    const ang=0.55+(k/nTuft)*TAU+0.2*H(spSeed,k,5,0x603);
    const tr=built.rBase*0.95+0.35;
    const tx=sx+Math.cos(ang)*tr,tz=sz+Math.sin(ang)*tr;
    if(!isDry(tx,tz,0.2))continue;
    const ty=tH(tx,tz);
    const fEdge=COMPASS_PHYS.fieldAt(tx,tz,SKEY);
    const ssEdge=COMPASS_PHYS.sandStreamAt(tx,tz,0.12,SITE.minerals.iron,fEdge.bMagMt,fEdge.gradB2);
    if(ssEdge.ferroTuftMm>2.0||mf.bMagMt>=18.0){
     const ts=0.34+0.18*H(spSeed,k,6,0x603);
     BIO.put('ch_ferrotuft',[tx,ty+0.02,tz],qEuler(0,ang,0),[ts,ts*0.72,ts],PAL.ferrotuft[(idx+k)%PAL.ferrotuft.length]);
     recPlace('ferrotuft',tx,ty,tz,SITE.baseElevM+ty,'magnetor',{ferroTuftMm:Math.max(6.5,ssEdge.ferroTuftMm)});
    }
   }
  };

  // Helper to place a meridian/flux-aligned compassbush clump
  const placeCompassBush=(x,z,seedVal,sc,zoneName)=>{
   if(!isDry(x,z,0.25)||inReserve(x,z,2.5))return false;
   const sl=slopeOf(x,z);
   if(sl.slope>0.72)return false;
   if(!claim('compassbush',x,z,0.92))return false;
   const y=tH(x,z),asl=SITE.baseElevM+y;
   const mf=COMPASS_PHYS.fieldAt(x,z,SKEY);
   if(mf.bMagMt<0.25)return false;
   const uJit=KRAND.unit(KRAND.hash(seedVal,19,0x610));
   const lf=COMPASS_PHYS.leafAzimuthAt(x,z,SKEY,uJit);
   COMPASS.growCompassBush(x,y,z,seedVal,sc,lf.bladeYawRad,lf.alignment01);
   recPlace('compassbush',x,y,z,asl,zoneName,{
    bladeYawRad:lf.bladeYawRad,
    fieldAzRad:mf.azimuthRad,
    bHorizMt:mf.bHorizMt,
    bMagMt:mf.bMagMt,
    align01:lf.alignment01
   });
   return true;
  };

  // ================================================================ 1. SIGNATURE MAGNETITE SPIRES & VORTEX WHORLS PER STATION
  if(SKEY==='foundry'){
   // 6 collapsed cryo-toroid quench-vent spires + tight 360-deg swirling compassbush rosettes around each vent!
   SITE.quenchVents.forEach((v,i)=>{
    placeSpire(v.x,v.z,7.2+1.6*(i%3),24+4*i,i);
    // Concentric rings of compassbush swirling in 360-deg dipole streamlines around each quench-vent throat
    for(let ring=0;ring<2;ring++){
     const rad=11.5+ring*8.5;
     const nShrub=ring===0?10:12;
     for(let k=0;k<nShrub;k++){
      const ang=(k/nShrub)*TAU+0.15*H(seed,i,ring*16+k,0x620);
      const bx=v.x+Math.cos(ang)*rad,bz=v.z+Math.sin(ang)*rad;
      placeCompassBush(bx,bz,KRAND.hash(seed,i*64+k,ring,0x621),0.92+0.28*H(seed,i,k,0x622),'quenchscar');
     }
    }
   });
   reg({tagId:'compass:quench-ring-trench',name:'Lodestone Toroidal Flux-Quench Subsidence Moat',x:0,y:-16,z:-225,r:68,h:38,ground:true,tags:{biome:'compasshills',zone:'quenchscar'}});
   reg({tagId:'compass:compass-whorl-0',name:'Swirling Compass-Leaf Dipole Vortex Whorl',x:SITE.quenchVents[0].x,y:tH(SITE.quenchVents[0].x,SITE.quenchVents[0].z)-4,z:SITE.quenchVents[0].z,r:32,h:18,tags:{biome:'compasshills',zone:'quenchscar'}});
  }else if(SKEY==='tors'){
   // 9 monumental lightning-struck banded-ironstone spires along the high eastern cuesta scarp
   SITE.torSpires.forEach((sp,i)=>{
    placeSpire(sp.x,sp.z,sp.hM,sp.promM,i);
    for(let k=0;k<7;k++){
     const ang=(k/7)*TAU+0.2*H(seed,i,k,0x630),rad=8.5+5.5*H(seed,i,k+10,0x630);
     placeCompassBush(sp.x+Math.cos(ang)*rad,sp.z+Math.sin(ang)*rad,KRAND.hash(seed,i*32+k,2,0x631),0.88+0.3*H(seed,i,k,0x632),'magnetor');
    }
   });
   reg({tagId:'compass:tors-scarp-wall',name:'Eastern Banded-Ironstone Magnetite Escarpment',x:8,y:0,z:-76,r:135,h:95,ground:true,tags:{biome:'compasshills',zone:'magnetor',resource:'lodestone'}});
  }else if(SKEY==='cuesta'){
   // 2 flanking caprock tors + crisp 180-deg magnetic domain-wall saddle corridor across z = -34..+34!
   placeSpire(-138,-158,9.5,32,0);
   placeSpire(132,164,10.2,34,1);
   // Structured domain-wall showcase corridor across x = -95..+95, z = -36..+36:
   // North lobe (z < -16: all NNE), neutral core (|z - seamZ| < 4: radial splay), South lobe (z > +16: all WNW/SSW)!
   for(let ix=-7;ix<=7;ix++){
    const bx=ix*13.0;
    const seamZ=14*Math.sin(bx*0.0055);
    const offsets=[-28,-19,0,19,28];
    for(let ozIdx=0;ozIdx<offsets.length;ozIdx++){
     const bz=seamZ+offsets[ozIdx]+(ozIdx===2?0:(H(seed,ix,ozIdx,0x640)-0.5)*2.4);
     placeCompassBush(bx+(H(seed,ix,ozIdx+8,0x640)-0.5)*3.2,bz,KRAND.hash(seed,ix*16+ozIdx,3,0x641),1.05,'inversionseam');
    }
   }
   reg({tagId:'compass:domain-wall-saddle',name:'180-Degree Magnetic Domain-Wall Inversion Saddle',x:0,y:0,z:0,r:82,h:28,tags:{biome:'compasshills',zone:'inversionseam'}});
  }else{
   // Station 4 (gorge): 5 dark magnetite palisade pinnacles flanking 9102 Ham-Tsek river narrows + mulberry grove rows!
   SITE.gorgeDipoles.forEach((gd,i)=>{
    placeSpire(gd.x,gd.z,10.5+1.8*(i%3),38,i);
    for(let k=0;k<6;k++){
     const ang=(k/6)*TAU+0.25*H(seed,i,k,0x650),rad=8.0+5.0*H(seed,i,k+9,0x650);
     placeCompassBush(gd.x+Math.cos(ang)*rad,gd.z+Math.sin(ang)*rad,KRAND.hash(seed,i*32+k,4,0x651),0.92,'irongorge');
    }
   });
   // Silk-Road white mulberry orchard rows just outside site:ham-tsek-post terrace (x = 58..92, z = 95..148)
   for(let rIdx=0;rIdx<4;rIdx++){
    for(let cIdx=0;cIdx<5;cIdx++){
     const mx=52+rIdx*9.5,mz=96+cIdx*10.5;
     if(isDry(mx,mz,0.8)&&!inReserve(mx,mz,4.0)&&claim('tree',mx,mz,2.2)){
      const my=tH(mx,mz);
      COMPASS.growTree('silkmulberry',mx,my,mz,KRAND.hash(seed,rIdx,cIdx,0x652),0.92+0.18*H(seed,rIdx,cIdx,0x653));
      recPlace('silkmulberry',mx,my,mz,SITE.baseElevM+my,'irongorge');
     }
    }
   }
   reg({tagId:'compass:ham-tsek-narrows',name:'9102 Ham-Tsek Magnetite River Narrows & Black Placer Bars',x:0,y:-6,z:0,r:95,h:90,ground:true,tags:{biome:'compasshills',zone:'irongorge'}});
  }

  // ================================================================ 2. 85% MEDITERRANEAN-CONTINENTAL WOODLAND & UNDERSTORY MATRIX
  const hFields=o.fields||(BIO.host&&BIO.host.fields)||null;
  const fld=(k,fx,fz)=>(hFields&&typeof hFields[k]==='function')?hFields[k](fx,fz):0;
  const tcs=20,tnc=Math.ceil(R/tcs);
  for(let cz=-tnc;cz<=tnc;cz++)for(let cx=-tnc;cx<=tnc;cx++){
   const bx=cx*tcs,bz=cz*tcs,dist0=Math.hypot(bx,bz);
   if(dist0>R*0.95)continue;
   const x=bx+(H(seed,cx,cz,1,0x701)-0.5)*tcs*0.82;
   const z=bz+(H(seed,cx,cz,2,0x701)-0.5)*tcs*0.82;
   if(!isDry(x,z,0.65)||inReserve(x,z,4.5))continue;
   const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
   if(sl.slope>0.68)continue;

   // Keep bare ironstone sand-ripple slabs, quench-trench floor, and Station 3 saddle center open so vector streamlines shine!
   const sandW=fld('sand',x,z),gossW=fld('gossan',x,z),trailW=fld('trail',x,z);
   const inSaddleOpen=(SKEY==='cuesta'&&Math.abs(x)<105&&Math.abs(z-14*Math.sin(x*0.0055))<34);
   const treeProb=(1-sandW*0.78)*(1-gossW*0.88)*(1-trailW*0.95)*(inSaddleOpen?0.06:0.78);

   if(H(seed,cx,cz,3,0x701)<treeProb*q&&claim('tree',x,z,2.3)){
    const uSp=H(seed,cx,cz,4,0x701);
    let kind='stonepine';
    if(SKEY==='gorge'&&fld('wet',x,z)>0.58){
     kind=uSp<0.52?'gorgeplane':uSp<0.78?'silkmulberry':'ironpistache';
    }else if(SKEY==='cuesta'){
     kind=uSp<0.30?'stonepine':uSp<0.56?'corkoak':uSp<0.80?'ironpistache':'whorlolive';
    }else if(SKEY==='tors'){
     kind=uSp<0.38?'stonepine':uSp<0.72?'corkoak':'ironpistache';
    }else{
     kind=uSp<0.34?'stonepine':uSp<0.64?'corkoak':uSp<0.86?'ironpistache':'whorlolive';
    }

    const tSeed=KRAND.hash(seed,cx*131+cz,5,0x702);
    const sc=0.84+0.32*H(seed,cx,cz,6,0x701);
    if(dist0<=heroR){
     const res=COMPASS.growTree(kind,x,y,z,tSeed,sc);
     recPlace(kind,x,y,z,asl,'cuestawood',{H:res.H});
    }else if(COMPASS.IMP&&COMPASS.IMP[kind]){
     BIO.impostorPut('ch_tree_imp',COMPASS.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,7,0x701)*TAU,sc,null);
     counts.impostors++;
     recPlace(kind,x,y,z,asl,'cuestawood',{impostor:1});
    }
   }

   // Understory & ground-flora pass within hero+125 m:
   // Places Earthlike juniper, saffron crocus, rosemary macchia & golden bunchgrass (~85%) alongside compassbush & fluxgrass (~15%)!
   if(dist0<=heroR+125){
    const nSub=3;
    for(let s=0;s<nSub;s++){
     const sx=bx+(H(seed,cx,cz,10+s*6,0x710)-0.5)*tcs*0.92;
     const sz=bz+(H(seed,cx,cz,11+s*6,0x710)-0.5)*tcs*0.92;
     if(!isDry(sx,sz,0.28)||inReserve(sx,sz,2.5))continue;
     const ssl=slopeOf(sx,sz);
     if(ssl.slope>0.74||fld('trail',sx,sz)>0.45)continue;
     const sy=tH(sx,sz),sasl=SITE.baseElevM+sy;
     const uPick=H(seed,cx,cz,12+s*6,0x710);

     // Dynamic guard keeping ferromagnetic share centered right around 15% (Earthlike ~85%, well inside [78%, 90%])
     const totNow=nEarth+nFerro;
     const ferroShareNow=totNow>30?(nFerro/totNow):0.15;
     const ferroTarget=ferroShareNow>0.165?0.02:(ferroShareNow<0.145?0.36:0.18);

     if(uPick<ferroTarget){
      if(H(seed,cx,cz,13+s*6,0x710)<0.52){
       placeCompassBush(sx,sz,KRAND.hash(seed,cx*31+cz,s,0x711),0.85+0.35*H(seed,cx,cz,14+s*6,0x710),'cuestawood');
      }else if(claim('fluxgrass',sx,sz,0.65)){
       const lf=COMPASS_PHYS.leafAzimuthAt(sx,sz,SKEY,H(seed,cx,cz,14+s*6,0x710));
       const gs=0.72+0.42*H(seed,cx,cz,15+s*6,0x710);
       BIO.put('ch_fluxgrass',[sx,sy,sz],qEuler(0,-lf.bladeYawRad,0),[gs,gs*0.95,gs],PAL.fluxGrass[Math.abs(cx+cz+s)%PAL.fluxGrass.length]);
       recPlace('fluxgrass',sx,sy,sz,sasl,'cuestawood',{bladeYawRad:lf.bladeYawRad,align01:lf.alignment01});
      }
     }else{
      const uEarth=H(seed,cx,cz,15+s*6,0x712);
      if(uEarth<0.14&&claim('juniper',sx,sz,1.05)){
       const js=1.35+0.95*H(seed,cx,cz,16+s*6,0x712);
       BIO.put('ch_juniper_fol',[sx,sy+0.35*js,sz],qEuler(0,uPick*TAU,0),[js*0.78,js,js*0.78],PAL.juniper[Math.abs(cx+cz)%PAL.juniper.length],{n:[0,1,0]});
       recPlace('cuestajuniper',sx,sy,sz,sasl,'cuestawood');
      }else if(uEarth<0.30&&(SKEY==='cuesta'||SKEY==='foundry'||uEarth<0.20)&&claim('saffron',sx,sz,0.55)){
       const fs=0.52+0.28*H(seed,cx,cz,17+s*6,0x712);
       BIO.put('ch_saffron',[sx,sy+0.02,sz],qEuler(0,uPick*TAU,0),[fs,fs*0.72,fs],PAL.saffron[Math.abs(cx*3+cz+s)%PAL.saffron.length]);
       recPlace('saffroncrocus',sx,sy,sz,sasl,'dipslope');
      }else if(uEarth<0.58&&claim('macchia',sx,sz,0.72)){
       const ms=0.75+0.45*H(seed,cx,cz,18+s*6,0x712);
       BIO.put('ch_macchia',[sx,sy+0.04,sz],qEuler(0,uPick*TAU,0),[ms,ms*0.78,ms],PAL.macchia[Math.abs(cx+cz*5+s)%PAL.macchia.length]);
       recPlace('macchiasage',sx,sy,sz,sasl,'cuestawood');
      }else if(claim('grass',sx,sz,0.62)){
       const ds=0.78+0.48*H(seed,cx,cz,19+s*6,0x712);
       BIO.put('ch_drygrass',[sx,sy,sz],qEuler(0,uPick*TAU,0),[ds,ds*0.85,ds],PAL.dryGrass[Math.abs(cx*7+cz+s)%PAL.dryGrass.length]);
       recPlace('macchiasage',sx,sy,sz,sasl,'cuestawood');
      }
     }
    }
   }

   // Scattered ironstone / sandstone / quench-slag boulders
   if(dist0<=heroR+75&&H(seed,cx,cz,29,0x720)<0.26*q){
    const rx=bx+(H(seed,cx,cz,30,0x720)-0.5)*tcs,rz=bz+(H(seed,cx,cz,31,0x720)-0.5)*tcs;
    if(isDry(rx,rz,0.2)&&!inReserve(rx,rz,3.0)&&claim('rock',rx,rz,1.4)){
     const ry=tH(rx,rz);
     const rs=0.75+1.45*H(seed,cx,cz,32,0x720);
     const isIron=fld('sand',rx,rz)>0.35||COMPASS_PHYS.fieldAt(rx,rz,SKEY).bMagMt>8.0;
     const isGoss=fld('gossan',rx,rz)>0.35;
     const rItem=isGoss?'ch_rock_gossan':isIron?'ch_rock_ironstone':'ch_rock_sandstone';
     const rCol=isGoss?PAL.gossan[0]:isIron?PAL.ironstone[0]:PAL.sandstone[0];
     BIO.put(rItem,[rx,ry-0.24*rs,rz],qEuler(0,H(seed,cx,cz,33,0x720)*TAU,0),[rs,rs*0.68,rs],rCol);
     counts.boulders++;
    }
   }
  }

  // Ensure every station also carries at least a few specimens of riparian gorgeplane & silkmulberry along brooks
  if((counts.gorgeplane===0||counts.silkmulberry===0)&&typeof FLOW_LINES!=='undefined'&&FLOW_LINES.length){
   const FL=FLOW_LINES[0];
   for(let k=2;k<FL.pts.length-2;k+=3){
    const px=FL.pts[k][0]+9.5,pz=FL.pts[k][1]+8.5;
    if(!isDry(px,pz,0.4)||inReserve(px,pz,4.0))continue;
    if(!claim('riparian-tree',px,pz,2.2))continue;
    const py=tH(px,pz);
    const rKind=(k%2===0)?'gorgeplane':'silkmulberry';
    COMPASS.growTree(rKind,px,py,pz,KRAND.hash(seed,k,99,0x730),0.88);
    recPlace(rKind,px,py,pz,SITE.baseElevM+py,'irongorge');
   }
  }

  counts.earthlike=nEarth;
  counts.ferromagnetic=nFerro;
  counts.earthShare=+(nEarth/Math.max(1,nEarth+nFerro)).toFixed(4);
  return counts;
 };
})();
