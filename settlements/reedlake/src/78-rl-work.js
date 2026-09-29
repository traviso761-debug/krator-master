// ================================================================= REED LAKE — work: the dock, the weavers, the warehouse, the smithy, the boats
// Seeds 25200–25299.

// Fishing dock — a bundle pontoon pier running out from the island over open water to a T-head: eucalyptus
// posts, a mat deck, canoes tied alongside, nets on their racks, fish drying, basket traps, baskets of the catch,
// a fire-cage on a pole for the night boats.
function buildRLDock(G,o){reseed(25201+(o.v|0));const PL=13,PW=2.2,ZP=-8;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),pole=hC(vPick(RPAL.pole));vnReg('Fishing dock',0,ZP+4,10,4.5);
 const rf=hnRLPad(12,8,o,21,0,ZP);const z0=ZP+(rf?rf(Math.PI/2)-.6:3.5);
 // the pier: two pontoon runs and the T-head, posts every 2.6 m
 hnRLPontoon([0,z0-.5],[0,z0+PL],PW,c);hnRLPontoon([-5,z0+PL-.2],[5,z0+PL-.2],PW,c);
 for(let k=0;k<=5;k++){const z=z0+k*PL/5;for(const s of[-1,1])vPst('vPost',s*(PW/2+.2),RL.WATER-.8,z,.09,2.6,pole);}
 for(const x of[-5,-2.5,2.5,5])vPst('vPost',x,RL.WATER-.8,z0+PL+.95,.09,2.6,pole);
 // canoes tied alongside, a bigger boat at the head
 hnRLBoat(G,-2.2,z0+4,0,4.4,1.1,{heads:1,folk:1});hnRLBoat(G,2.3,z0+7.5,.1,4.2,1.05,{heads:1});hnRLBoat(G,-4.2,z0+PL+1.6,0,6.4,1.6,{heads:2,folk:2});
 for(const [x,z] of[[-2.2,z0+4],[2.3,z0+7.5]])beam('vRope',[x>0?PW/2+.2:-PW/2-.2,RL.WATER+1.3,z],[x,RL.WATER+.5,z],.02,.02,hC(vPick(RPAL.rope)));beam('vRope',[-5,RL.WATER+1.3,z0+PL+.95],[-4.2,RL.WATER+.5,z0+PL+1.6],.02,.02,hC(vPick(RPAL.rope)));
 // on the island: net racks, fish rails, traps, the catch
 hnRLNet([-4.2,0,ZP-1],[-4.2,0,ZP-4.2],1.7);hnRLNet([4.4,0,ZP],[4.4,0,ZP-3.4],1.5);
 hnRLFishRail([-1.6,ZP-3.6],[2,ZP-3.6],2,8);hnRLTrap(-3,.05,ZP+1.6,.4,1.6);hnRLTrap(3.4,.05,ZP+2,-.3,1.4);
 for(let k=0;k<4;k++){const x=-1.4+k*.9;kput('vStave',[x,0,ZP+.4],null,[.3,.4,.3],old);for(let j=0;j<3;j++)kput('hPaintBall',[x+rr(-.1,.1),.42,ZP+.4+rr(-.1,.1)],qEuler(0,rng()*3,0),[.05,.08,.16],hC(0xa8b0a8));}
 vnSacks(2.2,0,ZP-1.6,2);hnRLHearth(-2.4,ZP-2.2,.4);
 vPst('vPost',PW/2+.3,RL.WATER-.5,z0+PL-.6,.06,3.9,pole);hnRLCage(PW/2+.3,3.4,z0+PL-.3);
 hnRLFolk(0,0,z0+PL/2,2,.8);hnRLFolk(0,0,z0+PL-.2,2,1.2);vnFolk(0,ZP+1.2,2,1.2);
 hnRLReedClump(-6,z0+PL-3,5,1.4);hnRLReedClump(6.5,z0+5,5,1.4);}

// Reed weaver's workshop — an open thatch shed on bundle posts: the loom frame with a half-woven mat, the
// cutting bench, sheaves standing to dry in stooks, bundles laid out, rolls of finished matting stacked, lattice
// panels leaning to cure, a bath for soaking the reed.
function buildRLWeaver(G,o){reseed(25211+(o.v|0));const W=9,D=6,PH=2.6;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));vnReg("Reed weaver's workshop",0,0,6.5,PH+3.5);
 const rf=hnRLPad(16,13,o,22);
 for(const sx of[-1,0,1])for(const sz of[-1,1])vPst('hRLBundle',sx*W/2,0,sz*D/2,.14,PH,c);
 for(const sz of[-1,1])kput('hRLBundleX',[0,PH,sz*D/2],null,[W+.6,.14,.14],old);
 vnGableRoof(0,PH+.05,0,W,D,1.05*D/2,0,'hRLGableT',c,.7,null,null,.3);kput('hRLBundleX',[0,PH+.05+1.05*D/2+.15,0],null,[W+1.8,.14,.14],old);
 for(const s of[-1,1])hnRLEaveFringe([-W/2-.7,s*(D/2+.7)],[W/2+.7,s*(D/2+.7)],PH-.7,s>0?0:Math.PI,c);
 vB('hRLMatB',0,-.02,0,W+.4,.08,D+.4,0,old);vB('hRLMatB',0,0,-D/2+.05,W,PH-.4,.08,0,old.clone().multiplyScalar(.95));   // a mat back wall
 // the loom: a frame of bundles, warp threads, a mat woven half-way up
 {const x=-2.4,z=-1.2;for(const s of[-1,1])vPst('hRLBundle',x+s*1.3,0,z,.08,2.3,old);kput('hRLBundleX',[x,2.25,z],null,[2.8,.07,.07],old);kput('hRLBundleX',[x,.3,z],null,[2.8,.07,.07],old);
  for(let k=0;k<14;k++)vPst('vRope',x-1.15+k*.18,.3,z,.008,1.95,hC(0xd8c27e));vB('hRLMatB',x,.32,z,2.4,1,.05,0,c);hnRLFolk(x,0,z+.8,1,.2);}
 // the bench and the tools, the soaking bath
 vB('vWood',2,0,-1.6,2.4,.75,.8,0,hC(vPick(RPAL.pole)));for(let k=0;k<5;k++)kput('hRLBundleX',[2+rr(-.9,.9),.8,-1.6+rr(-.3,.3)],qEuler(0,rr(-.2,.2),0),[rr(.8,1.4),.05,.05],c);
 kput('vWood',[2.6,.8,-1.3],qEuler(0,.4,0),[.3,.04,.08],hC(0x3a3430));
 vB('hRLMud',2.6,-.02,1.4,2.6,.5,1.4,0,hC(vPick(RPAL.mud)));vB('hRLWaterB',2.6,.4,1.4,2.2,.06,1,0,null);for(let k=0;k<4;k++)kput('hRLBundleX',[2.6+rr(-.5,.5),.45,1.4+rr(-.3,.3)],qEuler(0,rr(-.1,.1),0),[1.8,.06,.06],c);
 // stock: rolls, lattice panels, sheaves, laid reed
 hnRLRolls(-2.2,1.6,0,6);for(let k=0;k<3;k++)kput('hRLLattice',[W/2-.3+k*.08,1,-1+k*.6],qEuler(0,Math.PI/2,0).multiply(qEuler(-.18,0,0)),[1.4,1.9,1],null);
 hnRLSheaves(-6.4,-1,Math.PI/2,4,{stook:true});hnRLSheaves(6.2,2.5,Math.PI/2,3,{});hnRLReedLay(0,5,0,7,2.2);hnRLReedLay(-6.2,3.6,Math.PI/2,3.2,1.6);
 vB('hRLMatB',5.6,-.02,-3.4,2.2,.6,1.4,0,c);vB('hRLMatB',5.6,.58,-3.4,2,.5,1.2,0,c.clone().multiplyScalar(.95));
 hnRLPost(-W/2-.6,0,D/2+.4,.13,2.4,0,{});hnRLHearth(4.8,4.6,.4);hnRLBeast(-4.6,0,4.8,1,'duck');
 if(rf)hnRLMoor(G,1.5,rf(Math.PI/2)+.3,0,{L:4.2,W:1.1,folk:1});
 vnFolk(0,D/2+1.4,2,1.2);}

// Warehouse — the village store, on a raised bundle deck to keep the stock above the damp: mat walls with a
// bundle frame, a heavy thatch hip roof, wide double doors, a ramp; bales of matting, sacks, jars, baskets and
// fish inside; a crane pole at the landing and a cargo boat unloading.
function buildRLWarehouse(G,o){reseed(25221+(o.v|0));const W=12,D=8,H=3.2,DK=.7;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),pole=hC(vPick(RPAL.pole));vnReg('Warehouse',0,0,8,DK+H+4.4);
 const rf=hnRLPad(16,14,o,23);
 // the deck: bundles across, a mat on top, bundle edge
 {const n=Math.round((W+1.6)/.5);for(let i=0;i<n;i++){const x=-(W+1.6)/2+.25+i*.5;kput('hRLBundleX',[x,.13,0],qEuler(0,Math.PI/2,0),[D+1.6,.26,.26],old.clone().multiplyScalar(rr(.9,1.05)));}
  for(let i=0;i<n;i++){const x=-(W+1.6)/2+.5+i*.5;kput('hRLBundleX',[x,.38,.25],qEuler(0,Math.PI/2,0),[D+1.2,.24,.24],old);}
  vB('hRLMatB',0,DK-.06,0,W+1.6,.06,D+1.6,0,c);}
 vB('hRLMatB',0,DK,0,W,H,D,0,c);
 for(let i=0;i<=5;i++)for(const s of[-1,1]){vPst('hRLBundle',-W/2+W*i/5,DK,s*(D/2+.06),.13,H+.2,old);}
 for(let j=1;j<3;j++)for(const s of[-1,1])vPst('hRLBundle',s*(W/2+.06),DK,-D/2+D*j/3,.13,H+.2,old);
 for(const yy of[DK+.15,DK+H*.55,DK+H-.1])for(const s of[-1,1]){beam('hRLBundleC',[-W/2-.15,yy,s*(D/2+.14)],[W/2+.15,yy,s*(D/2+.14)],.14,.14,old);beam('hRLBundleC',[s*(W/2+.14),yy,-D/2-.15],[s*(W/2+.14),yy,D/2+.15],.14,.14,old);}
 vnHipRoof('hRLHipT',0,DK+H,0,W,D,3.4,0,c,.9);kput('hRLBundleX',[0,DK+H+3.3,0],null,[W*.5+.6,.16,.16],old);
 for(const s of[-1,1])hnRLEaveFringe([-W/2-.9,s*(D/2+.9)],[W/2+.9,s*(D/2+.9)],DK+H-.66,s>0?0:Math.PI,c);
 // doors, ramp, sign board
 vB('vDarkB',0,DK,D/2+.02,2.6,2.5,.1,0);for(const s of[-1,1])kput('hRLMatB',[s*1.55,DK+1.25,D/2+.5],qEuler(0,s*-1.1,0),[1.3,2.4,.08],c.clone().multiplyScalar(.92));
 for(const s of[-1,1])vPst('hRLBundle',s*1.5,DK,D/2+.1,.1,2.7,old);kput('hRLBundleX',[0,DK+2.65,D/2+.12],null,[3.4,.12,.12],old);
 kput('hRLMatB',[0,DK/2,D/2+1.9],qEuler(-Math.atan(DK/2.6),0,0),[2.8,.08,2.7],old);hnRLCloth(-4,DK+.4,D/2+.03,0,2.6,1.4);hnRLCloth(4,DK+.4,D/2+.03,0,2.6,1.4);
 // stock on the deck outside, the crane, the boat
 vnSacks(-4.4,DK,D/2+1,4);vnCrate(4.2,DK,D/2+.9,.9,.3,pole);vnCrate(5.1,DK,D/2+1,.7,-.2,pole);for(let k=0;k<3;k++)kput('vClayPot',[3.2+k*.5,DK,D/2+1.6],null,[.22,.5,.22],hC(0x9a5a38));
 vB('hRLMatB',-W/2-.2,DK,-1,1.2,.6,2,0,c);vB('hRLMatB',-W/2-.2,DK+.6,-1,1.1,.55,1.9,0,c.clone().multiplyScalar(.95));
 hnRLRolls(W/2+.4,-1.5,Math.PI/2,6);
 {const x=5.6,z=D/2+3.6;vPst('vPost',x,0,z,.13,5,pole);beam('vWood',[x,4.6,z],[x+.4,3.6,z+3.4],.12,.12,pole);beam('vWood',[x,2.2,z],[x+.3,3.8,z+2.2],.08,.08,pole);
  beam('vRope',[x+.4,3.6,z+3.4],[x+.4,.9,z+3.4],.02,.02,hC(vPick(RPAL.rope)));kput('vSack',[x+.4,.7,z+3.4],null,[.4,.3,.36],hC(0xb8a080));}
 hnRLPost(-W/2-1,0,D/2+1.2,.14,2.6,0,{});hnRLHearth(-5.6,-5.2,.4);
 if(rf){hnRLMoor(G,-1.6,rf(Math.PI/2)+.4,0,{L:6.2,W:1.6,folk:1});const p=[5.8,rf(Math.PI/2-.3)+1];hnRLBoat(G,p[0],p[1],.3,7,1.9,{heads:2,cabin:true,folk:1});}
 hnRLFolk(0,DK,D/2+.9,2,1);vnFolk(0,D/2+3.4,2,1.4);}

// Scrap smithy — fire on a floating island: a thick clay platform, a fieldstone hearth under a hood of rusted
// plate, a thatch shelter on bundle posts patched with salvaged sheet, bellows, an anvil of scrap iron on a
// stump, a quench trough, the scrap pile brought in by boat.
function buildRLSmithy(G,o){reseed(25231+(o.v|0));const W=7,D=5.4,PH=2.6;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),rub=hC(vPick(HPAL.rubble)),mud=hC(vPick(RPAL.mud));vnReg('Scrap smithy',0,0,5.5,PH+3.4);
 const rf=hnRLPad(14,12,o,24);
 vB('hRLMud',0,-.02,-.4,W+1.4,.28,D+1.4,0,mud);
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('hRLBundle',sx*W/2,.26,sz*D/2,.14,PH,c);
 for(const sz of[-1,1])kput('hRLBundleX',[0,PH+.26,sz*D/2],null,[W+.6,.14,.14],old);
 hnGable(0,PH+.3,0,W,D,1.05,0,'hRLGableT',c,.6,null);
 kput('vSheet',[-1.6,PH+1.75,1.4],vQ(0,-Math.atan(1.05),0),[2.4,1.8,1],null);kput('vPlate',[1.8,PH+1.15,-2.2],vQ(Math.PI,-Math.atan(1.05),0),[1.6,1.2,1],null);
 vB('hRLMatB',0,.26,-D/2,W,2.2,.08,0,c);
 // hearth, embers, hood and flue
 vB('hRubB',-1.2,.26,-1.6,2,.95,1.5,0,rub);vB('vDarkB',-1.2,1.21,-1.6,1.4,.04,1,0);for(let k=0;k<6;k++)vBall('vEmber',-1.2+rr(-.5,.5),1.24,-1.6+rr(-.35,.35),rr(.1,.18),null,.06);
 kput('hRLFlame',[-1.2,1.2,-1.6],null,[.2,.5,.2],null);kput('vRustB',[-1.2,2.3,-1.7],null,[1.7,.7,1.2],null);vPst('vPipeR',-1.2,2.66,-1.8,.2,2.8,null);
 for(const s of[-.25,.25]){vPst('hBamboo',.4+s,.26,-1.5,.16,1.3,c);vPst('vPost',.4+s,1.56,-1.5,.03,.5,old);}
 kput('hLogX',[.4,2.08,-1.5],null,[.7,.04,.04],old);beam('vPipeR',[.4,.5,-1.5],[-.3,.75,-1.6],.08,.08,null);
 vPst('vPostB',.6,.26,.6,.3,.55,hC(vPick(RPAL.pole)));vB('vRustB',.6,.81,.6,.6,.3,.3,0,null);vB('vRustB',.6,1.11,.6,.8,.12,.34,0,null);
 kput('vStave',[-2.2,.26,.6],null,[.45,.5,.45],old);vB('hRLWaterB',-2.2,.7,.6,.7,.06,.7,0,null);
 for(let k=0;k<4;k++)kput('vPost',[1.6+k*.18,.75,-2.5],qEuler(.1,0,0),[.025,1.1,.025],hC(0x3a3430));
 {const x=W/2+1.6,z=.5;vB('hRLMud',x,-.02,z,3,.2,3.4,0,mud);for(let k=0;k<6;k++)kput(vPick(['vSheet','vPlate','vPlate']),[x+rr(-.9,.9),.4+k*.08,z+rr(-1,1)],qEuler(-Math.PI/2+rr(-.3,.3),rng()*TAU,0),[rr(1,1.6),rr(.8,1.3),1],null);
  for(let k=0;k<3;k++)kput('vPipeR',[x+rr(-1,1),.3,z+rr(-.9,.9)],qEuler(0,rng()*TAU,Math.PI/2),[.1,rr(1.2,2),.1],null);for(let k=0;k<4;k++)vB('vRustB',x+rr(-1.1,1.1),.18,z+rr(-1.2,1.2),rr(.2,.6),rr(.15,.4),rr(.2,.5),rng()*3,null);}
 hnRLPost(-W/2-.7,0,D/2+.4,.14,2.6,0,{});hnRLSheaves(-W/2-1.2,-1.6,Math.PI/2,2,{});
 if(rf){hnRLMoor(G,1,rf(Math.PI/2)+.4,0,{L:5.4,W:1.4,folk:1});}
 vnFolk(0,.3,1,.5);vnFolk(2,D/2+1.6,1,1);}

// Boats — a row of the lake's craft: the fishing canoe, the great two-headed boat with its mat cabin, the reed raft.
function buildRLBoatCanoe(G,o){reseed(25241+(o.v|0));vnReg('Reed canoe',0,0,3.5,2.2,{});
 hnRLBoat(G,0,0,0,4.6,1.15,{heads:1,folk:1});hnRLBoat(G,2.4,-1,.25,3.8,1,{heads:1});hnRLReedClump(-3,2,5,1.2);hnRLReedClump(3.6,3,4,1);}
function buildRLBoatGreat(G,o){reseed(25251+(o.v|0));vnReg('Great reed boat',0,0,5.5,3.4,{});
 hnRLBoat(G,0,0,0,9,2.3,{heads:2,cabin:true,folk:3,rise:1.6});hnRLReedClump(-4.4,-2,4,1);}
function buildRLBoatRaft(G,o){reseed(25261+(o.v|0));vnReg('Reed raft',0,0,3.6,2.2,{});
 const y=hnRLRaft(0,0,0,5,2.6);vnSacks(-.8,y,0,3);kput('hRLBundleX',[1.2,y+.12,-.2],qEuler(0,.1,0),[3,.12,.12],hC(vPick(RPAL.straw)));kput('hRLBundleX',[1.4,y+.36,.1],qEuler(0,-.1,0),[3,.12,.12],hC(vPick(RPAL.straw)));
 hnRLFolk(0,y,1.6,1,.3);kput('vWood',[1.9,y+.1,1.8],qEuler(.7,0,0),[.05,3,.05],hC(vPick(RPAL.pole)));hnRLReedClump(3.6,1,4,1);}

RL.def({key:'rl_dock',name:'Fishing dock',family:'Work',tags:{type:['infrastructure','industry'],wealth:'poor',lit:false},w:16,d:28,h:6,build:buildRLDock});
RL.def({key:'rl_weaver',name:"Reed weaver's workshop",family:'Work',tags:{type:['industry','market/shop'],wealth:'poor',lit:false},w:20,d:18,h:7,build:buildRLWeaver});
RL.def({key:'rl_warehouse',name:'Warehouse',family:'Work',tags:{type:['industry','market/shop'],wealth:'middle',lit:false},w:22,d:22,h:9,build:buildRLWarehouse});
RL.def({key:'rl_smithy',name:'Scrap smithy',family:'Work',tags:{type:['industry'],wealth:'poor',lit:false},w:18,d:16,h:7,build:buildRLSmithy});
RL.def({key:'rl_boat_canoe',name:'Reed canoe',family:'Boats',cls:'furniture',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:9,d:8,h:3,build:buildRLBoatCanoe});
RL.def({key:'rl_boat_great',name:'Great reed boat',family:'Boats',cls:'furniture',tags:{type:['infrastructure'],wealth:'middle',lit:false},w:12,d:12,h:4,build:buildRLBoatGreat});
RL.def({key:'rl_boat_raft',name:'Reed raft',family:'Boats',cls:'furniture',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:9,d:8,h:3,build:buildRLBoatRaft});
