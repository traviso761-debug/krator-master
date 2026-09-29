// ================================================================ SEGMENT: ddYard
// Boat manufacturing: a slipway ramp from the apron down into a piled launch
// channel, a 66 m hull on its launching cradle, a vaulted fabrication shed, a
// sawtooth plate-rolling hall, hull ring blocks and stacked double-bottom
// panels waiting on the apron, a slewing jib crane over the slip, a small
// finished boat at the outfitting quay. Shared helpers (ddHull, ddBar,
// ddFigures, ddLight) are in 82-dd-dock.js. Seeds 20120-20124.
//   d=0 launch day: the hull finished and painted, bunting from stem to mast,
//       a launch stand with its crowd at the head of the slip
//   d=1 a rusting half-built hull abandoned on a sagging cradle, frames bare,
//       the jib crane toppled across the slip wall, the channel silted, the
//       piles broken, modules rusting, one ring block rolled on its side
//   d=3 the half-hull is a village: container houses on its deck, a garden
//       pergola over its bare frames, stairs up from the slip; skiffs built on
//       trestles on the apron, the sheds workshops, boats in the channel
const DDY={LAND:100,SEA:120,SX0:-44,SX1:-12,SZ0:-86,SZ1:40,YA:6,YB:-5.8};
const ddYR=z=>DDY.YA-(z-DDY.SZ0)*(DDY.YA-DDY.YB)/(DDY.SZ1-DDY.SZ0);     // the slipway's ground height at z
function ddYardStamps(o){const d=o.d,D=PORT.DECK,K=DDY,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-K.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:K.SEA,y:d===1?-6:-10,soft:30},
  {kind:'dig',x0:K.SX0-8,z0:K.SZ1,x1:K.SX1+8,z1:K.SEA,y:d===1?-3.5:-13,soft:14,paint:'mud'},       // the launch channel
  {kind:'ramp',x0:K.SX0,z0:K.SZ0,x1:K.SX1,z1:K.SZ1,axis:'z',ya:K.YA,yb:K.YB,paint:d===1?'mud':'pave'}];
 if(d===1)s.push({kind:'fill',poly:[[-50,18],[-8,26],[-2,70],[-22,104],[-54,84]],y:-1.2,soft:10,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:K.LAND,SEA:K.SEA}));}

function buildDdYard(scene,gx,gz,d,opt){reseed(20120+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,K=DDY,h=opt.W/2,SC=(K.SX0+K.SX1)/2,slope=Math.atan((K.YA-K.YB)/(K.SZ1-K.SZ0));
 const pv=(a,b,c,e)=>portPaving(G,a,b,c,e,d);
 pv(-h,-K.LAND,K.SX0,-1.2);pv(K.SX1,-K.LAND,h,-1.2);pv(K.SX0,-K.LAND,K.SX1,K.SZ0);
 portQuayWall(G,-h,0,K.SX0,0,d,{ladders:0});
 const wq=portQuayWall(G,K.SX1,0,h,0,d,{ladders:22});
 portQuayWall(G,K.SX0,K.SZ0,K.SX0,0,d,{face:[1,0],fenders:0,ladders:0,bollards:0});
 portQuayWall(G,K.SX1,K.SZ0,K.SX1,0,d,{face:[-1,0],fenders:0,ladders:0,bollards:0});
 portSideClose(G,opt.nb,d,{z0:-K.LAND,z1:0});
 // ---- the slipway: its concrete skin, two ground ways, the launch channel's piles
 pbAdd(gridSurface((u,v)=>{const x=K.SX0+u*(K.SX1-K.SX0),z=K.SZ0+v*(K.SZ1-K.SZ0);return [x,portH(x,z)+.06,z];},4,16,
  {uS:(K.SX1-K.SX0)/8,vS:(K.SZ1-K.SZ0)/8}),CONC(d),G,true);
 for(const s of [-1,1]){const x=SC+s*4.5;ddBar(G,MAT.timber,[x,ddYR(K.SZ0+1)+.4,K.SZ0+1],[x,ddYR(K.SZ1)+.4,K.SZ1],1.4,.7,true);}
 REGISTER({name:'Slipway',x:SC,z:-30,r:17,h:14,y:-4});
 for(let z=K.SZ1+6;z<K.SEA-10;z+=12)for(const x of [K.SX0-2,K.SX1+2]){const g=portH(x,z);
  if(d===1){const r=rng();if(r<.35)continue;kput('pkPile',[x,g,z],qEuler(rr(-.2,.2),0,rr(-.2,.2)),[.4,(r<.7?2:4.5)-g,.4],null);continue;}
  kput('pkPile',[x,g,z],null,[.4,3.4-g,.4],null);if(d===0&&z>K.SEA-24)ddLight(x,3.6,z,d,[.5,.5,.5]);}
 REGISTER({name:'Launch channel',x:SC,z:84,r:19,h:18,y:-14});
 if(d!==1){portBuoy(SC-10,K.SEA-20,new THREE.Color(0xc8402a));portBuoy(SC+10,K.SEA-20,new THREE.Color(0x3a8a4a));}
 // ---- the hull on the slip, on its cradle
 const hz=-50,hy=ddYR(hz)+1.7;
 const HO={L:66,B:15,D:9,x:SC,y:hy,z:hz,yaw:Math.PI,pitch:slope,d,seed:11};
 if(d===0)Object.assign(HO,{paint:'new',sup:true});
 if(d===1)Object.assign(HO,{paint:'rust',plate:[0,.55],frames:[.55,.9],holes:.45,sup:false,y:hy-.5,roll:.05});
 if(d===3)Object.assign(HO,{paint:'rust',plate:[0,.55],frames:[.55,.88],holes:.12,sup:false});
 const H=ddHull(G,HO);
 REGISTER({name:d===0?'Hull on the slip':'Half-built hull',x:SC,z:hz,r:12,h:20,y:ddYR(hz)});
 for(let u=.1;u<.92;u+=5/66){const p=H.xf(H.sec(u,0)),gy=ddYR(p[2])+.75;if(d===1&&rng()<.25)continue;
  kput('ddSteel',[SC,gy+.25,p[2]],null,[12,.5,.8],d>0?new THREE.Color(0x8a5a40):null);
  if(p[1]-gy-.5>.3)kput('ddTimb',[SC,(gy+.5+p[1])/2,p[2]],null,[.8,p[1]-gy-.5,.8],null);
  if(u>.25&&u<.75)for(const s of [-1,1]){const b=H.xf(H.sec(u,s*.9));beam('ddTimb',[SC+s*4.5,gy+.5,p[2]],b,.4,.4,null);}}
 // ---- the jib crane at the slip's side
 ddJib(G,-4,-30,d);
 // ---- the sheds: fabrication (vaulted), plate rolling (sawtooth)
 portShed(G,21,-50,44,18,11,d,{name:'Fabrication shed',doorSide:1});
 ddSawHall(G,-2,46,-91,-68,11,d);
 // ---- hull modules on the apron: two ring blocks, panel stacks, an accommodation block
 const rb=[[8,-26],[8,-13]];rb.forEach(([x,z],i)=>{const tip=d===1&&i===1;
  ddHull(G,{L:66,B:15,D:9,x,y:tip?D+7.5:D+1.3,z:z-(.46-.5)*66,yaw:0,roll:tip?1.35:0,d,paint:d===0?'primer':'rust',plate:[.4,.52],sup:false,blocks:tip?null:D,seed:13+i});});
 REGISTER({name:'Hull ring blocks',x:8,z:-19,r:10,h:12,y:D});
 for(const [x,z,n] of [[28,-26,3],[28,-13,2]])for(let k=0;k<n;k++){const yw=rr(-.03,.03);
  kput(d===0?'ddPrim':'ddRustB',[x+rr(-.2,.2),D+.8+k*1.7,z],qEuler(0,yw,0),[12,1.6,10],null);
  for(let b=0;b<3;b++)kput('ddSteel',[x,D+.05+k*1.7,z-4+b*4],null,[11,.1,.3],null);}
 REGISTER({name:'Double-bottom panels',x:28,z:-19,r:8,h:6,y:D});
 pbBox(G,SHELL(d),40,D+3,-21,7,6,9,0,8);for(const y of [D+1.8,D+4.6])pbBox(G,MAT.dark,40,y,-21,7.1,1,9.1,0,8);
 REGISTER({name:'Accommodation block',x:40,z:-21,r:6,h:7,y:D});
 // ---- the outfitting quay: a small boat alongside
 if(d!==1){ddHull(G,{L:30,B:8,D:4.6,x:26,y:-2.2,z:8,yaw:Math.PI/2,d,paint:d===0?'new':'rust',sup:true,seed:17});
  if(d===3)portContainerHouse(G,20,2.6,8,0,d,{levels:1,big:false});}
 else ddHull(G,{L:30,B:8,D:4.6,x:26,y:-4.6,z:10,yaw:Math.PI/2+.1,roll:.32,d,paint:'rust',sup:true,holes:.4,seed:17});
 REGISTER({name:'Boat at the outfitting quay',x:26,z:9,r:15,h:12,y:-4});
 for(let z=-K.LAND+14;z<-6;z+=30)portLamp(-h+8,D,z,Math.PI/2,d);
 for(let x=K.SX1+10;x<h-6;x+=24)portLamp(x,D,-5,0,d);
 if(d===0){
  // launch day: bunting from the stem over the mast, the stand and its crowd
  const st=H.xf([0,H.deck(.99)+1,H.zAt(.99,H.deck(.99))]),mt=H.xf([0,H.deck(.12)+20,H.zAt(.12,9)]);
  const n=24;for(let i=0;i<=n;i++){const t=i/n,p=[lerp(st[0],mt[0],t),lerp(st[1],mt[1],t)-3*Math.sin(Math.PI*t),lerp(st[2],mt[2],t)];
   kput('pkCloth',p,qEuler(0,Math.PI/2,0),[.5,.7,1],new THREE.Color().setHSL(i/7%1,.7,.55));}
  pbBox(G,MAT.white,SC,D+.6,K.SZ0-3.2,14,1.2,4,0,8);kput('pkAwn',[SC,D+4,K.SZ0-3.2],qEuler(.12,0,0),[15,1,5],new THREE.Color(0x2f6f9a));
  for(const s of [-1,1])kput('postW',[SC+s*7,D+2,K.SZ0-2],null,[.1,4,.1],null);
  REGISTER({name:'Launch stand',x:SC,z:K.SZ0-3.2,r:3,h:5,y:D});
  portFigures(SC,D+1.2,K.SZ0-3.2,10,5);portFigures(SC,D,-95,14,4);portFigures(20,D,-34,8,14);portFigures(26,D,-4,6,10);
  ddFigures(SC,null,-20,4,6,3,false);
  for(let i=0;i<3;i++)portSkiff(rr(-6,40),rr(20,60),rr(-.3,.3));}
 if(d===1){
  portWeeds(-h+4,-K.LAND+4,K.SX0-2,-3,50,D);portWeeds(K.SX1+3,-K.LAND+4,h-4,-3,200,D);portWeeds(K.SX0+2,K.SZ0,K.SX1-2,-24,30,null);
  portTrees(-4,-38,6,-6,3,D,4,9);portTrees(30,-64,44,-60,2,D,4,8);portTrees(K.SX0+4,-80,K.SX1-4,-70,2,null,4,7);
  portRubble(12,D,-64,5,14);portRubble(-6,D,-44,4,10);
  kput('pkSkiff',[SC+6,-.8,20],qEuler(.2,.9,Math.PI*.9),1,new THREE.Color(0x5a4636));
  kput('pkSkiff',[SC-8,ddYR(-10)+.3,-10],qEuler(.1,2.2,.4),1,new THREE.Color(0x6a5040));}
 if(d===3){
  // the village on the half-hull
  for(const [u,lv] of [[.12,2],[.28,1],[.44,1]]){const p=H.xf([0,H.deck(u),H.zAt(u,H.deck(u))]);portContainerHouse(G,p[0],p[1],p[2],Math.PI/2+rr(-.1,.1),d,{levels:lv,big:false});}
  for(let u=.57;u<.86;u+=.035){const a=H.xf(H.sec(u,-Math.PI/2)),b=H.xf(H.sec(u,Math.PI/2));
   kput('plank',[(a[0]+b[0])/2,(a[1]+b[1])/2+.4,(a[2]+b[2])/2],qEuler(slope,0,0),[Math.abs(b[0]-a[0])*.95,.12,2],null);}
  {const p=H.xf([0,H.deck(.7)+.5,H.zAt(.7,H.deck(.7))]);portGarden(p[0],p[1],p[2],9,14,d);
   for(let i=0;i<8;i++){const q=H.xf(H.sec(.58+i*.04,(i%2?1:-1)*Math.PI/2));kput('vine',[q[0],q[1]+.5,q[2]],null,[1.2,rr(3,6),1.2],null);}}
  // a straight timber stair up the hull's side from the slip, flight on flight
  for(let k=0,y0=ddYR(-40);k<6;k++)kput('pkStair',[SC+8.8,y0+2*k,-40-2.4*k],qEuler(0,Math.PI,0),[1.2,1,1],null);
  portWashLine(SC-6,-40,SC+6,-40,H.xf([0,H.deck(.3),0])[1]+4,8);
  REGISTER({name:'Hull village',x:SC,z:-58,r:10,h:22,y:0});
  // boat building on trestles by the sheds, stalls, houses, skiffs
  for(let i=0;i<4;i++){const x=2+i*9,z=-36;for(const s of [-1,1])kput('ddTimb',[x,D+.45,z+s*1.8],null,[1.6,.9,.3],null);
   portSkiff(x,z,rr(-.1,.1),null,D+.9);}
  for(let x=0;x<40;x+=7)portStall(x,D,-64.5,0);
  for(const x of [10,34])portContainerHouse(G,x,D,-6,rr(-.08,.08),d,{levels:x>20?2:1,big:false});
  portGarden(28,D+.8+2*1.7+.8,-26,10,8,d);
  for(let i=0;i<10;i++)portSkiff(rr(SC-10,SC+10),rr(K.SZ1,K.SEA-12),rr(-.3,.3)+Math.PI*(i%2));
  for(const L of wq.ladders)portSkiff(L[0]+rr(-3,3),L[1]+3,Math.PI/2+rr(-.2,.2));
  portFigures(20,D,-36,16,16);portFigures(SC,D,-95,8,4);portFigures(20,D,-64,10,14);portWeeds(-h+4,-K.LAND+4,h-4,-3,50,D);}
 KOFF=[0,0,0];return G;}

// The slewing jib crane on a pedestal by the slip. Intact / reclaimed: white
// (rust at d=3), the jib out over the slip; ruined: toppled - the pedestal
// snapped, the house and jib down across the slip wall.
function ddJib(G,x,z,d){const D=PORT.DECK,m=d>0?MAT.rust:MAT.pkPaint,dk=d>0?MAT.rust:MAT.ddTop,top=D+16;
 if(d===1){kput('pkCol',[x,D,z],null,[1.4,6,1.4],new THREE.Color(0x8a6a58));
  ddBar(G,m,[x-1,D+6,z],[x-5,D+1.6,z+14],2.6,2.6);
  const g=boxUV(5,2.6,5,8);g.rotateZ(.6);g.translate(x-3.4,D+2.2,z+15);pbAdd(g,dk,G);
  ddBar(G,m,[x-5,D+2.6,z+15],[x-28,-1,z+4],1.2,1.2);portRubble(x-2,D,z+8,4,10);
  REGISTER({name:'Toppled jib crane',x:x-10,z:z+8,r:10,h:10,y:-2});return;}
 kput('pkCol',[x,D,z],null,[1.4,16,1.4],d>0?new THREE.Color(0xa08a78):null);
 pbBox(G,dk,x,top+1.2,z,5.2,2.4,5.2,0,8);pbBox(G,m,x+1.8,top+3.6,z+1.4,2.4,2.4,2.4,0,8);
 kput(d===0?'pane':'paneD',[x+1.8,top+3.8,z+2.62],null,[2,1.2,1],null);
 const ap=[x,top+10,z],tip=[x-24,top+13,z-8],cw=[x+8,top+2.6,z+2.7];
 ddBar(G,m,[x-1.2,top+2.4,z],ap,.8,.8);ddBar(G,m,[x+1.2,top+2.4,z],ap,.8,.8);
 ddBar(G,m,[x-1.4,top+2.2,z-.5],tip,1.1,1.1);ddBar(G,m,[x+1.2,top+2.4,z+.4],cw,.9,.9);
 pbBox(G,dk,cw[0],cw[1]-.6,cw[2],3,2.6,3,0,8);
 beam('ddSteel',ap,tip,.08,.08,null);beam('ddSteel',ap,cw,.08,.08,null);
 beam('ddSteel',tip,[tip[0],D+10,tip[2]],.06,.06,null);kput('ddPaint',[tip[0],D+9.5,tip[2]],null,[.9,.9,.9],new THREE.Color(0xd8a630));
 ddLight(tip[0],tip[1]-.6,tip[2],d,[.5,.4,.5]);
 REGISTER({name:'Jib crane',x:x-6,z:z-2,r:9,h:30,y:D});}

// The plate-rolling hall: board-formed concrete walls, a north-light
// SAWTOOTH roof (white slopes, glazed risers facing the land), a great door on
// the +z face with the rolls inside it. Its own silhouette among the vaults.
function ddSawHall(G,x0,x1,z0,z1,h,d){const D=PORT.DECK,w=x1-x0,dp=z1-z0,xc=(x0+x1)/2,zc=(z0+z1)/2,wall=CONC(d),roof=SHELL(d);
 const n=4,T=dp/n,R=4.2,xd=xc-8,dw=16,sd=rr(0,50);
 pbBox(G,wall,xc,D+h/2,z0+.2,w,h,.4,0,8);
 for(const x of [x0+.2,x1-.2])pbBox(G,wall,x,D+h/2,zc,.4,h,dp,0,8);
 pbBox(G,wall,(x0+xd-dw/2)/2,D+h/2,z1-.2,xd-dw/2-x0,h,.4,0,8);pbBox(G,wall,(xd+dw/2+x1)/2,D+h/2,z1-.2,x1-xd-dw/2,h,.4,0,8);
 pbBox(G,wall,xd,D+h-1.5,z1-.2,dw,3,.4,0,8);
 const hole=d>0?(u,v,i)=>fbm(u*6+i*1.7+sd,v*2,sd,2)<(d===1?.42:.2):null;
 for(let i=0;i<n;i++){const za=z0+i*T,zb=za+T;
  pbAdd(gridSurface((u,v)=>[x0+u*w,D+h+R*(1-v),za+v*T],8,2,{uS:w/8,vS:T/8,hole:hole?(u,v)=>hole(u,v,i):null}),roof,G);
  for(const xe of [x0,x1]){const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute([xe,D+h,za, xe,D+h+R,za, xe,D+h,zb],3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,0,R/8,T/8,0],2));g.computeVertexNormals();pbAdd(g,wall,G);}
  for(let x=x0+1.7;x<x1-1;x+=3.4){if(d===1&&rng()<.7)continue;kput(d===0?'pane':'paneD',[x,D+h+R/2,za+.1],null,[3.2,R-.3,1],null);}
  pbBox(G,d>0?MAT.rust:MAT.pkPaint,xc,D+h+R-.15,za,w,.3,.4,0,8);}
 // the plate-bending rolls in the doorway, plates waiting outside
 for(const [dy,dz] of [[1.2,-1.2],[1.2,1.2],[2.9,0]])kput('pipe',[xd,D+dy,z1-5+dz],qEuler(0,0,Math.PI/2),[.65,12,.65],d>0?new THREE.Color(0x8a5a40):null);
 for(const s of [-1,1])pbBox(G,d>0?MAT.rust:MAT.ddTop,xd+s*6.8,D+2.2,z1-5,1.6,4.4,4,0,8);
 for(let k=0;k<6;k++)kput(d===0?'ddPrim':'ddRustB',[xd+10,D+.15+k*.26,z1+3.5],qEuler(0,rr(-.05,.05),0),[8,.22,3],null);
 if(d===0)ddFigures(xd,D,z1-3,4,4,2,false);
 for(let i=0;i<2;i++)REGISTER({name:'Plate-rolling hall',x:xc+(i-.5)*w/2,z:zc,r:Math.max(dp/2,w/4)*1.02,h:h+R,y:D});}

PORT_SEG({key:'ddYard',name:'Boat yard and slipway',cls:'seg',W:110,LAND:DDY.LAND,SEA:DDY.SEA,decays:[0,1,3],stamps:ddYardStamps,build:buildDdYard});
