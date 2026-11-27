// prefix: hk
// ================================================================= HUERU-KURAN ARCHITECTURAL TOOLKIT (HK1 + HK2 + HK3 + HK4)
// Sardinian dry-stone columnar/cyclopean basalt nuraghi & mensoloni corbel crowns (HK1), Santa Cristina inverted-keyhole
// step-wells (HK2), basalt-ringed pelagic whale-rib chise lodges with interlocking turf/peat/bark domes & Jomon kaen-doki
// flame-ceramic chimney crowns (HK3), and sawn emerald-nephrite lintels, Leviathan jawbone arches, gutskin awnings, kelp
// racks & wind-rigged nephrite chimes (HK4). Every interface steps by >= 1.5 cm so zero coplanar triangles overlap.

function hkTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function hkFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2],e[3],e[4]==null?0:e[4],e[5]);
}

function hkOctPts(cx,cz,r,n){
 const k=n==null?12:n,pts=[];
 for(let i=0;i<k;i++){const a=i*TAU/k;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 return pts;
}

/* Convert local W(...) yaw (0=+z, PI/2=+x) to sector() polar angle (0=+x, PI/2=+z) in [0, TAU). */
function hkYawToSector(yaw){
 const a=Math.atan2(Math.cos(yaw||0),Math.sin(yaw||0));
 return ((a%TAU)+TAU)%TAU;
}

/* Emit an annular masonry course [y0..y1] from rIn..rOut subtracting angular doorway/window gaps [{a, half}]. */
function hkCourseSector(mk,cx,cz,rIn,rOut,y0,y1,col,gaps,segK){
 if(y1-y0<.015||rOut-rIn<.02)return;
 if(!gaps||!gaps.length){
  sector(mk,cx,cz,rIn,rOut,0,TAU,y0,y1,col,segK||28);
  return;
 }
 const raw=[];
 for(const g of gaps){
  const a0=((g.a-g.half)%TAU+TAU)%TAU,a1=((g.a+g.half)%TAU+TAU)%TAU;
  if(g.half>=PI-.02)return;
  if(a0<=a1)raw.push([a0,a1]);
  else{raw.push([0,a1]);raw.push([a0,TAU]);}
 }
 raw.sort((p,q)=>p[0]-q[0]);
 const merged=[];
 for(const iv of raw){
  if(!merged.length||iv[0]>merged[merged.length-1][1]+1e-4)merged.push([iv[0],iv[1]]);
  else merged[merged.length-1][1]=Math.max(merged[merged.length-1][1],iv[1]);
 }
 let cur=0;
 for(const iv of merged){
  if(iv[0]-cur>.025){
   const sg=Math.max(3,Math.ceil((iv[0]-cur)/(TAU/(segK||28))));
   sector(mk,cx,cz,rIn,rOut,cur,iv[0],y0,y1,col,sg);
  }
  cur=iv[1];
 }
 if(TAU-cur>.025){
  const sg=Math.max(3,Math.ceil((TAU-cur)/(TAU/(segK||28))));
  sector(mk,cx,cz,rIn,rOut,cur,TAU,y0,y1,col,sg);
 }
}

/* Stepped dark columnar & cyclopean basalt terrace plinth with paved deck at y = h and walkable entrance steps on +z. */
const HK_WKM=new THREE.Matrix4(),HK_WKS=new THREE.Matrix4();
function hkWallBlock(lx,ly,lz,w,h,d){
 if(PLACE_DRY||typeof WKOFF!=='undefined'&&WKOFF||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building'||h<.72)return;
 HK_WKS.makeScale(w,h,d).setPosition(lx,ly+h/2,lz);
 HK_WKM.copy(CM).multiply(HK_WKS);
 KWALKBOX.add(KWALK,HK_WKM.elements,{tag:'wall:'+CURKEY});
}
function hkPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.2,h*.42),h2=Math.max(.08,h-h1-.1),h3=h-h1-h2;
 svNoWalk(()=>{
  box('columnar',0,0,0,w+.42,h1,d+.42,P('columnar'));
  box('basalt',0,h1,0,w+.18,h2,d+.18,P('basalt'));
  box(o.topMk||'paving',0,h1+h2,0,w,h3,d,P(o.topCol||'paving'));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.5:o.stepW,sx=o.stepX==null?0:o.stepX,run=o.stepRun==null?Math.max(.9,h*2.0):o.stepRun;
  const zFoot=d/2+.24+run,zTop=d/2+.24;
  const ns=Math.max(2,Math.ceil(h/HK.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const f0=i/ns,f1=(i+1)/ns,za=lerp(zFoot,zTop,f0),zb=lerp(zFoot,zTop,f1),yh=h*(i+1)/ns,yl=h*i/ns;
    box('ashlar',sx,yl,(za+zb)/2,sw,yh-yl,Math.abs(za-zb),P('ashlar'));
   }
   for(const s of [-1,1]){
    box('columnar',sx+s*(sw/2+.14),0,(zFoot+zTop)/2,.22,h+.16,run+.08,P('columnar'));
   }
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.28],sw);
 }
 return h;
}

/* Signature Sardinian battered doorway spanned by a massive 3-ton sawn emerald-nephrite (jade=200) lintel block over a
   triangular relieving slit, with operable red-cypress & bronze leaf (core/door). */
function hkJadeDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HK.WALL:o.t,lintH=o.lintelH==null?.34:o.lintelH;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Battered basalt ashlar jambs flanking [ -w/2 .. +w/2 ] */
   for(const s of [-1,1]){
    box('ashlar',s*(w/2+.11),0,0,.2,h,t+.1,P('ashlar'));
   }
   /* Massive 3-ton sawn emerald-nephrite monolith lintel block */
   box('nephrite',0,h,0,w+.56,lintH,t+.18,P('nephrite'));
   /* Bronze bearing-plates at lintel ends */
   for(const s of [-1,1])box('bronze',s*(w/2+.18),h-.035,0,.16,.035,t+.14,P('bronze'));
   /* Sardinian triangular relieving slit above the nephrite lintel */
   if(o.relieving!==false){
    const ry0=h+lintH,rh=.34;
    for(const s of [-1,1])box('corbel',s*(w*.34+.08),ry0,0,w*.28,rh,t+.06,P('corbel'));
    box('basalt',0,ry0+rh,0,w+.42,.14,t+.1,P('basalt'));
    svPane(0,ry0+.02,0,0,Math.max(.26,w*.32),rh-.04,{kind:'stained',color:0x34b878,t:.03});
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.04,h-.04,{
    mk:o.leafMk||'cypress',col:o.leafCol==null?P('cypress'):o.leafCol,
    style:o.style||'plank',hwCol:0xa87e42,locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Thin-sawn translucent emerald-nephrite (or sea-green kelp-glass) windowpane in a dressed basalt reveal. */
function hkJadeWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HK.WALL:o.t,isGlass=o.seaglass===true;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('ashlar',0,-.07,0,w+.22,.07,t+.12,P('ashlar'));
   box('nephrite',0,h,0,w+.26,.14,t+.14,P('nephrite'));
   for(const s of [-1,1])box('cypress',s*(w/2-.03),0,0,.06,h,.09,P('cypressD'));
  });
  svPane(0,0,0,0,w-.12,h,{kind:'stained',color:isGlass?0x68c4aa:0x38c27e,t:.03});
  if(o.lit!==false)haloAt(0,h*.5,-.22,isGlass?0x88e4c8:0x5ce8a0,false);
 });
}

/* Projecting Sardinian mensoloni basalt stone corbel-brackets & overhanging parapet ring at top of a nuraghe tower. */
function hkMensoloni(cx,yTop,cz,rTop,o){
 o=o||{};
 const nB=o.n==null?Math.max(12,Math.round(rTop*5.2)):o.n;
 const over=o.over==null?.34:o.over,parH=o.parH==null?.78:o.parH;
 svNoWalk(()=>{
  for(let i=0;i<nB;i++){
   const a=i*TAU/nB,mx=cx+Math.cos(a)*(rTop+.06),mz=cz+Math.sin(a)*(rTop+.06),yaw=PI/2-a;
   W(mx,yTop,mz,yaw,()=>{
    box('corbel',0,0,.04,.22,.14,.28,P('corbel'));
    box('corbel',0,.14,.1,.26,.14,.38,P('corbel'));
   });
  }
  /* Overhanging basalt parapet deck collar & crenellated breastwork */
  sector('ashlar',cx,cz,Math.max(.5,rTop-.72),rTop+over,0,TAU,yTop+.28,yTop+.44,P('ashlar'),28);
  const gaps=o.crenels===false?[]:Array.from({length:Math.max(4,Math.round(nB/3))},(_,k)=>({a:(k+.5)*TAU/Math.max(4,Math.round(nB/3)),half:.12}));
  hkCourseSector('basalt',cx,cz,rTop+over-.38,rTop+over-.02,yTop+.44,yTop+.44+parH,P('basalt'),gaps,28);
 });
 return yTop+.44+parH;
}

/* HK1: Sardinian Dry-Stone Columnar/Cyclopean Basalt Nuraghe Tower (battered truncated cone in stepped courses + interior
   corbelled tholos beehive vault + mensoloni corbel parapet + nephrite-lintel trapezoid doorway). */
function hkNuraghe(cx,cz,y0,rBase,rTop,h,o){
 o=o||{};
 const courses=o.courses==null?Math.max(6,Math.round(h/.85)):o.courses;
 const wallT=o.wallT==null?Math.min(1.45,rBase*.34):o.wallT;
 const doors=o.doors||[],wins=o.windows||[];
 const solidBelow=o.solidBelow==null?0:o.solidBelow;
 W(cx,0,cz,0,()=>{
  /* Walkable interior floor disc if hollow at base */
  if(solidBelow<=.05){
   const rFl=Math.max(.85,rBase-wallT-.02);
   svNoWalk(()=>cyl('paving',0,y0,0,rFl,.06,P('paving'),18));
   svFloor(hkOctPts(0,0,rFl+.06,12),y0+.06);
  }
  /* Stepped battered cyclopean & columnar basalt courses */
  svNoWalk(()=>{
   for(let k=0;k<courses;k++){
    const t0=k/courses,t1=(k+1)/courses;
    const ya=y0+h*t0,yb=y0+h*t1;
    const rOut=hkRigMath.nuragheRadius(rBase,rTop,t0);
    const isSolid=yb<=y0+solidBelow+.02;
    const rIn=isSolid?.18:Math.max(.85,rOut-wallT*(1-.15*t0));
    const gaps=[];
    for(const d of doors){
     const dy0=y0+(d.y==null?0:d.y),dy1=dy0+d.h+(d.lintelH==null?.34:d.lintelH)+(d.relieving===false?0:.48);
     if(yb>dy0+.01&&ya<dy1-.01){
      const rm=0.5*(rIn+rOut);
      gaps.push({a:hkYawToSector(d.yaw),half:Math.asin(Math.min(.92,(d.w/2+.24)/Math.max(1,rm)))});
     }
    }
    for(const w of wins){
     const wy0=y0+w.y-.08,wy1=y0+w.y+w.h+.15;
     if(yb>wy0+.01&&ya<wy1-.01){
      const rm=0.5*(rIn+rOut);
      gaps.push({a:hkYawToSector(w.yaw),half:Math.asin(Math.min(.85,(w.w/2+.16)/Math.max(1,rm)))});
     }
    }
    const mk=k%3===1?'columnar':'basalt';
    hkCourseSector(mk,0,0,rIn,rOut,ya,yb,P(mk),gaps,28);
   }
   /* Interior corbelled tholos beehive vault curving to top oculus */
   if(o.tholos!==false&&h>3.2){
    const yTh0=Math.max(y0+solidBelow+2.4,y0+h*.48),yTh1=y0+h-.04;
    if(yTh1-yTh0>.6){
     const rStart=Math.max(.8,hkRigMath.nuragheRadius(rBase,rTop,(yTh0-y0)/h)-wallT-.06);
     const rOc=Math.max(.42,rTop-wallT*.85);
     const prof=[];
     for(let j=0;j<=6;j++){
      const f=j/6;
      prof.push([lerp(rStart,rOc,Math.pow(f,1.35)),lerp(yTh0,yTh1,f)]);
     }
     lathe('corbel',0,0,prof,20,P('corbel'),{inward:true});
    }
   }
  });
  /* Place sawn emerald-nephrite doorways & windows at exact battered face radius */
  for(const d of doors){
   const dy=y0+(d.y==null?0:d.y),tf=clamp((dy-y0)/Math.max(.1,h),0,1);
   const rFace=hkRigMath.nuragheRadius(rBase,rTop,tf)-wallT*.38;
   const dx=Math.sin(d.yaw||0)*rFace,dz=Math.cos(d.yaw||0)*rFace;
   hkJadeDoor(dx,dy,dz,d.yaw||0,d.w,d.h,Object.assign({t:wallT*.72},d));
   if(d.walkPad!==false){
    W(dx,0,dz,d.yaw||0,()=>wkPad(0,0,d.w+.2,wallT+1.3,dy+(solidBelow<=.05?.06:0)));
   }
  }
  for(const w of wins){
   const wy=y0+w.y,tf=clamp((wy-y0)/Math.max(.1,h),0,1);
   const rFace=hkRigMath.nuragheRadius(rBase,rTop,tf)-wallT*.28;
   hkJadeWindow(Math.sin(w.yaw||0)*rFace,wy,Math.cos(w.yaw||0)*rFace,w.yaw||0,w.w,w.h,{t:wallT*.45,seaglass:w.seaglass});
  }
  if(o.mensoloni!==false)hkMensoloni(0,y0+h,0,rTop,o.mensoloniOpt);
 });
 return y0+h+1.22;
}

/* Sculptural Jomon kaen-doki ("flame-rimmed") ochre-terracotta & verdigris-glazed chimney/kiln crown. */
function hkKaenCrown(cx,y0,cz,r,h,nFins,o){
 o=o||{};
 const nf=nFins==null?4:nFins;
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   cyl('ashlar',0,0,0,r*1.22,.1,P('ashlar'),16);
   /* Flaring cord-marked terracotta neck */
   lathe('kaen',0,0,[[r*.96,.1],[r*.88,.1+h*.38],[r*1.16,.1+h*.78],[r*1.08,.1+h]],16,P('kaen'));
   /* Verdigris-glazed spiral torus band */
   ring('glaze',0,.1+h*.62,0,r*1.08,.055,P('glaze'),0,0,0,16);
   /* Sculptural cockscomb / wave-flame rim projections ("kaen-doki") */
   for(let i=0;i<nf;i++){
    const a=i*TAU/nf;
    W(Math.cos(a)*r*1.12,.1+h*.72,Math.sin(a)*r*1.12,PI/2-a,()=>{
     box('kaen',0,0,0,.1,.38,.24,P('kaen'));
     box('glaze',0,.38,.04,.08,.16,.18,P('glaze'));
     ring('kaen',0,.24,.13,.09,.03,P('kaen'),PI/2,0,0,10);
    });
   }
  });
  if(o.smoke!==false)smokeAt(0,.15+h,0,{r:r*.45,kind:o.smokeKind||'chimney'});
  if(o.halo!==false)haloAt(0,.1+h*.4,0,0xff9a42,false);
 });
 return y0+.1+h+.44;
}

/* HK3: Basalt-Ringed Whale-Rib Chise Lodge with interlocking turf/peat/red-cypress bark dome & Jomon kaen-doki crown. */
function hkChise(cx,cz,y0,rOut,wallT,wallH,domeRise,o){
 o=o||{};
 const doors=o.doors||[{yaw:0,w:1.45,h:2.1}],wins=o.windows||[];
 const nRibs=o.ribs==null?10:o.ribs,rSmoke=o.rSmoke==null?Math.max(.48,rOut*.15):o.rSmoke;
 const rIn=Math.max(1.2,rOut-wallT),courses=Math.max(4,Math.round(wallH/.62));
 W(cx,0,cz,0,()=>{
  /* Interior stone/plank floor disc */
  svNoWalk(()=>cyl(o.floorMk||'floor',0,y0,0,rIn-.02,.06,P(o.floorMk||'floor'),20));
  if(y0<=.05)svFloor(hkOctPts(0,0,rIn+.05,12),y0+.06);

  svNoWalk(()=>{
   /* Battered cyclopean basalt ring-wall courses */
   for(let k=0;k<courses;k++){
    const t0=k/courses,t1=(k+1)/courses,ya=y0+wallH*t0,yb=y0+wallH*t1;
    const ro=rOut-.18*t0,ri=rIn;
    const gaps=[];
    for(const d of doors){
     const dy0=y0+(d.y==null?0:d.y),dy1=dy0+d.h+.75;
     if(yb>dy0+.01&&ya<dy1-.01){
      gaps.push({a:hkYawToSector(d.yaw),half:Math.asin(Math.min(.9,(d.w/2+.24)/((ro+ri)*.5)))});
     }
    }
    for(const w of wins){
     const wy0=y0+w.y-.08,wy1=y0+w.y+w.h+.16;
     if(yb>wy0+.01&&ya<wy1-.01){
      gaps.push({a:hkYawToSector(w.yaw),half:Math.asin(Math.min(.85,(w.w/2+.16)/((ro+ri)*.5)))});
     }
    }
    hkCourseSector(k%2===0?'basalt':'columnar',0,0,ri,ro,ya,yb,P(k%2===0?'basalt':'columnar'),gaps,28);
   }
   /* Red-cypress wall-plate ring atop basalt ring-wall */
   const yPlate=y0+wallH;
   sector('cypress',0,0,rIn-.04,rOut-.16,0,TAU,yPlate,yPlate+.12,P('cypress'),28);

   /* Arching bleached pelagic whale-rib structural vault:
      interior load-bearing ribs + proud exterior crest-ribs lashed to bronze smoke-collar! */
   const ySpring=yPlate+.12,yCrown=ySpring+domeRise;
   const rSpring=(rIn+rOut)*.5-.08;
   for(let i=0;i<nRibs;i++){
    const a=i*TAU/nRibs+(o.ribPhase==null?.22:o.ribPhase);
    const cs=Math.cos(a),sn=Math.sin(a);
    /* Interior structural whale-rib (visible inside & in --cut) */
    tube('whalebone',t=>{
     const p=hkRigMath.whaleRibArc(rIn-.08,ySpring,rSmoke+.04,yCrown-.06,t);
     return [cs*p[0],p[1],sn*p[0]];
    },t=>[.085-.025*t,.13-.035*t],10,6,P('whalebone'),{caps:true});
    /* Proud exterior whale-rib clamping turf & bark courses against gale winds */
    if(i%2===0){
     tube('whalebone',t=>{
      const p=hkRigMath.whaleRibArc(rOut-.14,ySpring+.04,rSmoke+.16,yCrown+.06,t);
      return [cs*(p[0]+.09),p[1]+.07,sn*(p[0]+.09)];
     },t=>[.065-.02*t,.095-.025*t],10,6,P('whaleboneAged'),{caps:true});
    }
   }
   /* Horizontal red-cypress & baleen purlin rings inside the vault */
   for(const f of [.35,.68]){
    const p=hkRigMath.whaleRibArc(rIn-.06,ySpring,rSmoke+.04,yCrown-.06,f);
    ring('cypress',0,p[1],0,p[0],.045,P('cypressD'),0,0,0,20);
   }

   /* Three-zone interlocking dome shell (peat eaves -> red-cypress bark mid -> mossy turf upper dome) + smoky bark interior liner */
   const band=(mk,colK,f0,f1,dr)=>{
    const prof=[];
    for(let j=0;j<=4;j++){
     const f=lerp(f0,f1,j/4),p=hkRigMath.whaleRibArc(rSpring+.12,ySpring,rSmoke+.1,yCrown,f);
     prof.push([p[0]+dr,p[1]]);
    }
    lathe(mk,0,0,prof,24,P(colK));
   };
   band('peat','peat',0,.28,.02);
   band('bark','bark',.28,.58,.035);
   band('turf','turf',.58,1.0,.02);
   {
    const inProf=[];
    for(let j=0;j<=6;j++){
     const f=j/6,p=hkRigMath.whaleRibArc(rSpring+.04,ySpring-.03,rSmoke+.08,yCrown-.04,f);
     inProf.push([p[0],p[1]]);
    }
    lathe('bark',0,0,inProf,24,P('bark'),{inward:true});
   }
   /* Bronze-bound whalebone smoke-ring collar */
   ring('whalebone',0,yCrown+.02,0,rSmoke+.14,.065,P('whalebone'),0,0,0,18);
  });

  /* Place emerald-nephrite doorways & translucent nephrite windows */
  for(const d of doors){
   const dy=y0+(d.y==null?0:d.y),rFace=(rIn+rOut)*.5;
   const dx=Math.sin(d.yaw||0)*rFace,dz=Math.cos(d.yaw||0)*rFace;
   hkJadeDoor(dx,dy,dz,d.yaw||0,d.w,d.h,Object.assign({t:wallT*.68,relieving:d.relieving!==false},d));
   if(y0<=.05)W(dx,0,dz,d.yaw||0,()=>wkPad(0,0,d.w+.25,wallT+1.2,y0+.06));
  }
  for(const w of wins){
   const rFace=(rIn+rOut)*.5;
   hkJadeWindow(Math.sin(w.yaw||0)*rFace,y0+w.y,Math.cos(w.yaw||0)*rFace,w.yaw||0,w.w,w.h,{t:wallT*.45,seaglass:w.seaglass});
  }
  /* Sculptural Jomon kaen-doki flame-ceramic chimney crown atop the smoke-hole */
  hkKaenCrown(0,y0+wallH+.12+domeRise+.04,0,rSmoke+.08,o.crownH==null?.78:o.crownH,o.crownFins==null?4:o.crownFins,{smoke:o.smoke!==false});
 });
 return y0+wallH+domeRise+1.35;
}

/* Straight battered cyclopean-basalt & red-cypress wall from (x0,z0) to (x1,z1), cut cleanly around openings. */
function hkWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?HK.WALL:o.t,soc=o.socle==null?HK.SOCLE:o.socle,mk=o.mk||'basalt',col=o.col==null?P(mk):o.col;
 const L=Math.hypot(x1-x0,z1-z0);if(L<.06)return;
 const yaw=Math.atan2(z0-z1,x1-x0);
 const holes=(o.holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:y0+(q.y==null?0:q.y),y1:y0+(q.y==null?0:q.y)+q.h}));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  const run=(a,b,ya,yb)=>{
   if(b-a<.015||yb-ya<.015)return;
   svNoWalk(()=>{
    const sh=Math.min(yb,y0+soc);
    if(soc>0&&sh>ya)box('columnar',X((a+b)/2),ya,0,b-a,sh-ya,t+.04,P('columnar'));
    const ba=Math.max(ya,y0+soc);
    if(yb>ba)box(mk,X((a+b)/2),ba,0,b-a,yb-ba,t,col);
   });
   hkWallBlock(X((a+b)/2),ya,0,b-a,yb-ya,t);
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
}

/* Rectangular room walls on [x0..x1, z0..z1] with columnar-basalt corner piers so adjacent walls NEVER overlap at corners. */
function hkWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?HK.WALL:o.t,pw=t+.08,hp=pw/2+.008,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||'columnar';
 for(const cx of [x0,x1])for(const cz of [z0,z1]){
  svNoWalk(()=>{
   box('ashlar',cx,y0,cz,pw+.04,Math.min(.48,h*.22),pw+.04,P('ashlar'));
   box(postMk,cx,y0+Math.min(.48,h*.22),cz,pw,h-Math.min(.48,h*.22),pw,P(postMk));
  });
  hkWallBlock(cx,y0,cz,pw,h,pw);
 }
 const shift=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 if(skip.indexOf('s')<0)hkWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shift(H.s,hp)}));
 if(skip.indexOf('n')<0)hkWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shift(H.n,hp)}));
 if(skip.indexOf('e')<0)hkWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shift(H.e,hp)}));
 if(skip.indexOf('w')<0)hkWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shift(H.w,hp)}));
 svNoWalk(()=>{
  const cw=x1-x0+pw+.1,cd=z1-z0+pw+.1;
  box('cypress',(x0+x1)/2,y0+h,z0,cw,.13,.18,P('cypress'));
  box('cypress',(x0+x1)/2,y0+h,z1,cw,.13,.18,P('cypress'));
  for(const sx of [x0,x1])box('cypressD' in SVPAL?'cypress':'wood',sx,y0+h+.13,(z0+z1)/2,.18,.11,cd,P('cypressD'));
 });
}

/* Heavy red-cypress & turf/bark hipped roof with proud whalebone ridge-ribs and optional Jomon kaen-doki smoke-crown. */
function hkTurfRoof(cx,y0,cz,w,d,rise,o){
 o=o||{};
 const mk=o.mk||'turf',col=o.col==null?P(mk):o.col,over=o.over==null?.52:o.over;
 const W0=w+over*2,D0=d+over*2,hw=W0/2,hd=D0/2,alongX=W0>=D0,ridge=Math.max(.25,Math.abs(W0-D0)*.45);
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   box('bark',0,0,0,W0-.06,.12,D0-.06,P('bark'));
   const yB=.12,yT=.12+rise;
   const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
   const P0=alongX?[-ridge,yT,0]:[0,yT,-ridge],Q0=alongX?[ridge,yT,0]:[0,yT,ridge];
   if(alongX){
    poly(mk,[D,C,Q0,P0],col);poly(mk,[B,A,P0,Q0],col);
    poly(mk,[A,D,P0],col);poly(mk,[C,B,Q0],col);
    beam('whalebone',[-ridge-.14,yT+.06,0],[ridge+.14,yT+.06,0],.09,P('whalebone'),true,8);
   }else{
    poly(mk,[A,D,Q0,P0],col);poly(mk,[C,B,P0,Q0],col);
    poly(mk,[D,C,Q0],col);poly(mk,[B,A,P0],col);
    beam('whalebone',[0,yT+.06,-ridge-.14],[0,yT+.06,ridge+.14],.09,P('whalebone'),true,8);
   }
   /* Crossed whalebone gable horns at ridge ends */
   for(const p of [P0,Q0]){
    cone('whalebone',p[0],yT+.1,p[2],.1,.34,P('whalebone'),8);
   }
   if(o.kaen){
    hkKaenCrown(0,yT+.08,0,.38,.62,4,{smoke:o.smoke!==false});
   }
  });
 });
 return y0+.12+rise+(o.kaen?.95:.46);
}

/* Wind-rigged translucent oiled whale-gutskin awning over [x0..x1, z0..z1], supported by driftwood/whalebone corner posts.
   Strictly 0.0 drift at all 4 corner bronze/bone rings (hkRigMath.cornerPin). */
function hkGutskinAwning(x0,z0,x1,z1,yFoot,yTop,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2,hd=d/2;
 const sag=o.sag==null?.32:o.sag,amp=o.amp==null?.22:o.amp,mk=o.mk||'gutskin';
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   if(o.posts!==false){
    for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
     cyl('basalt',sx,yFoot,sz,.14,.16,P('basaltD'),10);
     cyl('driftwood',sx,yFoot+.16,sz,.075,yTop-yFoot-.16,P('driftwood'),10);
     ring('bronze',sx,yTop,sz,.075,.02,P('bronze'),0,0,0,10);
    }
   }
   sagRope('rope',[-hw,yTop,-hd],[hw,yTop,-hd],sag*.3,.014,P('rope'),8);
   sagRope('rope',[-hw,yTop,hd],[hw,yTop,hd],sag*.3,.014,P('rope'),8);
   sagRope('rope',[-hw,yTop,-hd],[-hw,yTop,hd],sag*.3,.014,P('rope'),8);
   sagRope('rope',[hw,yTop,-hd],[hw,yTop,hd],sag*.3,.014,P('rope'),8);
   withCloth((lp,out)=>{
    const u=clamp((lp.x+hw)/Math.max(.1,w),0,1),v=clamp((lp.z+hd)/Math.max(.1,d),0,1);
    const pw=hkRigMath.cornerPin(u,v)*amp;
    out.set(pw*.18,pw,pw*.22);
   },()=>{
    psurf(mk,(u,v)=>{
     const x=(u-.5)*w,z=(v-.5)*d;
     const cat=4*u*(1-u)*.55+4*v*(1-v)*.45;
     const rib=0.03*Math.sin(u*4*PI)*Math.sin(PI*v);
     return [x,yTop-sag*cat+rib,z];
    },12,10,P(mk==='hide'?'hide':'gutskin'));
   });
  });
 });
}

/* Wind-rigged drying giant-kelp curtain, braided whale-net, or Whale-Clan applique banner hung from a red-cypress crossbar. */
function hkWindHanging(x,yFoot,z,yaw,span,h,o){
 o=o||{};
 const mk=o.mk||'kelp',nPanels=o.panels==null?3:o.panels,drop=o.drop==null?h-.38:o.drop;
 W(x,yFoot,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-span/2,span/2]){
    box('basalt',sx,0,0,.22,.16,.24,P('basaltD'));
    cyl('cypress',sx,.16,0,.065,h-.16,P('cypress'),8);
   }
   beam('whalebone',[-span/2-.12,h,0],[span/2+.12,h,0],.06,P('whalebone'),true,8);
   const pw0=(span-.24)/nPanels;
   for(let i=0;i<nPanels;i++){
    const px=-span/2+.12+pw0*(i+.5),wPan=pw0*.86,yTop=h-.08;
    withCloth((lp,out)=>{
     const v=clamp((yTop-lp.y)/Math.max(.1,drop),0,1);
     const pw=hkRigMath.hangPin(v)*(o.amp==null?.28:o.amp);
     out.set(pw*.25,0,pw);
    },()=>{
     psurf(mk,(u,v)=>[px+(u-.5)*wPan,yTop-v*drop,.02*Math.sin(PI*u)*v],4,10,P(mk));
    });
   }
  });
 });
}

/* Wind-rigged Tuned Emerald-Nephrite Chime Array (chime in SV_CLOTH): thin-sawn emerald-nephrite slabs hung from a bronze
   & whalebone crossbar, swaying deterministically with ATMOS.U.wind while 0.0 drift at their top suspension cords! */
function hkNephriteChimes(x,yTop,z,yaw,span,drop,nSlabs,o){
 o=o||{};
 const n=nSlabs==null?5:nSlabs;
 W(x,0,z,yaw||0,()=>{
  svNoWalk(()=>{
   beam('whalebone',[-span/2-.1,yTop,0],[span/2+.1,yTop,0],.055,P('whalebone'),true,8);
   for(const sx of [-span/2,span/2])ring('bronze',sx,yTop,0,.07,.02,P('bronze'),0,PI/2,0,10);
   for(let i=0;i<n;i++){
    const f=n===1?.5:i/(n-1),sx=(f-.5)*(span-.22);
    const len=drop*(.72+.28*(1-Math.abs(2*f-1))),wSlab=Math.min(.18,span/(n*1.55));
    const yCord=yTop-.14;
    pole('rope',[sx,yTop-.02,0],[sx,yCord,0],.009,P('rope'),5);
    withCloth((lp,out)=>{
     const v=clamp((yCord-lp.y)/Math.max(.1,len),0,1);
     const pw=hkRigMath.chimePin(v)*.22;
     out.set(pw*.3,0,pw);
    },()=>{
     psurf('chime',(u,v)=>[sx+(u-.5)*wSlab,yCord-v*len,0],2,6,i%2===0?P('chime'):P('nephriteBright'));
    });
   }
  });
 });
}

/* Monumental Bleached Leviathan Whale-Jawbone Arch set in hexagonal columnar-basalt sockets with bronze apex lashing
   and suspended tuned nephrite storm-chimes. */
function hkWhaleJawArch(x,y0,z,yaw,span,h,o){
 o=o||{};
 W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    cyl('columnar',s*span/2,0,0,.42,.48,P('columnar'),6);
    tube('whalebone',t=>{
     const xx=s*span/2*(1-Math.pow(t,1.18))+.18*s*Math.sin(PI*t);
     const yy=.42+(h-.42)*Math.sin(.5*PI*t);
     const zz=.24*Math.sin(PI*t);
     return [xx,yy,zz];
    },t=>[.18-.08*t,.26-.11*t],14,8,P('whalebone'),{caps:true});
   }
   /* Bronze apex collar & suspended emerald-nephrite storm-chimes */
   cyl('bronze',0,h-.12,.04,.22,.24,P('bronze'),10);
   hkNephriteChimes(0,h-.24,.04,0,Math.min(1.6,span*.36),Math.min(1.35,h*.32),3);
  });
 });
}

/* Aleut/Kuril-style bifid-bow oiled sea-beast hide & whalebone baidarka / umiak skin-boat. */
function hkBaidarka(x,y0,z,yaw,len,o){
 o=o||{};
 const hw=len*.13,hh=len*.085;
 W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Oiled hide hull prism + whalebone gunwales & thwarts + bifid bow cleft */
   prism('pelt',[[-hw*.35,-len*.48],[hw*.35,-len*.48],[hw,0],[hw*.32,len*.48],[-hw*.32,len*.48],[-hw,0]],0,hh,P('hide'));
   for(const s of [-1,1]){
    beam('whalebone',[s*hw*.34,hh+.02,-len*.48],[s*hw*.98,hh+.03,0],.035,P('whalebone'),true,6);
    beam('whalebone',[s*hw*.98,hh+.03,0],[s*hw*.22,hh+.18,len*.54],.035,P('whalebone'),true,6);
   }
   /* Characteristic Aleut bifid cleft lower jaw at +z bow */
   beam('whalebone',[0,.04,len*.42],[0,.08,len*.56],.032,P('whalebone'),true,6);
   for(const f of [-.22,0,.22]){
    cyl('baleen',0,hh+.01,len*f,hw*.62,.04,P('baleen'),10);
   }
  });
 });
}
