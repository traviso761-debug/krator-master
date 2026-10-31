// ---------- Galaxy class: a hostile contact ----------
// Fan work. The raider is this project's own design, not any ship from any film, series or game: a dark arrowhead
// a quarter of the Enterprise's length, wings swept down to two engine pods, a green emitter in its nose.
//
// It drops out of warp a few kilometres off, the ship goes to red alert, and it circles at two or three kilometres,
// firing every few seconds: the bolts land on the shields if they are up (which wears them down: they come back
// slowly while up) or on the hull if not. Phasers and torpedoes take its shields down first, then its hull. Badly
// hurt it may break off and run for it; or it is destroyed.
export function hostile(W,E){
  const {THREE,ROOT}=W;
  let foe=null;

  function raiderMesh(){
    const g=new THREE.Group();
    const hull=new THREE.MeshStandardMaterial({color:0x5a665c,metalness:0.6,roughness:0.42,envMap:W.env,envMapIntensity:1.1});
    const dark=new THREE.MeshStandardMaterial({color:0x22282a,metalness:0.4,roughness:0.6,envMap:W.env});
    const glowM=new THREE.MeshBasicMaterial({color:0x7dff8a,toneMapped:false});
    // the body: an arrowhead in plan, extruded and bevelled, lying flat
    const sh=new THREE.Shape();[[80,0],[-38,36],[-66,28],[-52,0],[-66,-28],[-38,-36]].forEach(([x,z],i)=>i?sh.lineTo(x,z):sh.moveTo(x,z));sh.closePath();
    const body=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:10,bevelEnabled:true,bevelThickness:5,bevelSize:5,bevelSegments:3}),hull);
    body.geometry.rotateX(Math.PI/2);body.geometry.translate(0,5,0);g.add(body);
    // the spine, and a dark band of ports along it
    const spine=new THREE.Mesh(new THREE.CylinderGeometry(5,9,100,6),hull);spine.rotation.z=Math.PI/2;spine.position.set(-4,9,0);spine.scale.set(1,1,0.8);g.add(spine);
    const ports=new THREE.Mesh(new THREE.BoxGeometry(60,1.4,0.6),glowM);ports.position.set(0,10,5.6);g.add(ports);const p2=ports.clone();p2.position.z=-5.6;g.add(p2);
    // flat wings swept back from the body's sides, the engine pods riding on top of their tips, a blade of a fin
    // under the body and a low command pod on its back
    for(const sd of [1,-1]){
      const ws=new THREE.Shape();[[20,0],[-30,0],[-62,48],[-40,52]].forEach(([x,z],i)=>i?ws.lineTo(x,z*sd):ws.moveTo(x,z*sd));ws.closePath();
      const w=new THREE.Mesh(new THREE.ExtrudeGeometry(ws,{depth:3,bevelEnabled:true,bevelThickness:1.2,bevelSize:1.2,bevelSegments:2}),hull);
      w.geometry.rotateX(Math.PI/2);w.geometry.translate(0,5,sd*26);g.add(w);
      const pz=sd*76,py=9;
      const pod=new THREE.Mesh(new THREE.CylinderGeometry(5.5,6.5,70,12),dark);pod.rotation.z=Math.PI/2;pod.position.set(-44,py,pz);g.add(pod);
      const cap=new THREE.Mesh(new THREE.SphereGeometry(5.5,12,8),dark);cap.position.set(-9,py,pz);cap.scale.set(2.2,1,1);g.add(cap);
      const eng=new THREE.Mesh(new THREE.CircleGeometry(6,16),glowM);eng.rotation.y=-Math.PI/2;eng.position.set(-79.2,py,pz);g.add(eng);
      const eg=E.sprite(0x6aff7a,40,0.8);eg.position.set(-83,py,pz);g.add(eg);
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(46,0.8,0.5),glowM);stripe.position.set(-44,py,pz+sd*6.2);g.add(stripe);}
    const fin=new THREE.Shape();[[30,0],[-50,0],[-60,-26],[-30,-22]].forEach(([x,y],i)=>i?fin.lineTo(x,y):fin.moveTo(x,y));fin.closePath();
    const fm=new THREE.Mesh(new THREE.ExtrudeGeometry(fin,{depth:2.4,bevelEnabled:false}),hull);fm.geometry.translate(0,-1,-1.2);g.add(fm);
    const cmd=new THREE.Mesh(new THREE.SphereGeometry(12,20,12),dark);cmd.position.set(-30,13,0);cmd.scale.set(1.8,0.55,1);g.add(cmd);
    const win=new THREE.Mesh(new THREE.BoxGeometry(0.6,1.2,10),glowM);win.position.set(-8.6,15,0);g.add(win);
    const nose=E.sprite(0x8aff90,30,0.9);nose.position.set(84,5,0);g.add(nose);
    const bubble=E.sprite(0x60ff80,420,0);g.add(bubble);
    g.traverse(o=>{o.userData.noWire=true;if(o.isMesh){o.castShadow=o.receiveShadow=true;}});
    g.userData.info={name:'A raider',info:'A hostile contact: about 160 m long, armed, and not answering hails.'};
    return {g,nose,bubble,engines:g.children.filter(o=>o.isSprite&&o!==nose&&o!==bubble)};
  }

  const V=()=>new THREE.Vector3();
  const shipQ=()=>ROOT.getWorldQuaternion(new THREE.Quaternion());
  function contact(){
    if(foe&&!foe.gone)return;
    const m=raiderMesh(),c=E.shipCentre(),q=shipQ();
    const th=(Math.random()<0.5?1:-1)*(0.6+Math.random()*0.8);
    const spawn=c.clone().add(new THREE.Vector3(Math.cos(th)*5200,400,Math.sin(th)*5200).applyQuaternion(q));
    m.g.position.copy(E.toFX(spawn));W.FX.add(m.g);
    foe={m,sh:100,hp:100,vel:V(),th,gone:false,flee:false,fireT:E.T()+3.5,born:E.T(),hitT:-9,warpT:null};
    W.enemy=foe;
    E.sound('warp');E.flash(spawn,0xb8ffc8,900,0.9);
    if(!E.red())E.redAlert();
    E.sync();
    const tmp=V(),want=V(),toShip=V(),m4=new THREE.Matrix4(),qq=new THREE.Quaternion();
    E.run((t,dt)=>{
      if(foe.gone)return false;
      const g=m.g,c=E.toFX(E.shipCentre()),q=shipQ().premultiply(W.FX.quaternion.clone().invert()),u=t-foe.born;
      const shipV=E.dirFX(W.flight.vel||V());
      // warp-in: it decelerates out of a streak
      if(u<0.4){g.scale.set(1+6*(1-u/0.4),1,1);}else g.scale.set(1,1,1);
      if(foe.warpT!=null){const k=(t-foe.warpT)/0.4;g.scale.set(1+6*k*k,1,1);g.position.addScaledVector(tmp.set(1,0,0).applyQuaternion(g.quaternion),60000*k*dt);
        if(k>=1){E.flash(E.world(g,V()),0xb8ffc8,900,0.9);W.FX.remove(g);foe.gone=true;foe.left=true;W.enemy=null;E.sync();E.note('The raider has gone to warp.');return false;}return;}
      // where it wants to be: on a circle round the ship, two or three kilometres out, or away if running
      if(!foe.flee){foe.th+=dt*0.11;want.set(Math.cos(foe.th)*2600,260*Math.sin(foe.th*1.7),Math.sin(foe.th)*2600).applyQuaternion(q).add(c);}
      else want.copy(g.position).addScaledVector(tmp.copy(g.position).sub(c).normalize(),4000);
      tmp.copy(want).sub(g.position).multiplyScalar(0.5);const L=tmp.length(),cap=foe.flee?1400:900;if(L>cap)tmp.multiplyScalar(cap/L);
      tmp.add(shipV);foe.vel.lerp(tmp,Math.min(1,dt*0.9));g.position.addScaledVector(foe.vel,dt);
      // it points along its way, turning to bring its nose to bear as it fires
      toShip.copy(c).sub(g.position).normalize();const rel=tmp.copy(foe.vel).sub(shipV);
      const look=rel.lengthSq()>100?rel.normalize():toShip.clone();const aim=t>foe.fireT-1.2&&!foe.flee?0.75:0;look.lerp(toShip,aim).normalize();
      m4.lookAt(V(),look.clone().negate(),new THREE.Vector3(0,1,0).applyQuaternion(q));qq.setFromRotationMatrix(m4).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2));
      g.quaternion.slerp(qq,Math.min(1,dt*1.5));
      for(const e of m.engines)e.scale.setScalar(36+14*Math.sin(t*20));
      m.bubble.material.opacity=Math.max(0,0.6*(1-(t-foe.hitT)/0.5))*(foe.sh>0?1:0.3);
      // fire
      if(t>foe.fireT&&!foe.flee){foe.fireT=t+2.2+Math.random()*1.8;
        const from=E.world(m.nose,V());E.flash(from,0x8aff90,60,0.3);E.incoming(from);}
      // run for it, then go to warp
      if(foe.flee&&foe.warpT==null&&t-foe.fleeT>4){foe.warpT=t;E.sound('warp');}
    });
  }
  // a hit on it: shields first, then the hull
  function hit(dmg,at){
    if(!foe||foe.gone)return;const t=E.T();foe.hitT=t;
    if(foe.sh>0){foe.sh=Math.max(0,foe.sh-dmg);if(foe.sh===0)E.note('Its shields are down.');}
    else{foe.hp=Math.max(0,foe.hp-dmg*1.2);E.flash(at||E.world(foe.m.g,V()),0xffb070,120,0.6);}
    if(foe.hp<=0){destroy();return;}
    if(!foe.flee&&foe.hp<35&&Math.random()<0.6){foe.flee=true;foe.fleeT=t;E.note('The raider is breaking off.');}
  }
  function destroy(){
    const g=foe.m.g,p=E.world(g,V());foe.gone=true;W.enemy=null;
    E.sound('boom');setTimeout(()=>E.sound('boom'),350);
    E.flash(p,0xffffff,700,0.8);E.flash(p,0xa8ffb0,1600,1.6);E.flash(p,0xff7a30,1200,2.4);
    W.FX.remove(g);E.debris(p,0x3e4a40,60,180);
    E.note('The raider is destroyed.');E.sync();
  }
  const hud=()=>foe&&!foe.gone?(foe.flee?'hostile, running':'hostile')+' · its shields '+Math.round(foe.sh)+'% hull '+Math.round(foe.hp)+'% · '+
    (E.world(foe.m.g,V()).distanceTo(E.shipCentre())/1000).toFixed(1)+' km':'';
  return {contact,hit,hud,foe:()=>foe&&!foe.gone?foe:null};
}
