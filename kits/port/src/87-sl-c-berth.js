// ================================================================ SEGMENT: slBerth
// A deep-water berth, 110 x 410 m: a finger pier on columns 14 m wide along
// the west side of a berth dredged for a vessel up to ~384 m long, a line of
// mooring dolphins on the east side joined by a catwalk, a portal crane on
// the pier, a white berth office on the apron. The vessel lies bow out,
// starboard side to the pier, held by head, breast, spring and stern lines
// and breast lines to the dolphins. Seeds 20620-20624.
// Vessel: opt.vessel (a key, e.g. 'vsGiant') if it is registered and fits,
// else slCarrier (the berth is drawn round it), else none (buoys only).
//   d=0 intact    white pier fascia, lines taut, cyan lights, the brow rigged
//   d=1 ruined    pier spans and catwalk spans down, a dolphin leaning, the crane
//                 fallen across the pier, lines snapped, the berth silted, the
//                 carrier aground on a sand bar, weeds and trees
//   d=3 reclaimed stair towers from the pier up to the carrier's flight deck,
//                 stalls and houses on the pier, shacks on the dolphins, rafts
const SLB={LAND:50,SEA:410,PX0:-44,PX1:-30,PEND:398,DX:40,DZ:[50,140,230,320],ZS:14};
function slBerthFits(V,W){const hb=V.hullBeam||V.beam,cx=SLB.PX1+3.5+hb/2;
 const st=V.stbd!==undefined?V.stbd:-V.beam/2,po=V.port!==undefined?V.port:V.beam/2;
 return V.length<=SLB.PEND-SLB.ZS-6&&cx+po<=W/2-7&&cx+st>=-W/2+7.5;}
function slBerthVK(o){const W=(o&&o.W)||110;
 for(const k of [o&&o.vessel,o&&o.vesselKey,typeof SL_BERTH_VESSEL!=='undefined'?SL_BERTH_VESSEL:null,'slCarrier']){const V=k&&PORT_REG.vessel[k];if(V&&slBerthFits(V,W))return k;}return null;}
function slBerthStamps(o){const d=o.d,h=o.W/2,vk=slBerthVK(o),V=vk?PORT_REG.vessel[vk]:null;
 const dep=d===1?-9:-Math.max(-PORT.BERTH,(V?V.draft:11)+6);
 const s=[{kind:'flat',x0:-h,z0:-SLB.LAND,x1:h,z1:0,y:PORT.DECK,soft:40,paint:d>=1?'soil':'pave'},
          {kind:'dig',x0:-h,z0:0,x1:h,z1:SLB.SEA,y:dep,soft:30}];
 if(d===1)s.push({kind:'fill',poly:[[-24,30],[20,22],[44,70],[36,190],[6,240],[-18,150]],y:-3,soft:24,paint:'sand'});
 return s.concat(portEdgeStamps(o,{LAND:SLB.LAND,SEA:SLB.SEA}));}

// The portal crane on the pier: legs straddling it, a machinery house, a
// luffing lattice jib reaching over the ship. d=1: fallen across the pier.
function slBerthCrane(G,xc,zc,d){const D=PORT.DECK,st=d>0?'strutR':'strutW',sh=SHELL(d);
 if(d===1){const base=[xc,D+1,zc];
  for(const s of [-1,1])beam(st,[xc+6,D,zc+s*5],[xc+2,D+6,zc+s*4],1.1,1.1,null);
  const g=boxUV(10,7,12,8);g.rotateX(.45);g.rotateZ(-.2);g.translate(xc+1,D+2.6,zc-7);pbAdd(g,sh,G);
  const a=[xc-1,D+2,zc-12],b=[xc-9,-3,zc-46];for(const s of [-1,1])beam(st,[a[0],a[1]+s*1.2,a[2]],[b[0],b[1]+s*1.2,b[2]],.6,.6,null);
  for(let t=0;t<1;t+=.1){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],q=[a[0]+(b[0]-a[0])*(t+.1),a[1]+(b[1]-a[1])*(t+.1),a[2]+(b[2]-a[2])*(t+.1)];
   beam(st,[p[0],p[1]-1.2,p[2]],[q[0],q[1]+1.2,q[2]],.3,.3,null);}
  REGISTER({name:'Fallen portal crane',x:xc+1,z:zc-16,r:7,h:14,y:-4});return;}
 const H0=D+26;
 for(const sx of [-1,1])for(const sz of [-1,1]){beam(st,[xc+sx*6.2,D,zc+sz*5],[xc+sx*5,H0,zc+sz*4],1.2,1.2,null);kput('pkBollard',[xc+sx*6.2,D,zc+sz*5],null,[2.2,.6,2.2],null);}
 for(const sz of [-1,1])beam(st,[xc-5.6,D+13,zc+sz*4.5],[xc+5.6,D+13,zc+sz*4.5],.6,.6,null);
 pbBox(G,sh,xc,H0+1,zc,13,2,11,0,8);
 pbBox(G,sh,xc-1,H0+5.5,zc,12,7,10,0,8);pbBox(G,WIN(d),xc+5.1,H0+6.5,zc,.2,2.2,8.6,0,8);
 pbBox(G,d>0?MAT.rust:MAT.pkConc,xc-7.8,H0+5,zc,4,6,8,0,8);
 const a=[xc+4,H0+5,zc],b=[xc+34,H0+20,zc];
 for(const s of [-1,1])for(const u of [-1,1])beam(st,[a[0],a[1]+u*1,a[2]+s*1.4],[b[0],b[1]+u*.4,b[2]+s*.5],.4,.4,null);
 for(let t=0;t<1;t+=.125){const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]],q=[a[0]+(b[0]-a[0])*(t+.125),a[1]+(b[1]-a[1])*(t+.125),a[2]];
  beam(st,[p[0],p[1]-1,p[2]],[q[0],q[1]+1,q[2]],.2,.2,null);}
 beam(st,[xc-1,H0+9,zc],[xc-1,H0+15,zc],.8,.8,null);
 for(const s of [-1,1])beam('tube',[xc-1,H0+15,zc+s*.3],[b[0],b[1],b[2]],.05,.05,null);
 beam('tube',[b[0],b[1],b[2]],[b[0],H0-6,b[2]],.06,.06,null);kput('boxW',[b[0],H0-6.6,b[2]],null,[1.2,1,1.2],d>0?new THREE.Color(0x8a6a50):new THREE.Color(0xd8c040));
 if(d===0){kput('dot',[b[0],b[1]+.6,b[2]],null,[.5,.5,.5],new THREE.Color(0xff5040));kput('strip',[xc-1,H0+2.1,zc+5.6],null,[12,1,1],CYAN);}
 if(d>=3){slShack(xc-1,H0+9,zc,0,6,6,2.6,{lit:.8});kput('pkCloth',[xc+5.2,H0+8.5,zc],qEuler(0,Math.PI/2,0),[6,9,1],new THREE.Color(0x3a6a9a));
  const n=10;for(let i=0;i<n;i++){const t=(i+.5)/n;kput('pkCloth',[b[0]+(xc-6-b[0])*t,b[1]+(D+2-b[1])*t-2*Math.sin(Math.PI*t),zc],qEuler(0,rr(-.2,.2),0),[.9,1.1,1],new THREE.Color().setHSL(rng(),.6,.55));}
  beam('tube',[b[0],b[1],b[2]],[xc-6,D+2,zc],.04,.04,null);}
 REGISTER({name:'Portal crane',x:xc,z:zc,r:8,h:H0+14-D,y:D});}

// A mooring dolphin: a concrete caisson, a cap, bollards, fenders on its berth face.
function slBerthDolphin(G,x,z,d,lean){const D=PORT.DECK,gy=portH(x,z)-1.5,c=d>0?new THREE.Color().setHSL(.07,.08,rr(.42,.52)):null;
 const q=lean?qEuler(lean[0],0,lean[1]):null,dy=lean?-1.2:0;
 kput('pkCol',[x,gy,z],q,[3.6,D-.5-gy+dy,3.6],c);kput('slab',[x+(lean?lean[1]*-6:0),D-.1+dy,z+(lean?lean[0]*6:0)],q,[4.4,.9,4.4],c||new THREE.Color(0xe8e4dc));
 if(!lean){kput('pkBollard',[x-1.6,D+.35,z-1.2],null,1.2,d>0?new THREE.Color(0x9a6040):null);kput('pkBollard',[x-1.6,D+.35,z+1.2],null,1.2,d>0?new THREE.Color(0x9a6040):null);
  for(const s of [-1,1])kput('pkFender',[x-4.5,D-.6,z+s*1.6],null,[1.2,5,1.2],null);}
 if(d===0)kput('dot',[x+1.8,D+.6,z],null,[.35,.35,.35],CYAN);
 REGISTER({name:'Mooring dolphin',x,z,r:5,h:D+4-gy,y:gy});}

function buildSlBerth(scene,gx,gz,d,opt){reseed(20620+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,P0=SLB.PX0,P1=SLB.PX1,PE=SLB.PEND,pm=(P0+P1)/2;
 // ---- apron, quay wall, sides
 portPaving(G,-h,-SLB.LAND,h,-1.2,d);
 const wall=portQuayWall(G,-h,0,h,0,d,{ladders:30});
 portSideClose(G,opt.nb,d,{z0:-SLB.LAND,z1:0});
 for(let x=-h+14;x<=h-10;x+=30)portLamp(x,D,-5.5,0,d);
 // ---- the finger pier
 const coll=d===1?[7,8,15]:[];
 const pier=portDeckOnPiles(G,P0,0,P1,PE,d,{bay:19.9,colX:14,guard:false,collapse:coll});
 const bayOf=z=>Math.floor(z/(PE/pier.bays)),gone=z=>pier.collapsed.has(bayOf(z));
 for(let z=2.5;z<PE;z+=5){if(gone(z)||(d===1&&rng()<.25))continue;kput('pkGuard',[P0+.3,D,z],qEuler(0,Math.PI/2,0),1,d>0?new THREE.Color(0x8a5a3a):null);}
 const bol=[];for(let z=10;z<PE;z+=20){if(gone(z))continue;bol.push(z);if(d===1&&rng()<.3)continue;kput('pkBollard',[P1-1.4,D,z],qEuler(0,rng()*TAU,0),1,d>0?new THREE.Color(0x9a6040):null);}
 for(let z=6;z<PE;z+=12){if(gone(z)||(d===1&&rng()<.4))continue;kput('pkFender',[P1+.55,D-.5,z],null,[1.1,5,1.1],null);}
 pbBox(G,d>0?MAT.rust:MAT.white,pm,D-.9,PE+.15,P1-P0+.6,2.1,.3,0,8);
 if(!gone(PE-8)){const hz=PE-12;
  pbAdd(new THREE.CylinderGeometry(4.6,4.6,4.2,20).translate(pm,D+2.1,hz),SHELL(d),G);pbAdd(new THREE.CylinderGeometry(4.75,4.75,1.6,20).translate(pm,D+3,hz),WIN(d),G);
  pbAdd(new THREE.CylinderGeometry(5.4,5.4,.5,20).translate(pm,D+4.45,hz),SHELL(d),G);
  kput('pkCol',[pm,D+4.7,hz],null,[.3,9,.3],d>0?new THREE.Color(0xa09080):new THREE.Color(0xf4f2ec));
  kput('dot',[pm,D+14,hz],null,[.8,.8,.8],d===0?CYAN:d>=3?WARM:DEAD);
  REGISTER({name:'Pier-head light house',x:pm,z:hz,r:6,h:18,y:D});}
 for(let z=40;z<PE-20;z+=48){if(gone(z))continue;if(z>180&&z<240)continue;portLamp(P0+1.6,D,z,Math.PI/2,d);}
 for(let z=20;z<PE;z+=40)if(!gone(Math.min(z,PE-12)))REGISTER({name:'Finger pier',x:pm,z:Math.min(z,PE-12),r:8.5,h:10,y:D-8});
 slBerthCrane(G,pm,70,d);
 // ---- the dolphins and their catwalk (piles every ~30 m)
 const X=SLB.DX,DZ=SLB.DZ,lean=d===1?[[0,0],[.1,-.16],[0,0],[-.06,.1]]:null;
 DZ.forEach((z,i)=>slBerthDolphin(G,X,z,d,lean&&(lean[i][0]||lean[i][1])?lean[i]:null));
 const cw=[0].concat(DZ);
 for(let i=0;i<cw.length-1;i++){const za=cw[i]+(i?4.4:0),zb=cw[i+1]-4.4,n=Math.max(1,Math.round((zb-za)/30)),L=(zb-za)/n;
  for(let k=0;k<n;k++){const z0=za+k*L,z1=z0+L,zm=(z0+z1)/2;
   const down=d===1&&(i===2&&k===1||i===3);
   if(down){const g=boxUV(1.8,.3,L,8);g.rotateX(k%2?.5:-.5);g.translate(X+2.2,1.2,zm);pbAdd(g,MAT.rust,G);continue;}
   pbBox(G,d>0?MAT.rust:MAT.pkSteel,X+2.2,D+1.2,zm,1.8,.25,L,0,8);
   for(let zz=z0+2.5;zz<z1;zz+=5)if(!(d===1&&rng()<.3))kput('pkGuard',[X+3.05,D+1.3,zz],qEuler(0,Math.PI/2,0),1,d>0?new THREE.Color(0x8a5a3a):null);
   if(k>0){const gy=portH(X+2.2,z0)-1;kput('pkCol',[X+2.2,gy,z0],null,[.5,D+1.1-gy,.5],d>0?new THREE.Color(0x8a7a6a):null);}}}
 REGISTER({name:'Dolphin catwalk',x:X+2,z:DZ[0]/2,r:4,h:4,y:D-1});
 // ---- the vessel and its lines
 const vk=slBerthVK(opt),V=vk?PORT_REG.vessel[vk]:null;let vx=0,vz=0;
 if(V){const hb=V.hullBeam||V.beam;vx=P1+3.5+hb/2;vz=SLB.ZS+V.length/2;
  portPlaceVessel(G,vk,vx,vz,0,d);
  const my=V.moorY||8,hw=z=>vk==='slCarrier'?slCarHw(z-vz,my):hb/2;
  const bow=vz+V.length/2,stern=vz-V.length/2,pierZ=z=>clamp(z,6,PE-6);
  const lines=[[bow-10,pierZ(bow+30)],[bow-40,pierZ(bow-40)],[bow-55,pierZ(bow-100)],[stern+55,pierZ(stern+100)],[stern+32,pierZ(stern+32)],[stern+10,pierZ(stern-4)]];
  lines.forEach(([sz,pz],li)=>{for(const o of [-1.2,1.2]){const a=[vx-hw(sz)+.2,my,sz+o],b=[P1-1.4,D+.7,pz+o*.8];
   if(d===1){if(rng()<.75){slRope(b,[P1+rr(2,6),-1,pz+rr(-8,8)],.5,.07,SL_ROPE);continue;}slRope(a,b,4,.07,SL_ROPE);continue;}
   if(gone(pz))continue;slRope(a,b,.5,.08,SL_ROPE);}});
  for(const z of DZ){if(z<stern+8||z>bow-8)continue;const lz=z;for(const o of [-1.3,1.3]){const a=[vx+hw(lz)-.2,my,lz+o],b=[X-1.6,D+.9,lz+o*.9];
   if(d===1){if(rng()<.6)slRope(b,[X-rr(4,8),-1,lz+rr(-6,6)],.3,.07,SL_ROPE);continue;}slRope(a,b,.6,.08,SL_ROPE);}}
  // the brow: from the pier up into a hangar opening (carrier) or to the rail
  if(d===0){const gz=vk==='slCarrier'?vz-71:vz-20,top=vk==='slCarrier'?SLC.YM+.35:my+1,xt=vx-(vk==='slCarrier'?slCarHw(-71,SLC.YM)-.6:hw(gz-vz));
   beam('plank',[P0+5,D+.3,gz],[xt,top,gz],1.6,.14,new THREE.Color(0xd8d8d4));
   for(const s of [-.8,.8])beam('tube',[P0+5,D+1.3,gz+s],[xt,top+1,gz+s],.04,.04,null);}
  if(d>=3&&V.deckY!==undefined){
   // stair towers from the pier up to the flight deck, a plank bridge across
   for(const lz of [-120,70]){const z=vz+lz,xe=vx+(vk==='slCarrier'?slCarXS(lz):-(V.beam/2)),y1=V.deckY-.9;
    if(gone(z))continue;const tx=Math.max(P0+2,Math.min(xe-3.1,P1-2));slStairTower(tx,D,z,y1,Math.PI/2,d);
    kput('plank',[(tx+1.9+xe+1.5)/2,y1-.06,z],null,[Math.abs(xe+1.5-(tx+1.9))+.5,.14,2.2],null);
    REGISTER({name:'Stair tower to the flight deck',x:tx,z,r:4,h:y1-D+1,y:D});}}}
 else if(d===0){portBuoy(0,150);portBuoy(0,300);}
 // ---- the apron: berth office, stores, figures
 const ox=22,oz=-30,pl=slPlan(ox,oz,44,18,6,3.2,28).map(p=>[p[0],oz+(p[1]-oz)]);
 pbAdd(slPrism(pl,D,4),SHELL(d),G);pbAdd(slPrism(slPlan(ox,oz,44.2,18.2,6,3.2,28),D+4,2.2),WIN(d),G);
 pbAdd(slPrism(slPlan(ox,oz,46,20,6,3.2,28),D+6.2,.8),SHELL(d),G);
 pbAdd(slPrism(slPlan(ox-4,oz-2,30,12,6,3.2,24),D+7,3.4),SHELL(d),G);pbAdd(slPrism(slPlan(ox-4,oz-2,31.5,13.5,6,3.2,24),D+10.4,.6),SHELL(d),G);
 if(d!==1)for(let i=0;i<6;i++)kput('pkDoor',[ox-12+i*5,D+1.4,oz+9.05],null,[2.2,2.8,1],d===0?new THREE.Color(0x2a4a6a):new THREE.Color(0x6a4a3a));
 REGISTER({name:'Berth office',x:ox-10,z:oz,r:12,h:12,y:D});REGISTER({name:'Berth office',x:ox+10,z:oz,r:12,h:12,y:D});
 if(d<3){portContainerStack(-22,D,-33,0,3,d===0?2:1,d,{big:false});REGISTER({name:'Ship stores',x:-22,z:-33,r:6,h:6,y:D});}
 if(d===0){portFigures(-20,D,-18,10,18);portFigures(pm,D,120,8,5);portFigures(pm,D,260,5,5);portFigures(X,D,140,2,2);
  for(let i=0;i<3;i++)kput('boxW',[pm+rr(-3,3),D+.7,rr(30,360)],qEuler(0,rng()*.3,0),[2.2,1.4,4.2],new THREE.Color(0xd8c040));}
 if(d===1){
  portWeeds(-h+4,-SLB.LAND+2,h-4,-3,160,D);portTrees(-h+8,-44,-12,-10,6,D,4,10);portRubble(0,D,-14,5,14);
  for(let b=0;b<pier.bays;b++){if(pier.collapsed.has(b))continue;const z=pier.bayZ(b);portWeeds(P0+1,z[0]+1,P1-1,z[1]-1,10,D);}
  portContainer(-10,D,-20,.6,false,1,null,[0,.06]);portContainer(8,-1.5,12,.3,true,1,null,[.2,.3]);
  kput('pkSkiff',[20,-1.4,40],qEuler(.25,.9,Math.PI*.85),1,new THREE.Color(0x6a4a3a));
  for(let i=0;i<30;i++)kput('vine',[rr(ox-20,ox+20),D+6.9,oz+rr(-9,9)],qEuler(0,rng()*TAU,0),[1,rr(2,6),1],null);}
 if(d>=3){
  // the pier a street: stalls down its middle, houses on its landward end, boats
  for(let z=16;z<PE-30;z+=5.5){if(gone(z)||(z>60&&z<80)||rng()<.3)continue;portStall(pm+rr(-2,2),D,z,rng()<.5?Math.PI/2:-Math.PI/2);}
  for(let z=100;z<PE-40;z+=34){if(gone(z))continue;slShack(P0+3,D,z,Math.PI/2,5,4.4,2.8);}
  for(const [x,z] of [[-36,-26],[-18,-32]])portContainerHouse(G,x,D,z,rr(-.15,.15),d,{levels:1+(rng()<.5?1:0)});
  for(let x=-h+14;x<ox-24;x+=6)portStall(x,D,-8,Math.PI+rr(-.1,.1));
  portGarden(8,D,-14,16,8,d);portWashLine(-h+12,-6,-10,-6,8.5,10);
  for(const z of DZ){if(rng()<.8)slShack(X+rr(-.5,.5),D+.3,z,rng()*TAU,rr(3.2,4.2),rr(3.2,4.2),2.6,{lit:.6});}
  for(let z=30;z<380;z+=36)for(const o of [-1,1])kput('pkCloth',[X+3.2,D+.6,z+o*6],qEuler(0,Math.PI/2,0),[4,2.2,1],new THREE.Color(0x6a7a5a));
  for(let i=0;i<8;i++)portSkiff(rr(X-6,X+8),rr(20,380),rr(-.2,.2));
  for(let i=0;i<5;i++)portSkiff(rr(P0-9,P0-4),rr(20,380),rr(-.2,.2));
  for(const z of [110,300])slRaft(X-7,z,0,6,12,d,{shack:true,people:2});
  portFigures(pm,D,60,14,4);portFigures(pm,D,200,10,4);portFigures(pm,D,330,8,4);portFigures(-10,D,-20,24,24);
  for(let z=20;z<PE-20;z+=20){if(gone(z))continue;kput('plank',[P0+1,D+1.9,z],null,[.1,3.8,.1],null);kput('dot',[P0+1,D+3.9,z],null,[.35,.35,.35],WARM);}}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'slBerth',name:'Deep-water berth',cls:'seg',W:110,LAND:SLB.LAND,SEA:SLB.SEA,decays:[0,1,3],stamps:slBerthStamps,build:buildSlBerth});
