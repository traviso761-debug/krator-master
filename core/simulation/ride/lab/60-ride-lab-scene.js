// ================================================================= RIDE LAB — the scene: the gallery, the cars, the people
// [web] Drawn from the world's records: each segment's trackbed, guideway and platforms (the cars' floor height, the train's
// length), the fall between the segments and the cavern round it, the towns' floors; each car the Line's own (KratorVehicles,
// kits/motor-vehicles/krator-vehicles-line.js, the Kept variant) posed every frame by SIM.rideCarPose, the turned power car
// drawn half round, its wheels rolled by the distance run, a lamp over each door that lights in its door window (the kit's
// doors are drawn shut: they do not open yet); the travellers and porters as instanced figures at SIM.pose, a crate on a
// porter's back while the porters' carrier is on its way.
const scene=new THREE.Scene();scene.background=new THREE.Color(0x101216);scene.fog=new THREE.Fog(0x101216,180,1600);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,5000);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd8dce8,0x2a2622,0.85));{const d=new THREE.DirectionalLight(0xfff2dc,0.55);d.position.set(300,500,-200);scene.add(d);}
const LAB={mats:{},cars:[],lamp:null};
const mat=(c,o)=>LAB.mats[c]||(LAB.mats[c]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
function box(x0,x1,y0,y1,z0,z1,c,parent,name){const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat(c));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);if(name)m.name=name;(parent||scene).add(m);return m;}
const labGround=()=>-0.4;
const FY=RL.L.floorY,PH=RL.L.platformHalf,EDGE=-(RL.L.side+0.10);
box(-200,2300,-0.6,-0.4,-200,60,0x2a2724,null,'rock floor');
RL.L.seg.forEach(S=>{
  box(S.x0,S.x1,-0.4,0,EDGE,6,0x47423c,null,'trackbed '+S.id);
  [-0.85,0.85].forEach(z=>box(S.x0,S.x1,-0.12,0,z-0.18,z+0.18,0x9a9590,null,'guideway band'));
  box(S.x0,S.x1,-0.1,0.02,5,5.1,0x6a5a3a,null,'second track (cold)');
  /* the gallery's far wall and its lamps in a row, the Line's lamp code */
  box(S.x0,S.x1,0,12,8,9,0x34312d,null,'gallery wall');
  for(let x=S.x0+10;x<S.x1;x+=40)box(x-0.4,x+0.4,10.5,11,7.6,8,0xffe7a8,null,'lamp');
  S.stops.forEach(st=>{const x=RL.L.stops[st.id].x;
    box(x-PH,x+PH,0,FY,-6,EDGE,0x8c8478,null,'platform '+st.id);
    box(x-PH,x+PH,FY,FY+0.04,EDGE-0.2,EDGE,0xd8c040,null,'platform edge');
    box(st.stairX-1.2,st.stairX+1.2,0,FY,-14,-6,0x6c665c,null,'stair '+st.id);
    for(let dx=-PH+6;dx<=PH-6;dx+=12)box(x+dx-0.3,x+dx+0.3,FY,6,-6.6,-6,0x5a544c,null,'column');});});
/* the fall between the segments, and the cavern walked round it */
box(1000,1100,0,9,-6,9,0x3c3732,null,'the fall');
for(let i=1;i<RL.L.cavern.length;i++){const a=RL.L.cavern[i-1],b=RL.L.cavern[i],L=Math.hypot(b[0]-a[0],b[2]-a[2]),m=new THREE.Mesh(new THREE.BoxGeometry(4,0.3,L),mat(0x5a4e40));
  m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2-0.15,(a[2]+b[2])/2);m.rotation.order='YXZ';m.rotation.y=Math.atan2(b[0]-a[0],b[2]-a[2]);m.rotation.x=-Math.atan2(b[1]-a[1],L);m.name='cavern path';scene.add(m);}
['ledge','twenny'].forEach(id=>{const x=RL.L.stops[id].x;box(x-30,x+30,-0.4,0,-60,-14,0x4c4438,null,'town '+id);
  for(let k=0;k<5;k++)box(x-26+k*11,x-19+k*11,0,4,-58,-50,0x7a6650,null,'house');});
/* the cars: the Line's own, the Kept variant; a lamp over each door (lit green in its window) */
const LAMPON=new THREE.MeshBasicMaterial({color:0x6dff9a}),LAMPOFF=new THREE.MeshBasicMaterial({color:0x2a3a30});
RL.L.sources.forEach(S=>S.cars.forEach(C=>{const car=RL.L.train[C.k],g=new THREE.Group();g.name=S.id+'.car'+C.k;g.rotation.order='YXZ';
  const body=KratorVehicles.build(car.key,{variant:1,seed:(S.id==='line.n'?11:31)+C.k,linear:true});if(body){if(car.flip)body.rotation.y=Math.PI;g.add(body);}
  const lamps={};(car.ride.doors||[]).forEach(D=>{const m=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.5),LAMPOFF);
    m.position.set(D.side*(RL.L.side+0.06),FY+2.15,D.at[2]);m.name='door lamp '+D.id;g.add(m);lamps[D.id]=m;});
  scene.add(g);LAB.cars.push({src:S.id,k:C.k,g,body,flip:car.flip,lamps,s:null});}));
/* the people: travellers in ochre, porters in rust, a crate on a porter's back while the carrier is on its way */
LAB.ids=RL.people.map(a=>a.id).concat(RL.shift.map(a=>a.id),RL.L.porters.crew);
LAB.fig=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.26,1.6,8).translate(0,0.8,0),mat(0xffffff),LAB.ids.length);LAB.fig.name='people';
{const col=new THREE.Color();LAB.ids.forEach((id,i)=>LAB.fig.setColorAt(i,col.set(id.indexOf('porter')>=0?0xb4552e:id.indexOf('shift')===0?0x5a9ad8:0xe0b050)));}
LAB.crate=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,0.5,0.5),mat(0x9a7a4a),RL.L.porters.crew.length);LAB.crate.name='crates';
scene.add(LAB.fig,LAB.crate);
const labM=new THREE.Matrix4(),labQ=new THREE.Quaternion(),labE=new THREE.Euler(),labV=new THREE.Vector3(),labS=new THREE.Vector3(1,1,1),labSit=new THREE.Vector3(1,0.7,1);
function labDraw(t,dt,eye){
  LAB.cars.forEach(c=>{const P=SIM.rideCarPose(c.src,c.k,t),sh=SIM.rideHead(c.src,t);c.g.position.set(P.x,P.y,P.z);c.g.rotation.y=P.yaw;c.g.rotation.x=-P.pitch;
    if(c.body&&c.s!=null&&sh!==c.s)KratorVehicles.roll(c.body,(c.flip?-1:1)*(sh-c.s));c.s=sh;   /* the wheels turn with the distance run */
    Object.keys(c.lamps).forEach(id=>{c.lamps[id].material=SIM.rideDoorOpen(c.src,c.k,id,t)?LAMPON:LAMPOFF;});});
  const carrying=RL.L.routes.porters.carriers[0].phase==='sail';
  LAB.ids.forEach((id,i)=>{const a=SIM.R.actor[id],p=a?SIM.pose(a,t):null;
    if(!p||p.hidden)labM.makeScale(0,0,0);
    else{labQ.setFromEuler(labE.set(0,p.h,0));
      /* a rider held on a seat (its journey's place on this car is a seat, and it is not walking) is drawn sitting on it */
      const seated=p.frame&&!p.moving&&a.task.ride&&a.task.ride.held.some(h=>h.src===p.frame.source&&h.k===p.frame.k&&h.seat);
      labM.compose(labV.set(p.x,p.y+(seated?0.42:0),p.z),labQ,seated?labSit:labS);}
    LAB.fig.setMatrixAt(i,labM);});
  RL.L.porters.crew.forEach((id,i)=>{const a=SIM.R.actor[id],p=SIM.pose(a,t);
    if(carrying){labQ.setFromEuler(labE.set(0,p.h,0));labM.compose(labV.set(p.x,p.y+1.75,p.z),labQ,labS);}else labM.makeScale(0,0,0);LAB.crate.setMatrixAt(i,labM);});
  LAB.fig.instanceMatrix.needsUpdate=true;LAB.crate.instanceMatrix.needsUpdate=true;}
