/* ================================================================= THE DOME — deterministic KRAND.cell placement for all 24 native species ([G data])
   Places all 24 native species (19 Earth bornhardt/fen/cleft/crown guilds + 5 KFRONTIER Carnelian clades) + KTAGS resource records
   deterministically by cell hash (KRAND.hash), strictly obeying:
     1. Zero organisms with height > 4.0 m on unfractured bare exfoliation interiors (shellStep01 < 0.55 && !inPan && !moatCollar)
     2. Concentric contour-line treeline garlands (cloudgarlandpine) strictly along shellStep01 >= 0.70 risers (Stations 1, 3, 4, 5)
     3. 55% Red Sky-Island Inversion: all 5 Carnelian clades on Station 5 (eastflank) upslope of the Kill-Line & active solar ecof_mist_pylon
        (with bleachfireweed along the downslope vanguard), plus low agate_window (0.2-0.9 m), erythra_veil (<= 3.0 m) & crevice blood_strangler
        on Station 3 (crown) and sun-exposed dry exfoliation margins of apron & cleft via KFRONTIER.quiltAt
     4. Perched gnamma sky-mirror rings (gnammamoss, gnammaquillwort, pansundew, panbonsai), moat Ria-amber larch / paper-birch / red-cedar
        galleries, and shaded Kluft cleft / A-tent myco-heterotrophs (cleftfilmyfern, cleftghostpipe, cleftrowan)
   Strictly [G data]: zero THREE, zero DOM, zero Math.random, zero Math.sin/cos hashes, zero numeric || defaults.
*/
(function(){
 const {TAU,clamp,lerp,smooth,qEuler}=BIO.fn;
 const H=(seed,a,b,salt)=>KRAND.unit(KRAND.hash(seed>>>0,a|0,b|0,salt|0));

 THEDOME.placeAll=function(opt){
  opt=opt||{};
  const q=opt.quality==null?1:opt.quality;
  const seed=SITE.seed>>>0;
  const C=THEDOME.C,PAL=THEDOME.PAL;
  const counts={
   gnammamoss:0,panbonsai:0,cloudgarlandpine:0,crownrosette:0,
   moatpitcher:0,cleftfilmyfern:0,ringlichen:0,moatcedar:0,
   carnelian_organpipe:0,erythra_veil:0,bladder_tether:0,agate_window:0,blood_strangler:0,
   weepingamberlarch:0,moatpaperbirch:0,cleftrowan:0,summitdwarfjuniper:0,cloudrhododendron:0,
   gnammaquillwort:0,pansundew:0,cleftghostpipe:0,crownpasque:0,staghornclubmoss:0,bleachfireweed:0,
   spall:0,carnelianSkyIsland:0,bleachSkeletons:0
  };
  THEDOME.PLACED.length=0;
  THEDOME.TREE_RECS.length=0;

  const pushPlaced=(key,x,y,z,sz,zone,meta)=>{
   if(THEDOME.PLACED.length<4500)THEDOME.PLACED.push([key,x,y,z,sz,zone,meta||null]);
  };

  const G=(typeof DRAWN_H==='function')?DRAWN_H:BIO.host.terrainH;
  const clearSpace=(x,z,r)=>!SPACE.some(x,z,r+2.5,o=>o.kind==='reserve'||o.kind==='sheetwash-rill'||o.kind==='gnamma-water'||o.kind==='ecof_mist_pylon');
  const inReserve=(x,z,pad)=>{
   if(!SITE.reserves)return false;
   for(let i=0;i<SITE.reserves.length;i++){
    const R0=SITE.reserves[i];
    if(Math.hypot(x-R0.x,z-R0.z)<R0.r+(pad==null?4:pad))return true;
   }
   return false;
  };
  const inATent=(x,z,pad)=>{
   if(!SITE.aTents)return false;
   for(let i=0;i<SITE.aTents.length;i++){
    const A=SITE.aTents[i];
    if(Math.hypot(x-A.x,z-A.z)<A.spanM*0.62+(pad==null?2:pad))return true;
   }
   return false;
  };

  /* 1. Gnamma solution-pan sky-mirror gardens: gnammamoss, gnammaquillwort, pansundew & island panbonsai (Stations 1, 3 & 5) */
  if(SITE.gnammas&&SITE.gnammas.length){
   for(let pi=0;pi<SITE.gnammas.length;pi++){
    const P=SITE.gnammas[pi];
    const nRim=Math.max(8,Math.round(P.r*3.0*q));
    for(let k=0;k<nRim;k++){
     const ang=(k/nRim)*TAU+0.18*H(seed,pi,k,0x101);
     const rrM=P.r*(0.92+0.24*H(seed,pi,k,0x102));
     const mx=P.x+Math.cos(ang)*rrM,mz=P.z+Math.sin(ang)*rrM;
     if(inReserve(mx,mz,2)||inFlowChannel(mx,mz,2.5))continue;
     const my=G(mx,mz);
     const sc=0.55+0.62*H(seed,pi,k,0x103);
     const mCol=C(PAL.mossWet[k%PAL.mossWet.length]);
     BIO.put('td_gnammamoss',[mx,my+0.02,mz],qEuler(0,ang,0),[sc,1,sc],mCol);
     counts.gnammamoss++;

     /* Amphibious gnammaquillwort needle ring inside vernal pan rim */
     if(k%3===0){
      const qr=P.r*(0.76+0.12*H(seed,pi,k,0x104));
      const qx=P.x+Math.cos(ang+0.08)*qr,qz=P.z+Math.sin(ang+0.08)*qr;
      const qy=G(qx,qz),qSc=0.22+0.16*H(seed,pi,k,0x105);
      BIO.put('td_quillwort',[qx,qy-0.02,qz],qEuler(0,ang*1.3,0),[qSc,qSc*1.15,qSc],C(PAL.quillwort[k%PAL.quillwort.length]));
      counts.gnammaquillwort++;
      if(counts.gnammaquillwort<=160)pushPlaced('gnammaquillwort',qx,qy,qz,qSc,'gnammapan',{panId:P.id});
     }

     /* Carnivorous pansundew ruby rosettes glistening on wet feldspar-grus pan rims */
     if(k%5===1){
      const sr=P.r*(0.98+0.10*H(seed,pi,k,0x106));
      const sx=P.x+Math.cos(ang-0.09)*sr,sz=P.z+Math.sin(ang-0.09)*sr;
      const sy=G(sx,sz),sSc=0.18+0.12*H(seed,pi,k,0x107);
      BIO.put('td_sundew',[sx,sy-0.02,sz],qEuler(0,ang*2.1,0),[sSc*1.2,sSc,sSc*1.2],C(PAL.sundew[k%PAL.sundew.length]));
      counts.pansundew++;
      if(counts.pansundew<=140)pushPlaced('pansundew',sx,sy,sz,sSc,'gnammapan',{panId:P.id});
     }

     if(k%4===0){
      const sx=P.x+Math.cos(ang+0.12)*(P.r*1.14),sz=P.z+Math.sin(ang+0.12)*(P.r*1.14);
      const sy=G(sx,sz);
      BIO.put('td_sedge',[sx,sy-0.03,sz],qEuler(0,ang*1.7,0),[0.46,0.50,0.46],C(PAL.sedge[k%PAL.sedge.length]));
     }
    }
    pushPlaced('gnammamoss',P.x,P.sillY,P.z,P.r,'gnammapan',{panId:P.id});

    /* Ancient twisted panbonsai on central gnamma granite islands */
    if(P.islandR>0.35&&SKEY!=='crown'){
     const bx=P.x+P.islandDx,bz=P.z+P.islandDz,by=G(bx,bz);
     const bSeed=KRAND.hash(seed,pi,77,0x110);
     const g=THEDOME.growTree('panbonsai',bx,by,bz,bSeed,0.88+0.28*H(seed,pi,1,0x111),{});
     counts.panbonsai++;
     pushPlaced('panbonsai',bx,by,bz,g.H,'gnammapan',{panId:P.id,island:true});
     THEDOME.TREE_RECS.push({key:'panbonsai',x:bx,y:by,z:bz,H:g.H,shellStep01:1.0,inPan:true});
     REGISTER({
      tagId:'thedome:bonsai-'+P.id,name:'Gnamma-Island Twisted Bonsai Pine ('+P.id+')',tagClass:'flora',
      x:bx,y:by,z:bz,r:Math.max(2.2,P.islandR+1.2),h:g.H+0.8,
      tags:{biome:'thedome',species:'panbonsai',zone:'gnammapan'}
     });
    }
    if(pi<36){
     REGISTER({
      tagId:'thedome:'+P.id,name:'Gnamma Solution-Pan Sky-Mirror ('+P.id+')',tagClass:'feature',ground:true,
      x:P.x,y:P.sillY-P.depth,z:P.z,r:P.r+1.2,h:P.depth+1.2,
      tags:{biome:'thedome',gnamma:true,radiusM:P.r,depthM:P.depth}
     });
    }
   }
  }

  /* 2. Concentric Contour-Riser Garlands, Sheltered Riser Conifers/Birches & Fracture Krummholz Shrubs */
  {
   const cell=SKEY==='crown'?13.5:18.0;
   const R=540,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x201);
    if(KRAND.unit(h)>0.72*q)continue;
    const x=(i+0.15+0.70*H(h,1,0,1))*cell,z=(j+0.15+0.70*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R)continue;
    if(inReserve(x,z,8)||inATent(x,z,6)||inFlowChannel(x,z,5.5))continue;
    if(SKEY==='cleft'&&Math.abs(z)<22)continue;
    if(SKEY==='moat'&&z<SITE.apronToeZ+16)continue;
    if(SKEY==='eastflank'){
     if(SITE.mistPylon&&Math.hypot(x-SITE.mistPylon.x,z-SITE.mistPylon.z)<16.0)continue;
     const ef=DOME_PHYS.eastFlankFrontierAt(x,z,G(x,z),SITE);
     if(ef.biosphere!=='earth')continue;
    }

    const sh=DOME_PHYS.shellAt(x,z,SITE);
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan||sh.hollowGapM>0.05)continue;

    /* Strict Garland Rule: full-stature > 4 m trees ONLY along shellStep01 >= 0.72 contour risers! */
    if(sh.shellStep01>=0.72){
     if(!clearSpace(x,z,3.0))continue;
     const y=G(x,z);
     const dCam=BIO.lodD(x,z);
     const rollT=H(h,9,0,9);

     /* Sheltered Kluft lower-lip risers host golden weepingamberlarch alongside cloudgarlandpine */
     if(SKEY==='cleft'&&Math.abs(z)<98&&dCam<300&&rollT<0.26){
      const g=THEDOME.growTree('weepingamberlarch',x,y,z,h,0.82+0.24*H(h,3,0,3),{misty:true});
      SPACE.insert({kind:'tree',id:'al-'+i+'-'+j},x,z,2.8);
      counts.weepingamberlarch++;
      THEDOME.TREE_RECS.push({key:'weepingamberlarch',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('weepingamberlarch',x,y,z,g.H,'garland',{shellStep01:sh.shellStep01});
      continue;
     }

     /* East-flank downslope Earth risers host pioneer moatpaperbirch alongside cloudgarlandpine */
     if(SKEY==='eastflank'&&dCam<300&&rollT<0.32){
      const g=THEDOME.growTree('moatpaperbirch',x,y,z,h,0.80+0.26*H(h,3,0,3),{});
      SPACE.insert({kind:'tree',id:'pb-'+i+'-'+j},x,z,2.6);
      counts.moatpaperbirch++;
      THEDOME.TREE_RECS.push({key:'moatpaperbirch',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('moatpaperbirch',x,y,z,g.H,'apron_bench',{shellStep01:sh.shellStep01});
      continue;
     }

     const sc=SKEY==='crown'?(0.72+0.28*H(h,3,0,3)):(0.84+0.32*H(h,3,0,3));
     if(dCam<360){
      const prevR=BIO.range,prevM=BIO.minRange;
      BIO.range=420;BIO.minRange=0;
      const g=THEDOME.growTree('cloudgarlandpine',x,y,z,h,sc,{misty:SKEY==='crown'});
      if(BIO.defs['td_imp_cloudgarlandpine']){
       BIO.range=2200;BIO.minRange=420;
       BIO.put('td_imp_cloudgarlandpine',[x,y,z],qEuler(0,H(h,4,0,4)*TAU,0),[g.H*0.58,g.H,g.H*0.58],C(0xffffff));
      }
      BIO.range=prevR;BIO.minRange=prevM;
      THEDOME.TREE_RECS.push({key:'cloudgarlandpine',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('cloudgarlandpine',x,y,z,g.H,'garland',{shellStep01:sh.shellStep01});
     }else if(BIO.defs['td_imp_cloudgarlandpine']){
      const estH=lerp(5.5,11.0,H(h,1,0,0x301))*sc;
      BIO.put('td_imp_cloudgarlandpine',[x,y,z],qEuler(0,H(h,4,0,4)*TAU,0),[estH*0.58,estH,estH*0.58],C(0xffffff));
      THEDOME.TREE_RECS.push({key:'cloudgarlandpine',x:x,y:y,z:z,H:estH,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('cloudgarlandpine',x,y,z,estH,'garland',{shellStep01:sh.shellStep01,impostor:true});
     }
     SPACE.insert({kind:'tree',id:'gp-'+i+'-'+j},x,z,2.8);
     counts.cloudgarlandpine++;
    }else if(sh.shellStep01>=0.38&&BIO.lodD(x,z)<320){
     /* Dwarf <= 3.7 m shrubs & bonsai clasping intermediate exfoliation cracks (strictly < 4.0 m!) */
     const y=G(x,z),pickS=H(h,5,0,5);
     if(SKEY==='cleft'&&Math.abs(z)<96&&pickS<0.38){
      const g=THEDOME.growTree('cleftrowan',x,y,z,h,0.78+0.20*H(h,6,0,6),{});
      counts.cleftrowan++;
      THEDOME.TREE_RECS.push({key:'cleftrowan',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('cleftrowan',x,y,z,g.H,'kluft_cleft',{shellStep01:sh.shellStep01});
     }else if((SKEY==='crown'||SKEY==='cleft'||SKEY==='apron')&&pickS>=0.38&&pickS<0.58){
      const g=THEDOME.growTree('summitdwarfjuniper',x,y,z,h,0.78+0.22*H(h,6,0,6),{});
      counts.summitdwarfjuniper++;
      THEDOME.TREE_RECS.push({key:'summitdwarfjuniper',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('summitdwarfjuniper',x,y,z,g.H,'crown',{shellStep01:sh.shellStep01});
     }else if((SKEY==='crown'||SKEY==='cleft')&&pickS>=0.58&&pickS<0.78){
      const g=THEDOME.growRhododendron(x,y,z,h,0.76+0.24*H(h,6,0,6));
      counts.cloudrhododendron++;
      pushPlaced('cloudrhododendron',x,y,z,g.H,'crown',{shellStep01:sh.shellStep01});
     }else if(SKEY!=='crown'&&pickS>=0.78&&pickS<0.94){
      const g=THEDOME.growTree('panbonsai',x,y,z,h,0.75+0.24*H(h,6,0,6),{});
      counts.panbonsai++;
      THEDOME.TREE_RECS.push({key:'panbonsai',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
      pushPlaced('panbonsai',x,y,z,g.H,'apron_bench',{shellStep01:sh.shellStep01});
     }
    }
   }
  }

  /* 2b. Station 5 (eastflank): All 5 Carnelian Clades upslope of Perimeter Kill-Line + Bleach skeletons + Vanguard bleachfireweed! */
  if(SKEY==='eastflank'&&typeof KFRONTIER!=='undefined'){
   const kfCfg={bucket:'td_chitin',skelBucket:'td_skel',prefix:'td_kf',sunAzimuthRad:-0.58};
   const cell=13.5,R=360,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x277);
    const x=(i+0.15+0.70*H(h,1,0,1))*cell,z=(j+0.15+0.70*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R||!clearSpace(x,z,2.6)||inATent(x,z,4))continue;
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan)continue;
    const sh=DOME_PHYS.shellAt(x,z,SITE);
    if(sh.hollowGapM>0.05)continue;
    const y=G(x,z);
    const ef=DOME_PHYS.eastFlankFrontierAt(x,z,y,SITE);

    /* Downslope vanguard edge below Kill-Line: magenta bleachfireweed colonizing neutralized soil */
    if(ef.biosphere==='earth'&&ef.vanguard01>0.18&&H(h,2,0,2)<0.74*q){
     const fwSc=0.58+0.48*H(h,3,0,3);
     BIO.put('td_fireweed',[x,y-0.03,z],qEuler(0,H(h,4,0,4)*TAU,0),[fwSc*0.75,fwSc,fwSc*0.75],C(PAL.fireweed[i&1]));
     counts.bleachfireweed++;
     pushPlaced('bleachfireweed',x,y,z,fwSc,'apron_bench',{band:'vanguard'});
     continue;
    }

    /* Upslope Kill-Line seam: reactive arterial-red blood_strangler chitin-web */
    if(ef.strangler01>0.30&&ef.signedDistM>-6.0&&H(h,2,0,2)<0.72*q){
     const stSc=0.65+0.45*H(h,3,0,3);
     KFRONTIER.putBloodStrangler(BIO,'td_kf',x,y,z,h,stSc);
     counts.blood_strangler++;
     counts.carnelianSkyIsland++;
     pushPlaced('blood_strangler',x,y,z,stSc*1.8,'carnelian_sky_island',{biosphere:'carnelian'});
     continue;
    }

    /* Bone-white Bleach-Hardpan core: petrified chitin-silica organ-pipe skeletons (shellStep01 safe <= 3.8 m on bare shell) */
    if(ef.biosphere==='bleach'){
     if(ef.skeletonProb01>0.26&&H(h,4,0,4)<0.38*q){
      const skSc=sh.shellStep01>=0.55?(0.68+0.30*H(h,5,0,5)):(0.32+0.14*H(h,5,0,5));
      KFRONTIER.growOrganPipe(BIO,kfCfg,x,y,z,h,skSc,{petrified:true});
      counts.bleachSkeletons++;
     }
     continue;
    }

    /* Upslope 1.19 atm Carnelian Sky-Island: all 5 Carnelian clades (strictly h <= 4.0 m where shellStep01 < 0.55!) */
    if(ef.biosphere==='carnelian'){
     if(H(h,6,0,6)>0.72*q)continue;
     const roll=H(h,8,0,8);
     if(roll<0.28){
      /* Tall 4.5-9.8 m chimneys on shellStep01 >= 0.55 fracture risers; compact <= 3.5 m chimneys on bare slabs */
      const opSc=sh.shellStep01>=0.55?(0.76+0.26*H(h,7,0,7)):(0.24+0.08*H(h,7,0,7));
      const g=KFRONTIER.growOrganPipe(BIO,kfCfg,x,y,z,h,opSc,{});
      counts.carnelian_organpipe++;
      pushPlaced('carnelian_organpipe',x,y,z,g.H,'carnelian_sky_island',{biosphere:'carnelian',shellStep01:sh.shellStep01});
     }else if(roll<0.52){
      /* Buoyant 1.19 atm / 0.75 g Pneumatophore Ruby Tether-Vines (tall on risers, <= 3.5 m on bare slabs) */
      const btSc=sh.shellStep01>=0.55?(0.70+0.28*H(h,7,0,7)):(0.32+0.12*H(h,7,0,7));
      const g=KFRONTIER.growBladderTether(BIO,kfCfg,x,y,z,h,btSc);
      counts.bladder_tether++;
      pushPlaced('bladder_tether',x,y,z,g.H,'carnelian_sky_island',{biosphere:'carnelian',shellStep01:sh.shellStep01});
     }else if(roll<0.78){
      /* Pleated Carnelian Lattice-Fan solar sails (<= 3.5 m) */
      const evSc=0.52+0.28*H(h,7,0,7);
      const g=KFRONTIER.growErythraVeil(BIO,kfCfg,x,y,z,h,evSc);
      counts.erythra_veil++;
      pushPlaced('erythra_veil',x,y,z,g.H,'carnelian_sky_island',{biosphere:'carnelian'});
     }else{
      /* Chalcedony Window-Dome armoured skylights (0.25-0.95 m) */
      const awSc=0.72+0.42*H(h,7,0,7);
      KFRONTIER.putAgateWindow(BIO,'td_kf',x,y,z,h,awSc,false);
      counts.agate_window++;
      pushPlaced('agate_window',x,y,z,awSc*0.65,'carnelian_sky_island',{biosphere:'carnelian'});
     }
     SPACE.insert({kind:'carnelian',id:'ck-'+i+'-'+j},x,z,2.5);
     counts.carnelianSkyIsland++;
    }
   }
   REGISTER({
    tagId:'thedome:eastflank-carnelian-sky-island',
    name:'East Dome Flank Carnelian Erythrophyll Sky-Island Refuge',
    tagClass:'flora',
    x:-72,y:G(-72,8),z:8,r:64,h:18,
    tags:{biome:'thedome',biosphere:'carnelian',role:'sky-island'}
   });
  }

  /* 2c. 55% Red Sky-Island Inversion on crown (+2,925 m Rayleigh crown) & sun-exposed dry margins of apron / cleft via KFRONTIER.quiltAt */
  if((SKEY==='crown'||SKEY==='apron'||SKEY==='cleft')&&typeof KFRONTIER!=='undefined'){
   const kfCfg={bucket:'td_chitin',skelBucket:'td_skel',prefix:'td_kf',sunAzimuthRad:-0.52};
   const cell=SKEY==='crown'?16.5:23.0,R=SKEY==='crown'?340:380,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x289);
    const dens=SKEY==='crown'?0.44:(SKEY==='cleft'?0.30:0.24);
    if(KRAND.unit(h)>dens*q)continue;
    const x=(i+0.18+0.64*H(h,1,0,1))*cell,z=(j+0.18+0.64*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R||inReserve(x,z,7)||inATent(x,z,6)||inFlowChannel(x,z,5))continue;
    if(!clearSpace(x,z,2.2))continue;
    const y=G(x,z);
    const qf=DOME_PHYS.skyIslandQuiltAt(x,z,y,DOME_STATE.hydroperiod01,SITE);
    if(qf.biosphere!=='carnelian')continue;

    /* Strictly low sky-island forms (<= 2.75 m <= 3.0 m < 4.0 m -> 100% shellStep01 safe!) */
    const roll=H(h,3,0,3);
    if((qf.stranglerEdge01>0.12||qf.shellStep01>=0.18)&&roll<0.22){
     const stSc=0.48+0.30*H(h,4,0,4);
     KFRONTIER.putBloodStrangler(BIO,'td_kf',x,y,z,h,stSc);
     counts.blood_strangler++;
     pushPlaced('blood_strangler',x,y,z,stSc*1.6,'carnelian_sky_island',{biosphere:'carnelian'});
    }else if(roll<0.70){
     const awSc=0.62+0.36*H(h,5,0,5);
     KFRONTIER.putAgateWindow(BIO,'td_kf',x,y,z,h,awSc,false);
     counts.agate_window++;
     pushPlaced('agate_window',x,y,z,awSc*0.6,'carnelian_sky_island',{biosphere:'carnelian'});
    }else{
     /* Scale <= 0.64 guarantees growErythraVeil H <= 4.2 * 0.64 = 2.69 m <= 3.0 m! */
     const evSc=0.40+0.24*H(h,6,0,6);
     const g=KFRONTIER.growErythraVeil(BIO,kfCfg,x,y,z,h,evSc);
     counts.erythra_veil++;
     pushPlaced('erythra_veil',x,y,z,g.H,'carnelian_sky_island',{biosphere:'carnelian'});
    }
    SPACE.insert({kind:'carnelian',id:'cq-'+i+'-'+j},x,z,2.0);
   }
  }

  /* 3. Summit & High-Shoulder Cushions (crownrosette, crownpasque & staghornclubmoss on crown, cleft & apron) */
  if(SKEY==='crown'||SKEY==='cleft'){
   const cell=SKEY==='crown'?11.5:21.0,R=SKEY==='crown'?380:320,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x301);
    if(KRAND.unit(h)>(SKEY==='crown'?0.46:0.22)*q)continue;
    const x=(i+0.2+0.6*H(h,1,0,1))*cell,z=(j+0.2+0.6*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R||inReserve(x,z,5))continue;
    if(SKEY==='cleft'&&Math.abs(z)<20)continue;
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan)continue;
    const sh=DOME_PHYS.shellAt(x,z,SITE);
    if(sh.shellStep01>0.68)continue;
    const y=G(x,z);
    const qf=DOME_PHYS.skyIslandQuiltAt(x,z,y,DOME_STATE.hydroperiod01,SITE);
    if(qf.biosphere==='carnelian'&&H(h,2,0,2)<0.65)continue;

    const pickC=H(h,5,0,5);
    if(pickC<0.56){
     const spike=H(h,3,0,3)<0.36;
     THEDOME.growRosette(x,y,z,h,0.78+0.42*H(h,4,0,4),spike);
     counts.crownrosette++;
     if(counts.crownrosette<=220)pushPlaced('crownrosette',x,y,z,spike?1.8:0.9,'crown',null);
    }else if(pickC<0.82){
     const pSc=0.22+0.14*H(h,6,0,6);
     BIO.put('td_pasque',[x,y-0.02,z],qEuler(0,H(h,7,0,7)*TAU,0),[pSc,pSc,pSc],C(PAL.pasque[i&1]));
     counts.crownpasque++;
     if(counts.crownpasque<=160)pushPlaced('crownpasque',x,y,z,pSc,'crown',null);
    }else{
     const cSc=0.22+0.14*H(h,8,0,8);
     BIO.put('td_clubmoss',[x,y-0.02,z],qEuler(0,H(h,9,0,9)*TAU,0),[cSc*1.2,cSc,cSc*1.2],C(PAL.clubmoss[j&1]));
     counts.staghornclubmoss++;
     if(counts.staghornclubmoss<=160)pushPlaced('staghornclubmoss',x,y,z,cSc,'garland',null);
    }
   }
  }
  if(SKEY==='apron'){
   /* Singing-slab staghornclubmoss along moist exfoliation step-notches on apron */
   const cell=24.0,N=Math.ceil(320/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x331);
    if(KRAND.unit(h)>0.34*q)continue;
    const x=(i+0.2+0.6*H(h,1,0,1))*cell,z=(j+0.2+0.6*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>320||inReserve(x,z,4)||inATent(x,z,4)||inFlowChannel(x,z,4))continue;
    const sh=DOME_PHYS.shellAt(x,z,SITE);
    if(sh.shellStep01<0.35)continue;
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan)continue;
    const y=G(x,z),cSc=0.22+0.14*H(h,2,0,2);
    BIO.put('td_clubmoss',[x,y-0.02,z],qEuler(0,H(h,3,0,3)*TAU,0),[cSc*1.2,cSc,cSc*1.2],C(PAL.clubmoss[i&1]));
    counts.staghornclubmoss++;
    if(counts.staghornclubmoss<=140)pushPlaced('staghornclubmoss',x,y,z,cSc,'garland',null);
   }
  }

  /* 4. Station 2 (moat): Seepage Fen (moatpitcher, pansundew) + Collar Gallery (moatcedar, weepingamberlarch, moatpaperbirch, cleftrowan, cloudrhododendron, staghornclubmoss, bleachfireweed, cleftghostpipe) */
  if(SKEY==='moat'){
   const cell=5.5,N=Math.ceil(210/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x401);
    if(KRAND.unit(h)>0.56*q)continue;
    const x=(i+0.15+0.7*H(h,1,0,1))*cell,z=(j+0.15+0.7*H(h,2,0,2))*cell;
    if(z>34||z<-76||Math.abs(x)>210||inReserve(x,z,6)||inFlowChannel(x,z,3.5))continue;
    const y=G(x,z),w=waterH(x,z);
    const dy=w>-1e8?(y-w):1.5;
    if(dy>=-0.18&&dy<=0.85){
     const pCol=C(PAL.pitcher[Math.floor(H(h,3,0,3)*PAL.pitcher.length)%PAL.pitcher.length]);
     const pSc=0.36+0.42*H(h,4,0,4);
     BIO.put('td_pitcher',[x,Math.max(y,w>-1e8?w-0.06:y)-0.04,z],qEuler(0.08*(H(h,5,0,5)-0.5),H(h,6,0,6)*TAU,0),[pSc*0.62,pSc,pSc*0.62],pCol);
     counts.moatpitcher++;
     if(dy>=0.04&&H(h,11,0,11)<0.28){
      const sSc=0.18+0.10*H(h,12,0,12),sx=x+0.32,sz=z+0.28,sy=G(sx,sz);
      BIO.put('td_sundew',[sx,sy-0.02,sz],qEuler(0,H(h,13,0,13)*TAU,0),[sSc*1.2,sSc,sSc*1.2],C(PAL.sundew[0]));
      counts.pansundew++;
      if(counts.pansundew<=140)pushPlaced('pansundew',sx,sy,sz,sSc,'ringmoat',null);
     }
     if(H(h,7,0,7)<0.62){
      const sx2=x+0.45,sz2=z-0.35;
      BIO.put('td_sedge',[sx2,G(sx2,sz2)-0.03,sz2],qEuler(0,H(h,8,0,8)*TAU,0),[0.60,0.72,0.60],C(PAL.sedge[i&1]));
     }
     if(H(h,9,0,9)<0.36){
      const cx2=x-0.4,cz2=z+0.4;
      BIO.put('td_cotton',[cx2,G(cx2,cz2)-0.03,cz2],qEuler(0,H(h,10,0,10)*TAU,0),[0.50,0.66,0.50],C(PAL.cotton[0]));
     }
     if(counts.moatpitcher<=260)pushPlaced('moatpitcher',x,y,z,pSc,'ringmoat',null);
    }
   }

   /* Collar woodland & shrub belt on dry hogback foot & fen margins */
   const tCell=21.0,TN=Math.ceil(350/tCell);
   for(let j=-TN;j<=TN;j++)for(let i=-TN;i<=TN;i++){
    const h=KRAND.hash(seed,i,j,0x451);
    if(KRAND.unit(h)>0.48*q)continue;
    const x=(i+0.2+0.6*H(h,1,0,1))*tCell,z=(j+0.2+0.6*H(h,2,0,2))*tCell;
    if(z>SITE.apronToeZ-4||inReserve(x,z,10)||inFlowChannel(x,z,6))continue;
    const y=G(x,z),w=waterH(x,z);
    if((w>-1e8&&y<w+0.65)||FIELD.slope(x,z)>0.58||!clearSpace(x,z,3.0))continue;

    const pickM=H(h,4,0,4);
    let tk='moatcedar';
    if(pickM<0.42)tk='moatcedar';
    else if(pickM<0.68)tk='weepingamberlarch';
    else if(pickM<0.88)tk='moatpaperbirch';
    else tk='cleftrowan';

    const g=THEDOME.growTree(tk,x,y,z,h,0.82+0.28*H(h,3,0,3),{});
    SPACE.insert({kind:'tree',id:'mc-'+i+'-'+j},x,z,3.0);
    counts[tk]++;
    THEDOME.TREE_RECS.push({key:tk,x:x,y:y,z:z,H:g.H,shellStep01:1.0,inPan:false,moatCollar:true});
    pushPlaced(tk,x,y,z,g.H,'ringmoat',{moatCollar:true});

    /* Understory myco-heterotroph cleftghostpipe, clubmoss & sunny edge fireweed/rhododendron */
    const uSub=H(h,5,0,5),ux=x+1.35,uz=z-1.15;
    if(!inFlowChannel(ux,uz,3)&&(waterH(ux,uz)<=-1e8||G(ux,uz)>waterH(ux,uz)+0.4)){
     const uy=G(ux,uz);
     if(uSub<0.28){
      const gpSc=0.20+0.12*H(h,6,0,6);
      BIO.put('td_ghostpipe',[ux,uy-0.02,uz],qEuler(0,H(h,7,0,7)*TAU,0),[gpSc,gpSc,gpSc],C(PAL.ghostpipe[0]));
      counts.cleftghostpipe++;
      pushPlaced('cleftghostpipe',ux,uy,uz,gpSc,'ringmoat',null);
     }else if(uSub<0.54){
      const cmSc=0.22+0.12*H(h,6,0,6);
      BIO.put('td_clubmoss',[ux,uy-0.02,uz],qEuler(0,H(h,7,0,7)*TAU,0),[cmSc*1.2,cmSc,cmSc*1.2],C(PAL.clubmoss[0]));
      counts.staghornclubmoss++;
      pushPlaced('staghornclubmoss',ux,uy,uz,cmSc,'ringmoat',null);
     }else if(uSub<0.78){
      const fwSc=0.52+0.42*H(h,6,0,6);
      BIO.put('td_fireweed',[ux+0.8,G(ux+0.8,uz)-0.03,uz],qEuler(0,H(h,7,0,7)*TAU,0),[fwSc*0.75,fwSc,fwSc*0.75],C(PAL.fireweed[0]));
      counts.bleachfireweed++;
      pushPlaced('bleachfireweed',ux+0.8,uy,uz,fwSc,'ringmoat',null);
     }else if(BIO.lodD(ux,uz)<260){
      const rg=THEDOME.growRhododendron(ux+0.9,G(ux+0.9,uz),uz,KRAND.hash(h,8,0,8),0.72+0.22*H(h,6,0,6));
      counts.cloudrhododendron++;
      pushPlaced('cloudrhododendron',ux+0.9,uy,uz,rg.H,'ringmoat',null);
     }
    }
   }
  }

  /* 5. Barometric Breath-Fern (cleftfilmyfern) & Porcelain Ghost-Pipe (cleftghostpipe) in radial Kluft (Station 4) & under A-tents (Stations 1, 5) */
  if(SKEY==='cleft'&&SITE.cleft){
   const CL=SITE.cleft;
   for(let k=0;k<160;k++){
    const h=KRAND.hash(seed,k,19,0x501);
    const fx=lerp(-118,135,H(h,1,0,1));
    if(Math.abs(fx-CL.bridgeX)<9.5)continue;
    const side=k%2===0?1:-1;
    const fz=side*(CL.halfW*(0.52+0.36*H(h,2,0,2)));
    const fy=G(fx,fz);
    if(fy>-3.5)continue;
    const sc=0.45+0.46*H(h,3,0,3);
    const fCol=C(PAL.fern[k%PAL.fern.length]);
    BIO.put('td_cleftfern',[fx,fy+0.02,fz],qEuler(0.25*side,side>0?Math.PI:0,0),[sc,sc*1.15,sc],fCol);
    if(k%2===0){
     const sx=fx*0.98,sz=fz*0.52,sy=G(sx,sz);
     BIO.put('td_shadefern',[sx,sy-0.03,sz],qEuler(0,H(h,4,0,4)*TAU,0),[sc*0.85,sc*0.78,sc*0.85],fCol);
    }
    if(k%4===1){
     const gx=fx+0.35,gz=fz*0.42,gy=G(gx,gz),gpSc=0.18+0.14*H(h,5,0,5);
     BIO.put('td_ghostpipe',[gx,gy-0.02,gz],qEuler(0,H(h,6,0,6)*TAU,0),[gpSc,gpSc,gpSc],C(PAL.ghostpipe[k&1]));
     counts.cleftghostpipe++;
     pushPlaced('cleftghostpipe',gx,gy,gz,gpSc,'kluft_cleft',null);
    }
    counts.cleftfilmyfern++;
    if(k<90)pushPlaced('cleftfilmyfern',fx,fy,fz,sc,'kluft_cleft',null);
   }
  }
  if(SITE.aTents&&SITE.aTents.length){
   for(let ai=0;ai<SITE.aTents.length;ai++){
    const A=SITE.aTents[ai];
    for(let k=0;k<18;k++){
     const h=KRAND.hash(seed,ai,k,0x521);
     const lx=(H(h,1,0,1)-0.5)*A.spanM*0.58,lz=(H(h,2,0,2)-0.5)*A.lengthM*0.64;
     const c=Math.cos(A.ry),sn=Math.sin(A.ry);
     const fx=A.x+lx*c-lz*sn,fz=A.z+lx*sn+lz*c;
     const fy=G(fx,fz);
     const sc=0.38+0.34*H(h,3,0,3);
     BIO.put('td_shadefern',[fx,fy-0.03,fz],qEuler(0,H(h,4,0,4)*TAU,0),[sc,sc*0.85,sc],C(PAL.fern[k%PAL.fern.length]));
     counts.cleftfilmyfern++;
     if(k%3===0){
      const gx=fx+0.35,gz=fz-0.25,gy=G(gx,gz),gpSc=0.18+0.12*H(h,5,0,5);
      BIO.put('td_ghostpipe',[gx,gy-0.02,gz],qEuler(0,H(h,6,0,6)*TAU,0),[gpSc,gpSc,gpSc],C(PAL.ghostpipe[0]));
      counts.cleftghostpipe++;
      pushPlaced('cleftghostpipe',gx,gy,gz,gpSc,'apron_bench',{underATent:A.id});
     }
    }
   }
  }

  /* 6. Concentric Bullseye Exfoliation Lichen (ringlichen) & spall blocks across bare granite aprons */
  {
   const cell=19.0,R=420,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x601);
    if(KRAND.unit(h)>0.52*q)continue;
    const x=(i+0.15+0.7*H(h,1,0,1))*cell,z=(j+0.15+0.7*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R||inReserve(x,z,3)||inFlowChannel(x,z,3))continue;
    if(SKEY==='moat'&&z<SITE.apronToeZ+4)continue;
    if(SKEY==='cleft'&&Math.abs(z)<14)continue;
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan)continue;
    const y=G(x,z);
    if(FIELD.slope(x,z)>0.55)continue;
    const rOuter=0.65+1.15*H(h,3,0,3);
    const cSaf=C(PAL.lichenSaffron[i&1]),cCel=C(PAL.lichenCeladon[j&1]),cVio=C(PAL.lichenViolet[(i+j)&1]);
    BIO.put('td_ringlichen',[x,y+0.015,z],qEuler(0,H(h,4,0,4)*TAU,0),[rOuter,0.14,rOuter],cSaf);
    BIO.put('td_ringlichen',[x,y+0.024,z],qEuler(0,H(h,5,0,5)*TAU,0),[rOuter*0.56,0.16,rOuter*0.56],(i+j)%2?cCel:cVio);
    counts.ringlichen++;
    if(counts.ringlichen<=180)pushPlaced('ringlichen',x,y,z,rOuter,'apron_bench',null);

    if(FIELD.step(x,z)>0.55&&H(h,6,0,6)<0.22){
     const spW=0.85+1.35*H(h,7,0,7);
     BIO.put('td_spall_slab',[x+1.2,G(x+1.2,z)-0.08,z],qEuler(0.12*(H(h,8,0,8)-0.5),H(h,9,0,9)*TAU,0.08),[spW,0.45,spW*0.78],C(PAL.shell[0]));
     counts.spall++;
    }
   }
  }

  /* 7. Pre-draw KTAGS resource registrations (geology.json survey: stone=214, clay=48, S-collar limestone=255, zinc=90, smoky-quartz) */
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   const g=SITE.geology||{};
   if(g.stone){
    REGISTER({
     tagId:'thedome:res-porphyry-'+SKEY,name:'Resonant Quartz-Porphyry & Leucogranite Stone',tagClass:'feature',ground:true,
     x:-85,y:G(-85,65),z:65,r:28,h:8,
     tags:{biome:'thedome',role:'gather:porphyry-lithophone',stone:g.stone,sacredSanctuary:SKEY!=='moat'}
    });
   }
   if(SKEY==='moat'&&g.limestone){
    REGISTER({
     tagId:'thedome:res-collar-carbonate',name:'Upturned Collar Limestone & Zinc Horizon',tagClass:'feature',ground:true,
     x:-92,y:G(-92,-96),z:-96,r:34,h:18,
     tags:{biome:'thedome',limestone:g.limestone,zinc:g.zinc,clay:g.clay}
    });
   }
   if(SKEY==='cleft'){
    REGISTER({
     tagId:'thedome:res-smoky-quartz',name:'Hydrothermal Kluft Smoky-Quartz Megaprism Pocket',tagClass:'feature',ground:true,
     x:14,y:G(14,0),z:0,r:22,h:18,
     tags:{biome:'thedome',role:'gather:smoky-quartz',mineral:'smoky-quartz'}
    });
   }
  }

  return counts;
 };
})();
