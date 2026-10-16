 // ============================================================ THE LIGHT WELLS
 // Seven slots, 40 m wide and 55 m deep, running over the equator fold from
 // t = .036 to t = .964 — 1 857 m of surface, which in the SIDE elevation is a
 // vertical slot 1 314 m tall. The floor of a slot is the diamond of L1 radius
 // 629.2: offsetting a 90-degree fold inward by 55 m moves its apex by 55*sqrt(2),
 // so the recess is the same diamond, shrunk, and the slot turns the corner at
 // the equator without a seam.
 //
 // Parameterised (u = depth, v = t) rather than the other way round, because a
 // line of constant t is a line of constant HEIGHT: that way the wall texture's
 // storey lines come out horizontal on the side walls of the slot instead of
 // running diagonally down it.
 const wellArc=ARCL(RD,WT1-WT0);
 for(let k=0;k<NWL;k++){if(k===SPINEK)continue;const xc=WX(k);
  for(const sd of [1,-1]){
   // the two side walls
   for(const sx of [-1,1]){
    const xw=xc+sx*WWX*.5;
    WRK.push(gridSurface((u,v)=>{const t=lerp(WT0,WT1,v),q=lerp(RD,WQ,u),p=ZY(q,t);
      return[xw,p[1],sd*p[0]];},5,96,{uS:WDEP/25.6,vS:wellArc/TILE,
     hole:(u,v)=>{const t=lerp(WT0,WT1,v),p=ZY(lerp(RD,WQ,u),t);return (rot(ARCL(RD,t),CY+RD*(1-2*t))&&u<.5)||biteP(xw,p[1],sd*p[0]);}}));}
   // the floor, and the two ends where the slot stops short of ridge and keel
   SHD.push(gridSurface((u,v)=>{const t=lerp(WT0,WT1,v),p=ZY(WQ,t);
     return[lerp(xc-WWX*.5,xc+WWX*.5,u),p[1],sd*p[0]];},3,96,{uS:WWX/12,vS:wellArc/12,hole:(u,v)=>{const p=ZY(WQ,lerp(WT0,WT1,v));return biteP(lerp(xc-WWX*.5,xc+WWX*.5,u),p[1],sd*p[0]);}}));
   for(const te of [WT0,WT1]){
    SHD.push(gridSurface((u,v)=>{const q=lerp(RD,WQ,v),p=ZY(q,te);
      return[lerp(xc-WWX*.5,xc+WWX*.5,u),p[1],sd*p[0]];},3,3,{uS:WWX/10,vS:WDEP/10}));}
   // galleries down both side walls, a bridge across every eighth, and the
   // strips that make a 55 m slot read as a slot rather than as a dark stripe
   for(let j=0;j<74;j++){const t=lerp(WT0,WT1,(j+.5)/74),p=ZY(RD,t),pf=ZY(WQ,t);
    const y=p[1],zO=sd*p[0],zF=sd*pf[0],yF=pf[1];
    if((dd&&rng()<.3)||biteP(xc,(y+yF)*.5,(zO+zF)*.5)||biteP(xc,y,zO))continue;
    for(const sx of [-1,1]){
     kput('acBox',[xc+sx*(WWX*.5-2.2),(y+yF)*.5,(zO+zF)*.5],null,[3.4,2.6,Math.abs(zO-zF)+2],deck());
     if(!dd&&j%2===0)kput('strip',[xc+sx*(WWX*.5-4.4),(y+yF)*.5+2,(zO+zF)*.5],
       QX(RAD(t,sd)),[WDEP*.8,13,13],CYAN);
     for(let w2=0;w2<5;w2++){const f=(w2+.5)/5;
      kput('acPane',[xc+sx*(WWX*.5-.6),lerp(y,yF,f)+1.2,lerp(zO,zF,f)],
       qFacing([-sx,0,0]),[8.6,3.4,1],winC(.42));}}
    if(j%8===4)kput('acBox',[xc,(y+yF)*.5-3,(zO+zF)*.5],null,[WWX-5,2.2,Math.abs(zO-zF)*.7],stone());
    // and the street in the bottom of it
    {const nf=RAD(t,sd),fx=xc+rr(-13,13),fy=yF+nf[1]*1.2,fz=zF+nf[2]*1.2;
     const r3=rng();
     if(r3<.30)kput('acBox',[fx,fy+4,fz],qFacing([0,nf[1],nf[2]]),[rr(7,15),9,rr(6,11)],stone());
     else if(r3<.58)plant(fx,fy,fz,rr(6,12));
     else if(r3<.72)kput('acBox',[fx,fy+.9,fz],qFacing([0,nf[1],nf[2]]),[rr(8,17),2,rr(4,8)],deck());
     else person(fx,fy,fz);}}
  }}

 // ============================================================ THE FRONT ELEVATION
 // Two craters, one at each end, 86 m deep in a mass 1 000 m through. Four
 // concentric diamond annuli at four depths, the step between each pair painted
 // shade, and on every boundary a ring of architecture AND a ring of light.
 //
 // THE FRAMES AND THE GRADIENT (the pass that was paused). Soleri's elevation is
 // not four equal bands: it is a broad WHITE FRAME on the outline, a hatched band,
 // a second white frame, and then a dark interior round a bright hole. So the
 // outer 59 m of band 0 and the outer 54 m of band 1 are plain frame concrete, a
 // step brighter than any wall, and the walls inside them darken band by band —
 // lattice, tinted dwelling grid, cultural centre deck, city centre shade — to
 // the void. With the rings of light on every boundary that is the drawing.
 const ringN=q=>Math.max(10,Math.round(2*Math.SQRT2*q/26));
 const FRQ=[648,506,0,0];
 const BANDL=[LAT,BND,DEK,SHD];
 for(const ex of [-1,1]){
  for(let i=0;i<4;i++){const xf=ex*(HX-DPX[i]),q0=BR[i],q1=BR[i+1];
   const parts=FRQ[i]?[[q0,FRQ[i],FRM],[FRQ[i],q1,BANDL[i]]]:[[q0,q1,BANDL[i]]];
   for(const sd of [1,-1]){
    // the band's own face. Its parameterisation is (perimeter, radius) and its
    // texture is therefore the square lattice — see the note at the head of the
    // file for why no other mapping is available on a diamond annulus.
    for(const pr of parts){const qa=pr[0],qb=pr[1],nvv=Math.max(2,Math.round((qa-qb)/22));
     pr[2].push(gridSurface((u,v)=>{const p=ZY(lerp(qa,qb,v),u);
       return[xf,p[1],sd*p[0]];},i<2?104:72,nvv,
      {uS:2*Math.SQRT2*(qa+qb)*.5/25.6,vS:(qa-qb)/Math.SQRT2/25.6,
       hole:(u,v)=>{const q=lerp(qa,qb,v),p=ZY(q,u);
        return (dd&&rot(2*Math.SQRT2*q*u,p[1]))||biteP(xf,p[1],sd*p[0]);}}));}
    // the step back to the next band, painted shade
    if(i<3){const xn=ex*(HX-DPX[i+1]);
     SHD.push(gridSurface((u,v)=>{const p=ZY(q1,u);
      return[lerp(xf,xn,v),p[1],sd*p[0]];},72,2,
     {uS:2*Math.SQRT2*q1/14,vS:(DPX[i+1]-DPX[i])/14,
      hole:(u,v)=>{const p=ZY(q1,u);return biteP(lerp(xf,xn,v),p[1],sd*p[0]);}}));}}
   // ---- the boundary ring: cornice, lights, and one piece of architecture ----
   // The light is a 13 m band laid on the face, not a tube: at 1 600 m it is
   // eight pixels and the rings are the whole drawing, so they have to be seen.
   const n=ringN(q1),xr=ex*(HX-DPX[i]+3.5);
   for(const sd of [1,-1])for(let j=0;j<n;j++){
    const ta=j/n,tb=(j+1)/n,tm=(j+.5)/n;
    const pa=ZY(q1,ta),pb=ZY(q1,tb),pm=ZY(q1,tm);
    if((dd&&rng()<.3)||biteP(xr,pm[1],sd*pm[0]))continue;
    beam('acBox',[xr,pa[1],sd*pa[0]],[xr,pb[1],sd*pb[0]],7,7,stone());
    if(!dd)kput('acPane',[ex*(HX-DPX[i]+8),pm[1],sd*pm[0]],QB(tm,sd,ex),
      [2*Math.SQRT2*q1/n*1.02,13,1],CYAN);
    // the CULTURAL CENTER is a colonnade: a ring of deep arches all the way
    // round the diamond, which is the one feature of this elevation that reads
    // head-on with no shadow to help it, because it is a ring of black holes.
    if(i===2)kput('acArch',[ex*(HX-DPX[2]+1),pm[1],sd*pm[0]],qFacing([ex,0,0]),
      [3.2,3.0,2.2],null);
    // and the CITY CENTER boundary carries a ring of halls standing out of the face
    if(i===3){const hh=rr(11,19);
     kput('acBox',[ex*(HX-DPX[3]+hh*.5),pm[1],sd*pm[0]],QB(tm,sd,ex),[2*Math.SQRT2*q1/n*1.5,46,hh],stone());
     kput('acPane',[ex*(HX-DPX[3]+hh+.4),pm[1],sd*pm[0]],QB(tm,sd,ex),[2*Math.SQRT2*q1/n*1.1,22,1],winC(.8));}}
   // and the frame's own inner arris, a light line where frame meets wall
   if(FRQ[i]&&!dd){const nf=ringN(FRQ[i]);
    for(const sd of [1,-1])for(let j=0;j<nf;j++){const tm=(j+.5)/nf,pm=ZY(FRQ[i],tm);
     kput('acPane',[ex*(HX-DPX[i]+1.2),pm[1],sd*pm[0]],QB(tm,sd,ex),[2*Math.SQRT2*FRQ[i]/nf*1.02,5,1],CYAN);}}
   // ---- true horizontal rows of windows on the band ------------------------
   // The lattice texture has no up. These do: walk world height, solve the
   // annulus for |z| at that height, and lay a row of panes along it. The frames
   // are blind, so the rows start inside them.
   const qo=FRQ[i]||q0;
   for(let y=CY-qo+10;y<CY+qo-9;y+=12){const dy=Math.abs(y-CY);
    const z0=Math.max(0,q1-dy),z1=Math.max(0,qo-dy);
    if(z1-z0<9)continue;
    for(const sd of [1,-1])for(let zz=z0+4;zz<z1-3;zz+=9.5){
     if((dd&&rng()<.38)||biteP(ex*(HX-DPX[i]),y,sd*zz))continue;
     kput('acPane',[ex*(HX-DPX[i]+.5),y,sd*zz],qFacing([ex,0,0]),[6.2,3.2,1],winC(.34));}}}
  // ---- the rim of the void ---------------------------------------------------
  for(const sd of [1,-1]){const n=ringN(BR[4]);
   for(let j=0;j<n;j++){const tm=(j+.5)/n,pm=ZY(BR[4],tm);
    kput('acBox',[ex*(HX-DPX[3]+7),pm[1],sd*pm[0]],QX(TAN(tm,sd)),
     [2*Math.SQRT2*BR[4]/n*1.04,15,15],new THREE.Color(dd?0x8a8272:0xf4eee2));}}}

 // ============================================================ THE VOID
 // A diamond bore 304 m across driven the whole 828 m through the middle of the
 // city, open at both ends. Its ceiling is the one true soffit in the model and
 // is painted black; its floor is a V stepped into eight terraces, which makes
 // the heart of a 1 km cube an amphitheatre 304 m wide and 828 m long.
 const VX=HX-DPX[3];
 for(const sd of [1,-1]){
  SHD.push(gridSurface((u,v)=>{const t=lerp(0,.5,v),p=ZY(BR[4],t);
    return[lerp(-VX,VX,u),p[1],sd*p[0]];},40,10,{uS:2*VX/14,vS:2*Math.SQRT2*BR[4]*.5/14}));
  DEK.push(gridSurface((u,v)=>{const t=lerp(.5,1,v),p=ZY(BR[4],t);
    return[lerp(-VX,VX,u),p[1],sd*p[0]];},40,10,{uS:2*VX/14,vS:2*Math.SQRT2*BR[4]*.5/14}));
  // the eight terraces of the floor, laid along the bore as 20 m blocks
  for(let j=0;j<8;j++){const t=.5+(j+.5)/16,p=ZY(BR[4],t);
   for(let x=-VX+10;x<VX-9;x+=20){
    if(dd&&rng()<.22)continue;
    kput('acBox',[x,p[1]-2.2,sd*(p[0]-4)],null,[20,4.4,17],deck());
    if(!dd&&j%2===0&&x%60<20)kput('strip',[x,p[1]+1.4,sd*(p[0]-11)],null,[18,14,14],CYAN);
    if(rng()<.10)person(x+rr(-8,8),p[1]+.4,sd*(p[0]-rr(2,10)));
    if(rng()<.30){const hh=rr(7,17);
     kput('acBox',[x+rr(-6,6),p[1]+hh*.5,sd*(p[0]-rr(5,11))],null,[rr(9,17),hh,rr(8,14)],stone());
     kput('acPane',[x,p[1]+hh*.5,sd*(p[0]-rr(5,11))-sd*7],qFacing([0,0,-sd]),[10,hh*.5,1],winC(.7));}
    else if(rng()<.30)plant(x+rr(-7,7),p[1]-.2,sd*(p[0]-rr(3,12)),rr(6,12));}}
  for(let x=-VX+20;x<VX-19;x+=40){
   kput('acBox',[x,CY+BR[4]*.52,sd*BR[4]*.48],QX([0,-1,sd]),[BR[4]*.72,7,7],deck());
   if(!dd&&x%120<40)kput('acPane',[x,CY+BR[4]*.50,sd*BR[4]*.46],QX([0,-1,sd]),[BR[4]*.6,3,1],CYAN);}
  // galleries on the two side vertices, where the bore is widest
  for(let x=-VX+16;x<VX-15;x+=32){
   if(dd&&rng()<.3)continue;
   kput('acBox',[x,CY-3,sd*(BR[4]-7)],null,[32,3,15],stone());
   for(let w2=0;w2<2;w2++)kput('acPane',[x,CY+6+w2*9,sd*(BR[4]-.6)],qFacing([0,0,-sd]),
     [24,5,1],winC(.6));}}
 // bridges across the void, and the light that says how deep it is
 for(let j=0;j<5;j++){const x=-320+j*160;
  kput('acBox',[x,CY,0],null,[16,4.5,2*BR[4]-6],stone());
  for(const sd of [1,-1])kput('acBox',[x+sd*7,CY+3.4,0],null,[2.2,2.6,2*BR[4]-6],stone());
  if(!dd)kput('strip',[x,CY-3,0],qEuler(0,Math.PI/2,0),[2*BR[4]-20,14,14],CYAN);}
 // THE RIBS AND THE STEPPED MOUTHS. The sheet's void is a deep diamond TUNNEL,
 // and a bore with smooth walls photographed down its own axis is a flat black
 // diamond however long it is. Pale diamond ribs every 46 m under the ceiling
 // and down to the terraces give the eye a receding sequence of diamonds, which
 // is what depth looks like head-on with no shadows; and each mouth is stepped
 // in three telescoping frames, the drawing's stepped walls at the entrance.
 const rib=(x,qr,wd,dp,full,c,litR)=>{for(const sd of [1,-1])for(const up of [1,0]){
   if(!up&&!full)continue;
   const ta=up?.012:.5,tb=up?.5:.64,pa=ZY(qr,ta),pb=ZY(qr,tb);
   beam('acBox',[x,pa[1],sd*pa[0]],[x,pb[1],sd*pb[0]],wd,dp,c);
   if(litR&&up)kput('strip',[x,(pa[1]+pb[1])*.5-4,sd*(pa[0]+pb[0])*.5-sd*4],
     QX([0,pb[1]-pa[1],sd*(pb[0]-pa[0])]),[Math.hypot(pb[1]-pa[1],pb[0]-pa[0])*.9,14,14],CYAN);}};
 for(let x=-VX+46;x<VX-40;x+=46){
  if(dd&&rng()<.25)continue;
  rib(x,BR[4]-9,8,12,1,stone(),!dd&&Math.round(x/46)%2===0);}
 for(const ex of [-1,1])for(let k=0;k<3;k++)
  rib(ex*(VX-4-k*11),BR[4]-5-k*7,9,10+k*6,1,new THREE.Color(dd?0x6e675a:0xe8e1d2).multiplyScalar(1-k*.12),0);

 // ============================================================ THE APEX AND THE KEEL
 // The ridge and the keel are chamfered by 6 m of z, which is all it takes to
 // give a knife edge something to stand on, and costs the silhouette 6 m in
 // 1 414. The heliport deck sits ON the chamfer and its top face is the 1 500 m
 // the sheet asks for; the keel closes the bottom and hangs its spine below.
 const APY=CY+RD-CHAM, KEY=CY-RD+CHAM;
 MAS.push(gridSurface((u,v)=>[lerp(-HX,HX,u),APY,lerp(-CHAM,CHAM,v)],60,2,{uS:ACSIDE/25.6,vS:1}));
 SHD.push(gridSurface((u,v)=>[lerp(-HX,HX,u),KEY,lerp(-CHAM,CHAM,v)],60,2,{uS:ACSIDE/12,vS:1}));
 {const DHW=26;
  kput('acBox',[0,APY+3,0],null,[HX*1.84,6,DHW*2],deck());               // the deck
  for(const sd of [1,-1])kput('acDim',[0,APY-.8,sd*(CHAM+DHW)*.5],null,[HX*1.84,2.2,DHW-CHAM],null);
  for(let j=0;j<5;j++){const px=-380+j*190;
   kput('acPad',[px,APY+6.3,0],null,[17,.7,17],new THREE.Color(dd?0x4a4438:0xb4ac98));
   kput('acDim',[px,APY+6.8,0],null,[7,.3,7],null);
   if(!dd)for(let a2=0;a2<4;a2++)kput('strip',[px+Math.cos(a2*TAU/4)*19,APY+6.6,Math.sin(a2*TAU/4)*19],
     null,[7,11,11],CYAN);}
  // the working deck: hangars at the ends, a control block on the axis, a
  // balustrade and edge lights the whole 920 m, and the stair heads that come up
  // out of the two upper faces
  for(const sx of [-1,1]){
   kput('acBox',[sx*452,APY+10.5,0],null,[64,9,40],stone());
   kput('acPane',[sx*452,APY+10,sx*21],qFacing([0,0,sx]),[50,6,1],winC(.7));
   for(let j=0;j<3;j++){const hx=sx*(300-j*84);
    if(dd&&rng()<.4)continue;
    kput('acBox',[hx,APY+9.5,sx*15],null,[40,7,20],stone());
    kput('acPane',[hx,APY+9,sx*24.6],qFacing([0,0,sx]),[32,4.4,1],winC(.6));}}
  kput('acBox',[60,APY+19,0],null,[26,26,26],stone());
  for(const sx of [-1,1])kput('acPane',[60,APY+24,sx*13.4],qFacing([0,0,sx]),[20,9,1],winC(.9));
  for(let x=-455;x<=455;x+=17)for(const sx of [-1,1]){
   if(dd&&rng()<.35)continue;
   kput('acBox',[x,APY+7.4,sx*25],null,[17,2.8,1.6],stone());
   if(!dd&&x%68<17)kput('acPane',[x,APY+8.2,sx*26],qFacing([0,0,sx]),[15,1.4,1],CYAN);}
  for(let j=0;j<(dd?0:26);j++)person(rr(-430,430),APY+6.3,rr(-22,22));
  // THE MAST. Down in the ruin: a lattice at the top of a 1 500 m mass does not
  // outlast the city that guyed it.
  const MTX=-190,MTH=52;
  if(!dd){for(let s2=0;s2<6;s2++){const y0=APY+6+s2*MTH/6,y1=y0+MTH/6,r0=lerp(7,2,s2/6),r1=lerp(7,2,(s2+1)/6);
    for(let a2=0;a2<4;a2++){const A0=a2/4*TAU+.78,A1=(a2+1)/4*TAU+.78;
     beam('acBox',[MTX+Math.cos(A0)*r0,y0,Math.sin(A0)*r0],[MTX+Math.cos(A0)*r1,y1,Math.sin(A0)*r1],1.3,1.3,stone());
     beam('acBox',[MTX+Math.cos(A0)*r0,y0,Math.sin(A0)*r0],[MTX+Math.cos(A1)*r1,y1,Math.sin(A1)*r1],.8,.8,stone());}}
   kput('strip',[MTX,APY+6+MTH+3,0],null,[4,4,4],CYAN);
   kput('finial',[MTX,APY+6+MTH+8,0],null,[2.4,7,2.4],null);}
  else{for(let s2=0;s2<6;s2++){const t2=s2/6,t3=(s2+1)/6;
    beam('acBox',[MTX+18+t2*MTH*.8,APY+6.6,t2*MTH*.5],[MTX+18+t3*MTH*.8,APY+6.6,t3*MTH*.5],
     lerp(6,2,t2),lerp(6,2,t2),stone());}}}
 // the keel spine, the 960 m beam the whole belly hangs off
 kput('acBox',[0,KEY-11,0],null,[HX*1.92,22,46],stone());
 kput('acDim',[0,KEY-22.6,0],null,[HX*1.9,2,42],null);
 for(let x=-450;x<=450;x+=50){
  kput('acBox',[x,KEY-24.5,0],null,[26,5,58],deck());
  if(!dd&&x%150===0)kput('strip',[x,KEY-27.4,0],null,[42,14,14],CYAN);}

 // ============================================================ THE HELIPORT TOWER
 // Sheet 7 fig. 1 and sheet 8 fig. 2 both stand a slim tower beside the upper
 // left face of the diamond, rising well clear of it to a corbelled crown. Built
 // as the north-west pier carried on up THROUGH the mass: the same 104 x 180 m
 // section and the same slotted wall, emerging from the upper north face at
 // 1 030-1 210 m and standing to 1 262, with three corbel steps flaring out to a
 // deck at 1 290. From the west, where the sheet stands, north is on the left.
 // It is ALSO inside the Apollonian rule where it matters: from the side
 // elevation its crown is 240 m under the ridge, so the rectangle is untouched.
 {const hx=PHX,hz=PHZ,fy=z=>CY+(RD-Math.abs(z));
  const brk=dd?1082:0;
  const topAt=(x,z)=>dd?Math.max(fy(z)-3,brk+18*(fbm(x*.04,z*.04,9621,2)-.5)*2):HTTOP;
  const cs=[[-1,-1],[1,-1],[1,1],[-1,1]];
  for(let f=0;f<4;f++){const a=cs[f],b=cs[(f+1)%4],len=f%2?2*hz:2*hx;
   TWR.push(uvWorldY(gridSurface((u,v)=>{const x=HTX+lerp(a[0],b[0],u)*hx,z=HTZ+lerp(a[1],b[1],u)*hz;
     const y0=fy(z)-3;return[x,lerp(y0,topAt(x,z),v),z];},f%2?8:4,dd?4:10,
    {uS:len/32,vS:1}),32));}
  if(!dd){
   // belt courses, and the crown: three corbel steps, a ring of brackets under
   // the first, a lit band, the deck, the pads, the cab and the mast
   for(let y=1100;y<HTTOP-20;y+=54){kput('acBox',[HTX,y,HTZ],null,[2*hx+3,4,2*hz+3],stone());
    kput('strip',[HTX,y+4,HTZ],null,[2*hx+2.4,12,(2*hz+2.4)/.18],CYAN);}
   const CR=[[12,10],[30,10],[52,9]];let y=HTTOP;
   kput('acDim',[HTX,y+2,HTZ],null,[2*hx+2,4,2*hz+2],null);y+=4;
   for(let k=0;k<3;k++){const g=CR[k][0],h=CR[k][1];
    kput('acBox',[HTX,y+h*.5,HTZ],null,[2*hx+g,h,2*hz+g],stone());
    if(k<2)kput('acPane',[HTX,y+h*.5,HTZ],null,[2*hx+g+.6,h*.28,2*hz+g+.6],k?CYAN:WARMW.clone().multiplyScalar(.7));
    y+=h;}
   for(let f=0;f<4;f++){const a=cs[f],b=cs[(f+1)%4],len=f%2?2*hz:2*hx,nb=Math.round(len/9);
    for(let j=0;j<nb;j++){const u=(j+.5)/nb,x=HTX+lerp(a[0],b[0],u)*(hx+2.5),z=HTZ+lerp(a[1],b[1],u)*(hz+2.5);
     kput('acBox',[x,HTTOP+10,z],null,[3,14,3],stone());}}
   const DY=y;
   kput("acBox",[HTX,DY+1.5,HTZ],null,[2*hx+60,3,2*hz+60],deck());
   for(const pz of [-45,45]){kput('acPad',[HTX,DY+3.4,HTZ+pz],null,[26,.8,26],new THREE.Color(0xb4ac98));
    kput('acDim',[HTX,DY+3.9,HTZ+pz],null,[9,.3,9],null);
    for(let a2=0;a2<6;a2++)kput('strip',[HTX+Math.cos(a2*TAU/6)*30,DY+3.8,HTZ+pz+Math.sin(a2*TAU/6)*30],null,[6,11,11],CYAN);}
   kput('acBox',[HTX+30,DY+11,HTZ+100],null,[30,16,26],stone());
   kput('acPane',[HTX+30,DY+13,HTZ+113.2],null,[26,6,1],winC(.95));
   for(let x=-1;x<=1;x+=2)for(let z=-1;z<=1;z+=2)
    kput('acBox',[HTX+x*(hx+29),DY+4.5,HTZ+z*(hz+29)],null,[6,3,6],stone());
   for(const sx of [-1,1]){kput('acBox',[HTX+sx*(hx+29.4),DY+4,HTZ],null,[1.4,2.2,2*hz+60],stone());
    kput('acPane',[HTX+sx*(hx+30.2),DY+4.6,HTZ],qFacing([sx,0,0]),[2*hz+56,1.2,1],CYAN);}
   const MH=38;
   beam('acBox',[HTX-30,DY+3,HTZ-110],[HTX-30,DY+3+MH,HTZ-110],2.4,2.4,stone());
   kput('strip',[HTX-30,DY+MH+5,HTZ-110],null,[4,4,4],CYAN);
   for(let j=0;j<10;j++)person(HTX+rr(-hx,hx),DY+3,HTZ+rr(-hz,hz));}
  else{
   // the stump: laid open at the break, floors showing in the torn top
   for(let y=brk-24;y<brk+14;y+=10){for(const zz of [-60,-20,20,60]){const z=HTZ+zz;if(fy(z)>y-2)continue;
     kput('acBox',[HTX,y,z],null,[2*hx-6,1.6,38],new THREE.Color(0xa89e8c));
     kput('acDim',[HTX,y-1.4,z],null,[2*hx-8,1.4,36],null);}}}}

