// ================================================================= HOST — the shield's hot springs (station 6): core/water/geyser's WATER.spring, drawn by WATER.drawSpring
// The crater's warm bog (PLAN.md section 6, station 6): three hot pools beside the fumaroles KTHERM places (44w STATION.SPRINGS), iron-red and
// sulphur-yellow at their rims as the mats reach in (WATER.THERMAL's ramps), none boiling. Each is a still surface with .thermal (the queries and
// the export read it as any pool) and a core/tags record. Before 89z: WATER.fields reads every surface. Their steam is not drawn (KNOWN_ISSUES.md).
const SPRING_MATS=new Map();
const SPRING_RECS=STATION.SPRINGS.map((s,k)=>{const name=['An iron spring in the crater bog','An iron spring by the fumaroles','A sulphur spring at the bog\'s edge'][k]||'A hot spring';
 const S=WATER.spring({key:s.key,name,x:s.x,z:s.z,r:s.r,level:s.level,temp:s.temp,mineral:s.mineral,milky:.25,boil:0,steam:0});
 REGISTER({name:name+' (core/water/geyser)',key:'water.'+s.key,kind:'water',x:s.x,z:s.z,y:s.level-2,r:s.r*1.1,h:6});
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=name;return S;});
/* an invisible anchor in each spring's registered volume (the pool's mesh is the probe's to skip, as all water is; 89z anchors the sites so) */
{const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),STATION.SPRINGS.length),M4=new THREE.Matrix4();
 STATION.SPRINGS.forEach((s,i)=>{M4.makeTranslation(s.x,s.level-.5,s.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='spring anchors';A.frustumCulled=false;scene.add(A);}
window._springs=SPRING_RECS.length;
