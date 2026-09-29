// ================================================================ SEGMENT: hbHaven - small landing, slipway and lighthouse
// An 80 m haven (seeds 20420-20424; kit in 85-hb-1-fish.js, hbPont/hbGangway
// in 85-hb-2-marina.js). A SLIPWAY runs from a white vaulted LIFEBOAT HOUSE
// on the apron straight down into the water between two low walls, rails on
// it and the lifeboat on its trolley; west of it a small landing pontoon on a
// gangway and the harbour office. A rubble-mound BREAKWATER leaves the land
// east of the slip, runs out 70 m and turns west, ending in a round head
// that carries the LIGHTHOUSE: a tapering white shaft ringed with bands, a
// railed gallery and a lit lantern under a glass finial.
//   d=0 intact   lantern lit, lifeboat on the slip, launches on moorings
//   d=1 ruined   the tower snapped at 9 m, its top lying across the rocks;
//                the slip silted, the lifeboat rotting on it, boats sunk
//   d=3 reclaimed the tower relit warm on a timber lantern, shacks round its
//                foot, stilt houses on the breakwater's lee, a trawler house
const HBH={LAND:50,SEA:130,SL:[-6,6,-26,14],BX0:18,BX1:26,AZ0:62,AZ1:70,AX0:-8,HX:-8,HZ:66,HR:7,BH:[0,-34,14,14]};
function hbHavenStamps(o){const d=o.d,h=o.W/2,D=PORT.DECK,H=HBH,S=H.SL;
 const s=[{kind:'flat',x0:-h,z0:-H.LAND,x1:h,z1:0,y:D,soft:40,paint:d>=1?'soil':'pave'},
  {kind:'dig',x0:-h,z0:0,x1:h,z1:H.SEA,y:d===1?-1.6:-5,soft:30},
  {kind:'ramp',x0:S[0],x1:S[1],z0:S[2],z1:S[3],axis:'z',ya:D,yb:-3,paint:d===1?'sand':'pave'}];
 if(d===1){const P=[[-16,6],[4,14],[12,30],[2,48],[-14,40],[-22,22]],cx=-6,cz=26;
  [[1.15,-1.1],[.9,-.4],[.6,.25]].forEach(([k,y],i)=>s.push({kind:'fill',poly:P.map(p=>[cx+(p[0]-cx)*k,cz+(p[1]-cz)*k]),y,paint:i===2?'mud':'sand'}));}
 s.push({kind:'fill',x0:H.BX0,z0:-2,x1:H.BX1,z1:H.AZ1,y:D,paint:d>=1?'soil':'pave'});
 s.push({kind:'fill',x0:H.AX0,z0:H.AZ0,x1:H.BX1,z1:H.AZ1,y:D,paint:d>=1?'soil':'pave'});
 const c=[];for(let i=0;i<20;i++){const a=i/20*TAU;c.push([H.HX+Math.cos(a)*H.HR,H.HZ+Math.sin(a)*H.HR]);}
 s.push({kind:'fill',poly:c,y:D,paint:'rock'});
 return s.concat(portEdgeStamps(o,{LAND:H.LAND,SEA:H.SEA}));}

// Two light beams swept out of the lantern, shown only at night (PORT_NIGHT).
MAT.hbBeam=new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:.10,blending:THREE.AdditiveBlending,depthWrite:false,side:DS});
const HB_BEAMS=[];PORT_NIGHT.push(on=>{for(const m of HB_BEAMS)m.visible=on;});
function hbBeams(G,x,y,z,a0){for(const a of [a0,a0+Math.PI*.8]){const g=new THREE.ConeGeometry(7,90,14,1,true).translate(0,-45,0);
 g.rotateZ(Math.PI/2-.03);g.rotateY(a);g.translate(x,y,z);const m=mesh(g,MAT.hbBeam,G);m.visible=false;m.userData.probeSkip=true;HB_BEAMS.push(m);}}
// The lighthouse: a tapering white shaft with bands, a railed gallery, a lantern.
function hbLighthouse(G,x,z,d){const D=PORT.DECK,Ht=22,r=y=>2.7-y*.052+.35*Math.exp(-y*.4),mat=SHELL(d);
 kput('slabC',[x,D+.5,z],null,[4.2,1,4.2],d>0?new THREE.Color(0xa09a90):null);
 const g=lathe({rFn:r,H:Ht,cut:d===1?9:Ht,jag:d===1?1.4:0,nu:18,nv:8,seed:7});g.translate(x,D+1,z);pbAdd(g,mat,G);
 if(d===1){const t=lathe({rFn:y=>r(y+9),H:Ht-9,nu:18,nv:6,seed:3});t.rotateZ(-Math.PI/2*.94);t.rotateY(-.7);t.translate(x+2.2,D+1.6,z+1.5);pbAdd(t,mat,G);
  portRubble(x+6,D-1,z+6,4,14);kput('slab',[x+13,-.2,z+10],qEuler(.6,0,.3),[3.4,.3,3.4],new THREE.Color(0x8a8078));
  for(let i=0;i<5;i++)kput('vine',[x+rr(-2,2),D+9.5,z+rr(-2,2)],null,[1,rr(3,7),1],null);
  REGISTER({name:'Lighthouse (snapped)',x,z,r:5,h:12,y:D});REGISTER({name:'Fallen lighthouse top',x:x+10,z:z+8,r:6,h:6,y:-2});return;}
 for(const y of [5,10,15])kput(d>0?'ringR':'ringW',[x,D+1+y,z],qEuler(Math.PI/2,0,0),[r(y)+.06,r(y)+.06,2],null);
 const gy=D+1+Ht;
 kput('slab',[x,gy+.2,z],null,[3.4,.4,3.4],d>0?new THREE.Color(0x8a8078):new THREE.Color(0xf2efe8));
 for(let i=0;i<16;i++){const a=i/16*TAU;kput(d>0?'strutR':'strutW',[x+Math.cos(a)*3.2,gy+.95,z+Math.sin(a)*3.2],null,[.06,1.1,.06],null);}
 kput('ringW',[x,gy+1.5,z],qEuler(Math.PI/2,0,0),[3.2,3.2,1],d>0?new THREE.Color(0x8a6a4a):null);
 if(d>=3){for(const s of [-1,1])kput('plank',[x,gy+1.6,z+s*1.2],null,[2.8,2.4,.12],null);
  kput('shantyRoof',[x,gy+2.9,z],qEuler(.12,0,0),[3.2,1,3.2],hbPick(HB_SHC));
  kput('dot',[x,gy+1.7,z],null,[1.5,2.4,5],WARM);hbBeams(G,x,gy+1.7,z,4.0);kput('pkDish',[x+1.6,gy+2.9,z],qEuler(0,2,0),1,null);
  for(const a of [0,2.1,4.2])portWashLine(x,z,x+Math.cos(a)*11,z+Math.sin(a)*11,gy+.5,8);}
 else{kput('dot',[x,gy+1.7,z],null,[1.6,2.6,5.6],d===0?new THREE.Color(0xeafcff):WARM);
  for(let i=0;i<4;i++){const a=i/4*TAU+.785;kput('strutW',[x+Math.cos(a)*1.25,gy+1.7,z+Math.sin(a)*1.25],null,[.12,2.6,.12],null);}
  kput('slab',[x,gy+3.1,z],null,[1.9,.35,1.9],new THREE.Color(0xf2efe8));kput('finial',[x,gy+4.2,z],null,1.1,null);
  hbBeams(G,x,gy+1.7,z,3.6);
  kput('strip',[x,gy+.02,z+3.42],null,[4,.4,.4],CYAN);kput('strip',[x,gy+.02,z-3.42],null,[4,.4,.4],CYAN);}
 kput('pkDoor',[x,D+2.2,z+r(1)+.02],null,[1.2,2.2,1],new THREE.Color(0x2a3a4a));
 REGISTER({name:'Lighthouse',x,z,r:4.5,h:Ht+6,y:D});}
// The lifeboat house: white panelled walls, a barrel roof along z, the big door
// facing down the slipway.
function hbBoatShed(G,cx,cz,w,dp,d){const D=PORT.DECK,H=7,rise=3,mat=SHELL(d);
 for(const s of [-1,1])pbBox(G,mat,cx+s*(w/2-.15),D+H/2,cz,.3,H,dp,0,8);
 pbBox(G,mat,cx,D+(H+rise)/2,cz-dp/2+.15,w,H+rise,.3,0,8);
 const hole=d>0?holeFn(d,rr(0,90),null,2):null;
 pbAdd(gridSurface((u,v)=>[cx-w/2+u*w,D+H+rise*Math.sin(Math.PI*u),cz-dp/2+v*dp],10,5,{uS:w/8,vS:dp/8,hole:hole?(u,v)=>hole(u,v*dp*1.5):null}),mat,G);
 pbAdd(gridSurface((u,v)=>[cx-w/2+u*w,D+H+rise*Math.sin(Math.PI*u)*(1-v)+(H-.2)*0,cz+dp/2],10,1,{uS:w/8,vS:.4}),mat,G);   // the arched gable over the door
 for(const s of [-1,1])pbBox(G,mat,cx+s*(w/2-1.2),D+H/2,cz+dp/2-.15,2.4,H,.3,0,8);
 pbBox(G,mat,cx,D+H-.5,cz+dp/2-.15,w,1,.3,0,8);
 if(d!==1)kput('pkDoor',[cx,D+3,cz+dp/2-.4],null,[w-5,6,1],d===0?new THREE.Color(0x2a4a6a):new THREE.Color(0x6a5a3a));
 for(let i=0;i<3;i++)kput(d===0?'pane':'paneD',[cx,D+H+rise*.55,cz-dp/2+dp*(i+.5)/3],qEuler(0,0,0),[w*.5,.2,dp/3-.6],null);
 REGISTER({name:'Lifeboat house',x:cx,z:cz,r:Math.max(w,dp)/2+.5,h:H+rise,y:D});}

function buildHbHaven(scene,gx,gz,d,opt){reseed(20420+d);
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);KOFF=[gx,0,gz];
 const D=PORT.DECK,h=opt.W/2,H=HBH,S=H.SL;
 portPaving(G,-h,-H.LAND,h,-1.2,d,{hole:(x,z)=>x>S[0]-.5&&x<S[1]+.5&&z>S[2]-.5});
 portPaving(G,H.BX0+.5,-1.2,H.BX1-.5,H.AZ1-.5,d);portPaving(G,H.AX0,H.AZ0+.5,H.BX0+.5,H.AZ1-.5,d);
 const qw=portQuayWall(G,-h,0,h,0,d,{ladders:0,gaps:[[S[0]+h,S[1]+h],[H.BX0+h,H.BX1+h]]});
 for(const s of [-1,1])portQuayWall(G,s<0?S[0]:S[1],S[2],s<0?S[0]:S[1],2,d,{face:[-s,0],fenders:0,ladders:0,bollards:0,tide:false,top:D+.4});
 portSideClose(G,opt.nb,d,{z0:-H.LAND,z1:0});
 // the slipway: a concrete skin on the ramp, rails, a winch house at its head
 pbAdd(gridSurface((u,v)=>{const x=S[0]+u*(S[1]-S[0]),z=S[2]+v*(S[3]-S[2]);return[x,portH(x,z)+.06,z];},4,14,{uS:1.5,vS:5}),CONC(d),G,true);
 const ry=z=>z<S[2]?D:lerp(D,-3,(z-S[2])/(S[3]-S[2]));
 for(const s of [-1.2,1.2]){beam(d>0?'strutR':'strutW',[s,D+.12,H.BH[1]-6],[s,D+.12,S[2]],.14,.14,new THREE.Color(0x8a8e92));
  beam(d>0?'strutR':'strutW',[s,D+.12,S[2]],[s,ry(S[3]-2)+.12,S[3]-2],.14,.14,new THREE.Color(0x8a8e92));}
 REGISTER({name:'Slipway',x:0,z:-6,r:8,h:10,y:-3});
 hbBoatShed(G,H.BH[0],H.BH[1],H.BH[2],H.BH[3],d);
 // the lifeboat on its trolley (d=0), rotting on the slip (d=1)
 const lz=-18,ly=ry(lz),pit=Math.atan(9/40);
 kput('boxD',[0,ly+.4,lz],qEuler(pit,0,0),[2.4,.5,6],null);
 hbBoat('Launch',d===1?.4:0,ly+1.35,lz,d===1?.1:0,d,{pitch:pit,roll:d===1?.3:0,col:new THREE.Color(0xe8602a),houseCol:new THREE.Color(0xf4f2ec),noRig:d===1,lit:d===3?2:0});
 REGISTER({name:d===1?'Abandoned lifeboat':'Lifeboat',x:0,z:lz,r:5.5,h:6,y:ly-1});
 // the landing pontoon on its gangway, west of the slip
 hbGangway(-24,-.2,11,D,.05,d,d===1);
 hbPont(G,-24,d===1?-.5:.05,17,2.8,12,d===1?.3:0,d,d===1?{roll:.2}:{});hbPile(-26,20,d);hbPile(-22,14,d);
 REGISTER({name:'Landing pontoon',x:-24,z:16,r:6,h:5,y:-2});
 portShed(G,-21,-33,14,10,5,d,{name:'Harbour office'});
 portLamp(-12,D,-4,0,d);portLamp(12,D,-4,0,d);portLamp(-34,D,-4,0,d);
 for(let z=14;z<H.AZ0;z+=24)portLamp(H.BX0+1.5,D,z,-Math.PI/2,d);
 // the breakwater: mound slopes, parapet, the lighthouse on the head
 hbMound(G,H.BX1,0,H.BX1,H.AZ1,1,0,d);hbMound(G,H.BX0,0,H.BX0,H.AZ0,-1,0,d);
 hbMound(G,H.AX0,H.AZ1,H.BX1,H.AZ1,0,1,d);hbMound(G,H.AX0,H.AZ0,H.BX0,H.AZ0,0,-1,d);
 hbMoundCone(G,H.BX1,H.AZ1,0,0,Math.PI/2,d);hbMoundCone(G,H.HX,H.HZ,H.HR,0,TAU,d);
 kput('slabC',[H.HX,D-.1,H.HZ],null,[H.HR,.3,H.HR],d>0?new THREE.Color(0xa09a90):null);
 if(d===1){pbBox(G,CONC(d),H.BX1-.6,D+.7,20,1.2,1.4,40,0,8);pbBox(G,CONC(d),10,D+.7,H.AZ1-.6,20,1.2,1.2,0,8);}
 else{pbBox(G,CONC(d),H.BX1-.6,D+.7,(H.AZ1-1)/2,1.2,1.4,H.AZ1+1,0,8);pbBox(G,CONC(d),(H.AX0+H.BX1)/2+3,D+.7,H.AZ1-.6,H.BX1-H.AX0-6,1.2,1.2,0,8);}
 REGISTER({name:'Breakwater',x:22,z:24,r:5,h:9,y:-2});REGISTER({name:'Breakwater arm',x:8,z:66,r:5,h:9,y:-2});
 hbLighthouse(G,H.HX,H.HZ,d);
 // ---- intact
 if(d===0){
  for(const [x,z] of [[-28,44],[-12,36],[-30,60],[4,46]]){portBuoy(x,z+6);hbBoat('Launch',x,0,z,rr(-.3,.3),d,{lit:1});}
  hbBoat('Yacht',-24,0,26,Math.PI/2,d,{lit:1});
  for(let i=0;i<4;i++)portSkiff(-24+rr(-3,3),rr(8,24),rr(-.2,.2)+Math.PI/2);
  portFigures(-10,D,-12,12,20);portFigures(22,D,40,4,20);portFigures(-8,D,66,2,4);portFigures(0,D,-26,3,3);
  hbCrates(-18,D,-10,9,0);}
 // ---- ruined
 if(d===1){
  hbBoat('Launch',-12,-1.4,34,.6,d,{roll:.4});hbBoat('Launch',-28,-.3,50,2.2,d,{roll:Math.PI-.2,noRig:true});
  hbBoat('Yacht',-2,-.6,22,1.9,d,{roll:.9});REGISTER({name:'Yacht on the silt',x:-2,z:22,r:7,h:10,y:-2});
  for(let i=0;i<4;i++)kput('pkSkiff',[rr(-30,10),rr(-.6,.1),rr(6,60)],qEuler(rr(-.3,.3),rng()*TAU,rr(-.8,.8)),1,new THREE.Color(0x5a4636));
  portWeeds(-h+4,-H.LAND+4,h-4,-3,110,D);portWeeds(H.BX0+1,2,H.BX1-1,H.AZ1-1,40,D);
  portTrees(-h+8,-46,-20,-40,3,D,4,8);portTrees(20,-46,h-8,-30,3,D,4,8);portRubble(10,D,-14,3,8);}
 // ---- reclaimed
 if(d>=3){
  const S2=[[8,20],[8,40],[4,56]];const fl=[];
  S2.forEach(([x,z])=>{fl.push(hbStilt(x,z,d,{w:rr(4.4,5.4),dp:rr(4,4.8),floor:3.8,yaw:rr(-.15,.15)}));});
  hbRope([10.8,3.8,20],[H.BX0,D,24],.4);hbRope([8,3.8,23],[8,3.8,37],.8);hbRope([6,3.8,43],[4,3.8,53],.8);
  hbBoatHouse('Trawl',-16,44,.15,d,{name:'Trawler house'});
  hbRaft(-2,28,6,4,.2,'garden');hbRaft(-12,14,5,3.6,-.3,'fish');
  for(const [x,z] of [[-28,62],[-28,32]])hbBoat('Launch',x,0,z,rr(-.2,.2),d,{lit:2});
  for(let i=0;i<6;i++)portSkiff(rr(-32,6),rr(6,60),rng()*TAU);
  for(let z=10;z<H.AZ0-4;z+=12)hbFishRack(H.BX1-3.2,D,z,Math.PI/2,8,16);
  for(const a of [.6,2.3,3.9,5.3]){const px=H.HX+Math.cos(a)*5.2,pz=H.HZ+Math.sin(a)*5.2;
   kput('shantyBox',[px,D+1.1,pz],qEuler(0,-a,0),[2.4,2.2,2],hbPick(HB_SHC));kput('shantyRoof',[px,D+2.3,pz],qEuler(.1,-a,0),[2.9,1,2.6],hbPick(HB_SHC));}
  REGISTER({name:'Shacks round the light',x:H.HX,z:H.HZ,r:6.5,h:4,y:D});
  for(let i=0;i<5;i++)portStall(-36+i*6.4,D,-9,Math.PI+rr(-.1,.1));
  portContainerHouse(G,24,D,-30,Math.PI/2,d,{levels:2,big:false});portGarden(-20,D,-44,14,6,d);portGarden(22,D,-12,12,6,d);
  portWashLine(-36,-4,-10,-4,8.4,8);
  portFigures(-12,D,-12,16,22);portFigures(22,D,40,5,16);portFigures(-8,D,66,4,5);
  portWeeds(-h+4,-H.LAND+4,h-4,-3,30,D);}
 KOFF=[0,0,0];return G;}
PORT_SEG({key:'hbHaven',name:'Haven and lighthouse',cls:'seg',W:80,LAND:HBH.LAND,SEA:HBH.SEA,decays:[0,1,3],stamps:hbHavenStamps,build:buildHbHaven});
