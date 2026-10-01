// ---------- the priest on the temple summit: golden headdress, jade cloak, purple trousers, bare torso; blesses pilgrims who climb ----------
{const TS=ctx.templeStair;const g=new THREE.Group();g.position.set(TEMPLE.x,TS.y0+TS.platform[1],TEMPLE.z+TS.platform[2]);g.rotation.y=0;   // faces the stair (+z)
  const gold=new THREE.MeshLambertMaterial({color:0xe8c14a}),jade=new THREE.MeshLambertMaterial({color:0x2fa27a}),purple=new THREE.MeshLambertMaterial({color:0x6a2d8a}),skin=new THREE.MeshLambertMaterial({color:0xc9955e});
  [-0.45,0.45].forEach(lx=>g.add(mesh(cyl(0.32,0.38,1,8),purple,lx,0.55,0,1,1.1,1,0)));
  g.add(mesh(cyl(0.55,0.72,1,8),skin,0,1.7,0,1,1.3,1,0));g.add(mesh(sph(0.34,8,6),skin,0,2.75,0,1,1,1,0));
  g.add(mesh(boxG,jade,0,0.9,-0.5,1.5,1.9,0.14,0));g.add(mesh(boxG,gold,0,2.9,0,0.9,0.35,0.9,0));                    // cloak, headband
  for(let k=-3;k<=3;k++){const f=mesh(boxG,gold,k*0.16,3.05,-0.1,0.16,1.8+ (3-Math.abs(k))*0.35,0.08,0);f.rotation.z=-k*0.22;g.add(f);}   // feathered headdress fan
  g.add(mesh(cyl(0.16,0.18,1,6),skin,-0.85,1.6,0,1,1.1,1,0));
  const arm=new THREE.Group();arm.userData.dynamic=true;arm.position.set(0.85,2.2,0);g.add(arm);arm.add(mesh(cyl(0.16,0.18,1,6),skin,0,-0.55,0,1,1.1,1,0));
  const orb=mesh(sph(0.22,8,6),glowM,0,-1.15,0,1,1,1,0);orb.visible=false;arm.add(orb);arm.rotation.x=0.3;g.userData.life=true;scene.add(g);
  animHooks.push(now=>{const blessing=ctx.agents&&ctx.agents.some(a=>a.st===5);const target=blessing?-2.3:0.3;arm.rotation.x+=(target-arm.rotation.x)*0.05;orb.visible=blessing;if(blessing)orb.scale.setScalar(1+0.3*Math.sin(now*0.01));});}
