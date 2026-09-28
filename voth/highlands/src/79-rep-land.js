// ================================================================= HIGHLANDS / REPUBLICAN — the land (package R-C)
// What feeds and supplies the Iron Republic: the log granary on its staddle stones, the Saxon courtyard farmstead
// with its roofed gate, a field plot of strips, the animal pens, the post mill and the water mill, the mine with
// its headframe and stamp shed, the stepped quarry with its derrick. Grey weathered or fresh pine timber, rubble
// footings, shingle and red tile, white lace bargeboards and a painted crest on the better gables. No electric
// light anywhere out here. Helpers and kit items prefixed hnRC / hRC; heaps, wheels, rails and tubs come from
// 78-rep-grand.js. Seeds 21500–21799.

// ---------------------------------------------------------------- kit items: natural rock (hRCLeaf / hRCHedgeB foliage live in 78)
// natural rock (quarry faces, rock banks, boulders): the kit's rock map with its joints and bedding planes, 8 m tile
MAT.rcRock=hStd({map:TEX.rock,roughness:1});vWorldUV(MAT.rcRock,.125);kdef('hRCRockB',VBOX,MAT.rcRock);kdef('hRCBoulder',new THREE.IcosahedronGeometry(1,1),MAT.rcRock);

// ---------------------------------------------------------------- farm furniture
// Post-and-rail fence from a to b (local [x,z]); split rails, posts every ~2.4 m.
function hnRCRailFence(a,b,c,h){h=h||1.2;const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);const n=Math.max(1,Math.round(L/2.4));
 for(let i=0;i<=n;i++)vPst('vPost',a[0]+dx*i/n,0,a[1]+dz*i/n,.08,h+.1,c);for(const yy of[h*.45,h*.9])vBeam([a[0],yy,a[1]],[b[0],yy,b[1]],.08,c);}
// A farm cart: bed, sides, two spoked wheels, shafts on the ground; load 'sacks' | 'hay' | 'stone' | 'logs'.
function hnRCCart(x,z,ry,c,load){const P=(u,v)=>loc(x,z,u,v,ry);let p=P(0,0);vB('vWood',p[0],.85,p[1],1.5,.14,2.8,ry,c);for(const s of[-1,1]){const q=P(s*.72,0);vB('vWood',q[0],.99,q[1],.08,.4,2.8,ry,c);}
 for(const s of[-1,1]){const q=P(s*.9,-.2);hnRCWheel(q[0],.6,q[1],.6,.1,ry,c,8,0,hC(0x3a3632));}
 for(const s of[-1,1]){const a=P(s*.4,1.4),b=P(s*.35,3.6);vBeam([a[0],.85,a[1]],[b[0],.08,b[1]],.1,c);}
 p=P(0,0);if(load==='sacks')for(let i=0;i<5;i++)kput('vSack',[p[0]+rr(-.4,.4),1.2+(i>2?.35:0),p[1]+rr(-.9,.9)],qEuler(0,rng()*TAU,0),[.4,.3,.36],hC(vPick([0xb8a080,0xa89070,0xc8b898])));
 else if(load==='hay')kput('vThatchB',[p[0],1.5,p[1]],qEuler(0,ry,0),[1.8,1.2,2.6],hC(vPick(VPAL.thatch)));
 else if(load==='stone')vB('vPlaster',p[0],.92,p[1],1.0,.7,1.4,ry,hC(0xd8d0bc));
 else if(load==='logs')for(let i=0;i<5;i++){const q=P(-.45+(i%3)*.45,0);kput('hLogX',[q[0],1.1+Math.floor(i/3)*.3,q[1]],qEuler(0,ry+Math.PI/2,0),[3.2,.15,.15],hC(vPick(HPAL.pine)));}}
// Livestock from boxes and balls, heading toward +z of ry: 'cow' | 'ox' | 'sheep' | 'pig' | 'hen'.
function hnRCBeast(x,z,ry,kind){const P=(u,v)=>loc(x,z,u,v,ry);let p;
 if(kind==='cow'||kind==='ox'){const c=hC(vPick(kind==='ox'?[0x6a4a32,0x5a3e2a,0x8a6a4a]:[0x7a5238,0xe8e0d4,0x4a3a30,0x9a6a44,0xd8c8b0]));
  vB('hPaint',x,.72,z,.72,.78,1.85,ry,c);p=P(0,1.12);vB('hPaint',p[0],.95,p[1],.42,.46,.62,ry,c.clone().multiplyScalar(.85));
  p=P(0,1.45);vB('hPaint',p[0],.98,p[1],.3,.26,.14,ry,hC(0x3a2a24));
  for(const s of[-1,1]){const h=P(s*.26,1.02);kput('vConeI',[h[0],1.42,h[1]],vQ(ry,0,-s*1.1),[.05,.24,.05],hC(0xe8e0cc));}
  for(const sx of[-1,1])for(const sz of[-1,1]){const l=P(sx*.24,sz*.7);vPst('vPost',l[0],0,l[1],.075,.74,c.clone().multiplyScalar(.8));}
  p=P(0,-.95);kput('hPaint',[p[0],1.0,p[1]],vQ(ry,.25,0),[.06,.7,.06],c);return;}
 if(kind==='sheep'){const c=hC(vPick([0xeae4d6,0xdcd4c2,0xeae4d6,0x4a4038]));kput('hPaintBall',[x,.72,z],qEuler(0,ry,0),[.36,.32,.52],c);p=P(0,.52);vB('hPaint',p[0],.66,p[1],.2,.26,.3,ry,hC(0x2e2a26));
  for(const sx of[-1,1])for(const sz of[-1,1]){const l=P(sx*.15,sz*.28);vPst('vPost',l[0],0,l[1],.04,.5,hC(0x2e2a26));}return;}
 if(kind==='pig'){const c=hC(vPick([0xe0a898,0xd89888,0xc88a7a]));vB('hPaint',x,.28,z,.48,.46,1.0,ry,c);p=P(0,.56);vB('hPaint',p[0],.36,p[1],.22,.18,.14,ry,c.clone().multiplyScalar(.85));
  for(const sx of[-1,1])for(const sz of[-1,1]){const l=P(sx*.15,sz*.34);vPst('vPost',l[0],0,l[1],.05,.3,c);}return;}
 if(kind==='hen'){kput('hPaintBall',[x,.22,z],null,[.13,.12,.16],hC(vPick([0xf0ece0,0xa05a30,0x5a4030])));p=P(0,.12);vBall('hPaintBall',p[0],.36,p[1],.06,hC(HPAL.red));}}
// Water trough: a hollowed log on two blocks.
function hnRCTrough(x,z,ry,L,c){vB('vWood',x,.18,z,L,.42,.62,ry,c);vB('hRCWater',x,.5,z,L-.2,.12,.42,ry,hC(0x4a6874));for(const s of[-1,1]){const p=loc(x,z,s*(L/2-.3),0,ry);vB('vStone',p[0],0,p[1],.3,.2,.8,ry,hC(vPick(HPAL.rubble)));}}
// A fruit tree: trunk and a rounded low-poly crown.
function hnRCTree(x,z,h){vPst('vPostB',x,0,z,.16,h*.5,hC(0x5a4632));for(let k=0;k<5;k++)kput('hRCLeaf',[x+rr(-.8,.8),h*.62+rr(-.3,.6),z+rr(-.8,.8)],qEuler(rng(),rng(),0),[rr(1,1.5),rr(.9,1.2),rr(1,1.5)],hC(vPick([0x4a7a34,0x5a8a3a,0x3f6a2e])));}
// Haystack: a thatched cone over a rounded base on a centre pole.
function hnRCHaystack(x,z,r,h){const c=hC(vPick(VPAL.thatch));kput('hPaintBall',[x,h*.3,z],null,[r,h*.36,r],c);kput('vConeT',[x,h*.3,z],null,[r*1.02,h*.72,r*1.02],c);vPst('vPost',x,h*.9,z,.05,.8,hC(0x5a4632));}
// Russian crane-well (zhuravl): a stone well, a forked post and a long counterweighted sweep with a bucket.
function hnRCSweepWell(x,z,ry,c){vPst('vPostS',x,0,z,.8,.8,hC(vPick(HPAL.rubble)));vB('vDarkB',x,.8,z,1.0,.03,1.0,0);const p=loc(x,z,2.4,0,ry);vPst('vPostB',p[0],0,p[1],.16,3.6,c);
 const a=loc(x,z,-.2,0,ry),b=loc(x,z,6.2,0,ry);vBeam([a[0],5.6,a[1]],[b[0],1.6,b[1]],.1,c);vB('vStone',b[0],1.2,b[1],.5,.5,.5,ry,hC(vPick(HPAL.rubble)));
 vBeam([a[0],5.6,a[1]],[x,1.4,z],.03,c,'vRope');vPst('vBarrel',x,1.0,z,.2,.4,c);}

// ================================================================= FARMS AND MILLS
// ---------------------------------------------------------------- granary: a log crib raised on staddle stones
function buildHlRepGranary(G,o){reseed(21501+(o.v|0));const W=7,D=10,F=1.25,H=3.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1)),rub=hC(vPick(HPAL.rubble)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.white,HPAL.white,HPAL.red])),aged=hC(vPick(HPAL.aged));
 vnReg('Granary',0,0,7,F+H+5.6);
 // staddles: tapered stone shafts under flat caps, so the rats cannot climb
 for(const x of[-2.8,0,2.8])for(const z of[-4.2,-1.4,1.4,4.2]){vPst('vPostS',x,0,z,.24,.72,rub);vPst('vPostS',x,.72,z,.52,.16,rub.clone().multiplyScalar(1.1));}
 for(const x of[-2.8,0,2.8])kput('hLogX',[x,.99,0],qEuler(0,Math.PI/2,0),[D+.4,.13,.13],log);vB('vWood',0,1.05,0,W+.2,.2,D+.2,0,log);
 hnLogBox(0,F,0,W,H,D,0,log);
 const pitch=1.25,top=hnGable(0,F+H,0,D,W,pitch,Math.PI/2,'vShingleB',sh,.7,'hGableLog',log);hnBarge(0,F+H,0,D,W,pitch*W/2,Math.PI/2,.7,trim,'lace');
 // front gable: the door, the loft door and hoist beam with a sack on the rope, the painted crest
 vnDoor(0,F,D/2,0,1.1,2.0,'vWood',log,aged,false);vnWin(0,F+H+.5,D/2+.02,0,1.0,1.2,'shut','vWood',aged);
 vB('vWood',0,F+H+2.2,D/2+.3,.2,.2,1.8,0,log);vBeam([0,F+H+2.1,D/2+1.1],[0,F+H+.6,D/2+1.1],.03,hC(0xb8a888),'vRope');kput('vSack',[0,F+H+.4,D/2+1.1],null,[.36,.4,.3],hC(0xc8b898));
 hnForm('hFormT',0,F+2.3,D/2+.02,0,1.6,.8);
 // detached steps (a gap before the door) and a loose plank to bridge it
 hnRCFlight(0,0,D/2+3.0,0,1.4,F-.05,'vStone',rub);vB('vWood',0,F-.02,D/2+.35,1.2,.08,.9,0,aged);
 // threshing floor, sacks, a cart
 vPst('vPostS',-6.5,0,4,2.8,.05,hC(0xa08a6a));vnSacks(-6.5,.05,4,5);vnSacks(2.2,0,D/2+1.6,4);hnRCCart(6,2,-.4,aged,'sacks');
 for(let k=0;k<5;k++)hnRCBeast(rr(-3,3),D/2+rr(2.5,4),rng()*TAU,'hen');vnFolk(-3.5,D/2+4.5,2,1);}

// ---------------------------------------------------------------- farmhouse: the Saxon courtyard farmstead
// A closed yard behind the street line: the house with its gable to the street, the tall roofed gateway beside it
// and the yard wall; the barn across the back, stables and byre down the side, a crane-well, the dung heap.
function buildHlRepFarmhouse(G,o){reseed(21511+(o.v|0));const ZS=15;
 const wall=hC(vPick(HPAL.saxon)),rub=hC(vPick(HPAL.rubble)),ash=hC(vPick(HPAL.ashlar)),tile=hC(vPick(HPAL.roofRed)),sh=hC(vPick(HPAL.shingle)),log=hC(vPick(HPAL.pine)),aged=hC(vPick(HPAL.aged)),red=hC(vPick(HPAL.redwood)),trim=hC(vPick([HPAL.white,HPAL.teal,HPAL.blue]));
 vnReg('Farmstead — house',-11,8,7,11);vnReg('Farmstead — barn',0,-11,14,11);vnReg('Farmstead — yard',3,3,9,6);
 // ---- the house: fieldstone socle, painted render, a steep tiled gable to the street
 {const HX=-11,HZ=ZS-7,W=8,D=14,S=.6,H=3.2;hnSocle(HX,0,HZ,W,S,D,0,rub,ash);hnStucco(HX,S,HZ,W,H,D,0,wall,false);
  const top=hnGable(HX,S+H,HZ,D,W,1.5,Math.PI/2,'hGableSc',tile,.5,'vGablePl',wall);hnBarge(HX,S+H,HZ,D,W,6,Math.PI/2,.5,hC(HPAL.white),'lace');
  for(const s of[-1,1])hnNal(HX+s*1.7,S+1.0,HZ+D/2,0,.85,1.15,'glass',trim,{shutters:true});
  vnWin(HX,S+H+.6,HZ+D/2+.02,0,.7,.8,'shut','vWood',red);hnForm('hFormT',HX,S+H+2.0,HZ+D/2+.02,0,2.2,1.1);
  vB('hPaint',HX,S+H-.5,HZ+D/2+.03,W-.6,.3,.04,0,trim);
  // the yard side: door under a small arcade (the Saxon Laube), windows
  const yx=HX+W/2;for(const z of[-4.4,-1.2,4.4])vnWin(yx,S+1.0,HZ+z,Math.PI/2,.8,1.1,'glass','hPaint',trim,true);
  vnDoor(yx,S,HZ+1.6,Math.PI/2,1.0,2.0,'vWood',red,red,false);vB('vStone',yx+.9,0,HZ+1.6,1.8,S,2.6,0,ash);
  for(const z of[-.2,3.4])vPst('vPostS',yx+1.6,S,HZ+z,.18,2.6,wall);vnShedRoof(yx+1.0,S+2.6,HZ+1.6,4.2,2.2,.6,-Math.PI/2,'hScaleB',tile,.2);
  hnStoneChimney(HX-.5,top-2.2,HZ-2.5,2.6,.7);}
 // ---- the roofed gateway and the yard wall along the street
 {const gx=-2,GW=4.2;for(const s of[-1,1]){vB('hRubB',gx+s*(GW/2+.4),0,ZS,.8,3.4,.8,0,rub);}
  for(const s of[-1,1])vB('vWood',gx+s*GW/4,0,ZS+.1,GW/2-.06,3.0,.12,0,red);for(const yy of[.6,2.2])vB('vWood',gx,yy,ZS+.18,GW-.2,.16,.06,0,red);
  hnForm('hFormA',gx,3.0,ZS+.46,0,1.6,.5);vB('vWood',gx,3.4,ZS,GW+2,.24,1.4,0,red);vnGableRoof(gx,3.64,ZS,GW+2,1.4,.9,0,'hScaleB',tile,.35,'vGableW',red);
  // the wicket door and the yard wall with a tile coping
  vB('vPlaster',3.6,0,ZS,5.6,2.6,.5,0,wall);vB('vWood',3.0,0,ZS+.26,.9,1.9,.06,0,red);vB('hScaleB',3.6,2.6,ZS,5.8,.22,.8,0,tile);
  vB('vPlaster',11.2,0,ZS,9.6,2.6,.5,0,wall);vB('hScaleB',11.2,2.6,ZS,9.8,.22,.8,0,tile);
  vB('vPlaster',16,0,1,.5,2.6,28,0,wall);vB('hScaleB',16,2.6,1,.8,.22,28.2,0,tile);vB('vPlaster',-15.4,0,-2,.5,2.6,6,0,wall);}
 // ---- the barn across the back
 {const BZ=-11,BW=30,BD=10,H=4.6;hnSocle(0,0,BZ,BW,.5,BD,0,rub,ash);hnLogBox(0,.5,BZ,BW,H,BD,0,aged,.3);
  hnGable(0,.5+H,BZ,BW,BD,1.1,0,'vShingleB',sh,.7,'hGableLog',aged);hnBarge(0,.5+H,BZ,BW,BD,5.5,0,.7,aged,'lace');
  for(const s of[-1,1])kput('vWood',[s*2.4,2.3,BZ+BD/2+1.2],qEuler(0,-s*1.1,0),[2.3,3.6,.12],aged);vB('vDarkB',0,.5,BZ+BD/2+.02,4.6,3.6,.06,0);vB('vWood',0,4.15,BZ+BD/2+.06,5.2,.24,.14,0,aged);
  vnWin(-9,2.0,BZ+BD/2,0,.9,.9,'shut','vWood',aged);vnWin(9,2.0,BZ+BD/2,0,.9,.9,'shut','vWood',aged);
  kput('vThatchB',[0,1.8,BZ+BD/2+2.1],qEuler(0,.1,0),[3,1.3,1.8],hC(vPick(VPAL.thatch)));}
 // ---- stables and byre down the east side, half-timber over stone, shed roof to the yard
 {const SX=13,SZ=1,SW=5.5,SL=20;hnSocle(SX,0,SZ,SW,.5,SL,0,rub,ash);vB('hRubB',SX,.5,SZ,SW,1.4,SL,0,rub);hnFachBox(SX,1.9,SZ,SW,2.2,SL,0,hC(vPick(HPAL.stucco)),red,'shut');
  vnShedRoof(SX,4.1,SZ,SL+.4,SW,1.4,-Math.PI/2,'hScaleB',tile,.5);
  for(const z of[-6,0,6])vnDoor(SX-SW/2,.5,SZ+z,-Math.PI/2,1.3,2.0,'vWood',red,red,false);}
 // ---- the yard: crane-well, dung heap, woodpile, cart, plum tree, hens, a cow at the byre door
 hnRCSweepWell(1,4,.3,aged);hnRCHeap(8,0,-3,1.8,1.1,hC(0x4a3a2a),3);hnWoodpile(-14.8,0,-3,Math.PI/2,4,1.6);hnRCCart(3,8,1.9,aged,'hay');hnRCTree(-3,-2,5);
 hnRCBeast(9.2,5,-Math.PI/2,'cow');for(let k=0;k<6;k++)hnRCBeast(rr(-4,6),rr(-3,10),rng()*TAU,'hen');vnFolk(2,10,2,2);vnFolk(-6,ZS+2.5,1,1);}

// ---------------------------------------------------------------- farm: a field plot of strips
// About 60 x 40 m: wheat (the near end cut and stooked into haystacks), cabbage and beet rows with a scarecrow,
// a ploughed strip with the ox still at the plough; a pole hay barn, a hedge behind, split-rail fence in front.
function buildHlRepFarm(G,o){reseed(21521+(o.v|0));const FW=60,FD=40;
 const soil=hC(0x6a4e36),aged=hC(vPick(HPAL.aged)),th=hC(vPick(VPAL.thatch));
 vnReg('Farm field',0,0,32,4);vnReg('Farm — hay barn',24,-14,5,8);
 // ---- wheat strip: standing rows at the back, stubble and haystacks at the front
 {const x0=-30,x1=-10;vB('hPaint',(x0+x1)/2,0,0,x1-x0,.05,FD,0,soil);
  for(let x=x0+.5;x<x1;x+=.8){vB('vThatchB',x,.05,-6,.5,rr(.95,1.1),FD/2+8,0,th.clone().multiplyScalar(rr(.9,1.1)));vB('vThatchB',x,.05,12.5,.5,.12,FD/2-5,0,th.clone().multiplyScalar(.8));}
  for(const [x,z] of [[-26,11],[-20,14],[-14,10.5],[-23,17.4],[-16,17.6]])hnRCHaystack(x,z,1.5,3.2);}
 // ---- cabbage and beet rows, a scarecrow
 {const x0=-10,x1=10;vB('hPaint',0,0,0,x1-x0,.05,FD,0,soil.clone().multiplyScalar(.9));let r=0;
  for(let x=x0+.6;x<x1;x+=1.1,r++){const beet=r%4>=2;vB('hPaint',x,.05,0,.34,.14,FD-1,0,soil.clone().multiplyScalar(1.15));
   for(let z=-FD/2+1.2;z<FD/2-1;z+=beet?1.4:1.9){if(beet)kput('hRCLeaf',[x+rr(-.05,.05),.26,z],qEuler(0,rng()*TAU,0),[.2,.18,.2],hC(vPick([0x4a7a3a,0x6a3040])));
    else kput('hRCLeaf',[x+rr(-.05,.05),.3,z],qEuler(rng(),rng()*TAU,0),[.34,.26,.34],hC(vPick([0x8aa870,0x7a9a64,0x9ab87e])));}}
  vPst('vPost',2,0,-3,.06,2.2,aged);vB('vWood',2,1.6,-3,1.6,.08,.08,0,aged);kput('vCloth',[2,1.2,-2.95],null,[.9,.9,1],hC(HPAL.red));vBall('hPaintBall',2,2.25,-3,.18,hC(0xd8c8a0));kput('vConeT',[2,2.35,-3],null,[.36,.3,.36],th);}
 // ---- ploughed strip: furrow ridges, the plough and its ox in mid-furrow
 {const x0=10,x1=30;vB('hPaint',(x0+x1)/2,0,0,x1-x0,.05,FD,0,soil.clone().multiplyScalar(.8));
  for(let x=x0+.35;x<x1;x+=.7){const z0=x>18.8?-8.5:-FD/2+.5,z1=x<19?FD/2-.5:(x<19.7?6.6:z0);if(z1>z0)vB('hPaint',x,.05,(z0+z1)/2,.36,.16,z1-z0,0,soil.clone().multiplyScalar(rr(.95,1.1)));
   else vB('vThatchB',x,.05,(z0+FD/2-.5)/2,.3,.1,FD/2-.5-z0,0,th.clone().multiplyScalar(.75));}
  hnRCBeast(19.3,9.5,0,'ox');const pz=7.4;vBeam([19.3,.8,pz+.9],[19.3,.3,pz-.6],.1,aged);vB('vIron',19.3,0,pz-.9,.3,.3,.9,0,hC(0x3a3632));for(const s of[-1,1])vBeam([19.3,.3,pz-.6],[19.3+s*.5,1.0,pz-2.0],.06,aged);vnFolk(19.3,pz-2.6,1,.1);}
 // ---- the pole hay barn in the corner
 {const bx=24,bz=-14.5,W=9,D=7;for(const sx of[-1,1])for(const sz of[-1,0,1])vPst('vPostB',bx+sx*W/2,0,bz+sz*D/2,.16,4.2,aged);
  for(const s of[-1,1])vB('vWood',bx,4.0,bz+s*D/2,W+.4,.24,.24,0,aged);hnGable(bx,4.2,bz,W,D,1.1,0,'vShingleB',hC(vPick(HPAL.shingle)),.6,'vGableW',aged);
  vB('vThatchB',bx,0,bz,W-.8,3.2,D-.8,0,th.clone().multiplyScalar(.95));kput('vThatchB',[bx+1,3.35,bz],qEuler(0,.1,.05),[W-2,.5,D-2],th);hnRCCart(bx-8,bz+2,1.2,aged,'hay');}
 // ---- the hedge behind, a split-rail fence in front and down the sides, a gate
 {vB('hRCHedgeB',0,0,-FD/2-1.2,FW+2,1.6,1.4,0,hC(0x4a6a34));for(let x=-FW/2;x<=FW/2;x+=2.2)kput('hRCLeaf',[x+rr(-.4,.4),1.6,-FD/2-1.2+rr(-.2,.2)],qEuler(rng(),rng(),0),[rr(1,1.4),rr(.6,.8),rr(.8,1)],hC(vPick([0x4a7a34,0x3f6a2e,0x5a8a3a])));
  hnRCRailFence([-FW/2-1,FD/2+1],[-3,FD/2+1],aged);hnRCRailFence([3,FD/2+1],[FW/2+1,FD/2+1],aged);for(const s of[-1,1])hnRCRailFence([s*(FW/2+1),FD/2+1],[s*(FW/2+1),-FD/2-.4],aged);
  for(const s of[-1,1])vPst('vPostB',s*3,0,FD/2+1,.14,1.6,aged);kput('vWood',[-2.25,.8,FD/2+2.3],qEuler(0,-1.047,0),[3,.8,.08],aged);vB('vWood',1.5,.4,FD/2+1,3,.8,.08,0,aged);}
 vnFolk(-18,4,3,4);}

// ---------------------------------------------------------------- animal pens
function buildHlRepPens(G,o){reseed(21531+(o.v|0));
 const aged=hC(vPick(HPAL.aged)),rub=hC(vPick(HPAL.rubble)),sh=hC(vPick(HPAL.shingle)),mud=hC(0x5a4632);
 vnReg('Animal pens',0,0,16,5);
 vB('hPaint',0,0,0,33,.03,23,0,hC(0x6a5a40));
 // paddock fences: the cattle paddock (west), sheepfold and pigsty yard (east)
 const F=(a,b)=>hnRCRailFence(a,b,aged,1.3);
 F([-16,11],[-5.2,11]);F([-2.8,11],[-1,11]);F([-16,11],[-16,-11]);F([-16,-11],[-1,-11]);F([-1,-11],[-1,11]);
 F([-1,3],[6.5,3]);F([9.5,3],[16,3]);F([16,3],[16,-11]);F([-1,-11],[16,-11]);F([7.5,3],[7.5,-11]);
 for(const s of[-1,1])vPst('vPostB',-4+s*1.2,0,11,.14,1.6,aged);kput('vWood',[-3.18,.8,12.03],qEuler(0,-1.92,0),[2.2,.9,.08],aged);
 // the cattle shelter: open-fronted shed on posts, board back wall, a hay rack
 {const sx=-8.5,sz=-8.4;for(let k=0;k<=4;k++)vPst('vPostB',sx-6.5+k*3.25,0,sz+2.2,.15,2.6,aged);vB('vWood',sx,0,sz-2.2,13,3.4,.14,0,aged);for(const s of[-1,1])vB('vWood',sx+s*6.5,0,sz,.14,3.0,4.4,0,aged);
  vnShedRoof(sx,2.6,sz,13.4,4.8,1.1,0,'vShingleB',sh,.4);vB('vWood',sx,1.0,sz-1.7,8,.12,.12,0,aged);for(let k=0;k<9;k++)vB('vWood',sx-4+k,1.0,sz-1.9,.05,.9,.05,0,aged);
  kput('vThatchB',[sx,1.5,sz-1.8],null,[7.8,.8,.5],hC(vPick(VPAL.thatch)));}
 // the pigsty: a low rubble hut with a shed roof, a mud wallow
 {const px=12,pz=-8.5;vB('hRubB',px,0,pz,6.5,1.7,3.6,0,rub);vB('vDarkB',px-1.5,0,pz+1.82,.9,1.0,.04,0);vnShedRoof(px,1.7,pz,6.9,3.8,.6,0,'vShingleB',sh,.3);
  vB('hPaint',11.5,0,-2.8,6,.06,4.6,0,mud);}
 // troughs, a water butt, feed sacks
 hnRCTrough(-7,1,0,3,aged);hnRCTrough(3,-4,Math.PI/2,2.4,aged);hnRCTrough(11,-5,0,2.4,aged);vnWaterButt(-2.2,0,-9.5,.45,1);vnSacks(-12,0,9,3);
 // the beasts
 for(const [x,z,a] of [[-12,2,.4],[-8,5,2.6],[-5,-1,-1.2],[-11,-3,1.9],[-6.5,7.5,.1]])hnRCBeast(x,z,a,'cow');
 for(let k=0;k<7;k++)hnRCBeast(rr(.5,6.5),rr(-9.5,1.5),rng()*TAU,'sheep');for(let k=0;k<4;k++)hnRCBeast(rr(9,15),rr(-5,1.5),rng()*TAU,'pig');
 for(let k=0;k<6;k++)hnRCBeast(rr(-1,16),rr(5,10),rng()*TAU,'hen');vnFolk(-3,13,2,1.5);}

// ---------------------------------------------------------------- windmill: a timber post mill
// The whole body (the buck) turns on one great post on crossed trestles over brick piers; four lattice sails, two
// clothed; the tail pole and ladder behind are how the miller winds it into the wind.
function buildHlRepWindmill(G,o){reseed(21541+(o.v|0));const BW=4.4,BD=5.6,BY=5.6,BH=5.4;
 const wood=hC(vPick(HPAL.pine)).multiplyScalar(.9),aged=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)),brick=hC(vPick([0x9a5a44,0x8a4e3a])),trim=hC(HPAL.white),cloth=hC(0xe8e0cc);
 vnReg('Post mill',0,0,6,BY+BH+11);
 // trestle: brick piers, crosstrees, quarterbars, the main post
 for(const [x,z] of [[-3,0],[3,0],[0,-3],[0,3]])vB('vStone',x,0,z,1.0,.9,1.0,0,brick);
 vB('vWood',0,.9,0,6.8,.36,.4,0,aged);vB('vWood',0,1.26,0,.4,.36,6.8,0,aged);
 for(const [x,z] of [[-3,0],[3,0],[0,-3],[0,3]])vBeam([x*.9,1.4,z*.9],[x*.12,4.3,z*.12],.24,aged);
 vPst('vPostB',0,.9,0,.42,BY-.9,aged);vB('vWood',0,BY-.4,0,1.2,.4,BD-.6,0,aged);
 // the buck: board body, shingle gable, lace barge at the back, the painted crest board
 vB('vWood',0,BY,0,BW,BH,BD,0,wood);for(const s of[-1,1])for(const u of[-BW/2,BW/2])vB('vWood',u,BY,s*(BD/2),.18,BH,.18,0,wood.clone().multiplyScalar(.8));
 const pitch=1.15;hnGable(0,BY+BH,0,BD,BW,pitch,Math.PI/2,'vShingleB',sh,.4,'vGableW',wood);hnBarge(0,BY+BH,0,BD,BW,pitch*BW/2,Math.PI/2,.4,trim,'lace');
 for(const s of[-1,1])vnWin(s*BW/2,BY+2.2,.6,s*Math.PI/2,.6,.7,'shut','vWood',aged);hnForm('hFormT',0,BY+BH+.6,-BD/2-.02,Math.PI,1.8,.9);
 vnDoor(0,BY,-BD/2,Math.PI,.9,1.8,'vWood',aged,aged,false);vB('vWood',0,BY-.12,-BD/2-.7,1.8,.12,1.4,0,aged);
 // ladder and tail pole down to the ground behind, with its cart wheel
 {const a=[0,BY-.1,-BD/2-1.3],b=[0,0,-BD/2-6.8];for(const s of[-1,1])vBeam([a[0]+s*.5,a[1],a[2]],[b[0]+s*.5,b[1],b[2]],.12,aged);
  for(let k=1;k<16;k++){const t=k/16;vB('vWood',0,lerp(a[1],b[1],t)-.03,lerp(a[2],b[2],t),1.0,.06,.3,0,aged);}
  vBeam([0,BY+.2,-BD/2+.2],[0,.6,-BD/2-9],.26,aged);hnRCWheel(0,.6,-BD/2-9,.6,.14,0,aged,8,0,hC(0x3a3632));}
 // the sails: windshaft out of the front gable, four lattice sails (two clothed), stocks braced
 {const hy=BY+BH-.8,hz=BD/2+1.0,R=9.6,SW=1.9,rot=.32;vBeam([0,hy-.3,0],[0,hy,hz],.32,aged);vB('vIron',0,hy-.4,hz,.8,.8,.5,0,hC(0x2e2a26));
  for(let k=0;k<4;k++){const th=rot+k*Math.PI/2,dx=Math.cos(th),dy=Math.sin(th),px=-dy,py=dx;const Q=qEuler(0,0,th);
   kput('vWood',[dx*R/2,hy+dy*R/2,hz+.1],Q,[R,.2,.2],aged);
   for(const off of[.3,SW]){kput('vWood',[dx*(R+1.8)/2+px*off,hy+dy*(R+1.8)/2+py*off,hz+.18],Q,[R-1.8,.07,.07],aged);}
   for(let r=1.8;r<=R+.01;r+=.8)kput('vWood',[dx*r+px*(SW+.3)/2,hy+dy*r+py*(SW+.3)/2,hz+.18],Q,[.06,SW-.2,.06],aged);
   if(k%2===0)kput('vTarp',[dx*(R+1.8)/2+px*(SW+.3)/2,hy+dy*(R+1.8)/2+py*(SW+.3)/2,hz+.24],Q,[R-1.9,SW-.25,1],cloth);}}
 hnRCCart(5,5,-.6,aged,'sacks');vnSacks(-3,0,-6,4);vnFolk(3,-7,2,2);}

// ---------------------------------------------------------------- watermill: a log mill on its race
function buildHlRepWatermill(G,o){reseed(21551+(o.v|0));const W=8,D=11,S=1.2,H=3.6,RX=8.2,RW=3.2;
 const log=hC(vPick(HPAL.pine)),aged=hC(vPick(HPAL.aged)),rub=hC(vPick(HPAL.rubble)),sh=hC(vPick(HPAL.shingle)),trim=hC(vPick([HPAL.white,HPAL.white,HPAL.teal])),water=hC(0x4a6874);
 vnReg('Water mill',0,0,7,S+H+6);vnReg('Water mill — race',RX,0,3,5);
 // the race: stone-lined channel, water, a sluice upstream, the tail water spilling out downstream
 for(const s of[-1,1])vB('hRubB',RX+s*(RW/2+.35),0,0,.7,1.1,22,0,rub);vB('hRCWater',RX,0,0,RW,.36,22,0,water);
 for(const s of[-1,1])vPst('vPost',RX+s*(RW/2+.3),1.1,-8,.13,2.4,aged);vB('vWood',RX,3.3,-8,RW+1,.26,.26,0,aged);vB('vWood',RX,.5,-8,RW-.1,1.4,.1,0,aged);vBeam([RX,1.9,-8],[RX,3.9,-8],.06,aged);
 for(let k=0;k<12;k++)vBall('vBallW',RX+rr(-1.2,1.2),.36,rr(-1.2,3.5),rr(.12,.3),hC(0xe8eef0),.04);
 vB('hRCWater',RX,0,12.4,RW+1.6,.2,3,0,water);
 // the mill house: rubble socle (the wheel pit side), log walls, steep shingle gable to the front
 hnSocle(0,0,0,W,S,D,0,rub,hC(vPick(HPAL.ashlar)));hnLogBox(0,S,0,W,H,D,0,log);
 const top=hnGable(0,S+H,0,D,W,1.2,Math.PI/2,'vShingleB',sh,.7,'hGableLog',log);hnBarge(0,S+H,0,D,W,1.2*W/2,Math.PI/2,.7,trim,'lace');
 vnDoor(-1.2,S,D/2,0,1.2,2.1,'vWood',log,aged,false);hnRCFlight(-1.2,0,D/2+2.0,0,1.6,S,'vStone',rub);hnNal(1.9,S+1.0,D/2,0,.8,1.0,'shut',trim);
 vnWin(0,S+H+.6,D/2+.02,0,.8,.9,'shut','vWood',aged);hnForm('hFormT',0,S+H+2.2,D/2+.02,0,2.0,1.0);
 for(const z of[-3,2.5])hnNal(-W/2,S+1.0,z,-Math.PI/2,.8,1.0,'glass',trim);
 hnStoneChimney(-1.6,top-2.6,-2.8,2.6,.6);
 // the undershot wheel, its axle into the house, a lean-to over the gear pit
 hnRCWheel(RX,2.6,0,2.9,1.3,0,aged,8,16);vBeam([RX-1,2.6,0],[W/2-.1,2.6,0],.28,hC(0x2e2a26),'vIron');
 vnShedRoof(W/2+1,S+H-.5,0,5.6,2,.6,Math.PI/2,'vShingleB',sh,.25);for(const z of[-2.6,2.6])vPst('vPost',W/2+1.7,0,z,.1,S+H-.2,aged);
 // footbridge across the race, millstones, sacks, a cart
 vB('vWood',RX,1.1,-5.4,RW+1.6,.14,1.3,0,aged);for(const s of[-1,1])hnDeckRail([RX-RW/2-.8,1.24,-5.4+s*.6],[RX+RW/2+.8,1.24,-5.4+s*.6],1.24,aged,.9);
 for(let k=0;k<2;k++)kput('vPostS',[-W/2-.5,.75,4-k*.4],qEuler(0,0,Math.PI/2+.12),[.75,.24,.75],hC(0xb0aaa0));
 vnSacks(-3,0,D/2+2,5);hnRCCart(-5.5,-1,.5,aged,'sacks');vnFolk(-4.5,D/2+4,2,1);}

// ================================================================= MINES AND QUARRIES
// ---------------------------------------------------------------- the mine
// An adit timbered into a rock bank, rails out to a tipping trestle over the spoil heap, a timber headframe with
// its sheave over the shaft and a winding house, a stamp-mill shed crushing ore.
function buildHlRepMine(G,o){reseed(21561+(o.v|0));
 const aged=hC(vPick(HPAL.aged)),tar=hC(vPick(HPAL.tar)),rub=hC(vPick(HPAL.rubble)),sh=hC(vPick(HPAL.shingle)),iron=hC(0x2e2a26),spoil=hC(0x6a625a),ore=hC(0x7a5a48);
 vnReg('Mine',0,-4,20,16);vnReg('Mine — headframe',11,-4,4,16);
 // the rock bank (showcase: a settlement uses the terrain) and its mass behind
 const rockC=hC(0xd8d0c4);for(const [x0,x1,h,fz] of [[-23,-7.6,8,-10.4],[-7.6,8.4,9.5,-10],[8.4,23,7.4,-11]])vB('hRCRockB',(x0+x1)/2,0,(fz-22)/2,x1-x0,h,22+fz,0,rockC.clone().multiplyScalar(rr(.92,1.04)));
 for(let i=0;i<10;i++)kput('hRCBoulder',[-22+i*4.8+rr(-1,1),7+rr(0,1.8),-15+rr(-2.5,1.5)],qEuler(rr(-.3,.3),rng()*TAU,rr(-.3,.3)),[rr(4.5,7),rr(2.2,3.4),rr(4,6)],rockC.clone().multiplyScalar(rr(.85,1.05)));
 for(const s of[-1,1])kput('hRCBoulder',[s*23.5,3,-11.5],qEuler(rng(),rng(),0),[3.5,4.5,4],rockC);
 // the adit: dark gallery into the rock, rubble wing walls, a timber portal with a crest board and a little roof
 {const ax=-8,az=-7;vB('vDarkB',ax,0,az-4,2.6,2.9,8,0);for(const s of[-1,1])vB('hRubB',ax+s*2.4,0,az-3,1.8,3.8,6,0,rub);vB('hRubB',ax,3.3,az-3.6,6.6,1.6,5,0,rub);
  for(const s of[-1,1])vPst('vPostB',ax+s*1.3,0,az,.2,3.1,tar);vB('vWood',ax,3.0,az,3.4,.34,.4,0,tar);vB('vWood',ax,3.34,az+.05,4.2,1.2,.14,0,aged);
  hnForm('hFormT',ax,3.4,az+.12,0,2.2,1.05);vnGableRoof(ax,4.6,az-.3,4.6,1.4,.6,0,'vShingleB',sh,.25);
  }
 // rails out of the adit to a trestle over the spoil heap; tubs
 hnRCRails([-8,-7],[-8,6]);{for(let k=0;k<6;k++){const z=6+k*1.4,y=k*.5+.4;for(const s of[-1,1])vPst('vPost',-8+s*.7,0,z,.1,y,aged);vB('vWood',-8,y,z,1.8,.14,1.5,0,aged);for(const s of[-1,1])vB('vIron',-8+s*.5,y+.14,z,.08,.1,1.5,0,iron);}}
 hnRCHeap(-10,0,15.5,7,4.2,spoil,10);hnRCTub(-8,-2,0,ore);hnRCTub(-8,3,0,ore);
 // the shaft: collar, headframe of four raked legs with girts and braces, sheave wheel, winding house
 {const hx=11,hz=-4,H=13;vB('vWood',hx,0,hz,3.6,.5,3.6,0,tar);vB('vDarkB',hx,.5,hz,2.4,.02,2.4,0);
  const leg=(sx,sz,t)=>[hx+sx*lerp(2.2,1.0,t),H*t,hz+sz*lerp(2.2,1.0,t)];
  for(const sx of[-1,1])for(const sz of[-1,1])vBeam(leg(sx,sz,0),leg(sx,sz,1),.28,aged);
  for(const t of[.25,.5,.75,1]){for(const s of[-1,1]){vBeam(leg(-1,s,t),leg(1,s,t),.18,aged);vBeam(leg(s,-1,t),leg(s,1,t),.18,aged);}}
  for(let i=0;i<3;i++){const t0=i*.25+.25,t1=t0+.25;if(t1>1)break;for(const s of[-1,1]){vBeam(leg(-1,s,t0),leg(1,s,t1),.12,aged);vBeam(leg(s,-1,t0),leg(s,1,t1),.12,aged);}}
  vB('vWood',hx,H,hz,2.6,.2,2.6,0,aged);hnRCWheel(hx,H+1.5,hz,1.4,.3,0,aged,8,0,iron);
  for(const s of[-1,1])vBeam([hx+s*.8,H,hz+1.0],[hx+s*1.6,0,hz+8.4],.24,aged);vBeam([hx,H+2.9,hz],[hx,1.6,hz+9.5],.04,iron,'vRope');vBeam([hx,H+1.5,hz-1.4],[hx,.5,hz-1.0],.04,iron,'vRope');
  const wx=hx,wz=hz+12;hnLogBox(wx,0,wz,6,3,5,0,aged,.25);vnShedRoof(wx,3,wz,6.6,5.4,1,Math.PI,'vShingleB',sh,.4);vnChimney(wx+1.8,3.6,wz+1.2,3,.2,true);
  vnDoor(wx+3,0,wz,Math.PI/2,1,1.9,'vWood',aged,tar,false);vnPatch(wx,0,wz+2.5,0,5.6,2.8,2);}
 // the stamp-mill shed: a lean-to open to the yard, five stamps on a cam shaft over the mortar
 {const sx=1,sz=6,W=8,D=4.4;vB('vWood',sx,0,sz-D/2,W,4.6,.14,0,aged);for(const s of[-1,1])vB('vWood',sx+s*W/2,0,sz,.14,4.2,D,0,aged);
  for(const s of[-1,1])vPst('vPostB',sx+s*(W/2-.1),0,sz+D/2,.14,3.6,aged);vnShedRoof(sx,3.6,sz,W+.4,D+.2,1.1,0,'vShingleB',sh,.35);
  vB('vWood',sx,0,sz-.4,W-1.6,1.0,1.2,0,tar);vB('vWood',sx,2.8,sz-.4,W-1,.2,.2,0,aged);kput('vPipe',[sx,3.05,sz-.8],qEuler(0,0,Math.PI/2),[.12,W-1.2,.12],iron);
  for(let k=0;k<5;k++){const x=sx-2.4+k*1.2,lift=(k%2)*.3;vB('vIron',x,1.0+lift,sz-.4,.14,2.0,.14,0,iron);vB('vIron',x,1.0+lift,sz-.4,.36,.34,.36,0,iron);vB('vIron',x,2.4+lift,sz-.4,.3,.14,.24,0,iron);}
  vB('vWood',sx,1.8,sz-1.6,W-1.4,1.8,.9,0,aged);hnRCHeap(sx+2,1.8+1.8,sz-1.6,.6,.3,ore,0);hnRCHeap(sx-2,0,sz+1.6,1.2,.6,hC(0x9a928a),2);}
 hnWoodpile(16,0,6,0,4,1.4);for(let k=0;k<5;k++)kput('hLogX',[3+k*.1,.2+(k%2)*.25,13+k*.3],qEuler(0,.2,0),[3.4,.14,.14],aged);
 vnBarrel(-4,0,-4,.35,.9);vnCrate(-3,0,-5,.9,.2);vnFolk(-5,0,3,2);vnFolk(8,6,2,2);}

// ---------------------------------------------------------------- the quarry
// A stepped cut face of pale stone, drill lines on every bench, cut blocks on the floor and the benches, a timber
// derrick crane with its guys and a block on the hook, the quarrymen's shed.
function buildHlRepQuarry(G,o){reseed(21571+(o.v|0));
 const stone=hC(vPick([0xc8c2b4,0xbfb8a6,0xd0c8b4])),rock=hC(vPick([0xfff2e0,0xf4ecdc])),aged=hC(vPick(HPAL.aged)),sh=hC(vPick(HPAL.shingle)),iron=hC(0x2e2a26),rub=hC(vPick(HPAL.rubble));
 vnReg('Quarry',0,-6,20,15);vnReg('Quarry — derrick',8,4,6,13);
 // the benches: each a block of the pale stone; darker drill lines down each face; turf on top
 const B=[[-17,-10,40,14],[-10,-5,34,9.5],[-5,-1.6,26,5]];   // [z0,z1,width,height]
 for(const [z0,z1,w,h] of B){vB('hRCRockB',0,0,(z0+z1)/2,w,h,z1-z0,0,rock.clone().multiplyScalar(rr(.94,1.04)));
  for(let x=-w/2+.6;x<w/2;x+=1.3)vB('hRCRockB',x,h*.3,z1+.02,.07,h*.68,.04,0,rock.clone().multiplyScalar(.55));
  }
 vB('hTurfB',0,14,-13.5,40.4,.35,7.4,0,hC(vPick(HPAL.turf)));
 for(const s of[-1,1]){vB('hRCRockB',s*21.5,0,-8,3,12,18,0,rock.clone().multiplyScalar(.8));for(let k=0;k<3;k++)kput('hRCBoulder',[s*rr(20.5,23),rr(10,12.5),rr(-15,-3)],qEuler(rng(),rng(),rng()),[rr(2.6,4),rr(2,3),rr(3,4.5)],rock.clone().multiplyScalar(.75));}
 // half-cut blocks on the benches, a ladder and a plank ramp up the face
 for(const [z0,z1,w,h] of B){for(let k=0;k<3;k++){const x=rr(-w/2+3,w/2-3);vB('vPlaster',x,h,z1-rr(1,2),rr(1.4,2.2),rr(.7,1),rr(.9,1.4),rr(-.1,.1),stone);}}
 vnLadder(-8,0,-1.2,0,5.2,aged);vnLadder(4,5,-4.6,0,4.8,aged);kput('vWood',[10,2.5,.4],qEuler(Math.atan2(5,5.8),0,0),[1.4,.12,7.7],aged);
 // the floor: gravel, stacked cut blocks, rubble heaps, a stone sledge
 vB('hRCRockB',0,0,8,44,.03,18,0,rock.clone().multiplyScalar(.72));
 for(let i=0;i<3;i++)for(let j=0;j<3-i;j++)for(let k=0;k<2;k++)vB('vPlaster',-12+j*1.7+i*.85,i*.82,5+k*1.1,1.6,.8,1.0,0,stone.clone().multiplyScalar(rr(.95,1.05)));
 hnRCHeap(-16,0,10,3.2,1.8,stone.clone().multiplyScalar(.9),8);hnRCHeap(16,0,11,2.4,1.3,stone.clone().multiplyScalar(.85),6);
 vB('vWood',-3,0,11,1.4,.3,2.6,.3,aged);vB('vPlaster',-3,.3,11,1.1,.7,1.5,.3,stone);hnRCCart(3,13,-.3,aged,'stone');
 // the derrick: mast on a stone foot, a boom, guys to stakes, topping lift, hoist rope and a block on the hook, winch
 {const dx=8,dz=4,MH=12;vB('vStone',dx,0,dz,1.6,.5,1.6,0,rub);vPst('vPostB',dx,.5,dz,.3,MH,aged);
  for(const [gx,gz] of [[-9,-4],[9,-3],[-7,9],[8,9]]){vBeam([dx,MH+.4,dz],[dx+gx,.2,dz+gz],.04,hC(0x6a5a48),'vRope');vPst('vPost',dx+gx,0,dz+gz,.1,.6,aged);}
  const be=[dx-7.2,8.2,dz+3.2];vBeam([dx,1.2,dz],be,.26,aged);vBeam([dx,MH+.2,dz],be,.05,iron,'vRope');vBeam(be,[be[0],3.6,be[2]],.04,iron,'vRope');
  vB('vIron',be[0],3.3,be[2],.3,.34,.3,0,iron);for(const s of[-1,1])vBeam([be[0],3.3,be[2]],[be[0]+s*.6,2.4,be[2]],.03,iron,'vRope');vB('vPlaster',be[0],1.4,be[2],1.8,1.0,1.1,.2,stone);
  vB('vWood',dx+1.4,0,dz+1.2,1.6,1.0,1.0,0,aged);kput('vPipe',[dx+1.4,1.1,dz+1.2],qEuler(0,0,Math.PI/2),[.3,1.2,.3],iron);for(const s of[-1,1])vB('vIron',dx+1.4+s*.75,.9,dz+1.7,.06,.5,.06,0,iron);}
 // the quarrymen's shed
 {const qx=-15,qz=13,W=6,D=4;vB('vWood',qx,0,qz,W,2.6,D,0,aged);vnShedRoof(qx,2.6,qz,W+.4,D+.2,.8,0,'vShingleB',sh,.45);vnDoor(qx+1.2,0,qz+D/2,0,.9,1.9,'vWood',aged,aged,false);
  vnWin(qx-1.4,1.1,qz+D/2,0,.7,.7,'shut','vWood',aged);vB('vWood',qx+4.2,0,qz+1,.5,.45,1.8,0,aged);vPst('vPostS',qx+4.2,.7,qz-.6,.5,.14,hC(0xb0a898));}
 vnFolk(-4,6,3,3);vnFolk(6,9,2,2);}

const HTAG_RC_FARM=(wealth,more)=>({type:['farm'].concat(more||[]),wealth,lit:false});
HL.def({key:'hl_rep_granary',name:'Granary',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('middle'),w:18,d:18,h:11,build:buildHlRepGranary});
HL.def({key:'hl_rep_farmhouse',name:'Farmstead',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('middle',['single-family dwelling']),w:34,d:34,h:13,build:buildHlRepFarmhouse});
HL.def({key:'hl_rep_farm',name:'Farm field',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('poor'),w:64,d:46,h:8,build:buildHlRepFarm});
HL.def({key:'hl_rep_pens',name:'Animal pens',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('poor'),w:34,d:26,h:5,build:buildHlRepPens});
HL.def({key:'hl_rep_windmill',name:'Post mill',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('middle',['industry']),w:22,d:22,h:22,build:buildHlRepWindmill});
HL.def({key:'hl_rep_watermill',name:'Water mill',branch:'republican',family:'Farms and mills',tags:HTAG_RC_FARM('middle',['industry']),w:24,d:26,h:13,build:buildHlRepWatermill});
HL.def({key:'hl_rep_mine',name:'Mine',branch:'republican',family:'Mines and quarries',tags:{type:['industry'],wealth:'poor',lit:false},w:46,d:40,h:18,build:buildHlRepMine});
HL.def({key:'hl_rep_quarry',name:'Quarry',branch:'republican',family:'Mines and quarries',tags:{type:['industry'],wealth:'poor',lit:false},w:46,d:36,h:16,build:buildHlRepQuarry});
