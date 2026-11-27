// prefix: tb
/* ================================================================= DESERT TABISTI: ROUNDED-MASS TOOLKIT
   Helpers for the desert / caravan-road variants (62-tb-desert-*.js): battered drums with a teal tile band, curved room shells with
   a door gap (lathe wall + inward lining, so a round room is real), scalloped crowns, beehive domes, Kenshi-style layered
   sand-hide roof plates, belvedere collars (the flared open-arcade crown of the great wall towers) and curved-wall blockers.
   Round walls are lathes about the axis (x = cos a, z = sin a); a door gap is the missing arc. Every walkable disc sits on the
   top of a solid that stops one disc-thickness lower, so no two faces are coplanar. */

const TB_DZ_SEG=24;

/* Battered curved wall [r at y0, r*(1-b) at y0+h] with banded courses, an inward lining and (o.gapW) a door gap facing o.gapA. */
function tbRoundShell(cx,cz,r,y0,h,o){
 o=o||{};
 const b=o.b==null?.07:o.b,t=o.t==null?.52:o.t,seg=o.seg||TB_DZ_SEG;
 const gap=o.gapW?{a:o.gapA==null?PI/2:o.gapA,half:Math.asin(Math.min(.95,(o.gapW/2+.2)/r))}:null;
 const a0=gap?gap.a+gap.half:0,a1=gap?gap.a-gap.half+TAU:TAU;
 const rr=f=>r*(1-b*f),lo={a0,a1};
 const bands=o.plain?[[0,.1,'ashlar',.05],[.1,.9,o.mk||'buffbrick',0],[.9,1,'rosebrick',.05]]
  :[[0,.1,'ashlar',.05],[.1,.58,o.mk||'buffbrick',0],[.58,.66,o.band||'kashi',.04],[.66,.9,o.mk||'buffbrick',0],[.9,1,'rosebrick',.05]];
 svNoWalk(()=>{
  for(const [f0,f1,mk,dr] of bands)lathe(mk,cx,cz,[[rr(f0)+dr,y0+h*f0],[rr(f1)+dr,y0+h*f1]],seg,P(mk),lo);
  lathe('stucco',cx,cz,[[rr(0)-t,y0],[rr(1)-t,y0+h]],seg,P('stucco'),{a0,a1,inward:true});
  lathe('ashlar',cx,cz,[[rr(1)-t,y0+h],[rr(1)+.05,y0+h]],seg,P('ashlar'),lo);
  if(gap){
   for(const s of [-1,1]){
    const ang=gap.a+s*gap.half,rm=r-t/2;
    box('rosebrick',cx+Math.cos(ang)*rm,y0,cz+Math.sin(ang)*rm,t+.04,h,.22,P('rosebrick'),-ang);
   }
  }
 });
 /* blockers: chords of the ring, none across the gap */
 const n=Math.max(8,Math.ceil(TAU*r/2.0)),chord=TAU*r/n+.12;
 for(let k=0;k<n;k++){
  const am=(k+.5)/n*TAU;
  if(gap){let d=Math.abs(((am-gap.a+PI)%TAU+TAU)%TAU-PI);if(d<gap.half+.02)continue;}
  tbWallBlock(cx+Math.cos(am)*(r-t/2),y0,cz+Math.sin(am)*(r-t/2),chord,h,t+.1,-am-PI/2);
 }
 if(gap&&o.door!==false){
  const rm=r-t/2;
  tbKashiDoor(cx+Math.cos(gap.a)*rm,y0,cz+Math.sin(gap.a)*rm,PI/2-gap.a,o.gapW,o.doorH||2.4,{t,name:o.name||'round-door',register:'banded'});
 }
 return {rIn:r-t,rTop:rr(1)};
}

/* A round room: shell + floor disc + kundal ceiling slab + the room record. Returns the floor top. */
function tbRoundRoom(cx,cz,r,y0,h,o){
 o=o||{};
 const s=tbRoundShell(cx,cz,r,y0,h,o);
 const yF=y0+.02;
 tbFloorDisc(cx,cz,s.rIn-.04,yF,'floor',P('floor'),{th:.14,seg:20});
 svNoWalk(()=>cyl('kundal',cx,y0+h-.1,cz,s.rIn-.02,.1,P('kundal'),20));
 tbRoom(cx-s.rIn*.7,cz-s.rIn*.7,cx+s.rIn*.7,cz+s.rIn*.7,y0,h,{});
 return yF;
}

/* A solid battered drum (closed cylinders, no interior): teal band, rose cornice, painted arrow-slits. */
function tbDrumSolid(cx,cz,r,y0,h,o){
 o=o||{};
 tbBio().windTowers++;   /* a battered solar drum is a stack-effect shaft, as the wind-towers are */
 const b=o.b==null?.08:o.b,seg=o.seg||TB_DZ_SEG,rr=f=>r*(1-b*f);
 const mk=o.mk||'buffbrick';
 const bands=[[0,.1,'ashlar',.06],[.1,.56,mk,0],[.56,.65,o.band||'kashi',.05],[.65,.91,mk,0],[.91,1,'rosebrick',.06]];
 svNoWalk(()=>{
  for(const [f0,f1,m,dr] of bands)cyl(m,cx,y0+h*f0,cz,rr(f0)+dr,h*(f1-f0),P(m),seg,rr(f1)+dr);
  if(o.slits!==false){
   const ns=o.nSlits||6;
   for(let k=0;k<ns;k++){
    const a=k/ns*TAU+(o.rot||0),yy=y0+h*(.34+(k%2)*.2);
    box('iron',cx+Math.cos(a)*(rr(.4)+.02),yy,cz+Math.sin(a)*(rr(.4)+.02),.2,.9,.16,P('iron'),-a);
   }
  }
 });
 if(o.block!==false&&y0<1.5)tbWallBlock(cx,y0,cz,r*1.7,Math.min(h,3),r*1.7,0);
 return y0+h;
}

/* Scalloped crown: three corbel steps, a rim floor disc (walkable unless o.walk===false) and rounded merlons (cylinder + dome),
   skipping the arc o.skipA +/- o.skipW (where a stair arrives). Returns the rim floor height. */
function tbRoundCrown(cx,cz,r,y,o){
 o=o||{};
 const seg=o.seg||TB_DZ_SEG;
 svNoWalk(()=>{
  for(let s=0;s<3;s++){const m=s%2?'kashi':'rosebrick';cyl(m,cx,y+s*.17,cz,r+.1+.1*s,.17,P(m),seg);}
 });
 const rp=r+.46,yF=y+.51+.14;
 tbFloorDisc(cx,cz,rp,yF,'ashlar',P('ashlar'),{th:.14,seg:seg,walk:o.walk!==false});
 const n=Math.round(TAU*rp/.95);
 svNoWalk(()=>{
  for(let k=0;k<n;k++){
   const a=(k+.5)/n*TAU;
   if(o.skipA!=null){const d=Math.abs(((a-o.skipA+PI)%TAU+TAU)%TAU-PI);if(d<o.skipW)continue;}
   const px=cx+Math.cos(a)*(rp-.14),pz=cz+Math.sin(a)*(rp-.14);
   cyl('buffbrick',px,yF,pz,.23,.6,P('buffbrick'),8);
   sph('buffbrick',px,yF+.6,pz,.23,P('buffbrick'),.8,8);
  }
 });
 return yF;
}

/* Beehive / onion dome with an inward soffit and a finial. mk: 'zsolnay' (teal glaze), 'terracotta' or 'stucco' (plain adobe). */
function tbDome(cx,cz,r,y,hD,o){
 o=o||{};
 const mk=o.mk||'zsolnay',seg=o.seg||16;
 svNoWalk(()=>{
  cyl('ustun',cx,y-.04,cz,r*.97,.1,P('ustun'),seg);
  lathe('cedar',cx,cz,[[r*.8,y+.07],[r*.4,y+hD*.5],[.01,y+hD*.72]],seg,P('cedar'),{inward:true});
  lathe(mk,cx,cz,[[r+.08,y+.06],[r*.95,y+hD*.36],[r*.66,y+hD*.7],[r*.3,y+hD*.92],[.06,y+hD]],seg,P(mk),{uv:'cone'});
  cyl('kashi',cx,y+hD*.3,cz,r*.97+.075,hD*.08,P('kashi'),seg,r*.93+.075);
  if(o.finial!==false){
   sph('gilt',cx,y+hD+.06,cz,.13,P('gilt'),1,8);
   cyl('iron',cx,y+hD+.12,cz,.03,o.spire||.5,P('iron'),6);
  }
 });
 return y+hD;
}

/* Flared belvedere collar (plate: the great wall towers): stepped corbels widening upward, a gallery, an open arcade of short
   columns, a domed roof and a pennant. Not walkable. */
function tbBelvedere(cx,cz,r,y,o){
 o=o||{};
 tbBio().windTowers++;   /* the open arcade is the breeze lantern */
 const nC=o.cols||8,hC=o.colH||1.9;
 svNoWalk(()=>{
  for(let s=0;s<4;s++){const m=s%2?'kashi':'rosebrick';cyl(m,cx,y+s*.2,cz,r+.14+.2*s,.2,P(m),TB_DZ_SEG);}
  const rg=r+.9,yG=y+.8;
  cyl('ashlar',cx,yG,cz,rg,.18,P('ashlar'),TB_DZ_SEG);
  /* hanging pennants on the gallery rim */
  const nP=nC;
  for(let k=0;k<nP;k++){
   const a=(k+.5)/nP*TAU,pm=['silk','silkRose','silkSaffron','brocade'][k%4];
   box(pm.indexOf('silk')===0?'silk':'brocade',cx+Math.cos(a)*(rg+.03),yG-.9,cz+Math.sin(a)*(rg+.03),.5,.9,.04,P(pm),-a-PI/2);
  }
  const yC=yG+.18;
  for(let k=0;k<nC;k++){
   const a=k/nC*TAU;
   cyl('ustun',cx+Math.cos(a)*(rg-.4),yC,cz+Math.sin(a)*(rg-.4),.11,hC,P('ustun'),8);
  }
  cyl('rosebrick',cx,yC+hC,cz,rg+.1,.16,P('rosebrick'),TB_DZ_SEG);
 });
 const yD=y+.8+.18+hC+.16;
 tbDome(cx,cz,r+.9,yD,o.domeH||1.9,{mk:o.mk||'terracotta',spire:.9});
 return yD+(o.domeH||1.9);
}

/* Kenshi-style layered sand-hide roof: stacked superelliptic plates, each stepped in, a fat core between them, rose trim and
   timber spines raking out of the rim. Solid, not walkable. */
function tbHideRoof(cx,cz,w,d,y0,o){
 o=o||{};
 const L=o.layers||3,step=o.step||2.0,rise=o.rise||.66,n=22,pw=o.p||3.2;
 const ring=(ww,dd,sc)=>{
  const pts=[];
  for(let k=0;k<n;k++){
   const a=k/n*TAU,c=Math.cos(a),s=Math.sin(a);
   pts.push([cx+ww/2*sc*Math.sign(c)*Math.pow(Math.abs(c),2/pw),cz+dd/2*sc*Math.sign(s)*Math.pow(Math.abs(s),2/pw)]);
  }
  return pts;
 };
 svNoWalk(()=>{
  for(let i=0;i<L;i++){
   const ww=w-i*step,dd=d-i*step*.8,y=y0+i*rise;
   prism('terracotta',ring(ww,dd,1.035),y+.04,y+.2,P('terracotta'));
   prism('stucco',ring(ww,dd,1),y,y+.26,P('stucco'));
   if(i<L-1)prism('buffbrick',ring(ww-step*.7,dd-step*.56,1),y+.26,y+rise+.04,P('buffbrick'));
   const ns=o.spines==null?6:o.spines;
   for(let k=0;k<ns;k++){
    const a=(k+.5)/ns*TAU+i*.4,c=Math.cos(a),s=Math.sin(a);
    const x=cx+ww/2*c,z=cz+dd/2*s;
    beam('ustun',[x-c*.5,y+.12,z-s*.5],[x+c*1.5,y+.5,z+s*1.5],.09,P('ustun'),true);
   }
  }
  const yT=y0+(L-1)*rise;
  const wt=w-(L-1)*step,dt=d-(L-1)*step*.8;
  prism('rosebrick',ring(Math.max(1,wt-step*.7),Math.max(1,dt-step*.56),1),yT+.26,yT+.5,P('rosebrick'));
 });
 return y0+(L-1)*rise+.5;
}

/* Pointed-niche relief panel for the scalloped wall (plate: carved sand-brick curtain): a recessed rose frame, a lattice
   screen, and a stacked diamond of teal tile. Local frame: x along the wall, z out of the wall face at z0. */
function tbNichePanel(x,y,z,w,h,o){
 o=o||{};
 svNoWalk(()=>{
  box('rosebrick',x,y,z,w,h,.1,P('rosebrick'));
  box('claustra',x,y+.5,z+.06,w*.62,h-1.3,.05,P('claustra'));
  box('kashi',x,y+h-.9,z+.06,w*.42,.42,.055,P('kashi'),0,0,0);
  const yc=y+h-.62;
  box('kashi',x,yc,z+.07,.5,.5,.05,P('kashi'),PI/4);
  box('cobalt',x,yc,z+.11,.24,.24,.04,P('cobalt'),PI/4);
 });
}

/* Vented round plinth: a stepped drum base pierced by a ring of terracotta/iron undercroft grilles (the round form of tbPorticoPlinth's vents). */
function tbRoundPlinth(cx,cz,r,yTop,o){
 o=o||{};
 tbBio().ventedPlinths++;
 const n=o.vents||Math.max(8,Math.round(TAU*r/2.6));
 svNoWalk(()=>{
  cyl('ashlar',cx,0,cz,r,yTop-.16,P('ashlar'),o.seg||TB_DZ_SEG);
  for(let k=0;k<n;k++){
   const a=(k+.5)/n*TAU;
   if(o.skipA!=null){const d=Math.abs(((a-o.skipA+PI)%TAU+TAU)%TAU-PI);if(d<o.skipW)continue;}
   box('iron',cx+Math.cos(a)*(r+.015),.08,cz+Math.sin(a)*(r+.015),.7,Math.max(.14,yTop-.46),.05,P('iron'),-a-PI/2);
  }
 });
}
