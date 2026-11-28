// ================================================================= HOST — site:* reserves, KHAZ, kits/resources meteoric nodes, Yuni shrines & bandit works ([draw])
// Implements:
//   1. Frontier reserves (site:yuni-pioneer-homestead, site:ricochet-bandit-gate, site:yuni-bath-claim, site:bandit-shore-camp,
//      site:yuni-glass-claim, site:erebus-ice-refuge) registered in KTAGS strictly as class: 'landmark' (zero class: 'building'!)
//   2. Station-specific KHAZ hazards (ricochet:coldpool, ricochet:bandit_notch, ricochet:scald, ricochet:co2, ricochet:rim_hypoxia)
//   3. Meteoritic iron, nickel & gold resource nodes registered via kits/resources RES_GEO.register BEFORE drawing 3D outcrops
//   4. Optional (?works!=0) frontier structures (class: 'furniture', outside reserve cores, registered BEFORE drawing):
//      - Curved Yuni rammed-earth & Gaudi trencadis-mosaic wayside shrine under a steep snow-shedding spruce-shingle parabolic hood!
//      - Ricochet bandit timber abatis (chevaux-de-frise) & breccia-and-spruce watch-platform!
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='ricochetpeaks-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 // 1. Register Yuni pioneer & Bandit frontier reserves in KTAGS (strictly class: 'landmark', zero class: 'building'!)
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
    tags:{biome:'ricochetpeaks',culture:R.culture||'yuni',role:'reserve'}
   });
   REGISTER({tagId:R.id+':bench',tagClass:'landmark',name:R.name,x:R.x,y:ry-2,z:R.z,r:R.r,h:20,tags:{culture:R.culture||'yuni'}});
  }
 }

 // 2. Register station-specific KHAZ hazards BEFORE drawing
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,y,z,r,h,spec)=>{
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'ricochetpeaks',hazard:KHAZ.make(spec)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  if(SKEY==='ringlake'){
   regHaz('ricochet:coldpool-ringlake','Nighttime -20 C Katabatic Cold-Air Moat Hollow',-215,3.2,0,48,10,RICOCHET_PHYS.hazardSpec('coldpool'));
  }else if(SKEY==='notch'){
   regHaz('ricochet:bandit_notch','Skippers Notch 180 m Ambush Bottleneck & Venturi Gust Throat',0,24.5,0,56,18,RICOCHET_PHYS.hazardSpec('bandit_notch'));
   regHaz('ricochet:rim_hypoxia-notch','Upper Suevite Septum Thin-Air Crest',0,115.0,-280,65,45,RICOCHET_PHYS.hazardSpec('rim_hypoxia'));
  }else if(SKEY==='vents'){
   regHaz('ricochet:scald','East Hearth 74 C Boiling Sinter Apron & Fumaroles',-58,9.2,-18,38,14,RICOCHET_PHYS.hazardSpec('scald'));
   regHaz('ricochet:co2','East Hearth Fumarole CO2/H2S Steam Pocket',148,6.2,-44,24,8,RICOCHET_PHYS.hazardSpec('co2'));
  }else if(SKEY==='glasssheet'){
   regHaz('ricochet:coldpool-glass','Glass-Pan Radiative Frost-Hollow Basin',18,2.4,-14,52,9,RICOCHET_PHYS.hazardSpec('coldpool'));
  }else{
   regHaz('ricochet:rim_hypoxia','Old Rim +5,100 m Hypoxic Cryofumarole Bowl (0.82 atm)',0,8.0,0,180,45,RICOCHET_PHYS.hazardSpec('rim_hypoxia'));
   regHaz('ricochet:scald-erebus','Erebus Steam-Ice Chimney Boiling Throat',-42,6.5,-18,16,16,RICOCHET_PHYS.hazardSpec('scald'));
   regHaz('ricochet:co2-erebus','Warm Steam-Cave CO2 Sump',-92,8.5,-54,18,8,RICOCHET_PHYS.hazardSpec('co2'));
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

 // 3. Register & draw kits/resources meteoritic iron, nickel & gold nodes (registered BEFORE drawing!)
 const regNodeRecs=[];
 if(SITE.resNodes&&SITE.resNodes.length&&typeof RES_GEO!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const recs=RES_GEO.register(KTAGS.page,SITE.resNodes,{height:DRAWN_H});
  for(let i=0;i<SITE.resNodes.length;i++){
   const n=SITE.resNodes[i],rec=recs[i];
   regNodeRecs.push(rec);
   const y0=DRAWN_H(n.x,n.z);
   REGISTER({
    name:'Meteoritic '+n.kind+' resource node ('+n.grade+' grade; kits/resources)',
    x:n.x,y:y0-1.0,z:n.z,r:6.5,h:5.5,
    tags:{biome:'ricochetpeaks',resource:{id:n.id,kind:n.kind,grade:n.grade}}
   });
   const rank=n.grade==='high'?2:(n.grade==='medium'?1:0);
   const sc=1.0+0.32*rank;
   const hostMat=SKEY==='glasssheet'?RICOCHET.M.stoneTagamite:RICOCHET.M.rockSuevite;
   const veinMat=n.kind==='nickel'?RICOCHET.M.oreNickel:(n.kind==='gold'?RICOCHET.M.oreGold:RICOCHET.M.oreIron);
   const qzMat=n.kind==='gold'?RICOCHET.M.oreQuartz:hostMat;
   for(let b=0;b<4+rank;b++){
    const u=KRAND.unit(KRAND.hash(9600+i*19,b,1)),a=(b/(4+rank))*TAU+0.4*u;
    const rad=b===0?0:(0.9+0.8*u)*sc;
    const bx=n.x+Math.cos(a)*rad,bz=n.z+Math.sin(a)*rad,by=DRAWN_H(bx,bz);
    const bh=(0.85+0.55*((b%2)+rank*0.4))*sc,br=(0.65+0.35*u)*sc;
    addPart(new THREE.DodecahedronGeometry(br,1),b===1?qzMat:hostMat,bx,by+bh*0.28,bz,0.22*(u-0.5),a,0.18*(u-0.5),
     'Meteoritic '+n.kind.toUpperCase()+' Impactor Outcrop ('+n.grade+' grade)');
    addPart(new THREE.CylinderGeometry(br*0.52,br*0.64,bh*0.48,7),veinMat,bx,by+bh*0.54,bz,0.18,a+0.5,-0.15,
     n.kind==='nickel'?'Brassy-Silver Meteoritic Taenite-Nickel Sulphide Vein'
     :(n.kind==='gold'?'Impact-Hydrothermal Native Gold & Shocked Quartz Reef':'Meteoritic Iron-Gossan Impactor Fragment'));
   }
  }
 }

 // 4a. Curved Yuni rammed-earth & Gaudi trencadis-mosaic wayside shrine under a steep snow-shedding spruce-shingle hood!
 function addYuniSnowShrine(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const tagId='ricochet:yuni-shrine-'+SKEY+'-'+idx;
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:tagId,
    name:'Pioneering Yuni Curved Rammed-Earth, Gaudi-Mosaic & Steep Snow-Shingle Wayside Shrine',
    class:'furniture',
    at:[x,y0,z],
    r:2.6,
    h:5.4,
    tags:{culture:'yuni',setting:'outdoor',frontier:'boreal-hybrid'}
   });
  }
  REGISTER({
   name:'Pioneering Yuni Curved Adobe, Gaudi-Mosaic & Snow-Shingle Shrine',
   x:x,y:y0-0.5,z:z,r:3.2,h:5.6,
   tags:{culture:'yuni',role:'shrine'}
  });
  // Suevite cobble frost-plinth
  addPart(new THREE.CylinderGeometry(1.85,2.15,0.52,12),RICOCHET.M.rockSuevite,x,y0+0.18,z,0,yaw,0,'Suevite Cobble Frost-Plinth');
  // Thick curved Sahel-Yuni rammed-earth & geothermal clay sanctuary drum
  addPart(new THREE.CylinderGeometry(1.18,1.42,2.15,14),RICOCHET.M.earthYuni,x,y0+1.45,z,0,yaw,0,'Curved Yuni Geothermal-Clay & Rammed-Earth Wall');
  // Colorful broken-quartz & glazed ceramic Gaudi trencadis mosaic belly-frieze & arched niche collar!
  addPart(new THREE.TorusGeometry(1.26,0.16,10,20),RICOCHET.M.mosaicYuni,x,y0+1.58,z,Math.PI*0.5,yaw,0,'Gaudi Trencadis Broken-Ceramic & Quartz Mosaic Frieze');
  addPart(new THREE.TorusGeometry(0.52,0.11,8,14,Math.PI),RICOCHET.M.mosaicYuni,
   x+Math.sin(yaw)*1.24,y0+1.42,z+Math.cos(yaw)*1.24,0,yaw,0,'Gaudi Mosaic Lantern Niche Arch');
  // Steep sweeping parabolic "witch-hat" spruce-shingle snow-shedding hood (adapted by Yuni settlers to shed 2 m crater snow!)
  addPart(new THREE.ConeGeometry(2.15,1.05,14),RICOCHET.M.roofShingle,x,y0+2.92,z,0,yaw,0,'Sweeping Lower Spruce-Shingle Snow-Eave Skirt');
  addPart(new THREE.ConeGeometry(1.48,2.15,14),RICOCHET.M.roofShingle,x,y0+4.18,z,0,yaw,0,'Steep 62-Degree Snow-Shedding Spruce-Shingle Parabolic Hood');
  addPart(new THREE.SphereGeometry(0.22,10,8),RICOCHET.M.mosaicYuni,x,y0+5.32,z,0,yaw,0,'Glazed Ceramic Mosaic Finial Orb');
 }

 // 4b. Ricochet Bandit timber abatis (chevaux-de-frise) & suevite-and-spruce notch watch-platform (class: 'furniture')
 function addBanditAbatis(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const tagId='ricochet:bandit-abatis-'+SKEY+'-'+idx;
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:tagId,
    name:'Skippers Bandit Sharpened Spruce Chevaux-de-Frise Abatis',
    class:'furniture',
    at:[x,y0,z],
    r:2.8,
    h:2.2,
    tags:{culture:'bandit',setting:'outdoor',role:'toll-barrier'}
   });
  }
  REGISTER({name:'Ricochet Bandit Timber Abatis Barrier',x:x,y:y0-0.4,z:z,r:3.2,h:2.4,tags:{culture:'bandit'}});
  const ca=Math.cos(yaw),sa=Math.sin(yaw);
  // Heavy horizontal spine log
  addPart(new THREE.CylinderGeometry(0.16,0.18,4.4,8),RICOCHET.M.woodCedar,x,y0+0.78,z,0,yaw,Math.PI*0.5,'Bandit Toll-Gate Spruce Spine Beam');
  for(let k=-2;k<=2;k++){
   const ox=x+ca*k*0.85,oz=z-sa*k*0.85;
   addPart(new THREE.ConeGeometry(0.11,2.35,6),RICOCHET.M.woodCedar,ox,y0+0.92,oz,0.68,yaw,0,'Sharpened Crater-Spruce Abatis Stake');
   addPart(new THREE.ConeGeometry(0.11,2.35,6),RICOCHET.M.woodCedar,ox,y0+0.92,oz,-0.68,yaw,0,'Sharpened Crater-Spruce Abatis Stake');
  }
 }

 function addBanditWatchPlatform(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const tagId='ricochet:bandit-watch-'+SKEY+'-'+idx;
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:tagId,
    name:'Notch-Lords Suevite & Spruce Toll-Eyrie Watch-Platform',
    class:'furniture',
    at:[x,y0,z],
    r:2.6,
    h:4.8,
    tags:{culture:'bandit',setting:'outdoor',role:'watch-platform'}
   });
  }
  REGISTER({name:'Ricochet Bandit Notch Watch-Platform',x:x,y:y0-0.5,z:z,r:3.2,h:5.0,tags:{culture:'bandit'}});
  addPart(new THREE.CylinderGeometry(1.75,2.05,0.65,10),RICOCHET.M.rockSuevite,x,y0+0.25,z,0,yaw,0,'Dry-Laid Suevite Breccia Bastion Base');
  for(let sx=-1;sx<=1;sx+=2)for(let sz=-1;sz<=1;sz+=2){
   addPart(new THREE.CylinderGeometry(0.13,0.16,3.4,7),RICOCHET.M.woodCedar,x+sx*1.05,y0+2.15,z+sz*1.05,0,yaw,0,'Peeled Crater-Spruce Watch-Post');
  }
  addPart(new THREE.CylinderGeometry(1.85,1.85,0.22,8),RICOCHET.M.woodCedar,x,y0+3.35,z,0,yaw,0,'Timber Lookout Deck');
  addPart(new THREE.CylinderGeometry(1.88,1.80,0.72,8,1,true),RICOCHET.M.roofShingle,x,y0+3.82,z,0,yaw,0,'Split-Larch Arrow-Parapet Breastwork');
 }

 if(on){
  if(SITE.shrines){
   for(let i=0;i<SITE.shrines.length;i++){
    const sh=SITE.shrines[i];
    addYuniSnowShrine(sh.x,sh.z,sh.yaw,i);
   }
  }
  if(SITE.banditWorks){
   for(let i=0;i<SITE.banditWorks.length;i++){
    const bw=SITE.banditWorks[i];
    if(bw.kind==='abatis')addBanditAbatis(bw.x,bw.z,bw.yaw,i);
    else addBanditWatchPlatform(bw.x,bw.z,bw.yaw,i);
   }
  }
 }

 return{group:group,items:items,resNodes:regNodeRecs,enabled:on};
})();
