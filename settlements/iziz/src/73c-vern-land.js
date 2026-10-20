// ================================================================= 73c. FARM, STOCK AND WATER: the farm belt's and the landings' trades
// The trades round (2026-10-16), after Voth's census trades: farmhands (voth_farmhouse), dairymen, swineherds and duck
// keepers, shipwrights and boatbuilders (voth_bldg_shipwright), fishers (Voth's fishing docks). Iziz proper is landlocked
// behind its moat, with jungle rivers beyond it, and its farm belt lies inside the wall (LORE.md 6.2): so the yard builds
// river boats and moat lighters, and the landing is a moat or river stage. The water sides (the boatyard's slip, the
// landing stage) face the plot's front (+z), where a city puts the water. None is lit (poor and middle: no electric light).
// Seeds 8501-8599. Helpers are vld*.

// ---------------------------------------------------------------- yard pieces
// still water: a dark glassy sheet (a pond, a trough's water, a puddle in the wallow)
function vldWater(x,y,z,w,d,ry,c){vB('vPlaster',x,y-.04,z,w,.05,d,ry,c||vC(0x3e5a4e));vB('vWinGlass',x,y-.02,z,w*.55,.02,d*.5,ry+.2,vC(0x6a8a80));}   // the murk, a sheen across it
// a run of post-and-rail fence from a to b (local x,z), n rails
function vldRails(a,b,y,h,c,n){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.round(L/2.2));n=n||2;
 for(let i=0;i<=k;i++)vPst('vPost',a[0]+(b[0]-a[0])*i/k,y,a[1]+(b[1]-a[1])*i/k,.07,h+rr(-.05,.08),c);
 for(let j=1;j<=n;j++){const yy=y+h*j/(n+.4);vBeam([a[0],yy,a[1]],[b[0],yy,b[1]],.07,c);}}
// wattle: stakes every 0.45 m with withies woven between them (alternate courses a hair in and out), a to b
function vldWattle(a,b,y,h,c){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),k=Math.max(1,Math.round(L/.45));
 const nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
 for(let i=0;i<=k;i++)vPst('vPost',a[0]+(b[0]-a[0])*i/k,y,a[1]+(b[1]-a[1])*i/k,.04,h+rr(.02,.14),c);
 for(let j=0;j<Math.round(h/.13);j++){const off=(j%2?.025:-.025);vB('vWood',(a[0]+b[0])/2+nx*off,y+.06+j*.13,(a[1]+b[1])/2+nz*off,L,.09,.05,ry,c.clone().multiplyScalar(j%3?1:.88));}}
// a trough hewn from a log: the log, its dark hollow, a skin of water or slops
function vldTrough(x,y,z,ry,L,c,wet){vB('vWood',x,y,z,L,.42,.55,ry,c);vB('vDarkB',x,y+.43,z,L-.25,.02,.36,ry);if(wet)vldWater(x,y+.4,z,L-.3,.32,ry,wet);}
// a two-wheeled farm cart: board bed with raves, two spoked wheels (hoops on a stave hub), shafts resting on the ground
function vldCart(x,y,z,ry,c){const R=.62;const p=(lx,lz)=>loc(x,z,lx,lz,ry);
 {const q=p(0,0);vB('vWood',q[0],y+R+.1,q[1],1.5,.12,2.5,ry,c);}
 for(const s of[-1,1]){const q=p(s*.72,0);vB('vWood',q[0],y+R+.22,q[1],.08,.4,2.5,ry,c);                     // raves
  const w=p(s*.88,0);kput('vHoop',[w[0],y+R,w[1]],vQ(ry+Math.PI/2,0,0),[R,R,1.6],vC(0x4a3a2a));                 // iron tyre
  kput('vStave',[w[0],y+R,w[1]],vQ(ry,0,s*Math.PI/2),[.13,.22,.13],c);                                       // hub
  for(let k=0;k<6;k++){const a=k*Math.PI/6;const e=[Math.sin(a)*R*.95,Math.cos(a)*R*.95];const u=loc(0,0,0,e[0],ry);
   vBeam([w[0]+u[0],y+R+e[1],w[1]+u[1]],[w[0]-u[0],y+R-e[1],w[1]-u[1]],.05,c);}
  const f=p(s*.5,1.2),g=p(s*.38,3.1);vBeam([f[0],y+R+.05,f[1]],[g[0],y+.08,g[1]],.09,c);}                    // shafts
 {const q=p(0,0);vBeam([q[0]-.88*Math.cos(ry),y+R,q[1]+.88*Math.sin(ry)],[q[0]+.88*Math.cos(ry),y+R,q[1]-.88*Math.sin(ry)],.08,vC(0x4a3a2a),'vIron');}}   // axle
// a milk churn: a tinned body, the neck, the lid
function vldChurn(x,y,z,c){c=c||vC(vPick([0xc8c4b8,0xb8b4a8,0xd0ccc0]));vPst('vTankW',x,y,z,.17,.5,c);vPst('vTankW',x,y+.5,z,.1,.14,c);vPst('vTankW',x,y+.64,z,.13,.04,c);
 kput('vHoop',[x,y+.12,z],qEuler(Math.PI/2,0,0),[.175,.175,1],vC(0x5a5650));}
// a fish hung by the tail (a flattened silver body), for the racks
function vldFish(x,y,z,ry){kput('vBallW',[x,y,z],vQ(ry,0,rr(-.12,.12)),[.06,.22,.03],vC(vPick([0xa8b0b0,0x8a9494,0xb8a888,0x9a8a6a])));}
// a stickered stack of sawn planks (spacer sticks between courses), along local x
function vldStack(x,y,z,ry,L,n,c){for(let k=0;k<n;k++){const yy=y+.12+k*.2;
  for(let j=-2;j<=2;j++){const p=loc(x,z,rr(-.08,.08),j*.3,ry);vB('vWood',p[0],yy,p[1],L+rr(-.3,.3),.08,.27,ry,c.clone().multiplyScalar(rr(.82,1.08)));}
  for(const u of[-.42,0,.42]){const p=loc(x,z,u*L,0,ry);vB('vWood',p[0],yy-.12,p[1],.08,.12,1.6,ry,vC(0x5a4632));}}}
// logs lying along local x, in a pyramid of rows
function vldLogs(x,y,z,ry,L,rows,c){for(let r=0;r<rows;r++){const n=rows-r;for(let i=0;i<n;i++){const lz=(i-(n-1)/2)*.62,R=rr(.24,.3);const p=loc(x,z,rr(-.2,.2)-L/2,lz,ry);
  kput('vPostB',[p[0],y+R+r*.5,p[1]],vQ(ry,0,-Math.PI/2),[R,L+rr(-.4,.4),R],c.clone().multiplyScalar(rr(.8,1.1)));}}}
// a dugout canoe: one hollowed log (a swelling middle and tapering ends), its dark well, a paddle across it; along local x
function vldDugout(x,y,z,ry,L,c){const p=(lx,lz)=>loc(x,z,lx,lz,ry);
 {const q=p(-L*.3,0);kput('vStave',[q[0],y,q[1]],vQ(ry,0,-Math.PI/2),[.36,L*.6,.3],c);}
 for(const s of[-1,1]){const q=p(s*L*.3,0);kput('vPostB',[q[0],y,q[1]],vQ(ry,0,-s*Math.PI/2),[.34,L*.16,.28],c);const e=p(s*L*.43,0);kput('vPostB',[e[0],y+.04,e[1]],vQ(ry,0,-s*Math.PI/2),[.24,L*.08,.2],c);}
 {const q=p(0,0);vB('vDarkB',q[0],y+.26,q[1],L*.7,.04,.42,ry);const a=p(-L*.25,-.32),b=p(L*.12,.3);vBeam([a[0],y+.34,a[1]],[b[0],y+.34,b[1]],.06,vC(0x8a6a48));}}
// a carrying basket (a short stave tub tinted as wicker), optionally with a catch in it
function vldBasket(x,y,z,r,fish){vPst('vStave',x,y,z,r,r*1.3,vC(vPick([0xb09a6a,0x9a845a,0xc0a878])));vB('vDarkB',x,y+r*1.3,z,r*1.5,.02,r*1.5,0);
 if(fish)for(let k=0;k<3;k++)kput('vBallW',[x+rr(-r*.4,r*.4),y+r*1.3+.02,z+rr(-r*.4,r*.4)],qEuler(0,rng()*TAU,Math.PI/2),[.05,.18,.04],vC(vPick([0xa8b0b0,0x8a9494])));}

// ---------------------------------------------------------------- FARMHOUSE (middle): the farm belt's homestead
// a plaster farmhouse raised on stilts behind a full-width veranda, a cart shed, a raised granary, a fenced vegetable plot
function buildVernFarmhouse(G,o){reseed(8501+(o.v|0));const W=12,D=8,H=3.2,FL=1.6,HX=-2.2,HZ=-2.5,ZF=HZ+D/2;
 const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim)),th=vC(vPick(VPAL.thatch)),woodP=vC(vPick(VPAL.woodPoor));
 vnReg('Farmhouse (middle)',0,0,12,FL+H+4);
 // the house: stilts, floor deck, plaster body, corner posts, a timber cornice, a salvaged-sheet gable roof
 vnStilts(HX,0,HZ,W-.6,D-.6,FL-.22,0,wood,.2);vB('vWood',HX,FL-.22,HZ,W+.3,.22,D+.3,0,wood.clone().multiplyScalar(.85));
 vnBody('vPlaster',HX,FL,HZ,W,H,D,0,pl,{t:.25});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',HX+sx*(W/2-.02),FL,HZ+sz*(D/2-.02),.16,H,wood);
 for(const x of[HX-1.05,HX+2.75])vPst('vPost',x,FL,HZ-D/2+.02,.13,H,wood);                                           // back-wall posts between the windows
 const top=vnCornice('vWood',0+HX,FL+H,HZ,W,D,0,wood,1,false);
 vnGableRoof(HX,top,HZ,W,D,2.6,0,'vGableC',null,.8,'vGablePl',pl,.16);
 vnChimney(HX+3.4,top+.6,HZ-2,2.2,.16,true);                                                                     // the kitchen stove's pipe
 // openings: the door and three shuttered windows on the veranda, two a side, two shut at the back
 vnDoor(HX-2.4,FL,ZF,0,1.1,2.2,'vWood',trim,vC(0x6a4a30),false);
 for(const x of[HX-4.6,HX+.7,HX+4.0])vnWin(x,FL+1.0,ZF,0,1.2,1.25,'open','vWood',trim,true);
 for(const s of[-1,1])for(const z of[HZ-1.8,HZ+1.8])vnWin(HX+s*W/2,FL+1.05,z,s*Math.PI/2,1.0,1.15,'open','vWood',trim,true);
 for(const x of[HX-3.3,HX+1.2,HX+4.3])vnWin(x,FL+1.1,HZ-D/2,Math.PI,1.0,1.0,'shut','vWood',trim);
 for(const x of[HX-3.3,HX+1.2]){vB('vWood',x,FL+.55,HZ-D/2-.25,1.4,.08,.4,0,wood);for(let k=0;k<3;k++)vPst('vClayPot',x-.45+k*.45,FL+.63,HZ-D/2-.25,.12,.28,vC(vPick([0x9a5a38,0xb87a4a])));}   // pot shelves under the back windows
 vnDryingRack(HX-1,0,HZ-D/2-1.6,0,3.4);
 for(const x of[HX-2.4,HX+.7])vnStrip(x,FL+H-.85,ZF+.02,0,.5,.6,'vWood',wood);   // vent strips over the door and the middle window
 // the veranda: deck on posts, a rail, a low sheet roof tucked under the eave, a stair up the -x end
 vnVeranda(HX,0,ZF+1.3,W+.6,2.6,0,FL,FL+2.15,wood,trim);
 vnShedRoof(HX,FL+2.15,ZF+1.3,W+.6,2.6,.45,0,'vCorr',null,.2,.12);vB('vWood',HX,FL+2.0,ZF+2.55,W+.9,.16,.14,0,trim);   // fascia
 vnStairs(HX-W/2-.3-.96,0,ZF+1.3,-Math.PI/2,1.2,FL,6,'vWood',wood);
 for(let k=0;k<5;k++)vBall('vGourd',HX-4+k*1.9,FL+1.7,ZF+2.4,.15,vC(vPick([0xb08a4a,0x8a9a3a,0xc09a5a])),.22);       // gourds under the veranda roof
 vnSacks(HX+4.2,FL,ZF+1.0,4);vnBarrel(HX-1,FL,ZF+.6,.32,.8,wood);vB('vWood',HX+2.2,FL,ZF+.45,1.8,.45,.45,0,wood);   // sacks, a barrel and a bench on the deck
 // under the house: firewood and baskets in the dry
 vldLogs(HX+1,0,HZ-1,0,3.2,2,woodP);for(let k=0;k<3;k++)vldBasket(HX-3+k*.8,0,HZ+1.6,.3);
 vnWaterButt(HX-W/2-.7,0,HZ+.2,.42,1.1);vPst('vPipe',HX-W/2-.55,1.1,HZ+.2,.05,top-1.4,vC(0x5a5650));             // rain butt fed from the eave
 // cart shed: three posts a side under a sheet roof falling to +x, a board back wall hung with tools; the cart, a plough
 {const CX=8,CZ=-3.4,CW=4.6,CD=6.4;for(const z of[-CD/2,0,CD/2]){vPst('vPost',CX-CW/2,0,CZ+z,.13,3.3,wood);vPst('vPost',CX+CW/2,0,CZ+z,.13,2.65,wood);}
  for(const s of[-1,1])vBeam([CX-CW/2,3.25,CZ+s*CD/2],[CX+CW/2,2.6,CZ+s*CD/2],.14,wood);
  vnShedRoof(CX,2.62,CZ,CD,CW,.75,Math.PI/2,'vCorr',null,.5,.12);
  vB('vWood',CX,0,CZ-CD/2-.08,CW,2.6,.1,0,woodP);vnPatch(CX,0,CZ-CD/2-.14,Math.PI,CW,2.6,2);
  vB('vWood',CX,1.75,CZ-CD/2+.05,CW-.6,.1,.12,0,wood);                                                           // tool rail
  for(let k=0;k<7;k++){const x=CX-1.8+k*.6,L=rr(1.5,1.9);kput('vWood',[x,1.85-L/2+.1,CZ-CD/2+.14],vQ(0,rr(-.06,.06),rr(-.05,.05)),[.05,L,.05],vC(0x8a6a48));
   vB('vIron',x,1.85-L+.12,CZ-CD/2+.16,k%2?.28:.12,.18,.04,0,vC(0x4a4640));}                                    // hoes, rakes, a scythe snath
  vldCart(CX-.3,0,CZ+.2,0,wood);
  {const a=[CX+1.6,.15,CZ+2.6],b=[CX+1.4,1.0,CZ+.6];vBeam(a,b,.1,wood);vB('vIron',CX+1.62,0,CZ+2.75,.18,.3,.5,0,vC(0x4a4640));}   // plough leaning on its share
  vnSacks(CX+1.5,0,CZ-1.8,3);}
 // raised granary: four posts with rat-guard stones, a board bin, a thatch pyramid, a ladder to its door
 {const GX=-10,GZ=-6.2,GW=2.6;for(const sx of[-1,1])for(const sz of[-1,1]){vPst('vPostB',GX+sx*.95,0,GZ+sz*.95,.14,1.45,woodP);
   vPst('vStave',GX+sx*.95,1.45,GZ+sz*.95,.38,.1,vC(0x9a8a78));}
  vB('vWood',GX,1.56,GZ,GW,.14,GW,0,wood);vB('vWood',GX,1.7,GZ,GW-.1,1.8,GW-.1,0,woodP);
  vnPyrRoof('vPyrT',GX,3.5,GZ,GW,GW,1.7,0,th,.55);vB('vPlaster',GX,2.0,GZ+GW/2-.03,.7,.9,.06,0,IZ_ROOMC);vB('vWood',GX+.38,2.0,GZ+GW/2,.06,.9,.08,0,wood);
  vnLadder(GX,0,GZ+GW/2+.5,0,1.9,woodP);vnSacks(GX+1.8,0,GZ+.6,3);}
 // the vegetable plot: a fence with a gate, ridged beds, seed boxes, a scarecrow
 {const VX=7.4,VZ=5.6;vnFence(VX,0,VZ,7,5,0,woodP,1.3,1.1);
  for(let k=0;k<5;k++)for(let j=0;j<4;j++)kput('vRock',[VX-2.3+j*1.53,0,VZ-1.9+k*.9],qEuler(0,rr(-.03,.03),0),[.82,.13,.24],vC(vPick([0x4a3626,0x553e2c,0x5e4430])));   // ridged beds of turned earth
  vnPlanter(VX-2.3,0,VZ+3.1,1.4,.6,0,wood);vnPlanter(VX+2.3,0,VZ+3.1,1.4,.6,0,wood);
  vPst('vPost',VX+1.4,0,VZ-.4,.05,2.0,woodP);vB('vWood',VX+1.4,1.45,VZ-.4,1.3,.06,.06,0,woodP);kput('vCloth',[VX+1.4,1.3,VZ-.35],null,[.9,.8,1],vC(vPick(VPAL.awning)));vBall('vGourd',VX+1.4,2.05,VZ-.4,.17,vC(0xb08a4a),.2);}
 // the yard: a chopping block and split wood, a washing line, a well-trodden path of flags to the stair
 vPst('vPostB',-8.6,0,1.6,.3,.55,woodP);kput('vWood',[-8.6,.75,1.6],vQ(0,0,.7),[.05,.5,.05],vC(0x6a5a48));vldLogs(-9.6,0,3.0,.3,1.2,2,woodP);
 vnDryingRack(-6,0,5.6,0,3.6);vnPaving(HX-W/2-1.6,.02,ZF+2.8,1.6,3.8,0,vC(vPick(VPAL.stoneDark)),5);
 vnFolk(1,8,3,1.5);}

// ---------------------------------------------------------------- BYRE AND DAIRY (poor): the cattle house
// a long thatched byre of boards with a hay loft in its roof, the limewashed dairy at its +x end, a railed fold in front
function buildVernByre(G,o){reseed(8511+(o.v|0));const BW=10,DW=4.4,D=7,H=3.1,Y0=.25,BX=-3,DX=BX+BW/2+DW/2,RX=BX-BW/2+(BW+DW)/2,RW=BW+DW;
 const wood=vC(vPick(VPAL.woodPoor)),woodM=vC(vPick(VPAL.woodMid)),lime=vC(vPick([0xe8dcc0,0xf0e4c8,0xe2d4b4])),th=vC(vPick(VPAL.thatch)),hay=vC(vPick([0xc8a860,0xd0b46a,0xbc9c56]));
 vnReg('Byre and dairy (poor)',0,0,10,Y0+H+3.6);
 vB('vStone',RX,-.1,0,RW+.4,.35,D+.4,0,vC(0x9a8a78));                                                            // rubble footing
 vnBody('vWood',BX,Y0,0,BW,H,D,0,wood,{t:.18,floorC:vC(0x7a6a58)});vnBody('vPlaster',DX,Y0,0,DW,H,D,0,lime,{t:.22});
 for(let i=0;i<=4;i++)for(const s of[-1,1])vPst('vPost',BX-BW/2+BW*i/4+(i===0?.02:i===4?-.02:0),Y0,s*(D/2-.02),.13,H,woodM);
 for(const s of[-1,1])vPst('vPost',DX+DW/2-.02,Y0,s*(D/2-.02),.13,H,woodM);
 vB('vWood',RX,Y0+H-.05,0,RW+.3,.2,D+.3,0,woodM);                                                                // wall plate
 vnGableRoof(RX,Y0+H+.15,0,RW,D,2.6,0,'vThatchB',th,.85,'vGableW',wood,.4);
 // the byre: wide double door into the fold, slatted vents, a mucking door at the back
 vnDoor(BX-1,Y0,D/2,0,2.4,2.3,'vWood',wood,vC(0x6a5a48),false);
 for(const x of[BX-3.8,BX+2.2,BX+3.9])vnWin(x,Y0+1.5,D/2,0,.9,.5,'open','vWood',wood);
 for(const x of[BX-3.6,BX-.8,BX+2.6])vnWin(x,Y0+1.5,-D/2,Math.PI,.9,.5,'open','vWood',wood);
 vnDoor(BX+4,Y0,-D/2,Math.PI,1.1,2.0,'vWood',wood,vC(0x6a5a48),false);
 for(const z of[-1.6,1.6])vnWin(BX-BW/2,Y0+1.5,z,-Math.PI/2,.8,.5,'open','vWood',wood);
 vnPatch(BX-BW/2-.02,Y0,0,-Math.PI/2,D,H,2);
 // the dairy: its own door and a shuttered window on the lane, a side window
 vnDoor(DX,Y0,D/2,0,1.0,2.1,'vWood',woodM,vC(0x4a6a6a),false);vnWin(DX+DW/2,Y0+1.1,.8,Math.PI/2,1.0,1.0,'open','vWood',woodM,true);
 vnWin(DX,Y0+1.3,-D/2,Math.PI,.9,.8,'shut','vWood',woodM);
 // the hay loft in the -x gable: its door, hay spilling out, a hoist beam over it, a ladder up
 {const xe=RX-RW/2;vB('vThatchB',xe-.04,Y0+H+.45,0,.1,1.3,1.5,0,vC(0xc8a860));vB('vWood',xe-.1,Y0+H+.38,0,.12,.1,1.7,0,woodM);
  kput('vThatchB',[xe-.25,Y0+H+.75,0],qEuler(0,0,-.25),[.6,.5,1.3],hay);
  vBeam([xe+.3,Y0+H+2.3,0],[xe-1.3,Y0+H+2.3,0],.16,woodM);vBeam([xe-1.15,Y0+H+2.2,0],[xe-1.15,Y0+H+.9,0],.03,vC(0xb8a888),'vRope');
  kput('vThatchB',[xe-1.15,Y0+H+.65,0],qEuler(.2,0,.1),[.6,.5,.6],hay);vnLadder(xe-.75,0,1.9,-Math.PI/2,Y0+H+.4,woodM);}
 // the fold: rails round the byre's front, a trough, a gate; the milk stand and churns by the dairy door
 {const z0=D/2+.2,z1=D/2+4.2,x0=BX-BW/2+.1,x1=BX+3.6;vldRails([x0,z0],[x0,z1],0,1.3,woodM,3);vldRails([x1,z0],[x1,z1],0,1.3,woodM,3);
  vldRails([x0,z1],[BX-2.4,z1],0,1.3,woodM,3);vldRails([BX+.2,z1],[x1,z1],0,1.3,woodM,3);
  {const g0=[BX-2.4,z1],a=.9,g1=[g0[0]+Math.cos(a)*2.5,z1+Math.sin(a)*2.5];vPst('vPost',g1[0],0,g1[1],.06,1.25,woodM);for(const yy of[.3,.7,1.1])vBeam([g0[0],yy,g0[1]],[g1[0],yy,g1[1]],.06,woodM);vBeam([g0[0],.3,g0[1]],[g1[0],1.1,g1[1]],.05,woodM);}                                          // the gate, swung open
  vldTrough(BX+2.4,0,z0+1.2,Math.PI/2,2.2,woodM,vC(0x9ab0a0));vnPaving(BX-1,.02,z0+1.0,3,1.8,0,vC(0x8a7a6a),5);
  for(let k=0;k<4;k++)kput('vRock',[BX-3+rr(-1,4),.02,z0+rr(1.5,3.6)],qEuler(0,rng()*TAU,0),[rr(.6,1.1),.05,rr(.5,.9)],vC(0x5a4632));}   // trodden muck
 {const mx=DX+.6,mz=D/2+1.4;vB('vWood',mx,0,mz,2.2,.9,1.1,0,woodM);for(let k=0;k<3;k++)vldChurn(mx-.65+k*.65,.9,mz);
  for(let k=0;k<2;k++)vldChurn(DX-1.5+k*.45,0,D/2+.45);vB('vWood',DX+1.6,0,D/2+.5,.35,.42,.35,0,woodM);vnBarrel(DX+1.6,.42,D/2+.5,.17,.25,woodM);}   // churns, a milking stool, a pail
 // the back: the muck heap by the mucking door with a fork in it, a barrow; the hay rick at +x
 {const hx=BX+4.3,hz=-D/2-1.8;for(let k=0;k<5;k++)kput('vRock',[hx+rr(-.9,.9),0,hz+rr(-.6,.6)],qEuler(0,rng()*TAU,0),[rr(.7,1.2),rr(.35,.6),rr(.6,1)],vC(vPick([0x4a3a28,0x5a4632,0x3e3020])));
  kput('vWood',[hx+.2,1.1,hz],vQ(0,.3,.2),[.05,1.5,.05],vC(0x8a6a48));
  vB('vWood',hx-2.4,.3,hz+.2,.9,.35,1.3,.2,wood);kput('vStave',[hx-2.5,.25,hz+.85],vQ(.2,0,Math.PI/2),[.25,.08,.25],woodM);}
 {const kx=8.8,kz=-1.6;kput('vConeT',[kx,0,kz],null,[1.6,3.4,1.6],hay);kput('vConeT',[kx,.9,kz],null,[1.7,.7,1.7],hay.clone().multiplyScalar(.85));vPst('vPost',kx,3.2,kz,.05,.6,woodM);
  vnPlanter(DX+DW/2+.6,0,-2.6,.6,1.4,0,woodM);vnWaterButt(DX+DW/2+.7,0,-1.0,.4,1.0);}
 vnFolk(-1,D/2+5.6,2,1.4);}

// ---------------------------------------------------------------- STOCK PENS (poor): the swineherd's and duck keeper's yard
// a wattle-fenced pig sty with thatched lean-to shelters and a mud wallow, a duck house on stilts over its pond, the herder's hut
function buildVernPens(G,o){reseed(8521+(o.v|0));const wood=vC(vPick(VPAL.woodPoor)),wat=vC(vPick([0x9a8460,0x8a7656,0xa89068])),th=vC(vPick(VPAL.thatch)),mud=vC(vPick([0x4e3a28,0x5a4430]));
 vnReg('Stock pens (poor)',0,0,10,5.5);
 // the herder's hut: boards on low stilts under a steep thatch gable
 {const HX=-6.2,HZ=-4.6,W=4.2,D=3.8,FL=.5,H=2.4;vnStilts(HX,0,HZ,W-.4,D-.4,FL-.15,0,wood,.13);vB('vWood',HX,FL-.15,HZ,W+.2,.15,D+.2,0,wood.clone().multiplyScalar(.9));
  vnBody('vWood',HX,FL,HZ,W,H,D,0,wood,{t:.12});vnPatch(HX,FL,HZ-D/2-.01,Math.PI,W,H,2);
  vnGableRoof(HX,FL+H,HZ,W,D,1.7,0,'vThatchB',th,.7,'vGableW',wood,.38);
  vnDoor(HX+.8,FL,HZ+D/2,0,.9,1.85,'vWood',wood,vC(0x7a6a58),false);vB('vWood',HX+.8,0,HZ+D/2+.45,1.2,.25,.6,0,wood);   // door and a step
  vnWin(HX-.9,FL+1.1,HZ+D/2,0,.8,.65,'open','vWood',wood);vPl('vTarp',HX-.9,FL+1.2,HZ+D/2+.04,.9,.55,0,vC(0xb8a070),-.35);
  vnWin(HX-W/2,FL+1.1,HZ,-Math.PI/2,.8,.65,'open','vWood',wood);
  vnWaterButt(HX-W/2-.6,0,HZ+1.0,.38,1.0);for(let k=0;k<3;k++)vBall('vGourd',HX-1.4+k*1.1,FL+H-.3,HZ+D/2+.75,.15,vC(vPick([0xb08a4a,0x8a9a3a])),.22);
  vnSacks(HX+2.6,0,HZ+.4,4);vB('vWood',HX+2.7,0,HZ-1.2,.9,.8,.9,.2,wood);}                                       // feed sacks, a feed bin
 // the sty: a wattle ring with a gate, two thatched lean-tos at the back, the wallow, troughs along the front
 {const SX=4,SZ=-2.5,SW=9,SD=7,x0=SX-SW/2,x1=SX+SW/2,z0=SZ-SD/2,z1=SZ+SD/2;
  vldWattle([x0,z0],[x1,z0],0,1.25,wood);vldWattle([x0,z0],[x0,z1],0,1.1,wood);vldWattle([x1,z0],[x1,z1],0,1.1,wood);
  vldWattle([x0,z1],[SX-.6,z1],0,1.1,wood);vldWattle([SX+.6,z1],[x1,z1],0,1.1,wood);
  kput('vWood',[SX+.35,.55,z1+.5],qEuler(0,1.2,0),[1.2,1.0,.06],wood);                                         // hurdle gate, swung out
  for(const cx of[SX-2.3,SX+2.3]){const w=3.6,d=2.3;for(const sx of[-1,1]){vPst('vPost',cx+sx*w/2,0,z0+d,.08,1.6,wood);vPst('vPost',cx+sx*w/2,0,z0+.1,.08,2.2,wood);
    vldWattle([cx+sx*w/2,z0+.1],[cx+sx*w/2,z0+d],0,1.2,wood);}
   vnShedRoof(cx,1.6,z0+d/2+.05,w,d,.6,0,'vThatchB',th,.4,.28);vB('vThatchB',cx,0,z0+d/2,w-.3,.12,d-.3,0,vC(0xb89a5a));}   // shelter, its straw bed
  for(let k=0;k<6;k++)kput('vRock',[SX+rr(-2.6,2.4),.01,SZ+rr(.2,2.4)],qEuler(0,rng()*TAU,0),[rr(.9,1.6),.06,rr(.7,1.2)],mud.clone().multiplyScalar(rr(.85,1.1)));
  vB('vPlaster',SX-.4,.05,SZ+1.4,1.4,.03,.9,.4,vC(0x3a3024));vB('vPlaster',SX+1.0,.05,SZ+1.0,.9,.03,.6,-.3,vC(0x40362a));
  vldTrough(SX-2.6,0,z1-.55,0,2.0,wood,vC(0x9a8a6a));vldTrough(SX+2.8,0,z1-.55,0,1.6,wood,vC(0x9ab0a0));
  vnBarrel(SX+1.4,0,z1+.6,.3,.75,wood);vnBarrel(x1+.5,0,SZ,.36,.9,wood);}                                       // slop tubs
 // the duck pond: mud banks, the water, stones round its lip; the duck house on stilts over it with a ramp to the bank
 {const PX=-3.6,PZ=3.6;kput('vRock',[PX,-.06,PZ],qEuler(0,.2,0),[3.4,.12,2.3],mud);kput('vRock',[PX+1.2,-.05,PZ+.6],qEuler(0,-.4,0),[2.2,.11,1.6],mud);
  vldWater(PX,.09,PZ,4.4,2.6,.2);vldWater(PX+1.3,.09,PZ+.7,2.4,1.8,-.4);
  for(let k=0;k<14;k++){const a=k/14*TAU;kput('vRock',[PX+Math.cos(a)*rr(2.7,3.1),0,PZ+Math.sin(a)*rr(1.6,1.9)],qEuler(rng(),rng(),0),[rr(.15,.3),rr(.1,.18),rr(.15,.3)],vC(vPick([0x8a8078,0x6a625a,0x9a9088])));}
  const CX=PX-.6,CZ=PZ-.2,FL=.95;for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPostB',CX+sx*.75,-.2,CZ+sz*.55,.08,FL+.2,wood);
  vB('vWood',CX,FL-.1,CZ,1.9,.1,1.5,0,wood);vB('vWood',CX,FL,CZ,1.7,1.0,1.3,0,wood.clone().multiplyScalar(.92));
  vnGableRoof(CX,FL+1.0,CZ,1.7,1.3,.8,0,'vThatchB',th,.35,'vGableW',wood,.22);vB('vPlaster',CX+.86,FL,CZ,.04,.45,.4,0,IZ_ROOMC);
  {const a=[CX+.95,FL-.05,CZ],b=[CX+2.4,.05,CZ+.3];beam('vWood',a,b,.4,.05,wood);for(let k=1;k<5;k++){const t=k/5;vB('vWood',a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+.02,a[2]+(b[2]-a[2])*t,.04,.04,.4,.2,wood);}}
  // the duck run: low wattle round the pond's landward side
  vldWattle([PX-3.6,PZ-2.3],[PX+3.6,PZ-2.3],0,.8,wood);vldWattle([PX-3.6,PZ-2.3],[PX-3.6,PZ+2.6],0,.8,wood);vldWattle([PX+3.6,PZ-2.3],[PX+3.6,PZ+1.0],0,.8,wood);
  vldTrough(PX+2.6,0,PZ-1.6,0,1.0,wood,vC(0x9ab0a0));}
 vnFolk(2,6.4,2,1.2);}

// ---------------------------------------------------------------- BOATWRIGHT'S YARD (middle): river boats and moat lighters
// a long open boat shed over a timbered slip that runs out to the front edge, a moat lighter in frame on the stocks, the steam
// box, stacked timber, and the closed plaster workshop with its timber loft
function buildVernBoatyard(G,o){reseed(8531+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),woodP=vC(vPick(VPAL.woodPoor)),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim)),iron=vC(0x3a3632);
 vnReg('Boatwright\'s yard (middle)',0,0,13,9);
 const SX=-4.5,Z0=-6,Z1=8,SW=8,PH=4.6;
 // the slip: a timber cradle of sleepers and two greased ways falling from 1.0 m at the back to below the water at the front edge
 const yw=z=>z<=8?1.0-(z+5.2)/13.2:-(z-8)*.27;
 {for(let z=-5.2;z<=10.9;z+=1.15){const y=yw(z);vB('vWood',SX,Math.min(0,y-.15)-(z>8?.3:0),z,3.4,Math.max(.15,y)+(z>8?.3:0),.26,0,woodP);}
  for(const s of[-1,1])rbeam('vWood',[SX+s*.95,yw(-5.2)+.12,-5.2],[SX+s*.95,yw(11)+.12,11],.24,.3,vC(0x5a3e2a));
  for(const s of[-1,1])for(let z=-4.6;z<=7.6;z+=2.6)vPst('vPostB',SX+s*1.75,-.1,z,.12,yw(z)+.1,woodP);}         // cradle legs
 // the shed: two rows of posts, tie beams with king posts, an open-ended sheet gable along z; the -x side boarded
 {for(let i=0;i<=4;i++){const z=Z0+(Z1-Z0)*i/4;for(const s of[-1,1])vPst('vPost',SX+s*(SW/2-.1),0,z,.17,PH,wood);
   vB('vWood',SX,PH-.05,z,SW+.2,.24,.26,0,wood);vPst('vPost',SX,PH+.19,z,.1,2.2,wood);
   for(const s of[-1,1])vBeam([SX+s*(SW/2-.3),PH+.15,z],[SX,PH+2.2,z],.12,wood);}
  for(const s of[-1,1])vB('vWood',SX+s*(SW/2-.1),PH-.2,(Z0+Z1)/2,.26,.24,Z1-Z0+.3,0,wood);                      // eaves plates
  vnGableRoof(SX,PH+.2,(Z0+Z1)/2,Z1-Z0,SW,2.4,Math.PI/2,'vGableC',null,.9);
  vB('vWood',SX-SW/2+.02,0,(Z0+Z1)/2,.1,PH-.3,Z1-Z0-.4,0,woodP);vnPatch(SX-SW/2-.04,0,(Z0+Z1)/2,-Math.PI/2,Z1-Z0,PH-.3,4);
  vB('vWood',SX-SW/2+.15,1.6,(Z0+Z1)/2,.1,.1,8,0,wood);for(let k=0;k<9;k++)kput('vWood',[SX-SW/2+.2,1.05,-2.8+k*.95],vQ(0,0,.06),[.05,2.2,.08],vC(0x8a6a48));   // a rack of oars and poles
  for(let k=0;k<5;k++)vB('vIron',SX-SW/2+.2,1.2+rr(0,.3),-4.5+k*.35,.06,.5,.12,0,iron);                          // adzes, mallets on pegs
  vB('vWood',SX+SW/2-.9,0,Z0+1.4,1.2,.9,2.6,0,wood);}                                                            // the shipwright's bench
 // the moat lighter on the stocks: keel on blocks, stem and stern posts, frames, the bottom and lower strakes planked
 {const L=9.4,zc=1.2,yk=1.5,B=1.5;const zA=zc-L/2,zB=zc+L/2;
  vB('vWood',SX,yk-.22,zc,.24,.24,L,0,vC(0x6a4a30));                                                            // keel
  for(let z=zA+.6;z<zB;z+=1.3){const y=yw(z)+.12;vB('vWood',SX,y,z,.7,yk-.22-y,.5,0,woodP);}                    // keel blocks
  for(const e of[[zA,-1],[zB,1]]){rbeam('vWood',[SX,yk-.2,e[0]],[SX,yk+1.7,e[0]+e[1]*.55],.24,.22,vC(0x6a4a30));}   // stem, stern post
  const sec=(t)=>{const hw=B*Math.pow(Math.max(0,1-t*t),.45),sh=.32*t*t;return[[0,yk],[hw*.82,yk+.12],[hw,yk+.55],[hw*1.03,yk+1.25+sh]];};
  const fz=[];for(let z=zA+.55;z<zB-.4;z+=.62)fz.push(z);
  const P=fz.map(z=>sec((z-zc)/(L/2)));
  fz.forEach((z,i)=>{const S=P[i];for(const s of[-1,1])for(let k=0;k<3;k++)vBeam([SX+s*S[k][0],S[k][1],z],[SX+s*S[k+1][0],S[k+1][1],z],.1,vC(0x8a6440));});   // frames
  const pt=(S,u)=>{const k=Math.min(2,Math.floor(u*3)),f=u*3-k;return[S[k][0]+(S[k+1][0]-S[k][0])*f,S[k][1]+(S[k+1][1]-S[k][1])*f];};
  for(let i=0;i+1<fz.length;i++){for(const s of[-1,1])for(const u of[.08,.24,.4,.56,.72]){const n=s>0&&u>.5?(i>3&&i<fz.length-6):true;if(!n)continue;   // +x side: the top strakes are still going on
    const a=pt(P[i],u),b=pt(P[i+1],u);rbeam('vWood',[SX+s*a[0]*1.03,a[1],fz[i]-.02],[SX+s*b[0]*1.03,b[1],fz[i+1]+.02],u<.3?.05:.22,u<.3?.24:.05,wood.clone().multiplyScalar(u<.3?.9:1.06));}}
  for(const s of[-1,1])for(let i=0;i<fz.length;i+=3){const S=P[i];vBeam([SX+s*(S[2][0]+.1),yk+.6,fz[i]],[SX+s*(S[2][0]+1.5),yw(fz[i])+.1,fz[i]],.1,woodP);}   // shores
  for(let k=0;k<4;k++)kput('vWood',[SX+2.6,.5+k*.18,-3.2],qEuler(0,0,0),[.26,.06,5.6],wood.clone().multiplyScalar(rr(.9,1.1)));   // planks laid ready
  vB('vWood',SX+2.2,0,zB-1,.9,.75,.9,0,woodP);vB('vIron',SX+2.2,.75,zB-1,.4,.25,.25,0,iron);}                      // a block with the pitch pot
 // the steam box: a long plank box on trestles, its boiler drum over a fire, a bent plank cooling in its form
 {const BXs=6.2,BZ=4.8;for(const z of[BZ-1.6,BZ+1.6]){for(const s of[-1,1])vBeam([BXs+s*.5,0,z],[BXs+s*.1,1.0,z],.08,woodP);vB('vWood',BXs,.95,z,1.1,.1,.14,0,woodP);}
  vB('vWood',BXs,1.05,BZ,.62,.6,4.4,0,wood.clone().multiplyScalar(.8));for(let k=-2;k<=2;k++)vB('vIron',BXs,1.02,BZ+k*1,.68,.66,.06,0,iron);
  vB('vWood',BXs,1.15,BZ+2.25,.5,.4,.06,0,vC(0x5a3e2a));kput('vWood',[BXs+.1,1.3,BZ+2.6],qEuler(.1,0,0),[.22,.04,1.0],wood);   // its door, a plank coming out
  const fx=BXs+1.6,fz=BZ+2.4;vB('vStone',fx,0,fz,1.2,.5,1.2,0,vC(0x7a7068));vB('vDarkB',fx,.1,fz+.6,.5,.3,.04,0);vBall('vEmber',fx,.22,fz+.5,.12);
  vPst('vTankR',fx,.5,fz,.42,.8,null);vBeam([fx,1.3,fz],[BXs+.2,1.35,BZ+2.0],.08,null,'vPipeR');vnChimney(fx+.3,1.3,fz-.3,.9,.07,true);
  for(let k=0;k<6;k++){const a=-.6+k*.24;vPst('vPost',BXs-1.4+Math.sin(a)*1.6,0,BZ-.6+Math.cos(a)*1.6-1.6,.04,.7,woodP);}   // the bending form's pegs
  for(let k=0;k<5;k++){const a0=-.6+k*.24,a1=a0+.24;vBeam([BXs-1.4+Math.sin(a0)*1.55,.5,BZ-2.2+Math.cos(a0)*1.55],[BXs-1.4+Math.sin(a1)*1.55,.5,BZ-2.2+Math.cos(a1)*1.55],.06,wood);}}
 // the workshop: a plaster ground storey, a board loft over a string course, a front gable with a hoist; door to the yard
 {const WX=8.6,WZ=-5.4,W=7.4,D=6.4,H1=3.2,H2=2.4,Y0=.3,ZF=WZ+D/2;
  vB('vStone',WX,-.1,WZ,W+.5,.4,D+.5,0,vC(vPick(VPAL.stoneDark)));
  vnBody('vPlaster',WX,Y0,WZ,W,H1,D,0,pl,{t:.25});vnBand('vWood',WX,Y0+H1,WZ,W+.34,.3,D+.34,0,wood,.47);
  vnBody('vWood',WX,Y0+H1+.3,WZ,W,H2,D,0,wood.clone().multiplyScalar(.92),{t:.2});
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',WX+sx*(W/2-.02),Y0,WZ+sz*(D/2-.02),.16,H1+H2+.3,wood);
  const top=vnCornice('vWood',WX,Y0+H1+.3+H2,WZ,W,D,0,wood,1,false);
  vnGableRoof(WX,top,WZ,D,W,2.6,Math.PI/2,'vGableC',null,.9,'vGableW',wood,.16);
  vnDoor(WX-1.5,Y0,ZF,0,1.8,2.4,'vWood',trim,vC(0x6a4a30));vnWin(WX+1.9,Y0+1.1,ZF,0,1.4,1.2,'open','vWood',trim,true);
  for(const s of[-1,1])vnWin(WX+s*W/2,Y0+1.1,WZ+.6,s*Math.PI/2,1.2,1.2,'open','vWood',trim,true);
  vnWin(WX,Y0+1.2,WZ-D/2,Math.PI,1.1,1.0,'shut','vWood',trim);
  vnWin(WX,Y0+H1+.65,ZF,0,1.2,1.5,'shut','vWood',trim);                                                          // the loft's timber door, boarded
  for(const s of[-1,1])vnWin(WX+s*W/2,Y0+H1+.9,WZ,s*Math.PI/2,.9,.8,'open','vWood',trim,true);
  vBeam([WX,top+1.6,ZF-.4],[WX,top+1.6,ZF+1.3],.16,wood);vBeam([WX,top+1.55,ZF+1.15],[WX,Y0+H1+2.4,ZF+1.15],.03,vC(0xb8a888),'vRope');vB('vWood',WX,top+1.3,ZF+1.15,.2,.25,.12,0,wood);   // hoist
  vnAwning(WX+1.9,Y0+2.6,ZF,0,2.2,1.2,vC(vPick(VPAL.awning)));vnSign(WX-3.0,Y0+2.6,ZF,0,vC(0xe07a2a));
  for(let k=0;k<4;k++)kput('vWood',[WX+3.2+k*.08,1.3,ZF+.25],vQ(0,0,-.12-k*.02),[.06,2.6,.12],vC(0x8a6a48));   // oars leaning by the door
  vnWaterButt(WX+W/2+.6,0,WZ-1.8,.4,1.0);vnChimney(WX-W/2+1.2,top+.4,WZ-1.5,2.4,.12,true);}
 // timber: logs seasoning behind the shed, stickered plank stacks, a sawpit with a log on its trestle
 vldLogs(SX,0,-9.4,0,7.6,3,woodP);vldStack(2.4,0,2.4,Math.PI/2,5.2,4,wood);vldStack(11.2,0,4.2,Math.PI/2,4.4,3,woodP);
 {const px=2.3,pz=-4.4;vB('vDarkB',px,-.02,pz,1.0,.06,3.4,0);for(const s of[-1,1])vB('vWood',px+s*.6,0,pz,.14,.3,3.6,0,woodP);
  kput('vPostB',[px,.55,pz-1.8],qEuler(Math.PI/2,0,0),[.3,3.6,.3],woodP);vB('vIron',px,.5,pz+.2,.04,1.6,.3,0,iron);}
 // a river skiff finished and turned over on trestles
 {const kx=10.4,kz=.4;for(const s of[-1,1])vB('vWood',kx+s*1.4,0,kz,.15,.8,1.2,0,woodP);
  kput('vDomeP',[kx,.8,kz],qEuler(0,0,0),[2.4,.45,.6],vC(vPick([0x2f6a6a,0x8a3a2a,0x3a5a7a])));vB('vWood',kx,.8,kz,4.8,.06,1.15,0,wood);}
 // the water's edge: a timber sheet wall along the front either side of the slip, piles below the line, bollards
 for(const r of[[-12.8,SX-2.1],[SX+2.1,12.8]]){const cx=(r[0]+r[1])/2,L=r[1]-r[0];vB('vWood',cx,-1.2,10.85,L,1.3,.24,0,vC(0x5a4632));vB('vWood',cx,.05,10.7,L,.14,.5,0,wood);
  for(let x=r[0]+.3;x<r[1];x+=1.4)vPst('vPostB',x,-1.3,10.98,.13,1.55,vC(0x4e3c2a));}
 for(const x of[SX-3,SX+3,6,11])vPst('vPostB',x,0,10.2,.16,.7,vC(0x4e3c2a));
 vnPaving(8,.02,8.6,7,2.6,0,vC(0x8a7a6a),8);vnFolk(SX+2.8,4.8,2,1.4);vnFolk(7.6,1.6,1,.6);}

// ---------------------------------------------------------------- FISH LANDING AND SMOKEHOUSE (poor)
// a timber landing stage on piles at the front with a dugout moored along it, net drying frames, the daub smokehouse with
// its fish racks
function buildVernFishLanding(G,o){reseed(8541+(o.v|0));const wood=vC(vPick(VPAL.woodPoor)),woodD=vC(0x5a4632),th=vC(vPick(VPAL.thatch)),daub=vC(vPick([0xa88a68,0x9a7e60,0xb09474])),net=vC(vPick([0x8a8470,0x7a7a66,0x948a72]));
 vnReg('Fish landing and smokehouse (poor)',0,0,9.5,5.5);
 // the smokehouse: daub on a timber frame, a low door, a slatted vent, a thatch gable with a raised smoke louvre on the ridge
 {const SX=-4.6,SZ=-4.2,W=4.2,D=3.6,H=2.5,Y0=.25;vB('vStone',SX,-.1,SZ,W+.3,.35,D+.3,0,vC(0x8a7a6a));
  vnBody('vPlaster',SX,Y0,SZ,W,H,D,0,daub,{t:.2,floorC:vC(0x6a5a4a)});
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',SX+sx*(W/2-.02),Y0,SZ+sz*(D/2-.02),.12,H,woodD);
  vB('vWood',SX,Y0+H-.05,SZ,W+.25,.18,D+.25,0,woodD);
  vnGableRoof(SX,Y0+H+.13,SZ,W,D,1.6,0,'vThatchB',th,.7,'vGableW',wood,.36);
  for(const sx of[-1,1])vPst('vPost',SX+sx*1.2,Y0+H+1.45,SZ,.05,.5,woodD);vnGableRoof(SX,Y0+H+2.05,SZ,2.8,1.2,.5,0,'vThatchB',th.clone().multiplyScalar(.8),.25,null,null,.18);   // smoke louvre
  vnDoor(SX+.6,Y0,SZ+D/2,0,.9,1.8,'vWood',wood,vC(0x6a5a48));
  vnWin(SX-W/2,Y0+1.3,SZ,-Math.PI/2,.7,.45,'shut','vWood',wood);vnWin(SX+W/2,Y0+1.3,SZ-.4,Math.PI/2,.7,.45,'shut','vWood',wood);
  for(const x of[SX-.9,SX+.6])vB('vClayB',x,Y0+1.95,SZ+D/2+.01,.9,.5,.04,0,vC(0x3a3430));                      // soot over the door and the eave
  vldLogs(SX-W/2-.9,0,SZ+.2,Math.PI/2,2.4,3,wood);                                                               // smoking wood
  vB('vPlaster',SX-.8,Y0+1.6,SZ-D/2-.01,1.6,.9,.04,0,vC(0x4a4038));vnDryingRack(SX,0,SZ-D/2-1.1,0,3.2);for(let k=0;k<3;k++)vldBasket(SX+1.2+k*.5,0,SZ-D/2-.45,.24);   // soot on the back, a rack, baskets
  // the fish racks: two A-frames with poles, fish hung by the tail
  for(const rz of[SZ+3.0,SZ+4.2]){const L=3.6;for(const s of[-1,1]){vBeam([SX+s*L/2,0,rz-.4],[SX+s*L/2,1.9,rz],.06,woodD);vBeam([SX+s*L/2,0,rz+.4],[SX+s*L/2,1.9,rz],.06,woodD);}
   for(const yy of[1.85,1.35])vBeam([SX-L/2-.1,yy,rz+(yy<1.5?.12:0)],[SX+L/2+.1,yy,rz+(yy<1.5?.12:0)],.04,woodD);
   for(let k=0;k<12;k++)vldFish(SX-L/2+.2+k*.29,1.62,rz+rr(-.03,.03),0);for(let k=0;k<11;k++)vldFish(SX-L/2+.35+k*.3,1.12,rz+.12,0);}}
 // the net frames: posts and rails with the nets draped over, floats along the head rope; a net heaped for mending
 for(let i=0;i<3;i++){const nx=1.6+i*2.5,nz=-3.6-i*.3,L=2.2;for(const s of[-1,1])vPst('vPost',nx+s*L/2,0,nz,.06,2.7,woodD);vBeam([nx-L/2,2.6,nz],[nx+L/2,2.6,nz],.06,woodD);
  for(const s of[-1,1])kput('vCloth',[nx,1.9,nz+s*.12],vQ(0,s*.12,0),[L-.15,1.5,1],net.clone().multiplyScalar(rr(.85,1.1)));
  for(let k=0;k<6;k++)vBall('vGourd',nx-L/2+.25+k*.34,2.55,nz+.14,.06,vC(0xd8c8a0),.05);}
 for(let k=0;k<4;k++)kput('vTarpB',[4.4+rr(-.6,.6),.1+k*.06,-.8+rr(-.4,.4)],qEuler(0,rng()*TAU,0),[rr(1,1.6),.12,rr(.8,1.2)],net.clone().multiplyScalar(rr(.8,1.1)));
 vB('vWood',2.6,0,-.6,.4,.42,.4,0,wood);                                                                         // the mender's stool
 // the landing stage: a plank deck on piles running out past the front edge's line, steps up from the yard, a ladder down
 {const X0=-6.6,X1=3.4,ZB=2.8,ZF=7.6,DY=.55;const cx=(X0+X1)/2;
  vB('vWood',cx,DY-.12,(ZB+ZF)/2,X1-X0,.12,ZF-ZB,0,wood);
  for(let k=0;k<Math.round((X1-X0)/.3);k++)vB('vWood',X0+.15+k*.3,DY-.01,(ZB+ZF)/2,.26,.02,ZF-ZB,0,wood.clone().multiplyScalar(rr(.85,1.1)));   // deck planks
  for(const z of[ZB+.3,(ZB+ZF)/2,ZF-.2]){vB('vWood',cx,DY-.34,z,X1-X0,.22,.2,0,woodD);
   for(let x=X0+.2;x<=X1;x+=1.65)vPst('vPostB',x,z>ZB+1?-1.4:-.2,z,.14,DY-.12-(z>ZB+1?-1.4:-.2),woodD);}
  for(let x=X0+.2;x+1.65<=X1;x+=3.3)vBeam([x,-1.0,ZF-.2],[x+1.65,DY-.4,ZF-.2],.08,woodD);                        // cross-bracing on the water face
  vnStairs(-1.6,0,ZB-.5,0,1.4,DY,2,'vWood',wood);
  vnLadder(X0+1.2,-1.0,ZF+.25,0,DY+1.1,woodD);
  for(const x of[X0+.3,X1-.3])vPst('vPostB',x,DY,ZF-.3,.13,.55,woodD);vPst('vPostB',X1-.3,DY,ZB+.4,.13,.55,woodD);   // bollards
  // on the deck: the gutting table under a tarp shade, baskets of catch, fish traps, a coil of rope, oars
  vB('vWood',-3.4,DY,4.4,2.0,.85,.8,0,wood);for(let k=0;k<4;k++)kput('vBallW',[-4+k*.4,DY+.88,4.4+rr(-.15,.15)],qEuler(0,rr(-.3,.3),Math.PI/2),[.05,.2,.04],vC(vPick([0xa8b0b0,0x8a9494])));
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',-3.4+sx*1.3,DY,4.4+sz*1.0,.05,2.2+(sz<0?.3:0),woodD);
  kput('vTarpB',[-3.4,DY+2.38,4.4],qEuler(-.15,0,0),[2.9,.05,2.3],vC(vPick([0xb0a080,0xa89068])));
  for(let k=0;k<4;k++)vldBasket(-1.6+k*.7+rr(-.1,.1),DY,5.6+rr(-.2,.2),.26,k%2===0);
  for(let k=0;k<3;k++)kput('vConeT',[1.2+k*.75,DY+.32,4.0],qEuler(0,0,Math.PI/2),[.3,1.1,.3],vC(0x9a845a));        // fish traps on their sides
  kput('vHoop',[2.2,DY+.06,6.6],qEuler(Math.PI/2,0,0),[.3,.3,2.5],vC(0xb8a888));kput('vHoop',[2.2,DY+.12,6.6],qEuler(Math.PI/2,0,0),[.24,.24,2.5],vC(0xb8a888));
  for(let k=0;k<2;k++)kput('vWood',[-5.8+k*.3,DY+1.1,3.0],vQ(0,0,.15),[.06,2.2,.12],vC(0x8a6a48));
  // the dugout moored along the stage's +x side, its line to the bollard
  vldDugout(X1+.7,-.15,5.6,Math.PI/2,5.4,vC(vPick([0x6a4a30,0x5a3e28])));vBeam([X1-.3,DY+.4,ZB+.4],[X1+.7,-.05,3.4],.03,vC(0xb8a888),'vRope');}
 vnWaterButt(-1.6,0,-4.6,.38,1.0);vnBarrel(-2.0,0,-2.6,.35,.85,wood);vnCrate(-.9,0,-2.0,.7,.3,wood);vnFolk(0,1.6,2,1.4);}

VERN.def({key:'vern_farmhouse',name:'Farmhouse',family:'farm',tags:{type:['farm','single-family dwelling'],wealth:'middle',lit:false,role:'farmer',job:'farming'},w:24,d:20,h:9,build:buildVernFarmhouse});
VERN.def({key:'vern_byre',name:'Byre and dairy',family:'farm',tags:{type:['farm'],wealth:'poor',lit:false,role:'dairyman',job:'herding'},w:22,d:16,h:7,build:buildVernByre});
VERN.def({key:'vern_pens',name:'Stock pens',family:'farm',tags:{type:['farm'],wealth:'poor',lit:false,role:'swineherd',job:'herding'},w:20,d:16,h:6,build:buildVernPens});
VERN.def({key:'vern_boatyard',name:'Boatwright\'s yard',family:'industry',tags:{type:['industry'],wealth:'middle',lit:false,role:'boatwright',job:'carpentry'},w:26,d:22,h:10,build:buildVernBoatyard});
VERN.def({key:'vern_fish_landing',name:'Fish landing and smokehouse',family:'industry',tags:{type:['industry'],wealth:'poor',lit:false,role:'fisher',job:'fishing'},w:18,d:16,h:6,build:buildVernFishLanding});
