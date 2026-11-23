// ================================================================= LOJ TWENNY: THE BRANCH SHUTTLE DRAWN (the Line's cars, Kept)
// [web] Each car the Line's own (KratorVehicles, kits/motor-vehicles/krator-vehicles-line.js, the Kept variant), posed every frame
// by SIM.rideCarPose (42-lt-ride.js), the turned power car half round, its wheels rolled by the distance run; a lamp over each
// door lights green in its door window (the kit's doors are drawn shut: KNOWN_ISSUES.md). Drawn on the Line deck (deck 0).
const LT_TRAIN={cars:[]};
function ltTrainBuild(L){const LAMPON=new THREE.MeshBasicMaterial({color:0x6dff9a}),LAMPOFF=new THREE.MeshBasicMaterial({color:0x2a3a30});LAMPON.toneMapped=false;
 LT_TRAIN.on=LAMPON;LT_TRAIN.off=LAMPOFF;
 L.source.cars.forEach(C=>{const car=L.train[C.k],g=new THREE.Group();g.name='the branch shuttle, car '+C.k+' ('+car.key+')';g.rotation.order='YXZ';
  const body=KratorVehicles.build(car.key,{variant:1,seed:41+C.k,linear:true});if(body){if(car.flip)body.rotation.y=Math.PI;g.add(body);}
  const lamps={};(car.ride.doors||[]).forEach(D=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.5),LAMPOFF);m.position.set(D.side*(L.side+.06),1.2+2.15,D.at[2]);m.name='door lamp '+D.id;g.add(m);lamps[D.id]=m;});
  g.traverse(m=>{m.userData.deck=0;});scene.add(g);LT_TRAIN.cars.push({k:C.k,g,body,flip:car.flip,lamps,s:null});});}
function ltTrainDraw(t){const L=LT_LIFE.L;if(!L)return;
 LT_TRAIN.cars.forEach(c=>{const P=SIM.rideCarPose(L.source.id,c.k,t),sh=SIM.rideHead(L.source.id,t);c.g.position.set(P.x,P.y,P.z);c.g.rotation.y=P.yaw;c.g.rotation.x=-P.pitch;
  if(c.body&&c.s!=null&&sh!==c.s&&KratorVehicles.roll)KratorVehicles.roll(c.body,(c.flip?-1:1)*(sh-c.s));c.s=sh;
  Object.keys(c.lamps).forEach(id=>{c.lamps[id].material=SIM.rideDoorOpen(L.source.id,c.k,id,t)?LT_TRAIN.on:LT_TRAIN.off;});});}
