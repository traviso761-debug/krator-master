// prefix: tb
/* ================================================================= URBAN TABISTI STRUCTURAL, BIOCLIMATIC & GLAZED-MASONRY TOOLKIT
   Implements PLAN.md Sections 3 & 4 across Sfenops, Middle Tabisti, and Liikofi:
   1. All decorative courses, socles, pilasters, relief bands, ganch panels, columns, stairs and pool curbs run inside svNoWalk(() => ...)
      so KWALKBOX never registers fake sill, socle or unbridged fountain curb floors.
   2. Full-height wall blockers (dy >= 0.85 m) are registered explicitly via tbWallBlock, leaving clean doorway gaps bridged
      by wkPad thresholds and operable core/door leaves.
   3. Adjacent material faces step by >= 0.028 m (2.8 cm) so world-space coplanar triangle overlap is strictly zero.
   4. Tracks per-building bioclimatic telemetry on CURREC.bio (ventedPlinths, openLoggias, ayvans, windTowers, claustra,
      oriels, kundalCeilings, shadirvans, ganchSheltered, ganchExposed) verified by bioclimaticAudit(). */

const tbTmpM=new THREE.Matrix4(),tbTmpS=new THREE.Vector3();

function tbBio(){
 if(!CURREC)return {ventedPlinths:0,openLoggias:0,ayvans:0,windTowers:0,claustra:0,oriels:0,kundalCeilings:0,shadirvans:0,ganchSheltered:0,ganchExposed:0};
 return CURREC.bio||(CURREC.bio={ventedPlinths:0,openLoggias:0,ayvans:0,windTowers:0,claustra:0,oriels:0,kundalCeilings:0,shadirvans:0,ganchSheltered:0,ganchExposed:0});
}

function tbNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}

function tbBelowGrade(fn){const keepSB=SB;SB=null;try{tbNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

function tbTarget(x,y,z,name,indoor){
 if(PLACE_DRY||!CURREC)return;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 (CURREC.targets||(CURREC.targets=[])).push({x:p.x,y:p.y,z:p.z,name:name||'floor',indoor:indoor!==false});
}

function tbRoom(x0,z0,x1,z1,y0,h,o){
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

function tbFurnList(list){
 for(const e of list)FURNISH(e[0],e[1],e[2]+.008,e[3],e[4]==null?0:e[4],e[5]);
}

function tbWallBlock(lx,ly,lz,w,h,d,ry){
 if(PLACE_DRY||typeof KWALK==='undefined'||typeof KWALKBOX==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const bh=Math.max(.84,h);
 tbTmpM.copy(CM).multiply(TF(lx,ly+bh/2,lz,ry==null?0:ry));
 tbTmpM.scale(tbTmpS.set(Math.max(.14,w),bh,Math.max(.14,d)));
 KWALKBOX.add(KWALK,tbTmpM.elements,{tag:'wall:'+CURKEY});
}

function tbFloorSlab(cx,yTop,cz,w,d,o){
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

function tbFloorDisc(cx,cz,r,yTop,mk,col,o){
 o=o||{};
 const seg=o.seg==null?16:o.seg,th=o.th==null?.16:o.th,pts=[];
 for(let i=0;i<seg;i++){const a=i/seg*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 svNoWalk(()=>prism(mk||'floor',pts,yTop-th,yTop,col==null?P(mk||'floor'):col));
 if(o.walk!==false)svFloor(pts,yTop);
 return pts;
}

/* Plate A3-A4: Polychrome kundal / Liikofi abyss-lac coffered ceiling plenum trapping rising warm air above head height.
   Primary ribs occupy [yCeil-0.052 .. yCeil-0.004], cross ribs [yCeil-0.102 .. yCeil-0.056], bosses [yCeil-0.032 .. yCeil-0.004]
   -> strictly zero coplanar faces! */
function tbKundalCeiling(cx,yCeil,cz,w,d,o){
 o=o||{};
 if(w<.35||d<.35)return;
 const mk=o.mk||'kundal',col=o.col==null?P(mk):o.col;
 const ribMk=o.ribMk||'lacquer',ribCol=o.ribCol==null?P(ribMk):o.ribCol;
 const crossMk=o.crossMk||'ustun',crossCol=o.crossCol==null?P(crossMk):o.crossCol;
 tbBio().kundalCeilings++;
 svNoWalk(()=>{
  box(mk,cx,yCeil,cz,w,.09,d,col);
  const nx=Math.max(2,Math.min(5,Math.round(w/2.8))),nz=Math.max(2,Math.min(5,Math.round(d/2.8)));
  for(let i=1;i<nx;i++){
   const xx=cx-w/2+w*i/nx;
   box(ribMk,xx,yCeil-.052,cz,.095,.048,d-.18,ribCol);
  }
  for(let j=1;j<nz;j++){
   const zz=cz-d/2+d*j/nz;
   box(crossMk,cx,yCeil-.102,zz,w-.18,.046,.095,crossCol);
  }
  if(o.bosses!==false&&w>=3.2&&d>=3.2){
   for(let i=0;i<nx;i++){
    const bx=cx-w/2+w*(i+.5)/nx;
    for(let j=0;j<nz;j++){
     const bz=cz-d/2+d*(j+.5)/nz;
     cyl('gilt',bx,yCeil-.032,bz,.12,.028,P('gilt'),8);
    }
   }
  }
 });
}

function tbStripWalk(a,b,w){
 if(!svWalkOn())return;
 const A=svWP(a[0],a[1],a[2]),B=svWP(b[0],b[1],b[2]),tag='stair:'+CURKEY;
 const dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);
 if(L<1e-4)return;
 const ux=dx/L,uz=dz/L,px=uz,pz=-ux;
 KWALK.strip({a:A,b:B,w,name:'stair',tag});
 KWALK.poly({pts:[[-.25,-w/2],[.6,-w/2],[.6,w/2],[-.25,w/2]].map(q=>svWP(b[0]+ux*q[0]+px*q[1],b[1],b[2]+uz*q[0]+pz*q[1])),name:'landing',tag});
}

/* Exterior masonry or timber stair climbing from (x0,y0,z0) to (x1,y1,z1) with kashi-coped rosebrick cheeks & walkable strip. */
function tbStair(x0,y0,z0,x1,y1,z1,w,o){
 o=o||{};
 const rise=y1-y0,dx=x1-x0,dz=z1-z0,run=Math.hypot(dx,dz);
 if(rise<.05||run<.2)return;
 const yaw=Math.atan2(dx,dz),ns=Math.max(2,Math.ceil(rise/TB.RISER));
 const mk=o.mk||'ashlar',col=o.col==null?P(mk):o.col;
 const sideMk=o.sideMk||'rosebrick',sideCol=o.sideCol==null?P(sideMk):o.sideCol;
 tbNoCut(()=>{
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
      beam('ustun',[sx,y0+.12,-run/2],[sx,y1-.02,run/2],.08,P('ustun'));
      beam('ustun',[sx,y0+.88,-run/2],[sx,y1+.88,run/2],.065,P('ustun'));
      for(const f of [.04,.5,.96]){
       const zz=lerp(-run/2,run/2,f),yy=lerp(y0,y1,f);
       box('ustun',sx,yy,zz,.07,.88,.07,P('ustun'));
      }
     }
    }else if(o.cheek!==false){
     for(const s of [-1,1]){
      const sx=s*(w/2+.14);
      for(let k=0;k<3;k++){
       const fk0=k/3,fk1=(k+1)/3,zk=lerp(-run/2,run/2,(fk0+fk1)/2),yk=y0+rise*fk1+.24;
       const cb=o.openUnder?y0+rise*fk0:y0,ch=o.openUnder?rise*.33+.32:yk-y0;
       box(sideMk,sx,cb,zk,.22,ch,run/3+.01,sideCol);
       box('kashi',sx,cb+ch,zk,.26,.055,run/3+.035,P('kashi'));
      }
     }
    }
   });
  });
  tbStripWalk([x0,y0,z0],[x1,y1,z1],Math.max(.95,w-.2));
  const ux=dx/run,uz=dz/run;
  const pw=Math.abs(uz)>=Math.abs(ux)?Math.max(1.0,w-.16):1.0;
  const pd=Math.abs(uz)>=Math.abs(ux)?1.0:Math.max(1.0,w-.16);
  wkPad(x0-ux*.36,z0-uz*.36,pw,pd,y0);
  wkPad(x1+ux*.36,z1+uz*.36,pw,pd,y1);
 });
}

/* Interior open-tread ustun stair climbing from (x, y0, z) toward yaw up to y1, returning {x0,x1,z0,z1} slab hole bounds. */
function tbInteriorStair(x,z,y0,y1,yaw,o){
 o=o||{};
 const rise=y1-y0;
 if(!(rise>.05))return null;
 const w=o.w==null?1.18:o.w,ux=Math.sin(yaw==null?0:yaw),uz=Math.cos(yaw==null?0:yaw),px=uz,pz=-ux;
 const rmax=o.riser==null?.19:o.riser,n=Math.max(2,Math.ceil(rise/rmax-1e-9)),riser=rise/n;
 const going=o.going==null?.24:o.going,run=(n-1)*going;
 const mk=o.mk||'ustun',col=o.col==null?P(mk):o.col,smk=o.smk||'cedar',scol=o.scol==null?P(smk):o.scol;
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
 tbStripWalk([f[0],y0,f[1]],[t[0],y1,t[1]],Math.max(.92,w-.14));
 wkPad(f[0]-ux*.3,f[1]-uz*.3,Math.max(1.0,w),Math.max(1.0,w),y0);
 wkPad(t[0]+ux*.4,t[1]+uz*.4,Math.max(1.0,w),Math.max(1.0,w),y1);
 const C=[at(0,-w/2-.06),at(0,w/2+.06),at(run,-w/2-.06),at(run,w/2+.06)];
 return {
  x0:Math.min(...C.map(c=>c[0])),x1:Math.max(...C.map(c=>c[0])),
  z0:Math.min(...C.map(c=>c[1])),z1:Math.max(...C.map(c=>c[1])),
  foot:f,top:t,run,n,riser
 };
}

/* Bioclimatic Rule 1 (Plate B5): Raised flood plinth pierced by terracotta & wrought-iron undercroft cross-ventilation grilles,
   paved in marble mosaic tiles, with front stair access. */
function tbPorticoPlinth(w,d,h,o){
 o=o||{};
 const socMk=o.socMk||'ashlar',socCol=P(socMk);
 const bodyMk=o.bodyMk||'buffbrick',bodyCol=P(bodyMk);
 const topMk=o.topMk||'paving',topCol=P(topMk);
 const hSoc=Math.min(.24,h*.38),hBody=Math.max(.1,h-hSoc-.07);
 tbBio().ventedPlinths++;
 tbBelowGrade(()=>{
  box(socMk,0,-1.2,0,w+.66,1.18,d+.66,socCol);
 });
 tbNoCut(()=>svNoWalk(()=>{
  box(socMk,0,0,0,w+.44,hSoc,d+.44,socCol);
  box(bodyMk,0,hSoc,0,w+.22,hBody,d+.22,bodyCol);
  box(topMk,0,h-.07,0,w,.07,d,topCol);
  /* Undercroft cross-ventilation grilles along N/S and E/W plinth faces (proud by +3.5 cm) */
  if(h>=.42){
   const gy=hSoc+hBody*.2,gh=Math.max(.12,hBody*.6);
   const nx=Math.max(2,Math.floor(w/4.2)),nz=Math.max(2,Math.floor(d/4.2));
   for(let i=0;i<nx;i++){
    const gx=lerp(-w*.36,w*.36,nx===1?.5:i/(nx-1));
    for(const sz of [-(d/2+.145),d/2+.145]){
     if(sz>0&&o.steps!==false&&Math.abs(gx-(o.stepX==null?0:o.stepX))<2.2)continue;
     box('terracotta',gx,gy,sz,.74,gh,.05,P('terracotta'));
     box('iron',gx,gy+.02,sz+(sz>0?.032:-.032),.62,Math.max(.08,gh-.04),.025,P('iron'));
    }
   }
   for(let j=0;j<nz;j++){
    const gz=lerp(-d*.36,d*.36,nz===1?.5:j/(nz-1));
    for(const sx of [-(w/2+.145),w/2+.145]){
     box('terracotta',sx,gy,gz,.05,gh,.74,P('terracotta'));
     box('iron',sx+(sx>0?.032:-.032),gy+.02,gz,.025,Math.max(.08,gh-.04),.62,P('iron'));
    }
   }
  }
 }));
 if(o.walk!==false)wkPad(0,0,w,d,h);
 if(o.steps!==false){
  const sw=o.stepW==null?2.9:o.stepW,sx=o.stepX==null?0:o.stepX;
  const run=o.stepRun==null?Math.max(1.15,h*2.1):o.stepRun;
  const zTop=d/2+.06,zFoot=d/2+.26+run;
  tbStair(sx,0,zFoot,sx,h,zTop,sw,{mk:socMk,sideMk:'rosebrick',cheek:o.cheek});
 }
 return h;
}

/* Plate A2: Bukhara/Khiva tapered carved-cedar ustun column with 3-tier polychrome stalactite muqarnas capital. */
function tbUstunColumn(x,y0,z,h,o){
 o=o||{};
 const r=o.r==null?.14:o.r,mk=o.mk||'ustun',col=P(mk);
 const baseH=Math.min(.26,h*.1),capH=Math.min(.46,h*.18),shH=Math.max(.4,h-baseH-capH);
 svNoWalk(()=>{
  /* Carved octagonal alabaster cushion base */
  cyl('alabaster',x,y0+.008,z,r*1.58,baseH*.55,P('alabaster'),8);
  cyl('kashi',x,y0+.008+baseH*.55,z,r*1.28,baseH*.45,P('kashi'),8);
  /* Spirally fluted / tapered cedar shaft + gilt neck ring */
  cyl(mk,x,y0+baseH,z,r*1.08,shH-.05,col,10,r*.88);
  cyl('gilt',x,y0+baseH+shH-.05,z,r*.98,.05,P('gilt'),10);
  /* 3-tier polychrome muqarnas stalactite capital + wide bolster abacus */
  const yc=y0+baseH+shH;
  cyl('kashi',x,yc,z,r*1.32,capH*.32,P('kashi'),8,r*1.02);
  cyl('kundal',x,yc+capH*.32,z,r*1.66,capH*.34,P('kundal'),8,r*1.32);
  box('carvedwood',x,yc+capH*.66,z,r*3.6,capH*.34,r*2.2,P('carvedwood'),o.yaw==null?0:o.yaw);
 });
 if(o.block&&h>=1.2)tbWallBlock(x,y0,z,r*2.4,h,r*2.4,0);
}

/* Plate A5: Patinated verdigris-bronze imbricated oak-leaf column with gilded acorn rings and cast acanthus base. */
function tbVerdigrisColumn(x,y0,z,h,o){
 o=o||{};
 const r=o.r==null?.17:o.r;
 const baseH=Math.min(.32,h*.11),capH=Math.min(.42,h*.15),shH=Math.max(.5,h-baseH-capH);
 svNoWalk(()=>{
  box('alabaster',x,y0+.008,z,r*3.1,baseH*.52,r*3.1,P('alabaster'));
  cyl('gilt',x,y0+.008+baseH*.52,z,r*1.36,baseH*.48,P('gilt'),12,r*1.12);
  cyl('leafscale',x,y0+baseH,z,r*1.06,shH,P('leafscale'),12,r*.94);
  for(const f of [.33,.67]){
   cyl('gilt',x,y0+baseH+shH*f-.03,z,r*1.14,.06,P('gilt'),12);
  }
  const yc=y0+baseH+shH;
  cyl('verdigris',x,yc,z,r*1.42,capH*.55,P('verdigris'),12,r*1.04);
  box('gilt',x,yc+capH*.55,z,r*3.2,capH*.45,r*3.2,P('gilt'),o.yaw==null?0:o.yaw);
 });
 if(o.block&&h>=1.2)tbWallBlock(x,y0,z,r*2.4,h,r*2.4,0);
}

/* Plate A3-A4 & Bioclimatic Rule 5: White carved ganch gypsum lacework panel recessed inside a rosebrick frame.
   Strictly restricted to dry veranda/loggia/cloister walls under roof shelter (o.sheltered === true). */
function tbGanchPanel(x,y,z,yaw,w,h,o){
 o=o||{};
 if(o.sheltered)tbBio().ganchSheltered++;
 else tbBio().ganchExposed++;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Proud rosebrick border frame at z = +0.042 (d = 0.068 -> spans [0.008..0.076]) */
   const bw=.09;
   box('rosebrick',0,bw/2,.042,w,bw,.068,P('rosebrick'));
   box('rosebrick',0,h-bw/2,.042,w,bw,.068,P('rosebrick'));
   for(const s of [-1,1])box('rosebrick',s*(w/2-bw/2),bw,.042,bw,Math.max(.1,h-bw*2),.068,P('rosebrick'));
   /* Recessed carved white ganch panel inside frame (spans x in [-(w/2-bw)..(w/2-bw)], z in [0.012..0.046]) */
   const gw=Math.max(.18,w-bw*2-.01),gh=Math.max(.18,h-bw*2-.01);
   box('ganch',0,bw+.005,.029,gw,gh,.034,P('ganch'));
   /* Central turquoise kashi salt-star boss proud of ganch at z = 0.064 */
   box('kashi',0,h*.5,.064,Math.min(.22,gw*.28),Math.min(.22,gh*.28),.032,P('kashi'));
  });
 });
}

/* Bioclimatic Rule 3 (Plates A2-A4): Deep shaded ustun veranda / ayvan with polychrome muqarnas columns,
   abyss-lac kundal coffered ceiling plenum, kashi architrave frieze, and optional sheltered ganch panels on back wall. */
function tbUstunAyvan(cx,cz,w,d,y0,h,o){
 o=o||{};
 const n=o.n==null?Math.max(2,Math.round(w/TB.BAY)+1):o.n;
 const entH=o.entH==null?.38:o.entH,colH=h-entH;
 const frontZ=o.flip?cz-d/2+.22:cz+d/2-.22;
 const backZ=o.flip?cz+d/2-.22:cz-d/2+.22;
 tbBio().ayvans++;
 tbBio().openLoggias++;
 for(let i=0;i<n;i++){
  const f=n===1?.5:i/(n-1),xx=cx+(f-.5)*(w-.44);
  if(o.skipMid&&Math.abs(xx-cx)<o.skipMid)continue;
  if(o.verdigris)tbVerdigrisColumn(xx,y0,frontZ,colH,{r:o.r==null?.16:o.r});
  else tbUstunColumn(xx,y0,frontZ,colH,{r:o.r==null?.145:o.r});
 }
 svNoWalk(()=>{
  /* Carved cedar & kashi glazed architrave beam along column line */
  box('ustun',cx,y0+colH,frontZ,w+.12,entH*.52,.34,P('ustun'));
  box('kashi',cx,y0+colH+entH*.52,frontZ,w+.18,entH*.26,.39,P('kashi'));
  box('carvedwood',cx,y0+colH+entH*.78,frontZ,w+.24,entH*.22,.44,P('carvedwood'));
  if(o.eaveCap){
   box('zsolnay',cx,y0+h,cz,w+.36,.1,d+.36,P('zsolnay'));
  }
 });
 /* Solid polychrome kundal / abyss-lac coffered ceiling over entire veranda bay */
 tbKundalCeiling(cx,y0+h-.1,cz,w-.08,d-.08,{mk:o.ceilMk||'kundal',ribMk:'lacquer'});
 /* Optional sheltered white ganch panels mounted on the dry back wall under the veranda roof */
 if(o.ganchBack&&w>=4.4){
  const gpY=y0+1.05,gpH=Math.min(1.65,colH-1.25);
  for(const sx of [-w*.28,w*.28]){
   tbGanchPanel(cx+sx,gpY,backZ+(o.flip?-.22:.22),o.flip?PI:0,Math.min(1.35,w*.22),gpH,{sheltered:true});
  }
 }
 if(o.walk!==false)wkPad(cx,cz,w,d,y0);
}

/* Plate B5: Open 4-column breezy corner or entry ground portico (El Capricho tafurst) with banded brick piers or verdigris columns. */
function tbCornerPortico(cx,cz,w,d,y0,h,o){
 o=o||{};
 const entH=.42,colH=h-entH;
 tbBio().openLoggias++;
 for(const sx of [-w/2+.26,w/2-.26])for(const sz of [-d/2+.26,d/2-.26]){
  if(o.verdigris)tbVerdigrisColumn(cx+sx,y0,cz+sz,colH,{r:.16});
  else{
   svNoWalk(()=>{
    box('ashlar',cx+sx,y0+.008,cz+sz,.46,.28,.46,P('ashlar'));
    box('bandbrick',cx+sx,y0+.288,cz+sz,.38,colH-.52,.38,P('bandbrick'));
    box('kashi',cx+sx,y0+colH*.55,cz+sz,.43,.14,.43,P('kashi'));
    box('rosebrick',cx+sx,y0+colH-.232,cz+sz,.48,.232,.48,P('rosebrick'));
   });
  }
 }
 svNoWalk(()=>{
  box('rosebrick',cx,y0+colH,cz,w+.12,entH*.48,d+.12,P('rosebrick'));
  box('trencadis',cx,y0+colH+entH*.48,cz,w+.18,entH*.28,d+.18,P('trencadis'));
  box('ashlar',cx,y0+colH+entH*.76,cz,w+.24,entH*.24,d+.24,P('ashlar'));
 });
 tbKundalCeiling(cx,y0+h-.1,cz,w-.2,d-.2,{mk:'kundal'});
 if(o.walk!==false)wkPad(cx,cz,w,d,y0);
}

/* Plate B2: Raichle Palace deep recessed street/court breeze-loggia arch with trencadis mosaic spandrels,
   sinuous rose-terracotta moldings, sheltered ganch side panels, and sky-tight vault ceiling! */
function tbRecessedLoggia(x,y0,z,yaw,w,h,depth,o){
 o=o||{};
 const dep=depth==null?2.4:depth,pierW=.46,archY=y0+h*.64,headH=h*.36;
 tbBio().openLoggias++;
 W(x,y0,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   /* Side jamb walls & front rosebrick Secessionist pilasters */
   for(const s of [-1,1]){
    const px=s*(w/2+pierW/2);
    box('ashlar',px,0,0,pierW+.06,.34,dep+.08,P('ashlar'));
    box('stucco',px,.34,0,pierW,h-.34,dep,P('stucco'));
    box('rosebrick',px,.34,dep/2+.035,pierW-.06,h-.34,.07,P('rosebrick'));
    box('kashi',px,h*.48,dep/2+.075,pierW-.12,.22,.05,P('kashi'));
   }
   /* Front arched spandrel lintel with trencadis mosaic & curvilinear terracotta trim */
   box('stucco',0,archY,dep/2-.18,w,.36,.36,P('stucco'));
   box('trencadis',0,archY+.36,dep/2-.16,w,Math.max(.2,headH-.52),.32,P('trencadis'));
   /* Stepped arch voussoirs along underside of opening */
   for(const s of [-1,1]){
    box('terracotta',s*(w*.34),archY-.34,dep/2-.14,w*.3,.34,.42,P('terracotta'));
    box('terracotta',s*(w*.18),archY-.14,dep/2-.14,w*.22,.14,.42,P('terracotta'));
   }
   box('rosebrick',0,h-.16,dep/2-.12,w+pierW*2+.14,.16,.48,P('rosebrick'));
   box('kashi',0,h-.32,dep/2+.04,w+pierW*1.6,.12,.06,P('kashi'));
  });
  /* Sheltered ganch gypsum panels inside the dry side walls of the recessed loggia! */
  if(dep>=1.8&&h>=3.2){
   for(const s of [-1,1]){
    tbGanchPanel(s*(w/2-.01),1.0,0,s<0?PI/2:-PI/2,Math.min(1.4,dep-.5),Math.min(1.6,h-1.6),{sheltered:true});
   }
  }
  /* Sky-tight coffered ceiling over the recessed loggia bay */
  tbKundalCeiling(0,h-.12,0,w-.04,dep-.08,{mk:'kundal'});
  if(o.walk!==false)wkPad(0,0,w,dep,0);
 });
}

/* Bioclimatic Rule 4: Perforated buff-and-rose honeycomb brick claustra breeze-wall allowing airflow while shading interiors. */
function tbClaustraScreen(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.4)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?.28:o.t;
 tbBio().claustra++;
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   const sillH=.24,capH=.16,bodyH=Math.max(.3,h-sillH-capH);
   box('ashlar',0,y0,0,L,sillH,t+.06,P('ashlar'));
   box('kashi',0,y0+h-capH,0,L,capH*.45,t+.08,P('kashi'));
   box('rosebrick',0,y0+h-capH*.55,0,L,capH*.55,t+.1,P('rosebrick'));
   /* End piers */
   for(const sx of [-L/2+.12,L/2-.12]){
    box('rosebrick',sx,y0+sillH,0,.24,bodyH,t+.04,P('rosebrick'));
   }
   /* Pierced diagonal buff/terracotta brick & alkaline-teal boss claustra screen (alpha-cutout lattice) */
   const spanW=Math.max(.24,L-.48);
   box('claustra',0,y0+sillH,0,spanW,bodyH,.06,P('claustra'));
  });
  if(o.block!==false&&h>=.82)tbWallBlock(0,y0,0,L,h,t,0);
 });
}

/* Plate A1 & B2: Samarkand Shah-i-Zinda embossed kashi / Secessionist doorway with operable carved cedar leaf. */
function tbKashiDoor(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?TB.WALL:o.t;
 const fMk=o.frameMk||'ustun',fCol=P(fMk);
 const leafMk=o.leafMk||'cedar',leafCol=P(leafMk);
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   for(const s of [-1,1]){
    box('alabaster',s*(w/2+.1),0,0,.2,.24,t+.16,P('alabaster'));
    box(fMk,s*(w/2+.095),.24,0,.19,h-.16,t+.14,fCol);
   }
   box(fMk,0,h+.08,0,w+.46,.16,t+.16,fCol);
   if(o.pishtaq!==false){
    const pz=t/2+.095;
    /* Embossed kashi turquoise & cobalt arch/epigraphic lintel stepped cleanly proud of wall & jambs */
    box('cobalt',0,h+.24,pz-.01,w+.54,.38,.05,P('cobalt'));
    box('kashi',0,h+.28,pz+.03,w+.38,.28,.045,P('kashi'));
    /* Tifinagh salt-mark gilt medallion */
    cyl('gilt',0,h+.42,pz+.068,.11,.028,P('gilt'),8);
   }
  });
  if(o.open!==true){
   svLeaf(0,.02,0,0,w-.06,h-.04,{
    mk:leafMk,col:leafCol,style:o.doorStyle||'banded',hwCol:0xc49840,
    locked:!!o.locked,ajar:o.ajar==null?0:o.ajar,name:o.name||'door'
   });
  }
  door(0,0,t/2,0,w,h);
  if(o.walkPad!==false)wkPad(0,0,w+.28,t+1.22,0);
 });
}

/* Plate B2 & B1: Projecting verdigris-bronze bay-oriel breeze window (or flush Secessionist ceramic-trimmed window). */
function tbVerdigrisOriel(x,y,z,yaw,w,h,o){
 o=o||{};
 const t=o.t==null?TB.WALL:o.t,proj=o.proj==null?.38:o.proj;
 if(!o.flat)tbBio().oriels++;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   if(o.flat){
    box('ashlar',0,-.08,0,w+.28,.08,t+.14,P('ashlar'));
    for(const s of [-1,1])box('rosebrick',s*(w/2+.06),0,0,.12,h,t+.1,P('rosebrick'));
    box('terracotta',0,h,0,w+.36,.12,t+.15,P('terracotta'));
    box('kashi',0,h+.12,0,w+.22,.08,t+.13,P('kashi'));
   }else{
    /* Projecting verdigris-framed bay-oriel starting cleanly outside wall face at z0 = t/2 + 0.045 */
    const z0=t/2+.045,zc=z0+proj/2;
    box('terracotta',0,-.09,zc,w+.3,.09,proj,P('terracotta'));
    for(const sx of [-w*.36,0,w*.36]){
     beam('rosebrick',[sx,-.42,z0+.03],[sx,-.09,z0+proj-.05],.075,P('rosebrick'));
    }
    /* Embossed trencadis/verdigris apron + corner verdigris mullions */
    box('verdigris',0,0,z0+proj-.04,w+.18,h*.3,.06,P('verdigris'));
    box('trencadis',0,h*.06,z0+proj+.005,w-.06,h*.18,.032,P('trencadis'));
    for(const s of [-1,1]){
     box('verdigris',s*(w/2+.045),0,zc,.085,h,proj-.04,P('verdigris'));
     box('verdigris',s*(w*.18),h*.3,z0+proj-.035,.05,h*.7,.05,P('verdigris'));
    }
    /* Glazed fine-scale Zsolnay mini-hood + gilt finial */
    box('verdigris',0,h,zc,w+.32,.075,proj+.08,P('verdigris'));
    box('zsolnay_fine',0,h+.075,zc+.02,w+.42,.09,proj+.16,P('zsolnay_fine'));
    sph('gilt',0,h+.21,zc+.02,.055,P('gilt'),1,8);
   }
  });
  svPane(0,0,0,0,w-.06,h-.02,{kind:o.kind||'lit',t:.025});
  windowAt(0,0,t/2,0,w,h,o.sill==null?.95:o.sill);
 });
}

/* Pierced Zsolnay/kashi Secessionist gable roundel oculus (Plate B1). */
function tbCeramicRoundel(x,y,z,yaw,r,o){
 o=o||{};
 const rad=r==null?.42:r;
 W(x,y,z,yaw==null?0:yaw,()=>{
  svNoWalk(()=>{
   cyl('terracotta',0,0,.045,rad+.1,.06,P('terracotta'),14,rad+.1,false);
   /* Note: cyl is vertical along Y in engine; rotate X by PI/2 via W or build flat octagonal ring! */
  });
 });
}

/* Straight Urban Tabisti wall segment from (x0,z0) to (x1,z1) supporting register:
   - 'banded'    (Plate B5 El Capricho: buffbrick + horizontal rosebrick & kashi relief-tile bands)
   - 'secession' (Plate B1-B2 Lechner/Raichle: cream stucco + kashi dado + curvilinear terracotta frieze)
   - 'hazarbaf'  (Plate A1/A3 Samarkand: buffbrick + cobalt/kashi dado + embossed rosebrick lozenge courses) */
function tbWall(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.08)return;
 const yaw=Math.atan2(z0-z1,x1-x0),t=o.t==null?TB.WALL:o.t;
 const reg=o.register||'banded';
 const soc=o.socle==null?(reg==='banded'?.42:reg==='secession'?.34:.38):o.socle;
 const dado=o.dado==null?(reg==='banded'?.18:reg==='secession'?.22:.26):o.dado;
 const socMk=o.socMk||(reg==='banded'?'ashlar':reg==='secession'?'rosebrick':'alabaster'),socCol=P(socMk);
 const dadoMk=o.dadoMk||(reg==='hazarbaf'?'cobalt':'kashi'),dadoCol=P(dadoMk);
 const mk=o.mk||(reg==='secession'?'stucco':reg==='banded'?'buffbrick':'buffbrick'),col=o.col==null?P(mk):o.col;
 const friezeH=h>=2.2?.22:0;
 const friezeMk=reg==='secession'?'terracotta':reg==='hazarbaf'?'kashi':'rosebrick',friezeCol=P(friezeMk);
 const bandY=h>=2.8?y0+h*.56:-1;
 const bandMk=reg==='banded'?'kashi':reg==='hazarbaf'?'rosebrick':null;

 const holes=(o.holes||[]).map(q=>{
  const wy=q.y==null?(q.door?0:1.0):q.y,wh=q.h==null?(q.door?TB.DOOR_H:1.35):q.h;
  return Object.assign({},q,{a:q.at-q.w/2,b:q.at+q.w/2,wy,wh,y0:y0+wy,y1:y0+wy+wh});
 });

 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  const X=s=>s-L/2;
  svNoWalk(()=>{
   const run=(a,b,ya,yb)=>{
    if(b-a<.02||yb-ya<.02)return;
    const wSeg=b-a,xMid=X((a+b)/2);
    const yS=Math.min(yb,y0+soc);
    if(soc>0&&yS>ya)box(socMk,xMid,ya,0,wSeg,yS-ya,t+.055,socCol);
    const yD0=Math.max(ya,y0+soc),yD1=Math.min(yb,y0+soc+dado);
    if(dado>0&&yD1>yD0)box(dadoMk,xMid,yD0,0,wSeg,yD1-yD0,t+.028,dadoCol);
    const yF0=friezeH>0?y0+h-friezeH:y0+h;
    const yB0=Math.max(ya,y0+soc+dado),yB1=Math.min(yb,yF0);
    if(yB1>yB0){
     box(mk,xMid,yB0,0,wSeg,yB1-yB0,t,col);
     if(bandMk&&bandY>yB0+.18&&bandY+.14<yB1-.12){
      box(bandMk,xMid,bandY,0,wSeg,.14,t+.032,P(bandMk));
     }
     /* Embossed geometric hazarbaf & kashi relief medallions on unbroken bays >= 2.6 m wide (Plates A1, A3, B1) */
     if(wSeg>=2.6&&yB1-yB0>=1.65){
      const nMed=Math.min(3,Math.floor(wSeg/2.6)),mY=yB0+(yB1-yB0)*.52;
      for(let mi=0;mi<nMed;mi++){
       const mx=X(a+wSeg*(mi+.5)/nMed);
       box('rosebrick',mx,mY-.34,0,.68,.68,t+.044,P('rosebrick'));
       box('kashi',mx,mY-.2,0,.4,.4,t+.076,P('kashi'));
      }
     }
    }
    const yTop0=Math.max(ya,yF0);
    if(friezeH>0&&yb>yTop0)box(friezeMk,xMid,yTop0,0,wSeg,yb-yTop0,t+.036,friezeCol);
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
    tbKashiDoor(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,register:reg},q));
   }else{
    tbVerdigrisOriel(X(q.at),y0+q.wy,0,q.flip?PI:0,q.w,q.wh,Object.assign({t,flat:q.flat==null?(q.wy<.6):q.flat,sill:q.wy},q));
   }
  }
  if(o.block!==false&&h>=.82){
   const dSpans=holes.filter(q=>q.door).map(q=>[Math.max(0,q.a),Math.min(L,q.b)]).sort((a,b)=>a[0]-b[0]);
   let cur=0;
   for(const sp of dSpans){
    if(sp[0]-cur>.16)tbWallBlock(X((cur+sp[0])/2),y0,0,sp[0]-cur,h,t,0);
    cur=Math.max(cur,sp[1]);
   }
   if(L-cur>.16)tbWallBlock(X((cur+L)/2),y0,0,L-cur,h,t,0);
  }
 });
}

/* Rectangular Urban Tabisti wall enclosure [x0..x1, z0..z1] with rosebrick/kashi corner pilasters, eave cornice & room record. */
function tbWallRing(x0,z0,x1,z1,y0,h,o){
 o=o||{};
 const t=o.t==null?TB.WALL:o.t,reg=o.register||'banded';
 const pw=t+.09,hp=pw/2+.015,H=o.holes||{},skip=o.skip||'';
 const postMk=o.postMk||(reg==='hazarbaf'?'kashi':'rosebrick'),postCol=P(postMk);
 const baseMk=reg==='hazarbaf'?'alabaster':'ashlar',baseCol=P(baseMk);
 svNoWalk(()=>{
  for(const cx of [x0,x1])for(const cz of [z0,z1]){
   const sh=Math.min(.46,h*.18);
   box(baseMk,cx,y0,cz,pw+.045,sh,pw+.045,baseCol);
   box(postMk,cx,y0+sh,cz,pw,h-sh,pw,postCol);
  }
  if(o.plate!==false){
   const plateMk=reg==='secession'?'terracotta':'ustun',plateCol=P(plateMk);
   box(plateMk,(x0+x1)/2,y0+h,z1,x1-x0+pw+.07,.14,pw+.07,plateCol);
   box(plateMk,(x0+x1)/2,y0+h,z0,x1-x0+pw+.07,.14,pw+.07,plateCol);
   box(plateMk,x0,y0+h,(z0+z1)/2,pw+.07,.14,z1-z0-pw-.09,plateCol);
   box(plateMk,x1,y0+h,(z0+z1)/2,pw+.07,.14,z1-z0-pw-.09,plateCol);
  }
 });
 if(o.block!==false&&h>=.82){
  for(const cx of [x0,x1])for(const cz of [z0,z1])tbWallBlock(cx,y0,cz,pw,h,pw,0);
 }
 const shiftPos=(arr,off)=>(arr||[]).map(q=>Object.assign({},q,{at:q.at-off}));
 const shiftRev=(arr,hi)=>(arr||[]).map(q=>Object.assign({},q,{at:hi-q.at}));
 if(skip.indexOf('s')<0)tbWall(x0+hp,z1,x1-hp,z1,y0,h,Object.assign({},o,{holes:shiftPos(H.s,x0+hp)}));
 if(skip.indexOf('n')<0)tbWall(x1-hp,z0,x0+hp,z0,y0,h,Object.assign({},o,{holes:shiftRev(H.n,x1-hp)}));
 if(skip.indexOf('e')<0)tbWall(x1,z1-hp,x1,z0+hp,y0,h,Object.assign({},o,{holes:shiftRev(H.e,z1-hp)}));
 if(skip.indexOf('w')<0)tbWall(x0,z0+hp,x0,z1-hp,y0,h,Object.assign({},o,{holes:shiftPos(H.w,z0+hp)}));
 tbRoom(x0,z0,x1,z1,y0,h,o);
}

/* Gallery wrought-iron / ustun breeze-balustrade OR glazed-coped courtyard parapet (svNoWalk; non-blocking unless o.block). */
function tbParapet(x0,z0,x1,z1,y0,o){
 o=o||{};
 const L=Math.hypot(x1-x0,z1-z0);
 if(L<.35)return;
 const yaw=Math.atan2(z0-z1,x1-x0),kind=o.kind||'iron';
 W((x0+x1)/2,0,(z0+z1)/2,yaw,()=>{
  svNoWalk(()=>{
   if(kind==='brick'){
    const h=o.h==null?1.02:o.h,t=o.t==null?.3:o.t;
    box('ashlar',0,y0+.008,0,L,.18,t+.04,P('ashlar'));
    box('buffbrick',0,y0+.188,0,L,h-.28,t,P('buffbrick'));
    box('kashi',0,y0+h-.092,0,L+.06,.092,t+.09,P('kashi'));
   }else{
    const h=o.h==null?.88:o.h,t=o.t==null?.12:o.t;
    box('ustun',0,y0+.008,0,L,.08,t+.02,P('ustun'));
    const nB=Math.max(2,Math.floor((L-.3)/.36));
    for(let i=0;i<nB;i++){
     const xx=lerp(-L/2+.16,L/2-.16,i/(nB-1));
     if(o.skipMid&&Math.abs(xx)<o.skipMid)continue;
     box('iron',xx,y0+.088,0,.045,h-.19,.045,P('iron'));
    }
    box('verdigris',0,y0+h-.102,0,L+.04,.065,t+.04,P('verdigris'));
    box('gilt',0,y0+h-.037,0,L+.06,.037,t+.05,P('gilt'));
   }
  });
  if(o.block)tbWallBlock(0,y0,0,L,o.h==null?.92:o.h,.24,0);
 });
}

/* Bioclimatic Rule 6: Turquoise-tiled evaporative courtyard shadirvan basin or salt-lake canal wired to core/water. */
function tbShadirvanPool(cx,cz,w,d,yRim,depth,o){
 o=o||{};
 const dep=depth==null?.52:depth,curbW=.32;
 const curbMk=o.curbMk||'alabaster',curbCol=P(curbMk);
 const tileMk=o.tileMk||'kashi',tileCol=P(tileMk);
 tbBio().shadirvans++;
 tbNoCut(()=>svNoWalk(()=>{
  box('cobalt',cx,yRim-dep-.09,cz,w,.09,d,P('cobalt'));
  for(const sz of [-d/2+curbW/2,d/2-curbW/2]){
   box(tileMk,cx,yRim-dep,cz+sz,w,dep+.04,curbW,tileCol);
   box(curbMk,cx,yRim+.04,cz+sz,w+.06,.08,curbW+.06,curbCol);
  }
  for(const sx of [-w/2+curbW/2,w/2-curbW/2]){
   box(tileMk,cx+sx,yRim-dep,cz,curbW,dep+.04,d-curbW*2,tileCol);
   box(curbMk,cx+sx,yRim+.04,cz,curbW+.06,.08,d-curbW*2-.06,curbCol);
  }
  if(!o.river&&o.waterMesh!==false){
   box('water',cx,yRim-.1,cz,w-curbW*2-.04,.08,d-curbW*2-.04,P('water'));
  }
  if(o.jet){
   cyl('verdigris',cx,yRim-dep,cz,.14,dep+.26,P('verdigris'),10);
   cyl('gilt',cx,yRim+.26,cz,.24,.06,P('gilt'),10);
   cyl('crystal',cx,yRim+.32,cz,.065,.12,P('crystal'),8);
  }
 }));
 if(o.river&&CURREC&&!PLACE_DRY){
  const alongX=o.river.axis==='x'||(o.river.axis!=='z'&&w>=d);
  const wy=yRim-.08;
  const localPts=alongX
   ?[[-w/2+.35,wy,cz],[0,wy,cz],[w/2-.35,wy,cz]]
   :[[cx,wy,-d/2+.35],[cx,wy,0],[cx,wy,d/2-.35]];
  if(o.river.flip)localPts.reverse();
  const wPts=localPts.map(q=>{
   const v=new THREE.Vector3(q[0],q[1],q[2]).applyMatrix4(CM);
   return [v.x,v.z,v.y];
  });
  const spanW=alongX?Math.max(1.0,d-curbW*2-.18):Math.max(1.0,w-curbW*2-.18);
  const list=CURREC.rivers||(CURREC.rivers=[]);
  list.push({name:o.river.name||CURKEY+'-stream-'+(list.length+1),pts:wPts,width:o.river.width==null?spanW:o.river.width,speed:o.river.speed==null?.38:o.river.speed});
 }
}
