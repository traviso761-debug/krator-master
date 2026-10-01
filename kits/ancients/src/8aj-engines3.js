// ================================================================= THE ENGINES — cyclopean machines of unclear purpose (3 of 3)
// Five more on the same plain, built with the helpers in 8ah-engines.js and
// 8ai-engines2.js, and three more of their own below.
//
//   THE LOOM      a 470 m girder on two A-frame trestles, hundreds of cables
//                 hanging from a bar under it into a long trough, a shuttle
//                 carriage on top. The east trestle has folded and that end of
//                 the girder has come down, its cables slack across the plain.
//                 The shuttle fell nose-first into the ground.
//   THE COIL      a copper winding of seventeen turns round a 350 m core, sunk to
//                 its axis between spoil banks, flanged at both ends and cabled
//                 to a pylon line. The east end has sprung: its last turns have
//                 uncoiled across the plain. One flange is broken; two pylons are down.
//   THE BELL      a verdigris bell 145 m across on a chain under a lattice tripod
//                 300 m tall, over a round plinth with a well in it. The chain
//                 parted and one leg buckled: the bell lies on its side, cracked,
//                 a shard of its lip beside it and the clapper thrown clear.
//   THE BELLOWS   a pleated square bellows 290 m long between a fixed bulkhead
//                 and one on rails, pushed by a ram and venting through a duct
//                 into the ground. Torn open and sagging; the rail end has
//                 derailed and the ram has snapped.
//   THE GRASP     a jointed arm on a slewing turret, its four-fingered hand
//                 closed round a standing stone, with a row of such stones set
//                 out beside it. The arm has slumped and dropped the stone, which
//                 broke; a finger is off and the counterweight has fallen.
//
// Same conventions as 8ah: local to (gx,0,gz), decay 1 shown, the ruin gated
// on dd so d 0 gives the whole machine. Seeds 10200-10244.

// A tube swept along a path P(s), s in 0..1, sampled at n+1 points; rF(s) is
// its radius. The frames are parallel-transported, so a helix does not twist.
// hole(u,s) drops a quad.
function enSweep(P,n,rF,nu,hole){const C=[],T=[],N=[];
 for(let i=0;i<=n;i++)C.push(enV(P(i/n)));
 let len=0;for(let i=1;i<=n;i++)len+=C[i].distanceTo(C[i-1]);
 for(let i=0;i<=n;i++)T.push(C[Math.min(n,i+1)].clone().sub(C[Math.max(0,i-1)]).normalize());
 let nn=enFrame(T[0])[0];
 for(let i=0;i<=n;i++){nn=nn.clone().addScaledVector(T[i],-nn.dot(T[i])).normalize();N.push(nn);}
 const B=T.map((t,i)=>new THREE.Vector3().crossVectors(t,N[i]));
 const opt={uS:rF(0)*TAU/8,vS:len/8};if(hole)opt.hole=hole;
 return gridSurface((u,v)=>{const i=Math.round(v*n),th=u*TAU,r=rF(i/n),c=Math.cos(th)*r,s=Math.sin(th)*r;
  return[C[i].x+N[i].x*c+B[i].x*s,C[i].y+N[i].y*c+B[i].y*s,C[i].z+N[i].z*c+B[i].z*s];},nu,n,opt);}
// A box from a to b, h by w across, UVs in metres: arms, girders, fingers.
function enSeg(acc,a,b,h,w){const A=enV(a),B=enV(b),L=A.distanceTo(B),g=enBlk([],0,0,0,L,h,w);
 // (r128 geometries have no applyQuaternion)
 g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),B.clone().sub(A).normalize())));
 g.translate((A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2);acc.push(g);return g;}
// A cubic Bezier through four points, as a path for enSweep.
function enBez(p0,p1,p2,p3){return s=>{const a=(1-s)*(1-s)*(1-s),b=3*s*(1-s)*(1-s),c=3*s*s*(1-s),e=s*s*s;
 return[0,1,2].map(k=>a*p0[k]+b*p1[k]+c*p2[k]+e*p3[k]);};}

// ---------------------------------------------------------------- THE LOOM
function buildLoom(scene,gx,gz,d){reseed(10200+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),conc=CONC(d),acc=[],gird=[],HT=236,XE=220,HB=HT-34;
 const XB=dd?110:XE+16,GE=[XE+30,52,0];   // where the standing girder ends; the fallen end
 // THE TROUGH: long walls in 30 m lengths, end walls, a dark floor, and the
 // woven sheet lying in it. In the ruin some wall lengths have fallen outward.
 for(let i=0;i<14;i++){const x=-195+i*30;for(const s of[-1,1]){
  if(dd&&rng()<.18){enRotBlk(G,conc,[x+rr(-5,5),3,s*rr(36,44)],[28,6,18],rr(-.15,.15),rr(-.3,.3),0);continue;}
  enBlk(acc,x,9,s*26,29.6,18,6);}}
 for(const s of[-1,1])enBlk(acc,s*213,9,0,6,18,58);
 kput('boxD',[0,.6,0],null,[420,1.2,46]);
 const hs=holeFn(.6*dd,10203,null,1.3);
 const sheet=gridSurface((u,v)=>{const x=lerp(-206,206,u),z=lerp(-22,22,v);return[x,12+2.2*Math.sin(x*.09)*Math.cos(z*.2),z];},84,8,
  {uS:412/8,vS:44/8,hole:hs?(u,v)=>hs(u,v*44):undefined});
 mesh(sheet,MAT.guts,G);
 // THE TRESTLES: two lattice legs each, leaning in to the girder, with a
 // cross tie. In the ruin the east one has folded under the fallen girder end.
 const leg=(a,b)=>enTruss('strutR',a,b,9,18,.7,.22*dd);
 for(const e of[-1,1]){const x=e*XE,fold=dd&&e>0;
  for(const s of[-1,1]){const foot=[x,0,s*92];enBlk(acc,x,4,s*92,22,8,22);
   if(fold){const kn=[x+34,40,s*84];leg([x,8,s*92],kn);leg(kn,[x+30,40,s*16]);}
   else leg([x,8,s*92],[x,HT-2,s*14]);}
  if(!fold)enTruss('strutR',[x,110,-55],[x,110,55],7,14,.6,.22*dd);}
 // the cabin on the west trestle
 enDeck(gird,-XE-24,146,0,18,14,30,4.5,4.5,PL);
 // THE GIRDER, ribbed, with rails on top. In the ruin it is broken at XB and
 // the east length hangs from the break to the folded trestle.
 const GA=[-XE-16,HT+10,0],GB=[XB,HT+10,0];
 enSeg(gird,GA,GB,20,24);if(dd)enSeg(gird,[XB+3,HT+5,0],GE,20,24);
 const ribs=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),q=qEuler(0,0,Math.atan2(b[1]-a[1],b[0]-a[0]));
  for(let t=6;t<L-3;t+=12){const f=t/L,x=lerp(a[0],b[0],f),y=lerp(a[1],b[1],f);if(dd&&rng()<.2)continue;
   for(const s of[-1,1])kput(PL,[x,y,s*12.7],q,[1.8,20.4,1.2]);}
  for(const s of[-1,1])beam('boxD',[a[0],a[1]+10.8,s*8],[b[0],b[1]+10.8,s*8],1.4,1.4);};
 ribs(GA,GB);if(dd){ribs([XB+3,HT+5,0],GE);
  for(let k=0;k<6;k++)kput(PL,[XB+rr(-2,4),HT+rr(-2,16),rr(-12,12)],qEuler(rr(-1,1),rr(-1,1),rr(-1,1)),[rr(6,12),rr(4,9),1]);}
 // THE BAR the cables hang from, slung on rods under the girder
 const HX1=dd?100:206;
 enBlk(gird,(HX1-206)/2,HB,0,HX1+206,6,8);
 for(let x=-200;x<=HX1;x+=38)beam('tube',[x,HT,0],[x,HB+3,0],.7,.7);
 if(dd)beam(PL,[HX1,HB,0],[HX1+14,HB-72,6],5,7);              // its broken end, hanging
 // THE WARP: two rows of cables from the bar into the trough. In the ruin some
 // are gone and some snapped short; under the fallen length they hang from the
 // girder to the ground and trail off across the plain.
 for(let x=-204;x<=204;x+=2.6)for(const z of[-3,3]){
  if(x<=HX1){if(dd&&rng()<.28)continue;
   if(dd&&rng()<.18){enHang('tube',[[x,HB-3,z]],10,HB-40,.32);continue;}
   kput('tube',[x,(HB-3+14)/2,z],null,[.32,HB-17,.32]);}
  else if(dd&&x>XB+4&&rng()<.7){const t=(x-XB)/(GE[0]-XB),y=lerp(HT-6,GE[1]-11,t);
   kput('tube',[x,y/2,z],null,[.32,y,.32]);beam('tube',[x,.4,z],[x+rr(-8,30),.4,z+rr(-50,50)],.32,.32);}}
 // THE SHUTTLE: a carriage on the rails, its grab hanging; in the ruin it
 // fell, and lies nose-down in the ground beside the trough.
 if(dd){enRotBlk(G,MAT.rust,[52,11,84],[36,26,40],.15,.6,.35);enDebris(52,84,50,30,PL);
  beam('tube',[52,22,84],[20,.5,120],.8,.8);}
 else{enBlk(gird,60,HT+33,0,36,26,40);
  for(const s of[-1,1])for(const x of[48,72])kput('pipeR',[x,HT+22,s*8],qEuler(Math.PI/2,0,0),[3,4,3]);
  enHang('tube',[[60,HT+20,19],[60,HT+20,-19]],40,60,.6);}
 if(dd){enOvergrow(gird,80,24,0,0);mossOnSurface([sheet],0,0,0,60,4);enDebris(GE[0],0,60,30,PL);}
 meshMerged(acc,conc,G);meshMerged(gird,MAT.rust,G);
 scatterMoss(0,0,0,60,330,90+60*dd,4);trees(0,0,150,440,34+40*dd);
 figures(-60,70,6,9);
 REGISTER({name:'The Loom: girder and trestles',x:0,y:0,z:0,r:260,h:HT+40});
 if(dd)REGISTER({name:'The Loom: fallen shuttle',x:52,y:0,z:84,r:30,h:30});
 EN_SITE.loom={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE COIL
function buildCoil(scene,gx,gz,d){reseed(10210+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),acc=[],AY=24,RC=36,RW=52,X0=-160,X1=160,TURNS=17;
 const hP=s=>{const a=s*TURNS*TAU+Math.PI/2;return[lerp(X0,X1,s),AY+RW*Math.sin(a),RW*Math.cos(a)];};
 const SB=dd?.8:1;   // the winding holds to here; in the ruin the rest has sprung
 // THE CORE, sunk to just below its axis
 const hc=holeFn(.4*dd,10213,null,1);
 mesh(enTube([X0-14,AY,0],[X1+14,AY,0],()=>RC,40,30,hc||undefined),MAT.rust,G);
 if(dd)mesh(enTube([X0-14,AY,0],[X1+14,AY,0],()=>RC-1.6,20,12),MAT.guts,G);
 // THE WINDING, and the spacers that hold it off the core
 mesh(enSweep(s=>hP(s*SB),Math.round(TURNS*SB*40),()=>5.5,8),MAT.verdigris,G);
 for(let i=0;i<TURNS*8;i++){const s=(i+.5)/(TURNS*8);if(s>SB||(dd&&rng()<.2))continue;const p=hP(s);if(p[1]<4)continue;
  beam('strutR',[p[0],AY+(p[1]-AY)*RC/RW,p[2]*RC/RW],p,3.2,6);}
 if(dd){// the bare core where the turns came off, scored where each lay
  for(let s=SB+.5/TURNS;s<1;s+=1/TURNS)kput('ringR',[lerp(X0,X1,s),AY,0],qEuler(0,Math.PI/2,0),[RC+.6,RC+.6,40]);
  // the sprung end: up off the core, over the bank, and down across the plain
  const p0=hP(SB),pb=hP(SB-.002),T=[p0[0]-pb[0],p0[1]-pb[1],p0[2]-pb[2]],tl=Math.hypot(T[0],T[1],T[2]);
  const E=[X1+250,4.5,220];
  mesh(enSweep(enBez(p0,p0.map((c,k)=>c+T[k]/tl*90),[X1+150,70,150],E),70,()=>5.5,8),MAT.verdigris,G);
  mesh(enSweep(s=>{const a=s*2.2*TAU;return[E[0]+130*s+24*Math.sin(a),4.5+1.5*Math.sin(a*.5),E[2]+60*s+24*(1-Math.cos(a))];},90,()=>5.5,8),MAT.verdigris,G);
  enDebris(X1+200,180,90,40,PL);}
 // THE FLANGES at both ends: an annulus, a rim, gussets on the outer face.
 // In the ruin the east one has lost a sector, which lies by it.
 const flange=(x,sg,hole)=>{const R=74;
  for(const dx of[-4,4])mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RC,R,v);return[x+dx,AY+r*Math.sin(th),r*Math.cos(th)];},48,3,{uS:R*TAU/8,vS:R/8,hole}),MAT.rust,G);
  mesh(gridSurface((u,v)=>{const th=u*TAU;return[x+lerp(-4,4,v),AY+R*Math.sin(th),R*Math.cos(th)];},48,1,{uS:R*TAU/8,vS:1,hole:hole?(u,v)=>hole(u,.9):undefined}),MAT.rust,G);
  for(let k=0;k<16;k++){const u=(k+.5)/16,th=u*TAU,r=56;if(AY+r*Math.sin(th)<6||(hole&&hole(u,.5)))continue;
   kput(PL,[x+sg*9,AY+r*Math.sin(th),r*Math.cos(th)],qEuler(Math.PI/2-th,0,0),[10,34,1.6]);}};
 flange(X0-12,-1,null);flange(X1+12,1,dd?(u,v)=>u>.3&&u<.45:null);
 if(dd)enRotBlk(G,MAT.rust,[X1+48,5,-96],[44,8,52],.12,.5,.08);
 // the terminal on the east flange: insulator stacks, cables away north to a
 // line of pylons. Two pylons have come down in the ruin.
 const TB=[X1+12,AY+80,0];enBlk(acc,TB[0],TB[1],TB[2],14,12,34);
 for(const s of[-1,1])for(let k=0;k<6;k++)kput('slabC',[TB[0],TB[1]+8+k*5,s*11],null,[k%2?4:6.5,4,k%2?4:6.5]);
 const PY=[[X1+60,-260],[X1+60,-470],[X1+60,-680],[X1+60,-890]],PH=96;
 let prev=[[TB[0],TB[1]+38,-11],[TB[0],TB[1]+38,11]];
 const sagLine=(a,b,sg)=>{let q=a;for(let i=1;i<=8;i++){const t=i/8,p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-sg*4*t*(1-t),lerp(a[2],b[2],t)];beam('tube',q,p,.45,.45);q=p;}};
 PY.forEach((P,k)=>{const down=dd&&k>=2;
  if(down){const a=k===2?.3:-.2;enTruss('strutR',[P[0],7,P[1]],[P[0]+PH*Math.cos(a),7,P[1]+PH*Math.sin(a)],10,16,.6,.3);
   for(const s of[-1,1])beam('tube',prev[s<0?0:1],[P[0]+s*12,.5,P[1]+30],.45,.45);
   prev=[[P[0]-26,.5,P[1]],[P[0]+26,.5,P[1]]];return;}
  enTruss('strutR',[P[0],0,P[1]],[P[0],PH,P[1]],10,16,.6,.2*dd);
  beam('strutR',[P[0]-30,PH-4,P[1]],[P[0]+30,PH-4,P[1]],2,2);
  const tops=[[P[0]-26,PH-14,P[1]],[P[0]+26,PH-14,P[1]]];
  for(const t of tops)kput('slabC',[t[0],t[1]+5,t[2]],null,[1.6,10,1.6]);
  for(let s=0;s<2;s++)sagLine(prev[s],tops[s],k?14:22);prev=tops;});
 // THE BANKS: spoil heaped round the sunk coil
 const IX=230,IZ=82;
 const bank=gridSurface((u,v)=>{const x=lerp(-340,340,u),z=lerp(-200,200,v),qx=Math.abs(x)-IX,qz=Math.abs(z)-IZ;
  const e=Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0);
  return[x,30*Math.exp(-Math.pow((e-36)/26,2))*(.72+.56*fbm(x/40,z/40,10215,3))-.8,z];},96,56,{uS:680/8,vS:400/8});
 mesh(bank,EN_SPOIL,G);
 if(dd){mossOnSurface([bank],0,0,0,90,5);enOvergrow(acc,20,12,0,0);}
 meshMerged(acc,MAT.rust,G);
 scatterMoss(0,0,0,250,420,80+60*dd,4);trees(0,0,260,480,30+40*dd);
 figures(-120,120,6,9);
 REGISTER({name:'The Coil: winding and core',x:0,y:0,z:0,r:240,h:150});
 REGISTER({name:'The Coil: pylon line',x:X1+60,y:0,z:-575,r:330,h:110});
 if(dd)REGISTER({name:'The Coil: sprung end',x:X1+220,y:0,z:210,r:120,h:80});
 EN_SITE.coil={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE BELL
function buildBell(scene,gx,gz,d){reseed(10220+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),conc=CONC(d),acc=[],frame=[],BH=132,LIP=58,RF=205;
 const ang=k=>-Math.PI/2+k*TAU/3;
 const AP=dd?[Math.cos(ang(1))*22,286,Math.sin(ang(1))*22]:[0,304,0];
 // THE PLINTH and the well in it
 mesh(enTube([0,0,0],[0,8,0],()=>96,48,1),conc,G);mesh(enRing([0,8,0],[0,1,0],0,96,48),conc,G);
 mesh(enRing([0,8.15,0],[0,1,0],0,62,48),MAT.dark,G);
 kput('ringR',[0,8.4,0],qEuler(Math.PI/2,0,0),[62,62,20]);
 // THE TRIPOD. In the ruin the south-east leg has buckled and the head has
 // dropped and swung toward it.
 for(let k=0;k<3;k++){const a=ang(k),F=[RF*Math.cos(a),14,RF*Math.sin(a)];enBlk(acc,F[0],7,F[2],32,14,32);
  const top=[AP[0]+10*Math.cos(a),AP[1]-12,AP[2]+10*Math.sin(a)];
  if(dd&&k===1){const kn=[lerp(F[0],top[0],.42)+Math.cos(a)*26,lerp(F[1],top[1],.42)-18,lerp(F[2],top[2],.42)+Math.sin(a)*26];
   enTruss('strutR',F,kn,13,22,.9,.3);enTruss('strutR',kn,top,13,22,.9,.25);
   for(let i=0;i<5;i++)kput(PL,[kn[0]+rr(-6,6),kn[1]+rr(-6,6),kn[2]+rr(-6,6)],qEuler(rng()*3,rng()*3,rng()*3),[rr(8,16),rr(5,10),1.2]);}
  else enTruss('strutR',F,top,13,22,.9,.22*dd);}
 enBlk(frame,AP[0],AP[1],AP[2],36,26,36);
 kput('pipeR',[AP[0],AP[1]-18,AP[2]],qEuler(Math.PI/2,0,0),[13,12,13]);
 // THE BELL, built in its own frame with its crown at the origin and its lip
 // BH below. Hung from the chain, or in the ruin fallen on its side with its
 // mouth to the south-west, cracked, a sector of the lip broken out.
 const bR=v=>28+14*v+30*Math.pow(v,3.2);
 const BY=new THREE.Group(),BZ=new THREE.Group();BY.add(BZ);G.add(BY);
 if(dd){BY.position.set(40,23.6,150);BY.rotation.y=-2.36;BZ.rotation.z=1.9;}
 else BY.position.set(0,LIP+BH,0);
 const cr=dd?(u,v)=>(u>.02&&u<.048&&v>.3)||(u>.3&&u<.42&&v>.86):undefined;
 for(const [dr,mat] of [[0,MAT.verdigris],[-2.6,MAT.guts]])
  mesh(gridSurface((u,v)=>{const th=u*TAU,r=bR(v)+dr;return[r*Math.cos(th),-BH*v,r*Math.sin(th)];},56,24,{uS:50*TAU/8,vS:BH/8,hole:cr}),mat,BZ);
 mesh(gridSurface((u,v)=>{const th=u*TAU,p=v*Math.PI/2;return[28*Math.cos(p)*Math.cos(th),12*Math.sin(p),28*Math.cos(p)*Math.sin(th)];},40,6,{uS:22,vS:6}),MAT.verdigris,BZ);
 const bands=[];
 for(const v of[.08,.5,.93,1]){const lip=v===1,gap=dd&&v>.86;
  const g=new THREE.TorusGeometry(bR(v)+(lip?-1.3:.8),lip?2.6:1.4,6,72,gap?TAU*.88:TAU);g.rotateX(Math.PI/2);if(gap)g.rotateY(-.42*TAU);
  g.translate(0,-BH*v,0);bands.push(g);}
 bands.push(enBlk([],0,19,0,18,16,8));
 const loop=new THREE.TorusGeometry(8,2,6,24);loop.translate(0,34,0);bands.push(loop);
 meshMerged(bands,MAT.verdigris,BZ);
 if(dd){// the shard of the lip, the clapper thrown clear, the chain on the plain
  const fr=gridSurface((u,v)=>{const th=lerp(.3,.42,u)*TAU,vv=lerp(.86,1,v),r=bR(vv);return[r*Math.cos(th),-BH*vv,r*Math.sin(th)];},8,3,{uS:6,vS:3});
  fr.computeBoundingBox();const c=fr.boundingBox.getCenter(new THREE.Vector3());fr.translate(-c.x,-c.y,-c.z);
  mesh(fr,MAT.verdigris,G,-150,8,330).rotation.set(1.2,.4,.2);
  beam('pipeR',[-110,3,40],[-150,3,140],3,3);mesh(enSphere([-156,12,152],13,null,20,12),MAT.rust,G);
  const ch=enBez([10,0,-30],[90,0,10],[-20,0,80],[30,0,128]);
  for(let i=0;i<26;i++){const p=ch(i/25);kput('ringR',[p[0],i%2?6:1.4,p[2]],i%2?qEuler(0,rng()*3,0):qEuler(Math.PI/2,0,0),[4.5,6,26]);}
  for(let i=0;i<5;i++)kput('ringR',[AP[0],AP[1]-26-i*8,AP[2]],qEuler(0,(i%2)*Math.PI/2,0),[4.5,6,26]);
  enDebris(-60,240,120,50,PL);rubbleRing(0,0,0,70,100,30,4);}
 else{const cl=new THREE.CylinderGeometry(3,3,BH-10,8);cl.translate(0,-(BH-10)/2-4,0);mesh(cl,MAT.rust,BZ);
  mesh(enSphere([0,-BH+4,0],13,null,20,12),MAT.rust,BZ);
  for(let y=AP[1]-26,i=0;y>LIP+BH+30;y-=8,i++)kput('ringR',[0,y,0],qEuler(0,(i%2)*Math.PI/2,0),[4.5,6,26]);}
 if(dd)enOvergrow(acc,40,10,0,0);
 meshMerged(acc,conc,G);meshMerged(frame,MAT.rust,G);
 scatterMoss(0,0,0,100,340,90+60*dd,4);trees(0,0,120,460,34+40*dd);
 figures(-90,-40,6,9);
 REGISTER({name:'The Bell: tripod',x:0,y:0,z:0,r:225,h:320});
 if(dd)REGISTER({name:'The Bell: fallen bell',x:-5,y:0,z:195,r:110,h:100});
 EN_SITE.bell={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE BELLOWS
function buildBellows(scene,gx,gz,d){reseed(10230+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),conc=CONC(d),acc=[],YC=66,XA=-150,XB=150,NV=56;
 // the middle sags in the ruin: the top drops, the bottom stays on its cradles
 const sag=x=>dd?34*Math.pow(Math.max(0,Math.sin(Math.PI*(x-XA)/(XB-XA))),1.6):0;
 const sq=th=>1/Math.max(Math.abs(Math.cos(th)),Math.abs(Math.sin(th)));
 const tear=dd?holeFn(.5,10233,null,1.3):null;
 const hole=dd?(u,v)=>(u>.17&&u<.33&&v>.3&&v<.62)||(u>.6&&u<.7&&v>.7&&v<.8)||tear(u,v*290):undefined;
 // THE PLEATS: a square section that steps in and out every 5 m, with a dark
 // lining 2 m inside it
 const pleats=[];
 for(const [dr,mat] of [[0,MAT.rust],[-2.2,MAT.guts]]){const g=gridSurface((u,v)=>{const j=Math.round(v*NV),x=lerp(XA+8,XB-8,j/NV),r=(j%2?42:54)+dr,th=u*TAU,q=r*sq(th),sn=q*Math.sin(th);
  return[x,YC+sn-sag(x)*(.5+.5*sn/r),q*Math.cos(th)];},32,NV,{uS:54,vS:284/8,hole});mesh(g,mat,G);pleats.push(g);}
 // a plated frame on every outer pleat; in the ruin many are off and lie by it
 for(let j=0;j<=NV;j+=2){const x=lerp(XA+8,XB-8,j/NV),s0=sag(x);
  if(dd&&rng()<.35){if(rng()<.5)kput(PL,[x+rr(-6,6),.8,(rng()<.5?-1:1)*rr(62,90)],qEuler(0,rr(-.6,.6),0),[2.4,1.4,rr(40,100)]);continue;}
  kput(PL,[x,YC+54.8-s0,0],null,[2.4,1.4,110]);
  for(const s of[-1,1])kput(PL,[x,YC-s0/2,s*54.8],null,[2.4,108-s0,1.4]);}
 for(let x=-115;x<=115;x+=46)enBlk(acc,x,6,0,10,12,116);          // the cradles
 // THE FIXED BULKHEAD, ribbed, a valve house on top
 enBlk(acc,XA,68,0,16,136,136);enBlk(acc,XA,142,0,20,12,40);
 for(let z=-60;z<=60;z+=20)kput(PL,[XA-8.6,68,z],null,[1.2,136,3]);
 for(let y=20;y<130;y+=14)kput('cellD',[XA-8.2,y,0],qEuler(0,Math.PI/2,0),[100,1.6,1]);
 // THE DUCT out of it, turning down into the ground
 const hd=holeFn(.45*dd,10236,null,1);
 mesh(enTube([XA-8,66,0],[XA-92,66,0],t=>34-t*.08,24,6,hd||undefined),MAT.rust,G);
 mesh(enSphere([XA-96,63,0],28,null,24,12),MAT.rust,G);
 mesh(enTube([XA-96,62,0],[XA-124,-6,0],()=>27,24,6),MAT.rust,G);
 kput('ringR',[XA-121,1,0],qEuler(Math.PI/2,0,0),[30,30,30]);
 mesh(enRing([XA-121,.3,0],[0,1,0],0,44,32),conc,G);
 // THE RAILS and their sleepers; in the ruin one rail is torn up
 for(let x=XA+10;x<=XB+250;x+=7)kput('boxCR',[x,.4,0],null,[2.6,.8,96]);
 for(const z of[-40,40]){if(dd&&z>0){beam('boxD',[XA+10,1.2,z],[XB-20,1.2,z],1.6,2.4);beam('boxD',[XB-20,1.2,z],[XB+30,10,z+18],1.6,2.4);
   beam('boxD',[XB+40,1.2,z],[XB+250,1.2,z],1.6,2.4);continue;}
  beam('boxD',[XA+10,1.2,z],[XB+250,1.2,z],1.6,2.4);}
 // THE MOVING BULKHEAD on its carriage. Derailed in the ruin: shoved east,
 // dropped on one side and slewed, so the pleats have torn away from it.
 const BB=new THREE.Group();G.add(BB);
 if(dd){BB.position.set(XB+16,-3,8);BB.rotation.set(.05,.14,-.09);}else BB.position.set(XB,0,0);
 const bb=[];enBlk(bb,0,70,0,14,128,128);enBlk(bb,0,4,0,30,8,100);
 useGroupXF(BB);
 for(const x of[-10,10])for(const z of[-40,40])kput('pipeR',[x,4,z],qEuler(Math.PI/2,0,0),[5,4,5]);
 for(let z=-56;z<=56;z+=16)kput(PL,[7.6,70,z],null,[1.2,128,3]);
 endGroupXF();
 meshMerged(bb,MAT.rust,BB);
 // THE RAM that pushed it, from a buttress; snapped in the ruin, its end and
 // its rod lying on the plain
 enBlk(acc,XB+280,44,0,44,88,96);
 if(dd){beam('pipeR',[XB+258,66,0],[XB+170,66,0],17,17);beam('pipeR',[XB+160,16,34],[XB+96,16,74],16,16);
  beam('pipeR',[XB+60,7,-30],[XB+150,7,-50],7,7);enDebris(XB+120,20,60,30,PL);}
 else{beam('pipeR',[XB+258,66,0],[XB+100,66,0],17,17);beam('pipeR',[XB+100,66,0],[XB+7,66,0],7,7);}
 kput('ringR',[XB+250,66,0],qEuler(0,Math.PI/2,0),[19,19,40]);
 if(dd){enOvergrow(acc,70,20,0,0);mossOnSurface([pleats[0]],0,0,0,70,4);vinesFromLedge([pleats[0]],0,0,0,40,26,0,0);}
 meshMerged(acc,conc,G);
 scatterMoss(0,0,0,90,360,90+60*dd,4);trees(0,0,170,460,34+40*dd);
 figures(-60,110,6,9);
 REGISTER({name:'The Bellows',x:70,y:0,z:0,r:360,h:150});
 if(dd)REGISTER({name:'The Bellows: the snapped ram',x:XB+120,y:0,z:20,r:70,h:40});
 EN_SITE.bellows={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE GRASP
// Dark stone for the blocks it sets, so they read as quarried monoliths and
// not as more concrete. The hex is linear, like EN_SPOIL's.
const EN_STONE=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x3a3430,roughness:.95,side:DS});
function buildGrasp(scene,gx,gz,d){reseed(10240+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),conc=CONC(d),arm=[],ZR=-150;
 // THE TURRET: a drum, a slewing ring, a plated housing, a counterweight
 mesh(enTube([0,0,0],[0,30,0],()=>52,48,1),conc,G);mesh(enRing([0,30,0],[0,1,0],0,52,48),conc,G);
 kput('ringR',[0,31,0],qEuler(Math.PI/2,0,0),[46,46,30]);
 enDeck(arm,-6,32,0,90,46,64,8,9,PL);
 if(dd){enRotBlk(G,MAT.rust,[-96,16,22],[30,40,56],0,.3,1.45);enDebris(-90,20,50,24,PL);enBreach(-6,56,0,90,64,3,PL);}
 else enBlk(arm,-62,58,0,30,40,56);
 // THE ARM: shoulder, elbow, wrist, in the x-y plane. In the ruin it has
 // slumped and the open hand rests on the ground.
 const S=[30,74,0],E=dd?[124,186,0]:[120,236,0],W=dd?[218,52,0]:[236,112,0],P=[W[0],W[1]-14,W[2]];
 enSeg(arm,S,E,22,18);enSeg(arm,E,W,16,14);
 for(const [p,r] of [[S,13],[E,11],[W,9]])kput('pipeR',p,qEuler(Math.PI/2,0,0),[r,26,r]);
 const L=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
 // the hydraulics: a pair to lift the boom, a pair to swing the forearm
 for(const z of[-14,14]){const h0=[44,52,z],b0=L(S,E,.5);b0[2]=z;const h1=L(S,E,.7);h1[2]=z;const b1=L(E,W,.3);b1[2]=z;
  if(dd&&z>0){beam('pipeR',h0,L(h0,b0,.5),4,4);beam('tube',[h0[0]+70,1.5,z+30],[h0[0]+120,1.5,z+44],1.8,1.8);}
  else{beam('pipeR',h0,L(h0,b0,.6),4,4);beam('tube',L(h0,b0,.6),b0,1.8,1.8);}
  beam('pipeR',h1,L(h1,b1,.55),3.4,3.4);beam('tube',L(h1,b1,.55),b1,1.5,1.5);}
 // THE HAND: a palm and four fingers of two joints. Closed round the stone;
 // in the ruin open, the tips on the ground, one finger snapped off.
 enBlk(arm,P[0],P[1],P[2],30,12,30);
 for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
  const kn=[P[0]+c*15,P[1],P[2]+s*15],j2=[P[0]+c*30,P[1]-12,P[2]+s*30],tip=dd?[P[0]+c*44,P[1]-20,P[2]+s*44]:[P[0]+c*25,P[1]-48,P[2]+s*25];
  enSeg(arm,kn,j2,7,7);kput('pipeR',j2,qEuler(Math.PI/2,0,a),[4.5,8,4.5]);
  if(dd&&k===2){enSeg(arm,[P[0]-58,3,P[2]+70],[P[0]-34,3,P[2]+92],6,6);continue;}
  enSeg(arm,j2,tip,6,6);}
 // THE STONE it holds, standing; in the ruin dropped and broken in two
 const st=[];
 if(dd){enRotBlk(G,EN_STONE,[262,20,52],[36,44,36],0,.4,.25);enRotBlk(G,EN_STONE,[300,18,-14],[36,52,36],Math.PI/2-.08,.3,0);}
 else enBlk(st,W[0],42,0,36,100,36);
 // THE ROW of stones already set, behind it to the north, and a line of
 // sockets waiting past its end
 for(let i=0;i<7;i++){const x=-120+i*60,h=rr(64,100);
  if(dd&&(i===2||i===5)){enRotBlk(G,EN_STONE,[x+rr(-8,8),18,ZR-h/2+6],[36,h,36],Math.PI/2,rr(-.2,.2),0);continue;}
  enBlk(st,x,h/2-6,ZR,36,h,36);}
 for(let i=0;i<3;i++)kput('boxD',[300+i*60,.3,ZR],null,[38,.6,38]);
 if(dd){enHang('tube',[[E[0],E[1]-10,6],[E[0]+4,E[1]-12,-6],[E[0]-6,E[1]-8,0]],20,90,.9);
  enOvergrow(arm,80,22,0,0);mossOnSurface(st,0,0,0,40,4);}
 meshMerged(arm,MAT.rust,G);meshMerged(st,EN_STONE,G);
 scatterMoss(0,0,0,70,340,90+60*dd,4);trees(0,0,200,460,34+40*dd);
 figures(-40,120,6,9);
 REGISTER({name:'The Grasp: turret and arm',x:100,y:0,z:0,r:170,h:260});
 REGISTER({name:'The Grasp: the set stones',x:60,y:0,z:ZR-10,r:190,h:110});
 EN_SITE.grasp={x:gx,z:gz};
 KOFF=[0,0,0];return G;}
