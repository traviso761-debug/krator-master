// ================================================================= ATMOS — the shared sky on a three.js page (the host side)
// [G native] ATMOS.sky(preset, o) draws Krator's sky (core/atmos/sky/, SKY-PLAN.md) and drives the page's light from it.
// The sky is a BACKGROUND PASS: its own scene and camera at the origin, drawn before the world (S.render does both),
// so no world object can be hidden by it and nothing in it can stand in front of the world. In Godot the same shader
// is the Sky's material ([G native]: krator/sky.gd sets its uniforms from the same ATMOS.skyState / skyLook).
//   preset   ATMOS.skyPreset(...) (its site from preset.site {px,py} on the scale model, or {latitude, subGiantLon})
//   o.renderer, o.camera, o.scene   the page's own; o.sun (DirectionalLight), o.hemi (HemisphereLight), o.shine (a
//            second DirectionalLight for giantshine; made if absent), o.fog (true: drive scene.fog)
//   o.clock  a KCLOCK (core/clock); made at game start (06:00, day 0) if absent. dayCount = clock.day
//   o.weather () => {cover, grey, fog}, optional
//   o.skylight true: ATMOS.skylight captures this sky for every standard material's reflections
// Returns S: S.render(), S.state, S.look, S.setSite(site), S.setPreset(p), S.scene (the sky alone), S.uniforms.
(function(){const A=ATMOS;
 A.sky=function(P,o){const T=A.T,r=o.renderer,cam=o.camera,scene=o.scene,SKY=A.SKY;
  const site=()=>P.site.latitude!=null?P.site:A.siteAt(P.site.px,P.site.py);
  const clock=o.clock||KCLOCK.make({hour:SKY.startHour,day:0,running:false});
  const V3=()=>new T.Vector3(),C3=()=>new T.Color();
  const U={uSunDir:{value:V3()},uGiantDir:{value:V3()},uPole:{value:V3()},uRingN:{value:V3()},uZen:{value:C3()},uHor:{value:C3()},uSunHor:{value:C3()},
   uSunC:{value:C3()},uExt:{value:V3()},uShineC:{value:C3()},uCluster:{value:V3()},uFogC:{value:C3()},uSunI:{value:1},uHazeFloor:{value:.1},uDayStars:{value:0},
   uNight:{value:0},uEclipse:{value:0},uShineI:{value:0},uSpin:{value:0},uPixAng:{value:.001},uTime:{value:0},uFogD:{value:.0001},uEq:{value:new T.Matrix3()},
   uMoonDir:{value:[0,1,2,3,4,5].map(V3)},uMoonC:{value:[0,1,2,3,4,5].map(C3)},uMoonL:{value:[0,1,2,3,4,5].map(V3)},uMoonV:{value:[0,1,2,3,4,5].map(V3)},uMoonR:{value:[.005,.005,.005,.005,.005,.005]},uMoonK:{value:[0,1,2,3,4,5]},uMoonF:{value:[0,0,0,0,0,0]},uMoonT:{value:0},uMoonG:{value:[0,1,2,3,4,5].map(V3)},uMoonMaps:{value:null},uMoonMapOn:{value:0},uRingT:{value:V3()},
   uStar:{value:SKY.stars.map(()=>new T.Vector4())},uStarC:{value:SKY.stars.map(s=>new T.Color(s[3],s[4],s[5]))},
   uGDeep:{value:C3()},uGMid:{value:C3()},uGPale:{value:C3()},uGCloud:{value:C3()},uGPlank:{value:C3()},uGHaze:{value:C3()},uGTeal:{value:C3()},uGRim:{value:C3()},uGNight:{value:C3()},uGRing:{value:C3()},
   uCloud:{value:new T.Vector4()},uCamPos:{value:V3()},uWet:{value:0},uCloudH:{value:new T.Vector4()},uWind:{value:new T.Vector2(1,.3)},uNightK:{value:V3()},
   uPN:{value:new T.Vector4()},uRidgeTex:{value:null},uRidgeN:{value:0},uRidge:{value:[0,1,2,3].map(()=>new T.Vector4())},
   uRidgeRock:{value:[0,1,2,3].map(C3)},uRidgeForest:{value:[0,1,2,3].map(C3)},uRidgeSnow:{value:[0,1,2,3].map(C3)}};
  // the noise volume, baked once for the page (64^3 RGBA, 1 MB) and shared by every sky on it
  if(!A.skyNoiseTex){const n=64,t=new T.DataTexture3D(A.skyNoiseVolume(n),n,n,n);t.format=T.RGBAFormat;t.type=T.UnsignedByteType;
   t.wrapS=t.wrapT=t.wrapR=T.RepeatWrapping;t.minFilter=t.magFilter=T.LinearFilter;t.generateMipmaps=false;t.unpackAlignment=1;t.needsUpdate=true;A.skyNoiseTex=t;}
  U.uNoise={value:A.skyNoiseTex};
  const mat=new T.ShaderMaterial({uniforms:U,side:T.BackSide,depthTest:false,depthWrite:false,fog:false,toneMapped:false,
   vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position.z=gl_Position.w*0.9999;}',
   fragmentShader:'#include <atmos_sky>\nvarying vec3 vDir;\nfloat atmSkyDither(vec2 p){return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715))));}\n'+
    'void main(){vec3 c=atmSky(vDir);c+=(atmSkyDither(gl_FragCoord.xy)-0.5)/255.0;gl_FragColor=vec4(c,1.0);}'});
  const mesh=new T.Mesh(new T.SphereGeometry(100,48,24),mat);mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.name='atmos:sky';
  const sscene=new T.Scene();sscene.add(mesh);const scam=new T.PerspectiveCamera(50,1,1,1000);
  const shine=o.shine||(()=>{const l=new T.DirectionalLight(0x9cbad6,0);l.name='atmos:giantshine';scene.add(l);scene.add(l.target);return l;})();
  const S={scene:sscene,mesh,uniforms:U,clock,preset:P,state:null,look:null,shine};
  // the ridges: elevation (degrees) and slope (degrees a degree) in a float texture, a row a layer, far to near
  const setRidges=()=>{const L=(P.ridges||[]).slice(0,A.SKY_MAX_RIDGES),n=1024,data=new Float32Array(n*A.SKY_MAX_RIDGES*4);
   L.forEach((l,i)=>{const e=l.profile||A.ridgeProfile(l,n);for(let k=0;k<n;k++){const j=(i*n+k)*4,sl=(e[(k+1)%n]-e[(k+n-1)%n])/(2*360/n);data[j]=e[k];data[j+1]=sl;}
    U.uRidge.value[i].set(l.dist,l.snowH==null?1e9:l.snowH,l.forestH==null?-1e9:l.forestH,l.haze==null?1:l.haze);
    U.uRidgeRock.value[i].setRGB(...l.rock);U.uRidgeForest.value[i].setRGB(...(l.forest||l.rock));U.uRidgeSnow.value[i].setRGB(...(l.snow||[.92,.94,.97]));});
   if(U.uRidgeTex.value)U.uRidgeTex.value.dispose();
   const t=new T.DataTexture(data,n,A.SKY_MAX_RIDGES,T.RGBAFormat,T.FloatType);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
   U.uRidgeTex.value=t;U.uRidgeN.value=L.length;};
  S.setPreset=p=>{P=S.preset=p;const G=P.giant;['Deep','Mid','Pale','Cloud','Plank','Haze','Teal','Rim','Night','Ring'].forEach(k=>U['uG'+k].value.setRGB(...G[k.toLowerCase()]));setRidges();S.update(0);};
  S.setSite=s=>{P.site=s;S.update(0);};
  const v=(u,a)=>u.value.set(a[0],a[1],a[2]),c=(u,a)=>u.value.setRGB(a[0],a[1],a[2]);
  S.update=function(dt){
   const st=S.state=A.skyState(site(),clock.hour,clock.day),W=o.weather?o.weather():null,L=S.look=A.skyLook(P,st,W);
   v(U.uSunDir,st.sunDir);v(U.uGiantDir,st.giantDir);v(U.uPole,st.giantAxis);v(U.uRingN,A.skyRingNormal(st));v(U.uCluster,[0,1,2].map(i=>0));
   const E=st.eq;U.uEq.value.set(E[0][0],E[1][0],E[2][0],E[0][1],E[1][1],E[2][1],E[0][2],E[1][2],E[2][2]);   // W^T: world -> inertial
   const cl=SKY.cluster,D=Math.PI/180;U.uCluster.value.set(Math.cos(cl.dec*D)*Math.cos(cl.ra*D),Math.cos(cl.dec*D)*Math.sin(cl.ra*D),Math.sin(cl.dec*D));
   {const p=SKY.cluster.pn;U.uPN.value.set(Math.cos(p[1]*D)*Math.cos(p[0]*D),Math.cos(p[1]*D)*Math.sin(p[0]*D),Math.sin(p[1]*D),p[2]*D);}
   SKY.stars.forEach((s,i)=>U.uStar.value[i].set(Math.cos(s[1]*D)*Math.cos(s[0]*D),Math.cos(s[1]*D)*Math.sin(s[0]*D),Math.sin(s[1]*D),s[2]));
   c(U.uZen,L.zen);c(U.uHor,L.hor);c(U.uSunHor,L.sunHor);c(U.uSunC,L.sunC);v(U.uExt,L.ext);c(U.uShineC,L.shineC);c(U.uFogC,L.fogC);
   U.uSunI.value=L.sunI;U.uHazeFloor.value=L.hazeFloor;U.uDayStars.value=L.dayStars;U.uNight.value=L.night;U.uEclipse.value=st.eclipse;U.uShineI.value=L.shineI;
   U.uSpin.value=st.spin;U.uFogD.value=L.fogD;
   v(U.uRingT,st.ringLine);U.uMoonT.value=st.t*24;st.moons.forEach((m,i)=>{U.uMoonDir.value[i].set(m.dir[0],m.dir[1],m.dir[2]);U.uMoonL.value[i].set(m.light[0],m.light[1],m.light[2]);U.uMoonV.value[i].set(m.lead[0],m.lead[1],m.lead[2]);U.uMoonG.value[i].set(m.toGiant[0],m.toGiant[1],m.toGiant[2]);U.uMoonK.value[i]=m.kind;U.uMoonF.value[i]=m.front;U.uMoonC.value[i].setRGB(...m.albedo);U.uMoonR.value[i]=m.radiusDeg*D;});
   const C=P.clouds;U.uCloud.value.set(L.cover,C.cumulus,C.cirrus,C.bank);U.uCloudH.value.set(C.height,C.cirrusHeight,C.scale,C.drift);
   U.uNightK.value.set(P.night.stars,P.night.nebula,P.night.galaxy);U.uCamPos.value.copy(cam.position);U.uWet.value=W&&W.wet!=null?W.wet:0;
   U.uTime.value=(A.clock?A.clock.t:clock.t);
   U.uPixAng.value=(cam.fov*D)/Math.max(1,r.domElement.height);   // one framebuffer pixel, radians
   // the page's light (the colour script is display-space; three's lights and fog are linear)
   if(o.sun){o.sun.position.set(...st.sunDir).multiplyScalar(1000);if(o.sun.target)o.sun.target.position.set(0,0,0);o.sun.color.setRGB(...L.sunC).convertSRGBToLinear();o.sun.intensity=L.sunI*(st.sunAlt>-1?1:0);}
   shine.position.set(...st.giantDir).multiplyScalar(1000);shine.color.setRGB(...L.shineC).convertSRGBToLinear();shine.intensity=L.shineI;
   if(o.hemi){o.hemi.color.setRGB(...L.hemiS).convertSRGBToLinear();o.hemi.groundColor.setRGB(...L.hemiG).convertSRGBToLinear();o.hemi.intensity=L.hemiI;}
   r.toneMappingExposure=L.exp;
   if(o.fog!==false&&scene.fog){scene.fog.color.setRGB(...L.fogC).convertSRGBToLinear();if(scene.fog.density!=null)scene.fog.density=L.fogD;}
   if(A.U&&A.U.hour)A.U.hour.value=clock.hour;};
  S.render=function(){scam.quaternion.copy(cam.quaternion);scam.fov=cam.fov;scam.aspect=cam.aspect;scam.updateProjectionMatrix();
   const ac=r.autoClear;r.autoClear=true;r.render(sscene,scam);r.autoClear=false;r.clearDepth();r.render(scene,cam);r.autoClear=ac;};
  // the reflections: ATMOS.skylight captures the sky scene (about the origin) whenever the hour moves or the key does
  if(o.skylight)S.skylight=A.skylight({renderer:r,sky:sscene,scene,ground:()=>new T.Color(...(S.look?S.look.hemiG:[.2,.2,.2])).convertSRGBToLinear(),
   key:()=>[clock.day,Math.round(clock.hour*4),S.look&&S.look.cover.toFixed(2),P.site.px,P.site.py,P.air.pressure].join()});
  // the moon maps: one atlas image, a 2:1 row a moon in SKY.moons order (o.moonAtlas: a URL); procedural until it loads
  if(o.moonAtlas)new T.TextureLoader().load(o.moonAtlas,t=>{t.wrapS=T.RepeatWrapping;t.wrapT=T.ClampToEdgeWrapping;t.anisotropy=4;U.uMoonMaps.value=t;U.uMoonMapOn.value=1;});
  A.skyUniforms=U;
  S.setPreset(P);
  return S;};
 // ATMOS.cloudShade(material, {porosity}): the sky's clouds shade this ground or plant material (SKY-PLAN.md 11.1), and
 // rain darkens it. Every directional light is shaded along its own direction (the sun, the giantshine); a standard
 // material per pixel, a Lambert one per vertex (as r128 lights it). The uniforms are the sky's own objects, so one
 // update a frame moves every shadow. porosity: how much the wet darkens it (soil 1, rock 0.6, leaves 0.4, metal 0).
 // Call it after ATMOS.sky; on a page with no shared sky it does nothing.
 A.cloudShade=function(mat,o){o=o||{};const U=A.skyUniforms;if(!U||!mat)return mat;const por=o.porosity==null?1:o.porosity,prev=mat.onBeforeCompile;
  mat.onBeforeCompile=function(sh,r){if(prev)prev.call(this,sh,r);
   for(const k of['uNoise','uCloud','uCloudH','uWind','uTime','uWet'])sh.uniforms[k]=U[k];sh.uniforms.uPorosity={value:por};
   const head=A.cloudShadeGLSL()+'\nuniform float uPorosity;\n',wp='vec4 atmWP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmWP=instanceMatrix*atmWP;\n#endif\natmWP=modelMatrix*atmWP;\n';
   const shade='directLight.color*=atmCloudShade(atmWPos,normalize((vec4(directLight.direction,0.0)*viewMatrix).xyz));';
   if(/lights_lambert_vertex/.test(sh.vertexShader)){
    const lam=A.T.ShaderChunk.lights_lambert_vertex.replace(/(getDirectionalDirectLightIrradiance\(\s*directionalLights\[\s*i\s*\],\s*geometry,\s*directLight\s*\);)/,'$1 '+shade);
    sh.vertexShader=head+sh.vertexShader.replace('#include <lights_lambert_vertex>',wp+'vec3 atmWPos=atmWP.xyz;\n'+lam);}
   else{sh.vertexShader='varying vec3 atmWPos;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n'+wp+'atmWPos=atmWP.xyz;');
    const lfb=A.T.ShaderChunk.lights_fragment_begin.replace(/(getDirectionalDirectLightIrradiance\(\s*directionalLight,\s*geometry,\s*directLight\s*\);)/,'$1 '+shade);   /* the include is not expanded yet: expand it here */
    sh.fragmentShader=head+'varying vec3 atmWPos;\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>',lfb)
     .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor*=1.0-0.55*uWet*step(0.01,uPorosity);');}
   sh.fragmentShader=(/uniform float uWet;/.test(sh.fragmentShader)?'':'uniform float uWet;\nuniform float uPorosity;\n')+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=1.0-0.38*uWet*uPorosity;');};
  mat.customProgramCacheKey=()=>'atmos-cloudshade-'+por;mat.needsUpdate=true;return mat;};
})();
