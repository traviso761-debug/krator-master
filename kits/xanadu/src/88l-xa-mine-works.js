/* ================================================================= XANADU — the mines' works: the stamp mill and the sorting shed
   In src/ and FILES since Stage 8 B9 (2026-11-24); before that OPT-IN in extra/ (kits/xanadu/README.md, "Opt-in pieces"; settlements/xanadu/WORKS-PLAN.md step
   W1, 2026-11-23): the two pieces the plan named missing for Kōlḍ-Lōḍ's mill camp and Opal Valley Mines' diggings. A page takes
   it through its kit.json "external" (settlements/xanadu-works), so no other page changes; it joins src/ with the ride-along
   rebuild. core/hamlet's Xanadu row names these keys (core/hamlet/xanadu/23-hamlet-xanadu-row.js: the `mill` and `diggings`
   foci, their pending boxes the same as the defs' here): keep them. Drawn as 88g's are: its own frame, front +z, its ground at
   local y 0, opening with its own reseed, on the kit's vocabulary and 88g's shared helpers (xwHeap, xwLine, xwTable, xwFlags:
   a page that takes this file takes 88g too). Seeds 34851-34862.
     xa_stamp_mill     Kōlḍ-Lōḍ's mill camp: the ore bins on the bank behind (the ore tipped from the carts on its top), the
                       batteries of stamps in their timber frame (v 0 two batteries of five, v 1 one, the mill house's rubble
                       walls round it), the cam shaft to the overshot wheel on the east side and its flume on trestles from the
                       head race, the tail race; below, the sloped tables with their copper plates where the gold is caught,
                       the launder to the tailings heap; a gable roof of boards over the batteries
     xa_sorting_shed   Opal Valley Mines' diggings: a long open-sided shed on posts, a roof of boards, the sorting benches
                       down both sides with the potch broken on them for colour (the opal's flashes), baskets and sieves; the
                       strong room at the east end where the day's colour is locked; the potch heap behind (v 1 an earth back
                       wall along it) */

/* ---------------------------------------------------------------- the stamp mill: 24 x 22, the bank at -z, the tables at +z */
function buildXaStampMill(G,o){reseed(34851+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),
 tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),iron=xC(0x2a2826),water=xC(XPAL.water),ore=xC(0x9a8a6a),tail=xC(xPick([0xa89c84,0x9a907c,0xb0a48e])),
 copper=xC(0xb8733a),board=xC(0x7a6a52);
 vnReg('Stamp mill',-1,-2,10,9);
 /* the bank the ore comes down to: a rubble-faced earth bank, its top at 4 m, the rails on it and a cart tipping into the bins */
 const BY=4;vB('xEarthB',-2.2,0,-8.2,17.6,BY,5.6,0,earth);vB('xRubB',-2.2,0,-5.6,17.6,BY,.6,0,rub);
 for(const s of[-1,1])vB('vIron',-2.2,BY,-9.6+s*.35,16,.07,.06,0,iron);
 for(let k=0;k<14;k++)vB('vWood',-9.4+k*1.2,BY,-9.6,.18,.05,1.1,0,timD);
 vB('vWood',3.2,BY+.3,-9.6,1.2,.6,.9,0,timD);for(const s of[-1,1])for(const t of[-1,1])kput('vHoop',[3.2+s*.4,BY+.17,-9.6+t*.47],null,[.15,.15,1],iron);
 /* the ore bins on the bank's lip: a timber bin with a sloped front over the batteries, the ore heaped in it */
 const NB=V===1?1:2,BX=V===1?[-1.5]:[-4.2,1.2];
 for(const bx of BX){vB('vWood',bx,BY,-6.2,4.6,2.2,1.8,0,tim);for(const s of[-1,1])vB('vWood',bx+s*2.3,BY,-6.2,.2,2.4,1.9,0,timD);
  kput('vWood',[bx,BY+1.0,-5.0],qEuler(-.7,0,0),[4.4,.1,1.9],tim);
  xwHeap(bx,-6.4,1.9,.7,.9,ore,6);for(let k=0;k<6;k++)kput('xBoulder',[bx+rr(-1.6,1.6),BY+2.2,-6.4+rr(-.5,.5)],qEuler(rng()*3,rng()*3,0),[.25,.2,.25],ore);}
 /* the batteries: each a mortar box on its block, five stamps (stem, tappet, head) in the guides, the feed chute from its bin */
 for(const bx of BX){vB('vStone',bx,0,-3.2,3.2,.7,1.6,0,stone);vB('vIron',bx,.7,-3.2,2.8,.9,1.1,0,iron);
  vB('vIron',bx,1.25,-2.62,2.4,.25,.04,0,xC(0x3a3632));   /* the screen at the mortar's front */
  for(let k=0;k<5;k++){const x=bx-1.0+k*.5,lift=(k%2)*.25;vPst('vIron',x,1.4+lift,-3.2,.07,4.4,iron);vB('vIron',x,1.4+lift-.05,-3.2,.22,.5,.22,0,iron);
   vB('vIron',x,4.4+lift,-3.2,.2,.18,.24,0,iron);}
  for(const y of[2.6,4.9])vB('vWood',bx,y,-3.2,3.3,.3,.4,0,timD);   /* the guides */
  kput('vWood',[bx,2.9,-4.4],qEuler(.85,0,0),[1.2,.08,1.9],tim);}
 /* the frame: posts to the roof, the cam shaft across at 5.7 m out to the wheel, its cams under every stem */
 const x0=BX[0]-2.4,x1=BX[BX.length-1]+2.4,shaftY=5.7;
 for(const x of[x0,x1].concat(NB>1?[(BX[0]+BX[1])/2]:[]))for(const z of[-4.4,-1.8])vB('vWood',x,0,z,.4,7.4,.4,0,timD);
 xwLine([x0-.2,shaftY,-3.55],[8.5,shaftY,-3.55],.2,iron,'vPost');
 for(const bx of BX)for(let k=0;k<5;k++)vB('vIron',bx-1.0+k*.5,shaftY-.25,-3.42,.14,.5,.28,0,iron);
 /* the overshot wheel on the east side: two rims, spokes, the paddles round it; its flume from the head race on trestles */
 const wx=8.5,wy=4.1,wz=-3.55,R=3.5;
 for(const s of[-1,1])kput('vHoop',[wx+s*.6,wy,wz],qEuler(0,Math.PI/2,0),[R,R,1],timD);
 for(let k=0;k<4;k++)for(const s of[-1,1])kput('vWood',[wx+s*.6,wy,wz],qEuler(k*Math.PI/4,0,0),[.14,R*2,.16],tim);
 for(let k=0;k<16;k++){const a=k/16*TAU;kput('vWood',[wx,wy+Math.cos(a)*(R-.15),wz+Math.sin(a)*(R-.15)],qEuler(a,0,0),[1.3,.32,.06],board);}
 vB('vStone',wx,0,wz,2.4,.5,2.0,0,stone);for(const s of[-1,1])vB('vStone',wx+s*1.1,0,wz,.4,wy,.9,0,stone);
 const fy=wy+R+.35;vB('vWood',wx,fy,-7.65,.9,.12,6.7,0,tim);for(const s of[-1,1])vB('vWood',wx+s*.45,fy,-7.65,.08,.4,6.7,0,tim);
 vB('xWaterB',wx,fy+.12,-7.7,.74,.12,6.5,0,water);for(let z=-10.8;z<-4.6;z+=2.6)for(const s of[-1,1])vB('vWood',wx+s*.4,0,z,.16,fy,.16,0,timD);
 /* the tail race from the wheel's foot to the front edge */
 vB('xWaterB',wx,0,2.2,1.2,.08,11,0,water);for(const s of[-1,1])vB('vStone',wx+s*.75,0,2.2,.3,.35,11,0,stone);
 /* the roof of boards over the batteries (a gable, the ridge along x) */
 vnGableRoof((x0+x1)/2,7.4,-2.9,x1-x0+1.2,6.4,1.8,0,'vWood',board,.5);
 /* v 1 the mill house: its rubble walls on the west and the back of the battery (the front stays open to the tables) */
 if(V===1){vB('xRubB',x0-.4,0,-3.0,.6,7.2,4.0,0,rub);}
 /* the tables below the batteries: sloped tables with their copper plates, the water running on them, the launder along their foot */
 for(const bx of BX)for(const s of[-1,1]){const tx=bx+s*.8;
  kput('vWood',[tx,.9,0.6],qEuler(.12,0,0),[1.3,.1,4.0],timD);kput('vIron',[tx,.97,0.6],qEuler(.12,0,0),[1.15,.02,3.6],copper);
  kput('xWaterB',[tx,1.0,0.6],qEuler(.12,0,0),[1.1,.02,3.6],water);for(const t of[-1,1])vB('vWood',tx,0,0.6+t*1.6,1.2,.9-t*.22,.12,0,timD);}
 vB('vWood',-1.5,0,3.3,x1-x0+1,.35,.6,0,tim);vB('xWaterB',-1.5,.3,3.3,x1-x0+.8,.05,.45,0,water);
 /* the tailings: the launder runs west to the heap at the front corner; the settling vats beside it */
 vB('vWood',-8.6,0,4.6,.6,.3,3.2,0,tim);xwHeap(-8.4,8.2,3.0,2.4,1.3,tail,10);xwHeap(-4.2,9.0,2.2,1.6,.8,tail.clone().multiplyScalar(.94),8);
 for(let k=0;k<3;k++)vnBarrel(4.0+k*1.3,0,4.8,.5,.9,timD);
 /* the amalgam shed: a small rubble room by the tables, the clean-up done under lock; the retort's chimney */
 const hk=xnWall(5.2,0,8.6,4.2,2.6,3.4,0,rub,'stone');xnFlatRoof(5.2,2.6,8.6,4.2*hk,3.4*hk,0,rub,{parapet:.3});
 vnDoor(5.2,0,10.3,0,.9,1.9,'vWood',tim,timD,false);vPst('vPipe',6.6,2.6,7.8,.14,2.2,iron);
 xnFolk(-1,0,2.0,4,4);}
XA.def({key:'xa_stamp_mill',name:'Stamp mill',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:24,d:22,h:13,fw:22,fd:20,nv:2,build:buildXaStampMill});

/* ---------------------------------------------------------------- the sorting shed: 30 x 11, long along x, open on every side */
function buildXaSortingShed(G,o){reseed(34861+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),rub=xC(xPick(XPAL.rubble)),tim=xC(xPick(XPAL.aged)),
 timD=xC(0x4a3a28),board=xC(0x7a6a52),potch=xC(xPick([0xd8d0c0,0xcfc6b2,0xe0d8c8])),basket=xC(0xa88a58),iron=xC(0x2a2826);
 vnReg('Sorting shed',0,0,13,4.5);
 const L=24,D=7,H=3.4;
 /* the posts every 3.25 m down both sides, the plates on them, the roof of boards (a gable, the ridge along x) */
 for(let k=0;k<=8;k++){const x=-L/2+k*L/8;for(const s of[-1,1])vB('vWood',x,0,s*D/2,.24,H,.24,0,timD);}
 for(const s of[-1,1])vB('vWood',0,H,s*D/2,L+.4,.24,.28,0,timD);
 vnGableRoof(0,H+.24,0,L+.6,D+.4,1.4,0,'vWood',board,.6);
 /* v 1 the earth back wall along the -z side, the potch heap behind it */
 if(V===1)vB('xEarthB',-2,0,-D/2-.3,L-4,2.2,.5,0,earth);
 /* the benches down both sides, the potch on them broken for colour (a flash in a share of the pieces), sieves and baskets */
 const flash=[0x7ab8c8,0x9ad0a0,0xd0a0c8,0xe8e0d0,0xf0b860];
 for(const s of[-1,1])for(let k=0;k<4;k++){const x=-L/2+3.6+k*5.2,z=s*(D/2-1.3);xwTable(x,z,4.2,.9,.85,0,tim);
  for(let j=0;j<8;j++)kput('xBoulder',[x+rr(-1.9,1.9),.92,z+rr(-.3,.3)],qEuler(rng()*3,rng()*3,0),[.12,.09,.12],potch);
  for(let j=0;j<4;j++)kput('xPaintBall',[x+rr(-1.8,1.8),.9,z+rr(-.3,.3)],null,[.045,.035,.045],xC(xPick(flash)));
  vPst('vBarrel',x-1.6,0,z+s*-.9,.32,.5,basket);vPst('xDisc',x+1.4,0,z+s*-.95,.36,.05,iron);
  vB('vWood',x,0,z+s*-1.2,3.0,.42,.32,0,timD);}   /* the sorters' bench seat */
 /* the strong room at the east end: rubble, a flat roof, its iron-banded door; the scales on a table at its door */
 const hk=xnWall(L/2+1.4,0,0,2.8,2.6,4.2,0,rub,'stone');xnFlatRoof(L/2+1.4,2.6,0,2.8*hk,4.2*hk,0,rub,{parapet:.3});
 vnDoor(L/2,0,0,-Math.PI/2,.9,1.9,'vIron',iron,timD,false);xwTable(L/2-1.4,1.6,1.4,.7,.85,0,timD);
 vB('vIron',L/2-1.4,.85,1.6,.03,.4,.03,0,iron);vB('vIron',L/2-1.4,1.24,1.6,.5,.03,.03,0,iron);
 /* the potch heap behind (the broken stone with no colour), the barrow at the west end, a line of prayer flags along the ridge */
 xwHeap(-3,-D/2-1.1,6.0,.8,.8,potch.clone().multiplyScalar(.94),12);xwHeap(7,-D/2-1.1,3.2,.8,.6,potch,8);
 vB('vWood',-L/2-.8,.3,2.0,.7,.35,1.4,0,timD);kput('vHoop',[-L/2-.8,.25,2.9],qEuler(0,Math.PI/2,0),[.25,.25,1],iron);
 xwFlags([-L/2,H+1.7,0],[L/2,H+1.7,0],14);
 xnFolk(0,0,0,6,L/2-2);}
XA.def({key:'xa_sorting_shed',name:'Sorting shed',family:'Works',tags:{type:['industry'],wealth:'poor',lit:false},w:30,d:11,h:5.5,fw:28,fd:9,nv:2,build:buildXaSortingShed});
