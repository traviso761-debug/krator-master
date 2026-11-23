// ================================================================= THE BEACON - the house's life on the page (the build's steps P3, P6)
// The walkers of src/41-bc-life.js (BEACON_LIFE: the Lamp Watch, the kora's six, the novices' round, the Lamp School's masters at
// the offices, the oil carts), drawn as figures that move on the ground at the page's clock (bcClockS: ?day= and ?hour=, running
// on, as the lamp's). A monk is a stand-in (a robe, a head, a sash in the gold spoke's colour) until core/charactermodels draws
// the order's monks; a cart is a stand-in too (a bed on two wheels with its oil jars, an ox before it) until a kit has the
// Xanadui ox cart (KNOWN_ISSUES.md). Each stands on the drawn ground: terrainH at its place. tick(t) draws them at a given time
// (the verify's). [web]: three.js.
const BC_LIFE=(function(){const W=BEACON_LIFE.walkers(),G=new THREE.Group();G.name='The Beacon - the walkers';G.userData.probeSkip=true;scene.add(G);
 const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});
 const robeM={watch:M(0xc89a2c),kora:M(0x8a2a1e),novices:M(0xd8b04a),school:M(0x6e1e18)};
 const skin=new THREE.MeshStandardMaterial({color:0x9a6a48,roughness:.7}),sash=new THREE.MeshStandardMaterial({color:BC_SP.wall,roughness:.6});
 const robeG=new THREE.CylinderGeometry(.2,.32,1.35,10),headG=new THREE.SphereGeometry(.13,10,8),sashG=new THREE.BoxGeometry(.45,.08,.3);
 const wood=M(0x6a4a2e),jar=M(0x8a5a3a),ox=M(0x5a4a3e);
 function monk(w,f){const r=new THREE.Mesh(robeG,robeM[w.group]);r.position.y=.675;f.add(r);const h=new THREE.Mesh(headG,skin);h.position.y=1.5;f.add(h);
  const s=new THREE.Mesh(sashG,sash);s.position.y=1.05;s.rotation.z=.5;f.add(s);
  if(w.group==='novices'){const j=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.22,8),M(0xe8d8a8));j.position.set(.26,.95,0);f.add(j);}}   /* the butter jar */
 function cart(f){const bed=new THREE.Mesh(new THREE.BoxGeometry(1.5,.18,2.6),wood);bed.position.y=.9;f.add(bed);
  for(const s of[-1,1]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.12,16),wood);wh.rotation.z=Math.PI/2;wh.position.set(s*.84,.62,-.2);f.add(wh);
   const sd=new THREE.Mesh(new THREE.BoxGeometry(.08,.4,2.6),wood);sd.position.set(s*.71,1.18,0);f.add(sd);}
  for(let i=0;i<4;i++){const j=new THREE.Mesh(new THREE.CylinderGeometry(.24,.2,.62,10),jar);j.position.set(i%2?.34:-.34,1.3,i<2?-.6:.5);f.add(j);}   /* the oil jars */
  const pole=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,1.8),wood);pole.position.set(0,.85,2.1);f.add(pole);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.8,.85,1.9),ox);body.position.set(0,1.1,3.6);f.add(body);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(.4,.42,.55),ox);hd.position.set(0,1.25,4.75);f.add(hd);
  for(const [lx,lz] of[[-.28,2.95],[.28,2.95],[-.28,4.25],[.28,4.25]]){const lg=new THREE.Mesh(new THREE.BoxGeometry(.14,.7,.14),ox);lg.position.set(lx,.35,lz);f.add(lg);}}   /* the ox before it */
 const figs=W.map(w=>{const f=new THREE.Group();f.name='walker '+w.id;if(w.group==='carts')cart(f);else monk(w,f);G.add(f);return{w,f};});
 function tick(tAt){const t=tAt==null?bcClockS():tAt,out=[];
  for(const F of figs){const p=BEACON_LIFE.at(F.w,t),x=p.v,z=p.u,y=terrainH(x,z);F.f.visible=!!p.visible;F.f.position.set(x,y,z);F.f.rotation.y=Math.atan2(Math.sin(p.heading),Math.cos(p.heading));   /* heading 0 is toward +u (+z): rotation.y 0 faces +z */
   out.push({id:F.w.id,group:F.w.group,where:p.where,visible:!!p.visible,x:Math.round(x*10)/10,z:Math.round(z*10)/10,y:Math.round(y*100)/100});}
  window._beaconLife=out;return out;}
 FRAME_HOOKS.push(()=>tick());tick();return{G,figs,tick};})();
