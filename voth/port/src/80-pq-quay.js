// ================================================================ SEGMENT: quay (anchor)
// The plain working quay: 220 m of vertical quay wall on a dredged berth, a
// paved apron 60 m deep with a rail track, lamp masts, a container block and
// a transit shed. It is the default neighbour in the segment target, so it
// must tile cleanly against itself and anything else. Seeds 20000-20004.
//   d=0 intact   white coping, cyan-lit lamps, painted containers
//   d=1 ruined   berth silted to -7 with a sand bar, paving broken to earth,
//                containers rusted and toppled (one in the water), lamps down
//   d=3 reclaimed container houses, stalls, gardens, skiffs at the ladders
const PQ={LAND:60,SEA:40};
function pqStamps(o){const d=o.d;
 const s=[{kind:'flat',x0:-110,z0:-PQ.LAND,x1:110,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
          {kind:'dig',x0:-110,z0:0,x1:110,z1:PQ.SEA,y:d===1?-7:PORT.BERTH,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-80,14],[-30,8],[30,16],[60,34],[-10,38],[-70,30]],y:-1.4,soft:16,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:PQ.LAND,SEA:PQ.SEA}));}
function buildPqQuay(scene,gx,gz,d,opt){reseed(20000+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK;
 portPaving(G,-110,-PQ.LAND,110,-1.2,d);
 const wall=portQuayWall(G,-110,0,110,0,d);
 portSideClose(G,opt.nb,d,{z0:-PQ.LAND,z1:0});
 portRail(-110,110,-16,D,d);
 for(let x=-88;x<=88;x+=44)portLamp(x,D,-6.5,0,d);
 // the container block and the shed, both inside the 8 m clearance
 if(d<3)portContainerStack(-66,D,-41,0,4,d===0?3:2,d,{big:true});   // at d=3 the houses take its place
 portContainerStack(-28,D,-44,0,2,2,d,{big:false});
 if(d<3)REGISTER({name:'Container block',x:-66,z:-41,r:9,h:9,y:D});
 REGISTER({name:'Container stack',x:-28,z:-44,r:7,h:6,y:D});
 portShed(G,56,-36,68,24,8,d,{name:'Quay transit shed'});
 for(const x of [-78,-26,26,78])REGISTER({name:'Working quay apron',x,z:-28,r:24,h:16,y:D-2});
 if(d===0){portFigures(0,D,-22,10,85);portBuoy(-40,30);portBuoy(60,28);
  for(let i=0;i<4;i++)portContainer(rr(-90,90),D,rr(-30,-24),0,rng()<.5,0);}
 if(d===1){
  // containers knocked off the block, one in the silted berth
  portContainer(-30,D,-30,.4,true,1,null,[0,.05]);
  portContainer(-12,D+1.2,-26,1.3,false,1,null,[Math.PI/2*.98,.04]);   // lying on its side
  portContainer(18,-1.2,12,.25,true,1,null,[.18,.35]);
  portWeeds(-105,-58,105,-3,160,D);portTrees(-100,-56,-40,-46,3,D,4,8);portTrees(20,-20,100,-12,2,D,4,7);
  portRubble(40,D,-12,5,14);portRubble(-80,D,-20,4,10);
  // a skiff capsized on the bar
  kput('pkSkiff',[-40,-.9,24],qEuler(0,1.1,Math.PI*.92),1,new THREE.Color(0x6a4a3a));}
 if(d>=3){
  const hx=[-92,-50,-8,8];
  hx.forEach((x,i)=>portContainerHouse(G,x,D,i%2?-43:-40,rr(-.12,.12)+(i===3?Math.PI/2:0),d,{levels:i===1?3:undefined}));
  for(let x=-90;x<=8;x+=12)portStall(x+rr(-2,2),D,-27,Math.PI+rr(-.1,.1));
  portGarden(-70,D,-10,26,8,d);portGarden(-20,D,-9,18,7,d);
  for(const L of wall.ladders){portSkiff(L[0]+rr(-4,4),L[1]+2.6,Math.PI/2+rr(-.15,.15));if(rng()<.6)portSkiff(L[0]+rr(6,10),L[1]+4.8,Math.PI/2+rr(-.2,.2));}
  for(let i=0;i<5;i++)portSkiff(rr(-100,100),rr(12,32),rng()*TAU);
  portWashLine(-88,-6.5,-44,-6.5,9,9);portWashLine(0,-6.5,44,-6.5,8.5,8);
  portFigures(-30,D,-22,26,70);portWeeds(-105,-58,105,-3,40,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'quay',name:'Working quay',cls:'seg',W:220,LAND:PQ.LAND,SEA:PQ.SEA,decays:[0,1,3],stamps:pqStamps,build:buildPqQuay});
