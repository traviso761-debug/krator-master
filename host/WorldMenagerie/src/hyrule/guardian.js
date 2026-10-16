// ---------- the Guardian: one model for the Stalkers that walk and the ones that fell ----------
// Fan work: Breath of the Wild belongs to Nintendo, and every shape here is this project's own.
//
// A dome of a head on a squat drum of a body, the drum's belly coming to a point underneath; the head turns, and
// its one eye stands out of the front in a housing with a rim round it. Lines run over the dome - rings round it and
// lines down it like a circuit - and on a live Guardian they glow. Six spider legs: from the hip up and out to the
// knee, then a long shin down to a pointed foot.
//
// make({})         a live Guardian: { g, head, legs, eye }. The head turns about y; each leg is a group at its hip
//                  (local x outward) that the caller swings (y) and lifts (z); eye is an anchor at the lens.
// fallen(parts, x, y, z, yaw, seed)
//                  a decayed one, pushed into `parts` as meshes in world space: sunk to the drum, the head tipped
//                  (or come off and lying beside it), some legs folded, some gone, moss on it, the eye dark.
// Every live piece is merged by material inside its own moving part, so a Guardian is about twenty draw calls.

export function guardianKit(THREE){
  const L=(c)=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
  const M={shell:L(0x9c937f),shell2:L(0x7f776a),metal:L(0x55524c),dark:L(0x2a2826),moss:L(0x58783a),moss2:L(0x6e8c44),
    lineOn:new THREE.MeshBasicMaterial({color:0xff8a3a}),lineOff:L(0x4a463e),
    lensOn:new THREE.MeshBasicMaterial({color:0xffc890}),lensOff:L(0x1c2024),irisOn:new THREE.MeshBasicMaterial({color:0xff3a22})};
  const UP=new THREE.Vector3(0,1,0),O=new THREE.Object3D();
  const R=4,SQ=0.85;                                     // the dome's radius, and how much it is squashed

  // a bucket of pieces: [geometry already moved into the part's frame, material]
  const put=(bk,geo,mat,x,y,z,rx,ry,rz,sx,sy,sz)=>{O.position.set(x||0,y||0,z||0);O.rotation.set(rx||0,ry||0,rz||0);O.scale.set(sx||1,sy||sx||1,sz||sx||1);O.updateMatrix();
    bk.push([geo.applyMatrix4(O.matrix),mat]);};
  const seg=(bk,a,b,r0,r1,mat,n)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),l=d.length();
    const g=new THREE.CylinderGeometry(r1,r0,l,n||7);const q=new THREE.Quaternion().setFromUnitVectors(UP,d.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate(A.x+d.x/2,A.y+d.y/2,A.z+d.z/2);bk.push([g,mat]);};
  // merge a bucket into one mesh per material
  const merge=(bk)=>{const by=new Map();for(const [g,m] of bk){if(!by.has(m))by.set(m,[]);by.get(m).push(g.index?g.toNonIndexed():g);}
    const out=[];for(const [m,gs] of by){let n=0;for(const g of gs)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;
      for(const g of gs){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count;}
      const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(pos,3));G.setAttribute('normal',new THREE.BufferAttribute(nor,3));G.computeBoundingSphere();
      out.push(new THREE.Mesh(G,m));}return out;};

  // ---- the body: a drum, a band, the pointed belly, six hip sockets and the vents between them ----
  const HIP=3.1,HIPY=-0.4;
  function body(live){const bk=[];
    put(bk,new THREE.CylinderGeometry(3.7,3.0,1.8,18),M.shell2,0,0,0);
    put(bk,new THREE.TorusGeometry(3.72,0.3,5,24),M.metal,0,0.9,0,Math.PI/2);
    put(bk,new THREE.ConeGeometry(3.0,2.0,18),M.metal,0,-1.9,0,Math.PI);
    put(bk,new THREE.SphereGeometry(0.7,8,6),M.dark,0,-2.9,0);
    put(bk,new THREE.TorusGeometry(3.42,0.08,4,32),live?M.lineOn:M.lineOff,0,-0.55,0,Math.PI/2);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2,b=a+Math.PI/6;
      put(bk,new THREE.SphereGeometry(0.78,8,6),M.metal,Math.cos(a)*HIP,HIPY,Math.sin(a)*HIP);
      put(bk,new THREE.BoxGeometry(0.35,1.0,1.1),M.dark,Math.cos(b)*3.45,0.05,Math.sin(b)*3.45,0,-b);}
    return bk;}

  // ---- the head: the dome, its rim and cap, the glowing lines, and the eye in its housing at the front (+x) ----
  const EYE_EL=0.42,PE=[R*Math.cos(EYE_EL),R*SQ*Math.sin(EYE_EL),0];
  function head(live){const bk=[],line=live?M.lineOn:M.lineOff;
    put(bk,new THREE.SphereGeometry(R,22,10,0,Math.PI*2,0,Math.PI/2),M.shell,0,0,0,0,0,0,1,SQ,1);
    put(bk,new THREE.CylinderGeometry(R+0.12,R+0.05,0.55,24),M.metal,0,0.05,0);
    put(bk,new THREE.CylinderGeometry(1.25,1.6,0.55,12),M.shell2,0,R*SQ-0.05,0);
    put(bk,new THREE.TorusGeometry(1.42,0.07,4,24),line,0,R*SQ+0.25,0,Math.PI/2);
    // rings round the dome, and the lines running down it - not across the eye
    for(const el of [0.22,0.7,1.08])put(bk,new THREE.TorusGeometry(R*Math.cos(el)+0.03,0.075,4,48),line,0,R*SQ*Math.sin(el)+0.02,0,Math.PI/2,0,0,1,1,1);
    const P=(el,th,k)=>[(R+k)*Math.cos(el)*Math.cos(th),(R*SQ+k)*Math.sin(el),(R+k)*Math.cos(el)*Math.sin(th)];
    for(let i=0;i<10;i++){const th=(i+0.5)/10*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(th),Math.cos(th)))<0.5)continue;
      const e1=i%2?0.22:0.7;for(let k=0;k<3;k++){const a=e1+k*(1.1-e1)/3,b=e1+(k+1)*(1.1-e1)/3;seg(bk,P(a,th,0.03),P(b,th,0.03),0.07,0.07,line,4);}}
    // raised plates between the lines, on the lower dome
    for(let i=0;i<5;i++){const th=(i+0.5)/5*Math.PI*2+0.6;if(Math.abs(Math.atan2(Math.sin(th),Math.cos(th)))<0.7)continue;const p=P(0.45,th,-0.1);
      put(bk,new THREE.BoxGeometry(0.25,1.2,1.6),M.shell2,p[0],p[1],p[2],0,-th,-0.45);}
    // the eye: a housing standing out of the dome, a rim, the lens, the iris
    put(bk,new THREE.CylinderGeometry(1.55,1.8,1.4,18),M.shell2,PE[0]+0.2,PE[1],0,0,0,-Math.PI/2);
    put(bk,new THREE.TorusGeometry(1.5,0.2,6,22),M.metal,PE[0]+0.92,PE[1],0,0,Math.PI/2);
    put(bk,new THREE.SphereGeometry(1.3,16,10),live?M.lensOn:M.lensOff,PE[0]+0.8,PE[1],0,0,0,0,0.45,1,1);
    put(bk,new THREE.CircleGeometry(0.55,18),live?M.irisOn:M.dark,PE[0]+1.4,PE[1],0,0,Math.PI/2);
    // the brow over the eye
    put(bk,new THREE.BoxGeometry(1.4,0.35,3.2),M.shell2,PE[0]+0.2,PE[1]+1.75,0,0,0,-0.35);
    return bk;}

  // ---- a leg, in its hip's frame (x outward): the thigh up to the knee, the shin down to the foot ----
  const KNEE=[3.2,3.0,0],SHIN=[5.0,-1.6,0],FOOT=[6.0,-6.1,0];
  function leg(live,broken){const bk=[];
    seg(bk,[0,0,0],KNEE,0.58,0.45,M.shell2,8);
    seg(bk,[0.3,0.55,0],[KNEE[0]-0.2,KNEE[1]+0.4,0],0.2,0.14,M.shell,5);       // the ridge along the thigh
    put(bk,new THREE.SphereGeometry(0.68,8,6),M.metal,...KNEE);
    if(broken)return bk;
    seg(bk,KNEE,SHIN,0.46,0.36,M.shell2,8);
    put(bk,new THREE.SphereGeometry(0.38,8,6),M.metal,...SHIN);
    seg(bk,SHIN,FOOT,0.3,0.12,M.metal,7);
    put(bk,new THREE.ConeGeometry(0.34,1.0,6),M.metal,FOOT[0],FOOT[1]-0.1,0,Math.PI);
    if(live)put(bk,new THREE.SphereGeometry(0.16,6,4),M.lineOn,KNEE[0]+0.45,KNEE[1]+0.35,0);
    return bk;}

  const BODY_Y=6.1-HIPY;                                   // so a standing leg's foot is on the ground
  const HEAD_Y=0.95;                                       // the head sits on the drum
  function make(){
    const g=new THREE.Group(),bodyG=new THREE.Group();bodyG.position.y=BODY_Y;g.add(bodyG);
    for(const m of merge(body(true)))bodyG.add(m);
    const headG=new THREE.Group();headG.position.y=HEAD_Y;bodyG.add(headG);for(const m of merge(head(true)))headG.add(m);
    const eye=new THREE.Object3D();eye.position.set(PE[0]+1.45,PE[1],0);headG.add(eye);
    const legs=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2,lg=new THREE.Group();lg.position.set(Math.cos(a)*HIP,HIPY,Math.sin(a)*HIP);lg.rotation.y=-a;lg.userData.yaw=-a;
      for(const m of merge(leg(true,false)))lg.add(m);bodyG.add(lg);legs.push(lg);}
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    return {g,body:bodyG,head:headG,legs,eye};}

  // a hash for the fallen ones, so each lies its own way
  const hz=v=>{const t=Math.sin(v*12.9898)*43758.5453;return t-Math.floor(t);};
  function fallen(parts,x,y,z,yaw,seed){const s=seed||0,g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw||0;
    const sink=1.4+hz(s+1)*1.6,bodyG=new THREE.Group();bodyG.position.y=3.0-sink;bodyG.rotation.set((hz(s+2)-0.5)*0.35,0,(hz(s+3)-0.5)*0.35);g.add(bodyG);
    for(const [geo,m] of body(false)){const me=new THREE.Mesh(geo,m);bodyG.add(me);}
    const headG=new THREE.Group();
    if(hz(s+4)<0.25){headG.position.set(8+hz(s+5)*3,-bodyG.position.y-0.2,2);headG.rotation.set(0.4,hz(s+6)*6,1.2+hz(s+7)*0.4);}   // come off, lying on its side
    else{headG.position.y=HEAD_Y;headG.rotation.set((hz(s+8)-0.5)*0.5,hz(s+9)*6,0.25+hz(s+10)*0.35);}
    bodyG.add(headG);for(const [geo,m] of head(false))headG.add(new THREE.Mesh(geo,m));
    for(let i=0;i<6;i++){const r=hz(s+11+i);if(r<0.28)continue;                               // gone
      const a=i/6*Math.PI*2,lg=new THREE.Group();lg.position.set(Math.cos(a)*HIP,HIPY,Math.sin(a)*HIP);
      lg.rotation.set(0,-a+(hz(s+20+i)-0.5)*0.5,r<0.6?-0.9-hz(s+30+i)*0.4:-0.25);           // folded under, or splayed out
      for(const [geo,m] of leg(false,r<0.45))lg.add(new THREE.Mesh(geo,m));bodyG.add(lg);}
    // moss over the top, a little grass and a tuft or two on the legs
    for(let k=0;k<4+Math.floor(hz(s+40)*4);k++){const th=hz(s+41+k)*6.28,el=0.6+hz(s+51+k)*0.9,m=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2+hz(s+61+k)*1.2,0),k%2?M.moss:M.moss2);
      m.position.set(R*Math.cos(el)*Math.cos(th),R*SQ*Math.sin(el)+0.1,R*Math.cos(el)*Math.sin(th));m.lookAt(m.position.x*2,m.position.y*2+2,m.position.z*2);m.scale.set(1.3,1.3,0.3);headG.add(m);}
    g.updateMatrixWorld(true);
    g.traverse(o=>{if(o.isMesh)parts.push(new THREE.Mesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material));});}

  return {make,fallen,M};
}
