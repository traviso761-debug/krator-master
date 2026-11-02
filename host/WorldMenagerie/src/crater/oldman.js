// ---------- Crater Lake: the Old Man of the Lake ----------
// A mountain hemlock's trunk, 9 m long, that has floated upright in the lake since at least 1896: about a metre
// of it stands out of the water, bleached white above and dark where it is wet, and it drifts with the wind,
// a few kilometres some days. C.oldMan: it wanders on a slow loop round `at` ([lat, lon]), `reach` m, keeping off
// the shore; api.ctx.oldMan.pos() says where it is now (events.js follows it). Not in the fingerprint.
export function oldman(api){
  const {THREE,C,scene,P,inWater,animHooks}=api;const K=C.oldMan;if(!K)return;
  const WY=api.ctx.waterLevel||0.05,[cx,cz]=P(K.at),R=K.reach||1200;
  const g=new THREE.Group();g.name='oldman';
  // the stump that shows: 1.2 m of bleached trunk, 0.6 m across, leaning a little, its top broken into splinters
  // of differing heights; the wet band at the waterline; a stub where a branch was; a ring of calm water round it
  const trunk=new THREE.CylinderGeometry(0.27,0.32,1.25,11,3);{const q=trunk.attributes.position;for(let i=0;i<q.count;i++){const a=Math.atan2(q.getZ(i),q.getX(i));const f=1+0.06*Math.sin(a*5)+0.04*Math.sin(a*11);q.setX(i,q.getX(i)*f);q.setZ(i,q.getZ(i)*f);}trunk.computeVertexNormals();}
  const lean=new THREE.Group();lean.rotation.set(0.06,0,0.09);g.add(lean);
  const put=(geo,c,x,y,z,rx=0,rz=0)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);m.rotation.set(rx,0,rz);m.castShadow=true;lean.add(m);return m;};
  put(trunk,0xd6d0c2,0,0.62,0);put(new THREE.CylinderGeometry(0.325,0.33,0.32,11),0x4a4036,0,0.05,0);put(new THREE.CylinderGeometry(0.33,0.36,6,11),0x2e2822,0,-3.1,0);
  for(const [x,z,h,r] of [[0.1,0.05,0.55,0.1],[-0.12,0.08,0.35,0.09],[0.02,-0.14,0.45,0.08],[-0.08,-0.06,0.25,0.11],[0.15,-0.08,0.2,0.07]])put(new THREE.ConeGeometry(r,h,5).translate(0,h/2,0),0xe2dccf,x,1.24,z);
  put(new THREE.CylinderGeometry(0.05,0.08,0.4,6).rotateZ(Math.PI/2.4),0xc8c2b4,0.32,0.8,0.05);
  {const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),gr=c.createRadialGradient(32,32,10,32,32,31);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.6,'rgba(255,255,255,0.35)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}));ring.position.y=0.04;g.add(ring);}
  scene.add(g);g.traverse(q=>{q.userData.noFingerprint=true;});
  let a0=0;const t0=performance.now();
  const at=t=>{const a=t*(K.speed||0.00004)+a0;let x=cx+Math.cos(a)*R*(0.6+0.4*Math.sin(a*2.3)),z=cz+Math.sin(a*1.3)*R*(0.5+0.5*Math.cos(a*0.7));
    for(let k=0;k<8&&!inWater(x,z);k++){x=(x+cx)/2;z=(z+cz)/2;}return [x,z];};
  animHooks.push(now=>{const t=(now-t0)*(api.ctx.evspeed||1),[x,z]=at(t);g.position.set(x,WY+Math.sin(now*0.0011)*0.05,z);g.rotation.set(Math.sin(now*0.0007)*0.03,now*0.00002,Math.sin(now*0.0009)*0.03);});
  api.ctx.oldMan={pos:()=>[g.position.x,g.position.z],group:g};
}
