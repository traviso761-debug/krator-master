// ================================================================= HOST — THE GATE: the Tierhounds' long wall, the toll fort, the water gate, the shrine
// PLAN.md section 5 (the owner, 2026-11-09: The Gate moves into the gap; the long wall is the plan's proposal, Derbent's pattern: a wall from
// wall foot to wall foot, the fort and its toll gate at its middle, towers every few hundred metres, the river under a water gate). PLAIN
// RECORDS AND PLAIN MESHES until the culture kit (kits/coyote): each piece a core/tags record (REGISTER) before the kit draws, its stones
// instanced boxes (one InstancedMesh a material). The page holds 7 km of a wall the plan runs 30 km (1431,326 to 1446,326 on 5.1): it
// leaves the map at both edges. Every caravan, and the god's road, goes through the gatehouse; the caravans wait outside (north).
//   the wall      dressed stone, 10 m high and 6 thick, a tower every 400 m (16 m), a parapet; on the floor's line z = ZW
//   the gatehouse two towers and a lintel where the god's road crosses the wall
//   the fort      the toll fort behind the wall on the east bank: four walls, four corner towers, the keep, the toll-house at its gate
//   the water gate the wall carried over the river on piers, its arches over the main channel
//   the shrine    the trickster's: a small stone house and a tall post carrying the runner bird
//   the camp      the caravans' tents outside the wall, by the road
const WORKS=(function(){const out={pieces:0},INST={stone:[],dark:[],wood:[],cloth:[]};
 const Q=new THREE.Quaternion(),E=new THREE.Euler(),M4=new THREE.Matrix4(),P=new THREE.Vector3(),S=new THREE.Vector3();
 const box=(set,x,y0,z,w,h,d,yaw)=>{INST[set].push([x,y0+h/2,z,w,h,d,yaw==null?0:yaw]);out.pieces++;};
 const gmin=(x,z,r)=>Math.min(terrainH(x-r,z),terrainH(x+r,z),terrainH(x,z-r),terrainH(x,z+r),terrainH(x,z));
 const F=GATE.fort,WG=GATE.water,RX=roadX(ZW);
 // ---- the long wall: segments of 16 m along z = ZW, towers every 400 m; open at the gatehouse and over the river (the water gate)
 const towers=[];
 for(let x=-3600;x<3600;x+=16){const cx=x+8;if(Math.abs(cx-RX)<14)continue;if(Math.abs(cx-WG.x)<WG.hw)continue;
  const y=gmin(cx,ZW,8)-1.5;box('stone',cx,y,ZW,16.4,11.5+(terrainH(cx,ZW)-y)*0,6);box('stone',cx,y+11.4,ZW,16.4,1.4,1.2);}
 for(let x=-3600;x<=3600;x+=400){if(Math.abs(x-RX)<40||Math.abs(x-WG.x)<WG.hw+12)continue;const y=gmin(x,ZW,5)-1.5;box('stone',x,y,ZW,9,17.5,9);towers.push(x);
  REGISTER({name:'A tower of the long wall',kind:'structure',x,z:ZW,y:y,r:7,h:20});}
 REGISTER({name:'The Tierhounds\' long wall (across the gap\'s floor, wall foot to wall foot: 30 km on the model)',kind:'structure',x:0,z:ZW,y:gmin(0,ZW,4)-2,r:3600,h:24});
 // ---- the gatehouse on the god's road
 {const y=gmin(RX,ZW,10)-1.5;box('stone',RX-10,y,ZW,8,19,10);box('stone',RX+10,y,ZW,8,19,10);box('stone',RX,y+13,ZW,12,6,10);box('dark',RX,y,ZW+.1,12.2,12.4,3);
  REGISTER({name:'The gatehouse (the god\'s road through the long wall: the toll is taken here)',kind:'structure',x:RX,z:ZW,y,r:16,h:22});}
 // ---- the toll fort behind the wall on the east bank
 {const y=gmin(F.x,F.z,F.w/2)-1.5,hw=F.w/2,hd=F.d/2,H=13;
  box('stone',F.x,y,F.z-hd,F.w,H,5);box('stone',F.x,y,F.z+hd,F.w,H,5);box('stone',F.x+hw,y,F.z,5,H,F.d);
  box('stone',F.x-hw,y,F.z-hd*.55,5,H,F.d*.45);box('stone',F.x-hw,y,F.z+hd*.55,5,H,F.d*.45);box('dark',F.x-hw-.2,y,F.z,3.4,8,F.d*.1);
  for(const sx of[-1,1])for(const sz of[-1,1])box('stone',F.x+sx*hw,y,F.z+sz*hd,13,19,13);
  box('stone',F.x+hw*.3,y,F.z+hd*.2,24,26,24);box('stone',F.x+hw*.3,y+26,F.z+hd*.2,14,5,14);
  box('wood',F.x-hw+14,y,F.z,10,5.5,14);   /* the toll-house at the fort's gate */
  REGISTER({name:'The toll fort (the Tierhounds\' fort at the Narrows)',kind:'structure',x:F.x,z:F.z,y,r:hw*1.45,h:34});
  REGISTER({name:'The fort\'s keep',kind:'structure',x:F.x+hw*.3,z:F.z+hd*.2,y,r:18,h:34});
  REGISTER({name:'The toll-house (the toll and the seed law: no live plant, seed or fodder passes inward; proposed)',kind:'structure',x:F.x-hw+14,z:F.z,y,r:10,h:8});}
 // ---- the water gate: piers across the river, a deck at the wall's height, the parapet over it
 {const n=Math.ceil(2*WG.hw/24),y0=LVL(ZW)-4,top=LVL(ZW)+11;
  for(let k=0;k<=n;k++){const x=WG.x-WG.hw+k*(2*WG.hw/n);box('stone',x,y0,ZW,6,top-y0,8);}
  box('stone',WG.x,top,ZW,2*WG.hw+6,3,7);box('stone',WG.x,top+3,ZW,2*WG.hw+6,1.4,1.2);
  REGISTER({name:'The water gate (the long wall over Hau-Gel, on piers)',kind:'structure',x:WG.x,z:ZW,y:y0,r:WG.hw+8,h:22});}
 // ---- the trickster's shrine by the road, south of the gate: a small stone house, a post carrying the runner bird
 {const y=gmin(SHRINE.x,SHRINE.z,4)-.8;box('stone',SHRINE.x,y,SHRINE.z,5,4.2,5);box('dark',SHRINE.x,y+4.2,SHRINE.z,6,.6,6);box('wood',SHRINE.x+6,y,SHRINE.z,.5,7.5,.5);
  box('wood',SHRINE.x+6.6,y+7.3,SHRINE.z,1.8,.5,.4);box('wood',SHRINE.x+7.3,y+7.5,SHRINE.z,.3,1.1,.3);box('wood',SHRINE.x+5.7,y+7.6,SHRINE.z,1.2,.25,.25,.3);
  REGISTER({name:'The trickster\'s shrine (the runner bird\'s: the god\'s road passes it)',kind:'structure',x:SHRINE.x,z:SHRINE.z,y,r:9,h:10});}
 // ---- the caravans' camp outside the wall (north), waiting for the toll
 {for(let k=0;k<9;k++){const a=k*2.3+.4,d=CAMP.r*.62*(.7+.3*KRAND.unit(KRAND.hash(6141,k,1))),x=CAMP.x+Math.cos(a)*d,z=CAMP.z+Math.sin(a)*d,y=gmin(x,z,3)-.3,r=2.8+1.2*KRAND.unit(KRAND.hash(6141,k,2));
   box('cloth',x,y,z,r*2,2.6,r*2.4,a);REGISTER({name:'A caravan\'s tent (Izani traders waiting on the toll)',kind:'structure',x,z,y:y-1,r:r+1,h:4});}
  REGISTER({name:'The caravan camp (outside the wall, waiting on the toll)',kind:'settlement',x:CAMP.x,z:CAMP.z,y:gmin(CAMP.x,CAMP.z,4)-2,r:CAMP.r*1.3,h:8});}
 // ---- the god's road and the river's hazards: records only (the road is the ground's paint; the river is drawn by 89zw)
 for(let z=-3000;z<=3000;z+=1500)BIO.record({kind:'road',key:'godsroad:'+z,name:'The god\'s road (the Sleeping City to Trickster\'s House, through the gate)',x:roadX(z),y:terrainH(roadX(z),z),z,r:8,h:2});
 out.hazards=0;for(let z=-3200;z<=3200;z+=800){if(BIO.record({kind:'hazard',key:'drown:'+z,name:'Hau-Gel (deep, fast, cold from the walls: drowning)',x:rivX(z),y:LVL(z)-4,z,r:MAIN_W/2,h:6,
  tags:{hazard:{kind:'drown'}}}))out.hazards++;}
 // ---- draw: one InstancedMesh a material
 const MAT={stone:new THREE.MeshLambertMaterial({color:0xa8a090}),dark:new THREE.MeshLambertMaterial({color:0x4a4038}),wood:new THREE.MeshLambertMaterial({color:0x7a5a3e}),cloth:new THREE.MeshLambertMaterial({color:0xc8b48e})};
 const geo=new THREE.BoxGeometry(1,1,1);out.meshes=[];
 for(const k in INST){const L=INST[k];if(!L.length)continue;const m=new THREE.InstancedMesh(geo,MAT[k],L.length);
  L.forEach((b,i)=>{P.set(b[0],b[1],b[2]);S.set(b[3],b[4],b[5]);Q.setFromEuler(E.set(0,b[6],0));M4.compose(P,Q,S);m.setMatrixAt(i,M4);});
  m.userData.host=true;m.userData.inspectLabel='The Gate (the Tierhounds\' works: plain records until the culture kit)';m.frustumCulled=false;scene.add(m);out.meshes.push(m);}
 out.towers=towers.length;return out;})();
