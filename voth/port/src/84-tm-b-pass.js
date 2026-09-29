// ================================================================ SEGMENT: tmPass
// The passenger terminal. A sweeping white Ancient terminal of four terraced
// tiers - each a rounded, sea-bulging plan set back from the one below, glass
// between white slabs, hedged terraces, a wing roof over the crown - standing
// across the apron with a waiting concourse glazed full height on the
// quay. From its first-floor terrace two raised, enclosed boarding bridges
// fan out over the water on V-piers to a liner berth: a platform on piles
// with a boarding tower and a telescopic arm at the end of each bridge. On the
// land side a plaza: a fountain in a paved ring, rows of trees, coaches.
// Seeds 20310-20314.
//   d=0 intact   white and glass, cyan strips, people everywhere
//   d=1 ruined   glass gone, slabs rusting, trees on the terraces, the wing
//                roof holed, the west bridge's spans fallen into the silted
//                berth, the east tower down and its last span with it
//   d=3 reclaimed the concourse a market hall, container houses and gardens
//                on the terraces, the east bridge an enclosed street (lit
//                windows, awnings, roof shacks), the west bridge rebuilt as a
//                timber-and-tarp covered street on trestles, boats at the berth
const TMP={LAND:110,SEA:110,PZ0:56,PZ1:68,YB:PORT.DECK+8.3,
 T:[{cz:-38,ax:46,azF:34,azB:31,h:7.4},{cz:-43,ax:40,azF:24,azB:26,h:6},{cz:-47,ax:31,azF:16,azB:21,h:5.2},{cz:-50,ax:20,azF:10,azB:14,h:4.4}],N:2.6};
// z of a tier's sea face at x
function tmPassFaceZ(t,x){return t.cz+t.azF*Math.pow(Math.max(0,1-Math.pow(Math.abs(x/t.ax),TMP.N)),1/TMP.N);}
function tmPassStamps(o){const d=o.d,h=o.W/2;
 const s=[{kind:'flat',x0:-h,z0:-TMP.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:TMP.SEA,y:d===1?-5:-14,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-50,16],[-12,26],[16,46],[44,64],[30,92],[-18,80],[-46,50]],y:-.7,soft:16,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:TMP.LAND,SEA:TMP.SEA}));}

function buildTmPass(scene,gx,gz,d,opt){reseed(20310+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,gl=[];
 portPaving(G,-h,-TMP.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d,{ladders:30});
 portSideClose(G,opt.nb,d,{z0:-TMP.LAND,z1:0});
 tmPassTerminal(G,d,gl);
 tmPassPlaza(G,d);
 // ---- the liner berth platform on piles, with fascia, fenders and bollards
 const Z0=TMP.PZ0,Z1=TMP.PZ1;
 portDeckOnPiles(G,-46,Z0,46,Z1,d,{bay:12,colX:11.5,guard:false,fascia:false});
 for(const z of [Z0-.15,Z1+.15])pbBox(G,d>0?MAT.rust:MAT.white,0,D-.9,z,92.6,2.1,.3,0,8);
 for(let x=-44;x<=44;x+=8){if(!(d===1&&rng()<.4))kput('pkFender',[x,D-1.4,Z1+.55],null,[1,5,1],null);
  if(!(d>0&&rng()<.3))kput('pkBollard',[x+4,D,Z1-1.4],qEuler(0,rng()*TAU,0),1,d>0?new THREE.Color(0x9a6040):null);}
 for(let x=-44;x<=44;x+=5)if(!(d===1&&rng()<.35))kput('pkGuard',[x+2.5,D,Z0+.3],null,1,d>0?new THREE.Color(0x8a5a3a):null);
 REGISTER({name:'Liner berth platform',x:-24,z:(Z0+Z1)/2,r:10,h:8,y:D-3});REGISTER({name:'Liner berth platform',x:24,z:(Z0+Z1)/2,r:10,h:8,y:D-3});
 // ---- the two boarding bridges
 for(const s of [-1,1])tmPassBridge(G,d,s,gl);
 for(let x=-40;x<=40;x+=20)portLamp(x,D,-2.2,0,d);
 // ---- a liner alongside if a vessel fits, else a tender and buoys
 const vk=portVesselFor(opt,0);let placed=false;
 if(vk){const V=PORT_REG.vessel[vk];if(V.length<=opt.W-12&&V.beam<=28){portPlaceVessel(G,vk,0,Z1+13+V.beam/2,Math.PI/2,d);placed=true;}}
 if(d===0){if(!placed){portBuoy(-30,92);portBuoy(30,96);portSkiff(-10,76,Math.PI/2,new THREE.Color(0xe8e4dc));}
  portFigures(0,D,-2,14,40);portFigures(0,D,(Z0+Z1)/2,10,36);}
 if(d===1){portWeeds(-h+4,-4,h-4,-1.5,30,D);kput('pkSkiff',[-26,-.5,40],qEuler(.25,.7,Math.PI*.85),1,new THREE.Color(0x6a4a3a));
  portWeeds(-44,Z0+1,44,Z1-1,40,D);}
 if(d>=3){
  for(const L of wall.ladders)portSkiff(L[0]+rr(-3,3),L[1]+2.6,Math.PI/2+rr(-.15,.15));
  for(let x=-40;x<=40;x+=rr(5,9))portSkiff(x,Z1+4+rr(0,4),Math.PI/2+rr(-.2,.2));
  for(let i=0;i<8;i++)portSkiff(rr(-h+10,h-10),rr(8,50),rng()*TAU);
  portContainerHouse(G,-12,D,62,rr(-.05,.05),d,{levels:1,big:true});portContainerHouse(G,12,D,61.5,rr(-.05,.05),d,{levels:2,big:false});
  portWashLine(-40,Z0+2,-20,Z0+2,D+2.4,8);portWashLine(20,Z1-2,40,Z1-2,D+2.4,7);
  for(let x=-40;x<40;x+=10)kput('pkCloth',[x+rr(-2,2),D+2.2,Z1+.4],qEuler(0,0,0),[rr(2,4),rr(1.5,2.2),1],new THREE.Color().setHSL(rr(.05,.6),.3,rr(.3,.5)));   // nets drying
  portFigures(0,D,(Z0+Z1)/2,14,36);portFigures(0,D,-2,10,40);}
 if(gl.length)meshMerged(gl,MAT.glass,G);
 KOFF=[0,0,0];return G;}

// The terraced terminal.
function tmPassTerminal(G,d,gl){const D=PORT.DECK,T=TMP.T,N=TMP.N,NU=72,shell=SHELL(d);
 const P=(t,k)=>tmPlanOff(0,t.cz,t.ax,t.azF,t.azB,N,k);
 let y=D;const ys=[];
 T.forEach((t,i)=>{ys.push(y);const top=y+t.h+.8,hole=d>0?holeFn(d,50+i,null,1.3):null;
  // glass wall (intact) and what shows behind it
  if(i===0){pbAdd(tmBandGeo(P(t,-7),y,t.h,NU,1),d>0?MAT.dark:MAT.tmFloor,G);          // the concourse's back wall, lit
   for(let k=0;k<30;k++){const p=P(t,-3.6)((k+.5)/30);kput(d>0?'postR':'postW',[p[0],y+t.h/2,p[1]],null,[.45,t.h,.45],null);}
   if(d===0)for(let k=0;k<5;k++){const p=P(t,-4.5)(rr(.05,.45));portFigures(p[0],y,p[1],3,2);}}
  else pbAdd(tmBandGeo(P(t,-1.8),y,t.h,NU,1),MAT.dark,G);
  if(d===0)gl.push(tmBandGeo(P(t,0),y,t.h,NU,1));
  tmMullions(P(t,0),Math.round(tmPerim(P(t,0))/3.6),y,t.h,d);
  // the slab that roofs it, its sweeping white fascia and parapet, the terrace hedge
  pbAdd(tmSlabGeo(P(t,1.4),NU,top,.8),CONC(d),G);
  // (tier 0: the parapet and hedges open where the boarding bridges cross)
  const xing=p=>i===0&&p[1]>t.cz&&Math.abs(Math.abs(p[0])-17.4)<3.4;
  pbAdd(tmBandGeo(P(t,1.5),top-1.5,2.4,NU*2,2,(u,v)=>(v>.5&&xing(P(t,1.5)(u)))||(hole&&hole(u*4,top*6+v*6))),shell,G);
  if(d===0)tmStripRing(P(t,1.62),30,top-.9,d);
  tmHedgeRing(P(t,.6),Math.round(tmPerim(P(t,.6))/5),top,d,xing);
  if(d>0){for(let k=0;k<Math.round(t.ax*(d===1?.6:.25));k++){const p=P(t,1.6)(rng());
   kput('vine',[p[0],top+.8,p[1]],qEuler(rr(-.1,.1),rng()*TAU,0),[rr(.9,1.6),rr(3,t.h+1.5),rr(.9,1.6)],null);}}
  y=top;});
 const crown=y;
 // the wing roof over the crown: a thin shell rising to the middle, its front edge bulging to the sea
 const wx=34,wz0=-64,holeW=d>0?holeFn(d,59,null,1):null;
 const wing=(u,v)=>{const x=(u-.5)*2*wx,f=1-Math.pow(x/wx,2),z1=-30-2+6*f,z=wz0+v*(z1-wz0);
  return[x,crown+2.4+5.5*f+1.2*Math.sin(Math.PI*v),z];};
 pbAdd(gridSurface(wing,24,8,{uS:wx/4,vS:4,hole:holeW?(u,v)=>(d===1&&u>.62&&v>.3)||holeW(u*3,v*40):null}),shell,G);
 pbAdd(gridSurface((u,v)=>{const p=wing(u,1);return[p[0],p[1]-v*.9,p[2]];},24,1,{uS:wx/4,vS:.2}),shell,G);   // the front edge
 for(const [x,z] of [[-14,-56],[14,-56],[-14,-42],[14,-42]]){const z1=-32+6*(1-Math.pow(x/wx,2)),p=wing(.5+x/(2*wx),(z-wz0)/(z1-wz0));
  if(d===1&&x>0&&z>-50){beam('postR',[x,crown,z],[x+6,crown+1.2,z+5],.35,.35,null);continue;}
  kput(d>0?'postR':'postW',[x,(crown+p[1])/2,z],null,[.35,p[1]-crown,.35],null);}
 if(d===0)kput('strip',[0,crown+7.6,-29.6],null,[40,1.3,1],CYAN);
 // terraces: trees and people (intact); trees gone wild (ruined); houses and gardens (reclaimed)
 for(let i=0;i<3;i++){const t=T[i],tu=T[i+1],top=ys[i+1];
  const pts=[];for(let k=0;k<14;k++){const x=rr(-t.ax*.8,t.ax*.8),zf=tmPassFaceZ(t,x),zb=tmPassFaceZ(tu,x);if(zf-zb>5)pts.push([x,rr(zb+2,zf-2.5)]);}
  if(d===0){pts.slice(0,5-i).forEach((p,k)=>{kput('planter',[p[0],top+.35,p[1]],null,[2.2,.7,2.2],new THREE.Color(0xe8e4dc));VEG.tree(p[0],top+.7,p[1],k%3,rr(3.5,5.5));});
   portFigures(0,top,(tmPassFaceZ(t,0)+tmPassFaceZ(tu,0))/2,8-2*i,t.ax*.6);}
  if(d===1)pts.forEach((p,k)=>{if(k<7-i)VEG.tree(p[0],top,p[1],k%3,rr(4,9));else kput('leafCard',[p[0],top+.5,p[1]],qEuler(0,rng()*TAU,0),[rr(1,2),rr(.6,1),rr(1,2)],new THREE.Color().setHSL(rr(.2,.3),.45,.45));});
  if(d>=3){if(i<2)[-.55,.5].forEach((f,k)=>{const x=f*t.ax,z=(tmPassFaceZ(t,x)+tmPassFaceZ(tu,x))/2;portContainerHouse(G,x,top,z,portYaw(1,(tmPassFaceZ(t,x+1)-tmPassFaceZ(t,x-1))/2)+rr(-.1,.1),d,{levels:1+((i+k)%2),big:false});});
   const z0=(tmPassFaceZ(t,0)+tmPassFaceZ(tu,0))/2;portGarden(0,top,z0,t.ax*.5,Math.max(3,tmPassFaceZ(t,0)-tmPassFaceZ(tu,0)-4),d);
   portWashLine(-t.ax*.4,z0-2,t.ax*.1,z0-2,top+2.2,7);portFigures(0,top,z0,6,t.ax*.5);}}
 if(d===1){for(let i=0;i<14;i++){const p=P(T[0],2)(rr(.02,.48));portRubble(p[0],D,p[1],2.2,5);}
  for(let i=0;i<30;i++){const p=P(T[0],2)(rng());kput('rubble',[p[0]+rr(-1,1),D+.1,p[1]+rr(-1,1)],qEuler(rng()*3,rng()*3,rng()*3),[rr(.2,.5),rr(.04,.1),rr(.2,.5)],new THREE.Color(0x8aa0a8));}}
 if(d>=3){// the concourse a market hall: stall rows inside and under the terrace lip, warm lamps
  const t=T[0];for(let k=0;k<18;k++){const u=rr(.06,.44),p=P(t,-3)(u),q=P(t,-3)(u+.01);portStall(p[0],D,p[1],portYaw(q[0]-p[0],q[1]-p[1])+Math.PI);}
  for(let k=0;k<14;k++){const p=P(t,-5.5)(rr(.04,.46));kput('dot',[p[0],D+t.h-1.4,p[1]],null,[.6,.6,.6],WARM);}
  portFigures(0,D,-10,18,30);}
 REGISTER({name:'Passenger terminal — concourse',x:-24,z:-38,r:22,h:9,y:D});REGISTER({name:'Passenger terminal — concourse',x:24,z:-38,r:22,h:9,y:D});
 REGISTER({name:'Passenger terminal — terraces',x:0,z:-45,r:30,h:crown-D,y:D+8});
 REGISTER({name:'Passenger terminal — wing roof',x:0,z:-48,r:22,h:10,y:crown});}

// One boarding bridge, s = -1 west, +1 east: three spans from the first-floor
// terrace over the quay on two V-piers to a boarding tower on the platform,
// then the telescopic arm down toward the ship's door.
function tmPassBridge(G,d,s,gl){const D=PORT.DECK,yb=TMP.YB,T1=TMP.T[1];
 const xA=s*16,A=[xA,yb,tmPassFaceZ(T1,xA)-.6],Tw=[s*30,yb,(TMP.PZ0+TMP.PZ1)/2-4.6],tc=[s*30,(TMP.PZ0+TMP.PZ1)/2];
 const at=z=>{const t=(z-A[2])/(Tw[2]-A[2]);return[A[0]+(Tw[0]-A[0])*t,yb,z];};
 const S1=at(10),S2=at(34),pts=[A,S1,S2,Tw];
 // the fate of each span: 'up' standing, 'fallA' hinged at its land end, 'fallB' at its sea end, 'gone', 'timber'
 let fate=['up','up','up'],tower='up';
 if(d===1){if(s<0)fate=['up','fallA','fallB'];else{fate=['up','up','fallA'];tower='down';}}
 if(d>=3&&s<0)fate=['up','timber','timber'];
 for(let i=0;i<3;i++){const a=pts[i],b=pts[i+1],f=fate[i];
  if(f==='up'){const M=tmSpanM(a,b);tmTube(G,d,M,M.L,{w:4.6,h:3.4,sd:60+i+(s>0?5:0)});
   if(d>=3&&s>0)tmPassStreet(G,d,M);}
  else if(f==='fallA'){const F=tmFallM(a,b,.8,s*.08);tmTube(G,d,F,F.L*.96,{w:4.6,h:3.4,sd:70+i});}
  else if(f==='fallB'){const F=tmFallM(b,a,.5,-s*.1);tmTube(G,d,F,F.L*.96,{w:4.6,h:3.4,sd:75+i});}}
 if(fate[1]==='timber')tmPassTimberStreet(G,d,S1,[tc[0],yb,tc[1]-4.4]);
 // V-piers under S1 and S2 (in the water)
 for(const S of [S1,S2]){const gy=portH(S[0],S[2])-1;
  for(const k of [-1,1])beam(d>0?'postR':'postW',[S[0]+k*.8,gy,S[2]],[S[0]+k*2.6,yb-.5,S[2]],.55,.55,null);
  kput(BOXC(d),[S[0],yb-.55,S[2]],null,[6.4,.6,1.4],null);}
 // the boarding tower
 const th=13.5,R=4.2;
 if(tower==='up'){pbAdd(lathe({rFn:()=>R,H:th,nu:28,nv:1}).translate(tc[0],D,tc[1]),SHELL(d),G);
  kput('slab',[tc[0],D+th+.3,tc[1]],null,[R+.8,.6,R+.8],d>0?new THREE.Color(0x6e665e):new THREE.Color(0xf2efe8));
  kput(d>0?'paneD':'pane',[tc[0],D+th*.5,tc[1]+R+.02],null,[1.6,th-3,1],null);
  kput(d>0?'paneD':'pane',[tc[0]+s*(R+.02),D+th*.5,tc[1]],qEuler(0,Math.PI/2,0),[1.6,th-3,1],null);
  if(d===0)stripRing(tc[0],D+th-.6,tc[1],R+.1,d,14);
  // the telescopic arm: from the tower's sea face down toward the ship's door
  const a0=[tc[0]+s*1.2,yb,tc[1]+R-.3],a1=[tc[0]+s*3.5,D+4.4,TMP.PZ1+11];
  if(d===1&&s<0){const F=tmFallM(a0,a1,.4,.3);tmTube(G,d,F,F.L*.95,{w:3.4,h:2.9,sd:81,rise:.6});}
  else{const M=tmSpanM(a0,a1);tmTube(G,d,M,M.L,{w:3.4,h:2.9,sd:82,rise:.6});
   tmWith(M,()=>{kput('boxD',[0,1.5,M.L+.6],null,[4,3.4,1.4],null);   // the bellows hood at the door
    kput(BOXC(d),[0,-1.2,M.L-3],null,[1.2,2,1.2],null);});                 // the cab and its wheel bogie
   beam(d>0?'postR':'postW',[a1[0],D,a1[2]-3],[a1[0],a1[1]-.4,a1[2]-3],.3,.3,null);}
  if(d>=3){kput('shantyBox',[tc[0],D+th+2,tc[1]],qEuler(0,rng()*TAU,0),[5,3,4],null);kput('shantyRoof',[tc[0],D+th+3.7,tc[1]],qEuler(.15,rng()*TAU,0),[6.4,1,5.4],null);
   kput('pkDish',[tc[0]+s*2,D+th+.6,tc[1]-2],qEuler(0,rng()*TAU,0),[1.5,1.5,1.5],null);kput('dot',[tc[0],D+th+2,tc[1]+2.6],null,[1,1,1],WARM);}}
 else{// d=1 east: the tower broke off at a third of its height and lies across the platform into the water
  pbAdd(lathe({rFn:()=>R,H:th*.35,cut:th*.35,jag:1.4,nu:28,nv:2,seed:9}).translate(tc[0],D,tc[1]),SHELL(d),G);
  const g=lathe({rFn:()=>R,H:th*.62,nu:24,nv:1});g.rotateX(Math.PI/2*.94);g.rotateY(s*.5);g.translate(tc[0]+s*3,D+R*.85,tc[1]+2);pbAdd(g,SHELL(d),G);
  // its roof slab, fallen off the end into the water
  kput('slab',[tc[0]+s*(3+Math.sin(s*.5)*th*.66),-.9,tc[1]+3+Math.cos(.5)*th*.66],qEuler(.3,s*.5,.12),[R+.8,.6,R+.8],new THREE.Color(0x4e4640));
  portRubble(tc[0],D,tc[1],5,16);}
 REGISTER({name:'Boarding tower',x:tc[0],z:tc[1],r:R+.8,h:th+2,y:D});
 const mid=at(0),m2=at(22),m3=at(46);
 REGISTER({name:'Boarding bridge',x:mid[0],z:mid[2],r:6,h:6,y:yb-1.5});REGISTER({name:'Boarding bridge',x:m2[0],z:m2[2],r:7,h:6,y:yb-1.5});
 REGISTER({name:'Boarding bridge',x:m3[0],z:m3[2],r:7,h:6,y:d===1?-1:yb-1.5});
 if(d===0)tmWith(tmSpanM(A,Tw),()=>{for(let k=0;k<6;k++)portFigures(rr(-1,1),0,rr(4,80),1,.4);});}

// Reclaimed east bridge: an enclosed street - lit windows, awnings and
// cloth hung on its flanks, shacks on the roof, a stair down to the boats.
function tmPassStreet(G,d,M){tmWith(M,()=>{const L=M.L;
 for(let z=3;z<L-2;z+=rr(3,6)){const s=rng()<.5?-1:1;kput('dot',[s*2.45,1.9,z],qEuler(0,Math.PI/2,0),[.9,.9,.4],WARM);
  if(rng()<.5)kput('pkAwn',[s*3.2,2.9,z],qEuler(0,Math.PI/2,s*.3),[2.6,1,1.4],new THREE.Color().setHSL(rng(),rr(.3,.6),rr(.45,.65)));}
 for(let z=4;z<L-4;z+=rr(7,12)){const w=rr(2.4,3.8),hh=rr(2,2.8);kput('shantyBox',[rr(-.6,.6),4.2+hh/2,z],qEuler(0,rr(-.2,.2),0),[w,hh,rr(2.5,4)],null);
  kput('shantyRoof',[0,4.3+hh,z],qEuler(rr(.08,.2),rr(-.2,.2),0),[w*1.3,1,4.4],null);}
 for(let k=0;k<6;k++)portFigures(rr(-1,1),0,rr(2,L-2),1,.3);});}
// Reclaimed west bridge: the fallen tubes' line rebuilt as a covered street
// of timber and tarp on trestles, from pier S1 to the tower.
function tmPassTimberStreet(G,d,a,b){const M=tmSpanM(a,b),L=M.L;
 tmWith(M,()=>{kput('plank',[0,-.1,L/2],null,[4.2,.22,L],null);
  for(let z=1;z<L;z+=3.2){for(const s of [-1,1])kput('plank',[s*2,1.5,z],null,[.16,3,.16],null);
   kput('shantyRoof',[0,3.2,z+1.6],qEuler(0,0,rr(-.12,.12)),[5,1,3.4],null);
   if(rng()<.55)kput(rng()<.5?'patchTarp':'patchBoard',[rng()<.5?-2.05:2.05,1.4,z+1.6],qEuler(0,Math.PI/2,rr(-.08,.08)),[3.1,rr(1.6,2.6),1],null);
   if(rng()<.3)kput('dot',[0,2.8,z+1.6],null,[.5,.5,.5],WARM);}
  for(let z=6;z<L-3;z+=rr(6,9))portStall(rng()<.5?-1.2:1.2,0,z,rng()<.5?Math.PI/2:-Math.PI/2);
  for(let k=0;k<7;k++)portFigures(rr(-1,1),0,rr(2,L-2),1,.3);});
 // trestles: timber piles down to the seabed every ~8 m
 for(let t=.12;t<.95;t+=.16){const x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,gy=portH(x,z)-.5;
  for(const k of [-1.8,1.8])kput('pkPile',[x+k,gy,z],null,[.22,a[1]-gy-.2,.22],null);}
 REGISTER({name:'Timber street',x:(a[0]+b[0])/2,z:(a[2]+b[2])/2,r:10,h:6,y:a[1]-1});}

// The land-side plaza: a paved ring round a fountain, rows of trees in
// planters, benches, lamps, coaches at the kerb, the entrance canopy.
function tmPassPlaza(G,d){const D=PORT.DECK,fx=0,fz=-90,T0=TMP.T[0];
 // inlaid rings and radial joints in the paving
 const pc=d>0?new THREE.Color(0x9a948a):new THREE.Color(0xe8e2d4);
 for(const r of [9.5,14,18.5])kput('tmRingMk',[fx,D+.07,fz],null,[r,1,r],pc);
 for(let k=0;k<16;k++){if(d===1&&rng()<.4)continue;const a=k/16*TAU;kput('tmLine',[fx+Math.cos(a)*14,D+.065,fz+Math.sin(a)*14],qEuler(0,-a,0),[9,1,.18],pc);}
 // the fountain
 kput(SLABC(d),[fx,D+.4,fz],null,[8,.8,8],null);kput(SLABC(d),[fx,D+1.2,fz],null,[2.2,2.4,2.2],null);
 if(d===0){const w=new THREE.Mesh(new THREE.CircleGeometry(7.6,32).rotateX(-Math.PI/2),MAT.water);w.position.set(fx,D+.72,fz);G.add(w);
  kput('finial',[fx,D+3.3,fz],null,[1.2,1.6,1.2],null);
  for(let k=0;k<8;k++){const a=k/8*TAU;kput('pkCloth',[fx+Math.cos(a)*2.6,D+2.6,fz+Math.sin(a)*2.6],qEuler(0,-a+Math.PI/2,0),[.25,1.8,1],new THREE.Color(0xdaf0ff));}}
 if(d===1){kput('moss',[fx,D+.8,fz],null,[7,.3,7],new THREE.Color(0x4a3a28));portWeeds(fx-6,fz-6,fx+6,fz+6,20,D+.8);VEG.tree(fx+2,D+.8,fz-1,0,8);}
 if(d>=3){portGarden(fx,D+.8,fz,10,10,d);}
 // tree rows in planters, benches between
 for(const z of [-80,-102])for(let x=-40;x<=40;x+=10){if(Math.abs(x)<12&&z===-80)continue;
  if(d===0)kput('planter',[x,D+.4,z],null,[2.4,.8,2.4],new THREE.Color(0xe8e4dc));
  if(d===1&&rng()<.25)continue;
  VEG.tree(x+(d===1?rr(-1,1):0),D+(d===0?.8:0),z+(d===1?rr(-1,1):0),(x/10+3)%3|0,d===1?rr(7,12):rr(5,7));
  if(d===0&&x<40)kput('plank',[x+5,D+.45,z],null,[3,.12,.7],null);}
 // coaches at the kerb on the west
 const coach=(x,z,yaw,dd,tilt)=>{const q=qEuler(tilt||0,yaw,0);const c=dd>0?new THREE.Color(0x9a6a50):new THREE.Color().setHSL(rr(0,1),.25,.8);
  kput('tmCoach',[x,D,z],q,1,c);kput('tmCoachWin',[x,D,z],q,1,null);if(!(dd===1))kput('tmCoachWheels',[x,D,z],q,1,null);};
 if(d===0){coach(-38,-94,0,0);coach(-38,-98.5,0,0);coach(34,-96,Math.PI,0);portFigures(0,D,-88,24,30);}
 if(d===1){coach(-37,-95,.12,1,.05);portWeeds(-50,-108,50,-72,160,D);portTrees(-48,-106,-10,-74,4,D,5,11);}
 if(d>=3){for(let x=-27;x<=27;x+=6)for(const z of [-86,-94])if(Math.abs(x)>9)portStall(x+rr(-1,1),D,z,z<-90?0:Math.PI);
  portContainerHouse(G,-37,D,-94,rr(-.1,.1),d,{levels:2,big:true});portContainerHouse(G,36,D,-94,rr(-.1,.1),d,{levels:1,big:true});
  portFigures(0,D,-90,34,34);}
 // the entrance canopy: a curved white lip over the terminal's back doors, on posts
 const P=tmPlanOff(0,T0.cz,T0.ax,T0.azF,T0.azB,TMP.N,0),hole=d>0?holeFn(d,93,null,1.4):null;
 const band=(u,v)=>{const p=P(.55+u*.4),q=tmPlanOff(0,T0.cz,T0.ax,T0.azF,T0.azB,TMP.N,7.5)(.55+u*.4);
  return[lerp(p[0],q[0],v),D+5.2+.8*v,lerp(p[1],q[1],v)];};
 pbAdd(gridSurface(band,28,2,{uS:10,vS:1,hole:hole?(u,v)=>hole(u*4,v*20):null}),SHELL(d),G);
 for(let k=1;k<10;k++){const p=band(k/10,.92);if(d===1&&rng()<.3)continue;kput(d>0?'postR':'postW',[p[0],D+(p[1]-D)/2,p[2]],null,[.22,p[1]-D,.22],null);}
 if(d===0)for(let k=0;k<10;k++){const p=band((k+.5)/10,1);kput('dot',[p[0],p[1]-.2,p[2]],null,[.6,.2,.6],CYAN);}
 REGISTER({name:'Plaza fountain',x:fx,z:fz,r:9,h:5,y:D});REGISTER({name:'Plaza trees',x:-25,z:-81,r:6,h:9,y:D});REGISTER({name:'Plaza trees',x:25,z:-81,r:6,h:9,y:D});}
// a coach, 12 m, along local +x, bottom centre
kdef('tmCoach',pkMergeGeo([new THREE.BoxGeometry(12,2.7,2.5).translate(0,2.05,0),new THREE.BoxGeometry(11.6,.25,2.3).translate(0,3.5,0)]),MAT.pkPaint);
kdef('tmCoachWin',new THREE.BoxGeometry(11.2,.95,2.56).translate(-.2,2.75,0),MAT.darkGlass);
kdef('tmCoachWheels',pkMergeGeo([4,2.8,-4].flatMap(x=>[-1.05,1.05].map(z=>new THREE.CylinderGeometry(.5,.5,.4,8).rotateX(Math.PI/2).translate(x,.5,z)))),MAT.pkRubber);

PORT_SEG({key:'tmPass',name:'Passenger terminal',cls:'seg',W:110,LAND:TMP.LAND,SEA:TMP.SEA,decays:[0,1,3],stamps:tmPassStamps,build:buildTmPass});
