// ================================================================ LAND BLOCK: chCourt - container compounds round courtyards
// Four low compounds (one or two storeys) separated by two lanes: each a
// ring of containers facing a courtyard, doors opening onto timber decks
// under awnings, a fire pit, a table, washing lines, a water tank on a
// stand, a solar frame, a dish and an antenna, garden beds, an outhouse,
// bulbs strung across. The gate side faces a lane and is closed by a fence.
// Seeds 20810+d; each compound's plan from chPRNG(20870+i) (same in every
// decay). Shared helpers are in 89a-ch-stack.js; the yard props below
// (chFirePit, chWaterStand, chSolarRow, chTable, chAntenna) serve chTank too.
// d=1: one compound burnt out, awnings torn, upper boxes slid off into the
// yard, the water tank down, weeds and trees in the courtyards.
// d=3: second and third storeys everywhere, a tarp roof over part of each
// courtyard, rooftop gardens, bridges between compounds over the lanes,
// stalls and shacks in the lanes.

// ---------------------------------------------------------------- yard props
// A fire pit: a ring of stones, logs to sit on; flames and glow at night.
function chFirePit(x,z,d){const D=CH.D;
 for(let i=0;i<9;i++){const a=i/9*TAU;kput('rubble',[x+Math.cos(a)*1.1,D+.15,z+Math.sin(a)*1.1],qEuler(rng()*3,rng()*3,rng()*3),[.34,.26,.3],new THREE.Color().setHSL(.08,.06,rr(.35,.5)));}
 kput('moss',[x,D+.03,z],null,[.9,.05,.9],new THREE.Color(0x1a1614));
 for(let i=0;i<3;i++){const a=i/3*TAU+rr(-.3,.3);kput('trunk',[x+Math.cos(a)*2.6,D+.25,z+Math.sin(a)*2.6],qEuler(0,-a,Math.PI/2),[1.2,1.6,1.2],null);}
 if(d===1)return;
 for(const a of [0,Math.PI/2])kput('fireWin',[x,D+.55,z],qEuler(0,a,0),[.9,1,1],null);
 kput('emberB',[x,D+1.2,z],null,[4,3,4],new THREE.Color().setHSL(.07,1,.35));}
// A water tank on a four-legged stand, ladder up; d=1 fallen (legs down).
function chWaterStand(x,z,h,d,col){const D=CH.D,fc=chFrameCol(d);col=col||(d===0?new THREE.Color(0x2c6a9a):new THREE.Color(0x7a5a44));
 if(d===1&&rng()<.6){kput('chTank',[x+1.6,D+1.4,z],qEuler(0,rng()*TAU,Math.PI/2),[1.4,2.6,1.4],col);
  for(let i=0;i<3;i++)kput('chBar',[x+rr(-2,2),D+.15,z+rr(-2,2)],qEuler(0,rng()*TAU,Math.PI/2-.05),[.16,h*.8,.16],fc);return;}
 for(const sx of [-1,1])for(const sz of [-1,1])chBeam('chBar',[x+sx*1.3,D,z+sz*1.3],[x+sx*1,D+h,z+sz*1],.14,fc);
 for(const sx of [-1,1])chBeam('chBar',[x+sx*1.15,D+h*.45,z-1.15],[x+sx*1.15,D+h*.45,z+1.15],.08,fc);
 kput('plank',[x,D+h+.08,z],null,[2.6,.16,2.6],null);
 kput('chTank',[x,D+h+.16,z],null,[1.25,2.4,1.25],col);
 kput('pkLadder',[x+1.35,D+h,z],qEuler(0,Math.PI/2,0),[1,h/10,1],null);}
// A row of n solar panels on a steel frame, facing +z, at height y.
function chSolarRow(x,y,z,n,d){const fc=chFrameCol(d);
 for(let i=0;i<n;i++){const px=x+(i-(n-1)/2)*1.1;
  if(d===1&&rng()<.4){kput('pkSolar',[px+rr(-.5,.5),y+.1,z+rr(0,1.5)],qEuler(rr(-.3,.3),rr(-.5,.5),rr(-.2,.2)),1,null);continue;}
  kput('pkSolar',[px,y+1,z],qEuler(.5,0,0),1,null);}
 for(const e of [-1,1]){kput('chBar',[x+e*(n*.55),y+.6,z+.45],null,[.07,1.2,.07],fc);kput('chBar',[x+e*(n*.55),y+.35,z-.45],null,[.07,.7,.07],fc);}}
// A trestle table with two benches.
function chTable(x,z,yaw){const D=CH.D,q=qEuler(0,yaw,0),c=Math.cos(yaw),s=Math.sin(yaw);
 kput('plank',[x,D+.78,z],q,[2.2,.08,.9],null);kput('plank',[x,D+.38,z],q,[1.8,.76,.1],null);
 for(const e of [-1,1])kput('plank',[x+s*e*.85,D+.44,z+c*e*.85],q,[2,.08,.34],null);}
// An antenna mast with cross-bars and guy wires.
function chAntenna(x,y,z,h,d){const c=new THREE.Color(0x9aa0a4);
 kput('chPole',[x,y,z],d===1?qEuler(rr(-.35,.35),0,rr(-.35,.35)):null,[.05,h,.05],c);if(d===1)return;
 for(const k of [.7,.85,1])kput('chBar',[x,y+h*k,z],qEuler(0,rng()*TAU,0),[rr(.8,1.6),.04,.04],c);
 for(let i=0;i<3;i++){const a=i/3*TAU+.4;chBeam('chBar',[x,y+h*.75,z],[x+Math.cos(a)*h*.35,y,z+Math.sin(a)*h*.35],.025,new THREE.Color(0x303234));}}

// ---------------------------------------------------------------- the compound
// chCompound(G,C,d,o) -> {ups:[{x,z,y,yaw,big}], box:[x0,z0,x1,z1]}
// C = {cx,cz,W,Dp,gate:'N'|'S'|'W'|'E',seed,burnt,up (share of boxes with an
// upper storey)}. Wings run along the four edges, the gate edge only a third
// built and fenced; every ground box has its door, a deck and an awning on
// the courtyard side.
function chCompound(G,C,d,o){o=o||{};const R=chPRNG(C.seed),D=CH.D,hw=C.W/2,hd=C.Dp/2,burnt=d===1&&!!C.burnt;
 const wings={N:{a:[-hw+2.6,-hd+1.22],dir:[1,0],len:C.W-5.2,in:[0,1]},S:{a:[-hw+2.6,hd-1.22],dir:[1,0],len:C.W-5.2,in:[0,-1]},
  W:{a:[-hw+1.22,-hd],dir:[0,1],len:C.Dp,in:[1,0]},E:{a:[hw-1.22,-hd],dir:[0,1],len:C.Dp,in:[-1,0]}};
 const U=[],ups=[];
 for(const k of ['N','W','E','S']){const w=wings[k],gate=k===C.gate,stop=gate?w.len*.38:w.len;let p=gate&&R()<.5?w.len-stop:0;const end=p+stop;
  while(end-p>=6.2){const big=end-p>=12.3&&R()<.6,L=big?CH.L40:CH.L20,mid=p+L/2;
   U.push({x:C.cx+w.a[0]+w.dir[0]*mid,z:C.cz+w.a[1]+w.dir[1]*mid,yaw:w.dir[0]?0:Math.PI/2,big,L,in:w.in,wing:k,up:R(),r:R(),r2:R()});
   p+=L+(R()<.55?0:.8+R()*2.4);}
  if(gate){const s0=p>=w.len-.1?0:end,s1=p>=w.len-.1?w.len-stop:w.len;   // fence the open part, gate in the middle
   const A=t=>[C.cx+w.a[0]+w.dir[0]*t-w.in[0]*1,C.cz+w.a[1]+w.dir[1]*t-w.in[1]*1];const gm=(s0+s1)/2;
   chBoundary(A(s0),A(gm-2),d,'fence');chBoundary(A(gm+2),A(s1),d,'fence');
   if(d!==1){const g=A(gm);chLamp(g[0]+w.dir[0]*2.4,D,g[1]+w.dir[1]*2.4,d,2.8);}}}
 const upShare=(C.up||.3)+(d===3?.45:0);
 for(const u of U){const ds=u.yaw?u.in[0]:u.in[1],c=Math.cos(u.yaw),s=Math.sin(u.yaw);
  const tilt=d===1&&u.r2<.15;
  if(tilt)chUnit(u.x,D,u.z,u.yaw,u.big,d,{burnt,q:qEuler(0,u.yaw+rr(-.2,.2),rr(-.05,.05))});
  else chUnit(u.x,D,u.z,u.yaw,u.big,d,{burnt,lit:.6,doorSide:ds,endGlass:u.r<.2?1:0,port:u.r>.85&&!u.big});
  // deck and awning in front of the door
  const ox=u.in[0],oz=u.in[1],q=qEuler(0,u.yaw,0);
  if(!burnt){kput('plank',[u.x+ox*2.3,D+.12,u.z+oz*2.3],q,[u.L*.55,.24,2.1],null);
   if(!(d===1&&u.r<.5)){const aw=u.r<.5?'pkAwn':'shantyRoof',ac=aw==='pkAwn'?new THREE.Color().setHSL(u.r2,.5,.62):new THREE.Color().setHSL(.08+u.r2*.1,.3,rr(.5,.7));
     const qa=q.clone().multiply(qEuler(.2*ds*(d===1?2.2:1),0,d===1?rr(-.15,.15):0));
     kput(aw,[u.x+ox*2.9,D+2.45-(d===1?.5:0),u.z+oz*2.9],qa,[u.L*.72,1,3.4],ac);
     for(const e of [-1,1])kput('chPole',[u.x+ox*4.4+s*0+c*e*u.L*.34,D,u.z+oz*4.4-s*e*u.L*.34],d===1?qEuler(rr(-.3,.3),0,rr(-.3,.3)):null,[.06,2.1,.06],new THREE.Color(0x7a6048));}}
  else if(u.r<.4)kput('patchTarp',[u.x+ox*1.5,D+1.4,u.z+oz*1.5],q.clone().multiply(qEuler(0,0,rr(-.3,.3))),[u.L*.4,1.8,1],new THREE.Color(0x3a3430));
  // upper storey (and a third at d=3)
  if(u.up<upShare&&!tilt){let yy=D+CH.H;const nUp=d===3&&u.up<.2?2:1;
   for(let k=0;k<nUp;k++){const bg=u.big&&(k===0?u.r2<.7:false),off=bg?0:(u.big?(u.r2<.5?-3:3):0);
    const px=u.x+c*off,pz=u.z-s*off;
    if(d===1&&u.r2<.45){   // slid off into the courtyard
     kput(bg?'pkCont40R':'pkCont20R',[px+ox*4,D+.8,pz+oz*4],qEuler(0,u.yaw+rr(-.4,.4),0).multiply(qEuler(rr(.2,.5)*ds,0,0)),1,chCol(1,burnt));break;}
    chUnit(px,yy,pz,u.yaw,bg,d,{burnt,lit:.6,doorSide:ds});ups.push({x:px,z:pz,y:yy+CH.H,yaw:u.yaw,big:bg});
    // stair up on the courtyard side, a rail along the roof edge
    kput('pkStair',[u.x+ox*1.9-c*(u.L/2-.4),yy-CH.H,u.z+oz*1.9+s*(u.L/2-.4)],qEuler(0,u.yaw+Math.PI/2,0),[1,CH.H/2,1.1],null);
    chRail(px-c*(bg?6:3),pz+s*(bg?6:3),px+c*(bg?6:3),pz-s*(bg?6:3),yy+CH.H,d,d===1?.5:0);
    yy+=CH.H;}}
  else if(!tilt&&d!==1&&u.r<.35){ // a roof terrace: planters, a chair
   kput('planter',[u.x,D+CH.H+.3,u.z],q,[u.L*.5,.6,1],null);
   for(let i=0;i<3;i++)kput('leafCard',[u.x+c*rr(-u.L*.2,u.L*.2),D+CH.H+.9,u.z-s*rr(-u.L*.2,u.L*.2)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.4,.7),rr(.5,.9)],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.4,.6)));}
  if(d!==1&&u.r2>.8)kput('spipe',[u.x-c*u.L*.3,D+CH.H+1,u.z+s*u.L*.3],null,[.14,2,.14],null);}
 // the courtyard
 const ix=hw-2.44-4,iz=hd-2.44-4,R2=()=>R()*2-1;
 const fp=[C.cx+R2()*ix*.3,C.cz+R2()*iz*.3];chFirePit(fp[0],fp[1],d);
 if(!burnt)chTable(fp[0]+(fp[0]<C.cx?4.5:-4.5),fp[1]+R2()*2,R()*TAU);
 const cn=[[-1,-1],[1,-1],[-1,1],[1,1]],ci=(R()*4)|0,wc=cn[ci],gc=cn[(ci+1+((R()*3)|0))%4];
 chWaterStand(C.cx+wc[0]*ix,C.cz+wc[1]*iz,3.4,d);
 if(d===0||d===3)portGarden(C.cx+gc[0]*(ix-2),D,C.cz+gc[1]*(iz-1),7,4,d);else portWeeds(C.cx-ix,C.cz-iz,C.cx+ix,C.cz+iz,50,D);
 const oc=cn[(ci+2)%4];if(!(oc[0]===gc[0]&&oc[1]===gc[1]))kput('shantyBox',[C.cx+oc[0]*(ix+1),D+1.1,C.cz+oc[1]*(iz+1)],null,[1.3,2.2,1.3],new THREE.Color(0xb8a890));
 if(d!==1){portWashLine(C.cx-ix*.8,C.cz+(R2()*iz*.5),C.cx+ix*.8,C.cz+(R2()*iz*.5),2.3,d===3?9:6);
  for(const e of [-1,1])kput('chPole',[C.cx+e*ix*.8,D,C.cz],null,[.05,2.4,.05],new THREE.Color(0x7a6048));
  chBulbs([C.cx-hw+2.4,D+CH.H,C.cz-hd+2.4],[C.cx+hw-2.4,D+CH.H,C.cz+hd-2.4],12,.8);
  portFigures(fp[0],D,fp[1],d===3?7:4,3.5);portFigures(C.cx,D,C.cz,d===3?5:2,ix*.8);
  for(let i=0;i<4;i++)kput('waterButt',[C.cx+wc[0]*(ix-2.5)+rr(-1,1),D+.45,C.cz+wc[1]*(iz-2.5)+rr(-1,1)],null,[.35,.9,.35],new THREE.Color().setHSL(rr(.5,.62),.5,.45));}
 else{portTrees(C.cx-ix,C.cz-iz,C.cx+ix,C.cz+iz,3,D,4,9);portRubble(fp[0],D,fp[1],2,5);}
 // the roof kit: a solar row on the north wing, a dish, an antenna
 const nw=U.filter(u=>u.wing==='N'&&!(d===1&&u.r2<.15));
 if(nw.length){const u=nw[0];chSolarRow(u.x,D+CH.H,u.z,u.big?8:4,d);}
 const hi=U.filter(u=>u.wing!=='N');
 if(hi.length){const u=hi[(R()*hi.length)|0];if(d!==1)kput('pkDish',[u.x,D+CH.H,u.z],qEuler(0,rng()*TAU,0),1,null);
  const v=hi[(R()*hi.length)|0];chAntenna(v.x,D+CH.H,v.z,rr(5,8),d);}
 if(d===3){   // a tarp roof over part of the yard, rooftop beds, more people
  const tx=C.cx+R2()*2,tz=C.cz+(fp[1]<C.cz?4:-4);
  for(const sx of [-1,1])for(const sz of [-1,1])kput('chPole',[tx+sx*4.5,D,tz+sz*3],null,[.07,3.6,.07],new THREE.Color(0x6a5040));
  kput('shantyRoof',[tx,D+3.7,tz],qEuler(.06,0,.04),[10.5,1,7.5],new THREE.Color().setHSL(rr(0,1),.35,.55));
  for(const u of ups)if(rng()<.5){kput('planter',[u.x,u.y+.3,u.z],qEuler(0,u.yaw,0),[u.big?7:4,.6,1.2],null);
   for(let i=0;i<4;i++)kput('leafCard',[u.x+rr(-2,2)*Math.cos(u.yaw),u.y+.9,u.z-rr(-2,2)*Math.sin(u.yaw)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.4,.7),rr(.5,.9)],new THREE.Color().setHSL(rr(.22,.32),.5,rr(.4,.6)));}}
 REGISTER({name:'Container compound',x:C.cx,z:C.cz,r:Math.max(hw,hd),h:d===3?8:5.5,y:D});
 return {ups,U,box:[C.cx-hw,C.cz-hd,C.cx+hw,C.cz+hd]};}

// ---------------------------------------------------------------- chCourt
// Lanes: north-south at x=4 (5 m), east-west at z=-54 (5 m). Compounds in the
// four quarters, gates on the lanes.
const CHC={ax:4,az:-54,aw:5,cps:[
 {cx:-23,cz:-30,W:34,Dp:32,gate:'E',up:.3},
 {cx:28,cz:-30,W:32,Dp:32,gate:'W',up:.4,burnt:true},
 {cx:-23,cz:-79,W:34,Dp:32,gate:'S',up:.2},
 {cx:28,cz:-79,W:32,Dp:32,gate:'N',up:.35}]};
function buildChCourt(scene,gx,gz,d,opt){reseed(20810+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=CH.D,C=CHC,h=opt.W/2,L=opt.LAND,hw=C.aw/2,F=CH.FOOT;
 chPerimeter(G,opt,d,{fence:d===0?'fence':'hedge',gaps:{S:[[C.ax-hw,C.ax+hw]],N:[[C.ax-hw,C.ax+hw]],W:[[C.az-hw,C.az+hw]],E:[[C.az-hw,C.az+hw]]}});
 chPaths(G,d,[[C.ax-hw,-L+F,C.ax+hw,-F],[-h+F,C.az-hw,C.ax-hw,C.az+hw],[C.ax+hw,C.az-hw,h-F,C.az+hw]]);
 const K=C.cps.map((cp,i)=>chCompound(G,Object.assign({seed:20870+i},cp),d));
 // between the compounds and the hedge: trees at d=0, weeds and trees at d=1
 if(d===0){for(const cp of C.cps){portTrees(cp.cx-cp.W/2,cp.cz+(cp.cz>-54?cp.Dp/2+1:-cp.Dp/2-3),cp.cx+cp.W/2,cp.cz+(cp.cz>-54?cp.Dp/2+2.5:-cp.Dp/2-1.5),3,D,4,7);}
  portFigures(C.ax,D,-30,4,1.5);portFigures(C.ax,D,-80,3,1.5);portFigures(-25,D,C.az,3,15);portFigures(28,D,C.az,3,15);
  for(const z of [-20,-40,-68,-90])chLamp(C.ax+hw-.5,D,z,d,3.4);}
 if(d===1){portWeeds(-h+2,-L+2,h-2,-2,200,D);portTrees(-h+6,-L+6,h-6,-6,10,D,5,11);portFigures(C.ax,D,C.az,2,3);}
 if(d===3){
  for(let z=-98;z<=-10;z+=9){if(Math.abs(z-C.az)<5)continue;portStall(C.ax+(z%18?1.3:-1.3),D,z,z%18?-Math.PI/2:Math.PI/2);}
  for(let x=-44;x<=46;x+=10){if(Math.abs(x-C.ax)<5)continue;portStall(x,D,C.az+(x%20?1.3:-1.3),x%20?Math.PI:0);}
  portFigures(C.ax,D,-30,10,1.5);portFigures(C.ax,D,-80,10,1.5);portFigures(-25,D,C.az,8,15);portFigures(28,D,C.az,8,15);
  for(const z of [-18,-36,-72,-92])chBulbs([C.ax-hw-.5,D+5,z],[C.ax+hw+.5,D+5,z+5],5,.3);
  // bridges over the lanes between facing upper storeys
  const link=(a,b)=>{let best=null;for(const p of K[a].ups)for(const q of K[b].ups){const dd=Math.hypot(p.x-q.x,p.z-q.z);if(dd>6&&dd<22&&(!best||dd<best.d))best={p,q,d:dd};}
   if(!best)return;const y=Math.min(best.p.y,best.q.y);chBridge([best.p.x,y,best.p.z],[best.q.x,y,best.q.z],1.2,.3);};
  link(0,1);link(2,3);link(0,2);link(1,3);
  portWeeds(-h+4,-L+4,h-4,-4,40,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'chCourt',name:'Container compounds',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],norepair:true,
  stamps:chStampsFor({0:'grass',1:'soil',3:'dry'},CHC.cps.map(c=>[c.cx-c.W/2+2.4,c.cz-c.Dp/2+2.4,c.cx+c.W/2-2.4,c.cz+c.Dp/2-2.4,{0:'sand',1:'soil',3:'sand'}])),build:buildChCourt});
