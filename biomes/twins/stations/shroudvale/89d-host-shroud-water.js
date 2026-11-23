// ================================================================= HOST — the iron seep drawn (station 4): core/water's spring (WATER.spring, 'iron' ramp)
// The vale's one water (PLAN.md section 4.2: "a tiny, lukewarm iron-seep (+12 C) right at the mouth, convincing the greedy caravan master
// that they are entering a prime geothermal oasis"): a still pool 4.6 m across at the mouth, rust-stained, barely steaming. Its record first.
REGISTER({name:SEEP.name,x:SEEP.x,z:SEEP.z,y:SEEP.y-1,r:SEEP.r+4,h:3,kind:'feature',tags:{trap:'F1',water:'seep'}});
const SEEP_DRAW=(typeof WATER==='undefined'||!WATER.spring)?null:(function(){try{
 const W=WATER.spring({key:'seep',name:SEEP.name,x:SEEP.x,z:SEEP.z,r:SEEP.r,level:SEEP.level,temp:.12,mineral:'iron',milky:.1,boil:0,steam:0});
 const d=WATER.drawSpring(W,{THREE,scene,fog:scene.fog,mats:new Map(),renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=SEEP.name;
 {const o=new THREE.Object3D();o.userData.probePoints=[SEEP.x,SEEP.level,SEEP.z];scene.add(o);}   /* the probe's point for its record (the pool's mesh is probeSkip) */
 twinsWater({surfaces:WATER.surfaces.length,seep:true});return d;}   /* 89c */catch(e){reportErr('seep: '+e.stack);return null;}})();
