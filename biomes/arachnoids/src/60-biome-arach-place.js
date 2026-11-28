// ================================================================= ARACHNOID CANYONS — deterministic cell-seeded placement ([G data] / [draw])
// Order-free placement on KRAND.hash(seed, cx, cz, idx, salt), KSPACE non-overlap & anchor pairing, CROPS fit metadata,
// and pre-draw KTAGS registration of every bridge-web span, guild volume, and surveyed geology.json resource node.
BIO.kit('arachnoids');
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const PAL=ARACHNOIDS.PAL;
 const H=(seed,cx,cz,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,((cx|0)*73856093)^((cz|0)*19349663),k|0,salt|0));

 ARACHNOIDS.build=function(o){
  o=o||{};
  const SKEY=o.station||'nexus';
  const SITE=ARACHNOIDS.SITES[SKEY]||ARACHNOIDS.SITES.nexus;
  const tH=o.terrainH||BIO.host.terrainH;
  const wH=o.waterH||BIO.host.waterH;
  const space=o.space||null;
  const reg=o.register||BIO.host.register||function(){};
  const webBatch=o.webBatch||null;
  const q=o.quality==null?1:o.quality;
  const seed=(o.seed==null?5907:o.seed)>>>0;
  const R=o.R==null?640:o.R;
  const heroR=220;

  const counts={};
  ARACHNOIDS.SPECIES.forEach(s=>{counts[s.key]=0;});
  counts.bridgeweb=0;
  counts.boulders=0;
  counts.impostors=0;
  ARACHNOIDS.PLACED.length=0;

  const recPlace=(kind,x,y,z,asl,zone,extra)=>{
   counts[kind]=(counts[kind]==null?0:counts[kind])+1;
   ARACHNOIDS.PLACED.push([kind,+x.toFixed(2),+y.toFixed(2),+z.toFixed(2),+asl.toFixed(2),zone,extra||null]);
  };

  const isDry=(x,z,margin)=>{
   const y=tH(x,z),w=wH(x,z);
   return !(w>-1e8&&y<w+(margin==null?0.22:margin));
  };
  const slopeOf=(x,z)=>{
   const e=1.5,hx=(tH(x+e,z)-tH(x-e,z))/(2*e),hz=(tH(x,z+e)-tH(x,z-e))/(2*e);
   const nL=Math.hypot(hx,1,hz);
   return{slope:Math.hypot(hx,hz),nx:-hx/nL,ny:1/nL,nz:-hz/nL};
  };
  const claim=(kind,x,z,r)=>{
   if(!space)return true;
   const hits=space.query(x,z,r);
   for(let i=0;i<hits.length;i++){
    if(hits[i])return false;
   }
   space.insert({kind:kind,x:x,z:z},x,z,r);
   return true;
  };
  const aslAt=y=>SITE.elevM+(y-SITE.bedY);

  // ================================================================ STATION 1: NEXUS (998, 290; +660.6 m, 1.47 atm, Cfa)
  if(SKEY==='nexus'){
   // 1A. Communal 0.75 g Catenary Tsek-Ma Bridge-Webs across opposite basalt dike walls (35-85 m spans, frost01 === 0)
   const anchors=SITE.webAnchors||[];
   for(let i=0;i<anchors.length;i++){
    const sp=anchors[i];
    if(webBatch){
     const ws=webBatch.addBridgeWeb(sp,tH,wH);
     if(ws&&ws.validSpan){
      const mx=0.5*(ws.a[0]+ws.b[0]),my=ws.lowestY,mz=0.5*(ws.a[2]+ws.b[2]);
      const masl=aslAt(my);
      recPlace('bridgeweb',mx,my,mz,masl,'slotfloor',{
       id:sp.id,spanM:ws.spanM,sagM:ws.sagM,clearWaterM:ws.clearBottomWaterM,anchorGapM:ws.anchorGapMaxM,frost01:ws.frost01
      });
      reg({
       tagId:'arachnoids:'+sp.id,
       name:'Tsek-Ma Communal Chasm Bridge-Web ('+ws.spanM.toFixed(0)+' m span)',
       tagClass:'feature',
       x:mx,y:my-2.0,z:mz,r:ws.spanM*0.52,h:12.0,
       tags:{biome:'arachnoids',species:'bridgearachnid',gather:'silk',spanM:ws.spanM,tiers:ws.tierCount}
      });
      // Co-evolved Gum-Pad Chasm Creepers (webanchorvine) climbing both basalt dike anchor faces!
      const dx=ws.b[0]-ws.a[0],dz=ws.b[2]-ws.a[2],dl=Math.max(1,Math.hypot(dx,dz));
      ARACHNOIDS.growWebVine(ws.a[0],ws.a[1]-6.5,ws.a[2],dx/dl,dz/dl,KRAND.hash(seed,i,1,0x401),8.2);
      recPlace('webanchorvine',ws.a[0],ws.a[1]-3.0,ws.a[2],aslAt(ws.a[1]-3.0),'slotfloor');
      ARACHNOIDS.growWebVine(ws.b[0],ws.b[1]-6.5,ws.b[2],-dx/dl,-dz/dl,KRAND.hash(seed,i,2,0x401),8.2);
      recPlace('webanchorvine',ws.b[0],ws.b[1]-3.0,ws.b[2],aslAt(ws.b[1]-3.0),'slotfloor');
     }
    }
   }

   // 1B. Horizontal hex-jointed basalt dike columns, cliff lithophytes, Zone 1 Tsek-Gompa silk slot-jungle & Zone 2 upper shoulders
   const cs=18,nc=Math.ceil(R/cs);
   for(let cz=-nc;cz<=nc;cz++)for(let cx=-nc;cx<=nc;cx++){
    const bx=cx*cs,bz=cz*cs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.95)continue;
    const x=bx+(H(seed,cx,cz,1,0x410)-0.5)*cs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x410)-0.5)*cs*0.82;
    if(!isDry(x,z,0.45))continue;
    const y=tH(x,z),asl=aslAt(y),sl=slopeOf(x,z);
    const fn=ARACH_PHYS.fissureNetAt(x,z,SITE);
    const inv=ARACH_PHYS.inversionAt(x,z,y,SITE);

    // Steep radial dike & canyon walls (slope >= 0.58): dikeclaw, seepcurtainmoss, plumeorchid, entablatureivy & hex-columns
    if(sl.slope>=0.58&&dist0<=heroR+85){
     const yaw=Math.atan2(sl.nx,sl.nz);
     if(H(seed,cx,cz,3,0x410)<0.56*q&&claim('litho',x,z,1.1)){
      const rs=0.58+0.68*H(seed,cx,cz,4,0x410);
      BIO.put('ar_dikeclaw_rosette',[x+sl.nx*0.08,y+0.05,z+sl.nz*0.08],qEuler(0.45,yaw,0),[rs,rs*0.85,rs],PAL.dikeclawSilver[Math.abs(cx+cz)%3]);
      BIO.put('ar_dikeclaw_spike',[x+sl.nx*0.18,y+0.28,z+sl.nz*0.18],qEuler(0.35,yaw,0),[rs*0.65,rs*0.95,rs*0.65],PAL.dikeclawCarmine[Math.abs(cx*3+cz)%3]);
      recPlace('dikeclaw',x,y,z,asl,'ledgewood',{slope:+sl.slope.toFixed(2)});
     }else if(inv.frost01===0&&asl<=1450.0&&y<SITE.bedY+64.0&&inv.rh01>=0.80&&H(seed,cx,cz,23,0x410)<0.46*q&&claim('seepmoss',x,z,1.0)){
      const ml=0.95+1.25*H(seed,cx,cz,24,0x410);
      BIO.put('ar_seep_moss',[x+sl.nx*0.12,y+0.25,z+sl.nz*0.12],qEuler(0,yaw,0),[0.58,ml,0.58],PAL.seepMoss[Math.abs(cx+cz)%3]);
      recPlace('seepcurtainmoss',x,y,z,asl,'slotfloor',{H:ml,frost01:inv.frost01});
     }else if(inv.frost01===0&&asl<=1450.0&&y<SITE.bedY+58.0&&H(seed,cx,cz,25,0x410)<0.36*q&&claim('orchid',x,z,0.85)){
      const os=0.34+0.28*H(seed,cx,cz,26,0x410);
      BIO.put('ar_orchid_spray',[x+sl.nx*0.14,y+0.18,z+sl.nz*0.14],qEuler(0.25,yaw,0),[os,os,os],PAL.orchid[Math.abs(cx*3+cz)%3]);
      recPlace('plumeorchid',x,y,z,asl,'slotfloor',{H:os,frost01:inv.frost01});
     }else if(asl<=2600.0&&y>=SITE.bedY+44.0&&H(seed,cx,cz,27,0x410)<0.38*q&&claim('entabivy',x,z,1.1)){
      const il=1.9+2.6*H(seed,cx,cz,28,0x410);
      BIO.put('ar_entab_ivy',[x+sl.nx*0.14,y+0.35,z+sl.nz*0.14],qEuler(0,yaw,0),[0.72,il,0.72],PAL.hangIvy[Math.abs(cx+cz)%3]);
      recPlace('entablatureivy',x,y,z,asl,'ledgewood',{H:il});
     }
     if(fn.spokeDistM<22.0&&H(seed,cx,cz,5,0x410)<0.45*q){
      const hs=1.2+1.6*H(seed,cx,cz,6,0x410);
      BIO.put('ar_rock_hex_horiz',[x,y,z],qEuler(0,yaw,0),[hs*1.4,hs*0.65,hs*0.65],PAL.basalt[Math.abs(cx)%3]);
      counts.boulders++;
     }
     continue;
    }

    // Gentle/moderate gorge benches & upper shoulders (slope < 0.58)
    if(sl.slope<0.58&&H(seed,cx,cz,7,0x411)<0.74*q){
     const isUpper=y>SITE.bedY+66.0;
     const uSp=H(seed,cx,cz,8,0x411);
     if(!isUpper&&inv.frost01===0&&asl<=1450.0&&dist0<=heroR+45&&BIO.bamboo&&uSp<0.26&&claim('bamboo',x,z,2.4)){
      const B=BIO.bamboo,canes=B.clump({seed:KRAND.hash(seed,cx*97+cz,15,0x412),at:[x,y-0.08,z],n:[4,7],r:0.6,H:8.2,hs:[0.7,1.15],d:0.10});
      for(let ci=0;ci<canes.length;ci++){
       const c=canes[ci],col=PAL.bamboo[(ci+Math.abs(cx+cz))%PAL.bamboo.length];
       B.put('ar_bamboo_culm',[c],col);
       for(let sk=0;sk<2;sk++){
        BIO.put('ar_bamboo_leaf'+sk,[c.p[0],c.p[1]+c.h*(0.62+0.2*sk),c.p[2]],qEuler(0,c.az+sk*2.2,0),[2.2,2.2,2.2],col);
       }
      }
      BIO.put('ar_bamboo_shoot',[x+0.4,y-0.04,z-0.3],qEuler(0,0,0),[0.2,0.8,0.2],0x8a7848);
      recPlace('canyonbamboo',x,y,z,asl,'slotfloor',{canes:canes.length,frost01:inv.frost01});
     }else if(claim('tree',x,z,2.3)){
      let kind='columnarpine';
      if(!isUpper&&inv.frost01===0&&asl<=1450.0){
       kind=uSp<0.62?'gorgehemlock':uSp<0.90?'slotmulberry':'columnarpine';
      }else if(asl<=2600.0){
       kind=fn.vitrophyre01>0.35?(uSp<0.56?'spokedikejuniper':'columnarpine'):(uSp<0.44?'columnarpine':uSp<0.68?'ledgeoak':uSp<0.86?'amberpistache':'spokedikejuniper');
      }
      const tSeed=KRAND.hash(seed,cx*131+cz,9,0x411),sc=0.84+0.32*H(seed,cx,cz,10,0x411);
      const zoneTag=(kind==='slotmulberry'||kind==='gorgehemlock')?'slotfloor':inv.zoneBand;
      if(dist0<=heroR){
       const res=ARACHNOIDS.growTree(kind,x,y,z,tSeed,sc,{leanX:sl.nx*0.12,leanZ:sl.nz*0.12});
       recPlace(kind,x,y,z,asl,zoneTag,{H:res.H,frost01:inv.frost01});
       if(kind==='slotmulberry'||kind==='gorgehemlock'){
        if(inv.frost01===0&&asl<=1450.0&&H(seed,cx,cz,29,0x411)<0.38*q){
         const os=0.32+0.24*H(seed,cx,cz,30,0x411);
         BIO.put('ar_orchid_spray',[x+0.28,y+1.15,z+0.18],qEuler(0.2,uSp*TAU,0),[os,os,os],PAL.orchid[Math.abs(cx+cz)%3]);
         recPlace('plumeorchid',x+0.28,y+1.15,z+0.18,aslAt(y+1.15),'slotfloor',{H:os,frost01:inv.frost01});
        }
       }
      }else if(ARACHNOIDS.IMP&&ARACHNOIDS.IMP[kind]){
       BIO.impostorPut('ar_tree_imp',ARACHNOIDS.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,11,0x411)*TAU,sc,null);
       counts.impostors++;
       recPlace(kind,x,y,z,asl,zoneTag,{impostor:1,frost01:inv.frost01});
      }
     }
    }

    // Slot-bottom taro, canyon tea, vitrophyre lip-ferns, upper saffron & dike talus
    if(dist0<=heroR+65){
     const ux=x+(H(seed,cx,cz,12,0x412)-0.5)*13,uz=z+(H(seed,cx,cz,13,0x412)-0.5)*13;
     if(isDry(ux,uz,0.32)&&slopeOf(ux,uz).slope<0.58){
      const uy=tH(ux,uz),uasl=aslAt(uy);
      const uInv=ARACH_PHYS.inversionAt(ux,uz,uy,SITE);
      const uFn=ARACH_PHYS.fissureNetAt(ux,uz,SITE);
      const uRoll=H(seed,cx,cz,14,0x412);
      if(uInv.frost01===0&&uasl<=1450.0&&uy<SITE.bedY+64.0&&uRoll<0.38*q&&claim('taro',ux,uz,0.82)){
       const tr=ARACHNOIDS.growTaroClump(ux,uy,uz,KRAND.hash(seed,cx*83+cz,31,0x412),0.90+0.28*H(seed,cx,cz,32,0x412));
       recPlace('steambedtaro',ux,uy,uz,uasl,'slotfloor',{H:tr.H,frost01:uInv.frost01});
      }else if(uInv.frost01===0&&uasl<=1450.0&&uy<SITE.bedY+68.0&&uRoll<0.76*q&&claim('tea',ux,uz,0.85)){
       const ts=ARACHNOIDS.growTeaShrub(ux,uy,uz,KRAND.hash(seed,cx*71+cz,33,0x412),0.90+0.25*H(seed,cx,cz,34,0x412));
       recPlace('mistcanyontea',ux,uy,uz,uasl,'slotfloor',{H:ts.H,frost01:uInv.frost01});
      }else if(uasl<=2600.0&&uFn.vitrophyre01>0.35&&uRoll<0.86*q&&claim('lipfern',ux,uz,0.80)){
       const lf=ARACHNOIDS.growLipFern(ux,uy,uz,KRAND.hash(seed,cx*67+cz,35,0x412),0.92+0.26*H(seed,cx,cz,36,0x412));
       recPlace('vitrophyrelipfern',ux,uy,uz,uasl,'dryrim',{H:lf.H,vitro01:uFn.vitrophyre01});
      }else if(uasl<=2600.0&&uy>=SITE.bedY+66.0&&uRoll<0.92*q&&claim('saffron',ux,uz,0.72)){
       const sf=0.22+0.12*H(seed,cx,cz,37,0x412);
       BIO.put('ar_saffron_clump',[ux,uy+0.02,uz],qEuler(0,H(seed,cx,cz,38,0x412)*TAU,0),[sf*1.2,sf,sf*1.2],PAL.saffron[Math.abs(cx+cz)%4]);
       recPlace('gompasaffron',ux,uy,uz,uasl,'dryrim',{H:sf});
      }else if(claim('fern',ux,uz,0.75)){
       const fs=1.0+0.65*H(seed,cx,cz,16,0x412);
       BIO.put('ar_floorfern',[ux,uy,uz],qEuler(0,H(seed,cx,cz,17,0x412)*TAU,0),[fs,fs*0.85,fs],PAL.floorFern[Math.abs(cx+cz)%3]);
       recPlace('alpinesedge',ux,uy,uz,uasl,uInv.zoneBand);
      }
     }
     if(H(seed,cx,cz,18,0x413)<0.38*q){
      const rx=bx+(H(seed,cx,cz,19,0x413)-0.5)*cs,rz=bz+(H(seed,cx,cz,20,0x413)-0.5)*cs;
      if(isDry(rx,rz,0.1)&&claim('rock',rx,rz,1.5)){
       const ry=tH(rx,rz),rs=0.75+1.45*H(seed,cx,cz,21,0x413);
       const rk=fn.vitrophyre01>0.5?'ar_rock_vitrophyre':fn.spokeDistM<18?'ar_rock_bolus':'ar_rock_sandstone';
       const rc=rk==='ar_rock_vitrophyre'?PAL.vitrophyre[0]:rk==='ar_rock_bolus'?PAL.bolus[0]:PAL.sandstone[0];
       BIO.put(rk,[rx,ry-0.22,rz],qEuler(0,H(seed,cx,cz,22,0x413)*TAU,0),[rs,rs*0.72,rs],rc);
       counts.boulders++;
      }
     }
    }
   }

   reg({tagId:'arachnoids:node-iron-nexus',name:'Fe-Ti Radial Basalt Dike Magnetite Lode (iron=180)',tagClass:'feature',x:46,y:18,z:32,r:24,h:45,tags:{biome:'arachnoids',resource:'iron',grade:180}});
   reg({tagId:'arachnoids:node-saltpeter-nexus',name:'Dry Overhang Nitre-Swiftlet Guano Crust (saltpeter=200)',tagClass:'feature',x:-64,y:12,z:76,r:22,h:14,tags:{biome:'arachnoids',resource:'saltpeter',grade:200}});
   reg({tagId:'arachnoids:star-junction-gorge',name:'Ham-Tsek 3-Spoke Radial Dike Shut-In & Bridge-Web Gallery',x:0,y:-15,z:0,r:115,h:120,tags:{biome:'arachnoids',zone:'slotfloor'}});
  }

  // ================================================================ STATION 2: FUMAROLE (1097, 331; +912.6 m, +28 C trough)
  else if(SKEY==='fumarole'){
   // 2A. Step-pool sinter rims, thermophilic sintermat cushions & warm-margin steambedtaro rosettes
   const pools=(typeof STEP_POOLS!=='undefined'&&STEP_POOLS)?STEP_POOLS:(SITE.stepPools||[]);
   for(let i=0;i<pools.length;i++){
    const P=pools[i],nSeg=16;
    for(let s=0;s<nSeg;s++){
     const ang=(s/nSeg)*TAU+0.12*H(seed,i,s,0x510);
     const rx=P.x+Math.cos(ang)*P.r*1.04,rz=P.z+Math.sin(ang)*P.r*1.04;
     const ry=tH(rx,rz),rasl=aslAt(ry);
     BIO.put('ar_rock_sinter',[rx,ry-0.08,rz],qEuler(0,ang,0),[1.45,0.65,1.15],PAL.sinterRock[(i+s)%3]);
     const col=P.tempC>=34.5?PAL.sinterHot[(i+s)%PAL.sinterHot.length]:PAL.sinterWarm[(i+s)%PAL.sinterWarm.length];
     BIO.put('ar_sinter_crust',[rx,ry+0.03,rz],qEuler(0,ang*1.3,0),[1.35,1.0,1.35],col);
     recPlace('sintermat',rx,ry,rz,rasl,'slotfloor',{step:i,tempC:P.tempC,frost01:0});
     if(s%4===0&&rasl<=1450.0){
      const tx=P.x+Math.cos(ang)*(P.r+1.85),tz=P.z+Math.sin(ang)*(P.r+1.85);
      if(isDry(tx,tz,0.18)){
       const ty=tH(tx,tz),tasl=aslAt(ty),tInv=ARACH_PHYS.inversionAt(tx,tz,ty,SITE),tFum=ARACH_PHYS.fumaroleAt(tx,tz,SITE);
       if(tInv.frost01===0&&tasl<=1450.0&&tFum.groundTempC<46.0&&claim('taro',tx,tz,0.85)){
        const tr=ARACHNOIDS.growTaroClump(tx,ty,tz,KRAND.hash(seed,i*31+s,1,0x511),0.92+0.26*H(seed,i,s,0x511));
        recPlace('steambedtaro',tx,ty,tz,tasl,'slotfloor',{H:tr.H,frost01:tInv.frost01});
       }
      }
     }
    }
   }

   // 2B. Fumarole sinter aprons, Steam-Plume Tree-Ferns, Silk-Mulberry, Tea, Dendrobium Orchids, Seep-Moss & Canyon Bamboo
   const cs=16,nc=Math.ceil(R/cs);
   for(let cz=-nc;cz<=nc;cz++)for(let cx=-nc;cx<=nc;cx++){
    const bx=cx*cs,bz=cz*cs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.95)continue;
    const x=bx+(H(seed,cx,cz,1,0x520)-0.5)*cs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x520)-0.5)*cs*0.82;
    if(!isDry(x,z,0.38))continue;
    const y=tH(x,z),asl=aslAt(y),sl=slopeOf(x,z);
    const inv=ARACH_PHYS.inversionAt(x,z,y,SITE);
    const fum=ARACH_PHYS.fumaroleAt(x,z,SITE);

    // Thermophilic sintermat mats across fumarole aprons (34..62 C, frost01 === 0 && asl <= 1450)
    if(inv.frost01===0&&asl<=1450.0&&dist0<=heroR+40&&fum.sinterRim01>=0.42&&sl.slope<0.48&&H(seed,cx,cz,3,0x520)<0.75*q&&claim('sinter',x,z,1.1)){
     const col=fum.groundTempC>=48.0?PAL.sinterHot[Math.abs(cx+cz)%3]:PAL.sinterWarm[Math.abs(cx*3+cz)%4];
     const sc=0.85+0.75*H(seed,cx,cz,4,0x520);
     BIO.put(fum.groundTempC>=46.0?'ar_sinter_crust':'ar_sinter_dome',[x,y+0.02,z],qEuler(0,H(seed,cx,cz,5,0x520)*TAU,0),[sc,0.55,sc],col);
     recPlace('sintermat',x,y,z,asl,'slotfloor',{groundTempC:fum.groundTempC,frost01:inv.frost01});
    }

    // Cliff lithophytes, dripping seepcurtainmoss & steam-mist plumeorchid on cauldron walls
    if(sl.slope>=0.60&&dist0<=heroR+80){
     const yaw=Math.atan2(sl.nx,sl.nz);
     if(inv.frost01===0&&asl<=1450.0&&y<SITE.bedY+66.0&&H(seed,cx,cz,20,0x520)<0.48*q&&claim('seepmoss',x,z,1.0)){
      const ml=0.95+1.30*H(seed,cx,cz,21,0x520);
      BIO.put('ar_seep_moss',[x+sl.nx*0.12,y+0.25,z+sl.nz*0.12],qEuler(0,yaw,0),[0.60,ml,0.60],PAL.seepMoss[Math.abs(cx+cz)%3]);
      recPlace('seepcurtainmoss',x,y,z,asl,'slotfloor',{H:ml,frost01:inv.frost01});
     }else if(inv.frost01===0&&asl<=1450.0&&y<SITE.bedY+60.0&&H(seed,cx,cz,22,0x520)<0.38*q&&claim('orchid',x,z,0.85)){
      const os=0.34+0.26*H(seed,cx,cz,23,0x520);
      BIO.put('ar_orchid_spray',[x+sl.nx*0.14,y+0.18,z+sl.nz*0.14],qEuler(0.25,yaw,0),[os,os,os],PAL.orchid[Math.abs(cx*3+cz)%3]);
      recPlace('plumeorchid',x,y,z,asl,'slotfloor',{H:os,frost01:inv.frost01});
     }else if(H(seed,cx,cz,6,0x520)<0.55*q&&claim('litho',x,z,1.1)){
      const rs=0.55+0.65*H(seed,cx,cz,7,0x520);
      BIO.put('ar_dikeclaw_rosette',[x+sl.nx*0.08,y+0.05,z+sl.nz*0.08],qEuler(0.45,yaw,0),[rs,rs*0.85,rs],PAL.dikeclawSilver[Math.abs(cx)%3]);
      BIO.put('ar_dikeclaw_spike',[x+sl.nx*0.16,y+0.26,z+sl.nz*0.16],qEuler(0.35,yaw,0),[rs*0.6,rs*0.9,rs*0.6],PAL.dikeclawCarmine[Math.abs(cz)%3]);
      recPlace('dikeclaw',x,y,z,asl,'ledgewood');
     }
     continue;
    }

    // Strict frost-free & <= +1,450 m Steam-Plume Tree-Fern (fumarolefern) gallery on warm humid cauldron floor!
    if(inv.frost01===0&&asl<=1450.0&&inv.rh01>=0.82&&fum.groundTempC<56.0&&sl.slope<0.48&&dist0<=heroR+35){
     if(H(seed,cx,cz,8,0x521)<0.52*q&&claim('fumarolefern',x,z,1.85)){
      const fRes=ARACHNOIDS.growFumaroleFern(x,y,z,KRAND.hash(seed,cx*113+cz,9,0x521),0.88+0.34*H(seed,cx,cz,10,0x521));
      recPlace('fumarolefern',x,y,z,asl,'slotfloor',{H:fRes.H,rh01:inv.rh01,frost01:inv.frost01});
      continue;
     }
    }

    // Canyon bamboo thickets, Tsek-Gompa silk-mulberry, gorge hemlocks & upper rim pines
    if(sl.slope<0.54&&fum.groundTempC<44.0&&H(seed,cx,cz,11,0x522)<0.60*q){
     if(inv.frost01===0&&asl<=1450.0&&y<SITE.bedY+38.0&&BIO.bamboo&&H(seed,cx,cz,12,0x522)<0.44&&dist0<=heroR+40&&claim('bamboo',x,z,2.7)){
      const B=BIO.bamboo,canes=B.clump({seed:KRAND.hash(seed,cx*89+cz,13,0x522),at:[x,y-0.08,z],n:[5,8],r:0.65,H:8.8,hs:[0.72,1.18],d:0.11});
      for(let ci=0;ci<canes.length;ci++){
       const c=canes[ci],col=PAL.bamboo[(ci+Math.abs(cx+cz))%PAL.bamboo.length];
       B.put('ar_bamboo_culm',[c],col);
       for(let sk=0;sk<2;sk++){
        BIO.put('ar_bamboo_leaf'+sk,[c.p[0],c.p[1]+c.h*(0.62+0.2*sk),c.p[2]],qEuler(0,c.az+sk*2.1,0),[2.3,2.3,2.3],col);
       }
      }
      recPlace('canyonbamboo',x,y,z,asl,'slotfloor',{canes:canes.length,frost01:inv.frost01});
     }else if(claim('tree',x,z,2.4)){
      const isRim=y>SITE.bedY+95.0;
      const uTree=H(seed,cx,cz,24,0x522);
      const kind=isRim?'columnarpine':(inv.frost01===0&&asl<=1450.0&&uTree<0.40)?'slotmulberry':'gorgehemlock';
      const sc=0.82+0.34*H(seed,cx,cz,14,0x522);
      const zTag=kind==='slotmulberry'?'slotfloor':inv.zoneBand;
      if(dist0<=heroR){
       const res=ARACHNOIDS.growTree(kind,x,y,z,KRAND.hash(seed,cx*137+cz,15,0x522),sc,{});
       recPlace(kind,x,y,z,asl,zTag,{H:res.H,frost01:inv.frost01});
       if(inv.frost01===0&&asl<=1450.0&&H(seed,cx,cz,25,0x522)<0.40*q){
        const os=0.34+0.24*H(seed,cx,cz,26,0x522);
        BIO.put('ar_orchid_spray',[x+0.26,y+1.1,z-0.2],qEuler(0.2,uTree*TAU,0),[os,os,os],PAL.orchid[Math.abs(cx+cz)%3]);
        recPlace('plumeorchid',x+0.26,y+1.1,z-0.2,aslAt(y+1.1),'slotfloor',{H:os,frost01:inv.frost01});
       }
      }else if(ARACHNOIDS.IMP&&ARACHNOIDS.IMP[kind]){
       BIO.impostorPut('ar_tree_imp',ARACHNOIDS.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,16,0x522)*TAU,sc,null);
       counts.impostors++;
       recPlace(kind,x,y,z,asl,zTag,{impostor:1,frost01:inv.frost01});
      }
     }
    }

    // Mist-bench canyon tea, steambed taro & floor sword-ferns (offset understory sample so shrubs nestle cleanly between trunks)
    if(dist0<=heroR+55){
     const ux=x+(H(seed,cx,cz,32,0x523)-0.5)*12,uz=z+(H(seed,cx,cz,33,0x523)-0.5)*12;
     if(isDry(ux,uz,0.32)&&slopeOf(ux,uz).slope<0.52&&H(seed,cx,cz,17,0x523)<0.62*q){
      const uy=tH(ux,uz),uasl=aslAt(uy),uInv=ARACH_PHYS.inversionAt(ux,uz,uy,SITE),uFum=ARACH_PHYS.fumaroleAt(ux,uz,SITE);
      const uHerb=H(seed,cx,cz,27,0x523);
      if(uInv.frost01===0&&uasl<=1450.0&&uy<SITE.bedY+64.0&&uFum.groundTempC<46.0&&uHerb<0.42&&claim('tea',ux,uz,0.85)){
       const ts=ARACHNOIDS.growTeaShrub(ux,uy,uz,KRAND.hash(seed,cx*79+cz,28,0x523),0.90+0.26*H(seed,cx,cz,29,0x523));
       recPlace('mistcanyontea',ux,uy,uz,uasl,'slotfloor',{H:ts.H,frost01:uInv.frost01});
      }else if(uInv.frost01===0&&uasl<=1450.0&&uy<SITE.bedY+36.0&&uFum.groundTempC<48.0&&uHerb<0.68&&claim('taro',ux,uz,0.82)){
       const tr=ARACHNOIDS.growTaroClump(ux,uy,uz,KRAND.hash(seed,cx*61+cz,30,0x523),0.90+0.26*H(seed,cx,cz,31,0x523));
       recPlace('steambedtaro',ux,uy,uz,uasl,'slotfloor',{H:tr.H,frost01:uInv.frost01});
      }else if(uFum.groundTempC<52.0&&claim('herb',ux,uz,0.75)){
       const fs=1.05+0.65*H(seed,cx,cz,18,0x523);
       BIO.put('ar_floorfern',[ux,uy,uz],qEuler(0,H(seed,cx,cz,19,0x523)*TAU,0),[fs,fs*0.85,fs],PAL.floorFern[Math.abs(cx+cz)%3]);
       recPlace('alpinesedge',ux,uy,uz,uasl,'slotfloor');
      }
     }
    }
   }

   reg({tagId:'arachnoids:node-placer-tin-gold',name:'Ham-Tsek Cassiterite & Gold Placer Bar (tin=200, gold=110)',tagClass:'feature',x:98,y:2,z:-64,r:28,h:8,tags:{biome:'arachnoids',resource:'tin',secondary:'gold',placer:true,grade:200}});
   reg({tagId:'arachnoids:node-sulfur-fumarole',name:'Ring-Fault Hydrothermal Sulfur Sublimate Apron (sulfur=60)',tagClass:'feature',x:-18,y:4,z:52,r:48,h:14,tags:{biome:'arachnoids',resource:'sulfur',grade:60}});
   reg({tagId:'arachnoids:step-pool-terrace',name:'Turquoise Basalt-Weir Step-Pools & Fumarole-Fern Gallery',x:-15,y:2,z:-48,r:98,h:28,tags:{biome:'arachnoids',zone:'slotfloor'}});
  }

  // ================================================================ STATION 3: LEDGES (984, 283; +1,629.0 m, 1.31 atm, Csa)
  else if(SKEY==='ledges'){
   const cs=17,nc=Math.ceil(R/cs);
   for(let cz=-nc;cz<=nc;cz++)for(let cx=-nc;cx<=nc;cx++){
    const bx=cx*cs,bz=cz*cs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.95)continue;
    const x=bx+(H(seed,cx,cz,1,0x610)-0.5)*cs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x610)-0.5)*cs*0.82;
    if(!isDry(x,z,0.5))continue;
    const y=tH(x,z),asl=aslAt(y),sl=slopeOf(x,z);
    // Keep placement focused on the mid-wall ledges & cliffs (y > -125 m, asl <= 2600 m; 0 Zone 1 species!)
    if(y<-125.0||asl>2600.0)continue;
    const fn=ARACH_PHYS.fissureNetAt(x,z,SITE);

    // Sheer horizontal-column basalt & tuff risers (slope >= 0.60): dikeclaw, entablatureivy, webanchorvine & hex-columns!
    if(sl.slope>=0.60&&dist0<=heroR+95){
     const yaw=Math.atan2(sl.nx,sl.nz);
     if(H(seed,cx,cz,3,0x610)<0.64*q&&claim('dikeclaw',x,z,1.0)){
      const rs=0.62+0.74*H(seed,cx,cz,4,0x610);
      BIO.put('ar_dikeclaw_rosette',[x+sl.nx*0.08,y+0.05,z+sl.nz*0.08],qEuler(0.48,yaw,0),[rs,rs*0.85,rs],PAL.dikeclawSilver[Math.abs(cx+cz)%3]);
      BIO.put('ar_dikeclaw_spike',[x+sl.nx*0.18,y+0.30,z+sl.nz*0.18],qEuler(0.36,yaw,0),[rs*0.68,rs*1.0,rs*0.68],PAL.dikeclawCarmine[Math.abs(cx*5+cz)%3]);
      recPlace('dikeclaw',x,y,z,asl,'ledgewood',{slope:+sl.slope.toFixed(2)});
     }else if(H(seed,cx,cz,24,0x610)<0.46*q&&claim('entabivy',x,z,1.15)){
      const il=2.1+2.8*H(seed,cx,cz,25,0x610);
      BIO.put('ar_entab_ivy',[x+sl.nx*0.14,y+0.35,z+sl.nz*0.14],qEuler(0,yaw,0),[0.76,il,0.76],PAL.hangIvy[Math.abs(cx+cz)%3]);
      recPlace('entablatureivy',x,y,z,asl,'ledgewood',{H:il});
     }
     if(H(seed,cx,cz,5,0x610)<0.26*q&&claim('vine',x,z,1.8)){
      ARACHNOIDS.growWebVine(x,y-2.5,z,sl.nx,sl.nz,KRAND.hash(seed,cx,cz,0x611),7.5+4.5*H(seed,cx,cz,6,0x610));
      recPlace('webanchorvine',x,y,z,asl,'ledgewood');
     }
     if(fn.vitrophyre01>0.35&&H(seed,cx,cz,26,0x610)<0.42*q&&claim('lipfern',x,z,0.85)){
      const lf=ARACHNOIDS.growLipFern(x+sl.nx*0.08,y+0.05,z+sl.nz*0.08,KRAND.hash(seed,cx*53+cz,27,0x610),0.92);
      recPlace('vitrophyrelipfern',x,y,z,asl,'dryrim',{H:lf.H,vitro01:fn.vitrophyre01});
     }
     if(H(seed,cx,cz,7,0x610)<0.42*q){
      const hs=1.1+1.5*H(seed,cx,cz,8,0x610);
      BIO.put('ar_rock_hex_horiz',[x,y,z],qEuler(0,yaw,0),[hs*1.45,hs*0.65,hs*0.65],PAL.basalt[Math.abs(cx+cz)%3]);
      counts.boulders++;
     }
     continue;
    }

    // Stepped Csa horizontal basalt & outland-tuff benches: columnarpine, ledgeoak, amberpistache & radial spokedikejuniper
    if(sl.slope<0.60&&H(seed,cx,cz,9,0x612)<0.74*q&&claim('tree',x,z,2.3)){
     const uSp=H(seed,cx,cz,10,0x612);
     const kind=fn.vitrophyre01>0.35
      ?(uSp<0.62?'spokedikejuniper':'columnarpine')
      :(uSp<0.38?'columnarpine':uSp<0.62?'ledgeoak':uSp<0.85?'amberpistache':'spokedikejuniper');
     const tSeed=KRAND.hash(seed,cx*149+cz,11,0x612),sc=0.84+0.36*H(seed,cx,cz,12,0x612);
     const zTag=(kind==='spokedikejuniper'||kind==='ledgeoak')?'dryrim':'ledgewood';
     if(dist0<=heroR){
      const res=ARACHNOIDS.growTree(kind,x,y,z,tSeed,sc,{leanX:sl.nx*0.18,leanZ:Math.max(0.08,sl.nz*0.22)});
      recPlace(kind,x,y,z,asl,zTag,{H:res.H,vitro01:fn.vitrophyre01});
     }else if(ARACHNOIDS.IMP&&ARACHNOIDS.IMP[kind]){
      BIO.impostorPut('ar_tree_imp',ARACHNOIDS.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,13,0x612)*TAU,sc,null);
      counts.impostors++;
      recPlace(kind,x,y,z,asl,zTag,{impostor:1});
     }
    }

    // Dry Csa sun-bench gompasaffron crocus carpets, vitrophyrelipfern along dike margins, sedges & tuff/granite blocks
    if(dist0<=heroR+70){
     const ux=x+(H(seed,cx,cz,14,0x613)-0.5)*10,uz=z+(H(seed,cx,cz,15,0x613)-0.5)*10;
     if(isDry(ux,uz,0.3)&&slopeOf(ux,uz).slope<0.58){
      const uy=tH(ux,uz),uasl=aslAt(uy),uFn=ARACH_PHYS.fissureNetAt(ux,uz,SITE);
      if(uasl<=2600.0){
       const uRoll=H(seed,cx,cz,28,0x613);
       if(uFn.vitrophyre01>0.35&&uRoll<0.58*q&&claim('lipfern',ux,uz,0.82)){
        const lf=ARACHNOIDS.growLipFern(ux,uy,uz,KRAND.hash(seed,cx*59+cz,29,0x613),0.90+0.30*H(seed,cx,cz,30,0x613));
        recPlace('vitrophyrelipfern',ux,uy,uz,uasl,'dryrim',{H:lf.H,vitro01:uFn.vitrophyre01});
       }else if(uRoll<0.44*q&&claim('saffron',ux,uz,0.72)){
        const sf=0.20+0.15*H(seed,cx,cz,31,0x613);
        BIO.put('ar_saffron_clump',[ux,uy+0.02,uz],qEuler(0,H(seed,cx,cz,32,0x613)*TAU,0),[sf*1.25,sf,sf*1.25],PAL.saffron[Math.abs(cx*3+cz)%4]);
        recPlace('gompasaffron',ux,uy,uz,uasl,'dryrim',{H:sf});
       }else if(claim('sedge',ux,uz,0.8)){
        const ss=0.85+0.55*H(seed,cx,cz,16,0x613);
        BIO.put('ar_sedge',[ux,uy,uz],qEuler(0,H(seed,cx,cz,17,0x613)*TAU,0),[ss,ss*0.85,ss],PAL.sedge[Math.abs(cx+cz)%4]);
        recPlace('alpinesedge',ux,uy,uz,uasl,'dryrim');
       }
      }
     }
     if(H(seed,cx,cz,18,0x614)<0.36*q){
      const rx=bx+(H(seed,cx,cz,19,0x614)-0.5)*cs,rz=bz+(H(seed,cx,cz,20,0x614)-0.5)*cs;
      if(isDry(rx,rz,0.2)&&tH(rx,rz)>-90.0&&claim('rock',rx,rz,1.5)){
       const ry=tH(rx,rz),rs=0.75+1.45*H(seed,cx,cz,21,0x614);
       const isTuff=H(seed,cx,cz,22,0x614)<0.58;
       BIO.put(isTuff?'ar_rock_tuff':'ar_rock_granite',[rx,ry-0.22,rz],qEuler(0,H(seed,cx,cz,23,0x614)*TAU,0),[rs,rs*0.74,rs],isTuff?PAL.tuff[Math.abs(cx)%3]:PAL.granite[Math.abs(cz)%3]);
       counts.boulders++;
      }
     }
    }
   }

   reg({tagId:'arachnoids:node-tin-ledges',name:'Diapir Granite Contact Cassiterite & Rare-Earth Vein (tin=200, rare-earth=160)',tagClass:'resource',x:52,y:16,z:-58,r:28,h:24,tags:{biome:'arachnoids',resource:'tin',secondary:'rare-earth',grade:200}});
   reg({tagId:'arachnoids:colonnade-ledge-woods',name:'Csa Horizontal Basalt Colonnade & Ledge-Pine Bench Woods',x:0,y:8,z:12,r:110,h:65,tags:{biome:'arachnoids',zone:'ledgewood'}});
  }

  // ================================================================ STATION 4: FROSTRIM (919, 281; +4,784.3 m, 0.88 atm, ET -2 C)
  else{
   const cs=15,nc=Math.ceil(R/cs);
   for(let cz=-nc;cz<=nc;cz++)for(let cx=-nc;cx<=nc;cx++){
    const bx=cx*cs,bz=cz*cs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.92||dist0>heroR+95)continue;
    const x=bx+(H(seed,cx,cz,1,0x710)-0.5)*cs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x710)-0.5)*cs*0.82;
    const y=tH(x,z),asl=aslAt(y),sl=slopeOf(x,z);
    // Keep flora on the high frost-rim plateau & lip (y > -12 m, slope < 0.68)
    if(y<-12.0||sl.slope>0.68)continue;

    const fn=ARACH_PHYS.fissureNetAt(x,z,SITE);
    const inv=ARACH_PHYS.inversionAt(x,z,y,SITE);
    const shear=ARACH_PHYS.krummholzShearAt(x,z,SITE);

    // 4A. Updraft-Flagged Rim Pine-Juniper (rimkrummholz <= 1.9 m, banner >= 1.8 m) & leeward Snowbed Dwarf-Birch (snowbeddwarfbirch <= 1.1 m)
    const nearLip=smooth(-15.0,85.0,z)*smooth(142.0,118.0,z);
    const leeBed=smooth(98.0,18.0,z);
    if(shear.updraftMs>=3.0&&H(seed,cx,cz,3,0x710)<(0.22+0.58*nearLip)*q&&claim('krummholz',x,z,2.0)){
     const kRes=ARACHNOIDS.growKrummholz(x,y,z,KRAND.hash(seed,cx*157+cz,4,0x710),shear);
     recPlace('rimkrummholz',x,y,z,asl,'frostrim',{
      H:kRes.H,updraftMs:shear.updraftMs,pAtm:shear.pAtm,prostrateH:kRes.H,bannerLenM:kRes.bannerLenM,yawRad:+kRes.yawRad.toFixed(4)
     });
    }else if(inv.frost01>=0.65&&H(seed,cx,cz,20,0x710)<(0.18+0.42*leeBed)*q&&claim('dwarfbirch',x,z,1.5)){
     const db=ARACHNOIDS.growDwarfBirch(x,y,z,KRAND.hash(seed,cx*149+cz,21,0x710),shear.yawRad);
     recPlace('snowbeddwarfbirch',x,y,z,asl,'frostrim',{H:db.H,prostrateH:db.H,frost01:inv.frost01});
    }

    // 4B. Strictly prostrate (<= 1.4 m) frostcushion, rimcladonia, rimedelweiss, wildfrostroot & alpinesedge across KFROST polygons
    const ux=x+(H(seed,cx,cz,5,0x711)-0.5)*10,uz=z+(H(seed,cx,cz,6,0x711)-0.5)*10;
    const uy=tH(ux,uz);
    if(uy>-8.0&&slopeOf(ux,uz).slope<0.58){
     const uasl=aslAt(uy),uRoll=H(seed,cx,cz,7,0x711);
     if(inv.frost01>=0.65&&uRoll<(0.26+0.26*fn.vitrophyre01)*q&&claim('cushion',ux,uz,0.95)){
      const cr=0.34+0.48*H(seed,cx,cz,8,0x711),ch=0.18+0.26*H(seed,cx,cz,9,0x711);
      BIO.put('ar_frost_dome',[ux,uy-0.02,uz],qEuler(0,H(seed,cx,cz,10,0x711)*TAU,0),[cr,ch,cr],PAL.frostCushion[Math.abs(cx*5+cz*9)%4]);
      recPlace('frostcushion',ux,uy,uz,uasl,'frostrim',{H:ch,frost01:inv.frost01,vitro01:fn.vitrophyre01});
     }else if(inv.frost01>=0.65&&uRoll<0.52*q&&claim('cladonia',ux,uz,0.85)){
      const cs2=0.52+0.54*H(seed,cx,cz,22,0x711),ch2=0.05+0.07*H(seed,cx,cz,23,0x711);
      BIO.put('ar_cladonia_mat',[ux,uy+0.02,uz],qEuler(0,H(seed,cx,cz,24,0x711)*TAU,0),[cs2,1.0,cs2],PAL.cladonia[Math.abs(cx+cz)%3]);
      recPlace('rimcladonia',ux,uy,uz,uasl,'frostrim',{H:ch2,frost01:inv.frost01});
     }else if(inv.frost01>=0.65&&uRoll<0.68*q&&claim('edelweiss',ux,uz,0.68)){
      const es=0.14+0.11*H(seed,cx,cz,25,0x711);
      BIO.put('ar_edelweiss_bloom',[ux,uy+es*0.45,uz],qEuler(0,H(seed,cx,cz,26,0x711)*TAU,0),[es*1.3,es,es*1.3],PAL.edelweiss[Math.abs(cx*3+cz)%3]);
      recPlace('rimedelweiss',ux,uy,uz,uasl,'frostrim',{H:es,frost01:inv.frost01});
     }else if(inv.frost01>=0.65&&uRoll<0.84*q&&claim('frostroot',ux,uz,0.72)){
      const fr=0.18+0.18*H(seed,cx,cz,27,0x711);
      BIO.put('ar_frostroot_tuft',[ux,uy+fr*0.46,uz],qEuler(0,H(seed,cx,cz,28,0x711)*TAU,0),[fr*1.25,fr,fr*1.25],PAL.frostroot[Math.abs(cx+cz*5)%3]);
      recPlace('wildfrostroot',ux,uy,uz,uasl,'frostrim',{H:fr,frost01:inv.frost01});
     }else if(H(seed,cx,cz,11,0x711)<0.48*q&&claim('sedge',ux,uz,0.75)){
      const ss=0.52+0.40*H(seed,cx,cz,12,0x711);
      BIO.put('ar_sedge',[ux,uy,uz],qEuler(0,H(seed,cx,cz,13,0x711)*TAU,0),[ss,ss*0.75,ss],PAL.sedge[Math.abs(cx+cz)%4]);
      recPlace('alpinesedge',ux,uy,uz,uasl,'frostrim',{H:+(ss*0.75).toFixed(2)});
     }
    }

    // 4C. Jet-black obsidian-vitrophyre shard blocks & frost-shattered diapir granite tors
    if(H(seed,cx,cz,14,0x712)<0.44*q){
     const rx=bx+(H(seed,cx,cz,15,0x712)-0.5)*cs,rz=bz+(H(seed,cx,cz,16,0x712)-0.5)*cs;
     const ry=tH(rx,rz);
     if(ry>-8.0&&claim('rock',rx,rz,1.4)){
      const rs=0.65+1.45*H(seed,cx,cz,17,0x712);
      const isVit=fn.vitrophyre01>0.35||H(seed,cx,cz,18,0x712)<0.42;
      BIO.put(isVit?'ar_rock_vitrophyre':'ar_rock_granite',[rx,ry-0.2,rz],qEuler(0,H(seed,cx,cz,19,0x712)*TAU,0),[rs,rs*(isVit?0.65:0.8),rs],isVit?PAL.vitrophyre[Math.abs(cx)%3]:PAL.granite[Math.abs(cz)%3]);
      counts.boulders++;
     }
    }
   }

   reg({tagId:'arachnoids:node-tin-frostrim',name:'Frost-Riven Granite & Vitrophyre Contact Lode (tin=200, rare-earth=160)',tagClass:'resource',x:74,y:16,z:22,r:32,h:22,tags:{biome:'arachnoids',resource:'tin',secondary:'rare-earth',grade:200}});
   reg({tagId:'arachnoids:frostrim-lip-banners',name:'0.88 atm ET Frost-Polygon Rim & Updraft-Flagged Krummholz Lip',x:0,y:12,z:85,r:115,h:36,tags:{biome:'arachnoids',zone:'frostrim'}});
  }

  return counts;
 };
})();
