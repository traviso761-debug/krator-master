// prefix: sk
// ================================================================= SHORE-KIN VERNACULAR TOOLKIT (Rian + Eternian + Hueru-Kuran + Fleet-born)
// Synthesizes the four architectural strands in strict Arch local & sea-derived materials:
//   - Rian strand: skArchedSocle, skBoardwalk, skTieredRoof, skOhiaFinial
//   - Eternian strand: skHexPts, skWoodCrib, skHexCrib, skDoor, skWindow, skMask, skBruciteScreen, skHexWallRing, skHexRoof
//   - Hueru-Kuran & Fleet-born strands: skSerpentineLodgeShell, skKaenCrown, skSharkskinAwning, skWindRack, skShellChimes
const SK_TMP_M=new THREE.Matrix4(),SK_TMP_S=new THREE.Vector3(),SK_TMP_V=new THREE.Vector3();

/* Attaches structured Arch material bills (34-sk-trades.js SK_BILLS) onto both DEFS[key] and every placed REG record. */
function skAttachBill(key){
 const b=typeof SK_BILLS!=='undefined'?SK_BILLS[key]:null;
 if(b&&CURREC){
  CURREC.materials=b.materials;
  CURREC.bill=b.bill;
  CURREC.byArchMat=b.byArchMat;
 }
}

function skNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
function skBelowGrade(fn){const keepSB=SB;SB=null;try{skNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

function skTarget(x,y,z,name,indoor){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor',indoor:indoor!==false});
}

function skRoom(x0,z0,x1,z1,y0,h,o){
 if(PLACE_DRY||!CURREC||CURREC.cls!=='building')return null;
 o=o||{};
 if(o.room===false||h<1.75)return null;
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

function skFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.006,e[3],e[4]==null?0:e[4],e[5]);
}

function skWaterStill(name,x,z,rx,rz,level,o){
 if(PLACE_DRY||!CURREC)return;
 o=o||{};
 const p=new THREE.Vector3(x,level,z).applyMatrix4(CM);
 (CURREC.stills||(CURREC.stills=[])).push({
  name:name,cx:p.x,cz:p.z,rx:rx,rz:rz,level:p.y,
  shallow:o.shallow==null?0x3a8488:o.shallow,deep:o.deep==null?0x184852:o.deep
 });
}

function skWaterFlow(name,pts,width,speed){
 if(PLACE_DRY||!CURREC)return;
 const wPts=pts.map(q=>{const p=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);return [p.x,p.y,p.z];});
 (CURREC.flows||(CURREC.flows=[])).push({name:name,pts:wPts,width:width==null?1.8:width,speed:speed==null?.55:speed});
}

function skWallBlock(lx,ly,lz,w,h,d,ry){
 if(PLACE_DRY||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const bh=Math.max(.82,h);
 SK_TMP_M.copy(CM).multiply(TF(lx,ly+bh/2,lz,ry||0));
 SK_TMP_M.scale(SK_TMP_S.set(Math.max(.14,w),bh,Math.max(.14,d)));
 KWALKBOX.add(KWALK,SK_TMP_M.elements,{tag:'wall:'+CURKEY});
}

function skFloorSlab(cx,yTop,cz,w,d,o){
 o=o||{};
 const th=o.th==null?.12:o.th,mk=o.mk||'paving',col=o.col==null?P(mk):o.col;
 if(o.hole){
  svWell(mk,cx,yTop-th,cz,w,th,d,col,o.hole,{walk:o.walk!==false});
 }else{
  svNoWalk(()=>box(mk,cx,yTop-th,cz,w,th,d,col));
  if(o.walk!==false)wkPad(cx,cz,w,d,yTop);
 }
 return yTop;
}

function skFloorPoly(pts,yTop,mk,col,o){
 o=o||{};
 const th=o.th==null?.12:o.th,m=mk||'paving';
 svNoWalk(()=>prism(m,pts,yTop-th,yTop,col==null?P(m):col));
 if(o.walk!==false)svFloor(pts,yTop);
 return yTop;
}

function skCeilingSlab(cx,yCeil,cz,w,d,o){
 o=o||{};
 if(w<.3||d<.3)return;
 const mk=o.mk||'paperbark',col=o.col==null?P(mk):o.col;
 const beamMk=o.beamMk||'araucaria',beamCol=o.beamCol==null?P(beamMk):o.beamCol;
 svNoWalk(()=>{
  box(mk,cx,yCeil,cz,w,.08,d,col);
  const nx=Math.max(2,Math.min(5,Math.round(w/2.6)));
  for(let i=1;i<nx;i++){
   const xx=cx-w/2+w*i/nx;
   box(beamMk,xx,yCeil-.06,cz,.09,.055,d-.18,beamCol);
  }
 });
}

function skStripWalk(a,b,w){
 if(!svWalkOn())return;
 const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY;
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[-.25,-w/2],[.62,-w/2],[.62,w/2],[-.25,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});
}

function skStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(rise<.05||run<.2)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(2,Math.ceil(rise/SK.RISER));
 const mk=o.mk||'laterite',col=o.col==null?P(mk):o.col;
 const sideMk=o.sideMk||'pillowbasalt',sideCol=o.sideCol==null?P(sideMk):o.sideCol;
 skNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    for(let i=0;i<ns;i++){
     const f0=i/ns,f1=(i+1)/ns,za=lerp(-run/2,run/2,f0),zb=lerp(-run/2,run/2,f1);
     const yt=y0+rise*f1,yb=o.openUnder?Math.max(y0,yt-.2):y0;
     box(mk,0,yb,(za+zb)/2,w-.04,Math.max(.06,yt-yb),Math.abs(zb-za)+.01,col);
    }
    if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.11);
      for(let k=0;k<3;k++){
       const fk0=k/3,fk1=(k+1)/3,zk=lerp(-run/2,run/2,(fk0+fk1)/2),yk=y0+rise*fk1+.18;
       box(sideMk,sx,o.openUnder?y0+rise*fk0:y0,zk,.18,o.openUnder?rise*.33+.26:yk-y0,run/3+.01,sideCol);
      }
     }
    }
   });
  });
  skStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(.92,w-.18));
  const ux=dx/run,uz=dz/run,pw=Math.abs(uz)>=Math.abs(ux)?Math.max(1.0,w-.14):1.0,pd=Math.abs(uz)>=Math.abs(ux)?1.0:Math.max(1.0,w-.14);
  wkPad(x0-ux*.36,z0-uz*.36,pw,pd,y0);
  wkPad(x1+ux*.36,z1+uz*.36,pw,pd,y1);
 });
}

/* ---------------------------------------------------------------- RIAN STRAND: arched flood socle & mangrove boardwalk */
function skArchedSocle(w,d,h,o){
 o=o||{};
 const pierMk=o.pierMk||'pillowbasalt',pierCol=P(pierMk);
 const archMk=o.archMk||'laterite',archCol=P(archMk);
 const topMk=o.topMk||'paving',topCol=P(topMk);
 const slabT=.11,capT=.11,pierTop=Math.max(.18,h-slabT-capT);
 const nx=Math.max(2,Math.round(w/3.6)),nz=Math.max(2,Math.round(d/3.6));
 skBelowGrade(()=>{
  box(pierMk,0,-.7,0,w+.42,.7,d+.42,pierCol);
 });
 skNoCut(()=>svNoWalk(()=>{
  /* Arched perimeter & interior flood piers */
  for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
   const px=-w/2+.36+i*(w-.72)/nx,pz=-d/2+.36+j*(d-.72)/nz;
   const footH=pierTop*.36;
   box(pierMk,px,0,pz,.62,footH,.62,pierCol);
   box(archMk,px,footH,pz,.54,pierTop-footH,.54,archCol);
  }
  /* Recessed arch spandrel lintels along front/back & sides (inset 4 cm from pier faces -> zero coplanar overlap) */
  const spH=Math.min(.28,pierTop*.48);
  for(const sz of [-d/2+.36,d/2-.36]){
   for(let i=0;i<nx;i++){
    const xA=-w/2+.36+i*(w-.72)/nx,xB=-w/2+.36+(i+1)*(w-.72)/nx;
    const span=xB-xA-.56;
    if(span>.15){
     box(archMk,(xA+xB)/2,pierTop-spH,sz,span,spH,.42,archCol);
     box('brucite',(xA+xB)/2,pierTop-spH-.05,sz,.22,spH+.05,.48,P('brucite'));
    }
   }
  }
  for(const sx of [-w/2+.36,w/2-.36]){
   for(let j=0;j<nz;j++){
    const zA=-d/2+.36+j*(d-.72)/nz,zB=-d/2+.36+(j+1)*(d-.72)/nz;
    const span=zB-zA-.56;
    if(span>.15)box(archMk,sx,pierTop-spH,(zA+zB)/2,.42,spH,span,archCol);
   }
  }
  box(archMk,0,pierTop,0,w+.16,capT,d+.16,archCol);
 }));
 skFloorSlab(0,h,0,w,d,{th:slabT,mk:topMk,col:topCol,walk:o.walk!==false});
 if(o.steps!==false){
  const sw=o.stepW==null?2.2:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(1.1,h*2.05):o.stepRun;
  skStair(sx,0,d/2+.22+run,sx,h,d/2+.04,sw,{mk:archMk,sideMk:pierMk,openUnder:o.openSteps});
 }
 return h;
}

/* Braced tarred-mangrove pile crib (Eternian 72-et-harbour-wood strand adapted to Arch worm-proof mangrove) */
function skWoodCrib(cx,cz,w,d,h,o){
 o=o||{};
 const deckMk=o.deckMk||'mangrove',slabT=.09,beamTop=Math.max(.14,h-slabT);
 const nx=Math.max(2,Math.round(w/3.4)),nz=Math.max(2,Math.round(d/3.4));
 W(cx,0,cz,0,()=>{
  skNoCut(()=>svNoWalk(()=>{
   for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){
    if(i>0&&i<nx&&j>0&&j<nz)continue;
    const px=-w/2+.2+i*(w-.4)/nx,pz=-d/2+.2+j*(d-.4)/nz;
    box('tarmangrove',px,0,pz,.24,beamTop-.14,.24,P('tarmangrove'));
   }
   for(const sz of [-d/2+.2,d/2-.2]){
    box('tarmangrove',0,beamTop-.14,sz,w-.08,.14,.22,P('tarmangrove'));
    for(let i=0;i<nx;i++){
     const xA=-w/2+.2+i*(w-.4)/nx+.14,xB=-w/2+.2+(i+1)*(w-.4)/nx-.14;
     if(xB-xA>.25&&beamTop>.38){
      beam('tarmangrove',[xA,.06,sz],[xB,beamTop-.16,sz],.075,P('tarmangrove'));
     }
    }
   }
   for(const sx of [-w/2+.2,w/2-.2]){
    box('tarmangrove',sx,beamTop-.14,0,.2,.14,d-.56,P('tarmangrove'));
   }
  }));
  skFloorSlab(0,h,0,w+.16,d+.16,{th:slabT,mk:deckMk,walk:o.walk!==false});
 });
 if(o.steps!==false){
  const sw=o.stepW==null?1.8:o.stepW,sx=o.stepX==null?cx:o.stepX;
  const run=o.stepRun==null?Math.max(.95,h*2.0):o.stepRun;
  skStair(sx,0,cz+d/2+.22+run,sx,h,cz+d/2+.06,sw,{mk:'mangrove',sideMk:'tarmangrove',openUnder:true});
 }
 return h;
}

/* Regular hexagon vertices around (cx, cz) with flat face i=1..2 facing +z (outward normal +z, prism-compatible) */
function skHexPts(cx,cz,R){
 const out=[];
 for(let i=0;i<6;i++){
  const a=i*PI/3;
  out.push([cx+R*Math.cos(a),cz+R*Math.sin(a)]);
 }
 return out;
}

function skHexCrib(cx,cz,R,h,o){
 o=o||{};
 const masonry=o.masonry!==false,slabT=.11,bodyH=Math.max(.14,h-slabT);
 const H=skHexPts(cx,cz,R);
 skNoCut(()=>svNoWalk(()=>{
  if(masonry){
   prism(o.baseMk||'laterite',skHexPts(cx,cz,R+.18),0,bodyH*.55,P(o.baseMk||'laterite'));
   prism(o.capMk||'brucite',skHexPts(cx,cz,R+.08),bodyH*.55,bodyH,P(o.capMk||'brucite'));
  }else{
   for(let i=0;i<6;i++){
    const a=H[i],b=H[(i+1)%6],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
    box('tarmangrove',a[0],0,a[1],.26,bodyH-.14,.26,P('tarmangrove'));
    box('tarmangrove',mx,0,mz,.2,bodyH-.14,.2,P('tarmangrove'));
    beam('tarmangrove',[a[0],bodyH-.07,a[1]],[b[0],bodyH-.07,b[1]],.14,P('tarmangrove'));
   }
  }
 }));
 skFloorPoly(skHexPts(cx,cz,R),h,o.topMk||(masonry?'paving':'mangrove'),null,{th:slabT,walk:o.walk!==false});
 if(o.steps!==false){
  const ap=R*SK.HEX_AP,sw=o.stepW==null?2.0:o.stepW,run=o.stepRun==null?Math.max(1.0,h*2.0):o.stepRun;
  skStair(cx,0,cz+ap+.22+run,cx,h,cz+ap+.04,sw,{mk:masonry?'laterite':'mangrove',sideMk:masonry?'pillowbasalt':'tarmangrove'});
 }
 return h;
}

/* Mangrove boardwalk spanning from (x0,z0) to (x1,z1) at yDeck over tarred mangrove piles */
function skBoardwalk(x0,z0,x1,z1,yBed,yDeck,w,o){
 o=o||{};
 const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.25)return;
 const yaw=Math.atan2(dx,dz),bw=w==null?1.9:w;
 skNoCut(()=>{
  svNoWalk(()=>{
   W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
    box('tarmangrove',0,yDeck-.17,0,bw-.1,.09,L,P('tarmangrove'));
    box('mangrove',0,yDeck-.08,0,bw,.08,L+.06,P('mangrove'));
    const nPiers=Math.max(2,Math.round(L/2.6)+1);
    for(let i=0;i<nPiers;i++){
     const zz=lerp(-L/2+.22,L/2-.22,nPiers===1?.5:i/(nPiers-1));
     for(const sx of [-bw/2+.13,bw/2-.13]){
      if(yDeck-yBed>.18)cyl('tarmangrove',sx,yBed,zz,.1,yDeck-yBed-.17,P('tarmangrove'),8);
      if(o.rails!==false){
       box('mangrove',sx,yDeck+.005,zz,.09,.82,.09,P('mangrove'));
      }
     }
    }
    if(o.rails!==false){
     for(const sx of [-bw/2+.13,bw/2-.13]){
      box('araucaria',sx,yDeck+.74,0,.065,.07,L,P('araucaria'));
      sagRope('rope',[sx,yDeck+.44,-L/2+.22],[sx,yDeck+.44,L/2-.22],.05,.016,P('rope'),8);
     }
    }
   });
  });
  skStripWalk([x0,yDeck,z0],[x1,yDeck,z1],Math.max(.9,bw-.26));
  wkPad(x0,z0,bw,bw,yDeck);
  wkPad(x1,z1,bw,bw,yDeck);
 });
}

/* ---------------------------------------------------------------- ETERNIAN STRAND: closed-eyed clay/paktong masks, screens & walls */
function skSeedAt(x,y,z,salt){
 SK_TMP_V.set(x,y,z).applyMatrix4(CM);
 return KRAND.hash(0x5c0a^(salt|0),Math.round(SK_TMP_V.x*20),Math.round(SK_TMP_V.y*20),Math.round(SK_TMP_V.z*20));
}

function skMask(x,y,z,s,metalKey){
 const mk=metalKey==='paktong'?'paktong':'terracotta';
 const G=skMaskGeo(skMaskParams(skSeedAt(x,y,z,7)));
 const n=G.pos.length/3,nor=new Array(G.pos.length),idx=new Array(n);
 for(let i=0;i<n;i+=3){
  const a=i*3,ax=G.pos[a],ay=G.pos[a+1],az=G.pos[a+2];
  const ux=G.pos[a+3]-ax,uy=G.pos[a+4]-ay,uz=G.pos[a+5]-az;
  const vx=G.pos[a+6]-ax,vy=G.pos[a+7]-ay,vz=G.pos[a+8]-az;
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  for(let k=0;k<3;k++){nor[a+k*3]=nx;nor[a+k*3+1]=ny;nor[a+k*3+2]=nz;idx[i+k]=i+k;}
 }
 const m=TF(x,y-s/2,z,0);
 m.scale(new THREE.Vector3(s*.92,s,s*.58));
 svNoWalk(()=>emit(mk,mkGeo(G.pos.slice(),nor,G.uv.slice(),idx),m,P(mk)));
 if(CURREC&&!PLACE_DRY)(CURREC.masks||(CURREC.masks=[])).push({mat:mk==='paktong'?'paktong':'laterite_terracotta',eyes:'closed'});
}

/* Pierced geometric brucite-travertine ventilation block screen (Eternian etBlockScreen adapted to Arch brucite) */
function skBruciteScreen(L,h,y0,z,o){
 o=o||{};
 const s=o.s==null?.38:o.s,mk=o.mk||'brucite',c=P(mk);
 const nx=Math.max(2,Math.floor(L/s)),ny=Math.max(2,Math.floor(h/s));
 svNoWalk(()=>{
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
   const xx=-L/2+(i+.5)*(L/nx),yy=y0+j*(h/ny),sw=(L/nx)-.014,sh=(h/ny)-.014;
   const pierce=(i+j)%2===0;
   if(pierce){
    box(mk,xx,yy,z,sw,sh*.22,.16,c);
    box(mk,xx,yy+sh*.78,z,sw,sh*.22,.16,c);
    for(const sx of [-1,1])box(mk,xx+sx*(sw*.39),yy+sh*.22,z,sw*.22,sh*.56,.16,c);
   }else{
    box(mk,xx,yy,z,sw,sh,.16,c);
    box('verdigris',xx,yy+sh*.28,z+.095,sw*.44,sh*.44,.025,P('verdigris'));
   }
  }
 });
}

/* Operable Shore-kin doorway with stepped Deco lintel, paktong/bronze hardware, and closed-eyed ancestor mask */
function skDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?SK.WALL:o.t;
 const fMk=o.frameMk||'brucite',fCol=P(fMk);
 const leafMk=o.leafMk||'araucaria',leafCol=P(leafMk);
 const trimMk=o.trimMk||'catechutrim',trimCol=P(trimMk);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1])box(fMk,s*(w/2+.085),0,0,.14,h+.08,t+.12,fCol);
   box(fMk,0,h+.095,0,w+.44,.14,t+.16,fCol);
   box(trimMk,0,h+.24,0,w+.28,.09,t+.2,trimCol);
   box(fMk,0,h+.335,0,w*.68,.09,t+.14,fCol);
   if(o.mask!==false){
    skMask(0,h+.68,t/2+.12,.42,o.maskMat||'terracotta');
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.06,h-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'plank',
    hwCol:o.maskMat==='paktong'?0xdce2e8:0xa87c40,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'door'
   });
  }
  door(0,0,t/2,0,w,h);
  if(o.walkPad!==false)wkPad(0,0,w+.24,t+1.15,0);
 });
}

/* Shuttered or brucite-screened Shore-kin window with core/door svPane */
function skWindow(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?SK.WALL:o.t;
 const fMk=o.frameMk||'brucite',fCol=P(fMk);
 const shMk=o.shutMk||'verdigris',shCol=P(shMk);
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box(fMk,0,-.09,0,w+.26,.075,t+.13,fCol);
   for(const s of [-1,1])box(fMk,s*(w/2+.06),0,0,.09,h,t+.09,fCol);
   box(fMk,0,h+.015,0,w+.28,.11,t+.13,fCol);
   if(o.screen){
    skBruciteScreen(w-.08,h-.06,.03,0,{s:.34,mk:'brucite'});
   }else if(o.shut!==false){
    for(const s of [-1,1]){
     box(shMk,s*(w*.72+.09),.02,t/2+.085,w*.44,h-.04,.035,shCol);
    }
   }
  });
  svPane(0,0,-.03,0,w-.06,h-.02,{kind:o.kind||'lit',t:.025});
  windowAt(0,0,t/2,0,w,h,o.sill==null?.95:o.sill);
 });
}

/* Straight wall from (x0,z0) to (x1,z1) with Arch stone socle, optional catechu/verdigris dado, cut openings & skWallBlock */
function skWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);if(L<.08)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?SK.WALL:o.t;
 const soc=o.socle==null?SK.SOCLE:o.socle,dado=o.dado==null?0:o.dado;
 const socMk=o.socMk||'laterite',socCol=P(socMk);
 const dadoMk=o.dadoMk||'catechutrim',dadoCol=P(dadoMk);
 const mk=o.mk||'limewash',col=o.col==null?P(mk):o.col;
 const holes=(o.holes||[]).map(q=>{
  const wy=q.y==null?(q.door||q.gap?0:.96):q.y;
  const wh=q.h==null?(q.door?SK.DOOR_H:1.22):q.h;
  return Object.assign({},q,{a:q.at-q.w/2,b:q.at+q.w/2,wy,wh,y0:y0+wy,y1:y0+wy+wh});
 });
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  svNoWalk(()=>{
   const run=(a,b,ya,yb)=>{
    if(b-a<.02||yb-ya<.02)return;
    const yS=Math.min(yb,y0+soc);
    if(soc>0&&yS>ya)box(socMk,X((a+b)/2),ya,0,b-a,yS-ya,t+.04,socCol);
    const yD0=Math.max(ya,y0+soc),yD1=Math.min(yb,y0+soc+dado);
    if(dado>0&&yD1>yD0)box(dadoMk,X((a+b)/2),yD0,0,b-a,yD1-yD0,t+.02,dadoCol);
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
   if(q.gap||q.draw===false)continue;
   if(q.door)skDoor(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t},q));
   else skWindow(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,sill:q.wy},q));
  }
  if(o.block!==false&&h>=.82){
   const dSpans=holes.filter(q=>q.door||q.gap).map(q=>[Math.max(0,q.a),Math.min(L,q.b)]).sort((a,b)=>a[0]-b[0]);
   let cur=0;
   for(const sp of dSpans){
    if(sp[0]-cur>.16)skWallBlock(X((cur+sp[0])/2),y0,0,sp[0]-cur,h,t,0);
    cur=Math.max(cur,sp[1]);
   }
   if(L-cur>.16)skWallBlock(X((cur+L)/2),y0,0,L-cur,h,t,0);
  }
 });
}

/* Rectangular room enclosure [x0..x1, z0..z1] with proud corner piers (zero corner overlap) & KROOMLIGHT registration */
function skWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?SK.WALL:o.t,pw=t+.08,hp=pw/2+.01,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||'mangrove',postCol=P(postMk);
 const socMk=o.socMk||'laterite',socCol=P(socMk);
 if(o.room!==false&&skip==='')skRoom(x0,z0,x1,z1,y0,h,o);
 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.48,h*.22);
   box(socMk,cx,y0,cz,pw+.04,sh,pw+.04,socCol);
   box(postMk,cx,y0+sh,cz,pw,h-sh,pw,postCol);
  }
 });
 if(o.block!==false&&h>=.82){
  for(const cx of [x0,x1])for(const cz of [z0,z1])skWallBlock(cx,y0,cz,pw,h,pw,0);
 }
 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 if(skip.indexOf('s')<0)skWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shiftPos(H.s,x0+hp)}));
 if(skip.indexOf('n')<0)skWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shiftRev(H.n,x1-hp)}));
 if(skip.indexOf('e')<0)skWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shiftRev(H.e,z1-hp)}));
 if(skip.indexOf('w')<0)skWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shiftPos(H.w,z0+hp)}));
}

/* Six-sided Eternian hexagonal wall enclosure around (cx, cz) of circumradius R; face 1 (+z) is front! */
function skHexWallRing(cx,cz,R,y0,h,o){
 o=o||{};
 const t=o.t==null?SK.WALL:o.t,pw=t+.08,inset=pw*.62;
 const H=skHexPts(cx,cz,R),faces=o.faces||{};
 const postMk=o.postMk||'brucite',postCol=P(postMk);
 if(o.room!==false){
  const ap=R*SK.HEX_AP;
  skRoom(cx-R*.85,cz-ap*.92,cx+R*.85,cz+ap*.92,y0,h,o);
 }
 svNoWalk(()=>{
  for(let i=0;i<6;i++){
   cyl(postMk,H[i][0],y0,H[i][1],pw*.56,h,postCol,8);
  }
 });
 if(o.block!==false&&h>=.82){
  for(let i=0;i<6;i++)skWallBlock(H[i][0],y0,H[i][1],pw,h,pw,0);
 }
 for(let i=0;i<6;i++){
  const a=H[i],b=H[(i+1)%6];
  const dx=a[0]-b[0],dz=a[1]-b[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
  const x0=b[0]+ux*inset,z0=b[1]+uz*inset,x1=a[0]-ux*inset,z1=a[1]-uz*inset;
  const segL=Math.hypot(x1-x0,z1-z0);
  const fHoles=(faces[i]||[]).map(q=>Object.assign({},q,{at:segL/2+(q.x==null?0:q.x)}));
  skWall(x0,z0,x1,z1,y0,h,Object.assign({},o,{holes:fHoles}));
 }
}

/* Arched brucite-travertine & laterite colonnade segment from (x0,z0) to (x1,z1) */
function skArcade(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0),nBays=o.bays==null?Math.max(2,Math.round(L/3.2)):o.bays;
 const t=o.t==null?.42:o.t,pierW=o.pierW==null?.48:o.pierW,yaw=Math.atan2(z0-z1,x1-x0);
 const mk=o.mk||'brucite',col=P(mk),trimMk=o.trimMk||'laterite',trimCol=P(trimMk);
 const bayW=L/nBays,springY=y0+h*.64,archR=Math.max(.32,(bayW-pierW)*.5);
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  for(let i=0;i<=nBays;i++){
   const px=-L/2+i*bayW;
   svNoWalk(()=>{
    box(trimMk,px,y0+.01,0,pierW+.08,.32,t+.08,trimCol);
    box(mk,px,y0+.33,0,pierW,springY-y0-.33,t,col);
    box(trimMk,px,springY-.1,0,pierW+.08,.1,t+.08,trimCol);
   });
   if(o.block!==false&&i>0&&i<nBays&&h>=1.2)skWallBlock(px,y0,0,pierW,h*.85,t,0);
  }
  svNoWalk(()=>{
   const topY=y0+h-.16,crownY=Math.min(topY-.08,springY+archR*.74);
   box(mk,0,crownY,0,L+pierW,topY-crownY,t,col);
   for(let b=0;b<nBays;b++){
    const cx=-L/2+(b+.5)*bayW;
    for(const s of [-1,1])box(mk,cx+s*(archR*.66),springY,0,archR*.66,crownY-springY,t-.03,col);
    box(trimMk,cx,crownY-.11,0,.22,.24,t+.07,trimCol);
   }
   box(trimMk,0,topY,0,L+pierW+.14,.16,t+.12,trimCol);
  });
 });
}

/* ---------------------------------------------------------------- ROOFS: Rian tiered Costularia thatch, Hex cone & Gable */
function skOhiaFinial(x,y,z,yaw,sc){
 const s=sc==null?1:sc;
 W(x,y,z,yaw||0,()=>{
  svNoWalk(()=>{
   box('ohia',0,0,0,.13*s,.24*s,.18*s,P('ohia'));
   beam('ohia',[0,.18*s,0],[0,.76*s,.38*s],.09*s,P('ohia'));
   cone('ohia',0,.74*s,.38*s,.07*s,.32*s,P('ohia'),6);
   ring('verdigris',0,.44*s,.18*s,.07*s,.022*s,P('verdigris'),0,PI/3,0,8);
  });
 });
}

/* Rian 2-to-3 tier Costularia/uluhe thatch roof with 100% solid ceiling & soffits + carved ohia gable horns */
function skTieredRoof(cx,y0,cz,w,d,tiers,o){
 o=o||{};
 const nT=Math.max(1,tiers==null?2:tiers),mk=o.mk||'thatch',col=P(mk);
 const soffitMk=o.soffitMk||'paperbark',soffitCol=P(soffitMk);
 const trimMk=o.trimMk||'ohia',trimCol=P(trimMk);
 const neckMk=o.neckMk||'araucaria',neckCol=P(neckMk);
 const over=o.over==null?.68:o.over,stepIn=o.stepIn==null?.75:o.stepIn;
 const tierRise=o.tierRise==null?Math.max(.9,Math.min(w,d)*.16):o.tierRise;
 const neckH=o.neckH==null?.36:o.neckH;

 if(o.ceiling!==false){
  skCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.12),Math.max(.4,d-.12),{mk:soffitMk,beamMk:'araucaria'});
 }
 let curY=y0+.12,curW=w+over*2,curD=d+over*2;
 W(cx,0,cz,o.yaw||0,()=>{
  svNoWalk(()=>{
   for(let t=0;t<nT;t++){
    const hw=curW/2,hd=curD/2,rH=tierRise*(t===nT-1?1.18:1);
    box(soffitMk,0,curY,0,curW-.06,.08,curD-.06,soffitCol);
    for(const sz of [-hd,hd])box(trimMk,0,curY+.015,sz,curW+.04,.08,.055,trimCol);
    for(const sx of [-hw+.04,hw-.04])box(trimMk,sx,curY+.015,0,.055,.08,curD-.12,trimCol);
    const yB=curY+.08,yT=yB+rH;
    const alongZ=o.gableAxis==='z'||(o.gableAxis!=='x'&&curD>curW);
    if(t<nT-1){
     const topFrac=stepIn*.82,tw=hw*topFrac,td=hd*topFrac;
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     const A2=[-tw,yT,-td],B2=[tw,yT,-td],C2=[tw,yT,td],D2=[-tw,yT,td];
     poly(mk,[D,C,C2,D2],col);poly(mk,[C,B,B2,C2],col);
     poly(mk,[B,A,A2,B2],col);poly(mk,[A,D,D2,A2],col);
     for(const sx of [-1,1])for(const sz of [-1,1])skOhiaFinial(sx*hw,yB+.02,sz*hd,Math.atan2(sx,sz),.52);
     const nextW=curW*stepIn,nextD=curD*stepIn;
     box(neckMk,0,yT-.16,0,nextW-.28,neckH+.16,nextD-.28,neckCol);
     box('verdigris',0,yT+neckH-.07,0,nextW-.2,.07,nextD-.2,P('verdigris'));
     curY=yT+neckH;curW=nextW;curD=nextD;
    }else if(alongZ){
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     const PN=[0,yT,-hd+.04],PS=[0,yT,hd-.04];
     poly(mk,[A,D,PS,PN],col);poly(mk,[C,B,PN,PS],col);
     poly('pandanus',[[-hw+.14,yB,hd-.08],[hw-.14,yB,hd-.08],[0,yT-.06,hd-.08]],P('pandanus'));
     poly('pandanus',[[hw-.14,yB,-hd+.08],[-hw+.14,yB,-hd+.08],[0,yT-.06,-hd+.08]],P('pandanus'));
     beam(trimMk,[0,yT+.05,-hd],[0,yT+.05,hd],.085,trimCol,false);
     for(const sz of [-1,1]){
      const zz=sz*(hd+.02);
      beam(trimMk,[-hw,yB+.04,zz],[0,yT+.07,zz],.08,trimCol,false);
      beam(trimMk,[hw,yB+.04,zz],[0,yT+.07,zz],.08,trimCol,false);
      skOhiaFinial(0,yT+.08,zz,sz>0?0:PI,.92);
     }
     curY=yT;
    }else{
     const A=[-hw,yB,-hd],B=[hw,yB,-hd],C=[hw,yB,hd],D=[-hw,yB,hd];
     const PW=[-hw+.04,yT,0],PE=[hw-.04,yT,0];
     poly(mk,[D,C,PE,PW],col);poly(mk,[B,A,PW,PE],col);
     poly('pandanus',[[hw-.08,yB,hd-.14],[hw-.08,yB,-hd+.14],[hw-.08,yT-.06,0]],P('pandanus'));
     poly('pandanus',[[-hw+.08,yB,-hd+.14],[-hw+.08,yB,hd-.14],[-hw+.08,yT-.06,0]],P('pandanus'));
     beam(trimMk,[-hw,yT+.05,0],[hw,yT+.05,0],.085,trimCol,false);
     for(const sx of [-1,1]){
      const xx=sx*(hw+.02);
      beam(trimMk,[xx,yB+.04,-hd],[xx,yT+.07,0],.08,trimCol,false);
      beam(trimMk,[xx,yB+.04,hd],[xx,yT+.07,0],.08,trimCol,false);
      skOhiaFinial(xx,yT+.08,0,sx>0?PI/2:-PI/2,.92);
     }
     curY=yT;
    }
   }
  });
 });
 return curY+.36;
}

/* Six-slope hexagonal Costularia thatch or shell-lime roof with solid hexagonal ceiling slab & ohia/paktong finial */
function skHexRoof(cx,y0,cz,R,rise,o){
 o=o||{};
 const mk=o.mk||'thatch',col=P(mk),over=o.over==null?.58:o.over;
 const Re=R+over,H=skHexPts(0,0,Re);
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   if(o.ceiling!==false){
    prism('paperbark',skHexPts(0,0,Math.max(.5,R-.06)),y0+.02,y0+.1,P('paperbark'));
   }
   prism('araucaria',skHexPts(0,0,Re-.04),y0+.11,y0+.19,P('araucaria'));
   const yB=y0+.19,yT=yB+rise,ohCol=P('ohia');
   for(let i=0;i<6;i++){
    const a=H[i],b=H[(i+1)%6];
    poly(mk,[[b[0],yB,b[1]],[a[0],yB,a[1]],[0,yT,0]],col);
    beam('ohia',[a[0],yB+.035,a[1]],[a[0]*.14,lerp(yB+.035,yT+.04,.86),a[1]*.14],.08,ohCol);
   }
   const fMk=o.finialMk||'ohia';
   cyl(fMk,0,yT-.04,0,.22,.16,P(fMk),8);
   cone(fMk,0,yT+.12,0,.14,.58,P(fMk),6);
  });
 });
 return y0+.19+rise+.7;
}

/* Simple gable roof (salvage planks, paperbark or thatch) with solid ceiling slab & optional Eternian stepped timber crown */
function skGableRoof(cx,y0,cz,w,d,rise,o){
 o=o||{};
 const mk=o.mk||'thatch',col=P(mk),wallMk=o.wallMk||'salvage',wallCol=P(wallMk);
 const over=o.over==null?.48:o.over,W0=w+over*2,D0=d+over*2,hw=W0/2,hd=D0/2;
 const alongZ=o.alongZ===true;
 if(o.ceiling!==false){
  skCeilingSlab(cx,y0+.02,cz,Math.max(.4,w-.1),Math.max(.4,d-.1),{mk:'paperbark',beamMk:'mangrove'});
 }
 W(cx,0,cz,o.yaw||0,()=>{
  svNoWalk(()=>{
   box('paperbark',0,y0+.11,0,W0-.06,.08,D0-.06,P('paperbark'));
   const yB=y0+.19,yT=yB+rise;
   if(alongZ){
    plane4(mk,[-hw,yB,hd],[0,yT,hd],[-hw,yB,-hd],.1,col);
    plane4(mk,[0,yT,hd],[hw,yB,hd],[0,yT,-hd],.1,col);
    poly(wallMk,[[-w/2+.04,y0+.11,d/2-.04],[w/2-.04,y0+.11,d/2-.04],[0,yT-.08,d/2-.04]],wallCol);
    poly(wallMk,[[w/2-.04,y0+.11,-d/2+.04],[-w/2+.04,y0+.11,-d/2+.04],[0,yT-.08,-d/2+.04]],wallCol);
    beam('ohia',[0,yT+.06,-hd],[0,yT+.06,hd],.09,P('ohia'));
    if(o.decoCrown){
     for(let i=0;i<3;i++)box('ohia',0,yT+.12+i*.18,d/2+.06,(1.6-i*.42),.18,.18,P('ohia'));
    }
   }else{
    plane4(mk,[-hw,yB,hd],[hw,yB,hd],[-hw,yT,0],.1,col);
    plane4(mk,[hw,yB,-hd],[-hw,yB,-hd],[hw,yT,0],.1,col);
    poly(wallMk,[[w/2-.04,y0+.11,d/2-.04],[w/2-.04,y0+.11,-d/2+.04],[w/2-.04,yT-.08,0]],wallCol);
    poly(wallMk,[[-w/2+.04,y0+.11,-d/2+.04],[-w/2+.04,y0+.11,d/2-.04],[-w/2+.04,yT-.08,0]],wallCol);
    beam('ohia',[-hw,yT+.06,0],[hw,yT+.06,0],.09,P('ohia'));
   }
  });
 });
 return y0+.19+rise+.4;
}

/* ---------------------------------------------------------------- HUERU-KURAN & FLEET-BORN STRANDS: serpentinite ring, kaen crown & wind gear */
function skKaenCrown(cx,y0,cz,r,h,nFins,o){
 o=o||{};
 const nf=nFins==null?4:nFins;
 W(cx,y0,cz,0,()=>{
  svNoWalk(()=>{
   cyl('laterite',0,0,0,r*1.2,.1,P('laterite'),16);
   lathe('terracotta',0,0,[[r*.96,.1],[r*.88,.1+h*.38],[r*1.15,.1+h*.78],[r*1.06,.1+h]],16,P('terracotta'));
   /* Interior dark soot baffle disk so upward interior ceiling raycasts never leak sky through chimney throat */
   cyl('iron',0,.1+h*.45,0,r*.9,.06,P('iron'),14);
   ring('verdigris',0,.1+h*.62,0,r*1.08,.05,P('verdigris'),0,0,0,16);
   for(let i=0;i<nf;i++){
    const a=i*TAU/nf;
    W(Math.cos(a)*r*1.11,.1+h*.72,Math.sin(a)*r*1.11,PI/2-a,()=>{
     box('terracotta',0,0,0,.1,.36,.22,P('terracotta'));
     box('verdigris',0,.36,.03,.08,.15,.16,P('verdigris'));
    });
   }
  });
  if(o.smoke!==false)smokeAt(0,.16+h,0,{r:r*.46,kind:o.smokeKind||'chimney'});
  if(o.halo!==false)haloAt(0,.1+h*.38,0,0xff9840,!!o.bigHalo);
 });
 return y0+.1+h+.44;
}

/* Battered white-veined green serpentinite & buff-rind dunite ring-wall lodge with steamed mangrove-knee & drift whale-rib
   vault, Melaleuca paperbark interior liner ({inward: true}), coastal turf dome, and flame-rimmed terracotta crown. */
function skSerpentineLodgeShell(cx,cz,y0,rOut,wallT,wallH,domeRise,o){
 o=o||{};
 const doors=o.doors||[{yaw:0,w:1.45,h:2.12}],wins=o.windows||[];
 const nRibs=o.ribs==null?10:o.ribs,rSmoke=o.rSmoke==null?Math.max(.48,rOut*.15):o.rSmoke;
 const rIn=Math.max(1.4,rOut-wallT),courses=Math.max(4,Math.round(wallH/.6));
 skRoom(cx-rIn*.85,cz-rIn*.85,cx+rIn*.85,cz+rIn*.85,y0,wallH+domeRise*.75,{vault:true});
 W(cx,0,cz,0,()=>{
  const octPts=[];
  for(let i=0;i<12;i++){const a=i*TAU/12;octPts.push([(rIn+.04)*Math.cos(a),(rIn+.04)*Math.sin(a)]);}
  skFloorPoly(octPts,y0+.08,'paving',null,{th:.08});

  const yawSec=yw=>{let a=PI/2-(yw||0);while(a<0)a+=TAU;while(a>=TAU)a-=TAU;return a;};
  svNoWalk(()=>{
   for(let k=0;k<courses;k++){
    const t0=k/courses,t1=(k+1)/courses,ya=y0+wallH*t0,yb=y0+wallH*t1;
    const ro=skRigMath.ringRadius(rOut,rOut-.22,t0);
    const gaps=[];
    for(const d of doors){
     if(yb>y0+.01&&ya<y0+d.h+.55){
      gaps.push({a:yawSec(d.yaw),half:Math.asin(Math.min(.88,(d.w/2+.22)/((ro+rIn)*.5)))});
     }
    }
    for(const w of wins){
     if(yb>y0+w.y-.08&&ya<y0+w.y+w.h+.16){
      gaps.push({a:yawSec(w.yaw),half:Math.asin(Math.min(.84,(w.w/2+.16)/((ro+rIn)*.5)))});
     }
    }
    const mk=k%2===0?'serpentinite':'dunite',col=P(mk);
    if(!gaps.length){
     sector(mk,0,0,rIn,ro,0,TAU,ya,yb,col,28);
    }else{
     const keep=[];
     const N=48;
     for(let s=0;s<N;s++){
      const am=(s+.5)*TAU/N;
      const blocked=gaps.some(g=>{let da=Math.abs(am-g.a);if(da>PI)da=TAU-da;return da<g.half;});
      if(!blocked){
       if(keep.length&&keep[keep.length-1][1]===s)keep[keep.length-1][1]=s+1;
       else keep.push([s,s+1]);
      }
     }
     for(const sp of keep){
      sector(mk,0,0,rIn,ro,sp[0]*TAU/N,sp[1]*TAU/N,ya,yb,col,Math.max(2,sp[1]-sp[0]));
     }
    }
   }
   /* Mangrove wall-plate collar + steamed mangrove-knee interior ribs + exterior drift whale-rib storm clamps */
   const yPlate=y0+wallH;
   sector('mangrove',0,0,rIn-.04,rOut-.2,0,TAU,yPlate,yPlate+.12,P('mangrove'),28);
   const ySpring=yPlate+.12,yCrown=ySpring+domeRise,rSpring=(rIn+rOut)*.5-.1;
   for(let i=0;i<nRibs;i++){
    const a=i*TAU/nRibs+.2,cs=Math.cos(a),sn=Math.sin(a);
    tube('mangrove',t=>{
     const p=skRigMath.ribVaultArc(rIn-.08,ySpring,rSmoke+.04,yCrown-.06,t);
     return [cs*p[0],p[1],sn*p[0]];
    },t=>[.08-.02*t,.12-.03*t],10,6,P('mangrove'),{caps:true});
    if(i%2===0){
     tube('whalebone',t=>{
      const p=skRigMath.ribVaultArc(rOut-.18,ySpring+.04,rSmoke+.16,yCrown+.06,t);
      return [cs*(p[0]+.09),p[1]+.07,sn*(p[0]+.09)];
     },t=>[.06-.018*t,.09-.02*t],10,6,P('whalebone'),{caps:true});
    }
   }
   for(const f of [.36,.7]){
    const p=skRigMath.ribVaultArc(rIn-.06,ySpring,rSmoke+.04,yCrown-.06,f);
    ring('mangrove',0,p[1],0,p[0],.045,P('mangrove'),0,0,0,20);
   }
   /* Exterior paperbark + coastal turf dome bands & solid {inward: true} paperbark interior vault ceiling */
   const band=(mk,f0,f1,dr)=>{
    const prof=[];
    for(let j=0;j<=4;j++){
     const f=lerp(f0,f1,j/4),p=skRigMath.ribVaultArc(rSpring+.12,ySpring,rSmoke+.1,yCrown,f);
     prof.push([p[0]+dr,p[1]]);
    }
    lathe(mk,0,0,prof,24,P(mk));
   };
   band('paperbark',0,.34,.025);
   band('turf',.34,1.0,.02);
   const inProf=[];
   for(let j=0;j<=6;j++){
    const f=j/6,p=skRigMath.ribVaultArc(rSpring+.04,ySpring-.03,rSmoke+.06,yCrown-.04,f);
    inProf.push([p[0],p[1]]);
   }
   lathe('paperbark',0,0,inProf,24,P('paperbark'),{inward:true});
  });

  /* Ring-wall collision sectors leaving doorways passable */
  const nBlk=16;
  for(let i=0;i<nBlk;i++){
   const yawB=i*TAU/nBlk;
   const hitDoor=doors.some(d=>{let dy=Math.abs(yawB-(d.yaw||0));if(dy>PI)dy=TAU-dy;return dy<.42;});
   if(!hitDoor){
    const rM=(rIn+rOut)*.5;
    skWallBlock(Math.sin(yawB)*rM,y0,Math.cos(yawB)*rM,rM*TAU/nBlk*.92,wallH,wallT*.85,yawB);
   }
  }
  for(const d of doors){
   const rFace=(rIn+rOut)*.5;
   skDoor(Math.sin(d.yaw||0)*rFace,y0+.08,Math.cos(d.yaw||0)*rFace,d.yaw||0,d.w,d.h,Object.assign({t:wallT*.65},d));
  }
  for(const w of wins){
   const rFace=(rIn+rOut)*.5;
   skWindow(Math.sin(w.yaw||0)*rFace,y0+w.y,Math.cos(w.yaw||0)*rFace,w.yaw||0,w.w,w.h,{t:wallT*.5,screen:w.screen});
  }
  skKaenCrown(0,y0+wallH+.12+domeRise+.04,0,rSmoke+.08,o.crownH==null?.82:o.crownH,o.crownFins==null?4:o.crownFins,{smoke:o.smoke!==false});
 });
 return y0+wallH+domeRise+1.35;
}

/* Wind-rigged oiled sharkskin, ray-hide or mangrove-catechu awning over [x0..x1, z0..z1] with 0.0 corner pin drift */
function skSharkskinAwning(x0,z0,x1,z1,yFoot,yTop,o){
 o=o||{};
 const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,hw=w/2,hd=d/2;
 const sag=o.sag==null?.28:o.sag,amp=o.amp==null?.22:o.amp,mk=o.mk||'sharkhide';
 W(cx,0,cz,0,()=>{
  svNoWalk(()=>{
   if(o.posts!==false){
    for(const sx of [-hw,hw])for(const sz of [-hd,hd]){
     cyl('laterite',sx,yFoot,sz,.13,.15,P('laterite'),10);
     cyl('mangrove',sx,yFoot+.15,sz,.075,yTop-yFoot-.15,P('mangrove'),10);
     ring('paktong',sx,yTop,sz,.075,.02,P('paktong'),0,0,0,10);
    }
   }
   sagRope('rope',[-hw,yTop,-hd],[hw,yTop,-hd],sag*.28,.014,P('rope'),8);
   sagRope('rope',[-hw,yTop,hd],[hw,yTop,hd],sag*.28,.014,P('rope'),8);
   sagRope('rope',[-hw,yTop,-hd],[-hw,yTop,hd],sag*.28,.014,P('rope'),8);
   sagRope('rope',[hw,yTop,-hd],[hw,yTop,hd],sag*.28,.014,P('rope'),8);
   withCloth((lp,out)=>{
    const u=clamp((lp.x+hw)/Math.max(.1,w),0,1),v=clamp((lp.z+hd)/Math.max(.1,d),0,1);
    const pw=skRigMath.cornerPin(u,v)*amp;
    out.set(pw*.18,pw,pw*.22);
   },()=>{
    psurf(mk,(u,v)=>{
     const x=(u-.5)*w,z=(v-.5)*d;
     const cat=4*u*(1-u)*.55+4*v*(1-v)*.45;
     return [x,yTop-sag*cat+.025*Math.sin(u*3*PI)*Math.sin(PI*v),z];
    },12,10,P(mk));
   });
  });
 });
}

/* Wind-rigged drying kelp rack, pumice-float fishing net, or Fleet-born catechu / sea-byssus banner */
function skWindRack(x,yFoot,z,yaw,span,h,o){
 o=o||{};
 const mk=o.mk||'netting',nPanels=o.panels==null?3:o.panels,drop=o.drop==null?h-.42:o.drop;
 W(x,yFoot,z,yaw||0,()=>{
  svNoWalk(()=>{
   for(const sx of [-span/2,span/2]){
    box('pillowbasalt',sx,0,0,.2,.14,.2,P('pillowbasalt'));
    cyl('mangrove',sx,.14,0,.065,h-.14,P('mangrove'),8);
   }
   beam('araucaria',[-span/2-.12,h,0],[span/2+.12,h,0],.06,P('araucaria'),true,8);
   if(o.pumiceFloats!==false&&mk==='netting'){
    for(let k=0;k<=nPanels;k++){
     const fx=-span/2+.14+k*(span-.28)/nPanels;
     ellip('pumice',fx,h+.05,0,.08,.055,.07,P('pumice'),0,8);
    }
   }
   const pw0=(span-.24)/nPanels;
   for(let i=0;i<nPanels;i++){
    const px=-span/2+.12+pw0*(i+.5),wPan=pw0*.86,yTop=h-.07;
    withCloth((lp,out)=>{
     const v=clamp((yTop-lp.y)/Math.max(.1,drop),0,1);
     const pw=skRigMath.hangPin(v)*(o.amp==null?.26:o.amp);
     out.set(pw*.24,0,pw);
    },()=>{
     psurf(mk,(u,v)=>[px+(u-.5)*wPan,yTop-v*drop,.02*Math.sin(PI*u)*v],4,10,P(mk));
    });
   }
  });
 });
}

/* Wind-rigged nacreous oyster & conch shell chimes hung from an ohia crossbar */
function skShellChimes(x,yTop,z,yaw,span,drop,nStrands){
 const n=nStrands==null?5:nStrands;
 W(x,yTop,z,yaw||0,()=>{
  svNoWalk(()=>{
   beam('ohia',[-span/2-.08,0,0],[span/2+.08,0,0],.05,P('ohia'),true,8);
   for(let i=0;i<n;i++){
    const xx=lerp(-span/2+.08,span/2-.08,n===1?.5:i/(n-1));
    const len=drop*(.78+.22*((i%3)/2));
    withCloth((lp,out)=>{
     const v=clamp(-lp.y/Math.max(.1,len),0,1);
     const pw=skRigMath.chimePin(v)*.22;
     out.set(pw*.3,0,pw);
    },()=>{
     psurf('shellchime',(u,v)=>[xx+(u-.5)*(.09+.05*Math.sin(v*4*PI)),-v*len,.015*Math.sin(PI*u)*v],3,8,P('shellchime'));
    });
   }
  });
 });
}
