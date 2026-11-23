/* ==================== HOST — cFlit-qBon & Hueru-Kuran mooring/phytomining works (?works=0 disables; PLAN.md section 6.1) ==================== */
/* Zero permanent buildings (class === 'building') anywhere in the Drownlands!
   Only sacrificial / marine mooring, warning, driftwood-boom, and phytomining props (cls: 'furniture', setting: 'outdoor'),
   100% textured with packed library materials (jadeRock, bronze, brick, rope, snag, serpRock, coalRock). */

const WORKS=(function(){
 const out={moorings:0,buoys:0,retorts:0,booms:0,cairns:0,groups:[],buoyMesh:null};
 if(new URLSearchParams(location.search).get('works')==='0')return out;
 const M=DROWN.M;

 const plinthGeo=new THREE.CylinderGeometry(0.68,0.86,0.95,10,1,false);
 plinthGeo.translate(0,0.475,0);
 const torusGeo=new THREE.TorusGeometry(0.46,0.13,10,20);
 const poleGeo=new THREE.CylinderGeometry(0.08,0.11,1.0,8,1,false);
 poleGeo.translate(0,0.5,0);
 const boxGeo=new THREE.BoxGeometry(1.0,1.0,1.0);
 const jarGeo=new THREE.SphereGeometry(0.42,12,10);

 function addJadeMooring(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  const pl=new THREE.Mesh(plinthGeo,M.serpRock);
  pl.position.set(0,-0.25,0);
  pl.userData.host=true;pl.userData.inspectLabel=label;
  g.add(pl);
  const ring=new THREE.Mesh(torusGeo,M.jadeRock);
  ring.position.set(0,0.92,0);
  ring.rotation.x=0.35;
  ring.userData.host=true;ring.userData.inspectLabel=label;
  g.add(ring);
  const hawser=new THREE.Mesh(poleGeo,M.rope);
  hawser.position.set(-0.65,0.42,0);
  hawser.rotation.z=1.22;
  hawser.scale.set(0.75,1.8,0.75);
  hawser.userData.host=true;hawser.userData.inspectLabel=label;
  g.add(hawser);
  g.userData.host=true;g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:1.8});
  REGISTER({
   cls:'furniture',kind:'mooring-ring',key:'nephrite-mooring-ring',
   name:label,x,z,y:y-0.3,r:2.0,h:2.2,
   tags:{culture:'generic',setting:'outdoor',job:'fishing',role:'gather:jade'}
  });
  out.moorings++;
  out.groups.push(g);
 }

 function addHydrophoneBuoy(x,z,label){
  const g=new THREE.Group();
  g.position.set(x,DROWN_STATE.levelM,z);
  const body=new THREE.Mesh(jarGeo,M.bronze);
  body.position.set(0,0.18,0);
  body.scale.set(1.15,1.35,1.15);
  body.userData.host=true;body.userData.inspectLabel=label;
  g.add(body);
  const mast=new THREE.Mesh(poleGeo,M.bronze);
  mast.position.set(0,0.55,0);
  mast.scale.set(0.55,1.45,0.55);
  mast.userData.host=true;mast.userData.inspectLabel=label;
  g.add(mast);
  const chime=new THREE.Mesh(torusGeo,M.jadeRock);
  chime.position.set(0,1.72,0);
  chime.scale.set(0.55,0.55,0.55);
  chime.userData.host=true;chime.userData.inspectLabel=label;
  g.add(chime);
  const line=new THREE.Mesh(poleGeo,M.rope);
  line.position.set(0,-3.2,0);
  line.scale.set(0.45,3.4,0.45);
  line.userData.host=true;line.userData.inspectLabel=label;
  g.add(line);
  g.userData.host=true;g.userData.inspectLabel=label;
  scene.add(g);
  REGISTER({
   cls:'furniture',kind:'hydrophone-buoy',key:'ghost-tsunami-hydrophone',
   name:label,x,z,y:-2.5,r:2.2,h:5.5,
   tags:{culture:'generic',setting:'outdoor',job:'fishing'}
  });
  out.buoys++;
  out.buoyMesh=g;
  out.groups.push(g);
 }

 function addAshRetort(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  const hearth=new THREE.Mesh(boxGeo,M.brick);
  hearth.position.set(0,0.42,0);
  hearth.scale.set(2.2,0.95,1.5);
  hearth.userData.host=true;hearth.userData.inspectLabel=label;
  g.add(hearth);
  const flue=new THREE.Mesh(plinthGeo,M.brick);
  flue.position.set(-0.55,0.85,0);
  flue.scale.set(0.52,1.15,0.52);
  flue.userData.host=true;flue.userData.inspectLabel=label;
  g.add(flue);
  const ashPan=new THREE.Mesh(boxGeo,M.tealsap);
  ashPan.position.set(0.48,0.92,0);
  ashPan.scale.set(0.88,0.14,0.95);
  ashPan.userData.host=true;ashPan.userData.inspectLabel=label;
  g.add(ashPan);
  const coalPile=new THREE.Mesh(jarGeo,M.coalRock);
  coalPile.position.set(1.45,0.18,0.35);
  coalPile.scale.set(1.2,0.55,1.1);
  coalPile.userData.host=true;coalPile.userData.inspectLabel=label;
  g.add(coalPile);
  g.userData.host=true;g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:2.6});
  REGISTER({
   cls:'furniture',kind:'ash-retort',key:'nickel-ash-retort',
   name:label,x,z,y:y-0.3,r:2.8,h:2.6,
   tags:{culture:'generic',setting:'outdoor',job:'mining',role:'gather:nickel-bio-ash'}
  });
  out.retorts++;
  out.groups.push(g);
 }

 function addCairn(x,z,yaw,label){
  const y=terrainH(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;
  for(let k=0;k<3;k++){
   const s=1.05-0.24*k;
   const st=new THREE.Mesh(plinthGeo,k===2?M.jadeRock:M.basaltRock);
   st.position.set(0,-0.2+k*0.62,0);
   st.scale.set(s,0.72,s);
   st.userData.host=true;st.userData.inspectLabel=label;
   g.add(st);
  }
  g.userData.host=true;g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:1.5});
  REGISTER({
   cls:'furniture',kind:'claim-cairn',key:'drownlands-cairn',
   name:label,x,z,y:y-0.3,r:1.8,h:2.4,
   tags:{culture:'generic',setting:'outdoor',job:'mining'}
  });
  out.cairns++;
  out.groups.push(g);
 }

 function addDriftBoom(x,z,yaw,label){
  const y=terrainH(x,z),wY=Math.max(y,0.0);
  const g=new THREE.Group();
  g.position.set(x,wY,z);
  g.rotation.y=yaw;
  for(const sx of [-4.2,4.2]){
   const stake=new THREE.Mesh(poleGeo,M.snag);
   stake.position.set(sx,y-wY-0.6,0);
   stake.scale.set(1.6,Math.max(2.6,wY-y+2.2),1.6);
   stake.userData.host=true;stake.userData.inspectLabel=label;
   g.add(stake);
   const ring=new THREE.Mesh(torusGeo,M.bronze);
   ring.position.set(sx,0.95,0);
   ring.scale.set(0.45,0.45,0.45);
   ring.userData.host=true;ring.userData.inspectLabel=label;
   g.add(ring);
  }
  const cable=new THREE.Mesh(poleGeo,M.rope);
  cable.position.set(-4.2,0.85,0);
  cable.rotation.z=-Math.PI*0.5;
  cable.scale.set(0.85,8.4,0.85);
  cable.userData.host=true;cable.userData.inspectLabel=label;
  g.add(cable);
  g.userData.host=true;g.userData.inspectLabel=label;
  scene.add(g);
  OBSTACLES.push({x,z,r:4.8});
  REGISTER({
   cls:'furniture',kind:'driftwood-boom',key:'tsunami-driftwood-boom',
   name:label,x,z,y:Math.min(y,wY)-0.5,r:5.2,h:3.5,
   tags:{culture:'generic',setting:'outdoor',job:'forestry',role:'gather:storm-wrack'}
  });
  out.booms++;
  out.groups.push(g);
 }

 if(SKEY==='shoal'){
  addJadeMooring(-152,64,0.25,'Cyclopean carved nephrite Ark-Ward mooring ring on -84 m trench lip');
  addJadeMooring(-158,118,-0.15,'Central nephrite anchor-chain swivel ring (cFlit-qBon trench haul-out)');
  addJadeMooring(-148,166,0.42,'South nephrite storm-cable bollard above escape graben');
  addHydrophoneBuoy(-196,92,'Submerged ceramic-and-nephrite 260 Hz Ghost-Tsunami hydrophone warning buoy');
 }else if(SKEY==='bar'){
  addAshRetort(156,154,0.38,'Coal-fired brick phytomining retort calcining tealcoppice into 22% nickel bio-ore ash');
  addCairn(88,82,0.15,'Nephrite boulder-claim and Prou-Torre approach marker cairn');
  addCairn(128,110,-0.35,'East basalt-and-jade Prou-Torre inundation refuge boundary cairn');
 }else if(SKEY==='drowned'){
  addDriftBoom(48,-108,0.28,'Harpoon-staked tsunami-driftwood harvest boom trapping seasoned Crookshore valley timber');
  addDriftBoom(32,-126,-0.42,'Inner lagoon ship-timber sorting boom and bronze swivel hawser');
  addCairn(-168,-38,0.2,'Hand-cut bituminous coal = 214 barge-coaling bench marker');
 }else if(SKEY==='skerry'){
  addCairn(72,42,0.3,'+49 m megatsunami trimline boundary cairn crowning the safe laterite refuge');
  addJadeMooring(-192,126,-0.5,'Whaler lee-cove nephrite catamaran mooring ring');
 }
 return out;
})();
