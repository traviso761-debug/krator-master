// ================================================================= THE SANCTUM — the drawing (records in, geometry out)
// buildSanctum draws the Ancients' live/work arcology as built; buildSanctumKept the same plan (the same seed: the same
// building) with the Eternians' deltas applied (8aq1). Everything placed is registered in core/tags first (KTAGS: the
// arcology a building, its gates, bays, ridges and crown parts, the heads props, the colossus a landmark,
// the terminals fixtures, trees flora, people life), then drawn from the record. Nothing here decides where a thing goes.
//
// The shell is quads written straight into one buffer per material (the Drum's pattern: world-scale UVs, normals from
// the winding), so the whole structure is about twenty draw calls; the small things are kit instances.
const SN_SITE={};
function buildSanctum(scene,gx,gz,d){reseed(12100+d);return snDraw(scene,gx,gz,SANCTUM.dressIntact(SANCTUM.plan({seed:12100})),0);}
function buildSanctumKept(scene,gx,gz,d){reseed(12110+d);const P=SANCTUM.plan({seed:12100});SANCTUM.apply(P,SANCTUM.sanctum(P));return snDraw(scene,gx,gz,P,1);}

// ---- core/tags: one record per placed thing, before anything is drawn -------------------------------------------
function snTag(P,gx,gz,K){const T=KTAGS.sanctum||(KTAGS.sanctum=KTAGS.create({build:'ancients-sanctum'}));
 const pre=(K?'kept':'intact')+'/',W=a=>[a[0]+gx,a[1],a[2]+gz],st=K?'kept':'live-work',D=SANCTUM.DIM;
 const ET='eternian';   // not in the vocabulary yet: kits/eternian P0 registers it (KNOWN_ISSUES.md)
 const B=T.add({id:pre+P.id,'class':'building',kind:'arcology',key:'ancients:sanctum',name:K?'The Sanctum of the True Heirs':'The Sanctum',
  at:[gx,0,gz],r:D.RT,h:D.YT+P.crown.rim+(K?50:P.crown.lanternH+P.crown.mast),
  tags:K?{culture:'ancient',types:['civic','religious'],state:'intact',style:st,tier:'court',landmark:true}
        :{culture:'ancient',types:['civic','dwelling-multi'],state:'intact',style:st,landmark:true}});
 const part=(r,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:r.id,name:r.name||null,at:W(at),
  tags:Object.assign({style:st},r.role?{role:r.role}:{},r.level?{level:r.level}:{})},o||{}));
 for(const g of P.bays)part(g,g.kind,SANCTUM.bayPt(g,0,g.yb-g.ys,0),{size:[2*g.Ra,g.depth,g.yT-g.yb]});
 for(const R of P.ridges)part(R,'stair',SANCTUM.ridgeAt(R,.5,0,0),{size:[2*R.hwIn,R.rTip-R.rIn,R.yIn]});
 for(const R of (P.ramps||[]))part(R,'stair',SANCTUM.wallPt((R.th0+R.th1)/2,(R.y0+R.y1)/2,R.w/2),{size:[R.w,Math.abs(R.th1-R.th0)*SANCTUM.rw(R.y0),R.y1-R.y0]});
 part(P.crown,'crown',[0,P.crown.y,0],{r:P.crown.r,h:P.crown.rim});
 const fix=(r,at)=>T.child(B.id,{'class':'fixture',kind:'terminal',key:r.id,at:W(at),
  tags:Object.assign({style:st},K?{culture:ET}:{culture:'ancient'},r.deranged?{variant:'deranged'}:{})});
 for(const t of P.terminals)fix(t,SANCTUM.wallPt(t.th,t.y,0));
 for(const a of (P.add||[])){const at=W(a.at||[0,0,0]),et=K?{culture:ET}:{};
  if(a.kind==='head')T.child(B.id,{'class':a.id==='sanctum.colossus'?'landmark':'prop',kind:'head',key:a.id,at:at,h:a.h,
   tags:Object.assign({types:['statue'],finish:a.metal,variant:a.veiled?'veiled':'closed-eyes'},et)});
  else if(a.kind==='terminal')fix(a,a.at);
  else if(a.kind==='tree')T.child(B.id,{'class':'flora',kind:'tree',key:a.id,at:at,h:a.h,tags:a.formal?{style:'formal'}:{}});
  else if(a.kind==='figure')T.child(B.id,{'class':'life',kind:'person',key:a.id,at:at,ry:a.ry||0,tags:a.mask?Object.assign({role:'proxy'},et):{}});
  else if(a.kind==='planter')T.child(B.id,{'class':'prop',kind:'planter',key:a.id,at:at,tags:{culture:'ancient'}});
  else if(a.kind==='banner')T.child(B.id,{'class':'prop',kind:'banner',key:a.id,at:at,tags:et});
  else if(a.kind==='facestone')T.child(B.id,{'class':'prop',kind:'relief',key:a.id,at:at,tags:Object.assign({types:['statue'],finish:a.metal},et)});
  else if(a.kind==='pavilion')T.child(B.id,{'class':'building',kind:'pavilion',key:a.id,at:at,tags:Object.assign({types:['civic'],tier:'court',finish:a.metal},et)});
  else if(a.kind==='wall'||a.kind==='moat'||a.kind==='pylons')T.child(B.id,{'class':'infrastructure',kind:a.kind==='pylons'?'gate':a.kind,key:a.id,at:at,tags:et});
  else if(a.kind==='plinth')T.child(B.id,{'class':'part',kind:'plinth',key:a.id,at:at,tags:et});}
 return B;}

function snDraw(scene,gx,gz,P,K){KOFF=[gx,0,gz];
 // A 720 m figure wants a camera 1.6 km off, and from there the kit's 12 km far plane cuts the 40 km ground short of
 // the horizon, where the sky shader is black (pow of a negative). The fog is total by 12 km, so seeing further
 // costs nothing but closes the band. The camera is the scene's (90-scene.js), made before any builder runs.
 // The sky dome (9 km round the camera, no depth write) is also drawn after the ground, so ground past 9 km came out
 // the dome's black underside: draw the dome first and let the ground cover it.
 if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
 if(typeof sky!=='undefined')sky.renderOrder=-1;
 if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
  skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');skyMat.needsUpdate=true;}
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const D=SANCTUM.DIM,Y1=D.Y1,YT=D.YT,SH=D.SH,NS=D.NS,DT=TAU/NS,D2R=Math.PI/180;
 snTag(P,gx,gz,K);
 const NAME=K?'The Sanctum of the True Heirs':'The Sanctum (as built)';
 REGISTER({name:NAME,x:0,z:0,r:D.RT,h:YT+60});
 REGISTER({name:NAME.replace(' (as built)','')+' — the star podium',x:0,z:0,r:D.RT,y:0,h:D.TIERS[2][1]});
 REGISTER({name:NAME.replace(' (as built)','')+' — the crown',x:0,z:0,r:P.crown.r+4,y:YT,h:K?70:P.crown.lanternH+P.crown.mast});

 // ---- the merge lists ----------------------------------------------------------------------------------------------
 const ACC={};
 const Q=(key,P4,UV4)=>{const A=ACC[key]||(ACC[key]={P:[],N:[],U:[],I:[],n:0});
  const a=P4[0],b=P4[1],c=P4[2],e=P4[3];
  const ux=c[0]-a[0],uy=c[1]-a[1],uz=c[2]-a[2],vx=e[0]-b[0],vy=e[1]-b[1],vz=e[2]-b[2];
  let fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
  for(let k=0;k<4;k++){const p=P4[k];A.P.push(p[0],p[1],p[2]);A.N.push(fx,fy,fz);A.U.push(UV4[k][0],UV4[k][1]);}
  const n=A.n;A.I.push(n,n+1,n+2,n,n+2,n+3);A.n+=4;};
 const dst=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
 const QW=(key,a,b,c,e,tile,v0,uo)=>{const L1=dst(a,b),L2=dst(a,e);v0=v0==null?0:v0;uo=uo==null?0:uo;
  Q(key,[a,b,c,e],[[uo,v0/tile],[uo+L1/tile,v0/tile],[uo+L1/tile,(v0+L2)/tile],[uo,(v0+L2)/tile]]);};
 const QH=(key,a,b,c,e,tile)=>Q(key,[a,b,c,e],[a,b,c,e].map(p=>[p[0]/tile,p[2]/tile]));
 const V3=(r,th,y)=>[r*Math.cos(th),y,r*Math.sin(th)];
 const MK={WALL:K?MAT.snWallK:MAT.snWall,POD:K?MAT.snPodK:MAT.snPod,PLATE:MAT.snPlate,ONYX:MAT.snOnyx,PODIUM:MAT.snPodium,
  WHITE:MAT.snWhite,DECK:MAT.snDeck,PAVE:MAT.snPave,LAWN:MAT.snLawn,SHADE:MAT.snShade,STONE:MAT.snStone,WATER:MAT.snWater,
  GUN:MAT.snGun,BRONZE:MAT.snBronze,CYAN:MAT.snCyan,DEAD:MAT.snDead,ALAB:MAT.snAlab,SCREEN:MAT.snScreen,SCREENB:MAT.snScreenB,
  FRIEZE:MAT.snFrieze,MAZE:MAT.snMaze,MAZEB:MAT.snMazeB,MAZEC:MAT.snMazeC};
 const MAZEK=B=>({b:'MAZEB',c:'MAZEC'})[B.maze]||'MAZE';   /* a bay's circuit-maze take (8aq1: per bay, for variety) */
 const BRZ=new THREE.Color(SANCTUM.METAL.bronze),WHT=new THREE.Color(0xe8e3d8);

 // ---- the podium: three tiers of the star, converging on the drum; a parapet on each deck's edge -----------------
 const NA=720;
 for(let k=0;k<D.TIERS.length;k++){const y0=D.TIERS[k][0],y1=D.TIERS[k][1];let cum=0;
  for(let i=0;i<NA;i++){const t0=i/NA*TAU,t1=(i+1)/NA*TAU,r0=SANCTUM.tierR(k,t0),r1=SANCTUM.tierR(k,t1);
   const a=V3(r0,t0,y0),b=V3(r1,t1,y0),L=dst(a,b);
   Q('PODIUM',[a,b,V3(r1,t1,y1),V3(r0,t0,y1)],[[cum/24,0],[(cum+L)/24,0],[(cum+L)/24,(y1-y0)/10],[cum/24,(y1-y0)/10]]);
   if(K&&k===1){const f0=y1-5.4,f1=y1-.4;   /* the face frieze: the Bayon in Deco, round the Outer Court's wall */
    Q('FRIEZE',[V3(r0+.06,t0,f0),V3(r1+.06,t1,f0),V3(r1+.06,t1,f1),V3(r0+.06,t0,f1)],[[cum/10,0],[(cum+L)/10,0],[(cum+L)/10,1],[cum/10,1]]);}
   cum+=L;
   const q0=k+1<D.TIERS.length?SANCTUM.tierR(k+1,t0):SANCTUM.rw(Y1)-.5,q1=k+1<D.TIERS.length?SANCTUM.tierR(k+1,t1):SANCTUM.rw(Y1)-.5;
   QH(K?'PAVE':'DECK',V3(q0,t0,y1),V3(r0,t0,y1),V3(r1,t1,y1),V3(q1,t1,y1),24);
   QW('WHITE',V3(r0-.3,t0,y1),V3(r1-.3,t1,y1),V3(r1-.3,t1,y1+1.1),V3(r0-.3,t0,y1+1.1),8);}}
 // the apron round it: lawn for the Ancients, paving for the forbidden city
 for(let i=0;i<NA;i++){const t0=i/NA*TAU,t1=(i+1)/NA*TAU,s0=SANCTUM.star(t0),s1=SANCTUM.star(t1);
  QH(K?'PAVE':'LAWN',V3(s0,t0,.04),V3(s0+140,t0,.04),V3(s1+140,t1,.04),V3(s1,t1,.04),40);}

 // ---- the ridges and their stairs ----------------------------------------------------------------------------------
 for(const R of P.ridges){const n=48,lineY=s=>SANCTUM.ridgeY(R,s),hw=s=>SANCTUM.ridgeHW(R,s);
  const RP=(s,off,y)=>{const r=R.rIn+(R.rTip-R.rIn)*s;return [r*Math.cos(R.a)-off*Math.sin(R.a),y,r*Math.sin(R.a)+off*Math.cos(R.a)];};
  const PH=1.6;let cum=0;
  for(let j=0;j<n;j++){const s0=j/n,s1=(j+1)/n,y0=lineY(s0),y1=lineY(s1);
   for(const sd of [-1,1]){const o0=sd*hw(s0),o1=sd*hw(s1),a=RP(s0,o0,0),b=RP(s1,o1,0),L=dst(a,b);
    Q('PODIUM',[a,b,RP(s1,o1,y1+PH),RP(s0,o0,y0+PH)],[[cum/24,0],[(cum+L)/24,0],[(cum+L)/24,(y1+PH)/10],[cum/24,(y0+PH)/10]]);
    const i0=sd*(hw(s0)-R.park),i1=sd*(hw(s1)-R.park);
    QH('WHITE',RP(s0,i0,y0+PH),RP(s0,o0,y0+PH),RP(s1,o1,y1+PH),RP(s1,i1,y1+PH),8);
    QW('WHITE',RP(s0,i0,y0),RP(s1,i1,y1),RP(s1,i1,y1+PH),RP(s0,i0,y0+PH),8);
    // the slab's curb
    const c0=sd*hw(s0)*R.slab,c1=sd*hw(s1)*R.slab;QW('WHITE',RP(s0,c0,y0),RP(s1,c1,y1),RP(s1,c1,y1+.6),RP(s0,c0,y0+.6),8);}
   cum+=dst(RP(s0,0,0),RP(s1,0,0));
   // the Face Stone's slab down the middle
   const c0=hw(s0)*R.slab,c1=hw(s1)*R.slab;
   Q('STONE',[RP(s0,-c0,y0+.3),RP(s0,c0,y0+.3),RP(s1,c1,y1+.3),RP(s1,-c1,y1+.3)],[[0,s0*12],[1,s0*12],[1,s1*12],[0,s1*12]]);}
  {const s=1,o=hw(1),y=lineY(1)+PH;QW('WHITE',RP(s,o,0),RP(s,-o,0),RP(s,-o,y),RP(s,o,y),8);}
  // two flights of steps, half a metre a riser
  const rise=.5,N=Math.ceil((R.yIn-R.yTip)/rise);
  for(let t=0;t<N;t++){const y=R.yTip+t*rise,s0=SANCTUM.ridgeS(R,y),s1=Math.max(R.sL||0,SANCTUM.ridgeS(R,y+rise));
   for(const sd of [-1,1]){const hm=hw((s0+s1)/2),oi=sd*hm*R.slab,oo=sd*(hm-R.park);
    QW('STONE',RP(s0,oi,y),RP(s0,oo,y),RP(s0,oo,y+rise),RP(s0,oi,y+rise),4);
    QH('STONE',RP(s0,oi,y+rise),RP(s0,oo,y+rise),RP(s1,oo,y+rise),RP(s1,oi,y+rise),4);}}}

 // ---- the drum wall: NS segments by SH rows, the bays' holes left exactly ------------------------------------------
 const holeAt=(i,y0)=>{for(const B of P.bays)if(y0>=B.yb-1e-6&&y0+SH<=B.yT+1e-6){const k=((i-B.i0)%NS+NS)%NS;if(k<B.n)return true;}return false;};
 for(let y0=Y1;y0<YT-1e-6;y0+=SH){const y1=y0+SH,band=Math.floor((y0-Y1)/32),rb=SANCTUM.rw(Y1+band*32+16),ku=DT*rb/24;
  const r0=SANCTUM.rw(y0),r1=SANCTUM.rw(y1);
  for(let i=0;i<NS;i++){if(holeAt(i,y0))continue;const t0=i*DT,t1=(i+1)*DT;
   Q('WALL',[V3(r0,t0,y0),V3(r0,t1,y0),V3(r1,t1,y1),V3(r1,t0,y1)],[[i*ku,(y0-Y1)/16],[(i+1)*ku,(y0-Y1)/16],[(i+1)*ku,(y1-Y1)/16],[i*ku,(y1-Y1)/16]]);}}

 // ---- the arched bays: spandrels, jambs, soffit, the glazing at the back, the floor, the prominent frame -----------
 const bayDraw=B=>{const H=B.yT-B.ys,DB=B.depth,rs=SANCTUM.rw(B.ys),hw=(B.th1-B.th0)/2;
  const NP=(xn,yn,dr)=>SANCTUM.wallPt(B.thc+xn*hw,B.ys+yn*H,dr||0);
  const LP=(s,h,dr)=>SANCTUM.wallPt(B.thc+s/rs,B.ys+h,dr||0);
  const pc=Math.atan(H/B.Ra),FL=[];for(let k=0;k<=20;k++)FL.push(k/20*Math.PI);FL.push(pc,Math.PI-pc);FL.sort((a,b)=>a-b);
  const AR=f=>[Math.cos(f),Math.sin(f)*B.Ra/H],BD=f=>{const a=AR(f),m=Math.max(Math.abs(a[0]),a[1])||1;return [a[0]/m,a[1]/m];};
  for(let k=0;k<FL.length-1;k++){const f0=FL[k],f1=FL[k+1];if(f1-f0<1e-6)continue;const a0=AR(f0),a1=AR(f1),b0=BD(f0),b1=BD(f1);
   const pa0=NP(a0[0],a0[1]),pb0=NP(b0[0],b0[1]),pb1=NP(b1[0],b1[1]),pa1=NP(a1[0],a1[1]);
   Q('WHITE',[pa0,pb0,pb1,pa1],[pa0,pb0,pb1,pa1].map(p=>[(Math.atan2(p[2],p[0])-B.th0)*rs/8,p[1]/8]));
   // the soffit, a half barrel into the wall
   QW('WHITE',NP(a0[0],a0[1],0),NP(a1[0],a1[1],0),NP(a1[0],a1[1],-DB),NP(a0[0],a0[1],-DB),8);}
  for(const e of [B.th0,B.th1])for(let y=B.yb;y<B.ys-1e-6;y+=SH)
   QW('WHITE',SANCTUM.wallPt(e,y,0),SANCTUM.wallPt(e,y,-DB),SANCTUM.wallPt(e,y+SH,-DB),SANCTUM.wallPt(e,y+SH,0),8,y);
  // the back: plate glass (the Ancients'), onyx where the Heirs infilled it, bronze doors at a kept gate, blind
  // bronze behind the Sealed House's screen
  const backKey=!K?'PLATE':B.back==='plate'?'PLATE':B.back==='doors'||B.back==='bronze'?'BRONZE':B.back==='alabaster'?'ALAB':'ONYX';
  const headKey=!K?'PLATE':B.back==='doors'?'ONYX':backKey,tile=k=>k==='PLATE'?16:k==='ONYX'||k==='ALAB'?4:6,m=B.n*2;
  for(let y=B.yb;y<B.ys-1e-6;y+=SH)for(let j=0;j<m;j++){const t0=B.th0+j*(B.th1-B.th0)/m,t1=B.th0+(j+1)*(B.th1-B.th0)/m,tl=tile(backKey);
   const u0=(t0-B.th0)*rs/tl,u1=(t1-B.th0)*rs/tl;
   Q(backKey,[SANCTUM.wallPt(t0,y,-DB),SANCTUM.wallPt(t1,y,-DB),SANCTUM.wallPt(t1,y+SH,-DB),SANCTUM.wallPt(t0,y+SH,-DB)],[[u0,(y-B.yb)/tl],[u1,(y-B.yb)/tl],[u1,(y+SH-B.yb)/tl],[u0,(y+SH-B.yb)/tl]]);
   QH('DECK',SANCTUM.wallPt(t0,B.yb,-DB),SANCTUM.wallPt(t0,B.yb,0),SANCTUM.wallPt(t1,B.yb,0),SANCTUM.wallPt(t1,B.yb,-DB),8);}
  {const C=LP(0,0,-DB),tl=tile(headKey),uv=f=>[(Math.cos(f)*B.Ra+B.Ra)/tl,(B.ys-B.yb+Math.sin(f)*B.Ra)/tl];
   for(let k=0;k<FL.length-1;k++){const f0=FL[k],f1=FL[k+1];if(f1-f0<1e-6)continue;const a0=AR(f0),a1=AR(f1);
    Q(headKey,[C,NP(a0[0],a0[1],-DB),NP(a1[0],a1[1],-DB),C],[[B.Ra/tl,(B.ys-B.yb)/tl],uv(f0),uv(f1),[B.Ra/tl,(B.ys-B.yb)/tl]]);}}
  // the frame: an archivolt proud of the wall, down the jambs as pilasters
  const bw=B.frame,pj=B.proj;
  for(let k=0;k<FL.length-1;k++){const f0=FL[k],f1=FL[k+1];if(f1-f0<1e-6)continue;
   const I0=[Math.cos(f0)*B.Ra,Math.sin(f0)*B.Ra],I1=[Math.cos(f1)*B.Ra,Math.sin(f1)*B.Ra],
    O0=[Math.cos(f0)*(B.Ra+bw),Math.sin(f0)*(B.Ra+bw)],O1=[Math.cos(f1)*(B.Ra+bw),Math.sin(f1)*(B.Ra+bw)];
   QW('WHITE',LP(I0[0],I0[1],pj),LP(O0[0],O0[1],pj),LP(O1[0],O1[1],pj),LP(I1[0],I1[1],pj),6);
   QW('WHITE',LP(O0[0],O0[1],0),LP(O1[0],O1[1],0),LP(O1[0],O1[1],pj),LP(O0[0],O0[1],pj),6);
   QW('WHITE',LP(I0[0],I0[1],0),LP(I0[0],I0[1],pj),LP(I1[0],I1[1],pj),LP(I1[0],I1[1],0),6);}
  for(const sd of [-1,1]){const si=sd*B.Ra,so=sd*(B.Ra+bw),h0=B.yb-B.ys;
   QW('WHITE',LP(si,h0,pj),LP(so,h0,pj),LP(so,0,pj),LP(si,0,pj),6);
   QW('WHITE',LP(so,h0,0),LP(so,h0,pj),LP(so,0,pj),LP(so,0,0),6);
   QW('WHITE',LP(si,h0,0),LP(si,h0,pj),LP(si,0,pj),LP(si,0,0),6);}
  // the Heirs' tracery, in bronze, just in front of the infill: mullions and transoms, two pointed lancets under
  // the round head and an oculus between them; the sealed bays a close pierced grid instead
  if(K&&B.tracery){const dr=-DB+.45,bp=(s,h)=>LP(s,h,dr),w=Math.max(.3,B.Ra*.016),bar=(a,b)=>beam('snBar',a,b,w,.5,BRZ);
   const h0=B.yb-B.ys,arc=(cx,cy,r,f0,f1,n)=>{for(let k=0;k<n;k++){const a=f0+(f1-f0)*k/n,b=f0+(f1-f0)*(k+1)/n;
     bar(bp(cx+r*Math.cos(a),cy+r*Math.sin(a)),bp(cx+r*Math.cos(b),cy+r*Math.sin(b)));}};
   if(B.tracery==='screen'&&SN_SCREENS_LIB){const sk=B.screen==='b'?'SCREENB':'SCREEN',sd=-DB+.5,m2=B.n*2;   /* the owner's pierced bronze, 2 m a tile */
    for(let y=B.yb;y<B.ys-1e-6;y+=SH)for(let j=0;j<m2;j++){const t0=B.th0+j*(B.th1-B.th0)/m2,t1=B.th0+(j+1)*(B.th1-B.th0)/m2,u0=(t0-B.th0)*rs/2,u1=(t1-B.th0)*rs/2;
     Q(sk,[SANCTUM.wallPt(t0,y,sd),SANCTUM.wallPt(t1,y,sd),SANCTUM.wallPt(t1,y+SH,sd),SANCTUM.wallPt(t0,y+SH,sd)],[[u0,(y-B.yb)/2],[u1,(y-B.yb)/2],[u1,(y+SH-B.yb)/2],[u0,(y+SH-B.yb)/2]]);}
    const C2=LP(0,0,sd),uv2=f=>[(Math.cos(f)*B.Ra+B.Ra)/2,(B.ys-B.yb+Math.sin(f)*B.Ra)/2];
    for(let k=0;k<FL.length-1;k++){const f0=FL[k],f1=FL[k+1];if(f1-f0<1e-6)continue;const a0=AR(f0),a1=AR(f1);
     Q(sk,[C2,NP(a0[0],a0[1],sd),NP(a1[0],a1[1],sd),C2],[[B.Ra/2,(B.ys-B.yb)/2],uv2(f0),uv2(f1),[B.Ra/2,(B.ys-B.yb)/2]]);}
    arc(0,0,B.Ra-.2,0,Math.PI,18);bar(bp(-B.Ra,0),bp(B.Ra,0));}
   else if(B.tracery==='screen'){const g=1.4;
    for(let s=-B.Ra+g;s<B.Ra-.1;s+=g){const top=Math.sqrt(Math.max(0,B.Ra*B.Ra-s*s));bar(bp(s,h0),bp(s,top-.2));}
    for(let h=h0+g;h<B.Ra-.2;h+=g){const half=h<0?B.Ra:Math.sqrt(Math.max(0,B.Ra*B.Ra-h*h));bar(bp(-half,h),bp(half,h));}}
   else{const dw=B.door?B.door.w/2+.4:0,dh=B.door?h0+B.door.h:h0;
    if(B.back!=='doors'){const mm=Math.max(2,Math.round(2*B.Ra/3.2));for(let j=1;j<mm;j++){const s=-B.Ra+j*2*B.Ra/mm;bar(bp(s,Math.abs(s)<dw?dh:h0),bp(s,0));}}
    else{bar(bp(0,h0),bp(0,0));}
    for(let h=h0+4.5;h<-.5;h+=4.5){if(h<dh&&dw){bar(bp(-B.Ra,h),bp(-dw,h));bar(bp(dw,h),bp(B.Ra,h));}else bar(bp(-B.Ra,h),bp(B.Ra,h));}
    // a great hall's door: a bronze leaf pair set into the tracery, its frame bars round it
    if(B.door){const q=qFacing(SANCTUM.out(B.thc)),c=LP(0,h0+B.door.h/2,-DB+.7);kput('snBox',c,q,[B.door.w,B.door.h,.8],BRZ);
     bar(bp(-dw,h0),bp(-dw,dh));bar(bp(dw,h0),bp(dw,dh));bar(bp(-dw,dh),bp(dw,dh));}
    bar(bp(-B.Ra,0),bp(B.Ra,0));
    arc(0,0,B.Ra-.2,0,Math.PI,18);
    const rho=.75*B.Ra;
    for(const L of [[-B.Ra,0],[0,B.Ra]]){const mid=(L[0]+L[1])/2,cl=L[0]+rho,cr=L[1]-rho,fa=Math.acos((mid-cl)/rho),fb=Math.acos((mid-cr)/rho);
     arc(cl,0,rho,Math.PI,fa,6);arc(cr,0,rho,0,fb,6);}
    arc(0,B.Ra*.78,B.Ra*.15,0,TAU,12);}}
  // the balcony thrown out in front of the terrace: the slab, its edge with a cyan run under the rail (alive on the
  // Ancients'; a fifth woken on the Heirs'), and the rail: a white parapet as built, bronze balusters as kept
  if(B.balc){const bl=B.balc,NB=24,yb=B.yb,alive=!K||KRAND.unit(KRAND.hash(P.seed,302,B.st))<(B.alive==null?1:B.alive);
   const pt=(s,o,y)=>SANCTUM.wallPt(B.thc+s/rs,y,o);let bcu=0;
   for(let k=0;k<NB;k++){const s0=-bl.hw+2*bl.hw*k/NB,s1=-bl.hw+2*bl.hw*(k+1)/NB,o0=SANCTUM.balcOut(B,s0),o1=SANCTUM.balcOut(B,s1);
    QH(K?'PAVE':'DECK',pt(s0,-.5,yb),pt(s0,o0,yb),pt(s1,o1,yb),pt(s1,-.5,yb),8);
    QH('SHADE',pt(s0,-.5,yb-bl.slab),pt(s1,-.5,yb-bl.slab),pt(s1,o1,yb-bl.slab),pt(s0,o0,yb-bl.slab),8);
    if(o0<.05&&o1<.05)continue;
    if(K){const Lb=dst(pt(s0,o0,yb),pt(s1,o1,yb)),bh=bl.slab-.55,tw=3*bh;   /* the circuit-maze fascia, its take the bay's */
     Q(MAZEK(B),[pt(s0,o0+.02,yb-bl.slab),pt(s1,o1+.02,yb-bl.slab),pt(s1,o1+.02,yb-.55),pt(s0,o0+.02,yb-.55)],[[bcu/tw,0],[(bcu+Lb)/tw,0],[(bcu+Lb)/tw,1],[bcu/tw,1]]);bcu+=Lb;}
    else QW('WHITE',pt(s0,o0,yb-bl.slab),pt(s1,o1,yb-bl.slab),pt(s1,o1,yb-.55),pt(s0,o0,yb-.55),6);
    QW(alive?'CYAN':'DEAD',pt(s0,o0+.03,yb-.55),pt(s1,o1+.03,yb-.55),pt(s1,o1+.03,yb-.2),pt(s0,o0+.03,yb-.2),6);
    QW('WHITE',pt(s0,o0,yb-.2),pt(s1,o1,yb-.2),pt(s1,o1,yb),pt(s0,o0,yb),6);
    if(!K){QW('WHITE',pt(s0,o0,yb),pt(s1,o1,yb),pt(s1,o1,yb+bl.rail),pt(s0,o0,yb+bl.rail),6);
     QW('WHITE',pt(s0,o0-.3,yb),pt(s1,o1-.3,yb),pt(s1,o1-.3,yb+bl.rail),pt(s0,o0-.3,yb+bl.rail),6);
     QH('WHITE',pt(s0,o0-.3,yb+bl.rail),pt(s0,o0,yb+bl.rail),pt(s1,o1,yb+bl.rail),pt(s1,o1-.3,yb+bl.rail),6);}
    else{beam('snBar',pt(s0,o0-.12,yb+bl.rail),pt(s1,o1-.12,yb+bl.rail),.2,.2,BRZ);
     const nb=Math.max(1,Math.round(dst(pt(s0,o0,yb),pt(s1,o1,yb))/1.2));
     for(let q=0;q<nb;q++){const s=s0+(s1-s0)*(q+.5)/nb,o=SANCTUM.balcOut(B,s)-.12;beam('snBar',pt(s,o,yb),pt(s,o,yb+bl.rail),.09,.09,BRZ);}}}}};
 for(const B of P.bays)bayDraw(B);

 // ---- the staircases: three, each nine flights counterclockwise round the drum from balcony to balcony. Treads and
 // risers in pale stone, a sloped soffit, a stringer with the cyan run in it, and the rail: a white parapet as built,
 // bronze balusters and a bronze handrail as kept
 for(const R of (P.ramps||[])){const W=R.w,N=Math.max(2,Math.ceil((R.y1-R.y0)/.5)),dy=(R.y1-R.y0)/N,PH=1.1,
   alive=!K||KRAND.unit(KRAND.hash(P.seed,303,R.stair*16+R.level))<(R.alive==null?1:R.alive);
  const TH=t=>R.th0+(R.th1-R.th0)*t,YL=t=>R.y0+(R.y1-R.y0)*t;
  for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,ta=TH(t0),tb=TH(t1),y=R.y0+(i+1)*dy,yl0=YL(t0),yl1=YL(t1);
   const ri=SANCTUM.rw(y)-.5,ro=SANCTUM.rw(y)+W;
   QH('STONE',V3(ri,ta,y),V3(ro,ta,y),V3(ro,tb,y),V3(ri,tb,y),4);
   QW('STONE',V3(ri,ta,y-dy),V3(ro,ta,y-dy),V3(ro,ta,y),V3(ri,ta,y),4);
   const ria=SANCTUM.rw(yl0)-.5,rib=SANCTUM.rw(yl1)-.5,roa=SANCTUM.rw(yl0)+W,rob=SANCTUM.rw(yl1)+W;
   QH('SHADE',V3(ria,ta,yl0-1.6),V3(rib,tb,yl1-1.6),V3(rob,tb,yl1-1.6),V3(roa,ta,yl0-1.6),8);
   QW('WHITE',V3(roa,ta,yl0-1.6),V3(rob,tb,yl1-1.6),V3(rob,tb,yl1-1.1),V3(roa,ta,yl0-1.1),6);
   QW(alive?'CYAN':'DEAD',V3(roa+.03,ta,yl0-1.1),V3(rob+.03,tb,yl1-1.1),V3(rob+.03,tb,yl1-.8),V3(roa+.03,ta,yl0-.8),6);
   QW('WHITE',V3(roa,ta,yl0-.8),V3(rob,tb,yl1-.8),V3(rob,tb,yl1+dy),V3(roa,ta,yl0+dy),6);
   if(!K){QW('WHITE',V3(roa,ta,yl0+dy),V3(rob,tb,yl1+dy),V3(rob,tb,yl1+dy+PH),V3(roa,ta,yl0+dy+PH),6);
    QW('WHITE',V3(roa-.3,ta,yl0+dy),V3(rob-.3,tb,yl1+dy),V3(rob-.3,tb,yl1+dy+PH),V3(roa-.3,ta,yl0+dy+PH),6);
    QH('WHITE',V3(roa-.3,ta,yl0+dy+PH),V3(roa,ta,yl0+dy+PH),V3(rob,tb,yl1+dy+PH),V3(rob-.3,tb,yl1+dy+PH),6);}
   else{beam('snBar',V3(roa-.12,ta,yl0+dy+PH),V3(rob-.12,tb,yl1+dy+PH),.2,.2,BRZ);
    if(i%3===0)beam('snBar',V3(roa-.12,ta,yl0+dy),V3(roa-.12,ta,yl0+dy+PH),.09,.09,BRZ);}}}

 // ---- the crown: the roof, the rim (the owner's fourth picture: a hollow drum), the lantern, the mast ------------
 {const C=P.crown,N=96,ri=C.r-C.rimW,yt=C.y+C.rim;
  for(let i=0;i<N;i++){const t0=i/N*TAU,t1=(i+1)/N*TAU;
   QH(K?'PAVE':'DECK',V3(C.lanternR,t0,C.y),V3(ri,t0,C.y),V3(ri,t1,C.y),V3(C.lanternR,t1,C.y),12);
   if(K){QW('WHITE',V3(C.r,t0,C.y),V3(C.r,t1,C.y),V3(C.r,t1,yt-6),V3(C.r,t0,yt-6),8);
    Q('MAZE',[V3(C.r+.02,t0,yt-6),V3(C.r+.02,t1,yt-6),V3(C.r+.02,t1,yt-.5),V3(C.r+.02,t0,yt-.5)],[[t0*C.r/16.5,0],[t1*C.r/16.5,0],[t1*C.r/16.5,1],[t0*C.r/16.5,1]]);
    QW('WHITE',V3(C.r,t0,yt-.5),V3(C.r,t1,yt-.5),V3(C.r,t1,yt),V3(C.r,t0,yt),8);}
   else QW('WHITE',V3(C.r,t0,C.y),V3(C.r,t1,C.y),V3(C.r,t1,yt),V3(C.r,t0,yt),8);
   QW('WHITE',V3(ri,t0,C.y),V3(ri,t1,C.y),V3(ri,t1,yt),V3(ri,t0,yt),8);
   QH('WHITE',V3(ri,t0,yt),V3(C.r,t0,yt),V3(C.r,t1,yt),V3(ri,t1,yt),8);
   const L=C.lanternR,u0=t0*L/8,u1=t1*L/8;
   for(let y=C.y;y<C.y+C.lanternH-1e-6;y+=SH)Q('POD',[V3(L,t0,y),V3(L,t1,y),V3(L,t1,y+SH),V3(L,t0,y+SH)],[[u0,0],[u1,0],[u1,1],[u0,1]]);
   QW('CYAN',V3(L+.3,t0,C.y+C.lanternH-1.4),V3(L+.3,t1,C.y+C.lanternH-1.4),V3(L+.3,t1,C.y+C.lanternH),V3(L+.3,t0,C.y+C.lanternH),8);
   QH('WHITE',V3(0,t0,C.y+C.lanternH),V3(L+.6,t0,C.y+C.lanternH),V3(L+.6,t1,C.y+C.lanternH),V3(0,t1,C.y+C.lanternH),8);}
  if(!K)kput('snCyl',[0,C.y+C.lanternH,0],null,[2.2,C.mast,2.2],WHT);}

 // ---- the Ancients' terminals: faces on the wall flanking every gate; framed in bronze by the Heirs -------------
 const terminal=(t,at,face)=>{const o=face,q=qFacing(o),s=t.size,p=[at[0]+o[0]*.25,at[1],at[2]+o[2]*.25];
  kput('snFace'+(t.deranged?SN_FACE_DERANGED:SN_FACE_CALM[(t.v|0)%8]),p,q,[s,s,1],null);
  const fc=t.frame==='bronze'?BRZ:WHT,fw=Math.max(.4,s*.07),ex=[-o[2],0,o[0]];
  const P3=(dx,dy)=>[p[0]+ex[0]*dx+o[0]*.2,p[1]+dy,p[2]+ex[2]*dx+o[2]*.2];
  beam('snBar',P3(-s/2-fw/2,-s/2-fw),P3(-s/2-fw/2,s/2+fw),fw,fw,fc);beam('snBar',P3(s/2+fw/2,-s/2-fw),P3(s/2+fw/2,s/2+fw),fw,fw,fc);
  beam('snBar',P3(-s/2-fw,s/2+fw/2),P3(s/2+fw,s/2+fw/2),fw,fw,fc);beam('snBar',P3(-s/2-fw,-s/2-fw/2),P3(s/2+fw,-s/2-fw/2),fw,fw,fc);};
 for(const t of P.terminals)terminal(t,SANCTUM.wallPt(t.th,t.y,0),SANCTUM.out(t.th));

 // ---- the dressing, from the records -------------------------------------------------------------------------------
 const leafC=(u,f)=>new THREE.Color().setHSL(f?.30:.22+u*.1,f?.32:.38,f?.20:.26+u*.06);
 const SKIN=new THREE.Color(0xc9a17e),MASK=new THREE.Color(0xf2efe8);
 const H=(a)=>KRAND.unit(KRAND.hash(P.seed,401,a.id.length,a.at?Math.floor(a.at[0]*7+a.at[2]*13):0));
 const placeHead=a=>{const h=a.h,c=new THREE.Color(a.color),o=a.face;let y=a.at[1];
  if(a.plinth){kput('snBox',[a.at[0],y+a.plinth/2,a.at[2]],qFacing(o),[h*.62,a.plinth,h*.62],WHT);y+=a.plinth;}
  const ti=a.metal==='titanium';
  if(a.crown){kput(ti?'snBoxTi':'snBox',[a.at[0],y+h*.17,a.at[2]],qFacing(o),[h*1.25,h*.34,h*.6],ti?null:c);y+=h*.3;}
  if(a.veiled){kput('snHead',[a.at[0],y,a.at[2]],qFacing(o),[h*.84,h,h*.92],c);
   kput('snVeil',[a.at[0],y,a.at[2]],qFacing(o),[h*.48,h*1.16,h*.52],new THREE.Color(0x5e4a2c));return;}
  kput(ti?'snHeadTi':'snHead',[a.at[0],y,a.at[2]],qFacing(o),[h*.84,h,h*.92*(a.relief||1)],ti?null:c);};
 const B3=new THREE.Matrix4(),QQ=new THREE.Quaternion();
 for(const a of (P.add||[])){const k=a.kind;
  if(k==='head')placeHead(a);
  else if(k==='tree'){const u=H(a),h=a.h;kput('trunk',a.at,qEuler(0,u*TAU,0),[h*.12,h*.7,h*.12],new THREE.Color().setHSL(.07,.3,.18));
   if(a.formal){kput('leafCard',[a.at[0],a.at[1]+h*.62,a.at[2]],qEuler(0,u*TAU,0),[h*.2,h*.42,h*.2],leafC(u,1));}
   else kput('leafCard',[a.at[0],a.at[1]+h*.72,a.at[2]],qEuler(0,u*TAU,0),[h*.32,h*.3,h*.32],leafC(u,0));}
  else if(k==='figure'){kput('figB',a.at,qEuler(0,a.ry||0,0),1,new THREE.Color().setHSL(K?.0:.08,K?0:.3,K?.12:.4));
   kput('figH',a.at,null,1,a.mask?MASK:SKIN);}
  else if(k==='planter')kput('snBox',[a.at[0],a.at[1]+.45,a.at[2]],qFacing(SANCTUM.out(a.th)),[a.w,.9,1.6],new THREE.Color(0xb8b2a6));
  else if(k==='banner')kput('snBanner',a.at,qFacing(a.face),[a.w,a.h,1],null);
  else if(k==='terminal')terminal(a,a.at,a.face);
  else if(k==='facestone'){const R=P.ridges[a.ridge],al=Math.atan2(R.yIn-R.yTip,(R.rTip-R.rIn)*(1-(R.sL||0))),u=SANCTUM.out(R.a);
   const n=new THREE.Vector3(Math.sin(al)*u[0],Math.cos(al),Math.sin(al)*u[2]),up=new THREE.Vector3(-Math.cos(al)*u[0],Math.sin(al),-Math.cos(al)*u[2]);
   const x=new THREE.Vector3().crossVectors(up,n);B3.makeBasis(x,up,n);QQ.setFromRotationMatrix(B3);
   kput('snHead',[a.at[0]-up.x*a.h*.5,a.at[1]-up.y*a.h*.5,a.at[2]-up.z*a.h*.5],QQ.clone(),[a.w,a.h,a.w*.3],new THREE.Color(a.color));}
  else if(k==='pylons'){const R=P.ridges[a.ridge],u=SANCTUM.out(R.a),q=qFacing(u),hw=SANCTUM.ridgeHW(R,a.s)+5,c=new THREE.Color(a.metal==='gold'?SANCTUM.METAL.gold:SANCTUM.METAL.bronze);
   for(const sd of [-1,1]){const b=SANCTUM.ridgeAt(R,a.s,sd*hw,0);b[1]=0;
    kput('snBox',[b[0],a.h*.25,b[2]],q,[9,a.h*.5,9],WHT);kput('snBox',[b[0],a.h*.65,b[2]],q,[7,a.h*.3,7],WHT);
    kput('snBox',[b[0],a.h*.9,b[2]],q,[5,a.h*.2,5],WHT);placeHead({h:6,at:[b[0],a.h,b[2]],face:u,color:c.getHex()});}
   const m=SANCTUM.ridgeAt(R,a.s,0,0);kput('snBox',[m[0],a.h*.72,m[2]],q,[2*hw+9,3,6],WHT);
   kput('snBox',[m[0],a.h*.72-1.9,m[2]],q,[2*hw+9,.8,6.2],c);}
  else if(k==='pavilion'){const q=qFacing(SANCTUM.out(a.th)),y=a.at[1],c=new THREE.Color(a.color);
   kput('snBox',[a.at[0],y+5,a.at[2]],q,[16,10,16],WHT);kput('snBox',[a.at[0],y+13.5,a.at[2]],q,[12,7,12],WHT);
   kput('snBox',[a.at[0],y+19.5,a.at[2]],q,[8,5,8],WHT);kput('snRoof4',[a.at[0],y+22,a.at[2]],q,[10,9,10],c);
   const o=SANCTUM.out(a.th);placeHead({h:3.6,at:[a.at[0]+o[0]*8.3,y+4,a.at[2]+o[2]*8.3],face:o,color:a.color});}
  else if(k==='plinth')kput('snBox',[a.at[0],a.at[1]+a.h/2,a.at[2]],qFacing(SANCTUM.out(a.th)),[a.w,a.h,a.d],WHT);
  else if(k==='wall'){const y0=D.TIERS[0][1],N=720;
   const inR=(th,r)=>P.ridges.some(R=>Math.cos(th-R.a)>0&&Math.abs(Math.sin(th-R.a))*r<SANCTUM.ridgeHW(R,.9)+4);
   for(let i=0;i<N;i++){const t0=i/N*TAU,t1=(i+1)/N*TAU,ro0=SANCTUM.tierR(0,t0)-a.inset,ro1=SANCTUM.tierR(0,t1)-a.inset;
    if(inR((t0+t1)/2,ro0))continue;const ri0=ro0-a.t,ri1=ro1-a.t,yt=y0+a.h;
    QW('WHITE',V3(ro0,t0,y0),V3(ro1,t1,y0),V3(ro1,t1,yt),V3(ro0,t0,yt),8,y0);
    QW('WHITE',V3(ri1,t1,y0),V3(ri0,t0,y0),V3(ri0,t0,yt),V3(ri1,t1,yt),8,y0);
    QH('GUN',V3(ri0,t0,yt),V3(ro0,t0,yt),V3(ro1,t1,yt),V3(ri1,t1,yt),8);}}
  else if(k==='moat'){const N=720;
   for(let i=0;i<N;i++){const t0=i/N*TAU,t1=(i+1)/N*TAU,s0=SANCTUM.star(t0),s1=SANCTUM.star(t1);
    QH('WATER',V3(s0+a.r0,t0,.12),V3(s0+a.r1,t0,.12),V3(s1+a.r1,t1,.12),V3(s1+a.r0,t1,.12),40);
    for(const e of [a.r0,a.r1])QW('WHITE',V3(s0+e,t0,.04),V3(s1+e,t1,.04),V3(s1+e,t1,.7),V3(s0+e,t0,.7),8);}}}

 // ---- what the presets are derived from ----------------------------------------------------------------------------
 SN_SITE[K?'kept':'intact']={x:gx,z:gz,YT:YT,R0:SANCTUM.rw(Y1),RT:D.RT,TIP0:D.TIP0,vol:P.vol,crown:P.crown.y+P.crown.rim,
  gates:P.gates.map(B=>({thc:B.thc,yb:B.yb,ys:B.ys,Ra:B.Ra})),bays:P.bays.filter(B=>B.kind==='bay').map(B=>({id:B.id,thc:B.thc,yb:B.yb,ys:B.ys,Ra:B.Ra,st:B.st})),
  ridges:P.ridges.map(R=>({a:R.a,rIn:R.rIn,rTip:R.rTip,yIn:R.yIn}))};
 window._sanctumVol=P.vol;

 // ---- merge ----------------------------------------------------------------------------------------------------------
 for(const key in ACC){const A=ACC[key];if(!A.n)continue;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));
  g.setIndex(A.I);
  mesh(g,MK[key],G);}
 KOFF=[0,0,0];return G;}
