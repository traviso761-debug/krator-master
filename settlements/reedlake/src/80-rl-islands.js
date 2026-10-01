// ================================================================= REED LAKE — the island platforms and the floating village
// Five floating reed islands as defs of their own (bare, with their reed beds, anchors, landings and a little
// stock, ready to carry any building through hnSub with o.pad = false), and the composite village: six islands
// with the whole kit on them, pontoon bridges, boats in the channels, the gardens and the weir on the open water.
// Seeds 25400–25599.

// a bare island with reed beds (gapped at the landing angles), anchors, a mat landing and a mooring
function hnRLBareIsland(G,x,z,rf,o){o=o||{};const gaps=o.gaps||[[Math.PI/2-.5,Math.PI/2+.5]];hnRLIsland(G,x,z,rf,o);hnRLReeds(x,z,rf,{gaps,spread:o.spread||2.6});
 const na=o.anchors||4;for(let k=0;k<na;k++)hnRLAnchor(x,z,rf,(k+.5)/na*TAU+.4);
 for(const g of gaps){const a=(g[0]+g[1])/2;const r=rf(a);const p=[x+Math.cos(a)*(r-1.2),z+Math.sin(a)*(r-1.2)];const yaw=-a+Math.PI/2;
  vB('hRLMatB',p[0],-.02,p[1],3,.08,2.2,yaw,hC(vPick(RPAL.strawOld)));if(o.moor!==false)hnRLMoor(G,x+Math.cos(a)*(r+.3)+Math.cos(a+Math.PI/2)*1.6,z+Math.sin(a)*(r+.3)+Math.sin(a+Math.PI/2)*1.6,yaw,{L:4,W:1,off:1.1});}}

// A — a small round island for one household: a reed stack, a hearth ring, a landing
function buildRLIslandA(G,o){reseed(25401+(o.v|0));const rf=hnRLOutline(8.5,8,3.1,.12);vnReg('Reed island (small, round)',0,0,9,2.4);
 hnRLBareIsland(G,0,0,rf,{seed:1});hnRLSheaves(-3,-2,.4,3,{stook:true});hnRLHearth(2.6,1.2,.45);hnRLReedLay(1.5,-3.6,.2,4,1.4);vnFolk(0,3,1,1);}
// B — an oval island for a compound: two landings, a drying ground, a fodder stack
function buildRLIslandB(G,o){reseed(25411+(o.v|0));const rf=hnRLOutline(14,10,5.2,.13);vnReg('Reed island (oval)',0,0,14,2.4);
 hnRLBareIsland(G,0,0,rf,{seed:2,gaps:[[Math.PI/2-.4,Math.PI/2+.4],[Math.PI*1.5-.35,Math.PI*1.5+.35]],anchors:5});
 hnRLReedLay(-5,-2,0,6,3);hnRLSheaves(6,-3,Math.PI/2,4,{});hnRLHearth(4,3,.5);hnRLRolls(-6,4,.3,3);vnFolk(2,-5,2,1.2);}
// C — a large irregular island with a cove bitten out of one side (a sheltered harbour), the biggest bare platform
function buildRLIslandC(G,o){reseed(25421+(o.v|0));const base=hnRLOutline(24,16,7.7,.14);const ac=-Math.PI*.15;const rf=a=>{let d=((a-ac)%TAU+TAU)%TAU;if(d>Math.PI)d-=TAU;return base(a)*(1-.42*Math.exp(-(d*d)/.16));};
 vnReg('Reed island (large, with cove)',0,0,24,2.4);
 hnRLBareIsland(G,0,0,rf,{seed:3,gaps:[[Math.PI/2-.35,Math.PI/2+.35],[ac-.5,ac+.5]],anchors:7,spread:3});
 // boats in the cove, a mooring row, stock ashore
 {const r=rf(ac)+2.2;const cx=Math.cos(ac)*r,cz=Math.sin(ac)*r;hnRLBoat(G,cx,cz,-ac+Math.PI/2+.4,5.4,1.3,{heads:1,folk:1});hnRLBoat(G,cx+1.5,cz+3.4,-ac+Math.PI/2-.3,4.4,1.1,{heads:1});
  for(let k=0;k<3;k++){const a=ac+(k-1)*.28;const rr0=rf(a);vPst('vPost',Math.cos(a)*(rr0+.4),RL.WATER-.5,Math.sin(a)*(rr0+.4),.08,1.7,hC(vPick(RPAL.pole)));}}
 hnRLReedLay(-8,2,.1,7,3.4);hnRLReedLay(6,-6,-.3,6,3);hnRLSheaves(-2,-8,0,5,{stook:true});hnRLSheaves(12,3,Math.PI/2,4,{});
 hnRLHearth(-10,-6,.55);hnRLHearth(3,6,.45);hnRLRolls(9,8,.2,6);vnFolk(0,0,3,3);hnRLBeast(-14,0,3,1,'goat');hnRLBeast(4,0,-10,.5,'duck');hnRLBeast(5,0,-10.6,2,'duck');}
// D — a long narrow island: a spine of bundle walkway down its length, landings at both ends
function buildRLIslandD(G,o){reseed(25431+(o.v|0));const rf=hnRLOutline(15,5.2,2.3,.1);vnReg('Reed island (long)',0,0,15,2.4);
 hnRLBareIsland(G,0,0,rf,{seed:4,gaps:[[-.3,.3],[Math.PI-.3,Math.PI+.3]],anchors:6,spread:2});
 const c=hC(vPick(RPAL.strawOld));for(let k=0;k<3;k++)kput('hRLBundleX',[0,.1,-.5+k*.5],null,[26,.16,.16],c.clone().multiplyScalar(rr(.9,1.05)));vB('hRLMatB',0,.24,0,25,.05,1.6,0,hC(vPick(RPAL.straw)));
 for(let k=0;k<5;k++){const x=-10+k*5;kput('hRLBundleX',[x,.3,0],qEuler(0,Math.PI/2,0),[1.8,.08,.08],c);}
 hnRLSheaves(-6,-2.6,0,3,{});hnRLSheaves(7,2.6,0,3,{});hnRLHearth(0,2.8,.4);hnRLReedLay(3,-3,0,4,1.2);vnFolk(-3,2,2,1.5);hnRLBeast(10,0,-2,3,'duck');}
// E — a ring island round a lagoon: a sheltered pool for the boats and the fish pens, a bundle jetty into it
function buildRLIslandE(G,o){reseed(25441+(o.v|0));const rf=hnRLOutline(16.5,15,9.1,.11);const rin=a=>6.2*(1+.12*Math.sin(3*a+1.2)+.06*Math.sin(5*a));vnReg('Reed island (ring, with lagoon)',0,0,17,2.4);
 hnRLBareIsland(G,0,0,rf,{seed:5,inner:rin,anchors:6,gaps:[[Math.PI/2-.4,Math.PI/2+.4]]});
 // the lagoon: fish pens of lattice, two boats, a jetty of bundles from the ring's inner edge
 const pole=hC(vPick(RPAL.pole));for(let k=0;k<=6;k++){const a=Math.PI*1.1+k/6*Math.PI*.6;const r=rin(a)-1.6;vPst('vPost',Math.cos(a)*r,RL.WATER-.6,Math.sin(a)*r,.05,1.2,pole);
  if(k<6){const a2=Math.PI*1.1+(k+1)/6*Math.PI*.6;const r2=rin(a2)-1.6;const x=Math.cos(a)*r,z=Math.sin(a)*r,x2=Math.cos(a2)*r2,z2=Math.sin(a2)*r2;kput('hRLLattice',[(x+x2)/2,RL.WATER+.2,(z+z2)/2],qEuler(0,Math.atan2(x2-x,z2-z)+Math.PI/2,0),[Math.hypot(x2-x,z2-z),.8,1],null);}}
 hnRLBoat(G,2.4,1.2,.8,4.2,1.05,{heads:1,folk:1});hnRLBoat(G,-2,3,-.4,3.8,1,{heads:1});hnRLReedClump(-3.4,-2.4,4,1);
 hnRLPontoon([Math.cos(Math.PI/2)*(rin(Math.PI/2)+.4),Math.sin(Math.PI/2)*(rin(Math.PI/2)+.4)],[0,2.4],1.4);
 hnRLSheaves(-12,2,Math.PI/2,3,{});hnRLHearth(11,-4,.45);hnRLReedLay(-9,-8,.4,5,2);hnRLFishRail([8,6],[11,3.5],1.9,6);vnFolk(0,10,2,1.4);hnRLBeast(-11,0,7,2,'goat');}

// ---------------------------------------------------------------- the floating village
// Six islands with the kit on them, joined by pontoon bridges; the gardens, the weir and the spirit circle out on
// the open water on pads of their own; boats in the channels; reed beds everywhere. Local frame: +z is the front.
function hnRLBridgeBetween(A,B,w){const dx=B.x-A.x,dz=B.z-A.z;const a=Math.atan2(dz,dx),b=a+Math.PI;
 const p=[A.x+Math.cos(a)*(A.rf(a)-.6),A.z+Math.sin(a)*(A.rf(a)-.6)],q=[B.x+Math.cos(b)*(B.rf(b)-.6),B.z+Math.sin(b)*(B.rf(b)-.6)];hnRLPontoon(p,q,w||1.8);
 A.gaps.push([a-.22,a+.22]);B.gaps.push([b-.22,b+.22]);}
function buildRLVillage(G,o){reseed(25501+(o.v|0));
 vnReg('Floating village',0,0,78,14,{});
 const I=[
  {x:-36,z:-14,rf:hnRLOutline(18,20,1.3,.13),gaps:[[Math.PI/2-.3,Math.PI/2+.3]],seed:11},
  {x:6,z:-20,rf:hnRLOutline(16,13,2.7,.13),gaps:[[Math.PI/2-.3,Math.PI/2+.3]],seed:12},
  {x:40,z:-12,rf:hnRLOutline(13,11,4.1,.14),gaps:[[Math.PI/2-.3,Math.PI/2+.3]],seed:13},
  {x:44,z:20,rf:hnRLOutline(16,12,5.5,.13),gaps:[[Math.PI/2-.9,Math.PI/2-.2]],seed:14},
  {x:-22,z:28,rf:hnRLOutline(17,11,6.9,.13),gaps:[[Math.PI/2-.3,Math.PI/2+.3]],seed:15},
  {x:8,z:14,rf:hnRLOutline(13,10,8.3,.12),gaps:[[Math.PI/2-.3,Math.PI/2+.3]],seed:16}];
 // bridges first (they open gaps in the reed beds), then the islands
 hnRLBridgeBetween(I[0],I[1]);hnRLBridgeBetween(I[1],I[2]);hnRLBridgeBetween(I[1],I[5]);hnRLBridgeBetween(I[5],I[4]);hnRLBridgeBetween(I[5],I[3]);hnRLBridgeBetween(I[4],I[0]);
 for(const k of I){hnRLIsland(G,k.x,k.z,k.rf,{seed:k.seed});hnRLReeds(k.x,k.z,k.rf,{gaps:k.gaps,spread:2.6});for(let j=0;j<5;j++)hnRLAnchor(k.x,k.z,k.rf,(j+.5)/5*TAU+.7);}
 // the buildings on their islands (no pads of their own)
 const on=(key,x,z,ry,v)=>hnSub(key,x,0,z,ry||0,{pad:false,v:v||0});
 on('rl_longhouse',-36,-16,0);on('rl_small_a',-49,4,.6);on('rl_small_b',-23,3,-.5);
 on('rl_large_a',4,-21,0);on('rl_watchtower',18,-29,0);
 on('rl_weaver',40,-12,0);
 on('rl_warehouse',48,18,0);on('rl_smithy',32,14,0);on('rl_dock',34,36,0);
 on('rl_large_b',-14,27,0);on('rl_pen',-32,28,.15);
 on('rl_shaman',2,14,0);on('rl_granary',15,8,0);
 // on the open water, on pads of their own: the spirit circle, the gardens, the weir, the warrior's hall
 hnSub('rl_spirit_circle',-64,0,-40,.3,{v:0});hnSub('rl_farm',-58,0,30,0,{v:0});hnSub('rl_fishfarm',14,0,-52,0,{v:0});hnSub('rl_warrior_hall',60,0,-46,-.2,{v:0});
 // boats in the channels, reed clumps between the islands
 hnRLBoat(G,-8,10,.9,4.6,1.1,{heads:1,folk:2});hnRLBoat(G,24,2,-.6,4.2,1.05,{heads:1,folk:1});hnRLBoat(G,-40,14,1.4,4.2,1.05,{heads:1,folk:1});hnRLBoat(G,20,-38,.3,8,2,{heads:2,cabin:true,folk:2});
 hnRLBoat(G,66,4,-1,4.4,1.1,{heads:1,folk:1});hnRLRaft(-4,38,.4,5,2.6);hnRLFolk(-4,RL.WATER+.5,38,1,.4);
 for(const [x,z] of[[-12,-40],[26,-30],[-52,-38],[62,-14],[22,42],[-38,44],[-4,50],[30,50],[-70,10],[70,32],[-8,-2]])hnRLReedClump(x,z,7,3);
 for(let k=0;k<6;k++)hnRLBeast(rr(-20,20),RL.WATER+.05,rr(38,48),rr(0,6),'duck');}

RL.def({key:'rl_island_a',name:'Reed island — small',family:'Island platforms',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:22,d:22,h:3,build:buildRLIslandA});
RL.def({key:'rl_island_b',name:'Reed island — oval',family:'Island platforms',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:34,d:26,h:3,build:buildRLIslandB});
RL.def({key:'rl_island_c',name:'Reed island — large with cove',family:'Island platforms',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:54,d:40,h:3,build:buildRLIslandC});
RL.def({key:'rl_island_d',name:'Reed island — long',family:'Island platforms',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:36,d:16,h:3,build:buildRLIslandD});
RL.def({key:'rl_island_e',name:'Reed island — ring with lagoon',family:'Island platforms',tags:{type:['infrastructure'],wealth:'poor',lit:false},w:40,d:36,h:3,build:buildRLIslandE});
RL.def({key:'rl_village',name:'Floating village',family:'Floating village',tags:{type:['multi-family dwelling','civic','farm'],wealth:'poor',lit:false,landmark:true},w:160,d:126,h:14,build:buildRLVillage});
