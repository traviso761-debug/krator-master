// ================================================================= core/water/ext/58: a still's reflections of the land (prototype, 2026-10-31)
// Core water reflects only the sky (the skylight env). WATER.mirror adds what stands round a still, by two tiers, cheapest first:
//   'probe'  a cube captured once from over the water (one render of six faces at capture, one cube lookup a frame after it), parallax
//            corrected to a sphere round the capture point: the hills, the far shore and the trees, fixed in place. Re-capture when the hour moves.
//   'live'   Atitlan's mirror (the Menagerie, src/atitlan/waves.js): a camera reflected in the water's plane renders the sky and the large
//            meshes into a small target every `every` frames. An oblique near plane clips at the waterline, so no material gets a clipping
//            variant, and the target carries the page's output encoding, so the mirror compiles no new programs at all.
// Both are mixed in after tone mapping and encoding (what the targets hold), by Fresnel, capped at .92, the ripples from the water's own normal.
// Opt-in: nothing happens to a material until WATER.mirror is called for it.
// o: {THREE, renderer, scene, camera, sky (S from ATMOS.skyBiome: its .scene), materials:[...], level, center:[x,z], radius (m), height (capture, m),
//     probe (cube size), res (fraction of the screen), every, minR (m: the large meshes the live mirror draws), tree (mesh => bool: instanced meshes
//     it draws as well), strength, ripple (0..1), uv (the live lookup's nudge by slope), hour (()=>hour: re-capture when it moves hourStep, 1),
//     far (m from center: past it the live pass is skipped; the mirror keeps its last picture)}. radius is the shoreline's, not the water's far reach: too large a sphere squeezes the shore into the horizon
// 'probe' is the default tier (the owner, 2026-11-01); 'live' costs about 8% of the world pass and is kept for special lakes.
// Returns M: M.set('off'|'probe'|'live'), M.update() (once a frame, before the world's pass), M.capture(now), M.renderLive() (one mirror pass), M.U.
(function(){if(typeof WATER==='undefined')return;
 WATER.mirror=function(o){const T=o.THREE||window.THREE,R=o.renderer,scene=o.scene,cam=o.camera,S=o.sky,level=o.level||0,every=o.every||2,minR=o.minR==null?30:o.minR;
  const U={uMirM:{value:0},uMirK:{value:o.strength==null?1:o.strength},uMirRip:{value:o.ripple==null?.35:o.ripple},uMirUV:{value:o.uv==null?.05:o.uv},
   uMirT:{value:null},uMirRM:{value:new T.Matrix4()},uMirP:{value:null},uMirC:{value:new T.Vector3(o.center[0],level+(o.height==null?8:o.height),o.center[1])},uMirR:{value:o.radius||3000}};
  const mats=new Set(o.materials);
  const FRAG='float mirC=clamp(dot(mirN,mirV),0.0,1.0),mirF=0.02+0.98*pow(1.0-mirC,5.0);vec3 mirR;'+
   'if(uMirM>1.5){vec4 mirQ=uMirRM*vec4(vMirW,1.0);mirR=texture2D(uMirT,clamp(mirQ.xy/mirQ.w+mirN.xz*uMirUV,0.001,0.999)).rgb;}'+
   'else{vec3 mirD=reflect(-mirV,mirN);mirD.y=abs(mirD.y);vec3 mirO=vMirW-uMirC;float mirB=dot(mirO,mirD),mirE=dot(mirO,mirO)-uMirR*uMirR,mirS=-mirB+sqrt(max(mirB*mirB-mirE,0.0));vec3 mirH=mirO+mirD*mirS;mirR=textureCube(uMirP,vec3(-mirH.x,mirH.y,mirH.z)).rgb;}'+
   'gl_FragColor.rgb=mix(gl_FragColor.rgb,mirR,clamp(mirF*uMirK,0.0,0.92));';
  for(const m of mats){WATER.KH().add(m,'wtr-mirror',function(sh){Object.assign(sh.uniforms,U);
    WATER.vs(sh,'wtr-mirror',['#include <project_vertex>','#include <project_vertex>\nvMirW=(inverse(viewMatrix)*mvPosition).xyz;']);sh.vertexShader='varying vec3 vMirW;\n'+sh.vertexShader;
    WATER.fs(sh,'wtr-mirror',['#include <encodings_fragment>','#include <encodings_fragment>\nif(uMirM>0.5){vec3 mirV=normalize(cameraPosition-vMirW),mirN=normalize(mix(vec3(0.0,1.0,0.0),normalize(transpose(mat3(viewMatrix))*normal),uMirRip));'+FRAG+'}']);
    sh.fragmentShader='varying vec3 vMirW;uniform float uMirM,uMirK,uMirRip,uMirUV,uMirR;uniform sampler2D uMirT;uniform mat4 uMirRM;uniform samplerCube uMirP;uniform vec3 uMirC;\n'+sh.fragmentShader;},{key:'mirror'});}
  // what each tier draws, by layer: 1 the live mirror's large meshes, 3 what o.tree picks for it; 2 the probe (both of those: never the hero plants, which took a page down in six faces)
  // the trees: the page's runtime LOD shows the stand-ins by the main camera (none near it) and the heroes are never drawn here, so a tree by the
  // camera's own shore would have no reflection. A mirror pass shows every stand-in, and BIO's fade uniforms open their range for the pass.
  let scanned=0;const stand=new Set(),LU=typeof BIO!=='undefined'?BIO._lodU:null;
  const pass=fn=>{const vis=[];stand.forEach(m=>{vis.push(m.visible);m.visible=true;});const ls=LU?LU.s.value:1,lf=LU?LU.f.value:0;if(LU){LU.s.value=1e-4;LU.f.value=0;}
   try{fn();}finally{if(LU){LU.s.value=ls;LU.f.value=lf;}let i=0;stand.forEach(m=>{m.visible=vis[i++];});}};
  const scan=()=>{scene.traverse(q=>{if(q.isLight){q.layers.enable(1);q.layers.enable(2);q.layers.enable(3);return;}if(!q.isMesh||mats.has(q.material))return;
    if(q.isInstancedMesh){if(o.tree&&o.tree(q)){q.layers.enable(3);q.layers.enable(2);stand.add(q);}return;}
    if(!q.geometry.boundingSphere)q.geometry.computeBoundingSphere();const s=q.geometry.boundingSphere;if(s&&s.radius*Math.max(q.scale.x,q.scale.y,q.scale.z)>minR){q.layers.enable(1);q.layers.enable(2);}});scanned=1;};
  const sz=new T.Vector2(),rcam=new T.PerspectiveCamera(),scam=new T.PerspectiveCamera(),fwd=new T.Vector3(),up=new T.Vector3(),tgt=new T.Vector3(),pl=new T.Plane(),q=new T.Vector4(),cp=new T.Vector4(),
   TM=new T.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
  rcam.layers.set(1);if(o.tree)rcam.layers.enable(3);let rt=null,frame=0,mode='off';
  const M={U};
  M.trees=on=>{if(on)rcam.layers.enable(3);else rcam.layers.disable(3);};
  M.res=f=>{o.res=f;};
  M.renderLive=function(){if(!scanned)scan();R.getDrawingBufferSize(sz);const f=o.res==null?.35:o.res,w=Math.max(64,Math.round(sz.x*f)),h=Math.max(64,Math.round(sz.y*f));
   if(!rt||rt.width!==w||rt.height!==h){if(rt)rt.dispose();rt=new T.WebGLRenderTarget(w,h,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,encoding:R.outputEncoding});U.uMirT.value=rt.texture;}
   cam.updateMatrixWorld();const p=cam.position;if(p.y<level+.3)return false;
   cam.getWorldDirection(fwd);up.set(0,1,0).applyQuaternion(cam.quaternion);rcam.position.set(p.x,2*level-p.y,p.z);tgt.copy(p).add(fwd);tgt.y=2*level-tgt.y;rcam.up.set(up.x,-up.y,up.z);rcam.lookAt(tgt);
   rcam.fov=cam.fov;rcam.aspect=cam.aspect;rcam.near=cam.near;rcam.far=cam.far;rcam.updateProjectionMatrix();rcam.updateMatrixWorld();
   U.uMirRM.value.copy(TM).multiply(rcam.projectionMatrix).multiply(rcam.matrixWorldInverse);
   scam.quaternion.copy(rcam.quaternion);scam.fov=rcam.fov;scam.aspect=rcam.aspect;scam.near=1;scam.far=1e6;scam.updateProjectionMatrix();scam.updateMatrixWorld();
   // the oblique near plane (Lengyel): the waterline clips the mirror's depth range, in the projection alone
   pl.normal.set(0,1,0);pl.constant=-level;pl.applyMatrix4(rcam.matrixWorldInverse);cp.set(pl.normal.x,pl.normal.y,pl.normal.z,pl.constant);const P=rcam.projectionMatrix.elements;
   q.x=(Math.sign(cp.x)+P[8])/P[0];q.y=(Math.sign(cp.y)+P[9])/P[5];q.z=-1;q.w=(1+P[10])/P[14];cp.multiplyScalar(2/cp.dot(q));P[2]=cp.x;P[6]=cp.y;P[10]=cp.z+1;P[14]=cp.w;
   const old=R.getRenderTarget(),ac=R.autoClear,su=R.shadowMap.autoUpdate;R.shadowMap.autoUpdate=false;R.setRenderTarget(rt);R.autoClear=true;R.render(S.scene,scam);R.autoClear=false;R.clearDepth();pass(()=>R.render(scene,rcam));
   R.setRenderTarget(old);R.autoClear=ac;R.shadowMap.autoUpdate=su;return true;};
  // the capture: one face a frame, into a second cube, swapped in when all six are drawn, so it never stalls a frame. M.capture(true): all at once
  let job=null,hourAt=null;
  const face=j=>{const old=R.getRenderTarget(),ac=R.autoClear,su=R.shadowMap.autoUpdate;R.shadowMap.autoUpdate=false;R.setRenderTarget(j.crt,j.i);R.autoClear=true;R.render(S.scene,j.b.children[j.i]);R.autoClear=false;R.clearDepth();pass(()=>R.render(scene,j.a.children[j.i]));
   R.setRenderTarget(old);R.autoClear=ac;R.shadowMap.autoUpdate=su;j.i++;if(j.i<6)return;if(M._crt)M._crt.dispose();M._crt=j.crt;U.uMirP.value=j.crt.texture;job=null;if(mode==='probe')U.uMirM.value=1;};
  M.capture=function(now){scan();if(job)return;const n=o.probe||512,C=U.uMirC.value,crt=new T.WebGLCubeRenderTarget(n,{encoding:R.outputEncoding,generateMipmaps:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter}),a=new T.CubeCamera(1,3e5,crt),b=new T.CubeCamera(1,1e6,crt);
   a.position.copy(C);a.updateMatrixWorld();b.updateMatrixWorld();a.children.forEach(c=>c.layers.set(2));job={crt,a,b,i:0};if(o.hour)hourAt=o.hour();if(now)while(job)face(job);};
  M.set=function(m){mode=m;if(m==='probe'&&!U.uMirP.value&&!job)M.capture();if(m==='live'&&!U.uMirT.value)M.renderLive();U.uMirM.value=m==='live'?2:m==='probe'&&U.uMirP.value?1:0;};
  M.update=function(){if(job){face(job);return;}if(mode==='probe'&&o.hour&&hourAt!=null&&Math.abs(o.hour()-hourAt)>(o.hourStep||1))M.capture();if(mode==='live'&&(frame++%every)===0&&(o.far==null||Math.hypot(cam.position.x-o.center[0],cam.position.z-o.center[1])<o.far))M.renderLive();};
  return M;};
 // the scaffolding (the owner, 2026-11-01: every biome can turn it on, off at page load so the tri counts don't rise). Takes WATER.mirror's o plus ui
 // (the panel to add a button to; default KHOST.ui). Nothing is built, patched or captured until the first turn-on: the button cycles off, probe, live; ?mirror=probe or live asks at load.
 // Returns Sw: Sw.set('off'|'probe'|'live'), Sw.update() (once a frame, from the page's draw), Sw.mode(), Sw.M() (the mirror, null until first used).
 WATER.mirrorSwitch=function(o){let M=null,mode='off';const ORDER=['off','probe','live'],ui=o.ui||(typeof KHOST!=='undefined'?KHOST.ui:null);let btn=null;
  const label=()=>{if(btn)btn.textContent='reflections: '+mode;};
  const Sw={mode:()=>mode,M:()=>M,update(){if(M)M.update();},
   set(m){if(ORDER.indexOf(m)<0)return;if(m!=='off'&&!M)M=WATER.mirror(o);mode=m;if(M)M.set(m);label();}};
  if(ui&&typeof document!=='undefined'){btn=document.createElement('button');btn.id='water-mirror-btn';btn.title='reflections of the land in the largest still: costs tris and draw calls when on';btn.onclick=()=>Sw.set(ORDER[(ORDER.indexOf(mode)+1)%3]);label();ui.appendChild(btn);}
  const q=typeof location!=='undefined'?/[?&]mirror=(probe|live)/.exec(location.search):null;if(q)setTimeout(()=>Sw.set(q[1]),o.delay==null?4000:o.delay);
  return Sw;};
})();
