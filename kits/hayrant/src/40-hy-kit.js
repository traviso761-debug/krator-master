// prefix: hy
// ================================================================= HAYRANT VASSAL ARCHITECTURAL TOOLKIT (PLAN.md §3-§7)
// Synthesizes three layers across wealth/civic tiers with zero coplanar triangle overlap (>= 1.2 cm interface steps):
//   1. Western Outer Wall Bench Vernacular: horizontal loess cliff-bank yaodong vaults (never open-sky dikengyuan pits),
//      megabreccia retaining batters, fur-larch & century-puya cruck-rib roofs, braided garlic/jujube eaves & Hayrant plaid.
//   2. Hueru-Kuran Cousin Heritage: Sardinian concave-battered cyclopean/columnar basalt nuraghi, mensoloni stone corbels,
//      Santa Cristina inverted-keyhole spring/seismic chime step-wells, Jomon kaen-doki flame-ceramic crowns, and prized
//      cross-pass 3-ton Crookshore emerald-nephrite lintels & Leviathan whale-jawbone arches.
//   3. Eternal State Suzerain Stamp: stepped Deco-Gothic pier bundles rising out of nuraghe bastions, steep snow-shedding
//      celadon hex-hips, celadon-glazed kaen-doki crowns, dual alabaster + emerald-nephrite lancets/oculi, bilingual
//      logograph + sound-mark boards, and closed-eye ancestor statuary (reading kits/eternian/src/42-et-head.js in place).

const HY_WKM=new THREE.Matrix4(),HY_WKS=new THREE.Matrix4();

function hyTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function hyFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.005,e[3],e[4]==null?0:e[4],e[5]);
}

function hyOctPts(cx,cz,r,n){
 const k=n==null?12:n,pts=[];
 for(let i=0;i<k;i++){const a=i*TAU/k;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 return pts;
}

function hyYawToSector(yaw){
 const a=Math.atan2(Math.cos(yaw||0),Math.sin(yaw||0));
 return ((a%TAU)+TAU)%TAU;
}

function hyWallBlock(lx,ly,lz,w,h,d){
 if(PLACE_DRY||typeof WKOFF!=='undefined'&&WKOFF||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building'||h<.72)return;
 HY_WKS.makeScale(w,h,d).setPosition(lx,ly+h/2,lz);
 HY_WKM.copy(CM).multiply(HY_WKS);
 KWALKBOX.add(KWALK,HY_WKM.elements,{tag:'wall:'+CURKEY});
}

/* Annular masonry course [y0..y1] from rIn..rOut subtracting angular doorway/window gaps [{a, half}]. */
function hyCourseSector(mk,cx,cz,rIn,rOut,y0,y1,col,gaps,segK){
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

/* Stepped megabreccia/basalt/ashlar plinth with paved deck at y = h and walkable entrance stair on +z (inside plot). */
function hyPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.22,h*.44),h2=Math.max(.08,h-h1-.09),h3=h-h1-h2;
 const baseMk=o.baseMk||'megabreccia',midMk=o.midMk||'basalt',topMk=o.topMk||'paving';
 svNoWalk(()=>{
  box(baseMk,0,0,0,w+.38,h1,d+.38,P(baseMk));
  box(midMk,0,h1,0,w+.16,h2,d+.16,P(midMk));
  box(topMk,0,h1+h2,0,w,h3,d,P(o.topCol||topMk));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.4:o.stepW,sx=o.stepX==null?0:o.stepX,run=o.stepRun==null?Math.max(.78,h*1.85):o.stepRun;
  const zFoot=d/2+.2+run,zTop=d/2+.2;
  const ns=Math.max(2,Math.ceil(h/HY.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const f0=i/ns,f1=(i+1)/ns,za=lerp(zFoot,zTop,f0),zb=lerp(zFoot,zTop,f1),yh=h*(i+1)/ns,yl=h*i/ns;
    box('ashlar',sx,yl,(za+zb)/2,sw,yh-yl,Math.abs(za-zb),P('ashlar'));
   }
   for(const s of [-1,1]){
    box('columnar',sx+s*(sw/2+.13),0,(zFoot+zTop)/2,.2,h+.14,run+.06,P('columnar'));
   }
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.28],sw);
 }
 return h;
}

/* Highland closed-eye ancestor door mask or niche head (calls read-in-place 42-et-head.js & records on CURREC.heads).
   Supports carved nephrite, basalt, kaen terracotta, lead, gunmetal, bronze, silver, and gold. */
function hyDoorMask(x,y,z,yaw,s,mk){
 const mat=mk||'kaen';
 const col=mat==='gold'&&KIT_HAS('gold')?new THREE.Color(1,1,1):P(mat==='nephrite'?'nephrite':mat==='lead'?'lead':mat==='bronze'?'bronze':mat==='basalt'?'ashlar':'kaen');
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Subtle Ainu-inspired larch/bronze backing plaque stepped 2 cm clear of wall */
   box('larch',0,0,.02,s*1.12,s*1.16,.03,P('larchD'));
   const p=etHeadParams(etSeedAt(0,0,.06,7),{mask:true,eyes:'closed'});
   etEmitGeo(mat,etHeadGeo(p),0,-s*.46,.07,[s*.9,s,s*.58],0,col);
  });
  if(CURREC&&!PLACE_DRY)(CURREC.heads=CURREC.heads||[]).push({kind:'mask',metal:mat,eyes:'closed',veiled:false});
 });
}

function hyAncestorHead(x,y,z,yaw,h,o){
 o=o||{};
 const mat=o.mk||'bronze',eyes=o.eyes==='open'?'open':'closed';
 const col=mat==='gold'&&KIT_HAS('gold')?new THREE.Color(1,1,1):P(mat==='nephrite'?'nephrite':mat==='basalt'?'ashlar':mat);
 W(x,y,z,yaw||0,()=>{
  let yy=0;
  svNoWalk(()=>{
   if(o.plinth){
    box('ashlar',0,0,0,h*.72,o.plinth,h*.72,P('ashlar'));
    yy+=o.plinth;
   }
   const p=etHeadParams(o.seed==null?etSeedAt(0,yy,0,11):o.seed,{eyes,headdress:o.veiled?'none':o.headdress});
   etEmitGeo(mat,etHeadGeo(p),0,yy+h*.16,0,[h*.92,h,h*.92],0,col);
   if(o.veiled){
    etEmitGeo('bronze',etVeilGeo({seed:etSeedAt(0,yy,0,13)}),0,yy+h*.16,0,[h*.96,h,h*.96],0,new THREE.Color(P('bronze')).multiplyScalar(.66));
   }
  });
  if(CURREC&&!PLACE_DRY)(CURREC.heads=CURREC.heads||[]).push({kind:'head',metal:mat,eyes:o.veiled?'veiled':eyes,veiled:!!o.veiled});
 });
}

function hyAncestorFigure(x,y,z,yaw,h,o){
 o=o||{};
 const mat=o.mk||'bronze',pose=o.pose||'stand',eyes=o.eyes==='open'?'open':'closed';
 const col=mat==='gold'&&KIT_HAS('gold')?new THREE.Color(1,1,1):P(mat==='nephrite'?'nephrite':mat==='basalt'?'ashlar':mat);
 W(x,y,z,yaw||0,()=>{
  let yy=0;
  svNoWalk(()=>{
   if(o.plinth){
    box('ashlar',0,0,0,h*.58,o.plinth*.6,h*.48,P('ashlar'));
    box('corbel',0,o.plinth*.6,0,h*.48,o.plinth*.4,h*.4,P('corbel'));
    yy+=o.plinth;
   }
   const G=etFigureGeo({pose,seed:o.seed==null?etSeedAt(0,yy,0,17):o.seed,eyes,headdress:o.headdress,spread:o.spread});
   etEmitGeo(mat,G,0,yy,0,h,0,col);
  });
  if(CURREC&&!PLACE_DRY)(CURREC.heads=CURREC.heads||[]).push({kind:'figure',metal:mat,eyes,pose,veiled:false});
 });
}

/* Hayrant Doorway: battered ashlar/larch jambs + choice of lintel ('nephrite' 3-ton cousin block, 'larch' timber,
   or 'civic' twin-ancestor bronze/nephrite portal) + Sardinian relieving slit + mandatory Eternian closed-eye door mask! */
function hyDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HY.WALL:o.t,lintMk=o.lintel||'nephrite',lintH=o.lintelH==null?.32:o.lintelH;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('ashlar',s*(w/2+.11),0,0,.2,h,t+.1,P('ashlar'));
   }
   if(lintMk==='civic'){
    /* Eternian-Hayrant suzerain portal: twin closed-eye ancestors holding up a sawn nephrite & bronze lintel */
    box('nephrite',0,h,0,w+1.28,lintH+.08,t+.24,P('nephrite'));
    box('bronze',0,h+lintH+.08,0,w+1.02,.12,t+.28,P('bronze'));
    for(const s of [-1,1]){
     const fx=s*(w/2+.44),fh=Math.max(1.25,h-.38);
     hyAncestorFigure(fx,0,t/2+.22,0,fh,{pose:'lintel',mk:o.ancestorMk||'bronze',plinth:.34,spread:.3});
    }
   }else{
    box(lintMk,0,h,0,w+.54,lintH,t+.18,P(lintMk));
    if(lintMk==='nephrite'){
     for(const s of [-1,1])box('bronze',s*(w/2+.18),h-.032,0,.15,.032,t+.14,P('bronze'));
    }
    if(o.relieving!==false){
     const ry0=h+lintH,rh=.3;
     for(const s of [-1,1])box('corbel',s*(w*.34+.08),ry0,0,w*.28,rh,t+.06,P('corbel'));
     box('basalt',0,ry0+rh,0,w+.42,.13,t+.1,P('basalt'));
     svPane(0,ry0+.02,0,0,Math.max(.24,w*.3),rh-.04,{kind:'stained',color:0x36b878,t:.03});
    }
   }
   if(o.mask!==false&&lintMk!=='civic'){
    const my=h+lintH+(o.relieving===false?.28:.72);
    hyDoorMask(0,my,t/2+.06,0,o.maskSize==null?.42:o.maskSize,o.maskMk||'kaen');
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.04,h-.04,{
    mk:o.leafMk||(lintMk==='civic'?'bronze':'larch'),
    col:o.leafCol==null?P(lintMk==='civic'?'bronze':'larch'):o.leafCol,
    style:o.style||(lintMk==='civic'?'panel':'plank'),
    hwCol:0xa87e42,locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Highland Window: translucent thin-sawn emerald-nephrite, veined alabaster, or Deco steel-grid pane under a stepped head. */
function hyWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HY.WALL:o.t,kind=o.light||'nephrite';
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('ashlar',0,-.08,0,w+.24,.08,t+.12,P('ashlar'));
   for(const s of [-1,1])box('ashlar',s*(w/2+.06),0,0,.1,h,t+.08,P('ashlar'));
   if(o.stepHead){
    box('lime',0,h,0,w+.36,.13,t+.14,P('limeShade'));
    box('nephrite',0,h+.13,0,w+.16,.11,t+.1,P('nephrite'));
   }else{
    box('nephrite',0,h,0,w+.28,.14,t+.14,P('nephrite'));
   }
   if(kind==='alabaster'){
    box('alabaster',0,0,0,w-.06,h,.05,new THREE.Color(1,1,1));
    box('bronze',0,0,.04,.04,h,.03,P('bronze'));
    box('bronze',0,h*.5,.04,w-.06,.04,.03,P('bronze'));
   }
  });
  if(kind!=='alabaster'){
   svPane(0,0,0,0,w-.08,h,{kind:kind==='steel'?'smoked':'stained',color:0x38c27e,t:.03});
   if(kind==='steel'){
    svNoWalk(()=>{
     box('iron',0,0,.02,.04,h,.04,P('iron'));
     box('iron',0,h*.5,.02,w-.08,.04,.04,P('iron'));
    });
   }
  }
  if(o.lit!==false)haloAt(0,h*.5,-.2,kind==='alabaster'?0xf4d898:0x5ce8a0,false);
 });
}

/* Eternian-Hayrant Oculus ring window in nephrite/lime with bronze crossbars. */
function hyOculus(x,y,z,yaw,r,o){
 o=o||{};
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   ring(o.mk||'nephrite',0,0,.03,r,r*.17,P(o.mk||'nephrite'),0,PI/2,0,16);
   pole('alabaster',[0,0,-.03],[0,0,.01],r*.84,new THREE.Color(1,1,1),14);
   box('bronze',0,-r*.82,.04,.045,r*1.64,.035,P('bronze'));
   box('bronze',0,-.02,.045,r*1.64,.045,.035,P('bronze'));
  });
  if(o.lit!==false)haloAt(0,0,-.18,0xf2d490,false);
 });
}

/* Bundled Dual Alabaster + Emerald-Nephrite Lancets under an Eternian stepped Deco head (prefect & sanctuary tiers). */
function hyDualLancets(x,y,z,yaw,n,w,h,o){
 o=o||{};
 const cnt=n||3,gap=o.gap==null?.26:o.gap,step=o.step==null?.36:o.step,mid=(cnt-1)/2;
 const totW=cnt*w+(cnt-1)*gap;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   let topH=0;
   for(let i=0;i<cnt;i++){
    const hh=h-Math.abs(i-mid)*step,xx=-totW/2+w/2+i*(w+gap);
    const lt=i%2===0?'alabaster':'jade';
    etPoly('ashlar',etLancetPts(xx,-.1,w+.2,hh+.18,.015),P('ashlar'));
    etPoly(lt,etLancetPts(xx,0,w,hh,.04),new THREE.Color(1,1,1));
    etTracery(xx,0,.075,w,hh,{head:'pointed',mw:.38,th:.52,col:P('bronze')});
    if(hh>topH)topH=hh;
    haloAt(xx,hh*.48,-.16,lt==='alabaster'?0xf4d898:0x52e098,false);
   }
   box('lime',0,topH+.24,.03,totW+.36,.14,.14,P('limeShade'));
   box('nephrite',0,topH+.38,.04,totW*.72,.12,.16,P('nephrite'));
   if(o.oculus){
    hyOculus(0,topH+.96,.04,0,o.oculusR==null?.42:o.oculusR,{mk:'nephrite'});
   }
  });
 });
}

/* Sculptural Jomon kaen-doki ("flame-rimmed") chimney crown in two tier finishes:
   o.celadon === true -> Eternian celadon-glazed chimney pot with bronze collar (hybrid/prefect tiers);
   default -> cord-marked sooty terracotta with celadon-crackle band (bench tier). */
function hyKaenCrown(cx,y0,cz,r,h,nFins,o){
 o=o||{};
 const nf=nFins==null?4:nFins,bodyMk=o.celadon?'celadon':'kaen',finMk=o.celadon?'glaze':'kaen';
 const bodyCol=o.celadon&&KIT_HAS('celadon')?new THREE.Color(1,1,1):P(bodyMk);
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   cyl('ashlar',0,0,0,r*1.22,.1,P('ashlar'),16);
   lathe(bodyMk,0,0,[[r*.96,.1],[r*.88,.1+h*.38],[r*1.15,.1+h*.78],[r*1.06,.1+h]],16,bodyCol);
   ring(o.celadon?'bronze':'glaze',0,.1+h*.6,0,r*1.08,.052,P(o.celadon?'bronze':'glaze'),0,0,0,16);
   for(let i=0;i<nf;i++){
    const a=i*TAU/nf;
    W(Math.cos(a)*r*1.12,.1+h*.7,Math.sin(a)*r*1.12,PI/2-a,()=>{
     box(finMk,0,0,0,.095,.36,.22,P(finMk));
     box('bronze',0,.36,.03,.075,.14,.16,P('bronze'));
     ring(finMk,0,.22,.12,.085,.028,P(finMk),PI/2,0,0,10);
    });
   }
  });
  if(o.smoke!==false)smokeAt(0,.14+h,0,{r:r*.42,kind:o.smokeKind||'chimney'});
  if(o.halo!==false)haloAt(0,.1+h*.4,0,0xff9c44,false);
 });
 return y0+.1+h+.42;
}

/* Projecting Sardinian mensoloni basalt stone corbel-brackets & overhanging parapet ring. */
function hyMensoloni(cx,yTop,cz,rTop,o){
 o=o||{};
 const nB=o.n==null?Math.max(12,Math.round(rTop*5.0)):o.n;
 const over=o.over==null?.32:o.over,parH=o.parH==null?.72:o.parH;
 const stoneMk=o.mk||'basalt';
 svNoWalk(()=>{
  for(let i=0;i<nB;i++){
   const a=i*TAU/nB,mx=cx+Math.cos(a)*(rTop+.06),mz=cz+Math.sin(a)*(rTop+.06),yaw=PI/2-a;
   W(mx,yTop,mz,yaw,()=>{
    box('corbel',0,0,.04,.22,.13,.26,P('corbel'));
    box('corbel',0,.13,.1,.26,.14,.36,P('corbel'));
   });
  }
  sector('ashlar',cx,cz,Math.max(.5,rTop-.68),rTop+over,0,TAU,yTop+.27,yTop+.42,P('ashlar'),28);
  const gaps=o.crenels===false?[]:Array.from({length:Math.max(4,Math.round(nB/3))},(_,k)=>({a:(k+.5)*TAU/Math.max(4,Math.round(nB/3)),half:.12}));
  hyCourseSector(stoneMk,cx,cz,rTop+over-.36,rTop+over-.02,yTop+.42,yTop+.42+parH,P(stoneMk),gaps,28);
 });
 return yTop+.42+parH;
}

/* Sardinian Concave-Battered Megabreccia/Basalt Nuraghe Tower (HK1 cousin inheritance) with corbelled tholos vault,
   mensoloni parapet, nephrite-lintel doorway, and optional Eternian celadon hex-hip cap! */
function hyNuraghe(cx,cz,y0,rBase,rTop,h,o){
 o=o||{};
 const courses=o.courses==null?Math.max(6,Math.round(h/.82)):o.courses;
 const wallT=o.wallT==null?Math.min(1.38,rBase*.33):o.wallT;
 const doors=o.doors||[],wins=o.windows||[];
 const solidBelow=o.solidBelow==null?0:o.solidBelow;
 W(cx,0,cz,0,()=>{
  if(solidBelow<=.05){
   const rFl=Math.max(.85,rBase-wallT-.02);
   svNoWalk(()=>cyl('paving',0,y0,0,rFl,.06,P('paving'),18));
   svFloor(hyOctPts(0,0,rFl+.06,12),y0+.06);
  }
  svNoWalk(()=>{
   for(let k=0;k<courses;k++){
    const t0=k/courses,t1=(k+1)/courses,ya=y0+h*t0,yb=y0+h*t1;
    const rOut=hyRigMath.nuragheRadius(rBase,rTop,t0);
    const isSolid=yb<=y0+solidBelow+.02;
    const rIn=isSolid?.18:Math.max(.85,rOut-wallT*(1-.14*t0));
    const gaps=[];
    for(const d of doors){
     const dy0=y0+(d.y==null?0:d.y),dy1=dy0+d.h+(d.lintelH==null?.32:d.lintelH)+(d.relieving===false?.38:.78);
     if(yb>dy0+.01&&ya<dy1-.01){
      const rm=0.5*(rIn+rOut);
      gaps.push({a:hyYawToSector(d.yaw),half:Math.asin(Math.min(.92,(d.w/2+.24)/Math.max(1,rm)))});
     }
    }
    for(const w of wins){
     const wy0=y0+w.y-.09,wy1=y0+w.y+w.h+.22;
     if(yb>wy0+.01&&ya<wy1-.01){
      const rm=0.5*(rIn+rOut);
      gaps.push({a:hyYawToSector(w.yaw),half:Math.asin(Math.min(.85,(w.w/2+.16)/Math.max(1,rm)))});
     }
    }
    const mk=k%3===0?'megabreccia':k%3===1?'basalt':'columnar';
    hyCourseSector(mk,0,0,rIn,rOut,ya,yb,P(mk),gaps,28);
   }
   if(o.tholos!==false&&h>3.0){
    const yTh0=Math.max(y0+solidBelow+2.3,y0+h*.48),yTh1=y0+h-.04;
    if(yTh1-yTh0>.55){
     const rStart=Math.max(.8,hyRigMath.nuragheRadius(rBase,rTop,(yTh0-y0)/h)-wallT-.06);
     const rOc=Math.max(.42,rTop-wallT*.82);
     const prof=[];
     for(let j=0;j<=6;j++){
      const f=j/6;
      prof.push([lerp(rStart,rOc,Math.pow(f,1.35)),lerp(yTh0,yTh1,f)]);
     }
     lathe('corbel',0,0,prof,20,P('corbel'),{inward:true});
    }
   }
  });
  for(const d of doors){
   const dy=y0+(d.y==null?0:d.y),tf=clamp((dy-y0)/Math.max(.1,h),0,1);
   const rFace=hyRigMath.nuragheRadius(rBase,rTop,tf)-wallT*.38;
   const dx=Math.sin(d.yaw||0)*rFace,dz=Math.cos(d.yaw||0)*rFace;
   hyDoor(dx,dy,dz,d.yaw||0,d.w,d.h,Object.assign({t:wallT*.7},d));
   if(d.walkPad!==false){
    W(dx,0,dz,d.yaw||0,()=>wkPad(0,0,d.w+.22,wallT+1.35,dy+(solidBelow<=.05?.06:0)));
   }
  }
  for(const w of wins){
   const wy=y0+w.y,tf=clamp((wy-y0)/Math.max(.1,h),0,1);
   const rFace=hyRigMath.nuragheRadius(rBase,rTop,tf)-wallT*.28;
   hyWindow(Math.sin(w.yaw||0)*rFace,wy,Math.cos(w.yaw||0)*rFace,w.yaw||0,w.w,w.h,{t:wallT*.44,light:w.light||'nephrite',stepHead:w.stepHead});
  }
  let topY=y0+h;
  if(o.mensoloni!==false)topY=hyMensoloni(0,y0+h,0,rTop,o.mensoloniOpt);
  if(o.celadonCap){
   const capH=o.capH==null?2.4:o.capH;
   svNoWalk(()=>{
    etHexHip(rTop+.44,topY+.04,capH,{mk:'celadon',ov:.38,under:P('larchD'),cap:P('celadon')});
    hyKaenCrown(0,topY+.08+capH,0,.34,.56,4,{celadon:true,smoke:!!o.smoke});
   });
   topY+=.08+capH+.9;
  }
  return topY;
 });
 return y0+h+(o.celadonCap?3.9:1.15);
}

/* Highland Steamed Fur-Larch & Century-Puya Cruck-Rib Chise Lodge (HK3 translated to 3,100-4,500 m):
   megabreccia/basalt ring-wall + overhanging carved rafter-tail eave ring + 5 imbricated fur-larch/birch-bark/tarwood
   shingle tiers + proud exterior larch/whalebone crest-battens + kaen-doki flame-ceramic smoke crown! */
function hyChise(cx,cz,y0,rOut,wallT,wallH,domeRise,o){
 o=o||{};
 const doors=o.doors||[{yaw:0,w:1.4,h:2.1,lintel:'larch'}],wins=o.windows||[];
 const nRibs=o.ribs==null?12:o.ribs,rSmoke=o.rSmoke==null?Math.max(.52,rOut*.165):o.rSmoke;
 const rIn=Math.max(1.2,rOut-wallT),courses=Math.max(4,Math.round(wallH/.58));
 const extRibMk=o.whaleHeirloom?'whalebone':'larch';
 const eaveOver=o.eaveOver==null?.22:o.eaveOver;
 const segs=32;
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>cyl(o.floorMk||'planks',0,y0,0,rIn-.02,.06,P(o.floorMk||'planks'),24));
  if(y0<=.05)svFloor(hyOctPts(0,0,rIn+.05,12),y0+.06);

  svNoWalk(()=>{
   for(let k=0;k<courses;k++){
    const t0=k/courses,t1=(k+1)/courses,ya=y0+wallH*t0,yb=y0+wallH*t1;
    const ro=rOut-.16*t0,ri=rIn;
    const gaps=[];
    for(const d of doors){
     const dy0=y0+(d.y==null?0:d.y),dy1=dy0+d.h+.82;
     if(yb>dy0+.01&&ya<dy1-.01){
      gaps.push({a:hyYawToSector(d.yaw),half:Math.asin(Math.min(.9,(d.w/2+.24)/((ro+ri)*.5)))});
     }
    }
    for(const w of wins){
     const wy0=y0+w.y-.09,wy1=y0+w.y+w.h+.22;
     if(yb>wy0+.01&&ya<wy1-.01){
      gaps.push({a:hyYawToSector(w.yaw),half:Math.asin(Math.min(.85,(w.w/2+.16)/((ro+ri)*.5)))});
     }
    }
    const mk=k%2===0?'megabreccia':'basalt';
    hyCourseSector(mk,0,0,ri,ro,ya,yb,P(mk),gaps,segs);
   }

   /* Stepped ashlar wall-head cornice, tarwood wall-plate, and projecting fur-larch eave rafter-tails */
   const yPlate=y0+wallH,rTopW=rOut-.16,rEave=rOut+eaveOver;
   sector('ashlar',0,0,rIn-.03,rTopW+.07,0,TAU,yPlate,yPlate+.10,P('ashlar'),segs);
   sector('tarwood',0,0,rTopW-.06,rEave+.02,0,TAU,yPlate+.10,yPlate+.19,P('tarwood'),segs);
   const nTails=nRibs*2;
   for(let ti=0;ti<nTails;ti++){
    const ta=ti*TAU/nTails;
    W(Math.cos(ta)*(rTopW+.02),yPlate+.02,Math.sin(ta)*(rTopW+.02),PI/2-ta,()=>{
     box('larch',0,0,(eaveOver+.14)*.5,.11,.075,eaveOver+.18,P('larch'));
    });
   }

   const ySpring=yPlate+.19,yCrown=ySpring+domeRise;
   /* Interior steamed fur-larch cruck frame & puya purlins strictly inside ceiling shell (rIn - 0.14) */
   for(let i=0;i<nRibs;i++){
    const a=i*TAU/nRibs+(o.ribPhase==null?.22:o.ribPhase);
    const cs=Math.cos(a),sn=Math.sin(a);
    tube('larch',t=>{
     const p=hyRigMath.cruckArc(rIn-.15,yPlate+.02,rSmoke-.04,yCrown-.12,t);
     return [cs*p[0],p[1],sn*p[0]];
    },t=>[.075-.02*t,.11-.03*t],10,6,P('larch'),{caps:true});
   }
   for(const f of [.34,.68]){
    const p=hyRigMath.cruckArc(rIn-.13,yPlate+.02,rSmoke-.04,yCrown-.12,f);
    ring('puya',0,p[1],0,p[0],.042,P('puya'),0,0,0,24);
   }
   {
    const inProf=[];
    for(let j=0;j<=8;j++){
     const f=j/8,p=hyRigMath.cruckArc(rIn-.04,yPlate+.06,rSmoke+.02,yCrown-.06,f);
     inProf.push([p[0],p[1]]);
    }
    lathe('planks',0,0,inProf,segs,P('planks'),{inward:true});
   }

   /* 5 imbricated weathered shingle/shake courses: each lower course steps cleanly proud by 5.5 cm with drip-soffit return */
   const topMk=o.celadonCrown?'celadon':'tile';
   const tiers=[
    {mk:'tarwood',col:'tarwood',f0:0,f1:.22,out:.13},
    {mk:'bark',col:'bark',f0:.19,f1:.42,out:.10},
    {mk:'larch',col:'larchD',f0:.39,f1:.62,out:.075},
    {mk:'bark',col:'bark',f0:.59,f1:.81,out:.05},
    {mk:topMk,col:topMk,f0:.78,f1:1.0,out:.03}
   ];
   for(let ti=0;ti<tiers.length;ti++){
    const T=tiers[ti],prof=[];
    const pStart=hyRigMath.cruckArc(rEave-.08,ySpring,rSmoke+.12,yCrown,T.f0);
    if(ti>0){
     prof.push([pStart[0]+T.out-.048,pStart[1]+.012]);
    }
    for(let j=0;j<=5;j++){
     const f=lerp(T.f0,T.f1,j/5);
     const p=hyRigMath.cruckArc(rEave-.08,ySpring,rSmoke+.12,yCrown,f);
     const flare=j===0?.026:0;
     prof.push([p[0]+T.out+flare,p[1]]);
    }
    const cVal=T.mk==='celadon'&&KIT_HAS('celadon')?new THREE.Color(1,1,1):P(T.col);
    lathe(T.mk,0,0,prof,segs,cVal);
   }

   /* Proud exterior hog-back crest-battens & bronze clasp-rings riding cleanly outside all shingle courses */
   for(let i=0;i<nRibs;i++){
    const a=i*TAU/nRibs+(o.ribPhase==null?.22:o.ribPhase);
    const cs=Math.cos(a),sn=Math.sin(a);
    tube(extRibMk,t=>{
     const p=hyRigMath.cruckArc(rEave-.08,ySpring,rSmoke+.12,yCrown,t);
     const lift=.21-.055*t;
     return [cs*(p[0]+lift),p[1]+.055,sn*(p[0]+lift)];
    },t=>[.058-.016*t,.082-.022*t],12,6,P(extRibMk),{caps:true});
   }
   ring('bronze',0,yCrown+.03,0,rSmoke+.24,.055,P('bronze'),0,0,0,24);
  });

  for(const d of doors){
   const dy=y0+(d.y==null?0:d.y),rFace=(rIn+rOut)*.5;
   const dx=Math.sin(d.yaw||0)*rFace,dz=Math.cos(d.yaw||0)*rFace;
   if(d.vestibule!==true)hyDoor(dx,dy,dz,d.yaw||0,d.w,d.h,Object.assign({t:wallT*.68},d));
   else door(dx,dy,dz,d.yaw||0,d.w,d.h);
   if(y0<=.05)W(dx,0,dz,d.yaw||0,()=>wkPad(0,0,d.w+.25,wallT+1.25,y0+.06));
  }
  for(const w of wins){
   const rFace=(rIn+rOut)*.5;
   hyWindow(Math.sin(w.yaw||0)*rFace,y0+w.y,Math.cos(w.yaw||0)*rFace,w.yaw||0,w.w,w.h,{t:wallT*.44,light:w.light||'nephrite'});
  }
  if(o.lanternCrown!==true){
   hyKaenCrown(0,y0+wallH+.19+domeRise+.04,0,rSmoke+.08,o.crownH==null?.76:o.crownH,o.crownFins==null?4:o.crownFins,{celadon:!!o.celadonCrown,smoke:o.smoke!==false});
  }
 });
 return y0+wallH+domeRise+1.35;
}

/* Straight battered wall from (x0,z0) to (x1,z1) with dark megabreccia/columnar socle & clean opening cutouts. */
function hyWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?HY.WALL:o.t,soc=o.socle==null?HY.SOCLE:o.socle,mk=o.mk||'basalt',col=o.col==null?P(mk):o.col;
 const socMk=o.socleMk||'megabreccia';
 const L=Math.hypot(x1-x0,z1-z0);if(L<.06)return;
 const yaw=Math.atan2(z0-z1,x1-x0);
 const holes=(o.holes||[]).map(q=>({a:q.at-q.w/2,b:q.at+q.w/2,y0:y0+(q.y==null?0:q.y),y1:y0+(q.y==null?0:q.y)+q.h}));
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  const run=(a,b,ya,yb)=>{
   if(b-a<.015||yb-ya<.015)return;
   svNoWalk(()=>{
    const sh=Math.min(yb,y0+soc);
    if(soc>0&&sh>ya)box(socMk,X((a+b)/2),ya,0,b-a,sh-ya,t+.04,P(socMk));
    const ba=Math.max(ya,y0+soc);
    if(yb>ba)box(mk,X((a+b)/2),ba,0,b-a,yb-ba,t,col);
   });
   hyWallBlock(X((a+b)/2),ya,0,b-a,yb-ya,t);
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

/* Rectangular room walls on [x0..x1, z0..z1] with columnar corner piers so adjacent walls NEVER overlap at corners. */
function hyWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?HY.WALL:o.t,pw=t+.08,hp=pw/2+.008,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||'columnar',beamMk=o.beamMk||'larch';
 for(const cx of [x0,x1])for(const cz of [z0,z1]){
  svNoWalk(()=>{
   const sh=Math.min(.48,h*.22);
   box('ashlar',cx,y0,cz,pw+.04,sh,pw+.04,P('ashlar'));
   box(postMk,cx,y0+sh,cz,pw,h-sh,pw,P(postMk));
  });
  hyWallBlock(cx,y0,cz,pw,h,pw);
 }
 const shift=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 if(skip.indexOf('s')<0)hyWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shift(H.s,hp)}));
 if(skip.indexOf('n')<0)hyWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shift(H.n,hp)}));
 if(skip.indexOf('e')<0)hyWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shift(H.e,hp)}));
 if(skip.indexOf('w')<0)hyWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shift(H.w,hp)}));
 if(o.eavesRing!==false){
  svNoWalk(()=>{
   const cw=x1-x0+pw+.1,cd=z1-z0+pw+.1;
   box(beamMk,(x0+x1)/2,y0+h,z0,cw,.12,.18,P(beamMk));
   box(beamMk,(x0+x1)/2,y0+h,z1,cw,.12,.18,P(beamMk));
   for(const sx of [x0,x1])box('tarwood',sx,y0+h+.12,(z0+z1)/2,.18,.11,cd,P('tarwood'));
  });
 }
}

/* Horizontal Western Outer Wall Loess-Bank Yaodong Vault (wouterwall/PLAN.md §5 — cliff-bank frontispiece, NEVER a sunken pit!):
   hollow walkable room enclosed by a stepped golden-buff loess & turf earth-mantle at the sides/rear and a battered
   megabreccia/limewashed arched frontispiece on +z, crowned with a kaen-doki smoke-pot. */
function hyLoessVault(cx,cz,y0,w,d,h,o){
 o=o||{};
 const doorW=o.doorW==null?1.32:o.doorW,doorH=o.doorH==null?2.1:o.doorH;
 const frontMk=o.frontMk||'loess',lintelMk=o.lintel||'larch';
 W(cx,0,cz,0,()=>{
  /* Interior walkable room walls with +z door & side window cutouts */
  const winW=.82,winH=.88;
  const sHoles=[{at:w/2,y:0,w:doorW+.44,h:doorH+.72}];
  if(w>=7.2){
   sHoles.push({at:1.45,y:.95,w:winW+.28,h:winH+.26});
   sHoles.push({at:w-1.45,y:.95,w:winW+.28,h:winH+.26});
  }
  hyWallRing(-w/2,-d/2,w/2,d/2,y0,h,{mk:frontMk,socle:.62,socleMk:'megabreccia',holes:{s:sHoles}});
  /* Stepped golden-buff loess earth-bank shoulders & turf brow (each tier strictly stacked in y so zero faces overlap!) */
  svNoWalk(()=>{
   box('loess',0,y0+h+.23,-.18,w+.42,.42,d+.28,P('loess'));
   box('loess',0,y0+h+.65,-.36,w-.36,.36,d-.18,P('loessD'));
   box('turf',0,y0+h+1.01,-.36,w-.64,.24,d-.42,P('turf'));
   /* Limewashed recessed arch-tympanum band over the yaodong doorway */
   box('lime',0,y0+doorH+.42,d/2+.26,doorW+1.2,.44,.07,P('lime'));
   if(o.oculus)hyOculus(0,y0+h+.44,d/2+.16,0,.34,{mk:'nephrite'});
  });
  hyDoor(0,y0,d/2,0,doorW,doorH,{lintel:lintelMk,maskMk:o.maskMk||'kaen',relieving:o.relieving!==false});
  if(w>=7.2){
   for(const sx of [-w/2+1.45,w/2-1.45]){
    hyWindow(sx,y0+.95,d/2,0,winW,winH,{light:o.winLight||'nephrite',stepHead:!!o.stepHead});
   }
  }
  hyKaenCrown(o.smokeX==null?0:o.smokeX,y0+h+1.25,-.45,.36,.68,4,{celadon:!!o.celadonCrown,smoke:o.smoke!==false});
 });
 return y0+h+2.35;
}

/* Snow-shedding steep hipped roof in celadon tile, slate-grey tile, bark, or turf, with optional kaen-doki finials. */
function hyRoofHip(cx,y0,cz,w,d,rise,o){
 o=o||{};
 const mk=o.mk||'celadon',over=o.over==null?.52:o.over;
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   etHip(w,d,y0,rise,{mk,ov:over,flare:mk==='celadon'?.38:.14,ribs:mk==='celadon'||mk==='tile'?.48:0,under:P('larchD'),cap:P(mk==='celadon'?'celadon':'ashlar')});
   if(o.kaenFinial!==false){
    hyKaenCrown(0,y0+rise+.14,0,.32,.54,4,{celadon:mk==='celadon',smoke:!!o.smoke});
   }
  });
 });
 return y0+rise+(o.kaenFinial!==false?.96:.28);
}

/* Stepped Deco-Gothic Pier Frontispiece ("Organ-Pipe Crown") set cleanly atop a battered stone wall/nuraghe cornice:
   ranks step upward toward the centre (hyRigMath.pierStepTops) with closed-eye ancestor heads in the pier niches! */
function hySteppedPierFront(x,y0,z,yaw,w,h0,step,nPiers,o){
 o=o||{};
 const n=nPiers||5,mk=o.mk||'brick',pw=w/n,tops=hyRigMath.pierStepTops(n,h0,step);
 W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(let i=0;i<n;i++){
    const px=-w/2+pw*(i+.5),ph=tops[i],proj=i%2===1?.18:.06;
    box(mk,px,0,proj/2,pw*.92,ph,.44+proj,P(mk));
    box('ashlar',px,ph,proj/2,pw*.76,.16,.36+proj,P('ashlar'));
    box('celadon',px,ph+.16,proj/2,pw*.56,.14,.28+proj,KIT_HAS('celadon')?new THREE.Color(1,1,1):P('celadon'));
    if(o.niches!==false&&(i===Math.floor(n/2)||n>=5&&(i===1||i===n-2))){
     const nh=.58;
     box('basalt',px,ph-.88,.24+proj,pw*.56,nh+.14,.06,P('basaltD'));
     hyAncestorHead(px,ph-.84,.3+proj,0,nh*.76,{mk:i===Math.floor(n/2)?(o.centreMetal||'gold'):(o.sideMetal||'bronze')});
    }
   }
  });
 });
 return y0+Math.max(...tops)+.3;
}

/* Katabatic Wind-Rigged Hayrant Cave-Madder Plaid or Wallhemp Awning (SV_CLOTH, 0.0 drift at all 4 corner rings). */
function hyPlaidAwning(x0,z0,x1,z1,yFoot,yTop,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2,hd=d/2;
 const sag=o.sag==null?.28:o.sag,amp=o.amp==null?.2:o.amp,mk=o.mk||'plaid';
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   if(o.posts!==false){
    for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
     cyl('basalt',sx,yFoot,sz,.13,.15,P('basaltD'),10);
     cyl('larch',sx,yFoot+.15,sz,.07,yTop-yFoot-.15,P('larch'),10);
     ring('bronze',sx,yTop,sz,.07,.02,P('bronze'),0,0,0,10);
    }
   }
   sagRope('rope',[-hw,yTop,-hd],[hw,yTop,-hd],sag*.28,.013,P('rope'),8);
   sagRope('rope',[-hw,yTop,hd],[hw,yTop,hd],sag*.28,.013,P('rope'),8);
   sagRope('rope',[-hw,yTop,-hd],[-hw,yTop,hd],sag*.28,.013,P('rope'),8);
   sagRope('rope',[hw,yTop,-hd],[hw,yTop,hd],sag*.28,.013,P('rope'),8);
   withCloth((lp,out)=>{
    const u=clamp((lp.x+hw)/Math.max(.1,w),0,1),v=clamp((lp.z+hd)/Math.max(.1,d),0,1);
    const pw=hyRigMath.cornerPin(u,v)*amp;
    out.set(pw*.18,pw,pw*.22);
   },()=>{
    psurf(mk,(u,v)=>{
     const xx=(u-.5)*w,zz=(v-.5)*d,cat=4*u*(1-u)*.55+4*v*(1-v)*.45;
     return [xx,yTop-sag*cat+.025*Math.sin(u*4*PI)*Math.sin(PI*v),zz];
    },12,10,P(mk));
   });
  });
 });
}

/* Wind-Rigged Hayrant Cave-Madder Plaid Banner, Wallhemp Drying Sheet or Hide Curtain hung from a larch/bronze crossbar. */
function hyWindHanging(x,yFoot,z,yaw,span,h,o){
 o=o||{};
 const mk=o.mk||'plaid',nPanels=o.panels==null?2:o.panels,drop=o.drop==null?h-.38:o.drop;
 W(x,yFoot,z,yaw||0,()=>{
  svNoWalk(()=>{
   if(o.posts!==false){
    for(const sx of [-span/2,span/2]){
     box('basalt',sx,0,0,.2,.15,.22,P('basaltD'));
     cyl('larch',sx,.15,0,.06,h-.15,P('larch'),8);
    }
   }
   beam('bronze',[-span/2-.1,h,0],[span/2+.1,h,0],.055,P('bronze'),true,8);
   const pw0=(span-.22)/nPanels;
   for(let i=0;i<nPanels;i++){
    const px=-span/2+.11+pw0*(i+.5),wPan=pw0*.86,yTop=h-.07;
    withCloth((lp,out)=>{
     const v=clamp((yTop-lp.y)/Math.max(.1,drop),0,1);
     const pw=hyRigMath.hangPin(v)*(o.amp==null?.26:o.amp);
     out.set(pw*.25,0,pw);
    },()=>{
     psurf(mk,(u,v)=>[px+(u-.5)*wPan,yTop-v*drop,.02*Math.sin(PI*u)*v],4,10,P(mk));
    });
   }
  });
 });
}

/* Braided Bench-Garlic & Cave-Date Jujube Eaves Festoon (wouterwall/PLAN.md §4 — pinned at u=0 and u=1 on spanPin!). */
function hyEavesBraid(x,y,z,yaw,span,o){
 o=o||{};
 const sag=o.sag==null?.24:o.sag;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-span/2,span/2])ring('iron',sx,0,0,.045,.014,P('iron'),0,PI/2,0,8);
   withCloth((lp,out)=>{
    const u=clamp((lp.x+span/2)/Math.max(.1,span),0,1);
    const pw=hyRigMath.spanPin(u)*.16;
    out.set(pw*.2,pw*.35,pw);
   },()=>{
    psurf('hemp',(u,v)=>{
     const xx=(u-.5)*span,yy=-sag*4*u*(1-u)-(v-.5)*.11;
     return [xx,yy,.02*Math.sin(u*8*PI)];
    },12,3,P('hemp'));
   });
  });
 });
}

/* Wind-Rigged Tuned Emerald-Nephrite & Eternian Bronze Seismic/Katabatic Chimes (rigid-pendulum chimePin). */
function hySeismicChimes(x,yTop,z,yaw,span,drop,nSlabs,o){
 o=o||{};
 const n=nSlabs==null?5:nSlabs;
 W(x,0,z,yaw||0,()=>{
  svNoWalk(()=>{
   beam('bronze',[-span/2-.1,yTop,0],[span/2+.1,yTop,0],.05,P('bronze'),true,8);
   for(const sx of [-span/2,span/2])ring('bronze',sx,yTop,0,.065,.018,P('bronze'),0,PI/2,0,10);
   for(let i=0;i<n;i++){
    const f=n===1?.5:i/(n-1),sx=(f-.5)*(span-.2);
    const len=drop*(.72+.28*(1-Math.abs(2*f-1))),wSlab=Math.min(.17,span/(n*1.55));
    const yCord=yTop-.13;
    pole('rope',[sx,yTop-.02,0],[sx,yCord,0],.008,P('rope'),5);
    withCloth((lp,out)=>{
     const v=clamp((yCord-lp.y)/Math.max(.1,len),0,1);
     const pw=hyRigMath.chimePin(v)*.22;
     out.set(pw*.3,0,pw);
    },()=>{
     psurf('chime',(u,v)=>[sx+(u-.5)*wSlab,yCord-v*len,0],2,6,i%2===0?P('chime'):P('nephriteBright'));
    });
   }
  });
 });
}

/* Prized Cross-Pass Bleached Leviathan Whale-Jawbone Arch (reserved exclusively for Hueru-Kuran Legation & Utari Clan Seats!). */
function hyWhaleJawArch(x,y0,z,yaw,span,h){
 W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    cyl('columnar',s*span/2,0,0,.4,.46,P('columnar'),6);
    tube('whalebone',t=>{
     const xx=s*span/2*(1-Math.pow(t,1.18))+.16*s*Math.sin(PI*t);
     const yy=.4+(h-.4)*Math.sin(.5*PI*t);
     const zz=.2*Math.sin(PI*t);
     return [xx,yy,zz];
    },t=>[.17-.07*t,.24-.1*t],14,8,P('whalebone'),{caps:true});
   }
   cyl('bronze',0,h-.1,.03,.2,.22,P('bronze'),10);
   hySeismicChimes(0,h-.22,.03,0,Math.min(1.5,span*.35),Math.min(1.25,h*.3),3);
  });
 });
}

/* Bilingual Eternian Logograph + Hayrant Sound-Mark Signboard (gold-on-black State sign + carved nephrite sound-mark tablet). */
function hyBilingualSign(x,y,z,yaw,w,h){
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('bronze',0,h+.04,0,w+.24,.08,.09,P('bronze'));
   withCloth((lp,out)=>{
    const v=clamp((h-lp.y)/Math.max(.1,h),0,1),pw=hyRigMath.hangPin(v)*.14;
    out.set(pw*.2,0,pw);
   },()=>{
    psurf('sign',(u,v)=>[(u-.5)*w,h*(1-v),.02],3,6,new THREE.Color(1,1,1));
   });
  /* Carved emerald-nephrite Hayrant katakana-coda sound-mark tablet alongside */
   box('nephrite',0,h+.14,-.02,w*.76,.22,.06,P('nephrite'));
  });
 });
}

/* World-space helpers recording live core/water still mirror basins (WATER.still) & mountain streams/flumes (WATER.flow). */
function hyWorldPt(x,y,z){
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 return [p.x,p.y,p.z];
}

function hyStillPool(name,x0,z0,x1,z1,level,o){
 if(!CURREC||PLACE_DRY)return;
 o=o||{};
 const a=hyWorldPt(x0,level,z0),b=hyWorldPt(x1,level,z1);
 (CURREC.stills||(CURREC.stills=[])).push({
  name,level:a[1],
  bounds:[Math.min(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[0],b[0]),Math.max(a[2],b[2])],
  color:o.color==null?0x184b4d:o.color,
  roughness:o.roughness==null?.035:o.roughness,
  metalness:o.metalness==null?.2:o.metalness,
  envMapIntensity:o.envMapIntensity==null?.82:o.envMapIntensity
 });
}

function hyFlowStream(name,ptsLocal,width,speed){
 if(!CURREC||PLACE_DRY)return;
 CURREC.river={
  name,
  pts:ptsLocal.map(q=>{const w=hyWorldPt(q[0],q[1],q[2]);return [w[0],w[2],w[1]];}),
  width:width==null?1.8:width,
  speed:speed==null?1.5:speed
 };
}

