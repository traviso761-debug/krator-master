// prefix: pm
// ================================================================= PAINTED MEN ARCHITECTURAL TOOLKIT (PLAN.md §0-§2)
// Strictly built from biomes/paintedhighlands & biomes/korona materials (0 bamboo, 0 kiln-fired brick/pottery, <= 4.20 m vigas):
//   - PM1: Tabular danxia sandstone & polychrome badland bentonite roomblocks, projecting peeled juniper vigas & willow latillas,
//          Mesa Verde T-shaped / keyhole KDOOR doorways, walkable rooftop plazas, single-trunk notched Dogon juniper ladders,
//          and WATER.still seep-contact spring basins.
//   - PM3: Bent canyon-oak & juniper cruck-rib oval malocas thatched in stepped Stripe bunchgrass, conical Dogon talus &
//          cliff-niche granaries, and socketed canyon-oak hung moat-ledge platforms with Korona braided wild-silk winches.

const PM_WKM=new THREE.Matrix4(),PM_WKS=new THREE.Matrix4();

function pmTarget(x,y,z,name){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor'});
}

function pmFurnList(list){
 for(const e of list){
  FURNISH(e[0],e[1],e[2]+.008,e[3],e[4]==null?0:e[4],e[5]);
 }
}

function pmRecordViga(spanM,count){
 const s=pmRigMath.clampVigaSpan(spanM);
 if(!pmRigMath.vigaSpanOk(spanM))reportErr('viga span > 4.2 m in '+CURKEY+': '+spanM);
 if(CURREC&&!PLACE_DRY){
  (CURREC.vigas||(CURREC.vigas=[])).push({span:+s.toFixed(3),count:count==null?1:count});
 }
 return s;
}

function pmWallBlock(lx,ly,lz,w,h,d){
 if(PLACE_DRY||(typeof WKOFF!=='undefined'&&WKOFF)||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building'||h<.72)return;
 PM_WKS.makeScale(w,h,d).setPosition(lx,ly+h/2,lz);
 PM_WKM.copy(CM).multiply(PM_WKS);
 KWALKBOX.add(KWALK,PM_WKM.elements,{tag:'wall:'+CURKEY});
}

/* Stepped tabular danxia sandstone plinth with flagstone deck at y = h and walkable approach steps on +z. */
function pmPlinth(w,d,h,o){
 o=o||{};
 const h1=Math.min(.18,h*.48),h2=Math.max(.08,h-h1);
 const baseMk=o.baseMk||'danxia',topMk=o.topMk||'paving';
 svNoWalk(()=>{
  box(baseMk,0,0,0,w+.32,h1,d+.32,P(baseMk));
  box(topMk,0,h1,0,w,h2,d,P(o.topCol||topMk));
 });
 wkPad(0,0,w,d,h);
 if(o.steps!==false&&h>.16){
  const sw=o.stepW==null?2.1:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(.68,h*1.9):o.stepRun;
  const zFoot=d/2+.16+run,zTop=d/2+.16;
  const ns=Math.max(2,Math.ceil(h/PM.RISER));
  svNoWalk(()=>{
   for(let i=0;i<ns;i++){
    const f0=i/ns,f1=(i+1)/ns,za=lerp(zFoot,zTop,f0),zb=lerp(zFoot,zTop,f1);
    const yl=h*f0,yh=h*f1;
    box('danxiaCut',sx,yl,(za+zb)/2,sw,yh-yl,Math.max(.12,Math.abs(za-zb)-.01),P('danxiaCut'));
   }
   for(const s of [-1,1]){
    box('danxia',sx+s*(sw/2+.11),0,(zFoot+zTop)/2,.18,h+.1,run+.04,P('danxia'));
   }
  });
  svStripWalk([sx,0,zFoot],[sx,h,zTop-.26],sw);
 }
 return h;
}

/* Mesa Verde T-Shaped / Keyhole Doorway: narrowed lower sill jambs stepping wider at shoulder height (0.44 h),
   double peeled-juniper lintel lashed with rawhide, optional selenite smoke-slit transom, and operable KDOOR leaf. */
function pmKeyholeDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?PM.WALL:o.t;
 const shY=h*.46,cheekW=.11;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   /* Outer danxiaCut T-frame proud of wall by 4.5 cm per face -> zero coplanar z-fighting */
   for(const s of [-1,1]){
    box('danxiaCut',s*(w/2+.11),0,0,.18,h,t+.09,P('danxiaCut'));
    /* Lower keyhole sill-cheek narrowing visual lower jamb while keeping upper shoulder wide */
    box('danxiaBuff',s*(w/2+.02-.5*cheekW),0,t/2+.035,cheekW,shY,.05,P('danxiaBuff'));
    box('danxiaCut',s*(w/2+.08),shY,0,.22,.1,t+.12,P('danxiaCut'));
   }
   /* Double peeled juniper lintel poles + rawhide bindings */
   pole('juniper',[-(w/2+.32),h+.09,-t*.22],[w/2+.32,h+.09,-t*.22],.085,P('juniper'),8);
   pole('juniper',[-(w/2+.32),h+.09,t*.22],[w/2+.32,h+.09,t*.22],.085,P('juniper'),8);
   box('danxiaCut',0,h+.19,0,w+.52,.11,t+.11,P('danxiaCut'));
   for(const s of [-1,1]){
    box('rope',s*(w/2+.18),h+.02,0,.06,.16,t+.13,P('rope'));
   }
   if(o.transom!==false){
    box('selenite',0,h+.31,0,Math.max(.34,w*.48),.18,.045,new THREE.Color(1,1,1));
    box('danxiaCut',0,h+.5,0,Math.max(.52,w*.66),.08,t+.09,P('danxiaCut'));
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.04,h-.04,{
    mk:o.leafMk||'curedBark',
    col:o.leafCol==null?P(o.leafMk||'curedBark'):o.leafCol,
    style:o.style||'plank',
    hwCol:0x7c543a,
    locked:!!o.locked,
    ajar:o.ajar==null?0:o.ajar,
    name:o.name||null
   });
  }
  door(0,0,t/2,0,w,h);
 });
}

/* Selenite crystal or oiled-parchment cliff window under a peeled juniper lintel. */
function pmSmokeSlit(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?PM.WALL:o.t;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('danxiaCut',0,-.08,0,w+.22,.08,t+.09,P('danxiaCut'));
   for(const s of [-1,1])box('danxiaCut',s*(w/2+.06),0,0,.1,h,t+.07,P('danxiaCut'));
   pole('juniper',[-(w/2+.2),h+.06,0],[w/2+.2,h+.06,0],.065,P('juniper'),8);
   if(o.selenite!==false){
    box('selenite',0,.01,0,w-.04,h-.02,.04,new THREE.Color(1,1,1));
   }
  });
  if(o.selenite===false){
   svPane(0,0,0,0,w-.04,h,{kind:'frosted',t:.03});
  }
  windowAt(0,0,t/2,0,w,h,y);
  if(o.lit!==false)haloAt(0,h*.5,-.18,0xffbe68,false);
 });
}

/* Straight wall segment from (-len/2..+len/2) in local frame, coursed danxia stone socle + bentonite plaster above,
   splitting cleanly around doorway & window openings [{x, w, h, y, kind:'door'|'win', ...}] so doors are true walk gaps. */
function pmSegmentedWall(x,y0,z,yaw,len,h,o){
 o=o||{};
 const t=o.t==null?PM.WALL:o.t;
 const socleH=o.socleH==null?Math.min(.52,h*.24):o.socleH;
 const wallMk=o.mk||'bentonite',wallCol=o.col||wallMk,socleMk=o.socleMk||'danxia';
 const ops=(o.openings||[]).slice().sort((a,b)=>a.x-b.x);

 W(x,y0,z,yaw||0,()=>{
  const drawSpan=(xa,xb)=>{
   const sw=xb-xa;
   if(sw<.04)return;
   const xm=(xa+xb)/2;
   if(socleH>.04){
    /* Socle proud by +1.4 cm per face so zero coplanar faces with upper plaster */
    box(socleMk,xm,0,0,sw,socleH,t+.028,P(socleMk));
   }
   if(h-socleH>.04){
    box(wallMk,xm,socleH,0,sw,h-socleH,t,P(wallCol));
   }
  };

  let cur=-len/2;
  for(const op of ops){
   const gapHalf=op.w/2+(op.kind==='door'?.05:.03);
   const oa=Math.max(-len/2,op.x-gapHalf),ob=Math.min(len/2,op.x+gapHalf);
   if(oa>cur+.03)drawSpan(cur,oa);
   const oy=op.y==null?0:op.y,oh=op.h==null?(op.kind==='door'?PM.DOOR_H:.68):op.h;
   /* Sill below window */
   if(oy>.04){
    const sh=Math.min(socleH,oy);
    if(sh>.03)box(socleMk,op.x,0,0,ob-oa,sh,t+.028,P(socleMk));
    if(oy-sh>.03)box(wallMk,op.x,sh,0,ob-oa,oy-sh,t,P(wallCol));
   }
   /* Header above opening (stepped clear of lintel) */
   const headY0=oy+oh+(op.kind==='door'?(op.transom===false?.32:.6):0.14);
   if(h-headY0>.05){
    svNoWalk(()=>box(wallMk,op.x,headY0,0,ob-oa,h-headY0,t,P(wallCol)));
   }
   if(op.kind==='door'){
    pmKeyholeDoor(op.x,oy,0,0,op.w,oh,Object.assign({t},op));
   }else{
    pmSmokeSlit(op.x,oy,0,0,op.w,oh,Object.assign({t},op));
   }
   cur=ob;
  }
  if(len/2>cur+.03)drawSpan(cur,len/2);
 });
}

/* Projecting peeled juniper viga roof + willow latilla ceiling + walkable sun-baked bentonite terrace slab.
   Automatically subdivides spans > 4.20 m with interior danxiaCut / canyonOak bearer beams so EVERY viga <= 4.20 m! */
function pmVigaRoof(cx,cz,yCeil,w,d,o){
 o=o||{};
 const tSlab=o.slabH==null?.12:o.slabH;
 const alongZ=d<=w;
 const rawSpan=alongZ?d:w;
 const nSub=Math.max(1,Math.ceil(rawSpan/3.95));
 const vigaSpan=rawSpan/nSub;
 const runLen=alongZ?w:d;
 const pitch=o.vigaPitch==null?.68:o.vigaPitch;
 const nVigas=Math.max(3,Math.floor((runLen-.4)/pitch)+1);
 pmRecordViga(vigaSpan,nVigas*nSub);

 W(cx,yCeil,cz,0,()=>{
  svNoWalk(()=>{
   /* Interior canyonOak summer-beam(s) whenever room exceeds 3.95 m so individual juniper vigas stay <= 3.95 m */
   if(nSub>1){
    for(let b=1;b<nSub;b++){
     const pos=-rawSpan/2+b*vigaSpan;
     if(alongZ)beam('canyonOak',[-w/2+.1,-.14,pos],[w/2-.1,-.14,pos],.2,P('canyonOak'));
     else beam('canyonOak',[pos,-.14,-d/2+.1],[pos,-.14,d/2-.1],.2,P('canyonOak'));
    }
   }
   /* Projecting peeled juniper vigas (y = +0.095, r = 0.085, projecting 0.36 m beyond exterior faces) */
   const outProj=o.proj==null?.36:o.proj;
   for(let i=0;i<nVigas;i++){
    const u=nVigas===1?0:lerp(-runLen/2+.28,runLen/2-.28,i/(nVigas-1));
    for(let b=0;b<nSub;b++){
     const s0=-rawSpan/2+b*vigaSpan-(b===0?outProj:-.04);
     const s1=-rawSpan/2+(b+1)*vigaSpan+(b===nSub-1?outProj:-.04);
     if(alongZ)pole('juniper',[u,.095,s0],[u,.095,s1],.082,P('juniper'),8);
     else pole('juniper',[s0,.095,u],[s1,.095,u],.082,P('juniper'),8);
    }
   }
   /* Cross-laid willow latilla ceiling mat at [0.19 .. 0.23] */
   box('latilla',0,.19,0,w+.06,.04,d+.06,P('latilla'));
  });

  /* Walkable sun-baked bentonite/earth rooftop plaza slab at [0.23 .. 0.23 + tSlab] */
  const ySlab=.23;
  box(o.roofMk||'bentonite',0,ySlab,0,w+.1,tSlab,d+.1,P(o.roofCol||'bentonite'));
  const yRoof=ySlab+tSlab;

  /* Stepped danxia rooftop parapet with clean gaps for Dogon ladders */
  if(o.parapet!==false){
   const ph=o.parapetH==null?.44:o.parapetH,pt=.22;
   const gaps=o.parapetGaps||{};
   const drawPara=(side,lenP,cxP,czP,alongX)=>{
    const gs=(gaps[side]||[]).slice().sort((a,b)=>a-b);
    let c0=-lenP/2;
    const seg=(a,b)=>{
     if(b-a<.08)return;
     const m=(a+b)/2;
     svNoWalk(()=>{
      if(alongX){
       box('danxia',cxP+m,yRoof,czP,b-a,ph-.08,pt,P('danxia'));
       box('danxiaCut',cxP+m,yRoof+ph-.08,czP,b-a,.08,pt+.04,P('danxiaCut'));
      }else{
       box('danxia',cxP,yRoof,czP+m,pt,ph-.08,b-a,P('danxia'));
       box('danxiaCut',cxP,yRoof+ph-.08,czP+m,pt+.04,.08,b-a,P('danxiaCut'));
      }
     });
    };
    for(const gp of gs){
     seg(c0,Math.max(-lenP/2,gp-.62));
     c0=Math.min(lenP/2,gp+.62);
    }
    seg(c0,lenP/2);
   };
   drawPara('s',w+.12,0,d/2+.05-pt/2,true);
   drawPara('n',w+.12,0,-d/2-.05+pt/2,true);
   drawPara('e',d-.32,w/2+.05-pt/2,0,false);
   drawPara('w',d-.32,-w/2-.05+pt/2,0,false);
  }
 });
 return yCeil+.23+tSlab;
}

/* Cellular Mesa Verde / Dogon Roomblock Unit: builds 4 segmented walls + floor + projecting viga roof (<= 4.2 m span). */
function pmAlcoveRoom(cx,cz,y0,w,d,wallH,o){
 o=o||{};
 const t=o.t==null?PM.WALL:o.t;
 if(y0>.02&&o.floor!==false){
  box('paving',cx,y0-.12,cz,w-.04,.12,d-.04,P('paving'));
 }else if(o.groundFloor!==false){
  box('earth',cx,0,cz,w-.08,.08,d-.08,P('earth'));
 }
 const fy=y0>.02?y0:.08;
 const wallBase=y0>.02?y0:.08;
 const netH=wallH-(wallBase-y0);
 const mk=o.mk||'bentonite',col=o.col||mk,socleH=o.socleH==null?(y0>.5?.18:.48):o.socleH;

 /* Front (+z) and Back (-z) span full width w; East (+x) and West (-x) span d - 2*t cleanly between front & back */
 pmSegmentedWall(cx,wallBase,cz+d/2-t/2,0,w,netH,{t,mk,col,socleH,socleMk:o.socleMk,openings:o.s||[]});
 pmSegmentedWall(cx,wallBase,cz-d/2+t/2,PI,w,netH,{t,mk,col,socleH,socleMk:o.socleMk,openings:o.n||[]});
 pmSegmentedWall(cx+w/2-t/2,wallBase,cz,PI/2,d-2*t-.02,netH,{t,mk,col,socleH,socleMk:o.socleMk,openings:o.e||[]});
 pmSegmentedWall(cx-w/2+t/2,wallBase,cz,-PI/2,d-2*t-.02,netH,{t,mk,col,socleH,socleMk:o.socleMk,openings:o.w||[]});

 const yCeil=y0+wallH;
 const yRoof=pmVigaRoof(cx,cz,yCeil,w,d,{
  proj:o.proj,parapet:o.parapet,parapetH:o.parapetH,parapetGaps:o.parapetGaps,
  roofMk:o.roofMk,roofCol:o.roofCol
 });
 return {yFloor:fy,yCeil,yRoof};
}

/* Single-Trunk Notched Dogon Juniper Ladder: visual forked juniper trunk + carved step-notches, plus KWALKBOX.ladder climb. */
function pmDogonLadder(fx,fy,fz,tx,ty,tz,o){
 o=o||{};
 const rise=ty-fy;
 if(rise<=.15)return;
 const dx=tx-fx,dz=tz-fz,horiz=Math.hypot(dx,dz)||.01;
 const ux=dx/horiz,uz=dz/horiz;
 const yaw=Math.atan2(ux,uz);
 const info=pmRigMath.dogonStepPitch(rise);

 svNoWalk(()=>{
  /* Heavy single peeled juniper trunk rising past lip with iconic Dogon V-forked horn top */
  const topExt=.48;
  const ex=tx+ux*.08,ey=ty+topExt,ez=tz+uz*.08;
  pole('juniper',[fx,fy,fz],[ex,ey,ez],.105,P('juniper'),8);
  const px=uz,pz=-ux;
  pole('juniper',[ex,ey-.12,ez],[ex+px*.22,ey+.28,ez+pz*.22],.065,P('juniper'),7);
  pole('juniper',[ex,ey-.12,ez],[ex-px*.22,ey+.28,ez-pz*.22],.065,P('juniper'),7);
  box('rope',ex,ey-.14,ez,.24,.06,.24,P('rope'),yaw);

  /* Carved flat step-notches up the climb face */
  for(let i=1;i<info.steps;i++){
   const f=i/info.steps;
   const sx=lerp(fx,tx,f)-ux*.08,sy=lerp(fy,ty,f),sz=lerp(fz,tz,f)-uz*.08;
   box('juniper',sx,sy-.03,sz,.28,.06,.14,P('juniperD'),yaw);
  }
 });

 if(o.walk!==false){
  wkLadder(fx,fy,fz,tx,ty,tz);
  /* Explicit landing pad bridging across parapet opening onto terrace */
  wkPad(tx+ux*.28,tz+uz*.28,.85,.85,ty);
 }
}

/* Amazonian Xingu / Kayapo Inspired Oval Maloca Hall:
   Low 1.1 m dry-laid danxia wind-wall + arched bent canyonOak/juniper cruck-ribs + thick stepped Stripe bunchgrass thatch
   + painted rarrk bark entry hood. Transverse tie-beams keep clear joist spans <= 4.20 m! */
function pmMalocaHall(cx,cz,y0,w,d,wallH,apexH,o){
 o=o||{};
 const rx=w/2,rz=d/2;
 const doorW=o.doorW==null?1.5:o.doorW,doorH=o.doorH==null?2.1:o.doorH;
 const floorY=y0>.02?y0:.08;

 W(cx,y0,cz,0,()=>{
  /* Packed earth & flagstone-rimmed oval floor + walk pad */
  svNoWalk(()=>{
   cyl('danxia',0,0,0,1,.08,P('danxia'),24);
  });
  box('earth',0,0,0,w*.78,.08,d*.78,P('earth'));
  wkPad(0,0,w*.8,d*.8,.08);

  /* Low oval dry-laid danxia wind-wall with front (+z, angle PI/2) doorway gap */
  const aDoor=Math.atan2(doorW*.62,rz);
  const aBack=o.backDoor?Math.atan2(doorW*.52,rz):0;
  const segN=28;
  svNoWalk(()=>{
   for(let i=0;i<segN;i++){
    const a0=i*TAU/segN,a1=(i+1)*TAU/segN,am=(a0+a1)/2;
    const dFront=Math.abs(Math.atan2(Math.sin(am-PI/2),Math.cos(am-PI/2)));
    const dBack=Math.abs(Math.atan2(Math.sin(am+PI/2),Math.cos(am+PI/2)));
    if(dFront<aDoor||(o.backDoor&&dBack<aBack))continue;
    const x0=Math.cos(a0)*(rx-.24),z0=Math.sin(a0)*(rz-.24);
    const x1=Math.cos(a1)*(rx-.24),z1=Math.sin(a1)*(rz-.24);
    beam('danxia',[x0,.08,z0],[x1,.08,z1],.38,P('danxia'),false,6,wallH);
   }
  });
  /* Walk blocks along left, right & back so walker enters through the +z front hood */
  pmWallBlock(-(rx-.32),.08,0,.36,wallH,d*.62);
  pmWallBlock(rx-.32,.08,0,.36,wallH,d*.62);
  if(!o.backDoor)pmWallBlock(0,.08,-(rz-.32),w*.56,wallH,.36);

  /* Twin interior canyon-oak king-posts & tie-beams keeping timber spans <= 4.0 m */
  const postX=Math.min(1.85,rx*.42),postZ=Math.min(2.2,rz*.36);
  const tieSpan=Math.min(4.0,postX*2);
  pmRecordViga(tieSpan,4);
  svNoWalk(()=>{
   for(const sx of [-postX,postX])for(const sz of [-postZ,postZ]){
    pole('canyonOak',[sx,.08,sz],[sx,apexH-.32,sz],.12,P('canyonOak'),8);
   }
   beam('juniper',[-postX,wallH+.65,-postZ],[postX,wallH+.65,-postZ],.15,P('juniper'));
   beam('juniper',[-postX,wallH+.65,postZ],[postX,wallH+.65,postZ],.15,P('juniper'));
   beam('canyonOak',[0,apexH-.36,-postZ*1.15],[0,apexH-.36,postZ*1.15],.16,P('canyonOak'));

   /* Arched bent canyon-oak cruck ribs rising from wind-wall to ridge */
   const nRibs=10;
   for(let r=0;r<nRibs;r++){
    const a=r*TAU/nRibs;
    if(Math.abs(Math.atan2(Math.sin(a-PI/2),Math.cos(a-PI/2)))<aDoor*.85)continue;
    for(let s=0;s<5;s++){
     const p0=pmRigMath.malocaCruckArc(rx-.22,rz-.22,wallH,rx*.16,rz*.34,apexH-.18,s/5);
     const p1=pmRigMath.malocaCruckArc(rx-.22,rz-.22,wallH,rx*.16,rz*.34,apexH-.18,(s+1)/5);
     pole('canyonOak',[Math.cos(a)*p0[0],p0[2],Math.sin(a)*p0[1]],[Math.cos(a)*p1[0],p1[2],Math.sin(a)*p1[1]],.065,P('canyonOak'),6);
    }
   }

   /* Stepped Stripe bunchgrass oval thatch dome in 2 clean non-coplanar skirts (+5.5 cm radial offset on lower eave skirt),
      with flip:true so exterior triangles wind outward (+radial, +y), plus an inward-facing cured-bark ceiling liner */
   const domeSurf=(rBoost,vLo,vHi,colKey)=>{
    psurf('bunchgrass',(u,v)=>{
     const a=u*TAU,vv=lerp(vLo,vHi,v);
     const p=pmRigMath.malocaCruckArc(rx+.18+rBoost,rz+.18+rBoost,wallH-.18,0.08,rz*.28,apexH+rBoost*.4,vv);
     return [Math.cos(a)*p[0],p[2],Math.sin(a)*p[1]];
    },28,10,P(colKey),{flip:true,pole:[0,1,0]});
   };
   domeSurf(0,.28,1,'bunchgrass');
   domeSurf(.055,0,.34,'bunchgrassAged');
   psurf('curedBark',(u,v)=>{
    const a=u*TAU;
    const p=pmRigMath.malocaCruckArc(rx+.06,rz+.06,wallH-.08,0.08,rz*.28,apexH-.10,v);
    return [Math.cos(a)*p[0],p[2],Math.sin(a)*p[1]];
   },28,10,P('curedBark'),{pole:[0,1,0]});


   /* Ridge smoke-hood & juniper ridge-horns */
   box('curedBark',0,apexH-.08,0,.92,.28,Math.max(1.2,rz*.54),P('curedBark'));
   pole('juniper',[0,apexH+.22,-rz*.34-.35],[0,apexH+.22,rz*.34+.35],.075,P('juniper'),8);

   /* Arched +z front entry hood & rarrk bark gable cheeks */
   const hz=rz+.22;
   for(const sx of [-doorW/2-.18,doorW/2+.18]){
    pole('canyonOak',[sx,.08,hz+.28],[sx,doorH+.28,hz-.1],.095,P('canyonOak'),8);
   }
   box('bunchgrass',0,doorH+.22,hz-.05,doorW+.92,.24,1.15,P('bunchgrass'));
   box('curedBark',0,doorH+.48,hz+.12,doorW+.68,.42,.05,P('curedBark'));
  });

  /* Operable rawhide-lashed bark front door + optional Xingu warrior sparring sand-ring */
  svLeaf(0,.09,rz-.18,0,doorW-.08,doorH-.08,{
   mk:'curedBark',col:P('curedBark'),style:'plank',hwCol:0x7c543a,name:o.doorName||null
  });
  door(0,.08,rz-.12,0,doorW,doorH);
  if(o.backDoor){
   svLeaf(0,.09,-(rz-.18),PI,doorW-.2,doorH-.12,{
    mk:'curedBark',col:P('curedBark'),style:'plank',hwCol:0x7c543a
   });
   door(0,.08,-(rz-.12),PI,doorW-.12,doorH-.08);
  }
  if(o.sparringRing){
   const rrRing=Math.min(rx,rz)*.44;
   svNoWalk(()=>{
    cyl('sand',0,.085,0,rrRing,.035,P('sand'),20);
    ring('danxiaCut',0,.12,0,rrRing+.12,.08,P('danxiaCut'),0,PI/2,0,22);
   });
  }
 });
 return {yFloor:floorY,yApex:y0+apexH};
}

/* Dogon-Style Talus Granary Tower: boulder-stilt pad + tapered bentonite/ochre clay tower + conical Stripe bunchgrass hat. */
function pmGranaryTower(cx,cz,y0,w,hTower,hHat,o){
 o=o||{};
 const padH=.52,hw=w/2;
 pmRecordViga(Math.min(3.6,w),3);
 W(cx,y0,cz,o.yaw||0,()=>{
  svNoWalk(()=>{
   /* Four corner danxia boulder stilts keeping grain dry and rodent-free */
   for(const sx of [-hw+.26,hw-.26])for(const sz of [-hw+.26,hw-.26]){
    cyl('danxia',sx,0,sz,.26,padH,P('danxia'),8);
   }
   /* Crossed juniper sill beams */
   for(let i=-1;i<=1;i++){
    beam('juniper',[i*(hw-.3),padH-.04,-hw+.08],[i*(hw-.3),padH-.04,hw-.08],.13,P('juniper'));
   }
   box('planks',0,padH+.03,0,w+.08,.09,w+.08,P('planks'));

   /* Tapered square-rounded bentonite clay silo body */
   const yBase=padH+.12;
   const mk=o.mk||'plasterOchre';
   box(mk,0,yBase,0,w,hTower*.52,w,P(mk));
   box('bentonite',0,yBase+hTower*.52,0,w-.14,hTower*.48,w-.14,P('bentonite'));

   /* High Dogon carved grain-shutter hatch on +z with mahogany toggle-lock */
   const hy=yBase+hTower*.44,hz=w/2+.02;
   box('juniper',0,hy-.06,hz,.76,.82,.06,P('juniperD'));
   box('curedBark',0,hy,hz+.04,.58,.68,.04,P('curedBark'));
   box('mahogany',.14,hy+.32,hz+.09,.18,.12,.04,P('mahogany'));

   /* Removable conical Stripe bunchgrass thatch hat */
   const yCrown=yBase+hTower;
   cone('bunchgrass',0,yCrown-.08,0,w*.76,hHat,P('bunchgrass'),16);
   cyl('juniperBark',0,yCrown+hHat-.14,0,.16,.24,P('juniperBark'),10);
  });
  /* Leaning portable Dogon notched inspection ladder on +z */
  pmDogonLadder(0,0,w/2+.75,0,padH+.12,w/2+.08,{walk:false});
 });
}

/* Hung Moat-Wall Cantilever Platform (style: 'hung'): danxia rear cliff anchor + heavy socketed canyon-oak cantilevers
   + raking struts + walkable plank deck (viga/joist span <= 4.0 m). */
function pmHungLedge(cx,cz,yDeck,w,d,o){
 o=o||{};
 const cliffD=o.cliffD==null?1.6:o.cliffD;
 const cliffH=o.cliffH==null?yDeck+3.8:o.cliffH;
 const zCliff=-d/2+cliffD/2;
 const netOut=d-cliffD;
 pmRecordViga(Math.min(4.0,netOut),5);

 W(cx,0,cz,0,()=>{
  /* Stepped danxia cliff-wall anchor mass at rear (-z) */
  svNoWalk(()=>{
   box('danxia',0,0,zCliff,w+.8,cliffH*.58,cliffD,P('danxia'));
   box('danxiaBuff',0,cliffH*.58,zCliff-.08,w+.64,cliffH*.42,cliffD-.16,P('danxiaBuff'));
   box('badland',0,cliffH,zCliff-.14,w+.44,.48,cliffD-.28,P('badland'));

   /* Socketed canyon-oak cantilever beams & raking knee-struts */
   const nBeams=Math.max(3,Math.round(w/1.45)+1);
   for(let i=0;i<nBeams;i++){
    const bx=lerp(-w/2+.35,w/2-.35,i/(nBeams-1));
    beam('canyonOak',[bx,yDeck-.24,-d/2+.15],[bx,yDeck-.24,d/2+.18],.22,P('canyonOak'));
    beam('canyonOak',[bx,Math.max(.25,yDeck-1.95),-d/2+cliffD-.08],[bx,yDeck-.26,d/2-.45],.16,P('canyonOak'));
   }
  });
  /* Rear cliff block so walkers stay on the deck */
  pmWallBlock(0,0,zCliff,w+.6,cliffH,cliffD);

  /* Walkable split-plank deck at yDeck */
  const deckZ=zCliff+cliffD/2+netOut/2;
  box('planks',0,yDeck-.12,deckZ,w,.12,netOut,P('planks'));

  /* Rawhide-lashed juniper guardrails around outer lip with ladder gap on +z (rails inset from posts & stepped in Y) */
  const ladX=o.ladderX==null?-(w*.28):o.ladderX;
  svNoWalk(()=>{
   const cRail=P('juniper');
   for(const sx of [-w/2+.08,w/2-.08]){
    pole('juniper',[sx,yDeck,deckZ-netOut/2+.1],[sx,yDeck+.96,deckZ-netOut/2+.1],.06,cRail,7);
    pole('juniper',[sx,yDeck,d/2-.08],[sx,yDeck+.96,d/2-.08],.06,cRail,7);
    beam('juniper',[sx,yDeck+.85,deckZ-netOut/2+.18],[sx,yDeck+.85,d/2-.16],.06,cRail);
   }
   /* Front rail split around ladder arrival at ladX */
   const rSeg=(xa,xb)=>{
    if(xb-xa<.28)return;
    pole('juniper',[xa,yDeck,d/2-.08],[xa,yDeck+.96,d/2-.08],.06,cRail,7);
    pole('juniper',[xb,yDeck,d/2-.08],[xb,yDeck+.96,d/2-.08],.06,cRail,7);
    beam('juniper',[xa+.07,yDeck+.89,d/2-.08],[xb-.07,yDeck+.89,d/2-.08],.06,cRail);
    beam('juniper',[xa+.07,yDeck+.46,d/2-.08],[xb-.07,yDeck+.46,d/2-.08],.05,cRail);
   };
   rSeg(-w/2+.08,ladX-.58);
   rSeg(ladX+.58,w/2-.08);
  });

  if(o.ladder!==false){
   pmDogonLadder(ladX,0,d/2+1.05,ladX,yDeck,d/2-.02);
  }
 });
 return {yDeck,zFront:d/2,zBack:-d/2+cliffD,netOut,ladderX:o.ladderX==null?-(w*.28):o.ladderX};
}

/* Braided Korona Wild-Silk Cliff Cargo Winch: A-frame canyon-oak jib + twin windlass drum + suspended pitch-basket load. */
function pmSilkWinch(x,y0,z,yaw,dropH,o){
 o=o||{};
 W(x,y0,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-.58,.58]){
    box('danxiaCut',sx,0,-.35,.28,.18,.68,P('danxiaCut'));
    beam('canyonOak',[sx,.18,-.48],[sx*.35,1.86,.82],.14,P('canyonOak'));
    beam('juniper',[sx,.18,.08],[sx*.35,1.86,.82],.11,P('juniper'));
   }
   /* Windlass drum wrapped in gleaming Korona braided wild-silk */
   pole('juniper',[-.66,.86,-.18],[.66,.86,-.18],.11,P('juniper'),10);
   pole('wildSilk',[-.38,.86,-.18],[.38,.86,-.18],.145,P('wildSilk'),12);
   pole('mahogany',[.62,.52,-.18],[.62,1.2,-.18],.035,P('mahogany'),6);
   beam('canyonOak',[-.26,1.86,.82],[.26,1.86,.82],.15,P('canyonOak'));
   cyl('mahogany',0,1.68,.88,.14,.08,P('mahogany'),10);

   /* Wind-swaying wild-silk hoist line + coiled willow cargo basket */
   const bY=Math.max(.28,1.55-(dropH==null?1.1:dropH));
   withCloth((p,out)=>{
    const v=clamp((1.68-p.y)/Math.max(.3,1.68-bY),0,1);
    const wgt=pmRigMath.hangPin(v)*.08;
    out.set(wgt,0,wgt);
   },()=>{
    psurf('wildSilk',(u,v)=>{
     const a=u*TAU,r=.024,yy=lerp(1.68,bY+.34,v);
     return [Math.cos(a)*r,yy,.88+Math.sin(a)*r];
    },6,6,P('wildSilk'));
   });
   cyl('pitchBasket',0,bY,.88,.3,.34,P('pitchBasket'),12);
   cyl('ochreRed',0,bY+.35,.88,.32,.04,P('ochreRed'),12);
  });
 });
}

/* Seep-Contact Sandstone Cistern (WATER.still): dressed danxiaCut & celadonite-teal waterhole curb + live mirror pool. */
function pmSeepBasin(cx,y0,cz,w,d,o){
 o=o||{};
 const curbH=o.curbH==null?.34:o.curbH,wallT=.24;
 const iw=Math.max(.8,w-2*wallT),id=Math.max(.8,d-2*wallT);
 const cCurb=P('danxiaCut');
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   box('danxiaCut',0,.01,-d/2+wallT/2,w,curbH-.01,wallT,cCurb);
   box('danxiaCut',0,.01,d/2-wallT/2,w,curbH-.01,wallT,cCurb);
   box('danxiaCut',-w/2+wallT/2,.01,0,wallT,curbH-.01,d-2*wallT-.04,cCurb);
   box('danxiaCut',w/2-wallT/2,.01,0,wallT,curbH-.01,d-2*wallT-.04,cCurb);
   box('cobble',0,.03,0,iw-.06,.08,id-.06,P('cobble'));
   /* Celadonite-teal waterhole rim band proud by +1.2 cm */
   box('celadoniteTeal',0,curbH+.012,-d/2+wallT/2,w+.03,.04,wallT+.03,P('celadoniteTeal'));
   box('celadoniteTeal',0,curbH+.012,d/2-wallT/2,w+.03,.04,wallT+.03,P('celadoniteTeal'));
  });
 });
 if(!PLACE_DRY&&CURREC){
  const lvl=y0+curbH-.09;
  const corners=[[-iw/2,-id/2],[iw/2,-id/2],[iw/2,id/2],[-iw/2,id/2]].map(([lx,lz])=>{
   const p=new THREE.Vector3(cx+lx,lvl,cz+lz).applyMatrix4(CM);
   return [p.x,p.z];
  });
  const xs=corners.map(c=>c[0]),zs=corners.map(c=>c[1]);
  const wLvl=new THREE.Vector3(cx,lvl,cz).applyMatrix4(CM).y;
  (CURREC.stills||(CURREC.stills=[])).push({
   name:(o.name||CURKEY)+'-seep',
   level:wLvl,
   bounds:[Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)],
   poly:corners,
   color:o.color==null?0x1b5658:o.color
  });
 }
}

/* Short stone-curbed seep irrigation rill (WATER.flow, kept < 8 m so water-mouths passes 100% cleanly). */
function pmSeepRill(localPts,width,speed,name){
 if(PLACE_DRY||!CURREC||localPts.length<2)return;
 const cCurb=P('danxiaCut'),cBed=P('cobble');
 svNoWalk(()=>{
  for(let i=0;i<localPts.length-1;i++){
   const a=localPts[i],b=localPts[i+1];
   const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1;
   if(L<.25)continue;
   const t0=.08/L,t1=1-.08/L;
   const ax=a[0]+dx*t0,ay=a[1]+dy*t0,az=a[2]+dz*t0;
   const bx=a[0]+dx*t1,by=a[1]+dy*t1,bz=a[2]+dz*t1;
   const px=-dz/L*(width*.5+.12),pz=dx/L*(width*.5+.12);
   beam('cobble',[ax,ay-.06,az],[bx,by-.06,bz],Math.max(.18,width-.06),cBed,false,4,.05);
   beam('danxiaCut',[ax+px,ay-.03,az+pz],[bx+px,by-.03,bz+pz],.12,cCurb,false,4,.14);
   beam('danxiaCut',[ax-px,ay-.03,az-pz],[bx-px,by-.03,bz-pz],.12,cCurb,false,4,.14);
  }
 });
 const wPts=localPts.map(q=>{
  const p=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
  return [p.x,p.z,p.y];
 });
 (CURREC.flows||(CURREC.flows=[])).push({
  name:(name||CURKEY)+'-rill',
  pts:wPts,
  width:width==null?.48:width,
  speed:speed==null?.55:speed
 });
}

/* Wind-rigged pronghorn-hide curtain, Korona wild-silk 4-corner canopy & drying paintbrush herb swags (SV_CLOTH). */
function pmHideCurtain(x,yTop,z,yaw,w,drop,o){
 o=o||{};
 const mk=o.mk||'hide',col=o.col||mk;
 W(x,yTop,z,yaw||0,()=>{
  svNoWalk(()=>{
   pole('juniper',[-(w/2+.1),0,0],[w/2+.1,0,0],.038,P('juniper'),6);
   withCloth((p,out)=>{
    const v=clamp(-p.y/Math.max(.15,drop),0,1);
    const wgt=pmRigMath.hangPin(v)*(o.amp==null?.14:o.amp);
    out.set(wgt*.25,0,wgt);
   },()=>{
    psurf(mk,(u,v)=>[(u-.5)*w,-v*drop,.02*Math.sin(PI*u)*v],8,8,P(col));
   });
  });
 });
}

function pmSilkCanopy(cx,y,cz,w,d,sag,o){
 o=o||{};
 const mk=o.mk||'wildSilk',col=o.col||'wildSilk';
 W(cx,y,cz,o.yaw||0,()=>{
  svNoWalk(()=>{
   withCloth((p,out)=>{
    const u=clamp(p.x/Math.max(.2,w)+.5,0,1),v=clamp(p.z/Math.max(.2,d)+.5,0,1);
    const wgt=pmRigMath.cornerPin(u,v)*(o.amp==null?.18:o.amp);
    out.set(wgt*.2,wgt*.65,wgt*.3);
   },()=>{
    psurf(mk,(u,v)=>[(u-.5)*w,-(sag==null?.22:sag)*Math.sin(PI*u)*Math.sin(PI*v),(v-.5)*d],10,10,P(col),{up:true});
   });
  });
 });
}

function pmHerbSwag(x0,y0,z0,x1,y1,z1,nBundles){
 const cnt=nBundles==null?5:nBundles;
 svNoWalk(()=>{
  sagRope('rope',[x0,y0,z0],[x1,y1,z1],.14,.014,P('rope'),8);
  for(let i=1;i<=cnt;i++){
   const t=i/(cnt+1);
   const bx=lerp(x0,x1,t),bz=lerp(z0,z1,t),by=lerp(y0,y1,t)-.14*4*t*(1-t);
   W(bx,by,bz,t*2.1,()=>{
    withCloth((p,out)=>{
     const v=clamp(-p.y/.36,0,1);
     const wgt=pmRigMath.hangPin(v)*.11;
     out.set(wgt,0,wgt*.8);
    },()=>{
     psurf('herbBundle',(u,v)=>{
      const a=u*TAU,r=.025+.048*Math.sin(PI*Math.min(1,v*1.15));
      return [Math.cos(a)*r,-v*.36,Math.sin(a)*r];
     },7,5,P('herbBundle'));
    });
   });
  }
 });
}
