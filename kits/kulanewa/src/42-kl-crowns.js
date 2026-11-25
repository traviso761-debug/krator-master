// prefix: kl
// ================================================================= KULANEWA AF4 HOOPED FRUSTUMS & AF1 ROOFS, BELL-CUPOLAS, WHEELS & STEELYARDS
// Implements:
//   - AF4: Iron- & Arch-nickel-hooped slatted-cedar conical frustum strongtowers & militia drum-towers (klHoopedFrustum) + klSkywalk.
//   - AF1: Nail-less multi-eave Newar/Dong hipped & gable roofs (klNewarRoof), open octagonal cast-bronze Syndicate/Covenant
//          Bell-Cupolas (klBellCupola — STRICTLY ZERO pointed royal Ria Prasat spires!), undershot mill waterwheels (klMillWheel),
//          hanging bronze steelyard scales (klSteelyard), quay derrick cranes (klDerrickCrane), and cloth banners (klBanner).
// CRITICAL CEILING GUARANTEE:
//   - Every klNewarRoof emits a solid klCeilingSlab at y0 + 0.02 AND solid soffit slabs on every telescopic tier.
//   - Every inhabited klHoopedFrustum and klBellCupola emits a solid top ceiling disc + {inward: true} cedar soffit closing to r = 0.01.

/* AF4 Vertical Accent: Truncated conical tower of vertical dark-cedar staves cinched in 4-6 riveted black-iron and bright
   silver-white Arch-nickel tension hoops, optionally rising from a battered circular white-kura plinth! */
function klHoopedFrustum(cx,cz,rBot,rTop,y0,h,o){
 o=o||{};
 const plH=o.plinthH==null?0:o.plinthH;
 const yF0=y0+plH,hFr=Math.max(1.8,h-plH),yTop=y0+h;
 const nHoops=o.hoops==null?5:o.hoops,seg=o.seg==null?18:o.seg;
 const hollow=o.hollow!==false;

 if(plH>.15){
  svNoWalk(()=>{
   cyl('sootstone',cx,y0+.006,cz,rBot+.46,Math.min(.42,plH*.26),P('sootstone'),seg,rBot+.38);
   cyl('kura',cx,y0+Math.min(.42,plH*.26),cz,rBot+.36,plH-Math.min(.42,plH*.26)-.1,P('kura'),seg,rBot+.12,true);
   cyl('sootstone',cx,yF0-.1,cz,rBot+.18,.1,P('sootstone'),seg);
  });
 }

 if(!hollow){
  svNoWalk(()=>{
   cyl('darkcedar',cx,yF0,cz,rBot,hFr-.14,P('darkcedar'),seg,rTop,true);
   /* Vertical raised cedar stave ribs proud by +3 cm */
   const nStaves=12;
   for(let k=0;k<nStaves;k++){
    const a=k/nStaves*TAU,ca=Math.cos(a),sa=Math.sin(a);
    beam('cedar',[cx+ca*(rBot+.028),yF0+.06,cz+sa*(rBot+.028)],[cx+ca*(rTop+.028),yTop-.18,cz+sa*(rTop+.028)],.055,P('cedar'));
   }
   /* Alternating black-iron & bright Arch-nickel tension hoops proud by +5.5 cm */
   for(let i=0;i<nHoops;i++){
    const f=(i+.65)/(nHoops+.3),yh=yF0+hFr*f,rr=lerp(rBot,rTop,f)+.055;
    const hMk=i%2===0?'nickel':'iron';
    cyl(hMk,cx,yh-.065,cz,rr,.13,P(hMk),seg,rr*.992);
   }
   cyl('iron',cx,yTop-.14,cz,rTop+.08,.14,P('iron'),seg);
   cyl('nickel',cx,yTop,cz,rTop*.92,.06,P('nickel'),seg);
  });
  if(o.block!==false&&h>=1.2)klWallBlock(cx,y0,cz,rBot*1.85,h*.85,rBot*1.85,0);
  return yTop+.06;
 }

 /* Inhabited walkable slatted-cedar hooped frustum!
    Builds tapered outer/inner wall sectors around doorways & windows, walkable base/mid floor discs, iron/nickel tension hoops,
    and a 100% solid downward-facing top ceiling slab + {inward: true} cedar cone soffit! */
 const wallT=.34;
 const list=(o.opens||[]).map(q=>{
  const yf=clamp((q.y==null?0:q.y)/hFr,0,.85);
  const rm=lerp(rBot,rTop,yf)-wallT*.5;
  const da=Math.min(.55,Math.max(.1,(q.w==null?1.35:q.w)/(2*Math.max(.9,rm))));
  const am=(((q.a==null?PI/2:q.a)%TAU)+TAU)%TAU;
  return Object.assign({},q,{am,da,a0:am-da,a1:am+da,wActual:2*da*rm});
 });
 const intervals=[];
 for(const q of list){
  if(q.a0<0){
   intervals.push({a0:0,a1:q.a1,q},{a0:q.a0+TAU,a1:TAU,q});
  }else if(q.a1>TAU){
   intervals.push({a0:q.a0,a1:TAU,q},{a0:0,a1:q.a1-TAU,q});
  }else{
   intervals.push({a0:q.a0,a1:q.a1,q});
  }
 }
 intervals.sort((a,b)=>a.a0-b.a0);
 const angDist=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));

 const nCourses=Math.max(4,nHoops);
 svNoWalk(()=>{
  for(let c=0;c<nCourses;c++){
   const f0=c/nCourses,f1=(c+1)/nCourses;
   const ya=yF0+hFr*f0+.005,yb=yF0+hFr*f1-(c===nCourses-1?.15:.005);
   const rOutM=lerp(rBot,rTop,(f0+f1)*.5),rInM=Math.max(.65,rOutM-wallT);
   const segArc=(aa,ab,yA,yB)=>{
    if(ab-aa>.012&&yB-yA>.025){
     sector('darkcedar',cx,cz,rInM,rOutM,aa,ab,yA,yB,P('darkcedar'),Math.max(2,Math.ceil((ab-aa)/(PI/12))));
    }
   };
   let cur=0;
   for(const iv of intervals){
    const q=iv.q;
    const qy0=yF0+(q.y==null?(q.door?0:1.1):q.y);
    const qh=q.h==null?(q.door?KL.DOOR_H:1.25):q.h,qy1=qy0+qh;
    if(qy1<=ya||qy0>=yb)continue;
    if(iv.a0>cur+.01)segArc(cur,iv.a0,ya,yb);
    if(qy0>ya+.03)segArc(iv.a0,iv.a1,ya,Math.min(yb,qy0));
    if(qy1<yb-.03)segArc(iv.a0,iv.a1,Math.max(ya,qy1),yb);
    cur=Math.max(cur,iv.a1);
   }
   if(TAU>cur+.01)segArc(cur,TAU,ya,yb);
  }

  /* Alternating riveted black-iron & bright Arch-nickel tension hoops stepped +5 cm clear of outer frustum stave steps */
  for(let i=0;i<nHoops;i++){
   const f=(i+.62)/(nHoops+.25),yh=yF0+hFr*f;
   /* Skip hoop segment only if an upper skywalk door intersects yh */
   const hitOpen=list.find(q=>{
    const qy0=yF0+(q.y==null?0:q.y),qy1=qy0+(q.h==null?KL.DOOR_H:q.h);
    return yh>=qy0-.12&&yh<=qy1+.12;
   });
   const rr=lerp(rBot,rTop,f)+.085,hMk=i%2===0?'nickel':'iron';
   if(hitOpen){
    sector(hMk,cx,cz,rr-.06,rr+.02,hitOpen.am+hitOpen.da+.05,hitOpen.am-hitOpen.da+TAU-.05,yh-.065,yh+.065,P(hMk),18);
   }else{
    cyl(hMk,cx,yh-.065,cz,rr,.13,P(hMk),seg);
   }
  }

  /* Solid cylindrical dark-cedar & nickel crown cap + {inward: true} interior soffit cone -> 0 sky leaks! */
  cyl('darkcedar',cx,yTop-.15,cz,rTop+.06,.15,P('darkcedar'),seg);
  cyl('nickel',cx,yTop,cz,rTop+.1,.065,P('nickel'),seg);
  lathe('cedar',cx,cz,[
   [Math.max(.35,rTop-wallT-.04),yTop-.18],
   [Math.max(.18,(rTop-wallT)*.5),yTop-.08],
   [.01,yTop-.04]
  ],12,P('cedar'),{inward:true});
 });

 /* Walkable ground floor disc inside frustum (and optional upper skywalk floor disc at o.midY) */
 if(o.floor!==false){
  klFloorDisc(cx,cz,Math.max(.8,rBot-wallT-.04),yF0,'paving',P('paving'),{seg:16,th:.14});
 }
 if(o.midY!=null){
  const fm=clamp((o.midY-yF0)/hFr,0,.85);
  const rMidIn=Math.max(.8,lerp(rBot,rTop,fm)-wallT-.05);
  klFloorDisc(cx,cz,rMidIn,o.midY,'floor',P('floor'),{seg:16,th:.14});
 }

 /* Render operable doors & windows in frustum openings */
 for(const q of list){
  const qy=q.y==null?(q.door?0:1.1):q.y,qh=q.h==null?(q.door?KL.DOOR_H:1.25):q.h;
  const yf=clamp(qy/hFr,0,.85),rm=lerp(rBot,rTop,yf)-wallT*.5;
  const yaw=Math.atan2(Math.cos(q.am),Math.sin(q.am));
  const mx=cx+Math.cos(q.am)*rm,mz=cz+Math.sin(q.am)*rm;
  if(q.door){
   klToranaDoor(mx,yF0+qy,mz,yaw,q.wActual,qh,Object.assign({t:wallT,torana:false,register:'kura'},q));
  }else{
   klFireShutterWindow(mx,yF0+qy,mz,yaw,q.wActual,qh,Object.assign({t:wallT},q));
  }
 }

 /* Polygonal wall collision blocks around frustum split cleanly below/above o.midY and skipping doorways on each level */
 if(o.block!==false){
  const nSeg=18,rmB=rBot-wallT*.5;
  const hLow=o.midY!=null?Math.max(.9,o.midY-yF0-.32):Math.min(3.6,hFr*.75);
  for(let i=0;i<nSeg;i++){
   const am=(i+.5)/nSeg*TAU,yaw=Math.atan2(Math.cos(am),Math.sin(am));
   if(!list.some(q=>q.door&&(q.y==null||q.y<.6)&&angDist(am,q.am)<=q.da+.22)){
    klWallBlock(cx+Math.cos(am)*rmB,yF0,cz+Math.sin(am)*rmB,TAU*rmB/nSeg,hLow,wallT,yaw);
   }
   if(o.midY!=null){
    const fm=clamp((o.midY-yF0)/hFr,0,.85),rmM=lerp(rBot,rTop,fm)-wallT*.5;
    if(!list.some(q=>q.door&&q.y>=.6&&angDist(am,q.am)<=q.da+.24)){
     klWallBlock(cx+Math.cos(am)*rmM,o.midY,cz+Math.sin(am)*rmM,TAU*rmM/nSeg,Math.min(2.8,yTop-o.midY-.2),wallT,yaw);
    }
   }
  }
 }
 klRoom(cx-(rBot-wallT),cz-(rBot-wallT),cx+(rBot-wallT),cz+(rBot-wallT),yF0,hFr,o);
 return yTop+.065;
}

/* AF4 Elevated Timber Truss Sky-Walk linking an upper gallery to a klHoopedFrustum strongtower or twin drum-tower! */
function klSkywalk(x0,z0,x1,z1,yDeck,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.25)return;
 const yaw=Math.atan2(dx,dz),bw=w==null?1.85:w;
 klNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    box('darkcedar',0,yDeck-.22,0,bw-.06,.12,L,P('darkcedar'));
    box('floor',0,yDeck-.1,0,bw,.1,L+.06,P('floor'));
    /* Diagonal timber knee-braces at each end */
    for(const sz of [-1,1])for(const sx of [-bw/2+.14,bw/2-.14]){
     beam('darkcedar',[sx,yDeck-1.05,sz*(L/2-.15)],[sx,yDeck-.22,sz*(L/2-Math.min(1.4,L*.38))],.09,P('darkcedar'));
    }
    /* Open X-braced cedar handrails along both sides (block: false -> never blocks walker!) */
    const nP=Math.max(2,Math.round(L/1.6)+1);
    for(const sx of [-bw/2+.12,bw/2-.12]){
     box('darkcedar',sx,yDeck+.82,0,.07,.075,L,P('darkcedar'));
     box('nickel',sx,yDeck+.42,0,.04,.045,L-.1,P('nickel'));
     for(let i=0;i<nP;i++){
      const zz=lerp(-L/2+.12,L/2-.12,nP===1?.5:i/(nP-1));
      box('darkcedar',sx,yDeck+.006,zz,.085,.82,.085,P('darkcedar'));
     }
    }
   });
  });
  klStripWalk([x0,yDeck,z0],[x1,yDeck,z1],Math.max(.9,bw-.26));
  wkPad(x0,z0,bw+.2,bw+.2,yDeck);
  wkPad(x1,z1,bw+.2,bw+.2,yDeck);
 });
}

/* AF1 Crown: Open Octagonal Cast-Bronze & Dark-Cedar Syndicate / Covenant Bell-Cupola (STRICTLY ZERO pointed Prasat spires!).
   Hangs a cast-bronze bell inside an 8-post bronze-and-cedar lantern with a solid ceiling soffit and stubby bronze abacus cap. */
function klBellCupola(cx,y0,cz,rEave,hCup,o){
 o=o||{};
 const seg=8,ikki=o.style==='ikki';
 const roofMk=o.roofMk||(ikki?'slate':'copper'),roofCol=P(roofMk);
 const postMk=o.postMk||'bronze',postCol=P(postMk);
 const pedH=hCup*.22,postH=hCup*.42,roofH=hCup*.36;
 const rPed=rEave*.72,rPost=rEave*.64;
 svNoWalk(()=>{
  /* Octagonal louvered dark-cedar & Arch-nickel cupola base curb */
  cyl('darkcedar',cx,y0,cz,rPed,pedH*.78,P('darkcedar'),seg);
  cyl('nickel',cx,y0+pedH*.78,cz,rPed+.05,pedH*.22,P('nickel'),seg);

  const yP=y0+pedH;
  /* Eight octagonal bronze/cedar belfry posts + low perimeter balustrade */
  for(let k=0;k<seg;k++){
   const a=(k+.5)/seg*TAU,px=cx+Math.cos(a)*rPost,pz=cz+Math.sin(a)*rPost;
   cyl(postMk,px,yP+.006,pz,.075,postH,postCol,8);
   const a2=(k+1.5)/seg*TAU,nx=cx+Math.cos(a2)*rPost,nz=cz+Math.sin(a2)*rPost;
   beam('bronze',[px,yP+.28,pz],[nx,yP+.28,nz],.04,P('bronze'));
  }

  /* Hanging Great Cast-Bronze Covenant / Syndicate Bell at the center! */
  const bellR=Math.min(.52,rPost*.44),bellH=Math.min(.92,postH*.66),yBellTop=yP+postH-.12;
  box('nickel',cx,yBellTop-.1,cz,bellR*.9,.1,bellR*.9,P('nickel'));
  cyl('bronze',cx,yBellTop-.1-bellH*.78,cz,bellR*.82,bellH*.78,P('bronze'),12,bellR*.64);
  cyl('bronze',cx,yBellTop-.1-bellH,cz,bellR,bellH*.22,P('bronze'),12,bellR*.82);
  sph('iron',cx,yBellTop-.1-bellH-.04,cz,bellR*.22,P('iron'),1,8);
  if(ikki){
   /* Ikki Covenant horizontal suspended cedar striking-beam */
   beam('darkcedar',[cx,yBellTop-.1-bellH*.62,cz-rPost*.72],[cx,yBellTop-.1-bellH*.62,cz+rPost*.72],.065,P('darkcedar'),true,8);
  }

  /* Solid octagonal ceiling slab + {inward: true} interior vault soffit under cupola roof -> 100% sky-tight! */
  const yR=yP+postH;
  cyl('darkcedar',cx,yR,cz,rEave*.86,.1,P('darkcedar'),seg);
  lathe('cedar',cx,cz,[
   [Math.max(.18,rEave*.74),yR+.02],
   [Math.max(.1,rEave*.38),yR+roofH*.55],
   [.01,yR+roofH*.78]
  ],seg,P('cedar'),{inward:true});

  /* Flared octagonal slate/copper cupola roof + stubby flat-topped bronze drum finial (ZERO pointed Prasat spire!) */
  lathe(roofMk,cx,cz,[
   [rEave+.04,yR+.04],
   [rEave*.64,yR+roofH*.48],
   [.24,yR+roofH]
  ],seg,roofCol,{uv:'cone'});
  cyl('bronze',cx,yR+roofH,cz,.28,.12,P('bronze'),seg);
  cyl('nickel',cx,yR+roofH+.12,cz,.18,.09,P('nickel'),seg);
 });
 return y0+hCup+.21;
}

/* AF1 Crown: Nail-less 1-to-4-tier Newar/Dong hipped or hip-and-gable roof with carved tundal eave-struts, solid ceiling
   and tier soffits, scrolled udatsu ridge terminals (ZERO pointed spires!), and optional klBellCupola crown! */
function klNewarRoof(cx,y0,cz,w,d,tiers,o){
 o=o||{};
 const nT=Math.max(1,tiers==null?2:tiers),ikki=o.style==='ikki',mode=o.mode||'hip';
 const mk=o.mk||(ikki?'slate':'terracotta'),col=o.col==null?P(mk):o.col;
 const trimMk=o.trimMk||(ikki?'nickel':'bronze'),trimCol=P(trimMk);
 const soffitMk=o.soffitMk||'darkcedar',soffitCol=P(soffitMk);
 const neckMk=o.neckMk||'carvedwood',neckCol=P(neckMk);
 const over=o.over==null?.76:o.over,stepIn=o.stepIn==null?.74:o.stepIn;
 const tierRise=o.tierRise==null?Math.max(.9,Math.min(w,d)*.15):o.tierRise;
 const neckH=o.neckH==null?.48:o.neckH;

 if(o.ceiling!==false){
  klCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.12),Math.max(.4,d-.12),{
   mk:soffitMk,col:soffitCol,trimMk:'cedar'
  });
 }

 let curY=y0+.12,curW=w+over*2,curD=d+over*2;
 W(cx,0,cz,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   for(let t=0;t<nT;t++){
    const hw=curW/2,hd=curD/2,rH=tierRise*(t===nT-1?1.12:1);
    const bodyHW=Math.max(.6,hw-over*.85),bodyHD=Math.max(.6,hd-over*.85);

    /* Solid horizontal underside soffit slab for EVERY tier -> 100% opaque eaves & interior ceilings! */
    box(soffitMk,0,curY,0,curW-.06,.09,curD-.06,soffitCol);
    for(const sz of [-hd,hd])box('darkcedar',0,curY+.015,sz,curW+.04,.09,.07,P('darkcedar'));
    for(const sx of [-hw+.04,hw-.04])box('darkcedar',sx,curY+.015,0,.07,.09,curD-.14,P('darkcedar'));

    /* Carved Newar diagonal tundal eave-struts supporting the wide overhang on lower tier */
    if(t===0&&over>=.48){
     const nSX=Math.max(2,Math.round(curW/2.6)),nSZ=Math.max(2,Math.round(curD/2.6));
     for(let i=0;i<=nSX;i++){
      const sx=lerp(-bodyHW+.2,bodyHW-.2,i/nSX);
      for(const s of [-1,1]){
       beam('carvedwood',[sx,curY-.52,s*bodyHD],[sx,curY-.01,s*(hd-.14)],.065,P('carvedwood'));
      }
     }
     for(let j=1;j<nSZ;j++){
      const sz=lerp(-bodyHD+.2,bodyHD-.2,j/nSZ);
      for(const s of [-1,1]){
       beam('carvedwood',[s*bodyHW,curY-.52,sz],[s*(hw-.14),curY-.01,sz],.065,P('carvedwood'));
      }
     }
    }

    const yB=curY+.09,yT=yB+rH;
    const alongX=o.gableAxis!=='z'&&(o.gableAxis==='x'||curW>=curD);

    if(mode==='gable'&&t===nT-1){
     if(alongX){
      const PW=[-hw+.05,yT,0],PE=[hw-.05,yT,0];
      poly(mk,[[-hw,yB,hd],[hw,yB,hd],PE,PW],col);
      poly(mk,[[hw,yB,-hd],[-hw,yB,-hd],PW,PE],col);
      /* Recessed dark-cedar louvered gable tympanums (inset 9 cm inside +-hw -> 0 coplanar overlap) */
      poly('carvedwood',[[hw-.09,yB,hd-.14],[hw-.09,yB,-hd+.14],[hw-.09,yT-.06,0]],P('carvedwood'));
      poly('carvedwood',[[-hw+.09,yB,-hd+.14],[-hw+.09,yB,hd-.14],[-hw+.09,yT-.06,0]],P('carvedwood'));
      /* Flat horizontal copper/slate ridge bar + rectangular shachihoko/udatsu ridge-end blocks (zero spires!) */
      box('copper',0,yT,0,curW-.12,.12,.18,P('copper'));
      for(const sx of [-1,1]){
       box(trimMk,sx*(hw-.16),yT+.12,0,.22,.22,.22,trimCol);
      }
     }else{
      const PN=[0,yT,-hd+.05],PS=[0,yT,hd-.05];
      poly(mk,[[-hw,yB,-hd],[-hw,yB,hd],PS,PN],col);
      poly(mk,[[hw,yB,hd],[hw,yB,-hd],PN,PS],col);
      poly('carvedwood',[[-hw+.14,yB,hd-.09],[hw-.14,yB,hd-.09],[0,yT-.06,hd-.09]],P('carvedwood'));
      poly('carvedwood',[[hw-.14,yB,-hd+.09],[-hw+.14,yB,-hd+.09],[0,yT-.06,-hd+.09]],P('carvedwood'));
      box('copper',0,yT,0,.18,.12,curD-.12,P('copper'));
      for(const sz of [-1,1]){
       box(trimMk,0,yT+.12,sz*(hd-.16),.22,.22,.22,trimCol);
      }
     }
    }else{
     /* 4-way hipped Newar/Dong tier closing to ridge bar (on top tier) or next tier's neck collar */
     let tw,td;
     if(t===nT-1){
      if(o.cupola){
       const rCap=Math.min(hw,hd)*.36;
       tw=rCap;td=rCap;
      }else if(curW>=curD){
       tw=Math.max(.35,hw-hd*.72);td=.14;
      }else{
       tw=.14;td=Math.max(.35,hd-hw*.72);
      }
     }else{
      tw=hw*stepIn*.82;td=hd*stepIn*.82;
     }
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     const A2=[-tw,yT,-td],B2=[tw,yT,-td],C2=[tw,yT,td],D2=[-tw,yT,td];
     poly(mk,[D,C,C2,D2],col);
     poly(mk,[C,B,B2,C2],col);
     poly(mk,[B,A,A2,B2],col);
     poly(mk,[A,D,D2,A2],col);
     if(t===nT-1&&!o.cupola){
      box('copper',0,yT,0,tw*2+.12,.12,td*2+.12,P('copper'));
      if(tw>td+.2){
       for(const sx of [-tw,tw])box(trimMk,sx,yT+.12,0,.22,.18,.22,trimCol);
      }else if(td>tw+.2){
       for(const sz of [-td,td])box(trimMk,0,yT+.12,sz,.22,.18,.22,trimCol);
      }else{
       box(trimMk,0,yT+.12,0,.32,.16,.32,trimCol);
      }
     }
    }

    if(t<nT-1){
     const nextW=curW*stepIn,nextD=curD*stepIn;
     const nY0=yT-.2,nH=neckH+.2;
     box(neckMk,0,nY0,0,nextW-.28,nH-.08,nextD-.28,neckCol);
     box(trimMk,0,nY0+nH-.08,0,nextW-.2,.08,nextD-.2,trimCol);
     curY=nY0+nH;
     curW=nextW;curD=nextD;
    }else{
     curY=yT;
    }
   }

   if(o.cupola){
    const rCup=o.cupolaR==null?Math.min(w,d)*.24:o.cupolaR;
    const hCup=o.cupolaH==null?Math.max(3.2,rCup*1.95):o.cupolaH;
    curY=klBellCupola(0,curY-.06,0,rCup,hCup,{style:o.style,roofMk:o.cupolaMk});
   }
  });
 });
 return curY+.28;
}

/* AF1 Hydro Power: Undershot dark-cedar & Arch-nickel/iron-rimmed mill or trip-hammer waterwheel (svNoWalk). */
function klMillWheel(x,yAxle,z,yaw,r,w,o){
 o=o||{};
 const rad=r==null?2.1:r,wid=w==null?.86:w,nSpokes=o.spokes==null?10:o.spokes;
 W(x,yAxle,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Horizontal iron/cedar axle shaft + twin rimmed paddle rings */
   WX(0,0,0,0,0,PI/2,()=>{
    cyl('iron',0,-wid*.72,0,.15,wid*1.44,P('iron'),10);
    cyl('nickel',0,-wid*.58,0,.22,.12,P('nickel'),10);
    cyl('nickel',0,wid*.46,0,.22,.12,P('nickel'),10);
   });
   for(const sx of [-wid*.42,wid*.42]){
    ring('darkcedar',sx,0,0,rad*.92,.08,P('darkcedar'),0,PI/2,PI/2,18);
    ring('nickel',sx,0,0,rad*.64,.045,P('nickel'),0,PI/2,PI/2,16);
   }
   for(let i=0;i<nSpokes;i++){
    const a=i/nSpokes*TAU,cy=Math.sin(a),cz2=Math.cos(a);
    for(const sx of [-wid*.42,wid*.42]){
     beam('darkcedar',[sx,cy*.18,cz2*.18],[sx,cy*rad*.94,cz2*rad*.94],.065,P('darkcedar'));
    }
    /* Undershot cedar float-paddle spanning between the two wheel rims */
    WX(0,cy*rad*.96,cz2*rad*.96,0,-a,0,()=>{
     box('cedar',0,-.18,0,wid+.08,.36,.06,P('cedar'));
    });
   }
  });
 });
}

/* AF1 Mercantile Emblem: Hanging cast-bronze & Arch-nickel asymmetric steelyard balance scale + clearing bell! */
function klSteelyard(x,yTop,z,yaw,span,o){
 o=o||{};
 const sp=span==null?2.1:span;
 W(x,yTop,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Projecting dark-cedar cathead beam + bronze hanger chain */
   beam('darkcedar',[0,0,-.65],[0,0,.65],.13,P('darkcedar'));
   cyl('iron',0,-.68,.42,.024,.68,P('iron'),6);
   /* Asymmetric graduated cast-bronze balance beam */
   beam('bronze',[-sp*.58,-.68,.42],[sp*.42,-.68,.42],.055,P('bronze'));
   /* Sliding bright Arch-nickel poise weight on long arm + suspended copper cargo pan on short arm */
   cyl('nickel',-sp*.38,-.94,.42,.11,.22,P('nickel'),10);
   cyl('iron',-sp*.38,-.72,.42,.018,.08,P('iron'),6);
   const px=sp*.36,panY=-1.48;
   for(const dz of [-.24,.24])beam('iron',[px,-.68,.42],[px,panY,.42+dz],.016,P('iron'),true,6);
   cyl('copper',px,panY-.05,.42,.34,.05,P('copper'),12);
   if(o.bell!==false){
    /* Small clearing-porch bronze strike-bell beside the steelyard */
    cyl('bronze',-sp*.12,-.52,.42,.14,.28,P('bronze'),10,.11);
   }
  });
 });
}

/* Quay Slewing Timber & Arch-Nickel-Hooped Cargo Derrick Crane (svNoWalk + base klWallBlock). */
function klDerrickCrane(x,y0,z,yaw,h,reach,o){
 o=o||{};
 const mh=h==null?6.4:h,rc=reach==null?3.8:reach;
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   box('sootstone',0,.01,0,1.65,.36,1.65,P('sootstone'));
   cyl('darkcedar',0,.37,0,.24,mh-.37,P('darkcedar'),10,.19);
   for(const fy of [1.2,2.8,4.4]){
    if(fy<mh-.3)cyl('nickel',0,fy,0,.265,.09,P('nickel'),10);
   }
   /* Diagonal timber jib boom + backstays + suspended cargo hook & bale */
   const tip=[0,mh+.55,rc];
   beam('darkcedar',[0,mh*.44,.16],tip,.14,P('darkcedar'));
   beam('iron',[0,mh-.18,0],tip,.035,P('iron'),true,6);
   for(const sx of [-.62,.62]){
    beam('darkcedar',[sx,.37,-.58],[0,mh*.62,-.1],.1,P('darkcedar'));
   }
   cyl('rope',0,mh-1.65,rc-.12,.024,2.15,P('rope'),6);
   box('cedar',0,mh-2.25,rc-.12,.76,.58,.68,P('cedar'));
   box('iron',0,mh-2.24,rc-.12,.79,.06,.71,P('iron'));
  });
  klWallBlock(0,0,0,1.5,2.4,1.5,0);
 });
}

/* Hanging Cloth Standard: Saffron/Indigo Kula-Na Covenant banner or Crimson/Amber Karum Syndicate pennant. */
function klBanner(x,y0,z,yaw,h,colKey,o){
 o=o||{};
 const bh=h==null?2.8:h,bw=o.w==null?.68:o.w,mk=o.mk||'brocade';
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('darkcedar',0,0,0,.045,bh+.45,P('darkcedar'),8);
   box('bronze',0,bh+.35,.38,.06,.06,.84,P('bronze'));
   withCloth(clothHang(bh*.78,.09),()=>{
    quad(mk,0,bh+.32-bh*.39,.42,bw,bh*.78,P(colKey||'silkSaffron'),0);
   });
  });
 });
}
