// ================================================================= REED LAKE — dwellings
// The same five dwelling types as the Highland tribes, rebuilt in reed on floating islands: three small (a thatch
// hut, a tiered cone hut, a small mudhif), two large (the family mudhif, the long dwelling on a raised bundle
// deck). Every def stands on its own pad unless o.pad === false. Seeds 25000–25099.

// A — thatch hut (after the Uros): mat walls, a steep totora gable with a ridge bundle and a fringed eave, a mat
// awning over the door; a canoe at the landing, reed drying, a cooking hearth, gourds under the eave.
function buildRLSmallA(G,o){reseed(25001+(o.v|0));const W=4.4,D=3.6,H=1.9;
 const old=hC(vPick(RPAL.strawOld));vnReg('Thatch hut',0,0,4.2,H+3.2);
 const rf=hnRLPad(8,8,o,1);
 hnRLHut(0,0,W,D,H,0,{pitch:1.35});
 for(let k=0;k<3;k++)hnRLGourd(-W/2+.8+k*1.2,H-.12,D/2+.55);
 hnRLHearth(2.9,2.6,.45);vB('hRLMatB',-3,-.02,2.4,1.6,.1,1,0,old);vnSacks(-3,.08,2.4,2);
 hnRLReedLay(0,-3.6,0,4,1.4);hnRLSheaves(3.6,-1,Math.PI/2,3,{});
 hnRLBeast(-3.4,0,-1.4,1.2,'duck');hnRLBeast(-2.6,0,-2.2,2.4,'duck');
 hnRLPost(1.9,0,D/2+.9,.13,2.2,0,{});
 if(rf)hnRLMoor(G,1.2,rf(Math.PI/2)+.3,0,{L:4,W:1,folk:1});
 vnFolk(-1,3.2,2,1);}

// B — cone hut: tiers of thatch to the ground with fringes at every step and a splayed topknot; a smaller cone
// beside it for stores; a stook of sheaves, ducks, a hearth.
function buildRLSmallB(G,o){reseed(25011+(o.v|0));const R=2.4,H=4.6;
 vnReg('Cone hut',0,0,4.2,H+.8);
 const rf=hnRLPad(8,8,o,2);
 hnRLConeHut(-.6,-.4,R,H,0,{tiers:3});hnRLConeHut(3,-1.6,1.15,2.3,-.5,{tiers:2});
 hnRLSheaves(-3.4,1.4,Math.PI/2,2,{stook:true});hnRLHearth(2.2,2.4,.4);
 for(let k=0;k<3;k++)hnRLBeast(-2.6+k*.7,0,3.2-k*.4,rr(0,6),'duck');
 vB('hRLMatB',3.2,-.02,1.2,1.4,.1,1,.3,hC(vPick(RPAL.strawOld)));kput('vClayPot',[3.2,.08,1.2],null,[.24,.4,.24],hC(0x9a5a38));kput('vClayPot',[3.6,.08,1.5],null,[.18,.3,.18],hC(0x8a4a30));
 if(rf)hnRLMoor(G,-1.6,rf(Math.PI/2)+.3,0,{L:3.8,W:1});
 vnFolk(.5,3.4,2,1);}

// C — small mudhif: a three-column reed arch house, a mat terrace at the door, a banded post, a hearth.
function buildRLSmallC(G,o){reseed(25021+(o.v|0));const L=5.6,S=3.6,H=3.1;
 vnReg('Small mudhif',0,0,4.4,H+.8);
 const rf=hnRLPad(8,9,o,3);
 hnRLMudhif(G,{x:0,z:-.4,L,S,H,cols:3,rib:.12,col:.17,back:'mat'});
 vB('hRLMatB',0,-.02,L/2+.6,S+1,.08,1.6,0,hC(vPick(RPAL.strawOld)));
 hnRLPost(-S/2-.5,0,L/2-.6,.13,2.4,0,{});hnRLHearth(2.9,2.2,.4);
 hnRLReedLay(-3.4,-.5,Math.PI/2,3,1.2);vnSacks(2.6,0,-1.6,2);hnRLBeast(-2.4,0,2.8,.8,'goat');
 for(let k=0;k<2;k++)hnRLGourd(-1.1+k*2.2,H*.4+.3,L/2-.35);
 if(rf)hnRLMoor(G,1.4,rf(Math.PI/2)+.3,0,{L:4,W:1,folk:1});
 vnFolk(-.5,3.6,2,1);}

// Large A — the family mudhif: five columns each end, a bundle-edged terrace along the front with braziers,
// banded posts flanking the door, woven cloths on the mat band, a fish rail, a canoe at the landing.
function buildRLLargeA(G,o){reseed(25031+(o.v|0));const L=10,S=5.4,H=4.8;
 const old=hC(vPick(RPAL.strawOld));vnReg('Family mudhif',0,0,6.5,H+1);
 const rf=hnRLPad(11,15,o,4);
 const M=hnRLMudhif(G,{x:0,z:-1,L,S,H,cols:5,rib:.15,col:.21});
 const fz=-1+L/2;
 vB('hRLMatB',0,-.02,fz+1.4,S+2,.1,2.8,0,old);kput('hRLBundleX',[0,.06,fz+2.85],null,[S+2.2,.12,.12],old);
 for(const s of[-1,1]){hnRLPost(s*(S/2+.4),0,fz+.9,.24,3.6,0,{disc:true,pennant:true});hnRLCloth(s*1.75,.35,fz+.2,0,1.6,M.hl-.6);hnRLBrazier(s*2.3,fz+2.3,.8);}
 hnRLFishRail([-S/2-1.2,-2.4],[-S/2-1.2,1.6],1.9,7);hnRLReedLay(S/2+1.6,-1,Math.PI/2,3,2.2);hnRLSheaves(S/2+1.4,3.2,0,3,{});
 hnRLHearth(-S/2-1.6,3.4,.45);hnRLBeast(S/2+2.2,0,3.2,2.2,'goat');hnRLBeast(-2.6,0,-5.4,.4,'duck');hnRLBeast(-1.8,0,-5.9,3,'duck');
 for(let k=0;k<4;k++)hnRLGourd(-1.8+k*1.2,M.hl-.1,fz+.22);
 if(rf){hnRLMoor(G,2.2,rf(Math.PI/2)+.3,0,{L:4.6,W:1.15,folk:1});hnRLMoor(G,-2.4,rf(Math.PI/2)+.3,0,{L:4,W:1});}
 vnFolk(0,fz+1.6,3,1.4);hnRLFolk(0,0,fz+4.2,1,.5);}

// Large B — long dwelling: a bundle deck half a metre above the island, a long thatch hut for several families
// with three doors under a lean-to veranda on bundle posts, fish and herbs drying, ladders of a step or two.
function buildRLLargeB(G,o){reseed(25041+(o.v|0));const W=13,D=4.6,H=2.3,DK=.5,V=2;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));vnReg('Long dwelling',0,.6,8,DK+H+3.6);
 const rf=hnRLPad(15,10,o,5);
 // the deck: bundles laid along x in two courses, a mat over
 for(let k=0;k<2;k++){const n=Math.round((D+V+1)/.5);for(let i=0;i<n;i++){const zz=-D/2-.5+.25+i*.5;kput('hRLBundleX',[0,.12+k*.24,zz+(k?.25:0)],null,[W+1.2,.24,.24],k?old:old.clone().multiplyScalar(.9));}}
 vB('hRLMatB',0,DK-.04,V/2,W+1.2,.05,D+V+1,0,c);
 // the hut on the deck
 hnRLHut(0,0,W,D,H,0,{door:false,pitch:1.2,over:.6});for(const u of[-4.3,0,4.3]){vnDoor(u,DK,D/2+.02,0,.85,1.65,'vWood',old,c,false);}
 for(const u of[-2.15,2.15]){hnRLCloth(u,DK+.3,D/2+.03,0,2.6,1.4);}for(const u of[-5.8,5.8])hnRLCloth(u,DK+.25,D/2+.03,0,.55,1.6);
 // the veranda lean-to
 for(let k=0;k<=6;k++){const x=-W/2+.2+(W-.4)*k/6;vPst('hRLBundle',x,DK,D/2+V-.15,.08,1.95,old);}
 kput('hRLBundleX',[0,DK+1.95,D/2+V-.15],null,[W+.2,.09,.09],old);vnShedRoof(0,DK+2,D/2+V/2-.1,W,V+.3,.45,0,'hRLThatchB',c,.4,.22);
 for(const u of[-4.6,-1.2,2.4,5.6]){const a=[u-.8,DK+1.75,D/2+.9],b=[u+.8,DK+1.75,D/2+.9];beam('hRLBundleC',a,b,.05,.05,old);
  for(let k=0;k<4;k++)kput('hPaintBall',[u-.6+k*.4,DK+1.5,D/2+.9],qEuler(0,rng()*.5,0),[.05,.2,.11],hC(vPick([0xb8bcb0,0xa0a898])));}
 for(let k=0;k<5;k++)hnRLGourd(-W/2+1.4+k*2.6,DK+1.9,D/2+V-.05);
 vB('hRLMatB',0,-.02,D/2+V+.9,3,DK-.05,.8,0,old);vB('hRLMatB',0,-.02,D/2+V+1.3,3,DK*.5,.6,0,old);   // the step up
 hnRLHearth(-W/2-1.6,1.6,.45);hnRLReedLay(W/2+1.6,-1,Math.PI/2,3,2.6);hnRLNet([-W/2-1,0,-1.5],[-W/2-1,0,-4],1.5);
 hnRLPost(4.2,0,D/2+V+1.6,.22,4.2,0,{disc:true,pennant:true});
 hnRLBeast(W/2+1.2,0,3,1.2,'goat');hnRLBeast(-4,0,-4,.5,'duck');
 if(rf){hnRLMoor(G,-1,rf(Math.PI/2)+.3,0,{L:4.4,W:1.1,folk:1});hnRLMoor(G,3,rf(Math.PI/2)+.3,0,{L:4,W:1});}
 hnRLFolk(0,DK,D/2+1,3,2);vnFolk(0,D/2+V+2.6,2,1.2);}

RL.def({key:'rl_small_a',name:'Thatch hut',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:12,d:12,h:6,build:buildRLSmallA});
RL.def({key:'rl_small_b',name:'Cone hut',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:12,d:12,h:6,build:buildRLSmallB});
RL.def({key:'rl_small_c',name:'Small mudhif',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:12,d:13,h:5,build:buildRLSmallC});
RL.def({key:'rl_large_a',name:'Family mudhif',family:'Dwellings',tags:{type:['multi-family dwelling'],wealth:'middle',lit:false},w:16,d:20,h:7,build:buildRLLargeA});
RL.def({key:'rl_large_b',name:'Long dwelling',family:'Dwellings',tags:{type:['multi-family dwelling'],wealth:'middle',lit:false},w:20,d:15,h:7,build:buildRLLargeB});
