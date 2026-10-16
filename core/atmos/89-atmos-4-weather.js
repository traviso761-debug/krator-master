// ================================================================= ATMOS — weather: modes, rain streaks, lightning, fog, wet ground
// ATMOS.weather(o) starts it. Modes: auto (dawn fog, an evening shower 19:30-22:00, from the hour), clear, rain, storm
// (rain with lightning), fog. The state eases toward the mode's target each frame: W.rain, W.fog, W.wet (rises in rain,
// dries after), W.flash (lightning). The module draws the rain and the bolt; what the weather does to the HOST's scene
// (fog density, sun, ground roughness) is the host's. W.wind (1 calm .. 2.4 storm) scales the module's wind.
// o.apply(W) is called every frame after the state is updated.
// o.ui: an element to put a Weather selector in. Never flashes when the viewer asks for reduced motion.
// ASH (opt-in, 2026-10-06, from Voth's ash storm): o.ash adds the modes 'ashfall' (ash sifting down, a little haze) and 'ash'
// (an ash storm: thick flecks driven by a gale, veils of ash racing along the ground, warm volcanic lightning, heavy haze)
// and W.ash (0..1, eased like rain); A.U.ash feeds the shaders (atm_ash). Without o.ash nothing changes: the modes, the
// state's other fields and every older host behave as before (W.ash stays 0).
// SNOW (opt-in, 2026-10-06, for the Throne's glacier): o.snow adds 'snowfall' (flakes drifting down) and 'blizzard' (thick
// flakes driven by a gale, streaks of blown snow, spindrift skimming the ground, a white-out), and W.snow (0..1, eased);
// A.U.snow feeds the shaders (atm_snow). The ash and the snow are drawn by one function (A.flakeWeather), each with its
// own preset. Without o.snow nothing changes (W.snow stays 0).
(function(){const A=ATMOS;
 // THE STATE MACHINE, pure: what the weather is heading for at an hour in a mode, one eased step of the state, and
 // the lightning flash e ms after a strike. No THREE, no DOM: test-atmos.js runs these, and Godot's Atmos autoload
 // ports them line for line.
 A.MODES=['auto','clear','rain','storm','fog'];
 A.ASH_MODES=['ashfall','ash'];   // offered only to a host that asks (o.ash)
 A.SNOW_MODES=['snowfall','blizzard'];   // offered only to a host that asks (o.snow)
 A.weatherAuto=h=>({rain:A.ss(19.5,19.9,h)*(1-A.ss(21.6,22,h)),fog:.7*A.ss(4.3,5.5,h)*(1-A.ss(8.4,9.6,h))});
 A.weatherTarget=(M,h)=>{const au=A.weatherAuto(h),PW=A.PRESETS.wind.weather,PA=A.PRESETS.ash||{},PS=A.PRESETS.snow||{};
  return{rain:M==='rain'?.75:M==='storm'?1:M==='auto'?au.rain:0,fog:M==='fog'?1:M==='auto'?au.fog:M==='storm'?.3:M==='ash'?(PA.stormFog||.55):M==='blizzard'?(PS.stormFog||.6):0,
   wind:M==='storm'?PW.storm:M==='rain'?PW.rain:M==='auto'?1+PW.autoRain*au.rain:M==='ash'?(PW.ash||PW.storm):M==='ashfall'?(PW.ashfall||PW.clear):M==='blizzard'?(PW.blizzard||PW.storm):M==='snowfall'?(PW.snowfall||PW.clear):PW.clear,
   ash:M==='ash'?1:M==='ashfall'?(PA.ashfall||.35):0,snow:M==='blizzard'?1:M==='snowfall'?(PS.snowfall||.4):0};};
 A.weatherStep=(W,h,dt)=>{const g=A.weatherTarget(W.mode,h);W.rain+=(g.rain-W.rain)*Math.min(1,dt*1.5);W.fog+=(g.fog-W.fog)*Math.min(1,dt*.8);
  W.wet=Math.min(1,Math.max(0,W.wet+dt*(W.rain>.15?.12*W.rain:-.02)));W.wind+=(g.wind-W.wind)*Math.min(1,dt*.4);
  W.ash=(W.ash||0)+(g.ash-(W.ash||0))*Math.min(1,dt*.6);W.snow=(W.snow||0)+(g.snow-(W.snow||0))*Math.min(1,dt*.6);return W;};
 A.flashAt=e=>e<80?1:e<150?.25:e<230?.8:e<600?.8*(1-(e-230)/370):0;
 A.weatherState=(mode,modes)=>({mode:mode||'auto',rain:0,fog:0,wet:0,flash:0,wind:1,ash:0,snow:0,MODES:modes||A.MODES});
 // o.reduceMotion (the host reads the viewer's setting): never flash
 A.weather=o=>{o=o||{};const T=A.T,W=A.W=A.weatherState(o.mode,(o.ash||o.snow)?A.MODES.concat(o.ash?A.ASH_MODES:[],o.snow?A.SNOW_MODES:[]):A.MODES);
  // rain: streaks in a box (240 m) that travels with the camera
  const P=A.PRESETS.rain,F=A.glf,B=P.box/2,N=o.drops||P.drops,pos=new Float32Array(N*6),end=new Float32Array(N*2);for(let i=0;i<N;i++){const x=A.rr(-B,B),y=A.rr(-B,B),z=A.rr(-B,B);pos.set([x,y,z,x,y,z],i*6);end[i*2+1]=1;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('tip',new T.BufferAttribute(end,1));
  const rm=new T.ShaderMaterial({uniforms:{time:A.U.time,wind:A.U.wind,windOff:A.U.windOff,light:A.U.light,rain:A.U.rain},transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 wind;uniform vec2 windOff;uniform float rain;attribute float tip;varying float vA;
    void main(){vec3 p=position;p.y=mod(p.y-time*${F(P.fall)},${F(P.box)})-${F(B)}+cameraPosition.y;p.xz=mod(p.xz-cameraPosition.xz+${F(B)}+windOff*${F(P.windRide)},${F(P.box)})-${F(B)}+cameraPosition.xz;
     p+=normalize(vec3(wind.x*${F(P.slant)},-1.0,wind.y*${F(P.slant)}))*tip*${F(P.streak)};vec4 mv=viewMatrix*vec4(p,1.0);vA=rain*(1.0-smoothstep(${F(P.fade[0])},${F(P.fade[1])},length(mv.xyz)))*(0.35+0.65*tip);gl_Position=projectionMatrix*mv;}`,
   fragmentShader:`uniform float light;varying float vA;void main(){gl_FragColor=vec4(vec3(${P.color.map(F).join(',')})*(0.35+0.65*light),vA*${F(P.alpha)});}`});
  const rain=new T.LineSegments(g,rm);rain.frustumCulled=false;rain.renderOrder=4;rain.name='atmos:rain';A.add(rain);A.noRay(rain);
  // lightning: a jagged ribbon far off, a double flash
  const K=14,bp=new Float32Array((K+1)*6),idx=[];for(let k=0;k<K;k++){const q=k*2;idx.push(q,q+1,q+2,q+1,q+3,q+2);}
  const bg=new T.BufferGeometry();bg.setAttribute('position',new T.BufferAttribute(bp,3));bg.setIndex(idx);
  const bm=new T.MeshBasicMaterial({color:0xe8ecff,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,side:T.DoubleSide});
  const bolt=new T.Mesh(bg,bm);bolt.frustumCulled=false;bolt.visible=false;A.add(bolt);A.noRay(bolt);
  const reduce=!!o.reduceMotion;let next=A.clock.t*1000+6000,t0=-1e9;
  const strike=()=>{const cam=A.h.camera.position,a=A.rnd()*Math.PI*2,dist=700+A.rnd()*500,cx=cam.x+Math.cos(a)*dist,cz=cam.z+Math.sin(a)*dist,top=380+A.rnd()*120,base=A.ground(cx,cz);
   const sx=-Math.sin(a),sz=Math.cos(a);let x=cx,z=cz;for(let k=0;k<=K;k++){const y=top+(base-top)*k/K;if(k){x+=(A.rnd()-.5)*40;z+=(A.rnd()-.5)*40;}const w=3.2-2.4*k/K;bp.set([x-sx*w,y,z-sz*w,x+sx*w,y,z+sz*w],k*6);}
   bg.attributes.position.needsUpdate=true;bg.computeBoundingSphere();t0=A.clock.t*1000;next=t0+5000+A.rnd()*9000;};
  A.hook((t,h,dt)=>{const now=t*1000;A.weatherStep(W,h,dt);
   if(((W.mode==='storm'&&W.rain>.6)||(W.mode==='ash'&&W.ash>.6))&&!reduce&&now>next){strike();bm.color.setHex(W.mode==='ash'?((A.PRESETS.ash||{}).bolt||0xffc8a0):0xe8ecff);}W.flash=A.flashAt(now-t0);A.windScale=W.wind;A.U.gustAmp.value=.55+.25*Math.min(1,W.wind-1);
   A.U.rain.value=W.rain;A.U.fog.value=W.fog;A.U.flash.value=W.flash;if(A.U.ash)A.U.ash.value=W.ash||0;if(A.U.snow)A.U.snow.value=W.snow||0;rain.visible=W.rain>.01;bolt.visible=W.flash>.01;bm.opacity=Math.min(1,W.flash*1.5);
   if(o.apply)o.apply(W);});
  A.rec('weather',{preset:'rain',modes:W.MODES,mode:W.mode,drops:N,auto:{rain:[19.5,19.9,21.6,22],fog:[.7,4.3,5.5,8.4,9.6]},storm:{fog:.3,strikeEvery:[5,14],strikeDist:[700,1200]},
   note:'auto: rain ramps up over the first pair of hours and down over the second; fog = scale * ramps. W.rain/fog/wet/flash/wind are the state a host reads'});
  if(o.ash&&A.ashWeather)A.ashWeather();
  if(o.snow&&A.snowWeather)A.snowWeather();
  if(o.ui&&A.weatherUI)A.weatherUI(o.ui);A.strike=strike;return W;};
 // THE FLAKES' drawing (the ash's, o.ash, and the snow's, o.snow; key 'ash' or 'snow', each its own preset and uniform):
 // the flecks, a box of tumbling specks riding the camera, slow to fall and driven downwind by the module's wind (which the
 // storm raises); the streaks; the veils, big soft sprites skimming the ground under the camera (the host's ground),
 // racing downwind faster still, only in the storm. All read A.U[key] (amt in the shaders); nothing costs anything at 0
 A.flakeWeather=key=>{const T=A.T,P=A.PRESETS[key],F=A.glf,B=P.box/2,N=P.flecks,pos=[],pp=[],U=A.U[key];
  for(let i=0;i<N;i++){pos.push(A.rr(-B,B),A.rr(-B,B),A.rr(-B,B));pp.push(A.rnd(),A.rnd(),A.rr(P.size[0],P.size[1]),A.rr(.5,2));}
  const fm=new T.ShaderMaterial({uniforms:{time:A.U.time,windOff:A.U.windOff,px:A.U.px,light:A.U.light,amt:U},transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 windOff;uniform float light;uniform float amt;attribute vec4 pp;varying float vA;
    ${A.GLSL_QUAD}
    void main(){vec3 p=ipos;p.y=mod(p.y-time*${F(P.fall)}*(0.6+0.8*pp.x)+sin(time*0.9+pp.y*9.0)*0.6,${F(P.box)})-${F(B)}+cameraPosition.y;
     vec2 d=windOff*${F(P.windRide)}*(0.7+0.6*pp.y)+vec2(sin(time*1.3+pp.x*11.0),cos(time*1.1+pp.y*7.0))*0.9;
     p.xz=mod(p.xz-cameraPosition.xz+${F(B)}+d,${F(P.box)})-${F(B)}+cameraPosition.xz;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,0.3);
     float tumble=0.45+0.55*abs(sin(time*pp.w*3.0+pp.x*20.0));float ps=clamp(pp.z*tumble*px/dd,1.5,9.0);
     vA=step(fract(pp.x*7.31),amt)*(1.0-smoothstep(${F(P.fade[0])},${F(P.fade[1])},dd))*${F(P.alpha)};gl_Position=atmQuad(mv,ps);}`,
   fragmentShader:`uniform float light;varying float vA;varying vec2 vUv;void main(){float r=length(vUv-0.5);if(r>0.5||vA<0.004)discard;gl_FragColor=vec4(vec3(${P.color.map(F).join(',')})*(0.3+0.7*light),vA*smoothstep(0.5,0.38,r));}`});
  A.sprites(key+'flecks',{ipos:[3,pos],pp:[4,pp]},fm,4);
  // the streaks: short lines of ash driven nearly flat along the gale (the storm's sense of speed), riding the camera
  {const SB=P.streakBox/2,NS=P.streaks,sp=new Float32Array(NS*6),tip=new Float32Array(NS*2),sd=new Float32Array(NS*2);
   for(let i=0;i<NS;i++){const x=A.rr(-SB,SB),y=A.rr(-SB*.4,SB*.6),z=A.rr(-SB,SB),r=A.rnd();sp.set([x,y,z,x,y,z],i*6);tip[i*2+1]=1;sd[i*2]=r;sd[i*2+1]=r;}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(sp,3));g.setAttribute('tip',new T.BufferAttribute(tip,1));g.setAttribute('seed',new T.BufferAttribute(sd,1));
   const lm=new T.ShaderMaterial({uniforms:{time:A.U.time,wind:A.U.wind,windOff:A.U.windOff,light:A.U.light,amt:U},transparent:true,depthWrite:false,fog:false,
    vertexShader:`uniform float time;uniform vec2 wind;uniform vec2 windOff;uniform float amt;attribute float tip;attribute float seed;varying float vA;
     void main(){vec3 p=position;p.y=mod(p.y-time*${F(P.fall)}*1.5,${F(P.streakBox)})-${F(SB)}*0.4+cameraPosition.y-2.0;
      p.xz=mod(p.xz-cameraPosition.xz+${F(SB)}+windOff*${F(P.streakRide)}*(0.8+0.4*seed),${F(P.streakBox)})-${F(SB)}+cameraPosition.xz;
      vec3 d=normalize(vec3(wind.x,-0.08,wind.y)+vec3(0.0001));p-=d*tip*mix(${F(P.streakLen[0])},${F(P.streakLen[1])},seed);vec4 mv=viewMatrix*vec4(p,1.0);
      vA=step(fract(seed*5.13),amt*amt)*(1.0-smoothstep(15.0,${F(SB)},length(mv.xyz)))*(0.3+0.7*(1.0-tip));gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform float light;varying float vA;void main(){if(vA<0.004)discard;gl_FragColor=vec4(vec3(${P.streakColor.map(F).join(',')})*(0.3+0.7*light),vA*${F(P.streakAlpha)});}`});
   const ls=new T.LineSegments(g,lm);ls.frustumCulled=false;ls.renderOrder=4;ls.name='atmos:'+key+'streaks';A.add(ls);A.noRay(ls);A.stats[key+'streaks']=NS;}
  const VB=P.veilBox/2,vpos=[],vpp=[];for(let i=0;i<P.veils;i++){vpos.push(A.rr(-VB,VB),0,A.rr(-VB,VB));vpp.push(A.rnd(),A.rr(P.veilY[0],P.veilY[1]),A.rr(P.veilSize[0],P.veilSize[1]),A.rnd());}
  const ground={value:0};A.hook(()=>{const c=A.h.camera.position;ground.value=A.h.ground?A.h.ground(c.x,c.z):0;});
  const vm=new T.ShaderMaterial({uniforms:{time:A.U.time,windOff:A.U.windOff,px:A.U.px,light:A.U.light,amt:U,ground},transparent:true,depthWrite:false,fog:false,
   vertexShader:`uniform float time;uniform vec2 windOff;uniform float light;uniform float amt;uniform float ground;attribute vec4 pp;varying float vA;
    ${A.GLSL_QUAD}
    void main(){vec3 p=ipos;vec2 d=windOff*${F(P.veilRide)}*(0.8+0.4*pp.x);p.xz=mod(p.xz-cameraPosition.xz+${F(VB)}+d,${F(P.veilBox)})-${F(VB)}+cameraPosition.xz;
     p.y=ground+pp.y+sin(time*0.4+pp.w*6.0)*2.0;vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,1.0);float ps=clamp(pp.z*px/dd,2.0,900.0);
     vA=smoothstep(0.5,1.0,amt)*${F(P.veilAlpha)}*smoothstep(4.0,30.0,dd)*(0.6+0.4*sin(time*0.7+pp.w*9.0));gl_Position=atmQuad(mv,ps);}`,
   fragmentShader:`uniform float light;varying float vA;varying vec2 vUv;void main(){float r=length(vUv-0.5);if(r>0.5||vA<0.003)discard;gl_FragColor=vec4(vec3(${P.veilColor.map(F).join(',')})*(0.35+0.65*light),vA*smoothstep(0.5,0.0,r));}`});
  A.sprites(key+'veils',{ipos:[3,vpos],pp:[4,vpp]},vm,4);
  A.rec(key,key==='ash'?{preset:'ash',modes:A.ASH_MODES,flecks:N,streaks:P.streaks,veils:P.veils,note:'W.ash 0..1 (ashfall '+P.ashfall+', the storm 1); flecks ride the camera and the wind; veils skim the ground under the camera in the storm (ash>0.5); the storm lightning is warm'}:{preset:key,modes:A.SNOW_MODES,flecks:N,streaks:P.streaks,veils:P.veils,note:'W.snow 0..1 (snowfall '+P.snowfall+', the blizzard 1); flakes ride the camera and the wind; streaks of blown snow and spindrift skimming the ground in the blizzard (snow>0.5); no lightning'});};   // the selector itself is host code: 89-atmos-9-host.js
 A.ashWeather=()=>A.flakeWeather('ash');A.snowWeather=()=>A.flakeWeather('snow');
})();
