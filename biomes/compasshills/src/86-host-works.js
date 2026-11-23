// ================================================================= HOST — arcology/post site reserves & zero-iron bronze/nephrite delver works ([draw])
// Registers site:lodestone-arcology (superconductor salvage reserve), site:ham-tsek-post, site:tors-bronze-quarry &
// site:cuesta-olive-terrace in KTAGS (strictly zero buildings), plus ?works=0 non-ferrous tin-bronze, copper & nephrite-jade
// delver stelae, quarry wedges, gimballed lodestone survey table, and bronze ferry bollards (0 iron tags, 100% textured).
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='compasshills-works';
 group.userData.host=true;
 scene.add(group);
 const items=[],records=[];

 if(typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,z,r,h,haz)=>{
   const y=DRAWN_H(x,z);
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'compasshills',hazard:KHAZ.make(haz)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  regHaz('compass:compassspin-'+SKEY,'Multipolar Remanent Bearing Scramble Field',0,0,320,90,{kind:'luck',effect:'emp',danger:0.35,dose:0.15,falloff:'smooth'});
  if(SKEY==='foundry'){
   SITE.quenchVents.forEach((v,i)=>{
    regHaz('compass:magpull-vent-'+i,'Toroidal Quench-Vent Kelvin Ferrous Pull Zone',v.x,v.z,16,14,{kind:'grab',effect:'hold',danger:0.82,dose:0.45,falloff:'linear'});
   });
  }else if(SKEY==='tors'){
   SITE.torSpires.slice(0,5).forEach((sp,i)=>{
    regHaz('compass:lightning-spire-'+i,'Conductive Magnetite Tor Lightning-Strike Zone',sp.x,sp.z,22,28,{kind:'trap',effect:'shock',danger:0.85,dose:0.50,falloff:'linear'});
    regHaz('compass:magpull-spire-'+i,'High-Grade Lodestone Spire Ferrous Pull',sp.x,sp.z,14,18,{kind:'grab',effect:'hold',danger:0.74,dose:0.40,falloff:'linear'});
   });
  }else if(SKEY==='gorge'){
   regHaz('compass:narrows','Ham-Tsek 1,080 m^3/s Magnetite River Narrows Current',0,0,46,12,{kind:'drown',effect:'drown',danger:0.68,dose:0.35,falloff:'smooth'});
  }
 }

 if(SITE.reserve&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const R=SITE.reserve,ry=DRAWN_H(R.x,R.z);
  const extraTags={biome:'compasshills',culture:R.culture,elevASL:+(SITE.baseElevM+ry).toFixed(1)};
  if(SKEY==='foundry')extraTags.salvage='superconductor';
  KTAGS.page.add({
   id:R.id,name:R.name,class:'site',at:[R.x,ry,R.z],r:R.r,h:20,tags:extraTags
  });
 }

 const addPart=(geo,mat,x,y,z,rx,ry,rz,label,matTag)=>{
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  m.rotation.set(rx,ry,rz);
  m.castShadow=true;m.receiveShadow=true;
  m.userData.host=true;m.userData.inspectLabel=label;m.userData.materialKind=matTag;
  group.add(m);
  items.push(m);
  return m;
 };

 const regWork=(id,name,x,y,z,r,h,matKind,subType)=>{
  const rec={
   id:id,name:name,class:'furniture',at:[x,y,z],r:r,h:h,
   tags:{biome:'compasshills',culture:SITE.reserve?SITE.reserve.culture:'delver-canton',placement:'outdoor',type:subType,material:matKind,zeroIron:true}
  };
  records.push(rec);
  if(typeof KTAGS!=='undefined'&&KTAGS.page)KTAGS.page.add(rec);
 };

 if(on){
  if(SKEY==='foundry'){
   // 1. Three notched nephrite-jade & cast tin-bronze warning stelae ("NO IRON PAST THE THIRD STONE") along TRAIL_PTS
   const stelaePts=[[-192,154],[-154,122],[-118,92]];
   stelaePts.forEach((p,i)=>{
    const x=p[0],z=p[1],y=DRAWN_H(x,z);
    addPart(new THREE.CylinderGeometry(0.58,0.74,0.45,6),COMPASS.M.rockSandstone,x,y+0.18,z,0,i*0.5,0,'Cuesta Sandstone Stele Plinth','stone');
    addPart(new THREE.BoxGeometry(0.46,1.95,0.28),COMPASS.M.rockNephrite,x,y+1.25,z,0,0.42,0,'Notched Nephrite-Jade Zero-Iron Warning Stele #'+(i+1)+' (NO IRON PAST THE THIRD STONE)','nephrite');
    addPart(new THREE.TorusGeometry(0.32,0.055,6,14),COMPASS.M.metalBronze,x,y+1.82,z,0,0.42,0,'Cast Tin-Bronze Magnetic Boundary Ring','tin-bronze');
    regWork('compass:stele-foundry-'+i,'Nephrite & Tin-Bronze Zero-Iron Warning Stele #'+(i+1),x,y,z,1.1,2.3,'tin-bronze','marker');
   });
   // 2. Ceramic-and-nephrite gimballed lodestone survey table & timber-and-bronze tunnel capstan head
   const tx=-134,tz=106,ty=DRAWN_H(tx,tz);
   addPart(new THREE.CylinderGeometry(0.68,0.78,0.92,8),COMPASS.M.rockNephrite,tx,ty+0.42,tz,0,0,0,'Nephrite-Jade Survey Pedestal','nephrite');
   addPart(new THREE.TorusGeometry(0.54,0.045,6,18),COMPASS.M.metalCopper,tx,ty+0.96,tz,Math.PI*0.5,0,0,'Non-Magnetic Copper Gimbal Azimuth Ring','copper');
   const needle=addPart(new THREE.BoxGeometry(0.76,0.06,0.10),COMPASS.M.rockIronstone,tx,ty+1.02,tz,0,0,0,'Suspended Natural Lodestone Survey Pointer','nephrite');
   const mfT=COMPASS_PHYS.fieldAt(tx,tz,'foundry');
   needle.rotation.y=-mfT.azimuthRad;
   regWork('compass:survey-table','Gimballed Lodestone & Copper Survey Table',tx,ty,tz,1.2,1.3,'copper','instrument');

   const cx=-124,cz=98,cy=DRAWN_H(cx,cz);
   addPart(new THREE.CylinderGeometry(0.52,0.62,1.15,8),COMPASS.M['wood.gnarled'],cx,cy+0.52,cz,0,0.2,0,'Iron-Pistache & Tin-Bronze Delver Capstan Drum','wood');
   addPart(new THREE.BoxGeometry(2.35,0.12,0.14),COMPASS.M.metalBronze,cx,cy+1.02,cz,0,0.6,0,'Cast Tin-Bronze Capstan Bar (safeBronze = true)','tin-bronze');
   regWork('compass:bronze-capstan','Timber & Tin-Bronze Delver Capstan',cx,cy,cz,1.4,1.3,'tin-bronze','capstan');
   REGISTER({tagId:'compass:lodestone-delver-gate',name:'Zero-Iron Bronze Delver Trail & Warning Stelae',x:-148,y:ty-2,z:118,r:48,h:14,tags:{culture:'delver-canton'}});
  }else if(SKEY==='tors'){
   // Split lodestone quarry block with non-sparking tin-bronze plug-and-feather wedges + tall verdigris-copper lightning rods
   const qx=-78,qz=64,qy=DRAWN_H(qx,qz);
   addPart(new THREE.BoxGeometry(2.1,1.35,1.45),COMPASS.M.rockIronstone,qx-0.62,qy+0.58,qz,0.04,0.25,0,'Split High-Grade Magnetite-Lodestone Quarry Block','stone');
   addPart(new THREE.BoxGeometry(1.85,1.28,1.40),COMPASS.M.rockIronstone,qx+0.68,qy+0.54,qz,-0.03,0.28,0.05,'Cleaved Lodestone Slab','stone');
   for(let w=0;w<4;w++){
    addPart(new THREE.ConeGeometry(0.09,0.48,5),COMPASS.M.metalBronze,qx+0.02,qy+1.26,qz-0.45+w*0.30,Math.PI,0.25,0,'Non-Sparking Tin-Bronze Plug-and-Feather Wedge','tin-bronze');
   }
   regWork('compass:bronze-quarry-block','Split Lodestone Block with Tin-Bronze Wedges',qx,qy,qz,2.2,1.6,'tin-bronze','quarry');

   const rodPts=[[-62,-48],[22,-54]];
   rodPts.forEach((p,i)=>{
    const rx=p[0],rz=p[1],ry=DRAWN_H(rx,rz);
    addPart(new THREE.CylinderGeometry(0.45,0.62,0.75,6),COMPASS.M.rockGranite,rx,ry+0.32,rz,0,0,0,'Insulated Granite Lightning-Rod Footing','stone');
    addPart(new THREE.CylinderGeometry(0.055,0.085,4.6,7),COMPASS.M.metalCopper,rx,ry+2.65,rz,0,0,0,'Patinated Copper Fulgurite-Harvesting Lightning Rod','copper');
    regWork('compass:copper-rod-'+i,'Copper Tor Lightning-Harvesting Rod #'+(i+1),rx,ry,rz,0.9,5.0,'copper','marker');
   });
   REGISTER({tagId:'compass:tors-quarry-works',name:'East-Scarp Tin-Bronze Lodestone Quarry & Copper Rods',x:qx,y:qy-2,z:qz,r:38,h:16,tags:{culture:'delver-canton'}});
  }else if(SKEY==='cuesta'){
   // Twin nephrite-and-bronze domain-wall meridian markers flanking the 180-deg saddle + sandstone whorl-olive press bed
   [[-18,-22],[0,0],[18,22]].forEach((p,i)=>{
    const mx=p[0],mz=p[1],my=DRAWN_H(mx,mz);
    addPart(new THREE.CylinderGeometry(0.36,0.48,1.45,6),COMPASS.M.rockNephrite,mx,my+0.65,mz,0,i*0.4,0,'Nephrite Domain-Wall Meridian Marker','nephrite');
    const mf=COMPASS_PHYS.fieldAt(mx,mz,'cuesta');
    addPart(new THREE.BoxGeometry(0.85,0.08,0.12),COMPASS.M.metalBronze,mx,my+1.45,mz,0,-mf.azimuthRad,0,'Bronze Flux-Bearing Fin','tin-bronze');
    regWork('compass:domain-marker-'+i,'Domain-Wall Bronze & Nephrite Meridian Post #'+(i+1),mx,my,mz,0.9,1.7,'tin-bronze','marker');
   });
   const ox=92,oz=-72,oy=DRAWN_H(ox,oz);
   addPart(new THREE.CylinderGeometry(1.35,1.45,0.52,12),COMPASS.M.rockSandstone,ox,oy+0.22,oz,0,0,0,'Carved Cuesta Sandstone Whorl-Olive Press Bed','stone');
   addPart(new THREE.CylinderGeometry(0.62,0.62,0.36,10),COMPASS.M.rockGranite,ox+0.25,oy+0.64,oz,Math.PI*0.5,0.4,0,'Granite Olive-Crushing Millstone','stone');
   regWork('compass:olive-press','Cuesta Sandstone Whorl-Olive Millstone',ox,oy,oz,1.6,1.1,'stone','press');
   REGISTER({tagId:'compass:cuesta-terrace-works',name:'Domain-Saddle Meridian Posts & Olive Press',x:0,y:DRAWN_H(0,0)-2,z:0,r:36,h:12,tags:{culture:'delver-canton'}});
  }else{
   // Station 4 (gorge): Non-ferrous cast tin-bronze ferry bollards & nephrite flood-stage stele beside Ham-Tsek narrows
   const bolPts=[[58,52],[86,62],[-48,44]];
   bolPts.forEach((p,i)=>{
    const bx=p[0],bz=p[1],by=DRAWN_H(bx,bz);
    addPart(new THREE.CylinderGeometry(0.55,0.68,0.52,8),COMPASS.M.rockSandstone,bx,by+0.20,bz,0,0,0,'Masonry Ferry Bollard Base','stone');
    addPart(new THREE.CylinderGeometry(0.28,0.34,1.18,8),COMPASS.M.metalBronze,bx,by+0.82,bz,0,0,0,'Zero-Iron Cast Tin-Bronze Ferry Bollard #'+(i+1),'tin-bronze');
    addPart(new THREE.TorusGeometry(0.26,0.055,6,14),COMPASS.M.metalCopper,bx,by+1.10,bz,0.3,i*0.7,0,'Heavy Bronze Ferry Cable Ring','copper');
    regWork('compass:ferry-bollard-'+i,'Ham-Tsek Tin-Bronze Ferry Bollard #'+(i+1),bx,by,bz,1.0,1.5,'tin-bronze','bollard');
   });
   const gx=72,gz=58,gy=DRAWN_H(gx,gz);
   addPart(new THREE.BoxGeometry(0.38,2.25,0.26),COMPASS.M.rockNephrite,gx,gy+1.02,gz,0,0.22,0,'Ham-Tsek Nephrite River-Stage & Placer Gauge','nephrite');
   regWork('compass:river-gauge','Nephrite River-Stage Gauge Stele',gx,gy,gz,0.8,2.3,'nephrite','marker');
   REGISTER({tagId:'compass:ham-tsek-ferry-landing',name:'Ham-Tsek Bronze Ferry Bollards & Silk-Post Landing',x:72,y:gy-2,z:58,r:38,h:14,tags:{culture:'spider-lake'}});
  }
 }
 return{group:group,items:items,records:records};
})();
