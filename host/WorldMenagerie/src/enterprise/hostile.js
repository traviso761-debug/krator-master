// ---------- Galaxy class: a hostile contact ----------
// Fan work. The raider is this project's own design, not any ship from any film, series or game: a dark arrowhead
// a quarter of the Enterprise's length, wings swept down to two engine pods, a green emitter in its nose.
//
// It drops out of warp a few kilometres off, the ship goes to red alert, and it circles at two or three kilometres,
// firing every few seconds: the bolts land on the shields if they are up (which wears them down: they come back
// slowly while up) or on the hull if not. Phasers and torpedoes take its shields down first, then its hull. Badly
// hurt it may break off and run for it; or it is destroyed.
//
// The other kinds (factions.js has the ships): a Varr cruiser decloaks close in, circles tight and fast, fires in
// pairs and never runs; a Lattice ship comes out of warp far off, huge and slow, its bolts heavy, now and then it
// locks a tractor on the ship and drags at it, and it adapts: the more of one weapon it takes, the less that weapon
// does, so the way to beat it is to change weapons. Not hostile: a Sere survey ship keeps station alongside and
// fires on whatever is attacking you; a trader convoy crosses the bow and goes on its way; a derelict drifts.
import {factions} from './factions.js';
export function hostile(W,E){
  const {THREE,ROOT}=W;
  const FA=factions(THREE,W,E);
  const KINDS={
    raider:{name:'raider',mesh:()=>raiderMesh(),sh:100,hp:100,R:[2200,1400],w:[0.08,0.06],hy:[200,300],fire:[2.2,1.8],bolt:{},glow:0xb8ffc8,flee:true,cap:900,spawnD:5200,debris:0x5a665c,boom:1},
    varr:{name:'Varr cruiser',mesh:FA.varr,sh:150,hp:130,R:[1500,700],w:[0.13,0.05],hy:[120,180],fire:[1.6,1.2],volley:2,bolt:{colour:0xff5a20,dmg:1.15},glow:0xffa070,flee:false,cap:1400,spawnD:2600,cloak:true,debris:0x5e4636,boom:1.5},
    lattice:{name:'Lattice ship',mesh:FA.lattice,sh:300,hp:420,R:[5200,800],w:[0.022,0.01],hy:[300,200],fire:[3.2,1.6],bolt:{colour:0xa070ff,dmg:2.2,size:2},glow:0xc8a0ff,flee:false,cap:500,spawnD:11000,adapt:true,drag:true,debris:0x2a2c30,boom:4},
  };

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
  // every raider in the fight; W.enemy is the nearest one still in it (what the phasers and torpedoes go for)
  const foes=[];
  const live=()=>foes.filter(f=>!f.gone);
  Object.defineProperty(W,'enemy',{configurable:true,get(){const c=E.shipCentre();let b=null,bd=1e18;
    for(const f of live()){const d=f.m.g.getWorldPosition(V()).distanceToSquared(c);if(d<bd){bd=d;b=f;}}return b;}});
  const rr=a=>a[0]+Math.random()*a[1];
  function contact(k,kind){
    const K=KINDS[kind||'raider'],m=K.mesh(),c=E.shipCentre(),q=shipQ();
    const th=(k==null?(Math.random()<0.5?1:-1)*(0.6+Math.random()*0.8):k*2.1+Math.random()*0.6);
    const spawn=c.clone().add(new THREE.Vector3(Math.cos(th)*K.spawnD,400+(Math.random()-0.5)*800,Math.sin(th)*K.spawnD).applyQuaternion(q));
    m.g.position.copy(E.toFX(spawn));W.FX.add(m.g);
    for(const e of m.engines)e.userData.s0=e.scale.x;
    // each keeps its own circle: a little nearer or further, faster or slower, the other way round
    const foe={K,m,sh:K.sh,hp:K.hp,sh0:K.sh,hp0:K.hp,vel:V(),th,gone:false,flee:false,fireT:E.T()+3.5+Math.random()*2,born:E.T(),hitT:-9,warpT:null,
      R:rr(K.R),w:(Math.random()<0.3?-1:1)*rr(K.w),hy:rr(K.hy),adapt:{ph:0,tp:0},told:{},dragT:-99};
    foes.push(foe);
    if(K.cloak){
      // out of its cloak: a shimmer, and the hull fading up out of nothing
      const mats=[];m.g.traverse(o=>{if(o.material&&!o.isSprite){o.material.transparent=true;o.material.opacity=0;mats.push(o.material);}});
      const sp=[];m.g.traverse(o=>{if(o.isSprite){sp.push([o.material,o.material.opacity]);o.material.opacity=0;}});
      foe.fireT=E.T()+3;const t0=E.T();E.sound('shield');E.note('Decloaking, close aboard: a Varr cruiser!');
      E.run(t=>{const u=Math.min(1,(t-t0)/2.5);for(const mt of mats)mt.opacity=u;for(const [mt,o] of sp)mt.opacity=o*u;
        m.bubble.material.opacity=0.5*Math.sin(u*Math.PI);if(u>=1){for(const mt of mats)mt.transparent=false;return false;}});}
    else{E.sound('warp');E.flash(spawn,K.glow,900*K.boom,0.9);if(kind==='lattice')E.note('A Lattice ship has come out of warp. It is hailing: it says nothing we can understand.');}
    if(!E.red())E.redAlert();
    E.sync();
    const tmp=V(),want=V(),toShip=V(),m4=new THREE.Matrix4(),qq=new THREE.Quaternion();
    E.run((t,dt)=>{
      if(foe.gone)return false;
      const g=m.g,c=E.toFX(E.shipCentre()),q=shipQ().premultiply(W.FX.quaternion.clone().invert()),u=t-foe.born;
      const shipV=E.dirFX(W.flight.vel||V());
      // warp-in: it decelerates out of a streak
      if(u<0.4&&!K.cloak){g.scale.set(1+6*(1-u/0.4),1,1);}else g.scale.set(1,1,1);
      // left behind when the ship goes to warp
      if(W.flight.warp){W.FX.remove(g);foe.gone=true;foe.left=true;E.sync();done();return false;}
      if(foe.warpT!=null){const k=(t-foe.warpT)/0.4;g.scale.set(1+6*k*k,1,1);g.position.addScaledVector(tmp.set(1,0,0).applyQuaternion(g.quaternion),60000*k*dt);
        if(k>=1){E.flash(E.world(g,V()),K.glow,900,0.9);W.FX.remove(g);foe.gone=true;foe.left=true;E.sync();E.note('A '+K.name+' has gone to warp.');done();return false;}return;}
      // where it wants to be: on its circle round the ship, or away if running
      if(!foe.flee){foe.th+=dt*foe.w;want.set(Math.cos(foe.th)*foe.R,foe.hy*Math.sin(foe.th*1.7),Math.sin(foe.th)*foe.R).applyQuaternion(q).add(c);}
      else want.copy(g.position).addScaledVector(tmp.copy(g.position).sub(c).normalize(),4000);
      // and not on top of the others
      for(const o of foes)if(o!==foe&&!o.gone){const d=tmp.copy(g.position).sub(o.m.g.position),L=d.length();const keep=o.K===K&&kind!=='lattice'?600:1600;if(L<keep)want.addScaledVector(d.normalize(),keep-L);}
      tmp.copy(want).sub(g.position).multiplyScalar(0.5);const L=tmp.length(),cap=foe.flee?1400:K.cap;if(L>cap)tmp.multiplyScalar(cap/L);
      tmp.add(shipV);foe.vel.lerp(tmp,Math.min(1,dt*0.9));g.position.addScaledVector(foe.vel,dt);
      // it points along its way, turning to bring its nose to bear as it fires
      toShip.copy(c).sub(g.position).normalize();const rel=tmp.copy(foe.vel).sub(shipV);
      const look=rel.lengthSq()>100?rel.normalize():toShip.clone();const aim=t>foe.fireT-1.2&&!foe.flee?0.75:0;look.lerp(toShip,aim).normalize();
      m4.lookAt(V(),look.clone().negate(),new THREE.Vector3(0,1,0).applyQuaternion(q));qq.setFromRotationMatrix(m4).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.PI/2));
      g.quaternion.slerp(qq,Math.min(1,dt*1.5));
      for(const e of m.engines)e.scale.setScalar(e.userData.s0*(0.85+0.3*Math.sin(t*20)));
      if(g.userData.spin){g.userData.spin.rotation.y+=dt*0.05;g.userData.cages[1].rotation.x+=dt*0.03;}
      if(!K.cloak||u>2.5)m.bubble.material.opacity=Math.max(0,0.6*(1-(t-foe.hitT)/0.5))*(foe.sh>0?1:0.3);
      // the Lattice's tractor: a violet beam, and the ship dragged back
      if(t<foe.dragT){const f=W.flight;if(f&&f.vel)f.vel.multiplyScalar(Math.exp(-dt*1.2));}
      // smoke from a hull that is hurt
      if(foe.hp<foe.hp0*0.6&&Math.random()<dt*6*K.boom)E.flash(E.world(g,V().set((-30+Math.random()*60)*K.boom,8,(Math.random()-0.5)*60*K.boom)),0xff8040,(50+Math.random()*40)*K.boom,0.7);
      // fire
      if(t>foe.fireT&&!foe.flee&&(!K.cloak||u>2.5)){foe.fireT=t+rr(K.fire)+live().length*0.8;
        for(let i=0;i<(K.volley||1);i++)setTimeout(()=>{if(foe.gone)return;const from=E.world(m.nose,V());E.flash(from,K.glow,60*K.boom,0.3);E.incoming(from,K.bolt);},i*220);
        if(K.drag&&Math.random()<0.35&&t>foe.dragT+6){foe.dragT=t+5;E.note('The Lattice ship has a tractor lock on us.');
          beam(()=>E.world(m.nose,V()),()=>E.shipCentre(),0xa070ff,5,14);}}
      // run for it, then go to warp
      if(foe.flee&&foe.warpT==null&&t-foe.fleeT>4){foe.warpT=t;E.sound('warp');}
    });
    return foe;
  }
  // a hit on one: shields first, then the hull
  function hit(foe,dmg,at){
    if(!foe||foe.gone)return;const t=E.T();foe.hitT=t;
    // the Lattice learns: each weapon does less the more of it it has taken
    if(foe.K.adapt){const w=dmg>=20?'tp':'ph';dmg/=1+foe.adapt[w]*0.35;foe.adapt[w]+=w==='tp'?1:dmg/12;
      const o=w==='tp'?'ph':'tp';foe.adapt[o]=Math.max(0,foe.adapt[o]-(w==='tp'?0.4:dmg/40));
      if(foe.adapt[w]>3&&!foe.told[w]){foe.told[w]=1;E.note('The Lattice ship has adapted to our '+(w==='tp'?'torpedoes':'phasers')+'. Change weapons!');}
      if(foe.adapt[w]<1)foe.told[w]=0;}
    if(foe.sh>0){foe.sh=Math.max(0,foe.sh-dmg);if(foe.sh===0)E.note('The '+foe.K.name+'\'s shields are down.');}
    else{foe.hp=Math.max(0,foe.hp-dmg*1.2);E.flash(at||E.world(foe.m.g,V()),0xffb070,120,0.6);}
    if(foe.hp<=0){destroy(foe);return;}
    if(foe.K.flee&&!foe.flee&&foe.hp<35&&Math.random()<0.5){foe.flee=true;foe.fleeT=t;E.note('A raider is breaking off.');}
  }
  function destroy(foe){
    const g=foe.m.g,p=E.world(g,V());foe.gone=true;
    E.sound('boom');setTimeout(()=>E.sound('boom'),350);
    const K=foe.K,b=K.boom;E.flash(p,0xffffff,700*b,0.8);E.flash(p,K.glow,1600*b,1.6);E.flash(p,0xff7a30,1200*b,2.4);
    if(b>2){W.flight.shake=(W.flight.shake||0)+30;setTimeout(()=>{E.sound('boom');E.flash(p,0xd0b8ff,5000,3);},700);}
    W.FX.remove(g);E.debris(p,K.debris,Math.round(60*Math.sqrt(b)),180*b);
    battle.kills++;E.note('The '+K.name+' is destroyed.');E.sync();done();
  }

  // ---- a battle: three waves, one raider more each time ----
  const battle={on:false,wave:0,kills:0};
  function startBattle(){
    if(battle.on)return;battle.on=true;battle.wave=0;battle.kills=0;nextWave();
  }
  // the waves: two raiders; then three and a Varr cruiser; then a Lattice ship
  const WAVES=[['raider','raider'],['raider','raider','varr'],['lattice']];
  function nextWave(){battle.wave++;const L=WAVES[battle.wave-1];
    E.note('Wave '+battle.wave+' of 3: '+(battle.wave===3?'a Lattice ship.':L.length+' contacts.'));
    L.forEach((kd,i)=>setTimeout(()=>contact(i,kd),i*900));}
  function done(){if(live().length)return;
    if(battle.on&&W.flight.warp){battle.on=false;E.note('We have left them behind.');return;}
    if(battle.on){if(battle.wave<3)setTimeout(nextWave,5000);else{battle.on=false;E.note('The last of them is gone. '+battle.kills+' destroyed.');}}}

  const hud=()=>{const L=live();if(!L.length)return battle.on?'wave '+battle.wave+' cleared':'';const f=W.enemy;
    return (battle.on?'wave '+battle.wave+'/3 · ':'')+(L.length>1?L.length+' hostiles · nearest ':f.flee?'running: ':'')+f.K.name+' · shields '+Math.round(f.sh/f.sh0*100)+'% hull '+Math.round(f.hp/f.hp0*100)+'% · '+
    (E.world(f.m.g,V()).distanceTo(E.shipCentre())/1000).toFixed(1)+' km';};

  // ---- a beam between two moving points, for a while ----
  const Y=new THREE.Vector3(0,1,0);
  function beam(from,to,colour,dur,width){
    const geo=new THREE.CylinderGeometry(1,1,1,8,1,true),mat=new THREE.MeshBasicMaterial({color:colour,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const b=new THREE.Mesh(geo,mat);b.userData.noWire=true;b.frustumCulled=false;W.FX.add(b);const t0=E.T();
    E.run(t=>{const u=(t-t0)/dur;if(u>=1){W.FX.remove(b);geo.dispose();mat.dispose();return false;}
      const a=E.toFX(from()),d=E.toFX(to()).sub(a);b.position.copy(a).addScaledVector(d,0.5);b.quaternion.setFromUnitVectors(Y,d.clone().normalize());
      b.scale.set(width,d.length(),width);mat.opacity=0.85*(1-u*u)*(0.75+0.25*Math.sin(t*40));});
  }

  // ---- friends and strangers ----
  // a ship that keeps station on ours, at an offset in our frame, matching our way
  function keepStation(m,off,opts){
    const tmp=V(),vel=V(),qq=new THREE.Quaternion();
    return (t,dt)=>{const g=m.g,c=E.toFX(E.shipCentre()),q=shipQ().premultiply(W.FX.quaternion.clone().invert()),shipV=E.dirFX(W.flight.vel||V());
      tmp.copy(off).applyQuaternion(q).add(c).sub(g.position).multiplyScalar(0.4);const L=tmp.length(),cap=(opts&&opts.cap)||1500;if(L>cap)tmp.multiplyScalar(cap/L);
      tmp.add(shipV);vel.lerp(tmp,Math.min(1,dt*0.8));g.position.addScaledVector(vel,dt);qq.copy(q);g.quaternion.slerp(qq,Math.min(1,dt*0.6));
      for(const e of m.engines)e.scale.setScalar(e.userData.s0*(0.85+0.3*Math.sin(t*20)));};
  }
  function warpIn(m,at,glow){m.g.position.copy(E.toFX(at));W.FX.add(m.g);for(const e of m.engines)e.userData.s0=e.scale.x;E.sound('warp');E.flash(at,glow,900,0.9);}
  function warpOut(m,glow,then){const t0=E.T();E.sound('warp');
    E.run((t,dt)=>{const k=(t-t0)/0.4;m.g.scale.set(1+6*k*k,1,1);m.g.position.addScaledVector(V().set(1,0,0).applyQuaternion(m.g.quaternion),60000*k*dt);
      if(k>=1){E.flash(E.world(m.g,V()),glow,900,0.9);W.FX.remove(m.g);then&&then();return false;}});}

  // the Sere: alongside to starboard, a little above; it fires on the nearest hostile, and leaves when it is quiet
  const ally={on:null};
  function sere(){
    if(ally.on){ally.on.leave=true;return;}
    const m=FA.sere(),q=shipQ(),c=E.shipCentre(),off=new THREE.Vector3(300,160,1100);
    warpIn(m,c.clone().add(new THREE.Vector3(4000,600,3000).applyQuaternion(q)),0xffd090);
    const A=ally.on={m,leave:false,fireT:E.T()+4,quiet:E.T()};const step=keepStation(m,off);
    E.note('The Sere survey ship Patient Measure hails: it has observed that you are alone, and will keep station with you for a while.');E.sync();
    E.run((t,dt)=>{if(A.gone)return false;step(t,dt);
      const f=W.enemy;if(f)A.quiet=t;
      if(f&&t>A.fireT){A.fireT=t+2.4+Math.random();const tg=f;
        beam(()=>E.world(m.nose,V()),()=>E.world(tg.m.g,V()),0xffb040,0.7,5);setTimeout(()=>hit(tg,9),250);E.sound('phaser');}
      if(A.leave||t-A.quiet>120){A.gone=true;ally.on=null;E.note('The Sere ship wishes you a long and well-recorded life, and goes.');warpOut(m,0xffd090,()=>E.sync());return false;}});
  }
  // a trader convoy: three haulers out of warp ahead and to port, crossing the bow at a walk, then gone
  function convoy(){
    const q=shipQ(),c=E.shipCentre(),fwd=V().set(1,0,0).applyQuaternion(q),side=V().set(0,0,1).applyQuaternion(q);
    E.note('A trader convoy hails: three haulers out of the rim with grain and machine parts, wishing you a quiet passage.');
    for(let i=0;i<3;i++)setTimeout(()=>{
      const m=FA.hauler(i),at=c.clone().addScaledVector(fwd,3200+i*500).addScaledVector(side,-2600-i*300).add(V().set(0,(i-1)*250,0));
      warpIn(m,at,0xd8e8ff);m.g.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(V().set(0,1,0),-Math.PI/2));
      const vel=side.clone().multiplyScalar(160),t0=E.T();
      E.run((t,dt)=>{if(W.flight.warp){W.FX.remove(m.g);return false;}m.g.position.addScaledVector(E.dirFX(vel),dt);for(const e of m.engines)e.scale.setScalar(e.userData.s0*(0.85+0.3*Math.sin(t*20)));
        if(t-t0>45){warpOut(m,0xd8e8ff);return false;}});},i*1500);
  }
  // a derelict: ahead and to one side, tumbling end over end very slowly; it stays until you call another
  let wreck=null;
  function derelict(){
    if(wreck){W.FX.remove(wreck.g);wreck=null;return;}
    const q=shipQ(),c=E.shipCentre(),m=FA.derelict();wreck=m;
    m.g.position.copy(E.toFX(c.clone().add(V().set(7000,-600,-2500).applyQuaternion(q))));m.g.rotation.set(0.3,0.8,0.2);W.FX.add(m.g);
    E.note('Sensors: a derelict, 2.5 km long, broken in two. No life signs. Some power, somewhere.');
    E.run((t,dt)=>{if(wreck===m&&W.flight.warp){W.FX.remove(m.g);wreck=null;}if(wreck!==m)return false;m.g.rotation.z+=dt*0.006;m.g.rotation.x+=dt*0.003;
      m.g.traverse(o=>{if(o.userData.flick!=null)o.material.opacity=Math.sin(t*3+o.userData.flick)>0.6||Math.sin(t*17+o.userData.flick*3)>0.95?0.9:0.1;});});
  }
  return {contact:(kind)=>contact(null,kind),hit,hud:()=>[hud(),ally.on?'a Sere ship alongside':'',wreck?'a derelict':''].filter(Boolean).join(' · '),battle:startBattle,count:()=>live().length,sere,convoy,derelict};
}
