// ================================================================= XANADU — farms and mills (package X-C)
// What feeds the valley: terraced barley fields stepping down a hillside behind rubble walls, the walled farmstead
// with its yaks, the stone granary on a plinth, the Persian vertical-axis windmill (asbad) — two thick earth walls
// funnel the wind onto a rotor of reed sails — and the horizontal-wheel watermill on its stone flume.
// Earth, rubble, raw timber; painted trim only on the farmstead; no electric light. Seeds 30600–30799.

// a barley plot: rows of standing stalks (thatch boxes) on a soil bed; cut = stubble
function xnXCBarley(x,y,z,w,d,ry,cut){const soil=xC(0x7a6242),th=xC(xPick(VPAL.thatch));vB('xEarthB',x,y,z,w,.06,d,ry,soil);
 const n=Math.max(2,Math.round(w/.8));for(let i=0;i<n;i++){const p=loc(x,z,-w/2+.4+i*(w-.8)/(n-1),0,ry);vB('vThatchB',p[0],y+.06,p[1],.45,cut?.14:rr(.8,1.0),d-.6,ry,th.clone().multiplyScalar(cut?.8:rr(.9,1.1)));}}
// a stone-lined irrigation ditch from a to b (local [x,z]) at height y
function xnXCDitch(a,b,y){xnChannel(a,b,.6,xC(xPick(XPAL.rubble)),y);}

// ---------------------------------------------------------------- the terraced farm: four terraces down a slope
function buildXaFarm(G,o){reseed(30601+(o.v|0));const T=[[-13.5,9,3.0,50],[-4,9,2.2,46],[5,8,1.5,42],[13,7,0,38]];   // [z, depth, height, width]
 const rub=xC(xPick(XPAL.rubble)),aged=xC(xPick(XPAL.aged));
 vnReg('Terraced fields',0,0,26,6);vnReg('Terraced fields — threshing floor',18,13,4,2);
 let yTop=0;for(const t of T)yTop=Math.max(yTop,t[2]);
 // the terraces: each a retaining wall of rubble holding an earth shelf; the highest at the back
 for(let i=0;i<T.length;i++){const [z,d,h,w]=T[i];if(h>0)xnTerrace(0,0,z,w,d,0,h,rub);
  const y=h;const cut=i===3;for(const s of[-1,1])xnXCBarley(s*(w/4-.5),y,z,w/2-2.4,d-1.6,0,cut);   // two plots per terrace with a path between
  // the path along the front edge, the ditch along the back (uphill) edge, a stair down to the next terrace
  vB('xEarthB',0,y-.01,z+d/2-.55,w-1,.08,.9,0,xC(0x9a8462));
  xnXCDitch([-w/2+.5,z-d/2+.5],[w/2-.5,z-d/2+.5],y);
  if(i<T.length-1){const h2=T[i+1][2],rise=h-h2,run=Math.max(2,Math.round(rise/.17))*.34;xnFlight(-w/2+3,h2,z+d/2+run+.01,0,1.4,rise,'vStone',rub);}}
 // a raised channel feeding the top terrace from the back, a sluice gate
 xnXCDitch([-8,-19],[8,-19],3);for(const s of[-1,1])vPst('vPost',s*.6,3,-19,.08,1.6,aged);vB('vWood',0,3.3,-19,1.0,.9,.08,0,aged);
 // the threshing floor at the bottom corner, a stone roller, stooks and a hay stack, yaks at work
 vPst('xDiscS',18,0,13,3.6,.15,rub);kput('vPostS',[17.4,.5,13.4],qEuler(0,.4,Math.PI/2),[.45,1.6,.45],rub);vBeam([17.4,.5,13.4],[19.6,.9,12.4],.08,aged);xnYak(20.4,12,-.4);
 for(let k=0;k<5;k++){const x=-16+k*3.4,z=15.5;kput('vConeT',[x,0,z],null,[.7,1.4,.7],xC(xPick(VPAL.thatch)));}
 kput('xPaintBall',[-6,4.1,-14],null,[1.6,1.2,1.6],xC(xPick(VPAL.thatch)));kput('vConeT',[-6,4.4,-14],null,[1.7,1.6,1.7],xC(xPick(VPAL.thatch)));
 xnYak(8,-13,2.2,3);xnShrine(-21,3,-16,.7);xnPennants([-21,6.2,-16],[-16,4.5,-19],7);vPst('vPost',-16,3,-19,.05,1.5,aged);
 xnFolk(-2,3,-13,2,3);xnFolk(10,1.5,4,2,2.5);vnFolk(0,16,1,1);}
// ---------------------------------------------------------------- the farmstead: house, yard wall, byre, hay on the roofs
function buildXaFarmhouse(G,o){reseed(30611+(o.v|0));const YW=24,YD=20,HX=-5,HZ=-4,W=11,D=8;
 const earth=xC(xPick(XPAL.earth)),wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),aged=xC(xPick(XPAL.aged)),rub=xC(xPick(XPAL.rubble)),tim=xC(xPick(XPAL.timber));
 vnReg('Farmstead — house',HX,HZ,7.5,9.5);vnReg('Farmstead — yard',4,5,8,3);vnReg('Farmstead — byre',7,-6,5,4);
 // the yard wall: earth with a stone base, the gate on the front with a timber lintel and a pennant pole
 const wallSeg=(x,z,w,d)=>{vB('xRubB',x,0,z,w,.5,d,0,rub);vB('xEarthB',x,.5,z,w,1.9,d,0,earth);vB('vThatchB',x,2.4,z,w+.16,.16,d+.16,0,xC(xPick(VPAL.thatch)));};
 wallSeg(0,-YD/2,YW,.6);for(const s of[-1,1])wallSeg(s*YW/2,0,.6,YD);wallSeg(-YW/4-1.5,YD/2,YW/2-3,.6);wallSeg(YW/4+1.5,YD/2,YW/2-3,.6);
 for(const s of[-1,1])vB('xRubB',s*3,0,YD/2,.9,3.0,.9,0,rub);vB('vWood',0,2.9,YD/2,7.2,.3,.6,0,tim);kput('xValance',[0,2.8,YD/2+.32],null,[5.4,.5,1],xC(XPAL.white));
 kput('vWood',[-1.6,1.2,YD/2-.1],qEuler(0,.5,0),[2.4,2.4,.08],aged);
 // the house: rubble base, whitewashed lower storey, earth upper storey, the family's window row, hay on the roof
 vB('xRubB',HX,0,HZ,W+.3,.6,D+.3,0,rub);const S=xnStack(HX,.6,HZ,W,D,0,[2.9,2.7],wash,'wash',xC(0x5a4a3a));
 vB('xEarthB',HX,3.5,HZ,S.w+.02,2.6,S.d+.02,0,earth);
 vnDoor(HX+1.5,.6,HZ+D/2,0,1.5,2,'vWood',aged,aged,true);vnWin(HX-2.5,1.8,HZ+D/2,0,.5,.5,'open','xPaint',trim);
 for(const u of[-3.6,-1.2,1.2,3.6])xnTibWin(HX+u,4.3,HZ+D/2-.2,0,.75,.95,'glass',trim,{valC:xC(XPAL.white)});
 xnTibWin(HX-W/2+.14,4.3,HZ+1,-Math.PI/2,.7,.9,'shut',trim,{noVal:true});
 const top=xnFlatRoof(HX,6.2,HZ,S.w,S.d,0,earth,{parapet:.7,corner:'flag'});xnFodder(HX,top-.65,HZ-S.d/2+.35,S.w-1.4,0);xnFodder(HX-S.w/2+.35,top-.65,HZ,.6,0);
 xnFlight(HX+W/2+.8,.6,HZ+3.6+3.4,0,1.2,2.9,'vStone',rub);vB('vWood',HX+W/2+.8,3.3,HZ+2.2,1.6,.2,2.4,0,aged);vnDoor(HX+W/2-.2,3.5,HZ+2.2,Math.PI/2,.9,1.8,'vWood',aged,aged,false);
 // the byre against the east wall: rubble, a shed roof of poles and earth, a rack of fodder
 vB('xRubB',7,0,-6,9,2.2,5,0,rub);vnShedRoof(7,2.2,-6,9.4,5.4,.5,0,'xEarthB',earth,.35,.3);for(let k=0;k<7;k++)beam('vWood',[3.2+k*1.2,2.6,-8.9],[3.2+k*1.2,2.15,-3.1],.1,.1,aged);
 vB('vDarkB',5,0,-3.5,1.6,1.8,.04,0);vB('vDarkB',9,0,-3.5,1.6,1.8,.04,0);vB('vWood',7,0,-2.6,8,.9,.08,0,aged);
 // the yard: dung cakes drying on the wall, a hay stack, the well, yaks, sacks, a cart
 for(let k=0;k<14;k++)kput('xDisc',[-YW/2+.36,1.2+(k%2)*.5,-8+k*1.2],qEuler(0,0,Math.PI/2),[.3,.06,.3],xC(0x5a4a34));
 kput('xPaintBall',[8,1.2,4],null,[2,1.4,2],xC(xPick(VPAL.thatch)));kput('vConeT',[8,1.6,4],null,[2.1,1.8,2.1],xC(xPick(VPAL.thatch)));vPst('vPost',8,3,4,.05,.8,aged);
 vPst('vPostS',-8,0,5,.8,.8,rub);vB('vDarkB',-8,.8,5,1,.03,1,0);for(const s of[-1,1])vPst('vPost',-8+s*.9,0,5,.07,2.4,aged);vB('vWood',-8,2.4,5,2,.1,.1,0,aged);
 xnYak(1,0,.8);xnYak(4,-1.5,2.4);vnSacks(-1,0,6,4);vnPlanter(-YW/2+1.4,0,7,2.2,.6,0,aged);
 xnPennants([HX+S.w/2-.3,top+2.4,HZ+S.d/2-.3],[YW/2-.6,3.2,YD/2-.6],10);vPst('vPost',HX+S.w/2-.3,top-.7,HZ+S.d/2-.3,.05,3.2,aged);
 vnFolk(0,YD/2+2.6,2,1.5);vnFolk(2,3,2,2);}
// ---------------------------------------------------------------- the granary: a stone store on a plinth, slit vents, a ladder
function buildXaGranary(G,o){reseed(30621+(o.v|0));const W=7,D=9,P=1.4,H=4.2;
 const rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),wash=xC(xPick(XPAL.wash)),aged=xC(xPick(XPAL.aged)),trim=xC(xPick([XPAL.red,XPAL.blue]));
 vnReg('Granary',0,0,6.5,P+H+2);
 xnWall(0,0,0,W+1,P,D+1,0,rub,'stone');vB('vStone',0,P-.14,0,W+1.3,.14,D+1.3,0,stone);
 const S=xnStack(0,P,0,W,D,0,[H],wash,'wash');
 for(const s of[-1,1])for(const z of[-3,-1,1,3])vB('vDarkB',s*(W/2*.99),P+1.2,z,.06,1.0,.22,0);
 for(const z of[-2.6,-.8,1,2.8])for(const s of[-1,1])vB('xPaint',s*(W/2*.99+.02),P+2.4,z,.06,.5,.5,0,trim);           // painted marks over the vents
 vnDoor(0,P,D/2*.99,0,1.1,1.9,'vWood',aged,aged,false);vB('vWood',0,P+2.1,D/2*.99+.15,1.9,.16,.3,0,aged);xnCorbels(0,P+2.1,D/2*.99,0,1.5,3,aged,.5);
 vB('xPaint',0,P+2.4,D/2*.99+.04,1.4,.6,.06,0,trim);xnRoundel(0,P+2.7,D/2*.99+.06,0,.5);
 vnLadder(0,0,D/2+1.2,0,P+.4,aged);vnLadder(-W/2*.96-.3,P,-1,-Math.PI/2,H+.5,aged);
 const top=xnFlatRoof(0,P+H,0,S.w,S.d,0,wash,{parapet:.55,corner:'pinnacle'});
 for(const s of[-1,1])xnFodder(s*(S.w/2-.5),top-.5,0,.6,0);
 vnSacks(-3.5,0,D/2+2,5);vnSacks(3,0,D/2+1.6,3);kput('vThatchB',[4.5,.5,-1],qEuler(0,.3,0),[2.4,1,1.8],xC(xPick(VPAL.thatch)));
 for(let k=0;k<4;k++)vPst('vClayPot',-5.5,0,-3+k*1.4,.5,.8,xC(0x9a5a38));vnFolk(1,D/2+4,2,1.2);}
// ---------------------------------------------------------------- the windmill (asbad): a vertical rotor between two funnel walls
function buildXaWindmill(G,o){reseed(30631+(o.v|0));const PW=10,PD=8,PH=4.2,WH=7.5;
 const earth=xC(xPick(XPAL.earth)),rub=xC(xPick(XPAL.rubble)),aged=xC(xPick(XPAL.aged)),reed=xC(xPick(VPAL.thatch));
 vnReg('Windmill (asbad)',0,0,7.5,PH+WH+1.5);
 // the mill room below: an earth block with the door and the meal room; the millstone floor at PH
 xnWall(0,0,0,PW,PH,PD,0,earth,'earth');vB('xRubB',0,0,0,PW+.4,.5,PD+.4,0,rub);
 vnDoor(-2.4,.5,PD/2,0,1.1,2,'vWood',aged,aged,true);vnWin(2.6,1.8,PD/2,0,.6,.6,'open','xPaint',aged);vnLadder(PW/2+.3,0,-1.5,Math.PI/2,PH+.4,aged);
 // the wind chamber: two thick earth walls with the slot between them open to the valley wind (+z), a lighter
 // wall closing the back, the rotor in the slot
 const gap=2.6,tw=(PW-gap)/2;for(const s of[-1,1])xnWall(s*(gap/2+tw/2),PH,0,tw,WH,PD*.9,0,earth,'earth');
 vB('xEarthB',0,PH,-PD*.45+.2,gap+.4,WH*.55,.5,0,earth);
 // the rotor: a vertical shaft on the millstone, eight arms with reed-mat sails, a top bearing beam
 {const cx=0,cz=.6,R=2.0;vPst('vPostB',cx,PH-.6,cz,.2,WH+.5,aged);vB('vWood',cx,PH+WH-.3,cz,gap+.8,.3,.3,0,aged);
  for(let k=0;k<8;k++){const a=k/8*TAU+.3,dx=Math.sin(a),dz=Math.cos(a);for(const yy of[PH+.8,PH+WH-1.2])beam('vWood',[cx,yy,cz],[cx+dx*R,yy,cz+dz*R],.08,.08,aged);
   const mx=cx+dx*R*.55,mz=cz+dz*R*.55;kput('vThatchB',[mx,PH+WH/2-.2,mz],qEuler(0,a,0),[.06,WH-2.4,R*.85],reed.clone().multiplyScalar(rr(.85,1.05)));}}
 vB('vWood',0,PH+WH,0,PW+.6,.24,PD*.9+.6,0,aged);for(let k=0;k<6;k++)kput('vRock',[rr(-4,4),PH+WH+.3,rr(-3,3)],qEuler(rng(),rng(),0),[.3,.2,.3],rub);
 // the meal: sacks, a cart, a low wall round the yard
 vnSacks(3,0,PD/2+2,5);vnSacks(-4,0,PD/2+3,3);vnFence(0,0,0,PW+8,PD+8,0,aged,3,1);vnFolk(0,PD/2+4,2,1.5);}
// ---------------------------------------------------------------- the watermill: a horizontal wheel under a stone mill on its flume
function buildXaWatermill(G,o){reseed(30641+(o.v|0));const W=7,D=8,P=2.4,H=3.2;
 const rub=xC(xPick(XPAL.rubble)),wash=xC(xPick(XPAL.wash)),aged=xC(xPick(XPAL.aged)),trim=xC(xPick(XPAL.trim)),water=xC(XPAL.water),earth=xC(xPick(XPAL.earth));
 vnReg('Watermill',0,0,7,P+H+2);vnReg('Watermill — flume',-3,-9,3,5);
 // the stream: a stone-lined channel running -z to +z under the mill, the tail race spilling out in front
 for(const s of[-1,1])vB('xRubB',s*1.6,0,-2,.6,.9,26,0,rub);vB('xWaterB',0,0,-2,2.6,.3,26,0,water);
 for(let k=0;k<10;k++)vBall('vBallW',rr(-1,1),.3,rr(1,8),rr(.1,.25),xC(0xe8eef0),.04);
 // the flume: an inclined stone chute from a raised head-race on piers to the wheel pit under the mill
 for(let k=0;k<3;k++)vB('xRubB',-3,0,-14+k*2.6,1.2,4.6-k*1.0,1,0,rub);kput('xRubB',[-2.2,3.2,-9.5],qEuler(.5,0,0),[1.4,.5,7.5],rub);
 kput('xWaterB',[-2.2,3.4,-9.5],qEuler(.5,0,0),[1.0,.15,7.2],water);xnXCDitch([-3,-20],[-3,-13]);
 // the wheel pit and the horizontal wheel: an open stone undercroft across the stream, paddles on a vertical shaft
 for(const s of[-1,1])vB('xRubB',s*(W/2-.4),0,0,.8,P,D,0,rub);vB('xRubB',0,0,-D/2+.4,W,P,.8,0,rub);
 {const R=1.3;vPst('vPostB',0,.2,-1,.16,P+H+.4,aged);for(let k=0;k<10;k++){const a=k/10*TAU;kput('vWood',[Math.sin(a)*R*.55,.7,-1+Math.cos(a)*R*.55],qEuler(0,a+.5,0),[.06,.5,R*.7],aged);}
  vBeam([0,.45,-1],[Math.sin(0)*R,.45,-1+R],.05,aged);}
 // the mill house on top: whitewash, a painted door, the meal window, a flat roof with hay
 const S=xnStack(0,P,0,W,H,D,0,[H],wash,'wash');vB('vStone',0,P-.14,0,W+.3,.14,D+.3,0,xC(xPick(XPAL.stone)));
 vnDoor(1.5,P,D/2*.99,0,1.1,2,'vWood',aged,aged,false);xnTibWin(-1.8,P+1.1,D/2*.99-.05,0,.7,.9,'shut',trim);
 vnWin(-W/2*.99,P+1.2,1.5,-Math.PI/2,.6,.7,'open','xPaint',trim);
 const top=xnFlatRoof(0,P+H,0,S.w,S.d,0,wash,{parapet:.55,corner:'flag'});xnFodder(0,top-.5,-S.d/2+.3,S.w-1,0);
 // the stair and the yard: a footbridge over the tail race, millstones, sacks
 xnFlight(W/2+1.2,0,D/2-.4,0,1.2,P,'vStone',rub);
 vB('vWood',0,1.0,7,4.2,.14,1.2,0,aged);for(const s of[-1,1])beam('vWood',[-2.1,1.9,7+s*.55],[2.1,1.9,7+s*.55],.06,.06,aged);
 for(let k=0;k<2;k++)kput('vPostS',[W/2+2.6,.4,-2+k*1.6],qEuler(0,0,Math.PI/2+.1),[.8,.28,.8],xC(0xb0aaa0));
 vnSacks(3.6,0,5.6,4);xnTree(-6,4,4.5);vnFolk(4,7.5,2,1.2);}

const XTAG_FARM=(wealth,more)=>({type:['farm'].concat(more||[]),wealth,lit:false});
XA.def({key:'xa_farm',name:'Terraced fields',family:'Farms and mills',tags:XTAG_FARM('poor'),w:56,d:44,h:6,fw:48,fd:40,build:buildXaFarm});
XA.def({key:'xa_farmhouse',name:'Farmstead',family:'Farms and mills',tags:XTAG_FARM('poor',['single-family dwelling']),w:30,d:26,h:10,fw:24,fd:20,build:buildXaFarmhouse});
XA.def({key:'xa_granary',name:'Granary',family:'Farms and mills',tags:XTAG_FARM('middle'),w:16,d:16,h:8,build:buildXaGranary});
XA.def({key:'xa_windmill',name:'Windmill (asbad)',family:'Farms and mills',tags:XTAG_FARM('middle',['industry']),w:20,d:20,h:13,build:buildXaWindmill});
XA.def({key:'xa_watermill',name:'Watermill',family:'Farms and mills',tags:XTAG_FARM('middle',['industry']),w:20,d:30,h:9,build:buildXaWatermill});
