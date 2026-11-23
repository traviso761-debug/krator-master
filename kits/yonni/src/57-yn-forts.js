// prefix: ynf
// ================================================================= FORMLINE FORTIFICATIONS: Curtain Wall, Portal Gatehouse & High Watch-Tower
// Inspired by formline.jpg: rhythm of gabled slit-buttress piers, geometric diamond stone lattice screens, bold carved
// black / carnelian-red / verdigris coastal formline relief panels, tall slot-arch bannered portal gatehouse, and the
// ~26 m multi-stage Formline Watch-Tower with pennant-hung cantilevered lookout crown and verdigris spire.

/* 1. Multi-layered carved coastal Formline relief panel (mounts at local z = 0, stepping strictly +z per material layer:
   relief tablet .008..036 -> black ironwood ovoids/U-ribs .038..064 -> carnelian carved cores .066..088 -> verdigris .090..108 -> bronze .110..126) */
function ynfFormlinePanel(w,h,o){
 o=o||{};
 const rlCol=P('relief'),trCol=P('travertine'),bkCol=0x1e1b19,rdCol=0xa83626,vdCol=0x569284,bzCol=0xb88e48;
 svNoWalk(()=>{
  /* Layer 0: proud travertine outer frame + strictly inset warm relief stone tablet (zero shared X/Y/Z caps!) */
  const bw=.075;
  box('travertine',0,0,.028,w+.06,bw,.036,trCol);
  box('travertine',0,h-bw,.028,w+.06,bw,.036,trCol);
  for(const sx of [-1,1])box('travertine',sx*(w/2+.005),bw+.006,.028,.05,h-2*bw-.012,.036,trCol);
  box('relief',0,bw+.008,.020,w-.06,h-2*bw-.016,.024,rlCol);

  /* Layer 1: bold black-ironwood primary Formline ovoids & split-U frame lines (.038 .. .064) */
  const iw=w-.22,ih=h-.24,yMid=h*.52;
  /* upper & lower primary ovoid brow-bars + side split-U cheek ribs */
  box('ironwood',0,h-.24,.051,iw,.11,.026,bkCol);
  box('ironwood',0,.14,.051,iw,.10,.026,bkCol);
  box('ironwood',0,yMid,.051,iw*.88,.09,.026,bkCol);
  for(const sx of [-1,1]){
   box('ironwood',sx*(iw*.44),.25,.051,.10,ih-.36,.026,bkCol);
   /* paired black ovoid eye-rings in upper register */
   const ex=sx*iw*.23,ey=yMid+(h-yMid)*.38,ew=iw*.32,eh=(h-yMid)*.42;
   box('ironwood',ex,ey+eh*.38,.051,ew,.075,.026,bkCol);
   box('ironwood',ex,ey-eh*.48,.051,ew,.075,.026,bkCol);
   for(const es of [-1,1])box('ironwood',ex+es*(ew*.42),ey-eh*.40,.051,.068,eh*.76,.026,bkCol);
  }
  /* central vertical Twin-Spear spine dividing lower U-form register */
  box('ironwood',0,.25,.051,.085,yMid-.26,.026,bkCol);

  /* Layer 2: secondary carnelian-red inner ovoids, spear-tongues & U-flukes (.066 .. .088) */
  for(const sx of [-1,1]){
   const ex=sx*iw*.23,ey=yMid+(h-yMid)*.38,ew=iw*.20,eh=(h-yMid)*.24;
   box('carved',ex,ey-eh*.45,.077,ew,eh,.022,rdCol);
   /* lower split-U red fin-crescents */
   const lx=sx*iw*.24,ly=.28,lh=Math.max(.22,yMid-.38);
   box('carved',lx,ly,.077,iw*.24,lh*.78,.022,rdCol);
  }
  if(o.tall){
   box('carved',0,h*.78,.077,iw*.22,h*.11,.022,rdCol);
  }

  /* Layer 3 & 4: verdigris copper iris discs (.090 .. .108) & tin-bronze Twin-Spear bosses (.110 .. .126) */
  for(const sx of [-1,1]){
   const ex=sx*iw*.23,ey=yMid+(h-yMid)*.34,rEye=Math.min(.14,iw*.085);
   WX(ex,ey,.090,0,PI/2,0,()=>cyl('verdigris',0,0,0,rEye,.018,vdCol,8));
   WX(ex,ey,.110,0,PI/2,0,()=>cyl('bronze',0,0,0,rEye*.48,.016,bzCol,8));
   /* lower U-form verdigris comma-dots */
   WX(sx*iw*.24,.32+(yMid-.38)*.38,.090,0,PI/2,0,()=>cyl('verdigris',0,0,0,rEye*.82,.018,vdCol,8));
  }
  /* central Twin-Spear bronze crest medallion */
  WX(0,yMid+.045,.090,0,PI/2,0,()=>cyl('verdigris',0,0,0,Math.min(.16,iw*.1),.018,vdCol,8));
  for(const sx of [-1,1])box('bronze',sx*.045,yMid-.08,.118,.032,.26,.016,bzCol);
 });
}

/* 2. Geometric hexagonal/diamond pierced stone screen bay (formline.jpg upper curtain bays) */
function ynfDiamondScreen(w,h,cols,rows){
 const nc=cols==null?2:cols,nr=rows==null?4:rows;
 const dkCol=0x1e1916,trCol=P('travertine'),vdCol=P('verdigris');
 svNoWalk(()=>{
  /* dark recessed shadow backplate strictly inset from outer rails (.006 .. .022) */
  box('ironstone',0,.05,.014,w-.10,h-.10,.016,dkCol);
  /* proud travertine lattice mullions + rotated diamond bosses (.042 .. .072) */
  const cw=w/nc,rh=h/nr;
  for(let c=0;c<=nc;c++){
   const xx=-w/2+c*cw;
   box('travertine',xx,.005,.057,.09,h-.01,.03,trCol);
  }
  for(let r=0;r<=nr;r++){
   const yy=r*rh;
   box('travertine',0,yy-.038,.057,w+.08,.076,.03,trCol);
  }
  for(let c=0;c<nc;c++)for(let r=0;r<nr;r++){
   const cx=-w/2+(c+.5)*cw,cy=(r+.5)*rh,ds=Math.min(cw,rh)*.34;
   /* rotated diamond stone ring-frame around dark aperture */
   for(const sx of [-1,1])for(const sy of [-1,1]){
    box('travertine',cx+sx*ds*.52,cy+sy*ds*.52-.035,.059,ds*.68,.07,.032,trCol,0,0,sx*sy*PI/4);
   }
   if((c+r)%2===0){
    WX(cx,cy,.025,0,PI/2,0,()=>cyl('verdigris',0,0,0,ds*.22,.014,vdCol,6));
   }
  }
 });
}

/* 3. Projecting gabled slit-buttress pier (formline.jpg wall & gatehouse rhythm; sits cleanly proud of zFront) */
function ynfGablePier(x,zFront,w,d,h,o){
 o=o||{};
 const cbCol=o.cbCol==null?P('cobble'):o.cbCol,slCol=P('sealimeW'),trCol=P('travertine'),dkCol=0x1c1715,stCol=P('slate');
 const z0=zFront+.008,zc=z0+d/2;
 if(!o.onWall)ynBelowGrade(()=>box('cobble',x,-4.4,zc,w+.36,4.4,d+.36,cbCol));
 svNoWalk(()=>{
  /* battered cobble base plinth + warm sea-lime pier shaft (proud of main wall so zero shared y=0 / z faces!) */
  box('cobble',x,.008,zc,w+.14,1.44,d,cbCol);
  box('sealimeWarm',x,1.456,zc,w,h-1.456,d-.04,slCol);
  /* recessed pointed/arched embrasure slit in upper pier face */
  const sy=h*.54,sh=h*.23,zf=zc+(d-.04)/2;
  box('ironstone',x,sy,zf+.014,.26,sh,.020,dkCol);
  box('travertine',x,sy-.08,zf+.038,.48,.072,.024,trCol);
  box('travertine',x,sy+sh+.006,zf+.038,.44,.12,.024,trCol);
  /* lower mini formline emblem on pier face */
  if(o.emblem!==false){
   W(x,1.72,zf,0,()=>ynfFormlinePanel(w*.68,1.35,{}));
  }
  /* pitched pointed-gable hood + slate watershed cap & bronze finial pin (formline.jpg) */
  const gh=o.gableH==null?.95:o.gableH;
  prism('travertine',[[-w/2-.06,zc-d/2+.02],[w/2+.06,zc-d/2+.02],[w/2+.06,zc+d/2+.06],[-w/2-.06,zc+d/2+.06]].map(p=>[x+p[0],p[1]]),h+.006,h+.16,trCol);
  /* stepped gable merlon blocks rising to central notch/finial */
  box('sealimeWarm',x,h+.168,zc,w*.82,gh*.48,d*.84,slCol);
  box('travertine',x,h+.176+gh*.48,zc,w*.52,gh*.44,d*.80,trCol);
  for(const sx of [-1,1]){
   plane4('slate',[x+sx*.04,h+.22+gh,zc-d*.42],[x+sx*.04,h+.22+gh,zc+d*.48],[x+sx*(w*.56),h+.18,zc-d*.42],.06,stCol);
  }
  cyl('bronze',x,h+.24+gh,zc,.06,.34,P('bronze'),8);
 });
}

/* ================================================================= 1. FORMLINE CURTAIN WALL (yn-wall-curtain) */
defBuilding({key:'yn-wall-curtain',name:'Form-Wal Carved Formline Curtain Rampart',seed:7206,cls:'building',w:16.4,d:5.8,h:9.6,
 tags:{types:['infrastructure','military'],style:'freestanding',role:'curtain wall'},
 note:'Modular coastal sea-lime & cobble curtain wall (formline.jpg): 4 gabled slit-buttress piers framing 3 bays of carved black/red/verdigris formline reliefs and diamond stone screens.',
 build(){
  const L=15.4,W0=2.45,H=6.6,zc=.32;
  const cbCol=P('cobble'),slCol=P('sealimeW'),trCol=P('travertine'),flCol=P('flagstone');
  ynBelowGrade(()=>box('cobble',0,-4.4,zc,L,4.4,W0+1.45,cbCol));
  /* main curtain core: cobble plinth + warm sea-lime wall */
  box('cobble',0,0,zc,L,1.35,W0,cbCol);
  box('sealimeWarm',0,1.356,zc,L-.08,H-1.366,W0,slCol);
  /* upper dentil corbel band along front face */
  const zFace=zc+W0/2;
  for(let i=-9;i<=9;i++){
   box('corbel',i*.78,H-.38,zFace+.06,.24,.32,.11,P('corbel'));
  }
  /* 4 projecting gabled slit-buttress piers cleanly proud of zFace */
  const pierX=[-5.85,-1.95,1.95,5.85];
  for(const px of pierX){
   ynfGablePier(px,zFace,1.38,.72,H+.62,{gableH:.92,onWall:true,cbCol});
  }
  /* 3 recessed curtain bays: lower carved Formline relief frieze + upper 2x4 diamond lattice screen */
  for(const bx of [-3.9,0,3.9]){
   W(bx,1.52,zFace,0,()=>ynfFormlinePanel(2.18,1.62,{}));
   W(bx,3.34,zFace,0,()=>ynfDiamondScreen(2.18,2.68,2,4));
  }
  /* walkable flagstone wall-walk + front & rear parapets */
  const pts=[[-L/2+.06,zc-W0/2-.08],[L/2-.06,zc-W0/2-.08],[L/2-.06,zc+W0/2+.08],[-L/2+.06,zc+W0/2+.08]];
  svNoWalk(()=>prism('flagstone',pts,H+.006,H+.14,flCol));
  svFloor(pts,H+.14);
  box('travertine',0,H+.146,zFace-.16,L-.12,.88,.30,trCol);
  box('cobble',-2.05,H+.146,zc-W0/2+.14,9.1,.76,.26,cbCol);
  box('cobble',5.8,H+.146,zc-W0/2+.14,3.6,.76,.26,cbCol);
  /* rear stone stair running cleanly along the back face with walkable <=0.92 slope + threshold pad onto wall-walk */
  ynNoCut(()=>{
   svStair(-4.2,zc-W0/2-.68,0,H+.14,PI/2,{style:'solid',w:1.08,mk:'flagstone',col:flCol,run:7.3});
   wkPad(3.3,zc-W0/2-.25,1.35,1.35,H+.14);
  });
  door(0,0,zFace,0,1.25,2.25);
 }});

/* ================================================================= 2. FORMLINE PORTAL GATEHOUSE (yn-gatehouse-portal) */
defBuilding({key:'yn-gatehouse-portal',name:'Form-Get Tall Slot-Arch Portal Gatehouse',seed:7210,cls:'building',w:17.4,d:8.8,h:13.8,cut:true,
 tags:{types:['infrastructure','military'],wealth:'middle',style:'freestanding',role:'gatehouse'},
 note:'High-shouldered stepped-gable portal gatehouse (formline.jpg) with deep slot-arch gateway, hanging verdigris Twin-Spear banner, formline flanking bays, and twin vaulted guardrooms.',
 build(){
  const W0=5.2,H=7.2,zc=.26;
  const cbCol=P('cobble'),slCol=P('sealimeW'),trCol=P('travertine'),flCol=P('flagstone'),iwCol=P('ironwood');
  /* flanking hollow guardhouse wings (|x| = 2.50 .. 7.80) with strictly disjoint X wall intervals! */
  for(const sg of [-1,1]){
   const gx=sg*5.15,gw=5.3,gd=W0;
   ynBelowGrade(()=>box('cobble',gx,-4.8,zc,gw+.4,4.8,gd+1.35,cbCol));
   /* floor slab strictly inside walls (|x| = 2.94 .. 7.40) */
   const xA=sg*2.94,xB=sg*7.40,fPts=[[Math.min(xA,xB),zc-gd/2+.38],[Math.max(xA,xB),zc-gd/2+.38],[Math.max(xA,xB),zc+gd/2-.38],[Math.min(xA,xB),zc+gd/2-.38]];
   svNoWalk(()=>prism('flagstone',fPts,.02,.18,flCol));
   svFloor(fPts,.18);
   /* passage-side inner ashlar cheek wall: |x| = 2.50 .. 2.90 */
   box('ashlar',sg*2.70,0,zc,.40,H-.01,gd,P('ashlar'));
   /* front wall: |x| = 2.912 .. 7.80 (center sg*5.356, w = 4.888) */
   box('cobble',sg*5.356,0,zc+gd/2-.18,4.888,1.45,.36,cbCol);
   box('sealimeWarm',sg*5.356,1.456,zc+gd/2-.18,4.888,H-1.466,.36,slCol);
   /* outer end wall: |x| = 7.44 .. 7.80, strictly between front & rear walls in Z */
   box('cobble',sg*7.62,0,zc,.36,1.45,gd-.74,cbCol);
   box('sealimeWarm',sg*7.62,1.456,zc,.36,H-1.466,gd-.74,slCol);
   /* rear wall in 3 strictly disjoint X intervals: inner pier (2.912..4.64), doorway/lintel (4.65..5.75), outer pier (5.76..7.80)! */
   box('cobble',sg*3.776,0,zc-gd/2+.18,1.728,H-.01,.36,cbCol);
   box('cobble',sg*6.78,0,zc-gd/2+.18,2.04,H-.01,.36,cbCol);
   box('sealimeWarm',sg*5.20,2.26,zc-gd/2+.18,1.10,H-2.27,.36,slCol);
   door(sg*5.20,.18,zc-gd/2+.02,PI,1.08,2.05);
   svLeaf(sg*5.20,.186,zc-gd/2+.18,PI,1.00,1.98,{mk:'ironwood',col:iwCol,name:'guard door'});

   /* front facade: outer gabled buttress-pier cleanly proud of zFace + recessed Formline & diamond-screen bay */
   const zFace=zc+gd/2;
   ynfGablePier(gx+sg*1.95,zFace,1.35,.70,H+.68,{gableH:.92,onWall:true,cbCol});
   W(gx-sg*.15,1.55,zFace,0,()=>ynfFormlinePanel(2.05,1.72,{}));
   W(gx-sg*.15,3.48,zFace,0,()=>ynfDiamondScreen(2.05,2.85,2,4));

   /* guardroom interior furniture (3 per side = 6 total) */
   ynFurn([
    ['yonni_common_dual_spear_rack',gx+sg*1.85,.18,zc,sg<0?PI/2:-PI/2],
    ['yonni_trade_armour_stand',gx-sg*1.55,.18,zc-.9,sg<0?-PI/2:PI/2],
    ['yonni_common_brazier',gx,.186,zc+.45,0]
   ]);
  }

  /* Central monumental stepped-gable Slot-Arch Portal Pylon (formline.jpg centerpiece, H_pylon = 12.4 m!) */
  const pw=5.0,pd=W0+.95,zPFront=zc+pd/2,gateW=2.82,gateH=3.95,slotH=8.35;
  ynBelowGrade(()=>{
   for(const sg of [-1,1])box('cobble',sg*1.92,-5.0,zc,1.12,5.0,pd+.4,cbCol);
  });
  /* twin massive portal jamb piers framing the tall recessed slot-arch (strictly clear of ashlar cheeks at +-2.50!) */
  for(const sg of [-1,1]){
   box('travertine',sg*1.92,0,zc,1.10,9.85,pd,trCol);
   box('ashlar',sg*1.23,0,zPFront-.22,.24,slotH,.46,P('ashlar'));
  }
  /* vaulted gate lintel & upper bridge chamber over passage (y = gateH .. 9.85, recessed behind the tall front slot!) */
  box('ashlar',0,gateH+.02,zc-.38,2.70,5.8,pd-.88,P('ashlar'));
  /* pointed corbelled arch head closing the tall slot at y = slotH .. 9.85 + high stepped gable crown */
  for(let k=0;k<4;k++){
   const yk=slotH+k*.34,gap=Math.max(.28,2.34-k*.62);
   for(const sg of [-1,1]){
    box('travertine',sg*(gap/2+.40),yk,zPFront-.28,.80,.33,.58,trCol);
   }
  }
  box('travertine',0,9.86,zc,pw,1.15,pd-.2,trCol);
  box('sealimeWarm',0,11.02,zc,pw*.66,1.05,pd-.45,slCol);
  /* central arched belfry/beacon niche proud on stepped portal gable face (formline.jpg) */
  box('ironstone',0,11.08,zPFront-.14,.74,.88,.12,0x1d1816);
  for(const sg of [-1,1]){
   plane4('slate',[sg*.04,12.35,zc-pd*.42],[sg*.04,12.35,zc+pd*.44],[sg*(pw*.54),10.95,zc-pd*.42],.07,P('slate'));
  }
  ynTwinSpearFinial(0,12.38,zc,.95);

  /* Long hanging verdigris-green Twin-Spear banner suspended inside the tall upper slot-arch (formline.jpg!) */
  ynNoCut(()=>{
   beam('bronze',[-1.14,slotH-.18,zPFront-.26],[1.14,slotH-.18,zPFront-.26],.06,P('bronze'),true,8);
   withCloth(clothHang(3.35,.09),()=>{
    quad('flag',0,slotH-.22-1.68,zPFront-.26,1.38,3.35,P('verdigris'),0);
   });
   /* operable double ironwood & bronze city-portal gates */
   door(0,0,zPFront-.15,0,gateW,gateH);
   svLeaf(0,.01,zc+.35,0,gateW-.08,gateH-.06,{mk:'ironwood',col:iwCol,split:true,t:.11,hwCol:0xb88e48,name:'portal gate'});
   /* walkable upper rampart slabs over the flanking guardhouses + interior ironwood garrison ladders from guardrooms */
   for(const sg of [-1,1]){
    const rPts=[[sg*2.52,zc-W0/2+.06],[sg*7.65,zc-W0/2+.06],[sg*7.65,zc+W0/2-.06],[sg*2.52,zc+W0/2-.06]];
    if(sg<0)rPts.reverse();
    svNoWalk(()=>prism('flagstone',rPts,H+.006,H+.14,flCol));
    svFloor(rPts,H+.14);
    svStair(sg*3.65,zc-1.15,.18,H+.14,0,{style:'ladder',w:.78,mk:'ironwood',col:iwCol});
   }
  });
 }});

/* ================================================================= 3. FORMLINE HIGH WATCH-TOWER (yn-tower-formline, ~26.2 m!) */
defBuilding({key:'yn-tower-formline',name:'Form-Tur High Formline Watch-Tower',seed:7211,cls:'building',w:13.8,d:13.8,h:27.4,budget:120000,cut:true,
 tags:{types:['military','civic','infrastructure'],wealth:'rich',style:'freestanding',role:'watchtower'},
 note:'Soaring ~26 m multi-stage landmark tower (formline.jpg) with carved black/red/verdigris coastal formline totem panels, mid-collar gallery, pennant-hung cantilevered lookout crown, open arched belvedere, and verdigris spire.',
 build(){
  const y0=.28,rBase=3.68,rS1=3.36,rS2=2.84,wt=.40;
  const cbCol=P('cobble'),slCol=P('sealimeW'),slPale=P('sealime'),trCol=P('travertine'),bzCol=P('bronze'),vdCol=P('verdigris');

  /* Base: telescoping battered cobble root-skirt + battered ironstone/cobble ground drum (y = .28 .. 3.48) */
  ynRootSkirt(0,0,rBase,6.6,{mk:'cobble',plinthH:y0+.34});
  ynFloorDisc(0,0,rBase-.06,y0,'flagstone',P('flagstone'),{seg:20});
  ynDrumWall(0,0,rBase-wt,rBase,y0,3.2,'cobble',cbCol,[
   {a:PI/2,w:1.28,h:2.25,door:true,visor:true,visorOut:.82},
   {a:0,w:.62,y:1.15,h:1.15},{a:PI,w:.62,y:1.15,h:1.15}
  ]);
  ynDripSkirt(0,0,rBase,y0+3.2,.44,.22,'slate',P('slate'));

  /* Stage 1 (y = 3.48 .. 9.68): warm sea-lime drum with 8 vertical travertine pilasters & 4 tall Formline Totem Panels */
  const y1=y0+3.2,h1=6.2;
  ynFloorDisc(0,0,rS1-.06,y1+.14,'floor',P('floor'),{seg:18});
  svStair(1.35,-1.55,y0,y1+.14,0,{style:'ladder',w:.76,mk:'ironwood',col:P('ironwood')});
  ynDrumWall(0,0,rS1-wt,rS1,y1,h1,'sealimeWarm',slCol,[
   {a:PI*.25,w:.58,y:2.2,h:1.45},{a:PI*.75,w:.58,y:2.2,h:1.45},
   {a:-PI*.25,w:.58,y:2.2,h:1.45},{a:-PI*.75,w:.58,y:2.2,h:1.45}
  ],{visors:false});
  ynNoCut(()=>{
   for(let i=0;i<8;i++){
    const a=i/8*TAU+PI/8,yaw=ynYawFromA(a);
    W(Math.cos(a)*(rS1+.08),y1+.06,Math.sin(a)*(rS1+.08),yaw,()=>{
     box('travertine',0,0,0,.38,h1-.12,.14,trCol);
    });
   }
   /* 4 cardinal carved black/carnelian/verdigris Formline Totem Panels + corbelled pointed niche hoods + banners */
   for(let k=0;k<4;k++){
    const a=k*PI/2,yaw=ynYawFromA(a),px=Math.cos(a)*(rS1+.006),pz=Math.sin(a)*(rS1+.006);
    W(px,y1+.55,pz,yaw,()=>{
     ynfFormlinePanel(1.58,3.85,{tall:true});
     /* pointed arch hood & hanging silk/wool banner below */
     box('travertine',0,3.96,.06,1.76,.22,.16,trCol);
     box('travertine',0,4.19,.05,1.18,.20,.14,trCol);
    });
   }
  });
  /* Exterior spiral stair wrapping base + Stage 1 up to Mid-Collar Gallery */
  ynSpiralStair(0,0,rBase+.06,0,y1+h1+.16,PI*.62,PI*1.12,{w:1.0});

  /* Mid-Collar Stepped Gallery (y = 9.68 .. 11.18, formline.jpg corbelled collar with arched niches & banners) */
  const yCollar=y1+h1,rCollar=3.72;
  ynCorbelFins(0,0,rS1,rCollar-.04,yCollar-1.25,yCollar,16,'corbel',P('corbel'),{bronzeTip:true});
  ynFloorDisc(0,0,rCollar-.06,yCollar+.16,'flagstone',P('flagstone'),{seg:20});
  ynNoCut(()=>{
   sector('travertine',0,0,rCollar-.28,rCollar,0,TAU,yCollar+.166,yCollar+1.06,trCol,24);
   /* 4 long hanging banners draped from the mid-collar rim (formline.jpg) */
   const bCols=[P('carnelian'),vdCol,P('indigo'),P('amberCl')];
   for(let k=0;k<4;k++){
    const a=k*PI/2+PI/4,yaw=ynYawFromA(a);
    W(Math.cos(a)*(rCollar+.05),yCollar+.92,Math.sin(a)*(rCollar+.05),yaw,()=>{
     box('bronze',0,0,.02,.76,.05,.05,bzCol);
     withCloth(clothHang(2.35,.08),()=>quad('flag',0,-1.20,.03,.66,2.35,bCols[k],0));
    });
   }
  });

  /* Stage 2 (y = 11.18 .. 17.58): slender upper shaft with 8 blind-arch recesses & narrow Formline spear-strips */
  const y2=yCollar+.16,h2=6.4;
  ynDrumWall(0,0,rS2-wt,rS2,y2,h2,'sealime',slPale,[
   {a:PI/2,w:.88,h:1.95,door:true,open:true},{a:0,w:.52,y:3.2,h:1.35},
   {a:PI,w:.52,y:3.2,h:1.35},{a:-PI/2,w:.52,y:3.2,h:1.35}
  ]);
  ynNoCut(()=>{
   for(let i=0;i<8;i++){
    const a=i/8*TAU,yaw=ynYawFromA(a);
    W(Math.cos(a)*(rS2+.07),y2+.95,Math.sin(a)*(rS2+.07),yaw,()=>{
     box('travertine',0,0,0,.28,h2-1.15,.12,trCol);
    });
    if(i%2===1){
     const am=a+PI/8,ym=ynYawFromA(am);
     W(Math.cos(am)*(rS2+.006),y2+1.25,Math.sin(am)*(rS2+.006),ym,()=>{
      ynfFormlinePanel(1.08,3.45,{tall:true});
     });
    }
   }
  });

  /* Cantilevered Lookout Crown & Colourful Pennant Ring (y = 17.58 .. 19.35, formline.jpg signature!) */
  const yCrown=y2+h2,rCrown=3.92;
  ynCorbelFins(0,0,rS2,rCrown-.04,yCrown-1.65,yCrown,16,'corbel',P('corbel'),{bronzeTip:true});
  ynFloorDisc(0,0,rCrown-.06,yCrown+.16,'flagstone',P('flagstone'),{seg:22});
  svStair(0,-1.35,y2,yCrown+.16,0,{style:'ladder',w:.78,mk:'ironwood',col:P('ironwood')});
  ynNoCut(()=>{
   sector('ashlar',0,0,rCrown-.26,rCrown+.06,0,TAU,yCrown+.01,yCrown+.22,P('ashlar'),24);
   /* 12 colourful verdigris, carnelian & indigo cloth pennants hanging around the cantilevered cornice! */
   const pCols=[vdCol,P('carnelian'),P('indigo'),P('woolPale')];
   for(let i=0;i<12;i++){
    const a=i/12*TAU,yaw=ynYawFromA(a);
    W(Math.cos(a)*(rCrown+.09),yCrown-.02,Math.sin(a)*(rCrown+.09),yaw,()=>{
     withCloth(clothHang(1.65,.09),()=>quad('flag',0,-.84,.02,.58,1.65,pCols[i%4],0));
    });
   }
   /* Open 8-column Arched Belvedere Lantern Cupola (y = 19.35 .. 22.35) */
   const rBelv=2.78,yBelv=yCrown+.16,hBelv=2.85;
   ynArcadeRing(0,0,rBelv-.32,rBelv,yBelv,hBelv,8,{paraH:.68,paraMk:'travertine',paraCol:trCol,colMk:'ironwood',spandrelMk:'verdigris',spandrelCol:vdCol,archH:.58,colR:.12});
   /* Wide oversailing patinated Verdigris conical roof + tall Verdigris/Bronze Spire & Fluttering Pennant */
   const yEave=yBelv+hBelv;
   ynCanopy(0,0,rBelv,4.38,yEave,2.15,{mk:'verdigris',ribs:8,rHub:.34,finial:false,bell:.14});
   const yApex=yEave+2.19;
   cyl('verdigris',0,yApex,0,.32,.48,vdCol,12,.18);
   cyl('bronze',0,yApex+.485,0,.055,1.55,bzCol,8);
   cone('verdigris',0,yApex+2.04,0,.11,.42,vdCol,8);
   withCloth(clothFlag(1.25,.16),()=>quad('flag',.64,yApex+1.52,0,1.22,.48,vdCol,0));
   ynTwinSpearFinial(0,yApex+.42,0,.78);
  });

  /* Garrison & Lookout Interior Furnishing (7 pieces across ground, Stage 1 & Belvedere) */
  ynFurn([
   ['yonni_trade_bunk',0,y0,-1.85,0],
   ['yonni_common_dual_spear_rack',2.25,y0,-.2,-PI/2],
   ['yonni_trade_armour_stand',-2.25,y0,-.2,PI/2],
   ['yonni_common_chest',-1.55,y0,1.45,PI*.75],
   ['yonni_common_brazier',0,y0+.006,.95,0],
   ['yonni_works_scribe_desk',0,y1+.14,-1.65,0],
   ['yonni_common_brazier',0,yCrown+.166,0,0]
  ]);
  FURNISH_HANG('yonni_common_storm_lamp',0,y1-.08,0,0);
 }});
