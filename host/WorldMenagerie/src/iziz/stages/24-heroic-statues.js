// ---------- heroic statues: science-fantasy art deco, built from stylised primitives ----------
const bronzeM=new THREE.MeshLambertMaterial({color:0x9a7a3c});bronzeM.userData.tex='metal';
const bronzeDarkM=new THREE.MeshLambertMaterial({color:0x6e5428});bronzeDarkM.userData.tex='metal';
function statue(x,z,h,pose,facing,where){
  const g=new THREE.Group();g.position.set(x,where==='terrace'?terrainH(PALACE.x,PALACE.z)-3+14:terrainH(x,z)-0.3,z);g.rotation.y=facing;
  const s=h/20;                                            // figure ~20 units tall at scale 1
  // stepped pedestal
  g.add(mesh(frusG(0.9),sandM,0,0,0,h*0.55,h*0.12,h*0.55,0));
  g.add(mesh(frusG(0.9),sandLightM,0,h*0.12,0,h*0.4,h*0.08,h*0.4,0));
  g.add(mesh(polyTower(8,0.85),bronzeDarkM,0,h*0.2,0,h*0.13,h*0.06,h*0.13,0));
  const f=new THREE.Group();f.position.y=h*0.26;f.scale.set(s,s,s);g.add(f);
  // legs, torso (broad deco shoulders), head, crest
  [-1.4,1.4].forEach(lx=>f.add(mesh(cyl(1.1,1.5,1,6),bronzeM,lx,4.5,0,1,9,1,0)));
  f.add(mesh(cyl(3.3,2.2,1,6),bronzeM,0,13.5,0,1,9,1,0));   // torso, wider at the shoulders
  f.add(mesh(boxG,bronzeDarkM,0,9,0,4.2,1.4,2.6,0));                                  // belt
  f.add(mesh(octa(1.6,0),bronzeM,0,20.3,0,1,1.4,1,0));       // head
  f.add(mesh(cone(1,1,4),bronzeDarkM,0,21.6,0,1.4,3,0.6,0));       // crest
  if(pose===0){                                            // spear raised, staff crowned with light
    f.add(mesh(cyl(0.7,0.9,1,6),bronzeM,-3.4,15.5,0,1,7,1,0));
    const arm=mesh(cyl(0.7,0.9,1,6),bronzeM,3.6,20,1.5,1,7,1,0);arm.rotation.z=-0.6;arm.rotation.x=0.4;f.add(arm);
    f.add(mesh(cyl(0.28,0.28,1,6),bronzeDarkM,5.6,20,3,1,30,1,0));
    f.add(mesh(cone(1,1,4),glowM,5.6,35,3,1.2,4,1.2,0));
  }else if(pose===1){                                      // arms crossed, deco wings behind
    const a1=mesh(boxG,bronzeM,0,14.5,2.2,7,1.6,1.6,0);a1.rotation.z=0.25;f.add(a1);
    const a2=mesh(boxG,bronzeM,0,12.8,2.2,7,1.6,1.6,0);a2.rotation.z=-0.25;f.add(a2);
    [-1,1].forEach(sx=>{const wing=mesh(boxG,bronzeDarkM,sx*4,10,-2.2,5,16,0.6,0);wing.rotation.z=sx*0.35;f.add(wing);
      const w2=mesh(boxG,bronzeM,sx*7.5,10,-2.4,3,11,0.5,0);w2.rotation.z=sx*0.55;f.add(w2);});
  }else{                                                   // orb held aloft in both hands
    [-1,1].forEach(sx=>{const arm=mesh(cyl(0.7,0.9,1,6),bronzeM,sx*3,20,1.2,1,8,1,0);arm.rotation.z=-sx*0.45;arm.rotation.x=0.35;f.add(arm);});
    f.add(mesh(sph(2.4,12,8),glowM,0,26,3,1,1,1,0));
    f.add(mesh(torus(3.2,0.25,6,20),bronzeDarkM,0,26,3,1,1,1,0));
  }
  scene.add(g);
}
// placements come from the STATUES roster defined with the city constants
for(const st of STATUES)statue(st[0],st[1],st[2],st[3],st[4],st[5]);
});
await stage('jungle');
section('jungle',()=>{
