/* prefix: sm */
// ================================================================= SHUMARI ARCHITECTURAL TOOLKIT
// Highland basalt ishigaki plinths, horizontal ablaq coursed masonry, stepped shurafat parapets, monumental Mamluk pishtaq
// portals, Free Giant + human dual-tread stairs, crimson-lacquered mashrabiya bays, and culture-neutral socket mounts.

function smBindRec(d){
 if(!CURREC||!d)return;
 CURREC.giant=!!d.giant;
 CURREC.solidMarker=!!d.solidMarker;
 CURREC.caste=d.caste||null;
 CURREC.vaultH=d.vaultH==null?0:d.vaultH;
 CURREC.walkTargets=[];
 CURREC.domes=[];
 CURREC.sockets=[];
}

function smWalkTarget(name,x,y,z,o){
 if(!CURREC||PLACE_DRY)return;
 const opt=o||{};
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 if(!CURREC.walkTargets)CURREC.walkTargets=[];
 CURREC.walkTargets.push({name,x:p.x,y:p.y,z:p.z,outside:!!opt.outside});
}

function smSocket(kind,x,y,z,ry,o){
 const opt=o||{};
 const sc=opt.scale==null?1:opt.scale;
 W(x,y,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   box('bronzeCast',0,-.06*sc,.04*sc,.18*sc,.14*sc,.12*sc,P('bronze'));
   if(kind==='banner'){
    pole('bronze',[0,0,.08*sc],[0,1.55*sc,.26*sc],.028*sc,P('bronze'),8);
    beam('bronze',[-.34*sc,1.42*sc,.24*sc],[.34*sc,1.42*sc,.24*sc],.022*sc,P('gold'),true,6);
    withCloth(clothHang(.95*sc,.06),()=>{
     box('flag',0,.92*sc,.25*sc,.58*sc,.96*sc,.018*sc,P('lacquer'));
     box('flag',0,.48*sc,.255*sc,.58*sc,.12*sc,.02*sc,P('gold'));
    });
   }else{
    cyl('bronzeCast',0,.18*sc,.07*sc,.26*sc,.05*sc,P('bronze'),12,null,false);
    sph('gold',0,.18*sc,.10*sc,.08*sc,P('gold'),.55,10);
   }
  });
 });
 if(CURREC&&!PLACE_DRY){
  const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
  const e=CM.elements;
  const wry=Math.atan2(e[8],e[10])+(ry==null?0:ry);
  if(!CURREC.sockets)CURREC.sockets=[];
  CURREC.sockets.push({kind:kind||'shield',x:p.x,y:p.y,z:p.z,ry:wry});
 }
}

/* Course material selector for horizontal ablaq ashlar: dark basalt, cream travertine, and periodic crimson ironstone */
function smAblaqCourse(idx,mode){
 if(mode==='basalt'){return {mk:'basalt',col:P('basalt')};}
 const k=((idx%6)+6)%6;
 if(k===0||k===2||k===4)return {mk:'basalt',col:P('basalt')};
 if(k===3)return {mk:'ironstone',col:P('ironstone')};
 return {mk:'travertine',col:P('travertine')};
}

/* Battered polygonal basalt flood/frost plinth (ishigaki slope + dressed corner quoins + walkable flagstone top slab) */
function smPlinth(w,d,h,o){
 const opt=o||{};
 if(h<=.04)return;
 const bat=opt.batter==null?Math.min(.42,h*.28):opt.batter;
 const kerbH=Math.min(.18,h*.22);
 const bodyH=h-kerbH;
 const hwT=w*.5,hdT=d*.5;
 const hwB=hwT+bat,hdB=hdT+bat;
 svNoWalk(()=>{
  /* Four battered polygonal basalt aprons */
  const faces=[
   [[-hwB,-hdB],[hwB,-hdB],[hwT,-hdT],[-hwT,-hdT]],
   [[hwB,-hdB],[hwB,hdB],[hwT,hdT],[hwT,-hdT]],
   [[hwB,hdB],[-hwB,hdB],[-hwT,hdT],[hwT,hdT]],
   [[-hwB,hdB],[-hwB,-hdB],[-hwT,-hdT],[-hwT,hdT]]
  ];
  for(const F of faces){
   psurf('rubble',(u,v)=>{
    const bx=lerp(F[0][0],F[1][0],u),bz=lerp(F[0][1],F[1][1],u);
    const tx=lerp(F[3][0],F[2][0],u),tz=lerp(F[3][1],F[2][1],u);
    return [lerp(bx,tx,v),v*bodyH,lerp(bz,tz,v)];
   },4,3,P('rubble'),{flip:true});
  }
  /* Dressed basalt corner quoins along the batter */
  const qn=Math.max(2,Math.round(bodyH/.32));
  const qh=bodyH/qn;
  for(let i=0;i<qn;i++){
   const t=(i+.5)/qn;
   const cx=lerp(hwB-.16,hwT-.12,t),cz=lerp(hdB-.16,hdT-.12,t);
   const qw=i%2===0?.46:.34,qd=i%2===0?.34:.46;
   for(const sx of [-1,1])for(const sz of [-1,1]){
    const useTrav=opt.ablaqQuoins&&i%3===1;
    box(useTrav?'travertine':'basalt',sx*cx,i*qh,sz*cz,qw,qh-.01,qd,useTrav?P('travertine'):P('basaltDark'));
   }
  }
  /* Moulded basalt kerb collar */
  box('basalt',0,bodyH,0,w+.08,kerbH*.55,d+.08,P('basaltDark'));
 });
 /* Walkable top flagstone slab (flat thickness <= 0.24 m so KWALKBOX records it as a clean floor at y = h) */
 const slabT=Math.min(.22,h);
 box(opt.topMk||'paving',0,h-slabT,0,w,slabT,d,P(opt.topPal||'paving'));
}

/* Stepped prism muqarnas corbel row along local X (+z facing outward) */
function smMuqarnasRow(x,y,z,w,h,d,ry,tiers){
 const nt=tiers==null?3:tiers;
 const th=h/nt;
 W(x,y,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   for(let t=0;t<nt;t++){
    const frac=(t+1)/nt;
    const dz=d*(.35+.65*frac);
    const cellW=Math.max(.26,.38-t*.04);
    const nc=Math.max(2,Math.floor(w/cellW));
    const stepW=w/nc;
    for(let i=0;i<nc;i++){
     const off=(t%2)*.5;
     const cx=-w*.5+(i+.5)*stepW;
     const isDark=(i+t)%2===0;
     const mk=isDark?'basalt':'travertine';
     const col=isDark?P('basalt'):P('travertine');
     box(mk,cx,t*th,dz*.5,stepW*.92,th,dz,col);
     if(i<nc-1&&off===0){
      box(isDark?'travertine':'basalt',cx+stepW*.5,t*th+.02,dz*.38,stepW*.42,th*.78,dz*.75,isDark?P('travShade'):P('basaltDark'));
     }
    }
   }
  });
 });
}

/* Pointed two-centred Mamluk ablaq voussoir arch filling rectangle [-w/2..w/2, 0..h] around a clear arched intrados */
function smAblaqArch(w,h,t,o){
 const opt=o||{};
 const span=opt.openW==null?w*.66:opt.openW;
 const springY=opt.springY==null?h*.36:opt.springY;
 const rise=Math.max(.35,h-springY-.22);
 const nv=opt.voussoirs==null?13:opt.voussoirs;
 const half=span*.5;
 svNoWalk(()=>{
  /* Pointed intrados curve helper: angle s in [0, 1] from left springer to apex (0.5) to right springer (1) */
  const ptIn=s=>{
   if(s<=.5){
    const u=s*2;
    const ang=u*(PI*.5);
    return [-half*Math.cos(ang),springY+rise*Math.pow(Math.sin(ang),.82)];
   }
   const u=(1-s)*2;
   const ang=u*(PI*.5);
   return [half*Math.cos(ang),springY+rise*Math.pow(Math.sin(ang),.82)];
  };
  const vDepth=Math.min(.44,(w-span)*.48);
  for(let i=0;i<nv;i++){
   const s0=i/nv,s1=(i+1)/nv;
   const a0=ptIn(s0),a1=ptIn(s1);
   const mx=(a0[0]+a1[0])*.5,my=(a0[1]+a1[1])*.5;
   const nx0=a0[0]/(half+.01),ny0=Math.max(.18,(a0[1]-springY)/(rise+.01));
   const nL0=Math.hypot(nx0,ny0);
   const nx1=a1[0]/(half+.01),ny1=Math.max(.18,(a1[1]-springY)/(rise+.01));
   const nL1=Math.hypot(nx1,ny1);
   const b0=[clamp(a0[0]+nx0/nL0*vDepth,-w*.5,w*.5),Math.min(h,a0[1]+ny0/nL0*vDepth*1.18)];
   const b1=[clamp(a1[0]+nx1/nL1*vDepth,-w*.5,w*.5),Math.min(h,a1[1]+ny1/nL1*vDepth*1.18)];
   const cIdx=Math.abs(i-((nv-1)/2|0));
   const mk=cIdx===0?'ironstone':(i%2===0?'basalt':'travertine');
   const col=cIdx===0?P('ironstone'):(i%2===0?P('basalt'):P('travertine'));
   const pts2=[a0,a1,b1,b0];
   /* Extrude voussoir wedge along Z [-t/2, t/2] using prism in -PI/2 X-rotated frame so local Z maps to +Y */
   WX(0,0,0,0,-PI*.5,0,()=>{
    prism(mk,pts2.map(p=>[p[0],p[1]]),-t*.5,t*.5,col);
   });
   void mx;void my;
  }
  /* Spandrel corner fills up to top frame h */
  const topBand=Math.max(.10,h-(springY+rise+vDepth*1.05));
  if(topBand>.06){
   box('travertine',0,h-topBand,0,w,topBand,t,P('travertine'));
  }
  const sideW=Math.max(.08,(w-span)*.5-vDepth*.85);
  if(sideW>.06){
   for(const sx of [-1,1]){
    box('basalt',sx*(w*.5-sideW*.5),0,0,sideW,Math.max(.1,h-topBand),t,P('basalt'));
   }
  }
 });
}

/* Stepped Mamluk blade-shurafat merlon (refs/01..03) */
function smShurafatMerlon(x,y,z,ry,sc){
 const s=sc==null?1:sc;
 W(x,y,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   box('chiselled',0,0,0,.42*s,.14*s,.24*s,P('travShade'));
   box('travertine',0,.14*s,0,.48*s,.22*s,.22*s,P('travertine'));
   box('travertine',0,.36*s,0,.34*s,.22*s,.20*s,P('travertine'));
   box('travertine',0,.58*s,0,.18*s,.18*s,.18*s,P('ashlar'));
   cone('travertine',0,.76*s,0,.10*s,.16*s,P('ashlar'),4);
  });
 });
}

/* Window dressing inside an ablaq wall cutout: carved stone frame, jali lattice, and real glass pane */
function smDressWindow(op,t){
 const w=op.w,h=op.h;
 const frameT=.09;
 W(op.x,op.y,0,0,()=>{
  svNoWalk(()=>{
   box('travertine',0,0,0,w+.12,.10,t+.08,P('travShade'));
   box('travertine',-w*.5+.04,.08,0,frameT,h-.16,t+.04,P('travertine'));
   box('travertine',w*.5-.04,.08,0,frameT,h-.16,t+.04,P('travertine'));
   /* Joggled ablaq lintel */
   const nL=5,lw=(w+.14)/nL;
   for(let i=0;i<nL;i++){
    const mk=i===2?'ironstone':(i%2===0?'basalt':'travertine');
    const col=i===2?P('ironstone'):(i%2===0?P('basalt'):P('travertine'));
    box(mk,-(w+.14)*.5+(i+.5)*lw,h-.10,0,lw,.18,t+.06,col);
   }
   if(op.jali!==false){
    box('jali',0,.08,.04,w-.16,h-.18,.025,P('travertine'));
   }
   if(op.bars){
    const nb=Math.max(2,Math.round(w/.28));
    for(let i=1;i<nb;i++){
     const bx=-w*.5+i*(w/nb);
     pole('bronze',[bx,.08,-.03],[bx,h-.10,-.03],.016,P('bronze'),6);
    }
   }
  });
  svPane(0,.08,-.01,0,Math.max(.18,w-.16),Math.max(.22,h-.18),{
   kind:op.glassKind||'smoked',
   color:op.glassColor,
   solid:!!op.solid
  });
  windowAt(0,0,t*.5,0,w,h,op.y);
 });
}

/* Horizontal ablaq coursed wall along local X [-L/2..L/2] from y0 to y0+h with clean opening cutouts */
function smAblaqWall(L,y0,h,opens,o){
 const opt=o||{};
 const t=opt.t==null?.48:opt.t;
 const courseH=opt.courseH==null?.38:opt.courseH;
 const ops=(opens||[]).slice().sort((a,b)=>a.x-b.x);
 const nc=Math.max(2,Math.round(h/courseH));
 const ch=h/nc;
 const xMin=-L*.5,xMax=L*.5;

 /* Emit coursed ablaq segments, cleanly split around every doorway and window opening */
 for(let c=0;c<nc;c++){
  const cy0=y0+c*ch,cy1=cy0+ch;
  const mat=smAblaqCourse(c+(opt.courseOff==null?0:opt.courseOff),opt.mode);
  let curX=xMin;
  for(const op of ops){
   const oy0=op.y,oy1=op.y+op.h;
   if(cy1<=oy0+.002||cy0>=oy1-.002)continue;
   const ox0=Math.max(xMin,op.x-op.w*.5),ox1=Math.min(xMax,op.x+op.w*.5);
   if(ox0>curX+.02){
    const segW=ox0-curX;
    /* Small course slices above/beside openings: keep wall collision accurate via tall pier blocks below, avoid 200 tiny blocks */
    svNoWalk(()=>box(mat.mk,curX+segW*.5,cy0,0,segW,ch,t,mat.col));
   }
   curX=Math.max(curX,ox1);
  }
  if(xMax>curX+.02){
   const segW=xMax-curX;
   svNoWalk(()=>box(mat.mk,curX+segW*.5,cy0,0,segW,ch,t,mat.col));
  }
 }

 /* Register clean full-height structural wall piers for KWALKBOX between full-height door openings */
 const doorOps=ops.filter(op=>op.y<=y0+.45).sort((a,b)=>a.x-b.x);
 if(!opt.noWalk){
  let wx=xMin;
  for(const op of doorOps){
   const ox0=Math.max(xMin,op.x-op.w*.5),ox1=Math.min(xMax,op.x+op.w*.5);
   if(ox0>wx+.08){
    const pw=ox0-wx;
    /* Thin invisible-inside basalt core pier so KWALKBOX gets one crisp wall block per pier */
    box('basalt',wx+pw*.5,y0+.02,0,pw,Math.max(.85,h-.04),t*.78,P('basalt'));
   }
   wx=Math.max(wx,ox1);
  }
  if(xMax>wx+.08){
   const pw=xMax-wx;
   box('basalt',wx+pw*.5,y0+.02,0,pw,Math.max(.85,h-.04),t*.78,P('basalt'));
  }
 }

 /* Dress windows and arched openings */
 for(const op of ops){
  if(op.kind==='window'){
   smDressWindow(op,t);
  }else if(op.kind==='arch'){
   W(op.x,op.y,0,0,()=>{
    const jambH=op.springY==null?op.h*.52:op.springY;
    svNoWalk(()=>{
     for(const sx of [-1,1]){
      box('travertine',sx*(op.w*.5-.06),0,0,.12,jambH,t+.04,P('travShade'));
     }
    });
    W(0,jambH,0,0,()=>smAblaqArch(op.w+.24,op.h-jambH+.22,t+.04,{openW:op.w-.04,springY:.05}));
   });
  }
 }
}

/* Four-wall hollow ablaq masonry room with corner piers, paved interior floor, and clean interior wall faces */
function smHollowAblaq(w,d,y0,h,o){
 const opt=o||{};
 const t=opt.t==null?.48:opt.t;
 const hw=w*.5,hd=d*.5;
 /* Thin interior stone inlay (smPlinth provides the walkable KWALK floor at y0 so floors never double-stack) */
 if(opt.floor!==false){
  svNoWalk(()=>box(opt.floorMk||'travertine',0,y0-.01,0,w-t,.03,d-t,P(opt.floorPal||'travShade')));
 }
 /* Four coursed ablaq walls facing outward (+z, -z, +x, -x) */
 W(0,0,hd-t*.5,0,()=>smAblaqWall(w,y0,h,opt.front||[],{t,courseH:opt.courseH,mode:opt.mode}));
 W(0,0,-hd+t*.5,PI,()=>smAblaqWall(w,y0,h,opt.back||[],{t,courseH:opt.courseH,courseOff:1,mode:opt.mode}));
 W(hw-t*.5,0,0,PI*.5,()=>smAblaqWall(d-t*2,y0,h,opt.right||[],{t,courseH:opt.courseH,courseOff:2,mode:opt.mode}));
 W(-hw+t*.5,0,0,-PI*.5,()=>smAblaqWall(d-t*2,y0,h,opt.left||[],{t,courseH:opt.courseH,courseOff:3,mode:opt.mode}));

 /* Corner chamfered basalt-and-travertine pilasters */
 svNoWalk(()=>{
  const pw=t+.08;
  for(const sx of [-1,1])for(const sz of [-1,1]){
   box('basalt',sx*(hw-pw*.46),y0,sz*(hd-pw*.46),pw,h,pw,P('basaltDark'));
   cyl('travertine',sx*(hw-.04),y0+.35,sz*(hd-.04),.11,Math.max(.4,h-.75),P('travertine'),10,null,false);
   box('bronzeCast',sx*(hw-.04),y0+.26,sz*(hd-.04),.26,.10,.26,P('bronze'));
   box('bronzeCast',sx*(hw-.04),y0+h-.42,sz*(hd-.04),.28,.12,.28,P('bronze'));
  }
 });
}

/* Flat snow-load stone roof slab (with optional central drum opening) + muqarnas cornice + shurafat merlons + snow spouts */
function smParapet(w,d,y,o){
 const opt=o||{};
 const slabT=.26;
 const hole=opt.hole||null;
 if(opt.roofSlab!==false){
  svWell('paving',0,y-slabT,0,w,slabT,d,P('paving'),hole,{walk:!!opt.walkRoof});
  /* Interior ceiling soffit in pale dressed travertine around any central dome opening */
  svWell('travertine',0,y-slabT-.05,0,w-.6,.05,d-.6,P('ashlar'),hole,{walk:false});
 }
 const hw=w*.5,hd=d*.5;
 const skipFront=opt.skipFrontW==null?0:opt.skipFrontW;
 svNoWalk(()=>{
  /* Projecting cornice + frieze belt */
  const cOut=.18;
  if(skipFront>0){
   const seg=(w+cOut*2-skipFront)*.5;
   if(seg>.2){
    box('chiselled',-(skipFront*.5+seg*.5),y,hd+.02,seg,.22,.28,P('travShade'));
    box('chiselled',(skipFront*.5+seg*.5),y,hd+.02,seg,.22,.28,P('travShade'));
   }
  }else{
   box('chiselled',0,y,hd+.02,w+cOut*2,.22,.28,P('travShade'));
  }
  box('chiselled',0,y,-hd-.02,w+cOut*2,.22,.28,P('travShade'));
  box('chiselled',hw+.02,y,0,.28,.22,d+cOut*2,P('travShade'));
  box('chiselled',-hw-.02,y,0,.28,.22,d+cOut*2,P('travShade'));

  /* Low parapet kerb wall */
  const kerbY=y+.22,kerbH=.32;
  if(skipFront>0){
   const seg=(w-skipFront)*.5;
   if(seg>.2){
    box('basalt',-(skipFront*.5+seg*.5),kerbY,hd-.12,seg,kerbH,.24,P('basalt'));
    box('basalt',(skipFront*.5+seg*.5),kerbY,hd-.12,seg,kerbH,.24,P('basalt'));
   }
  }else{
   box('basalt',0,kerbY,hd-.12,w,kerbH,.24,P('basalt'));
  }
  box('basalt',0,kerbY,-hd+.12,w,kerbH,.24,P('basalt'));
  box('basalt',hw-.12,kerbY,0,.24,kerbH,d,P('basalt'));
  box('basalt',-hw+.12,kerbY,0,.24,kerbH,d,P('basalt'));

  /* Perimeter stepped Mamluk blade-shurafat merlons */
  const my=kerbY+kerbH;
  const step=.76;
  const nx=Math.max(3,Math.round((w-.4)/step));
  for(let i=0;i<=nx;i++){
   const px=-hw+.2+i*((w-.4)/nx);
   if(!(skipFront>0&&Math.abs(px)<skipFront*.5+.15)){
    smShurafatMerlon(px,my,hd-.10,0,.92);
   }
   smShurafatMerlon(px,my,-hd+.10,PI,.92);
  }
  const nz=Math.max(3,Math.round((d-.4)/step));
  for(let i=1;i<nz;i++){
   const pz=-hd+.2+i*((d-.4)/nz);
   smShurafatMerlon(hw-.10,my,pz,PI*.5,.92);
   smShurafatMerlon(-hw+.10,my,pz,-PI*.5,.92);
  }

  /* Carved basalt snow-melt spouts (mizab) projecting from side cornices */
  for(const sx of [-1,1])for(const sz of [-.28,.28]){
   W(sx*(hw+.24),y+.06,sz*d,sx>0?PI*.5:-PI*.5,()=>{
    box('basalt',0,0,.18,.24,.16,.52,P('basaltDark'));
    box('bronzeCast',0,.08,.36,.16,.10,.24,P('bronzeDark'));
   });
  }
 });
}

/* Compound Giant + human dual-tread stone flight (>= 2.4 m wide) registered cleanly on KWALK */
function smCompoundStair(x,z,y0,y1,yaw,o){
 const opt=o||{};
 const rise=y1-y0;
 if(rise<=.05)return null;
 const w=Math.max(SM_STAIR_MIN_W,opt.w==null?2.8:opt.w);
 const humanN=Math.max(2,Math.ceil(rise/.20-1e-9));
 const evenN=humanN%2===0?humanN:humanN+1;
 const giantN=Math.max(1,evenN/2);
 const hRiser=rise/evenN;
 const gRiser=rise/giantN;
 const hGoing=opt.going==null?.32:opt.going;
 const gGoing=hGoing*2;
 const run=evenN*hGoing;
 const sideW=Math.min(.62,w*.23);
 const midW=w-sideW*2;
 const ux=Math.sin(yaw==null?0:yaw),uz=Math.cos(yaw==null?0:yaw);
 const px=uz,pz=-ux;
 const at=(s,r)=>[x+ux*s+px*r,z+uz*s+pz*r];
 const yawB=Math.atan2(ux,uz);

 svNoWalk(()=>{
  /* Central Giant basalt treads (~0.40 m riser, double going) */
  for(let g=0;g<giantN;g++){
   const s0=g*gGoing,s1=(g+1)*gGoing+.02;
   const topY=y0+(g+1)*gRiser;
   const q=at((s0+s1)*.5,0);
   box('basalt',q[0],y0,q[1],midW,topY-y0-.05,s1-s0,P('basalt'),yawB);
   box('paving',q[0],topY-.05,q[1],midW+.02,.05,s1-s0+.03,P('paving'),yawB);
  }
  /* Flanking left & right half-riser human travertine-and-basalt steps */
  for(const sd of [-1,1]){
   const rOff=sd*(midW*.5+sideW*.5);
   for(let i=0;i<evenN;i++){
    const s0=i*hGoing,s1=(i+1)*hGoing+.02;
    const topY=y0+(i+1)*hRiser;
    const q=at((s0+s1)*.5,rOff);
    box('basalt',q[0],y0,q[1],sideW,topY-y0-.05,s1-s0,P('basaltDark'),yawB);
    box('travertine',q[0],topY-.05,q[1],sideW,.05,s1-s0+.02,P('travertine'),yawB);
   }
   /* Stepped ablaq cheek-walls & bronze-capped foot newels */
   const rWall=sd*(w*.5+.16);
   for(let g=0;g<giantN;g++){
    const sMid=(g+.5)*gGoing;
    const q=at(sMid,rWall);
    const wy=y0+(g+1)*gRiser+.34;
    const mk=g%2===0?'basalt':'travertine';
    box(mk,q[0],y0,q[1],.28,wy-y0,gGoing+.02,P(mk),yawB);
    box('chiselled',q[0],wy,q[1],.32,.07,gGoing+.06,P('travShade'),yawB);
   }
   const fNewel=at(.14,rWall);
   box('basalt',fNewel[0],y0,fNewel[1],.36,.68,.36,P('basaltDark'),yawB);
   sph('bronzeCast',fNewel[0],y0+.76,fNewel[1],.12,P('bronze'),1,10);
  }
 });

 /* Register walkable ramp strip + top landing pad on KWALK */
 if(svWalkOn()){
  const f=at(0,0),t=at(run,0);
  const A=svWP(f[0],y0,f[1]),B=svWP(t[0],y1,t[1]);
  const tag='stair:'+CURKEY;
  KWALK.strip({a:A,b:B,w:w,name:'stair',tag});
  const Ppad=[[run-.15,-w*.5],[run+.45,-w*.5],[run+.45,w*.5],[run-.15,w*.5]].map(p=>{
   const q=at(p[0],p[1]);
   return svWP(q[0],y1,q[1]);
  });
  KWALK.poly({pts:Ppad,name:'landing',tag});
 }
 SV_STAIR.n++;
 return {w,run,foot:at(0,0),top:at(run,0)};
}

/* Monumental recessed Mamluk pishtaq portal rising above roofline (refs/03) */
function smPishtaq(x,y0,z,o){
 const opt=o||{};
 const giant=opt.giant==null?true:!!opt.giant;
 const doorH=opt.doorH==null?(giant?SM_GIANT_DOOR:SM_HUMAN_DOOR):opt.doorH;
 const doorW=opt.doorW==null?(giant?2.45:1.35):opt.doorW;
 const totalW=opt.w==null?(giant?5.8:3.6):opt.w;
 const totalH=opt.h==null?(giant?8.6:5.2):opt.h;
 const depth=opt.d==null?1.35:opt.d;
 const nicheW=doorW+(giant?1.05:.65);
 const pylonW=(totalW-nicheW)*.5;
 const lintelH=.42;
 const transomY=doorH+lintelH;
 const archSpringY=Math.min(totalH-2.1,transomY+(giant?1.25:.75));
 const archTopY=totalH-.72;

 W(x,y0,z,opt.ry==null?0:opt.ry,()=>{
  /* Threshold stone inlay inside the recessed iwan (walkable floor provided by smPlinth at y0) */
  svNoWalk(()=>box('travertine',0,-.01,depth*.5,totalW,.03,depth+.16,P('travShade')));

  /* Left & right coursed ablaq pylons (real collision blocks flanking the clear iwan niche) */
  const courseH=.38;
  const nc=Math.max(4,Math.round(totalH/courseH));
  const ch=totalH/nc;
  for(const sx of [-1,1]){
   const px=sx*(nicheW*.5+pylonW*.5);
   box('basalt',px,.02,depth*.5,pylonW-.06,totalH-.10,depth-.06,P('basalt'));
   svNoWalk(()=>{
    for(let c=0;c<nc;c++){
     const m=smAblaqCourse(c);
     box(m.mk,px,c*ch,depth*.5,pylonW,ch,depth,m.col);
    }
    /* Slender engaged corner colonnettes with bronze rings & carved capitals (refs/03) */
    const colX=sx*(totalW*.5-.08),colZ=depth-.06;
    box('basalt',colX,0,colZ,.26,.42,.26,P('basaltDark'));
    box('bronzeCast',colX,.42,colZ,.22,.09,.22,P('bronze'));
    cyl('ashlar',colX,.51,colZ,.095,totalH-1.35,P('ashlar'),12,null,false);
    box('bronzeCast',colX,totalH-.84,colZ,.22,.09,.22,P('bronze'));
    box('travertine',colX,totalH-.75,colZ,.28,.24,.28,P('travertine'));
   });
  }

  /* Recessed rear portal spandrel above doorway, joggled lintel, jali lights, muqarnas iwan hood & pointed ablaq arch */
  svNoWalk(()=>{
   /* Carved door jambs */
   for(const sx of [-1,1]){
    box('travertine',sx*(doorW*.5+.14),0,.16,.28,doorH+lintelH,.38,P('travertine'));
   }
   /* Joggled polychrome Mamluk flat arch lintel over the doorway */
   const nj=7,jw=(doorW+.56)/nj;
   for(let i=0;i<nj;i++){
    const mk=i===3?'ironstone':(i%2===0?'basalt':'travertine');
    const col=i===3?P('ironstone'):(i%2===0?P('basalt'):P('travertine'));
    box(mk,-(doorW+.56)*.5+(i+.5)*jw,doorH,.18,jw,lintelH,.42,col);
   }
   /* Relief frieze band above lintel */
   box('frieze',0,transomY,.16,nicheW,.36,.32,0xffffff);

   /* Triplet jali grille windows above lintel (refs/03) */
   const winY=transomY+.40;
   const winH=Math.max(.42,archSpringY-winY-.14);
   if(winH>=.40){
    const nw=giant?3:2;
    const spanW=nicheW-.28;
    const cellW=spanW/nw;
    for(let i=0;i<nw;i++){
     const wx=-spanW*.5+(i+.5)*cellW;
     box('travertine',wx,winY,.14,cellW*.20,winH,.26,P('travShade'));
     box('jali',wx,winY+.04,.18,cellW*.72,winH-.08,.03,P('travertine'));
     svPane(wx,winY+.04,.12,0,cellW*.70,winH-.08,{kind:'lit',solid:false});
    }
    /* Solid rear spandrel piers between triplet lights */
    for(let i=0;i<=nw;i++){
     const px=-spanW*.5+i*cellW;
     box('basalt',px,winY,.14,.14,winH,.28,P('basalt'));
    }
   }

   /* Recessed rear head wall above arch spring + stepped prism muqarnas vault hood */
   box('travertine',0,archSpringY,.10,nicheW,archTopY-archSpringY,.24,P('travShade'));
   const hoodH=Math.max(.85,archTopY-archSpringY-.18);
   smMuqarnasRow(0,archSpringY,0.18,nicheW-.08,hoodH,depth-.26,0,giant?4:3);

   /* Outer pointed ablaq voussoir portal arch at the front plane of the iwan */
   W(0,archSpringY-.12,depth-.20,0,()=>{
    smAblaqArch(nicheW+.36,archTopY-archSpringY+.42,.40,{openW:nicheW-.04,springY:.14,voussoirs:15});
   });

   /* Soaring pishtaq crown: epigraphic frieze, muqarnas cornice, and stepped blade-shurafat cresting */
   box('frieze',0,archTopY,depth*.5,totalW+.08,.34,depth+.08,0xffffff);
   smMuqarnasRow(0,archTopY+.34,depth,totalW+.14,.28,.22,0,2);
   box('chiselled',0,archTopY+.62,depth*.5,totalW+.28,.16,depth+.28,P('travertine'));
   const nm=Math.max(4,Math.round((totalW-.3)/.72));
   for(let i=0;i<=nm;i++){
    const mx=-totalW*.5+.15+i*((totalW-.3)/nm);
    smShurafatMerlon(mx,archTopY+.78,depth-.04,0,.96);
   }
  });

  /* Culture-neutral cast-bronze portal sockets flanking the pishtaq arch */
  if(opt.sockets!==false){
   for(const sx of [-1,1]){
    smSocket(opt.socketKind||'shield',sx*(nicheW*.5+pylonW*.5),doorH*.78,depth+.02,0,{scale:giant?1.05:.82});
   }
  }

  /* Crimson-lacquered bronze-strapped operable KDOOR leaves + engine door() fixture */
  const hollow=opt.hollow==null?true:!!opt.hollow;
  svDoorway(0,0,.16,0,doorW,doorH,{
   hollow,
   locked:opt.locked==null?!hollow:!!opt.locked,
   split:doorW>1.5,
   mk:opt.doorMk||'lacquer',
   col:opt.doorCol==null?0xb83234:opt.doorCol,
   style:opt.doorStyle||'banded',
   hwCol:0x9a7432,
   ajar:opt.ajar==null?0:opt.ajar,
   name:opt.doorName||(giant?'giant-pishtaq':'hearth-portal')
  });
  door(0,0,.18,0,doorW,doorH);
 });
 return {doorW,doorH,totalW,totalH,depth};
}

/* Projecting crimson-lacquered mashrabiya winter gallery bay (Hearth-Commons & upper winter rooms) */
function smLacquerBay(x,y0,z,w,h,d,o){
 const opt=o||{};
 W(x,y0,z,opt.ry==null?0:opt.ry,()=>{
  svNoWalk(()=>{
   /* Carved timber & bronze corbel brackets supporting the cantilevered bay */
   const nb=Math.max(3,Math.round(w/.85)+1);
   for(let i=0;i<nb;i++){
    const bx=-w*.5+.18+i*((w-.36)/(nb-1));
    beam('lacquer',[bx,-.52,.04],[bx,0,d-.08],.11,P('lacquer'),false,0,.14);
    box('bronzeCast',bx,-.08,d-.12,.14,.10,.16,P('bronze'));
   }
   /* Floor & soffit tray */
   box('lacquer',0,-.06,d*.5,w+.12,.12,d+.08,P('lacquer'));
   box('cedar',0,.06,d*.5,w-.08,.06,d-.08,P('cedar'));

   /* Lower panelled crimson-lacquer dado */
   const dadoH=Math.min(.78,h*.34);
   box('lacquer',0,.06,d-.05,w,.08,.10,P('lacquer'));
   box('lacquer',0,.06,d-.05,w,dadoH,.08,P('lacquer'));
   box('lacquer',-w*.5+.04,.06,d*.5,.08,dadoH,d,P('lacquer'));
   box('lacquer',w*.5-.04,.06,d*.5,.08,dadoH,d,P('lacquer'));
   box('gold',0,dadoH,d-.02,w+.04,.05,.10,P('gold'));

   /* Corner & mullion posts + pierced jali screens + warm-lit winter panes */
   const scrY=dadoH+.05,scrH=h-scrY-.28;
   const nBay=Math.max(3,Math.round(w/.72));
   const bw=w/nBay;
   for(let i=0;i<=nBay;i++){
    box('lacquer',-w*.5+i*bw,scrY,d-.04,.07,scrH,.09,P('lacquer'));
   }
   for(let i=0;i<nBay;i++){
    const cx=-w*.5+(i+.5)*bw;
    box('jali',cx,scrY,d-.01,bw-.07,scrH,.025,P('travertine'));
    svPane(cx,scrY,d-.05,0,bw-.08,scrH,{kind:opt.glassKind||'lit',solid:!!opt.solid});
   }
   for(const sx of [-1,1]){
    box('lacquer',sx*(w*.5-.04),scrY,.04,.08,scrH,.08,P('lacquer'));
    box('jali',sx*(w*.5-.01),scrY,d*.5,.025,scrH,d-.12,P('travertine'),PI*.5);
    svPane(sx*(w*.5-.05),scrY,d*.5,sx>0?PI*.5:-PI*.5,d-.14,scrH,{kind:opt.glassKind||'lit',solid:!!opt.solid});
   }

   /* Carved muqarnas eaves fascia + pitched slate snow-hood */
   box('lacquer',0,h-.24,d*.5,w+.18,.16,d+.16,P('lacquer'));
   box('bronzeCast',0,h-.08,d*.5,w+.24,.06,d+.22,P('bronze'));
   psurf('slate',(u,v)=>{
    const px=lerp(-(w*.5+.22),w*.5+.22,u);
    const pz=lerp(d+.26,0,v);
    const py=h-.02+v*.48;
    return [px,py,pz];
   },4,2,P('slate'));
  });
  windowAt(0,.2,d,0,w,h-.3,y0+.2);
 });
}

/* Octagonal dark-basalt thermal-mass flue chimney with shurafat crown & optional hearth smoke */
function smChimney(x,y0,z,h,o){
 const opt=o||{};
 const H=h==null?2.2:h;
 const r=opt.r==null?.34:opt.r;
 W(x,y0,z,0,()=>{
  svNoWalk(()=>{
   box('basalt',0,0,0,r*2.3,.32,r*2.3,P('basaltDark'));
   cyl('basalt',0,.30,0,r,H-.56,P('basalt'),8,r*.88,false);
   cyl('travertine',0,H-.30,0,r*1.08,.12,P('travertine'),8,r*1.12,false);
   for(let k=0;k<4;k++){
    const a=k*PI*.5;
    smShurafatMerlon(Math.cos(a)*(r*.84),H-.18,Math.sin(a)*(r*.84),PI*.5-a,.48);
   }
   cyl('iron',0,H-.18,0,r*.52,.22,P('iron'),8,r*.48,false);
  });
  if(opt.smoke!==false)smokeAt(0,H+.12,0,{r:opt.smokeScale==null?.28:opt.smokeScale});
 });
}

/* Dressed travertine-and-ablaq human doorway (1.5 < h < 3.0 m) with operable KDOOR leaf and optional door() front */
function smHumanDoor(x,y0,z,ry,w,h,o){
 const opt=o||{};
 const Wd=w==null?1.32:w;
 const Hd=h==null?SM_HUMAN_DOOR:h;
 const hollow=opt.hollow==null?true:!!opt.hollow;
 W(x,y0,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    box('travertine',sx*(Wd*.5+.11),0,.04,.22,Hd+.28,.34,P('travertine'));
   }
   const nj=5,jw=(Wd+.46)/nj;
   for(let i=0;i<nj;i++){
    const mk=i===2?'ironstone':(i%2===0?'basalt':'travertine');
    const col=i===2?P('ironstone'):(i%2===0?P('basalt'):P('travertine'));
    box(mk,-(Wd+.46)*.5+(i+.5)*jw,Hd,.05,jw,.28,.36,col);
   }
   if(opt.arch!==false){
    W(0,Hd+.28,.04,0,()=>smAblaqArch(Wd+.52,.68,.32,{openW:Wd-.08,springY:.05,voussoirs:9}));
   }
  });
  svDoorway(0,0,.02,0,Wd,Hd,{
   hollow,
   locked:opt.locked==null?!hollow:!!opt.locked,
   split:opt.split==null?Wd>1.45:!!opt.split,
   mk:opt.mk||'cedar',
   col:opt.col==null?0x72492c:opt.col,
   style:opt.style||'plank',
   hwCol:0x9a7432,
   ajar:opt.ajar==null?0:opt.ajar,
   name:opt.name||'human-door'
  });
  if(opt.front!==false)door(0,0,.04,0,Wd,Hd);
 });
}

/* Flush monumental ablaq Free Giant doorway (h >= 4.4 m) for Giant halls, fortifications, and side gates */
function smGiantPortal(x,y0,z,ry,w,h,o){
 const opt=o||{};
 const Wd=w==null?2.40:w;
 const Hd=h==null?SM_GIANT_DOOR:h;
 const hollow=opt.hollow==null?true:!!opt.hollow;
 W(x,y0,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   for(const sx of [-1,1]){
    box('travertine',sx*(Wd*.5+.16),0,.06,.32,Hd+.40,.42,P('travertine'));
   }
   const nj=7,jw=(Wd+.64)/nj;
   for(let i=0;i<nj;i++){
    const mk=i===3?'ironstone':(i%2===0?'basalt':'travertine');
    const col=i===3?P('ironstone'):(i%2===0?P('basalt'):P('travertine'));
    box(mk,-(Wd+.64)*.5+(i+.5)*jw,Hd,.08,jw,.38,.44,col);
   }
   if(opt.kattu){
    box('frieze_kattu',0,Hd+.38,.09,Wd+.68,.34,.36,0xffffff);
   }
   W(0,Hd+(opt.kattu?.72:.38),.06,0,()=>smAblaqArch(Wd+.72,.96,.38,{openW:Wd-.06,springY:.08,voussoirs:13}));
  });
  svDoorway(0,0,.04,0,Wd,Hd,{
   hollow,
   locked:opt.locked==null?!hollow:!!opt.locked,
   split:true,
   mk:opt.mk||'lacquer',
   col:opt.col==null?0xb83234:opt.col,
   style:opt.style||'banded',
   hwCol:0x9a7432,
   ajar:opt.ajar==null?0:opt.ajar,
   name:opt.name||'giant-portal'
  });
  if(opt.front!==false)door(0,0,.06,0,Wd,Hd);
 });
}

/* Street-corner cast-bronze sabil fountain grille over a carved basalt snowmelt basin */
function smSabilGrille(x,y0,z,ry,w,h){
 const Wg=w==null?2.1:w,Hg=h==null?2.4:h;
 W(x,y0,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   box('basalt',0,0,.22,Wg+.42,.76,.56,P('basaltDark'));
   box('travertine',0,.76,.24,Wg+.50,.12,.62,P('travertine'));
   box('paving',0,.58,.30,Wg-.12,.16,.28,P('glass'));
   for(const sx of [-1,1]){
    cyl('travertine',sx*(Wg*.5+.08),.88,.16,.10,Hg-.88,P('travertine'),10,null,false);
    box('bronzeCast',sx*(Wg*.5+.08),Hg-.06,.16,.24,.12,.24,P('bronze'));
   }
   W(0,Hg-.02,.14,0,()=>smAblaqArch(Wg+.44,.76,.34,{openW:Wg-.08,springY:.06,voussoirs:11}));
   box('tracery',0,.88,.18,Wg-.06,Hg-.92,.04,P('bronze'));
   cyl('bronze',0,.68,.46,.04,.16,P('bronze'),8,.03,false);
  });
  svPane(0,.90,.12,0,Wg-.12,Hg-.96,{kind:'smoked',solid:false});
  windowAt(0,.88,.22,0,Wg,Hg-.88,y0+.88);
 });
}

/* Low pierced Mamluk hammam blister dome (bathLens masonry + concentric amber stained-glass oculus jewels; non-SM_DOMES) */
function smBathDome(x,y0,z,D,h){
 const R=D*.5,H=h==null?D*.42:h;
 W(x,y0,z,0,()=>{
  svNoWalk(()=>{
   cyl('chiselled',0,0,0,R+.12,.16,P('travShade'),24,R+.06,false);
   const prof=[];
   for(let i=0;i<=12;i++){
    const u=i/12;
    const ang=u*PI*.5;
    prof.push([i===12?0:Math.cos(ang)*R,.16+Math.sin(ang)*(H-.16)]);
   }
   lathe('bathLens',0,0,prof,24,P('domeStone'));
   const gk=svGlass('stained',{color:0xd89b3c});
   for(const ringF of [.38,.68]){
    const nJ=ringF<.5?6:10;
    const u=ringF;
    const jr=Math.cos(u*PI*.5)*(R+.015),jy=.16+Math.sin(u*PI*.5)*(H-.16);
    for(let k=0;k<nJ;k++){
     const a=k/nJ*TAU+(ringF>.5?PI/nJ:0);
     W(Math.cos(a)*jr,jy,Math.sin(a)*jr,PI*.5-a,()=>{
      ring('travertine',0,0,0,.11,.022,P('travertine'),0,PI*.5,0,10);
      sph(gk,0,0,.02,.085,0xffffff,.9,8);
     });
    }
   }
   sph(gk,0,H+.02,0,.13,0xffffff,.9,10);
  });
 });
}

/* Riveted burnished-copper miniature qubba alembic dome + swan-neck lyne arm for Sunu-sikaru canyon spirit stills */
function smCopperAlembic(x,y0,z,D,ry,armLen){
 const R=D*.5,H=D*.86,L=armLen==null?2.2:armLen;
 W(x,y0,z,ry==null?0:ry,()=>{
  svNoWalk(()=>{
   /* Stone furnace firebox base */
   cyl('basalt',0,0,0,R*1.12,.92,P('basaltDark'),12,R*1.04,false);
   box('glow',0,.18,R*1.02,.36,.28,.12,P('ember'));
   cyl('travertine',0,.92,0,R*1.16,.12,P('travertine'),12,R*1.10,false);
   /* Riveted copper pot & miniature pointed Mamluk copper dome */
   const prof=[];
   for(let i=0;i<=14;i++){
    const u=i/14;
    prof.push([i===14?.10:smDomeRadius(u,D),1.04+u*H]);
   }
   lathe('bronze',0,0,prof,20,P('bronze'));
   ring('gold',0,1.08,0,R+.02,.028,P('gold'),0,0,0,18);
   ring('bronzeCast',0,1.04+H*.45,0,smDomeRadius(.45,D)+.02,.024,P('bronzeDark'),0,0,0,18);
   /* Onion helm & curved copper swan-neck condenser pipe */
   sph('bronze',0,1.04+H+.10,0,.20,P('bronze'),1.1,12);
   tube('bronze',t=>{
    const u=t;
    const arch=Math.sin(u*PI)*.52;
    return [0,1.04+H+.22+arch-u*.95,u*L];
   },t=>{
    const r=lerp(.075,.038,t);
    return [r,r];
   },14,6,P('bronze'));
  });
 });
}

