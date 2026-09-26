// ---------- the Backrooms: entry point for backrooms.html ----------
// Fan work. The Backrooms began as one anonymous photograph of an empty yellow office posted in 2019, and a
// caption under it, and grew into a collaborative fiction with a wiki and a numbering of levels, and into
// Kane Parsons's films. None of theirs is used here: every surface is drawn by this page on a canvas, and the
// rooms come out of a seeded generator (level.js) that knows nothing but a grid and some numbers.
//
// Like the habitat, this page does not run on the shared engine. The engine builds a city: terrain, footprints
// pushed up out of it, a sky over the lot, and an orbit camera looking down at it. Here there is no outside, no
// sky and no map - there is only the room you are standing in and the ones you can see from it - so the page
// brings its own renderer and a camera that walks, and shares the core modules with everything else.
import {report,LOAD,configureLoading,installErrorHandlers,stage} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {createWorld,LEVELS,ORDER,C} from './level.js';
import {makeTextures} from './textures.js';
import {createSound} from './sound.js';
import {sceneRows} from '../core/layout.js';

installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  lines:[
    'Fan work. The Backrooms are a collaborative fiction that started with one photograph; nothing of it is used here.',
    'The rooms are made as you walk into them and forgotten when you leave. Come back and they are made again, the same.',
    'Every wall stands on a grid line 2.4 metres apart. It does not help.',
    'None of the lamps is a real light. There are too many of them for that, so every corner is lit in advance.',
    'The carpet is damp. It has always been damp. Nobody has found where the water comes from.',
    'The hum is two oscillators and a noise generator. It is also the loudest thing here.',
    'Every chunk has at least one way into each of its neighbours, so there is always a way on. Not a way out.',
    'N lets you fall through the floor into somewhere else. It is not better.',
  ],
  prefix:'noclipping… ',labels:{config:'finding the seam',textures:'papering the walls',rooms:'laying out the rooms',
    ui:'switching on the lights'}});

const ctx=window._iz={};

async function build(){
  if(!window.THREE){document.getElementById('loading').textContent=
    'three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
  const THREE=window.THREE;
  await stage('config');
  const HASH=new URLSearchParams(location.hash.slice(1));
  const S={seed:+HASH.get('seed')||+new URLSearchParams(location.search).get('seed')||1+Math.floor(Math.random()*999998),level:+(HASH.get('level')||0)};
  if(!LEVELS[S.level])S.level=0;

  // ---- the scene ----
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,0.05,90);
  camera.rotation.order='YXZ';
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.setSize(innerWidth,innerHeight);
  document.body.appendChild(renderer.domElement);
  const animHooks=[];

  await stage('textures');
  const textures=makeTextures(THREE,7,renderer.capabilities.getMaxAnisotropy());
  const uT={value:0};

  // ---- the walker ----
  // Eye height 1.6 m, a radius of 0.3 m so a doorway is a squeeze and a corridor is not, walking pace
  // 1.5 m/s and a run of 4.
  const P={x:0,z:0,y:1.6,yaw:0,pitch:0,walked:0,bob:0};
  // The god's-eye view: the ceiling lifted off and the camera straight overhead, north up, so you can see the
  // floor and the plan of the rooms round you. You still walk them - the walker is the red marker - and the
  // walls still stop you. H is the height of the eye over the floor.
  // The lens is narrowed for it (40 degrees rather than 72), so the walls stand up rather than leaning out from
  // the middle of the screen and it reads as a plan.
  const GOD={on:false,H:50,apply:null,min:14,max:110};
  {const g=HASH.get('god');if(g!==null){GOD.on=true;if(+g>0)GOD.H=Math.max(GOD.min,Math.min(GOD.max,+g));}}
  let W=null;
  function enter(level,keepPlace){
    if(W)W.dispose();
    S.level=level;W=createWorld({THREE,scene,level,seed:S.seed,textures,uT});
    const L=W.L;scene.fog=new THREE.Fog(L.fog[0],L.fog[1],L.fog[2]);renderer.setClearColor(L.clear);
    if(!keepPlace)home();
    // a start inside a pool or on top of a column is a bad start
    P.y=W.floorAt(P.x,P.z)+1.6;
    ctx.details=Object.assign(ctx.details||{},{level:L.name,seed:S.seed});
    if(GOD.apply)GOD.apply();
    writeHash();
  }
  // Where you arrive: the middle of the first chunk, or the nearest cell to it that is not the bottom of a pool.
  function home(){let gx=4,gz=4;
    search:for(let r=0;r<8;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)
      if(W.floorAt((4+a+0.5)*C,(4+b+0.5)*C)>=0){gx=4+a;gz=4+b;break search;}
    P.x=C*(gx+0.5);P.z=C*(gz+0.5);P.yaw=W.openHeading(gx,gz);P.pitch=0;P.walked=0;P.y=W.floorAt(P.x,P.z)+1.6;}
  function writeHash(){
    const h=new URLSearchParams(location.hash.slice(1));
    h.set('seed',S.seed);h.set('level',S.level);h.set('at',[P.x.toFixed(1),P.z.toFixed(1),P.yaw.toFixed(2)].join(','));
    if(GOD.on)h.set('god',Math.round(GOD.H));else h.delete('god');
    history.replaceState(null,'','#'+h.toString().replace(/%2C/g,','));
  }

  await stage('rooms');
  enter(S.level,false);
  {const at=(HASH.get('at')||'').split(',').map(Number);
   if(at.length===3&&at.every(Number.isFinite)){P.x=at[0];P.z=at[1];P.yaw=at[2];W.collide(P,0.3);P.y=W.floorAt(P.x,P.z)+1.6;}}
  // everything in view before the first frame, so nothing is seen being built
  W.update(P.x,P.z,1e9);
  // the fingerprint the tests check: the rooms round where you arrive, as they are before anything flickers
  {const rows=[];for(const c of W.live.values())rows.push(...sceneRows(THREE,c.g));
   rows.sort((p,q)=>p.x-q.x||p.h-q.h||p.z-q.z||p.dpt-q.dpt);ctx.lotList=rows;}

  // ---- looking and walking ----
  await stage('ui');
  const el=renderer.domElement,keys=new Set();
  const sound=createSound();
  const wake=()=>sound.start(S.level);
  let drag=null,stick=null;
  const locked=()=>document.pointerLockElement===el;
  // Capturing the pointer is a nicety for dragging, not a requirement. Firefox refuses it (InvalidStateError,
  // "no longer usable") on the same click that asks for pointer lock, and a refusal is not worth an error report.
  const capture=id=>{try{el.setPointerCapture(id);}catch(_){}};
  el.addEventListener('pointerdown',e=>{wake();
    if(e.pointerType==='mouse'&&!GOD.on&&el.requestPointerLock&&!locked()){try{const r=el.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}
    // touch: the left third of the screen is a stick to walk with, the rest is for looking
    if(e.pointerType==='touch'&&e.clientX<innerWidth*0.36){stick={id:e.pointerId,x0:e.clientX,y0:e.clientY,dx:0,dy:0};capture(e.pointerId);return;}
    capture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});
  const endPtr=e=>{if(stick&&e.pointerId===stick.id)stick=null;if(drag&&e.pointerId===drag.id)drag=null;};
  addEventListener('pointerup',endPtr);addEventListener('pointercancel',endPtr);
  const look=(dx,dy,k)=>{P.yaw-=dx*k;P.pitch=Math.max(-1.45,Math.min(1.45,P.pitch-dy*k));};
  addEventListener('mousemove',e=>{if(locked())look(e.movementX,e.movementY,0.0022);});
  el.addEventListener('pointermove',e=>{
    if(stick&&e.pointerId===stick.id){stick.dx=e.clientX-stick.x0;stick.dy=e.clientY-stick.y0;return;}
    if(!drag||e.pointerId!==drag.id||locked())return;
    if(e.buttons===0&&e.pointerType!=='touch'){drag=null;return;}
    look(e.clientX-drag.x,e.clientY-drag.y,0.004);drag.x=e.clientX;drag.y=e.clientY;});
  const MOVE=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift']);
  addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;
    const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'))return;
    const k=e.key.toLowerCase();wake();
    if(MOVE.has(k)){keys.add(k);if(k!=='shift')e.preventDefault();return;}
    if(k==='n'){noclip();return;}
    if(k==='m'){toggleSound();return;}
    if(k==='r'){reset();return;}
    if(k==='g'){toggleGod();return;}
    if(GOD.on&&(k==='+'||k==='='||k==='-'||k==='_')){zoomGod(k==='-'||k==='_'?1.15:1/1.15);e.preventDefault();return;}});
  el.addEventListener('wheel',e=>{if(!GOD.on)return;e.preventDefault();zoomGod(Math.exp(e.deltaY*0.0012));},{passive:false});
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>{keys.clear();drag=null;stick=null;});

  // ---- the panels ----
  const ui=document.getElementById('ui');
  const mkBtn=(label,parent,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;
    b.onclick=e=>{e.stopPropagation();fn();};parent.appendChild(b);return b;};
  const flash=document.getElementById('noclip');
  let busy=false;
  // Falling out of the level: the screen goes to static for a moment, and when it comes back you are
  // somewhere else, standing in the first room of it.
  function noclip(){
    if(busy)return;busy=true;flash.classList.add('on');
    setTimeout(()=>{try{
      const next=ORDER[(ORDER.indexOf(S.level)+1)%ORDER.length];
      enter(next,false);W.update(P.x,P.z,1e9);sound.level(next);refreshWire();
    }catch(e){report('noclip',e);}
      setTimeout(()=>{flash.classList.remove('on');busy=false;},250);},650);
  }
  function reset(){home();W.update(P.x,P.z,1e9);writeHash();}
  const nb=mkBtn('Noclip',ui,noclip);nb.title='Fall through the floor into another level (N)';
  const sb=mkBtn('Sound: off',ui,()=>toggleSound());sb.title='The hum (M)';
  function toggleSound(){sound.start(S.level);const on=sound.toggle();sb.textContent='Sound: '+(on?'on':'off');sb.setAttribute('aria-pressed',String(on));}
  sound.onstart=()=>{sb.textContent='Sound: '+(sound.on?'on':'off');sb.setAttribute('aria-pressed',String(sound.on));};
  mkBtn('Start again',ui,reset).title='Back to the room you arrived in (R)';
  const gb=mkBtn("God's eye",ui,()=>toggleGod());gb.title='Lift the ceiling off and look down on the rooms (G); the wheel or + and - to go higher or lower';
  // the walker, seen from above: a disc where you stand and a point the way you face
  const marker=new THREE.Group();
  {const red=new THREE.MeshBasicMaterial({color:0xff3030,fog:false,depthTest:false}),ring=new THREE.MeshBasicMaterial({color:0xffffff,fog:false,depthTest:false,transparent:true,opacity:0.8});
   const disc=new THREE.Mesh(new THREE.CircleGeometry(0.32,20).rotateX(-Math.PI/2),red);
   const halo=new THREE.Mesh(new THREE.RingGeometry(0.36,0.46,24).rotateX(-Math.PI/2),ring);
   const tip=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.22,0,-0.3),new THREE.Vector3(0,0,-0.85),new THREE.Vector3(0.22,0,-0.3)]),red);
   for(const m of [disc,halo,tip]){m.renderOrder=10;marker.add(m);}}
  marker.visible=false;scene.add(marker);
  function toggleGod(on){GOD.on=on===undefined?!GOD.on:!!on;if(GOD.on&&locked())document.exitPointerLock();GOD.apply();writeHash();}
  function zoomGod(k){GOD.H=Math.max(GOD.min,Math.min(GOD.max,GOD.H*k));GOD.apply();}
  // what changes with it: the ceiling and its panels go, the tops of the walls appear, the fog is pushed out to
  // where the floor is, and the rooms are kept further out because more of them are in view
  GOD.apply=()=>{const m=W.mats;m.ceil.visible=m.panel.visible=!GOD.on;m.top.visible=GOD.on;marker.visible=GOD.on;W.hideUpper(GOD.on);
    const L=W.L;if(GOD.on){scene.fog.near=GOD.H*1.02;scene.fog.far=GOD.H*1.5+10;camera.far=GOD.H*2+40;camera.fov=40;}
    else{scene.fog.near=L.fog[1];scene.fog.far=L.fog[2];camera.far=90;camera.fov=72;}
    camera.updateProjectionMatrix();gb.setAttribute('aria-pressed',String(GOD.on));
    if(GOD.on)document.getElementById('hint').classList.add('gone');};
  GOD.apply();
  mkBtn('Another seed',ui,()=>{S.seed=1+Math.floor(Math.random()*999998);enter(S.level,false);W.update(P.x,P.z,1e9);refreshWire();}).title='A different place, the same everywhere';
  // The shared wireframe builds its twins once, from whatever is in the scene at the time - and here the scene
  // is replaced as you walk. So when chunks come and go while it is on, the old twins are thrown away and it is
  // built again from what is there now. Edges are cached by geometry, so only the new chunks cost anything.
  const wire=createWire({THREE,scene,animHooks});
  installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
  let wireDirty=false;
  function refreshWire(){wireDirty=true;}
  function rebuildWire(){
    const St=wire.state;if(St.mode==='off'||!St.built){wireDirty=false;return;}
    for(const w of St.items)if(w.parent)w.parent.remove(w);
    St.items=[];St.inst=[];St.built=false;wire.set(St.mode);wireDirty=false;}
  installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));

  const hud=document.createElement('div');hud.id='timebar';document.getElementById('side').appendChild(hud);

  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);});
  const loading=document.getElementById('loading');if(loading)loading.remove();
  const hint=document.getElementById('hint');hint.classList.remove('gone');setTimeout(()=>hint.classList.add('gone'),16000);

  let last=performance.now(),hashAt=0;
  const f=new THREE.Vector3();
  (function animate(){
    requestAnimationFrame(animate);
    try{
      const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;uT.value=now/1000;
      // walking
      let fw=0,st=0;
      if(keys.has('w')||keys.has('arrowup'))fw+=1;if(keys.has('s')||keys.has('arrowdown'))fw-=1;
      if(keys.has('d'))st+=1;if(keys.has('a'))st-=1;
      if(keys.has('arrowleft'))P.yaw+=1.8*dt;if(keys.has('arrowright'))P.yaw-=1.8*dt;
      if(stick){fw-=Math.max(-1,Math.min(1,stick.dy/60));st+=Math.max(-1,Math.min(1,stick.dx/60));}
      const len=Math.hypot(fw,st);
      if(len>0.05){
        // from above, the keys go the way the screen does (W is up it, north) and the walker turns to face the way they go
        if(GOD.on){P.yaw=Math.atan2(-st,fw);}
        const sp=(keys.has('shift')?4.0:1.5)*(GOD.on?1.6:1)*dt/Math.max(1,len)*(GOD.on?len:1),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw);
        const ox=P.x,oz=P.z;
        if(GOD.on){P.x+=-sy*sp;P.z+=-cy*sp;}else{P.x+=(-sy*fw+cy*st)*sp;P.z+=(-cy*fw-sy*st)*sp;}
        W.collide(P,0.3);
        const d=Math.hypot(P.x-ox,P.z-oz);P.walked+=d;P.bob+=d*3.6;
      }
      // the floor under you: the step down into a pool is a drop, the step out is a climb
      const eye=W.floorAt(P.x,P.z)+1.6;P.y+=(eye-P.y)*Math.min(1,dt*(eye<P.y?6:9));
      const ceil=W.ceilAt(P.x,P.z);
      if(GOD.on){camera.position.set(P.x,P.y-1.6+GOD.H,P.z);camera.rotation.set(-Math.PI/2,0,0);
        marker.position.set(P.x,P.y-1.55,P.z);marker.rotation.y=P.yaw;marker.scale.setScalar(Math.max(1,GOD.H/25));}
      else{camera.position.set(P.x,Math.min(P.y+Math.sin(P.bob)*0.025,ceil-0.15),P.z);
        camera.rotation.set(P.pitch,P.yaw,0);}
      const added=W.update(P.x,P.z,6,!GOD.on||GOD.H<=60?2:GOD.H<=90?3:4);if(added)refreshWire();
      if(wireDirty&&!W.pending)rebuildWire();
      for(const fn of animHooks){try{fn(now);}catch(e){if(!fn._failed){fn._failed=true;report('update',e);}}}
      if(now-hashAt>1500){hashAt=now;writeHash();}
      const L=W.L;
      hud.textContent=`${L.name.toUpperCase()} · ${L.sub} · ${P.walked<1000?Math.round(P.walked)+' m':(P.walked/1000).toFixed(2)+' km'} wandered`;
      sound.tick(dt,P);
      renderer.render(scene,camera);
    }catch(e){report('render',e);}
  })();
  ctx.details=Object.assign(ctx.details||{},{chunks:W.live.size});
  ctx.walker=P;ctx.world=()=>W;
}

requestAnimationFrame(()=>setTimeout(()=>{build().catch(e=>{report('build',e);
  const l=document.getElementById('loading');if(l)l.remove();});},30));
