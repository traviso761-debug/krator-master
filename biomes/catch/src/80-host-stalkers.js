// ================================================================= HOST — the Stalkers under the sand (set dressing: PLAN.md section 6c)
// A harpooner and a blade from the kits/mechs bundle (79-host-mechs.js, culture stalker: KratorMechs), lying in wait a
// stage out from the water, sunk in the sand and pitched forward along their heading (s.pitch: lying low, the head down
// over the ground, as a thing that waits); the kit has no buried or crouched pose yet (kits/mechs/KNOWN_ISSUES.md). Their place is the stage's (STAGE.stalkers: kind, x, z, bury = the share of the height
// under the sand, yaw). Each is a registered record (class life, a Stalker's key) before it is drawn; they do not move.
const STALKERS=[];
(function(){if(typeof KratorMechs==='undefined'||!(STAGE.stalkers||[]).length)return;
 const box=new THREE.Box3(),sz=new THREE.Vector3();
 STAGE.stalkers.forEach((s,k)=>{if(!KratorMechs.has(s.kind)){reportErr('stalkers: no mech '+s.kind);return;}
  const e=KratorMechs.get(s.kind),y0=terrainH(s.x,s.z);
  const rec={name:e.name+' (a Stalker, half under the sand: Hub 01\'s, though no one in the world knows it)',key:'mech.'+s.kind,kind:'fauna',x:s.x,y:y0-2,z:s.z,r:2.5,h:4};
  REGISTER(rec);
  const g=KratorMechs.build(s.kind,{seed:KRAND.hash(STAGE.seed,7700,k)});g.updateMatrixWorld(true);box.setFromObject(g);box.getSize(sz);
  g.rotation.set(s.pitch==null?.55:s.pitch,s.yaw||0,0,'YXZ');g.position.set(s.x,0,s.z);g.updateMatrixWorld(true);box.setFromObject(g);
  g.position.y=y0-(box.max.y-box.min.y)*s.bury-box.min.y;
  g.traverse(o=>{o.userData.host=true;o.userData.inspectLabel=e.name+' (a Stalker)';});scene.add(g);STALKERS.push({group:g,rec,s});});})();
