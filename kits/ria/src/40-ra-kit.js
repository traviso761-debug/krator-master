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

/* Stage 7 KROOMLIGHT room volume recorder in local coordinates -> world-space box [wx0, wy0, wz0, wx1, wy1, wz1] on CURREC.rooms. */
function raRoom(x0,z0,x1,z1,y0,h,o){
 if(PLACE_DRY||!CURREC||CURREC.cls!=='building')return null;
 o=o||{};
 if(o.room===false||h<1.8)return null;
 const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9],v=new THREE.Vector3();
 for(const lx of [x0,x1])for(const ly of [y0,y0+h])for(const lz of [z0,z1]){
  v.set(lx,ly,lz).applyMatrix4(CM);
  if(v.x<mn[0])mn[0]=v.x;if(v.y<mn[1])mn[1]=v.y;if(v.z<mn[2])mn[2]=v.z;
  if(v.x>mx[0])mx[0]=v.x;if(v.y>mx[1])mx[1]=v.y;if(v.z>mx[2])mx[2]=v.z;
 }
 const list=CURREC.rooms||(CURREC.rooms=[]);
 const rm={
  id:(CURREC.tid||CURKEY)+'.rm'+(list.length+1),
  site:CURKEY,
  box:[+mn[0].toFixed(3),+mn[1].toFixed(3),+mn[2].toFixed(3),+mx[0].toFixed(3),+mx[1].toFixed(3),+mx[2].toFixed(3)],
  outdoor:!!o.outdoor,
  vault:!!o.vault,
  skylight:!!o.skylight
 };
 list.push(rm);
 return rm;
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
 raRoom(x0,z0,x1,z1,y0,h,o);
}

/* Single Classical fluted, Egyptian palm/lotus, Persepolitan protome, Minoan, or Solomonic spiral column from y0 to y0+h. */
function raColumn(x,y0,z,h,o){
 o=o||{};
 const r=o.r==null?.26:o.r,upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'travertine'),col=o.col==null?P(mk):o.col;
 const baseMk=o.baseMk||(upper?'porphyry':'cobalt'),baseCol=P(baseMk);
 const capMk=o.capMk||(upper?'silver':'gold'),capCol=P(capMk);
 const capKind=o.capital||'lotus';
 svNoWalk(()=>{
  box(baseMk,x,y0+.012,z,r*2.5,.18,r*2.5,baseCol);
  cyl(mk,x,y0+.192,z,r*1.16,.1,col,12);
  const capRes=capKind==='protome'?.76:(capKind==='palm'?.66:.62);
  const shH=Math.max(.3,h-capRes);
  const rBot=o.taper==='minoan'?r*.82:r,rTop=o.taper==='minoan'?r*1.06:r*.88;
  cyl(mk,x,y0+.292,z,rBot,shH,col,14,rTop,true);
  if(o.bandMk){
   cyl(o.bandMk,x,y0+.292+shH*.48,z,Math.max(rBot,rTop)+.024,.12,P(o.bandMk),14);
  }
  if(o.spiral){
   /* Cosmatesque / Solomonic helical mosaic-and-gold spiral bands ascending the shaft */
   const spMk=o.spiralMk||(upper?'porphyry':'cobalt'),spCol=P(spMk);
   const turns=10;
   for(let i=0;i<turns;i++){
    const f0=i/turns,f1=(i+1)/turns,a0=f0*TAU*1.5,a1=f1*TAU*1.5;
    const rr0=lerp(rBot,rTop,f0)+.028,rr1=lerp(rBot,rTop,f1)+.028;
    const ya=y0+.33+shH*.88*f0,yb=y0+.33+shH*.88*f1;
    beam(i%2===0?'gold':spMk,[x+Math.cos(a0)*rr0,ya,z+Math.sin(a0)*rr0],[x+Math.cos(a1)*rr1,yb,z+Math.sin(a1)*rr1],.034,i%2===0?P('gold'):spCol,true,6);
   }
  }
  const yCap=y0+.292+shH;
  if(capKind==='palm'){
   /* Egyptian flaring green palm-frond bell capital + gold necking rings + stone abacus */
   const pMk=o.palmMk||'emerald',pCol=P(pMk);
   cyl('gold',x,yCap,z,rTop*1.04,.055,P('gold'),12);
   cyl(pMk,x,yCap+.055,z,rTop*.98,.2,pCol,12,r*1.56);
   for(let k=0;k<8;k++){
    const a=k/8*TAU;
    W(x+Math.cos(a)*(r*1.32),yCap+.14,z+Math.sin(a)*(r*1.32),-a+PI/2,()=>{
     box('gold',0,0,0,.05,.12,.14,P('gold'));
    });
   }
   box(capMk,x,yCap+.255,z,r*2.78,Math.max(.08,h-(yCap-y0+.255)),r*2.78,capCol);
  }else if(capKind==='protome'){
   /* Achaemenid Persepolitan turquoise-and-gold double-protome bracket capital */
   cyl('cobalt',x,yCap,z,rTop*1.12,.12,P('cobalt'),12);
   cyl('gold',x,yCap+.12,z,rTop*1.18,.07,P('gold'),12);
   W(x,yCap+.19,z,o.protomeYaw||0,()=>{
    box('cobalt',0,0,0,r*2.1,.14,r*3.5,P('cobalt'));
    for(const sz of [-1,1]){
     box('gold',0,.04,sz*r*1.45,r*1.55,.2,r*1.05,P('gold'));
     cone('gold',0,.24,sz*r*1.72,r*.42,.18,P('gold'),6);
    }
    box(capMk,0,.2,0,r*2.55,Math.max(.08,h-(yCap-y0+.39)),r*3.85,capCol);
   });
  }else{
   /* Classical / Egyptian lotus-bell capital + abacus */
   cyl(capMk,x,yCap,z,rTop*1.04,.06,capCol,12);
   cyl(mk,x,yCap+.06,z,rTop*1.02,.16,col,12,r*1.38);
   box(capMk,x,yCap+.22,z,r*2.65,Math.max(.08,h-(yCap-y0+.22)),r*2.65,capCol);
  }
 });
 if(o.block!==false&&h>=1.2)raWallBlock(x,y0,z,r*2.1,h,r*2.1,0);
}

/* Linear Classical/Egyptian/Persepolitan colonnade from (x0,z0) to (x1,z1) with 3-part entablature. */
function raColonnade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0),n=o.n==null?Math.max(2,Math.round(L/RA.BAY)+1):o.n;
 const r=o.r==null?.25:o.r,entH=o.entH==null?.48:o.entH,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 const upper=o.style==='upper-ria';
 const entMk=o.entMk||(upper?'dolomite':'travertine'),entCol=P(entMk);
 const friezeMk=o.friezeMk||(upper?'porphyry':'cobalt'),friezeCol=P(friezeMk);
 const dentMk=o.dentMk||(upper?'silver':'gold'),dentCol=P(dentMk);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<n;i++){
   const f=n===1?.5:i/(n-1),xx=(f-.5)*L;
   if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
   const cMk=o.altMk&&i%2===1?o.altMk:o.mk;
   raColumn(xx,y0,0,colH,Object.assign({},o,{mk:cMk,r,protomeYaw:PI/2}));
  }
  svNoWalk(()=>{
   box(entMk,0,y0+colH,0,L+r*2.7,entH*.38,r*2.45,entCol);
   box(friezeMk,0,y0+colH+entH*.38,0,L+r*2.82,entH*.32,r*2.58,friezeCol);
   box(dentMk,0,y0+colH+entH*.7,0,L+r*2.94,entH*.1,r*2.7,dentCol);
   box(entMk,0,y0+colH+entH*.8,0,L+r*3.12,entH*.2,r*2.92,entCol);
  });
 });
}

/* Stepped 3-stage Babylonian / Persepolitan crow-step merlon battlements from (x0,z0) to (x1,z1) at base y0. */
function raMerlonParapet(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.35)return;
 const yaw=Math.atan2(z0-z1,x1-x0),upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'porphyry':'cobalt'),col=P(mk);
 const bandMk=o.bandMk||(upper?'dolomite':'saffron'),bandCol=P(bandMk);
 const capMk=o.capMk||(upper?'silver':'gold'),capCol=P(capMk);
 const t=o.t==null?.28:o.t,baseH=o.baseH==null?.32:o.baseH,mPitch=o.pitch==null?1.08:o.pitch;
 const nM=Math.max(1,Math.floor((L-.12)/mPitch));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   box(mk,0,y0+.008,0,L,baseH*.76,t,col);
   box(bandMk,0,y0+.008+baseH*.76,0,L+.03,baseH*.24,t+.03,bandCol);
   const yM=y0+.008+baseH;
   for(let i=0;i<nM;i++){
    const xx=nM===1?0:lerp(-L/2+.46,L/2-.46,i/(nM-1));
    if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
    box(mk,xx,yM,0,.76,.22,t-.02,col);
    box(mk,xx,yM+.22,0,.5,.2,t-.04,col);
    box(capMk,xx,yM+.42,0,.24,.18,t-.06,capCol);
   }
  });
  if(o.block)raWallBlock(0,y0,0,L,.92,t,0);
 });
}

/* Classical Greco-Roman turned-stone balustrade with pedestals and moulded coping from (x0,z0) to (x1,z1). */
function raClassicalBalustrade(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.35)return;
 const yaw=Math.atan2(z0-z1,x1-x0),upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'travertine'),col=P(mk);
 const trimMk=o.trimMk||(upper?'porphyry':'gold'),trimCol=P(trimMk);
 const h=o.h==null?.88:o.h,t=o.t==null?.24:o.t;
 const nB=Math.max(2,Math.floor((L-.5)/.44));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   box(mk,0,y0+.008,0,L,.14,t,col);
   for(let i=0;i<nB;i++){
    const xx=lerp(-L/2+.28,L/2-.28,i/(nB-1));
    if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
    cyl(mk,xx,y0+.148,0,.068,h-.29,col,8,.052);
   }
   box(mk,0,y0+h-.142,0,L+.03,.1,t+.03,col);
   box(trimMk,0,y0+h-.042,0,L+.05,.042,t+.05,trimCol);
   for(const sx of [-L/2+.14,L/2-.14]){
    box(mk,sx,y0+.008,0,.32,h+.04,t+.08,col);
   }
  });
  if(o.block)raWallBlock(0,y0,0,L,h,t,0);
 });
}

/* Flat Near-Eastern Ziggurat / Minoan-Roman Stone Terrace Roof with indoor coffered ceiling underneath,
   cavetto/dentil cornice, perimeter merlon battlements OR Classical balustrade, and optional Hanging-Garden beds. */
function raFlatTerraceRoof(cx,y0,cz,w,d,o){
 o=o||{};
 const upper=o.style==='upper-ria',deckH=o.deckH==null?.36:o.deckH;
 const mk=o.mk||(upper?'dolomite':'travertine'),col=P(mk);
 const topMk=o.topMk||(upper?'paving':'mosaic'),topCol=P(topMk);
 const soffitMk=o.soffitMk||(upper?'dolomite':'teak'),trimMk=o.trimMk||(upper?'silver':'gold');
 if(o.ceiling!==false){
  raCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.18),Math.max(.4,d-.18),{mk:soffitMk,trimMk});
 }
 const yTop=y0+.12+deckH;
 svNoWalk(()=>{
  box(mk,cx,y0+.12,cz,w+.08,deckH*.36,d+.08,col);
  box(trimMk,cx,y0+.12+deckH*.36,cz,w+.18,deckH*.22,d+.18,P(trimMk));
  box(mk,cx,y0+.12+deckH*.58,cz,w+.32,deckH*.42,d+.32,col);
  if(!o.walk)box(topMk,cx,yTop,cz,w-.06,.05,d-.06,topCol);
 });
 if(o.walk)raFloorSlab(cx,yTop+.05,cz,w-.06,d-.06,{mk:topMk,th:.05});
 const yPar=yTop+.05,skip=o.skip||'',par=o.parapet==null?(upper?'balustrade':'merlon'):o.parapet;
 const hw=w/2-.16,hd=d/2-.16,pFn=par==='merlon'?raMerlonParapet:raClassicalBalustrade;
 const pOpts=Object.assign({style:o.style,mk:o.parMk,bandMk:o.bandMk,capMk:o.capMk,block:!!o.walk},o.parOpts||{});
 if(par!=='none'){
  if(skip.indexOf('s')<0)pFn(cx-hw,cz+hd,cx+hw,cz+hd,yPar,Object.assign({},pOpts,{skipMid:o.gapS}));
  if(skip.indexOf('n')<0)pFn(cx+hw,cz-hd,cx-hw,cz-hd,yPar,Object.assign({},pOpts,{skipMid:o.gapN}));
  if(skip.indexOf('e')<0)pFn(cx+hw,cz+hd-.28,cx+hw,cz-hd+.28,yPar,Object.assign({},pOpts,{skipMid:o.gapE}));
  if(skip.indexOf('w')<0)pFn(cx-hw,cz-hd+.28,cx-hw,cz+hd-.28,yPar,Object.assign({},pOpts,{skipMid:o.gapW}));
 }
 if(o.garden&&w>3.6&&d>3.6){
  /* Babylonian Hanging-Garden terraced stone planter beds with lush foliage & blossoms */
  svNoWalk(()=>{
   const gw=Math.min(w-2.2,4.6),gd=Math.min(d-2.2,4.6);
   box('emerald',cx,yPar+.008,cz,gw,.28,gd,P('emerald'));
   box('travertine',cx,yPar+.288,cz,gw+.1,.07,gd+.1,P('travertine'));
   for(const gx of [-gw*.28,gw*.28])for(const gz of [-gd*.28,gd*.28]){
    ellip('lotus',cx+gx,yPar+.54,cz+gz,.68,.44,.68,P('lotusLeaf'),0,10);
    cone('silk',cx+gx,yPar+.86,cz+gz,.18,.24,P('lotusGold'),7);
   }
  });
 }
 return yPar;
}

/* Monumental Babylonian Glazed-Brick Round-Arch Ishtar Portal with twin crenellated gate-buttresses. */
function raIshtarPortal(cx,y0,cz,yaw,wOpen,hOpen,o){
 o=o||{};
 const bw=o.buttW==null?1.45:o.buttW,d=o.d==null?1.15:o.d,hTot=o.hTot==null?hOpen+2.35:o.hTot;
 const mk=o.mk||'cobalt',bandMk=o.bandMk||'saffron',accMk=o.accMk||'emerald';
 const archR=wOpen*.5,totW=wOpen+bw*2;
 W(cx,y0,cz,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    const bx=s*(wOpen/2+bw/2);
    box('travertine',bx,.01,0,bw+.08,.38,d+.08,P('travertine'));
    box(mk,bx,.39,0,bw,hTot-.72,d,P(mk));
    /* Glazed relief panels on front & rear faces of each Ishtar gate tower */
    for(const sz of [-1,1]){
     box(bandMk,bx,1.15,sz*(d/2+.03),bw*.58,1.55,.045,P(bandMk));
     box(accMk,bx,3.05,sz*(d/2+.03),bw*.58,1.15,.045,P(accMk));
    }
    box('gold',bx,hTot-.33,0,bw+.08,.12,d+.08,P('gold'));
    box(mk,bx,hTot-.21,0,bw+.04,.21,d+.04,P(mk));
   }
   /* Spandrel masonry above round arch + radial gold & emerald voussoir blocks */
   const ySp0=hOpen+archR*.62;
   box(mk,0,ySp0,0,wOpen+.04,hTot-.33-ySp0,d-.06,P(mk));
   for(const s of [-1,1]){
    box(mk,s*(archR*.68),hOpen,0,archR*.64,ySp0-hOpen,d-.08,P(mk));
   }
   const nV=7;
   for(let i=0;i<nV;i++){
    const a=lerp(.18,PI-.18,i/(nV-1)),vx=Math.cos(a)*(archR*.88),vy=hOpen+Math.sin(a)*(archR*.62);
    box(i%2===0?'gold':accMk,vx,vy-.12,0,.22,.26,d+.05,P(i%2===0?'gold':accMk));
   }
   /* Polychrome rosette frieze + top Babylonian crow-step merlon crown across full Ishtar portal */
   box(bandMk,0,hTot-.56,0,totW+.06,.22,d+.06,P(bandMk));
  });
  raMerlonParapet(-totW/2+.08,d/2-.16,totW/2-.08,d/2-.16,hTot,{mk,bandMk,capMk:'gold',pitch:.96});
  raMerlonParapet(totW/2-.08,-d/2+.16,-totW/2+.08,-d/2+.16,hTot,{mk,bandMk,capMk:'gold',pitch:.96});
  if(o.block!==false){
   for(const s of [-1,1])raWallBlock(s*(wOpen/2+bw/2),0,0,bw,hTot,d,0);
  }
 });
 return y0+hTot+.62;
}

/* Classical Greco-Roman Triangular Temple Pediment with dentil frieze, recessed relief tympanum, and hybrid acroteria. */
function raClassicalPediment(cx,y0,cz,yaw,w,hPed,d,o){
 o=o||{};
 const upper=o.style==='upper-ria';
 const mk=o.mk||(upper?'dolomite':'travertine'),col=P(mk);
 const tymMk=o.tymMk||(upper?'porphyry':'cobalt'),tymCol=P(tymMk);
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const hw=w/2,hd=d/2,dentY=.22;
 W(cx,y0,cz,yaw||0,()=>{
  svNoWalk(()=>{
   /* Horizontal Classical cornice + dentil row */
   box(mk,0,0,0,w+.24,.14,d+.2,col);
   const nD=Math.max(4,Math.floor(w/.42));
   for(let i=0;i<nD;i++){
    const dx=lerp(-hw+.16,hw-.16,i/(nD-1));
    box(trimMk,dx,.14,hd+.08,.16,.08,.12,trimCol);
    box(trimMk,dx,.14,-hd-.08,.16,.08,.12,trimCol);
   }
   box(mk,0,dentY,0,w+.38,.12,d+.32,col);
   const yB=dentY+.12,yT=yB+hPed;
   /* Pitched stone roof planes + recessed colored stone tympanums (inset behind raking cornices -> 0 z-fight!) */
   const A=[-hw-.14,yB,-hd-.1],B=[hw+.14,yB,-hd-.1],C=[hw+.14,yB,hd+.1],D=[-hw-.14,yB,hd+.1];
   const PN=[0,yT,-hd-.1],PS=[0,yT,hd+.1];
   poly(o.roofMk||mk,[A,D,PS,PN],P(o.roofMk||mk));
   poly(o.roofMk||mk,[C,B,PN,PS],P(o.roofMk||mk));
   /* Recessed colored stone tympanum + central gilded medallion */
   poly(tymMk,[[-hw-.08,yB+.01,hd-.02],[hw+.08,yB+.01,hd-.02],[0,yT-.04,hd-.02]],tymCol,true);
   poly(tymMk,[[hw+.08,yB+.01,-hd+.02],[-hw-.08,yB+.01,-hd+.02],[0,yT-.04,-hd+.02]],tymCol,true);
   cyl(trimMk,0,yB+hPed*.26,hd+.03,Math.min(.42,hPed*.26),.05,trimCol,12,Math.min(.42,hPed*.26),false);
   /* Moulded raking cornices + apex & corner acroteria */
   for(const sz of [-1,1]){
    const zz=sz*(hd+.13);
    beam(mk,[-hw-.18,yB,zz],[0,yT+.05,zz],.1,col,false);
    beam(mk,[hw+.18,yB,zz],[0,yT+.05,zz],.1,col,false);
   }
   if(o.acroteria!=='none'){
    raSwanFinial(0,yT+.06,hd+.1,0,.78,upper);
    for(const sx of [-1,1])raSwanFinial(sx*(hw+.12),yB+.02,hd+.1,sx>0?PI/2:-PI/2,.48,upper);
   }
  });
 });
 return y0+dentY+.12+hPed;
}

/* Semicircular Classical Beaux-Arts / Roman Exedra Curved Peristyle Colonnade with curved entablature & attic balustrade. */
function raCurvedColonnade(cx,cz,r,a0,a1,y0,h,nCols,o){
 o=o||{};
 const upper=o.style==='upper-ria',rCol=o.r==null?.24:o.r,entH=o.entH==null?.52:o.entH,colH=h-entH;
 const mk=o.mk||(upper?'dolomite':'travertine'),col=P(mk);
 const friezeMk=o.friezeMk||(upper?'porphyry':'cobalt'),friezeCol=P(friezeMk);
 const trimMk=o.trimMk||(upper?'silver':'gold'),trimCol=P(trimMk);
 const seg=Math.max(8,Math.ceil(Math.abs(a1-a0)/(PI/16)));
 const aa=Math.min(a0,a1),ab=Math.max(a0,a1);
 for(let i=0;i<nCols;i++){
  const f=nCols===1?.5:i/(nCols-1),a=lerp(a0,a1,f);
  raColumn(cx+Math.cos(a)*r,y0,cz+Math.sin(a)*r,colH,{
   style:o.style,mk:o.altMk&&i%2===1?o.altMk:mk,capMk:trimMk,baseMk:friezeMk,r:rCol,capital:o.capital,block:o.block!==false
  });
 }
 svNoWalk(()=>{
  /* Curved 3-tier Classical entablature + attic balustrade */
  sector(mk,cx,cz,r-.36,r+.36,aa,ab,y0+colH,y0+colH+entH*.38,col,seg);
  sector(friezeMk,cx,cz,r-.39,r+.39,aa,ab,y0+colH+entH*.38,y0+colH+entH*.7,friezeCol,seg);
  sector(trimMk,cx,cz,r-.42,r+.42,aa,ab,y0+colH+entH*.7,y0+colH+entH*.8,trimCol,seg);
  sector(mk,cx,cz,r-.48,r+.48,aa,ab,y0+colH+entH*.8,y0+h,col,seg);
  if(o.attic!==false){
   sector(mk,cx,cz,r-.3,r+.3,aa,ab,y0+h+.008,y0+h+.2,col,seg);
   for(let i=0;i<nCols*2-1;i++){
    const a=lerp(aa+.04,ab-.04,i/Math.max(1,nCols*2-2));
    cyl(mk,cx+Math.cos(a)*r,y0+h+.208,cz+Math.sin(a)*r,.075,.42,col,8);
   }
   sector(mk,cx,cz,r-.34,r+.34,aa,ab,y0+h+.628,y0+h+.76,col,seg);
  }
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
 raRoom(cx-rIn,cz-rIn,cx+rIn,cz+rIn,y0,h,o);
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
