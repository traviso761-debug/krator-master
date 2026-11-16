// ================================================================= QIBLAI — trades, guilds, civic (Q3; PLAN.md section 5)
// The trades of the outer square (the Xanadu kit's trades-table gaps: bakery, butcher, weaver and dyer, brewhouse, tannery,
// plus a shop row and a workshop yard), the guild halls of the kora square (the Goldsmiths', Masons' and Spicers' halls in
// the kora's colours: white, the maroon twig band, saffron trim; the Farmers', Miners' and Alchemists' lodges as one
// smaller hall in three dresses), and the civic pieces: a gate market (an arcaded square), the baths and the temple
// estates' granary. Every one a crisp cube or a court of cubes; no gilt (that is the holy buildings'). Seeds 33300-33499.

// ---------------------------------------------------------------- a shop front on a ground storey: a dark bay, a timber
// counter with its shutter propped up as an awning, the goods on the counter; (x,z) on the face, ry outward
function qnShopFront(x,y,z,ry,w,trim,goods){const p=loc(x,z,0,.04,ry);vB('vDarkB',p[0],y,p[1],w,1.9,.1,ry);
 for(const s of[-1,1]){const q=loc(x,z,s*(w/2+.1),.12,ry);vB('xPaint',q[0],y,q[1],.2,2.1,.24,ry,trim);}
 const l=loc(x,z,0,.16,ry);vB('vWood',l[0],y+2.05,l[1],w+.5,.2,.3,ry,xC(xPick(XPAL.timber)));
 const c=loc(x,z,0,.45,ry);vB('vWood',c[0],y,c[1],w,.85,.6,ry,xC(xPick(XPAL.timber)));
 const a=loc(x,z,0,.75,ry);kput('vWood',[a[0],y+2.25,a[1]],vQ(ry,-.5,0),[w+.2,.06,1.3],xC(xPick(XPAL.timber)));
 const g=goods||[XPAL.saffron,XPAL.red,XPAL.green,XPAL.white];for(let i=0;i<Math.max(2,Math.round(w/.7));i++){const u=-w/2+.35+i*.7;if(u>w/2-.2)break;const q=loc(x,z,u,.45,ry);vB('vClothB',q[0],y+.85,q[1],.42,.22,.36,ry,xC(xPick(g)));}}

// ---------------------------------------------------------------- the shop row (middle)
function buildQbShopRow(G,o){reseed(33301+(o.v|0));const V=xV(o),W=18,D=11,P=.5;
 const R=qnRingC('lay'),wall=R.wall,hs=[3.4,3.0,2.9];
 vnReg('Shop row',0,0,10,P+9.3+2);
 qnPlinth(0,0,W,D,P,0);const S=qnStack(0,P,0,W,D,0,hs,wall,'wash');
 for(const u of[-6,0,6])qnShopFront(u,P,D/2,0,3.2,R.trim);
 qnWins(0,P,0,W,D,0,hs,S.k,{pitch:2.4,ww:.85,wh:1.1,trim:R.trim,val:'all',from:1});
 for(const u of[-6,6])qnDoor(u+2.3,P,-D/2,Math.PI,1.0,2.0,{c:R.trim,val:false});
 const top=qnRoof(0,S.y,0,S.w,S.d,0,wall,{parapet:.75});
 const T=qnTerraces(V===1?-4:4,S.y+.3,0,0,[[6,4.4,2.5,2.2]],wall);qnDoor(V===1?-4:4,S.y+.3,T[0].z+2.2,0,.9,1.8,{c:R.trim,val:false,step:false});
 qnFlags([-S.w/2+.3,top,S.d/2-.3],[S.w/2-.3,top,S.d/2-.3],24);vnFolk(0,D/2+2.6,3,4);}

// ---------------------------------------------------------------- the workshop yard (poor): the shop, the yard wall, a lean-to
function buildQbWorkshop(G,o){reseed(33311+(o.v|0));const V=xV(o),W=10,D=8,P=.4;
 const R=qnRingC('lay'),wall=R.wall.clone().multiplyScalar(.93),aged=xC(xPick(XPAL.aged)),rub=xC(xPick(XPAL.rubble));
 vnReg('Workshop yard',0,0,8,8);
 vB('xRubB',0,0,-2,W,P,D,0,rub);const S=qnStack(0,P,-2,W,D,0,[3.2,2.7],wall,'wash',xC(0x6a5a4a));
 qnWins(0,P,-2,W,D,0,[3.2,2.7],S.k,{pitch:2.5,ww:.7,wh:.9,trim:R.trim,from:1});
 qnDoor(-2,P,D/2-2,0,1.8,2.2,{c:R.trim,leaf:aged,val:false});xnTibWin(2.2,P+.9,D/2-2,0,1.4,1.1,'open',R.trim,{noVal:true});
 qnRoof(0,S.y,-2,S.w,S.d,0,wall,{parapet:.6});
 // the yard in front: a low wall with a gate gap, the lean-to on posts, the bench, the stock
 for(const s of[-1,1]){vB('xWashB',s*(W/2-.15),0,4,.3,1.6,4,0,wall);vB('xWashB',s*(W/4+.6),0,6,W/2-1.6,1.6,.3,0,wall);}
 vB('vWood',-W/2+1.6,2.4,3.4,3,.12,3,0,aged);for(const z of[2.2,4.6])vPst('vPost',-W/2+3,0,z,.08,2.4,aged);
 vB('vWood',-W/2+1.6,0,3.4,2.4,.85,.8,0,aged);vnCrate(-W/2+1,0,5,.7);vnCrate(W/2-1.2,0,4.6,.6);
 if(V===1)vnSacks(2.6,0,3.4,4);else qnBarrel(2.8,3.6);}

// ---------------------------------------------------------------- the bakery: the bake house, the domed oven in the yard
function buildQbBakery(G,o){reseed(33321+(o.v|0));const V=xV(o),W=10,D=8,P=.4;
 const R=qnRingC('lay'),wall=R.wall,earth=xC(xPick(XPAL.earth)),stone=xC(xPick(QSTONE));
 vnReg('Bakery',0,0,7.5,8);
 qnPlinth(0,-2,W,D,P,0);const S=qnStack(0,P,-2,W,D,0,[3.3,2.8],wall,'wash');
 qnShopFront(-1.6,P,D/2-2,0,3.4,R.trim,[0xd8b070,0xc89850,0xe8c890]);qnDoor(3,P,D/2-2,0,1.0,2.0,{c:R.trim,val:false});
 qnWins(0,P,-2,W,D,0,[3.3,2.8],S.k,{pitch:2.4,ww:.75,wh:.95,trim:R.trim,from:1});
 qnRoof(0,S.y,-2,S.w,S.d,0,wall,{parapet:.6});
 // the oven: a whitewashed earth dome on a stone hearth, its mouth, its flue; wood stacked by it
 vB('vStone',-2.5,0,4.4,3.2,.7,3,0,stone);kput('xDomeW',[-2.5,.7,4.4],null,[1.3,1.5,1.3],earth);
 vB('vDarkB',-2.5,.85,5.72,.7,.55,.1,0);vPst('vPostS',-2.5,1.9,3.5,.14,1.6,stone);
 for(let i=0;i<4;i++)vB('vWood',.4,i*.22,4.6,1.6,.2,1.1,0,xC(xPick(XPAL.timber)));
 vPst('vPost',W/2-.4,S.y+.3,-2-S.d/2+.4,.05,1.6,xC(0x5a4632));if(V===2)vnSacks(2,0,4.4,5);}

// ---------------------------------------------------------------- the butcher's: the shop with its hanging rail
function buildQbButcher(G,o){reseed(33331+(o.v|0));const V=xV(o),W=8,D=9,P=.4;
 const R=qnRingC('lay'),wall=R.wall,red=xC(0x8a2a22);
 vnReg("Butcher's",0,0,6.2,8);
 qnPlinth(0,-1,W,D,P,0);const S=qnStack(0,P,-1,W,D,0,[3.2,2.8],wall,'wash');
 qnShopFront(-.8,P,D/2-1,0,4.2,R.trim,[0x8a2a22,0xa8382a,0xe8d8c8]);qnDoor(2.9,P,D/2-1,0,.95,2.0,{c:R.trim,val:false});
 // the rail under the shutter, the joints on hooks, the block, the salt tub
 const F=D/2-1;vB('vIron',-.8,P+1.9,F+1.1,4.4,.05,.05,0);for(let i=0;i<6;i++){const u=-2.6+i*.72;vB('xPaint',u,P+1.05,F+1.1,.24,.75,.2,0,red.clone().multiplyScalar(rr(.8,1.15)));}
 vB('vWood',-2.6,0,F+2.2,.9,.9,.9,0,xC(xPick(XPAL.timber)));qnBarrel(2.4,F+1.8);
 qnWins(0,P,-1,W,D,0,[3.2,2.8],S.k,{pitch:2.4,ww:.75,wh:.95,trim:R.trim,from:1});
 qnRoof(0,S.y,-1,S.w,S.d,0,wall,{parapet:.6,corner:V===1?'flag':null});}

// ---------------------------------------------------------------- the weaver's and dyer's: the loom hall, dyed cloth on the roof
function buildQbWeaver(G,o){reseed(33341+(o.v|0));const V=xV(o),W=16,D=9,P=.45;
 const R=qnRingC('lay'),wall=R.wall,aged=xC(xPick(XPAL.aged)),hs=[3.4,3.0];
 vnReg("Weaver's and dyer's",0,0,9,9.5);
 qnPlinth(0,-1,W,D,P,0);const S=qnStack(0,P,-1,W,D,0,hs,wall,'wash');
 // the loom floor wants light: a close grid of tall windows on the long faces
 qnWins(0,P,-1,W,D,0,hs,S.k,{pitch:1.9,ww:1.0,wh:1.5,trim:R.trim,skip:[[-1.2,1.2]],val:'all'});qnDoor(0,P,D/2-1,0,1.4,2.2,{c:R.trim});
 const top=qnRoof(0,S.y,-1,S.w,S.d,0,wall,{parapet:.7});
 // the drying frames on the roof, the cloth in the dyers' colours; the vats in the yard in front
 const cols=[XPAL.saffron,XPAL.red,XPAL.blue,0x6e2a2a,XPAL.turquoise,XPAL.green];
 for(const u of[-5,0,5]){for(const s of[-1,1])vPst('vPost',u+s*2,S.y+.3,-1,.05,2.6,aged);vB('vWood',u,S.y+2.85,-1,4.2,.08,.08,0,aged);
  for(let i=0;i<3;i++)kput('vCloth',[u-1.4+i*1.4,S.y+2.0,-1],qEuler(0,0,0),[1.2,1.7,1],xC(xPick(cols)));}
 for(let i=0;i<3;i++){const x=-4+i*4;kput('xDrumS',[x,0,D/2+1.4],null,[.8,.8,.8],xC(xPick(QSTONE)));kput('xDisc',[x,.78,D/2+1.4],null,[.7,.04,.7],xC(cols[(i+V)%cols.length]));}}

// ---------------------------------------------------------------- the brewhouse: the malting floor, the vats, the barrels
function buildQbBrewhouse(G,o){reseed(33351+(o.v|0));const V=xV(o),W=14,D=11,P=.45;
 const R=qnRingC('lay'),wall=R.wall,dark=xC(xPick(XPAL.dark)),hs=[3.8,3.0];
 vnReg('Brewhouse',0,0,9,10.5);
 qnPlinth(0,-1,W,D,P,0);const S=qnStack(0,P,-1,W,D,0,hs,wall,'wash');
 qnWins(0,P,-1,W,D,0,hs,S.k,{pitch:2.6,ww:.8,wh:1.0,trim:R.trim,from:1});
 qnDoor(-3,P,D/2-1,0,2.2,2.6,{c:R.trim,leaf:dark,val:false});qnShopFront(3,P,D/2-1,0,3,R.trim,[0x8a5a2a,0xc8a060]);
 const top=qnRoof(0,S.y,-1,S.w,S.d,0,wall,{parapet:.7});
 // the kiln's louvred vent on the roof (a crisp cube with slats), barrels in front
 const k=qnCube(-3,S.y+.3,-2,3,2,3,0,wall,'wash');for(let i=0;i<4;i++)vB('vWood',-3,S.y+.7+i*.38,-.48,2.6,.08,.1,0,dark);
 qnRoof(-3,S.y+2.3,-2,3*k,3*k,0,wall,{parapet:.35});
 for(let i=0;i<(V===1?5:3);i++)qnBarrel(-5.6+i*1.1,D/2+.6);vnCrate(5.4,0,D/2+.8,.7);}

// ---------------------------------------------------------------- the tannery: the drying loft over the pits
function buildQbTannery(G,o){reseed(33361+(o.v|0));const V=xV(o),W=12,D=7,P=.4;
 const R=qnRingC('lay'),wall=R.wall.clone().multiplyScalar(.9),stone=xC(xPick(QSTONE)),aged=xC(xPick(XPAL.aged));
 vnReg('Tannery',0,0,10,8);
 vB('xRubB',0,0,-4,W,P,D,0,xC(xPick(XPAL.rubble)));const S=qnStack(0,P,-4,W,D,0,[3.0,2.6],wall,'wash',xC(0x6a5a4a));
 // the drying loft: an open upper storey of posts under the roof, the hides hung in it
 qnWins(0,P,-4,W,D,0,[3.0,2.6],S.k,{pitch:2.6,ww:.7,wh:.85,trim:R.trim,top:1,skip:[[-1,1]]});qnDoor(0,P,D/2-4,0,1.6,2.1,{c:R.trim,leaf:aged,val:false});
 for(let i=0;i<5;i++)kput('vCloth',[-4+i*2,P+3.6,-4+S.d/2+.12],null,[1.3,1.6,1],xC(xPick([0xb08858,0x9a7048,0xc8a070])));
 qnRoof(0,S.y,-4,S.w,S.d,0,wall,{parapet:.5});
 // the pits in a grid in front: stone curbs, the liquor in lime, bark and dye
 const liq=[0xd8d0b8,0x6a4a2a,0x8a5a2a,0xa8382a,0x2a5aa8];
 for(let i=0;i<4;i++)for(let j=0;j<2;j++){const x=-4.5+i*3,z=1.6+j*2.6;vB('vStone',x,0,z,2.4,.45,2.0,0,stone);vB('xWaterB',x,.32,z,2.0,.1,1.6,0,xC(liq[(i+j*2+V)%liq.length]));}}

// ---------------------------------------------------------------- the guild halls (the kora square)
// a civic cube on a plinth in the kora's colours: the twig band and a frieze under the parapet, a painted portico, the
// guild's sign (a sun roundel over the door), a stepped roof hall. o: {W, D, hs, sign} — the halls differ by plan and trade.
function qnGuildHall(name,o,G,V){const W=o.W,D=o.D,P=1.0,hs=o.hs;
 const R=qnRingC('kora'),wall=R.wall,stone=xC(xPick(QSTONE)),dark=xC(xPick(XPAL.dark)),H=hs.reduce((a,b)=>a+b,0);
 vnReg(name,0,-1,Math.max(W,D)*.6,P+H+4);
 qnPlinth(0,-.2,W,D+1.6,P,0,stone);const ZB=-1,F=ZB+D/2;
 const S=qnStack(0,P,ZB,W,D,0,hs,wall,'wash');
 qnWins(0,P,ZB,W,D,0,hs,S.k,{pitch:2.6,ww:1.0,wh:1.35,trim:R.trim,val:'all',skip:[[-3,3]],skipUp:o.jharokha?[[-2,2]]:[]});
 xnPortico(0,P,F,0,6.4,1.6,3.4,wall,{band:true,valC:xC(XPAL.saffron)});qnDoor(0,P,F,0,1.8,2.6,{c:xC(XPAL.red),leaf:dark,val:false,step:false});
 xnFlight(0,0,F+1.6+Math.max(2,Math.round(P/.17))*.34,0,4.2,P,'vStone',stone);
 xnRoundel(0,P+hs[0]+.9,F-.1,0,1.3);if(o.jharokha)xnJharokha(0,P+hs[0]+1.8,F-.12,0,3.2,2.4,stone,{d:1.0,dome:false});
 const top=qnRoof(0,S.y,ZB,S.w,S.d,0,wall,{band:R.band,frieze:true,parapet:.8,corner:'flag'});
 const T=qnTerraces(0,S.y+.3,ZB,0,[[S.w*.5,S.d*.45,3.0,S.d*.2]],wall,{band:R.band});
 qnWins(0,S.y+.3,ZB+T[0].z,S.w*.5,S.d*.45,0,[3.0],.98,{pitch:2.5,ww:.85,wh:1.1,trim:R.trim,skip:[[-1,1]]});qnDoor(0,S.y+.3,ZB+T[0].z+S.d*.225,0,1.0,2.0,{c:R.trim,val:false,step:false});
 if(o.sign)o.sign(S,top,T,F);
 if(xLit())for(const s of[-1,1])vnLamp(s*2.6,P+2.8,F,0);
 return{S,top,T,F,R};}
function buildQbGuildGold(G,o){reseed(33401+(o.v|0));const V=xV(o);
 qnGuildHall("Goldsmiths' Hall",{W:20,D:15,hs:[4.4,3.6,3.4],jharokha:true,sign:(S,top,T,F)=>{for(const s of[-1,1])qnBanner(s*(S.w/2-1.2),top,F-1.4,2.2);}},G,V);}
function buildQbGuildMason(G,o){reseed(33411+(o.v|0));const V=xV(o);
 const H=qnGuildHall("Masons' Hall",{W:22,D:14,hs:[4.4,3.6]},G,V);
 // the masons' yard beside the hall: blocks squared and rough, a bench
 const st=xC(xPick(QSTONE));for(let i=0;i<5;i++)vB('vStone',-10+i*1.6,0,8.2,1.3,rr(.5,1.0),1.1,rr(-.2,.2),st.clone().multiplyScalar(rr(.9,1.06)));
 vB('vWood',6,0,8.2,3,.8,.9,0,xC(xPick(XPAL.timber)));}
function buildQbGuildSpice(G,o){reseed(33421+(o.v|0));const V=xV(o);
 const H=qnGuildHall("Spicers' Hall",{W:18,D:14,hs:[4.2,3.4,3.2]},G,V);
 // the spice stalls under the portico's wings, sacks in saffron, red and turmeric
 for(const s of[-1,1]){qnShopFront(s*6,1.0,H.F,0,3.2,xC(XPAL.saffron),[XPAL.saffron,0xc84a1a,0xe0b040,0x6a8a2a,0x8a3a1a]);}}
function buildQbGuildLodge(G,o){reseed(33431+(o.v|0));const V=xV(o);
 // three dresses of one lodge: the Farmers' (sheaves at the door), the Miners' (ore carts), the Alchemists' (a still)
 const H=qnGuildHall(["Farmers' Lodge","Miners' Lodge","Alchemists' Lodge"][V%3],{W:14,D:12,hs:[4.0,3.4]},G,V);
 if(V===0)for(const s of[-1,1])kput('vThatchB',[s*5,.6,H.F+1.6],null,[.9,1.2,.9],xC(xPick(VPAL.thatch)));
 else if(V===1)for(const s of[-1,1]){vB('vIron',s*5,0,H.F+1.8,1.4,.7,.9,0,xC(0x4a4440));vB('vStone',s*5,.7,H.F+1.8,1.2,.3,.7,0,xC(0x5a5048));}
 else{kput('xBulbG',[5,0,H.F+1.8],null,[.6,1.0,.6],xC(0xb87333));vPst('vPost',5,1.0,H.F+1.8,.06,1.0,xC(0xb87333));}}

// ---------------------------------------------------------------- the gate market (civic): an arcaded square
// four two-storey ranges round an open square, an arcade of square piers on the court side of each, the stalls under
// awnings in the square, a chorten in the middle; the gate through the front range on the axis.
function buildQbGateMarket(G,o){reseed(33441+(o.v|0));qnGateMarket(o,44,44);}
// the half market (Q7a): ring 2's axial blocks are halved by their 24 m avenue into ~36 m strips, a market on each, its
// front on the avenue; the same body on a 44 x 32 plan
function buildQbGateMarketHalf(G,o){reseed(33445+(o.v|0));qnGateMarket(o,44,32);}
function qnGateMarket(o,W,D){const V=xV(o),Dr=6,P=.5,hs=[4.2,3.2];
 const R=qnRingC('kora'),wall=R.wall,stone=xC(xPick(QSTONE)),tim=xC(xPick(XPAL.timber));
 vnReg('Gate market',0,0,Math.max(W,D)*.6,P+7.4+3);
 qnPlinth(0,0,W,D,P,0,stone);
 const ranges=[[0,D/2-Dr/2,W,Dr,0],[0,-D/2+Dr/2,W,Dr,Math.PI],[W/2-Dr/2,0,D-2*Dr,Dr,Math.PI/2],[-W/2+Dr/2,0,D-2*Dr,Dr,-Math.PI/2]];
 for(const [x,z,L,dd,ry] of ranges){const S=qnStack(x,P,z,L,dd,ry,hs,wall,'wash');
  qnWins(x,P,z,L,dd,ry,hs,S.k,{pitch:3,ww:.9,wh:1.1,trim:R.trim,from:1,left:false,right:false,val:'all'});
  qnRoof(x,S.y,z,S.w,S.d,ry,wall,{band:R.band,frieze:true,parapet:.7});
  // the arcade on the court side: square piers, a timber lintel, the shops' dark bays behind
  const n=Math.max(3,Math.round((L-2*Dr)/3.6)),inner=ry+Math.PI;
  for(let i=0;i<=n;i++){const u=-(L-2*Dr)/2+(L-2*Dr)*i/n,p=loc(x,z,u,-dd/2-1.2,ry);vB('xWashB',p[0],P,p[1],.7,3.4,.7,ry,wall);}
  const lp=loc(x,z,0,-dd/2-1.2,ry);vB('vWood',lp[0],P+3.4,lp[1],L-2*Dr+.7,.35,.8,ry,tim);const rp=loc(x,z,0,-dd/2-.6,ry);vB('xWashB',rp[0],P+3.75,rp[1],L-2*Dr+.7,.3,2.2,ry,wall);
  for(let i=0;i<n;i++){const u=-(L-2*Dr)/2+(L-2*Dr)*(i+.5)/n;if(ry===0&&Math.abs(u)<2.5)continue;const p=loc(x,z,u,-dd/2+.02,ry);qnShopFront(p[0],P,p[1],inner,2.6,R.trim);}}
 // the gate through the front range, and the far one
 for(const [z,ry] of[[D/2,0],[-D/2,Math.PI]]){vB('vDarkB',0,P,z-Dr/2,3.6,3.6,Dr+.1,0);xnPortico(0,P,z,ry,6,1.4,4.0,wall,{band:true,valC:xC(XPAL.saffron)});}
 xnFlight(0,0,D/2+1.4+Math.max(2,Math.round(P/.17))*.34,0,5,P,'vStone',stone);
 // the square: paving, the stalls, the chorten on the axis
 qnPave(0,0,W-2*Dr-3,D-2*Dr-3,0,P);qnChorten(0,P,0,.8);
 for(let i=0;i<8;i++){const a=i*Math.PI/4+.39,r=Math.min(10,(Math.min(W,D)-2*Dr)/2-2.6);const x=Math.cos(a)*r,z=Math.sin(a)*r;vB('vWood',x,P,z,2,.85,1,a,tim);
  kput('vClothB',[x,P+2.2,z],qEuler(0,-a,0),[2.6,.06,1.8],xC(xPick(XPAL.cloth)));for(const s of[-1,1])vPst('vPost',x+s*.9,P,z,.05,2.2,tim);}
 vnFolk(0,D/2+3,6,6);xnFolk(0,P,-6,6,8);}

// ---------------------------------------------------------------- the baths (civic): the hot hall, the steam vents, the pool court
function buildQbBath(G,o){reseed(33451+(o.v|0));const V=xV(o),W=24,D=16,P=.6,hs=[4.6,3.0];
 const R=qnRingC('lay'),wall=R.wall,stone=xC(xPick(QSTONE)),dark=xC(xPick(XPAL.dark));
 vnReg('Baths',0,-3,14,P+7.6+3);
 qnPlinth(0,-3,W,D,P,0,stone);const S=qnStack(0,P,-3,W,D,0,hs,wall,'wash');
 qnWins(0,P,-3,W,D,0,hs,S.k,{pitch:3,ww:.7,wh:.8,trim:R.trim,from:1});
 qnDoor(0,P,D/2-3,0,1.8,2.6,{c:xC(XPAL.turquoise),leaf:dark});xnPortico(0,P,D/2-3,0,5.6,1.4,3.4,wall,{valC:xC(XPAL.turquoise)});
 const top=qnRoof(0,S.y,-3,S.w,S.d,0,wall,{parapet:.7});
 // the steam vents: a grid of crisp chimney cubes on the roof over the hot rooms
 for(let i=0;i<4;i++)for(let j=0;j<2;j++){const x=-7.5+i*5,z=-6+j*4;qnCube(x,S.y+.3,z,.9,1.6,.9,0,wall,'wash');vB('vDarkB',x,S.y+1.9,z,.6,.04,.6,0);}
 // the pool court in front: a stone basin, a low white wall with turquoise coping
 xnPool(0,P,D/2+1.8,10,3.2,0,stone);
 for(const s of[-1,1]){vB('xWashB',s*(W/2-.2),0,D/2+1.2,.4,1.4,4.6,0,wall);vB('xTilesB',s*(W/2-.2),1.4,D/2+1.2,.5,.12,4.7,0,xC(XPAL.turquoise));}}

// ---------------------------------------------------------------- the temple estates' granary (civic)
// a tall blank cube on a high plinth, vent slits in a strict grid, the loading door and its ramp, the keeper's room on top
function buildQbGranary(G,o){reseed(33461+(o.v|0));const V=xV(o),W=14,D=11,P=1.4,hs=[4,3.6,3.4];
 const R=qnRingC('clergy',o),wall=R.wall,stone=xC(xPick(QSTONE)),dark=xC(xPick(XPAL.dark));   /* o.sp: the sector's colour */
 vnReg('Temple granary',0,-1,9,P+11+3);
 qnPlinth(0,-1,W,D,P,0,stone);const S=qnStack(0,P,-1,W,D,0,hs,wall,'wash');
 // the vents: dark slits, no glazing (a store breathes), every storey, every face
 qnWins(0,P,-1,W,D,0,hs,S.k,{pitch:1.6,ww:.24,wh:.9,kind:'open',trim:xC(XPAL.black),skip:[[-1.6,1.6]]});
 qnDoor(0,P,D/2-1,0,2.2,2.6,{c:xC(XPAL.saffron),leaf:dark,val:false,step:false});
 // the ramp up the plinth for carts, inside the plot
 kput('vStone',[0,P/2,D/2+1.3],qEuler(Math.atan2(P,2.8),0,0),[3.2,.25,3.0],stone);
 const top=qnRoof(0,S.y,-1,S.w,S.d,0,wall,{band:R.band,parapet:.7,corner:'flag'});
 const T=qnTerraces(0,S.y+.3,-1,0,[[S.w*.4,S.d*.4,2.6,S.d*.15]],xC(xPick(XPAL.wash)));qnDoor(0,S.y+.3,-1+T[0].z+S.d*.2,0,.9,1.8,{c:R.trim,val:false,step:false});
 qnRoundel(0,P+hs[0]+1.2,D/2-1-.12,0,1.0);}
const qnRoundel=(x,y,z,ry,d)=>xnRoundel(x,y,z,ry,d);
const qnBarrel=(x,z)=>vnBarrel(x,0,z,.34,.9,xC(xPick(XPAL.timber)));

QB.def({key:'qb_shop_row',name:'Shop row',family:'Trades',tags:QTAG('middle',['market/shop','multi-family dwelling']),w:18,d:13,h:12,fw:18,fd:11,build:buildQbShopRow});
QB.def({key:'qb_workshop',name:'Workshop yard',family:'Trades',tags:QTAG('poor',['industry','market/shop'],{job:'carpentry'}),w:11,d:14,h:8,fw:10,fd:8,build:buildQbWorkshop});
QB.def({key:'qb_bakery',name:'Bakery',family:'Trades',tags:QTAG('middle',['market/shop'],{job:'baking'}),w:11,d:14,h:8,fw:10,fd:8,build:buildQbBakery});
QB.def({key:'qb_butcher',name:"Butcher's",family:'Trades',tags:QTAG('middle',['market/shop'],{job:'butchery'}),w:9,d:12,h:8,fw:8,fd:9,build:buildQbButcher});
QB.def({key:'qb_weaver',name:"Weaver's and dyer's",family:'Trades',tags:QTAG('middle',['industry','market/shop'],{job:'weaving'}),w:17,d:13,h:10,fw:16,fd:9,build:buildQbWeaver});
QB.def({key:'qb_brewhouse',name:'Brewhouse',family:'Trades',tags:QTAG('middle',['industry'],{job:'brewing'}),w:15,d:14,h:10,fw:14,fd:11,build:buildQbBrewhouse});
QB.def({key:'qb_tannery',name:'Tannery',family:'Trades',tags:QTAG('poor',['industry'],{job:'tanning'}),w:13,d:16,h:8,fw:12,fd:7,build:buildQbTannery});
QB.def({key:'qb_guild_gold',name:"Goldsmiths' Hall",family:'Guilds',tags:QTAG('civic',['civic','market/shop']),w:20,d:20,h:20,fw:20,fd:16.6,build:buildQbGuildGold});
QB.def({key:'qb_guild_mason',name:"Masons' Hall",family:'Guilds',tags:QTAG('civic',['civic'],{job:'masonry'}),w:22,d:20,h:16,fw:22,fd:15.6,build:buildQbGuildMason});
QB.def({key:'qb_guild_spice',name:"Spicers' Hall",family:'Guilds',tags:QTAG('civic',['civic','market/shop']),w:18,d:20,h:19,fw:18,fd:15.6,build:buildQbGuildSpice});
QB.def({key:'qb_guild_lodge',name:'Guild lodge',family:'Guilds',tags:QTAG('civic',['civic']),w:14,d:18,h:15,fw:14,fd:13.6,build:buildQbGuildLodge});
QB.def({key:'qb_gate_market',name:'Gate market',family:'Civic',tags:QTAG('civic',['market','civic'],{note:'one of the four gate markets of the kora square'}),w:44,d:48,h:11,fw:44,fd:44,build:buildQbGateMarket});
QB.def({key:'qb_gate_market_half',name:'Gate market (half)',family:'Civic',tags:QTAG('civic',['market','civic'],{note:'a gate market on one half of an axial block, its front on the avenue'}),w:44,d:36,h:11,fw:44,fd:32,build:buildQbGateMarketHalf});
QB.def({key:'qb_bath',name:'Baths',family:'Civic',tags:QTAG('civic',['infrastructure','civic']),w:24,d:22,h:11,fw:24,fd:16,build:buildQbBath});
QB.def({key:'qb_granary',name:'Temple granary',family:'Civic',tags:QTAG('civic',['infrastructure'],{job:'warehousing'}),w:14,d:16,h:17,fw:14,fd:11,build:buildQbGranary});
