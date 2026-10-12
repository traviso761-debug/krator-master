 // ============================================================ THE RUIN, ON THE MASS
 if(dd){
  // ---- THE SPALL, and a real interior behind it -----------------------------
  // Four types in this kit have attempted a cutaway and failed for one reason: a
  // section needs deep solid fabric and a shell has none. This mass is 1 000 m
  // through, so the fabric is there — but only if it is MODELLED. What goes in
  // behind the bite is a liner 120 m back, fifteen floor plates spanning the gap,
  // a dark soffit under every one of them, partition fins and two service cores,
  // and the liner is cut by the SAME predicate as the face so the two agree.
  const LQ=120;
  MAS.push(gridSurface((u,v)=>{const x=lerp(SPX-SPW*1.1,SPX+SPW*1.1,u),
     t=lerp(SPT-SPTH*1.1,SPT+SPTH*1.1,v),p=ZY(RD-LQ,t);
    return[x,p[1],p[0]];},34,34,{uS:SPW*2.2/25.6,vS:SPTH*2.2*2*Math.SQRT2*RD/TILE,
    hole:(u,v)=>!spall(lerp(SPX-SPW*1.1,SPX+SPW*1.1,u),lerp(SPT-SPTH*1.1,SPT+SPTH*1.1,v),1)}));
  const spY0=CY+RD*(1-2*(SPT+SPTH)),spY1=CY+RD*(1-2*(SPT-SPTH));
  for(let y=spY0+10;y<spY1-8;y+=22){const t=TOFY(y),et=(t-SPT)/SPTH;
   const hw=SPW*Math.sqrt(Math.max(0,1-et*et));
   const zF=RD-(y-CY),zL=zF-LQ;
   for(let x=SPX-hw+12;x<SPX+hw-11;x+=24){
    if(!spall(x,t,1))continue;
    kput('acBox',[x,y,(zF+zL)*.5],null,[24,1.6,LQ*.92],new THREE.Color(0xb6ac9a));
    kput('acDim',[x,y-1.4,(zF+zL)*.5],null,[23,1.8,LQ*.9],null);
    if(Math.round(x/24)%3===0)kput('acDim',[x,y+11,(zF+zL)*.5],null,[1.8,22,LQ*.86],null);}}
  for(const cxz of [-56,58]){
   kput('acBox',[SPX+cxz,(spY0+spY1)*.5,RD-((spY0+spY1)*.5-CY)-LQ*.5],null,
    [18,spY1-spY0-20,20],new THREE.Color(0x8e8474));}
  // what came off it: a smear down the face below the bite
  for(let j=0;j<160;j++){const t=SPT+SPTH+rr(.01,.30),x=SPX+rr(-1,1)*SPW*1.1;
   if(t>.5||gone(x,t,1))continue;const p=ZY(RD,t);
   kput('rubble',[x,p[1]+rr(0,5),p[0]+rr(1,9)],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(2,9),rr(1.4,6),rr(2,9)],new THREE.Color().setHSL(rr(.05,.10),rr(.08,.26),rr(.12,.26)));}

  // ---- THE BROKEN CORNER ------------------------------------------------------
  // The failure that changes the outline. With the south-east pier gone the
  // south vertex of the east end had nothing under it, and a wedge of city up to
  // 365 m deep sheared off along the whole eastern half of the south flank. The
  // fracture is one surface swept round the vertex line by the same BRr() the
  // faces were holed with, so it meets them exactly; a lip 2 m under each face
  // closes the saw-tooth the 10 m face grid leaves along the break; and the
  // The fracture is STEPPED, a riser and a ledge to every 16 m storey: a smooth
  // swept surface came back as a carved scoop, and what a torn building shows is
  // its floors. Each storey's riser stands where BRr() puts the break at that
  // storey's mid-height — the exposed rooms, on the interior wall map — and the
  // slab between two storeys joins them: a soffit above the equator, where each
  // floor overhangs the one below, a deck under it, where each steps out further.
  const fracZ=(x,y)=>{const dy=y-CY;let r=BRr(x,0);if(Math.abs(dy)>=r*Math.SQRT1_2)return null;
   for(let i=0;i<3;i++){const ph=Math.asin(clamp(dy/r,-1,1));r=BRr(x,ph);if(Math.abs(dy)>=r*Math.SQRT1_2)return null;}
   return RD-Math.sqrt(r*r-dy*dy);};
  const FLH=16,BNU=110;
  for(let k=Math.floor((CY-BRMAX)/FLH);k<=Math.ceil((CY+BRMAX)/FLH);k++){const ya=k*FLH,yb=ya+FLH,ym=ya+FLH*.5,yn=yb+FLH*.5;
   BRK.push(gridSurface((u,v)=>{const x=lerp(Math.max(BX0,-HX),HX,u),z=fracZ(x,ym);
     return[x,lerp(ya,yb,v),z===null?RD-Math.abs(ym-CY):z];},BNU,1,
    {uS:(HX-BX0)/25.6,vS:FLH/25.6,hole:(u,v)=>fracZ(lerp(Math.max(BX0,-HX),HX,u),ym)===null}));
   (yb>CY?SHD:DEK).push(gridSurface((u,v)=>{const x=lerp(Math.max(BX0,-HX),HX,u);
     const za=fracZ(x,ym),zb=fracZ(x,yn),ze=RD-Math.abs(yb-CY);
     return[x,yb,lerp(za===null?ze:za,zb===null?ze:zb,v)];},BNU,1,
    {uS:(HX-BX0)/25.6,vS:1,hole:(u,v)=>{const x=lerp(Math.max(BX0,-HX),HX,u);return fracZ(x,ym)===null&&fracZ(x,yn)===null;}}));}
  for(const sg of [1,-1])BRK.push(gridSurface((u,v)=>{const x=lerp(Math.max(BX0,-HX),HX,u),ph=sg*Math.PI/4,r=BRr(x,ph)+v*22;
    return[x,CY+r*Math.sin(ph)-1.6,RD-r*Math.cos(ph)-1.6];},96,2,{uS:(HX-BX0)/25.6,vS:1}));
  // and the slabs themselves, torn off at random lengths past the riser
  for(let x=BX0+30;x<HX-6;x+=22)for(let y=Math.ceil((CY-BRMAX)/FLH)*FLH;y<CY+BRMAX;y+=FLH){
   const zf=fracZ(x,y-FLH*.5),zg=fracZ(x,y+FLH*.5);if(zf===null&&zg===null)continue;
   const z0=Math.max(zf===null?-1e9:zf,zg===null?-1e9:zg);
   const zenv=RD-Math.abs(y-CY)-3,L=Math.min(zenv-z0,rr(3,26));
   if(L<3||rng()<.25)continue;
   const zc=z0+L*.5-1;
   kput('acBox',[x+rr(-3,3),y,zc],null,[rr(12,22),1.8,L+2],new THREE.Color().setHSL(rr(.07,.10),rr(.06,.14),rr(.40,.56)));
   if(rng()<.3)kput('acDim',[x+rr(-8,8),y+8,z0+rr(-4,0)],null,[1.4,14,rr(6,14)],null);
   if(rng()<.08)kput('acBox',[x+rr(-8,8),y-rr(4,12),z0+L+rr(0,6)],qEuler(rr(-.9,.9),0,rr(-.5,.5)),
     [rr(10,22),1.6,rr(8,18)],new THREE.Color(0x9a9080));}

  // ---- overgrowth and staining on the faces -------------------------------------
  for(const sd of [1,-1]){
   for(let j=0;j<260;j++){const t=rr(TA+.02,.48),x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd)||inFrieze(t))continue;
    const p=ZY(RD,t),s2=rr(1.6,6);
    kput('moss',[x,p[1]+s2*.2,sd*p[0]],qEuler(0,rng()*TAU,0),[s2*rr(1,1.7),s2*rr(.24,.44),s2*rr(1,1.7)],
     new THREE.Color().setHSL(rr(.22,.32),rr(.3,.5),rr(.05,.12)));}
   for(let j=0;j<110;j++){const s=Math.floor(rng()*24)*TILE*4+2*TILE,t=s/(2*Math.SQRT2*RD);
    if(t>TK-.02||inFrieze(t))continue;const x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd))continue;
    const p=ZY(RD-12,t);
    kput('vine',[x,p[1],sd*p[0]],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
     [rr(1,2.2),rr(10,44),rr(1,2.2)],null);}
   // stainsFromLedge() aims its streaks radially off the world origin, which on
   // a rectilinear plan lays them flat across the faces. Per bay, off the face's
   // own normal, the direction is already to hand.
   for(let j=0;j<150;j++){const t=rr(TA+.03,.46),x=rr(-HX+10,HX-10);
    if(inWell(x,t)||gone(x,t,sd))continue;
    const p=ZY(RD,t),n=RAD(t,sd),L=rr(8,34);
    kput('stain',[x,p[1]-L*.4+n[1]*1.4,sd*p[0]+n[2]*1.4],qFacing([0,n[1],n[2]]),[rr(3,9),L,1],null);}}}
 endGroupXF();

 // ============================================================ VERTICAL STRUCTURE
 // THE PIERS. Thirteen inhabited blocks, 104 m by 180 m, in the grid the two
 // elevations imply: three rows seen from the ends, five stations seen from the
 // side. Each is mitred into the face above it by lowY(), which solves the
 // SETTLED mass's lower face at that point, so in the ruin a pier's head follows
 // the cube down instead of floating under it or punching through. At the foot
 // of every face an arched portal, which is how the sheet draws them standing on
 // the ground; above it belt courses every 96 m, lit at night, on the slotted
 // wall of the piers' own map.
 const pierFace=(L,f,topAt)=>{const cs=[[-1,-1],[1,-1],[1,1],[-1,1]],a=cs[f],b=cs[(f+1)%4];
  const len=f%2?2*L.hz:2*L.hx;
  return uvWorldY(gridSurface((u,v)=>{const x=L.x+lerp(a[0],b[0],u)*L.hx,z=L.z+lerp(a[1],b[1],u)*L.hz;
    return[x,topAt(x,z)*v,z];},f%2?6:4,9,{uS:len/32,vS:1}),32);};
 for(const L of PIERS){
  const failed=dd&&L.x===FAILX&&L.z===FAILZ;
  const topAt=(x,z)=>failed?FAILH+16*(fbm(x*.05,z*.05,9619,2)-.5)*2:lowY(x,z)+3;
  for(let f=0;f<4;f++)PIRG.push(pierFace(L,f,topAt));
  if(!failed)DEKG.push(gridSurface((u,v)=>{const x=L.x+(u-.5)*2*L.hx,z=L.z+(v-.5)*2*L.hz;
    return[x,topAt(x,z),z];},4,6,{uS:3,vS:5}));
  const yMin=Math.min(topAt(L.x-L.hx,L.z-L.hz),topAt(L.x+L.hx,L.z-L.hz),topAt(L.x-L.hx,L.z+L.hz),topAt(L.x+L.hx,L.z+L.hz));
  // the stepped foot
  kput('acBox',[L.x,5,L.z],null,[2*L.hx+34,10,2*L.hz+34],stone());
  kput('acBox',[L.x,13,L.z],null,[2*L.hx+16,6,2*L.hz+16],stone());
  // the portals, one to each face
  for(let f=0;f<4;f++){const nx=f===1?1:f===3?-1:0,nz=f===0?-1:f===2?1:0;
   const wide=f%2?1:0,sw=wide?9.4:7.2,sh=wide?8.6:7.6;
   const px=L.x+nx*(L.hx+1.4),pz=L.z+nz*(L.hz+1.4);
   kput('acArch',[px,16+sh*4.5,pz],qFacing([nx,0,nz]),[sw,sh,2.2],null);
   if(!dd)kput('acPane',[px-nx*.2,16+sh*2.2,pz-nz*.2],qFacing([nx,0,nz]),[sw*3.4,sh*2.6,1],WARMW.clone().multiplyScalar(.55));
   kput('acBox',[px+nx*.6,16+sh*9+4,pz+nz*.6],qFacing([nx,0,nz]),[sw*6+10,6,2.4],stone());}
  // belt courses and the corner quoins
  for(let y=110;y<yMin-24;y+=96){
   kput('acBox',[L.x,y,L.z],null,[2*L.hx+4,5,2*L.hz+4],stone());
   if(!dd||rng()<.1)kput('strip',[L.x,y+5.2,L.z],null,[2*L.hx+3,12,(2*L.hz+3)/.18],dd?WARMW.clone().multiplyScalar(.12):CYAN);}
  if(!failed)for(const cx of [-1,1])for(const cz of [-1,1])
   beam('acBox',[L.x+cx*(L.hx+.6),16,L.z+cz*(L.hz+.6)],[L.x+cx*(L.hx+.6),topAt(L.x+cx*L.hx,L.z+cz*L.hz)-2,L.z+cz*(L.hz+.6)],5,5,stone());
  // people at the portals, and trees in the courts between the piers
  if(!dd)for(let j=0;j<14;j++){const f=Math.floor(rng()*4),nx=f===1?1:f===3?-1:0,nz=f===0?-1:f===2?1:0;
   person(L.x+nx*(L.hx+rr(20,60))+(nz?rr(-30,30):0),.7,L.z+nz*(L.hz+rr(20,60))+(nx?rr(-40,40):0));}
  if(failed){
   // the stump, laid open at the break
   for(let f2=0;f2<6;f2++){const y=FAILH-50+f2*9;
    kput('acBox',[L.x,y,L.z],null,[2*L.hx-6,1.8,2*L.hz-6],new THREE.Color(0xb6ac9a));
    kput('acDim',[L.x,y-1.5,L.z],null,[2*L.hx-8,1.6,2*L.hz-8],null);}}}
 // skybridges between the piers of each outer row, 150 m up, lit in the intact city
 for(const sz of [-1,1])for(const px of [-315,-105,105,315]){if((dd&&rng()<.5)||(dd&&sz>0&&px===315))continue;
  const y=150;beam('acBox',[px-52,y,sz*PRZ],[px+52,y,sz*PRZ],7,14,stone());
  if(!dd)kput('acPane',[px,y+3,sz*(PRZ+7.4)],qFacing([0,0,sz]),[104,2.6,1],CYAN);}

 // ============================================================ THE GROUND WORKS
 // The whole 1 000 x 1 414 m footprint is under a mass that casts no shadow, so
 // it is PAINTED into shade: the apron under the cube is on the dark material and
 // the paving outside it is not, and the line between them is the building's own
 // plan drawn on the ground.
 SHDG.push(gridSurface((u,v)=>[lerp(-HX-40,HX+40,u),.35,lerp(-RD-40,RD+40,v)],26,30,{uS:14,vS:18}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(1,1.9,v)*760*(1+.06*fbm(u*7,1.3,9617,2));
   return[Math.cos(th)*r*.78,.15,Math.sin(th)*r];},64,5,{uS:60,vS:10}));
 for(let j=0;j<22;j++){const a=j/22*TAU;
  kput('acBox',[Math.cos(a)*700,1.2,Math.sin(a)*860],qEuler(0,-a,0),[46,2.4,14],deck());}
 // the arrival plaza at the west end, on the axis of the city centre
 for(let s2=0;s2<3;s2++)GRD.push(gridSurface((u,v)=>
   [lerp(-1080+s2*40,-HX-30,u),.6+s2*1.1,lerp(-260+s2*44,260-s2*44,v)],10,10,{uS:24,vS:24}));
 for(let j=0;j<16;j++){const px=-1040+j*36;
  for(const sz of [-1,1]){kput('acCol',[px,23,sz*236],null,[4.6,46,4.6],stone());
   kput('acBox',[px,47.5,sz*236],null,[12,5,12],stone());
   if(!dd&&j%2===0)kput('strip',[px,44,sz*236],null,[12,9,9],CYAN);}}
 {const GX2=-HX-70;
  for(const sz of [-1,1])kput('acBox',[GX2,42,sz*104],null,[26,84,30],stone());
  kput('acBox',[GX2,90,0],qEuler(0,Math.PI/2,0),[236,14,32],stone());
  if(!dd)kput('strip',[GX2,80,0],qEuler(0,Math.PI/2,0),[190,12,12],CYAN);
  for(let j=0;j<7;j++)kput('acArch',[GX2-14,34,-96+j*32],qFacing([-1,0,0]),[3.4,3.2,3],null);}
 for(let j=0;j<(dd?70:120);j++){const px=rr(-1060,-HX-40),pz=rr(-250,250);
  if(rng()<.4)plant(px,.7,pz,rr(9,17));else person(px,.7,pz);}
 // the courts between the piers: planted in the intact city, so the ground under
 // a kilometre of overhang is a place and not a car park
 for(let j=0;j<(dd?40:160);j++){const x=rr(-470,470),z=rr(-640,640);
  if(PIERS.some(L=>Math.abs(x-L.x)<L.hx+22&&Math.abs(z-L.z)<L.hz+22))continue;
  if(rng()<.6)plant(x,.4,z,rr(7,14));else person(x,.5,z);}

 // ============================================================ THE RUIN, ON THE GROUND
 if(dd){
  rubbleRing(SPX,.4,RD+70,30,290,150,7);
  // ---- the pier that failed ---------------------------------------------------
  // Four pieces of a 104 x 180 m pier lying south-east across the plain where it
  // went over, each on its side and turned a little, with the floors of the
  // shaft showing in every broken end.
  {const BX=530,BZ=750;
   for(let s2=0;s2<3;s2++){const cx=BX+s2*150*.79+s2*18,cz=BZ+s2*150*.62+s2*8;
    const L2=rr(118,138),yaw=-.66+rr(-.22,.22),Y0=PHX*.78;
    const q=qEuler(0,yaw,Math.PI/2).multiply(qEuler(0,rr(-.35,.35),0)).multiply(qEuler(0,0,rr(-.12,.12)));
    acShardGeo(2*PHX,L2,2*PHZ*.9,32,q,[cx,null,cz],PIRG,true,3);}
   rubbleRing(BX+220,2,BZ+170,30,330,170,11);
   for(let j=0;j<60;j++){const sz=rr(4,16);kput('rubble',[BX+rr(-110,480),sz*.3,BZ+rr(-110,420)],
     qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(1,2),sz*rr(.4,.8),sz*rr(1,1.8)],new THREE.Color().setHSL(rr(.07,.1),rr(.05,.12),rr(.3,.45)));}}
  // ---- what came off the corner -----------------------------------------------
  // The wedge came down under its own vertex: a field of great tilted blocks of
  // stacked floors south of the east half, the biggest 120 m across, and a fan
  // of rubble spilling out from under them.
  for(let j=0;j<26;j++){const x=rr(-470,540),z=rr(500,880)+(x<0?rr(-40,60):0),s=rr(40,125)*(j<8?1:.6);
   const q=qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),h=s*rr(.35,.6);
   const sz=s*rr(.6,1);
   acShardGeo(s,h,sz,25.6,q,[x,null,z],MASG,false,h*.14);}
  rubbleRing(260,.4,860,20,330,260,12);
  // ---- the heliport tower, across the plain -----------------------------------
  // It snapped where it left the upper north face, 1 080 m up, went over to the
  // north-west, and lies in three pieces 700 m out from the cube, its corbelled
  // crown upside down at the far end. The tallest thing on the plain now is a
  // tower lying on its side.
  {const hx=PHX,hz=PHZ,ang=-.28;
   const dx=Math.sin(ang),dz=-Math.cos(ang);
   let d0=720;
   for(let s2=0;s2<3;s2++){const L2=[92,80,70][s2],cx=HTX+dx*(d0+L2*.5),cz=dz*(d0+L2*.5);
    // a tower lying down: its long axis along the fall line, its 180 m section
    // standing 104 m tall on the plain
    const qq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-ang)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2))
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),rr(-.3,.3)));
    acShardGeo(2*hz,L2,2*hx,32,qq,[cx,null,cz],PIRG,true,4);
    d0+=L2+rr(18,40);}
   const cx=HTX+dx*(d0+30),cz=dz*(d0+30);
   acShardGeo(2*hx+30,26,2*hz+30,25.6,qEuler(Math.PI+.2,-ang,.1),[cx,null,cz],MASG,false,5);
   rubbleRing(HTX+dx*(d0-60),.4,dz*(d0-60),10,220,160,9);
   for(let j=0;j<40;j++){const f=rr(.1,1.1),sz=rr(3,12);
    kput('rubble',[HTX+dx*(700+f*300)+rr(-90,90),sz*.3,dz*(700+f*300)+rr(-90,90)],
     qEuler(rng()*3,rng()*3,rng()*3),[sz*rr(1,2),sz*rr(.4,.8),sz*rr(1,1.8)],new THREE.Color().setHSL(rr(.07,.1),rr(.05,.12),rr(.3,.45)));}}
  for(let j=0;j<120;j++){const x=rr(-HX,HX),z=rr(-RD,RD);
   if(rng()<.5)plant(x,.4,z,rr(6,15));}
  rubbleRing(0,.4,0,760,1020,220,8);
  trees(0,0,820,1500,90);}
 else trees(0,0,860,1500,50);

 // ---- the covered surface, measured -------------------------------------------
 // The sheet says 140 ha. A 1 km cube on its diagonal projects 1 000 x 1 414 m,
 // so this ought to come out at 141.4 — but the legs stand outside nothing and
 // the plaza is not the arcology, so it is integrated over the actual plan of the
 // mass on a 4 m lattice rather than multiplied out.
 let ACAR=0;
 for(let ax=-HX-6;ax<HX+6;ax+=4)for(let az=-RD-6;az<RD+6;az+=4)
  if(Math.abs(ax)<=HX&&Math.abs(az)<=RD)ACAR+=16;

 // ---- what the presets are derived from ----------------------------------------
 const PLIST=PIERS.map(L=>({x:L.x,z:L.z,w:L.hx,hx:L.hx,hz:L.hz,c:L.c,
  failed:!!(dd&&L.x===FAILX&&L.z===FAILZ),top:lowY(L.x,L.z)}));
 ARC_SITE[d]={x:gx,z:gz,d:d,dd:dd,SIDE:ACSIDE,RD:RD,HT:HTT,KY:KY,CY:CY,HX:HX,
  BR:BR.slice(),DPX:DPX.slice(),APY:APY,KEY:KEY,VX:VX,NWL:NWL,WWX:WWX,WDEP:WDEP,WQ:WQ,
  WT0:WT0,WT1:WT1,TA:TA,TK:TK,LEGY:LEGY,area:ACAR,FTA:FTA,FTE:FTE,FTD:FTD,
  WX:k=>-420+k*140,ZY:(q,t)=>ZY(q,t),TOFY:y=>TOFY(y),
  SP:{x:SPX,w:SPW,t:SPT,th:SPTH,y0:CY+RD*(1-2*(SPT+SPTH)),y1:CY+RD*(1-2*(SPT-SPTH))},
  TWR:{x:HTX,z:HTZ,hx:PHX,hz:PHZ,top:HTTOP,deck:HTTOP+33},
  BITE:{x0:BX0,r:BRMAX},FALL:{x:FAILX,z:FAILZ,h:FAILH},SAG:BSAG,
  PIER:PLIST,LEG:PLIST};

 // ---- merge ---------------------------------------------------------------------
 // The mass and everything on it goes into P, which in the ruin is the settled
 // frame; the piers and the plain stay in G.
 meshMerged(RES,resM,P);
 meshMerged(WRK,wrkM,P);
 meshMerged(LAT,latM,P);
 meshMerged(BND,bndM,P);
 meshMerged(FRM,frmM,P);
 meshMerged(MAS,masM,P);
 meshMerged(DEK,dekM,P);
 meshMerged(SHD,shdM,P);
 meshMerged(BRK,MAT.acBreak,P);
 meshMerged(TWR,pirM,P);
 meshMerged(PIRG,pirM,G);
 meshMerged(MASG,masM,G);
 meshMerged(DEKG,dekM,G);
 meshMerged(SHDG,shdM,G);
 meshMerged(BRKG,MAT.acBreak,G);
 meshMerged(GRD,pavM,G);
 KOFF=[0,0,0];return G;}
