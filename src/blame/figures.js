// ---------- the people ----------
// A person is the only thing in the City whose size you already know, which is why there are two of them on
// the platform. Fan work: these are this project's own figures, built from primitives, after the look of the
// characters rather than any model of them.
//
// Killy: 1.75 m and slight - long in the leg, narrow in the shoulder - in a black suit armoured in overlapping
// plates: pads on the shoulders, a gorget, a plate over the chest with hoses across it, a jacket that hangs
// open to mid-thigh, plates down the fronts of the shins, heavy boots. Black hair, shaggy, over a pale face.
// The GBE in his right hand, a stubby pistol with a long barrel, held down by his thigh.
//
// Cibo: pale suit with darker panels, very long pale hair, crouched at the edge with one hand on the deck.
//
// Both are rigged - a hip, a spine, a chest, a neck, a head, upper and lower limbs - so that they can move a
// little: Killy breathes, shifts his weight and turns his head to look along the void; Cibo's hair moves in
// the draught. update(t) does that, from main.js's animation hooks.

export function makeFigures(THREE){
  const mat=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:18,specular:0x1a1a1a},o||{}));
  const J=()=>new THREE.Group();
  const mesh=(geo,m,x,y,z,rx,ry,rz,parent)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);o.rotation.set(rx||0,ry||0,rz||0);
    o.castShadow=false;o.userData.kind='figure';if(parent)parent.add(o);return o;};
  // a limb segment hanging down from its joint: tapered, with a lathe profile so it is not a pipe
  const seg=(len,r0,r1,m,parent,bulge)=>{const pts=[];const b=bulge||0.12;
    for(let i=0;i<=8;i++){const t=i/8;pts.push(new THREE.Vector2((r0+(r1-r0)*t)*(1+b*Math.sin(Math.PI*t)),-len*t));}
    pts.unshift(new THREE.Vector2(0.0001,0));pts.push(new THREE.Vector2(0.0001,-len));
    return mesh(new THREE.LatheGeometry(pts,12),m,0,0,0,0,0,0,parent);};
  const box=(w,h,d,m,x,y,z,rx,ry,rz,parent)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,rx,ry,rz,parent);

  // ======================================================================= Killy
  function killy(){
    const suit=mat(0x17181b),plate=mat(0x2a2c30,{shininess:40,specular:0x3a3a3a}),plate2=mat(0x34363b,{shininess:40,specular:0x3a3a3a}),
          skin=mat(0xd9d0c6,{shininess:6}),hair=mat(0x0b0b0d,{shininess:30}),hose=mat(0x3d4046),gun=mat(0x1f2023,{shininess:60,specular:0x555555}),
          eye=new THREE.MeshBasicMaterial({color:0x101014});
    const root=J();
    const hip=J();hip.position.y=0.93;root.add(hip);
    // ---- legs ----
    const legs=[];
    for(const sgn of [-1,1]){
      const thigh=J();thigh.position.set(sgn*0.095,-0.02,0);hip.add(thigh);
      seg(0.42,0.078,0.058,suit,thigh);
      box(0.05,0.26,0.13,plate,sgn*0.062,-0.17,0,0,0,sgn*-0.05,thigh);           // thigh plates, outside
      box(0.11,0.14,0.04,plate2,0,-0.14,0.062,0.06,0,0,thigh);                   // and front
      const knee=J();knee.position.y=-0.42;thigh.add(knee);
      mesh(new THREE.SphereGeometry(0.058,10,8),plate,0,0,0.02,0,0,0,knee);
      box(0.1,0.1,0.05,plate2,0,-0.01,0.055,-0.15,0,0,knee);                     // knee guard
      seg(0.4,0.056,0.042,suit,knee,0.18);
      box(0.085,0.27,0.035,plate,0,-0.19,0.048,0.05,0,0,knee);                   // shin plate
      box(0.035,0.2,0.08,plate2,sgn*0.045,-0.2,0,0,0,0,knee);
      const ankle=J();ankle.position.y=-0.41;knee.add(ankle);
      box(0.105,0.1,0.25,plate,0,-0.05,0.045,0,0,0,ankle);                       // boot
      box(0.115,0.035,0.27,suit,0,-0.1,0.05,0,0,0,ankle);                        // sole
      box(0.1,0.06,0.09,plate2,0,0.0,-0.02,0,0,0,ankle);                         // cuff
      legs.push({thigh,knee,ankle,sgn});
    }
    // ---- the belt and the jacket skirt ----
    box(0.3,0.15,0.19,suit,0,0.02,0,0,0,0,hip);
    const belt=box(0.33,0.05,0.215,plate,0,0.07,0,0,0,0,hip);void belt;
    for(const [x,z] of [[-0.14,0.06],[0.15,0.04],[-0.12,-0.09],[0.02,-0.11]])box(0.06,0.07,0.045,plate2,x,0.03,z,0,Math.atan2(x,z),0,hip);
    {// the jacket, open at the front, hanging to mid-thigh
      const pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push(new THREE.Vector2(0.17+0.05*t,0.08-0.36*t));}
      const g=new THREE.LatheGeometry(pts,18,Math.PI*0.62,Math.PI*1.76);
      const skirt=mesh(g,mat(0x1d1e22,{side:THREE.DoubleSide}),0,0,0,0,0,0,hip);skirt.scale.set(1,1,0.78);}
    // ---- the body ----
    const spine=J();spine.position.y=0.06;hip.add(spine);
    {const pts=[new THREE.Vector2(0.0001,0),new THREE.Vector2(0.135,0),new THREE.Vector2(0.13,0.1),new THREE.Vector2(0.155,0.24),
                new THREE.Vector2(0.17,0.34),new THREE.Vector2(0.15,0.44),new THREE.Vector2(0.07,0.49),new THREE.Vector2(0.0001,0.49)];
     const torso=mesh(new THREE.LatheGeometry(pts,16),suit,0,0,0,0,0,0,spine);torso.scale.set(1.12,1,0.72);}
    const chest=J();chest.position.y=0.26;spine.add(chest);
    box(0.27,0.17,0.05,plate,0,0.03,0.105,-0.08,0,0,chest);                        // chest plate
    box(0.22,0.1,0.045,plate2,0,-0.1,0.1,0.04,0,0,chest);                         // and the one under it
    box(0.12,0.24,0.04,plate,0.0,0.0,-0.115,0.05,0,0,chest);                       // back plate
    box(0.25,0.07,0.17,plate2,0,0.19,0,0,0,0,chest);                               // gorget
    // hoses across the chest, into the belt
    for(const [a,b,c] of [[[-0.1,0.1,0.13],[0.02,-0.05,0.16],[0.12,-0.28,0.12]],[[0.09,0.11,0.13],[0.13,-0.02,0.14],[0.08,-0.29,0.12]],[[-0.05,0.14,0.13],[-0.13,-0.05,0.14],[-0.12,-0.3,0.1]]]){
      const curve=new THREE.CatmullRomCurve3([a,b,c].map(p=>new THREE.Vector3(...p)));mesh(new THREE.TubeGeometry(curve,14,0.012,6),hose,0,0,0,0,0,0,chest);}
    // ---- arms ----
    const arms=[];
    for(const sgn of [-1,1]){
      const sh=J();sh.position.set(sgn*0.185,0.15,0);chest.add(sh);
      mesh(new THREE.SphereGeometry(0.058,10,8),suit,0,0,0,0,0,0,sh);
      box(0.13,0.05,0.16,plate,sgn*0.025,0.05,0,0,0,sgn*-0.35,sh);                 // shoulder pad
      box(0.11,0.04,0.14,plate2,sgn*0.05,0.015,0,0,0,sgn*-0.6,sh);
      const upper=J();sh.add(upper);upper.rotation.z=sgn*0.09;
      seg(0.28,0.05,0.042,suit,upper);
      box(0.07,0.12,0.09,plate,sgn*0.028,-0.12,0,0,0,0,upper);
      const elbow=J();elbow.position.y=-0.28;upper.add(elbow);
      mesh(new THREE.SphereGeometry(0.043,8,6),plate,0,0,0,0,0,0,elbow);
      seg(0.25,0.043,0.034,suit,elbow);
      box(0.085,0.16,0.085,plate,0,-0.13,0,0,0,0,elbow);                           // gauntlet
      const wrist=J();wrist.position.y=-0.25;elbow.add(wrist);
      box(0.06,0.09,0.035,suit,0,-0.045,0,0,0,0,wrist);                            // hand
      arms.push({sh,upper,elbow,wrist,sgn});
    }
    // the GBE, in the right hand, muzzle down and a little forward
    {const r=arms.find(a=>a.sgn>0);const w=r.wrist;const g=J();g.position.set(0,-0.07,0.02);g.rotation.x=-1.25;w.add(g);
      box(0.032,0.12,0.075,gun,0,0,0,0,0,0,g);                                     // grip
      box(0.036,0.05,0.13,gun,0,0.06,0.045,0,0,0,g);                               // body
      mesh(new THREE.CylinderGeometry(0.011,0.011,0.17,8),gun,0,0.07,0.18,Math.PI/2,0,0,g);
      mesh(new THREE.CylinderGeometry(0.016,0.016,0.05,8),plate2,0,0.07,0.13,Math.PI/2,0,0,g);
      box(0.004,0.006,0.1,new THREE.MeshBasicMaterial({color:0xc8321f}),0.02,0.06,0.05,0,0,0,g);}
    // ---- the head ----
    const neck=J();neck.position.y=0.23;chest.add(neck);
    mesh(new THREE.CylinderGeometry(0.043,0.05,0.09,10),suit,0,0.03,0,0,0,0,neck);
    const head=J();head.position.y=0.1;neck.add(head);
    const face=mesh(new THREE.SphereGeometry(0.1,18,14),skin,0,0.02,0.008,0,0,0,head);face.scale.set(0.86,1.08,0.95);
    mesh(new THREE.BoxGeometry(0.1,0.03,0.05),skin,0,-0.06,0.045,0,0,0,head);  // jaw
    for(const sgn of [-1,1])box(0.024,0.009,0.006,eye,sgn*0.034,0.03,0.101,0,0,sgn*0.08,head);
    // hair: a cap, and spikes over it pointing down and back - shaggy, over the eyes
    const hm=hair;
    const cap=mesh(new THREE.SphereGeometry(0.108,16,12,0,Math.PI*2,0,Math.PI*0.62),hm,0,0.035,-0.01,0,0,0,head);cap.scale.set(0.95,1.05,1.05);
    {let s=7;const r=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
     for(let i=0;i<46;i++){
       const th=r()*Math.PI*2,ph=0.25+r()*1.1;
       const dir=new THREE.Vector3(Math.sin(ph)*Math.sin(th),Math.cos(ph),Math.sin(ph)*Math.cos(th));
       if(dir.z>0.55&&dir.y<0.5)continue;                                          // leave the face
       const len=0.07+r()*0.07,rad=0.018+r()*0.014;
       const cone=mesh(new THREE.ConeGeometry(rad,len,5),hm,0,0,0,0,0,0,head);
       const base=dir.clone().multiplyScalar(0.098).add(new THREE.Vector3(0,0.03,-0.01));
       // each spike points outwards and then down, the way hair falls
       const out=dir.clone().add(new THREE.Vector3(0,-1.1,-0.2)).normalize();
       cone.position.copy(base).addScaledVector(out,len*0.4);
       cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),out);}
     // the fringe
     for(let i=0;i<7;i++){const x=-0.06+i*0.02;const c=mesh(new THREE.ConeGeometry(0.014,0.07,5),hm,x,0.07,0.085,Math.PI*0.85,0,(x)*2,head);c.position.y-=0.02;}}
    // ---- the pose, and what moves ----
    const L0=legs.find(l=>l.sgn<0),R0=legs.find(l=>l.sgn>0);
    L0.thigh.rotation.set(-0.02,0,0.03);R0.thigh.rotation.set(0.04,0,-0.05);R0.knee.rotation.x=0.07;
    const la=arms.find(a=>a.sgn<0),ra=arms.find(a=>a.sgn>0);
    la.upper.rotation.set(0.05,0,-0.12);la.elbow.rotation.x=-0.18;
    ra.upper.rotation.set(-0.08,0,0.1);ra.elbow.rotation.x=-0.28;ra.wrist.rotation.x=0.2;
    function update(t){
      const br=Math.sin(t*1.3);
      chest.scale.set(1+br*0.012,1+br*0.008,1+br*0.02);
      // weight shift, every twelve seconds or so
      const w=Math.sin(t*0.5)*0.5+0.5;hip.position.x=(w-0.5)*0.018;hip.rotation.z=(w-0.5)*0.03;spine.rotation.z=-(w-0.5)*0.035;
      // a look along the void and back
      const look=Math.sin(t*0.21)*0.55+Math.sin(t*0.53)*0.12;head.rotation.y=look;neck.rotation.y=look*0.3;
      head.rotation.x=0.05+Math.sin(t*0.17)*0.05;
    }
    root.traverse(o=>{if(o.isMesh)o.userData.kind='figure';});
    return {root,update};
  }

  // ======================================================================= Cibo
  function cibo(){
    const suit=mat(0xcfd0d3),panel=mat(0x6e7075,{shininess:30}),skin=mat(0xe6ddd3,{shininess:6}),hairM=mat(0xe8dcb0,{side:THREE.DoubleSide,shininess:10});
    const root=J();
    const hip=J();hip.position.set(0,0.3,-0.05);hip.rotation.x=0.25;root.add(hip);
    for(const sgn of [-1,1]){
      const thigh=J();thigh.position.set(sgn*0.085,0,0);thigh.rotation.set(-1.9,0,sgn*0.1);hip.add(thigh);
      seg(0.4,0.065,0.05,suit,thigh);box(0.08,0.12,0.03,panel,0,-0.2,0.05,0,0,0,thigh);
      const knee=J();knee.position.y=-0.4;thigh.add(knee);knee.rotation.x=2.3;
      seg(0.38,0.05,0.036,suit,knee,0.15);
      const ankle=J();ankle.position.y=-0.38;knee.add(ankle);ankle.rotation.x=-0.5;
      box(0.08,0.07,0.21,panel,0,-0.035,0.05,0,0,0,ankle);
    }
    box(0.26,0.12,0.16,panel,0,0.02,0,0,0,0,hip);
    const spine=J();spine.position.y=0.06;spine.rotation.x=0.45;hip.add(spine);
    {const pts=[new THREE.Vector2(0.0001,0),new THREE.Vector2(0.11,0),new THREE.Vector2(0.105,0.12),new THREE.Vector2(0.13,0.28),
                new THREE.Vector2(0.12,0.38),new THREE.Vector2(0.05,0.42),new THREE.Vector2(0.0001,0.42)];
     const t=mesh(new THREE.LatheGeometry(pts,14),suit,0,0,0,0,0,0,spine);t.scale.set(1.1,1,0.72);}
    box(0.2,0.13,0.04,panel,0,0.26,0.085,-0.1,0,0,spine);
    box(0.04,0.3,0.03,panel,0,0.15,-0.09,0,0,0,spine);
    for(const sgn of [-1,1]){
      const sh=J();sh.position.set(sgn*0.15,0.36,0);spine.add(sh);
      const up=J();sh.add(up);up.rotation.set(sgn>0?-0.9:-0.4,0,sgn*0.15);seg(0.26,0.04,0.034,suit,up);
      const el=J();el.position.y=-0.26;up.add(el);el.rotation.x=sgn>0?-0.9:-0.3;seg(0.24,0.034,0.028,suit,el);
      box(0.055,0.08,0.03,skin,0,-0.28,0,0,0,0,el);
    }
    const neck=J();neck.position.y=0.42;spine.add(neck);
    mesh(new THREE.CylinderGeometry(0.036,0.042,0.08,10),suit,0,0.03,0,0,0,0,neck);
    const head=J();head.position.y=0.1;head.rotation.x=-0.3;neck.add(head);
    const f=mesh(new THREE.SphereGeometry(0.092,16,12),skin,0,0.01,0.01,0,0,0,head);f.scale.set(0.85,1.08,0.95);
    const cap=mesh(new THREE.SphereGeometry(0.1,16,12,0,Math.PI*2,0,Math.PI*0.58),hairM,0,0.03,-0.012,0,0,0,head);cap.scale.set(1,1.05,1.08);
    // the hair: long strips from the crown down the back, each on its own joint so it can move
    const strands=[];
    for(let i=0;i<9;i++){
      const a=-0.9+i*0.225,j=J();j.position.set(Math.sin(a)*0.085,0.05,-Math.cos(a)*0.07);j.rotation.set(0.25,a*0.4,0);head.add(j);
      const len=0.6+0.12*Math.cos(a*2);
      const g=new THREE.PlaneGeometry(0.05,len,1,6);g.translate(0,-len/2,0);
      const pos=g.attributes.position;for(let k=0;k<pos.count;k++){const y=pos.getY(k);pos.setZ(k,-0.08*Math.sin(-y/len*Math.PI*0.9));}
      g.computeVertexNormals();mesh(g,hairM,0,0,0,0,0,0,j);strands.push({j,a,b:j.rotation.x});
    }
    function update(t){
      for(const s of strands){s.j.rotation.x=s.b+Math.sin(t*0.9+s.a*3)*0.06+Math.sin(t*2.3+s.a)*0.02;s.j.rotation.z=Math.sin(t*0.7+s.a*2)*0.05;}
      head.rotation.y=Math.sin(t*0.13+1)*0.3;
    }
    root.traverse(o=>{if(o.isMesh)o.userData.kind='figure';});
    return {root,update};
  }
  return {killy,cibo};
}
