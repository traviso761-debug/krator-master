// ================================================================ SEGMENT: cgBox (container dock)
// A straight 110 m container quay on a deep berth, with a straddle-carrier
// yard behind it: two blocks of nine single rows of 40' boxes (1-3 high),
// rows 4.4 m apart so the carriers' legs run in the gaps, a central lane.
// Behind the yard, west: a reefer block (two banks of white reefers either
// side of a three-tier steel rack with plug lights); east: the gatehouse on
// the land side (a white canopy over four truck lanes, booths and barrier
// arms, a terraced drum office). Seeds 20210-20214. Uses the cg kit in
// 83-cg-crane.js (cgBar, cgBx, cgContainerTower, cgMast, cgTractor).
//   d=0 intact   straddle carriers at work, trucks at the gate, plug lights
//   d=1 ruined   stacks toppled into the lanes, a carrier fallen on its side
//                and one slumped onto a stack, boxes in the silted berth,
//                the canopy's east end collapsed, a rack tier down, weeds
//   d=3 reclaimed container towers stand where rows were, the remaining rows
//                cut with doors and lit windows, houses on the carriers'
//                frames, the rack a stair-street, the gate canopy a market
const CGB={LAND:110,SEA:50,Z0:-27,SLOT:12.3,NS:3};
MAT.cgGrate=new THREE.MeshStandardMaterial({color:0x7c8288,roughness:.7,metalness:.4});
// straddle carrier: 15.8 m tall, legs 4.8 m apart across (x), 7.8 m along (z);
// long axis along local z; the spreader hangs at 11.2 m. Tyres separate.
kdef('cgStraddle',pkMergeGeo([
 ...[[-2.4,-3.9],[2.4,-3.9],[-2.4,3.9],[2.4,3.9]].map(a=>new THREE.BoxGeometry(.55,12.6,.8).translate(a[0],7.6,a[1])),
 ...[-2.4,2.4].map(x=>new THREE.BoxGeometry(.7,.9,9.6).translate(x,1.3,0)),
 ...[-2.4,2.4].map(x=>new THREE.BoxGeometry(.8,1.1,9.2).translate(x,14.2,0)),
 ...[-3.9,3.9].map(z=>new THREE.BoxGeometry(5.6,1,.9).translate(0,14.3,z)),
 ...[[-2.4,-1.4],[2.4,-1.4],[-2.4,1.4],[2.4,1.4]].map(a=>new THREE.BoxGeometry(.3,5,.3).translate(a[0],3.6,a[1])),   // leg braces
 new THREE.BoxGeometry(5.2,1.7,2.8).translate(0,15.6,-2.6),new THREE.BoxGeometry(1.9,2.2,2.2).translate(2.2,15.9,3.3),
 new THREE.BoxGeometry(2.8,.45,12).translate(0,11.2,0),...[[-1.2,-4],[1.2,-4],[-1.2,4],[1.2,4]].map(a=>new THREE.BoxGeometry(.08,2.4,.08).translate(a[0],12.6,a[1]))]),MAT.pkPaint);
kdef('cgStraddleW',pkMergeGeo([-2.4,2.4].flatMap(x=>[-3.6,-1.2,1.2,3.6].map(z=>new THREE.CylinderGeometry(.62,.62,.55,10).rotateZ(Math.PI/2).translate(x,.62,z)))),MAT.pkRubber);
function cgStraddle(x,y,z,yaw,d,o){o=o||{};const q=o.q||qEuler(0,yaw,0);
 const col=d>0?new THREE.Color(0x8a5a40):(o.col||null);
 kput('cgStraddle',[x,y,z],q,1,col);kput('cgStraddleW',[x,y,z],q,1,null);
 if(!o.q&&d===0)kput('dot',[x+2.2*Math.cos(yaw)+3.3*Math.sin(yaw),y+15.9,z-2.2*Math.sin(yaw)+3.3*Math.cos(yaw)],q,[1.3,.9,.3],CG.FLOOD);}
function cgBoxStamps(o){const d=o.d,h=o.W/2,k=o.W/110;
 const s=[{kind:'flat',x0:-h,z0:-CGB.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:CGB.SEA,y:d===1?-7:PORT.BERTH,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-50,12],[-10,8],[30,18],[46,34],[0,44],[-40,38]].map(p=>[p[0]*k,p[1]]),y:-1.5,soft:14,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:CGB.LAND,SEA:CGB.SEA}));}
function buildCgBox(scene,gx,gz,d,opt){reseed(20210+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,k=opt.W/110,ruin=d>0;
 portPaving(G,-h,-CGB.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d,{ladders:36,bollards:16});
 portSideClose(G,opt.nb,d,{z0:-CGB.LAND,z1:0});
 const vk=portVesselFor(opt,0),V=vk?PORT_REG.vessel[vk]:null;
 if(V&&V.length<=opt.W-16&&V.beam<=40)portPlaceVessel(G,vk,0,3+V.beam/2,Math.PI/2,d);
 // painted lane lines (intact): the central lane and the quay road
 if(d===0){pbBox(G,MAT.pkCope,-5*k,D+.05,-60,.25,.02,74,0,8);pbBox(G,MAT.pkCope,5*k,D+.05,-60,.25,.02,74,0,8);pbBox(G,MAT.pkCope,0,D+.05,-24.5,opt.W-4,.02,.25,0,8);}
 // ---- the straddle yard
 const rows=[];for(let i=0;i<9;i++){rows.push({x:(-45+i*4.4)*k,b:0,i});rows.push({x:(45-i*4.4)*k,b:1,i});}
 const zs=[0,1,2].map(j=>CGB.Z0-CGB.SLOT/2-j*CGB.SLOT);
 // reclaimed: towers take the place of rows 2-3 (west) and 5-6 (east) in slots 0-1
 const towerAt=d>=3?[{b:0,i:[2,3],x:(-45+2.5*4.4)*k,z:(zs[0]+zs[1])/2},{b:1,i:[5,6],x:(45-5.5*4.4)*k,z:(zs[1]+zs[2])/2}]:[];
 const cleared=(r,j)=>towerAt.some(t=>t.b===r.b&&t.i.indexOf(r.i)>=0&&(t.z>zs[1]?j<2:j>0));
 const slump=d===1?{b:0,i:4}:null;
 for(const r of rows)for(let j=0;j<3;j++){if(cleared(r,j))continue;const z=zs[j];
  let nt=rng()<.08?0:1+((rng()*3)|0);if(d>=3)nt=Math.min(nt,2);
  if(slump&&r.b===slump.b&&r.i===slump.i){           // a row that collapsed: boxes slumped askew
   for(let t=0;t<nt;t++)portContainer(r.x+rr(-.8,.8),D+t*1.9,z+rr(-1.5,1.5),Math.PI/2+rr(-.25,.25),true,1,null,[rr(-.25,.25),rr(-.3,.3)]);continue;}
  for(let t=0;t<nt;t++){
   if(d===1&&t===nt-1&&t>0&&rng()<.35){               // the top box fell off into the lane
    const s=rng()<.5?-1:1;portContainer(r.x+s*rr(2.4,3.4),D+1.22,z+rr(-2,2),Math.PI/2+rr(-.15,.15),true,1,null,[Math.PI/2*.98*s,rr(-.05,.05)]);continue;}
   const tl=d===1&&t===nt-1&&rng()<.3?[rr(-.06,.06),rr(-.04,.04)]:null;
   portContainer(r.x+rr(-.05,.05),D+t*2.6,z+rr(-.08,.08),Math.PI/2+rr(-.01,.01),true,d,null,tl);
   // reclaimed: the rows are housing - doors and windows on the lane faces
   if(d>=3&&rng()<.7){const s=rng()<.5?-1:1,q=qEuler(0,s>0?Math.PI/2:-Math.PI/2,0);
    for(const u of [-3.6,0,3.6]){const lit=rng()<.5;
     if(t===0&&u===-3.6)kput('pkDoor',[r.x+s*1.25,D+1.05,z+u],q,[.95,2.05,1],new THREE.Color().setHSL(rng(),.35,.35));
     else kput(lit?'dot':'cellD',[r.x+s*1.25,D+t*2.6+1.5,z+u],q,lit?[.9,1,.3]:[1.1,.9,.25],lit?WARM:null);}}}}
 for(const b of [0,1])for(const zz of [zs[0]+3,zs[2]-3]){const bx=(b?27:-27)*k;REGISTER({name:d>=3?'Container rows (housing)':'Straddle-carrier yard',x:bx,z:zz,r:13,h:9,y:D});}
 for(const t of towerAt)cgContainerTower(G,t.x,D,t.z,Math.PI/2+rr(-.05,.05),d,{levels:t.b?6:8,top:t.b?'dish':'mast'});
 // ---- straddle carriers
 if(d===0){
  cgStraddle(rows[4].x,D,zs[1]+2,0,d);cgStraddle(rows[9].x,D,zs[0]-1,0,d);cgStraddle(rows[15].x,D,zs[2],0,d);
  cgStraddle(0,D,-44,0,d);portContainer(0,D+8.5,-44,Math.PI/2,true,0);                       // carrying one down the central lane
  cgStraddle(-20*k,D,-16,Math.PI/2,d);portContainer(-20*k,D+8.5,-16,0,true,0);                 // at the quay interchange
  cgStraddle(24*k,D,-13,Math.PI/2+.05,d);
  for(const s of [-1,1])REGISTER({name:'Straddle carrier',x:s*22*k,z:-15,r:6,h:16,y:D});REGISTER({name:'Straddle carrier',x:0,z:-44,r:6,h:16,y:D});}
 else if(d===1){
  // one slumped against a stack, one fallen on its side across the lane, one rusted in place
  cgStraddle(rows[8].x,D,zs[1],0,d,{q:qEuler(0,0,.2)});
  cgStraddle(-7.6*k,D+2.9,-50,0,d,{q:qEuler(0,.08,0).multiply(qEuler(0,0,-Math.PI/2*.97))});
  cgStraddle(-18*k,D,-14,Math.PI/2+.2,d);
  REGISTER({name:'Fallen straddle carrier',x:0,z:-50,r:9,h:7,y:D});REGISTER({name:'Straddle carrier',x:-18*k,z:-14,r:6,h:16,y:D});}
 else{
  // carriers as stilts: a house on each frame, a stair up the leg
  for(const [x,z,yw] of [[-20*k,-15,Math.PI/2],[22*k,-13,Math.PI/2+.05],[0,-44,0]]){cgStraddle(x,D,z,yw,d);
   kput('plank',[x,D+16.5,z],qEuler(0,yw,0),[5.8,.2,9.4],CG.TIMBER);
   portContainerHouse(G,x,D+16.6,z,yw+Math.PI/2+rr(-.05,.05),d,{levels:1,big:false,noReg:true});
   const c=Math.cos(yw),s=Math.sin(yw);for(let i=0;i<8;i++){const up=i%2===0,lx=3.4,lz=up?-3:-.6;
    kput('pkStair',[x+lx*c+lz*s,D+i*2,z-lx*s+lz*c],qEuler(0,yw+(up?0:Math.PI),0),[1.1,1,1],null);}
   REGISTER({name:'Straddle-carrier house',x,z,r:6,h:22,y:D});}}
 // ---- quay interchange: boxes landed in a line, lamps
 if(d<3){for(let x=-h+36;x<h-14;x+=13.4)if(rng()<.7)portContainer(x+rr(-.4,.4),D,-9,rr(-.02,.02),true,d);}   // clear of the eye-level preset's spot
 for(let x=-h+22;x<=h-22+.1;x+=33)portLamp(x,D,-3.5,0,d);
 // ---- the reefer block (west): two banks of reefers either side of a three-tier rack
 const rx0=-45*k,rx1=-8*k,rzc=-83.8,RB=1.1;
 const nR=Math.floor((rx1-rx0)/2.6);
 for(const side of [-1,1])for(let i=0;i<nR;i++){const x=rx0+1.3+i*2.6,z=rzc+side*(RB+6.2);
  const nt=d===1?1+((rng()*2)|0):2+(rng()<.4?1:0);
  for(let t=0;t<nt;t++){const c=d>0?new THREE.Color(0xd8d2c6).lerp(PK_RUST,d===1?rr(.3,.6):rr(.15,.35)):new THREE.Color(0xeeece6);
   const tl=d===1&&t===nt-1&&rng()<.25?[rr(-.06,.06),rr(-.1,.1)]:null;
   portContainer(x,D+t*2.6,z,Math.PI/2,true,d,c,tl);
   if(d===0)kput('dot',[x,D+t*2.6+1.9,rzc+side*(RB+.05)],null,[.25,.25,.12],new THREE.Color(rng()<.85?0x4cff8a:0xffb040));
   if(d>=3&&rng()<.55)kput('dot',[x,D+t*2.6+1.5,rzc+side*(RB+.06)],null,[.9,1.1,.2],WARM);}}
 const rackMat=d>0?MAT.rust:MAT.cgGrate,tiers=[2.6,5.2,7.8];
 for(let ti=0;ti<3;ti++){const y=D+tiers[ti];
  if(d===1&&ti===2){const g=cgBarGeo([rx0,y-3.5,rzc],[rx0+(rx1-rx0)*.55,y,rzc],.15,2.2);pbAdd(g,rackMat,G);   // a tier broken and hanging to the ground
   cgBx(G,rackMat,rx0+(rx1-rx0)*.78,y,rzc,(rx1-rx0)*.44,.15,2.2);continue;}
  cgBx(G,rackMat,(rx0+rx1)/2,y,rzc,rx1-rx0,.15,2.2);
  for(let x=rx0+2.5;x<rx1-1;x+=5)for(const s of [-1,1])if(!(d===1&&rng()<.3))kput('pkGuard',[x,y+.08,rzc+s*1.05],null,[1,1,1],ruin?PK_RUST:null);}
 for(let x=rx0;x<=rx1+.1;x+=(rx1-rx0)/6)for(const s of [-1,1])cgBx(G,rackMat,x,D+4.6,rzc+s*1.05,.28,9.2,.28);
 cgBx(G,rackMat,(rx0+rx1)/2,D+9.3,rzc,rx1-rx0,.2,2.6);
 for(let i=0;i<4;i++)kput('pkStair',[rx1+1.4,D+i*2,rzc+(i%2?1.4:-1.4)],qEuler(0,i%2?Math.PI:0,0),[1.1,1,1],null);
 REGISTER({name:'Reefer block and rack',x:(rx0+rx1)/2-8,z:rzc,r:13,h:10,y:D});REGISTER({name:'Reefer block and rack',x:(rx0+rx1)/2+9,z:rzc,r:13,h:10,y:D});
 if(d>=3){portWashLine(rx0+2,rzc,rx1-2,rzc,D+tiers[1]+2.2,16);portWashLine(rx0+2,rzc+.6,rx1-2,rzc+.6,D+tiers[2]+2.2,14);
  portFigures((rx0+rx1)/2,D+tiers[0]+.1,rzc,4,14);portFigures((rx0+rx1)/2,D+tiers[1]+.1,rzc,3,14);
  for(let i=0;i<6;i++)kput('planter',[rx0+3+i*6,D+tiers[2]+.4,rzc],null,[2.2,.5,.8],null);}
 // ---- the gatehouse (east): canopy over four lanes, booths, barriers, office
 cgGate(G,d,k);
 // ---- yard lights
 for(const [x,z] of [[0,-20],[0,-68],[-h+10,-102],[h-10,-66]]){
  if(d===1&&rng()<.5){kput('cgMast',[x,D+.4,z],qEuler(0,rng()*TAU,0).multiply(qEuler(0,0,Math.PI/2-.04)),1,PK_RUST);continue;}
  kput('cgMast',[x,D,z],null,1,ruin?new THREE.Color(0xa88a74):null);if(d!==1)kput('cgMastGlow',[x,D,z],null,1,d===0?CYAN:WARM);}
 // ---- people, ruin, reclaimed life
 if(d===0){portFigures(0,D,-16,10,h-12);portFigures(26*k,D,-88,6,12);portBuoy(-36,34);portBuoy(40,30);}
 if(d===1){
  portContainer(-26*k,-1.2,14,.3,true,1,null,[.2,.4]);portContainer(12*k,-.4,22,1.2,true,1,null,[-.3,.25]);portContainer(34*k,-1.6,9,-.2,false,1,null,[.5,-.3]);
  portWeeds(-h+4,-CGB.LAND+3,h-4,-3,220,D);
  portTrees(-4,-66,4,-26,4,D,5,11);portTrees(-h+8,-106,-6,-98,3,D,4,9);portTrees(-h+6,-24,h-6,-19,3,D,4,8);
  for(const r of rows)if(rng()<.25)portWeeds(r.x+1.4,zs[2]-6,r.x+2.8,zs[0]+6,10,D);
  portRubble(28*k,D,-92,6,16);
  kput('pkSkiff',[-10,-1,30],qEuler(.25,1.2,Math.PI*.9),1,new THREE.Color(0x5a4a3a));}
 if(d>=3){
  for(const z of [-30,-36,-54,-60])portStall(-1.6+rr(-.4,.4),D,z,Math.PI/2*(rng()<.5?1:-1));
  portGarden(0,D,-66,8,5,d);portGarden(-27*k,D,-20,20,6,d);portGarden(27*k,D,-22,18,5,d);
  for(const L of wall.ladders){portSkiff(L[0]+rr(-4,4),L[1]+2.6,Math.PI/2+rr(-.15,.15));if(rng()<.5)portSkiff(L[0]+rr(6,10),L[1]+5,Math.PI/2+rr(-.2,.2));}
  for(let i=0;i<5;i++)portSkiff(rr(-h+10,h-10),rr(12,42),rng()*TAU);
  portWashLine(-h+14,-4,-4,-4,8.5,10);
  portFigures(0,D,-45,20,8);portFigures(0,D,-15,16,h-14);portFigures(26*k,D,-88,14,14);portWeeds(-h+5,-CGB.LAND+3,h-5,-3,50,D);}
 KOFF=[0,0,0];return G;}
// The gate: a white canopy slab on columns over four truck lanes (lanes run
// along z, trucks come in from the land), booths on the islands, barrier
// arms, and a terraced drum office beside it.
function cgGate(G,d,k){const D=PORT.DECK,ruin=d>0,x0=10*k,x1=44*k,z0=-95,z1=-81,y=D+8,wm=ruin?MAT.rust:MAT.white;
 const lanes=4,lw=(x1-x0)/lanes;
 // canopy: at d=1 the east third has dropped, one end on the ground
 if(d===1){cgBx(G,wm,x0+(x1-x0)*.33,y+.5,(z0+z1)/2,(x1-x0)*.66,1,z1-z0);
  const g=cgBarGeo([x0+(x1-x0)*.66+.4,y+.2,(z0+z1)/2],[x1+1.5,D+.8,(z0+z1)/2],1,z1-z0);pbAdd(g,wm,G);}
 else cgBx(G,wm,(x0+x1)/2,y+.5,(z0+z1)/2,x1-x0,1,z1-z0);
 if(d===0)for(const zz of [z0-.02,z1+.02])kput('strip',[(x0+x1)/2,y+.4,zz],null,[x1-x0-1,1,1],CYAN);
 for(let i=0;i<=lanes;i++){const x=x0+i*lw;
  for(const zz of [z0+1.2,z1-1.2]){if(d===1&&i>=3)continue;kput('pkCol',[x,D,zz],null,[.42,8,.42],ruin?new THREE.Color(0x9a8a7a):null);}
  if(i>0&&i<lanes){// booth on the island
   cgBx(G,wm,x,D+1.5,(z0+z1)/2,1.7,3,3);cgBx(G,ruin?MAT.rust:MAT.cgBlue,x,D+3.15,(z0+z1)/2,2.2,.3,3.6);
   for(const s of [-1,1])kput(d===0?'pane':'paneD',[x+s*.87,D+1.9,(z0+z1)/2],qEuler(0,Math.PI/2,0),[2.4,1.3,1],null);}
  if(i<lanes){const xa=x+.9;
   if(d===1&&rng()<.6)kput('plateW',[xa+1.6,D+.15,(z0+z1)/2+rr(1,3)],qEuler(0,rr(-.5,.5),0),[3.6,.12,.12],new THREE.Color(0x8a4a3a));
   else kput('plateW',[xa+1.7,D+1.05,(z0+z1)/2-1.8],null,[3.6,.12,.12],d===0?new THREE.Color(0xd83a2a):new THREE.Color(0x9a6a50));}}
 REGISTER({name:'Gatehouse canopy',x:(x0+x1)/2-8*k,z:(z0+z1)/2,r:9,h:9.5,y:D});REGISTER({name:'Gatehouse canopy',x:(x0+x1)/2+8*k,z:(z0+z1)/2,r:9,h:9.5,y:D});
 // trucks at the gate (intact), a market under the canopy (reclaimed)
 if(d===0)for(let i=0;i<lanes;i++)if(rng()<.75){const x=x0+(i+.5)*lw,z=(z0+z1)/2-rr(2,6);
  kput('cgTractor',[x,D,z],qEuler(0,-Math.PI/2,0),1,new THREE.Color().setHSL(rr(0,1),.3,.55));kput('cgTyres',[x,D,z],qEuler(0,-Math.PI/2,0),1,null);
  portContainer(x,D+1.5,z-.6,Math.PI/2,true,0);}
 if(d>=3){for(let i=0;i<lanes;i++)for(let j=0;j<2;j++)portStall(x0+(i+.5)*lw+rr(-.5,.5),D,z0+3.5+j*6.5,rng()<.5?0:Math.PI);
  for(let i=0;i<8;i++)kput('pkCloth',[rr(x0+1,x1-1),y-.05,rr(z0+1,z1-1)],qEuler(0,rng()*TAU,0),[rr(1.5,3),rr(1,2.2),1],new THREE.Color().setHSL(rng(),.5,.6));
  for(let x=x0+3;x<x1;x+=5)kput('dot',[x,y-.25,(z0+z1)/2],null,[.5,.3,.5],WARM);}
 // office: three stepped elliptical drums, white floors, blue glass bands, a roof garden
 const ox=37*k,oz=-72.5,T=[[8,5.2,0],[7,4.5,4.4],[5.8,3.7,8.8]];
 for(const [rx,rz,y0] of T){const fl=new THREE.CylinderGeometry(1,1,1,32);fl.scale(rx,1,rz);fl.translate(ox,D+y0+3.9,oz);pbAdd(fl,ruin?MAT.concreteR:MAT.white,G);
  const gl=new THREE.CylinderGeometry(1,1,1,32);gl.scale(rx*.94,3.4,rz*.94);gl.translate(ox,D+y0+1.7,oz);pbAdd(gl,d===1?MAT.dark:MAT.winIntact,G);
  if(d===0)kput('strip',[ox,D+y0+3.45,oz+rz*.95],null,[rx*1.2,1,1],CYAN);}
 if(d===0)for(let a=0;a<14;a++){const t=a/14*TAU;kput('hedge',[ox+Math.cos(t)*5.4,D+13.6,oz+Math.sin(t)*3.4],qEuler(0,-t,0),[1,.7,1.8],new THREE.Color(0x4a7a3a));}
 if(d===1){rubbleRing(ox,D,oz,8,11,20,1.6);vinesOnRing(ox,D+13,oz,5.9,6,9);}
 REGISTER({name:'Gate office',x:ox,z:oz,r:8.5,h:14,y:D});}
PORT_SEG({key:'cgBox',name:'Container dock',cls:'seg',W:110,LAND:CGB.LAND,SEA:CGB.SEA,decays:[0,1,3],stamps:cgBoxStamps,build:buildCgBox});
