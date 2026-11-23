// prefix: ra
// ================================================================= RIA DYNASTY STRUCTURAL, MASONRY, ARCADE & WALKABILITY TOOLKIT
// Shared engineering foundation for both Lower Ria (Western Dynasty, Riwa-Toka) and Upper Ria (Eastern Dynasty, Liwa-Toga).
// Invariants enforced by construction:
//   1. All decorative courses, socles, cornices, columns, stairs and curbs run inside svNoWalk(() => ...) so KWALKBOX never
//      registers fake 0.45 m socle or sill floors.
//   2. Full-height wall blockers (dy >= 0.85 m) are registered explicitly via raWallBlock, leaving clean doorway gaps bridged
//      by wkPad thresholds and operable core/door leaves.
//   3. Adjacent material faces step by >= 0.02 m (2 cm) so world-space coplanar triangle overlap is strictly zero.

const raTmpM=new THREE.Matrix4(),raTmpS=new THREE.Vector3();

function raNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}

function raBelowGrade(fn){const keepSB=SB;SB=null;try{raNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

function raTarget(x,y,z,name,indoor){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor',indoor:indoor!==false});
}

function raFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.006,e[3],e[4]==null?0:e[4],e[5]);
}

/* Explicit full-height wall collision block in local coordinates (dy >= 0.80 m -> KWALKBOX registers 'block', never 'floor'). */
function raWallBlock(lx,ly,lz,w,h,d,ry){
 if(PLACE_DRY||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const bh=Math.max(.82,h);
 raTmpM.copy(CM).multiply(TF(lx,ly+bh/2,lz,ry||0));
 raTmpM.scale(raTmpS.set(Math.max(.14,w),bh,Math.max(.14,d)));
 KWALKBOX.add(KWALK,raTmpM.elements,{tag:'wall:'+CURKEY});
}

/* Walkable floor slab whose top is at yTop: visual thickness th drawn in svNoWalk + clean wkPad floor (or svWell hole). */
function raFloorSlab(cx,yTop,cz,w,d,o){
 o=o||{};
 const th=o.th==null?.18:o.th,mk=o.mk||'mosaic',col=o.col==null?P(mk):o.col;
 if(o.hole){
  svWell(mk,cx,yTop-th,cz,w,th,d,col,o.hole,{walk:o.walk!==false});
 }else{
  svNoWalk(()=>box(mk,cx,yTop-th,cz,w,th,d,col));
  if(o.walk!==false)wkPad(cx,cz,w,d,yTop);
 }
 return yTop;
}

/* Coffered underside interior ceiling slab at yCeil so looking up from inside NEVER shows sky. */
function raCeilingSlab(cx,yCeil,cz,w,d,o){
 o=o||{};
 if(w<.3||d<.3)return;
 const mk=o.mk||'teak',col=o.col==null?P(mk):o.col;
 const trimMk=o.trimMk||'gold',trimCol=o.trimCol==null?P(trimMk):o.trimCol;
 svNoWalk(()=>{
  box(mk,cx,yCeil,cz,w,.09,d,col);
  const nx=Math.max(2,Math.min(5,Math.round(w/2.6))),nz=Math.max(2,Math.min(5,Math.round(d/2.6)));
  for(let i=1;i<nx;i++){
   const xx=cx-w/2+w*i/nx;
   box(trimMk,xx,yCeil-.045,cz,.08,.04,d-.16,trimCol);
  }
  for(let j=1;j<nz;j++){
   const zz=cz-d/2+d*j/nz;
   box(mk,cx,yCeil-.085,zz,w-.16,.038,.09,col);
  }
 });
}

/* Projecting Egyptian cavetto cornice band around a rectangular body [w x d] with base at y0 and total height ch. */
function raCavettoCornice(cx,y0,cz,w,d,ch,o){
 o=o||{};
 const h=ch==null?.36:ch,mk=o.mk||'travertine',col=o.col==null?P(mk):o.col;
 const bandMk=o.bandMk||'gold',bandCol=o.bandCol==null?P(bandMk):o.bandCol;
 svNoWalk(()=>{
  /* Torus roll astragal + flaring cavetto throat + flat abacus cap (all stacked cleanly in Y, zero shared planes) */
  box(bandMk,cx,y0,cz,w+.06,h*.22,d+.06,bandCol);
  box(mk,cx,y0+h*.22,cz,w+.16,h*.36,d+.16,col);
  box(mk,cx,y0+h*.58,cz,w+.32,h*.42,d+.32,col);
 });
 return y0+h;
}

/* Walkable strip + 0.85 m top landing pad (>= 2 x 0.4 m KWALK cells so landing never misses a 0.4 m sample line). */
function raStripWalk(a,b,w){
 if(!svWalkOn())return;
 const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY;
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[-.25,-w/2],[.6,-w/2],[.6,w/2],[-.25,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});
}

/* Grand ceremonial stair flight from (x0, y0, z0) climbing to (x1, y1, z1) with width w, solid masonry steps in svNoWalk,
   walkable raStripWalk + foot/top wkPad landings, and optional Uktena Naga or Hongsa Swan balustrades. */
function raGrandStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(rise<.06||run<.2)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(2,Math.ceil(rise/RA.RISER));
 const mk=o.mk||'travertine',col=o.col==null?P(mk):o.col;
 const sideMk=o.sideMk||'cobalt',sideCol=o.sideCol==null?P(sideMk):o.sideCol;
 raNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    for(let i=0;i<ns;i++){
     const f0=i/ns,f1=(i+1)/ns,za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const yt=y0+rise*f1,yb=o.openUnder?Math.max(y0,yt-.24):y0;
     box(mk,0,yb,(za+zb)/2,w-.04,Math.max(.06,yt-yb),Math.abs(zb-za)+.015,col);
    }
    if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.13);
      for(let k=0;k<4;k++){
       const fk0=k/4,fk1=(k+1)/4,zk=lerp(-run/2,run/2,(fk0+fk1)/2),yk=y0+rise*fk1+.22;
       box(sideMk,sx,o.openUnder?y0+rise*fk0:y0,zk,.22,o.openUnder?rise*.25+.34:yk-y0,run/4+.02,sideCol);
      }
     }
    }
   });
  });
  raStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(.95,w-.2));
  const ux=dx/run,uz=dz/run,pw=Math.abs(uz)>=Math.abs(ux)?Math.max(1.0,w-.16):1.0,pd=Math.abs(uz)>=Math.abs(ux)?1.0:Math.max(1.0,w-.16);
  wkPad(x0-ux*.36,z0-uz*.36,pw,pd,y0);
  wkPad(x1+ux*.36,z1+uz*.36,pw,pd,y1);
  if(o.rail==='naga')raNagaRail(x0,y0,z0,x1,y1,z1,w,o.railOpts);
  else if(o.rail==='hongsa')raHongsaRail(x0,y0,z0,x1,y1,z1,w,o.railOpts);
 });
}

/* Monumental battered stepped plinth [w x d] rising to top height h:
   Lower Ria style uses cobalt/emerald/saffron glazed brick & travertine; Upper Ria uses red-porphyry & cream dolomite. */
function raPlinth(w,d,h,o){
 o=o||{};
 const upper=o.style==='upper-ria';
 const baseMk=o.baseMk||(upper?'porphyry':'cobalt'),baseCol=o.baseCol==null?P(baseMk):o.baseCol;
 const midMk=o.midMk||(upper?'dolomite':'emerald'),midCol=o.midCol==null?P(midMk):o.midCol;
 const capMk=o.capMk||(upper?'dolomite':'travertine'),capCol=o.capCol==null?P(capMk):o.capCol;
 const topMk=o.topMk||(upper?'paving':'mosaic'),topCol=o.topCol==null?P(topMk):o.topCol;
 const h1=h*.38,h2=h*.38,h3=h-h1-h2;
 raBelowGrade(()=>{
  box(baseMk,0,-1.2,0,w+.72,1.2,d+.72,baseCol);
 });
 raNoCut(()=>svNoWalk(()=>{
  box(baseMk,0,0,0,w+.56,h1,d+.56,baseCol);
  box(midMk,0,h1,0,w+.32,h2,d+.32,midCol);
  box(capMk,0,h1+h2,0,w+.14,Math.max(.05,h3-.06),d+.14,capCol);
  box(topMk,0,h-.06,0,w,.06,d,topCol);
 }));
 if(o.walk!==false)wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.8:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(1.2,h*2.15):o.stepRun;
  const zTop=d/2+.06,zFoot=d/2+.28+run;
  raGrandStair(sx,0,zFoot,sx,h,zTop,sw,{
   mk:capMk,col:capCol,sideMk:baseMk,sideCol:baseCol,
   rail:o.rail||(upper?'hongsa':'naga'),railOpts:o.railOpts
  });
 }
 return h;
}

/* Operable Ria doorway with battered Egyptian-Classical jambs, gilded/carved Thai-Khmer crown pediment, svLeaf and threshold wkPad. */
function raDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?RA.WALL:o.t,upper=o.style==='upper-ria';
 const fMk=o.frameMk||(upper?'porphyry':'travertine'),fCol=P(fMk);
 const crMk=o.crownMk||(upper?'silver':'gold'),crCol=P(crMk);
 const leafMk=o.leafMk||(upper?'teak':'crimson'),leafCol=P(leafMk);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box(fMk,s*(w/2+.08),0,0,.15,h+.08,t+.14,fCol);
   }
   box(fMk,0,h+.08,0,w+.46,.18,t+.2,fCol);
   box(crMk,0,h+.26,0,w+.34,.08,t+.24,crCol);
   if(o.pediment!==false){
    /* Gilded Prasat / Lanna portal crown spirelet */
    const pz=t/2+.11;
    poly(crMk,[[-w*.48,h+.34,pz],[w*.48,h+.34,pz],[0,h+.92,pz]],crCol,true);
    cone(crMk,0,h+.9,pz,.08,.28,crCol,6);
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.06,h-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'double',hwCol:upper?0xcfd5dc:0xdcb244,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'door'
   });
  }
  door(0,0,t/2,0,w,h);
  if(o.walkPad!==false)wkPad(0,0,w+.24,t+1.15,0);
 });
}

/* Carved stone or teak lattice window with real core/door glass pane (svPane), stepped proud of wall faces. */
function raWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?RA.WALL:o.t,upper=o.style==='upper-ria';
 const fMk=o.frameMk||(upper?'dolomite':'travertine'),fCol=P(fMk);
 const crMk=o.crownMk||(upper?'porphyry':'gold'),crCol=P(crMk);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box(fMk,0,-.07,0,w+.22,.07,t+.14,fCol);
   for(const s of [-1,1])box(fMk,s*(w/2+.045),0,0,.09,h,t+.1,fCol);
   box(fMk,0,h,0,w+.26,.11,t+.14,fCol);
   box(crMk,0,h+.11,0,w+.16,.07,t+.16,crCol);
   if(o.pediment){
    const pz=t/2+.085;
    poly(crMk,[[-w*.46,h+.18,pz],[w*.46,h+.18,pz],[0,h+.54,pz]],crCol,true);
   }
  });
  svPane(0,0,0,0,w-.06,h-.02,{kind:o.kind||'lit',t:.025});
  windowAt(0,0,t/2,0,w,h,o.sill==null?.95:o.sill);
 });
}

/* Straight wall from (x0,z0) to (x1,z1) with socle, dado frieze, main masonry/timber course, cut openings, and explicit
   raWallBlock collision segments ONLY left/right of doorways (never emitting fake sill/socle floors). */
function raWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.08)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?RA.WALL:o.t,upper=o.style==='upper-ria';
 const soc=o.socle==null?RA.SOCLE:o.socle,dado=o.dado==null?.22:o.dado;
 const socMk=o.socMk||(upper?'porphyry':'cobalt'),socCol=P(socMk);
 const dadoMk=o.dadoMk||(upper?'carve':'saffron'),dadoCol=P(dadoMk);
 const mk=o.mk||(upper?'dolomite':'plaster'),col=o.col==null?P(mk):o.col;
 const holes=(o.holes||[]).map(q=>{
  const wy=q.y==null?(q.door?0:1.0):q.y,wh=q.h==null?(q.door?RA.DOOR_H:1.35):q.h;
  return Object.assign({},q,{a:q.at-q.w/2,b:q.at+q.w/2,wy,wh,y0:y0+wy,y1:y0+wy+wh});
 });
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  svNoWalk(()=>{
   const run=(a,b,ya,yb)=>{
    if(b-a<.02||yb-ya<.02)return;
    const yS=Math.min(yb,y0+soc);
    if(soc>0&&yS>ya)box(socMk,X((a+b)/2),ya,0,b-a,yS-ya,t+.05,socCol);
    const yD0=Math.max(ya,y0+soc),yD1=Math.min(yb,y0+soc+dado);
    if(dado>0&&yD1>yD0)box(dadoMk,X((a+b)/2),yD0,0,b-a,yD1-yD0,t+.025,dadoCol);
    const yB0=Math.max(ya,y0+soc+dado);
    if(yb>yB0)box(mk,X((a+b)/2),yB0,0,b-a,yb-yB0,t,col);
   };
   const xs=[...new Set([0,L].concat(...holes.map(q=>[q.a,q.b])).filter(v=>v>=0&&v<=L))].sort((p,q)=>p-q);
   for(let i=1;i<xs.length;i++){
    const a=xs[i-1],b=xs[i],m=(a+b)/2;
    const open=holes.filter(q=>q.a<m&&q.b>m).map(q=>[q.y0,q.y1]).sort((p,q)=>p[0]-q[0]);
    let yy=y0;
    for(const r of open){if(r[0]>yy)run(a,b,yy,r[0]);yy=Math.max(yy,r[1]);}
    run(a,b,yy,y0+h);
   }
  });
  /* Render doors and windows inside the wall's local frame (z outward = +z when wall runs left-to-right +x) */
  for(const q of holes){
   if(q.draw===false)continue;
   if(q.door){
    raDoor(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style},q));
   }else{
    raWindow(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style,sill:q.wy},q));
   }
  }
  /* Register explicit full-height wall collision blocks split ONLY around doorway openings */
  if(o.block!==false&&h>=.82){
   const dSpans=holes.filter(q=>q.door).map(q=>[Math.max(0,q.a),Math.min(L,q.b)]).sort((a,b)=>a[0]-b[0]);
   let cur=0;
   for(const sp of dSpans){
    if(sp[0]-cur>.16)raWallBlock(X((cur+sp[0])/2),y0,0,sp[0]-cur,h,t,0);
    cur=Math.max(cur,sp[1]);
   }
   if(L-cur>.16)raWallBlock(X((cur+L)/2),y0,0,L-cur,h,t,0);
  }
 });
}

/* Rectangular wall enclosure on [x0..x1, z0..z1] with proud non-overlapping corner pilasters and cavetto cornice. */
function raWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?RA.WALL:o.t,pw=t+.08,hp=pw/2+.01,H=o.holes||{},skip=o.skip||'';
 const upper=o.style==='upper-ria';
 const postMk=o.postMk||(upper?'porphyry':'travertine'),postCol=P(postMk);
 const socMk=o.socMk||(upper?'dolomite':'cobalt'),socCol=P(socMk);
 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.52,h*.22);
   box(socMk,cx,y0,cz,pw+.04,sh,pw+.04,socCol);
   box(postMk,cx,y0+sh,cz,pw,h-sh,pw,postCol);
  }
 });
 if(o.block!==false&&h>=.82){
  for(const cx of [x0,x1])for(const cz of [z0,z1])raWallBlock(cx,y0,cz,pw,h,pw,0);
 }
 /* Note outward face orientation:
    South (+z): x0 -> x1 gives yaw = 0 (+z outward);
    North (-z): x1 -> x0 gives yaw = PI (-z outward);
    East (+x):  z1 -> z0 gives yaw = PI/2 (+x outward);
    West (-x):  z0 -> z1 gives yaw = -PI/2 (-x outward). */
 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 if(skip.indexOf('s')<0)raWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shiftPos(H.s,x0+hp)}));
 if(skip.indexOf('n')<0)raWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shiftRev(H.n,x1-hp)}));
 if(skip.indexOf('e')<0)raWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shiftRev(H.e,z1-hp)}));
 if(skip.indexOf('w')<0)raWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shiftPos(H.w,z0+hp)}));
 if(o.cornice!==false){
  raCavettoCornice((x0+x1)/2,y0+h,(z0+z1)/2,x1-x0+pw+.04,z1-z0+pw+.04,o.corniceH==null?.32:o.corniceH,{
   mk:upper?'dolomite':'travertine',bandMk:upper?'silver':'gold'
  });
 }
}

/* Single Classical fluted, Egyptian lotus/papyrus, or Konbaung crimson-and-gold teak column from y0 to y0+h. */
function raColumn(x,y0,z,h,o){
 o=o||{};
 const r=o.r==null?.26:o.r,upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'travertine'),col=o.col==null?P(mk):o.col;
 const baseMk=o.baseMk||(upper?'porphyry':'cobalt'),baseCol=P(baseMk);
 const capMk=o.capMk||(upper?'silver':'gold'),capCol=P(capMk);
 svNoWalk(()=>{
  box(baseMk,x,y0+.012,z,r*2.5,.18,r*2.5,baseCol);
  cyl(mk,x,y0+.192,z,r*1.16,.1,col,12);
  const shH=Math.max(.3,h-.62);
  cyl(mk,x,y0+.292,z,r,shH,col,14,r*.88,true);
  if(o.bandMk){
   cyl(o.bandMk,x,y0+.292+shH*.48,z,r+.022,.12,P(o.bandMk),14);
  }
  /* Lotus / papyrus bell capital + abacus */
  const yCap=y0+.292+shH;
  cyl(capMk,x,yCap,z,r*.94,.06,capCol,12);
  cyl(mk,x,yCap+.06,z,r*.92,.16,col,12,r*1.34);
  box(capMk,x,yCap+.22,z,r*2.65,Math.max(.08,h-(yCap-y0+.22)),r*2.65,capCol);
 });
 if(o.block!==false&&h>=1.2)raWallBlock(x,y0,z,r*2.1,h,r*2.1,0);
}

/* Linear Classical/Egyptian colonnade from (x0,z0) to (x1,z1) with entablature & cavetto cornice. */
function raColonnade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0),n=o.n==null?Math.max(2,Math.round(L/RA.BAY)+1):o.n;
 const r=o.r==null?.25:o.r,entH=o.entH==null?.46:o.entH,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 const upper=o.style==='upper-ria';
 const entMk=o.entMk||(upper?'dolomite':'travertine'),entCol=P(entMk);
 const friezeMk=o.friezeMk||(upper?'porphyry':'cobalt'),friezeCol=P(friezeMk);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<n;i++){
   const f=n===1?.5:i/(n-1),xx=(f-.5)*L;
   if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
   const cMk=o.altMk&&i%2===1?o.altMk:o.mk;
   raColumn(xx,y0,0,colH,Object.assign({},o,{mk:cMk,r}));
  }
  svNoWalk(()=>{
   box(entMk,0,y0+colH,0,L+r*2.7,entH*.42,r*2.4,entCol);
   box(friezeMk,0,y0+colH+entH*.42,0,L+r*2.8,entH*.28,r*2.52,friezeCol);
   box(entMk,0,y0+colH+entH*.7,0,L+r*3.05,entH*.3,r*2.8,entCol);
  });
 });
}

/* Rusticated Classical round-arch loggia / arcade from (x0,z0) to (x1,z1) with spandrels and keystones. */
function raArcade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0),nBays=o.bays==null?Math.max(2,Math.round(L/3.4)):o.bays;
 const t=o.t==null?.46:o.t,pierW=o.pierW==null?.56:o.pierW,yaw=Math.atan2(z0-z1,x1-x0);
 const upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'travertine'),col=P(mk);
 const trimMk=o.trimMk||(upper?'porphyry':'celadon'),trimCol=P(trimMk);
 const bayW=L/nBays,springY=y0+h*.62,archR=Math.max(.35,(bayW-pierW)*.5);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<=nBays;i++){
   const px=-L/2+i*bayW;
   svNoWalk(()=>{
    box(trimMk,px,y0+.01,0,pierW+.08,.36,t+.08,trimCol);
    box(mk,px,y0+.37,0,pierW,springY-y0-.37,t,col);
    box(trimMk,px,springY-.12,0,pierW+.1,.12,t+.1,trimCol);
   });
   if(o.block!==false&&h>=1.2)raWallBlock(px,y0,0,pierW,h*.85,t,0);
  }
  svNoWalk(()=>{
   /* Spandrel wall above arch crowns + stepped arch voussoir segments */
   const topY=y0+h-.26,crownY=Math.min(topY-.1,springY+archR*.78);
   box(mk,0,crownY,0,L+pierW,topY-crownY,t,col);
   for(let b=0;b<nBays;b++){
    const cx=-L/2+(b+.5)*bayW;
    for(const s of [-1,1]){
     box(mk,cx+s*(archR*.66),springY,0,archR*.68,crownY-springY,t-.02,col);
    }
    /* Keystone */
    box(trimMk,cx,crownY-.14,0,.24,.28,t+.09,trimCol);
   }
   box(trimMk,0,topY,0,L+pierW+.16,.1,t+.14,trimCol);
   box(mk,0,topY+.1,0,L+pierW+.28,.16,t+.24,col);
  });
 });
}

/* Monumental Battered Pylon (Babylonian cobalt/emerald/saffron glazed brick OR Egyptian red-porphyry & dolomite)
   with recessed relief niches and flaring cavetto cornice. */
function raBatteredPylon(cx,cz,wBot,dBot,y0,h,o){
 o=o||{};
 const upper=o.style==='upper-ria',yaw=o.yaw||0;
 const mk=o.mk||(upper?'porphyry':'cobalt'),col=o.col==null?P(mk):o.col;
 const bandMk=o.bandMk||(upper?'dolomite':'saffron'),bandCol=P(bandMk);
 const relMk=o.relMk||(upper?'alabaster':'emerald'),relCol=P(relMk);
 const tap=o.taper==null?.82:o.taper,cornH=.44,bodyH=h-cornH;
 W(cx,0,cz,yaw,()=>{
  svNoWalk(()=>{
   const tiers=4;
   for(let i=0;i<tiers;i++){
    const f0=i/tiers,f1=(i+1)/tiers,ya=y0+bodyH*f0,yb=y0+bodyH*f1;
    const sc=lerp(1,tap,(f0+f1)*.5);
    box(mk,0,ya,0,wBot*sc,(yb-ya)*.84,dBot*sc,col);
    box(bandMk,0,ya+(yb-ya)*.84,0,wBot*sc+.05,(yb-ya)*.16,dBot*sc+.05,bandCol);
   }
   /* Projecting relief tablet on front & back faces (stepped +3.5 cm clear of battered wall) */
   for(const sz of [-1,1]){
    const zFace=sz*(dBot*lerp(1,tap,.45)*.5+.035);
    box(relMk,0,y0+bodyH*.26,zFace,wBot*.44,bodyH*.38,.05,relCol);
   }
   /* Torus roll + flaring Egyptian cavetto cornice */
   raCavettoCornice(0,y0+bodyH,0,wBot*tap,dBot*tap,cornH,{
    mk:upper?'dolomite':'travertine',bandMk:upper?'silver':'gold'
   });
  });
  if(o.block!==false)raWallBlock(0,y0,0,wBot*.9,h,dBot*.9,0);
 });
 return y0+h;
}

/* Stone-curbed Lotus Canal / Karst Spring Water Basin with floating lotus pads & blooms (zero fake walk floors). */
function raWaterCourt(cx,cz,w,d,yRim,depth,o){
 o=o||{};
 const dep=depth==null?.55:depth,curbW=.36,upper=o.style==='upper-ria';
 const curbMk=o.curbMk||(upper?'dolomite':'travertine'),curbCol=P(curbMk);
 const trimMk=o.trimMk||(upper?'porphyry':'emerald'),trimCol=P(trimMk);
 raNoCut(()=>svNoWalk(()=>{
  /* Basin floor & 4 non-overlapping curb walls */
  box(trimMk,cx,yRim-dep-.1,cz,w,.1,d,trimCol);
  for(const sz of [-d/2+curbW/2,d/2-curbW/2])box(curbMk,cx,yRim-dep,cz+sz,w,dep+.14,curbW,curbCol);
  for(const sx of [-w/2+curbW/2,w/2-curbW/2])box(curbMk,cx+sx,yRim-dep,cz,curbW,dep+.14,d-curbW*2,curbCol);
  if(o.waterMesh!==false){
   box('water',cx,yRim-.18,cz,w-curbW*2-.04,.1,d-curbW*2-.04,P('water'));
  }
  /* Floating lotus pads & blossoms lifted cleanly above water surface */
  const nLotus=o.lotus==null?8:o.lotus,wy=yRim-.065;
  for(let i=0;i<nLotus;i++){
   const a=i*2.39996,rr=.22+.62*((i+.5)/Math.max(1,nLotus));
   const lx=cx+Math.cos(a)*(w*.5-curbW-.55)*rr,lz=cz+Math.sin(a)*(d*.5-curbW-.55)*rr;
   cyl('lotus',lx,wy,lz,.34,.022,P('lotusLeaf'),10);
   if(i%2===0)cone('silk',lx,wy+.025,lz,.11,.12,P(i%4===0?'lotusGold':'lotusPink'),7);
  }
 }));
}

/* Carved-gilt teak water-pavilion boardwalk spanning from (x0,z0) to (x1,z1) at deck height yDeck over piers. */
function raBoardwalk(x0,z0,x1,z1,yBed,yDeck,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.25)return;
 const yaw=Math.atan2(dx,dz),bw=w==null?1.9:w;
 const deckMk=o.deckMk||'floor',railMk=o.railMk||'gold',postMk=o.postMk||'crimson';
 raNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    box('teak',0,yDeck-.18,0,bw-.08,.1,L,P('teak'));
    box(deckMk,0,yDeck-.08,0,bw,.08,L+.08,P(deckMk));
    const nPiers=Math.max(2,Math.round(L/2.8)+1);
    for(let i=0;i<nPiers;i++){
     const zz=lerp(-L/2+.25,L/2-.25,nPiers===1?.5:i/(nPiers-1));
     for(const sx of [-bw/2+.14,bw/2-.14]){
      if(yDeck-yBed>.2)cyl(postMk,sx,yBed,zz,.11,yDeck-yBed-.18,P(postMk),8);
      if(o.rails!==false){
       box(postMk,sx,yDeck+.005,zz,.1,.86,.1,P(postMk));
       sph(railMk,sx,yDeck+.91,zz,.07,P(railMk),1,8);
      }
     }
    }
    if(o.rails!==false){
     for(const sx of [-bw/2+.14,bw/2-.14]){
      box(railMk,sx,yDeck+.76,0,.07,.08,L,P(railMk));
      box('carvedwood',sx,yDeck+.24,0,.04,.38,L-.12,P('carvedGilt'));
     }
    }
   });
  });
  raStripWalk([x0,yDeck,z0],[x1,yDeck,z1],Math.max(.9,bw-.28));
  wkPad(x0,z0,bw,bw,yDeck);
  wkPad(x1,z1,bw,bw,yDeck);
 });
}

/* Walkable cylindrical floor disc at height yTop (visual prism in svNoWalk + svFloor polygon). */
function raFloorDisc(cx,cz,r,yTop,mk,col,o){
 o=o||{};
 const seg=o.seg==null?20:o.seg,th=o.th==null?.16:o.th,pts=[];
 for(let i=0;i<seg;i++){const a=i/seg*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 svNoWalk(()=>prism(mk||'mosaic',pts,yTop-th,yTop,col==null?P(mk||'mosaic'):col));
 if(o.walk!==false)svFloor(pts,yTop);
 return pts;
}

/* Cylindrical drum wall with real cut doorways & windows and polygonal wall collision blocks. */
function raDrumWall(cx,cz,rIn,rOut,y0,h,mk,col,opens,o){
 o=o||{};
 const rm=(rIn+rOut)/2,t=rOut-rIn,c=col==null?P(mk):col;
 const list=(opens||[]).map(q=>{
  const da=Math.min(.6,Math.max(.08,(q.w==null?1.2:q.w)/(2*rm)));
  const am=q.a==null?PI/2:q.a;
  return Object.assign({},q,{am,a0:am-da,a1:am+da,wActual:2*da*rm});
 }).sort((a,b)=>a.a0-b.a0);
 svNoWalk(()=>{
  let cur=0;
  const segArc=(aa,ab,ya,yb)=>{
   if(ab-aa>.01&&yb-ya>.02){
    sector(mk,cx,cz,rIn,rOut,aa,ab,ya,yb,c,Math.max(2,Math.ceil((ab-aa)/(PI/14))));
   }
  };
  for(const q of list){
   if(q.a0>cur+.01)segArc(cur,q.a0,y0+.005,y0+h-.005);
   const wy=q.door?(q.y==null?0:q.y):(q.y==null?1.0:q.y),wh=q.h==null?(q.door?RA.DOOR_H:1.3):q.h;
   if(wy>.03)segArc(q.a0,q.a1,y0+.005,y0+wy);
   if(wy+wh<h-.03)segArc(q.a0,q.a1,y0+wy+wh,y0+h-.005);
   cur=Math.max(cur,q.a1);
  }
  if(TAU>cur+.01)segArc(cur,TAU,y0+.005,y0+h-.005);
 });
 for(const q of list){
  const yaw=Math.atan2(Math.cos(q.am),Math.sin(q.am));
  const mx=cx+Math.cos(q.am)*rm,mz=cz+Math.sin(q.am)*rm;
  const wy=q.door?(q.y==null?0:q.y):(q.y==null?1.0:q.y),wh=q.h==null?(q.door?RA.DOOR_H:1.3):q.h;
  if(q.door){
   raDoor(mx,y0+wy,mz,yaw,q.wActual,wh,Object.assign({t,style:o.style,pediment:false},q));
  }else{
   raWindow(mx,y0+wy,mz,yaw,q.wActual,wh,Object.assign({t,style:o.style},q));
  }
 }
 if(o.block!==false&&h>=.82){
  const nSeg=20;
  for(let i=0;i<nSeg;i++){
   const am=(i+.5)/nSeg*TAU;
   if(list.some(q=>q.door&&am>=q.a0-.06&&am<=q.a1+.06))continue;
   const yaw=Math.atan2(Math.cos(am),Math.sin(am));
   raWallBlock(cx+Math.cos(am)*rm,y0,cz+Math.sin(am)*rm,TAU*rm/nSeg,h,t,yaw);
  }
 }
}

/* Continuous walkable exterior helical ramp around a cylinder (Mandalay-Ziggurat River Watchtower). */
function raSpiralRamp(cx,cz,rInner,wRamp,y0,y1,aStart,sweep,o){
 o=o||{};
 const rise=y1-y0,rOut=rInner+wRamp,rm=(rInner+rOut)/2;
 const n=Math.max(16,Math.ceil(Math.abs(sweep)/(PI/10)));
 const mk=o.mk||'travertine',paraMk=o.paraMk||'cobalt';
 raNoCut(()=>{
  svNoWalk(()=>{
   for(let i=0;i<n;i++){
    const f0=i/n,f1=(i+1)/n,aa=aStart+sweep*f0,ab=aStart+sweep*f1;
    const yt=y0+rise*f1,yb=Math.max(y0,yt-.28);
    sector(mk,cx,cz,rInner+.02,rOut,Math.min(aa,ab),Math.max(aa,ab),yb,yt,P(mk),2);
    /* Outer arcaded parapet along the helical ramp */
    sector(paraMk,cx,cz,rOut-.16,rOut+.04,Math.min(aa,ab),Math.max(aa,ab),yt+.008,yt+.82,P(paraMk),2);
    if(i%2===0){
     const am=(aa+ab)/2,px=cx+Math.cos(am)*(rOut-.06),pz=cz+Math.sin(am)*(rOut-.06);
     cyl('gold',px,yt+.83,pz,.07,.95,P('gold'),8);
    }
   }
  });
  for(let i=0;i<n;i++){
   const f0=i/n,f1=(i+1)/n,aa=aStart+sweep*f0,ab=aStart+sweep*f1;
   raStripWalk([cx+Math.cos(aa)*rm,y0+rise*f0,cz+Math.sin(aa)*rm],[cx+Math.cos(ab)*rm,y0+rise*f1,cz+Math.sin(ab)*rm],Math.max(.85,wRamp-.28));
  }
 });
}
