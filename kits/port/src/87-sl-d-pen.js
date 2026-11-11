// ================================================================ SEGMENT: slPen
// A covered submarine pen, 110 x 196 m: a massive Ancient concrete bunker
// straddling the quay line, three wet bays (22, 24, 22 m) between walls
// 6.5 m thick, a quay ledge down each side of every bay, a roof 7 m thick
// carrying a grid of deep burster beams, a cantilevered front lip over the
// bay mouths with sliding blast doors, and a stepped brutalist control tower
// on the landward corner (after the brutalism sheet: stacked, cantilevered,
// slot-windowed masses). The submarine (slSub) lies in the middle bay, bow out.
// Seeds 20630-20634.
//   d=0 intact    pale board-formed concrete, steel doors, cyan strip lights,
//                 a floating workshop in bay 3, crew on the ledges
//   d=1 ruined    the roof over bay 3's mouth collapsed into it, burster beams
//                 broken, a door leaf fallen, the tower's head gone, trees and
//                 moss on the roof, the sub rolled and half-sunk, bays silted
//   d=3 reclaimed a village on the roof (houses across the beams, gardens,
//                 solar, masts), stair towers up the back, houseboats and rafts
//                 in the bays, banners over the mouths, stalls on the apron
const SLP={LAND:60,SEA:196,X:47,ZB:-44,ZF:176,ZL:182,BZ:-36,Y0:20,Y1:27,YB:31,OPEN:17,LEDGE:2.2,
 BAYS:[[-40.5,-18.5],[-12,12],[18.5,40.5]],WALLS:[[-47,-40.5],[-18.5,-12],[12,18.5],[40.5,47]],
 TW:[-44,-20,-42,-18]};
function slPenStamps(o){const d=o.d,h=o.W/2,D=PORT.DECK;
 const s=[{kind:'flat',x0:-h,z0:-SLP.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
          {kind:'dig',x0:-h,z0:0,x1:h,z1:SLP.SEA,y:d===1?-7:-14,soft:30}];
 for(const b of SLP.BAYS)s.push({kind:'dig',x0:b[0],z0:SLP.BZ,x1:b[1],z1:0,y:d===1?-5:-13,soft:0});
 return s.concat(portEdgeStamps(o,{LAND:SLP.LAND,SEA:SLP.SEA}));}
// the roof's lost rect at d=1 (over bay 3's mouth)
const SLP_LOST=[12,47,112,SLP.ZL];
function slPenLost(d,x,z){const L=SLP_LOST;return d===1&&x>L[0]&&x<L[1]&&z>L[2]&&z<L[3];}

// The control tower: stacked masses, a cantilevered slab, a finned shaft, an
// observation box looking out to sea, a mast. d=1 stops at the slab, broken.
function slPenTower(G,d){const T=SLP.TW,cx=(T[0]+T[1])/2,cz=(T[2]+T[3])/2,Y=SLP.Y1,c=CONC(d),w=T[1]-T[0],dp=T[3]-T[2];
 pbBox(G,c,cx,Y+9,cz,w,18,dp,0,8);
 for(let i=0;i<7;i++)for(const [fx,fz,q] of [[cx-9+i*3,cz+dp/2+.05,null],[T[1]+.05,cz-9+i*3,qEuler(0,Math.PI/2,0)]])
  kput(d===0&&rng()<.5?'dot':'cellD',[fx,Y+10,fz],q,d===0?[.5,9,.2]:[.7,12,.2],d===0?WARM:null);   // slot windows
 pbBox(G,WIN(d),cx,Y+19,cz,w-1.6,2,dp-1.6,0,8);
 pbBox(G,c,cx+1,Y+23,cz+1,29,6,30,0,8);                                   // the cantilevered slab
 for(let i=0;i<9;i++)kput(d>0?'cellD':'dot',[cx+1-12+i*3,Y+23,cz+16.05],null,d>0?[1.6,.8,.2]:[1.1,.55,.2],d>0?null:WARM);
 if(d===1){portRubble(cx,Y+26,cz,7,26);rubbleRing(cx,Y+26,cz,2,9,10,2);
  for(let i=0;i<5;i++)VEG.tree(cx+rr(-10,10),Y+26,cz+rr(-10,10),i%3,rr(4,8));
  for(let i=0;i<16;i++)kput('vine',[cx+rr(-14,14),Y+26,cz+16.2],qEuler(0,rng()*TAU,0),[1,rr(3,9),1],null);
  return Y+26;}
 pbBox(G,c,cx,Y+34,cz-2,16,16,16,0,8);
 for(let i=-3;i<=3;i++)pbBox(G,c,cx+i*2.3,Y+34,cz+6.4,.8,16,1.4,0,8);       // vertical fins on its sea face
 pbBox(G,c,cx,Y+42.5,cz+4,18,1,26,0,8);pbBox(G,WIN(d),cx,Y+44.5,cz+4,17.4,3,25.4,0,8);pbBox(G,c,cx,Y+46.7,cz+4,19,1.4,27,0,8);
 kput('pkCol',[cx,Y+47.4,cz],null,[.5,14,.5],d>0?new THREE.Color(0xa09080):null);
 kput('pkDish',[cx+2,Y+52,cz],qEuler(0,1.2,0),1.4,null);kput('pkDish',[cx-2,Y+56,cz],qEuler(0,-1.6,0),1.1,null);
 kput('dot',[cx,Y+61.6,cz],null,[.7,.7,.7],d===0?new THREE.Color(0xff5040):WARM);
 if(d===0)kput('strip',[cx,Y+47.45,cz+17.55],null,[19,1,1],CYAN);
 return Y+61.6;}

function buildSlPen(scene,gx,gz,d,opt){reseed(20630+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,X=SLP.X,ZB=SLP.ZB,ZF=SLP.ZF,Y0=SLP.Y0,Y1=SLP.Y1,c=CONC(d),LE=SLP.LEDGE;
 // ---- apron round the bunker, the quay wall either side of it, the sides
 portPaving(G,-h,-SLP.LAND,h,-1.2,d,{hole:(x,z)=>x>-X-.5&&x<X+.5&&z>ZB-.5});
 portQuayWall(G,-h,0,-X,0,d,{ladders:0});portQuayWall(G,X,0,h,0,d,{ladders:0});
 portSideClose(G,opt.nb,d,{z0:-SLP.LAND,z1:0});
 // ---- the walls between the bays, ledges down every bay side, the back quays
 const yb=-18;
 for(const w of SLP.WALLS){const wz=(ZB+ZF)/2;pbBox(G,c,(w[0]+w[1])/2,(Y0+yb)/2,wz,w[1]-w[0],Y0-yb,ZF-ZB,0,8,true);
  pbBox(G,MAT.pkTide,(w[0]+w[1])/2,-.45,ZF+.08,w[1]-w[0],2.7,.14,0,8,true);}
 const bayW=[];
 SLP.BAYS.forEach((b,i)=>{const o={fenders:14,ladders:40,bollards:20};
  bayW.push(portQuayWall(G,b[0]+LE,SLP.BZ,b[0]+LE,ZF,d,Object.assign({face:[1,0]},o)));
  bayW.push(portQuayWall(G,b[1]-LE,SLP.BZ,b[1]-LE,ZF,d,Object.assign({face:[-1,0]},o)));
  portQuayWall(G,b[0]+LE,SLP.BZ,b[1]-LE,SLP.BZ,d,{face:[0,1],fenders:0,ladders:0,bollards:0});
  portPaving(G,b[0],ZB+4,b[1],SLP.BZ-2.5,d);
  // lintel over the mouth, gantry beams across under the roof, strip lights
  pbBox(G,c,(b[0]+b[1])/2,(SLP.OPEN+Y0)/2,ZF-1.5,b[1]-b[0],Y0-SLP.OPEN,3,0,8);
  for(const z of [10,60,100,150]){if(slPenLost(d,(b[0]+b[1])/2,z))continue;pbBox(G,d>0?MAT.rust:MAT.pkSteel,(b[0]+b[1])/2,Y0-2.6,z,b[1]-b[0],1.4,1.4,0,8);}
  for(let z=-26;z<ZF-10;z+=20){if(slPenLost(d,(b[0]+b[1])/2,z))continue;
   if(d===0||(d>=3&&rng()<.6))kput('strip',[(b[0]+b[1])/2,Y0-.15,z],qEuler(0,Math.PI/2,0),[14,1.2,1.2],d===0?CYAN:WARM);}});
 // the rear wall with its doors and slot windows
 pbBox(G,c,0,(D+Y0)/2,ZB+2,2*X,Y0-D,4,0,8);
 for(const b of SLP.BAYS){const xm=(b[0]+b[1])/2;kput('boxD',[xm,D+2.6,ZB-.05],null,[6,5.2,.3],null);
  for(let x=b[0]+2;x<b[1]-1;x+=3.2)kput(d===0&&rng()<.5?'dot':'cellD',[x,D+11,ZB-.05],null,d===0?[1.6,.5,.2]:[2.2,.7,.2],d===0?CYAN:null);}
 // ---- the roof, the burster grid, the front lip
 const roofRects=d===1?[[-X,ZB,X,SLP_LOST[2]],[-X,SLP_LOST[2],SLP_LOST[0],SLP.ZL]]:[[-X,ZB,X,SLP.ZL]];
 for(const r of roofRects){pbBox(G,c,(r[0]+r[2])/2,(Y0+Y1)/2,(r[1]+r[3])/2,r[2]-r[0],Y1-Y0,r[3]-r[1],0,8);}
 const T=SLP.TW,inTower=(x,z)=>x>T[0]-1&&x<T[1]+1&&z>T[2]-1&&z<T[3]+1;
 for(let z=ZB+2;z<SLP.ZL-2;z+=6){
  const segs=[];let x0=-X+3;for(let x=-X+3;x<=X-3;x+=1){const cut=inTower(x,z)||slPenLost(d,x,z)||(d===1&&h3(Math.round(x/9),z,7)<.12);
   if(cut){if(x-x0>1)segs.push([x0,x]);x0=x+1;}}
  if(X-3-x0>1)segs.push([x0,X-3]);
  for(const s of segs)pbBox(G,c,(s[0]+s[1])/2,Y1+2,z,s[1]-s[0],4,3,0,8);}
 for(const sx of [-1,1]){const zz=sx>0&&d===1?SLP_LOST[2]:SLP.ZL;pbBox(G,c,sx*(X-1.5),Y1+2,(ZB+zz)/2,3,4,zz-ZB,0,8);}
 if(d!==1)pbBox(G,c,0,Y1+2,SLP.ZL-1.5,2*X,4,3,0,8);else pbBox(G,c,(-X+SLP_LOST[0])/2,Y1+2,SLP.ZL-1.5,SLP_LOST[0]+X,4,3,0,8);
 // brutalist fascia: a heavy band stepping out under the lip, piers on the side faces
 const fx=d===1?SLP_LOST[0]:X;pbBox(G,c,(-X+fx)/2,Y0-1.4,SLP.ZL+.8,fx+X,2.8,1.6,0,8);
 for(const sx of [-1,1])for(let z=-38;z<ZF;z+=14){if(sx>0&&slPenLost(d,X-2,z))continue;const y0=z<0?D:-2;
  kput(d>0?'boxCR':'boxC',[sx*(X+.4),(y0+Y1)/2,z],null,[.8,Y1-y0,2],null);}
 // the wall noses: wedge buttresses under the lip; a string course round the sides
 for(const w of SLP.WALLS){const wm=(w[0]+w[1])/2;pbAdd(slPrism([[w[0],ZF],[w[1],ZF],[wm+1.2,ZF+5.4],[wm-1.2,ZF+5.4]],-6,Y0+6),c,G,true);}
 for(const sx of [-1,1])pbBox(G,c,sx*(X+.5),Y0-.5,(ZB+ZF)/2,1,1.4,ZF-ZB,0,8);
 if(d===0)for(const b of SLP.BAYS)kput('strip',[(b[0]+b[1])/2,SLP.OPEN-.2,ZF+.05],null,[b[1]-b[0]-1,1,1],CYAN);
 const ttop=slPenTower(G,d);
 // vents on the roof's other landward corner
 for(let i=0;i<3;i++){const x=24+i*7,z=-30;if(d===1&&i===2)continue;kput('pkCol',[x,Y1,z],null,[2.4,d===1&&i===1?5:9,2.4],d>0?new THREE.Color(0x8a8078):new THREE.Color(0xe8e4dc));
  kput('slab',[x,Y1+(d===1&&i===1?5:9),z],null,[2.9,.6,2.9],null);}
 // ---- the blast doors: steel leaves on tracks across the mouths
 const leaf=(x,w,q)=>{const g=boxUV(w,SLP.OPEN+3,1.2,8);if(q)q(g);else g.translate(x,(SLP.OPEN-3)/2,ZF+6.4);pbAdd(g,d>0?MAT.rust:MAT.pkSteel,G);};
 const [b1,b2,b3]=SLP.BAYS;
 if(d===0){leaf(b1[0]+5.5,11.2);leaf(b1[1]-5.5,11.2);leaf(b2[0]-3,6.4);leaf(b2[1]+3,6.4);leaf(b3[0]+5.5,11.2);leaf(b3[1]+3,6.4);}
 if(d===1){leaf(0,11.2,g=>{g.translate(0,(SLP.OPEN+3)/2,0);g.rotateX(1.25);g.rotateY(.15);g.translate(b1[0]+6,-4,ZF+8);});leaf(b1[1]-5.5,11.2);leaf(b2[0]-3,6.4);}
 if(d>=3){leaf(b2[0]-3,6.4);leaf(b2[1]+3,6.4);leaf(b1[0]+3,6);
  for(const b of [b1,b3])for(let x=b[0]+1;x<b[1]-1;x+=2.2)if(rng()<.6)kput('pkCloth',[x+1.1,SLP.OPEN-.2,ZF+.3],null,[2,rr(3,7),1],new THREE.Color().setHSL(rng(),rr(.3,.6),rr(.4,.6)));}
 // ---- d=1: the fallen roof, broken beams hanging, rebar, green on the roof
 if(d===1){const L=SLP_LOST;
  for(let i=0;i<3;i++){const za=L[2]+i*23,g=boxUV(L[1]-L[0]-2,Y1-Y0,22,8);g.rotateX(i===1?.5:-.42);g.rotateZ(rr(-.08,.08));g.translate((L[0]+L[1])/2+rr(-2,2),i===1?4:7,za+11);pbAdd(g,c,G);}
  for(let i=0;i<5;i++){const x=rr(L[0]+2,L[1]-2),z=L[2]+.5;beam('pipeR',[x,Y0+1,z],[x+rr(-2,2),Y0-rr(4,8),z+rr(1,5)],.12,.12,null);}
  for(let i=0;i<4;i++){const z=L[2]+2+i*6;beam('boxCR',[L[0]-1,Y1+2,z],[L[0]+rr(4,9),Y1-rr(4,9),z],3,3,null);}
  portRubble((L[0]+L[1])/2,-2,150,12,40);portRubble((L[0]+L[1])/2,Y1,L[2]-3,6,20);
  for(let i=0;i<220;i++){const x=rr(-X+3,X-3),z=rr(ZB+3,SLP.ZL-3);if(slPenLost(d,x,z)||inTower(x,z))continue;
   const rz=((z-ZB-2)%6+6)%6,top=rz<1.5||rz>4.5;kput('moss',[x,Y1+(top?4.05:.05),z],qEuler(rng(),rng()*TAU,rng()),[rr(.6,2),rr(.2,.5),rr(.6,1.6)],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.45),rr(.06,.12)));}
  for(let i=0;i<26;i++){const x=rr(-X+4,X-4),z=ZB+5+Math.floor(rr(0,36))*6;if(slPenLost(d,x,z)||inTower(x,z))continue;VEG.tree(x,Y1,z,i%3,rr(4,11));}
  for(let i=0;i<40;i++){const x=rr(-X+1,fx-1);kput('vine',[x,Y1,SLP.ZL+.2],qEuler(0,rng()*TAU,0),[rr(.8,1.6),rr(3,12),rr(.8,1.6)],null);}
  for(let i=0;i<20;i++){const x=rr(-X+1,fx-1);kput('stain',[x,Y0-4,SLP.ZL+1.7],null,[rr(2,5),rr(5,12),1],null);}
  portWeeds(-h+3,-SLP.LAND+2,h-3,-3,90,D);portTrees(-h+6,-56,-X-1,-4,3,D,4,8);portTrees(X+1,-56,h-6,-4,3,D,4,8);
  kput('pkSkiff',[b3[0]+8,-1.5,60],qEuler(.3,.4,2.6),1,new THREE.Color(0x5a4a3a));}
 // ---- the boats: the sub in the middle bay; a workshop pontoon / houseboats
 const sk=PORT_REG.vessel.slSub?'slSub':portVesselFor(opt,0);
 if(sk&&PORT_REG.vessel[sk].beam<=19&&PORT_REG.vessel[sk].length<=ZF-SLP.BZ-12)portPlaceVessel(G,sk,0,ZF-8-PORT_REG.vessel[sk].length/2,0,d,{low:true,ledge:SLP.BAYS[1][1]-LE,ledgeY:D});
 const pc=(b3[0]+b3[1])/2;
 if(d===0){pbBox(G,MAT.white,pc,.4,70,11,2.4,34,0,8);pbBox(G,MAT.white,pc,2.8,62,8,3.2,12,0,8);pbBox(G,MAT.winIntact,pc,3.4,62,8.1,1,12.1,0,8);
  kput('pkLamp',[pc+3,1.6,78],null,.5,null);portFigures(pc,1.6,76,3,3);
  for(const w of bayW)portFigures(w.at(60,-1.2)[0],D,w.at(60,-1.2)[1],2,.8);portFigures(-30,D,-52,8,14);}
 if(d===1){const g=boxUV(11,2.4,34,8);g.rotateZ(.35);g.rotateX(.08);g.translate(pc,-.9,74);pbAdd(g,MAT.rust,G);}
 if(d>=3){
  // houseboats and rafts in the side bays, boats at the ledges
  for(const b of [b1,b3]){const xm=(b[0]+b[1])/2;
   for(let z=-24;z<ZF-14;z+=rr(16,22)){if(rng()<.25)continue;slRaft(xm+rr(-3,3),z,rr(-.05,.05),9,rr(11,15),d,{shack:true,line:rng()<.5,people:rng()<.5?2:0});}}
  for(const w of bayW)for(const L of w.ladders)if(rng()<.5)portSkiff(L[0]+w.n[0]*2.2,L[1]+rr(-3,3),rr(-.15,.15));
  for(const w of bayW)for(let s=20;s<w.L-10;s+=26)if(rng()<.5)portStall(w.at(s,-1.3)[0],D,w.at(s,-1.3)[1],w.n[0]>0?-Math.PI/2:Math.PI/2);
  // the roof village: planked terraces over the beams, houses, gardens, masts
  const RY=Y1+4;
  for(let z=ZB+6;z<SLP.ZL-8;z+=12)for(let x=-X+8;x<X-6;x+=12){if(inTower(x,z)||inTower(x-6,z-6))continue;if(x>18&&x<44&&z<-20)continue;
   const r=rng();
   if(r<.3)portContainerHouse(G,x+rr(-1,1),RY,z+rr(-1,1),Math.PI/2+rr(-.1,.1),d,{big:true,levels:rng()<.4?2:1});
   else if(r<.58){kput('plank',[x,RY+.1,z],null,[10.5,.2,10.5],new THREE.Color(0x8a7058));
    const t=slShack(x+rr(-2,2),RY+.2,z+rr(-2,2),rng()<.5?0:Math.PI/2,rr(4,6),rr(4,5.5),rr(2.6,3.2));if(rng()<.3)slShack(x,t,z,rng()*TAU,rr(3,4),rr(3,4),2.5);}
   else if(r<.76){kput('plank',[x,RY+.1,z],null,[10.5,.2,10.5],new THREE.Color(0x7a6048));portGarden(x,RY+.2,z,9,9,d);}
   else if(r<.86){for(let k=0;k<6;k++)kput('pkSolar',[x-3+(k%3)*3,RY+.8,z-2+Math.floor(k/3)*4],qEuler(-.45,0,0),[2,1,1.4],null);}
   else if(r<.92)slLattice(x,RY,z,rr(8,14),2.4,{hut:rng()<.5});}
  for(let i=0;i<6;i++){const x=rr(-X+6,X-6),z=rr(ZB+6,SLP.ZL-8);if(!inTower(x,z))portWashLine(x,z,x+rr(6,10),z+rr(-3,3),RY+2.4,6);}
  portFigures(0,RY+.3,60,40,40);
  slShack((T[0]+T[1])/2+5,Y1+47.45,(T[2]+T[3])/2+8,.3,6,5,3,{lit:.7});
  for(let i=0;i<3;i++)kput('pkCloth',[-30+i*30,SLP.OPEN+2.4,SLP.ZL+1.7],null,[5,11,1],new THREE.Color().setHSL(rr(0,.1),.6,.45));
  // stair towers up the landward face from the apron to the roof
  for(const x of [-6,30]){slStairTower(x,D,ZB-2.3,RY+.1,Math.PI/2,d);kput('plank',[x,RY+.05,ZB+.4],null,[2.4,.14,5.4],null);}
  for(let x=-h+10;x<h-10;x+=5){if(Math.abs(x+6)<4||Math.abs(x-30)<4)continue;if(rng()<.7)portStall(x,D,-53,rng()<.5?0:Math.PI);}
  portFigures(0,D,-52,20,40);}
 // ---- registered volumes
 for(const x of [-25,25])for(const z of [-18,30,80,130,160]){if(slPenLost(d,x,z+10))continue;REGISTER({name:'Submarine pen',x,z,r:22,h:Y1+4+2,y:-2});}
 REGISTER({name:'Pen control tower',x:(T[0]+T[1])/2,z:(T[2]+T[3])/2,r:12,h:ttop-Y1,y:Y1});
 if(d===1)REGISTER({name:'Collapsed pen roof',x:30,z:150,r:14,h:30,y:-4});
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'slPen',name:'Submarine pen',cls:'seg',W:110,LAND:SLP.LAND,SEA:SLP.SEA,decays:[0,1,3],stamps:slPenStamps,build:buildSlPen});
