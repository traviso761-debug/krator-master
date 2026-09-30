// ================================================================ SEGMENT: cgStore (warehouses and storage)
// 110 m of storage quay: a long sawtooth-roofed warehouse (white panelled,
// blue north-light glazing facing the land) opening onto a covered loading
// bay - a white wave-shell canopy on columns out to the quay edge; behind
// it a hall of four barrel vaults; to the east a battery of six board-formed
// silos under a head gallery with an elevator tower, two domed tanks, and a
// conveyor gallery on trestles down to a ship loader at the quay. Seeds
// 20200-20204. Uses the cg kit in 83-cg-crane.js.
//   d=0 intact   glazing lit cyan-blue, doors shut, a bulk barge at the loader
//   d=1 ruined   sawtooth teeth fallen in, a vault collapsed, the others
//                holed, a silo broken off and the head gallery split, the
//                conveyor's middle span down, the loader boom drooping into
//                the water, two canopy bays fallen, trees in the halls
//   d=3 reclaimed covered markets in the halls and under the canopy, silo
//                houses (windows, ring balconies, stairs), container houses
//                on the head gallery, the conveyor a lit covered bridge, a
//                house barge
const CGS={LAND:110,SEA:40,A:[-46,14,-68,-34],B:[-46,10,-101,-76],CAN:[-46,14,-33.8,-4],SIL:{x:[24.5,33.1,41.7],z:[-70,-78.6],r:4.2,H:30},CX:33,LZ:-8};
function cgStoreStamps(o){const d=o.d,h=o.W/2,k=o.W/110;
 const s=[{kind:'flat',x0:-h,z0:-CGS.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:CGS.SEA,y:d===1?-6:-12,soft:26}];
 if(d===1)s.push({kind:'fill',poly:[[-40,10],[0,7],[40,14],[36,30],[-6,34],[-44,26]].map(p=>[p[0]*k,p[1]]),y:-1.2,soft:12,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:CGS.LAND,SEA:CGS.SEA}));}
// a cylinder wall with world-scaled UVs (open), from y0, height H
function cgTube(r,H,seg){const g=new THREE.CylinderGeometry(r,r,H,seg||24,1,true);const uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*r*TAU/8,uv.getY(i)*H/8);return g.translate(0,H/2,0);}
function buildCgStore(scene,gx,gz,d,opt){reseed(20200+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,k=opt.W/110;
 portPaving(G,-h,-CGS.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d,{ladders:40,bollards:20});
 portSideClose(G,opt.nb,d,{z0:-CGS.LAND,z1:0});
 const sc=a=>[a[0]*k,a[1]*k,a[2],a[3]];
 const A=sc(CGS.A),B=sc(CGS.B),C=sc(CGS.CAN);
 cgSawtooth(G,A[0],A[1],A[2],A[3],9,d);
 cgVaultHall(G,B[0],B[1],B[2],B[3],4,7,5,d);
 cgCanopy(G,C[0],C[1],C[2],C[3],d);
 cgSiloWorks(G,d,k);
 // the berth: a bulk barge under the loader spout (a registered vessel if one fits)
 const vk=portVesselFor(opt,0),V=vk?PORT_REG.vessel[vk]:null;
 if(V&&V.length<=opt.W-16&&V.beam<=30)portPlaceVessel(G,vk,0,3+V.beam/2,Math.PI/2,d);
 else cgBarge(G,6*k,11.5,70*k,15,d,{bulk:true,draft:3.5,free:2.6});
 for(const x of [22*k,46*k])portLamp(x,D,-3.5,0,d);
 // ---- life and ruin
 if(d===0){
  for(let i=0;i<4;i++){const x=rr(C[0]+6,C[1]-6),z=rr(-26,-12);kput('cgTractor',[x,D,z],qEuler(0,rng()<.5?0:Math.PI,0),1,new THREE.Color(0xe8e4dc));kput('cgTyres',[x,D,z],null,1,null);
   portContainer(x+.6,D+1.5,z,0,true,0);}
  for(let i=0;i<10;i++){const x=rr(C[0]+3,C[1]-3),z=rr(-32,-28);kput('plank',[x,D+.6,z],qEuler(0,rr(-.1,.1),0),[1.2,1.2,1],new THREE.Color().setHSL(.09,.3,rr(.4,.6)));}
  portFigures(-16*k,D,-18,14,26);portFigures(30*k,D,-40,5,10);portBuoy(-40*k,30);}
 if(d===1){
  portWeeds(-h+4,-CGS.LAND+3,h-4,-3,220,D);
  portTrees(A[0]+4,A[2]+4,A[1]-4,A[3]-4,6,D,6,12);portTrees(B[0]+16,B[2]+4,B[0]+26,B[3]-4,4,D,6,13);
  portTrees(-h+6,-106,h-6,-103,4,D,4,8);portRubble(A[0]+20,D,A[2]+14,6,16);portRubble(B[0]+20,D,(B[2]+B[3])/2,8,26);
  portContainer(-30*k,-1.4,14,.4,true,1,null,[.3,.2]);}
 if(d>=3){
  for(let x=C[0]+5;x<C[1]-3;x+=8)for(const z of [-26,-12])if(rng()<.85)portStall(x+rr(-1,1),D,z+rr(-1,1),rng()<.5?0:Math.PI);
  for(let i=0;i<12;i++)kput('pkCloth',[rr(C[0]+2,C[1]-2),D+9.6,rr(-30,-8)],qEuler(0,rng()*TAU,0),[rr(1.5,3),rr(1.2,2.6),1],new THREE.Color().setHSL(rng(),.55,.6));
  portGarden(30*k,D,-50,12,6,d);portGarden(-20*k,D,-72,20,5,d);
  for(const L of wall.ladders){portSkiff(L[0]+rr(-4,4),L[1]+2.6,Math.PI/2+rr(-.15,.15));}
  for(let i=0;i<5;i++)portSkiff(rr(-h+10,h-10),rr(22,34),rng()*TAU);
  portWashLine(C[1]+3,-6,C[1]+12,-6,8,6);
  portFigures(-16*k,D,-18,34,26);portFigures(-18*k,D,-51,16,20);portFigures(-18*k,D,-88,12,18);portWeeds(-h+5,-CGS.LAND+3,h-5,-3,50,D);}
 KOFF=[0,0,0];return G;}

// ---- the sawtooth warehouse: walls, north-light teeth rising toward +z's
// neighbour... each tooth: glazing faces -z (the land), slope falls toward +z.
// Front (z1) has four big doors onto the loading bay.
function cgSawtooth(G,x0,x1,z0,z1,h,d){const D=PORT.DECK,W=x1-x0,Dp=z1-z0,nT=4,P=Dp/nT,R=3.6,wm=SHELL(d),ruin=d>0;
 // end walls with the sawtooth profile (extruded outline, 0.4 thick)
 const sh=new THREE.Shape();sh.moveTo(z0,0);sh.lineTo(z1,0);sh.lineTo(z1,h);
 for(let i=nT-1;i>=0;i--){const za=z0+i*P;sh.lineTo(za,h+R);if(i>0)sh.lineTo(za,h);}
 sh.lineTo(z0,0);
 for(const [xe,off] of [[x0,.4],[x1,0]]){const g=cgUV(new THREE.ExtrudeGeometry(sh,{depth:.4,bevelEnabled:false}),1/8);g.rotateY(-Math.PI/2);g.translate(xe+off,D,0);pbAdd(g,wm,G);}
 // back wall and front wall (four door openings 7 x 6)
 cgBx(G,wm,(x0+x1)/2,D+h/2,z0+.2,W,h,.4);
 const nd=4,dw=7,dh=6,dx=W/nd;let xs=x0;
 for(let i=0;i<nd;i++){const xc=x0+(i+.5)*dx;cgBx(G,wm,(xs+xc-dw/2)/2,D+h/2,z1-.2,xc-dw/2-xs,h,.4);cgBx(G,wm,xc,D+dh+(h-dh)/2,z1-.2,dw,h-dh,.4);xs=xc+dw/2;
  if(d===0){kput('pkDoor',[xc,D+dh/2,z1+.05],null,[dw-.2,dh,1],new THREE.Color(0x3a5070));kput('strip',[xc,D+dh+.5,z1+.1],null,[dw,1,1],CYAN);}
  else if(d===1&&rng()<.6)kput('pkDoor',[xc+rr(-1,1),D+.3,z1+3.3],qEuler(-Math.PI/2*.96,rr(-.2,.2),0),[dw-.2,dh,1],new THREE.Color(0x5a3a2a));
  else if(d===1)kput('pkDoor',[xc,D+dh/2,z1+.05],qEuler(0,0,rr(-.05,.05)),[dw-.2,dh,1],new THREE.Color(0x5a3a2a));
  else kput('dot',[xc,D+dh-.6,z1+.3],null,[.6,.4,.3],WARM);}
 cgBx(G,wm,(xs+x1)/2,D+h/2,z1-.2,x1-xs,h,.4);
 // the roof teeth: sloped sheets, glazing, valley gutters, columns inside
 const lost=d===1?new Set([1,2].filter(()=>rng()<.8)):new Set();
 for(let i=0;i<nT;i++){const za=z0+i*P,sd=rr(0,99);
  if(!lost.has(i)){const hf=holeFn(d,sd,null,1.3);
   pbAdd(gridSurface((u,v)=>[x0+u*W,D+h+R-v*R+.02,za+v*P],Math.max(4,Math.round(W/6)),3,{uS:W/8,vS:P/8,hole:hf?(u,v)=>hf(u*W/30+i,v*60+i*9):null}),wm,G);
   if(d===0)cgBx(G,MAT.winIntact,(x0+x1)/2,D+h+R/2,za+.1,W-.8,R,.2);
   else for(let x=x0+3;x<x1-1;x+=3)kput('postR',[x,D+h+R/2,za+.1],null,[.06,R,.06],null);}
  else{// fallen in: the sheet lies broken on the floor, its glazing line bare
   const xc=x0+W*rr(.3,.7);pbAdd(cgBarGeo([xc,D+.6,za+1],[xc+rr(-3,3),D+h*.55,za+P-.5],W*.45,.15),wm,G);portRubble(x0+W*.6,D,za+P/2,5,10);}
  if(i>0)cgBx(G,ruin?MAT.rust:MAT.pkSteel,(x0+x1)/2,D+h-.3,za,W-.8,.6,.6);
  for(let x=x0+W/5;x<x1-1;x+=W/5)kput('pkCol',[x,D,za+P],null,[.3,h,.3],ruin?new THREE.Color(0x9a8a7a):null);}
 if(d>=1)for(let i=0;i<Math.round(W/8);i++)kput('stain',[rr(x0+1,x1-1),D+h-2.5,z1+.02],null,[rr(1.5,3),rr(3,6),1],null);
 if(d>=3){// market inside: rows of stalls down the aisles
  for(let x=x0+5;x<x1-4;x+=7)for(let z=z0+6;z<z1-4;z+=8)if(rng()<.8)portStall(x+rr(-1,1),D,z,rng()<.5?0:Math.PI);
  for(let x=x0+4;x<x1;x+=6)kput('dot',[x,D+h-1,(z0+z1)/2],null,[.5,.4,.5],WARM);
  const sl=Math.atan2(R,P);for(let i=0;i<nT;i++)for(let x=x0+3;x<x1-2;x+=2.2)if(rng()<.5){const v=rr(.25,.75);
   kput('pkSolar',[x,D+h+R-v*R+.12,z0+i*P+v*P],qEuler(sl,0,0),[1.8,1,1.1],null);}}
 for(let i=0;i<3;i++)for(const f of [.25,.75])REGISTER({name:d>=3?'Warehouse market':'Sawtooth warehouse',x:x0+(i+.5)*W/3,z:z0+f*Dp,r:Math.min(W/6,Dp/4)+1,h:h+R,y:D});}

// ---- the vault hall: n barrel vaults along z side by side, arch-glazed gables
function cgVaultHall(G,x0,x1,z0,z1,n,h,rise,d){const D=PORT.DECK,W=x1-x0,L=z1-z0,s=W/n,wm=SHELL(d),ruin=d>0;
 const down=d===1?1:-1;
 for(const xe of [x0+.2,x1-.2])cgBx(G,wm,xe,D+h/2,(z0+z1)/2,.4,h,L);
 for(const ze of [z0+.2,z1-.2])cgBx(G,wm,(x0+x1)/2,D+h/2,ze,W,h,.4);
 for(let i=0;i<n;i++){const xa=x0+i*s,xc=xa+s/2,sd=rr(0,99);
  if(i!==down){const hf=holeFn(d,sd,null,1.2);
   pbAdd(gridSurface((u,v)=>[xa+u*s,D+h+rise*Math.sin(Math.PI*u),z0+v*L],12,Math.max(3,Math.round(L/5)),{uS:s*1.3/8,vS:L/8,hole:hf?(u,v)=>hf(u*2+i,v*50+i*7):null}),wm,G);
   for(const ze of [z0,z1]){const gl=d===0||(d>=3&&ze===z0);
    pbAdd(gridSurface((u,v)=>[xa+u*s,D+h+v*rise*Math.sin(Math.PI*u),ze],12,1,{uS:s/8,vS:rise/8}),gl?MAT.winIntact:(d===1?MAT.dark:wm),G);}
   // ribs over the vault
   for(let z=z0+4;z<z1-2;z+=6)for(let k=0;k<6;k++){const u0=k/6,u1=(k+1)/6;
    cgBar(G,ruin?MAT.rust:MAT.pkPaint,[xa+u0*s,D+h+rise*Math.sin(Math.PI*u0)+.15,z],[xa+u1*s,D+h+rise*Math.sin(Math.PI*u1)+.15,z],.25,.35);}}
  else{portRubble(xc,D,(z0+z1)/2,s*.4,30);
   for(let k=0;k<3;k++){const zz=z0+3+k*L/3;cgBar(G,wm,[xa+rr(1,3),D+.4,zz],[xa+s-rr(1,3),D+rr(2,5),zz+rr(2,5)],.2,rr(4,7));}}
  kput('pkDoor',[xc,D+2.6,z1+.05],null,[5,5.2,1],d===1?new THREE.Color(0x6a3a2a):d>=3?new THREE.Color(0x8a6a3a):new THREE.Color(0x3a5070));
  if(d===0)kput('strip',[xc,D+h+.3,z1+.1],null,[s-1,1,1],CYAN);
  if(i>0){cgBx(G,ruin?MAT.rust:MAT.pkSteel,xa,D+h,(z0+z1)/2,.6,.5,L);for(let z=z0+5;z<z1-1;z+=8)kput('pkCol',[xa,D,z],null,[.3,h,.3],null);}}
 if(d>=1){mossOnRing((x0+x1)/2,D+h+rise*.8,(z0+z1)/2,W*.3,20,2);
  for(let i=0;i<10;i++)kput('vine',[rr(x0,x1),D+h,z1+.3],null,[1,rr(3,h),1],null);}
 if(d>=3){for(let x=x0+4;x<x1-3;x+=6.5)for(let z=z0+5;z<z1-3;z+=7)if(rng()<.75)portStall(x+rr(-1,1),D,z,rng()<.5?Math.PI/2:-Math.PI/2);
  for(let i=0;i<n;i++)kput('dot',[x0+(i+.5)*s,D+h+rise-1.2,(z0+z1)/2],null,[.6,.4,.6],WARM);}
 for(let i=0;i<2;i++)REGISTER({name:d>=3?'Vault market':'Vault hall',x:x0+(i+.5)*W/2,z:(z0+z1)/2,r:Math.max(W/2,L)/2,h:h+rise,y:D});}

// ---- the loading-bay canopy: a white wave shell (vaults along z) on columns
function cgCanopy(G,x0,x1,z0,z1,d){const D=PORT.DECK,W=x1-x0,n=6,s=W/n,Y=D+11,rise=1.6,ruin=d>0,wm=ruin?MAT.concreteR:MAT.white;
 const lost=d===1?new Set([2,3]):new Set();
 for(let i=0;i<n;i++){const xa=x0+i*s;
  if(lost.has(i)){const g=cgBarGeo([xa+s*.5,Y-.2,z0+rr(2,5)],[xa+s*.5+rr(-2,2),D+.8,z1-rr(2,6)],s*.9,.4);pbAdd(g,wm,G);continue;}
  pbAdd(gridSurface((u,v)=>[xa+u*s,Y+rise*Math.sin(Math.PI*u),z0+v*(z1-z0)],10,4,{uS:s/8,vS:(z1-z0)/8}),wm,G);
  // edge beams along the fronts of each shell
  for(const ze of [z0,z1])cgBar(G,wm,[xa,Y,ze],[xa+s,Y,ze],.5,.5);}
 for(let i=0;i<=n;i++){const x=x0+i*s;const adj=lost.has(i-1)&&lost.has(i);
  cgBx(G,wm,x,Y-.35,(z0+z1)/2,.7,.9,z1-z0);
  for(const z of [z0+2,z1-2]){if(adj&&z>z0+3)continue;const hc=adj?rr(3,6):11;kput('pkCol',[x,D,z],null,[.45,hc,.45],ruin?new THREE.Color(0x9a8a7a):null);}}
 if(d===0)kput('strip',[(x0+x1)/2,Y-.4,z1+.3],null,[W,1,1],CYAN);
 if(d!==1)for(let i=0;i<n;i++)kput('dot',[x0+(i+.5)*s,Y+.2,(z0+z1)/2],null,[.8,.2,.8],d===0?CG.FLOOD:WARM);
 for(let i=0;i<3;i++)REGISTER({name:d>=3?'Canopy market':'Loading-bay canopy',x:x0+(i+.5)*W/3,z:(z0+z1)/2,r:W/6-.5,h:14,y:D});}

// ---- silos, head gallery, elevator tower, tanks, conveyor gallery, ship loader
function cgSiloWorks(G,d,k){const D=PORT.DECK,S=CGS.SIL,r=S.r,H=S.H,ruin=d>0,cm=CONC(d),wm=SHELL(d);
 const xs=S.x.map(v=>v*k),zc=(S.z[0]+S.z[1])/2,broke=d===1?4:-1;
 let i=0;
 for(const z of S.z)for(const x of xs){const id=i++;
  if(id===broke){const g=lathe({rFn:()=>r,H,cut:H*.38,jag:3.5,nu:24,nv:6,seed:7});g.translate(x,D,z);pbAdd(g,cm,G);
   rubbleRing(x,D,z,r+.2,r+7,34,2.2);
   for(let k2=0;k2<3;k2++)cgBar(G,cm,[x+rr(-2,2),D+.5,z+rr(3,6)],[x+rr(-4,4),D+rr(1,3),z+rr(8,13)],rr(2,3.5),.4);continue;}
  const hf=d===1?holeFn(d,id*3.1,null,.9):null;
  const g=hf?lathe({rFn:()=>r,H,nu:24,nv:6,hole:(u,y)=>y>H*.55&&hf(u,y)}):cgTube(r,H,24);g.translate(x,D,z);pbAdd(g,cm,G);
  const cap=new THREE.CircleGeometry(r,24);cap.rotateX(-Math.PI/2);cap.translate(x,D+H,z);pbAdd(cap,cm,G);
  if(d>=1)for(let s=0;s<3;s++){const a=rng()*TAU;kput('stain',[x+Math.cos(a)*(r+.05),D+H-6,z+Math.sin(a)*(r+.05)],qEuler(0,-a+Math.PI/2,0),[rr(1.5,3),rr(6,14),1],null);}
  if(d>=3&&(id===0||id===1||id===3))cgSiloHouse(x,z,r,H,d);}
 // head gallery on top (split over the broken silo at d=1), the elevator tower at its west end
 const gx0=xs[0]-r-1.5,gx1=xs[2]+r;
 if(d===1){cgBx(G,wm,(gx0+xs[1]-1)/2,D+H+2.5,zc,xs[1]-1-gx0,5,6);cgBx(G,wm,(xs[1]+6+gx1)/2,D+H+2.5,zc,gx1-xs[1]-6,5,6);
  cgBar(G,wm,[xs[1]-1,D+H+2,zc],[xs[1]+3,D+H-12,S.z[1]+3],5,6);}
 else cgBx(G,wm,(gx0+gx1)/2,D+H+2.5,zc,gx1-gx0,5,6);
 cgBx(G,wm,(gx0+gx1)/2,D+H+5.2,zc,gx1-gx0+.6,.4,6.6);
 if(d===0)for(const s of [-1,1])kput('strip',[(gx0+gx1)/2,D+H+3.8,zc+s*3.05],null,[gx1-gx0-1,1,1],CYAN);
 for(const s of [-1,1])for(let x=gx0+2;x<gx1-1;x+=3)kput(d>=3&&rng()<.5?'dot':'cellD',[x,D+H+2.6,zc+s*3.04],null,[1.4,1,.3],d>=3?WARM:null);
 const tx=xs[0]-r-3.6;cgBx(G,cm,tx,D+(H+13)/2,zc,6,H+13,6);cgBx(G,wm,tx,D+H+13.4,zc,6.8,.8,6.8);
 for(let y=6;y<H+10;y+=4)kput(d===0?'pane':'paneD',[tx+3.02,D+y,zc],qEuler(0,Math.PI/2,0),[1.4,2,1],null);
 REGISTER({name:'Silo battery',x:xs[1],z:S.z[0],r:14,h:H+6,y:D});REGISTER({name:'Silo battery',x:xs[1],z:S.z[1],r:14,h:H+6,y:D});
 REGISTER({name:'Elevator tower',x:tx,z:zc,r:4.5,h:H+14,y:D});
 // two domed tanks behind
 for(const [x,z] of [[26*k,-94],[40*k,-94]]){const rt=5.4,ht=9;pbAdd(cgTube(rt,ht,24).translate(x,D,z),wm,G);
  const th=Math.PI*.3,Rd=rt/Math.sin(th),dm=new THREE.SphereGeometry(Rd,24,6,0,TAU,0,th);dm.translate(0,-Rd*Math.cos(th),0);dm.translate(x,D+ht,z);pbAdd(dm,wm,G);
  if(d===0){kput('ringW',[x,D+ht*.55,z],qEuler(Math.PI/2,0,0),[rt+.05,rt+.05,rt+.05],null);}
  if(d>=3&&x>30*k){for(let a=0;a<8;a++){const t=a/8*TAU;kput(rng()<.6?'dot':'cellD',[x+Math.cos(t)*(rt+.05),D+4,z+Math.sin(t)*(rt+.05)],qEuler(0,-t+Math.PI/2,0),[1,1.1,.3],WARM);}
   portGarden(x,D+ht+.9,z,5,5,d);}
  REGISTER({name:d>=3&&x>30*k?'Tank house':'Storage tank',x,z,r:rt+.5,h:ht+3,y:D});}
 // the conveyor gallery: from the head gallery down to the ship loader, on two trestles
 const cx=CGS.CX*k,P0=[cx,D+H+2,S.z[0]+2],P3=[cx,D+22.5,CGS.LZ-2],zT=[-46,-26];
 const at=z=>{const t=(z-P0[2])/(P3[2]-P0[2]);return P0[1]+(P3[1]-P0[1])*t;};
 const spans=[[P0[2],zT[0]],[zT[0],zT[1]],[zT[1],P3[2]]];
 spans.forEach(([za,zb],si)=>{
  if(d===1&&si===1){cgBar(G,wm,[cx+1,at(za)-3,za+2],[cx-1.5,D+1.4,zb-2],2.8,2.6);return;}
  cgBar(G,wm,[cx,at(za),za],[cx,at(zb),zb],2.8,2.6);
  if(d===0)kput('strip',[cx+1.45,(at(za)+at(zb))/2-.3,(za+zb)/2],qEuler(Math.atan2(at(zb)-at(za),zb-za)*-1,Math.PI/2,0),[Math.abs(zb-za),1,1],CYAN);
  if(d>=3)for(let z=za+2;z<zb-1;z+=3)for(const s of [-1,1])kput(rng()<.55?'dot':'cellD',[cx+s*1.42,at(z),z],qEuler(0,Math.PI/2,0),[1.2,.8,.3],WARM);});
 for(const z of zT){const y=at(z)-1.3;for(const a of [[-2,-1.5],[2,-1.5],[-2,1.5],[2,1.5]])cgBar(G,ruin?MAT.rust:MAT.pkPaint,[cx+a[0]*1.3,D,z+a[1]*1.3],[cx+a[0]*.6,y,z+a[1]*.6],.4,.4);
  for(let yy=D+6;yy<y;yy+=7)cgBx(G,ruin?MAT.rust:MAT.pkPaint,cx,yy,z,4.4,.3,3.4);
  REGISTER({name:'Conveyor trestle',x:cx,z,r:4,h:y-D+2,y:D});}
 REGISTER({name:'Conveyor gallery',x:cx,z:(P0[2]+P3[2])/2,r:8,h:14,y:at((P0[2]+P3[2])/2)-7});
 // the ship loader at the quay: a tower, a cab, a boom out over the berth, a spout
 const lz=CGS.LZ;cgBx(G,wm,cx,D+12,lz,4.6,24,4.6);cgBx(G,ruin?MAT.rust:MAT.cgBlue,cx,D+24.6,lz,6,2.2,6);
 for(let y=4;y<23;y+=5)kput(d===0?'pane':'paneD',[cx+2.32,D+y,lz],qEuler(0,Math.PI/2,0),[1.2,2.2,1],null);
 const tip=d===1?[cx+1,D+5,lz+22]:[cx,D+21,lz+23];
 cgBar(G,ruin?MAT.rust:MAT.pkPaint,[cx,D+23,lz+2.3],tip,2,1.6);
 cgBar(G,ruin?MAT.rust:MAT.pkPaint,[cx,D+26,lz],[tip[0],tip[1]+.8,tip[2]-1],.3,.3);
 if(d!==1)kput('pkCol',[tip[0],D+3,tip[2]-.8],null,[.6,tip[1]-D-3,.6],ruin?new THREE.Color(0x8a5a3a):new THREE.Color(0xe8e4dc));
 if(d===0)kput('dot',[tip[0],tip[1]-1.1,tip[2]-.8],null,[.8,.3,.8],CG.FLOOD);
 REGISTER({name:'Ship loader',x:cx,z:lz,r:4,h:27,y:D});REGISTER({name:'Ship loader boom',x:tip[0],z:tip[2]-3,r:5,h:12,y:tip[1]-6});
 // reclaimed: houses and solar on the head gallery, a dish on the tower
 if(d>=3){portContainerHouse(G,xs[0]+2,D+H+5.4,zc,rr(-.05,.05),d,{levels:2,big:false});portContainerHouse(G,xs[2]-2,D+H+5.4,zc,Math.PI+rr(-.05,.05),d,{levels:1,big:false});
  for(let j=0;j<4;j++)kput('pkSolar',[xs[1]-3+j*2,D+H+6,zc],qEuler(-.5,0,0),[1.6,1,1.2],null);
  kput('pkDish',[tx,D+H+13.8,zc],qEuler(0,.8,0),2.4,null);
  portWashLine(gx0,zc+3.4,gx1,zc+3.4,D+H+8,10);}}
// a silo turned house: ring balconies with rails, windows cut round it, a stair
function cgSiloHouse(x,z,r,H,d){
 for(const y of [8,16,24]){const n=18;
  for(let i=0;i<n;i++){const a=i/n*TAU,q=qEuler(0,-a,0);
   kput('plank',[x+Math.cos(a)*(r+.9),PORT.DECK+y,z+Math.sin(a)*(r+.9)],q,[1.9,.15,1.7],CG.TIMBER);
   if(i%2===0)kput('pkGuard',[x+Math.cos(a)*(r+1.7),PORT.DECK+y+.08,z+Math.sin(a)*(r+1.7)],qEuler(0,-a+Math.PI/2,0),[.62,1,1],null);}
  for(let i=0;i<8;i++){const a=i/8*TAU+.2;kput(rng()<.55?'dot':'cellD',[x+Math.cos(a)*(r+.04),PORT.DECK+y+1.6,z+Math.sin(a)*(r+.04)],qEuler(0,-a+Math.PI/2,0),[1,1.3,.3],WARM);}}
 for(let i=0;i<12;i++){const y=i*2;kput('pkStair',[x+(i%2?1:-1)*1.3,PORT.DECK+y,z+r+2.3],qEuler(0,i%2?-Math.PI/2:Math.PI/2,0),[1,1,.9],null);}
 for(let i=0;i<4;i++)kput('vine',[x+rr(-r,r),PORT.DECK+rr(10,24),z+r+.4],null,[1,rr(4,9),1],null);
 REGISTER({name:'Silo house',x,z,r:r+2,h:H,y:PORT.DECK});}
PORT_SEG({key:'cgStore',name:'Warehouses and storage',cls:'seg',W:110,LAND:CGS.LAND,SEA:CGS.SEA,decays:[0,1,3],stamps:cgStoreStamps,build:buildCgStore});
