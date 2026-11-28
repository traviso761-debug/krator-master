// prefix: kl
// ================================================================= SUUDME-KAARUM SYNCRETIC TOOLKIT: ISHTAR-KURA, TRAVERTINE ARCADES & BELL-MONDOPS
// Implements the 3rd Kulanewa architectural style (style: 'suudme' — assimilated lowland estuary towns at East Bluff Suudme-Kuluuna
// and the Tooka-Hoov treaty pontoon-wards of the Floating City along Ria Sound), fusing Kuruneva Suurgild vaults, staves, paktong
// and Kellakoda clearing-bells 50/50 with Lower-Ria Babylonian polychrome glazed arches, Classical travertine arcades, Ruan-Thai
// dark-teak galleries, bimetallic Uktena serpent rails, and sweeping Pyatthat/Mondop crowns:
//   1. klIshtarPortal / klIshtarKuraVault — Battered chalk-white kura bullion vault + Babylonian polychrome glazed Ishtar arch
//   2. klRoundArcade / klArcadeKiyomizu   — Classical travertine round-arch loggia + interlocking dark-cedar Kiyomizu tidal quay
//   3. klTeakSanjhyaGallery               — Raised Ruan-Thai dark-teak gallery + glazed spandrels + carved klSanjhyaOriel windows
//   4. klHoopedGlazePylon / klPyatthatSkywalk — Travertine-and-cobalt battered pylon cinched in paktong & gilt tension hoops
//   5. klBellMondop                       — 2-to-5-tier glazed Rian Pyatthat/Mondop roof with chofa horns housing klBellCupola
//   6. klPaktongNagaHead5 / klPaktongNagaRail / klSuudmeStair — Bimetallic silver-paktong & gilt 5-headed Uktena serpent stair rail
// Invariants: 100% svNoWalk on non-floors, >= 0.03 m face step (0 z-fighting), 100% solid interior ceilings & {inward: true} soffits.

/* Upturned gilded Rian chofa / hang-hong eave and ridge horn on a silver-white paktong collar. */
function klChofaHorn(x,y,z,yaw,sc){
 const s=sc==null?1:sc;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('paktong',0,0,0,.065*s,.12*s,P('paktong'),8);
   beam('brass',[0,.126*s,0],[0,.66*s,.18*s],.05*s,P('gilt'),true,6,.016*s);
   sph('brass',0,.31*s,.08*s,.07*s,P('gilt'),.85,8);
  });
 });
}

/* Flaring Egyptian-Rian cavetto cornice stacked strictly in Y (>= 4 mm vertical step -> 0 shared planes). */
function klCavettoCornice(cx,y0,cz,w,d,ch,o){
 o=o||{};
 const h=ch==null?.36:ch,bandPal=o.bandPal||'saffron';
 svNoWalk(()=>{
  box('brass',cx,y0,cz,w+.06,h*.22,d+.06,P('gilt'));
  box('cobalt',cx,y0+h*.22+.004,cz,w+.16,h*.36-.004,d+.16,P(bandPal));
  box('ashlar',cx,y0+h*.58+.004,cz,w+.32,h*.42-.004,d+.32,P('travertine'));
 });
 return y0+h;
}

/* Babylonian polychrome glazed-brick 3-step crow-step merlon parapet capped in gilt brass or paktong. */
function klMerlonParapet(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.35)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?.28:o.t;
 const basePal=o.pal||'cobalt',bandPal=o.bandPal||'saffron',accPal=o.accPal||'emerald';
 const capMk=o.capMk||'brass',capCol=P(capMk==='paktong'?'paktong':'gilt');
 const pitch=o.pitch==null?1.08:o.pitch,nM=Math.max(1,Math.floor((L-.14)/pitch));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   box('cobalt',0,y0+.01,0,L,.24,t,P(basePal));
   box('cobalt',0,y0+.254,0,L+.04,.086,t+.04,P(bandPal));
   const yM=y0+.344;
   for(let i=0;i<nM;i++){
    const xx=nM===1?0:lerp(-L/2+.44,L/2-.44,i/(nM-1));
    if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
    box('cobalt',xx,yM,0,.72,.2,t-.03,P(basePal));
    box('cobalt',xx,yM+.204,0,.48,.18,t-.05,P(accPal));
    box(capMk,xx,yM+.388,0,.24,.16,t-.07,capCol);
   }
  });
  if(o.block)klWallBlock(0,y0,0,L,.92,t,0);
 });
}

/* Classical warm-travertine lotus-bell column on a glazed cobalt plinth with gilt capital. */
function klClassicalColumn(x,y0,z,h,o){
 o=o||{};
 const r=o.r==null?.24:o.r,shH=Math.max(.35,h-.58);
 svNoWalk(()=>{
  box('cobalt',x,y0+.01,z,r*2.45,.18,r*2.45,P(o.basePal||'cobalt'));
  cyl('ashlar',x,y0+.194,z,r*1.15,.1,P('travertine'),12);
  cyl('ashlar',x,y0+.298,z,r,shH,P('travertine'),12,r*.88,true);
  if(o.band!==false){
   cyl('paktong',x,y0+.298+shH*.5,z,r*1.04,.09,P('paktong'),12);
  }
  const yCap=y0+.302+shH;
  cyl('brass',x,yCap,z,r*.96,.055,P('gilt'),12);
  cyl('cobalt',x,yCap+.058,z,r*.94,.14,P('emerald'),12,r*1.38);
  box('ashlar',x,yCap+.202,z,r*2.6,Math.max(.07,h-(yCap-y0+.202)),r*2.6,P('travertine'));
 });
 if(o.block&&h>=1.2)klWallBlock(x,y0,z,r*2.1,h,r*2.1,0);
}

/* Linear Classical travertine & polychrome glazed entablature peristyle colonnade (block defaults to false for open galleries). */
function klPeristyle(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.4)return;
 const n=o.n==null?Math.max(2,Math.round(L/KL.BAY)+1):o.n;
 const r=o.r==null?.23:o.r,entH=o.entH==null?.44:o.entH,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<n;i++){
   const f=n===1?.5:i/(n-1),xx=(f-.5)*L;
   if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
   klClassicalColumn(xx,y0,0,colH,{r,basePal:o.basePal,block:!!o.block});
  }
  svNoWalk(()=>{
   box('ashlar',0,y0+colH+.004,0,L+r*2.65,entH*.38,r*2.4,P('travertine'));
   box('cobalt',0,y0+colH+entH*.38+.008,0,L+r*2.78,entH*.32,r*2.54,P(o.friezePal||'cobalt'));
   box('brass',0,y0+colH+entH*.70+.012,0,L+r*2.9,entH*.1,r*2.66,P('gilt'));
   box('ashlar',0,y0+colH+entH*.80+.016,0,L+r*3.06,Math.max(.06,entH*.2-.016),r*2.84,P('travertine'));
  });
 });
}

/* Travertine-and-emerald curbed Rian lotus basin with floating pads & saffron/pink lotus blooms (strictly svNoWalk). */
function klLotusBasin(cx,cz,w,d,yRim,depth,o){
 o=o||{};
 const dep=depth==null?.5:depth,curbW=.36;
 klNoCut(()=>svNoWalk(()=>{
  box('cobalt',cx,yRim-dep-.1,cz,w,.1,d,P('emerald'));
  for(const sz of [-d/2+curbW/2,d/2-curbW/2])box('ashlar',cx,yRim-dep+.004,cz+sz,w,dep+.136,curbW,P('travertine'));
  for(const sx of [-w/2+curbW/2,w/2-curbW/2])box('ashlar',cx+sx,yRim-dep+.004,cz,curbW,dep+.136,d-curbW*2-.02,P('travertine'));
  box('water',cx,yRim-.16,cz,w-curbW*2-.06,.09,d-curbW*2-.06,P('water'));
  const nL=o.lotus==null?6:o.lotus,wy=yRim-.058;
  for(let i=0;i<nL;i++){
   const a=i*2.39996,rr=.24+.58*((i+.5)/Math.max(1,nL));
   const lx=cx+Math.cos(a)*(w*.5-curbW-.5)*rr,lz=cz+Math.sin(a)*(d*.5-curbW-.5)*rr;
   cyl('foliage',lx,wy,lz,.3,.022,P('foliage'),10);
   if(i%2===0)cone('silk',lx,wy+.026,lz,.1,.12,P(i%4===0?'saffron':'lotusPink'),7);
  }
 }));
}

/* ================================================================= COMBINATOR 6: BIMETALLIC PAKTONG-GILT UKTENA SERPENT RAIL
   5-headed Lower-Ria Uktena river-serpent recast in silver-white valge-vask (paktong) bodies with gilded brass crests & amber eyes! */
function klPaktongNagaHead5(x,y,z,yaw,sc){
 const s=sc==null?1:sc;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('cobalt',0,0,0,.27*s,.22*s,P('cobalt'),10);
   ellip('paktong',0,.56*s,.04*s,.52*s,.44*s,.13*s,P('paktong'),0,12);
   for(let i=-2;i<=2;i++){
    const ang=i*.28,hx=Math.sin(ang)*.41*s,hy=(.66+(2-Math.abs(i))*.14)*s,hz=(.12+(2-Math.abs(i))*.05)*s;
    beam('paktong',[i*.08*s,.26*s,.04*s],[hx,hy,hz],.062*s,P('paktong'),true,8,.048*s);
    sph('paktong',hx,hy+.04*s,hz+.05*s,.072*s,P('nickel'),.85,8);
    sph('amber',hx,hy+.05*s,hz+.11*s,.028*s,P('amber'),1,6);
    cone('brass',hx,hy+.1*s,hz+.02*s,.042*s,.22*s,P('gilt'),6);
   }
  });
 });
}

function klPaktongNagaRail(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(run<.2)return;
 const yaw=Math.atan2(dx,dz),sc=o.scale==null?.78:o.scale;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const sx=s*(w/2+.15);
    const nSeg=6;
    for(let i=0;i<nSeg;i++){
     const f0=i/nSeg,f1=(i+1)/nSeg;
     const za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const ya=lerp(y0+.52*sc,y1+.46*sc,f0)+Math.sin(f0*PI*3)*.055*sc;
     const yb=lerp(y0+.52*sc,y1+.46*sc,f1)+Math.sin(f1*PI*3)*.055*sc;
     beam('paktong',[sx,ya,za],[sx,yb,zb],.09*sc,P('paktong'),true,8);
     cone('brass',sx,(ya+yb)*.5+.095*sc,(za+zb)*.5,.05*sc,.15*sc,P('gilt'),6);
    }
    klPaktongNagaHead5(sx,y0+.2,(-run/2)-.13,PI,sc);
   }
  });
 });
}

/* Grand travertine-and-cobalt stair flight flanked by bimetallic klPaktongNagaRail balustrades. */
function klSuudmeStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 klStair(x0,y0,z0,x1,y1,z1,w,{
  mk:o.mk||'ashlar',col:P(o.pal||'travertine'),
  sideMk:o.sideMk||'cobalt',sideCol:P(o.sidePal||'cobalt'),
  openUnder:!!o.openUnder,cheek:o.cheek
 });
 if(o.naga!==false){
  klNoCut(()=>klPaktongNagaRail(x0,y0,z0,x1,y1,z1,w,{scale:o.nagaScale==null?.74:o.nagaScale}));
 }
}

/* Stepped polychrome cobalt-saffron-travertine plinth with grand Uktena serpent stair. */
function klSuudmePlinth(w,d,h,o){
 o=o||{};
 const h1=h*.38,h2=h*.34,h3=Math.max(.06,h-h1-h2-.07);
 klBelowGrade(()=>{
  box('sootstone',0,-1.2,0,w+.72,1.18,d+.72,P('sootstone'));
 });
 klNoCut(()=>svNoWalk(()=>{
  box('cobalt',0,0,0,w+.54,h1,d+.54,P('cobalt'));
  box('cobalt',0,h1+.004,0,w+.34,h2-.004,d+.34,P('saffron'));
  box('ashlar',0,h1+h2+.004,0,w+.16,h3-.004,d+.16,P('travertine'));
  box(o.topMk||'paving',0,h-.07,0,w,.07,d,P(o.topPal||(o.topMk||'paving')));
 }));
 if(o.walk!==false)wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?3.0:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(1.25,h*2.15):o.stepRun;
  const zTop=d/2+.06,zFoot=d/2+.28+run;
  klSuudmeStair(sx,0,zFoot,sx,h,zTop,sw,{naga:o.naga!==false,nagaScale:o.nagaScale});
 }
 return h;
}

/* ================================================================= COMBINATOR 1: ISHTAR-KURA GROUND VAULT & GLAZED ROUND-ARCH PORTAL
   Babylonian polychrome lapis-saffron-emerald round-arch Ishtar portal + battered chalk-white Kuruneva kura bullion vault! */
function klIshtarPortal(cx,y0,cz,yaw,wOpen,hOpen,o){
 o=o||{};
 const bw=o.buttW==null?1.18:o.buttW,d=o.d==null?.96:o.d,hTot=o.hTot==null?Math.max(hOpen+1.15,3.72):o.hTot;
 const archR=wOpen*.5,totW=wOpen+bw*2;
 const leafMk=o.leafMk||'lacquer',leafCol=P(leafMk==='lacquer'?'crimson':leafMk);
 W(cx,y0,cz,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const bx=s*(wOpen/2+bw/2);
    box('ashlar',bx,.008,0,bw+.08,.36,d+.08,P('travertine'));
    box('cobalt',bx,.372,0,bw,Math.max(.4,hTot-.93),d,P('cobalt'));
    for(const sz of [-1,1]){
     const zf=sz*(d/2+.035);
     box('cobalt',bx,.82,zf,bw*.58,1.18,.045,P('saffron'));
     if(hTot>3.45)box('cobalt',bx,2.18,zf,bw*.58,Math.min(.92,hTot-2.82),.045,P('emerald'));
    }
   }
   const ySp0=hOpen+archR*.52;
   if(hTot-.56>ySp0+.05){
    box('cobalt',0,ySp0,0,wOpen-.03,hTot-.56-ySp0,d-.08,P('cobalt'));
   }
   for(const s of [-1,1]){
    box('cobalt',s*(archR*.68),hOpen,0,archR*.58,Math.max(.1,ySp0-hOpen-.004),d-.12,P('cobalt'));
   }
   /* Radial polychrome gilt, paktong & emerald arch voussoirs stepped +3 cm proud of buttresses */
   const nV=7;
   for(let i=0;i<nV;i++){
    const a=lerp(.2,PI-.2,i/(nV-1)),vx=Math.cos(a)*(archR*.86),vy=hOpen+Math.sin(a)*(archR*.52);
    const vMk=i%3===0?'brass':i%3===1?'paktong':'cobalt';
    const vPal=i%3===0?'gilt':i%3===1?'paktong':'emerald';
    box(vMk,vx,vy-.1,0,.22,.22,d+.06,P(vPal));
   }
   /* Full-width saffron glazed rosette frieze + travertine cavetto cap */
   box('cobalt',0,hTot-.552,0,totW+.06,.21,d+.06,P('saffron'));
   box('ashlar',0,hTot-.338,0,totW+.14,.338,d+.14,P('travertine'));
  });
  klMerlonParapet(-totW/2+.1,d/2-.16,totW/2-.1,d/2-.16,hTot,{pal:'cobalt',bandPal:'saffron',accPal:'emerald',pitch:.98});
  if(o.open!==true){
   svLeaf(0,.02,-.18,0,wOpen-.06,hOpen-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'double',hwCol:0xd8dee4,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'ishtar-door'
   });
  }
  door(0,0,d/2,0,wOpen,hOpen);
  if(o.walkPad!==false)wkPad(0,0,wOpen+.32,d+1.45,0);
  if(o.block!==false){
   for(const s of [-1,1])klWallBlock(s*(wOpen/2+bw/2),0,0,bw,hTot,d,0);
  }
 });
 return totW;
}

function klIshtarKuraVault(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t,pw=t+.08,hp=pw/2+.015,H=o.holes||{};
 const px=o.portalX==null?(x0+x1)/2:o.portalX;
 const pW=o.portalW==null?2.05:o.portalW,pH=o.portalH==null?2.45:o.portalH,buttW=o.buttW==null?1.12:o.buttW;
 const hasPortal=o.portal!==false;
 const totPW=pW+buttW*2;
 const cornH=o.cornice===false?0:.28,wallH=h-cornH-.008;

 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.5,wallH*.22);
   box('sootstone',cx,y0,cz,pw+.05,sh,pw+.05,P('sootstone'));
   box('ashlar',cx,y0+sh+.004,cz,pw,wallH-sh-.004,pw,P('travertine'));
  }
 });
 if(o.block!==false&&h>=.82){
  for(const cx of [x0,x1])for(const cz of [z0,z1])klWallBlock(cx,y0,cz,pw,h,pw,0);
 }

 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 const baseOpts={style:'suudme',register:'kura',dadoMk:o.dadoMk||'cobalt',t};

 /* South (+z) face: split cleanly left & right of the polychrome Ishtar portal (projected outward at z1 + 0.34)! */
 if((o.skip||'').indexOf('s')<0){
  if(hasPortal){
   const sLeft=px-totPW/2-.03,sRight=px+totPW/2+.03;
   if(sLeft-(x0+hp)>.35){
    const hl=(H.s||[]).filter(q=>q.at<sLeft-.2);
    klWall(x0+hp,z1,sLeft,z1,y0,wallH,Object.assign({},baseOpts,{holes:shiftPos(hl,x0+hp)}));
   }
   if((x1-hp)-sRight>.35){
    const hr=(H.s||[]).filter(q=>q.at>sRight+.2);
    klWall(sRight,z1,x1-hp,z1,y0,wallH,Object.assign({},baseOpts,{holes:shiftPos(hr,sRight)}));
   }
   klIshtarPortal(px,y0,z1+.34,0,pW,pH,{
    buttW,d:o.portalD==null?.96:o.portalD,hTot:h-.02,
    leafMk:o.leafMk||'lacquer',open:!!o.portalOpen,name:o.portalName||(CURKEY+'-ishtar-door')
   });
  }else{
   klWall(x0+hp,z1,x1-hp,z1,y0,wallH,Object.assign({},baseOpts,{holes:shiftPos(H.s,x0+hp)}));
  }
 }
 if((o.skip||'').indexOf('n')<0)klWall(x1-hp,z0,x0+hp,z0,y0,wallH,Object.assign({},baseOpts,{holes:shiftRev(H.n,x1-hp)}));
 if((o.skip||'').indexOf('e')<0)klWall(x1,z1-hp,x1,z0+hp,y0,wallH,Object.assign({},baseOpts,{holes:shiftRev(H.e,z1-hp)}));
 if((o.skip||'').indexOf('w')<0)klWall(x0,z0+hp,x0,z1-hp,y0,wallH,Object.assign({},baseOpts,{holes:shiftPos(H.w,z0+hp)}));

 if(o.cornice!==false){
  klCavettoCornice((x0+x1)/2,y0+wallH+.004,(z0+z1)/2,x1-x0+pw+.08,z1-z0+pw+.08,cornH-.004,{bandPal:'saffron'});
 }
 if(o.udatsu==='ew'){
  const uw=o.udatsuD==null?1.35:o.udatsuD,uh=o.udatsuH==null?h+.45:o.udatsuH;
  klUdatsuWall(x0-pw/2-.22,y0,z1-.75,0,uw,uh,{capMk:'cobalt'});
  klUdatsuWall(x1+pw/2+.22,y0,z1-.75,0,uw,uh,{capMk:'cobalt'});
 }else if(o.udatsu==='all'){
  const uw=o.udatsuD==null?1.28:o.udatsuD,uh=o.udatsuH==null?h+.42:o.udatsuH;
  for(const sx of [x0-pw/2-.22,x1+pw/2+.22]){
   klUdatsuWall(sx,y0,z1-.72,0,uw,uh,{capMk:'cobalt'});
   klUdatsuWall(sx,y0,z0+.72,PI,uw,uh,{capMk:'cobalt'});
  }
 }
 klRoom(x0,z0,x1,z1,y0,h,o);
}

/* ================================================================= COMBINATOR 2: CLASSICAL TRAVERTINE ARCADE + KIYOMIZU TIDAL QUAY
   Rusticated warm travertine round-arch piers + polychrome glazed spandrels + interlocking dark-cedar Kiyomizu tidal stages! */
function klRoundArcade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.6)return;
 const nBays=o.bays==null?Math.max(2,Math.round(L/3.4)):o.bays;
 const t=o.t==null?.44:o.t,pierW=o.pierW==null?.52:o.pierW,yaw=Math.atan2(z0-z1,x1-x0);
 const bayW=L/nBays,springY=y0+h*.6,archR=Math.max(.32,(bayW-pierW)*.5);
 const spPal=o.spandrelPal||'cobalt';
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<=nBays;i++){
   const px=-L/2+i*bayW;
   svNoWalk(()=>{
    box('cobalt',px,y0+.008,0,pierW+.08,.33,t+.08,P('cobalt'));
    box('ashlar',px,y0+.342,0,pierW,Math.max(.25,springY-y0-.486),t,P('travertine'));
    box('brass',px,springY-.14,0,pierW+.1,.136,t+.1,P('gilt'));
   });
   if(o.pierBlock&&h>=1.2)klWallBlock(px,y0,0,pierW,h*.85,t,0);
  }
  svNoWalk(()=>{
   const topY=y0+h-.25,crownY=Math.min(topY-.1,springY+archR*.74);
   box('cobalt',0,crownY,0,L+pierW-.04,Math.max(.08,topY-.004-crownY),t-.06,P(spPal));
   for(let b=0;b<nBays;b++){
    const cx=-L/2+(b+.5)*bayW;
    for(const s of [-1,1]){
     box('ashlar',cx+s*(archR*.66),springY,0,archR*.62,Math.max(.08,crownY-.004-springY),t-.08,P('travertine'));
    }
    box('brass',cx,crownY-.13,0,.24,.26,t+.08,P('gilt'));
   }
   box('cobalt',0,topY,0,L+pierW+.14,.1,t+.12,P('saffron'));
   box('ashlar',0,topY+.104,0,L+pierW+.26,Math.max(.08,y0+h-topY-.104),t+.22,P('travertine'));
  });
 });
}

function klArcadeKiyomizu(cx,cz,wArcade,dArcade,yBed,yDeck,o){
 o=o||{};
 const bDir=o.dir||'e';
 klFloorSlab(cx,yDeck,cz,wArcade,dArcade,{mk:'paving',col:P('travertine'),th:.22});
 if(yDeck-yBed>.65){
  if(bDir==='e'||bDir==='w'){
   const ax=cx+(bDir==='e'?wArcade/2-.24:-wArcade/2+.24);
   klRoundArcade(ax,cz+dArcade/2-.3,ax,cz-dArcade/2+.3,yBed,yDeck-yBed-.22,{
    bays:o.bays==null?Math.max(2,Math.round(dArcade/3.5)):o.bays,spandrelPal:'cobalt'
   });
  }else{
   const az=cz+(bDir==='s'?dArcade/2-.24:-dArcade/2+.24);
   klRoundArcade(cx-wArcade/2+.3,az,cx+wArcade/2-.3,az,yBed,yDeck-yBed-.22,{
    bays:o.bays==null?Math.max(2,Math.round(wArcade/3.5)):o.bays,spandrelPal:'cobalt'
   });
  }
 }
 /* Projecting dark-cedar Kiyomizu tidal trestle apron stepping out from the Classical travertine arcade! */
 const tw=o.trestleW==null?(bDir==='e'||bDir==='w'?3.8:wArcade*.82):o.trestleW;
 const td=o.trestleD==null?(bDir==='e'||bDir==='w'?dArcade*.82:3.6):o.trestleD;
 const tx=bDir==='e'?cx+wArcade/2+tw/2+.04:bDir==='w'?cx-wArcade/2-tw/2-.04:cx;
 const tz=bDir==='s'?cz+dArcade/2+td/2+.04:bDir==='n'?cz-dArcade/2-td/2-.04:cz;
 const yTrestle=o.yTrestle==null?yDeck:o.yTrestle;
 klKiyomizuTrestle(tx,tz,tw,td,yBed,yTrestle,{rails:o.rails||'',gapS:o.gapS,gapN:o.gapN,gapE:o.gapE,gapW:o.gapW});
 if(Math.abs(yDeck-yTrestle)>.12){
  if(bDir==='e')klStair(cx+wArcade/2+1.2,yTrestle,tz,cx+wArcade/2-.1,yDeck,tz,1.8,{mk:'darkcedar',cheek:'timber',openUnder:true});
  else if(bDir==='s')klStair(tx,yTrestle,cz+dArcade/2+1.2,tx,yDeck,cz+dArcade/2-.1,1.8,{mk:'darkcedar',cheek:'timber',openUnder:true});
 }
 return {tx,tz,tw,td,yTrestle};
}

/* ================================================================= COMBINATOR 3: RUAN-THAI TEAK & SANJHYA COUNTING GALLERY
   Subtropical Ruan-Thai dark-teak walls & verandas + polychrome glazed spandrel friezes + overhanging klSanjhyaOriel windows! */
function klTeakSanjhyaGallery(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t,pw=t+.08;
 klWallRing(x0,z0,x1,z1,y0,h,{
  style:'suudme',register:'brick',
  mk:o.mk||'darkcedar',col:P(o.pal||'teak'),
  socMk:o.socMk||'lacquer',dadoMk:o.dadoMk||'cobalt',postMk:'darkcedar',
  plate:false,t,skip:o.skip||'',holes:o.holes||{}
 });
 /* Upper polychrome saffron/emerald glazed frieze stepped +8 cm clear outside corner posts & well above window hoods! */
 if(o.frieze!==false&&h>=3.05){
  const fw=(x1-x0)+pw+.16,fd=(z1-z0)+pw+.16,fy=y0+h-.32;
  svNoWalk(()=>{
   box('brass',(x0+x1)/2,fy,(z0+z1)/2,fw,.055,fd,P('gilt'));
   box('cobalt',(x0+x1)/2,fy+.059,(z0+z1)/2,fw+.04,.16,fd+.04,P(o.friezePal||'saffron'));
   box('darkcedar',(x0+x1)/2,fy+.223,(z0+z1)/2,fw+.08,.095,fd+.08,P('teak'));
  });
 }
}

/* ================================================================= COMBINATOR 4: GLAZED PAKTONG-HOOPED PYLON & PYATTHAT SKYWALK
   Inward-battered polygonal travertine, cobalt-glaze & dark-teak drum pylon cinched in silver paktong & gilt-brass hoops! */
function klHoopedGlazePylon(cx,cz,rBot,rTop,y0,h,o){
 o=o||{};
 const plH=o.plinthH==null?0:o.plinthH;
 const yF0=y0+plH,hFr=Math.max(1.8,h-plH),yTop=y0+h;
 const nHoops=o.hoops==null?5:o.hoops,seg=o.seg==null?14:o.seg;
 const hollow=o.hollow!==false;

 if(plH>.15){
  svNoWalk(()=>{
   cyl('cobalt',cx,y0+.006,cz,rBot+.48,Math.min(.4,plH*.34),P('cobalt'),seg,rBot+.42);
   cyl('ashlar',cx,y0+Math.min(.4,plH*.34)+.004,cz,rBot+.36,Math.max(.12,plH-Math.min(.4,plH*.34)-.108),P('travertine'),seg,rBot+.14,true);
   cyl('brass',cx,yF0-.1,cz,rBot+.2,.1,P('gilt'),seg);
  });
 }

 if(!hollow){
  svNoWalk(()=>{
   const nC=4;
   for(let c=0;c<nC;c++){
    const f0=c/nC,f1=(c+1)/nC;
    const ya=yF0+hFr*f0,yb=yF0+(hFr-.22)*f1-.004;
    const rA=lerp(rBot,rTop,f0),rB=lerp(rBot,rTop,f1);
    const cMk=c%2===0?'ashlar':'cobalt',cPal=c%2===0?'travertine':(c===1?'cobalt':'emerald');
    cyl(cMk,cx,ya,cz,rA,Math.max(.1,yb-ya),P(cPal),seg,rB,true);
   }
   for(let i=0;i<nHoops;i++){
    const f=(i+.62)/(nHoops+.28),yh=yF0+(hFr-.22)*f,rr=lerp(rBot,rTop,f)+.065;
    const hMk=i%2===0?'paktong':'brass',hPal=i%2===0?'paktong':'gilt';
    cyl(hMk,cx,yh-.065,cz,rr,.13,P(hPal),seg);
   }
   cyl('cobalt',cx,yTop-.22,cz,rTop+.08,.11,P('saffron'),seg);
   cyl('ashlar',cx,yTop-.106,cz,rTop+.16,.106,P('travertine'),seg);
   cyl('paktong',cx,yTop+.004,cz,rTop*.92,.06,P('paktong'),seg);
  });
  if(o.block!==false&&h>=1.2)klWallBlock(cx,y0,cz,rBot*1.85,h*.85,rBot*1.85,0);
  return yTop+.065;
 }

 /* Inhabited walkable polygonal travertine-and-cobalt pylon cinched in paktong & gilt-brass hoops! */
 const wallT=.36;
 const list=(o.opens||[]).map(q=>{
  const yf=clamp((q.y==null?0:q.y)/hFr,0,.85);
  const rm=lerp(rBot,rTop,yf)-wallT*.5;
  const da=Math.min(.55,Math.max(.1,(q.w==null?1.4:q.w)/(2*Math.max(.9,rm))));
  const am=(((q.a==null?PI/2:q.a)%TAU)+TAU)%TAU;
  return Object.assign({},q,{am,da,a0:am-da,a1:am+da,wActual:2*da*rm});
 });
 const intervals=[];
 for(const q of list){
  if(q.a0<0)intervals.push({a0:0,a1:q.a1,q},{a0:q.a0+TAU,a1:TAU,q});
  else if(q.a1>TAU)intervals.push({a0:q.a0,a1:TAU,q},{a0:0,a1:q.a1-TAU,q});
  else intervals.push({a0:q.a0,a1:q.a1,q});
 }
 intervals.sort((a,b)=>a.a0-b.a0);
 const angDist=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));

 const nCourses=Math.max(4,nHoops);
 svNoWalk(()=>{
  for(let c=0;c<nCourses;c++){
   const f0=c/nCourses,f1=(c+1)/nCourses;
   const ya=yF0+hFr*f0+.006,yb=yF0+hFr*f1-(c===nCourses-1?.18:.006);
   const rOutM=lerp(rBot,rTop,(f0+f1)*.5),rInM=Math.max(.68,rOutM-wallT);
   const cMk=c%3===0?'ashlar':c%3===1?'cobalt':'darkcedar';
   const cPal=c%3===0?'travertine':c%3===1?'cobalt':'teak';
   const segArc=(aa,ab,yA,yB)=>{
    if(ab-aa>.012&&yB-yA>.025){
     sector(cMk,cx,cz,rInM,rOutM,aa,ab,yA,yB,P(cPal),Math.max(2,Math.ceil((ab-aa)/(PI/10))));
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

  /* Alternating silver-white paktong & gilded brass tension hoops stepped +8.5 cm clear of outer pylon courses */
  for(let i=0;i<nHoops;i++){
   const f=(i+.62)/(nHoops+.25),yh=yF0+hFr*f;
   const hitOpen=list.find(q=>{
    const qy0=yF0+(q.y==null?0:q.y),qy1=qy0+(q.h==null?KL.DOOR_H:q.h);
    return yh>=qy0-.12&&yh<=qy1+.12;
   });
   const rr=lerp(rBot,rTop,f)+.085;
   const hMk=i%2===0?'paktong':'brass',hPal=i%2===0?'paktong':'gilt';
   if(hitOpen){
    sector(hMk,cx,cz,rr-.06,rr+.02,hitOpen.am+hitOpen.da+.05,hitOpen.am-hitOpen.da+TAU-.05,yh-.065,yh+.065,P(hPal),16);
   }else{
    cyl(hMk,cx,yh-.065,cz,rr,.13,P(hPal),seg);
   }
  }

  /* Flaring Rian cavetto & paktong crown cap + solid {inward: true} interior vault cone -> 0 sky leaks! */
  cyl('cobalt',cx,yTop-.17,cz,rTop+.08,.08,P('saffron'),seg);
  cyl('ashlar',cx,yTop-.086,cz,rTop+.16,.086,P('travertine'),seg);
  cyl('paktong',cx,yTop+.004,cz,rTop+.2,.065,P('paktong'),seg);
  lathe('ashlar',cx,cz,[
   [Math.max(.35,rTop-wallT-.04),yTop-.19],
   [Math.max(.18,(rTop-wallT)*.5),yTop-.09],
   [.01,yTop-.04]
  ],12,P('travertine'),{inward:true});
 });

 if(o.floor!==false){
  klFloorDisc(cx,cz,Math.max(.8,rBot-wallT-.04),yF0,'paving',P('travertine'),{seg:16,th:.14});
 }
 if(o.midY!=null){
  const fm=clamp((o.midY-yF0)/hFr,0,.85);
  const rMidIn=Math.max(.8,lerp(rBot,rTop,fm)-wallT-.05);
  klFloorDisc(cx,cz,rMidIn,o.midY,'floor',P('floor'),{seg:16,th:.14});
 }

 for(const q of list){
  const qy=q.y==null?(q.door?0:1.1):q.y,qh=q.h==null?(q.door?KL.DOOR_H:1.25):q.h;
  const yf=clamp(qy/hFr,0,.85),rm=lerp(rBot,rTop,yf)-wallT*.5;
  const yaw=Math.atan2(Math.cos(q.am),Math.sin(q.am));
  const mx=cx+Math.cos(q.am)*rm,mz=cz+Math.sin(q.am)*rm;
  if(q.door){
   klToranaDoor(mx,yF0+qy,mz,yaw,q.wActual,qh,Object.assign({t:wallT,torana:false,register:'kura',leafMk:'lacquer'},q));
  }else{
   klFireShutterWindow(mx,yF0+qy,mz,yaw,q.wActual,qh,Object.assign({t:wallT},q));
  }
 }

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
 if(o.bell){
  const rCup=o.bellR==null?rTop*.92:o.bellR,hCup=o.bellH==null?Math.max(3.1,rCup*1.9):o.bellH;
  return klBellCupola(cx,yTop+.07,cz,rCup,hCup,{style:'suudme',roofMk:o.bellMk||'celadon',postMk:'paktong'});
 }
 return yTop+.07;
}

/* Pyatthat-roofed elevated sky-bridge with paktong handrails and upturned gilded chofa eave-horns! */
function klPyatthatSkywalk(x0,z0,x1,z1,yDeck,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.3)return;
 const bw=w==null?2.0:w,yaw=Math.atan2(dx,dz),hCan=o.h==null?2.75:o.h;
 klSkywalk(x0,z0,x1,z1,yDeck,bw,o);
 klNoCut(()=>{
  W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
   svNoWalk(()=>{
    for(const sx of [-bw/2+.14,bw/2-.14])for(const sz of [-L*.32,L*.32]){
     box('darkcedar',sx,yDeck+.84,sz,.11,hCan-.84,.11,P('teak'));
    }
   });
   klBellMondop(0,yDeck+hCan,0,bw+.18,Math.max(1.8,L-.35),2,{
    mk:o.roofMk||'celadon',bell:false,over:.42,tierRise:.62,neckH:.26,chofaScale:.42
   });
  });
 });
}

/* ================================================================= COMBINATOR 5: BELL-MONDOP CROWN (OWNER-CONFIRMED SIGNATURE!)
   Sweeping 2-to-5-tier glazed Rian Pyatthat / Mondop telescopic eaves (celadon, cobalt, terracotta or gilt brass) with upturned
   gilded chofa horns & 100% solid interior soffits, opening at the apex into an octagonal cast-bronze Kellakoda bell-lantern! */
function klBellMondop(cx,y0,cz,w,d,tiers,o){
 o=o||{};
 const nT=Math.max(1,tiers==null?3:tiers),mode=o.mode||'hip';
 const mk=o.mk||'celadon',col=o.col==null?P(o.pal||(mk==='brass'?'gilt':mk)):o.col;
 const trimMk=o.trimMk||'brass',trimCol=P(trimMk==='paktong'?'paktong':'gilt');
 const soffitMk='darkcedar',soffitCol=P('teak');
 const neckMk=o.neckMk||'lacquer',neckCol=P(neckMk==='lacquer'?'crimson':neckMk);
 const over=o.over==null?.78:o.over,stepIn=o.stepIn==null?.75:o.stepIn;
 const tierRise=o.tierRise==null?Math.max(.88,Math.min(w,d)*.145):o.tierRise;
 const neckH=o.neckH==null?.44:o.neckH;
 const hasBell=o.bell!==false,chofaSc=o.chofaScale==null?.56:o.chofaScale;

 if(o.ceiling!==false){
  klCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.12),Math.max(.4,d-.12),{
   mk:soffitMk,col:soffitCol,trimMk:'brass',trimCol:P('gilt')
  });
 }

 let curY=y0+.12,curW=w+over*2,curD=d+over*2;
 W(cx,0,cz,o.yaw==null?0:o.yaw,()=>{
  svNoWalk(()=>{
   for(let t=0;t<nT;t++){
    const hw=curW/2,hd=curD/2,rH=tierRise*(t===nT-1?1.12:1);
    const bodyHW=Math.max(.6,hw-over*.85),bodyHD=Math.max(.6,hd-over*.85);

    /* Solid horizontal underside soffit slab for EVERY telescopic tier -> 0 sky leaks! */
    box(soffitMk,0,curY,0,curW-.06,.09,curD-.06,soffitCol);
    for(const sz of [-hd,hd])box(trimMk,0,curY+.018,sz,curW+.04,.086,.065,trimCol);
    for(const sx of [-hw+.04,hw-.04])box(trimMk,sx,curY+.018,0,.065,.086,curD-.15,trimCol);

    /* Ruan-Thai carved dark-teak eave bracket struts under lowest tier */
    if(t===0&&over>=.48){
     const nSX=Math.max(2,Math.round(curW/2.8)),nSZ=Math.max(2,Math.round(curD/2.8));
     for(let i=0;i<=nSX;i++){
      const sx=lerp(-bodyHW+.2,bodyHW-.2,i/nSX);
      for(const s of [-1,1])beam('carvedwood',[sx,curY-.5,s*bodyHD],[sx,curY-.01,s*(hd-.14)],.062,P('teak'));
     }
     for(let j=1;j<nSZ;j++){
      const sz=lerp(-bodyHD+.2,bodyHD-.2,j/nSZ);
      for(const s of [-1,1])beam('carvedwood',[s*bodyHW,curY-.5,sz],[s*(hw-.14),curY-.01,sz],.062,P('teak'));
     }
    }

    /* Upturned gilded Rian chofa eave-horns at all four corners of every tier! */
    for(const sx of [-1,1])for(const sz of [-1,1]){
     klChofaHorn(sx*(hw-.03),curY+.09,sz*(hd-.03),Math.atan2(sx,sz),chofaSc*(1-t*.08));
    }

    const yB=curY+.09,yT=yB+rH;
    const alongX=o.gableAxis!=='z'&&(o.gableAxis==='x'||curW>=curD);

    if(mode==='gable'&&t===nT-1&&!hasBell){
     if(alongX){
      const PW=[-hw+.05,yT,0],PE=[hw-.05,yT,0];
      poly(mk,[[-hw,yB,hd],[hw,yB,hd],PE,PW],col);
      poly(mk,[[hw,yB,-hd],[-hw,yB,-hd],PW,PE],col);
      /* Recessed gilt-carved Ruan-Thai gable tympanums (inset 9 cm -> 0 z-fight!) */
      poly('carve',[[hw-.09,yB,hd-.14],[hw-.09,yB,-hd+.14],[hw-.09,yT-.06,0]],P('gilt'));
      poly('carve',[[-hw+.09,yB,-hd+.14],[-hw+.09,yB,hd-.14],[-hw+.09,yT-.06,0]],P('gilt'));
      box(trimMk,0,yT,0,curW-.1,.1,.16,trimCol);
      for(const sx of [-1,1]){
       const xx=sx*(hw+.02);
       beam(trimMk,[xx,yB+.03,-hd],[xx,yT+.06,0],.08,trimCol,false);
       beam(trimMk,[xx,yB+.03,hd],[xx,yT+.06,0],.08,trimCol,false);
       klChofaHorn(xx,yT+.08,0,sx>0?PI/2:-PI/2,chofaSc*1.45);
      }
     }else{
      const PN=[0,yT,-hd+.05],PS=[0,yT,hd-.05];
      poly(mk,[[-hw,yB,-hd],[-hw,yB,hd],PS,PN],col);
      poly(mk,[[hw,yB,hd],[hw,yB,-hd],PN,PS],col);
      poly('carve',[[-hw+.14,yB,hd-.09],[hw-.14,yB,hd-.09],[0,yT-.06,hd-.09]],P('gilt'));
      poly('carve',[[hw-.14,yB,-hd+.09],[-hw+.14,yB,-hd+.09],[0,yT-.06,-hd+.09]],P('gilt'));
      box(trimMk,0,yT,0,.16,.1,curD-.1,trimCol);
      for(const sz of [-1,1]){
       const zz=sz*(hd+.02);
       beam(trimMk,[-hw,yB+.03,zz],[0,yT+.06,zz],.08,trimCol,false);
       beam(trimMk,[hw,yB+.03,zz],[0,yT+.06,zz],.08,trimCol,false);
       klChofaHorn(0,yT+.08,zz,sz>0?0:PI,chofaSc*1.45);
      }
     }
    }else{
     /* 4-way hipped Pyatthat / Mondop tier closing to next clerestory collar or open Kellakoda bell-collar! */
     let tw,td;
     if(t===nT-1){
      if(hasBell){
       const rCap=Math.max(.95,Math.min(hw,hd)*.4);
       tw=rCap;td=rCap;
      }else if(curW>=curD){
       tw=Math.max(.32,hw-hd*.72);td=.14;
      }else{
       tw=.14;td=Math.max(.32,hd-hw*.72);
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
     if(t===nT-1&&!hasBell){
      box(trimMk,0,yT,0,tw*2+.12,.11,td*2+.12,trimCol);
      box('paktong',0,yT+.114,0,.28,.16,.28,P('paktong'));
     }
    }

    if(t<nT-1){
     const nextW=curW*stepIn,nextD=curD*stepIn;
     const nY0=yT-.18,nH=neckH+.18;
     box(neckMk,0,nY0,0,nextW-.28,nH-.084,nextD-.28,neckCol);
     box(trimMk,0,nY0+nH-.08,0,nextW-.18,.08,nextD-.18,trimCol);
     curY=nY0+nH;
     curW=nextW;curD=nextD;
    }else{
     curY=yT;
    }
   }

   /* Summit Mondop Collar opening into the octagonal cast-bronze & paktong Kellakoda Syndicate Bell-Lantern! */
   if(hasBell){
    const rCup=o.cupolaR==null?Math.max(1.55,Math.min(w,d)*.22):o.cupolaR;
    const hCup=o.cupolaH==null?Math.max(3.3,rCup*1.92):o.cupolaH;
    const colW=rCup*1.62;
    box(neckMk,0,curY-.04,0,colW,.22,colW,neckCol);
    box(trimMk,0,curY+.184,0,colW+.12,.08,colW+.12,trimCol);
    for(const sx of [-1,1])for(const sz of [-1,1]){
     klChofaHorn(sx*(colW*.5+.04),curY+.24,sz*(colW*.5+.04),Math.atan2(sx,sz),chofaSc*.78);
    }
    curY=klBellCupola(0,curY+.268,0,rCup,hCup,{
     style:'suudme',
     roofMk:o.cupolaMk||(mk==='celadon'?'brass':'celadon'),
     postMk:'paktong'
    });
   }
  });
 });
 return curY+.26;
}

/* Syncretic Glazed Celadon & Cobalt Porcelain Prang banded in silver-white paktong with {inward: true} sanctuary vault! */
function klPorcelainPrang(cx,y0,cz,wBase,hPrang,o){
 o=o||{};
 const seg=o.seg==null?16:o.seg,r0=wBase*.48;
 svNoWalk(()=>{
  if(o.vault!==false){
   lathe('ashlar',cx,cz,[
    [Math.max(.24,r0-.18),y0+.04],
    [Math.max(.14,r0*.52),y0+hPrang*.38],
    [.01,y0+hPrang*.56]
   ],12,P('travertine'),{inward:true});
  }
  const baseH=hPrang*.24;
  box('ashlar',cx,y0,cz,wBase,baseH*.52,wBase,P('travertine'));
  box('cobalt',cx,y0+baseH*.52+.004,cz,wBase*.9,baseH*.22-.004,wBase*.9,P('cobalt'));
  box('celadon',cx,y0+baseH*.74+.004,cz,wBase*.84,baseH*.26-.004,wBase*.84,P('celadon'));
  for(let k=0;k<4;k++){
   const a=k*PI/2,nx=cx+Math.sin(a)*(wBase*.44+.05),nz=cz+Math.cos(a)*(wBase*.44+.05);
   W(nx,y0+baseH*.12,nz,a,()=>{
    box('brass',0,0,0,wBase*.26,baseH*.58,.11,P('gilt'));
    cone('paktong',0,baseH*.584,0,wBase*.15,baseH*.24,P('paktong'),6);
   });
  }
  const yC=y0+baseH+.004,cH=hPrang*.6,steps=7,prof=[[r0*.86,yC]];
  for(let i=1;i<=steps;i++){
   const t=i/steps,bell=Math.pow(1-t,.62);
   const rOuter=Math.max(.18,r0*.84*bell+.06);
   prof.push([rOuter,yC+cH*(t-.06/steps)]);
   prof.push([rOuter*.9,yC+cH*t]);
  }
  lathe('celadon',cx,cz,prof,seg,P('celadon'),{uv:'cone'});
  for(let i=1;i<steps;i+=2){
   const t=i/steps,bell=Math.pow(1-t,.62),rr=Math.max(.2,r0*.84*bell+.088);
   ring(i===3?'paktong':'cobalt',cx,yC+cH*t,cz,rr,.035,P(i===3?'paktong':'saffron'),0,0,0,seg);
  }
  /* Syncretic lotus-drum & paktong-ring covenant finial */
  const yTop=yC+cH;
  sph('brass',cx,yTop+.12,cz,.3,P('gilt'),.65,12);
  cyl('paktong',cx,yTop+.28,cz,.22,.22,P('paktong'),10,.14);
  for(const f of [.35,.68]){
   ring('brass',cx,yTop+.3+hPrang*.12*f,cz,lerp(.24,.14,f),.025,P('gilt'),0,0,0,10);
  }
  cyl('bronze',cx,yTop+.5,cz,.14,hPrang*.1,P('bronze'),10,.08);
 });
 return y0+hPrang;
}
