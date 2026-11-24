// ================================================================= HOST — site:* reserves, KHAZ hazards & ?works=0 High-Ria stelae ([draw])
// Registers High-Ria (Liwa-Toga) & Ancient Karst-Arcology site:* reserves strictly free of any class === 'building' records,
// binds all 4 Springhollows KHAZ hazards (shutin, fenestre, sump, crystal) + KKARST.hazards, and when ?works!=0 places
// carved cream-dolomite spring-gauge stelae with Calamine Brass (Cu+Zn) plaques and cypress skiff portage rollers (class: 'furniture').
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='springhollows-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 // 1. Register settlement & transit reserves in KTAGS (strictly class: 'landmark', zero class: 'building'!)
 if(SITE.reserves&&SITE.reserves.length&&typeof KTAGS!=='undefined'&&KTAGS.page){
  for(let i=0;i<SITE.reserves.length;i++){
   const R=SITE.reserves[i],ry=DRAWN_H(R.x,R.z);
   KTAGS.page.add({
    id:R.id,
    name:R.name,
    class:'landmark',
    at:[R.x,ry,R.z],
    r:R.r,
    h:22,
    tags:{biome:'springhollows',culture:R.culture||'xanadu',role:'reserve'}
   });
   REGISTER({tagId:R.id+':bench',tagClass:'landmark',name:R.name,x:R.x,y:ry-2,z:R.z,r:R.r,h:20,tags:{culture:R.culture||'xanadu'}});
  }
 }

 // 2. Register data-driven KHAZ hazards (shutin, fenestre, sump, crystal) + KKARST.hazards
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,y,z,r,h,spec)=>{
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'springhollows',hazard:KHAZ.make(spec)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  if(SKEY==='spring'){
   regHaz('springhollows:sump','Cav Ozarks Resurgence Artesian Throat Sump',-62,-5.8,0,22,8,HOLLOW_PHYS.hazardSpec('sump'));
  }else if(SKEY==='shutin'){
   regHaz('springhollows:shutin','Tlila-Wada Red-Porphyry Shut-In Whitewater Chute',0,2.5,0,46,12,HOLLOW_PHYS.hazardSpec('shutin'));
  }else if(SKEY==='fenestre'){
   regHaz('springhollows:fenestre','18 m Sinkhole Fern-Fenestre Skylight Drop Lip',10,2.2,8,14,32,HOLLOW_PHYS.hazardSpec('fenestre'));
   regHaz('springhollows:sump','Spider Lake Sub-Escarpment Phreatic Sump Pool',38,-25.4,24,18,6,HOLLOW_PHYS.hazardSpec('sump'));
   regHaz('springhollows:crystal','Condensate-Wet Celestine Megacrystal Beam Span',18,-25.5,16,32,14,HOLLOW_PHYS.hazardSpec('crystal'));
  }else{
   regHaz('springhollows:fenestre','Onyx Kipuka Skylight Drop Perimeter',-38,3.2,-36,12,20,HOLLOW_PHYS.hazardSpec('fenestre'));
  }
  if(CAVERN&&CAVERN.karstNet&&typeof KKARST!=='undefined'&&typeof KKARST.hazards==='function'){
   const kh=KKARST.hazards(CAVERN.karstNet);
   for(let i=0;i<Math.min(kh.length,8);i++){
    const rec=Object.assign({},kh[i],{id:'springhollows:karst-'+SKEY+'-'+i,class:'feature'});
    try{KTAGS.page.add(rec);HAZARDS.push(rec);}catch(e){}
   }
  }
 }

 const addPart=(geo,mat,x,y,z,rx,ry,rz,label)=>{
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  m.rotation.set(rx,ry,rz);
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.inspectLabel=label;
  group.add(m);
  items.push(m);
  return m;
 };

 // High-Ria (Liwa-Toga) cut cream-dolomite spring-gauge stela with Calamine Brass water-mark plaque
 function addSpringGaugeStela(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  addPart(new THREE.BoxGeometry(1.15,0.38,1.15),SPRINGHOLLOWS.M.rockPorphyry,x,y0+0.16,z,0,yaw,0,'Imperial Red-Porphyry Stela Plinth');
  addPart(new THREE.BoxGeometry(0.68,2.65,0.52),SPRINGHOLLOWS.M.stoneAshlar,x,y0+1.65,z,0,yaw,0,'High-Ria Cut Cream-Dolomite Spring-Gauge Stela');
  addPart(new THREE.CylinderGeometry(0.18,0.48,0.42,4),SPRINGHOLLOWS.M.stoneAshlar,x,y0+3.18,z,0,yaw+Math.PI*0.25,0,'Carved Dolomite Pyramidion Cap');
  const ca=Math.cos(yaw),sa=Math.sin(yaw);
  addPart(new THREE.BoxGeometry(0.42,1.15,0.06),SPRINGHOLLOWS.M.worksBrass,x+sa*0.28,y0+1.72,z+ca*0.28,0,yaw,0,'High-Ria Calamine Brass (Cu+Zn) Discharge Gauge Plaque');
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'springhollows:stela-'+SKEY+'-'+idx,
    name:'High-Ria Cut-Dolomite & Calamine-Brass Spring-Gauge Stela',
    class:'furniture',
    at:[x,y0,z],
    r:1.0,
    h:3.4,
    tags:{culture:'xanadu',setting:'outdoor',style:'high-ria'}
   });
  }
 }

 // Bald-cypress skiff landing / boat-lift portage roller cradle (outside reserve core!)
 function addPortageRoller(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const ca=Math.cos(yaw),sa=Math.sin(yaw);
  for(let s=-1;s<=1;s+=2){
   addPart(new THREE.BoxGeometry(0.24,0.28,3.6),SPRINGHOLLOWS.M.woodCypress,x+ca*0.95*s,y0+0.12,z-sa*0.95*s,0,yaw,0,'Bald-Cypress Barge Portage Stringer');
  }
  for(let r=-1;r<=1;r++){
   const rx=x+sa*r*1.1,rz=z+ca*r*1.1;
   addPart(new THREE.CylinderGeometry(0.11,0.11,1.76,10),SPRINGHOLLOWS.M.woodCypress,rx,y0+0.22,rz,0,yaw,Math.PI*0.5,'Cypress Skiff Roller Drum');
   addPart(new THREE.CylinderGeometry(0.125,0.125,0.10,10),SPRINGHOLLOWS.M.worksBrass,rx,y0+0.22,rz,0,yaw,Math.PI*0.5,'Calamine Brass Roller Collar');
  }
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'springhollows:roller-'+SKEY+'-'+idx,
    name:'Bald-Cypress & Calamine-Brass Skiff Portage Roller',
    class:'furniture',
    at:[x,y0,z],
    r:2.1,
    h:0.5,
    tags:{culture:'xanadu',setting:'outdoor',style:'high-ria'}
   });
  }
 }

 if(on){
  if(SKEY==='spring'){
   addSpringGaugeStela(22,-28,0.35,0);
   addSpringGaugeStela(-26,32,2.65,1);
   addPortageRoller(36,-26,0.18,0);
  }else if(SKEY==='shutin'){
   // Flanking approach markers outside the site:high-ria-boatlift core reserve
   addSpringGaugeStela(-64,-44,0.22,0);
   addSpringGaugeStela(68,-42,-0.25,1);
   addPortageRoller(-56,-52,0.08,0);
   addPortageRoller(62,-50,-0.08,1);
  }else if(SKEY==='fenestre'){
   addSpringGaugeStela(-22,-16,0.72,0);
   addSpringGaugeStela(18,-18,-0.65,1);
  }else{
   addSpringGaugeStela(-18,-38,0.45,0);
   addSpringGaugeStela(24,62,-0.32,1);
  }
 }

 return{group:group,items:items,enabled:on};
})();
