// ================================================================ SEGMENT: pier (anchor)
// The largest segment the contract allows: 220 x 420 out to sea. A finger
// pier 120 m wide - a solid MOLE for its first 150 m, then a deck on columns
// out to 412 m - with a terraced white terminal and light on its head. East of
// it the water is dredged into a deep SLIP BASIN (the berth a vessel fragment
// will be placed in: see the hook at the bottom), and a small boat basin with
// a slipway ramp is cut into the land apron. Seeds 20010-20014.
//   d=0 intact   white fascia and coping, glass terminal, cyan lights
//   d=1 ruined   two deck spans collapsed into the sea, the head cut off,
//                basin and slip silted, a barge hulk aground, weeds and trees
//   d=3 reclaimed container houses and stalls on the mole, gardens, a rope
//                bridge over the lost spans, skiffs everywhere, boats hauled
//                out on the slipway
const PP={LAND:80,SEA:420,X0:-90,X1:30,MOLE:150,END:412,BAS:[42,102,-48,0],RAMP:[58,86,-72,-48],HX:-30,HZ:368};
function ppStamps(o){const d=o.d,D=PORT.DECK,B=PP.BAS,R=PP.RAMP;
 const s=[
  {kind:'flat',x0:-110,z0:-PP.LAND,x1:110,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},     // land apron
  {kind:'dig',x0:-110,z0:0,x1:110,z1:PP.SEA,y:d===1?-9:-14,soft:30},                        // the water round the pier
  {kind:'dig',x0:36,z0:0,x1:110,z1:PP.END,y:d===1?-6:-18,soft:22},                          // the slip basin alongside
  {kind:'fill',x0:PP.X0,z0:-2,x1:PP.X1,z1:PP.MOLE,y:D,paint:d>=1?'soil':'pave'},           // the mole (overlaps the apron 2 m)
  {kind:'dig',x0:B[0],z0:B[2],x1:B[1],z1:B[3],y:d===1?-3:-9,soft:0},                       // boat basin cut into the apron
  {kind:'ramp',x0:R[0],x1:R[1],z0:R[2],z1:R[3],axis:'z',ya:D,yb:-2.5,paint:'pave'},         // the slipway down into it
 ];
 if(d===1)s.push({kind:'fill',poly:[[40,14],[98,26],[104,90],[70,150],[40,96]],y:-1.2,soft:18,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:PP.LAND,SEA:PP.SEA}));}

function buildPpPier(scene,gx,gz,d,opt){reseed(20010+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,B=PP.BAS,R=PP.RAMP,X0=PP.X0,X1=PP.X1,HX=PP.HX,HZ=PP.HZ;
 // ---- paving: the apron in five pieces round the basin and the slipway, the mole
 const pv=(a,b,c,e)=>portPaving(G,a,b,c,e,d);
 pv(-110,-PP.LAND,B[0],-1.2);pv(B[0],-PP.LAND,B[1],R[2]);pv(B[0],R[2],R[0],R[3]);pv(R[1],R[2],B[1],R[3]);pv(B[1],-PP.LAND,110,-1.2);
 pv(X0+1.2,-1.2,X1-1.2,PP.MOLE);
 // ---- walls. Faces: the front toward +z, the mole's sides outward, the basin's inward
 portQuayWall(G,-110,0,X0,0,d,{ladders:0});
 portQuayWall(G,X1,0,B[0],0,d,{ladders:0,bollards:0});
 portQuayWall(G,B[1],0,110,0,d,{ladders:0,bollards:0,fenders:0});
 const mW=portQuayWall(G,X0,0,X0,PP.MOLE,d,{face:[-1,0]});
 const mE=portQuayWall(G,X1,0,X1,PP.MOLE,d,{face:[1,0]});
 portQuayWall(G,X0,PP.MOLE,X1,PP.MOLE,d,{top:D-1.6,cope:false,fenders:0,ladders:0,bollards:0});
 const bW=portQuayWall(G,B[0],B[2],B[0],0,d,{face:[1,0],fenders:10,ladders:24,bollards:16});
 const bE=portQuayWall(G,B[1],B[2],B[1],0,d,{face:[-1,0],fenders:10,ladders:24,bollards:16});
 portQuayWall(G,B[0],B[2],R[0],B[2],d,{face:[0,1],fenders:0,ladders:0,bollards:0});
 portQuayWall(G,R[1],B[2],B[1],B[2],d,{face:[0,1],fenders:0,ladders:0,bollards:0});
 portQuayWall(G,R[0],R[2],R[0],R[3],d,{face:[1,0],fenders:0,ladders:0,bollards:0,tide:false});
 portQuayWall(G,R[1],R[2],R[1],R[3],d,{face:[-1,0],fenders:0,ladders:0,bollards:0,tide:false});
 portSideClose(G,opt.nb,d,{z0:-PP.LAND,z1:0});
 // the slipway's own concrete skin, following the ramp
 pbAdd(gridSurface((u,v)=>{const x=R[0]+u*(R[1]-R[0]),z=R[2]+v*(R[3]-R[2]+6);return[x,portH(x,z)+.06,z];},4,12,{uS:(R[1]-R[0])/8,vS:30/8}),CONC(d),G);
 REGISTER({name:'Boat basin and slipway',x:72,z:-40,r:28,h:18,y:-10});
 // ---- the deck on columns, and the head
 const collapse=d>=1?[4,5]:[];
 const deck=portDeckOnPiles(G,X0,PP.MOLE,X1,PP.END,d,{collapse});
 pbBox(G,d>0?MAT.rust:MAT.white,(X0+X1)/2,D-.9,PP.END+.15,X1-X0+.6,2.1,.3,0,8);          // head fascia
 for(let x=X0+2.5;x<X1;x+=5)if(!(d===1&&rng()<.3))kput('pkGuard',[x,D,PP.END-.3],null,1,d>0?new THREE.Color(0x8a5a3a):null);
 for(let x=X0+6;x<X1;x+=12)if(!(d===1&&rng()<.5))kput('pkFender',[x,D-1.8,PP.END+.6],null,[1,5,1],null);
 REGISTER({name:'Great pier — mole',x:-30,z:75,r:56,h:18,y:-6});
 REGISTER({name:'Great pier — deck',x:-30,z:215,r:56,h:16,y:-14});
 REGISTER({name:'Great pier — outer deck',x:-30,z:300,r:40,h:16,y:-14});
 ppTerminal(G,d);
 // the landing stage off the head's east side, and its gangway
 const sink=d===1?-1.6:0;
 kput('plank',[X1+5,.7+sink,HZ+6],d===1?qEuler(.04,0,-.12):null,[6,1.2,30],null);
 beam('plank',[X1+.5,D,HZ-14],[X1+3,1.3+sink,HZ-4],1.6,.12,null);
 // ---- the mole and the apron
 portShed(G,-30,42,56,22,8,d,{name:'Mole transit shed'});
 portShed(G,-52,-52,72,22,9,d,{name:'Apron warehouse',doorSide:1});
 portContainerStack(-6,D,104,Math.PI/2,3,d===0?3:2,d,{big:true});
 portContainerStack(-66,D,108,Math.PI/2,2,2,d,{big:false});
 REGISTER({name:'Mole container block',x:-36,z:106,r:34,h:9,y:D});
 for(let z=12;z<PP.MOLE;z+=34){portLamp(X0+6,D,z,-Math.PI/2,d);portLamp(X1-6,D,z,Math.PI/2,d);}
 for(let z=172;z<332;z+=40){const b=Math.floor((z-PP.MOLE)/((PP.END-PP.MOLE)/deck.bays));if(deck.collapsed.has(b))continue;
  portLamp(X0+3,D,z,-Math.PI/2,d);portLamp(X1-3,D,z,Math.PI/2,d);if(d===0)kput('planter',[-30,D+.4,z+20],null,[10,.8,2.4],null);}
 for(let x=-100;x<=30;x+=44)portLamp(x,D,-6.5,0,d);
 portRail(-110,40,-20,D,d);                                   // stops short of the boat basin
 // ---- the vessel hook: a slip-basin berth x 72, bow out to sea. Nothing is
 // registered yet; when a vessel fragment exists the layout offers it here.
 const vk=portVesselFor(opt,0);
 // The slip is 24..404 m along z, so a vessel up to 380 m fits (the giant is
 // ~370-380). PPV remembers the moored hull so the pier's own dressing keeps out.
 let PPV=null;
 if(vk){const V=PORT_REG.vessel[vk];if(V.beam<=58&&V.length<=380){portPlaceVessel(G,vk,72,24+V.length/2,0,d);
  PPV={x0:72-V.beam/2-4,x1:72+V.beam/2+4,z0:20,z1:28+V.length};}}
 const inPPV=(x,z)=>PPV&&x>PPV.x0&&x<PPV.x1&&z>PPV.z0&&z<PPV.z1;
 if(!vk&&d===0){portBuoy(72,120);portBuoy(72,260);portBuoy(-100,200);}
 if(d===0){portFigures(-30,D,70,14,50);portFigures(-30,D,300,10,40);portFigures(0,D,-30,8,80);
  for(let i=0;i<3;i++)portSkiff(rr(50,95),rr(-40,-8),rr(-.2,.2)+Math.PI*(i%2));}
 if(d===1){
  portWeeds(-105,-78,105,-3,150,D);portWeeds(X0+2,2,X1-2,PP.MOLE-2,140,D);
  portTrees(X0+6,10,X1-6,PP.MOLE-10,9,D,5,11);portTrees(-100,-30,-10,-10,5,D,4,9);
  // the barge hulk aground on the bar in the slip basin
  // (only when no vessel is moored in the slip: it would sit inside the hull)
  if(!PPV){const hk=boxUV(14,7,56,8);hk.rotateZ(.16);hk.rotateY(.12);hk.translate(80,-1.2,70);pbAdd(hk,MAT.rust,G);
  pbBox(G,MAT.rust,78,3.2,86,10,2.2,12,.12,8);
  REGISTER({name:'Barge hulk',x:80,z:72,r:20,h:10,y:-4});}
  kput('pkSkiff',[70,-2.2,-30],qEuler(.3,.8,Math.PI*.8),1,new THREE.Color(0x5a4636));
  kput('pkSkiff',[92,-1.9,-14],qEuler(.2,-1.6,.5),1,new THREE.Color(0x6a5040));
  const zc=deck.bayZ(4)[0];portRubble(-30,D,zc-6,8,20);
  for(let b=0;b<deck.bays;b++){if(deck.collapsed.has(b))continue;const z=deck.bayZ(b);portWeeds(X0+2,z[0]+1,X1-2,z[1]-1,14,D);}}
 if(d>=3){
  // houses along the mole's west edge and on the outer deck, stalls down its middle
  for(let z=16;z<PP.MOLE-10;z+=19)portContainerHouse(G,X0+16+rr(-2,2),D,z,Math.PI/2+rr(-.15,.15),d);
  for(let z=300;z<330;z+=16)portContainerHouse(G,X1-14,D,z,Math.PI/2+rr(-.1,.1),d,{levels:1+(z>310?1:0)});
  for(let z=66;z<PP.MOLE-4;z+=11)portStall(-30+rr(-3,3),D,z,rng()<.5?Math.PI/2:-Math.PI/2);
  portGarden(8,D,20,24,26,d);portGarden(-30,D,130,30,14,d);
  for(let i=0;i<3;i++)portContainerHouse(G,-90+i*17,D,-18,rr(-.1,.1),d,{levels:1});
  // the rope bridge over the lost spans
  const za=deck.bayZ(4)[0]-.5,zb=deck.bayZ(5)[1]+.5,n=Math.round((zb-za)/.6);
  for(let i=0;i<=n;i++){const t=i/n,z=za+(zb-za)*t,y=D-2.2*Math.sin(Math.PI*t);
   const sl=Math.atan(-2.2*Math.PI*Math.cos(Math.PI*t)/(zb-za));
   kput('plank',[-30,y,z],qEuler(-sl,0,0),[2.4,.07,.45],null);}
  for(const sx of [-1.3,1.3])for(let i=0;i<n;i+=3){const t0=i/n,t1=Math.min(1,(i+3)/n);
   beam('plank',[-30+sx,D+1-2.2*Math.sin(Math.PI*t0),za+(zb-za)*t0],[-30+sx,D+1-2.2*Math.sin(Math.PI*t1),za+(zb-za)*t1],.05,.05,new THREE.Color(0x6a5a44));}
  REGISTER({name:'Rope bridge',x:-30,z:(za+zb)/2,r:6,h:8,y:D-4});
  // boats: moored along the mole, in the basin, hauled out on the slipway
  for(const L of mE.ladders.concat(mW.ladders))portSkiff(L[0]+(L[0]>-30?3:-3),L[1]+rr(-3,3),rr(-.15,.15));
  for(let i=0;i<10;i++)portSkiff(rr(46,98),rr(-44,-4),rr(-.3,.3)+Math.PI*(i%2));
  for(let i=0;i<14;i++){const x=rr(40,100),z=rr(20,400),a=rr(-.4,.4);if(!inPPV(x,z))portSkiff(x,z,a);}
  for(let i=0;i<4;i++){const x=R[0]+4+i*6.5,z=rr(-70,-58);portSkiff(x,z,rr(-.1,.1),null,portH(x,z)+.35);}
  portWashLine(X0+6,20,X0+6,60,9,10);portWashLine(-60,-6.5,-16,-6.5,8.5,8);
  portFigures(-30,D,80,30,40);portFigures(-20,D,-30,16,70);portFigures(-30,D,330,10,20);
  portWeeds(X0+2,2,X1-2,PP.MOLE-2,40,D);}
 KOFF=[0,0,0];return G;}

// The terminal on the pier head: three stepped glass drums under white
// terrace slabs, hedged terraces, and a light mast. Ruined: the glass gone,
// the mast down across the terrace, rubble and vines. Reclaimed: the mast
// relit warm (the salvage pass does the rest).
function ppTerminal(G,d){const D=PORT.DECK,HX=PP.HX,HZ=PP.HZ;
 const T=new THREE.Group();T.position.set(HX,D,HZ);G.add(T);
 const tiers=[[30,0,7],[23,7.6,6],[16,14.2,6]];
 const slabC=d>0?new THREE.Color(0x5e5750):new THREE.Color(0xf2efe8);
 for(const [r,y0,h] of tiers){glassBand(T,()=>r,y0,h,d,HX,D,HZ,Math.round(r*1.6));
  kput('slab',[HX,D+y0+h+.35,HZ],null,[r*1.1,.7,r*1.1],slabC);
  if(d===0){const n=Math.round(r*1.2);for(let k=0;k<n;k++){const a=k/n*TAU;kput('hedge',[HX+Math.cos(a)*r*1.02,D+y0+h+1.1,HZ+Math.sin(a)*r*1.02],qEuler(0,-a,0),[1,.8,r*TAU/n*.8],new THREE.Color(0x4a7a3a));}}
  if(d>0){mossOnRing(HX,D+y0+h+.7,HZ,r*.95,Math.round(r*.8),1.6);vinesOnRing(HX,D+y0+h+.2,HZ,r*1.09,Math.round(r*.6),h*.9);}}
 const mastH=26,top=tiers[2][1]+tiers[2][2]+.7;
 if(d===1){kput('pkCol',[HX+2,D+tiers[0][2]+1.2,HZ-18],qEuler(0,.4,Math.PI/2*.97),[.9,mastH,.9],new THREE.Color(0x8a8078));
  rubbleRing(HX,D,HZ,31,40,40,2.2);}
 else{kput('pkCol',[HX,D+top,HZ],null,[.9,mastH,.9],d>0?new THREE.Color(0xa09890):new THREE.Color(0xf4f2ec));
  kput('slab',[HX,D+top+mastH,HZ],null,[2.4,.5,2.4],slabC);
  kput('finial',[HX,D+top+mastH+1.8,HZ],null,1.7,null);
  kput('dot',[HX,D+top+mastH+1.8,HZ],null,[1.6,1.6,1.6],d===0?CYAN:WARM);}
 REGISTER({name:'Pier head terminal',x:HX,z:HZ,r:32,h:top+mastH+4,y:D});}

PORT_SEG({key:'pier',name:'Great pier',cls:'seg',W:220,LAND:PP.LAND,SEA:PP.SEA,decays:[0,1,3],stamps:ppStamps,build:buildPpPier});
