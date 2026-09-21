// ---------- the page three ships share ----------
// None of these run on the shared engine, for the same reason the habitat does not: the engine builds a
// plane with gravity down it and a sky dome over the lot, and out here there is no ground, no down, and the
// sky is the whole sphere. So this is a small renderer of its own - a turntable camera round one object, a
// star field, a backdrop of planets and nebulae read out of the city file, and the same panels, wireframe
// and menagerie menu every other page on the site has.
//
// Everything that is specific to a ship is in its own module and arrives here as `model(api)`. This file
// knows nothing about saucers.
//
// Fan work. Star Trek belongs to Paramount; nothing from any film, series or game is used.
import {report,LOAD,configureLoading,installErrorHandlers,stage,section} from '../core/diag.js';
import {installMenagerie} from '../core/menagerie.js';
import {createWire,installWireUI} from '../core/wire.js';
import {mergeParts,fold,hullPalette} from './parts.js';

const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+': HTTP '+r.status);return r.json();});

// ---------- the sky ----------
// A star field, and whatever the city file says is out there. Both are drawn a long way off and neither is
// ever occluded by anything, so they go on their own layer of distance rather than into the depth buffer's
// argument: the ship is metres across and the planet is thousands of kilometres away, and a single depth
// range cannot hold both without the near clip eating the hull.
function buildSky(THREE,scene,K,rnd){
  const D=K.far||900000;
  const out={bodies:[]};
  // ---- stars ----
  {
    const n=K.stars||3200;
    const pos=new Float32Array(n*3),col=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      const u=rnd()*2-1,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);
      pos[i*3]=s*Math.cos(th)*D;pos[i*3+1]=u*D;pos[i*3+2]=s*Math.sin(th)*D;
      // a band of extra brightness round the galactic plane, and a little colour in the brightest of them
      const band=1+0.7*Math.exp(-Math.pow(u/0.14,2));
      const b=Math.min(1,(0.3+0.7*Math.pow(rnd(),2.4))*band);
      const warm=rnd()<0.18,cool=rnd()<0.14;
      col[i*3]=b*(warm?1:cool?0.78:0.9);col[i*3+1]=b*0.9;col[i*3+2]=b*(cool?1:warm?0.74:0.92);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({size:K.starSize||1500,vertexColors:true,
      sizeAttenuation:true,transparent:true,opacity:0.95,depthWrite:false,fog:false}));
    p.userData.noWire=true;p.frustumCulled=false;scene.add(p);
  }
  // ---- nebulae ----
  // Shells of very faint additive cloud. A nebula is not an object with an edge, so it is built as a lot of
  // overlapping puffs at slightly different distances and left to accumulate.
  for(const nb of (K.nebulae||[])){
    const g=new THREE.Group();
    const m=new THREE.MeshBasicMaterial({color:new THREE.Color(nb.colour||'#4a2a6e'),transparent:true,
      opacity:nb.opacity||0.055,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    const R=nb.size||D*0.35;
    for(let i=0;i<(nb.puffs||26);i++){
      const s=new THREE.Mesh(new THREE.SphereGeometry(R*(0.3+rnd()*0.8),10,7),m);
      s.position.set((rnd()-0.5)*R*2.4,(rnd()-0.5)*R*1.1,(rnd()-0.5)*R*2.4);
      s.scale.set(1,0.45+rnd()*0.4,1);g.add(s);
    }
    const a=nb.az===undefined?2.2:nb.az,e=nb.el===undefined?0.2:nb.el,d=(nb.dist||0.86)*D;
    g.position.set(Math.cos(a)*Math.cos(e)*d,Math.sin(e)*d,Math.sin(a)*Math.cos(e)*d);
    g.userData.noWire=true;g.frustumCulled=false;scene.add(g);
  }
  // ---- worlds ----
  // Vertex colours on a sphere, because there are no textures anywhere in this project. A gas giant is
  // bands; a terrestrial world is ocean with continents thrown on it, ice at the poles and a separate layer
  // of cloud, which is most of what makes a planet look like one rather than like a marble.
  for(const b of (K.bodies||[])){
    const a=b.az||0,e=b.el||0,dist=(b.dist||0.6)*D;
    const R=Math.tan((b.deg||6)*Math.PI/180)*dist;
    const g=new THREE.Group();
    const geo=new THREE.SphereGeometry(R,b.seg||56,Math.round((b.seg||56)*0.6));
    const pos=geo.attributes.position,cols=[];
    const c=new THREE.Color(),t2=new THREE.Color();
    const pal=(b.colours||['#2a5f8c','#2f6a44','#8a7a52','#e8eef2']).map(h=>new THREE.Color(h));
    const seedA=rnd()*9,seedB=rnd()*9,seedC=rnd()*9;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i)/R,y=pos.getY(i)/R,z=pos.getZ(i)/R;
      if(b.kind==='gas'){
        // bands, with a little turbulence where they shear against each other
        const f=(y*0.5+0.5);
        const band=Math.floor(f*(b.bands||9)+0.35*Math.sin(y*22+x*3+seedA));
        c.copy(pal[((band%pal.length)+pal.length)%pal.length]);
        c.multiplyScalar(0.92+0.08*Math.sin(y*47+seedB));
      }else{
        // continents: three overlapping waves, thresholded. It is crude and from a hundred thousand
        // kilometres it is indistinguishable from anything better.
        const n=Math.sin(x*3.1+seedA)*Math.cos(z*2.7+seedB)+0.6*Math.sin(y*4.3+seedC)
               +0.45*Math.sin((x+z)*6.1+seedA*2)+0.3*Math.cos((y-x)*8.3+seedB*2);
        const ice=Math.abs(y)>(b.ice===undefined?0.82:b.ice);
        if(ice)c.copy(pal[3]||pal[0]);
        else if(n>0.35)c.copy(pal[2]||pal[1]).lerp(pal[1],Math.min(1,(n-0.35)*1.6));
        else c.copy(pal[0]).multiplyScalar(0.86+0.2*Math.max(0,n));
      }
      cols.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
    const world=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,fog:false}));
    g.add(world);
    if(b.clouds){
      // Patches lying on the surface, not lumps standing on it. A sphere - however flattened - gets its own
      // light and dark side and reads as a boulder; a disc has one normal, shades evenly, and darkens on
      // the night side along with the ground under it, which is what a cloud does.
      const cm=new THREE.MeshLambertMaterial({color:0xf4f8fa,transparent:true,opacity:0.66,fog:false});
      for(let i=0;i<(b.cloudPuffs||420);i++){
        const u=(rnd()*2-1)*0.97,th=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);
        const p=new THREE.Mesh(new THREE.CircleGeometry(R*(0.02+rnd()*0.055),7),cm);
        p.position.set(s*Math.cos(th)*R*1.006,u*R*1.006,s*Math.sin(th)*R*1.006);
        p.lookAt(p.position.clone().multiplyScalar(2));
        p.rotation.z=rnd()*6.28;p.scale.set(1+rnd()*0.9,0.4+rnd()*0.7,1);
        g.add(p);
      }
    }
    if(b.ring){
      const rm=new THREE.MeshLambertMaterial({color:new THREE.Color(b.ring.colour||'#b4a88c'),
        transparent:true,opacity:b.ring.opacity||0.55,side:THREE.DoubleSide,fog:false});
      for(let i=0;i<(b.ring.bands||5);i++){
        const r0=R*(b.ring.inner||1.4)+i*R*0.09;
        const rg=new THREE.Mesh(new THREE.RingGeometry(r0,r0+R*0.07,72),rm);
        rg.rotation.x=Math.PI/2;g.add(rg);
      }
      g.rotation.z=b.ring.tilt===undefined?0.38:b.ring.tilt;
    }
    g.position.set(Math.cos(a)*Math.cos(e)*dist,Math.sin(e)*dist,Math.sin(a)*Math.cos(e)*dist);
    g.rotation.y=b.spin||0;
    g.traverse(o=>{o.userData.noWire=true;o.frustumCulled=false;});
    scene.add(g);
    out.bodies.push({g,b});
  }
  return out;
}

export async function starshipPage(opts){
  installErrorHandlers();window.LOAD=LOAD;
  configureLoading({prefix:opts.prefix||'loading… ',labels:opts.labels||{},lines:opts.lines||[]});
  const ctx=window._iz={};
  requestAnimationFrame(()=>setTimeout(()=>{run().catch(e=>{report('build',e);
    const l=document.getElementById('loading');if(l)l.remove();});},30));

  async function run(){
    if(!window.THREE){document.getElementById('loading').textContent=
      'three.js did not load (vendor/three/three.min.js). Check the site mounts and reload.';return;}
    const THREE=window.THREE;
    await stage('config');
    const C=await getJSON('data/cities/'+opts.city+'.json');
    document.getElementById('title').textContent=(C.name||opts.city).toUpperCase();
    if(C.attribution){const at=document.createElement('div');at.id='attribution';
      at.textContent=C.attribution;document.body.appendChild(at);}

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.6,2400000);
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
    renderer.setSize(innerWidth,innerHeight);
    renderer.setClearColor(0x020306);
    document.body.appendChild(renderer.domElement);
    const animHooks=[];

    // ---- light ----
    // One star, hard, from a fixed direction, and almost nothing to fill it: space has no sky to bounce
    // light off, so the shadowed side of a hull is nearly black and that is correct. A little ambient keeps
    // the panelling from disappearing entirely, and a dim fill from the planet's direction stands in for
    // the light a world that size actually throws back at you.
    const SL=C.space&&C.space.starLight||{};
    const key=new THREE.DirectionalLight(new THREE.Color(SL.colour||'#fff4e2'),SL.intensity===undefined?2.0:SL.intensity);
    {const a=SL.az===undefined?-0.8:SL.az,e=SL.el===undefined?0.45:SL.el;
     key.position.set(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).multiplyScalar(10000);}
    scene.add(key);
    scene.add(new THREE.AmbientLight(0x2a3340,SL.ambient===undefined?0.5:SL.ambient));
    {const FL=C.space&&C.space.fill||{};
     const fill=new THREE.DirectionalLight(new THREE.Color(FL.colour||'#5a7fa8'),FL.intensity===undefined?0.5:FL.intensity);
     const a=FL.az===undefined?2.2:FL.az,e=FL.el===undefined?-0.5:FL.el;
     fill.position.set(Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)).multiplyScalar(10000);
     scene.add(fill);}

    await stage('sky');
    let sky=null;
    section('sky',()=>{
      let s=(C.space&&C.space.seed)||12345;
      const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
      sky=buildSky(THREE,scene,C.space||{},rnd);
    });

    // ---- the ship ----
    await stage('hull');
    const api={THREE,C,ctx,scene,camera,renderer,animHooks,mergeParts:(m,mat)=>mergeParts(THREE,m,mat),
               fold:(g,p)=>fold(THREE,g,p),palette:o=>hullPalette(THREE,o)};
    let SHIP={radius:400};
    section('hull',()=>{SHIP=opts.model(api)||SHIP;});

    // ---- the fingerprint ----
    // Every other page on this site is checked by the test suite against a golden: build it, and the layout
    // has to come out the same. A ship has no lots to count, so what is recorded instead is the model
    // itself - every merged mesh, where its bounding sphere is, how big it is and how many vertices are in
    // it. Nudge a station in the table of cross-sections and the hash moves, which is the whole point.
    section('fingerprint',()=>{
      const rows=[];
      scene.traverse(o=>{
        if(!o.isMesh||!o.geometry||!o.geometry.attributes.position)return;
        if(o.userData.isWire||o.userData.noWire)return;
        const g=o.geometry;
        if(!g.boundingSphere)g.computeBoundingSphere();
        const b=g.boundingSphere;
        o.updateWorldMatrix(true,false);
        const c=b.center.clone().applyMatrix4(o.matrixWorld);
        rows.push({x:c.x,z:c.z,w:b.radius,dpt:g.attributes.position.count,h:c.y,ry:0,
                   kind:o.material&&o.material.color?o.material.color.getHexString():'?',fixed:false});
      });
      rows.sort((p,q)=>p.x-q.x||p.h-q.h||p.z-q.z||p.dpt-q.dpt);
      ctx.lotList=rows;
    });

    // ---- the camera: a turntable round one object ----
    await stage('ui');
    const V={az:C.view0&&C.view0.az!==undefined?C.view0.az:0.9,
             el:C.view0&&C.view0.el!==undefined?C.view0.el:0.24,
             d:C.view0&&C.view0.d!==undefined?C.view0.d:SHIP.radius*3.4,
             tx:0,ty:0,tz:0,roll:0};
    const target=new THREE.Vector3();
    function frame(){
      target.set(V.tx,V.ty,V.tz);
      camera.position.set(target.x+Math.cos(V.az)*Math.cos(V.el)*V.d,
                          target.y+Math.sin(V.el)*V.d,
                          target.z+Math.sin(V.az)*Math.cos(V.el)*V.d);
      camera.up.set(Math.sin(V.roll),Math.cos(V.roll),0);
      camera.lookAt(target);
    }

    const el=renderer.domElement;
    let drag=null;
    el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);
      drag={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};});
    el.addEventListener('contextmenu',e=>e.preventDefault());
    addEventListener('pointerup',()=>{drag=null;});
    addEventListener('pointercancel',()=>{drag=null;});
    el.addEventListener('lostpointercapture',()=>{drag=null;});
    addEventListener('blur',()=>{drag=null;});
    document.addEventListener('visibilitychange',()=>{drag=null;});
    el.addEventListener('pointermove',e=>{
      if(drag&&e.buttons===0&&e.pointerType!=='touch'){drag=null;return;}
      if(!drag)return;
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
      if(drag.pan){
        const s=V.d*0.0013;
        const right=new THREE.Vector3().subVectors(camera.position,target).cross(camera.up).normalize();
        const up=camera.up.clone();
        V.tx-=right.x*dx*s+up.x*-dy*s;V.ty-=right.y*dx*s+up.y*-dy*s;V.tz-=right.z*dx*s+up.z*-dy*s;
      }else{
        V.az-=dx*0.005;V.el=Math.max(-1.45,Math.min(1.45,V.el+dy*0.004));
      }});
    el.addEventListener('wheel',e=>{e.preventDefault();
      V.d=Math.max(SHIP.radius*0.35,Math.min(SHIP.radius*160,V.d*Math.exp(e.deltaY*0.0011)));},{passive:false});
    // pinch, for the pages people actually look at these on
    {let pinch=null;const pts=new Map();
     el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pts.set(e.pointerId,e);});
     el.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!pts.has(e.pointerId))return;
       pts.set(e.pointerId,e);
       if(pts.size===2){const [a,b]=[...pts.values()];
         const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
         if(pinch)V.d=Math.max(SHIP.radius*0.35,Math.min(SHIP.radius*160,V.d*pinch/d));
         pinch=d;drag=null;}});
     const drop=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;};
     addEventListener('pointerup',drop);addEventListener('pointercancel',drop);}

    // ---- the panels ----
    const ui=document.getElementById('ui'),viewsEl=document.getElementById('views');
    const mkBtn=(label,parent,fn)=>{const b=document.createElement('button');b.type='button';
      b.textContent=label;b.onclick=fn;parent.appendChild(b);return b;};
    const vbtn=mkBtn('Views',ui,()=>{const o=!viewsEl.classList.contains('open');
      viewsEl.classList.toggle('open',o);vbtn.setAttribute('aria-expanded',String(o));});
    vbtn.setAttribute('aria-expanded','false');
    {const h=document.createElement('div');h.className='sub';h.textContent='Viewpoints';viewsEl.appendChild(h);}
    const goto=v=>{Object.assign(V,{tx:0,ty:0,tz:0,roll:0},v);};
    for(const [name,v] of Object.entries(C.views||{}))mkBtn(name,viewsEl,()=>{
      goto(v);viewsEl.classList.remove('open');vbtn.setAttribute('aria-expanded','false');});
    if(SHIP.buttons)for(const [label,fn] of Object.entries(SHIP.buttons))mkBtn(label,ui,fn);
    const wire=createWire({THREE,scene,animHooks});
    installWireUI({ui,mkBtn,wire,hash:location.hash.slice(1)});
    ctx.wire=wire;
    installMenagerie({ui,mkBtn}).catch(e=>report('menagerie',e));

    // #view=<name> opens at one of them, and #v=az,el,d is what the camera writes back
    {const h=location.hash.slice(1);
     const m=/(^|&)view=([^&]+)/.exec(h);
     if(m){const want=decodeURIComponent(m[2]).toLowerCase();
       for(const [name,v] of Object.entries(C.views||{}))if(name.toLowerCase()===want)goto(v);}
     const q=/(^|&)v=([-\d.,]+)/.exec(h);
     if(q){const n=q[2].split(',').map(Number);
       if(n.length>=3&&n.every(Number.isFinite)){V.az=n[0];V.el=n[1];V.d=n[2];
         if(n.length>=6){V.tx=n[3];V.ty=n[4];V.tz=n[5];}}}}
    {let t=0;setInterval(()=>{const now=Date.now();if(now-t<1400)return;t=now;
      const r=x=>Math.round(x*1000)/1000;
      try{history.replaceState(null,'','#v='+[r(V.az),r(V.el),Math.round(V.d)].join(','));}catch(e){}},1500);}

    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      renderer.setSize(innerWidth,innerHeight);});

    const hud=document.createElement('div');hud.id='timebar';
    hud.style.cssText='font:12px Georgia,serif;color:#9fc4e0';
    const side=document.getElementById('side');if(side)side.appendChild(hud);

    const loading=document.getElementById('loading');if(loading)loading.remove();
    const hint=document.getElementById('hint');
    if(hint){hint.classList.remove('gone');setTimeout(()=>hint.classList.add('gone'),14000);}

    (function animate(){
      requestAnimationFrame(animate);
      try{
        const now=performance.now();
        for(const f of animHooks){try{f(now);}catch(e){if(!f._failed){f._failed=true;report('update',e);}}}
        if(sky)for(const q of sky.bodies)if(q.b.rate)q.g.rotation.y+=q.b.rate;
        frame();
        hud.textContent=(V.d>=1000?(V.d/1000).toFixed(1)+' km':Math.round(V.d)+' m')+' off';
        renderer.render(scene,camera);
      }catch(e){report('render',e);}
    })();
    ctx.details=Object.assign(ctx.details||{},{ship:C.name});
  }
}
