// prefix: ra
// ================================================================= LOWER RIA / WESTERN DYNASTY (RIWA-TOKA) — CHANCELLERY & SACRED PRECINCTS (19-22)
// Shared civic & sacred helpers + four Lower Ria monuments inspired by Rattanakosin royal/temple architecture fused 50/50
// with Near-Eastern, Classical Greco-Roman, and Egyptian stone masonry:
//   19. ra_west_chakri_chancellery    — Two-storey Classical rusticated stone palace + hexastyle portico + Triple Gilded Prasat Spires
//   20. ra_west_mondop_library        — Veined marble fretwork stylobate + peripteral gold-emerald mosaic columns + 5-tier Mondop spire
//   21. ra_west_celadon_prang_terrace — Pierced marble terrace + Celadon porcelain Phra-Prang + 12-Caryatid Golden Chedi + Sanctuary
//   22. ra_west_bussabok_gate         — Inward-battered Egyptian/Thai mosaic Bussabok pylon-portal + pierced wall + lustral shrine

/* Carved stone lotus-bowl planter with 3-pad cloud-pruned bonsai topiary tree (svNoWalk, zero stray walk floors). */
function raTopiaryUrn(x,y0,z,sc,upper){
 sc=sc==null?1:sc;
 svNoWalk(()=>{
  const pMk=upper?'porphyry':'travertine',bMk=upper?'dolomite':'celadon',tMk=upper?'silver':'gold';
  box(pMk,x,y0+.01,z,.74*sc,.26*sc,.74*sc,P(pMk));
  box('alabaster',x,y0+.27*sc,z,.62*sc,.1*sc,.62*sc,P('alabaster'));
  cyl(bMk,x,y0+.37*sc,z,.28*sc,.28*sc,P(bMk),10,.46*sc);
  cyl(tMk,x,y0+.65*sc,z,.49*sc,.05*sc,P(tMk),10);
  cyl('earth',x,y0+.7*sc,z,.41*sc,.03*sc,0x56422e,10);
  /* Cloud-pruned bonsai trunk, side boughs & 3 layered foliage pads */
  beam('teak',[x,y0+.72*sc,z],[x-.04*sc,y0+1.52*sc,z],.06*sc,P('teak'),true,6,.038*sc);
  beam('teak',[x,y0+1.02*sc,z],[x+.28*sc,y0+1.26*sc,z+.06*sc],.042*sc,P('teak'),true,6,.028*sc);
  beam('teak',[x,y0+1.12*sc,z],[x-.26*sc,y0+1.34*sc,z-.06*sc],.042*sc,P('teak'),true,6,.028*sc);
  ellip('lotus',x+.3*sc,y0+1.32*sc,z+.06*sc,.34*sc,.16*sc,.32*sc,P('lotusLeaf'),0,10);
  ellip('lotus',x-.28*sc,y0+1.4*sc,z-.06*sc,.32*sc,.15*sc,.3*sc,P('lotusLeaf'),0,10);
  ellip('lotus',x-.02*sc,y0+1.62*sc,z,.42*sc,.19*sc,.4*sc,P('lotusLeaf'),0,10);
 });
}

/* Veined grey-marble / dolomite pierced stone fretwork balustrade with temple-lantern end pillars. */
function raPiercedFretWall(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.4)return;
 const yaw=Math.atan2(z0-z1,x1-x0),upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'paving'),col=P(mk);
 const fretMk=o.fretMk||'alabaster',fretCol=P(fretMk);
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const h=o.h==null?.94:o.h,t=o.t==null?.24:o.t;
 const nP=Math.max(3,Math.floor((L-.5)/.52));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   const drawSpan=(xa,xb)=>{
    const wS=xb-xa;if(wS<.25)return;
    const cxS=(xa+xb)*.5;
    box(mk,cxS,y0+.008,0,wS,.16,t,col);
    box(mk,cxS,y0+h-.14,0,wS+.03,.1,t+.04,col);
    box(trimMk,cxS,y0+h-.04,0,wS+.05,.04,t+.06,trimCol);
    const nU=Math.max(2,Math.floor((wS-.24)/.46));
    const barH=h-.3;
    for(let i=0;i<nU;i++){
     const xx=nU===1?cxS:lerp(xa+.16,xb-.16,i/(nU-1));
     box(fretMk,xx,y0+.168,0,.09,barH,t-.06,fretCol);
     if(i<nU-1){
      const xn=lerp(xa+.16,xb-.16,(i+1)/(nU-1)),xm=(xx+xn)*.5,bw=Math.max(.04,xn-xx-.1);
      box(fretMk,xm,y0+.168+barH*.46,0,bw,.075,t-.08,fretCol);
      box(trimMk,xm,y0+.168+barH*.46,0,.08,.14,t-.03,trimCol);
     }
    }
   };
   if(o.skipMid&&o.skipMid>0){
    drawSpan(-L/2,-o.skipMid);
    drawSpan(o.skipMid,L/2);
    for(const gx of [-o.skipMid,o.skipMid]){
     box(fretMk,gx,y0+.008,0,.32,h+.12,t+.1,fretCol);
     cone(trimMk,gx,y0+h+.128,0,.14,.26,trimCol,6);
    }
   }else{
    drawSpan(-L/2,L/2);
   }
   for(const sx of [-L/2+.16,L/2-.16]){
    box(fretMk,sx,y0+.008,0,.34,h+.16,t+.1,fretCol);
    box(trimMk,sx,y0+h+.168,0,.24,.18,.24,trimCol);
    cone(trimMk,sx,y0+h+.348,0,.16,.24,trimCol,6);
   }
  });
  if(o.block){
   if(o.skipMid&&o.skipMid>0){
    const wSide=L/2-o.skipMid;
    if(wSide>.2){
     raWallBlock(-o.skipMid-wSide/2,y0,0,wSide,h,t,0);
     raWallBlock(o.skipMid+wSide/2,y0,0,wSide,h,t,0);
    }
   }else{
    raWallBlock(0,y0,0,L,h,t,0);
   }
  }
 });
}

/* Tall slender square-chamfered golden-and-emerald / porphyry-and-dolomite mosaic peristyle column with lotus capital. */
function raMosaicSquareCol(x,y0,z,h,o){
 o=o||{};
 const upper=o.style==='upper-ria',w=o.w==null?.44:o.w;
 const mk=o.mk||(upper?'dolomite':'gold'),col=P(mk);
 const inMk=o.inlayMk||(upper?'porphyry':'emerald'),inCol=P(inMk);
 const baseMk=o.baseMk||(upper?'porphyry':'alabaster'),baseCol=P(baseMk);
 const capMk=o.capMk||(upper?'gold':'gold'),capCol=P(capMk);
 const shH=Math.max(.5,h-.68);
 svNoWalk(()=>{
  box(baseMk,x,y0+.01,z,w*1.52,.16,w*1.52,baseCol);
  box(inMk,x,y0+.17,z,w*1.28,.1,w*1.28,inCol);
  box(mk,x,y0+.27,z,w,shH,w,col);
  /* Four inlaid horizontal mosaic collar bands stepped +2.5 cm proud of the square shaft */
  for(const f of [.18,.4,.62,.84]){
   box(inMk,x,y0+.27+shH*f,z,w+.05,.11,w+.05,inCol);
  }
  const yC=y0+.27+shH;
  box(capMk,x,yC,z,w*1.18,.08,w*1.18,capCol);
  box(inMk,x,yC+.08,z,w*1.38,.14,w*1.38,inCol);
  box(capMk,x,yC+.22,z,w*1.64,Math.max(.08,h-(yC-y0+.22)),w*1.64,capCol);
 });
 if(o.block!==false&&h>=1.2)raWallBlock(x,y0,z,w*1.3,h,w*1.3,0);
}

/* Celadon-and-white or cobalt-and-white floral porcelain stepped Phra-Prang reliquary tower with cardinal statue niches. */
function raPorcelainPrang(cx,y0,cz,wBase,hPrang,o){
 o=o||{};
 const upper=o.style==='upper-ria',seg=o.seg==null?16:o.seg;
 const mk=o.mk||'alabaster',col=P(mk);
 const bandMk=o.bandMk||(upper?'cobalt':'celadon'),bandCol=P(bandMk);
 const accMk=o.accMk||(upper?'porphyry':'saffron'),accCol=P(accMk);
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const r0=wBase*.47;
 svNoWalk(()=>{
  if(o.vault!==false){
   lathe(bandMk,cx,cz,[
    [Math.max(.24,r0-.18),y0+.04],
    [Math.max(.14,r0*.5),y0+hPrang*.36],
    [.01,y0+hPrang*.54]
   ],12,bandCol,{inward:true});
  }
  /* Four-course stepped redented porcelain-inlaid rabam base + diamond floral medallions */
  const bH=hPrang*.28;
  box(mk,cx,y0,cz,wBase,bH*.32,wBase,col);
  box(bandMk,cx,y0+bH*.32,cz,wBase*.94,bH*.22,wBase*.94,bandCol);
  box(accMk,cx,y0+bH*.54,cz,wBase*.88,bH*.18,wBase*.88,accCol);
  box(mk,cx,y0+bH*.72,cz,wBase*.82,bH*.28,wBase*.82,col);
  for(let k=0;k<4;k++){
   const a=k*PI/2,ca=Math.cos(a),sa=Math.sin(a);
   /* Porcelain diamond floral relief medallions on base skirt */
   const dOff=wBase*.5+.03;
   W(cx+sa*dOff,y0+bH*.16,cz+ca*dOff,a,()=>{
    for(const dx of [-wBase*.26,wBase*.26]){
     box(bandMk,dx,0,0,.26,.26,.04,bandCol,0,0,PI/4);
    }
   });
   if(o.openFront&&k===0)continue;
   /* Cardinal gilded tabernacle niche + standing golden/silver ancestor deity figure */
   const nOff=wBase*.41+.05;
   W(cx+sa*nOff,y0+bH*.34,cz+ca*nOff,a,()=>{
    box(trimMk,0,0,0,wBase*.28,bH*.62,.12,trimCol);
    box('ebony',0,.06,.05,wBase*.18,bH*.46,.04,P('ebony'));
    cyl('gold',0,.08,.09,.075,bH*.28,P('gold'),8,.055);
    sph('gold',0,.08+bH*.31,.09,.055,P('gold'),1,8);
    cone('gold',0,.08+bH*.36,.09,.042,bH*.12,P('gold'),6);
    cone(trimMk,0,bH*.62,0,wBase*.17,bH*.28,trimCol,6);
   });
  }
  /* Nine-tier fluted porcelain corncob lotus-bud tower + petal rings + golden nophasun trident finial */
  const yC=y0+bH,cH=hPrang*.58,steps=9,prof=[[r0*.84,yC]];
  for(let i=1;i<=steps;i++){
   const t=i/steps,bell=Math.pow(1-t,.58);
   const rO=Math.max(.14,r0*.82*bell+.06);
   prof.push([rO,yC+cH*(t-.05/steps)]);
   prof.push([rO*.9,yC+cH*t]);
  }
  lathe(mk,cx,cz,prof,seg,col,{uv:'cone'});
  for(let i=1;i<steps;i++){
   const t=i/steps,bell=Math.pow(1-t,.58),rr=Math.max(.17,r0*.82*bell+.085);
   const rMk=i%2===1?bandMk:trimMk;
   ring(rMk,cx,yC+cH*t,cz,rr,.032,P(rMk),0,0,0,seg);
  }
  const yTop=yC+cH,fH=hPrang*.14;
  sph(bandMk,cx,yTop+.1,cz,.26,bandCol,.68,12);
  cyl('gold',cx,yTop+.22,cz,.055,fH*.78,P('gold'),8);
  cone('gold',cx,yTop+.22+fH*.75,cz,.075,fH*.28,P('gold'),8);
  for(const sx of [-.18,.18]){
   beam('gold',[cx,yTop+.28+fH*.22,cz],[cx+sx,yTop+.28+fH*.58,cz],.028,P('gold'),true,6);
  }
 });
 return y0+hPrang;
}

/* Indented-square Golden / Silver Phra-Chedi Stupa held aloft around its plinth by 12 sculpted polychrome Atlas Caryatids. */
function raCaryatidChedi(cx,y0,cz,wBase,hTot,o){
 o=o||{};
 const upper=o.style==='upper-ria';
 const mk=upper?'silver':'gold',col=P(mk);
 const plMk=upper?'porphyry':'paving',plCol=P(plMk);
 const drumMk=upper?'ebony':'cobalt',drumCol=P(drumMk);
 svNoWalk(()=>{
  const hPl=hTot*.1,hCar=hTot*.14,hRab=hTot*.22,hBell=hTot*.28,hSp=hTot*.26;
  box(plMk,cx,y0+.01,cz,wBase,hPl*.62,wBase,plCol);
  box('alabaster',cx,y0+.01+hPl*.62,cz,wBase*.92,hPl*.38,wBase*.92,P('alabaster'));
  const yK=y0+.01+hPl,wDrum=wBase*.74;
  box(drumMk,cx,yK,cz,wDrum,hCar,wDrum,drumCol);
  /* 12 polychrome yaksha / garuda atlas caryatids (3 along each face) supporting the overhanging golden cornice! */
  for(let side=0;side<4;side++){
   const a=side*PI/2;
   W(cx,yK,cz,a,()=>{
    const zF=wDrum*.5+.09;
    for(let j=-1;j<=1;j++){
     const gx=j*wDrum*.31;
     const tunicMk=(side+j+2)%3===0?'emerald':(side+j+2)%3===1?'crimson':'saffron';
     box('alabaster',gx,0,zF,.24,hCar*.16,.22,P('alabaster'));
     cyl(tunicMk,gx,hCar*.16,zF,.11,hCar*.46,P(tunicMk),8,.095);
     sph('gold',gx,hCar*.68,zF,.075,P('gold'),1,8);
     cone(mk,gx,hCar*.74,zF,.055,hCar*.2,col,6);
     /* Raised golden atlas arms supporting the lotus cornice above */
     for(const ax of [-.11,.11]){
      beam('gold',[gx+ax*.6,hCar*.52,zF],[gx+ax,hCar*.96,zF+.03],.032,P('gold'),true,6);
     }
    }
   });
  }
  /* Indented-square rabam cornice tiers + bell dome + ringed spire */
  const yR=yK+hCar;
  for(let t=0;t<3;t++){
   const f0=t/3,f1=(t+1)/3,wt=lerp(wBase*.88,wBase*.62,f0),th=(hRab/3)*.96;
   box(t===1?(upper?'porphyry':'emerald'):mk,cx,yR+hRab*f0,cz,wt,th,wt,P(t===1?(upper?'porphyry':'emerald'):mk));
  }
  const yB=yR+hRab,rB=wBase*.28;
  lathe(mk,cx,cz,[
   [rB*1.06,yB],
   [rB*.96,yB+hBell*.35],
   [rB*.56,yB+hBell*.76],
   [rB*.28,yB+hBell]
  ],16,col,{uv:'cone'});
  const yS=yB+hBell;
  box('gold',cx,yS,cz,rB*.64,hSp*.14,rB*.64,P('gold'));
  lathe('gold',cx,cz,[
   [rB*.26,yS+hSp*.14],
   [rB*.14,yS+hSp*.62],
   [.03,yS+hSp]
  ],12,P('gold'),{uv:'cone'});
 });
 raWallBlock(cx,y0,cz,wBase*.92,Math.min(4.2,hTot*.45),wBase*.92,0);
 return y0+hTot;
}

/* Pyramidal Multi-Tier Gilded / Indigo-Slate Mondop Scripture Roof + 7-Ring Pinnacle Spire (with solid ceiling slab). */
function raMondopSpireRoof(cx,y0,cz,w,d,tiers,hSpire,o){
 o=o||{};
 return raTieredRoof(cx,y0,cz,w,d,tiers||5,Object.assign({
  mode:'hip',over:.7,stepIn:.75,neckH:.42,spire:true,spireH:hSpire==null?5.8:hSpire
 },o));
}

/* Battered Egyptian/Rattanakosin Mosaic Pylon-Pediment Sacred Precinct Portal (Bussabok Gate, ref 20260202_142016.jpg). */
function raBussabokPortal(cx,y0,cz,yaw,wOpen,hOpen,o){
 o=o||{};
 const upper=o.style==='upper-ria',dG=o.d==null?1.55:o.d,jW=1.28;
 const baseMk='alabaster',baseCol=P(baseMk);
 const mosMk=upper?'porphyry':'cobalt',mosCol=P(mosMk);
 const trimMk=upper?'silver':'gold',trimCol=P(trimMk);
 const hBase=1.08,hJamb=hOpen+1.15;
 W(cx,y0,cz,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const bx=s*(wOpen*.5+jW*.52);
    /* Stepped white redented masonry cheek-bases flanking the threshold */
    box(baseMk,bx,.008,0,jW+.34,hBase*.46,dG+.36,baseCol);
    box(mosMk,bx,.008+hBase*.46,0,jW+.22,hBase*.22,dG+.24,mosCol);
    box(baseMk,bx,.008+hBase*.68,0,jW+.12,hBase*.32,dG+.14,baseCol);
    /* Inward-battered 4-tier gilded & cobalt/porphyry mosaic pylon jambs */
    const nT=4,yJ0=.008+hBase,jRise=hJamb-hBase;
    for(let i=0;i<nT;i++){
     const f0=i/nT,f1=(i+1)/nT,sc=lerp(1,.74,(f0+f1)*.5);
     const xIn=bx-s*(1-sc)*jW*.28;
     const ya=yJ0+jRise*f0,yh=(jRise/nT);
     box(mosMk,xIn,ya,0,jW*sc,yh*.78,dG*sc,mosCol);
     box(trimMk,xIn,ya+yh*.78,0,jW*sc+.05,yh*.22,dG*sc+.05,trimCol);
    }
    /* Flaring gilded kanok flame-wings at outer foot of battered jambs */
    for(const sz of [-1,1]){
     const zF=sz*(dG*.42);
     poly(trimMk,[[bx+s*(jW*.48),yJ0+.08,zF],[bx+s*(jW*.86),yJ0+.78,zF],[bx+s*(jW*.38),yJ0+1.12,zF]],trimCol,true);
    }
   }
   /* Deep vermilion-and-gold coffered lintel & soffit spanning the portal passage */
   box(mosMk,0,hOpen+.14,0,wOpen+jW*1.85,hJamb-hOpen-.14,dG*.84,mosCol);
   box(trimMk,0,hJamb,0,wOpen+jW*2.0,.18,dG*.94,trimCol);
  });
  raCeilingSlab(0,hOpen+.04,0,wOpen+.32,dG-.14,{mk:'crimson',trimMk});
  if(o.door!==false){
   raDoor(0,0,0,0,wOpen,hOpen,{
    t:dG*.55,style:o.style,frameMk:trimMk,crownMk:trimMk,leafMk:upper?'gold':'gold',
    pediment:false,name:o.name||'bussabok-gate-door'
   });
  }else{
   wkPad(0,0,wOpen+.3,dG+1.1,0);
  }
  for(const s of [-1,1]){
   raWallBlock(s*(wOpen*.5+jW*.55),0,0,jW+.2,hJamb,dG+.2,0);
  }
  /* Tiered gilded Bussabok pediment & pinnacle spire crowning the battered portal */
  raTieredRoof(0,hJamb+.18,0,wOpen+jW*1.9,dG+.42,3,{
   style:o.style,mode:'gable',gableAxis:'z',mk:upper?'indigoslate':'giltroof',
   trimMk,soffitMk:'crimson',neckMk:mosMk,over:.42,tierRise:.78,neckH:.3,stepIn:.74,
   ceiling:false,spire:true,spireH:2.85
  });
 });
 return y0+hJamb+5.6;
}

/* Pale-limestone / alabaster Spear-Bearing Kinnara-Thep Guardian Statue on sculpted beast pedestal (ref 20260202_132923.jpg). */
function raGuardianStatue(x,y0,z,yaw,sc,upper){
 sc=sc==null?1:sc;
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   const pMk=upper?'porphyry':'cobalt',stMk='alabaster',mMk=upper?'silver':'gold';
   /* Moulded pedestal + sculpted crouching mythic guardian-lion relief */
   box(pMk,0,.01,0,.92*sc,.34*sc,.92*sc,P(pMk));
   box('dolomite',0,.35*sc,0,.78*sc,.46*sc,.78*sc,P('dolomite'));
   ellip(mMk,0,.56*sc,.42*sc,.18*sc,.14*sc,.14*sc,P(mMk),0,8);
   box(stMk,0,.81*sc,0,.84*sc,.16*sc,.84*sc,P(stMk));
   /* Standing pale-stone guardian in pleated dynastic dhoti, armored collar & tall spire crown */
   const yF=.97*sc;
   cyl(stMk,0,yF,0,.22*sc,.68*sc,P(stMk),10,.18*sc);
   box(mMk,0,yF+.64*sc,0,.38*sc,.09*sc,.28*sc,P(mMk));
   cyl(stMk,0,yF+.73*sc,0,.17*sc,.52*sc,P(stMk),10,.21*sc);
   box(mMk,0,yF+1.16*sc,0,.48*sc,.1*sc,.28*sc,P(mMk));
   sph(stMk,0,yF+1.38*sc,0,.13*sc,P(stMk),1.1,10);
   cone(mMk,0,yF+1.48*sc,0,.11*sc,.42*sc,P(mMk),8);
   /* Ceremonial bronze/gold spear held vertically at right side */
   beam('bronze',[.26*sc,yF+.78*sc,.06*sc],[.32*sc,yF+.88*sc,.14*sc],.045*sc,P('bronze'),true,6);
   cyl('bronze',.33*sc,yF+.02*sc,.15*sc,.024*sc,2.08*sc,P('bronze'),8);
   cone(mMk,.33*sc,yF+2.1*sc,.15*sc,.052*sc,.28*sc,P(mMk),6);
  });
  raWallBlock(0,0,0,.88*sc,2.4*sc,.88*sc,0);
 });
}

/* 19. Chakri-Classical Triple-Prasat Grand Chancellery (ref 20260202_142701.jpg) */
defBuilding({
 key:'ra_west_chakri_chancellery',
 name:'Chakri-Classical Triple-Prasat Grand Chancellery',
 seed:7119,w:36,d:24,h:25.8,budget:138000,cut:true,
 front:{x:0,z:11.0,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['civic'],role:'chancellery',job:'customs'},
 build(){
  const y1=raPlinth(29.6,15.6,1.35,{
   style:'lower-ria',baseMk:'cobalt',midMk:'travertine',capMk:'travertine',topMk:'paving',
   stepW:4.2,stepRun:2.85,rail:'naga',railOpts:{scale:.92}
  });
  /* Forecourt avenue of 6 carved celadon lotus bowls with cloud-pruned bonsai topiaries */
  for(const ux of [-12.2,-8.0,-4.0,4.0,8.0,12.2]){
   raTopiaryUrn(ux,0,9.8,.95,false);
  }

  /* Ground-floor rusticated Classical travertine round-arch loggias + central hexastyle portico */
  const gh=4.2,y2=y1+gh;
  raArcade(-13.2,7.1,-3.3,7.1,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.56});
  raArcade(3.3,7.1,13.2,7.1,y1,gh,{style:'lower-ria',bays:3,mk:'travertine',trimMk:'cobalt',pierW:.56});
  raColonnade(-2.9,7.3,2.9,7.3,y1,gh,{style:'lower-ria',n:4,skipMid:1.25,mk:'travertine',friezeMk:'cobalt',r:.24,block:false});
  raCeilingSlab(0,y2-.14,5.85,27.0,2.5,{mk:'teak',trimMk:'gold'});

  /* Three-wing ground chancellery shell [-13.4..13.4, -7.2..4.6] */
  raWallRing(-13.4,-7.2,13.4,4.6,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-8.6,w:1.6,h:2.45,door:true,name:'chakri-west-registry-door'},
     {at:-4.6,w:1.3,h:1.7,y:1.05,pediment:true},
     {at:0,w:2.3,h:2.85,door:true,name:'chakri-grand-portal'},
     {at:4.6,w:1.3,h:1.7,y:1.05,pediment:true},
     {at:8.6,w:1.6,h:2.45,door:true,name:'chakri-east-customs-door'}
    ],
    n:[{at:-8.4,w:1.35,h:1.7,y:1.05},{at:0,w:1.6,h:1.85,y:1.05,pediment:true},{at:8.4,w:1.35,h:1.7,y:1.05}],
    e:[{at:-1.3,w:1.4,h:1.7,y:1.05,pediment:true}],
    w:[{at:-1.3,w:1.4,h:1.7,y:1.05,pediment:true}]
   }
  });
  for(const ix of [-5.4,5.4]){
   raWall(ix,-6.7,ix,4.1,y1,gh,{
    style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'emerald',
    holes:[{at:5.4,w:1.9,h:2.55,door:true,open:true}]
   });
  }

  /* Interior East-wing Classical stone stair climbing from y1 (1.35) to piano-nobile y2 (5.55) */
  const st=svStair(9.6,-5.2,y1,y2,0,{w:1.35,riser:.18,going:.27,mk:'travertine',smk:'gold',col:P('travertine'),scol:P('gold'),rail:'both'});
  raFloorSlab(0,y2,-1.3,26.4,11.4,{mk:'mosaic',th:.2,hole:st});
  raCeilingSlab(0,y2-.26,-1.3,10.2,11.0,{mk:'teak',trimMk:'gold'});
  raCeilingSlab(-9.4,y2-.26,-1.3,7.2,11.0,{mk:'teak',trimMk:'gold'});

  /* Piano-Nobile Classical Pilaster & Arched Window Gallery [-12.8..12.8, -6.6..4.2] */
  const uh=3.85,yRoof=y2+uh;
  raWallRing(-12.8,-6.6,12.8,4.2,y2,uh,{
   style:'lower-ria',mk:'travertine',socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-9.4,w:1.3,h:1.7,y:.95,pediment:true},
     {at:-5.8,w:1.25,h:1.65,y:.95,pediment:true},
     {at:0,w:1.9,h:2.45,door:true,name:'chakri-portico-door'},
     {at:5.8,w:1.25,h:1.65,y:.95,pediment:true},
     {at:9.4,w:1.3,h:1.7,y:.95,pediment:true}
    ],
    n:[{at:-8.2,w:1.3,h:1.6,y:.95},{at:0,w:1.5,h:1.7,y:.95,pediment:true},{at:8.2,w:1.3,h:1.6,y:.95}],
    e:[{at:-1.2,w:1.3,h:1.65,y:.95,pediment:true}],
    w:[{at:-1.2,w:1.3,h:1.65,y:.95,pediment:true}]
   }
  });
  svNoWalk(()=>{
   /* Engaged Classical fluted pilasters & gilded capitals articulating the piano-nobile facade */
   for(const px of [-11.4,-7.6,-3.8,3.8,7.6,11.4]){
    box('alabaster',px,y2+.48,4.46,.32,uh-.78,.08,P('alabaster'));
    box('gold',px,y2+uh-.3,4.48,.42,.14,.11,P('gold'));
   }
  });

  /* Projecting Piano-Nobile Classical Hexastyle Portico & Balustraded Balcony */
  raFloorSlab(0,y2,5.8,6.4,3.0,{mk:'travertine',th:.18});
  raClassicalBalustrade(-3.0,7.22,3.0,7.22,y2,{style:'lower-ria',mk:'travertine',trimMk:'gold',skipMid:1.2});
  raColonnade(-2.9,7.15,2.9,7.15,y2,uh-.12,{style:'lower-ria',n:4,skipMid:1.25,mk:'travertine',friezeMk:'cobalt',r:.22,block:false});
  raCeilingSlab(0,yRoof-.1,5.75,6.0,2.8,{mk:'travertine',trimMk:'gold'});
  raClassicalPediment(0,yRoof-.06,5.9,0,6.6,1.42,2.9,{style:'lower-ria',mk:'travertine',tymMk:'cobalt'});

  /* 50/50 TRIPLE-PRASAT CROWN: Classical Balustrade Linking Decks + Twin Corner Prasats + Elevated Central Sovereign Prasat! */
  for(const lx of [-5.5,5.5]){
   raFlatTerraceRoof(lx,yRoof,-1.2,3.2,10.8,{
    style:'lower-ria',mk:'travertine',topMk:'mosaic',soffitMk:'teak',trimMk:'gold',parapet:'balustrade',skip:'ew'
   });
  }
  for(const sx of [-9.9,9.9]){
   raTieredRoof(sx,yRoof,-1.2,5.8,11.0,3,{
    style:'lower-ria',mode:'hip',mk:'celadon',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
    over:.58,tierRise:.96,neckH:.4,stepIn:.76,spire:true,spireH:4.4
   });
  }
  raCeilingSlab(0,yRoof+.02,-1.2,7.8,10.6,{mk:'teak',trimMk:'gold'});
  svNoWalk(()=>{
   box('cobalt',0,yRoof+.12,-1.2,8.2,.36,11.0,P('cobalt'));
   box('gold',0,yRoof+.48,-1.2,8.36,.1,11.16,P('gold'));
  });
  raTieredRoof(0,yRoof+.58,-1.2,8.2,11.0,4,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.7,tierRise:1.08,neckH:.44,stepIn:.76,ceiling:false,spire:true,spireH:5.8
  });

  raTarget(0,y1,5.8,'chancellery-ground-arcade',true);
  raTarget(0,y1,-1.3,'grand-chancellery-hall',true);
  raTarget(-9.4,y1,-1.3,'west-seal-registry',true);
  raTarget(9.4,y1,1.6,'east-customs-chamber',true);
  raTarget(0,y2,-1.2,'piano-nobile-throne-gallery',true);
  raTarget(0,y2,5.8,'hexastyle-portico-terrace',true);

  raFurnList([
   ['ria_sovereign_throne',0,y1,-4.8,0],
   ['ria_uktena_brazier',-2.4,y1,-3.6,0],
   ['ria_uktena_brazier',2.4,y1,-3.6,0],
   ['ria_amber_seal_desk',-9.6,y1,-3.4,0],
   ['ria_amber_seal_desk',-9.6,y1,.4,PI],
   ['ria_tribute_chest',-11.6,y1,-5.4,PI/2],
   ['ria_amber_seal_desk',8.2,y1,1.8,PI],
   ['ria_sovereign_throne',0,y2,-4.4,0],
   ['ria_porphyry_table',-7.8,y2,-1.4,0],
   ['ria_silk_screen',-3.0,y2,-4.8,.22],
   ['ria_silk_screen',3.0,y2,-4.8,-.22],
   ['ria_lantern_stand',-3.4,y1,2.6,0],
   ['ria_lantern_stand',3.4,y1,2.6,0]
  ]);
 }
});

/* 20. Peripteral Gilded-Mosaic Mondop Scripture Library (ref 20260202_141535.jpg) */
defBuilding({
 key:'ra_west_mondop_library',
 name:'Peripteral Gilded-Mosaic Mondop Scripture Library',
 seed:7120,w:24,d:24,h:25.0,budget:128000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['religious','civic'],role:'library',job:'scribing'},
 build(){
  /* Two-stage veined grey-marble & alabaster stepped stylobate with pierced fretwork balustrades */
  const yT1=.95,yT2=1.85;
  raNoCut(()=>svNoWalk(()=>{
   box('cobalt',0,0,-.4,19.4,.44,19.0,P('cobalt'));
   box('alabaster',0,.44,-.4,19.0,.42,18.6,P('alabaster'));
   box('emerald',0,yT1,-.4,14.8,.42,14.4,P('emerald'));
   box('alabaster',0,yT1+.42,-.4,14.5,.38,14.1,P('alabaster'));
  }));
  raFloorSlab(0,yT1,-.4,18.8,18.4,{mk:'paving',th:.1});
  raFloorSlab(0,yT2,-.4,14.2,13.8,{mk:'mosaic',th:.1});

  raGrandStair(0,0,10.8,0,yT1,8.7,3.4,{mk:'alabaster',sideMk:'cobalt',rail:'naga',railOpts:{scale:.86}});
  raGrandStair(0,yT1,8.2,0,yT2,6.4,3.0,{mk:'alabaster',sideMk:'emerald',rail:'naga',railOpts:{scale:.72}});

  raPiercedFretWall(-9.1,8.55,9.1,8.55,yT1,{style:'lower-ria',skipMid:2.15,block:true});
  raPiercedFretWall(9.1,-9.35,-9.1,-9.35,yT1,{style:'lower-ria',block:true});
  raPiercedFretWall(9.1,8.25,9.1,-9.05,yT1,{style:'lower-ria',block:true});
  raPiercedFretWall(-9.1,-9.05,-9.1,8.25,yT1,{style:'lower-ria',block:true});
  for(const sx of [-8.0,8.0])for(const sz of [-8.0,7.2]){
   raTopiaryUrn(sx,yT1,sz,.78,false);
  }

  /* Peripteral forest of 20 tall slender golden-and-emerald square mosaic columns (6x6 perimeter) */
  const colH=5.15,yRoof=yT2+colH;
  const xs=[-6.2,-3.7,-1.4,1.4,3.7,6.2],zs=[-6.5,-4.0,-1.6,.8,3.2,5.7];
  for(let ix=0;ix<xs.length;ix++){
   for(let iz=0;iz<zs.length;iz++){
    if(ix>0&&ix<xs.length-1&&iz>0&&iz<zs.length-1)continue;
    raMosaicSquareCol(xs[ix],yT2,zs[iz],colH,{style:'lower-ria',mk:'gold',inlayMk:'emerald',baseMk:'alabaster',w:.42,block:false});
   }
  }

  /* Square golden-and-cobalt diamond-trellis scripture cella [-4.1..4.1, -4.5..3.7] */
  raWallRing(-4.1,-4.5,4.1,3.7,yT2,colH,{
   style:'lower-ria',mk:'cobalt',socMk:'alabaster',dadoMk:'gold',postMk:'gold',cornice:false,
   holes:{
    s:[{at:0,w:1.95,h:2.75,door:true,frameMk:'gold',crownMk:'gold',leafMk:'crimson',name:'mondop-south-door'}],
    n:[{at:0,w:1.65,h:2.45,door:true,frameMk:'gold',crownMk:'gold',leafMk:'crimson',name:'mondop-north-door'}],
    e:[{at:-.4,w:1.25,h:1.85,y:1.15,pediment:true,frameMk:'gold',crownMk:'gold'}],
    w:[{at:-.4,w:1.25,h:1.85,y:1.15,pediment:true,frameMk:'gold',crownMk:'gold'}]
   }
  });
  svNoWalk(()=>{
   /* Embossed golden diamond-lattice strips stepped +3.5 cm proud of the cobalt cella walls */
   for(const sz of [-4.76,3.96]){
    for(const gx of [-2.6,2.6]){
     box('gold',gx,yT2+1.25,sz,.14,3.2,.04,P('gold'));
     box('emerald',gx,yT2+2.65,sz,.32,.32,.06,P('emerald'),0,0,PI/4);
    }
   }
   /* Central gilded-and-silver Tripitaka / Amber-Seal scripture reliquary cabinet inside cella */
   box('alabaster',0,yT2+.01,-.4,2.1,.34,2.1,P('alabaster'));
   box('gold',0,yT2+.35,-.4,1.65,1.95,1.65,P('gold'));
   box('emerald',0,yT2+2.3,-.4,1.82,.18,1.82,P('emerald'));
   cone('gold',0,yT2+2.48,-.4,.68,1.45,P('gold'),8);
  });
  raWallBlock(0,yT2,-.4,1.9,2.8,1.9,0);

  /* Soaring 5-Tier Pyramidal Gilded Mondop Roof + 7-Ring Pinnacle Spire covering cella & peristyle */
  raMondopSpireRoof(0,yRoof,-.4,13.4,13.0,5,6.2,{
   style:'lower-ria',mk:'giltroof',trimMk:'gold',soffitMk:'teak',neckMk:'emerald',tierRise:1.12
  });

  raTarget(0,yT1,7.2,'lower-marble-terrace',false);
  raTarget(0,yT2,4.8,'mondop-south-peristyle',true);
  raTarget(-5.2,yT2,-.4,'mondop-west-peristyle',true);
  raTarget(5.2,yT2,-.4,'mondop-east-peristyle',true);
  raTarget(0,yT2,1.9,'mondop-scripture-cella',true);

  raFurnList([
   ['ria_amber_seal_desk',-2.3,yT2,1.6,0],
   ['ria_amber_seal_desk',2.3,yT2,1.6,0],
   ['ria_uktena_brazier',-2.3,yT2,-2.4,0],
   ['ria_uktena_brazier',2.3,yT2,-2.4,0],
   ['ria_tribute_chest',-2.6,yT2,-.4,PI/2],
   ['ria_tribute_chest',2.6,yT2,-.4,-PI/2],
   ['ria_lantern_stand',-2.6,yT2,4.9,0],
   ['ria_lantern_stand',2.6,yT2,4.9,0]
  ]);
 }
});

/* 21. Celadon Porcelain Phra-Prang and Caryatid Chedi Sacred Terrace (refs 20260202_133747.jpg & 20260202_133726.jpg) */
defBuilding({
 key:'ra_west_celadon_prang_terrace',
 name:'Celadon Porcelain Phra-Prang and Caryatid Chedi Sacred Terrace',
 seed:7121,w:28,d:24,h:24.5,budget:134000,cut:true,
 front:{x:0,z:10.9,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['religious','funerary'],role:'reliquary',job:'worship'},
 build(){
  /* Elevated veined grey-marble terrace enclosed by pierced stone fretwork balustrades & corner lanterns */
  const y1=1.35;
  raNoCut(()=>svNoWalk(()=>{
   box('celadon',0,0,-.6,23.8,.52,18.2,P('celadon'));
   box('alabaster',0,.52,-.6,23.4,.74,17.8,P('alabaster'));
  }));
  raFloorSlab(0,y1,-.6,23.2,17.6,{mk:'paving',th:.1});
  raGrandStair(0,0,10.8,0,y1,8.1,3.4,{mk:'alabaster',sideMk:'celadon',rail:'naga',railOpts:{scale:.85}});

  raPiercedFretWall(-11.3,7.95,11.3,7.95,y1,{style:'lower-ria',skipMid:2.15,block:true});
  raPiercedFretWall(11.3,-9.15,-11.3,-9.15,y1,{style:'lower-ria',block:true});
  raPiercedFretWall(11.3,7.65,11.3,-8.85,y1,{style:'lower-ria',block:true});
  raPiercedFretWall(-11.3,-8.85,-11.3,7.65,y1,{style:'lower-ria',block:true});

  /* West Monument: Walkable Celadon-and-White Floral Porcelain Phra-Prang Reliquary Tower (ref 133747) */
  const prH=4.1;
  raWallRing(-9.4,-5.4,-3.4,.6,y1,prH,{
   style:'lower-ria',mk:'alabaster',socMk:'celadon',dadoMk:'saffron',postMk:'celadon',
   holes:{s:[{at:-6.4,w:1.7,h:2.45,door:true,frameMk:'gold',crownMk:'gold',name:'celadon-prang-door'}]}
  });
  raCeilingSlab(-6.4,y1+prH+.02,-2.4,5.6,5.6,{mk:'teak',trimMk:'gold'});
  raPorcelainPrang(-6.4,y1+prH+.12,-2.4,6.2,16.4,{
   style:'lower-ria',mk:'alabaster',bandMk:'celadon',accMk:'saffron',trimMk:'gold',vault:true,openFront:true
  });

  /* Center Monument: Indented-Square Golden Phra-Chedi supported by 12 Polychrome Atlas Caryatids (ref 133726) */
  raCaryatidChedi(0,y1,1.6,3.8,11.8,{style:'lower-ria'});

  /* East Monument: Classical Fluted-Column Offering Sanctuary with Terracotta & Emerald Glazed Roof (ref 133726) */
  const vhH=3.85;
  raColonnade(3.8,2.6,9.4,2.6,y1,vhH,{style:'lower-ria',n:4,skipMid:1.15,mk:'alabaster',friezeMk:'celadon',r:.21,block:false});
  raCeilingSlab(6.6,y1+vhH-.08,1.7,5.8,1.8,{mk:'teak',trimMk:'gold'});
  raWallRing(3.6,-6.4,9.6,.8,y1,vhH,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'celadon',dadoMk:'gold',postMk:'travertine',
   holes:{
    s:[{at:6.6,w:1.75,h:2.4,door:true,name:'terrace-sanctuary-door'}],
    e:[{at:-2.8,w:1.25,h:1.6,y:1.0,pediment:true}],
    w:[{at:-2.8,w:1.25,h:1.6,y:1.0,pediment:true}]
   }
  });
  raTieredRoof(6.6,y1+vhH,-2.2,6.4,9.0,3,{
   style:'lower-ria',mode:'gable',gableAxis:'z',mk:'terracotta',trimMk:'emerald',soffitMk:'teak',neckMk:'gold',
   over:.62,tierRise:1.04
  });

  raTopiaryUrn(-9.6,y1,5.8,.82,false);
  raTopiaryUrn(9.6,y1,5.8,.82,false);

  raTarget(0,y1,5.8,'sacred-marble-terrace',false);
  raTarget(-6.4,y1,-2.4,'celadon-prang-reliquary',true);
  raTarget(6.6,y1,1.7,'sanctuary-portico',true);
  raTarget(6.6,y1,-2.8,'offering-sanctuary-hall',true);

  raFurnList([
   ['ria_lotus_altar',-6.4,y1,-3.9,0],
   ['ria_uktena_brazier',-7.8,y1,-1.4,0],
   ['ria_lotus_altar',6.6,y1,-4.8,0],
   ['ria_saffron_cushion',5.4,y1,-2.6,0],
   ['ria_saffron_cushion',7.8,y1,-2.6,0],
   ['ria_offering_basin',-2.8,y1,4.8,0],
   ['ria_offering_basin',2.8,y1,4.8,0],
   ['ria_lantern_stand',-3.4,y1,-.8,0],
   ['ria_lantern_stand',3.0,y1,-.8,0]
  ]);
 }
});

/* 22. Battered Pylon-Pediment Precinct Gate and Lustral Shrine (ref 20260202_142016.jpg) */
defBuilding({
 key:'ra_west_bussabok_gate',
 name:'Battered Pylon-Pediment Precinct Gate and Lustral Shrine',
 seed:7122,w:26,d:20,h:19.5,budget:120000,cut:true,
 front:{x:0,z:8.8,yaw:0},
 tags:{style:'lower-ria',wealth:'rich',types:['religious','infrastructure'],role:'precinct-gate',job:'worship'},
 build(){
  const y1=.85;
  raNoCut(()=>svNoWalk(()=>{
   box('cobalt',0,0,-1.2,22.8,.42,14.0,P('cobalt'));
   box('alabaster',0,.42,-1.2,22.5,.36,13.7,P('alabaster'));
  }));
  raFloorSlab(0,y1,-1.2,22.2,13.4,{mk:'paving',th:.1});
  raGrandStair(0,0,8.6,0,y1,5.4,3.1,{mk:'alabaster',sideMk:'alabaster',cheek:false});

  /* Centerpiece Battered Mosaic Bussabok Pylon-Portal + Pierced Precinct Curtain Wall + Corner Bastion Pylons */
  raBussabokPortal(0,y1,5.0,0,2.25,2.85,{style:'lower-ria',d:1.55,door:true,name:'bussabok-portal-door'});
  for(const s of [-1,1]){
   const wx0=s<0?-9.2:2.7,wx1=s<0?-2.7:9.2;
   svNoWalk(()=>{
    box('alabaster',(wx0+wx1)*.5,y1+.01,5.0,Math.abs(wx1-wx0),1.15,.52,P('alabaster'));
    box('cobalt',(wx0+wx1)*.5,y1+1.16,5.0,Math.abs(wx1-wx0)+.06,.16,.56,P('cobalt'));
   });
   raPiercedFretWall(wx0,5.0,wx1,5.0,y1+1.32,{style:'lower-ria',h:1.25,t:.34});
   raWallBlock((wx0+wx1)*.5,y1,5.0,Math.abs(wx1-wx0),2.6,.54,0);
   raBatteredPylon(s*10.1,5.0,2.2,2.2,y1,4.8,{style:'lower-ria',mk:'cobalt',bandMk:'saffron',relMk:'alabaster'});
  }
  raPiercedFretWall(10.8,3.6,10.8,-7.6,y1,{style:'lower-ria',block:true});
  raPiercedFretWall(-10.8,-7.6,-10.8,3.6,y1,{style:'lower-ria',block:true});
  raPiercedFretWall(10.8,-7.6,-10.8,-7.6,y1,{style:'lower-ria',block:true});

  /* Twin sacred lotus lustral basins & bonsai urns in the inner precinct court */
  raWaterCourt(-6.8,1.9,4.6,2.8,y1+.3,.42,{style:'lower-ria',curbMk:'alabaster',trimMk:'emerald',lotus:4});
  raWaterCourt(6.8,1.9,4.6,2.8,y1+.3,.42,{style:'lower-ria',curbMk:'alabaster',trimMk:'emerald',lotus:4});
  raTopiaryUrn(-3.6,y1,2.2,.8,false);
  raTopiaryUrn(3.6,y1,2.2,.8,false);

  /* Rear Classical-Travertine & Emerald-Roofed Precinct Keeper's Shrine [-6.8..6.8, -7.2..-1.4] */
  const gh=3.85;
  raColonnade(-6.2,-.4,6.2,-.4,y1,gh,{style:'lower-ria',n:6,skipMid:1.45,mk:'travertine',friezeMk:'cobalt',r:.21,block:false});
  raCeilingSlab(0,y1+gh-.08,-.9,13.0,1.2,{mk:'teak',trimMk:'gold'});
  raWallRing(-6.8,-7.2,6.8,-1.4,y1,gh,{
   style:'lower-ria',mk:'plaster',col:P('plasterCream'),socMk:'cobalt',dadoMk:'saffron',postMk:'travertine',
   holes:{
    s:[
     {at:-3.8,w:1.2,h:1.55,y:1.0,pediment:true},
     {at:0,w:1.85,h:2.45,door:true,name:'lustral-shrine-door'},
     {at:3.8,w:1.2,h:1.55,y:1.0,pediment:true}
    ],
    e:[{at:-4.3,w:1.2,h:1.5,y:1.0,pediment:true}],
    w:[{at:-4.3,w:1.2,h:1.5,y:1.0,pediment:true}]
   }
  });
  raTieredRoof(0,y1+gh,-4.3,14.0,6.4,3,{
   style:'lower-ria',mode:'gable',gableAxis:'x',mk:'emerald',trimMk:'gold',soffitMk:'teak',neckMk:'crimson',
   over:.64,tierRise:1.04
  });

  raTarget(0,y1,5.0,'bussabok-portal-passage',true);
  raTarget(0,y1,1.8,'lustral-precinct-court',false);
  raTarget(0,y1,-.9,'shrine-colonnade',true);
  raTarget(0,y1,-4.3,'lustral-keeper-shrine',true);

  raFurnList([
   ['ria_lotus_altar',0,y1,-5.6,0],
   ['ria_uktena_brazier',-2.4,y1,-4.2,0],
   ['ria_uktena_brazier',2.4,y1,-4.2,0],
   ['ria_saffron_cushion',-1.4,y1,-2.8,0],
   ['ria_saffron_cushion',1.4,y1,-2.8,0],
   ['ria_tribute_chest',-5.0,y1,-5.4,PI/2],
   ['ria_offering_basin',-3.4,y1,.4,0],
   ['ria_lantern_stand',3.4,y1,.4,0]
  ]);
 }
});
