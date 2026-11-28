// ================================================================= HOST — Kanopi weeping oculus (KRUINS.watch), KSPAN chasm logs/bridge, reserves & KHAZ ([draw])
// Implements:
//   - Pre-draw registration of all Timpar-Kuran site:* settlement reserves (class: 'landmark', zero class: 'building'!)
//   - Pre-draw registration of all 5 Veiled Mountains KHAZ hazard volumes
//   - Station 3 (kanopi): Colossal 95 m-diameter tilted circular Ancient arcology canopy-oculus / intake turbine embedded in the
//     megabreccia cliffside (image_8!), with seated bronze/concrete rib wreckage watched by KRUINS.watch!
//   - Station 2 (gorge): Wedged giant KSPAN nurse-logs across the mossy chasm + optional ?works=0 split-cedar footbridge (image_4!)
//   - Optional ?works=0 Timpar-Kuran carved cedar & shaved-wood inau trail/ambush markers (class: 'furniture', placement: 'outdoor')
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='veil-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 // 1. Register Timpar-Kuran settlement & shrine reserves in KTAGS (strictly class: 'landmark', zero class: 'building'!)
 if(SITE.reserves&&SITE.reserves.length&&typeof KTAGS!=='undefined'&&KTAGS.page){
  for(let i=0;i<SITE.reserves.length;i++){
   const R=SITE.reserves[i],ry=DRAWN_H(R.x,R.z);
   KTAGS.page.add({
    id:R.id,
    name:R.name,
    class:'landmark',
    at:[R.x,ry,R.z],
    r:R.r,
    h:24,
    tags:{biome:'veiledmountains',culture:R.culture||'timpar-kuran',role:'reserve'}
   });
   REGISTER({tagId:R.id+':bench',tagClass:'landmark',name:R.name,x:R.x,y:ry-2,z:R.z,r:R.r,h:22,tags:{culture:R.culture||'timpar-kuran'}});
  }
 }

 // 2. Register station-specific KHAZ hazards BEFORE drawing
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,y,z,r,h,spec)=>{
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'veiledmountains',hazard:KHAZ.make(spec)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  regHaz('veil:whiteout-'+SKEY,'Cloud-Belt & Valley-Floor Mist Whiteout Screen',0,12,0,145,48,VEIL_PHYS.hazardSpec('whiteout'));
  if(SKEY==='hall'){
   regHaz('veil:plunge_torrent','Mist-Valley-2 Cold Snowmelt Salmon Run',0,0.5,0,28,6,VEIL_PHYS.hazardSpec('torrent'));
  }else if(SKEY==='gorge'){
   regHaz('veil:plunge_torrent','Sol-Cleft Two-Tier Cataract & +4 C Jade Plunge Pool',8,4.0,0,42,32,VEIL_PHYS.hazardSpec('torrent'));
   regHaz('veil:moss_crevasse','Slick Moss-Upholstered Megabreccia Chasm Lip',-10,14.0,0,26,22,VEIL_PHYS.hazardSpec('chasm'));
  }else if(SKEY==='kanopi'){
   regHaz('veil:plunge_torrent','Kanopi 65 m Weeping Oculus Waterfall Plunge Zone',-16,12.0,0,36,72,VEIL_PHYS.hazardSpec('torrent'));
  }else if(SKEY==='veilpass'){
   regHaz('veil:avalanche_chute','Veilpass Active Wet-Slab & Rockfall Slide-Alder Chutes',22,18.0,42,46,45,VEIL_PHYS.hazardSpec('avalanche'));
   regHaz('veil:hypoxia','High Megabreccia Cirque Rim Hypoxia Zone',185,58.0,0,95,85,VEIL_PHYS.hazardSpec('hypoxia'));
  }else{
   regHaz('veil:moss_crevasse','Hush-Edge Deceptive Cushion-Moss Bridged Boulder Crevasses',12,3.5,-18,48,8,VEIL_PHYS.hazardSpec('chasm'));
  }
 }

 const addMesh=(geo,mat,x,y,z,rx,ry,rz,label,parentGrp)=>{
  if(!geo.attributes.color){
   const n=geo.attributes.position.count,col=new Float32Array(n*3);
   for(let i=0;i<n;i++){col[i*3]=0.88;col[i*3+1]=0.90;col[i*3+2]=0.88;}
   geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  }
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  m.rotation.set(rx,ry,rz);
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.inspectLabel=label;
  (parentGrp||group).add(m);
  items.push(m);
  return m;
 };

 // 3. Station 3 (kanopi): Colossal 95 m-diameter tilted Ancient Kanopi Weeping Oculus (image_8!) watched by KRUINS.watch!
 let kanopiRoot=null;
 if(SKEY==='kanopi'&&SITE.oculus){
  const oc=SITE.oculus;
  // Pre-register the Kanopi Ancient oculus ruin in KTAGS BEFORE drawing!
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'veil:kanopi-weeping-oculus',
    name:'The Weeping Oculus of Kanopi (95 m Ancient Arcology Canopy-Intake Ruin)',
    class:'landmark',
    at:[oc.cx,oc.cy,oc.cz],
    r:oc.outerR+8,
    h:96,
    tags:{biome:'veiledmountains',origin:'ancients',sacred:'utari-kuran',ruin:true}
   });
  }
  REGISTER({
   tagId:'veil:kanopi-oculus-volume',
   tagClass:'landmark',
   name:'The Weeping Oculus of Kanopi (Utari-Kuran Ancestral Ruin)',
   x:oc.cx,y:0,z:oc.cz,r:oc.outerR+10,h:98,
   tags:{origin:'ancients',sacred:'utari-kuran'}
  });

  kanopiRoot=new THREE.Group();
  kanopiRoot.name='kanopi-weeping-oculus';
  kanopiRoot.userData.host=true;
  group.add(kanopiRoot);

  // Tilted structural assembly: centered at (-56, 54, 0), pitched toward +x so its lower rim sits at (-32, 65.4, 0) while its
  // massive lower/rear cowling embeds deeply into the megabreccia cliffside (lowest y <= cliff ground -> mainLow < 0, 1 cluster!)
  const bodyPivot=new THREE.Group();
  bodyPivot.position.set(-56.0,54.0,0.0);
  // Normal of intake face points (+0.82, +0.57, 0): rotate cylinder (axis +y) by z = -0.96 rad!
  bodyPivot.rotation.set(0.08,0.0,-0.96);
  kanopiRoot.add(bodyPivot);

  // Outer 95 m-diameter (R = 47.5 m) stepped concrete cowling drum (extends 44 m back into cliffside so base is firmly grounded!)
  const outerDrum=new THREE.CylinderGeometry(47.5,49.5,46.0,36,2,true);
  addMesh(outerDrum,VEIL.M.ancientConcrete,0,-14.0,0,0,0,0,'Kanopi 95 m Outer Arcology Cowling Drum',bodyPivot);

  // Outer heavy torus rim (R = 46.0, tube = 4.2 m)
  addMesh(new THREE.TorusGeometry(46.0,4.2,12,40),VEIL.M.ancientConcrete,0,9.0,0,Math.PI*0.5,0,0,'Kanopi Outer Coffered Concrete Rim',bodyPivot);

  // Mid stepped bronze-and-concrete stator ring (R = 35.5, tube = 3.6 m)
  addMesh(new THREE.TorusGeometry(35.5,3.6,12,36),VEIL.M.ancientConcrete,0,10.5,0,Math.PI*0.5,0,0,'Kanopi Mid Stator Shroud Ring',bodyPivot);

  // Inner flanged verdigris-bronze oculus throat ring (R = 24.5, tube = 2.8 m) + dark deep intake throat cylinder
  addMesh(new THREE.TorusGeometry(24.5,2.8,12,36),VEIL.M.ancientBronze,0,12.2,0,Math.PI*0.5,0,0,'Kanopi Verdigris-Bronze Inner Oculus Lip',bodyPivot);
  addMesh(new THREE.CylinderGeometry(24.2,22.0,38.0,32,1,true),VEIL.M.ancientConcrete,0,-6.5,0,0,0,0,'Kanopi Flooded Intake Conduit Throat',bodyPivot);

  // 24 radial structural turbine ribs bridging the inner bronze oculus (R=24) to the outer cowling (R=47), overlapping both rings!
  for(let r=0;r<24;r++){
   const ang=(r/24)*TAU;
   // Leave a shattered notch right at the lowest pouring lip (ang near 0, pointing down-east) for the 65 m waterfall!
   if(Math.cos(ang)>0.92)continue;
   const rm=35.5,rx=Math.cos(ang)*rm,rz=Math.sin(ang)*rm;
   const ribMat=r%3===0?VEIL.M.ancientBronze:VEIL.M.ancientConcrete;
   addMesh(new THREE.BoxGeometry(25.0,6.5,2.8),ribMat,rx,9.8,rz,0,-ang,0,'Kanopi Radial Intake Stator Rib',bodyPivot);
  }

  // Deep cliffside anchor keel connecting bodyPivot down to the cliff foot so KRUINS sees 100% solid ground contact
  addMesh(new THREE.CylinderGeometry(18.0,24.0,56.0,16),VEIL.M.ancientConcrete,-64.0,24.0,0.0,0,0,0,'Kanopi Sub-Cliff Intake Foundation Pier',kanopiRoot);

  // Seated fallen rib & flange wreckage blocks on the mossy tarn banks (each seated -0.22 m into lowest corner ground!)
  const wreckSpots=[[26,-34,0.4],[34,30,-0.5],[48,-24,1.1]];
  for(let w=0;w<wreckSpots.length;w++){
   const ws=wreckSpots[w],wx=ws[0],wz=ws[1],wyaw=ws[2];
   const sx=4.2,sy=1.6,sz=2.2;
   // Sample lowest ground across footprint corners so KRUINS low = b[1] - g sits cleanly inside [-0.45, +0.05] m!
   let gMin=DRAWN_H(wx,wz);
   for(const dx of[-2.2,2.2])for(const dz of[-2.2,2.2])gMin=Math.min(gMin,DRAWN_H(wx+dx,wz+dz));
   const cy=gMin-0.22+sy*0.5;
   addMesh(new THREE.BoxGeometry(sx,sy,sz),w===1?VEIL.M.ancientBronze:VEIL.M.ancientConcrete,wx,cy,wz,0,wyaw,0,'Fallen Kanopi Stator Rib Wreckage',kanopiRoot);
  }

  kanopiRoot.updateMatrixWorld(true);
  if(typeof KRUINS!=='undefined'&&typeof KRUINS.watch==='function'){
   KRUINS.watch(kanopiRoot,{name:'kanopi-weeping-oculus',ground:DRAWN_H});
  }
 }

 // 4. Station 2 (gorge): Wedged giant KSPAN nurse-logs across the mossy chasm + optional ?works=0 split-cedar footbridge (image_4!)
 if(SKEY==='gorge'&&SITE.spanLogs&&typeof KSPAN!=='undefined'){
  for(let i=0;i<SITE.spanLogs.length;i++){
   const sl=SITE.spanLogs[i];
   const S=KSPAN.solve(sl.a,sl.b,{sag:sl.sag==null?0.32:sl.sag});
   const pts=KSPAN.points(S,8);
   const ownPrev=BIO.owner;BIO.owner=[(sl.a[0]+sl.b[0])*0.5,0];
   try{
    const tubePts=pts.map((p,k)=>({x:p[0],y:p[1],z:p[2],r:sl.r*lerp(1.06,0.84,k/(pts.length-1))}));
    BIO.tube('vm_log',tubePts,0x4c5c38,{seg:7});
    for(let d=1;d<pts.length-1;d+=2){
     const p=pts[d];
     BIO.put('vm_drape_curtain',[p[0],p[1]-sl.r*0.7,p[2]],qEuler(0,d*1.1,0),[0.85,2.6,0.85],VEIL.C(0x5c8e32));
     BIO.put('vm_swordfern',[p[0],p[1]+sl.r*0.82,p[2]],qEuler(0,d*0.8,0),[0.78,0.72,0.78],VEIL.C(0x38782e));
    }
   }finally{BIO.owner=ownPrev;}
   REGISTER({
    tagId:'veil:wedged-chasm-log-'+i,
    tagClass:'flora',
    name:'Wedged Giant Chasm Nurse-Log Span',
    x:(sl.a[0]+sl.b[0])*0.5,y:sl.b[1]-1.5,z:0,r:16,h:6,
    tags:{biome:'veiledmountains',feature:'chasm-span-log'}
   });
  }

  // Optional ?works=0 split-cedar Timpar-Kuran chasm footbridge (image_4; class: 'furniture', placement: 'outdoor')
  if(on){
   const bx=6.0,by=15.4,halfSpan=16.5;
   if(typeof KTAGS!=='undefined'&&KTAGS.page){
    KTAGS.page.add({
     id:'veil:gorge-cedar-footbridge',
     name:'Timpar-Kuran Split-Cedar Sol-Cleft Chasm Footbridge',
     class:'furniture',
     at:[bx,by,0],
     r:halfSpan,
     h:2.4,
     tags:{culture:'timpar-kuran',placement:'outdoor',setting:'outdoor'}
    });
   }
   for(const sx of[-0.85,0.85]){
    addMesh(new THREE.CylinderGeometry(0.24,0.26,halfSpan*2+3.0,8),VEIL.M.woodCedar,bx+sx,by-0.22,0,Math.PI*0.5,0,0,'Split Red-Cypress Chasm Bridge Stringer');
   }
   for(let p=-14;p<=14;p+=1.4){
    addMesh(new THREE.BoxGeometry(2.3,0.12,0.95),VEIL.M.woodCedar,bx,by,p,0,0,0,'Adzed Red-Cypress Bridge Deck Plank');
   }
   for(const side of[-1.02,1.02]){
    addMesh(new THREE.CylinderGeometry(0.07,0.07,halfSpan*2,6),VEIL.M.woodCedar,bx+side,by+1.05,0,Math.PI*0.5,0,0,'Lashed Cedar Handrail Pole');
    for(const pz of[-14,-7,0,7,14]){
     addMesh(new THREE.CylinderGeometry(0.09,0.11,1.25,6),VEIL.M.woodCedar,bx+side,by+0.55,pz,0,0,0,'Notched Cedar Bridge Stanchion');
    }
   }
  }
 }

 // 5. Optional ?works=0 Timpar-Kuran carved cedar & shaved-willow inau boundary/ambush markers (outside reserve cores!)
 function addInauPost(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'veil:timpar-inau-'+SKEY+'-'+idx,
    name:'Timpar-Kuran Carved Red-Cypress & Shaved-Willow Inau Marker',
    class:'furniture',
    at:[x,y0,z],
    r:0.9,
    h:3.2,
    tags:{culture:'timpar-kuran',placement:'outdoor',setting:'outdoor'}
   });
  }
  addMesh(new THREE.CylinderGeometry(0.46,0.58,0.38,8),VEIL.M.rockMegabreccia,x,y0+0.16,z,0,yaw,0,'Megabreccia Cairn Base');
  addMesh(new THREE.CylinderGeometry(0.15,0.19,2.55,8),VEIL.M.woodCedar,x,y0+1.52,z,0,yaw,0,'Timpar-Kuran Carved Red-Cypress Inau Staff');
  addMesh(new THREE.TorusGeometry(0.22,0.045,7,12),VEIL.M.ancientBronze,x,y0+2.18,z,Math.PI*0.5,0,0,'Salvaged Kanopi Bronze Clan Ring');
 }

 if(on){
  if(SKEY==='hall'){
   addInauPost(64,-34,0.4,0);
   addInauPost(-38,18,-0.6,1);
  }else if(SKEY==='gorge'){
   addInauPost(48,-44,0.3,0);
  }else if(SKEY==='kanopi'){
   addInauPost(56,-32,0.5,0);
   addInauPost(44,32,-0.4,1);
  }else if(SKEY==='veilpass'){
   addInauPost(-74,-22,0.2,0);
   addInauPost(38,-24,-0.3,1);
  }else{
   addInauPost(-62,38,0.4,0);
   addInauPost(24,-14,-0.5,1);
  }
 }

 return{group:group,items:items,kanopi:kanopiRoot,enabled:on};
})();
