// ================================================================= HIGHLANDS / TRIBAL — dwellings and the cliff settlement
// The Painted Men and the other raider tribes of the high country. Raw logs, bamboo and thatch; everything that
// can carry paint carries it — whole house-fronts in formline on white, totems at every door, thunderbirds on
// the gables. No electric light. Every tribal dwelling can be built on the ground (stilts) or HUNG ON A CLIFF:
// pass o.cliff = true and the house stands on raking struts driven back into a rock face behind it (-z), its
// floor at the placement y. Seeds 23000–23199.

// shared: the stilts or the cliff cantilever under a floor of W x D at height FL
function hnTriBase(W,D,FL,c,cliff){if(!cliff){vnStilts(0,0,0,W-.6,D-.6,FL,0,c);return;}
 // cantilever: two log beams out of the rock (-z) under the floor, raking struts from the front edge back and
 // down into the rock, a rubble packing where the beams bite
 for(const s of[-1,1]){const x=s*(W/2-.5);kput('hLogX',[x,FL-.35,-1.5],qEuler(0,Math.PI/2,0),[D+4.4,.2,.2],c);
  beam('vWood',[x,FL-.5,D/2-.3],[x,FL-4.6,-D/2-4],.18,.18,c);beam('vWood',[x*.2,FL-.5,D/2-.3],[x*.2,FL-4,-D/2-3.6],.14,.14,c);}
 kput('vRock',[0,FL-.4,-D/2-.6],null,[W*.55,.6,.8],hC(vPick(HPAL.rubble)));}

// ---------------------------------------------------------------- SMALL
// A — painted hut: a board-and-bamboo hut on stilts, its whole front painted in formline on white, a thatch gable
// with a thunderbird on the apex, a winged totem by the ladder.
function buildHlTriSmallA(G,o){reseed(23001+(o.v|0));const W=6,D=5,FL=o.cliff?0:1.6,H=2.4,Y=FL;
 const log=hC(vPick(HPAL.aged)),th=hC(vPick(VPAL.thatch)),bam=hC(vPick(HPAL.bamboo));
 vnReg('Painted hut (small)',0,0,5,FL+H+3.6);
 hnTriBase(W,D,FL,log,o.cliff);
 vB('vWood',0,Y-.2,0,W,.2,D,0,log);hnBambooBox(0,Y,0,W,H,D,0,bam);
 hnForm('hFormW',0,Y+.1,D/2+.04,0,W-.4,H-.2);                                            // the painted house-front
 vnDoor(0,Y,D/2+.08,0,.9,1.7,'hBamboo',bam,hC(0x5a4a3a),false);
 hnGable(0,Y+H,0,W,D,1.2,0,'vGableT',th,.9,'hGableBM',bam);hnBarge(0,Y+H,0,W,D,1.2*D/2,0,.9,hC(HPAL.black),'bird');
 vB('vWood',0,Y-.2,D/2+.8,2.4,.18,1.6,0,log);
 if(!o.cliff){vnLadder(1,0,D/2+1.8,0,FL+.3,log);hnTotem(-1.8,0,D/2+1.4,.3,5.2,0,{wings:1.4});}
 else hnTotem(-W/2-.3,Y,D/2-.2,.24,3.4,0,{});
 for(let k=0;k<3;k++)vBall('vGourd',-W/2+1+k*1.2,Y+H-.3,D/2+.7,.16,hC(vPick([0xb08a4a,0x9a8a3a])),.22);
 if(!o.cliff){hnFirepit(2.4,0,D/2+3,.6);vnFolk(0,D/2+4,2,1.5);}}

// ---------------------------------------------------------------- the CLIFF SETTLEMENT (showcase + reusable)
// A rock face with dwellings hung on it in tiers, joined by walkways and flights of stairs, like the high
// villages of the Painted Men. In a settlement the rock is the terrain: the same houses are placed with
// o.cliff=true and the same hnCliffWalk() joins them; this def draws its own rock face so it can stand alone.
function buildHlTriCliffVillage(G,o){reseed(23101+(o.v|0));const X0=-34,X1=34,ZC=-2,TOP=38;
 vnReg('Cliff settlement (tribal)',0,-2,34,TOP);
 hnCliffFace(G,X0-6,X1+6,ZC-5.5,-1,TOP+4,3.7);
 // tiers of houses: (x, floor y) on the face; each hangs forward of the rock at z = ZC + D/2 + a little
 const tiers=[[-22,6],[-8,9],[8,5],[22,8],[-16,17],[2,19],[18,16],[-6,28],[12,27]];
 const walk=[];for(const [x,y] of tiers){hnSub('hl_tri_small_a',x,y,ZC+2.3,0,{cliff:true,v:(x*7+y)|0});walk.push([x,y,ZC+5.4]);}
 // walkways along each tier and flights between them (sorted so the path zig-zags up the face)
 const rows=[tiers.slice(0,4),tiers.slice(4,7),tiers.slice(7)];const c=hC(vPick(HPAL.aged));
 for(const R of rows){const pts=R.map(([x,y])=>[x,y,ZC+5.3]);hnCliffWalk(pts,1.3,[0,0,-1],c);}
 hnCliffWalk([[-30,0.2,ZC+5.3],[-22,6,ZC+5.3]],1.3,[0,0,-1],c);                            // up from the valley floor
 hnCliffWalk([[22,8,ZC+5.3],[28,12,ZC+5.3],[18,16,ZC+5.3]],1.3,[0,0,-1],c);
 hnCliffWalk([[-16,17,ZC+5.3],[-24,22,ZC+5.3],[-6,28,ZC+5.3]],1.3,[0,0,-1],c);
 for(let k=0;k<8;k++)vnFolk(rr(-26,26),ZC+8+rr(0,6),1,1);}

HL.def({key:'hl_tri_small_a',name:'Painted hut',branch:'tribal',family:'Dwellings',tags:{type:['single-family dwelling'],wealth:'poor',lit:false},w:9,d:10,h:8,build:buildHlTriSmallA});
HL.def({key:'hl_tri_cliff_village',name:'Cliff settlement',branch:'tribal',family:'Cliff settlement',cls:'building',tags:{type:['multi-family dwelling'],wealth:'poor',lit:false,landmark:true},w:80,d:24,h:40,build:buildHlTriCliffVillage});
