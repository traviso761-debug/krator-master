// ---------- the machines of Arrakis ----------
// Fan work; Dune belongs to the Herbert estate, and every shape here is this project's own low-poly geometry,
// built from what the book and the films' designs are known for rather than copied from either.
//
//   the ornithopter   a dragonfly: a long segmented body, a glazed nose, a tail boom, skids, and two pairs of
//                     long slender wings each side that beat too fast to see - drawn translucent, the way the
//                     films show them, as a blur with a wing in it
//   the carryall      a wedge of silver-grey, jet pods at the corners, suspensor bags along the sides that fill
//                     when it lifts, and the grapples it drops over a harvester
//   the harvester     a factory on tracks the size of a building: boxy, stepped, dust-caked, an intake at the
//                     front, a stack at the back, and lifting points on top because the only way it ever
//                     leaves is hanging from a carryall
//   the maw           what comes up under a harvester when the carryall is late: a ring of segments rising out
//                     of the sand, a crown of baleen teeth round a throat that goes down for ever. Seen once,
//                     for seconds, in the events, and nowhere else.
// Each returns a THREE.Group; the animated ones carry an update(now, ...) in userData.

const M=(THREE,c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));

export function makeThopter(THREE,{scale=1,livery=0x6e6a60}={}){
  const g=new THREE.Group(),S=scale;
  const hull=M(THREE,livery),dark=M(THREE,0x3a3834),glass=new THREE.MeshPhongMaterial({color:0x1c2226,specular:0xc8d8e0,shininess:90,flatShading:true});
  const wingM=new THREE.MeshLambertMaterial({color:0xcfc8b8,transparent:true,opacity:0.42,side:THREE.DoubleSide,depthWrite:false});
  // the body: four segments tapering aft, like an abdomen, with the cockpit bulb at the front
  for(let i=0;i<4;i++){const r=(1.9-i*0.3)*S,len=3.4*S;const seg=new THREE.Mesh(new THREE.CylinderGeometry(r*0.92,r,len,8).rotateZ(Math.PI/2),hull);seg.position.x=(2.5-i*3.3)*S;g.add(seg);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(r*1.02,r*1.02,0.35*S,8).rotateZ(Math.PI/2),dark);band.position.x=(4.2-i*3.3)*S;g.add(band);}
  const nose=new THREE.Mesh(new THREE.SphereGeometry(2.1*S,12,8),glass);nose.scale.set(1.5,0.95,1);nose.position.x=5.6*S;g.add(nose);
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(0.35*S,0.55*S,7*S,6).rotateZ(Math.PI/2),hull);boom.position.x=-11.4*S;g.add(boom);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(2.4*S,2.2*S,0.2*S),hull);fin.position.set(-14.4*S,0.9*S,0);g.add(fin);
  for(const sd of [-1,1]){const skid=new THREE.Mesh(new THREE.BoxGeometry(9*S,0.3*S,0.3*S),dark);skid.position.set(1*S,-2.6*S,sd*1.6*S);g.add(skid);
    for(const fx of [-2,3]){const st=new THREE.Mesh(new THREE.BoxGeometry(0.25*S,1.4*S,0.25*S),dark);st.position.set(fx*S,-1.9*S,sd*1.4*S);g.add(st);}}
  // the wings: two pairs a side, hinged at the shoulder; each a long thin blade with a spar down it
  const wings=[];
  for(const sd of [-1,1])for(const [fx,ph] of [[2.4,0],[-1.2,Math.PI]]){
    const w=new THREE.Group();w.position.set(fx*S,1.7*S,sd*0.9*S);
    const blade=new THREE.Mesh(new THREE.BoxGeometry(2.2*S,0.08*S,13*S).translate(0,0,sd*6.6*S),wingM);w.add(blade);
    const spar=new THREE.Mesh(new THREE.BoxGeometry(0.25*S,0.2*S,13*S).translate(0.8*S,0,sd*6.6*S),dark);w.add(spar);
    g.add(w);wings.push({w,sd,ph});}
  g.traverse(o=>{if(o.isMesh&&o.material!==wingM)o.castShadow=true;});
  // update: `beat` 0 (parked, wings folded back along the body) .. 1 (full flight)
  g.userData.update=(now,beat=1)=>{for(const q of wings){
    const f=Math.sin(now*0.045+q.ph)*0.55*beat;q.w.rotation.set(q.sd*f,beat<0.2?q.sd*(1-beat*5)*1.1:0,0,'YXZ');}};
  return g;
}

export function makeCarryall(THREE,{scale=1}={}){
  const g=new THREE.Group(),S=scale;
  const hull=new THREE.MeshPhongMaterial({color:0x9a9c9c,specular:0xd8dcdc,shininess:40,flatShading:true}),dark=M(THREE,0x3c3c3a),bagM=M(THREE,0x8c8a84);
  // the wedge: a thick deck, thinner at the nose
  const sh=new THREE.Shape();sh.moveTo(-40*S,-6*S);sh.lineTo(40*S,-3*S);sh.lineTo(40*S,3*S);sh.lineTo(-40*S,8*S);sh.lineTo(-40*S,-6*S);
  const deck=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:56*S,bevelEnabled:false}).translate(0,0,-28*S),hull);g.add(deck);
  const spine=new THREE.Mesh(new THREE.BoxGeometry(60*S,5*S,14*S),dark);spine.position.set(-4*S,9*S,0);g.add(spine);
  const cab=new THREE.Mesh(new THREE.BoxGeometry(10*S,6*S,16*S),dark);cab.position.set(34*S,4*S,0);g.add(cab);
  // the jet pods at the corners, glowing under when it works
  const glowM=new THREE.MeshBasicMaterial({color:0xffd9a0});const glows=[];
  for(const fx of [-32,30])for(const sd of [-1,1]){const pod=new THREE.Mesh(new THREE.CylinderGeometry(5*S,6*S,10*S,10),hull);pod.position.set(fx*S,-4*S,sd*33*S);g.add(pod);
    const gl=new THREE.Mesh(new THREE.CircleGeometry(4.2*S,10).rotateX(Math.PI/2),glowM);gl.position.set(fx*S,-9.1*S,sd*33*S);g.add(gl);glows.push(gl);}
  // the suspensor bags, along each side: slack when it cruises, full when it lifts
  const bags=[];for(const sd of [-1,1]){const b=new THREE.Mesh(new THREE.SphereGeometry(1,14,8),bagM);b.position.set(-4*S,12*S,sd*22*S);b.scale.set(34*S,6*S,8*S);g.add(b);bags.push(b);}
  // the grapples: four cables and claws, reeled in or out
  const claws=[];for(const fx of [-1,1])for(const sd of [-1,1]){const cab2=new THREE.Mesh(new THREE.CylinderGeometry(0.35*S,0.35*S,1,5).translate(0,-0.5,0),dark);cab2.position.set(fx*22*S,-6*S,sd*14*S);g.add(cab2);
    const claw=new THREE.Mesh(new THREE.BoxGeometry(6*S,3*S,6*S),dark);g.add(claw);claws.push({cab:cab2,claw,fx,sd});}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  // update: the cables `drop` metres down, the bags `fill` 0..1, the jets `thrust` 0..1
  g.userData.update=(now,{drop=4,fill=0.2,thrust=0.5}={})=>{
    for(const c of claws){c.cab.scale.y=Math.max(0.1,drop);c.claw.position.set(c.fx*22*S,-6*S-drop,c.sd*14*S);}
    for(const b of bags){b.scale.set(34*S,(4+6*fill)*S,(6+6*fill)*S);}
    glowM.color.setRGB(1,0.85*thrust+0.1,0.6*thrust);for(const gl of glows)gl.visible=thrust>0.05;};
  g.userData.update(0);
  return g;
}

export function makeHarvester(THREE,{scale=1}={}){
  const g=new THREE.Group(),S=scale;
  const body=M(THREE,0x7c7266),dark=M(THREE,0x3f3a33),rust=M(THREE,0x8a6440),dust=M(THREE,0xb49a74);
  const L=110*S,W=58*S,H=34*S;
  // the hull, stepped: a long low base, a tall block on it, and the separator house on that
  const base=new THREE.Mesh(new THREE.BoxGeometry(L,H*0.45,W).translate(0,H*0.45/2+10*S,0),body);g.add(base);
  const mid=new THREE.Mesh(new THREE.BoxGeometry(L*0.72,H*0.35,W*0.82).translate(-L*0.06,H*0.45+10*S+H*0.35/2,0),body);g.add(mid);
  const top=new THREE.Mesh(new THREE.BoxGeometry(L*0.38,H*0.25,W*0.5).translate(-L*0.14,H*0.8+10*S+H*0.25/2,0),dark);g.add(top);
  // the dust it lives in, caked along the bottom of everything
  const cake=new THREE.Mesh(new THREE.BoxGeometry(L*1.01,6*S,W*1.01).translate(0,13*S,0),dust);g.add(cake);
  // the intake: a wide mouth low at the front, with its teeth
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(14*S,12*S,W*0.95).translate(0,6*S,0),dark);mouth.position.x=L/2+5*S;g.add(mouth);
  for(let i=0;i<11;i++){const t=new THREE.Mesh(new THREE.BoxGeometry(5*S,3*S,3*S),rust);t.position.set(L/2+12*S,2*S,(i-5)*W*0.085);g.add(t);}
  // the stacks, and the cab high at the front
  const stacks=[];for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(3*S,3.6*S,16*S,8),dark);s.position.set(-L*0.36+i*9*S,H+10*S+8*S,W*0.2);g.add(s);stacks.push(s);}
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(14*S,9*S,W*0.6),dark);cabin.position.set(L*0.36,H*0.8+10*S,0);g.add(cabin);
  const glass=new THREE.Mesh(new THREE.BoxGeometry(0.5*S,3*S,W*0.5),new THREE.MeshBasicMaterial({color:0xffc070}));glass.position.set(L*0.36+7.2*S,H*0.8+13*S,0);g.add(glass);
  // four track units
  const tracks=[];for(const fx of [-1,1])for(const sd of [-1,1]){const tr=new THREE.Mesh(new THREE.BoxGeometry(L*0.4,12*S,10*S).translate(0,6*S,0),dark);tr.position.set(fx*L*0.26,0,sd*(W/2+3*S));g.add(tr);tracks.push(tr);}
  // the lifting points
  for(const fx of [-1,1])for(const sd of [-1,1]){const lp=new THREE.Mesh(new THREE.CylinderGeometry(2*S,2*S,5*S,8),rust);lp.position.set(fx*22*S,H*0.8+10*S+2.5*S,sd*14*S);g.add(lp);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  g.userData.size={L,W,H:H+10*S};
  g.userData.update=now=>{for(let i=0;i<tracks.length;i++)tracks[i].position.y=Math.abs(Math.sin(now*0.004+i))*0.4*S;};
  return g;
}

export function makeMaw(THREE,{radius=40}={}){
  const g=new THREE.Group(),r=radius;
  const flesh=M(THREE,0xb89c72),inner=M(THREE,0x6a4a38),teeth=M(THREE,0xd8ccb0),throat=new THREE.MeshBasicMaterial({color:0x140c08});
  // the body: rings, each a little wider than the one above, the top one the lip
  for(let i=0;i<7;i++){const rr=r*(1+i*0.06);const ring=new THREE.Mesh(new THREE.CylinderGeometry(rr*1.02,rr*1.08,r*0.34,24,1,true),flesh);ring.position.y=-i*r*0.32;g.add(ring);
    const seam=new THREE.Mesh(new THREE.TorusGeometry(rr*1.05,r*0.05,5,24).rotateX(Math.PI/2),inner);seam.position.y=-i*r*0.32-r*0.17;g.add(seam);}
  // the lip opens in petals, and the teeth crowd in from it, row behind row
  for(let k=0;k<3;k++){const pr=new THREE.Mesh(new THREE.CylinderGeometry(r*1.18,r*1.0,r*0.1,24,1,true),flesh);pr.position.y=r*0.2;g.add(pr);}
  for(let row=0;row<4;row++)for(let k=0;k<36;k++){const a=k/36*Math.PI*2+row*0.09,rr=r*(0.95-row*0.14);
    const t=new THREE.Mesh(new THREE.ConeGeometry(r*0.035,r*(0.4-row*0.05),4),teeth);t.position.set(Math.cos(a)*rr,r*0.1-row*r*0.12,Math.sin(a)*rr);
    t.lookAt(0,t.position.y-r*0.3,0);t.rotateX(Math.PI/2);g.add(t);}
  const hole=new THREE.Mesh(new THREE.CircleGeometry(r*0.5,24).rotateX(-Math.PI/2),throat);hole.position.y=-r*0.1;g.add(hole);
  const well=new THREE.Mesh(new THREE.CylinderGeometry(r*0.55,r*0.4,r*2,20,1,true),inner);well.material=inner.clone();well.material.side=THREE.BackSide;well.position.y=-r*1.1;g.add(well);
  return g;
}
