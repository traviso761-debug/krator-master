// ================================================================= HOST — site:* reserves, KHAZ, Jumala-Tuli cold-flames & Auger rig ([draw])
// Registers Kulanewa site:* reserves strictly free of any class === 'building' records, binds all Arcflow KHAZ hazards,
// places the derelict Ancient ecof_soil_auger rig on Station 5 (auger) via KFRONTIER.placeMachine (registered BEFORE drawing),
// renders pale-blue abiotic H2/CH4 Jumala-Tuli rock-flames on Station 3 (seep), and when ?works!=0 places Kulanewa
// valge-vask / bronze covenant posts & bog-ore rake cradles (class: 'furniture') outside reserve cores.
const WORKS=(function(){
 const Q=new URLSearchParams(location.search),on=Q.get('works')!=='0';
 const group=new THREE.Group();
 group.name='arcflow-works';
 group.userData.host=true;
 scene.add(group);
 const items=[];

 // 1. Register Kulanewa settlement & sampo reserves in KTAGS (strictly class: 'landmark', zero class: 'building'!)
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
    tags:{biome:'arcflow',culture:R.culture||'kulanewa',role:'reserve'}
   });
   REGISTER({tagId:R.id+':bench',tagClass:'landmark',name:R.name,x:R.x,y:ry-2,z:R.z,r:R.r,h:20,tags:{culture:R.culture||'kulanewa'}});
  }
 }

 // 2. Register station-specific KHAZ hazards
 if(!HAZARDS.length&&typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
  const regHaz=(id,name,x,y,z,r,h,spec)=>{
   const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'arcflow',hazard:KHAZ.make(spec)}};
   KTAGS.page.add(rec);
   HAZARDS.push(rec);
  };
  if(SKEY==='klint'){
   regHaz('arcflow:klintdrop','55 m Kulaneva-Klint Horseshoe Waterfall Lip',-14,55.2,0,34,62,ARCFLOW_PHYS.hazardSpec('klintdrop'));
  }else if(SKEY==='koski'){
   regHaz('arcflow:koskisweep','Helme-Koski Zebra-Cumulate Cataract & Hiidenkirnu Vortex',0,6.2,0,48,14,ARCFLOW_PHYS.hazardSpec('koskisweep'));
  }else if(SKEY==='seep'){
   regHaz('arcflow:causticseep','pH 11.5 Hyperalkaline Ca-OH Cerulean Travertine Cascade',18,12.5,0,42,24,ARCFLOW_PHYS.hazardSpec('causticseep'));
   regHaz('arcflow:coldflame','Jumala-Tuli Abiotic H2/CH4 Rock-Flame Vents',-48,26.0,4,26,12,ARCFLOW_PHYS.hazardSpec('coldflame'));
  }else if(SKEY==='neva'){
   regHaz('arcflow:peatmire','Musta-Jogi Quaking Humic Sphagnum Bog Pocket',-12,0.8,-8,26,5,ARCFLOW_PHYS.hazardSpec('peatmire'));
  }else{
   regHaz('arcflow:bleachdust','Ancient Orbital Bleach-Swath Defoliant Hardpan',-68,9.2,24,34,8,ARCFLOW_PHYS.hazardSpec('bleach'));
  }
 }

 // 3. Station 5 (auger): Stalled Ancient Lime-Phosphate Soil-Auger Rig via shared KFRONTIER.placeMachine
 let machineMesh=null;
 if(SITE.auger&&typeof KFRONTIER!=='undefined'&&typeof KFRONTIER.placeMachine==='function'){
  machineMesh=KFRONTIER.placeMachine({
   THREE:THREE,
   scene:group,
   tagPage:(typeof KTAGS!=='undefined'&&KTAGS.page)?KTAGS.page:null,
   register:REGISTER,
   space:SPACE,
   hazards:HAZARDS,
   groundH:DRAWN_H,
   mats:{
    hull:ARCFLOW.M.rockBasalt,
    ceramic:ARCFLOW.M.ancientCeramic,
    bronze:ARCFLOW.M.worksBronze
   }
  },{
   id:'arcflow:ecof-soil-auger',
   kind:'ecof_soil_auger',
   x:SITE.auger.x,
   z:SITE.auger.z,
   rotY:0.48,
   state:'active',
   hour:11.5
  });
  items.push(machineMesh);
 }

 // 4. Station 3 (seep): Abiotic H2/CH4 Jumala-Tuli ("Uncrowned Flame") pale-blue cold rock-flames
 if(SITE.seep&&SITE.seep.flames&&SITE.seep.flames.length){
  const uFlameTime={value:0};
  const flameMat=new THREE.ShaderMaterial({
   transparent:true,
   depthWrite:false,
   blending:THREE.AdditiveBlending,
   side:THREE.DoubleSide,
   uniforms:{
    uT:uFlameTime,
    uBoost:{value:AF_STATE.mode==='dusk'?1.25:0.88}
   },
   vertexShader:[
    'uniform float uT;',
    'varying vec2 vUvF;',
    'void main(){',
    ' vUvF=uv;',
    ' vec3 p=position;',
    ' float sway=sin(uT*4.8+p.y*3.4)*0.12*uv.y;',
    ' p.x+=sway;p.z+=cos(uT*3.9+p.y*2.8)*0.09*uv.y;',
    ' gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);',
    '}'
   ].join('\n'),
   fragmentShader:[
    'uniform float uT;',
    'uniform float uBoost;',
    'varying vec2 vUvF;',
    'void main(){',
    ' float core=smoothstep(0.5,0.08,abs(vUvF.x-0.5));',
    ' float vert=smoothstep(0.0,0.18,vUvF.y)*pow(1.0-vUvF.y,1.35);',
    ' float flick=0.82+0.18*sin(uT*9.5+vUvF.y*8.0);',
    ' float a=core*vert*flick*uBoost;',
    ' if(a<=0.004)discard;',
    ' vec3 col=mix(vec3(0.20,0.58,1.0),vec3(0.78,0.96,1.0),core*core*(1.0-vUvF.y*0.5));',
    ' gl_FragColor=vec4(col,a);',
    '}'
   ].join('\n')
  });
  for(let i=0;i<SITE.seep.flames.length;i++){
   const fl=SITE.seep.flames[i],fx=fl[0],fz=fl[1],fy=DRAWN_H(fx,fz);
   // Serpentinite fissure vent collar (spheroidal torus, textured)
   const collar=new THREE.Mesh(new THREE.TorusGeometry(0.68,0.22,8,14),ARCFLOW.M.rockSerpentinite);
   collar.position.set(fx,fy+0.06,fz);
   collar.rotation.x=Math.PI*0.5;
   collar.userData={host:true,inspectLabel:'Jumala-Tuli Serpentinite H2/CH4 Seep Fissure'};
   group.add(collar);
   for(let p=0;p<2;p++){
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.35,1,6),flameMat);
    plane.position.set(fx,fy+1.05,fz);
    plane.rotation.y=p*Math.PI*0.5+i*0.4;
    plane.name='atmos:jumala-tuli-flame-'+i+'-'+p;
    plane.userData={probeSkip:true,inspectLabel:'Jumala-Tuli Abiotic H2/CH4 Cold-Flame'};
    plane.renderOrder=6;
    group.add(plane);
   }
   REGISTER({
    tagId:'arcflow:jumala-tuli-'+i,
    tagClass:'feature',
    name:'Jumala-Tuli Abiotic H2/CH4 Serpentinization Cold-Flame Vent',
    x:fx,y:fy-0.5,z:fz,r:2.6,h:4.2,
    tags:{biome:'arcflow',phenomenon:'abiotic-methane-hydrogen'}
   });
  }
  tick(()=>{
   uFlameTime.value+=0.016;
   flameMat.uniforms.uBoost.value=AF_STATE.mode==='dusk'?1.35:0.88;
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

 // Kulanewa notched cedar & valge-vask (Cu-Ni) water-head covenant post (outside reserve cores!)
 function addKulanewaPost(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  addPart(new THREE.CylinderGeometry(0.55,0.68,0.42,8),ARCFLOW.M.rockCumulate,x,y0+0.18,z,0,yaw,0,'Zebra-Cumulate Covenant Plinth');
  addPart(new THREE.CylinderGeometry(0.18,0.22,2.85,8),ARCFLOW.M.woodCedar,x,y0+1.75,z,0,yaw,0,'Kulanewa Carved Cedar Sampo-Head Gauge Post');
  addPart(new THREE.ConeGeometry(0.42,0.52,6),ARCFLOW.M.woodCedar,x,y0+3.38,z,0,yaw,0,'Nail-Less Shingle Hood Cap');
  addPart(new THREE.TorusGeometry(0.24,0.045,8,14),ARCFLOW.M.worksBronze,x,y0+2.35,z,Math.PI*0.5,0,0,'Valge-Vask (Arch-Nickel) Uncrowned Covenant Ring');
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'arcflow:kulanewa-post-'+SKEY+'-'+idx,
    name:'Kulanewa Cedar & Valge-Vask Covenant Gauge Post',
    class:'furniture',
    at:[x,y0,z],
    r:0.9,
    h:3.6,
    tags:{culture:'kulanewa',setting:'outdoor'}
   });
  }
 }

 // Musta-Jogi / Helme-Koski timber bog-ore & amber sluice cradle (class: 'furniture', outside reserve cores)
 function addOreRakeCradle(x,z,yaw,idx){
  const y0=DRAWN_H(x,z);
  const ca=Math.cos(yaw),sa=Math.sin(yaw);
  for(let s=-1;s<=1;s+=2){
   addPart(new THREE.BoxGeometry(0.18,0.24,2.8),ARCFLOW.M.woodCedar,x+ca*0.65*s,y0+0.12,z-sa*0.65*s,0,yaw,0,'Cedar Bog-Ore Rake Sled Runner');
  }
  addPart(new THREE.BoxGeometry(1.32,0.28,2.2),ARCFLOW.M.woodCedar,x,y0+0.34,z,0,yaw,0,'Perforated Raha-Maak Penny-Ore Washing Trough');
  addPart(new THREE.SphereGeometry(0.28,8,6),ARCFLOW.M.mineralBogore,x,y0+0.48,z,0,yaw,0,'Raked Fe-Ni Raha-Maak Penny-Ore Heap');
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'arcflow:ore-cradle-'+SKEY+'-'+idx,
    name:'Kulanewa Raha-Maak Penny-Ore & Merevaik Washing Cradle',
    class:'furniture',
    at:[x,y0,z],
    r:1.6,
    h:0.8,
    tags:{culture:'kulanewa',setting:'outdoor'}
   });
  }
 }

 if(on){
  if(SKEY==='klint'){
   addKulanewaPost(54,-38,0.32,0);
   addKulanewaPost(-38,-32,1.85,1);
  }else if(SKEY==='koski'){
   addKulanewaPost(-48,-36,0.25,0);
   addKulanewaPost(48,-34,-0.28,1);
   addOreRakeCradle(18,-36,0.12,0);
  }else if(SKEY==='seep'){
   addKulanewaPost(74,-28,0.52,0);
   addKulanewaPost(-16,-38,2.10,1);
  }else if(SKEY==='neva'){
   addKulanewaPost(-38,-28,0.40,0);
   addOreRakeCradle(-28,-22,0.22,0);
   addOreRakeCradle(26,-18,-0.18,1);
  }else{
   addKulanewaPost(14,-48,0.38,0);
   addKulanewaPost(-82,-38,-0.45,1);
  }
 }

 return{group:group,items:items,machine:machineMesh,enabled:on};
})();
