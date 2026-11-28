// prefix: hs
// ================================================================= HUSH-KIN ARCHITECTURAL TOOLKIT (PLAN.md §2, HS2 & HS3)
// Implements Silent-Vales sanctuary masonry, 100% Handspeak open-sightline loggias, chest-height (y = 1.25 m) crystal-diffused
// parabolic reflector hand-lamps, sinusoidal 440/660 Hz bianzhong & emerald-nephrite lithophone racks (rigged with SV_CLOTH
// rigid-pendulum wind sway inside dead acoustic silence!), and carved pale-granite & snow-white-quartz Open-Palm monoliths.
// Every top-level name starts with `hs`, non-walkable trim wraps in svNoWalk(), and every relief layer steps by >= 2.0 cm.

const HS_SV=new THREE.Vector3();

function hsTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function hsFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.006,e[3],e[4]==null?0:e[4],e[5]);
}

function hsSeedAt(x,y,z,salt){
 HS_SV.set(x,y,z).applyMatrix4(CM);
 return KRAND.hash(0x9a37^(salt|0),Math.round(HS_SV.x*20),Math.round(HS_SV.y*20),Math.round(HS_SV.z*20));
}

/* Stepped pale-granite & blue-grey slate sanctuary plinth with walkable stone flight on +z (or custom stepX / yaw). */
function hsPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.2,h*.46),h2=Math.max(.08,h-h1-.07),h3=h-h1-h2;
 const baseMk=o.baseMk||'granite',midMk=o.midMk||'slateWall',topMk=o.topMk||'paving';
 svNoWalk(()=>{
  box(baseMk,0,0,0,w+.44,h1,d+.44,P(baseMk));
  box(midMk,0,h1,0,w+.2,h2,d+.2,P(midMk));
  box(topMk,0,h1+h2,0,w,h3,d,P(topMk));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false&&h>.08){
  const sw=o.stepW==null?2.4:o.stepW,sx=o.stepX==null?0:o.stepX,run=o.stepRun==null?Math.max(.82,h*2.0):o.stepRun;
  const zFoot=d/2+.22+run,zTop=d/2+.22,ns=Math.max(2,Math.ceil(h/HS.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const za=lerp(zFoot,zTop,i/ns),zb=lerp(zFoot,zTop,(i+1)/ns),yl=h*i/ns,yh=h*(i+1)/ns;
    box('slate',sx,yl,(za+zb)/2,sw,yh-yl,Math.abs(za-zb),P('slate'));
   }
   for(const s of [-1,1])box('granite',sx+s*(sw/2+.13),0,(zFoot+zTop)/2,.2,h+.14,run+.08,P('granite'));
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.28],sw);
 }
 return h;
}

/* Dressed pale-granite / ashlar / slateWall sanctuary wall from (x0,z0) to (x1,z1) with non-overlapping hole cutouts [{at,y,w,h}]. */
function hsWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.05||h<.05)return;
 const yaw=Math.atan2(dx,dz),t=o.t==null?HS.WALL:o.t,mk=o.mk||'ashlar',col=o.col||P(mk);
 const socH=o.socle==null?HS.SOCLE:o.socle,socMk=o.socleMk||'slateWall';
 const holes=(o.holes||[]).slice().sort((a,b)=>a.at-b.at);
 W(x0,y0,z0,yaw,()=>{
  const cols=[];
  for(const q of holes){
   const a=Math.max(0,q.at-q.w/2),b=Math.min(L,q.at+q.w/2);
   if(b-a<.02)continue;
   const prev=cols[cols.length-1];
   if(prev&&a<prev.b-.01){prev.b=Math.max(prev.b,b);prev.q.push(q);}
   else cols.push({a,b,q:[q]});
  }
  const seg=(sa,sb,ya,yb)=>{
   if(sb-sa<.02||yb-ya<.02)return;
   const len=sb-sa,mz=(sa+sb)/2;
   if(socH>0&&ya<socH){
    const sh=Math.min(yb,socH)-ya;
    box(socMk,0,ya,mz,t+.05,sh,len,P(socMk));
    if(yb>socH)box(mk,0,socH,mz,t,yb-socH,len,col);
   }else{
    box(mk,0,ya,mz,t,yb-ya,len,col);
   }
  };
  let cur=0;
  for(const c of cols){
   seg(cur,c.a,0,h);
   const st=c.q.slice().sort((p,r)=>(p.y||0)-(r.y||0));
   let yy=0;
   for(const q of st){
    const qa=Math.max(c.a,q.at-q.w/2),qb=Math.min(c.b,q.at+q.w/2),qy=q.y||0,qTop=Math.min(h,qy+q.h);
    seg(c.a,c.b,yy,qy);
    if(qa>c.a+.02)seg(c.a,qa,qy,qTop);
    if(qb<c.b-.02)seg(qb,c.b,qy,qTop);
    yy=qTop;
   }
   seg(c.a,c.b,yy,h);
   cur=c.b;
  }
  seg(cur,L,0,h);
 });
}

/* Four-wall sanctuary masonry box (w x d from y0 up h) with pale-granite corner quoins/pilasters (4 cm proud, zero z-fights!). */
function hsBox(w,d,y0,h,o){
 o=o||{};
 const t=o.t==null?HS.WALL:o.t,pr=o.postR==null?HS.POST_R:o.postR,H=o.holes||{};
 const mapSpan=(arr,span)=>(arr||[]).map(q=>({at:q.at==null?span/2+q.x:q.at,y:q.y||0,w:q.w,h:q.h}));
 hsWall(-w/2,d/2-t/2,w/2,d/2-t/2,y0,h,Object.assign({},o,{holes:mapSpan(H.s,w)}));
 hsWall(-w/2,-d/2+t/2,w/2,-d/2+t/2,y0,h,Object.assign({},o,{holes:mapSpan(H.n,w)}));
 hsWall(w/2-t/2,-d/2+t,w/2-t/2,d/2-t,y0,h,Object.assign({},o,{holes:mapSpan(H.e,d-2*t)}));
 hsWall(-w/2+t/2,-d/2+t,-w/2+t/2,d/2-t,y0,h,Object.assign({},o,{holes:mapSpan(H.w,d-2*t)}));
 svNoWalk(()=>{
  for(const sx of [-1,1])for(const sz of [-1,1]){
   cyl('granite',sx*(w/2-.03),y0,sz*(d/2-.03),pr,Math.max(.2,h-.02),P('granite'),10);
  }
 });
}

/* Silent felt-buffered cypress & bronze-pivoted sanctuary doorway (svLeaf + optional white-quartz keystone). */
function hsDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HS.WALL:o.t;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('granite',s*(w/2+.11),0,0,.2,h+.04,t+.1,P('granite'));
    /* Indigo felt acoustic buffer strip set +2.4 cm proud of jamb front */
    box('cypress',s*(w/2+.11),.18,(t+.1)/2+.024,.06,h-.28,.022,P('cypressD'));
   }
   box('granite',0,h+.04,0,w+.54,.24,t+.14,P('granite'));
   if(o.quartzCrown!==false){
    box('quartz',0,h+.28,0,.38,.16,t+.2,P('quartzPure'));
    cone('quartz',0,h+.44,0,.15,.22,P('quartzPure'),4);
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.05,h-.04,{
    mk:o.leafMk||'cypress',
    col:o.leafCol==null?P('cypress'):o.leafCol,
    style:o.style||'carved',
    pivot:!!o.pivot,
    hwCol:0xa88240,locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Thin-sawn translucent rock-crystal & quartz sanctuary window (svPane + blue-slate sill & lintel). */
function hsWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?HS.WALL:o.t;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('slate',0,-.08,0,w+.26,.08,t+.12,P('slate'));
   for(const s of [-1,1])box('granite',s*(w/2+.065),0,0,.11,h,t+.09,P('granite'));
   box('quartz',0,h,0,w+.28,.12,t+.13,P('quartz'));
  });
  svPane(0,0,0,0,w-.04,h-.02,{kind:o.lit!==false?'lit':'frosted',solid:!!o.solid,t:.03});
  windowAt(0,0,t/2,0,w,h,y);
 });
}

/* Closed 3D triangular gable wall prism (inset inside eaves so zero coplanar faces ever touch roof slabs). */
function hsGablePrism(mk,cx,gz,wBot,y0,y1,th,col){
 const hw=wBot/2,ht=th/2,zF=gz+ht,zB=gz-ht;
 const fL=[cx-hw,y0,zF],fR=[cx+hw,y0,zF],fT=[cx,y1,zF];
 const bL=[cx-hw,y0,zB],bR=[cx+hw,y0,zB],bT=[cx,y1,zB];
 poly(mk,[fL,fR,fT],col,false);
 poly(mk,[bR,bL,bT],col,false);
 poly(mk,[bL,fL,fT,bT],col,false);
 poly(mk,[fR,bR,bT,fT],col,false);
 poly(mk,[bL,bR,fR,fL],col,false);
}

/* Crisp blue-grey Silent-Vales slate pitched gable roof with closed 3D ashlar gables & mini snow-white quartz ridge finials. */
function hsSlateRoof(w,d,yEaves,rise,o){
 o=o||{};
 const rh=rise==null?1.85:rise,ovX=o.ovX==null?.52:o.ovX,ovZ=o.ovZ==null?.58:o.ovZ;
 const hw=w/2+ovX,lenZ=d+ovZ*2,wt=o.wt==null?HS.WALL:o.wt,th=.12;
 const mk=o.mk||'slate',col=o.col||P(mk);
 svNoWalk(()=>{
  if(o.gables!==false){
   const yGTop=Math.max(yEaves+.18,yEaves+rh-.15);
   for(const sz of [-1,1]){
    const gz=sz*(d/2-wt/2);
    hsGablePrism(o.gableMk||'ashlar',0,gz,w-.08,yEaves+.006,yGTop,wt-.03,P(o.gableMk||'ashlar'));
    if(o.gableQuartz!==false&&rh>=1.2){
     const zFace=sz*(d/2)+sz*.018;
     box('quartz',0,yEaves+rh*.44,zFace,.34,.34,.024,P('quartzPure'));
     box('nephrite',0,yEaves+rh*.44,zFace+sz*.024,.15,.15,.02,P('nephrite'));
    }
   }
  }
  const xIn=.07,dx=hw-xIn,dy=rh+.06,sLen=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
  for(const sx of [-1,1]){
   const mx=sx*(xIn+hw)*.5,my=yEaves+rh-(dy*.5)+.03;
   box(mk,mx,my-th*.5,0,sLen,th,lenZ,col,0,0,-sx*ang);
  }
  box('cypress',0,yEaves+rh+.04,0,.24,.13,lenZ+.06,P('cypress'));
  if(o.finials!==false){
   for(const sz of [-1,1]){
    const fz=sz*(lenZ/2-.22);
    box('quartz',0,yEaves+rh+.17,fz,.26,.12,.26,P('quartzPure'));
    cone('quartz',0,yEaves+rh+.29,fz,.14,.36,P('quartzPure'),4);
   }
  }
 });
 return yEaves+rh+.65;
}

/* Four-slope hipped blue-slate sanctuary roof crowned by a ridge or miniature stepped white-quartz lantern. */
function hsHipSlateRoof(w,d,yEaves,rise,o){
 o=o||{};
 const rh=rise==null?1.75:rise,ov=o.ov==null?.52:o.ov,mk=o.mk||'slate',col=o.col||P(mk);
 const w0=w+ov*2,d0=d+ov*2,w1=Math.max(.5,w*.32),d1=Math.max(.5,d*.32);
 svNoWalk(()=>{
  const nC=3;
  for(let i=0;i<nC;i++){
   const t0=i/nC,t1=(i+1)/nC,ya=yEaves+rh*t0,yb=yEaves+rh*t1;
   const cw=lerp(w0,w1,(t0+t1)*.5),cd=lerp(d0,d1,(t0+t1)*.5);
   box(mk,0,ya,0,cw,Math.max(.08,yb-ya),cd,col);
  }
  box('quartz',0,yEaves+rh+.004,0,w1+.12,.14,d1+.12,P('quartzPure'));
 });
 return yEaves+rh+.15;
}

/* Warm crystal-diffused Handspeak sign-lamp mounted at chest/hand height (y = 1.25 m above floor!) backed by a dished
   snow-white quartz parabolic reflector so signers' hands are brightly illuminated at dusk (--night). */
function hsHandLamp(x,y,z,yaw,o){
 o=o||{};
 const sc=o.scale==null?1:o.scale,mountH=o.mountH==null?HS.HAND_LAMP_Y:o.mountH;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   const z1=hsRigMath.formlineLayerZ(0,1),z2=hsRigMath.formlineLayerZ(0,2);
   /* Polished snow-white milky-quartz parabolic reflector dish + slate frame */
   box('slate',0,-.2*sc,z1,.42*sc,.44*sc,.02,P('slate'));
   box('quartz',0,-.15*sc,z2,.34*sc,.34*sc,.022,P('quartzPure'));
   /* Projecting bronze arm + glowing rock-crystal lantern diffuser */
   box('bronze',0,-.02*sc,.14*sc,.05*sc,.05*sc,.2*sc,P('bronze'));
   cyl('bronze',0,-.1*sc,.25*sc,.095*sc,.045*sc,P('bronze'),8);
   cyl('crystal',0,-.055*sc,.25*sc,.076*sc,.16*sc,P('crystal'),8);
   sph('glow',0,.025*sc,.25*sc,.048*sc,0xffd685,1,6);
   cone('bronze',0,.105*sc,.25*sc,.115*sc,.09*sc,P('bronze'),8);
  });
  haloAt(0,.02*sc,.26*sc,0xffd685,false);
  if(CURREC&&!PLACE_DRY){
   const reach=hsRigMath.handLampReach(mountH,sc);
   (CURREC.handLamps||(CURREC.handLamps=[])).push({mountY:mountH,reach});
  }
 });
}

/* Open colonnaded Handspeak sign-loggia / balcony (>= 65% clear sightlines across streets/courts, walkable deck,
   chest-height hsHandLamp reflectors at columns, and wind-swaying linen Handspeak banners!). */
function hsSignGallery(x,y,z,w,d,h,yaw,o){
 o=o||{};
 const bays=Math.max(2,o.bays==null?Math.max(2,Math.round(w/2.8)):o.bays),colR=o.colR==null?.17:o.colR;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   if(o.deck!==false)box('paving',0,-.12,0,w,.12,d,P('paving'));
   /* Open colonnade along front (+z) edge: wide clear spans for unbroken Two-Handed Sign Language sightlines */
   const zCol=d/2-.22;
   for(let i=0;i<=bays;i++){
    const cx=-w/2+.24+i*((w-.48)/bays);
    box('slate',cx,0,zCol,.42,.16,.42,P('slate'));
    cyl('granite',cx,.16,zCol,colR,h-.38,P('granite'),10);
    box('quartz',cx,h-.22,zCol,.44,.1,.44,P('quartzPure'));
    if(o.rail!==false&&i<bays&&!(o.openCenter&&i===Math.floor(bays/2))){
     const nx=-w/2+.24+(i+1)*((w-.48)/bays),mx=(cx+nx)/2,span=nx-cx-.46;
     if(span>.25){
      /* Low knee-height balustrade (<= 0.78 m) so waist-to-face Handspeak zone (0.85..1.85 m) stays 100% unobstructed! */
      box('cypress',mx,.68,zCol,span,.07,.09,P('cypress'));
      box('birch',mx,.34,zCol,span,.05,.07,P('birch'));
     }
    }
   }
   /* Architrave beam + crisp mono-pitch blue-slate loggia roof */
   box('cypress',0,h-.12,zCol,w+.16,.16,.28,P('cypressD'));
   const rAng=.18,sD=d+.52;
   box('slate',0,h+.18,0,w+.36,.1,sD,P('slate'),0,rAng,0);
  });
  if(o.walk!==false)wkPad(0,0,w-.16,d-.16,0);
  /* Chest-height (y = 1.25 m) crystal-diffused Handspeak reflector lamps facing signers */
  const zLamp=d/2-.42;
  hsHandLamp(-w*.3,HS.HAND_LAMP_Y,zLamp,PI,{mountH:HS.HAND_LAMP_Y});
  if(w>=5.6)hsHandLamp(w*.3,HS.HAND_LAMP_Y,zLamp,PI,{mountH:HS.HAND_LAMP_Y});
  if(o.banner!==false){
   withCloth((p,out)=>{
    const wgt=hsRigMath.hangPin(clamp(-p.y/1.1,0,1));
    out.set(wgt*.05,0,wgt*.12);
   },()=>{
    svNoWalk(()=>quad('linen',0,h-.68,d/2-.16,.62,.96,P('linen'),0));
   });
  }
 });
}

/* Lacquered cypress & bronze frame suspending two-tone elliptic bianzhong bells (chimeBronze) & L-shaped sawn emerald-nephrite
   440/660 Hz qing lithophone slabs (chimeNephrite), swaying silently as rigid pendulums in ATMOS wind! */
function hsHarmonicRack(x,y,z,w,yaw,o){
 o=o||{};
 const rw=w==null?2.4:w,rh=o.h==null?2.35:o.h,nChimes=Math.max(3,o.chimes==null?5:o.chimes);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-rw/2+.16,rw/2-.16]){
    box('granite',sx,0,0,.36,.18,.52,P('granite'));
    cyl('cypress',sx,.18,0,.095,rh-.28,P('cypressD'),8);
   }
   box('cypress',0,rh-.1,0,rw+.18,.12,.2,P('cypress'));
   box('bronze',0,rh+.02,0,rw*.62,.07,.22,P('bronze'));
   cone('quartz',0,rh+.09,0,.16,.28,P('quartzPure'),4);
   /* Lower & upper harmonic rails */
   const yTop=rh-.14;
   for(let i=0;i<nChimes;i++){
    const u=nChimes===1?.5:i/(nChimes-1),cx=lerp(-rw*.34,rw*.34,u);
    const isBell=(i%2===0),len=isBell?(.42-.03*Math.abs(i-2)):(.46-.03*Math.abs(i-2));
    /* Suspension pin at y = yTop: exact 0 wind drift at top eye, rigid-pendulum chimePin sway below! */
    withCloth((p,out)=>{
     const v=hsRigMath.chimePin(clamp((yTop-p.y)/(len+.14),0,1));
     out.set(v*.055,0,v*.11);
    },()=>{
     if(isBell){
      /* Elliptic two-tone bianzhong bronze bell suspended clear of posts/rails */
      box('chimeBronze',cx,yTop-.08,.06,.03,.08,.03,P('chimeBronze'));
      cyl('chimeBronze',cx,yTop-.08-len,.06,.095,len,P('chimeBronze'),10,.068);
     }else{
      /* L-shaped sawn emerald-nephrite qing 660 Hz lithophone slab */
      box('chimeNephrite',cx,yTop-.08,.06,.026,.08,.026,P('chimeNephrite'));
      box('chimeNephrite',cx,yTop-.08-len*.78,.06,.22,len*.72,.042,P('chimeNephrite'),0,0,.22);
     }
    });
   }
  });
  if(CURREC&&!PLACE_DRY){
   const freqs=[];
   for(let i=0;i<nChimes;i++)freqs.push(hsRigMath.harmonicFreqHz(i));
   (CURREC.harmonicRacks||(CURREC.harmonicRacks=[])).push({chimes:nChimes,freqs});
  }
 });
}

/* Carved pale-granite & snow-white-quartz Raised Open-Palm Boundary Monolith (>= 2.0 cm z-stepped palm + 5 fingers + quartz halo). */
function hsPalmMonolith(x,y,z,h,yaw,o){
 o=o||{};
 const mh=h==null?2.85:h,mw=mh*.34,md=mh*.18;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('slate',0,0,0,mw+.34,.18,md+.34,P('slate'));
   box('granite',0,.18,0,mw,mh*.68,md,P('granite'));
   /* Stepped mini white-quartz pyramid cap crowning the monolith */
   const yCap=.18+mh*.68;
   box('quartz',0,yCap,0,mw+.1,.12,md+.1,P('quartzPure'));
   box('quartz',0,yCap+.12,0,mw*.74,.11,md*.78,P('quartzPure'));
   cone('quartz',0,yCap+.23,0,mw*.28,mh*.16,P('quartzPure'),4);
   /* Z-stepped Open-Palm Sanctuary relief on +z front face (>= 2.0 cm per layer: zero coplanar faces!) */
   const zF=md/2,z1=hsRigMath.formlineLayerZ(zF,1),z2=hsRigMath.formlineLayerZ(zF,2),z3=hsRigMath.formlineLayerZ(zF,3);
   const yMid=.18+mh*.38;
   /* Layer 1: Gleaming snow-white quartz halo tablet */
   box('quartz',0,yMid-.26*mh,z1,mw*.72,mh*.44,.018,P('quartzPure'));
   /* Layer 2: Raised alabaster/granite open palm + 4 vertical fingers + angled thumb */
   box('alabaster',0,yMid-.18*mh,z2,mw*.36,mh*.16,.018,P('alabaster'));
   for(let f=0;f<4;f++){
    const fx=(f-1.5)*mw*.092,fh=mh*(f===1||f===2?.17:.145);
    box('alabaster',fx,yMid-.015*mh,z2,mw*.064,fh,.018,P('alabaster'));
   }
   box('alabaster',-mw*.23,yMid-.12*mh,z2,mw*.068,mh*.12,.018,P('alabaster'),0,0,.38);
   /* Layer 3: Sawn emerald-nephrite harmonic heart inlay in the centre of the open palm */
   box('nephrite',0,yMid-.12*mh,z3,mw*.13,mh*.07,.016,P('nephrite'));
  });
  if(CURREC&&!PLACE_DRY){
   (CURREC.palmMonoliths||(CURREC.palmMonoliths=[])).push({h:mh});
  }
 });
}

/* Wind-swaying Handspeak colour-signal banner pole (linen, felt or flag in SV_CLOTH). */
function hsSignBanner(x,y,z,yaw,h,o){
 o=o||{};
 const bh=h==null?3.2:h,mk=o.mk||'linen',col=o.col||P(mk);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('granite',0,0,0,.32,.14,.32,P('granite'));
   cyl('birch',0,.14,0,.044,bh-.14,P('birch'),8);
   cone('quartz',0,bh,0,.065,.2,P('quartzPure'),4);
   box('bronze',0,bh-.22,0,.82,.04,.04,P('bronze'));
   withCloth((p,out)=>{
    const wgt=hsRigMath.hangPin(clamp((bh-.26-p.y)/(bh*.5),0,1));
    out.set(wgt*.07,0,wgt*.16);
   },()=>{
    quad(mk,0,bh-.26-bh*.25,.045,.7,bh*.5,col,0);
   });
  });
 });
}

/* Span line of silent lake-ferry pennants, drying alpine herbs or char nets (exact 0 pin drift at both ends). */
function hsSpanPennants(x0,z0,x1,z1,y,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.4)return;
 const yaw=Math.atan2(dx,dz),mk=o.mk||'felt',segs=8;
 W(x0,y,z0,yaw,()=>{
  svNoWalk(()=>{
   for(const ez of [0,L])cyl('cypress',0,-y,ez,.055,y+.14,P('cypressD'),7);
   beam('rope',[0,0,0],[0,0,L],.022,P('rope'));
   withCloth((p,out)=>{
    const u=clamp(p.z/L,0,1),wgt=hsRigMath.spanPin(u);
    const drop=clamp(-p.y/.55,0,1);
    const tot=Math.min(1,wgt*.65+drop*wgt*.55);
    out.set(tot*.12,0,tot*.05);
   },()=>{
    for(let i=0;i<segs;i++){
     const za=L*i/segs,zb=L*(i+1)/segs,zm=(za+zb)/2;
     const sag0=-.16*Math.sin(PI*i/segs),sag1=-.16*Math.sin(PI*(i+1)/segs);
     poly(mk,[
      [.035,sag0,za],[.035,sag1,zb],[.035,sag1-.42,zb],[.035,sag0-.42,za]
     ],i%2===0?P(mk):P('linen'),true);
    }
   });
  });
 });
}
