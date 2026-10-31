// ---------- Galaxy class: flying it ----------
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used.
//
// The page is a turntable round one object at the origin. To fly, the ship (ROOT) moves through a world that is
// split three ways:
//
//   - SKY: the stars and the far nebulae. They are at infinity, so they ride with the camera and only turn. The sky
//     is one sky for the whole chart: a few light-years do not move the stars.
//   - SYS: the place you are at (nav.js and places.js) and the target rock. These are things you can fly towards and
//     they stay where they are.
//   - FX:  phaser beams, torpedoes, the shuttle: anything let loose in the world.
//
// Two re-basings keep the numbers small and the turntable working. Past 20 km from the origin everything is moved
// back by the ship's position (a floating origin), so a long flight never runs into the precision of a float.
// And when you stop flying, the ship is put back at the origin, level, by moving and turning the world round it the
// other way: the sun, the planet and the stars all keep where they are relative to the ship, the turntable's views
// all work again, and the camera is handed back exactly where the chase camera had it.
//
// How it handles. A ship of four million tonnes does not turn like a fighter:
//   - the turn rates build up and die away at a limited angular acceleration, so a turn takes a moment to start
//     and a moment to stop, and the thrusters round the saucer's rim puff while they do it;
//   - speed is a throttle (hold W or S): the impulse engines push at about 26 g and the glow behind them answers
//     the push, not the speed;
//   - the velocity does not swing round with the nose at once: what is left sideways after a turn is bled off by
//     the inertial dampers over a second or two, so a hard turn at speed slides a little;
//   - the ship banks into a turn by itself and, left alone, rolls back level with the galactic plane;
//   - the chase camera lags under acceleration and widens its view with speed;
//   - planets, stars and rocks are solid: the ship holds off them (O, near one, puts it in a standard orbit).
// Warp speeds are the Cochrane scale, the speed of light times the warp factor to the power ten-thirds: warp 6 is
// 392 times light. Time at warp runs twenty thousand times fast (said in the readout), or the nearest place on the
// chart would be days away.
export const FULL=2500,THRUST=260,TIMEX=20000;
export const warpC=w=>Math.pow(w,10/3);
// light-years per second of page time at a warp factor
export const lyps=w=>warpC(w)*TIMEX/31557600;

export function flight(W){
  const {THREE,scene,camera,renderer,ROOT,G,SAU,animHooks,C}=W;
  // the page made its lights first (key, fill, the camera lamp) and then the sky, in this order
  const lights=scene.children.filter(o=>o.isDirectionalLight),[key,fill,lamp]=lights,amb=scene.children.find(o=>o.isAmbientLight);
  const stars=scene.children.find(o=>o.isPoints),i0=scene.children.indexOf(stars);
  const nN=((C.space&&C.space.nebulae)||[]).length,nB=((C.space&&C.space.bodies)||[]).length;
  const SKY=new THREE.Group(),SYS=new THREE.Group(),FX=new THREE.Group();
  const skyObjs=scene.children.slice(i0,i0+1+nN),bodyObjs=scene.children.slice(i0+1+nN,i0+1+nN+nB);
  for(const o of skyObjs)SKY.add(o);
  scene.add(SKY,SYS,FX);
  const sun=key.position.clone().normalize(),fillDir=fill.position.clone().normalize();
  for(const L of [fill,lamp]){if(!L.target.parent)scene.add(L.target);}
  // the bank: between the ship's course (ROOT) and the ship, so the camera follows the course and sees the lean
  const BANK=new THREE.Group();ROOT.remove(G);BANK.add(G);ROOT.add(BANK);
  W.SKY=SKY;W.SYS=SYS;W.FX=FX;W.sun=sun;W.fillDir=fillDir;W.BANK=BANK;W.lights={key,fill,lamp,amb};W.homeBodies=bodyObjs;

  const S={on:false,thr:0,warp:0,v:0,vel:new THREE.Vector3(),rate:new THREE.Vector3(),acc:0,bank:0,cy:0,cp:0.25,cd:1100,
    camRel:new THREE.Vector3(),up:new THREE.Vector3(0,1,0),shake:0,punch:0,fov:camera.fov,orbit:null,hold:'',auto:null};
  const FOV0=camera.fov;
  W.flight=S;
  const keys=new Set(),pad=new Set();
  const typing=e=>e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA');
  addEventListener('keydown',e=>{if(!S.on||typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);
    if(e.repeat)return;
    if(k==='x'){allStop();}
    if(k>='1'&&k<='9'){if(W.course&&W.course.dest)W.course.setWarp(+k);else W.engage(+k);}if(k==='0'){W.course&&W.course.clear();W.dropOut();}
    if(k===' '){W.fire&&W.fire('phasers');e.preventDefault();}if(k==='t')W.fire&&W.fire('torpedo');
    if(k==='o')toggleOrbit();if(k==='c'&&W.openNav)W.openNav();
    if(k.startsWith('Arrow'))e.preventDefault();});
  addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(k);});
  addEventListener('blur',()=>keys.clear());
  const setThrottle=f=>{S.thr=Math.max(0,Math.min(1,f));};
  function allStop(){setThrottle(0);S.orbit=null;if(W.course)W.course.clear();if(S.warp)W.dropOut();}
  W.setThrottle=setThrottle;W.allStop=allStop;

  // the chase camera's own drag and wheel: while flying the page's turntable is told to keep its hands off
  {const el=renderer.domElement;let d=null;
   el.addEventListener('pointerdown',e=>{if(S.on)d={x:e.clientX,y:e.clientY};});
   addEventListener('pointermove',e=>{if(!S.on||!d)return;S.cy-=(e.clientX-d.x)*0.005;S.cp=Math.max(-1.35,Math.min(1.35,S.cp+(e.clientY-d.y)*0.004));d={x:e.clientX,y:e.clientY};});
   addEventListener('pointerup',()=>{d=null;});
   el.addEventListener('wheel',e=>{if(!S.on)return;S.cd=Math.max(140,Math.min(9000,S.cd*Math.exp(e.deltaY*0.0011)));},{passive:true});}

  // ---- the dust and the warp streaks ----
  // Out here nothing near you shows that you are moving, so a thin field of dust is kept round the camera (each
  // grain wrapped back into a box three kilometres across as you pass it); at warp it becomes streaks.
  const DN=1400,DL=3000,SN=600,SL=24000;
  const dpos=new Float32Array(DN*3),spos=new Float32Array(SN*6),scol=new Float32Array(SN*6),seed=[];
  let rs=1701;const rnd=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296;};
  for(let i=0;i<DN*3;i++)dpos[i]=(rnd()-0.5)*DL;
  for(let i=0;i<SN;i++){seed.push([(rnd()-0.5)*SL,(rnd()-0.5)*SL,(rnd()-0.5)*SL]);const w=rnd();
    // the head of a streak is the star's own colour, blued; its tail fades to nothing
    scol.set([0.75+0.25*w,0.85,1,0,0,0],i*6);}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0x9fb0c8,size:2.2,sizeAttenuation:true,transparent:true,opacity:0.55,depthWrite:false,toneMapped:false}));
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(spos,3));sg.setAttribute('color',new THREE.BufferAttribute(scol,3));
  const streaks=new THREE.LineSegments(sg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
  for(const o of [dust,streaks]){o.frustumCulled=false;o.userData.noWire=true;o.visible=false;scene.add(o);}
  const wrap=(a,L)=>a-L*Math.floor(a/L+0.5);

  // ---- the thrusters' puffs ----
  // Four quads of reaction thrusters round the saucer's rim (ship.js draws the blocks): each puffs sideways for a
  // yaw and up or down for a pitch or a roll, while the turn is building or dying away.
  const puffs=[];
  {const tex=W.glowTex;
   for(const a of [0.62,-0.62,2.28,-2.28]){const r=W.rimAt(a);
     for(const kind of ['side','up','down']){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xe8f0ff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
       const out=new THREE.Vector3(Math.cos(a),0,Math.sin(a));
       s.position.set(r.x,r.y,r.z).addScaledVector(out,kind==='side'?7:2);s.position.y+=kind==='up'?5:kind==='down'?-5:0;
       s.scale.setScalar(14);s.userData={noWire:true,a,kind};SAU.add(s);puffs.push(s);}}}

  const fwd=new THREE.Vector3(),tmp=new THREE.Vector3(),r1=new THREE.Vector3(),r2=new THREE.Vector3(),qd=new THREE.Quaternion(),ax=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
  const MAXR=new THREE.Vector3(0.38,0.12,0.10),ACC=new THREE.Vector3(0.3,0.055,0.05);
  const prevRate=new THREE.Vector3(),angAcc=new THREE.Vector3(),want=new THREE.Vector3();
  let last=null;
  animHooks.push(now=>{
    const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;
    if(S.on&&dt>0)helm(dt);
    // the lights follow the ship wherever it is, from the directions the sun and the fill are in
    key.position.copy(ROOT.position).addScaledVector(sun,1e4);key.target.position.copy(ROOT.position);
    fill.position.copy(ROOT.position).addScaledVector(fillDir,1e4);fill.target.position.copy(ROOT.position);
    lamp.target.position.copy(ROOT.position);
    for(const L of lights)L.target.updateMatrixWorld();
  });

  function helm(dt){
    const has=k=>keys.has(k)||pad.has(k);
    let yaw=(has('a')||has('ArrowLeft')?1:0)-(has('d')||has('ArrowRight')?1:0);
    let pitch=(has('ArrowUp')||has('r')?1:0)-(has('ArrowDown')||has('f')?1:0);
    let roll=(has('e')?1:0)-(has('q')?1:0);
    const manual=yaw||pitch||roll;
    if(has('w'))setThrottle(S.thr+dt*0.35);if(has('s'))setThrottle(S.thr-dt*0.35);
    if(manual)S.orbit=null;
    const q=ROOT.quaternion,qi=q.clone().invert();
    // what the helm wants, as turn rates: the keys, or the autopilot (a course, or an orbit) steering for a direction
    want.set(roll*MAXR.x,yaw*MAXR.y,pitch*MAXR.z);
    const steer=S.orbit?orbitDir(dt):(!manual&&W.course?W.course.dir():null);
    if(steer){const l=steer.clone().applyQuaternion(qi),ye=Math.atan2(-l.z,l.x),pe=Math.atan2(l.y,Math.hypot(l.x,l.z));
      want.y=Math.max(-MAXR.y,Math.min(MAXR.y,ye*0.5));want.z=Math.max(-MAXR.z,Math.min(MAXR.z,pe*0.5));S.steerErr=Math.hypot(ye,pe);}
    else S.steerErr=null;
    // left alone, roll back level with the galactic plane (unless climbing or diving steeply)
    if(!roll){const planeUp=tmp.set(0,1,0).applyQuaternion(SKY.quaternion),right=r1.set(0,0,1).applyQuaternion(q),f=r2.set(1,0,0).applyQuaternion(q);
      const err=right.dot(planeUp)*(1-Math.min(1,Math.abs(f.dot(planeUp))*1.4));want.x=Math.max(-MAXR.x*0.4,Math.min(MAXR.x*0.4,err*0.6));
      if(S.orbit)want.x=0;}
    // a ship this size turns harder when it is moving (the field round it helps), and never quickly
    const auth=0.55+0.45*Math.min(1,S.v/FULL);want.y*=auth;want.z*=auth;
    prevRate.copy(S.rate);
    for(let i=0;i<3;i++){const r=S.rate.getComponent(i),d=want.getComponent(i)-r,m=ACC.getComponent(i)*dt;S.rate.setComponent(i,r+Math.max(-m,Math.min(m,d)));}
    angAcc.copy(S.rate).sub(prevRate).divideScalar(dt);
    for(let i=0;i<3;i++){const r=S.rate.getComponent(i);if(r){qd.setFromAxisAngle(ax[i],r*dt);q.multiply(qd);}}
    q.normalize();
    // the lean into a turn, as an airliner's: a bank angle that follows the yaw rate
    const bankTo=-S.rate.y/MAXR.y*0.38*Math.min(1,0.3+S.v/FULL);S.bank+=(bankTo-S.bank)*(1-Math.exp(-dt*1.2));BANK.rotation.x=S.bank;
    // speed: thrust along the nose up to what the throttle asks; the dampers bleed what is left going sideways
    fwd.set(1,0,0).applyQuaternion(q);
    if(!S.warp){
      const along=S.vel.dot(fwd),target=S.thr*FULL,dv=Math.max(-THRUST*1.2*dt,Math.min(THRUST*dt,target-along));
      S.acc+=((dv/dt)-S.acc)*(1-Math.exp(-dt*4));
      tmp.copy(fwd).multiplyScalar(along);r1.copy(S.vel).sub(tmp).multiplyScalar(Math.exp(-dt*0.9));
      S.vel.copy(fwd).multiplyScalar(along+dv).add(r1);
      S.v=Math.max(0,along+dv);
      ROOT.position.addScaledVector(S.vel,dt);
      W.collide&&W.collide(S,dt);
    }else{S.acc*=0.9;S.v=FULL;S.vel.copy(fwd).multiplyScalar(FULL);if(W.warpTick)W.warpTick(dt,fwd);}
    // the floating origin
    if(ROOT.position.lengthSq()>4e8){const off=ROOT.position.clone();for(const o of [ROOT,SYS,FX])o.position.sub(off);
      for(let i=0;i<DN;i++){dpos[i*3]-=off.x;dpos[i*3+1]-=off.y;dpos[i*3+2]-=off.z;}}
    // the glow of the impulse engines answers the push; the thrusters answer the turn
    const push=Math.max(0,Math.min(1,S.acc/THRUST)),idle=S.warp?0.2:0.35+0.4*S.thr;
    for(const g of W.impGlows){g.scale.setScalar(40*(idle+1.3*push));g.material.opacity=Math.min(1,0.5+0.5*push+0.2*S.thr);}
    for(const s of puffs){const {a,kind}=s.userData,side=Math.sign(Math.sin(a)),fore=Math.cos(a)>0?1:-1;let k=0;
      if(kind==='side')k=Math.max(0,angAcc.y*side*fore)/ACC.y;
      else{const pz=angAcc.z/ACC.z*fore,rx=angAcc.x/ACC.x*side;k=Math.max(0,(kind==='down'?pz:-pz))+Math.max(0,(kind==='up'?rx:-rx))*0.8;}
      k=Math.min(1,k*0.9);s.material.opacity+=(k-s.material.opacity)*0.5;s.scale.setScalar(10+18*s.material.opacity);}
  }

  // ---- a standard orbit ----
  // The nearest solid body within a few of its own radii: the ship turns along the circle it is on (about the
  // axis it is already moving round, so going into orbit is smooth), keeps its height, and keeps its speed.
  function toggleOrbit(){
    if(S.orbit){S.orbit=null;return;}
    const b=W.orbitable&&W.orbitable();if(!b)return;
    const c=b.c,rel=ROOT.position.clone().sub(c);let axis=rel.clone().cross(S.vel.lengthSq()>1?S.vel:fwd.set(1,0,0).applyQuaternion(ROOT.quaternion)).normalize();
    if(axis.lengthSq()<0.5)axis.set(0,1,0);
    S.orbit={b,axis,h:rel.length()};if(S.thr<0.15)setThrottle(0.25);
  }
  function orbitDir(dt){
    const o=S.orbit,c=o.b.c,rel=ROOT.position.clone().sub(c),d=rel.length();
    // ease back onto the orbit's height if anything pushed the ship off it
    return o.axis.clone().cross(rel).normalize().addScaledVector(rel.normalize(),Math.max(-0.3,Math.min(0.3,(o.h-d)/3000))).normalize();
  }
  W.orbitInfo=()=>S.orbit&&{name:S.orbit.b.name,h:Math.round((ROOT.position.distanceTo(S.orbit.b.c)-S.orbit.b.r)/1000)};

  // the chase camera, when flying (the page's turntable otherwise)
  let lastCam=null;
  const camFrame=now=>{
    SKY.position.copy(camera.position);
    if(!S.on)return false;
    const dt=lastCam==null?0.016:Math.min(0.1,(now-lastCam)/1000);lastCam=now;
    const q=ROOT.quaternion,c=ROOT.position,k=1-Math.exp(-dt*7);
    fwd.set(1,0,0).applyQuaternion(q);
    tmp.set(-Math.cos(S.cp)*Math.cos(S.cy),Math.sin(S.cp),Math.cos(S.cp)*Math.sin(S.cy)).multiplyScalar(S.cd).applyQuaternion(q);
    // pressed back as the engines push, and thrown back as warp catches
    S.punch*=Math.exp(-dt*1.6);tmp.addScaledVector(fwd,-(S.acc*0.7+S.punch)*Math.min(1,S.cd/900));
    S.camRel.lerp(tmp,k);
    const upW=r1.set(0,1,0).applyQuaternion(q);S.up.lerp(upW,k).normalize();
    camera.position.copy(c).add(S.camRel);
    if(S.shake>0){S.shake*=Math.exp(-dt*5);camera.position.x+=(Math.random()-0.5)*S.shake;camera.position.y+=(Math.random()-0.5)*S.shake;}
    camera.up.copy(S.up);
    camera.lookAt(r2.copy(c).addScaledVector(fwd,S.cd*0.12));
    const fv=S.warp?FOV0+16:FOV0+7*Math.min(1,S.v/FULL)+4*Math.min(1,S.punch/600);
    S.fov+=(fv-S.fov)*(1-Math.exp(-dt*2));if(Math.abs(camera.fov-S.fov)>0.02){camera.fov=S.fov;camera.updateProjectionMatrix();}
    lamp.position.copy(camera.position);
    SKY.position.copy(camera.position);
    if(W.placeFrame)W.placeFrame(now,dt);
    // the dust round the camera, or the streaks at warp
    const warp=!!S.warp;dust.visible=!warp&&S.v>1;streaks.visible=warp;
    const cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
    if(dust.visible){for(let i=0;i<DN;i++){const j=i*3;dpos[j]=cx+wrap(dpos[j]-cx,DL);dpos[j+1]=cy+wrap(dpos[j+1]-cy,DL);dpos[j+2]=cz+wrap(dpos[j+2]-cz,DL);}
      dg.attributes.position.needsUpdate=true;}
    if(warp){const f=S.warp,len=Math.min(6000,900+f*500),t=now*0.001*(20000+f*9000);
      r1.set(0,1,0).applyQuaternion(q);r2.set(0,0,1).applyQuaternion(q);
      for(let i=0;i<SN;i++){const s=seed[i];
        // each streak slides back past the ship along its own line, wrapping round, clear of the ship itself
        const along=wrap(s[0]-t,SL);let a=s[1]*0.5,b=s[2]*0.5;const rr=Math.hypot(a,b);if(rr<900){const m=900/Math.max(1,rr);a*=m;b*=m;}
        const x=cx+fwd.x*along+r1.x*a+r2.x*b,y=cy+fwd.y*along+r1.y*a+r2.y*b,z=cz+fwd.z*along+r1.z*a+r2.z*b;
        const j=i*6;spos[j]=x;spos[j+1]=y;spos[j+2]=z;spos[j+3]=x-fwd.x*len;spos[j+4]=y-fwd.y*len;spos[j+5]=z-fwd.z*len;}
      sg.attributes.position.needsUpdate=true;}
    return true;
  };

  // ---- taking the helm, and handing it back ----
  function start(){
    if(S.on)return;S.on=true;lastCam=null;
    const qi=ROOT.quaternion.clone().invert();
    S.camRel.copy(camera.position).sub(ROOT.position);
    const L=S.camRel.clone().applyQuaternion(qi);S.cd=Math.max(140,L.length());S.cp=Math.asin(Math.max(-1,Math.min(1,L.y/S.cd)));S.cy=Math.atan2(L.z,-L.x);
    S.up.copy(camera.up);S.fov=camera.fov;
    if(!S.thr&&!S.warp)setThrottle(0.25);
    help.style.display=padEl.style.display='';
  }
  function stop(){
    if(!S.on)return;
    if(W.course)W.course.clear();
    if(S.warp)W.dropOut(true);
    S.on=false;S.v=0;S.thr=0;S.acc=0;S.punch=0;S.orbit=null;S.vel.set(0,0,0);S.rate.set(0,0,0);S.bank=0;BANK.rotation.x=0;dust.visible=streaks.visible=false;
    for(const s of puffs)s.material.opacity=0;
    camera.fov=FOV0;camera.updateProjectionMatrix();
    help.style.display=padEl.style.display='none';
    // put the ship back at the origin, level, by moving the world round it the other way
    const p=ROOT.position.clone(),qi=ROOT.quaternion.clone().invert();
    for(const o of [SYS,FX]){o.position.sub(p).applyQuaternion(qi);o.quaternion.premultiply(qi);}
    SKY.quaternion.premultiply(qi);sun.applyQuaternion(qi);fillDir.applyQuaternion(qi);
    const rel=S.camRel.clone().applyQuaternion(qi),d=rel.length();
    ROOT.position.set(0,0,0);ROOT.quaternion.identity();
    W.api.view({az:Math.atan2(rel.z,rel.x),el:Math.asin(Math.max(-1,Math.min(1,rel.y/d))),d,tx:0,ty:0,tz:0});
  }

  // ---- the help and the touch helm ----
  // (styled here: only this page has them; the colours are the Chicago shell's, which this page wears)
  {const st=document.createElement('style');st.textContent=`
#ent-help{position:fixed;left:14px;bottom:calc(var(--barh,56px) + 8px);max-width:min(340px,calc(100% - 28px));font:12px/1.55 Helvetica,Arial,sans-serif;color:#dfe8f0;background:rgba(8,20,34,.82);border:1px solid #3f5a74;padding:8px 10px;z-index:5;pointer-events:none}
#ent-help b{letter-spacing:.12em;text-transform:uppercase;font-size:11px;color:#9fb4c8}
#ent-pad{position:fixed;right:14px;bottom:calc(var(--barh,56px) + 8px);display:grid;grid-template-columns:repeat(3,48px);gap:5px;z-index:5;touch-action:none}
#ent-pad button{height:44px;background:rgba(10,24,40,.8);color:#dfe8f0;border:1px solid #7fa6c8;font:18px Helvetica,Arial,sans-serif;border-radius:3px;cursor:pointer;user-select:none;-webkit-user-select:none}
#ent-pad button:active{background:#7fa6c8;color:#08131f}
#pitpanel,#navpanel{background:rgba(8,20,34,.94);border-color:#3f5a74}
#pitpanel button,#navpanel button{background:rgba(10,24,40,.8);color:#dfe8f0;border-color:#3f5a74;font-family:Helvetica,Arial,sans-serif}
#pitpanel .sub,#navpanel .sub{color:#9fb4c8;font-family:Helvetica,Arial,sans-serif}
#pitpanel button[aria-pressed="true"],#navpanel button[aria-pressed="true"]{background:#7fa6c8;color:#08131f}
@media (pointer:fine){#ent-pad{display:none!important}}
@media (max-width:600px){#ent-help{display:none!important}}
body.bare #ent-help,body.bare #ent-pad,body.bare #navpanel{display:none!important}`;document.head.appendChild(st);}
  const help=document.createElement('div');help.id='ent-help';help.style.display='none';
  help.innerHTML='<b>At the helm</b><br>Hold W / S for more or less impulse · X all stop<br>A / D turn · ↑ / ↓ (or R / F) pitch · Q / E roll<br>C the star chart, to set a course · O standard orbit<br>1–9 warp · 0 drop out<br>Space phasers · T torpedo<br>Drag to look round, scroll to stand off';
  const padEl=document.createElement('div');padEl.id='ent-pad';padEl.style.display='none';
  const names={q:'Roll left',ArrowUp:'Nose up',e:'Roll right',a:'Turn left',ArrowDown:'Nose down',d:'Turn right',s1:'Slower',x1:'All stop',w1:'Faster'};
  for(const [lab,k] of [['⟲','q'],['▲','ArrowUp'],['⟳','e'],['◀','a'],['▼','ArrowDown'],['▶','d'],['−','s1'],['■','x1'],['+','w1']]){
    const b=document.createElement('button');b.type='button';b.textContent=lab;b.setAttribute('aria-label',names[k]);
    if(k.endsWith('1'))b.onclick=()=>{if(k==='w1')setThrottle(S.thr+0.25);if(k==='s1')setThrottle(S.thr-0.25);if(k==='x1')allStop();};
    else{const on=e=>{pad.add(k);e.preventDefault();},off=()=>pad.delete(k);
      b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);}
    padEl.appendChild(b);}
  document.body.append(help,padEl);

  // the helm's line in the readout: speed, and the heading and mark the way the bridge would say them
  W.heading=()=>{fwd.set(1,0,0).applyQuaternion(ROOT.quaternion).applyQuaternion(SKY.quaternion.clone().invert());
    return {hd:((Math.round(Math.atan2(-fwd.z,fwd.x)*180/Math.PI)%360)+360)%360,mk:Math.round(Math.asin(Math.max(-1,Math.min(1,fwd.y)))*180/Math.PI),f:fwd.clone()};};
  const hud=()=>{
    if(!S.on)return '';
    const {hd,mk}=W.heading();
    let sp;
    if(S.warp)sp='warp '+S.warp+' ('+Math.round(warpC(S.warp)).toLocaleString('en')+' c, time ×'+TIMEX.toLocaleString('en')+')';
    else{const pc=Math.round(S.thr*100);sp=(pc===0?(S.v>5?'coasting':'all stop'):pc===100?'full impulse':'impulse '+pc+'%')+' · '+(S.v>=1000?(S.v/1000).toFixed(1)+' km/s':Math.round(S.v)+' m/s');}
    const o=W.orbitInfo();
    return sp+' · heading '+String(hd).padStart(3,'0')+' mark '+mk+(o?' · standard orbit, '+o.name+', '+o.h+' km up':'');
  };
  return {start,stop,camFrame,hud};
}
