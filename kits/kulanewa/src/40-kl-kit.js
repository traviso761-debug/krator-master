// prefix: kl
// ================================================================= KULANEWA 4-REGISTER STRUCTURAL, KURA, KIYOMIZU, SANJHYA & WALK TOOLKIT
// Shared engineering foundation for both Karum Ledger-Syndicates ('karum') and Kula-Na Ikki Covenant-Communes ('ikki').
// Invariants enforced by construction:
//   1. All decorative courses, socles, udatsu firewall wings, kiyomizu trestles, columns, stairs and curbs run inside svNoWalk(() => ...)
//      so KWALKBOX never registers fake sill, socle or unbridged far-bank curb floors.
//   2. Full-height wall blockers (dy >= 0.85 m) are registered explicitly via klWallBlock, leaving clean doorway gaps bridged
//      by wkPad thresholds and operable core/door leaves.
//   3. Adjacent material faces step by >= 0.025 m (2.5 cm) so world-space coplanar triangle overlap is strictly zero.

const klTmpM=new THREE.Matrix4(),klTmpS=new THREE.Vector3();

function klNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}

function klBelowGrade(fn){const keepSB=SB;SB=null;try{klNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

function klTarget(x,y,z,name,indoor){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor',indoor:indoor!==false});
}

function klRoom(x0,z0,x1,z1,y0,h,o){
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

function klFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.008,e[3],e[4]==null?0:e[4],e[5]);
}

function klWallBlock(lx,ly,lz,w,h,d,ry){
 if(PLACE_DRY||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const bh=Math.max(.84,h);
 klTmpM.copy(CM).multiply(TF(lx,ly+bh/2,lz,ry==null?0:ry));
 klTmpM.scale(klTmpS.set(Math.max(.14,w),bh,Math.max(.14,d)));
 KWALKBOX.add(KWALK,klTmpM.elements,{tag:'wall:'+CURKEY});
}

function klFloorSlab(cx,yTop,cz,w,d,o){
 o=o||{};
 const th=o.th==null?.18:o.th,mk=o.mk||'floor',col=o.col==null?P(mk):o.col;
 if(o.hole){
  svWell(mk,cx,yTop-th,cz,w,th,d,col,o.hole,{walk:o.walk!==false});
 }else{
  svNoWalk(()=>box(mk,cx,yTop-th,cz,w,th,d,col));
  if(o.walk!==false)wkPad(cx,cz,w,d,yTop);
 }
 return yTop;
}

function klFloorDisc(cx,cz,r,yTop,mk,col,o){
 o=o||{};
 const seg=o.seg==null?18:o.seg,th=o.th==null?.16:o.th,pts=[];
 for(let i=0;i<seg;i++){const a=i/seg*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 svNoWalk(()=>prism(mk||'floor',pts,yTop-th,yTop,col==null?P(mk||'floor'):col));
 if(o.walk!==false)svFloor(pts,yTop);
 return pts;
}

function klCeilingSlab(cx,yCeil,cz,w,d,o){
 o=o||{};
 if(w<.3||d<.3)return;
 const mk=o.mk||'darkcedar',col=o.col==null?P(mk):o.col;
 const trimMk=o.trimMk||'cedar',trimCol=o.trimCol==null?P(trimMk):o.trimCol;
 svNoWalk(()=>{
  box(mk,cx,yCeil,cz,w,.09,d,col);
  const nx=Math.max(2,Math.min(5,Math.round(w/2.7))),nz=Math.max(2,Math.min(5,Math.round(d/2.7)));
  for(let i=1;i<nx;i++){
   const xx=cx-w/2+w*i/nx;
   box(trimMk,xx,yCeil-.045,cz,.09,.042,d-.18,trimCol);
  }
  for(let j=1;j<nz;j++){
   const zz=cz-d/2+d*j/nz;
   box(mk,cx,yCeil-.09,zz,w-.18,.04,.09,col);
  }
 });
}

function klStripWalk(a,b,w){
 if(!svWalkOn())return;
 const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY;
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);
 if(L<1e-4)return;
 const ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[-.25,-w/2],[.6,-w/2],[.6,w/2],[-.25,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});
}

/* Masonry or heavy-cedar flight from (x0, y0, z0) climbing to (x1, y1, z1) with width w, solid/open steps in svNoWalk,
   walkable klStripWalk + foot/top wkPad landings, and optional stepped kura/sootstone cheeks or dark-cedar handrails. */
function klStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(rise<.05||run<.2)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(2,Math.ceil(rise/KL.RISER));
 const mk=o.mk||'sootstone',col=o.col==null?P(mk):o.col;
 const sideMk=o.sideMk||'kura',sideCol=o.sideCol==null?P(sideMk):o.sideCol;
 klNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    for(let i=0;i<ns;i++){
     const f0=i/ns,f1=(i+1)/ns,za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const yt=y0+rise*f1,yb=o.openUnder?Math.max(y0,yt-.22):y0;
     box(mk,0,yb,(za+zb)/2,w-.04,Math.max(.06,yt-yb),Math.abs(zb-za)+.012,col);
    }
    if(o.cheek==='timber'){
     for(const s of [-1,1]){
      const sx=s*(w/2+.08);
      beam('darkcedar',[sx,y0+.12,-run/2],[sx,y1-.02,run/2],.08,P('darkcedar'));
      beam('darkcedar',[sx,y0+.88,-run/2],[sx,y1+.88,run/2],.065,P('darkcedar'));
      for(const f of [.04,.5,.96]){
       const zz=lerp(-run/2,run/2,f),yy=lerp(y0,y1,f);
       box('darkcedar',sx,yy,zz,.07,.88,.07,P('darkcedar'));
      }
     }
    }else if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.14);
      for(let k=0;k<3;k++){
       const fk0=k/3,fk1=(k+1)/3,zk=lerp(-run/2,run/2,(fk0+fk1)/2),yk=y0+rise*fk1+.24;
       const cb=o.openUnder?y0+rise*fk0:y0,ch=o.openUnder?rise*.33+.32:yk-y0;
       box(sideMk,sx,cb,zk,.22,ch,run/3+.01,sideCol);
       box('sootstone',sx,cb+ch,zk,.25,.055,run/3+.03,P('sootstone'));
      }
     }
    }
   });
  });
  klStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(.95,w-.2));
  const ux=dx/run,uz=dz/run;
  const pw=Math.abs(uz)>=Math.abs(ux)?Math.max(1.0,w-.16):1.0;
  const pd=Math.abs(uz)>=Math.abs(ux)?1.0:Math.max(1.0,w-.16);
  wkPad(x0-ux*.36,z0-uz*.36,pw,pd,y0);
  wkPad(x1+ux*.36,z1+uz*.36,pw,pd,y1);
 });
}

/* Interior open-tread timber stair from (x, y0, z) climbing toward yaw up to y1, using klStripWalk (0.85 m landing pad)
   and returning {x0, x1, z0, z1} for klFloorSlab(..., {hole}) so no 0.35 m landing strip ever misses the 0.4 m KWALK grid. */
function klInteriorStair(x,z,y0,y1,yaw,o){
 o=o||{};
 const rise=y1-y0;
 if(!(rise>.05))return null;
 const w=o.w==null?1.18:o.w,ux=Math.sin(yaw==null?0:yaw),uz=Math.cos(yaw==null?0:yaw),px=uz,pz=-ux;
 const rmax=o.riser==null?.18:o.riser,n=Math.max(2,Math.ceil(rise/rmax-1e-9)),riser=rise/n;
 const going=o.going==null?.27:o.going,run=(n-1)*going;
 const mk=o.mk||'darkcedar',col=o.col==null?P(mk):o.col,smk=o.smk||mk,scol=o.scol==null?col:o.scol;
 const at=(s,r)=>[x+ux*s+px*r,z+uz*s+pz*r];
 const yawB=Math.atan2(ux,uz);
 svNoWalk(()=>{
  for(let i=1;i<n;i++){
   const q=at(going*(i-.5),0);
   box(mk,q[0],y0+riser*i-.05,q[1],w,.05,going+.03,col,yawB);
  }
  for(const r of [-w/2-.035,w/2+.035]){
   const a=at(-.05,r),b=at(run+.02,r);
   beam(smk,[a[0],y0+.12,a[1]],[b[0],y1-.02,b[1]],.06,scol,false,0,.24);
   beam(smk,[a[0],y0+.92,a[1]],[b[0],y1+.92,b[1]],.05,scol);
   for(const s of [.08,run]){
    const q=at(s,r);
    box(smk,q[0],y0+riser*Math.round(s/Math.max(going,1e-3)),q[1],.05,.92,.05,scol);
   }
  }
 });
 const f=at(0,0),t=at(run,0);
 klStripWalk([f[0],y0,f[1]],[t[0],y1,t[1]],Math.max(.92,w-.14));
 wkPad(f[0]-ux*.3,f[1]-uz*.3,Math.max(1.0,w),Math.max(1.0,w),y0);
 wkPad(t[0]+ux*.4,t[1]+uz*.4,Math.max(1.0,w),Math.max(1.0,w),y1);
 const C=[at(0,-w/2-.06),at(0,w/2+.06),at(run,-w/2-.06),at(run,w/2+.06)];
 return {
  x0:Math.min(...C.map(c=>c[0])),x1:Math.max(...C.map(c=>c[0])),
  z0:Math.min(...C.map(c=>c[1])),z1:Math.max(...C.map(c=>c[1])),
  foot:f,top:t,run,n,riser
 };
}

/* AF3 Ground Register: Battered chalk-white lime-plastered kura plinth with soot-black stone socle & paved deck. */
function klKuraPlinth(w,d,h,o){
 o=o||{};
 const socMk=o.socMk||'sootstone',socCol=P(socMk);
 const kuraMk=o.kuraMk||'kura',kuraCol=P(kuraMk);
 const topMk=o.topMk||'paving',topCol=P(topMk);
 const hSoc=Math.min(.42,h*.36),hBody=Math.max(.08,h-hSoc-.07);
 klBelowGrade(()=>{
  box(socMk,0,-1.2,0,w+.68,1.18,d+.68,socCol);
 });
 klNoCut(()=>svNoWalk(()=>{
  box(socMk,0,0,0,w+.46,hSoc,d+.46,socCol);
  box(kuraMk,0,hSoc,0,w+.22,hBody,d+.22,kuraCol);
  box(topMk,0,h-.07,0,w,.07,d,topCol);
 }));
 if(o.walk!==false)wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.8:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(1.15,h*2.1):o.stepRun;
  const zTop=d/2+.06,zFoot=d/2+.26+run;
  klStair(sx,0,zFoot,sx,h,zTop,sw,{mk:socMk,sideMk:kuraMk,cheek:o.cheek});
 }
 return h;
}

/* AF3 Ground/Mid Register: Stepped projecting white-kura udatsu firewall wing capped with slate/terracotta copings. */
function klUdatsuWall(x,y0,z,yaw,dWing,hWing,o){
 o=o||{};
 const t=o.t==null?.36:o.t,capMk=o.capMk||(o.style==='ikki'?'slate':'terracotta'),capCol=P(capMk);
 const kuraCol=P('kura'),socCol=P('sootstone');
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   const nSteps=3;
   for(let i=0;i<nSteps;i++){
    const f0=i/nSteps,f1=(i+1)/nSteps;
    const zA=lerp(-dWing/2,dWing/2,f0),zB=lerp(-dWing/2,dWing/2,f1);
    const segD=Math.abs(zB-zA)-.01,segZ=(zA+zB)/2;
    const hStep=hWing*(1-i*.22);
    const socH=Math.min(.38,hStep*.2);
    box('sootstone',0,0,segZ,t+.05,socH,segD,socCol);
    box('kura',0,socH,segZ,t,hStep-socH-.09,segD,kuraCol);
    box(capMk,0,hStep-.09,segZ,t+.09,.09,segD+.06,capCol);
   }
  });
  if(o.block)klWallBlock(0,0,0,t,Math.max(.9,hWing*.75),dWing,0);
 });
}

/* AF3 Ground Register: Interlocking dark-cedar kiyomizu post-and-crossbeam river-trestle stage over water or slope. */
function klKiyomizuTrestle(cx,cz,w,d,yBed,yDeck,o){
 o=o||{};
 const postMk=o.postMk||'darkcedar',postCol=P(postMk);
 const braceMk=o.braceMk||'cedar',braceCol=P(braceMk);
 const deckMk=o.deckMk||'floor';
 const nx=o.nx==null?Math.max(2,Math.round(w/3.1)+1):o.nx;
 const nz=o.nz==null?Math.max(2,Math.round(d/3.1)+1):o.nz;
 const hLeg=yDeck-yBed-.22;
 klNoCut(()=>{
  svNoWalk(()=>{
   if(hLeg>.35){
    for(let ix=0;ix<nx;ix++){
     const px=cx+lerp(-w/2+.28,w/2-.28,nx===1?.5:ix/(nx-1));
     for(let iz=0;iz<nz;iz++){
      const pz=cz+lerp(-d/2+.28,d/2-.28,nz===1?.5:iz/(nz-1));
      box('sootstone',px,yBed+.01,pz,.36,.16,.36,P('sootstone'));
      box(postMk,px,yBed+.17,pz,.22,hLeg-.17,.22,postCol);
     }
     if(d>2.2){
      box(braceMk,px,yBed+hLeg*.52,cz,.12,.14,d-.36,braceCol);
     }
    }
    for(let iz=0;iz<nz;iz++){
     const pz=cz+lerp(-d/2+.28,d/2-.28,nz===1?.5:iz/(nz-1));
     if(w>2.2){
      box(braceMk,cx,yBed+hLeg*.68,pz,w-.36,.14,.12,braceCol);
     }
    }
    /* Outer X-braces on front (+z) and side bents */
    for(const sz of [-d/2+.28,d/2-.28]){
     for(let ix=0;ix+1<nx;ix++){
      const xA=cx+lerp(-w/2+.28,w/2-.28,ix/(nx-1)),xB=cx+lerp(-w/2+.28,w/2-.28,(ix+1)/(nx-1));
      beam(braceMk,[xA+.12,yBed+.24,sz],[xB-.12,yBed+hLeg-.08,sz],.075,braceCol);
      beam(braceMk,[xB-.12,yBed+.24,sz],[xA+.12,yBed+hLeg-.08,sz],.075,braceCol);
     }
    }
   }
   /* Heavy projecting dark-cedar deck girders below floor planks */
   box(postMk,cx,yDeck-.22,cz,w+.12,.12,d+.12,postCol);
  });
  klFloorSlab(cx,yDeck,cz,w,d,{mk:deckMk,th:.1,walk:o.walk!==false});
  const rails=o.rails||'';
  if(rails.indexOf('s')>=0)klParapet(cx-w/2+.12,cz+d/2-.12,cx+w/2-.12,cz+d/2-.12,yDeck,{kind:'timber',skipMid:o.gapS});
  if(rails.indexOf('n')>=0)klParapet(cx+w/2-.12,cz-d/2+.12,cx-w/2+.12,cz-d/2+.12,yDeck,{kind:'timber',skipMid:o.gapN});
  if(rails.indexOf('e')>=0)klParapet(cx+w/2-.12,cz+d/2-.24,cx+w/2-.12,cz-d/2+.24,yDeck,{kind:'timber',skipMid:o.gapE});
  if(rails.indexOf('w')>=0)klParapet(cx-w/2+.12,cz-d/2+.24,cx-w/2+.12,cz+d/2-.24,yDeck,{kind:'timber',skipMid:o.gapW});
 });
 return yDeck;
}

/* Stone-curbed canal, hydro-flume or Jinaimachi wet moat (strictly svNoWalk so unbridged curbs never register fake floors). */
function klWaterChannel(cx,cz,w,d,yRim,depth,o){
 o=o||{};
 const dep=depth==null?.65:depth,curbW=.34;
 const curbMk=o.curbMk||'sootstone',curbCol=P(curbMk);
 const bedMk=o.bedMk||'cobble',bedCol=P(bedMk);
 klNoCut(()=>svNoWalk(()=>{
  box(bedMk,cx,yRim-dep-.1,cz,w,.1,d,bedCol);
  for(const sz of [-d/2+curbW/2,d/2-curbW/2])box(curbMk,cx,yRim-dep,cz+sz,w,dep+.12,curbW,curbCol);
  for(const sx of [-w/2+curbW/2,w/2-curbW/2])box(curbMk,cx+sx,yRim-dep,cz,curbW,dep+.12,d-curbW*2,curbCol);
  if(!o.river&&o.waterMesh!==false){
   box('water',cx,yRim-.16,cz,w-curbW*2-.04,.1,d-curbW*2-.04,P('water'));
  }
 }));
 if(o.river&&CURREC&&!PLACE_DRY){
  const alongX=o.river.axis==='x'||(o.river.axis!=='z'&&w>=d);
  const wy=yRim-.12;
  const localPts=alongX
   ?[[-w/2+.4,wy,cz],[0,wy,cz],[w/2-.4,wy,cz]]
   :[[cx,wy,-d/2+.4],[cx,wy,0],[cx,wy,d/2-.4]];
  if(o.river.flip)localPts.reverse();
  const wPts=localPts.map(q=>{
   const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
   return [v.x,v.z,v.y];
  });
  const spanW=alongX?Math.max(1.2,d-curbW*2-.2):Math.max(1.2,w-curbW*2-.2);
  CURREC.river={name:o.river.name||CURKEY+'-stream',pts:wPts,width:o.river.width==null?spanW:o.river.width,speed:o.river.speed==null?.52:o.river.speed};
 }
}

/* Heavy dark-cedar moat or canal bridge spanning (x0,z0) -> (x1,z1) at yDeck with cutwater bents and walkable strip. */
function klTimberBridge(x0,z0,x1,z1,yBed,yDeck,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);
 if(L<.25)return;
 const yaw=Math.atan2(dx,dz),bw=w==null?2.4:w;
 klNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    box('darkcedar',0,yDeck-.22,0,bw-.08,.12,L,P('darkcedar'));
    box('floor',0,yDeck-.1,0,bw,.1,L+.08,P('floor'));
    const nBents=Math.max(2,Math.round(L/2.9)+1);
    for(let i=0;i<nBents;i++){
     const zz=lerp(-L/2+.28,L/2-.28,nBents===1?.5:i/(nBents-1));
     for(const sx of [-bw/2+.15,bw/2-.15]){
      if(yDeck-yBed>.25){
       box('sootstone',sx,yBed+.01,zz,.28,.16,.34,P('sootstone'));
       cyl('darkcedar',sx,yBed+.17,zz,.11,yDeck-yBed-.39,P('darkcedar'),8);
      }
      if(o.rails!==false){
       box('darkcedar',sx,yDeck+.006,zz,.1,.88,.1,P('darkcedar'));
       box('bronze',sx,yDeck+.886,zz,.13,.05,.13,P('bronze'));
      }
     }
    }
    if(o.rails!==false){
     for(const sx of [-bw/2+.15,bw/2-.15]){
      box('darkcedar',sx,yDeck+.74,0,.07,.08,L,P('darkcedar'));
      box('cedar',sx,yDeck+.36,0,.05,.07,L-.12,P('cedar'));
     }
    }
   });
  });
  klStripWalk([x0,yDeck,z0],[x1,yDeck,z1],Math.max(.95,bw-.3));
  wkPad(x0,z0,bw,bw,yDeck);
  wkPad(x1,z1,bw,bw,yDeck);
 });
}

/* Style A Mid/Ground Register: Carved dark-cedar jambs & repousse cast-bronze semicircular Newar torana doorway tympanum. */
function klToranaDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t;
 const fMk=o.frameMk||'darkcedar',fCol=P(fMk);
 const tymMk=o.tymMk||'bronze',tymCol=P(tymMk);
 const leafMk=o.leafMk||(o.register==='kura'?'iron':'darkcedar'),leafCol=P(leafMk);
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('sootstone',s*(w/2+.1),0,0,.2,.24,t+.16,P('sootstone'));
    box(fMk,s*(w/2+.09),.24,0,.18,h-.16,t+.14,fCol);
   }
   box(fMk,0,h+.08,0,w+.46,.18,t+.18,fCol);
   if(o.torana!==false){
    const rT=Math.min(.95,w*.52),pz=t/2+.11;
    /* Semicircular repousse cast-bronze Newar torana tympanum + central Syndicate/Covenant medallion (zero royal spires!) */
    const nSeg=7;
    for(let i=0;i<nSeg;i++){
     const a0=PI*i/nSeg,a1=PI*(i+1)/nSeg,am=(a0+a1)/2;
     const rx=Math.cos(am)*rT*.74,ry=h+.28+Math.sin(am)*rT*.58;
     box(tymMk,rx,ry-.08,pz,.24,.18,.055,tymCol);
    }
    box('copper',0,h+.3,pz-.01,rT*1.28,rT*.42,.035,P('copper'));
    cyl('nickel',0,h+.44,pz+.035,.13,.03,P('nickel'),10);
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.06,h-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'banded',hwCol:o.register==='kura'?0xd8dee4:0xb68a44,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'door'
   });
  }
  door(0,0,t/2,0,w,h);
  if(o.walkPad!==false)wkPad(0,0,w+.28,t+1.18,0);
 });
}

/* AF3 Ground Register: Rebated kura/sootstone vault window with open riveted black-iron & Arch-nickel fire-shutters + svPane. */
function klFireShutterWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   box('sootstone',0,-.08,0,w+.24,.08,t+.14,P('sootstone'));
   for(const s of [-1,1]){
    box('sootstone',s*(w/2+.055),0,0,.11,h,t+.1,P('sootstone'));
    /* Open iron fire-shutter leaf folded back cleanly proud of outer wall face (+z = t/2 + 0.085) */
    const sx=s*(w/2+.14+w*.24);
    box('iron',sx,.02,t/2+.085,w*.46,h-.04,.04,P('iron'));
    for(const by of [.18,h-.24]){
     box('nickel',sx,by,t/2+.115,w*.44,.045,.02,P('nickel'));
    }
   }
   box('sootstone',0,h,0,w+.28,.12,t+.14,P('sootstone'));
   /* Vertical iron vault bars inside opening */
   for(const bx of [-w*.22,0,w*.22]){
    cyl('iron',bx,.02,t*.18,.018,h-.04,P('iron'),6);
   }
  });
  svPane(0,0,0,0,w-.06,h-.02,{kind:o.kind||'lit',t:.025});
  windowAt(0,0,t/2,0,w,h,o.sill==null?1.0:o.sill);
 });
}

/* Style A Mid-Register: Projecting carved dark-cedar Newar sanjhya lattice counting-window on diagonal tundal struts + svPane. */
function klSanjhyaOriel(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t,proj=o.proj==null?.36:o.proj;
 const roofMk=o.roofMk||(o.style==='ikki'?'slate':'terracotta'),roofCol=P(roofMk);
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   if(o.flat){
    /* Flush carved dark-cedar T-lintel Newar window */
    box('darkcedar',0,-.07,0,w+.32,.07,t+.14,P('darkcedar'));
    for(const s of [-1,1])box('darkcedar',s*(w/2+.055),0,0,.11,h,t+.1,P('darkcedar'));
    box('darkcedar',0,h,0,w+.42,.12,t+.16,P('darkcedar'));
    box('carvedwood',0,h+.12,0,w+.24,.07,t+.14,P('carvedwood'));
   }else{
    /* Projecting sanjhya oriel box starting cleanly outside wall face at z0 = t/2 + 0.04 */
    const z0=t/2+.04,zc=z0+proj/2;
    box('darkcedar',0,-.08,zc,w+.28,.08,proj,P('darkcedar'));
    /* Diagonal carved tundal brackets under sill */
    for(const sx of [-w*.36,0,w*.36]){
     beam('carvedwood',[sx,-.42,z0+.03],[sx,-.08,z0+proj-.06],.07,P('carvedwood'));
    }
    /* Carved lattice apron & corner mullions */
    box('carvedwood',0,0,z0+proj-.04,w+.16,h*.28,.06,P('carvedwood'));
    for(const s of [-1,1]){
     box('carvedwood',s*(w/2+.04),0,zc,.08,h,proj-.04,P('carvedwood'));
     box('darkcedar',s*(w*.18),h*.28,z0+proj-.035,.055,h*.72,.055,P('darkcedar'));
    }
    /* Pitched mini-eave hood over sanjhya oriel */
    box('darkcedar',0,h,zc,w+.34,.08,proj+.08,P('darkcedar'));
    box(roofMk,0,h+.08,zc+.02,w+.44,.08,proj+.16,roofCol);
   }
  });
  svPane(0,0,0,0,w-.06,h-.02,{kind:o.kind||'lit',t:.025});
  windowAt(0,0,t/2,0,w,h,o.sill==null?.95:o.sill);
 });
}

/* Style A Mid-Register: Restrained Ria-inherited cobalt or celadon glazed tile dado frieze with crisp alabaster borders. */
function klDadoFrieze(cx,y0,cz,w,d,h,o){
 o=o||{};
 const fh=h==null?.24:h,mk=o.mk||'cobalt',col=P(mk),filCol=P('alabaster');
 svNoWalk(()=>{
  box('alabaster',cx,y0,cz,w+.05,.045,d+.05,filCol);
  box(mk,cx,y0+.045,cz,w+.07,Math.max(.06,fh-.09),d+.07,col);
  box('alabaster',cx,y0+fh-.045,cz,w+.05,.045,d+.05,filCol);
 });
 return y0+fh;
}

/* Straight Kulanewa wall segment from (x0,z0) to (x1,z1) supporting register 'kura' | 'brick' | 'timber', cut openings,
   and doorway-split klWallBlock collision (never emitting fake sill/socle floors). */
function klWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.08)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?KL.WALL:o.t;
 const reg=o.register||'kura';
 const soc=o.socle==null?(reg==='kura'?KL.SOCLE:reg==='brick'?.08:.14):o.socle;
 const dado=o.dado==null?(reg==='kura'?.1:reg==='brick'?.22:0):o.dado;
 const socMk=o.socMk||(reg==='kura'?'sootstone':reg==='brick'?'alabaster':'darkcedar'),socCol=P(socMk);
 const dadoMk=o.dadoMk||(reg==='kura'?'iron':o.style==='ikki'?'celadon':'cobalt'),dadoCol=P(dadoMk);
 const mk=o.mk||(reg==='kura'?'kura':reg==='brick'?'kilnbrick':'cedar'),col=o.col==null?P(mk):o.col;
 const holes=(o.holes||[]).map(q=>{
  const wy=q.y==null?(q.door?0:1.0):q.y,wh=q.h==null?(q.door?KL.DOOR_H:1.3):q.h;
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
  for(const q of holes){
   if(q.draw===false)continue;
   if(q.door){
    klToranaDoor(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style,register:reg},q));
   }else if((q.winKind||reg)==='kura'){
    klFireShutterWindow(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style,sill:q.wy},q));
   }else{
    klSanjhyaOriel(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,style:o.style,sill:q.wy},q));
   }
  }
  if(o.block!==false&&h>=.82){
   const dSpans=holes.filter(q=>q.door).map(q=>[Math.max(0,q.a),Math.min(L,q.b)]).sort((a,b)=>a[0]-b[0]);
   let cur=0;
   for(const sp of dSpans){
    if(sp[0]-cur>.16)klWallBlock(X((cur+sp[0])/2),y0,0,sp[0]-cur,h,t,0);
    cur=Math.max(cur,sp[1]);
   }
   if(L-cur>.16)klWallBlock(X((cur+L)/2),y0,0,L-cur,h,t,0);
  }
 });
}

/* Rectangular Kulanewa wall enclosure [x0..x1, z0..z1] with proud corner quoins/posts, optional udatsu firewall wings,
   dark-cedar eave wall-plate, and automatic CURREC.rooms recording. */
function klWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?KL.WALL:o.t,reg=o.register||'kura';
 const pw=t+.08,hp=pw/2+.015,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||(reg==='kura'?'sootstone':'darkcedar'),postCol=P(postMk);
 const baseMk=reg==='kura'?'sootstone':'alabaster',baseCol=P(baseMk);
 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.5,h*.2);
   box(baseMk,cx,y0,cz,pw+.04,sh,pw+.04,baseCol);
   box(postMk,cx,y0+sh,cz,pw,h-sh,pw,postCol);
  }
  if(o.plate!==false){
   const plateMk=reg==='kura'?'sootstone':'darkcedar',plateCol=P(plateMk);
   box(plateMk,(x0+x1)/2,y0+h,z1,x1-x0+pw+.06,.14,pw+.06,plateCol);
   box(plateMk,(x0+x1)/2,y0+h,z0,x1-x0+pw+.06,.14,pw+.06,plateCol);
   box(plateMk,x0,y0+h,(z0+z1)/2,pw+.06,.14,z1-z0-pw-.08,plateCol);
   box(plateMk,x1,y0+h,(z0+z1)/2,pw+.06,.14,z1-z0-pw-.08,plateCol);
  }
 });
 if(o.block!==false&&h>=.82){
  for(const cx of [x0,x1])for(const cz of [z0,z1])klWallBlock(cx,y0,cz,pw,h,pw,0);
 }
 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 if(skip.indexOf('s')<0)klWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shiftPos(H.s,x0+hp)}));
 if(skip.indexOf('n')<0)klWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shiftRev(H.n,x1-hp)}));
 if(skip.indexOf('e')<0)klWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shiftRev(H.e,z1-hp)}));
 if(skip.indexOf('w')<0)klWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shiftPos(H.w,z0+hp)}));

 if(o.udatsu==='ew'){
  const uw=o.udatsuD==null?1.35:o.udatsuD,uh=o.udatsuH==null?h+.55:o.udatsuH;
  klUdatsuWall(x0-pw/2-.2,y0,z1-.75,0,uw,uh,{style:o.style});
  klUdatsuWall(x1+pw/2+.2,y0,z1-.75,0,uw,uh,{style:o.style});
 }else if(o.udatsu==='all'){
  const uw=o.udatsuD==null?1.25:o.udatsuD,uh=o.udatsuH==null?h+.5:o.udatsuH;
  for(const sx of [x0-pw/2-.2,x1+pw/2+.2]){
   klUdatsuWall(sx,y0,z1-.7,0,uw,uh,{style:o.style});
   klUdatsuWall(sx,y0,z0+.7,PI,uw,uh,{style:o.style});
  }
 }
 klRoom(x0,z0,x1,z1,y0,h,o);
}

/* Carved Newar dark-cedar structural post with sootstone pad and bracketed double-corbel capital. */
function klCedarPost(x,y0,z,h,o){
 o=o||{};
 const w=o.w==null?.24:o.w,mk=o.mk||'darkcedar',col=P(mk);
 svNoWalk(()=>{
  box('sootstone',x,y0+.01,z,w*1.65,.18,w*1.65,P('sootstone'));
  box(mk,x,y0+.19,z,w,Math.max(.3,h-.49),w,col);
  if(o.bandMk){
   box(o.bandMk,x,y0+h*.52,z,w+.04,.07,w+.04,P(o.bandMk));
  }
  box('carvedwood',x,y0+h-.3,z,w*1.85,.15,w*1.35,P('carvedwood'),o.yaw==null?0:o.yaw);
  box(mk,x,y0+h-.15,z,w*2.35,.15,w*1.5,col,o.yaw==null?0:o.yaw);
 });
 if(o.block&&h>=1.2)klWallBlock(x,y0,z,w*1.3,h,w*1.3,0);
}

/* Bracketed Newar dark-cedar colonnade from (x0,z0) to (x1,z1) with carved architrave & diagonal struts.
   Defaults to block: false so upper galleries and clearing loggias stay 100% open to KWALK. */
function klTimberColonnade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.4)return;
 const n=o.n==null?Math.max(2,Math.round(L/KL.BAY)+1):o.n;
 const pw=o.w==null?.23:o.w,entH=o.entH==null?.34:o.entH,colH=h-entH,yaw=Math.atan2(z0-z1,x1-x0);
 const trimMk=o.trimMk||(o.style==='ikki'?'nickel':'bronze'),trimCol=P(trimMk);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<n;i++){
   const f=n===1?.5:i/(n-1),xx=(f-.5)*L;
   if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
   klCedarPost(xx,y0,0,colH,{w:pw,mk:o.mk,bandMk:o.bandMk,block:!!o.block});
  }
  svNoWalk(()=>{
   box('darkcedar',0,y0+colH,0,L+pw*2.2,entH*.58,pw*1.75,P('darkcedar'));
   box(trimMk,0,y0+colH+entH*.58,0,L+pw*2.35,entH*.16,pw*1.88,trimCol);
   box('carvedwood',0,y0+colH+entH*.74,0,L+pw*2.5,entH*.26,pw*2.05,P('carvedwood'));
  });
 });
}

/* Gallery timber balustrade OR white-kura slate-coped moat wall parapet (svNoWalk; NEVER blocks unless o.block === true). */
function klParapet(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.35)return;
 const yaw=Math.atan2(z0-z1,x1-x0),kind=o.kind||'timber';
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   if(kind==='kura'){
    const h=o.h==null?1.05:o.h,t=o.t==null?.32:o.t;
    const capMk=o.capMk||(o.style==='ikki'?'slate':'terracotta');
    box('sootstone',0,y0+.008,0,L,.18,t+.04,P('sootstone'));
    box('kura',0,y0+.188,0,L,h-.28,t,P('kura'));
    box(capMk,0,y0+h-.092,0,L+.06,.092,t+.1,P(capMk));
   }else{
    const h=o.h==null?.86:o.h,t=o.t==null?.14:o.t;
    box('darkcedar',0,y0+.008,0,L,.09,t,P('darkcedar'));
    const nB=Math.max(2,Math.floor((L-.3)/.38));
    for(let i=0;i<nB;i++){
     const xx=lerp(-L/2+.18,L/2-.18,i/(nB-1));
     if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
     box('carvedwood',xx,y0+.098,0,.065,h-.21,.065,P('carvedwood'));
    }
    box('darkcedar',0,y0+h-.112,0,L+.04,.075,t+.04,P('darkcedar'));
    box('cedar',0,y0+h-.037,0,L+.06,.037,t+.06,P('cedar'));
   }
  });
  if(o.block)klWallBlock(0,y0,0,L,o.h==null?.92:o.h,.24,0);
 });
}
