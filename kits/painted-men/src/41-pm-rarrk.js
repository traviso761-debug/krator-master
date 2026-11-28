// prefix: pm
// ================================================================= PROCEDURAL ARNHEM RARRK, X-RAY ROCK ART, HAND STENCILS & PUKAMANI POLES
// Replaces legacy Tlingit formlines (83-pm-tlingit.js) with authentic Painted Highlands 5-pigment art (PLAN.md §2.2):
//   - Mineral palette: red ochre (#b53324), rabbitbrush gold (#c98724), pipeclay white (#f4ede0), lignite black (#181614),
//     and rare celadonite-teal (#267974).
//   - Strict z-fight immunity: every pigment panel steps >= 1.6 cm (+z >= 0.016 m) clear of its host wall/bark face, and
//     successive motif layers step outward by +0.8 cm (+0.008 m) each so 0 coplanar triangles ever overlap!
//   - Pukamani & Lorrkon poles: 2.8-5.5 m solid/hollow canyon-oak trunks crowned with ATMOS-wind-swaying Korona bird feathers.

const PM_MURAL_Z0=0.018;
const PM_MURAL_DZ=0.008;

function pmRecordMural(kind,w,h){
 if(CURREC&&!PLACE_DRY){
  (CURREC.murals||(CURREC.murals=[])).push({kind,w:+w.toFixed(2),h:+h.toFixed(2)});
 }
}

/* 1. Polychrome Arnhem Land Rarrk Cross-Hatched Frieze / Cured-Bark Panel:
      Fine parallel reed-brush hatching & diamond clan bands in 5 mineral pigments. */
function pmRarrkPanel(x,y,z,yaw,w,h,o){
 o=o||{};
 pmRecordMural('rarrk',w,h);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   let zBase=PM_MURAL_Z0;
   if(o.barkBoard){
    /* Cured canyon-oak bark backing slab with juniper lash-poles stepped clear in Y and Z */
    box('curedBark',0,.04,zBase,w+.06,h,.022,P('curedBark'));
    const cJun=P('juniper');
    for(const sy of [-.02,h+.095])pole('juniper',[-(w/2+.08),sy,zBase+.038],[w/2+.08,sy,zBase+.038],.026,cJun,6);
    zBase+=.022+PM_MURAL_DZ;
   }
   /* Layer 1: Arnhem Land rarrk cross-hatched X-ray bark ground */
   const bgMk=o.bg||'rarrkBark';
   box(bgMk,0,.05,zBase,w-.04,h-.1,.006,P(bgMk));

   /* Layer 2 (zBase + 8 mm): Pipeclay top/bottom border bands & non-overlapping vertical clan dividers */
   const z2=zBase+PM_MURAL_DZ;
   const cPipe=P('pipeclay');
   const bH=Math.min(.065,h*.1);
   box('pipeclay',0,.05,z2,w-.06,bH,.006,cPipe);
   box('pipeclay',0,h-.05-bH,z2,w-.06,bH,.006,cPipe);
   const nBays=Math.max(2,Math.min(5,Math.round(w/.62)));
   const bayW=(w-.12)/nBays;
   const innerH=Math.max(.14,h-.12-2*bH),innerY=.06+bH;
   for(let i=1;i<nBays;i++){
    const bx=-w/2+.06+i*bayW;
    box('pipeclay',bx,innerY+.01,z2,.026,innerH-.02,.006,cPipe);
   }

   /* Layer 3 (zBase + 16 mm): Fine parallel rarrk cross-hatching strips alternating rabbitGold, celadoniteTeal & lignite */
   const z3=z2+PM_MURAL_DZ;
   const hatchMks=['rabbitGold','celadoniteTeal','pipeclay','lignite'];
   for(let b=0;b<nBays;b++){
    const cxBay=-w/2+.06+(b+.5)*bayW;
    const mkH=hatchMks[b%hatchMks.length];
    const colKey=mkH==='rabbitGold'?'plasterOchre':mkH;
    const cStrip=P(mkH==='rabbitGold'?'rabbitGold':colKey);
    const nStrips=Math.max(3,Math.min(6,Math.floor((bayW-.08)/.085)));
    for(let s=0;s<nStrips;s++){
     const sx=cxBay+((s-(nStrips-1)/2)*(bayW-.1)/Math.max(1,nStrips));
     box(colKey,sx,innerY+.02,z3,.022,innerH-.04,.006,cStrip);
    }
   }

   /* Layer 4 (zBase + 24 mm): Central clan diamond lozenges per compartment */
   const z4=z3+PM_MURAL_DZ;
   for(let b=0;b<nBays;b++){
    const cxBay=-w/2+.06+(b+.5)*bayW;
    const dm=b%2===0?'celadoniteTeal':'ochreRed';
    const sz=Math.min(bayW*.34,innerH*.34,.22);
    box(dm,cxBay,innerY+innerH*.5-sz*.5,z4,sz,sz,.006,P(dm));
   }
  });
 });
}

/* 2. Arnhem Land X-Ray Fauna Mural: pipeclay animal silhouette with red-ochre spine, ribs, heart & lungs visible inside!
      Supports 'pronghorn' (plateau grazer), 'raptor' (cliff eagle) and 'korona' (frilled gorge crawler). */
function pmXrayBeastPanel(x,y,z,yaw,w,h,o){
 o=o||{};
 const beast=o.beast||'pronghorn';
 pmRecordMural('xray-'+beast,w,h);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const z1=PM_MURAL_Z0,z2=z1+PM_MURAL_DZ,z3=z2+PM_MURAL_DZ,z4=z3+PM_MURAL_DZ,z5=z4+PM_MURAL_DZ;
   const cPipe=P('pipeclay');
   /* Layer z1: Subtle ochre wash field behind silhouette */
   box('ochreRed',0,0,z1,w,h,.006,P('ochreRed'));

   if(beast==='raptor'){
    /* Layer z2: Spread-winged cliff raptor silhouette in uniform pipeclay with 1 cm part gaps */
    box('pipeclay',0,h*.22,z2,w*.17,h*.5,.006,cPipe);
    box('pipeclay',-w*.27,h*.44,z2,w*.32,h*.22,.006,cPipe);
    box('pipeclay',w*.27,h*.44,z2,w*.32,h*.22,.006,cPipe);
    box('pipeclay',0,h*.75,z2,w*.12,h*.14,.006,cPipe);
    /* Layer z3: Lignite spine; Layer z4: Ochre wing-bones; Layer z5: Celadonite heart */
    box('lignite',0,h*.26,z3,.026,h*.54,.006,P('lignite'));
    const cOchre=P('ochreRed'),cGold=P('rabbitGold');
    for(const sw of [-1,1]){
     box('ochreRed',sw*w*.25,h*.52,z4,w*.25,.028,.006,cOchre);
     box('plasterOchre',sw*w*.23,h*.45,z4,w*.21,.024,.006,cGold);
    }
    box('celadoniteTeal',0,h*.48,z5,w*.09,h*.12,.006,P('celadoniteTeal'));
   }else{
    /* Layer z2: Plateau Pronghorn / Korona Grazer in profile */
    const bw=w*.52,bh=h*.27,by=h*.38;
    box('pipeclay',-.04*w,by,z2,bw,bh,.006,cPipe);
    box('pipeclay',w*.26,by+bh*.46,z2,w*.11,h*.22,.006,cPipe);
    box('pipeclay',w*.31,by+bh*.46+h*.235,z2,w*.15,h*.095,.006,cPipe);
    for(const lx of [-w*.25,-w*.14,w*.09,w*.18]){
     box('pipeclay',lx,by-h*.25,z2,.028,h*.23,.006,cPipe);
    }
    /* Layer z3: Lignite spine + forked horns; Layer z4: Ochre ribs; Layer z5: Heart & stomach */
    const cGold=P('rabbitGold');
    box('plasterOchre',w*.28,by+bh*.46+h*.345,z3,.026,h*.12,.006,cGold);
    box('plasterOchre',w*.34,by+bh*.46+h*.345,z3,.026,h*.1,.006,cGold);
    box('lignite',-.03*w,by+bh*.7,z3,bw*.88,.026,.006,P('lignite'));
    const cRib=P('ochreRed');
    for(let r=0;r<5;r++){
     const rx=-w*.21+r*(bw*.64/4);
     box('ochreRed',rx,by+bh*.18,z4,.022,bh*.46,.006,cRib);
    }
    box('celadoniteTeal',w*.1,by+bh*.24,z5,w*.09,bh*.32,.006,P('celadoniteTeal'));
    box('plasterOchre',-w*.12,by+bh*.2,z5,w*.11,bh*.3,.006,cGold);
   }
  });
 });
}

/* 3. Yanta-Rringka Stencilled Open Hands (LORE.md §10 canonical emblem!):
      Negative-blown mineral pigment auras with spread 5-fingered hand silhouettes. */
function pmHandStencilCluster(x,y,z,yaw,w,h,o){
 o=o||{};
 const count=o.count==null?3:o.count;
 pmRecordMural('yanta-rringka-hands',w,h);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const z1=PM_MURAL_Z0,z2=z1+PM_MURAL_DZ;
   const auras=['handStencil','handStencilB','pipeclay','celadoniteTeal'];
   const cHand=P('lignite');
   for(let i=0;i<count;i++){
    const u=count===1?.5:i/(count-1);
    const hx=lerp(-w*.34,w*.34,u);
    const hy=h*(.26+(i%2)*.22);
    const auraMk=auras[i%auras.length];
    /* Blown pigment rock-art plaque (z1) */
    box(auraMk,hx,hy-.06,z1,.26,.34,.006,P(auraMk));
    /* Negative open hand silhouette (z2): palm + 5 non-overlapping spread fingers */
    box('lignite',hx,hy+.02,z2,.105,.105,.006,cHand);
    box('lignite',hx-.075,hy+.06,z2,.022,.082,.006,cHand);
    for(let f=0;f<4;f++){
     const fx=hx-.042+f*.028,fh=f===1||f===2?.11:.09;
     box('lignite',fx,hy+.138,z2,.018,fh,.006,cHand);
    }
   }
  });
 });
}

/* 4. Concentric Waterhole & Songline Track-Ring Mural (wall-mounted or plaza-inlaid). */
function pmTrackRingMap(x,y,z,yaw,r,o){
 o=o||{};
 pmRecordMural('track-rings',r*2,r*2);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const mks=['pipeclay','ochreRed','celadoniteTeal','plasterOchre'];
   if(o.flat){
    /* Horizontal plaza inlay stepped by concentric non-overlapping annular rings above slab */
    for(let i=0;i<4;i++){
     const rOut=r*(1-i*.22),rIn=r*(1-(i+1)*.22)+.03;
     if(rOut-rIn>.03){
      const mk=mks[i%4];
      sector(mk,0,0,Math.max(.04,rIn),rOut,0,TAU,.008,.024,P(mk==='plasterOchre'?'rabbitGold':mk),20);
     }
    }
   }else{
    /* Vertical wall concentric waterhole rings */
    for(let i=0;i<3;i++){
     const rr0=r*(1-i*.28),mk=mks[i%4];
     ring(mk,0,r,PM_MURAL_Z0+i*0.006,rr0,.03,P(mk==='plasterOchre'?'rabbitGold':mk),0,0,0,18);
    }
    /* Songline trail bars radiating left & right */
    const cPipe=P('pipeclay');
    for(const s of [-1,1]){
     box('pipeclay',s*(r+.26),r-.025,PM_MURAL_Z0,.36,.05,.006,cPipe);
    }
   }
  });
 });
}

/* 5. Kimberley Wandjina Seep-Brow Rain/Spring Spirit Mural (mouthless halo-headed spirit above WATER.still springs). */
function pmWandjinaBrow(x,y,z,yaw,w,h,o){
 o=o||{};
 pmRecordMural('wandjina-spirit',w,h);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const z1=PM_MURAL_Z0,z2=z1+PM_MURAL_DZ,z3=z2+PM_MURAL_DZ,z4=z3+PM_MURAL_DZ;
   const cPipe=P('pipeclay'),cEye=P('lignite'),cOchre=P('ochreRed'),cTeal=P('celadoniteTeal');
   /* Cloud-white pipeclay shoulder & halo backing (z1) */
   box('pipeclay',0,0,z1,w*.72,h*.41,.006,cPipe);
   box('pipeclay',0,h*.43,z1,w*.48,h*.44,.006,cPipe);

   /* Radiant red-ochre (z2) & celadonite-teal (z3) feather/lightning halo crown */
   const nRays=9;
   for(let i=0;i<nRays;i++){
    const a=lerp(-PI*.44,PI*.44,i/(nRays-1));
    const rx=Math.sin(a)*w*.34,ry=h*.62+Math.cos(a)*h*.24;
    if(i%2===0)box('ochreRed',rx,ry,z2,.046,h*.16,.006,cOchre);
    else box('celadoniteTeal',rx,ry,z3,.046,h*.16,.006,cTeal);
   }

   /* Mouthless Wandjina face (z4): two deep lignite eyes & nose bridge, chest oval pendant */
   for(const sx of [-w*.09,w*.09]){
    box('lignite',sx,h*.58,z4,w*.085,h*.12,.006,cEye);
   }
   box('ochreRed',0,h*.44,z4,.038,h*.13,.006,cOchre);
   box('celadoniteTeal',0,h*.16,z4,w*.16,h*.18,.006,cTeal);
  });
 });
}

/* 6. Pukamani & Lorrkon Clan / Mortuary Poles (2.8 - 5.5 m solid or hollow canyon-oak trunks):
      Carved hourglass waists, stacked 5-pigment rarrk collars, and wind-swaying Korona iridescent bird-feather crests! */
function pmPukamaniPole(x,y,z,hRaw,o){
 o=o||{};
 const h=clamp(hRaw==null?3.8:hRaw,2.8,5.5);
 const r0=o.r==null?.2:o.r;
 if(CURREC&&!PLACE_DRY){
  (CURREC.poles||(CURREC.poles=[])).push({kind:o.lorrkon?'lorrkon':'pukamani',h:+h.toFixed(2)});
 }

 W(x,y,z,o.yaw||0,()=>{
  svNoWalk(()=>{
   /* Danxia sandstone collar base [0 .. 0.22] */
   cyl('danxiaCut',0,0,0,r0*1.55,.22,P('danxiaCut'),12);

   /* Stacked carved segments along Y with 4 mm vertical step gaps so zero faces overlap! */
   let yy=.224;
   const trunkH=h-.62;
   const bands=[
    {f:.22,mk:'rarrkBark',rA:1.0,rB:.96},
    {f:.12,mk:'lignite',rA:.64,rB:.64},
    {f:.24,mk:'ochreRed',rA:.98,rB:.95},
    {f:.10,mk:'pipeclay',rA:1.04,rB:1.04},
    {f:.14,mk:'celadoniteTeal',rA:.66,rB:.66},
    {f:.18,mk:'rarrkBark',rA:.96,rB:.9}
   ];
   for(const b of bands){
    const segH=trunkH*b.f-.004;
    if(segH>.04){
     const colKey=b.mk==='plasterOchre'?'rabbitGold':b.mk;
     if(o.lorrkon&&b.mk==='ochreRed'){
      /* Hollow Lorrkon bone-coffin aperture: split C-ring leaving front viewing slit */
      sector('ochreRed',0,0,r0*.52,r0*b.rA,PI*.68,TAU+PI*.32,yy,yy+segH,P('ochreRed'),14);
      cyl('lignite',0,yy+.02,0,r0*.48,segH-.04,P('lignite'),10);
     }else{
      lathe(b.mk,0,0,[[r0*b.rA,yy],[r0*b.rB,yy+segH]],12,P(colKey));
     }
    }
    yy+=trunkH*b.f;
   }

   /* Carved twin crown horns / cross-bar */
   if(o.horns!==false){
    for(const sx of [-1,1]){
     pole('canyonOak',[sx*r0*.5,yy-.04,0],[sx*r0*1.75,yy+.36,0],r0*.26,P('canyonOak'),7);
     cyl('pipeclay',sx*r0*1.75,yy+.36,0,r0*.28,.07,P('pipeclay'),8);
    }
   }
   cyl('juniperBark',0,yy,0,r0*.92,.14,P('juniperBark'),10);

   /* Wind-swaying radial burst of iridescent Korona-trench bird feathers (SV_CLOTH: feather & featherWarm) */
   const nFeath=o.feathers==null?10:o.feathers;
   const fLen=o.featherLen==null?.52:o.featherLen;
   const fY=yy+.12;
   for(let i=0;i<nFeath;i++){
    const a=i*TAU/nFeath;
    const fMk=i%2===0?'feather':'featherWarm';
    W(Math.cos(a)*r0*.68,fY,Math.sin(a)*r0*.68,a,()=>{
     withCloth((p,out)=>{
      const v=clamp(p.y/Math.max(.15,fLen),0,1);
      const wgt=pmRigMath.featherPin(v)*.22;
      out.set(wgt*.55,wgt*.2,wgt);
     },()=>{
      psurf(fMk,(u,v)=>{
       const wvane=(u-.5)*.13*Math.sin(PI*Math.pow(v,.72));
       return [wvane,v*fLen,v*v*.26];
      },3,6,P(fMk));
     });
    });
   }
  });
 });
}
