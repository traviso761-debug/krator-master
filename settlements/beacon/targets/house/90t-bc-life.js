// ================================================================= THE BEACON - the house's life on the page (the build's step P3)
// The walkers of src/41-bc-life.js (BEACON_LIFE: the Lamp Watch, the kora's six, the novices' round), drawn as robed figures that
// move on the ground at the page's hour and on through the evening (the page's clock: BC_SKY.hour plus the seconds since it
// loaded, as the lamp's). A figure is a stand-in (a robe, a head, a sash in the gold spoke's colour) until core/charactermodels
// draws the order's monks (KNOWN_ISSUES.md). Each stands on the drawn ground: terrainH at its place. [web]: three.js.
const BC_LIFE=(function(){const W=BEACON_LIFE.walkers(),G=new THREE.Group();G.name='The Beacon - the walkers';G.userData.probeSkip=true;scene.add(G);
 const robeM={watch:new THREE.MeshStandardMaterial({color:0xc89a2c,roughness:.85}),kora:new THREE.MeshStandardMaterial({color:0x8a2a1e,roughness:.85}),novices:new THREE.MeshStandardMaterial({color:0xd8b04a,roughness:.85})};
 const skin=new THREE.MeshStandardMaterial({color:0x9a6a48,roughness:.7}),sash=new THREE.MeshStandardMaterial({color:BC_SP.wall,roughness:.6});
 const robeG=new THREE.CylinderGeometry(.2,.32,1.35,10),headG=new THREE.SphereGeometry(.13,10,8),sashG=new THREE.BoxGeometry(.45,.08,.3);
 const figs=W.map(w=>{const f=new THREE.Group();f.name='walker '+w.id;
  const r=new THREE.Mesh(robeG,robeM[w.group]);r.position.y=.675;f.add(r);const h=new THREE.Mesh(headG,skin);h.position.y=1.5;f.add(h);
  const s=new THREE.Mesh(sashG,sash);s.position.y=1.05;s.rotation.z=.5;f.add(s);
  if(w.group==='novices'){const j=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.22,8),new THREE.MeshStandardMaterial({color:0xe8d8a8,roughness:.6}));j.position.set(.26,.95,0);f.add(j);}   /* the butter jar */
  G.add(f);return{w,f};});
 function tick(){const t=BC_SKY.hour*3600+(performance.now()-BC_B0)/1000,out=[];
  for(const F of figs){const p=BEACON_LIFE.at(F.w,t),x=p.v,z=p.u,y=terrainH(x,z);F.f.visible=!!p.visible;F.f.position.set(x,y,z);F.f.rotation.y=Math.atan2(Math.sin(p.heading),Math.cos(p.heading));   /* heading 0 is toward +u (+z): rotation.y 0 faces +z */
   out.push({id:F.w.id,group:F.w.group,where:p.where,visible:!!p.visible,x:Math.round(x*10)/10,z:Math.round(z*10)/10,y:Math.round(y*100)/100});}
  window._beaconLife=out;}
 FRAME_HOOKS.push(tick);tick();return{G,figs,tick};})();
