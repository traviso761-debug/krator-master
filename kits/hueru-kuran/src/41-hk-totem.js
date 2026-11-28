// prefix: hk
// ================================================================= HUERU-PIRA NAUTICAL MARITIME TOTEM & FORMLINE TOOLKIT ([draw])
// Unconquered Hueru-Kuran ("Whale Clans") coastal monumentality (LORE.md section 6.25):
//   hkNauticalTotemPole(x, y, z, yaw, o)         4.0-9.2 m Hueru-Pira / Kopa-Pira coastal totem poles stacking 3-5 sculpted
//                                                pelagic & littoral creatures (whale, pelican, otter, octopus, seal, crab) on
//                                                hexagonal columnar-basalt plinths, with 100% wide-open nephrite/ivory eyes!
//   hkNauticalFrieze(x, y, z, w, h, yaw, o)      >= 2.4 cm z-stepped maritime formline lintel & fascia boards
//   hkWhaleFlukeFinial(x, y, z, span, yaw, o)    Rooftop & court whale-fluke / diving-pelican finials
// Every layered relief, eye, wing, collar and fin surface steps by >= 2.0 cm (hkRigMath.formlineLayerZ) for 0 coplanar overlaps.

const HK_TOTEM_MOTIFS=['whale','pelican','otter','octopus','seal','crab'];

function hkTotemSeedAt(x,y,z,salt){
 return KRAND.hash(salt==null?4109:salt,Math.round(x*100),Math.round(y*100),Math.round(z*100));
}

/* Single non-coplanar relief box on +z face: layerIdx * 2.4 cm step with 1.2 cm thickness -> >= 12 mm air gap between layers! */
function hkFormLayerBox(mk,x,y,zFace,layerIdx,w,h,col){
 if(w<.02||h<.016)return;
 const zMid=hkRigMath.formlineLayerZ(zFace,layerIdx);
 box(mk,x,y,zMid,w,h,.012,col==null?P(mk):col);
}

/* Free Hueru-Kuran wide-open horizon-watching eye (contrasting conquered Hayrant's Censorate-mandated closed sleeping slits):
   Layer 1: tarwood/baleen outer maritime eye-frame ovoid
   Layer 2: wide-open ivory / whalebone sclera
   Layer 3: wide-open emerald-nephrite / jade round-oval iris
   Layer 4: gleaming seaglass / baleen horizon glint highlight */
function hkOpenHorizonEye(x,y,zFace,w,h,o){
 o=o||{};
 const frameMk=o.frameMk||'tarwood';
 const scleraMk=o.scleraMk||'ivory';
 const irisMk=o.irisMk||'nephrite';
 const pupilMk=o.pupilMk||'seaglass';
 const shW=Math.min(w*.15,.06);
 const midW=w-2*shW-.012;
 if(midW>.03){
  hkFormLayerBox(frameMk,x,y,zFace,1,midW,h,P(frameMk));
  for(const sx of [-1,1]){
   hkFormLayerBox(frameMk,x+sx*(w/2-shW/2),y+h*.14,zFace,1,shW,h*.72,P(frameMk));
  }
 }else{
  hkFormLayerBox(frameMk,x,y,zFace,1,w,h,P(frameMk));
 }
 const sw=Math.max(.032,w*.72),sh=Math.max(.032,h*.70);
 hkFormLayerBox(scleraMk,x,y+(h-sh)*.5,zFace,2,sw,sh,P(scleraMk));
 const iw=Math.max(.024,w*.44),ih=Math.max(.024,h*.50);
 hkFormLayerBox(irisMk,x,y+(h-ih)*.5,zFace,3,iw,ih,P(irisMk==='nephrite'?'nephriteBright':irisMk));
 const pw=Math.max(.018,w*.20),ph=Math.max(.018,h*.24);
 hkFormLayerBox(pupilMk,x,y+(h-ph)*.52,zFace,4,pw,ph,P(pupilMk));
}

/* Non-coplanar maritime ovoid relief for pectoral fins, sea-wings & lintel friezes:
   Layer 1: tarwood primary ovoid (with disjoint bevel shoulders)
   Layer 2: kaen ochre-red secondary inner ovoid
   Layer 3: glaze / verdigris / nephrite tertiary core
   Layer 4: optional open ivory/seaglass sea-eye dot */
function hkMaritimeOvoid(x,y,zFace,w,h,o){
 o=o||{};
 const primMk=o.primary||'tarwood',secMk=o.secondary||'kaen',tertMk=o.tertiary||'glaze';
 const shW=Math.min(w*.15,.11);
 const midW=w-2*shW-.012;
 if(midW>.035){
  hkFormLayerBox(primMk,x,y,zFace,1,midW,h,P(primMk));
  for(const sx of [-1,1]){
   hkFormLayerBox(primMk,x+sx*(w/2-shW/2),y+h*.13,zFace,1,shW,h*.74,P(primMk));
  }
 }else{
  hkFormLayerBox(primMk,x,y,zFace,1,w,h,P(primMk));
 }
 if(w>.18&&h>.14){
  hkFormLayerBox(secMk,x,y+h*.16,zFace,2,w*.68,h*.68,P(secMk));
 }
 if(w>.26&&h>.20){
  hkFormLayerBox(tertMk,x,y+h*.26,zFace,3,w*.44,h*.48,P(tertMk));
  if(o.eyeDot!==false&&w>.32&&h>.24){
   hkFormLayerBox('ivory',x,y+h*.36,zFace,4,w*.20,h*.26,P('ivory'));
  }
 }
}

/* Non-coplanar maritime U-form & whale-fluke split-U feather/wave relief in a single layer (legs disjoint from cap by 8 mm). */
function hkMaritimeUForm(x,y,zFace,w,h,dir,layerIdx,mk,splitMk){
 if(w<.11||h<.11)return;
 const leg=Math.min(w,h)*.24;
 const c0=P(mk);
 if(dir==='up'||dir==='down'){
  const capY=dir==='up'?y+h-leg:y;
  hkFormLayerBox(mk,x,capY,zFace,layerIdx,w,leg,c0);
  const legY=dir==='up'?y:y+leg+.008,legH=h-leg-.008;
  if(legH>.02){
   for(const sx of [-1,1])hkFormLayerBox(mk,x+sx*(w/2-leg/2),legY,zFace,layerIdx,leg,legH,c0);
  }
  if(splitMk&&w>.24&&h>.22){
   hkFormLayerBox(splitMk,x,y+h*.22,zFace,layerIdx+1,w*.24,h*.52,P(splitMk));
  }
 }else{
  const capX=dir==='right'?x+w/2-leg/2:x-w/2+leg/2;
  hkFormLayerBox(mk,capX,y,zFace,layerIdx,leg,h,c0);
  const armW=w-leg-.008,armX=dir==='right'?x-leg/2-.004:x+leg/2+.004;
  if(armW>.02){
   hkFormLayerBox(mk,armX,y,zFace,layerIdx,armW,leg,c0);
   hkFormLayerBox(mk,armX,y+h-leg,zFace,layerIdx,armW,leg,c0);
  }
  if(splitMk&&w>.24&&h>.22){
   hkFormLayerBox(splitMk,x,y+h*.36,zFace,layerIdx+1,w*.48,h*.26,P(splitMk));
  }
 }
}

/* 1. 'whale' (Hueru — Pelagic Filter-Whale):
   Arched whale head/body in flumed red-cypress or driftwood, dark combed baleen filter-plates, bleached whalebone jaw-arches,
   maritime ovoid pectoral fins (tarwood/kaen/glaze), wide-open nephrite/ivory horizon eyes, and swept whalebone & cypress tail-fluke! */
function hkTotemWhaleTier(y0,h,r,isTop,seed){
 const woodCol=P(seed%2===0?'cypress':'driftwood');
 const finCrestMk=seed%2===0?'nauticalCrest':'nauticalCrestB';
 cyl('totemWood',0,y0,0,r,h,woodCol,14,r*.94);
 /* Dorsal sea-ridge spine along -z */
 box('tarwood',0,y0+h*.14,-r*.92,r*.34,h*.70,r*.28,P('tarwood'));

 /* Arched brow block projecting cleanly on +z for wide-open horizon-watching eyes */
 const browY=y0+h*.54,browH=h*.28,zBrow=r+.06;
 box('tarwood',0,browY,r-.02,r*1.32,browH,.16,P('tarwood'));
 const eyeW=Math.max(.14,r*.44),eyeH=Math.max(.13,browH*.76);
 for(const sx of [-1,1]){
  hkOpenHorizonEye(sx*r*.36,browY+(browH-eyeH)*.5,zBrow,eyeW,eyeH,{
   frameMk:'baleen',scleraMk:'ivory',irisMk:'nephrite',pupilMk:'seaglass'
  });
 }

 /* Dark combed baleen filter-plate mouth & curved whalebone jaw-arches below the brow */
 const mouthY=y0+h*.08,mouthH=h*.38,mouthW=r*1.08;
 box('baleen',0,mouthY,r+.01,mouthW,mouthH,.10,P('baleen'));
 const zMouthFace=r+.06;
 for(let bi=-2;bi<=2;bi++){
  hkFormLayerBox('whalebone',bi*mouthW*.17,mouthY+mouthH*.12,zMouthFace,1,mouthW*.07,mouthH*.74,P('whaleboneAged'));
 }
 for(const sx of [-1,1]){
  tube('whalebone',t=>[
   sx*(mouthW*.56+.05*Math.sin(PI*t)),
   mouthY+.02+t*(mouthH+.04),
   r*.62+.42*r*Math.sin(PI*.85*t)
  ],t=>[.045-.012*t,.06-.015*t],8,6,P('whalebone'),{caps:true});
 }

 /* Swept maritime ovoid pectoral fins projecting on +/-x */
 const finSpan=r*(isTop?1.65:1.35),finH=Math.min(.58,h*.54),finY=y0+h*.18;
 for(const sx of [-1,1]){
  const fx=sx*(r*.88+finSpan*.5);
  box(finCrestMk,fx,finY,-.04,finSpan,finH,.044,P(finCrestMk));
  hkMaritimeOvoid(fx,finY+finH*.14,-.018,finSpan*.80,finH*.72,{
   primary:'tarwood',secondary:'kaen',tertiary:'glaze'
  });
  W(fx,finY+finH*.14,-.062,PI,()=>{
   hkMaritimeUForm(0,0,0,finSpan*.74,finH*.68,sx<0?'right':'left',1,'tarwood','nephrite');
  });
 }

 /* Swept whalebone & cypress breaching tail-fluke (rising proudly at summit if isTop, or arched across dorsal crown) */
 if(isTop){
  const yFl=y0+h,flSpan=r*2.85;
  cyl('whalebone',0,yFl,0,r*.58,.14,P('whalebone'),10,r*.44);
  for(const sx of [-1,1]){
   tube('whalebone',t=>[
    sx*t*flSpan*.5,
    yFl+.12+.48*Math.sin(.68*PI*t)+.14*t,
    -.04*t
   ],t=>[.095-.045*t,.15-.065*t],9,6,P('whalebone'),{caps:true});
   const bx=sx*flSpan*.25,bw=flSpan*.38,bh=.26;
   box(finCrestMk,bx,yFl+.22,-.02,bw,bh,.036,P(finCrestMk));
   hkMaritimeUForm(bx,yFl+.25,0,bw*.82,bh*.76,sx<0?'left':'right',1,'tarwood','glaze');
  }
 }else{
  for(const sx of [-1,1]){
   tube('whalebone',t=>[
    sx*(.10+t*r*.88),
    y0+h*.82+.14*Math.sin(.7*PI*t),
    -r*.72-.16*t
   ],t=>[.055-.02*t,.08-.03*t],7,6,P('whalebone'),{caps:true});
  }
 }
}

/* 2. 'pelican' (Kopa-Tori — Diving Pouch-Pelican):
   Prominent coastal seabird with long sculpted ivory/wood upper mandible, deep distended gutskin/kaen gular throat-pouch
   (hkRigMath.pelicanPouchSag) cradling a seaglass/kaen fish AND/OR suspending a live wind-swaying emerald-nephrite tide-chime
   from the bill tip, folded or spread maritime formline sea-wings (tarwood/kaen/verdigris), crest feathers, and wide-open eyes! */
function hkTotemPelicanTier(y0,h,r,isTop,o,seed){
 o=o||{};
 const woodCol=P(seed%2===0?'cypress':'driftwood');
 const wingCrestMk=seed%2===0?'nauticalCrestB':'nauticalCrest';
 cyl('totemWood',0,y0,0,r,h,woodCol,14,r*.90);

 /* Swept occipital crest feathers behind head crown (-z) */
 for(let ci=-1;ci<=1;ci++){
  const ang=ci*.28;
  W(ci*r*.26,y0+h*.72,-r*.68,ang,()=>{
   WX(0,0,0,0,-.48,0,()=>{
    cone(ci===0?'whalebone':'kaen',0,0,0,.075,h*.34,P(ci===0?'whalebone':'kaen'),7);
   });
  });
 }

 /* Wide-open inlaid nephrite/jade & ivory/seaglass horizon-watching eyes on seabird head */
 const browY=y0+h*.64,browH=h*.24,zBrow=r+.055;
 box('tarwood',0,browY,r-.025,r*1.18,browH,.16,P('tarwood'));
 const eyeW=Math.max(.13,r*.40),eyeH=Math.max(.12,browH*.78);
 for(const sx of [-1,1]){
  hkOpenHorizonEye(sx*r*.33,browY+(browH-eyeH)*.5,zBrow,eyeW,eyeH,{
   frameMk:'tarwood',scleraMk:'ivory',irisMk:'jade',pupilMk:'seaglass'
  });
 }

 /* Long sculpted ivory & wood upper mandible projecting boldly seaward (+z) */
 const billLen=Math.max(.56,r*1.58),billW=Math.max(.16,r*.44),billH=Math.max(.08,h*.09);
 const yBill=y0+h*.50,zRoot=r*.76,zTip=zRoot+billLen,ivoryLen=billLen-.07;
 box('ivory',0,yBill,zRoot+ivoryLen*.5,billW,billH,ivoryLen,P('ivory'));
 box('wood',0,yBill+billH,zRoot+ivoryLen*.46,billW*.62,.032,ivoryLen*.72,P('wood'));
 /* Sequential hooked bronze nail beyond ivory tip (zero shared parallel face planes!) */
 box('bronze',0,yBill-.032,zTip-.035,billW*.74,billH+.012,.07,P('bronze'));

 /* Deep distended gutskin / kaen gular throat-pouch slung >= 2.4 cm below the upper mandible (hkRigMath.pelicanPouchSag) */
 const sagDepth=Math.min(.38,h*.34),yRim=yBill-.026,wPouch=billW*.92;
 /* Sculpted inner kaen throat-keel + wind-breathing gutskin gular pouch sheet */
 box('kaen',0,y0+h*.16,r*.84,billW*.64,h*.26,.16,P('kaen'));
 withCloth((lp,out)=>{
  const u=clamp((lp.z-zRoot)/Math.max(.1,billLen-.06),0,1);
  const v=clamp((lp.x+wPouch*.5)/Math.max(.08,wPouch),0,1);
  const pw=hkRigMath.pelicanPouchSag(u,v,.07);
  out.set(pw*.22,-pw*.32,pw);
 },()=>{
  psurf('gutskin',(u,v)=>{
   const zz=lerp(zRoot+.02,zTip-.06,u);
   const taper=1-.32*u;
   const xx=(v-.5)*wPouch*taper;
   const sag=hkRigMath.pelicanPouchSag(u,v,sagDepth);
   return [xx,yRim-sag,zz];
  },8,6,P('gutskin'));
 });

 /* Carved seaglass & kaen fish cradled inside the distended pelican pouch! */
 const zFish=zRoot+billLen*.42,yFish=yRim-sagDepth*.44+.055;
 ellip('seaglass',0,yFish,zFish,.055,.048,.13,P('seaglass'),0,8);
 box('kaen',0,yFish-.028,zFish-.145,.028,.056,.07,P('kaen'));

 /* Optional live wind-swaying emerald-nephrite tide-chime suspended from the pelican's bill tip! */
 let hungChime=false;
 if(o.chimeHere||(o.pelicanChime&&(isTop||o.chimeAll))){
  hungChime=true;
  const zCh=zTip-.035,yHook=yBill-.042,yCord=yHook-.11;
  const chimeLen=Math.min(.44,h*.42),chimeW=.12;
  pole('rope',[0,yHook,zCh],[0,yCord,zCh],.008,P('rope'),5);
  withCloth((lp,out)=>{
   const v=clamp((yCord-lp.y)/Math.max(.1,chimeLen),0,1);
   const pw=hkRigMath.chimePin(v)*.20;
   out.set(pw*.3,0,pw);
  },()=>{
   psurf('chime',(u,v)=>[(u-.5)*chimeW,yCord-v*chimeLen,zCh],2,6,P('chime'));
  });
 }

 /* Folded or spread maritime formline sea-wings (tarwood primary, kaen secondary, verdigris/glaze tertiary) */
 const spread=o.wings==='spread'||(isTop&&o.wings!=='folded');
 if(spread){
  const wSpan=r*2.25,wH=Math.min(.66,h*.58),wy=y0+h*.22;
  for(const sx of [-1,1]){
   const wx=sx*(r*.86+wSpan*.5);
   box(wingCrestMk,wx,wy,-.03,wSpan,wH,.046,P(wingCrestMk));
   hkMaritimeOvoid(wx-sx*wSpan*.16,wy+wH*.18,-.007,wSpan*.52,wH*.66,{
    primary:'tarwood',secondary:'kaen',tertiary:'verdigris'
   });
   hkMaritimeUForm(wx+sx*wSpan*.28,wy+wH*.16,-.007,wSpan*.32,wH*.62,sx<0?'left':'right',1,'tarwood','glaze');
   W(wx,wy+wH*.16,-.053,PI,()=>{
    hkMaritimeUForm(0,0,0,wSpan*.78,wH*.66,sx<0?'right':'left',1,'tarwood','verdigris');
   });
  }
 }else{
  const fH=h*.62,fy=y0+h*.12;
  for(const sx of [-1,1]){
   box('tarwood',sx*(r+.05),fy,-.02,.08,fH,r*1.12,P('tarwood'));
   W(sx*(r+.09),fy+fH*.12,0,sx*PI/2,()=>{
    hkMaritimeOvoid(0,0,0,r*.88,fH*.74,{primary:'kaen',secondary:'verdigris',tertiary:'glaze',eyeDot:false});
   });
  }
 }
 return hungChime;
}

/* 3. 'otter' (Rakko — Kelp Sea-Otter):
   Upright sea-otter in pelt & driftwood with ivory whiskers, kelp collar, wide-open jade/ivory eyes, and forepaws cradling
   a seaglass/jade sea-urchin or abalone shell on its belly! */
function hkTotemOtterTier(y0,h,r,seed){
 cyl('totemWood',0,y0,0,r,h,P('driftwood'),14,r*.92);
 /* Plush sea-otter pelt torso wrap stepped +2.6 cm radially & inset vertically */
 cyl('pelt',0,y0+h*.08,0,r+.026,h*.54,P('pelt'),14,r+.018);
 /* Rounded sea-otter ears */
 for(const sx of [-1,1]){
  cyl('pelt',sx*r*.62,y0+h*.78,r*.22,r*.20,h*.14,P('pelt'),8);
 }
 /* Wide-open horizon-watching eyes & whiskered muzzle */
 const browY=y0+h*.64,browH=h*.23,zBrow=r+.055;
 box('tarwood',0,browY,r-.02,r*1.14,browH,.15,P('tarwood'));
 const ew=Math.max(.12,r*.38),eh=Math.max(.11,browH*.76);
 for(const sx of [-1,1]){
  hkOpenHorizonEye(sx*r*.31,browY+(browH-eh)*.5,zBrow,ew,eh,{
   frameMk:'tarwood',scleraMk:'ivory',irisMk:'jade',pupilMk:'baleen'
  });
 }
 box('wood',0,y0+h*.48,r+.04,r*.64,h*.14,.14,P('wood'));
 for(const sx of [-1,1])for(let wi=-1;wi<=1;wi++){
  pole('ivory',[sx*r*.24,y0+h*.54+wi*.025,r+.09],[sx*r*.68,y0+h*.52+wi*.045,r+.14],.010,P('ivory'),5);
 }
 /* Carved forepaws cradling a prized seaglass/jade sea-urchin / abalone shell on belly + kelp sash */
 for(const sx of [-1,1]){
  box('tarwood',sx*r*.38,y0+h*.20,r+.05,r*.28,h*.22,.16,P('tarwood'));
 }
 ellip(seed%2===0?'seaglass':'jade',0,y0+h*.30,r+.14,r*.30,h*.14,.09,P(seed%2===0?'seaglass':'jade'),0,10);
 ring('kelp',0,y0+h*.12,0,r+.045,.032,P('kelp'),0,0,0,14);
}

/* 4. 'octopus' (Tako — Giant Kelp-Octopus):
   Bulbous kaen/tarwood cephalopod mantle with wide-open nephrite/seaglass eyes above 8 curling tentacle relief arms
   studded with non-coplanar ivory suckers gripping the Jomon kaen-doki sea-scroll collar! */
function hkTotemOctopusTier(y0,h,r){
 cyl('tarwood',0,y0,0,r*.94,h,P('tarwood'),14,r*.88);
 /* Bulbous ochre-red Jomon kaen mantle dome in upper 58% of tier */
 ellip('kaen',0,y0+h*.66,-.03,r*1.14,h*.30,r*1.10,P('kaen'),0,14);
 for(const sx of [-1,1]){
  ellip('glaze',sx*r*.56,y0+h*.76,-.08,r*.22,h*.09,r*.22,P('glaze'),0,8);
 }
 /* Wide-open horizon-watching cephalopod eyes */
 const browY=y0+h*.48,browH=h*.23,zBrow=r*1.06+.04;
 box('tarwood',0,browY,r*.96,r*1.20,browH,.14,P('tarwood'));
 const ew=Math.max(.13,r*.40),eh=Math.max(.12,browH*.78);
 for(const sx of [-1,1]){
  hkOpenHorizonEye(sx*r*.34,browY+(browH-eh)*.5,zBrow,ew,eh,{
   frameMk:'baleen',scleraMk:'ivory',irisMk:'nephrite',pupilMk:'seaglass'
  });
 }
 /* 8 curling tentacle relief arms around drum base, studded with proud ivory suckers */
 for(let k=0;k<8;k++){
  const a=(k+.5)*TAU/8;
  const cs=Math.cos(a),sn=Math.sin(a);
  tube('kaen',t=>{
   const twist=a+.32*Math.sin(PI*t)*(k%2===0?1:-1);
   const rr=r*(.96+.18*Math.sin(PI*.85*t));
   return [Math.cos(twist)*rr,y0+h*(.44-.38*t),Math.sin(twist)*rr];
  },t=>[.058-.022*t,.068-.024*t],7,6,P('kaen'),{caps:true});
  /* Two non-coplanar ivory sucker buttons per tentacle */
  for(const sf of [.32,.68]){
   const rr=r*1.15;
   sph('ivory',cs*rr,y0+h*(.44-.38*sf),sn*rr,.028,P('ivory'),1,6);
  }
 }
}

/* 5. 'seal' (Tukari — Barking Eared Fur-Seal):
   Sleek pelt/tarwood fur-seal with raised barking snout, ivory canines, ear-pinnae, wide-open eyes, and swept flippers! */
function hkTotemSealTier(y0,h,r){
 cyl('pelt',0,y0,0,r,h,P('pelt'),14,r*.88);
 /* Raised barking snout & ivory tusks on +z */
 const browY=y0+h*.62,browH=h*.23,zBrow=r+.05;
 box('tarwood',0,browY,r-.02,r*1.12,browH,.14,P('tarwood'));
 const ew=Math.max(.12,r*.38),eh=Math.max(.11,browH*.76);
 for(const sx of [-1,1]){
  hkOpenHorizonEye(sx*r*.31,browY+(browH-eh)*.5,zBrow,ew,eh,{
   frameMk:'tarwood',scleraMk:'ivory',irisMk:'nephrite',pupilMk:'baleen'
  });
  /* External fur-seal ear pinnae */
  box('tarwood',sx*r*.78,y0+h*.70,0,.06,h*.13,.12,P('tarwood'));
 }
 box('tarwood',0,y0+h*.44,r+.08,r*.58,h*.16,.22,P('tarwood'));
 for(const sx of [-1,1]){
  cone('ivory',sx*r*.16,y0+h*.37,r+.14,.024,.07,P('ivory'),6);
 }
 /* Swept lateral fore-flippers braced outward with glaze U-form relief */
 const flipW=r*1.05,flipH=h*.38;
 for(const sx of [-1,1]){
  const fx=sx*(r*.85+flipW*.45);
  box('tarwood',fx,y0+h*.10,.06,flipW,flipH,.045,P('tarwood'),0,0,-sx*.22);
  hkMaritimeUForm(fx,y0+h*.14,.085,flipW*.72,flipH*.66,sx<0?'left':'right',1,'kaen','glaze');
 }
}

/* 6. 'crab' (Reef-Crab Guardian):
   Wide armored basal kaen & glaze carapace with stalked wide-open jade/seaglass eyes, 6 gripping legs, and raised pincers! */
function hkTotemCrabTier(y0,h,r){
 cyl('totemWood',0,y0,0,r*.96,h,P('driftwood'),14,r*.92);
 /* Broad scalloped kaen & glaze carapace shield across +z chest */
 ellip('kaen',0,y0+h*.44,r*.34,r*1.32,h*.32,r*.88,P('kaen'),0,12);
 ellip('glaze',0,y0+h*.48,r*.42,r*.92,h*.20,r*.68,P('glaze'),0,10);
 /* Stalked wide-open horizon-watching crab eyes rising above carapace */
 const zEye=r*1.04,eyeY=y0+h*.68,ew=Math.max(.12,r*.36),eh=Math.max(.12,h*.20);
 for(const sx of [-1,1]){
  pole('kaen',[sx*r*.26,y0+h*.56,r*.82],[sx*r*.34,eyeY+.04,zEye-.02],.034,P('kaen'),6);
  hkOpenHorizonEye(sx*r*.34,eyeY,zEye,ew,eh,{
   frameMk:'baleen',scleraMk:'ivory',irisMk:'jade',pupilMk:'seaglass'
  });
 }
 /* Raised reef-crab pincer claws on +/-x & 3 walking-leg ribs per flank */
 for(const sx of [-1,1]){
  tube('kaen',t=>[
   sx*r*(.86+.56*Math.sin(.65*PI*t)),
   y0+h*(.36+.42*t),
   r*(.52+.44*t)
  ],t=>[.065-.018*t,.085-.022*t],7,6,P('kaen'),{caps:true});
  cone('ivory',sx*r*1.34,y0+h*.76,r*.94,.042,.14,P('ivory'),6);
  for(let li=0;li<3;li++){
   const ly=y0+h*(.16+li*.11);
   beam('tarwood',[sx*r*.88,ly,-.08],[sx*r*1.32,ly-.08,.18],.042,P('tarwood'),true,6);
  }
 }
}

/* Rooftop, gable, or court finial: bifurcated whalebone & cypress breaching whale tail-fluke or diving pelican head! */
function hkWhaleFlukeFinial(x,y,z,span,yaw,o){
 o=o||{};
 const sp=span==null?1.25:span,motif=o.motif||'fluke';
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('columnar',0,0,0,sp*.18,.12,P('columnar'),6);
   cyl('nephrite',0,.12,0,sp*.14,.09,P('nephrite'),6);
   if(motif==='pelican'){
    cyl('totemWood',0,.21,0,sp*.13,sp*.42,P('cypress'),10,sp*.10);
    hkOpenHorizonEye(-sp*.08,.44,sp*.12,.11,.10,{irisMk:'nephrite'});
    hkOpenHorizonEye(sp*.08,.44,sp*.12,.11,.10,{irisMk:'nephrite'});
    box('ivory',0,.36,sp*.32,sp*.10,.065,sp*.42,P('ivory'));
    ellip('kaen',0,.27,sp*.28,sp*.07,.08,sp*.16,P('kaen'),0,8);
   }else{
    cyl('whalebone',0,.21,0,sp*.11,.16,P('whalebone'),10,sp*.08);
    for(const sx of [-1,1]){
     tube('whalebone',t=>[
      sx*t*sp*.5,
      .34+sp*.34*Math.sin(.68*PI*t)+sp*.08*t,
      0
     ],t=>[.075-.035*t,.11-.05*t],9,6,P('whalebone'),{caps:true});
     const bx=sx*sp*.24,bw=sp*.34,bh=sp*.19;
     box('nauticalCrest',bx,.40,-.018,bw,bh,.03,P('nauticalCrest'));
     hkMaritimeUForm(bx,.42,0,bw*.80,bh*.74,sx<0?'left':'right',1,'tarwood','glaze');
    }
    hkOpenHorizonEye(0,.36,.085,sp*.16,sp*.14,{irisMk:'nephrite',pupilMk:'seaglass'});
   }
  });
 });
}

/* Non-coplanar (>= 2.4 cm z-stepped) maritime formline lintel, portal, or gable frieze board:
   whale-fluke split-Us, diving pelican profile, wave-crests, and wide-open nephrite horizon eyes! */
function hkNauticalFrieze(x,y,z,w,h,yaw,o){
 o=o||{};
 const motif=o.motif||'whale';
 const backMk=o.backMk||(motif==='pelican'?'nauticalCrestB':'nauticalCrest');
 const cutW=o.cutW==null?0:o.cutW,cutH=o.cutH==null?0:o.cutH;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   if(cutW<=0){
    box(backMk,0,0,.012,w,h,.024,P(backMk));
   }else{
    const topH=h-cutH;
    if(topH>.08)box(backMk,0,cutH,.012,w,topH,.024,P(backMk));
    const sideW=(w-cutW)/2;
    if(sideW>.08&&cutH>.04){
     for(const sx of [-1,1])box(backMk,sx*(cutW/2+sideW/2),0,.012,sideW,cutH-.006,.024,P(backMk));
    }
   }
   const zF=.024,brd=Math.min(.08,h*.14);
   hkFormLayerBox('tarwood',0,h-brd,zF,1,w,brd,P('tarwood'));
   for(const sx of [-1,1]){
    hkFormLayerBox('tarwood',sx*(w/2-brd/2),brd+.008,zF,1,brd,h-2*brd-.016,P('tarwood'));
   }
   if(cutW<=0){
    hkFormLayerBox('tarwood',0,0,zF,1,w-2*brd-.016,brd,P('tarwood'));
   }else{
    const segW=(w-cutW)/2-brd-.016;
    if(segW>.10){
     for(const sx of [-1,1])hkFormLayerBox('tarwood',sx*(cutW/2+segW/2+.008),0,zF,1,segW,brd,P('tarwood'));
    }
   }
   const bandY0=Math.max(cutH+.04,brd+.04),bandH=h-brd-bandY0-.04;
   if(bandH>.18){
    const eyeW=Math.min(w*.20,.78),eyeH=Math.min(bandH*.76,.46);
    if(w>=1.8){
     const ox=Math.min(w*.21,eyeW*.82+.16);
     for(const sx of [-1,1]){
      hkOpenHorizonEye(sx*ox,bandY0+(bandH-eyeH)*.5,zF,eyeW,eyeH,{
       frameMk:'tarwood',scleraMk:'ivory',irisMk:'nephrite',pupilMk:'seaglass'
      });
     }
     /* Central diving pelican pouch-bill or breaching whale fluke crest between the wide-open eyes */
     const midGap=2*ox-eyeW-.08;
     if(midGap>.14){
      if(motif==='pelican'){
       hkFormLayerBox('ivory',0,bandY0+bandH*.54,zF,2,midGap*.84,bandH*.22,P('ivory'));
       hkFormLayerBox('kaen',0,bandY0+bandH*.18,zF,3,midGap*.66,bandH*.32,P('kaen'));
      }else{
       hkFormLayerBox('whalebone',0,bandY0+bandH*.22,zF,2,midGap*.82,bandH*.52,P('whalebone'));
       hkFormLayerBox('glaze',0,bandY0+bandH*.34,zF,3,midGap*.48,bandH*.28,P('glaze'));
      }
     }
     /* Flanking whale-fluke split-Us & wave-crests toward board ends */
     const outIn=ox+eyeW/2+.08,outLim=w/2-brd-.06,uW=outLim-outIn;
     if(uW>.24){
      for(const sx of [-1,1]){
       hkMaritimeUForm(sx*(outIn+uW/2),bandY0+bandH*.14,zF,uW,bandH*.72,sx<0?'left':'right',1,'tarwood','verdigris');
      }
     }
    }else{
     hkOpenHorizonEye(0,bandY0+(bandH-eyeH)*.5,zF,Math.min(w*.58,.68),eyeH,{irisMk:'nephrite'});
    }
   }
  });
  if(CURREC&&!PLACE_DRY){
   (CURREC.nauticalFriezes=CURREC.nauticalFriezes||[]).push({w:+w.toFixed(2),h:+h.toFixed(2),motif});
  }
 });
}

/* Hueru-Pira / Kopa-Pira Nautical Maritime Totem Pole (4.0-9.2 m):
   Hexagonal columnar-basalt & ashlar wave-proof plinth + 3 to 5 sculpted coastal creature tiers ('whale', 'pelican',
   'otter', 'octopus', 'seal', 'crab') in flumed red-cypress, driftwood & whalebone, separated by Jomon kaen-doki
   sea-scroll collars, with 100% wide-open nephrite/jade & ivory/seaglass horizon-watching eyes! */
function hkNauticalTotemPole(x,y,z,yaw,o){
 o=o||{};
 const poleH=clamp(o.h==null?6.2:o.h,4.0,9.2);
 const seed=o.seed==null?hkTotemSeedAt(x,y,z,4177):o.seed;
 let tierList;
 if(Array.isArray(o.tiers)&&o.tiers.length>=3&&o.tiers.length<=5){
  tierList=o.tiers.slice();
 }else{
  const nT=clamp(o.count==null?(poleH>=7.6?5:poleH>=5.6?4:3):o.count,3,5)|0;
  const basePool=['crab','seal','octopus','otter'];
  tierList=[];
  for(let i=0;i<nT;i++){
   if(i===nT-1)tierList.push((seed>>>2)%2===0?'whale':'pelican');
   else if(i===nT-2)tierList.push((seed>>>2)%2===0?'pelican':'whale');
   else tierList.push(basePool[(seed+i*3)%basePool.length]);
  }
 }
 const nTiers=tierList.length;
 const r=o.r==null?clamp(poleH*.054,.24,.42):o.r;

 W(x,y,z,yaw==null?0:yaw,()=>{
  const yBase=.54;
  const topMotif=tierList[nTiers-1];
  const crownReserve=topMotif==='whale'?.66:.36;
  const bodyH=Math.max(2.4,poleH-yBase-crownReserve);
  const tierH=bodyH/nTiers;
  const tiers=hkRigMath.totemTierY(yBase,nTiers,tierH);
  const lastPelican=tierList.lastIndexOf('pelican');
  let openEyes=0,pelicanChimes=0;

  svNoWalk(()=>{
   /* Wave-proof hexagonal columnar-basalt, dressed ashlar & sawn emerald-nephrite plinth */
   cyl('columnar',0,0,0,r*2.10,.24,P('columnar'),6);
   cyl('ashlar',0,.24,0,r*1.68,.18,P('ashlar'),6);
   cyl('nephrite',0,.42,0,r*1.34,.12,P('nephrite'),6);

   for(let i=0;i<nTiers;i++){
    const ty=tiers[i],rTier=r*(1-.035*i);
    const motif=tierList[i],isTop=i===nTiers-1;
    const collarH=Math.min(.20,tierH*.18);
    const figY0=ty+collarH,figH=tierH-collarH;

    /* Jomon kaen-doki flame & sea-scroll collar dividing stacked creature tiers */
    cyl('kaen',0,ty,0,rTier*1.12,collarH*.68,P('kaen'),12);
    cyl('glaze',0,ty+collarH*.68,0,rTier*1.06,collarH*.32,P('glaze'),12);
    for(const fa of [PI*.25,PI*.75,PI*1.25,PI*1.75]){
     W(Math.cos(fa)*rTier*1.14,ty+collarH*.18,Math.sin(fa)*rTier*1.14,PI/2-fa,()=>{
      box('kaen',0,0,.045,.055,collarH*.64,.09,P('kaen'));
     });
    }

    if(motif==='whale'){
     hkTotemWhaleTier(figY0,figH,rTier,isTop,seed+i*13);
    }else if(motif==='pelican'){
     const po=o.pelicanChime&&i===lastPelican?Object.assign({},o,{chimeHere:true}):o;
     if(hkTotemPelicanTier(figY0,figH,rTier,isTop,po,seed+i*17))pelicanChimes++;
    }else if(motif==='otter'){
     hkTotemOtterTier(figY0,figH,rTier,seed+i*19);
    }else if(motif==='octopus'){
     hkTotemOctopusTier(figY0,figH,rTier);
    }else if(motif==='seal'){
     hkTotemSealTier(figY0,figH,rTier);
    }else{
     hkTotemCrabTier(figY0,figH,rTier);
    }
    openEyes++;
   }

   /* Non-whale summit cap: carved kaen-doki & whalebone sea-finial */
   if(topMotif!=='whale'){
    const yApex=yBase+bodyH;
    cyl('ashlar',0,yApex,0,r*(1-.035*(nTiers-1))*.96,.08,P('ashlar'),10);
    cyl('kaen',0,yApex+.08,0,r*.68,.16,P('kaen'),10,r*.82);
    cyl('glaze',0,yApex+.24,0,r*.78,.08,P('glaze'),10,r*.62);
   }
  });

  if(o.wallBlock!==false)hkWallBlock(0,0,0,r*3.4,Math.min(2.5,poleH),r*3.4);
  if(CURREC&&!PLACE_DRY){
   (CURREC.nauticalTotems=CURREC.nauticalTotems||[]).push({
    h:+poleH.toFixed(2),
    tiers:tierList,
    figures:nTiers,
    openEyes,
    pelicanChimes
   });
  }
 });
 return y+poleH;
}
