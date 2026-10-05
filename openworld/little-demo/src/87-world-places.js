// ================================================================= OPEN WORLD — places: the scale model's settlements, marked where they stand
// [G data] the list (WORLD_DATA.meta.settlements, from the scale model's settlement layer, and the canyon candidates the
// extractor found for each ruin); [web] the markers: a pole on the ground at each settlement's map position and a label.
// Nothing is built here yet. A settlement is placed in the next step from the same record (its x, z, and for a ruin the
// canyon it is to sit in): PLACES.list is what that step reads.
var PLACES;LATE.push(()=>{PLACES=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,M=WORLD_DATA.meta;
// the builds that exist (or are being built) for a settlement in this region
const BUILT={'Locus':'settlements/locus','Shade':'settlements/shade','Yuni':'settlements/yuni','Veladiga':'kits/ancients (the ruin)','Verge':'(in progress)','Mungo':'(planned)'};
const list=M.settlements.map(s=>({name:s.name,type:s.type,x:s.x,z:s.z,px:s.px,py:s.py,biome:s.biome,build:BUILT[s.name]||null}));
for(const nm in M.canyon_candidates){const c=M.canyon_candidates[nm][0];if(!c)continue;
 list.push({name:nm+' canyon',type:'canyon candidate',x:c.x,z:c.z,px:WORLD.px(c.x),py:WORLD.py(c.z),biome:'',build:null,
  note:'the nearest trough in the heights to '+nm+': '+Math.round(c.dist_m/100)/10+' km away, '+c.depth_m+' m deep, runs '+c.runs,cand:c});}
const POLE=new THREE.CylinderGeometry(1,1,1,6,1,true).translate(0,.5,0);
const MAT_A=new THREE.MeshBasicMaterial({color:0xffc070,fog:false,transparent:true,opacity:.85,depthWrite:false});
const MAT_B=new THREE.MeshBasicMaterial({color:0xe8e0d0,fog:false,transparent:true,opacity:.55,depthWrite:false});
const MAT_C=new THREE.MeshBasicMaterial({color:0x7fd0ff,fog:false,transparent:true,opacity:.8,depthWrite:false});
const layer=document.body;
for(const p of list){p.y=null;p.mesh=new THREE.Mesh(POLE,p.cand?MAT_C:p.build?MAT_A:MAT_B);p.mesh.frustumCulled=false;p.mesh.userData.probeSkip=true;p.mesh.renderOrder=5;scene.add(p.mesh);
 const el=document.createElement('div');el.className='lbl';el.innerHTML=p.name+'<small>'+(p.type||'')+(p.build?' · '+p.build:'')+'</small>';
 if(p.cand)el.style.color='#bfe8ff';else if(!p.build)el.style.opacity='.75';layer.appendChild(el);p.el=el;}
let shown=true;const v=new THREE.Vector3();
function update(){const P=camera.position;
 for(const p of list){if(p.y===null)p.y=WORLD.H(p.x,p.z);
  const d=Math.hypot(p.x-P.x,p.y-P.y,p.z-P.z),h=60+d*.06,r=Math.max(1.5,d*.0018);
  p.mesh.visible=shown&&d<900000;p.mesh.position.set(p.x,p.y,p.z);p.mesh.scale.set(r,h,r);
  v.set(p.x,p.y+h,p.z).project(camera);
  const vis=shown&&v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1&&d<900000&&(p.build||p.cand||d<250000);
  p.el.style.display=vis?'block':'none';
  if(vis){p.el.style.left=((v.x+1)/2*innerWidth)+'px';p.el.style.top=((1-v.y)/2*innerHeight)+'px';}}}
return{list,update,setShown:s=>{shown=s;}};})();});
