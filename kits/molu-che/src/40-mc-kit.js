// prefix: mc
// ================================================================= MOLU-CHE SUNKEN DIKENGYUAN, YAODONG VAULT, RAMP & WALK TOOLKIT
// Shared architectural & walkability foundation for Bench Clans ('dikengyuan') and Bonded Strong-Vaults ('bonduwe').
// Invariants enforced by construction:
//   1. All earth-bank walls, stone/brick arches, Cucuteni friezes, parapets, vent hoods, way-stones and props run inside
//      svNoWalk(() => ...) so KWALKBOX never registers unbridged curb, sill or parapet floors.
//   2. Full-height wall blockers (h >= 0.85 m) are registered explicitly via mcWallBlock, leaving clean gaps for graded
//      Talpathere entry ramps, stairs, and operable core/door portals.
//   3. Every material layer steps by >= 0.025 m (2.5 cm) and jambs/lintels sit cleanly inside cut wall openings so
//      world-space coplanar triangle overlap (zfightAudit) is strictly zero.

const mcTmpM=new THREE.Matrix4(),mcTmpS=new THREE.Vector3();

function mcNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}

function mcBelowGrade(fn){const keepSB=SB;SB=null;try{mcNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

function mcTarget(x,y,z,name,indoor){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor',indoor:indoor!==false});
}

function mcRoom(x0,z0,x1,z1,y0,h,o){
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

function mcFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.012,e[3],e[4]==null?0:e[4],e[5]);
}

function mcWallBlock(lx,ly,lz,w,h,d,ry){
 if(PLACE_DRY||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const bh=Math.max(.84,h);
 mcTmpM.copy(CM).multiply(TF(lx,ly+bh/2,lz,ry==null?0:ry));
 mcTmpM.scale(mcTmpS.set(Math.max(.14,w),bh,Math.max(.14,d)));
 KWALKBOX.add(KWALK,mcTmpM.elements,{tag:'wall:'+CURKEY});
}

function mcFloorSlab(cx,yTop,cz,w,d,o){
 o=o||{};
 const th=o.th==null?.2:o.th,mk=o.mk||'paving',col=o.col==null?P(mk):o.col;
 if(o.hole){
  svWell(mk,cx,yTop-th,cz,w,th,d,col,o.hole,{walk:o.walk!==false});
 }else{
  svNoWalk(()=>box(mk,cx,yTop-th,cz,w,th,d,col));
  if(o.walk!==false)wkPad(cx,cz,w,d,yTop);
 }
 return yTop;
}

/* Vaulted/coffered chalk-white limewash & kilnbrick rib interior ceiling directly beneath the yBench loess terrace. */
function mcCeilingSlab(cx,yCeil,cz,w,d,o){
 o=o||{};
 if(w<.3||d<.3)return;
 const mk=o.mk||'limewash',col=o.col==null?P(mk):o.col;
 const ribMk=o.ribMk||'kilnbrick',ribCol=o.ribCol==null?P(ribMk):o.ribCol;
 svNoWalk(()=>{
  box(mk,cx,yCeil,cz,w,.09,d,col);
  const alongX=w>=d;
  const nRib=Math.max(2,Math.min(5,Math.round((alongX?w:d)/2.8)));
  for(let i=1;i<nRib;i++){
   if(alongX){
    const xx=cx-w/2+w*i/nRib;
    box(ribMk,xx,yCeil-.055,cz,.12,.05,d-.24,ribCol);
   }else{
    const zz=cz-d/2+d*i/nRib;
    box(ribMk,cx,yCeil-.055,zz,w-.24,.05,.12,ribCol);
   }
  }
 });
}

function mcStripWalk(a,b,w){
 if(!svWalkOn())return;
 const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY;
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);
 if(L<1e-4)return;
 const ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[-.25,-w/2],[.65,-w/2],[.65,w/2],[-.25,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});
}

/* Unified sunken courtyard & sub-bank ground pad at yCourt with a 7.0 m deep below-grade loess skirt for Moleshelf slopes. */
function mcBasePad(cx,cz,w,d,yCourt,o){
 o=o||{};
 const yc=yCourt==null?.38:yCourt;
 const curbMk=o.curbMk||(o.style==='bonduwe'?'basalt':'dolomite'),curbCol=P(curbMk);
 const mk=o.mk||'paving';
 mcBelowGrade(()=>{
  box('loess',cx,-7.0,cz,w+.56,6.97,d+.56,P('loess'));
 });
 mcNoCut(()=>svNoWalk(()=>{
  box(curbMk,cx,.015,cz,w+.32,Math.max(.08,yc-.055),d+.32,curbCol);
 }));
 mcNoCut(()=>{
  mcFloorSlab(cx,yc,cz,w,d,{mk,th:Math.max(.1,yc-.02),walk:o.walk!==false});
 });
 return yc;
}

/* Graded brick-and-cobble Talpathere caravan entry ramp climbing from (x0, y0, z0) to (x1, y1, z1) with retaining cheeks & hitching rings. */
function mcEntryRamp(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(Math.abs(rise)<.04||run<.3)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(4,Math.ceil(Math.abs(rise)/.07));
 const mk=o.mk||'cobble',col=P(mk);
 const cheekMk=o.cheekMk||(o.style==='bonduwe'?'dolomite':'kilnbrick'),cheekCol=P(cheekMk);
 const capMk=o.style==='bonduwe'?'basalt':'dolomite',capCol=P(capMk);
 const yMin=Math.min(y0,y1);
 mcNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    for(let i=0;i<ns;i++){
     const f0=i/ns,f1=(i+1)/ns,za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const yt=Math.max(yMin+.04,lerp(y0,y1,(f0+f1)/2));
     box(mk,0,yMin+.018,(za+zb)/2,w-.06,Math.max(.04,yt-yMin-.018),Math.abs(zb-za)-.008,col);
    }
    if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.16);
      for(let k=0;k<3;k++){
       const fk0=k/3,fk1=(k+1)/3,zk=lerp(-run/2,run/2,(fk0+fk1)/2);
       const yk=Math.max(y0,y1)+.46-.12*(2-k);
       box(cheekMk,sx,yMin+.018,zk,.26,yk-yMin-.018,run/3-.015,cheekCol);
       box(capMk,sx,yk,zk,.3,.065,run/3+.01,capCol);
      }
      /* Bronze Talpathere trace hitching bollard at ramp mouth */
      cyl('bronze',sx,Math.max(y0,y1)+.525,-run/2+.28,.075,.2,P('bronze'),8);
     }
    }
   });
  });
  mcStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(1.1,w-.24));
  const ux=dx/run,uz=dz/run;
  wkPad(x0-ux*.38,z0-uz*.38,Math.max(1.2,w),Math.max(1.2,w),y0);
  wkPad(x1+ux*.38,z1+uz*.38,Math.max(1.2,w),Math.max(1.2,w),y1);
 });
}

/* Exterior or sunken-courtyard stone/brick stair climbing from (x0, y0, z0) up onto the walkable yBench loess terrace. */
function mcStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(rise<.05||run<.25)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(2,Math.ceil(rise/MC.RISER));
 const mk=o.mk||(o.style==='bonduwe'?'dolomite':'kilnbrick'),col=P(mk);
 const sideMk=o.sideMk||'loess',sideCol=P(sideMk);
 const capMk=o.style==='bonduwe'?'basalt':'dolomite',capCol=P(capMk);
 mcNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    for(let i=0;i<ns;i++){
     const f0=i/ns,f1=(i+1)/ns,za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const yt=y0+rise*f1,yb=o.openUnder?Math.max(y0+.02,yt-.24):y0+.02;
     box(mk,0,yb,(za+zb)/2,w-.05,Math.max(.06,yt-yb),Math.abs(zb-za)-.006,col);
    }
    if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.15);
      for(let k=0;k<3;k++){
       const fk0=k/3,fk1=(k+1)/3,zk=lerp(-run/2,run/2,(fk0+fk1)/2),yk=y0+rise*fk1+.28;
       const cb=o.openUnder?y0+rise*fk0+.02:y0+.02,ch=Math.max(.18,yk-cb);
       box(sideMk,sx,cb,zk,.22,ch,run/3-.015,sideCol);
       box(capMk,sx,cb+ch,zk,.26,.06,run/3+.01,capCol);
      }
     }
    }
   });
  });
  mcStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(.96,w-.2));
  const ux=dx/run,uz=dz/run;
  wkPad(x0-ux*.38,z0-uz*.38,Math.max(1.15,w),Math.max(1.15,w),y0);
  wkPad(x1+ux*.38,z1+uz*.38,Math.max(1.15,w),Math.max(1.15,w),y1);
 });
}

/* Sculpted Yaodong / Bonduwe Arched Portal set cleanly inside a cut wall opening of width w and height (hDoor + archH).
   Features dressed dolomite/kilnbrick piers & semicircular voussoir arch, recessed chalk-white limewash tympanum,
   carved dark-cedar radial lattice lunette (or sealed Claw-and-Salt Compact bullion medallion), and operable svLeaf. */
function mcYaodongPortal(x,y,z,yaw,w,hDoor,o){
 o=o||{};
 const t=o.t==null?MC.WALL:o.t,archH=o.archH==null?.72:o.archH,hOpen=hDoor+archH;
 const pierMk=o.pierMk||(o.style==='bonduwe'?'dolomite':'kilnbrick'),pierCol=P(pierMk);
 const leafMk=o.leafMk||(o.style==='bonduwe'?'iron':'cedar'),leafCol=P(leafMk);
 const wIn=Math.max(.95,w-.36);
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Jamb piers inside [-w/2 .. +w/2], proud of wall thickness t by +0.08 m */
   for(const s of [-1,1]){
    box('basalt',s*(w/2-.09),0,0,.18,.22,t+.1,P('basalt'));
    box(pierMk,s*(w/2-.09),.22,0,.18,hOpen-.22,t+.08,pierCol);
   }
   /* Carved dark-cedar transom lintel at hDoor */
   box('darkcedar',0,hDoor,0,wIn,.11,t+.11,P('darkcedar'));
   /* Recessed chalk-white limewash arch tympanum (t - 0.08, recessed 4 cm inside loess wall!) */
   box('limewash',0,hDoor+.11,0,wIn,archH-.11,Math.max(.14,t-.08),P('limewash'));
   /* Proud semicircular voussoir arch stones on courtyard face (+z = t/2 + 0.055) */
   const rV=wIn*.42,zV=t/2+.055;
   for(let i=0;i<5;i++){
    const am=PI*(i+.5)/5;
    const vx=Math.cos(am)*rV*.82,vy=hDoor+.18+Math.sin(am)*(archH-.24);
    box(pierMk,vx,vy,zV,.22,.14,.06,pierCol);
   }
   if(o.sealed){
    /* Sealed Bonduwe Strong-Vault tympanum: Kulanewa valge-vask & tin-bronze Claw-and-Salt Compact seal */
    box('basalt',0,hDoor+.2,0,wIn*.58,archH-.3,t-.02,P('basalt'));
    cyl('nickel',0,hDoor+archH*.54,t/2+.02,.15,.035,P('nickel'),10);
    cyl('bronze',0,hDoor+archH*.54,t/2+.058,.08,.03,P('bronze'),8);
   }else{
    /* Radial dark-cedar lattice mullions inside lunette */
    const hLun=Math.max(.26,archH-.28),yLun=hDoor+.14;
    box('darkcedar',0,yLun,0,.05,hLun,t-.02,P('darkcedar'));
    for(const sx of [-wIn*.18,wIn*.18]){
     box('carvedwood',sx,yLun,0,.045,hLun*.88,t-.02,P('carvedwood'));
    }
   }
  });
  if(!o.sealed){
   const wLun=wIn*.62,hLun=Math.max(.26,archH-.28);
   svPane(0,hDoor+.14,0,0,wLun,hLun,{kind:'lit',t:.02});
   windowAt(0,hDoor+.14,t/2,0,wLun,hLun,hDoor+.14);
  }
  if(o.open!==true){
   svLeaf(0,.02,0,0,wIn-.05,hDoor-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'banded',hwCol:o.style==='bonduwe'?0xdce2e8:0xa67c3e,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'yaodong-door'
   });
  }
  door(0,0,t/2,0,wIn,hDoor);
  if(o.walkPad!==false)wkPad(0,0,wIn+.34,t+1.24,0);
 });
}

/* Recessed limewash & carved dark-cedar lattice Yaodong window set cleanly inside a cut wall opening [w x h]. */
function mcWindowLunette(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?MC.WALL:o.t;
 const trimMk=o.style==='bonduwe'?'dolomite':'kilnbrick',trimCol=P(trimMk);
 const wIn=Math.max(.45,w-.28),hGlass=Math.max(.35,h-.38);
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   box(trimMk,0,0,0,w,.1,t+.1,trimCol);
   for(const s of [-1,1])box(trimMk,s*(w/2-.07),.1,0,.14,h-.22,t+.08,trimCol);
   box(trimMk,0,h-.12,0,w,.12,t+.1,trimCol);
   box('limewash',0,h-.28,0,wIn,.16,Math.max(.14,t-.08),P('limewash'));
   box('darkcedar',0,.1,0,.05,hGlass,t-.02,P('darkcedar'));
   box('carvedwood',0,.1+hGlass*.5,0,wIn,.045,t-.02,P('carvedwood'));
  });
  svPane(0,.1,0,0,wIn-.04,hGlass-.02,{kind:o.kind||'lit',t:.02});
  windowAt(0,.1,t/2,0,wIn,hGlass,o.sill==null?1.0:o.sill);
 });
}

/* Painted Mapuche-Cucuteni geometric stepped-diamond mineral frieze along the upper brow of a loess/stone wall. */
function mcCucuteniFrieze(L,yFrieze,fh,t,style){
 if(L<.9||fh<.14)return;
 const backMk=style==='bonduwe'?'dolomite':'ochre',backCol=P(backMk);
 const borderMk='ironred',borderCol=P(borderMk);
 const diaMk='indigo',diaCol=P(diaMk),altCol=P('limewash');
 svNoWalk(()=>{
  box(backMk,0,yFrieze,0,L-.08,fh,t+.05,backCol);
  box(borderMk,0,yFrieze,0,L-.06,.042,t+.09,borderCol);
  box(borderMk,0,yFrieze+fh-.042,0,L-.06,.042,t+.09,borderCol);
  const nD=Math.max(2,Math.min(12,Math.floor((L-.4)/.95)));
  for(let i=0;i<nD;i++){
   const xx=lerp(-(L-.6)/2,(L-.6)/2,nD===1?.5:i/(nD-1));
   const isAlt=i%2===1;
   box(isAlt?'limewash':diaMk,xx,yFrieze+fh*.26,0,.32,fh*.48,t+.125,isAlt?altCol:diaCol);
   box(isAlt?diaMk:'ochre',xx,yFrieze+fh*.36,0,.16,fh*.28,t+.155,isAlt?diaCol:P('ochre'));
  }
 });
}

/* Straight Molu-Che compacted loess, rammed-earth or ashlar wall segment with cut Yaodong portals, lunettes, Cucuteni frieze & wall blockers. */
function mcWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.1)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?MC.WALL:o.t;
 const soc=o.socle==null?MC.SOCLE:o.socle;
 const socMk=o.socMk||(o.style==='bonduwe'?'basalt':'dolomite'),socCol=P(socMk);
 const mk=o.mk||(o.style==='bonduwe'?'rammed':'loess'),col=o.col==null?P(mk):o.col;
 const holes=(o.holes||[]).map(q=>{
  const hDoor=q.h==null?(q.door?MC.DOOR_H:1.28):q.h;
  const archH=q.door?(q.archH==null?.72:q.archH):0;
  const wy=q.y==null?(q.door?0:.96):q.y;
  const wh=hDoor+archH;
  return Object.assign({},q,{a:q.at-q.w/2,b:q.at+q.w/2,wy,hDoor,archH,wh,y0:y0+wy,y1:y0+wy+wh});
 });
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  svNoWalk(()=>{
   const run=(a,b,ya,yb)=>{
    if(b-a<.02||yb-ya<.02)return;
    const yS=Math.min(yb,y0+soc);
    if(soc>0&&yS>ya)box(socMk,X((a+b)/2),ya,0,b-a,yS-ya,t+.055,socCol);
    const yB0=Math.max(ya,y0+soc);
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
  /* Painted Mapuche-Cucuteni mineral frieze along the upper brow above portals */
  const maxHoleTop=holes.reduce((mx,q)=>Math.max(mx,q.wy+q.wh),0);
  if(o.frieze!==false&&h-maxHoleTop>=.38){
   mcCucuteniFrieze(L,y0+h-.34,.24,t,o.style);
  }
  for(const q of holes){
   if(q.draw===false)continue;
   if(q.door){
    mcYaodongPortal(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.hDoor,Object.assign({t,style:o.style,archH:q.archH},q));
   }else{
    mcWindowLunette(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style,sill:q.wy},q));
   }
  }
  if(o.block!==false&&h>=.84){
   const dSpans=holes.filter(q=>q.door).map(q=>[Math.max(0,q.a+.18),Math.min(L,q.b-.18)]).sort((a,b)=>a[0]-b[0]);
   let cur=0;
   for(const sp of dSpans){
    if(sp[0]-cur>.16)mcWallBlock(X((cur+sp[0])/2),y0,0,sp[0]-cur,h,t,0);
    cur=Math.max(cur,sp[1]);
   }
   if(L-cur>.16)mcWallBlock(X((cur+L)/2),y0,0,L-cur,h,t,0);
  }
 });
}

/* Rectangular Molu-Che loess/stone wall enclosure [x0..x1, z0..z1] with battered corner quoins and CURREC.rooms recording. */
function mcWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?MC.WALL:o.t;
 const pw=t+.08,hp=pw/2+.015,H=o.holes||{},skip=o.skip||'';
 const quoinMk=o.quoinMk||(o.style==='bonduwe'?'dolomite':'kilnbrick'),quoinCol=P(quoinMk);
 const baseMk=o.style==='bonduwe'?'basalt':'dolomite',baseCol=P(baseMk);
 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.42,h*.2);
   box(baseMk,cx,y0,cz,pw+.04,sh,pw+.04,baseCol);
   box(quoinMk,cx,y0+sh,cz,pw,h-sh,pw,quoinCol);
  }
  if(o.plate!==false){
   const plateMk=o.style==='bonduwe'?'dolomite':'kilnbrick',plateCol=P(plateMk);
   box(plateMk,(x0+x1)/2,y0+h,z1,x1-x0+pw+.04,.09,pw+.04,plateCol);
   box(plateMk,(x0+x1)/2,y0+h,z0,x1-x0+pw+.04,.09,pw+.04,plateCol);
   box(plateMk,x0,y0+h,(z0+z1)/2,pw+.04,.09,z1-z0-pw-.08,plateCol);
   box(plateMk,x1,y0+h,(z0+z1)/2,pw+.04,.09,z1-z0-pw-.08,plateCol);
  }
 });
 if(o.block!==false&&h>=.84){
  for(const cx of [x0,x1])for(const cz of [z0,z1])mcWallBlock(cx,y0,cz,pw,h,pw,0);
 }
 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 if(skip.indexOf('s')<0)mcWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shiftPos(H.s,x0+hp)}));
 if(skip.indexOf('n')<0)mcWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shiftRev(H.n,x1-hp)}));
 if(skip.indexOf('e')<0)mcWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shiftRev(H.e,z1-hp)}));
 if(skip.indexOf('w')<0)mcWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shiftPos(H.w,z0+hp)}));
 mcRoom(x0,z0,x1,z1,y0,h,o);
}

/* Fired-brick or dressed-dolomite sky-well & roof-terrace safety parapet (strictly svNoWalk & non-blocking by default). */
function mcSkywellRim(x0,z0,x1,z1,yBench,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.45)return;
 const yaw=Math.atan2(z0-z1,x1-x0),h=o.h==null?.76:o.h,t=o.t==null?.24:o.t;
 const bodyMk=o.mk||(o.style==='bonduwe'?'dolomite':'kilnbrick'),bodyCol=P(bodyMk);
 const capMk=o.capMk||(o.style==='bonduwe'?'basalt':'dolomite'),capCol=P(capMk);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   const spans=o.skipMid?[[-L/2,-o.skipMid],[o.skipMid,L/2]]:[[-L/2,L/2]];
   for(const [sa,sb] of spans){
    const sl=sb-sa;if(sl<.25)continue;
    const sc=(sa+sb)/2;
    box(bodyMk,sc,yBench+.025,0,sl,.16,t,bodyCol);
    /* Open brick/stone lattice piers along the sky-well rim for steppe wind & courtyard sightlines */
    const nP=Math.max(2,Math.round(sl/.95)+1);
    for(let i=0;i<nP;i++){
     const px=lerp(sa+.12,sb-.12,nP===1?.5:i/(nP-1));
     box(bodyMk,px,yBench+.185,0,.22,h-.27,t-.02,bodyCol);
    }
    box(capMk,sc,yBench+h-.085,0,sl+.04,.085,t+.06,capCol);
   }
  });
  if(o.block)mcWallBlock(0,yBench,0,L,h,.22,0);
 });
}

/* Complete hollowed Yaodong / Bonduwe Loess Vault-Bank Wing [x0..x1, z0..z1] rising from y0 to yBench = y0 + hBank:
   - Interior floor finish (optional o.floorMk at y0 + 0.025 .. y0 + 0.06)
   - Full-height loess/rammed/ashlar walls with sculpted Yaodong portals, lunettes, Cucuteni friezes & CURREC.rooms
   - Solid vaulted/coffered limewash ceiling at yBench - 0.35 (0 sky leaks!)
   - Walkable compacted-loess / stone upper roof-terrace at yBench + optional sky-well rims */
function mcVaultWing(x0,z0,x1,z1,y0,hBank,o){
 o=o||{};
 const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
 const t=o.t==null?MC.WALL:o.t,yBench=y0+hBank,hWall=hBank-.38;
 if(o.floorMk){
  const fw=w-t*2-.24,fd=d-t*2-.24;
  if(fw>.4&&fd>.4)svNoWalk(()=>box(o.floorMk,cx,y0+.025,cz,fw,.035,fd,P(o.floorMk)));
 }
 mcWallRing(x0,z0,x1,z1,y0+.028,hWall,o);
 mcCeilingSlab(cx,yBench-.35,cz,w-.34,d-.34,{mk:o.ceilMk||'limewash',ribMk:o.style==='bonduwe'?'dolomite':'kilnbrick'});
 const topMk=o.topMk||(o.style==='bonduwe'?'paving':'loess');
 mcFloorSlab(cx,yBench,cz,w,d,{mk:topMk,th:.22,walk:o.walkTop!==false});
 const rims=o.rims||'',ins=.22;
 if(rims.indexOf('s')>=0)mcSkywellRim(x0+ins,z1-ins,x1-ins,z1-ins,yBench,{style:o.style,skipMid:o.gapS});
 if(rims.indexOf('n')>=0)mcSkywellRim(x1-ins,z0+ins,x0+ins,z0+ins,yBench,{style:o.style,skipMid:o.gapN});
 if(rims.indexOf('e')>=0)mcSkywellRim(x1-ins,z1-ins*2,x1-ins,z0+ins*2,yBench,{style:o.style,skipMid:o.gapE});
 if(rims.indexOf('w')>=0)mcSkywellRim(x0+ins,z0+ins*2,x0+ins,z1-ins*2,yBench,{style:o.style,skipMid:o.gapW});
 return yBench;
}

/* Seamless expansion-joint stone bridge & walk pad linking adjacent mcVaultWing roof-terraces at yBench (zero coplanar faces). */
function mcTerraceLink(cx,cz,yBench,w,d,o){
 o=o||{};
 const mk=o.mk||'dolomite';
 svNoWalk(()=>{
  box(mk,cx,yBench-.19,cz,w-.08,.16,d-.08,P(mk));
 });
 wkPad(cx,cz,Math.max(1.4,w),Math.max(1.4,d),yBench);
}

/* Bracketed dark-cedar & dolomite sunken-arcade shelter gallery (open to KWALK, block: false). */
function mcArcadeColonnade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.5)return;
 const n=o.n==null?Math.max(2,Math.round(L/3.2)+1):o.n;
 const pw=.24,entH=.32,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 const trimMk=o.style==='bonduwe'?'nickel':'bronze';
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   for(let i=0;i<n;i++){
    const xx=((n===1?.5:i/(n-1))-.5)*L;
    if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
    box('dolomite',xx,y0+.02,0,pw*1.5,.18,pw*1.5,P('dolomite'));
    box('darkcedar',xx,y0+.2,0,pw,colH-.34,pw,P('darkcedar'));
    box('carvedwood',xx,y0+colH-.14,0,pw*1.9,.14,pw*1.35,P('carvedwood'));
   }
   box('darkcedar',0,y0+colH,0,L+pw*1.8,entH*.6,pw*1.6,P('darkcedar'));
   box(trimMk,0,y0+colH+entH*.6,0,L+pw*1.95,entH*.16,pw*1.75,P(trimMk));
   box('carvedwood',0,y0+colH+entH*.76,0,L+pw*2.1,entH*.24,pw*1.9,P('carvedwood'));
  });
 });
}

/* Hydraulic-limewash & dolomite sunken rain-cistern or karst seep-channel (strictly svNoWalk; supports CURREC.river). */
function mcWaterPool(cx,cz,w,d,yRim,depth,o){
 o=o||{};
 const dep=depth==null?.55:depth,curbW=.3;
 const curbMk=o.curbMk||'dolomite',curbCol=P(curbMk);
 mcNoCut(()=>svNoWalk(()=>{
  box('limewash',cx,yRim-dep-.08,cz,w-.06,.08,d-.06,P('limewash'));
  for(const sz of [-d/2+curbW/2,d/2-curbW/2])box(curbMk,cx,yRim-dep+.02,cz+sz,w,dep+.08,curbW,curbCol);
  for(const sx of [-w/2+curbW/2,w/2-curbW/2])box(curbMk,cx+sx,yRim-dep+.02,cz,curbW,dep+.08,d-curbW*2-.04,curbCol);
  if(!o.river&&o.waterMesh!==false){
   box('water',cx,yRim-.14,cz,w-curbW*2-.08,.09,d-curbW*2-.08,P('water'));
  }
 }));
 if(o.river&&CURREC&&!PLACE_DRY){
  const alongX=o.river.axis==='x'||(o.river.axis!=='z'&&w>=d);
  const wy=yRim-.1;
  const localPts=alongX
   ?[[-w/2+.38,wy,cz],[0,wy,cz],[w/2-.38,wy,cz]]
   :[[cx,wy,-d/2+.38],[cx,wy,0],[cx,wy,d/2-.38]];
  if(o.river.flip)localPts.reverse();
  const wPts=localPts.map(q=>{
   const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
   return [v.x,v.z,v.y];
  });
  const spanW=alongX?Math.max(1.0,d-curbW*2-.18):Math.max(1.0,w-curbW*2-.18);
  CURREC.river={name:o.river.name||CURKEY+'-seep',pts:wPts,width:o.river.width==null?spanW:o.river.width,speed:o.river.speed==null?.36:o.river.speed};
 }
}
