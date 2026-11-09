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
  const clock=o.clock||KCLOCK.make({hour:SKY.viewHour,day:0,running:false});
  // the page's hour is the sky's now: the host's panel shows the hour slider and run / hold on any page with ATMOS.skyUniforms
  // (core/host 92-host-panel.js; the swbay-template pages pass no clock.onSet, so they had none: X3)
  const V3=()=>new T.Vector3(),C3=()=>new T.Color();
  const U={uSunDir:{value:V3()},uGiantDir:{value:V3()},uPole:{value:V3()},uRingN:{value:V3()},uZen:{value:C3()},uHor:{value:C3()},uSunHor:{value:C3()},
   uSunC:{value:C3()},uExt:{value:V3()},uShineC:{value:C3()},uCluster:{value:V3()},uFogC:{value:C3()},uSunI:{value:1},uHazeFloor:{value:.1},uDayStars:{value:0},
   uNight:{value:0},uEclipse:{value:0},uShineI:{value:0},uSpin:{value:0},uPixAng:{value:.001},uTime:{value:0},uFogD:{value:.0001},uEq:{value:new T.Matrix3()},
   uMoonDir:{value:[0,1,2,3,4,5].map(V3)},uMoonC:{value:[0,1,2,3,4,5].map(C3)},uMoonL:{value:[0,1,2,3,4,5].map(V3)},uMoonV:{value:[0,1,2,3,4,5].map(V3)},uMoonR:{value:[.005,.005,.005,.005,.005,.005]},uMoonK:{value:[0,1,2,3,4,5]},uMoonLump:{value:[0,0,0,0,0,0]},uMoonF:{value:[0,0,0,0,0,0]},uMoonT:{value:0},uMoonG:{value:[0,1,2,3,4,5].map(V3)},uMoonMaps:{value:null},uMoonMapOn:{value:0},uRingT:{value:V3()},
   uStar:{value:SKY.stars.map(()=>new T.Vector4())},uStarC:{value:SKY.stars.map(s=>new T.Color(s[3],s[4],s[5]))},
   uGDeep:{value:C3()},uGMid:{value:C3()},uGPale:{value:C3()},uGCloud:{value:C3()},uGPlank:{value:C3()},uGHaze:{value:C3()},uGTeal:{value:C3()},uGRim:{value:C3()},uGNight:{value:C3()},uGRing:{value:C3()},
   uCloud:{value:new T.Vector4()},uCamPos:{value:V3()},uWet:{value:0},uCloudH:{value:new T.Vector4()},uWind:{value:new T.Vector2(1,.3)},uNightK:{value:V3()},
   uCloudX:{value:new T.Vector4()},uCloudY:{value:new T.Vector4()},uCloudZ:{value:new T.Vector4()},uCloudTint:{value:C3()},uCloudGlow:{value:C3()},uCloudGlowP:{value:new T.Vector4(0,0,1,1)},uCloudGlowQ:{value:new T.Vector4(0,0,1,0)},uCloudBeam:{value:new T.Vector4()},uCloudBeamP:{value:new T.Vector4()},   // the clouds' mood (read only when the chunk has its lines)
   uPN:{value:new T.Vector4()},uRidgeTex:{value:null},uRidgeN:{value:0},uRidge:{value:[0,1,2,3].map(()=>new T.Vector4())},
   uRidgeRock:{value:[0,1,2,3].map(C3)},uRidgeForest:{value:[0,1,2,3].map(C3)},uRidgeSnow:{value:[0,1,2,3].map(C3)},
   uStaDir:{value:V3()},uStaAx:{value:V3()},uStaV:{value:V3()},uStaK:{value:new T.Vector4()},uRealT:{value:0},uMeteor:{value:1},
   uLm:{value:Array.from({length:A.SKY_MAX_LANDMARKS*5},()=>new T.Vector4())},uLmK:{value:new Array(A.SKY_MAX_LANDMARKS).fill(-1)},uLmN:{value:0}};
  // the noise volume, baked once for the page (64^3 RGBA, 1 MB) and shared by every sky on it
  if(!A.skyNoiseTex){const n=64,t=new T.DataTexture3D(A.skyNoiseVolume(n),n,n,n);t.format=T.RGBAFormat;t.type=T.UnsignedByteType;
   t.wrapS=t.wrapT=t.wrapR=T.RepeatWrapping;t.minFilter=t.magFilter=T.LinearFilter;t.generateMipmaps=false;t.unpackAlignment=1;t.needsUpdate=true;A.skyNoiseTex=t;}
  U.uNoise={value:A.skyNoiseTex};
  // the clouds' mood (sky/89-atmos-g-sky.js): a preset that asks for it (clouds.dark / tint / turbulence / glow, or clouds.mood) gets
  // the chunk with its lines, written here before the material compiles; every other page's chunk is the text it was
  if(A.skyMoodWanted(P)&&!A.skyMoodOn){A.skyMoodOn=true;T.ShaderChunk.atmos_sky=A.skyGLSL();}
  const mat=new T.ShaderMaterial({uniforms:U,side:T.BackSide,depthTest:false,depthWrite:false,fog:false,toneMapped:false,
   vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position.z=gl_Position.w*0.9999;}',
   fragmentShader:'#include <atmos_sky>\nvarying vec3 vDir;\nfloat atmSkyDither(vec2 p){return fract(52.9829189*fract(dot(p,vec2(0.06711056,0.00583715))));}\n'+
    'void main(){vec3 c=atmSky(vDir);c+=(atmSkyDither(gl_FragCoord.xy)-0.5)/255.0;gl_FragColor=vec4(c,1.0);}'});
  const mesh=new T.Mesh(new T.SphereGeometry(100,48,24),mat);mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.name='atmos:sky';
  const sscene=new T.Scene();sscene.add(mesh);const scam=new T.PerspectiveCamera(50,1,1,1000);
  const shine=o.shine||(()=>{const l=new T.DirectionalLight(0x9cbad6,0);l.name='atmos:giantshine';scene.add(l);scene.add(l.target);return l;})();
  const S={scene:sscene,mesh,uniforms:U,clock,preset:P,state:null,look:null,shine};
  // what this sky drives each frame (ATMOS.bindWeather reads it live, so either may bind first): the fog, and the sun and the
  // hemisphere. A page that passes o.weather composes the weather into the colour script itself; otherwise the binding's look
  // (A.wxLook: grey, cover, wet) goes in and its fog law (A.wxFog) runs on the hour's fog
  A.skyDrives={fog:o.fog!==false,light:!!(o.sun||o.hemi),own:!!o.weather};
  // the ridges: elevation (degrees) and slope (degrees a degree) in a float texture, a row a layer, far to near
  const setRidges=()=>{const L=(P.ridges||[]).slice(0,A.SKY_MAX_RIDGES),n=1024,data=new Float32Array(n*A.SKY_MAX_RIDGES*4);
   L.forEach((l,i)=>{const e=l.profile||A.ridgeProfile(l,n);for(let k=0;k<n;k++){const j=(i*n+k)*4,sl=(e[(k+1)%n]-e[(k+n-1)%n])/(2*360/n);data[j]=e[k];data[j+1]=sl;}
    U.uRidge.value[i].set(l.dist,l.snowH==null?1e9:l.snowH,l.forestH==null?-1e9:l.forestH,l.haze==null?1:l.haze);
    U.uRidgeRock.value[i].setRGB(...l.rock);U.uRidgeForest.value[i].setRGB(...(l.forest||l.rock));U.uRidgeSnow.value[i].setRGB(...(l.snow||[.92,.94,.97]));});
   if(U.uRidgeTex.value)U.uRidgeTex.value.dispose();
   const t=new T.DataTexture(data,n,A.SKY_MAX_RIDGES,T.RGBAFormat,T.FloatType);t.minFilter=t.magFilter=T.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;
   U.uRidgeTex.value=t;U.uRidgeN.value=L.length;};
  // the landmarks (ATMOS.skyLandmarks): packed once a preset, the shader's five vec4 each
  const setLandmarks=()=>{const M=A.skyLandmarks(P.landmarks);U.uLmN.value=M.n;for(let i=0;i<A.SKY_MAX_LANDMARKS;i++){U.uLmK.value[i]=M.kind[i];for(let k=0;k<5;k++){const j=(i*5+k)*4;U.uLm.value[i*5+k].set(M.v[j],M.v[j+1],M.v[j+2],M.v[j+3]);}}};
  S.setPreset=p=>{P=S.preset=p;const G=P.giant;['Deep','Mid','Pale','Cloud','Plank','Haze','Teal','Rim','Night','Ring'].forEach(k=>U['uG'+k].value.setRGB(...G[k.toLowerCase()]));setRidges();setLandmarks();S.update(0);};
  S.setSite=s=>{P.site=s;S.update(0);};
  const v=(u,a)=>u.value.set(a[0],a[1],a[2]),c=(u,a)=>u.value.setRGB(a[0],a[1],a[2]);
  S.update=function(dt){
   const st=S.state=A.skyState(site(),clock.hour,clock.day),W=o.weather?o.weather():(A.wxLook?A.wxLook():null),L=S.look=A.skyLook(P,st,W,cam.position.y);
   v(U.uSunDir,st.sunDir);v(U.uGiantDir,st.giantDir);v(U.uPole,st.giantAxis);v(U.uRingN,A.skyRingNormal(st));v(U.uCluster,[0,1,2].map(i=>0));
   const E=st.eq;U.uEq.value.set(E[0][0],E[1][0],E[2][0],E[0][1],E[1][1],E[2][1],E[0][2],E[1][2],E[2][2]);   // W^T: world -> inertial
   const cl=SKY.cluster,D=Math.PI/180;U.uCluster.value.set(Math.cos(cl.dec*D)*Math.cos(cl.ra*D),Math.cos(cl.dec*D)*Math.sin(cl.ra*D),Math.sin(cl.dec*D));
   {const p=SKY.cluster.pn;U.uPN.value.set(Math.cos(p[1]*D)*Math.cos(p[0]*D),Math.cos(p[1]*D)*Math.sin(p[0]*D),Math.sin(p[1]*D),p[2]*D);}
   SKY.stars.forEach((s,i)=>U.uStar.value[i].set(Math.cos(s[1]*D)*Math.cos(s[0]*D),Math.cos(s[1]*D)*Math.sin(s[0]*D),Math.sin(s[1]*D),s[2]));
   c(U.uZen,L.zen);c(U.uHor,L.hor);c(U.uSunHor,L.sunHor);c(U.uSunC,L.sunC);v(U.uExt,L.ext);c(U.uShineC,L.shineC);c(U.uFogC,L.fogC);
   U.uSunI.value=L.sunI;U.uHazeFloor.value=L.hazeFloor;U.uDayStars.value=L.dayStars;U.uNight.value=L.night;U.uEclipse.value=st.eclipse;U.uShineI.value=L.shineI;
   U.uSpin.value=st.spin;U.uFogD.value=L.fogD;
   v(U.uRingT,st.ringLine);U.uMoonT.value=st.t*24;st.moons.forEach((m,i)=>{U.uMoonDir.value[i].set(m.dir[0],m.dir[1],m.dir[2]);U.uMoonL.value[i].set(m.light[0],m.light[1],m.light[2]);U.uMoonV.value[i].set(m.lead[0],m.lead[1],m.lead[2]);U.uMoonG.value[i].set(m.toGiant[0],m.toGiant[1],m.toGiant[2]);U.uMoonK.value[i]=m.kind;U.uMoonLump.value[i]=m.lump;U.uMoonF.value[i]=m.front;U.uMoonC.value[i].setRGB(...m.albedo);U.uMoonR.value[i]=m.radiusDeg*D;});
   const C=P.clouds;U.uCloud.value.set(L.cover,C.cumulus,C.cirrus,C.bank);U.uCloudH.value.set(C.height,C.cirrusHeight,C.scale,C.drift);
   {const tk=C.tint?(C.tintK==null?1:C.tintK):0,gl=C.glowLocus||[0,0,1,1];U.uCloudX.value.set(C.dark==null?0:C.dark,C.turbulence==null?0:C.turbulence,C.glow==null?0:C.glow,tk);
    const ta=C.turbAt||[cam.position.x,cam.position.z],g2=C.glowLocus2||[0,0,1,0];U.uCloudY.value.set(A.MOOD_TURB[C.turbKind]||0,ta[0],ta[1],C.pace==null?3:C.pace);U.uCloudZ.value.set(C.sheetTint==null?0:C.sheetTint,0,0,0);if(C.tint)U.uCloudTint.value.setRGB(C.tint[0],C.tint[1],C.tint[2]);
    const gc=C.glowColour||[1,.55,.2];U.uCloudGlow.value.setRGB(gc[0],gc[1],gc[2]);U.uCloudGlowP.value.set(gl[0],gl[1],gl[2],gl[3]);U.uCloudGlowQ.value.set(g2[0],g2[1],g2[2],g2[3]);
    const ev=C.event;if(ev&&ev.k>0){U.uCloudBeam.value.set(ev.x,ev.z,ev.kind==='pillar'?1:2,ev.k);U.uCloudBeamP.value.set(ev.top,ev.width,ev.h,ev.ground==null?0:ev.ground);}else U.uCloudBeam.value.set(0,0,0,0);}
   U.uNightK.value.set(P.night.stars,P.night.nebula,P.night.galaxy);U.uCamPos.value.copy(cam.position);U.uWet.value=W&&W.wet!=null?W.wet:0;
   U.uTime.value=(A.clock?A.clock.t:clock.t);
   {const q=st.station;v(U.uStaDir,q.dir);v(U.uStaAx,q.axis);v(U.uStaV,q.vel);U.uStaK.value.set(q.radiusDeg*D,q.lit,q.dist,q.up);}
   U.uRealT.value=(typeof performance!=='undefined'?performance.now():Date.now())/1000%86400;U.uMeteor.value=P.night.meteors==null?1:P.night.meteors;
   U.uPixAng.value=(cam.fov*D)/Math.max(1,r.domElement.height);   // one framebuffer pixel, radians
   // the page's light (the colour script is display-space; three's lights and fog are linear: KCOLOR.lin, three's own curve)
   const KC=A.KC();
   if(o.sun){o.sun.position.set(...st.sunDir).multiplyScalar(1000);if(o.sun.target)o.sun.target.position.set(0,0,0);KC.lin(L.sunC,o.sun.color);o.sun.intensity=L.sunI*(st.sunAlt>-1?1:0);}
   shine.position.set(...st.giantDir).multiplyScalar(1000);KC.lin(L.shineC,shine.color);shine.intensity=L.shineI;
   if(o.hemi){KC.lin(L.hemiS,o.hemi.color);KC.lin(L.hemiG,o.hemi.groundColor);o.hemi.intensity=L.hemiI;}
   KC.exposure(r,L.exp);
   if(o.fog!==false&&scene.fog){KC.lin(L.fogC,scene.fog.color);if(scene.fog.density!=null)scene.fog.density=L.fogD;
    if(!o.weather&&A.wxFog)A.wxFog(scene.fog);}   /* ATMOS.bindWeather's fog law on top of the hour's fog (X2): the two compose, whichever bound first */
   if(A.U&&A.U.hour)A.U.hour.value=clock.hour;};
  // S.renderSky(): the sky pass alone, into whatever target is bound (a page with its own post pass draws the world after it)
  S.renderSky=function(){scam.quaternion.copy(cam.quaternion);scam.fov=cam.fov;scam.aspect=cam.aspect;scam.updateProjectionMatrix();
   const ac=r.autoClear;r.autoClear=true;r.render(sscene,scam);r.autoClear=ac;};
  S.render=function(){S.renderSky();const ac=r.autoClear;r.autoClear=false;r.clearDepth();r.render(scene,cam);r.autoClear=ac;};
  // the reflections: ATMOS.skylight captures the sky scene (about the origin) whenever the hour moves or the key does
  if(o.skylight)S.skylight=A.skylight({renderer:r,sky:sscene,scene,ground:()=>A.KC().lin(S.look?S.look.hemiG:[.2,.2,.2],new T.Color()),
   key:()=>[clock.day,Math.round(clock.hour*4),S.look&&S.look.cover.toFixed(2),P.site.px,P.site.py,P.air.thin&&S.look?S.look.p.toFixed(2):P.air.pressure].join()});
  // the moon maps: one atlas image, a 2:1 row a moon in SKY.moons order (o.moonAtlas: a URL); procedural until it loads
  if(o.moonAtlas)new T.TextureLoader().load(o.moonAtlas,t=>{t.wrapS=T.RepeatWrapping;t.wrapT=T.ClampToEdgeWrapping;t.anisotropy=4;U.uMoonMaps.value=t;U.uMoonMapOn.value=1;});
  A.skyUniforms=U;
  S.setPreset(P);
  return S;};
 // ATMOS.cloudMood(S, o) -> S: the clouds' mood made to shift (sky/89-atmos-k-cloudmood.js: ATMOS.moodAt's episodes, moodGlow's
 // breathe or lightning), written into the sky's preset.clouds every frame from the module clock, so the sky's own update draws
 // it. o: moodAt's options (seed, period, blend, chance, dark, palette, tintAt, glowColour / glowColours ...). Call it right after
 // ATMOS.sky and before the first render (the chunk takes the mood's lines when the sky and the shaded materials compile): a
 // preset without clouds.mood is given the lines here. S.mood is the episode now (a readout, a view's check).
 // the mood's lightning strikes a bolt (fx/89-atmos-fx-lightning.js on the page: its ribbons, its thunder event) at each new flash,
 // from the cloud plane at the flash's locus to the ground there; its brightness A.boltGlow follows the flash and the night
 let boltId=null;A.moodBolt=function(S,g,night,t){if(!A.boltFx)return;const f=g.flash;
  if(f&&night>0&&f.id!==boltId){boltId=f.id;const cam=A.h&&A.h.camera,d=cam?Math.hypot(f.x-cam.position.x,f.z-cam.position.z):1000;A.boltFx({x:f.x,z:f.z,top:S.preset.clouds.height,base:A.ground(f.x,f.z),dist:d,t});}
  A.boltGlow=f&&night>0?Math.min(1,f.e*1.2)*night:0;};
 // what the sky did, for a listener (core/audio/24-core-audio-sky.js hears it): ATMOS.onSky(fn(ev)); ATMOS.skyTrack(S, now) is called
 // each frame by cloudMood (or by a page that sets the clouds itself) with moodGlow's flash, the sky event, the episode and the glow,
 // diffs it against the last frame (ATMOS.skyDiff) and keeps ATMOS.skyLevel (the orbs' and the breathe's strength) current
 A.skyListeners=[];A.onSky=fn=>{A.skyListeners.push(fn);return fn;};A.skyLevel={orbs:0,breathe:0};
 A.skyTrack=function(S,now){const r=A.skyDiff(S.skyPrev,now);S.skyPrev=r.prev;A.skyLevel=A.skyLevels(now);
  for(const ev of r.events)for(const fn of A.skyListeners){try{fn(ev);}catch(x){A.err('sky: '+x.message);}}return r.events;};
 // the sky events, placed where the eye stood when each began (the record's dx, dz from moodEvent), the ground under their foot
 let evId=null,evAt=null;A.moodEventAt=function(t,seed,eye,o){const ev=A.moodEvent(t,seed,o);if(!ev)return null;
  if(ev.id!==evId){evId=ev.id;evAt=[eye[0]+ev.dx,eye[1]+ev.dz];evAt.push(A.ground(evAt[0],evAt[1]));}
  ev.x=evAt[0];ev.z=evAt[1];ev.ground=evAt[2];ev.top+=evAt[2];ev.h+=evAt[2];return ev;};
 A.cloudMood=function(S,o){o=o||{};const T=A.T,cam=A.h&&A.h.camera,seed=o.seed==null?1:o.seed;
  if(!A.skyMoodOn){A.skyMoodOn=true;T.ShaderChunk.atmos_sky=A.skyGLSL();S.mesh.material.needsUpdate=true;}
  let ep=null;const step=()=>{if(S.moodPaused)return;const C=S.preset.clouds,t=A.clock?A.clock.t:(S.clock.t||0),eye=   /* S.moodPaused: a page holding the clouds itself for a while (the demo's toggles) */   /* S.preset each frame: a page may set another preset (S.setPreset) */cam?[cam.position.x,cam.position.z]:[0,0],m=A.moodAt(t,Object.assign({eye},o)),g=A.moodGlow(t,m.glowKind,seed,eye);
   if(m.episode!==ep||!C.turbAt){ep=m.episode;C.turbAt=[eye[0]+m.turbOffset[0],eye[1]+m.turbOffset[1]];}   /* the ripple's epicentre: latched where the eye was when the episode came */
   C.dark=m.dark;C.tint=m.tintK>0?m.tint:null;C.tintK=m.tintK;C.turbulence=m.turbulence;C.turbKind=m.turbKind;C.sheetTint=m.sheetTint;C.glow=m.glow*g.k;C.glowColour=m.glowColour;C.glowLocus=g.locus;C.glowLocus2=g.locus2;S.mood=m;
   const night=A.skyUniforms?A.skyUniforms.uNight.value:1;A.moodBolt(S,g,m.glow*night,t);
   C.event=o.events===false?null:A.moodEventAt(t,seed,eye,o.eventOpts);
   A.skyTrack(S,{flash:g.flash,event:C.event,episode:m.episode,glowKind:m.glowKind,turbKind:m.turbKind,glow:C.glow,night,t});};
  step();A.hook(step);S.moodStep=step;
  const D=A.MOOD_DEFAULTS;A.rec('cloudmood',{seed,period:o.period==null?D.period:o.period,blend:o.blend==null?D.blend:o.blend,chance:Object.assign({},D.chance,o.chance||{}),dark:o.dark||D.dark,
   palette:o.palette||A.MOOD_PALETTE,turbKinds:o.turbKinds||D.turbKinds,glowKinds:o.glowKinds||D.glowKinds,area:!!o.tintAt,glowColour:o.glowColour||null,
   note:'clouds.dark / tint / turbulence / glow from ATMOS.moodAt(t) each frame, the glow\'s factor and locus from ATMOS.moodGlow (sky/89-atmos-k-cloudmood.js)'});
  return S;};
 // ATMOS.cloudShade(material, {porosity}): the sky's clouds shade this ground or plant material (SKY-PLAN.md 11.1), and
 // rain darkens it. Every directional light is shaded along its own direction (the sun, the giantshine); a standard
 // material per pixel, a Lambert one per vertex (as r128 lights it). The uniforms are the sky's own objects, so one
 // update a frame moves every shadow. porosity: how much the wet darkens it (soil 1, rock 0.6, leaves 0.4, metal 0).
 // Call it after ATMOS.sky; on a page with no shared sky it does nothing.
 // ATMOS.shaderHook(material, key, fn(shader, renderer)): KHOOK.add(material, key, fn) (core/shader/06-core-khook.js, the one
 // door for shader hooks). Any number of layers (cloudShade, heightFog, snowOn, WATER.wetGround, the page's own) compose in a
 // fixed order: the page's own hook first (assigned before or after), then the layers as added; a page hook that wraps the one
 // it read never recurses (the NW outer wall's: cloudShade after wetGround); the program key is the key under it + '|' + key;
 // a layer added twice runs once; a missing anchor throws. Returns the material.
 A.shaderHook=function(mat,key,fn){return A.KH().add(mat,key,fn);};
 // ATMOS.cloudShade(material, {porosity}): the sky's clouds shade this ground or plant material (SKY-PLAN.md 11.1), and
 // rain darkens it. Every directional light is shaded along its own direction (the sun, the giantshine); a standard
 // material per pixel, a Lambert one per vertex (as r128 lights it). The uniforms are the sky's own objects, so one
 // update a frame moves every shadow. porosity: how much the wet darkens it (soil 1, rock 0.6, leaves 0.4, metal 0).
 // Under cover (the rain occlusion map, fx/89-atmos-fx-raincover.js, when the page takes it) the ground stays dry.
 // Call it after ATMOS.sky; on a page with no shared sky it does nothing. Any order with wetGround, snowOn, heightFog.
 A.cloudShade=function(mat,o){o=o||{};const U=A.skyUniforms;if(!U||!mat)return mat;const por=o.porosity==null?1:o.porosity;
  const K=A.KH();return A.shaderHook(mat,'atmos-cloudshade-'+por,function(sh){
   for(const k of['uNoise','uCloud','uCloudH','uWind','uTime','uWet'].concat(A.skyMoodOn?['uCloudX','uCloudY','uCloudZ']:[]))sh.uniforms[k]=U[k];sh.uniforms.uPorosity={value:por};   /* the shade's field reads uCloudY (the kind, the ripple's epicentre) */
   const occ=A.rainCoverGLSL&&A.U&&A.U.rainOcc?A.rainCoverGLSL():null;if(occ)A.rainCoverUniforms(sh.uniforms);
   const head=A.cloudShadeGLSL()+'\nuniform float uPorosity;\n',wp='vec4 atmWP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmWP=instanceMatrix*atmWP;\n#endif\natmWP=modelMatrix*atmWP;\n';
   const shade='directLight.color*=atmCloudShade(atmWPos,normalize((vec4(directLight.direction,0.0)*viewMatrix).xyz));';
   const lambert=/lights_lambert_vertex/.test(sh.vertexShader);
   if(lambert){
    const lam=K.rep(A.T.ShaderChunk.lights_lambert_vertex,/(getDirectionalDirectLightIrradiance\(\s*directionalLights\[\s*i\s*\],\s*geometry,\s*directLight\s*\);)/,'$1 '+shade);
    sh.vertexShader=head+(occ?'varying vec3 atmWPosF;\n':'')+K.rep(sh.vertexShader,'#include <lights_lambert_vertex>',wp+'vec3 atmWPos=atmWP.xyz;\n'+(occ?'atmWPosF=atmWPos;\n':'')+lam);}
   else{/* after <project_vertex>; a hook that replaced it (a leaf card's sway) gets it before <fog_vertex> instead, as the snow does */
    sh.vertexShader='varying vec3 atmWPos;\n'+K.inject(sh.vertexShader,{at:'project_vertex',after:wp+'atmWPos=atmWP.xyz;',fallback:{at:'fog_vertex',before:wp+'atmWPos=atmWP.xyz;'}});
    const lfb=K.rep(A.T.ShaderChunk.lights_fragment_begin,/(getDirectionalDirectLightIrradiance\(\s*directionalLight,\s*geometry,\s*directLight\s*\);)/,'$1 '+shade);   /* the include is not expanded yet: expand it here */
    /* the wet's gloss on a Standard material's roughness; a Phong material has no <roughnessmap_fragment> (2026-11-02: KHOOK threw at render on the
       Throne glacier's Phong ice), so it takes the darkening alone. A Standard material's text is unchanged */
    const RL=A.repLit(this),fs1=RL(sh.fragmentShader,'#include <lights_fragment_begin>',lfb);
    sh.fragmentShader=head+'varying vec3 atmWPos;\n'+(fs1.indexOf('#include <roughnessmap_fragment>')>=0?RL(fs1,
     '#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor*=1.0-0.55*atmWetHere*step(0.01,uPorosity);'):fs1);}
   /* the wet here: W.wet, none under cover when the page takes the rain occlusion map (the world position reaches the fragment) */
   const wetHere=occ?'float atmWetHere=uWet*(1.0-atmRainCover('+(lambert?'atmWPosF':'atmWPos')+'));':'float atmWetHere=uWet;';
   /* a hook that samples its own map (core/biome's gloss bark replaces <map_fragment> and <color_fragment>) gets it before <alphamap_fragment>, the next chunk that holds */
   const wet=wetHere+'\ndiffuseColor.rgb*=1.0-0.38*atmWetHere*uPorosity;';
   sh.fragmentShader=(/uniform float uWet;/.test(sh.fragmentShader)?'':'uniform float uWet;\nuniform float uPorosity;\n')+(occ?(lambert?'varying vec3 atmWPosF;\n':'')+occ+'\n':'')
    +K.inject(sh.fragmentShader,{at:'map_fragment',after:wet,fallback:{at:'alphamap_fragment',before:wet}});});};
})();
