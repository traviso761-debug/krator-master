// ================================================================ SEGMENT: quay, quay110 (anchors)
// The plain working quay: vertical quay wall on a dredged berth, a paved
// apron 60 m deep with a rail track, lamp masts, containers and a transit
// shed. ONE builder, TWO registrations: `quay` is 220 m wide (the original
// anchor module), `quay110` is 110 m - the width every new segment is held
// to - and is the plain neighbour in the segment and edges dev targets. The
// builder reads its width from opt.W, so both tile flush with anything.
// Seeds 20000-20004 (both keys share the builder, and so the stream).
//   d=0 intact   white coping, cyan-lit lamps, painted containers
//   d=1 ruined   berth silted to -7 with a sand bar, paving broken to earth,
//                containers rusted and toppled (one in the water), lamps down
//   d=3 reclaimed container houses, stalls, gardens, skiffs at the ladders
const PQ={LAND:60,SEA:40};
function pqStamps(o){const d=o.d,h=o.W/2,k=o.W/220;
 const s=[{kind:'flat',x0:-h,z0:-PQ.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
          {kind:'dig',x0:-h,z0:0,x1:h,z1:PQ.SEA,y:d===1?-7:PORT.BERTH,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-80,14],[-30,8],[30,16],[60,34],[-10,38],[-70,30]].map(p=>[p[0]*k,p[1]]),y:-1.4,soft:16,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:PQ.LAND,SEA:PQ.SEA}));}
function buildPqQuay(scene,gx,gz,d,opt){reseed(20000+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,wide=opt.W>=200,k=opt.W/220;
 portPaving(G,-h,-PQ.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d);
 portSideClose(G,opt.nb,d,{W:opt.W,z0:-PQ.LAND,z1:0});
 portRail(-h,h,-16,D,d);
 for(let x=-h+22;x<=h-22+.1;x+=44)portLamp(x,D,-6.5,0,d);
 // containers and the shed, all inside the 8 m clearance
 if(wide){
  if(d<3){portContainerStack(-66,D,-41,0,4,d===0?3:2,d,{big:true});REGISTER({name:'Container block',x:-66,z:-41,r:9,h:9,y:D});}  // at d=3 houses take its place
  portContainerStack(-28,D,-44,0,2,2,d,{big:false});REGISTER({name:'Container stack',x:-28,z:-44,r:7,h:6,y:D});
  portShed(G,56,-36,68,24,8,d,{name:'Quay transit shed'});
  for(const x of [-78,-26,26,78])REGISTER({name:'Working quay apron',x,z:-28,r:24,h:16,y:D-2});}
 else{
  if(d<3){portContainerStack(-h+30,D,-42,0,3,d===0?3:2,d,{big:true});REGISTER({name:'Container block',x:-h+30,z:-42,r:8,h:9,y:D});}
  portShed(G,h-30,-37,34,20,7,d,{name:'Quay shed'});
  for(const x of [-h+26,h-26])REGISTER({name:'Working quay apron',x,z:-26,r:18,h:16,y:D-2});}
 if(d===0){portFigures(0,D,-22,Math.round(10*k),h-25);portBuoy(-40*k,30);portBuoy(60*k,28);
  for(let i=0;i<Math.round(4*k);i++)portContainer(rr(-h+20,h-20),D,rr(-30,-24),0,rng()<.5,0);}
 if(d===1){
  // containers knocked off the block, one in the silted berth
  portContainer(-30*k,D,-30,.4,true,1,null,[0,.05]);
  portContainer(-12*k,D+1.2,-26,1.3,false,1,null,[Math.PI/2*.98,.04]);   // lying on its side
  portContainer(18*k,-1.2,12,.25,true,1,null,[.18,.35]);
  portWeeds(-h+5,-58,h-5,-3,Math.round(160*k),D);portTrees(-h+10,-56,-h+70*k,-46,Math.max(1,Math.round(3*k)),D,4,8);portTrees(20*k,-20,h-10,-12,2,D,4,7);
  portRubble(40*k,D,-12,5,14);portRubble(-80*k,D,-20,4,10);
  kput('pkSkiff',[-40*k,-.9,24],qEuler(0,1.1,Math.PI*.92),1,new THREE.Color(0x6a4a3a));}   // capsized on the bar
 if(d>=3){
  const hx=wide?[-92,-50,-8,8]:[-38,-12];
  hx.forEach((x,i)=>portContainerHouse(G,x,D,i%2?-43:-40,rr(-.12,.12)+(i===3?Math.PI/2:0),d,{levels:i===1?3:undefined}));
  for(let x=-h+20;x<=(wide?8:-2);x+=12)portStall(x+rr(-2,2),D,-27,Math.PI+rr(-.1,.1));
  if(wide){portGarden(-70,D,-10,26,8,d);portGarden(-20,D,-9,18,7,d);}else portGarden(-20,D,-10,24,8,d);
  for(const L of wall.ladders){portSkiff(L[0]+rr(-4,4),L[1]+2.6,Math.PI/2+rr(-.15,.15));if(rng()<.6)portSkiff(L[0]+rr(6,10),L[1]+4.8,Math.PI/2+rr(-.2,.2));}
  for(let i=0;i<Math.round(5*k);i++)portSkiff(rr(-h+10,h-10),rr(12,32),rng()*TAU);
  portWashLine(-h+22,-6.5,-h+66,-6.5,9,9);if(wide)portWashLine(0,-6.5,44,-6.5,8.5,8);
  portFigures(-30*k,D,-22,Math.round(26*k),h-40);portWeeds(-h+5,-58,h-5,-3,Math.round(40*k),D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'quay',name:'Working quay',cls:'seg',W:220,LAND:PQ.LAND,SEA:PQ.SEA,decays:[0,1,3],stamps:pqStamps,build:buildPqQuay});
PORT_SEG({key:'quay110',name:'Working quay, 110 m',cls:'seg',W:110,LAND:PQ.LAND,SEA:PQ.SEA,decays:[0,1,3],stamps:pqStamps,build:buildPqQuay});
