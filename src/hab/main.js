// ---------- the habitat: entry point for hab.html ----------
// This page does not run on the shared engine, and it is the only city page that does not. The engine builds
// a plane with gravity down it: terrain, footprints extruded upwards, a sky dome over the lot. Here the
// ground is the inside of a tube, "up" is a direction that depends on where you are standing, and the sky is
// the far side of the country. Almost nothing the engine does would survive the mapping, so this page brings
// its own small renderer, its own camera and its own controls, the way Voth does, and shares the core
// modules - diagnostics, randomness, the menagerie menu - with everything else on the site.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {world} from './world.js';

installErrorHandlers();window.LOAD=LOAD;
configureLoading({prefix:'spinning up… ',labels:{config:'reading the specification',hull:'rolling the hull',
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
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.setSize(innerWidth,innerHeight);
  renderer.setClearColor(0x05060a);
  document.body.appendChild(renderer.domElement);
  // Inside a spun cylinder every surface faces the same lamp down the middle, so a single directional sun
  // is useless: the light here is the tube itself, and the fill is what bounces off the far valleys.
  scene.add(new THREE.AmbientLight(0xdfe4ea,0.74));
  // The sun here is a tube nineteen kilometres long, and one point light at the middle of it lights the
  // middle and leaves both ends black. Seven of them down the axis is near enough a line of light.
  const axisLights=[];
  for(let i=0;i<7;i++){
    const p=new THREE.PointLight(0xfff0cf,0.42,0,0);
    p.position.set((i/6-0.5)*(19000*0.9),0,0);scene.add(p);axisLights.push(p);
  }
  const hemi=new THREE.HemisphereLight(0xcfe0ff,0x3a3f36,0.3);scene.add(hemi);
  const animHooks=[];

  // ---- the stars, seen through the windows ----
  await stage('sky');
  {
    const n=2600,pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1),r=90000;
      pos[i*3]=Math.sin(b)*Math.cos(a)*r;pos[i*3+1]=Math.sin(b)*Math.sin(a)*r;pos[i*3+2]=Math.cos(b)*r;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xdfe6f2,size:170,sizeAttenuation:true})));
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
           out:H.L*0.9,orbit:0.6,elev:0.32};
  const tmp=new THREE.Vector3();
  function frame(){
    if(V.mode==='outside'){
      camera.position.set(Math.cos(V.orbit)*V.out,Math.sin(V.elev)*V.out*0.55,Math.sin(V.orbit)*V.out);
      camera.up.set(0,1,0);camera.lookAt(0,0,0);return;
    }
    const p=H.at(V.u,V.a,V.h);
    camera.position.copy(p);
    // up is towards the axis; the horizon is the way the hull curves
    const up=tmp.set(-p.x*0+0,-p.y,-p.z).normalize();
    camera.up.copy(up);
    const along=new THREE.Vector3(1,0,0);
    const across=new THREE.Vector3().crossVectors(up,along).normalize();
    const dir=along.clone().multiplyScalar(Math.cos(V.yaw)).add(across.multiplyScalar(Math.sin(V.yaw)))
      .add(up.clone().multiplyScalar(Math.sin(V.pitch))).normalize();
    camera.lookAt(p.clone().add(dir.multiplyScalar(1000)));
  }

  const el=renderer.domElement,keys=new Set();
  let drag=null;
  el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};});
  addEventListener('pointerup',()=>{drag=null;});
  el.addEventListener('pointermove',e=>{if(!drag)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    if(V.mode==='outside'){V.orbit-=dx*0.004;V.elev=Math.max(-1.3,Math.min(1.3,V.elev+dy*0.004));}
    else{V.yaw-=dx*0.004;V.pitch=Math.max(-1.3,Math.min(1.3,V.pitch-dy*0.003));}});
  el.addEventListener('wheel',e=>{e.preventDefault();
    if(V.mode==='outside')V.out=Math.max(H.R*1.6,Math.min(160000,V.out*Math.exp(e.deltaY*0.0012)));
    else V.h=Math.max(6,Math.min(H.R*0.98,V.h*Math.exp(e.deltaY*0.0012)));},{passive:false});
  addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.toLowerCase();if('wasdqe'.includes(k)){keys.add(k);e.preventDefault();}});
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>keys.clear());

  // the panels: the same furniture every other page has, built here because there is no engine to build it
  const ui=document.getElementById('ui'),viewsEl=document.getElementById('views');
  const mkBtn=(label,parent,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;
    b.onclick=fn;parent.appendChild(b);return b;};
  const vbtn=mkBtn('Views',ui,()=>{const o=!viewsEl.classList.contains('open');
    viewsEl.classList.toggle('open',o);vbtn.setAttribute('aria-expanded',String(o));});
  vbtn.setAttribute('aria-expanded','false');
  {const h=document.createElement('div');h.className='sub';h.textContent='Viewpoints';viewsEl.appendChild(h);}
  for(const [name,v] of Object.entries(C.views||{}))mkBtn(name,viewsEl,()=>{
    Object.assign(V,v);viewsEl.classList.remove('open');vbtn.setAttribute('aria-expanded','false');});
  const mbtn=mkBtn('Outside',ui,()=>{V.mode=V.mode==='outside'?'inside':'outside';
    mbtn.textContent=V.mode==='outside'?'Inside':'Outside';});
  mbtn.title='Stand on the hull, or stand off it';
  installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));

  // #view=<name> opens at one of the viewpoints, the way #v= does on the engine pages - the camera state
  // here is (u, a, h, yaw, pitch) rather than a position and a target, so it cannot use the same hash.
  {const m=/(^|&)view=([^&]+)/.exec(location.hash.slice(1));
   if(m){const want=decodeURIComponent(m[2]).toLowerCase();
     for(const [name,v] of Object.entries(C.views||{}))if(name.toLowerCase()===want)Object.assign(V,v);}}

  const hud=document.createElement('div');hud.id='timebar';hud.style.cssText='font:12px Georgia,serif;color:#e8c98a';
  document.getElementById('side').appendChild(hud);

  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);});

  const loading=document.getElementById('loading');if(loading)loading.remove();
  document.getElementById('hint').classList.remove('gone');
  setTimeout(()=>document.getElementById('hint').classList.add('gone'),14000);

  let last=performance.now();
  (function animate(){
    requestAnimationFrame(animate);
    try{
      const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;
      if(V.mode==='inside'&&keys.size){
        const s=(260+V.h*1.4)*dt;
        if(keys.has('w'))V.u+=Math.cos(V.yaw)*s, V.a+=Math.sin(V.yaw)*s/H.R;
        if(keys.has('s'))V.u-=Math.cos(V.yaw)*s, V.a-=Math.sin(V.yaw)*s/H.R;
        if(keys.has('a'))V.a-=Math.cos(V.yaw)*s/H.R;
        if(keys.has('d'))V.a+=Math.cos(V.yaw)*s/H.R;
        if(keys.has('q'))V.h=Math.max(6,V.h-s*0.6);
        if(keys.has('e'))V.h=Math.min(H.R*0.98,V.h+s*0.6);
        V.u=Math.max(200,Math.min(H.L-200,V.u));
      }
      for(const f of animHooks){try{f(now);}catch(e){if(!f._failed){f._failed=true;report('update',e);}}}
      frame();
      hud.textContent=V.mode==='outside'?'outside the hull'
        :(Math.round(V.h)+' m over the valley floor · '+(V.u/1000).toFixed(1)+' km along');
      renderer.render(scene,camera);
    }catch(e){report('render',e);}
  })();
  ctx.details=Object.assign(ctx.details||{},{habitat:C.name});
}

requestAnimationFrame(()=>setTimeout(()=>{build().catch(e=>{report('build',e);
  const l=document.getElementById('loading');if(l)l.remove();});},30));
