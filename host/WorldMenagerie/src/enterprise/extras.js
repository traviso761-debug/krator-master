// ---------- Galaxy class: the rest of it ----------
// Fan work. Star Trek belongs to Paramount; the starbase here is this project's own design, not any station from any
// film or series.
//
//   The starbase   at home, ten kilometres off the starboard bow: a spindle with a habitat ring on four spokes,
//                  radiators, beacons, lit windows, a docking arm with a berth beside it, and small craft coming and
//                  going round it. K (or "Dock") takes the ship in under autopilot: it lines up astern of the berth,
//                  comes in slowing as it closes, and is made fast. K again, or the helm, casts off.
//   Hull breaches  a hit on the hull with the shields down can hole it: air vents from the hole as a plume of
//                  freezing crystals and a fire burns behind it, both dying away over half a minute.
//   Escape pods    "Abandon ship": the pods come out of their hatches on the saucer, in rings, and drift off.
//   Self-destruct  a ten-second countdown (pressed again, cancelled), then the warp core lets go: a flash, a ring of
//                  shock running out across the plane of the ship, wreckage; and, a little later, because this is a
//                  page, the ship again.
//   A grand tour   every place on the chart in turn, the camera on the flyby, a while at each.
import {SAUCER} from './dims.js';
import {saucerTop} from './hull.js';
import {PLACES} from './places.js';

export function extras(W){
  const {THREE,ROOT,G,SAU,SYS,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();

  // ================= the starbase =================
  const SB=new THREE.Group();SB.position.set(9000,350,4800);SB.rotation.y=-0.5;
  const sb=(()=>{
    const light=new THREE.MeshStandardMaterial({color:0xb8bec4,metalness:0.45,roughness:0.42,envMap:W.env,envMapIntensity:1.2});
    const mid=new THREE.MeshStandardMaterial({color:0x8a9097,metalness:0.5,roughness:0.5,envMap:W.env});
    const dark=new THREE.MeshStandardMaterial({color:0x40464e,metalness:0.4,roughness:0.6,envMap:W.env});
    const winM=new THREE.MeshBasicMaterial({color:0xffe2b0,toneMapped:false});
    const add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=m.receiveShadow=true;SB.add(m);return m;};
    // the spindle: a lathe, stacked decks swelling to a hub at the ring's level
    const prof=[[0,-760],[60,-740],[95,-640],[110,-520],[90,-470],[120,-380],[120,-160],[190,-80],[230,0],[190,80],[120,160],[120,380],[95,460],[70,560],[40,660],[8,720],[0,724]].map(([r,y])=>new THREE.Vector2(r,y));
    add(new THREE.LatheGeometry(prof,64),light);
    for(const y of [-420,-300,-200,240,340])add(new THREE.CylinderGeometry(126,126,14,64),mid,0,y,0);
    // the habitat ring, and its windows in two rows, inside and out
    add(new THREE.TorusGeometry(900,62,24,180),light).rotation.x=Math.PI/2;
    add(new THREE.TorusGeometry(900,64,6,180,Math.PI*2),dark).scale.set(1,1,0.12);
    SB.children[SB.children.length-1].rotation.x=Math.PI/2;
    {const n=1400,im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),winM,n),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
     for(let i=0;i<n;i++){const a=(i%700)/700*Math.PI*2,row=i<700?1:-1,r=900+row*63.5,lit=Math.sin(i*12.9898)*43758.5453%1;
       e.set(0,-a,0);q.setFromEuler(e);m.compose(new THREE.Vector3(Math.cos(a)*r,(Math.abs(lit)>0.5?14:-14),Math.sin(a)*r),q,new THREE.Vector3(2,4,3.2));im.setMatrixAt(i,m);}
     im.userData.noWire=true;SB.add(im);}
    // four spokes, and the radiators off the spindle's top
    for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4,s=add(new THREE.CylinderGeometry(22,22,680,12),mid,Math.cos(a)*560,0,Math.sin(a)*560);s.rotation.z=Math.PI/2;s.rotation.y=-a;}
    for(let k=0;k<3;k++){const a=k*Math.PI*2/3,p=add(new THREE.BoxGeometry(420,6,110),dark,Math.cos(a)*300,520,Math.sin(a)*300);p.rotation.y=-a;}
    // the docking arm: a truss out below the ring, lit along its length, the berth beside its end
    const arm=add(new THREE.BoxGeometry(1500,26,26),mid,860,-520,0);
    for(let x=180;x<=1600;x+=70){const l=F.sprite(0xffe2b0,14,0.9);l.position.set(x,-505,13);SB.add(l);}
    add(new THREE.BoxGeometry(60,60,60),dark,1620,-520,0);
    // beacons, blinking
    const beacons=[];for(const [x,y,z,c] of [[0,730,0,0xff3020],[0,-768,0,0xff3020],[960,0,0,0x30ff60],[-960,0,0,0xff3020],[1650,-520,0,0xffffff]]){const s=F.sprite(c,40,1);s.position.set(x,y,z);SB.add(s);beacons.push(s);}
    // floodlights on the hub's flanks
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,s=F.sprite(0xfff4d8,140,0.35);s.position.set(Math.cos(a)*235,0,Math.sin(a)*235);SB.add(s);}
    SB.traverse(o=>{o.userData.noWire=true;});
    SB.userData.info={name:'The starbase',info:'A station of this project\'s own design: a spindle and a habitat ring, a docking arm. K at the helm docks.'};
    return {beacons};
  })();
  W.homePlace.group.add(SB);
  W.homePlace.solids.push({name:'the starbase',c:SB.position.clone(),r:560});
  // small craft round the station, each on a tilted loop of its own
  const craft=[];
  for(let i=0;i<5;i++){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0xc0c4c8,metalness:0.3,roughness:0.5,envMap:W.env});
    const b=new THREE.Mesh(new THREE.BoxGeometry(14,5,7),m);g.add(b);const e=F.sprite(0x9fc8ff,12,0.9);e.position.x=-8;g.add(e);
    const l=F.sprite(i%2?0xff3020:0x30ff60,6,1);l.position.set(2,3,0);g.add(l);
    g.userData={a:i*1.3,r:1300+i*230,w:(i%2?1:-1)*(0.04+i*0.008),tilt:(i-2)*0.25};g.traverse(o=>{o.userData.noWire=o.userData.noWire||true;});SB.add(g);craft.push(g);}
  let tt=0;
  animHooks.push(()=>{tt+=0.016;
    for(const [i,b] of sb.beacons.entries())b.material.opacity=((tt*0.8+i*0.37)%1)<0.12?1:0.12;
    for(const g of craft){const u=g.userData;u.a+=u.w*0.016;const x=Math.cos(u.a)*u.r,z=Math.sin(u.a)*u.r;g.position.set(x,Math.sin(u.a*2)*120+z*Math.sin(u.tilt),z*Math.cos(u.tilt));
      g.rotation.y=-u.a-(u.w>0?Math.PI/2:-Math.PI/2);}});

  // ---- docking ----
  // The berth is beside the arm's end, the ship facing in along the arm towards the station. Approach control
  // takes the helm: a smooth curve from wherever the ship is to a point out beyond the arm's end, already lined
  // up, then in along the arm at a walking pace, slowing to nothing at the clamps. Any touch on the helm cancels.
  const BERTH=new THREE.Vector3(1050,-520,330),AFT=new THREE.Vector3(2600,-520,330);
  const dock={phase:null};
  const toW=v=>SB.localToWorld(v.clone());
  const armDir=()=>V().set(1,0,0).applyQuaternion(SB.getWorldQuaternion(new THREE.Quaternion()));
  const ease=u=>u<0?0:u>1?1:u*u*(3-2*u),bez=(a,b,c,d,t)=>{const s=1-t;return a.clone().multiplyScalar(s*s*s).addScaledVector(b,3*s*s*t).addScaledVector(c,3*s*t*t).addScaledVector(d,t*t*t);};
  function doDock(){
    if(dock.phase==='docked'){dock.phase=null;W.setThrottle(0.15);F.note('Cast off.');return;}
    if(dock.phase){dock.phase=null;F.note('Docking cancelled.');return;}
    if(W.herePlace()!==W.homePlace||!SB.parent||!W.homePlace.group.visible){F.note('There is no starbase here.');return;}
    if(!S.on)W.startFlight();
    const d=toW(BERTH).distanceTo(ROOT.position);if(d>80000){F.note('The starbase is too far off to dock.');return;}
    S.orbit=null;W.course&&W.course.clear();
    // the curve, in the station's frame, so that it holds if the floating origin moves
    const p0=SB.worldToLocal(ROOT.position.clone()),f=V().set(1,0,0).applyQuaternion(ROOT.quaternion).applyQuaternion(SB.getWorldQuaternion(new THREE.Quaternion()).invert());
    const L=p0.distanceTo(AFT);
    dock.path=[p0,p0.clone().addScaledVector(f,L*0.3),AFT.clone().add(V().set(Math.max(3000,L*0.6),0,0)),AFT.clone()];
    dock.T1=Math.max(25,L/350);dock.t0=F.T();dock.phase='approach';dock.q0=ROOT.quaternion.clone();
    W.setThrottle(0);F.note('Approach control: cleared to dock, berth one. We have the helm.');
  }
  W.dock=doDock;
  W.cancelAuto=quiet=>{if(dock.phase&&!quiet)F.note(dock.phase==='docked'?'Cast off.':'Docking cancelled.');dock.phase=null;if(tour.on)stopTour();};
  W.autoDir=()=>null;
  const qLook=dir=>{const m=new THREE.Matrix4(),up=V().set(0,1,0).applyQuaternion(SB.getWorldQuaternion(new THREE.Quaternion())),x=dir.clone().normalize(),z=x.clone().cross(up).normalize(),y=z.clone().cross(x);
    m.makeBasis(x,y,z);return new THREE.Quaternion().setFromRotationMatrix(m);};
  const T2=40;
  animHooks.push(()=>{if(!dock.phase)return;
    // gone to warp, or the helm left, or somewhere else: approach control lets go
    if(!S.on||S.warp||W.spooling||W.herePlace()!==W.homePlace){dock.phase=null;return;}
    S.vel.set(0,0,0);S.rate.set(0,0,0);W.setThrottle(0);
    const u=F.T()-dock.t0;let p,dir,spd;
    if(dock.phase==='approach'){const s=ease(u/dock.T1),s2=ease((u+0.05)/dock.T1),P=dock.path;
      p=toW(bez(...P,s));const p2=toW(bez(...P,Math.min(1,s2+1e-4)));dir=p2.clone().sub(p);spd=dir.length()/0.05;
      if(dir.lengthSq()<1e-6)dir=armDir().negate();
      if(u>=dock.T1){dock.phase='final';dock.t0=F.T();F.note('On the approach. Thrusters only.');}}
    else if(dock.phase==='final'){const s=ease(u/T2);p=toW(AFT.clone().lerp(BERTH,s));dir=armDir().negate();spd=(AFT.x-BERTH.x)*(ease((u+0.05)/T2)-s)/0.05;
      if(u>=T2){dock.phase='docked';F.note('Docking clamps engaged. Welcome to the starbase.');F.sound('shield');}}
    else{p=toW(BERTH);dir=armDir().negate();spd=0;}
    ROOT.position.copy(p);ROOT.quaternion.slerp(qLook(dir),dock.phase==='docked'?0.05:0.08);dock.v=spd;dock.d=p.distanceTo(toW(BERTH));});

  // ================= hull breaches =================
  // A plume of venting air (white crystals pouring out along the hull's normal and spreading as they go) and a
  // flickering fire behind the hole, in the saucer's own frame so they go where the saucer goes.
  W.breach=pW=>{
    const p=SAU.worldToLocal(pW.clone()),n=p.y>0?V().set(p.x/400,1,p.z/400).normalize():V().set(p.x/400,-1,p.z/400).normalize();
    const N=220,pos=new Float32Array(N*3),seed=[];for(let i=0;i<N;i++)seed.push([Math.random(),Math.random()-0.5,Math.random()-0.5]);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const mat=new THREE.PointsMaterial({map:W.glowTex,color:0xdfeaff,size:9,sizeAttenuation:true,transparent:true,opacity:0.7,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const pts=new THREE.Points(geo,mat);pts.frustumCulled=false;pts.userData.noWire=true;SAU.add(pts);
    const fire=F.sprite(0xff6a20,30,0.9);fire.position.copy(p);SAU.add(fire);
    const t1=V().set(-n.y,n.x,0).normalize(),t2=n.clone().cross(t1);const t0=F.T();
    F.run(t=>{const u=t-t0,life=Math.max(0,1-u/30);
      for(let i=0;i<N;i++){const s=seed[i],f=(s[0]+u*0.6)%1,d=f*140;
        const x=p.x+n.x*d+(t1.x*s[1]+t2.x*s[2])*d*0.6,y=p.y+n.y*d+(t1.y*s[1]+t2.y*s[2])*d*0.6,z=p.z+n.z*d+(t1.z*s[1]+t2.z*s[2])*d*0.6;pos.set([x,y,z],i*3);}
      geo.attributes.position.needsUpdate=true;mat.opacity=0.7*life;
      fire.material.opacity=life*(0.6+0.4*Math.sin(t*23)*Math.sin(t*7.1));fire.scale.setScalar(26+8*Math.sin(t*17));
      if(u>30){SAU.remove(pts,fire);geo.dispose();mat.dispose();return false;}});
  };

  // ================= escape pods =================
  function abandonShip(){
    F.note('All hands, abandon ship.');F.sound('klaxon');
    const pm=new THREE.MeshStandardMaterial({color:0xa89270,metalness:0.3,roughness:0.5,envMap:W.env}),geo=new THREE.CylinderGeometry(2.2,2.6,3.4,10);
    const A=SAUCER.a,B=SAUCER.b,pods=[];
    for(let i=0;i<36;i++){
      const e=[0.57,0.82,0.935][i%3],th=(i*2.39996)%(Math.PI*2),x=e*A*Math.cos(th),z=e*B*Math.sin(th);
      if(x<-100&&Math.abs(z)<160)continue;
      const m=new THREE.Mesh(geo,pm);m.position.set(x,saucerTop(x,z)+0.5,z);m.userData.noWire=true;
      const g=F.sprite(0xffc890,10,0.9);g.position.y=-2.5;m.add(g);
      m.userData.v=V().set(x/A*0.6,1,z/B*0.6).normalize().multiplyScalar(14+Math.random()*10);m.userData.w=V().set(Math.random(),Math.random(),Math.random());
      m.userData.go=0.25*i/3+Math.random()*0.3;SAU.add(m);pods.push(m);}
    const t0=F.T();
    F.run((t,dt)=>{const u=t-t0;
      for(const m of pods){if(u<m.userData.go)continue;const k=Math.min(1,(u-m.userData.go)*2);m.position.addScaledVector(m.userData.v,dt*k);
        m.rotation.x+=m.userData.w.x*dt*0.3;m.rotation.z+=m.userData.w.z*dt*0.3;m.children[0].material.opacity=0.9*Math.max(0,1-(u-m.userData.go)/6);}
      if(u>60){for(const m of pods)SAU.remove(m);pm.dispose();geo.dispose();return false;}});
  }

  // ================= self-destruct =================
  const sd={on:false,left:0,id:null};
  function selfDestruct(){
    if(sd.on){sd.on=false;clearInterval(sd.id);F.note('Self-destruct cancelled.');F.sync();return;}
    sd.on=true;sd.left=10;F.note('Self-destruct in ten seconds.');F.sound('klaxon');
    sd.id=setInterval(()=>{if(!sd.on)return;sd.left--;F.sound(sd.left<=3?'hit':'klaxon');if(sd.left<=0){clearInterval(sd.id);sd.on=false;breach();}},1000);F.sync();
  }
  function breach(){
    const c=F.shipCentre(),q=ROOT.getWorldQuaternion(new THREE.Quaternion());
    F.sound('boom');setTimeout(()=>F.sound('boom'),200);setTimeout(()=>F.sound('boom'),600);
    F.flash(c,0xffffff,4000,1.2);F.flash(c,0xbfe0ff,9000,2.6);F.flash(c,0xff8040,5000,3.5);
    F.debris(c,0xa8adb2,140,420);
    // the shock: a ring out across the ship's own plane, thin and bright at its edge
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,uniforms:{uA:{value:1}},
      vertexShader:`varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uA;varying vec2 vU;void main(){float r=length(vU-0.5)*2.;float k=smoothstep(0.7,0.97,r)*(1.-smoothstep(0.97,1.,r));gl_FragColor=vec4(vec3(0.75,0.88,1.)*k*uA,k*uA);}`});
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);ring.userData.noWire=true;ring.position.copy(F.toFX(c));
    ring.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(V().set(1,0,0),-Math.PI/2));W.FX.add(ring);
    ROOT.visible=false;S.shake+=60;const t0=F.T();
    F.run(t=>{const u=t-t0;ring.scale.setScalar(200+u*9000);mat.uniforms.uA.value=Math.max(0,1-u/3.2);
      if(u>3.3&&ring.parent){W.FX.remove(ring);mat.dispose();}
      if(u>10){ROOT.visible=true;F.flash(c,0xcfe4ff,1300,0.9);F.sound('warp');F.note('And the ship again: this is only a page.');F.sync();return false;}});
  }

  // ================= a grand tour =================
  const tour={on:false,list:[],timer:null};
  function startTour(){
    if(tour.on){stopTour();return;}
    tour.on=true;const here=W.herePlace().P.id;tour.list=PLACES.filter(p=>p.id!==here);
    if(!S.on)W.startFlight();S.cam='flyby';S.fb=null;W.course.setWarp(9);F.note('A grand tour: every place on the chart.');next();
  }
  function next(){if(!tour.on)return;const P=tour.list.shift();if(!P){stopTour();F.note('That is the tour.');return;}W.course.set(P);}
  function stopTour(){tour.on=false;clearTimeout(tour.timer);if(W.course)W.course.clear();}
  W.onArrive=()=>{if(!tour.on)return;S.cam='flyby';S.fb=null;clearTimeout(tour.timer);
    tour.timer=setTimeout(next,16000);};

  const hud=()=>[sd.on?'SELF-DESTRUCT IN '+sd.left:'',dock.phase==='docked'?'docked at the starbase':dock.phase?'docking: '+dock.phase+', '+Math.round(dock.d||0)+' m to the berth, '+Math.round(dock.v||0)+' m/s':'',tour.on?'grand tour':''].filter(Boolean).join(' · ');
  return {hud,act:{dock:doDock,pods:abandonShip,destruct:selfDestruct,tour:startTour},
    buttons:[['Dock at the starbase',doDock],['Abandon ship',abandonShip],['Self-destruct',selfDestruct],['Grand tour',startTour]],
    state:()=>({sd:sd.on,dock:dock.phase,tour:tour.on,u:+(F.T()-(dock.t0||0)).toFixed(1),T1:dock.T1,d:Math.round(dock.d||0)})};
}
