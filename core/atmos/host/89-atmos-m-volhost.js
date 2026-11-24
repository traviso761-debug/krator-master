// ================================================================= ATMOS — the volumetric clouds on a three.js page (W6, the host side)
// [web] With sky/89-atmos-m-volclouds.js listed (after the sky), every ATMOS.sky gets the volumes: S.render becomes
//   the mask, the march and the resolve into their targets; the sky (its flat cumulus stepped aside: uVolOn); the world;
//   the composite over it, writing the clouds' depth (sky/89-atmos-m-volclouds.js says what each pass is)
// A page that draws its sky with S.renderSky() and its world itself (its own post pass) keeps the flat layer: the volumes
// draw only through S.render.
//   THE TIER: preset.clouds.quality ('off' | 'layers' | 'volumes'; default 'volumes' on a page that lists the volumes), or
//   ?clouds=<tier> in the URL (the owner's before-and-after pairs: ?clouds=layers is the sky as it was). preset.clouds.volumes
//   overrides PRESETS.volclouds (res, steps, lightSteps, thin, thick, density, ...).
//   THE BUDGET: with EXT_disjoint_timer_query_webgl2 the cloud passes are timed every 8th frame; when the median of the last
//   24 timings is over PRESETS.volclouds.budget ms (SKY-PLAN.md section 10: 1 ms on the Arc 140T) the page steps down: the
//   march's resolution (2 -> 3 -> 4), then its steps (56 -> 40 -> 28), then the flat layers. o.autoTier false (or ?cloudauto=0)
//   holds the tier. V.log says each step taken.
//   ATMOS.volClouds(S, o) -> V   (called by ATMOS.sky; o: {tier, autoTier}); V.tier, V.setTier(t), V.cfg, V.ms (the last
//   median GPU ms of the cloud passes), V.compileMs (the four programs' compile and link, measured on the first frame), V.log
(function(){const A=ATMOS;
 const sky0=A.sky;
 A.sky=function(P,o){const S=sky0.apply(this,arguments);if(A.volOn)A.volClouds(S,Object.assign({},o&&o.volumes||{}));return S;};
 A.volClouds=function(S,o){o=o||{};const T=A.T,r=S.renderer||A.h&&A.h.renderer,U=S.uniforms,P=S.preset,G=A.volGLSL;
  const rr=r||(A.h&&A.h.renderer);if(!rr){A.err('volClouds needs the renderer');return null;}
  const gl=rr.getContext(),isGL2=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
  const floatOK=isGL2&&!!gl.getExtension('EXT_color_buffer_float');
  let q=null,qa=null;try{const u=new URLSearchParams(location.search);q=u.get('clouds');qa=u.get('cloudauto');}catch(e){q=null;}
  const cfg=Object.assign({},A.PRESETS.volclouds,P.clouds&&P.clouds.volumes||{});
  const V={tier:A.volTiers.indexOf(q)>=0?q:(P.clouds&&P.clouds.quality)||o.tier||'volumes',cfg,ms:null,compileMs:null,log:[],frame:0,
   auto:qa==='0'?false:o.autoTier!==false};
  if(!floatOK&&V.tier==='volumes'){V.tier='layers';V.log.push('no float render targets (WebGL2 + EXT_color_buffer_float): layers');}
  // the targets: the mask; the march; two history targets, ping-ponged
  const mk=(w,h,type,filter)=>{const t=new T.WebGLRenderTarget(w,h,{type,format:T.RGBAFormat,minFilter:filter,magFilter:filter,depthBuffer:false,stencilBuffer:false});t.texture.generateMipmaps=false;return t;};
  const maskRT=mk(cfg.maskN,cfg.maskN,T.UnsignedByteType,T.LinearFilter);maskRT.texture.wrapS=maskRT.texture.wrapT=T.ClampToEdgeWrapping;
  let cur=null,hA=null,hB=null,W=0,H=0,res=0;
  const size=()=>{const v=new T.Vector2();rr.getDrawingBufferSize(v);const w=Math.max(1,Math.ceil(v.x/cfg.res)),h=Math.max(1,Math.ceil(v.y/cfg.res));
   if(w===W&&h===H&&res===cfg.res&&cur)return false;W=w;H=h;res=cfg.res;[cur,hA,hB].forEach(t=>t&&t.dispose());
   cur=mk(W,H,T.FloatType,T.NearestFilter);hA=mk(W,H,T.FloatType,T.NearestFilter);hB=mk(W,H,T.FloatType,T.NearestFilter);return true;};
  // the detail volume, baked once a page
  if(!A.skyDetailTex){const n=32,t=new T.DataTexture3D(A.skyDetailVolume(n),n,n,n);t.format=T.RGBAFormat;t.type=T.UnsignedByteType;
   t.wrapS=t.wrapT=t.wrapR=T.RepeatWrapping;t.minFilter=t.magFilter=T.LinearFilter;t.generateMipmaps=false;t.unpackAlignment=1;t.needsUpdate=true;A.skyDetailTex=t;}
  const V4=()=>({value:new T.Vector4()}),M4=()=>({value:new T.Matrix4()});
  const L={uMaskBox:V4(),uVolT:V4(),uVolS:V4(),uVolP:V4(),uBolt:V4(),uInvProj:M4(),uCamRot:M4(),uPrevVP:M4(),uVP:M4(),uBlend:{value:cfg.blend},uHistOk:{value:0},
   uDetail:{value:A.skyDetailTex},uMask:{value:maskRT.texture},uCur:{value:null},uHist:{value:null},uVol:{value:null},uLogFC:{value:0},uVolC:V4(),
   uFlash:A.U.flash,uFlashC:{value:new T.Color(.82,.86,1)}};
  const share=(names)=>{const u={};for(const k of names)u[k]=U[k]||L[k];return u;};
  const quad=new T.PlaneGeometry(2,2),ocam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  const pass=(name,frag,names,extra)=>{const m=new T.ShaderMaterial(Object.assign({uniforms:share(names),vertexShader:G.vertex(),fragmentShader:frag,depthTest:false,depthWrite:false},extra||{}));
   const mesh=new T.Mesh(quad,m);mesh.frustumCulled=false;const sc=new T.Scene();sc.add(mesh);return{name,m,sc,mesh};};
  const FIELD=['uNoise','uCloud','uCloudH','uWind','uTime','uMaskBox'].concat(A.wxOn?['uWxMap','uWxBox','uWxMean']:[],A.skyMoodOn?['uCloudX','uCloudY','uCloudZ']:[]);
  const pMask=pass('mask',G.mask(),FIELD);
  const pMarch=pass('march',G.march(),['uNoise','uDetail','uMask','uCloudH','uWind','uTime','uCamPos','uSunDir','uGiantDir','uMaskBox','uVolT','uVolS','uVolP','uBolt','uInvProj','uCamRot','uRidgeTex','uRidgeN','uRidge']);
  const pRes=pass('resolve',G.resolve(),['uCur','uHist','uPrevVP','uInvProj','uCamRot','uCamPos','uBlend','uHistOk']);
  const pComp=pass('composite',G.composite(),['uVol','uInvProj','uCamRot','uVP','uCamPos','uLogFC','uSunDir','uGiantDir','uSunC','uZen','uHor','uShineC','uFogC','uFlashC','uSunI','uEclipse','uShineI','uFlash','uVolC'],
   {transparent:true,depthTest:true,depthWrite:false,blending:T.CustomBlending,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor,blendSrcAlpha:T.OneFactor,blendDstAlpha:T.OneMinusSrcAlphaFactor});
  pMask.m.uniforms.uMaskBox=L.uMaskBox;   /* the mask's box is the volumes' own, not on the sky's uniforms */
  // THE GPU TIMER (the budget's step-down)
  const ext=isGL2?gl.getExtension('EXT_disjoint_timer_query_webgl2'):null,times=[];let query=null;
  const stepDown=why=>{if(cfg.res<4){cfg.res++;V.log.push('res -> 1/'+cfg.res+' ('+why+')');}else if(cfg.steps>28){cfg.steps=cfg.steps>40?40:28;V.log.push('steps -> '+cfg.steps+' ('+why+')');}
   else{V.setTier('layers');V.log.push('volumes -> layers ('+why+')');}times.length=0;};
  const prevVP=new T.Matrix4(),vp=new T.Matrix4();let ping=false,histOk=false,firstCompile=true;
  const meanCover=()=>{const m=A.U.wxMean&&A.U.wxBox&&A.U.wxBox.value.w>0.5?A.U.wxMean.value.x:0;return Math.min(1,(U.uCloud.value.x+m*(1-U.uCloud.value.x))*.35)*U.uCloud.value.y;};
  // the uniforms each frame; the mask's box only when the mask is baked (every maskEvery frames, or when the eye has moved an
  // eighth of its span, or the tier was just switched on): the march reads the box the mask was baked in
  let maskAt=null,maskFrame=-1e9;
  const setU=()=>{const cam=S.camera;size();cam.updateMatrixWorld();
   L.uVolT.value.set(cfg.thin,cfg.thick,cfg.storm,cfg.density);L.uVolS.value.set(cfg.base,cfg.detail,cfg.erode,cfg.steps+100*cfg.lightSteps);
   L.uVolP.value.set(cfg.maxDist,(V.frame*.6180339887)%1,cfg.ambient,cfg.forward);L.uVolC.value.set(cfg.key,cfg.amb,cfg.haze,cfg.maxDist);
   L.uInvProj.value.copy(cam.projectionMatrixInverse);L.uCamRot.value.copy(cam.matrixWorld);vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);L.uVP.value.copy(vp);
   L.uLogFC.value=rr.capabilities.logarithmicDepthBuffer?2/(Math.log(cam.far+1)/Math.LN2):0;
   const st=A.wxState&&A.wxState.last;if(st&&A.W&&A.W.flash>.01)L.uBolt.value.set(st.x,st.z,1800,1);else L.uBolt.value.w=0;
   A.U.volMidH.value=.5*(cfg.thin+cfg.thick)*.5;};
  const maskDue=()=>{const c=S.camera.position;return !maskAt||!histOk||V.frame-maskFrame>=cfg.maskEvery||Math.hypot(c.x-maskAt[0],c.z-maskAt[1])>cfg.maskSpan/8;};
  const run={mask:()=>{const c=S.camera.position,sp=cfg.maskSpan,px=sp/cfg.maskN;L.uMaskBox.value.set(Math.round(c.x/px)*px,Math.round(c.z/px)*px,sp,meanCover());
    rr.setRenderTarget(maskRT);rr.render(pMask.sc,ocam);maskAt=[c.x,c.z];maskFrame=V.frame;},
   march:()=>{rr.setRenderTarget(cur);rr.render(pMarch.sc,ocam);},
   resolve:()=>{const out=ping?hA:hB,hist=ping?hB:hA;ping=!ping;L.uCur.value=cur.texture;L.uHist.value=hist.texture;L.uPrevVP.value.copy(prevVP);L.uHistOk.value=histOk?1:0;
    rr.setRenderTarget(out);rr.render(pRes.sc,ocam);L.uVol.value=out.texture;histOk=true;prevVP.copy(vp);}};
  const guard=fn=>{const prevT=rr.getRenderTarget(),ac=rr.autoClear,info=rr.info.autoReset,calls=rr.info.render.calls,tris=rr.info.render.triangles;rr.info.autoReset=false;rr.autoClear=false;   /* each pass's quad covers its whole target: no clear (a float target's clear cost ~0.1 ms on the Arc) */
   try{fn();}finally{rr.setRenderTarget(prevT);rr.autoClear=ac;rr.info.render.calls=calls;rr.info.render.triangles=tris;rr.info.autoReset=info;}};
  V.passes=function(){setU();
   const timing=ext&&V.auto&&V.frame%8===0&&!query;let t0=0;if(timing){query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);}
   if(firstCompile)t0=performance.now();
   guard(()=>{if(maskDue())run.mask();run.march();run.resolve();});
   if(timing)gl.endQuery(ext.TIME_ELAPSED_EXT);
   if(firstCompile){gl.finish();V.compileMs=Math.round(performance.now()-t0);firstCompile=false;}
   if(query&&!timing&&gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE)){if(!gl.getParameter(ext.GPU_DISJOINT_EXT)){times.push(gl.getQueryParameter(query,gl.QUERY_RESULT)/1e6);if(times.length>24)times.shift();}
    gl.deleteQuery(query);query=null;if(times.length>=24){const s=times.slice().sort((a,b)=>a-b);V.ms=s[12];if(V.auto&&V.ms>cfg.budget)stepDown(V.ms.toFixed(2)+' ms over '+cfg.budget);}}
   V.frame++;};
  // one pass alone (the timer: wxdemo's _api.gpuMs): 'mask', 'march', 'resolve'; the composite is V.composite
  V.pass=function(name){setU();guard(run[name]);};
  V.composite=function(){const ac=rr.autoClear;rr.autoClear=false;rr.render(pComp.sc,ocam);rr.autoClear=ac;};
  V.setTier=t=>{if(A.volTiers.indexOf(t)<0)return;V.tier=t;histOk=false;};
  // S.render with the volumes; S.renderSky alone (a page's own post pass) keeps the flat layer
  const render0=S.render,renderSky0=S.renderSky;let inRender=false;
  S.renderSky=function(){if(!inRender)A.U.volOn.value=V.tier==='off'?1:0;return renderSky0.apply(this,arguments);};
  S.render=function(){if(V.tier!=='volumes'){A.U.volOn.value=V.tier==='off'?1:0;A.U.volMidH.value=0;return render0.apply(this,arguments);}
   inRender=true;try{V.passes();A.U.volOn.value=1;S.renderSky();const ac=rr.autoClear;rr.autoClear=false;rr.clearDepth();rr.render(S.worldScene,S.camera);V.composite();rr.autoClear=ac;}finally{inRender=false;}};
  A.rec('volclouds',{preset:'volclouds',tier:V.tier,res:cfg.res,steps:cfg.steps,lightSteps:cfg.lightSteps,
   note:'raymarched cumulus over the sky field (3 octaves, the shadows\' own) and the cells\' map; tiers off, layers, volumes; Godot: a sky-shader raymarch of the same field'});
  A.vol=S.vol=V;return V;};
})();
