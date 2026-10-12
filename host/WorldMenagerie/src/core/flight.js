// ---------- flight mode ----------
// A small aeroplane you can fly around a city, for the pages whose city is a real place: those have real
// terrain and a real street layout under them, and the only way to get a feel for either is to go and
// look. The rest of the site is looked at from outside, which is what the orbit camera is for.
//
// This does not replace the camera. The engine's render loop hands the top of its camera stack the control state after
// it has had its own turn with it, so flying is a matter of working out where the aeroplane is and then
// telling the orbit camera to sit behind it: target on the aeroplane, azimuth its heading reversed,
// elevation off its pitch, and a short leash. Leaving flight mode puts the hook back and the camera is
// exactly where it was left, looking at wherever the aeroplane got to.
//
// The flying model is deliberately forgiving. There is no stall, no spin and no fuel; the throttle sets a
// speed and the aeroplane holds it, a bank turns it, and the ground and the rooftops push it up rather
// than ending the flight. It is a way of moving a camera about, not a simulator.

const clamp=(v,a,b)=>v<a?a:v>b?b:v;

function buildPlane(THREE){
  const g=new THREE.Group();
  const body=new THREE.MeshLambertMaterial({color:0xe2e6e9});
  const trim=new THREE.MeshLambertMaterial({color:0x8d959d});
  const glass=new THREE.MeshLambertMaterial({color:0x1d2e3a});
  const disc=new THREE.MeshLambertMaterial({color:0x8d959d,transparent:true,opacity:0.26,
    side:THREE.DoubleSide,depthWrite:false});
  const add=(geo,mat,p,r)=>{const m=new THREE.Mesh(geo,mat);m.position.set(p[0],p[1],p[2]);
    if(r)m.rotation.set(r[0]||0,r[1]||0,r[2]||0);return (g.add(m),m);};
  // the fuselage, nose towards +x, which is the convention everything else on this site uses
  add(new THREE.CylinderGeometry(0.62,0.95,7.4,14),body,[-0.4,0,0],[0,0,-Math.PI/2]);
  add(new THREE.ConeGeometry(0.95,2.6,14),body,[4.6,0,0],[0,0,-Math.PI/2]);
  add(new THREE.ConeGeometry(0.62,3.4,14),body,[-5.8,0,0],[0,0,Math.PI/2]);
  // the wings, with a little dihedral, and the tailplane
  for(const sd of [-1,1]){
    add(new THREE.BoxGeometry(2.9,0.22,6.7),body,[0.5,-0.28,sd*3.65],[-sd*0.07,0,0]);
    add(new THREE.BoxGeometry(1.5,0.18,2.5),body,[-5.4,0.25,sd*1.4],[-sd*0.05,0,0]);
    // the navigation lights: red to port, green to starboard, which with +x forward and +y up puts
    // green on +z
    const lamp=new THREE.MeshBasicMaterial({color:sd>0?0x40ff70:0xff4030});
    add(new THREE.SphereGeometry(0.17,8,6),lamp,[0.5,-0.2,sd*6.95]);
  }
  add(new THREE.BoxGeometry(2.1,2.5,0.22),trim,[-5.7,1.3,0]);
  const can=add(new THREE.SphereGeometry(0.75,14,10),glass,[1.9,0.52,0]);
  can.scale.set(2.3,0.72,1);
  // the propeller: two blades and the disc they sweep
  const prop=new THREE.Group();prop.position.set(6.0,0,0);g.add(prop);
  for(const a of [0,Math.PI/2]){
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.1,3.0,0.34),trim);
    b.rotation.x=a;prop.add(b);
  }
  const sweep=new THREE.Mesh(new THREE.CircleGeometry(1.55,24),disc);
  sweep.rotation.y=Math.PI/2;prop.add(sweep);
  g.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
  return {group:g,prop};
}

export function installFlight(A){
  const {THREE,C,ctx,camera,ctl,ui,side,mkBtn,groundH,roofAt,inMap,B,scene,setView,VIEWS}=A;
  const F=(C&&C.flight)||null;
  if(!F)return null;
  const K=(typeof F==='object')?F:{};

  // How fast is worth flying depends entirely on how big the map is. Chicago is sixteen kilometres corner
  // to corner and wants a couple of hundred metres a second; the Walled City is one and a half and would
  // be crossed in eight seconds at that speed.
  const DIAG=Math.hypot(B.w,B.d);
  const VMAX=K.speed||clamp(DIAG*0.013,34,240);
  const LEASH=K.chase||clamp(DIAG*0.004,38,70);   // the aeroplane is 13 m whatever the map is
  // How far past the edge of the map she may get before the flight is over. There is nothing out there -
  // no terrain, no buildings, no map - so flying on is pointless, but stopping dead at the boundary or
  // spinning her round on the spot both feel like hitting glass. A margin, then a landing.
  const MARGIN=K.margin||Math.max(120,DIAG*0.02);   // a couple of seconds of grace, not a mile of it
  const CEIL=K.ceiling||Math.max(2500,DIAG*0.40);

  const {group:plane,prop}=buildPlane(THREE);
  plane.visible=false;scene.add(plane);

  const S={on:false,head:0,pitch:0,roll:0,thr:0.55,v:0,pos:new THREE.Vector3(),
           roofY:0,roofAt:0,prevCam:null,prevUp:new THREE.Vector3(0,1,0),goalSeen:null,warn:''};
  let hudT=0;
  const keys=new Set();
  const typingIn=t=>!!t&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);

  const hud=document.createElement('pre');hud.id='flighthud';
  hud.style.cssText='display:none;font:12px/1.45 ui-monospace,Menlo,Consolas,monospace;white-space:pre';
  if(side)side.appendChild(hud);

  let btn=null;
  function label(){if(btn)btn.textContent=S.on?'Land (Esc)':'Fly';}
  // In flight the wheel moves the chase camera in and out from the aeroplane (from close behind her to well back),
  // instead of zooming the orbit camera, which the flight hook would only put back the next frame
  addEventListener('wheel',e=>{if(!S.on)return;S.leash=clamp((S.leash||LEASH)*Math.exp(e.deltaY*0.0012),LEASH*0.35,LEASH*8);e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});

  function enter(){
    if(S.on)return;
    S.on=true;
    // start where the camera was looking, well clear of the rooftops, pointing the way you were facing
    S.pos.copy(ctl.target);
    const g=groundH(S.pos.x,S.pos.z)||0, r=roofAt?(roofAt(S.pos.x,S.pos.z)||0):0;
    S.pos.y=Math.max(S.pos.y,g+r+90);
    S.head=ctl.az+Math.PI;S.pitch=0;S.roll=0;S.v=VMAX*S.thr;
    S.popCam=ctx.pushCam(frame);          // on top of whatever else is steering (the stack is the engine's)
    S.prevUp.copy(camera.up);
    S.goalSeen=ctl.goal;
    plane.visible=true;hud.style.display='';
    label();
  }
  // `home` puts the camera back where the page opens rather than leaving it wherever the aeroplane got
  // to - which is what you want when the reason for landing is that she left the map, because out there
  // the view is of nothing at all.
  function leave(home){
    if(!S.on)return;
    S.on=false;keys.clear();S.warn='';
    plane.visible=false;hud.style.display='none';
    ctx.details=Object.assign(ctx.details||{},{flight:'landed'+(home?' (left the map)':'')});
    camera.up.copy(S.prevUp);
    if(S.popCam){S.popCam();S.popCam=null;}
    if(home&&setView&&VIEWS){
      const v=VIEWS[C.defaultView]||Object.values(VIEWS)[0];
      if(v){setView(...v);label();return;}
    }
    // otherwise hand the camera back looking at wherever she got to, from a sensible distance
    ctl.target.copy(S.pos);ctl.dist=Math.max(LEASH*6,220);ctl.el=0.45;ctl.goal=null;
    label();
  }

  addEventListener('keydown',e=>{
    if(typingIn(e.target)||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'&&S.on){leave(false);return;}
    if(!S.on)return;
    const k=e.key.toLowerCase();
    if(k===' '||k==='w'||k==='a'||k==='s'||k==='d'||k==='q'||k==='e'){keys.add(k);e.preventDefault();}
  });
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});

  const fwd=new THREE.Vector3(),look=new THREE.Vector3(),right=new THREE.Vector3(),up0=new THREE.Vector3();
  const WORLD_UP=new THREE.Vector3(0,1,0);
  let tPrev=performance.now();

  function frame(now,c){
    const dt=Math.min(0.05,(now-tPrev)/1000);tPrev=now;
    // a viewpoint button was pressed: the engine has queued a flight of its own, so get out of the way
    if(c.goal&&c.goal!==S.goalSeen){leave(false);return;}

    if(keys.has('w'))S.pitch-=1.05*dt;
    if(keys.has('s'))S.pitch+=1.05*dt;
    if(keys.has('a'))S.roll-=1.9*dt;
    if(keys.has('d'))S.roll+=1.9*dt;
    if(keys.has('e'))S.thr=clamp(S.thr+0.55*dt,0,1);
    if(keys.has('q'))S.thr=clamp(S.thr-0.55*dt,0,1);
    if(keys.has(' ')){S.roll*=Math.pow(0.02,dt);S.pitch*=Math.pow(0.05,dt);}
    // hands off and she flies herself level, slowly, the way a stable aeroplane does
    if(!keys.has('a')&&!keys.has('d'))S.roll*=Math.pow(0.45,dt);
    S.pitch=clamp(S.pitch,-1.15,1.15);
    S.roll=clamp(S.roll,-1.25,1.25);

    S.v+=(VMAX*S.thr-S.v)*(1-Math.pow(0.1,dt));
    // a banked aeroplane turns; the real relation is g·tan(bank)/v, exaggerated here because a city is
    // small and nobody wants a two-kilometre turning circle
    S.head+=Math.tan(S.roll)*9.81/Math.max(28,S.v)*2.6*dt;

    fwd.set(Math.cos(S.pitch)*Math.cos(S.head),Math.sin(S.pitch),Math.cos(S.pitch)*Math.sin(S.head));
    S.pos.addScaledVector(fwd,S.v*dt);

    // the ground and the rooftops push, rather than ending the flight. roofAt walks a bucket of building
    // footprints, so it is sampled a few times a second instead of every frame.
    const g=groundH(S.pos.x,S.pos.z)||0;
    if(now-S.roofAt>140){S.roofAt=now;S.roofY=roofAt?(roofAt(S.pos.x,S.pos.z)||0):0;}
    const floor=g+S.roofY+7;
    if(S.pos.y<floor){S.pos.y=floor;if(S.pitch<0)S.pitch*=0.4;S.v*=Math.pow(0.55,dt);}
    // Off the edge of the map, or far enough above it, and the flight is over: there is no terrain out
    // there and no buildings, so there is nothing to fly over. She gets a margin's grace first, with the
    // readout saying so, and then lands herself and the camera goes home to the page's opening view.
    const outX=Math.max(B.x0-S.pos.x,S.pos.x-B.x1,0);
    const outZ=Math.max(B.z0-S.pos.z,S.pos.z-B.z1,0);
    const out=Math.max(outX,outZ), high=S.pos.y-g-CEIL;
    if(out>MARGIN||high>0){leave(true);return;}
    S.warn=out>0?`off the map \u2014 ${Math.round(MARGIN-out)} m of grace`
         :high>-CEIL*0.25?`${Math.round(-high)} m below the ceiling`:'';

    plane.position.copy(S.pos);
    plane.rotation.set(0,0,0);
    plane.rotateY(-S.head);plane.rotateZ(S.pitch);plane.rotateX(S.roll);
    prop.rotation.x+=(6+S.v*0.5)*dt;

    // the camera: behind and a little above, pitching with her and banking rather less
    c.target.copy(S.pos).addScaledVector(fwd,LEASH*0.22);
    c.az=S.head+Math.PI;
    c.el=clamp(0.17-S.pitch*0.72,c.elMin,c.elMax);
    c.dist=S.leash||LEASH;
    c.goal=null;S.goalSeen=null;
    const e=c.el;
    look.set(-Math.cos(c.az)*Math.cos(e),-Math.sin(e),-Math.sin(c.az)*Math.cos(e)).normalize();
    right.crossVectors(look,WORLD_UP).normalize();
    up0.crossVectors(right,look).normalize();
    camera.up.copy(up0).multiplyScalar(Math.cos(S.roll*0.55)).addScaledVector(right,Math.sin(S.roll*0.55));

    if(now-hudT>120){
      hudT=now;
      // telemetry, so the headless probe can see where she actually is and whether the boundary is
      // doing anything - this was invisible from a screenshot of open water
      ctx.details=Object.assign(ctx.details||{},{flight:
        `on x${Math.round(S.pos.x)} z${Math.round(S.pos.z)} y${Math.round(S.pos.y)} `+
        `box[${Math.round(B.x0)},${Math.round(B.x1)}]x[${Math.round(B.z0)},${Math.round(B.z1)}] `+
        `out=${Math.round(out)}/${Math.round(MARGIN)} agl=${Math.round(S.pos.y-g)}/${Math.round(CEIL)}`});
      const bars=Math.round(S.thr*10);
      hud.textContent=`throttle ${'█'.repeat(bars)}${'░'.repeat(10-bars)} ${Math.round(S.thr*100)}%\n`+
        `speed    ${Math.round(S.v)} m/s\naltitude ${Math.round(S.pos.y-g)} m agl\n`+
        `W/S pitch  A/D bank\nQ/E throttle  space level`;
    }
  }

  btn=mkBtn('Fly',ui,()=>{S.on?leave(false):enter();});
  label();
  // #fly in the address opens straight into flight, which is what makes a link to it worth sending and
  // is also the only way a headless browser can be pointed at this
  try{
    const q=new URLSearchParams(location.hash.slice(1));
    if(q.has('fly')||/(^|[?&])fly(&|=|$)/.test(location.search))setTimeout(enter,60);
  }catch(e){}
  return {enter,leave,state:S};
}
