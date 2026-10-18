// ================================================================= 71p. PYLON: salvage and industry (PLAN.md section 4)
// The city's trade: stripping the Ancient ruins, sorting, breaking, smelting and selling what they yield. Concrete and
// render where the neo-Ancient builds, corrugate, plate and timber where the yards make do. No electric light (the
// lighting rule: industry is not civic); forges and smelters glow with embers. Seeds 9101-9199.
const PY_TAG_IND={culture:'pylon',style:'salvage',type:['industry'],wealth:'poor',lit:false};

// a heap of salvage of one kind at (x, z) about r across: 'panel' (Ancient white slabs), 'plate' (rust), 'pipe'
// (lengths of pipe lying), 'coil' (wire coils), 'scrap' (a mix). Uses the builder's rng.
function pynHeap(x,z,r,kind,n){n=n||14;const gun=vC(vPick(PYPAL.gunmetal));
 for(let k=0;k<n;k++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.8,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,yy=Math.max(0,(1-d/r))*r*.55*rng();
  const q=vQ(rng()*TAU,rr(-.5,.5),rr(-.5,.5)),K=kind==='scrap'?['panel','plate','pipe','coil'][(rng()*4)|0]:kind;
  if(K==='panel')vBq('vPanelB',px,yy+.2,pz,rr(1,2.2),.12,rr(.8,1.6),q,null);
  else if(K==='plate')vBq('vRustB',px,yy+.15,pz,rr(.8,1.8),.08,rr(.6,1.4),q,null);
  else if(K==='pipe')kput('vPipeR',[px,yy+.2,pz],vQ(rng()*TAU,Math.PI/2,0),[rr(.08,.2),rr(2,4),rr(.08,.2)],null);
  else{kput('vHoop',[px,yy+.15,pz],vQ(0,Math.PI/2+rr(-.3,.3),0),[rr(.3,.6),rr(.3,.6),rr(.3,.6)],gun);kput('vHoop',[px,yy+.25,pz],vQ(0,Math.PI/2,0),[.4,.4,.4],gun);}}}
// a portal crane: two legs a span apart across z, a girder on top at height h, a trolley and a hook on a cable
function pynGantry(x,z,span,h,c){for(const s of[-1,1]){const zz=z+s*span/2;for(const t of[-1,1])vBeam([x+t*1.4,0,zz],[x,h,zz],.3,c,'vIron');vB('vIron',x,0,zz,3.4,.25,.5,0,c);}
 vB('vIron',x,h,z,1.0,.8,span+1,0,c);vB('vIron',x,h-.6,z+span*.15,1.4,.6,1.4,0,c);vPst('vPipe',x,h-5,z+span*.15,.03,4.4,c);kput('vHoop',[x,h-5.2,z+span*.15],vQ(Math.PI/2,0,0),[.35,.35,.35],c);}

// Scrap yard: a fenced yard of sorted heaps (Ancient panel, plate, pipe, wire) under a travelling portal crane on two
// rails, an office hut of corrugate by the gate.
function buildPylScrapYard(G,o){reseed(9101+(o.v|0));const W=30,D=24;
 const gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodPoor)),or=vC(vPick(PYPAL.orange));
 vnReg('Scrap yard',0,0,15,9,{style:'salvage'});
 vnFence(0,0,0,W-1,D-1,0,wood,true,2.2);
 for(const s of[-1,1])vB('vIron',-2+s*0,0,s*7.5,W-6,.2,.3,0,gun);
 pynGantry(-4,0,15,8,or);
 pynHeap(-9,-5,3.4,'panel',18);pynHeap(-1,-6,3,'plate',16);pynHeap(6,-5,3,'pipe',14);pynHeap(10,4,2.6,'coil',10);pynHeap(-8,4.5,2.6,'scrap',16);
 vB('vCorr',9,0,8.8,4,2.6,3,0,null);vB('vCorr',9,2.6,8.8,4.4,.1,3.4,0,null);vnDoor(8,0,10.3,0,.9,2,'vWood',wood,vC(0x5a4a3a),false);vnWin(10.2,1.1,10.3,0,.9,.7,'open','vWood',wood,true);
 vnSign(9,2.9,10.4,0,or);vnBarrel(5,0,9.5,.35,.9,null);vnCrate(3.8,0,9.8,.7,.2,wood);}

// Breakers' floor: a concrete floor where the big Ancient panels are broken up: a derrick with its boom over a panel
// section on cradles, cut panel stacked, embers where the cutting is; a shed roof on posts over the benches at the back.
function buildPylBreakersFloor(G,o){reseed(9111+(o.v|0));const W=24,D=18;
 const conc=vC(vPick(PYPAL.formwork)),gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodMid)),wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange));
 vnReg('Breakers\' floor',0,0,12,12,{style:'salvage',role:'salvage breaker',job:'smithing'});
 vB('pyConc',0,0,0,W,.2,D,0,conc);
 // the derrick: a mast with three stays, a boom leaning out over the floor, the hook cable
 const mx=-8,mz=-3;vPst('vPipe',mx,.2,mz,.25,11,gun);for(let k=0;k<3;k++){const a=k*TAU/3+.4;vBeam([mx+Math.cos(a)*5,.2,mz+Math.sin(a)*5],[mx,10.5,mz],.1,gun,'vIron');}
 vBeam([mx,1.5,mz],[mx+8,9,mz+2],.35,or,'vIron');vBeam([mx,11,mz],[mx+8,9,mz+2],.05,gun,'vIron');vPst('vPipe',mx+8,4.6,mz+2,.03,4.4,gun);kput('vHoop',[mx+8,4.4,mz+2],vQ(Math.PI/2,0,0),[.3,.3,.3],gun);
 // the panel section on its cradles, half cut, the sparks of the cutting
 for(const x of[-1.5,3.5])vB('vIron',x,.2,1.5,.5,1.1,4,0,gun);vBq('vPanelB',1,1.75,1.5,7,.5,4.4,vQ(0,0,.06),wh);
 for(let k=0;k<6;k++)vBall('vEmber',4.6+rr(-.3,.3),1.6+rr(0,.8),1.5+rr(-1.5,1.5),rr(.05,.1));
 // the cut panels stacked, the shed at the back
 for(let k=0;k<5;k++)vB('vPanelB',7.5,.2+k*.16,4.5,3.2,.14,2.2,rr(-.1,.1),wh);
 for(const x of[-10,-2,6,11])for(const z of[-8.2,-4.8])vPst('vPost',x,.2,z,.14,4,wood);
 vnShedRoof(.5,4.2,-6.5,23,4.6,.6,0,'vCorr',null,.4,.12);
 for(const x of[-4,1,6])vB('vWood',x,.2,-7.4,2.6,.9,1,0,wood);
 vnSacks(9,.2,-6.5,3);pynHeap(-2,6,2.4,'scrap',12);}

// Smelter: a concrete shed under a barrel vault with two tall stacks, a crucible gantry over a glowing pour at its
// door, a slag heap and racks of ingots.
function buildPylSmelter(G,o){reseed(9121+(o.v|0));const W=14,D=10,H=6,Z=-2.5,zf=Z+D/2;
 const conc=vC(vPick(PYPAL.formwork)),gun=vC(vPick(PYPAL.gunmetal)),or=vC(vPick(PYPAL.orange)),rust=vC(vPick(PYPAL.rust));
 vnReg('Smelter',0,Z,9,17,{style:'neo'});
 vnBody('pyConc',0,0,Z,W,H,D,0,conc,{t:.3});pynVault(0,H,Z,D+.3,W+.3,2.4,Math.PI/2,'pyHalfC',conc);
 vB('vPlaster',0,H-.3,zf+.05,W+.2,.3,.3,0,or);
 for(const [x,h] of[[-4,16],[-1.6,13]]){vPst('vPipeR',x,0,Z-D/2+1.4,.7,h,rust);for(const y of[10,13])if(y<h)vPst('vPipe',x,y,Z-D/2+1.4,.78,.25,gun);}
 // the door: a wide tombstone opening with the pour's glow inside
 pynTomb(0,0,zf,0,4.4,4.6,.05,.1,'D');for(let k=0;k<8;k++)vBall('vEmber',rr(-1.4,1.4),rr(.2,1.2),zf+rr(-.6,-.1),rr(.08,.16));
 // the crucible gantry: a frame out of the door, a bucket hung on it
 for(const s of[-1,1])vPst('vPipe',s*2.6,0,zf+3.2,.15,5.2,gun);vB('vIron',0,5.2,zf+3.2,5.6,.35,.35,0,gun);vBeam([0,5.2,zf+3.2],[0,5.2,zf-.5],.25,gun,'vIron');
 kput('vTankR',[0,2.6,zf+3.2],null,[.7,1.1,.7],rust);vBall('vEmber',0,3.75,zf+3.2,.45);vPst('vPipe',0,3.7,zf+3.2,.02,1.5,gun);
 // slag and ingots
 for(let k=0;k<9;k++)vBall('vRock',5.5+rr(-1.6,1.6),rr(0,.5),zf+2+rr(-1.6,1.6),rr(.4,.9),vC(0x3a3430));
 for(let r=0;r<4;r++)vB('vIron',-5.6,r*.18,zf+2.4,2.2,.16,1.2,0,vC(0xb07a4a).multiplyScalar(1-r*.06));}

// Sorting shed: a long shed under a barrel vault, open along its front on concrete piers, a bay to each kind of salvage
// with its bin, the bays' signs painted orange.
function buildPylSortingShed(G,o){reseed(9131+(o.v|0));const W=24,D=8,H=4.2,N=5;
 const wh=vC(vPick(PYPAL.white)),conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal));
 vnReg('Sorting shed',0,0,12.5,H+3.2,{style:'neo'});
 vB('pyConc',0,0,0,W+.4,.25,D+.4,0,conc);vB('vPlaster',0,.25,-D/2+.15,W,H,.3,0,wh);
 for(const s of[-1,1])vB('vPlaster',s*(W/2-.15),.25,0,.3,H,D,0,wh);
 for(let k=0;k<=N;k++)vB('pyConc',-W/2+.3+k*(W-.6)/N,.25,D/2-.3,.6,H,.6,0,conc);
 vB('pyConc',0,H+.25,D/2-.3,W,.5,.6,0,conc);pynVault(0,H+.25,0,D+.4,W+.4,2.6,Math.PI/2,'pyHalf',wh);
 const kinds=['panel','plate','pipe','coil','scrap'];
 for(let k=0;k<N;k++){const x=-W/2+(k+.5)*W/N;vB('vIron',x,.25,-1,3.4,.9,3,0,gun);pynHeap(x,-1,1.4,kinds[k],8);
  const f=loc(x,-D/2+.3,0,.02,0);pynDisc(f[0],H-.6,f[1],0,.4,or);}}

// Scrap exchange (refs/pylon - market.jpg): the market, a long three-storey bar of vaulted bays, each bay a stall open
// to the front under a round-headed arch, a railed gallery along each upper storey, a row of small vaults on the roof.
function buildPylScrapExchange(G,o){reseed(9141+(o.v|0));const N=8,BW=4.2,W=N*BW,D=8,H=3.8,FL=3,Z=-1.5,zf=Z+D/2;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal));
 vnReg('Scrap exchange',0,Z,W/2+.5,FL*H+2.4,{style:'neo',type:['market/shop']});
 vnBody('vPlaster',0,0,Z,W,FL*H,D,0,wh,{t:.4});
 for(let f=0;f<FL;f++){const y=f*H;
  for(let k=0;k<N;k++){const x=-W/2+(k+.5)*BW;pynFrame('tomb',x,y+.1,zf,0,BW-1.1,H-.6,{rim:.16,c:or,fill:'D',out:.04});
   if(f===0){vnStall(x,zf+1.3,0,vC(vPick(VPAL.awning)));}}
  if(f>0){vB('vPlaster',0,y-.15,zf+.6,W,.15,1.2,0,cr);vB('vIron',0,y+.95,zf+1.15,W,.05,.05,0,gun);for(let k=0;k<=N;k++)vPst('vPipe',-W/2+k*BW,y,zf+1.15,.03,.95,gun);}}
 vB('vPlaster',0,FL*H,Z,W+.2,.25,D+.2,0,or);
 for(let k=0;k<N;k++)pynVault(-W/2+(k+.5)*BW,FL*H+.25,Z,BW-.2,D,1.4,0,'pyHalf',cr);}

// Bazaar lane (refs/pylon8.jpg): one side of a market lane, o.len metres long (default 24): stalls under awnings
// against a rendered back wall with shop doors, between flanged standpipes and junction boxes.
function buildPylBazaarLane(G,o){reseed(9151+(o.v|0));const L=o.len==null?24:o.len,N=Math.max(2,Math.round(L/4.8)),Z=-2.4;
 const wh=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),wood=vC(vPick(VPAL.woodPoor));
 vnReg('Bazaar lane',0,0,L/2,4.6,{style:'salvage',type:['market/shop']});
 vB('vPlaster',0,0,Z,L,3.6,1.2,0,wh);vB('vPlaster',0,3.6,Z,L+.1,.15,1.3,0,or);
 for(let k=0;k<N;k++){const x=-L/2+(k+.5)*L/N;vnDoor(x-1.1,0,Z+.6,0,.95,2.1,'vPlaster',or,vC(vPick(PYPAL.walnut)),false);
  vnAwning(x+.4,2.5,Z+.6,0,3.2,1.6,vC(vPick(VPAL.awning)));vnStall(x+.6,Z+2.6,0,vC(vPick(VPAL.awning)));
  if(k%2===0){const px=-L/2+k*L/N+.2;vPst('vPipe',px,0,Z+.9,.14,4.6,gun);vPst('vPipe',px,1.6,Z+.9,.22,.1,gun);vB('vIron',px+.45,1.3,Z+.7,.45,.55,.2,0,gun);}}
 for(let k=0;k<5;k++)kput('vClayPot',[rr(-L/2+1,L/2-1),0,Z+1.2+rr(0,.3)],null,[.22,.5,.22],null);
 vnCrate(L/2-1.2,0,Z+1.5,.6,.3,wood);vnSacks(-L/2+1.4,0,Z+1.5,3);}

// Tank farm: four tanks of several sizes, each on legs with a ring deck, joined by pipe runs on trestles and a walk.
function buildPylTankFarm(G,o){reseed(9161+(o.v|0));
 const gun=vC(vPick(PYPAL.gunmetal)),rust=vC(vPick(PYPAL.rust)),wh=vC(vPick(PYPAL.white));
 const T=[[-8,-3,3.2,7,rust],[0,-4,2.6,6,wh],[7.5,-3,3.0,8,rust],[-2,4.5,1.8,4,rust]];
 vnReg('Tank farm',0,0,12,11,{style:'salvage'});
 for(const [x,z,r,h,c] of T){for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;vPst('vPipe',x+Math.sin(a)*r*.7,0,z+Math.cos(a)*r*.7,.12,1.2,gun);}
  pynTank(x,1.2,z,r,h,c,c===wh?'vDomeP':'pyDomeR');kput('vHoop',[x,1.2+h*.6,z],qEuler(Math.PI/2,0,0),[r+.05,r+.05,r+.05],gun);vnLadder(x,0,z+r+.35,0,1.3+h,gun);}
 // the pipe runs: tank wall to tank wall at 2.2 m, on a trestle midway
 for(let k=0;k<3;k++){const a=T[k],b=T[k+1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  vBeam([a[0]+ux*a[2],2.2,a[1]+uz*a[2]],[b[0]-ux*b[2],2.2,b[1]-uz*b[2]],.22,gun,'vPipe');
  const mx=(a[0]+ux*a[2]+b[0]-ux*b[2])/2,mz=(a[1]+uz*a[2]+b[1]-uz*b[2])/2;vB('vIron',mx,0,mz,.3,2.1,.3,0,gun);}}

// Crawler depot: a high bay of concrete for the Motor Vehicles kit's crawlers and caravan trucks: a wide door of
// corrugate under an orange lintel, a lying fuel tank on cradles, a concrete ramp, a pump.
function buildPylCrawlerDepot(G,o){reseed(9171+(o.v|0));const W=18,D=13,H=8.5,Z=-2.4,zf=Z+D/2;
 const conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),rust=vC(vPick(PYPAL.rust));
 vnReg('Crawler depot',0,Z,10.5,H+1,{style:'neo'});
 vnBody('pyConc',0,0,Z,W,H,D,0,conc,{t:.35});vB('pyConc',0,H,Z,W+.1,.6,D+.1,0,conc);
 const f=loc(-2,zf,0,.04,0);vB('vCorr',f[0],0,f[1],8,6.4,.12,0,null);vB('vPlaster',-2,6.4,zf+.15,9,.6,.4,0,or);
 vnDoor(5.6,0,zf,0,1.0,2.3,'vIron',gun,gun,false);vnWin(5.6,3.6,zf,0,2.2,1.6,'glass','vIron',gun);
 pynPortCluster(0,H-2.4,zf,0,W-2,1.8,5,.5,or,'G');
 vB('pyConc',-2,0,zf+2.4,8,.25,4.8,0,conc);
 kput('vTankR',[-W/2-1.6,1.25,Z-D/2+.2],qEuler(Math.PI/2,0,0),[1.1,6,1.1],rust);for(const z of[1.4,4.6])vB('vIron',-W/2-1.6,0,Z-D/2+.2+z,1.8,.4,.4,0,gun);
 vPst('vPipe',4,0,zf+3.6,.2,1.6,gun);vB('vIron',4,1.6,zf+3.6,.6,.5,.4,0,or);}

// Workshop (refs/pylon3.jpg): a neo-Ancient box with an orange slab canopy cantilevered over an open shop front, a
// workbench and racks inside, a pill window above.
function buildPylWorkshop(G,o){reseed(9181+(o.v|0));const W=11,D=9,H=5.4,Z=-1.6,zf=Z+D/2;
 const wh=vC(vPick(PYPAL.white)),conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),wood=vC(vPick(VPAL.woodMid)),gun=vC(vPick(PYPAL.gunmetal));
 vnReg('Workshop',0,Z,6.6,H+1,{style:'neo',type:['industry'],wealth:'middle'});
 vnBody('pyConc',0,0,Z,W,H,D,0,conc,{t:.3});vB('pyConc',0,H,Z,W+.1,.4,D+.1,0,conc);
 vB('vDarkB',-1,0,zf+.02,6.4,3.2,.1,0,null);pynCanopy(-1,3.6,zf,0,8,2.6,.3,or);
 for(const x of[-2.6,.6])vB('vWood',x,0,zf-1,2.2,.9,.9,0,wood);
 pynStadium(3.4,3.9,zf,0,2.2,1.1,.12,.12,'P',or);pynStadium(3.4,4.05,zf,0,1.8,.8,.16,.05,'G');
 vnDoor(3.6,0,zf,0,1,2.3,'vIron',gun,gun,false);pynHeap(-6.8,1.6,1.4,'scrap',8);}

// Cable crane: a lattice mast with a head sheave, its cable running o.len metres (default 40) up and back (-z) to the
// Monolith's face or a second mast; the plot is the mast's base. The far end is the placer's to set (o.len, o.rise).
function buildPylCableCrane(G,o){reseed(9191+(o.v|0));const L=o.len==null?40:o.len,RISE=o.rise==null?24:o.rise,H=18,B=2.4;
 const gun=vC(vPick(PYPAL.gunmetal)),or=vC(vPick(PYPAL.orange)),conc=vC(vPick(PYPAL.formwork));
 vnReg('Cable crane mast',0,0,3,H+1.5,{style:'salvage'});
 vB('pyConc',0,0,0,B+1.2,.6,B+1.2,0,conc);
 const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[a*B/2,b*B/2]);
 for(let k=0;k<4;k++){const [x0,z0]=c[k],[x1,z1]=c[(k+1)%4];vBeam([x0,.6,z0],[x0*.4,H,z0*.4],.16,or,'vIron');
  for(let j=0;j<6;j++){const t0=j/6,t1=(j+1)/6,s0=1-.6*t0,s1=1-.6*t1,y0=.6+t0*(H-.6),y1=.6+t1*(H-.6);vBeam([x0*s0,y0,z0*s0],[x1*s1,y1,z1*s1],.06,gun,'vIron');}}
 vB('vIron',0,H,0,1.8,.4,1.8,0,gun);kput('vHoop',[0,H+.8,-.4],vQ(Math.PI/2,0,0),[.6,.6,.6],gun);
 vBeam([0,H+1.2,-.4],[0,H+RISE,-L],.05,gun,'vIron');vBeam([0,H+.4,-.4],[0,H+RISE-.8,-L],.05,gun,'vIron');
 const t=.35;kput('vPanelB',[0,H+.8+t*RISE-1.4,-.4-t*(L-.4)],vQ(0,.1,0),[2.2,.12,1.4],null);vBeam([0,H+1.2+t*(RISE-.4),-.4-t*(L-.4)],[0,H+.8+t*RISE-1.3,-.4-t*(L-.4)],.03,gun,'vIron');}

// Conveyor: one segment o.len metres (default 16) along local x, a belt on trestles 3.2 m up under a corrugate hood.
function buildPylConveyor(G,o){reseed(9195+(o.v|0));const L=o.len==null?16:o.len,Y=3.2;
 const gun=vC(vPick(PYPAL.gunmetal)),or=vC(vPick(PYPAL.orange));
 vnReg('Conveyor',0,0,L/2,Y+1.4,{style:'salvage'});
 for(let k=0;k<=Math.round(L/4);k++){const x=-L/2+.3+k*(L-.6)/Math.round(L/4);for(const s of[-1,1])vBeam([x,0,s*.9],[x,Y,s*.45],.12,or,'vIron');vB('vIron',x,Y-.1,0,.2,.2,1.2,0,gun);}
 vB('vIron',0,Y+.1,0,L,.12,1.1,0,vC(0x2a2a2a));vB('vIron',0,Y+.22,0,L,.08,.9,0,vC(0x1e1e1e));
 for(const s of[-1,1])vB('vIron',0,Y+.1,s*.58,L,.35,.06,0,gun);
 vB('vCorr',0,Y+1.1,0,L+.2,.06,1.5,0,null);for(let k=0;k<L/1.4;k++){const x=-L/2+.6+k*1.4;if(rng()<.6)vBq(rng()<.5?'vPanelB':'vRustB',x,Y+.35,rr(-.2,.2),rr(.4,.8),.12,.5,vQ(rng()*TAU,0,0),null);}}

VERN.def({key:'pyl_scrap_yard',name:'Scrap yard',family:'industry',tags:PY_TAG_IND,w:30,d:24,h:9,build:buildPylScrapYard});
VERN.def({key:'pyl_breakers_floor',name:'Breakers\' floor',family:'industry',tags:Object.assign({},PY_TAG_IND,{role:'salvage breaker',job:'smithing'}),w:24,d:18,h:12,build:buildPylBreakersFloor});
VERN.def({key:'pyl_smelter',name:'Smelter',family:'industry',tags:Object.assign({},PY_TAG_IND,{style:'neo',wealth:'middle'}),w:16,d:16,h:16,build:buildPylSmelter});
VERN.def({key:'pyl_sorting_shed',name:'Sorting shed',family:'industry',tags:Object.assign({},PY_TAG_IND,{style:'neo'}),w:25,d:9,h:7.5,build:buildPylSortingShed});
VERN.def({key:'pyl_scrap_exchange',name:'Scrap exchange',family:'trade',tags:{culture:'pylon',style:'neo',type:['market/shop'],wealth:'middle',lit:false},w:35,d:12,h:13,build:buildPylScrapExchange});
VERN.def({key:'pyl_bazaar_lane',name:'Bazaar lane',family:'trade',tags:{culture:'pylon',style:'salvage',type:['market/shop'],wealth:'poor',lit:false},w:25,d:8,h:5,build:buildPylBazaarLane});
VERN.def({key:'pyl_tank_farm',name:'Tank farm',family:'industry',tags:Object.assign({},PY_TAG_IND,{type:['industry','infrastructure']}),w:24,d:18,h:11,build:buildPylTankFarm});
VERN.def({key:'pyl_crawler_depot',name:'Crawler depot',family:'industry',tags:Object.assign({},PY_TAG_IND,{style:'neo',type:['industry','infrastructure'],wealth:'middle'}),w:26,d:18,h:9.5,build:buildPylCrawlerDepot});
VERN.def({key:'pyl_workshop',name:'Workshop',family:'industry',tags:Object.assign({},PY_TAG_IND,{style:'neo',wealth:'middle'}),w:15,d:12,h:6,build:buildPylWorkshop});
VERN.def({key:'pyl_cable_crane',name:'Cable crane',family:'industry',tags:Object.assign({},PY_TAG_IND,{type:['industry','infrastructure']}),w:4,d:4,h:20,build:buildPylCableCrane});
VERN.def({key:'pyl_conveyor',name:'Conveyor (segment)',family:'industry',tags:Object.assign({},PY_TAG_IND,{type:['infrastructure']}),w:16,d:2.4,h:4.5,build:buildPylConveyor});
