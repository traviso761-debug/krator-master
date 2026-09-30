// ================================================================= THE ENGINES — cyclopean machines of unclear purpose (2 of 2)
// Five more, on the same plain, built with the helpers in 8ah-engines.js.
// Drawn from the rest of the reference set: the kneeling mechs and the Kenshi
// ruins, the junk-crowned disc walker, the refinery spheres, the needle towers
// and the drill-nosed land train.
//
//   THE SLEEPER   a colossal automaton, 240 m, kneeling on one knee with its
//                 head bowed and its right fist on the ground. The left arm
//                 has come off and lies beside it; a tree grows on its shoulder.
//   THE CARAPACE  a domed disc 260 m across on fourteen jointed legs, its top
//                 crusted with huts and stacks. The legs on its east side have
//                 folded and the whole disc lists into the plain.
//   THE RETORTS   pale spheres on leg frames, linked by a high pipe run, with a
//                 flare stack. One sphere has dropped off its frame and rolled
//                 away, split open; the frame stands empty.
//   THE NEEDLE    a square spire on a finned drum, with outrigger spars and guy
//                 cables. It snapped at 430 m; its top lies across the plain in
//                 two pieces.
//   THE RAM       a 300 m drill-nosed hull on four track units, driven nose-
//                 first into a ridge and stuck there. Its tail is torn open.
//
// Same conventions as 8ah: local to (gx,0,gz), decay 1 shown, the ruin gated
// on dd so d 0 gives the whole machine.

// A box like enBlk, turned about y before it is placed (for radial fins).
function enBlkY(acc,cx,cy,cz,sx,sy,sz,ry){const g=enBlk([],0,0,0,sx,sy,sz);g.rotateY(ry);g.translate(cx,cy,cz);acc.push(g);return g;}
// A sphere with metre UVs and an optional hole(u,y) predicate.
function enSphere(c,R,hole,nu,nv){return gridSurface((u,v)=>{const th=u*TAU,ph=v*Math.PI;
 return[c[0]+R*Math.sin(ph)*Math.cos(th),c[1]-R*Math.cos(ph),c[2]+R*Math.sin(ph)*Math.sin(th)];},nu||40,nv||24,
 {uS:R*TAU/8,vS:R*Math.PI/8,hole:hole?(u,v)=>hole(u,v*R*Math.PI):undefined});}

// ---------------------------------------------------------------- THE SLEEPER
function buildSleeper(scene,gx,gz,d){reseed(10150+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),body=[];
 // a limb is a hexagonal prism with capped ends, merged with the body
 const limb=(a,b,r)=>{const ax=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];body.push(enTube(a,b,()=>r,6,2),enRing(a,ax,0,r,6),enRing(b,ax,0,r,6));};
 // pelvis and hips
 enBlk(body,0,96,0,86,34,50);
 for(const s of[-1,1])kput('pipeR',[s*40,94,0],qEuler(0,0,Math.PI/2),[17,20,17]);
 // the right leg kneels: thigh forward and down to a knee on the ground, shin
 // back along the plain, toes dug in behind
 const hR=[34,92,0],kR=[38,18,62],aR=[38,14,-46];
 limb(hR,kR,17);limb(kR,aR,14);kput('pipeR',kR,qEuler(0,0,Math.PI/2),[19,32,19]);
 enBlk(body,38,9,-68,30,18,36);
 // the left leg is planted: thigh out level, shin down to a flat foot
 const hL=[-36,92,0],kL=[-40,92,84],aL=[-40,18,92];
 limb(hL,kL,17);limb(kL,aL,14);kput('pipeR',kL,qEuler(0,0,Math.PI/2),[19,32,19]);
 enBlk(body,-40,9,108,34,18,54);
 for(const k of[kR,kL])kput(PL,[k[0],k[1]+8,k[2]+14],qEuler(-.4,0,0),[30,22,4]);   // knee plates
 // THE TORSO leans forward over the knee, in its own frame
 const T=new THREE.Group();T.position.set(0,108,0);T.rotation.set(.3,0,.04*dd);G.add(T);
 const tb=[];
 enBlk(tb,0,18,0,64,36,46);                   // waist
 enBlk(tb,0,64,4,112,60,72);                  // chest
 enBlk(tb,0,100,-2,92,14,58);                 // collar
 enBlk(tb,0,110,14,20,14,20);                 // neck
 enBlk(tb,0,62,-46,74,56,24);                 // the pack on its back
 for(const s of[-1,1])enBlk(tb,s*78,88,0,46,40,60);   // pauldrons
 // the head, bowed further than the chest, and its dead visor
 enRotBlk(T,MAT.rust,[0,122,24],[34,30,38],.45,0,.1*dd);
 enRotBlk(T,MAT.dark,[0,115.5,42.2],[24,4,1.4],.45,0,.1*dd);
 useGroupXF(T);
 kput('plateW',[0,70,40.6],null,[64,30,1.2]);
 for(const s of[-1,1])kput('plateW',[s*78,108.6,0],null,[48,2,62]);
 kput('boxD',[26,56,40.9],null,[22,22,1.2]);
 if(dd)kput('plateR',[40,48,50],qEuler(0,-1.15,0),[22,22,1.6]);      // the chest hatch hangs open
 for(const s of[-1,1])kput('pipeR',[s*22,104,-46],null,[5,40,5]);
 kput('ringR',[0,132,4],qEuler(Math.PI/2,0,0),[10,10,20]);
 if(dd){kput('boxD',[-101.2,84,0],qEuler(0,0,Math.PI/2),[28,1.2,34]);   // the torn socket
  VEG.tree(76,109,6,1,16);VEG.tree(82,109,-12,0,11);                    // trees rooted on the shoulder
  enOvergrow(tb,90,22,0,0);enBreach(0,64,4,112,72,3,PL);}
 endGroupXF();
 meshMerged(tb,MAT.rust,T);
 // the right arm hangs from its shoulder to a fist on the ground
 const shR=enToW(T,[104,84,0]),H=[112,16,80];
 const Eb=[shR[0]+22,(shR[1]+H[1])/2+12,(shR[2]+H[2])/2-16];
 limb(shR,Eb,15);limb(Eb,H,13);kput('pipeR',Eb,qEuler(0,0,Math.PI/2),[16,26,16]);
 enBlk(body,H[0],13,H[2]+8,28,26,36);
 for(let k=0;k<4;k++)kput(PL,[H[0]-10+k*6.6,5,H[2]+30],qEuler(.3,0,0),[5,6,14]);
 // the left arm: whole and hanging, or in the ruin torn off and lying on the
 // plain with its cables spilled from the socket
 const shL=enToW(T,[-104,84,0]);
 if(dd){limb([-150,13,-30],[-162,13,60],15);limb([-162,12,60],[-120,11,128],13);
  kput('pipeR',[-148,15,-38],null,[17,20,17]);enBlk(body,-114,12,142,28,24,36);
  enHang('tube',[[shL[0]-2,shL[1]-6,shL[2]],[shL[0]-2,shL[1]-12,shL[2]+6],[shL[0]-3,shL[1],shL[2]-8]],30,120,1.1);
  beam('tube',[shL[0],shL[1]-10,shL[2]],[-150,2,-34],1,1);
  enDebris(-130,50,90,40,PL);}
 else{const EL=[shL[0]-22,(shL[1]+16)/2+12,(shL[2]+80)/2-16];limb(shL,EL,15);limb(EL,[-112,16,80],13);enBlk(body,-112,13,88,28,26,36);}
 // half-buried: spoil banked against the kneeling knee and the fist
 enHeap(G,38,62,48,14,10152);enHeap(G,112,82,34,9,10154);
 if(dd)enOvergrow(body,90,16,0,20);
 meshMerged(body,MAT.rust,G);
 enDebris(0,30,170,40+40*dd,PL);scatterMoss(0,0,0,80,300,100+60*dd,4);trees(0,0,150,420,40+40*dd);
 figures(60,150,6,9);
 REGISTER({name:'The Sleeper: body',x:0,y:0,z:20,r:150,h:260});
 if(dd)REGISTER({name:'The Sleeper: fallen arm',x:-140,y:0,z:50,r:80,h:30});
 EN_SITE.sleeper={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE CARAPACE
function buildCarapace(scene,gx,gz,d){reseed(10160+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),RD=130;
 // THE DISC is built in its own frame; in the ruin it lists east and a little south
 const C=new THREE.Group();C.rotation.set(.05*dd,0,-.2*dd);G.add(C);
 const domeY=r=>74+34*Math.pow(Math.max(0,1-(r/RD)*(r/RD)),.7);
 const hf=holeFn(.45*dd,10163,null,1.2);
 const dome=gridSurface((u,v)=>{const th=u*TAU,r=v*RD;return[r*Math.cos(th),domeY(r),r*Math.sin(th)];},72,24,
  {uS:RD*TAU/8,vS:RD/8,hole:hf?(u,v)=>v>.25&&hf(u,v*RD):undefined});
 mesh(dome,MAT.rust,C);
 mesh(gridSurface((u,v)=>{const th=u*TAU;return[RD*Math.cos(th),lerp(54,74.5,v),RD*Math.sin(th)];},96,2,{uS:RD*TAU/8,vS:3}),MAT.rust,C);
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RD,44,v);return[r*Math.cos(th),lerp(54,34,v),r*Math.sin(th)];},72,6,{uS:RD*TAU/8,vS:10}),MAT.guts,C);
 mesh(new THREE.CylinderGeometry(44,40,14,32),MAT.dark,C,0,27,0);
 mesh(enRing([0,70,0],[0,1,0],0,RD-2,48),MAT.guts,C);
 useGroupXF(C);
 // the crust on its back: huts, bins, stacks, masts
 for(let i=0;i<46;i++){const r=rr(8,104),a=rng()*TAU,w=rr(8,24),h=rr(6,20);
  kput(rng()<.55?PL:'boxCR',[r*Math.cos(a),domeY(r)+h/2-1.5,r*Math.sin(a)],qEuler(0,rng()*TAU,0),[w,h,w*rr(.6,1.3)]);}
 for(let i=0;i<4;i++){const a=i*1.7+.4,r=rr(30,70);kput('pipeR',[r*Math.cos(a),domeY(r)+20,r*Math.sin(a)],null,[4,44,4]);}
 for(let i=0;i<5;i++){const a=rng()*TAU,r=rr(10,90),h=rr(40,80);kput('tube',[r*Math.cos(a),domeY(r)+h/2,r*Math.sin(a)],null,[.5,h,.5]);}
 for(let k=0;k<48;k++){const a=k/48*TAU;kput(PL,[(RD+1.2)*Math.cos(a),64,(RD+1.2)*Math.sin(a)],qEuler(0,-a,0),[2.4,20,3]);}
 if(dd){mossOnSurface([dome],0,0,0,160,5);vinesFromLedge([dome],0,0,0,70,30,0,0);}
 endGroupXF();
 // THE LEGS, fourteen round the underside. Each is placed from where its
 // hip actually is after the list: those on the sunk side have folded, knee
 // on the ground and shin splayed flat; two have sheared off.
 for(let k=0;k<14;k++){const a=k/14*TAU+.1,o=[Math.cos(a),0,Math.sin(a)];
  const att=enToW(C,[118*o[0],50,118*o[2]]);
  kput('boxD',att,null,[14,14,14]);
  if(dd&&(k===4||k===9)){beam('plateR',att,[att[0]+o[0]*20,att[1]-10,att[2]+o[2]*20],12,10);
   beam('plateR',[att[0]+o[0]*60,5,att[2]+o[2]*60],[att[0]+o[0]*110,4,att[2]+o[2]*130],12,10);continue;}
  let knee,foot;
  if(dd&&att[1]<44){knee=[att[0]+o[0]*44,9,att[2]+o[2]*44];foot=[att[0]+o[0]*98,4,att[2]+o[2]*98];}
  else{knee=[att[0]+o[0]*52,att[1]+26,att[2]+o[2]*52];foot=[o[0]*214,0,o[2]*214];}
  beam('plateR',att,knee,12,10);beam('plateR',knee,foot,10,9);
  kput('boxD',knee,null,[13,13,13]);
  beam('pipeR',[lerp(att[0],knee[0],.3),lerp(att[1],knee[1],.3)-6,lerp(att[2],knee[2],.3)],[lerp(knee[0],foot[0],.4),lerp(knee[1],foot[1],.4),lerp(knee[2],foot[2],.4)],2.2,2.2);
  kput('slabCR',[foot[0],foot[1]+2,foot[2]],null,[12,4,12]);}
 // the sunk side sits on a heap of what it pushed up
 if(dd){enHeap(G,150,10,100,28,10164);enDebris(120,0,170,60,PL);}
 scatterMoss(0,0,0,100,340,90+60*dd,4);trees(0,0,200,480,34+40*dd);
 figures(-230,60,6,9);
 REGISTER({name:'The Carapace: disc',x:0,y:0,z:0,r:215,h:130});
 EN_SITE.carapace={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE RETORTS
function buildRetorts(scene,gx,gz,d){reseed(10170+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),acc=[];
 // a pale sphere on eight raking legs, X-braced in two tiers, a catwalk at
 // its equator and a valve on top
 const retort=(c,R,seed)=>{const h=holeFn(.3*dd,seed,null,1);const g=enSphere(c,R,h?(u,y)=>y>R*.5&&h(u,y):null);mesh(g,MAT.white,G);
  if(dd)mesh(enSphere(c,R*.96,null,20,12),MAT.guts,G);
  const cw=mesh(new THREE.TorusGeometry(R+4,1.4,5,48),MAT.rust,G,c[0],c[1],c[2]);cw.rotation.x=Math.PI/2;
  kput('ringR',[c[0],c[1]+R*.55,c[2]],qEuler(Math.PI/2,0,0),[R*.84,R*.84,20]);
  kput('pipeR',[c[0],c[1]+R+5,c[2]],null,[5,12,5]);
  const top=[],bot=[];
  for(let k=0;k<8;k++){const a=k/8*TAU;top.push([c[0]+R*Math.cos(a),c[1],c[2]+R*Math.sin(a)]);bot.push([c[0]+1.15*R*Math.cos(a),0,c[2]+1.15*R*Math.sin(a)]);}
  for(let k=0;k<8;k++){beam('pipeR',top[k],bot[k],3.2,3.2);kput('boxCR',[bot[k][0],2,bot[k][2]],null,[10,4,10]);
   const n=(k+1)%8;for(const f of[[0,.4],[.4,.8]]){if(dd&&rng()<.3)continue;
    const L=(p,q,t)=>[lerp(p[0],q[0],t),lerp(p[1],q[1],t),lerp(p[2],q[2],t)];
    beam('tube',L(bot[k],top[k],f[0]),L(bot[n],top[n],f[1]),.9,.9);beam('tube',L(bot[n],top[n],f[0]),L(bot[k],top[k],f[1]),.9,.9);}}
  return g;};
 const gA=retort([-90,125,0],48,10171),gB=retort([70,98,-40],38,10172);
 // the third: on its frame, or in the ruin fallen, rolled 110 m south and
 // split open, with the frame left standing empty as a ring of broken legs
 const CF=[30,0,40],RC=40;let gC;
 if(dd){const h=holeFn(.85,10173,null,1.3);gC=enSphere([0,0,0],RC,(u,y)=>(u>.28&&u<.52&&y>28&&y<105)||(y<RC*2.1&&h(u,y)));
  const m=mesh(gC,MAT.white,G,40,26,150);m.rotation.set(.25,0,.3);   // the tear faces south-west
  const inner=mesh(enSphere([0,0,0],RC*.95,null,20,12),MAT.guts,G,40,26,150);inner.rotation.copy(m.rotation);
  for(let k=0;k<8;k++){const a=k/8*TAU,b=[CF[0]+1.15*RC*Math.cos(a),0,CF[2]+1.15*RC*Math.sin(a)],h2=rr(18,70);
   beam('pipeR',b,[b[0]-Math.cos(a)*h2*.1+rr(-3,3),h2,b[2]-Math.sin(a)*h2*.1+rr(-3,3)],3.2,3.2);kput('boxCR',[b[0],2,b[2]],null,[10,4,10]);}
  kput('ringR',[CF[0],3,CF[2]+2],qEuler(Math.PI/2+.1,0,.2),[RC+4,RC+4,12]);
  enHeap(G,40,150,70,10,10174);enDebris(40,110,90,50,PL);}
 else gC=retort([CF[0],86,CF[2]],RC,10173);
 // the high pipe run over all three, on a lattice rack
 kput('pipeR',[-90,174,0],null,[4,6,4]);beam('pipeR',[-90,176,0],[70,176,-40],4,4);
 beam('pipeR',[70,136,-40],[70,176,-40],4,4);beam('pipeR',[70,176,-40],[30,176,40],4,4);
 if(dd){beam('pipeR',[30,176,40],[36,128,50],4,4);beam('pipeR',[34,1.6,70],[90,1.6,120],3.6,3.6);}
 else beam('pipeR',[30,176,40],[30,126,40],4,4);
 enTruss('strutR',[-10,0,-20],[-10,178,-20],8,12,.8,.2*dd);
 // the flare stack, leaning in the ruin, with two platforms and three guys
 const ST=[170,0,60],SB=[dd?188:170,262,dd?50:60];
 mesh(enTube(ST,SB,t=>8.5-t*.014,14,20),MAT.rust,G);
 mesh(enTube([SB[0],SB[1]-4,SB[2]],[SB[0],SB[1]+2,SB[2]],()=>6,14,1),MAT.dark,G);
 for(const f of[.45,.82])kput('ringR',[lerp(ST[0],SB[0],f),lerp(ST[1],SB[1],f),lerp(ST[2],SB[2],f)],qEuler(Math.PI/2,0,0),[12,12,20]);
 for(let k=0;k<3;k++){const a=k/3*TAU+.5,top=[lerp(ST[0],SB[0],.76),200,lerp(ST[2],SB[2],.76)],an=[ST[0]+100*Math.cos(a),0,ST[2]+100*Math.sin(a)];
  if(dd&&k===1){beam('tube',an,[an[0]-60*Math.cos(a),.5,an[2]-60*Math.sin(a)],.5,.5);continue;}
  beam('tube',top,an,.5,.5);enBlk(acc,an[0],3,an[2],8,6,8);}
 if(dd){mossOnSurface([gA,gB],0,0,0,70,4);vinesFromLedge([gA,gB],0,0,0,30,24,0,0);}
 meshMerged(acc,CONC(d),G);
 scatterMoss(0,0,0,60,300,80+60*dd,4);trees(0,0,150,420,30+40*dd);
 figures(-20,120,6,9);
 REGISTER({name:'The Retorts: spheres',x:-10,y:0,z:0,r:150,h:180});
 REGISTER({name:'The Retorts: flare stack',x:178,y:0,z:56,r:24,h:270});
 if(dd)REGISTER({name:'The Retorts: fallen sphere',x:40,y:0,z:150,r:50,h:70});
 EN_SITE.retorts={x:gx,z:gz};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE NEEDLE
function buildNeedle(scene,gx,gz,d){reseed(10180+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,conc=CONC(d),acc=[],SH=dd?430:640,Y0=40;
 const rS=t=>30-t*.04;          // shaft half-diagonal at t metres above its foot
 // the drum and its terrace
 mesh(enTube([0,0,0],[0,24,0],()=>90,48,2),conc,G);
 mesh(enRing([0,24,0],[0,1,0],0,90,48),conc,G);
 mesh(enTube([0,24,0],[0,Y0,0],()=>60,40,2),conc,G);
 mesh(enRing([0,Y0,0],[0,1,0],0,60,40),conc,G);
 // eight stepped fins bracing the foot of the shaft
 for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;
  for(let j=0;j<5;j++){if(dd&&k===3&&j>1)continue;const h=96-j*19,r=rS(0)+7+j*14;
   enBlkY(acc,r*Math.cos(a),Y0+h/2,r*Math.sin(a),14,h,5,-a);}}
 // the shaft: a square prism, its corners on the axes, tapering to 5 m.
 // Snapped in the ruin, with the rods of its core sticking up out of the break.
 const shaft=enTube([0,Y0,0],[0,SH,0],rS,4,40);mesh(shaft,conc,G);
 for(const c of[[1,0],[0,1],[-1,0],[0,-1]])beam('boxD',[c[0]*rS(0),Y0,c[1]*rS(0)],[c[0]*rS(SH-Y0),SH,c[1]*rS(SH-Y0)],2.5,2.5);
 if(dd){for(let k=0;k<5;k++)beam('pipeR',[rr(-6,6),SH-2,rr(-6,6)],[rr(-14,14),SH+rr(10,34),rr(-14,14)],1.2,1.2);
  kput('boxD',[0,SH,0],qEuler(0,Math.PI/4,0),[rS(SH-Y0)*1.3,1,rS(SH-Y0)*1.3]);}
 else mesh(enTube([0,SH,0],[0,SH+40,0],()=>1.4,6,1),MAT.rust,G);
 // outrigger spars across the faces, rods hanging from their tips
 for(const h of[180,300,420,540]){if(h>SH-12)continue;const w=rS(h-Y0)+46;
  for(const s of[1,-1]){const a=s*Math.PI/4;
   if(dd&&h===420&&s>0){beam('plateR',[w*.2*Math.cos(a),h,w*.2*Math.sin(a)],[w*.8*Math.cos(a),h-50,w*.8*Math.sin(a)],3,4);continue;}
   kput('plateR',[0,h,0],qEuler(0,-a,0),[2*w,3,4]);
   enHang('tube',[[w*Math.cos(a),h,w*Math.sin(a)],[-w*Math.cos(a),h,-w*Math.sin(a)]],18,50,.6);}}
 kput('ringR',[0,250,0],qEuler(Math.PI/2,0,0),[rS(210)+10,rS(210)+10,40]);
 // four guys from 320 m to anchor blocks 400 m out; one snapped in the ruin
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4,an=[400*Math.cos(a),0,400*Math.sin(a)];enBlk(acc,an[0],6,an[2],20,12,20);
  if(dd&&k===2){beam('tube',an,[an[0]*.55,.5,an[2]*.55],.6,.6);enHang('tube',[[rS(280)*Math.cos(a),320,rS(280)*Math.sin(a)]],60,90,.6);continue;}
  beam('tube',[rS(280)*Math.cos(a),320,rS(280)*Math.sin(a)],an,.6,.6);}
 // the fallen top, in two lengths, and its crushed spars
 if(dd){mesh(enTube([118,6,-40],[250,9,-130],t=>13-t*.03,4,10),conc,G);
  mesh(enTube([262,7,-138],[334,5,-178],t=>8.6-t*.03,4,4),conc,G);
  for(let k=0;k<6;k++){const x=rr(140,320),z=rr(-190,-40);kput('plateR',[x,1.5,z],qEuler(rr(-.2,.2),rng()*TAU,rr(-.2,.2)),[rr(30,80),3,4]);}
  enDebris(200,-110,140,60,'plateR');rubbleRing(0,0,0,92,200,90,6);
  enOvergrow(acc,70,30,0,0);mossOnSurface([shaft],0,0,0,40,4);}
 meshMerged(acc,conc,G);
 scatterMoss(0,0,0,95,320,80+60*dd,4);trees(0,0,120,460,30+40*dd);
 figures(0,110,6,9);
 REGISTER({name:'The Needle: shaft',x:0,y:0,z:0,r:130,h:SH+30});
 if(dd)REGISTER({name:'The Needle: fallen top',x:226,y:0,z:-110,r:130,h:30});
 EN_SITE.needle={x:gx,z:gz,SH:SH};
 KOFF=[0,0,0];return G;}

// ---------------------------------------------------------------- THE RAM
function buildRam(scene,gx,gz,d){reseed(10190+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,PL=PLATE(d),an=6*Math.PI/180,A=[-150,62,0],AX=[Math.cos(an),-Math.sin(an),0],UPV=[Math.sin(an),Math.cos(an),0];
 const P=t=>[A[0]+AX[0]*t,A[1]+AX[1]*t,0];
 const off=(t,ph,r)=>{const p=P(t);return[p[0]+UPV[0]*Math.sin(ph)*r,p[1]+UPV[1]*Math.sin(ph)*r,Math.cos(ph)*r];};
 // the hull: a capsule 80 m across. In the ruin the tail cap is gone, the
 // tail torn open onto a dark liner, and the back holed.
 const hf=holeFn(.5*dd,10193,null,1.2);
 const t0=dd?25:0;
 const hull=enTube(P(t0),P(220),t=>{const tt=t+t0;return tt<25?40*Math.sqrt(Math.max(0,1-Math.pow((25-tt)/25,2))):40;},56,60,
  hf?(u,t)=>(t<30&&rng()<.35)||(t>40&&t<190&&u>.05&&u<.45&&hf(u,t)):null);
 mesh(hull,MAT.rust,G);
 if(dd)mesh(enTube(P(22),P(220),()=>35,28,24),MAT.guts,G);
 // the drill: a cone with three helical flutes, buried in the ridge
 const rN=t=>40*(1-(t-220)/80)+.01;
 mesh(enTube(P(220),P(300),t=>rN(t+220),40,16),MAT.rust,G);
 for(let s=0;s<3;s++){let q=null;for(let t=222;t<296;t+=2.4){const th=t*.32+s*TAU/3,r=rN(t)+1.4;
  const p=off(t,th,r);if(q)beam('plateR',q,p,2.4,4);q=p;}}
 // hoops, a dorsal spine of plated housings, and slot windows down each side
 for(let t=30;t<216;t+=18){if(dd&&rng()<.25)continue;kput('ringR',P(t),qFacing(AX),[41.5,41.5,40]);}
 for(let t=60;t<196;t+=16){const h=rr(8,20),p=off(t,Math.PI/2,40+h/2-2);kput(PL,p,qEuler(0,0,-an),[rr(12,15),h,rr(18,28)]);}
 for(let t=40;t<206;t+=14)for(const s of[-1,1])kput('cellD',[P(t)[0],P(t)[1]+6,s*40.4],qEuler(0,0,-an),[9,2,1]);
 // four track units; the rear left one has thrown its track
 for(const x of[-90,10])for(const z of[-52,52])enTrack(x,z,84,16,26,PL,dd&&x<0&&z<0?1:0);
 // THE RIDGE it drove into, and the spray of rock where the nose went in
 const RG=gridSurface((u,v)=>{const x=lerp(30,400,u),z=(v-.5)*600;
  return[x,85*Math.exp(-Math.pow((x-205)/80,2))*Math.pow(Math.max(0,1-Math.pow(z/300,2)),.6)*(.72+.55*fbm(x/40,z/40,10193,3))-.6,z];},90,70,{uS:46,vS:75});
 mesh(RG,EN_SPOIL,G);
 for(let i=0;i<90;i++){const x=rr(60,160),z=rr(-90,90),s=rr(1.5,7);
  kput('rubble',[x,s*.35,z],qEuler(rng()*3,rng()*3,rng()*3),[s*1.3,s*.8,s*1.1],new THREE.Color().setHSL(rr(.03,.07),rr(.3,.45),rr(.22,.36)));}
 // the torn tail: cables spilled out onto the ground, plates shed behind it
 if(dd){for(let k=0;k<7;k++){const p=off(26,rr(0,TAU),rr(10,34));beam('tube',p,[p[0]-rr(20,70),.6,p[2]+rr(-40,40)],.8,.8);}
  enDebris(-200,0,80,50,PL);mossOnSurface([hull],0,0,0,110,5);vinesFromLedge([hull],0,0,0,40,24,0,0);
  mossOnSurface([RG],0,0,0,60,5);}
 trees(80,0,160,460,30+40*dd);scatterMoss(0,0,0,90,300,80+50*dd,4);
 figures(-60,110,6,9);
 REGISTER({name:'The Ram: hull',x:0,y:0,z:0,r:160,h:110});
 REGISTER({name:'The Ram: the ridge',x:205,y:0,z:0,r:120,h:90});
 EN_SITE.ram={x:gx,z:gz};
 KOFF=[0,0,0];return G;}
