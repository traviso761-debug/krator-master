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
//     it draws as well), strength, ripple (0..1), uv (the live lookup's nudge by slope)}
// Returns M: M.set('off'|'probe'|'live'), M.update() (once a frame, before the world's pass), M.capture(), M.renderLive() (one mirror pass), M.U.
(function(){if(typeof WATER==='undefined')return;
 WATER.mirror=function(o){const T=o.THREE||window.THREE,R=o.renderer,scene=o.scene,cam=o.camera,S=o.sky,level=o.level||0,every=o.every||2,minR=o.minR==null?30:o.minR;
  const U={uMirM:{value:0},uMirK:{value:o.strength==null?1:o.strength},uMirRip:{value:o.ripple==null?.35:o.ripple},uMirUV:{value:o.uv==null?.05:o.uv},
   uMirT:{value:null},uMirRM:{value:new T.Matrix4()},uMirP:{value:null},uMirC:{value:new T.Vector3(o.center[0],level+(o.height==null?8:o.height),o.center[1])},uMirR:{value:o.radius||3000}};
  const mats=new Set(o.materials);
  const FRAG='float mirC=clamp(dot(mirN,mirV),0.0,1.0),mirF=0.02+0.98*pow(1.0-mirC,5.0);vec3 mirR;'+
   'if(uMirM>1.5){vec4 mirQ=uMirRM*vec4(vMirW,1.0);mirR=texture2D(uMirT,clamp(mirQ.xy/mirQ.w+mirN.xz*uMirUV,0.001,0.999)).rgb;}'+
   'else{vec3 mirD=reflect(-mirV,mirN);mirD.y=abs(mirD.y);vec3 mirO=vMirW-uMirC;float mirB=dot(mirO,mirD),mirE=dot(mirO,mirO)-uMirR*uMirR,mirS=-mirB+sqrt(max(mirB*mirB-mirE,0.0));vec3 mirH=mirO+mirD*mirS;mirR=textureCube(uMirP,vec3(-mirH.x,mirH.y,mirH.z)).rgb;}'+
   'gl_FragColor.rgb=mix(gl_FragColor.rgb,mirR,clamp(mirF*uMirK,0.0,0.92));';
  for(const m of mats){const prev=m.onBeforeCompile,key=m.customProgramCacheKey;
   m.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vMirW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvMirW=(inverse(viewMatrix)*mvPosition).xyz;');
    sh.fragmentShader='varying vec3 vMirW;uniform float uMirM,uMirK,uMirRip,uMirUV,uMirR;uniform sampler2D uMirT;uniform mat4 uMirRM;uniform samplerCube uMirP;uniform vec3 uMirC;\n'+
     sh.fragmentShader.replace('#include <encodings_fragment>','#include <encodings_fragment>\nif(uMirM>0.5){vec3 mirV=normalize(cameraPosition-vMirW),mirN=normalize(mix(vec3(0.0,1.0,0.0),normalize(transpose(mat3(viewMatrix))*normal),uMirRip));'+FRAG+'}');};
   m.customProgramCacheKey=function(){return (key?key.call(this):'')+'|mirror';};m.needsUpdate=true;}
  // what each tier draws, by layer: 1 the live mirror's large meshes, 3 what o.tree picks for it; 2 the probe (both of those: never the hero plants, which took a page down in six faces)
  let scanned=0;
  const scan=()=>{scene.traverse(q=>{if(q.isLight){q.layers.enable(1);q.layers.enable(2);q.layers.enable(3);return;}if(!q.isMesh||mats.has(q.material))return;
    if(q.isInstancedMesh){if(o.tree&&o.tree(q)){q.layers.enable(3);q.layers.enable(2);}return;}
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
   const old=R.getRenderTarget(),ac=R.autoClear,su=R.shadowMap.autoUpdate;R.shadowMap.autoUpdate=false;R.setRenderTarget(rt);R.autoClear=true;R.render(S.scene,scam);R.autoClear=false;R.clearDepth();R.render(scene,rcam);
   R.setRenderTarget(old);R.autoClear=ac;R.shadowMap.autoUpdate=su;return true;};
  M.capture=function(){if(!scanned)scan();const n=o.probe||512,C=U.uMirC.value;
   const crt=new T.WebGLCubeRenderTarget(n,{encoding:R.outputEncoding,generateMipmaps:false,minFilter:T.LinearFilter,magFilter:T.LinearFilter}),a=new T.CubeCamera(1,3e5,crt),b=new T.CubeCamera(1,1e6,crt);
   a.position.copy(C);a.updateMatrixWorld();b.updateMatrixWorld();a.children.forEach(c=>c.layers.set(2));
   const old=R.getRenderTarget(),ac=R.autoClear,su=R.shadowMap.autoUpdate;R.shadowMap.autoUpdate=false;
   for(let i=0;i<6;i++){R.setRenderTarget(crt,i);R.autoClear=true;R.render(S.scene,b.children[i]);R.autoClear=false;R.clearDepth();R.render(scene,a.children[i]);}
   R.setRenderTarget(old);R.autoClear=ac;R.shadowMap.autoUpdate=su;if(U.uMirP.value&&M._crt)M._crt.dispose();M._crt=crt;U.uMirP.value=crt.texture;};
  M.set=function(m){mode=m;if(m==='probe'&&!U.uMirP.value)M.capture();if(m==='live'&&!U.uMirT.value)M.renderLive();U.uMirM.value=m==='live'?2:m==='probe'?1:0;};
  M.update=function(){if(mode==='live'&&(frame++%every)===0)M.renderLive();};
  return M;};
})();
