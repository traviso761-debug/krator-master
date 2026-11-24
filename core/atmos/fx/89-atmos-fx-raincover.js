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
 /* margin: the shelter counts only cover this far over the point. 1.2 m took the floor's ferns, bushes and cane (1-2.6 m, full
    quads in the depth pass) for a roof: all the ground in the box read dry and the box showed as a rectangle of light that
    followed the camera in the rain (nhighlands, the owner's look pass, 2026-10-26). 3 m keeps crowns, roofs and ledges */
 A.PRESETS.raincover=A.PRESETS.raincover||{margin:3.0,soft:1.0,edge:[.42,.5]};
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
  m.vertexShader=A.rainCoverGLSL()+'\n'+A.KH().rep(m.vertexShader,/(gl_Position=(projectionMatrix\*mv|atmQuad\(mv,ps\));\s*\}\s*)$/,'vA*=1.0-atmRainCover(p);$1','atmos-raincover');m.needsUpdate=true;};
 A.rainCover=function(o){o=o||{};const T=A.T,r=o.renderer||(A.h&&A.h.renderer),P=A.PRESETS.raincover;if(!r){A.err('rainCover needs o.renderer');return null;}
  const size=o.size||256,box=o.box||160,step=o.step||20,every=o.every==null?6:o.every,lift=o.lift==null?400:o.lift,depth=o.depth==null?1200:o.depth;
  const dt=new T.DepthTexture(size,size);dt.type=T.UnsignedIntType;dt.minFilter=dt.magFilter=T.NearestFilter;
  const rt=new T.WebGLRenderTarget(size,size,{depthTexture:dt,depthBuffer:true,stencilBuffer:false});rt.texture.generateMipmaps=false;
  A.U.rainOcc={value:dt};A.U.rainOccBox.value.set(0,0,box,0);A.U.rainOccCam.value.set(0,.1,lift+depth,P.margin);
  const cam=new T.OrthographicCamera(-box/2,box/2,box/2,-box/2,.1,lift+depth);cam.up.set(0,0,-1);
  /* two override materials, drawn in two passes: three r128 keeps an override material's program when the next object is an
     InstancedMesh without instanceColor (its needsProgramChange does not compare instancingColor), so after one coloured
     instanced mesh the program asks for an instanceColor that is null and the pass throws (swbay's biome:beard, 2026-10-26) */
  const over=new T.MeshBasicMaterial({colorWrite:false,side:T.DoubleSide}),overC=over.clone();
  const R={target:rt,camera:cam,stats:{renders:0,hidden:0},cx:null,cz:null,last:-1e9};
  /* a geometry carrying a null attribute (a slot a kit cleared) cannot be uploaded: three throws on it when this view's frustum takes in an object the page's own never draws */
  const badAttr=g=>{for(const k in g.attributes)if(!g.attributes[k])return true;return false;};
  const skip=ob=>{if(ob===A.root)return true;if(ob.userData&&ob.userData.noRainCover)return true;if(ob.isSprite||ob.isPoints||ob.isLine)return true;
   if(ob.name&&ob.name.indexOf('water:')===0)return true;if(ob.isSkinnedMesh||(ob.geometry&&(ob.geometry.isInstancedBufferGeometry||!ob.geometry.attributes||!ob.geometry.attributes.position||badAttr(ob.geometry))))return true;
   const m=ob.material;if(m&&!Array.isArray(m)&&(m.isShaderMaterial||m.transparent&&m.opacity<.5))return true;return o.skip?!!o.skip(ob):false;};
  R.render=function(){const scene=A.h.scene,c=A.h.camera.position,s=step/4,cx=Math.round(c.x/s)*s,cz=Math.round(c.z/s)*s,top=c.y+lift;
   cam.position.set(cx,top,cz);cam.lookAt(cx,top-1,cz);cam.updateMatrixWorld();
   const hid=[],col=[],plain=[];scene.traverse(ob=>{if(!ob.visible)return;if(skip(ob)){ob.visible=false;hid.push(ob);}else if(ob.isInstancedMesh&&ob.instanceColor)col.push(ob);else if(ob.isMesh)plain.push(ob);});
   const ov=scene.overrideMaterial,bg=scene.background,fogS=scene.fog,prevT=r.getRenderTarget(),ac=r.autoClear,info=r.info.autoReset,calls=r.info.render.calls,tris=r.info.render.triangles;
   const show=(L,v)=>{for(const ob of L)ob.visible=v;};
   let ok=true;scene.overrideMaterial=over;scene.background=null;scene.fog=null;r.info.autoReset=false;
   try{r.setRenderTarget(rt);r.autoClear=false;r.clear(true,true,false);show(col,false);r.render(scene,cam);show(col,true);
    if(col.length){show(plain,false);scene.overrideMaterial=overC;r.render(scene,cam);show(plain,true);}}
   catch(e){ok=false;R.fails=(R.fails||0)+1;R.error=(e&&e.message)||String(e);R.retry=A.clock.t+2;if(R.fails>=5){R.failed=R.error;A.err('rainCover: the depth pass failed five times ('+R.failed+'): the map is off');}}
   finally{r.setRenderTarget(prevT);r.autoClear=ac;scene.overrideMaterial=ov;scene.background=bg;scene.fog=fogS;r.info.render.calls=calls;r.info.render.triangles=tris;r.info.autoReset=info;
    show(col,true);show(plain,true);for(const ob of hid)ob.visible=true;}
   if(!ok){A.U.rainOccBox.value.w=0;return;}   /* a page whose scene the pass cannot draw keeps the rain everywhere, as before */
   A.U.rainOccBox.value.set(cx,cz,box,1);A.U.rainOccCam.value.set(top,.1,lift+depth,P.margin);R.cx=cx;R.cz=cz;R.last=A.clock.t;R.stats.renders++;R.stats.hidden=hid.length;};
  /* a pass that throws (a page still filling a geometry in its first frames: swbay) is tried again 2 s on, five times */
  A.hook((t)=>{if(R.failed||(R.retry&&t<R.retry&&R.cx==null))return;const c=A.h.camera.position,W=A.W||{};const moved=R.cx==null||Math.hypot(c.x-R.cx,c.z-R.cz)>step;
   const wet=(W.rain||0)>.01||(W.snow||0)>.01||(W.ash||0)>.01;if(moved||(wet&&every>0&&t-R.last>every))R.render();});
  patch(A.rainMat);if(A.flakeMats)for(const k in A.flakeMats)patch(A.flakeMats[k]);
  A.rainCoverPatch=patch;
  A.rec('raincover',{size,box,step,every,lift,depth,margin:P.margin,note:'sheltered = the top-down depth map\'s height over the point minus the point\'s height past margin (m); re-rendered when the eye moves step m'});
  A.raincover=R;return R;};
 // SPLASHES (W5, WEATHER-RESEARCH.md item 9): one instanced set of small crowns round the camera, each living `life` s and
 // reborn elsewhere in the box (its place a hash of its slot and its cycle: stateless, no CPU loop over them), as many as
 // the rain is heavy (W.rain through A.U.rain). They land on the ground (a small height grid of the host's ground round the
 // camera, redrawn every `step` m) or, where the rain occlusion map says there is cover over it, on the cover's top (a
 // roof, a crown, a ledge), so none splash on the floor under a roof. 1 draw. ATMOS.rainSplashes(o {n}) -> the mesh
 A.PRESETS.splash=A.PRESETS.splash||{n:2400,box:40,life:.42,size:[.10,.26],grid:24,step:3,alpha:.5,color:[.84,.88,.92],fade:[14,26]};
 A.rainSplashes=function(o){o=o||{};if(A.splashMesh)return A.splashMesh;const T=A.T,P=A.PRESETS.splash,F=A.glf,N=o.n||P.n,G=P.grid,GB=P.box*1.25;
  const gd=new Float32Array(G*G*4),gt=new T.DataTexture(gd,G,G,T.RGBAFormat,T.FloatType);gt.minFilter=gt.magFilter=T.LinearFilter;gt.wrapS=gt.wrapT=T.ClampToEdgeWrapping;gt.generateMipmaps=false;
  const gBox={value:new T.Vector4(0,0,GB,0)};let gx=null,gz=null;
  A.hook(()=>{if(A.U.rain.value<.01&&gx!=null)return;const c=A.h.camera.position;if(gx!=null&&Math.abs(c.x-gx)<P.step&&Math.abs(c.z-gz)<P.step)return;
   gx=Math.round(c.x/P.step)*P.step;gz=Math.round(c.z/P.step)*P.step;
   for(let j=0;j<G;j++)for(let i=0;i<G;i++){const x=gx+((i+.5)/G-.5)*GB,z=gz+((j+.5)/G-.5)*GB;gd[(j*G+i)*4]=A.h.ground?A.h.ground(x,z):0;}
   gt.needsUpdate=true;gBox.value.set(gx,gz,GB,1);});
  const pos=[],pp=[];for(let i=0;i<N;i++){pos.push(0,0,0);pp.push(A.rnd(),(i+.5)/N,A.rnd(),A.rr(P.size[0],P.size[1]));}
  const occ=!!(A.rainCoverGLSL&&A.U&&A.U.rainOcc);   /* the occlusion map on: list and call ATMOS.rainCover first */
  const u={time:A.U.time,px:A.U.px,light:A.U.light,rain:A.U.rain,gTex:{value:gt},gBox};if(occ)A.rainCoverUniforms(u);
  const m=new T.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,fog:false,
   vertexShader:(occ?A.rainCoverGLSL()+'\n':'')+`#include <common>
    #include <logdepthbuf_pars_vertex>
    uniform float time;uniform float rain;uniform sampler2D gTex;uniform vec4 gBox;attribute vec4 pp;varying float vA;varying float vPh;
    ${A.GLSL_QUAD}
    uint atmSpH(uint x){x^=x>>16u;x*=2146121005u;x^=x>>15u;x*=2221713035u;x^=x>>16u;return x;}
    void main(){float cyc=time/${F(P.life)}+pp.x,ph=fract(cyc);uint h=atmSpH(uint(int(floor(cyc))+1048576)*747796405u+uint(pp.y*65536.0)*2891336453u);
     vec2 xz=gBox.xy+(vec2(float(h&65535u),float(h>>16u))/65535.0-0.5)*gBox.z*0.8;
     float y=texture(gTex,(xz-gBox.xy)/gBox.z+0.5).r;${occ?'if(atmRainOccBox.w>0.5){float oy=atmRainOccY(xz);if(oy>y+0.3&&oy<y+60.0)y=oy;}':''}
     vec4 mv=modelViewMatrix*vec4(xz.x,y+pp.w*0.35,xz.y,1.0);float dd=max(-mv.z,0.3);vPh=ph;
     vA=step(fract(pp.z*7.31),rain)*gBox.w*(1.0-smoothstep(${F(P.fade[0])},${F(P.fade[1])},dd))*(1.0-ph);
     gl_Position=atmQuad(mv,clamp(pp.w*(0.5+0.9*ph)*px/dd,1.0,40.0));
     #include <logdepthbuf_vertex>
    }`,
   fragmentShader:`#include <logdepthbuf_pars_fragment>
    uniform float light;varying float vA;varying float vPh;varying vec2 vUv;
    void main(){
     #include <logdepthbuf_fragment>
     if(vA<0.004)discard;vec2 q=(vUv-vec2(0.5,0.3))*vec2(2.0,5.0);float r=length(q);float ring=smoothstep(0.45,0.8,r)*smoothstep(1.05,0.85,r)*step(vUv.y,0.42);
     vec2 d1=vUv-vec2(0.36,0.32+0.4*vPh),d2=vUv-vec2(0.64,0.34+0.36*vPh);float drop=smoothstep(0.07,0.03,length(d1))+smoothstep(0.06,0.025,length(d2));
     float a=max(ring,drop*(1.0-vPh));if(a<0.02)discard;gl_FragColor=vec4(vec3(${P.color.map(F).join(',')})*(0.3+0.7*light),a*vA*${F(P.alpha)});}`});
  A.splashMesh=A.sprites('splashes',{ipos:[3,pos],pp:[4,pp]},m,5);A.stats.splashes=N;
  A.rec('splashes',{preset:'splash',n:N,note:'a crown per slot, reborn each life s at a hash of (slot, cycle) in the box round the camera, on the ground grid or the rain cover\'s top; shown as W.rain'});
  return A.splashMesh;};
})();
