// ================================================================= IZIZ VERNACULAR — infrastructure
// Grain silos (farm), the reclaimed storage tank, the electric generator.
// The generator is civic infrastructure and lit; the silos and tank are not.

// ---------------------------------------------------------------- grain silos: four stave silos on stilts under thatch cones, a covered loading deck, ladders
function buildVernSilos(G,o){reseed(7601+(o.v|0));const wood=vC(vPick(VPAL.woodMid)),th=vC(vPick(VPAL.thatch)),stv=vC(vPick([0xa88a5e,0x9a7a4e,0xb89a6a]));
 vnReg('Grain silos',0,0,11,13,{type:['farm','infrastructure']});
 vnPaving(0,.02,0,20,14,0,vC(0x8a7a66),16);
 const S=[[-6,-2.5,2.2],[-2,-3.5,2.0],[2.2,-3.2,2.3],[6.2,-2.4,1.9]];
 S.forEach((s,i)=>{const[x,z,r]=s;const FL=1.8,H=5.0+rr(-.4,.6);
  for(let k=0;k<6;k++){const a=k/6*TAU;vPst('vPostB',x+Math.cos(a)*r*.8,-.2,z+Math.sin(a)*r*.8,.16,FL+.2,wood);vB('vStone',x+Math.cos(a)*r*.8,-.35,z+Math.sin(a)*r*.8,.5,.35,.5,0,vC(0x9a8a78));}
  vB('vWood',x,FL-.2,z,r*2.3,.2,r*2.3,0,wood);
  vPst('vStave',x,FL,z,r,H,stv.clone().multiplyScalar(rr(.9,1.08)));for(const yy of[.6,H*.45,H-.5])vBq('vHoop',x,FL+yy,z,r*1.02,r*1.02,1,qEuler(Math.PI/2,0,0),vC(0x2e2a26));
  vnThatchCone(x,FL+H,z,r,r*1.3,th);vB('vWood',x,FL+H+r*1.3-.3,z,.16,.9,.16,0,wood);
  vB('vDarkB',x,FL+.6,z+r-.05,.8,.9,.2,0);vB('vWood',x,FL+.6,z+r+.05,.75,.85,.06,0,wood);      // hatch and its board
  vnLadder(x+r*.55,0,z+r+.5,0,FL+.4,wood);});
 // covered loading deck in front of the row: a long thatch shed on posts, sacks and a cart-less pile
 vB('vWood',0,.9-.2,3.2,15,.2,3.2,0,wood);for(let i=0;i<=6;i++)vPst('vPostB',-7.5+15*i/6,-.1,4.7,.13,.9,wood);
 for(let i=0;i<=5;i++)for(const s of[-1,1])vPst('vPost',-7+14*i/5,.9,3.2+s*1.4,.12,2.8,wood);
 vnGableRoof(0,3.7,3.2,15,3.2,1.4,0,'vGableT',th,.9,null,null,.4);
 vnSacks(-4,.9,3.2,6);vnSacks(3,.9,3.4,5);vnCrate(6.2,.9,3,.8,.3,wood);vnStairs(-7.6,0,4.5,Math.PI/2,1.2,.9,3,'vWood',wood);
 vnDryingRack(7.5,0,-6,Math.PI/2,3);vnFolk(0,7,3,2.5);}

// ---------------------------------------------------------------- storage tank: a reclaimed Ancient tank on a stone base, riveted bands, stair and gantry, pipe run to a trough, pump hut
function buildVernTank(G,o){reseed(7611+(o.v|0));const st=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),iron=vC(0x2e2a26);
 vnReg('Storage tank (reclaimed)',0,0,9,12,{type:['infrastructure']});
 const R=4.6,H=7.5,B=1.2;vB('vStone',0,0,0,R*2.6,B,R*2.6,0,st);vPst('vPostS',0,B,0,R*1.08,.4,st);
 vPst(rng()<.5?'vTankW':'vTankR',0,B+.4,0,R,H,null);vPst('vTankR',0,B+.4,0,R+.02,H*.28,null);                    // rust rising from the foot
 for(const yy of[.5,H*.33,H*.66,H-.35])vBq('vHoop',0,B+.4+yy,0,R*1.03,R*1.03,1,qEuler(Math.PI/2,0,0),iron);
 for(let k=0;k<3;k++)vPl('vPlate',Math.cos(k*2.3)*(R+.05),B+.4+rr(1.5,5.5),Math.sin(k*2.3)*(R+.05),Math.PI/2-k*2.3,null,0);   // welded patches
 kput('vDomeC',[0,B+.4+H,0],null,[R*1.02,R*.28,R*1.02],vC(0x8a8a8a));vB('vIron',0,B+.4+H+R*.28,0,.9,.6,.9,0,iron);vB('vIron',0,B+.4+H+R*.28+.6,0,.3,.9,.3,0,iron);
 // spiral-ish stair: three straight flights on the outside, a gantry rail at the top
 for(let f=0;f<3;f++){const a0=f*1.5,steps=9;for(let k=0;k<steps;k++){const a=a0+k*1.5/steps,y=B+.4+f*H/3+H/3*k/steps;vBq('vIron',Math.cos(a)*(R+.55),y,Math.sin(a)*(R+.55),.9,.06,.3,qEuler(0,-a,0),iron);
   if(k%3===0)vBq('vIron',Math.cos(a)*(R+.95),y+.5,Math.sin(a)*(R+.95),.05,1.0,.05,null,iron);}
  vBq('vIron',Math.cos(a0+.75)*(R+.98),B+.4+f*H/3+H/6+1.0,Math.sin(a0+.75)*(R+.98),.06,.06,1.5,qEuler(0,-(a0+.75),0),iron);}
 for(let k=0;k<20;k++){const a=k/20*TAU;vPst('vIron',Math.cos(a)*(R+.3),B+.4+H,Math.sin(a)*(R+.3),.04,1.0,iron);}
 vBq('vHoop',0,B+.4+H+1.0,0,R+.3,R+.3,1,qEuler(Math.PI/2,0,0),iron);
 // outlet pipe down the side, along the ground to a stone trough and a standpipe; a hand pump hut
 kput('vPipe',[R+.4,B+.4+1.2,0],qEuler(0,0,Math.PI/2),[.16,.9,.16],iron);vPst('vPipe',R+.85,.3,0,.16,B+1.3,iron);kput('vPipe',[R+.85+3,.5,0],qEuler(0,0,Math.PI/2),[.14,6,.14],iron);
 vB('vStone',R+7.4,0,0,3.0,.8,1.2,0,st);vB('vDarkB',R+7.4,.6,0,2.6,.25,.9,0);vPst('vPipe',R+6.4,.8,0,.08,1.2,iron);kput('vPipe',[R+6.7,1.9,0],qEuler(0,0,Math.PI/2),[.07,.6,.07],iron);
 for(let k=0;k<3;k++)vB('vIron',R+2+k*1.8,0,.35,.18,.5,.18,0,iron);
 {const hx=-R-3.6;vB('vWood',hx,0,1.5,3.2,2.6,3.0,0,wood);vnShedRoof(hx,2.6,1.5,3.2,3.0,.8,0,'vCorr',null,.5,.1);vnDoor(hx,0,3.0,0,.9,2.0,'vWood',wood,vC(0x6a4a30),false);
  kput('vPipe',[(hx+1.6-R)/2,.5,1.5],qEuler(0,0,Math.PI/2),[.12,-R-(hx+1.6),.12],iron);vnBarrel(hx-2.0,0,-.5,.4,1,wood);}
 vnPaving(0,.02,0,R*3.4,R*3.4,0,vC(0x7a7068),20);vnWaterButt(2,0,R+2.6,.45,1.0);vnWaterButt(3.1,0,R+2.6,.45,1.0);
 vnFolk(0,R+4,2,1.5);}

// ---------------------------------------------------------------- electric generator: stone engine house, a reclaimed machine with flywheel, exhaust stack, cable poles, fuel drums, fenced yard
function buildVernGenerator(G,o){reseed(7621+(o.v|0));const st=vC(vPick(VPAL.stone)),stD=vC(vPick(VPAL.stoneDark)),wood=vC(vPick(VPAL.woodMid)),iron=vC(0x2e2a26);
 vnReg('Electric generator',0,0,12,12,{type:['infrastructure','civic']});
 vnPaving(0,.02,0,22,16,0,vC(0x7a7068),30);vnFence(0,0,0,22,16,0,wood,3,1.4);
 // engine house: open on the front so the machine reads
 const W=9,D=7,H=4.6,Y0=.4;vB('vStone',0,-.1,-1,W+.6,.5,D+.6,0,stD);
 vB('vStone',0,Y0,-1-D/2+.4,W,H,.8,0,st);for(const s of[-1,1])vB('vStone',s*(W/2-.4),Y0,-1,.8,H,D,0,st);      // three stone walls
 for(const s of[-1,1])vB('vStone',s*(W/2-.4),Y0,-1+D/2-.4,.9,H+.6,.9,0,stD);vB('vStone',0,Y0+H,-1,W+.2,.5,D+.2,0,stD);
 const t=vnCornice('vStone',0,Y0+H+.5,-1,W,D,0,st,1);vnGableRoof(0,t,-1,W,D,2.0,0,'vGableCu',vC(0xffffff),1.0,'vGableSt',st,.16);
 for(const s of[-1,1])vnWin(s*W/2,Y0+2.4,-1,s*Math.PI/2,1.2,1.4,'lit','vStone',st);vnWin(0,Y0+2.6,-1-D/2,Math.PI,1.6,1.2,'lit','vStone',st);
 // the machine: a rusted housing, a big flywheel on a shaft, a dynamo drum, cooling fins, pipes, gauges
 {const mx=-.6,mz=-1.2;vB('vStone',mx,Y0,mz,5.2,.6,3.4,0,stD);kput('vRustB',[mx-1.2,Y0+1.7,mz],null,[2.2,2.2,2.6],null);kput('vPanelB',[mx-1.2,Y0+2.95,mz],null,[2.4,.3,2.8],null);
  for(let k=0;k<7;k++)kput('vRustB',[mx-1.2,Y0+1.7,mz-1.35-.02+k*0],null,[.1,.1,.1],null);for(let k=0;k<6;k++)vBq('vIron',mx-2.35,Y0+.9+k*.3,mz,.08,.12,2.2,null,iron);   // fins
  kput('vPipe',[mx+1.2,Y0+1.7,mz],qEuler(0,0,Math.PI/2),[.16,3.2,.16],iron);
  vBq('vHoop',mx+1.6,Y0+1.7,mz,1.5,1.5,1,qEuler(0,Math.PI/2,0),vC(0x4a4640));for(let k=0;k<6;k++)vBq('vIron',mx+1.6,Y0+1.7,mz,.1,2.9,.12,qEuler(k*Math.PI/6,0,0).multiply(qEuler(0,Math.PI/2,0)),vC(0x4a4640));
  vBq('vIron',mx+1.6,Y0+1.7,mz,.3,.5,.5,null,iron);vPst('vPostS',mx+1.6,Y0+.6,mz+.9,.25,1.1,stD);vPst('vPostS',mx+1.6,Y0+.6,mz-.9,.25,1.1,stD);
  kput('vPipeC',[mx+2.6,Y0+1.5,mz],qEuler(0,0,Math.PI/2),[.7,1.4,.7],vC(0xffffff));vBq('vIron',mx+2.6,Y0+1.5,mz,1.5,.5,.5,null,iron);           // the dynamo drum, copper
  for(let k=0;k<3;k++)vBall('vBallW',mx-1.9+k*.6,Y0+3.15,mz+1.1,.12,vC(0xd8d0c0));
  vPst('vPipeR',mx-1.6,Y0+2.9,mz-.8,.22,H-2.9+.6,null);vnChimney(mx-1.6,Y0+H+.4,mz-.8,3.6,.22,true);
  vBall('vBulb',mx,Y0+H-.4,mz,.16);vBall('vEmber',mx-1.2,Y0+1.1,mz+1.31,.08);}
 // cable poles leading away from the house, a switchboard on the wall, lamps in the yard, fuel drums under a lean-to
 {const pts=[[3.8,3.6],[9.2,6.2],[-9.5,5.5]];for(const p of pts){vPst('vPost',p[0],0,p[1],.1,5.6,wood);vB('vWood',p[0],5.2,p[1],1.2,.1,.1,0,wood);for(const s of[-1,1])vBall('vBallW',p[0]+s*.5,5.32,p[1],.06,vC(0xd8d0c0));}
  vBeam([-W/2+.4,Y0+H+.3,-1+D/2-.5],[pts[0][0]-.5,5.3,pts[0][1]],.03,vC(0x2e2a26),'vRope');vBeam([pts[0][0]+.5,5.3,pts[0][1]],[pts[1][0]-.5,5.3,pts[1][1]],.03,vC(0x2e2a26),'vRope');
  vBeam([-W/2+.4,Y0+H+.3,-1+D/2-.5],[pts[2][0]+.5,5.3,pts[2][1]],.03,vC(0x2e2a26),'vRope');
  vB('vIron',W/2-.45,Y0+1.2,-1+D/2-.1,.3,1.4,1.0,0,vC(0x3a3632));for(let k=0;k<4;k++)vBall('vBallW',W/2-.28,Y0+1.5+k*.25,-1+D/2-.4+k*.2,.05,vC(0xd8d0c0));}
 vnLampPost(-7,0,-3,3.6);vnLampPost(7,0,-3,3.6);vnLampPost(0,0,6.4,3.8);
 {const lx=W/2+2.6;for(const z of[-3.5,.5])vPst('vPost',lx+1.4,0,z,.08,2.4,wood);for(const z of[-3.5,.5])vPst('vPost',lx-1.4,0,z,.08,2.0,wood);kput('vCorr',[lx,2.3,-1.5],vQ(0,0,.14),[3.2,.08,4.6],null);
  for(let k=0;k<4;k++)vPst('vTank',lx-.7+(k%2)*1.4,0,-3+Math.floor(k/2)*1.5,.42,1.1,null);for(let k=0;k<2;k++)kput('vTank',[lx-.7+k*1.4,.45,.7],qEuler(0,0,Math.PI/2),[.42,1.1,.42],null);}
 vnCrate(-W/2-2.2,0,-3,.9,.3,wood);vnFolk(0,4,2,2);}

VERN.def({key:'vern_silos',name:'Grain silos',family:'infrastructure',tags:{type:['farm','infrastructure'],wealth:'middle',lit:false},w:22,d:16,h:13,build:buildVernSilos});
VERN.def({key:'vern_tank',name:'Storage tank',family:'infrastructure',tags:{type:['infrastructure'],wealth:'middle',lit:false},w:24,d:16,h:12,build:buildVernTank});
VERN.def({key:'vern_generator',name:'Electric generator',family:'infrastructure',tags:{type:['infrastructure','civic'],wealth:'civic',lit:true},w:24,d:18,h:12,build:buildVernGenerator});
