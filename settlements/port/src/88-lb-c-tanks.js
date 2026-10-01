// ================================================================ SEGMENT: lbTanks (the fuel-tank farm, a land block)
// Five big storage tanks in two bunded compounds sunk 1.2 m below the deck:
// three in the north bund (floating roofs either side of a white domed
// tank), two in the south bund; a pipe rack between the bunds with branches
// to every tank and one down to the pump house; a flare stack with its
// knock-out drum in the east. Seeds 20720-20724.
//   d=0 intact   white shells with cyan bands, roofs riding high, flare lit
//   d=1 ruined   the domed tank burst and burnt (shell torn open, petals
//                peeled out, charred ground), floating roofs sunk and
//                buckled, rust, stagnant water in the bunds, rack spans
//                down, the flare stack snapped and lying across the yard
//   d=3 reclaimed tank houses (window rings, ring balconies, doors, roof
//                gardens), the burst tank a glass-domed greenhouse, the
//                bunds turned to gardens and orchards, a plank walk on the
//                rack, washing lines, the flare a turbine mast with a beacon
const LBT={BN:[-46,46,-102,-58],BS:[-46,6,-50,-14],T:[[-29,-80,12,16,'float'],[0,-80,12,17,'dome'],[29,-80,12,15,'float'],[-32,-32,9.5,14,'float'],[-10,-32,9.5,13,'float']],
 RZ:-54,PH:[24,-23,16,9],FX:40,FZ:-40,FLOOR:-1.2};
MAT.lbPipeY=new THREE.MeshStandardMaterial({color:0x7a5a08,roughness:.5,metalness:.35});
function lbInBund(x,z,m){m=m||0;for(const b of [LBT.BN,LBT.BS])if(x>b[0]-m&&x<b[1]+m&&z>b[2]-m&&z<b[3]+m)return true;return false;}
function lbTanksStamps(o){const s=lbBaseStamps(o),p=o.d===0?'dry':o.d===1?'mud':'grass';
 for(const b of [LBT.BN,LBT.BS])s.push({kind:'dig',x0:b[0],x1:b[1],z0:b[2],z1:b[3],y:PORT.DECK+LBT.FLOOR,paint:p});
 return s;}
function buildLbTanks(scene,gx,gz,d,opt){reseed(20720+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=LB.DECK,h=opt.W/2,L=opt.LAND,F=D+LBT.FLOOR;
 lbGround(G,opt,d,{skip:(x,z)=>lbInBund(x,z,.3)});
 // bund walls: from the bund floor to 1.4 m over the deck, steps over them
 for(const b of [LBT.BN,LBT.BS]){const [x0,x1,z0,z1]=b,yc=(F+D+1.4)/2,hh=D+1.4-F;
  for(const z of [z0,z1])pbBox(G,CONC(d),(x0+x1)/2,yc,z,x1-x0+.5,hh,.5,0,8);
  for(const x of [x0,x1])pbBox(G,CONC(d),x,yc,(z0+z1)/2,.5,hh,z1-z0,0,8);
  kput('pkStair',[(x0+x1)/2+6,D,z1+2.6],qEuler(0,Math.PI,0),[1.2,.7,1],null);
  if(d===1)pbBox(G,MAT.lbMud,(x0+x1)/2,F+.25,(z0+z1)/2,x1-x0-.6,.1,z1-z0-.6,0,8);       // stagnant water and silt
  if(d===1)portWeeds(x0+2,z0+2,x1-2,z1-2,60,F);}
 for(const [x,z,r,H,k] of LBT.T)lbTank(G,x,z,r,H,k,d);
 lbPipeRack(G,d);lbPumpHouse(G,d);lbFlare(G,d);
 if(d===0){portFigures(20,D,-40,5,6);portFigures(-20,D,-54,3,10);
  for(const [x,z] of [[30,-12],[14,-12]]){kput('cgTractor',[x,D,z],null,1,new THREE.Color(0xe8e4dc));}}
 if(d===1){portWeeds(-h+4,-L+4,h-4,-4,200,D);portTrees(10,-50,46,-12,6,D,4,10);portTrees(-44,-56,40,-52,3,D,4,8);}
 if(d>=3){// the bunds become gardens and orchards
  for(const [x,z] of [[-12,-63],[14,-63],[-14,-97],[14,-97],[-40,-62],[40,-97]])portGarden(x,F,z,8,4,d);
  portTrees(-44,-100,-40,-60,4,F,4,8);portTrees(40,-70,44,-62,2,F,4,7);portTrees(-44,-48,-40,-16,3,F,4,8);portTrees(-22,-48,-20,-16,3,F,4,7);
  portGarden(-21,F,-18,6,4,d);portGarden(-21,F,-46,6,4,d);
  portFigures(-10,F,-62,10,14);portFigures(20,D,-36,12,10);portFigures(-20,F,-20,6,8);
  for(let x=14;x<=34;x+=8)portStall(x,D,-12.5,Math.PI);
  portWashLine(-44,-56,-10,-56,D+7,10);portWashLine(10,-56,44,-56,D+7,9);portWeeds(-h+8,-L+8,h-8,-8,40,D);}
 KOFF=[0,0,0];return G;}

// One tank, standing on a ring foundation on the bund floor. kind 'float'
// (open top, a floating roof riding inside) or 'dome' (a shallow white dome).
function lbTank(G,x,z,r,H,kind,d){const F=LB.DECK+LBT.FLOOR,y0=F+.6,top=y0+H,ruin=d>0,sm=SHELL(d),burst=d>=1&&kind==='dome';
 kput('slab',[x,F+.3,z],null,[r+.6,.6,r+.6],new THREE.Color(ruin?0x8a847a:0xd8d4cc));
 const name=kind==='dome'?(d>=3?'Tank greenhouse':burst?'Burst tank':'Domed tank'):(d>=3?'Tank house':'Floating-roof tank');
 REGISTER({name,x,z,r:r+.6,h:(d>=3&&kind==='dome')?11:H+.6,y:F});
 if(burst&&d===1){// torn open on the south side, burnt, petals peeled out, the dome fallen in
  const cut=H*.7,g=lathe({rFn:()=>r,H,cut,jag:4,nu:36,nv:10,seed:5,hole:(u,y)=>{const a=Math.abs(u-.25);return (a<.11&&y>1.5)||fbm(u*9,y*.2,3,2)<.3;}});
  g.translate(x,y0,z);pbAdd(g,MAT.rust,G);
  const gi=lathe({rFn:()=>r-.15,H,cut,jag:4,nu:36,nv:6,seed:5,hole:(u)=>Math.abs(u-.25)<.11});gi.translate(x,y0,z);pbAdd(gi,MAT.lbChar,G);
  for(const s of [-1,1]){const a0=Math.PI/2+s*.62,pet=gridSurface((u,v)=>{const a=a0+s*u*.42,rr2=r+v*v*5*(1-u*.4);return [x+Math.cos(a)*rr2,y0+v*H*.55,z+Math.sin(a)*rr2];},6,6,{uS:3,vS:3});pbAdd(pet,MAT.lbChar,G);}
  const dm=new THREE.Group();dm.position.set(x+2,y0+3,z-1);dm.rotation.set(.22,0,-.15);G.add(dm);
  const th=Math.PI*.22,Rd=r/Math.sin(th),sp=new THREE.SphereGeometry(Rd,28,5,0,TAU,0,th);sp.translate(0,-Rd*Math.cos(th),0);pbAdd(sp,MAT.lbChar,dm);
  // the char on the bund floor, ragged at the edge
  pbAdd(gridSurface((u,v)=>{const a=u*TAU,R=v*(r+9+5*fbm(Math.cos(a)*2,Math.sin(a)*2,7,2));return [x+Math.cos(a)*R,F+.32,z+Math.sin(a)*R+3];},40,4,{}),MAT.lbChar,G);
  rubbleRing(x,F,z+r+2,1,7,24,1.6);
  for(let i=0;i<8;i++){const a=rng()*TAU;kput('stain',[x+Math.cos(a)*(r+.05),y0+cut*.5,z+Math.sin(a)*(r+.05)],qEuler(0,-a+Math.PI/2,0),[rr(3,6),rr(5,9),1],new THREE.Color(0x202020));}
  return;}
 if(burst){// d=3: cut down to a ring, a glass dome on timber ribs, beds inside
  const g=lathe({rFn:()=>r,H,cut:5,jag:.6,nu:36,nv:3,seed:5});g.translate(x,y0,z);pbAdd(g,MAT.rust,G);
  const th=Math.PI*.42,Rd=r/Math.sin(th),sp=new THREE.SphereGeometry(Rd,28,6,0,TAU,0,th);sp.translate(x,y0+5-Rd*Math.cos(th),z);mesh(sp,MAT.glass,G);
  for(let i=0;i<12;i++){const a=i/12*TAU;for(let k=0;k<5;k++){const t0=k/5*th,t1=(k+1)/5*th;
   lbBar(G,MAT.timber,[x+Math.cos(a)*Rd*Math.sin(t0),y0+5-Rd*Math.cos(th)+Rd*Math.cos(t0),z+Math.sin(a)*Rd*Math.sin(t0)],[x+Math.cos(a)*Rd*Math.sin(t1),y0+5-Rd*Math.cos(th)+Rd*Math.cos(t1),z+Math.sin(a)*Rd*Math.sin(t1)],.18,.18);}}
  portGarden(x,y0,z,r*1.3,r*1.3,d);for(let i=0;i<4;i++)kput('dot',[x+rr(-4,4),y0+7,z+rr(-4,4)],null,[.5,.3,.5],WARM);
  kput('pkDoor',[x,y0+1.2,z+r+.05],null,[2.2,2.4,1],new THREE.Color(0x5a3a28));return;}
 const hf=d===1?holeFn(.5,x*.13+z,null,1):null;
 const g=hf?lathe({rFn:()=>r,H,nu:36,nv:8,hole:(u,y)=>y>H*.6&&hf(u,y)}):lbTube(r,H,36);g.translate(x,y0,z);pbAdd(g,sm,G);
 // wind girder, top angle, the painted band, the spiral stair round the shell
 kput(ruin?'ringR':'ringW',[x,top-1.3,z],qEuler(Math.PI/2,0,0),[r+.5,r+.5,3],ruin?new THREE.Color(0x8a5a3a):null);
 if(d===0){for(let i=0;i<24;i++){const a=i/24*TAU;kput('strip',[x+Math.cos(a)*(r+.06),y0+H*.42,z+Math.sin(a)*(r+.06)],qEuler(0,-a+Math.PI/2,0),[r*TAU/24,2.2,1],CYAN);}}
 const a0=Math.PI*.75,n=Math.round(H/.4);
 for(let i=0;i<n;i++){const a=a0+i/n*1.4,y=y0+(i+1)*H/n;if(d===1&&i>n*.55&&rng()<.5)continue;
  kput('plank',[x+Math.cos(a)*(r+.6),y,z+Math.sin(a)*(r+.6)],qEuler(0,-a,0),[1.1,.08,.36],ruin?new THREE.Color(0x6a4a3a):new THREE.Color(0x9a9a98));
  if(i%4===0)kput('postR',[x+Math.cos(a)*(r+1.15),y+.55,z+Math.sin(a)*(r+1.15)],null,[.04,1.1,.04],null);}
 if(kind==='dome'){const th=Math.PI*.2,Rd=r/Math.sin(th),sp=new THREE.SphereGeometry(Rd,32,5,0,TAU,0,th);sp.translate(x,top-Rd*Math.cos(th),z);pbAdd(sp,MAT.lbWhite,G);
  if(d===0)kput('ringW',[x,top+Rd*(1-Math.cos(th))-.2,z],qEuler(Math.PI/2,0,0),[1.5,1.5,1.5],null);}
 else{// the floating roof: high when full (d=0); sunk and tilted (d=1); a garden deck at the top (d=3)
  const yr=d===0?y0+H*rr(.55,.85):d===1?y0+rr(1,4):top-1.4;
  const rf=lbDisc(r-.3,0,36);if(d===1){rf.rotateX(rr(.06,.12));rf.rotateZ(rr(-.08,.08));}rf.translate(x,yr,z);pbAdd(rf,ruin?MAT.rust:MAT.pkSteel,G);
  kput('ringR',[x,yr+.2,z],qEuler(Math.PI/2,0,0),[r-.6,r-.6,4],ruin?new THREE.Color(0x6a4a3a):new THREE.Color(0x707070));
  if(d!==3)lbBar(G,MAT.pkSteel,[x+r-.4,top,z],[x+r*.3,yr+.3,z],.5,.12);
  if(d===1){pbBox(G,MAT.lbMud,x,yr+.25,z,r*.9,.06,r*.9,0,8);}}
 if(d===1)for(let i=0;i<10;i++){const a=rng()*TAU;kput('stain',[x+Math.cos(a)*(r+.05),top-rr(3,7),z+Math.sin(a)*(r+.05)],qEuler(0,-a+Math.PI/2,0),[rr(1.5,3),rr(4,9),1],null);}
 if(d>=3){// the tank house: window rings, ring balconies, doors, a roof garden
  for(const y of [3,6.5,10])for(let i=0;i<14;i++){const a=i/14*TAU+y;kput(rng()<.55?'dot':'cellD',[x+Math.cos(a)*(r+.04),y0+y,z+Math.sin(a)*(r+.04)],qEuler(0,-a+Math.PI/2,0),[1.1,1.3,.3],WARM);}
  for(const y of [5,8.5]){const nb=Math.round(r*TAU/1.9);for(let i=0;i<nb;i++){const a=i/nb*TAU;if(Math.cos(a-a0)>.8)continue;
   kput('plank',[x+Math.cos(a)*(r+.9),y0+y,z+Math.sin(a)*(r+.9)],qEuler(0,-a,0),[1.9,.15,1.7],CG.TIMBER);
   if(i%2===0)kput('pkGuard',[x+Math.cos(a)*(r+1.7),y0+y+.08,z+Math.sin(a)*(r+1.7)],qEuler(0,-a+Math.PI/2,0),[.62,1,1],null);}}
  for(const a of [Math.PI/2,Math.PI*1.6]){kput('pkDoor',[x+Math.cos(a)*(r+.06),y0+1.1,z+Math.sin(a)*(r+.06)],qEuler(0,-a+Math.PI/2,0),[1.1,2.2,1],new THREE.Color().setHSL(rng(),.35,.3));
   kput('pkAwn',[x+Math.cos(a)*(r+1),y0+2.5,z+Math.sin(a)*(r+1)],qEuler(0,-a+Math.PI/2,0).multiply(qEuler(-.22,0,0)),[2.6,1,1.8],new THREE.Color().setHSL(rng(),.5,.55));}
  portGarden(x,top-1.2,z,r*1.1,r*1.1,d);VEG.tree(x+rr(-2,2),top-1.2,z+rr(-2,2),0,rr(4,6));
  kput('pkDish',[x+r*.6,top,z-r*.5],qEuler(0,rng()*TAU,0),1.6,null);
  for(let k=0;k<4;k++)kput('pkSolar',[x-r*.5+k*1.8,top+.4,z+r*.55],qEuler(-.45,0,0),1,null);
  for(let i=0;i<5;i++)kput('vine',[x+Math.cos(i*1.3)*(r+.3),top,z+Math.sin(i*1.3)*(r+.3)],null,[1,rr(4,9),1],null);}}

// The pipe rack between the bunds (along x at RZ), branches to every tank,
// a leg south to the pump house.
function lbPipeRack(G,d){const D=LB.DECK,F=D+LBT.FLOOR,zr=LBT.RZ,ruin=d>0,sm=ruin?MAT.rust:MAT.pkPaint,x0=-46,x1=46;
 const down=d===1?new Set([3,4]):new Set();const nb=Math.round((x1-x0)/7);
 for(let i=0;i<=nb;i++){const x=x0+i*(x1-x0)/nb;if(down.has(i)){lbBar(G,sm,[x,D,zr-1.6],[x+rr(2,4),D+.6,zr+3],.35,.35);continue;}
  for(const e of [-1,1])lbBar(G,sm,[x,D,zr+e*1.6],[x,D+6.8,zr+e*1.6],.3,.3);
  for(const y of [4,6.6])lbBar(G,sm,[x,D+y,zr-1.9],[x,D+y,zr+1.9],.3,.3);}
 const mats=[ruin?MAT.pipeRust:MAT.pkPaint,ruin?MAT.pipeRust:MAT.lbPipeY,ruin?MAT.pipeRust:MAT.cgBlue,ruin?MAT.pipeRust:MAT.pipe];
 const xa=x0+3*(x1-x0)/nb,xb=x0+4*(x1-x0)/nb;
 [[4.4,-1,.4],[4.4,0,.3],[4.4,1,.45],[7,-.6,.3],[7,.6,.35]].forEach(([y,o,r],j)=>{const m=mats[j%4];
  const run=(a,b,yy)=>{const g=new THREE.CylinderGeometry(r,r,b-a,8,1,true);g.rotateZ(Math.PI/2);g.translate((a+b)/2,D+yy,zr+o);pbAdd(g,m,G);};
  if(d===1){run(x0,xa-1,y);run(xb+1,x1,y);if(j<2)lbBar(G,m,[xa-1,D+y,zr+o],[xa+3,D+.4,zr+o+2],r*1.8,r*1.8);}else run(x0,x1,y);});
 // branches: from the rack down over the bund wall to each tank
 for(const [x,z,r] of LBT.T){const zt=z>zr?z-r:z+r,s=Math.sign(zt-zr);
  lbBar(G,mats[0],[x,D+4.4,zr+s*1.6],[x,D+.5,zr+s*3],.45,.45);lbBar(G,mats[0],[x,D+.5,zr+s*3],[x,F+1,zt],.45,.45);}
 lbBar(G,mats[1],[12,D+4.4,zr+1.6],[12,D+4.4,LBT.PH[1]-4.5],.4,.4);
 for(let z=zr+6;z<LBT.PH[1]-5;z+=7)lbBar(G,sm,[12,D,z],[12,D+4.2,z],.25,.25);
 if(d>=3){// a plank walk along the top: a raised street
  for(let x=x0;x<x1;x+=4)kput('plank',[x+2,D+7,zr],null,[4,.12,3.4],null);
  for(let x=x0+3;x<x1;x+=7)kput('pkGuard',[x,D+7.06,zr+1.7],null,[1.4,1,1],null);
  for(let i=0;i<14;i++)kput('vine',[rr(x0,x1),D+6.8,zr+rr(-1.8,1.8)],null,[1,rr(2,5),1],null);
  kput('pkStair',[x0+3,D,zr+3],qEuler(0,Math.PI,0),[1.1,3.5,1],null);portFigures(0,D+7.1,zr,6,30);}
 REGISTER({name:'Pipe rack',x:-24,z:zr,r:4,h:8,y:D});REGISTER({name:'Pipe rack',x:24,z:zr,r:4,h:8,y:D});}

// The pump house: a white two-bay building with a pump manifold beside it.
function lbPumpHouse(G,d){const D=LB.DECK,[x,z,w,dp]=LBT.PH,ruin=d>0,wm=d===1?MAT.concreteR:d>=3?MAT.rust:MAT.lbWhite,hh=6;
 for(const e of [-1,1]){pbBox(G,wm,x,D+hh/2,z+e*dp/2,w,hh,.35,0,8);pbBox(G,wm,x+e*w/2,D+hh/2,z,.35,hh,dp,0,8);}
 if(d!==1)pbBox(G,wm,x,D+hh+.2,z,w+.6,.4,dp+.6,0,8);else pbBox(G,wm,x-w/4,D+hh+.2,z,w/2,.4,dp+.6,0,8);
 for(let i=0;i<5;i++)kput(d===0?'pane':'paneD',[x-w/2+2+i*3,D+4.4,z+dp/2+.2],null,[2,1.2,1],null);
 kput('pkDoor',[x+w/2-3,D+2,z+dp/2+.2],null,[3,4,1],new THREE.Color(d===1?0x5a3a2a:0x3a5070));
 if(d===0)kput('strip',[x,D+hh-.3,z+dp/2+.2],null,[w,1,1],CYAN);
 for(let i=0;i<4;i++){const px=x-w/2+2+i*3.6;kput('pkCol',[px,D,z-dp/2-2.4],null,[.7,1.4,.7],new THREE.Color(ruin?0x7a4a32:0x2f5f8a));}
 lbBar(G,MAT.pipe,[x-w/2,D+1.8,z-dp/2-2.4],[x+w/2,D+1.8,z-dp/2-2.4],.5,.5);
 if(d===1){portRubble(x+w/4,D,z,3,10);VEG.tree(x+w/4,D,z,0,8);}
 if(d>=3){portStall(x-4,D,z+dp/2+3,0);portStall(x+2,D,z+dp/2+3,0);kput('pkSolar',[x,D+hh+.8,z],qEuler(-.4,0,0),[3,1,2],null);
  for(let i=0;i<4;i++)kput('dot',[x-w/2+2+i*3,D+4.4,z+dp/2+.25],null,[1.6,1,.3],WARM);}
 REGISTER({name:d>=3?'Workshop':'Pump house',x,z,r:Math.max(w,dp)/2,h:hh+1,y:D});}

// The flare stack and its knock-out drum. d=1 snapped and lying west; d=3
// cut down, a turbine on top, a beacon and a dish.
function lbFlare(G,d){const D=LB.DECK,x=LBT.FX,z=LBT.FZ,ruin=d>0,H=d===0?44:d===1?19:30,sm=ruin?MAT.rust:MAT.pkPaint;
 const g=new THREE.CylinderGeometry(.75,1,H,12);g.translate(x,D+H/2,z);pbAdd(g,sm,G);
 for(let y=6;y<H;y+=8)kput(ruin?'ringR':'ringW',[x,D+y,z],qEuler(Math.PI/2,0,0),[1.3,1.3,2],null);
 if(d!==1)for(let i=0;i<3;i++){const a=i/3*TAU+.4,ax=x+Math.cos(a)*5.5,az=z+Math.sin(a)*5.5;const L=Math.hypot(5.5,H*.7);
  kput('pkLine',[(x+ax)/2,D+H*.35,(z+az)/2],qEuler(0,-a,Math.atan2(H*.7,5.5)*-1),[L,1,1],null);kput('boxC',[ax,D+.3,az],null,[.8,.6,.8],null);}
 if(d===0){firePit('lb',x,D+H,z,1.4);kput('dot',[x,D+H-3,z+1],null,[.5,.5,.5],CG.RED);}
 if(d===1){const gl=new THREE.CylinderGeometry(.75,.8,24,12);gl.rotateZ(Math.PI/2-.05);gl.rotateY(.2);gl.translate(x-14,D+1,z+2.5);pbAdd(gl,MAT.rust,G);
  REGISTER({name:'Fallen flare stack',x:x-14,z:z+2.5,r:9,h:3,y:D});}
 if(d>=3){kput('cgTurbine',[x,D+H,z],qEuler(0,.6,0),1,null);firePit('lb',x+1,D+H-2,z,.6);kput('plank',[x,D+H-2.2,z],null,[3,.2,3],null);
  kput('pkDish',[x-1,D+H-2.1,z-1],qEuler(0,2,0),1.4,null);}
 // the knock-out drum
 const kd=new THREE.CylinderGeometry(1.6,1.6,8,14);kd.rotateZ(Math.PI/2);kd.translate(x-4,D+2.2,z+8);pbAdd(kd,sm,G);
 for(const e of [-3,3])kput('boxC',[x-4+e,D+.3,z+8],null,[1,.6,2.6],null);
 REGISTER({name:d===1?'Broken flare stack':'Flare stack',x,z,r:2,h:H,y:D});REGISTER({name:'Knock-out drum',x:x-4,z:z+8,r:4,h:4,y:D});}
PORT_SEG({key:'lbTanks',name:'Fuel-tank farm (land block)',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],stamps:lbTanksStamps,build:buildLbTanks});
