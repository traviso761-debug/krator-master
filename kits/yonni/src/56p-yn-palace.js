// prefix: ynp
// ================================================================= TWIN-QUEEN PALACE & ROYAL COURT MONUMENTS (palace.zip)
// Synthesizes all 6 references in palace.zip into Yonni's Twin Spear-Queen (Sfira-Kandetae) royal architecture:
//   - Sweeping radial stepped stone amphitheatre approaches with carved cheek-walls & vomitorium portals (pyrmid3.jpg)
//   - Two-tier peripteral fluted colonnades with carved relief entablature, upper balustrade & diagonal struts (pyrmid3.jpg)
//   - Twin colossal Spear-Queen guardian statues, fluted royal arch-pylons & smoking beacon towers (9f58769a)
//   - Twin battered sea-lime keep-drums with gilt-rimmed verdigris domes & polished bronze Rain-Globe cisterns (560fe58f)
//   - Circular bronze/verdigris oculus medallions & vaulted ribbed conservatory gallery bridges (aef38adc, c07f020e, 861d6426)

/* 1. Circular Bronze, Gilt & Verdigris Oculus Sun-Medallion (aef38adc & c07f020e; steps strictly +z from wall face z=0) */
function ynpOculusMedallion(r,o){
 o=o||{};const trCol=P('travertine'),vdCol=P('verdigris'),gtCol=P('gilt'),bzCol=P('bronze');
 svNoWalk(()=>{
  /* vertical roundel strip tail descending below the oculus (c07f020e, aef38adc) */
  const tailH=o.tailH==null?r*1.55:o.tailH;
  if(tailH>.2){
   box('travertine',0,-tailH-.04,.022,r*.46,tailH,.028,trCol);
   box('gilt',0,-tailH-.02,.044,r*.16,tailH-.04,.018,gtCol);
   const nR=Math.max(2,Math.floor(tailH/(r*.42)));
   for(let k=0;k<nR;k++){
    const yy=-(k+.5)*(tailH/nR)-.04;
    WX(0,yy,.040,0,PI/2,0,()=>cyl('verdigris',0,0,0,r*.14,.016,vdCol,10));
   }
  }
  /* outer travertine gear-toothed collar (.010 .. .038) */
  WX(0,0,.010,0,PI/2,0,()=>cyl('travertine',0,0,0,r,.028,trCol,20));
  /* patinated verdigris recessed field (.042 .. .062) */
  WX(0,0,.042,0,PI/2,0,()=>cyl('verdigris',0,0,0,r*.76,.020,vdCol,18));
  /* burnished gilt-bronze inner ring (.066 .. .086) */
  WX(0,0,.066,0,PI/2,0,()=>cyl('gilt',0,0,0,r*.52,.020,gtCol,16));
  /* dark ironstone pupil recess (.090 .. .104) + twin-spear gilt boss (.108 .. .126) */
  WX(0,0,.090,0,PI/2,0,()=>cyl('ironstone',0,0,0,r*.34,.014,0x221b18,14));
  WX(0,0,.108,0,PI/2,0,()=>cyl('bronze',0,0,0,r*.18,.018,bzCol,12));
 });
}

/* 2. Colossal Carved Stone & Bronze Spear-Queen (Kande) Guardian Statue (9f58769a; height ~5.8 m above pedestal) */
function ynpGuardianStatue(x,y,z,ry,sg){
 const trCol=P('travertine'),rlCol=P('relief'),vdCol=P('verdigris'),bzCol=P('bronze'),gtCol=P('gilt');
 ynNoCut(()=>svNoWalk(()=>W(x,y,z,ry||0,()=>{
  /* stepped ashlar & travertine statue socle */
  box('ashlar',0,.005,0,1.95,1.15,1.75,P('ashlar'));
  box('travertine',0,1.162,0,1.68,.36,1.52,trCol);
  /* fluted columnar pleated stone gown + carved relief mantle (9f58769a) */
  cyl('relief',0,1.53,0,.66,2.35,rlCol,12,.52);
  box('travertine',0,1.62,-.18,1.26,2.85,.44,trCol);
  /* verdigris bronze royal scale-cuirass & shoulder pauldrons */
  cyl('verdigris',0,3.89,0,.56,1.05,vdCol,12,.62);
  for(const sx of [-1,1]){
   sph('bronze',sx*.64,4.78,.04,.24,bzCol,.85,8);
   cyl('travertine',sx*.66,3.55,.08,.15,1.18,trCol,8);
  }
  /* sculpted stone head + high Sarmatian-KushiticTwin-Plume bronze Spear-Queen crown-helm */
  cyl('travertine',0,4.95,0,.22,.22,trCol,10);
  ellip('relief',0,5.42,.03,.30,.36,.32,rlCol,0,10);
  cyl('gilt',0,5.68,.02,.32,.18,gtCol,12,.26);
  cone('bronze',0,5.87,0,.25,.58,bzCol,10);
  /* upright ceremonial bronze spear in outer hand + coastal round shield at inner hip */
  const spX=(sg==null?1:sg)*.78;
  cyl('bronze',spX,1.54,.36,.042,4.95,bzCol,8);
  cone('gilt',spX,6.50,.36,.095,.48,gtCol,8);
  WX(-spX*.72,3.35,.54,0,PI/2,0,()=>{
   cyl('verdigris',0,0,0,.52,.05,vdCol,14);
   cyl('bronze',0,.055,0,.16,.04,gtCol,10);
  });
 })));
}

/* 3. Polished Bronze Spherical Rain-Catch Cistern Globe with Spiral Catwalk & Spillway (560fe58f) */
function ynpRainGlobe(x,y,z,r,o){
 o=o||{};const bzCol=P('gilt'),cpCol=P('bronze'),vdCol=P('verdigris'),asCol=P('ashlar');
 ynNoCut(()=>svNoWalk(()=>W(x,y,z,o.ry||0,()=>{
  /* stepped stone basin & 4 angled bronze trunnion legs */
  cyl('ashlar',0,.005,0,r*1.22,.42,asCol,16);
  cyl('water',0,.43,0,r*1.04,.06,0x2e7e88,16);
  for(let i=0;i<4;i++){
   const a=i*PI/2+PI/4,ca=Math.cos(a),sa=Math.sin(a);
   beam('bronze',[ca*r*.88,.42,sa*r*.88],[ca*r*.52,.42+r*.72,sa*r*.52],.14,cpCol,false,undefined,.18);
  }
  /* giant burnished copper-bronze spherical cistern + verdigris crown collar & water spillway */
  const cy=.48+r*1.02;
  sph('gilt',0,cy,0,r,bzCol,.96,18);
  ring('bronze',0,cy,0,r*1.01,.055,cpCol,0,0,0,20);
  cyl('verdigris',0,cy+r*.90,0,r*.28,.26,vdCol,12);
  /* front spillway spout + falling water column into basin (560fe58f!) */
  box('bronze',0,cy-.12,r*.92,.36,.16,.28,cpCol);
  box('water',0,.49,r*.98,.26,cy-.55,.10,0x6ec4ce);
 })));
}

/* 4. Vaulted Ribbed Verdigris-and-Glass Royal Gallery Bridge (aef38adc conservatory bridge) */
function ynpVaultBridge(ax,ay,az,bx,by,bz,w){
 const bw=w==null?1.85:w;
 ynGangplank(ax,ay,az,bx,by,bz,bw,{});
 const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);
 const vdCol=P('verdigris'),bzCol=P('bronze'),asCol=P('ashlar');
 ynNoCut(()=>W((ax+bx)/2,(ay+by)/2,(az+bz)/2,yaw,()=>{
  /* ashlar stone arch rib under the bridge deck */
  svNoWalk(()=>{
   for(let i=0;i<6;i++){
    const t0=(i+.05)/6-.5,t1=(i+.95)/6-.5;
    const yA=-.24-1.35*(1-Math.cos(t0*PI)),yB=-.24-1.35*(1-Math.cos(t1*PI));
    beam('ashlar',[0,yA,t0*L],[0,yB,t1*L],bw*.78,asCol,false,undefined,.28);
   }
   /* 5 arched bronze conservatory ribs + glazed side panels + verdigris vaulted ridge hood (aef38adc) */
   const hWall=1.35,rV=bw*.56;
   for(let k=0;k<5;k++){
    const zz=((k+.5)/5-.5)*(L-.24);
    for(const sx of [-1,1])cyl('bronze',sx*(bw/2-.06),.02,zz,.048,hWall,bzCol,8);
    ring('bronze',0,hWall+.02,zz,rV,.048,bzCol,0,PI/2,0,14);
   }
   for(const sx of [-1,1]){
    quad('glass',sx*(bw/2-.06),.72,0,L-.36,1.12,0xcfe8ec,PI/2);
    plane4('verdigris',[sx*.04,hWall+rV+.08,-(L-.16)/2],[sx*.04,hWall+rV+.08,(L-.16)/2],[sx*(rV+.12),hWall+.06,-(L-.16)/2],.05,vdCol);
   }
   beam('gilt',[0,hWall+rV+.13,-(L-.14)/2],[0,hWall+rV+.13,(L-.14)/2],.065,P('gilt'));
  });
 }));
}

/* 5. Radial Stepped Amphitheatre Terrace with Vomitorium Portals & Cheek-Walls (pyrmid3.jpg) */
function ynpRadialStairs(cx,cz,rInner,rOuter,yTop,nSteps,portalAngles){
 const n=nSteps==null?6:nSteps,dr=(rOuter-rInner)/n,dh=yTop/n;
 const trCol=P('travertine'),asCol=P('ashlar'),dkCol=0x1e1916;
 const pList=portalAngles||[];
 ynNoCut(()=>{
  for(let i=0;i<n;i++){
   /* outer step i=0 is lowest, inner step i=n-1 reaches yTop-.01 */
   const ra=rOuter-dr*(i+1)+.006,rb=rOuter-dr*i,yt=dh*(i+1)-.008,yb=Math.max(.004,dh*i-.04);
   if(!pList.length){
    sector('travertine',cx,cz,ra,rb,0,TAU,yb,yt,trCol,32);
   }else{
    /* leave clean vomitorium gaps around each portal angle on outer 4 steps */
    const sorted=pList.slice().sort((a,b)=>a-b);
    const da=i<n-2?.14:0;
    if(da===0){
     sector('travertine',cx,cz,ra,rb,0,TAU,yb,yt,trCol,32);
    }else{
     let cur=sorted[0]+da;
     for(let k=0;k<sorted.length;k++){
      const next=(k+1<sorted.length?sorted[k+1]:sorted[0]+TAU)-da;
      if(next-cur>.02)sector('travertine',cx,cz,ra,rb,cur,next,yb,yt,trCol,Math.max(4,Math.round((next-cur)*5)));
      cur=(k+1<sorted.length?sorted[k+1]:sorted[0]+TAU)+da;
     }
    }
   }
  }
  /* sculpted sloping stone cheek-walls & dark vaulted vomitorium mouths at each portal angle (pyrmid3.jpg!) */
  for(const pa of pList){
   const yaw=ynYawFromA(pa),rm=lerp(rInner,rOuter,.58);
   W(cx+Math.cos(pa)*rm,0,cz+Math.sin(pa)*rm,yaw,()=>svNoWalk(()=>{
    const pw=(rInner+rOuter)*.5*.26,pd=(rOuter-rInner)*.66;
    for(const sx of [-1,1]){
     box('ashlar',sx*(pw/2+.16),.01,0,.28,yTop*.76,pd,asCol);
     sph('bronze',sx*(pw/2+.16),yTop*.76+.14,pd*.42,.15,P('bronze'),1,8);
    }
    box('travertine',0,yTop*.58,-.12,pw+.64,.22,pd*.72,trCol);
    box('ironstone',0,.02,-.28,pw-.06,yTop*.55,.12,dkCol);
   }));
   /* walkable strip up the adjacent stair flight */
   const aSt=pa+.24;
   svStripWalk([cx+Math.cos(aSt)*rOuter,0,cz+Math.sin(aSt)*rOuter],[cx+Math.cos(aSt)*rInner,yTop,cz+Math.sin(aSt)*rInner],2.1);
  }
 });
}

/* ================================================================= 1. MONUMENTAL TWIN-QUEEN PALACE COMPLEX (yn-palace-citadel) */
defBuilding({key:'yn-palace-citadel',name:'Kande-Palas Twin-Queen Royal Palace & Citadel',seed:7212,cls:'building',w:35.6,d:28.8,h:28.6,budget:120000,cut:true,
 tags:{types:['civic','military','religious'],wealth:'rich',style:'freestanding',role:'palace'},
 note:'Monumental Twin Spear-Queens centerpiece palace (palace.zip): radial stepped amphitheatre approach, Twin Colossal Kande guardian statues, two-tier fluted colonnaded Great Rotunda under an oversailing gilt/verdigris dome, flanked by symmetric battered Queen Keep-Drums linked via glazed ribbed vault-bridges and a polished bronze Rain-Globe cistern.',
 build(){
  const cz=-1.15,yDeck=1.56,rTerr=9.85,rRot=7.55,rIn=5.65,wt=.46;
  const trCol=P('travertine'),slWarm=P('sealimeW'),slCol=P('sealime'),rlCol=P('relief'),iwCol=P('ironwood'),bzCol=P('bronze'),gtCol=P('gilt'),vdCol=P('verdigris');

  /* 1. Zero-Podium Battered Cobble Root-Skirt + Radial Stepped Ceremonial Terrace (pyrmid3.jpg + 9f58769a) */
  const flCol=P('flagstone');
  ynRootSkirt(0,cz,rTerr,7.2,{mk:'cobble',plinthH:.32,seg:24});
  ynpRadialStairs(0,cz,rRot+.18,rTerr,yDeck,6,[PI*.34,PI*.66]);
  ynFloorDisc(0,cz,rRot+.16,yDeck,'flagstone',flCol,{seg:24});

  /* Projecting Front Royal Prow-Bastion & Grand Ceremonial Stair flanked by Twin Colossal Spear-Queen Statues (9f58769a!) */
  ynNoCut(()=>{
   const zProw=7.65,zJoin=cz+rRot+.18;
   ynBelowGrade(()=>box('cobble',0,-5.4,zProw,6.6,5.4,4.8,P('cobble')));
   box('travertine',0,0,zProw,6.2,yDeck-.14,4.4,trCol);
   const pPts=[[-3.15,zJoin],[3.15,zJoin],[3.15,zProw+2.22],[-3.15,zProw+2.22]];
   svNoWalk(()=>prism('flagstone',pPts,yDeck-.13,yDeck,flCol));
   svFloor(pPts,yDeck);
   /* grand central ceremonial stone stair rising from z = +11.45 up to the prow terrace z = +9.85 */
   svStair(0,11.45,0,yDeck,PI,{style:'solid',w:3.6,mk:'travertine',col:trCol,run:1.85});
   for(const sx of [-1,1]){
    box('travertine',sx*2.05,0,10.55,.42,yDeck+.55,1.95,trCol);
    ynBanner(sx*2.65,yDeck,zProw+1.85,0,3.6,sx<0?P('carnelian'):P('indigo'));
   }
   /* Twin Colossal Spear-Queen (Kande) Guardian Statues flanking the Royal Forecourt (clear outside rTerr!) */
   ynpGuardianStatue(-5.75,.012,8.85,0,-1);
   ynpGuardianStatue(5.75,.012,8.85,0,1);

   /* Rear Seer-Apse Counter-Buttress at z = -8.95 (balances +11.45 front stair so oz === 0.00!) */
   ynRootSkirt(0,-8.95,2.35,5.8,{mk:'cobble',plinthH:.38,seg:16});
   svNoWalk(()=>cyl('travertine',0,0,-8.95,2.25,5.8,trCol,14,1.95));
   ynCanopy(0,-8.95,1.95,2.55,5.8,2.15,{mk:'verdigris',ribs:6,finialScale:.85,seg:16});
  });

  /* 2. Central Great Dual-Throne Rotunda: Two-Tier Peripteral Colonnade & Fluted Triumphal Arch Pylon (pyrmid3 + 9f58769a) */
  const hTier1=4.65,yTier2=yDeck+hTier1+.58,hTier2=4.55;
  /* Inner Royal Sanctuary Drum (y = 1.56 .. 11.34) */
  ynDrumWall(0,cz,rIn-wt,rIn,yDeck,hTier1,'sealimeWarm',slWarm,[
   {a:PI/2,w:2.35,h:3.35,door:true,visor:false},
   {a:0,w:1.35,h:2.55,door:true,open:true},{a:PI,w:1.35,h:2.55,door:true,open:true},
   {a:-PI/2,w:1.15,y:1.25,h:1.85,pane:'stained'}
  ],{visors:false});
  ynFloorDisc(0,cz,rRot+.08,yTier2,'floor',P('floor'),{seg:24});
  ynDrumWall(0,cz,rIn-wt-.04,rIn-.04,yTier2,hTier2,'sealime',slCol,[
   {a:PI/2,w:1.85,y:.65,h:2.55,pane:'stained'},
   {a:0,w:1.35,y:.15,h:2.25,door:true,open:true},{a:PI,w:1.35,y:.15,h:2.25,door:true,open:true},
   {a:PI*.25,w:.95,y:.95,h:1.85},{a:PI*.75,w:.95,y:.95,h:1.85},
   {a:-PI*.25,w:.95,y:.95,h:1.85},{a:-PI*.75,w:.95,y:.95,h:1.85}
  ]);

  /* Outer Two-Tier Fluted Peristyle Colonnade + Carved Relief Entablature + Diagonal Struts (pyrmid3.jpg!) */
  ynNoCut(()=>{
   const nCols=16,rCol1=rRot-.42,rCol2=rRot-.52;
   for(let i=0;i<nCols;i++){
    const a=i/nCols*TAU,ca=Math.cos(a),sa=Math.sin(a);
    /* skip front-center column so the grand triumphal arch stands wide open */
    if(Math.abs(a-PI/2)<.12)continue;
    /* Lower heavy fluted travertine column + bronze base & capital */
    const x1=ca*rCol1,z1=cz+sa*rCol1;
    cyl('bronze',x1,yDeck+.006,z1,.38,.28,bzCol,10);
    cyl('travertine',x1,yDeck+.292,z1,.29,hTier1-.52,trCol,10,.26);
    cyl('gilt',x1,yDeck+hTier1-.22,z1,.37,.21,gtCol,10);
    /* Upper slender column + diagonal radial ironwood eave-struts (pyrmid3.jpg!) */
    const x2=ca*rCol2,z2=cz+sa*rCol2;
    cyl('bronze',x2,yTier2+.006,z2,.31,.22,bzCol,10);
    cyl('travertine',x2,yTier2+.232,z2,.23,hTier2-.46,trCol,10,.20);
    cyl('gilt',x2,yTier2+hTier2-.22,z2,.31,.21,gtCol,10);
    beam('ironwood',[x2,yTier2+hTier2-1.25,z2],[ca*(rRot+1.25),yTier2+hTier2-.06,cz+sa*(rRot+1.25)],.09,iwCol,false,undefined,.12);
    /* Intercolumnar upper balustrade segments strictly between adjacent bronze column bases! */
    const aNext=(i+1)/nCols*TAU;
    if(Math.abs(aNext-PI/2)>=.12&&!(Math.abs(a)<.05||Math.abs(a-PI)<.05)){
     sector('travertine',0,cz,rRot-.34,rRot-.08,a+.065,aNext-.065,yTier2+.014,yTier2+.84,trCol,2);
    }
   }
   /* Richly carved annular Relief Entablature Frieze (pyrmid3.jpg) */
   sector('travertine',0,cz,rRot-.88,rRot+.08,0,TAU,yDeck+hTier1+.006,yDeck+hTier1+.26,trCol,24);
   sector('relief',0,cz,rRot-.82,rRot+.14,0,TAU,yDeck+hTier1+.268,yTier2-.01,rlCol,24);

   /* Twin Vertical Fluted Royal Arch-Pylons framing the Grand Front Portal (9f58769a centerpiece!) */
   const zPylon=cz+rRot+.58;
   for(const sx of [-1,1]){
    box('travertine',sx*2.18,yDeck+.014,zPylon,1.08,hTier1+hTier2+.50,.72,trCol);
    box('relief',sx*2.18,yDeck+.65,zPylon+.39,.56,hTier1+hTier2-.65,.05,rlCol);
    box('gilt',sx*2.18,yDeck+hTier1+hTier2+.52,zPylon,1.22,.18,.84,gtCol);
   }
   /* Coffered Royal Arch Lintel + Bronze Oculus Medallion above the Triumphal Arch */
   box('travertine',0,yTier2+2.65,zPylon,3.26,1.92,.64,trCol);
   W(0,yTier2+3.62,zPylon+.33,0,()=>ynpOculusMedallion(.78,{tailH:0}));

   /* 3. Vast Oversailing Ribbed Dome-Mushroom Canopy + Clerestory Drum & Royal Lantern (pyrmid3 + 9f58769a + 560fe58f) */
   const yEave=yTier2+hTier2,rEave=9.35,rCler=5.35;
   sector('travertine',0,cz,rIn-.12,rRot+.22,0,TAU,yEave+.006,yEave+.42,trCol,24);
   /* Wide oversailing bell-curved canopy skirt (pyrmid3.jpg umbrella lip) rising to upper dome clerestory */
   ynCanopy(0,cz,rRot+.15,rEave,yEave+.44,2.85,{mk:'shingle',col:P('shingle'),ribs:16,rHub:rCler,finial:false,bell:.34,seg:24});
   /* Upper colonnaded dome drum (9f58769a) + grand smooth Verdigris & Gilt-Bronze Sovereign Dome */
   const yCler=yEave+3.28;
   ynArcadeRing(0,cz,rCler-.38,rCler,yCler,2.15,16,{paraH:.38,paraMk:'travertine',colMk:'travertine',colCol:trCol,spandrelMk:'gilt',spandrelCol:gtCol,archH:.42,colR:.11});
   const yDome=yCler+2.16;
   lathe('verdigris',0,cz,[
    [rCler+.04,yDome],[rCler*.92,yDome+1.45],[rCler*.70,yDome+2.85],[rCler*.38,yDome+3.85],[1.38,yDome+4.35]
   ],24,vdCol,{uv:'cone'});
   /* Solid travertine-and-gilt interior dome vault soffit so looking up from inside the Dual-Throne Hall shows a coffered vault, never sky! */
   lathe('travertine',0,cz,[
    [rCler-.05,yDome-.04],[rCler*.90,yDome+1.39],[rCler*.68,yDome+2.79],[rCler*.36,yDome+3.79],[1.34,yDome+4.31]
   ],24,trCol,{uv:'cone',inward:true});
   ring('gilt',0,yDome+.05,cz,rCler+.08,.09,gtCol,0,0,0,22);
   ring('gilt',0,yDome+4.35,cz,1.42,.08,gtCol,0,0,0,18);
   for(let i=0;i<12;i++){
    const a=i/12*TAU,ca=Math.cos(a),sa=Math.sin(a);
    beam('gilt',[ca*(rCler+.02),yDome+.12,cz+sa*(rCler+.02)],[ca*1.44,yDome+4.36,cz+sa*1.44],.055,gtCol,true,6);
   }
   /* Sovereign Lantern Cupola + Monumental 1.45x Twin-Spear Finial */
   ynArcadeRing(0,cz,.98,1.34,yDome+4.38,1.75,8,{paraH:.28,paraMk:'gilt',paraCol:gtCol,colMk:'bronze',spandrelMk:'verdigris',archH:.36,colR:.07});
   ynCanopy(0,cz,1.34,1.92,yDome+6.14,1.35,{mk:'verdigris',ribs:8,finialScale:1.45,seg:18});
  });

  /* 4. Twin Symmetric Queen Keep-Drums (560fe58f battered buttress-towers + 861d6426 corbel-cones + aef38adc vault-bridges!) */
  for(const sg of [-1,1]){
   const kx=sg*11.95,kz=-1.35,rB=3.95,rM=3.45,rT=3.18,ky0=.34;
   ynRootSkirt(kx,kz,rB,6.8,{mk:'cobble',plinthH:ky0+.34,seg:18});
   ynFloorDisc(kx,kz,rB-.06,ky0,'flagstone',P('flagstone'),{seg:16});
   /* lower rust-ironstone & travertine drum + battered warm sea-lime upper keep (560fe58f!) */
   ynDrumWall(kx,kz,rB-.38,rB,ky0,3.6,'cobble',P('cobble'),[
    {a:PI/2,w:1.25,h:2.2,door:true,visor:true},{a:sg<0?0:PI,w:1.15,h:2.15,door:true,open:true}
   ]);
   ynDripSkirt(kx,kz,rB,ky0+3.6,.42,.20,'gilt',gtCol,{seg:18});
   ynFloorDisc(kx,kz,rM-.06,yTier2,'floor',P('floor'),{seg:16});
   ynDrumWall(kx,kz,rM-.38,rM,ky0+3.6,7.4,'sealimeWarm',slWarm,[
    {a:sg<0?0:PI,w:1.25,y:2.62,h:2.15,door:true,open:true},
    {a:PI*.32,w:.58,y:4.2,h:1.35},{a:PI*.68,w:.58,y:4.2,h:1.35},{a:-PI/2,w:.62,y:4.2,h:1.35}
   ]);
   ynNoCut(()=>{
    /* 8 vertical tapered buttress-ribs along the battered keep shaft + front Oculus Sun-Medallion (560fe58f + c07f020e) */
    for(let i=0;i<8;i++){
     const a=i/8*TAU+PI/8,ca=Math.cos(a),sa=Math.sin(a);
     beam('travertine',[kx+ca*(rB-.02),ky0+3.68,kz+sa*(rB-.02)],[kx+ca*(rT+.12),ky0+10.92,kz+sa*(rT+.12)],.26,trCol,false,undefined,.22);
    }
    W(kx,ky0+8.35,kz+rM+.01,0,()=>ynpOculusMedallion(.88,{tailH:1.45}));
    /* ring of 12 tapered corbel-fins + gilt-rimmed Verdigris Dome (560fe58f + 861d6426) */
    const yKTop=ky0+11.0,rKDome=rT+.58;
    ynCorbelFins(kx,kz,rM,rKDome-.04,yKTop-1.45,yKTop,12,'corbel',P('corbel'),{bronzeTip:true});
    sector('gilt',kx,kz,rKDome-.32,rKDome+.06,0,TAU,yKTop+.006,yKTop+.34,gtCol,18);
    lathe('verdigris',kx,kz,[
     [rKDome+.02,yKTop+.35],[rKDome*.84,yKTop+1.65],[rKDome*.52,yKTop+2.65],[.28,yKTop+3.18]
    ],18,vdCol,{uv:'cone'});
    lathe('travertine',kx,kz,[
     [rKDome-.04,yKTop+.31],[rKDome*.81,yKTop+1.59],[rKDome*.49,yKTop+2.59],[.01,yKTop+3.12]
    ],18,trCol,{uv:'cone',inward:true});
    for(let i=0;i<8;i++){
     const a=i/8*TAU,ca=Math.cos(a),sa=Math.sin(a);
     beam('gilt',[kx+ca*(rKDome-.02),yKTop+.40,kz+sa*(rKDome-.02)],[kx+ca*.34,yKTop+3.18,kz+sa*.34],.045,gtCol,true,6);
    }
    ynTwinSpearFinial(kx,yKTop+3.18,kz,1.12);
   });

   /* Vaulted Ribbed Verdigris-and-Glass Conservatory Gallery Bridge linking Keep-Drum to Great Rotunda (aef38adc!) */
   ynpVaultBridge(sg*7.52,yTier2,cz-.1,sg*8.48,yTier2,kz,1.82);

   /* Queen's Private Bedchamber Furnishing inside each Twin Keep-Drum */
   ynFurn([
    ['yonni_court_twin_bed',kx,ky0,kz-1.55,0],
    ['yonni_common_brazier',kx,ky0+.006,kz+1.35,0],
    ['yonni_common_chest',kx+sg*1.95,ky0,kz,-sg*PI/2]
   ]);
  }

  /* 5. Forecourt Flanks: Polished Bronze Rain-Globe Cistern on +x (560fe58f) & Smoking Royal Beacon Tower on -x (9f58769a)! */
  ynpRainGlobe(11.2,0,5.85,1.85,{});
  ynNoCut(()=>svNoWalk(()=>{
   /* Square smoking stone & bronze Beacon-Brazier Tower on -x balancing the Rain-Globe on +x (9f58769a!) */
   const bx=-11.2,bz=5.85;
   ynBelowGrade(()=>box('cobble',bx,-4.6,bz,2.85,4.6,2.85,P('cobble')));
   box('travertine',bx,0,bz,2.45,6.85,2.45,trCol);
   box('relief',bx,1.2,bz+1.26,1.35,3.85,.05,rlCol);
   box('gilt',bx,6.86,bz,2.68,.22,2.68,gtCol);
   for(const sx of [-.92,.92])for(const sz of [-.92,.92]){
    box('travertine',bx+sx,7.09,bz+sz,.34,1.25,.34,trCol);
   }
   box('travertine',bx,8.35,bz,2.58,.18,2.58,trCol);
   cyl('bronze',bx,7.10,bz,.68,.46,bzCol,10);
   sph('glow',bx,7.72,bz,.44,0xffa236,.85,8);
   haloAt(bx,7.85,bz,0xffa63c,true);
   smokeAt(bx,8.85,bz,{r:.44});
  }));

  /* 6. Grand Dual-Throne Hall Interior Furnishing (11 pieces in central rotunda + 6 in twin keeps = 17 total!) */
  FURNISH('yonni_court_carpet',0,yDeck,cz,0);
  const yc=yDeck+.05;
  /* Raised travertine royal dais at -z carrying the Dual-Throne of the identical Twin Spear-Queens */
  svNoWalk(()=>box('travertine',0,yDeck+.006,cz-3.35,4.2,.24,2.45,trCol));
  FURNISH('yonni_court_twin_throne',0,yDeck+.25,cz-3.45,0);
  FURNISH('yonni_court_feast_table',0,yc,cz+.35,0);
  FURNISH('yonni_common_seer_basin',0,yDeck,cz+2.95,0);
  for(const sx of [-1,1]){
   FURNISH('yonni_common_brazier',sx*2.85,yDeck+.006,cz+1.85,0);
   FURNISH('yonni_common_dual_spear_rack',sx*4.45,yDeck,cz-.85,-sx*PI/2);
   FURNISH('yonni_trade_armour_stand',sx*4.15,yDeck,cz+1.25,-sx*PI/2);
   FURNISH('yonni_common_banner',sx*2.35,yDeck,cz-4.45,0);
  }
  FURNISH_HANG('yonni_common_storm_lamp',0,yTier2-.08,cz,0);
 }});

/* ================================================================= 2. MODULAR ROYAL COURT ROTUNDA (yn-court-rotunda, pyrmid3.jpg) */
defBuilding({key:'yn-court-rotunda',name:'Kande-Mut Peripteral Royal Court Rotunda',seed:7213,cls:'building',w:22.4,d:22.4,h:20.8,budget:120000,cut:true,
 tags:{types:['civic','religious'],wealth:'rich',style:'freestanding',role:'court rotunda'},
 note:'Modular two-tier colonnaded Royal Moot & High Court rotunda (pyrmid3.jpg): 360 deg radial amphitheatre steps with 4 vomitorium portals, fluted double peristyle, diagonal ironwood eave-struts, and vast oversailing domed shingle canopy.',
 build(){
  const yDeck=1.36,rOuter=9.35,rCol=6.95,rIn=4.85,wt=.42;
  const trCol=P('travertine'),slWarm=P('sealimeW'),rlCol=P('relief'),iwCol=P('ironwood'),bzCol=P('bronze'),gtCol=P('gilt');

  ynRootSkirt(0,0,rOuter,6.2,{mk:'cobble',plinthH:.28,seg:24});
  ynpRadialStairs(0,0,rCol+.35,rOuter,yDeck,6,[0,PI/2,PI,PI*1.5]);
  ynFloorDisc(0,0,rCol+.34,yDeck,'flagstone',P('flagstone'),{seg:24});

  /* Inner Two-Storey Moot Drum + Twin Peristyle Spiral Stairs up to Upper Gallery */
  const h1=4.15,y2=yDeck+h1+.52,h2=3.95;
  ynDrumWall(0,0,rIn-wt,rIn,yDeck,h1,'sealimeWarm',slWarm,[
   {a:PI/2,w:1.85,h:2.85,door:true,visor:false},{a:-PI/2,w:1.45,h:2.45,door:true,open:true},
   {a:0,w:1.45,h:2.45,door:true,open:true},{a:PI,w:1.45,h:2.45,door:true,open:true}
  ],{visors:false});
  ynSpiralStair(0,0,rIn+.04,yDeck,y2,-PI*.42,PI*.42,{w:.92});
  ynSpiralStair(0,0,rIn+.04,yDeck,y2,PI*1.42,-PI*.42,{w:.92});
  ynFloorDisc(0,0,rCol+.22,y2,'floor',P('floor'),{seg:24});
  ynDrumWall(0,0,rIn-wt-.04,rIn-.04,y2,h2,'sealime',P('sealime'),[
   {a:0,w:1.30,h:2.20,door:true,open:true},{a:PI,w:1.30,h:2.20,door:true,open:true},
   {a:PI*.25,w:.92,y:.85,h:1.65},{a:PI*.75,w:.92,y:.85,h:1.65},
   {a:-PI*.25,w:.92,y:.85,h:1.65},{a:-PI*.75,w:.92,y:.85,h:1.65}
  ]);

  /* Two-Tier Fluted Peristyle + Carved Entablature + Vast Mushroom Umbrella Canopy (pyrmid3.jpg!) */
  ynNoCut(()=>{
   const nC=16;
   for(let i=0;i<nC;i++){
    const a=i/nC*TAU+PI/nC,ca=Math.cos(a),sa=Math.sin(a);
    const x1=ca*(rCol-.15),z1=sa*(rCol-.15);
    cyl('bronze',x1,yDeck+.006,z1,.34,.24,bzCol,10);
    cyl('travertine',x1,yDeck+.252,z1,.26,h1-.44,trCol,10,.23);
    cyl('gilt',x1,yDeck+h1-.18,z1,.34,.17,gtCol,10);
    const x2=ca*(rCol-.22),z2=sa*(rCol-.22);
    cyl('bronze',x2,y2+.006,z2,.28,.20,bzCol,10);
    cyl('travertine',x2,y2+.212,z2,.21,h2-.40,trCol,10,.18);
    cyl('gilt',x2,y2+h2-.18,z2,.28,.17,gtCol,10);
    beam('ironwood',[x2,y2+h2-1.15,z2],[ca*(rCol+1.65),y2+h2-.05,sa*(rCol+1.65)],.085,iwCol,false,undefined,.11);
    /* Intercolumnar upper balustrade segments strictly between adjacent bronze column bases! */
    const aNext=(i+1)/nC*TAU+PI/nC;
    sector('travertine',0,0,rCol-.34,rCol-.10,a+.065,aNext-.065,y2+.014,y2+.78,trCol,2);
   }
   sector('travertine',0,0,rCol-.55,rCol+.26,0,TAU,yDeck+h1+.006,yDeck+h1+.24,trCol,24);
   sector('relief',0,0,rCol-.48,rCol+.32,0,TAU,yDeck+h1+.248,y2-.008,rlCol,24);
   /* Vast oversailing domed shingle & verdigris mushroom roof (pyrmid3.jpg!) */
   const yEave=y2+h2;
   sector('travertine',0,0,rIn-.1,rCol+.28,0,TAU,yEave+.006,yEave+.36,trCol,24);
   ynCanopy(0,0,rCol+.22,rOuter+.18,yEave+.38,4.65,{mk:'shingle',col:P('shingle'),ribs:16,bell:.52,rHub:1.45,finial:false,seg:24});
   lathe('verdigris',0,0,[[1.48,yEave+5.02],[.92,yEave+5.72],[.24,yEave+6.08]],18,P('verdigris'),{uv:'cone'});
   lathe('planks',0,0,[[1.44,yEave+4.97],[.88,yEave+5.66],[.01,yEave+6.02]],18,P('planks'),{uv:'cone',inward:true});
   ynTwinSpearFinial(0,yEave+6.08,0,1.25);
  });

  /* High Court Interior Furnishing (9 pieces) */
  FURNISH('yonni_court_carpet',0,yDeck,0,0);
  FURNISH('yonni_court_feast_table',0,yDeck+.05,0,0);
  FURNISH('yonni_court_twin_throne',0,yDeck,-3.15,0);
  for(let i=0;i<4;i++){
   const a=i*PI/2+PI/4;
   FURNISH('yonni_common_bench',Math.cos(a)*2.85,yDeck,Math.sin(a)*2.85,ynFace(Math.cos(a),Math.sin(a),0,0));
  }
  FURNISH('yonni_works_scribe_desk',-2.25,yDeck,-2.45,PI*.2);
  FURNISH('yonni_works_scribe_desk',2.25,yDeck,-2.45,-PI*.2);
  FURNISH_HANG('yonni_common_storm_lamp',0,y2-.08,0,0);
 }});
