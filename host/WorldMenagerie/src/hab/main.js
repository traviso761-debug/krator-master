// ---------- the habitat: entry point for hab.html ----------
// This page does not run on the shared engine, and it is the only city page that does not. The engine builds
// a plane with gravity down it: terrain, footprints extruded upwards, a sky dome over the lot. Here the
// ground is the inside of a tube, "up" is a direction that depends on where you are standing, and the sky is
// the far side of the country. Almost nothing the engine does would survive the mapping, so this page brings
// its own small renderer, its own camera and its own controls, the way Voth does, and shares the core
// modules - diagnostics, randomness, the menagerie menu - with everything else on the site.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {world} from './world.js';
import {mkRng as mkR} from '../core/rng.js';
import {createRenderer,trackResize,installContextLoss,mkBtn,runHooks,runLoop,finishLoading,boot} from '../core/shell.js';
import {readHash} from '../core/hash.js';
import {ORBIT_RATE,FAST,BIND,trackKeys,trackPointers} from '../core/input.js';
import {createCylinderWalker} from '../core/cylinder.js';

installErrorHandlers();window.LOAD=LOAD;
configureLoading({
  // What you read while it builds. See src/core/diag.js: these are shuffled and one of them is
  // shown at a time under the progress line.
  lines:[
    'A cylinder 6.4 km across and 19 km long, turning once every hundred and fourteen seconds.',
    'Up is towards the axis. The horizon curves the wrong way and there is country overhead.',
    'Three strips of land and three of window, so there is always sky on two sides.',
    'Nothing on this page runs on the shared engine: none of what it assumes about ground, gravity or sky is true here.',
    'The spin gives about one g at the hull and rather less on a hilltop.',
    'The weather is a ring. Cloud here is held against the hull by the same spin everything else is.',
    'The outside carries ring frames, longerons and radiators, because a hull this size is mostly a way of getting rid of heat.',
    'The ends are terraced domes, farmed to the hub. Nobody builds a pressure vessel with a flat end.',
    'You turn with it. From inside it is the stars and the planet that go past the windows, once every two minutes.',
    'The dock does not turn. Ships tie up to a bearing the spindle turns inside.',
  ],
  prefix:'spinning up… ',labels:{config:'reading the specification',hull:'rolling the hull',
  world:'laying the valleys',sky:'hanging the stars',ui:'opening the windows'}});

const ctx=window._iz={};
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});

// merge a pile of static meshes into one buffer per material - the same trick the engine uses, and this
// page needs it for the same reason: a town is two hundred boxes and there are twenty-seven towns
function mergeParts(meshes,mat){
  const THREE=window.THREE,pos=[],nor=[],nm=new THREE.Matrix3(),v=new THREE.Vector3(),vn=new THREE.Vector3();
  for(const m of meshes){m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;
    const p=g.attributes.position,n=g.attributes.normal;nm.getNormalMatrix(m.matrix);
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrix);pos.push(v.x,v.y,v.z);
      vn.fromBufferAttribute(n,i).applyNormalMatrix(nm).normalize();nor.push(vn.x,vn.y,vn.z);}
    if(g!==m.geometry)g.dispose();}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.computeBoundingSphere();return new THREE.Mesh(g,mat);
}

async function build(){
  if(!window.THREE){document.getElementById('loading').textContent=
    'three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
  const THREE=window.THREE;
  await stage('config');
  const C=await getJSON('data/cities/hab.json');
  const K=C.hab||{};
  document.getElementById('title').textContent=(C.name||'Habitat').toUpperCase();

  // ---- the scene ----
  await stage('hull');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,1.5,140000);
  const renderer=createRenderer(THREE,{pixelCap:1.8,clear:0x05060a});
  installContextLoss(renderer);
  // The light inside is the habitat's own (world.js): the tube, and what bounces off the far valleys. This one
  // is the star it orbits, and it only matters from outside - inside, every surface faces the tube.
  const SUN_DIR=new THREE.Vector3(-0.62,0.34,-0.71).normalize();
  const starLight=new THREE.DirectionalLight(0xfff4e4,0);starLight.position.copy(SUN_DIR);scene.add(starLight);
  const animHooks=[];

  // ---- the stars, the star and the planet, seen through the windows ----
  // None of this turns: the habitat does. From inside, standing still, you watch the planet come up past the
  // window and go over, once every two minutes, which is what living on the inside of a spun cylinder is.
  await stage('sky');
  {
    const R0=mkR(20260926);
    for(const [n,size,c] of [[3600,150,0xc9d2e2],[420,330,0xfff4e0],[90,520,0xdfe8ff]]){
      const pos=new Float32Array(n*3);
      for(let i=0;i<n;i++){const a=R0()*Math.PI*2,b=Math.acos(2*R0()-1),r=95000;
        pos[i*3]=Math.sin(b)*Math.cos(a)*r;pos[i*3+1]=Math.sin(b)*Math.sin(a)*r;pos[i*3+2]=Math.cos(b)*r;}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const st=new THREE.Points(g,new THREE.PointsMaterial({color:c,size,sizeAttenuation:true,fog:false}));st.userData.noWire=true;scene.add(st);
    }
    // the star: a disc, and the glare round it
    const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
      const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,250,235,1)');gr.addColorStop(0.12,'rgba(255,240,210,0.9)');
      gr.addColorStop(0.35,'rgba(255,220,170,0.25)');gr.addColorStop(1,'rgba(255,200,150,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);})();
    const sun=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,fog:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending}));
    sun.scale.setScalar(26000);sun.position.copy(SUN_DIR).multiplyScalar(120000);sun.userData.noWire=true;scene.add(sun);
    // the planet: oceans, land, ice at the poles and weather, lit from the star, with its air at the limb
    const planet=new THREE.Mesh(new THREE.SphereGeometry(26000,64,48),new THREE.ShaderMaterial({fog:false,
      uniforms:{uSun:{value:SUN_DIR.clone()},uT:{value:0}},
      vertexShader:'varying vec3 vN;varying vec3 vP;varying vec3 vV;void main(){vN=normalize(mat3(modelMatrix)*normal);vP=position/26000.0;vec4 w=modelMatrix*vec4(position,1.0);vV=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform vec3 uSun;uniform float uT;varying vec3 vN;varying vec3 vP;varying vec3 vV;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){return 0.5*n(p)+0.25*n(p*2.1)+0.125*n(p*4.3)+0.0625*n(p*8.7);}
void main(){float land=fb(vP*2.2+3.0);vec3 c=mix(vec3(0.05,0.16,0.34),vec3(0.08,0.26,0.44),fb(vP*6.0));
 if(land>0.53){float m=fb(vP*9.0);c=mix(vec3(0.25,0.36,0.17),vec3(0.55,0.46,0.3),smoothstep(0.45,0.7,m));}
 c=mix(c,vec3(0.92,0.95,0.98),smoothstep(0.72,0.86,abs(vP.y)));
 float cl=smoothstep(0.5,0.72,fb(vP*4.0+vec3(uT*0.01,0.0,0.0)));c=mix(c,vec3(0.95),cl*0.85);
 float d=dot(normalize(vN),uSun),lit=smoothstep(-0.08,0.25,d);
 float rim=pow(1.0-max(0.0,dot(normalize(vN),vV)),3.0);
 vec3 col=c*(0.03+0.97*lit)+vec3(0.35,0.55,1.0)*rim*(0.15+0.85*smoothstep(-0.3,0.4,d));
 col+=vec3(1.0,0.75,0.4)*0.04*(1.0-lit)*step(0.53,land)*step(0.2,n(vP*60.0));   // the cities on the night side
 gl_FragColor=vec4(col,1.0);}`}));
    planet.position.set(0.52,-0.3,0.8).normalize().multiplyScalar(118000);planet.rotation.z=0.4;planet.userData.noWire=true;scene.add(planet);
    ctx.planet=planet;
  }
  // ---- the world ----
  await stage('world');
  const api={THREE,C,ctx,scene,camera,renderer,animHooks,mergeParts};
  section('world',()=>world(api));
  const H=ctx.hab;

  // ---- the camera ----
  // Two ways of looking at the place, because it is two places. Outside: orbit the whole cylinder like any
  // other object. Inside: stand on the hull, with up pointing at the axis, and turn or walk - which is the
  // only way to understand that the country goes over your head.
  await stage('ui');
  const V={mode:'inside',u:H.L*0.5,a:H.landMid(0)+0.02,h:60,yaw:0,pitch:0.02,
           out:H.L*0.9,orbit:0.6,elev:0.32,px:0,py:0,pz:0};
  const walker=createCylinderWalker(THREE,{axis:new THREE.Vector3(1,0,0),at:(u,a)=>H.at(u,a,V.h)});
  function frame(){
    if(V.mode==='outside'){
      camera.position.set(V.px+Math.cos(V.orbit)*V.out,V.py+Math.sin(V.elev)*V.out*0.55,V.pz+Math.sin(V.orbit)*V.out);
      camera.up.set(0,1,0);camera.lookAt(V.px,V.py,V.pz);return;
    }
    // Worked out in the habitat's own frame, then turned with it: you are standing on the hull, and the hull
    // is going round. The only things that move past you are the stars, the star and the planet.
    const {pos:p,dir,up}=walker.view(V);          // the shared drum walker (src/core/cylinder.js)
    const X=new THREE.Vector3(1,0,0);
    for(const v of [p,up,dir])v.applyAxisAngle(X,H.spin);
    camera.position.copy(p);camera.up.copy(up);
    camera.lookAt(p.clone().add(dir.multiplyScalar(1000)));
  }

  // the site's controls (src/core/input.js). Outside: drag orbits the cylinder, right or Shift-drag pans, wheel
  // or pinch zooms. Inside: drag looks round (right is right), the wheel or a pinch is height over the floor,
  // WASD walks, Q and E sink and climb, Shift is five times as fast.
  const el=renderer.domElement,keys=trackKeys();
  const zoom=f=>{if(V.mode==='outside')V.out=Math.max(H.R*1.6,Math.min(160000,V.out*f));
    else V.h=Math.max(6,Math.min(H.R*0.98,V.h*f));};
  trackPointers(el,{
    drag:(dx,dy,{pan})=>{
      if(V.mode==='outside'){
        if(pan){const k=V.out*0.0012;V.px-=dx*k*Math.sin(V.orbit);V.pz+=dx*k*Math.cos(V.orbit);V.py+=dy*k;
          V.px=Math.max(-H.L*0.6,Math.min(H.L*0.6,V.px));V.py=Math.max(-H.R*2,Math.min(H.R*2,V.py));}
        else{V.orbit+=dx*ORBIT_RATE;V.elev=Math.max(-1.3,Math.min(1.3,V.elev+dy*ORBIT_RATE));}}
      else walker.look(V,dx,dy,0.004,1.3);},
    pinch:ratio=>zoom(ratio),
    wheel:dy=>zoom(Math.exp(dy*0.0012))});

  // the panels: the same furniture every other page has, built here because there is no engine to build it
  const ui=document.getElementById('ui'),viewsEl=document.getElementById('views');
  const vbtn=mkBtn('Views',ui,()=>{const o=!viewsEl.classList.contains('open');
    viewsEl.classList.toggle('open',o);vbtn.setAttribute('aria-expanded',String(o));});
  vbtn.setAttribute('aria-expanded','false');
  {const h=document.createElement('div');h.className='sub';h.textContent='Viewpoints';viewsEl.appendChild(h);}
  for(const [name,v] of Object.entries(C.views||{}))mkBtn(name,viewsEl,()=>{
    Object.assign(V,{px:0,py:0,pz:0},v);if(v.tube!==undefined)H.shift=(v.tube-(K.dayStart||0.3)+1)%1;viewsEl.classList.remove('open');vbtn.setAttribute('aria-expanded','false');});
  const mbtn=mkBtn('Outside',ui,()=>{V.mode=V.mode==='outside'?'inside':'outside';
    mbtn.textContent=V.mode==='outside'?'Inside':'Outside';});
  mbtn.title='Stand on the hull, or stand off it';
  // The tube's day is four minutes long, and nobody arriving should have to wait two of them to see the towns
  // light up. This moves the clock on by a quarter; #tube=0.75 in the address opens at that point of the day
  // (0.25 is noon, 0.75 midnight).
  const tbtn=mkBtn('Later',ui,()=>{H.shift=(H.shift+0.25)%1;});tbtn.title='Move the tube on a quarter of a day';
  const HASH=readHash();
  {const t=parseFloat(HASH.get('tube'));if(Number.isFinite(t))H.shift=(t-((K.dayStart||0.3)))%1;}
  // the same wireframe every other page has (src/core/wire.js): on a hull this size it is the only way to
  // see that the ground is a tessellation of a cylinder rather than a landscape
  const wire=createWire({THREE,scene,animHooks});
  installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
  ctx.wire=wire;
  installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));

  // #view=<name> opens at one of the viewpoints, the way #v= does on the engine pages - the camera state
  // here is (u, a, h, yaw, pitch) rather than a position and a target, so it cannot use the same hash.
  {const vn=HASH.get('view');
   if(vn!==null){const want=vn.toLowerCase();
     for(const [name,v] of Object.entries(C.views||{}))if(name.toLowerCase()===want){Object.assign(V,{px:0,py:0,pz:0},v);if(v.tube!==undefined)H.shift=(v.tube-(K.dayStart||0.3)+1)%1;}}}

  const hud=document.createElement('div');hud.id='timebar';hud.style.cssText='font:12px Georgia,serif;color:#e8c98a';
  document.getElementById('side').appendChild(hud);

  trackResize(renderer,camera);
  finishLoading({hintMs:14000});

  runLoop((now,dt)=>{
    if(V.mode==='inside'&&keys.size){
      const s=(260+V.h*1.4)*dt*(keys.has(BIND.fast)?FAST:1);
      walker.walk(V,(keys.has('w')?1:0)-(keys.has('s')?1:0),(keys.has('d')?1:0)-(keys.has('a')?1:0),s);
      if(keys.has('q'))V.h=Math.max(6,V.h-s*0.6);
      if(keys.has('e'))V.h=Math.min(H.R*0.98,V.h+s*0.6);
      V.u=Math.max(200,Math.min(H.L-200,V.u));
    }
    runHooks(animHooks,now);
    // outside, the air is behind the glass and the light is the star's
    const outside=V.mode==='outside';
    scene.fog.density=outside?0:H.fog;starLight.intensity=outside?1.1:0;
    if(outside)H.ambient.intensity=Math.max(H.ambient.intensity,0.18);   // the planet's light on the night side of the hull
    if(ctx.planet){ctx.planet.rotation.y=now*0.000004;ctx.planet.material.uniforms.uT.value=now/1000;}
    frame();
    // the hour, from the tube: it is brightest at noon and dimmest at midnight
    const hr=((H.day*24+6)%24),hh=Math.floor(hr),mm=Math.floor((hr-hh)*60);
    const clock=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    hud.textContent=(V.mode==='outside'?'outside the hull, turning once every '+(K.spin||114)+' s'
      :(Math.round(V.h)+' m over the valley floor · '+(V.u/1000).toFixed(1)+' km along'))+' · '+clock;
    renderer.render(scene,camera);
  });
  ctx.details=Object.assign(ctx.details||{},{habitat:C.name});
}

boot(build);
