// ================================================================= THE CROOK — cell-seeded placement ([draw])
// Deterministic order-free placement on KRAND.hash(world, cx, cz, idx*8+ch, salt), KSPACE non-overlap, and KTAGS pre-draw
// registration. Populates CROOK.PLACED ([kind, x, y, z, elevASL, zone, extra]) for hostChecks() & Godot world export.
BIO.kit('crook');
(function(){
 const {TAU,clamp,lerp,smooth,qEuler,qUp}=BIO.fn;
 const PAL=CROOK.PAL;
 const H=(seed,cx,cz,k,salt)=>KRAND.unit(KRAND.hash(seed>>>0,(cx|0)*73856093^(cz|0)*19349663,k|0,salt|0));

 CROOK.build=function(o){
  o=o||{};
  const SKEY=o.station||'shore';
  const SITE=CROOK.SITES[SKEY]||CROOK.SITES.shore;
  const tH=o.terrainH||BIO.host.terrainH;
  const wH=o.waterH||BIO.host.waterH;
  const space=o.space||null;
  const reg=o.register||BIO.host.register||function(){};
  const q=o.quality==null?1:o.quality;
  const seed=(o.seed==null?5207:o.seed)>>>0;
  const R=o.R==null?680:o.R;
  const heroR=215;

  const counts={};
  CROOK.SPECIES.forEach(s=>{counts[s.key]=0;});
  counts.boulders=0;
  counts.impostors=0;
  CROOK.PLACED.length=0;
  const chimneyVents=[];

  const recPlace=(kind,x,y,z,asl,zone,extra)=>{
   counts[kind]=(counts[kind]==null?0:counts[kind])+1;
   CROOK.PLACED.push([kind,+x.toFixed(2),+y.toFixed(2),+z.toFixed(2),+asl.toFixed(2),zone,extra||null]);
  };

  const isDry=(x,z,margin)=>{
   const y=tH(x,z),w=wH(x,z);
   return !(w>-1e8&&y<w+(margin==null?0.18:margin));
  };
  const slopeOf=(x,z)=>{
   const e=1.5,hx=(tH(x+e,z)-tH(x-e,z))/(2*e),hz=(tH(x,z+e)-tH(x,z-e))/(2*e);
   return{slope:Math.hypot(hx,hz),nx:-hx,nz:-hz};
  };
  const claim=(kind,x,z,r)=>{
   if(!space)return true;
   const hits=space.query(x,z,r);
   for(let i=0;i<hits.length;i++){
    const it=hits[i];
    if(it)return false;
   }
   space.insert({kind:kind,x:x,z:z},x,z,r);
   return true;
  };

  // ================================================================ STATION 1: CROOKSHORE (shore)
  if(SKEY==='shore'){
   // 1A. Below +65 m Tsunami Spray-Bench: Lithistid Basalt Chimney- & Cushion-Sponges + Columnar Basalt & Boulder Chevrons
   const cs=14,nc=Math.ceil(R/cs);
   for(let cz=-nc;cz<=nc;cz++)for(let cx=-nc;cx<=nc;cx++){
    const bx=cx*cs,bz=cz*cs;
    if(bx>105||Math.hypot(bx,bz)>R*0.92)continue;
    const nTry=Math.max(1,Math.round(3*q));
    for(let k=0;k<nTry;k++){
     const x=bx+(H(seed,cx,cz,k*8+1,0x410)-0.5)*cs;
     const z=bz+(H(seed,cx,cz,k*8+2,0x410)-0.5)*cs;
     if(!isDry(x,z,0.28))continue;
     const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
     if(sl.slope>0.82)continue;
     const C=SITE.caldera,cd=Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz);
     const shelter=smooth(1.45,0.85,cd);
     const sp=CROOK_PHYS.sprayTrimAt({elevM:asl,coastDistKm:Math.max(0,(x+95)/1000),wnwExposure01:1-0.75*shelter,calderaShelter01:shelter,silicaByte:SITE.minerals.silica});
     if(!sp.basaltSpongeOk)continue;
     if(!claim('sponge',x,z,1.15))continue;

     const uKind=H(seed,cx,cz,k*8+3,0x410);
     const yaw=H(seed,cx,cz,k*8+4,0x410)*TAU;
     if(uKind<0.48){
      const hS=0.42+0.88*H(seed,cx,cz,k*8+5,0x410),rS=0.38+0.42*H(seed,cx,cz,k*8+6,0x410);
      const col=PAL.spongeChimney[(Math.abs(cx*7+cz*13+k))%PAL.spongeChimney.length];
      BIO.put('ck_chimney_tube',[x,y-0.05,z],qEuler(0,yaw,0),[rS,hS,rS],col);
      BIO.put('ck_chimney_rim',[x,y-0.06,z],qEuler(0,yaw+1.1,0),[rS*0.72,hS*0.58,rS*0.72],col);
      recPlace('basaltchimney',x,y,z,asl,'spraybench',{trim:sp.trimElevM});
      if(chimneyVents.length<28&&y>1.5&&y<42)chimneyVents.push({x:x,y:y+hS*0.92,z:z});
     }else{
      const rC=0.28+0.46*H(seed,cx,cz,k*8+5,0x410),hC=0.22+0.34*H(seed,cx,cz,k*8+6,0x410);
      const col=PAL.spongeCushion[(Math.abs(cx*11+cz*5+k))%PAL.spongeCushion.length];
      BIO.put('ck_spraycushion',[x,y-0.03,z],qEuler(0,yaw,0),[rC,hC,rC],col);
      recPlace('spraycushion',x,y,z,asl,'spraybench',{trim:sp.trimElevM});
     }
    }
    // Columnar basalt steps & 38 m boulder chevrons on < +65 m apron
    if(H(seed,cx,cz,1,0x411)<0.42*q){
     const rx=bx+(H(seed,cx,cz,2,0x411)-0.5)*cs,rz=bz+(H(seed,cx,cz,3,0x411)-0.5)*cs;
     if(isDry(rx,rz,0.1)){
      const ry=tH(rx,rz),rasl=SITE.baseElevM+ry;
      if(rasl>0.5&&rasl<62&&claim('rock',rx,rz,1.6)){
       const isCol=H(seed,cx,cz,4,0x411)<0.55;
       const rs=0.8+1.6*H(seed,cx,cz,5,0x411);
       BIO.put(isCol?'ck_rock_basalt':'ck_rock_chevron',[rx,ry-0.25,rz],qEuler(0,H(seed,cx,cz,6,0x411)*TAU,0),[rs,isCol?rs*1.35:rs*0.75,rs],PAL.basalt[Math.abs(cx+cz)%3]);
       counts.boulders++;
      }
     }
    }
   }

   // 1B. Strictly >= trimElevM (+65 m on open coast): Sitka Spruce, Redcedar, Benihi Red-Cypress, Bigleaf Maple & Tree-Fern Rainforest + Canopy Sponges
   const tcs=20,tnc=Math.ceil(R/tcs);
   for(let cz=-tnc;cz<=tnc;cz++)for(let cx=-tnc;cx<=tnc;cx++){
    const bx=cx*tcs,bz=cz*tcs;
    const dist0=Math.hypot(bx,bz);
    if(dist0>R*0.95)continue;
    const x=bx+(H(seed,cx,cz,1,0x420)-0.5)*tcs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x420)-0.5)*tcs*0.82;
    if(!isDry(x,z,0.6))continue;
    const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
    if(sl.slope>0.74)continue;
    const C=SITE.caldera,cd=Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz);
    const shelter=smooth(1.45,0.85,cd);
    const sp=CROOK_PHYS.sprayTrimAt({elevM:asl,coastDistKm:Math.max(0,(x+95)/1000),wnwExposure01:1-0.75*shelter,calderaShelter01:shelter,silicaByte:SITE.minerals.silica});
    // Strict megatsunami trimline guardrail: zero woody flora below sp.trimElevM (and >= 65 m on exposed slope)!
    if(!sp.woodyOk||asl<Math.max(sp.trimElevM,65.0))continue;
    if(!claim('tree',x,z,2.1))continue;

    const uSp=H(seed,cx,cz,3,0x420);
    const kind=uSp<0.34?'coastspruce':uSp<0.62?'westernredcedar':uSp<0.84?'redcypress':'bigleafmaple';
    const tSeed=KRAND.hash(seed,cx*131+cz,4,0x421);
    const sc=0.84+0.32*H(seed,cx,cz,5,0x420);
    if(dist0<=heroR){
     const res=CROOK.growTree(kind,x,y,z,tSeed,sc,{canopySponge:sp.canopySpongeOk?sp.fogBelt01:0,windLeanX:0.025});
     recPlace(kind,x,y,z,asl,'cloudforest',{H:res.H});
     if(res.cups>0)recPlace('canopycup',x,y+res.H*0.38,z,asl,'cloudforest',{count:res.cups});
     if(res.beards>0)recPlace('spongebeard',x,y+res.H*0.35,z,asl,'cloudforest',{count:res.beards});
    }else if(CROOK.IMP&&CROOK.IMP[kind]){
     BIO.impostorPut('ck_tree_imp',CROOK.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,6,0x420)*TAU,sc,null);
     counts.impostors++;
     recPlace(kind,x,y,z,asl,'cloudforest',{impostor:1});
    }

    // Rainforest understory around hero trees (tree-ferns, chasm rhododendron, devil's club, sword-ferns, nurse logs)
    if(dist0<=heroR+65){
     const uAng=H(seed,cx,cz,7,0x422)*TAU,uRad=4.4+4.8*H(seed,cx,cz,8,0x422);
     const ux=x+Math.cos(uAng)*uRad,uz=z+Math.sin(uAng)*uRad;
     const uy=tH(ux,uz),uasl=SITE.baseElevM+uy;
     if(isDry(ux,uz,0.4)&&uasl>=65.5&&slopeOf(ux,uz).slope<0.68){
      const uU=H(seed,cx,cz,9,0x422);
      if(uU<0.32&&claim('shrub',ux,uz,1.1)){
       CROOK.growTreeFern(ux,uy,uz,KRAND.hash(seed,cx,cz,0x423),0.85+0.3*H(seed,cx,cz,10,0x422));
       recPlace('cloudtreefern',ux,uy,uz,uasl,'cloudforest');
      }else if(uU<0.62&&claim('shrub',ux,uz,1.2)){
       CROOK.growRhodo(ux,uy,uz,KRAND.hash(seed,cx,cz,0x424),0.8+0.3*H(seed,cx,cz,10,0x422));
       recPlace('gorgerhodo',ux,uy,uz,uasl,'cloudforest');
      }else if(uU<0.88&&claim('herb',ux,uz,0.85)){
       const ps=1.3+0.8*H(seed,cx,cz,11,0x422);
       BIO.put('ck_palmate',[ux,uy,uz],qEuler(0,H(seed,cx,cz,12,0x422)*TAU,0),[ps,ps*1.1,ps],PAL.palmate[Math.abs(cx+cz)%3]);
       recPlace('devilsclub',ux,uy,uz,uasl,'cloudforest');
      }else if(claim('log',ux,uz,1.4)){
       BIO.put('ck_nurselog',[ux,uy+0.22,uz],qEuler(1.52,H(seed,cx,cz,13,0x422)*TAU,0),[1.4,5.5,1.4],0x5c4a3a);
       BIO.put('ck_mossmat',[ux,uy+0.48,uz],qEuler(0,0,0),[1.6,1.0,1.6],PAL.moss[0]);
      }
      // Floor sword-ferns & moss
      const fAng=uAng+2.2,fx=x+Math.cos(fAng)*5.2,fz=z+Math.sin(fAng)*5.2,fy=tH(fx,fz);
      if(SITE.baseElevM+fy>=65.5&&isDry(fx,fz,0.3)){
       const fs=1.1+0.7*H(seed,cx,cz,16,0x422);
       BIO.put('ck_floorfern',[fx,fy,fz],qEuler(0,H(seed,cx,cz,17,0x422)*TAU,0),[fs,fs*0.85,fs],PAL.fern[Math.abs(cx*3+cz)%4]);
       recPlace('morainesedge',fx,fy,fz,SITE.baseElevM+fy,'cloudforest');
      }
     }
    }
   }

   reg({tagId:'crook:spray-sponge-bench',name:'Lithistid Basalt Spray-Sponge Apron (< +65 m)',x:-22,z:18,y:0,r:72,h:64,tags:{biome:'crook',zone:'spraybench'}});
   reg({tagId:'crook:canopy-sponge-forest',name:'Crookshore Spongiform Sitka & Redcedar Cloud-Forest (>= +65 m)',x:135,z:45,y:65,r:88,h:95,tags:{biome:'crook',zone:'cloudforest'}});
   reg({tagId:'crook:caldera-collar',name:'Whale-Haven & Cascade-Caldera Ejecta Collar',x:SITE.caldera.x,z:SITE.caldera.z,y:-35,r:155,h:210,tags:{biome:'crook',zone:'cloudforest'}});
  }

  // ================================================================ STATION 2: CROOKWASH (wash)
  else if(SKEY==='wash'){
   // 2A. Stepped Terracotta / Ochre / Celadon Iron-Jade Rimstone Pools (D: RIM_POOLS)
   for(let i=0;i<RIM_POOLS.length;i++){
    const P=RIM_POOLS[i];
    const pal=PAL.rimstone[P.stain]||PAL.rimstone.ochre;
    const nSeg=14;
    for(let s=0;s<nSeg;s++){
     const ang=(s/nSeg)*TAU+0.12*H(seed,i,s,0x510);
     const rx=P.x+Math.cos(ang)*P.r*1.03,rz=P.z+Math.sin(ang)*P.r*1.03;
     const ry=tH(rx,rz);
     const col=pal[(i+s)%pal.length];
     BIO.put('ck_rimstone_lip',[rx,ry+0.02,rz],qEuler(0,ang,0),[1.55,1.2,1.55],col);
     if(s%2===0){
      BIO.put('ck_rimstone_shelf',[rx,P.level-0.06,rz],qEuler(0,ang+Math.PI*0.5,0),[1.15,0.85,1.15],col);
     }
     recPlace('rimstonemoss',rx,ry,rz,SITE.baseElevM+ry,'gorge',{step:i,stain:P.stain});
    }
   }

   // 2B. Gorge Conifer/Broadleaf Matrix + Shaded Skarn Biomineralizers (B) + Sunny Rain-Shadow Split
   const tcs=19,tnc=Math.ceil(R/tcs);
   for(let cz=-tnc;cz<=tnc;cz++)for(let cx=-tnc;cx<=tnc;cx++){
    const bx=cx*tcs,bz=cz*tcs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.95)continue;
    const x=bx+(H(seed,cx,cz,1,0x520)-0.5)*tcs*0.8;
    const z=bz+(H(seed,cx,cz,2,0x520)-0.5)*tcs*0.8;
    if(!isDry(x,z,0.55))continue;
    const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
    if(sl.slope>0.78)continue;

    const skarnBand=smooth(55,-35,z);
    const bm=CROOK_PHYS.biomineralAt({
     jadeByte:SITE.minerals.jade*skarnBand,skarnByte:SITE.minerals.skarn*skarnBand,
     ironByte:SITE.minerals.iron*(0.45+0.55*skarnBand),copperByte:SITE.minerals.copper*0.5,tinByte:SITE.minerals.tin,
     seepDischarge01:0.72*skarnBand,incision01:0.82,slope:Math.max(0.25,sl.slope)
    });
    const ac=CROOK_PHYS.aspectClimateAt({elevM:asl,nx:sl.nx,nz:sl.nz,rainMm:SITE.rainMm,leeShelter01:smooth(20,130,z)*0.55,gorgeMist01:0.55*(1-smooth(30,140,z))});

    // Sunny north-facing Csa/Dsb rain-shadow slope (z > 95): sparser trees, golden sedges & gossan/nephrite boulders
    const treeKeep=(ac.zoneBand==='leeslope')?0.36:0.88;
    if(H(seed,cx,cz,3,0x520)<treeKeep*q&&claim('tree',x,z,2.1)){
     const uSp=H(seed,cx,cz,4,0x520);
     let kind='redcypress';
     if(bm.rustScale01>=0.48&&uSp<0.36)kind='rustcedar';
     else if(ac.zoneBand==='leeslope')kind=uSp<0.65?'silverfir':'westernredcedar';
     else kind=uSp<0.36?'redcypress':uSp<0.66?'silverfir':uSp<0.84?'westernredcedar':'bigleafmaple';

     const tSeed=KRAND.hash(seed,cx*137+cz,5,0x521),sc=0.82+0.34*H(seed,cx,cz,6,0x520);
     if(dist0<=heroR){
      const res=CROOK.growTree(kind,x,y,z,tSeed,sc,{canopySponge:0});
      recPlace(kind,x,y,z,asl,ac.zoneBand,{rustScale:bm.rustScale01,H:res.H});
     }else if(CROOK.IMP&&CROOK.IMP[kind]){
      BIO.impostorPut('ck_tree_imp',CROOK.IMP[kind],[x,y-0.3,z],H(seed,cx,cz,7,0x520)*TAU,sc,null);
      counts.impostors++;
      recPlace(kind,x,y,z,asl,ac.zoneBand,{impostor:1});
     }
    }

    // Understory: Chasm Rhododendron, Porcelain-Margin Skarn-Ferns (B), Opalescent Horsetails, Devil's Club & Boulders
    if(dist0<=heroR+65){
     const uAng=H(seed,cx,cz,8,0x522)*TAU,uRad=4.2+4.8*H(seed,cx,cz,9,0x522);
     const ux=x+Math.cos(uAng)*uRad,uz=z+Math.sin(uAng)*uRad;
     if(isDry(ux,uz,0.35)&&slopeOf(ux,uz).slope<0.74){
      const uy=tH(ux,uz),uasl=SITE.baseElevM+uy;
      if(bm.silicaGlaze01>=0.42&&H(seed,cx,cz,10,0x522)<0.78&&claim('skarnfern',ux,uz,0.85)){
       // Porcelain-margin jade-fern rosette (5 arching fronds with opalescent jade-white margins)
       for(let f=0;f<5;f++){
        const fa=(f/5)*TAU+0.25*H(seed,cx,cz,20+f,0x522),fl=0.85+0.55*H(seed,cx,cz,26+f,0x522);
        BIO.put('ck_skarnfern',[ux,uy+0.04,uz],qEuler(0,fa,-0.24),[fl,fl*0.85,fl*0.85],PAL.skarnFern[f%3],{c2:0xdcf2e6});
       }
       recPlace('skarnfern',ux,uy,uz,uasl,'gorge',{silicaGlaze:bm.silicaGlaze01});
      }else if(ac.zoneBand!=='leeslope'&&H(seed,cx,cz,11,0x522)<0.52&&claim('rhodo',ux,uz,1.15)){
       CROOK.growRhodo(ux,uy,uz,KRAND.hash(seed,cx,cz,0x523),0.85+0.3*H(seed,cx,cz,12,0x522));
       recPlace('gorgerhodo',ux,uy,uz,uasl,'gorge');
      }else if(ac.zoneBand==='leeslope'&&claim('sedge',ux,uz,0.75)){
       const ss=0.9+0.6*H(seed,cx,cz,13,0x522);
       BIO.put('ck_sedge',[ux,uy,uz],qEuler(0,H(seed,cx,cz,14,0x522)*TAU,0),[ss,ss*0.85,ss],PAL.sedge[Math.abs(cx+cz)%4]);
       recPlace('morainesedge',ux,uy,uz,uasl,'leeslope');
      }else if(claim('fern',ux,uz,0.75)){
       const fs=1.0+0.65*H(seed,cx,cz,13,0x522);
       BIO.put('ck_floorfern',[ux,uy,uz],qEuler(0,H(seed,cx,cz,14,0x522)*TAU,0),[fs,fs*0.85,fs],PAL.fern[Math.abs(cx+cz)%4]);
       recPlace('morainesedge',ux,uy,uz,uasl,'gorge');
      }
     }
     // Nephrite-jade float boulders & banded gneiss / gossan blocks
     if(H(seed,cx,cz,15,0x524)<0.35*q){
      const rx=bx+(H(seed,cx,cz,16,0x524)-0.5)*tcs,rz=bz+(H(seed,cx,cz,17,0x524)-0.5)*tcs;
      if(isDry(rx,rz,0.05)&&claim('rock',rx,rz,1.5)){
       const ry=tH(rx,rz),rs=0.75+1.35*H(seed,cx,cz,18,0x524);
       const rk=bm.silicaGlaze01>=0.45?'ck_rock_nephrite':ac.zoneBand==='leeslope'?'ck_rock_gossan':'ck_rock_gneiss';
       const rc=rk==='ck_rock_nephrite'?PAL.nephrite[0]:rk==='ck_rock_gossan'?PAL.gossanRock[0]:PAL.gneiss[0];
       BIO.put(rk,[rx,ry-0.2,rz],qEuler(0,H(seed,cx,cz,19,0x524)*TAU,0),[rs,rs*0.72,rs],rc);
       counts.boulders++;
      }
     }
    }
   }

   // 2C. Wind-Tuned Chambered Canyon Bamboo & Opalescent Horsetail Brakes along windy chasm rims (E: 33b-core-bamboo.js)
   const bcs=22,bnc=Math.ceil(260/bcs),B=BIO.bamboo;
   for(let cz=-bnc;cz<=bnc;cz++)for(let cx=-bnc;cx<=bnc;cx++){
    const x=cx*bcs+(H(seed,cx,cz,1,0x530)-0.5)*14;
    const z=cz*bcs+(H(seed,cx,cz,2,0x530)-0.5)*14;
    const azAbs=Math.abs(z);
    if(azAbs<52||azAbs>178||Math.hypot(x,z)>255||!isDry(x,z,0.6))continue;
    const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
    if(sl.slope>0.62)continue;
    if(H(seed,cx,cz,3,0x530)<0.56*q&&claim('bamboo',x,z,3.2)){
     const clSeed=KRAND.hash(seed,cx*97+cz,4,0x531);
     const canes=B.clump({seed:clSeed,at:[x,y-0.08,z],n:[5,8],r:0.65,H:9.5,hs:[0.68,1.15],d:0.11});
     for(let ci=0;ci<canes.length;ci++){
      const c=canes[ci],holed=(ci%2===0);
      const col=PAL.bamboo[(ci+Math.abs(cx+cz))%PAL.bamboo.length];
      B.put(holed?'ck_bamboo_holed':'ck_bamboo_plain',[c],col);
      // Crown leaf sprays
      for(let sk=0;sk<3;sk++){
       const sy=c.p[1]+c.h*(0.58+0.16*sk),saz=c.az+sk*2.1;
       BIO.put('ck_bamboo_leaf'+(sk%3),[c.p[0],sy,c.p[2]],qEuler(0,saz,0),[2.4,2.4,2.4],col);
      }
     }
     BIO.put('ck_bamboo_shoot',[x+0.45,y-0.04,z-0.35],qEuler(0,0,0),[0.22,0.85,0.22],0x8a7848);
     recPlace('chamberbamboo',x,y,z,asl,'gorge',{canes:canes.length});
    }else if(azAbs<95&&H(seed,cx,cz,5,0x530)<0.52*q&&claim('equisetum',x,z,1.3)){
     for(let ek=0;ek<5;ek++){
      const ox=(H(seed,cx,cz,10+ek,0x532)-0.5)*0.9,oz=(H(seed,cx,cz,16+ek,0x532)-0.5)*0.9;
      const eh=1.1+1.0*H(seed,cx,cz,22+ek,0x532),ey=tH(x+ox,z+oz);
      const ecol=PAL.horsetail[(ek+Math.abs(cx))%PAL.horsetail.length];
      BIO.put('ck_equisetum_stem',[x+ox,ey-0.05,z+oz],qEuler(0.06*(ek-2),ek*1.2,0),[0.045,eh,0.045],ecol);
      BIO.put('ck_equisetum_whorl',[x+ox,ey+eh*0.68,z+oz],qEuler(0,ek*1.7,0),[0.48,0.55,0.48],ecol);
     }
     recPlace('jadeequisetum',x,y,z,asl,'gorge');
    }
   }

   reg({tagId:'crook:rimstone-terraces',name:'Iron & Jade Rimstone Seep Terraces (16 Monotone Steps)',x:-90,z:-85,y:12,r:68,h:28,tags:{biome:'crook',zone:'gorge'}});
   reg({tagId:'crook:skarn-biomineral-wall',name:'Skarn-Nephrite Porcelain-Fern & Rust-Cedar Wall',x:-20,z:-58,y:8,r:82,h:75,tags:{biome:'crook',zone:'gorge'}});
   reg({tagId:'crook:chambered-bamboo-rim',name:'Wind-Tuned Chambered Canyon Bamboo Brake',x:35,z:-98,y:35,r:75,h:85,tags:{biome:'crook',zone:'gorge'}});
  }

  // ================================================================ STATION 3: CROOKHEAD (head)
  else{
   // 3A. 48 Colonial Thermogenic "+15 degC" Hearth-Ring Rosettes & Malachite-Teal Cryo-Snow Algae Wells (D)
   const W=SITE.meltWells||[];
   for(let i=0;i<W.length;i++){
    const mw=W[i],wy=tH(mw.x,mw.z),wasl=SITE.baseElevM+wy;
    // Clonal ring of fleshy burgundy-bronze & jade bracts at the bottom of the melted 1.2..2.0 m snow-well
    const nBr=6;
    for(let b=0;b<nBr;b++){
     const ang=(b/nBr)*TAU+0.15*H(seed,i,b,0x610);
     const rr=mw.r*0.42;
     const bx=mw.x+Math.cos(ang)*rr,bz=mw.z+Math.sin(ang)*rr,by=tH(bx,bz);
     const bs=0.46+0.24*H(seed,i,10+b,0x610);
     BIO.put('ck_hearth_bract',[bx,by+0.02,bz],qEuler(0,ang,0),[bs,bs*0.72,bs],PAL.hearthBract[(i+b)%PAL.hearthBract.length]);
    }
    // Central warm +15 degC starch-burning spadix cones
    const spH=0.38+0.26*H(seed,i,20,0x610);
    BIO.put('ck_hearth_spadix',[mw.x,wy+0.02,mw.z],qEuler(0,i*1.1,0),[0.18,spH,0.18],PAL.hearthSpadix[i%PAL.hearthSpadix.length]);
    recPlace('hearthring',mw.x,wy,mw.z,wasl,'tarn',{coreTempC:mw.coreTempC,wellDiamM:mw.diamM});

    // Ring of malachite-teal & rust-ochre cryo-snow algae along the snow-well's bevelled rim collar
    const nAlg=5;
    for(let a=0;a<nAlg;a++){
     const ang=(a/nAlg)*TAU+0.4*H(seed,i,30+a,0x610);
     const ar=mw.r*(1.28+0.32*H(seed,i,40+a,0x610));
     const ax=mw.x+Math.cos(ang)*ar,az=mw.z+Math.sin(ang)*ar,ay=tH(ax,az);
     const asz=0.45+0.35*H(seed,i,50+a,0x610);
     BIO.put('ck_cryoalgae',[ax,ay+0.015,az],qEuler(0,ang,0),[asz,1.0,asz],PAL.cryoAlgae[(i+a)%PAL.cryoAlgae.length]);
    }
    recPlace('cryosnow',mw.x+mw.r*1.35,tH(mw.x+mw.r*1.35,mw.z),mw.z,wasl,'tarn');
   }

   // 3B. Subalpine Krummholz Larch, Malachite Cushion-Heaths (B), Frost-Glass Sedges (B) & Moraine Boulders
   const acs=16,anc=Math.ceil(R/acs);
   for(let cz=-anc;cz<=anc;cz++)for(let cx=-anc;cx<=anc;cx++){
    const bx=cx*acs,bz=cz*acs,dist0=Math.hypot(bx,bz);
    if(dist0>R*0.92)continue;
    const x=bx+(H(seed,cx,cz,1,0x620)-0.5)*acs*0.82;
    const z=bz+(H(seed,cx,cz,2,0x620)-0.5)*acs*0.82;
    if(!isDry(x,z,0.35))continue;
    const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
    if(sl.slope>0.76)continue;

    // Subalpine krummholz larch stands near the moraine tarn shore (x < 35, y < 34)
    if(x<38&&y<34&&H(seed,cx,cz,3,0x620)<0.46*q&&claim('larch',x,z,3.4)){
     const tSeed=KRAND.hash(seed,cx*149+cz,4,0x621),sc=0.75+0.4*H(seed,cx,cz,5,0x620);
     if(dist0<=heroR){
      const res=CROOK.growTree('furlarch',x,y,z,tSeed,sc,{windLeanX:0.065});
      recPlace('furlarch',x,y,z,asl,'tarn',{H:res.H});
     }else if(CROOK.IMP&&CROOK.IMP.furlarch){
      BIO.impostorPut('ck_tree_imp',CROOK.IMP.furlarch,[x,y-0.25,z],H(seed,cx,cz,6,0x620)*TAU,sc,null);
      counts.impostors++;
      recPlace('furlarch',x,y,z,asl,'tarn',{impostor:1});
     }
    }

    // Malachite-teal & rust-ochre mineral-rind cushion-heaths + spun frost-glass silica sedges + tarn cottongrass
    if(dist0<=heroR+85){
     const ux=x+(H(seed,cx,cz,7,0x622)-0.5)*11,uz=z+(H(seed,cx,cz,8,0x622)-0.5)*11;
     if(isDry(ux,uz,0.22)&&slopeOf(ux,uz).slope<0.68){
      const uy=tH(ux,uz),uasl=SITE.baseElevM+uy;
      const uM=H(seed,cx,cz,9,0x622);
      const T=SITE.tarn,td=Math.hypot((ux-T.x)/T.rx,(uz-T.z)/T.rz);
      if(td<1.26&&uM<0.55&&claim('cotton',ux,uz,0.85)){
       const cs2=0.65+0.45*H(seed,cx,cz,10,0x622);
       BIO.put('ck_cotton',[ux,uy,uz],qEuler(0,H(seed,cx,cz,11,0x622)*TAU,0),[cs2,cs2*0.95,cs2],PAL.cotton[Math.abs(cx+cz)%3]);
       recPlace('morainesedge',ux,uy,uz,uasl,'tarn');
      }else if(uM<0.44&&claim('cushion',ux,uz,1.05)){
       const cr=0.38+0.62*H(seed,cx,cz,10,0x622),ch=0.26+0.36*H(seed,cx,cz,11,0x622);
       const ccol=PAL.malachiteCushion[(Math.abs(cx*5+cz*9))%PAL.malachiteCushion.length];
       BIO.put('ck_malachite_dome',[ux,uy-0.03,uz],qEuler(0,H(seed,cx,cz,12,0x622)*TAU,0),[cr,ch,cr],ccol);
       recPlace('malachitecushion',ux,uy,uz,uasl,'tarn');
       // Ring cushion with spun frost-glass silica sedge
       const fs=0.52+0.38*H(seed,cx,cz,13,0x622);
       BIO.put('ck_frostsedge',[ux+cr*0.92,tH(ux+cr*0.92,uz),uz],qEuler(0,cx*1.3,0),[fs,fs*0.9,fs],PAL.frostSedge[Math.abs(cx)%4],{c2:0xeef8fc});
       recPlace('frostsedge',ux+cr*0.92,uy,uz,uasl,'tarn');
      }else if(uM<0.78&&claim('frostsedge',ux,uz,0.8)){
       const fs=0.55+0.42*H(seed,cx,cz,14,0x622);
       BIO.put('ck_frostsedge',[ux,uy,uz],qEuler(0,H(seed,cx,cz,15,0x622)*TAU,0),[fs,fs*0.92,fs],PAL.frostSedge[Math.abs(cx+cz)%4],{c2:0xeef8fc});
       recPlace('frostsedge',ux,uy,uz,uasl,'tarn');
      }
     }
     // Granite tors & malachite moraine boulders
     if(H(seed,cx,cz,16,0x623)<0.34*q){
      const rx=bx+(H(seed,cx,cz,17,0x623)-0.5)*acs,rz=bz+(H(seed,cx,cz,18,0x623)-0.5)*acs;
      if(isDry(rx,rz,0.15)&&claim('rock',rx,rz,1.6)){
       const ry=tH(rx,rz),rs=0.75+1.55*H(seed,cx,cz,19,0x623);
       const isMal=H(seed,cx,cz,20,0x623)<0.28;
       BIO.put(isMal?'ck_rock_malachite':'ck_rock_granite',[rx,ry-0.22,rz],qEuler(0,H(seed,cx,cz,21,0x623)*TAU,0),[rs,rs*0.76,rs],isMal?PAL.malachiteRock[0]:PAL.granite[Math.abs(cx)%3]);
       counts.boulders++;
      }
     }
    }
   }

   // 3C. Bone-White Wind-Fluted Alpine Seed-Chimneys (E) spanning BOTH West (singing) & East (Great Hush silent!) sides of Silent Vales Pass
   const pcs=13;
   for(let cz=-12;cz<=8;cz++)for(let cx=6;cx<=25;cx++){
    const x=cx*pcs+(H(seed,cx,cz,1,0x630)-0.5)*9;
    const z=cz*pcs+(H(seed,cx,cz,2,0x630)-0.5)*9;
    if(Math.abs(z-SITE.hushPass.colZ)>115||!isDry(x,z,0.4))continue;
    const y=tH(x,z),asl=SITE.baseElevM+y,sl=slopeOf(x,z);
    if(sl.slope>0.64)continue;
    if(H(seed,cx,cz,3,0x630)<0.68*q&&claim('chimney',x,z,1.35)){
     const hush=CROOK_PHYS.hushAt({x:x,z:z,passLineX:SITE.hushPass.lineX,passNormalXZ:SITE.hushPass.normalXZ,bandWidthM:SITE.hushPass.bandWidthM});
     const aero=CROOK_PHYS.aeroResonanceAt({culmDiaM:0.034,chamberLenM:0.29,apertureDiaM:0.012,pAtm:0.92,windSpeedMs:8.5,hushSuppression01:hush.suppression01});
     const nSt=2+(Math.abs(cx+cz)%3);
     for(let s=0;s<nSt;s++){
      const ox=(H(seed,cx,cz,10+s,0x630)-0.5)*0.65,oz=(H(seed,cx,cz,14+s,0x630)-0.5)*0.65;
      const sy=tH(x+ox,z+oz),sh=1.35+1.35*H(seed,cx,cz,18+s,0x630);
      const sd=0.055+0.025*H(seed,cx,cz,22+s,0x630);
      const col=PAL.seedChimney[(s+Math.abs(cx))%PAL.seedChimney.length];
      BIO.put('ck_chimney_stalk'+(s%2),[x+ox,sy-0.05,z+oz],qEuler(0.05*(s-1),H(seed,cx,cz,26+s,0x630)*TAU,0),[sd,sh,sd],col);
      BIO.put('ck_chimney_umbel',[x+ox,sy+sh*0.96,z+oz],qEuler(0,s*1.4,0),[0.16,0.14,0.16],col);
     }
     recPlace('seedchimney',x,y,z,asl,'fellpass',{hush:hush.suppression01,audible:aero.audible01,f0Hz:aero.f0Hz});
    }
   }

   reg({tagId:'crook:hearth-ring-snowfield',name:'Thermogenic +15 degC Hearth-Ring Snow-Melt Wells & Teal Cryo-Snow',x:52,z:58,y:-2,r:95,h:48,tags:{biome:'crook',zone:'tarn'}});
   reg({tagId:'crook:malachite-moraine',name:'Malachite Cushion-Heath & Frost-Glass Sedge Moraine',x:-45,z:25,y:-6,r:82,h:45,tags:{biome:'crook',zone:'tarn'}});
   reg({tagId:'crook:hush-threshold-groves',name:'Silent Vales Great Hush Fluted Seed-Chimney Pass',x:195,z:-35,y:25,r:95,h:75,tags:{biome:'crook',zone:'fellpass'}});
  }

  CROOK.chimneyVents=chimneyVents;
  return counts;
 };
})();
