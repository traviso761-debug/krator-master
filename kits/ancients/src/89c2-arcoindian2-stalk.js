 // ---- the light wells ------------------------------------------------------
 WELL.forEach(W=>{const y1=wellY1(W),H=y1-W.y0;
  if(!(H>10))return;
  if(W.half)RM.push(gridSurface((u,v)=>{const th=Math.PI*.5+u*Math.PI;
    return[W.x+Math.cos(th)*W.r,W.y0+v*H,W.z+Math.sin(th)*W.r];},12,20,{uS:6,vS:18}));
  else{
   // THE BORE IS BLACK for its first 55 m. MAT.aiRoom is a mid-brown and the
   // hemisphere light does not care that it is inside 90 m of rock — it lights
   // every surface from every direction — so the first cut's lining rendered as
   // a PALE curved patch seen through the hole in the vault, i.e. three saucers
   // stuck to the ceiling, which is the exact failure Arcoindian I logged four
   // attempts against. Removing the rim did not fix it because the rim was never
   // what you were looking at. A void-black lining is.
   BORE.push(lathe({rFn:()=>W.r,H:Math.min(55,H),nu:16,nv:5}).translate(W.x,W.y0,W.z));
   if(H>55)RM.push(lathe({rFn:()=>W.r,H:H-55,nu:16,nv:12}).translate(W.x,W.y0+55,W.z));
   ROCK.push(lathe({rFn:y2=>W.r*(1.30-.10*y2/9),H:9,nu:18,nv:3}).translate(W.x,y1-2,W.z));
   RM.push(lathe({rFn:()=>W.r*1.02,H:11,nu:16,nv:2}).translate(W.x,y1-2,W.z));
   const nr=Math.max(3,Math.round(W.r/3.6));
   for(let i=0;i<nr;i++){const t=(i+.5)/nr-.5;
    if(dd&&rng()<.4)continue;
    beam(BX,[W.x+t*W.r*2,y1+6,W.z-W.r*Math.sqrt(Math.max(0,1-4*t*t))],
         [W.x+t*W.r*2,y1+6,W.z+W.r*Math.sqrt(Math.max(0,1-4*t*t))],1.6,1.6);}
   // NO RIM UNDER THE VAULT. Arcoindian I logged four attempts at one — flared
   // bell, small flare, flush lip, dark lip — and every one read as a saucer
   // stuck to the ceiling, because an unshadowed sun plus the hemisphere's warm
   // ground colour lights anything hanging under a roof. The first cut of this
   // type repeated the mistake and the renders showed the same three flying
   // saucers. There is now nothing below the roof plane at all: the shell's own
   // hole, the dark lining starting 1 m above it, and a bright disc set high in
   // the bore so the hole has something to show when you look up it.
   if(!W.gal)kput('aiPool',[W.x,W.y0+H*.84,W.z],null,[W.r*1.8,1,W.r*1.8],
     new THREE.Color(dd?0x8e887a:0xcfc8b6));}
  // the pool of daylight where the shaft lands
  const py2=W.gal?GAL[2].y0+.5:DECK+.6;
  if(!W.gal&&lG(W.x,W.z))return;              // no deck under it any more
  kput('aiPool',[W.x,py2,W.z],null,[W.r*4.4,1,W.r*4.4],
   new THREE.Color(dd?0x5f5b50:0x9c9686));
  if(!dd)for(let i=0;i<8;i++){const th=i/8*TAU;
   kput('strip',[W.x+Math.cos(th)*W.r*.96,W.y0+H*.5+rr(-H*.3,H*.3),W.z+Math.sin(th)*W.r*.96],
    qEuler(0,-th-Math.PI/2,0),[W.r*.5,1.1,1.1],CYAN.clone().multiplyScalar(.6));}});
 // registered on a FULL well, never on one of the half ones sitting on the joint
 // plane: a half well's only content is a lining inside one merged mesh, which
 // is the closest thing in this kit to a false negative on the occupancy check.
 {const W0=WELL.filter(w=>!w.half)[0];
  if(W0)REGISTER({name:'Arcoindian II — the light wells',x:W0.x,z:W0.z,
   r:W0.r+22,y:W0.y0-6,h:wellY1(W0)-W0.y0+14});}

 // ---- THE STALK: LEARNING, the water shafts and the marina -----------------
 // The lens hangs on this. It drops out of the belly, through nothing, for
 // 260 m, and three slimmer shafts carry on from its foot another 170 m to the
 // water. Nothing supports it from below; it is braced back to the cliff twice,
 // which is the only thing in the composition that touches the rock below the
 // sill.
 {const LH=STY1-STY0;
  const lrFn=y2=>STR*(1.20-.34*Math.pow(y2/LH,.8));
  SH.push(lathe({rFn:lrFn,H:LH,flutes:12,amp:.055,sharp:2,nu:44,nv:26,
   hole:holeFn(dd*.45,7143,null,1.1)}).translate(STX,STY0,STZ));
  DK.push(lathe({rFn:y2=>lrFn(y2)-4.5,H:LH-2,nu:22,nv:10}).translate(STX,STY0,STZ));
  for(let p=1;p*8.4<LH-4;p++)
   kput('slabCR',[STX,STY0+p*8.4,STZ],null,[lrFn(p*8.4)-5,.7,lrFn(p*8.4)-5],new THREE.Color(0x24262a));
  const nrw=Math.floor((LH-10)/8.4);
  for(let j=0;j<nrw;j++){const cy=STY0+6+j*8.4,rr2=lrFn(cy-STY0);
   const nc=Math.round(TAU*rr2/6.2);
   for(let i=0;i<nc;i++){const th=(i+(j%2?.3:.7))/nc*TAU;
    if(rng()>(dd?.6:.9))continue;
    kput('aiPane',[STX+Math.cos(th)*rr2*1.02,cy,STZ+Math.sin(th)*rr2*1.02],
     qFacing([Math.cos(th),0,Math.sin(th)]),[3.8,3.0,1],
     rng()<(dd?.05:.42)?litOf('lrn'):ROOMC);}
   if(!dd&&j%4===1)lring(STX,cy+4,STZ,rr2*1.03,Math.round(TAU*rr2/9));}
  // THE LANDING at shelf level. The first cut was an annulus round the shaft,
  // which floats: the shelf's front edge follows the weathered face and wanders
  // 60 m in z, so a ring of fixed radius is sometimes joined to it and sometimes
  // not. This is a rectangle that starts 26 m BEHIND the furthest-back the shelf
  // edge can be across the landing's own width, so it is always attached.
  const LDW=STR+30,LDZ0=Math.min(shelfE(STX-LDW),shelfE(STX),shelfE(STX+LDW))-26;
  const LDZ1=STZ+STR+24;
  GRD.push(gridSurface((u,v)=>[STX+(u-.5)*LDW*2,SILL+.3,lerp(LDZ0,LDZ1,v)],20,12,{uS:18,vS:12,
   hole:(u,v)=>Math.hypot((u-.5)*LDW*2,lerp(LDZ0,LDZ1,v)-STZ)<STR+1}));
  SH.push(gridSurface((u,v)=>[STX+(u-.5)*LDW*2,SILL+.3-v*8,LDZ1],20,2,{uS:18,vS:2}));
  for(const s4 of [-1,1])SH.push(gridSurface((u,v)=>
   [STX+s4*LDW,SILL+.3-v*8,lerp(LDZ0,LDZ1,u)],12,2,{uS:12,vS:2}));
  for(let i=0;i<22;i++){const t=(i+.5)/22;
   if(dd&&rng()<.3)continue;
   kput(BX,[STX-LDW+t*LDW*2,SILL+1.8,LDZ1-1],null,[LDW*2/22*.92,3,1.6],stoneC());}
  if(!dd)lring(STX,SILL+3.6,STZ,STR+16,24);
  // braces back to the cliff
  for(const by of [STY0+LH*.30,STY0+LH*.70]){
   const zb2=faceZ(STX,by)+4;
   if(zb2<STZ-STR-6){
    beam(BX,[STX-STR*.6,by,STZ],[STX-STR*.6,by+16,zb2],5,7);
    beam(BX,[STX+STR*.6,by,STZ],[STX+STR*.6,by+16,zb2],5,7);
    kput(BX,[STX,by+17,zb2-6],null,[STR*2.2,7,14],null);}}
  REGISTER({name:'Arcoindian II — the learning shaft',x:STX,z:STZ,r:STR+26,y:STY0-4,h:LH+14});
  // THE WATER SHAFTS. They end on the valley floor, which under the overhang is
  // 26 m up on the talus rather than at the water — asking flr() rather than
  // assuming WSY is the difference between three shafts standing on the ground
  // and three shafts buried 18 m in it.
  const lc=[];
  SUB.forEach((S,si)=>{const bx=STX+S[0],bz=STZ+S[1],br=9.5;
   const down=dd&&si===2;
   const y1s=down?rr(70,130):flr(bx,bz)+1;
   SH.push(lathe({rFn:y2=>br*(1.1-.16*y2/(STY0-y1s)),H:STY0-y1s,nu:18,nv:20,
    hole:holeFn(dd*(down?1.0:.4),7145+si,null,1.2)}).translate(bx,y1s,bz));
   for(let j=0;j<Math.floor((STY0-y1s)/9);j++){const cy=y1s+5+j*9;
    if(rng()>(dd?.45:.8))continue;
    kput('aiPane',[bx,cy,bz+br*1.05],qFacing([0,0,1]),[3.4,2.8,1],
     rng()<(dd?.04:.4)?litOf('lrn'):ROOMC);}
   if(!down)lc.push([bx,bz,br]);
   else for(let i=0;i<26;i++){const sc=rr(4,15);
    kput('aiBlock',[bx+rr(-70,70),sc*.4+WSY,bz+rr(-70,70)],qEuler(rng()*3,rng()*3,rng()*3),
     [sc*rr(.8,1.6),sc*rr(.5,1),sc*rr(.8,1.6)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.3),rr(.08,.18)));}
   // collars where the shafts leave the foot of LEARNING
   kput(BX,[bx,STY0+3,bz],null,[br*2.6,6,br*2.6],stoneC());});
  // THE PLAZA the shafts land on, up on the talus, and a causeway running south
  // from it down to the water.
  const PLY=flr(STX,STZ)+1.4;
  GRD.push(gridSurface((u,v)=>[STX+(u-.5)*220,PLY,STZ+(v-.5)*150],18,12,{uS:20,vS:14}));
  SH.push(gridSurface((u,v)=>[STX+(u-.5)*220,PLY-v*14,STZ+(v>.5?75:-75)],18,3,{uS:20,vS:3}));
  for(const s5 of [-1,1])SH.push(gridSurface((u,v)=>
   [STX+s5*110,PLY-v*14,STZ+(u-.5)*150],14,3,{uS:16,vS:3}));
  // THE MARINA, on the north bank of the channel. It is placed off rivC()/rivW()
  // rather than off a written z, because the channel wanders +/-96 m and a quay
  // at a fixed offset is a quay in a field half the time.
  const MX=STX,MB=rivC(MX)-rivW(MX),MQY=WSY+5.5;
  const MZ=MB-46;
  GRD.push(gridSurface((u,v)=>[MX+(u-.5)*300,MQY,MB-96+v*100],24,10,{uS:26,vS:12}));
  SH.push(gridSurface((u,v)=>[MX+(u-.5)*300,MQY-v*12,MB+4],24,3,{uS:26,vS:3}));
  // the causeway from the plaza down to the quay
  // A CONTINUOUS ramp. The first cut stepped it in four 24 m slabs over 15 m of
  // fall and came back as disconnected paving hanging in the air; the segments
  // are now 9 m, overlap by 12%, and each carries its own pier down to the
  // ground it crosses.
  {const c0=STZ+72,c1=MB-90,n5=Math.max(6,Math.round((c1-c0)/9));
   for(let i=0;i<n5;i++){const t=(i+.5)/n5,cz=lerp(c0,c1,t),cy=lerp(PLY,MQY,t);
    kput(BX,[STX,cy,cz],null,[38,3.4,(c1-c0)/n5*1.12],null);
    for(const s5 of [-1,1])kput(BX,[STX+s5*19,cy+2.4,cz],null,
     [2,2.8,(c1-c0)/n5*1.12],stoneC());
    const gy5=flr(STX,cz);
    if(cy-gy5>4&&i%2===0)kput('aiPost',[STX,gy5,cz],null,[3.2,cy-gy5,3.2],null);}}
  for(let i=0;i<7;i++){const jx=MX-132+i*44;
   if(dd&&rng()<.3)continue;
   kput(BX,[jx,MQY-1.2,MB+52],null,[7,1.8,104],new THREE.Color(dd?0x6b6459:0xb0a898));
   for(let j=0;j<6;j++){const hz=MB+16+j*16;
    if(rng()<(dd?.75:.3))continue;
    kput('a2Hull',[jx+(j%2?9:-9),WSY-1.4,hz],qEuler(0,(j%2?1:-1)*Math.PI/2,0),[7.5,5,17],
     new THREE.Color().setHSL(rr(.02,.14),rr(.1,.4),dd?rr(.12,.24):rr(.3,.55)));}}
  for(let i=0;i<8;i++){const sx2=MX-126+i*36,sh=rr(10,18);
   if(dd&&rng()<.34)continue;
   kput(BX,[sx2,MQY+sh*.5,MB-62],qEuler(0,rr(-.1,.1),0),[rr(17,30),sh,rr(15,24)],stoneC());
   if(!dd)kput('strip',[sx2,MQY+1+sh,MB-50],null,[18,1.4,1.4],CYAN);}
  // figures() plants at y = 0 and this quay is at y = 11.5, so they are placed
  // by hand rather than through the helper — the same trap Arcbeam shipped.
  for(let i=0;i<(dd?6:22);i++){const fx=MX+rr(-140,140),fz=MB-rr(6,88);
   kput('figB',[fx,MQY,fz],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[fx,MQY,fz],null,1,new THREE.Color(0xc9a17e));}
  REGISTER({name:'Arcoindian II — the marina',x:MX,z:MB-40,r:170,y:0,h:60});
  REGISTER({name:'Arcoindian II — the valley plaza',x:STX,z:STZ,r:120,y:PLY-16,h:40});
  if(lc.length)REGISTER({name:'Arcoindian II — the water shafts',x:STX,z:STZ,r:STR+50,y:PLY-4,h:STY0-PLY+10});}

 // ---- the gardens on the open shelf ----------------------------------------
 // The sheet fans them to one side; they go west of the lens, where the hollow
 // runs on for 300 m past the point the lens pinches out. In the deepest shade
 // in the model, which is where a garden under a rock roof belongs.
 // The fan is drawn against the back wall and opens toward the mouth, and every
 // bed is tested against the shelf it stands on rather than assumed onto it:
 // this end of the hollow is where the cave tapers out, so the depth between
 // the back wall and the cliff edge runs from 120 m down to nothing.
 {const GX0=XA+40,GX1=LCX-LWX+30,GAX=(GX0+GX1)*.5;
  const onShelf=(x,z)=>x>GX0&&x<GX1&&z>ZB(x)+10&&z<shelfE(x)-14;
  let ng=0;
  // the fan's focus, declared before the beds so they can be laid ON its rays:
  // the first cut turned each hedge to a random bearing (one rng() draw, still
  // taken so nothing downstream moves) and the fan read as a hedge row
  const FX=GX1+40,FZ=ZB(FX)+8;
  for(let i=0;i<(dd?230:190);i++){const px=rr(GX0,GX1),pz=rr(ZB(px)+10,shelfE(px)-14);
   if(!onShelf(px,pz))continue;
   ng++;
   if(rng()<.58)VEG.tree(px,SILL,pz,i%3,rr(6,dd?18:12));
   else{const _y=rng(),ray=Math.atan2(-(pz-FZ),px-FX);   // yaw that lays local +x along the ray
    kput('hedge',[px,SILL+.9,pz],qEuler(0,dd?_y*TAU:ray+(_y-.5)*.12,0),[rr(6,20),1.9,rr(2,5)],
    new THREE.Color().setHSL(rr(.22,.34),rr(.3,.5),dd?rr(.08,.16):rr(.13,.24)));}}
  // the walks: a fan of paths radiating from one point on the back wall
  for(let i=0;i<13;i++){const th=Math.PI*(.56+i*.072);
   GRD.push(gridSurface((u,v)=>{const r2=lerp(30,430,u);
     return[FX+Math.cos(th)*r2,SILL+.3,FZ+Math.sin(th)*r2*.22+v*4];},20,1,{uS:20,vS:1,
     hole:(u,v)=>{const r2=lerp(30,430,u);
      return !onShelf(FX+Math.cos(th)*r2,FZ+Math.sin(th)*r2*.22);}}));}
  if(ng)REGISTER({name:'Arcoindian II — the gardens',x:GAX,z:ZB(GAX)+50,r:230,y:SILL-4,h:48});}

 // ---- the rim plateau ------------------------------------------------------
 // LIGHT WELLS, PLAYGROUNDS and a WATER RESERVOIR, as the sheet labels them,
 // plus the track that links them. A bare tabletop with five manholes in it
 // reads as a car park, and the plan is one of the views.
 // THE WATER RESERVOIR. The first cut had pow(1-v) where it wanted pow(v), so
 // the basin was built inside out — a 17 m CONE rising out of the plateau with a
 // sheet of water buried in it. Nothing in --assert can see an inverted basin;
 // the plateau shot showed a bare tabletop with a bump on it.
 {const RVY=platY(RVX,RVZ);
  const rvR=(th,v)=>RVR*(1-v)*rvLob(th);
  GRD.push(gridSurface((u,v)=>{const th=u*TAU;
    return[RVX+Math.cos(th)*rvR(th,v),RVY+1.5-RVD2*Math.pow(v,.55),RVZ+Math.sin(th)*rvR(th,v)*.72];},
    52,10,{uS:40,vS:8}));
  mesh(gridSurface((u,v)=>{const th=u*TAU,r2=rvR(th,v*.92);
    return[RVX+Math.cos(th)*r2,RVY-7,RVZ+Math.sin(th)*r2*.72];},40,3,{uS:24,vS:3}),
   MAT.a2Water,G);
  // a raised rim wall all round and a battered embankment outside it, so the
  // basin reads as an impoundment and not as a puddle in a dent
  for(let i=0;i<56;i++){const th=(i+.5)/56*TAU,rw=RVR*1.03*rvLob(th);
   if(dd&&rng()<.22)continue;
   kput(BX,[RVX+Math.cos(th)*rw,RVY+3.4,RVZ+Math.sin(th)*rw*.72],qEuler(0,-th,0),
    [TAU*RVR/56*.8,7,6],stoneC());}
  SH.push(gridSurface((u,v)=>{const th=u*TAU,rw=RVR*(1.04+v*.14)*rvLob(th);
    return[RVX+Math.cos(th)*rw,RVY+1.5-v*12,RVZ+Math.sin(th)*rw*.72];},52,3,{uS:40,vS:3}));
  // the intake tower standing in it, and its causeway out to the rim
  {const IY=RVY-28.5;
   SH.push(lathe({rFn:y2=>15-3*y2/44,H:44,flutes:10,amp:.06,sharp:2,nu:24,nv:12,
    hole:holeFn(dd*.5,7161,null,1.2)}).translate(RVX+30,IY,RVZ+16));
   kput('slabC',[RVX+30,IY+45,RVZ+16],null,[18,3,18],new THREE.Color(dd?0x6d665c:0xcac4b8));
   for(let j=0;j<5;j++)if(rng()>(dd?.5:.15))
    kput('aiPane',[RVX+30,IY+10+j*7,RVZ+16+13.6],qFacing([0,0,1]),[4,3,1],
     rng()<(dd?.05:.5)?litOf('pub'):ROOMC);
   const c0=RVZ+16+14,c1=RVZ+RVR*.72+8,n6=Math.max(3,Math.round((c1-c0)/18));
   for(let i=0;i<n6;i++){const t=(i+.5)/n6;
    if(dd&&rng()<.25)continue;
    kput(BX,[RVX+30,RVY+1,lerp(c0,c1,t)],null,[11,2.4,(c1-c0)/n6*1.05],null);
    kput('aiPost',[RVX+30,RVY-26,lerp(c0,c1,t)],null,[2.2,27,2.2],null);}
   if(!dd)lring(RVX+30,IY+46.5,RVZ+16,14,14);}
  REGISTER({name:'Arcoindian II — the water reservoir',x:RVX,z:RVZ,r:RVR+16,y:RVY-34,h:56});
  [[LCX+40,-700],[LCX-460,-520]].forEach((P,pi)=>{const px=P[0],pz=P[1],py=platY(px,pz),cr=28;
   GRD.push(gridSurface((u,v)=>{const a=u*TAU,r2=cr*(1-v);
     return[px+Math.cos(a)*r2,py-4.6,pz+Math.sin(a)*r2];},24,4,{uS:12,vS:4}));
   SH.push(gridSurface((u,v)=>{const a=u*TAU;
     return[px+Math.cos(a)*cr,py-4.6*v,pz+Math.sin(a)*cr];},24,2,{uS:12,vS:2}));
   for(let i=0;i<14;i++){const a=i/14*TAU;
    if(dd&&rng()<.4)continue;
    kput(BX,[px+Math.cos(a)*(cr+2.4),py+.8,pz+Math.sin(a)*(cr+2.4)],qEuler(0,-a,0),[7,1.8,1.5],stoneC());}
   if(!dd)lring(px,py-3.8,pz,cr*.6,12);
   REGISTER({name:'Arcoindian II — playground '+(pi+1),x:px,z:pz,r:cr+8,y:py-8,h:16});});
  // the track linking the collars
  const WC=WELL.filter(w=>!w.half).sort((a,b)=>a.x-b.x);
  for(let i=1;i<WC.length;i++){const A2=WC[i-1],B2=WC[i];
   const n2=Math.max(2,Math.round(Math.hypot(B2.x-A2.x,B2.z-A2.z)/28));
   for(let j=0;j<n2;j++){const t=(j+.5)/n2;
    const tx=lerp(A2.x,B2.x,t)+rr(-5,5),tz=lerp(A2.z,B2.z,t)+rr(-5,5);
    const ang=Math.atan2(B2.z-A2.z,B2.x-A2.x);
    kput(BX,[tx,platY(tx,tz)-.6,tz],qEuler(0,-ang,0),[32,.8,14],
     new THREE.Color().setHSL(rr(.06,.10),rr(.10,.20),rr(.10,.17)));}}
  // SPOIL from the wells and the galleries, banked beside the collars, and a
  // wind-break wall along the haul track. The first plateau shot was 1 900 x
  // 1 100 m of empty tabletop with five manholes in it.
  WELL.filter(w=>!w.half).forEach(W=>{
   for(let i=0;i<26;i++){const a3=rng()*TAU,r4=W.r*rr(1.6,4.2),sc=rr(4,15);
    kput('aiBlock',[W.x+Math.cos(a3)*r4,platY(W.x,W.z)-1+sc*.36,W.z+Math.sin(a3)*r4],
     qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.8,1.7),sc*rr(.4,.9),sc*rr(.8,1.7)],
     new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.10,.22)));}
   for(let i=0;i<9;i++){const a3=(i+.5)/9*TAU,r4=W.r*2.4;
    if(dd&&rng()<.35)continue;
    kput(BX,[W.x+Math.cos(a3)*r4,platY(W.x,W.z)+2.4,W.z+Math.sin(a3)*r4],qEuler(0,-a3,0),
     [TAU*r4/9*.8,5,2.2],stoneC());}
   kput(BX,[W.x+W.r*3.0,platY(W.x,W.z)+6,W.z],null,[18,12,26],stoneC());});
  for(let i=0;i<(dd?150:110);i++){const px=rr(XW+420,XS-20),pz=rr(-1140,-160);
   const py=platY(px,pz);
   if(py<40||inWell(px,pz,28))continue;
   if(Math.hypot(px-RVX,(pz-RVZ)/.7)<RVR+16)continue;
   kput('hedge',[px,py+.5,pz],qEuler(0,rng()*TAU,0),[rr(2,5),rr(.8,1.5),rr(1.4,3)],
    new THREE.Color().setHSL(rr(.14,.26),rr(.18,.34),dd?rr(.06,.12):rr(.07,.14)));}}

 // ---- the gorge, the water and the far wall ---------------------------------
 {ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS+980,u),z=lerp(-200,GFZ,v);
    return[x,flr(x,z),z];},104,40,{uS:(XS+980-XW)/16,vS:36}));
  mesh(gridSurface((u,v)=>[lerp(XW+40,XS+940,u),WSY,lerp(-130,GFZ-170,v)],28,16,{uS:30,vS:18}),
   MAT.a2Water,G);
  // the far wall of the canyon
  ROCK.push(gridSurface((u,v)=>{const x=lerp(XW,XS+980,u),y=v*760;
    return[x,y,GFZ+52+40*Math.pow(clamp(1-y/200,0,1),1.6)
      -0.14*y-24*fbm(x*.0085,y*.010,7148,4)-11*fbm(x*.028,y*.02,7149,3)];},
    88,30,{uS:(XS+980-XW)/40,vS:760/40}));
  for(let i=0;i<120;i++){const x=rr(XW+60,XS+940),t=Math.pow(rng(),1.8);
   const sc=rr(5,24)*(1-t*.4);
   kput('aiBlock',[x,flr(x,GFZ-60-t*180)+sc*.35,GFZ-60-t*180],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.12,.3),rr(.12,.26)));}
  // parks on the banks: what the shafts drop down to
  for(let i=0;i<(dd?120:100);i++){const x=rr(STX-330,STX+330),z=rr(GFZ-330,GFZ-120);
   VEG.tree(x,flr(x,z),z,i%3,rr(7,dd?18:13));}
  for(let i=0;i<70;i++){const x=rr(STX-300,STX+300),z=rr(-140,-40);
   VEG.tree(x,flr(x,z),z,i%3,rr(6,dd?16:11));}}

 // ---- TRANSPORTATION: the bridge out of the mouth ---------------------------
 {const BZ0=shelfE(LCX-210)-6,BZ1=GFZ+30,BX2=LCX-210,BY=SILL+2;
  // PIERS. The first cut made them r=16 tapering to 10 over 342 m of height,
  // which is a 1:17 slenderness — from the gorge they came back as pencils
  // holding up a ribbon. They are now 34 m across at the foot on a splayed
  // base, paired in the transverse direction with a cross-head, which is what
  // a 924 m viaduct on 340 m legs actually needs.
  const npi=3;
  for(let i=0;i<npi;i++){const t=(i+1)/(npi+1),pz=lerp(BZ0,BZ1,t);
   const gy=flr(BX2,pz),ph=BY-gy;
   if(dd&&i===2)continue;
   for(const s6 of [-1,1]){
    SH.push(gridSurface((u,v)=>{const a=u*TAU;
      const r2=(17-5*Math.pow(v,.7))*(1+.10*Math.cos(a*4))+13*Math.pow(clamp(1-v/.14,0,1),1.7);
      return[BX2+s6*15+Math.cos(a)*r2,gy+v*ph,pz+Math.sin(a)*r2];},22,26,{uS:14,vS:24,
      hole:holeFn(dd*.4,7151+i,null,1.2)}));}
   for(let b=1;b<5;b++)beam(BX,[BX2-15,gy+ph*b/5,pz],[BX2+15,gy+ph*b/5,pz],6,7,stoneC());
   kput(BX,[BX2,BY-4.5,pz],null,[74,7,34],null);}
  // DECK. A 34 x 3 m slab is a ribbon at this span; it now has a 7 m edge beam
  // each side and a rib under every bay, so it reads as a structure in profile.
  const nd=Math.round((BZ1-BZ0)/26),dw=(BZ1-BZ0)/nd*1.04;
  for(let i=0;i<nd;i++){const t=(i+.5)/nd,pz=lerp(BZ0,BZ1,t);
   if(dd&&t>.62&&t<.86)continue;
   kput(BX,[BX2,BY,pz],null,[36,3,dw]);
   for(const s2 of [-1,1]){kput(BX,[BX2+s2*17.5,BY-2.6,pz],null,[4,7,dw],null);
    kput(BX,[BX2+s2*18,BY+3.2,pz],null,[2,3.2,dw],stoneC());}
   if(i%2===0)kput(BX,[BX2,BY-5.6,pz],null,[32,4,3.4],null);
   if(!dd&&i%4===1)kput('strip',[BX2,BY+4.2,pz],qFacing([0,0,1]),[22,1.4,1.4],CYAN);
   }
  // the span that came down, lying on the gorge floor under the gap
  if(dd)for(let i=0;i<22;i++){const pz=lerp(BZ0,BZ1,rr(.60,.88)),sc=rr(6,20);
   kput(BX,[BX2+rr(-50,50),flr(BX2,pz)+sc*.4,pz+rr(-40,40)],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),
    [sc*rr(1,2.8),sc*.6,sc*rr(1,2.2)],null);}
  // the portal where it enters the far wall
  kput('aiPortal',[BX2,BY,BZ1-6],qFacing([0,0,-1]),[5,4.6,1],null);
  kput(BX,[BX2,BY+26,BZ1+4],null,[86,54,22],null);
  REGISTER({name:'Arcoindian II — transportation, the bridge',x:BX2,z:(BZ0+BZ1)*.5,r:180,y:0,h:SILL+20});}

 // ---- the ruin -------------------------------------------------------------
 if(SCAR.o){const I=SCAR.o;
  REGISTER({name:'Arcoindian II — the roof fall',x:I.x,z:I.z,r:I.r+40,y:SILL-10,h:CROWN-SILL+60});
  const dkC=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.05,.13));
  const restY=(bx,bz)=>{const t=lth(bx,bz);return t>4?LYC+t:SILL;};
  for(let i=0;i<120;i++){const t=Math.pow(rng(),1.5),a=rng()*TAU;
   const r=I.r*(.16+t*1.35),sc=rr(4,17)*(1-t*.42);
   const bx=I.x+Math.cos(a)*r,bz=I.z+Math.sin(a)*r;
   if(bx>XS)continue;
   kput('aiBlock',[bx,restY(bx,bz)+sc*.42+(1-t)*(1-t)*14,bz],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.7,1.6),sc*rr(.4,.8),sc*rr(.7,1.6)],dkC());}
  for(let i=0;i<20;i++){const t=Math.pow(rng(),1.3),a=rng()*TAU;
   const r=I.r*(.1+t*1.2),bx=I.x+Math.cos(a)*r,bz=I.z+Math.sin(a)*r;
   if(bx>XS)continue;
   const L2=rr(18,44)*(1-t*.4);
   kput(BX,[bx,restY(bx,bz)+rr(2,12)*(1-t),bz],
    qEuler(rr(-.9,.9),rng()*TAU,rr(-.9,.9)),[L2,rr(4,11),L2*rr(.5,1.1)],dkC());}
  for(let i=0;i<80;i++){const t=Math.pow(rng(),1.6),sc=rr(4,20)*(1-t*.5);
   kput('aiBlock',[I.x+rr(-220,180),sc*.4+(1-t)*14+WSY,rr(-60,180)],
    qEuler(rng()*3,rng()*3,rng()*3),[sc*rr(.7,1.5),sc*rr(.5,1),sc*rr(.7,1.5)],
    new THREE.Color().setHSL(rr(.05,.10),rr(.14,.32),rr(.06,.15)));}}

 // ---- the fallen flank ------------------------------------------------------
 if(dd){
  // THE FRACTURE. The lens is closed along the break by a face that is open
  // BETWEEN its plates and solid where the plates cross it, so the storeys
  // show in the tear the way the joint plane shows them at the other end; a
  // dark face 14 m in stops the eye running the length of the lens.
  const fa=lz0(LFX)-24,fb=lz1(LFX)+24;
  LNS.push(gridSurface((u,v)=>{const z=lerp(fa,fb,u),x=lfx(z),t=lth(x,z);
    return[x,LYC+(v*2-1)*t,z];},96,26,{uS:22,vS:6,
    hole:(u,v)=>{const z=lerp(fa,fb,u),x=lfx(z),t=lth(x,z);if(t<1.5)return true;
     const y=LYC+(v*2-1)*t;
     for(let k=0;k<=NBD;k++){const py=k===NBD?DECK:bandY(k);if(Math.abs(y-py)<2.4)return false;}
     return fbm(u*9,v*4,7173,3)<.64;}}));
  DK.push(gridSurface((u,v)=>{const z=lerp(fa,fb,u),x=lfx(z)+14,t=lth(x,z)*.93;
    return[x,LYC+(v*2-1)*t,z];},64,8,{uS:12,vS:4,
    hole:(u,v)=>{const z=lerp(fa,fb,u);return lth(lfx(z)+14,z)<3;}}));
  // WHAT CAME DOWN. Pieces of the flank's own shell -- curved plates cut from
  // the same top and belly functions, so they read as bits of THAT lens -- on
  // the shelf under where it hung, and two that went over the sill lying on
  // the talus 340 m below. Then the smaller wreckage round them.
  const LCOL=()=>new THREE.Color(dd?0x7a7162:0xb9af9b).multiplyScalar(rr(.62,.9));
  const piece=(x0,x1,top,k,px,pz,gy)=>{
   const g=gridSurface((u,v)=>{const x=lerp(x0,x1,u),a=lz0(x),b=lz1(x);
     const zs=.12+.12*(k%4),z=lerp(a+(b-a)*zs,a+(b-a)*(zs+.38),v);return[x,(top?1:-1)*lth(x,z),z];},
    14,14,{uS:6,vS:6,hole:(u,v)=>fbm(u*5+k*3.1,v*5,7174+k,2)<.22+.5*Math.pow(Math.abs(u-.5)*2,3)});
   g.center();
   const F=new THREE.Group();F.position.set(px,0,pz);
   F.rotation.set(rr(-.5,.5)+(top?0:Math.PI),rng()*TAU,rr(.35,1.15)*(rng()<.5?-1:1));G.add(F);
   mesh(g,top?lensM:underM,F);dropFragment(F,gy,rr(2,6));};
  const SX0=LCX-LWX+6;
  for(let k=0;k<5;k++){const x0=lerp(SX0,LFX-30,k/5),x1=x0+rr(48,74);
   const px=lerp(-236,-120,(k+.5)/5)+rr(-12,12),pz=lerp(ZB(px)+40,shelfE(px)-30,rr(.15,.85));
   piece(x0,x1,k%2===0,k,px,pz,SILL);}
  for(let k=0;k<2;k++){const x0=lerp(SX0,LFX-40,k/2),x1=x0+rr(56,80);
   const px=-200+k*70+rr(-20,20),pz=rr(-150,-60);
   piece(x0,x1,k===1,k+5,px,pz,flr(px,pz));}
  for(let i=0;i<70;i++){const t=Math.pow(rng(),1.3),px=rr(-250,-96),pz=lerp(ZB(px)+20,shelfE(px)-6,rng());
   const L2=rr(8,30)*(1-t*.4);
   kput(BX,[px,SILL+L2*.2,pz],qEuler(rr(-.8,.8),rng()*TAU,rr(-.8,.8)),[L2,L2*rr(.15,.4),L2*rr(.5,1)],LCOL());}
  for(let i=0;i<60;i++){const px=rr(-270,-80),pz=rr(-190,40),sc=rr(4,18);
   kput(i%3?'aiBlock':BX,[px,flr(px,pz)+sc*.3,pz],qEuler(rng()*3,rng()*3,rng()*3),
    [sc*rr(.8,1.8),sc*rr(.3,.7),sc*rr(.8,1.6)],LCOL());}
  REGISTER({name:'Arcoindian II — the fallen flank',x:-170,z:-140,r:150,y:0,h:SILL+60});}

 // ---- merge and dress ------------------------------------------------------
 meshMerged(ROCK,MAT.aiRock,G);meshMerged(TOP,MAT.aiTop,G);
 meshMerged(SHADE,MAT.aiShade,G);
 meshMerged(CUT,MAT.aiCut,G);
 meshMerged(RM,MAT.aiRoom,G);
 meshMerged(LNS,lensM,G);
 meshMerged(UND,underM,G);
 meshMerged(SH,wallM,G);
 meshMerged(GRD,deckM,G);
 if(DK.length)meshMerged(DK,MAT.aiVoid,G);
 meshMerged(BORE,MAT.aiBore,G);
 if(dd){
  // stainsFromLedge() aims each streak radially about the BUILDER's origin,
  // which is nowhere near this city's centre, and this plan is not circular
  // anyway — so the streaks are aimed off the lens's own axis instead.
  const a2Stain=(geos,n,lMax)=>{for(const f of ledgePoints(geos,n,.4)){
    const a=Math.atan2(f.p[2]+200,f.p[0]-LCX),L=rr(5,lMax);
    kput('stain',[f.p[0]+Math.cos(a)*.7,f.p[1]-L*.5,f.p[2]+Math.sin(a)*.7],
     qFacing([Math.cos(a),0,Math.sin(a)]),[rr(1.4,4.2),L,1],null);}};
  mossOnSurface(GRD,0,0,0,130,3.6);mossOnSurface(SH,0,0,0,80,3.2);
  mossOnSurface(ROCK,0,0,0,110,4.2);mossOnSurface(TOP,0,0,0,60,4.2);
  vinesFromLedge(GRD,0,0,0,120,26);a2Stain(SH,130,22);
  for(let i=0;i<140;i++){const x=rr(LCX-LWX+20,XS-6),z=lz1(x)-rr(6,26);
   if(lth(x,z)<6||lG(x,z))continue;
   kput('vine',[x,LYC+lth(x,z)-1.2,z],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
    [rr(.9,2),rr(8,38),rr(.9,2)],null);}
  for(let i=0;i<50;i++){const x=rr(LCX-LWX+40,XS-10),z=rr(lz0(x)+30,lz1(x)-30);
   if(lth(x,z)<LTH*.5||lG(x,z))continue;
   VEG.tree(x,DECK,z,i%3,rr(6,17));}}

 // ---- the covered surface, measured ----------------------------------------
 // The sheet says 8.6 ha. Integrating the plan on a 4 m lattice rather than
 // trusting the radii is the only way to know whether the taper, the lobing and
 // the master joint actually landed on the figure.
 let ALENS=0,AGARD=0;
 for(let ax=LCX-LWX-8;ax<XS;ax+=4)for(let az=-420;az<40;az+=4){
  if(az>lz0(ax)&&az<lz1(ax))ALENS+=16;}
 for(let ax=XA+40;ax<LCX-LWX+30;ax+=4)for(let az=-340;az<40;az+=4){
  if(az>ZB(ax)+10&&az<shelfE(ax)-14)AGARD+=16;}
 // The quay and the shaft landing are reported separately rather than folded in:
 // 3.9 ha of dock at the bottom of a 430 m drop is not what a sheet means by the
 // surface an arcology covers, and adding it would have flattered the figure by
 // half again.
 const AQUAY=(STR+30)*2*(STR+54)+260*150;
 const AREA=ALENS+AGARD;

 // ---- what the presets are derived from ------------------------------------
 A2_SITE[d]={x:gx,z:gz,d:d,dd:dd,XW:XW,XS:XS,XA:XA,CT0:CT0,SILL:SILL,CROWN:CROWN,
  WSY:WSY,GFZ:GFZ,LCX:LCX,LWX:LWX,DZ:DZ,LTH:LTH,LYC:LYC,DECK:DECK,NBD:NBD,
  NX0:NX0,NX1:NX1,NY:NY,STX:STX,STZ:STZ,STR:STR,STY0:STY0,STY1:STY1,
  ST:{x:A2ST.x,z:A2ST.z,w:A2ST.w,y0:A2ST.y0,y1:A2ST.y1},
  MB:rivC(STX)-rivW(STX),MQY:WSY+5.5,PLY:flr(STX,STZ)+1.4,
  area:AREA,aLens:ALENS,aGard:AGARD,aQuay:AQUAY,lip0:lipY(LCX),zb0:ZB(LCX),
  WELL:WELL.map(w=>({x:w.x,z:w.z,r:w.r,y0:w.y0,y1:wellY1(w),half:!!w.half,gal:!!w.gal})),
  GAL:GAL.map(g=>({y0:g.y0,y1:g.y1,z0:g.z0,z1:g.z1,n:g.n})),
  IMP:SCAR.o?{x:SCAR.o.x,z:SCAR.o.z,r:SCAR.o.r}:null,
  faceZ:(x,y)=>faceZ(x,y),shelfE:x=>shelfE(x),roofY:(x,z)=>roofY(x,z),
  lipY:x=>lipY(x),ZB:x=>ZB(x),lz0:x=>lz0(x),lz1:x=>lz1(x),lth:(x,z)=>lth(x,z),
  bandY:k=>bandY(k),nzB:x=>nzB(x),platY:(x,z)=>platY(x,z)};
 KOFF=[0,0,0];return G;}
