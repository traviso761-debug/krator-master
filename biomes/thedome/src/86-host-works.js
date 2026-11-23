/* ================================================================= HOST — sanctuary reserves & Upper Ria acoustic/barometric works ([draw])
   Registers site:dome-observatory (crown) and site:moat-waystation (moat) KTAGS reserves (0 class:'building' records!),
   and unless ?works=0 places lightweight Upper Ria cut-porphyry acoustic listening dishes, bronze Aeolian barometric wind-harps,
   and carved vernal rain-gauges (class: 'furniture'), 100% textured from materials.json.
*/
const WORKS=(function(){
 const out={reserves:0,dishes:0,harps:0,gauges:0,group:null};

 /* 1. Always register KTAGS sanctuary reserves (0 buildings!) */
 if(SITE.reserves&&SITE.reserves.length){
  for(let i=0;i<SITE.reserves.length;i++){
   const R0=SITE.reserves[i],ry=DRAWN_H(R0.x,R0.z);
   REGISTER({
    tagId:R0.id,
    name:R0.name,
    tagClass:'feature',
    ground:true,
    x:R0.x,y:ry,z:R0.z,r:R0.r,h:14,
    tags:{biome:'thedome',reserve:R0.id,culture:'yuni',sacred:true}
   });
   out.reserves++;
  }
 }

 if(new URLSearchParams(location.search).get('works')==='0')return out;

 const grp=new THREE.Group();
 grp.name='thedome:sanctuary-works';
 grp.userData.host=true;

 /* Helper: Upper Ria Parabolic Cut-Porphyry Acoustic Listening Dish + Bronze Focal Gong */
 function addListeningDish(x,z,yaw,idSuffix,label){
  const y=DRAWN_H(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;

  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(2.35,2.65,0.62,20),THEDOME.M.worksStone);
  plinth.position.y=0.22;
  plinth.userData.host=true;plinth.userData.inspectLabel=label+' Plinth';
  g.add(plinth);

  /* Concave parabolic rose-porphyry acoustic reflector dish */
  const pts=[];
  for(let i=0;i<=10;i++){
   const u=i/10,r=0.12+1.95*u,dy=0.68*u*u;
   pts.push(new THREE.Vector2(r,dy));
  }
  const dishGeo=new THREE.LatheGeometry(pts,24);
  dishGeo.computeVertexNormals();
  const dish=new THREE.Mesh(dishGeo,THEDOME.M.rockPorphyry);
  dish.position.set(0,1.65,0);
  dish.rotation.x=Math.PI*0.38;
  dish.userData.host=true;dish.userData.inspectLabel=label;
  g.add(dish);

  /* Focal bronze pickup sphere on tripod struts */
  const focus=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,10),THEDOME.M.worksBronze);
  focus.position.set(0,2.15,1.05);
  focus.userData.host=true;focus.userData.inspectLabel=label+' Bronze Focus';
  g.add(focus);
  for(let k=0;k<3;k++){
   const a=(k/3)*TAU;
   const strut=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,1.35,6),THEDOME.M.worksBronze);
   strut.position.set(Math.cos(a)*0.65,1.82,0.52+Math.sin(a)*0.35);
   strut.lookAt(x,y+2.15,z+1.05);
   strut.userData.host=true;strut.userData.inspectLabel=label+' Strut';
   g.add(strut);
  }

  grp.add(g);
  SPACE.insert({kind:'works',id:idSuffix},x,z,3.4);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'thedome:dish-'+idSuffix,
    name:label,
    class:'furniture',
    at:[x,y,z],r:2.8,h:3.1,
    tags:{biome:'thedome',culture:'yuni',setting:'outdoor',role:'acoustic-dish'}
   });
  }
  out.dishes++;
 }

 /* Helper: Bronze Aeolian Barometric Wind-Harp */
 function addWindHarp(x,z,yaw,idSuffix,label){
  const y=DRAWN_H(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  g.rotation.y=yaw;

  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.35,0.48,16),THEDOME.M.worksStone);
  base.position.y=0.18;
  base.userData.host=true;base.userData.inspectLabel=label+' Stone Foot';
  g.add(base);

  for(const sx of[-0.68,0.68]){
   const post=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.085,3.2,10),THEDOME.M.worksBronze);
   post.position.set(sx,1.82,0);
   post.userData.host=true;post.userData.inspectLabel=label;
   g.add(post);
  }
  const soundbox=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,1.62,12),THEDOME.M.worksBronze);
  soundbox.rotation.z=Math.PI*0.5;
  soundbox.position.set(0,3.38,0);
  soundbox.userData.host=true;soundbox.userData.inspectLabel=label+' Resonator';
  g.add(soundbox);

  for(let s=-3;s<=3;s++){
   const str=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,2.95,4),THEDOME.M.worksBronze);
   str.position.set(s*0.16,1.85,0);
   str.userData.host=true;str.userData.inspectLabel=label+' Harmonic String';
   g.add(str);
  }

  grp.add(g);
  SPACE.insert({kind:'works',id:idSuffix},x,z,2.4);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'thedome:harp-'+idSuffix,
    name:label,
    class:'furniture',
    at:[x,y,z],r:1.8,h:3.6,
    tags:{biome:'thedome',culture:'yuni',setting:'outdoor',role:'barometric-harp'}
   });
  }
  out.harps++;
 }

 /* Helper: Carved Porphyry Vernal Rain-Gauge Stele */
 function addRainGauge(x,z,idSuffix){
  const y=DRAWN_H(x,z);
  const g=new THREE.Group();
  g.position.set(x,y,z);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.42,1.45,12),THEDOME.M.worksStone);
  col.position.y=0.65;
  col.userData.host=true;col.userData.inspectLabel='Upper Ria Graduated Vernal Rain-Gauge';
  g.add(col);
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.46,0.28,0.28,14),THEDOME.M.worksBronze);
  bowl.position.y=1.48;
  bowl.userData.host=true;bowl.userData.inspectLabel='Bronze Vernal Hydroperiod Basin';
  g.add(bowl);
  grp.add(g);
  SPACE.insert({kind:'works',id:idSuffix},x,z,1.5);
  if(typeof KTAGS!=='undefined'&&KTAGS.page){
   KTAGS.page.add({
    id:'thedome:gauge-'+idSuffix,
    name:'Upper Ria Vernal Rain-Gauge',
    class:'furniture',
    at:[x,y,z],r:0.9,h:1.7,
    tags:{biome:'thedome',culture:'yuni',setting:'outdoor',role:'rain-gauge'}
   });
  }
  out.gauges++;
 }

 if(SKEY==='apron'){
  addListeningDish(28,48,-0.45,'apron-main','Upper Ria Cut-Porphyry Acoustic Listening Dish');
  addRainGauge(22,42,'apron-gauge');
 }else if(SKEY==='moat'){
  addListeningDish(2,-14,Math.PI,'moat-whisper','Whispering-Gallery Focal Porphyry Listening Dish');
  addWindHarp(142,-36,0.3,'moat-harp','Moat Trailhead Bronze Barometric Harp');
 }else if(SKEY==='crown'){
  addWindHarp(0,12,0.0,'crown-north','Crown-Veil Sanctuary Aeolian Wind-Harp');
  addWindHarp(-11,-6,2.1,'crown-west','Apex Barometric Organ Harp');
  addListeningDish(12,-6,-1.8,'crown-dish','Apex Sky-Mirror Acoustic Dish');
  addRainGauge(0,-14,'crown-gauge');
 }else if(SKEY==='cleft'){
  addWindHarp(-28,16,-0.2,'cleft-rim','Kluft Rim Barometric Breathing Wind-Harp');
  addRainGauge(-34,15,'cleft-gauge');
 }

 scene.add(grp);
 out.group=grp;
 return out;
})();
