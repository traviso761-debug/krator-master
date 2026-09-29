// ================================================================= REED LAKE — agriculture: farmhouse, floating gardens, pens, granary, fish weir
// Farming on a lake: gardens are rafts of reed heaped with lake mud and planted in rows; the animals are water
// buffalo, goats and ducks; grain is stored in a mat bin on stilts above the damp; fish are farmed in weirs and
// basket traps. Seeds 25300–25399.

// Farmhouse — a thatch hut with a byre lean-to (a buffalo, goats, ducks), a mud kitchen plot, fodder reed stacked,
// a duck house at the water's edge, a canoe.
function buildRLFarmhouse(G,o){reseed(25301+(o.v|0));const W=5.2,D=4,H=2;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),mud=hC(vPick(RPAL.mud));vnReg('Farmhouse',-1,0,6,H+3.4);vnReg('Farmhouse — byre',W/2+2.4,0,3,3);
 const rf=hnRLPad(16,12,o,31);
 hnRLHut(-1,0,W,D,H,0,{pitch:1.3});hnRLPost(2.4,0,D/2+1.3,.2,3.6,0,{disc:true,pennant:true});
 // the byre: bundle posts, mat back and end, a thatch lean-to, a bundle rail; beasts
 const bx=W/2+2.4-1,BW=4.2;for(const s of[-1,1])for(const z of[-D/2+.2,D/2-.2])vPst('hRLBundle',bx+s*(BW/2-.1),0,z,.1,s>0?1.9:2.4,old);
 vB('hRLMatB',bx,0,-D/2+.15,BW,1.8,.08,0,c);vB('hRLMatB',bx+BW/2-.1,0,0,.08,1.8,D-.4,0,c);
 vnShedRoof(bx,1.9,0,D-.2,BW+.2,.5,Math.PI/2,'hRLThatchB',c,.35,.22);
 beam('hRLBundleC',[bx-BW/2+.2,1,D/2-.2],[bx+BW/2-.2,1,D/2-.2],.08,.08,old);
 hnRLBeast(bx-.3,0,-.5,Math.PI/2,'buffalo');hnRLBeast(bx+1,0,1.5,-.3,'goat');hnRLBeast(bx+1.3,0,-1.8,2.6,'goat');
 for(let k=0;k<4;k++)hnRLBeast(bx+rr(-1.5,1.5),0,D/2+1+rr(0,1.2),rr(0,6),'duck');
 // kitchen plot on mud, fodder, the duck house, the hearth
 const gx=-W/2-3.4;vB('hRLMud',gx,-.02,-.2,4,.22,4.6,0,mud);hnRLFence(gx,-.2,4.4,5,0,1,.9);for(let r=0;r<4;r++)for(let k=0;k<5;k++)vBall('vLeaf',gx-1.5+r*1,.3,-2+k*.9,rr(.18,.28),hC(vPick([0x4f7a34,0x5f8a3a,0x3f6a2a])),.18);
 hnRLSheaves(-1,-4.2,0,4,{stook:true});hnRLReedLay(4,-4.2,0,3.6,1.4);
 vB('hRLMatB',-4.6,-.02,3.6,1.4,.9,1.2,.3,c);vnGableRoof(-4.6,.85,3.6,1.5,1.4,.6,.3,'hRLGableT',c,.2,'hRLGableM',c,.15);vB('vDarkB',-4.6,0,4.2,.4,.4,.1,.3);
 hnRLHearth(2,3.2,.45);vnSacks(-3.2,0,2.6,2);
 if(rf)hnRLMoor(G,.6,rf(Math.PI/2)+.3,0,{L:4.2,W:1.05,folk:1});
 vnFolk(-1,3.6,2,1.2);}

// Floating farm — garden rafts: four beds of reed heaped with lake mud, planted in rows (greens, tall grain,
// squash on the mounds, a bed being made), water channels between them, willow stakes at the corners, a
// field shelter, a punt with a farmer, a fish weir along the outer edge.
function buildRLFarm(G,o){reseed(25311+(o.v|0));const RW=8,RD=5.5;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),mud=hC(vPick(RPAL.mud)),pole=hC(vPick(RPAL.pole));vnReg('Floating gardens',0,0,16,3);
 const rf=hnRLPad(8,7,o,32);   // a small island at the centre for the shelter; the beds float round it
 const beds=[[-11,-6],[0,-8.5],[11,-6],[-11,4.5],[11,4.5],[0,9]];
 beds.forEach(([bx,bz],i)=>{const kind=i%4;const y=hnRLRaft(bx,bz,0,RD+1,RW+.6,old);
  vB('hRLMud',bx,y-.02,bz,RW,.42,RD,0,mud.clone().multiplyScalar(rr(.9,1.1)));
  for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',bx+sx*RW/2,y-.3,bz+sz*RD/2,.05,1.4,pole);
  const rows=Math.floor((RD-1)/.9);for(let r=0;r<rows;r++){const z=bz-RD/2+.8+r*.9;
   if(kind===0){for(let x=bx-RW/2+.9;x<bx+RW/2-.6;x+=1.1)vB('hRLLeafB',x,y+.4,z,.9,rr(.22,.4),.42,0,hC(vPick([0x4f7a34,0x5f8a3a,0x6a9a44])));}
   else if(kind===1){for(let x=bx-RW/2+.7;x<bx+RW/2-.5;x+=.7)vPst('hRLStalk',x,y+.4,z,.05,rr(1.3,2),hC(vPick([0x9a9a44,0xa8a04a,0x8a8a3a])));for(let x=bx-RW/2+.7;x<bx+RW/2-.5;x+=.7)vBall('vLeaf',x,y+1.4+rr(0,.4),z,.16,hC(vPick([0x8a8a3a,0xa8a04a])),.3);}
   else if(kind===2){vB('hRLMud',bx,y+.4,z,RW-1,.22,.45,0,mud.clone().multiplyScalar(.85));if(r%2===0)for(let k=0;k<5;k++)vBall('vGourd',rr(bx-RW/2+1,bx+RW/2-1),y+.72,z,.2,hC(vPick([0xd08a2a,0xc07a24,0x9a8a3a])),.17);
    for(let k=0;k<6;k++)vBall('vLeaf',rr(bx-RW/2+1,bx+RW/2-1),y+.7,z,rr(.2,.3),hC(0x4f7a34),.12);}
   else{if(r<rows/2)vB('hRLMud',bx,y+.4,z,RW-1,.18,.5,0,mud.clone().multiplyScalar(.8));else for(let k=0;k<4;k++)kput('hRLBundleX',[bx-2+k*1.3,y+.5,z],qEuler(0,rr(-.2,.2),0),[1.2,.1,.1],c);}}
  if(kind===3){hnRLFolk(bx+1,y+.4,bz-.5,1,.3);kput('vWood',[bx+1.5,y+.4,bz-.3],qEuler(.2,0,.9),[.05,1.6,.05],pole);}});
 // channels: reed clumps between the beds, the punt
 for(const [x,z] of[[-5.5,-1],[5.5,-1],[-6,8],[6,8],[0,-3.2]])hnRLReedClump(x,z,4,1.2);
 hnRLBoat(G,-5.5,1.2,Math.PI/2,4,1,{heads:1,folk:1});hnRLBoat(G,6,2,-.3,3.8,1,{heads:0,paddle:false});
 // the shelter on the centre island
 {for(const s of[-1,1])for(const t of[-1,1])vPst('hRLBundle',s*1.3,0,t*1.1,.09,2.2,old);vnGableRoof(0,2.2,0,2.8,2.4,1.2,0,'hRLGableT',c,.3,null,null,.25);
  vnSacks(0,0,.2,3);vB('vWood',-.6,0,-.6,1.2,.45,.45,0,pole);hnRLHearth(2.6,.4,.35);vnFolk(0,2.4,1,.8);}
 // the fish weir: a line of stakes across the water at the back with a basket trap at the gap
 for(let k=0;k<=14;k++){const x=-12+k*24/14;vPst('vPost',x,RL.WATER-.6,-13.5,.05,1.4+rr(-.2,.2),pole);if(k<14)kput('hRLLattice',[x+24/28,RL.WATER+.3,-13.5],null,[24/14,1.1,1],null);}
 hnRLTrap(-.2,RL.WATER+.1,-14.4,Math.PI/2,1.6);
 hnRLBeast(2.5,0,-2.6,1,'duck');hnRLBeast(-2.4,0,2.5,4,'duck');}

// Animal pen — a bundle fence round a mud wallow and dry reed: two water buffalo (one lying in the wallow),
// goats, ducks and geese, a thatch shelter along the back, a hollow-log trough, fodder reed, a gate.
function buildRLPen(G,o){reseed(25321+(o.v|0));const PW=13,PD=9;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),mud=hC(vPick(RPAL.mud)),pole=hC(vPick(RPAL.pole));vnReg('Animal pen',0,0,8,3);
 const rf=hnRLPad(16,13,o,33);
 hnRLFence(0,0,PW,PD,0,2.4,1.25);kput('hRLMatB',[1.8,.6,PD/2+.9],qEuler(0,-1.1,0),[2.2,1,.06],c);hnRLPost(-1.3,0,PD/2,.13,2,0,{});
 vB('hRLMud',-2.8,-.02,.6,5,.16,3.6,.2,mud);vB('hRLWaterB',-2.8,.12,.6,4,.04,2.6,.2,null);   // the wallow
 for(const x of[-PW/2+.3,-2.2,2.2,PW/2-.3])vPst('hRLBundle',x,0,-PD/2+3,.1,1.9,old);
 vnShedRoof(0,1.9,-PD/2+1.5,PW-.2,3.2,.7,0,'hRLThatchB',c,.35,.22);vB('hRLMatB',0,0,-PD/2+.1,PW-.4,1.6,.06,0,c);
 hnRLSheaves(-4,-PD/2+1.4,0,3,{});kput('hRLBundleX',[3,.35,-PD/2+1.3],null,[3,.3,.3],old);kput('hRLBundleX',[3.2,.6,-PD/2+1.5],null,[2.6,.26,.26],old);
 kput('hLogX',[2,.25,1.2],null,[3,.25,.25],pole);vB('hRLWaterB',2,.38,1.2,2.7,.12,.3,0,null);
 hnRLBeast(-2.6,-.55,.6,.7,'buffalo');hnRLBeast(3.4,0,-1.2,2.1,'buffalo');
 hnRLBeast(4.6,0,2.4,-.8,'goat');hnRLBeast(-1,0,-2.6,1.4,'goat');hnRLBeast(.4,0,3,3,'goat');
 for(let k=0;k<6;k++)hnRLBeast(rr(-5,5),0,rr(-3.5,3.5),rr(0,6),'duck');
 hnRLHearth(PW/2+1.4,-3.2,.35);vnFolk(2.8,PD/2+2,1,1);
 if(rf)hnRLMoor(G,-2,rf(Math.PI/2)+.3,0,{L:4,W:1});}

// Granary — a round mat bin on stilts above the damp, rat-guard discs on every stilt, hoops and a painted band,
// a steep thatch cone with a woven finial; a notched ladder to the hatch; a threshing mat and sacks.
function buildRLGranary(G,o){reseed(25331+(o.v|0));const R=2,FL=1.8,H=2.3;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),pole=hC(vPick(RPAL.pole));vnReg('Granary',0,0,3.2,FL+H+4.2);
 const rf=hnRLPad(9,9,o,34);
 for(let k=0;k<6;k++){const a=k/6*TAU;const x=Math.sin(a)*1.4,z=Math.cos(a)*1.4;vB('hRLMud',x,-.02,z,.6,.16,.6,0,hC(vPick(RPAL.mud)));vPst('vPostB',x,.14,z,.12,FL-.4,pole);
  vPst('hRLDisc',x,FL-.7,z,.55,.06,hC(0xb8a888));}
 for(const x of[-1,1])kput('hRLBundleX',[x*.8,FL-.2,0],qEuler(0,Math.PI/2,0),[3.6,.15,.15],old);
 vPst('hRLDisc',0,-.06+FL,0,R+.3,.2,old);kput('hRLMatCyl',[0,FL+.14,0],null,[R,H,R],c);
 kput('hRLBandCyl',[0,FL+1.2,0],null,[R+.05,.5,R+.05],null);for(const yy of[FL+.4,FL+2.1])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.08,R+.08,1.4],old);
 vnThatchCone(0,FL+.14+H,0,R+.35,3.6,c);vPst('hRLBundleC',0,FL+H+3.3,0,.12,.8,old);hnRLFinial(0,FL+H+3.9,0,0,.8);
 vB('vWood',0,FL+.9,R+.02,.8,.9,.08,0,pole);vnLadder(0,0,R+1,0,FL+1,pole);
 vB('hRLMatB',3.8,-.02,1.4,3.6,.08,3,.2,old);vnSacks(3.6,.06,.6,4);kput('vPost',[4.6,.5,2.4],qEuler(0,0,.8),[.05,1.6,.05],pole);
 vPst('vStave',-3,0,2,.3,.6,pole);kput('vPost',[-3,.6,2],qEuler(.3,0,0),[.05,1.2,.05],pole);hnRLSheaves(-3.2,-1.6,Math.PI/2,3,{});
 hnRLBeast(2.4,0,-2.8,2,'duck');vnFolk(2.6,3.8,1,1);
 if(rf)hnRLMoor(G,-1.2,rf(Math.PI/2)+.3,0,{L:3.8,W:1});}

// Fish weir and duck run — the wet farm: a V of stakes and lattice driving fish into a basket trap, a fenced
// run of open water with a duck house on the bank, a heron scarer, the keeper's punt.
function buildRLFishFarm(G,o){reseed(25341+(o.v|0));
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),pole=hC(vPick(RPAL.pole));vnReg('Fish weir and duck run',0,-2,11,3);
 const rf=hnRLPad(9,7,o,35);
 // the V weir out in front of the island: two lines of stakes with lattice between, the trap at the point
 for(const s of[-1,1])for(let k=0;k<=8;k++){const t=k/8;const x=s*(1+7*t),z=6+8*(1-t);vPst('vPost',x,RL.WATER-.6,z,.05,1.5+rr(-.2,.2),pole);
  if(k<8){const x2=s*(1+7*(t+1/8)),z2=6+8*(1-t-1/8);const L=Math.hypot(x2-x,z2-z),yaw=Math.atan2(x2-x,z2-z);kput('hRLLattice',[(x+x2)/2,RL.WATER+.35,(z+z2)/2],qEuler(0,yaw+Math.PI/2,0),[L,1.2,1],null);}}
 hnRLTrap(0,RL.WATER+.05,5.6,0,1.8);hnRLTrap(1.2,RL.WATER+.05,6.4,.4,1.5);
 // the duck run: a fence of lattice in the water on the -x side, a duck house on the island's edge
 for(let k=0;k<=6;k++){const a=Math.PI*.55+k/6*Math.PI*.7;const r=(rf?rf(a):5)+3.5;const x=Math.cos(a)*r,z=Math.sin(a)*r;vPst('vPost',x,RL.WATER-.6,z,.05,1.3,pole);
  if(k<6){const a2=Math.PI*.55+(k+1)/6*Math.PI*.7;const r2=(rf?rf(a2):5)+3.5;const x2=Math.cos(a2)*r2,z2=Math.sin(a2)*r2;const L=Math.hypot(x2-x,z2-z),yaw=Math.atan2(x2-x,z2-z);kput('hRLLattice',[(x+x2)/2,RL.WATER+.25,(z+z2)/2],qEuler(0,yaw+Math.PI/2,0),[L,.9,1],null);}}
 for(let k=0;k<7;k++){const a=Math.PI*.6+rr(0,Math.PI*.6);const r=(rf?rf(a):5)+rr(.8,2.6);hnRLBeast(Math.cos(a)*r,RL.WATER+.05,Math.sin(a)*r,rr(0,6),'duck');}
 vB('hRLMatB',-3,-.02,.6,1.6,1,1.3,.4,c);vnGableRoof(-3,.95,.6,1.7,1.5,.7,.4,'hRLGableT',c,.2,'hRLGableM',c,.15);vB('vDarkB',-3,0,1.3,.4,.45,.1,.4);
 for(let k=0;k<3;k++)hnRLBeast(-2.6+k*.6,0,-1.2+k*.5,rr(0,6),'duck');
 // the keeper: a hut, racks, the scarer (a painted board on a pole), the punt
 vnSacks(2.4,0,-1.6,2);hnRLFishRail([-1.4,-2.8],[1.8,-2.8],1.9,6);hnRLNet([3.2,0,-.4],[3.2,0,-2.8],1.4);
 vPst('hRLBundle',3.4,0,2.4,.07,2.8,old);hnRLCloth(3.4,2.2,2.5,0,.9,.45);for(let k=0;k<3;k++)kput('vCloth',[3.4+(k-1)*.28,1.7,2.55],null,[.12,.7,1],hC(vPick([0xb3322a,0x2e9488,0xefe7d6])));
 hnRLBoat(G,4.6,rf?rf(.3)+1.2:6,.9,3.8,1,{heads:1,folk:1});
 hnRLHearth(0,-1.2,.35);vnFolk(1,1.6,1,.8);}

RL.def({key:'rl_farmhouse',name:'Farmhouse',family:'Farms',tags:{type:['farm','single-family dwelling'],wealth:'poor',lit:false},w:22,d:18,h:7,build:buildRLFarmhouse});
RL.def({key:'rl_farm',name:'Floating gardens',family:'Farms',tags:{type:['farm'],wealth:'poor',lit:false},w:34,d:34,h:5,build:buildRLFarm});
RL.def({key:'rl_pen',name:'Animal pen',family:'Farms',tags:{type:['farm'],wealth:'poor',lit:false},w:22,d:18,h:4,build:buildRLPen});
RL.def({key:'rl_granary',name:'Granary',family:'Farms',tags:{type:['farm'],wealth:'poor',lit:false},w:14,d:14,h:9,build:buildRLGranary});
RL.def({key:'rl_fishfarm',name:'Fish weir and duck run',family:'Farms',tags:{type:['farm'],wealth:'poor',lit:false},w:24,d:24,h:4,build:buildRLFishFarm});
