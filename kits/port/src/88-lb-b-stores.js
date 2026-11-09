// ================================================================ SEGMENT: lbStores (warehouses and silos, a land block)
// The land-only, denser cousin of the cargo agent's cgStore: a 110 x 110
// block of storage behind the quays. West, a sawtooth north-light warehouse
// (cgSawtooth) and behind it a hall of four barrel vaults (cgVaultHall)
// across a service lane; east, a battery of eight board-formed silos in two
// rows under a head gallery with an elevator tower, a conveyor gallery
// running down to a truck loadout bin; in front of them a barrel-vaulted
// store shed; along the front a loading yard with a rail siding, container
// flats, stacks, tractors and pallets. Uses the cg kit (83-cg-*.js, never
// edited) and the lb kit (88-lb-a-authority.js). Seeds 20710-20714.
//   d=0 intact   lit glazing, cyan lines, trucks at the loadout, busy yard
//   d=1 ruined   sawtooth teeth and a vault fallen in, a silo broken off
//                and the head gallery split, the conveyor's middle span down,
//                containers toppled, trees in the yard and the halls
//   d=3 reclaimed markets in the halls (cg), the front silos turned into
//                silo houses with ring balconies, container houses on the
//                head gallery, gardens and a greenhouse in the yard, the
//                loadout a lit lookout, stalls along the siding
const LBS={A:[-44,-6,-60,-32],B:[-44,-6,-100,-76],SX:[12,20.6,29.2,37.8],SZ:[-96,-87.4],SR:4.2,SH:30,SHED:[26,-52,36,17],LX:40,LZ:-70};
function lbStoresStamps(o){return lbBaseStamps(o);}
function buildLbStores(scene,gx,gz,d,opt){reseed(20710+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=LB.DECK,h=opt.W/2,L=opt.LAND;
 lbGround(G,opt,d);
 const A=LBS.A,B=LBS.B;
 cgSawtooth(G,A[0],A[1],A[2],A[3],9,d);
 cgVaultHall(G,B[0],B[1],B[2],B[3],4,7,5,d);
 lbSiloBattery(G,d);
 const S=LBS.SHED;portShed(G,S[0],S[1],S[2],S[3],8,d,{name:d>=3?'Workshop shed':'Store shed'});
 lbStoresYard(G,d);
 // the service lane between the halls and a lane down the middle
 if(d!==1)for(let x=-40;x<=-10;x+=15)portLamp(x,D,-68,0,d);
 if(d===0){portFigures(-26,D,-24,10,16);portFigures(-26,D,-66,5,14);portFigures(24,D,-36,8,14);portFigures(0,D,-80,4,5);}
 if(d===1){portWeeds(-h+4,-L+4,h-4,-4,280,D);portTrees(A[0]+4,A[2]+4,A[1]-4,A[3]-4,5,D,6,12);portTrees(B[0]+14,B[2]+4,B[0]+24,B[3]-4,3,D,6,13);
  portTrees(-44,-30,40,-12,7,D,4,10);portTrees(-4,-100,6,-60,4,D,5,11);portRubble(A[0]+18,D,A[2]+12,6,18);portRubble(B[0]+18,D,(B[2]+B[3])/2,8,24);}
 if(d>=3){portFigures(-26,D,-46,20,14);portFigures(-26,D,-86,12,14);portFigures(0,D,-24,16,30);portFigures(26,D,-40,8,12);
  portWashLine(-44,-66,-10,-66,9,10);portWashLine(4,-64,4,-90,10,8);portWeeds(-h+8,-L+8,h-8,-8,60,D);}
 KOFF=[0,0,0];return G;}

// The silo battery: two rows of four board-formed silos, a head gallery
// over both rows, the elevator tower at the west end, a conveyor gallery
// from the gallery's east end down to a loadout bin over a truck lane.
function lbSiloBattery(G,d){const D=LB.DECK,r=LBS.SR,H=LBS.SH,xs=LBS.SX,zs=LBS.SZ,ruin=d>0,cm=CONC(d),wm=SHELL(d);
 const zc=(zs[0]+zs[1])/2,broke=d===1?5:-1;let i=0;
 for(const z of zs)for(const x of xs){const id=i++;
  if(id===broke){const g=lathe({rFn:()=>r,H,cut:H*.42,jag:3.5,nu:24,nv:6,seed:11});g.translate(x,D,z);pbAdd(g,cm,G);
   rubbleRing(x,D,z,r+.2,r+7,30,2.2);
   for(let k=0;k<3;k++)lbBar(G,cm,[x+rr(-2,2),D+.5,z+rr(2,4)],[x+rr(-5,5),D+rr(1,3),z+rr(8,11)],rr(2,3.5),.4);continue;}
  const hf=d===1?holeFn(d,id*3.7,null,.9):null;
  const g=hf?lathe({rFn:()=>r,H,nu:24,nv:6,hole:(u,y)=>y>H*.5&&hf(u,y)}):cgTube(r,H,24);g.translate(x,D,z);pbAdd(g,cm,G);
  pbAdd(lbDisc(r,D+H,24).translate(x,0,z),cm,G);
  // the hopper cone and the board-formed rings
  if(d===0)for(const y of [8,16,24])kput('ringW',[x,D+y,z],qEuler(Math.PI/2,0,0),[r+.06,r+.06,r+.06],null);
  if(d>=1)for(let s=0;s<3;s++){const a=rng()*TAU;kput('stain',[x+Math.cos(a)*(r+.05),D+H-6,z+Math.sin(a)*(r+.05)],qEuler(0,-a+Math.PI/2,0),[rr(1.5,3),rr(6,14),1],null);}
  if(d>=3&&z===zs[1]&&(x===xs[0]||x===xs[2]))cgSiloHouse(x,z,r,H,d);}
 // head gallery (split over the broken silo at d=1) and roof
 const gx0=xs[0]-r-1.5,gx1=xs[3]+r;
 if(d===1){const xa=xs[1]-r-.5,xb=xs[1]+r+.5;cgBx(G,wm,(gx0+xa)/2,D+H+2.5,zc,xa-gx0,5,7);cgBx(G,wm,(xb+gx1)/2,D+H+2.5,zc,gx1-xb,5,7);
  lbBar(G,wm,[xa,D+H+2,zc],[xs[1]+1,D+H*.42-1,zs[1]+5],5,6);}
 else{cgBx(G,wm,(gx0+gx1)/2,D+H+2.5,zc,gx1-gx0,5,7);cgBx(G,wm,(gx0+gx1)/2,D+H+5.2,zc,gx1-gx0+.6,.4,7.6);}
 if(d===0)for(const s of [-1,1])kput('strip',[(gx0+gx1)/2,D+H+3.8,zc+s*3.55],null,[gx1-gx0-1,1,1],CYAN);
 for(const s of [-1,1])for(let x=gx0+2;x<gx1-1;x+=3)kput(d>=3&&rng()<.5?'dot':'cellD',[x,D+H+2.6,zc+s*3.54],null,[1.4,1,.3],d>=3?WARM:null);
 const tx=xs[0]-r-3.6;cgBx(G,cm,tx,D+(H+13)/2,zc,6,H+13,6);cgBx(G,wm,tx,D+H+13.4,zc,6.8,.8,6.8);
 for(let y=6;y<H+10;y+=4)kput(d===0?'pane':'paneD',[tx,D+y,zc+3.02],null,[1.4,2,1],null);
 if(d===0)kput('dot',[tx,D+H+14.2,zc],null,[.6,.6,.6],CG.RED);
 REGISTER({name:'Silo battery',x:(xs[0]+xs[1])/2,z:zc,r:9.5,h:H+6,y:D});REGISTER({name:'Silo battery',x:(xs[2]+xs[3])/2,z:zc,r:9.5,h:H+6,y:D});
 REGISTER({name:'Elevator tower',x:tx,z:zc,r:4.3,h:H+14,y:D});
 // conveyor gallery: head gallery east end -> loadout bin, on one trestle
 const lx=LBS.LX,lz=LBS.LZ,P0=[lx,D+H+2,zs[1]+2],P1=[lx,D+17,lz-3.5],zT=(P0[2]+P1[2])/2;
 const yAt=z=>P0[1]+(P1[1]-P0[1])*(z-P0[2])/(P1[2]-P0[2]);
 if(d===1){lbBar(G,wm,[lx,yAt(zT+1),zT+1],[lx-1.5,D+1.5,P1[2]-1],2.8,2.6);lbBar(G,wm,P0,[lx,yAt(zT-2),zT-2],2.8,2.6);}
 else{lbBar(G,wm,P0,P1,2.8,2.6);
  if(d===0)kput('strip',[lx+1.45,(P0[1]+P1[1])/2-.4,zT],qEuler(-Math.atan2(P1[1]-P0[1],P1[2]-P0[2]),Math.PI/2,0),[Math.hypot(P1[1]-P0[1],P1[2]-P0[2]),1,1],CYAN);
  if(d>=3)for(let z=P0[2]+2;z<P1[2]-1;z+=3)for(const s of [-1,1])kput(rng()<.55?'dot':'cellD',[lx+s*1.42,yAt(z),z],qEuler(0,Math.PI/2,0),[1.2,.8,.3],WARM);}
 {const y=yAt(zT)-1.4;for(const a of [[-1.6,-1.2],[1.6,-1.2],[-1.6,1.2],[1.6,1.2]])lbBar(G,ruin?MAT.rust:MAT.pkPaint,[lx+a[0]*1.4,D,zT+a[1]*1.4],[lx+a[0]*.6,y,zT+a[1]*.6],.4,.4);
  REGISTER({name:'Conveyor trestle',x:lx,z:zT,r:3.5,h:y-D+3,y:D});}
 // the loadout bin on four legs over the truck lane
 for(const a of [[-3,-3],[3,-3],[-3,3],[3,3]])kput('pkCol',[lx+a[0],D,lz+a[1]],null,[.35,9,.35],ruin?new THREE.Color(0x9a8a7a):null);
 cgBx(G,wm,lx,D+12.5,lz,7,6,7);
 const cone=new THREE.ConeGeometry(3.4,3,4,1,true);cone.rotateY(Math.PI/4);cone.rotateX(Math.PI);cone.translate(lx,D+8,lz);pbAdd(cone,ruin?MAT.rust:MAT.pkSteel,G);
 if(d===0){kput('strip',[lx,D+15.2,lz+3.6],null,[7,1,1],CYAN);kput('dot',[lx,D+9.2,lz],null,[.8,.3,.8],CG.FLOOD);}
 if(d>=3){kput('shantyRoof',[lx,D+16,lz],qEuler(.08,0,0),[8.4,1,8.4],null);for(let k=0;k<4;k++)kput('dot',[lx-2.5+k*1.7,D+13,lz+3.55],null,[1,1,.3],WARM);
  lbFlag(lx+3,D+16,lz-3,6,.5,LB_BANNER[1],3,{w:2.6,h:1.6});kput('pkDish',[lx-2.6,D+15.6,lz-2.6],qEuler(0,2.4,0),1.6,null);}
 REGISTER({name:d>=3?'Loadout lookout':'Truck loadout',x:lx,z:lz,r:5,h:17,y:D});
 // two domed tanks between the silos and the shed
 for(const [x,z] of [[10,-72],[22,-72]]){const rt=4.8,ht=8;pbAdd(cgTube(rt,ht,24).translate(x,D,z),wm,G);
  const th=Math.PI*.3,Rd=rt/Math.sin(th),dm=new THREE.SphereGeometry(Rd,24,6,0,TAU,0,th);dm.translate(0,-Rd*Math.cos(th),0);dm.translate(x,D+ht,z);pbAdd(dm,wm,G);
  if(d===0)kput('ringW',[x,D+ht*.55,z],qEuler(Math.PI/2,0,0),[rt+.05,rt+.05,rt+.05],null);
  if(d>=3&&x>15){for(let a=0;a<8;a++){const t=a/8*TAU;kput(rng()<.6?'dot':'cellD',[x+Math.cos(t)*(rt+.05),D+4,z+Math.sin(t)*(rt+.05)],qEuler(0,-t+Math.PI/2,0),[1,1.1,.3],WARM);}
   portGarden(x,D+ht+.9,z,4.6,4.6,d);}
  REGISTER({name:d>=3&&x>15?'Tank house':'Storage tank',x,z,r:rt+.5,h:ht+3,y:D});}
 // reclaimed: houses and solar on the head gallery, a dish on the tower
 if(d>=3){portContainerHouse(G,xs[0]+3,D+H+5.4,zc,rr(-.05,.05),d,{levels:2,big:false});portContainerHouse(G,xs[3]-2,D+H+5.4,zc,Math.PI+rr(-.05,.05),d,{levels:1,big:true});
  for(let j=0;j<5;j++)kput('pkSolar',[xs[1]+j*2,D+H+6,zc],qEuler(-.5,0,0),[1.6,1,1.2],null);
  kput('pkDish',[tx,D+H+13.8,zc],qEuler(0,.8,0),2.4,null);portWashLine(gx0,zc+3.9,gx1,zc+3.9,D+H+8,10);}}

// The loading yard along the front: a rail siding with container flats,
// container stacks, tractors, pallets; d=3 a greenhouse, gardens, stalls.
function lbStoresYard(G,d){const D=LB.DECK,ruin=d>0,zr=-25;
 portRail(-47,47,zr,D,d);
 // a buffer stop at each end
 for(const x of [-46.5,46.5])kput('boxC',[x,D+.6,zr],null,[.8,1.2,2.6],ruin?new THREE.Color(0x8a5a3a):new THREE.Color(0xd8c040));
 // container flats on the siding
 const nf=d===1?3:4;for(let i=0;i<nf;i++){const x=-36+i*16+(d===1?rr(-2,2):0);
  kput('plank',[x,D+1.05,zr],null,[14,.35,2.5],new THREE.Color(0x3a3a3c));
  for(const e of [-5,5])kput('cgBogie',[x+e,D+.14,zr],null,[.6,.6,1.2],null);
  if(!(d===1&&i===1))portContainer(x,D+1.23,zr,d===1&&i===2?.08:0,true,d);}
 if(d===1){portContainer(-20,D+1.2,zr+3.4,.9,true,1,null,[Math.PI/2*.97,.05]);}
 // stacks along the east yard, pallets and tractors
 if(d<3){portContainerStack(30,D,-16,0,3,d===0?3:2,d,{big:true});REGISTER({name:'Container stack',x:30,z:-16,r:7,h:8,y:D});
  portContainerStack(-40,D,-15,Math.PI/2,2,2,d,{big:false});REGISTER({name:'Container stack',x:-40,z:-15,r:4.5,h:6,y:D});}
 for(let i=0;i<14;i++){const x=rr(-30,16),z=rr(-19,-12);if(d===1&&rng()<.4)continue;
  kput('plank',[x,D+.6,z],qEuler(0,rr(-.1,.1),0),[1.2,1.2,1],new THREE.Color().setHSL(.09,.3,rr(.25,.4)));}
 if(d===0)for(const [x,z,y] of [[1.5,-44,Math.PI/2],[24,-36,Math.PI],[LBS.LX,LBS.LZ,Math.PI/2]]){kput('cgTractor',[x,D,z],qEuler(0,y,0),1,new THREE.Color(0xe8e4dc));kput('cgTyres',[x,D,z],qEuler(0,y,0),1,null);
  if(x!==LBS.LX)portContainer(x+.6*Math.cos(y),D+1.5,z,y,true,0);}
 if(d===1){kput('cgTractor',[1.5,D+.2,-42],qEuler(.05,.7,.1),1,new THREE.Color(0x8a5a40));portRubble(12,D,-20,4,10);}
 if(d>=3){// a greenhouse where the stacks stood, gardens, stalls along the siding, container houses
  lbGreenhouse(G,30,-17.5,20,9,d);portGarden(-38,D,-15,14,6,d);portGarden(8,D,-35,12,5,d);
  for(let x=-30;x<=20;x+=8)if(rng()<.8)portStall(x,D,-18.5,Math.PI);
  portContainerHouse(G,1.5,D,-40,Math.PI/2+.05,d,{levels:2});portContainerHouse(G,1.5,D,-55,Math.PI/2-.06,d,{levels:1,big:true});
  for(let i=0;i<3;i++)kput('pkCont20R',[-30+i*14,D+1.23,zr],null,1,new THREE.Color().setHSL(rng(),.3,.3));}}
// A salvage greenhouse: timber frame, glass (the Ancient glass) roof and
// sides, planting beds inside; along x, centre (x,z), w x dp.
function lbGreenhouse(G,x,z,w,dp,d){const D=LB.DECK,rise=2.2,h=2.6;
 const g=gridSurface((u,v)=>{const zz=(v-.5)*dp;return [x+(u-.5)*w,D+h+rise*(1-Math.pow(zz/(dp/2),2)),z+zz];},6,8,{uS:w/4,vS:dp/4});
 mesh(g,MAT.glass,G);
 for(const s of [-1,1]){const sg=new THREE.PlaneGeometry(w,h);sg.translate(x,D+h/2,z+s*dp/2);mesh(sg,MAT.glass,G);}
 for(let i=0;i<=Math.round(w/2.5);i++){const px=x-w/2+i*w/Math.round(w/2.5);
  for(const s of [-1,1])kput('plank',[px,D+h/2,z+s*dp/2],null,[.12,h,.12],null);
  for(let k=0;k<6;k++){const z0=(k/6-.5)*dp,z1=((k+1)/6-.5)*dp,y0=h+rise*(1-Math.pow(z0/(dp/2),2)),y1=h+rise*(1-Math.pow(z1/(dp/2),2));
   lbBar(G,MAT.timber,[px,D+y0,z+z0],[px,D+y1,z+z1],.1,.1);}}
 for(let k=0;k<3;k++){const zz=z+(k-1)*dp/3.2;kput('planter',[x,D+.35,zz],null,[w-2,.7,1.4],null);
  for(let i=0;i<8;i++)kput('leafCard',[x+rr(-w/2+1.5,w/2-1.5),D+1.1,zz+rr(-.4,.4)],qEuler(0,rng()*TAU,0),[rr(.5,.9),rr(.5,.9),rr(.5,.9)],new THREE.Color().setHSL(rr(.2,.34),.55,rr(.4,.6)));}
 for(let i=0;i<4;i++)kput('dot',[x-w/2+2+i*(w-4)/3,D+h+rise-.4,z],null,[.5,.3,.5],WARM);
 for(const e of [-1,1])REGISTER({name:'Greenhouse',x:x+e*w/4,z,r:Math.max(w/4,dp/2),h:h+rise,y:D});}
PORT_SEG({key:'lbStores',name:'Warehouses and silos (land block)',cls:'seg',W:110,LAND:110,SEA:0,place:'land',decays:[0,1,3],stamps:lbStoresStamps,build:buildLbStores});
