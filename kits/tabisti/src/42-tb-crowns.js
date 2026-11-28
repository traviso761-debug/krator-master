// prefix: tb
/* ================================================================= URBAN TABISTI CROWNS, BELVEDERE SPIRES & SOLAR WIND-TOWERS
   Implements PLAN.md Sections 3 & 4 (Plates A1, B1-B5):
   - tbEscataSpire      (Plate B3): Open-arched ashlar stone breeze-belvedere + concave octagonal saffron/rose escata fish-scale spire.
   - tbTrencadisLantern (Plate B4): Octagonal trencadis mosaic drum + cantilevered zigzag rosebrick corbels + mosaic cupola.
   - tbWindTower        (Plate B5): El Capricho cylindrical glazed-teal solar wind-chimney + stepped red/teal corbels + iron balcony + 4-pillar cupola.
   - tbZsolnayRoof      (Plate B1-B2): Steep monsoon-shedding Zsolnay glazed roof + bronze rainwater gargoyles + verdigris globe finials.
   - tbPishtaqPortal    (Plate A1): Shah-i-Zinda embossed turquoise/cobalt kashi portal with twisted ceramic colonnettes & muqarnas iwan.
   - tbSunVelarium / tbBanner: Catenary silk/canvas sun-sails and guild banners animated in atmWind.
   CRITICAL CEILING GUARANTEE:
   - Every roof, lantern, spire and wind-tower emits a solid ceiling slab/disc + {inward: true} interior soffit closing to r = 0.01! */

/* Plate B3: Catalan Modernisme open-arched stone belvedere lantern crowned by a concave octagonal spire of saffron-ochre
   & rose-crimson glazed escata fish-scale tiles and broken-tile trencadis collar! */
function tbEscataSpire(cx,y0,cz,rBase,hTotal,o){
 o=o||{};
 const seg=8,drumH=hTotal*.38,spireH=hTotal*.62;
 const rDrum=rBase*.82,rPost=rDrum*.88;
 tbBio().windTowers++;
 svNoWalk(()=>{
  /* Base ashlar collar + proud trencadis broken-tile mosaic belt */
  cyl('ashlar',cx,y0,cz,rBase,drumH*.22,P('ashlar'),seg);
  cyl('trencadis',cx,y0+drumH*.06,cz,rBase+.045,drumH*.12,P('trencadis'),seg);

  /* 8 open-arched stone breeze piers around 360-degree belvedere drum */
  const yP=y0+drumH*.22,pH=drumH*.62;
  for(let k=0;k<seg;k++){
   const a=(k+.5)/seg*TAU,px=cx+Math.cos(a)*rPost,pz=cz+Math.sin(a)*rPost;
   cyl('ashlar',px,yP+.006,pz,Math.max(.08,rBase*.11),pH,P('ashlar'),8);
   const a2=(k+1.5)/seg*TAU,nx=cx+Math.cos(a2)*rPost,nz=cz+Math.sin(a2)*rPost;
   beam('iron',[px,yP+.28,pz],[nx,yP+.28,nz],.038,P('iron'));
  }
  /* Arched stone & rosebrick cornice ring + trencadis collar */
  const yC=yP+pH;
  cyl('rosebrick',cx,yC,cz,rDrum+.05,drumH*.09,P('rosebrick'),seg);
  cyl('trencadis',cx,yC+drumH*.09,cz,rDrum+.09,drumH*.07,P('trencadis'),seg);

  /* Solid octagonal ceiling slab + {inward: true} cedar soffit -> 0 sky leaks! */
  const yS=y0+drumH;
  cyl('ustun',cx,yS-.06,cz,rDrum*.94,.08,P('ustun'),seg);
  lathe('cedar',cx,cz,[
   [Math.max(.18,rDrum*.76),yS+.02],
   [Math.max(.1,rDrum*.38),yS+spireH*.45],
   [.01,yS+spireH*.72]
  ],seg,P('cedar'),{inward:true});

  /* Concave octagonal saffron-ochre escata spire banded with rose-crimson scale courses (Plate B3)! */
  lathe('escata',cx,cz,[
   [rBase+.06,yS+.02],
   [rBase*.66,yS+spireH*.28],
   [rBase*.42,yS+spireH*.56],
   [rBase*.22,yS+spireH*.82],
   [.09,yS+spireH]
  ],seg,P('escata'),{uv:'cone'});
  /* Proud rose-crimson escata chevron accent collars along concave spire */
  for(const [f,rf] of [[.24,.71],[.52,.47],[.76,.28]]){
   cyl('terracotta',cx,yS+spireH*f,cz,rBase*rf+.038,spireH*.065,P('escataRose'),seg,rBase*rf*.92);
  }
  /* Wrought-iron & gilt Modernisme crown finial */
  cyl('gilt',cx,yS+spireH,cz,.13,.14,P('gilt'),8);
  cyl('iron',cx,yS+spireH+.14,cz,.035,.48,P('iron'),6);
  sph('gilt',cx,yS+spireH+.38,cz,.1,P('gilt'),1,8);
 });
 return y0+hTotal+.62;
}

/* Plate B4: Gaudi octagonal ventilation lantern — white/teal/cobalt trencadis broken-tile drum, cantilevered stepped
   rosebrick zigzag corbels shading cross-mullioned breeze apertures, serrated brick crown, and mosaic dome! */
function tbTrencadisLantern(cx,y0,cz,rBase,hTotal,o){
 o=o||{};
 const seg=8,drumH=hTotal*.56,domeH=hTotal*.44;
 const rDrum=rBase*.86,rPier=rDrum*.9;
 tbBio().windTowers++;
 svNoWalk(()=>{
  /* Base stepped rosebrick & cobalt curb */
  cyl('rosebrick',cx,y0,cz,rBase,drumH*.16,P('rosebrick'),seg);
  cyl('cobalt',cx,y0+drumH*.16,cz,rDrum+.04,drumH*.08,P('cobalt'),seg);

  /* 8 trencadis mosaic corner piers + cross-mullioned breeze openings + cantilevered stepped-brick zigzag corbel hoods! */
  const yW=y0+drumH*.24,wH=drumH*.52;
  for(let k=0;k<seg;k++){
   const a=k/seg*TAU,px=cx+Math.cos(a)*rPier,pz=cz+Math.sin(a)*rPier;
   cyl('trencadis',px,yW,pz,Math.max(.09,rBase*.13),wH,P('trencadis'),6);
   /* Mid-facet cross-mullion + cantilevered 3-step zigzag rosebrick corbel hood (Plate B4 signature!) */
   const am=(k+.5)/seg*TAU,yaw=Math.atan2(Math.sin(am),Math.cos(am));
   const mx=cx+Math.cos(am)*(rPier*.92),mz=cz+Math.sin(am)*(rPier*.92);
   const mullCol=P('alabaster');
   W(mx,yW,mz,yaw,()=>{
    box('alabaster',0,0,0,.06,wH-.06,.06,mullCol);
    box('alabaster',0,wH*.52,0,Math.max(.26,rBase*.42),.055,.095,mullCol);
    for(let s=0;s<3;s++){
     box('rosebrick',0,wH-.14+s*.085,.065+s*.055,Math.max(.32,rBase*.48+s*.08),.08,.11,P('rosebrick'));
    }
   });
  }

  /* Serrated diagonal-brick crown collar + trencadis neck */
  const yC=yW+wH;
  cyl('rosebrick',cx,yC,cz,rDrum+.1,drumH*.12,P('rosebrick'),seg);
  cyl('kashi',cx,yC+drumH*.12,cz,rDrum+.05,drumH*.12,P('kashi'),seg);

  /* Solid ceiling slab + {inward: true} interior soffit cone -> 0 sky leaks! */
  const yD=y0+drumH;
  cyl('ustun',cx,yD-.06,cz,rDrum*.94,.08,P('ustun'),seg);
  lathe('cedar',cx,cz,[
   [Math.max(.18,rDrum*.78),yD+.02],
   [Math.max(.1,rDrum*.42),yD+domeH*.52],
   [.01,yD+domeH*.78]
  ],seg,P('cedar'),{inward:true});

  /* Parabolic trencadis & kashi checkerboard mosaic cupola dome + 3D gilt star-cross finial! */
  lathe('trencadis',cx,cz,[
   [rDrum+.06,yD+.02],
   [rDrum*.88,yD+domeH*.34],
   [rDrum*.58,yD+domeH*.68],
   [rDrum*.24,yD+domeH*.92],
   [.08,yD+domeH]
  ],12,P('trencadis'),{uv:'cone'});
  cyl('kashi',cx,yD+domeH*.44,cz,rDrum*.78+.035,domeH*.12,P('kashi'),12,rDrum*.68+.035);
  cyl('gilt',cx,yD+domeH,cz,.14,.14,P('gilt'),8);
  box('gilt',cx,yD+domeH+.14,cz,.065,.46,.065,P('gilt'));
  box('kashi',cx,yD+domeH+.3,cz,.36,.07,.07,P('kashi'));
  box('kashi',cx,yD+domeH+.3,cz,.07,.07,.36,P('kashi'));
 });
 return y0+hTotal+.6;
}

/* Plate B5: Gaudi El Capricho cylindrical solar-glazed teal wind-chimney tower with stepped red-and-teal brick corbels,
   wrought-iron breeze balcony, and open 4-pillar cupola!
   When o.hollow === true (for inhabited corner towers / pharos), builds walkable base floor & operable door; otherwise builds
   a pure solar stack-updraft chimney shaft rising from roof or portico! */
function tbWindTower(cx,cz,rBot,y0,hTower,o){
 o=o||{};
 const pedH=o.pedH==null?Math.min(2.4,hTower*.2):o.pedH;
 const cupH=Math.min(3.4,Math.max(2.1,hTower*.24));
 const corbH=.68;
 const shH=Math.max(1.8,hTower-pedH-corbH-cupH);
 const rSh=rBot*.78,seg=16;
 tbBio().windTowers++;

 if(o.hollow&&pedH>=2.5){
  /* Walkable octagonal/square base room with operable kashi door */
  const bw=rBot*1.9,wt=.36;
  tbWallRing(cx-bw/2,cz-bw/2,cx+bw/2,cz+bw/2,y0,pedH,{
   register:'banded',t:wt,
   holes:{s:[{at:cx,w:1.35,h:2.15,door:true,name:o.doorName||'wind-tower-door'}]}
  });
  tbFloorSlab(cx,y0+.02,cz,bw-.3,bw-.3,{mk:'paving',th:.12});
  tbKundalCeiling(cx,y0+pedH-.12,cz,bw-.5,bw-.5,{mk:'kundal'});
 }else if(pedH>.15){
  svNoWalk(()=>{
   box('ashlar',cx,y0+.008,cz,rBot*2.04,Math.min(.32,pedH*.25),rBot*2.04,P('ashlar'));
   box('bandbrick',cx,y0+Math.min(.32,pedH*.25),cz,rBot*1.9,pedH-Math.min(.32,pedH*.25)-.14,rBot*1.9,P('bandbrick'));
   box('kashi',cx,y0+pedH-.14,cz,rBot*2.0,.14,rBot*2.0,P('kashi'));
  });
  if(o.block!==false&&y0<1.5)tbWallBlock(cx,y0,cz,rBot*1.85,pedH,rBot*1.85,0);
 }

 const ySh=y0+pedH;
 svNoWalk(()=>{
  /* Solar-absorbing alkaline-teal kashi cylindrical shaft + proud cobalt/escata/gilt relief rings */
  cyl('kashi',cx,ySh,cz,rSh,shH,P('kashi'),seg,rSh*.94);
  const nBands=Math.max(3,Math.round(shH/1.35));
  for(let i=1;i<nBands;i++){
   const f=i/nBands,yb=ySh+shH*f,rb=lerp(rSh,rSh*.94,f)+.038;
   const bMk=i%3===0?'gilt':(i%2===0?'cobalt':'escata');
   cyl(bMk,cx,yb-.055,cz,rb,.11,P(bMk),seg);
  }
  /* Narrow vertical stack-vent intake slots near top of shaft */
  for(let k=0;k<4;k++){
   const a=k*PI/2+PI/4;
   box('iron',cx+Math.cos(a)*(rSh*.95+.02),ySh+shH-.72,cz+Math.sin(a)*(rSh*.95+.02),.16,.48,.16,P('iron'),a);
  }

  /* Signature El Capricho cantilevered 4-step red-brick & teal-tile corbelled cornice + iron breeze balcony (Plate B5)! */
  const yCb=ySh+shH;
  for(let s=0;s<4;s++){
   const rs=rSh*.94+.09*(s+1),ys=yCb+s*(corbH/4);
   cyl(s%2===0?'rosebrick':'kashi',cx,ys,cz,rs,corbH/4,P(s%2===0?'rosebrick':'kashi'),seg);
  }
  const yBal=yCb+corbH,rBal=rSh*.94+.44;
  cyl('ashlar',cx,yBal,cz,rBal,.12,P('ashlar'),seg);
  /* Wrought-iron balcony railing ring */
  const nRail=12;
  for(let k=0;k<nRail;k++){
   const a=k/nRail*TAU,rx=cx+Math.cos(a)*(rBal-.08),rz=cz+Math.sin(a)*(rBal-.08);
   cyl('iron',rx,yBal+.12,rz,.026,.78,P('iron'),6);
   const a2=(k+1)/nRail*TAU,nx=cx+Math.cos(a2)*(rBal-.08),nz=cz+Math.sin(a2)*(rBal-.08);
   beam('iron',[rx,yBal+.88,rz],[nx,yBal+.88,nz],.035,P('iron'));
   beam('gilt',[rx,yBal+.5,rz],[nx,yBal+.5,nz],.025,P('gilt'));
  }

  /* Open 4-pillar verdigris/kashi breeze cupola + sky-tight trencadis domelet! */
  const yCup=yBal+.12,pH=cupH*.58,dH=cupH*.42,rCup=rSh*.72;
  for(let k=0;k<4;k++){
   const a=k*PI/2+PI/4;
   tbVerdigrisColumn(cx+Math.cos(a)*rCup,yCup,cz+Math.sin(a)*rCup,pH,{r:.11,block:false});
  }
  const yTop=yCup+pH;
  cyl('rosebrick',cx,yTop,cz,rCup*1.28,.12,P('rosebrick'),8);
  cyl('ustun',cx,yTop-.05,cz,rCup*1.16,.06,P('ustun'),8);
  lathe('cedar',cx,cz,[
   [Math.max(.14,rCup*.96),yTop+.04],
   [Math.max(.08,rCup*.48),yTop+dH*.55],
   [.01,yTop+dH*.82]
  ],8,P('cedar'),{inward:true});
  lathe('trencadis',cx,cz,[
   [rCup*1.32,yTop+.12],
   [rCup*.96,yTop+dH*.52],
   [rCup*.42,yTop+dH*.88],
   [.08,yTop+dH+.08]
  ],12,P('trencadis'),{uv:'cone'});
  sph('gilt',cx,yTop+dH+.18,cz,.14,P('gilt'),1,10);
  cyl('iron',cx,yTop+dH+.3,cz,.028,.38,P('iron'),6);
 });
 return y0+hTower+.55;
}

/* Plate B1-B2 & Bioclimatic Rule 5: Steep monsoon-shedding Zsolnay turquoise/cobalt glazed roof with solid kundal ceiling,
   cast-bronze corner rainwater gargoyle spouts, optional curvilinear Secessionist gables, verdigris globe finials,
   and optional central tbTrencadisLantern or tbEscataSpire! */
function tbZsolnayRoof(cx,y0,cz,w,d,o){
 o=o||{};
 const mode=o.mode||'hip',mk=o.mk||'zsolnay',col=o.col==null?P(mk):o.col;
 const over=o.over==null?.72:o.over;
 const rH=o.h==null?Math.max(1.65,Math.min(4.6,Math.min(w,d)*.32)):o.h;
 const curW=w+over*2,curD=d+over*2,hw=curW/2,hd=curD/2;

 if(o.ceiling!==false){
  tbKundalCeiling(cx,y0+.02,cz,Math.max(.4,w-.14),Math.max(.4,d-.14),{
   mk:o.ceilMk||'kundal',ribMk:'lacquer'
  });
 }

 let topY=y0+.12+rH;
 W(cx,0,cz,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   const yE=y0+.12;
   /* Solid wooden eave soffit slab + carved ustun fascia + cobalt eave drip band */
   box('ustun',0,yE,0,curW-.06,.09,curD-.06,P('ustun'));
   for(const sz of [-hd,hd])box('cobalt',0,yE+.015,sz,curW+.04,.095,.075,P('cobalt'));
   for(const sx of [-hw+.04,hw-.04])box('cobalt',sx,yE+.015,0,.075,.095,curD-.15,P('cobalt'));

   /* Carved eave brackets + 4 corner cast-bronze monsoon rainwater gargoyle spouts! */
   if(over>=.45){
    const bHW=Math.max(.6,hw-over*.85),bHD=Math.max(.6,hd-over*.85);
    const nSX=Math.max(2,Math.round(curW/2.8));
    for(let i=0;i<=nSX;i++){
     const sx=lerp(-bHW+.2,bHW-.2,i/nSX);
     for(const s of [-1,1])beam('carvedwood',[sx,yE-.46,s*bHD],[sx,yE-.01,s*(hd-.14)],.062,P('carvedwood'));
    }
    for(const sx of [-1,1])for(const sz of [-1,1]){
     beam('bronze',[sx*(hw-.25),yE+.04,sz*(hd-.25)],[sx*(hw+.34),yE-.06,sz*(hd+.34)],.055,P('bronze'),true,8);
    }
   }

   const yB=yE+.095,yT=yB+rH;
   const alongX=o.gableAxis!=='z'&&(o.gableAxis==='x'||curW>=curD);

   if(mode==='gable'){
    if(alongX){
     const PW=[-hw+.05,yT,0],PE=[hw-.05,yT,0];
     poly(mk,[[-hw,yB,hd],[hw,yB,hd],PE,PW],col);
     poly(mk,[[hw,yB,-hd],[-hw,yB,-hd],PW,PE],col);
     /* Secessionist cream stucco & rosebrick gable tympanums inset 9 cm inside +-hw + kashi roundel boss! */
     for(const s of [-1,1]){
      const gx=s*(hw-.09);
      if(s>0){
       poly('stucco',[[gx,yB,hd-.14],[gx,yB,-hd+.14],[gx,yT-.06,0]],P('stucco'));
      }else{
       poly('stucco',[[gx,yB,-hd+.14],[gx,yB,hd-.14],[gx,yT-.06,0]],P('stucco'));
      }
      WX(gx+s*.035,yB+rH*.38,0,0,0,PI/2,()=>{
       cyl('rosebrick',0,-.03,0,Math.min(.48,rH*.22),.06,P('rosebrick'),12);
       cyl('kashi',0,-.045,0,Math.min(.32,rH*.14),.09,P('kashi'),12);
      });
     }
     box('cobalt',0,yT,0,curW-.1,.13,.19,P('cobalt'));
     for(const sx of [-1,1]){
      cyl('verdigris',sx*(hw-.22),yT+.13,0,.13,.22,P('verdigris'),10);
      sph('verdigris',sx*(hw-.22),yT+.48,0,.18,P('verdigris'),1,10);
      sph('gilt',sx*(hw-.22),yT+.69,0,.065,P('gilt'),1,8);
     }
    }else{
     const PN=[0,yT,-hd+.05],PS=[0,yT,hd-.05];
     poly(mk,[[-hw,yB,-hd],[-hw,yB,hd],PS,PN],col);
     poly(mk,[[hw,yB,hd],[hw,yB,-hd],PN,PS],col);
     for(const s of [-1,1]){
      const gz=s*(hd-.09);
      if(s>0){
       poly('stucco',[[-hw+.14,yB,gz],[hw-.14,yB,gz],[0,yT-.06,gz]],P('stucco'));
      }else{
       poly('stucco',[[hw-.14,yB,gz],[-hw+.14,yB,gz],[0,yT-.06,gz]],P('stucco'));
      }
      WX(0,yB+rH*.38,gz+s*.035,PI/2,0,0,()=>{
       cyl('rosebrick',0,-.03,0,Math.min(.48,rH*.22),.06,P('rosebrick'),12);
       cyl('kashi',0,-.045,0,Math.min(.32,rH*.14),.09,P('kashi'),12);
      });
     }
     box('cobalt',0,yT,0,.19,.13,curD-.1,P('cobalt'));
     for(const sz of [-1,1]){
      cyl('verdigris',0,yT+.13,sz*(hd-.22),.13,.22,P('verdigris'),10);
      sph('verdigris',0,yT+.48,sz*(hd-.22),.18,P('verdigris'),1,10);
      sph('gilt',0,yT+.69,sz*(hd-.22),.065,P('gilt'),1,8);
     }
    }
    topY=yT+.72;
   }else{
    /* Steep Zsolnay 4-way hipped roof closing to ridge or central ventilation lantern pad */
    let tw,td;
    if(o.lantern||o.spire){
     const rCap=o.lanternR==null?Math.min(hw,hd)*.32:o.lanternR;
     tw=rCap;td=rCap;
    }else if(curW>=curD){
     tw=Math.max(.4,hw-hd*.68);td=.15;
    }else{
     tw=.15;td=Math.max(.4,hd-hw*.68);
    }
    const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
    const A2=[-tw,yT,-td],B2=[tw,yT,-td],C2=[tw,yT,td],D2=[-tw,yT,td];
    poly(mk,[D,C,C2,D2],col);
    poly(mk,[C,B,B2,C2],col);
    poly(mk,[B,A,A2,B2],col);
    poly(mk,[A,D,D2,A2],col);

    /* Optional front Secessionist curvilinear dormer gable with rosebrick pilasters & kashi roundel (Plates B1 & B2)! */
    if(o.dormer&&curW>=6.5){
     const dw=Math.min(3.2,curW*.3),dy0=yB+.14,dy1=yB+rH*.74,dz=hd-.34;
     box('stucco',0,dy0,dz-.24,dw,dy1-dy0-.26,.52,P('stucco'));
     for(const sx of [-dw/2+.12,dw/2-.12]){
      box('rosebrick',sx,dy0,dz+.04,.24,dy1-dy0-.26,.06,P('rosebrick'));
     }
     box('rosebrick',0,dy1-.26,dz-.21,dw+.18,.14,.62,P('rosebrick'));
     box('terracotta',0,dy1-.12,dz-.19,dw*.64,.18,.65,P('terracotta'));
     box('trencadis',0,dy0+(dy1-dy0)*.34,dz+.04,dw*.44,(dy1-dy0)*.34,.045,P('trencadis'));
     WX(0,dy0+(dy1-dy0)*.5,dz+.085,PI/2,0,0,()=>{
      cyl('kashi',0,-.025,0,.28,.05,P('kashi'),12);
     });
     sph('verdigris',0,dy1+.18,dz-.14,.14,P('verdigris'),1,10);
    }

    if(!o.lantern&&!o.spire){
     /* Cobalt pyrogranite ridge bar + Lechner verdigris & gilt globe finials (Plate B1)! */
     box('cobalt',0,yT,0,tw*2+.14,.13,td*2+.14,P('cobalt'));
     if(tw>td+.2){
      for(const sx of [-tw,tw]){
       cyl('verdigris',sx,yT+.13,0,.13,.2,P('verdigris'),10);
       sph('verdigris',sx,yT+.46,0,.18,P('verdigris'),1,10);
       sph('gilt',sx,yT+.67,0,.065,P('gilt'),1,8);
      }
     }else if(td>tw+.2){
      for(const sz of [-td,td]){
       cyl('verdigris',0,yT+.13,sz,.13,.2,P('verdigris'),10);
       sph('verdigris',0,yT+.46,sz,.18,P('verdigris'),1,10);
       sph('gilt',0,yT+.67,sz,.065,P('gilt'),1,8);
      }
     }else{
      cyl('verdigris',0,yT+.13,0,.15,.22,P('verdigris'),10);
      sph('verdigris',0,yT+.48,0,.2,P('verdigris'),1,10);
      sph('gilt',0,yT+.71,0,.07,P('gilt'),1,8);
     }
     topY=yT+.75;
    }else if(o.spire){
     const rSp=o.lanternR==null?Math.min(w,d)*.22:o.lanternR;
     const hSp=o.lanternH==null?Math.max(3.6,rSp*2.4):o.lanternH;
     topY=tbEscataSpire(0,yT-.06,0,rSp,hSp,o);
    }else{
     const rLn=o.lanternR==null?Math.min(w,d)*.22:o.lanternR;
     const hLn=o.lanternH==null?Math.max(3.2,rLn*2.05):o.lanternH;
     topY=tbTrencadisLantern(0,yT-.06,0,rLn,hLn,o);
    }
   }
  });
 });
 return topY;
}

/* Plate A1: Samarkand Shah-i-Zinda monumental embossed turquoise/cobalt kashi pishtaq portal with twisted ceramic
   corner colonnettes, recessed muqarnas iwan soffit, and Tifinagh salt-mark frieze! */
function tbPishtaqPortal(x,y0,z,yaw,w,h,o){
 o=o||{};
 const openW=o.openW==null?w*.52:o.openW,openH=o.openH==null?h*.68:o.openH;
 const dep=o.dep==null?1.65:o.dep,pierW=(w-openW)/2;
 tbBio().openLoggias++;
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Twin flanking portal piers clad in buffbrick + embossed kashi & cobalt strapwork panels + twisted turquoise colonnettes */
   for(const s of [-1,1]){
    const px=s*(openW/2+pierW/2);
    box('alabaster',px,0,0,pierW+.06,.42,dep+.08,P('alabaster'));
    box('buffbrick',px,.42,0,pierW,h-.42,dep,P('buffbrick'));
    /* Embossed cobalt & kashi vertical panel proud on front face */
    box('cobalt',px,.54,dep/2+.035,pierW-.18,h-1.15,.05,P('cobalt'));
    box('kashi',px,.68,dep/2+.07,pierW-.34,h-1.45,.045,P('kashi'));
    /* Outer & inner twisted turquoise ceramic colonnettes */
    cyl('kashi',s*(w/2-.08),.42,dep/2+.05,.12,h-.78,P('kashi'),10);
    cyl('gilt',s*(w/2-.08),h-.36,dep/2+.05,.15,.14,P('gilt'),10);
    cyl('kashi',s*(openW/2+.08),.42,dep/2+.05,.1,openH-.42,P('kashi'),10);
   }
   /* Arch head & epigraphic Tifinagh salt-mark frieze */
   const headH=h-openH;
   box('buffbrick',0,openH,0,openW,headH,dep,P('buffbrick'));
   box('cobalt',0,openH+.08,dep/2+.035,openW-.08,headH-.42,.05,P('cobalt'));
   box('trencadis',0,openH+.18,dep/2+.07,openW-.28,Math.max(.24,headH-.68),.042,P('trencadis'));
   /* Stepped turquoise muqarnas arch shoulders inside iwan */
   for(const s of [-1,1]){
    box('kashi',s*(openW*.34),openH-.38,0,openW*.3,.38,dep-.12,P('kashi'));
    box('kundal',s*(openW*.18),openH-.18,0,openW*.22,.18,dep-.16,P('kundal'));
   }
   /* Full-width crown epigraphic kashi frieze + rosebrick merlon dentils */
   box('kashi',0,h-.3,0,w+.12,.2,dep+.12,P('kashi'));
   box('rosebrick',0,h-.1,0,w+.18,.1,dep+.18,P('rosebrick'));
   const nM=Math.max(4,Math.round(w/.75));
   for(let i=0;i<nM;i++){
    const mx=lerp(-w/2+.22,w/2-.22,i/(nM-1));
    box('kashi',mx,h,0,.28,.22,.28,P('kashi'));
   }
  });
  /* Solid coffered ceiling inside pishtaq vault */
  tbKundalCeiling(0,openH-.08,0,openW-.06,dep-.12,{mk:'kundal'});
  if(o.door){
   tbKashiDoor(0,0,0,0,Math.min(openW-.2,2.6),Math.min(openH-.45,2.8),{
    t:.42,pishtaq:false,leafMk:o.leafMk||'ustun',name:o.doorName||'pishtaq-gate'
   });
  }else if(o.walk!==false){
   wkPad(0,0,openW,dep+.8,0);
  }
 });
 if(o.blockSides!==false){
  const cs=Math.cos(yaw==null?0:yaw),sn=Math.sin(yaw==null?0:yaw);
  for(const s of [-1,1]){
   const lx=s*(openW/2+pierW/2);
   tbWallBlock(x+lx*cs,y0,z-lx*sn,pierW,h,dep,yaw==null?0:yaw);
  }
 }
}

/* Catenary silk or canvas sun-velarium awning shading souq alleys & courtyards while allowing hot air to escape! */
function tbSunVelarium(x0,z0,x1,z1,y0,wSpan,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.5)return;
 const yaw=Math.atan2(dx,dz),wid=wSpan==null?3.2:wSpan;
 const mk=o.mk||'silk',col=o.col==null?P(o.pal||'silk'):o.col;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   const nSeg=4,sag=.28;
   for(let i=0;i<nSeg;i++){
    const f0=i/nSeg,f1=(i+1)/nSeg;
    const zA=lerp(-L/2,L/2,f0),zB=lerp(-L/2,L/2,f1);
    const yA=y0-Math.sin(f0*PI)*sag,yB=y0-Math.sin(f1*PI)*sag;
    poly(mk,[[-wid/2,yA,zA],[wid/2,yA,zA],[wid/2,yB,zB],[-wid/2,yB,zB]],col);
   }
   for(const sx of [-wid/2,wid/2])for(const sz of [-L/2,L/2]){
    sph('bronze',sx,y0+.03,sz,.055,P('bronze'),1,6);
   }
  });
 });
}

/* Fluttering Tabisti guild/city banner hung from a bronze-tipped cedar mast (SV_CLOTH animated in atmWind). */
function tbBanner(x,y0,z,hPole,o){
 o=o||{};
 const hp=hPole==null?4.6:hPole,pal=o.pal||'flag';
 svNoWalk(()=>{
  cyl('alabaster',x,y0+.008,z,.2,.14,P('alabaster'),8);
  cyl('ustun',x,y0+.148,z,.055,hp-.22,P('ustun'),8);
  sph('gilt',x,y0+hp-.04,z,.095,P('gilt'),1,8);
  const bw=.72,bh=Math.min(2.1,hp*.46),by=y0+hp-.28;
  box('bronze',x+.38,by,z,bw+.08,.045,.045,P('bronze'));
  poly('flag',[[x+.06,by-.03,z],[x+.06+bw,by-.03,z],[x+.06+bw*.82,by-bh,z],[x+.06,by-bh*.88,z]],P(pal));
 });
}
