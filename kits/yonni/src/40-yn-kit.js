// prefix: yn
// ================================================================= YONNI ARCHITECTURAL TOOLKIT: drums, root-skirts, corbel-fins, spiral stairs & bridges
// Built on core/engine's 30-geo.js, 36-def.js, 36o-open.js and 36s-stair.js. Every helper maintains >= 5 mm structural
// separation between distinct materials so coplanar same-normal z-fighting is zero by construction.
const YN_WALL_T=.34,YN_FLOOR_T=.14;

/* angle convention: sector() uses (cx + cos(a)*r, cz + sin(a)*r), so a = PI/2 is +z (front), a = 0 is +x (right).
   ynYawFromA converts sector angle `a` to Three.js outward yaw (0 = +z, PI/2 = +x). */
function ynYawFromA(a){return Math.atan2(Math.cos(a),Math.sin(a));}
function ynFace(x,z,tx,tz){return Math.atan2((tx==null?0:tx)-x,(tz==null?0:tz)-z);}
function ynSpan(a,b,n){const o=[];for(let i=0;i<n;i++)o.push(n<2?(a+b)/2:a+(b-a)*i/(n-1));return o;}

/* draw geometry outside the X cut-away (stairs, bridges, foundations, cliff rock, yard gear) */
function ynNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
function ynCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}

/* subterranean below-grade geometry (y < 0): drawn into world buckets so steep hillsides never show floating bases,
   while pausing SB and KWALKBOX so above-ground footprint height checks measure y >= 0 structure */
function ynBelowGrade(fn){const keepSB=SB;SB=null;try{ynNoCut(()=>svNoWalk(fn));}finally{SB=keepSB;}}

/* ---------------------------------------------------------------- 1. Telescoping Battered Cobble Root-Skirt (NO rectangular podiums!)
   Extends 3.5-7.5 m below y = 0 at a 1:6 outward batter (open-bottomed frustum, no horizontal cap at y = 0 or -depth),
   so on 0-35 deg slopes the cylindrical tower plunges seamlessly into the hillside with zero boxy terraces. */
function ynRootSkirt(cx,cz,rTop,depth,o){
 o=o||{};const d=depth==null?4.8:depth,bat=o.batter==null?.16:o.batter,seg=o.seg==null?16:o.seg;
 const mk=o.mk||'cobble',col=o.col==null?P(mk==='ironstone'?'ironstone':'cobble'):o.col;
 const a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1;
 ynBelowGrade(()=>{
  lathe(mk,cx,cz,[[rTop+d*bat,-d],[rTop-.01,0]],seg,col,{a0,a1,uv:'arc'});
 });
 /* neat battered above-ground cobble plinth ring (0 .. plinthH) proud of the shaft by 5 cm */
 const ph=o.plinthH==null?.42:o.plinthH;
 if(ph>.04){
  ynNoCut(()=>{
   lathe(mk,cx,cz,[[rTop+.07,.005],[rTop+.04,ph-.06],[rTop+.006,ph]],seg,col,{a0,a1,uv:'arc'});
  });
 }
}

/* ---------------------------------------------------------------- 2. Polygonal Walkable Floor Disc (inset inside drum shell) */
function ynFloorDisc(cx,cz,r,y,mk,col,o){
 o=o||{};const seg=o.seg==null?18:o.seg,th=o.th==null?YN_FLOOR_T:o.th,a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1;
 const full=Math.abs((a1-a0)-TAU)<1e-3,pts=[];
 if(full){
  for(let i=0;i<seg;i++){const a=i/seg*TAU;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 }else{
  pts.push([cx,cz]);
  for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg;pts.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 }
 svNoWalk(()=>prism(mk||'floor',pts,y-th,y,col==null?P('floor'):col));
 if(o.walk!==false)svFloor(pts,y);
 return pts;
}

/* ---------------------------------------------------------------- 3. Semicircular Crescent Rain-Visor & Annular Drip-Skirt (02f9f0ab) */
function ynCrescentVisor(cx,cz,rOut,aMid,spanA,y,out,mk,col){
 const nu=12,rBase=rOut+.012,proj=out==null?.58:out,m=mk||'sealime',c=col==null?P('sealimeW'):col;
 /* top watershed surface + underside soffit as a closed wedge lip (no coplanar duplicate faces) */
 psurf(m,(u,v)=>{
  const a=aMid+(u-.5)*2*spanA,bell=Math.sin(u*PI);
  const rad=rBase+v*proj*bell,yy=y+.11*(1-v)*bell-.05*v*bell;
  return [cx+Math.cos(a)*rad,yy,cz+Math.sin(a)*rad];
 },nu,3,c,{up:true});
 psurf('ironwood',(u,v)=>{
  const a=aMid+(u-.5)*2*spanA,bell=Math.sin(u*PI);
  const rad=rBase+.005+v*(proj-.02)*bell,yy=y-.035+.06*(1-v)*bell-.05*v*bell;
  return [cx+Math.cos(a)*rad,yy,cz+Math.sin(a)*rad];
 },nu,2,P('ironwood'),{flip:true});
}

function ynDripSkirt(cx,cz,rOut,y,out,drop,mk,col,o){
 o=o||{};const seg=o.seg==null?26:o.seg,a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1;
 const r0=rOut+.01,r1=rOut+(out==null?.48:out),dy=drop==null?.24:drop;
 lathe(mk||'slate',cx,cz,[[r0,y-.07],[r1-.03,y-.04],[r1,y],[r0,y+dy]],seg,col==null?P('slate'):col,{a0,a1,uv:'arc'});
}

/* ---------------------------------------------------------------- 4. Hollow Cylindrical Drum Wall with Real Cut Openings
   opens: [{a (angle, PI/2 = +z front), w (arc chord width m), y (sill above y0), h, door, open, leaf, visor, pane, quoins}] */
function ynDrumWall(cx,cz,rIn,rOut,y0,h,mk,col,opens,o){
 o=o||{};const aStart=o.a0==null?0:o.a0,aEnd=o.a1==null?TAU:o.a1,rm=(rIn+rOut)/2;
 const c=col==null?P(mk==='cobble'?'cobble':mk==='ironstone'?'ironstone':'sealime'):col;
 const qmk=o.quoinMk||'ashlar',qcol=o.quoinCol==null?P('ashlar'):o.quoinCol,leafCol=o.leafCol==null?P('ironwood'):o.leafCol;
 const list=(opens||[]).map(q=>{
  const da=Math.min(.65,Math.max(.08,(q.w==null?.95:q.w)/(2*rm)));
  let am=q.a==null?PI/2:q.a;
  while(am<aStart-.001)am+=TAU;while(am>aEnd+.001)am-=TAU;
  return Object.assign({},q,{am,a0:Math.max(aStart,am-da),a1:Math.min(aEnd,am+da),wActual:2*da*rm});
 }).filter(q=>q.a1-q.a0>.02).sort((a,b)=>a.a0-b.a0);

 let cur=aStart;
 /* inset base +4 mm above y0 and top -4 mm below y0+h so stacked drums and floor furniture never share a plane */
 const segArc=(aa,ab,ya,yb)=>{
  const yBot=ya<.005?y0+.004:y0+ya,yTop=yb>h-.005?y0+h-.004:y0+yb;
  if(ab-aa>.008&&yTop-yBot>.015){
   const n=Math.max(2,Math.ceil((ab-aa)/(PI/14)));
   sector(mk,cx,cz,rIn,rOut,aa,ab,yBot,yTop,c,n);
  }
 };
 for(const q of list){
  if(q.a0>cur+.008)segArc(cur,q.a0,0,h);
  const sy=q.door?(q.y==null?0:q.y):(q.y==null?.95:q.y),qh=Math.min(h-sy-.18,q.h==null?(q.door?2.15:1.15):q.h);
  if(sy>.02)segArc(q.a0,q.a1,0,sy);
  if(sy+qh<h-.02)segArc(q.a0,q.a1,sy+qh,h);
  cur=Math.max(cur,q.a1);

  const yaw=ynYawFromA(q.am),ox=cx+Math.cos(q.am)*rOut,oz=cz+Math.sin(q.am)*rOut;
  const mx=cx+Math.cos(q.am)*rm,mz=cz+Math.sin(q.am)*rm;
  /* proud stone lintel & sill collar outside rOut (rOut+.008 .. rOut+.068 -> zero overlap with drum face or upper corbel ring) */
  if(q.quoins!==false){
   const pad=.035;
   sector(qmk,cx,cz,rOut+.008,rOut+.068,q.a0-pad,q.a1+pad,y0+sy+qh,Math.min(y0+h-.16,y0+sy+qh+.14),qcol,4);
   if(!q.door&&sy>.1)sector(qmk,cx,cz,rOut+.008,rOut+.082,q.a0-pad*.8,q.a1+pad*.8,y0+sy-.08,y0+sy-.004,qcol,4);
  }
  if(q.visor||(q.visor!==false&&!q.door&&o.visors!==false)){
   ynCrescentVisor(cx,cz,rOut,q.am,(q.a1-q.a0)*.78,y0+sy+qh+.15,q.visorOut==null?.46:q.visorOut,o.visorMk||'sealime',o.visorCol);
  }else if(q.visor&&q.door){
   ynCrescentVisor(cx,cz,rOut,q.am,(q.a1-q.a0)*.85,y0+sy+qh+.16,q.visorOut==null?.68:q.visorOut,o.visorMk||'slate',P('slate'));
  }
  if(q.door){
   door(ox,y0+sy,oz,yaw,q.wActual,qh);
   if(!q.open&&q.leaf!==false){
    svLeaf(mx,y0+sy+.006,mz,yaw,q.wActual*.92,qh-.036,{mk:o.leafMk||'ironwood',col:leafCol,t:.055,style:'plank',hwCol:0xb88e48,name:q.name||'door'});
   }
  }else{
   windowAt(ox,y0+sy,oz,yaw,q.wActual,qh,sy);
   if(q.pane!==false){
    svPane(mx,y0+sy+.01,mz,yaw,q.wActual*.9,qh-.02,{kind:q.pane||'lit',t:.025});
   }
  }
 }
 if(aEnd>cur+.008)segArc(cur,aEnd,0,h);
}

/* ---------------------------------------------------------------- 5. Vertical Corbel-Fins (861d6426) & Fluted Corbel-Ribs (02f9f0ab, 171af084) */
function ynCorbelFins(cx,cz,rBot,rTop,y0,y1,n,mk,col,o){
 o=o||{};const a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1,full=Math.abs((a1-a0)-TAU)<1e-3;
 const th=o.th==null?.18:o.th,m=mk||'corbel',c=col==null?P('corbel'):col,bzCol=P('bronze');
 const ringH=o.ring!==false?.13:0,yFinTop=y1-ringH-.016;
 const count=Math.max(3,n||12);
 for(let i=0;i<count;i++){
  const u=full?i/count:(count<2?.5:i/(count-1)),a=a0+(a1-a0)*u,yaw=ynYawFromA(a);
  W(cx,0,cz,yaw,()=>{
   const z0=rBot+.014,z1=rTop,ym=lerp(y0,yFinTop,.52);
   svNoWalk(()=>{
    box(m,0,ym,(z0+z1)/2,th,Math.max(.08,yFinTop-ym),z1-z0,c);
    beam(m,[0,y0,z0+.05],[0,ym-.01,z1-.06],th*.88,c,false,undefined,Math.max(.16,(z1-z0)*.38));
    if(o.bronzeTip)box('bronze',0,yFinTop-.09,z1+.022,th+.024,.07,.036,bzCol);
   });
  });
 }
 /* continuous corbelled ring-beam stepped 10 mm outside rBot and 10 mm below y1 so zero coplanar faces with drum or floor */
 if(o.ring!==false){
  sector(m,cx,cz,rBot+.01,rTop+.03,a0,a1,y1-ringH-.01,y1-.01,c,Math.max(12,count*2));
 }
}

/* ---------------------------------------------------------------- 6. Overhanging Circular Arcaded War-Gallery / Rotunda Loggia */
function ynArcadeRing(cx,cz,rIn,rOut,y0,h,nBays,o){
 o=o||{};const a0=o.a0==null?0:o.a0,a1=o.a1==null?TAU:o.a1,full=Math.abs((a1-a0)-TAU)<1e-3;
 const paraH=o.paraH==null?.86:o.paraH,archH=o.archH==null?.58:o.archH,colR=o.colR==null?.11:o.colR;
 const pmk=o.paraMk||'cobble',pcol=o.paraCol==null?P(pmk==='cobble'?'cobble':'sealime'):o.paraCol;
 const cmk=o.colMk||'ironwood',ccol=o.colCol==null?P('ironwood'):o.colCol;
 const smk=o.spandrelMk||'sealime',scol=o.spandrelCol==null?P('sealime'):o.spandrelCol;
 const capCol=P('bronze'),ashCol=P('ashlar');
 const seg=Math.max(14,(nBays||10)*2);
 /* parapet ring (with optional doorway gap o.gapA) */
 if(paraH>.05){
  if(o.gapA!=null){
   const g=o.gapDa==null?.22:o.gapDa;
   if(o.gapA-g>a0+.02)sector(pmk,cx,cz,rIn,rOut,a0,o.gapA-g,y0+.005,y0+paraH,pcol,Math.max(4,Math.round(seg*.4)));
   if(a1>o.gapA+g+.02)sector(pmk,cx,cz,rIn,rOut,o.gapA+g,a1,y0+.005,y0+paraH,pcol,Math.max(4,Math.round(seg*.4)));
  }else{
   sector(pmk,cx,cz,rIn,rOut,a0,a1,y0+.005,y0+paraH,pcol,seg);
  }
  if(o.gapA==null)sector('ashlar',cx,cz,rIn-.02,rOut+.03,a0,a1,y0+paraH+.004,y0+paraH+.06,ashCol,seg);
 }
 const cy0=y0+(paraH>.05?paraH+.065:.005),cy1=y0+h-archH,rm=(rIn+rOut)/2;
 const nb=Math.max(4,nBays||10),nCols=full?nb:nb+1;
 for(let i=0;i<nCols;i++){
  const a=a0+(a1-a0)*(i/nb);
  if(o.gapA!=null&&Math.abs(a-o.gapA)<.14&&paraH>.05)continue;
  const px=cx+Math.cos(a)*rm,pz=cz+Math.sin(a)*rm;
  const shaftH=Math.max(.14,cy1-cy0-.062);
  cyl(cmk,px,cy0,pz,colR,shaftH,ccol,10);
  cyl('bronze',px,cy0+shaftH+.005,pz,colR*1.28,.05,capCol,10);
 }
 /* upper spandrel frieze + arched soffit blocks */
 sector(smk,cx,cz,rIn,rOut,a0,a1,cy1,y0+h,scol,seg);
}

/* ---------------------------------------------------------------- 7. Drum-Hugging Exterior Spiral Stone Stair (171af084, c1eecdde) */
function ynSpiralStair(cx,cz,rDrum,y0,y1,a0,sweep,o){
 o=o||{};const rise=y1-y0;if(rise<.15)return;
 const w=o.w==null?.95:o.w,r0=rDrum+.024,r1=r0+w,rm=(r0+r1)/2;
 const n=Math.max(4,Math.ceil(rise/.195)),dy=(rise-.014)/n,da=sweep/n;
 const mk=o.mk||'flagstone',col=o.col==null?P('flagstone'):o.col,iwCol=P('ironwood'),bzCol=P('bronze');
 ynNoCut(()=>{
  const railPts=[];
  svNoWalk(()=>{
   for(let i=0;i<n;i++){
    const aa=a0+da*i,ab=a0+da*(i+1),yt=y0+dy*(i+1),yb=Math.max(y0+.008,yt-Math.min(.22,dy-.008));
    sector(mk,cx,cz,r0,r1,Math.min(aa,ab),Math.max(aa,ab),yb,yt,col,2);
    if(i%3===0||i===n-1){
     const am=(aa+ab)/2,rx=cx+Math.cos(am)*(r1-.06),rz=cz+Math.sin(am)*(r1-.06);
     cyl('ironwood',rx,yt+.005,rz,.038,.87,iwCol,6);
     railPts.push([rx,yt+.88,rz]);
    }
   }
   /* top landing platform stepped 12 mm below interior floor disc y1 so zero coplanar cap overlap */
   const aTop=a0+sweep,sg=sweep>=0?1:-1;
   sector(mk,cx,cz,r0,r1+.12,Math.min(aTop,aTop+sg*.24),Math.max(aTop,aTop+sg*.24),y1-.15,y1-.012,col,3);
  });
  if(railPts.length>=2)cord('bronze',railPts,.03,bzCol);
  /* register walkable spiral chord strips + bottom entry pad & radial top threshold bridge onto interior ynFloorDisc */
  const aTop=a0+sweep,rInBridge=Math.max(.18,rDrum-.72);
  const footPts=[a0-.18,a0+.18].map(a=>[cx+Math.cos(a)*(r1+.24),cz+Math.sin(a)*(r1+.24)]).concat(
   [a0+.18,a0-.18].map(a=>[cx+Math.cos(a)*r0,cz+Math.sin(a)*r0]));
  svFloor(footPts,y0);
  const segs=Math.max(4,Math.min(n,Math.ceil(Math.abs(sweep)/.36)));
  for(let k=0;k<segs;k++){
   const t0=k/segs,t1=(k+1)/segs,aa=a0+sweep*t0,ab=a0+sweep*t1;
   svStripWalk([cx+Math.cos(aa)*rm,y0+rise*t0,cz+Math.sin(aa)*rm],[cx+Math.cos(ab)*rm,y0+rise*t1,cz+Math.sin(ab)*rm],Math.max(.82,w*.9));
  }
  const topPts=[aTop-.20,aTop+.20].map(a=>[cx+Math.cos(a)*(r1+.16),cz+Math.sin(a)*(r1+.16)]).concat(
   [aTop+.20,aTop-.20].map(a=>[cx+Math.cos(a)*rInBridge,cz+Math.sin(a)*rInBridge]));
  svFloor(topPts,y1);
 });
}

/* ---------------------------------------------------------------- 8. Contour Gangplanks & Roofed Sloped Flying Bridges (8dac4161, 02f9f0ab) */
function ynGangplank(ax,ay,az,bx,by,bz,w,o){
 o=o||{};const bw=w==null?1.15:w,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<.2)return;
 const yaw=Math.atan2(dx,dz),px=Math.cos(yaw),pz=-Math.sin(yaw);
 const iwCol=P('ironwood'),pkCol=P('planks');
 ynNoCut(()=>{
  /* twin side stringers + recessed plank deck (posts & planks separated cleanly so zero coplanar faces) */
  for(const s of [-1,1]){
   const sx=s*(bw/2-.05);
   beam('ironwood',[ax+px*sx,ay-.14,az+pz*sx],[bx+px*sx,by-.14,bz+pz*sx],.09,iwCol,false,undefined,.16);
   beam('ironwood',[ax+px*sx,ay+.92,az+pz*sx],[bx+px*sx,by+.92,bz+pz*sx],.055,iwCol);
   for(const t of [.08,.5,.92]){
    const qx=lerp(ax,bx,t)+px*sx,qy=lerp(ay,by,t),qz=lerp(az,bz,t)+pz*sx;
    box('ironwood',qx,qy-.045,qz,.056,.93,.056,iwCol,yaw);
   }
  }
  const nPl=Math.max(3,Math.round(L/.36));
  svNoWalk(()=>{
   for(let i=0;i<nPl;i++){
    const t=(i+.5)/nPl;
    box('planks',lerp(ax,bx,t),lerp(ay,by,t)-.06,lerp(az,bz,t),bw-.24,.055,L/nPl-.025,pkCol,yaw);
   }
  });
  svStripWalk([ax,ay,az],[bx,by,bz],bw*.85);
 });
}

function ynFlyingBridge(ax,ay,az,bx,by,bz,w,o){
 o=o||{};const bw=w==null?1.45:w;
 ynGangplank(ax,ay,az,bx,by,bz,bw,o);
 const dx=bx-ax,dz=bz-az,yaw=Math.atan2(dx,dz),px=Math.cos(yaw),pz=-Math.sin(yaw);
 const iwCol=P('ironwood'),bzCol=P('bronze');
 ynNoCut(()=>{
  /* sloped slate/verdigris rain-canopy roof carried on ironwood stanchions over the flying bridge */
  const rh=o.roofH==null?2.35:o.roofH,mk=o.roofMk||'slate',col=o.roofCol==null?P(mk==='verdigris'?'verdigris':'slate'):o.roofCol;
  for(const s of [-1,1])for(const t of [.12,.5,.88]){
   const sx=s*(bw/2-.05),qx=lerp(ax,bx,t)+px*sx,qy=lerp(ay,by,t)+.955,qz=lerp(az,bz,t)+pz*sx;
   cyl('ironwood',qx,qy,qz,.038,rh-.98,iwCol,6);
  }
  /* pitched two-slope rain hood along the bridge */
  for(const s of [-1,1]){
   const e0=[ax+px*s*(bw*.72),ay+rh-.18,az+pz*s*(bw*.72)],e1=[bx+px*s*(bw*.72),by+rh-.18,bz+pz*s*(bw*.72)];
   const r0=[ax+px*s*.04,ay+rh+.28,az+pz*s*.04],r1=[bx+px*s*.04,by+rh+.28,bz+pz*s*.04];
   plane4(mk,r0,r1,e0,.05,col);
  }
  beam('bronze',[ax,ay+rh+.32,az],[bx,by+rh+.32,bz],.06,bzCol);
  /* optional stone arch rib underneath when spanning a cleft (o.arch) */
  if(o.arch){
   const na=8,archDrop=o.archDrop==null?1.8:o.archDrop,archCol=P('ashlar');
   svNoWalk(()=>{
    for(let i=0;i<na;i++){
     const t0=(i+.06)/na,t1=(i+.94)/na;
     const p0=[lerp(ax,bx,t0),lerp(ay,by,t0)-.26-archDrop*(1-Math.sin(t0*PI)),lerp(az,bz,t0)];
     const p1=[lerp(ax,bx,t1),lerp(ay,by,t1)-.26-archDrop*(1-Math.sin(t1*PI)),lerp(az,bz,t1)];
     beam('ashlar',p0,p1,bw*.74,archCol,false,undefined,.26);
    }
   });
  }
 });
}
