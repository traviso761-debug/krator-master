// Jimjam housing (round 2b): nine houses, three per tier. No two share a plan or a roofline.
// Local frame: origin at the plot centre on the ground, +z is the front (entrance), y up.
//   poor A  party-wall pair: a two-storey flat roof with a canvas awning + a one-storey barrel vault
//   poor B  narrow two-storey slab with an external stair (side, then back) to the roof terrace
//   poor C  L-plan round a walled yard: terracotta dome, bread oven, water jar, ladder
//   mid A   stepped terraces (three storeys, each set back), corner turret, 3-shaft chimney stack
//   mid B   tower plus wing: four storeys, stacked oriels, a bulbous corner turret, onion cap
//   mid C   T-plan shop-house: arcaded loggia, balcony, yellow upper floors with portholes, 2 shafts
//   rich A  courtyard mansion: two-storey arcades on four sides, pishtaq gate, hall with gold dome
//   rich B  pavilion villa on a marble podium: loggias all round, gold onion on a drum, 4 chhatris
//   rich C  L-plan tower compound: round-collared 3-stage spire, slate ribbed dome, walled garden
// House-only helpers (jjHouse…) add the pieces the shared kit lacks: arched wall panels and
// colonnades with real openings, jharokha oriels, chhatri kiosks, a bulbous onion, a barrel vault,
// solid stairs, instanced portholes and a spire with round flared collars. All are instanced.

/* ==== geometry cache and small utilities ==== */
const JJHOUSE_GEO={};
function jjHouseN(jjV){return typeof jjV==='number'?jjV.toFixed(2):String(jjV);}
function jjHouseGeo(jjKey,jjMake){if(!JJHOUSE_GEO[jjKey])JJHOUSE_GEO[jjKey]=jjMake();return JJHOUSE_GEO[jjKey];}
function jjHousePutGeo(jjKey,jjGeo,jjMat,jjX,jjY,jjZ,jjSX,jjSY,jjSZ,jjQ){jjPut('jj_house_'+jjKey+'_'+jjMat,jjGeo,JMAT[jjMat],jjX,jjY,jjZ,jjSX,jjSY,jjSZ,undefined,jjQ||null);}
function jjHouseBoxQ(jjX,jjY,jjZ,jjW,jjH,jjD,jjMat,jjQ){jjPut('jj_box_'+jjMat,JJGEO.box,JMAT[jjMat],jjX,jjY,jjZ,jjW,jjH,jjD,undefined,jjQ);}
// translate everything drawn inside (like jjWithYaw, but a shift): lets a builder centre its plot
function jjHouseShift(jjDx,jjDz,jjFn){const jjPrev=JJ.frame,jjT=new THREE.Matrix4().makeTranslation(jjDx,0,jjDz);JJ.frame=jjPrev?jjPrev.clone().multiply(jjT):jjT;try{jjFn();}finally{JJ.frame=jjPrev;}}

/* ==== masses: blocks, cornices, parapets, wall runs ==== */
// a wall mass from x0..x1, z0..z1, y0..y1 with optional base course, string courses and a cap
function jjHouseBlock(jjX0,jjX1,jjZ0,jjZ1,jjY0,jjY1,jjMat,jjO){jjO=jjO||{};
  const w=jjX1-jjX0,d=jjZ1-jjZ0,cx=(jjX0+jjX1)/2,cz=(jjZ0+jjZ1)/2;
  jjBox(cx,(jjY0+jjY1)/2,cz,w,jjY1-jjY0,d,jjMat);
  if(jjO.base)jjBox(cx,jjY0+jjO.base/2,cz,w+.1,jjO.base,d+.1,jjO.baseMat||'brickDeep');
  for(const b of (jjO.bands||[]))jjBox(cx,b,cz,w+.12,jjO.bandH||.2,d+.12,jjO.bandMat||'marble');
  if(jjO.cap)jjBox(cx,jjY1+.08,cz,w+.3,.16,d+.3,jjO.cap);}
// a three-step cornice round a block top; returns the top
function jjHouseCornice(jjX0,jjX1,jjZ0,jjZ1,jjY,jjO){jjO=jjO||{};
  const w=jjX1-jjX0,d=jjZ1-jjZ0,cx=(jjX0+jjX1)/2,cz=(jjZ0+jjZ1)/2;
  jjBox(cx,jjY+.11,cz,w+.16,.22,d+.16,jjO.m1||'brick');jjBox(cx,jjY+.32,cz,w+.36,.2,d+.36,jjO.m2||'brickYellow');jjBox(cx,jjY+.52,cz,w+.6,.2,d+.6,jjO.m3||'marble');
  return jjY+.62;}
// a parapet round a rectangle (inset inside it). skip:'fblr' drops sides, gap:{side,a,b} leaves an opening,
// merlon:spacing adds kangura merlons on top
function jjHouseParapet(jjX0,jjX1,jjZ0,jjZ1,jjY,jjO){jjO=jjO||{};
  const h=jjO.h||.9,t=jjO.t||.26,m=jjO.mat||'brick',skip=jjO.skip||'',gap=jjO.gap;
  const run=(side,a0,a1,fixed,alongX)=>{let segs=[[a0,a1]];if(gap&&gap.side===side){segs=[];if(gap.a>a0)segs.push([a0,gap.a]);if(gap.b<a1)segs.push([gap.b,a1]);}
    for(const s of segs){const L=s[1]-s[0],c=(s[0]+s[1])/2;if(L<.05)continue;
      if(alongX){jjBox(c,jjY+h/2,fixed,L,h,t,m);if(jjO.cope)jjBox(c,jjY+h+.06,fixed,L+.08,.12,t+.14,jjO.cope);}
      else{jjBox(fixed,jjY+h/2,c,t,h,L,m);if(jjO.cope)jjBox(fixed,jjY+h+.06,c,t+.14,.12,L+.08,jjO.cope);}
      if(jjO.merlon){const n=Math.max(1,Math.round(L/jjO.merlon)),mw=jjO.merlon*.5,mh=jjO.merlonH||.5,top=jjY+h+(jjO.cope?.12:0)+mh/2;
        for(let i=0;i<n;i++){const p=s[0]+L*(i+.5)/n;if(alongX)jjBox(p,top,fixed,mw,mh,t,jjO.merlonMat||m);else jjBox(fixed,top,p,t,mh,mw,jjO.merlonMat||m);}}}};
  if(skip.indexOf('f')<0)run('f',jjX0,jjX1,jjZ1-t/2,true);
  if(skip.indexOf('b')<0)run('b',jjX0,jjX1,jjZ0+t/2,true);
  if(skip.indexOf('l')<0)run('l',jjZ0,jjZ1,jjX0+t/2,false);
  if(skip.indexOf('r')<0)run('r',jjZ0,jjZ1,jjX1-t/2,false);}
// a free-standing straight wall (axis-aligned) with a marble cap and merlons
function jjHouseWallRun(jjX0,jjZ0,jjX1,jjZ1,jjH,jjO){jjO=jjO||{};const t=jjO.t||.32,alongX=Math.abs(jjX1-jjX0)>Math.abs(jjZ1-jjZ0),L=alongX?Math.abs(jjX1-jjX0):Math.abs(jjZ1-jjZ0),cx=(jjX0+jjX1)/2,cz=(jjZ0+jjZ1)/2,m=jjO.mat||'brick';
  if(alongX){jjBox(cx,jjH/2,cz,L,jjH,t,m);jjBox(cx,jjH+.07,cz,L+.1,.14,t+.12,jjO.cap||'marble');}else{jjBox(cx,jjH/2,cz,t,jjH,L,m);jjBox(cx,jjH+.07,cz,t+.12,.14,L+.1,jjO.cap||'marble');}
  if(jjO.base){if(alongX)jjBox(cx,jjO.base/2,cz,L+.06,jjO.base,t+.08,jjO.baseMat||'brickDeep');else jjBox(cx,jjO.base/2,cz,t+.08,jjO.base,L+.06,jjO.baseMat||'brickDeep');}
  if(jjO.merlon){const n=Math.max(1,Math.round(L/jjO.merlon)),mw=jjO.merlon*.5;for(let i=0;i<n;i++){const p=-L/2+L*(i+.5)/n;if(alongX)jjBox(cx+p,jjH+.14+.25,cz,mw,.5,t,jjO.merlonMat||m);else jjBox(cx,jjH+.14+.25,cz+p,t,.5,mw,jjO.merlonMat||m);}}}

/* ==== arched wall panels and colonnades (real openings, instanced) ==== */
// a panel W wide and H tall (base at y=0, centred on x=0), with round-headed openings notched up from
// its bottom edge: each opening centred at cx, ow wide, straight jambs to `spring`, then an arch of `rise`
function jjHouseArchGeo(jjW,jjH,jjCxs,jjOw,jjSpring,jjRise,jjD){
  return jjHouseGeo(['aw',jjW,jjH,jjCxs.map(jjHouseN).join(':'),jjOw,jjSpring,jjRise,jjD].map(jjHouseN).join('_'),()=>{
    const s=new THREE.Shape(),N=16;s.moveTo(-jjW/2,0);
    for(const cx of jjCxs){s.lineTo(cx-jjOw/2,0);if(jjSpring>.001)s.lineTo(cx-jjOw/2,jjSpring);
      for(let i=1;i<N;i++){const a=Math.PI-Math.PI*i/N;s.lineTo(cx+Math.cos(a)*jjOw/2,jjSpring+Math.sin(a)*jjRise);}
      if(jjSpring>.001)s.lineTo(cx+jjOw/2,jjSpring);s.lineTo(cx+jjOw/2,0);}
    s.lineTo(jjW/2,0);s.lineTo(jjW/2,jjH);s.lineTo(-jjW/2,jjH);
    const g=new THREE.ExtrudeGeometry(s,{depth:jjD,bevelEnabled:false});g.translate(0,0,-jjD/2);return g;});}
// the archivolt: a ring of thickness t following an arch of width ow and rise (base at the springing)
function jjHouseRingGeo(jjOw,jjRise,jjT,jjD){
  return jjHouseGeo(['ring',jjOw,jjRise,jjT,jjD].map(jjHouseN).join('_'),()=>{
    const s=new THREE.Shape(),N=16;s.moveTo(-jjOw/2-jjT,0);
    for(let i=1;i<=N;i++){const a=Math.PI-Math.PI*i/N;s.lineTo(Math.cos(a)*(jjOw/2+jjT),Math.sin(a)*(jjRise+jjT));}
    s.lineTo(jjOw/2,0);for(let i=1;i<N;i++){const a=Math.PI*i/N;s.lineTo(Math.cos(a)*jjOw/2,Math.sin(a)*jjRise);}s.lineTo(-jjOw/2,0);
    const g=new THREE.ExtrudeGeometry(s,{depth:jjD,bevelEnabled:false});g.translate(0,0,-jjD/2);return g;});}
// draw an arched panel at (x,y,z) (y = base, z = centre of its thickness), turned by ry like jjWithYaw
function jjHouseArchWall(jjX,jjY,jjZ,jjW,jjH,jjCxs,jjOw,jjSpring,jjRy,jjO){jjO=jjO||{};
  const rise=jjO.rise||jjOw/2,d=jjO.d||.5,mat=jjO.mat||'brick';
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    const g=jjHouseArchGeo(jjW,jjH,jjCxs,jjOw,jjSpring,rise,d);
    jjPut('jj_house_aw_'+[jjW,jjH,jjCxs.map(jjHouseN).join(':'),jjOw,jjSpring,rise,d].map(jjHouseN).join('_')+'_'+mat,g,JMAT[mat],jjX,jjY,jjZ,1,1,1,undefined,null);
    if(jjO.trim!==false){const t=jjO.trimT||.2,rg=jjHouseRingGeo(jjOw,rise,t,.14);
      for(const cx of jjCxs){jjPut('jj_house_ring_'+[jjOw,rise,t].map(jjHouseN).join('_')+'_'+(jjO.trimMat||'marble'),rg,JMAT[jjO.trimMat||'marble'],jjX+cx,jjY+jjSpring,jjZ+d/2+.05,1,1,1,undefined,null);
        if(jjO.key)jjBox(jjX+cx,jjY+jjSpring+rise+t*.4,jjZ+d/2+.1,.3,t+.3,.2,jjO.key);}}});}
// a column with marble base and capital; pattern is a shaft texture ('diamond' …) or 'marble'/'brick'
function jjHouseCol(jjX,jjY,jjZ,jjR,jjH,jjPat){
  jjBox(jjX,jjY+.15,jjZ,jjR*2.7,.3,jjR*2.7,'marble');jjCylinder(jjX,jjY+.38,jjZ,jjR*1.25,.16,'marble',undefined,16);
  const sh=jjH-.96;jjCylinder(jjX,jjY+.46+sh/2,jjZ,jjR,sh,jjPat==='marble'||jjPat==='brick'?jjPat:'shaft_'+jjPat,undefined,32);
  jjCylinder(jjX,jjY+jjH-.42,jjZ,jjR*1.22,.16,'marble',undefined,16);jjBox(jjX,jjY+jjH-.17,jjZ,jjR*2.8,.34,jjR*2.8,'marble');}
// n bays of width `bay` on columns colH tall, with an arched spandrel panel spH tall above them
function jjHouseColonnade(jjX,jjY,jjZ,jjN,jjBay,jjColH,jjSpH,jjRy,jjO){jjO=jjO||{};
  const r=jjO.r||.3,span=jjN*jjBay,pats=jjO.patterns||['diamond'],cw=r*2.8,ow=jjBay-cw+.02,rise=Math.min(ow/2,jjSpH-.3),d=jjO.d||.6;
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    for(let i=0;i<=jjN;i++){if(jjO.ends===false&&(i===0||i===jjN))continue;jjHouseCol(jjX-span/2+i*jjBay,jjY,jjZ,r,jjColH,pats[i%pats.length]);}
    const cxs=[];for(let i=0;i<jjN;i++)cxs.push(-span/2+jjBay*(i+.5));
    jjHouseArchWall(jjX,jjY+jjColH,jjZ,span+cw,jjSpH,cxs,ow,0,0,{rise,d,mat:jjO.mat||'brick',trimMat:jjO.trimMat,key:jjO.key});
    if(jjO.cornice!==false)jjBox(jjX,jjY+jjColH+jjSpH+.1,jjZ,span+cw+.3,.2,d+.3,jjO.corniceMat||'marble');
    if(jjO.rail)for(let i=0;i<jjN;i++)if(!(jjO.railSkip&&jjO.railSkip.indexOf(i)>=0))jjBox(jjX+cxs[i],jjY+.5,jjZ,ow,.9,.22,jjO.rail);});}

/* ==== windows, doors, lamps, portholes ==== */
// y = sill, z = wall face. Frame proud of the face; sill, hood (chhajja), shutters, bars optional.
function jjHouseWin(jjX,jjY,jjZ,jjW,jjH,jjRy,jjO){jjO=jjO||{};const t=jjO.t||.2,fm=jjO.frame||'marble';
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    jjBox(jjX,jjY+jjH/2,jjZ+.03,jjW,jjH,.1,jjO.lit?'glass':'dark');
    if(jjO.arch)jjHouseArchWall(jjX,jjY,jjZ+.1,jjW+2*t,jjH+t,[0],jjW,jjH-jjW/2,0,{d:.12,mat:fm,trim:false});
    else{jjBox(jjX-jjW/2-t/2,jjY+jjH/2,jjZ+.08,t,jjH,.12,fm);jjBox(jjX+jjW/2+t/2,jjY+jjH/2,jjZ+.08,t,jjH,.12,fm);jjBox(jjX,jjY+jjH+t/2,jjZ+.09,jjW+2*t+(jjO.lintelX||.1),t,.16,jjO.lintel||fm);}
    if(jjO.sill!==false)jjBox(jjX,jjY-.06,jjZ+.12,jjW+2*t+.16,.12,.26,jjO.sillMat||fm);
    if(jjO.hood)jjBox(jjX,jjY+jjH+t+.08,jjZ+.26,jjW+2*t+.3,.1,.52,jjO.hood);
    if(jjO.shutter)for(const s of [-1,1])jjBox(jjX+s*(jjW/2+t+jjW*.25),jjY+jjH*.45,jjZ+.06,jjW*.48,jjH*.9,.07,jjO.shutter);
    if(jjO.bars)for(let i=1;i<4;i++)jjBox(jjX-jjW/2+jjW*i/4,jjY+jjH/2,jjZ+.1,.04,jjH,.04,'iron');});}
// y = threshold, z = wall face. arch:true gives a round head; lamps:true hangs a lit lamp either side
function jjHouseDoor(jjX,jjY,jjZ,jjW,jjH,jjRy,jjO){jjO=jjO||{};const t=jjO.t||.28,fm=jjO.frame||'marble';
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    jjBox(jjX,jjY+jjH/2,jjZ+.02,jjW,jjH,.1,'dark');
    const lh=jjO.arch?jjH-jjW/2:jjH;
    for(const s of [-1,1])jjBox(jjX+s*jjW/4,jjY+lh/2,jjZ+.08,jjW/2-.05,lh,.08,jjO.leaf||'wood');
    if(jjO.studs)for(const s of [-1,1])for(let i=1;i<5;i++)jjBox(jjX+s*jjW/4,jjY+lh*i/5,jjZ+.13,jjW/2-.25,.05,.04,'gold');
    if(jjO.arch)jjHouseArchWall(jjX,jjY,jjZ+.1,jjW+2*t,jjH+t,[0],jjW,jjH-jjW/2,0,{d:.16,mat:fm,trim:false});
    else{jjBox(jjX-jjW/2-t/2,jjY+jjH/2,jjZ+.08,t,jjH,.14,fm);jjBox(jjX+jjW/2+t/2,jjY+jjH/2,jjZ+.08,t,jjH,.14,fm);jjBox(jjX,jjY+jjH+.11,jjZ+.1,jjW+2*t+.24,.22,.22,jjO.lintel||fm);}
    jjBox(jjX,jjY+.05,jjZ+.25,jjW+2*t,.1,.5,jjO.step||fm);
    if(jjO.lamps)for(const s of [-1,1])jjHouseLamp(jjX+s*(jjW/2+t+.32),jjY+Math.min(jjH*.8,2.4),jjZ);});}
function jjHouseLamp(jjX,jjY,jjZ){jjBox(jjX,jjY+.25,jjZ+.2,.06,.06,.4,'iron');jjBox(jjX,jjY+.02,jjZ+.38,.2,.3,.2,'glow');jjBox(jjX,jjY+.2,jjZ+.38,.28,.06,.28,'iron');}
// an instanced porthole: brick rim, a framed ring (gold for rich, marble for middle) and glass, facing +z
function jjHousePorthole(jjX,jjY,jjZ,jjRy,jjR,jjFrame){
  const torus=jjHouseGeo('torus',()=>new THREE.TorusGeometry(1,.17,8,28)),disc=jjHouseGeo('disc',()=>new THREE.CircleGeometry(1,24));
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    jjPut('jj_house_rim_brickDeep',JJGEO.cyl,JMAT.brickDeep,jjX,jjY,jjZ,jjR,.24,jjR,undefined,qEuler(Math.PI/2,0,0));
    jjHousePutGeo('torus',torus,jjFrame||'marble',jjX,jjY,jjZ+.13,jjR*.84,jjR*.84,jjR*.84);
    jjHousePutGeo('disc',disc,'glass',jjX,jjY,jjZ+.125,jjR*.7,jjR*.7,1);});}

/* ==== domes, vaults, finials ==== */
function jjHouseOnionGeo(){return jjHouseGeo('onion',()=>new THREE.LatheGeometry([[0,0],[1,0],[1.1,.1],[1.17,.24],[1.14,.38],[1,.5],[.78,.62],[.52,.73],[.3,.83],[.15,.91],[.06,.97],[0,1]].map(q=>new THREE.Vector2(q[0],q[1])),24));}
// a bulbous onion: base radius r on its drum, swelling to 1.17 r, h tall; then a finial
function jjHouseOnion(jjX,jjY,jjZ,jjR,jjH,jjMat,jjFin){jjHousePutGeo('onion',jjHouseOnionGeo(),jjMat,jjX,jjY,jjZ,jjR,jjH,jjR);if(jjFin!==false)jjHouseFinial(jjX,jjY+jjH-.02,jjZ,jjR*.4,jjFin||'gold');}
function jjHouseFinial(jjX,jjY,jjZ,jjS,jjMat){const ball=jjHouseGeo('ball',()=>new THREE.SphereGeometry(1,12,8));
  jjCylinder(jjX,jjY+jjS*.2,jjZ,jjS*.14,jjS*.4,jjMat);jjHousePutGeo('ball',ball,jjMat,jjX,jjY+jjS*.55,jjZ,jjS*.22,jjS*.22,jjS*.22);jjCylinder(jjX,jjY+jjS*1.05,jjZ,jjS*.05,jjS*.8,jjMat);}
function jjHouseHemi(jjX,jjY,jjZ,jjR,jjMat){jjHousePutGeo('hemi',jjHouseGeo('hemi',()=>new THREE.SphereGeometry(1,20,10,0,TAU,0,Math.PI/2)),jjMat,jjX,jjY,jjZ,jjR,jjR,jjR);}
function jjHouseBarrelGeo(){return jjHouseGeo('barrel',()=>{const s=new THREE.Shape();s.moveTo(1,0);for(let i=1;i<=20;i++){const a=Math.PI*i/20;s.lineTo(Math.cos(a),Math.sin(a));}const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g;});}
// a closed barrel vault, w across, len along its axis (local z, turned by ry), rise high; y = springing
function jjHouseBarrel(jjX,jjY,jjZ,jjW,jjLen,jjRise,jjRy,jjMat){jjHousePutGeo('barrel',jjHouseBarrelGeo(),jjMat,jjX,jjY,jjZ,jjW/2,jjRise,jjLen,jjRy?qEuler(0,jjRy,0):null);}

/* ==== stairs, oriels, kiosks, spire ==== */
// solid masonry stair: lowest step at z+run/2, climbing toward -z (turned by ry). Each step is solid
// down to `base` (default y). cheek:[-1,1] adds stepped side walls on local -x/+x.
function jjHouseStair(jjX,jjY,jjZ,jjW,jjRun,jjRise,jjN,jjRy,jjO){jjO=jjO||{};
  const sh=jjRise/jjN,sd=jjRun/jjN,base=jjO.base===undefined?jjY:jjO.base,mat=jjO.mat||'marble',ct=jjO.cheekT||.25,chh=jjO.cheekH===undefined?.8:jjO.cheekH;
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    for(let i=0;i<jjN;i++){const top=jjY+sh*(i+1),zc=jjZ+jjRun/2-sd*(i+.5);
      jjBox(jjX,(base+top)/2,zc,jjW,top-base,sd+.02,mat);
      if(jjO.tread)jjBox(jjX,top-.03,zc+.02,jjW+.04,.06,sd+.04,jjO.tread);
      for(const s of (jjO.cheek||[]))jjBox(jjX+s*(jjW/2+ct/2),(base+top+chh)/2,zc,ct,top+chh-base,sd+.02,jjO.cheekMat||mat);}});}
// a jharokha oriel: y = its floor, z = the wall face; it projects dep and is carried on stepped
// brackets. roof: 'chhajja' (flat eave), 'pent' (sloped tile), 'dome', 'bangla' (curved vault)
function jjHouseJharokha(jjX,jjY,jjZ,jjW,jjH,jjDep,jjRy,jjO){jjO=jjO||{};const m=jjO.mat||'brickYellow',tr=jjO.trim||'marble',zc=jjZ+jjDep/2;
  jjWithYaw(jjX,jjY,jjZ,jjRy,()=>{
    const nb=jjW>2.2?3:2;
    for(let i=0;i<nb;i++){const bx=jjX-jjW/2+.22+(jjW-.44)*i/(nb-1);for(let k=0;k<3;k++){const bd=jjDep*(1-k*.3);jjBox(bx,jjY-.23-k*.26,jjZ+bd/2,.24,.26,bd,k===0?tr:m);}}
    jjBox(jjX,jjY,zc,jjW+.14,.2,jjDep+.14,tr);
    const sill=.75,wh=jjH-sill-.45,y0=jjY+.1;
    jjBox(jjX,y0+sill/2,zc,jjW,sill,jjDep,m);jjBox(jjX,y0+sill+.04,zc,jjW+.08,.08,jjDep+.08,tr);
    jjBox(jjX,y0+sill+wh/2,zc-.06,jjW-.24,wh,jjDep-.24,jjO.glass||'dark');
    for(const s of [-1,1])for(const f of [0,1])jjBox(jjX+s*(jjW/2-.08),y0+sill+wh/2,jjZ+.08+f*(jjDep-.16),.16,wh,.16,tr);
    for(let i=1;i<3;i++)jjBox(jjX-jjW/2+jjW*i/3,y0+sill+wh/2,jjZ+jjDep-.08,.1,wh,.1,tr);
    if(jjO.lattice)for(let i=1;i<4;i++)jjBox(jjX,y0+sill+wh*i/4,jjZ+jjDep-.1,jjW-.2,.05,.05,tr);
    jjBox(jjX,y0+sill+wh+.225,zc,jjW,.45,jjDep,m);
    const top=y0+jjH;
    if(jjO.roof==='pent'){jjHouseBoxQ(jjX,top+.22,zc+.12,jjW+.4,.12,jjDep+.65,'tile',qEuler(.38,0,0));}
    else{jjBox(jjX,top+.06,zc+.12,jjW+.5,.12,jjDep+.45,tr);
      if(jjO.roof==='dome')jjDome(jjX,top+.12,zc,Math.min(jjW,jjDep)*.62,{kind:jjO.kind||'terracotta',shape:'hemi'});
      else if(jjO.roof==='bangla')jjHouseBarrel(jjX,top+.12,zc,jjDep+.1,jjW+.1,.55,Math.PI/2,jjO.kind==='gold'?'domeGold':'tile');
      else if(jjO.roof==='onion'){const orr=Math.min(jjW,jjDep)*.5;jjCylinder(jjX,top+.24,zc,orr,.24,tr,undefined,16);jjHouseOnion(jjX,top+.36,zc,orr,orr*2.1,jjO.kind==='gold'?'domeGold':'terracotta',jjO.kind==='gold'?'gold':'marble');}}});}
// a chhatri: an open marble kiosk on n columns (4 square, 6 or 8 round) with a small dome. y = base.
function jjHouseChhatri(jjX,jjY,jjZ,jjS,jjO){jjO=jjO||{};const n=jjO.n||4,ch=jjO.h||jjS*1.05,cr=jjO.cr||Math.max(.1,jjS*.065),kind=jjO.dome||'gold',dm=kind==='gold'?'domeGold':kind;
  if(n===4)jjBox(jjX,jjY+.15,jjZ,jjS+.5,.3,jjS+.5,'marble');else jjCylinder(jjX,jjY+.15,jjZ,jjS*.5+.3,.3,'marble',undefined,16);
  const pts=[];if(n===4){for(const a of [-1,1])for(const b of [-1,1])pts.push([a*jjS/2,b*jjS/2]);}else for(let i=0;i<n;i++){const a=i*TAU/n+Math.PI/n;pts.push([Math.cos(a)*jjS/2,Math.sin(a)*jjS/2]);}
  for(const p of pts){jjBox(jjX+p[0],jjY+.4,jjZ+p[1],cr*2.6,.2,cr*2.6,'marble');jjCylinder(jjX+p[0],jjY+.3+ch/2,jjZ+p[1],cr,ch,'marble',undefined,16);jjBox(jjX+p[0],jjY+.3+ch-.1,jjZ+p[1],cr*2.8,.2,cr*2.8,'marble');}
  const y=jjY+.3+ch;
  if(n===4){jjBox(jjX,y+.12,jjZ,jjS+cr*3,.24,jjS+cr*3,'marble');jjBox(jjX,y+.29,jjZ,jjS+.8,.1,jjS+.8,'marble');}
  else{jjCylinder(jjX,y+.12,jjZ,jjS/2+cr*1.6,.24,'marble',undefined,16);jjCylinder(jjX,y+.29,jjZ,jjS/2+.42,.1,'marble',undefined,16);}
  const dr=jjS*.4;jjCylinder(jjX,y+.5,jjZ,dr,.36,'marble',undefined,16);
  if(jjO.shape==='onion'){jjHouseOnion(jjX,y+.68,jjZ,dr,dr*2,dm,kind==='gold'?'gold':'marble');return y+.68+dr*2.4;}
  jjHouseHemi(jjX,y+.68,jjZ,dr*1.02,dm);jjHouseFinial(jjX,y+.68+dr,jjZ,dr*.5,kind==='gold'?'gold':'marble');return y+.68+dr*1.6;}
// a thick staged round spire (image 2): each stage a narrower drum with a flared three-ring collar,
// gold-framed portholes, a crenellated balcony over the first stage, an onion terminal. y = base.
function jjHouseSpire(jjX,jjY,jjZ,jjR,jjO){jjO=jjO||{};const st=jjO.stages||3,sh=jjO.stageH||3.2,mats=jjO.mats||['brick','shaft_chevron','brickYellow'],ports=jjO.ports||[0,Math.PI/2,-Math.PI/2];
  let y=jjY,r=jjR;
  for(let i=0;i<st;i++){
    jjCylinder(jjX,y+sh/2,jjZ,r,sh,mats[i%mats.length],undefined,32);
    jjCylinder(jjX,y+.14,jjZ,r*1.07,.28,'brickDeep',undefined,32);
    jjCylinder(jjX,y+sh*.62,jjZ,r*1.02,.14,'marble',undefined,32);
    const pr=Math.min(.6,r*.26);for(const a of ports)jjHousePorthole(jjX+Math.sin(a)*r,y+sh*.36,jjZ+Math.cos(a)*r,a,pr,jjO.frame||'gold');
    const top=y+sh;
    jjCylinder(jjX,top-.3,jjZ,r*1.08,.2,'brickYellow',undefined,32);jjCylinder(jjX,top-.12,jjZ,r*1.18,.18,'marble',undefined,32);jjCylinder(jjX,top+.04,jjZ,r*1.28,.16,'brick',undefined,32);
    if(i===0&&jjO.balcony!==false)for(let k=0;k<16;k++){const a=k*TAU/16;jjBox(jjX+Math.cos(a)*r*1.2,top+.4,jjZ+Math.sin(a)*r*1.2,.32,.56,.24,'brickYellow',undefined,-a+Math.PI/2);}
    y=top+.12;r*=jjO.taper||.78;}
  jjCylinder(jjX,y+.3,jjZ,r*.9,.6,'brickYellow',undefined,32);jjCylinder(jjX,y+.64,jjZ,r*.98,.1,'marble',undefined,32);
  jjHouseOnion(jjX,y+.68,jjZ,r*.9,r*2.3,jjO.dome||'domeGold','gold');
  return y+.68+r*2.3;}

/* ==== planting spots (local points; plants are never part of a building) ==== */
const JJHOUSE_SPOTS={
  poorA:[[-.8,6.16,-2.9],[-0.4,0,3.9],[3.3,0,3.15]],
  poorB:[[-2.3,6.1,-1.8],[1.2,6.1,-1.9],[-2.2,0,3.95]],
  poorC:[[0,0,0],[3.15,0,3.1],[1.6,3.46,-2.4]],
  midA:[[-1.9,4.64,3.92],[1.9,4.64,3.92],[3.5,7.44,-3.6],[-4.2,7.44,.4]],
  midB:[[-4.1,4.16,-2.0],[-1.8,4.16,-2.0],[-4.4,.6,1.9]],
  midC:[[-2,7.85,-5.0],[2,7.85,-5.0],[-5.4,5.27,5.6],[5.4,5.27,5.6]],
  richA:[[-4.6,1.56,2.9],[4.6,1.56,2.9],[-4.6,1.56,-4.4],[4.6,1.56,-4.4],[-5,0,11.4],[5,0,11.4]],
  richB:[[-7.8,2.7,6.4],[7.8,2.7,6.4],[-7.8,2.7,-11],[7.8,2.7,-11],[-6.2,0,10.6],[6.2,0,10.6]],
  richC:[[-.35,0,-.1],[7.35,0,-.1],[-.35,0,7.1],[7.35,0,7.1],[9.8,0,-3.0],[-1.6,0,9.8]]};

/* ==== POOR A: party-wall pair ==== */
// left: two-storey ochre house over a brick base, flat roof with a stair hut and a canvas awning on poles;
// right: one-storey deep-brick house set back 0.8 m, roofed by a shallow lime-plastered barrel vault.
function buildJjHousePoorA(jjG,jjO){reseed(9110+(jjO.v|0));
  const LX0=-4,LX1=0,LZ0=-3.5,LZ1=3.4,LH=6,RX0=0,RX1=3.7,RZ1=2.6,RH=3.4,fr={frame:'brickDeep',lintel:'wood'};
  // left house
  jjHouseBlock(LX0,LX1,LZ0,LZ1,0,LH,'ochre',{base:1.05,baseMat:'brickDeep',bands:[3.05],bandMat:'brickDeep',bandH:.14,cap:'brickDeep'});
  jjHouseParapet(LX0,LX1,LZ0,LZ1,LH+.16,{h:.75,t:.24,mat:'ochre',cope:'brickDeep'});
  jjHouseDoor(-2.75,0,LZ1,1,2.15,0,{frame:'brickDeep',lintel:'marble',step:'brickDeep',t:.16});
  jjHouseWin(-1,1.3,LZ1,.7,.8,0,Object.assign({bars:true},fr));
  jjHouseWin(-2.8,3.75,LZ1,.7,.95,0,Object.assign({shutter:'wood'},fr));jjHouseWin(-1,3.75,LZ1,.7,.95,0,Object.assign({shutter:'wood'},fr));
  jjBox(-1,3.6,LZ1+.3,1.5,.1,.6,'wood');for(const s of [-1,1])jjBeam([-1+s*.6,3.55,LZ1+.58],[-1+s*.6,3.0,LZ1+.02],.04,'wood'); // a timber ledge for pots
  jjHouseWin(LX0,3.9,-.4,.6,.8,-Math.PI/2,fr);jjHouseWin(LX0,1.4,-1.6,.6,.7,-Math.PI/2,Object.assign({bars:true},fr));
  // stair hut (mumty) on the roof, its door facing back onto the terrace
  jjHouseBlock(-3.76,-2.3,-3.26,-1.6,LH+.16,LH+2.2,'ochre',{cap:'brickDeep'});jjHouseDoor(-3.03,LH+.16,-1.6,.75,1.85,0,{frame:'brickDeep',lintel:'wood',t:.12});
  // canvas awning on four poles over the front of the roof (the back edge higher, against the stair hut)
  const ay=LH+.16;for(const px of [-3.5,-.45])for(const pz of [-1.2,2.95])jjBeam([px,ay,pz],[px,ay+(pz<0?2.25:2.0),pz],.05,'wood');
  jjHouseBoxQ(-1.97,ay+2.14,.87,3.35,.04,4.25,'canvas',qEuler(.06,0,0));
  jjBox(-1.97,ay+1.86,3.0,3.35,.3,.03,'canvas');jjBox(-1.97,ay+.22,.9,.9,.4,1.9,'wood'); // valance; a rope bed in its shade
  // right house
  jjHouseBlock(RX0,RX1,LZ0,RZ1,0,RH,'brickDeep',{base:.5,baseMat:'brickDark',bands:[RH-.1],bandMat:'brick',bandH:.2});
  jjHouseBarrel((RX0+RX1)/2,RH,(LZ0+RZ1)/2,RX1-RX0-.04,RZ1-LZ0+.16,1.05,0,'ochre');
  jjBox(1.85,RH+.42,RZ1+.09,.42,.3,.04,'dark'); // vent in the lunette
  jjHouseDoor(1.25,0,RZ1,1,2.1,0,{frame:'brick',lintel:'marble',step:'brickDeep',t:.16});
  jjHouseWin(2.85,1.25,RZ1,.62,.72,0,Object.assign({shutter:'wood'},fr));
  jjBox(2.85,.23,RZ1+.48,1.3,.46,.9,'brickDeep'); // chabutra bench
  jjBeam([RX1,RH+.12,-.4],[RX1+.38,RH+.06,-.4],.06,'wood'); // rain spout
  jjHouseWin(RX1,1.5,-1.5,.55,.65,Math.PI/2,Object.assign({bars:true},fr));
  jjReg('Party-wall house (two storeys)',-2,0,3.8,8.4,{part:'house'});jjReg('Vaulted house',1.85,-.45,3.2,4.5,{part:'house'});}

/* ==== POOR B: narrow house, external stair ==== */
// a narrow two-storey ochre slab; a solid brick stair climbs its right side to a first-floor door and a
// corner landing, then turns along the back to the roof terrace. Timber jharokha over the front door.
function buildJjHousePoorB(jjG,jjO){reseed(9120+(jjO.v|0));
  const X0=-2.85,X1=1.75,Z0=-2.525,Z1=3.475,H=6.1,fr={frame:'brickDeep',lintel:'wood'};
  jjHouseBlock(X0,X1,Z0,Z1,0,H,'ochre',{base:1.2,baseMat:'brick',bands:[3.1],bandMat:'brickDeep',bandH:.14,cap:'brickDeep'});
  jjHouseParapet(X0,X1,Z0,Z1,H+.16,{h:.85,t:.24,mat:'ochre',cope:'brickDeep',gap:{side:'b',a:X0,b:X0+1.15}});
  // flight 1 up the right side, landing at the back corner, flight 2 along the back to the roof
  jjHouseStair(2.325,0,.525,1.05,6.1,3.1,14,0,{mat:'brick',tread:'brickDeep',cheek:[1],cheekT:.2,cheekH:.4});
  jjBox(2.325,1.55,-3.05,1.05,3.1,1.05,'brick');jjBox(2.325,3.07,-3.05,1.09,.06,1.09,'brickDeep');
  jjBox(2.95,3.5,-3.05,.2,.8,1.05,'brick');
  jjHouseStair(-.525,3.1,-3.05,1.05,4.6,3.16,13,Math.PI/2,{base:0,mat:'brick',tread:'brickDeep',cheek:[1],cheekT:.2,cheekH:.4});
  jjHouseDoor(X1,3.1,-1.95,.8,2,Math.PI/2,{frame:'brickDeep',lintel:'wood',step:'brickDeep',t:.12});
  // front
  jjHouseDoor(-.6,0,Z1,1,2.2,0,{frame:'brickDeep',lintel:'marble',step:'brickDeep',t:.16});
  jjHouseJharokha(-.6,3.55,Z1,1.7,1.9,.7,0,{mat:'wood',trim:'wood',roof:'pent',lattice:true});
  jjHouseWin(-2.1,1.4,Z1,.6,.72,0,Object.assign({bars:true},fr));jjHouseWin(1.05,3.85,Z1,.6,.9,0,Object.assign({shutter:'wood'},fr));
  jjHouseWin(X0,3.9,.4,.6,.85,-Math.PI/2,fr);jjHouseWin(X0,1.4,-1.2,.55,.65,-Math.PI/2,Object.assign({bars:true},fr));
  jjHouseWin(X1,1.4,1.4,.55,.65,Math.PI/2,Object.assign({bars:true},fr));
  // plain square chimney and roof clutter
  jjBox(1.15,H+.9,2.75,.7,1.8,.7,'brick');jjBox(1.15,H+1.86,2.75,.86,.12,.86,'brickDeep');jjBox(1.15,H+1.95,2.75,.4,.06,.4,'dark');
  jjBox(-.5,H+.36,-.6,.85,.4,1.8,'wood');jjCylinder(-2.3,H+.5,1.9,.36,.68,'tile',undefined,16);
  jjReg('Narrow house',-.55,.45,3.2,8.1,{part:'house'});jjReg('External stair',1.2,-1.6,2.6,6.4,{part:'stair'});}

/* ==== POOR C: L-plan round a yard ==== */
// a red-brick back wing and an ochre side wing round a tiny walled yard; the side wing's front room
// carries a small terracotta dome. Bread-oven dome, water jar and a ladder to the roof in the yard.
function buildJjHousePoorC(jjG,jjO){reseed(9130+(jjO.v|0));
  const H=3.3,fr={frame:'brickDeep',lintel:'wood'};
  jjHouseBlock(-3.8,3.8,-3.8,-.8,0,H,'brick',{base:.6,baseMat:'brickDeep',cap:'brickDeep'});
  jjHouseBlock(-3.8,-.8,-.8,3.8,0,H,'ochre',{base:.6,baseMat:'brickDeep',cap:'brickDeep'});
  jjHouseParapet(-3.8,3.8,-3.8,-.8,H+.16,{h:.7,t:.24,mat:'brick',cope:'brickDeep',skip:'f'});jjBox(1.5,H+.16+.35,-.92,4.6,.7,.24,'brick');jjBox(1.5,H+.16+.76,-.92,4.68,.12,.38,'brickDeep');
  jjHouseParapet(-3.8,-.8,-.8,3.8,H+.16,{h:.45,t:.24,mat:'ochre',cope:'brickDeep',skip:'b'});
  // the domed room: octagonal drum and a terracotta dome
  jjBox(-2.3,H+.3,1.5,2.7,.28,2.7,'ochre');jjCylinder(-2.3,H+.44+.28,1.5,1.24,.56,'ochre',undefined,16);jjCylinder(-2.3,H+1.04,1.5,1.3,.1,'brickDeep',undefined,16);
  jjHouseHemi(-2.3,H+1.08,1.5,1.2,'terracotta');jjCylinder(-2.3,H+2.38,1.5,.12,.4,'brickDeep',undefined,16);
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;jjBox(-2.3+Math.sin(a)*1.25,H+.72,1.5+Math.cos(a)*1.25,.3,.26,.06,'dark',undefined,a);}
  // yard: paving, walls, gate
  jjBox(1.375,.03,1.375,4.35,.06,4.35,'brickDeep');
  jjHouseWallRun(-.8,3.675,.6,3.675,1.8,{t:.26,mat:'ochre',cap:'brickDeep',base:.4});jjHouseWallRun(2.4,3.675,3.8,3.675,1.8,{t:.26,mat:'ochre',cap:'brickDeep',base:.4});
  jjHouseWallRun(3.67,-.8,3.67,3.8,1.8,{t:.26,mat:'ochre',cap:'brickDeep',base:.4});
  jjHouseArchWall(1.5,0,3.675,2.1,2.75,[0],1.2,1.75,0,{d:.34,mat:'brickDeep',trim:false});jjBox(1.5,2.83,3.675,2.3,.16,.5,'brickDeep');
  jjBox(1.2,1,3.62,.58,1.9,.06,'wood');jjBox(1.97,1,3.34,.58,1.9,.06,'wood',undefined,-1.1);
  // bread oven, water jar on a stand, ladder to the back roof
  jjCylinder(2.75,.28,.35,.82,.56,'brickDeep',undefined,16);jjHouseHemi(2.75,.56,.35,.74,'terracotta');jjBox(2.75,.82,1.05,.4,.32,.12,'dark');jjCylinder(2.95,1.36,.15,.08,.3,'brickDeep',undefined,16);
  const jar=jjHouseGeo('jar',()=>new THREE.LatheGeometry([[0,0],[.16,0],[.28,.14],[.34,.38],[.29,.6],[.14,.74],[.13,.82],[.18,.86],[0,.86]].map(q=>new THREE.Vector2(q[0],q[1])),16));
  jjBox(.1,.15,3.1,.8,.3,.6,'brickDeep');jjHousePutGeo('jar',jar,'terracotta',.1,.3,3.1,1,1,1);jjHousePutGeo('jar',jar,'terracotta',-.25,0,2.4,.8,.8,.8);
  for(const lx of [2.75,3.25])jjBeam([lx,0,-.25],[lx,H+.9,-.86],.045,'wood');for(let i=1;i<12;i++){const t=i/12;jjBeam([2.75,t*(H+.9),-.25-t*.61],[3.25,t*(H+.9),-.25-t*.61],.03,'wood');}
  // doors and windows
  jjHouseDoor(1.4,0,-.8,.95,2.1,0,{frame:'brickDeep',lintel:'marble',step:'brickDeep',t:.15});
  jjHouseDoor(-.8,0,1.4,.95,2.1,Math.PI/2,{frame:'brickDeep',lintel:'marble',step:'brickDeep',t:.15});
  jjHouseWin(-2.3,1.4,3.8,.7,.8,0,Object.assign({bars:true},fr));jjHouseWin(-3.8,1.4,1.5,.6,.75,-Math.PI/2,Object.assign({shutter:'wood'},fr));
  jjHouseWin(-3.8,1.4,-2.3,.6,.75,-Math.PI/2,fr);jjHouseWin(3.8,1.4,-2.3,.6,.75,Math.PI/2,Object.assign({bars:true},fr));jjHouseWin(-.4,1.35,-.8,.6,.7,0,Object.assign({shutter:'wood'},fr));
  jjReg('Yard house',-1,-1,4.2,4,{part:'house'});jjReg('Domed room',-2.3,1.5,1.6,5.8,{part:'dome'});jjReg('Yard',1.5,1.5,2.3,2,{part:'yard'});}

/* ==== MIDDLE A: stepped terraces ==== */
// three storeys, each set back from the one below: a terrace with built-in planters over the ground
// floor, an arched loggia on the second floor, a narrower top floor with an oriel; red brick with
// yellow bands. An engaged corner turret and a 3-shaft chimney stack break the stepped profile.
function buildJjHouseMidA(jjG,jjO){reseed(9140+(jjO.v|0));
  const X0=-5,X1=5,ZB=-5.3,P=.6,Y1=4,Y2=7.3,Y3=10.6,yel={bandMat:'brickYellow',bandH:.22};
  jjHouseBlock(-5.2,5.2,-5.5,4.6,0,P,'brickDeep',{bands:[.53],bandMat:'marble',bandH:.14});
  jjHouseStair(0,0,5.05,3,.9,P,3,0,{mat:'marble'});
  // storey 1 (full depth)
  jjHouseBlock(X0,X1,ZB,4.4,P,Y1,'brick',Object.assign({bands:[1.2,2.75]},yel));
  jjBox(0,Y1+.07,-.45,10.3,.16,9.95,'marble');const T1=Y1+.15;
  jjHouseDoor(0,P,4.4,1.2,2.45,0,{arch:true});
  jjBox(0,3.55,4.92,2.7,.12,1.05,'marble');for(const s of [-1,1])for(let k=0;k<2;k++)jjBox(s*1.15,3.38-k*.24,4.4+.5*(1-k*.4),.2,.24,1*(1-k*.4),k?'brickYellow':'marble');
  for(const s of [-1,1])jjHouseWin(s*3.1,1.45,4.4,.9,1.6,0,{arch:true,shutter:'wood'});
  for(const s of [-1,1])for(const z of [-3,1.2])jjHouseWin(s*5,1.5,z,.8,1.4,s*Math.PI/2,{arch:true});
  jjHousePorthole(5,3.1,-.9,Math.PI/2,.5,'marble');
  // terrace 1: parapet with marble coping, built-in planters
  jjHouseParapet(X0,X1,1.65,4.4,T1,{h:.85,t:.24,mat:'brick',cope:'marble',skip:'b'});
  for(const s of [-1,1]){jjBox(s*1.9,T1+.25,3.92,1.9,.5,.7,'brickYellow');jjBox(s*1.9,T1+.47,3.92,1.66,.08,.5,'brickDark');}
  // storey 2: solid block behind an arched loggia
  jjHouseBlock(X0,X1,ZB,.25,T1,Y2,'brick',Object.assign({bands:[5.4]},yel));
  for(const s of [-1,1])jjBox(s*4.78,(T1+Y2)/2,.75,.44,Y2-T1,1.0,'brick');
  jjHouseArchWall(0,T1,1.42,10,Y2-T1,[-3.15,0,3.15],2.3,1.15,0,{d:.46,mat:'brick'});
  for(const s of [-1,1])jjBox(s*3.15,T1+.45,1.5,2.3,.9,.2,'marble');
  jjHouseDoor(0,T1,.25,1.1,2.3,0,{arch:true});for(const s of [-1,1])jjHouseWin(s*3.15,T1+.9,.25,.8,1.5,0,{arch:true});
  for(const s of [-1,1])jjHouseWin(s*5,T1+1,-2.6,.8,1.4,s*Math.PI/2,{arch:true});
  jjBox(0,Y2+.08,-2.5,10.3,.16,5.9,'marble');jjBox(0,Y2+.08,1.0,10.3,.16,1.5,'marble');const T2=Y2+.16;
  jjHouseParapet(X0,X1,ZB,1.65,T2,{h:.85,t:.24,mat:'brick',cope:'marble'});
  // storey 3: narrower, set back again, an oriel on its front
  jjHouseBlock(X0,2,ZB,-1.4,T2,Y3,'brick',Object.assign({bands:[8.35]},yel));
  jjHouseJharokha(-1.5,8.05,-1.4,2,1.8,.75,0,{mat:'brickYellow',trim:'marble',roof:'dome',kind:'terracotta'});
  jjHouseWin(-4,8.15,-1.4,.75,1.4,0,{arch:true,shutter:'wood'});jjHouseWin(1,8.15,-1.4,.75,1.4,0,{arch:true,shutter:'wood'});
  jjHouseWin(2,8.2,-3.4,.75,1.3,Math.PI/2,{arch:true});jjHouseWin(X0,8.2,-3.4,.75,1.3,-Math.PI/2,{arch:true});
  const T3=jjHouseCornice(X0,2,ZB,-1.4,Y3);
  jjHouseParapet(X0-.25,2.25,ZB-.25,-1.15,T3,{h:.45,t:.24,mat:'brick',merlon:.8,merlonMat:'brickYellow',merlonH:.45});
  // engaged corner turret rising from terrace 1, and the chimney stack on the top roof
  jjTurret(3.95,T1,3.35,.8,5.6,{kind:'terracotta',pattern:'ogee'});
  jjChimneyStack(-3,Y3,-4.15,{n:3,h:2.4,r:.3,seed:1,patterns:['spiral','diamond','chevron']});
  jjReg('Stepped house',0,-.4,5.6,11.4,{part:'house'});jjReg('Corner turret',3.95,3.35,1.2,11.4,{part:'turret'});jjReg('Chimney stack',-3,-4.15,1.4,15.3,{part:'chimney'});}

/* ==== MIDDLE B: tower house with a wing ==== */
// a four-storey banded-brick tower on a 6 x 6 m plan with a one-storey wing: stacked oriels up the
// front, a bulbous turret corbelled out of the front-right corner, a terracotta onion on a drum.
function buildJjHouseMidB(jjG,jjO){reseed(9150+(jjO.v|0));
  jjHouseShift(-.55,-.55,()=>{
    const P=.6,TX=2,TH=13;
    jjHouseBlock(-5,5,-3,3,0,P,'brickDeep',{bands:[.53],bandMat:'marble',bandH:.14});
    jjHouseStair(TX,0,3.45,2.4,.9,P,3,0,{mat:'marble'});
    jjHouseBlock(-1,5,-3,3,P,TH,'bandBrick',{bands:[3.7,6.8,9.9],bandMat:'marble',bandH:.18});
    const C=jjHouseCornice(-1,5,-3,3,TH);
    jjHouseParapet(-1.3,5.3,-3.3,3.3,C,{h:.5,t:.28,mat:'brick',merlon:.75,merlonMat:'brickYellow',merlonH:.45});
    // the front: door, stacked oriels, flanking windows
    jjHouseDoor(TX,P,3,1.2,2.4,0,{arch:true});
    for(let k=0;k<3;k++)jjHouseJharokha(TX,4.25+k*3.1,3,2.2,2,.8,0,{mat:'brickYellow',trim:'marble',roof:k===2?'bangla':'chhajja'});
    for(const x of [0,4]){jjHousePorthole(x,2.35,3,0,.42,'marble');for(let k=0;k<3;k++)jjHouseWin(x,4.55+k*3.1,3,.62,1.3,0,{arch:true});}
    // side and back faces
    for(let k=0;k<4;k++){const y=P+1.1+k*3.1;
      jjHouseWin(5,y,-.6,.75,1.4,Math.PI/2,{arch:true,shutter:k===0?'wood':undefined});jjHouseWin(TX,y,-3,.75,1.4,Math.PI,{arch:true});
      if(k>0)jjHouseWin(-1,y,.4,.75,1.4,-Math.PI/2,{arch:true});}
    jjHousePorthole(5,11.9,1.4,Math.PI/2,.45,'marble');
    // onion on a drum
    jjCylinder(TX,C+.7,0,1.9,1.4,'brickYellow',undefined,32);jjCylinder(TX,C+.12,0,2.05,.24,'marble',undefined,32);jjCylinder(TX,C+1.45,0,2.02,.14,'marble',undefined,32);
    for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;jjHouseWin(TX+Math.sin(a)*1.9,C+.35,Math.cos(a)*1.9,.36,.75,a,{arch:true,t:.12,sill:false});}
    jjHouseOnion(TX,C+1.52,0,1.92,3.3,'terracotta','marble');
    // bulbous corner turret corbelled out at storey 3
    const cx=5,cz=3;
    for(let k=0;k<4;k++)jjCylinder(cx,6.95-k*.24,cz,1.05-k*.26,.24,k%2?'marble':'brickYellow',undefined,16);
    jjCylinder(cx,(7.05+C+.7)/2,cz,1.05,C+.7-7.05,'brick',undefined,32);
    for(const y of [9.9,TH])jjCylinder(cx,y,cz,1.09,.18,'marble',undefined,32);
    for(const y of [8.1,11.2])jjHouseWin(cx+Math.sin(Math.PI/4)*1.05,y,cz+Math.cos(Math.PI/4)*1.05,.42,.95,Math.PI/4,{arch:true,t:.12});
    jjCylinder(cx,C+.85,cz,1.22,.3,'brickYellow',undefined,32);
    for(let k=0;k<8;k++){const a=k*TAU/8;jjBox(cx+Math.cos(a)*1.14,C+1.2,cz+Math.sin(a)*1.14,.36,.42,.22,'brick',undefined,-a+Math.PI/2);}
    jjHouseOnion(cx,C+1,cz,.88,1.8,'terracotta','marble');
    // the wing: one storey, roof terrace
    jjHouseBlock(-5,-1,-3,1.6,P,4,'brick',{bands:[2.3],bandMat:'brickYellow',bandH:.2});
    jjBox(-3,4.08,-.7,4.2,.16,4.8,'marble');
    jjHouseParapet(-5,-1,-3,1.6,4.16,{h:.8,t:.22,mat:'brick',cope:'marble',skip:'r'});
    jjHouseWin(-3,1.4,1.6,1.3,1.8,0,{arch:true,shutter:'wood'});jjHouseWin(-5,1.5,-.7,.8,1.5,-Math.PI/2,{arch:true});
    jjHouseDoor(-1,4.16,-.9,.9,2.1,-Math.PI/2,{arch:true});
    jjBox(-3.6,P+.22,2.4,1.8,.44,.6,'marble'); // bench on the wing's front terrace
    jjReg('Tower house',TX,0,4.3,19.6,{part:'tower'});jjReg('Wing',-3,-.7,2.6,5,{part:'wing'});jjReg('Corner turret',cx,cz,1.3,17.6,{part:'turret'});});}

/* ==== MIDDLE C: shop-house ==== */
// a T-plan: a wide front block whose ground floor is an arcaded loggia (four arches on patterned
// columns) in front of the shop, with a yellow-brick upper block (balcony floor, porthole floor) over
// it, and a red two-storey rear wing with a roof terrace. Awning sockets over the arches.
function buildJjHouseMidC(jjG,jjO){reseed(9160+(jjO.v|0));
  const DZ=-.4;
  jjHouseShift(0,DZ,()=>{
    const P=.45,G=4.45,U=10.65,ZF=5.3;
    jjHouseBlock(-6,6,-.4,5.4,0,P,'brickDeep',{bands:[.4],bandMat:'marble',bandH:.1});jjHouseBlock(-3,3,-5.4,-.4,0,P,'brickDeep');
    jjBox(0,.11,5.6,12,.22,.4,'marble');
    // ground: shop wall behind the loggia
    jjHouseBlock(-6,6,-.4,3.4,P,G,'brick');
    for(const s of [-1,1]){const x=s*3;jjBox(x,P+1.45,3.42,2.3,2.2,.1,'dark');jjBox(x,P+.45,3.62,2.5,.9,.45,'marble');jjBox(x,P+2.65,3.48,2.6,.2,.2,'wood');
      for(const t of [-1,1])jjBox(x+t*1.22,P+1.45,3.5,.12,2.2,.14,'wood');
      jjBox(x-.6,P+1.05,3.66,.5,.3,.36,'wood');jjCylinder(x+.5,P+1.1,3.66,.18,.4,'tile',undefined,16);}
    jjHouseDoor(0,P,3.4,1.1,2.4,0,{arch:true});
    jjHouseColonnade(0,P,5,4,3,2.6,G-P-2.6,0,{r:.3,patterns:['diamond','chevron','spiral','chevron','diamond'],mat:'brick',d:.6,cornice:false});
    jjBox(0,G-.2,1.95,12,.4,6.7,'brick'); // loggia ceiling / first floor
    // upper block, yellow-dominant with red bands
    jjHouseBlock(-6,6,-.4,ZF,G,U,'brickYellow',{bands:[G+.15,7.55],bandMat:'brick',bandH:.3});
    for(let i=0;i<4;i++){const x=-4.5+i*3;jjHouseWin(x,5.35,ZF,.9,1.75,0,{arch:true,shutter:'wood'});jjHousePorthole(x,9.15,ZF,0,.55,'marble');}
    for(const x of [-3,0,3])jjHouseWin(x,8.6,ZF,.42,1.1,0,{arch:true,t:.14});
    // balcony on brackets with balusters
    jjBox(0,5.2,ZF+.45,11.6,.16,.9,'marble');for(let i=0;i<7;i++){const x=-5.4+i*1.8;for(let k=0;k<2;k++)jjBox(x,5.02-k*.24,ZF+.45*(1-k*.4),.18,.24,.9*(1-k*.4),k?'brick':'marble');}
    jjBox(0,6.12,ZF+.84,11.6,.1,.14,'marble');for(let i=0;i<=29;i++)jjCylinder(-5.75+i*11.5/29,5.7,ZF+.84,.045,.82,'marble',undefined,16);
    for(const s of [-1,1])jjBox(s*5.76,5.7,ZF+.48,.1,.9,.8,'marble');
    for(const s of [-1,1]){jjHouseWin(s*6,5.4,1.2,.8,1.6,s*Math.PI/2,{arch:true});jjHousePorthole(s*6,9.15,1.2,s*Math.PI/2,.5,'marble');}
    const C=jjHouseCornice(-6,6,-.4,ZF,U);
    jjHouseParapet(-6.3,6.3,-.7,ZF+.3,C,{h:.55,t:.3,mat:'brickYellow',merlon:.9,merlonMat:'brick',merlonH:.55});
    // raised nameboard gable over the centre, its sun emblem from the culture pack
    jjHouseBlock(-1.7,1.7,ZF-.15,ZF+.25,C,C+1.75,'brick',{cap:'marble'});for(const s of [-1,1]){jjBox(s*1.7,C+1.2,ZF+.05,.4,2.4,.5,'marble');jjHouseFinial(s*1.7,C+2.4,ZF+.05,.6,'marble');}
    // rear wing
    jjHouseBlock(-3,3,-5.4,-.4,P,7.65,'brick',{bands:[G],bandMat:'brickYellow',bandH:.22});
    jjBox(0,7.73,-2.9,6.2,.16,5.2,'marble');jjHouseParapet(-3,3,-5.4,-.4,7.81,{h:.85,t:.22,mat:'brick',cope:'marble',skip:'f'});
    for(const s of [-1,1])for(const y of [1.5,5.3])jjHouseWin(s*3,y,-2.9,.8,1.5,s*Math.PI/2,{arch:true});
    jjHouseDoor(0,P,-5.4,1,2.3,Math.PI,{arch:true});jjHouseWin(0,5.3,-5.4,.8,1.5,Math.PI,{arch:true});
    jjChimneyStack(3.9,U,.7,{n:2,h:2.6,r:.34,seed:3,patterns:['diamond','spiral']});
    jjReg('Shop-house',0,2.5,6.4,12.9,{part:'house'});jjReg('Loggia',0,4.4,6,4.5,{part:'loggia',type:['market/shop']});jjReg('Chimney stack',3.9,.7,1.2,15.4,{part:'chimney'});});
  // awning sockets over the four arches (sockets ignore jjHouseShift, so the offset is added here)
  for(let i=0;i<4;i++)jjAwning(-4.5+i*3,4.2,5.32+DZ,0,{w:2.3,d:.9,drop:.4,h:3.8});
  sock('emblem',0,10.65+.62+.95,5.3+.27+DZ,0,{w:1.3,h:1.1});}

/* ==== RICH A: courtyard mansion ==== */
// four two-storey ranges round a court, each face of the court a two-storey arcade on patterned
// columns; a pishtaq gate (tall framed arch, gold porthole, guldasta finials); a taller back hall
// under a ribbed gold dome; a 4-shaft chimney stack; a sunray-paved basin spot in the court.
function buildJjHouseRichA(jjG,jjO){reseed(9170+(jjO.v|0));
  jjHouseShift(0,-.325,()=>{
    const P=1.5,M=5.7,R=9.9,FZ=8.75,BZ=-11.75,lit={arch:true,lit:true};
    jjHouseBlock(-11,11,BZ,FZ,0,P,'brickDeep',{bands:[P-.07],bandMat:'marble',bandH:.16});
    jjHouseBlock(-3.9,3.9,FZ,FZ+1.15,0,P,'brickDeep',{bands:[P-.07],bandMat:'marble',bandH:.16});
    jjHouseStair(0,0,FZ+1.15+1.25,6,2.5,P,7,0,{mat:'marble',cheek:[-1,1],cheekMat:'brickDeep'});
    // the ranges (outer ring), solid down to the gallery line
    const yb={bands:[3.6,M,7.8],bandMat:'brickYellow',bandH:.22};
    jjHouseBlock(-11,11,5.75,FZ,P,R,'brick',yb);jjHouseBlock(-11,11,BZ,-7.25,P,R,'brick',yb);
    jjHouseBlock(-11,-7.5,-7.25,5.75,P,R,'brick',yb);jjHouseBlock(7.5,11,-7.25,5.75,P,R,'brick',yb);
    // gallery slabs (first floor and roof) round the court
    for(const y of [M-.15,R-.15]){jjBox(0,y,4.75,15,.3,2,'marble');jjBox(0,y,-6.25,15,.3,2,'marble');jjBox(-6.5,y,-.75,2,.3,9,'marble');jjBox(6.5,y,-.75,2,.3,9,'marble');}
    // two-storey court arcades on all four sides
    const pa=['diamond','spiral','chevron','fleur'];
    const arc=(y,ch,sp,rail)=>{jjHouseColonnade(0,y,3.75,3,11/3,ch,sp,Math.PI,{r:.3,patterns:pa,d:.5,rail,railSkip:[1]});jjHouseColonnade(0,y,-5.25,3,11/3,ch,sp,0,{r:.3,patterns:pa,d:.5,rail});
      jjHouseColonnade(-5.5,y,-.75,3,3,ch,sp,Math.PI/2,{r:.3,patterns:pa,d:.5,ends:false,rail});jjHouseColonnade(5.5,y,-.75,3,3,ch,sp,-Math.PI/2,{r:.3,patterns:pa,d:.5,ends:false,rail});};
    arc(P,2.6,M-.3-P-2.6);arc(M,2.3,R-.3-M-2.3,'marble');
    // gallery back walls: doors and windows
    for(const y of [P,M]){jjHouseDoor(0,y,5.75,1.3,2.6,Math.PI,{arch:true});jjHouseDoor(0,y,-7.25,1.3,2.6,0,{arch:true});
      for(const s of [-1,1]){jjHouseDoor(s*7.5,y,-.75,1.2,2.5,-s*Math.PI/2,{arch:true});for(const x of [-4.2,4.2]){jjHouseWin(x,y+.9,5.75,.8,1.5,Math.PI,lit);jjHouseWin(x,y+.9,-7.25,.8,1.5,0,lit);}jjHouseWin(s*7.5,y+.9,-4.2,.8,1.5,-s*Math.PI/2,lit);jjHouseWin(s*7.5,y+.9,2.7,.8,1.5,-s*Math.PI/2,lit);}}
    // court: marble floor and the basin spot (a sunray disc with a low octagonal kerb)
    jjBox(0,P+.03,-.75,11,.06,9,'marble');
    jjPut('jj_house_sunray_disc',jjHouseGeo('disc48',()=>new THREE.CylinderGeometry(1,1,1,48)),JMAT.sunray,0,P+.07,-.75,2.9,.04,2.9,undefined,null);
    for(let k=0;k<8;k++){const a=k*TAU/8+Math.PI/8;jjBox(Math.sin(a)*1.55,P+.24,-.75+Math.cos(a)*1.55,1.28,.36,.26,'marble',undefined,a);}
    jjCylinder(0,P+.1,-.75,1.45,.05,'brickDeep',undefined,16);
    // pishtaq gate
    const GZ=FZ+.575;
    jjHouseArchWall(0,P,GZ,7.2,10.6,[0],3.6,4.3,0,{d:1.15,mat:'brick',trimMat:'marble',trimT:.3,key:'gold'});
    for(const s of [-1,1]){jjBox(s*3.45,P+5.3,GZ+.62,.4,10.6,.1,'marble');jjBox(s*2.4,P+5.3,GZ+.6,.12,10.6,.06,'brickYellow');}
    jjBox(0,P+10.65,GZ,7.6,.3,1.5,'marble');jjBox(0,P+7.5,GZ+.6,4.4,.14,.1,'marble');
    for(let i=0;i<7;i++)jjBox(-3.15+i*1.05,P+11.05,GZ,.5,.5,1.1,'brickYellow');
    jjHouseDoor(0,P,FZ,3,5.4,0,{arch:true,studs:true,t:.2});
    jjHousePorthole(0,P+9.05,GZ+.58,0,.95,'gold');
    for(const s of [-1,1]){jjHouseLamp(s*2.45,P+3.8,GZ+.58);
      jjBrickShaft(s*3.45,P+10.8,GZ,.36,2.2,{pattern:'spiral',section:'octagon',cap:'none',base:false});jjCylinder(s*3.45,P+13.05,GZ,.46,.14,'marble',undefined,16);jjHouseOnion(s*3.45,P+13.12,GZ,.4,.9,'domeGold','gold');}
    // outer façades
    for(const s of [-1,1]){
      jjHouseJharokha(s*7.2,M+.35,FZ,2.4,2.3,.9,0,{mat:'brickYellow',trim:'marble',roof:'onion',kind:'gold',glass:'glass'});
      for(const x of [5,9.6])jjHouseWin(s*x,M+.9,FZ,.8,1.6,0,lit);for(const x of [5.4,8.9])jjHouseWin(s*x,P+1.1,FZ,.85,1.7,0,lit);
      for(let i=0;i<5;i++){const z=-9.5+i*4.3;jjHouseWin(s*11,P+1.1,z,.85,1.7,s*Math.PI/2,lit);if(i!==2)jjHouseWin(s*11,M+.9,z,.8,1.6,s*Math.PI/2,lit);}
      jjHouseJharokha(s*11,M+.35,-.9,2.4,2.3,.9,s*Math.PI/2,{mat:'brickYellow',trim:'marble',roof:'chhajja',glass:'glass'});
      for(const x of [6.5,9.5])for(const y of [P+1.1,M+.9])jjHouseWin(s*x,y,BZ,.8,1.6,Math.PI,lit);}
    // back hall under the gold dome
    jjHouseBlock(-4.5,4.5,BZ,-6.75,R,12.6,'brick',{bands:[R+.1,11.4],bandMat:'brickYellow',bandH:.22});
    for(const x of [-2.6,0,2.6]){jjHouseWin(x,R+.85,-6.75,.7,1.3,0,lit);jjHouseWin(x,R+.85,BZ,.7,1.3,Math.PI,lit);}
    const HC=jjHouseCornice(-4.5,4.5,BZ,-6.75,12.6);
    jjHouseParapet(-4.8,4.8,BZ-.3,-6.45,HC,{h:.35,t:.26,mat:'brick',merlon:.8,merlonMat:'brickYellow',merlonH:.4});
    jjCylinder(0,HC+.9,-9.25,2.35,1.8,'brickYellow',undefined,32);jjCylinder(0,HC+.08,-9.25,2.5,.16,'marble',undefined,32);jjCylinder(0,HC+1.82,-9.25,2.5,.16,'marble',undefined,32);
    for(let k=0;k<8;k++){const a=k*TAU/8;jjHouseWin(Math.sin(a)*2.35,HC+.45,-9.25+Math.cos(a)*2.35,.4,.95,a,{arch:true,t:.12,sill:false,lit:true});}
    jjDome(0,HC+1.9,-9.25,2.45,{kind:'gold',shape:'hemi',ribs:true});
    // roof: crenellated parapets outside, a plain one round the court, the chimney stack
    jjHouseParapet(-11,11,BZ,FZ,R,{h:.75,t:.28,mat:'brick',cope:'marble',merlon:1,merlonMat:'brickYellow',merlonH:.5,gap:{side:'f',a:-3.6,b:3.6}});
    jjHouseParapet(-5.5,5.5,-5.25,3.75,R,{h:.7,t:.22,mat:'brick',cope:'marble'});
    jjChimneyStack(9.25,R,-1.5,{n:4,h:3,r:.34,seed:2});
    jjReg('Courtyard mansion',0,-1.5,11,12,{part:'house'});jjReg('Court',0,-.75,5,6,{part:'court'});jjReg('Pishtaq gate',0,GZ,3.8,14.8,{part:'gate'});
    jjReg('Gold dome',0,-9.25,2.6,17.5,{part:'dome'});jjReg('Chimney stack',9.25,-1.5,1.4,15,{part:'chimney'});});}

/* ==== RICH B: pavilion villa ==== */
// no courtyard: a compact yellow-brick block on a tall marble podium, reached by a wide frontal stair;
// two storeys of deep loggias on all four sides; a big gold onion on a windowed drum; four open
// six-column chhatris at the roof corners. A reflecting-pool spot (marble kerb) on the front terrace.
function buildJjHouseRichB(jjG,jjO){reseed(9180+(jjO.v|0));
  const P=2.7,ZC=-4.25,lit={arch:true,lit:true};
  // podium with framed yellow panels
  jjHouseBlock(-9,9,-11.75,7.25,0,P,'marble',{base:.45,baseMat:'brickDeep'});
  jjBox(0,P-.08,-2.25,18.36,.16,19.36,'marble');jjBox(0,P-.3,-2.25,18.2,.12,19.2,'brickYellow');
  const pan=(x,z,ry)=>jjWithYaw(x,0,z,ry,()=>{jjBox(x,1.45,z+.03,1.9,1.15,.06,'brickYellow');jjBox(x,1.45,z+.06,2.1,.1,.06,'marble');jjBox(x,.92,z+.06,2.1,.1,.06,'marble');jjBox(x,1.98,z+.06,2.1,.1,.06,'marble');for(const s of [-1,1])jjBox(x+s*1,1.45,z+.06,.1,1.15,.06,'marble');});
  for(let i=0;i<7;i++){const t=-7.7+i*2.567;for(const s of [-1,1])pan(s*9,ZC+t*1.15+1.9,s*Math.PI/2);pan(t,-11.75,Math.PI);}
  for(const s of [-1,1])for(const x of [5.95,7.85])pan(s*x,7.25,0);
  jjHouseStair(0,0,9.5,9,4.5,P,12,0,{mat:'marble',cheek:[-1,1],cheekMat:'marble',cheekT:.4});
  for(const s of [-1,1]){jjBox(s*4.7,.7,11.5,.6,1.4,.5,'marble');jjHouseFinial(s*4.7,1.4,11.5,.7,'gold');}
  // pool spot on the front terrace (the pool is furniture)
  for(const s of [-1,1]){jjBox(s*3,P+.14,4.4,.24,.28,3.6,'marble');jjBox(0,P+.14,4.4+s*1.68,6.24,.28,.24,'marble');}
  jjBox(0,P+.015,4.4,5.8,.03,3.2,'brickDeep');
  // block: solid yellow core inside two storeys of loggias
  jjHouseBlock(-4,4,ZC-4,ZC+4,P,11.05,'brickYellow',{bands:[4.2,8.8],bandMat:'brick',bandH:.3});
  const L1=3.1,S1=1.25,L2=2.6,S2=1.1,M=P+L1+S1;
  const pa=['chevron','spiral','diamond','spiral','chevron'];
  for(const [y,ch,sp,rail] of [[P,L1,S1,null],[M+.3,L2,S2,'marble']]){
    jjHouseColonnade(0,y,ZC+6,4,3,ch,sp,0,{r:.32,patterns:pa,mat:'brickYellow',trimMat:'marble',key:'gold',d:.6,rail,railSkip:y===P?[1,2]:[]});
    jjHouseColonnade(0,y,ZC-6,4,3,ch,sp,Math.PI,{r:.32,patterns:pa,mat:'brickYellow',key:'gold',d:.6,rail});
    jjHouseColonnade(-6,y,ZC,4,3,ch,sp,-Math.PI/2,{r:.32,patterns:pa,mat:'brickYellow',key:'gold',d:.6,ends:false,rail});
    jjHouseColonnade(6,y,ZC,4,3,ch,sp,Math.PI/2,{r:.32,patterns:pa,mat:'brickYellow',key:'gold',d:.6,ends:false,rail});}
  jjBox(0,M+.15,ZC,12.5,.3,12.5,'marble');jjBox(0,11.2,ZC,12.6,.3,12.6,'marble');jjBox(0,10.95,ZC,12.3,.2,12.3,'brick');
  // core façades seen through the loggias
  jjHouseDoor(0,P,ZC+4,1.6,3.2,0,{arch:true,studs:true,lamps:true});
  for(const s of [-1,1]){jjHouseWin(s*2.5,P+1,ZC+4,.9,2,0,lit);jjHouseWin(s*4,P+1,ZC,.9,2,s*Math.PI/2,lit);jjHouseWin(s*4,M+.9,ZC,.9,1.9,s*Math.PI/2,lit);jjHouseWin(s*2.5,P+1,ZC-4,.9,2,Math.PI,lit);}
  for(const x of [-2.5,0,2.5]){jjHouseWin(x,M+.9,ZC+4,.85,1.9,0,lit);jjHouseWin(x,M+.9,ZC-4,.85,1.9,Math.PI,lit);}
  // roof: marble balustrade, drum, gold onion, four chhatris
  const RT=11.35;jjHouseParapet(-6.3,6.3,ZC-6.3,ZC+6.3,RT,{h:.7,t:.2,mat:'marble',cope:'marble'});
  jjCylinder(0,RT+1.3,ZC,3.3,2.6,'brickYellow',undefined,32);jjCylinder(0,RT+.12,ZC,3.45,.24,'marble',undefined,32);jjCylinder(0,RT+1.9,ZC,3.33,.3,'brick',undefined,32);jjCylinder(0,RT+2.62,ZC,3.5,.2,'marble',undefined,32);
  for(let k=0;k<8;k++){const a=k*TAU/8+Math.PI/8;jjHouseWin(Math.sin(a)*3.3,RT+.45,ZC+Math.cos(a)*3.3,.55,1.1,a,{arch:true,t:.14,sill:false,lit:true});}
  jjHouseOnion(0,RT+2.7,ZC,3.3,5.8,'domeGold','gold');
  for(const sx of [-1,1])for(const sz of [-1,1])jjHouseChhatri(sx*4.65,RT,ZC+sz*4.65,2.1,{n:6,h:2.1,dome:'gold',shape:'onion'});
  jjReg('Pavilion villa',0,ZC,6.6,12,{part:'house'});jjReg('Podium',0,-2.25,9.5,P,{part:'podium'});jjReg('Gold onion dome',0,ZC,3.9,21.3,{part:'dome'});
  for(const sx of [-1,1])for(const sz of [-1,1])jjReg('Chhatri',sx*4.65,ZC+sz*4.65,1.3,16.6,{part:'chhatri'});}

/* ==== RICH C: tower compound ==== */
// an L-plan: a main wing along the back and a side wing down the left; their corner rises as a square
// tower into a thick three-stage round spire with gold portholes. A slate ribbed dome with a lantern
// over the main wing; the open side of the L is a walled garden with an arched gate.
function buildJjHouseRichC(jjG,jjO){reseed(9190+(jjO.v|0));
  const P=1.2,M=5.3,R=9.4,TT=13,lit={arch:true,lit:true},bd={bands:[3.3,M,7.4],bandMat:'brickDark',bandH:.2};
  // plinth under the L, front stair to the side wing
  jjHouseBlock(-11,11,-11,-4,0,P,'brickDeep',{bands:[P-.07],bandMat:'marble',bandH:.14});jjHouseBlock(-11,-4,-4,8.6,0,P,'brickDeep',{bands:[P-.07],bandMat:'marble',bandH:.14});
  jjHouseStair(-7.5,0,9.8,3,2.4,P,6,0,{mat:'marble',cheek:[-1,1],cheekMat:'brickDeep'});
  // main wing (back) and side wing (left; its garden side is a ground-floor loggia)
  jjHouseBlock(-4,11,-11,-4,P,R,'brick',bd);
  jjHouseBlock(-11,-6,-4,8.6,P,R,'brick',bd);jjHouseBlock(-6,-4,-4,8.6,M,R,'brick',{bands:[7.4],bandMat:'brickDark',bandH:.2});
  jjBox(-5,M-.15,2.3,2.1,.3,12.6,'marble');
  jjHouseColonnade(-4.3,P,2.3,4,3,2.5,M-.3-P-2.5,Math.PI/2,{r:.3,patterns:['tracery','diamond','ogee'],trimMat:'marble',key:'gold',d:.5});
  for(const z of [-1.9,4.1])jjHouseDoor(-6,P,z,1.2,2.5,Math.PI/2,{arch:true,lamps:z>0});for(const z of [1.1,7.1])jjHouseWin(-6,P+1,z,.85,1.7,Math.PI/2,lit);
  // tower base at the corner of the L
  jjHouseBlock(-11,-4,-11,-4,P,TT,'brick',{bands:[3.3,M,7.4,R,11.2],bandMat:'brickDark',bandH:.2});
  const TC=jjHouseCornice(-11,-4,-11,-4,TT,{m2:'brickDark'});
  jjHouseParapet(-11.3,-3.7,-11.3,-3.7,TC,{h:.55,t:.3,mat:'brick',merlon:.8,merlonMat:'brickYellow',merlonH:.5});
  for(const [x,z] of [[-11,-11],[-11,-4],[-4,-11],[-4,-4]]){jjCylinder(x,TT-.6,z,.6,1.2,'brickYellow',undefined,16);for(let k=0;k<3;k++)jjCylinder(x,TT-1.35-k*.25,z,.5-k*.15,.25,'marble',undefined,16);
    jjCylinder(x,TC+.9,z,.55,1.8,'brick',undefined,16);jjCylinder(x,TC+1.85,z,.64,.12,'marble',undefined,16);jjHouseOnion(x,TC+1.9,z,.55,1.1,'domeGold','gold');}
  for(const [x,z,ry] of [[-7.5,-4,0],[-4,-7.5,Math.PI/2],[-11,-7.5,-Math.PI/2],[-7.5,-11,Math.PI]])jjHousePorthole(x,11.3,z,ry,.62,'gold');
  for(const y of [P+1.1,M+.9])for(const [x,z,ry] of [[-11,-7.5,-Math.PI/2],[-7.5,-11,Math.PI]])jjHouseWin(x,y,z,.85,1.7,ry,lit);
  // the spire
  jjHouseSpire(-7.5,TC,-7.5,2.9,{stages:3,stageH:2.8,mats:['brick','shaft_chevron','brickYellow'],ports:[0,Math.PI/2,-Math.PI/2,Math.PI]});
  // main wing façades
  jjHouseDoor(3.5,P,-4,1.5,3,0,{arch:true,studs:true,lamps:true});
  for(const x of [-1.5,1,6,8.5])jjHouseWin(x,P+.9,-4,.9,2,0,lit);
  jjBox(3.5,M+.08,-3.55,13.6,.16,.9,'marble');jjBox(3.5,M+.88,-3.15,13.6,.08,.12,'marble');for(let i=0;i<=40;i++)jjCylinder(-3.2+i*13.4/40,M+.52,-3.15,.04,.72,'marble',undefined,16);
  for(let i=0;i<8;i++)jjBox(-3+i*13/7,M-.2,-3.75,.18,.3,.5,'marble');
  for(const x of [-2,1.2,5.8,9])jjHouseWin(x,M+.4,-4,.9,2.1,0,lit);jjHousePorthole(3.5,M+1.7,-4,0,.65,'gold');
  for(const y of [P+1.1,M+.9]){for(const x of [-1,3.5,8])jjHouseWin(x,y,-11,.85,1.7,Math.PI,lit);for(const z of [-9,-6])jjHouseWin(11,y,z,.85,1.7,Math.PI/2,lit);
    for(const z of [-1,2.5,6])jjHouseWin(-11,y,z,.85,1.7,-Math.PI/2,lit);}
  // side wing: front door with an oriel over it, garden-side oriels
  jjHouseDoor(-7.5,P,8.6,1.4,2.8,0,{arch:true,lamps:true});jjHouseJharokha(-7.5,M+.35,8.6,2.4,2.3,.9,0,{mat:'brickYellow',trim:'marble',roof:'onion',kind:'gold',glass:'glass'});
  for(const x of [-10,-5])jjHouseWin(x,M+.9,8.6,.75,1.6,0,lit);
  for(const z of [-.9,5.4])jjHouseJharokha(-4,M+.35,z,2.2,2.2,.85,Math.PI/2,{mat:'brickYellow',trim:'marble',roof:'chhajja',glass:'glass'});jjHouseWin(-4,M+.9,2.25,.8,1.6,Math.PI/2,lit);
  // roofs: cornices, parapets, slate ribbed dome with a lantern, chimney stack
  const RC=jjHouseCornice(-4,11,-11,-4,R,{m2:'brickDark'});jjHouseCornice(-11,-4,-4,8.6,R,{m2:'brickDark'});
  jjHouseParapet(-4.3,11.3,-11.3,-3.7,RC,{h:.5,t:.28,mat:'brick',merlon:.85,merlonMat:'brickYellow',merlonH:.45,skip:'l'});
  jjHouseParapet(-11.3,-3.7,-3.7,8.9,RC,{h:.5,t:.28,mat:'brick',merlon:.85,merlonMat:'brickYellow',merlonH:.45,skip:'b'});
  const DX=3.5,DZ=-7.5;jjCylinder(DX,R+.75,DZ,2.6,1.5,'brick',undefined,32);jjCylinder(DX,RC+.05,DZ,2.75,.16,'marble',undefined,32);jjCylinder(DX,R+1.52,DZ,2.72,.16,'marble',undefined,32);
  for(const a of [0,Math.PI/2,-Math.PI/2,Math.PI])jjHousePorthole(DX+Math.sin(a)*2.6,R+.78,DZ+Math.cos(a)*2.6,a,.42,'gold');
  const DT=R+1.6;jjDome(DX,DT,DZ,2.6,{kind:'slate',shape:'ribbed'});
  const LB=DT+2.45;jjCylinder(DX,LB+.08,DZ,.95,.2,'marble',undefined,16);
  for(let k=0;k<6;k++){const a=k*TAU/6;jjCylinder(DX+Math.cos(a)*.7,LB+.75,DZ+Math.sin(a)*.7,.08,1.1,'marble',undefined,16);}
  jjCylinder(DX,LB+.55,DZ,.45,.7,'glow',undefined,16);jjCylinder(DX,LB+1.38,DZ,1,.16,'marble',undefined,16);jjCylinder(DX,LB+1.52,DZ,.6,.14,'gold',undefined,16);
  jjHouseOnion(DX,LB+1.58,DZ,.55,1.1,'domeGold','gold');
  jjChimneyStack(-7.5,R,3.2,{n:3,h:2.8,r:.32,seed:4,patterns:['ogee','fleur','spiral']});
  // walled garden on the open side of the L, with an arched gate and cross paths
  jjHouseWallRun(-4,10.84,1.5,10.84,3,{t:.32,mat:'brick',merlon:.9,merlonMat:'brickYellow',base:.5});jjHouseWallRun(5.5,10.84,11,10.84,3,{t:.32,mat:'brick',merlon:.9,merlonMat:'brickYellow',base:.5});
  jjHouseWallRun(10.84,-4,10.84,11,3,{t:.32,mat:'brick',merlon:.9,merlonMat:'brickYellow',base:.5});
  jjHouseArchWall(3.5,0,10.84,4.2,4.7,[0],2.4,2.5,0,{d:.9,mat:'brick',trimMat:'marble',key:'gold'});jjBox(3.5,4.82,10.84,4.5,.24,1.1,'marble');
  for(const s of [-1,1]){jjBox(3.5+s*1.85,5.3,10.84,.6,.7,.6,'brickYellow');jjHouseFinial(3.5+s*1.85,5.65,10.84,.8,'gold');}
  for(const s of [-1,1])jjBox(3.5+s*.95,1.25,10.18+.1,.06,2.45,1.1,'wood',undefined,s*.35);
  jjBox(3.5,.03,3.4,1.6,.06,14.8,'marble');jjBox(3.5,.03,3.5,14.6,.06,1.6,'marble');jjCylinder(3.5,.07,3.5,1.5,.1,'marble',undefined,32);
  for(const sx of [-1,1])for(const sz of [-1,1]){const cx=3.5+sx*3.85,cz=3.5+sz*3.6;jjHouseParapet(cx-2.9,cx+2.9,cz-2.75,cz+2.75,0,{h:.32,t:.2,mat:'brickDeep',cope:'marble'});}
  jjReg('Tower compound',-3,-4,8,10,{part:'house'});jjReg('Spire',-7.5,-7.5,3.6,27,{part:'spire'});jjReg('Slate dome',DX,DZ,2.8,17,{part:'dome'});
  jjReg('Walled garden',3.5,3.5,7.4,3.5,{part:'garden'});jjReg('Chimney stack',-7.5,3.2,1.3,14.4,{part:'chimney'});}

/* ==== registry ==== */
JJ.def({key:'jj_house_poor_a',name:'Poor houses A — party-wall pair',family:'housing',row:'Housing — poor',w:8.4,d:7.8,h:8.5,r:4.3,cls:'building',plantSpots:JJHOUSE_SPOTS.poorA,tags:{type:['multi-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorA});
JJ.def({key:'jj_house_poor_b',name:'Poor house B — outside stair',family:'housing',row:'Housing — poor',w:6.2,d:8.4,h:8.1,r:3.9,cls:'building',plantSpots:JJHOUSE_SPOTS.poorB,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorB});
JJ.def({key:'jj_house_poor_c',name:'Poor house C — yard and dome',family:'housing',row:'Housing — poor',w:8.1,d:8.1,h:5.9,r:4.2,cls:'building',plantSpots:JJHOUSE_SPOTS.poorC,tags:{type:['single-family dwelling'],wealth:'poor',lit:false},build:buildJjHousePoorC});
JJ.def({key:'jj_house_mid_a',name:'Middle house A — stepped terraces',family:'housing',row:'Housing — middle',w:10.6,d:11.2,h:15.2,r:5.8,cls:'building',plantSpots:JJHOUSE_SPOTS.midA,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:buildJjHouseMidA});
JJ.def({key:'jj_house_mid_b',name:'Middle house B — tower house',family:'housing',row:'Housing — middle',w:11.5,d:7.8,h:19.6,r:5.8,cls:'building',plantSpots:JJHOUSE_SPOTS.midB,tags:{type:['single-family dwelling'],wealth:'middle',lit:false},build:buildJjHouseMidB});
JJ.def({key:'jj_house_mid_c',name:'Middle house C — shop-house',family:'housing',row:'Housing — middle',w:12.9,d:12.4,h:15.4,r:6.6,cls:'building',plantSpots:JJHOUSE_SPOTS.midC,tags:{type:['single-family dwelling','market/shop'],wealth:'middle',lit:false},build:buildJjHouseMidC});
JJ.def({key:'jj_house_rich_a',name:'Rich house A — courtyard mansion',family:'housing',row:'Housing — rich',w:24.5,d:24.5,h:18,r:12.2,cls:'building',plantSpots:JJHOUSE_SPOTS.richA,fountainSpot:[0,1.6,-1.075],tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichA});
JJ.def({key:'jj_house_rich_b',name:'Rich house B — pavilion villa',family:'housing',row:'Housing — rich',w:18.4,d:24,h:21.8,r:11.8,cls:'building',plantSpots:JJHOUSE_SPOTS.richB,poolSpot:[0,2.7,4.4],tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichB});
JJ.def({key:'jj_house_rich_c',name:'Rich house C — tower compound',family:'housing',row:'Housing — rich',w:23,d:23.2,h:27,r:11.4,cls:'building',plantSpots:JJHOUSE_SPOTS.richC,fountainSpot:[3.5,.12,3.5],tags:{type:['single-family dwelling'],wealth:'rich',lit:true},build:buildJjHouseRichC});
