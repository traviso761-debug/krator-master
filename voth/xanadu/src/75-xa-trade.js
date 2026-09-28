// ================================================================= XANADU — trade (package X-B)
// The bazaar row of shops under pointed arches with the shopkeepers' rooms in a cumba above; the dyer's and
// potter's workshop round a yard of vats, kilns and drying cloth; the scrap smithy — the Iziz note in the valley —
// a stone forge house under salvaged sheet, the forge glowing, scrap heaped in the yard. No electric light.
// Seeds 30400–30599.

// a stall of goods on a stone counter in front of a shop arch: bolts of cloth | pots | fruit | metalware
function xnXBGoods(x,z,ry,kind){const P=(u,v)=>loc(x,z,u,v,ry);vB('vStone',x,0,z,2.4,.8,.9,ry,xC(xPick(XPAL.stone)));
 for(let k=0;k<5;k++){const p=P(-1+k*.5,0);
  if(kind==='cloth')kput('xPaint',[p[0],.95,p[1]],qEuler(0,ry,0),[.4,.3,.8],xC(xPick(XPAL.cloth)));
  else if(kind==='pots')vPst('vClayPot',p[0],.8,p[1],.16,rr(.3,.5),xC(xPick([0x9a5a38,0xb87050,0x2aa5a0])));
  else if(kind==='fruit')kput('xPaintBall',[p[0],.95,p[1]],null,[.2,.16,.2],xC(xPick([0xe8a030,0xd04a4a,0x8a3a5a,0xe8d060])));
  else kput('xGoldB',[p[0],.85,p[1]],qEuler(0,ry+rng(),0),[.3,.12,.3],xC(xPick([0xd4a030,0xb8b0a0,0x8a6a48])));}}

// ---------------------------------------------------------------- the bazaar row: three shops under arches, rooms above in a cumba
function buildXaShops(G,o){reseed(30401+(o.v|0));const W=15.6,D=8,H1=3.4,H2=2.9,N=3;
 const wash=xC(xPick(XPAL.wash)),ochre=xC(xPick(XPAL.ochre)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),stone=xC(xPick(XPAL.stone));
 vnReg('Bazaar row (shops)',0,0,9.5,H1+H2+2.5);
 xnWall(0,0,0,W,H1,D,0,ochre,'wash');vB('vStone',0,0,0,W+.3,.4,D+.3,0,stone);
 const bw=(W-.8)/N;for(let i=0;i<N;i++){const x=-(W-.8)/2+bw*(i+.5);xnArch('xArchS',x,.4,D/2*.985,0,bw-.3,H1-.5,.6,stone,{});
  vnAwning(x,H1-.55,D/2+.28,0,bw-.9,1.7,xC(xPick(XPAL.cloth)));xnXBGoods(x,D/2+1.3,0,['cloth','pots','fruit'][i]);
  xnMural('xMosB',x,H1-.45,D/2*.985-.02,0,1.6,.5);}
 // the rooms above: one long cumba the width of the row, shutters on the backs
 // the rooms above: the storey is set back and one long cumba the width of the row hangs out over the arches
 const S=xnStack(0,H1,-1.3,W,D-2.6,0,[H2],wash,'wash');
 xnCumba(0,H1+.15,D/2-2.6,0,W-1.4,H2,1.5,{c:wash,beamC:tim,winC:trim,n:7,valC:xC(xPick(XPAL.cloth))});for(const z of[-2.4,.6])for(const s of[-1,1])xnTibWin(s*(W/2-.14),H1+.9,z,s*Math.PI/2,.8,1.1,'shut',trim,{noVal:true});
 for(const u of[-5,-2,1,4])vnWin(u,H1+.9,-D/2,Math.PI,.8,1.0,'shut','xPaint',trim);
 const top=xnFlatRoof(0,H1+H2,-1.3,S.w,S.d,0,wash,{eave:true,eaveC:tim,parapet:.6,corner:'flag'});
 xnPennants([-S.w/2+.3,top+.3,S.d/2-1.6],[S.w/2-.3,top+.3,S.d/2-1.6],14);
 for(let k=0;k<3;k++)vPst('vClayPot',-W/2-.8,0,-2+k*1.2,.3,.6,xC(0x9a5a38));vnBarrel(W/2+.8,0,-1,.35,.9,tim);vnFolk(0,D/2+3.5,5,4);}
// ---------------------------------------------------------------- the workshop: dyer and potter round a yard
function buildXaWorkshop(G,o){reseed(30411+(o.v|0));const W=10,D=7,X=-4,Z=-4;
 const earth=xC(xPick(XPAL.earth)),wash=xC(xPick(XPAL.wash)),trim=xC(xPick(XPAL.trim)),tim=xC(xPick(XPAL.timber)),stone=xC(xPick(XPAL.stone)),rub=xC(xPick(XPAL.rubble));
 vnReg('Workshop (dyer and potter)',X,Z,7,8.5);vnReg('Workshop — yard',3,3,6,3);
 // the house: two earth storeys, a workroom open to the yard under a shed roof on posts
 const S=xnStack(X,0,Z,W,D,0,[3,2.6],earth,'earth',xC(0x5a4a3a));
 vnDoor(X+2,0,Z+D/2,0,1.1,2,'vWood',tim,tim,true);xnTibWin(X-2,1,Z+D/2-.04,0,.8,.9,'open',trim,{noVal:true});
 for(const u of[-3,0,3])xnTibWin(X+u,3.9,Z+D/2-.2,0,.8,1,'shut',trim);
 xnFlatRoof(X,5.6,Z,S.w,S.d,0,earth,{parapet:.6,corner:'flag'});
 // the open workroom on the +x side: posts, a shed roof, the potter's wheel and the shelves of pots
 for(const z of[-6.5,-3.5,-.5])vPst('vPost',6,0,z,.12,2.8,tim);vnShedRoof(3.6,2.8,-3.5,5,6.4,.6,-Math.PI/2,'vShingleB',xC(0x9a8a78),.4);
 vB('vWood',3,0,-6.4,4,1.6,.4,0,tim);for(let k=0;k<8;k++)vPst('vClayPot',1.4+k*.45,1.6,-6.4,.14,rr(.25,.45),xC(xPick([0x9a5a38,0xb87050,0x2aa5a0,0xe8d0b0])));
 vPst('vBarrel',4.5,0,-2.5,.3,.5,tim);vPst('xDiscS',4.5,.6,-2.5,.42,.06,stone);vnFolk(4.6,-1.2,1,.1);
 // the yard: dye vats, a kiln, drying racks hung with coloured cloth, a well
 xnPave(2,3,12,8,0,stone,2.2);
 for(let k=0;k<3;k++){vPst('vClayPot',-3+k*1.6,0,4.5,.55,.8,xC(0x8a5a40));kput('xDisc',[-3+k*1.6,.78,4.5],null,[.46,.06,.46],xC(xPick([XPAL.lapis,XPAL.red,XPAL.saffron])));}
 {const kx=7,kz=5;vB('xRubB',kx,0,kz,2.6,1.4,2.6,0,rub);kput('xDomeS',[kx,1.4,kz],null,[1.3,1.3,1.3],rub);vB('vDarkB',kx,.3,kz+1.3,.8,.7,.06,0);vBall('vEmber',kx,.6,kz+1.2,.24,null,.14);vnChimney(kx,2.6,kz-.5,1.4,.14,true);}
 for(const z of[1.4,8])vnDryingRack(1,0,z,0,7);for(let k=0;k<6;k++)kput('vCloth',[-2+k*1.2,1.5,1.4],null,[.7,1.1,1],xC(xPick(XPAL.cloth)));for(let k=0;k<6;k++)kput('vCloth',[-2+k*1.2,1.5,8],null,[.7,1.1,1],xC(xPick(XPAL.cloth)));
 vPst('vPostS',-6,0,4,.7,.8,rub);vB('vDarkB',-6,.8,4,.9,.03,.9,0);vnCrate(6.5,0,1,.8,.3);vnFolk(2,6,2,1.5);}
// ---------------------------------------------------------------- the scrap smithy
function buildXaSmithy(G,o){reseed(30421+(o.v|0));const W=9,D=7,H=3.2;
 const rub=xC(xPick(XPAL.rubble)),earth=xC(xPick(XPAL.earth)),aged=xC(xPick(XPAL.aged)),iron=xC(0x2e2a26),trim=xC(XPAL.red);
 vnReg('Scrap smithy',0,0,7.5,H+4);vnReg('Scrap smithy — yard',6,3,4.5,2.5);
 // the forge house: rubble walls, the front open between two piers, a salvaged sheet roof on a timber ridge
 vB('xRubB',0,0,-D/2+.3,W,H,.6,0,rub);for(const s of[-1,1])vB('xRubB',s*(W/2-.3),0,0,.6,H,D,0,rub);for(const s of[-1,1])vB('xRubB',s*(W/2-1.1),0,D/2-.3,1.6,H,.6,0,rub);
 vB('vWood',0,H-.05,0,W+.6,.24,.3,0,aged);vnGableRoof(0,H+.2,0,W+.6,D+.6,1.6,0,'vCorr',null,.5,'vGableSt',rub);
 vnPatch(0,H+.2,D/2+1.3,0,W,1.4,2);kput('vPlate',[2,H+1.4,D/2+.5],qEuler(-.45,0,0),[1.8,1.4,1],null);
 // the forge, the chimney, the anvil, the bellows, tools
 vB('xRubB',-2.2,0,-1.2,2.4,1.1,2,0,rub);vB('vDarkB',-2.2,1.1,-1.2,1.6,.05,1.4,0);vBall('vEmber',-2.2,1.2,-1.2,.42,null,.2);vB('xRubB',-2.2,1.1,-2.3,1.2,H+2,1.2,0,rub);vnChimney(-2.2,H+3.1,-2.3,1.4,.2,true);
 vPst('vPostB',1.2,0,-.4,.3,.6,aged);vB('vIron',1.2,.6,-.4,.9,.28,.34,0,iron);vB('vIron',1.5,.66,-.4,.5,.16,.16,0,iron);
 vB('vWood',-.3,.5,-2.2,1.4,.6,.8,.2,aged);vBeam([.2,.8,-2.4],[-2,1.3,-1.6],.06,aged);
 vB('vWood',2.9,0,-2.4,.6,1,2.2,0,aged);for(let k=0;k<5;k++)vB('vIron',2.9,1+k*.02,-3.2+k*.4,.06,.9,.06,0,iron);
 vB('vWood',3.4,0,1.6,.9,.6,.9,0,aged);vB('xWaterB',3.4,.55,1.6,.7,.08,.7,0,xC(XPAL.water));
 // the yard: scrap heaps of sheet and plate, a pile of cut bar, a cart, pennants of rag
 const hx=6,hz=3;for(let k=0;k<9;k++){const a=h3(k,1,2),b=h3(k,3,4);kput(['vPlate','vSheet','vPlateW'][k%3],[hx+(a-.5)*3,.3+k*.06,hz+(b-.5)*2.4],qEuler(-Math.PI/2+(a-.5)*.7,a*3,(b-.5)*.5),[rr(1,1.9),rr(.8,1.5),1],null);}
 vPst('vTankR',hx+1.6,0,hz-1.6,.4,1,null);vPst('vPipeR',hx-1.8,0,hz+1.4,.14,1.2,null);for(let k=0;k<6;k++)kput('vIron',[-4.2+k*.12,.06+k*.05,3.6],qEuler(0,.1*k,0),[.08,.08,2.6],iron);
 vnFence(0,0,.4,W+8,D+7,0,aged,3,1.1);xnPennants([-W/2,H+1.9,D/2+.3],[-W/2-4,2.4,D/2+4],7,[0x8a6a48,0xa8382a,0x8a7e70,0x6e2a2a]);vPst('vPost',-W/2-4,0,D/2+4,.06,2.4,aged);
 vnFolk(1,D/2+2.6,2,1.5);vnFolk(hx,hz+3,1,.5);}

XA.def({key:'xa_shops',name:'Bazaar row',family:'Trade',tags:{type:['market/shop','multi-family dwelling'],wealth:'middle',lit:false},w:22,d:16,h:9,build:buildXaShops});
XA.def({key:'xa_workshop',name:'Workshop',family:'Trade',tags:{type:['industry','market/shop'],wealth:'poor',lit:false},w:22,d:18,h:8,build:buildXaWorkshop});
XA.def({key:'xa_smithy',name:'Scrap smithy',family:'Trade',tags:{type:['industry'],wealth:'poor',lit:false},w:20,d:16,h:8,build:buildXaSmithy});
