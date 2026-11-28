// ================================================================= HOST — Dalab & Fellgang pass reserves, ?works=0 cairns & KHAZ volumes ([draw])
// Pre-draw registers all core/tags site:* reserves (zero class: 'building'!), placed KHAZ hazards (quakingbog, thinice,
// rockfall, hypoxiaceiling), and optional ?works=0 drystone Dalab pass way-cairns & prayer-poles (class: 'furniture').
(function(){
 const WQ=new URLSearchParams(location.search);
 const SHOW_WORKS=WQ.get('works')!=='0';

 // Provide KHAZ ambient thin-air (< 0.76 atm exertion, < 0.60 atm lethal ceiling!) and cold fields after core/tags (50-52) is loaded
 if(typeof KHAZ!=='undefined'&&typeof KHAZ.provide==='function'){
  KHAZ.provide('pressure',(x,y)=>SWOW_PHYS.pressureAt(SITE.baseElevM+(y==null?0:y)));
  KHAZ.provide('temperature',(x,y)=>SWOW_PHYS.transectAt(SITE.px[1],SITE.baseElevM+(y==null?0:y)).tcC);
 }

 // 1. Register site:* reserves into KTAGS & REG (zero permanent buildings!)
 if(SITE.reserves&&SITE.reserves.length){
  for(let i=0;i<SITE.reserves.length;i++){
   const rv=SITE.reserves[i],ry=DRAWN_H(rv.x,rv.z);
   REGISTER({
    tagId:rv.id,
    name:rv.name,
    tagClass:'landmark',
    x:rv.x,y:ry-1.0,z:rv.z,r:rv.r,h:18,
    tags:{biome:'swouterwall',reserve:true,polity:SKEY==='morainetarn'?'fellgang':'dalab'}
   });
  }
 }

 // 2. Register placed KHAZ hazard records before drawing
 function addHazardVolume(id,name,kindKey,x,z,r,h,yOff){
  const spec=KHAZ.make(SWOW_PHYS.hazardSpec(kindKey));
  const gy=DRAWN_H(x,z)+(yOff==null?0:yOff);
  const rec=KTAGS.page.add({
   id:id,
   name:name,
   class:'feature',
   kind:'hazard',
   at:[x,gy,z],
   r:r,
   h:h,
   tags:{biome:'swouterwall',hazard:spec}
  });
  HAZARDS.push(rec);
  REGISTER({
   name:name,
   x:x,y:gy-1.5,z:z,r:r,h:h+4
  });
  return rec;
 }

 if(SKEY==='boreallakes'){
  addHazardVolume('swow:quakingbog-upper','Buoyant Quaking Sphagnum Fen Sink-Zone','quakingbog',-104,30,26,4,-0.5);
  addHazardVolume('swow:quakingbog-lower','Lower Tarn Quaking Peat-Raft Sink-Zone','quakingbog',94,-40,28,4,-0.5);
 }else if(SKEY==='morainetarn'){
  addHazardVolume('swow:rockfall-cirque','Western Cirque Frost-Wedged Megabreccia Chute','rockfall',-176,-42,32,24,0);
 }else if(SKEY==='trigemini'){
  addHazardVolume('swow:thinice-north','Trigemini Tarn Fractured North Shore-Ice Lead','thinice',-12,-46,34,4,-0.5);
  addHazardVolume('swow:thinice-south','Trigemini Tarn Katabatic South Ice-Edge','thinice',16,54,34,4,-0.5);
 }else{
  // Station 4 (breathvale): visible hypoxia ceiling hazard band on the northern megabreccia headwall (< 0.60 atm above +6,465 m ASL!)
  addHazardVolume('swow:hypoxiaceiling-north','Outer-Wall < 0.60 atm Lethal Hypoxia Headwall Ceiling','hypoxiaceiling',0,-255,165,180,-45);
  addHazardVolume('swow:rockfall-east','Breath-Vale Frost-Shattered Megabreccia Scree Chute','rockfall',144,-84,38,58,-12);
 }

 // 3. Optional ?works=0 drystone Dalab / Fellgang pass way-cairns & wind-whipped prayer-poles (class: 'furniture')
 if(!SHOW_WORKS)return;

 const CAIRN_LINES=SKEY==='trigemini'
  ?[[56,-44],[88,-68],[122,-94],[158,-118],[-64,-28],[-114,-18]]
  :SKEY==='breathvale'
  ?[[66,56],[48,54],[22,12],[-14,-48],[18,-86]]
  :SKEY==='morainetarn'
  ?[[92,-48],[98,-12],[102,28]]
  :[[-96,-58],[-52,-36]];

 const grp=new THREE.Group();
 grp.name='swow-way-cairns';
 grp.userData.host=true;

 const cobbleGeo=new THREE.IcosahedronGeometry(1,2);
 const poleGeo=new THREE.CylinderGeometry(0.055,0.075,1,6);
 const flagGeo=new THREE.PlaneGeometry(1.15,0.32,4,1);

 for(let i=0;i<CAIRN_LINES.length;i++){
  const pt=CAIRN_LINES[i],cx=pt[0],cz=pt[1],cy=DRAWN_H(cx,cz);
  const cId='swow:way-cairn-'+SKEY+'-'+i;
  KTAGS.page.add({
   id:cId,
   name:SKEY==='trigemini'?'Dalab Trigemini High-Pass Drystone Way-Cairn & Prayer-Pole':'Highland Pass Drystone Route Cairn',
   class:'furniture',
   kind:'cairn',
   at:[cx,cy,cz],
   r:1.8,
   h:3.4,
   tags:{biome:'swouterwall',works:'way-cairn',culture:SKEY==='morainetarn'?'fellgang':'dalab'}
  });

  // Stacked drystone cairn tiers (zero BoxGeometry!)
  let curY=cy-0.12;
  for(let t=0;t<4;t++){
   const rad=0.72-t*0.13,ht=0.34-t*0.04;
   const stMesh=new THREE.Mesh(cobbleGeo,SWOW.M.rockGranite);
   stMesh.position.set(cx+0.04*(KRAND.unit(KRAND.hash(9400,i,t))-0.5),curY+ht*0.5,cz);
   stMesh.scale.set(rad,ht,rad*0.92);
   stMesh.rotation.y=KRAND.unit(KRAND.hash(9401,i,t))*TAU;
   stMesh.castShadow=true;stMesh.receiveShadow=true;
   stMesh.userData.host=true;
   stMesh.userData.inspectLabel='Dalab High-Pass Drystone Way-Cairn (?works=0 hides)';
   grp.add(stMesh);
   curY+=ht*0.78;
  }

  // Larch pass-pole & wind-streamed courier pennant on Trigemini & Breath-Vale cairns
  if(SKEY==='trigemini'||SKEY==='breathvale'||i===0){
   const pH=2.45;
   const pole=new THREE.Mesh(poleGeo,SWOW.M.woodPole);
   pole.position.set(cx,cy+pH*0.5,cz);
   pole.scale.set(1,pH,1);
   pole.rotation.z=-0.06;
   pole.castShadow=true;pole.userData.host=true;
   pole.userData.inspectLabel='Dalab Courier Pass-Marker Larch Pole';
   grp.add(pole);

   const flag=new THREE.Mesh(flagGeo,SWOW.M.clothPrayer);
   const wAng=Math.atan2(SITE.wind[1],SITE.wind[0]);
   flag.position.set(cx+Math.cos(wAng)*0.58,cy+pH-0.24,cz+Math.sin(wAng)*0.58);
   flag.rotation.y=-wAng;
   flag.userData.host=true;
   flag.userData.inspectLabel='Saffron Dalab High-Pass Wind Pennant';
   grp.add(flag);
  }
 }
 scene.add(grp);
})();
