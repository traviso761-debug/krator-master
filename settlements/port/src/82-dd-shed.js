// ================================================================ SEGMENT: ddShed
// A COVERED graving dock: the stepped pit of ddDock (82-dd-dock.js; its
// helpers ddPit, ddHull, ddGate, ddScaffold live there) cut into the land
// apron, its gate on the quay line, under a long white hall: a parabolic
// shell of white panels on ribs, a raised glazed clerestory monitor along the
// crown, a closed land gable with a great door, and the sea end left OPEN
// behind a portal band so the hull inside shows from the water.
// Seeds 20110-20114.
//   d=0 pumped dry: a hull being built - the stern two thirds plated in
//       primer, the bow still bare frames - on keel blocks, a bridge crane on
//       runways hung from the ribs lifting a block, cyan work lights
//   d=1 the shell holed to the ribs (half its panels gone, the monitor's glass
//       gone), one rib down across the pit, the bridge crane fallen into it,
//       the pit flooded and silted round an abandoned rusting half-hull
//   d=3 a covered market village: the flooded pit divided into fish ponds by
//       timber weirs on piles, stalls and container houses along the hall
//       floors, lanterns and washing hung from the ribs, skiffs in the ponds
const DDS={LAND:120,SEA:40,X0:-22,X1:22,Z0:-104,Z1:-6,XE0:-16,XE1:16,N:5,T:2,HW:34,H:38,CW:7,HZ0:-110,HZ1:-1};
function ddShedStamps(o){const d=o.d,D=PORT.DECK,K=DDS,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-K.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:K.SEA,y:d===1?-7:-14,soft:30},
  {kind:'dig',x0:K.X0,z0:K.Z0,x1:K.X1,z1:K.Z1,y:DD.FLOOR,dry:d===0,paint:'mud'},
  {kind:'dig',x0:K.XE0,z0:K.Z1,x1:K.XE1,z1:0,y:d===1?-6:-12,paint:'mud'}];
 if(d===1){s.push({kind:'fill',poly:[[-13,-92],[8,-96],[14,-50],[12,-14],[-6,-10],[-14,-40]],y:-6.5,soft:6,paint:'mud'});
  s.push({kind:'fill',poly:[[-50,10],[0,6],[40,14],[30,30],[-30,32]],y:-1.8,soft:12,paint:'sand'});}
 return s.concat(portEdgeStamps(o,{LAND:K.LAND,SEA:K.SEA}));}

function buildDdShed(scene,gx,gz,d,opt){reseed(20110+d);ddSeaFix();
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,K=DDS,h=opt.W/2,dry=d===0,FL=DD.FLOOR;
 const pv=(a,b,c,e)=>portPaving(G,a,b,c,e,d);
 pv(-h,-K.LAND,K.X0-1.2,-1.2);pv(K.X1+1.2,-K.LAND,h,-1.2);pv(K.X0-1.2,-K.LAND,K.X1+1.2,K.Z0-1.2);
 const wq1=portQuayWall(G,-h,0,K.XE0,0,d,{ladders:24});const wq2=portQuayWall(G,K.XE1,0,h,0,d,{ladders:24});
 portQuayWall(G,K.XE0,K.Z1,K.XE0,0,d,{face:[1,0],fenders:0,ladders:0,bollards:0});
 portQuayWall(G,K.XE1,K.Z1,K.XE1,0,d,{face:[-1,0],fenders:0,ladders:0,bollards:0});
 portSideClose(G,opt.nb,d,{z0:-K.LAND,z1:0});
 const pit=ddPit(G,{x0:K.X0,x1:K.X1,z0:K.Z0,z1:K.Z1,d,dry,n:K.N,T:K.T,floor:FL});
 const cm=dry?DDM.concrete:CONC(d);
 for(const [a,b] of [[K.X0-1.2,K.XE0],[K.XE1,K.X1+1.2]])pbBox(G,cm,(a+b)/2,(D+.2+FL-1)/2,(K.Z1-1.2)/2,b-a,D+.2-FL+1,-1.2-K.Z1,0,8,!dry);
 ddGate(G,K.XE0,K.XE1,K.Z1,FL,d,dry);
 REGISTER({name:'Covered graving dock',x:0,z:(K.Z0+K.Z1)/2,r:22,h:D-FL+2,y:FL-1});
 const hall=ddHall(G,{HW:K.HW,H:K.H,CW:K.CW,z0:K.HZ0,z1:K.HZ1,d});
 // the bridge crane: runways hung from the ribs at x=+/-20, a bridge, a trolley
 const RY=D+20,rx=20,bz=d===3?-30:-72;
 if(d!==1){for(const s of [-1,1]){ddBar(G,d>0?MAT.rust:MAT.ddTop,[s*rx,RY,K.HZ0+3],[s*rx,RY,K.HZ1-3],.9,1.4);
   for(const z of hall.ribZ)ddBar(G,d>0?MAT.rust:MAT.ddTop,[s*rx,RY,z],[s*rx,hall.par(rx)-.2,z],.35,.35);}
  pbBox(G,d>0?MAT.rust:MAT.pkPaint,0,RY+1.6,bz,2*rx+3,2.2,2.4,0,8);pbBox(G,d>0?MAT.rust:MAT.ddTop,-4,RY+3.4,bz,4,1.6,3.2,0,8);
  const hy=d===0?4:D+10;for(const a of [-.4,.4])beam('ddSteel',[-4+a,RY+2.6,bz],[-4+a*.5,hy+2,bz],.06,.06,null);
  if(d===0)kput('ddPrim',[-4,hy,bz],null,[10,3,8],null);else kput('ddRustB',[-4,hy+1.4,bz],null,[1.2,1.2,1.2],null);
  REGISTER({name:'Bridge crane',x:0,z:bz,r:6,h:6,y:RY-1});}
 else{ddBar(G,MAT.rust,[rx,RY+1.4,-66],[-10,-3,-78],2.2,2.4);ddBar(G,MAT.rust,[-rx,RY,-40],[-rx+3,D+.8,-24],.9,1.4);
  ddBar(G,MAT.rust,[rx,RY,K.HZ0+3],[rx,RY,-70],.9,1.4);ddBar(G,MAT.rust,[-rx,RY,K.HZ0+3],[-rx,RY,-44],.9,1.4);
  REGISTER({name:'Fallen bridge crane',x:4,z:-72,r:14,h:30,y:-4});}
 // the land gable's lamps, the quay lamps, the pump house, an office drum
 for(const x of [-h+10,h-10])for(let z=-K.LAND+14;z<-4;z+=36)portLamp(x,D,z,x<0?Math.PI/2:-Math.PI/2,d);
 portShed(G,39,-102,8,14,6,d,{name:'Dock pump house',doorSide:1});
 ddDrum(G,-41,-12,4,d);
 if(d===0){
  const H=ddHull(G,{L:84,B:18,D:12,x:0,y:FL+.05+1.9,z:-52,yaw:Math.PI,dry:true,d,paint:'primer',plate:[0,.64],frames:[.64,.93],sup:false,blocks:FL+.05,seed:7});
  REGISTER({name:'Hull under construction',x:0,z:-52,r:12,h:16,y:FL});
  ddScaffold(G,-10.4,-92,4,FL+.05,D-2,true,d);ddScaffold(G,11.6,-92,4,FL+.05,D-2,true,d);
  kput('ddPrim',[28,D+1.6,-60],null,[9,3.2,12],null);kput('ddPrim',[28,D+1.6,-42],null,[9,3.2,10],new THREE.Color(0xb8b8b0));
  REGISTER({name:'Hull blocks waiting',x:28,z:-51,r:6,h:4,y:D});
  ddFigures(0,FL+.05,-50,12,11,36,true);ddFigures(-11,-9.9,-80,3,.4,8,true);ddFigures(0,FL+14,-40,5,5,14,true);
  portFigures(-28,D,-50,10,4);portFigures(28,D,-80,6,4);portFigures(0,D,-3,6,30);
  for(const z of hall.ribZ)for(const s of [-1,1])ddLight(s*14,hall.par(14)-.6,z,d,[.7,.25,.7]);
  portContainerStack(-40.5,D,-70,Math.PI/2,2,2,d,{big:true});REGISTER({name:'Container stack',x:-40.5,z:-70,r:6,h:6,y:D});
  portBuoy(-30,30);}
 if(d===1){
  ddHull(G,{L:84,B:18,D:12,x:-1,y:-8.2,z:-52,yaw:Math.PI-.04,roll:-.14,pitch:.015,d,paint:'rust',plate:[0,.5],frames:[.5,.86],sup:false,holes:.6,seed:9});
  REGISTER({name:'Abandoned half-built hull',x:0,z:-56,r:12,h:16,y:-9});
  // one rib is down across the pit
  const zr=hall.ribZ[3];ddBar(G,MAT.rust,[-K.HW+2,D+1,zr+2],[K.HW-6,-2,zr-9],1.4,1.2);
  for(let i=0;i<18;i++){const z=hall.ribZ[(rng()*hall.ribZ.length)|0],x=rr(-K.HW+6,K.HW-6);
   kput('vine',[x,hall.par(x)+.4,z],qEuler(rr(-.1,.1),rng()*TAU,rr(-.1,.1)),[rr(1,1.8),rr(4,12),rr(1,1.8)],null);}
  portTrees(-K.HW+3,-100,-26,-10,5,D,4,9);portTrees(26,-100,K.HW-3,-10,4,D,4,8);
  portWeeds(-h+4,-K.LAND+4,K.X0-2,-3,140,D);portWeeds(K.X1+2,-K.LAND+4,h-4,-3,140,D);
  portRubble(-27,D,-60,5,16);portRubble(26,D,-30,4,12);portRubble(0,D,-107,5,12);
  kput('pkSkiff',[-6,-.6,-20],qEuler(0,.3,Math.PI*.92),1,new THREE.Color(0x5a4636));
  portContainerStack(-40.5,D,-70,Math.PI/2,2,1,d,{big:true});REGISTER({name:'Container stack',x:-40.5,z:-70,r:6,h:6,y:D});}
 if(d===3){
  // fish ponds: timber weirs on piles across the flooded pit, walkways on them
  for(let z=K.Z0+18;z<K.Z1-4;z+=18){for(let x=-19;x<=19;x+=3.8)kput('pkPile',[x,-6,z],null,[.22,6.9,.22],null);
   pbBox(G,MAT.timber,0,.75,z,40,.3,2.4,0,4,true);for(const s of [-1,1])kput('pkGuard',[s*9,.9,z+1.1],null,[3.4,1,1],new THREE.Color(0x8a6a4a));}
  REGISTER({name:'Fish ponds',x:0,z:-55,r:20,h:6,y:-2});
  for(let i=0;i<10;i++){const z=rr(K.Z0+10,K.Z1-6),x=rr(-14,14);kput('stain',[x,.06,z],qEuler(-Math.PI/2,0,rng()*3),[rr(3,6),rr(3,6),1],new THREE.Color(0x24382a));}
  for(let i=0;i<9;i++)portSkiff(rr(-14,14),rr(K.Z0+6,K.Z1-6),rr(-.3,.3)+Math.PI*(i%2));
  for(let i=0;i<6;i++){const x=rr(-12,12),z=rr(K.Z0+8,K.Z1-8);pbBox(G,MAT.timber,x,.2,z,5,.4,3,rr(0,3),4,true);portGarden(x,.4,z,4,2.4,d);}
  // the market along both hall floors, houses at the land end, lanterns, washing
  for(const s of [-1,1])for(let z=-96;z<-10;z+=7.5)portStall(s*28.5,D,z+rr(-1,1),s<0?Math.PI/2:-Math.PI/2);
  for(const s of [-1,1])for(let z=-100;z<-12;z+=12)for(let k=0;k<2;k++)ddLight(s*(20-k*14),hall.par(20-k*14)-3,z+rr(-3,3),d,[.5,.5,.5]);
  for(const z of hall.ribZ.slice(1,-1))portWashLine(-24,z,24,z,D+14,12);
  for(const s of [-1,1])portContainerHouse(G,s*28,D,-106,rr(-.08,.08),d,{levels:1,big:false});
  for(let z=-96;z<-24;z+=16)portContainerHouse(G,-39.5,D,z,Math.PI/2+rr(-.1,.1),d);
  for(let z=-80;z<-20;z+=18)portContainerHouse(G,39.5,D,z,Math.PI/2+rr(-.1,.1),d,{levels:1+(z>-50?1:0)});
  for(const L of wq1.ladders.concat(wq2.ladders))portSkiff(L[0]+rr(-3,3),L[1]+3,Math.PI/2+rr(-.2,.2));
  for(let i=0;i<4;i++)portSkiff(rr(-44,44),rr(12,32),rng()*TAU);
  portFigures(-28,D,-55,22,4);portFigures(28,D,-55,22,4);portFigures(0,D,-3,10,30);portFigures(-42,D,-50,8,4);
  for(let i=0;i<4;i++)portGarden(rr(-46,-38),D,rr(-110,-100),5,4,d);
  portWeeds(-h+4,-K.LAND+4,h-4,-3,50,D);}
 KOFF=[0,0,0];return G;}

// ddHall(G,o): the long white parabolic hall over the pit, x in [-HW,HW],
// z in [z0,z1], crown at D+H. The shell is two panelled halves springing from
// the deck to the clerestory at x=+/-CW; a band of glass stands on each edge
// and a low monitor vault covers it. Ribs every ~12 m stand proud of the
// shell (they survive when the panels go), purlins run along inside it. The
// land gable is closed round a great arched door; the sea end is a portal band
// with the whole arch left open. Returns {par(x), ribZ:[z...]}.
function ddHall(G,o){const D=PORT.DECK,d=o.d,HW=o.HW,H=o.H,CW=o.CW,z0=o.z0,z1=o.z1,L=z1-z0;
 const par=x=>D+H*(1-(x/HW)*(x/HW)),yc=par(CW),GH=4.2,MR=2.2,MW=CW+.8;
 const mat=SHELL(d),rib=d>0?MAT.rust:MAT.pkPaint,sd=rr(0,90);
 const lost=a=>d===1?.5+.25*clamp((a-.72)/.28,0,1):d>=3?.24:0;           // the sea end went first
 const hole=d>0?(a,x)=>fbm(a*L/15+sd,x/8.5,sd,3)<lost(a):null;
 for(const s of [-1,1])pbAdd(gridSurface((a,v)=>{const x=s*lerp(HW,CW,v);return [x,par(x),z0+a*L];},Math.round(L/4),12,
  {uS:L/8,vS:50/8,hole:hole?(a,v)=>hole(a,s*lerp(HW,CW,v)):null}),mat,G);
 pbAdd(gridSurface((a,v)=>{const x=lerp(-MW,MW,v);return [x,yc+GH+MR*(1-(x/MW)*(x/MW)),z0+a*L];},Math.round(L/4),4,
  {uS:L/8,vS:2*MW/8,hole:hole?(a,v)=>hole(a+.37,v*9):null}),mat,G);
 // the clerestory: sills, mullions and glass (most of the glass gone at d=1)
 for(const s of [-1,1]){pbBox(G,rib,s*CW,yc,(z0+z1)/2,.5,.5,L,0,8);pbBox(G,rib,s*CW,yc+GH,(z0+z1)/2,.6,.4,L,0,8);
  for(let z=z0+1.7;z<z1-1;z+=3.4){kput('ddPaint',[s*CW,yc+GH/2,z-1.7],null,[.22,GH,.22],d>0?new THREE.Color(0x8a5a3a):null);
   if(d===1&&rng()<.75)continue;kput(d===0?'pane':'paneD',[s*CW,yc+GH/2,z],qEuler(0,Math.PI/2,0),[3.2,GH-.2,1],null);}}
 // ribs, proud of the shell; purlins inside it
 const ribZ=[],nR=Math.round(L/12);
 for(let i=0;i<=nR;i++){const z=z0+i*L/nR;ribZ.push(z);const pt=x=>[x,par(x)+.7,z];
  const broken=d===1&&(i===2||i===nR-2)?4:99;
  for(const s of [-1,1]){for(let k=0;k<8;k++){if(k>=broken&&s>0)break;const xa=s*lerp(HW,CW,k/8),xb=s*lerp(HW,CW,(k+1)/8);
    ddBar(G,rib,pt(xa),pt(xb),1.3,i===nR?2.2:1.1);}
   ddBar(G,rib,[s*CW,yc+.5,z],[s*CW,yc+GH+.3,z],.9,1.1);}
  if(broken>90)for(let k=0;k<4;k++){const xa=lerp(-MW,MW,k/4),xb=lerp(-MW,MW,(k+1)/4),y=x=>yc+GH+MR*(1-(x/MW)*(x/MW))+.5;
   ddBar(G,rib,[xa,y(xa),z],[xb,y(xb),z],1,i===nR?2.2:1.1);}}
 for(const x of [-28,-21,-14,14,21,28])ddBar(G,rib,[x,par(x)-.45,z0+.4],[x,par(x)-.45,z1-.4],.5,.6);
 // the land gable: panelled, a great arched door, a door leaf, windows
 const gab=ddShapeUV(paraFill(2*HW,H,18,21));gab.translate(0,D,z0);pbAdd(gab,mat,G);
 pbBox(G,mat,0,(yc+yc+GH)/2,z0,2*CW,GH+.4,.4,0,8);
 const mcap=ddShapeUV(paraFill(2*MW,MR));mcap.translate(0,yc+GH,z0);pbAdd(mcap,mat,G);
 kput('pkDoor',[0,D+7.5,z0+.5],null,[15,15,2],d===1?new THREE.Color(0x6a3a2a):new THREE.Color(0x3a4a5a));
 for(const x of [-24,-17,17,24])kput(d===0?'winBigI':'winBigD',[x,D+10,z0-.1],null,[1.3,1.3,1],null);
 // the sea end: the portal band round the open arch, the monitor's end
 const por=ddShapeUV(paraFill(2*HW+1.4,H+.8,2*HW-7,H-6));por.translate(0,D,z1);pbAdd(por,rib,G);
 pbBox(G,rib,0,(yc+yc+GH)/2+.2,z1,2*CW+1,GH+.8,1,0,8);
 const mcap2=ddShapeUV(paraFill(2*MW+.6,MR+.4));mcap2.translate(0,yc+GH,z1);pbAdd(mcap2,rib,G);
 if(d>0){for(let i=0;i<14;i++){const x=rr(-HW+3,HW-3),z=rr(z0+2,z1-2);kput('moss',[x,par(x)+.3,z],null,[rr(.8,2),.25,rr(.8,2)],new THREE.Color().setHSL(rr(.2,.3),.4,rr(.08,.14)));}
  vinesOnRing(0,D+H*.6,z0,HW*.7,6,14);}
 for(let z=z0+18;z<=z1-16;z+=18)REGISTER({name:'Dock hall',x:0,z,r:18,h:H+GH+MR+1,y:D});
 return {par,ribZ,yc};}

PORT_SEG({key:'ddShed',name:'Covered graving dock',cls:'seg',W:110,LAND:DDS.LAND,SEA:DDS.SEA,decays:[0,1,3],stamps:ddShedStamps,build:buildDdShed});
