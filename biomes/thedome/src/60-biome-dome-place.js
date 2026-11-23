/* ================================================================= THE DOME — deterministic KRAND.cell placement ([G data])
   Places all 7 own guilds + resource KTAGS records deterministically by cell hash (KRAND.hash), strictly obeying:
     1. Zero full-stature trees (height > 4 m) on unfractured bare exfoliation interiors (shellStep01 < 0.55 && !inPan)
     2. Concentric contour-line treeline garlands (cloudgarlandpine) strictly along shellStep01 >= 0.70 risers (Stations 1, 3)
     3. Perched panbonsai on gnamma islands & step-lips, and gnammamoss concentric rims around gnamma solution pans
     4. Ring-moat moatpitcher sedge fens & stunted moatcedar / kin collar groves (Station 2), 100% clear of rills & reserves
     5. Translucent cleftfilmyfern curtains inside radial Kluft cleft & under hollow A-tent arches (Stations 1, 4)
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
   moatpitcher:0,cleftfilmyfern:0,ringlichen:0,moatcedar:0,spall:0
  };
  THEDOME.PLACED.length=0;
  THEDOME.TREE_RECS.length=0;

  const G=(typeof DRAWN_H==='function')?DRAWN_H:BIO.host.terrainH;
  const clearSpace=(x,z,r)=>!SPACE.some(x,z,r+2.5,o=>o.kind==='reserve'||o.kind==='sheetwash-rill'||o.kind==='gnamma-water');
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

  /* 1. Gnamma solution-pan gardens: concentric gnammamoss rims + island/rim panbonsai (Stations 1 & 3) */
  if(SITE.gnammas&&SITE.gnammas.length){
   for(let pi=0;pi<SITE.gnammas.length;pi++){
    const P=SITE.gnammas[pi];
    const nRim=Math.max(8,Math.round(P.r*3.2*q));
    for(let k=0;k<nRim;k++){
     const ang=(k/nRim)*TAU+0.18*H(seed,pi,k,0x101);
     const rrM=P.r*(0.92+0.26*H(seed,pi,k,0x102));
     const mx=P.x+Math.cos(ang)*rrM,mz=P.z+Math.sin(ang)*rrM;
     if(inReserve(mx,mz,2)||inFlowChannel(mx,mz,2.5))continue;
     const my=G(mx,mz);
     const sc=0.55+0.65*H(seed,pi,k,0x103);
     const mCol=C(PAL.mossWet[k%PAL.mossWet.length]);
     BIO.put('td_gnammamoss',[mx,my+0.02,mz],qEuler(0,ang,0),[sc,1,sc],mCol);
     counts.gnammamoss++;
     if(k%4===0){
      const sx=P.x+Math.cos(ang+0.12)*(P.r*1.12),sz=P.z+Math.sin(ang+0.12)*(P.r*1.12);
      const sy=G(sx,sz);
      BIO.put('td_sedge',[sx,sy-0.04,sz],qEuler(0,ang*1.7,0),[0.48,0.52,0.48],C(PAL.sedge[k%PAL.sedge.length]));
     }
    }
    if(THEDOME.PLACED.length<3000)THEDOME.PLACED.push(['gnammamoss',P.x,P.sillY,P.z,P.r,'gnammapan',{panId:P.id}]);

    /* Ancient twisted panbonsai on central gnamma granite islands (Station 1 hero pans & large island pans) */
    if(P.islandR>0.35&&SKEY!=='crown'){
     const bx=P.x+P.islandDx,bz=P.z+P.islandDz,by=G(bx,bz);
     const bSeed=KRAND.hash(seed,pi,77,0x110);
     const g=THEDOME.growTree('panbonsai',bx,by,bz,bSeed,0.88+0.32*H(seed,pi,1,0x111),{});
     counts.panbonsai++;
     THEDOME.PLACED.push(['panbonsai',bx,by,bz,g.H,'gnammapan',{panId:P.id,island:true}]);
     THEDOME.TREE_RECS.push({key:'panbonsai',x:bx,y:by,z:bz,H:g.H,shellStep01:1.0,inPan:true});
     REGISTER({
      tagId:'thedome:bonsai-'+P.id,name:'Gnamma-Island Twisted Bonsai Pine ('+P.id+')',tagClass:'flora',
      x:bx,y:by,z:bz,r:Math.max(2.2,P.islandR+1.2),h:g.H+0.8,
      tags:{biome:'thedome',species:'panbonsai',zone:'gnammapan'}
     });
    }
    /* Register gnamma pan feature in REG & KTAGS */
    if(pi<36){
     REGISTER({
      tagId:'thedome:'+P.id,name:'Gnamma Solution-Pan Sky-Mirror ('+P.id+')',tagClass:'feature',ground:true,
      x:P.x,y:P.sillY-P.depth,z:P.z,r:P.r+1.2,h:P.depth+1.2,
      tags:{biome:'thedome',gnamma:true,radiusM:P.r,depthM:P.depth}
     });
    }
   }
  }

  /* 2. Concentric Contour-Riser Cloud-Pine Garlands (shellStep01 >= 0.70 ONLY! Zero > 4 m trees on bare aprons!) */
  {
   const cell=SKEY==='crown'?13.5:18.0;
   const R=540,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x201);
    if(KRAND.unit(h)>0.72*q)continue;
    const x=(i+0.15+0.70*H(h,1,0,1))*cell,z=(j+0.15+0.70*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R)continue;
    if(inReserve(x,z,8)||inATent(x,z,6)||inFlowChannel(x,z,5.5))continue;
    if(SKEY==='cleft'&&Math.abs(z)<24)continue;
    if(SKEY==='moat'&&z<SITE.apronToeZ+16)continue;

    const sh=DOME_PHYS.shellAt(x,z,SITE);
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan||sh.hollowGapM>0.05)continue;

    /* Strict Garland Rule (PLAN.md section 8 #2 & #3): cloudgarlandpine ONLY along shellStep01 >= 0.70 contour risers! */
    if(sh.shellStep01>=0.72){
     if(!clearSpace(x,z,3.0))continue;
     const y=G(x,z);
     const dCam=BIO.lodD(x,z);
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
      THEDOME.PLACED.push(['cloudgarlandpine',x,y,z,g.H,'garland',{shellStep01:sh.shellStep01}]);
     }else if(BIO.defs['td_imp_cloudgarlandpine']){
      const estH=lerp(5.5,11.0,H(h,1,0,0x301))*sc;
      BIO.put('td_imp_cloudgarlandpine',[x,y,z],qEuler(0,H(h,4,0,4)*TAU,0),[estH*0.58,estH,estH*0.58],C(0xffffff));
      THEDOME.TREE_RECS.push({key:'cloudgarlandpine',x:x,y:y,z:z,H:estH,shellStep01:sh.shellStep01,inPan:false});
      THEDOME.PLACED.push(['cloudgarlandpine',x,y,z,estH,'garland',{shellStep01:sh.shellStep01,impostor:true}]);
     }
     SPACE.insert({kind:'tree',id:'gp-'+i+'-'+j},x,z,2.8);
     counts.cloudgarlandpine++;
    }else if(sh.shellStep01>=0.48&&SKEY!=='crown'&&H(h,5,0,5)<0.30){
     /* Dwarf <= 3.6 m panbonsai clasping intermediate exfoliation cracks */
     const y=G(x,z);
     const g=THEDOME.growTree('panbonsai',x,y,z,h,0.75+0.26*H(h,6,0,6),{});
     counts.panbonsai++;
     THEDOME.TREE_RECS.push({key:'panbonsai',x:x,y:y,z:z,H:g.H,shellStep01:sh.shellStep01,inPan:false});
     THEDOME.PLACED.push(['panbonsai',x,y,z,g.H,'apron_bench',{shellStep01:sh.shellStep01}]);
    }
   }
  }

  /* 3. Station 3 (crown): Silver Crown-Chalice (crownrosette) cushions across +2,720..+2,925 m cap-cloud benches */
  if(SKEY==='crown'||SKEY==='cleft'){
   const cell=SKEY==='crown'?11.0:22.0,R=SKEY==='crown'?380:320,N=Math.ceil(R/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x301);
    if(KRAND.unit(h)>(SKEY==='crown'?0.46:0.18)*q)continue;
    const x=(i+0.2+0.6*H(h,1,0,1))*cell,z=(j+0.2+0.6*H(h,2,0,2))*cell;
    if(Math.hypot(x,z)>R||inReserve(x,z,5))continue;
    if(SKEY==='cleft'&&Math.abs(z)<20)continue;
    const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
    if(gn.inPan)continue;
    const sh=DOME_PHYS.shellAt(x,z,SITE);
    if(sh.shellStep01>0.68)continue;
    const y=G(x,z);
    const spike=H(h,3,0,3)<0.36;
    THEDOME.growRosette(x,y,z,h,0.78+0.42*H(h,4,0,4),spike);
    counts.crownrosette++;
    if(counts.crownrosette<=240)THEDOME.PLACED.push(['crownrosette',x,y,z,spike?1.8:0.9,'crown',null]);
   }
  }

  /* 4. Station 2 (moat): Ring-Moat Amber Pitcher (moatpitcher) seepage fen + collar red-cedar gallery */
  if(SKEY==='moat'){
   const cell=5.5,N=Math.ceil(210/cell);
   for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){
    const h=KRAND.hash(seed,i,j,0x401);
    if(KRAND.unit(h)>0.56*q)continue;
    const x=(i+0.15+0.7*H(h,1,0,1))*cell,z=(j+0.15+0.7*H(h,2,0,2))*cell;
    if(z>34||z<-76||Math.abs(x)>210||inReserve(x,z,6)||inFlowChannel(x,z,3.5))continue;
    const y=G(x,z),w=waterH(x,z);
    const dy=w>-1e8?(y-w):1.5;
    /* Place moatpitcher & sphagnum/cottongrass on moist hummocks & shallow 0..0.22 m fen margins */
    if(dy>=-0.18&&dy<=0.85){
     const pCol=C(PAL.pitcher[Math.floor(H(h,3,0,3)*PAL.pitcher.length)%PAL.pitcher.length]);
     const pSc=0.36+0.42*H(h,4,0,4);
     BIO.put('td_pitcher',[x,Math.max(y,w>-1e8?w-0.06:y)-0.04,z],qEuler(0.08*(H(h,5,0,5)-0.5),H(h,6,0,6)*TAU,0),[pSc*0.62,pSc,pSc*0.62],pCol);
     counts.moatpitcher++;
     if(H(h,7,0,7)<0.65){
      BIO.put('td_sedge',[x+0.45,y-0.05,z-0.35],qEuler(0,H(h,8,0,8)*TAU,0),[0.62,0.74,0.62],C(PAL.sedge[i&1]));
     }
     if(H(h,9,0,9)<0.38){
      BIO.put('td_cotton',[x-0.4,y-0.04,z+0.4],qEuler(0,H(h,10,0,10)*TAU,0),[0.52,0.68,0.52],C(PAL.cotton[0]));
     }
     if(counts.moatpitcher<=280)THEDOME.PLACED.push(['moatpitcher',x,y,z,pSc,'ringmoat',null]);
    }
   }
   /* Collar red-cedar trees on dry hogback foot & fen margins (never in fen water or rills!) */
   const tCell=22.0,TN=Math.ceil(360/tCell);
   for(let j=-TN;j<=TN;j++)for(let i=-TN;i<=TN;i++){
    const h=KRAND.hash(seed,i,j,0x451);
    if(KRAND.unit(h)>0.42*q)continue;
    const x=(i+0.2+0.6*H(h,1,0,1))*tCell,z=(j+0.2+0.6*H(h,2,0,2))*tCell;
    if(z>SITE.apronToeZ-4||inReserve(x,z,10)||inFlowChannel(x,z,6))continue;
    const y=G(x,z),w=waterH(x,z);
    if((w>-1e8&&y<w+0.65)||FIELD.slope(x,z)>0.58)continue;
    const g=THEDOME.growTree('moatcedar',x,y,z,h,0.82+0.34*H(h,3,0,3),{});
    SPACE.insert({kind:'tree',id:'mc-'+i+'-'+j},x,z,3.2);
    counts.moatcedar++;
    THEDOME.TREE_RECS.push({key:'moatcedar',x:x,y:y,z:z,H:g.H,shellStep01:1.0,inPan:false,moatCollar:true});
   }
  }

  /* 5. Barometric Breath-Fern (cleftfilmyfern) curtains in radial Kluft (Station 4) & under A-tent vaults (Station 1) */
  if(SKEY==='cleft'&&SITE.cleft){
   const CL=SITE.cleft;
   for(let k=0;k<165;k++){
    const h=KRAND.hash(seed,k,19,0x501);
    const fx=lerp(-118,135,H(h,1,0,1));
    if(Math.abs(fx-CL.bridgeX)<9.5)continue;
    const side=k%2===0?1:-1;
    const fz=side*(CL.halfW*(0.52+0.36*H(h,2,0,2)));
    const fy=terrainH(fx,fz);
    if(fy>-3.5)continue;
    const sc=0.45+0.48*H(h,3,0,3);
    const fCol=C(PAL.fern[k%PAL.fern.length]);
    BIO.put('td_cleftfern',[fx,fy+0.02,fz],qEuler(0.25*side,side>0?Math.PI:0,0),[sc,sc*1.15,sc],fCol);
    if(k%2===0){
     BIO.put('td_shadefern',[fx*0.98,terrainH(fx*0.98,fz*0.55)-0.04,fz*0.55],qEuler(0,H(h,4,0,4)*TAU,0),[sc*0.85,sc*0.78,sc*0.85],fCol);
    }
    counts.cleftfilmyfern++;
    if(k<90)THEDOME.PLACED.push(['cleftfilmyfern',fx,fy,fz,sc,'kluft_cleft',null]);
   }
  }
  if(SITE.aTents&&SITE.aTents.length){
   for(let ai=0;ai<SITE.aTents.length;ai++){
    const A=SITE.aTents[ai];
    for(let k=0;k<18;k++){
     const h=KRAND.hash(seed,ai,k,0x521);
     const lx=(H(h,1,0,1)-0.5)*A.spanM*0.62,lz=(H(h,2,0,2)-0.5)*A.lengthM*0.68;
     const c=Math.cos(A.ry),sn=Math.sin(A.ry);
     const fx=A.x+lx*c-lz*sn,fz=A.z+lx*sn+lz*c;
     const fy=terrainH(fx,fz);
     const sc=0.38+0.35*H(h,3,0,3);
     BIO.put('td_shadefern',[fx,fy-0.03,fz],qEuler(0,H(h,4,0,4)*TAU,0),[sc,sc*0.85,sc],C(PAL.fern[k%PAL.fern.length]));
     counts.cleftfilmyfern++;
    }
   }
  }

  /* 6. Concentric Bullseye Exfoliation Lichen (ringlichen) & spall blocks across bare granite aprons (Stations 1-4) */
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
    /* Concentric 2-ring bullseye thallus resting flush on drawn stone */
    BIO.put('td_ringlichen',[x,y+0.015,z],qEuler(0,H(h,4,0,4)*TAU,0),[rOuter,0.14,rOuter],cSaf);
    BIO.put('td_ringlichen',[x,y+0.024,z],qEuler(0,H(h,5,0,5)*TAU,0),[rOuter*0.56,0.16,rOuter*0.56],(i+j)%2?cCel:cVio);
    counts.ringlichen++;
    if(counts.ringlichen<=180)THEDOME.PLACED.push(['ringlichen',x,y,z,rOuter,'apron_bench',null]);

    /* Occasional popped granite exfoliation spall scales along step-risers */
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
