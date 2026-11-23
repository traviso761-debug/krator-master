// prefix: ra
// ================================================================= SOUTHEAST ASIAN & DYNASTIC CROWNS, SPIRES, DOMES & EMBLEMS
// Implements Lower Ria (Prasat, Pyatthat, Khmer-Thai glazed Prang, 5-Headed Uktena Naga) and Upper Ria (Lanna white-dolomite
// & indigo-slate Prasat roofs, Angkor-Bagan Shikhara-Prang, upturned ribbed Lotus Dome, Silver-Bronze Hongsa Water-Swan, and
// Compass-Hills Lodestone Obelisks).
// CRITICAL CEILING GUARANTEE:
//   - Every pitched/tiered roof emits a solid underside ceiling/soffit slab (svNoWalk box) on every tier so looking up from
//     inside NEVER leaks sky.
//   - Every conical/domed lathe roof, prang or lotus dome over an interior space emits an explicit {inward: true} ceiling
//     vault soffit >= 5 cm inside closing cleanly to r = 0.01!

/* Western Dynasty Emblem: Sculpted 5-Headed Gilded Uktena River-Serpent fan hood at stair/barge prows. */
function raNagaHead5(x,y,z,yaw,sc){
 sc=sc==null?1:sc;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Flared emerald-and-gold naga hood shield */
   cyl('cobalt',0,0,0,.28*sc,.24*sc,P('cobalt'),10);
   ellip('emerald',0,.58*sc,.04*sc,.54*sc,.46*sc,.14*sc,P('emerald'),0,12);
   /* Five rearing gilded serpent necks & flame-crests */
   for(let i=-2;i<=2;i++){
    const ang=i*.28,hx=Math.sin(ang)*.42*sc,hy=(.68+(2-Math.abs(i))*.14)*sc,hz=(.12+(2-Math.abs(i))*.05)*sc;
    beam('gold',[i*.08*sc,.28*sc,.04*sc],[hx,hy,hz],.065*sc,P('gold'),true,8,.05*sc);
    sph('gold',hx,hy+.04*sc,hz+.05*sc,.075*sc,P('gold'),.85,8);
    cone('gold',hx,hy+.1*sc,hz+.02*sc,.042*sc,.22*sc,P('gold'),6);
   }
  });
 });
}

/* Pair of 5-Headed Uktena Naga balustrades flanking a stair flight from (x0,y0,z0) to (x1,y1,z1) of width w. */
function raNagaRail(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);if(run<.2)return;
 const yaw=Math.atan2(dx,dz),sc=o.scale==null?1:o.scale;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const sx=s*(w/2+.14);
    /* Undulating emerald-and-gold serpent body running down the stair cheek to the foot (+run/2 -> -run/2) */
    const nSeg=6;
    for(let i=0;i<nSeg;i++){
     const f0=i/nSeg,f1=(i+1)/nSeg;
     const za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const ya=lerp(y0+.52*sc,y1+.46*sc,f0)+Math.sin(f0*PI*3)*.06*sc;
     const yb=lerp(y0+.52*sc,y1+.46*sc,f1)+Math.sin(f1*PI*3)*.06*sc;
     beam('gold',[sx,ya,za],[sx,yb,zb],.095*sc,P('gold'),true,8);
     cone('emerald',sx,(ya+yb)*.5+.1*sc,(za+zb)*.5,.055*sc,.16*sc,P('emerald'),6);
    }
    /* Five-headed Uktena naga fan facing outward at the stair foot (-run/2 faces -z in climb frame -> yaw PI) */
    raNagaHead5(sx,y0+.22,(-run/2)-.12,PI,sc);
   }
  });
 });
}

/* Eastern Dynasty Emblem: Sculpted Silver-Bronze Crested Water-Swan (Hongsa) figurehead. */
function raHongsaSculpt(x,y,z,yaw,sc){
 sc=sc==null?1:sc;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('porphyry',0,0,0,.44*sc,.2*sc,.56*sc,P('porphyry'));
   /* Feathered silver-bronze breast & folded wings */
   ellip('silver',0,.46*sc,0,.26*sc,.24*sc,.38*sc,P('silver'),0,12);
   for(const s of [-1,1]){
    poly('silver',[[s*.24*sc,.44*sc,.12*sc],[s*.32*sc,.72*sc,-.32*sc],[s*.22*sc,.34*sc,-.34*sc]],P('silver'),true);
   }
   /* S-curved swan neck, crowned head & gilded beak */
   beam('silver',[0,.56*sc,.22*sc],[0,.98*sc,.32*sc],.075*sc,P('silver'),true,8,.055*sc);
   sph('silver',0,1.04*sc,.34*sc,.085*sc,P('silver'),.9,8);
   cone('gold',0,1.12*sc,.32*sc,.048*sc,.26*sc,P('gold'),6);
   beam('gold',[0,1.02*sc,.4*sc],[0,.98*sc,.58*sc],.035*sc,P('gold'),true,6,.012*sc);
  });
 });
}

/* Pair of Silver-Bronze Hongsa Water-Swan balustrades flanking an Eastern Dynasty stair flight. */
function raHongsaRail(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);if(run<.2)return;
 const yaw=Math.atan2(dx,dz),sc=o.scale==null?1:o.scale;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const sx=s*(w/2+.14);
    beam('alabaster',[sx,y0+.46*sc,-run/2],[sx,y1+.46*sc,run/2],.11*sc,P('alabaster'));
    beam('silver',[sx,y0+.58*sc,-run/2],[sx,y1+.58*sc,run/2],.055*sc,P('silver'),true,8);
    const nPlume=Math.max(3,Math.round(run/1.8));
    for(let i=1;i<nPlume;i++){
     const f=i/nPlume,zz=lerp(-run/2,run/2,f),yy=lerp(y0,y1,f)+.6*sc;
     cone('silver',sx,yy,zz,.055*sc,.22*sc,P('silver'),6);
    }
    raHongsaSculpt(sx,y0+.18,(-run/2)-.14,PI,sc*.95);
   }
  });
 });
}

/* Ridge / gable Hongsa or Chofa sky-tassel horn finial. */
function raSwanFinial(x,y,z,yaw,sc,upper){
 sc=sc==null?1:sc;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const mk=upper?'silver':'gold',col=P(mk);
   cyl(mk,0,0,0,.07*sc,.14*sc,col,8);
   beam(mk,[0,.12*sc,0],[0,.68*sc,.18*sc],.052*sc,col,true,6,.016*sc);
   if(upper){
    sph('silver',0,.34*sc,.08*sc,.085*sc,P('silver'),.85,8);
    cone('gold',0,.68*sc,.18*sc,.035*sc,.18*sc,P('gold'),6);
   }
  });
 });
}

/* Compass-Hills Lodestone-Capped Obelisk (lodestone = 220): cut red-porphyry & cream-dolomite shaft + dark magnetic pyramidion. */
function raLodestoneObelisk(x,y0,z,h,o){
 o=o||{};
 const w0=o.w==null?.86:o.w,pyrH=Math.max(.55,w0*.95),pedH=Math.min(1.1,h*.2),shH=Math.max(.8,h-pedH-pyrH);
 W(x,y0,z,o.yaw||0,()=>{
  svNoWalk(()=>{
   box('porphyry',0,0,0,w0*1.48,pedH*.52,w0*1.48,P('porphyry'));
   box('dolomite',0,pedH*.52,0,w0*1.24,pedH*.48,w0*1.24,P('dolomite'));
   /* Tapered stone obelisk shaft in 3 stepped ashlar courses + silver-bronze collar */
   box('porphyry',0,pedH,0,w0,shH*.44,w0,P('porphyry'));
   box('carve',0,pedH+shH*.44,0,w0*.9,shH*.14,w0*.9,P('carveWhite'));
   box('dolomite',0,pedH+shH*.58,0,w0*.8,shH*.42,w0*.8,P('dolomite'));
   const yCol=pedH+shH,topW=w0*.74,hw=topW/2;
   box('bronze',0,yCol,0,topW+.08,.1,topW+.08,P('bronze'));
   /* Magnetized black-metallic lodestone pyramidion cap (4 crisp triangular faces + solid base) */
   const yB=yCol+.1,yT=yB+pyrH;
   const A=[-hw,yB,-hw],B=[hw,yB,-hw],C=[hw,yB,hw],D=[-hw,yB,hw],PK=[0,yT,0];
   poly('lodestone',[D,C,PK],P('lodestone'));
   poly('lodestone',[C,B,PK],P('lodestone'));
   poly('lodestone',[B,A,PK],P('lodestone'));
   poly('lodestone',[A,D,PK],P('lodestone'));
   cyl('gold',0,yT-.04,0,.045,.26,P('gold'),6);
  });
 });
 if(o.block!==false&&h>=1.2)raWallBlock(x,y0,z,w0*1.3,h*.7,w0*1.3,o.yaw||0);
 return y0+h;
}

/* Multi-Tiered Thai Rattanakosin Prasat / Burmese Konbaung Pyatthat / Northern Lanna Indigo-Slate Roof!
   - Emits an explicit coffered interior ceiling slab at y0 (unless o.ceiling === false) PLUS a solid horizontal soffit slab
     under EVERY telescopic tier so looking up from inside or under the eaves NEVER shows transparent sky.
   - mode: 'gable' (steep Thai/Lanna carved *panlom* bargeboards + *chofa* horns) or 'hip' (Burmese *pyatthat* 4-way hipped tiers). */
function raTieredRoof(cx,y0,cz,w,d,tiers,o){
 o=o||{};
 const nT=Math.max(1,tiers||3),upper=o.style==='upper-ria',mode=o.mode||'gable';
 const mk=o.mk||(upper?'indigoslate':'celadon'),col=o.col==null?P(mk):o.col;
 const trimMk=o.trimMk||(upper?'alabaster':'gold'),trimCol=P(trimMk);
 const soffitMk=o.soffitMk||(upper?'dolomite':'teak'),soffitCol=P(soffitMk);
 const neckMk=o.neckMk||(upper?'dolomite':'crimson'),neckCol=P(neckMk);
 const over=o.over==null?.78:o.over,stepIn=o.stepIn==null?.76:o.stepIn;
 const tierRise=o.tierRise==null?Math.max(.95,Math.min(w,d)*.16):o.tierRise;
 const neckH=o.neckH==null?.46:o.neckH;

 if(o.ceiling!==false){
  raCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.12),Math.max(.4,d-.12),{
   mk:soffitMk,col:soffitCol,trimMk,trimCol
  });
 }

 let curY=y0+.11,curW=w+over*2,curD=d+over*2;
 W(cx,0,cz,o.yaw||0,()=>{
  svNoWalk(()=>{
   for(let t=0;t<nT;t++){
    const hw=curW/2,hd=curD/2,rH=tierRise*(t===nT-1?1.18:1);
    /* Solid horizontal underside soffit slab for this tier (guarantees 100% opaque eave & ceiling soffits!) */
    box(soffitMk,0,curY,0,curW-.06,.09,curD-.06,soffitCol);
    /* Perimeter gilded / alabaster eave fascia collar stepped 2 cm outside soffit */
    for(const sz of [-hd,hd])box(trimMk,0,curY+.02,sz,curW+.04,.09,.06,trimCol);
    for(const sx of [-hw+.04,hw-.04])box(trimMk,sx,curY+.02,0,.06,.09,curD-.12,trimCol);

    const yB=curY+.09,yT=yB+rH;
    const alongZ=o.gableAxis==='z'||(o.gableAxis!=='x'&&curD>=curW&&mode==='gable');

    if(mode==='hip'||t<nT-1&&o.hipLower){
     /* 4-way hipped tier (Burmese Pyatthat / tiered pavilion skirt) closing cleanly to next tier's neck footprint */
     const topFrac=t===nT-1?.14:stepIn*.82;
     const tw=hw*topFrac,td=hd*topFrac;
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     const A2=[-tw,yT,-td],B2=[tw,yT,-td],C2=[tw,yT,td],D2=[-tw,yT,td];
     poly(mk,[D,C,C2,D2],col);
     poly(mk,[C,B,B2,C2],col);
     poly(mk,[B,A,A2,B2],col);
     poly(mk,[A,D,D2,A2],col);
     if(t===nT-1)box(trimMk,0,yT,0,tw*2+.06,.08,td*2+.06,trimCol);
     /* Upturned corner flame/swan eave finials (hang hong / hnget-myat-na) */
     for(const sx of [-1,1])for(const sz of [-1,1]){
      const ca=Math.atan2(sx,sz);
      raSwanFinial(sx*(hw-.04),yB+.02,sz*(hd-.04),ca,.58,upper);
     }
    }else if(alongZ){
     /* Steep Thai / Lanna gable running along Z (front +z and back -z carved tympanums!) */
     const topX=t===nT-1?0:hw*stepIn*.76;
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     if(t===nT-1){
      const PN=[0,yT,-hd+.04],PS=[0,yT,hd-.04];
      poly(mk,[A,D,PS,PN],col);
      poly(mk,[C,B,PN,PS],col);
      /* Recessed carved gilt / white-alabaster gable tympanums (inset 8 cm inside hd -> zero coplanar overlap!) */
      poly('carve',[[-hw+.14,yB,hd-.08],[hw-.14,yB,hd-.08],[0,yT-.06,hd-.08]],P(upper?'carveWhite':'carvedGilt'));
      poly('carve',[[hw-.14,yB,-hd+.08],[-hw+.14,yB,-hd+.08],[0,yT-.06,-hd+.08]],P(upper?'carveWhite':'carvedGilt'));
      /* Projecting panlom bargeboard rafters + ridge beam + soaring chofa / hongsa finials */
      beam(trimMk,[0,yT+.05,-hd],[0,yT+.05,hd],.08,trimCol,false);
      for(const sz of [-1,1]){
       const zz=sz*(hd+.02);
       beam(trimMk,[-hw,yB+.04,zz],[0,yT+.08,zz],.09,trimCol,false);
       beam(trimMk,[hw,yB+.04,zz],[0,yT+.08,zz],.09,trimCol,false);
       raSwanFinial(0,yT+.08,zz,sz>0?0:PI,.95,upper);
       for(const sx of [-1,1])raSwanFinial(sx*hw,yB+.02,zz,sx>0?PI/2:-PI/2,.55,upper);
      }
     }else{
      poly(mk,[A,D,[-topX,yT,hd],[-topX,yT,-hd]],col);
      poly(mk,[C,B,[topX,yT,-hd],[topX,yT,hd]],col);
      poly(mk,[D,C,[topX,yT,hd],[-topX,yT,hd]],col);
      poly(mk,[B,A,[-topX,yT,-hd],[topX,yT,-hd]],col);
      for(const sx of [-1,1])for(const sz of [-1,1]){
       raSwanFinial(sx*hw,yB+.02,sz*hd,Math.atan2(sx,sz),.54,upper);
      }
     }
    }else{
     /* Steep Thai / Lanna gable running along X (east +x and west -x tympanums, broad front eave facing +z) */
     const topZ=t===nT-1?0:hd*stepIn*.76;
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     if(t===nT-1){
      const PW=[-hw+.04,yT,0],PE=[hw-.04,yT,0];
      poly(mk,[D,C,PE,PW],col);
      poly(mk,[B,A,PW,PE],col);
      poly('carve',[[hw-.08,yB,hd-.14],[hw-.08,yB,-hd+.14],[hw-.08,yT-.06,0]],P(upper?'carveWhite':'carvedGilt'));
      poly('carve',[[-hw+.08,yB,-hd+.14],[-hw+.08,yB,hd-.14],[-hw+.08,yT-.06,0]],P(upper?'carveWhite':'carvedGilt'));
      beam(trimMk,[-hw,yT+.05,0],[hw,yT+.05,0],.08,trimCol,false);
      for(const sx of [-1,1]){
       const xx=sx*(hw+.02);
       beam(trimMk,[xx,yB+.04,-hd],[xx,yT+.08,0],.09,trimCol,false);
       beam(trimMk,[xx,yB+.04,hd],[xx,yT+.08,0],.09,trimCol,false);
       raSwanFinial(xx,yT+.08,0,sx>0?PI/2:-PI/2,.95,upper);
       for(const sz of [-1,1])raSwanFinial(xx,yB+.02,sz*hd,sz>0?0:PI,.55,upper);
      }
     }else{
      poly(mk,[D,C,[hw,yT,topZ],[-hw,yT,topZ]],col);
      poly(mk,[B,A,[-hw,yT,-topZ],[hw,yT,-topZ]],col);
      poly(mk,[A,D,[-hw,yT,topZ],[-hw,yT,-topZ]],col);
      poly(mk,[C,B,[hw,yT,-topZ],[hw,yT,topZ]],col);
      for(const sx of [-1,1])for(const sz of [-1,1]){
       raSwanFinial(sx*hw,yB+.02,sz*hd,Math.atan2(sx,sz),.54,upper);
      }
     }
    }

    if(t<nT-1){
     const nextW=curW*stepIn,nextD=curD*stepIn;
     const nY0=yT-.22,nH=neckH+.22;
     /* Clerestory neck collar supporting the next telescopic roof tier */
     box(neckMk,0,nY0,0,nextW-.28,nH,nextD-.28,neckCol);
     box(trimMk,0,nY0+nH-.08,0,nextW-.2,.08,nextD-.2,trimCol);
     curY=nY0+nH;
     curW=nextW;curD=nextD;
    }else{
     curY=yT;
    }
   }
   if(o.spire){
    raPrasatSpire(0,curY-.06,0,Math.min(curW,curD)*.34,o.spireH==null?4.2:o.spireH,{style:o.style,vault:false});
    curY+=(o.spireH==null?4.2:o.spireH);
   }
  });
 });
 return curY+.35;
}

/* Multi-tiered Octagonal / Hexagonal Sala-Nam Pavilion or Mandala Cupola Roof.
   Emits BOTH outer lathe roof tiers AND an explicit {inward: true} interior ceiling dome soffit 6 cm inside closing to r = 0.01! */
function raOctPavilionRoof(cx,y0,cz,rEave,tiers,o){
 o=o||{};
 const nT=Math.max(1,tiers||3),seg=o.seg==null?8:o.seg,upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'gold':'emerald'),col=o.col==null?P(mk):o.col;
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const soffitMk=o.soffitMk||(upper?'alabaster':'teak'),soffitCol=P(soffitMk);
 const step=o.step==null?.7:o.step,tRise=o.tierRise==null?rEave*.38:o.tierRise;

 svNoWalk(()=>{
  /* Explicit {inward: true} interior coffered vault soffit closing cleanly to r = 0.01 at the crown! */
  const yCrownIn=y0+tRise*1.25;
  lathe(soffitMk,cx,cz,[
   [Math.max(.18,rEave*.78),y0+.02],
   [Math.max(.12,rEave*.46),y0+tRise*.72],
   [.01,yCrownIn]
  ],seg,soffitCol,{inward:true});

  let rCur=rEave,yCur=y0;
  for(let t=0;t<nT;t++){
   const rTop=t===nT-1?.14:rCur*step,rh=tRise*(t===nT-1?1.15:.88);
   lathe(mk,cx,cz,[
    [rCur+.03,yCur+.02],
    [rCur*.66,yCur+rh*.48],
    [rTop,yCur+rh]
   ],seg,col,{uv:'cone'});
   /* Gilded / silver eave ring + corner flame horns */
   lathe(trimMk,cx,cz,[[rCur-.03,yCur-.02],[rCur+.05,yCur+.02],[rCur+.02,yCur+.08]],seg,trimCol,{uv:'arc'});
   for(let k=0;k<seg;k++){
    const a=k/seg*TAU;
    raSwanFinial(cx+Math.cos(a)*rCur,yCur+.03,cz+Math.sin(a)*rCur,Math.atan2(Math.cos(a),Math.sin(a)),.44,upper);
   }
   if(t<nT-1){
    cyl(upper?'dolomite':'crimson',cx,yCur+rh-.12,cz,rTop-.04,.34,P(upper?'dolomite':'crimson'),seg);
    yCur+=rh+.2;
    rCur=rTop*1.12;
   }else{
    yCur+=rh;
   }
  }
  /* Finial lotus & hti needle */
  cyl(trimMk,cx,yCur,cz,.18,.22,trimCol,seg);
  cone('gold',cx,yCur+.22,cz,.12,rEave*.48,P('gold'),seg);
 });
 return y0+nT*tRise+rEave*.55;
}

/* Soaring 5-to-7-stage Gilded Thai Prasat / Burmese Filigree Hti Spire.
   When o.vault !== false, also emits an {inward: true} interior vault cone 6 cm inside closing to r = 0.01! */
function raPrasatSpire(cx,y0,cz,wBase,hSpire,o){
 o=o||{};
 const upper=o.style==='upper-ria',seg=o.seg==null?12:o.seg;
 const mk=o.mk||(upper?'alabaster':'gold'),col=P(mk);
 const accMk=o.accMk||(upper?'silver':'emerald'),accCol=P(accMk);
 const r0=wBase*.5;
 svNoWalk(()=>{
  if(o.vault){
   lathe(upper?'dolomite':'gold',cx,cz,[
    [Math.max(.2,r0-.12),y0+.02],
    [Math.max(.1,r0*.48),y0+hSpire*.36],
    [.01,y0+hSpire*.52]
   ],seg,P(upper?'dolomite':'gold'),{inward:true});
  }
  /* Square stepped lotus pedestal + 5 diminishing Prasat/Hti rings + soaring needle */
  box(mk,cx,y0,cz,wBase,hSpire*.14,wBase,col);
  box(accMk,cx,y0+hSpire*.14,cz,wBase*.84,hSpire*.08,wBase*.84,accCol);
  const yR=y0+hSpire*.22,spH=hSpire*.52;
  const prof=[[r0*.82,yR]];
  const rings=5;
  for(let i=1;i<=rings;i++){
   const f=i/rings,rr=lerp(r0*.78,.12,f);
   prof.push([rr*1.12,yR+spH*(f-.08)]);
   prof.push([rr*.84,yR+spH*f]);
  }
  lathe(mk,cx,cz,prof,seg,col,{uv:'cone'});
  /* Filigree lotus-umbrella (Hti) rings + needle finial */
  const yN=yR+spH,nH=hSpire*.26;
  cyl('gold',cx,yN,cz,.09,nH*.75,P('gold'),8);
  for(const f of [.2,.45,.68]){
   ring(accMk,cx,yN+nH*f,cz,lerp(.24,.11,f),.022,accCol,0,0,0,10);
  }
  cone('gold',cx,yN+nH*.72,cz,.08,nH*.28,P('gold'),8);
 });
 return y0+hSpire;
}

/* Khmer-Thai Rattanakosin Porcelain/Glazed-Brick Corncob Prang OR Angkor-Bagan Stepped Stone Shikhara-Prang!
   Emits an {inward: true} corbelled sanctuary vault soffit 6 cm inside closing to r = 0.01 whenever o.vault !== false. */
function raPrang(cx,y0,cz,wBase,hPrang,o){
 o=o||{};
 const upper=o.style==='upper-ria',seg=o.seg==null?16:o.seg;
 const mk=o.mk||(upper?'dolomite':'alabaster'),col=o.col==null?P(mk):o.col;
 const bandMk=o.bandMk||(upper?'porphyry':'cobalt'),bandCol=P(bandMk);
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const r0=wBase*.48;
 svNoWalk(()=>{
  if(o.vault!==false){
   lathe(bandMk,cx,cz,[
    [Math.max(.24,r0-.18),y0+.04],
    [Math.max(.14,r0*.52),y0+hPrang*.38],
    [.01,y0+hPrang*.56]
   ],12,bandCol,{inward:true});
  }
  /* Redented square Khmer base + 4 cardinal false-portal antefixes (unless a real doorway sits on +z) */
  const baseH=hPrang*.24;
  box(mk,cx,y0,cz,wBase,baseH*.55,wBase,col);
  box(bandMk,cx,y0+baseH*.55,cz,wBase*.9,baseH*.2,wBase*.9,bandCol);
  box(mk,cx,y0+baseH*.75,cz,wBase*.84,baseH*.25,wBase*.84,col);
  for(let k=0;k<4;k++){
   if(o.openFront&&k===0)continue;
   const a=k*PI/2,nx=cx+Math.sin(a)*(wBase*.44+.05),nz=cz+Math.cos(a)*(wBase*.44+.05);
   W(nx,y0+baseH*.12,nz,a,()=>{
    box(trimMk,0,0,0,wBase*.28,baseH*.62,.12,trimCol);
    cone(trimMk,0,baseH*.62,0,wBase*.16,baseH*.26,trimCol,6);
   });
  }
  /* Elliptical bullet / corncob Shikhara-Prang tower in stepped lotus-petal tiers */
  const yC=y0+baseH,cH=hPrang*.62,steps=7,prof=[[r0*.86,yC]];
  for(let i=1;i<=steps;i++){
   const t=i/steps,bell=Math.pow(1-t,.62);
   const rOuter=Math.max(.15,r0*.84*bell+.06);
   prof.push([rOuter,yC+cH*(t-.06/steps)]);
   prof.push([rOuter*.9,yC+cH*t]);
  }
  lathe(mk,cx,cz,prof,seg,col,{uv:'cone'});
  /* Porcelain / porphyry horizontal petal rings stepped +2.5 cm proud at mid-tiers */
  for(let i=1;i<steps;i+=2){
   const t=i/steps,bell=Math.pow(1-t,.62),rr=Math.max(.18,r0*.84*bell+.085);
   ring(bandMk,cx,yC+cH*t,cz,rr,.035,bandCol,0,0,0,seg);
  }
  /* Amalaka crown + kalasha lotus bud + golden vajra trident spire */
  const yTop=yC+cH;
  sph(trimMk,cx,yTop+.12,cz,.28,trimCol,.62,12);
  cone('gold',cx,yTop+.26,cz,.16,hPrang*.14,P('gold'),10);
 });
 return y0+hPrang;
}

/* Bagan-Ptolemaic Ribbed Porphyry-and-Gilt Lotus Dome!
   Emits outer lathe dome + raised bronze/gold meridian ribs + {inward: true} interior gilded lotus dome soffit 6 cm inside! */
function raLotusDome(cx,y0,cz,rBase,hDome,o){
 o=o||{};
 const seg=o.seg==null?24:o.seg,upper=o.style!=='lower-ria';
 const mk=o.mk||(upper?'porphyry':'emerald'),col=P(mk);
 const ribMk=o.ribMk||'gold',ribCol=P(ribMk);
 const drumH=hDome*.22,cupH=hDome*.58,finH=hDome*.2;
 svNoWalk(()=>{
  /* Drum collar */
  cyl('dolomite',cx,y0,cz,rBase*1.04,drumH*.55,P('dolomite'),seg);
  cyl(ribMk,cx,y0+drumH*.55,cz,rBase*1.06,drumH*.2,ribCol,seg);
  cyl(mk,cx,y0+drumH*.75,cz,rBase,drumH*.25,col,seg);

  const yD=y0+drumH;
  const outerProf=[],innerProf=[];
  const nRings=7;
  for(let i=0;i<=nRings;i++){
   const t=i/nRings,ang=t*PI*.5;
   const rO=Math.max(.18,rBase*Math.cos(ang)+.08*Math.sin(t*PI));
   const yO=yD+cupH*Math.sin(ang);
   outerProf.push([rO,yO]);
   const rI=i===nRings?.01:Math.max(.08,rO-.07);
   const yI=yO-.06;
   innerProf.push([rI,yI]);
  }
  lathe(mk,cx,cz,outerProf,seg,col,{uv:'cone'});
  /* Explicit {inward: true} interior gilded lotus soffit closing cleanly to r = 0.01 */
  lathe('gold',cx,cz,innerProf,seg,P('gold'),{inward:true});

  /* Raised meridian lotus ribs stepped +4 cm proud of dome shell */
  const nRibs=o.ribs==null?12:o.ribs;
  for(let k=0;k<nRibs;k++){
   const a=k/nRibs*TAU,ca=Math.cos(a),sa=Math.sin(a);
   for(let j=0;j<3;j++){
    const t0=j/3,t1=(j+1)/3,a0=t0*PI*.5,a1=t1*PI*.5;
    const rA=rBase*Math.cos(a0)+.08*Math.sin(t0*PI)+.045,yA=yD+cupH*Math.sin(a0);
    const rB=Math.max(.22,rBase*Math.cos(a1)+.08*Math.sin(t1*PI)+.045),yB=yD+cupH*Math.sin(a1);
    beam(ribMk,[cx+ca*rA,yA,cz+sa*rA],[cx+ca*rB,yB,cz+sa*rB],.045,ribCol,true,6);
   }
  }
  /* Upturned lotus-petal finial & spire */
  const yFin=yD+cupH;
  cyl(ribMk,cx,yFin-.04,cz,.32,.18,ribCol,12);
  cone(upper?'silver':'gold',cx,yFin+.14,cz,.2,finH,P(upper?'silver':'gold'),10);
 });
 return y0+hDome;
}

/* Classical Roman Pantheon Stepped Saucer-Rotunda Dome + Coffered {inward: true} Stone Soffit + Gilded Lotus Oculus Lantern! */
function raPantheonRotundaDome(cx,y0,cz,rBase,hDome,o){
 o=o||{};
 const seg=o.seg==null?28:o.seg,upper=o.style==='upper-ria';
 const drumMk=o.drumMk||(upper?'dolomite':'travertine'),drumCol=P(drumMk);
 const domeMk=o.mk||(upper?'porphyry':'giltroof'),domeCol=P(domeMk);
 const ribMk=o.ribMk||(upper?'gold':'gold'),ribCol=P(ribMk);
 const soffitMk=o.soffitMk||(upper?'alabaster':'travertine'),soffitCol=P(soffitMk);
 const drumH=hDome*.26,stepH=hDome*.18,cupH=hDome*.34,lanH=hDome*.22;
 svNoWalk(()=>{
  /* Cylindrical Classical pilastered drum + dentil cornice */
  cyl(drumMk,cx,y0,cz,rBase*1.06,drumH*.68,drumCol,seg);
  cyl(upper?'porphyry':'cobalt',cx,y0+drumH*.68,cz,rBase*1.08,drumH*.16,P(upper?'porphyry':'cobalt'),seg);
  cyl(drumMk,cx,y0+drumH*.84,cz,rBase*1.12,drumH*.16,drumCol,seg);
  const nPil=o.pilasters==null?12:o.pilasters;
  for(let k=0;k<nPil;k++){
   const a=k/nPil*TAU;
   W(cx+Math.cos(a)*(rBase*1.08),y0+.04,cz+Math.sin(a)*(rBase*1.08),-a+PI/2,()=>{
    box(ribMk,0,0,0,.22,drumH*.62,.08,ribCol);
   });
  }
  /* Five iconic Classical Roman Pantheon stepped saucer-ring courses at base of dome */
  const yS0=y0+drumH;
  for(let s=0;s<5;s++){
   const fs0=s/5,fs1=(s+1)/5;
   const rs=lerp(rBase*1.04,rBase*.82,fs0);
   cyl(s%2===0?drumMk:domeMk,cx,yS0+stepH*fs0,cz,rs,stepH/5-.005,s%2===0?drumCol:domeCol,seg);
  }
  /* Saucer-hemisphere outer shell + {inward: true} coffered Classical stone interior vault closing to r = 0.01 */
  const yC0=yS0+stepH,outerProf=[],innerProf=[];
  const nR=7;
  for(let i=0;i<=nR;i++){
   const t=i/nR,ang=t*PI*.5;
   const rO=Math.max(.28,rBase*.81*Math.cos(ang));
   const yO=yC0+cupH*Math.sin(ang);
   outerProf.push([rO,yO]);
   innerProf.push([i===nR?.01:Math.max(.08,rO-.08),yO-.07]);
  }
  lathe(domeMk,cx,cz,outerProf,seg,domeCol,{uv:'cone'});
  lathe(soffitMk,cx,cz,innerProf,seg,soffitCol,{inward:true});
  /* Interior gold coffer rings stepped cleanly below innerProf */
  for(const f of [.28,.56]){
   const ang=f*PI*.5,rr=Math.max(.3,rBase*.81*Math.cos(ang)-.12),yy=yC0+cupH*Math.sin(ang)-.1;
   ring(ribMk,cx,yy,cz,rr,.03,ribCol,0,0,0,16);
  }
  /* Exterior Classical-Bagan meridian ribs */
  const nRibs=o.ribs==null?12:o.ribs;
  for(let k=0;k<nRibs;k++){
   const a=k/nRibs*TAU,ca=Math.cos(a),sa=Math.sin(a);
   for(let j=0;j<3;j++){
    const t0=j/3,t1=(j+1)/3,a0=t0*PI*.5,a1=t1*PI*.5;
    const rA=rBase*.81*Math.cos(a0)+.04,yA=yC0+cupH*Math.sin(a0);
    const rB=Math.max(.3,rBase*.81*Math.cos(a1)+.04),yB=yC0+cupH*Math.sin(a1);
    beam(ribMk,[cx+ca*rA,yA,cz+sa*rA],[cx+ca*rB,yB,cz+sa*rB],.042,ribCol,true,6);
   }
  }
  /* Gilded Thai/Burmese Lotus Oculus Lantern Cupola crowning the Pantheon dome */
  const yLan=yC0+cupH;
  cyl(drumMk,cx,yLan-.04,cz,.52,lanH*.36,drumCol,10);
  cyl(ribMk,cx,yLan+lanH*.32,cz,.58,.08,ribCol,10);
  cone(ribMk,cx,yLan+lanH*.4,cz,.48,lanH*.36,ribCol,10);
  cone('gold',cx,yLan+lanH*.76,cz,.12,lanH*.32,P('gold'),8);
 });
 return y0+hDome;
}

/* Ceremonial Dynastic Standard Banner hooked to ATMOS wind via clothHang. */
function raBanner(x,y0,z,yaw,h,col,upper){
 h=h==null?3.4:h;
 raNoCut(()=>W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   const mMk=upper?'silver':'gold';
   cyl('porphyry',0,0,0,.16,.18,P('porphyry'),8);
   cyl('teak',0,.18,0,.042,h-.18,P('teak'),8);
   cone(mMk,0,h,0,.068,.24,P(mMk),8);
   box(mMk,0,h-.24,0,.84,.045,.045,P(mMk));
   const drop=h*.54;
   withCloth(clothHang(drop,.08),()=>{
    quad('flag',0,h-.28-drop*.5,.028,.72,drop,col==null?P(upper?'silkSaffron':'silkCrimson'):col,0);
   });
  });
 }));
}
