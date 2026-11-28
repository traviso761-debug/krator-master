// ================================================================= COMPASS HILLS — deterministic cell-seeded placement ([G data])
// Order-free placement on KRAND.hash(seed, cx, cz, slot, salt), KSPACE non-overlap, and KTAGS pre-draw registration.
// Orients every compassbush & fluxgrass instance from COMPASS_PHYS.leafAzimuthAt(x, z, SKEY, u) and balances the 85%
// Earthlike Mediterranean-continental, Weeping-Amber seam, garrigue & riparian Ham-Tsek matrix (18 species) against
// 15% ferromagnetic & gossan biota (7 species in FERRO_KEYS) across all 4 stations.
BIO.kit('compasshills');
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const PAL=COMPASS.PAL;
 const H=(seed,cx,cz,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,(cx|0)*73856093^(cz|0)*19349663,k|0,salt|0));

 const FERRO_KEYS=COMPASS.FERRO_KEYS={
  compassbush:1,fluxgrass:1,fluxlichen:1,ferrotuft:1,lodestonespire:1,magnetitespleenwort:1,gossanwhorlheath:1
 };

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

  // Helper to place a fulgurite-veined lodestonespire + fluxlichen + ferrotuft + crevice spleenwort + gossan whorl-heath
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
   const nRing=3;
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
   const nTuft=2;
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

   // High-bFieldMt ironstone-crevice metallophyte fern (magnetitespleenwort) & gossan whorl-heath at spire base
   for(let k=0;k<2;k++){
    const ang=1.15+k*Math.PI+0.3*H(spSeed,k,8,0x604);
    const fr=built.rBase+0.52;
    const fx=sx+Math.cos(ang)*fr,fz=sz+Math.sin(ang)*fr;
    if(isDry(fx,fz,0.2)){
     const fy=tH(fx,fz),fCr=COMPASS_PHYS.fieldAt(fx,fz,SKEY);
     const fs=0.42+0.22*H(spSeed,k,9,0x604);
     BIO.put('ch_spleenwort',[fx,fy+0.04,fz],qEuler(0,-fCr.azimuthRad,0),[fs,fs*0.88,fs],PAL.spleenwort[(idx+k)%PAL.spleenwort.length]);
     recPlace('magnetitespleenwort',fx,fy,fz,SITE.baseElevM+fy,'magnetor',{bMagMt:fCr.bMagMt});
    }
   }
   {
    const hang=2.2+0.4*H(spSeed,0,11,0x605),hr=built.rBase+1.65;
    const hx=sx+Math.cos(hang)*hr,hz=sz+Math.sin(hang)*hr;
    if(isDry(hx,hz,0.25)&&claim('whorlheath',hx,hz,0.55)){
     const hy=tH(hx,hz),hs=0.58+0.28*H(spSeed,1,11,0x605);
     BIO.put('ch_whorlheath',[hx,hy+0.03,hz],qEuler(0,hang,0),[hs,hs*0.82,hs],PAL.whorlheath[idx%PAL.whorlheath.length]);
     recPlace('gossanwhorlheath',hx,hy,hz,SITE.baseElevM+hy,'quenchscar',{bMagMt:mf.bMagMt});
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

  // ================================================================ 1. SIGNATURE MAGNETITE SPIRES, VORTEX WHORLS & WEEPING-AMBER SEAM
  if(SKEY==='foundry'){
   // 6 collapsed cryo-toroid quench-vent spires + tight 360-deg swirling compassbush rosettes around each vent!
   SITE.quenchVents.forEach((v,i)=>{
    placeSpire(v.x,v.z,7.2+1.6*(i%3),24+4*i,i);
    for(let ring=0;ring<2;ring++){
     const rad=11.5+ring*8.5;
     const nShrub=ring===0?9:10;
     for(let k=0;k<nShrub;k++){
      const ang=(k/nShrub)*TAU+0.15*H(seed,i,ring*16+k,0x620);
      const bx=v.x+Math.cos(ang)*rad,bz=v.z+Math.sin(ang)*rad;
      placeCompassBush(bx,bz,KRAND.hash(seed,i*64+k,ring,0x621),0.92+0.28*H(seed,i,k,0x622),'quenchscar');
     }
    }
   });
   // Sheltered northern cuesta dip stand of weeping-amber storax (amber = 120 seam harvested by Pioneers for coil-varnish)
   for(let k=0;k<6;k++){
    const ax=-88+k*16,az=-152+(k%2)*14;
    if(isDry(ax,az,0.6)&&!inReserve(ax,az,4.5)&&claim('tree',ax,az,2.4)){
     const ay=tH(ax,az);
     const res=COMPASS.growTree('amberstorax',ax,ay,az,KRAND.hash(seed,k,71,0x625),0.90+0.18*H(seed,k,72,0x625));
     recPlace('amberstorax',ax,ay,az,SITE.baseElevM+ay,'irongorge',{H:res.H,resin:'ria-amber'});
    }
   }
   reg({tagId:'compass:quench-ring-trench',name:'Lodestone Toroidal Flux-Quench Subsidence Moat',x:0,y:-16,z:-225,r:68,h:38,ground:true,tags:{biome:'compasshills',zone:'quenchscar'}});
   reg({tagId:'compass:compass-whorl-0',name:'Swirling Compass-Leaf Dipole Vortex Whorl',x:SITE.quenchVents[0].x,y:tH(SITE.quenchVents[0].x,SITE.quenchVents[0].z)-4,z:SITE.quenchVents[0].z,r:32,h:18,tags:{biome:'compasshills',zone:'quenchscar'}});
  }else if(SKEY==='tors'){
   // 9 monumental lightning-struck banded-ironstone spires along the high eastern cuesta scarp
   SITE.torSpires.forEach((sp,i)=>{
    placeSpire(sp.x,sp.z,sp.hM,sp.promM,i);
    for(let k=0;k<6;k++){
     const ang=(k/6)*TAU+0.2*H(seed,i,k,0x630),rad=8.5+5.5*H(seed,i,k+10,0x630);
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
   // Station 4 (gorge): 5 dark magnetite palisade pinnacles + Weeping-Amber storax grove + Silk-Road mulberry orchard rows!
   SITE.gorgeDipoles.forEach((gd,i)=>{
    placeSpire(gd.x,gd.z,10.5+1.8*(i%3),38,i);
    for(let k=0;k<5;k++){
     const ang=(k/5)*TAU+0.25*H(seed,i,k,0x650),rad=8.0+5.0*H(seed,i,k+9,0x650);
     placeCompassBush(gd.x+Math.cos(ang)*rad,gd.z+Math.sin(ang)*rad,KRAND.hash(seed,i*32+k,4,0x651),0.92,'irongorge');
    }
   });
   // Silk-Road white mulberry orchard rows just outside site:ham-tsek-post terrace (x = 52..82, z = 96..138)
   for(let rIdx=0;rIdx<4;rIdx++){
    for(let cIdx=0;cIdx<5;cIdx++){
     const mx=52+rIdx*9.5,mz=96+cIdx*10.5;
     if(isDry(mx,mz,0.8)&&!inReserve(mx,mz,4.0)&&claim('tree',mx,mz,2.2)){
      const my=tH(mx,mz);
      const resM=COMPASS.growTree('silkmulberry',mx,my,mz,KRAND.hash(seed,rIdx,cIdx,0x652),0.92+0.18*H(seed,rIdx,cIdx,0x653));
      recPlace('silkmulberry',mx,my,mz,SITE.baseElevM+my,'irongorge',{H:resM.H});
     }
    }
   }
   // Northern Weeping-Valley border-seam amberstorax grove along Ham-Tsek terrace (amber = 120 Pioneers coil-varnish harvest)
   let amberN=0,ambSumX=0,ambSumZ=0;
   for(let rIdx=0;rIdx<3;rIdx++){
    for(let cIdx=0;cIdx<4;cIdx++){
     const ax=-108+cIdx*14.5+(rIdx%2)*4.0,az=-96-rIdx*12.0;
     if(isDry(ax,az,0.8)&&!inReserve(ax,az,4.0)&&claim('tree',ax,az,2.4)){
      const ay=tH(ax,az);
      const resA=COMPASS.growTree('amberstorax',ax,ay,az,KRAND.hash(seed,rIdx+10,cIdx+10,0x654),0.94+0.20*H(seed,rIdx,cIdx,0x655));
      recPlace('amberstorax',ax,ay,az,SITE.baseElevM+ay,'irongorge',{H:resA.H,resin:'ria-amber'});
      amberN++;ambSumX+=ax;ambSumZ+=az;
     }
    }
   }
   if(amberN>0){
    const gcx=ambSumX/amberN,gcz=ambSumZ/amberN;
    reg({tagId:'compass:weeping-amber-grove',name:'Weeping-Amber Storax Dielectric Resin Grove',x:gcx,y:tH(gcx,gcz)-3,z:gcz,r:34,h:26,tags:{biome:'compasshills',zone:'irongorge',resource:'amber'}});
   }
   reg({tagId:'compass:ham-tsek-narrows',name:'9102 Ham-Tsek Magnetite River Narrows & Black Placer Bars',x:0,y:-6,z:0,r:95,h:90,ground:true,tags:{biome:'compasshills',zone:'irongorge'}});
  }

  // ================================================================ 1B. RIPARIAN CANYON-WASH, BROOK & SEEP CORRIDOR (before matrix balance)
  const flowPts=o.flowPts||((typeof FLOW_LINES!=='undefined'&&FLOW_LINES.length)?FLOW_LINES[0].pts:[[-180,-14],[-90,-4],[0,6],[90,14],[180,22]]);
  const bankOff=SKEY==='gorge'?44.0:11.5;
  for(let k=1;k<flowPts.length-1;k++){
   const p0=flowPts[k];
   for(let side=-1;side<=1;side+=2){
    const bx=p0[0]+(H(seed,k,side+2,0x660)-0.5)*12.0;
    const bz=p0[1]+side*(bankOff+6.0*H(seed,k,side+5,0x660));
    if(!isDry(bx,bz,0.35)||inReserve(bx,bz,3.5))continue;
    const by=tH(bx,bz),basl=SITE.baseElevM+by;
    const pick=(k+((side>0)?1:0))%5;
    if(pick===0&&claim('riparian-tree',bx,bz,2.3)){
     const tKind=(k%2===0)?'gorgeplane':'amberstorax';
     const resT=COMPASS.growTree(tKind,bx,by,bz,KRAND.hash(seed,k,side+10,0x661),0.90);
     recPlace(tKind,bx,by,bz,basl,'irongorge',{H:resT.H});
    }else if(pick===1&&claim('riparian-tree',bx,bz,2.1)){
     const resM=COMPASS.growTree('silkmulberry',bx,by,bz,KRAND.hash(seed,k,side+12,0x661),0.88);
     recPlace('silkmulberry',bx,by,bz,basl,'irongorge',{H:resM.H});
    }else if(pick===2&&claim('oleander',bx,bz,1.1)){
     COMPASS.growWoodyShrub('gorgeoleander',bx,by,bz,KRAND.hash(seed,k,side+14,0x662),0.92+0.24*H(seed,k,side+15,0x662));
     recPlace('gorgeoleander',bx,by,bz,basl,'irongorge');
    }else if(pick===3&&claim('canyongrape',bx,bz,0.95)){
     COMPASS.growCanyonGrape(bx,by,bz,KRAND.hash(seed,k,side+16,0x663),0.88+0.26*H(seed,k,side+17,0x663));
     recPlace('canyongrape',bx,by,bz,basl,'irongorge');
    }else if(claim('maidenhair',bx,bz,0.55)){
     const ms=0.44+0.24*H(seed,k,side+18,0x664);
     BIO.put('ch_maidenhair',[bx,by+0.03,bz],qEuler(0,H(seed,k,side+19,0x664)*TAU,0),[ms,ms*0.78,ms],PAL.maidenhair[Math.abs(k+side)%PAL.maidenhair.length]);
     recPlace('seepmaidenhair',bx,by,bz,basl,'irongorge');
    }
   }
  }

  // ================================================================ 2. 85% MEDITERRANEAN-CONTINENTAL WOODLAND, GARRIGUE & UNDERSTORY MATRIX
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
   const sandW=fld('sand',x,z),gossW=fld('gossan',x,z),trailW=fld('trail',x,z),wetW=fld('wet',x,z);
   const inSaddleOpen=(SKEY==='cuesta'&&Math.abs(x)<105&&Math.abs(z-14*Math.sin(x*0.0055))<34);
   const treeProb=(1-sandW*0.78)*(1-gossW*0.88)*(1-trailW*0.95)*(inSaddleOpen?0.06:0.78);

   if(H(seed,cx,cz,3,0x701)<treeProb*q&&claim('tree',x,z,2.3)){
    const uSp=H(seed,cx,cz,4,0x701);
    const northCool=(sl.nz<-0.04||z<-55);
    let kind='stonepine';
    if(SKEY==='gorge'&&(wetW>0.52||Math.abs(z)<68)){
     kind=uSp<0.34?'gorgeplane':uSp<0.62?'amberstorax':uSp<0.84?'silkmulberry':'ironpistache';
    }else if(SKEY==='cuesta'){
     if(northCool){
      kind=uSp<0.24?'stonepine':uSp<0.48?'corkoak':uSp<0.68?'ironpistache':uSp<0.84?'amberstorax':'cuestaarbutus';
     }else{
      kind=uSp<0.22?'stonepine':uSp<0.42?'corkoak':uSp<0.60?'sunnycarob':uSp<0.78?'whorlolive':uSp<0.90?'ironpistache':'cuestaarbutus';
     }
    }else if(SKEY==='tors'){
     kind=uSp<0.30?'stonepine':uSp<0.56?'corkoak':uSp<0.76?'ironpistache':uSp<0.88?'cuestaarbutus':uSp<0.95?'amberstorax':'sunnycarob';
    }else{
     if(northCool){
      kind=uSp<0.26?'stonepine':uSp<0.48?'corkoak':uSp<0.66?'amberstorax':uSp<0.84?'ironpistache':'cuestaarbutus';
     }else{
      kind=uSp<0.26?'stonepine':uSp<0.48?'corkoak':uSp<0.68?'ironpistache':uSp<0.82?'whorlolive':uSp<0.92?'sunnycarob':'cuestaarbutus';
     }
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

   // Understory, garrigue, geophyte & metallophyte pass within hero+125 m:
   // Dynamically locks ferromagnetic biota right around ~15% (Earthlike ~85%, strictly inside [0.78, 0.90])!
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

     const totNow=nEarth+nFerro;
     const ferroShareNow=totNow>24?(nFerro/totNow):0.15;
     const ferroTarget=ferroShareNow>0.162?0.01:(ferroShareNow<0.142?0.38:0.16);

     if(uPick<ferroTarget){
      const uFerro=H(seed,cx,cz,13+s*6,0x710);
      const mfSub=COMPASS_PHYS.fieldAt(sx,sz,SKEY);
      const lf=COMPASS_PHYS.leafAzimuthAt(sx,sz,SKEY,H(seed,cx,cz,14+s*6,0x710));
      if(uFerro<0.38){
       placeCompassBush(sx,sz,KRAND.hash(seed,cx*31+cz,s,0x711),0.85+0.35*H(seed,cx,cz,14+s*6,0x710),'cuestawood');
      }else if(uFerro<0.72&&claim('fluxgrass',sx,sz,0.65)){
       const gs=0.72+0.42*H(seed,cx,cz,15+s*6,0x710);
       BIO.put('ch_fluxgrass',[sx,sy,sz],qEuler(0,-lf.bladeYawRad,0),[gs,gs*0.95,gs],PAL.fluxGrass[Math.abs(cx+cz+s)%PAL.fluxGrass.length]);
       recPlace('fluxgrass',sx,sy,sz,sasl,'cuestawood',{bladeYawRad:lf.bladeYawRad,align01:lf.alignment01});
      }else if((uFerro<0.87&&(ssl.slope>0.20||mfSub.bMagMt>=2.2))&&claim('spleenwort',sx,sz,0.48)){
       const fs=0.40+0.24*H(seed,cx,cz,15+s*6,0x710);
       BIO.put('ch_spleenwort',[sx,sy+0.03,sz],qEuler(0,-lf.bladeYawRad,0),[fs,fs*0.85,fs],PAL.spleenwort[Math.abs(cx*3+cz+s)%PAL.spleenwort.length]);
       recPlace('magnetitespleenwort',sx,sy,sz,sasl,'magnetor',{bMagMt:mfSub.bMagMt});
      }else if(claim('whorlheath',sx,sz,0.58)){
       const hs=0.52+0.32*H(seed,cx,cz,15+s*6,0x710);
       BIO.put('ch_whorlheath',[sx,sy+0.03,sz],qEuler(0,uPick*TAU,0),[hs,hs*0.80,hs],PAL.whorlheath[Math.abs(cx+cz*3+s)%PAL.whorlheath.length]);
       recPlace('gossanwhorlheath',sx,sy,sz,sasl,'quenchscar',{bMagMt:mfSub.bMagMt});
      }
     }else{
      const uEarth=H(seed,cx,cz,15+s*6,0x712);
      const subWet=fld('wet',sx,sz);
      if(subWet>0.58&&uEarth<0.42){
       if(uEarth<0.16&&claim('oleander',sx,sz,1.05)){
        COMPASS.growWoodyShrub('gorgeoleander',sx,sy,sz,KRAND.hash(seed,cx*19+cz,s,0x713),0.88+0.28*H(seed,cx,cz,16+s*6,0x712));
        recPlace('gorgeoleander',sx,sy,sz,sasl,'irongorge');
       }else if(uEarth<0.30&&ssl.slope>0.18&&claim('canyongrape',sx,sz,0.90)){
        COMPASS.growCanyonGrape(sx,sy,sz,KRAND.hash(seed,cx*23+cz,s,0x714),0.85+0.25*H(seed,cx,cz,16+s*6,0x712));
        recPlace('canyongrape',sx,sy,sz,sasl,'irongorge');
       }else if(claim('maidenhair',sx,sz,0.52)){
        const ms2=0.42+0.24*H(seed,cx,cz,16+s*6,0x712);
        BIO.put('ch_maidenhair',[sx,sy+0.03,sz],qEuler(0,uPick*TAU,0),[ms2,ms2*0.78,ms2],PAL.maidenhair[Math.abs(cx+cz+s)%PAL.maidenhair.length]);
        recPlace('seepmaidenhair',sx,sy,sz,sasl,'irongorge');
       }
      }else if(uEarth<0.11&&claim('juniper',sx,sz,1.05)){
       const js=1.35+0.95*H(seed,cx,cz,16+s*6,0x712);
       BIO.put('ch_juniper_fol',[sx,sy+0.35*js,sz],qEuler(0,uPick*TAU,0),[js*0.78,js,js*0.78],PAL.juniper[Math.abs(cx+cz)%PAL.juniper.length],{n:[0,1,0]});
       recPlace('cuestajuniper',sx,sy,sz,sasl,'cuestawood');
      }else if(uEarth<0.23&&claim('broom',sx,sz,0.88)){
       COMPASS.growWoodyShrub('goldenbroom',sx,sy,sz,KRAND.hash(seed,cx*29+cz,s,0x715),0.86+0.30*H(seed,cx,cz,16+s*6,0x712));
       recPlace('goldenbroom',sx,sy,sz,sasl,'cuestawood');
      }else if(uEarth<0.36&&claim('cistus',sx,sz,0.64)){
       const cs=0.62+0.36*H(seed,cx,cz,17+s*6,0x712);
       BIO.put('ch_cistus_fol',[sx,sy+0.04,sz],qEuler(0,uPick*TAU,0),[cs,cs*0.76,cs],PAL.cistus[Math.abs(cx*5+cz+s)%PAL.cistus.length]);
       recPlace('cistusrockrose',sx,sy,sz,sasl,'dipslope');
      }else if(uEarth<0.48&&claim('saffron',sx,sz,0.52)){
       const fs=0.52+0.28*H(seed,cx,cz,17+s*6,0x712);
       BIO.put('ch_saffron',[sx,sy+0.02,sz],qEuler(0,uPick*TAU,0),[fs,fs*0.72,fs],PAL.saffron[Math.abs(cx*3+cz+s)%PAL.saffron.length]);
       recPlace('saffroncrocus',sx,sy,sz,sasl,'dipslope');
      }else if(uEarth<0.59&&claim('asphodel',sx,sz,0.56)){
       const as=0.62+0.34*H(seed,cx,cz,18+s*6,0x712);
       BIO.put('ch_asphodel',[sx,sy+0.03,sz],qEuler(0,uPick*TAU,0),[as*0.82,as,as*0.82],PAL.asphodel[Math.abs(cx*7+cz+s)%PAL.asphodel.length]);
       recPlace('cuestaasphodel',sx,sy,sz,sasl,'dipslope');
      }else if(uEarth<0.80&&claim('macchia',sx,sz,0.72)){
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

  counts.earthlike=nEarth;
  counts.ferromagnetic=nFerro;
  counts.earthShare=+(nEarth/Math.max(1,nEarth+nFerro)).toFixed(4);
  return counts;
 };
})();
