// ================================================================= HOST — cultural site reserves & optional trail markers ([draw])
// Registers Hueru-Kuran (>= +65 m), Dzagh-Vardzi, and Hush-Kin reserve sites in KTAGS (zero buildings), plus optional
// ?works=0 outdoor furniture trail cairns, drawdown float-well cap, and Silent Vales nephrite pass-chime (100% textured).
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='crook-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 // Always register the settlement reserve in KTAGS (held clear of buildings)
 if(SITE.reserve&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const R=SITE.reserve,ry=DRAWN_H(R.x,R.z);
  KTAGS.page.add({
   id:R.id,name:R.name,class:'site',at:[R.x,ry,R.z],r:R.r,h:18,
   tags:{biome:'crook',culture:R.culture,elevASL:+(SITE.baseElevM+ry).toFixed(1)}
  });
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

 if(on){
  if(SKEY==='shore'){
   // Three columnar-basalt & whale-rib trail cairns marking the +65 m tsunami safety crest + sunken drawdown float-well cap
   const pts=[[76,12],[82,88],[192,162]];
   pts.forEach((p,i)=>{
    const x=p[0],z=p[1],y=DRAWN_H(x,z);
    addPart(new THREE.CylinderGeometry(0.65,0.85,1.25,6),CROOK.M.rockBasalt,x,y+0.52,z,0,i*0.8,0,'Hueru-Kuran +65 m Trimline Basalt Cairn');
    addPart(new THREE.TorusGeometry(0.95,0.09,6,14,Math.PI*0.82),CROOK.M['bark.bone'],x,y+1.22,z,0,i*0.8,0.28,'Pelagic Whale-Rib Trail Arch');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'crook:cairn-shore-'+i,name:'Trimline Whale-Rib Cairn',class:'furniture',at:[x,y,z],r:1.2,h:2.2,tags:{culture:'hueru-kuran',placement:'outdoor',type:'marker'}});
    }
   });
   // Santa Cristina aquifer drawdown step-well cap & nephrite float-rod at (186, 156, y >= +65 m)
   const wx=186,wz=156,wy=DRAWN_H(wx,wz);
   addPart(new THREE.CylinderGeometry(1.45,1.65,0.55,6),CROOK.M.rockBasalt,wx,wy+0.2,wz,0,0.4,0,'Tsunami-Drawdown Step-Well Rim');
   const rod=addPart(new THREE.CylinderGeometry(0.11,0.11,1.65,8),CROOK.M.rockNephrite,wx,wy+0.95,wz,0,0,0,'Nephrite Float-Chime Rod (drops on pre-Ghost-Tsunami drawdown)');
   tick(()=>{rod.position.y=wy+0.95-0.045*CROOK_STATE.drawdownM;});
   REGISTER({tagId:'crook:hueru-kuran-terrace',name:'Hueru-Kuran +84 m Safe Marine Terrace & Drawdown Well',x:SITE.reserve.x,z:SITE.reserve.z,y:wy-3,r:24,h:14,tags:{culture:'hueru-kuran'}});
  }else if(SKEY==='wash'){
   // Two notched nephrite-skarn prospector claim stelae on the Dzagh-Vardzi chasm promontory & skarn toe
   const pts=[[SITE.reserve.x,SITE.reserve.z],[-48,-46]];
   pts.forEach((p,i)=>{
    const x=p[0],z=p[1],y=DRAWN_H(x,z);
    addPart(new THREE.BoxGeometry(0.55,1.85,0.34),CROOK.M.rockGneiss,x,y+0.82,z,0,0.35*i,0,'Dzagh-Vardzi Skarn Claim Stele');
    addPart(new THREE.CylinderGeometry(0.24,0.24,0.16,8),CROOK.M.rockNephrite,x,y+1.42,z,Math.PI*0.5,0.35*i,0,'Inlaid Nephrite Lode Medallion');
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'crook:stele-wash-'+i,name:'Vardzieti Nephrite Claim Stele',class:'furniture',at:[x,y,z],r:0.9,h:2.0,tags:{culture:'dzagh-vardzi',placement:'outdoor',type:'marker'}});
    }
   });
   const ry=DRAWN_H(SITE.reserve.x,SITE.reserve.z);
   REGISTER({tagId:'crook:dzagh-vardzi-spur',name:'Dzagh-Vardzi Chasm-Bridge Spur Reserve',x:SITE.reserve.x,z:SITE.reserve.z,y:ry-4,r:22,h:14,tags:{culture:'dzagh-vardzi'}});
  }else{
   // Hush-Kin carved granite boundary cairns & suspended nephrite pass-chime along the Silent Vales Great Hush threshold (x = 195)
   const lx=SITE.hushPass.lineX;
   [-62,-35,-8].forEach((lz,i)=>{
    const ly=DRAWN_H(lx,lz);
    addPart(new THREE.CylinderGeometry(0.52,0.78,1.55,7),CROOK.M.rockGranite,lx,ly+0.68,lz,0,i*0.6,0,'Hush-Kin Silent-Hand Boundary Cairn');
    if(i===1){
     addPart(new THREE.BoxGeometry(0.14,0.88,0.46),CROOK.M.rockNephrite,lx,ly+1.78,lz,0,0.15,0,'Tuned Nephrite Pass-Chime (pure sinusoidal tone carries inside The Great Hush)');
    }
    if(typeof KTAGS!=='undefined'&&KTAGS.page){
     KTAGS.page.add({id:'crook:cairn-hush-'+i,name:'Silent Vales Boundary Cairn',class:'furniture',at:[lx,ly,lz],r:1.1,h:2.3,tags:{culture:'hush-kin',placement:'outdoor',type:'marker'}});
    }
   });
  }
 }
 return{group:group,items:items};
})();
