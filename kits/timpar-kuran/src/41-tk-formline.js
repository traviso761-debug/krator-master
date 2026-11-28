// prefix: tk
// ================================================================= PROCEDURAL TLINGIT FORMLINE & TOTEM-PORTAL ENGINE (PLAN.md §3.1)
// Builds crisp salmon-egg-tempera black/red/teal formline house-front screens, gable tympanums, freestanding stacked crest
// & mortuary totem poles, and monumental oval totem-mouth entrance portals fitted with operable pivoting KDOOR plug-doors.
// Strict non-coplanar depth discipline (tkRigMath.formlineLayerZ):
//   Layer 1 (primary lignite-black ovoids, frame bars & U-forms):  zFace + 1.8 cm (th 1.4 cm -> [zFace+0.011 .. zFace+0.025])
//   Layer 2 (secondary cinnabar-red S-forms, inner U & mouths):    zFace + 3.6 cm (th 1.4 cm -> [zFace+0.029 .. zFace+0.043])
//   Layer 3 (tertiary celadonite-teal eye-sockets, split-Us):      zFace + 5.4 cm (th 1.4 cm -> [zFace+0.047 .. zFace+0.061])
//   Layer 4 (gleaming native-copper & pale-inau open eyes):        zFace + 7.2 cm (th 1.4 cm -> [zFace+0.065 .. zFace+0.079])
// Every layer sits in a strictly disjoint z-band (>= 4 mm air-gap between back & front of adjacent layers, 1.8 cm step),
// and inner shapes inset >= 3 cm inside outer borders so 0 coplanar faces ever occur across any of the 6 box normals!

function tkFormLayerBox(mk,x,y,zFace,layerIdx,w,h,col){
 if(w<.02||h<.02)return;
 const zMid=tkRigMath.formlineLayerZ(zFace,layerIdx);
 box(mk,x,y,zMid,w,h,.014,col);
}

/* Stepped Tlingit ovoid relief: primary black outer ovoid frame, secondary red inner eyelid, tertiary teal socket & copper open eye. */
function tkOvoidRelief(x,y,zFace,w,h,cr,o){
 o=o||{};
 const c1=hc(cr.primary),c2=hc(cr.secondary),c3=hc(cr.tertiary),cEye=hc(cr.eye);
 /* Layer 1: Primary black ovoid with bevelled corner shoulders (3 non-overlapping vertical strips!) */
 const shoulderW=Math.min(w*.14,.14);
 tkFormLayerBox('formBlack',x,y,zFace,1,w-2*shoulderW,h,c1);
 for(const sx of [-1,1]){
  tkFormLayerBox('formBlack',x+sx*(w/2-shoulderW/2+.002),y+h*.12,zFace,1,shoulderW-.004,h*.76,c1);
 }
 /* Layer 2: Secondary cinnabar-red inner U/ovoid inset >= 4 cm */
 if(w>.28&&h>.2){
  tkFormLayerBox('formRed',x,y+h*.16,zFace,2,w*.68,h*.66,c2);
 }
 /* Layer 3: Tertiary celadonite-teal eye-socket / trigon */
 if(w>.38&&h>.26&&o.eye!==false){
  tkFormLayerBox('formTeal',x,y+h*.25,zFace,3,w*.46,h*.44,c3);
  /* Layer 4: Open gleaming copper eye inlay */
  tkFormLayerBox('copper',x,y+h*.31,zFace,4,w*.24,h*.26,cEye);
 }
}

/* Tlingit U-form & split-U feather/fin relief (dir: 'up', 'down', 'left', 'right') in a single disjoint layer. */
function tkUFormRelief(x,y,zFace,w,h,dir,layerIdx,mk,col,splitTeal){
 const leg=Math.min(w,h)*.24;
 if(dir==='up'||dir==='down'){
  const capY=dir==='up'?y+h-leg:y;
  tkFormLayerBox(mk,x,capY,zFace,layerIdx,w,leg,col);
  for(const sx of [-1,1]){
   tkFormLayerBox(mk,x+sx*(w/2-leg/2),dir==='up'?y:y+leg+.004,zFace,layerIdx,leg,h-leg-.004,col);
  }
  if(splitTeal&&w>.34&&h>.3){
   tkFormLayerBox('formTeal',x,y+h*.22,zFace,layerIdx+1,w*.24,h*.52,hc(SVPAL.formTeal[0]));
  }
 }else{
  const capX=dir==='right'?x+w/2-leg/2:x-w/2+leg/2;
  tkFormLayerBox(mk,capX,y,zFace,layerIdx,leg,h,col);
  for(const sy of [0,1]){
   const by=sy===0?y:y+h-leg;
   tkFormLayerBox(mk,dir==='right'?x-leg/2-.002:x+leg/2+.002,by,zFace,layerIdx,w-leg-.004,leg,col);
  }
  if(splitTeal&&w>.34&&h>.3){
   tkFormLayerBox('formTeal',x,y+h*.36,zFace,layerIdx+1,w*.5,h*.26,hc(SVPAL.formTeal[0]));
  }
 }
}

/* Full-facade or frieze-band Tlingit clan house-front screen (Kuma Bear, Kapac Storm-Bird, Rapan Raven, Hueru Whale, Wurup Wolf).
   Leaves a clean central portal cutout (o.cutW x o.cutH from bottom) so 0 relief bars ever cross a doorway or totem-mouth! */
function tkFormlineScreen(x,y,zFace,yaw,w,h,o){
 o=o||{};
 const cr=tkCrestOf(o.crest||tkSeedAt(x,y,zFace,53));
 const cutW=o.cutW==null?0:o.cutW,cutH=o.cutH==null?0:o.cutH;
 const c1=hc(cr.primary),c2=hc(cr.secondary),c3=hc(cr.tertiary);
 W(x,y,zFace,yaw||0,()=>{
  svNoWalk(()=>{
   const brd=.11;
   /* Top & side primary black framing formlines (non-overlapping!) */
   tkFormLayerBox('formBlack',0,h-brd,0,1,w,brd,c1);
   for(const sx of [-1,1]){
    tkFormLayerBox('formBlack',sx*(w/2-brd/2),.02,0,1,brd,h-brd-.024,c1);
   }
   if(cutW<=0){
    tkFormLayerBox('formBlack',0,0,0,1,w-2*brd-.008,brd,c1);
   }else{
    const segW=(w-cutW)/2-brd-.02;
    if(segW>.2){
     for(const sx of [-1,1])tkFormLayerBox('formBlack',sx*(cutW/2+segW/2+.01),0,0,1,segW,brd,c1);
    }
   }
   /* Upper crest head spanning above the doorway / frieze */
   const headY0=Math.max(cutH+.14,h*.44),headH=h-brd-headY0-.12;
   if(headH>.38){
    const headW=Math.min(w*.48,4.6);
    tkFormLayerBox('formBlack',0,headY0,0,1,headW,headH,c1);
    /* Twin glaring clan crest eyes inside the head */
    const ew=headW*.32,eh=headH*.52;
    for(const sx of [-1,1]){
     tkOvoidRelief(sx*headW*.26,headY0+headH*.28,0,ew,eh,cr,{eye:true});
    }
    /* Crest animal nose/beak/blowhole signature in Layer 2 & 3 */
    if(cr.animal==='eagle'||cr.animal==='raven'){
     tkFormLayerBox('formRed',0,headY0+.06,0,2,headW*.22,headH*.48,c2);
     tkFormLayerBox('formTeal',0,headY0+.14,0,3,headW*.11,headH*.26,c3);
    }else if(cr.animal==='whale'){
     tkFormLayerBox('formTeal',0,headY0+headH*.56,0,2,headW*.18,headH*.34,c3);
     tkFormLayerBox('formRed',0,headY0+.06,0,2,headW*.54,headH*.2,c2);
    }else{
     /* Bear or Wolf broad muzzle & bared teeth */
     tkFormLayerBox('formRed',0,headY0+.05,0,2,headW*.48,headH*.32,c2);
     for(let t=-2;t<=2;t++)tkFormLayerBox('copper',t*headW*.08,headY0+.09,0,3,headW*.045,headH*.14,hc(SVPAL.bone[0]));
    }
   }
   /* Flanking side fields (wings, paws, flippers, ribs) left & right of doorway */
   const wingIn=Math.max(cutW/2+.22,w*.18),wingOut=w/2-brd-.14,wingW=wingOut-wingIn;
   if(wingW>.55&&h>1.1){
    const cxMid=(wingIn+wingOut)/2;
    for(const sx of [-1,1]){
     /* Shoulder/joint ovoid near top */
     tkOvoidRelief(sx*cxMid,h*.54,0,Math.min(wingW*.86,1.65),Math.min(h*.3,1.05),cr,{eye:true});
     /* Primary & secondary U-form feathers / claws / flippers below shoulder */
     if(h>1.9){
      tkUFormRelief(sx*cxMid,.22,0,Math.min(wingW*.84,1.6),Math.min(h*.28,.95),sx<0?'left':'right',1,'formBlack',c1,true);
      tkFormLayerBox('formRed',sx*cxMid,h*.44,0,2,wingW*.72,.1,c2);
     }
    }
   }
  });
 });
}

/* Triangular Tlingit gable-end crest relief strictly clipped inside roof eaves (w x rise) with >= 1.8 cm depth steps. */
function tkFormlineGable(x,yEaves,zFace,yaw,w,rise,o){
 o=o||{};
 const cr=tkCrestOf(o.crest||tkSeedAt(x,yEaves,zFace,61));
 W(x,yEaves,zFace,yaw||0,()=>{
  svNoWalk(()=>{
   const maxH=rise*.68,cw=Math.min(w*.34,2.8);
   if(maxH>.42&&cw>.6){
    tkOvoidRelief(0,.12,0,cw,maxH*.66,cr,{eye:true});
    for(const sx of [-1,1]){
     const fw=Math.min(w*.18,1.35),fx=sx*(cw/2+fw/2+.12);
     if(Math.abs(fx)+fw/2<w*.38){
      tkUFormRelief(fx,.1,0,fw,maxH*.38,sx<0?'left':'right',1,'formBlack',hc(cr.primary),true);
     }
    }
   }
  });
 });
}

/* Single carved 3D totem animal drum (bear, eagle, raven, whale, wolf) from y0 up segH, radius r, facing +z. */
function tkTotemFigure(y0,segH,r,animal,cr){
 const drumMk=animal==='eagle'||animal==='whale'?'totemB':'totem';
 const cWood=hc(SVPAL[drumMk][0]),c1=hc(cr.primary),c2=hc(cr.secondary),c3=hc(cr.tertiary),cEye=hc(cr.eye);
 cyl(drumMk,0,y0,0,r,segH-.04,cWood,14,r*.97);
 /* Dividing black carved collar ring stepped radially outward by +2.5 cm */
 cyl('formBlack',0,y0+segH-.04,0,r+.025,.04,c1,14);
 /* Projecting brow & eyes on +z face */
 box('formBlack',0,y0+segH*.64,r*.88,r*1.28,segH*.2,r*.32,c1);
 for(const sx of [-1,1]){
  box('formTeal',sx*r*.36,y0+segH*.66,r*1.06,r*.36,segH*.14,.03,c3);
  box('copper',sx*r*.36,y0+segH*.68,r*1.095,r*.18,segH*.09,.026,cEye);
 }
 if(animal==='eagle'||animal==='raven'){
  /* Hooked Storm-Eagle beak or long straight Mist-Raven beak + folded side wings */
  const beakL=animal==='raven'?r*1.15:r*.78;
  box('formRed',0,y0+segH*.44,r+.5*beakL-.06,r*.38,segH*.18,beakL,c2);
  if(animal==='eagle')box('formBlack',0,y0+segH*.34,r+beakL-.14,r*.28,segH*.14,r*.24,c1);
  for(const sx of [-1,1])box('formBlack',sx*(r+.06),y0+segH*.16,0,.1,segH*.56,r*.86,c1);
 }else if(animal==='whale'){
  /* Ancestral Hueru whale dorsal fin & upturned tail flukes across chest */
  box('formBlack',0,y0+segH*.28,r*.92,r*1.1,segH*.28,r*.26,c3);
  for(const sx of [-1,1])box('formRed',sx*r*.52,y0+segH*.14,r*1.02,r*.48,segH*.16,.08,c2,0,0,sx*.25);
 }else{
  /* Bear (Kim-un-kamuy) or Wolf snout, ears & clutching forepaws */
  box('formRed',0,y0+segH*.42,r*.98,r*.74,segH*.2,r*.42,c2);
  for(const sx of [-1,1]){
   box('formBlack',sx*r*.52,y0+segH*.82,r*.35,r*.28,segH*.16,r*.28,c1);
   box('formBlack',sx*r*.44,y0+segH*.14,r*.92,r*.34,segH*.24,r*.28,c1);
  }
 }
}

/* Freestanding stacked Tlingit crest or mortuary totem pole (2-4 figures, optional outstretched Thunderbird wings or bone-chest!). */
function tkTotemPole(x,y,z,yaw,h,r,o){
 o=o||{};
 const nFigs=o.figures==null?3:o.figures,seed=o.seed==null?tkSeedAt(x,y,z,71):o.seed;
 const cr=tkCrestOf(o.crest||seed);
 const animals=['bear','whale','raven','eagle','wolf'];
 const crestBoardMk=seed%2===0?'formCrest':'formCrestB';
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('megabreccia',0,0,0,r*2.8,.24,r*2.8,hc(SVPAL.megabreccia[0]));
   const segH=(h-.24)/nFigs;
   for(let i=0;i<nFigs;i++){
    const an=i===nFigs-1?cr.animal:animals[(seed+i*3)%animals.length];
    tkTotemFigure(.24+i*segH,segH,r*(1-i*.04),an,tkCrestOf(seed+i));
   }
   /* Outstretched Storm-Bird cross-wings near summit */
   if(o.wings){
    const wy=h-segH*.58,span=o.wingSpan==null?r*4.6:o.wingSpan;
    for(const sx of [-1,1]){
     box(crestBoardMk,sx*(r+span/2-.04),wy,0,span,segH*.36,.09,hc(SVPAL[crestBoardMk][0]));
     tkFormLayerBox('formBlack',sx*(r+span/2),wy+.04,.045,1,span*.88,segH*.26,hc(cr.primary));
     tkFormLayerBox('formRed',sx*(r+span*.46),wy+.08,.045,2,span*.58,segH*.14,hc(cr.secondary));
    }
   }
   /* Mortuary sky-box bone-chest at pole summit (tk_nusa_mortuary_row) */
   if(o.mortuaryBox){
    box(crestBoardMk,0,h,0,r*3.1,.72,r*1.9,hc(SVPAL[crestBoardMk][0]));
    box('cypress',0,h+.72,0,r*3.4,.14,r*2.1,hc(SVPAL.cypressD[0]));
    tkOvoidRelief(0,h+.14,r*.95,r*2.2,.44,cr,{eye:true});
   }
  });
 });
}

/* Monumental 8-13 m Tlingit house-frontal TOTEM-MOUTH ENTRANCE PORTAL:
   Stacked high-relief carved totem column rising above a sculpted oval belly/mouth doorway (doorW x doorH)
   fitted with an operable KDOOR pivoting cedar plug-door (pivot: true) and recorded onto CURREC.totemPortals! */
function tkTotemPortal(x,y,z,yaw,poleH,poleR,doorW,doorH,o){
 o=o||{};
 const seed=o.seed==null?tkSeedAt(x,y,z,89):o.seed,cr=tkCrestOf(o.crest||seed);
 const baseH=doorH+.68,upperH=Math.max(2.4,poleH-baseH),nUpper=upperH>5.2?3:2;
 const portalWingMk=seed%2===0?'formCrestB':'formCrest';
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Cheek totem piers flanking the oval belly/mouth doorway */
   for(const sx of [-1,1]){
    box('megabreccia',sx*(doorW/2+poleR*.52),0,0,poleR*1.15,.22,poleR*1.6,hc(SVPAL.megabreccia[0]));
    cyl('totem',sx*(doorW/2+poleR*.48),.22,0,poleR*.56,baseH-.22,hc(SVPAL.totem[0]),12);
    /* Bear/Whale paws clutching the doorway cheeks */
    box('formBlack',sx*(doorW/2+poleR*.52),.48,poleR*.46,poleR*.52,.68,.16,hc(cr.primary));
   }
   /* Heavy carved brow/jaw lintel bridging over the oval mouth */
   box('totemB',0,doorH+.04,0,doorW+poleR*2.0,.64,poleR*1.65,hc(SVPAL.totemB[0]));
   /* 12-segment sculpted cinnabar-red & black oval lip-ring framing the totem-mouth portal! */
   const rx=doorW*.56,ry=doorH*.5,yMid=doorH*.52;
   for(let i=0;i<12;i++){
    const a=(i+.5)*TAU/12,[ox,oy]=tkRigMath.totemOvalPt(rx,ry,yMid,a);
    if(oy>.16){
     box(i%2===0?'formRed':'formBlack',ox,oy-.11,poleR*.58,.24,.22,.14,hc(i%2===0?cr.secondary:cr.primary),0,0,a-PI/2);
    }
   }
   /* Glaring crest eyes directly above the oval mouth */
   for(const sx of [-1,1]){
    tkOvoidRelief(sx*(doorW*.42),doorH+.14,poleR*.82,.64,.42,cr,{eye:true});
   }
   /* Upper stacked crest figures rising to poleH */
   const segH=upperH/nUpper,animals=['bear','whale','eagle','raven'];
   for(let i=0;i<nUpper;i++){
    const an=i===nUpper-1?cr.animal:animals[(seed+i)%animals.length];
    tkTotemFigure(baseH+i*segH,segH,poleR*(.98-i*.05),an,tkCrestOf(seed+i*2));
   }
   if(o.wings!==false){
    const wy=poleH-segH*.55,span=poleR*4.4;
    for(const sx of [-1,1]){
     box(portalWingMk,sx*(poleR+span/2-.04),wy,0,span,segH*.34,.09,hc(SVPAL[portalWingMk][0]));
     tkFormLayerBox('formBlack',sx*(poleR+span/2),wy+.04,.045,1,span*.86,segH*.24,hc(cr.primary));
     tkFormLayerBox('formTeal',sx*(poleR+span*.44),wy+.08,.045,2,span*.52,segH*.13,hc(cr.tertiary));
    }
   }
  });
  /* Operable KDOOR pivoting cedar plug-door inside the oval totem-mouth opening! */
  svLeaf(0,.02,0,0,doorW-.06,doorH-.06,{
   mk:'cypress',col:hc(SVPAL.cypress[0]),style:'plank',pivot:true,
   hwCol:0xb8683c,locked:false,name:o.name||'totem-mouth-portal'
  });
  door(0,0,poleR*.55,0,doorW,doorH);
  if(CURREC&&!PLACE_DRY){
   (CURREC.totemPortals=CURREC.totemPortals||[]).push({crest:cr.key,poleH,doorW,doorH,pivot:true});
  }
 });
}
