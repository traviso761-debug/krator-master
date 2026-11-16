// ================================================================= THALABA — the town's own pieces (PLAN.md section 5: "new pieces, to
// ask of the Xanadu kit"), on the Xanadu kit's contract (XA.def on VERN.def, the xn* and vn* helpers), started here as Qiblai's
// started in its kit: they go upstream into kits/xanadu once the owner has seen them. Seeds 34300-34399 (the Xanadu kit's run
// to 32951, Qiblai's 33000-33999, the town's site 34210-34219).
//   tb_devisers    the Rare Devisers' house at Thalaba: the hall over the counting room, the strongroom of the rarities, the
//                  sulfur shed and the wax store round a walled yard where the expedition outfits (PLAN.md section 2)
//   tb_calcarone   a sulfur kiln (Salphar's, at the cataract's foot): the ore banked in a stone ring under an earth cap and
//                  burnt, the sulfur melting out to the tapping door at its foot, the loaves stacked to cool (PLAN.md section 3)
// [web] builders (three.js through the kit's items).

// ---------------------------------------------------------------- the Rare Devisers' house: 52 x 42 m, the front (+z) on the square
function buildTbDevisers(G,o){reseed(34301+(o.v|0));const V=xV(o),W=52,D=42,wash=xC(xPick(XPAL.wash)),earth=xC(xPick(XPAL.earth)),stone=xC(xPick(XPAL.stone)),
 tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),maroon=xC(xPick(XPAL.maroon)),ochre=xC(xPick(XPAL.ochre)),lit=xLit(),sulfur=xC(0xd8c23a),wax=xC(0xd9b878);
 vnReg('The Rare Devisers\' house',0,0,28,14);
 // the yard wall (rammed earth on a stone footing), the gate in the front wall, the gate's lintel and the house's banner
 const wallH=3.2,t=.7;
 for(const [x,z,w,d] of[[0,-D/2,W,t],[-W/2,0,t,D],[W/2,0,t,D],[-W/4-4,D/2,W/2-8,t],[W/4+4,D/2,W/2-8,t]]){vB('vStone',x,0,z,w+.2,.5,d+.2,0,stone);vB('xEarthB',x,.5,z,w,wallH,d,0,earth);vB('xWashB',x,.5+wallH,z,w+.15,.25,d+.15,0,wash);}   /* plain walls: xnWall's batter turns a thin wall into a wedge */
 for(const s of[-1,1]){vB('vStone',s*4.6,0,D/2,1.4,5.2,1.4,0,stone);}vB('vWood',0,4.8,D/2,10.6,.6,1.2,0,timD);xnBand(0,5.4,D/2,10.6,1.2,0,.5,maroon);
 xnFlagpole(-6,5.2,D/2,7,ochre);
 // the hall at the back: two storeys over the counting room, the Tibetan windows in rows, the maroon band under the parapet
 const hw=28,hd=12,hz=-D/2+hd/2+2,H1=4.4,H2=4.0;
 vB('vStone',0,0,hz,hw+.6,.6,hd+.6,0,stone);xnWall(0,.6,hz,hw,H1+H2,hd,0,wash,'stone');xnBand(0,.6+H1+H2,hz,hw,hd,0,.7,maroon);
 xnParapet(0,.6+H1+H2+.7,hz,hw,hd,0,.8,wash);
 for(let k=0;k<6;k++){const x=-hw/2+hw*(k+.5)/6;if(k!==2&&k!==3)xnTibWin(x,1.6,hz+hd/2,0,1.2,1.6,lit?'lit':'glass',ochre);xnTibWin(x,.6+H1+1.0,hz+hd/2,0,1.3,1.8,lit?'lit':'glass',ochre);}
 vnDoor(0,.6,hz+hd/2,0,2.6,3.2,'vWood',tim,timD,false);xnPortico(0,.6,hz+hd/2+1.6,0,7,3.2,3.6,wash,{});
 // the strongroom of the rarities: an ashlar block with an iron-bound door, no window
 const sx=W/2-7,sz=-D/2+6;vB('vStone',sx,0,sz,9,5.6,8,0,stone);vB('vStone',sx,5.6,sz,9.6,.5,8.6,0,xC(0x8a8478));
 vnDoor(sx,0,sz+4,0,1.6,2.4,'vWood',xC(0x3a3430),xC(0x2e2a26),false);for(const y of[.7,1.6])vB('vStone',sx,y,sz+4.08,1.7,.12,.06,0,xC(0x2a2826));
 // the sulfur shed and the wax store along the west wall: open-fronted, timber posts under tiled gables
 for(const [z,name] of[[-4,'sulfur'],[9,'wax']]){const x=-W/2+5.5,L=11,d=8;
  for(let k=0;k<4;k++)vPst('vPost',x+d/2-.3,0,z-L/2+.4+k*(L-.8)/3,.16,3.4,timD);
  vB('vStone',x-d/2+.3,0,z,.6,3.4,L,0,earth);vnGableRoof(x,3.4,z,d+.8,L+.8,1.6,Math.PI/2,'xGableT',xC(0xb8563a),.5);
  if(name==='sulfur'){for(let i=0;i<5;i++)for(let j=0;j<3;j++)vB('vStone',x-2.4+i*1.0,j*.42,z-3.2+(j%2)*.5,.8,.4,.8,0,sulfur);
   for(let k=0;k<3;k++)vB('vStone',x+1.6,k*.42,z+2+(k%2)*.3,1.4,.4,.9,0,sulfur);}
  else{for(let i=0;i<4;i++)for(let j=0;j<2;j++)vB('vStone',x-2+i*1.1,j*.5,z-2+(j%2)*.4,.9,.48,.6,0,wax);vnCrate(x+1.8,0,z+2.5,1.1,.2);vnCrate(x+1.6,1.1,z+2.4,.9,.5);}}
 // the yard: the expedition outfitting (sacks, crates, barrels, the pack saddles on their rail), a well, the yard's folk
 vnSacks(6,0,4,6);vnSacks(-4,0,8,4);vnCrate(10,0,10,1.2,.3);vnCrate(11.2,0,10.4,1.0,.8);vnBarrel(14,0,6,.4,1.0,xC(0x8a6a48));vnBarrel(14.9,0,6.3,.4,1.0,xC(0x8a6a48));
 vB('vWood',2,1.0,12,9,.12,.12,0,timD);for(let k=0;k<4;k++)vB('vWood',-1.4+k*2.3,1.0,12,1.2,.5,.9,0,xC(xPick(XPAL.timber)));for(const x of[-2.6,6.6])vPst('vPost',x,0,12,.1,1.1,timD);
 vPst('vStone',-10,0,6,1.1,.8,stone);vB('vWood',-10,1.9,6,2.6,.12,.12,0,timD);for(const s of[-1,1])vPst('vPost',-10+s*1.2,0,6,.08,2,timD);
 if(V!==1)xnFolk(2,0,6,6,8);}
XA.def({key:'tb_devisers',name:'The Rare Devisers\' house (Thalaba)',family:'Thalaba',tags:{type:['market/shop','industry'],wealth:'rich',lit:true,role:'devisers'},w:52,d:42,h:13,fw:50,fd:40,nv:3,build:buildTbDevisers});

// ---------------------------------------------------------------- a calcarone: 12 x 12 m, the tapping door to the front (+z)
function buildTbCalcarone(G,o){reseed(34311+(o.v|0));const V=xV(o),R=5,stone=xC(xPick(XPAL.rubble)),earth=xC(0x8a7658),ash=xC(0x6a645c),sulfur=xC(0xd8c23a),burnt=xC(0x9a8a3a);
 vnReg('A calcarone (a sulfur kiln)',0,0,R+1,5);
 // the ring wall of field stone, its floor sloping to the front where the molten sulfur runs out
 const n=20;for(let k=0;k<n;k++){const a=k/n*TAU,x=Math.sin(a)*R,z=Math.cos(a)*R;if(Math.abs(a-0)<.2||Math.abs(a-TAU)<.2)continue;vB('xRubB',x,0,z,1.7,1.9,1.0,a,stone);}
 // the charge: the ore banked inside to a low dome, capped in earth and spent ore (grey) where it is still burning
 kput('xBoulder',[0,1.0,0],null,[R-.8,2.0-(V===2?.5:0),R-.8],V===1?ash:earth);kput('xBoulder',[.6,2.6,-.4],null,[1.8,.6,1.8],burnt);   /* the boulder's scale is its radii */
 // the tapping door, its trough and the loaves cooling in their moulds, then stacked
 vB('vStone',0,0,R+.2,1.6,1.4,.8,0,xC(0x4a4440));vB('vStone',0,0,R+1.4,.5,.2,2.2,0,xC(0x6a6050));
 for(let i=0;i<4;i++)vB('vStone',-1.8+i*1.2,0,R+2.8,.9,.32,.6,0,sulfur);
 for(let i=0;i<3;i++)for(let j=0;j<2;j++)vB('vStone',2.6+i*.95,j*.36,R+1.2+(j%2)*.3,.85,.34,.55,0,sulfur);
 // the spent ore thrown out beside it
 kput('xBoulder',[-R-1.2,0,-1.5],null,[1.3,.45,1.6],ash);}
XA.def({key:'tb_calcarone',name:'Calcarone (a sulfur kiln)',family:'Thalaba',tags:{type:['industry'],wealth:'poor',lit:false,role:'kiln'},w:12,d:12,h:4.5,fw:11,fd:11,nv:3,build:buildTbCalcarone});
