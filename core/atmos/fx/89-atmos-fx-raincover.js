// ================================================================= ATMOS — fx: the rain occlusion map (dry under canopies, roofs and overhangs)
// [web] + [G shader] (R10 of the final rebuild, HANDOFF-REBUILD.md 4a; WEATHER-RESEARCH.md item 3). A top-down depth map of
// everything over the ground in a box round the camera, re-rendered when the camera has moved ~20 m (and every o.every
// seconds while it rains, for what moves): the height of the highest thing over each point. A point more than ~1.2 m under
// that height is sheltered (so grass and low shrubs shelter nothing; a crown, a roof, an overhang do). Read by:
//   the rain streaks and the ash and snow flakes (4-weather: ATMOS.rainMat, ATMOS.flakeMats): none fall under cover
//   the wet ground of ATMOS.cloudShade (host/89-atmos-h-skyhost.js): no darkening and no wet shine under cover
//   the snow that lies (fx/89-atmos-fx-snowcover.js): fresh snow does not lie under cover (the season's base cover does)
//   core/water's WATER.wetGround and its puddles (the water workstream's): ATMOS.rainCoverGLSL() + ATMOS.rainCoverUniforms(u)
//   ATMOS.rainCover(o) -> R   o {renderer (required), size (texels, default 256), box (m, default 160), step (m, default 20),
//                             every (s while it rains, default 6), lift (m over the eye the view starts, default 400),
//                             depth (m it reaches down, default 1200), skip(object) -> true to leave an object out}
//   R.render()                re-render now (after the page moved something big); R.stats {renders, hidden}
//   GLSL (ATMOS.rainCoverGLSL(), guarded, so several hooks can include it): float atmRainOpen(vec3 worldPos) (1 open sky,
//   0 under cover: core/water's wetness, puddles and rain rings read it), float atmRainCover(vec3 worldPos) (0 open
//   .. 1 sheltered; 0 outside the box, faded at its edge), float atmRainOccY(vec2 xz) (the cover's height there)
//   uniforms (shared objects in ATMOS.U): atmRainOcc (the depth texture), atmRainOccBox (cx, cz, box, valid),
//   atmRainOccCam (top y, near, far, shelter margin)
// Left out of the map: ATMOS.root (the weather itself), water ('water:' meshes), sprites, points, lines, transparent
// materials under half opacity and anything with userData.noRainCover. Leaf cards draw as full quads (the depth pass has
// no alpha test): a crown shelters a little more than its leaves would. Opt-in by path (this subfolder); needs ATMOS.init.
// Godot: GPUParticlesCollisionHeightField3D for the rain and snow particles, and the same height texture (an orthographic
// SubViewport depth) as a global shader parameter for wetness and snow (GODOT.md, "The rain occlusion map").
(function(){const A=ATMOS;
 A.PRESETS.raincover=A.PRESETS.raincover||{margin:1.2,soft:1.0,edge:[.42,.5]};
 const f=v=>A.glf(v);
 A.rainCoverGLSL=()=>{const P=A.PRESETS.raincover;return['#ifndef ATM_RAINCOVER','#define ATM_RAINCOVER',
  'uniform sampler2D atmRainOcc;uniform vec4 atmRainOccBox;uniform vec4 atmRainOccCam;',
  'vec2 atmRainOccUV(vec2 xz){return vec2((xz.x-atmRainOccBox.x)/atmRainOccBox.z+0.5,0.5-(xz.y-atmRainOccBox.y)/atmRainOccBox.z);}',
  'float atmRainOccYuv(vec2 uv){float d=texture2D(atmRainOcc,uv).x;return atmRainOccCam.x-(atmRainOccCam.y+d*(atmRainOccCam.z-atmRainOccCam.y));}',
  'float atmRainOccY(vec2 xz){return atmRainOccYuv(atmRainOccUV(xz));}',
  'float atmRainCover(vec3 wp){if(atmRainOccBox.w<0.5)return 0.0;vec2 uv=atmRainOccUV(wp.xz);vec2 e=abs(uv-0.5);float edge=1.0-smoothstep('+f(P.edge[0])+','+f(P.edge[1])+',max(e.x,e.y));if(edge<=0.0)return 0.0;',
  ' float tx=0.75/float(textureSize(atmRainOcc,0).x);float s=0.0;',
  ' s+=smoothstep(atmRainOccCam.w,atmRainOccCam.w+'+f(P.soft)+',atmRainOccYuv(uv+vec2(tx,tx))-wp.y);s+=smoothstep(atmRainOccCam.w,atmRainOccCam.w+'+f(P.soft)+',atmRainOccYuv(uv+vec2(-tx,tx))-wp.y);',
  ' s+=smoothstep(atmRainOccCam.w,atmRainOccCam.w+'+f(P.soft)+',atmRainOccYuv(uv+vec2(tx,-tx))-wp.y);s+=smoothstep(atmRainOccCam.w,atmRainOccCam.w+'+f(P.soft)+',atmRainOccYuv(uv-vec2(tx,tx))-wp.y);',
  ' return edge*0.25*s;}','float atmRainOpen(vec3 wp){return 1.0-atmRainCover(wp);}','#endif'].join('\n');};
 A.onInit.push(()=>{const T=A.T;A.U.rainOcc=null;A.U.rainOccBox=A.U.rainOccBox||{value:new T.Vector4(0,0,160,0)};A.U.rainOccCam=A.U.rainOccCam||{value:new T.Vector4(0,.1,1200,1.2)};});
 A.rainCoverUniforms=u=>{if(!A.U.rainOcc)return u;u.atmRainOcc=A.U.rainOcc;u.atmRainOccBox=A.U.rainOccBox;u.atmRainOccCam=A.U.rainOccCam;return u;};
 // the readers in 4-weather: the streaks and the flakes fade out under cover (their vertex shaders gain atmRainCover)
 const patch=m=>{if(!m||m.userData.atmRainCover)return;m.userData.atmRainCover=true;A.rainCoverUniforms(m.uniforms);
  m.vertexShader=A.rainCoverGLSL()+'\n'+m.vertexShader.replace(/(gl_Position=(projectionMatrix\*mv|atmQuad\(mv,ps\));\s*\}\s*)$/,'vA*=1.0-atmRainCover(p);$1');m.needsUpdate=true;};
 A.rainCover=function(o){o=o||{};const T=A.T,r=o.renderer||(A.h&&A.h.renderer),P=A.PRESETS.raincover;if(!r){A.err('rainCover needs o.renderer');return null;}
  const size=o.size||256,box=o.box||160,step=o.step||20,every=o.every==null?6:o.every,lift=o.lift==null?400:o.lift,depth=o.depth==null?1200:o.depth;
  const dt=new T.DepthTexture(size,size);dt.type=T.UnsignedIntType;dt.minFilter=dt.magFilter=T.NearestFilter;
  const rt=new T.WebGLRenderTarget(size,size,{depthTexture:dt,depthBuffer:true,stencilBuffer:false});rt.texture.generateMipmaps=false;
  A.U.rainOcc={value:dt};A.U.rainOccBox.value.set(0,0,box,0);A.U.rainOccCam.value.set(0,.1,lift+depth,P.margin);
  const cam=new T.OrthographicCamera(-box/2,box/2,box/2,-box/2,.1,lift+depth);cam.up.set(0,0,-1);
  const over=new T.MeshBasicMaterial({colorWrite:false,side:T.DoubleSide});
  const R={target:rt,camera:cam,stats:{renders:0,hidden:0},cx:null,cz:null,last:-1e9};
  /* a geometry carrying a null attribute (a slot a kit cleared) cannot be uploaded: three throws on it when this view's frustum takes in an object the page's own never draws */
  const badAttr=g=>{for(const k in g.attributes)if(!g.attributes[k])return true;return false;};
  const skip=ob=>{if(ob===A.root)return true;if(ob.userData&&ob.userData.noRainCover)return true;if(ob.isSprite||ob.isPoints||ob.isLine)return true;
   if(ob.name&&ob.name.indexOf('water:')===0)return true;if(ob.isSkinnedMesh||(ob.geometry&&(ob.geometry.isInstancedBufferGeometry||!ob.geometry.attributes||!ob.geometry.attributes.position||badAttr(ob.geometry))))return true;
   const m=ob.material;if(m&&!Array.isArray(m)&&(m.isShaderMaterial||m.transparent&&m.opacity<.5))return true;return o.skip?!!o.skip(ob):false;};
  R.render=function(){const scene=A.h.scene,c=A.h.camera.position,s=step/4,cx=Math.round(c.x/s)*s,cz=Math.round(c.z/s)*s,top=c.y+lift;
   cam.position.set(cx,top,cz);cam.lookAt(cx,top-1,cz);cam.updateMatrixWorld();
   const hid=[];scene.traverse(ob=>{if(ob.visible&&skip(ob)){ob.visible=false;hid.push(ob);}});
   const ov=scene.overrideMaterial,bg=scene.background,fogS=scene.fog,prevT=r.getRenderTarget(),ac=r.autoClear,info=r.info.autoReset,calls=r.info.render.calls,tris=r.info.render.triangles;
   let ok=true;scene.overrideMaterial=over;scene.background=null;scene.fog=null;r.info.autoReset=false;
   try{r.setRenderTarget(rt);r.autoClear=true;r.clear(true,true,false);r.render(scene,cam);}
   catch(e){ok=false;R.failed=(e&&e.message)||String(e);A.err('rainCover: the depth pass failed ('+R.failed+'): the map is off');}
   finally{r.setRenderTarget(prevT);r.autoClear=ac;scene.overrideMaterial=ov;scene.background=bg;scene.fog=fogS;r.info.render.calls=calls;r.info.render.triangles=tris;r.info.autoReset=info;
    for(const ob of hid)ob.visible=true;}
   if(!ok){A.U.rainOccBox.value.w=0;return;}   /* a page whose scene the pass cannot draw keeps the rain everywhere, as before */
   A.U.rainOccBox.value.set(cx,cz,box,1);A.U.rainOccCam.value.set(top,.1,lift+depth,P.margin);R.cx=cx;R.cz=cz;R.last=A.clock.t;R.stats.renders++;R.stats.hidden=hid.length;};
  A.hook((t)=>{if(R.failed)return;const c=A.h.camera.position,W=A.W||{};const moved=R.cx==null||Math.hypot(c.x-R.cx,c.z-R.cz)>step;
   const wet=(W.rain||0)>.01||(W.snow||0)>.01||(W.ash||0)>.01;if(moved||(wet&&every>0&&t-R.last>every))R.render();});
  patch(A.rainMat);if(A.flakeMats)for(const k in A.flakeMats)patch(A.flakeMats[k]);
  A.rainCoverPatch=patch;
  A.rec('raincover',{size,box,step,every,lift,depth,margin:P.margin,note:'sheltered = the top-down depth map\'s height over the point minus the point\'s height past margin (m); re-rendered when the eye moves step m'});
  A.raincover=R;return R;};
})();
