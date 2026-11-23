// ================================================================= HOST — ephemeral seasonal harvesting gear (?works=0 disables; PLAN.md §7.4)
// Locked rule (CROOK-RIA-DECISIONS.md §2.1): ZERO permanent settlements or buildings (class === 'building') exist inside the < +25 m tsunami bowl.
// Only light, sacrificial bamboo/driftwood harvesting gear (class: 'furniture', setting: 'outdoor') deployed by daytime Ria Sound skiff-crews stands
// here — all built with packed library materials (rackwood, driftwood, byssus, amber: 0 untextured meshes).
const WORKS=(function(){
 const out={racks:0,sluices:0,moorings:0,groups:[]};
 if(new URLSearchParams(location.search).get('works')==='0')return out;
 const M=DOUBLEDELTA.M;
 const poleGeo=new THREE.CylinderGeometry(0.055,0.07,1.0,7,1,false);
 poleGeo.translate(0,0.5,0);
 const trayGeo=new THREE.BoxGeometry(2.4,0.08,1.2);
 const floatGeo=new THREE.CylinderGeometry(0.18,0.18,0.55,9,1,false);

 function addRack(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  const corners=[[-1.1,-0.52],[1.1,-0.52],[-1.1,0.52],[1.1,0.52]];
  for(const c of corners){
   const p=new THREE.Mesh(poleGeo,M.rackwood);
   p.position.set(c[0],-0.25,c[1]);
   p.scale.set(1,1.95,1);
   p.userData.host=true;
   p.userData.inspectLabel=label;
   g.add(p);
  }
  const t=new THREE.Mesh(trayGeo,M.rackwood);
  t.position.set(0,1.45,0);
  t.userData.host=true;
  t.userData.inspectLabel=label;
  g.add(t);
  g.userData.host=true;
  g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:2.2});
  REGISTER({
   cls:'furniture',kind:'drying-rack',key:'sponge-rack',
   name:label,x,z,y:y-0.3,r:2.4,h:2.5,
   tags:{culture:'generic',setting:'outdoor',job:'fishing'}
  });
  out.racks++;
  out.groups.push(g);
 }

 function addAmberSluice(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  for(const sx of [-1.2,1.2])for(const sz of [-0.38,0.38]){
   const p=new THREE.Mesh(poleGeo,M.driftwood);
   p.position.set(sx,-0.3,sz);
   p.scale.set(1.1,1.55,1.1);
   p.userData.host=true;
   p.userData.inspectLabel=label;
   g.add(p);
  }
  const trough=new THREE.Mesh(trayGeo,M.driftwood);
  trough.position.set(0,1.02,0);
  trough.rotation.z=-0.08;
  trough.scale.set(1.15,1.2,0.72);
  trough.userData.host=true;
  trough.userData.inspectLabel=label;
  g.add(trough);
  const gem=new THREE.Mesh(floatGeo,M.amber);
  gem.position.set(0.35,1.14,0);
  gem.scale.set(0.75,0.22,0.75);
  gem.userData.host=true;
  gem.userData.inspectLabel=label;
  g.add(gem);
  g.userData.host=true;
  g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:2.4});
  REGISTER({
   cls:'furniture',kind:'amber-sluice',key:'amber-sluice',
   name:label,x,z,y:y-0.3,r:2.6,h:2.2,
   tags:{culture:'generic',setting:'outdoor',job:'mining',role:'gather:ria-amber'}
  });
  out.sluices++;
  out.groups.push(g);
 }

 function addMooringPost(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  const p=new THREE.Mesh(poleGeo,M.driftwood);
  p.position.set(0,-0.35,0);
  p.scale.set(1.8,2.6,1.8);
  p.userData.host=true;
  p.userData.inspectLabel=label;
  g.add(p);
  const fl=new THREE.Mesh(floatGeo,M.byssus);
  fl.position.set(0,1.95,0);
  fl.userData.host=true;
  fl.userData.inspectLabel=label;
  g.add(fl);
  g.userData.host=true;
  g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:1.6});
  REGISTER({
   cls:'furniture',kind:'mooring-post',key:'drawdown-chime-post',
   name:label,x,z,y:y-0.3,r:1.8,h:3.0,
   tags:{culture:'generic',setting:'outdoor',job:'fishing'}
  });
  out.moorings++;
  out.groups.push(g);
 }

 if(SKEY==='bioherm'){
  addRack(-92,-96,0.4,'Sacrificial bamboo sponge-squeezing and drying rack (daytime Ria Sound skiff gear)');
  addRack(275,168,-0.5,'Sacrificial bamboo sponge-curing trestle (washes away cleanly in Tier-2 Ghost Bores)');
  addMooringPost(-235,-48,0.2,'Skiff mooring stake and pre-tsunami drawdown warning float');
 }else if(SKEY==='bitumen'){
  addAmberSluice(-248,-46,0.35,'Tethered bamboo ria-amber washing sluice beside blue-clay scour bar');
  addAmberSluice(378,-192,-0.6,'Seasonal ria-amber screen-box and bitumen caulking trestle');
 }else if(SKEY==='throat'){
  const sb=SITE.slipwayBench;
  addMooringPost(sb.x-36,sb.z+22,0.1,'Lower +41 m slipway timber capstan and drawdown float-chime');
  addRack(sb.x+24,sb.z-18,-0.3,'Lower +41 m slipway Sea-Byssus and sponge sorting rack');
 }
 return out;
})();
