// ---------- the three dragons ----------
// Fan work: Breath of the Wild belongs to Nintendo; every shape here is this project's own.
//
// Dinraal (fire, red and gold) flies its circuit over Akkala, Eldin and Tabantha; Naydra (ice, blue and white)
// coils round Mount Lanayru; Farosh (lightning, green and gold) runs from Faron over Lake Hylia to the Gerudo
// Highlands and back. Each is a long serpent of some seventy segments, three hundred metres of it, swimming through
// the air in waves: a crest of fins down its back and a mane round its neck, four small legs with claws, the head
// long in the snout with branching horns, glowing eyes, and long whiskers trailing; it sheds its element as it goes -
// embers, snow, sparks and the odd crack of lightning. The body is instanced: a handful of draw calls a dragon.
//
// makeDragon(api, kind, emit) -> { update(dt), head:Vector3, dir:Vector3, done, remove() }; the events make and drive
// them (events.js: dinraal, naydra, farosh).

const KINDS={
  dinraal:{body:0xc83a2a,belly:0xe8a050,mane:0xff8a2a,horn:0xe8c060,eye:0xffe08a,fx:[0xff6a1a,0xffb03a],route:[[1310,330],[1180,420],[1040,400],[930,300],[800,220],[660,250],[540,320],[600,420],[760,430],[930,470],[1100,500],[1250,440]],alt:240},
  naydra:{body:0x6ab0e0,belly:0xdaf0ff,mane:0xf4fbff,horn:0xbcd8ec,eye:0x9ae8ff,fx:[0xffffff,0xcfeaff],route:[[1300,730],[1400,790],[1410,900],[1330,970],[1230,950],[1180,860],[1200,780]],alt:260},
  farosh:{body:0x9ab838,belly:0xe8e070,mane:0xf0e040,horn:0xe8c060,eye:0xfff08a,fx:[0xfff07a,0xbfff6a],route:[[1000,1060],[880,1000],[760,960],[640,1000],[520,960],[400,900],[280,950],[300,1080],[440,1140],[620,1110],[820,1130],[960,1120]],alt:220}};

export function makeDragon(api,kind,emit){
  const {THREE,scene,groundH}=api,K=KINDS[kind],P=(px,py)=>[(px-760)*8,(py-620)*8];
  const L=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{}));
  const glow=c=>new THREE.MeshBasicMaterial({color:c});
  const tag=o=>{o.userData.noFingerprint=true;o.userData.noWire=true;o.frustumCulled=false;o.castShadow=true;return o;};
  // the route: a closed curve at a height well over the ground along it
  const pts=K.route.map(([a,b])=>{const [x,z]=P(a,b);let h=0;for(let k=0;k<12;k++){const r=k<1?0:160;const q=k/12*Math.PI*2;h=Math.max(h,groundH(x+Math.cos(q)*r,z+Math.sin(q)*r));}
    return new THREE.Vector3(x,h+K.alt,z);});
  const curve=new THREE.CatmullRomCurve3(pts,true,'centripetal'),len=curve.getLength();
  const N=70,SEG=4.4,grp=new THREE.Group();scene.add(grp);
  const bodyM=L(K.body),bellyM=L(K.belly),maneM=L(K.mane),hornM=L(K.horn),eyeM=glow(K.eye);
  // the body: a tapering cylinder per segment; the crest of fins; the mane round the neck
  const body=tag(new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,10),bodyM,N));grp.add(body);
  const belly=tag(new THREE.InstancedMesh(new THREE.CylinderGeometry(1,1,1,8,1,false,Math.PI*0.75,Math.PI*0.5),bellyM,N));grp.add(belly);
  const fins=tag(new THREE.InstancedMesh(new THREE.ConeGeometry(1,1,4).translate(0,0.5,0),maneM,N));grp.add(fins);
  const mane=tag(new THREE.InstancedMesh(new THREE.ConeGeometry(0.6,1,4).translate(0,0.5,0),maneM,36));grp.add(mane);
  const rad=i=>{const t=i/N;return 5.2*(t<0.06?0.75+t*4:1-Math.pow(t,1.6)*0.86);};
  // the legs: two pairs, each a thigh, a shin, three claws, at a tenth and at a half of the way down
  const legAt=[7,33],legs=tag(new THREE.InstancedMesh(new THREE.CylinderGeometry(0.8,1,1,6).translate(0,-0.5,0),bodyM,8)),claws=tag(new THREE.InstancedMesh(new THREE.ConeGeometry(0.35,1.6,4).translate(0,-0.8,0),hornM,12));grp.add(legs,claws);
  // the head: a long snout, a jaw, brows, the eyes, the horns branching back, the whiskers
  const head=new THREE.Group();grp.add(head);
  const add=(g,m,x,y,z,rx,ry,rz,sx,sy,sz)=>{const o=tag(new THREE.Mesh(g,m));o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.scale.set(sx||1,sy||1,sz||1);head.add(o);return o;};
  add(new THREE.CylinderGeometry(3.2,5.4,13,10).rotateZ(-Math.PI/2),bodyM,6,0,0);                                // the skull, along +x
  add(new THREE.BoxGeometry(9,2.6,6),bodyM,15,-0.4,0);add(new THREE.BoxGeometry(8,1.4,5),bellyM,14,-2.4,0,0,0,-0.12); // the snout and the jaw
  for(const s of [-1,1]){add(new THREE.SphereGeometry(1,10,8),eyeM,9,2.1,s*3.4,0,0,0,1.2,0.8,0.7);add(new THREE.BoxGeometry(5,1,1.6),bodyM,9,3.2,s*3.2,0,0,0.15);
    // the horns: a long beam sweeping back with tines off it
    const h0=[6,3,s*2.4],h1=[-6,9,s*6],h2=[-16,12,s*7.4];
    for(const [a,b,r] of [[h0,h1,0.9],[h1,h2,0.6],[[2,5,s*3.6],[2,11,s*5],0.5],[[-3,7.5,s*5],[-4,14,s*7],0.45],[[-10,10.5,s*6.6],[-9,17,s*8],0.35]]){
      const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),m=add(new THREE.CylinderGeometry(r*0.5,r,d.length(),5),hornM,0,0,0);
      m.position.copy(A).addScaledVector(d,0.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
    // the whiskers: long, curving back and down from the snout
    const w=[];for(let k=0;k<=10;k++){const t=k/10;w.push(new THREE.Vector3(18-t*38,-1-t*8+Math.sin(t*5)*2,s*(3+t*10)));}
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(w),16,0.35,4),maneM,0,0,0);}
  const fx=K.fx,dm=new THREE.Object3D(),UP=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),tmp=new THREE.Vector3();
  let s=Math.random(),t=0;const speed=42/len;     // forty-odd metres a second along the route
  const pos=[];for(let i=0;i<=N;i++)pos.push(new THREE.Vector3());
  const D={head:new THREE.Vector3(),dir:new THREE.Vector3(1,0,0),done:false,lightning:null};
  // a crack of lightning for Farosh, now and then, from the body to the ground
  const boltM=new THREE.LineBasicMaterial({color:0xfff6b0,transparent:true,opacity:0}),boltG=new THREE.BufferGeometry();boltG.setAttribute('position',new THREE.BufferAttribute(new Float32Array(14*3),3));
  const bolt=tag(new THREE.Line(boltG,boltM));grp.add(bolt);let boltT=0;
  D.update=dt=>{t+=dt;s=(s+speed*dt)%1;
    // each segment trails the head along the route, swimming in waves up and down and side to side
    for(let i=0;i<=N;i++){const u=((s-i*SEG/len)%1+1)%1;curve.getPointAt(u,pos[i]);
      curve.getTangentAt(u,tmp);const sx=-tmp.z,sz=tmp.x,w=Math.sin(t*1.6-i*0.22)*9,v=Math.sin(t*1.1-i*0.17)*7;pos[i].x+=sx*w;pos[i].z+=sz*w;pos[i].y+=v;}
    let fi=0;
    for(let i=0;i<N;i++){const a=pos[i],b=pos[i+1],d=tmp.copy(a).sub(b),l=d.length(),r=rad(i);d.normalize();q.setFromUnitVectors(UP,d);
      dm.position.copy(a).add(b).multiplyScalar(0.5);dm.quaternion.copy(q);dm.scale.set(r,l*1.25,r);dm.updateMatrix();body.setMatrixAt(i,dm.matrix);
      dm.scale.set(r*1.03,l*1.2,r*1.03);dm.updateMatrix();belly.setMatrixAt(i,dm.matrix);
      // a fin on the back of each segment: up from the top of the body, raked back
      dm.position.y+=r*0.85;dm.quaternion.setFromUnitVectors(UP,new THREE.Vector3(-d.x*0.6,1,-d.z*0.6).normalize());const fh=(i<6?0:r*0.75)*(1+0.3*Math.sin(i*1.7));dm.scale.set(r*0.14+0.15,fh,r*0.5);dm.updateMatrix();fins.setMatrixAt(i,dm.matrix);
      if(i<6)for(let k=0;k<6;k++){const an=k/6*Math.PI*2+t*0.5,m=dm.position.clone();m.y-=r*0.85;const off=new THREE.Vector3(Math.cos(an),Math.sin(an)*0.8+0.3,Math.sin(an));
        dm.position.copy(m).addScaledVector(off,r);dm.quaternion.setFromUnitVectors(UP,off.clone().addScaledVector(d,-1.4).normalize());dm.scale.set(1.2,7+k%2*3,1.2);dm.updateMatrix();if(fi<36)mane.setMatrixAt(fi++,dm.matrix);}}
    // the legs, hanging and paddling below their segments
    let li=0,ci=0;for(const at of legAt){const a=pos[at],b=pos[at+1],d=tmp.copy(a).sub(b).normalize(),side=new THREE.Vector3(-d.z,0,d.x).normalize(),r=rad(at);
      for(const sgn of [-1,1]){const hip=a.clone().addScaledVector(side,sgn*r*0.9),sw=Math.sin(t*3+at+sgn)*0.5;
        const knee=hip.clone().add(new THREE.Vector3(0,-r*1.2,0)).addScaledVector(d,sw*r).addScaledVector(side,sgn*r*0.6);const foot=knee.clone().add(new THREE.Vector3(0,-r*1.1,0)).addScaledVector(d,-r*0.6);
        for(const [p0,p1] of [[hip,knee],[knee,foot]]){const v=p1.clone().sub(p0);dm.position.copy(p0);dm.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),v.clone().normalize());dm.scale.set(r*0.3,v.length(),r*0.3);dm.updateMatrix();legs.setMatrixAt(li++,dm.matrix);}
        for(let c=-1;c<=1;c++){dm.position.copy(foot);dm.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),new THREE.Vector3(0,-1,0).addScaledVector(d,0.8).addScaledVector(side,c*0.6).normalize());dm.scale.set(r*0.4,r*0.5,r*0.4);dm.updateMatrix();claws.setMatrixAt(ci++,dm.matrix);}}}
    for(const im of [body,belly,fins,mane,legs,claws])im.instanceMatrix.needsUpdate=true;
    // the head at the front, looking along the way it goes
    const d0=tmp.copy(pos[0]).sub(pos[2]).normalize();head.position.copy(pos[0]).addScaledVector(d0,2);head.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),d0);
    head.scale.setScalar(1.7);D.head.copy(head.position);D.dir.copy(d0);
    // its element, shed along the body
    for(let k=0;k<6;k++){const i=Math.floor(Math.random()*N),p=pos[i],c=fx[k%2];
      if(kind==='naydra')emit(p.x+(Math.random()-0.5)*14,p.y,p.z+(Math.random()-0.5)*14,(Math.random()-0.5)*3,-2,(Math.random()-0.5)*3,c,6,3);
      else if(kind==='dinraal')emit(p.x,p.y,p.z,(Math.random()-0.5)*8,3+Math.random()*6,(Math.random()-0.5)*8,c,2.5,-1);
      else emit(p.x,p.y,p.z,(Math.random()-0.5)*20,(Math.random()-0.5)*20,(Math.random()-0.5)*20,c,0.5,0);}
    if(kind==='farosh'){boltT-=dt;if(boltT<=0){boltT=2+Math.random()*3;const i=Math.floor(Math.random()*N),p=pos[i],gy=groundH(p.x,p.z),a=boltG.attributes.position;
        for(let k=0;k<14;k++){const u=k/13;a.setXYZ(k,p.x+(k&&k<13?(Math.random()-0.5)*30:0),p.y+(gy-p.y)*u,p.z+(k&&k<13?(Math.random()-0.5)*30:0));}a.needsUpdate=true;boltM.opacity=1;}
      boltM.opacity=Math.max(0,boltM.opacity-dt*3);}};
  D.remove=()=>{scene.remove(grp);};
  return D;
}
