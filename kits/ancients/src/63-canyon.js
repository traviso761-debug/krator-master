// ================================================================= CANYON WORKS — "the Span"
// Colossal pipes bridge a gorge; structures hang beneath them on cables, like
// pendants on a chandelier. The pipes are the infrastructure and the dwellings
// are parasitic on it — nothing hanging here was part of the original works.
//
// MODULARITY. A pipe does not know what hangs from it. It is built from a spec
// array (see SPANS below), and every payload type is one entry in HANG. Adding
// a kind of structure is one function plus one line in a spec; moving one along
// the pipe, changing its drop or swapping it for another type is a data edit.
//
// Payload functions build in their OWN local frame with the cable attachment at
// the origin and the structure hanging below it, and return deferred geometry
// and kit placements. hangEmit() then applies one matrix to all of it. That
// indirection is what lets the same payload be hung from a pipe or lie smashed
// on the canyon floor without being written twice.
function hangParts(){return{s:[],g:[],k:[],i:[]};}
function hangPut(P,name,p,q,sc,c){P.i.push({name,p,q,s:sc,c});}
function hangEmit(P,M,SH,GL,DK){
 const q0=new THREE.Quaternion().setFromRotationMatrix(M),v=new THREE.Vector3();
 P.s.forEach(g=>SH.push(g.applyMatrix4(M)));
 P.g.forEach(g=>GL.push(g.applyMatrix4(M)));
 P.k.forEach(g=>DK.push(g.applyMatrix4(M)));
 P.i.forEach(o=>{v.set(o.p[0],o.p[1],o.p[2]).applyMatrix4(M);
  kput(o.name,[v.x,v.y,v.z],o.q?o.q.clone().premultiply(q0):q0.clone(),o.s,o.c);});}
// a sphere that can be eaten by holeFn, unlike IcosahedronGeometry
function hangBall(R,nu,nv,hole){return lathe({rFn:y=>R*Math.sqrt(clamp(1-Math.pow((y-R)/R,2),0,1))+.01,H:2*R,nu,nv,hole});}

const HANG={
 // --- the reference's form: a geodesic pod with porthole lenses -------------
 pod(R,d,sd){const P=hangParts(),h=holeFn(d*.8,sd,null,1.4);
  P.s.push(hangBall(R,40,22,h).translate(0,-R*2.1,0));
  P.k.push(hangBall(R*.9,20,10,null).translate(0,-R*2.1,0));
  for(let k=0;k<5;k++){const y=-R*2.1+R*(.5+k*.32);
   for(let j=0;j<9;j++){const th=(j+(k%2)*.5)/9*TAU,r=R*Math.sqrt(clamp(1-Math.pow((y+R*2.1-R)/R,2),0,1));
    if(r<R*.35)continue;
    hangPut(P,d>0?'ovalD':'ovalI',[r*Math.cos(th)*1.01,y,r*Math.sin(th)*1.01],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.11,R*.08,1],null);}}
  hangPut(P,d>0?'ringR':'ringW',[0,-R*2.1+R,0],qEuler(Math.PI/2,0,0),[R*1.06,R*1.06,R*.14],null);
  return P;},
 // --- a cut diamond, hung point-down ---------------------------------------
 prism(R,d,sd){const P=hangParts(),H=R*2.6,h=holeFn(d*.7,sd+1,null,1.2);
  P.s.push(lathe({rFn:y=>R*(1-Math.abs(y/H*2-1))+.02,H,nu:6,nv:14,hole:h?(u,v)=>h(u,v*H):null}).translate(0,-R*3.0,0));
  P.g.push(lathe({rFn:y=>R*.82*(1-Math.abs(y/H*2-1))+.02,H,nu:6,nv:8}).translate(0,-R*3.0,0));
  for(let k=0;k<6;k++){const th=k/6*TAU;
   hangPut(P,d>0?'strutR':'strutW',[Math.cos(th)*R*.52,-R*3.0+H*.5,Math.sin(th)*R*.52],qEuler(0,-th,0),[R*.07,H*1.02,R*.07],null);}
  return P;},
 // --- a carousel: stacked drums with balcony rings --------------------------
 drum(R,d,sd){const P=hangParts();let y=-R*1.5;
  for(let k=0;k<3;k++){const r=R*(1-k*.18),hh=R*.62;
   P.s.push(lathe({rFn:()=>r,H:hh,nu:28,nv:5,hole:holeFn(d*.9,sd+k*3,null,1.6)}).translate(0,y,0));
   P.k.push(lathe({rFn:()=>r*.9,H:hh,nu:14,nv:2}).translate(0,y,0));
   hangPut(P,d>0?'ringR':'ringW',[0,y+hh,0],qEuler(Math.PI/2,0,0),[r*1.2,r*1.2,r*.1],null);
   for(let j=0;j<10;j++){const th=j/10*TAU;
    hangPut(P,d>0?'winSmD':'winSmI',[r*1.01*Math.cos(th),y+hh*.5,r*1.01*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[r*.16,r*.2,1],null);}
   y-=hh*1.18;}
  return P;},
 // --- a torus hung flat, cabins round its rim ------------------------------
 ring(R,d,sd){const P=hangParts();const y=-R*1.9;
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,ph=v*TAU,rr0=R*.34;
   const r=R+rr0*Math.cos(ph);return[r*Math.cos(th),y+rr0*Math.sin(ph),r*Math.sin(th)];},44,12,{uS:R/4,vS:2,hole:holeFn(d*.8,sd+2,null,1.3)}));
  for(let k=0;k<8;k++){const th=(k+.5)/8*TAU;
   hangPut(P,d>0?'boxR':'boxW',[R*Math.cos(th),y-R*.30,R*Math.sin(th)],qEuler(0,-th,0),[R*.30,R*.34,R*.22],null);
   hangPut(P,d>0?'winSmD':'winSmI',[R*1.16*Math.cos(th),y-R*.30,R*1.16*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.15,R*.15,1],null);}
  return P;},
 // --- the chandelier, explicitly: a hub with pendant arms ------------------
 cluster(R,d,sd){const P=hangParts();const y=-R*1.3;
  P.s.push(hangBall(R*.5,22,12,holeFn(d*.7,sd+4,null,2)).translate(0,y-R*.5,0));
  for(let k=0;k<5;k++){const th=k/5*TAU+.3,ar=R*rr(.85,1.25),dy=-R*rr(.5,1.5);
   const ax=Math.cos(th)*ar,az=Math.sin(th)*ar;
   hangPut(P,d>0?'strutR':'strutW',[ax*.5,y-R*.5,az*.5],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.06,R*.06,ar],null);
   hangPut(P,'boxD',[ax,y-R*.5+dy*.5,az],null,[R*.035,Math.abs(dy),R*.035],null);
   const sr=R*rr(.22,.40);
   P.s.push(hangBall(sr,18,10,holeFn(d*.9,sd+10+k,null,2)).translate(ax,y-R*.5+dy-sr*2,az));
   for(let j=0;j<5;j++){const t2=j/5*TAU;
    hangPut(P,d>0?'ovalD':'ovalI',[ax+sr*1.02*Math.cos(t2),y-R*.5+dy-sr,az+sr*1.02*Math.sin(t2)],qFacing([Math.cos(t2),0,Math.sin(t2)]),[sr*.3,sr*.24,1],null);}}
  return P;},
 // --- THE PRISON ------------------------------------------------------------
 // Alienating by refusing what every other payload offers. No gallery, no
 // balcony, no visible door. Its openings are slits, too high and far too few
 // for its size, and where the others glow warm its handful of lit cells are
 // cold. An external cage is clamped over it, plainly added and plainly not for
 // the benefit of whoever is inside. Beneath it hangs a dense bunch of cell
 // pods, each barely bigger than a person: the building is a thing that holds
 // other, smaller things.
 prison(R,d,sd){const P=hangParts();const H=R*2.3,y=-R*1.0;
  // a blunt mass that OVERHANGS as it descends — heavier at the bottom, so it
  // reads as bearing down rather than sitting
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,t=v;
   const r=R*(.62+.38*Math.pow(t,.7))*se(th,6);
   return[r*Math.cos(th),y-H*t,r*Math.sin(th)];},48,16,{uS:R/3,vS:6,hole:holeFn(d*.55,sd+5,null,1.1)}));
  P.k.push(gridSurface((u,v)=>{const th=u*TAU,t=v;const r=R*(.62+.38*Math.pow(t,.7))*se(th,6)*.93;
   return[r*Math.cos(th),y-H*t,r*Math.sin(th)];},24,6,{}));
  P.s.push(gridSurface((u,v)=>{const th=u*TAU,r=R*se(th,6)*v;return[r*Math.cos(th),y-H,r*Math.sin(th)];},48,3,{uS:R/3,vS:2}));
  // the cage: ribs clamped over the shell, meeting at a collar
  for(let k=0;k<8;k++){const th=k/8*TAU;
   const r0=R*.62*se(th,6),r1=R*se(th,6);
   hangPut(P,d>0?'strutR':'strutW',[Math.cos(th)*(r0+r1)*.52,y-H*.5,Math.sin(th)*(r0+r1)*.52],
    qEuler(0,-th,0).multiply(qEuler(0,0,Math.atan2(r1-r0,H))),[R*.07,H*1.06,R*.10],null);}
  for(const t of [.30,.62,.92]){const r=R*(.62+.38*Math.pow(t,.7))*1.02;
   hangPut(P,d>0?'ringR':'ringW',[0,y-H*t,0],qEuler(Math.PI/2,0,0),[r,r,R*.10],null);}
  // slits: high, narrow, and far too few. Cold light, never warm.
  for(let k=0;k<10;k++){const th=rng()*TAU,t=rr(.12,.42);
   const r=R*(.62+.38*Math.pow(t,.7))*se(th,6)*1.01;
   hangPut(P,d>0?'winSmD':'winSmI',[r*Math.cos(th),y-H*t,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.035,R*.16,1],null);
   if(d===0&&rng()<.4)hangPut(P,'dot',[r*1.04*Math.cos(th),y-H*t,r*1.04*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[R*.05,R*.05,1],CYAN);}
  // cell pods slung underneath in a bunch
  for(let k=0;k<14;k++){const th=rng()*TAU,rad=R*rr(.12,.78),cy=y-H-R*rr(.28,1.05),cr=R*rr(.075,.125);
   const cx=Math.cos(th)*rad,cz=Math.sin(th)*rad;
   hangPut(P,'boxD',[cx,(y-H+cy+cr)*.5,cz],null,[R*.016,Math.abs(y-H-cy-cr),R*.016],null);
   P.s.push(hangBall(cr,12,7,d>0?holeFn(1,sd+40+k,null,3):null).translate(cx,cy-cr,cz));
   hangPut(P,d>0?'winSmD':'winSmI',[cx,cy,cz+cr*1.02],qFacing([0,0,1]),[cr*.5,cr*.5,1],null);}
  // a winch where anything else would have a stair
  hangPut(P,d>0?'boxR':'boxW',[0,y+R*.16,0],null,[R*.5,R*.3,R*.5],null);
  hangPut(P,'tube',[0,y+R*.16,0],qEuler(0,0,Math.PI/2),[R*.12,R*.62,R*.12],null);
  return P;},
};

function buildCanyon(scene,gx,gz,d){reseed(9320+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Canyon works — the Span ('+(d===2?'fallen':STATE(d))+')',x:0,z:0,r:1250,h:600});
 // A gorge, not a trough: deep relative to its width. The first pass was
 // 1640 wide by 560 deep and read as two low mesas with a plain between them.
 const GAP=700,WALL=460,CH=900,LEN=1900;
 const SH=[],GL=[],DK=[];
 // ---------------------------------------------------------------- the gorge
 for(const s of [-1,1]){const CX=s*(GAP+WALL/2);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN,y=v*CH;
   const inner=-s*(WALL/2-52*fbm(u*11,v*7,9321+s,3)-34*(1-v)*(1-v)-18*fbm(u*29,v*3,9322,2));
   return[CX+inner,y,z];},70,26,{uS:46,vS:16}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN;return[CX+(v-.5)*WALL*1.6,CH+26*fbm(u*9,v*9,9323+s,2),z];},54,10,{uS:46,vS:22}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-LEN/2+u*LEN;return[CX+s*WALL*.8,v*CH,z];},32,6,{}),MAT.rock,G);}
 mesh(gridSurface((u,v)=>{const x=(u-.5)*GAP*2.1,z=-LEN/2+v*LEN;
  return[x,2+9*fbm(u*7,v*7,9324,3)-4*Math.exp(-Math.pow(x/260,2)),z];},40,40,{uS:26,vS:26}),d>0?MAT.mud:MAT.rock,G);
 // ---------------------------------------------------------------- the spans
 // Each entry is a pipe and what hangs from it. Swapping a payload, moving it
 // along the pipe or changing its drop is an edit HERE and nowhere else.
 const SPANS=[
  // drop + the payload's own reach must clear the canyon floor. Reach below the
  // cable runs about 2.5R (ring) to 5.6R (prism); the prison is 4.4R and the
  // largest payload, so it gets the shortest drop of the three on its span.
  {y:780,z:-430,r:22,sag:30,hangs:[
   {t:'pod',    u:.20,drop:150,R:52,sd:11},
   {t:'cluster',u:.47,drop:120,R:66,sd:23},
   {t:'pod',    u:.74,drop:200,R:40,sd:31}]},
  {y:660,z:  40,r:26,sag:38,hangs:[
   {t:'drum',   u:.17,drop:110,R:54,sd:43},
   {t:'prison', u:.50,drop:120,R:92,sd:57},
   {t:'ring',   u:.83,drop:160,R:62,sd:67}]},
  {y:540,z: 470,r:18,sag:24,hangs:[
   {t:'prism',  u:.26,drop:120,R:46,sd:73},
   {t:'pod',    u:.58,drop: 90,R:36,sd:83},
   {t:'lift',   u:.86,drop:520,R:22,sd:91}]},
 ];
 const pipeY=(S,t)=>S.y-S.sag*4*t*(1-t);           // a dead-straight pipe reads as a prop
 const X0=-(GAP+8),X1=GAP+8;
 SPANS.forEach((S,si)=>{
  const broke=d===2&&si===1;                        // one pipe has parted
  for(let seg=0;seg<2;seg++){
   const a=seg?.54:0,b=seg?1:.46;
   if(broke&&seg===1)continue;
   SH.push(gridSurface((u,v)=>{const t=lerp(a,b,u),th=v*TAU;
    return[lerp(X0,X1,t),pipeY(S,t)+S.r*Math.sin(th),S.z+S.r*Math.cos(th)];},44,16,{uS:60,vS:S.r/2,
    hole:holeFn(d*.5,9325+si,null,1.5)}));}
  if(broke){  // the far half, torn loose and hanging off the wall
   const F=new THREE.Group();F.position.set(lerp(X0,X1,.78),pipeY(S,.78)-70,S.z);F.rotation.set(.12,0,-.52);G.add(F);
   mesh(gridSurface((u,v)=>{const t=u,th=v*TAU;return[t*430,S.r*Math.sin(th),S.r*Math.cos(th)];},22,14,{uS:60,vS:S.r/2,hole:holeFn(1,9326+si,null,1.2)}),MAT.rust,F);}
  // flanges and a walkway rail along the top
  for(let k=0;k<=18;k++){const t=k/18;if(broke&&t>.5)continue;
   kput(d>0?'ringR':'ringW',[lerp(X0,X1,t),pipeY(S,t),S.z],null,[S.r*1.1,S.r*1.1,S.r*.16],null);}
  for(let k=0;k<26;k++){const t=k/26,t2=(k+1)/26;if(broke&&t>.48)continue;
   beam(d>0?'strutR':'strutW',[lerp(X0,X1,t),pipeY(S,t)+S.r*1.02,S.z],[lerp(X0,X1,t2),pipeY(S,t2)+S.r*1.02,S.z],1.4,S.r*.5);}
  // ------------------------------------------------------------ the payloads
  S.hangs.forEach(o=>{
   const ax=lerp(X0,X1,o.u),ay=pipeY(S,o.u)-S.r,az=S.z;
   if(o.t==='lift'){liftTrack(G,SH,DK,ax,ay,az,o.drop,d);return;}
   const fallen=d===2&&(o.t==='pod'&&o.sd===31||o.t==='ring'||o.t==='prism');
   const P=HANG[o.t](o.R,d,o.sd);
   if(fallen){
    // cable snapped: the payload is on the canyon floor, broken open
    const F=new THREE.Group();F.position.set(ax+rr(-140,140),0,az+rr(-120,120));
    F.rotation.set(rr(-.5,.5),rng()*TAU,rr(.6,1.6));G.add(F);
    const fs=[],fg=[],fk=[];hangEmit(P,new THREE.Matrix4(),fs,fg,fk);
    meshMerged(fs,MAT.rust,F);meshMerged(fk,MAT.guts,F);
    dropFragment(F,0,o.R*.22);
    // the snapped cable still hanging from the pipe
    beam('boxD',[ax,ay,az],[ax+rr(-30,30),ay-o.drop*rr(.5,.9),az+rr(-30,30)],2.2,2.2);
    rubbleRing(F.position.x,0,F.position.z,o.R*.5,o.R*2.4,70,3);
    return;}
   // hung: slight sway when rusted, plumb when intact
   const tilt=d>0?rr(-.09,.09):0;
   const M=new THREE.Matrix4().compose(new THREE.Vector3(ax,ay-o.drop,az),
    qEuler(tilt,rng()*TAU,tilt*.7),new THREE.Vector3(1,1,1));
   hangEmit(P,M,SH,GL,DK);
   // the cables: one heavy pair, plus guys to steady it
   for(const sg of [-1,1])beam(d>0?'strutR':'strutW',[ax+sg*o.R*.10,ay,az],[ax+sg*o.R*.16,ay-o.drop,az],2.6,2.6);
   for(let k=0;k<3;k++){const th=k/3*TAU+.4;
    beam('boxD',[ax,ay-2,az],[ax+Math.cos(th)*o.R*.8,ay-o.drop+o.R*.2,az+Math.sin(th)*o.R*.8],1.1,1.1);}
   if(d>0){vinesOnRing(ax,ay-o.drop+o.R*.3,az,o.R*.95,Math.round(o.R*.5),o.R*1.3);
    mossOnRing(ax,ay-o.drop+o.R*.2,az,o.R*.9,Math.round(o.R*.4),o.R*.05);}});});
 meshMerged(SH,skin,G);meshMerged(DK,d>0?MAT.guts:MAT.dark,G);
 GL.forEach(g=>mesh(g,d>0?MAT.guts:MAT.glass,G));
 if(d>0){scatterMoss(0,0,0,0,GAP*1.6,180,3.4);trees(0,0,120,GAP*1.5,26);
  rubbleRing(0,0,0,GAP*.3,GAP*1.4,90,3);}
 figures(0,-300,8,120);figures(240,420,6,90);
 KOFF=[0,0,0];return G;}

// The climbing elevator. One hanger's cable is a TRACK: a heavy twin cable with
// a rack between, a guide rail, and a counterweight on the return side. There is
// no animation system in this kit, so the car is parked — but at a different
// height in each variant, so across the three it reads as a thing that moves.
function liftTrack(G,SH,DK,ax,ay,az,drop,d){
 const bot=4,H=ay-bot;
 for(const sg of [-1,1])beam(d>0?'strutR':'strutW',[ax+sg*5,ay,az],[ax+sg*5,bot,az],2.4,2.4);
 for(let k=0;k*9<H;k++)kput(d>0?'boxR':'boxW',[ax,ay-k*9,az],null,[9,1.1,1.6],null);   // rack teeth
 kput(d>0?'boxR':'boxW',[ax,ay+6,az],null,[26,10,18],null);                            // winch house
 kput('tube',[ax,ay+6,az],qEuler(0,0,Math.PI/2),[5,28,5],null);
 const cw=d===2?bot+30:ay-drop*.35;                                                     // counterweight
 kput('boxD',[ax+11,cw,az],null,[6,14,6],null);
 beam('boxD',[ax+11,ay,az],[ax+11,cw,az],1.2,1.2);
 // the car
 const cy=d===0?ay-drop*.45:d===1?ay-drop*.86:bot+9;
 const CR=13;
 const C=new THREE.Group();C.position.set(ax,cy,az);
 if(d===2)C.rotation.set(.5,.7,1.1);                                                    // crashed at the foot
 G.add(C);
 mesh(lathe({rFn:()=>CR,H:CR*1.5,nu:20,nv:5,hole:holeFn(d*.8,9328,null,2)}),SHELL(d),C,0,-CR*.75,0);
 mesh(lathe({rFn:()=>CR*.88,H:CR*1.5,nu:12,nv:2}),d>0?MAT.guts:MAT.dark,C,0,-CR*.75,0);
 for(let k=0;k<6;k++){const th=k/6*TAU;
  kput(d>0?'winSmD':'winSmI',[ax+CR*1.02*Math.cos(th),cy-CR*.75+CR*.75,az+CR*1.02*Math.sin(th)],
   qFacing([Math.cos(th),0,Math.sin(th)]),[CR*.3,CR*.34,1],null);}
 if(d===2){rubbleRing(ax,0,az,10,60,50,2.6);
  beam('boxD',[ax-5,ay,az],[ax-5+rr(-40,40),bot+rr(20,90),az+rr(-40,40)],2.4,2.4);}   // snapped track
 else kput('dot',[ax,cy-2,az+CR*1.05],qFacing([0,0,1]),[CR*.5,CR*.3,1],WARM);}
