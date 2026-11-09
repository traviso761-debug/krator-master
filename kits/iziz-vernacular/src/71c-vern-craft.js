// ================================================================= 71c. THE TRADES ROUND: crafts and salvage (after Voth's alchemist, enchanter, potter and industrial lots)
// The owner (2026-10-16): the Iziz Vernacular's version of every trade building Voth has and Iziz lacks. Iziz lives off the
// ruins: its enchanter is a tinker who keeps salvaged Ancient electrics and shield cells alive, its glass is Ancient glass
// melted again, and its heavy industry is breaking Ancient metal. Rooms: kits/interiors/sets/iziz.js (@@ag-craft@@).
// Helpers are vcr*; seeds 8301-8399.

// ---------------------------------------------------------------- props
// herb rack: two posts, three rails, bundles of drying herbs hung head-down on strings
function vcrHerbRack(x,y,z,ry,L,c){for(const s of[-1,1]){const p=loc(x,z,s*L/2,0,ry);vPst('vPost',p[0],y,p[1],.06,2.2,c);}
 for(const h of[1.25,1.75,2.1]){const a=loc(x,z,-L/2,0,ry),b=loc(x,z,L/2,0,ry);vBeam([a[0],y+h,a[1]],[b[0],y+h,b[1]],.035,c);}
 for(const h of[1.25,1.75,2.1])vcrHerbRow(x,y+h,z,ry,L-.2,.22);}
// a row of herb bundles hanging from a rail at height y (string, then a tapered bundle of leaves)
function vcrHerbRow(x,y,z,ry,L,step){const n=Math.max(2,Math.round(L/step));for(let i=0;i<n;i++){const p=loc(x,z,-L/2+(i+.5)*L/n,rr(-.03,.03),ry),len=rr(.28,.45);
 vPst('vRope',p[0],y-.12,p[1],.008,.12,vC(0xb8a888));kput('vThatchB',[p[0],y-.12-len/2,p[1]],qEuler(0,rng()*TAU,0),[rr(.09,.14),len,rr(.09,.14)],vC(vPick([0x5a7a3a,0x6a8a42,0x7a7a3a,0x8a6a3a,0x4a6a34,0x9a8a4a])));}}
// jars and bottles on a shelf: clay crocks, green and amber glass, stoppered
function vcrJars(x,y,z,ry,L,n){for(let i=0;i<n;i++){const p=loc(x,z,-L/2+(i+.5)*L/n,rr(-.04,.04),ry),r=rng();
 if(r<.45){const h=rr(.22,.38);vPst('vClayPot',p[0],y,p[1],rr(.08,.12),h,vC(vPick([0x9a5a38,0xb87a4a,0xd8c8a8,0x6a4a30])));vBall('vWood',p[0],y+h,p[1],.05,vC(0x6a4a30));}
 else{const h=rr(.16,.3);vPst('vClayPot',p[0],y,p[1],rr(.05,.08),h,vC(vPick([0x3a7a4a,0x5a9a5a,0xa8682a,0x2a5a6a,0x7aa08a])));vPst('vPost',p[0],y+h,p[1],.02,.06,vC(0x6a4a30));}}}
// a coil of cable hung on a wall peg facing ry (a few tori, slightly off one another)
function vcrCoil(x,y,z,ry,r,c){const p=loc(x,z,0,.08,ry);vB('vWood',p[0],y+r-.05,p[1],.08,.08,.18,ry,vC(0x5a4632));
 for(let k=0;k<4;k++){const q=loc(x,z,rr(-.03,.03),.1+k*.025,ry);kput('vHoop',[q[0],y+rr(-.02,.02),q[1]],qEuler(0,ry,rr(-.2,.2)),[r*rr(.92,1.05),r*rr(.92,1.05),r*1.6],c||vC(vPick([0x8a8478,0x6a5a48,0xc8a070])));}}
// a salvaged Ancient panel on a wall: ghost-white face, a grid of dark cell slots, a few coloured terminals
function vcrPanel(x,y,z,ry,w,h){const p=loc(x,z,0,.06,ry);vB('vPanelB',p[0],y,p[1],w,h,.06,ry);const nx=Math.max(2,Math.round(w/.36)),ny=Math.max(1,Math.round(h/.36));
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){if(rng()<.18)continue;const q=loc(x,z,-w/2+(i+.5)*w/nx,.1,ry);vB(rng()<.7?'vDarkB':'vRustB',q[0],y+(j+.5)*h/ny-.1,q[1],w/nx*.7,h/ny*.55,.02,ry);}
 for(let k=0;k<3;k++){const q=loc(x,z,rr(-w/2+.1,w/2-.1),.1,ry);vBall('vClayB',q[0],y+h-.07,q[1],.04,vC(vPick([0xc9442a,0x2f8f8a,0xe0a030])));}}
// shield cells: a shelf of Ancient white canisters with dark bands
function vcrCells(x,y,z,ry,L,n){const p=loc(x,z,0,0,ry);vB('vWood',p[0],y-.06,p[1],L,.06,.36,ry,vC(0x7a6a56));
 for(let i=0;i<n;i++){const q=loc(x,z,-L/2+(i+.5)*L/n,0,ry);vPst('vTankW',q[0],y,q[1],.11,.34,null);vB('vIron',q[0],y+.22,q[1],.235,.04,.235,ry,vC(0x2e2a26));vPst('vPipe',q[0],y+.34,q[1],.03,.05,vC(0xb8703a));}}
// a hand-cranked dynamo on a timber stand: drum on its side, flywheel, crank, a cable to the wall
function vcrDynamo(x,y,z,ry){const iron=vC(0x2e2a26),wood=vC(0x7a5a3e);vB('vWood',x,y,z,1.1,.45,.6,ry,wood);
 const d=loc(x,z,-.45,0,ry);vPst('vTankR',d[0],y+.75,d[1],.24,.8,null,vQ(ry,0,-Math.PI/2));   // the drum, lying along x
 for(const s of[-1,1]){const q=loc(x,z,s*.38,0,ry);vB('vIron',q[0],y+.45,q[1],.1,.32,.5,ry,iron);}
 const f=loc(x,z,.48,0,ry);kput('vHoop',[f[0],y+.95,f[1]],qEuler(0,ry+Math.PI/2,0),[.42,.42,1.4],iron);   // flywheel
 for(let k=0;k<4;k++){const a=k*Math.PI/4;const u=loc(f[0],f[1],0,Math.cos(a)*.4,ry),v=loc(f[0],f[1],0,-Math.cos(a)*.4,ry);vBeam([u[0],y+.95+Math.sin(a)*.4,u[1]],[v[0],y+.95-Math.sin(a)*.4,v[1]],.035,iron,'vIron');}
 const h=loc(x,z,.62,0,ry),hh=loc(x,z,.62,.32,ry);vBeam([h[0],y+.95,h[1]],[hh[0],y+1.25,hh[1]],.04,iron,'vIron');const hg=loc(x,z,.74,.32,ry);vBeam([hh[0],y+1.25,hh[1]],[hg[0],y+1.25,hg[1]],.05,wood);}
// a dish on a mast: guyed pipe, crossbars, a ghost-white dish tipped to the sky with its feed arm
function vcrDish(x,y,z,ry,h){const iron=vC(0x3a3632);vPst('vPipe',x,y,z,.07,h,iron);for(const k of[.55,.8])vB('vIron',x,y+h*k,z,.9,.05,.05,ry,iron);
 for(const a of[0,2.1,4.2]){vBeam([x,y+h*.85,z],[x+Math.sin(a)*2.2,y-.1,z+Math.cos(a)*2.2],.015,vC(0xa89878),'vRope');}
 const d=loc(x,z,0,.3,ry),dq=vQ(ry,.8,0);kput('vTankW',[d[0],y+h,d[1]],dq,[.95,.07,.95],null);kput('vHoop',[d[0],y+h+.03,d[1]],dq.clone().multiply(qEuler(Math.PI/2,0,0)),[.95,.95,1.2],vC(0x8a8478));
 const f=loc(x,z,0,.85,ry);vBeam([d[0],y+h+.05,d[1]],[f[0],y+h+.65,f[1]],.03,iron,'vIron');vBall('vIron',f[0],y+h+.65,f[1],.06,iron);}
// a heap of glass cullet in one colour (small bright chips over a low mound)
function vcrCullet(x,y,z,r,hex,n){kput('vRock',[x,y,z],null,[r,r*.5,r*.85],vC(hex,.55));
 for(let i=0;i<n;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.85,h=Math.sqrt(Math.max(0,1-d*d/(r*r)))*r*.46;kput('vClayB',[x+Math.cos(a)*d,y+h+.02,z+Math.sin(a)*d*.85],qEuler(rng()*3,rng()*TAU,rng()*3),[rr(.06,.16),rr(.03,.08),rr(.06,.14)],vC(hex,rr(.8,1.15)));}}
// a stack of salvaged sheets lying flat (panel or rust), a little off square each
function vcrStack(item,x,y,z,w,d,n,ry){for(let i=0;i<n;i++)kput(item,[x+rr(-.12,.12),y+.04+i*.09,z+rr(-.12,.12)],qEuler(rr(-.02,.02),ry+rr(-.12,.12),rr(-.02,.02)),[w*rr(.85,1),.07,d*rr(.85,1)],null);}
// a salvaged sheet nailed over a face at (x,z) on it, foot at y, a few degrees off square
function vcrSheet(x,y,z,ry,w,h){const p=loc(x,z,0,.09,ry);kput(vPick(['vSheet','vPlate','vPlateW']),[p[0],y+h/2,p[1]],vQ(ry,0,rr(-.06,.06)),[w,h,1],null);}
// three-sided board bin (open at +z of its own frame)
function vcrBin(x,y,z,ry,w,d,h,c){for(const s of[-1,1]){const p=loc(x,z,s*w/2,0,ry);vB('vWood',p[0],y,p[1],.08,h,d,ry,c);}const b=loc(x,z,0,-d/2,ry);vB('vWood',b[0],y,b[1],w+.08,h,.08,ry,c);}

// ---------------------------------------------------------------- apothecary: the street shop of medicines, the still in its lean-to, rooms above
function buildVernApothecary(G,o){reseed(8301+(o.v|0));const W=9.6,D=8.4,H1=3.3,H2=2.9,Y0=.4;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.sand)),trim=vC(vPick(VPAL.trim)),copper=vC(0xb8703a);
 vnReg('Apothecary (middle)',0,0,9,Y0+H1+H2+4.2);
 vB('vStone',0,-.1,0,W+.5,.5,D+.5,0,vC(vPick(VPAL.stoneDark)));vnPaving(0,.02,D/2+1.8,W+3,2.6,0,vC(vPick(VPAL.stoneDark)),12);
 vnBody('vPlaster',0,Y0,0,W,H1,D,0,pl,{t:.3});vnBand('vWood',0,Y0+H1,0,W+.34,.3,D+.34,0,wood,.47);vnBody('vPlaster',0,Y0+H1+.3,0,W,H2,D,0,pl.clone().multiplyScalar(1.04),{t:.3});
 for(const sx of[-1,1])for(const sz of[-1,1])vPst('vPost',sx*(W/2-.02),Y0,sz*(D/2-.02),.17,H1+H2+.32,wood);
 const top=vnCornice('vWood',0,Y0+H1+.3+H2,0,W,D,0,wood,2);
 vnGableRoof(0,top,0,W,D,2.6,0,'vGableS',vC(0x8a6a4a),1.1,'vGablePl',pl,.2);
 // the front: the door, and the jar window — two shelves of jars and bottles in the opening, herbs hung from its head
 vnDoor(-2.7,Y0,D/2,0,1.1,2.3,'vWood',trim,vC(0x5a3a24));
 {const wx=1.5,ww=3.0,wy=Y0+.85,wh=1.6;vnWin(wx,wy,D/2,0,ww,wh,'open','vWood',trim,true);
  for(const k of[0,.78]){vB('vWood',wx,wy+k-.04,D/2-.15,ww,.05,.26,0,wood);vcrJars(wx,wy+k,D/2-.15,0,ww-.2,9);}
  vcrHerbRow(wx,wy+wh-.02,D/2-.08,0,ww-.3,.26);
  vB('vWood',wx,Y0,D/2+.35,ww+.4,.85,.55,0,wood);vcrJars(wx,Y0+.85,D/2+.35,0,ww,7);            // the street counter
  vnAwning(wx,Y0+2.85,D/2,0,ww+.6,1.4,vC(0x2f8f8a));}
 vnSign(-1.4,Y0+2.9,D/2,0,vC(0x3f6a3a));
 // upper floor: two shuttered windows between deco strips; side and back windows
 for(const x of[-2.6,2.6])vnWin(x,Y0+H1+1.0,D/2,0,1.1,1.2,'open','vWood',trim,true);
 for(const x of[-4.0,0,4.0])vnStrip(x,Y0+H1+.7,D/2,0,.5,1.9,'vWood',wood);
 for(const s of[-1,1]){vnWin(s*W/2,Y0+1.2,1.8,s*Math.PI/2,1.0,1.1,'open','vWood',trim,true);vnWin(s*W/2,Y0+H1+1.0,0,s*Math.PI/2,1.0,1.1,'open','vWood',trim,true);}
 vnWin(-2.2,Y0+H1+1.0,-D/2,Math.PI,1.0,1.1,'shut','vWood',trim);vnWin(2.2,Y0+H1+1.0,-D/2,Math.PI,1.0,1.1,'open','vWood',trim,true);
 vnDoor(2.6,Y0,-D/2,Math.PI,1.0,2.2,'vWood',wood,vC(0x6a4a30));vnWin(-2.0,Y0+1.3,-D/2,Math.PI,1.0,1.0,'shut','vWood',trim);
 // the still's lean-to on -x: stone hearth with its fire, copper pot and head, a pipe to the worm tub, and the copper
 // vent pipe up the wall and out over the eaves to a capped head above the roof
 {const lx=-W/2-1.5,LW=3.0,LD=5.2;vB('vStone',lx,-.1,-.4,LW+.2,.3,LD,0,vC(0x8a7a6a));
  for(const sz of[-1,1])vPst('vPost',lx-LW/2+.15,.2,-.4+sz*(LD/2-.2),.12,2.6,wood);
  vnShedRoof(lx-.25,2.8,-.4,LW+.5,LD,.55,-Math.PI/2,'vCorr',null,.35,.12);
  const sx=lx-.2,sz=-1.2;vB('vStone',sx,.2,sz,1.2,.75,1.2,0,vC(0x6a625a));vB('vDarkB',sx,.3,sz+.58,.5,.35,.06,0);vBall('vEmber',sx,.45,sz+.5,.14);
  vPst('vPipeC',sx,.95,sz,.48,.7,copper);kput('vDomeC',[sx,1.65,sz],null,[.48,.42,.48],copper);vPst('vPipeC',sx,2.0,sz,.1,.25,copper);
  const tx=lx-.6,tz=.9;vnBarrel(tx,.2,tz,.38,1.0,wood);for(let k=0;k<3;k++)kput('vHoop',[tx,.7+k*.18,tz],qEuler(Math.PI/2,0,0),[.26,.26,.6],copper);
  vBeam([sx,2.2,sz],[tx,1.25,tz],.06,copper,'vPipeC');
  vBeam([sx,2.2,sz],[-W/2-.15,2.6,sz],.07,copper,'vPipeC');vPst('vPipeC',-W/2-.15,2.6,sz,.08,top-1.9,copper);
  const ey=top-.2+.15;vBeam([-W/2-.15,ey+.5,sz],[-W/2-1.2,ey+.5,sz],.08,copper,'vPipeC');   // out past the gable overhang
  vPst('vPipeC',-W/2-1.2,ey+.5,sz,.08,3.1,copper);kput('vConeC',[-W/2-1.2,ey+3.6,sz],null,[.22,.3,.22],copper);
  for(let k=0;k<4;k++)kput('vHoop',[-W/2-1.2,ey+2.2+k*.22,sz],qEuler(Math.PI/2,0,0),[.2,.2,.5],copper);   // cooling coil round the head
  vB('vIron',-W/2-.6,ey+.42,sz,.08,.08,.08,0,vC(0x2e2a26));
  for(let k=0;k<3;k++)vnCrate(lx-.9+k*.05,.2+k*.55,-2.6,.6,rr(-.2,.2),wood);vcrJars(lx+.6,1.0,.0,Math.PI/2,1.2,4);vB('vWood',lx+.6,.2,.0,.4,.8,1.4,0,wood);}
 // the herb rack and a planter bed on +x; at the back, the water butt, empty jars in crates, a drying rack
 vcrHerbRack(W/2+1.2,0,-.6,Math.PI/2,3.6,wood);vnPlanter(W/2+1.1,0,2.6,1.6,.7,Math.PI/2,wood);
 vnWaterButt(W/2+.6,0,-D/2+.6,.42,1.0);vnCrate(-1.0,0,-D/2-.9,.8,.2,wood);vnCrate(-.1,0,-D/2-1.0,.7,-.3,wood);vcrJars(-1.0,.64,-D/2-.9,0,.6,3);
 vnDryingRack(1.2,0,-D/2-1.8,0,3.4);vnPlanter(-4.0,Y0-.1,D/2+.8,1.2,.6,0,wood);
 vnFolk(0,D/2+3.6,3,1.6);}

// ---------------------------------------------------------------- tinker and relic-wright: a salvage-electrics workshop, its counter, a back room to live in
function buildVernTinker(G,o){reseed(8311+(o.v|0));const W=8.8,D=6.6,H=3.0,Y0=.45,R=1.9;const wood=vC(vPick(VPAL.woodPoor)),boards=vC(vPick(VPAL.woodPoor),.95),iron=vC(0x2e2a26),tarp=vC(vPick([0x6a7a5a,0x8a6a4a,0x5a6a7a]));
 vnReg('Tinker and relic-wright (poor)',0,0,8.5,Y0+H+R+3.6);
 vB('vStone',0,-.15,0,W+.6,.6,D+.6,0,vC(0x8a7e70));vnPaving(0,.02,D/2+2.2,W+2,2.2,0,vC(0x7a7068),8);
 vnBody('vWood',0,Y0,0,W,H,D,0,boards,{t:.15});vnFrame(0,Y0,0,W,H,D,0,wood,.13);
 vnGableRoof(0,Y0+H,0,W,D,R,0,'vGableC',null,1.3,'vGableW',boards,.14);
 for(const [x,w] of[[-.25,1.3],[3.5,1.0],[-3.4,1.3]])vcrSheet(x,Y0+.2,-D/2,Math.PI,w,rr(1.6,2.3));vcrSheet(W/2,Y0+.1,-2.5,Math.PI/2,1.2,1.7);   // sheets nailed over the boards, clear of the openings
 // the front: the counter hatch with its shutter propped up as a hood, the door, the porch under the deep eave
 {const hx=-1.5,hw=2.6;vnWin(hx,Y0+1.0,D/2,0,hw,1.3,'open','vWood',wood);vB('vWood',hx,Y0,D/2+.3,hw+.3,1.0,.5,0,wood);
  kput('vSheet',[hx,Y0+2.12,D/2+.36],vQ(0,-1.15,0),[hw+.2,.75,1],null);
  vcrCells(hx-.6,Y0+1.06,D/2+.3,0,1.2,5);for(let k=0;k<3;k++)vB(vPick(['vPanelB','vRustB','vIron']),hx+.4+k*.35,Y0+1.0,D/2+.3,.26,rr(.1,.3),.3,rr(-.3,.3),iron);}
 vnDoor(2.4,Y0,D/2,0,1.0,2.15,'vWood',wood,vC(0x6a5a48));
 vB('vWood',0,Y0-.2,D/2+1.0,W,.2,2.0,0,wood);for(const x of[-W/2+.2,0,W/2-.2])vPst('vPost',x,0,D/2+1.85,.1,Y0+2.35,wood);
 vB('vWood',0,Y0+2.15,D/2+1.85,W+.3,.18,.16,0,wood);
 vcrDynamo(3.4,Y0,D/2+1.0,0);vBeam([3.4,Y0+.9,D/2+.75],[3.9,Y0+2.4,D/2+.1],.03,iron,'vIron');
 // the wall: two Ancient panels, cable coils on pegs, a tin sign
 vcrPanel(-3.6,Y0+.8,D/2,0,1.0,1.4);vcrPanel(.6,Y0+2.15,D/2,0,1.5,.6);
 vcrCoil(-3.6,Y0+2.6,D/2,0,.32,vC(0x6a6a6a));vcrCoil(1.4,Y0+1.3,D/2,0,.28,vC(0xc8a070));vcrCoil(.9,Y0+1.25,D/2,0,.22);
 vnSign(3.4,Y0+2.6,D/2,0,vC(0x2f8f8a));
 // sides and back: windows, more coils and panels, a scrap bench outside on +x
 vnWin(W/2,Y0+1.1,-1.2,Math.PI/2,1.0,1.0,'open','vWood',wood);vnWin(W/2,Y0+1.1,1.6,Math.PI/2,.9,.9,'shut','vWood',wood);
 vcrPanel(W/2,Y0+.4,.3,Math.PI/2,.8,1.0);vcrCoil(W/2,Y0+2.4,-2.3,Math.PI/2,.35);
 vnWin(-1.6,Y0+1.1,-D/2,Math.PI,1.0,1.0,'open','vWood',wood);vnWin(2.2,Y0+1.1,-D/2,Math.PI,1.0,1.0,'shut','vWood',wood);
 vB('vWood',W/2+.9,0,-.4,1.0,.85,2.4,0,wood);for(let k=0;k<5;k++)vB(vPick(['vPanelB','vRustB','vIron','vTankW']),W/2+.9+rr(-.3,.3),.85,-1.4+k*.5,rr(.15,.35),rr(.08,.25),rr(.15,.3),rr(-.5,.5),iron);
 // the back room on -x: a board lean-to for the family, its own door, its roof down off the gable wall
 {const LW=3.4,LD=4.6,LH=2.4,lx=-W/2-LW/2;vnBody('vWood',lx,Y0,-.2,LW,LH,LD,0,wood,{t:.15});
  vnShedRoof(lx-.35,Y0+LH,-.2,LD,LW+.1,.55,-Math.PI/2,'vCorr',null,.4,.12);
  vnDoor(lx+.5,Y0,-.2+LD/2,0,.9,2.0,'vWood',wood,vC(0x6a5a48));vnWin(-W/2-LW,Y0+1.0,-.6,-Math.PI/2,.9,.8,'open','vWood',wood);
  vnStairs(lx+.5,0,LD/2+.25,0,1.0,Y0,2,'vWood',wood);
  vnWaterButt(lx-1.0,0,-.2-LD/2-.6,.42,1.0);vnDryingRack(lx-.4,0,-.2-LD/2-1.4,0,2.6);}
 // the roof: the dish on its mast at the +x end, a whip aerial at -x, a wire between
 vcrDish(W/2-.9,Y0+H+.4,-1.0,.5,R+1.4);vPst('vPipe',-W/2+.6,Y0+H+R-.2,0,.03,2.6,iron);
 vBeam([W/2-.9,Y0+H+R+1.6,-1.0],[-W/2+.6,Y0+H+R+2.2,0],.012,iron,'vIron');
 // crates of parts by the porch, a cable drum
 vnCrate(-W/2+.2,0,D/2+2.6,.8,.3,wood);vnCrate(-W/2+1.1,0,D/2+2.8,.7,-.2,wood);for(let k=0;k<4;k++)kput(vPick(['vPipe','vPipeR']),[-W/2+.3+rr(-.2,.2),.66,D/2+2.6+rr(-.2,.2)],qEuler(Math.PI/2,rng()*TAU,0),[.04,.6,.04],null);
 vcrCells(-W/2+1.1,.56,D/2+2.8,.3,.5,2);
 {const q=qEuler(0,.4,Math.PI/2);vPst('vStave',W/2+.95,.42,D/2+2.2,.3,.55,vC(0x3a3632),q);for(const k of[0,.55])kput('vHoop',[W/2+.95-k*Math.cos(.4),.42,D/2+2.2+k*Math.sin(.4)],qEuler(0,.4+Math.PI/2,0),[.42,.42,2],vC(0x6a5a48));}   // a cable drum on its side
 vnFolk(0,D/2+4,2,1.4);}

// ---------------------------------------------------------------- glassworks: the hall with its sales front, the furnace house and its brick stack, cullet sorted by colour
function buildVernGlassworks(G,o){reseed(8321+(o.v|0));const W=11.4,D=8.2,H=4.0,Y0=.35,X0=-3.3;const wood=vC(vPick(VPAL.woodMid)),pl=vC(vPick(VPAL.adobe)),trim=vC(vPick(VPAL.trim)),brick=vC(vPick([0x9a4a30,0x8a4028,0xa85a3a])),iron=vC(0x2e2a26);
 vnReg('Glassworks (middle)',0,0,11,15);
 vB('vStone',X0,-.1,0,W+.5,.45,D+.5,0,vC(vPick(VPAL.stoneDark)));vnPaving(X0,.02,D/2+1.8,W+1,2.4,0,vC(vPick(VPAL.stoneDark)),12);
 vnBody('vPlaster',X0,Y0,0,W,H,D,0,pl,{t:.3});vnFrame(X0,Y0,0,W,H,D,0,wood,.15);
 const top=vnCornice('vWood',X0,Y0+H,0,W,D,0,wood,1);
 vnGableRoof(X0,top,0,W,D,2.4,0,'vGableC',null,1.0,'vGablePl',pl,.16);
 for(const x of[-2.4,0,2.4])vB('vWood',X0+x,top+2.0,0,.8,.7,.8,0,wood),vnShedRoof(X0+x,top+2.7,0,.9,1.2,.2,0,'vCorr',null,.15,.06);   // roof vents for the heat
 // the sales front: door, and the window of bottles and panes on stepped shelves; a striped awning, the sign
 vnDoor(X0-3.6,Y0,D/2,0,1.2,2.4,'vWood',trim,vC(0x5a3a24));
 {const wx=X0+.2,ww=3.6,wy=Y0+.8;vnWin(wx,wy,D/2,0,ww,1.7,'open','vWood',trim,true);
  for(const k of[0,.55,1.1]){vB('vWood',wx,wy+k-.04,D/2-.15,ww,.05,.26,0,wood);vcrJars(wx,wy+k,D/2-.15,0,ww-.2,12);}
  vB('vWood',wx,Y0,D/2+.35,ww+.4,.8,.55,0,wood);vcrJars(wx,Y0+.8,D/2+.35,0,ww,9);
  vnAwning(wx,Y0+2.95,D/2,0,ww+.8,1.5,vC(vPick(VPAL.awning)));}
 vnSign(X0-2.4,Y0+3.0,D/2,0,vC(0x2f8f8a));vnWin(X0+3.8,Y0+1.2,D/2,0,1.2,1.3,'open','vWood',trim,true);
 vnWin(X0-W/2,Y0+1.3,0,-Math.PI/2,1.2,1.3,'open','vWood',trim,true);
 for(const x of[-3.5,0,3.5])vnWin(X0+x,Y0+1.5,-D/2,Math.PI,1.2,1.2,x?'open':'shut','vWood',trim,true);
 // the furnace house on +x: open on three sides under a shed roof on posts; the door from the hall's workroom
 const FX=X0+W/2,FW=6.6,FC=FX+FW/2;vnDoor(FX,Y0,-1.4,Math.PI/2,1.3,2.4,'vWood',trim,vC(0x5a3a24),false);
 vB('vStone',FC,-.1,-.6,FW,.38,D-.8,0,vC(0x8a7a6a));
 for(const z of[-D/2+.5,-.6,D/2-1.7])vPst('vPostB',FX+FW-.2,.28,z,.16,3.5,wood);
 vnShedRoof(FC+.4,Y0+H-.6,-.6,D-.6,FW-.4,1.0,Math.PI/2,'vCorr',null,.6,.14);
 // the furnace: a brick beehive on a plinth, three glory holes aglow, and the stack — brick, banded, tapering, capped
 {const fx=FC+.4,fz=-1.6;vB('vStone',fx,.28,fz,3.0,.9,3.0,0,brick.clone().multiplyScalar(.85));kput('vDomeP',[fx,1.18,fz],null,[1.45,1.6,1.45],brick);
  for(const a of[.4,1.57,2.74]){const gx=fx+Math.cos(a)*1.32,gz=fz+Math.sin(a)*1.32;vB('vStone',gx,1.4,gz,.5,.5,.5,-a+Math.PI/2,brick.clone().multiplyScalar(.7));vBall('vEmber',fx+Math.cos(a)*1.55,1.65,fz+Math.sin(a)*1.55,.14);}
  const sx=fx+.2,sz=fz-.9;let y=1.1,s=1.5;for(let k=0;k<6;k++){const h=k?2.0:2.4;vB('vStone',sx,y,sz,s,h,s,0,brick.clone().multiplyScalar(k%2?1:.92));y+=h;
   vB('vStone',sx,y-.12,sz,s+.16,.16,s+.16,0,vC(vPick(VPAL.stoneDark)));s-=.08;}
  vB('vStone',sx,y,sz,s+.3,.3,s+.3,0,vC(vPick(VPAL.stoneDark)));for(const q of[[-1,-1],[1,-1],[1,1],[-1,1]])vB('vStone',sx+q[0]*(s/2),y+.3,sz+q[1]*(s/2),.25,.4,.25,0,brick);
  vB('vDarkB',sx,y+.31,sz,s-.2,.02,s-.2,0);
  // the marver (an iron table), a rack of blowpipes, the annealing oven against the hall wall, a quench tub
  vB('vIron',fx-.2,.28,fz+2.4,1.4,.85,.7,0,iron);vB('vWood',fx+1.5,.28,fz+2.1,.5,.6,.5,0,wood);
  for(let k=0;k<5;k++)kput('vPipe',[fx+2.4,.3,fz+1.2+k*.18],vQ(0,0,-.25),[.02,1.7,.02],iron);vB('vWood',fx+2.5,1.5,fz+1.55,.1,.1,1.0,0,wood);
  vB('vStone',FX+.8,.28,1.5,1.4,1.4,1.8,0,brick.clone().multiplyScalar(.8));vB('vIron',FX+1.52,.6,1.5,.04,.7,1.2,0,iron);vnChimney(FX+.8,1.68,1.0,1.4,.12,true);
  vnBarrel(fx+1.6,.28,fz-1.6,.42,.8,wood);}
 // cullet: Ancient glass broken and sorted by colour into board bins along the front of the furnace house; panes racked
 {const cz=D/2+.9;const cols=[0x4aa05a,0xc8862a,0x9ad0d8,0x5a3a2a];for(let i=0;i<4;i++){const bx=FX+.9+i*1.45;vcrBin(bx,0,cz,0,1.3,1.4,.6,wood);vcrCullet(bx,0,cz,.6,cols[i],22);}
  for(let k=0;k<5;k++)kput('vWinGlass',[FX+4.6,.8,cz-1.6+k*.12],vQ(Math.PI/2,0,.15),[1.2,1.5,.03],null);vB('vWood',FX+4.6,0,cz-1.35,1.6,.12,.8,0,wood);
  vB('vWood',FX+4.6,0,cz-1.75,.1,1.7,.1,0,wood);}
 // the hall's -x end: a lean rack of salvaged panes waiting to be cut, sand sacks and soda ash, crates
 for(let k=0;k<6;k++)kput('vWinGlass',[X0-W/2-.55,.85,-3.5+k*.28],vQ(-Math.PI/2,0,-.2),[1.1,1.6,.03],null);vB('vWood',X0-W/2-.75,0,-2.8,.15,.15,2.0,0,wood);
 // the back: the furnace's firewood, split and stacked between stakes against the hall wall, sacks of charcoal at its end
 {const bz=-D/2-.75;for(let r=0;r<4;r++)for(let k=0;k<16-(r>2?1:0);k++)vPst('vPostB',X0-3.6+k*.36+(r%2)*.18,.12+r*.3,bz+.55,rr(.13,.17),1.1,vC(vPick(VPAL.woodPoor),rr(.85,1.1)),qEuler(-Math.PI/2,0,0));
  for(const x of[-3.8,2.2])for(const dz of[.05,1.05])vPst('vPost',X0+x,0,bz+dz,.05,1.4,wood);
  vnSacks(X0+2.6,0,bz,4);}
 vnSacks(X0-W/2-1.0,0,1.6,5);vnCrate(X0-W/2-.9,0,3.0,.8,.2,wood);vnCrate(X0+W/2-1.4,0,-D/2-.9,.8,.4,wood);vnWaterButt(X0-4.9,0,-D/2-.7,.45,1.0);
 vnFolk(X0,D/2+3.4,3,2);}

// ---------------------------------------------------------------- salvage breaker's yard: Ancient scrap broken up under a pipe gantry, sorted in piles; a shop, an office
function buildVernSalvageYard(G,o){reseed(8331+(o.v|0));const W=29,D=23,WH=2.6;const wood=vC(vPick(VPAL.woodPoor)),iron=vC(0x2e2a26);
 vnReg('Salvage breaker\'s yard (poor)',0,0,17,11);
 vnPaving(0,.02,0,W-2,D-2,0,vC(0x6e665e),150);for(let i=0;i<10;i++)vB('vDarkB',rr(-W/2+3,W/2-3),.0,rr(-D/2+3,D/2-3),rr(.6,1.8),.035,rr(.5,1.4),rng()*TAU);   // oil stains
 // the wall: pipe posts with salvaged sheet and panel between, a gate in the front with tall gateposts and a sign panel
 {const G2=6.0;const segs=[[[-W/2,-D/2],[W/2,-D/2]],[[W/2,-D/2],[W/2,D/2]],[[-W/2,D/2],[-W/2,-D/2]],[[-W/2,D/2],[-G2/2,D/2]],[[G2/2,D/2],[W/2,D/2]]];
  segs.forEach((s,si)=>{const L=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]),n=Math.max(1,Math.round(L/2.4)),ux=(s[1][0]-s[0][0])/L,uz=(s[1][1]-s[0][1])/L,ry=Math.atan2(-uz,ux);
   const wh=si>=3?1.8:WH;   // the street side is lower: the breaking shows over it
   for(let i=0;i<=n;i++){const x=s[0][0]+ux*L*i/n,z=s[0][1]+uz*L*i/n;vPst('vPipeR',x,0,z,.08,wh+.3,null);}
   for(let i=0;i<n;i++){const x=s[0][0]+ux*L*(i+.5)/n,z=s[0][1]+uz*L*(i+.5)/n,r=rng();kput(r<.45?'vCorr':r<.75?'vRustB':'vPanelB',[x,wh/2+rr(-.1,.1),z],vQ(ry,0,rr(-.04,.04)),[L/n+.12,wh+rr(-.3,.1),.06],null);}
   const a=s[0],b=s[1];vBeam([a[0],wh-.1,a[1]],[b[0],wh-.1,b[1]],.06,iron,'vIron');});
  // the gate's two leaves, pipe frames sheeted in corrugate, swung open into the yard
  for(const sx of[-1,1]){const hx=sx*G2/2,a=sx*1.25,L=G2/2-.2;
   kput('vCorr',[hx-sx*Math.cos(Math.abs(a))*L/2,1.1,D/2-Math.sin(Math.abs(a))*L/2],qEuler(0,sx*Math.abs(a),0),[L,1.9,.05],null);
   for(const y of[.2,2.0])vBeam([hx,y,D/2],[hx-sx*Math.cos(Math.abs(a))*L,y,D/2-Math.sin(Math.abs(a))*L],.05,null,'vPipeR');}
  // scrap leaning on the street face of the wall
  for(let k=0;k<5;k++){const x=rr(4,W/2-2)*(k%2?1:-1);kput(rng()<.5?'vPanelB':'vRustB',[x,.7,D/2+.35],qEuler(-.3,rr(-.2,.2),0),[rr(1,1.8),rr(1,1.5),.06],null);}
  // and on the back and the sides: sheets waiting for the cutter, raking props where the wall leans
  for(let k=0;k<7;k++){const x=rr(-W/2+1.5,W/2-1.5);kput(vPick(['vPanelB','vRustB','vCorr']),[x,.75,-D/2-.4],qEuler(.32,rr(-.2,.2),0),[rr(1,2.2),rr(1.1,1.6),.06],null);}
  for(const s of[-1,1])for(let k=0;k<3;k++){const z=rr(-D/2+2,D/2-2);kput(vPick(['vPanelB','vRustB']),[s*(W/2+.4),.7,z],qEuler(0,Math.PI/2,s*.3),[rr(1,2),rr(1,1.5),.06],null);}
  for(const x of[-8,0,8])vBeam([x,0,-D/2-1.1],[x,WH-.3,-D/2-.05],.09,null,'vPipeR');
  for(const sx of[-1,1]){vPst('vPipeR',sx*G2/2,0,D/2,.16,4.6,null);}vB('vIron',0,4.4,D/2,G2+.5,.18,.18,0,iron);
  vcrPanel(0,3.15,D/2,0,3.2,1.0);vB('vRustB',0,3.0,D/2+.04,3.4,.1,.04,0);}
 // the closed workshop at the back left: corrugate walls on a pad, a wide door, a gable roof of rusted sheet
 const KX=-8.6,KZ=-6.4,KW=8.4,KD=6.6,KH=3.4,KY=.2;
 vB('vStone',KX,-.1,KZ,KW+.4,.3,KD+.4,0,vC(0x7a7068));vnBody('vCorr',KX,KY,KZ,KW,KH,KD,0,null,{t:.15});vnFrame(KX,KY,KZ,KW,KH,KD,0,wood,.13);
 vnGableRoof(KX,KY+KH,KZ,KW,KD,1.8,0,'vGableC',null,1.0,'vGableW',wood,.14);
 vnDoor(KX+1.6,KY,KZ+KD/2,0,1.9,2.6,'vWood',wood,vC(0x5a4a3a),false);vnWin(KX-2.2,KY+1.1,KZ+KD/2,0,1.4,1.0,'open','vWood',wood);
 vnWin(KX+KW/2,KY+1.1,KZ,Math.PI/2,1.2,1.0,'open','vWood',wood);vnWin(KX-KW/2,KY+1.1,KZ+.6,-Math.PI/2,1.2,1.0,'shut','vWood',wood);
 vcrSheet(KX-.45,KY+.1,KZ+KD/2,0,1.0,2.4);vcrSheet(KX-3.6,KY+.3,KZ+KD/2,0,1.0,2.0);vnChimney(KX-2.6,KY+KH+.6,KZ-1.2,2.2,.16,true);vcrCoil(KX+3.4,KY+1.8,KZ+KD/2,0,.36);
 // the office and store shed by the gate on the left: boards, a shed roof, its door toward the gate
 const OX=-9.8,OZ=6.6,OW=4.6,OD=3.8,OH=2.7,OY=.3;
 vB('vStone',OX,-.1,OZ,OW+.4,.4,OD+.4,0,vC(0x7a7068));vnBody('vWood',OX,OY,OZ,OW,OH,OD,0,wood,{t:.15});
 vnShedRoof(OX,OY+OH,OZ,OW,OD,.6,0,'vCorr',null,.8,.12);
 vnDoor(OX+OW/2,OY,OZ-.4,Math.PI/2,.95,2.1,'vWood',wood,vC(0x6a5a48));vnWin(OX,OY+1.1,OZ+OD/2,0,1.2,.9,'open','vWood',wood,true);
 vnWin(OX-OW/2,OY+1.1,OZ,-Math.PI/2,.9,.8,'shut','vWood',wood);vnStairs(OX+OW/2+.35,0,OZ-.4,Math.PI/2,1.0,OY,1,'vWood',wood);
 vnWaterButt(OX+OW/2+.5,0,OZ+1.4,.4,1.0);vB('vWood',OX+OW/2+.9,0,OZ-1.6,.5,.45,1.4,0,wood);   // a bench by the door
 // the gantry: two A-frames of pipe, a box girder across, the trolley, its chain and hook, a panel slung under it
 {const GX0=-3.6,GX1=7.4,GZ=-1.2,GH=7.2;for(const gx of[GX0,GX1]){for(const s of[-1,1])vBeam([gx,0,GZ+s*2.2],[gx,GH,GZ],.16,null,'vPipeR');
   vBeam([gx,2.6,GZ-1.4],[gx,2.6,GZ+1.4],.1,iron,'vPipe');vB('vStone',gx,0,GZ,.8,.25,5.2,0,vC(0x7a7068));}
  vB('vRustB',(GX0+GX1)/2,GH,GZ,GX1-GX0+1.0,.45,.45,0);vB('vIron',(GX0+GX1)/2,GH+.45,GZ,GX1-GX0+1.0,.06,.6,0,iron);
  for(let k=0;k<8;k++){const x=GX0+.6+k*(GX1-GX0-1.2)/7;vBeam([x,GH,GZ],[x+(GX1-GX0)/8,GH+.42,GZ],.04,iron,'vIron');}
  const tx=GX0+6.2;vB('vIron',tx,GH-.5,GZ,.8,.5,.7,0,iron);vPst('vRope',tx,3.1,GZ,.04,GH-3.6,vC(0x3a3632));vB('vIron',tx,2.75,GZ,.35,.4,.12,0,iron);
  for(const s of[-1,1])vBeam([tx,2.8,GZ],[tx+s*1.6,1.5,GZ],.025,vC(0x3a3632),'vIron');kput('vPanelB',[tx,1.2,GZ],qEuler(.05,0,.08),[3.6,.22,2.2],null);
  vPst('vRope',tx+1.0,.1,GZ+1.0,.012,1.1,vC(0xa89878));
  // the piece being broken under it: a great Ancient hull section and a girder, the cut edge ragged
  kput('vPanelB',[GX0+2.0,.75,GZ+.4],qEuler(.06,.2,.32),[4.8,.3,3.4],null);kput('vRustB',[GX0+1.4,1.6,GZ-.6],qEuler(.05,.2,.32),[4.6,.5,.4],null);
  for(let k=0;k<6;k++)kput('vPanelB',[GX0+4.4+rr(-.3,.3),rr(.2,1.2),GZ-1+k*.4],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),[rr(.3,.8),.12,rr(.2,.6)],null);
  vB('vRustB',GX1-1.6,0,GZ+1.2,2.4,1.2,1.6,.2);}
 // the piles, sorted by kind along the right wall: ghost-white panel, rusted plate, pipe, and a heap of mixed offcuts
 {const PX=W/2-2.6;vcrStack('vPanelB',PX,0,-8.4,3.2,2.2,12,.05);vcrStack('vPanelB',PX-.2,0,-5.6,2.8,2.0,8,-.1);
  vcrStack('vRustB',PX,0,-2.4,3.0,2.2,10,.1);vcrStack('vRustB',PX-.3,0,.4,2.6,2.0,7,-.05);
  for(let i=0;i<18;i++){const r=rr(.08,.2);kput(rng()<.5?'vPipeR':'vPipe',[PX-1.6,r+Math.floor(i/6)*.36,3.2+(i%6)*.38],qEuler(0,0,-Math.PI/2),[r,rr(3.0,3.6),r],null);}
  for(let i=0;i<46;i++){const x=PX-.2+rr(-1.6,1.6),z=7.8+rr(-1.4,1.4),h=Math.pow(rng(),2)*.9,r=rng();
   kput(r<.4?'vRustB':r<.7?'vPanelB':r<.85?'vIron':'vPipeR',[x,h+.05,z],qEuler(rr(-.6,.6),rng()*TAU,rr(-.6,.6)),r<.85?[rr(.4,1.1),rr(.04,.12),rr(.3,.9)]:[.08,rr(.6,1.6),.08],r<.85&&r>=.7?iron:null);}
  for(let k=0;k<4;k++)vB('vWood',PX-2.2,0,-7+k*3.3,.12,.9,.12,0,wood);}   // the bay markers
 // the cutting forge under its lean-to on the back wall: hearth and embers, hood and stack, anvil, quench, cut plate
 {const FX=1.2,FZ=-D/2+1.8;for(const x of[-2.4,2.4])vPst('vPipeR',FX+x,0,FZ+1.6,.1,2.9,null);vnShedRoof(FX,2.7,FZ+.2,5.6,3.4,.7,0,'vRustB',null,.4,.1);
  vB('vStone',FX-1.2,0,FZ-.2,2.4,1.0,1.6,0,vC(0x6a625a));vB('vDarkB',FX-1.2,1.0,FZ-.2,1.8,.12,1.1,0);for(let k=0;k<5;k++)vBall('vEmber',FX-1.2+rr(-.7,.7),1.12,FZ-.2+rr(-.4,.4),rr(.08,.16));
  kput('vRustB',[FX-1.2,2.1,FZ-.3],null,[2.2,.9,1.4],null);vnChimney(FX-1.2,2.55,FZ-.4,3.4,.3,true);
  vPst('vPostB',FX+.9,0,FZ+.3,.3,.7,wood);vB('vIron',FX+.9,.7,FZ+.3,.9,.3,.36,0,iron);vnWaterButt(FX+2.0,0,FZ-.4,.42,.85);
  vB('vWood',FX+1.6,0,FZ+1.2,1.8,.8,.7,0,wood);for(let k=0;k<5;k++)kput('vRustB',[FX+1.6+rr(-.6,.6),.85+k*.05,FZ+1.2],qEuler(0,rr(-.3,.3),0),[rr(.4,.8),.04,rr(.3,.5)],null);
  for(let k=0;k<2;k++)vPst('vTankR',FX-3.4+k*.6,0,FZ+.2,.22,1.5,null);}   // gas bottles
 // a hand cart, a cable drum, a scale for weighing, folk
 {const cx=2.8,cz=6.4;vB('vWood',cx,.55,cz,1.4,.35,2.0,.3,wood);for(const s of[-1,1]){const p=loc(cx,cz,s*.8,0,.3);kput('vHoop',[p[0],.45,p[1]],qEuler(0,.3+Math.PI/2,0),[.42,.42,1.5],iron);}
  vBeam([cx-.3,.7,cz+1.0],[cx-.6,.9,cz+2.2],.05,wood);vBeam([cx+.3,.7,cz+1.0],[cx,.9,cz+2.4],.05,wood);vcrStack('vRustB',cx,.85,cz,1.1,1.6,3,.3);}
 kput('vHoop',[-3.4,.55,5.2],qEuler(0,.8,0),[.55,.55,4],vC(0x5a4a3a));
 {const sx=-5.6,sz=3.6;vB('vWood',sx,0,sz,1.2,.25,1.2,0,wood);vPst('vPipe',sx-.5,0,sz,.05,2.2,iron);vBeam([sx-.5,2.1,sz],[sx+.4,2.1,sz],.05,iron,'vIron');vPst('vRope',sx+.3,1.4,sz,.01,.7,vC(0xa89878));vB('vIron',sx+.3,1.2,sz,.4,.2,.4,0,iron);}
 vnFolk(1,2,4,5);}

VERN.def({key:'vern_apothecary',name:'Apothecary',family:'trade',tags:{type:['market/shop','single-family dwelling'],wealth:'middle',lit:false,role:'apothecary',job:'alchemy'},w:17,d:14,h:13,build:buildVernApothecary});
VERN.def({key:'vern_tinker',name:'Tinker and relic-wright',family:'trade',tags:{type:['market/shop','industry','single-family dwelling'],wealth:'poor',lit:false,role:'tinker',job:'carpentry'},w:18,d:14,h:10,build:buildVernTinker});
VERN.def({key:'vern_glassworks',name:'Glassworks',family:'industry',tags:{type:['industry','market/shop'],wealth:'middle',lit:false,role:'glassblower',job:'lampmaking'},w:20,d:14,h:15,build:buildVernGlassworks});
VERN.def({key:'vern_salvage_yard',name:'Salvage breaker\'s yard',family:'industry',tags:{type:['industry'],wealth:'poor',lit:false,role:'salvage breaker',job:'smithing'},w:30,d:26,h:11,build:buildVernSalvageYard});
