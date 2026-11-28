// prefix: hs
// ================================================================= HUSH-KIN WHITE-QUARTZ SPIRES, HELIOGRAPHS & MOOT TIERS (HS1)
// Inherits and elevates kits/dzagh-vardzi/src/41-dv-roof.js stepped snow-white quartz pyramidal spire geometry into the
// signature Silent-Vales architectural crown:
//   - hsQuartzPyramid: 6- to 9-stepped gleaming snow-white milky-quartz pyramidal spires + nephrite harmonic band + tuning-fork finial
//   - hsHeliographCupola: rock-crystal prism core surrounded by angled/rotating bronze shutter vanes for silent shore-to-shore signalling
//   - hsQuartzSpireTower: slender 5:1 to 6:1 battered pale-granite & blue-slate towers crowned with stepped snow-white quartz spires
//   - hsSteppedAmphitheatre: circular/octagonal walkable stepped Handspeak moot council tiers
//   - hsHushPylon: intact pre-Cataclysm fluted white-alloy Acoustic Hush-Pylon obelisk

const HS_SHUTTERS=[];
if(typeof FRAME_HOOKS!=='undefined'){
 FRAME_HOOKS.push(()=>{
  const t=(typeof ANIM!=='undefined'&&ANIM.t!=null)?ANIM.t:0;
  for(const s of HS_SHUTTERS){
   if(s.grp&&s.grp.parent)s.grp.rotation.y=hsRigMath.heliographAngle(t,s.phase,s.speed);
  }
 });
}

/* Closed 4-sided battered frustum block with guaranteed outward flat normals on all 4 sloped faces + solid top/bottom caps. */
function hsFrustum4(mk,cx,cz,w0,d0,w1,d1,y0,y1,col){
 const hw0=w0/2,hd0=d0/2,hw1=w1/2,hd1=d1/2;
 const b00=[cx-hw0,y0,cz-hd0],b10=[cx+hw0,y0,cz-hd0],b11=[cx+hw0,y0,cz+hd0],b01=[cx-hw0,y0,cz+hd0];
 const t00=[cx-hw1,y1,cz-hd1],t10=[cx+hw1,y1,cz-hd1],t11=[cx+hw1,y1,cz+hd1],t01=[cx-hw1,y1,cz+hd1];
 /* +z front, -z back, +x east, -x west, +y top, -y bottom */
 poly(mk,[b01,b11,t11,t01],col,false);
 poly(mk,[b10,b00,t00,t10],col,false);
 poly(mk,[b11,b10,t10,t11],col,false);
 poly(mk,[b00,b01,t01,t00],col,false);
 poly(mk,[t01,t11,t10,t00],col,false);
 poly(mk,[b00,b10,b11,b01],col,false);
}

/* Twin-pronged monolithic snow-white quartz 440 Hz tuning-fork finial on a bronze & emerald-nephrite harmonic collar. */
function hsTuningFinial(cx,yBase,cz,h,o){
 o=o||{};
 const fh=h==null?1.05:h;
 svNoWalk(()=>{
  cyl('bronze',cx,yBase+.004,cz,.16,.1,P('bronze'),8);
  sph('nephrite',cx,yBase+.18,cz,.095,P('nephrite'),1,8);
  box('quartz',cx,yBase+.27,cz,.28,.09,.1,P('quartzPure'));
  for(const sx of [-.105,.105]){
   box('quartz',cx+sx,yBase+.36,cz,.058,fh*.68,.068,P('quartzPure'));
   cone('quartz',cx+sx,yBase+.36+fh*.68,cz,.042,.16,P('quartzPure'),4);
  }
 });
 return yBase+.36+fh*.68+.16;
}

/* Shuttered rock-crystal optical heliograph cupola: 4 corner granite/bronze piers framing a glowing rock-crystal prism core
   surrounded by rotating/angled bronze shutter vanes (driven by core/clock!) for silent shore-to-shore signalling across mist. */
function hsHeliographCupola(cx,yBase,cz,wCup,hCup,o){
 o=o||{};
 const wc=wCup==null?1.65:wCup,hc0=hCup==null?1.52:hCup;
 const phase=((hsSeedAt(cx,yBase,cz,71)&1023)/1024)*TAU;
 const baseAng=hsRigMath.heliographAngle(4,phase,.45);
 svNoWalk(()=>{
  box('slate',cx,yBase+.004,cz,wc+.18,.12,wc+.18,P('slate'));
  const off=wc*.42;
  for(const sx of [-off,off])for(const sz of [-off,off]){
   box('granite',cx+sx,yBase+.124,cz+sz,.19,hc0-.24,.19,P('granite'));
  }
  /* Central glowing faceted rock-crystal prism lantern core */
  cyl('bronze',cx,yBase+.124,cz,wc*.24,.12,P('bronze'),8);
  cyl('crystal',cx,yBase+.244,cz,wc*.2,hc0-.48,P('crystal'),8);
  cyl('glow',cx,yBase+.32,cz,wc*.11,hc0-.64,0xfff0c2,8);
  cyl('bronze',cx,yBase+hc0-.236,cz,wc*.24,.11,P('bronze'),8);
  /* 6 angled bronze optical shutter vanes stepped clear outside the crystal core */
  const rVane=wc*.32;
  for(let i=0;i<6;i++){
   const a=baseAng+i*TAU/6,vx=cx+Math.sin(a)*rVane,vz=cz+Math.cos(a)*rVane;
   box('bronze',vx,yBase+.26,vz,.14,hc0-.52,.024,P('bronze'),a+.52);
  }
  box('quartz',cx,yBase+hc0-.116,cz,wc+.14,.12,wc+.14,P('quartzPure'));
 });
 W(cx,yBase+hc0*.52,cz,0,()=>haloAt(0,0,0,0xffe4a0,true));
 if(CURREC&&!PLACE_DRY){
  (CURREC.heliographs||(CURREC.heliographs=[])).push({w:wc,h:hc0,angle:baseAng});
 }
 return yBase+hc0;
}

/* Gleaming 6- to 9-stepped snow-white milky-quartz pyramidal spire (elevated from dvQuartzPyramid), with optional
   shuttered rock-crystal optical heliograph cupola and twin-pronged 440 Hz quartz tuning-fork finial! */
function hsQuartzPyramid(cx,cz,wBase,yBase,rise,steps,o){
 o=o||{};
 const n=Math.max(6,steps==null?7:steps),wb=wBase==null?2.2:wBase,rh=rise==null?wb*1.32:rise;
 let yCur=yBase;
 if(o.heliograph){
  yCur=hsHeliographCupola(cx,yCur,cz,wb*.82,o.cupolaH==null?Math.max(1.38,wb*.68):o.cupolaH,o);
 }
 const dy=rh/n,qzA=P('quartzPure'),qzB=P('quartz');
 svNoWalk(()=>{
  box('slate',cx,yCur+.004,cz,wb+.22,.1,wb+.22,P('slate'));
  for(let i=0;i<n;i++){
   const w=hsRigMath.quartzStepWidth(wb+.1,Math.max(.34,wb*.17),n,i);
   const ya=yCur+.104+dy*i,yb=yCur+.104+dy*(i+1);
   box('quartz',cx,ya,cz,w,Math.max(.07,yb-ya),w,i%2===0?qzA:qzB);
   if(i===1&&o.nephriteBand!==false){
    /* Sawn emerald-nephrite harmonic collar inset/outset cleanly on step 1 */
    box('nephrite',cx,ya+.02,cz,w+.05,Math.min(.06,(yb-ya)*.45),w+.05,P('nephrite'));
   }
  }
 });
 const yPeak=yCur+.104+rh;
 const yTop=o.tuningFork===false?(svNoWalk(()=>cone('quartz',cx,yPeak+.004,cz,.2,.56,qzA,4)),yPeak+.58):hsTuningFinial(cx,yPeak,cz,o.finialH==null?.96:o.finialH);
 if(CURREC&&!PLACE_DRY){
  (CURREC.quartzSpires||(CURREC.quartzSpires=[])).push({steps:n,wBase:+wb.toFixed(3),rise:+rh.toFixed(3),heliograph:!!o.heliograph});
 }
 return yTop;
}

/* Slender 5:1 to 6:1 battered pale-granite & blue-slate tower crowned with a gleaming 6- to 9-stepped snow-white quartz spire
   and optional optical heliograph cupola. */
function hsQuartzSpireTower(cx,cz,wBase,y0,hShaft,o){
 o=o||{};
 const wb=wBase==null?2.7:wBase,wtTop=wb*(o.taper==null?.74:o.taper),hs=hShaft==null?11.8:hShaft;
 const granCol=P('granite'),ashCol=P('ashlar'),slCol=P('slateWall');
 const hasDoor=o.doorYaw!=null;
 const baseClear=hasDoor?2.34:0;
 if(hasDoor){
  W(cx,y0,cz,o.doorYaw,()=>{
   hsBox(wb,wb,0,2.34,{mk:'granite',socle:.34,postR:.18,holes:{s:[{x:0,y:0,w:1.08,h:2.04}]}});
   hsDoor(0,0,wb/2-HS.WALL/2,0,.96,1.98,{quartzCrown:true});
   if(o.walkFloor!==false){
    wkPad(0,0,wb-.64,wb-.64,0);
    hsTarget(0,0,0,o.targetName||'spire-base');
   }
  });
 }
 const nBands=Math.max(5,Math.round((hs-baseClear)/1.4));
 const yStart=y0+baseClear,remH=hs-baseClear;
 svNoWalk(()=>{
  for(let i=0;i<nBands;i++){
   const u0=i/nBands,u1=(i+1)/nBands;
   const ya=yStart+remH*u0+.003,yb=yStart+remH*u1-.003;
   const wa=lerp(wb*(hasDoor?.96:1),wtTop,u0),wb2=lerp(wb*(hasDoor?.96:1),wtTop,u1);
   const mk=(i%4===2)?'slateWall':(i%2===0?'granite':'ashlar');
   const col=(i%4===2)?slCol:(i%2===0?granCol:ashCol);
   hsFrustum4(mk,cx,cz,wa,wa,wb2,wb2,ya,yb,col);
  }
  /* Z-stepped snow-white quartz & nephrite harmonic relief medallion at 68% shaft height */
  const yMed=y0+hs*.68,zMed=lerp(wb,wtTop,.68)/2;
  const z1=hsRigMath.formlineLayerZ(zMed,1),z2=hsRigMath.formlineLayerZ(zMed,2);
  box('quartz',cx,yMed-.24,cz+z1,.46,.48,.02,P('quartzPure'));
  box('nephrite',cx,yMed-.12,cz+z2,.2,.24,.018,P('nephrite'));
 });
 /* Lit rock-crystal slit window at mid-shaft */
 const yWin=y0+hs*.46,zWin=lerp(wb,wtTop,.46)/2+.02;
 windowAt(cx,yWin,cz+zWin,0,.32,.88,hs*.46);
 svPane(cx,yWin+.02,cz+zWin+.018,0,.28,.84,{kind:'lit',t:.022});
 return hsQuartzPyramid(cx,cz,wtTop,y0+hs,o.roofRise==null?wtTop*1.36:o.roofRise,o.steps==null?7:o.steps,o);
}

/* Walkable octagonal stepped Handspeak council moot-amphitheatre tiers (every tier faces the central speaker dais!). */
function hsSteppedAmphitheatre(cx,cz,rOuter,rInner,y0,tiers,o){
 o=o||{};
 const nT=Math.max(3,tiers==null?4:tiers),stepH=o.stepH==null?.28:o.stepH,segs=12;
 const rRing=(rad)=>{
  const pts=[];
  for(let i=0;i<segs;i++){
   const a=i/segs*TAU;
   pts.push([cx+Math.sin(a)*rad,cz+Math.cos(a)*rad]);
  }
  return pts;
 };
 /* Central speaker floor at y0 */
 svNoWalk(()=>cyl('paving',cx,y0-.14,cz,rOuter+.18,.14,P('paving'),segs));
 svFloor(rRing(rOuter-.1),y0);
 /* Ascending stepped perimeter seating/signing tiers (open on +z entrance arc so council enters cleanly!) */
 for(let t=1;t<=nT;t++){
  const u0=(t-1)/nT,rA=lerp(rInner,rOuter,u0),rB=rOuter,yt=y0+t*stepH;
  for(let s=0;s<segs;s++){
   const a0=s/segs*TAU,a1=(s+1)/segs*TAU,aMid=(a0+a1)*.5;
   /* Leave south (+z, angle ~0) entrance aisle open */
   if(Math.cos(aMid)>.78)continue;
   const p0=[cx+Math.sin(a0)*rA,cz+Math.cos(a0)*rA],p1=[cx+Math.sin(a1)*rA,cz+Math.cos(a1)*rA];
   const q1=[cx+Math.sin(a1)*rB,cz+Math.cos(a1)*rB],q0=[cx+Math.sin(a0)*rB,cz+Math.cos(a0)*rB];
   svNoWalk(()=>prism(t%2===0?'slate':'granite',[p0,p1,q1,q0],yt-stepH,yt,t%2===0?P('slate'):P('granite')));
   svFloor([p0,p1,q1,q0],yt);
  }
 }
 /* Walkable radial stair climbs on west (-x), north (-z) and east (+x) up to top moot tier */
 const yTop=y0+nT*stepH;
 svStripWalk([cx-(rInner-.35),y0,cz],[cx-(rOuter-.55),yTop,cz],1.4);
 svStripWalk([cx+(rInner-.35),y0,cz],[cx+(rOuter-.55),yTop,cz],1.4);
 svStripWalk([cx,y0,cz-(rInner-.35)],[cx,yTop,cz-(rOuter-.55)],1.4);
 return yTop;
}

/* Intact pre-Cataclysm fluted white-alloy Acoustic Hush-Pylon obelisk generating Silent Vales' broadband suppression field. */
function hsHushPylon(cx,y0,cz,h,o){
 o=o||{};
 const ph=h==null?12.4:h;
 svNoWalk(()=>{
  cyl('granite',cx,y0,cz,1.85,.28,P('granite'),12);
  cyl('quartz',cx,y0+.28,cz,1.48,.22,P('quartzPure'),12);
  cyl('hushAlloy',cx,y0+.5,cz,1.08,.36,P('hushAlloy'),8);
  /* Fluted tapering Ancient white-ceramic acoustic-damping obelisk shaft */
  hsFrustum4('hushWhite',cx,cz,1.28,1.28,.64,.64,y0+.86,y0+ph*.78,P('hushWhite'));
  /* Three emerald-nephrite & bronze harmonic nodal rings along the pylon */
  for(const f of [.28,.5,.7]){
   const yy=y0+ph*f,rw=lerp(1.28,.64,(yy-(y0+.86))/(ph*.78-.86))*.66;
   ring('hushAlloy',cx,yy,cz,rw+.16,.065,P('hushAlloy'),0,0,0,12);
   ring('nephrite',cx,yy+.11,cz,rw+.12,.045,P('nephrite'),0,0,0,12);
  }
  /* Floating/cantilevered rock-crystal harmonic tuning resonator crown */
  cyl('hushAlloy',cx,y0+ph*.78,cz,.52,.22,P('hushAlloy'),8);
  cyl('crystal',cx,y0+ph*.78+.22,cz,.38,ph*.14,P('crystal'),8);
  cyl('glow',cx,y0+ph*.78+.28,cz,.18,ph*.1,0xdcf2ff,8);
  hsTuningFinial(cx,y0+ph*.92+.22,cz,1.15);
 });
 W(cx,y0+ph*.84,cz,0,()=>haloAt(0,0,0,0xdcf2ff,true));
}
