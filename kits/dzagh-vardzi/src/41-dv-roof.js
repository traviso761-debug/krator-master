// prefix: dv
// ================================================================= DZAGH-VARDZI NEEDLE-TOWERS, SLATE-BASALT PYRAMIDS & 12-PLEAT GUMBAT SPIRES
// DV4: Razor-slender 5:1 battered defense needle-towers (Ingush vovnashki / Svan koshki) built from closed outward-wound
//      ablaq frustum stages and crowned with crimson/apricot corbelled tuff cornices, stepped dark mountain-slate & charcoal-basalt
//      pyramidal roofs, mashikul boxes, and patinated verdigris copper + golden-skarn + emerald-nephrite finials.
// DV2: 12-pleat star-fluted conical Akhtamar umbrella spires (gumbat) with 24 crisp flat pleat facets & downward soffit.

let dvSlateCrownCount=0;
function dvSlateCrownReset(){dvSlateCrownCount=0;}
function dvSlateCrowns(){return dvSlateCrownCount;}

/* ---------------------------------------------------------------- 1. Stepped Dark Mountain-Slate, Basalt & Crimson-Tuff Pyramid (DV4) */
function dvSlatePyramid(cx,cz,wBase,yBase,rise,steps){
 const n=steps==null?6:steps,rh=rise==null?wBase*1.08:rise,dy=rh/n;
 const slCol=P('slate'),cbCol=P('colBasalt'),bsCol=P('basalt'),tfCol=P('tuff'),crCol=P('tuffCrimson');
 const vdCol=P('verdigris'),skCol=P('skarn'),jdCol=P('jadeBright');
 if(GTARGET===GB)dvSlateCrownCount++;
 svNoWalk(()=>{
  /* corbelled apricot & crimson tuff cornice crown + projecting charcoal-basalt drip eave (>= 6 mm vertical step per course) */
  box('tuffPolished',cx,yBase+.005,cz,wBase+.1,.052,wBase+.1,tfCol);
  box('tuffPolished',cx,yBase+.063,cz,wBase+.18,.056,wBase+.18,crCol);
  box('basalt',cx,yBase+.125,cz,wBase+.25,.054,wBase+.25,bsCol);
  const y0p=yBase+.185;
  for(let i=0;i<n;i++){
   const t0=i/n,w=lerp(wBase+.12,.36,t0),ya=y0p+dy*i+.004,yb=y0p+dy*(i+1)-.002;
   const isCr=(i===1),isBas=(i%2===1&&!isCr);
   const mk=isCr?'tuffPolished':isBas?'colBasalt':'slate';
   const col=isCr?crCol:isBas?cbCol:slCol;
   box(mk,cx,ya,cz,w,Math.max(.055,yb-ya),w,col);
  }
  const yPeak=y0p+rh;
  cyl('skarn',cx,yPeak+.006,cz,.19,.068,skCol,8);
  cone('verdigris',cx,yPeak+.08,cz,.22,.42,vdCol,4);
  sph('jade',cx,yPeak+.578,cz,.07,jdCol,1,8);
  cone('verdigris',cx,yPeak+.656,cz,.044,.2,vdCol,6);
 });
 return yBase+.185+rh+.856;
}

/* ---------------------------------------------------------------- 2. Razor-Slender 5:1 Battered Defense Needle-Tower (DV4)
   Built from closed flat-normal `dvFrustum4` ablaq blocks (outward normals guaranteed on all 4 faces + solid caps). */
function dvNeedleTower(cx,cz,wBase,y0,hShaft,o){
 o=o||{};const wb=wBase==null?2.6:wBase,wtTop=wb*(o.taper==null?.74:o.taper),hs=hShaft==null?11.2:hShaft;
 const tuffCol=P('tuff'),basCol=P('basalt');
 if(o.skirt!==false&&y0<=.65){
  dvRootSkirt(cx,cz,wb,wb,o.rootD==null?5.6:o.rootD,{mk:'colBasalt',plinthH:Math.max(.28,y0+.18)});
 }
 if(o.walkFloor!==false){
  dvFloorRect(cx,cz,wb-.56,wb-.56,y0+.14,'flagstone',P('flagstone'));
 }
 const baseClear=o.doorYaw!=null?2.28:0;
 if(o.doorYaw!=null){
  const wallT=.34;
  W(cx,0,cz,o.doorYaw,()=>{
   dvAblaqBox(0,0,wb,wb,y0+.14,2.14,{wt:wallT,frieze:false,tuffCol,basCol,
    front:[{x:0,w:.88,h:1.86,door:true,arch:false}]});
  });
 }
 const nBands=Math.max(5,Math.round((hs-baseClear)/1.35));
 const yStart=y0+.14+baseClear,remH=hs-baseClear;
 let peakY=0;
 dvNoCut(()=>{
  svNoWalk(()=>{
   for(let i=0;i<nBands;i++){
    const u0=i/nBands,u1=(i+1)/nBands;
    const ya=yStart+remH*u0+.004,yb=yStart+remH*u1-.004;
    const wa=lerp(wb*(baseClear?0.97:1),wtTop,u0),wb2=lerp(wb*(baseClear?0.97:1),wtTop,u1);
    const mk=(i%3===1)?'basalt':'tuff',col=(i%3===1)?basCol:tuffCol;
    dvFrustum4(mk,cx,cz,wa,wa,wb2,wb2,ya,yb,col,{caps:true,kind:'tower'});
   }
  });
  const yMid=y0+.14+hs*.56,wMid=lerp(wb,wtTop,.56);
  windowAt(cx,yMid,cz+wMid/2+.01,0,.32,.92,hs*.56);
  svPane(cx,yMid+.02,cz+wMid/2+.018,0,.28,.88,{kind:'lit',t:.02});
  dvJadeCross(cx,y0+.14+hs*.74,cz+lerp(wb,wtTop,.74)/2+.012,0,.62);

  if(o.mashikul!==false){
   const ym=y0+.14+hs-.92,wm=lerp(wb,wtTop,(hs-.92)/hs)/2+.01;
   dvMashikul(cx,ym,cz+wm,0,wtTop*.46);
   dvMashikul(cx,ym,cz-wm,PI,wtTop*.46);
   dvMashikul(cx+wm,ym,cz,PI/2,wtTop*.46);
   dvMashikul(cx-wm,ym,cz,-PI/2,wtTop*.46);
  }
  if(o.pulley){
   const yp=y0+.14+hs-1.35,wp=lerp(wb,wtTop,(hs-1.35)/hs)/2+.02;
   dvPulleyRig(cx,yp,cz+wp,o.pulleyYaw==null?0:o.pulleyYaw,1.35,o.pulleyDrop==null?2.8:o.pulleyDrop,{cableTo:o.cableTo});
  }
  peakY=dvSlatePyramid(cx,cz,wtTop,y0+.14+hs,o.roofRise==null?wtTop*1.18:o.roofRise,o.steps==null?6:o.steps);
 });
 return peakY;
}

/* ---------------------------------------------------------------- 3. 12-Pleat Star-Fluted Conical Akhtamar Umbrella Spire (Gumbat, DV2)
   24 crisp flat star-pleat facets (`poly`) with exact outward+upward spire normals and downward soffit normals! */
function dvGumbat(cx,cz,rDrum,yBase,hDrum,hSpire,o){
 o=o||{};const r=rDrum==null?2.1:rDrum,hd=hDrum==null?2.65:hDrum,hs=hSpire==null?3.35:hSpire;
 const smk=o.mk||'verdigris',scol=o.col==null?P(smk==='verdigris'?'verdigris':'tuffCrimson'):o.col;
 const tfCol=P('tuff'),bsCol=P('basalt'),skCol=P('skarn');

 svNoWalk(()=>{
  cyl('basalt',cx,yBase+.004,cz,r+.08,.18,bsCol,12);
  cyl('tuffPolished',cx,yBase+.19,cz,r,Math.max(.3,hd-.36),tfCol,12);
  cyl('basalt',cx,yBase+hd-.165,cz,r+.06,.16,bsCol,12);

  const nWin=o.windows==null?4:o.windows;
  for(let i=0;i<nWin;i++){
   const a=i/nWin*TAU,yaw=Math.atan2(Math.sin(a),Math.cos(a));
   const wx=cx+Math.sin(yaw)*(r+.012),wz=cz+Math.cos(yaw)*(r+.012);
   windowAt(wx,yBase+.52,wz,yaw,.38,Math.max(.55,hd-1.15),.52);
   svPane(cx+Math.sin(yaw)*(r+.02),yBase+.54,cz+Math.cos(yaw)*(r+.02),yaw,.34,Math.max(.5,hd-1.19),{kind:'lit',t:.02});
   dvSkarnArch(wx,yBase+.52+Math.max(.55,hd-1.15),wz,yaw,.46,{h:.22});
   const aMid=a+PI/nWin,ym=Math.atan2(Math.sin(aMid),Math.cos(aMid));
   dvJadeCross(cx+Math.sin(ym)*(r+.012),yBase+hd*.58,cz+Math.cos(ym)*(r+.012),ym,.48);
  }

  /* 24 crisp flat star-pleat facets (12 ridges, 12 valleys):
     - underside soffit faces strictly DOWNWARD (ny < 0);
     - conical umbrella spire faces strictly OUTWARD + UPWARD (ny > 0, radial dot > 0). */
  const segs=24,yEave=yBase+hd,rIn=r*.92,rVal=r*1.05,rRidge=r*1.26,rTop=.09,yApex=yEave+hs;
  const eavePt=k=>{
   const ang=(k%segs)/segs*TAU,isR=(k%2===0),rad=isR?rRidge:rVal,yy=yEave+(isR?.19:.01);
   return [cx+Math.sin(ang)*rad,yy,cz+Math.cos(ang)*rad];
  };
  const inPt=k=>{
   const ang=(k%segs)/segs*TAU;
   return [cx+Math.sin(ang)*rIn,yEave-.09,cz+Math.cos(ang)*rIn];
  };
  const topPt=k=>{
   const ang=(k%segs)/segs*TAU;
   return [cx+Math.sin(ang)*rTop,yApex,cz+Math.cos(ang)*rTop];
  };
  dvAuditShell('gumbat',cx,yEave,cz,()=>{
   for(let k=0;k<segs;k++){
    const q0=inPt(k),q1=inPt(k+1),e0=eavePt(k),e1=eavePt(k+1),t0=topPt(k),t1=topPt(k+1);
    /* exact planar downward-facing soffit triangles: +tangent x +radial = -Y */
    poly('skarn',[q0,q1,e1],skCol,false);
    poly('skarn',[q0,e1,e0],skCol,false);
    /* exact planar outward & upward conical star-pleat triangles */
    poly(smk,[e0,e1,t1],scol,false);
    poly(smk,[e0,t1,t0],scol,false);
   }
  });

  cyl('bronze',cx,yApex+.004,cz,.15,.14,P('bronze'),10);
  sph('verdigris',cx,yApex+.24,cz,.13,P('verdigris'),1,10);
  box('gold',cx,yApex+.37,cz,.07,.68,.07,P('gold'));
  box('jade',cx,yApex+.74,cz-.19,.07,.09,.3,P('jadeBright'));
  box('jade',cx,yApex+.74,cz+.19,.07,.09,.3,P('jadeBright'));
 });
 return yBase+hd+hs+1.06;
}

/* Closed 3D triangular gable wall prism (solid front, back, bottom & sloped sides so both exterior & X cut-away are 100% solid) */
function dvGablePrism(mk,cx,gz,wBot,y0,y1,th,col){
 const hw=wBot/2,ht=th/2;
 const zF=gz+ht,zB=gz-ht;
 const fL=[cx-hw,y0,zF],fR=[cx+hw,y0,zF],fT=[cx,y1,zF];
 const bL=[cx-hw,y0,zB],bR=[cx+hw,y0,zB],bT=[cx,y1,zB];
 poly(mk,[fL,fR,fT],col,false);
 poly(mk,[bR,bL,bT],col,false);
 poly(mk,[bL,fL,fT,bT],col,false);
 poly(mk,[fR,bR,bT,fT],col,false);
 poly(mk,[bL,bR,fR,fL],col,false);
}

/* ---------------------------------------------------------------- 4. Solid 3D Pitched Gable Roof (Outward Slopes + Solid Eave Soffits!) */
function dvGableRoof(cx,cz,w,d,yEave,rise,o){
 o=o||{};const rh=rise==null?1.85:rise,ov=o.over==null?.38:o.over,mk=o.mk||'slate';
 const col=o.col==null?P(mk==='verdigris'?'verdigris':mk==='tuffPolished'?'tuffCrimson':'slate'):o.col;
 const hw=w/2+ov,lenZ=d+ov*2,wt=o.wt==null?DV_WALL_T:o.wt,thRoof=.11;
 svNoWalk(()=>{
  /* closed 3D tuff triangular gable walls inset inside eave overhang, ending 12 cm below roof peak so zero touch with roof slabs */
  const yGableTop=Math.max(yEave+.18,yEave+rh-.14);
  for(const sz of [-1,1]){
   const gz=cz+sz*(d/2-wt/2);
   dvGablePrism('tuff',cx,gz,w-.04,yEave+.005,yGableTop,wt-.02,P('tuff'));
   if(o.jadeGable!==false&&rh>=1.35){
    dvJadeCross(cx,yEave+rh*.48,cz+sz*(d/2+.006),sz>0?0:PI,.5);
   }
  }
  /* left (-x) and right (+x) SOLID 3D tilted roof slabs (`box` -> 6 closed faces: top slope, underside eave soffit, fascia & bargeboards!) */
  const xIn=.07,dx=hw-xIn,dy=rh+.06,sLen=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
  dvAuditShell('gable',cx,yEave+rh*.5,cz,()=>{
   for(const sx of [-1,1]){
    const mx=cx+sx*(xIn+hw)*.5,my=yEave+rh-(dy*.5)+.03;
    box(mk,mx,my-thRoof*.5,cz,sLen,thRoof,lenZ,col,0,0,-sx*ang);
   }
  });
  /* solid cypress or bronze ridge beam capping the apex */
  box(mk==='verdigris'?'bronze':'cypress',cx,yEave+rh+.035,cz,.24,.13,lenZ+.06,mk==='verdigris'?P('bronze'):P('cypress'));
 });
 return yEave+rh+.17;
}

/* ---------------------------------------------------------------- 5. Gorge Lantern Bracket & Chivalric Valley-King Standard */
function dvLampBracket(x,y,z,yaw,s){
 const sc=s==null?1:s;
 dvNoCut(()=>W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('iron',0,.14,.14,.05,.05,.28*sc,P('iron'));
   cyl('bronze',0,-.12,.28*sc,.1*sc,.05*sc,P('bronze'),8);
   cyl('glass',0,-.065,.28*sc,.08*sc,.15*sc,0xe6dcc4,8);
   sph('glow',0,.01,.28*sc,.045*sc,0xffb44c,1,6);
   cone('verdigris',0,.09,.28*sc,.13*sc,.095*sc,P('verdigris'),8);
  });
  haloAt(0,.01,.28*sc,0xffb44c,false);
 }));
}

function dvBanner(x,y,z,ry,h,col){
 const bh=h==null?2.7:h,c=col==null?P('crimson'):col;
 dvNoCut(()=>W(x,y,z,ry||0,()=>{
  svNoWalk(()=>{
   cyl('cypress',0,0,0,.042,bh,P('cypress'),8);
   sph('jade',0,bh+.05,0,.065,P('jadeBright'),1,8);
   cone('gold',0,bh+.12,0,.048,.2,P('gold'),6);
   box('bronze',0,bh-.24,0,.78,.04,.04,P('bronze'));
   withCloth(clothHang(bh*.52,.07),()=>{
    quad('flag',0,bh-.28-bh*.26,.028,.68,bh*.52,c,0);
   });
  });
 }));
}
